package com.fjzk.knowledgemap.sync;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;

/**
 * 极简 HTTP/1.1 客户端：直接用 Socket，不经过 HttpURLConnection，所以不受 Android 9+ 明文流量策略约束，
 * 也不用改 App 的全局明文设置（#1 方案 v2 第八节；写法同 sync-probe 的 MiniHttp 和审批 App 的 Node.java）。
 * 只支持 Content-Length，一次连接一个请求（Connection: close）。第一期只要客户端，局域网服务端在第二期。
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
        try (Socket s = new Socket()) {
            s.connect(new InetSocketAddress(host, port), connectTimeout);
            s.setSoTimeout(readTimeout);
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
}
