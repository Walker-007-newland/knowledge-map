package com.fjzk.knowledgemap.sync;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 同步内核的本机文件（Android 上是 files/kmsync/，已排除系统备份）：
 *   device.json   本设备编号、名字、长期公钥、包起来的私钥
 *   group.json    同步组：公开部分（名单、节点地址）+ sealed（gk、邀请码、旧组钥匙，用 KeyWrap 包起来）
 *   node.json     每个组的签名计数 ctr、since、gen
 *   out/*.json    本机分区（内容用 KeyWrap 包起来，推送时再用组密钥加密）
 *   inbox/*.json  收到的别的设备的分区（同上包起来），每个「来源设备 + 分区」只留 rev 最大的一份
 * 写文件先写 .tmp 再改名，崩溃时不会留下半个文件。密钥只以 KeyWrap 包过的形式落盘（Android：Keystore 里不可导出的 AES 钥）。
 */
public final class SyncStore {
    /** Android：Keystore AES-GCM；电脑测试：单独目录里的测试钥匙 */
    public interface KeyWrap {
        byte[] seal(byte[] plain);
        /** 解不开返回 null（Keystore 钥匙丢了） */
        byte[] open(byte[] sealed);
    }

    public final File dir;
    final KeyWrap kw;

    public SyncStore(File dir, KeyWrap kw) {
        this.dir = dir;
        this.kw = kw;
        new File(dir, "out").mkdirs();
        new File(dir, "inbox").mkdirs();
    }

    // ------------------------------------------------------------ JSON 文件

    public synchronized Map<String, Object> json(String rel) {
        byte[] b = read(new File(dir, rel));
        if (b == null) return null;
        try { return SyncJson.obj(SyncCrypto.str(b)); } catch (RuntimeException e) { return null; }
    }

    public synchronized void putJson(String rel, Map<String, Object> m) {
        write(new File(dir, rel), SyncCrypto.utf8(SyncJson.stringify(m)));
    }

    public synchronized void delete(String rel) {
        new File(dir, rel).delete();
        new File(dir, rel + ".tmp").delete();
    }

    public synchronized List<String> list(String sub) {
        List<String> r = new ArrayList<>();
        File[] fs = new File(dir, sub).listFiles();
        if (fs != null) for (File f : fs) {
            String n = f.getName();
            if (n.endsWith(".json")) r.add(sub + "/" + n);
            else if (n.endsWith(".json.tmp") && !new File(f.getParentFile(), n.substring(0, n.length() - 4)).exists())
                r.add(sub + "/" + n.substring(0, n.length() - 4));
        }
        java.util.Collections.sort(r);
        return r;
    }

    public byte[] seal(byte[] b) { return kw.seal(b); }

    public byte[] open(byte[] b) { return kw.open(b); }

    // ------------------------------------------------------------ 原子读写

    static byte[] read(File f) {
        File use = f.exists() ? f : new File(f.getPath() + ".tmp");
        if (!use.exists()) return null;
        try (FileInputStream in = new FileInputStream(use)) {
            ByteArrayOutputStream o = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
            return o.toByteArray();
        } catch (IOException e) { return null; }
    }

    static void write(File f, byte[] b) {
        File tmp = new File(f.getPath() + ".tmp");
        f.getParentFile().mkdirs();
        try (FileOutputStream o = new FileOutputStream(tmp)) {
            o.write(b);
            o.getFD().sync();
        } catch (IOException e) { throw new IllegalStateException("写不了 " + f.getName() + "：" + e.getMessage()); }
        if (!tmp.renameTo(f)) {
            f.delete();                       // Windows 上目标已存在时改名会失败；读的时候会兜底读 .tmp
            if (!tmp.renameTo(f)) throw new IllegalStateException("改名失败 " + f.getName());
        }
    }

    /** 删掉全部同步文件（退出同步组、被移出）；device.json 保留 */
    public synchronized void wipeGroup() {
        for (String sub : new String[]{"out", "inbox"}) {
            File[] fs = new File(dir, sub).listFiles();
            if (fs != null) for (File f : fs) f.delete();
        }
        delete("group.json");
        delete("node.json");
    }
}
