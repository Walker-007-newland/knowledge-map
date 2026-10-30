package com.fjzk.knowledgemap;

import java.security.SecureRandom;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * KMBridge 的门卫（需求 #5）。addJavascriptInterface 注入的对象对页面里所有 frame（包括 B 站播放器 iframe）都可见，
 * Java 这边又分不清是哪个 frame 在调用，所以敏感方法都要带「每页令牌」：
 *   主页面的 km-shim.js 调 hello() → Java 在 UI 线程 issue(当前主页面地址) 拿到令牌 →
 *   web.evaluateJavascript 只送进主页面（iframe 拿不到）→ 之后每次调用第一个参数带令牌，先过 check()。
 * 规则表在构造函数里集中定义：哪些方法不需要令牌、需要令牌的方法允许在哪些页面调用。#1 的同步接口也在这里加行，不另做一套。
 * 纯 Java，不依赖 Android，电脑上用 android/test/BridgeGateTest.java 直接测。
 */
public class BridgeGate {
    /** 本 App 的页面：打包在 assets/www 里的 file:// 页面，和同一批文件的 https 虚拟地址（听写页） */
    public static final String WWW = "file:///android_asset/www/";
    public static final String ASSETS = "https://appassets.androidplatform.net/";
    public static final String[] APP = { WWW, ASSETS };
    public static final String[] APP_FILE = { WWW };
    /** #1 同步的安全页面：总入口、设备同步、我的数据、学习统计（这些页面不把学习数据放在内存里，合并写回不会被覆盖） */
    public static final String[] SAFE = { WWW + "index.html", WWW + "sync.html", WWW + "data.html", WWW + "pet/study.html" };
    public static final String[] SYNC_PAGE = { WWW + "sync.html" };
    /** #12 登录页：没登录时只能打开它 */
    public static final String[] LOGIN = { WWW + "login.html" };
    public static final String[] LOGIN_SYNC = { WWW + "login.html", WWW + "sync.html" };

    static final long KEEP_PREV_MS = 5000;      // 换新令牌后，上一张再保留 5 秒（切换瞬间正在进行的调用不失败）
    static final long HELLO_WINDOW_MS = 10000;  // hello 限速：10 秒内最多 10 次
    static final int HELLO_MAX = 10;

    /** 被拒时的日志出口（Android 上接 logcat）；只给方法名，不给参数 */
    public interface Log { void denied(String method, String page); }

    final Set<String> free = new HashSet<>();
    final Map<String, String[]> rules = new HashMap<>();
    final SecureRandom rnd = new SecureRandom();
    final ArrayDeque<Long> hellos = new ArrayDeque<>();
    final Set<String> loggedPages = new HashSet<>();
    Log log;

    String cur, curPage;
    String prev, prevPage;
    long prevUntil;
    int denied;                                   // 累计被拒次数（真机自检页用）

    public BridgeGate() {
        // 只读、不含个人数据：任何 frame 都能调
        free("hello", "appVersion", "widgetCount", "widgetInfo");
        // 本 App 页面才能调
        allow(APP, "speak", "stopSpeak", "ttsInfo", "saveFile", "updatePet", "savePetImage", "pinWidget",
            "openAppSettings", "keepScreenOn", "goBack", "checkUpdate");
        allow(APP, "deviceName", "sharedGet", "sharedPut");          // #2 我的数据
        // #1 第一期：设备同步。全部要令牌（syncState 含设备名也一样）；听写页（https 虚拟地址）不在 APP_FILE 里，调不到
        allow(APP_FILE, "syncState", "syncNow", "syncPublish");
        // 只在安全页面合并写回本机；#12 登录页登录成功后在这里合并（登录前不写学习数据）
        allow(cat(SAFE, LOGIN), "syncTake", "syncAck");
        // #12 账号：注册、登录、先离线学习只有登录页能调；退出登录只有「账号与同步」页；改服务器、找服务器、带结果的备份两页都能调
        allow(LOGIN, "acctRegister", "acctLogin", "acctOffline");
        allow(SYNC_PAGE, "acctLogout");
        allow(LOGIN_SYNC, "acctServer", "acctDiscover", "saveBackup");
        allow(APP_FILE, "acctState");
        allow(SYNC_PAGE, "nodeJoin", "nodeRemove", "joinOpen", "joinClose", "joinState", "joinScan", "joinConfirm",
            "syncRename", "syncRemove", "syncLeave");
        // #1 第二期：局域网配对，只在设备同步页
        allow(SYNC_PAGE, "pairOpen", "pairClose", "pairWith", "pairAddr", "pairConfirm");
    }

    static String[] cat(String[] a, String[] b) {
        String[] r = new String[a.length + b.length];
        System.arraycopy(a, 0, r, 0, a.length);
        System.arraycopy(b, 0, r, a.length, b.length);
        return r;
    }

    /** 不需要令牌的方法 */
    public final synchronized void free(String... methods) {
        for (String m : methods) { free.add(m); rules.remove(m); }
    }

    /**
     * 需要令牌的方法，以及允许的页面。页面写法：以 / 结尾表示这个目录下任意页，否则是完整的页面地址（不含 ? 和 #）
     */
    public final synchronized void allow(String[] pages, String... methods) {
        for (String m : methods) { rules.put(m, pages.clone()); free.remove(m); }
    }

    public synchronized void setLog(Log l) { log = l; }

    /** 给 pageUrl（签发时的主页面地址）发一张新令牌；限速超出时返回 null */
    public synchronized String issue(String pageUrl, long now) {
        while (!hellos.isEmpty() && now - hellos.peekFirst() >= HELLO_WINDOW_MS) hellos.pollFirst();
        if (hellos.size() >= HELLO_MAX) return null;
        hellos.addLast(now);
        byte[] b = new byte[16];
        rnd.nextBytes(b);
        StringBuilder sb = new StringBuilder(32);
        for (byte x : b) sb.append(Character.forDigit((x >> 4) & 15, 16)).append(Character.forDigit(x & 15, 16));
        if (cur != null) { prev = cur; prevPage = curPage; prevUntil = now + KEEP_PREV_MS; }
        cur = sb.toString();
        curPage = page(pageUrl);
        return cur;
    }

    /** 令牌有效，并且 method 允许在令牌所属的页面调用 */
    public synchronized boolean check(String token, String method, long now) {
        if (method == null) return false;
        if (free.contains(method)) return true;
        String[] pages = rules.get(method);
        String pg = null;
        if (token != null && pages != null) {
            if (token.equals(cur)) pg = curPage;
            else if (token.equals(prev) && now < prevUntil) pg = prevPage;
        }
        if (pg != null && allowed(pages, pg)) return true;
        denied++;
        String where = pg != null ? pg : curPage == null ? "?" : curPage;
        if (log != null && loggedPages.add(where)) log.denied(method, where);
        return false;
    }

    public synchronized int deniedCount() { return denied; }

    static boolean allowed(String[] pages, String pg) {
        for (String p : pages) {
            if (p.endsWith("/") ? pg.startsWith(p) : pg.equals(p)) return true;
        }
        return false;
    }

    /** 去掉 ? 和 # 后面的部分；含 ..（或编码过的 %2e）、反斜杠的地址一律不认（不当成本 App 页面） */
    static String page(String url) {
        if (url == null) return "";
        int k = url.length();
        int q = url.indexOf('?'), h = url.indexOf('#');
        if (q >= 0) k = Math.min(k, q);
        if (h >= 0) k = Math.min(k, h);
        String p = url.substring(0, k);
        return p.contains("..") || p.contains("\\") || p.toLowerCase(java.util.Locale.ROOT).contains("%2e") ? "" : p;
    }
}
