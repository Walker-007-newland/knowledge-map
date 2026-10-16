package com.fjzk.knowledgemap.sync;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * #1 第一期电脑测试工具：在电脑上起几个同步内核实例（SyncManager），连本地节点（harness_node.py 在临时目录起 km_sync_node）
 * 或真实节点，自动跑建组、加入码、拉推、换钥、重建、封禁、断线等场景，逐条打印 ✓/✗。
 *
 *   编译运行见 android/test/README-sync.md（或直接 powershell -File android/test/run-sync-harness.ps1）
 *   java ... com.fjzk.knowledgemap.sync.SyncHarness                 本地节点，全部场景
 *   java ... SyncHarness --remote 43.142.41.27:8787                 真实节点（临时测试邀请码），跑验收第 2、5、9 条，结束时删组、作废邀请码
 *   java ... SyncHarness --serve 8790                               浏览器测试页 tests/sync-harness.html 的后端（真 km-data.js 合并）
 *
 * 这里的「设备数据」在命令行模式下用一个简单的可合并结构代替 km-data.js（每个分区是 {键: [时间, 值]}，按 (时间, 值) 取较大），
 * 只为验证传输、加密、增量、换钥；真正的 KMData.merge 合并在 --serve 模式由浏览器页跑。
 */
public class SyncHarness {
    static String python = "python";
    static File root;          // 仓库根（工作区）
    static File tmp;
    static final List<Object[]> RESULTS = new ArrayList<>();

    // ------------------------------------------------------------ 结果

    static boolean check(boolean ok, String name, Object detail) {
        RESULTS.add(new Object[]{ok, name});
        System.out.println((ok ? "  ✓ " : "  ✗ ") + name + (ok || detail == null ? "" : "  —— " + detail));
        return ok;
    }

    static boolean check(boolean ok, String name) { return check(ok, name, null); }

    static void section(String t) { System.out.println("\n■ " + t); }

    // ------------------------------------------------------------ 节点助手

    static final class NodeCtl {
        Process p;
        BufferedReader in;
        Writer out;
        String host;
        int port;
        final boolean remote;

        NodeCtl(String remoteAddr) throws IOException {
            remote = remoteAddr != null;
            List<String> cmd = new ArrayList<>(Arrays.asList(python, "-X", "utf8", new File(root, "knowledge-map-app/android/test/harness_node.py").getPath()));
            if (remote) { cmd.add("--remote"); cmd.add(remoteAddr); }
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectError(System.getenv("KM_HARNESS_VERBOSE") != null ? ProcessBuilder.Redirect.INHERIT : ProcessBuilder.Redirect.DISCARD);
            pb.environment().put("PYTHONIOENCODING", "utf-8");
            p = pb.start();
            in = new BufferedReader(new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8));
            out = new OutputStreamWriter(p.getOutputStream(), StandardCharsets.UTF_8);
            Map<String, Object> hello = SyncJson.m(read());
            host = SyncJson.s(hello, "host");
            port = (int) SyncJson.n(hello, "port", 0);
            if (remote) { String[] hp = remoteAddr.split(":"); host = hp[0]; port = Integer.parseInt(hp[1]); }
        }

        Object read() throws IOException {
            String line = in.readLine();
            if (line == null) throw new IOException("节点助手退出了");
            Map<String, Object> r = SyncJson.obj(line);
            if (!SyncJson.b(r, "ok")) throw new IOException("节点助手：" + SyncJson.s(r, "err"));
            return r.get("data");
        }

        synchronized Object cmd(Object... kv) {
            try {
                out.write(SyncJson.stringify(SyncJson.of(kv)) + "\n");
                out.flush();
                return read();
            } catch (IOException e) { throw new IllegalStateException(e.getMessage()); }
        }

        Map<String, Object> cmdM(Object... kv) { return SyncJson.m(cmd(kv)); }

        void close() {
            try { out.write("{\"cmd\":\"quit\"}\n"); out.flush(); read(); } catch (Exception ignored) { }
            p.destroy();
        }
    }

    // ------------------------------------------------------------ 测试设备

    static final class TestClock implements SyncManager.Clock {
        long offset;
        public long now() { return System.currentTimeMillis() + offset; }
    }

    /** 模拟 Android Keystore：钥匙放在实例目录之外，实例目录里只有包过的密文 */
    static final class TestWrap implements SyncStore.KeyWrap {
        final byte[] key;
        TestWrap(File f) throws IOException {
            if (f.exists()) key = Files.readAllBytes(f.toPath());
            else { key = SyncCrypto.rand(32); f.getParentFile().mkdirs(); Files.write(f.toPath(), key); }
        }
        public byte[] seal(byte[] p) { return SyncCrypto.seal(key, p, "km-test-wrap"); }
        public byte[] open(byte[] b) { return SyncCrypto.open(key, b, "km-test-wrap"); }
    }

    static final class Dev {
        final String id, name;
        final File dir;
        final TestClock clock = new TestClock();
        final TestWrap kw;
        SyncManager m;
        /** 本机「学习数据」：分区名 → {键: [时间, 值]} */
        final TreeMap<String, TreeMap<String, List<Object>>> data = new TreeMap<>();
        final List<String[]> events = new ArrayList<>();

        Dev(String id, String name) throws IOException {
            this.id = id;
            this.name = name;
            dir = new File(tmp, "dev-" + id);
            kw = new TestWrap(new File(tmp, "keystore/" + id + ".key"));
            restart();
        }

        void restart() {
            m = new SyncManager(new SyncStore(dir, kw), clock);
            m.setEvents((t, j) -> { synchronized (events) { events.add(new String[]{t, j}); } });
            m.setDevice(id, name);
        }

        void put(String sec, String key, Object val) {
            data.computeIfAbsent(sec, k -> new TreeMap<>()).put(key, new ArrayList<Object>(Arrays.asList(clock.now(), val)));
        }

        String content(String sec) {
            Map<String, Object> o = new TreeMap<>();
            for (Map.Entry<String, List<Object>> e : data.get(sec).entrySet()) o.put(e.getKey(), e.getValue());
            return SyncJson.canon(o);
        }

        int publish() {
            List<Object> secs = new ArrayList<>();
            for (String s : data.keySet()) secs.add(SyncJson.of("name", s, "content", content(s)));
            return m.publish(SyncJson.stringify(SyncJson.of("device", SyncJson.of("id", id, "name", name), "sections", secs)));
        }

        /** 在「安全页面」上合并收件箱：取出、并进本机数据、确认、重新发布 */
        int mergeInbox() {
            List<Object> taken = SyncJson.l(SyncJson.parse(m.take()));
            List<Object> acks = new ArrayList<>();
            for (Object o : taken) {
                Map<String, Object> t = SyncJson.m(o);
                String sec = SyncJson.s(t, "name");
                Map<String, Object> in = SyncJson.obj(SyncJson.s(t, "content"));
                TreeMap<String, List<Object>> mine = data.computeIfAbsent(sec, k -> new TreeMap<>());
                for (Map.Entry<String, Object> e : in.entrySet()) {
                    List<Object> v = SyncJson.l(e.getValue());
                    List<Object> cur = mine.get(e.getKey());
                    if (cur == null || cmp(v, cur) > 0) mine.put(e.getKey(), v);
                }
                acks.add(SyncJson.of("id", SyncJson.s(t, "id"), "rev", SyncJson.n(t, "rev", 0)));
            }
            m.ack(SyncJson.stringify(acks));
            publish();
            return taken.size();
        }

        static int cmp(List<Object> a, List<Object> b) {
            long ta = ((Number) a.get(0)).longValue(), tb = ((Number) b.get(0)).longValue();
            if (ta != tb) return Long.compare(ta, tb);
            return SyncJson.canon(a.get(1)).compareTo(SyncJson.canon(b.get(1)));
        }

        /** 回到总入口：发布 → 同步 → 合并收件箱（合并后重新发布，再推一次） */
        String sync() {
            publish();
            m.syncNow();
            if (mergeInbox() > 0) m.syncNow();
            return m.state();
        }

        Map<String, Object> state() { return SyncJson.obj(m.state()); }

        String lastEvent(String type) {
            synchronized (events) {
                for (int i = events.size() - 1; i >= 0; i--) if (events.get(i)[0].equals(type)) return events.get(i)[1];
            }
            return null;
        }
    }

    // ------------------------------------------------------------ 请求统计

    static final AtomicInteger REQS = new AtomicInteger();
    static final Map<String, Integer> PATHS = new TreeMap<>();
    static volatile String crashOn;          // 发这个动作的请求时模拟进程被杀
    static volatile Object[] lastReq;

    static final class Killed extends Error { Killed() { super("模拟进程被杀"); } }

    static void installTap() {
        NodeClient.tap = (host, port, method, path, headers, body) -> {
            REQS.incrementAndGet();
            String act = path.replaceAll("^/v1/g/[0-9a-f]+/", "").replaceAll("^/v1/rdv/.*", "rdv");
            synchronized (PATHS) { PATHS.merge(act, 1, Integer::sum); }
            lastReq = new Object[]{host, port, method, path, headers == null ? null : new HashMap<>(headers), body};
            String c = crashOn;
            if (c != null && c.equals(act)) { crashOn = null; throw new Killed(); }
        };
    }

    static int count(String act) { synchronized (PATHS) { return PATHS.getOrDefault(act, 0); } }

    static void resetCounts() { REQS.set(0); synchronized (PATHS) { PATHS.clear(); } }

    // ------------------------------------------------------------ 组操作

    static final Map<String, byte[]> GIDS = new LinkedHashMap<>();      // 用过的组（清理用）

    static void track(Dev... ds) {
        for (Dev d : ds) {
            Group g = d.m.g;
            if (g == null) continue;
            GIDS.put(g.gid(), g.nodeKey());
            for (Group.Prev p : g.prev) GIDS.put(p.gid(), Group.nodeKeyOf(p.gk));
        }
    }

    /** A 显示加入码，C 扫码，A 取到请求，确认；返回两边确认码是否相同 */
    static boolean join(Dev host, Dev guest) {
        Map<String, Object> o = SyncJson.obj(host.m.joinOpen());
        if (!SyncJson.b(o, "ok")) { check(false, "生成加入码", o); return false; }
        Map<String, Object> s = SyncJson.obj(guest.m.joinScan(SyncJson.s(o, "text")));
        if (!SyncJson.b(s, "ok")) { check(false, "扫加入码", s); return false; }
        host.m.joinPoll();
        Map<String, Object> hs = SyncJson.obj(host.m.joinState());
        boolean same = SyncJson.s(hs, "code") != null && SyncJson.s(hs, "code").equals(SyncJson.s(s, "code")) && "confirm".equals(SyncJson.s(hs, "phase"));
        Map<String, Object> c = SyncJson.obj(host.m.joinConfirm(true));
        if (!SyncJson.b(c, "ok")) { check(false, "确认加入", c); return false; }
        guest.m.joinPoll();
        if (!guest.m.inGroup()) { check(false, "新设备装好组包", guest.m.joinState()); return false; }
        host.m.syncNow();
        return same;
    }

    static boolean eq(Dev x, Dev y) { return SyncJson.canon(x.data).equals(SyncJson.canon(y.data)); }

    static boolean sameCids(Dev... ds) {
        Map<String, String> a = ds[0].m.cids();
        for (Dev d : ds) if (!d.m.cids().equals(a)) return false;
        return !a.isEmpty();
    }

    static String cidDiff(Dev... ds) {
        StringBuilder b = new StringBuilder();
        for (Dev d : ds) b.append(d.id).append('=').append(d.m.cids()).append("  ");
        return b.toString();
    }

    static void rounds(int n, Dev... ds) { for (int i = 0; i < n; i++) for (Dev d : ds) d.sync(); }

    static String invite(NodeCtl node) { return SyncJson.s(node.cmdM("cmd", "invite"), "qr"); }

    static String fixPort(String qr, NodeCtl node) {
        // 本地节点、或经 SSH 隧道连真实节点（127.0.0.1:端口）：邀请码里的公网地址换成实际连的地址，设备流量也走隧道
        if (node.remote && !node.host.equals("127.0.0.1")) return qr;
        return qr.replaceAll("h=[^&]*&p=\\d+", "h=" + node.host + "&p=" + node.port);
    }

    // ================================================================ 场景

    static void scenarioNoGroup() throws IOException {
        section("1. 没加入同步组：不发任何请求、不写同步文件");
        resetCounts();
        Dev x = new Dev("devX0", "没加入的平板");
        x.put("s1", "k", 1);
        int n = x.publish();
        x.m.syncNow();
        x.mergeInbox();
        check(n == 0 && REQS.get() == 0, "发布、同步、取收件箱都不发请求", REQS.get() + " 个请求");
        File[] outs = new File(x.dir, "out").listFiles();
        check(!x.dir.exists(), "同步目录 files/kmsync/ 都没建（不写任何文件、不生成设备密钥）");
        check("none".equals(SyncJson.s(x.state(), "status")) && !SyncJson.b(x.state(), "inGroup"), "状态是「没加入」", x.m.state());
        check(!SyncJson.b(SyncJson.obj(x.m.joinOpen()), "ok") && REQS.get() == 0, "没加入时不能生成加入码，也不发请求");
    }

    /** 会出错的 KeyWrap：fail=true 时 seal 抛异常（模拟 Keystore 出错）、open 返回 null */
    static final class FlakyWrap implements SyncStore.KeyWrap {
        volatile boolean fail;
        final byte[] key = SyncCrypto.rand(32);
        public byte[] seal(byte[] p) { if (fail) throw new IllegalStateException("Keystore 加密失败：模拟"); return SyncCrypto.seal(key, p, "w"); }
        public byte[] open(byte[] b) { return fail ? null : SyncCrypto.open(key, b, "w"); }
    }

    static final class Rec implements SyncService.Sink, SyncService.Log {
        final List<String[]> events = new ArrayList<>();
        final List<String> warns = new ArrayList<>();
        public synchronized void event(String t, String j) { events.add(new String[]{t, j}); }
        public synchronized void warn(String m, Throwable e) { warns.add(m + "：" + e); }
        synchronized String last(String t) { for (int i = events.size() - 1; i >= 0; i--) if (events.get(i)[0].equals(t)) return events.get(i)[1]; return null; }
    }

    /** 调一下，返回有没有抛出 */
    static String noThrow(Runnable r) {
        try { r.run(); return null; } catch (Throwable t) { return String.valueOf(t); }
    }

    static void scenarioFaults(NodeCtl node) throws IOException {
        section("0. 同步出任何错都不抛给 App：没加入组不写文件、不碰 Keystore；Keystore / 写盘出错只让设备同步不可用");
        // 没加入组：构造、设备编号、发布、同步、取收件箱都不写 files/kmsync/、不调 KeyWrap
        File d0 = new File(tmp, "svc-none");
        FlakyWrap w0 = new FlakyWrap();
        w0.fail = true;                         // 一碰 Keystore 就抛：证明没加入组时根本不碰
        Rec r0 = new Rec();
        SyncService s0 = new SyncService(d0, w0, System::currentTimeMillis, r0, r0);
        s0.drain();
        s0.setDevice("devN0", "没加入的平板");
        s0.publish("{\"device\":{\"id\":\"devN0\",\"name\":\"x\"},\"sections\":[{\"name\":\"s1\",\"content\":\"{}\"}]}");
        s0.ack("[{\"id\":\"inbox/00000000000000000000.json\",\"rev\":1}]");
        s0.syncNow();
        s0.onResume();
        s0.onPause();
        String st0 = s0.state(), tk0 = s0.take();
        s0.drain();
        check(!d0.exists(), "没加入组：构造、setDevice、publish、ack、syncNow 之后 files/kmsync/ 目录都不存在");
        check(r0.warns.isEmpty() && st0.contains("\"inGroup\":false") && tk0.equals("[]"), "没加入组：Keystore 坏了也不碰它，状态正常、收件箱为空", r0.warns);

        // 构造时就坏：同步目录是个文件（写不了盘）+ Keystore 坏 + 文件内容是乱码
        File d1 = new File(tmp, "svc-broken");
        d1.mkdirs();
        Files.write(new File(d1, "device.json").toPath(), "{坏的".getBytes(StandardCharsets.UTF_8));
        Files.write(new File(d1, "group.json").toPath(), "{\"v\":1,\"box\":\"!!!\"}".getBytes(StandardCharsets.UTF_8));
        Files.write(new File(d1, "out").toPath(), new byte[]{1});                 // out 是文件，不是目录：写分区必失败
        Rec r1 = new Rec();
        String thrown = noThrow(() -> {
            SyncService s1 = new SyncService(d1, w0, System::currentTimeMillis, r1, r1);
            s1.drain();
            s1.setDevice("devB1", "坏掉的平板");
            s1.publish("{坏的 json");
            s1.ack("{坏的");
            s1.syncNow();
            s1.nodeJoin(fixPort(invite(node), node));
            s1.joinScan("kmjoin:1?h=127.0.0.1&p=1&s=ABCDEFGHIJKLMNOPQRSTUVWXYZ");
            s1.joinOpen();
            s1.joinConfirm(true);
            s1.rename("x", "y");
            s1.remove("x");
            s1.leave();
            s1.drain();
            String st = s1.state();
            SyncJson.obj(st);
            s1.take();
            s1.joinState();
        });
        String nj = null;
        synchronized (r1) { for (String[] e : r1.events) if (e[0].equals("action-result") && e[1].contains("nodeJoin")) nj = e[1]; }
        check(thrown == null, "构造时 Keystore 坏、文件是乱码、写不了盘：构造和全部接口都不抛出", thrown);
        check(nj != null && nj.contains("\"ok\":false") && !r1.warns.isEmpty(), "建组失败只回一句中文原因（" + (nj == null ? "" : SyncJson.s(SyncJson.obj(nj), "msg")) + "），出错记了日志（" + r1.warns.size() + " 条）", r1.warns);

        // 已加入组后才坏：Keystore 出错 / 写盘出错
        File d2 = new File(tmp, "svc-later");
        FlakyWrap w2 = new FlakyWrap();
        Rec r2 = new Rec();
        SyncService s2 = new SyncService(d2, w2, System::currentTimeMillis, r2, r2);
        s2.setDevice("devL2", "后来坏的平板");
        s2.nodeJoin(fixPort(invite(node), node));
        s2.drain();
        s2.publish("{\"device\":{\"id\":\"devL2\",\"name\":\"后来坏的平板\"},\"sections\":[{\"name\":\"s1\",\"content\":\"{\\\"a\\\":1}\"}]}");
        s2.syncNow();
        s2.drain();
        boolean joined = SyncJson.b(SyncJson.obj(s2.state()), "inGroup");
        track2(s2);
        w2.fail = true;
        thrown = noThrow(() -> {
            s2.setDevice("devL2", "改了名字");                     // saveDevice → seal 抛
            s2.publish("{\"device\":{\"id\":\"devL2\"},\"sections\":[{\"name\":\"s1\",\"content\":\"{\\\"a\\\":2}\"}]}");   // putOut → seal 抛
            s2.ack("[{\"id\":\"inbox/00000000000000000000.json\",\"rev\":1}]");
            s2.syncNow();
            s2.drain();
        });
        Map<String, Object> st2 = SyncJson.obj(s2.state());
        check(joined && thrown == null && !r2.warns.isEmpty(), "加入组后 Keystore 出错：setDevice、publish、ack、syncNow 都不抛出，记了日志", thrown + " " + r2.warns);
        check("error".equals(SyncJson.s(st2, "status")) && SyncJson.s(st2, "error").contains("不影响学习"), "状态显示「设备同步出错……不影响学习」", st2);
        w2.fail = false;
        File out = new File(d2, "out");
        for (File f : out.listFiles()) f.delete();
        out.delete();
        Files.write(out.toPath(), new byte[]{1});                                  // 写盘失败
        thrown = noThrow(() -> {
            s2.publish("{\"device\":{\"id\":\"devL2\"},\"sections\":[{\"name\":\"s1\",\"content\":\"{\\\"a\\\":3}\"}]}");
            s2.ack("[]");
            s2.syncNow();
            s2.drain();
            s2.state();
            s2.take();
        });
        check(thrown == null, "加入组后写盘失败：publish、ack、syncNow 都不抛出", thrown);
        // hello：节点连不上时建组 / 同步只回中文提示
        File d3 = new File(tmp, "svc-offline");
        Rec r3 = new Rec();
        SyncService s3 = new SyncService(d3, new FlakyWrap(), System::currentTimeMillis, r3, r3);
        s3.setDevice("devO3", "连不上的平板");
        thrown = noThrow(() -> { s3.nodeJoin("kmnode:1?h=127.0.0.1&p=1&i=abcd2345&s=ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"); s3.drain(); });
        String r3e = r3.last("action-result");
        check(thrown == null && r3e != null && r3e.contains("连不上"), "节点连不上（hello 不通）：建组回「同步节点连不上…」，不抛出", r3e);
        new File(d2, "out").delete();

        // group.json 本身是乱码：要明确提示；下次建组时旧的 group.json、out/、inbox/ 全部清掉，不带进新组
        Dev k = new Dev("devK", "文件坏了的平板");
        k.m.setDevice("devK", "文件坏了的平板");
        new File(k.dir, "out").mkdirs();
        new File(k.dir, "inbox").mkdirs();
        Files.write(new File(k.dir, "group.json").toPath(), "这不是 JSON".getBytes(StandardCharsets.UTF_8));
        Files.write(new File(k.dir, "out/0123456789abcdef0123.json").toPath(), "{\"name\":\"旧组的分区\",\"rev\":1}".getBytes(StandardCharsets.UTF_8));
        Files.write(new File(k.dir, "inbox/0123456789abcdef0123.json").toPath(), "{\"dev\":\"old\",\"name\":\"旧组的收件\",\"rev\":1}".getBytes(StandardCharsets.UTF_8));
        Files.write(new File(k.dir, "node.json").toPath(), "{\"g\":{\"aaaa\":{\"since\":99}}}".getBytes(StandardCharsets.UTF_8));
        k.restart();
        Map<String, Object> ks = k.state();
        check(!SyncJson.b(ks, "inGroup") && SyncJson.s(ks, "notice").contains("同步文件损坏") && SyncJson.s(ks, "notice").contains("重新加入"),
            "group.json 是乱码：明确提示「同步文件损坏了……需要重新加入同步组」", k.m.state());
        Map<String, Object> kj = SyncJson.obj(k.m.nodeJoin(fixPort(invite(node), node)));
        track(k);
        boolean clean = !new File(k.dir, "out/0123456789abcdef0123.json").exists() && !new File(k.dir, "inbox/0123456789abcdef0123.json").exists()
            && SyncJson.l(SyncJson.parse(k.m.take())).isEmpty() && !k.m.cids().containsKey("旧组的分区")
            && !SyncJson.stringify(k.m.st.json("node.json")).contains("aaaa");
        check(SyncJson.b(kj, "ok") && clean && SyncJson.s(k.state(), "notice").isEmpty(), "重新建组时旧的 group.json、node.json、out/、inbox/ 都清掉了，没带进新组", kj + " " + k.m.cids());
        k.m.leave();
    }

    static void track2(SyncService s) {
        SyncManager x = s.manager();
        if (x != null && x.g != null) GIDS.put(x.g.gid(), x.g.nodeKey());
    }

    static Dev[] scenarioCreateJoin(NodeCtl node, String tag) throws IOException {
        section("2. A 扫邀请码建组 → C 用加入码加入 → B 用另一张加入码加入，三台一致、之后增量为空");
        Dev a = new Dev(tag + "A", "家里的平板"), b = new Dev(tag + "B", "学校的平板"), c = new Dev(tag + "C", "妈妈的手机");
        a.put("s1", "a1", "来自 A"); a.put("s2", "x", 1);
        b.put("s1", "b1", "来自 B"); b.put("s3", "y", 2);
        c.put("s2", "c1", "来自 C");
        a.publish(); b.publish(); c.publish();
        String inv = fixPort(invite(node), node);
        Map<String, Object> r = SyncJson.obj(a.m.nodeJoin(inv));
        check(SyncJson.b(r, "ok") && a.m.inGroup(), "A 扫邀请码建组", r);
        a.sync();
        track(a);
        check(join(a, c), "C 加入：两边确认码相同");
        c.sync();
        check(join(a, b), "B 加入：两边确认码相同");
        rounds(3, a, b, c);
        track(a, b, c);
        check(sameCids(a, b, c), "三台各分区 cid 相同", cidDiff(a, b, c));
        check(eq(a, b) && eq(b, c) && a.data.get("s1").size() == 2, "三台学习数据合成一份（A、B 的 s1 都在）", a.data + " / " + c.data);
        check(SyncJson.l(a.state().get("members")).size() == 3, "A 的「我的设备」里有 3 台", a.m.state());
        resetCounts();
        rounds(5, a, b, c);
        check(count("push") == 0, "再同步 5 轮：没有任何 push（增量为空）", PATHS);
        check("ok".equals(SyncJson.s(a.state(), "status")), "状态「已同步」", a.m.state());
        return new Dev[]{a, b, c};
    }

    static void scenarioJoinSecurity(NodeCtl node, Dev a, Dev b) throws IOException {
        section("3. 加入码：篡改、冒充、否认、过期");
        // 节点篡改 ②：A 解不开，不弹窗、继续等；D 等不到组包；10 分钟后这张码过期
        Dev d = new Dev("devD", "陌生设备D");
        Map<String, Object> o = SyncJson.obj(a.m.joinOpen());
        Map<String, Object> s = SyncJson.obj(d.m.joinScan(SyncJson.s(o, "text")));
        check(SyncJson.b(s, "ok"), "D 扫码，放好 ②", s);
        node.cmd("cmd", "rdv_tamper", "rid", a.m.join.rid, "side", "b");
        long next = a.m.joinPoll();
        Map<String, Object> hs = SyncJson.obj(a.m.joinState());
        check("wait".equals(SyncJson.s(hs, "phase")) && next > 0 && SyncJson.s(hs, "code").isEmpty(), "节点篡改 ② 后 A 解不开：不弹窗、不作废，继续等", hs);
        check(!SyncJson.b(SyncJson.obj(a.m.joinConfirm(true)), "ok"), "没有等待确认的设备，确认不了");
        d.m.joinPoll();
        check(!d.m.inGroup(), "D 拿不到组包");
        if (!node.remote) {
            node.cmd("cmd", "advance", "sec", 601);
            a.clock.offset += 601000;
            a.m.joinPoll();
            check("expired".equals(SyncJson.s(SyncJson.obj(a.m.joinState()), "phase")), "篡改后一直解不开：10 分钟后这张加入码过期作废");
            node.cmd("cmd", "advance", "sec", -601);
            a.clock.offset -= 601000;
        }
        a.m.joinClose();
        NodeClient raw = new NodeClient(node.host, node.port, (gg, at) -> at);

        // 只有垃圾：A 仍在等；之后真设备扫码，A 照样认出来
        Dev q = new Dev("devQ", "学生的手机");
        o = SyncJson.obj(a.m.joinOpen());
        String rid0 = a.m.join.rid;
        try {
            raw.rdvPut(rid0, "b", SyncCrypto.rand(120));
            for (byte[] x : raw.rdvGet(rid0, "b")) raw.rdvPut(rid0, "b", x);      // 再把 ① 原样重放到 b 边
        } catch (NodeClient.NodeError ignored) { }
        next = a.m.joinPoll();
        hs = SyncJson.obj(a.m.joinState());
        check("wait".equals(SyncJson.s(hs, "phase")) && next > 0, "转交点里只有旁观者塞的垃圾和重放的 ①：A 仍在等（phase=wait）", hs);
        Map<String, Object> sq = SyncJson.obj(q.m.joinScan(SyncJson.s(o, "text")));
        a.m.joinPoll();
        hs = SyncJson.obj(a.m.joinState());
        check("学生的手机".equals(SyncJson.s(hs, "name")) && SyncJson.s(hs, "code").equals(SyncJson.s(sq, "code")),
            "之后真设备扫码：A 认出真正的新设备，确认码一致", hs);
        a.m.joinConfirm(false);

        // 垃圾和真消息交错：垃圾、真 ②、垃圾
        Dev q2 = new Dev("devQ2", "学生的平板");
        o = SyncJson.obj(a.m.joinOpen());
        String rid1 = a.m.join.rid;
        try { raw.rdvPut(rid1, "b", SyncCrypto.rand(200)); } catch (NodeClient.NodeError ignored) { }
        Map<String, Object> sq2 = SyncJson.obj(q2.m.joinScan(SyncJson.s(o, "text")));
        try { raw.rdvPut(rid1, "b", SyncCrypto.rand(90)); raw.rdvPut(rid1, "b", SyncCrypto.rand(5000)); } catch (NodeClient.NodeError ignored) { }
        a.m.joinPoll();
        hs = SyncJson.obj(a.m.joinState());
        check("学生的平板".equals(SyncJson.s(hs, "name")) && SyncJson.s(hs, "code").equals(SyncJson.s(sq2, "code")), "垃圾和真消息交错：A 跳过垃圾认出真设备", hs);
        a.m.joinConfirm(false);

        // 大量垃圾把转交点塞满（节点上限 8 条 / 16KB）：真设备放不进来，两边都给出「请重新生成」
        Dev q3 = new Dev("devQ3", "晚到的手机");
        o = SyncJson.obj(a.m.joinOpen());
        String rid2 = a.m.join.rid;
        int put = 0;
        for (int i = 0; i < 20; i++) { try { raw.rdvPut(rid2, "b", SyncCrypto.rand(1500)); put++; } catch (NodeClient.NodeError e) { break; } }
        Map<String, Object> sq3 = SyncJson.obj(q3.m.joinScan(SyncJson.s(o, "text")));
        a.m.joinPoll();
        hs = SyncJson.obj(a.m.joinState());
        check(!SyncJson.b(sq3, "ok") && SyncJson.s(sq3, "msg").contains("重新生成") && "full".equals(SyncJson.s(hs, "phase")) && SyncJson.s(hs, "msg").contains("重新生成"),
            "大量垃圾（塞进 " + put + " 条后节点拒收）：新设备提示「请重新生成」，A 提示「被陌生消息占满了，请重新生成」，不会一直卡着", sq3 + " / " + hs);
        a.m.joinClose();
        Dev q4 = new Dev("devQ4", "重新生成后的手机");
        o = SyncJson.obj(a.m.joinOpen());
        Map<String, Object> sq4 = SyncJson.obj(q4.m.joinScan(SyncJson.s(o, "text")));
        a.m.joinPoll();
        check("confirm".equals(SyncJson.s(SyncJson.obj(a.m.joinState()), "phase")) && SyncJson.b(sq4, "ok"), "重新生成一张加入码就能照常加入");
        a.m.joinConfirm(false);

        // 拍到二维码的陌生人抢先扫：A 弹窗里的名字和确认码对不上
        Dev e = new Dev("devE", "陌生人的手机"), f = new Dev("devF", "学生的新平板");
        o = SyncJson.obj(a.m.joinOpen());
        Map<String, Object> se = SyncJson.obj(e.m.joinScan(SyncJson.s(o, "text")));
        Map<String, Object> sf = SyncJson.obj(f.m.joinScan(SyncJson.s(o, "text")));
        a.m.joinPoll();
        hs = SyncJson.obj(a.m.joinState());
        check("陌生人的手机".equals(SyncJson.s(hs, "name")) && SyncJson.s(hs, "code").equals(SyncJson.s(se, "code")), "抢先扫的陌生设备出现在 A 的弹窗里（名字可见）", hs);
        boolean diff = !SyncJson.s(hs, "code").equals(SyncJson.s(sf, "code"));
        int same = 0;
        for (int i = 0; i < 1000; i++) {                // 中间人换掉公钥：两边确认码只有万分之一的机会相同
            byte[] sx = SyncCrypto.rand(16);
            String pa = SyncCrypto.b64e(SyncCrypto.newKeyPair().getPublic().getEncoded());
            if (i == 0 || i % 100 == 0) { /* 生成新公钥较慢，抽样 */ }
            String pc = SyncCrypto.b64e(SyncCrypto.rand(91)), pm = SyncCrypto.b64e(SyncCrypto.rand(91));
            if (Join.confirmCode(sx, pa, pc).equals(Join.confirmCode(sx, pa, pm))) same++;
        }
        check(diff && same < 10, "真正的新设备看到的确认码和 A 弹窗里的不同（1000 次换公钥模拟，相同 " + same + " 次）");
        Map<String, Object> dn = SyncJson.obj(a.m.joinConfirm(false));
        check(SyncJson.b(dn, "ok"), "A 点「不是我的设备」", dn);
        e.m.joinPoll();
        f.m.joinPoll();
        check(!e.m.inGroup() && !f.m.inGroup() && "denied".equals(SyncJson.s(SyncJson.obj(f.m.joinState()), "phase")), "否认后两台都拿不到组包，并提示被拒绝", f.m.joinState());

        // 10 分钟后失效
        if (!node.remote) {
            Dev h = new Dev("devH", "晚了的平板");
            o = SyncJson.obj(a.m.joinOpen());
            String text = SyncJson.s(o, "text");
            node.cmd("cmd", "advance", "sec", 601);
            a.clock.offset += 601000;
            h.clock.offset += 601000;
            Map<String, Object> sh = SyncJson.obj(h.m.joinScan(text));
            check(!SyncJson.b(sh, "ok") && SyncJson.s(sh, "msg").contains("过期"), "10 分钟后扫加入码：提示无效或已过期", sh);
            a.m.joinPoll();
            check("expired".equals(SyncJson.s(SyncJson.obj(a.m.joinState()), "phase")), "A 那边加入码显示已过期");
            node.cmd("cmd", "advance", "sec", -601);
            a.clock.offset -= 601000;
            a.m.joinClose();
        }

        section("4. 已在别的组的设备扫加入码被拒");
        o = SyncJson.obj(a.m.joinOpen());
        Map<String, Object> sb = SyncJson.obj(b.m.joinScan(SyncJson.s(o, "text")));
        check(!SyncJson.b(sb, "ok") && SyncJson.s(sb, "msg").contains("已经在一个同步组里") && SyncJson.s(sb, "msg").contains("退出同步组"),
            "提示「已经在一个同步组里，请先退出同步组」", sb);
        a.m.joinClose();
        Dev z = new Dev("devZ", "别的组");
        z.m.nodeJoin(fixPort(invite(node), node));
        track(z);
        Map<String, Object> sz = SyncJson.obj(z.m.joinScan(SyncJson.s(SyncJson.obj(a.m.joinOpen()), "text")));
        check(!SyncJson.b(sz, "ok"), "另一个组的设备扫码也被拒", sz);
        a.m.joinClose();
        z.m.leave();
    }

    static final int[][] ORDERS = {{0, 1, 2}, {0, 2, 1}, {1, 0, 2}, {1, 2, 0}, {2, 0, 1}, {2, 1, 0}};

    static void scenarioOrders(Dev a, Dev b, Dev c) {
        section("5. 三台按 6 种先后顺序同步（传输层；真正的 km-data 合并见浏览器页 sync-harness.html）");
        Dev[] ds = {a, b, c};
        boolean all = true;
        for (int k = 0; k < ORDERS.length; k++) {
            for (Dev d : ds) d.put("s" + (4 + k % 2), d.id + "-" + k, k);
            a.put("s1", "shared", "A 第 " + k + " 次");
            c.put("s1", "shared", "C 第 " + k + " 次");
            for (int r = 0; r < 3; r++) for (int i : ORDERS[k]) ds[i].sync();
            boolean ok = sameCids(a, b, c) && eq(a, b) && eq(b, c);
            all &= ok;
            if (!ok) check(false, "顺序 " + Arrays.toString(ORDERS[k]), cidDiff(a, b, c));
        }
        check(all, "6 种顺序最终 cid 都相同、数据一致");
        resetCounts();
        rounds(5, a, b, c);
        check(count("push") == 0, "继续同步 5 轮不变（没有 push）", PATHS);
    }

    static void scenarioRobust(NodeCtl node, Dev a, Dev b, Dev c) throws IOException {
        section("6. 重复进收件箱、同步到一半被杀、请求重放");
        // 同一份分区重复进收件箱 3 次：把 B 的 since 归零 3 次
        String before = SyncJson.canon(b.data);
        Map<String, String> cb = b.m.cids();
        int inboxMax = 0;
        for (int i = 0; i < 3; i++) {
            b.m.resetGid(b.m.g.gid(), SyncJson.s(SyncJson.m(SyncJson.m(b.m.nodeState().get("g")).get(b.m.g.gid())), "gen"));
            b.m.syncNow();
            inboxMax = Math.max(inboxMax, SyncJson.l(SyncJson.parse(b.m.take())).size());
            b.mergeInbox();
            b.m.syncNow();
        }
        check(SyncJson.canon(b.data).equals(before) && b.m.cids().equals(cb), "同一份分区重复收 3 次，结果不变", b.data);
        check(inboxMax <= 2 * b.data.size() + 2, "收件箱每个「来源设备 + 分区」只留一份（最多 " + inboxMax + " 条）");

        // 同步到一半杀掉：C 改了数据，推送那一刻进程被杀
        c.put("s2", "crash", "被杀前写的");
        c.publish();
        crashOn = "push";
        boolean killed = false;
        try { c.m.syncNow(); } catch (Killed k) { killed = true; }
        c.restart();
        check(killed && c.m.inGroup() && c.m.pendingCount() > 0, "被杀后重启：组和待推分区都还在", c.m.state());
        rounds(2, c, a, b);
        check(sameCids(a, b, c) && "被杀前写的".equals(a.data.get("s2").get("crash").get(1)), "下一轮补齐，三台一致", cidDiff(a, b, c));

        // 原样重放
        a.m.syncNow();
        Object[] q = lastReq;
        @SuppressWarnings("unchecked") Map<String, String> h = (Map<String, String>) q[4];
        MiniHttp.Resp rr = MiniHttp.request((String) q[0], (Integer) q[1], (String) q[2], (String) q[3], h, (byte[]) q[5]);
        check(rr.status == 401, "同一个请求原样重放 → 401", rr.status + " " + rr.text());

        section("7. ctr、rev 先写盘；stale 的分区下一轮重推");
        // 重启 + 时钟倒退 2 小时：计数照样递增
        a.clock.offset -= 2 * 3600 * 1000L;
        a.restart();
        a.m.syncNow();
        check("ok".equals(SyncJson.s(a.state(), "status")), "重启且时钟倒退 2 小时后，下一次请求没有被判计数重复", a.m.state());
        a.clock.offset += 2 * 3600 * 1000L;
        // 把 A 的一个分区的 rev 改小（模拟本机状态回退），push 返回 stale → 下一轮换新 rev 推成功
        String rel = SyncManager.fileOf("out", "s1");
        Map<String, Object> e = a.m.st.json(rel);
        long oldRev = SyncJson.n(e, "rev", 0);
        e.put("rev", 5L);
        e.put("pushed", SyncJson.map());
        a.m.st.putJson(rel, e);
        resetCounts();
        a.m.syncNow();
        Map<String, Object> e2 = a.m.st.json(rel);
        boolean stale = SyncJson.n(e2, "rev", 0) > oldRev && SyncJson.n(SyncJson.m(e2.get("pushed")), a.m.g.gid(), -1) != SyncJson.n(e2, "rev", 0);
        a.m.syncNow();
        Map<String, Object> e3 = a.m.st.json(rel);
        check(stale && SyncJson.n(SyncJson.m(e3.get("pushed")), a.m.g.gid(), -1) == SyncJson.n(e3, "rev", 0), "stale 的分区换了新 rev，下一轮重推成功",
            oldRev + " → " + SyncJson.n(e3, "rev", 0));
    }

    static void scenarioRemove(NodeCtl node, Dev a, Dev b, Dev c) throws IOException {
        section("9. A 移除 C：换钥、B 只靠信箱迁过去、C 显示已被移出、旧组被删");
        String oldGid = a.m.g.gid();
        byte[] cOldKey = c.m.g.nodeKey();
        String cData = SyncJson.canon(c.data);
        Map<String, Object> r = SyncJson.obj(a.m.remove(c.id));
        check(SyncJson.b(r, "ok"), "A 上点移除", r);
        a.sync();
        track(a);
        String newGid = a.m.g.gid();
        boolean succ = !newGid.equals(oldGid) && a.m.g.epoch == 2;
        {
            List<Object> gl = SyncJson.l(node.cmd("cmd", "groups"));
            boolean found = false;
            for (Object o : gl) {
                Map<String, Object> g = SyncJson.m(o);
                if (newGid.equals(SyncJson.s(g, "gid")) && oldGid.equals(SyncJson.s(g, "parent"))) found = true;
            }
            succ &= found;
        }
        check(succ, "节点上出现新组（successor，上一代是旧组），A 的 epoch = 2");
        // A 不在线，B 只靠旧组信箱拿到新钥
        b.sync();
        track(b);
        check(b.m.g.gid().equals(newGid) && b.m.g.epoch == 2, "B 只经信箱拿到新钥并迁到新组（A 这期间没在线）", b.m.g.gid());
        c.sync();
        Map<String, Object> cs = c.state();
        check(!c.m.inGroup() && SyncJson.s(cs, "notice").contains("已被移出"), "C 显示「已被移出」", c.m.state());
        check(SyncJson.canon(c.data).equals(cData), "C 本机数据还在");
        NodeClient nc = new NodeClient(node.host, node.port, (g, at) -> Math.max(System.currentTimeMillis(), at));
        int st = 0;
        try { nc.call(newGid, cOldKey, c.id, "pull", SyncJson.of("since", 0L)); st = 200; }
        catch (NodeClient.NodeError ex) { st = ex.status; }
        check(st == 401, "C 用旧 nodeKey 拉新组 → 401，拿不到任何数据", st);
        // B 继续学，A 回来
        b.put("s1", "after", "换钥后 B 写的");
        b.sync();
        a.sync();
        a.sync();
        b.sync();
        boolean dropped = true;
        for (Object o : SyncJson.l(node.cmd("cmd", "groups"))) if (oldGid.equals(SyncJson.s(SyncJson.m(o), "gid")) && SyncJson.b(SyncJson.m(o), "live")) dropped = false;
        check(dropped && a.m.g.prev.isEmpty(), "B 迁完后 A 把旧组 drop 了", a.m.g.prev.size());
        check(sameCids(a, b) && "换钥后 B 写的".equals(a.data.get("s1").get("after").get(1)), "A、B 在新组上照常同步", cidDiff(a, b));
        check(!a.m.cids().isEmpty() && c.m.cids().isEmpty(), "C 的同步文件已清掉（学习数据在网页那边，不受影响）");
    }

    static void scenarioOffline(NodeCtl node, Dev a, Dev b) {
        section("10. 节点停掉：显示「同步节点连不上」，本机照常，恢复后补齐");
        node.cmd("cmd", "stop");
        a.put("s2", "offline", "断网时学的");
        a.sync();
        Map<String, Object> s = a.state();
        check("offline".equals(SyncJson.s(s, "status")) && SyncJson.s(s, "error").contains("连不上"), "状态「同步节点连不上」", a.m.state());
        check(a.m.pendingCount() > 0, "改动留在待推里，本机数据不丢");
        node.cmd("cmd", "start");
        a.sync();
        b.sync();
        check(sameCids(a, b) && "断网时学的".equals(b.data.get("s2").get("offline").get(1)), "节点恢复后自动补齐", cidDiff(a, b));
    }

    static void scenarioSecrets(NodeCtl node, Dev a) throws IOException {
        section("11. 节点上只有密文；本机文件里没有明文组密钥");
        Map<String, Object> row = node.cmdM("cmd", "row", "gid", a.m.g.gid());
        byte[] data = SyncCrypto.b64d(SyncJson.s(row, "data"));
        int printable = 0;
        for (byte x : data) if (x >= 0x20 && x < 0x7f) printable++;
        String asText = new String(data, StandardCharsets.ISO_8859_1);
        check(data.length > 28 && printable < data.length * 0.6 && !asText.contains("s1") && !asText.contains("group") && !asText.contains("来自"),
            "抽查一行：密文解码后是乱码（可打印字符 " + printable + "/" + data.length + "）");
        boolean secOk = true;
        for (Object o : SyncJson.l(node.cmd("cmd", "rows", "gid", a.m.g.gid()))) {
            String sec = SyncJson.s(SyncJson.m(o), "sec");
            if (sec.contains("s1") || sec.contains("s2") || sec.contains("group") || sec.length() != 22) secOk = false;
        }
        check(secOk, "分区编号看不出分区名（22 位 HMAC 编号）");
        // 有人对看到过的明文 URL 发 GET 回访：一律 405，正文和组存不存在无关，拿不到任何组信息
        Map<String, Object> o = SyncJson.obj(a.m.joinOpen());
        String rid = a.m.join.rid;
        String realGid = a.m.g.gid(), fakeGid = SyncCrypto.hex(SyncCrypto.rand(16));
        boolean all405 = true;
        StringBuilder got = new StringBuilder();
        for (String path : new String[]{"/v1/g/" + realGid + "/push", "/v1/g/" + realGid + "/pull", "/v1/g/" + realGid + "/mail/get", "/v1/g/" + fakeGid + "/pull",
                "/v1/rdv/" + rid, "/v1/rdv/" + SyncCrypto.b64e(SyncCrypto.rand(16)), "/v1/g/" + realGid + "/pull?since=0", "/v1/create"}) {
            MiniHttp.Resp rr = MiniHttp.request(node.host, node.port, "GET", path, null, null);
            if (rr.status != 405 || !rr.text().equals("{\"err\":\"method\"}")) { all405 = false; got.append(path).append(" → ").append(rr.status).append(' ').append(rr.text()).append("; "); }
        }
        check(all405, "GET /v1/g/*、/v1/rdv/*、/v1/create 一律 405 {\"err\":\"method\"}，真组和假组、真转交点和假转交点回的一字不差", got);
        a.m.joinClose();
        Group g = a.m.g;
        List<String> needles = Arrays.asList(SyncCrypto.b64e(g.gk), SyncCrypto.hex(g.gk), SyncCrypto.b64e(g.encKey()), SyncCrypto.b64e(g.nodeKey()), SyncCrypto.b64e(g.idKey()));
        boolean clean = true;
        StringBuilder where = new StringBuilder();
        for (File f : listAll(a.dir)) {
            String txt = new String(Files.readAllBytes(f.toPath()), StandardCharsets.ISO_8859_1);
            for (String n : needles) if (txt.contains(n)) { clean = false; where.append(f.getName()).append(' '); }
            if (txt.contains("来自 A")) { clean = false; where.append(f.getName()).append("(明文数据) "); }
        }
        check(clean, "A 的同步目录里找不到明文组密钥和派生钥（" + listAll(a.dir).size() + " 个文件）", where);
    }

    static List<File> listAll(File d) {
        List<File> r = new ArrayList<>();
        File[] fs = d.listFiles();
        if (fs != null) for (File f : fs) { if (f.isDirectory()) r.addAll(listAll(f)); else r.add(f); }
        return r;
    }

    static void scenarioNodeAdmin(NodeCtl node, Dev a, Dev b) throws IOException {
        section("8. 管理员清空、节点丢库重建、邀请码作废、封禁");
        String gid = a.m.g.gid();
        node.cmd("cmd", "clear", "gid", gid);
        resetCounts();
        a.sync();
        b.sync();
        int pushes = count("push");
        a.sync();
        b.sync();
        check(pushes >= 2 && sameCids(a, b) && SyncJson.l(node.cmd("cmd", "rows", "gid", gid)).size() >= 2 * a.data.size(),
            "groups.clear 后设备看到 gen 变化，自动全部重推，两台一致", PATHS);
        node.cmd("cmd", "lose_db");
        a.sync();
        boolean rebuilt = false;
        for (Object o : SyncJson.l(node.cmd("cmd", "log", "n", 10))) if (String.valueOf(SyncJson.m(o).get("note")).contains("重建")) rebuilt = true;
        b.sync();
        a.sync();
        check(rebuilt && "ok".equals(SyncJson.s(a.state(), "status")) && sameCids(a, b), "删掉 node.db：设备收到 nogroup，自动 create 重建（rebuilt）并重推", a.m.state());
        NodeClient.Invite inv = a.m.invite();
        node.cmd("cmd", "revoke", "id", inv.id);
        node.cmd("cmd", "lose_db");
        a.sync();
        check(SyncJson.s(a.state(), "error").contains("邀请码已失效"), "作废邀请码后再删库：显示「邀请码已失效」", a.m.state());
        Map<String, Object> rs = SyncJson.obj(a.m.nodeJoin(fixPort(invite(node), node)));
        a.sync();
        b.sync();
        check(SyncJson.b(rs, "ok") && "ok".equals(SyncJson.s(b.state(), "status")) && sameCids(a, b), "「重新扫邀请码」后同一个组照常同步", b.m.state());
        String keep = SyncJson.canon(a.data);
        Map<String, String> keepC = a.m.cids();
        node.cmd("cmd", "remove", "gid", gid);
        a.sync();
        check(SyncJson.s(a.state(), "error").contains("拒绝了这个同步组") && SyncJson.canon(a.data).equals(keep) && a.m.cids().equals(keepC),
            "groups.remove 封禁：显示「同步节点拒绝了这个同步组」，本机数据不变", a.m.state());
        node.cmd("cmd", "unblock", "gid", gid);

        section("8b. 超过 60 天没同步、节点上的组也没了：提示「同步组已过期，请重新加入」，不自己重建");
        Map<String, Object> rj = SyncJson.obj(a.m.nodeJoin(fixPort(invite(node), node)));
        a.sync();
        check(SyncJson.b(rj, "ok") && "ok".equals(SyncJson.s(a.state(), "status")), "解除封禁、重新扫邀请码后恢复同步", a.m.state());
        a.clock.offset += 61 * 86400000L;
        node.cmd("cmd", "lose_db");
        resetCounts();
        a.sync();
        Map<String, Object> ex = a.state();
        check(SyncJson.s(ex, "error").contains("同步组已过期，请重新加入") && "expired".equals(SyncJson.s(SyncJson.m(ex.get("node")), "error")) && count("create") == 0,
            "显示「同步组已过期，请重新加入」，没有用邀请码建出只有自己的组", a.m.state() + " " + PATHS);
        check(SyncJson.canon(a.data).equals(keep) || !a.data.isEmpty(), "本机数据还在");
        Map<String, Object> lv = SyncJson.obj(a.m.leave());
        check(SyncJson.b(lv, "ok") && !a.m.inGroup(), "按提示退出同步组（本机数据保留），之后可以重新扫加入码", lv);
        a.clock.offset -= 61 * 86400000L;
    }

    // ================================================================ 清理（真实节点：不留测试组）

    static void cleanup(NodeCtl node) {
        section("清理");
        for (Map.Entry<String, byte[]> e : GIDS.entrySet()) {
            NodeClient nc = new NodeClient(node.host, node.port, (g, at) -> Math.max(System.currentTimeMillis(), at) + 5);
            try { nc.call(e.getKey(), e.getValue(), "harness", "drop", SyncJson.map()); }
            catch (NodeClient.NodeError ex) {
                if (ex.status == 403 && "blocked".equals(ex.err)) {
                    try { node.cmd("cmd", "unblock", "gid", e.getKey()); nc.call(e.getKey(), e.getValue(), "harness", "drop", SyncJson.map()); }
                    catch (Exception ignored) { }
                }
            } catch (IOException ignored) { }
        }
        if (node.remote) {
            List<Object> gl = SyncJson.l(node.cmd("cmd", "groups"));
            List<String> left = new ArrayList<>();
            for (Object o : gl) { String g = SyncJson.s(SyncJson.m(o), "gid"); if (GIDS.containsKey(g)) left.add(g.substring(0, 6)); }
            check(left.isEmpty(), "真实节点上没有留下测试组（用过 " + GIDS.size() + " 个组号）", left);
        }
    }

    static void cleanupInvites(NodeCtl node) {
        if (!node.remote) return;
        node.close();   // 助手退出时作废本次生成的全部邀请码
        try {
            NodeCtl n2 = new NodeCtl(node.host + ":" + node.port);
            int ok = 0;
            for (Object o : SyncJson.l(n2.cmd("cmd", "invites"))) {
                Map<String, Object> i = SyncJson.m(o);
                if ("自动测试".equals(SyncJson.s(i, "label")) && "ok".equals(SyncJson.s(i, "state"))) ok++;
            }
            n2.close();
            check(ok == 0, "没有「自动测试」的有效邀请码留下", ok);
        } catch (IOException e) { check(false, "复查邀请码", e.getMessage()); }
    }

    // ================================================================ 入口

    public static void main(String[] args) throws Exception {
        String remote = null;
        int serve = 0;
        for (int i = 0; i < args.length; i++) {
            if (args[i].equals("--remote")) remote = args[++i];
            else if (args[i].equals("--serve")) serve = Integer.parseInt(args[++i]);
            else if (args[i].equals("--python")) python = args[++i];
            else if (args[i].equals("--root")) root = new File(args[++i]);
        }
        if (root == null) root = new File(".").getAbsoluteFile();
        tmp = Files.createTempDirectory("km-sync-harness-").toFile();
        installTap();
        if (serve > 0) { HarnessServer.run(serve, remote); return; }
        long t0 = System.currentTimeMillis();
        NodeCtl node = new NodeCtl(remote);
        try {
            if (remote == null) {
                scenarioFaults(node);
                scenarioNoGroup();
                Dev[] d = scenarioCreateJoin(node, "dev");
                scenarioJoinSecurity(node, d[0], d[1]);
                scenarioOrders(d[0], d[1], d[2]);
                scenarioRobust(node, d[0], d[1], d[2]);
                scenarioSecrets(node, d[0]);
                scenarioRemove(node, d[0], d[1], d[2]);
                scenarioOffline(node, d[0], d[1]);
                scenarioNodeAdmin(node, d[0], d[1]);
            } else {
                System.out.println("真实节点 " + remote + "（临时测试邀请码，结束时删组、作废邀请码）");
                String tag = "t" + Long.toString(System.currentTimeMillis() % 100000, 36);
                Dev[] d = scenarioCreateJoin(node, tag);
                scenarioOrders(d[0], d[1], d[2]);
                scenarioRemove(node, d[0], d[1], d[2]);
            }
        } catch (Throwable e) {
            e.printStackTrace(System.out);
            check(false, "运行出错：" + e);
        } finally {
            cleanup(node);
            if (remote != null) cleanupInvites(node); else node.close();
            deleteTree(tmp);
        }
        int bad = 0;
        for (Object[] r : RESULTS) if (!(Boolean) r[0]) bad++;
        System.out.printf("%n共 %d 项，通过 %d 项，失败 %d 项，用时 %.1f 秒%n", RESULTS.size(), RESULTS.size() - bad, bad, (System.currentTimeMillis() - t0) / 1000.0);
        for (Object[] r : RESULTS) if (!(Boolean) r[0]) System.out.println("  失败：" + r[1]);
        System.exit(bad == 0 ? 0 : 1);
    }

    static void deleteTree(File f) {
        File[] fs = f.listFiles();
        if (fs != null) for (File x : fs) deleteTree(x);
        f.delete();
    }
}
