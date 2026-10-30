package com.fjzk.knowledgemap;

import java.util.ArrayList;
import java.util.List;

/**
 * BridgeGate 的电脑端测试（需求 #5），不依赖 Android，build.ps1 不打包。在 knowledge-map-app 目录下：
 *   javac -encoding UTF-8 -d android/test/out android/src/com/fjzk/knowledgemap/BridgeGate.java android/test/BridgeGateTest.java
 *   java -cp android/test/out com.fjzk.knowledgemap.BridgeGateTest
 * 全部通过退出码 0，有失败退出码 1。
 */
public class BridgeGateTest {
    static int pass, fail;

    static void ok(boolean c, String msg) {
        if (c) { pass++; System.out.println("  ok   " + msg); }
        else { fail++; System.out.println("  FAIL " + msg); }
    }

    static final String MAP = BridgeGate.WWW + "math-map/index.html";
    static final String DATA = BridgeGate.WWW + "data.html";
    static final String DICT = BridgeGate.ASSETS + "english-map/dictation.html";
    static final String BILI = "https://player.bilibili.com/player.html?bvid=BV1xx411c7mD&autoplay=0";

    /** 规则表里所有需要令牌的方法（和 MainActivity.Bridge 一致） */
    static final String[] TOKEN_METHODS = { "speak", "stopSpeak", "ttsInfo", "saveFile", "updatePet", "savePetImage", "pinWidget",
        "openAppSettings", "keepScreenOn", "goBack", "checkUpdate", "deviceName", "sharedGet", "sharedPut" };
    static final String[] SYNC_METHODS = { "syncState", "syncNow", "syncPublish", "syncTake", "syncAck", "nodeJoin", "nodeRemove",
        "joinOpen", "joinClose", "joinState", "joinScan", "joinConfirm", "syncRename", "syncRemove", "syncLeave",
        "pairOpen", "pairClose", "pairWith", "pairAddr", "pairConfirm" };
    /** #1 第二期：局域网配对，只在设备同步页 */
    static final String[] PAIR_METHODS = { "pairOpen", "pairClose", "pairWith", "pairAddr", "pairConfirm" };
    static final String[] FREE_METHODS = { "hello", "appVersion", "widgetCount", "widgetInfo" };

    public static void main(String[] args) {
        long t = 1_000_000;

        System.out.println("1. 不带令牌、错令牌");
        BridgeGate g = new BridgeGate();
        String tok = g.issue(MAP, t);
        ok(tok != null && tok.matches("[0-9a-f]{32}"), "令牌是 32 位十六进制（128 位随机）");
        for (String m : TOKEN_METHODS) ok(!g.check(null, m, t), "不带令牌调 " + m + " 被拒");
        ok(!g.check("", "speak", t), "空字符串令牌被拒");
        ok(!g.check("00000000000000000000000000000000", "saveFile", t), "猜的令牌被拒");
        ok(!g.check(tok.toUpperCase(), "saveFile", t) || tok.equals(tok.toUpperCase()), "大小写不同的令牌被拒");
        ok(!g.check(tok, "noSuchMethod", t), "规则表里没有的方法一律拒绝");
        ok(!g.check(tok, null, t), "方法名为空被拒");
        for (String m : FREE_METHODS) ok(g.check(null, m, t), m + " 不需要令牌");

        System.out.println("2. 当前令牌、上一张保留 5 秒、过期");
        for (String m : TOKEN_METHODS) ok(g.check(tok, m, t), "当前令牌在图谱页调 " + m + " 通过");
        String tok2 = g.issue(MAP, t + 100);
        ok(tok2 != null && !tok2.equals(tok), "再 hello 一次换新令牌");
        ok(g.check(tok2, "speak", t + 100), "新令牌通过");
        ok(g.check(tok, "speak", t + 100 + 4999), "上一张在 5 秒内仍通过");
        ok(!g.check(tok, "speak", t + 100 + 5000), "上一张超过 5 秒被拒（过期）");
        ok(g.check(tok2, "speak", t + 100 + 60000), "当前令牌不会自己过期");
        String tok3 = g.issue(MAP, t + 200);
        ok(!g.check(tok, "speak", t + 210), "再上一张（倒数第三张）立即作废");
        ok(g.check(tok2, "speak", t + 210) && g.check(tok3, "speak", t + 210), "上一张和当前都通过");

        System.out.println("3. 按页面限制（示例规则 syncTake 只在 data.html）");
        g = new BridgeGate();
        g.allow(new String[] { DATA }, "syncTake");
        String onData = g.issue(DATA + "#import", t);
        ok(g.check(onData, "syncTake", t), "令牌签发在 data.html（带 #）时 syncTake 通过");
        String onMap = g.issue(MAP, t + 10);
        ok(!g.check(onMap, "syncTake", t + 20), "令牌签发在图谱页时 syncTake 被拒");
        ok(g.check(onMap, "saveFile", t + 20), "图谱页令牌仍能调普通方法");
        ok(g.check(onData, "syncTake", t + 20), "data.html 的上一张在 5 秒内仍按 data.html 放行");
        String onDict = g.issue(DICT + "?x=1", t + 30);
        ok(g.check(onDict, "sharedGet", t + 40), "https 虚拟地址的听写页能调 sharedGet");
        ok(!g.check(onDict, "syncTake", t + 40), "听写页不能调 syncTake");
        g.allow(BridgeGate.APP_FILE, "syncState");
        ok(!g.check(onDict, "syncState", t + 40), "APP_FILE 规则：https 虚拟地址被拒");
        String onMap2 = g.issue(MAP, t + 50);
        ok(g.check(onMap2, "syncState", t + 60), "APP_FILE 规则：file:// 图谱页通过");

        System.out.println("4. 第三方页面签发的令牌对所有方法都拒绝");
        g = new BridgeGate();
        String bili = g.issue(BILI, t);
        for (String m : TOKEN_METHODS) ok(!g.check(bili, m, t), "B 站页面的令牌调 " + m + " 被拒");
        String[] tricky = { "file:///android_asset/www/../../data/data/x.html", "file:///android_asset/www/%2e%2e/x.html",
            "https://appassets.androidplatform.net.evil.com/a.html", "http://appassets.androidplatform.net/a.html",
            "file:///sdcard/Download/x.html", "file:///android_asset/wwwx/index.html", "", null };
        for (String u : tricky) {
            String k = g.issue(u, t + 1);
            ok(!g.check(k, "saveFile", t + 1), "页面地址 " + u + " 的令牌被拒");
        }
        g = new BridgeGate();
        g.allow(new String[] { DATA }, "syncTake");
        String fake = g.issue(DATA + ".evil", t);
        ok(!g.check(fake, "syncTake", t), "完整页面规则不是前缀匹配（data.html.evil 被拒）");

        System.out.println("5. hello 限速：10 秒内最多 10 次");
        g = new BridgeGate();
        String last = null;
        for (int i = 0; i < 10; i++) { String k = g.issue(MAP, t + i * 100); ok(k != null, "第 " + (i + 1) + " 次签发"); last = k; }
        ok(g.issue(MAP, t + 1000) == null, "10 秒内第 11 次不签发");
        ok(g.check(last, "speak", t + 1000), "被限速时原来的令牌照常能用");
        ok(g.issue(MAP, t + 10000) != null, "第 1 次满 10 秒后又能签发");

        System.out.println("6. 被拒日志：每页只打一次，不含参数");
        g = new BridgeGate();
        final List<String> logs = new ArrayList<>();
        g.setLog(new BridgeGate.Log() { public void denied(String m, String p) { logs.add(m + " @ " + p); } });
        g.issue(MAP, t);
        g.check(null, "speak", t); g.check(null, "saveFile", t); g.check("x", "sharedGet", t);
        ok(logs.size() == 1 && logs.get(0).startsWith("speak"), "同一页面多次被拒只打一行：" + logs);
        g.issue(DATA, t + 1);
        g.check(null, "goBack", t + 2);
        ok(logs.size() == 2, "换了页面再被拒打第二行");
        ok(g.deniedCount() == 4, "累计被拒次数 = 4（实际 " + g.deniedCount() + "）");

        System.out.println("7. #1 设备同步接口");
        g = new BridgeGate();
        String notes = g.issue(BridgeGate.WWW + "skills-map/notes.html", t);
        ok(!g.check(notes, "syncTake", t), "skills-map 笔记页（有 B 站 iframe）的令牌调 syncTake 被拒");
        ok(!g.check(notes, "syncAck", t), "笔记页的令牌调 syncAck 被拒");
        ok(g.check(notes, "syncPublish", t), "笔记页（file:// 页面）能发布 syncPublish");
        for (String m : SYNC_METHODS) ok(!g.check(null, m, t), "不带令牌调 " + m + " 被拒");
        String dataTok = g.issue(DATA, t + 1);
        ok(!g.check(dataTok, "syncRemove", t + 2), "data.html 调 syncRemove 被拒");
        ok(!g.check(dataTok, "nodeJoin", t + 2), "data.html 调 nodeJoin 被拒");
        ok(g.check(dataTok, "syncTake", t + 2) && g.check(dataTok, "syncAck", t + 2), "data.html 能 syncTake / syncAck");
        String syncTok = g.issue(BridgeGate.WWW + "sync.html", t + 3);
        for (String m : SYNC_METHODS) ok(g.check(syncTok, m, t + 4), "sync.html 调 " + m + " 通过");
        String home = g.issue(BridgeGate.WWW + "index.html", t + 5);
        ok(g.check(home, "syncTake", t + 6) && g.check(home, "syncState", t + 6) && !g.check(home, "syncLeave", t + 6), "总入口能取收件箱、看状态，不能退出同步组");
        String study = g.issue(BridgeGate.WWW + "pet/study.html", t + 7);
        ok(g.check(study, "syncTake", t + 8), "学习统计页能 syncTake");
        String pet = g.issue(BridgeGate.WWW + "pet/index.html", t + 9);
        ok(!g.check(pet, "syncTake", t + 10) && g.check(pet, "syncPublish", t + 10), "宠物页不能 syncTake（数据在内存里），能发布");
        String dict = g.issue(DICT, t + 11);
        for (String m : SYNC_METHODS) ok(!g.check(dict, m, t + 12), "听写页（https 虚拟地址）调 " + m + " 被拒");
        String bili2 = g.issue(BILI, t + 13);
        for (String m : SYNC_METHODS) ok(!g.check(bili2, m, t + 14), "B 站页面的令牌调 " + m + " 被拒");
        String fakeSync = g.issue(BridgeGate.WWW + "sync.html.evil", t + 15);
        ok(!g.check(fakeSync, "syncLeave", t + 16), "sync.html.evil 不算同步页");

        System.out.println("8. #1 第二期：局域网配对接口只在设备同步页");
        g = new BridgeGate();
        String[] others = { BridgeGate.WWW + "index.html", DATA, BridgeGate.WWW + "pet/study.html", MAP, BridgeGate.WWW + "skills-map/notes.html", BridgeGate.WWW + "pet/index.html" };
        long tt = t + 100000;
        for (String pg : others) {
            String k = g.issue(pg, tt);
            for (String m : PAIR_METHODS) ok(!g.check(k, m, tt + 1), pg.substring(pg.lastIndexOf("www/") + 4) + " 调 " + m + " 被拒");
            tt += 20000;                      // 避开 hello 限速
        }
        for (String m : PAIR_METHODS) ok(!g.check(null, m, tt), "不带令牌调 " + m + " 被拒");
        String sk2 = g.issue(BridgeGate.WWW + "sync.html", tt + 1);
        for (String m : PAIR_METHODS) ok(g.check(sk2, m, tt + 2), "sync.html 调 " + m + " 通过");
        String dk = g.issue(DICT, tt + 3);
        String bk = g.issue(BILI, tt + 5);
        for (String m : PAIR_METHODS) ok(!g.check(dk, m, tt + 6) && !g.check(bk, m, tt + 6), "听写页、B 站页面调 " + m + " 被拒");

        System.out.println("9. #12 账号：注册、登录、先离线学习只在登录页；退出登录只在账号与同步页；登录页能合并（syncTake / syncAck）");
        g = new BridgeGate();
        String LOGIN = BridgeGate.WWW + "login.html";
        String[] LOGIN_ONLY = { "acctRegister", "acctLogin", "acctOffline" };
        long ta = t + 400000;
        String lk = g.issue(LOGIN + "?x=1#y", ta);
        for (String m : LOGIN_ONLY) ok(g.check(lk, m, ta + 1), "login.html 调 " + m + " 通过");
        for (String m : new String[]{"acctState", "acctServer", "acctDiscover", "saveBackup", "syncTake", "syncAck", "syncState", "syncPublish", "syncNow"})
            ok(g.check(lk, m, ta + 1), "login.html 调 " + m + " 通过");
        ok(!g.check(lk, "acctLogout", ta + 1), "login.html 调 acctLogout 被拒");
        for (String m : SYNC_METHODS) if (!m.startsWith("sync")) ok(!g.check(lk, m, ta + 1), "login.html 调 " + m + " 被拒（加入码、移除设备等不在登录页）");
        for (String m : PAIR_METHODS) ok(!g.check(lk, m, ta + 1), "login.html 调 " + m + " 被拒");
        ta += 20000;
        String sk3 = g.issue(BridgeGate.WWW + "sync.html", ta);
        ok(g.check(sk3, "acctLogout", ta + 1) && g.check(sk3, "acctServer", ta + 1) && g.check(sk3, "acctDiscover", ta + 1) && g.check(sk3, "saveBackup", ta + 1),
            "sync.html 能退出登录、改服务器、找服务器、备份");
        for (String m : LOGIN_ONLY) ok(!g.check(sk3, m, ta + 1), "sync.html 调 " + m + " 被拒");
        String[] notLogin = { BridgeGate.WWW + "index.html", DATA, BridgeGate.WWW + "pet/study.html", MAP, BridgeGate.WWW + "skills-map/notes.html",
            BridgeGate.WWW + "pet/index.html", BridgeGate.WWW + "login.html.evil", BridgeGate.WWW + "x/../login.html" };
        for (String pg : notLogin) {
            ta += 20000;
            String k = g.issue(pg, ta);
            for (String m : LOGIN_ONLY) ok(!g.check(k, m, ta + 1), pg.substring(pg.lastIndexOf("www/") + 4) + " 调 " + m + " 被拒");
            ok(!g.check(k, "acctLogout", ta + 1) && !g.check(k, "saveBackup", ta + 1), pg.substring(pg.lastIndexOf("www/") + 4) + " 调 acctLogout、saveBackup 被拒");
        }
        ta += 20000;
        String dk2 = g.issue(DICT, ta), bk2 = g.issue(BILI, ta + 1);
        for (String m : new String[]{"acctState", "acctRegister", "acctLogin", "acctLogout", "acctServer", "acctOffline", "saveBackup"})
            ok(!g.check(dk2, m, ta + 2) && !g.check(bk2, m, ta + 2) && !g.check(null, m, ta + 2), "听写页、B 站页面、不带令牌调 " + m + " 被拒");

        System.out.println();
        System.out.println("通过 " + pass + "，失败 " + fail);
        System.exit(fail == 0 ? 0 : 1);
    }
}
