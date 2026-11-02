package com.fjzk.knowledgemap;

import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * 电子教材：登录国家中小学智慧教育平台。打开平台官方网页，账号密码由学生自己在官方页面上输入，App 不经手；
 * 登录成功后平台网页把凭据写进它自己的 localStorage（ND_UC_AUTH-…&token），这里用 evaluateJavascript 读出来
 * 存进私有 SharedPreferences（Textbooks.saveAuth），不打印、不写日志、不上传。
 * 这个 WebView 不注入任何 JS 接口；只放行 https 网页，只在 *.smartedu.cn 页面上读凭据。
 */
public class TbLoginActivity extends Activity {
    static final String START = "https://basic.smartedu.cn/tchMaterial";
    static final String LOGIN = "https://auth.smartedu.cn/uias/login";
    static final String[] ORIGINS = { "https://basic.smartedu.cn", "https://auth.smartedu.cn", "https://www.smartedu.cn", "https://smartedu.cn" };
    /** 读凭据：只取 access_token、mac_key、diff、过期时间，别的账号资料不碰 */
    static final String PROBE = "(function(){try{var k=Object.keys(localStorage).filter(function(x){return /^ND_UC_AUTH-[^&]+&[^&]+&token$/.test(x)})[0];"
        + "if(!k)return '';var o=JSON.parse(localStorage.getItem(k));var v=o&&typeof o.value==='string'?JSON.parse(o.value):(o&&o.value)||o;"
        + "if(!v||!v.access_token)return '';return JSON.stringify({a:String(v.access_token),m:String(v.mac_key||''),d:+v.diff||0,e:String(v.expires_at||'')});}catch(e){return ''}})()";

    WebView web;
    TextView where;
    ProgressBar bar;
    final Handler h = new Handler(Looper.getMainLooper());
    boolean done, resumed;

    final Runnable poll = new Runnable() {
        public void run() {
            if (!resumed || done) return;
            probe();
            h.postDelayed(this, 2000);
        }
    };

    int dp(int v) { return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()); }

    Button btn(String text, View.OnClickListener l) {
        Button b = new Button(this);
        b.setText(text);
        b.setAllCaps(false);
        b.setTextSize(15);
        b.setOnClickListener(l);
        return b;
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);

        LinearLayout top = new LinearLayout(this);
        top.setOrientation(LinearLayout.HORIZONTAL);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(dp(6), dp(4), dp(6), dp(4));
        top.setBackgroundColor(0xFFF6F4EF);
        top.addView(btn("← 返回", new View.OnClickListener() { public void onClick(View v) { finish(); } }));
        LinearLayout mid = new LinearLayout(this);
        mid.setOrientation(LinearLayout.VERTICAL);
        mid.setPadding(dp(8), 0, dp(8), 0);
        TextView title = new TextView(this);
        title.setText("登录国家中小学智慧教育平台");
        title.setTextSize(16);
        title.setTextColor(0xFF1F2328);
        where = new TextView(this);
        where.setTextSize(12);
        where.setTextColor(0xFF6B6F76);
        where.setSingleLine(true);
        where.setEllipsize(TextUtils.TruncateAt.END);
        mid.addView(title);
        mid.addView(where);
        top.addView(mid, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        top.addView(btn("去登录页", new View.OnClickListener() { public void onClick(View v) { web.loadUrl(LOGIN); } }));
        top.addView(btn("我已登录", new View.OnClickListener() {
            public void onClick(View v) {
                // 登录页登录完可能停在 auth.smartedu.cn：回到教材页，让平台网页写好凭据再读
                Toast.makeText(TbLoginActivity.this, "正在确认登录状态…", Toast.LENGTH_SHORT).show();
                web.loadUrl(START);
            }
        }));
        root.addView(top);

        TextView tip = new TextView(this);
        tip.setText("请在下面的平台官方页面上用你自己的账号登录（点页面右上角「登录」，或点上方「去登录页」）。登录成功后会自动返回。账号密码只在平台网页里输入，本 App 只保存登录凭据用于下载教材。");
        tip.setTextSize(13);
        tip.setTextColor(0xFF6B6F76);
        tip.setPadding(dp(12), dp(6), dp(12), dp(6));
        tip.setBackgroundColor(0xFFF1EDE4);
        root.addView(tip);

        bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        root.addView(bar, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(3)));

        web = new WebView(this);
        root.addView(web, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                String sc = req.getUrl().getScheme();
                if ("https".equals(sc)) return false;
                if ("http".equals(sc)) { view.loadUrl(req.getUrl().buildUpon().scheme("https").build().toString()); return true; }
                return true;   // intent://、weixin:// 等跳出 App 的链接不打开
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) { showWhere(url); }

            @Override
            public void onPageFinished(WebView view, String url) { showWhere(url); probe(); }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int p) { bar.setProgress(p); bar.setVisibility(p >= 100 ? View.INVISIBLE : View.VISIBLE); }
        });
        web.loadUrl(START);
    }

    void showWhere(String url) {
        try { where.setText("官方网址：" + Uri.parse(url).getHost()); } catch (Exception e) { where.setText(""); }
    }

    static boolean platformHost(String host) {
        return host != null && (host.equals("smartedu.cn") || host.endsWith(".smartedu.cn"));
    }

    void probe() {
        if (done || web == null) return;
        String url = web.getUrl();
        String host = null;
        try { host = url == null ? null : Uri.parse(url).getHost(); } catch (Exception ignored) { }
        if (!url_ok(url) || !platformHost(host)) return;
        web.evaluateJavascript(PROBE, new ValueCallback<String>() {
            public void onReceiveValue(String v) { got(v); }
        });
    }

    static boolean url_ok(String url) { return url != null && url.startsWith("https://"); }

    void got(String v) {
        if (done || v == null || v.length() < 4) return;
        try {
            String s = new JSONArray("[" + v + "]").getString(0);   // evaluateJavascript 返回的是 JSON 编码过的字符串
            if (s.isEmpty()) return;
            JSONObject o = new JSONObject(s);
            String a = o.optString("a", "");
            if (a.isEmpty()) return;
            // 刚被平台判为失效（401）的那张凭据还留在网页里时不算登录成功，等学生重新登录换新的
            android.content.SharedPreferences p = Textbooks.auth(this);
            if (p.getBoolean("expired", false) && a.equals(p.getString("access_token", ""))) return;
            done = true;
            Textbooks.saveAuth(this, a, o.optString("m", ""), o.optLong("d", 0), o.optString("e", ""));
            Textbooks.get(this).emitLogin();
            Toast.makeText(this, "已登录平台，可以下载教材了", Toast.LENGTH_LONG).show();
            setResult(RESULT_OK);
            finish();
        } catch (Exception ignored) { /* 没读到就等下一次 */ }
    }

    /** 退出平台登录：删本机保存的凭据，并清掉平台网页在本 App 里的登录状态（只清 smartedu.cn，不动 B 站等别的网站） */
    static void logout(android.content.Context c) {
        Textbooks.clearAuth(c);
        try {
            WebStorage ws = WebStorage.getInstance();
            for (String o : ORIGINS) ws.deleteOrigin(o);
        } catch (Throwable ignored) { }
        try {
            CookieManager cm = CookieManager.getInstance();
            for (String o : ORIGINS) {
                String all = cm.getCookie(o);
                if (all == null) continue;
                for (String kv : all.split(";")) {
                    String name = kv.split("=", 2)[0].trim();
                    if (name.isEmpty()) continue;
                    String host = Uri.parse(o).getHost();
                    cm.setCookie(o, name + "=; Max-Age=0; Path=/");
                    cm.setCookie(o, name + "=; Max-Age=0; Path=/; Domain=" + host);
                    cm.setCookie(o, name + "=; Max-Age=0; Path=/; Domain=.smartedu.cn");
                }
            }
            cm.flush();
        } catch (Throwable ignored) { }
        Textbooks.get(c).emitLogin();
    }

    @Override
    protected void onResume() {
        super.onResume();
        resumed = true;
        h.postDelayed(poll, 2000);
    }

    @Override
    protected void onPause() {
        super.onPause();
        resumed = false;
        h.removeCallbacks(poll);
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        h.removeCallbacks(poll);
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
