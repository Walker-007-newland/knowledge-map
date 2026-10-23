package com.fjzk.knowledgemap.sync;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;

/**
 * 极简 HTTP/1.1 客户端：直接用 Socket，不经过 HttpURLConnection，所以不受 Android 9+ 明文流量策略约束，
 * 也不用改 App 的全局明文设置（#1 方案 v2 第八节；写法同 sync-probe 的 MiniHttp 和审批 App 的 Node.java）。
 * 只支持 Content-Length，一次连接一个请求（Connection: close）。客户端连同步节点和局域网里的组员；服务端（第二期）只给局域网组员用。
 */
public final class MiniHttp {
    public static final int MAX_RESP = 16 << 20;
    public static int connectTimeout = 10000, readTimeout = 20000;

    private MiniHttp() { }

    public static final class Resp {
        public final int status;
        public final byte[] body;
        Resp(int status, byte[] body) { this.status = status; this.body = body; }
        public String text() { return new String(body, StandardCharsets.UTF_8); }
    }

    public static Resp request(String host, int port, String method, String path, Map<String, String> headers, byte[] body) throws IOException {
        return request(host, port, method, path, headers, body, connectTimeout, readTimeout);
    }

    public static Resp request(String host, int port, String method, String path, Map<String, String> headers, byte[] body,
                               int connectMs, int readMs) throws IOException {
        try (Socket s = new Socket()) {
            s.setTcpNoDelay(true);
            s.connect(new InetSocketAddress(host, port), connectMs);
            s.setSoTimeout(readMs);
            OutputStream os = s.getOutputStream();
            StringBuilder head = new StringBuilder();
            head.append(method).append(' ').append(path).append(" HTTP/1.1\r\nHost: ").append(host).append(':').append(port)
                .append("\r\nUser-Agent: km-sync\r\nConnection: close\r\n");
            if (headers != null) for (Map.Entry<String, String> e : headers.entrySet())
                head.append(e.getKey()).append(": ").append(e.getValue()).append("\r\n");
            if (body != null) head.append("Content-Type: application/json\r\nContent-Length: ").append(body.length).append("\r\n");
            head.append("\r\n");
            os.write(head.toString().getBytes(StandardCharsets.UTF_8));
            if (body != null) os.write(body);
            os.flush();
            InputStream in = s.getInputStream();
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n, split = -1, len = -1, status = 0;
            while ((n = in.read(buf)) > 0) {
                bo.write(buf, 0, n);
                if (bo.size() > MAX_RESP) throw new IOException("响应太大");
                if (split < 0) {
                    byte[] all = bo.toByteArray();
                    for (int i = 0; i + 3 < all.length; i++)
                        if (all[i] == '\r' && all[i + 1] == '\n' && all[i + 2] == '\r' && all[i + 3] == '\n') { split = i; break; }
                    if (split >= 0) {
                        String[] lines = new String(all, 0, split, StandardCharsets.ISO_8859_1).split("\r\n");
                        String[] first = lines[0].split(" ");
                        if (first.length < 2 || !first[0].startsWith("HTTP/")) throw new IOException("不是 HTTP 响应");
                        status = Integer.parseInt(first[1]);
                        for (int i = 1; i < lines.length; i++) {
                            int c = lines[i].indexOf(':');
                            if (c > 0 && lines[i].substring(0, c).trim().toLowerCase(Locale.ROOT).equals("content-length"))
                                len = Integer.parseInt(lines[i].substring(c + 1).trim());
                        }
                    }
                }
                if (split >= 0 && len >= 0 && bo.size() >= split + 4 + len) break;
            }
            if (split < 0) throw new IOException("响应不完整");
            byte[] all = bo.toByteArray();
            int start = split + 4, end = len >= 0 ? Math.min(all.length, start + len) : all.length;
            if (len >= 0 && all.length < start + len) throw new IOException("响应不完整");
            byte[] b = new byte[end - start];
            System.arraycopy(all, start, b, 0, b.length);
            return new Resp(status, b);
        }
    }

    // ================================================================ 服务端（#1 第二期：局域网同步，写法同 sync-probe 的 MiniHttp.Server）

    public static final int MAX_BODY = 8 << 20;
    static final int MAX_CONN = 8;

    /** 处理一个请求：remote = 对方 IP；返回 {状态码, 正文 JSON} */
    public interface Handler { Object[] handle(String remote, String method, String path, Map<String, String> headers, byte[] body); }

    /**
     * 极简 HTTP/1.1 服务端：只绑一个本机地址（局域网同步只监听 Wi-Fi 网卡），优先端口被占用就换随机端口；
     * 每个连接一个请求（Connection: close）、正文 ≤ 8MB、同时最多 8 个连接（多的直接关掉）、读超时 10 秒。
     */
    public static final class Server {
        final ServerSocket ss;
        final Handler h;
        volatile boolean running = true;
        final java.util.concurrent.Semaphore slots = new java.util.concurrent.Semaphore(MAX_CONN);

        public Server(String bindAddr, int preferredPort, Handler h) throws IOException {
            this.h = h;
            ServerSocket s = new ServerSocket();
            s.setReuseAddress(true);
            try {
                s.bind(new InetSocketAddress(bindAddr, preferredPort));
            } catch (IOException e) {
                s.close();
                s = new ServerSocket();
                s.bind(new InetSocketAddress(bindAddr, 0));
            }
            ss = s;
            Thread t = new Thread(this::loop, "kmsync-lan");
            t.setDaemon(true);
            t.start();
        }

        public int port() { return ss.getLocalPort(); }

        public String addr() { return ss.getInetAddress().getHostAddress(); }

        public void close() {
            running = false;
            try { ss.close(); } catch (IOException ignored) { }
        }

        public boolean closed() { return !running || ss.isClosed(); }

        void loop() {
            while (running) {
                final Socket c;
                try { c = ss.accept(); }
                catch (java.net.SocketException e) { return; }
                catch (IOException e) { continue; }
                if (!slots.tryAcquire()) { try { c.close(); } catch (IOException ignored) { } continue; }
                Thread w = new Thread(() -> { try { serve(c); } finally { slots.release(); } }, "kmsync-lan-conn");
                w.setDaemon(true);
                w.start();
            }
        }

        void serve(Socket c) {
            try (Socket s = c) {
                s.setSoTimeout(10000);
                InputStream in = new java.io.BufferedInputStream(s.getInputStream());
                String line = readLine(in);
                if (line == null) return;
                String[] p = line.split(" ");
                if (p.length < 3) { write(s.getOutputStream(), 400, "{\"err\":\"bad\"}"); return; }
                Map<String, String> hd = new java.util.LinkedHashMap<>();
                String l;
                int n = 0;
                while ((l = readLine(in)) != null && !l.isEmpty()) {
                    if (++n > 64) throw new IOException("头太多");
                    int i = l.indexOf(':');
                    if (i > 0) hd.put(l.substring(0, i).trim().toLowerCase(Locale.ROOT), l.substring(i + 1).trim());
                }
                byte[] body = new byte[0];
                String cl = hd.get("content-length");
                if (cl != null) {
                    int len = Integer.parseInt(cl.trim());
                    if (len < 0 || len > MAX_BODY) { write(s.getOutputStream(), 413, "{\"err\":\"size\"}"); return; }
                    body = new byte[len];
                    int off = 0;
                    while (off < len) {
                        int r = in.read(body, off, len - off);
                        if (r < 0) throw new IOException("正文不完整");
                        off += r;
                    }
                }
                String remote = s.getInetAddress() == null ? "?" : s.getInetAddress().getHostAddress();
                Object[] r;
                try { r = h.handle(remote, p[0], p[1], hd, body); }
                catch (RuntimeException e) { r = new Object[]{500, "{\"err\":\"server\"}"}; }
                write(s.getOutputStream(), (Integer) r[0], (String) r[1]);
            } catch (Exception ignored) { }
        }

        static String readLine(InputStream in) throws IOException {
            ByteArrayOutputStream b = new ByteArrayOutputStream(128);
            int c;
            while ((c = in.read()) != -1) {
                if (c == '\n') break;
                if (c != '\r') b.write(c);
                if (b.size() > 8192) throw new IOException("行太长");
            }
            if (c == -1 && b.size() == 0) return null;
            return new String(b.toByteArray(), StandardCharsets.ISO_8859_1);
        }

        static void write(OutputStream out, int status, String text) throws IOException {
            byte[] b = text.getBytes(StandardCharsets.UTF_8);
            String head = "HTTP/1.1 " + status + (status == 200 ? " OK" : " ERR") + "\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: "
                + b.length + "\r\nConnection: close\r\n\r\n";
            out.write(head.getBytes(StandardCharsets.ISO_8859_1));
            out.write(b);
            out.flush();
        }
    }
}
