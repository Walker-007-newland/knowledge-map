package com.fjzk.knowledgemap.sync;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * SyncHarness --serve 端口：浏览器测试页 hub/tests/sync-harness.html 的后端。
 * 起 3 个同步内核实例（A、B、C，经真实的加入码流程进同一个组），连本地节点（或 --remote 真实节点），
 * 网页用真的 km-data.js / km-sync.js 合并，经这里的 /api/* 调内核（相当于 App 里的 KMBridge）。
 * 同时把 knowledge-map-app/hub 当静态文件发出来：http://127.0.0.1:端口/hub/tests/sync-harness.html
 */
final class HarnessServer {
    static SyncHarness.NodeCtl node;
    static final Map<String, SyncHarness.Dev> DEVS = new LinkedHashMap<>();
    static int resets;

    static void run(int port, String remote) throws Exception {
        node = new SyncHarness.NodeCtl(remote);
        Runtime.getRuntime().addShutdownHook(new Thread(HarnessServer::shutdown));
        HttpServer srv = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 32);
        srv.createContext("/", HarnessServer::handle);
        srv.start();
        // 第二个端口 = 另一个网页来源（origin），localStorage 和第一个端口分开：两台「平板」的总入口各开一个 iframe（#1 第二期第 4 轮返工）
        HttpServer srv2 = HttpServer.create(new InetSocketAddress("127.0.0.1", port + 1), 32);
        srv2.createContext("/", HarnessServer::handle);
        srv2.start();
        System.out.println("同步测试后端已启动（节点 " + node.host + ":" + node.port + "）");
        System.out.println("浏览器打开 http://127.0.0.1:" + port + "/hub/tests/sync-harness.html ，Ctrl+C 结束（结束时清理测试组）");
    }

    static synchronized void shutdown() {
        try {
            SyncHarness.cleanup(node);
            if (node.remote) SyncHarness.cleanupInvites(node); else node.close();
        } catch (Throwable ignored) { }
    }

    static void handle(HttpExchange ex) throws IOException {
        String path = ex.getRequestURI().getPath();
        try {
            if (path.startsWith("/api/")) {
                byte[] body = readAll(ex.getRequestBody());
                String out;
                synchronized (HarnessServer.class) { out = api(path.substring(5), query(ex), new String(body, StandardCharsets.UTF_8)); }
                send(ex, 200, "application/json; charset=utf-8", out.getBytes(StandardCharsets.UTF_8));
                return;
            }
            File base = new File(SyncHarness.root, "knowledge-map-app").getCanonicalFile();
            File f = new File(base, path.replaceFirst("^/+", "")).getCanonicalFile();
            if (!f.getPath().startsWith(base.getPath()) || !f.isFile()) { send(ex, 404, "text/plain", "404".getBytes()); return; }
            String n = f.getName();
            String type = n.endsWith(".html") ? "text/html; charset=utf-8" : n.endsWith(".js") ? "text/javascript; charset=utf-8"
                : n.endsWith(".json") ? "application/json" : n.endsWith(".css") ? "text/css" : "application/octet-stream";
            byte[] b = Files.readAllBytes(f.toPath());
            if (path.equals("/hub/index.html") && query(ex).containsKey("harness")) b = asDevice(new String(b, StandardCharsets.UTF_8)).getBytes(StandardCharsets.UTF_8);
            send(ex, 200, type, b);
        } catch (Throwable e) {
            send(ex, 500, "application/json; charset=utf-8", SyncJson.stringify(SyncJson.of("error", String.valueOf(e))).getBytes(StandardCharsets.UTF_8));
        }
    }

    /**
     * 真的总入口 hub/index.html 当成一台平板（?harness=A）：km-data.js 之前先按测试数据写好本机 localStorage（harness-pre.js），
     * 页面末尾加上 km-sync.js 和接到这里 /api 的模拟桥（harness-device.js），相当于打包时注入 km-sync.js、App 里的 KMApp
     */
    static String asDevice(String html) {
        String pre = "<script src=\"tests/harness-pre.js\"></script>\n<script src=\"km-data.js\"></script>";
        if (!html.contains("<script src=\"km-data.js\"></script>")) throw new IllegalStateException("index.html 里找不到 km-data.js");
        html = html.replace("<script src=\"km-data.js\"></script>", pre);
        return html.replace("</body>", "<script src=\"km-sync.js\"></script>\n<script src=\"tests/harness-device.js\"></script>\n</body>");
    }

    /** 各台总入口页的初始 localStorage（pageSeedPut 存、harness-pre.js 取） */
    static final Map<String, String> SEEDS = new LinkedHashMap<>();
    static int wifis;

    static String api(String op, Map<String, String> q, String body) throws Exception {
        if (op.equals("pageSeedPut")) { SEEDS.put(q.get("d"), body); return "{}"; }
        if (op.equals("pageSeed")) { String s = SEEDS.get(q.get("d")); return s == null ? "{}" : s; }
        if (op.equals("resetLan")) {
            // 真机第 4 轮的场景：A 用邀请码建节点组，B 经局域网配对加入（节点设置随组包带过去），两台都开着（同一个 Wi-Fi）
            resets++;
            for (SyncHarness.Dev d : DEVS.values()) { try { d.lanOff(); } catch (Throwable ignored) { } }
            DEVS.clear();
            String tag = "n" + resets + Long.toString(System.currentTimeMillis() % 46656, 36);
            SyncHarness.Dev a = new SyncHarness.Dev(tag + "A", "newland X800"), b = new SyncHarness.Dev(tag + "B", "Newland P70");
            DEVS.put("A", a); DEVS.put("B", b);
            String r = a.m.nodeJoin(SyncHarness.fixPort(SyncHarness.invite(node), node));
            if (!SyncJson.b(SyncJson.obj(r), "ok")) return r;
            a.m.syncNow();
            String wifi = "harness-wifi-" + (++wifis);
            a.lanOn(wifi);
            b.lanOn(wifi);
            boolean ok = SyncHarness.lanPairUp(b, a, true);
            SyncHarness.track(a, b);
            Map<String, Object> ids = SyncJson.map();
            for (Map.Entry<String, SyncHarness.Dev> e : DEVS.entrySet()) ids.put(e.getKey(), e.getValue().id);
            return SyncJson.stringify(SyncJson.of("ok", ok && b.m.inGroup() && b.m.g.node != null, "ids", ids));
        }
        if (op.equals("reset")) {
            for (SyncHarness.Dev d : DEVS.values()) { try { d.lanOff(); } catch (Throwable ignored) { } }
            // 每次重置：新的三台设备、新的同步组（旧的留到结束时一起清理）
            resets++;
            DEVS.clear();
            String tag = "w" + resets + Long.toString(System.currentTimeMillis() % 46656, 36);
            SyncHarness.Dev a = new SyncHarness.Dev(tag + "A", "家里的平板"), b = new SyncHarness.Dev(tag + "B", "学校的平板"), c = new SyncHarness.Dev(tag + "C", "妈妈的手机");
            DEVS.put("A", a); DEVS.put("B", b); DEVS.put("C", c);
            String r = a.m.nodeJoin(SyncHarness.fixPort(SyncHarness.invite(node), node));
            if (!SyncJson.b(SyncJson.obj(r), "ok")) return r;
            a.m.syncNow();
            boolean ok1 = SyncHarness.join(a, c), ok2 = SyncHarness.join(a, b);
            SyncHarness.track(a, b, c);
            Map<String, Object> ids = SyncJson.map();
            for (Map.Entry<String, SyncHarness.Dev> e : DEVS.entrySet()) ids.put(e.getKey(), e.getValue().id);
            return SyncJson.stringify(SyncJson.of("ok", ok1 && ok2 && b.m.inGroup() && c.m.inGroup(), "ids", ids));
        }
        if (op.equals("cids")) {
            Map<String, Object> r = SyncJson.map();
            for (Map.Entry<String, SyncHarness.Dev> e : DEVS.entrySet()) r.put(e.getKey(), new LinkedHashMap<String, Object>(e.getValue().m.cids()));
            return SyncJson.stringify(r);
        }
        if (op.equals("counts")) return SyncJson.stringify(new LinkedHashMap<String, Object>(SyncHarness.PATHS));
        if (op.equals("resetCounts")) { SyncHarness.resetCounts(); return "{}"; }
        SyncHarness.Dev d = DEVS.get(q.get("d"));
        if (d == null) return SyncJson.stringify(SyncJson.of("error", "没有设备 " + q.get("d") + "，先 reset"));
        SyncHarness.track(d);
        switch (op) {
            case "publish": return SyncJson.stringify(SyncJson.of("n", (long) d.m.publish(body)));
            case "sync": d.m.syncNow(); SyncHarness.track(d); return d.m.state();
            case "lan": {
                // 局域网那一轮：本机和在线组员交换清单、拉推（App 里是发布后 0.8 秒、发现组员、前台每 2 分钟），组员那边处理收件
                d.pump();
                d.m.lanSync(false);
                for (SyncHarness.Dev o : DEVS.values()) if (o != d) o.m.lanProcess();
                return d.m.state();
            }
            case "state": return d.m.state();
            case "take": return d.m.take();
            case "ack": d.m.ack(body); return "{}";
            default: return SyncJson.stringify(SyncJson.of("error", "不认识 " + op));
        }
    }

    static Map<String, String> query(HttpExchange ex) {
        String q = ex.getRequestURI().getRawQuery();
        return q == null ? new LinkedHashMap<>() : NodeClient.query(q);
    }

    static byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        byte[] buf = new byte[16384];
        int n;
        while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
        return o.toByteArray();
    }

    static void send(HttpExchange ex, int status, String type, byte[] b) throws IOException {
        ex.getResponseHeaders().set("Content-Type", type);
        ex.getResponseHeaders().set("Cache-Control", "no-store");
        ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        ex.sendResponseHeaders(status, b.length);
        try (OutputStream o = ex.getResponseBody()) { o.write(b); }
    }
}
