package com.fjzk.knowledgemap.sync;

import java.io.File;
import java.util.Map;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * 同步内核的「安全外壳」（纯 Java，Android 上由 SyncAndroid 包一层，电脑上 SyncHarness 直接测）：
 *  - 内核在后台线程里创建，创建失败（Keystore、写盘出错）只记一句原因，设备同步显示「暂时不可用」，绝不抛给调用方
 *  - 所有入口、所有后台任务都 catch(Throwable) 并记日志（Android 上 logcat 标签 KMSync），出错只影响设备同步
 *  - 网络和文件操作都在一个后台线程排队，JS 桥的方法立刻返回，结果经事件回到网页
 *  - 触发时机（#1 方案 v2 第四节「节点」一行）：回到前台、本机发布后 10 秒、前台每 15 分钟、切后台推一次；加入码轮询
 */
public final class SyncService {
    public interface Sink { void event(String type, String json); }
    public interface Log { void warn(String msg, Throwable e); }

    static final long AFTER_PUBLISH = 10000, EVERY = 15 * 60 * 1000L, AFTER_PAUSE = 1500;

    final ScheduledExecutorService ex;
    final Sink sink;
    final Log log;
    volatile SyncManager m;
    volatile String broken = "";
    volatile boolean foreground;
    ScheduledFuture<?> syncF, periodicF, pollF;

    public SyncService(final File dir, final SyncStore.KeyWrap kw, final SyncManager.Clock clock, Sink sink, Log log) {
        this.sink = sink;
        this.log = log;
        ScheduledThreadPoolExecutor e = new ScheduledThreadPoolExecutor(1, r -> {
            Thread t = new Thread(r, "kmsync");
            t.setDaemon(true);
            return t;
        });
        e.setRemoveOnCancelPolicy(true);
        ex = e;
        run("创建", () -> {
            SyncManager x = new SyncManager(new SyncStore(dir, kw), clock);
            x.setEvents((type, json) -> {
                try { SyncService.this.sink.event(type, json); } catch (Throwable t) { warn("发事件", t); }
                if ("join-result".equals(type) && json.contains("\"ok\":true")) syncSoon(300);
            });
            m = x;
        });
    }

    void warn(String what, Throwable t) {
        try { log.warn("设备同步出错（" + what + "）", t); } catch (Throwable ignored) { }
    }

    /** 在后台线程跑，任何异常都吞掉并记日志；内核还没建好 / 建不出来时跳过 */
    void run(final String what, final Runnable r) {
        try {
            ex.execute(() -> {
                try { r.run(); }
                catch (Throwable t) {
                    if (m == null && "创建".equals(what)) broken = t.getMessage() == null ? t.getClass().getSimpleName() : t.getMessage();
                    warn(what, t);
                    SyncManager x = m;
                    if (x != null) x.noteError(what, t);
                }
            });
        } catch (Throwable t) { warn(what, t); }
    }

    void withM(String what, java.util.function.Consumer<SyncManager> fn) {
        run(what, () -> { SyncManager x = m; if (x != null) fn.accept(x); });
    }

    // ------------------------------------------------------------ 触发时机

    public void setDevice(final String id, final String name) { withM("设备编号", x -> x.setDevice(id, name)); }

    public void onResume() {
        foreground = true;
        try {
            if (periodicF != null) periodicF.cancel(false);
            periodicF = ex.scheduleWithFixedDelay(() -> { if (foreground) runSync(); }, 1500, EVERY, TimeUnit.MILLISECONDS);
        } catch (Throwable t) { warn("回到前台", t); }
    }

    public void onPause() {
        foreground = false;
        try { if (periodicF != null) periodicF.cancel(false); } catch (Throwable t) { warn("切后台", t); }
        syncSoon(AFTER_PAUSE);
    }

    public synchronized void syncSoon(long delay) {
        try {
            if (syncF != null) syncF.cancel(false);
            syncF = ex.schedule(this::runSync, delay, TimeUnit.MILLISECONDS);
        } catch (Throwable t) { warn("安排同步", t); }
    }

    void runSync() {
        try { SyncManager x = m; if (x != null) x.syncNow(); }
        catch (Throwable t) { warn("同步", t); SyncManager x = m; if (x != null) x.noteError("同步", t); }
    }

    synchronized void startPoll(long delay) {
        try {
            if (pollF != null) pollF.cancel(false);
            pollF = ex.schedule(this::poll, delay, TimeUnit.MILLISECONDS);
        } catch (Throwable t) { warn("加入码轮询", t); }
    }

    void poll() {
        long d;
        try { SyncManager x = m; d = x == null ? -1 : x.joinPoll(); } catch (Throwable t) { warn("加入码轮询", t); d = 5000; }
        if (d > 0) startPoll(d);
    }

    // ------------------------------------------------------------ 有返回值的接口（JS 桥线程直接调，只读，绝不抛出）

    /** 内核坏了时也给一份能显示的状态：没加入组 + 一句原因（总入口不显示标签） */
    public String state() {
        try {
            SyncManager x = m;
            if (x != null) return x.state();
            String why = broken.isEmpty() ? "设备同步正在启动，请稍等" : "设备同步暂时不可用（" + broken + "），不影响学习；可以重启 App 再试";
            return SyncJson.stringify(SyncJson.of("inGroup", false, "unavailable", true, "notice", why, "status", "none", "members", new java.util.ArrayList<Object>()));
        } catch (Throwable t) { warn("读状态", t); return ""; }
    }

    public String take() {
        try { SyncManager x = m; return x == null ? "[]" : x.take(); } catch (Throwable t) { warn("取收件箱", t); return "[]"; }
    }

    public String joinState() {
        try { SyncManager x = m; return x == null ? "{}" : x.joinState(); } catch (Throwable t) { warn("加入码状态", t); return "{}"; }
    }

    // ------------------------------------------------------------ 没有返回值的接口（排进后台线程）

    public void publish(final String json) { withM("发布", x -> { if (x.publish(json) > 0) syncSoon(AFTER_PUBLISH); }); }

    public void ack(final String json) { withM("确认收件", x -> x.ack(json)); }

    public void syncNow() { syncSoon(0); }

    interface Op { String run(SyncManager x); }

    void act(final String op, final Op fn, final boolean thenSync) {
        run(op, () -> {
            SyncManager x = m;
            Map<String, Object> o;
            if (x == null) o = SyncJson.of("ok", false, "msg", "设备同步暂时不可用" + (broken.isEmpty() ? "，请稍等再试" : "（" + broken + "）"));
            else {
                String r;
                try { r = fn.run(x); } catch (Throwable e) { warn(op, e); r = SyncManager.res(false, "出错：" + e.getMessage()); }
                o = SyncJson.obj(r);
            }
            o.put("op", op);
            emit("action-result", o);
            if (thenSync && SyncJson.b(o, "ok")) syncSoon(0);
        });
    }

    void emit(String type, Map<String, Object> o) {
        try { sink.event(type, SyncJson.stringify(o)); } catch (Throwable t) { warn("发事件", t); }
    }

    public void nodeJoin(final String text) { act("nodeJoin", x -> x.nodeJoin(text), true); }

    public void nodeRemove() { act("nodeRemove", SyncManager::nodeRemove, false); }

    public void rename(final String dev, final String name) { act("rename", x -> x.rename(dev, name), true); }

    public void remove(final String dev) { act("remove", x -> x.remove(dev), true); }

    public void leave() { act("leave", SyncManager::leave, false); }

    public void joinOpen() {
        run("加入码", () -> {
            SyncManager x = m;
            Map<String, Object> o = x == null ? SyncJson.of("ok", false, "msg", "设备同步暂时不可用") : SyncJson.obj(x.joinOpen());
            if (SyncJson.b(o, "ok")) startPoll(3000);
            else { o.put("role", "host"); emit("join-result", o); }
        });
    }

    public void joinClose() {
        run("加入码", () -> {
            synchronized (this) { if (pollF != null) pollF.cancel(false); }
            SyncManager x = m;
            if (x != null) x.joinClose();
        });
    }

    public void joinScan(final String text) {
        run("扫加入码", () -> {
            SyncManager x = m;
            Map<String, Object> o = x == null ? SyncJson.of("ok", false, "msg", "设备同步暂时不可用") : SyncJson.obj(x.joinScan(text));
            if (SyncJson.b(o, "ok")) startPoll(2000);
            else { o.put("role", "guest"); emit("join-result", o); }
        });
    }

    public void joinConfirm(final boolean ok) {
        run("确认加入", () -> {
            SyncManager x = m;
            Map<String, Object> o = x == null ? SyncJson.of("ok", false, "msg", "设备同步暂时不可用") : SyncJson.obj(x.joinConfirm(ok));
            if (!SyncJson.b(o, "ok")) { o.put("role", "host"); emit("join-result", o); }
            else if (ok) syncSoon(0);
        });
    }

    /** 测试用：等后台线程把已排队的任务做完 */
    public void drain() {
        try { ex.submit(() -> { }).get(30, TimeUnit.SECONDS); } catch (Throwable ignored) { }
    }

    public SyncManager manager() { return m; }
}
