package com.fjzk.syncprobe;

import android.content.Context;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;

import org.json.JSONObject;

import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * NSD（mDNS / DNS-SD）广播与发现。服务类型 _kmprobe._tcp（不用正式同步的 _kmsync._tcp，免得以后和正式版互相干扰）。
 * 旧接口 resolveService 一次只能解析一个，所以排队；API 34+ 改用 registerServiceInfoCallback。
 */
final class Discovery {
    static final String TYPE = "_kmprobe._tcp";

    interface Listener { void event(String type, JSONObject data); }

    private final Context ctx;
    private final NsdManager nsd;
    private final Listener out;
    private final String devId, devName;
    private String myServiceName;
    private NsdManager.RegistrationListener regListener;
    private NsdManager.DiscoveryListener discListener;
    private WifiManager.MulticastLock lock;
    private final ArrayDeque<NsdServiceInfo> queue = new ArrayDeque<>();
    private boolean resolving;
    private final Set<String> seen = new HashSet<>();
    private final Executor exec = Executors.newSingleThreadExecutor();
    private long discStart;
    final java.util.List<Object> callbacks = new java.util.ArrayList<>();   // API 34+ 的解析回调，停止时注销

    Discovery(Context ctx, String devId, String devName, Listener out) {
        this.ctx = ctx.getApplicationContext();
        this.nsd = (NsdManager) this.ctx.getSystemService(Context.NSD_SERVICE);
        this.devId = devId;
        this.devName = devName;
        this.out = out;
    }

    private void emit(String type, Object... kv) {
        JSONObject o = new JSONObject();
        try { for (int i = 0; i + 1 < kv.length; i += 2) o.put((String) kv[i], kv[i + 1]); } catch (Exception ignored) { }
        out.event(type, o);
    }

    // ---------- 广播 ----------

    synchronized void register(int port) {
        unregister();
        NsdServiceInfo si = new NsdServiceInfo();
        si.setServiceName("km-probe-" + devId.substring(0, 4));
        si.setServiceType(TYPE);
        si.setPort(port);
        si.setAttribute("id", devId);
        si.setAttribute("n", devName);
        final long t0 = System.currentTimeMillis();
        regListener = new NsdManager.RegistrationListener() {
            @Override public void onServiceRegistered(NsdServiceInfo s) {
                myServiceName = s.getServiceName();
                emit("reg", "ok", true, "name", myServiceName, "ms", System.currentTimeMillis() - t0);
            }
            @Override public void onRegistrationFailed(NsdServiceInfo s, int code) {
                emit("reg", "ok", false, "code", code);
            }
            @Override public void onServiceUnregistered(NsdServiceInfo s) { }
            @Override public void onUnregistrationFailed(NsdServiceInfo s, int code) { }
        };
        try {
            nsd.registerService(si, NsdManager.PROTOCOL_DNS_SD, regListener);
        } catch (Exception e) {
            regListener = null;
            emit("reg", "ok", false, "error", e.toString());
        }
    }

    synchronized void unregister() {
        if (regListener != null) {
            try { nsd.unregisterService(regListener); } catch (Exception ignored) { }
            regListener = null;
        }
    }

    // ---------- 发现 ----------

    synchronized boolean discovering() { return discListener != null; }

    synchronized void start() {
        if (discListener != null) return;
        seen.clear();
        queue.clear();
        resolving = false;
        try {
            WifiManager wm = (WifiManager) ctx.getSystemService(Context.WIFI_SERVICE);
            lock = wm.createMulticastLock("km-probe");
            lock.setReferenceCounted(false);
            lock.acquire();
        } catch (Exception e) {
            emit("disc", "state", "lock-failed", "error", e.toString());
        }
        discStart = System.currentTimeMillis();
        discListener = new NsdManager.DiscoveryListener() {
            @Override public void onStartDiscoveryFailed(String t, int code) {
                emit("disc", "state", "start-failed", "code", code);
                synchronized (Discovery.this) { discListener = null; releaseLock(); }
            }
            @Override public void onStopDiscoveryFailed(String t, int code) { emit("disc", "state", "stop-failed", "code", code); }
            @Override public void onDiscoveryStarted(String t) { emit("disc", "state", "started"); }
            @Override public void onDiscoveryStopped(String t) { emit("disc", "state", "stopped"); }
            @Override public void onServiceFound(NsdServiceInfo s) {
                if (s.getServiceName() != null && s.getServiceName().equals(myServiceName)) return;   // 自己
                emit("found", "service", s.getServiceName(), "ms", System.currentTimeMillis() - discStart);
                enqueue(s);
            }
            @Override public void onServiceLost(NsdServiceInfo s) {
                synchronized (Discovery.this) { seen.remove(s.getServiceName()); }
                emit("lost", "service", s.getServiceName());
            }
        };
        try {
            nsd.discoverServices(TYPE, NsdManager.PROTOCOL_DNS_SD, discListener);
        } catch (Exception e) {
            discListener = null;
            releaseLock();
            emit("disc", "state", "start-failed", "error", e.toString());
        }
    }

    synchronized void stop() {
        if (discListener != null) {
            try { nsd.stopServiceDiscovery(discListener); } catch (Exception ignored) { }
            discListener = null;
        }
        if (Build.VERSION.SDK_INT >= 34) Api34.unwatchAll(this);
        releaseLock();
    }

    private void releaseLock() {
        if (lock != null) { try { lock.release(); } catch (Exception ignored) { } lock = null; }
    }

    private synchronized void enqueue(NsdServiceInfo s) {
        if (!seen.add(s.getServiceName())) return;
        if (Build.VERSION.SDK_INT >= 34) { Api34.watch(this, s); return; }
        queue.add(s);
        next();
    }

    private synchronized void next() {
        if (resolving || queue.isEmpty()) return;
        resolving = true;
        final NsdServiceInfo s = queue.poll();
        final long t0 = System.currentTimeMillis();
        try {
            nsd.resolveService(s, new NsdManager.ResolveListener() {
                @Override public void onResolveFailed(NsdServiceInfo x, int code) {
                    emit("resolve-failed", "service", s.getServiceName(), "code", code);
                    synchronized (Discovery.this) {
                        resolving = false;
                        // 3 = 正在解析别的（FAILURE_ALREADY_ACTIVE），稍后重试一次
                        if (code == 3) { seen.remove(s.getServiceName()); }
                    }
                    next();
                }
                @Override public void onServiceResolved(NsdServiceInfo x) {
                    peer(x, x.getHost(), "resolve", System.currentTimeMillis() - t0);
                    synchronized (Discovery.this) { resolving = false; }
                    next();
                }
            });
        } catch (Exception e) {
            resolving = false;
            emit("resolve-failed", "service", s.getServiceName(), "error", e.toString());
        }
    }

    void peer(NsdServiceInfo x, InetAddress host, String via, long resolveMs) {
        String id = "", name = "";
        try {
            Map<String, byte[]> a = x.getAttributes();
            if (a.get("id") != null) id = new String(a.get("id"), StandardCharsets.UTF_8);
            if (a.get("n") != null) name = new String(a.get("n"), StandardCharsets.UTF_8);
        } catch (Exception ignored) { }
        if (id.equals(devId)) return;
        emit("peer", "service", x.getServiceName(), "host", host == null ? "" : host.getHostAddress(),
                "port", x.getPort(), "id", id, "name", name, "via", via, "resolveMs", resolveMs,
                "ms", System.currentTimeMillis() - discStart);
    }

    /** API 34+ 的解析方式，单独放一个类，旧系统上不会加载。 */
    static final class Api34 {
        static void unwatchAll(Discovery d) {
            for (Object cb : d.callbacks) {
                try { d.nsd.unregisterServiceInfoCallback((NsdManager.ServiceInfoCallback) cb); } catch (Exception ignored) { }
            }
            d.callbacks.clear();
        }

        static void watch(final Discovery d, final NsdServiceInfo s) {
            final long t0 = System.currentTimeMillis();
            try {
                NsdManager.ServiceInfoCallback cb = new NsdManager.ServiceInfoCallback() {
                    boolean first = true;
                    @Override public void onServiceInfoCallbackRegistrationFailed(int code) {
                        d.emit("resolve-failed", "service", s.getServiceName(), "code", code, "api", 34);
                    }
                    @Override public void onServiceUpdated(NsdServiceInfo x) {
                        InetAddress h = null;
                        for (InetAddress a : x.getHostAddresses()) {
                            if (a instanceof java.net.Inet4Address) { h = a; break; }
                            if (h == null) h = a;
                        }
                        d.peer(x, h, first ? "callback" : "callback-update", System.currentTimeMillis() - t0);
                        first = false;
                    }
                    @Override public void onServiceLost() { }
                    @Override public void onServiceInfoCallbackUnregistered() { }
                };
                d.nsd.registerServiceInfoCallback(s, d.exec, cb);
                synchronized (d) { d.callbacks.add(cb); }
            } catch (Exception e) {
                d.emit("resolve-failed", "service", s.getServiceName(), "error", e.toString(), "api", 34);
            }
        }
    }
}
