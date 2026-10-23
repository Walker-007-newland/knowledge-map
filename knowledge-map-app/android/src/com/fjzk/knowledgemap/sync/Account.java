package com.fjzk.knowledgemap.sync;

import java.security.KeyPair;
import java.security.PrivateKey;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import static com.fjzk.knowledgemap.sync.SyncCrypto.*;

/**
 * 账号（#12 第一期；协议见 sync-node/PROTOCOL.md 第 7 节）。纯 Java，电脑上 SyncHarness 直接测。
 * 「账号 = 同步组的钥匙」：组密钥 gk 装在账号包 bundle 里，用密码派生的 wrapKey 包一份（wrap_pw）、用管理员的恢复公钥包一份（wrap_admin）存在节点；
 * 新设备输账号密码 → 取回 gk → 装成 #1 的同步组，之后同步、合并都照旧。
 *
 * 本机 files/kmsync/account.json：{v, user, gid, state, since, tok（devToken 用 Keystore 包起来）, pwVer, h, p, grace, last}
 *   state：in = 已登录（离线也能进 App）；relogin = 管理员重设密码 / 移除设备，要重新输密码；disabled = 账号停用；out = 自己退出了
 *   不存密码，也不存 mk、authKey、wrapKey（算完就清零）。
 */
public final class Account {
    static final byte[] SALT = utf8("km-acct-v1");
    public static final int ITERS = 200000;
    public static final String FILE = "account.json";
    /** 升级的老设备连不上服务器时可以先离线学习：最多 7 天（管理员 2026-10-22 同意） */
    public static final long GRACE_MS = 7 * 86400000L;

    public String user = "", gid = "", state = "", h = "";
    public long since, pwVer, p, grace;
    /** devToken 用 KeyWrap 包起来的密文（b64）；null = 没有 */
    String tok;
    /** 上一个登录过的用户名（换账号警告用） */
    public String last = "";

    public boolean in() { return "in".equals(state); }

    // ================================================================ 本机文件

    public static Account load(SyncStore st) {
        Map<String, Object> m = st.json(FILE);
        if (m == null) return null;
        Account a = new Account();
        a.user = nz(SyncJson.s(m, "user"));
        a.gid = nz(SyncJson.s(m, "gid"));
        a.state = nz(SyncJson.s(m, "state"));
        a.since = SyncJson.n(m, "since", 0);
        a.pwVer = SyncJson.n(m, "pwVer", 0);
        a.h = nz(SyncJson.s(m, "h"));
        a.p = SyncJson.n(m, "p", 0);
        a.grace = SyncJson.n(m, "grace", 0);
        a.tok = SyncJson.s(m, "tok");
        a.last = nz(SyncJson.s(m, "last"));
        return a;
    }

    public void save(SyncStore st) {
        st.putJson(FILE, SyncJson.of("v", 1L, "user", user, "gid", gid, "state", state, "since", since, "pwVer", pwVer,
            "h", h, "p", p, "grace", grace, "tok", tok, "last", last));
    }

    static String nz(String s) { return s == null ? "" : s; }

    /** 解开本机保存的通行证；钥匙丢了 / 没有返回 null */
    public byte[] devToken(SyncStore st) {
        if (tok == null || tok.isEmpty()) return null;
        try {
            byte[] t = st.open(b64d(tok));
            return t != null && t.length == 32 ? t : null;
        } catch (RuntimeException e) { return null; }
    }

    public void setDevToken(SyncStore st, byte[] t) { tok = t == null ? null : b64e(st.seal(t)); }

    // ================================================================ 派生（PROTOCOL.md 7.1）

    /** PBKDF2-HMAC-SHA256（RFC 8018）。Android 7（API 24/25）的 JCE 没有 PBKDF2WithHmacSHA256，自己写 */
    public static byte[] pbkdf2(byte[] pw, byte[] salt, int iters, int len) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            // 空口令：HMAC 的钥匙会补 0 到 64 字节，和一个 0 字节等价（JCE 不收空钥匙）
            mac.init(new SecretKeySpec(pw.length == 0 ? new byte[1] : pw, "HmacSHA256"));
            byte[] out = new byte[len];
            int blocks = (len + 31) / 32;
            for (int b = 1; b <= blocks; b++) {
                mac.update(salt);
                mac.update(new byte[]{(byte) (b >>> 24), (byte) (b >>> 16), (byte) (b >>> 8), (byte) b});
                byte[] u = mac.doFinal();
                byte[] t = u.clone();
                for (int i = 1; i < iters; i++) {
                    u = mac.doFinal(u);
                    for (int k = 0; k < t.length; k++) t[k] ^= u[k];
                }
                System.arraycopy(t, 0, out, (b - 1) * 32, Math.min(32, len - (b - 1) * 32));
                Arrays.fill(t, (byte) 0);
                Arrays.fill(u, (byte) 0);
            }
            return out;
        } catch (Exception e) { throw new IllegalStateException("PBKDF2：" + e.getMessage()); }
    }

    /** 密码 → {authKey, wrapKey}；mk 用完清零 */
    public static byte[][] keys(String pw, byte[] salt, int iters) {
        byte[] pwb = utf8(pw);
        byte[] mk = pbkdf2(pwb, salt, iters, 32);
        Arrays.fill(pwb, (byte) 0);
        try {
            return new byte[][]{ hkdf(mk, SALT, "km-acct-auth", 32), hkdf(mk, SALT, "km-acct-wrap", 32) };
        } finally { Arrays.fill(mk, (byte) 0); }
    }

    public static void wipe(byte[]... bs) { for (byte[] b : bs) if (b != null) Arrays.fill(b, (byte) 0); }

    /** 账号包 {v, user, gk, epoch, gkT, invite} */
    public static String bundle(String user, Group g) {
        String inv = g.node == null ? "" : nz(SyncJson.s(g.node, "inv"));
        return SyncJson.canon(SyncJson.of("v", 1L, "user", user, "gk", b64e(g.gk), "epoch", g.epoch, "gkT", g.gkT, "invite", inv));
    }

    public static byte[] wrapPw(byte[] wrapKey, String user, String bundle) { return seal(wrapKey, utf8(bundle), "km-acct-pw|" + user); }

    /** 解开 wrap_pw；密码不对 / 被篡改返回 null */
    public static Map<String, Object> openPw(byte[] wrapKey, String user, byte[] box) {
        byte[] p = open(wrapKey, box, "km-acct-pw|" + user);
        if (p == null) return null;
        try {
            Map<String, Object> m = SyncJson.obj(str(p));
            byte[] gk = b64d(SyncJson.s(m, "gk"));
            return gk.length == 32 && user.equals(SyncJson.s(m, "user")) ? m : null;
        } catch (RuntimeException e) { return null; }
    }

    /** wrap_admin：临时 P-256 密钥对 + 恢复公钥 ECDH → HKDF → AES-GCM。recPub = 恢复公钥 X.509 的 b64 */
    public static byte[] wrapAdmin(String recPub, String recKid, String user, String bundle) {
        KeyPair e = newKeyPair();
        byte[] shared = ecdh(e.getPrivate(), b64d(recPub));
        byte[] k = hkdf(shared, SALT, "km-acct-admin", 32);
        byte[] box = seal(k, utf8(bundle), "km-acct-admin|" + user);
        wipe(shared, k);
        return utf8(SyncJson.canon(SyncJson.of("v", 1L, "kid", recKid, "epk", b64e(e.getPublic().getEncoded()), "box", b64e(box))));
    }

    /** 审批 App 用：恢复私钥解开 wrap_admin（这里也放一份，测试互通用） */
    public static Map<String, Object> openAdmin(PrivateKey rec, String user, byte[] wrapAdmin) {
        try {
            Map<String, Object> m = SyncJson.obj(str(wrapAdmin));
            byte[] shared = ecdh(rec, b64d(SyncJson.s(m, "epk")));
            byte[] k = hkdf(shared, SALT, "km-acct-admin", 32);
            byte[] p = open(k, b64d(SyncJson.s(m, "box")), "km-acct-admin|" + user);
            wipe(shared, k);
            return p == null ? null : SyncJson.obj(str(p));
        } catch (RuntimeException e) { return null; }
    }

    // ================================================================ 注册码（PROTOCOL.md 7.2）

    static final String CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

    /** XXXX-XXXX-XXXX 或 kmreg:1?c=… → 12 位规范形式；不合格返回 null */
    public static String normCode(String text) {
        if (text == null) return null;
        String t = text.trim();
        if (t.toLowerCase(Locale.ROOT).startsWith("kmreg:1?")) {
            Map<String, String> q = NodeClient.query(t.substring(8));
            t = q.get("c") == null ? "" : q.get("c");
        }
        t = t.replaceAll("[\\s-]", "").toUpperCase(Locale.ROOT).replace('I', '1').replace('L', '1').replace('O', '0');
        if (t.length() != 12) return null;
        for (char c : t.toCharArray()) if (CROCKFORD.indexOf(c) < 0) return null;
        return t;
    }

    public static String fmtCode(String c) { return c.substring(0, 4) + "-" + c.substring(4, 8) + "-" + c.substring(8); }

    /** 二维码里带的服务器地址（kmreg:1?c=…&h=…&p=…）；没有返回 null */
    public static String[] codeServer(String text) {
        if (text == null || !text.trim().toLowerCase(Locale.ROOT).startsWith("kmreg:1?")) return null;
        Map<String, String> q = NodeClient.query(text.trim().substring(8));
        String h = q.get("h"), p = q.get("p");
        if (h == null || p == null || !h.matches("[A-Za-z0-9.:-]{1,253}") || !p.matches("\\d{1,5}")) return null;
        return new String[]{h, p};
    }

    public static byte[] codeIk(String code) { return hmac(utf8(code.substring(4)), "km-invite"); }

    public static byte[] abox(byte[] ik, String user, String gid, byte[] authKey) {
        return seal(hkdf(ik, SALT, "km-acct-abox", 32), authKey, "km-acct-abox|" + user + "|" + gid);
    }

    // ================================================================ 登录、通行证（PROTOCOL.md 7.3、7.4）

    public static String proof(byte[] authKey, String user, String nonce, String dev) {
        return b64e(hmac(authKey, "km-login|" + user + "|" + nonce + "|" + dev));
    }

    public static byte[] openTok(byte[] authKey, String user, String dev, String box) {
        try {
            byte[] t = open(hkdf(authKey, SALT, "km-devtok", 32), b64d(box), "km-devtok|" + user + "|" + dev);
            return t != null && t.length == 32 ? t : null;
        } catch (RuntimeException e) { return null; }
    }

    /** X-KM-Dev = b64(HMAC(SHA256(devToken), 签名串)) */
    public static String devHeader(byte[] devToken, String signed) { return b64e(hmac(sha256(devToken), signed)); }

    // ================================================================ 规则（和 login.html 一样）

    public static String userProblem(String u) {
        if (u == null || !u.matches("[a-z0-9_]{3,20}")) return "用户名要 3–20 位小写字母、数字或下划线";
        return null;
    }

    static final String[] WEAK = {
        "password", "passw0rd", "iloveyou", "qwerty", "qwertyuiop", "asdfghjkl", "zxcvbnm", "admin", "administrator", "welcome",
        "letmein", "dragon", "monkey", "football", "baseball", "sunshine", "princess", "superman", "master", "shadow", "woaini",
        "aini", "woaiwojia", "abc", "abcd", "abcdef", "abcdefg", "qazwsx", "qweasd", "qweasdzxc", "changeme", "secret", "test",
        "guest", "login", "zhongkao", "fujian", "hello", "helloworld", "mima", "wodemima", "nihao", "baobao", "china", "xuexi",
        "shuxue", "yuwen", "yingyu", "kmsync", "zhishi", "tupu"
    };
    static final String[] SEQ = { "0123456789012345678901234567890", "9876543210987654321098765432109", "abcdefghijklmnopqrstuvwxyz",
        "qwertyuiopasdfghjklzxcvbnm", "1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0p", "1q2w3e4r5t6y7u8i9o0p" };

    /** 密码规则：8–64 位、同时有字母和数字、不能和用户名相同、不能太常见。返回中文原因或 null */
    public static String pwProblem(String user, String pw) {
        if (pw == null || pw.length() < 8) return "密码至少 8 位";
        if (pw.length() > 64) return "密码最多 64 位";
        if (!pw.matches(".*[A-Za-z].*") || !pw.matches(".*[0-9].*")) return "密码要同时有字母和数字";
        String low = pw.toLowerCase(Locale.ROOT);
        if (user != null && !user.isEmpty() && (low.equals(user) || low.contains(user))) return "密码里不能有用户名";
        String core = low.replaceAll("^[\\d\\W_]+|[\\d\\W_]+$", "");
        for (String w : WEAK) if (core.equals(w)) return "这个密码太常见了，换一个（可以用两个不相关的词加数字）";
        for (String s : SEQ) if (s.contains(low)) return "这个密码太常见了，换一个（可以用两个不相关的词加数字）";
        if (low.chars().distinct().count() <= 3) return "这个密码太简单了，换一个";
        for (int n = 1; n <= 4; n++) {
            if (low.length() % n != 0) continue;
            StringBuilder sb = new StringBuilder();
            while (sb.length() < low.length()) sb.append(low, 0, n);
            if (sb.toString().equals(low)) return "这个密码太简单了，换一个";
        }
        return null;
    }

    /** 临时测试：电脑上看 PBKDF2 和标准实现是否一致（SyncHarness 调） */
    static byte[] jcePbkdf2(byte[] pw, byte[] salt, int iters, int len) {
        try {
            javax.crypto.SecretKeyFactory f = javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            char[] c = new String(pw, java.nio.charset.StandardCharsets.UTF_8).toCharArray();
            return f.generateSecret(new javax.crypto.spec.PBEKeySpec(c, salt, iters, len * 8)).getEncoded();
        } catch (Exception e) { return null; }
    }
}
