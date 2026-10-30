package com.fjzk.knowledgemap;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Locale;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * 电子教材：国家中小学智慧教育平台私有 CDN（r1/r2/r3-ndr-private）的请求头 X-ND-AUTH。
 * 学生在 App 里自己登录平台（TbLoginActivity），平台网页的登录 SDK 把凭据写在 localStorage 的
 * ND_UC_AUTH-{appId}&{项目}&token 里：{"value":"{\"access_token\":…,\"mac_key\":…,\"diff\":…}"}。
 * 官网每次请求现算签名（不是固定串）：
 *   nonce = (本机毫秒 + diff) + ":" + 8 位 [1-9A-Z]
 *   mac   = Base64(HMAC-SHA256(mac_key, nonce \n GET \n 解码后的 path[?query] \n host \n))
 *   X-ND-AUTH: MAC id="access_token",nonce="…",mac="…"
 * 没有 mac_key 时退回旧写法 nonce="0",mac="0"（部分资源会被拒）。
 * 纯 Java、不依赖 Android：电脑上用 android/test/TbAuthTest.java 测。凭据只在内存里传，这里不打印、不记日志。
 */
public final class TbAuth {
    private TbAuth() { }

    static final String NONCE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    static final SecureRandom RND = new SecureRandom();

    /** 只认平台私有 CDN 的地址（不用 oversea 海外地址，也不对别的域名签名） */
    public static boolean privateHost(String host) {
        return host != null && host.matches("r[0-9]+-ndr-private\\.ykt\\.cbern\\.com\\.cn");
    }

    public static String nonce(long nowMs, long diff) {
        StringBuilder sb = new StringBuilder();
        sb.append(nowMs + diff).append(':');
        for (int i = 0; i < 8; i++) sb.append(NONCE_CHARS.charAt(1 + RND.nextInt(35)));
        return sb.toString();
    }

    /** 签名原文：path 先解码（中文文件名），query 原样保留，host 不含端口，末尾有换行 */
    public static String signText(String url, String method, String nonce) {
        URI u = URI.create(encode(url));
        String path = u.getRawPath() == null ? "" : decode(u.getRawPath());
        String rel = path + (u.getRawQuery() != null ? "?" + u.getRawQuery() : "");
        String host = u.getHost() == null ? "" : u.getHost();
        return nonce + "\n" + method.toUpperCase(Locale.ROOT) + "\n" + rel + "\n" + host + "\n";
    }

    public static String header(String url, String method, String accessToken, String macKey, long diff, long nowMs) {
        String id = accessToken == null || accessToken.isEmpty() ? "0" : accessToken;
        if (macKey == null || macKey.isEmpty()) return "MAC id=\"" + id + "\",nonce=\"0\",mac=\"0\"";
        String n = nonce(nowMs, diff);
        return "MAC id=\"" + id + "\",nonce=\"" + n + "\",mac=\"" + mac(signText(url, method, n), macKey) + "\"";
    }

    public static String mac(String text, String key) {
        try {
            Mac m = Mac.getInstance("HmacSHA256");
            m.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return base64(m.doFinal(text.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("HmacSHA256");
        }
    }

    /** 目录里的地址含中文、空格等原字符：把 path 里非 ASCII 和不安全字符按 UTF-8 百分号编码；已编码的 %xx 保留 */
    public static String encode(String url) {
        StringBuilder sb = new StringBuilder();
        byte[] b = url.getBytes(StandardCharsets.UTF_8);
        for (byte x : b) {
            int c = x & 0xff;
            if (c > 0x20 && c < 0x7f && "\"<>\\^`{|}".indexOf(c) < 0) sb.append((char) c);
            else sb.append('%').append(Character.toUpperCase(Character.forDigit(c >> 4, 16))).append(Character.toUpperCase(Character.forDigit(c & 15, 16)));
        }
        return sb.toString();
    }

    static String decode(String s) {
        try { return URLDecoder.decode(s.replace("+", "%2B"), "UTF-8"); } catch (Exception e) { return s; }
    }

    static final char[] B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".toCharArray();

    /** 标准 Base64（带 = 补位）；minSdk 24 用不了 java.util.Base64，电脑测试又用不了 android.util.Base64，所以自己写 */
    public static String base64(byte[] d) {
        StringBuilder sb = new StringBuilder((d.length + 2) / 3 * 4);
        for (int i = 0; i < d.length; i += 3) {
            int n = (d[i] & 0xff) << 16 | (i + 1 < d.length ? (d[i + 1] & 0xff) << 8 : 0) | (i + 2 < d.length ? d[i + 2] & 0xff : 0);
            sb.append(B64[n >> 18 & 63]).append(B64[n >> 12 & 63]);
            sb.append(i + 1 < d.length ? B64[n >> 6 & 63] : '=');
            sb.append(i + 2 < d.length ? B64[n & 63] : '=');
        }
        return sb.toString();
    }

    /** 教材编号（UUID 形式）：用作文件名，防路径穿越 */
    public static boolean validId(String id) {
        return id != null && id.matches("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
    }
}
