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
    /** --phase1：只跑第一期（经节点）的场景 */
    static boolean only1;
    /** --acct：只跑 #12 账号场景（本地节点） */
    static boolean acctOnly;
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

        /** 局域网（第二期）：连着哪个「Wi-Fi」（null = 没连，不开局域网） */
        String wifi;
        FakeEnv env;

        void restart() {
            if (m != null) m.lan.stop();               // 模拟进程被杀：旧实例的局域网服务也没了
            m = new SyncManager(new SyncStore(dir, kw), clock);
            m.setEvents((t, j) -> { synchronized (events) { events.add(new String[]{t, j}); } });
            m.setDevice(id, name);
            if (wifi != null) startLan();
        }

        void startLan() {
            env = new FakeEnv(this);
            m.setLan(env, null);
            m.lan.noThrottle = true;
            m.lanStart();
        }

        /** 连上某个 Wi-Fi、打开 App（局域网服务、广播、发现） */
        void lanOn(String w) { wifi = w; startLan(); }

        /** 断开 Wi-Fi / 关掉 App */
        void lanOff() { m.lanStop(); wifi = null; }

        int port() { return m.lan.port(); }

        /** 把同一个 Wi-Fi 里别的设备的 NSD 广播交给本机（真机上是 NSD 回调） */
        void pump() {
            if (wifi == null || env == null || !env.discovering) return;
            List<Object[]> ads = new ArrayList<>();
            synchronized (ADS) {
                Map<String, Object[]> w = ADS.get(wifi);
                if (w != null) for (Map.Entry<String, Object[]> e : w.entrySet()) ads.add(new Object[]{e.getKey(), e.getValue()[0], e.getValue()[1], e.getValue()[2]});
            }
            for (Object[] a : ads) {
                @SuppressWarnings("unchecked") Map<String, String> txt = (Map<String, String>) a[3];
                m.lanFound((String) a[0], (String) a[1], (Integer) a[2], txt);
            }
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
            pump();
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

    // ------------------------------------------------------------ 假的局域网环境：地址都是 127.0.0.1，NSD 广播按「Wi-Fi」分组记在 ADS 里

    static final Map<String, Map<String, Object[]>> ADS = new TreeMap<>();     // Wi-Fi → 服务名 → {host, port, txt}

    static final class FakeEnv implements Lan.Env {
        final Dev d;
        String svc;
        volatile boolean discovering;
        FakeEnv(Dev d) { this.d = d; }
        public String address() { return d.wifi == null ? null : "127.0.0.1"; }
        public void advertise(String service, int port, Map<String, String> txt) {
            stopAdvertise();
            synchronized (ADS) {
                if (d.wifi == null) return;
                svc = service;
                ADS.computeIfAbsent(d.wifi, k -> new TreeMap<>()).put(service, new Object[]{"127.0.0.1", port, new TreeMap<>(txt)});
            }
        }
        public void stopAdvertise() {
            synchronized (ADS) { if (svc != null) for (Map<String, Object[]> w : ADS.values()) w.remove(svc); svc = null; }
        }
        public void discover(boolean on) { discovering = on; }
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
        Lan.tap = (host, port, path) -> {
            String act = "lan-" + path.replaceAll("^/k1/", "");
            synchronized (PATHS) { PATHS.merge(act, 1, Integer::sum); }
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
        Map<String, Object> og = groupInfo(node, oldGid);
        check(og != null && SyncJson.b(og, "live") && tracking(a.m.g) == 0,
            "B 迁完后 A 不再跟踪旧组，但不 drop：旧组留给被移除的设备看名单（节点 60 天后自动删）", og);
        check(sameCids(a, b) && "换钥后 B 写的".equals(a.data.get("s1").get("after").get(1)), "A、B 在新组上照常同步", cidDiff(a, b));
        check(!a.m.cids().isEmpty() && c.m.cids().isEmpty(), "C 的同步文件已清掉（学习数据在网页那边，不受影响）");
    }

    /** 还在跟踪（节点上还有事要做）的旧组个数；做完的旧组只留钥匙给局域网认人 */
    static int tracking(Group g) {
        int n = 0;
        for (Group.Prev p : g.prev) if (!p.done) n++;
        return n;
    }

    static Map<String, Object> groupInfo(NodeCtl node, String gid) {
        for (Object o : SyncJson.l(node.cmd("cmd", "groups"))) if (gid.equals(SyncJson.s(SyncJson.m(o), "gid"))) return SyncJson.m(o);
        return null;
    }

    static long inviteUsed(NodeCtl node, String id) {
        for (Object o : SyncJson.l(node.cmd("cmd", "invites"))) if (id.equals(SyncJson.s(SyncJson.m(o), "id"))) return SyncJson.n(SyncJson.m(o), "used", -1);
        return -1;
    }

    /** 真机第 5 步：只有两台设备，A 移除 C（旧组里没有别的组员要迁） */
    static void scenarioRemoveTwo(NodeCtl node, String tag) throws IOException {
        section("9b. 只有两台设备，A 移除 C：C 显示「已被移出」，不重建旧组、不占邀请码次数");
        Dev a = new Dev(tag + "2A", "X800"), c = new Dev(tag + "2C", "P70");
        a.put("s1", "k", "A 的数据");
        c.put("s2", "k", "C 的数据");
        a.publish();
        c.publish();
        String inv = fixPort(invite(node), node);
        String invId = NodeClient.parseInvite(inv).id;
        a.m.nodeJoin(inv);
        a.sync();
        track(a);
        check(join(a, c), "C 加入");
        c.sync(); a.sync(); c.sync();
        String oldGid = a.m.g.gid();
        long used0 = inviteUsed(node, invId);
        String cData = SyncJson.canon(c.data);
        a.m.remove(c.id);
        for (int i = 0; i < 3; i++) a.sync();
        track(a);
        check(!a.m.g.gid().equals(oldGid) && tracking(a.m.g) == 0, "A 换钥到新组，旧组里没有别的组员要等，A 不再跟踪旧组", a.m.g.prev.size());
        Map<String, Object> og = groupInfo(node, oldGid);
        check(og != null && SyncJson.b(og, "live"), "A 没有 drop 旧组（留给 C 看名单）", og);
        for (int i = 0; i < 3; i++) c.sync();
        Map<String, Object> cs = c.state();
        check(!c.m.inGroup() && SyncJson.s(cs, "notice").contains("已被移出"), "C 显示「这台设备已被移出同步组，本机数据还在」", c.m.state());
        check(SyncJson.canon(c.data).equals(cData), "C 本机数据还在");
        long used1 = inviteUsed(node, invId);
        check(used1 == used0, "没有多用邀请码次数（" + used0 + " → " + used1 + "）");
        og = groupInfo(node, oldGid);
        boolean onlyA = og != null;
        if (og != null) for (Object o : SyncJson.l(og.get("devices"))) {
            Map<String, Object> d = SyncJson.m(o);
            if (SyncJson.n(d, "sections", 0) > 0 && !a.id.startsWith(SyncJson.s(d, "dev"))) onlyA = false;
        }
        check(onlyA, "旧组里只剩 A 推的那份名单（A、C 换钥前的数据槽都删了）", og);

        section("9c. 两台设备，旧组已经被删（节点 60 天清理 / 数据丢了）之后 C 才开机：用邀请码重建旧组被拒，显示「不在同步组里了」");
        Dev a2 = new Dev(tag + "3A", "X800"), c2 = new Dev(tag + "3C", "P70");
        a2.put("s1", "k", 1);
        c2.put("s2", "k", 2);
        a2.publish();
        c2.publish();
        String inv2 = fixPort(invite(node), node);
        String invId2 = NodeClient.parseInvite(inv2).id;
        a2.m.nodeJoin(inv2);
        a2.sync();
        track(a2);
        join(a2, c2);
        c2.sync(); a2.sync(); c2.sync();
        String old2 = a2.m.g.gid();
        byte[] oldKey2 = a2.m.g.nodeKey();
        a2.m.remove(c2.id);
        a2.sync();
        track(a2);
        // 模拟节点把旧组删了（60 天清理 / 数据丢了）
        try { new NodeClient(node.host, node.port, (gg, at) -> Math.max(System.currentTimeMillis(), at) + 7).call(old2, oldKey2, "cleaner", "drop", SyncJson.map()); }
        catch (NodeClient.NodeError e) { check(false, "删旧组", e); }
        long u0 = inviteUsed(node, invId2);
        resetCounts();
        c2.sync();
        c2.sync();
        Map<String, Object> s2 = c2.state();
        long u1 = inviteUsed(node, invId2);
        check(groupInfo(node, old2) == null || !SyncJson.b(groupInfo(node, old2), "live"), "旧组没有被重建出来", groupInfo(node, old2));
        check(u1 == u0, "没有占邀请码次数（" + u0 + " → " + u1 + "）");
        check("replaced".equals(SyncJson.s(SyncJson.m(s2.get("node")), "error")) && SyncJson.s(s2, "error").contains("不在同步组里了"),
            "C 显示「这台设备不在同步组里了……（可能已被移出）」，并给出「退出同步组」重新加入的办法", c2.m.state());
        int creates = count("create");
        c2.sync();
        check(count("create") <= creates + 1, "之后每次同步最多再试一次 create，不会把组建出来", PATHS);
        check(!SyncJson.s(s2, "error").contains("已过期"), "和「同步组已过期（60 天没同步）」是两种提示，不混");
        c2.m.leave();
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
            // 编号是 22 位 base64url 的 HMAC；随机编号碰巧含「s1」这种两个字符的片段是正常的（第一期这条按子串查，约 1% 概率误报），
            // 所以只查格式和较长的分区名
            if (!sec.matches("[A-Za-z0-9_-]{22}") || sec.contains("group")) secOk = false;
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

    // ================================================================ 第二期：局域网直连

    static int lanCount(String act) { return count("lan-" + act); }

    static Map<String, Object> lastEv(Dev d, String type) { String j = d.lastEvent(type); return j == null ? SyncJson.map() : SyncJson.obj(j); }

    static String nearbyKey(Dev d, String name) {
        Map<String, Object> l = SyncJson.m(d.state().get("lan"));
        if (l != null) for (Object o : SyncJson.l(l.get("nearby"))) if (name.equals(SyncJson.s(SyncJson.m(o), "name"))) return SyncJson.s(SyncJson.m(o), "key");
        return null;
    }

    /** 两台之间（只这两台）同步到稳定：x 连 y 一轮、两边合并收件箱，重复 3 次 */
    static void lanPair(Dev x, Dev y) {
        for (int i = 0; i < 3; i++) {
            x.publish();
            y.publish();
            x.m.lanWith("127.0.0.1", y.port());
            y.m.lanProcess();
            x.mergeInbox();
            y.mergeInbox();
        }
    }

    /** 两台都在可被发现状态、互相看得到；from 点 to，两边核对确认码，都点确认。返回两边确认码是否相同 */
    static boolean lanPairUp(Dev from, Dev to, boolean fromFirst) {
        to.m.pairOpen();
        from.m.pairOpen();
        from.pump();
        to.pump();
        String key = nearbyKey(from, to.name);
        if (key == null) { check(false, from.name + " 的附近列表里有「" + to.name + "」", from.m.state()); return false; }
        Map<String, Object> r = SyncJson.obj(from.m.pairWith(key));
        if (!SyncJson.b(r, "ok")) { check(false, "开始配对", r); return false; }
        Map<String, Object> rq = lastEv(to, "pair-request");
        boolean same = SyncJson.s(r, "code") != null && SyncJson.s(r, "code").equals(SyncJson.s(rq, "code")) && from.name.equals(SyncJson.s(rq, "name"));
        if (fromFirst) {
            Map<String, Object> c1 = SyncJson.obj(from.m.pairConfirm(true));
            if (!SyncJson.b(c1, "poll")) { check(false, "先点确认的一方等对方", c1); return false; }
            to.m.pairConfirm(true);
            from.m.pairPoll();
        } else {
            to.m.pairConfirm(true);
            from.m.pairConfirm(true);
            to.m.lanProcess();
        }
        return same;
    }

    static Dev[] scenarioLanPair() throws IOException {
        section("L1. 局域网配对：两边都打开「添加设备」互相看得到，4 位确认码相同；中间人；先承诺后公开");
        Dev a = new Dev("lanA", "客厅的平板"), b = new Dev("lanB", "书房的平板");
        a.put("s1", "a1", "来自 A"); a.put("s2", "x", 1);
        b.put("s1", "b1", "来自 B"); b.put("s3", "y", 2);
        resetCounts();
        a.lanOn("home");
        b.lanOn("home");
        check(!a.m.lan.running() && !b.m.lan.running() && lanCount("hello") == 0 && ADS.getOrDefault("home", new TreeMap<>()).isEmpty(),
            "没加入同步组、也没点「添加设备」：不开局域网服务、不广播、不发任何局域网请求");
        Map<String, Object> po = SyncJson.obj(b.m.pairOpen());
        check(SyncJson.b(po, "ok") && SyncJson.s(po, "addr").startsWith("127.0.0.1:") && b.m.lan.running(), "B 点「添加设备」：开服务、可被发现 3 分钟，显示本机地址 " + SyncJson.s(po, "addr"), po);
        boolean same = lanPairUp(a, b, true);
        check(same, "A 点附近列表里的 B：两边显示的 4 位确认码相同，B 的弹窗里是 A 的名字");
        check(a.m.inGroup() && b.m.inGroup() && a.m.g.gid().equals(b.m.g.gid()) && a.m.g.members.size() == 2 && b.m.g.members.size() == 2,
            "两边都确认后配对成功：同一个组、名单里两台（两台原来都没组，A 新建）", a.m.state());
        check(SyncJson.b(lastEv(a, "pair-result"), "first") && SyncJson.b(lastEv(b, "pair-result"), "first"), "两边的配对结果都标了「第一次」（页面据此先备份再合并）");
        check(!b.m.lan.discoverable() && a.m.g.node == null, "配对成功后不再被发现；局域网配对建的组没有同步节点");
        rounds(2, a, b);
        check(sameCids(a, b) && eq(a, b) && a.data.get("s1").size() == 2, "第一次同步：两边各分区 cid 相同、数据合成一份", cidDiff(a, b));
        resetCounts();
        rounds(5, a, b);
        check(lanCount("get") == 0 && lanCount("put") == 0 && lanCount("manifest") > 0, "再同步 5 轮：只问清单，没有任何分区传输（增量）", PATHS);
        Map<String, Object> as = a.state();
        boolean via = false;
        for (Object o : SyncJson.l(as.get("members"))) { Map<String, Object> mm = SyncJson.m(o); if (!SyncJson.b(mm, "me")) via = "局域网".equals(SyncJson.s(mm, "via")) && SyncJson.b(mm, "near"); }
        check("ok".equals(SyncJson.s(as, "status")) && via, "状态「已同步」，B 那一行显示「局域网」「在附近」", a.m.state());
        {
            Group g = a.m.g;
            List<String> needles = Arrays.asList(SyncCrypto.b64e(g.gk), SyncCrypto.hex(g.gk), SyncCrypto.b64e(Group.lanKeyOf(g.gk)), SyncCrypto.b64e(g.encKey()));
            boolean clean = new File(a.dir, "lan.json").exists();
            for (File f : listAll(a.dir)) {
                String txt = new String(Files.readAllBytes(f.toPath()), StandardCharsets.ISO_8859_1);
                for (String nd : needles) if (txt.contains(nd)) clean = false;
                if (txt.contains("来自 A") || txt.contains("来自 B")) clean = false;
            }
            check(clean, "A 的同步目录（含局域网的 lan.json）里没有明文组密钥、局域网签名钥和明文学习数据");
        }

        // 中间人：替换公钥。两边的随机数都是先承诺后公开，中间人凑不出相同的数字
        int hit = 0;
        String pkA = SyncCrypto.b64e(SyncCrypto.newKeyPair().getPublic().getEncoded()), pkB = SyncCrypto.b64e(SyncCrypto.newKeyPair().getPublic().getEncoded());
        String pkM = SyncCrypto.b64e(SyncCrypto.newKeyPair().getPublic().getEncoded());
        for (int i = 0; i < 1000; i++) {
            byte[] nA = SyncCrypto.rand(16), nB = SyncCrypto.rand(16), nM1 = SyncCrypto.rand(16), nM2 = SyncCrypto.rand(16);
            // A 以为在和 B 配对，其实对面是中间人 M（M 冒充 B）；B 以为对面是 A，其实是 M（M 冒充 A）
            String codeA = Pairing.code(pkA, pkM, nA, nM1), codeB = Pairing.code(pkM, pkB, nM2, nB);
            if (codeA.equals(codeB)) hit++;
        }
        check(hit < 10, "中间人替换公钥 1000 次，两边确认码相同 " + hit + " 次（< 1%）");
        byte[] nB = SyncCrypto.rand(16);
        byte[] cm = Pairing.commitment(pkB, pkA, nB);
        check(SyncCrypto.same(cm, Pairing.commitment(pkB, pkA, nB)) && !SyncCrypto.same(cm, Pairing.commitment(pkB, pkA, SyncCrypto.rand(16))),
            "承诺值锁定了 B 的随机数：看到 A 的随机数后再换，承诺对不上（A 会拒绝）");

        section("L1b. 确认码不一样、错 3 次自动停止被发现；先确认的是被点的一方也能配对");
        Dev c = new Dev("lanC", "妈妈的手机"), d = new Dev("lanD", "陌生人的手机");
        c.lanOn("home");
        d.lanOn("home");
        c.m.pairOpen();
        String caddr = "127.0.0.1:" + c.port();
        for (int i = 0; i < 3; i++) {
            Map<String, Object> s = SyncJson.obj(d.m.pairAddr(caddr));
            if (!SyncJson.b(s, "ok")) { check(false, "第 " + (i + 1) + " 次试配对", s); break; }
            d.m.pairConfirm(false);            // 数字对不上，点「不一样」
        }
        Map<String, Object> s4 = SyncJson.obj(d.m.pairAddr(caddr));
        check(!c.m.lan.discoverable() && !SyncJson.b(s4, "ok") && SyncJson.s(s4, "msg").contains("没有打开「添加设备」"),
            "确认码不一样 3 次后 C 自动停止被发现，再来配对 → 403，提示「对方没有打开添加设备」", s4);
        check(SyncJson.s(lastEv(c, "pair-close"), "msg").contains("3 次"), "C 的页面收到「对不上 3 次，已停止被发现」", c.lastEvent("pair-close"));
        check(!c.m.inGroup() && !d.m.inGroup(), "两台都没有配对上");
        // 伪造确认 MAC：403，也算一次失败
        c.m.pairOpen();
        Map<String, Object> s5 = SyncJson.obj(d.m.pairAddr(caddr));
        Pairing pd = d.m.lan.clientPair;
        Lan.R fr = d.m.lan.pairSend(pd, SyncJson.of("mac", SyncCrypto.b64e(SyncCrypto.rand(32))));
        check(SyncJson.b(s5, "ok") && fr.status == 403 && c.m.lan.fails.get() == 1, "冒充者发错的确认 MAC：403，记一次失败", fr.status + " " + fr.j);
        c.m.pairClose();
        // 被点的一方先确认、发起方后确认
        boolean same2 = lanPairUp(c, d, false);
        check(same2 && c.m.inGroup() && d.m.inGroup() && c.m.g.gid().equals(d.m.g.gid()), "被点的一方先点确认、发起方后点：照样配对成功");
        c.m.leave();
        d.m.leave();
        c.lanOff();
        d.lanOff();
        return new Dev[]{a, b};
    }

    static void scenarioLanAuth(Dev a, Dev b) throws IOException {
        section("L2. 局域网接口：没签名、签名错、重放 → 403；不在可被发现时配对 → 403；GET → 405");
        String host = "127.0.0.1";
        int port = a.port();
        byte[] body = SyncCrypto.utf8("{\"port\":0}");
        MiniHttp.Resp h = MiniHttp.request(host, port, "POST", "/k1/hello", null, SyncCrypto.utf8("{}"));
        String n = SyncJson.s(SyncJson.obj(h.text()), "n");
        MiniHttp.Resp r1 = MiniHttp.request(host, port, "POST", "/k1/manifest", null, body);
        Map<String, String> bad = new HashMap<>();
        bad.put("X-KM-Lan", b.id + "." + n + "." + b.m.g.fp() + "." + SyncCrypto.b64e(SyncCrypto.rand(32)));
        MiniHttp.Resp r2 = MiniHttp.request(host, port, "POST", "/k1/manifest", bad, body);
        String n2 = SyncJson.s(SyncJson.obj(MiniHttp.request(host, port, "POST", "/k1/hello", null, SyncCrypto.utf8("{}")).text()), "n");
        Map<String, String> good = new HashMap<>();
        good.put("X-KM-Lan", Lan.authHeader(b.id, n2, b.m.g.gk, "/k1/manifest", body));
        MiniHttp.Resp r3 = MiniHttp.request(host, port, "POST", "/k1/manifest", good, body);
        MiniHttp.Resp r4 = MiniHttp.request(host, port, "POST", "/k1/manifest", good, body);
        Map<String, String> stranger = new HashMap<>();
        String n3 = SyncJson.s(SyncJson.obj(MiniHttp.request(host, port, "POST", "/k1/hello", null, SyncCrypto.utf8("{}")).text()), "n");
        stranger.put("X-KM-Lan", Lan.authHeader("devStranger", n3, SyncCrypto.rand(32), "/k1/manifest", body));
        MiniHttp.Resp r5 = MiniHttp.request(host, port, "POST", "/k1/manifest", stranger, body);
        check(r1.status == 403 && r2.status == 403 && r5.status == 403, "没签名 / 签名错 / 不是本组的钥匙 → 403", r1.status + " " + r2.status + " " + r5.status + " " + r5.text());
        check(r3.status == 200 && r4.status == 403, "签名对 → 200；同一个请求原样重放（随机数只能用一次）→ 403", r3.status + " " + r4.status);
        MiniHttp.Resp r6 = MiniHttp.request(host, port, "POST", "/k1/pair/1", null,
            SyncCrypto.utf8(SyncJson.stringify(SyncJson.of("v", 1L, "dev", "devX", "name", "x", "pk", SyncCrypto.b64e(SyncCrypto.newKeyPair().getPublic().getEncoded()), "grp", ""))));
        check(r6.status == 403 && r6.text().contains("closed"), "不在可被发现状态时，配对接口 → 403", r6.status + " " + r6.text());
        MiniHttp.Resp r7 = MiniHttp.request(host, port, "GET", "/k1/manifest", null, null);
        check(r7.status == 405, "GET 一律 405", r7.status);
        // 不同组的设备互相认不出组标记；已在组里的设备再来配对：提示已在别的组 / 已在同一个组
        Dev z = new Dev("lanZ", "别人家的平板"), y = new Dev("lanY", "别人家的手机");
        z.lanOn("home");
        y.lanOn("home");
        lanPairUp(z, y, true);
        z.pump();
        a.pump();
        boolean zSees = false, aSees = false;
        for (String hp : z.m.lan.cands.values()) if (hp.endsWith(":" + a.port()) || hp.endsWith(":" + b.port())) zSees = true;
        for (String hp : a.m.lan.cands.values()) if (hp.endsWith(":" + z.port()) || hp.endsWith(":" + y.port())) aSees = true;
        check(z.m.inGroup() && !zSees && !aSees && a.m.lan.cands.values().contains("127.0.0.1:" + b.port()),
            "同一个 Wi-Fi 里另一个组：互相认不出组标记（不当成组员、不去同步），A 只认出本组的 B", a.m.lan.cands + " / " + z.m.lan.cands);
        b.m.pairOpen();
        Map<String, Object> sz = SyncJson.obj(z.m.pairAddr("127.0.0.1:" + b.port()));
        Map<String, Object> sa = SyncJson.obj(a.m.pairAddr("127.0.0.1:" + b.port()));
        check(!SyncJson.b(sz, "ok") && SyncJson.s(sz, "msg").contains("另一个同步组") && !SyncJson.b(sa, "ok") && SyncJson.s(sa, "msg").contains("同一个同步组"),
            "两台各自有组：拒绝并提示先退出；同组的再来配对：提示「已经在同一个同步组里」", sz + " / " + sa);
        b.m.pairClose();
        z.m.leave();
        y.m.leave();
        z.lanOff();
        y.lanOff();
    }

    static Dev scenarioLanRelay(Dev a, Dev b) throws IOException {
        section("L3. 传递：A↔B，再 B↔C（A 不在），C 拿到 A 的数据；三台按 6 种顺序两两同步，cid 相同");
        Dev c = new Dev("lanC2", "奶奶家的平板");
        c.put("s4", "c1", "来自 C");
        c.lanOn("home");
        lanPairUp(c, b, true);                     // C 和 B 配对加入（B 有组）
        check(c.m.inGroup() && c.m.g.gid().equals(a.m.g.gid()) && SyncJson.l(c.state().get("members")).size() == 3,
            "C 和 B 配对后加入同一个组，名单里 3 台（含没见过面的 A）", c.m.state());
        a.lanOff();
        a.put("s1", "onlyA", "A 离开前写的");
        a.lanOn("home");
        lanPair(a, b);                             // A↔B
        a.lanOff();                                // A 走了
        lanPair(b, c);                             // B↔C
        check("A 离开前写的".equals(c.data.get("s1").get("onlyA").get(1)), "C 没见过 A，经 B 拿到了 A 的数据");
        a.lanOn("home");
        Dev[] ds = {a, b, c};
        boolean all = true;
        for (int k = 0; k < ORDERS.length; k++) {
            for (Dev d : ds) d.put("s" + (5 + k % 2), d.id + "-" + k, k);
            a.put("s1", "shared", "A 第 " + k + " 次");
            c.put("s1", "shared", "C 第 " + k + " 次");
            int[] o = ORDERS[k];
            for (int r = 0; r < 2; r++) { lanPair(ds[o[0]], ds[o[1]]); lanPair(ds[o[1]], ds[o[2]]); lanPair(ds[o[2]], ds[o[0]]); }
            boolean ok = sameCids(a, b, c) && eq(a, b) && eq(b, c);
            all &= ok;
            if (!ok) check(false, "顺序 " + Arrays.toString(o), cidDiff(a, b, c));
        }
        check(all, "6 种先后顺序两两同步，最终三台 cid 都相同、数据一致");
        return c;
    }

    static void scenarioLanRobust(Dev a, Dev b, Dev c) throws IOException {
        section("L4. 重复收 3 次结果不变；同步到一半被杀，重启后数据完好、下一轮补齐");
        lanPair(a, b);
        String before = SyncJson.canon(b.data);
        Map<String, String> cb = b.m.cids();
        int inboxMax = 0;
        for (int i = 0; i < 3; i++) {
            // A 把自己的全部分区原样再推给 B（每次都是新的随机数、同样的内容）
            Group g = a.m.g;
            List<Object> items = new ArrayList<>();
            for (Lan.Mine x : a.m.lan.mine(g).values()) {
                String content = a.m.outContent(a.m.st.json(x.rel));
                items.add(SyncJson.of("sec", x.sec, "rev", x.rev, "cid", x.cid, "data", SyncCrypto.b64e(a.m.envelope(g, g.gid(), x.name, content, x.rev, x.t))));
            }
            String n = SyncJson.s(SyncJson.obj(MiniHttp.request("127.0.0.1", b.port(), "POST", "/k1/hello", null, SyncCrypto.utf8("{}")).text()), "n");
            Lan.R r = a.m.lan.signed("127.0.0.1", b.port(), "/k1/put", g.gk, n, SyncJson.of("items", items));
            if (r.status != 200) check(false, "重推", r.j);
            b.m.lanProcess();
            inboxMax = Math.max(inboxMax, SyncJson.l(SyncJson.parse(b.m.take())).size());
            b.mergeInbox();
        }
        lanPair(a, b);
        check(inboxMax > 0 && SyncJson.canon(b.data).equals(before) && b.m.cids().equals(cb) && sameCids(a, b), "同一份分区原样进 B 的收件箱 3 次（每次 " + inboxMax + " 个），合并结果不变", b.data);
        c.put("s2", "crash", "被杀前写的");
        c.publish();
        crashOn = "lan-put";
        boolean killed = false;
        try { c.m.lanWith("127.0.0.1", a.port()); } catch (Killed k) { killed = true; }
        c.restart();
        check(killed && c.m.inGroup() && c.m.lan.running(), "推送那一刻进程被杀：重启后组还在、局域网服务重新开起来");
        lanPair(c, a);
        lanPair(a, b);
        check(sameCids(a, b, c) && "被杀前写的".equals(b.data.get("s2").get("crash").get(1)), "下一轮补齐，三台一致", cidDiff(a, b, c));
    }

    static void scenarioLanRemove(Dev a, Dev b, Dev c) throws IOException {
        section("L5. A 移除 C（没有同步节点的组）：换钥；B 不在时的移除，B 下次碰到 A 时拿到新钥；C 收到「已被移出」");
        String oldFp = a.m.g.fp();
        byte[] oldGk = a.m.g.gk;
        String cData = SyncJson.canon(c.data);
        b.lanOff();                                    // B 不在
        c.lanOff();                                    // C 这会儿也不在（让它待会儿自己拿旧钥匙来）
        Map<String, Object> r = SyncJson.obj(a.m.remove(c.id));
        a.sync();
        check(SyncJson.b(r, "ok") && a.m.g.epoch == 2 && !a.m.g.fp().equals(oldFp), "A 移除 C：本机换钥，epoch 2，组密钥变了", a.m.g.epoch);
        // C 回来、拿旧钥匙主动连 A：403 removed，C 显示已被移出
        c.lanOn("home");
        c.m.lanWith("127.0.0.1", a.port());
        Map<String, Object> cs = c.state();
        check(!c.m.inGroup() && SyncJson.s(cs, "notice").contains("已被移出"), "C 拿旧钥匙来：被拒（403）并收到「已被移出」", c.m.state());
        check(SyncJson.canon(c.data).equals(cData), "C 本机数据还在");
        MiniHttp.Resp h = MiniHttp.request("127.0.0.1", a.port(), "POST", "/k1/hello", null, SyncCrypto.utf8("{}"));
        String n = SyncJson.s(SyncJson.obj(h.text()), "n");
        byte[] body = SyncCrypto.utf8("{}");
        Map<String, String> hd = new HashMap<>();
        hd.put("X-KM-Lan", Lan.authHeader(c.id, n, oldGk, "/k1/manifest", body));
        MiniHttp.Resp rc = MiniHttp.request("127.0.0.1", a.port(), "POST", "/k1/manifest", hd, body);
        check(rc.status == 403 && rc.text().contains("removed") && !rc.text().contains("\"items\""), "已移除设备的请求 → 403 removed，拿不到任何分区", rc.status + " " + rc.text().length());
        // B 回来：A 碰到 B 时把新钥匙交给它
        b.put("s1", "afterB", "B 回来后写的");
        b.lanOn("home");
        lanPair(a, b);
        check(b.m.g.epoch == 2 && b.m.g.fp().equals(a.m.g.fp()), "B 不在时 A 做的移除：B 回来碰到 A，拿到新钥匙（epoch 2）", b.m.g.epoch);
        check(sameCids(a, b) && "B 回来后写的".equals(a.data.get("s1").get("afterB").get(1)), "A、B 用新钥匙照常同步", cidDiff(a, b));
        // 反过来：B 主动连 A（B 拿旧钥匙）也能拿到新钥匙
        Dev e = new Dev("lanE", "爸爸的手机");
        e.lanOn("home");
        lanPairUp(e, a, true);
        lanPair(e, a);
        String eid = e.id;
        a.m.remove(b.id);                              // 再移除一次 B：A 换到 epoch 3，E 不在场时……
        e.lanOff();
        a.sync();
        e.lanOn("home");
        e.m.lanWith("127.0.0.1", a.port());            // E 拿 epoch 2 的钥匙主动连 A → 409 + 钥匙包
        lanPair(e, a);
        check(e.m.g.epoch == 3 && e.m.g.fp().equals(a.m.g.fp()) && sameCids(a, e), "落后的 E 主动连 A：收到 409 和钥匙包，换上 epoch 3 照常同步", e.m.g.epoch);
        b.m.lanWith("127.0.0.1", a.port());
        check(!b.m.inGroup() && SyncJson.s(b.state(), "notice").contains("已被移出"), "B（epoch 2）被移出后再连 A：收到「已被移出」", b.m.state());
        e.m.leave();
        e.lanOff();
        a.lanOff();
        b.lanOff();
        c.lanOff();
    }

    static void scenarioLanMixed(NodeCtl node) throws IOException {
        section("L6. 混合：经节点同组的设备在局域网里自动直连（不用配对）；A↔B 局域网、B↔节点、C 只连节点");
        Dev a = new Dev("mixA", "客厅的平板"), b = new Dev("mixB", "书房的平板"), c = new Dev("mixC", "学校的平板");
        a.put("s1", "a", "来自 A");
        b.put("s2", "b", "来自 B");
        c.put("s3", "c", "来自 C");
        String inv = fixPort(invite(node), node);
        a.m.nodeJoin(inv);
        a.sync();
        track(a);
        join(a, b);
        join(a, c);
        rounds(2, a, b, c);
        track(a, b, c);
        a.lanOn("home");
        b.lanOn("home");                               // C 没连这个 Wi-Fi，只走节点
        a.m.skipNode = true;
        a.put("s1", "lanOnly", "A 只经局域网");
        a.sync();
        b.sync();
        Map<String, Object> bs = b.state();
        String viaA = "";
        for (Object o : SyncJson.l(bs.get("members"))) { Map<String, Object> mm = SyncJson.m(o); if (a.id.equals(SyncJson.s(mm, "dev"))) viaA = SyncJson.s(mm, "via"); }
        check("A 只经局域网".equals(b.data.get("s1").get("lanOnly").get(1)) && "局域网".equals(viaA),
            "经节点同组的 A、B 没配对过：靠组标记认出对方、用组签名直连，A 的改动经局域网到了 B", b.m.state());
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
        check(all, "A 只走局域网、C 只走节点、B 两条都走：6 种顺序最终三台 cid 相同");
        // 同一份数据从局域网和节点各到一次
        a.m.skipNode = false;
        a.put("s2", "twice", "两条路都到");
        a.sync();                                      // A 推到节点，也推给 B
        String keep = SyncJson.canon(b.data);
        b.m.skipNode = true;
        b.sync();                                      // B 先只经局域网收
        String afterLan = SyncJson.canon(b.data);
        b.m.skipNode = false;
        Map<String, Object> ns = b.m.nodeState();
        SyncJson.m(SyncJson.m(ns.get("g")).get(b.m.g.gid())).put("since", 0L);   // 让节点把 A 的分区再给 B 一次
        b.m.st.putJson("node.json", ns);
        b.m.syncNow();
        int again = SyncJson.l(SyncJson.parse(b.m.take())).size();
        b.mergeInbox();
        check(!keep.equals(afterLan) && afterLan.equals(SyncJson.canon(b.data)) && again > 0, "同一份数据经局域网到一次、再经节点到一次（" + again + " 个分区），结果不变");
        // 节点停掉：局域网照常（真实节点不能停，只在本地节点测）
        if (node.remote) { a.lanOff(); b.lanOff(); return; }
        node.cmd("cmd", "stop");
        a.put("s3", "nodeDown", "节点停了");
        for (int i = 0; i < 2; i++) { a.sync(); b.sync(); }
        Map<String, Object> as = a.state();
        check("节点停了".equals(b.data.get("s3").get("nodeDown").get(1)), "节点停掉时 A、B 经局域网照常同步");
        check("ok".equals(SyncJson.s(as, "status")) && SyncJson.s(as, "error").contains("局域网同步照常"), "状态「已同步」，并说明「同步节点连不上，局域网同步照常」", a.m.state());
        node.cmd("cmd", "start");
        rounds(2, a, b, c);
        check(sameCids(a, b, c), "节点恢复后 C 也补齐", cidDiff(a, b, c));
        a.lanOff();
        b.lanOff();
    }

    /** #1 第二期真机验收退回的第 2 条：经局域网加入节点组后，局域网带来的变化让节点上「待推」，却没有人安排节点那一轮 */
    static void scenarioLanNodeDue(NodeCtl node) throws Exception {
        section("L7. 返工：局域网带来的组名单变化让节点上有待推的分区时，自动补一轮节点同步，状态不再一直「待同步」");
        Dev a = new Dev("dueA", "客厅的平板"), b = new Dev("dueB", "书房的平板");
        a.put("s1", "a", "来自 A");
        b.put("s1", "b", "来自 B");
        a.m.nodeJoin(fixPort(invite(node), node));
        a.sync();
        track(a);
        a.lanOn("w7");
        b.lanOn("w7");
        boolean same = lanPairUp(b, a, true);
        track(a, b);
        check(same && b.m.inGroup() && b.m.g.node != null && a.m.g.gid().equals(b.m.g.gid()), "B 经局域网配对加入 A 的节点组，同步节点设置随组包带过去");
        rounds(2, a, b);
        check("ok".equals(SyncJson.s(a.state(), "status")) && !a.m.nodeDue(), "两边同步过后 A「已同步」、节点上没有待推的", a.m.state());
        // B 给 A 改名，只经局域网送到 A：A 的组名单变了 → 节点上待推一个分区；以前要等 15 分钟定时或下次学习才推
        b.m.rename(a.id, "改过名的客厅平板");
        b.publish();
        b.m.lanWith("127.0.0.1", a.port());
        a.m.lanProcess();
        Map<String, Object> as = a.state();
        check("改过名的客厅平板".equals(a.m.g.member(a.id).name) && "pending".equals(SyncJson.s(as, "status")) && a.m.nodeDue(),
            "复现：局域网带来的组名单变化让 A 节点上待推（状态「待同步」），nodeDue() 报告该补一轮节点同步", a.m.state());
        a.m.syncNow();
        check("ok".equals(SyncJson.s(a.state(), "status")) && !a.m.nodeDue(), "补一轮节点同步后「已同步」，没有待推的", a.m.state());
        a.lanOff();
        b.lanOff();

        // 同步外壳（SyncService）：局域网那条路的任务做完后发现节点上有待推的，自己安排一轮节点同步
        long base = SyncService.nodeRetryBase;
        SyncService.nodeRetryBase = 60000;                  // 先不让补推掺进来：单看「立即同步」有没有被推迟
        File d = new File(tmp, "svc-due");
        Rec r = new Rec();
        SyncService s = new SyncService(d, new TestWrap(new File(tmp, "keystore/svc-due.key")), System::currentTimeMillis, r, r);
        try {
            s.setDevice("devDue", "补推的平板");
            s.nodeJoin(fixPort(invite(node), node));
            s.drain();
            track2(s);
            resetCounts();
            s.publish("{\"device\":{\"id\":\"devDue\",\"name\":\"补推的平板\"},\"sections\":[{\"name\":\"s1\",\"content\":\"{\\\"a\\\":1}\"}]}");
            s.syncNow();
            s.drain();
            Thread.sleep(800);
            s.drain();
            check("ok".equals(SyncJson.s(SyncJson.obj(s.state()), "status")) && count("push") > 0,
                "外壳：先发布再「立即同步」（网页「立即同步」、刚进组时都是这个顺序），这一轮马上做、没被发布的 10 秒防抖推迟，「已同步」", s.state());
            resetCounts();
            SyncService.nodeRetryBase = 300;
            s.manager().putOut("s2", "{\"b\":2}");        // 模拟局域网收到的变化让本机分区变了（不经网页发布，不会触发同步）
            s.manager().refreshState();
            check("pending".equals(SyncJson.s(SyncJson.obj(s.state()), "status")), "本机有分区没推上节点：「待同步」");
            s.lanSoon(0);                                   // 局域网那一轮（这台没连 Wi-Fi，什么也不做）之后检查节点
            long t0 = System.currentTimeMillis();
            while (System.currentTimeMillis() - t0 < 5000 && !"ok".equals(SyncJson.s(SyncJson.obj(s.state()), "status"))) Thread.sleep(100);
            s.drain();
            Map<String, Object> ss = SyncJson.obj(s.state());
            check("ok".equals(SyncJson.s(ss, "status")) && SyncJson.n(ss, "pending", -1) == 0 && count("push") > 0,
                "局域网任务做完后自动补了一轮节点同步（push " + count("push") + " 次），状态回到「已同步」", s.state());
            resetCounts();
            Thread.sleep(1500);
            check(count("push") == 0 && count("pull") == 0, "没有待推的就不再补，不会一直连节点", PATHS);
        } finally {
            SyncService.nodeRetryBase = base;
            s.leave();
            s.drain();
        }
    }

    static void scenarioJoinFull(NodeCtl node, Dev a) throws IOException {
        section("3b. 第一期遗留：转交点「差一条就满」时给出友好提示（第二期顺手修）");
        NodeClient raw = new NodeClient(node.host, node.port, (gg, at) -> at);
        // 正好 6 条垃圾 + 真设备的 ②（第 7 条，加上 ① 共 8 条）：A 认出真设备，但组包放不进去 → 不弹确认，直接说这张码失效了
        Dev q = new Dev("devQ6", "第七条的手机");
        Map<String, Object> o = SyncJson.obj(a.m.joinOpen());
        String rid = a.m.join.rid;
        for (int i = 0; i < 6; i++) { try { raw.rdvPut(rid, "b", SyncCrypto.rand(200)); } catch (NodeClient.NodeError e) { break; } }
        Map<String, Object> sq = SyncJson.obj(q.m.joinScan(SyncJson.s(o, "text")));
        a.m.joinPoll();
        Map<String, Object> hs = SyncJson.obj(a.m.joinState());
        check(SyncJson.b(sq, "ok") && "full".equals(SyncJson.s(hs, "phase")) && SyncJson.s(hs, "msg").contains("已失效") && SyncJson.s(hs, "msg").contains("重新生成"),
            "6 条垃圾 + 真设备第 7 条：A 不弹确认，提示「这张加入码已失效……请重新生成」", hs);
        a.m.joinClose();
        // 条数没满、字节快满：确认时组包放不进去（413）→ 同样的友好提示，不再是「同步节点出错（413 size）」
        Dev q2 = new Dev("devQ7", "大消息后的手机");
        o = SyncJson.obj(a.m.joinOpen());
        rid = a.m.join.rid;
        for (int i = 0; i < 5; i++) { try { raw.rdvPut(rid, "b", SyncCrypto.rand(3000)); } catch (NodeClient.NodeError e) { break; } }
        SyncJson.obj(q2.m.joinScan(SyncJson.s(o, "text")));
        a.m.joinPoll();
        Map<String, Object> cf = SyncJson.obj(a.m.joinConfirm(true));
        check(!SyncJson.b(cf, "ok") && SyncJson.s(cf, "msg").contains("已失效") && !SyncJson.s(cf, "msg").contains("413"),
            "确认时节点回 413：提示「这张加入码已失效……请点添加设备重新生成」", cf);
        a.m.joinClose();
    }

    // ================================================================ #12 账号

    static java.security.KeyPair REC;          // 测试用的账号恢复密钥（真机上公钥打包在 APK 里，私钥在审批 App）
    static NodeCtl ANODE;

    static void acctCfg(Dev... ds) {
        for (Dev d : ds) d.m.setConfig(ANODE.host, ANODE.port, SyncCrypto.b64e(REC.getPublic().getEncoded()), "testkid1");
    }

    static Map<String, Object> reg(Dev d, String user, String pw, String code) {
        return SyncJson.obj(d.m.acctRegister(SyncJson.stringify(SyncJson.of("user", user, "pw", pw, "code", code))));
    }

    static Map<String, Object> login(Dev d, String user, String pw) {
        return SyncJson.obj(d.m.acctLogin(SyncJson.stringify(SyncJson.of("user", user, "pw", pw))));
    }

    static String acode(NodeCtl node) { return SyncJson.s(node.cmdM("cmd", "acode"), "code"); }

    static Map<String, Object> acctOp(NodeCtl node, String op, Object... kv) { return SyncJson.m(node.cmd("cmd", "acct", "op", op, "args", SyncJson.of(kv))); }

    /** 本机「学习数据」和同步文件的指纹：失败的登录 / 注册前后要一样（account.json、node.json 里的计数不算学习数据） */
    static String snap(Dev d) {
        StringBuilder b = new StringBuilder(SyncJson.canon(d.data));
        List<File> fs = listAll(d.dir);
        fs.sort(null);
        for (File f : fs) {
            String rel = d.dir.toPath().relativize(f.toPath()).toString().replace('\\', '/');
            if (rel.startsWith("account.json") || rel.startsWith("node.json") || rel.startsWith("device.json")) continue;
            try { b.append('|').append(rel).append('=').append(SyncCrypto.hex(SyncCrypto.sha256(Files.readAllBytes(f.toPath())))); }
            catch (IOException e) { b.append('|').append(rel).append("=?"); }
        }
        return b.toString();
    }

    static boolean headerSeen(String h) {
        Object[] r = lastReq;
        @SuppressWarnings("unchecked") Map<String, String> hs = r == null ? null : (Map<String, String>) r[4];
        return hs != null && hs.containsKey(h);
    }

    static void scenarioAccounts(NodeCtl node) throws Exception {
        ANODE = node;
        REC = SyncCrypto.newKeyPair();

        section("A1. 新设备注册（本机数据成为账号的初始数据）→ 另一台新设备登录，拿到完全相同的数据（验收 A2）");
        Dev x = new Dev("acx800", "X800"), p = new Dev("acp70", "P70");
        acctCfg(x, p);
        x.put("math", "k1", "学过 5 个知识点");
        x.put("pet", "bones", 7);
        x.sync();
        String c1 = acode(node);
        Map<String, Object> r = reg(x, "xiaoming", "x", c1);
        check(!SyncJson.b(r, "ok") && "rule".equals(SyncJson.s(r, "code")), "密码不合规则 → 本机就拒绝（不发请求）", r);
        r = reg(x, "xiaoming", "shuxue2026a", c1.toLowerCase().replace("-", " "));
        check(SyncJson.b(r, "ok") && "new".equals(SyncJson.s(r, "mode")), "注册成功：新建组 + 账号", r);
        check(x.m.acct.in() && x.m.inGroup() && x.m.acct.gid.equals(x.m.g.gid()), "本机已登录，账号组就是本机的组", x.m.acctState());
        x.sync();
        check(headerSeen("X-KM-Dev"), "账号组的同步请求带设备通行证 X-KM-Dev", lastReq == null ? null : lastReq[3]);
        r = login(p, "xiaoming", "shuxue2026a");
        check(SyncJson.b(r, "ok") && !SyncJson.b(r, "same"), "新设备登录成功", r);
        rounds(2, p, x);
        check(eq(x, p) && sameCids(x, p), "两台数据完全相同、分区 cid 相同", cidDiff(x, p));
        check("xiaoming".equals(SyncJson.s(SyncJson.m(p.state().get("acct")), "user")), "同步状态里有账号名（总入口标签用）", p.m.state());
        String st = x.m.state();
        check(st.contains("\"status\":\"ok\""), "状态已同步", st);

        section("A2. 密码错、断网、服务器出错、注册中被杀：本机学习数据和同步文件一点不变（验收 A5）");
        Dev q = new Dev("acq", "Q");
        acctCfg(q);
        q.put("zh", "w1", "另一台的语文");
        q.sync();
        String s0 = snap(q);
        r = login(q, "xiaoming", "wrong-pass9");
        check(!SyncJson.b(r, "ok") && "login".equals(SyncJson.s(r, "code")) && snap(q).equals(s0) && q.m.acct == null && !q.m.inGroup(),
            "密码错：提示「用户名或密码不对」，本机不变", r);
        r = reg(q, "xiaoqiang", "huaxue2026q", "ABCD-EFGH-JKMN");
        check(!SyncJson.b(r, "ok") && "code".equals(SyncJson.s(r, "code")) && snap(q).equals(s0) && !q.m.inGroup(), "注册码错：本机不变", r);
        String cOff = acode(node);
        node.cmd("cmd", "stop");
        r = login(q, "xiaoming", "shuxue2026a");
        Map<String, Object> r2 = reg(q, "xiaoqiang", "huaxue2026q", cOff);
        node.cmd("cmd", "start");
        check("offline".equals(SyncJson.s(r, "code")) && !SyncJson.b(r2, "ok") && snap(q).equals(s0) && !q.m.inGroup(), "服务器连不上：登录、注册都失败，本机不变", r);
        String c2 = acode(node);
        crashOn = "/v1/acct/register";
        try { reg(q, "xiaoqiang", "huaxue2026q", c2); } catch (Killed k) { /* 模拟注册请求发出前进程被杀 */ }
        q.restart();
        acctCfg(q);
        check(snap(q).equals(s0) && !q.m.inGroup() && (q.m.acct == null || !q.m.acct.in()), "注册中被杀：重启后本机不变、没有半个账号", q.m.acctState());
        crashOn = "/v1/acct/login";
        try { login(q, "xiaoming", "shuxue2026a"); } catch (Killed k) { /* 登录中被杀 */ }
        q.restart();
        acctCfg(q);
        check(snap(q).equals(s0) && !q.m.inGroup(), "登录中被杀：重启后本机不变", q.m.acctState());

        section("A3. 本机有别的数据、登录已有账号：两边合并，不覆盖、不丢（验收 A3）");
        r = login(q, "xiaoming", "shuxue2026a");
        check(SyncJson.b(r, "ok"), "登录", r);
        rounds(3, q, x, p);
        check(eq(q, x) && eq(x, p) && sameCids(q, x, p) && q.data.containsKey("zh") && q.data.containsKey("math"), "三台合并成一份：Q 的语文和 X 的数学都在", cidDiff(q, x, p));

        section("A4. 已在 #1 同步组里的设备注册（把组升级成账号），组里没升级的设备照常同步，升级后输密码登录（验收 A4）");
        Dev b1 = new Dev("acb1", "B1"), b2 = new Dev("acb2", "B2");
        acctCfg(b1, b2);
        Map<String, Object> j = SyncJson.obj(b1.m.nodeJoin(fixPort(invite(node), node)));
        check(SyncJson.b(j, "ok"), "B1 用 #1 邀请码建组", j);
        b1.put("en", "w", "B1 的英语");
        b1.sync();
        check(join(b1, b2), "B2 用加入码加入");
        b2.put("en", "w2", "B2 的英语");
        rounds(2, b1, b2);
        String gidBefore = b1.m.g.gid();
        r = reg(b1, "xiaohong", "yuwen2026b", acode(node));
        check(SyncJson.b(r, "ok") && "bind".equals(SyncJson.s(r, "mode")) && SyncJson.n(r, "legacy", 0) == 1 && b1.m.g.gid().equals(gidBefore),
            "B1 注册：组号不变（不新建组、不搬数据），B2 记为老设备", r);
        b2.put("en", "w3", "B2 没升级时的改动");
        rounds(2, b2, b1);
        check(eq(b1, b2) && sameCids(b1, b2), "B2（还没登录，老设备）照常同步", cidDiff(b1, b2));
        Map<String, Object> as = SyncJson.obj(b2.m.acctState());
        check("xiaohong".equals(SyncJson.s(as, "prefill")) && "xiaohong".equals(SyncJson.s(as, "groupAcct")), "B2 的登录页能填好用户名（来自节点的 acct）", as);
        String s2 = snap(b2);
        r = login(b2, "xiaohong", "yuwen2026b");
        check(SyncJson.b(r, "ok") && SyncJson.b(r, "same") && b2.m.g.gid().equals(gidBefore) && snap(b2).equals(s2), "B2 登录：同一个组，只拿通行证，数据和文件不动", r);
        rounds(2, b1, b2);
        check(eq(b1, b2) && sameCids(b1, b2), "登录后两台一致", cidDiff(b1, b2));
        r = reg(b2, "another", "yuwen2026c", acode(node));
        check(!SyncJson.b(r, "ok"), "已有账号的设备不能再注册", r);

        section("A5. 停用账号：设备停止同步、回登录页、数据不变；启用后重新登录（验收 12）");
        acctOp(node, "accounts.setDisabled", "user", "xiaoming", "disabled", true);
        String sx = snap(x);
        x.m.syncNow();
        check("disabled".equals(x.m.acct.state) && "disabled".equals(SyncJson.s(SyncJson.obj(x.lastEvent("account")), "state")) && snap(x).equals(sx),
            "设备收到 disabled：账号状态改为停用、发 account 事件，数据不变", x.m.acctState());
        resetCounts();
        x.sync();
        check(REQS.get() == 0, "停用后不再发同步请求", REQS.get());
        r = login(x, "xiaoming", "shuxue2026a");
        check(!SyncJson.b(r, "ok") && SyncJson.s(r, "msg").contains("停用"), "停用时登录被拒（提示已停用）", r);
        acctOp(node, "accounts.setDisabled", "user", "xiaoming", "disabled", false);
        r = login(x, "xiaoming", "shuxue2026a");
        check(SyncJson.b(r, "ok") && SyncJson.b(r, "same") && snap(x).equals(sx), "启用后重新登录：同一份数据", r);
        for (Dev d : new Dev[]{p, q}) { d.m.syncNow(); login(d, "xiaoming", "shuxue2026a"); }
        rounds(2, x, p, q);
        check(sameCids(x, p, q), "三台照常同步", cidDiff(x, p, q));

        section("A6. 管理员用恢复密钥重设密码：所有设备回登录页，旧密码不行、新密码登录后数据完整（验收 11）");
        Map<String, Object> g = acctOp(node, "accounts.get", "user", "xiaoming", "wrap", true);
        Map<String, Object> b = Account.openAdmin(REC.getPrivate(), "xiaoming", SyncCrypto.b64d(SyncJson.s(g, "wrap_admin")));
        check(b != null && SyncCrypto.b64e(x.m.g.gk).equals(SyncJson.s(b, "gk")), "恢复私钥解开 wrap_admin，拿到的组密钥就是账号的", b == null ? null : b.keySet());
        // 审批 App 的实现（team-admin-app AcctCrypto）：恢复私钥解开 → 新密码算参数 → resetPassword，和 App 的 Account 互通
        String bundle = com.fjzk.teamadmin.AcctCrypto.openAdmin(REC.getPrivate().getEncoded(), "testkid1", "xiaoming", SyncJson.s(g, "wrap_admin"));
        check(SyncJson.canon(SyncJson.obj(bundle)).equals(SyncJson.canon(b)), "审批 App 的 AcctCrypto 解开的账号包和 App 的一样");
        try {
            com.fjzk.teamadmin.AcctCrypto.openAdmin(REC.getPrivate().getEncoded(), "otherkid", "xiaoming", SyncJson.s(g, "wrap_admin"));
            check(false, "恢复密钥编号对不上时拒绝");
        } catch (IllegalArgumentException e) { check(e.getMessage().contains("另一把恢复密钥"), "恢复密钥编号对不上时拒绝（中文说明）", e.getMessage()); }
        Map<String, Object> args = SyncJson.obj(com.fjzk.teamadmin.AcctCrypto.resetArgs("xiaoming", "newpass2026x", bundle, 100000));
        node.cmd("cmd", "acct", "op", "accounts.resetPassword", "args", args);
        String sp = snap(p);
        for (Dev d : new Dev[]{x, p, q}) d.m.syncNow();
        check("relogin".equals(x.m.acct.state) && "relogin".equals(p.m.acct.state) && "relogin".equals(q.m.acct.state) && snap(p).equals(sp),
            "三台都变成「要重新登录」，数据不变", p.m.acctState());
        r = login(p, "xiaoming", "shuxue2026a");
        check(!SyncJson.b(r, "ok") && "login".equals(SyncJson.s(r, "code")), "旧密码登录失败", r);
        r = login(p, "xiaoming", "newpass2026x");
        check(SyncJson.b(r, "ok") && SyncJson.b(r, "same"), "新密码登录成功（同一个组）", r);
        login(x, "xiaoming", "newpass2026x");
        login(q, "xiaoming", "newpass2026x");
        rounds(2, x, p, q);
        check(eq(x, p) && eq(p, q) && sameCids(x, p, q), "数据完整，三台一致", cidDiff(x, p, q));

        section("A7. 移除设备：被移除的回登录页、数据还在；其它设备不受影响（验收 13）");
        acctOp(node, "accounts.removeDevice", "user", "xiaoming", "dev", "acq");
        String sq = snap(q);
        q.m.syncNow();
        x.put("math", "k9", "移除后的新改动");
        rounds(2, x, p);
        q.sync();
        check("relogin".equals(q.m.acct.state) && snap(q).equals(sq) && !q.data.get("math").containsKey("k9"), "Q 回登录页，数据还在，收不到之后的新数据", q.m.acctState());
        check(eq(x, p) && sameCids(x, p), "X、P 照常同步", cidDiff(x, p));

        section("A8. 退出登录：停止同步，数据保留；再登录照常（验收 10 的一部分）");
        Map<String, Object> lo = SyncJson.obj(p.m.acctLogout());
        resetCounts();
        p.sync();
        check(SyncJson.b(lo, "ok") && "out".equals(p.m.acct.state) && REQS.get() == 0 && "out".equals(SyncJson.s(SyncJson.obj(p.lastEvent("account")), "state")),
            "退出登录后不发请求，状态 out", lo);
        check(!SyncJson.b(SyncJson.obj(p.m.joinOpen()), "ok") && !SyncJson.b(SyncJson.obj(p.m.leave()), "ok") && !SyncJson.b(SyncJson.obj(p.m.remove("acx800")), "ok"),
            "账号模式下加入码、退出同步组、移除设备都不能用");
        r = login(p, "xiaoming", "newpass2026x");
        rounds(2, x, p);
        check(SyncJson.b(r, "ok") && SyncJson.b(r, "same") && sameCids(x, p), "再登录：同一个组，照常同步", r);
        p.restart();
        acctCfg(p);
        check(p.m.acct.in() && p.m.inGroup() && p.m.tokCache == null && p.m.acct.devToken(p.m.st) != null, "重启（自动登录）：不用再输密码，通行证从本机解开", p.m.acctState());
        rounds(1, p);
        check(p.state().get("status").equals("ok"), "重启后照常同步", p.m.state());

        section("A9. 服务器搬家：已登录设备改地址，同组其它设备跟着改（组名单里的节点设置）");
        r = SyncJson.obj(x.m.acctServer("127.0.0.1:" + node.port));
        check(SyncJson.b(r, "ok") && x.m.g.node != null && ("127.0.0.1").equals(SyncJson.s(x.m.g.node, "h")), "改地址成功", r);
        rounds(2, x, p);
        check(SyncJson.n(p.m.g.node, "t", 0) == SyncJson.n(x.m.g.node, "t", 0), "另一台拿到新的节点设置", p.m.g.node);
        r = SyncJson.obj(x.m.acctServer("bad host!"));
        check(!SyncJson.b(r, "ok"), "地址格式不对被拒", r);

        section("A10. 节点数据丢了：账号组用注册码重建，通行证照常（账号在 admin.db 里）");
        node.cmd("cmd", "lose_db");
        x.m.syncNow();
        rounds(2, x, p);
        check(sameCids(x, p) && x.state().get("status").equals("ok"), "重建后两台照常同步", x.m.state());

        section("A11. 本机文件里没有明文密码、通行证、组密钥（验收 9）");
        List<String> leaks = new ArrayList<>();
        for (Dev d : new Dev[]{x, p, b1, b2}) {
            byte[] tok = d.m.acct.devToken(d.m.st);
            for (File f : listAll(d.dir)) {
                String s = new String(Files.readAllBytes(f.toPath()), StandardCharsets.ISO_8859_1);
                for (String needle : new String[]{"newpass2026x", "yuwen2026b", "shuxue2026a", SyncCrypto.b64e(tok), SyncCrypto.hex(tok), SyncCrypto.b64e(d.m.g.gk), SyncCrypto.hex(d.m.g.gk)})
                    if (s.contains(needle)) leaks.add(d.id + ":" + f.getName());
            }
        }
        check(leaks.isEmpty(), "四台设备的同步文件里搜不到密码、通行证、组密钥（原文 / hex / base64）", leaks);

        section("A12. PBKDF2 和标准实现一致；密码规则");
        byte[] s16 = SyncCrypto.rand(16);
        check(Arrays.equals(Account.pbkdf2(SyncCrypto.utf8("密码abc123"), s16, 1000, 32), Account.jcePbkdf2(SyncCrypto.utf8("密码abc123"), s16, 1000, 32)),
            "自己写的 PBKDF2-HMAC-SHA256 和 JCE 的结果一样");
        long t0 = System.nanoTime();
        Account.keys("abcdefg123", s16, Account.ITERS);
        System.out.printf("    （电脑上 %d 次 PBKDF2 用时 %.0f 毫秒）%n", Account.ITERS, (System.nanoTime() - t0) / 1e6);
        check(Account.pwProblem("xiaoming", "12345678") != null && Account.pwProblem("xiaoming", "password1") != null && Account.pwProblem("xiaoming", "xiaoming99") != null
            && Account.pwProblem("xiaoming", "abcabcabc1") == null && Account.pwProblem("xiaoming", "shuxue2026a") == null, "密码规则：纯数字、常见词、含用户名都不行");
        String recText = "kmrecov:1?k=" + SyncCrypto.b64e(REC.getPrivate().getEncoded()) + "&id=" + com.fjzk.teamadmin.AcctCrypto.kidOfPublic(REC.getPublic().getEncoded());
        Object[] pr = com.fjzk.teamadmin.AcctCrypto.parseRecovery(recText);
        check(pr[1].equals(com.fjzk.teamadmin.AcctCrypto.kidOfPublic(REC.getPublic().getEncoded())), "审批 App 导入恢复密钥：从私钥算出的编号和公钥的一致", pr[1]);
        boolean badId;
        try { com.fjzk.teamadmin.AcctCrypto.parseRecovery(recText.replaceAll("id=.*", "id=00000000")); badId = false; } catch (IllegalArgumentException e) { badId = true; }
        check(badId, "恢复密钥二维码的编号被改过 → 拒绝导入");
        track(x, p, q, b1, b2);
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
            else if (args[i].equals("--phase1")) only1 = true;
            else if (args[i].equals("--acct")) acctOnly = true;
        }
        if (root == null) root = new File(".").getAbsoluteFile();
        tmp = Files.createTempDirectory("km-sync-harness-").toFile();
        installTap();
        if (serve > 0) { HarnessServer.run(serve, remote); return; }
        long t0 = System.currentTimeMillis();
        NodeCtl node = new NodeCtl(remote);
        try {
            if (acctOnly && remote == null) {
                scenarioAccounts(node);         // --acct：只跑 #12 账号场景
            } else if (remote == null) {
                scenarioFaults(node);
                scenarioNoGroup();
                Dev[] d = scenarioCreateJoin(node, "dev");
                scenarioJoinSecurity(node, d[0], d[1]);
                scenarioJoinFull(node, d[0]);
                scenarioOrders(d[0], d[1], d[2]);
                scenarioRobust(node, d[0], d[1], d[2]);
                scenarioSecrets(node, d[0]);
                scenarioRemove(node, d[0], d[1], d[2]);
                scenarioRemoveTwo(node, "dev");
                scenarioOffline(node, d[0], d[1]);
                scenarioNodeAdmin(node, d[0], d[1]);
                if (!only1) {
                    // 第二期：局域网直连
                    Dev[] l = scenarioLanPair();
                    scenarioLanAuth(l[0], l[1]);
                    Dev lc = scenarioLanRelay(l[0], l[1]);
                    scenarioLanRobust(l[0], l[1], lc);
                    scenarioLanRemove(l[0], l[1], lc);
                    scenarioLanMixed(node);
                    scenarioLanNodeDue(node);
                }
                scenarioAccounts(node);         // #12 账号
            } else {
                System.out.println("真实节点 " + remote + "（临时测试邀请码，结束时删组、作废邀请码）");
                String tag = "t" + Long.toString(System.currentTimeMillis() % 100000, 36);
                Dev[] d = scenarioCreateJoin(node, tag);
                scenarioOrders(d[0], d[1], d[2]);
                scenarioRemove(node, d[0], d[1], d[2]);
                scenarioRemoveTwo(node, tag);
                if (!only1) scenarioLanMixed(node);
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
