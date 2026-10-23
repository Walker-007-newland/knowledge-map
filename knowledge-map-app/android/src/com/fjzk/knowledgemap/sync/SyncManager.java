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
    /** 节点 60 天后自动删掉换钥前的旧组；超过这么久没同步、组又不在了，就当同步组已过期 */
    static final long EXPIRE_DAYS = 60;
    /** 节点说这个组号已经换钥（403 replaced）：多半是这台设备被移出了，或者换钥时它没拿到新钥匙。不重建、不重试 */
    static final String REPLACED_MSG = "这台设备不在同步组里了：同步组已经换了钥匙，这台设备没有拿到新钥匙（可能已被移出）。"
        + "如果是你自己的设备，请点下面的「退出同步组」，再扫另一台设备上的加入码重新加入（本机学习数据都在，不会丢）";
    static final String ACCT_ONLY = "这台设备已经用账号同步：换设备只要在新设备上登录同一个账号，这个功能在账号模式下不用";
    static final String EXPIRED_MSG ="同步组已过期，请重新加入：这台设备超过 60 天没同步，你的其它设备可能已经换了同步钥匙。"
        + "请点下面的「退出同步组」，再扫另一台设备上的加入码（本机学习数据都在，不会丢）";

    final SyncStore st;
    final Clock clock;
    Events events;

    // 本机身份（局域网服务端的线程也读，所以 volatile）
    volatile String dev = "", devName = "";
    volatile String pk = "";
    volatile PrivateKey sk;
    String notice = "";            // 被移出组时给学生看的一句话

    volatile Group g;               // null = 没加入同步组
    volatile Join join;
    /** 局域网直连（第二期）。没有 Env（电脑测试里没开局域网的设备）时什么也不做 */
    final Lan lan = new Lan(this);
    /** 组员 → 最近一次收到它的分区走的是哪条路（「局域网」/「节点」） */
    final Map<String, String> via = new java.util.concurrent.ConcurrentHashMap<>();

    // 节点状态（不落盘的部分）
    volatile boolean busy;
    String errCode = "", errMsg = "";
    long lastOk, lastTry, backoffUntil;
    final Map<String, Long> seen = new TreeMap<>();      // 组员 → 最近一次收到它的分区的发布时间
    volatile String stateCache = "{}";

    // 账号（#12）
    /** 本机账号；null = 从没注册 / 登录过（升级前的老设备、新装的设备） */
    volatile Account acct;
    /** 本机通行证（从 account.json 解开后放内存） */
    volatile byte[] tokCache;
    /** 当前组绑定的账号用户名（节点 pull / push 响应里的 acct）：同组还没登录的设备在登录页填好用户名 */
    volatile String groupAcct = "";
    /** 打包时写进 APK 的默认服务器和恢复公钥（assets/km-config.json；电脑测试里直接设） */
    volatile String cfgHost = "", recPub = "", recKid = "";
    volatile int cfgPort;

    public SyncManager(SyncStore st, Clock clock) {
        this.st = st;
        this.clock = clock;
        loadDevice();
        acct = Account.load(st);
        g = Group.load(st);
        if (g == null && (new java.io.File(st.dir, "group.json").exists() || new java.io.File(st.dir, "group.json.tmp").exists())) {
            // Keystore 钥匙读不出来（个别机型刷机、换锁屏后会这样，也可能只是暂时的）：当作没加入组，先不删文件，
            // 学生重新建组 / 加入时再清掉。学习数据不受影响
            keyLost = true;
            notice = "这台设备的同步文件损坏了或钥匙读不出来了（比如系统重置过锁屏），需要重新加入同步组；本机学习数据不受影响";
        }
        Map<String, Object> ns = st.json("node.json");
        if (ns != null) {
            Map<String, Object> s = SyncJson.m(ns.get("seen"));
            if (s != null) for (Map.Entry<String, Object> e : s.entrySet()) if (e.getValue() instanceof Number) seen.put(e.getKey(), ((Number) e.getValue()).longValue());
            lastOk = SyncJson.n(ns, "lastOk", 0);
            if (g != null) {
                String ga = SyncJson.s(ns(ns, g.gid()), "acct");
                if (ga != null) groupAcct = ga;
            }
        }
        refreshState();
    }

    /** 默认服务器（打包时写进 APK）和账号恢复公钥 */
    public void setConfig(String host, int port, String pub, String kid) {
        cfgHost = host == null ? "" : host;
        cfgPort = port;
        recPub = pub == null ? "" : pub;
        recKid = kid == null ? "" : kid;
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
                try {
                    byte[] p = st.open(b64d(box));
                    if (p != null) { sk = privateKey(p); pk = SyncJson.s(d, "pk"); }
                } catch (RuntimeException e) { sk = null; }       // 文件坏了 / 钥匙读不出来：下次建组时重新生成
            }
        }
    }

    boolean keyLost;

    /**
     * 设备长期密钥：第一次建组 / 加入时才生成（没加入组的设备不碰 Keystore、不写 files/kmsync/）。
     * 旧的同步文件解不开时先清掉。
     */
    void ensureKey() {
        // 不在组里时建组 / 加入：先清掉旧的 group.json、node.json、out/、inbox/（损坏的、以前组留下的），绝不带进新组
        if (g == null) st.wipeGroup();
        keyLost = false;
        if (sk != null) return;
        KeyPair kp = newKeyPair();
        sk = kp.getPrivate();
        pk = b64e(kp.getPublic().getEncoded());
        saveDevice();
    }

    void saveDevice() {
        if (sk == null) return;            // 还没建组 / 加入过：编号和名字只放内存，不写文件
        writeDevice();
        localErr = "";
    }

    void writeDevice() {
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
            localErr = "";
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
        if (h == null || p <= 0) return null;
        NodeClient nc = new NodeClient(h, (int) p, ctr);
        Account a = acct;
        if (a != null && a.in() && a.gid.equals(g.gid())) {
            if (tokCache == null) tokCache = a.devToken(st);
            nc.tokGid = a.gid;
            nc.tok = tokCache;
        }
        return nc;
    }

    NodeClient.Invite invite() {
        if (g == null || g.node == null) return null;
        String text = SyncJson.s(g.node, "inv");
        // 账号组（#12）：组是用注册码建的，节点数据丢了时凭注册码重建（PROTOCOL.md 7.2）
        String code = text != null && text.startsWith("kmreg:") ? Account.normCode(text) : null;
        if (code != null) {
            String h = SyncJson.s(g.node, "h");
            long p = SyncJson.n(g.node, "p", 0);
            return h == null || p <= 0 ? null : new NodeClient.Invite(h, (int) p, code.substring(0, 4), utf8(code.substring(4)), text);
        }
        return NodeClient.parseInvite(text);
    }

    /** 账号模式：本机登录了账号，当前组就是账号的组（不换钥、不配对、不用加入码） */
    boolean acctMode() {
        Account a = acct;
        return hasAcct() && g != null && a.gid.equals(g.gid());
    }

    /** 本机有账号（登录过，可能已退出 / 要重新登录）；只记了服务器地址的不算 */
    boolean hasAcct() {
        Account a = acct;
        return a != null && !a.user.isEmpty();
    }

    /** 能不能同步：没有账号的老设备照旧（#1）；有账号就要已登录（重新登录、停用、退出登录后都停） */
    boolean syncAllowed() {
        Account a = acct;
        return !hasAcct() || a.in();
    }

    /** 一轮同步：先处理局域网收到的；节点（旧组信箱 → 拉取 → 信箱 → 换钥 → 推送）；再和局域网里的组员各同步一轮。返回状态 JSON。 */
    public synchronized String syncNow() {
        if (!syncAllowed()) { refreshState(); return stateCache; }
        lanProcess();
        if (g == null) { refreshState(); return stateCache; }
        NodeClient nc = client();
        if (nc != null && now() >= backoffUntil && !skipNode) nodeSync(nc);
        lanSync(false);
        refreshState();
        return stateCache;
    }

    void nodeSync(NodeClient nc) {
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
                    if (e.status == 404 && "nogroup".equals(e.err) && g != null && lastOk > 0 && now() - lastOk > EXPIRE_DAYS * DAY) {
                        // 超过 60 天没同步、节点上的组也没了：多半是别的设备早已换钥、旧组被节点自动删掉。
                        // 不用邀请码重建（那样会建出一个只有自己的组），提示学生重新加入
                        errCode = "expired";
                        errMsg = EXPIRED_MSG;
                        break;
                    }
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
    }

    void fail(NodeClient.NodeError e) {
        String c = e.err;
        if (e.status == 403 && ("relogin".equals(c) || "disabled".equals(c))) { acctLost(c); return; }
        if (e.status == 403 && "acct".equals(c)) { errCode = "acct"; errMsg = "这个同步组已经升级成账号，请用新版 App 登录账号"; return; }
        if (e.status == 403 && "blocked".equals(c)) { errCode = "blocked"; errMsg = "同步节点拒绝了这个同步组"; }
        else if (e.status == 403 && "invite".equals(c)) { errCode = "invite"; errMsg = "邀请码已失效，请向管理员要新的"; }
        else if (e.status == 403 && "replaced".equals(c)) { errCode = "replaced"; errMsg = REPLACED_MSG; }
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
            if (g.needsRekey() && !acctMode()) { rekey(nc); continue; }     // 账号组不换钥（移除设备走通行证，#12）
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
            String ga = SyncJson.s(r, "acct");
            if (current && ga != null && !ga.equals(groupAcct)) {
                groupAcct = ga;
                synchronized (st) { Map<String, Object> all = nodeState(); ns(all, gid).put("acct", ga); saveNodeState(all); }
            }
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

    /** 解开的一个分区（节点、局域网收到的都一样） */
    static final class Sec {
        String gid, from, sec, name, content;
        long rev, t;
    }

    /**
     * 用 key 这把组钥匙解开一个分区 {sec, rev, data}（来源 from）：附加数据绑定组号、来源、分区编号、rev，
     * 分区名要和编号对得上。只读钥匙，局域网服务端的线程也调。解不开返回 null
     */
    Sec decode(Group key, String gid, String from, Map<String, Object> it) {
        String sec = SyncJson.s(it, "sec");
        long rev = SyncJson.n(it, "rev", -1);
        if (from == null || sec == null || key == null) return null;
        byte[] box;
        try { box = b64d(SyncJson.s(it, "data")); } catch (RuntimeException e) { return null; }
        byte[] gz = open(key.encKey(), box, "km-sec|" + gid + "|" + from + "|" + sec + "|" + rev);
        byte[] plain = gz == null ? null : gunzip(gz, MAX_SECTION * 4);
        if (plain == null) return null;
        Map<String, Object> env;
        try { env = SyncJson.obj(str(plain)); } catch (RuntimeException e) { return null; }
        String name = SyncJson.s(env, "n"), content = SyncJson.s(env, "c");
        if (name == null || content == null || !key.secId(name).equals(sec)) return null;
        Sec s = new Sec();
        s.gid = gid;
        s.from = from;
        s.sec = sec;
        s.name = name;
        s.content = content;
        s.rev = rev;
        s.t = SyncJson.n(env, "t", 0);
        return s;
    }

    /** 解开一个分区：group 分区直接并进组名单，其它放进收件箱。返回收件箱有没有变化 */
    boolean receive(String gid, Map<String, Object> it) {
        String from = SyncJson.s(it, "dev");
        if (from == null || from.equals(dev) || g.isRemoved(from)) return false;
        Sec s = decode(g, gid, from, it);
        return s != null && store(s, "节点");
    }

    /** 收下一个解开的分区（同步线程）。组号必须是当前组的（中途换了钥匙的就丢掉，对方下一轮会重发） */
    boolean store(Sec s, String route) {
        Group gg = g;
        if (gg == null || s.from.equals(dev) || gg.isRemoved(s.from) || !gg.gid().equals(s.gid)) return false;
        Long old = seen.get(s.from);
        if (old == null || s.t > old) seen.put(s.from, s.t);
        via.put(s.from, route);
        if (Group.SECTION.equals(s.name)) {
            if (gg.mergeSection(s.content)) { gg.save(st); publishGroup(); }
            return false;
        }
        String rel = fileOf("inbox", s.from + "|" + s.name);
        synchronized (st) {
            Map<String, Object> cur = st.json(rel);
            if (cur != null && SyncJson.n(cur, "rev", 0) >= s.rev) return false;
            st.putJson(rel, SyncJson.of("dev", s.from, "name", s.name, "rev", s.rev, "t", s.t, "box", b64e(st.seal(gzip(utf8(s.content))))));
        }
        return true;
    }

    /** 收件箱里 from 的 name 分区的 rev（没有返回 -1） */
    long inboxRev(String from, String name) {
        Map<String, Object> e = st.json(fileOf("inbox", from + "|" + name));
        return e == null ? -1 : SyncJson.n(e, "rev", -1);
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

    /**
     * 有同步节点、上一轮没出错、没在退避，而且还有没推上去的分区：该来一轮节点同步了。
     * 局域网收到组名单的变化（改名、移除、新组员）、换了钥匙，或推送期间网页又发布了新版本时，本机分区变了却没有人安排节点那一轮，
     * 状态会一直停在「待同步」（#1 第二期真机验收第 2 条）；SyncService 在局域网收发和每轮同步之后用它补一轮。
     * 节点连不上（offline）、出错时不在这里重试，交给前台定时和下次发布
     */
    public synchronized boolean nodeDue() {
        if (g == null || busy || skipNode || !syncAllowed() || !errCode.isEmpty() || now() < backoffUntil || client() == null) return false;
        return pendingCount() > 0;
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

    /**
     * 收到钥匙包，迁到新组：旧组留作 prev（看一段时间信箱），删掉自己在旧组的槽。
     * nc = null：钥匙包是局域网里拿到的（第二期），节点上的事不做（旧组由节点 60 天后自动删）；旧钥匙照样留着，局域网里认旧钥匙用
     */
    void adopt(NodeClient nc, byte[] ngk, long epoch, long gkT) throws IOException {
        String oldGid = g.gid();
        byte[] oldKey = g.nodeKey();
        Group.Prev p = prevOf(oldGid);
        if (p == null) {
            p = new Group.Prev();
            p.gk = g.gk;
            p.epoch = g.epoch;
            p.role = "member";
            p.until = now() + PREV_REKEYER_DAYS * DAY;          // 局域网里认旧钥匙：60 天
            p.nodeUntil = now() + PREV_MEMBER_DAYS * DAY;       // 节点上的旧组信箱：看 14 天
            p.done = nc == null && client() == null;
            synchronized (st) { p.since = SyncJson.n(ns(nodeState(), oldGid), "since", 0); }
            g.prev.add(p);
        }
        boolean conflict = epoch == g.epoch;        // 同一代两把钥匙：取指纹较小的那把
        if (conflict) {
            // 本机对上一代发起的换钥让给对方（对方也给所有组员投了钥匙包），不再负责删旧组
            for (Group.Prev q : g.prev) if ("rekeyer".equals(q.role) && q.epoch == epoch - 1) q.role = "member";
            if (g.own && nc != null) {
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
        lan.keyChanged();
        if (nc != null) { try { nc.call(oldGid, oldKey, dev, "forget", SyncJson.of("dev", dev)); } catch (NodeClient.NodeError ignored) { } }
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
        p.nodeUntil = p.until;
        synchronized (st) { p.since = SyncJson.n(ns(nodeState(), oldGid), "since", 0); }
        for (String d : g.active()) if (!d.equals(dev)) p.pending.add(d);
        g.prev.add(p);
        g.gk = ngk;
        g.epoch = p.epoch + 1;
        g.gkT = Math.max(now(), maxRemoved + 1);
        g.own = true;
        g.save(st);                                     // 先落盘：投信件前崩溃的话，下一轮 checkPrev 会补投
        resetGid(newGid, null);
        lan.keyChanged();
        deliver(nc, p, oldGid, oldKey);
        emit("state", SyncJson.of("rekey", true));
    }

    /**
     * 没有同步节点的组（局域网配对建的）换钥：只在本机生成新钥匙。旧钥匙留 60 天：
     * 局域网里拿旧钥匙来的组员拿到钥匙包（409），被移出的设备拿到「已被移出」的名单（403）
     */
    void rekeyLocal() {
        long maxRemoved = 0;
        for (Group.Member m : g.members.values()) maxRemoved = Math.max(maxRemoved, m.removed);
        Group.Prev p = new Group.Prev();
        p.gk = g.gk;
        p.epoch = g.epoch;
        p.role = "rekeyer";
        p.until = now() + PREV_REKEYER_DAYS * DAY;
        p.nodeUntil = now();
        p.done = true;
        g.prev.add(p);
        g.gk = rand(32);
        g.epoch = p.epoch + 1;
        g.gkT = Math.max(now(), maxRemoved + 1);
        g.own = true;
        g.save(st);
        lan.keyChanged();
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
        // 先删掉本机在旧组的槽（换钥前的数据），再推一份最新名单（用旧钥匙），被移除的设备拉到后就知道自己被移出了
        try { nc.call(oldGid, oldKey, dev, "forget", SyncJson.of("dev", dev)); } catch (NodeClient.NodeError ignored) { }
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
                g.prev.remove(p);                         // 旧组由节点 60 天后自动删

                changed = true;
                continue;
            }
            if (p.done) continue;                         // 节点上的事做完了，旧钥匙只留给局域网认人
            if (now() > p.nodeUntil) { p.done = true; changed = true; continue; }
            if ("rekeyer".equals(p.role)) {
                Set<String> moved = devsOn(g.gid());
                if (p.pending.removeAll(moved)) changed = true;
                for (String d : new ArrayList<>(p.pending)) if (g.member(d) == null || g.member(d).removed > 0) { p.pending.remove(d); changed = true; }
                if (p.pending.isEmpty()) {
                    // 剩下的组员都迁完了。旧组不主动 drop：留着里面那份最新名单，被移除的设备（可能好几天后才开机）
                    // 拉旧组时才能看到「已被移出」；节点在新组建好 60 天后自动删旧组，旧组号记进墓碑，谁也不能再用邀请码重建它。
                    // 本机不再跟踪旧组，但旧钥匙留到 until（第二期：局域网里拿旧钥匙来的设备要靠它认出来）
                    p.done = true;
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
                        } catch (NodeClient.NodeError e2) { p.done = true; }
                    } else p.done = true;
                    changed = true;
                } else if (e.status == 404 || e.status == 403) {
                    p.done = true;
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
        via.clear();
        lan.keyChanged();
        lan.ensure();                  // 不在组里了：不再广播组标记（正可被发现时服务还开着，否则关掉）
        emit("state", SyncJson.of("removed", true));
    }

    // ================================================================ 局域网（第二期）

    /** 平台部分（Android：NSD + Wi-Fi 地址）；kick：局域网服务端收到东西后让同步线程来处理（lanProcess） */
    public void setLan(Lan.Env env, Runnable kick) {
        lan.env = env;
        lan.kick = kick;
    }

    /** 回到前台：在组里（或正可被发现）而且连着 Wi-Fi 时开局域网服务、广播、发现，再和已知组员同步一轮 */
    public synchronized void lanStart() {
        if (!syncAllowed()) { lan.active = false; lan.stop(); refreshState(); return; }     // 退出登录 / 要重新登录：局域网也停
        lan.active = true;
        lanProcess();
        lanSync(false);
        refreshState();
    }

    /** 切到后台：关掉局域网服务、广播、发现（可被发现也一起结束） */
    public synchronized void lanStop() {
        lan.active = false;
        lan.discUntil = 0;
        lan.stop();
        refreshState();
    }

    /** 只和局域网里的组员同步一轮（回到前台、本机发布后、发现组员、前台每 2 分钟） */
    public synchronized void lanSync(boolean force) {
        if (!syncAllowed()) { lan.active = false; lan.stop(); return; }
        lanProcess();
        if (g == null) { lan.ensure(); return; }
        if (g.needsRekey() && client() == null && !acctMode()) rekeyLocal();      // 没有同步节点的组：本机直接换钥，局域网里交钥匙
        if (!lan.ensure()) { refreshState(); return; }
        boolean got = lan.syncAll(force);
        lanProcess();                                               // 收到的名单里本机可能已被移出
        if (got) emit("inbox", SyncJson.of("n", (long) inboxCount()));
        refreshState();
    }

    /** 局域网服务端线程收到的东西：写进收件箱、合并组名单、换钥、记下对方地址；配对收尾；被移出就退出 */
    public synchronized void lanProcess() {
        boolean got = false;
        Lan.In in;
        while ((in = lan.spool.poll()) != null) {
            if (g == null) continue;
            try {
                if ("sec".equals(in.t)) { if (store(in.x, "局域网")) got = true; }
                else if ("key".equals(in.t)) lanTakeKey(in.from, in.gid, in.pkg);
                else if ("addr".equals(in.t)) lan.savePeer(in.from, in.host, in.port);
            } catch (RuntimeException e) { noteError("局域网", e); }
        }
        pairServerFinish();
        if (g != null && g.isRemoved(dev)) becomeRemoved();
        if (lan.active) lan.ensure();
        if (got) emit("inbox", SyncJson.of("n", (long) inboxCount()));
        refreshState();
    }

    /**
     * 局域网里收到组员给的钥匙包（本机换钥时不在，或同一代两把钥匙）。
     * 返回 1 = 换上了新钥匙；0 = 本机的更新（应该把本机的给对方）；2 = 一样；-1 = 解不开 / 来源不对
     */
    int lanTakeKey(String from, String oldGid, String text) {
        if (g == null || text == null || from == null || sk == null) return -1;
        Group.Member fm = g.member(from);
        if (fm == null || fm.pk.isEmpty() || fm.removed > 0) return -1;
        Map<String, Object> k = Group.openKeyPackage(sk, fm.pk, from, dev, oldGid, text);
        if (k == null) return -1;
        byte[] ngk = b64d(SyncJson.s(k, "gk"));
        long ep = SyncJson.n(k, "epoch", 0), gkT = SyncJson.n(k, "gkT", 0);
        if (same(ngk, g.gk)) return 2;
        boolean newer = ep > g.epoch || (ep == g.epoch && Group.fpOf(ngk).compareTo(g.fp()) < 0);
        if (!newer) return 0;
        try { adopt(null, ngk, ep, gkT); } catch (IOException e) { return -1; }
        if (lan.active) lan.ensure();
        return 1;
    }

    /** 组员说本机已被移出（403 removed），附一份用本机当前钥匙加密的名单：验真后并进来，名单上确实移出了就退出 */
    void lanRemovedNotice(byte[] k, String from, Map<String, Object> item) {
        if (g == null || item == null || from == null || !same(k, g.gk)) return;
        Sec s = decode(g, g.gid(), from, item);
        if (s == null || !Group.SECTION.equals(s.name)) return;
        if (g.mergeSection(s.content)) g.save(st);
        if (g.isRemoved(dev)) becomeRemoved();
    }

    /** 测试用：这台设备这一轮不连同步节点（模拟只在局域网里的设备） */
    volatile boolean skipNode;

    /** 测试用：只和一个地址同步一轮（harness 按指定的两台两两同步）。返回对方设备号 */
    synchronized String lanWith(String host, int port) {
        lanProcess();
        if (g == null) return null;
        if (g.needsRekey() && client() == null) rekeyLocal();
        int[] n = new int[1];
        String d = lan.ensure() ? lan.round(host, port, n) : null;
        lanProcess();
        if (n[0] > 0) emit("inbox", SyncJson.of("n", (long) inboxCount()));
        refreshState();
        return d;
    }

    public synchronized boolean lanFound(String service, String host, int port, Map<String, String> txt) {
        boolean r = lan.found(service, host, port, txt);
        refreshState();
        return r;
    }

    public synchronized void lanLost(String service) { lan.lost(service); refreshState(); }

    // ---------------------------------------------------------------- 局域网配对

    /** 进入「可被发现」3 分钟：开局域网服务、广播设备名，列出附近同样在「添加设备」的设备。返回 {ok, addr, exp, list} */
    public synchronized String pairOpen() {
        if (hasAcct()) return res(false, ACCT_ONLY);
        if (dev.isEmpty()) return res(false, "请先回到总入口再打开设备同步（本机还没有设备编号）");
        if (lan.env == null) return res(false, "这台设备用不了局域网配对，请用「扫加入码」");
        String a;
        try { a = lan.env.address(); } catch (RuntimeException e) { a = null; }
        if (a == null) return res(false, "没连 Wi-Fi：局域网配对要两台设备连同一个 Wi-Fi（也可以一台开手机热点，另一台连上去）");
        ensureKey();
        lan.active = true;
        lan.discUntil = now() + Lan.DISCOVERABLE;
        lan.fails.set(0);
        if (!lan.ensure()) {
            lan.discUntil = 0;
            return res(false, lan.err.isEmpty() ? "局域网服务开不了，请稍后再试" : lan.err);
        }
        refreshState();
        Map<String, Object> r = SyncJson.of("ok", true, "addr", lan.addr(), "exp", lan.discUntil, "list", lan.nearbyList());
        emit("pair-open", r);
        return SyncJson.stringify(r);
    }

    /** 退出「可被发现」（点了关闭、3 分钟到了、配对成功） */
    public synchronized void pairClose() {
        lan.discUntil = 0;
        Pairing p = lan.serverPair;
        if (p != null && !p.finished) p.phase = "failed";
        lan.serverPair = null;
        if (lan.active) lan.ensure();
        refreshState();
    }

    /** 定时检查：3 分钟到了就退出可被发现 */
    public synchronized void pairTick() {
        if (lan.discUntil > 0 && now() > lan.discUntil) {
            pairClose();
            emit("pair-close", SyncJson.of("msg", "3 分钟到了，已停止被发现。要再配对，请重新点「添加设备」"));
        }
    }

    /** 点「附近的设备」里的一台 */
    public synchronized String pairWith(String key) {
        if (hasAcct()) return res(false, ACCT_ONLY);
        Map<String, Object> e = key == null ? null : lan.nearby.get(key);
        if (e == null) return res(false, "这台设备已经不在附近了，请刷新后再试，或手动输入它的地址");
        return pairAddr(SyncJson.s(e, "h") + ":" + SyncJson.n(e, "p", 0));
    }

    /** 手动输入对方地址（如 192.168.1.23:47811，不写端口就用 47811）：pair/1、pair/2，两边显示确认码 */
    public synchronized String pairAddr(String text) {
        if (hasAcct()) return res(false, ACCT_ONLY);
        if (dev.isEmpty()) return res(false, "请先回到总入口再打开设备同步（本机还没有设备编号）");
        if (lan.env == null) return res(false, "这台设备用不了局域网配对，请用「扫加入码」");
        java.util.regex.Matcher mt = java.util.regex.Pattern.compile("^\\s*([0-9]{1,3}(?:\\.[0-9]{1,3}){3}|[A-Za-z0-9.-]{1,253})(?:\\s*[:：]\\s*(\\d{1,5}))?\\s*$")
            .matcher(text == null ? "" : text);
        if (!mt.find()) return res(false, "地址格式不对，应该像 192.168.1.23:47811（看对方设备「添加设备」里显示的「本机地址」）");
        int port = mt.group(2) == null ? Lan.PORT : Integer.parseInt(mt.group(2));
        if (port < 1 || port > 65535) return res(false, "端口不对");
        Pairing old = lan.clientPair;
        if (old != null && "wait".equals(old.phase)) old.phase = "failed";
        ensureKey();
        try {
            Pairing p = lan.pairStart(mt.group(1), port);
            lan.clientPair = p;
            lan.asking = p;
            emit("pair-request", SyncJson.of("role", "client", "name", p.peerName, "code", p.code));
            return SyncJson.stringify(SyncJson.of("ok", true, "name", p.peerName, "code", p.code));
        } catch (Lan.PairError e) {
            lan.clientPair = null;
            return res(false, e.getMessage());
        }
    }

    /** 学生核对确认码后点「数字一样，配对」/「不一样」。返回 {ok, msg, poll（要继续问对方）} */
    public synchronized String pairConfirm(boolean ok) {
        Pairing a = lan.asking;                 // 页面上弹的是最近一次的确认码
        if (a != null && "wait".equals(a.phase) && !a.meOk && (a == lan.clientPair || a == lan.serverPair))
            return a.client ? clientConfirm(a, ok) : serverConfirm(a, ok);
        Pairing c = lan.clientPair;
        if (c != null && "wait".equals(c.phase) && !c.meOk) return clientConfirm(c, ok);
        Pairing s = lan.serverPair;
        if (s != null && "wait".equals(s.phase) && !s.meOk) return serverConfirm(s, ok);
        return res(false, "没有等待确认的配对");
    }

    String pairFailed(Pairing p, String role, String msg) {
        p.phase = "failed";
        p.msg = msg;
        if (p.client) lan.clientPair = null;
        emit("pair-result", SyncJson.of("ok", false, "role", role, "name", p.peerName, "msg", msg));
        return res(false, msg);
    }

    /** 给对方的组包：本机的组（或两台都没组时新建的组）加上对方 */
    Group groupFor(Pairing p) {
        Group ng;
        if (g != null) ng = g.copy();
        else {
            ng = Group.create(now());
            ng.addMember(dev, devName, pk, now());
        }
        Group.Member pm = ng.addMember(p.peerDev, p.peerName, p.peerPk, now());
        if (pm.removed > 0) throw new IllegalStateException("「" + p.peerName + "」以前被移出过，不能再用同一个编号加入");
        if (!pm.pk.equals(p.peerPk)) throw new IllegalStateException("「" + p.peerName + "」的钥匙和名单里的不一样，请在那台设备上先退出同步组再配对");
        return ng;
    }

    String serverConfirm(Pairing p, boolean ok) {
        synchronized (p) {
            if (!ok) {
                p.phase = "denied";
                p.msg = "已取消，没有配对";
                emit("pair-result", SyncJson.of("ok", false, "role", "server", "name", p.peerName, "msg", p.msg));
                lan.pairFail(p.msg);
                return res(true, p.msg);
            }
            if (p.expired(now())) return pairFailed(p, "server", "配对超时了（2 分钟），请重新配对");
            if (p.giver) {
                if (g == null) return pairFailed(p, "server", "这台设备已经不在同步组里了，请重新配对");
                try { p.outPkg = p.sealPkg(groupFor(p).packageJson()); }
                catch (IllegalStateException e) { return pairFailed(p, "server", e.getMessage()); }
            }
            p.meOk = true;
        }
        pairServerFinish();
        return SyncJson.stringify(SyncJson.of("ok", true, "msg", p.finished ? p.msg : "等「" + p.peerName + "」上也点「数字一样」…"));
    }

    /** 服务端（B）：两边都确认了 → 有组的把对方加进名单，没组的装上对方给的组包 */
    void pairServerFinish() {
        Pairing p = lan.serverPair;
        if (p == null || p.finished) return;
        synchronized (p) {
            if (!p.meOk || !p.peerOk || !"wait".equals(p.phase)) return;
            p.finished = true;
        }
        boolean first;
        if (p.giver) {
            if (g == null) { pairFailed(p, "server", "这台设备已经不在同步组里了，请重新配对"); return; }
            g.addMember(p.peerDev, p.peerName, p.peerPk, now());
            g.save(st);
            publishGroup();
            first = false;
        } else {
            String pkg = p.inPkg == null ? null : p.openPkg(p.inPkg);
            if (pkg == null || !install(pkg)) { pairFailed(p, "server", "对方给的同步钥匙解不开，请重新配对"); return; }
            first = true;
        }
        p.phase = "done";
        p.msg = "已和「" + p.peerName + "」配对";
        lan.discUntil = 0;                 // 配对成功就不再被发现
        lan.ensure();
        refreshState();
        emit("pair-result", SyncJson.of("ok", true, "role", "server", "name", p.peerName, "first", first, "msg", p.msg + (first ? "，正在第一次同步…" : "")));
    }

    String clientConfirm(Pairing p, boolean ok) {
        if (!ok) {
            p.phase = "denied";
            lan.clientPair = null;
            try { lan.pairSend(p, SyncJson.of("deny", true)); } catch (IOException ignored) { }
            emit("pair-result", SyncJson.of("ok", false, "role", "client", "name", p.peerName, "msg", "已取消，没有配对"));
            return res(true, "已取消，没有配对");
        }
        if (p.expired(now())) return pairFailed(p, "client", "配对超时了（2 分钟），请重新配对");
        if (p.giver) {
            if (g == null) ensureKey();
            try {
                p.newGroup = groupFor(p);
                p.outPkg = p.sealPkg(p.newGroup.packageJson());
            } catch (IllegalStateException e) { return pairFailed(p, "client", e.getMessage()); }
        }
        p.meOk = true;
        Map<String, Object> body = SyncJson.of("mac", b64e(p.myMac()));
        if (p.outPkg != null) body.put("pkg", b64e(p.outPkg));
        return clientExchange(p, body);
    }

    String clientExchange(Pairing p, Map<String, Object> body) {
        Lan.R r;
        try { r = lan.pairSend(p, body); }
        catch (IOException e) { return SyncJson.stringify(SyncJson.of("ok", true, "poll", true, "msg", "连接不稳，正在重试…")); }
        String state = SyncJson.s(r.j, "state");
        if (r.status != 200 || "denied".equals(state)) {
            String msg = r.status == 403 ? "配对没有通过校验（可能有人冒充），已取消。请重新配对"
                : r.status == 410 ? "对方那边的配对已经结束了，请重新配对"
                : "「" + p.peerName + "」上点了「不一样」，没有配对";
            p.phase = "denied";
            return pairFailed(p, "client", msg);
        }
        if ("ok".equals(state)) return clientFinish(p, r.j);
        return SyncJson.stringify(SyncJson.of("ok", true, "poll", true, "msg", "等「" + p.peerName + "」上也点「数字一样」…"));
    }

    /** 客户端（A）点了确认、对方还没点：适配层定时来问。返回下一次的间隔毫秒，-1 = 不用再问 */
    public synchronized long pairPoll() {
        Pairing p = lan.clientPair;
        if (p == null || !"wait".equals(p.phase) || !p.meOk) return -1;
        if (p.expired(now())) { pairFailed(p, "client", "「" + p.peerName + "」没有在 2 分钟内确认，已取消。请重新配对"); return -1; }
        return SyncJson.b(SyncJson.obj(clientExchange(p, SyncJson.map())), "poll") ? 1500 : -1;
    }

    String clientFinish(Pairing p, Map<String, Object> j) {
        byte[] mb;
        try { mb = b64d(SyncJson.s(j, "mac")); } catch (RuntimeException e) { mb = null; }
        if (!p.checkPeerMac(mb)) return pairFailed(p, "client", "配对没有通过校验（可能有人冒充），已取消。请重新配对");
        boolean first;
        if (p.giver) {
            if (g == null) {
                if (p.newGroup == null || p.newGroup.member(dev) == null) return pairFailed(p, "client", "配对出错了，请重新配对");
                g = p.newGroup;
                notice = "";
                saveDevice();
                g.save(st);
                resetGid(g.gid(), null);
                publishGroup();
                lan.keyChanged();
                first = true;
            } else {
                g.addMember(p.peerDev, p.peerName, p.peerPk, now());
                g.save(st);
                publishGroup();
                first = false;
            }
        } else {
            String pkg = null;
            try { pkg = p.openPkg(b64d(SyncJson.s(j, "pkg"))); } catch (RuntimeException ignored) { }
            if (pkg == null || !install(pkg)) return pairFailed(p, "client", "对方给的同步钥匙解不开，请重新配对");
            first = true;
        }
        p.phase = "done";
        p.finished = true;
        lan.clientPair = null;
        lan.savePeer(p.peerDev, p.peerHost, p.peerPort);
        lan.discUntil = 0;                 // 配对成功就不再被发现
        lan.ensure();
        refreshState();
        String msg = "已和「" + p.peerName + "」配对" + (first ? "，正在第一次同步…" : "");
        emit("pair-result", SyncJson.of("ok", true, "role", "client", "name", p.peerName, "first", first, "msg", msg));
        return SyncJson.stringify(SyncJson.of("ok", true, "msg", msg));
    }

    /** 装上别的设备给的组包（加入码、局域网配对都用）：名单里要有本机、而且是本机的公钥 */
    boolean install(String pkg) {
        Group ng;
        try { ng = Group.fromPackage(pkg); } catch (RuntimeException e) { return false; }
        Group.Member me = ng.member(dev);
        if (me == null || !pk.equals(me.pk)) return false;
        g = ng;
        notice = "";
        saveDevice();
        g.save(st);
        resetGid(g.gid(), null);
        publishGroup();
        lan.keyChanged();
        lan.ensure();
        return true;
    }

    // ================================================================ 建组、节点设置

    /** 扫邀请码：没加入组 → 建组（第一台设备）；已在组里 → 换成新的邀请码/地址（「重新扫邀请码」）。返回 {ok, msg} */
    public synchronized String nodeJoin(String text) {
        if (hasAcct()) return res(false, ACCT_ONLY);
        NodeClient.Invite inv = NodeClient.parseInvite(text);
        if (inv == null) return res(false, "这不是同步节点的邀请码（应以 kmnode:1? 开头）");
        if (dev.isEmpty()) return res(false, "请先回到总入口再打开设备同步（本机还没有设备编号）");
        ensureKey();
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
            if (e.status == 403 && "replaced".equals(e.err)) return res(false, REPLACED_MSG);
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
        if (fresh) { lan.keyChanged(); lan.ensure(); }
        refreshState();
        emit("state", SyncJson.of("joined", fresh));
        return res(true, fresh ? "已建好同步组" : "已更新同步节点");
    }

    /** 不再使用同步节点（第一期只有节点这一条路，相当于暂停同步；再扫邀请码恢复） */
    public synchronized String nodeRemove() {
        if (hasAcct()) return res(false, ACCT_ONLY);
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
        if (hasAcct()) return res(false, ACCT_ONLY);
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
        if (hasAcct()) return res(false, ACCT_ONLY);
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
        if (lan.active) {
            try { lan.syncAll(true); } catch (RuntimeException ignored) { }   // 局域网里在线的组员也马上拿到名单
        }
        g = null;
        join = null;
        st.wipeGroup();
        seen.clear();
        via.clear();
        lan.keyChanged();
        lan.ensure();
        notice = "";
        saveDevice();
        refreshState();
        return res(true, "已退出同步组，本机学习数据还在");
    }

    // ================================================================ 加入码

    /** A：生成加入码，往转交点 a 边放 ① */
    public synchronized String joinOpen() {
        if (hasAcct()) return res(false, ACCT_ONLY);
        if (g == null) return res(false, "还没加入同步组");
        ensureKey();
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

    public String joinState() {
        Join j = join;
        return j == null ? "{}" : SyncJson.stringify(j.state(now()));
    }

    /** C：扫加入码（或手输地址和 26 位码），取 ①、放 ② */
    public synchronized String joinScan(String text) {
        if (hasAcct()) return res(false, ACCT_ONLY);
        if (g != null) return res(false, "这台设备已经在一个同步组里，请先「退出同步组」（本机数据保留）再加入");
        if (dev.isEmpty()) return res(false, "请先回到总入口再打开设备同步（本机还没有设备编号）");
        Join j = Join.parseGuest(text, now());
        if (j == null) return res(false, "这不是加入码（应以 kmjoin:1? 开头，或「地址:端口 · 26 位码」）");
        ensureKey();
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
            if (e.status == 413) return res(false, "这张加入码已经用不了了（被用过或被占满），请在另一台设备上重新生成");
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
            if (e.status == 413) {
                // 转交点被塞满了（PROTOCOL.md：每个转交点最多 8 条、16KB），组包放不进去：这张加入码用不了了
                j.phase = "closed";
                j.msg = "这张加入码已失效（被别的消息占满了），请点「添加设备」重新生成一张";
                return res(false, j.msg);
            }
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
                // 解不开的一律忽略、继续等（路上的旁观者只知道转交点编号、不知道 s，塞进来的垃圾解不开），
                // 直到解开一条或 10 分钟到期。只看节点允许的最多条数、每条超过 4KB 的不解（② 不到 300 字节）
                Map<String, Object> c = null;
                int n = 0, size = 0;
                for (byte[] b : bs) {
                    if (++n > Join.RDV_MSGS) break;
                    size += b.length;
                    if (b.length > 4096) continue;
                    c = j.openHello(b, 2);
                    if (c != null) break;
                }
                if (c == null) {
                    // 节点上每个转交点最多 8 条、合计 16KB（PROTOCOL.md）：被垃圾占满时真设备也放不进来，只能换一张加入码
                    if (bs.size() + 1 >= Join.RDV_MSGS || size + 400 > Join.RDV_BYTES) {
                        j.phase = "full";
                        j.msg = "这张加入码被陌生消息占满了（可能有人在捣乱），请重新生成一张";
                        emit("join-result", SyncJson.of("ok", false, "role", "host", "msg", j.msg));
                        return -1;
                    }
                    return 3000;
                }
                if (1 + bs.size() >= Join.RDV_MSGS) {
                    // 认出了真设备，但转交点已经满了（a 边的 ① + b 边 7 条）：确认后组包 ③ 放不进去，不如现在就说清楚
                    j.phase = "full";
                    j.msg = "这张加入码已失效（被别的消息占满了），请点「添加设备」重新生成一张";
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
        if (!install(pkg)) return;
        j.phase = "done";
        j.msg = "已加入「" + j.peerName + "」的同步组";
        refreshState();
        emit("join-result", SyncJson.of("ok", true, "role", "guest", "first", true, "name", j.peerName, "msg", j.msg));
    }

    /** 本机出错（写不了盘、Keystore 出错）：只让设备同步显示出错，不影响别的 */
    public void noteError(String what, Throwable e) {
        try {
            localErr = "设备同步出错（" + what + "）：" + (e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()) + "。不影响学习，可以稍后再试";
            busy = false;
            refreshState();
        } catch (Throwable ignored) { }
    }

    /** 本机写文件 / Keystore 出过错：一直显示到下一次本机写成功（网络同步成功也不清掉，否则改动没存下来却显示「已同步」） */
    volatile String localErr = "";

    // ================================================================ 账号（#12 第一期）

    /** 登录 / 注册用的服务器：本机设过的 → 当前组的同步节点 → 打包时的默认地址。返回 {host, port}，都没有返回 null */
    String[] loginServer() {
        Account a = acct;
        if (a != null && !a.h.isEmpty() && a.p > 0) return new String[]{a.h, String.valueOf(a.p)};
        Group gg = g;
        if (gg != null && gg.node != null && !SyncJson.b(gg.node, "off") && SyncJson.s(gg.node, "h") != null)
            return new String[]{SyncJson.s(gg.node, "h"), String.valueOf(SyncJson.n(gg.node, "p", 0))};
        if (!cfgHost.isEmpty() && cfgPort > 0) return new String[]{cfgHost, String.valueOf(cfgPort)};
        return null;
    }

    /** 登录页用的状态（只读 volatile 字段，不等同步线程的锁） */
    public String acctState() {
        Account a = acct;
        Group gg = g;
        String[] sv = loginServer();
        String state = a == null || a.user.isEmpty() ? "none" : a.state;
        String prefill = a != null && !a.user.isEmpty() && !a.in() ? a.user : groupAcct;
        return SyncJson.stringify(SyncJson.of("state", state, "user", a == null ? "" : a.user, "last", a == null ? "" : a.last,
            "prefill", prefill == null ? "" : prefill, "inGroup", gg != null, "groupAcct", groupAcct,
            "groupNode", gg != null && gg.node != null && !SyncJson.b(gg.node, "off"),
            "server", sv == null ? null : SyncJson.of("h", sv[0], "p", Long.parseLong(sv[1])),
            "defServer", cfgHost.isEmpty() ? null : SyncJson.of("h", cfgHost, "p", (long) cfgPort),
            "dev", !dev.isEmpty(), "recovery", !recPub.isEmpty(), "inbox", (long) inboxCount()));
    }

    void progress(String step, String text) { emit("acct-progress", SyncJson.of("step", step, "text", text)); }

    static String serverMsg(NodeClient.NodeError e) {
        if (e.status == 429 && "paused".equals(e.err)) return "密码错太多次，这个账号暂停登录 15 分钟，请稍后再试";
        if (e.status == 429) return "操作太频繁，请过 10 分钟再试";
        if (e.status == 403 && "login".equals(e.err)) return "用户名或密码不对";
        if (e.status == 403 && "disabled".equals(e.err)) return "这个账号已被管理员停用，请联系管理员。本机的学习记录还在。";
        if (e.status == 403 && "code".equals(e.err)) return "注册码不对或已失效（过期、用过、作废），请向管理员要新的";
        if (e.status == 409 && "user".equals(e.err)) return "这个用户名已经有人用了，换一个";
        if (e.status == 403 && "blocked".equals(e.err)) return "服务器拒绝了这个同步组，请联系管理员";
        if (e.status == 413) return "服务器已满，请联系管理员";
        if (e.status == 503) return "服务器还不支持账号，请联系管理员升级服务器";
        if (e.status == 404 && "path".equals(e.err)) return "服务器版本太旧，不支持账号，请联系管理员升级到 km-sync 1.4.0";
        return "服务器出错（" + e.status + " " + e.err + "），请稍后再试";
    }

    static String offlineMsg(String[] sv) { return "连不上服务器（" + sv[0] + ":" + sv[1] + "）"; }

    static Map<String, Object> fail(String code, String msg) { return SyncJson.of("ok", false, "code", code, "msg", msg); }

    /** 登录 / 注册成功：保存账号、装好组，通知网页（发布本机全部分区、同步一轮）和外壳（离开登录页） */
    void acctDone(String user, String gid, long pwVer, String h, long p, byte[] devToken) {
        Account a = new Account();
        Account old = acct;
        a.user = user;
        a.gid = gid;
        a.state = "in";
        a.since = now();
        a.pwVer = pwVer;
        a.h = h;
        a.p = p;
        a.last = user;
        a.grace = old == null ? 0 : old.grace;
        a.setDevToken(st, devToken);
        a.save(st);
        acct = a;
        tokCache = devToken;
        groupAcct = user;
        errCode = "";
        errMsg = "";
        backoffUntil = 0;
        notice = "";
        saveDevice();
        publishGroup();
        lan.keyChanged();
        lan.ensure();
        refreshState();
        emit("state", SyncJson.of("joined", true));
        emit("account", SyncJson.of("state", "in", "user", user));
    }

    /** 本机离开当前组（换到账号的组）：只删本机的组记录，不换钥、不通知组员；收件箱留着，登录后照常合并进来 */
    void leaveLocal() {
        g = null;
        join = null;
        for (String rel : st.list("out")) st.delete(rel);
        st.delete("group.json");
        st.delete("node.json");
        st.delete("lan.json");
        seen.clear();
        via.clear();
        groupAcct = "";
        lan.keyChanged();
    }

    /**
     * 注册：{user, pw, code, device?}。三种情况（方案第四节）：
     *   没有组 → 新建组 + 账号（本机数据成为账号的初始数据）；
     *   在 #1 同步组里、组的节点就是这台服务器 → 把这个组升级成账号（不新建组、不搬数据，组里其它设备记为老设备）；
     *   在只有局域网的组里（或组的节点是别的服务器）→ 用这个组的钥匙在服务器上建组 + 账号。
     * 失败时本机任何文件都不动（account.json 只在成功后写）。返回 {ok, msg, code?}
     */
    public synchronized String acctRegister(String json) {
        Map<String, Object> q;
        try { q = SyncJson.obj(json); } catch (RuntimeException e) { return SyncJson.stringify(fail("bad", "参数不对")); }
        Map<String, Object> d = SyncJson.m(q.get("device"));
        if (d != null) setDevice(SyncJson.s(d, "id"), SyncJson.s(d, "name"));
        String user = Account.nz(SyncJson.s(q, "user")).trim().toLowerCase(java.util.Locale.ROOT);
        String pw = Account.nz(SyncJson.s(q, "pw"));
        String codeText = Account.nz(SyncJson.s(q, "code"));
        Account cur0 = acct;
        if (cur0 != null && cur0.in()) return SyncJson.stringify(fail("in", "这台设备已经登录了账号「" + cur0.user + "」"));
        String bad = Account.userProblem(user);
        if (bad == null) bad = Account.pwProblem(user, pw);
        if (bad != null) return SyncJson.stringify(fail("rule", bad));
        String code = Account.normCode(codeText);
        if (code == null) return SyncJson.stringify(fail("code", "注册码格式不对：应该是 12 位字母数字，像 ABCD-EFGH-JKMN"));
        if (dev.isEmpty()) return SyncJson.stringify(fail("dev", "本机还没有设备编号，请稍等几秒再试"));
        if (recPub.isEmpty()) return SyncJson.stringify(fail("cfg", "这个安装包缺少账号恢复公钥，不能注册，请联系管理员"));
        String[] sv = Account.codeServer(codeText);
        if (sv == null) sv = loginServer();
        if (sv == null) return SyncJson.stringify(fail("server", "还没设置服务器地址"));
        String h = sv[0];
        int p = Integer.parseInt(sv[1]);
        ensureKey();
        Group cur = g;
        boolean bind = cur != null && cur.node != null && !SyncJson.b(cur.node, "off")
            && h.equals(SyncJson.s(cur.node, "h")) && p == SyncJson.n(cur.node, "p", 0);
        String regText = "kmreg:1?c=" + Account.fmtCode(code) + "&h=" + h + "&p=" + p;
        Group ng;
        if (bind) ng = cur.copy();
        else {
            ng = cur != null ? cur.copy() : Group.create(now());
            if (cur == null) ng.addMember(dev, devName, pk, now());
            ng.node = SyncJson.of("h", h, "p", (long) p, "inv", regText, "t", Math.max(now(), cur == null || cur.node == null ? 0 : SyncJson.n(cur.node, "t", 0) + 1));
        }
        String gid = ng.gid();
        progress("auth", "正在注册账号…");
        byte[] salt = rand(16);
        byte[][] k = Account.keys(pw, salt, Account.ITERS);
        byte[] authKey = k[0], wrapKey = k[1];
        try {
            String bundle = Account.bundle(user, ng);
            byte[] ik = Account.codeIk(code);
            Map<String, Object> body = SyncJson.of("user", user, "code", Account.fmtCode(code), "gid", gid, "salt", b64e(salt), "iters", (long) Account.ITERS,
                "abox", b64e(Account.abox(ik, user, gid, authKey)), "wrap_pw", b64e(Account.wrapPw(wrapKey, user, bundle)),
                "wrap_admin", b64e(Account.wrapAdmin(recPub, recKid, user, bundle)), "dev", dev, "devName", devName, "appVer", appVer);
            if (!bind) body.putAll(NodeClient.wrap(ik, gid, ng.nodeKey()));
            NodeClient nc = new NodeClient(h, p, ctr);
            Map<String, Object> r;
            try {
                r = nc.acctRegister(body, bind ? gid : null, ng.nodeKey(), dev);
            } catch (NodeClient.NodeError e) {
                if (!(bind && e.status == 404 && "nogroup".equals(e.err))) throw e;
                rebuild(nc);                                   // 节点上这个组没了（节点数据丢过）：先用组的邀请码重建
                r = nc.acctRegister(body, gid, ng.nodeKey(), dev);
            }
            byte[] tok = Account.openTok(authKey, user, dev, SyncJson.s(r, "tok"));
            if (tok == null) return SyncJson.stringify(fail("server", "服务器返回的通行证解不开，请重试"));
            if (!bind) {
                g = ng;
                g.save(st);
                resetGid(gid, SyncJson.s(r, "gen"));
            }
            acctDone(user, gid, SyncJson.n(r, "pw_ver", 1), h, p, tok);
            long legacy = SyncJson.n(r, "legacy", 0);
            return SyncJson.stringify(SyncJson.of("ok", true, "user", user, "mode", bind ? "bind" : cur == null ? "new" : "lan", "legacy", legacy,
                "msg", bind ? "已注册账号「" + user + "」：这台设备所在的同步组升级成了账号" + (legacy > 0 ? "，同组另外 " + legacy + " 台设备升级后输入密码就能登录" : "")
                    : "已注册账号「" + user + "」，本机的学习记录成为账号的数据"));
        } catch (IOException e) {
            return SyncJson.stringify(fail("offline", offlineMsg(sv)));
        } catch (NodeClient.NodeError e) {
            if (e.status == 409 && "bound".equals(e.err)) {
                String u = SyncJson.s(e.body, "user");
                if (u != null) groupAcct = u;
                return SyncJson.stringify(SyncJson.of("ok", false, "code", "bound", "user", u,
                    "msg", "这台设备所在的同步组已经注册过账号「" + u + "」，请直接登录这个账号"));
            }
            return SyncJson.stringify(fail(e.err, serverMsg(e)));
        } finally {
            Account.wipe(authKey, wrapKey);
        }
    }

    /**
     * 登录：{user, pw, device?}。挑战应答，密码不上网。成功后：
     *   本机已在这个账号的组里（同组的另一台设备升级后登录）→ 只拿通行证，数据不动；
     *   否则（新设备、没有组、在别的组里）→ 本机离开原来的组（只删本机记录），装上账号的组，从头拉取全部，网页合并（不覆盖）。
     * 失败时本机任何文件都不动。返回 {ok, msg, code?, same?}
     */
    public synchronized String acctLogin(String json) {
        Map<String, Object> q;
        try { q = SyncJson.obj(json); } catch (RuntimeException e) { return SyncJson.stringify(fail("bad", "参数不对")); }
        Map<String, Object> d = SyncJson.m(q.get("device"));
        if (d != null) setDevice(SyncJson.s(d, "id"), SyncJson.s(d, "name"));
        String user = Account.nz(SyncJson.s(q, "user")).trim().toLowerCase(java.util.Locale.ROOT);
        String pw = Account.nz(SyncJson.s(q, "pw"));
        if (Account.userProblem(user) != null || pw.isEmpty()) return SyncJson.stringify(fail("login", "用户名或密码不对"));
        if (dev.isEmpty()) return SyncJson.stringify(fail("dev", "本机还没有设备编号，请稍等几秒再试"));
        String[] sv = loginServer();
        if (sv == null) return SyncJson.stringify(fail("server", "还没设置服务器地址"));
        String h = sv[0];
        int p = Integer.parseInt(sv[1]);
        NodeClient nc = new NodeClient(h, p, ctr);
        progress("auth", "正在验证密码…");
        byte[] authKey = null, wrapKey = null;
        try {
            Map<String, Object> pre = nc.acctPre(user);
            byte[] salt = b64d(SyncJson.s(pre, "salt"));
            int iters = (int) SyncJson.n(pre, "iters", Account.ITERS);
            if (iters < 100000 || iters > 2000000 || salt.length != 16) return SyncJson.stringify(fail("server", "服务器返回的参数不对"));
            byte[][] k = Account.keys(pw, salt, iters);
            authKey = k[0];
            wrapKey = k[1];
            String nonce = SyncJson.s(pre, "nonce");
            Map<String, Object> r = nc.acctLogin(SyncJson.of("user", user, "nonce", nonce, "dev", dev, "devName", devName, "appVer", appVer,
                "proof", Account.proof(authKey, user, nonce, dev)));
            Map<String, Object> b = Account.openPw(wrapKey, user, b64d(SyncJson.s(r, "wrap_pw")));
            byte[] tok = Account.openTok(authKey, user, dev, SyncJson.s(r, "tok"));
            if (b == null || tok == null) return SyncJson.stringify(fail("server", "账号数据解不开，请联系管理员"));
            byte[] gk = b64d(SyncJson.s(b, "gk"));
            String gid = Group.gidOf(gk);
            if (!gid.equals(SyncJson.s(r, "gid"))) return SyncJson.stringify(fail("server", "账号数据和服务器上的组对不上，请联系管理员"));
            boolean same = g != null && g.gid().equals(gid);
            if (same) {
                if (g.node == null || SyncJson.b(g.node, "off") || !h.equals(SyncJson.s(g.node, "h")) || p != SyncJson.n(g.node, "p", 0)) {
                    Map<String, Object> n = SyncJson.of("h", h, "p", (long) p, "inv", g.node == null ? SyncJson.s(b, "invite") : SyncJson.s(g.node, "inv"),
                        "t", Math.max(now(), g.node == null ? 0 : SyncJson.n(g.node, "t", 0) + 1));
                    g.node = n;
                    g.save(st);
                }
            } else {
                progress("download", "正在下载账号数据…");
                ensureKey();
                if (g != null) leaveLocal();
                Group ng = new Group();
                ng.gk = gk;
                ng.epoch = SyncJson.n(b, "epoch", 1);
                ng.gkT = SyncJson.n(b, "gkT", 0);
                ng.addMember(dev, devName, pk, now());
                ng.node = SyncJson.of("h", h, "p", (long) p, "inv", Account.nz(SyncJson.s(b, "invite")), "t", now());
                g = ng;
                g.save(st);
                resetGid(gid, null);
            }
            acctDone(user, gid, SyncJson.n(r, "pw_ver", 1), h, p, tok);
            return SyncJson.stringify(SyncJson.of("ok", true, "user", user, "same", same,
                "msg", same ? "已登录「" + user + "」：这台设备的数据和账号是同一份" : "已登录「" + user + "」，正在下载账号数据"));
        } catch (IOException e) {
            return SyncJson.stringify(fail("offline", offlineMsg(sv)));
        } catch (NodeClient.NodeError e) {
            return SyncJson.stringify(fail(e.err, serverMsg(e)));
        } catch (RuntimeException e) {
            return SyncJson.stringify(fail("server", "服务器返回的数据不对（" + e.getMessage() + "）"));
        } finally {
            Account.wipe(authKey, wrapKey);
        }
    }

    /** 退出登录（只在「账号与同步」页）：本机学习数据和组都保留，停止同步，回到登录页；再输密码登录后照常 */
    public synchronized String acctLogout() {
        Account a = acct;
        if (a == null || !a.in()) return res(false, "还没登录");
        a.state = "out";
        a.save(st);
        tokCache = null;
        lan.active = false;
        lan.stop();
        refreshState();
        emit("account", SyncJson.of("state", "out", "user", a.user));
        return res(true, "已退出登录，本机学习记录还在");
    }

    /** 节点说这台设备要重新登录（管理员重设密码、移除设备）或账号停用：停止同步，回登录页；不删任何学习数据，也不删组密钥 */
    void acctLost(String why) {
        Account a = acct;
        errCode = why;
        errMsg = "disabled".equals(why) ? "这个账号已被管理员停用，请联系管理员。本机的学习记录还在。"
            : "需要重新登录：管理员重设了密码或移除了这台设备。本机的学习记录还在。";
        if (a != null && a.in() && g != null && a.gid.equals(g.gid())) {
            a.state = why;
            a.save(st);
            tokCache = null;
            emit("account", SyncJson.of("state", why, "user", a.user));
        }
    }

    /**
     * 改服务器地址（「主机:端口」）：登录页改登录用的服务器；已登录时同时改当前组的同步节点（服务器搬家后），
     * 组名单里的节点设置会随同步传给同组其它设备（按时间取新的）。
     */
    public synchronized String acctServer(String text) {
        String t = text == null ? "" : text.trim().replace('：', ':');
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("^(?:https?://)?([A-Za-z0-9.-]{1,253})(?::(\\d{1,5}))?/?$").matcher(t);
        if (!m.matches()) return res(false, "地址格式不对，应该像 192.168.1.20:8787");
        String h = m.group(1);
        int p = m.group(2) == null ? 8787 : Integer.parseInt(m.group(2));
        if (p < 1 || p > 65535) return res(false, "端口要在 1–65535 之间");
        Account a = acct;
        if (a == null) a = new Account();          // 还没登录过：只记下服务器地址（用户名为空 = 没有账号）
        a.h = h;
        a.p = p;
        a.save(st);
        acct = a;
        if (a.in() && g != null) {
            g.node = SyncJson.of("h", h, "p", (long) p, "inv", g.node == null ? "" : Account.nz(SyncJson.s(g.node, "inv")),
                "t", Math.max(now(), g.node == null ? 0 : SyncJson.n(g.node, "t", 0) + 1));
            g.save(st);
            publishGroup();
            errCode = "";
            errMsg = "";
            backoffUntil = 0;
        }
        refreshState();
        return SyncJson.stringify(SyncJson.of("ok", true, "msg", "服务器地址改为 " + h + ":" + p, "h", h, "p", (long) p));
    }

    /** App 版本（外壳设置，注册 / 登录时告诉服务器，管理员在账号列表里看到） */
    volatile String appVer = "";

    public void setAppVersion(String v) { appVer = v == null ? "" : v; }

    // ================================================================ 状态

    public String state() { return stateCache; }

    void refreshState() {
        Map<String, Object> s = SyncJson.map();
        s.put("inGroup", g != null);
        s.put("notice", notice);
        Account ac = acct;
        s.put("acct", hasAcct() ? SyncJson.of("user", ac.user, "state", ac.state, "mode", acctMode()) : null);     // #12
        s.put("me", SyncJson.of("dev", dev, "name", devName));
        List<Object> ms = new ArrayList<>();
        int inbox = 0, pending = 0, lanPending = 0;
        boolean nodeOn = false;
        if (g != null) {
            nodeOn = g.node != null && !SyncJson.b(g.node, "off");
            for (Map.Entry<String, Group.Member> e : g.members.entrySet()) {
                Group.Member m = e.getValue();
                if (m.removed > 0) continue;
                Long last = seen.get(e.getKey());
                String route = via.get(e.getKey());
                ms.add(SyncJson.of("dev", e.getKey(), "name", m.name, "me", e.getKey().equals(dev), "last", last == null ? 0L : last,
                    "via", route != null ? route : nodeOn ? "节点" : "局域网", "near", !e.getKey().equals(dev) && lan.isOnline(e.getKey())));
            }
            Map<String, Object> n = g.node;
            s.put("node", n == null ? null : SyncJson.of("h", SyncJson.s(n, "h"), "p", SyncJson.n(n, "p", 0), "off", SyncJson.b(n, "off"),
                "last", lastOk, "error", errCode, "msg", errMsg));
            s.put("epoch", g.epoch);
            inbox = inboxCount();
            pending = pendingCount();
            if (lan.env != null) lanPending = lan.pendingCount();
        }
        s.put("members", ms);
        s.put("inbox", (long) inbox);
        // 有同步节点时「待推」看节点；只有局域网时看有没有交给过任何一台组员
        s.put("pending", (long) (nodeOn ? pending : lanPending));
        long lanOk = lan.lastOk;
        boolean lanRecent = lanOk > 0 && now() - lanOk < 10 * 60 * 1000L;
        String eMsg = errMsg;
        if (!localErr.isEmpty() && (errCode.isEmpty() || errCode.equals("offline"))) eMsg = localErr;
        String status;
        if (g == null) status = "none";
        else if (busy) status = "syncing";
        else if (!localErr.isEmpty() && errCode.isEmpty()) status = "error";
        else if (errCode.equals("offline")) {
            // 节点连不上，但局域网刚同步过、本机改动都交出去了：照样算「已同步」，提示里说清楚
            if (lanRecent && lanPending == 0 && inbox == 0 && localErr.isEmpty()) { status = "ok"; eMsg = "同步节点连不上，局域网同步照常"; }
            else status = "offline";
        }
        else if (!errCode.isEmpty()) status = "error";
        else if ((nodeOn ? pending : lanPending) > 0 || inbox > 0) status = "pending";
        else status = lastOk > 0 || lanOk > 0 ? "ok" : "pending";
        s.put("status", status);
        s.put("error", eMsg);
        s.put("lastOk", Math.max(lastOk, lanOk));
        if (lan.env != null) {
            String a = lan.addr();
            Map<String, Object> l = SyncJson.of("on", !a.isEmpty(), "addr", a, "disc", lan.discoverable() ? lan.discUntil : 0L,
                "online", lan.onlineList(), "nearby", lan.nearbyList(), "lastOk", lanOk);
            if (!lan.err.isEmpty()) l.put("error", lan.err);
            s.put("lan", l);
        }
        String old = stateCache;
        stateCache = SyncJson.stringify(s);
        if (!stateCache.equals(old)) emit("state", s);
    }
}
