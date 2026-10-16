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
        Cipher ci = Cipher.getInstance("AES/GCM/NoPadding");
        ci.init(Cipher.ENCRYPT_MODE, keystoreKey());
        byte[] wrapped = ci.doFinal(code.key);
        prefs(c).edit()
                .putString("host", code.host).putInt("port", code.port).putString("kid", code.kid)
                .putString("wrapped", Node.b64e(wrapped)).putString("iv", Node.b64e(ci.getIV()))
                .putLong("last_ctr", 0).apply();
        return code.kid;
    }

    static void clear(Context c) { prefs(c).edit().clear().apply(); }

    /** 取出设置（含解开的管理密钥），没配置返回 null。 */
    static Node.Code load(Context c) throws Exception {
        SharedPreferences p = prefs(c);
        String w = p.getString("wrapped", "");
        if (w.isEmpty()) return null;
        Cipher ci = Cipher.getInstance("AES/GCM/NoPadding");
        ci.init(Cipher.DECRYPT_MODE, keystoreKey(), new GCMParameterSpec(128, Node.b64d(p.getString("iv", ""))));
        return new Node.Code(p.getString("host", ""), p.getInt("port", 8787), ci.doFinal(Node.b64d(w)));
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
