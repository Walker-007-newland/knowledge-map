package com.fjzk.teamadmin;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 同步节点健康提醒（#6 第三期）：后台检查（CheckJob）时取一次节点 status，按下面四条规则决定发不发系统通知，每类每天最多一次。
 *   down    连续两次连不上（或被节点拒绝）
 *   disk    磁盘剩余 < 10%
 *   expiry  离服务器到期 ≤ 7 天（含已过期）
 *   cert    网页后台证书剩 < 48 小时（正常每 3–4 天自动续一次，始终剩 3 天以上）
 * 纯 Java，不依赖 Android：电脑上 NodeTest 直接测。文案和 www/node.js 的 nodeHealthAlerts（浏览器 ?mock 预览用）保持一致。
 */
final class NodeHealth {
    /** 每类一个通知编号（审批提醒用的是 1）。 */
    static final String[] TYPES = {"down", "disk", "expiry", "cert"};

    static final class Alert {
        final String type, title, text;
        Alert(String type, String title, String text) { this.type = type; this.title = title; this.text = text; }
        int notifyId() { for (int i = 0; i < TYPES.length; i++) if (TYPES[i].equals(type)) return 101 + i; return 100; }
    }

    /** 两次检查之间要记住的：连续失败次数、每类上次提醒的日期。Android 存 SharedPreferences，测试存内存。 */
    interface State {
        int fails();
        void setFails(int n);
        String lastDay(String type);
        void setLastDay(String type, String day);
    }

    /** status 里用到的几项。 */
    static final class Status {
        long diskTotal, diskFree;
        int daysLeft;
        String expiry = "";
        boolean tlsEnabled;
        Double certHours;     // 没有网页后台（1.0.0）或还没有证书时为 null
    }

    /** 从 status 的响应文字（{"ok":true,"data":{...}}）里取出需要的几项；格式不对返回 null。 */
    static Status parse(String json) {
        if (json == null || !json.startsWith("{\"ok\":true")) return null;
        Status s = new Status();
        Long total = num(json, "disk_total"), free = num(json, "disk_free"), days = num(json, "days_left");
        if (total == null || free == null || days == null) return null;
        s.diskTotal = total; s.diskFree = free; s.daysLeft = (int) (long) days;
        Matcher m = Pattern.compile("\"expiry\":\"([0-9-]{10})\"").matcher(json);
        if (m.find()) s.expiry = m.group(1);
        int t = json.indexOf("\"tls\":{");
        if (t >= 0) {
            String tls = json.substring(t);
            s.tlsEnabled = tls.startsWith("\"tls\":{\"enabled\":true");
            Matcher h = Pattern.compile("\"hours_left\":(-?[0-9]+(?:\\.[0-9]+)?)").matcher(tls);
            if (h.find()) s.certHours = Double.parseDouble(h.group(1));
        }
        return s;
    }

    private static Long num(String json, String name) {
        Matcher m = Pattern.compile("\"" + name + "\":(-?[0-9]+)").matcher(json);
        return m.find() ? Long.parseLong(m.group(1)) : null;
    }

    /**
     * 一次后台检查。s == null 表示这次没取到状态（why 是原因）。today 是本地日期 yyyy-MM-dd。
     * 返回这次该发的通知（已按「每类每天最多一次」过滤，并记进 state）。
     */
    static List<Alert> check(Status s, String why, String today, String host, State st) {
        List<Alert> out = new ArrayList<>();
        if (s == null) {
            int n = st.fails() + 1;
            st.setFails(n);
            if (n >= 2) add(out, st, today, new Alert("down", "同步节点连不上",
                    "后台连续 " + n + " 次没连上 " + host + "（" + (why == null || why.isEmpty() ? "原因不明" : why) + "）。"
                            + "服务器可能停了、到期了，或网络有问题；平板之间的局域网同步不受影响。"));
            return out;
        }
        st.setFails(0);
        if (s.diskTotal > 0 && s.diskFree * 10 < s.diskTotal) {
            add(out, st, today, new Alert("disk", "同步节点磁盘快满了",
                    "只剩 " + fmtBytes(s.diskFree) + " / " + fmtBytes(s.diskTotal) + "（" + (s.diskFree * 100 / s.diskTotal) + "%）。"
                            + "可以在「节点 → 同步组」里清空或移除占用大的组。"));
        }
        if (s.daysLeft <= 7) {
            String left = s.daysLeft > 0 ? "还剩 " + s.daysLeft + " 天" : s.daysLeft == 0 ? "今天到期" : "已过期 " + (-s.daysLeft) + " 天";
            add(out, st, today, new Alert("expiry", "同步节点服务器快到期了",
                    "服务器 " + s.expiry + " 到期，" + left + "。请到腾讯云续费，续费后在「节点」页点「改到期日」。到期停机后同步节点和网页后台都会停。"));
        }
        if (s.tlsEnabled && s.certHours != null && s.certHours < 48) {
            long h = Math.round(s.certHours);
            String left = h >= 0 ? "还剩 " + h + " 小时" : "已过期 " + (-h) + " 小时";
            add(out, st, today, new Alert("cert", "网页后台证书快过期了",
                    "证书" + left + "，自动续期可能失败了。只影响网页后台 https://" + host + "，审批 App 和平板同步不受影响；"
                            + "在电脑上运行 deploy.ps1 -TlsCheck 查看。"));
        }
        return out;
    }

    private static void add(List<Alert> out, State st, String today, Alert a) {
        if (today.equals(st.lastDay(a.type))) return;
        st.setLastDay(a.type, today);
        out.add(a);
    }

    /** 和 node.js 的 fmtBytes 一样。 */
    static String fmtBytes(long n) {
        if (n < 1024) return n + " B";
        if (n < 1048576L) return String.format(Locale.ROOT, "%.1f KB", n / 1024.0);
        if (n < 1073741824L) return String.format(Locale.ROOT, "%.1f MB", n / 1048576.0);
        return String.format(Locale.ROOT, "%.1f GB", n / 1073741824.0);
    }

    private NodeHealth() { }
}
