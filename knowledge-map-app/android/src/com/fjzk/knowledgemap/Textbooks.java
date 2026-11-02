package com.fjzk.knowledgemap;

import android.content.Context;
import android.content.SharedPreferences;
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
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * 电子教材（国家中小学智慧教育平台的官方 PDF）：平台登录凭据、下载、本机已下载列表。
 * - 凭据：学生在 TbLoginActivity 里自己登录平台后读到的 access_token / mac_key / diff，存在私有 SharedPreferences
 *   km_textbook_auth（不进系统备份，见 res/xml/backup_rules.xml）；不打印、不写日志、不上传，只用来给私有 CDN 的请求签名。
 * - 下载：查详情（公开接口）→ 带 X-ND-AUTH 从 r1/r2/r3-ndr-private 下载 → files/textbooks/{id}.pdf.part，
 *   核对大小和 %PDF 开头后改名为 {id}.pdf。同时只下一本，可取消；不做断点续传。
 * - 事件（JSON）经 Sink 送给 textbooks.html：progress / done / error / cancelled / login。
 * 单例（应用级），MainActivity 重建后下载照常进行，重新挂上 Sink 即可。
 */
class Textbooks {
    static final String TAG = "KMTextbooks";
    static final String PREF_AUTH = "km_textbook_auth";
    static final String PREF = "km_textbooks";
    static final String DETAIL = "https://s-file-1.ykt.cbern.com.cn/zxx/ndrv2/resources/tch_material/details/";
    static final String THEMATIC = "https://s-file-1.ykt.cbern.com.cn/zxx/ndrs/special_edu/thematic_course/";
    static final String UA = "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
    static final long RESERVE = 50L << 20;   // 下载前至少留出 50MB 空间

    interface Sink { void event(String json); }

    static Textbooks one;

    static synchronized Textbooks get(Context c) {
        if (one == null) one = new Textbooks(c.getApplicationContext());
        return one;
    }

    final Context ctx;
    volatile Sink sink;
    /** 正在下载的那本（null = 空闲）；got / total 供页面刷新时显示进度 */
    volatile String jobId, jobTitle;
    volatile long jobGot, jobTotal;
    volatile boolean cancel;

    Textbooks(Context c) {
        ctx = c;
        // 上次 App 被杀掉时留下的半截文件
        File[] fs = dir(c).listFiles();
        if (fs != null) for (File f : fs) if (f.getName().endsWith(".part")) f.delete();
    }

    static File dir(Context c) {
        File d = new File(c.getFilesDir(), "textbooks");
        if (!d.isDirectory()) d.mkdirs();
        return d;
    }

    static File file(Context c, String id) { return new File(dir(c), id + ".pdf"); }

    // ---------------- 平台凭据

    static SharedPreferences auth(Context c) { return c.getSharedPreferences(PREF_AUTH, Context.MODE_PRIVATE); }

    static boolean loggedIn(Context c) { return !auth(c).getString("access_token", "").isEmpty(); }

    static void saveAuth(Context c, String access, String macKey, long diff, String expires) {
        auth(c).edit().clear().putString("access_token", access).putString("mac_key", macKey == null ? "" : macKey)
            .putLong("diff", diff).putString("expires_at", expires == null ? "" : expires)
            .putLong("at", System.currentTimeMillis()).putBoolean("expired", false).commit();
    }

    static void clearAuth(Context c) { auth(c).edit().clear().commit(); }

    void emit(JSONObject o) {
        Sink s = sink;
        if (s != null) s.event(o.toString());
    }

    void emitLogin() {
        try { emit(new JSONObject().put("type", "login")); } catch (Exception ignored) { }
    }

    // ---------------- 状态

    String state() {
        JSONObject o = new JSONObject();
        try {
            SharedPreferences a = auth(ctx), p = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
            JSONObject lg = new JSONObject();
            lg.put("in", loggedIn(ctx));
            lg.put("at", a.getLong("at", 0));
            lg.put("expired", a.getBoolean("expired", false));
            lg.put("full", !a.getString("mac_key", "").isEmpty());
            o.put("login", lg);
            JSONObject books = new JSONObject();
            long used = 0;
            File[] fs = dir(ctx).listFiles();
            if (fs != null) for (File f : fs) {
                used += f.length();
                String n = f.getName();
                if (!n.endsWith(".pdf")) continue;
                String id = n.substring(0, n.length() - 4);
                if (!TbAuth.validId(id)) continue;
                books.put(id, new JSONObject().put("size", f.length()).put("page", p.getInt("page_" + id, 0))
                    .put("pages", p.getInt("pages_" + id, 0)).put("title", p.getString("title_" + id, "")));
            }
            o.put("books", books);
            o.put("used", used);
            o.put("free", dir(ctx).getUsableSpace());
            if (jobId != null) o.put("job", new JSONObject().put("id", jobId).put("got", jobGot).put("total", jobTotal));
        } catch (Exception e) { Log.w(TAG, "state " + e.getClass().getSimpleName()); }
        return o.toString();
    }

    boolean delete(String id) {
        if (!TbAuth.validId(id) || id.equals(jobId)) return false;
        File f = file(ctx, id);
        boolean ok = !f.exists() || f.delete();
        ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit()
            .remove("page_" + id).remove("pages_" + id).remove("title_" + id).apply();
        return ok;
    }

    void cancel() { if (jobId != null) cancel = true; }

    // ---------------- 下载

    /** 开始下载；已经在下载别的书时返回 false（页面提示「同时只下一本」） */
    synchronized boolean download(final String id, final String title, final boolean thematic) {
        if (!TbAuth.validId(id) || jobId != null) return false;
        jobId = id; jobTitle = title == null ? "" : title; jobGot = 0; jobTotal = 0; cancel = false;
        Thread t = new Thread(new Runnable() {
            public void run() {
                try { run1(id, thematic); }
                catch (Throwable e) { fail(id, "下载出错：" + e.getClass().getSimpleName(), false); }
                finally { synchronized (Textbooks.this) { jobId = null; } }
            }
        }, "km-textbook");
        t.start();
        return true;
    }

    void fail(String id, String msg, boolean authErr) {
        new File(dir(ctx), id + ".pdf.part").delete();
        try { emit(new JSONObject().put("type", "error").put("id", id).put("msg", msg).put("auth", authErr)); } catch (Exception ignored) { }
    }

    /** 401 = 凭据失效：记下来，页面显示「请重新登录平台」 */
    void markExpired() { auth(ctx).edit().putBoolean("expired", true).commit(); emitLogin(); }

    void run1(String id, boolean thematic) throws Exception {
        SharedPreferences a = auth(ctx);
        String access = a.getString("access_token", ""), mac = a.getString("mac_key", "");
        long diff = a.getLong("diff", 0);
        if (access.isEmpty()) { fail(id, "请先登录国家中小学智慧教育平台", true); return; }

        // 1. 详情：普通电子教材在 tch_material 详情，专题课（部分体育等）在 thematic_course 列表里
        JSONObject pdf = null;
        if (!thematic) pdf = findPdf(getJson(DETAIL + id + ".json"));
        if (pdf == null) {
            Object list = getJson(THEMATIC + id + "/resources/list.json");
            if (list instanceof JSONArray) {
                JSONArray arr = (JSONArray) list;
                for (int i = 0; i < arr.length() && pdf == null; i++) pdf = findPdf(arr.optJSONObject(i));
            }
        }
        if (cancel) { cancelled(id); return; }
        if (pdf == null) { fail(id, "平台上没找到这本书的 PDF（可能下架或改版了）", false); return; }
        long size = pdf.optLong("ti_size", 0);
        JSONArray st = pdf.optJSONArray("ti_storages");
        if (size > 0 && dir(ctx).getUsableSpace() < size + RESERVE) {
            fail(id, "存储空间不够：这本需要 " + (size >> 20) + "MB，请先删除一些教材", false); return;
        }
        jobTotal = size;

        // 2. 依次试 r1/r2/r3 私有地址（只用国内私有 CDN，不用海外地址）
        String lastMsg = "下载失败，请检查网络后重试";
        boolean authErr = false;
        for (int i = 0; st != null && i < st.length(); i++) {
            String url = st.optString(i, "");
            String host;
            try { host = URI.create(TbAuth.encode(url)).getHost(); } catch (Exception e) { continue; }
            if (!TbAuth.privateHost(host)) continue;
            int r = fetch(id, url, size, access, mac, diff);
            if (r == 0) return;                                       // 成功或已取消
            if (r == 401) { markExpired(); fail(id, "平台登录已失效，请重新登录平台", true); return; }
            if (r == 400 || r == 403) { authErr = true; lastMsg = "平台拒绝下载（" + r + "），请退出平台登录后重新登录再试"; }
            else if (r == -2) lastMsg = "下载的文件不完整，请重试";
            else if (r > 0) lastMsg = "下载失败（服务器 " + r + "），请稍后重试";
        }
        fail(id, lastMsg, authErr);
    }

    void cancelled(String id) {
        new File(dir(ctx), id + ".pdf.part").delete();
        try { emit(new JSONObject().put("type", "cancelled").put("id", id)); } catch (Exception ignored) { }
    }

    static JSONObject findPdf(Object o) {
        if (!(o instanceof JSONObject)) return null;
        JSONArray items = ((JSONObject) o).optJSONArray("ti_items");
        if (items == null) return null;
        for (int i = 0; i < items.length(); i++) {
            JSONObject t = items.optJSONObject(i);
            if (t != null && "pdf".equalsIgnoreCase(t.optString("ti_format")) && "source".equals(t.optString("ti_file_flag"))
                && t.optJSONArray("ti_storages") != null) return t;
        }
        return null;
    }

    /** 公开的详情接口（不带凭据）；失败返回 null */
    static Object getJson(String url) {
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(url).openConnection();
            c.setConnectTimeout(15000);
            c.setReadTimeout(30000);
            c.setRequestProperty("User-Agent", UA);
            if (c.getResponseCode() != 200) return null;
            InputStream in = c.getInputStream();
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            byte[] b = new byte[16384];
            int n;
            while ((n = in.read(b)) > 0) buf.write(b, 0, n);
            in.close();
            String s = new String(buf.toByteArray(), StandardCharsets.UTF_8).trim();
            return s.startsWith("[") ? new JSONArray(s) : new JSONObject(s);
        } catch (Exception e) {
            return null;
        } finally { if (c != null) c.disconnect(); }
    }

    /** 下载一个地址：0 = 成功（或已取消），HTTP 状态码 = 服务器拒绝，-1 = 网络错误，-2 = 文件不完整 */
    int fetch(String id, String url, long size, String access, String mac, long diff) {
        File part = new File(dir(ctx), id + ".pdf.part"), dst = file(ctx, id);
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(TbAuth.encode(url)).openConnection();
            c.setConnectTimeout(15000);
            c.setReadTimeout(60000);
            c.setInstanceFollowRedirects(false);
            c.setRequestProperty("User-Agent", UA);
            c.setRequestProperty("Referer", "https://basic.smartedu.cn/");
            c.setRequestProperty("Origin", "https://basic.smartedu.cn");
            c.setRequestProperty("X-ND-AUTH", TbAuth.header(url, "GET", access, mac, diff, System.currentTimeMillis()));
            int code = c.getResponseCode();
            if (code != 200) return code;
            long len = c.getContentLength();
            if (size <= 0 && len > 0) { size = len; jobTotal = len; }
            InputStream in = c.getInputStream();
            OutputStream out = new FileOutputStream(part);
            long got = 0, last = 0;
            try {
                byte[] b = new byte[65536];
                int n;
                while ((n = in.read(b)) > 0) {
                    if (cancel) { out.close(); in.close(); cancelled(id); return 0; }
                    out.write(b, 0, n);
                    got += n;
                    jobGot = got;
                    long now = System.currentTimeMillis();
                    if (now - last > 400) {
                        last = now;
                        emit(new JSONObject().put("type", "progress").put("id", id).put("got", got).put("total", size));
                    }
                }
            } finally { try { out.close(); } catch (IOException ignored) { } try { in.close(); } catch (IOException ignored) { } }
            if ((size > 0 && got != size) || !isPdf(part)) { part.delete(); return -2; }
            if (dst.exists()) dst.delete();
            if (!part.renameTo(dst)) { part.delete(); return -1; }
            ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().putString("title_" + id, jobTitle).apply();
            emit(new JSONObject().put("type", "done").put("id", id).put("size", dst.length()));
            return 0;
        } catch (Exception e) {
            part.delete();
            if (cancel) { cancelled(id); return 0; }
            Log.w(TAG, "download " + e.getClass().getSimpleName());   // 不打地址和请求头
            return -1;
        } finally { if (c != null) c.disconnect(); }
    }

    static boolean isPdf(File f) {
        try {
            InputStream in = new FileInputStream(f);
            try {
                byte[] b = new byte[5];
                return in.read(b) == 5 && new String(b, StandardCharsets.US_ASCII).equals("%PDF-");
            } finally { in.close(); }
        } catch (IOException e) { return false; }
    }
}
