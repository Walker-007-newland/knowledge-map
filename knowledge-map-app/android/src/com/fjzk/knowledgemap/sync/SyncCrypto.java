package com.fjzk.knowledgemap.sync;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * 同步用到的密码学和编码（#1 方案 v2 第三节）：P-256 ECDH、HKDF-SHA256、AES-256-GCM、HMAC-SHA256、gzip、base64url、base32。
 * 只用系统自带的 JCA（Android 7 起都有），不引入第三方库。纯 Java，电脑上能直接测。
 */
public final class SyncCrypto {
    private SyncCrypto() { }

    static final SecureRandom RNG = new SecureRandom();

    public static byte[] rand(int n) {
        byte[] b = new byte[n];
        RNG.nextBytes(b);
        return b;
    }

    public static byte[] utf8(String s) { return s.getBytes(StandardCharsets.UTF_8); }

    public static String str(byte[] b) { return new String(b, StandardCharsets.UTF_8); }

    public static byte[] cat(byte[]... parts) {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        for (byte[] p : parts) o.write(p, 0, p.length);
        return o.toByteArray();
    }

    public static byte[] sha256(byte[] b) {
        try { return MessageDigest.getInstance("SHA-256").digest(b); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }

    public static byte[] hmac(byte[] key, byte[] msg) {
        try {
            Mac m = Mac.getInstance("HmacSHA256");
            m.init(new SecretKeySpec(key, "HmacSHA256"));
            return m.doFinal(msg);
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    public static byte[] hmac(byte[] key, String msg) { return hmac(key, utf8(msg)); }

    /** HKDF-SHA256（RFC 5869） */
    public static byte[] hkdf(byte[] ikm, byte[] salt, String info, int len) {
        byte[] prk = hmac(salt == null || salt.length == 0 ? new byte[32] : salt, ikm);
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] t = new byte[0];
        byte[] inf = utf8(info);
        for (int i = 1; o.size() < len; i++) {
            t = hmac(prk, cat(t, inf, new byte[]{(byte) i}));
            o.write(t, 0, t.length);
        }
        byte[] r = o.toByteArray();
        byte[] out = new byte[len];
        System.arraycopy(r, 0, out, 0, len);
        return out;
    }

    /** AES-256-GCM：返回 iv(12) ‖ 密文+标签 */
    public static byte[] seal(byte[] key, byte[] plain, String aad) {
        try {
            byte[] iv = rand(12);
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
            c.updateAAD(utf8(aad));
            return cat(iv, c.doFinal(plain));
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    /** 解不开（钥匙不对、被篡改、附加数据不符）返回 null */
    public static byte[] open(byte[] key, byte[] box, String aad) {
        if (box == null || box.length < 12 + 16) return null;
        try {
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, box, 0, 12));
            c.updateAAD(utf8(aad));
            return c.doFinal(box, 12, box.length - 12);
        } catch (Exception e) { return null; }
    }

    // ------------------------------------------------------------ P-256

    public static KeyPair newKeyPair() {
        try {
            KeyPairGenerator g = KeyPairGenerator.getInstance("EC");
            g.initialize(new ECGenParameterSpec("secp256r1"), RNG);
            return g.generateKeyPair();
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    public static PublicKey publicKey(byte[] x509) {
        try { return KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(x509)); }
        catch (Exception e) { throw new IllegalArgumentException("公钥格式不对"); }
    }

    public static PrivateKey privateKey(byte[] pkcs8) {
        try { return KeyFactory.getInstance("EC").generatePrivate(new PKCS8EncodedKeySpec(pkcs8)); }
        catch (Exception e) { throw new IllegalArgumentException("私钥格式不对"); }
    }

    public static byte[] ecdh(PrivateKey mine, byte[] theirX509) {
        try {
            KeyAgreement ka = KeyAgreement.getInstance("ECDH");
            ka.init(mine);
            ka.doPhase(publicKey(theirX509), true);
            return ka.generateSecret();
        } catch (IllegalArgumentException e) { throw e; }
        catch (Exception e) { throw new IllegalArgumentException("ECDH 失败"); }
    }

    // ------------------------------------------------------------ gzip

    public static byte[] gzip(byte[] b) {
        try {
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            GZIPOutputStream z = new GZIPOutputStream(o);
            z.write(b);
            z.close();
            return o.toByteArray();
        } catch (IOException e) { throw new IllegalStateException(e); }
    }

    public static byte[] gunzip(byte[] b, int max) {
        try (GZIPInputStream z = new GZIPInputStream(new ByteArrayInputStream(b))) {
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n;
            while ((n = z.read(buf)) > 0) {
                o.write(buf, 0, n);
                if (o.size() > max) return null;
            }
            return o.toByteArray();
        } catch (IOException e) { return null; }
    }

    // ------------------------------------------------------------ 编码（Android 7 没有 java.util.Base64）

    private static final String B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

    /** base64url，不带 = 填充 */
    public static String b64e(byte[] b) {
        StringBuilder sb = new StringBuilder((b.length * 4 + 2) / 3);
        for (int i = 0; i < b.length; i += 3) {
            int n = (b[i] & 0xff) << 16 | (i + 1 < b.length ? (b[i + 1] & 0xff) << 8 : 0) | (i + 2 < b.length ? b[i + 2] & 0xff : 0);
            sb.append(B64.charAt(n >> 18 & 63)).append(B64.charAt(n >> 12 & 63));
            if (i + 1 < b.length) sb.append(B64.charAt(n >> 6 & 63));
            if (i + 2 < b.length) sb.append(B64.charAt(n & 63));
        }
        return sb.toString();
    }

    public static byte[] b64d(String s) {
        if (s == null) throw new IllegalArgumentException("base64");
        ByteArrayOutputStream o = new ByteArrayOutputStream(s.length() * 3 / 4);
        int buf = 0, bits = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '=') break;
            if (ch == '+') ch = '-';
            if (ch == '/') ch = '_';
            int v = B64.indexOf(ch);
            if (v < 0) throw new IllegalArgumentException("base64");
            buf = buf << 6 | v;
            bits += 6;
            if (bits >= 8) { bits -= 8; o.write(buf >> bits & 0xff); }
        }
        return o.toByteArray();
    }

    private static final String B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    /** base32 大写、无填充 */
    public static String b32e(byte[] b) {
        StringBuilder sb = new StringBuilder();
        int buf = 0, bits = 0;
        for (byte x : b) {
            buf = buf << 8 | (x & 0xff);
            bits += 8;
            while (bits >= 5) { bits -= 5; sb.append(B32.charAt(buf >> bits & 31)); }
        }
        if (bits > 0) sb.append(B32.charAt(buf << (5 - bits) & 31));
        return sb.toString();
    }

    /** 宽松解码：忽略大小写、空格和 -，0→O、1→I、8→B（手输时常见的混淆）；有非法字符返回 null */
    public static byte[] b32d(String s) {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        int buf = 0, bits = 0;
        for (char ch : s.toUpperCase(java.util.Locale.ROOT).toCharArray()) {
            if (ch == ' ' || ch == '-' || ch == '=' || ch == '·') continue;
            if (ch == '0') ch = 'O';
            if (ch == '1') ch = 'I';
            if (ch == '8') ch = 'B';
            int v = B32.indexOf(ch);
            if (v < 0) return null;
            buf = buf << 5 | v;
            bits += 5;
            if (bits >= 8) { bits -= 8; o.write(buf >> bits & 0xff); }
        }
        return o.toByteArray();
    }

    public static String hex(byte[] b) {
        StringBuilder sb = new StringBuilder(b.length * 2);
        for (byte x : b) sb.append(Character.forDigit(x >> 4 & 15, 16)).append(Character.forDigit(x & 15, 16));
        return sb.toString();
    }

    public static byte[] head(byte[] b, int n) {
        byte[] r = new byte[Math.min(n, b.length)];
        System.arraycopy(b, 0, r, 0, r.length);
        return r;
    }

    public static boolean same(byte[] a, byte[] b) { return a != null && b != null && MessageDigest.isEqual(a, b); }

    public static byte[] xor(byte[] a, byte[] b) {
        byte[] r = new byte[Math.min(a.length, b.length)];
        for (int i = 0; i < r.length; i++) r[i] = (byte) (a[i] ^ b[i]);
        return r;
    }
}
