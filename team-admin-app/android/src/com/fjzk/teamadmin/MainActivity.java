package com.fjzk.teamadmin;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

/** 管理员审批 App：网页界面在 assets/www，网络请求走原生桥（不受 CORS 限制，token 不进网页存储）。 */
public class MainActivity extends Activity {
    private WebView web;

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
        web.setWebChromeClient(new WebChromeClient()); // 让 confirm() 弹出系统对话框
        web.addJavascriptInterface(new Bridge(), "Native");
        setContentView(web);
        web.loadUrl("file:///android_asset/www/index.html");
        CheckJob.schedule(this);
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
