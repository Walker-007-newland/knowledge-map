package com.fjzk.knowledgemap;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 全屏 WebView 外壳。网页打包在 assets/www 里，直接从 file:///android_asset/ 读取，完全离线。
 * 下载备份、朗读这些 WebView 不支持的功能由 km-shim.js 转给这里的 KMBridge；联网只用于检查更新（见 Updater）。
 * 例外：英语单词听写页要用 Web Worker 和 fetch 加载离线识别引擎，file:// 下不行，
 * 所以同一批文件也通过虚拟地址 https://appassets.androidplatform.net/ 提供（不联网，见 serveAsset）。
 */
public class MainActivity extends Activity {
    static final String HOME = "file:///android_asset/www/index.html";
    static final String EXTRA_OPEN = "open";   // 桌面小部件点进来时要打开的页面（相对 www 的路径）
    static final int REQ_FILE = 1;
    static final String ASSET_HOST = "appassets.androidplatform.net";
    static final Map<String, String> MIME = new HashMap<>();
    static {
        MIME.put("html", "text/html"); MIME.put("js", "application/javascript"); MIME.put("css", "text/css");
        MIME.put("json", "application/json"); MIME.put("svg", "image/svg+xml"); MIME.put("png", "image/png");
        MIME.put("jpg", "image/jpeg"); MIME.put("wasm", "application/wasm"); MIME.put("gz", "application/gzip");
    }

    WebView web;
    FrameLayout root;
    View fullView;                                  // 视频全屏时 WebView 交出来的播放器画面
    WebChromeClient.CustomViewCallback fullCallback;
    ValueCallback<Uri[]> fileCallback;
    Uri photoUri;          // 拍照时相机写入的位置
    TextToSpeech tts;
    boolean ttsReady;
    Updater updater;
    String pendingOpen;    // 总入口加载完后要接着打开的页面

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        root = new FrameLayout(this);
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);
        // 内嵌的 B 站播放器（iframe）要用自己的 cookie 才能正常播放
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);   // 选图片、导入进度文件时读 content:// 文件
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);

        web.addJavascriptInterface(new Bridge(), "KMBridge");
        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome());

        if (state != null) web.restoreState(state);
        if (!openFromIntent(getIntent()) && web.getUrl() == null) web.loadUrl(HOME);

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

    /** 从桌面小部件点进来：直接打开指定页面（如宠物页）；返回键还能回到总入口 */
    boolean openFromIntent(Intent i) {
        String page = i == null ? null : i.getStringExtra(EXTRA_OPEN);
        if (page == null || !page.matches("[a-z0-9\\-/]+\\.html")) return false;
        i.removeExtra(EXTRA_OPEN);
        String url = "file:///android_asset/www/" + page;
        if (url.equals(web.getUrl())) return true;
        if (web.getUrl() == null) { pendingOpen = url; web.loadUrl(HOME); }   // 先开总入口，加载完再进去（见 onPageFinished）
        else web.loadUrl(url);
        return true;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        openFromIntent(intent);
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
        if (fullView != null) exitFullscreen();
        else if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onActivityResult(int req, int result, Intent data) {
        if (req == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(chosenFiles(result, data));
            fileCallback = null;
            photoUri = null;
            return;
        }
        super.onActivityResult(req, result, data);
    }

    /** 选图/拍照/选文件的结果：相册可多选（ClipData），相机没有返回数据时用 photoUri */
    Uri[] chosenFiles(int result, Intent data) {
        if (result != RESULT_OK) return null;
        List<Uri> list = new ArrayList<>();
        if (data != null) {
            ClipData clip = data.getClipData();
            if (clip != null) for (int k = 0; k < clip.getItemCount(); k++) list.add(clip.getItemAt(k).getUri());
            else if (data.getData() != null) list.add(data.getData());
        }
        if (list.isEmpty() && photoUri != null && ApkProvider.fileFor(this, photoUri).length() > 0) list.add(photoUri);
        return list.isEmpty() ? null : list.toArray(new Uri[0]);
    }

    /** 虚拟 https 地址 → assets/www 里的文件 */
    WebResourceResponse serveAsset(Uri u) {
        String path = u.getPath();
        if (path == null || path.isEmpty() || path.endsWith("/")) path = (path == null ? "/" : path) + "index.html";
        if (path.contains("..")) return null;
        String ext = path.substring(path.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Cache-Control", "no-cache");
        try {
            InputStream in = getAssets().open("www" + path);
            return new WebResourceResponse(mime, "utf-8", 200, "OK", headers, in);
        } catch (IOException e) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", headers, null);
        }
    }

    class Client extends WebViewClient {
        @Override
        public void onPageFinished(WebView view, String url) {
            if (pendingOpen == null) return;
            String u = pendingOpen;
            pendingOpen = null;
            view.loadUrl(u);
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
            return ASSET_HOST.equals(req.getUrl().getHost()) ? serveAsset(req.getUrl()) : null;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if ("file".equals(u.getScheme()) || ASSET_HOST.equals(u.getHost())) return false;
            // 网页里内嵌的视频播放器（iframe）在 App 里加载，不跳出去
            if (!req.isForMainFrame()) return false;
            // 外部链接交给系统浏览器
            try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (ActivityNotFoundException ignored) { }
            return true;
        }
    }

    /** 退出视频全屏：拿掉播放器画面，恢复状态栏 */
    void exitFullscreen() {
        if (fullView == null) return;
        root.removeView(fullView);
        fullView = null;
        if (fullCallback != null) fullCallback.onCustomViewHidden();
        fullCallback = null;
        showSystemBars(true);
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

    class Chrome extends WebChromeClient {
        // 视频点“全屏”：把播放器画面盖在整个屏幕上；返回键或再点一次退出
        @Override
        public void onShowCustomView(View view, CustomViewCallback cb) {
            if (fullView != null) { cb.onCustomViewHidden(); return; }
            fullView = view;
            fullCallback = cb;
            view.setBackgroundColor(0xFF000000);
            root.addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            showSystemBars(false);
        }

        @Override
        public void onHideCustomView() { fullCallback = null; exitFullscreen(); }   // 网页自己退出的全屏，不用再通知它

        // 文件选择框：“导入进度文件”选文件；单词听写拍照（capture）或从相册选图（可多选）
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb, FileChooserParams params) {
            if (fileCallback != null) fileCallback.onReceiveValue(null);
            fileCallback = cb;
            photoUri = null;
            boolean image = false;
            for (String t : params.getAcceptTypes()) if (t != null && t.startsWith("image")) image = true;
            Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
            pick.addCategory(Intent.CATEGORY_OPENABLE);
            pick.setType(image ? "image/*" : "*/*");
            if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) pick.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            Intent launch;
            if (image && params.isCaptureEnabled()) {
                photoUri = ApkProvider.newPhoto(MainActivity.this);
                launch = new Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    .putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
                    .addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                launch.setClipData(ClipData.newRawUri("photo", photoUri));   // 有的相机要靠 ClipData 才拿得到写权限
            } else {
                launch = Intent.createChooser(pick, image ? "选择图片" : "选择进度文件");
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
    }

    class Bridge {
        /** 桌面小狗：网页推来小狗概况（JSON，空字符串表示还没领养） */
        @JavascriptInterface
        public void updatePet(String json) { PetWidget.saveState(MainActivity.this, json == null ? "" : json); }

        /** 桌面小狗：宠物页拍的小狗照片（PNG 的 base64） */
        @JavascriptInterface
        public void savePetImage(String base64) { if (base64 != null) PetWidget.saveImage(MainActivity.this, base64); }

        /** 桌面小狗：请系统弹出“添加到桌面”；桌面不支持时返回 false，网页会改为提示手动添加 */
        @JavascriptInterface
        public boolean pinWidget() {
            try { return PetWidget.pin(MainActivity.this); } catch (Exception e) { return false; }
        }

        /** 桌面上已放了几个小狗（网页用来确认“放到桌面”是否真的成功） */
        @JavascriptInterface
        public int widgetCount() {
            try { return PetWidget.count(MainActivity.this); } catch (Exception e) { return -1; }
        }

        /** 品牌、系统版本、桌面是否支持一键添加（JSON） */
        @JavascriptInterface
        public String widgetInfo() { return PetWidget.info(MainActivity.this); }

        /** 打开本应用的系统设置页（去开“桌面快捷方式”权限） */
        @JavascriptInterface
        public void openAppSettings() {
            runOnUiThread(new Runnable() {
                public void run() {
                    try {
                        startActivity(new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                            Uri.parse("package:" + getPackageName())));
                    } catch (ActivityNotFoundException ignored) { }
                }
            });
        }

        /** 听写时保持屏幕常亮 */
        @JavascriptInterface
        public void keepScreenOn(final boolean on) {
            runOnUiThread(new Runnable() {
                public void run() { web.setKeepScreenOn(on); }
            });
        }

        /** 网页里的“返回”：https 页面不能自己跳回 file:// 页面，交给 WebView 后退 */
        @JavascriptInterface
        public void goBack() {
            runOnUiThread(new Runnable() {
                public void run() { if (web.canGoBack()) web.goBack(); else web.loadUrl(HOME); }
            });
        }

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
