package com.fjzk.ruankao;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * 软考·系统架构设计师：界面全是 assets/www 里的网页（手机竖屏）。
 * 网页通过 RKNative 调这里：存取数据（files/store/*.json，比 localStorage 稳）、保存文件（导出备份）、常亮（论文计时）、检查更新（见 Updater）。
 */
public class MainActivity extends Activity {
    static final String TAG = "Ruankao";
    static final int REQ_FILE = 1, REQ_SAVE = 3;

    WebView web;
    ValueCallback<Uri[]> fileCallback;
    String saveText;
    Updater updater;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);

        // 真机调试开关：adb shell touch /sdcard/Android/data/com.fjzk.ruankao/files/webdebug 后重开 App
        File ext = getExternalFilesDir(null);
        if (ext != null && new File(ext, "webdebug").exists()) WebView.setWebContentsDebuggingEnabled(true);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setTextZoom(100);
        web.addJavascriptInterface(new Bridge(), "RKNative");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                if ("file".equals(r.getUrl().getScheme())) return false;
                // 外部链接（参考资料）交给系统浏览器
                try { startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl())); } catch (Exception ignored) { }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            // <input type=file>：导入备份
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

        updater = new Updater(this);
        if (state == null) web.postDelayed(() -> updater.check(false), 2500);
    }

    @Override
    protected void onDestroy() {
        if (updater != null) updater.destroy();
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

        @JavascriptInterface
        public void checkUpdate() { runOnUiThread(() -> updater.check(true)); }

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
        public void keepOn(final boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }

        /** 导出备份：弹出系统「保存到」界面，不用存储权限；完成后回调 window.__fileSaved(ok, 说明) */
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
