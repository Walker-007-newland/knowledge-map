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
import java.util.ArrayList;
import java.util.List;

/**
 * 电子教材点读：平台给部分教材（目前主要是英语）做了「热区」——课本某一页上的一块区域对应一段录音。
 * - 热区表：详情 ti_items 里 ti_file_flag = hot_zone 的 txt（JSON 数组），平台网页版不带凭据直接读，这里也一样；
 *   存 files/textbooks/{id}.hz.json。每条：current_page（从 1 起）、left/top/width/height（以 document_width × document_height
 *   的页面为准的像素）、audio_id、audio_src、audio_name。详情里没有热区时存 []，表示这本不能点读。
 * - 录音：audio_src 在私有 CDN，和 PDF 一样要用学生自己的平台登录签名（TbAuth）才能下；下过的存
 *   files/textbooks/{id}.audio/{audio_id}.mp3，之后离线也能放。
 * 都在后台线程调用。
 */
final class TbAudio {
    private TbAudio() { }

    static final String TAG = "KMTbAudio";

    /** 一个点读区：page 从 0 起；x/y/w/h 是占页面宽高的比例 */
    static final class Zone {
        int page;
        float x, y, w, h;
        String audioId, src, name;
        boolean contains(float fx, float fy) { return fx >= x && fx <= x + w && fy >= y && fy <= y + h; }
    }

    static File zoneFile(Context c, String id) { return new File(Textbooks.dir(c), id + ".hz.json"); }

    static File audioDir(Context c, String id) { return new File(Textbooks.dir(c), id + ".audio"); }

    static boolean validAudioId(String a) { return a != null && a.matches("[0-9a-zA-Z-]{8,64}"); }

    static File audioFile(Context c, String id, Zone z) { return new File(audioDir(c, id), z.audioId + ".mp3"); }

    /** 读热区表：本机有就用本机的，没有就联网取一次。返回 null = 暂时取不到（没网），空列表 = 这本没有点读 */
    static List<Zone> load(Context c, String id) {
        File f = zoneFile(c, id);
        String text = f.isFile() ? readText(f) : null;
        if (text == null) {
            text = fetchZones(id);
            if (text == null) return null;
            writeText(f, text);
        }
        return parse(text);
    }

    static String fetchZones(String id) {
        Object d = Textbooks.getJson(Textbooks.DETAIL + id + ".json");
        if (!(d instanceof JSONObject)) return null;
        JSONArray items = ((JSONObject) d).optJSONArray("ti_items");
        JSONArray st = null;
        for (int i = 0; items != null && i < items.length(); i++) {
            JSONObject t = items.optJSONObject(i);
            if (t != null && "hot_zone".equals(t.optString("ti_file_flag"))) st = t.optJSONArray("ti_storages");
        }
        if (st == null) return "[]";
        for (int i = 0; i < st.length(); i++) {
            String url = st.optString(i, "");
            if (!privateUrl(url)) continue;
            Object o = Textbooks.getJson(TbAuth.encode(url));
            if (o instanceof JSONArray) return o.toString();
        }
        return null;
    }

    static List<Zone> parse(String text) {
        List<Zone> out = new ArrayList<>();
        try {
            JSONArray a = new JSONArray(text);
            for (int i = 0; i < a.length(); i++) {
                JSONObject o = a.optJSONObject(i);
                if (o == null || "OFFLINE".equalsIgnoreCase(o.optString("status"))) continue;
                double dw = o.optDouble("document_width", 0), dh = o.optDouble("document_height", 0);
                int page = o.optInt("current_page", 0);
                Zone z = new Zone();
                z.audioId = o.optString("audio_id", "");
                z.src = o.optString("audio_src", "");
                if (dw <= 0 || dh <= 0 || page < 1 || !validAudioId(z.audioId) || !privateUrl(z.src)) continue;
                z.page = page - 1;
                z.x = (float) (o.optDouble("left", 0) / dw);
                z.y = (float) (o.optDouble("top", 0) / dh);
                z.w = (float) (o.optDouble("width", 0) / dw);
                z.h = (float) (o.optDouble("height", 0) / dh);
                z.name = o.optString("audio_name", "");
                if (z.w > 0 && z.h > 0) out.add(z);
            }
        } catch (Exception e) { Log.w(TAG, "parse " + e.getClass().getSimpleName()); }
        return out;
    }

    static boolean privateUrl(String url) {
        try { return TbAuth.privateHost(URI.create(TbAuth.encode(url)).getHost()); } catch (Exception e) { return false; }
    }

    /**
     * 取一段录音（本机有就直接返回）。结果：0 = 好了，-3 = 没登录平台，401 = 登录失效，其它 HTTP 码 = 服务器拒绝，-1 = 网络错误，-2 = 文件不对
     */
    static int fetchAudio(Context c, String id, Zone z) {
        File dst = audioFile(c, id, z);
        if (dst.isFile() && dst.length() > 0) return 0;
        SharedPreferences a = Textbooks.auth(c);
        String access = a.getString("access_token", ""), mac = a.getString("mac_key", "");
        if (access.isEmpty()) return -3;
        File dir = audioDir(c, id);
        if (!dir.isDirectory()) dir.mkdirs();
        File part = new File(dir, z.audioId + ".part");
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(TbAuth.encode(z.src)).openConnection();
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(30000);
            conn.setInstanceFollowRedirects(false);
            conn.setRequestProperty("User-Agent", Textbooks.UA);
            conn.setRequestProperty("Referer", "https://basic.smartedu.cn/");
            conn.setRequestProperty("Origin", "https://basic.smartedu.cn");
            conn.setRequestProperty("X-ND-AUTH", TbAuth.header(z.src, "GET", access, mac, a.getLong("diff", 0), System.currentTimeMillis()));
            int code = conn.getResponseCode();
            if (code != 200) return code;
            long len = conn.getContentLength(), got = 0;
            InputStream in = conn.getInputStream();
            OutputStream out = new FileOutputStream(part);
            try {
                byte[] b = new byte[32768];
                int n;
                while ((n = in.read(b)) > 0) { out.write(b, 0, n); got += n; }
            } finally { try { out.close(); } catch (IOException ignored) { } try { in.close(); } catch (IOException ignored) { } }
            if (got == 0 || (len > 0 && got != len)) { part.delete(); return -2; }
            if (!part.renameTo(dst)) { part.delete(); return -1; }
            return 0;
        } catch (Exception e) {
            part.delete();
            Log.w(TAG, "audio " + e.getClass().getSimpleName());   // 不打地址和请求头
            return -1;
        } finally { if (conn != null) conn.disconnect(); }
    }

    /** 已经下到本机的录音段数 */
    static int cached(Context c, String id, List<Zone> zones) {
        int n = 0;
        for (Zone z : zones) if (audioFile(c, id, z).isFile()) n++;
        return n;
    }

    /** 删书时一起删：热区表和录音 */
    static void delete(Context c, String id) {
        zoneFile(c, id).delete();
        File d = audioDir(c, id);
        File[] fs = d.listFiles();
        if (fs != null) for (File f : fs) f.delete();
        d.delete();
    }

    static long size(File f) {
        if (!f.isDirectory()) return f.length();
        long n = 0;
        File[] fs = f.listFiles();
        if (fs != null) for (File x : fs) n += x.length();
        return n;
    }

    static String readText(File f) {
        try {
            InputStream in = new FileInputStream(f);
            try {
                ByteArrayOutputStream buf = new ByteArrayOutputStream();
                byte[] b = new byte[16384];
                int n;
                while ((n = in.read(b)) > 0) buf.write(b, 0, n);
                return new String(buf.toByteArray(), StandardCharsets.UTF_8);
            } finally { in.close(); }
        } catch (IOException e) { return null; }
    }

    static void writeText(File f, String s) {
        File tmp = new File(f.getPath() + ".tmp");
        try {
            OutputStream out = new FileOutputStream(tmp);
            try { out.write(s.getBytes(StandardCharsets.UTF_8)); } finally { out.close(); }
            if (!tmp.renameTo(f)) tmp.delete();
        } catch (IOException e) { tmp.delete(); }
    }
}
