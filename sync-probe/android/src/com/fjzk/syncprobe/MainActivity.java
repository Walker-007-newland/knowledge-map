package com.fjzk.syncprobe;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.net.ConnectivityManager;
import android.net.LinkAddress;
import android.net.LinkProperties;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.URL;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.UUID;

/**
 * 同步探测包：验证两件事 ——
 * 1. 局域网里用自写 Socket HTTP（明文）能否连通；同时对比 HttpURLConnection 在 targetSdk 34 默认禁明文时的表现；
 * 2. NSD（mDNS）能否互相发现。
 * 网页界面在 assets/www（和正式 App 一样从 file:// 加载），网络都由这里的 Java 发出。
 */
public class MainActivity extends Activity {
    static final int PREFERRED_PORT = 47811;

    private WebView web;
    private MiniHttp.Server server;
    private String serverError = "";
    private Discovery disc;
    private String devId, devName;
    private JSONObject regState = new JSONObject();

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        SharedPreferences p = getSharedPreferences("probe", MODE_PRIVATE);
        devId = p.getString("id", "");
        if (devId.isEmpty()) {
            devId = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            p.edit().putString("id", devId).apply();
        }
        devName = deviceName();

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new Bridge(), "Probe");
        setContentView(web);

        disc = new Discovery(this, devId, devName, (type, data) -> {
            if ("reg".equals(type)) regState = data;
            send(type, data);
        });
        startServer();
        web.loadUrl("file:///android_asset/www/index.html");
    }

    private void startServer() {
        try {
            server = new MiniHttp.Server(PREFERRED_PORT, this::handle);
            serverError = "";
            disc.register(server.port());
        } catch (Exception e) {
            server = null;
            serverError = e.toString();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("window.onAppResume && window.onAppResume()", null);
    }

    @Override
    protected void onDestroy() {
        disc.stop();
        disc.unregister();
        if (server != null) server.close();
        super.onDestroy();
    }

    /** 回调网页：window.__probe(type, json)。只在主线程调。 */
    private void send(String type, JSONObject data) {
        final String js = "window.__probe&&window.__probe(" + JSONObject.quote(type) + "," + data.toString() + ")";
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript(js, null); });
    }

    // ---------- 局域网服务端 ----------

    private Object[] handle(String remote, String method, String path, byte[] body) {
        int status = 200;
        JSONObject o = new JSONObject();
        try {
            if ("GET".equals(method) && "/hello".equals(path)) {
                o.put("app", "km-sync-probe").put("id", devId).put("name", devName)
                        .put("model", Build.MANUFACTURER + " " + Build.MODEL).put("sdk", Build.VERSION.SDK_INT)
                        .put("t", System.currentTimeMillis());
            } else if ("POST".equals(method) && "/echo".equals(path)) {
                o.put("len", body.length).put("sha256", sha256(body));
            } else {
                status = 404;
                o.put("error", "not found");
            }
            JSONObject ev = new JSONObject().put("from", remote).put("method", method).put("path", path)
                    .put("len", body.length).put("status", status).put("t", System.currentTimeMillis());
            send("incoming", ev);
        } catch (Exception ignored) { }
        return new Object[]{status, o.toString()};
    }

    // ---------- 测试 ----------

    /** 对 host:port 做一组测试：Socket GET ×3、Socket POST 256KB、HttpURLConnection GET。 */
    private JSONObject runTest(String host, int port, String label) {
        JSONObject r = new JSONObject();
        try {
            r.put("host", host).put("port", port).put("label", label).put("t", System.currentTimeMillis());
            // 1. Socket 明文 GET，三次取往返时间
            JSONArray rtts = new JSONArray();
            String hello = null, sockErr = null;
            long connectMs = -1;
            for (int i = 0; i < 3; i++) {
                try {
                    MiniHttp.Response res = MiniHttp.request(host, port, "GET", "/hello", null, 5000, 8000);
                    if (res.status != 200) throw new java.io.IOException("HTTP " + res.status);
                    rtts.put(res.totalMs);
                    if (connectMs < 0) connectMs = res.connectMs;
                    hello = res.text();
                } catch (Exception e) {
                    sockErr = e.toString();
                    break;
                }
            }
            JSONObject sock = new JSONObject().put("ok", sockErr == null).put("rttMs", rtts).put("connectMs", connectMs);
            if (sockErr != null) sock.put("error", sockErr);
            if (hello != null) {
                try { sock.put("peer", new JSONObject(hello)); } catch (Exception e) { sock.put("peerRaw", hello); }
            }
            r.put("socket", sock);

            // 2. Socket 明文 POST 256KB，校验对方收到的哈希
            if (sockErr == null) {
                byte[] blob = new byte[256 * 1024];
                new SecureRandom().nextBytes(blob);
                JSONObject big = new JSONObject();
                try {
                    MiniHttp.Response res = MiniHttp.request(host, port, "POST", "/echo", blob, 5000, 20000);
                    JSONObject e = new JSONObject(res.text());
                    boolean same = sha256(blob).equals(e.optString("sha256"));
                    big.put("ok", res.status == 200 && same).put("ms", res.totalMs).put("bytes", blob.length).put("hashMatch", same);
                } catch (Exception e) {
                    big.put("ok", false).put("error", e.toString());
                }
                r.put("socketPost", big);
            }

            // 3. HttpURLConnection 明文 GET（Android 9+ 默认应被系统拦截）
            JSONObject huc = new JSONObject();
            long t0 = System.nanoTime();
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection) new URL("http://" + (host.contains(":") ? "[" + host + "]" : host) + ":" + port + "/hello").openConnection();
                c.setConnectTimeout(5000);
                c.setReadTimeout(8000);
                int code = c.getResponseCode();
                java.io.InputStream in = c.getInputStream();
                byte[] buf = new byte[4096];
                while (in.read(buf) != -1) { }
                in.close();
                huc.put("ok", code == 200).put("status", code).put("ms", (System.nanoTime() - t0) / 1_000_000);
            } catch (Exception e) {
                String msg = String.valueOf(e.getMessage());
                huc.put("ok", false).put("error", e.getClass().getSimpleName() + ": " + msg)
                        .put("cleartextBlocked", msg.toLowerCase().contains("cleartext") || msg.contains("not permitted"));
            } finally {
                if (c != null) c.disconnect();
            }
            r.put("httpUrlConnection", huc);
        } catch (Exception ignored) { }
        return r;
    }

    // ---------- 本机信息 ----------

    private String deviceName() {
        String n = null;
        try { n = Settings.Global.getString(getContentResolver(), "device_name"); } catch (Exception ignored) { }
        if (n == null || n.trim().isEmpty()) n = Build.MODEL;
        return n.trim();
    }

    private JSONObject info() {
        JSONObject o = new JSONObject();
        try {
            String ver = "";
            try {
                PackageInfo pi = getPackageManager().getPackageInfo(getPackageName(), 0);
                ver = pi.versionName;
            } catch (Exception ignored) { }
            o.put("probeVersion", ver).put("id", devId).put("name", devName)
                    .put("manufacturer", Build.MANUFACTURER).put("brand", Build.BRAND).put("model", Build.MODEL)
                    .put("android", Build.VERSION.RELEASE).put("sdk", Build.VERSION.SDK_INT)
                    .put("rom", Build.DISPLAY).put("targetSdk", getApplicationInfo().targetSdkVersion);
            try {
                o.put("cleartextPermittedBySystem", android.security.NetworkSecurityPolicy.getInstance().isCleartextTrafficPermitted());
            } catch (Exception ignored) { }
            o.put("serverPort", server == null ? 0 : server.port()).put("serverError", serverError);
            o.put("nsdRegister", regState);
            o.put("discovering", disc.discovering());

            // 当前网络
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            Network n = cm.getActiveNetwork();
            String transport = "无网络";
            JSONArray linkAddrs = new JSONArray();
            if (n != null) {
                NetworkCapabilities nc = cm.getNetworkCapabilities(n);
                if (nc != null) {
                    if (nc.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) transport = "Wi-Fi";
                    else if (nc.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) transport = "移动网络";
                    else if (nc.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) transport = "有线";
                    else if (nc.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) transport = "VPN";
                    else transport = "其它";
                    if (nc.hasTransport(NetworkCapabilities.TRANSPORT_VPN)) transport += "（有 VPN）";
                }
                LinkProperties lp = cm.getLinkProperties(n);
                if (lp != null) {
                    o.put("iface", lp.getInterfaceName());
                    for (LinkAddress la : lp.getLinkAddresses()) linkAddrs.put(la.toString());
                }
            }
            o.put("network", transport).put("linkAddresses", linkAddrs);

            // 所有网卡的 IPv4，挑一个 Wi-Fi 地址给对方手输
            JSONArray ifs = new JSONArray();
            String wifiIp = "", anyIp = "";
            for (NetworkInterface ni : Collections.list(NetworkInterface.getNetworkInterfaces())) {
                if (!ni.isUp() || ni.isLoopback()) continue;
                for (InetAddress a : Collections.list(ni.getInetAddresses())) {
                    if (!(a instanceof Inet4Address)) continue;
                    String ip = a.getHostAddress();
                    ifs.put(ni.getName() + " " + ip);
                    if (ni.getName().startsWith("wlan") && wifiIp.isEmpty()) wifiIp = ip;
                    if (anyIp.isEmpty() && a.isSiteLocalAddress()) anyIp = ip;
                }
            }
            o.put("interfaces", ifs).put("ip", wifiIp.isEmpty() ? anyIp : wifiIp);
        } catch (Exception e) {
            try { o.put("infoError", e.toString()); } catch (Exception ignored) { }
        }
        return o;
    }

    static String sha256(byte[] b) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-256").digest(b);
            StringBuilder sb = new StringBuilder();
            for (byte x : d) sb.append(String.format("%02x", x));
            return sb.toString();
        } catch (Exception e) { return ""; }
    }

    // ---------- 网页接口 ----------

    class Bridge {
        @JavascriptInterface
        public String info() { return MainActivity.this.info().toString(); }

        @JavascriptInterface
        public void startDiscovery() { disc.start(); }

        @JavascriptInterface
        public void stopDiscovery() { disc.stop(); }

        @JavascriptInterface
        public void reRegister() {
            if (server == null) startServer(); else disc.register(server.port());
        }

        /** 异步测试 host:port，结果经 __probe("test", …) 返回。 */
        @JavascriptInterface
        public void test(final String host, final int port, final String label) {
            new Thread(() -> send("test", runTest(host.trim(), port, label))).start();
        }

        /** 自测：本机 127.0.0.1 和本机局域网地址。 */
        @JavascriptInterface
        public void selfTest() {
            new Thread(() -> {
                int port = server == null ? 0 : server.port();
                send("test", runTest("127.0.0.1", port, "本机回环 127.0.0.1"));
                String ip = MainActivity.this.info().optString("ip");
                if (!ip.isEmpty()) send("test", runTest(ip, port, "本机局域网地址"));
            }).start();
        }

        @JavascriptInterface
        public void copy(final String text) {
            runOnUiThread(() -> {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                cm.setPrimaryClip(ClipData.newPlainText("同步探测结果", text));
                android.widget.Toast.makeText(MainActivity.this, "已复制，可以粘贴到微信或评论里", android.widget.Toast.LENGTH_SHORT).show();
            });
        }
    }
}
