package com.fjzk.knowledgemap;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInstaller;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * 在线更新：查 GitHub 最新 Release（连不上就读 jsDelivr 镜像），版本号比当前新就提示；
 * 依次从 jsDelivr 镜像、GitHub 下载 knowledge-map.apk，再交给系统安装器覆盖安装。
 * 只有这里会联网，图谱内容本身是离线的。版本号格式 yyyy.MM.dd.HHmm，按字符串比较即可。
 */
class Updater {
    static final String REPO = "Walker-007-newland/knowledge-map";
    static final String LATEST_API = "https://api.github.com/repos/" + REPO + "/releases/latest";
    // jsDelivr 镜像（publish.ps1 把 APK 推到 apk 分支并打 tag apk-v<版本>），国内一般能访问
    static final String[] CDNS = { "cdn.jsdelivr.net", "fastly.jsdelivr.net" };
    static final String APK_NAME = "knowledge-map.apk";
    static final String ACTION_STATUS = "com.fjzk.knowledgemap.INSTALL_STATUS";
    static final int REQ_INSTALL_PERM = 2;

    final Activity act;
    boolean busy;
    volatile boolean cancelled;
    File pendingApk;

    final BroadcastReceiver statusReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context c, Intent i) {
            int status = i.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE);
            if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
                Intent confirm = i.getParcelableExtra(Intent.EXTRA_INTENT);
                if (confirm != null) {
                    confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    act.startActivity(confirm);
                }
            } else if (status != PackageInstaller.STATUS_SUCCESS) {
                String msg = i.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE);
                toast(status == PackageInstaller.STATUS_FAILURE_ABORTED ? "已取消安装" : "安装失败" + (msg == null ? "" : "：" + msg));
            }
        }
    };

    Updater(Activity act) {
        this.act = act;
        IntentFilter f = new IntentFilter(ACTION_STATUS);
        if (Build.VERSION.SDK_INT >= 33) act.registerReceiver(statusReceiver, f, Context.RECEIVER_NOT_EXPORTED);
        else act.registerReceiver(statusReceiver, f);
    }

    void destroy() {
        try { act.unregisterReceiver(statusReceiver); } catch (IllegalArgumentException ignored) { }
    }

    String currentVersion() {
        try { return act.getPackageManager().getPackageInfo(act.getPackageName(), 0).versionName; }
        catch (Exception e) { return ""; }
    }

    /** manual = 用户点了“检查更新”：没有新版本或出错时也要告诉用户 */
    void check(final boolean manual) {
        if (busy) return;
        busy = true;
        if (manual) toast("正在检查更新…");
        new Thread(new Runnable() {
            public void run() {
                String latest = null, notes = "";
                long size = 0;
                // 先问 GitHub 接口，连不上再读 jsDelivr 镜像上的 version.json
                try {
                    JSONObject rel = new JSONObject(httpGet(LATEST_API));
                    latest = rel.getString("tag_name").replaceFirst("^v", "");
                    notes = rel.optString("body", "");
                    JSONArray assets = rel.getJSONArray("assets");
                    for (int k = 0; k < assets.length(); k++) {
                        JSONObject a = assets.getJSONObject(k);
                        if (APK_NAME.equals(a.getString("name"))) size = a.optLong("size");
                    }
                } catch (Exception e) {
                    for (String cdn : CDNS) {
                        try {
                            JSONObject v = new JSONObject(httpGet("https://" + cdn + "/gh/" + REPO + "@apk/version.json"));
                            latest = v.getString("version");
                            notes = v.optString("notes", "");
                            size = v.optLong("size");
                            break;
                        } catch (Exception ignored) { }
                    }
                }
                final String cur = currentVersion();
                if (latest == null) {
                    busy = false;
                    if (manual) toast("检查更新失败，请确认已联网");
                    return;
                }
                if (latest.compareTo(cur) <= 0) {
                    busy = false;
                    if (manual) toast("已经是最新版本（" + cur + "）");
                    return;
                }
                final String fLatest = latest, fNotes = notes;
                final long fSize = size;
                act.runOnUiThread(new Runnable() {
                    public void run() { offer(cur, fLatest, fNotes, fSize); }
                });
            }
        }).start();
    }

    /** 下载来源，按顺序尝试：国内能访问的 jsDelivr 镜像在前，GitHub 直连兜底 */
    static String[] sources(String version) {
        String[] list = new String[CDNS.length + 1];
        for (int k = 0; k < CDNS.length; k++)
            list[k] = "https://" + CDNS[k] + "/gh/" + REPO + "@apk-v" + version + "/" + APK_NAME;
        list[CDNS.length] = "https://github.com/" + REPO + "/releases/download/v" + version + "/" + APK_NAME;
        return list;
    }

    void offer(String cur, final String latest, String notes, final long size) {
        if (act.isFinishing()) { busy = false; return; }
        String msg = "当前版本：" + cur + "\n最新版本：" + latest
            + (size > 0 ? String.format("（%.1f MB）", size / 1048576.0) : "")
            + (notes.isEmpty() ? "" : "\n\n" + notes)
            + "\n\n更新后学习进度会保留。";
        new AlertDialog.Builder(act)
            .setTitle("发现新版本")
            .setMessage(msg)
            .setPositiveButton("立即更新", new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface d, int w) { download(latest, size); }
            })
            .setNegativeButton("以后再说", new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface d, int w) { busy = false; }
            })
            .setOnCancelListener(new DialogInterface.OnCancelListener() {
                public void onCancel(DialogInterface d) { busy = false; }
            })
            .show();
    }

    void download(final String version, final long expected) {
        cancelled = false;
        int pad = (int) (20 * act.getResources().getDisplayMetrics().density);
        LinearLayout box = new LinearLayout(act);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(pad, pad / 2, pad, 0);
        final ProgressBar bar = new ProgressBar(act, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        final TextView label = new TextView(act);
        label.setText("正在连接…");
        box.addView(bar);
        box.addView(label);
        final AlertDialog dlg = new AlertDialog.Builder(act)
            .setTitle("正在下载更新")
            .setView(box)
            .setCancelable(false)
            .setNegativeButton("取消", new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface d, int w) { cancelled = true; }
            })
            .show();

        final File apk = new File(act.getCacheDir(), "update.apk");
        final String[] urls = sources(version);
        new Thread(new Runnable() {
            public void run() {
                boolean ok = false;
                for (int k = 0; k < urls.length && !ok && !cancelled; k++) {
                    final String src = "线路 " + (k + 1) + "/" + urls.length;
                    act.runOnUiThread(new Runnable() {
                        public void run() { bar.setProgress(0); label.setText(src + "：正在连接…"); }
                    });
                    try {
                        fetch(urls[k], apk, expected, src, bar, label);
                        ok = true;
                    } catch (Exception e) {
                        apk.delete();
                    }
                }
                final boolean fOk = ok;
                act.runOnUiThread(new Runnable() {
                    public void run() {
                        try { dlg.dismiss(); } catch (Exception ignored) { }
                        busy = false;
                        if (fOk) install(apk);
                        else if (cancelled) toast("已取消下载");
                        else failed(urls[0], version, expected);
                    }
                });
            }
        }).start();
    }

    /** 下载一个来源；大小不对（比如被重定向到错误页）也算失败 */
    void fetch(String url, File apk, long expected, final String src, final ProgressBar bar, final TextView label) throws IOException {
        HttpURLConnection c = open(url);
        long total = c.getContentLength() > 0 ? c.getContentLength() : expected;
        InputStream in = c.getInputStream();
        OutputStream out = new FileOutputStream(apk);
        long done = 0;
        try {
            byte[] buf = new byte[64 * 1024];
            int n, lastPct = -1;
            while ((n = in.read(buf)) > 0) {
                if (cancelled) throw new IOException("cancelled");
                out.write(buf, 0, n);
                done += n;
                final int pct = total > 0 ? (int) (done * 100 / total) : 0;
                if (pct != lastPct) {
                    lastPct = pct;
                    final String text = src + String.format("：%.1f / %.1f MB", done / 1048576.0, total / 1048576.0);
                    act.runOnUiThread(new Runnable() {
                        public void run() { bar.setProgress(pct); label.setText(text); }
                    });
                }
            }
        } finally { out.close(); in.close(); c.disconnect(); }
        if (expected > 0 && done != expected) throw new IOException("size mismatch " + done);
    }

    void failed(final String browserUrl, final String version, final long expected) {
        if (act.isFinishing()) return;
        new AlertDialog.Builder(act)
            .setTitle("下载失败")
            .setMessage("所有下载线路都连不上。可以稍后重试，或者用浏览器下载后手动安装（直接覆盖安装，进度会保留）。")
            .setPositiveButton("重试", new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface d, int w) { busy = true; download(version, expected); }
            })
            .setNeutralButton("用浏览器下载", new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface d, int w) {
                    try { act.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(browserUrl))); } catch (Exception ignored) { }
                }
            })
            .setNegativeButton("取消", null)
            .show();
    }

    void install(File apk) {
        // Android 8 起需要用户允许本应用“安装未知应用”，第一次更新时引导去设置里打开
        if (Build.VERSION.SDK_INT >= 26 && !act.getPackageManager().canRequestPackageInstalls()) {
            pendingApk = apk;
            new AlertDialog.Builder(act)
                .setTitle("需要允许安装")
                .setMessage("请在接下来的设置页面里打开“允许来自此来源的应用”，然后返回继续更新。")
                .setPositiveButton("去设置", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface d, int w) {
                        act.startActivityForResult(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                            Uri.parse("package:" + act.getPackageName())), REQ_INSTALL_PERM);
                    }
                })
                .setNegativeButton("取消", null)
                .show();
            return;
        }
        try {
            PackageInstaller pi = act.getPackageManager().getPackageInstaller();
            int sid = pi.createSession(new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL));
            PackageInstaller.Session s = pi.openSession(sid);
            InputStream in = new FileInputStream(apk);
            OutputStream out = s.openWrite("base.apk", 0, apk.length());
            try {
                byte[] buf = new byte[64 * 1024];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                s.fsync(out);
            } finally { out.close(); in.close(); }
            Intent i = new Intent(ACTION_STATUS).setPackage(act.getPackageName());
            int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 31 ? PendingIntent.FLAG_MUTABLE : 0);
            s.commit(PendingIntent.getBroadcast(act, sid, i, flags).getIntentSender());
            s.close();
        } catch (Exception e) {
            toast("安装失败：" + e.getMessage());
        }
    }

    /** 从“允许安装未知应用”设置页返回 */
    boolean onActivityResult(int req) {
        if (req != REQ_INSTALL_PERM) return false;
        if (pendingApk != null && act.getPackageManager().canRequestPackageInstalls()) install(pendingApk);
        else toast("没有获得安装权限，更新已取消");
        pendingApk = null;
        return true;
    }

    static HttpURLConnection open(String url) throws IOException {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(8000);
        c.setReadTimeout(20000);
        c.setInstanceFollowRedirects(true);
        c.setRequestProperty("User-Agent", "knowledge-map-app");
        c.setRequestProperty("Accept", "application/vnd.github+json, application/octet-stream");
        if (c.getResponseCode() / 100 != 2) throw new IOException("HTTP " + c.getResponseCode());
        return c;
    }

    static String httpGet(String url) throws IOException {
        HttpURLConnection c = open(url);
        InputStream in = c.getInputStream();
        try {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            return new String(b.toByteArray(), StandardCharsets.UTF_8);
        } finally { in.close(); c.disconnect(); }
    }

    void toast(final String msg) {
        act.runOnUiThread(new Runnable() {
            public void run() { Toast.makeText(act, msg, Toast.LENGTH_LONG).show(); }
        });
    }
}
