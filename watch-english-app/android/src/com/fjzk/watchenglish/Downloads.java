package com.fjzk.watchenglish;

import android.content.Context;
import android.media.MediaCodec;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.media.MediaMuxer;
import android.net.Uri;
import android.os.StatFs;
import android.util.Log;

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
import java.net.URLDecoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * 链接下载：视频直链（断点续传）和 m3u8（逐段下载、AES-128 解密、合并后转成 MP4）。
 * 只下用户自己粘贴的链接；DRM 加密（SAMPLE-AES 等）、直播流不下。任务记录存在 files/downloads.json，
 * 下好的视频放在 App 专属目录（Android/data/…/files/videos），卸载 App 时一起删掉。
 */
final class Downloads {
    static final String TAG = "WEDownload";
    static final String UA = "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36";

    static final class Job {
        String id, url, name, kind = "file", status = "queued", err = "", path = "";
        long bytes, total, created;
        int segDone, segTotal;

        JSONObject json() {
            JSONObject o = new JSONObject();
            try {
                o.put("id", id).put("url", url).put("name", name).put("kind", kind).put("status", status).put("err", err)
                    .put("path", path).put("bytes", bytes).put("total", total).put("segDone", segDone).put("segTotal", segTotal).put("created", created);
                if (!path.isEmpty()) o.put("uri", Uri.fromFile(new File(path)).toString());
            } catch (Exception ignored) { }
            return o;
        }

        static Job of(JSONObject o) {
            Job j = new Job();
            j.id = o.optString("id"); j.url = o.optString("url"); j.name = o.optString("name"); j.kind = o.optString("kind", "file");
            j.status = o.optString("status", "queued"); j.err = o.optString("err"); j.path = o.optString("path");
            j.bytes = o.optLong("bytes"); j.total = o.optLong("total"); j.created = o.optLong("created");
            j.segDone = o.optInt("segDone"); j.segTotal = o.optInt("segTotal");
            return j;
        }
    }

    /** 暂停或删除了正在下的任务 */
    static final class Stopped extends RuntimeException { }

    interface Progress { void update(Job j); }

    private static Downloads inst;
    static synchronized Downloads get(Context c) {
        if (inst == null) inst = new Downloads(c.getApplicationContext());
        return inst;
    }

    final Context ctx;
    final File store;
    final List<Job> jobs = new ArrayList<>();
    volatile Job current;
    volatile boolean stop;
    Progress progress;
    private long lastTick;

    private Downloads(Context c) {
        ctx = c;
        store = new File(c.getFilesDir(), "downloads.json");
        try {
            if (store.isFile()) {
                JSONArray a = new JSONArray(new String(readAll(new FileInputStream(store)), StandardCharsets.UTF_8));
                for (int i = 0; i < a.length(); i++) jobs.add(Job.of(a.getJSONObject(i)));
            }
        } catch (Exception e) { Log.w(TAG, "读任务记录", e); }
        for (Job j : jobs) if ("running".equals(j.status) || "remuxing".equals(j.status)) j.status = "queued";   // 上次被系统杀掉的，接着下
    }

    synchronized void save() {
        JSONArray a = new JSONArray();
        for (Job j : jobs) a.put(j.json());
        try {
            File tmp = new File(store.getPath() + ".tmp");
            try (OutputStream os = new FileOutputStream(tmp)) { os.write(a.toString().getBytes(StandardCharsets.UTF_8)); }
            if (!tmp.renameTo(store)) { store.delete(); tmp.renameTo(store); }
        } catch (IOException e) { Log.w(TAG, "存任务记录", e); }
    }

    synchronized String list() {
        JSONArray a = new JSONArray();
        for (Job j : jobs) a.put(j.json());
        return a.toString();
    }

    synchronized boolean hasPending() {
        for (Job j : jobs) if ("queued".equals(j.status)) return true;
        return false;
    }

    synchronized Job find(String id) {
        for (Job j : jobs) if (j.id.equals(id)) return j;
        return null;
    }

    /** 新任务：文件名用片名（去掉不能用的字符）+ 链接里的扩展名，m3u8 最后转成 .mp4 */
    synchronized Job add(String url, String title) {
        Job j = new Job();
        j.id = "dl" + Long.toString(System.currentTimeMillis(), 36);
        j.url = url.trim();
        j.created = System.currentTimeMillis();
        String path = Uri.parse(j.url).getPath();
        String last = path == null ? "" : path.substring(path.lastIndexOf('/') + 1);
        try { last = URLDecoder.decode(last, "UTF-8"); } catch (Exception ignored) { }
        String ext = last.contains(".") ? last.substring(last.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT) : "";
        if ("m3u8".equals(ext) || "m3u".equals(ext)) { j.kind = "hls"; ext = "mp4"; }
        if (!ext.matches("mp4|m4v|mkv|webm|mov|avi|ts|flv|3gp")) ext = "mp4";
        String base = title == null || title.trim().isEmpty() ? (last.contains(".") ? last.substring(0, last.lastIndexOf('.')) : "视频") : title.trim();
        base = base.replaceAll("[\\\\/:*?\"<>|#%\\x00-\\x1f]", " ").replaceAll("\\s+", " ").trim();
        if (base.length() > 60) base = base.substring(0, 60).trim();
        if (base.isEmpty()) base = "视频";
        String name = base + "." + ext;
        for (int n = 2; taken(name); n++) name = base + " (" + n + ")." + ext;
        j.name = name;
        jobs.add(j);
        save();
        return j;
    }

    private boolean taken(String name) {
        if (new File(dir(), name).exists()) return true;
        for (Job j : jobs) if (name.equals(j.name)) return true;
        return false;
    }

    synchronized void pause(String id) {
        Job j = find(id);
        if (j == null || "done".equals(j.status)) return;
        j.status = "paused";
        if (current == j) stop = true;
        save();
    }

    synchronized boolean resume(String id) {
        Job j = find(id);
        if (j == null || !("paused".equals(j.status) || "error".equals(j.status))) return false;
        j.status = "queued";
        j.err = "";
        save();
        return true;
    }

    /** 删掉任务；deleteFile = 连下好的视频一起删 */
    synchronized void remove(String id, boolean deleteFile) {
        Job j = find(id);
        if (j == null) return;
        jobs.remove(j);
        if (current == j) stop = true;
        save();
        final File work = work(j), part = new File(dir(), j.name + ".part"), out = j.path.isEmpty() ? null : new File(j.path);
        new Thread(() -> {
            try { Thread.sleep(current == j ? 1500 : 0); } catch (InterruptedException ignored) { }
            deleteTree(work);
            part.delete();
            if (deleteFile && out != null) out.delete();
        }).start();
    }

    synchronized Job next() {
        for (Job j : jobs) if ("queued".equals(j.status)) {
            j.status = "running";
            current = j;
            stop = false;
            return j;
        }
        current = null;
        return null;
    }

    File dir() {
        File d = ctx.getExternalFilesDir("videos");
        if (d == null) d = new File(ctx.getFilesDir(), "videos");
        if (!d.isDirectory()) d.mkdirs();
        return d;
    }

    File work(Job j) { return new File(dir(), ".work-" + j.id); }

    /** 在下载线程里跑一个任务 */
    void run(Job j) {
        try {
            if ("hls".equals(j.kind)) hls(j); else file(j);
            synchronized (this) { j.status = "done"; j.err = ""; }
        } catch (Stopped s) {
            Log.i(TAG, "停下 " + j.id);
        } catch (Exception e) {
            Log.w(TAG, "下载失败 " + j.url, e);
            synchronized (this) {
                if (!"paused".equals(j.status)) { j.status = "error"; j.err = message(e); }
            }
        }
        synchronized (this) { if (current == j) current = null; }
        save();
        tick(j, true);
    }

    static String message(Exception e) {
        if (e instanceof java.net.UnknownHostException) return "连不上这个网址（没联网，或者网址不对）";
        if (e instanceof java.net.SocketTimeoutException) return "网络太慢，超时了，点「继续」再试";
        if (e instanceof javax.net.ssl.SSLException) return "安全连接失败（网站证书有问题）";
        String m = e.getMessage();
        return m == null || m.isEmpty() ? e.getClass().getSimpleName() : m;
    }

    void tick(Job j, boolean force) {
        long now = System.currentTimeMillis();
        if (!force && now - lastTick < 700) return;
        lastTick = now;
        if (progress != null) progress.update(j);
    }

    void checkStop(Job j) { if (stop || current != j) throw new Stopped(); }

    // ---------- HTTP
    static final class Conn {
        HttpURLConnection c;
        String url;
    }

    /** 自己跟跳转（HttpURLConnection 不跟 http↔https 之间的跳转） */
    static Conn open(String url, long from) throws IOException {
        for (int hop = 0; hop < 8; hop++) {
            HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
            c.setInstanceFollowRedirects(false);
            c.setConnectTimeout(15000);
            c.setReadTimeout(30000);
            c.setRequestProperty("User-Agent", UA);
            c.setRequestProperty("Accept-Encoding", "identity");
            if (from > 0) c.setRequestProperty("Range", "bytes=" + from + "-");
            int code = c.getResponseCode();
            String loc = c.getHeaderField("Location");
            if (code >= 300 && code < 400 && loc != null) {
                url = new URL(new URL(url), loc).toString();
                c.disconnect();
                continue;
            }
            if (code == 416 && from > 0) { c.disconnect(); return open(url, 0); }
            if (code >= 400) {
                c.disconnect();
                throw new IOException("服务器返回 " + code + (code == 403 ? "（没有权限，链接可能过期了）" : code == 404 ? "（文件不存在）" : ""));
            }
            Conn r = new Conn();
            r.c = c;
            r.url = url;
            return r;
        }
        throw new IOException("网址跳转次数太多");
    }

    static byte[] readAll(InputStream in) throws IOException {
        try (InputStream i = in) {
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[65536];
            int n;
            while ((n = i.read(buf)) > 0) bo.write(buf, 0, n);
            return bo.toByteArray();
        }
    }

    /** 小文件（字幕、播放列表、密钥、分段）：整个读进来，最多 limit 字节 */
    static byte[] fetch(String url, int limit, String[] finalUrl) throws IOException {
        Conn cn = open(url, 0);
        try {
            long len = cn.c.getContentLengthLong();
            if (len > limit) throw new IOException("文件太大（" + (len >> 20) + " MB）");
            InputStream in = cn.c.getInputStream();
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) {
                bo.write(buf, 0, n);
                if (bo.size() > limit) throw new IOException("文件太大");
            }
            if (len > 0 && bo.size() < len) throw new IOException("下载不完整");
            if (finalUrl != null) finalUrl[0] = cn.url;
            return bo.toByteArray();
        } finally { cn.c.disconnect(); }
    }

    void checkSpace(long need) throws IOException {
        if (need <= 0) return;
        long free = new StatFs(dir().getPath()).getAvailableBytes();
        if (free < need + (200L << 20)) throw new IOException("平板存储空间不够：需要 " + mb(need) + "，只剩 " + mb(free));
    }

    static String mb(long b) { return b >= (1L << 30) ? String.format(Locale.ROOT, "%.1f GB", b / 1073741824.0) : (b >> 20) + " MB"; }

    // ---------- 直链
    void file(Job j) throws Exception {
        File out = new File(dir(), j.name), part = new File(dir(), j.name + ".part");
        long have = part.length();
        Conn cn = open(j.url, have);
        try {
            String type = cn.c.getContentType() == null ? "" : cn.c.getContentType().toLowerCase(Locale.ROOT);
            if (type.contains("mpegurl")) { cn.c.disconnect(); toHls(j, part); return; }
            if (type.startsWith("text/html")) throw new IOException("这个链接打开的是网页，不是视频文件本身。要用视频文件的直链（一般以 .mp4、.mkv 或 .m3u8 结尾）");
            if (cn.c.getResponseCode() != 206) have = 0;   // 服务器不支持续传：从头下
            long len = cn.c.getContentLengthLong();
            j.total = len > 0 ? have + len : 0;
            j.bytes = have;
            checkSpace(len);
            try (InputStream in = cn.c.getInputStream(); OutputStream os = new FileOutputStream(part, have > 0)) {
                byte[] buf = new byte[256 * 1024];
                int n;
                boolean first = have == 0;
                while ((n = in.read(buf)) > 0) {
                    if (first) {
                        first = false;
                        String head = new String(buf, 0, Math.min(n, 7), StandardCharsets.ISO_8859_1);
                        if (head.equals("#EXTM3U")) { os.close(); toHls(j, part); return; }
                        if (head.trim().startsWith("<")) throw new IOException("这个链接打开的是网页，不是视频文件本身");
                    }
                    checkStop(j);
                    os.write(buf, 0, n);
                    j.bytes += n;
                    tick(j, false);
                }
            }
        } finally { cn.c.disconnect(); }
        if (j.total > 0 && j.bytes < j.total) throw new IOException("下载中断了，点「继续」接着下");
        if (!part.renameTo(out)) throw new IOException("保存文件失败");
        j.path = out.getPath();
    }

    /** 链接没写 .m3u8 但其实是播放列表 */
    void toHls(Job j, File part) throws Exception {
        part.delete();
        synchronized (this) {
            j.kind = "hls";
            if (!j.name.endsWith(".mp4")) j.name = j.name.substring(0, j.name.lastIndexOf('.')) + ".mp4";
            j.bytes = 0;
            j.total = 0;
        }
        save();
        hls(j);
    }

    // ---------- m3u8
    static final Pattern ATTR = Pattern.compile("([A-Z0-9-]+)=(\"[^\"]*\"|[^,]*)");

    static Map<String, String> attrs(String line) {
        Map<String, String> m = new HashMap<>();
        Matcher x = ATTR.matcher(line.substring(line.indexOf(':') + 1));
        while (x.find()) {
            String v = x.group(2);
            if (v.startsWith("\"") && v.endsWith("\"") && v.length() >= 2) v = v.substring(1, v.length() - 1);
            m.put(x.group(1), v);
        }
        return m;
    }

    static String resolve(String base, String rel) throws IOException { return new URL(new URL(base), rel.trim()).toString(); }

    static final class Seg {
        String uri, keyUri, map;
        byte[] iv;
        long seq;
    }

    static final class Media {
        List<Seg> segs = new ArrayList<>();
        boolean ended;
    }

    static String text(String url, String[] finalUrl) throws IOException {
        return new String(fetch(url, 4 << 20, finalUrl), StandardCharsets.UTF_8).replace("﻿", "");
    }

    static Media media(String text, String base) throws IOException {
        Media m = new Media();
        long seq = 0;
        String keyUri = null, map = null;
        byte[] iv = null;
        for (String raw : text.split("\n")) {
            String line = raw.trim();
            if (line.startsWith("#EXT-X-MEDIA-SEQUENCE:")) seq = Long.parseLong(line.substring(22).trim());
            else if (line.startsWith("#EXT-X-KEY:")) {
                Map<String, String> a = attrs(line);
                String method = a.containsKey("METHOD") ? a.get("METHOD") : "NONE";
                if ("NONE".equals(method)) { keyUri = null; iv = null; }
                else if ("AES-128".equals(method)) {
                    keyUri = resolve(base, a.get("URI"));
                    String hex = a.get("IV");
                    iv = hex == null ? null : hexBytes(hex);
                } else throw new IOException("这个视频有版权保护（" + method + " 加密），不能下载");
            } else if (line.startsWith("#EXT-X-MAP:")) {
                Map<String, String> a = attrs(line);
                if (a.containsKey("BYTERANGE")) throw new IOException("暂不支持这种 m3u8（BYTERANGE）");
                map = resolve(base, a.get("URI"));
            } else if (line.startsWith("#EXT-X-BYTERANGE")) throw new IOException("暂不支持这种 m3u8（BYTERANGE）");
            else if (line.startsWith("#EXT-X-ENDLIST") || line.equals("#EXT-X-PLAYLIST-TYPE:VOD")) m.ended = true;
            else if (!line.isEmpty() && !line.startsWith("#")) {
                Seg s = new Seg();
                s.uri = resolve(base, line);
                s.keyUri = keyUri;
                s.iv = iv;
                s.map = map;
                s.seq = seq++;
                m.segs.add(s);
            }
        }
        return m;
    }

    static byte[] hexBytes(String hex) {
        hex = hex.replaceFirst("^0[xX]", "");
        while (hex.length() < 32) hex = "0" + hex;
        byte[] b = new byte[16];
        for (int i = 0; i < 16; i++) b[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        return b;
    }

    void hls(Job j) throws Exception {
        j.kind = "hls";
        String[] fin = new String[1];
        String top = text(j.url, fin);
        if (!top.trim().startsWith("#EXTM3U")) throw new IOException("这不是 m3u8 播放列表（打开的可能是网页）");
        String mediaUrl = fin[0], audioUrl = null, mediaText = top;
        if (top.contains("#EXT-X-STREAM-INF")) {
            // 多清晰度：选 1080p 以内最清楚的；有单独音轨时优先英语
            String[] lines = top.split("\n");
            String best = null, low = null;
            long bestBw = -1, lowBw = Long.MAX_VALUE;
            String bestAudio = null, lowAudio = null;
            Map<String, String> audioByGroup = new HashMap<>();
            for (String raw : lines) {
                String line = raw.trim();
                if (line.startsWith("#EXT-X-MEDIA:") && line.contains("TYPE=AUDIO")) {
                    Map<String, String> a = attrs(line);
                    String g = a.get("GROUP-ID"), u = a.get("URI");
                    if (g == null || u == null) continue;
                    String lang = a.containsKey("LANGUAGE") ? a.get("LANGUAGE").toLowerCase(Locale.ROOT) : "";
                    if (!audioByGroup.containsKey(g) || lang.startsWith("en") || ("YES".equals(a.get("DEFAULT")) && !audioByGroup.get(g).startsWith("en|")))
                        audioByGroup.put(g, (lang.startsWith("en") ? "en|" : "x|") + resolve(fin[0], u));
                }
            }
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();
                if (!line.startsWith("#EXT-X-STREAM-INF")) continue;
                Map<String, String> a = attrs(line);
                String uri = null;
                for (int k = i + 1; k < lines.length; k++) { String n = lines[k].trim(); if (!n.isEmpty() && !n.startsWith("#")) { uri = n; break; } }
                if (uri == null) continue;
                long bw = a.containsKey("BANDWIDTH") ? Long.parseLong(a.get("BANDWIDTH").trim()) : 0;
                int h = 0;
                if (a.containsKey("RESOLUTION")) try { h = Integer.parseInt(a.get("RESOLUTION").split("x")[1].trim()); } catch (Exception ignored) { }
                String au = a.containsKey("AUDIO") ? audioByGroup.get(a.get("AUDIO")) : null;
                if (h <= 1080 && bw > bestBw) { bestBw = bw; best = resolve(fin[0], uri); bestAudio = au; }
                if (bw < lowBw) { lowBw = bw; low = resolve(fin[0], uri); lowAudio = au; }
            }
            if (best == null) { best = low; bestAudio = lowAudio; }
            if (best == null) throw new IOException("m3u8 里没找到视频");
            mediaText = text(best, fin);
            mediaUrl = fin[0];
            if (bestAudio != null) audioUrl = bestAudio.substring(3);
        }
        Media v = media(mediaText, mediaUrl), a = null;
        if (!v.ended) throw new IOException("这是直播流，不能下载");
        if (v.segs.isEmpty()) throw new IOException("m3u8 里没有视频分段");
        if (audioUrl != null) {
            a = media(text(audioUrl, fin), fin[0]);
            if (a.segs.isEmpty()) a = null;
        }
        j.segTotal = v.segs.size() + (a == null ? 0 : a.segs.size());
        j.segDone = 0;
        j.bytes = 0;
        File wd = work(j);
        wd.mkdirs();
        File vf = segments(j, v, wd, "v"), af = a == null ? null : segments(j, a, wd, "a");
        synchronized (this) { j.status = "remuxing"; }
        tick(j, true);
        checkSpace(vf.length() + (af == null ? 0 : af.length()));
        File out = new File(dir(), j.name), tmp = new File(dir(), j.name + ".mux");
        List<File> ins = new ArrayList<>();
        ins.add(vf);
        if (af != null) ins.add(af);
        if (remux(ins, tmp) && tmp.renameTo(out)) {
            j.path = out.getPath();
        } else {
            tmp.delete();
            if (af != null) throw new IOException("合并音视频失败（这台平板不支持这种编码）");
            // 转不了 MP4 就直接用合并好的 TS / fMP4（系统播放器也能放，只是拖动慢一点）
            String ext = v.segs.get(0).map != null ? ".mp4" : ".ts";
            File keep = new File(dir(), j.name.substring(0, j.name.lastIndexOf('.')) + ext);
            if (!keep.equals(out) && keep.exists()) keep = new File(dir(), j.id + ext);
            if (!vf.renameTo(keep)) throw new IOException("保存文件失败");
            synchronized (this) { j.name = keep.getName(); }
            j.path = keep.getPath();
        }
        deleteTree(wd);
    }

    /** 逐段下载（已下好的段跳过，断点续传），解密后按顺序拼成一个文件 */
    File segments(Job j, Media m, File wd, String pre) throws Exception {
        Map<String, byte[]> keys = new HashMap<>();
        byte[] init = null;
        if (m.segs.get(0).map != null) init = get(j, m.segs.get(0).map);
        for (int i = 0; i < m.segs.size(); i++) {
            checkStop(j);
            File f = new File(wd, pre + "-" + i);
            if (f.length() > 0) {
                if (j.segDone < j.segTotal) j.segDone++;
                j.bytes += f.length();
                continue;
            }
            Seg s = m.segs.get(i);
            byte[] data = get(j, s.uri);
            if (s.keyUri != null) {
                byte[] key = keys.get(s.keyUri);
                if (key == null) { key = get(j, s.keyUri); keys.put(s.keyUri, key); }
                if (key.length != 16) throw new IOException("视频密钥格式不对，解不开");
                byte[] iv = s.iv;
                if (iv == null) { iv = new byte[16]; long q = s.seq; for (int k = 15; k >= 8; k--) { iv[k] = (byte) q; q >>>= 8; } }
                Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
                c.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new IvParameterSpec(iv));
                data = c.doFinal(data);
            }
            File tmp = new File(wd, pre + "-" + i + ".tmp");
            try (OutputStream os = new FileOutputStream(tmp)) { os.write(data); }
            if (!tmp.renameTo(f)) throw new IOException("写文件失败");
            j.segDone++;
            j.bytes += data.length;
            if (i == 0 && m.segs.size() > 1) checkSpace(data.length * (long) m.segs.size() * 2);
            tick(j, false);
        }
        File all = new File(wd, pre + ".all");
        try (OutputStream os = new FileOutputStream(all)) {
            if (init != null) os.write(init);
            byte[] buf = new byte[256 * 1024];
            for (int i = 0; i < m.segs.size(); i++) {
                File f = new File(wd, pre + "-" + i);
                try (InputStream in = new FileInputStream(f)) { int n; while ((n = in.read(buf)) > 0) os.write(buf, 0, n); }
                f.delete();
            }
        }
        return all;
    }

    /** 一段：失败重试 3 次 */
    byte[] get(Job j, String url) throws IOException {
        IOException last = null;
        for (int t = 0; t < 4; t++) {
            checkStop(j);
            try { return fetch(url, 64 << 20, null); }
            catch (IOException e) {
                last = e;
                if (e.getMessage() != null && e.getMessage().startsWith("服务器返回 4")) break;
                try { Thread.sleep(1000L * (t + 1)); } catch (InterruptedException ignored) { }
            }
        }
        throw last;
    }

    /** TS / 分段 MP4 → 普通 MP4（拖动进度快）。几个输入按时间交错写，时间从 0 开始 */
    static boolean remux(List<File> inputs, File out) {
        MediaMuxer mux = null;
        List<MediaExtractor> exs = new ArrayList<>();
        try {
            mux = new MediaMuxer(out.getPath(), MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4);
            List<int[]> maps = new ArrayList<>();   // 每个输入：原轨道号 → 输出轨道号
            boolean video = false;
            int maxSize = 2 << 20;
            for (File f : inputs) {
                MediaExtractor ex = new MediaExtractor();
                ex.setDataSource(f.getPath());
                exs.add(ex);
                int[] map = new int[ex.getTrackCount()];
                for (int t = 0; t < map.length; t++) {
                    map[t] = -1;
                    MediaFormat fmt = ex.getTrackFormat(t);
                    String mime = fmt.getString(MediaFormat.KEY_MIME);
                    if (mime == null || !(mime.startsWith("video/") || mime.startsWith("audio/"))) continue;
                    if (mime.startsWith("video/")) fillCsd(f.getPath(), t, fmt);
                    try {
                        map[t] = mux.addTrack(fmt);
                        ex.selectTrack(t);
                        if (mime.startsWith("video/")) video = true;
                        if (fmt.containsKey(MediaFormat.KEY_MAX_INPUT_SIZE)) maxSize = Math.max(maxSize, fmt.getInteger(MediaFormat.KEY_MAX_INPUT_SIZE));
                    } catch (Exception e) { Log.i(TAG, "跳过轨道 " + mime, e); }
                }
                maps.add(map);
            }
            if (!video) return false;
            long base = Long.MAX_VALUE;
            for (MediaExtractor ex : exs) { long t = ex.getSampleTime(); if (t >= 0) base = Math.min(base, t); }
            if (base == Long.MAX_VALUE) return false;
            mux.start();
            ByteBuffer buf = ByteBuffer.allocateDirect(maxSize);
            MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
            while (true) {
                int k = -1;
                long tmin = Long.MAX_VALUE;
                for (int i = 0; i < exs.size(); i++) { long t = exs.get(i).getSampleTime(); if (t >= 0 && t < tmin) { tmin = t; k = i; } }
                if (k < 0) break;
                MediaExtractor ex = exs.get(k);
                int size = ex.readSampleData(buf, 0);
                int track = ex.getSampleTrackIndex();
                if (size >= 0 && track >= 0 && maps.get(k)[track] >= 0) {
                    int flags = (ex.getSampleFlags() & MediaExtractor.SAMPLE_FLAG_SYNC) != 0 ? MediaCodec.BUFFER_FLAG_KEY_FRAME : 0;
                    info.set(0, size, Math.max(0, tmin - base), flags);
                    mux.writeSampleData(maps.get(k)[track], buf, info);
                }
                ex.advance();
            }
            mux.stop();
            return true;
        } catch (Exception e) {
            Log.w(TAG, "转 MP4 失败", e);
            return false;
        } finally {
            for (MediaExtractor ex : exs) ex.release();
            if (mux != null) try { mux.release(); } catch (Exception ignored) { }
        }
    }

    /** TS 里的 H.264 / H.265 轨道常常不带 csd（SPS、PPS 在码流里），写 MP4 会报「Missing codec specific data」：从前面的关键帧里找出来补上 */
    static void fillCsd(String path, int track, MediaFormat fmt) {
        String mime = fmt.getString(MediaFormat.KEY_MIME);
        boolean hevc = "video/hevc".equals(mime);
        if (!"video/avc".equals(mime) && !hevc) return;
        if (hevc ? fmt.containsKey("csd-0") : fmt.containsKey("csd-0") && fmt.containsKey("csd-1")) return;
        byte[] start = {0, 0, 0, 1};
        if (!hevc && fmt.containsKey("csd-0")) {
            // 有的机型 TS 解析出来的 csd-0 里 SPS、PPS 挤在一起，MP4 要分成 csd-0 = SPS、csd-1 = PPS
            ByteBuffer c0 = fmt.getByteBuffer("csd-0");
            byte[] b = new byte[c0.remaining()];
            c0.duplicate().get(b);
            byte[] sps = null, pps = null;
            for (byte[] nal : nals(b)) {
                if (nal.length == 0) continue;
                if ((nal[0] & 0x1f) == 7 && sps == null) sps = nal;
                if ((nal[0] & 0x1f) == 8 && pps == null) pps = nal;
            }
            if (sps != null && pps != null) {
                fmt.setByteBuffer("csd-0", ByteBuffer.wrap(concat(start, sps)));
                fmt.setByteBuffer("csd-1", ByteBuffer.wrap(concat(start, pps)));
                return;
            }
        }
        MediaExtractor ex = new MediaExtractor();
        try {
            ex.setDataSource(path);
            ex.selectTrack(track);
            ByteBuffer buf = ByteBuffer.allocate(8 << 20);
            ByteArrayOutputStream vps = new ByteArrayOutputStream(), sps = new ByteArrayOutputStream(), pps = new ByteArrayOutputStream();
            for (int n = 0; n < 300; n++) {
                int size = ex.readSampleData(buf, 0);
                if (size < 0) break;
                byte[] b = new byte[size];
                buf.position(0);
                buf.get(b, 0, size);
                for (byte[] nal : nals(b)) {
                    if (nal.length == 0) continue;
                    int type = hevc ? (nal[0] >> 1) & 0x3f : nal[0] & 0x1f;
                    ByteArrayOutputStream to = hevc ? (type == 32 ? vps : type == 33 ? sps : type == 34 ? pps : null) : (type == 7 ? sps : type == 8 ? pps : null);
                    if (to == null || to.size() > 0) continue;
                    to.write(start);
                    to.write(nal);
                }
                if (sps.size() > 0 && pps.size() > 0 && (!hevc || vps.size() > 0)) {
                    if (hevc) {
                        ByteArrayOutputStream all = new ByteArrayOutputStream();
                        all.write(vps.toByteArray()); all.write(sps.toByteArray()); all.write(pps.toByteArray());
                        fmt.setByteBuffer("csd-0", ByteBuffer.wrap(all.toByteArray()));
                    } else {
                        fmt.setByteBuffer("csd-0", ByteBuffer.wrap(sps.toByteArray()));
                        fmt.setByteBuffer("csd-1", ByteBuffer.wrap(pps.toByteArray()));
                    }
                    return;
                }
                ex.advance();
            }
            Log.i(TAG, "没找到 SPS/PPS");
        } catch (Exception e) {
            Log.w(TAG, "fillCsd", e);
        } finally { ex.release(); }
    }

    /** 按起始码 00 00 01 / 00 00 00 01 切开 NAL 单元（去掉起始码和末尾的 0） */
    static List<byte[]> nals(byte[] b) {
        List<byte[]> out = new ArrayList<>();
        int i = 0, from = -1;
        while (i + 2 < b.length) {
            if (b[i] == 0 && b[i + 1] == 0 && b[i + 2] == 1) {
                if (from >= 0) out.add(trimZeros(b, from, i));
                i += 3;
                from = i;
            } else i++;
        }
        if (from >= 0) out.add(trimZeros(b, from, b.length));
        return out;
    }

    static byte[] concat(byte[] a, byte[] b) {
        byte[] r = new byte[a.length + b.length];
        System.arraycopy(a, 0, r, 0, a.length);
        System.arraycopy(b, 0, r, a.length, b.length);
        return r;
    }

    static byte[] trimZeros(byte[] b, int from, int to) {
        while (to > from && b[to - 1] == 0) to--;
        byte[] r = new byte[to - from];
        System.arraycopy(b, from, r, 0, r.length);
        return r;
    }

    static void deleteTree(File f) {
        if (f == null || !f.exists()) return;
        File[] kids = f.listFiles();
        if (kids != null) for (File k : kids) deleteTree(k);
        f.delete();
    }
}
