package com.fjzk.teamadmin;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;

import java.security.KeyStore;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * 同步节点设置：SharedPreferences「node」里存 host、port、kid、用 Android Keystore 包好的管理密钥、last_ctr。
 * 管理密钥只在这里解开、只交给 Node.call，网页拿不到（Bridge 没有返回密钥的方法）。审批 App 是 allowBackup=false。
 */
final class NodeStore {
    private static final String ALIAS = "km_node_admin";

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("node", Context.MODE_PRIVATE); }

    static boolean configured(Context c) { return !prefs(c).getString("wrapped", "").isEmpty(); }

    /** 校验并保存管理码，返回 kid；格式不对抛出中文说明。 */
    static String save(Context c, String text) throws Exception {
        Node.Code code = Node.parse(text);
        SharedPreferences.Editor e = prefs(c).edit();
        wrap(e, "", code.key);
        e.putString("host", code.host).putInt("port", code.port).putString("kid", code.kid).putLong("last_ctr", 0);
        dropPending(e);
        e.apply();
        return code.kid;
    }

    static void clear(Context c) {
        // 健康提醒的计数和日期（CheckJob）一起清掉；不删 Keystore 里的包装钥（下次扫码复用）
        prefs(c).edit().clear().apply();
    }

    /** 取出设置（含解开的管理密钥），没配置返回 null。 */
    static Node.Code load(Context c) throws Exception {
        SharedPreferences p = prefs(c);
        byte[] k = unwrap(p, "");
        return k == null ? null : new Node.Code(p.getString("host", ""), p.getInt("port", 8787), k);
    }

    // ---------- 换管理密钥（#6 第三期）：新密钥先存成「待确认」，节点确认换上后再转正
    static void savePending(Context c, byte[] key) throws Exception {
        SharedPreferences.Editor e = prefs(c).edit();
        wrap(e, "pending_", key);
        e.commit();
    }

    static Node.Code loadPending(Context c) throws Exception {
        SharedPreferences p = prefs(c);
        byte[] k = unwrap(p, "pending_");
        return k == null ? null : new Node.Code(p.getString("host", ""), p.getInt("port", 8787), k);
    }

    static boolean hasPending(Context c) { return !prefs(c).getString("pending_wrapped", "").isEmpty(); }

    /** 节点已经换上新密钥：新密钥转正，旧的丢掉。 */
    static void commitPending(Context c) throws Exception {
        Node.Code n = loadPending(c);
        if (n == null) return;
        SharedPreferences p = prefs(c);
        SharedPreferences.Editor e = p.edit()
                .putString("wrapped", p.getString("pending_wrapped", "")).putString("iv", p.getString("pending_iv", ""))
                .putString("kid", n.kid).putLong("rotated_at", System.currentTimeMillis());
        dropPending(e);
        e.commit();
    }

    static void clearPending(Context c) {
        SharedPreferences.Editor e = prefs(c).edit();
        dropPending(e);
        e.commit();
    }

    private static void dropPending(SharedPreferences.Editor e) { e.remove("pending_wrapped").remove("pending_iv"); }

    private static void wrap(SharedPreferences.Editor e, String prefix, byte[] key) throws Exception {
        Cipher ci = Cipher.getInstance("AES/GCM/NoPadding");
        ci.init(Cipher.ENCRYPT_MODE, keystoreKey());
        byte[] wrapped = ci.doFinal(key);
        e.putString(prefix + "wrapped", Node.b64e(wrapped)).putString(prefix + "iv", Node.b64e(ci.getIV()));
    }

    private static byte[] unwrap(SharedPreferences p, String prefix) throws Exception {
        String w = p.getString(prefix + "wrapped", "");
        if (w.isEmpty()) return null;
        Cipher ci = Cipher.getInstance("AES/GCM/NoPadding");
        ci.init(Cipher.DECRYPT_MODE, keystoreKey(), new GCMParameterSpec(128, Node.b64d(p.getString(prefix + "iv", ""))));
        return ci.doFinal(Node.b64d(w));
    }

    /**
     * 有「待确认」的新密钥时（上次换钥时网络断了，不知道节点换没换），先确认一下：
     * 新密钥能用 → 转正；新密钥被拒而旧密钥能用 → 节点没换，丢掉新的；都连不上 → 留着下次再确认。
     */
    static void resolvePending(Context c) {
        try {
            Node.Code n = loadPending(c);
            if (n == null) return;
            Node.Result r = Node.call(n, ctr(c), "status", "{}");
            if (Node.ok(r)) { commitPending(c); return; }
            if (r.status == 403) {
                Node.Code old = load(c);
                if (old != null && Node.ok(Node.call(old, ctr(c), "status", "{}"))) clearPending(c);
            }
        } catch (Exception ignored) { }
    }

    /** 健康提醒的状态（CheckJob 用）：连续失败次数、每类上次提醒的日期，存在同一个 prefs 里。 */
    static NodeHealth.State health(Context c) {
        return new NodeHealth.State() {
            public int fails() { return prefs(c).getInt("health_fails", 0); }
            public void setFails(int n) { prefs(c).edit().putInt("health_fails", n).apply(); }
            public String lastDay(String type) { return prefs(c).getString("health_day_" + type, ""); }
            public void setLastDay(String type, String day) { prefs(c).edit().putString("health_day_" + type, day).apply(); }
        };
    }

    static Node.CtrStore ctr(Context c) {
        return new Node.CtrStore() {
            public long last() { return prefs(c).getLong("last_ctr", 0); }
            public void save(long v) { prefs(c).edit().putLong("last_ctr", v).commit(); }
        };
    }

    private static SecretKey keystoreKey() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        if (ks.containsAlias(ALIAS)) return ((KeyStore.SecretKeyEntry) ks.getEntry(ALIAS, null)).getSecretKey();
        KeyGenerator kg = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        kg.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256).build());
        return kg.generateKey();
    }

    private NodeStore() { }
}
