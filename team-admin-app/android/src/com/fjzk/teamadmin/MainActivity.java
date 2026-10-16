package com.fjzk.teamadmin;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.provider.MediaStore;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

/** 管理员审批 App：网页界面在 assets/www，网络请求走原生桥（不受 CORS 限制，token 不进网页存储）。 */
public class MainActivity extends Activity {
    private WebView web;
    private Updater updater;
    private ValueCallback<Uri[]> fileCallback;
    private Uri photoUri;
    static final int REQ_FILE = 7;
    // 节点请求排队在一个后台线程里：计数严格递增、按顺序到达节点
    private final java.util.concurrent.ExecutorService nodeExec = java.util.concurrent.Executors.newSingleThreadExecutor();

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, android.webkit.WebResourceRequest r) {
                if (!"http".equals(r.getUrl().getScheme()) && !"https".equals(r.getUrl().getScheme())) return false;
                // 方案里的链接（下载地址等）交给系统浏览器，别把审批页换掉
                try { startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW, r.getUrl())); } catch (Exception ignored) { }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {  // 默认实现让 confirm() 弹出系统对话框
            // 扫管理码：<input type=file accept=image/* capture> 调系统相机（不申请相机权限），不带 capture 就从相册选
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                photoUri = null;
                Intent launch;
                if (params.isCaptureEnabled()) {
                    photoUri = ApkProvider.newPhoto(MainActivity.this);
                    launch = new Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                        .putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
                        .addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    launch.setClipData(ClipData.newRawUri("photo", photoUri));   // 有的相机要靠 ClipData 才拿得到写权限
                } else {
                    Intent pick = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("image/*");
                    launch = Intent.createChooser(pick, "选择管理码图片");
                }
                try {
                    startActivityForResult(launch, REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    cb.onReceiveValue(null);
                    return false;
                }
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "Native");
        setContentView(web);
        web.loadUrl("file:///android_asset/www/index.html");
        CheckJob.schedule(this);
        updater = new Updater(this);
        updater.check(false);   // 每次打开静默检查，有新版才弹窗
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 1);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("window.onAppResume && window.onAppResume()", null);
    }

    @Override
    protected void onActivityResult(int req, int result, Intent data) {
        if (req == REQ_FILE && fileCallback != null) {
            Uri u = null;
            if (result == RESULT_OK) {
                if (data != null && data.getData() != null) u = data.getData();
                else if (photoUri != null && ApkProvider.fileFor(this, photoUri).length() > 0) u = photoUri;
            }
            fileCallback.onReceiveValue(u == null ? null : new Uri[]{u});
            fileCallback = null;
            photoUri = null;
            return;
        }
        super.onActivityResult(req, result, data);
    }

    @Override
    protected void onDestroy() {
        nodeExec.shutdownNow();
        if (updater != null) updater.destroy();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.goBack ? window.goBack() : false", v -> {
            if (!"true".equals(v)) finish();
        });
    }

    class Bridge {
        @JavascriptInterface
        public boolean hasToken() { return !Gh.token(MainActivity.this).isEmpty(); }

        @JavascriptInterface
        public void setToken(String t) {
            Gh.prefs(MainActivity.this).edit().putString("token", t == null ? "" : t.trim()).apply();
        }

        @JavascriptInterface
        public String repo() { return Gh.REPO; }

        @JavascriptInterface
        public String version() { return updater.currentVersion(); }

        @JavascriptInterface
        public void checkUpdate() { runOnUiThread(() -> updater.check(true)); }

        // ---------- 同步节点（不经过 Gh，管理密钥不进网页）
        /** {configured, host, port, kid}：不含管理密钥。 */
        @JavascriptInterface
        public String nodeInfo() {
            try {
                android.content.SharedPreferences p = NodeStore.prefs(MainActivity.this);
                return new JSONObject().put("configured", NodeStore.configured(MainActivity.this))
                        .put("host", p.getString("host", "")).put("port", p.getInt("port", 0)).put("kid", p.getString("kid", "")).toString();
            } catch (Exception e) { return "{\"configured\":false}"; }
        }

        /** 保存管理码（扫码或粘贴的文字）：{ok, kid} 或 {err: 中文原因}。 */
        @JavascriptInterface
        public String nodeSetup(String text) {
            try {
                return new JSONObject().put("ok", true).put("kid", NodeStore.save(MainActivity.this, text)).toString();
            } catch (IllegalArgumentException e) {
                return "{\"err\":" + JSONObject.quote(e.getMessage()) + "}";
            } catch (Exception e) {
                return "{\"err\":" + JSONObject.quote("保存失败：" + e) + "}";
            }
        }

        @JavascriptInterface
        public void nodeClear() { NodeStore.clear(MainActivity.this); }

        /** 异步调用节点管理操作，完成后回调 window.__nodeDone(id, status, text)；status 0 = 连不上（text 是原因）。 */
        @JavascriptInterface
        public void nodeCall(final String id, final String op, final String argsJson) {
            nodeExec.execute(() -> {
                Node.Result r;
                try {
                    Node.Code c = NodeStore.load(MainActivity.this);
                    r = c == null ? new Node.Result(0, "还没有设置同步节点", false) : Node.call(c, NodeStore.ctr(MainActivity.this), op, argsJson);
                } catch (Exception e) {
                    r = new Node.Result(0, "读取管理密钥失败：" + e, false);
                }
                final String js = "window.__nodeDone(" + JSONObject.quote(id) + "," + r.status + "," + JSONObject.quote(r.text) + ")";
                runOnUiThread(() -> web.evaluateJavascript(js, null));
            });
        }

        /** 异步请求，完成后回调 window.__ghDone(id, status, text)。 */
        @JavascriptInterface
        public void request(final String id, final String method, final String path, final String body) {
            new Thread(() -> {
                String[] r = Gh.request(MainActivity.this, method, path, body);
                final String js = "window.__ghDone(" + JSONObject.quote(id) + "," + r[0] + "," + JSONObject.quote(r[1]) + ")";
                runOnUiThread(() -> web.evaluateJavascript(js, null));
            }).start();
        }
    }
}
