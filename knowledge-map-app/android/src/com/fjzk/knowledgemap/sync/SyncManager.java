package com.fjzk.knowledgemap.sync;

import java.io.IOException;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import static com.fjzk.knowledgemap.sync.SyncCrypto.*;

/**
 * 同步内核（#1 第一期：经同步节点同步）。纯 Java、同步执行；什么时候调用（回到前台、发布后 10 秒、每 15 分钟、
 * 加入码轮询）由 Android 适配层 SyncAndroid 或电脑上的 SyncHarness 决定。
 *
 * 网页只交明文分区（publish）、取明文分区（take/ack），永远拿不到任何密钥；加解密、签名、组名单、换钥都在这里。
 * 节点上每台设备一个槽：分区编号 sec = HMAC(idKey, 分区名)，密文 = AES-GCM(encKey, gzip({n 分区名, c 内容, t 发布时间}))，
 * 附加数据绑定 gid、来源设备、分区编号、rev。
 */
public final class SyncManager {
    public interface Events { void event(String type, String json); }
    public interface Clock { long now(); }

    static final long DAY = 86400000L;
    static final long RATE_BACKOFF = 15 * 60 * 1000L;
    static final int PUSH_BATCH = 6 << 20;
    static final int MAX_SECTION = 4 << 20;
    static final long PREV_MEMBER_DAYS = 14, PREV_REKEYER_DAYS = 60;

    final SyncStore st;
    final Clock clock;
    Events events;

    // 本机身份
    String dev = "", devName = "";
    String pk = "";
    PrivateKey sk;
    String notice = "";            // 被移出组时给学生看的一句话

    volatile Group g;               // null = 没加入同步组
    Join join;

    // 节点状态（不落盘的部分）
    volatile boolean busy;
    String errCode = "", errMsg = "";
    long lastOk, lastTry, backoffUntil;
    final Map<String, Long> seen = new TreeMap<>();      // 组员 → 最近一次收到它的分区的发布时间
    volatile String stateCache = "{}";

    public SyncManager(SyncStore st, Clock clock) {
        this.st = st;
        this.clock = clock;
        loadDevice();
        g = Group.load(st);
        if (g == null && st.json("group.json") != null) {
            // Keystore 钥匙丢了：当作没加入组，学习数据不受影响
            st.wipeGroup();
            notice = "这台设备的同步钥匙丢失了（系统重置过锁屏或钥匙库），需要重新加入同步组；本机学习数据不受影响";
        }
        Map<String, Object> ns = st.json("node.json");
        if (ns != null) {
            Map<String, Object> s = SyncJson.m(ns.get("seen"));
            if (s != null) for (Map.Entry<String, Object> e : s.entrySet()) if (e.getValue() instanceof Number) seen.put(e.getKey(), ((Number) e.getValue()).longValue());
            lastOk = SyncJson.n(ns, "lastOk", 0);
        }
        refreshState();
    }

    public void setEvents(Events e) { events = e; }

    long now() { return clock.now(); }

    void emit(String type, Map<String, Object> data) {
        Events e = events;
        if (e != null) e.event(type, SyncJson.stringify(data));
    }

    // ================================================================ 本机身份

    void loadDevice() {
        Map<String, Object> d = st.json("device.json");
        if (d != null) {
            dev = SyncJson.s(d, "dev") == null ? "" : SyncJson.s(d, "dev");
            devName = SyncJson.s(d, "name") == null ? "" : SyncJson.s(d, "name");
            notice = SyncJson.s(d, "notice") == null ? "" : SyncJson.s(d, "notice");
            String box = SyncJson.s(d, "sk");
            if (box != null) {
                byte[] p = st.open(b64d(box));
                if (p != null) {
                    try { sk = privateKey(p); pk = SyncJson.s(d, "pk"); } catch (RuntimeException e) { sk = null; }
                }
            }
        }
        if (sk == null) {
            KeyPair kp = newKeyPair();
            sk = kp.getPrivate();
            pk = b64e(kp.getPublic().getEncoded());
            saveDevice();
        }
    }

    void saveDevice() {
        st.putJson("device.json", SyncJson.of("dev", dev, "name", devName, "pk", pk, "sk", b64e(st.seal(sk.getEncoded())), "notice", notice));
    }

    /** 设备编号和名字来自 #2 的 KMData.device()（km-device-v1）；编号一旦定下不再改 */
    public synchronized void setDevice(String id, String name) {
        boolean ch = false;
        if (id != null && id.matches("[A-Za-z0-9_-]{1,64}") && dev.isEmpty()) { dev = id; ch = true; }
        if (name != null && !name.trim().isEmpty() && !name.trim().equals(devName)) {
            devName = name.trim().length() > 40 ? name.trim().substring(0, 40) : name.trim();
            ch = true;
            if (g != null) {
                Group.Member m = g.member(dev);
                if (m != null && !m.name.equals(devName) && m.nameT == 0) { m.name = devName; m.nameT = now(); g.save(st); publishGroup(); }
            }
        }
        if (ch) { saveDevice(); refreshState(); }
    }

    public String deviceId() { return dev; }

    public boolean inGroup() { return g != null; }

    // ================================================================ 发布、收件箱（网页 ⇄ Java，只有明文分区）

    static String fileOf(String sub, String key) { return sub + "/" + hex(head(sha256(utf8(key)), 10)) + ".json"; }

    /**
     * 网页发布明文分区：{device:{id,name}, sections:[{name, content}]}。没加入组时什么也不做（不写文件、不发请求）。
     * 只给内容变了的分区换新 rev = max(上次+1, 当前毫秒)，先写盘。返回变了几个分区。
     */
    public int publish(String json) {
        Map<String, Object> m;
        try { m = SyncJson.obj(json); } catch (RuntimeException e) { return 0; }
        Map<String, Object> d = SyncJson.m(m.get("device"));
        if (d != null) setDevice(SyncJson.s(d, "id"), SyncJson.s(d, "name"));
        if (g == null) return 0;
        List<Object> secs = SyncJson.l(m.get("sections"));
        if (secs == null) return 0;
        int n = 0;
        for (Object o : secs) {
            Map<String, Object> s = SyncJson.m(o);
            String name = SyncJson.s(s, "name"), content = SyncJson.s(s, "content");
            if (name == null || content == null || name.equals(Group.SECTION) || name.isEmpty() || name.length() > 200) continue;
            if (content.length() > MAX_SECTION) continue;
            if (putOut(name, content)) n++;
        }
        if (n > 0) refreshState();
        return n;
    }

    /** 写 out/；内容没变返回 false */
    boolean putOut(String name, String content) {
        String rel = fileOf("out", name);
        String hash = hex(sha256(utf8(content)));
        synchronized (st) {
            Map<String, Object> cur = st.json(rel);
            if (cur != null && hash.equals(SyncJson.s(cur, "hash"))) return false;
            long rev = Math.max(cur == null ? 0 : SyncJson.n(cur, "rev", 0) + 1, now());
            st.putJson(rel, SyncJson.of("name", name, "rev", rev, "hash", hash, "t", now(), "pushed", SyncJson.map(),
                "box", b64e(st.seal(gzip(utf8(content))))));
            return true;
        }
    }

    String outContent(Map<String, Object> e) {
        byte[] p = st.open(b64d(SyncJson.s(e, "box")));
        byte[] c = p == null ? null : gunzip(p, MAX_SECTION * 4);
        return c == null ? null : str(c);
    }

    void publishGroup() {
        if (g != null) putOut(Group.SECTION, g.sectionContent());
    }

    /** 收件箱：[{id, rev, dev, devName, name, content, t}]，只给组名单里没被移除的设备的分区 */
    public String take() {
        List<Object> out = new ArrayList<>();
        Group gg = g;
        if (gg != null) for (String rel : st.list("inbox")) {
            Map<String, Object> e = st.json(rel);
            if (e == null) continue;
            String from = SyncJson.s(e, "dev");
            if (from == null || gg.isRemoved(from)) continue;
            String c = outContent(e);
            if (c == null) continue;
            Group.Member mb = gg.member(from);
            out.add(SyncJson.of("id", rel, "rev", SyncJson.n(e, "rev", 0), "dev", from, "devName", mb == null ? "" : mb.name,
                "name", SyncJson.s(e, "name"), "content", c, "t", SyncJson.n(e, "t", 0)));
        }
        return SyncJson.stringify(out);
    }

    /** 确认已合并：[{id, rev}]；合并期间又来了更新的版本就保留 */
    public void ack(String json) {
        List<Object> l;
        try { l = SyncJson.l(SyncJson.parse(json)); } catch (RuntimeException e) { return; }
        if (l == null) return;
        synchronized (st) {
            for (Object o : l) {
                Map<String, Object> a = SyncJson.m(o);
                String id = SyncJson.s(a, "id");
                if (id == null || !id.matches("inbox/[0-9a-f]{20}\\.json")) continue;
                Map<String, Object> cur = st.json(id);
                if (cur != null && SyncJson.n(cur, "rev", -1) == SyncJson.n(a, "rev", -2)) st.delete(id);
            }
        }
        refreshState();
    }

    int inboxCount() { return g == null ? 0 : st.list("inbox").size(); }

    /** 本机各分区的内容编号（harness 比对三台是否一致用） */
    public synchronized Map<String, String> cids() {
        Map<String, String> r = new TreeMap<>();
        if (g == null) return r;
        for (String rel : st.list("out")) {
            Map<String, Object> e = st.json(rel);
            if (e == null) continue;
            String c = outContent(e);
            if (c != null) r.put(SyncJson.s(e, "name"), g.cid(c));
        }
        return r;
    }

    // ================================================================ 节点同步

    Map<String, Object> nodeState() {
        Map<String, Object> m = st.json("node.json");
        if (m == null) m = SyncJson.map();
        if (SyncJson.m(m.get("g")) == null) m.put("g", SyncJson.map());
        return m;
    }

    Map<String, Object> ns(Map<String, Object> all, String gid) {
        Map<String, Object> gs = SyncJson.m(all.get("g"));
        Map<String, Object> x = SyncJson.m(gs.get(gid));
        if (x == null) { x = SyncJson.map(); gs.put(gid, x); }
        return x;
    }

    void saveNodeState(Map<String, Object> all) {
        all.put("seen", new TreeMap<String, Object>(seen));
        all.put("lastOk", lastOk);
        st.putJson("node.json", all);
    }

    /** 签名计数：取 max(上次+1, 当前毫秒, atLeast)，先写盘再返回 */
    final NodeClient.Ctr ctr = this::nextCtr;

    long nextCtr(String gid, long atLeast) {
        synchronized (st) {
            Map<String, Object> all = nodeState();
            Map<String, Object> x = ns(all, gid);
            long c = Math.max(Math.max(SyncJson.n(x, "ctr", 0) + 1, now()), atLeast);
            x.put("ctr", c);
            saveNodeState(all);
            return c;
        }
    }

    NodeClient client() {
        if (g == null || g.node == null || SyncJson.b(g.node, "off")) return null;
        String h = SyncJson.s(g.node, "h");
        long p = SyncJson.n(g.node, "p", 0);
        return h == null || p <= 0 ? null : new NodeClient(h, (int) p, ctr);
    }

    NodeClient.Invite invite() {
        return g == null || g.node == null ? null : NodeClient.parseInvite(SyncJson.s(g.node, "inv"));
    }

    /** 一轮同步：旧组信箱 → 拉取 → 信箱 → 换钥 → 推送。返回状态 JSON。 */
    public synchronized String syncNow() {
        if (g == null) { refreshState(); return stateCache; }
        NodeClient nc = client();
        if (nc == null) { refreshState(); return stateCache; }
        if (now() < backoffUntil) { refreshState(); return stateCache; }
        busy = true;
        lastTry = now();
        refreshState();
        boolean gotInbox = false;
        try {
            boolean rebuilt = false;
            while (true) {
                try {
                    if (rebuilt) rebuild(nc);
                    gotInbox |= round(nc);
                    errCode = "";
                    errMsg = "";
                    lastOk = now();
                    break;
                } catch (NodeClient.NodeError e) {
                    if (e.status == 404 && "nogroup".equals(e.err) && !rebuilt && g != null) { rebuilt = true; continue; }
                    fail(e);
                    break;
                }
            }
        } catch (IOException e) {
            errCode = "offline";
            errMsg = "同步节点连不上";
        } catch (RuntimeException e) {
            errCode = "error";
            errMsg = "同步出错：" + e.getMessage();
        } finally {
            busy = false;
            if (g != null) {
                synchronized (st) {
                    Map<String, Object> all = nodeState();
                    saveNodeState(all);
                }
            }
            refreshState();
        }
        if (gotInbox) emit("inbox", SyncJson.of("n", (long) inboxCount()));
        return stateCache;
    }

    void fail(NodeClient.NodeError e) {
        String c = e.err;
        if (e.status == 403 && "blocked".equals(c)) { errCode = "blocked"; errMsg = "同步节点拒绝了这个同步组"; }
        else if (e.status == 403 && "invite".equals(c)) { errCode = "invite"; errMsg = "邀请码已失效，请向管理员要新的"; }
        else if (e.status == 413 && "quota".equals(c)) { errCode = "quota"; errMsg = "同步空间已满，请联系管理员"; }
        else if (e.status == 429) { errCode = "rate"; errMsg = "同步太频繁，15 分钟后再试"; backoffUntil = now() + RATE_BACKOFF; }
        else if (e.status == 401) { errCode = "auth"; errMsg = "同步节点认证失败"; }
        else { errCode = "node"; errMsg = "同步节点出错（" + e.status + " " + c + "）"; }
    }

    /** 节点上没有这个组（节点数据丢了）：用组包里的邀请码重建，然后从头拉、全部重推 */
    void rebuild(NodeClient nc) throws IOException, NodeClient.NodeError {
        NodeClient.Invite inv = invite();
        if (inv == null) throw new NodeClient.NodeError(403, "invite");
        Map<String, Object> r = nc.create(inv, g.gid(), g.nodeKey());
        resetGid(g.gid(), SyncJson.s(r, "gen"));
    }

    /** 某个组从头来：since 归零、记下 gen、本机分区全部重推 */
    void resetGid(String gid, String gen) {
        synchronized (st) {
            Map<String, Object> all = nodeState();
            Map<String, Object> x = ns(all, gid);
            x.put("since", 0L);
            if (gen != null) x.put("gen", gen); else x.remove("gen");
            x.remove("devs");
            saveNodeState(all);
            for (String rel : st.list("out")) {
                Map<String, Object> e = st.json(rel);
                if (e == null) continue;
                Map<String, Object> p = SyncJson.m(e.get("pushed"));
                if (p != null && p.remove(gid) != null) st.putJson(rel, e);
            }
        }
    }

    boolean round(NodeClient nc) throws IOException, NodeClient.NodeError {
        boolean got = false;
        checkPrev(nc);
        if (g == null) return false;
        for (int i = 0; i < 3; i++) {                 // 迁到新组后在新组上再走一遍
            String gid = g.gid();
            int[] mail = new int[1];
            got |= pullAll(nc, gid, g.nodeKey(), true, mail);
            if (g == null) return got;
            if (mail[0] > 0) handleMail(nc, gid, g.nodeKey());
            if (g == null) return got;
            if (!g.gid().equals(gid)) continue;        // 拿到新钥匙，迁过去了
            if (g.isRemoved(dev)) { becomeRemoved(); return got; }
            if (g.needsRekey()) { rekey(nc); continue; }
            pushAll(nc);
            break;
        }
        return got;
    }

    /** 拉取 since 之后的全部；current=false 只是为了看旧组信箱、推进 since。返回有没有新收件 */
    boolean pullAll(NodeClient nc, String gid, byte[] nodeKey, boolean current, int[] mailOut) throws IOException, NodeClient.NodeError {
        boolean got = false, restarted = false;
        long since;
        synchronized (st) { since = SyncJson.n(ns(nodeState(), gid), "since", 0); }
        while (true) {
            Map<String, Object> r = nc.call(gid, nodeKey, dev, "pull", SyncJson.of("since", since));
            String gen = SyncJson.s(r, "gen");
            String oldGen;
            synchronized (st) { oldGen = SyncJson.s(ns(nodeState(), gid), "gen"); }
            if (current && oldGen != null && gen != null && !gen.equals(oldGen) && !restarted) {
                // 管理员清空了组、或组被重建：从头拉，本机全部重推
                resetGid(gid, gen);
                since = 0;
                restarted = true;
                continue;
            }
            mailOut[0] = (int) SyncJson.n(r, "mail", 0);
            List<Object> items = SyncJson.l(r.get("items"));
            Set<String> devs = new HashSet<>();
            if (items != null) for (Object o : items) {
                Map<String, Object> it = SyncJson.m(o);
                if (it == null) continue;
                since = Math.max(since, SyncJson.n(it, "seq", since));
                if (current && g != null && g.gid().equals(gid)) {
                    String from = SyncJson.s(it, "dev");
                    if (from != null) devs.add(from);
                    if (receive(gid, it)) got = true;
                }
            }
            synchronized (st) {
                Map<String, Object> all = nodeState();
                Map<String, Object> x = ns(all, gid);
                x.put("since", since);
                if (gen != null) x.put("gen", gen);
                if (!devs.isEmpty()) {
                    List<Object> l = SyncJson.l(x.get("devs"));
                    Set<String> s = new java.util.TreeSet<>();
                    if (l != null) for (Object d : l) s.add(String.valueOf(d));
                    s.addAll(devs);
                    x.put("devs", new ArrayList<Object>(s));
                }
                saveNodeState(all);
            }
            if (!SyncJson.b(r, "more")) break;
        }
        return got;
    }

    /** 解开一个分区：group 分区直接并进组名单，其它放进收件箱。返回收件箱有没有变化 */
    boolean receive(String gid, Map<String, Object> it) {
        String from = SyncJson.s(it, "dev"), sec = SyncJson.s(it, "sec");
        long rev = SyncJson.n(it, "rev", -1);
        if (from == null || sec == null || from.equals(dev) || g.isRemoved(from)) return false;
        byte[] box;
        try { box = b64d(SyncJson.s(it, "data")); } catch (RuntimeException e) { return false; }
        byte[] gz = open(g.encKey(), box, "km-sec|" + gid + "|" + from + "|" + sec + "|" + rev);
        byte[] plain = gz == null ? null : gunzip(gz, MAX_SECTION * 4);
        if (plain == null) return false;
        Map<String, Object> env;
        try { env = SyncJson.obj(str(plain)); } catch (RuntimeException e) { return false; }
        String name = SyncJson.s(env, "n"), content = SyncJson.s(env, "c");
        if (name == null || content == null || !g.secId(name).equals(sec)) return false;
        long t = SyncJson.n(env, "t", 0);
        Long old = seen.get(from);
        if (old == null || t > old) seen.put(from, t);
        if (Group.SECTION.equals(name)) {
            if (g.mergeSection(content)) { g.save(st); publishGroup(); }
            return false;
        }
        String rel = fileOf("inbox", from + "|" + name);
        synchronized (st) {
            Map<String, Object> cur = st.json(rel);
            if (cur != null && SyncJson.n(cur, "rev", 0) >= rev) return false;
            st.putJson(rel, SyncJson.of("dev", from, "name", name, "rev", rev, "t", t, "box", b64e(st.seal(gzip(utf8(content))))));
        }
        return true;
    }

    byte[] envelope(Group gg, String gid, String name, String content, long rev, long t) {
        String env = SyncJson.canon(SyncJson.of("n", name, "c", content, "t", t));
        return seal(gg.encKey(), gzip(utf8(env)), "km-sec|" + gid + "|" + dev + "|" + gg.secId(name) + "|" + rev);
    }

    /** 推送 out/ 里在这个组上还没推过的分区；stale 的分区换新 rev，下一轮重推 */
    void pushAll(NodeClient nc) throws IOException, NodeClient.NodeError {
        publishGroup();
        String gid = g.gid();
        List<Map<String, Object>> batch = new ArrayList<>();
        List<String> rels = new ArrayList<>();
        int size = 0;
        for (String rel : st.list("out")) {
            Map<String, Object> e = st.json(rel);
            if (e == null) continue;
            long rev = SyncJson.n(e, "rev", 0);
            Map<String, Object> p = SyncJson.m(e.get("pushed"));
            if (p != null && SyncJson.n(p, gid, -1) == rev) continue;
            String c = outContent(e);
            if (c == null) continue;
            String name = SyncJson.s(e, "name");
            byte[] box = envelope(g, gid, name, c, rev, SyncJson.n(e, "t", 0));
            Map<String, Object> item = SyncJson.of("sec", g.secId(name), "rev", rev, "cid", g.cid(c), "data", b64e(box));
            if (!batch.isEmpty() && size + box.length * 4 / 3 > PUSH_BATCH) {
                pushBatch(nc, gid, batch, rels);
                batch.clear();
                rels.clear();
                size = 0;
            }
            batch.add(item);
            rels.add(rel);
            size += box.length * 4 / 3 + 200;
        }
        if (!batch.isEmpty()) pushBatch(nc, gid, batch, rels);
    }

    void pushBatch(NodeClient nc, String gid, List<Map<String, Object>> batch, List<String> rels) throws IOException, NodeClient.NodeError {
        Map<String, Object> r = nc.call(gid, g.nodeKey(), dev, "push", SyncJson.of("items", new ArrayList<Object>(batch)));
        Set<String> stale = new HashSet<>();
        List<Object> sl = SyncJson.l(r.get("stale"));
        if (sl != null) for (Object o : sl) stale.add(String.valueOf(o));
        synchronized (st) {
            for (int i = 0; i < batch.size(); i++) {
                Map<String, Object> e = st.json(rels.get(i));
                if (e == null) continue;
                long rev = SyncJson.n(batch.get(i), "rev", 0);
                if (SyncJson.n(e, "rev", 0) != rev) continue;          // 推送期间网页又发布了新版本，下一轮再推
                if (stale.contains(SyncJson.s(batch.get(i), "sec"))) {
                    e.put("rev", Math.max(rev + 1, now()));             // 节点上已有更大的 rev（本机状态重建过）：换新 rev 下一轮重推
                } else {
                    Map<String, Object> p = SyncJson.m(e.get("pushed"));
                    if (p == null) { p = SyncJson.map(); e.put("pushed", p); }
                    p.put(gid, rev);
                }
                st.putJson(rels.get(i), e);
            }
        }
    }

    int pendingCount() {
        if (g == null) return 0;
        String gid = g.gid();
        int n = 0;
        for (String rel : st.list("out")) {
            Map<String, Object> e = st.json(rel);
            if (e == null) continue;
            Map<String, Object> p = SyncJson.m(e.get("pushed"));
            if (p == null || SyncJson.n(p, gid, -1) != SyncJson.n(e, "rev", 0)) n++;
        }
        return n;
    }

    // ================================================================ 信箱、换钥

    /** 取本组（或旧组）信箱：钥匙包 → 比当前新就迁过去 */
    void handleMail(NodeClient nc, String gid, byte[] nodeKey) throws IOException, NodeClient.NodeError {
        Map<String, Object> r = nc.call(gid, nodeKey, dev, "mail/get", SyncJson.map());
        List<Object> items = SyncJson.l(r.get("items"));
        if (items == null) return;
        List<Object> done = new ArrayList<>();
        for (Object o : items) {
            Map<String, Object> it = SyncJson.m(o);
            String id = SyncJson.s(it, "id"), from = SyncJson.s(it, "from"), to = SyncJson.s(it, "to");
            if (id == null || from == null || !dev.equals(to) || g == null) continue;
            Group.Member fm = g.member(from);
            String text;
            try { text = str(b64d(SyncJson.s(it, "data"))); } catch (RuntimeException e) { continue; }
            if (fm == null || fm.pk.isEmpty()) {
                // 换钥的组员还不在本机名单里（几乎不会）：留着，等名单同步过来
                continue;
            }
            Map<String, Object> k = Group.openKeyPackage(sk, fm.pk, from, dev, gid, text);
            done.add(id);
            if (k == null) continue;
            byte[] ngk = b64d(SyncJson.s(k, "gk"));
            long ep = SyncJson.n(k, "epoch", 0), gkT = SyncJson.n(k, "gkT", 0);
            if (same(ngk, g.gk)) continue;
            boolean newer = ep > g.epoch || (ep == g.epoch && Group.fpOf(ngk).compareTo(g.fp()) < 0);
            if (newer) adopt(nc, ngk, ep, gkT);
        }
        if (!done.isEmpty()) {
            try { nc.call(gid, nodeKey, dev, "mail/del", SyncJson.of("ids", done)); } catch (NodeClient.NodeError ignored) { }
        }
    }

    /** 收到钥匙包，迁到新组：旧组留作 prev（看一段时间信箱），删掉自己在旧组的槽 */
    void adopt(NodeClient nc, byte[] ngk, long epoch, long gkT) throws IOException {
        String oldGid = g.gid();
        byte[] oldKey = g.nodeKey();
        Group.Prev p = prevOf(oldGid);
        if (p == null) {
            p = new Group.Prev();
            p.gk = g.gk;
            p.epoch = g.epoch;
            p.role = "member";
            p.until = now() + PREV_MEMBER_DAYS * DAY;
            synchronized (st) { p.since = SyncJson.n(ns(nodeState(), oldGid), "since", 0); }
            g.prev.add(p);
        }
        boolean conflict = epoch == g.epoch;        // 同一代两把钥匙：取指纹较小的那把
        if (conflict) {
            // 本机对上一代发起的换钥让给对方（对方也给所有组员投了钥匙包），不再负责删旧组
            for (Group.Prev q : g.prev) if ("rekeyer".equals(q.role) && q.epoch == epoch - 1) q.role = "member";
            if (g.own) {
                // 当前组是本机建的，迁走后删掉（组员会先在旧组信箱里看到对方的钥匙包，跟着迁走）
                try { nc.call(oldGid, oldKey, dev, "drop", SyncJson.map()); } catch (NodeClient.NodeError ignored) { }
                g.prev.remove(p);
            }
        }
        g.gk = ngk;
        g.epoch = epoch;
        g.gkT = gkT;
        g.own = false;
        g.save(st);
        resetGid(g.gid(), null);
        try { nc.call(oldGid, oldKey, dev, "forget", SyncJson.of("dev", dev)); } catch (NodeClient.NodeError ignored) { }
        emit("state", SyncJson.of("rekey", true));
    }

    Group.Prev prevOf(String gid) {
        for (Group.Prev p : g.prev) if (p.gid().equals(gid)) return p;
        return null;
    }

    /** 本机换钥：建新组（successor），给每个剩下的组员在旧组信箱投钥匙包，旧组里推一份新名单让被移除的设备知道，再删掉被移除设备的槽 */
    void rekey(NodeClient nc) throws IOException, NodeClient.NodeError {
        String oldGid = g.gid();
        byte[] oldGk = g.gk, oldKey = g.nodeKey();
        long maxRemoved = 0;
        for (Group.Member m : g.members.values()) maxRemoved = Math.max(maxRemoved, m.removed);
        byte[] ngk = rand(32);
        String newGid = Group.gidOf(ngk);
        try {
            nc.successor(oldGid, oldKey, dev, newGid, Group.nodeKeyOf(ngk));
        } catch (NodeClient.NodeError e) {
            if (e.status != 404) throw e;
            rebuild(nc);
            nc.successor(oldGid, oldKey, dev, newGid, Group.nodeKeyOf(ngk));
        }
        Group.Prev p = new Group.Prev();
        p.gk = oldGk;
        p.epoch = g.epoch;
        p.role = "rekeyer";
        p.until = now() + PREV_REKEYER_DAYS * DAY;
        synchronized (st) { p.since = SyncJson.n(ns(nodeState(), oldGid), "since", 0); }
        for (String d : g.active()) if (!d.equals(dev)) p.pending.add(d);
        g.prev.add(p);
        g.gk = ngk;
        g.epoch = p.epoch + 1;
        g.gkT = Math.max(now(), maxRemoved + 1);
        g.own = true;
        g.save(st);                                     // 先落盘：投信件前崩溃的话，下一轮 checkPrev 会补投
        resetGid(newGid, null);
        deliver(nc, p, oldGid, oldKey);
        emit("state", SyncJson.of("rekey", true));
    }

    /** 给旧组的组员投钥匙包，并在旧组推一份最新名单、删掉被移除设备的槽 */
    void deliver(NodeClient nc, Group.Prev p, String oldGid, byte[] oldKey) throws IOException, NodeClient.NodeError {
        p.mails.clear();
        for (String to : p.pending) {
            Group.Member m = g.member(to);
            if (m == null || m.pk.isEmpty() || m.removed > 0) continue;
            String pkg = Group.keyPackage(sk, dev, to, m.pk, oldGid, g.gk, g.epoch, g.gkT);
            Map<String, Object> r = nc.call(oldGid, oldKey, dev, "mail/put", SyncJson.of("to", to, "data", b64e(utf8(pkg)), "ttl", 60L * 86400));
            p.mails.add(String.valueOf(r.get("id")));
        }
        if (p.mails.isEmpty()) p.mails.add("-");
        g.save(st);
        // 旧组里推一份最新名单（用旧钥匙），被移除的设备拉到后就知道自己被移出了
        Group old = g.copy();
        old.gk = p.gk;
        String content = g.sectionContent();
        long rev = Math.max(now(), 1);
        byte[] box = envelope(old, oldGid, Group.SECTION, content, rev, now());
        nc.call(oldGid, oldKey, dev, "push", SyncJson.of("items", java.util.Collections.singletonList(
            (Object) SyncJson.of("sec", old.secId(Group.SECTION), "rev", rev, "cid", old.cid(content), "data", b64e(box)))));
        for (Map.Entry<String, Group.Member> e : g.members.entrySet())
            if (e.getValue().removed > 0 && !e.getKey().equals(dev))
                nc.call(oldGid, oldKey, dev, "forget", SyncJson.of("dev", e.getKey()));
    }

    /** 每轮先看旧组：信箱（同一代另一把更小的钥匙）、本机发起的换钥是否全部迁完（迁完就 drop）、信件丢了就补投 */
    void checkPrev(NodeClient nc) throws IOException, NodeClient.NodeError {
        if (g == null || g.prev.isEmpty()) return;
        boolean changed = false;
        for (Group.Prev p : new ArrayList<>(g.prev)) {
            if (g == null) return;
            String gid = p.gid();
            byte[] key = Group.nodeKeyOf(p.gk);
            if (now() > p.until) {
                if ("rekeyer".equals(p.role)) try { nc.call(gid, key, dev, "drop", SyncJson.map()); } catch (NodeClient.NodeError ignored) { }
                g.prev.remove(p);
                changed = true;
                continue;
            }
            if ("rekeyer".equals(p.role)) {
                Set<String> moved = devsOn(g.gid());
                if (p.pending.removeAll(moved)) changed = true;
                for (String d : new ArrayList<>(p.pending)) if (g.member(d) == null || g.member(d).removed > 0) { p.pending.remove(d); changed = true; }
                if (p.pending.isEmpty()) {
                    try { nc.call(gid, key, dev, "drop", SyncJson.map()); } catch (NodeClient.NodeError ignored) { }
                    g.prev.remove(p);
                    changed = true;
                    continue;
                }
            }
            int[] mail = new int[1];
            try {
                pullAll(nc, gid, key, false, mail);
                if ("rekeyer".equals(p.role) && p.mails.isEmpty()) { deliver(nc, p, gid, key); changed = true; }
                if (mail[0] > 0) handleMail(nc, gid, key);
            } catch (NodeClient.NodeError e) {
                if (e.status == 404 && "rekeyer".equals(p.role)) {
                    // 旧组没了但还有组员没迁：用邀请码重建旧组，补投钥匙包
                    NodeClient.Invite inv = invite();
                    if (inv != null) {
                        try {
                            nc.create(inv, gid, key);
                            resetGid(gid, null);
                            deliver(nc, p, gid, key);
                        } catch (NodeClient.NodeError e2) { g.prev.remove(p); }
                    } else g.prev.remove(p);
                    changed = true;
                } else if (e.status == 404 || e.status == 403) {
                    g.prev.remove(p);
                    changed = true;
                } else throw e;
            }
        }
        if (changed && g != null) g.save(st);
    }

    Set<String> devsOn(String gid) {
        Set<String> s = new HashSet<>();
        synchronized (st) {
            List<Object> l = SyncJson.l(ns(nodeState(), gid).get("devs"));
            if (l != null) for (Object o : l) s.add(String.valueOf(o));
        }
        return s;
    }

    /** 本机被移出：删掉同步组（本机学习数据不动） */
    void becomeRemoved() {
        g = null;
        join = null;
        st.wipeGroup();
        notice = "这台设备已被移出同步组，本机数据还在";
        saveDevice();
        seen.clear();
        emit("state", SyncJson.of("removed", true));
    }

    // ================================================================ 建组、节点设置

    /** 扫邀请码：没加入组 → 建组（第一台设备）；已在组里 → 换成新的邀请码/地址（「重新扫邀请码」）。返回 {ok, msg} */
    public synchronized String nodeJoin(String text) {
        NodeClient.Invite inv = NodeClient.parseInvite(text);
        if (inv == null) return res(false, "这不是同步节点的邀请码（应以 kmnode:1? 开头）");
        if (dev.isEmpty()) return res(false, "请先回到总入口再打开设备同步（本机还没有设备编号）");
        boolean fresh = g == null;
        Group ng = fresh ? Group.create(now()) : g.copy();
        if (fresh) ng.addMember(dev, devName, pk, now());
        ng.node = SyncJson.of("h", inv.host, "p", (long) inv.port, "inv", inv.text, "t", Math.max(now(), g == null || g.node == null ? 0 : SyncJson.n(g.node, "t", 0) + 1));
        NodeClient nc = new NodeClient(inv.host, inv.port, ctr);
        Map<String, Object> r;
        try {
            r = nc.create(inv, ng.gid(), ng.nodeKey());
        } catch (IOException e) {
            return res(false, "同步节点连不上（" + inv.host + ":" + inv.port + "），请检查网络后再试");
        } catch (NodeClient.NodeError e) {
            if (e.status == 403 && "invite".equals(e.err)) return res(false, "邀请码已失效，请向管理员要新的");
            if (e.status == 403 && "blocked".equals(e.err)) return res(false, "同步节点拒绝了这个同步组");
            if (e.status == 413) return res(false, "同步节点已满，请联系管理员");
            return res(false, "同步节点出错（" + e.status + " " + e.err + "）");
        }
        g = ng;
        notice = "";
        saveDevice();
        g.save(st);
        if (fresh || !SyncJson.b(r, "existed")) resetGid(g.gid(), SyncJson.s(r, "gen"));
        errCode = "";
        errMsg = "";
        backoffUntil = 0;
        publishGroup();
        refreshState();
        emit("state", SyncJson.of("joined", fresh));
        return res(true, fresh ? "已建好同步组" : "已更新同步节点");
    }

    /** 不再使用同步节点（第一期只有节点这一条路，相当于暂停同步；再扫邀请码恢复） */
    public synchronized String nodeRemove() {
        if (g == null) return res(false, "还没加入同步组");
        Map<String, Object> n = g.node == null ? SyncJson.map() : new LinkedHashMap<>(g.node);
        n.put("off", true);
        n.put("t", Math.max(now(), SyncJson.n(n, "t", 0) + 1));
        g.node = n;
        g.save(st);
        publishGroup();
        refreshState();
        return res(true, "已停用同步节点");
    }

    static String res(boolean ok, String msg) { return SyncJson.stringify(SyncJson.of("ok", ok, "msg", msg)); }

    // ================================================================ 名单操作

    public synchronized String rename(String who, String name) {
        if (g == null) return res(false, "还没加入同步组");
        name = name == null ? "" : name.trim();
        if (name.isEmpty() || name.length() > 40) return res(false, "名字要 1–40 个字");
        Group.Member m = g.member(who);
        if (m == null) return res(false, "没有这台设备");
        m.name = name;
        m.nameT = Math.max(now(), m.nameT + 1);
        if (who.equals(dev)) { devName = name; saveDevice(); }
        g.save(st);
        publishGroup();
        refreshState();
        return res(true, "已改名");
    }

    /** 移除设备：标上移除时间，下一轮同步换钥（syncNow 由调用方紧接着触发） */
    public synchronized String remove(String who) {
        if (g == null) return res(false, "还没加入同步组");
        if (who.equals(dev)) return res(false, "要让本机退出，请用「退出同步组」");
        Group.Member m = g.member(who);
        if (m == null || m.removed > 0) return res(false, "这台设备不在组里");
        m.removed = Math.max(now(), g.gkT + 1);
        m.by = dev;
        g.save(st);
        publishGroup();
        refreshState();
        return res(true, "已移除，正在换同步钥匙");
    }

    /** 本机退出同步组：告诉组员（推一份名单）、删掉自己的槽，本机学习数据保留 */
    public synchronized String leave() {
        if (g == null) return res(false, "还没加入同步组");
        Group.Member m = g.member(dev);
        if (m != null) { m.removed = Math.max(now(), g.gkT + 1); m.by = dev; }
        g.save(st);
        publishGroup();
        NodeClient nc = client();
        if (nc != null) {
            try {
                pushAll(nc);           // 槽留着：组员要从这里看到「已退出」，换钥时会删掉它
            } catch (IOException | NodeClient.NodeError ignored) { /* 连不上也照样退出；组员下次看到名单再换钥 */ }
        }
        g = null;
        join = null;
        st.wipeGroup();
        seen.clear();
        notice = "";
        saveDevice();
        refreshState();
        return res(true, "已退出同步组，本机学习数据还在");
    }

    // ================================================================ 加入码

    /** A：生成加入码，往转交点 a 边放 ① */
    public synchronized String joinOpen() {
        if (g == null) return res(false, "还没加入同步组");
        NodeClient nc = client();
        if (nc == null) return res(false, "没有可用的同步节点，请先扫邀请码");
        Join j = Join.newHost(nc.host, nc.port, now());
        try {
            nc.rdvPut(j.rid, "a", j.hello(dev, devName, pk, 1));
        } catch (IOException e) {
            return res(false, "同步节点连不上，请检查网络");
        } catch (NodeClient.NodeError e) {
            return res(false, "同步节点出错（" + e.status + " " + e.err + "）");
        }
        join = j;
        emit("join-code", SyncJson.of("text", j.text(), "display", j.display(), "exp", j.exp));
        return SyncJson.stringify(SyncJson.of("ok", true, "text", j.text(), "display", j.display(), "exp", j.exp));
    }

    public synchronized void joinClose() {
        Join j = join;
        if (j == null) return;
        if (j.host && "confirm".equals(j.phase)) joinConfirm(false);
        join = null;
    }

    public synchronized String joinState() {
        return join == null ? "{}" : SyncJson.stringify(join.state(now()));
    }

    /** C：扫加入码（或手输地址和 26 位码），取 ①、放 ② */
    public synchronized String joinScan(String text) {
        if (g != null) return res(false, "这台设备已经在一个同步组里，请先「退出同步组」（本机数据保留）再加入");
        if (dev.isEmpty()) return res(false, "请先回到总入口再打开设备同步（本机还没有设备编号）");
        Join j = Join.parseGuest(text, now());
        if (j == null) return res(false, "这不是加入码（应以 kmjoin:1? 开头，或「地址:端口 · 26 位码」）");
        NodeClient nc = new NodeClient(j.nodeHost, j.nodePort, ctr);
        try {
            Map<String, Object> a = null;
            for (byte[] b : nc.rdvGet(j.rid, "b")) { a = j.openHello(b, 1); if (a != null) break; }
            if (a == null) return res(false, "加入码无效或已过期，请在另一台设备上重新点「添加设备」");
            j.peerDev = SyncJson.s(a, "dev");
            j.peerName = SyncJson.s(a, "name");
            j.peerPk = SyncJson.s(a, "pk");
            if (j.peerDev.equals(dev)) return res(false, "不能加入自己");
            nc.rdvPut(j.rid, "b", j.hello(dev, devName, pk, 2));
        } catch (IOException e) {
            return res(false, "同步节点连不上（" + j.nodeHost + ":" + j.nodePort + "），请检查网络");
        } catch (NodeClient.NodeError e) {
            if (e.status == 413) return res(false, "这张加入码已经被用过了，请重新生成");
            return res(false, "同步节点出错（" + e.status + " " + e.err + "）");
        }
        j.code = Join.confirmCode(j.s, j.peerPk, pk);
        j.msg = "请在「" + j.peerName + "」上确认，确认码 " + j.code;
        join = j;
        emit("join-request", SyncJson.of("role", "guest", "name", j.peerName, "code", j.code));
        return SyncJson.stringify(SyncJson.of("ok", true, "name", j.peerName, "code", j.code));
    }

    /** A：学生核对确认码后点确认 / 否认 */
    public synchronized String joinConfirm(boolean ok) {
        Join j = join;
        if (j == null || !j.host || !"confirm".equals(j.phase)) return res(false, "没有等待确认的设备");
        NodeClient nc = new NodeClient(j.nodeHost, j.nodePort, ctr);
        try {
            if (!ok) {
                nc.rdvPut(j.rid, "a", j.denyBox());
                j.phase = "closed";
                j.msg = "已拒绝，这张加入码作废了";
                emit("join-result", SyncJson.of("ok", false, "role", "host", "msg", j.msg));
                return res(true, j.msg);
            }
            if (g == null) return res(false, "还没加入同步组");
            Group ng = g.copy();
            ng.addMember(j.peerDev, j.peerName, j.peerPk, now());
            Group.Member pm = ng.member(j.peerDev);
            if (pm.removed > 0) return res(false, "这台设备以前被移出过，不能再用同一个编号加入");
            if (!pm.pk.equals(j.peerPk)) return res(false, "这台设备的钥匙和名单里的不一样，请在那台设备上先退出再加入");
            nc.rdvPut(j.rid, "a", j.groupBox(sk, j.peerPk, ng.packageJson()));
            g.members.put(j.peerDev, pm);
            g.save(st);
            publishGroup();
        } catch (IOException e) {
            return res(false, "同步节点连不上，请检查网络后再点一次确认");
        } catch (NodeClient.NodeError e) {
            return res(false, "同步节点出错（" + e.status + " " + e.err + "）");
        }
        j.phase = "done";
        j.msg = "「" + j.peerName + "」已加入";
        refreshState();
        emit("join-result", SyncJson.of("ok", true, "role", "host", "name", j.peerName, "msg", j.msg));
        return res(true, j.msg);
    }

    /** 加入码轮询（适配层定时调用）：A 取 ②，C 取 ③。返回下一次轮询的间隔毫秒，-1 = 不用再轮询 */
    public synchronized long joinPoll() {
        Join j = join;
        if (j == null) return -1;
        long t = now();
        if (!"wait".equals(j.phase)) return -1;
        if (t > j.exp) {
            j.phase = "expired";
            j.msg = "加入码已过期，请重新生成";
            emit("join-result", SyncJson.of("ok", false, "role", j.host ? "host" : "guest", "msg", j.msg));
            return -1;
        }
        NodeClient nc = new NodeClient(j.nodeHost, j.nodePort, ctr);
        try {
            if (j.host) {
                List<byte[]> bs = nc.rdvGet(j.rid, "a");
                if (bs.isEmpty()) return 3000;
                Map<String, Object> c = j.openHello(bs.get(0), 2);
                if (c == null) {
                    j.phase = "bad";
                    j.msg = "收到的加入请求解不开（可能被篡改），这张加入码作废了，请重新生成";
                    emit("join-result", SyncJson.of("ok", false, "role", "host", "msg", j.msg));
                    return -1;
                }
                j.peerDev = SyncJson.s(c, "dev");
                j.peerName = SyncJson.s(c, "name");
                j.peerPk = SyncJson.s(c, "pk");
                j.code = Join.confirmCode(j.s, pk, j.peerPk);
                j.phase = "confirm";
                j.msg = "「" + j.peerName + "」要加入你的同步组，确认码 " + j.code;
                emit("join-request", SyncJson.of("role", "host", "name", j.peerName, "code", j.code));
                return -1;
            }
            for (byte[] b : nc.rdvGet(j.rid, "b")) {
                if (j.isDeny(b)) {
                    j.phase = "denied";
                    j.msg = "「" + j.peerName + "」上点了拒绝";
                    emit("join-result", SyncJson.of("ok", false, "role", "guest", "msg", j.msg));
                    return -1;
                }
                String pkg = j.openGroupBox(sk, j.peerPk, b);
                if (pkg == null) continue;
                installGroup(pkg, j);
                return -1;
            }
        } catch (IOException | NodeClient.NodeError e) {
            return j.host ? 3000 : 5000;
        }
        if (!j.hinted && t - j.started > Join.GUEST_HINT) {
            j.hinted = true;
            emit("join-request", SyncJson.of("role", "guest", "name", j.peerName, "code", j.code, "hint", "请在「" + j.peerName + "」上点确认"));
        }
        return t - j.started < Join.GUEST_HINT ? 2000 : 5000;
    }

    void installGroup(String pkg, Join j) {
        Group ng;
        try { ng = Group.fromPackage(pkg); } catch (RuntimeException e) { return; }
        Group.Member me = ng.member(dev);
        if (me == null || !pk.equals(me.pk)) return;
        g = ng;
        notice = "";
        saveDevice();
        g.save(st);
        resetGid(g.gid(), null);
        publishGroup();
        j.phase = "done";
        j.msg = "已加入「" + j.peerName + "」的同步组";
        refreshState();
        emit("join-result", SyncJson.of("ok", true, "role", "guest", "first", true, "name", j.peerName, "msg", j.msg));
    }

    // ================================================================ 状态

    public String state() { return stateCache; }

    void refreshState() {
        Map<String, Object> s = SyncJson.map();
        s.put("inGroup", g != null);
        s.put("notice", notice);
        s.put("me", SyncJson.of("dev", dev, "name", devName));
        List<Object> ms = new ArrayList<>();
        int inbox = 0, pending = 0;
        if (g != null) {
            for (Map.Entry<String, Group.Member> e : g.members.entrySet()) {
                Group.Member m = e.getValue();
                if (m.removed > 0) continue;
                Long last = seen.get(e.getKey());
                ms.add(SyncJson.of("dev", e.getKey(), "name", m.name, "me", e.getKey().equals(dev), "last", last == null ? 0L : last, "via", "节点"));
            }
            Map<String, Object> n = g.node;
            s.put("node", n == null ? null : SyncJson.of("h", SyncJson.s(n, "h"), "p", SyncJson.n(n, "p", 0), "off", SyncJson.b(n, "off"),
                "last", lastOk, "error", errCode, "msg", errMsg));
            s.put("epoch", g.epoch);
            inbox = inboxCount();
            pending = pendingCount();
        }
        s.put("members", ms);
        s.put("inbox", (long) inbox);
        s.put("pending", (long) pending);
        String status = g == null ? "none" : busy ? "syncing" : !errCode.isEmpty() ? (errCode.equals("offline") ? "offline" : "error")
            : pending > 0 || inbox > 0 ? "pending" : lastOk > 0 ? "ok" : "pending";
        s.put("status", status);
        s.put("error", errMsg);
        s.put("lastOk", lastOk);
        String old = stateCache;
        stateCache = SyncJson.stringify(s);
        if (!stateCache.equals(old)) emit("state", s);
    }
}
