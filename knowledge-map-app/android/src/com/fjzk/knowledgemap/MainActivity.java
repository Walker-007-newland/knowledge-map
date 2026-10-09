package com.fjzk.knowledgemap;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * 全屏 WebView 外壳。网页打包在 assets/www 里，直接从 file:///android_asset/ 读取，完全离线。
 * 下载备份、朗读这些 WebView 不支持的功能由 km-shim.js 转给这里的 KMBridge；联网只用于检查更新（见 Updater）。
 */
public class MainActivity extends Activity {
    static final String HOME = "file:///android_asset/www/index.html";
    static final int REQ_FILE = 1;

    WebView web;
    ValueCallback<Uri[]> fileCallback;
    TextToSpeech tts;
    boolean ttsReady;
    Updater updater;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);

        web.addJavascriptInterface(new Bridge(), "KMBridge");
        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome());

        if (state != null) web.restoreState(state);
        if (web.getUrl() == null) web.loadUrl(HOME);

        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            public void onInit(int status) { ttsReady = status == TextToSpeech.SUCCESS; }
        });
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            public void onStart(String id) { }
            public void onDone(String id) { ttsDone(id, true); }
            public void onError(String id) { ttsDone(id, false); }
        });

        // 启动时静默检查一次更新，有新版本才弹窗
        updater = new Updater(this);
        if (state == null) web.postDelayed(new Runnable() {
            public void run() { updater.check(false); }
        }, 2000);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null) tts.stop();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        updater.destroy();
        web.destroy();
        super.onDestroy();
    }

    void ttsDone(final String id, final boolean ok) {
        runOnUiThread(new Runnable() {
            public void run() { web.evaluateJavascript("window.__kmTtsDone&&__kmTtsDone('" + id.replaceAll("[^0-9]", "") + "'," + ok + ")", null); }
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onActivityResult(int req, int result, Intent data) {
        if (req == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
            fileCallback = null;
            return;
        }
        if (updater.onActivityResult(req)) return;
        super.onActivityResult(req, result, data);
    }

    class Client extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if ("file".equals(u.getScheme())) return false;
            // 外部链接交给系统浏览器
            try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (ActivityNotFoundException ignored) { }
            return true;
        }
    }

    class Chrome extends WebChromeClient {
        // “导入进度文件”用的文件选择框
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
            if (fileCallback != null) fileCallback.onReceiveValue(null);
            fileCallback = cb;
            Intent i = new Intent(Intent.ACTION_GET_CONTENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);
            i.setType("*/*");
            try {
                startActivityForResult(Intent.createChooser(i, "选择进度文件"), REQ_FILE);
            } catch (ActivityNotFoundException e) {
                fileCallback = null;
                cb.onReceiveValue(null);
                return false;
            }
            return true;
        }
    }

    class Bridge {
        @JavascriptInterface
        public String appVersion() { return updater.currentVersion(); }

        @JavascriptInterface
        public void checkUpdate() {
            runOnUiThread(new Runnable() {
                public void run() { updater.check(true); }
            });
        }

        @JavascriptInterface
        public void speak(String id, String text, String lang, float rate, float pitch) {
            if (!ttsReady) { ttsDone(id, false); return; }
            if (lang != null && !lang.isEmpty()) tts.setLanguage(Locale.forLanguageTag(lang));
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);
            tts.speak(text, TextToSpeech.QUEUE_ADD, null, id);
        }

        @JavascriptInterface
        public void stopSpeak() {
            if (tts != null) tts.stop();
        }

        @JavascriptInterface
        public void saveFile(final String name, final String text) {
            String where;
            try {
                where = save(name, text.getBytes(StandardCharsets.UTF_8));
            } catch (Exception e) {
                where = null;
            }
            final String msg = where == null ? "保存失败" : "已保存到 " + where;
            runOnUiThread(new Runnable() {
                public void run() { Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show(); }
            });
        }
    }

    String save(String name, byte[] data) throws IOException {
        if (Build.VERSION.SDK_INT >= 29) {
            // Android 10 起不用权限即可写进“下载”目录
            ContentValues v = new ContentValues();
            v.put(MediaStore.Downloads.DISPLAY_NAME, name);
            v.put(MediaStore.Downloads.MIME_TYPE, "application/json");
            v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/知识图谱");
            Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
            if (uri == null) throw new IOException("insert failed");
            OutputStream out = getContentResolver().openOutputStream(uri);
            try { out.write(data); } finally { out.close(); }
            return "下载/知识图谱/" + name;
        }
        File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (dir == null) throw new IOException("no storage");
        File f = new File(dir, name);
        FileOutputStream out = new FileOutputStream(f);
        try { out.write(data); } finally { out.close(); }
        return f.getAbsolutePath();
    }
}
