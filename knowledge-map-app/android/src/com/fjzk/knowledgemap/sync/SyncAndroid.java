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
 * 同步内核的 Android 适配：Keystore 包钥 + logcat 日志 + 局域网的 NSD 和 Wi-Fi 地址，其余都在纯 Java 的 SyncService 里（电脑上能测）。
 * 构造只建后台线程，不碰 Keystore、不写文件；同步出任何错都只让「设备同步」不可用，不影响打开 App 和学习。
 */
public final class SyncAndroid {
    public static final String TAG = "KMSync";
    static final String ALIAS = "kmsync-wrap";

    public static SyncService create(Context ctx, SyncService.Sink sink) {
        AndroidLan lan = new AndroidLan(ctx);
        SyncService s = new SyncService(new File(ctx.getFilesDir(), "kmsync"), new KeystoreWrap(), System::currentTimeMillis, sink,
            (msg, e) -> Log.w(TAG, msg, e), lan);
        lan.service = s;
        return s;
    }

    private SyncAndroid() { }

    /**
     * 局域网的 Android 部分（#1 第二期）：Wi-Fi 网卡地址（ConnectivityManager，只要 ACCESS_NETWORK_STATE，不要定位权限；
     * 本机开热点时找 wlan / ap 网卡）、NSD 广播与发现（_kmsync._tcp；发现期间持有 MulticastLock，
     * 要 CHANGE_WIFI_MULTICAST_STATE，安装时自动给）。写法同 sync-probe 的 Discovery。
     */
    static final class AndroidLan implements Lan.Env {
        final Context ctx;
        final android.net.nsd.NsdManager nsd;
        volatile SyncService service;
        android.net.nsd.NsdManager.RegistrationListener reg;
        android.net.nsd.NsdManager.DiscoveryListener disc;
        android.net.wifi.WifiManager.MulticastLock lock;
        final java.util.ArrayDeque<android.net.nsd.NsdServiceInfo> queue = new java.util.ArrayDeque<>();
        boolean resolving;
        final java.util.Set<String> seen = new java.util.HashSet<>();
        final java.util.List<Object> callbacks = new java.util.ArrayList<>();
        final java.util.concurrent.Executor exec = java.util.concurrent.Executors.newSingleThreadExecutor();

        AndroidLan(Context c) {
            ctx = c.getApplicationContext();
            nsd = (android.net.nsd.NsdManager) ctx.getSystemService(Context.NSD_SERVICE);
        }

        @SuppressWarnings("deprecation")
        public String address() {
            try {
                android.net.ConnectivityManager cm = (android.net.ConnectivityManager) ctx.getSystemService(Context.CONNECTIVITY_SERVICE);
                for (android.net.Network n : cm.getAllNetworks()) {
                    android.net.NetworkCapabilities c = cm.getNetworkCapabilities(n);
                    if (c == null || !c.hasTransport(android.net.NetworkCapabilities.TRANSPORT_WIFI)) continue;
                    android.net.LinkProperties lp = cm.getLinkProperties(n);
                    if (lp == null) continue;
                    for (android.net.LinkAddress la : lp.getLinkAddresses()) {
                        java.net.InetAddress a = la.getAddress();
                        if (a instanceof java.net.Inet4Address && !a.isLoopbackAddress()) return a.getHostAddress();
                    }
                }
            } catch (Throwable e) { Log.w(TAG, "Wi-Fi 地址", e); }
            try {
                // 本机开着热点（另一台连上来）：热点网卡不算「Wi-Fi 网络」，按网卡名找；手机网络（rmnet 等）不算
                for (java.net.NetworkInterface ni : java.util.Collections.list(java.net.NetworkInterface.getNetworkInterfaces())) {
                    String nm = ni.getName();
                    if (!ni.isUp() || ni.isLoopback() || !(nm.startsWith("wlan") || nm.startsWith("ap") || nm.startsWith("swlan") || nm.startsWith("softap"))) continue;
                    for (java.net.InetAddress a : java.util.Collections.list(ni.getInetAddresses()))
                        if (a instanceof java.net.Inet4Address && a.isSiteLocalAddress()) return a.getHostAddress();
                }
            } catch (Throwable e) { Log.w(TAG, "热点地址", e); }
            return null;
        }

        public synchronized void advertise(String name, int port, java.util.Map<String, String> txt) {
            stopAdvertise();
            try {
                android.net.nsd.NsdServiceInfo si = new android.net.nsd.NsdServiceInfo();
                si.setServiceName(name);
                si.setServiceType(Lan.TYPE);
                si.setPort(port);
                for (java.util.Map.Entry<String, String> e : txt.entrySet()) si.setAttribute(e.getKey(), e.getValue());
                reg = new android.net.nsd.NsdManager.RegistrationListener() {
                    public void onServiceRegistered(android.net.nsd.NsdServiceInfo s) { }
                    public void onRegistrationFailed(android.net.nsd.NsdServiceInfo s, int code) { Log.w(TAG, "NSD 广播失败 " + code); }
                    public void onServiceUnregistered(android.net.nsd.NsdServiceInfo s) { }
                    public void onUnregistrationFailed(android.net.nsd.NsdServiceInfo s, int code) { }
                };
                nsd.registerService(si, android.net.nsd.NsdManager.PROTOCOL_DNS_SD, reg);
            } catch (Throwable e) { reg = null; Log.w(TAG, "NSD 广播", e); }
        }

        public synchronized void stopAdvertise() {
            if (reg == null) return;
            try { nsd.unregisterService(reg); } catch (Throwable ignored) { }
            reg = null;
        }

        public synchronized void discover(boolean on) {
            if (!on) {
                if (disc != null) { try { nsd.stopServiceDiscovery(disc); } catch (Throwable ignored) { } disc = null; }
                if (android.os.Build.VERSION.SDK_INT >= 34) Api34.unwatchAll(this);
                if (lock != null) { try { lock.release(); } catch (Throwable ignored) { } lock = null; }
                queue.clear();
                seen.clear();
                resolving = false;
                return;
            }
            if (disc != null) return;
            try {
                android.net.wifi.WifiManager wm = (android.net.wifi.WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
                lock = wm.createMulticastLock("km-sync");
                lock.setReferenceCounted(false);
                lock.acquire();
            } catch (Throwable e) { Log.w(TAG, "MulticastLock", e); }
            disc = new android.net.nsd.NsdManager.DiscoveryListener() {
                public void onStartDiscoveryFailed(String t, int code) { Log.w(TAG, "NSD 发现失败 " + code); synchronized (AndroidLan.this) { disc = null; } }
                public void onStopDiscoveryFailed(String t, int code) { }
                public void onDiscoveryStarted(String t) { }
                public void onDiscoveryStopped(String t) { }
                public void onServiceFound(android.net.nsd.NsdServiceInfo s) { enqueue(s); }
                public void onServiceLost(android.net.nsd.NsdServiceInfo s) {
                    synchronized (AndroidLan.this) { seen.remove(s.getServiceName()); }
                    SyncService sv = service;
                    if (sv != null) sv.lanLost(s.getServiceName());
                }
            };
            try { nsd.discoverServices(Lan.TYPE, android.net.nsd.NsdManager.PROTOCOL_DNS_SD, disc); }
            catch (Throwable e) { disc = null; Log.w(TAG, "NSD 发现", e); }
        }

        synchronized void enqueue(android.net.nsd.NsdServiceInfo s) {
            if (!seen.add(s.getServiceName())) return;
            if (android.os.Build.VERSION.SDK_INT >= 34) { Api34.watch(this, s); return; }
            queue.add(s);
            next();
        }

        /** 老接口一次只能解析一个：排队 */
        synchronized void next() {
            if (resolving || queue.isEmpty()) return;
            resolving = true;
            final android.net.nsd.NsdServiceInfo s = queue.poll();
            try {
                nsd.resolveService(s, new android.net.nsd.NsdManager.ResolveListener() {
                    public void onResolveFailed(android.net.nsd.NsdServiceInfo x, int code) {
                        synchronized (AndroidLan.this) { resolving = false; if (code == 3) seen.remove(s.getServiceName()); }   // 3 = 正在解析别的，下次再来
                        next();
                    }
                    public void onServiceResolved(android.net.nsd.NsdServiceInfo x) {
                        found(x, x.getHost());
                        synchronized (AndroidLan.this) { resolving = false; }
                        next();
                    }
                });
            } catch (Throwable e) { resolving = false; }
        }

        void found(android.net.nsd.NsdServiceInfo x, java.net.InetAddress host) {
            if (host == null) return;
            java.util.Map<String, String> txt = new java.util.HashMap<>();
            try {
                for (java.util.Map.Entry<String, byte[]> e : x.getAttributes().entrySet())
                    if (e.getValue() != null) txt.put(e.getKey(), new String(e.getValue(), java.nio.charset.StandardCharsets.UTF_8));
            } catch (Throwable ignored) { }
            SyncService sv = service;
            if (sv != null) sv.lanFound(x.getServiceName(), host.getHostAddress(), x.getPort(), txt);
        }

        /** API 34+ 的解析方式，单独放一个类，旧系统上不会加载 */
        static final class Api34 {
            static void unwatchAll(AndroidLan d) {
                for (Object cb : d.callbacks) {
                    try { d.nsd.unregisterServiceInfoCallback((android.net.nsd.NsdManager.ServiceInfoCallback) cb); } catch (Throwable ignored) { }
                }
                d.callbacks.clear();
            }

            static void watch(final AndroidLan d, final android.net.nsd.NsdServiceInfo s) {
                try {
                    android.net.nsd.NsdManager.ServiceInfoCallback cb = new android.net.nsd.NsdManager.ServiceInfoCallback() {
                        public void onServiceInfoCallbackRegistrationFailed(int code) { }
                        public void onServiceUpdated(android.net.nsd.NsdServiceInfo x) {
                            java.net.InetAddress h = null;
                            for (java.net.InetAddress a : x.getHostAddresses()) {
                                if (a instanceof java.net.Inet4Address) { h = a; break; }
                            }
                            d.found(x, h);
                        }
                        public void onServiceLost() { }
                        public void onServiceInfoCallbackUnregistered() { }
                    };
                    d.nsd.registerServiceInfoCallback(s, d.exec, cb);
                    d.callbacks.add(cb);
                } catch (Throwable e) { Log.w(TAG, "NSD 解析", e); }
            }
        }
    }

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
