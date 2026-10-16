package com.fjzk.syncprobe;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * 极简 HTTP/1.1（直接用 Socket，不经过 HttpURLConnection，因此不受 Android 9+ 的明文流量策略约束）。
 * 纯 Java，不依赖 Android，第一期正式同步内核可以沿用。只支持 Content-Length，一次连接一个请求。
 */
final class MiniHttp {
    static final int MAX_BODY = 8 << 20;

    private MiniHttp() { }

    // ---------- 公共：读一行、读头、读正文 ----------

    static String readLine(InputStream in) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream(128);
        int c;
        while ((c = in.read()) != -1) {
            if (c == '\n') break;
            if (c != '\r') b.write(c);
            if (b.size() > 16384) throw new IOException("header line too long");
        }
        if (c == -1 && b.size() == 0) return null;
        return new String(b.toByteArray(), StandardCharsets.ISO_8859_1);
    }

    static Map<String, String> readHeaders(InputStream in) throws IOException {
        Map<String, String> h = new LinkedHashMap<>();
        String line;
        int n = 0;
        while ((line = readLine(in)) != null && !line.isEmpty()) {
            if (++n > 100) throw new IOException("too many headers");
            int i = line.indexOf(':');
            if (i > 0) h.put(line.substring(0, i).trim().toLowerCase(Locale.ROOT), line.substring(i + 1).trim());
        }
        return h;
    }

    static byte[] readBody(InputStream in, Map<String, String> h, boolean toEofIfNoLength) throws IOException {
        String cl = h.get("content-length");
        if (cl == null) {
            if (!toEofIfNoLength) return new byte[0];
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int r;
            while ((r = in.read(buf)) != -1) {
                b.write(buf, 0, r);
                if (b.size() > MAX_BODY) throw new IOException("body too large");
            }
            return b.toByteArray();
        }
        int len = Integer.parseInt(cl.trim());
        if (len < 0 || len > MAX_BODY) throw new IOException("bad content-length " + len);
        byte[] body = new byte[len];
        int off = 0;
        while (off < len) {
            int r = in.read(body, off, len - off);
            if (r < 0) throw new IOException("connection closed after " + off + "/" + len + " bytes");
            off += r;
        }
        return body;
    }

    // ---------- 客户端 ----------

    static final class Response {
        int status;
        byte[] body = new byte[0];
        long connectMs, totalMs;
        String text() { return new String(body, StandardCharsets.UTF_8); }
    }

    static Response request(String host, int port, String method, String path, byte[] body,
                            int connectTimeoutMs, int readTimeoutMs) throws IOException {
        Response res = new Response();
        long t0 = System.nanoTime();
        try (Socket s = new Socket()) {
            s.setTcpNoDelay(true);
            s.connect(new InetSocketAddress(host, port), connectTimeoutMs);
            res.connectMs = (System.nanoTime() - t0) / 1_000_000;
            s.setSoTimeout(readTimeoutMs);
            OutputStream out = s.getOutputStream();
            byte[] b = body == null ? new byte[0] : body;
            String head = method + " " + path + " HTTP/1.1\r\n"
                    + "Host: " + host + ":" + port + "\r\n"
                    + "User-Agent: km-sync-probe\r\n"
                    + "Connection: close\r\n"
                    + "Content-Type: application/octet-stream\r\n"
                    + "Content-Length: " + b.length + "\r\n\r\n";
            out.write(head.getBytes(StandardCharsets.ISO_8859_1));
            out.write(b);
            out.flush();
            InputStream in = new java.io.BufferedInputStream(s.getInputStream());
            String status = readLine(in);
            if (status == null) throw new IOException("empty response");
            String[] p = status.split(" ", 3);
            if (p.length < 2 || !p[0].startsWith("HTTP/")) throw new IOException("bad status line: " + status);
            res.status = Integer.parseInt(p[1]);
            res.body = readBody(in, readHeaders(in), true);
        }
        res.totalMs = (System.nanoTime() - t0) / 1_000_000;
        return res;
    }

    // ---------- 服务端 ----------

    interface Handler {
        /** 返回 {状态码, 正文}；remote 是对方 IP。 */
        Object[] handle(String remote, String method, String path, byte[] body);
    }

    static final class Server {
        private final ServerSocket ss;
        private volatile boolean running = true;

        Server(int preferredPort, Handler h) throws IOException {
            ServerSocket s;
            try {
                s = new ServerSocket();
                s.setReuseAddress(true);
                s.bind(new InetSocketAddress(preferredPort));
            } catch (IOException e) {
                s = new ServerSocket();
                s.bind(new InetSocketAddress(0));   // 优先端口被占用：随机端口
            }
            ss = s;
            Thread t = new Thread(() -> loop(h), "probe-http");
            t.setDaemon(true);
            t.start();
        }

        int port() { return ss.getLocalPort(); }

        void close() {
            running = false;
            try { ss.close(); } catch (IOException ignored) { }
        }

        private void loop(Handler h) {
            while (running) {
                final Socket c;
                try { c = ss.accept(); } catch (SocketException e) { return; } catch (IOException e) { continue; }
                Thread w = new Thread(() -> serve(c, h), "probe-conn");
                w.setDaemon(true);
                w.start();
            }
        }

        private static void serve(Socket c, Handler h) {
            try (Socket s = c) {
                s.setSoTimeout(15000);
                InputStream in = new java.io.BufferedInputStream(s.getInputStream());
                String line = readLine(in);
                if (line == null) return;
                String[] p = line.split(" ");
                if (p.length < 3) { write(s.getOutputStream(), 400, "bad request"); return; }
                Map<String, String> hd = readHeaders(in);
                byte[] body = readBody(in, hd, false);
                String remote = s.getInetAddress() == null ? "?" : s.getInetAddress().getHostAddress();
                Object[] r = h.handle(remote, p[0], p[1], body);
                write(s.getOutputStream(), (Integer) r[0], (String) r[1]);
            } catch (Exception ignored) { }
        }

        private static void write(OutputStream out, int status, String text) throws IOException {
            byte[] b = text.getBytes(StandardCharsets.UTF_8);
            String head = "HTTP/1.1 " + status + (status == 200 ? " OK" : " ERR") + "\r\n"
                    + "Content-Type: application/json; charset=utf-8\r\n"
                    + "Content-Length: " + b.length + "\r\n"
                    + "Connection: close\r\n\r\n";
            out.write(head.getBytes(StandardCharsets.ISO_8859_1));
            out.write(b);
            out.flush();
        }
    }
}
