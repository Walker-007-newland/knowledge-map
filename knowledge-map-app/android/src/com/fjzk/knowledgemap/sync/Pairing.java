package com.fjzk.knowledgemap.sync;

import java.security.PrivateKey;
import java.util.Locale;
import java.util.Map;

import static com.fjzk.knowledgemap.sync.SyncCrypto.*;

/**
 * 局域网配对（#1 方案 v2 第三节第 2 点，第二期）：4 位确认码，「先承诺再公开」的数字比对（和蓝牙数字比对同一个思路）。
 * A = 点「配对」的一方（客户端），B = 被点的一方（正处在「添加设备」的可被发现状态，服务端）：
 *   1. A → B：A 的设备号、名字、长期公钥 pkA
 *   2. B → A：pkB、名字、承诺值 cB = SHA256(pkB‖pkA‖nB)（nB 先不公开）
 *   3. A → B：nA          4. B → A：nB，A 验证 cB
 *   5. 两边各自算确认码 = SHA256("km-pair"‖pkA‖pkB‖nA‖nB) 前 4 字节 mod 10000，学生核对后点「数字一样，配对」
 *   6. 会话钥 K = HKDF(ECDH(长期私钥, 对方公钥), 盐 = nA‖nB)；互发确认 MAC（证明手里有私钥、学生点了确认），
 *      有组的一方把组包用 K 加密交给另一方；两台都没有组时由 A 新建
 * B 在看到 nA 之前就锁定了 nB，中间人没法事后挑随机数凑出一样的数字：每次冒充只有万分之一的机会，失败时两边数字对不上。
 * 这里只放状态和密码学；网络由 Lan 发、收。
 */
final class Pairing {
    static final long TTL = 2 * 60 * 1000L;        // 一次配对从开始到两边确认，最多 2 分钟

    final boolean client;          // true = A（发起方）
    final String sid;
    final long started;
    // 本机
    final String myDev, myName, myPk;
    // 对方
    String peerDev = "", peerName = "", peerPk = "";
    String peerHost = "";
    int peerPort;
    byte[] nA, nB, commit;
    String code = "";
    byte[] k;
    /** wait（等两边确认）/ done / denied / failed / expired */
    String phase = "start";
    boolean meOk, peerOk, finished;
    /** 发给对方 / 收到的组包（K 加密） */
    byte[] outPkg, inPkg;
    /** 本机是给组包的一方（有组，或两台都没组时的 A） */
    boolean giver;
    /** 两台都没组、A 新建的组（确认前不装上） */
    Group newGroup;
    String msg = "";

    Pairing(boolean client, String sid, String myDev, String myName, String myPk, long now) {
        this.client = client;
        this.sid = sid;
        this.myDev = myDev;
        this.myName = myName;
        this.myPk = myPk;
        this.started = now;
    }

    String pkA() { return client ? myPk : peerPk; }
    String pkB() { return client ? peerPk : myPk; }

    static byte[] commitment(String pkB, String pkA, byte[] nB) { return sha256(cat(b64d(pkB), b64d(pkA), nB)); }

    static String code(String pkA, String pkB, byte[] nA, byte[] nB) {
        byte[] d = sha256(cat(utf8("km-pair"), b64d(pkA), b64d(pkB), nA, nB));
        long v = ((d[0] & 0xffL) << 24) | ((d[1] & 0xffL) << 16) | ((d[2] & 0xffL) << 8) | (d[3] & 0xffL);
        return String.format(Locale.ROOT, "%04d", v % 10000);
    }

    /** 两边的随机数都有了：算确认码和会话钥 */
    void derive(PrivateKey sk) {
        code = code(pkA(), pkB(), nA, nB);
        k = hkdf(ecdh(sk, b64d(peerPk)), cat(nA, nB), "km-pair-key", 32);
    }

    /** A 的确认 MAC / B 的确认 MAC */
    byte[] mac(boolean ofA) { return hmac(k, "km-pair|" + (ofA ? "A" : "B") + "|" + sid); }

    boolean checkPeerMac(byte[] m) { return m != null && same(m, mac(!client)); }

    byte[] myMac() { return mac(client); }

    byte[] sealPkg(String pkgJson) { return seal(k, utf8(pkgJson), "km-pair|pkg|" + sid + "|" + (client ? "A" : "B")); }

    String openPkg(byte[] box) {
        byte[] p = open(k, box, "km-pair|pkg|" + sid + "|" + (client ? "B" : "A"));
        return p == null ? null : str(p);
    }

    boolean expired(long now) { return now - started > TTL; }

    Map<String, Object> state() {
        return SyncJson.of("role", client ? "client" : "server", "phase", phase, "name", peerName, "code", code, "msg", msg, "me", meOk, "peer", peerOk);
    }
}
