package com.fjzk.teamadmin;

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
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * 账号恢复密钥和重设密码（#12 第一期；协议见 knowledge-map-app/sync-node/PROTOCOL.md 第 7 节）。纯 Java，电脑上能测，
 * SyncHarness 用它和知识图谱 App 的 Account.java 做互通测试。
 *
 * 重设密码：accounts.get {wrap:true} 取 wrap_admin → 恢复私钥解开账号包（bundle 原文）→ 用新密码算新的 salt、authKey、wrap_pw
 * → accounts.resetPassword。节点全程拿不到组密钥，也拿不到新密码。
 */
public final class AcctCrypto {
    private AcctCrypto() { }

    static final byte[] SALT = "km-acct-v1".getBytes(StandardCharsets.UTF_8);
    public static final int ITERS = 200000;
    private static final SecureRandom RNG = new SecureRandom();

    /** 恢复密钥二维码 kmrecov:1?k=<私钥 PKCS#8 base64url>&id=<编号>。返回 {私钥字节, 编号}；格式不对抛中文说明 */
    public static Object[] parseRecovery(String text) {
        String t = text == null ? "" : text.trim();
        if (!t.startsWith("kmrecov:1?")) throw new IllegalArgumentException("这不是账号恢复密钥（应该以 kmrecov:1? 开头）");
        String k = null, id = null;
        for (String part : t.substring(10).split("&")) {
            int i = part.indexOf('=');
            if (i <= 0) continue;
            if (part.startsWith("k=")) k = part.substring(2);
            else if (part.startsWith("id=")) id = part.substring(3);
        }
        if (k == null || !k.matches("[A-Za-z0-9_-]{60,400}")) throw new IllegalArgumentException("恢复密钥里缺少私钥（k）或格式不对");
        byte[] priv = Node.b64d(k);
        PrivateKey pk = privateKey(priv);
        String kid = kidOf(priv, pk);
        if (id != null && !id.equals(kid)) throw new IllegalArgumentException("恢复密钥的编号对不上（二维码可能被改过）");
        return new Object[]{priv, kid};
    }

    static PrivateKey privateKey(byte[] pkcs8) {
        try { return KeyFactory.getInstance("EC").generatePrivate(new PKCS8EncodedKeySpec(pkcs8)); }
        catch (Exception e) { throw new IllegalArgumentException("恢复密钥的私钥格式不对"); }
    }

    /** 编号 = SHA-256(公钥 X.509) 前 4 字节 hex（和 make_recovery_key.py 一样）。公钥由私钥算出 */
    static String kidOf(byte[] pkcs8, PrivateKey pk) {
        try {
            java.security.interfaces.ECPrivateKey ek = (java.security.interfaces.ECPrivateKey) pk;
            java.security.spec.ECParameterSpec sp = ek.getParams();
            java.security.spec.ECPoint q = mul(ek.getS(), sp.getGenerator(), sp);
            byte[] x = fixed(q.getAffineX()), y = fixed(q.getAffineY());
            byte[] pub = cat(hex("3059301306072a8648ce3d020106082a8648ce3d030107034200"), new byte[]{4}, x, y);
            return hexOf(Arrays.copyOf(MessageDigest.getInstance("SHA-256").digest(pub), 4));
        } catch (Exception e) { throw new IllegalArgumentException("恢复密钥算不出公钥：" + e.getMessage()); }
    }

    /** 公钥（X.509）的编号 */
    public static String kidOfPublic(byte[] x509) {
        try { return hexOf(Arrays.copyOf(MessageDigest.getInstance("SHA-256").digest(x509), 4)); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }

    // P-256 标量乘（只在导入恢复密钥时算一次公钥，用来核对编号）
    private static java.security.spec.ECPoint mul(java.math.BigInteger k, java.security.spec.ECPoint g, java.security.spec.ECParameterSpec sp) {
        java.math.BigInteger p = ((java.security.spec.ECFieldFp) sp.getCurve().getField()).getP(), a = sp.getCurve().getA();
        java.security.spec.ECPoint r = java.security.spec.ECPoint.POINT_INFINITY;
        for (int i = k.bitLength() - 1; i >= 0; i--) {
            r = add(r, r, p, a);
            if (k.testBit(i)) r = add(r, g, p, a);
        }
        return r;
    }

    private static java.security.spec.ECPoint add(java.security.spec.ECPoint s, java.security.spec.ECPoint t, java.math.BigInteger p, java.math.BigInteger a) {
        if (s.equals(java.security.spec.ECPoint.POINT_INFINITY)) return t;
        if (t.equals(java.security.spec.ECPoint.POINT_INFINITY)) return s;
        java.math.BigInteger x1 = s.getAffineX(), y1 = s.getAffineY(), x2 = t.getAffineX(), y2 = t.getAffineY(), l;
        if (x1.equals(x2)) {
            if (!y1.equals(y2) || y1.signum() == 0) return java.security.spec.ECPoint.POINT_INFINITY;
            l = x1.pow(2).multiply(java.math.BigInteger.valueOf(3)).add(a).multiply(y1.shiftLeft(1).modInverse(p)).mod(p);
        } else {
            l = y2.subtract(y1).multiply(x2.subtract(x1).modInverse(p)).mod(p);
        }
        java.math.BigInteger x3 = l.pow(2).subtract(x1).subtract(x2).mod(p);
        return new java.security.spec.ECPoint(x3, l.multiply(x1.subtract(x3)).subtract(y1).mod(p));
    }

    private static byte[] fixed(java.math.BigInteger v) {
        byte[] b = v.toByteArray(), r = new byte[32];
        System.arraycopy(b, Math.max(0, b.length - 32), r, Math.max(0, 32 - b.length), Math.min(32, b.length));
        return r;
    }

    // ------------------------------------------------------------ 恢复包

    /** 解开 wrap_admin（b64url 的 JSON {v, kid, epk, box}）；返回账号包原文。钥匙不对 / 被篡改抛中文说明 */
    public static String openAdmin(byte[] recPriv, String recKid, String user, String wrapAdminB64) {
        String j = new String(Node.b64d(wrapAdminB64), StandardCharsets.UTF_8);
        String kid = str(j, "kid"), epk = str(j, "epk"), box = str(j, "box");
        if (epk == null || box == null) throw new IllegalArgumentException("恢复包格式不对");
        if (kid != null && recKid != null && !kid.equals(recKid))
            throw new IllegalArgumentException("这个账号的恢复包是用另一把恢复密钥（" + kid + "）加密的，本机导入的是 " + recKid);
        byte[] shared = ecdh(privateKey(recPriv), Node.b64d(epk));
        byte[] k = hkdf(shared, SALT, "km-acct-admin", 32);
        byte[] b = Node.b64d(box);
        try {
            byte[] p = gcm(Cipher.DECRYPT_MODE, k, Arrays.copyOf(b, 12), Arrays.copyOfRange(b, 12, b.length), "km-acct-admin|" + user);
            return new String(p, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalArgumentException("恢复包解不开（恢复密钥不对，或数据被改过）");
        } finally { Arrays.fill(shared, (byte) 0); Arrays.fill(k, (byte) 0); }
    }

    /** 测试用：和 App 的 Account.wrapAdmin 一样地加密（审批 App 本身用不到） */
    public static String sealAdmin(byte[] recPub, String recKid, String user, String bundle) {
        try {
            KeyPairGenerator g = KeyPairGenerator.getInstance("EC");
            g.initialize(new ECGenParameterSpec("secp256r1"), RNG);
            KeyPair e = g.generateKeyPair();
            byte[] shared = ecdhPub(e.getPrivate(), KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(recPub)));
            byte[] k = hkdf(shared, SALT, "km-acct-admin", 32);
            byte[] iv = rand(12);
            byte[] box = cat(iv, gcm(Cipher.ENCRYPT_MODE, k, iv, bundle.getBytes(StandardCharsets.UTF_8), "km-acct-admin|" + user));
            String json = "{\"box\":\"" + Node.b64e(box) + "\",\"epk\":\"" + Node.b64e(e.getPublic().getEncoded()) + "\",\"kid\":\"" + recKid + "\",\"v\":1}";
            return Node.b64e(json.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    /**
     * 新密码 → accounts.resetPassword 的参数 JSON：{user, salt, iters, auth_key, wrap_pw}（账号包原样用新的 wrapKey 包一次）。
     * 中间的 mk、authKey 之外的钥匙用完清零。
     */
    public static String resetArgs(String user, String newPw, String bundle, int iters) {
        byte[] salt = rand(16);
        byte[] pw = newPw.getBytes(StandardCharsets.UTF_8);
        byte[] mk = pbkdf2(pw, salt, iters, 32);
        byte[] auth = hkdf(mk, SALT, "km-acct-auth", 32), wrap = hkdf(mk, SALT, "km-acct-wrap", 32);
        try {
            byte[] iv = rand(12);
            byte[] wrapPw = cat(iv, gcm(Cipher.ENCRYPT_MODE, wrap, iv, bundle.getBytes(StandardCharsets.UTF_8), "km-acct-pw|" + user));
            return "{\"user\":" + Node.quote(user) + ",\"salt\":\"" + Node.b64e(salt) + "\",\"iters\":" + iters + ",\"auth_key\":\"" + Node.b64e(auth)
                + "\",\"wrap_pw\":\"" + Node.b64e(wrapPw) + "\"}";
        } catch (Exception e) { throw new IllegalStateException(e); }
        finally { Arrays.fill(pw, (byte) 0); Arrays.fill(mk, (byte) 0); Arrays.fill(wrap, (byte) 0); Arrays.fill(auth, (byte) 0); }
    }

    /** 临时密码：8 位小写字母 + 数字（去掉容易看错的 0 o 1 l i），保证有字母也有数字 */
    public static String tempPassword() {
        String a = "abcdefghjkmnpqrstuvwxyz", d = "23456789", all = a + d;
        while (true) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++) sb.append(all.charAt(RNG.nextInt(all.length())));
            String s = sb.toString();
            if (s.matches(".*[a-z].*") && s.matches(".*[0-9].*")) return s;
        }
    }

    /** 密码规则（和 App 的 Account.pwProblem 一样，简版）：8–64 位、有字母和数字、不含用户名 */
    public static String pwProblem(String user, String pw) {
        if (pw == null || pw.length() < 8) return "密码至少 8 位";
        if (pw.length() > 64) return "密码最多 64 位";
        if (!pw.matches(".*[A-Za-z].*") || !pw.matches(".*[0-9].*")) return "密码要同时有字母和数字";
        if (user != null && !user.isEmpty() && pw.toLowerCase().contains(user)) return "密码里不能有用户名";
        return null;
    }

    // ------------------------------------------------------------ 基础

    static byte[] pbkdf2(byte[] pw, byte[] salt, int iters, int len) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(pw.length == 0 ? new byte[1] : pw, "HmacSHA256"));
            byte[] out = new byte[len];
            for (int b = 1; b <= (len + 31) / 32; b++) {
                mac.update(salt);
                mac.update(new byte[]{(byte) (b >>> 24), (byte) (b >>> 16), (byte) (b >>> 8), (byte) b});
                byte[] u = mac.doFinal(), t = u.clone();
                for (int i = 1; i < iters; i++) { u = mac.doFinal(u); for (int k = 0; k < t.length; k++) t[k] ^= u[k]; }
                System.arraycopy(t, 0, out, (b - 1) * 32, Math.min(32, len - (b - 1) * 32));
            }
            return out;
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    static byte[] hkdf(byte[] ikm, byte[] salt, String info, int len) {
        try {
            byte[] prk = Node.hmac(salt == null || salt.length == 0 ? new byte[32] : salt, ikm);
            byte[] out = new byte[0], t = new byte[0];
            for (int i = 1; out.length < len; i++) {
                t = Node.hmac(prk, cat(t, info.getBytes(StandardCharsets.UTF_8), new byte[]{(byte) i}));
                out = cat(out, t);
            }
            return Arrays.copyOf(out, len);
        } catch (Exception e) { throw new IllegalStateException(e); }
    }

    static byte[] ecdh(PrivateKey mine, byte[] theirX509) {
        try { return ecdhPub(mine, KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(theirX509))); }
        catch (IllegalArgumentException e) { throw e; }
        catch (Exception e) { throw new IllegalArgumentException("恢复包里的临时公钥不对"); }
    }

    static byte[] ecdhPub(PrivateKey mine, PublicKey theirs) {
        try {
            KeyAgreement ka = KeyAgreement.getInstance("ECDH");
            ka.init(mine);
            ka.doPhase(theirs, true);
            return ka.generateSecret();
        } catch (Exception e) { throw new IllegalArgumentException("ECDH 失败"); }
    }

    static byte[] gcm(int mode, byte[] key, byte[] iv, byte[] data, String aad) throws Exception {
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(mode, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
        c.updateAAD(aad.getBytes(StandardCharsets.UTF_8));
        return c.doFinal(data);
    }

    static byte[] rand(int n) { byte[] b = new byte[n]; RNG.nextBytes(b); return b; }

    static byte[] cat(byte[]... ps) {
        int n = 0;
        for (byte[] p : ps) n += p.length;
        byte[] r = new byte[n];
        int o = 0;
        for (byte[] p : ps) { System.arraycopy(p, 0, r, o, p.length); o += p.length; }
        return r;
    }

    static byte[] hex(String s) {
        byte[] r = new byte[s.length() / 2];
        for (int i = 0; i < r.length; i++) r[i] = (byte) Integer.parseInt(s.substring(i * 2, i * 2 + 2), 16);
        return r;
    }

    static String hexOf(byte[] b) {
        StringBuilder sb = new StringBuilder();
        for (byte x : b) sb.append(String.format("%02x", x & 0xff));
        return sb.toString();
    }

    static String str(String json, String name) {
        Matcher m = Pattern.compile("\"" + name + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json == null ? "" : json);
        return m.find() ? m.group(1) : null;
    }
}
