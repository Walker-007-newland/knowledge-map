package com.fjzk.knowledgemap;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.util.Log;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * 英语录音包（2026-11-06）：单词整词录音 + 音节录音不打进 APK（太大，APK 超过 20 MB jsDelivr 就下不了），
 * build.ps1 打成 audio-pack.zip，publish.ps1 和 APK 一起放到 apk 分支（jsDelivr @apk-v<版本>）和 Release。
 * APK 里的 assets/audio-pack.json 记着这一版对应的录音包 {ver, size, sha256}。
 *
 * 下载：连着不计流量的网络（Wi-Fi）时启动后自动下；听写设置页也能手动点下载（KMApp.audioPackDownload）。
 * 校验大小和 SHA-256 后解压到 files/audiopack/（先解到 audiopack.new 再换），pack.json 里是包的版本。
 * 录音没变的新版 APK 包版本不变，不会重复下载；版本变了但还没下完时，继续用旧包（旧包的索引和文件是配套的）。
 * 网页请求 english-map/audio/ 下的文件时，MainActivity 先用 file() 找这里，没有再用 APK 里的（APK 里只有空索引）。
 */
class AudioPack {
    static final String TAG = "KMAudio";
    static final String NAME = "audio-pack.zip";

    final Context ctx;
    final File dir;
    String expectVer = "";
    long expectSize;
    String expectSha = "";
    volatile String installed = "";
    volatile String status = "idle";          // idle / downloading / error
    volatile int pct;
    volatile String error = "";
    volatile boolean busy;

    AudioPack(Context c) {
        ctx = c;
        dir = new File(c.getFilesDir(), "audiopack");
        try {
            JSONObject o = new JSONObject(read(c.getAssets().open("audio-pack.json")));
            expectVer = o.optString("ver");
            expectSize = o.optLong("size");
            expectSha = o.optString("sha256");
        } catch (Exception e) { Log.w(TAG, "APK 里没有 audio-pack.json", e); }
        installed = readVer(dir);
    }

    static String read(InputStream in) throws IOException {
        try {
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            return new String(b.toByteArray(), StandardCharsets.UTF_8);
        } finally { in.close(); }
    }

    static String readVer(File d) {
        try { return new JSONObject(read(new FileInputStream(new File(d, "pack.json")))).optString("ver"); }
        catch (Exception e) { return ""; }
    }

    boolean upToDate() { return !expectVer.isEmpty() && expectVer.equals(installed); }

    /** 录音包里的文件（english-map/audio/ 之后的相对路径），没有返回 null */
    File file(String rel) {
        if (installed.isEmpty() || rel == null || rel.isEmpty() || rel.contains("..") || rel.startsWith("/")) return null;
        File f = new File(dir, rel);
        return f.isFile() ? f : null;
    }

    String state() {
        try {
            JSONObject o = new JSONObject();
            o.put("have", !installed.isEmpty());
            o.put("upToDate", upToDate());
            o.put("status", busy ? "downloading" : status);
            o.put("pct", pct);
            o.put("size", expectSize);
            o.put("error", error);
            return o.toString();
        } catch (Exception e) { return ""; }
    }

    boolean unmetered() {
        try {
            ConnectivityManager cm = (ConnectivityManager) ctx.getSystemService(Context.CONNECTIVITY_SERVICE);
            NetworkCapabilities nc = cm.getNetworkCapabilities(cm.getActiveNetwork());
            return nc != null && nc.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                && nc.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED);
        } catch (Exception e) { return false; }
    }

    /** 启动时：缺包或包过期、又连着 Wi-Fi，就在后台下载 */
    void auto(String appVersion) {
        if (!upToDate() && !expectVer.isEmpty() && unmetered()) download(appVersion);
    }

    /** 开始下载；已在下载返回 false */
    synchronized boolean download(final String appVersion) {
        if (busy || expectVer.isEmpty() || upToDate()) return false;
        busy = true; pct = 0; error = ""; status = "downloading";
        new Thread(new Runnable() {
            public void run() {
                String err = "";
                for (String url : sources(appVersion)) {
                    try { fetchAndInstall(url); err = ""; break; }
                    catch (Exception e) { err = e.getMessage() == null ? e.toString() : e.getMessage(); Log.w(TAG, url, e); }
                }
                error = err;
                status = err.isEmpty() ? "idle" : "error";
                busy = false;
            }
        }, "audio-pack").start();
        return true;
    }

    static String[] sources(String version) {
        String[] list = new String[Updater.CDNS.length + 1];
        for (int k = 0; k < Updater.CDNS.length; k++)
            list[k] = "https://" + Updater.CDNS[k] + "/gh/" + Updater.REPO + "@apk-v" + version + "/" + NAME;
        list[Updater.CDNS.length] = "https://github.com/" + Updater.REPO + "/releases/download/v" + version + "/" + NAME;
        return list;
    }

    void fetchAndInstall(String url) throws Exception {
        File zip = new File(ctx.getCacheDir(), NAME);
        HttpURLConnection c = Updater.open(url);
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        long got = 0;
        InputStream in = c.getInputStream();
        OutputStream out = new FileOutputStream(zip);
        try {
            byte[] buf = new byte[32768];
            int n;
            while ((n = in.read(buf)) > 0) {
                out.write(buf, 0, n); md.update(buf, 0, n); got += n;
                if (expectSize > 0) pct = (int) Math.min(99, got * 100 / expectSize);
            }
        } finally { out.close(); in.close(); c.disconnect(); }
        if (expectSize > 0 && got != expectSize) { zip.delete(); throw new IOException("大小不对 " + got); }
        StringBuilder hex = new StringBuilder();
        for (byte b : md.digest()) hex.append(String.format("%02x", b));
        if (!expectSha.isEmpty() && !expectSha.equals(hex.toString())) { zip.delete(); throw new IOException("校验不对"); }
        File tmp = new File(ctx.getFilesDir(), "audiopack.new");
        deleteTree(tmp);
        ZipInputStream z = new ZipInputStream(new FileInputStream(zip));
        try {
            ZipEntry e;
            byte[] buf = new byte[32768];
            while ((e = z.getNextEntry()) != null) {
                String name = e.getName();
                if (e.isDirectory() || name.contains("..") || name.startsWith("/")) continue;
                File f = new File(tmp, name);
                f.getParentFile().mkdirs();
                OutputStream o = new FileOutputStream(f);
                try { int n; while ((n = z.read(buf)) > 0) o.write(buf, 0, n); } finally { o.close(); }
            }
        } finally { z.close(); zip.delete(); }
        if (!expectVer.equals(readVer(tmp))) { deleteTree(tmp); throw new IOException("包版本不对"); }
        File old = new File(ctx.getFilesDir(), "audiopack.old");
        deleteTree(old);
        synchronized (this) {
            if (dir.exists() && !dir.renameTo(old)) deleteTree(dir);
            if (!tmp.renameTo(dir)) throw new IOException("换不了目录");
            installed = expectVer;
        }
        deleteTree(old);
        pct = 100;
        Log.i(TAG, "录音包 " + expectVer + " 装好了，来自 " + url);
    }

    static void deleteTree(File f) {
        if (f == null || !f.exists()) return;
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteTree(k);
        f.delete();
    }
}
