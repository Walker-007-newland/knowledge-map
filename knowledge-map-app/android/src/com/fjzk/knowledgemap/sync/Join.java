package com.fjzk.knowledgemap.sync;

import java.util.Locale;
import java.util.Map;

import static com.fjzk.knowledgemap.sync.SyncCrypto.*;

/**
 * 加入码（#1 方案 v3 二-2）：A（已在组里）显示 kmjoin:1?h=&p=&s=，新设备 C 扫码，经节点转交点 /v1/rdv 交换公钥。
 *   s：16 字节一次性密钥；转交点 r = b64(HMAC(s,"km-rdv")) 前 22 位；kj = HKDF(s,"km-join")
 *   ① A→a 边：kj 加密的 {dev, name, pk}     ② C→b 边：kj 加密的 {dev, name, pk}
 *   确认码 = SHA256("km-join"‖s‖pkA‖pkC) 前 4 字节 mod 10000，两边都显示
 *   ③ A 确认后 →a 边：K = HKDF(ECDH(skA,pkC), 盐 = s, "km-join-key") 加密的组包；A 否认 → kj 加密的 {deny:true}
 * 节点只看到密文，拿不到 s。这里只放状态和密码学，网络由 SyncManager 发。
 */
final class Join {
    static final long TTL = 10 * 60 * 1000L;        // 等于转交点有效期
    static final long GUEST_HINT = 60 * 1000L;

    final boolean host;
    final byte[] s;
    final String rid;
    final byte[] kj;
    String phase;           // host: wait / confirm / done / closed / expired / bad ；guest: wait / done / denied / expired
    long started, exp;
    String nodeHost;
    int nodePort;
    // 对方
    String peerDev = "", peerName = "", peerPk = "";
    String code = "", msg = "";
    boolean hinted;

    Join(boolean host, byte[] s, String nodeHost, int nodePort, long now) {
        this.host = host;
        this.s = s;
        this.rid = b64e(hmac(s, "km-rdv")).substring(0, 22);
        this.kj = hkdf(s, null, "km-join", 32);
        this.nodeHost = nodeHost;
        this.nodePort = nodePort;
        this.started = now;
        this.exp = now + TTL;
        this.phase = "wait";
    }

    static Join newHost(String h, int p, long now) { return new Join(true, rand(16), h, p, now); }

    String text() { return "kmjoin:1?h=" + nodeHost + "&p=" + nodePort + "&s=" + b32e(s); }

    /** 给人看、手输用：43.142.41.27:8787 · ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ */
    String display() {
        String c = b32e(s);
        StringBuilder b = new StringBuilder();
        for (int i = 0; i < c.length(); i += 4) {
            if (b.length() > 0) b.append('-');
            b.append(c, i, Math.min(c.length(), i + 4));
        }
        return nodeHost + ":" + nodePort + " · " + b;
    }

    /** 解析扫到的加入码，或手输的「地址:端口 + 26 位码」；不对返回 null */
    static Join parseGuest(String text, long now) {
        if (text == null) return null;
        text = text.trim();
        String h, p, code;
        if (text.startsWith("kmjoin:1?")) {
            Map<String, String> q = NodeClient.query(text.substring("kmjoin:1?".length()));
            h = q.get("h");
            p = q.get("p");
            code = q.get("s");
        } else {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("^([A-Za-z0-9.-]+):(\\d{1,5})\\s*[·\\s]\\s*([A-Za-z0-9\\s-]+)$").matcher(text);
            if (!m.find()) return null;
            h = m.group(1);
            p = m.group(2);
            code = m.group(3);
        }
        if (h == null || p == null || code == null || !h.matches("[A-Za-z0-9.-]{1,253}") || !p.matches("\\d{1,5}")) return null;
        byte[] s = b32d(code);
        if (s == null || s.length != 16) return null;
        int port = Integer.parseInt(p);
        if (port < 1 || port > 65535) return null;
        return new Join(false, s, h, port, now);
    }

    static String confirmCode(byte[] s, String pkA, String pkC) {
        byte[] d = sha256(cat(utf8("km-join"), s, b64d(pkA), b64d(pkC)));
        long v = ((d[0] & 0xffL) << 24) | ((d[1] & 0xffL) << 16) | ((d[2] & 0xffL) << 8) | (d[3] & 0xffL);
        return String.format(Locale.ROOT, "%04d", v % 10000);
    }

    byte[] hello(String dev, String name, String pk, int n) {
        return seal(kj, utf8(SyncJson.canon(SyncJson.of("dev", dev, "name", name, "pk", pk))), "km-join|" + n + "|" + rid);
    }

    /** 解开 ① 或 ②；不对返回 null */
    Map<String, Object> openHello(byte[] box, int n) {
        byte[] p = open(kj, box, "km-join|" + n + "|" + rid);
        if (p == null) return null;
        try {
            Map<String, Object> m = SyncJson.obj(str(p));
            String dev = SyncJson.s(m, "dev"), pk = SyncJson.s(m, "pk");
            if (dev == null || !dev.matches("[A-Za-z0-9_-]{1,64}") || pk == null) return null;
            publicKey(b64d(pk));                       // 公钥格式不对会抛异常
            if (SyncJson.s(m, "name") == null) m.put("name", "");
            return m;
        } catch (RuntimeException e) { return null; }
    }

    byte[] groupBox(java.security.PrivateKey mine, String theirPk, String pkg) {
        return seal(Group.pairKey(mine, theirPk, s, "km-join-key"), utf8(pkg), "km-join|3|" + rid);
    }

    String openGroupBox(java.security.PrivateKey mine, String theirPk, byte[] box) {
        try {
            byte[] p = open(Group.pairKey(mine, theirPk, s, "km-join-key"), box, "km-join|3|" + rid);
            return p == null ? null : str(p);
        } catch (RuntimeException e) { return null; }
    }

    byte[] denyBox() { return seal(kj, utf8("{\"deny\":true}"), "km-join|deny|" + rid); }

    boolean isDeny(byte[] box) { return open(kj, box, "km-join|deny|" + rid) != null; }

    Map<String, Object> state(long now) {
        return SyncJson.of("role", host ? "host" : "guest", "phase", phase, "text", host ? text() : "", "display", host ? display() : "",
            "exp", exp, "left", Math.max(0, exp - now), "name", peerName, "code", code, "msg", msg);
    }
}
