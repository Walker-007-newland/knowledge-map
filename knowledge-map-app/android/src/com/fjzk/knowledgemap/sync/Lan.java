package com.fjzk.knowledgemap.sync;

import java.io.IOException;
import java.security.PrivateKey;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

import static com.fjzk.knowledgemap.sync.SyncCrypto.*;

/**
 * 局域网直连（#1 第二期，方案 v2 第三、四节）：同一个 Wi-Fi 下的组员直接互相同步，第一次用 4 位确认码配对。
 * 只是同步的第二条传输路：分区格式、加密（组密钥 AES-GCM，附加数据绑定组号、来源设备、分区编号、rev）、收件箱、
 * 合并都和经同步节点完全一样，所以两条路谁先到用谁、重复到也没关系（合并幂等、交换、结合）。
 *
 * 服务端（MiniHttp.Server，只绑 Wi-Fi 网卡地址，优先端口 47811）：
 *   POST /k1/hello                 不签名：{v, n 一次性随机数}
 *   POST /k1/pair/1、/2、/3        配对（只在「添加设备」的 3 分钟可被发现期间开放，见 Pairing）
 *   POST /k1/manifest、/get、/put、/key   组签名：请求头 X-KM-Lan: 设备号.随机数.钥匙指纹.HMAC(lanKey, POST‖路径‖设备号‖随机数‖指纹‖SHA256(正文))
 *     随机数只能用一次（60 秒内有效），所以原样重放一律 403；每个响应带下一个随机数 nn
 *     签不对 / 没签名 → 403 auth；钥匙不认识 → 403 key；对方已被移出 → 403 removed（附一份用它手里那把钥匙加密的组名单，它解开就知道自己被移出了）；
 *     对方拿的是旧钥匙（换钥时它不在）→ 409 epoch（附给它的钥匙包，用 ECDH(本机私钥, 它的公钥) 加密）
 * 客户端：一轮 = hello → manifest（对方各分区的编号、rev、内容编号 cid，和对方收件箱里已有本机的哪些分区）
 *   → get（对方有、本机没合并过的）→ put（本机有、对方没有的）。内容一样的分区不传，所以第一轮之后没有流量。
 *
 * 线程：服务端的连接线程只读组的快照（Group.snap）和本机文件，收到的分区解密校验后放进 spool，
 * 由同步线程（SyncManager.lanProcess）写进收件箱、合并组名单——不碰同步线程的锁，两台设备同时互相同步也不会卡住。
 */
public final class Lan {
    /** 平台相关的部分：Android 上是 NSD + Wi-Fi 网卡地址（SyncAndroid），电脑测试是假的 */
    public interface Env {
        /** 本机 Wi-Fi（或手机热点）网卡的 IPv4；没连 Wi-Fi 返回 null */
        String address();
        /** 广播（替换上一次的）：服务名 km-xxxx（随机，不带设备名）、端口、TXT */
        void advertise(String service, int port, Map<String, String> txt);
        void stopAdvertise();
        void discover(boolean on);
    }

    /** 测试用：记录每个局域网请求（harness 统计增量同步时没有 get/put、模拟同步到一半被杀） */
    public interface Tap { void sent(String host, int port, String path); }
    public static volatile Tap tap;

    public static final String TYPE = "_kmsync._tcp";
    public static final int PORT = 47811, VERSION = 1;
    public static int connectMs = 3000, readMs = 15000;
    static final long DAY = 86400000L;
    static final long NONCE_TTL = 60000L, DISCOVERABLE = 3 * 60 * 1000L, ONLINE = 150 * 1000L, RETRY_FAILED = 20000L;
    static final int NONCE_MAX = 64, MAX_FAILS = 3, BATCH = 6 << 20;

    final SyncManager m;
    Env env;
    /** 服务端收到东西后叫同步线程来处理（SyncService 排进后台线程；harness 里为空，由测试自己调 lanProcess） */
    volatile Runnable kick;
    volatile MiniHttp.Server server;
    final String service = "km-" + hex(rand(2));
    String advTxt = "";
    boolean discovering;
    /** App 在前台（只有前台时才开局域网服务） */
    volatile boolean active;
    /** 测试用：连不上的地址也立刻重试（平时 20 秒内不重试） */
    boolean noThrottle;

    // 服务端
    final LinkedHashMap<String, Long> nonces = new LinkedHashMap<>();
    final ConcurrentLinkedQueue<In> spool = new ConcurrentLinkedQueue<>();
    volatile long discUntil;
    final AtomicInteger fails = new AtomicInteger();
    volatile Pairing serverPair;
    // 客户端
    volatile Pairing clientPair;
    /** 最近一次弹给学生核对的配对（学生点确认 / 否认时用它） */
    volatile Pairing asking;
    // 发现、组员
    final Map<String, Map<String, Object>> nearby = new ConcurrentHashMap<>();   // 服务名 → {key, name, h, p}
    final Map<String, String> cands = new ConcurrentHashMap<>();                  // 服务名 → host:port（带本组标记的）
    final Map<String, Long> online = new ConcurrentHashMap<>();                   // 组员 → 最近一次局域网同步成功
    final Map<String, Long> failedAt = new HashMap<>();
    volatile long lastOk;
    final Map<String, Long> delivered = new ConcurrentHashMap<>();                // out/ 文件 → 已交给至少一台组员的 rev
    final Map<String, Object[]> cidCache = new ConcurrentHashMap<>();             // out/ 文件 → {rev, 钥匙指纹, cid}
    volatile String err = "";

    /** spool 里的一项：sec = 解开的分区；key = 钥匙包；addr = 对方的局域网地址 */
    static final class In {
        String t, from, gid, pkg, host;
        int port;
        SyncManager.Sec x;
    }

    Lan(SyncManager m) { this.m = m; }

    long now() { return m.now(); }

    // ================================================================ 运行、广播、发现（同步线程调用）

    boolean running() { MiniHttp.Server s = server; return s != null && !s.closed(); }

    String addr() { MiniHttp.Server s = server; return s != null && !s.closed() ? s.addr() + ":" + s.port() : ""; }

    int port() { MiniHttp.Server s = server; return s == null ? 0 : s.port(); }

    boolean discoverable() { return discUntil > now(); }

    /** 在组里或正可被发现、而且连着 Wi-Fi：开服务、广播、发现；否则全关。返回是否在运行 */
    boolean ensure() {
        boolean need = env != null && active && (m.g != null || discoverable());
        if (!need) { stop(); return false; }
        String a;
        try { a = env.address(); } catch (RuntimeException e) { a = null; }
        if (a == null) { stop(); return false; }
        MiniHttp.Server s = server;
        if (s != null && (s.closed() || !s.addr().equals(a))) { stop(); s = null; }      // 换了 Wi-Fi
        if (s == null) {
            try { server = new MiniHttp.Server(a, PORT, this::handle); }
            catch (IOException e) { err = "局域网服务开不了（" + e.getMessage() + "）"; return false; }
            advTxt = "";
            err = "";
        }
        advertise();
        if (!discovering) {
            discovering = true;
            try { env.discover(true); } catch (RuntimeException ignored) { }
        }
        return true;
    }

    void stop() {
        MiniHttp.Server s = server;
        server = null;
        if (s != null) s.close();
        if (env != null) {
            if (!advTxt.isEmpty()) { try { env.stopAdvertise(); } catch (RuntimeException ignored) { } }
            if (discovering) { try { env.discover(false); } catch (RuntimeException ignored) { } }
        }
        advTxt = "";
        discovering = false;
        nearby.clear();
        cands.clear();
        online.clear();
    }

    static String day(long t) {
        SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd", Locale.ROOT);
        f.setTimeZone(TimeZone.getTimeZone("UTC"));
        return f.format(new Date(t));
    }

    /** 广播内容：v=1；在组里时加今天的组标记 g；可被发现时加 p=1 和设备名 n。没变就不重新注册 */
    void advertise() {
        MiniHttp.Server s = server;
        if (s == null || env == null) return;
        Map<String, String> txt = new TreeMap<>();
        txt.put("v", String.valueOf(VERSION));
        Group g = m.g;
        if (g != null) txt.put("g", Group.tagOf(g.gk, day(now())));
        if (discoverable()) {
            txt.put("p", "1");
            String n = m.devName == null ? "" : m.devName;
            txt.put("n", n.length() > 40 ? n.substring(0, 40) : n);
        }
        String sig = txt + "@" + s.port();
        if (sig.equals(advTxt)) return;
        advTxt = sig;
        try { env.advertise(service, s.port(), txt); } catch (RuntimeException ignored) { }
    }

    boolean matchesTag(Group g, String tag) {
        long t = now();
        for (int d = -1; d <= 1; d++) if (Group.tagOf(g.gk, day(t + d * DAY)).equals(tag)) return true;
        return false;
    }

    /** NSD 找到一台：可被发现的进「附近」列表，带本组标记的记成组员候选。返回是不是新的组员候选（要马上同步一轮） */
    boolean found(String svc, String host, int port, Map<String, String> txt) {
        if (svc == null || svc.equals(service) || host == null || port <= 0 || txt == null) return false;
        if ((host + ":" + port).equals(addr())) return false;
        if ("1".equals(txt.get("p"))) {
            String n = txt.get("n");
            Map<String, Object> e = SyncJson.of("key", svc, "name", n == null || n.isEmpty() ? "未命名设备" : n, "h", host, "p", (long) port);
            Map<String, Object> old = nearby.put(svc, e);
            if (old == null || !SyncJson.canon(old).equals(SyncJson.canon(e))) emitPeers();
        } else if (nearby.remove(svc) != null) emitPeers();
        Group g = m.g;
        String tag = txt.get("g");
        if (g != null && tag != null && matchesTag(g, tag)) {
            String hp = host + ":" + port;
            return !hp.equals(cands.put(svc, hp));
        }
        cands.remove(svc);
        return false;
    }

    void lost(String svc) {
        cands.remove(svc);
        if (nearby.remove(svc) != null) emitPeers();
    }

    List<Object> nearbyList() {
        List<Object> l = new ArrayList<>();
        for (Map<String, Object> e : nearby.values()) l.add(SyncJson.of("key", e.get("key"), "name", e.get("name")));
        Collections.sort(l, (a, b) -> String.valueOf(SyncJson.m(a).get("name")).compareTo(String.valueOf(SyncJson.m(b).get("name"))));
        return l;
    }

    void emitPeers() { m.emit("peers", SyncJson.of("list", nearbyList())); }

    boolean isOnline(String dev) { Long t = online.get(dev); return t != null && now() - t < ONLINE; }

    List<Object> onlineList() {
        List<Object> l = new ArrayList<>();
        for (String d : new TreeMap<>(online).keySet()) if (isOnline(d)) l.add(d);
        return l;
    }

    // ================================================================ 本机状态文件 lan.json：各组员上次的地址、从它那里收过的分区

    Map<String, Object> loadState(Group g) {
        Map<String, Object> s;
        synchronized (m.st) { s = m.st.json("lan.json"); }
        if (s == null) s = SyncJson.map();
        if (SyncJson.m(s.get("peers")) == null) s.put("peers", SyncJson.map());
        if (g != null && !g.fp().equals(SyncJson.s(s, "fp"))) { s.put("fp", g.fp()); s.put("got", SyncJson.map()); }   // 换了钥匙，分区编号都变了
        if (SyncJson.m(s.get("got")) == null) s.put("got", SyncJson.map());
        return s;
    }

    void saveState(Map<String, Object> s) {
        synchronized (m.st) { m.st.putJson("lan.json", s); }
    }

    void savePeer(String dev, String host, int port) {
        if (dev == null || host == null || port <= 0 || dev.equals(m.dev)) return;
        Map<String, Object> s = loadState(m.g);
        Map<String, Object> peers = SyncJson.m(s.get("peers"));
        String hp = host + ":" + port;
        for (Iterator<Map.Entry<String, Object>> it = peers.entrySet().iterator(); it.hasNext(); ) {
            Map.Entry<String, Object> e = it.next();
            Map<String, Object> p = SyncJson.m(e.getValue());
            if (!e.getKey().equals(dev) && p != null && hp.equals(SyncJson.s(p, "h") + ":" + SyncJson.n(p, "p", 0))) it.remove();   // 这个地址换给别的设备了
        }
        Map<String, Object> cur = SyncJson.m(peers.get(dev));
        if (cur != null && host.equals(SyncJson.s(cur, "h")) && SyncJson.n(cur, "p", 0) == port && now() - SyncJson.n(cur, "t", 0) < 60000) return;
        peers.put(dev, SyncJson.of("h", host, "p", (long) port, "t", now()));
        saveState(s);
    }

    void forgetPeer(String dev) {
        Map<String, Object> s = loadState(m.g);
        if (SyncJson.m(s.get("peers")).remove(dev) != null) saveState(s);
    }

    /** 换了钥匙：分区编号全变了 */
    void keyChanged() {
        delivered.clear();
        cidCache.clear();
    }

    // ================================================================ 本机分区（out/）

    static final class Mine { String rel, name, sec, cid; long rev, t; }

    /** 本机各分区：分区编号 → {文件, 名字, rev, 内容编号}。内容编号按 (文件, rev, 钥匙) 缓存，不用每次都解 Keystore */
    Map<String, Mine> mine(Group g) {
        Map<String, Mine> r = new TreeMap<>();
        String fp = g.fp();
        for (String rel : m.st.list("out")) {
            Map<String, Object> e = m.st.json(rel);
            if (e == null) continue;
            Mine x = new Mine();
            x.rel = rel;
            x.name = SyncJson.s(e, "name");
            x.rev = SyncJson.n(e, "rev", 0);
            x.t = SyncJson.n(e, "t", 0);
            if (x.name == null) continue;
            Object[] c = cidCache.get(rel);
            if (c != null && (Long) c[0] == x.rev && fp.equals(c[1])) x.cid = (String) c[2];
            else {
                String content = m.outContent(e);
                if (content == null) continue;
                x.cid = g.cid(content);
                cidCache.put(rel, new Object[]{x.rev, fp, x.cid});
            }
            x.sec = g.secId(x.name);
            r.put(x.sec, x);
        }
        return r;
    }

    int pendingCount() {
        int n = 0;
        for (String rel : m.st.list("out")) {
            Map<String, Object> e = m.st.json(rel);
            if (e == null) continue;
            Long d = delivered.get(rel);
            if (d == null || d < SyncJson.n(e, "rev", 0)) n++;
        }
        return n;
    }

    // ================================================================ 服务端

    String newNonce() {
        String n = b64e(rand(16));
        synchronized (nonces) {
            long t = System.currentTimeMillis();
            for (Iterator<Map.Entry<String, Long>> it = nonces.entrySet().iterator(); it.hasNext(); ) {
                Map.Entry<String, Long> e = it.next();
                if (t - e.getValue() > NONCE_TTL || nonces.size() >= NONCE_MAX) it.remove(); else break;
            }
            nonces.put(n, t);
        }
        return n;
    }

    boolean takeNonce(String n) {
        synchronized (nonces) {
            Long t = nonces.remove(n);
            return t != null && System.currentTimeMillis() - t <= NONCE_TTL;
        }
    }

    static Object[] reply(int status, Map<String, Object> body) { return new Object[]{status, SyncJson.stringify(body)}; }

    Object[] handle(String remote, String method, String path, Map<String, String> headers, byte[] body) {
        if (!"POST".equals(method)) return reply(405, SyncJson.of("err", "method"));
        int q = path.indexOf('?');
        if (q >= 0) path = path.substring(0, q);
        Map<String, Object> b;
        try { b = body.length == 0 ? SyncJson.map() : SyncJson.obj(str(body)); } catch (RuntimeException e) { return reply(400, SyncJson.of("err", "json")); }
        switch (path) {
            case "/k1/hello": return reply(200, SyncJson.of("v", (long) VERSION, "n", newNonce()));
            case "/k1/pair/1": return pair1(b);
            case "/k1/pair/2": return pair2(b);
            case "/k1/pair/3": return pair3(b);
            case "/k1/manifest": case "/k1/get": case "/k1/put": case "/k1/key":
                return signed(remote, path, headers.get("x-km-lan"), body, b);
            default: return reply(404, SyncJson.of("err", "path"));
        }
    }

    static String authHeader(String dev, String nonce, byte[] gk, String path, byte[] body) {
        String fp = Group.fpOf(gk);
        String msg = "POST\n" + path + "\n" + dev + "\n" + nonce + "\n" + fp + "\n" + hex(sha256(body));
        return dev + "." + nonce + "." + fp + "." + b64e(hmac(Group.lanKeyOf(gk), msg));
    }

    static byte[] keyFor(Group s, String fp) {
        if (s.fp().equals(fp)) return s.gk;
        for (Group.Prev p : s.prev) if (Group.fpOf(p.gk).equals(fp)) return p.gk;
        return null;
    }

    Object[] signed(String remote, String path, String auth, byte[] raw, Map<String, Object> b) {
        Group g = m.g;
        Group s = g == null ? null : g.snap;
        String[] a = auth == null ? new String[0] : auth.split("\\.");
        if (a.length != 4 || !a[0].matches("[A-Za-z0-9_-]{1,64}") || !takeNonce(a[1])) return reply(403, SyncJson.of("err", "auth", "nn", newNonce()));
        if (s == null) return reply(403, SyncJson.of("err", "key", "nn", newNonce()));
        byte[] key = keyFor(s, a[2]);
        if (key == null) return reply(403, SyncJson.of("err", "key", "epoch", s.epoch, "fp", s.fp(), "nn", newNonce()));
        String fp = a[2];
        String msg = "POST\n" + path + "\n" + a[0] + "\n" + a[1] + "\n" + fp + "\n" + hex(sha256(raw));
        byte[] mac;
        try { mac = b64d(a[3]); } catch (RuntimeException e) { mac = null; }
        if (!same(mac, hmac(Group.lanKeyOf(key), msg))) return reply(403, SyncJson.of("err", "auth", "nn", newNonce()));
        String dev = a[0];
        if (dev.equals(m.dev)) return reply(403, SyncJson.of("err", "self", "nn", newNonce()));
        Group.Member mem = s.member(dev);
        boolean removed = mem != null && mem.removed > 0;
        boolean cur = same(key, s.gk);
        String oldGid = Group.gidOf(key);
        if (removed) {
            // 被移出的设备：拒绝，附一份用它手里那把钥匙加密的最新名单（它自己能验真，解开就知道被移出了）
            return reply(403, SyncJson.of("err", "removed", "dev", m.dev, "item", rosterItem(s, key), "nn", newNonce()));
        }
        if ("/k1/key".equals(path)) {
            // 对方给本机送钥匙包（本机换钥时不在，或同一代两把钥匙）：交给同步线程判断要不要换
            In in = new In();
            in.t = "key";
            in.from = dev;
            in.gid = oldGid;
            in.pkg = SyncJson.s(b, "pkg");
            if (in.pkg == null || in.pkg.length() > 4096) return reply(400, SyncJson.of("err", "pkg", "nn", newNonce()));
            spool.add(in);
            poke();
            return reply(200, SyncJson.of("ok", true, "nn", newNonce()));
        }
        if (!cur) {
            // 对方拿的是旧钥匙（换钥时它不在）：给它钥匙包
            Map<String, Object> r = SyncJson.of("err", "epoch", "epoch", s.epoch, "dev", m.dev, "nn", newNonce());
            PrivateKey sk = m.sk;
            if (mem != null && !mem.pk.isEmpty() && sk != null) {
                try { r.put("pkg", Group.keyPackage(sk, m.dev, dev, mem.pk, oldGid, s.gk, s.epoch, s.gkT)); } catch (RuntimeException ignored) { }
            }
            return reply(409, r);
        }
        switch (path) {
            case "/k1/manifest": {
                long port = SyncJson.n(b, "port", 0);
                if (port > 0 && port < 65536 && remote != null) {
                    In in = new In();
                    in.t = "addr";
                    in.from = dev;
                    in.host = remote;
                    in.port = (int) port;
                    spool.add(in);
                    poke();
                }
                online.put(dev, now());
                List<Object> items = new ArrayList<>();
                for (Mine x : mine(s).values()) items.add(SyncJson.of("sec", x.sec, "rev", x.rev, "cid", x.cid));
                return reply(200, SyncJson.of("v", (long) VERSION, "dev", m.dev, "name", m.devName, "epoch", s.epoch, "items", items, "have", haveFrom(s, dev), "nn", newNonce()));
            }
            case "/k1/get": {
                List<Object> want = SyncJson.l(b.get("secs"));
                List<Object> out = new ArrayList<>();
                boolean more = false;
                if (want != null) {
                    java.util.Set<String> ws = new java.util.HashSet<>();
                    for (Object o : want) ws.add(String.valueOf(o));
                    int size = 0;
                    for (Mine x : mine(s).values()) {
                        if (!ws.contains(x.sec)) continue;
                        Map<String, Object> e = m.st.json(x.rel);
                        String content = e == null ? null : m.outContent(e);
                        if (content == null || SyncJson.n(e, "rev", 0) != x.rev) continue;
                        byte[] box = m.envelope(s, s.gid(), x.name, content, x.rev, x.t);
                        if (!out.isEmpty() && size + box.length * 4 / 3 > BATCH) { more = true; break; }
                        size += box.length * 4 / 3 + 200;
                        out.add(SyncJson.of("sec", x.sec, "rev", x.rev, "cid", x.cid, "data", b64e(box)));
                    }
                }
                return reply(200, SyncJson.of("items", out, "more", more, "nn", newNonce()));
            }
            case "/k1/put": {
                List<Object> items = SyncJson.l(b.get("items"));
                int n = 0;
                if (items != null) for (Object o : items) {
                    Map<String, Object> it = SyncJson.m(o);
                    if (it == null) continue;
                    SyncManager.Sec x = m.decode(s, s.gid(), dev, it);
                    if (x == null) continue;
                    In in = new In();
                    in.t = "sec";
                    in.from = dev;
                    in.x = x;
                    spool.add(in);
                    n++;
                }
                if (n > 0) poke();
                online.put(dev, now());
                return reply(200, SyncJson.of("ok", true, "n", (long) n, "nn", newNonce()));
            }
            default: return reply(404, SyncJson.of("err", "path", "nn", newNonce()));
        }
    }

    void poke() { Runnable k = kick; if (k != null) { try { k.run(); } catch (RuntimeException ignored) { } } }

    /** 本机收件箱（和还没处理的 spool）里已有 from 的哪些分区：分区编号 → rev。对方据此不重复推 */
    Map<String, Object> haveFrom(Group s, String from) {
        Map<String, Object> h = new TreeMap<>();
        for (String rel : m.st.list("inbox")) {
            Map<String, Object> e = m.st.json(rel);
            if (e == null || !from.equals(SyncJson.s(e, "dev")) || SyncJson.s(e, "name") == null) continue;
            h.put(s.secId(SyncJson.s(e, "name")), SyncJson.n(e, "rev", 0));
        }
        for (In in : spool) if ("sec".equals(in.t) && from.equals(in.from) && in.x.gid.equals(s.gid())) {
            Object o = h.get(in.x.sec);
            if (!(o instanceof Long) || (Long) o < in.x.rev) h.put(in.x.sec, in.x.rev);
        }
        return h;
    }

    /** 用 key 加密的一份最新组名单（group 分区），给被移出 / 落后的设备 */
    Map<String, Object> rosterItem(Group s, byte[] key) {
        Group old = s.copy();
        old.gk = key;
        String content = s.sectionContent();
        long rev = Math.max(now(), 1);
        byte[] box = m.envelope(old, Group.gidOf(key), Group.SECTION, content, rev, now());
        return SyncJson.of("sec", old.secId(Group.SECTION), "rev", rev, "cid", old.cid(content), "data", b64e(box));
    }

    // ---------------------------------------------------------------- 配对：服务端（B，正可被发现）

    Object[] pairFail(String msg) {
        int f = fails.incrementAndGet();
        if (f >= MAX_FAILS) {
            discUntil = 0;
            m.emit("pair-close", SyncJson.of("msg", "确认码对不上 " + MAX_FAILS + " 次，已停止被发现。要再配对，请重新点「添加设备」"));
            poke();
        }
        return null;
    }

    Object[] pair1(Map<String, Object> b) {
        if (!discoverable()) return reply(403, SyncJson.of("err", "closed"));
        long t = now();
        Pairing cur = serverPair;
        if (cur != null && !cur.finished && !cur.expired(t) && !"denied".equals(cur.phase) && !"failed".equals(cur.phase))
            return reply(409, SyncJson.of("err", "busy"));
        String dev = SyncJson.s(b, "dev"), name = SyncJson.s(b, "name"), pk = SyncJson.s(b, "pk"), grp = SyncJson.s(b, "grp");
        if (dev == null || !dev.matches("[A-Za-z0-9_-]{1,64}") || pk == null || dev.equals(m.dev)) return reply(400, SyncJson.of("err", "bad"));
        try { publicKey(b64d(pk)); } catch (RuntimeException e) { return reply(400, SyncJson.of("err", "bad")); }
        if (SyncJson.n(b, "v", 0) != VERSION) return reply(409, SyncJson.of("err", "version"));
        Group g = m.g;
        Group s = g == null ? null : g.snap;
        if (s != null && grp != null && !grp.isEmpty()) return reply(409, SyncJson.of("err", matchesTag(s, grp) ? "same" : "both"));
        String myPk = m.pk;
        if (myPk == null || myPk.isEmpty() || m.sk == null) return reply(503, SyncJson.of("err", "busy"));
        Pairing p = new Pairing(false, b64e(rand(12)), m.dev, m.devName, myPk, t);
        p.peerDev = dev;
        p.peerName = name == null || name.trim().isEmpty() ? "未命名设备" : (name.length() > 40 ? name.substring(0, 40) : name);
        p.peerPk = pk;
        p.nB = rand(16);
        p.commit = Pairing.commitment(myPk, pk, p.nB);
        p.giver = s != null;
        serverPair = p;
        return reply(200, SyncJson.of("v", (long) VERSION, "sid", p.sid, "dev", m.dev, "name", m.devName, "pk", myPk, "grp", s != null, "c", b64e(p.commit)));
    }

    Object[] pair2(Map<String, Object> b) {
        Pairing p = serverPair;
        if (p == null || !p.sid.equals(SyncJson.s(b, "sid")) || !"start".equals(p.phase) || p.expired(now())) return reply(410, SyncJson.of("err", "gone"));
        byte[] nA;
        try { nA = b64d(SyncJson.s(b, "n")); } catch (RuntimeException e) { nA = null; }
        if (nA == null || nA.length != 16) return reply(400, SyncJson.of("err", "bad"));
        PrivateKey sk = m.sk;
        if (sk == null) return reply(503, SyncJson.of("err", "busy"));
        p.nA = nA;
        try { p.derive(sk); } catch (RuntimeException e) { p.phase = "failed"; return reply(400, SyncJson.of("err", "bad")); }
        p.phase = "wait";
        asking = p;
        m.emit("pair-request", SyncJson.of("role", "server", "name", p.peerName, "code", p.code));
        return reply(200, SyncJson.of("n", b64e(p.nB)));
    }

    /** A 确认（带 MAC 和它要给的组包）、否认，或只是来问结果 */
    Object[] pair3(Map<String, Object> b) {
        Pairing p = serverPair;
        if (p == null || !p.sid.equals(SyncJson.s(b, "sid")) || "start".equals(p.phase)) return reply(410, SyncJson.of("err", "gone"));
        synchronized (p) {
            if (SyncJson.b(b, "deny") && !"denied".equals(p.phase) && !p.finished) {
                p.phase = "denied";
                p.msg = "「" + p.peerName + "」上点了「不一样」，没有配对";
                m.emit("pair-result", SyncJson.of("ok", false, "role", "server", "name", p.peerName, "msg", p.msg));
                pairFail(p.msg);
                return reply(200, SyncJson.of("state", "denied"));
            }
            if ("denied".equals(p.phase) || "failed".equals(p.phase)) return reply(200, SyncJson.of("state", "denied"));
            if (p.expired(now()) && !p.finished) return reply(410, SyncJson.of("err", "gone"));
            String mac = SyncJson.s(b, "mac");
            if (mac != null && !p.peerOk) {
                byte[] mb;
                try { mb = b64d(mac); } catch (RuntimeException e) { mb = null; }
                if (!p.checkPeerMac(mb)) {
                    p.phase = "failed";
                    p.msg = "配对没有通过校验（可能有人冒充），请重新配对";
                    m.emit("pair-result", SyncJson.of("ok", false, "role", "server", "name", p.peerName, "msg", p.msg));
                    pairFail(p.msg);
                    return reply(403, SyncJson.of("err", "mac"));
                }
                String pkg = SyncJson.s(b, "pkg");
                if (pkg != null) { try { p.inPkg = b64d(pkg); } catch (RuntimeException e) { p.inPkg = null; } }
                p.peerOk = true;
                poke();                    // 本机学生已经点过确认的话，由同步线程装组包 / 把对方加进名单
            }
            if (p.meOk && p.peerOk) {
                Map<String, Object> r = SyncJson.of("state", "ok", "mac", b64e(p.myMac()));
                if (p.outPkg != null) r.put("pkg", b64e(p.outPkg));
                return reply(200, r);
            }
            return reply(200, SyncJson.of("state", "wait"));
        }
    }

    // ================================================================ 客户端（同步线程调用）

    static final class R {
        final int status;
        final Map<String, Object> j;
        R(int status, Map<String, Object> j) { this.status = status; this.j = j; }
    }

    R post(String host, int port, String path, Map<String, Object> body, Map<String, String> headers, byte[] raw) throws IOException {
        Tap t = tap;
        if (t != null) t.sent(host, port, path);
        byte[] b = raw != null ? raw : utf8(SyncJson.stringify(body));
        MiniHttp.Resp r = MiniHttp.request(host, port, "POST", path, headers, b, connectMs, readMs);
        Map<String, Object> j;
        try { j = SyncJson.obj(r.text()); } catch (RuntimeException e) { j = SyncJson.map(); }
        return new R(r.status, j);
    }

    R signed(String host, int port, String path, byte[] gk, String nonce, Map<String, Object> body) throws IOException {
        byte[] raw = utf8(SyncJson.stringify(body));
        Map<String, String> h = new HashMap<>();
        h.put("X-KM-Lan", authHeader(m.dev, nonce == null ? "" : nonce, gk, path, raw));
        return post(host, port, path, null, h, raw);
    }

    static List<byte[]> keysOf(Group g) {
        List<byte[]> r = new ArrayList<>();
        r.add(g.gk);
        List<Group.Prev> ps = new ArrayList<>(g.prev);
        Collections.sort(ps, (a, b) -> Long.compare(b.epoch, a.epoch));
        for (Group.Prev p : ps) {
            boolean dup = false;
            for (byte[] k : r) if (same(k, p.gk)) dup = true;
            if (!dup) r.add(p.gk);
        }
        return r;
    }

    /** 同步一轮：已知组员的上次地址 + NSD 发现的候选。返回收件箱有没有新东西 */
    boolean syncAll(boolean force) {
        if (m.g == null || !ensure()) return false;
        LinkedHashMap<String, String> targets = new LinkedHashMap<>();
        Map<String, Object> s = loadState(m.g);
        for (Map.Entry<String, Object> e : SyncJson.m(s.get("peers")).entrySet()) {
            Map<String, Object> p = SyncJson.m(e.getValue());
            if (p != null) targets.put(SyncJson.s(p, "h") + ":" + SyncJson.n(p, "p", 0), e.getKey());
        }
        for (String hp : cands.values()) targets.putIfAbsent(hp, "");
        String me = addr();
        boolean got = false;
        for (String hp : targets.keySet()) {
            if (m.g == null) break;
            if (hp.equals(me)) continue;
            if (!force && !noThrottle) { Long f = failedAt.get(hp); if (f != null && now() - f < RETRY_FAILED) continue; }
            int c = hp.lastIndexOf(':');
            int port;
            try { port = Integer.parseInt(hp.substring(c + 1)); } catch (RuntimeException e) { continue; }
            int[] n = new int[1];
            String d = round(hp.substring(0, c), port, n);
            if (d == null) failedAt.put(hp, now()); else failedAt.remove(hp);
            got |= n[0] > 0;
        }
        return got;
    }

    /** 和一台同步一轮。返回对方设备号，失败返回 null；got[0] = 收进收件箱的分区数 */
    String round(String host, int port, int[] got) {
        Group g = m.g;
        if (g == null) return null;
        try {
            R h = post(host, port, "/k1/hello", SyncJson.map(), null, null);
            if (h.status != 200) return null;
            if (SyncJson.n(h.j, "v", 0) != VERSION) { err = "附近有设备的 App 版本不同，请把两台设备都升级到最新版"; return null; }
            String n = SyncJson.s(h.j, "n");
            List<byte[]> keys = keysOf(g);
            boolean retried = false;
            for (int i = 0; i < keys.size(); i++) {
                byte[] k = keys.get(i);
                R r = signed(host, port, "/k1/manifest", k, n, SyncJson.of("port", (long) port()));
                n = SyncJson.s(r.j, "nn");
                String err = SyncJson.s(r.j, "err");
                if (r.status == 200) {
                    if (i == 0) return exchange(host, port, r.j, n, got);
                    behind(host, port, k, r.j, n);               // 对方还在用旧钥匙：给它钥匙包，或告诉它已被移出
                    return SyncJson.s(r.j, "dev");
                }
                if (r.status == 409 && "epoch".equals(err)) {
                    String sd = SyncJson.s(r.j, "dev");
                    int res = m.lanTakeKey(sd, Group.gidOf(k), SyncJson.s(r.j, "pkg"));
                    if (res == 1 && !retried) {                  // 对方的钥匙更新：换上，再用新钥匙同步
                        retried = true;
                        g = m.g;
                        if (g == null) return null;
                        keys = keysOf(g);
                        i = -1;
                        continue;
                    }
                    if (res == 0) pushKey(host, port, k, sd, n);  // 本机的更新（同一代两把钥匙、指纹较小）：给对方
                    return null;
                }
                if (r.status == 403 && "removed".equals(err)) { m.lanRemovedNotice(k, SyncJson.s(r.j, "dev"), SyncJson.m(r.j.get("item"))); return null; }
                if (r.status == 403 && "key".equals(err)) continue;  // 对方不认识这把钥匙：试上一代
                return null;
            }
            return null;
        } catch (IOException e) {
            return null;
        }
    }

    String exchange(String host, int port, Map<String, Object> man, String n, int[] got) throws IOException {
        Group g = m.g;
        String sd = SyncJson.s(man, "dev");
        if (g == null || sd == null || sd.equals(m.dev) || !sd.matches("[A-Za-z0-9_-]{1,64}")) return null;
        if (g.isRemoved(sd)) return null;            // 名单上已移出、还没换钥：不给它数据
        online.put(sd, now());
        savePeer(sd, host, port);
        Map<String, Object> st = loadState(g);
        Map<String, Object> gotAll = SyncJson.m(st.get("got"));
        Map<String, Object> gotMap = SyncJson.m(gotAll.get(sd));
        if (gotMap == null) { gotMap = SyncJson.map(); gotAll.put(sd, gotMap); }
        Map<String, Mine> mine = mine(g);
        Map<String, String> theirs = new HashMap<>();
        List<String> need = new ArrayList<>();
        List<Object> items = SyncJson.l(man.get("items"));
        if (items != null) for (Object o : items) {
            Map<String, Object> it = SyncJson.m(o);
            String sec = SyncJson.s(it, "sec"), cid = SyncJson.s(it, "cid");
            long rev = SyncJson.n(it, "rev", -1);
            if (sec == null || cid == null) continue;
            theirs.put(sec, cid);
            Mine x = mine.get(sec);
            if (x != null && x.cid.equals(cid)) { delivered.put(x.rel, x.rev); continue; }     // 内容一样，不用传
            if (SyncJson.n(gotMap, sec, -1) >= rev) continue;                                   // 收过了
            if (x != null && m.inboxRev(sd, x.name) >= rev) continue;
            need.add(sec);
        }
        // 取：对方有、本机没合并过的
        while (!need.isEmpty()) {
            R r = signed(host, port, "/k1/get", g.gk, n, SyncJson.of("secs", new ArrayList<Object>(need)));
            n = SyncJson.s(r.j, "nn");
            if (r.status != 200) break;
            List<Object> l = SyncJson.l(r.j.get("items"));
            if (l == null || l.isEmpty()) break;
            for (Object o : l) {
                Map<String, Object> it = SyncJson.m(o);
                String sec = SyncJson.s(it, "sec");
                need.remove(sec);
                SyncManager.Sec x = m.decode(g, g.gid(), sd, it);
                if (x == null) continue;
                if (m.store(x, "局域网")) got[0]++;
                gotMap.put(x.sec, x.rev);
                if (m.g != g) return sd;                // 收到的名单里本机被移出了
            }
            if (!SyncJson.b(r.j, "more")) break;
        }
        // 推：本机有、对方没有的
        Map<String, Object> have = SyncJson.m(man.get("have"));
        List<Object> batch = new ArrayList<>();
        List<Mine> sent = new ArrayList<>();
        int size = 0;
        for (Mine x : mine.values()) {
            if (x.cid.equals(theirs.get(x.sec))) continue;
            if (have != null && SyncJson.n(have, x.sec, -1) >= x.rev) { delivered.put(x.rel, x.rev); continue; }
            Map<String, Object> e = m.st.json(x.rel);
            String content = e == null ? null : m.outContent(e);
            if (content == null || SyncJson.n(e, "rev", 0) != x.rev) continue;
            byte[] box = m.envelope(g, g.gid(), x.name, content, x.rev, x.t);
            if (!batch.isEmpty() && size + box.length * 4 / 3 > BATCH) {
                n = put(host, port, g, n, batch, sent);
                batch.clear();
                sent.clear();
                size = 0;
                if (n == null) break;
            }
            batch.add(SyncJson.of("sec", x.sec, "rev", x.rev, "cid", x.cid, "data", b64e(box)));
            sent.add(x);
            size += box.length * 4 / 3 + 200;
        }
        if (!batch.isEmpty() && n != null) put(host, port, g, n, batch, sent);
        saveState(st);
        lastOk = now();
        return sd;
    }

    String put(String host, int port, Group g, String n, List<Object> batch, List<Mine> sent) throws IOException {
        R r = signed(host, port, "/k1/put", g.gk, n, SyncJson.of("items", new ArrayList<Object>(batch)));
        if (r.status != 200) return null;
        for (Mine x : sent) delivered.put(x.rel, x.rev);
        return SyncJson.s(r.j, "nn");
    }

    /** 对方还在用本机的旧钥匙 k：被移出的告诉它名单；没被移出的给钥匙包 */
    void behind(String host, int port, byte[] k, Map<String, Object> man, String n) throws IOException {
        Group g = m.g;
        String sd = SyncJson.s(man, "dev");
        if (g == null || sd == null) return;
        Group.Member mem = g.member(sd);
        if (mem != null && mem.removed > 0) {
            R r = signed(host, port, "/k1/put", k, n, SyncJson.of("items", Collections.singletonList((Object) rosterItem(g, k))));
            if (r.status == 200) forgetPeer(sd);           // 告诉过了，以后不再找它
            return;
        }
        pushKey(host, port, k, sd, n);
    }

    void pushKey(String host, int port, byte[] k, String sd, String n) throws IOException {
        Group g = m.g;
        PrivateKey sk = m.sk;
        if (g == null || sd == null || sk == null) return;
        Group.Member mem = g.member(sd);
        if (mem == null || mem.pk.isEmpty() || mem.removed > 0) return;
        String pkg = Group.keyPackage(sk, m.dev, sd, mem.pk, Group.gidOf(k), g.gk, g.epoch, g.gkT);
        signed(host, port, "/k1/key", k, n, SyncJson.of("pkg", pkg));
    }

    // ---------------------------------------------------------------- 配对：客户端（A）

    static final class PairError extends Exception { PairError(String m) { super(m); } }

    /** pair/1、pair/2：拿到对方公钥和承诺、交换随机数、核对承诺，算出确认码 */
    Pairing pairStart(String host, int port) throws PairError {
        Group g = m.g;
        String grp = g == null ? "" : Group.tagOf(g.gk, day(now()));
        R r1;
        try {
            r1 = post(host, port, "/k1/pair/1", SyncJson.of("v", (long) VERSION, "dev", m.dev, "name", m.devName, "pk", m.pk, "grp", grp), null, null);
        } catch (IOException e) {
            throw new PairError("连不上 " + host + ":" + port + "：两台设备要连同一个 Wi-Fi；学校、公共 Wi-Fi 常常不让设备互相连，可以改用「扫加入码」");
        }
        String err = SyncJson.s(r1.j, "err");
        if (r1.status == 403 && "closed".equals(err)) throw new PairError("对方没有打开「添加设备」（或已超过 3 分钟）。请先在对方设备上点「添加设备」，再试一次");
        if ("busy".equals(err)) throw new PairError("对方正在和别的设备配对，请稍等一会儿再试");
        if ("same".equals(err)) throw new PairError("你们已经在同一个同步组里了，不用再配对；连同一个 Wi-Fi 时会自动直接同步");
        if ("both".equals(err)) throw new PairError("对方已经在另一个同步组里。请先在其中一台「退出同步组」（本机数据保留），再配对");
        if ("version".equals(err)) throw new PairError("两台设备的 App 版本不同，请都升级到最新版");
        if (r1.status != 200) throw new PairError("对方拒绝了配对（" + r1.status + " " + (err == null ? "" : err) + "）");
        String sid = SyncJson.s(r1.j, "sid"), pd = SyncJson.s(r1.j, "dev"), pk = SyncJson.s(r1.j, "pk"), c = SyncJson.s(r1.j, "c");
        if (sid == null || pd == null || pk == null || c == null || !pd.matches("[A-Za-z0-9_-]{1,64}")) throw new PairError("对方的回应不对，请重新配对");
        if (pd.equals(m.dev)) throw new PairError("不能和自己配对");
        boolean peerGrp = SyncJson.b(r1.j, "grp");
        if (g != null && peerGrp) throw new PairError("对方已经在另一个同步组里。请先在其中一台「退出同步组」（本机数据保留），再配对");
        Pairing p = new Pairing(true, sid, m.dev, m.devName, m.pk, now());
        p.peerDev = pd;
        String nm = SyncJson.s(r1.j, "name");
        p.peerName = nm == null || nm.trim().isEmpty() ? "未命名设备" : nm;
        p.peerPk = pk;
        p.peerHost = host;
        p.peerPort = port;
        try { p.commit = b64d(c); publicKey(b64d(pk)); } catch (RuntimeException e) { throw new PairError("对方的回应不对，请重新配对"); }
        p.nA = rand(16);
        p.giver = g != null || !peerGrp;
        R r2;
        try { r2 = post(host, port, "/k1/pair/2", SyncJson.of("sid", sid, "n", b64e(p.nA)), null, null); }
        catch (IOException e) { throw new PairError("连接断了，请重新配对"); }
        if (r2.status != 200) throw new PairError("对方取消了配对，请重新配对");
        try { p.nB = b64d(SyncJson.s(r2.j, "n")); } catch (RuntimeException e) { p.nB = null; }
        if (p.nB == null || p.nB.length != 16 || !same(Pairing.commitment(pk, m.pk, p.nB), p.commit))
            throw new PairError("确认码校验没通过（可能有人冒充），已取消。请重新配对");
        p.derive(m.sk);
        p.phase = "wait";
        return p;
    }

    /** pair/3：发确认（MAC + 组包）或否认，或只是问结果。返回对方的回应 */
    R pairSend(Pairing p, Map<String, Object> body) throws IOException {
        body.put("sid", p.sid);
        return post(p.peerHost, p.peerPort, "/k1/pair/3", body, null, null);
    }
}
