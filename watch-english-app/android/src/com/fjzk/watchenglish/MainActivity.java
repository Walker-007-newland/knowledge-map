package com.fjzk.watchenglish;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.database.Cursor;
import android.graphics.Color;
import android.graphics.SurfaceTexture;
import android.media.AudioAttributes;
import android.media.MediaCodecList;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.Gravity;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * 看剧学英文：界面是 assets/www 里的网页（WebView，背景透明），视频用系统 MediaPlayer 画在网页下面的 TextureView 上，
 * 网页把视频框的位置告诉 vRect，原生画面就对准那块透明区域；字幕、按钮都是网页画的，盖在视频上面。
 * 网页通过 WENative 调这里：存取数据（files/store/*.json）、选视频（拿长期读取权限）、链接下载、播放控制、朗读、全屏、保存文件。
 */
public class MainActivity extends Activity {
    static final String TAG = "WatchEnglish";
    static final int REQ_FILE = 1, REQ_VIDEO = 2, REQ_SAVE = 3;

    WebView web;
    FrameLayout root, videoBox;
    TextureView tv;
    Surface surface;
    volatile MediaPlayer mp;
    volatile boolean prepared;
    float rate = 1f;
    int vw, vh;
    TextToSpeech tts;
    boolean ttsReady;
    ValueCallback<Uri[]> fileCallback;
    String saveText;
    boolean debug;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        videoBox = new FrameLayout(this);
        videoBox.setBackgroundColor(Color.BLACK);
        videoBox.setVisibility(View.INVISIBLE);
        tv = new TextureView(this);
        videoBox.addView(tv, new FrameLayout.LayoutParams(1, 1, Gravity.CENTER));
        root.addView(videoBox, new FrameLayout.LayoutParams(0, 0));
        web = new WebView(this);
        web.setBackgroundColor(Color.TRANSPARENT);
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        tv.setSurfaceTextureListener(new TextureView.SurfaceTextureListener() {
            public void onSurfaceTextureAvailable(SurfaceTexture st, int w, int h) {
                surface = new Surface(st);
                if (mp != null) mp.setSurface(surface);
            }
            public void onSurfaceTextureSizeChanged(SurfaceTexture st, int w, int h) { }
            public boolean onSurfaceTextureDestroyed(SurfaceTexture st) {
                if (mp != null) try { mp.setSurface(null); } catch (Exception ignored) { }
                if (surface != null) surface.release();
                surface = null;
                return true;
            }
            public void onSurfaceTextureUpdated(SurfaceTexture st) { }
        });
        videoBox.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> { if (r - l != or - ol || b - t != ob - ot) fitVideo(); });

        // 真机调试开关：adb shell touch /sdcard/Android/data/com.fjzk.watchenglish/files/webdebug 后重开 App，
        // 电脑上就能用 Chrome 开发者工具连进网页（X800 不让截屏，只能这样看界面）
        File ext = getExternalFilesDir(null);
        debug = ext != null && new File(ext, "webdebug").exists();
        if (debug) WebView.setWebContentsDebuggingEnabled(true);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        web.addJavascriptInterface(new Bridge(), "WENative");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                return !"file".equals(r.getUrl().getScheme());   // 不联网，外部链接一律不开
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            // <input type=file>：选字幕、精讲包、学习记录
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent pick = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(pick, "选择文件"), REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    cb.onReceiveValue(null);
                    return false;
                }
                return true;
            }
        });
        web.loadUrl("file:///android_asset/www/index.html");

        if (Downloads.get(this).hasPending()) DownloadService.kick(this);   // 上次没下完的接着下

        tts = new TextToSpeech(this, st -> {
            ttsReady = st == TextToSpeech.SUCCESS;
            if (ttsReady) tts.setLanguage(Locale.US);
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mp != null && prepared && mp.isPlaying()) { mp.pause(); event("paused", null); }
        if (tts != null) tts.stop();
    }

    @Override
    protected void onDestroy() {
        releasePlayer();
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.goBack ? window.goBack() : false", v -> { if (!"true".equals(v)) finish(); });
    }

    @Override
    protected void onActivityResult(int req, int result, Intent data) {
        Uri u = result == RESULT_OK && data != null ? data.getData() : null;
        if (req == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(u == null ? null : new Uri[]{u});
            fileCallback = null;
        } else if (req == REQ_VIDEO) {
            String js = "null";
            if (u != null) {
                try { getContentResolver().takePersistableUriPermission(u, Intent.FLAG_GRANT_READ_URI_PERMISSION); }
                catch (Exception e) { Log.w(TAG, "长期读取权限没拿到，下次打开可能要重新选", e); }
                try { js = JSONObject.quote(new JSONObject().put("uri", u.toString()).put("name", displayName(u)).toString()); }
                catch (Exception ignored) { }
            }
            web.evaluateJavascript("window.__picked&&__picked(" + js + ")", null);
        } else if (req == REQ_SAVE) {
            final String text = saveText;
            saveText = null;
            if (u == null || text == null) { fileSaved(false, "已取消"); return; }
            new Thread(() -> {
                boolean ok = false;
                String msg;
                try (OutputStream os = getContentResolver().openOutputStream(u, "w")) {
                    if (os == null) throw new IOException("打不开文件");
                    os.write(text.getBytes(StandardCharsets.UTF_8));
                    ok = true;
                    msg = "已保存";
                } catch (Exception e) { msg = "保存失败：" + e.getMessage(); }
                final boolean fok = ok;
                final String fmsg = msg;
                runOnUiThread(() -> fileSaved(fok, fmsg));
            }).start();
        } else super.onActivityResult(req, result, data);
    }

    void fileSaved(boolean ok, String msg) {
        web.evaluateJavascript("window.__fileSaved&&__fileSaved(" + ok + "," + JSONObject.quote(msg) + ")", null);
    }

    String displayName(Uri u) {
        try (Cursor c = getContentResolver().query(u, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst() && !c.isNull(0)) return c.getString(0);
        } catch (Exception ignored) { }
        String p = u.getLastPathSegment();
        return p == null ? "视频" : p.substring(p.lastIndexOf('/') + 1);
    }

    /** 播放器事件送给网页：window.__vEvent(类型, JSON 字符串) */
    void event(String type, JSONObject d) {
        final String js = "window.__vEvent&&__vEvent('" + type + "'," + (d == null ? "''" : JSONObject.quote(d.toString())) + ")";
        runOnUiThread(() -> web.evaluateJavascript(js, null));
    }

    static JSONObject obj(Object... kv) {
        JSONObject o = new JSONObject();
        try { for (int i = 0; i < kv.length; i += 2) o.put((String) kv[i], kv[i + 1]); } catch (Exception ignored) { }
        return o;
    }

    // ---------- 播放器（都在 UI 线程里调）
    void openPlayer(String uri) {
        releasePlayer();
        final MediaPlayer p = new MediaPlayer();
        mp = p;
        p.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MOVIE).build());
        final Uri src;
        try {
            if (uri.startsWith("asset:")) {
                File f = assetFile(uri.substring(6));
                p.setDataSource(f.getPath());
                src = Uri.fromFile(f);
            } else {
                src = Uri.parse(uri);
                p.setDataSource(this, src);
            }
        } catch (Exception e) {
            Log.w(TAG, "setDataSource", e);
            releasePlayer();
            event("error", obj("msg", e instanceof SecurityException ? "没有权限读这个视频了，请重新选择视频文件" : "打不开视频文件（可能已经被移走或删除）"));
            return;
        }
        if (surface != null) p.setSurface(surface);
        p.setOnPreparedListener(x -> {
            if (mp != x) return;
            prepared = true;
            vw = x.getVideoWidth();
            vh = x.getVideoHeight();
            fitVideo();
            event("prepared", obj("dur", x.getDuration(), "w", vw, "h", vh));
        });
        p.setOnVideoSizeChangedListener((x, w, h) -> {
            if (mp != x) return;
            vw = w; vh = h;
            fitVideo();
            event("size", obj("w", w, "h", h));
        });
        p.setOnCompletionListener(x -> { if (mp == x) event("completed", null); });
        p.setOnErrorListener((x, what, extra) -> {
            if (mp != x) return true;
            Log.w(TAG, "MediaPlayer error " + what + "/" + extra);
            prepared = false;
            event("error", obj("msg", "这个视频平板放不了（错误 " + what + "/" + extra + "）。可以先在平板自带的播放器里试试，放不了的话转成 MP4（H.264 + AAC）再导入"));
            return true;
        });
        p.prepareAsync();
        checkTracks(src);
    }

    /** 有的 MKV 音轨是 DTS / AC3，平板没有解码器就会没声音：提前提醒 */
    void checkTracks(final Uri src) {
        new Thread(() -> {
            MediaExtractor ex = new MediaExtractor();
            try {
                ex.setDataSource(this, src, null);
                MediaCodecList list = new MediaCodecList(MediaCodecList.REGULAR_CODECS);
                StringBuilder bad = new StringBuilder();
                boolean hasAudio = false, audioOk = false;
                for (int i = 0; i < ex.getTrackCount(); i++) {
                    MediaFormat f = ex.getTrackFormat(i);
                    String mime = f.getString(MediaFormat.KEY_MIME);
                    if (mime == null || !(mime.startsWith("audio/") || mime.startsWith("video/"))) continue;
                    boolean ok = list.findDecoderForFormat(f) != null;
                    if (mime.startsWith("audio/")) { hasAudio = true; audioOk |= ok; }
                    if (!ok) bad.append(bad.length() > 0 ? "、" : "").append(mime);
                }
                if (hasAudio && !audioOk) event("warn", obj("msg", "这个视频的音轨格式（" + bad + "）平板解不了，可能没有声音"));
                else if (bad.length() > 0) Log.i(TAG, "不支持的轨道：" + bad);
            } catch (Exception e) {
                Log.i(TAG, "checkTracks", e);
            } finally {
                ex.release();
            }
        }).start();
    }

    /** 示例短片在 assets 里（压缩存的，MediaPlayer 读不了），第一次用时复制出来 */
    File assetFile(String path) throws IOException {
        File f = new File(getFilesDir(), "asset-" + path.replaceAll("[^A-Za-z0-9.]", "_"));
        long installed = 0;
        try { installed = getPackageManager().getPackageInfo(getPackageName(), 0).lastUpdateTime; } catch (Exception ignored) { }
        if (f.isFile() && f.lastModified() >= installed) return f;
        try (InputStream in = getAssets().open("www/" + path); OutputStream out = new FileOutputStream(f)) {
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        }
        return f;
    }

    void releasePlayer() {
        MediaPlayer p = mp;
        mp = null;
        prepared = false;
        vw = vh = 0;
        if (p != null) try { p.release(); } catch (Exception ignored) { }
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    /** 画面按比例塞进视频框，居中，四周黑边 */
    void fitVideo() {
        int bw = videoBox.getWidth(), bh = videoBox.getHeight();
        if (bw <= 0 || bh <= 0) return;
        int w = bw, h = bh;
        if (vw > 0 && vh > 0) {
            if ((long) vw * bh > (long) vh * bw) h = Math.round((float) bw * vh / vw);
            else w = Math.round((float) bh * vw / vh);
        }
        FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) tv.getLayoutParams();
        if (lp.width == w && lp.height == h) return;
        lp.width = w;
        lp.height = h;
        lp.gravity = Gravity.CENTER;
        tv.setLayoutParams(lp);
    }

    void showSystemBars(boolean show) {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c == null) return;
            if (show) c.show(WindowInsets.Type.systemBars());
            else {
                c.hide(WindowInsets.Type.systemBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(show ? 0 :
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
    }

    File storeFile(String key) {
        if (key == null || !key.matches("[A-Za-z0-9._-]{1,80}")) throw new IllegalArgumentException("bad key");
        File dir = new File(getFilesDir(), "store");
        if (!dir.isDirectory()) dir.mkdirs();
        return new File(dir, key + ".json");
    }

    class Bridge {
        @JavascriptInterface
        public String version() {
            try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception e) { return ""; }
        }

        // ---------- 数据：一个 key 一个文件
        @JavascriptInterface
        public String load(String key) {
            try {
                File f = storeFile(key);
                if (!f.isFile()) return null;
                try (InputStream in = new FileInputStream(f)) {
                    ByteArrayOutputStream bo = new ByteArrayOutputStream();
                    byte[] buf = new byte[65536];
                    int n;
                    while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
                    return new String(bo.toByteArray(), StandardCharsets.UTF_8);
                }
            } catch (Exception e) {
                Log.w(TAG, "load " + key, e);
                return null;
            }
        }

        /** 先写临时文件再改名，写到一半断电也不会把原来的数据弄坏 */
        @JavascriptInterface
        public boolean save(String key, String text) {
            try {
                File f = storeFile(key), tmp = new File(f.getPath() + ".tmp");
                try (OutputStream out = new FileOutputStream(tmp)) { out.write(text.getBytes(StandardCharsets.UTF_8)); }
                return tmp.renameTo(f) || (f.delete() && tmp.renameTo(f));
            } catch (Exception e) {
                Log.w(TAG, "save " + key, e);
                return false;
            }
        }

        @JavascriptInterface
        public void remove(String key) {
            try { storeFile(key).delete(); } catch (Exception ignored) { }
        }

        // ---------- 选视频：系统文件选择，拿长期读取权限（下次打开 App 不用再选）
        @JavascriptInterface
        public void pickVideo() {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*")
                    .putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"video/*", "application/x-matroska", "application/octet-stream"})
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
                try {
                    startActivityForResult(i, REQ_VIDEO);
                } catch (ActivityNotFoundException e) {
                    web.evaluateJavascript("window.__picked&&__picked(null)", null);
                }
            });
        }

        // ---------- 播放
        @JavascriptInterface
        public void vOpen(final String uri) { runOnUiThread(() -> openPlayer(uri)); }

        @JavascriptInterface
        public void vClose() { runOnUiThread(MainActivity.this::releasePlayer); }

        @JavascriptInterface
        public void vPlay() {
            runOnUiThread(() -> {
                MediaPlayer p = mp;
                if (p == null || !prepared) return;
                p.start();
                if (rate != 1f && Build.VERSION.SDK_INT >= 23) {
                    try { p.setPlaybackParams(p.getPlaybackParams().setSpeed(rate)); } catch (Exception e) { Log.w(TAG, "rate", e); }
                }
            });
        }

        @JavascriptInterface
        public void vPause() {
            runOnUiThread(() -> { MediaPlayer p = mp; if (p != null && prepared && p.isPlaying()) p.pause(); });
        }

        @JavascriptInterface
        public void vSeek(final int ms) {
            runOnUiThread(() -> {
                MediaPlayer p = mp;
                if (p == null || !prepared) return;
                if (Build.VERSION.SDK_INT >= 26) p.seekTo(ms, MediaPlayer.SEEK_CLOSEST);
                else p.seekTo(ms);
            });
        }

        @JavascriptInterface
        public int vPos() {
            MediaPlayer p = mp;
            try { return p != null && prepared ? p.getCurrentPosition() : 0; } catch (Exception e) { return 0; }
        }

        /** 变速：暂停时只记下来（有的机型暂停时设速度会自己开始播），开始播放时再设 */
        @JavascriptInterface
        public void vRate(final float r) {
            runOnUiThread(() -> {
                rate = r;
                MediaPlayer p = mp;
                if (p != null && prepared && p.isPlaying() && Build.VERSION.SDK_INT >= 23) {
                    try { p.setPlaybackParams(p.getPlaybackParams().setSpeed(r)); } catch (Exception e) { Log.w(TAG, "rate", e); }
                }
            });
        }

        /** 视频框位置（网页 CSS 像素）；宽高为 0 = 不显示画面（只出声音） */
        @JavascriptInterface
        public void vRect(final float x, final float y, final float w, final float h) {
            runOnUiThread(() -> {
                float d = getResources().getDisplayMetrics().density;
                FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) videoBox.getLayoutParams();
                if (w <= 0 || h <= 0) { videoBox.setVisibility(View.INVISIBLE); return; }
                lp.leftMargin = Math.round(x * d);
                lp.topMargin = Math.round(y * d);
                lp.width = Math.round(w * d);
                lp.height = Math.round(h * d);
                lp.gravity = Gravity.TOP | Gravity.START;
                videoBox.setLayoutParams(lp);
                videoBox.setVisibility(View.VISIBLE);
            });
        }

        /** 全屏：藏起状态栏导航栏、横屏；退出时恢复 */
        @JavascriptInterface
        public void fullscreen(final boolean on) {
            runOnUiThread(() -> {
                showSystemBars(!on);
                setRequestedOrientation(on ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE : ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
            });
        }

        @JavascriptInterface
        public void keepOn(final boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }

        // ---------- 链接下载（见 Downloads）
        /** 开始下载，返回任务号；进度用 dlList 查 */
        @JavascriptInterface
        public String dlStart(String url, String title) {
            Downloads.Job j = Downloads.get(MainActivity.this).add(url, title);
            DownloadService.kick(MainActivity.this);
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED)
                    requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 9);
            });
            return j.id;
        }

        @JavascriptInterface
        public String dlList() { return Downloads.get(MainActivity.this).list(); }

        @JavascriptInterface
        public void dlPause(String id) { Downloads.get(MainActivity.this).pause(id); }

        @JavascriptInterface
        public void dlResume(String id) {
            if (Downloads.get(MainActivity.this).resume(id)) DownloadService.kick(MainActivity.this);
        }

        /** 删任务；deleteFile = 连下好的视频文件一起删 */
        @JavascriptInterface
        public void dlRemove(String id, boolean deleteFile) { Downloads.get(MainActivity.this).remove(id, deleteFile); }

        /** 下字幕这类小文件：回调 window.__fetched(id, ok, base64 内容或出错原因) */
        @JavascriptInterface
        public void fetchText(final String id, final String url) {
            new Thread(() -> {
                String js;
                try {
                    byte[] b = Downloads.fetch(url, 8 << 20, null);
                    js = "window.__fetched&&__fetched(" + JSONObject.quote(id) + ",true," + JSONObject.quote(android.util.Base64.encodeToString(b, android.util.Base64.NO_WRAP)) + ")";
                } catch (Exception e) {
                    js = "window.__fetched&&__fetched(" + JSONObject.quote(id) + ",false," + JSONObject.quote(Downloads.message(e)) + ")";
                }
                final String fjs = js;
                runOnUiThread(() -> web.evaluateJavascript(fjs, null));
            }).start();
        }

        /** 调试开关打开时才有用：视频画面的大小和平均亮度（确认画面真的画出来了），格式 "宽x高 亮度" */
        @JavascriptInterface
        public String debugFrame() {
            if (!debug) return "";
            final String[] out = {""};
            final java.util.concurrent.CountDownLatch done = new java.util.concurrent.CountDownLatch(1);
            runOnUiThread(() -> {
                try {
                    android.graphics.Bitmap b = tv.isAvailable() ? tv.getBitmap(64, 36) : null;
                    if (b != null) {
                        long sum = 0;
                        for (int y = 0; y < 36; y++) for (int x = 0; x < 64; x++) {
                            int c = b.getPixel(x, y);
                            sum += ((c >> 16) & 255) * 3 + ((c >> 8) & 255) * 6 + (c & 255);
                        }
                        out[0] = tv.getWidth() + "x" + tv.getHeight() + " " + sum / (64 * 36 * 10) + " box " + videoBox.getVisibility();
                    } else out[0] = "no texture";
                } catch (Exception e) { out[0] = e.toString(); }
                done.countDown();
            });
            try { done.await(2, java.util.concurrent.TimeUnit.SECONDS); } catch (InterruptedException ignored) { }
            return out[0];
        }

        @JavascriptInterface
        public void speak(String text, float r) {
            if (!ttsReady || text == null) return;
            tts.setSpeechRate(r > 0 ? r : 1f);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "we");
        }

        /** 存文件（导出学习记录）：弹出系统「保存到」界面，不用存储权限；完成后回调 window.__fileSaved(ok, 说明) */
        @JavascriptInterface
        public void saveFile(final String name, final String text) {
            runOnUiThread(() -> {
                saveText = text;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                    .setType("application/json").putExtra(Intent.EXTRA_TITLE, name);
                try {
                    startActivityForResult(i, REQ_SAVE);
                } catch (ActivityNotFoundException e) {
                    saveText = null;
                    fileSaved(false, "这台设备没有文件管理器，存不了文件");
                }
            });
        }
    }
}
