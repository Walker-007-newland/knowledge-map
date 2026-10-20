package com.fjzk.teamadmin;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URLEncoder;
import java.util.TreeSet;

/** 每 30 分钟左右查一次“待审批”和“阻塞”的需求单，有新的就发通知；顺便取一次同步节点状态，异常时发节点提醒（NodeHealth）。 */
public class CheckJob extends JobService {
    static final int JOB_ID = 1;
    static final String CHANNEL = "approve";

    static void schedule(Context c) {
        JobScheduler js = (JobScheduler) c.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (js.getPendingJob(JOB_ID) != null) return;
        js.schedule(new JobInfo.Builder(JOB_ID, new ComponentName(c, CheckJob.class))
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setPeriodic(30 * 60 * 1000L)
                .setPersisted(true)
                .build());
    }

    @Override
    public boolean onStartJob(JobParameters params) {
        new Thread(() -> {
            try { checkNode(this); } catch (Exception ignored) { }   // 节点提醒和待审批提醒互不影响
            try { check(this); } catch (Exception ignored) { }
            jobFinished(params, false);
        }).start();
        return true;
    }

    static final String CHANNEL_NODE = "node";

    /**
     * 同步节点健康提醒（#6 第三期）：取一次 status，按 NodeHealth 的规则发通知（每类每天最多一次）。
     * 没设置节点就什么都不做。返回这次发出的通知条数。
     */
    static int checkNode(Context c) throws Exception {
        if (!NodeStore.configured(c)) return 0;
        if (NodeStore.hasPending(c)) NodeStore.resolvePending(c);
        Node.Code code = NodeStore.load(c);
        if (code == null) return 0;
        Node.Result r = Node.call(code, NodeStore.ctr(c), "status", "{}");
        NodeHealth.Status s = null;
        String why;
        if (r.status == 200) {
            s = NodeHealth.parse(r.text);
            why = "节点响应格式不对";
        } else if (r.status == 0) {
            why = r.text;
        } else if (r.status == 403) {
            why = "节点拒绝了请求：管理码可能已失效，或这个网络被限速/封禁";
        } else {
            why = "节点返回 " + r.status;
        }
        String today = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.ROOT).format(new java.util.Date());
        java.util.List<NodeHealth.Alert> alerts = NodeHealth.check(s, why, today, code.host, NodeStore.health(c));
        for (NodeHealth.Alert a : alerts) notify(c, CHANNEL_NODE, "同步节点提醒", a.notifyId(), a.title, a.text);
        return alerts.size();
    }

    @Override
    public boolean onStopJob(JobParameters params) { return true; }

    static void check(Context c) throws Exception {
        if (Gh.token(c).isEmpty()) return;
        TreeSet<String> now = new TreeSet<>();
        StringBuilder titles = new StringBuilder();
        for (String st : new String[]{"待审批", "阻塞"}) {
            String label = URLEncoder.encode("状态:" + st, "UTF-8");
            String[] r = Gh.request(c, "GET", "/repos/" + Gh.REPO + "/issues?state=open&per_page=50&labels=" + label, null);
            if (!"200".equals(r[0])) return;
            JSONArray a = new JSONArray(r[1]);
            for (int i = 0; i < a.length(); i++) {
                JSONObject o = a.getJSONObject(i);
                // 同一单被改成 v2 再次待审批时也要提醒，所以带上更新时间
                now.add(o.getInt("number") + "@" + o.getString("updated_at"));
                if (titles.length() < 200) titles.append(st).append(" #").append(o.getInt("number")).append(' ').append(o.getString("title")).append('\n');
            }
        }
        String seen = Gh.prefs(c).getString("seen", "");
        TreeSet<String> old = new TreeSet<>();
        for (String s : seen.split(",")) if (!s.isEmpty()) old.add(s);
        boolean fresh = false;
        for (String s : now) if (!old.contains(s)) fresh = true;
        Gh.prefs(c).edit().putString("seen", String.join(",", now)).apply();
        if (fresh) notify(c, "有 " + now.size() + " 个需求等你处理", titles.toString().trim());
    }

    static void notify(Context c, String title, String text) {
        notify(c, CHANNEL, "待审批提醒", 1, title, text);
    }

    static void notify(Context c, String channel, String channelName, int id, String title, String text) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel(channel, channelName, NotificationManager.IMPORTANCE_DEFAULT));
        }
        PendingIntent pi = PendingIntent.getActivity(c, 0, new Intent(c, MainActivity.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, channel) : new Notification.Builder(c);
        b.setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi)
                .setAutoCancel(true);
        nm.notify(id, b.build());
    }
}
