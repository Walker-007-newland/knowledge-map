package com.fjzk.knowledgemap.sync;

import android.content.Context;
import android.os.Handler;
import android.os.HandlerThread;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Log;

import java.io.File;
import java.security.KeyStore;
import java.util.Map;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * 同步内核的 Android 适配层：
 *  - KeyWrap = Android Keystore 里不可导出的 AES-256-GCM 钥匙（别名 kmsync-wrap），files/kmsync/ 里只有它包过的密文
 *  - 一个后台线程跑全部网络和文件操作（JS 桥的方法立刻返回，结果经事件回到网页）
 *  - 触发时机（#1 方案 v2 第四节「节点」一行）：回到前台、本机发布后 10 秒、前台每 15 分钟、切后台推一次；加入码轮询
 */
public final class SyncAndroid {
    public interface Sink { void event(String type, String json); }

    static final String ALIAS = "kmsync-wrap";
    static final long AFTER_PUBLISH = 10000, EVERY = 15 * 60 * 1000L, AFTER_PAUSE = 1500;

    final SyncManager m;
    final Handler h;
    volatile boolean foreground;
    final Runnable syncTask = new Runnable() { public void run() { runSync(); } };
    final Runnable periodic = new Runnable() {
        public void run() {
            if (!foreground) return;
            runSync();
            h.postDelayed(this, EVERY);
        }
    };
    final Runnable pollTask = new Runnable() { public void run() { poll(); } };

    public SyncAndroid(Context ctx, final Sink sink) {
        HandlerThread t = new HandlerThread("kmsync");
        t.start();
        h = new Handler(t.getLooper());
        m = new SyncManager(new SyncStore(new File(ctx.getFilesDir(), "kmsync"), new KeystoreWrap()), new SyncManager.Clock() {
            public long now() { return System.currentTimeMillis(); }
        });
        m.setEvents(new SyncManager.Events() {
            public void event(String type, String json) {
                sink.event(type, json);
                if ("join-result".equals(type) && json.contains("\"ok\":true")) syncSoon(300);
            }
        });
    }

    public SyncManager manager() { return m; }

    /** km-device-v1（#2 的设备编号，原生共享存储里那份） */
    public void setDevice(final String id, final String name) {
        h.post(new Runnable() { public void run() { m.setDevice(id, name); } });
    }

    public void onResume() {
        foreground = true;
        h.removeCallbacks(periodic);
        h.postDelayed(periodic, 1500);          // 先让网页发布一次
    }

    public void onPause() {
        foreground = false;
        h.removeCallbacks(periodic);
        syncSoon(AFTER_PAUSE);                  // 切后台推一次（网页在 visibilitychange 里先发布）
    }

    public void syncSoon(long delay) {
        h.removeCallbacks(syncTask);
        h.postDelayed(syncTask, delay);
    }

    void runSync() {
        try { m.syncNow(); } catch (Throwable e) { Log.w("kmsync", "sync failed", e); }
    }

    void poll() {
        long d;
        try { d = m.joinPoll(); } catch (Throwable e) { d = 5000; }
        if (d > 0) h.postDelayed(pollTask, d);
    }

    void startPoll(long delay) {
        h.removeCallbacks(pollTask);
        h.postDelayed(pollTask, delay);
    }

    // ------------------------------------------------------------ 桥接口（MainActivity.Bridge 过了 BridgeGate 之后调这里）

    public String state() { return m.state(); }

    public String take() { return m.take(); }

    public String joinState() { return m.joinState(); }

    public void publish(final String json) {
        h.post(new Runnable() {
            public void run() {
                if (m.publish(json) > 0) syncSoon(AFTER_PUBLISH);
            }
        });
    }

    public void ack(final String json) { h.post(new Runnable() { public void run() { m.ack(json); } }); }

    public void syncNow() { syncSoon(0); }

    interface Op { String run(); }

    void act(final String op, final Op fn, final boolean thenSync) {
        h.post(new Runnable() {
            public void run() {
                String r;
                try { r = fn.run(); } catch (Throwable e) { r = SyncManager.res(false, "出错：" + e.getMessage()); }
                Map<String, Object> o = SyncJson.obj(r);
                o.put("op", op);
                m.emit("action-result", o);
                if (thenSync && SyncJson.b(o, "ok")) syncSoon(0);
            }
        });
    }

    public void nodeJoin(final String text) { act("nodeJoin", new Op() { public String run() { return m.nodeJoin(text); } }, true); }

    public void nodeRemove() { act("nodeRemove", new Op() { public String run() { return m.nodeRemove(); } }, false); }

    public void rename(final String dev, final String name) { act("rename", new Op() { public String run() { return m.rename(dev, name); } }, true); }

    public void remove(final String dev) { act("remove", new Op() { public String run() { return m.remove(dev); } }, true); }

    public void leave() { act("leave", new Op() { public String run() { return m.leave(); } }, false); }

    public void joinOpen() {
        h.post(new Runnable() {
            public void run() {
                Map<String, Object> o = SyncJson.obj(m.joinOpen());
                if (SyncJson.b(o, "ok")) startPoll(3000);
                else { o.put("role", "host"); m.emit("join-result", o); }
            }
        });
    }

    public void joinClose() {
        h.post(new Runnable() { public void run() { h.removeCallbacks(pollTask); m.joinClose(); } });
    }

    public void joinScan(final String text) {
        h.post(new Runnable() {
            public void run() {
                Map<String, Object> o = SyncJson.obj(m.joinScan(text));
                if (SyncJson.b(o, "ok")) startPoll(2000);
                else { o.put("role", "guest"); m.emit("join-result", o); }
            }
        });
    }

    public void joinConfirm(final boolean ok) {
        h.post(new Runnable() {
            public void run() {
                Map<String, Object> o = SyncJson.obj(m.joinConfirm(ok));
                if (!SyncJson.b(o, "ok")) { o.put("role", "host"); m.emit("join-result", o); }
                else if (ok) syncSoon(0);
            }
        });
    }

    // ------------------------------------------------------------ Keystore

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

        public byte[] open(byte[] box) {
            if (box == null || box.length < 28) return null;
            try {
                Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
                c.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, box, 0, 12));
                return c.doFinal(box, 12, box.length - 12);
            } catch (Exception e) { return null; }
        }
    }
}
