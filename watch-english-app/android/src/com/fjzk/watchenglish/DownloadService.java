package com.fjzk.watchenglish;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/** 前台下载服务：App 退到后台、锁屏也接着下；通知栏显示进度，全部下完自己停掉 */
public class DownloadService extends Service {
    static final String CHANNEL = "dl";
    static final int NID = 1, NID_DONE = 2;

    Thread worker;
    PowerManager.WakeLock wake;
    WifiManager.WifiLock wifi;
    Notification.Builder nb;
    int lastStart;

    static void kick(Context c) {
        Intent i = new Intent(c, DownloadService.class);
        if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i); else c.startService(i);
    }

    @Override
    public IBinder onBind(Intent i) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CHANNEL) == null) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "视频下载", NotificationManager.IMPORTANCE_LOW);
            nm.createNotificationChannel(ch);
        }
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        nb = (Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this))
            .setSmallIcon(android.R.drawable.stat_sys_download).setContentTitle("看剧学英文 · 下载视频").setContentText("准备下载…")
            .setOngoing(true).setOnlyAlertOnce(true).setContentIntent(open);
        if (Build.VERSION.SDK_INT >= 29) startForeground(NID, nb.build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
        else startForeground(NID, nb.build());
        synchronized (this) {
            lastStart = startId;
            if (worker == null || !worker.isAlive()) {
                worker = new Thread(this::work, "we-download");
                worker.start();
            }
        }
        return START_NOT_STICKY;
    }

    void work() {
        PowerManager pm = getSystemService(PowerManager.class);
        wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "watchenglish:download");
        wake.acquire(6 * 3600 * 1000L);
        WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        if (wm != null) { wifi = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "watchenglish:download"); wifi.acquire(); }
        Downloads d = Downloads.get(this);
        d.progress = this::show;
        String lastDone = null;
        int done = 0, failed = 0;
        try {
            Downloads.Job j;
            while ((j = d.next()) != null) {
                show(j);
                d.run(j);
                if ("done".equals(j.status)) { done++; lastDone = j.name; }
                else if ("error".equals(j.status)) failed++;
            }
        } finally {
            d.progress = null;
            if (wifi != null && wifi.isHeld()) wifi.release();
            if (wake.isHeld()) wake.release();
            int sid;
            synchronized (this) { worker = null; sid = lastStart; }
            finish(done, failed, lastDone, sid);
        }
    }

    void show(Downloads.Job j) {
        String text;
        int max = 0, cur = 0;
        if ("remuxing".equals(j.status)) text = "正在合并成 MP4…";
        else if ("hls".equals(j.kind) && j.segTotal > 0) {
            text = j.segDone + " / " + j.segTotal + " 段 · " + Downloads.mb(j.bytes);
            max = j.segTotal; cur = j.segDone;
        } else if (j.total > 0) {
            text = Downloads.mb(j.bytes) + " / " + Downloads.mb(j.total);
            max = 1000; cur = (int) (1000 * j.bytes / j.total);
        } else text = "已下载 " + Downloads.mb(j.bytes);
        nb.setContentTitle(j.name).setContentText(text).setProgress(max, cur, max == 0);
        getSystemService(NotificationManager.class).notify(NID, nb.build());
    }

    /** 只有这期间没人再叫过下载（sid 还是最新的）才真的停服务；否则新开的下载线程接着跑 */
    void finish(int done, int failed, String name, int sid) {
        if (Downloads.get(this).hasPending()) { kick(this); }
        else if (!stopSelfResult(sid)) return;
        if (done + failed > 0) {
            Notification.Builder b = (Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this))
                .setSmallIcon(failed > 0 ? android.R.drawable.stat_notify_error : android.R.drawable.stat_sys_download_done)
                .setContentTitle(failed > 0 ? "有 " + failed + " 个视频没下成" : "视频下载完成")
                .setContentText(done == 1 && failed == 0 ? name : "完成 " + done + " 个" + (failed > 0 ? "，失败 " + failed + " 个，打开 App 看原因" : ""))
                .setAutoCancel(true)
                .setContentIntent(PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                    PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT));
            getSystemService(NotificationManager.class).notify(NID_DONE, b.build());
        }
    }
}
