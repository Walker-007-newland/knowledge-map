package com.fjzk.knowledgemap.sync;

import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Log;

import java.io.File;
import java.security.KeyStore;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * 同步内核的 Android 适配：Keystore 包钥 + logcat 日志，其余都在纯 Java 的 SyncService 里（电脑上能测）。
 * 构造只建后台线程，不碰 Keystore、不写文件；同步出任何错都只让「设备同步」不可用，不影响打开 App 和学习。
 */
public final class SyncAndroid {
    public static final String TAG = "KMSync";
    static final String ALIAS = "kmsync-wrap";

    public static SyncService create(Context ctx, SyncService.Sink sink) {
        return new SyncService(new File(ctx.getFilesDir(), "kmsync"), new KeystoreWrap(), System::currentTimeMillis, sink,
            (msg, e) -> Log.w(TAG, msg, e));
    }

    private SyncAndroid() { }

    /** Android Keystore 里不可导出的 AES-256-GCM 钥匙；第一次 seal（第一次建组 / 加入）时才生成 */
    static final class KeystoreWrap implements SyncStore.KeyWrap {
        SecretKey key() throws Exception {
            KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
            ks.load(null);
            KeyStore.Entry e = ks.getEntry(ALIAS, null);
            if (e instanceof KeyStore.SecretKeyEntry) return ((KeyStore.SecretKeyEntry) e).getSecretKey();
            KeyGenerator g = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
            g.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build());
            return g.generateKey();
        }

        public byte[] seal(byte[] plain) {
            try {
                Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
                c.init(Cipher.ENCRYPT_MODE, key());          // Keystore 自己生成 IV
                return SyncCrypto.cat(c.getIV(), c.doFinal(plain));
            } catch (Exception e) { throw new IllegalStateException("Keystore 加密失败：" + e.getMessage()); }
        }

        /** 只读：钥匙不存在就返回 null，不生成 */
        public byte[] open(byte[] box) {
            if (box == null || box.length < 28) return null;
            try {
                KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
                ks.load(null);
                KeyStore.Entry e = ks.getEntry(ALIAS, null);
                if (!(e instanceof KeyStore.SecretKeyEntry)) return null;
                Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
                c.init(Cipher.DECRYPT_MODE, ((KeyStore.SecretKeyEntry) e).getSecretKey(), new GCMParameterSpec(128, box, 0, 12));
                return c.doFinal(box, 12, box.length - 12);
            } catch (Exception e) { return null; }
        }
    }
}
