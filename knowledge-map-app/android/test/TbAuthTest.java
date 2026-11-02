package com.fjzk.knowledgemap;

/**
 * 电子教材 X-ND-AUTH 签名的电脑端测试（不依赖 Android，build.ps1 不打包）。期望值用社区开源下载器
 * tchMaterial-parser 的 auth.py（对照官网 UC SDK 写的）在同样输入下算出；凭据都是假的。在 knowledge-map-app 目录下：
 *   javac -encoding UTF-8 -d android/test/out android/src/com/fjzk/knowledgemap/TbAuth.java android/test/TbAuthTest.java
 *   java -cp android/test/out com.fjzk.knowledgemap.TbAuthTest
 */
public class TbAuthTest {
    static int pass, fail;

    static void ok(boolean c, String msg) {
        if (c) { pass++; System.out.println("  ok   " + msg); }
        else { fail++; System.out.println("  FAIL " + msg); }
    }

    public static void main(String[] args) {
        String n = "1730000000227:ABCDEFGH";
        String u = "https://r1-ndr-private.ykt.cbern.com.cn/edu_product/esp/assets/bdc00134-465d-454b-a541-dcd0cec4d86e.pkg/"
            + "9787107382369_义务教育教科书•道德与法治_一年级_上册_人民教育出版社三科办_1787020693303.pdf";
        String t = TbAuth.signText(u, "GET", n);
        ok(t.equals(n + "\nGET\n/edu_product/esp/assets/bdc00134-465d-454b-a541-dcd0cec4d86e.pkg/"
            + "9787107382369_义务教育教科书•道德与法治_一年级_上册_人民教育出版社三科办_1787020693303.pdf\nr1-ndr-private.ykt.cbern.com.cn\n"),
            "中文文件名：签名原文用解码后的 path、末尾换行");
        ok(TbAuth.mac(t, "test-mac-key").equals("Ng1eka5bPTvjp8oc3A5WVjojQceUB3PzsHn7NIoaKEg="), "HMAC-SHA256 + Base64 与参考实现一致");

        String u2 = "https://r2-ndr-private.ykt.cbern.com.cn/a/%E4%B8%AD%20b.pdf?x=1&y=%E4";
        String t2 = TbAuth.signText(u2, "get", n);
        ok(t2.equals(n + "\nGET\n/a/中 b.pdf?x=1&y=%E4\nr2-ndr-private.ykt.cbern.com.cn\n"), "已编码 path 解码、query 原样、方法转大写");
        ok(TbAuth.mac(t2, "k").equals("Q0VpN6Haa1mSnerU+1NW26a8NLdpjEQqQdm2/ZhUAfw="), "第二组签名一致");

        String h = TbAuth.header(u, "GET", "tok", "key", 227, 1730000000000L);
        ok(h.matches("MAC id=\"tok\",nonce=\"1730000000227:[1-9A-Z]{8}\",mac=\"[A-Za-z0-9+/]{43}=\""), "请求头格式：nonce 加了 diff、8 位随机、mac 44 位");
        ok(TbAuth.header(u, "GET", "tok", "", 0, 0).equals("MAC id=\"tok\",nonce=\"0\",mac=\"0\""), "没有 mac_key 退回旧占位写法");
        ok(TbAuth.header(u, "GET", null, null, 0, 0).equals("MAC id=\"0\",nonce=\"0\",mac=\"0\""), "未登录 id=0");

        ok(TbAuth.base64(new byte[0]).equals("") && TbAuth.base64("f".getBytes()).equals("Zg==")
            && TbAuth.base64("fo".getBytes()).equals("Zm8=") && TbAuth.base64("foobar".getBytes()).equals("Zm9vYmFy"), "Base64 补位");
        ok(TbAuth.encode("https://h/a 中.pdf").equals("https://h/a%20%E4%B8%AD.pdf"), "地址里的空格、中文编码");
        ok(TbAuth.encode("https://h/a%20b.pdf?x=1").equals("https://h/a%20b.pdf?x=1"), "已编码的不重复编码");

        ok(TbAuth.privateHost("r1-ndr-private.ykt.cbern.com.cn") && TbAuth.privateHost("r3-ndr-private.ykt.cbern.com.cn"), "私有 CDN 地址通过");
        ok(!TbAuth.privateHost("r1-ndr-oversea.ykt.cbern.com.cn"), "海外地址不用");
        ok(!TbAuth.privateHost("r1-ndr-private.ykt.cbern.com.cn.evil.com") && !TbAuth.privateHost("evil.com") && !TbAuth.privateHost(null), "别的域名不签名");

        ok(TbAuth.validId("bdc00134-465d-454b-a541-dcd0cec4d86e"), "UUID 编号通过");
        ok(!TbAuth.validId("../../x") && !TbAuth.validId("bdc00134-465d-454b-a541-dcd0cec4d86e/..") && !TbAuth.validId(null), "非 UUID 编号拒绝");

        System.out.println();
        System.out.println("通过 " + pass + "，失败 " + fail);
        System.exit(fail == 0 ? 0 : 1);
    }
}
