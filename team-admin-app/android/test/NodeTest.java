package com.fjzk.teamadmin;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 审批 App 节点客户端（Node.java）和 Python 节点的互通测试，以及节点健康提醒规则（NodeHealth.java），不依赖 Android。
 * 最后会换管理密钥（节点 1.3.0），所以不要对真实服务器跑。
 * 一般由 knowledge-map-app/sync-node/test_node.py 自动编译运行；也可以手动：
 *   javac -encoding UTF-8 -d out team-admin-app/android/src/com/fjzk/teamadmin/Node.java team-admin-app/android/src/com/fjzk/teamadmin/NodeHealth.java team-admin-app/android/test/NodeTest.java
 *   java -cp out com.fjzk.teamadmin.NodeTest "kmadmin:1?h=127.0.0.1&p=<端口>&k=<管理密钥>"
 * 每项输出 OK/FAIL，全部通过时最后一行是 ALL OK。
 */
public class NodeTest {
    static int fails = 0;

    static void check(boolean ok, String name, String detail) {
        System.out.println((ok ? "OK " : "FAIL ") + name + (ok ? "" : "  —— " + detail));
        if (!ok) fails++;
    }

    static class Mem implements Node.CtrStore {
        long v;
        public long last() { return v; }
        public void save(long x) { v = x; }
    }

    static boolean ok(Node.Result r) { return r.status == 200 && r.text.startsWith("{\"ok\":true"); }

    public static void main(String[] a) throws Exception {
        Node.Code c = Node.parse(a[0]);
        Mem store = new Mem();
        Node.Result r = Node.call(c, store, "status", "{}");
        check(ok(r) && r.text.contains("\"version\""), "status", r.status + " " + r.text);
        r = Node.call(c, store, "invites.create", "{\"label\":\"Java 互通\",\"days\":1,\"uses\":2}");
        Matcher m = Pattern.compile("\"id\":\"([a-z2-9]{8})\"").matcher(r.text);
        boolean got = ok(r) && m.find() && r.text.contains("kmnode:1?");
        check(got, "invites.create（中文备注、二维码内容）", r.status + " " + r.text);
        String id = got ? m.group(1) : "xxxxxxxx";
        r = Node.call(c, store, "invites.list", "{}");
        check(ok(r) && r.text.contains("\"" + id + "\"") && r.text.contains("Java 互通"), "invites.list 里有刚生成的", r.text);
        r = Node.call(c, store, "invites.revoke", "{\"id\":\"" + id + "\"}");
        check(ok(r), "invites.revoke", r.text);
        r = Node.call(c, store, "invites.list", "{}");
        check(ok(r) && Pattern.compile("\"id\":\"" + id + "\"[^}]*\"state\":\"revoked\"").matcher(r.text).find(), "作废后状态为 revoked", r.text);
        r = Node.call(c, store, "groups.list", "{}");
        check(ok(r) && r.text.startsWith("{\"ok\":true,\"data\":["), "groups.list", r.text);

        // 计数落后：另一个客户端（时钟快 10 分钟）用过更大的计数，本机计数再从 0 开始
        Mem other = new Mem();
        other.v = System.currentTimeMillis() + 600000;
        r = Node.call(c, other, "status", "{}");
        check(ok(r) && !r.retried, "另一个客户端用更大的计数成功", r.text);
        store.v = 0;
        r = Node.call(c, store, "status", "{}");
        check(ok(r) && r.retried && store.v > other.v, "ctr 重复时自动用更大的 ctr 重试一次成功", r.status + " retried=" + r.retried);

        // 错误的管理密钥：403，不重试
        byte[] k2 = c.key.clone();
        k2[0] ^= 1;
        Node.Code bad = new Node.Code(c.host, c.port, k2);
        r = Node.call(bad, new Mem(), "status", "{}");
        check(r.status == 403 && "{}".equals(r.text) && !r.retried, "错误的管理密钥 → 403 {}", r.status + " " + r.text);

        // 管理码格式校验
        String[] wrong = {"kmnode:1?h=1.2.3.4&p=8787&i=a&s=b", "kmadmin:1?h=1.2.3.4&p=8787", "kmadmin:1?h=1.2.3.4&p=8787&k=abc",
                "kmadmin:1?h=1.2.3.4&p=0&k=" + Node.b64e(new byte[32]), "kmadmin:1?p=8787&k=" + Node.b64e(new byte[32])};
        int rejected = 0;
        for (String w : wrong) {
            try { Node.parse(w); } catch (IllegalArgumentException e) { if (e.getMessage().matches(".*[\\u4e00-\\u9fa5].*")) rejected++; }
        }
        check(rejected == wrong.length, "格式错误的管理码都被拒绝并给出中文提示", rejected + "/" + wrong.length);
        check(Node.parse("kmadmin:1?h=43.142.41.27&p=8787&k=" + Node.b64e(new byte[32])).kid.length() == 8, "正确的管理码能解析", "");

        // 连不上：网络错误状态 0
        r = Node.call(new Node.Code("127.0.0.1", 1, c.key), new Mem(), "status", "{}");
        check(r.status == 0, "连不上时返回状态 0 和原因", r.status + " " + r.text);

        // 健康提醒（#6 第三期）：用真实节点的 status 响应解析，再按规则判断
        r = Node.call(c, store, "status", "{}");
        NodeHealth.Status hs = NodeHealth.parse(r.text);
        check(hs != null && hs.diskTotal > 0 && hs.expiry.length() == 10, "NodeHealth 能解析节点 status", r.text);
        healthTests(hs);

        // 换管理密钥（#6 第三期，节点 1.3.0）：放在最后，换完旧密钥就不能用了
        byte[] nk = Node.newKey();
        r = Node.rotate(c, store, nk);
        Node.Code nc = new Node.Code(c.host, c.port, nk);
        check(Node.ok(r) && r.text.contains("\"kid\":\"" + nc.kid + "\""), "Node.rotate 换管理密钥成功，返回新 kid", r.status + " " + r.text);
        r = Node.call(c, new Mem(), "status", "{}");
        check(r.status == 403 && "{}".equals(r.text), "换钥后旧管理密钥 → 403 {}", r.status + " " + r.text);
        r = Node.call(nc, new Mem(), "status", "{}");
        check(Node.ok(r), "换钥后新管理密钥能用", r.status + " " + r.text);
        // 把新密钥告诉 test_node.py（它接着用新密钥检查日志）
        System.out.println("NEWKEY " + Node.b64e(nk));

        System.out.println(fails == 0 ? "ALL OK" : fails + " FAILED");
        System.exit(fails == 0 ? 0 : 1);
    }

    static class HState implements NodeHealth.State {
        int fails; java.util.Map<String, String> days = new java.util.HashMap<>();
        public int fails() { return fails; }
        public void setFails(int n) { fails = n; }
        public String lastDay(String t) { return days.get(t); }
        public void setLastDay(String t, String d) { days.put(t, d); }
    }

    static String types(java.util.List<NodeHealth.Alert> a) {
        StringBuilder sb = new StringBuilder();
        for (NodeHealth.Alert x : a) sb.append(sb.length() > 0 ? "," : "").append(x.type);
        return sb.toString();
    }

    /** 四种提醒的规则：触发条件、每类每天最多一次、连续两次连不上才提醒。 */
    static void healthTests(NodeHealth.Status real) {
        HState st = new HState();
        String d1 = "2026-11-01", d2 = "2026-11-02";
        check(real != null && NodeHealth.check(real, null, d1, "h", st).isEmpty() == (real.daysLeft > 7 && real.diskFree * 10 >= real.diskTotal),
                "本地节点正常时不提醒", "");
        st = new HState();
        check(NodeHealth.check(null, "超时", d1, "43.142.41.27", st).isEmpty() && st.fails == 1, "连不上第 1 次不提醒", types(NodeHealth.check(null, "x", d1, "h", new HState())));
        java.util.List<NodeHealth.Alert> a = NodeHealth.check(null, "超时（可能 8787 端口没开放，或服务器停了）", d1, "43.142.41.27", st);
        check(types(a).equals("down") && a.get(0).title.equals("同步节点连不上") && a.get(0).text.contains("连续 2 次没连上 43.142.41.27（超时")
                && a.get(0).notifyId() == 101, "连续 2 次连不上 → 提醒", a.isEmpty() ? "" : a.get(0).text);
        check(NodeHealth.check(null, "超时", d1, "h", st).isEmpty(), "同一天第 3 次连不上不再提醒", "");
        check(types(NodeHealth.check(null, "超时", d2, "h", st)).equals("down"), "第二天还连不上 → 再提醒一次", "");
        NodeHealth.Status ok = new NodeHealth.Status();
        ok.diskTotal = 40L << 30; ok.diskFree = 30L << 30; ok.daysLeft = 30; ok.expiry = "2026-12-01"; ok.tlsEnabled = true; ok.certHours = 100.0;
        check(NodeHealth.check(ok, null, d2, "h", st).isEmpty() && st.fails == 0, "连上以后失败计数清零、一切正常不提醒", "");
        check(NodeHealth.check(null, "x", d2, "h", st).isEmpty(), "清零后又只失败 1 次：不提醒", "");

        st = new HState();
        NodeHealth.Status disk = new NodeHealth.Status();
        disk.diskTotal = 40L << 30; disk.diskFree = 2L << 30; disk.daysLeft = 30; disk.expiry = "2026-12-01";
        a = NodeHealth.check(disk, null, d1, "h", st);
        check(types(a).equals("disk") && a.get(0).text.startsWith("只剩 2.0 GB / 40.0 GB（5%）"), "磁盘剩 5% → 提醒", a.isEmpty() ? "" : a.get(0).text);
        check(NodeHealth.check(disk, null, d1, "h", st).isEmpty(), "磁盘提醒同一天只发一次", "");
        disk.diskFree = 4L << 30;
        check(NodeHealth.check(disk, null, d2, "h", st).isEmpty(), "磁盘剩正好 10% 不提醒", "");

        st = new HState();
        NodeHealth.Status exp = new NodeHealth.Status();
        exp.diskTotal = 40L << 30; exp.diskFree = 30L << 30; exp.expiry = "2026-11-16";
        exp.daysLeft = 8;
        check(NodeHealth.check(exp, null, d1, "h", st).isEmpty(), "离到期 8 天不提醒", "");
        exp.daysLeft = 7;
        a = NodeHealth.check(exp, null, d1, "h", st);
        check(types(a).equals("expiry") && a.get(0).text.startsWith("服务器 2026-11-16 到期，还剩 7 天。"), "离到期 7 天 → 提醒", a.isEmpty() ? "" : a.get(0).text);
        exp.daysLeft = -2;
        a = NodeHealth.check(exp, null, d2, "h", st);
        check(types(a).equals("expiry") && a.get(0).text.contains("已过期 2 天"), "已过期 → 第二天再提醒（已过期 N 天）", a.isEmpty() ? "" : a.get(0).text);

        st = new HState();
        NodeHealth.Status cert = new NodeHealth.Status();
        cert.diskTotal = 40L << 30; cert.diskFree = 30L << 30; cert.daysLeft = 30; cert.expiry = "2026-12-01"; cert.tlsEnabled = true;
        cert.certHours = 48.0;
        check(NodeHealth.check(cert, null, d1, "h", st).isEmpty(), "证书剩 48 小时不提醒", "");
        cert.certHours = 30.4;
        a = NodeHealth.check(cert, null, d1, "43.142.41.27", st);
        check(types(a).equals("cert") && a.get(0).text.startsWith("证书还剩 30 小时") && a.get(0).text.contains("https://43.142.41.27"),
                "证书剩 30 小时 → 提醒", a.isEmpty() ? "" : a.get(0).text);
        cert.tlsEnabled = false; cert.certHours = null;
        check(NodeHealth.check(cert, null, d2, "h", st).isEmpty(), "没有网页后台（1.0.0）时不提醒证书", "");

        st = new HState();
        exp.daysLeft = 3; exp.diskFree = 1L << 30; exp.tlsEnabled = true; exp.certHours = 10.0;
        check(types(NodeHealth.check(exp, null, d1, "h", st)).equals("disk,expiry,cert"), "几种情况同时出现：各发一条", "");
        check(NodeHealth.parse("{\"ok\":false}") == null && NodeHealth.parse("乱码") == null, "响应格式不对时 parse 返回 null", "");
    }
}
