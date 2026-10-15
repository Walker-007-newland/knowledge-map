package com.fjzk.teamadmin;

import android.content.Context;
import android.content.SharedPreferences;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** GitHub API 小封装：token 只存在本机 SharedPreferences，不写进 APK。 */
final class Gh {
    static final String REPO = "Walker-007-newland/knowledge-map-team";
    static final String API = "https://api.github.com";

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences("admin", Context.MODE_PRIVATE);
    }

    static String token(Context c) {
        return prefs(c).getString("token", "");
    }

    /** 返回 [状态码, 响应正文]；网络错误时状态码为 0。 */
    static String[] request(Context c, String method, String path, String body) {
        HttpURLConnection con = null;
        try {
            String url = path.startsWith("http") ? path : API + path;
            con = (HttpURLConnection) new URL(url).openConnection();
            con.setRequestMethod(method);
            con.setConnectTimeout(20000);
            con.setReadTimeout(30000);
            con.setRequestProperty("Authorization", "Bearer " + token(c));
            con.setRequestProperty("Accept", "application/vnd.github+json");
            con.setRequestProperty("X-GitHub-Api-Version", "2022-11-28");
            con.setRequestProperty("User-Agent", "km-team-admin");
            if (body != null && !body.isEmpty()) {
                byte[] b = body.getBytes(StandardCharsets.UTF_8);
                con.setDoOutput(true);
                con.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                try (OutputStream os = con.getOutputStream()) { os.write(b); }
            }
            int code = con.getResponseCode();
            InputStream in = code >= 400 ? con.getErrorStream() : con.getInputStream();
            String text = "";
            if (in != null) {
                ByteArrayOutputStream bo = new ByteArrayOutputStream();
                byte[] buf = new byte[16384];
                int n;
                while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
                in.close();
                text = bo.toString("UTF-8");
            }
            return new String[]{String.valueOf(code), text};
        } catch (Exception e) {
            return new String[]{"0", String.valueOf(e)};
        } finally {
            if (con != null) con.disconnect();
        }
    }
}
