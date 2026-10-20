package com.fjzk.teamadmin;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * 同步节点管理接口客户端（knowledge-map-app/sync-node/PROTOCOL.md「管理接口」）。
 * 纯 Java，不依赖 Android：电脑上能用 javac/java 跑 NodeTest。
 * 走自己写的 Socket HTTP/1.1，不经过 HttpURLConnection，所以不用为节点 IP 放开 App 的明文策略；
 * 整包 AES-256-GCM 加密，管理密钥从不上网。GitHub token 和这里没有任何关系。
 */
final class Node {
    /** 计数存储：Android 存在 SharedPreferences，测试里存在内存。 */
    interface CtrStore { long last(); void save(long v); }

    static final class Code {
        final String host; final int port; final byte[] key; final String kid;
        Code(String host, int port, byte[] key) { this.host = host; this.port = port; this.key = key; this.kid = kidOf(key); }
    }

    /** 结果：status 0 = 网络错误（text 是原因）；200 = text 是解开后的 JSON；403/429 等 = 被拒。 */
    static final class Result {
        final int status; final String text; final boolean retried;
        Result(int status, String text, boolean retried) { this.status = status; this.text = text; this.retried = retried; }
    }

    private static final SecureRandom RNG = new SecureRandom();
    private static final Object LOCK = new Object();   // 所有管理请求排队，计数严格递增、按顺序到达

    /** 解析管理码 kmadmin:1?h=<地址>&p=<端口>&k=<管理密钥 base64url>；格式不对抛出带中文说明的异常。 */
    static Code parse(String text) {
        String t = text == null ? "" : text.trim();
        if (!t.startsWith("kmadmin:1?")) throw new IllegalArgumentException("这不是管理码（应该以 kmadmin:1? 开头）");
        String host = null, port = null, k = null;
        for (String part : t.substring("kmadmin:1?".length()).split("&")) {
            int i = part.indexOf('=');
            if (i <= 0) continue;
            String name = part.substring(0, i), v = part.substring(i + 1);
            if (name.equals("h")) host = v; else if (name.equals("p")) port = v; else if (name.equals("k")) k = v;
        }
        if (host == null || !host.matches("[0-9A-Za-z.\\-]{1,253}")) throw new IllegalArgumentException("管理码里缺少节点地址（h）或格式不对");
        int p;
        try { p = Integer.parseInt(port == null ? "" : port); } catch (NumberFormatException e) { p = -1; }
        if (p < 1 || p > 65535) throw new IllegalArgumentException("管理码里的端口（p）不对");
        if (k == null || k.isEmpty()) throw new IllegalArgumentException("管理码里缺少管理密钥（k）");
        if (k.length() != 43 || !k.matches("[A-Za-z0-9_-]+")) throw new IllegalArgumentException("管理密钥（k）长度不对，应该是 43 个字符");
        return new Code(host, p, b64d(k));
    }

    static String kidOf(byte[] key) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-256").digest(key);
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 4; i++) sb.append(String.format("%02x", d[i] & 0xff));
            return sb.toString();
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    /** 调一个管理操作。argsJson 由网页给（JSON 对象文本）。ctr 被拒且节点给了加密提示时，自动用更大的 ctr 重试一次。 */
    static Result call(Code c, CtrStore store, String op, String argsJson) {
        synchronized (LOCK) {
            try {
                byte[] enc = hmac(c.key, "km-admin-enc-v1".getBytes(StandardCharsets.UTF_8));
                String plain = "{\"op\":" + quote(op) + ",\"args\":" + (argsJson == null || argsJson.trim().isEmpty() ? "{}" : argsJson) + "}";
                boolean retried = false;
                for (int attempt = 0; attempt < 2; attempt++) {
                    long ctr = Math.max(store.last() + 1, System.currentTimeMillis());
                    store.save(ctr);
                    byte[] iv = new byte[12];
                    RNG.nextBytes(iv);
                    byte[] ct = gcm(Cipher.ENCRYPT_MODE, enc, iv, plain.getBytes(StandardCharsets.UTF_8), "km-admin-req|" + c.kid + "|" + ctr);
                    String body = "{\"v\":1,\"kid\":\"" + c.kid + "\",\"ctr\":" + ctr + ",\"iv\":\"" + b64e(iv) + "\",\"ct\":\"" + b64e(ct) + "\"}";
                    String[] r = post(c.host, c.port, "/admin/v1", body);
                    int status = Integer.parseInt(r[0]);
                    if (status == 200) {
                        String riv = field(r[2], "iv"), rct = field(r[2], "ct");
                        if (riv == null || rct == null) return new Result(0, "节点响应格式不对", retried);
                        byte[] p = gcm(Cipher.DECRYPT_MODE, enc, b64d(riv), b64d(rct), "km-admin-resp|" + c.kid + "|" + ctr);
                        return new Result(200, new String(p, StandardCharsets.UTF_8), retried);
                    }
                    if (status == 403 && attempt == 0 && r[1] != null) {
                        // X-KM-Retry：只有持有管理密钥的人能解开，内容是节点记录的上次计数
                        try {
                            String[] h = r[1].split("\\.");
                            byte[] hint = gcm(Cipher.DECRYPT_MODE, enc, b64d(h[0]), b64d(h[1]), "km-admin-retry|" + c.kid + "|" + ctr);
                            Matcher m = Pattern.compile("\"last\":(\\d+)").matcher(new String(hint, StandardCharsets.UTF_8));
                            if (m.find()) { store.save(Math.max(store.last(), Long.parseLong(m.group(1)))); retried = true; continue; }
                        } catch (Exception ignored) { }
                    }
                    return new Result(status, r[2], retried);
                }
                return new Result(403, "{}", retried);
            } catch (java.net.SocketTimeoutException e) {
                return new Result(0, "超时（可能 8787 端口没开放，或服务器停了）", false);
            } catch (java.io.IOException e) {
                return new Result(0, "连不上：" + e.getMessage(), false);
            } catch (Exception e) {
                return new Result(0, "出错：" + e, false);
            }
        }
    }

    /** 新的 32 字节随机管理密钥。 */
    static byte[] newKey() {
        byte[] k = new byte[32];
        RNG.nextBytes(k);
        return k;
    }

    /**
     * 换管理密钥（节点 1.3.0 起）：用旧密钥 c 发 admin.rotateKey，把新密钥 newKey 装在加密的请求里送给节点。
     * 成功后旧密钥立即失效。调用方要先把 newKey 存好（网络中断时不知道节点换没换，靠它确认）。
     */
    static Result rotate(Code c, CtrStore store, byte[] newKey) {
        return call(c, store, "admin.rotateKey", "{\"key\":\"" + b64e(newKey) + "\"}");
    }

    static boolean ok(Result r) { return r != null && r.status == 200 && r.text != null && r.text.startsWith("{\"ok\":true"); }

    // ------------------------------------------------------------ 极简 HTTP/1.1（Content-Length，连接 10 秒、读取 20 秒超时）

    /** 返回 [状态码, X-KM-Retry 头（可能为 null）, 正文]。 */
    static String[] post(String host, int port, String path, String body) throws java.io.IOException {
        byte[] b = body.getBytes(StandardCharsets.UTF_8);
        try (Socket s = new Socket()) {
            s.connect(new InetSocketAddress(host, port), 10000);
            s.setSoTimeout(20000);
            OutputStream os = s.getOutputStream();
            String head = "POST " + path + " HTTP/1.1\r\nHost: " + host + ":" + port + "\r\nUser-Agent: km-team-admin\r\n"
                    + "Content-Type: application/json\r\nContent-Length: " + b.length + "\r\nConnection: close\r\n\r\n";
            os.write(head.getBytes(StandardCharsets.US_ASCII));
            os.write(b);
            os.flush();
            InputStream in = s.getInputStream();
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) {
                bo.write(buf, 0, n);
                if (bo.size() > 16 * 1024 * 1024) throw new java.io.IOException("响应太大");
            }
            byte[] all = bo.toByteArray();
            int split = -1;
            for (int i = 0; i + 3 < all.length; i++)
                if (all[i] == '\r' && all[i + 1] == '\n' && all[i + 2] == '\r' && all[i + 3] == '\n') { split = i; break; }
            if (split < 0) throw new java.io.IOException("响应不完整");
            String[] lines = new String(all, 0, split, StandardCharsets.ISO_8859_1).split("\r\n");
            String[] first = lines[0].split(" ");
            if (first.length < 2 || !first[0].startsWith("HTTP/")) throw new java.io.IOException("不是 HTTP 响应");
            String retry = null;
            int len = -1;
            for (int i = 1; i < lines.length; i++) {
                int c = lines[i].indexOf(':');
                if (c <= 0) continue;
                String k = lines[i].substring(0, c).trim().toLowerCase(), v = lines[i].substring(c + 1).trim();
                if (k.equals("x-km-retry")) retry = v;
                if (k.equals("content-length")) len = Integer.parseInt(v);
            }
            int start = split + 4, end = len >= 0 ? Math.min(all.length, start + len) : all.length;
            return new String[]{first[1], retry, new String(all, start, end - start, StandardCharsets.UTF_8)};
        }
    }

    // ------------------------------------------------------------ 加密、编码

    static byte[] hmac(byte[] key, byte[] msg) throws Exception {
        Mac m = Mac.getInstance("HmacSHA256");
        m.init(new SecretKeySpec(key, "HmacSHA256"));
        return m.doFinal(msg);
    }

    static byte[] gcm(int mode, byte[] key, byte[] iv, byte[] data, String aad) throws Exception {
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(mode, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
        c.updateAAD(aad.getBytes(StandardCharsets.UTF_8));
        return c.doFinal(data);
    }

    private static final String B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

    /** base64url，不带 = 填充（Android 7 没有 java.util.Base64）。 */
    static String b64e(byte[] b) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < b.length; i += 3) {
            int n = (b[i] & 0xff) << 16 | (i + 1 < b.length ? (b[i + 1] & 0xff) << 8 : 0) | (i + 2 < b.length ? b[i + 2] & 0xff : 0);
            sb.append(B64.charAt(n >> 18 & 63)).append(B64.charAt(n >> 12 & 63));
            if (i + 1 < b.length) sb.append(B64.charAt(n >> 6 & 63));
            if (i + 2 < b.length) sb.append(B64.charAt(n & 63));
        }
        return sb.toString();
    }

    static byte[] b64d(String s) {
        s = s.replace("=", "").replace('+', '-').replace('/', '_');
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        int buf = 0, bits = 0;
        for (int i = 0; i < s.length(); i++) {
            int v = B64.indexOf(s.charAt(i));
            if (v < 0) throw new IllegalArgumentException("base64");
            buf = buf << 6 | v;
            bits += 6;
            if (bits >= 8) { bits -= 8; o.write(buf >> bits & 0xff); }
        }
        return o.toByteArray();
    }

    static String field(String json, String name) {
        Matcher m = Pattern.compile("\"" + name + "\"\\s*:\\s*\"([A-Za-z0-9_-]*)\"").matcher(json == null ? "" : json);
        return m.find() ? m.group(1) : null;
    }

    static String quote(String s) {
        StringBuilder sb = new StringBuilder("\"");
        for (char ch : (s == null ? "" : s).toCharArray()) {
            if (ch == '"' || ch == '\\') sb.append('\\').append(ch);
            else if (ch < 0x20) sb.append(String.format("\\u%04x", (int) ch));
            else sb.append(ch);
        }
        return sb.append('"').toString();
    }

    private Node() { }
}
