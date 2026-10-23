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
    static final int REQ_SAVE = 8;
    private String saveId, saveText;      // 导出日志：等管理员选好保存位置
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
        if (req == REQ_SAVE && saveId != null) {
            final String id = saveId, text = saveText;
            saveId = null; saveText = null;
            final Uri u = result == RESULT_OK && data != null ? data.getData() : null;
            if (u == null) { fileSaved(id, false, "已取消"); return; }
            new Thread(() -> {
                boolean ok = false; String msg;
                try (java.io.OutputStream os = getContentResolver().openOutputStream(u, "w")) {
                    if (os == null) throw new java.io.IOException("打不开文件");
                    os.write(text.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    ok = true; msg = "已保存";
                } catch (Exception e) { msg = "保存失败：" + e.getMessage(); }
                final boolean fok = ok; final String fmsg = msg;
                runOnUiThread(() -> fileSaved(id, fok, fmsg));
            }).start();
            return;
        }
        super.onActivityResult(req, result, data);
    }

    private void fileSaved(String id, boolean ok, String msg) {
        web.evaluateJavascript("window.__fileSaved && window.__fileSaved(" + JSONObject.quote(id) + "," + ok + "," + JSONObject.quote(msg) + ")", null);
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
                    if (NodeStore.hasPending(MainActivity.this)) NodeStore.resolvePending(MainActivity.this);
                    Node.Code c = NodeStore.load(MainActivity.this);
                    r = c == null ? new Node.Result(0, "还没有设置同步节点", false) : Node.call(c, NodeStore.ctr(MainActivity.this), op, argsJson);
                } catch (Exception e) {
                    r = new Node.Result(0, "读取管理密钥失败：" + e, false);
                }
                nodeDone(id, r);
            });
        }

        /**
         * 换管理密钥（#6 第三期）：生成新密钥 → 先存成「待确认」→ 用旧密钥发 admin.rotateKey → 节点确认后新密钥转正。
         * 网络中断不知道换没换时，留着「待确认」，下次调节点前自动确认（NodeStore.resolvePending）。新旧密钥都不给网页。
         * 回调 window.__nodeDone(id, status, text)，成功时 text 是 {"ok":true,"data":{"kid":新 kid}}。
         */
        @JavascriptInterface
        public void nodeRotateKey(final String id) {
            nodeExec.execute(() -> {
                Node.Result r;
                try {
                    if (NodeStore.hasPending(MainActivity.this)) NodeStore.resolvePending(MainActivity.this);
                    Node.Code old = NodeStore.load(MainActivity.this);
                    if (old == null) {
                        r = new Node.Result(0, "还没有设置同步节点", false);
                    } else {
                        byte[] nk = Node.newKey();
                        NodeStore.savePending(MainActivity.this, nk);
                        r = Node.rotate(old, NodeStore.ctr(MainActivity.this), nk);
                        java.util.Arrays.fill(nk, (byte) 0);
                        if (Node.ok(r)) {
                            NodeStore.commitPending(MainActivity.this);
                        } else if (r.status == 200) {
                            NodeStore.clearPending(MainActivity.this);       // 节点拒绝了（格式等），旧密钥照常
                        } else {
                            // 没拿到明确结果（断网、超时）：马上用新密钥确认一次
                            NodeStore.resolvePending(MainActivity.this);
                            String kid = NodeStore.prefs(MainActivity.this).getString("kid", "");
                            if (NodeStore.hasPending(MainActivity.this)) {
                                r = new Node.Result(0, "网络中断，还不确定换没换成功；新密钥已存好，下次连上节点时自动确认", false);
                            } else if (!kid.equals(old.kid)) {
                                r = new Node.Result(200, "{\"ok\":true,\"data\":{\"kid\":\"" + kid + "\"}}", false);
                            }
                        }
                    }
                } catch (Exception e) {
                    r = new Node.Result(0, "换管理密钥失败：" + e, false);
                }
                nodeDone(id, r);
            });
        }

        // ---------- #12 账号：恢复密钥（私钥只在原生侧）、重设学生密码、改节点地址

        /** {kid}：已导入的恢复密钥编号；没导入时 kid 为空。 */
        @JavascriptInterface
        public String recoveryInfo() {
            try { return new JSONObject().put("kid", NodeStore.recoveryKid(MainActivity.this)).toString(); }
            catch (Exception e) { return "{\"kid\":\"\"}"; }
        }

        /** 导入恢复密钥（扫 km-recovery.png 得到的 kmrecov:1?…）：{ok, kid} 或 {err}。 */
        @JavascriptInterface
        public String recoveryImport(String text) {
            try { return new JSONObject().put("ok", true).put("kid", NodeStore.saveRecovery(MainActivity.this, text)).toString(); }
            catch (IllegalArgumentException e) { return "{\"err\":" + JSONObject.quote(e.getMessage()) + "}"; }
            catch (Exception e) { return "{\"err\":" + JSONObject.quote("保存失败：" + e) + "}"; }
        }

        @JavascriptInterface
        public void recoveryClear() { NodeStore.clearRecovery(MainActivity.this); }

        /**
         * 重设学生密码（异步，回调 window.__nodeDone(id, status, text)）：取恢复包 → 恢复私钥解开 → 用新密码算新的 salt / authKey / wrap_pw
         * → accounts.resetPassword。新密码和组密钥都不离开这台手机。
         */
        @JavascriptInterface
        public void acctReset(final String id, final String user, final String newPw) {
            nodeExec.execute(() -> {
                Node.Result r;
                byte[] priv = null;
                try {
                    Node.Code c = NodeStore.load(MainActivity.this);
                    priv = NodeStore.loadRecovery(MainActivity.this);
                    String bad = AcctCrypto.pwProblem(user, newPw);
                    if (c == null) r = new Node.Result(0, "还没有设置同步节点", false);
                    else if (priv == null) r = new Node.Result(200, "{\"ok\":false,\"err\":\"recovery\",\"msg\":\"还没导入账号恢复密钥：先在「账号」页扫一次 km-recovery.png\"}", false);
                    else if (bad != null) r = new Node.Result(200, "{\"ok\":false,\"err\":\"pw\",\"msg\":" + JSONObject.quote(bad) + "}", false);
                    else {
                        Node.Result g = Node.call(c, NodeStore.ctr(MainActivity.this), "accounts.get", new JSONObject().put("user", user).put("wrap", true).toString());
                        if (!Node.ok(g)) r = g;
                        else {
                            JSONObject d = new JSONObject(g.text).getJSONObject("data");
                            String bundle = AcctCrypto.openAdmin(priv, NodeStore.recoveryKid(MainActivity.this), user, d.getString("wrap_admin"));
                            String args = AcctCrypto.resetArgs(user, newPw, bundle, AcctCrypto.ITERS);
                            r = Node.call(c, NodeStore.ctr(MainActivity.this), "accounts.resetPassword", args);
                        }
                    }
                } catch (IllegalArgumentException e) {
                    r = new Node.Result(200, "{\"ok\":false,\"err\":\"recovery\",\"msg\":" + JSONObject.quote(e.getMessage()) + "}", false);
                } catch (Exception e) {
                    r = new Node.Result(0, "重设密码失败：" + e, false);
                } finally {
                    if (priv != null) java.util.Arrays.fill(priv, (byte) 0);
                }
                nodeDone(id, r);
            });
        }

        /** 生成临时密码（8 位小写字母和数字） */
        @JavascriptInterface
        public String tempPassword() { return AcctCrypto.tempPassword(); }

        /** 改节点地址（服务器搬家后；管理密钥不变）：{ok} 或 {err}。 */
        @JavascriptInterface
        public String nodeSetHost(String text) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("^\\s*([0-9A-Za-z.\\-]{1,253})(?::(\\d{1,5}))?\\s*$").matcher(text == null ? "" : text);
            if (!m.matches()) return "{\"err\":\"地址格式不对，应该像 192.168.1.20:8787\"}";
            int p = m.group(2) == null ? 8787 : Integer.parseInt(m.group(2));
            if (p < 1 || p > 65535) return "{\"err\":\"端口要在 1–65535 之间\"}";
            NodeStore.setHost(MainActivity.this, m.group(1), p);
            return "{\"ok\":true}";
        }

        private void nodeDone(String id, Node.Result r) {
            final String js = "window.__nodeDone(" + JSONObject.quote(id) + "," + r.status + "," + JSONObject.quote(r.text) + ")";
            runOnUiThread(() -> web.evaluateJavascript(js, null));
        }

        /**
         * 把文字存成文件（导出日志用）：弹出系统「保存到」界面让管理员选位置（不用存储权限），
         * 完成后回调 window.__fileSaved(id, ok, 说明)。
         */
        @JavascriptInterface
        public void saveFile(final String id, final String name, final String mime, final String text) {
            runOnUiThread(() -> {
                if (saveId != null) fileSaved(saveId, false, "已取消");
                saveId = id;
                saveText = text == null ? "" : text;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                        .setType(mime == null || mime.isEmpty() ? "text/plain" : mime).putExtra(Intent.EXTRA_TITLE, name);
                try {
                    startActivityForResult(i, REQ_SAVE);
                } catch (ActivityNotFoundException e) {
                    fileSaved(id, false, "这台手机没有文件管理器，存不了文件");
                }
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
