package com.fjzk.teamadmin;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 审批 App 节点客户端（Node.java）和 Python 节点的互通测试，不依赖 Android。
 * 一般由 knowledge-map-app/sync-node/test_node.py 自动编译运行；也可以手动：
 *   javac -encoding UTF-8 -d out team-admin-app/android/src/com/fjzk/teamadmin/Node.java team-admin-app/android/test/NodeTest.java
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

        System.out.println(fails == 0 ? "ALL OK" : fails + " FAILED");
        System.exit(fails == 0 ? 0 : 1);
    }
}
