package com.fjzk.knowledgemap.sync;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.fjzk.knowledgemap.sync.SyncCrypto.*;

/**
 * 同步节点客户端，按 knowledge-map-app/sync-node/PROTOCOL.md（km-sync 1.0.0）实现：
 * hello / create / successor / pull / push / forget / drop / mail（put/get/del）/ rdv。
 * 签名计数 ctr 先写盘再发请求（Ctr 接口由 SyncStore 实现）；收到 401 用 max(上次+1, 当前毫秒)+1 重试一次。
 */
public final class NodeClient {
    /** 节点返回的错误（HTTP 状态 + err 字段） */
    public static final class NodeError extends Exception {
        public final int status;
        public final String err;
        public NodeError(int status, String err) {
            super(status + " " + err);
            this.status = status;
            this.err = err == null ? "" : err;
        }
    }

    /** 每个组一个严格递增的计数；next 必须先落盘再返回 */
    public interface Ctr { long next(String gid, long atLeast); }

    /** 邀请码 kmnode:1?h=&p=&i=&s= */
    public static final class Invite {
        public final String host, id, text;
        public final int port;
        public final byte[] secret;
        Invite(String host, int port, String id, byte[] secret, String text) {
            this.host = host; this.port = port; this.id = id; this.secret = secret; this.text = text;
        }
    }

    /** 解析邀请码；格式错返回 null */
    public static Invite parseInvite(String text) {
        if (text == null) return null;
        text = text.trim();
        if (!text.startsWith("kmnode:1?")) return null;
        Map<String, String> q = query(text.substring("kmnode:1?".length()));
        String h = q.get("h"), p = q.get("p"), i = q.get("i"), s = q.get("s");
        if (h == null || p == null || i == null || s == null) return null;
        if (!h.matches("[A-Za-z0-9.:-]{1,253}") || !p.matches("\\d{1,5}") || !i.matches("[A-Za-z0-9]{4,32}")) return null;
        byte[] sec = b32d(s);
        if (sec == null || sec.length < 16) return null;
        int port = Integer.parseInt(p);
        if (port < 1 || port > 65535) return null;
        return new Invite(h, port, i, sec, text);
    }

    static Map<String, String> query(String q) {
        Map<String, String> m = new HashMap<>();
        for (String part : q.split("&")) {
            int e = part.indexOf('=');
            if (e > 0) m.put(part.substring(0, e), part.substring(e + 1));
        }
        return m;
    }

    public final String host;
    public final int port;
    final Ctr ctr;
    /** 测试用：记录每个请求（harness 统计「没加入组时没有请求」「增量同步时 push 是空的」） */
    public static volatile Listener tap;
    public interface Listener { void sent(String host, int port, String method, String path, Map<String, String> headers, byte[] body); }

    public NodeClient(String host, int port, Ctr ctr) {
        this.host = host;
        this.port = port;
        this.ctr = ctr;
    }

    // ------------------------------------------------------------ 不签名

    public Map<String, Object> hello() throws IOException, NodeError {
        return result(send("GET", "/v1/hello", null, null));
    }

    static Map<String, Object> wrap(byte[] ik, String gid, byte[] nodeKey) {
        byte[] n = rand(16);
        byte[] w = xor(nodeKey, hmac(ik, cat(utf8("km-wrap"), utf8(gid), n)));
        byte[] mac = hmac(ik, cat(utf8("km-create"), utf8(gid), n, w));
        return SyncJson.of("n", b64e(n), "w", b64e(w), "mac", b64e(mac));
    }

    /** 建组 / 重建；返回 {ok, rebuilt?, existed?, gen} */
    public Map<String, Object> create(Invite inv, String gid, byte[] nodeKey) throws IOException, NodeError {
        Map<String, Object> body = SyncJson.of("gid", gid, "inv", inv.id);
        body.putAll(wrap(hmac(inv.secret, "km-invite"), gid, nodeKey));
        return result(send("POST", "/v1/create", null, utf8(SyncJson.stringify(body))));
    }

    public Map<String, Object> rdvPut(String id, String side, byte[] data) throws IOException, NodeError {
        return result(send("POST", "/v1/rdv/" + id, null, utf8(SyncJson.stringify(SyncJson.of("op", "put", "side", side, "data", b64e(data))))));
    }

    /** 取对方那一边放的消息，按 n 排序 */
    public List<byte[]> rdvGet(String id, String side) throws IOException, NodeError {
        Map<String, Object> r = result(send("POST", "/v1/rdv/" + id, null, utf8(SyncJson.stringify(SyncJson.of("op", "get", "side", side)))));
        List<byte[]> out = new ArrayList<>();
        List<Object> items = SyncJson.l(r.get("items"));
        if (items != null) for (Object o : items) {
            String d = SyncJson.s(SyncJson.m(o), "data");
            if (d != null) out.add(b64d(d));
        }
        return out;
    }

    // ------------------------------------------------------------ 签名接口

    public Map<String, Object> call(String gid, byte[] nodeKey, String dev, String action, Map<String, Object> body) throws IOException, NodeError {
        String path = "/v1/g/" + gid + "/" + action;
        byte[] b = utf8(SyncJson.stringify(body));
        String hash = hex(sha256(b));
        MiniHttp.Resp r = null;
        for (int attempt = 0; attempt < 2; attempt++) {
            long c = ctr.next(gid, attempt == 0 ? 0 : System.currentTimeMillis() + 1);
            String msg = "POST\n" + path + "\n" + dev + "\n" + c + "\n" + hash;
            Map<String, String> h = new HashMap<>();
            h.put("X-KM-Auth", dev + "." + c + "." + b64e(hmac(nodeKey, msg)));
            r = send("POST", path, h, b);
            if (r.status != 401) break;
        }
        return result(r);
    }

    public Map<String, Object> successor(String oldGid, byte[] oldKey, String dev, String newGid, byte[] newKey) throws IOException, NodeError {
        Map<String, Object> body = SyncJson.of("gid", newGid);
        body.putAll(wrap(oldKey, newGid, newKey));
        return call(oldGid, oldKey, dev, "successor", body);
    }

    // ------------------------------------------------------------ 传输

    MiniHttp.Resp send(String method, String path, Map<String, String> headers, byte[] body) throws IOException {
        Listener t = tap;
        if (t != null) t.sent(host, port, method, path, headers, body);
        return MiniHttp.request(host, port, method, path, headers, body);
    }

    static Map<String, Object> result(MiniHttp.Resp r) throws NodeError {
        Map<String, Object> m;
        try { m = SyncJson.obj(r.text()); } catch (RuntimeException e) { m = null; }
        if (r.status != 200 || m == null) throw new NodeError(r.status, m == null ? "" : SyncJson.s(m, "err"));
        return m;
    }
}
