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
    static final String[] TOKEN_METHODS = { "speak", "stopSpeak", "saveFile", "updatePet", "savePetImage", "pinWidget",
        "openAppSettings", "keepScreenOn", "goBack", "checkUpdate", "deviceName", "sharedGet", "sharedPut" };
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

        System.out.println();
        System.out.println("通过 " + pass + "，失败 " + fail);
        System.exit(fail == 0 ? 0 : 1);
    }
}
