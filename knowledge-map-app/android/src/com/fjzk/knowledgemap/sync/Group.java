package com.fjzk.knowledgemap.sync;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.TreeSet;

import static com.fjzk.knowledgemap.sync.SyncCrypto.*;

/**
 * 同步组（#1 方案 v2 第三节）：组密钥 gk + 代号 epoch + 生成时间 gkT，组名单，节点设置；换钥后留下的旧组。
 * 派生钥都用 HKDF-SHA256 从 gk 现算、不落盘：encKey（分区加密）、nodeKey（节点签名）、idKey（分区编号、内容编号）、gid（节点上的组号）。
 * 组名单和节点设置作为 Java 自己管的 group 分区，加密后随别的分区一起同步；合并规则（逐成员）：
 *   名字按 (nameT, name) 取较新；移除时间取较大（一旦移除就一直是移除）；加入时间取较小；节点设置按 (t, 文本) 取较新。
 * 这些规则幂等、交换、结合，几台设备按任意顺序合并结果都一样。
 */
public final class Group {
    public static final String SECTION = "group";
    static final byte[] SALT = utf8("km-sync-v1");

    public static final class Member {
        public String name = "";
        public long nameT, joined, removed;
        public String pk = "", by = "";

        Map<String, Object> json() {
            return SyncJson.of("name", name, "nameT", nameT, "pk", pk, "joined", joined, "removed", removed, "by", by);
        }

        static Member from(Map<String, Object> m) {
            Member x = new Member();
            x.name = nz(SyncJson.s(m, "name"));
            x.nameT = SyncJson.n(m, "nameT", 0);
            x.pk = nz(SyncJson.s(m, "pk"));
            x.joined = SyncJson.n(m, "joined", 0);
            x.removed = SyncJson.n(m, "removed", 0);
            x.by = nz(SyncJson.s(m, "by"));
            return x;
        }

        Member copy() { return from(json()); }

        /** 合并：返回是否有变化 */
        boolean merge(Member o) {
            String before = SyncJson.canon(json());
            if (o.nameT > nameT || (o.nameT == nameT && o.name.compareTo(name) > 0)) { name = o.name; nameT = o.nameT; }
            if (pk.isEmpty() || (!o.pk.isEmpty() && o.pk.compareTo(pk) < 0)) pk = o.pk;
            if (o.joined > 0 && (joined == 0 || o.joined < joined)) joined = o.joined;
            if (o.removed > removed || (o.removed == removed && o.by.compareTo(by) > 0)) { removed = o.removed; by = o.by; }
            return !before.equals(SyncJson.canon(json()));
        }
    }

    /**
     * 换钥后的旧组：rekeyer = 本机发起的换钥，等组员迁完；member = 本机是跟着迁过来的，只看一段时间信箱。
     * done = 节点上的事做完了（组员都迁了 / 不再看信箱），但旧钥匙留到 until：局域网里还拿旧钥匙来的设备，
     * 要靠它认出来——落后的组员给钥匙包，被移出的设备告诉它「已被移出」（第二期）
     */
    public static final class Prev {
        public byte[] gk;
        public long epoch, until, since, nodeUntil;
        public boolean done;
        public String role = "member";
        public final TreeSet<String> pending = new TreeSet<>();
        public final List<String> mails = new ArrayList<>();       // rekeyer：已投的信件编号

        public String gid() { return gidOf(gk); }

        Map<String, Object> json() {
            return SyncJson.of("gk", b64e(gk), "epoch", epoch, "until", until, "since", since, "role", role,
                "pending", new ArrayList<Object>(pending), "mails", new ArrayList<Object>(mails), "done", done, "nodeUntil", nodeUntil);
        }

        static Prev from(Map<String, Object> m) {
            Prev p = new Prev();
            p.gk = b64d(SyncJson.s(m, "gk"));
            p.epoch = SyncJson.n(m, "epoch", 0);
            p.until = SyncJson.n(m, "until", 0);
            p.nodeUntil = SyncJson.n(m, "nodeUntil", p.until);       // 第一期留下的：节点上的事一直做到 until
            p.done = SyncJson.b(m, "done");
            p.since = SyncJson.n(m, "since", 0);
            p.role = nz(SyncJson.s(m, "role"));
            List<Object> l = SyncJson.l(m.get("pending"));
            if (l != null) for (Object o : l) p.pending.add(String.valueOf(o));
            l = SyncJson.l(m.get("mails"));
            if (l != null) for (Object o : l) p.mails.add(String.valueOf(o));
            return p;
        }
    }

    public byte[] gk;
    public long epoch, gkT;
    public final TreeMap<String, Member> members = new TreeMap<>();
    /** 节点设置 {h, p, inv（邀请码原文）, t} ；没有节点时为空 */
    public Map<String, Object> node;
    public final List<Prev> prev = new ArrayList<>();
    /** 当前组是本机换钥建的（同一代碰上另一把指纹更小的钥匙时，迁走后把它删掉） */
    public boolean own;

    static String nz(String s) { return s == null ? "" : s; }

    // ------------------------------------------------------------ 派生钥

    public static String gidOf(byte[] gk) { return hex(hkdf(gk, SALT, "gid", 16)); }
    public static byte[] nodeKeyOf(byte[] gk) { return hkdf(gk, SALT, "node", 32); }
    public String gid() { return gidOf(gk); }
    public byte[] encKey() { return hkdf(gk, SALT, "enc", 32); }
    public byte[] nodeKey() { return nodeKeyOf(gk); }
    public byte[] idKey() { return hkdf(gk, SALT, "id", 32); }
    public static String fpOf(byte[] gk) { return hex(head(sha256(cat(utf8("km-fp"), gk)), 8)); }
    public String fp() { return fpOf(gk); }
    /** 局域网签名钥（第二期）：组员之间直连的每个请求都用它签名 */
    public static byte[] lanKeyOf(byte[] gk) { return hkdf(gk, SALT, "lan", 32); }
    /**
     * 局域网广播里的组标记：HMAC(lanKey, 日期) 前 4 字节，每天变一次，只有自己组的设备认得出来（NSD 服务名本身是随机的 km-xxxx）
     * day = UTC 日期 yyyy-MM-dd
     */
    public static String tagOf(byte[] gk, String day) { return hex(head(hmac(lanKeyOf(gk), "tag|" + day), 4)); }

    /**
     * 只读快照：每次 save() 时在改动的那个线程里复制一份。局域网服务端的线程只读快照（组号、各代钥匙、名单），
     * 不碰正在被同步线程修改的 g，也不用等同步线程的锁（两台设备同时互相同步时不会互相卡住）
     */
    public volatile Group snap;

    /** 分区在节点上的编号：看不出分区名 */
    public String secId(String name) { return b64e(head(hmac(idKey(), "sec|" + name), 16)); }

    /** 内容编号：两台设备内容一样，cid 就一样 */
    public String cid(String content) { return b64e(head(hmac(idKey(), "cid|" + content), 16)); }

    public static Group create(long now) {
        Group g = new Group();
        g.gk = rand(32);
        g.epoch = 1;
        g.gkT = now;
        return g;
    }

    // ------------------------------------------------------------ 名单

    public Member member(String dev) { return members.get(dev); }

    public boolean isRemoved(String dev) {
        Member m = members.get(dev);
        return m != null && m.removed > 0;
    }

    public List<String> active() {
        List<String> r = new ArrayList<>();
        for (Map.Entry<String, Member> e : members.entrySet()) if (e.getValue().removed == 0) r.add(e.getKey());
        return r;
    }

    /** 统一换钥规则：名单里有人的移除时间晚于当前组密钥的生成时间 */
    public boolean needsRekey() {
        for (Member m : members.values()) if (m.removed > gkT) return true;
        return false;
    }

    public Member addMember(String dev, String name, String pk, long now) {
        Member m = members.get(dev);
        if (m == null) { m = new Member(); members.put(dev, m); }
        if (m.joined == 0) m.joined = now;
        if (!name.isEmpty() && !name.equals(m.name)) { m.name = name; m.nameT = Math.max(now, m.nameT + 1); }
        if (m.pk.isEmpty()) m.pk = pk;
        return m;
    }

    // ------------------------------------------------------------ group 分区（随同步发出去的部分）

    public String sectionContent() {
        Map<String, Object> ms = new TreeMap<>();
        for (Map.Entry<String, Member> e : members.entrySet()) ms.put(e.getKey(), e.getValue().json());
        return SyncJson.canon(SyncJson.of("members", ms, "node", node));
    }

    /** 合并别的设备发来的 group 分区，返回是否有变化 */
    public boolean mergeSection(String content) {
        Map<String, Object> o;
        try { o = SyncJson.obj(content); } catch (RuntimeException e) { return false; }
        boolean changed = false;
        Map<String, Object> ms = SyncJson.m(o.get("members"));
        if (ms != null) for (Map.Entry<String, Object> e : ms.entrySet()) {
            Map<String, Object> mm = SyncJson.m(e.getValue());
            if (mm == null || !e.getKey().matches("[A-Za-z0-9_-]{1,64}")) continue;
            Member in = Member.from(mm), cur = members.get(e.getKey());
            if (cur == null) { members.put(e.getKey(), in); changed = true; }
            else if (cur.merge(in)) changed = true;
        }
        Map<String, Object> nd = SyncJson.m(o.get("node"));
        if (nd != null && newerNode(nd, node)) { node = nd; changed = true; }
        return changed;
    }

    static boolean newerNode(Map<String, Object> a, Map<String, Object> b) {
        if (b == null) return true;
        long ta = SyncJson.n(a, "t", 0), tb = SyncJson.n(b, "t", 0);
        if (ta != tb) return ta > tb;
        return SyncJson.canon(a).compareTo(SyncJson.canon(b)) > 0;
    }

    // ------------------------------------------------------------ 本机保存（整份用 KeyWrap 包起来，文件里没有明文组密钥）

    Map<String, Object> json() {
        Map<String, Object> ms = new TreeMap<>();
        for (Map.Entry<String, Member> e : members.entrySet()) ms.put(e.getKey(), e.getValue().json());
        List<Object> ps = new ArrayList<>();
        for (Prev p : prev) ps.add(p.json());
        return SyncJson.of("v", 1L, "gk", b64e(gk), "epoch", epoch, "gkT", gkT, "members", ms, "node", node, "prev", ps, "own", own);
    }

    static Group from(Map<String, Object> m) {
        Group g = new Group();
        g.gk = b64d(SyncJson.s(m, "gk"));
        g.epoch = SyncJson.n(m, "epoch", 1);
        g.gkT = SyncJson.n(m, "gkT", 0);
        Map<String, Object> ms = SyncJson.m(m.get("members"));
        if (ms != null) for (Map.Entry<String, Object> e : ms.entrySet()) g.members.put(e.getKey(), Member.from(SyncJson.m(e.getValue())));
        g.node = SyncJson.m(m.get("node"));
        g.own = SyncJson.b(m, "own");
        List<Object> ps = SyncJson.l(m.get("prev"));
        if (ps != null) for (Object o : ps) g.prev.add(Prev.from(SyncJson.m(o)));
        return g;
    }

    public Group copy() { return from(SyncJson.obj(SyncJson.stringify(json()))); }

    public void save(SyncStore st) {
        byte[] box = st.seal(utf8(SyncJson.stringify(json())));
        st.putJson("group.json", SyncJson.of("v", 1L, "box", b64e(box)));
        snap = copy();
    }

    /** 没有组、或 Keystore 钥匙丢了（解不开）返回 null */
    public static Group load(SyncStore st) {
        Map<String, Object> f = st.json("group.json");
        if (f == null || SyncJson.s(f, "box") == null) return null;
        try {
            byte[] plain = st.open(b64d(SyncJson.s(f, "box")));
            if (plain == null) return null;
            Group g = from(SyncJson.obj(str(plain)));
            g.snap = g.copy();
            return g;
        } catch (RuntimeException e) { return null; }       // 文件坏了：当作钥匙读不出来
    }

    // ------------------------------------------------------------ 组包（加入时交给新设备）、钥匙包（换钥后经信箱交给组员）

    /** 组包：gk、epoch、gkT、名单、节点设置（含邀请码） */
    public String packageJson() {
        Map<String, Object> ms = new TreeMap<>();
        for (Map.Entry<String, Member> e : members.entrySet()) ms.put(e.getKey(), e.getValue().json());
        return SyncJson.canon(SyncJson.of("gk", b64e(gk), "epoch", epoch, "gkT", gkT, "members", ms, "node", node));
    }

    public static Group fromPackage(String json) {
        Map<String, Object> m = SyncJson.obj(json);
        Group g = from(m);
        g.prev.clear();
        g.own = false;
        if (g.gk == null || g.gk.length != 32) throw new IllegalArgumentException("组包不对");
        return g;
    }

    static byte[] pairKey(java.security.PrivateKey mine, String theirPk, byte[] salt, String info) {
        return hkdf(ecdh(mine, b64d(theirPk)), salt, info, 32);
    }

    /** 钥匙包：用 ECDH(本机私钥, 组员公钥) 派生的钥加密新的 gk */
    public static String keyPackage(java.security.PrivateKey mine, String from, String to, String toPk, String oldGid, byte[] gk, long epoch, long gkT) {
        byte[] k = pairKey(mine, toPk, utf8(oldGid), "km-rekey");
        String inner = SyncJson.canon(SyncJson.of("gk", b64e(gk), "epoch", epoch, "gkT", gkT));
        byte[] box = seal(k, utf8(inner), "km-key|" + oldGid + "|" + from + "|" + to);
        return SyncJson.canon(SyncJson.of("v", 1L, "t", "key", "from", from, "to", to, "epoch", epoch, "box", b64e(box)));
    }

    /** 解开钥匙包；返回 {gk, epoch, gkT} 或 null */
    public static Map<String, Object> openKeyPackage(java.security.PrivateKey mine, String fromPk, String from, String me, String oldGid, String text) {
        try {
            Map<String, Object> m = SyncJson.obj(text);
            if (!"key".equals(SyncJson.s(m, "t")) || !from.equals(SyncJson.s(m, "from")) || !me.equals(SyncJson.s(m, "to"))) return null;
            byte[] k = pairKey(mine, fromPk, utf8(oldGid), "km-rekey");
            byte[] p = open(k, b64d(SyncJson.s(m, "box")), "km-key|" + oldGid + "|" + from + "|" + me);
            if (p == null) return null;
            Map<String, Object> r = SyncJson.obj(str(p));
            byte[] gk = b64d(SyncJson.s(r, "gk"));
            return gk.length == 32 ? r : null;
        } catch (RuntimeException e) { return null; }
    }

    public List<String> sortedMembers() {
        List<String> r = new ArrayList<>(members.keySet());
        Collections.sort(r);
        return r;
    }
}
