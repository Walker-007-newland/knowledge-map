package com.fjzk.knowledgemap;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.util.Log;

import com.k2fsa.sherpa.onnx.EndpointConfig;
import com.k2fsa.sherpa.onnx.EndpointRule;
import com.k2fsa.sherpa.onnx.FeatureConfig;
import com.k2fsa.sherpa.onnx.OnlineModelConfig;
import com.k2fsa.sherpa.onnx.OnlineRecognizer;
import com.k2fsa.sherpa.onnx.OnlineRecognizerConfig;
import com.k2fsa.sherpa.onnx.OnlineStream;
import com.k2fsa.sherpa.onnx.OnlineTransducerModelConfig;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

/**
 * 语文背诵（chinese-map/beisong.html）的离线语音识别：sherpa-onnx 流式 zipformer 中文模型（14M），识别全程不联网。
 * 原生库只有 arm64-v8a，放在 assets/asr-lib/（放 APK 的 lib/ 的话 32 位平板整个 App 都装不上），
 * 第一次用时复制到 files/asr/lib/ 再 System.load；32 位平板没有语音背诵，页面改用家长核对。
 * 模型不打进 APK（约 24 MB，每次更新都要重下）：第一次语音背诵时从仓库 tag MODEL_TAG（tools/publish-asr-model.ps1 推上去的）
 * 经 jsDelivr 镜像下载到 files/asr/，逐个文件核对 SHA-256；App 更新不会删掉，之后一直离线用。
 * 录音 16 kHz 单声道，每 100 ms 送一次；识别结果、音量、下载进度、出错经 Sink 发给页面：
 *   {type:"state", state:"loading"|"listening"|"stopped"}、{type:"text", text, seg}（seg：已断句的部分 + 正在说的）、
 *   {type:"level", v:0~1}、{type:"dl", got, total}、{type:"dl-done"}、{type:"error", code:"perm"|"model"|"mic"|"dl", msg}
 * 热词：页面传原文各句（/ 分隔），模型字表里没有的字整句去掉（有一个不认识的字，sherpa-onnx 会把整组热词都丢掉）。
 */
public class Asr {
    static final String TAG = "KMAsr";
    static final int RATE = 16000;
    static final String[] FILES = { "encoder.int8.onnx", "decoder.onnx", "joiner.int8.onnx", "tokens.txt" };
    static final long[] SIZES = { 15366685, 7509745, 1795562, 48697 };
    static final String[] SHA256 = {
        "20d4998206e61f7aaf87f354f9cb6aa466d0ef8ae44d568fdee2f7d23672b1e2", "5ee0f03a2768ff1d5c83ef3a493243c7935d316cd41280037b14783a3467cc78",
        "a7cf9d82757bdcf786059454495a9ca95e4bd7347f72473fc08d794475c36169", "8b294db9045d6e5f94647f4c1eec1af4da143a75053c399611444b378ff966ac" };
    static final String MODEL_TAG = "asr-zh14m-v1";
    static final String[] MIRRORS = {
        "https://cdn.jsdelivr.net/gh/" + Updater.REPO + "@" + MODEL_TAG + "/",
        "https://fastly.jsdelivr.net/gh/" + Updater.REPO + "@" + MODEL_TAG + "/",
        "https://github.com/" + Updater.REPO + "/raw/" + MODEL_TAG + "/" };
    public static final int REQ_MIC = 7;

    public interface Sink { void event(String json); }

    final Activity act;
    Sink sink;
    OnlineRecognizer rec;
    Set<String> tokens;
    volatile boolean running;
    Thread worker;
    String pendingHotwords;     // 等麦克风权限时先记着
    volatile boolean downloading;
    volatile long dlGot;
    static final String LIB_ASSET = "asr-lib/arm64-v8a/libsherpa-onnx-jni.so";
    static final long LIB_SIZE = 24177488;
    Boolean canRun;             // 这台设备能不能语音背诵（64 位、App 里带着库）

    Asr(Activity a) { act = a; }

    void emit(JSONObject o) { Sink s = sink; if (s != null) s.event(o.toString()); }
    void emit(String type, String k, Object v) {
        try { JSONObject o = new JSONObject(); o.put("type", type); if (k != null) o.put(k, v); emit(o); } catch (Exception ignored) { }
    }
    void error(String code, String msg) {
        try { JSONObject o = new JSONObject(); o.put("type", "error"); o.put("code", code); o.put("msg", msg == null ? "" : msg); emit(o); } catch (Exception ignored) { }
    }

    /** 页面问：这台设备能不能语音背诵（64 位、App 里带着库） */
    synchronized boolean available() {
        if (canRun == null) {
            boolean ok = false;
            for (String abi : android.os.Build.SUPPORTED_ABIS) if ("arm64-v8a".equals(abi)) ok = true;
            if (ok) { try { act.getAssets().open(LIB_ASSET).close(); } catch (Exception e) { ok = false; } }
            canRun = ok;
        }
        return canRun;
    }

    /** 原生库从 assets 复制到 files/asr/lib/（大小不对才复制），再加载 */
    void loadLib() throws Exception {
        File dir = new File(modelDir(), "lib");
        dir.mkdirs();
        File so = new File(dir, "libsherpa-onnx-jni.so");
        if (!so.isFile() || so.length() != LIB_SIZE) {
            File tmp = new File(so.getPath() + ".tmp");
            try (InputStream in = act.getAssets().open(LIB_ASSET); OutputStream out = new FileOutputStream(tmp)) {
                byte[] buf = new byte[1 << 16];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            }
            if (so.isFile()) so.delete();
            if (!tmp.renameTo(so)) throw new Exception("复制识别程序库失败");
        }
        com.k2fsa.sherpa.onnx.LibraryLoader.loadFrom(so.getPath());
    }

    File modelDir() { return new File(act.getFilesDir(), "asr"); }

    boolean modelReady() {
        for (int i = 0; i < FILES.length; i++) { File f = new File(modelDir(), FILES[i]); if (!f.isFile() || f.length() != SIZES[i]) return false; }
        return true;
    }

    /** 模型状态（JSON）：ready、downloading、got、total（字节） */
    String modelState() {
        long total = 0;
        for (long n : SIZES) total += n;
        try {
            JSONObject o = new JSONObject();
            o.put("ready", modelReady()); o.put("downloading", downloading); o.put("got", dlGot); o.put("total", total);
            return o.toString();
        } catch (Exception e) { return "{}"; }
    }

    /** 下载模型：逐个文件、按镜像顺序试，边下边算 SHA-256，对上了才改名生效 */
    synchronized void download() {
        if (modelReady()) { emit("dl-done", null, null); return; }
        if (downloading) return;
        downloading = true;
        dlGot = 0;
        new Thread(new Runnable() {
            public void run() {
                try {
                    File dir = modelDir();
                    dir.mkdirs();
                    long total = 0;
                    for (long n : SIZES) total += n;
                    for (int i = 0; i < FILES.length; i++) {
                        File dst = new File(dir, FILES[i]);
                        if (dst.isFile() && dst.length() == SIZES[i]) { dlGot += SIZES[i]; continue; }
                        long base = dlGot;
                        Exception last = null;
                        boolean ok = false;
                        for (String m : MIRRORS) {
                            try { fetch(m + FILES[i], dst, SHA256[i], total); ok = true; break; }
                            catch (Exception e) { last = e; dlGot = base; Log.w(TAG, "下载 " + m + FILES[i] + "：" + e); }
                        }
                        if (!ok) throw last != null ? last : new Exception("下载失败");
                    }
                    downloading = false;
                    emit("dl-done", null, null);
                } catch (Exception e) {
                    downloading = false;
                    error("dl", String.valueOf(e.getMessage()));
                }
            }
        }, "km-asr-dl").start();
    }

    void fetch(String url, File dst, String sha, long total) throws Exception {
        java.net.HttpURLConnection c = Updater.open(url);
        File tmp = new File(dst.getPath() + ".tmp");
        try {
            int code = c.getResponseCode();
            if (code != 200) throw new Exception("HTTP " + code);
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            long lastEmit = 0;
            try (InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(tmp)) {
                byte[] buf = new byte[1 << 16];
                int n;
                while ((n = in.read(buf)) > 0) {
                    out.write(buf, 0, n);
                    md.update(buf, 0, n);
                    dlGot += n;
                    long now = System.currentTimeMillis();
                    if (now - lastEmit > 300) {
                        lastEmit = now;
                        JSONObject o = new JSONObject();
                        o.put("type", "dl"); o.put("got", dlGot); o.put("total", total);
                        emit(o);
                    }
                }
            }
            StringBuilder hex = new StringBuilder();
            for (byte b : md.digest()) hex.append(String.format("%02x", b));
            if (!hex.toString().equals(sha)) throw new Exception("文件校验不对");
            if (dst.isFile()) dst.delete();
            if (!tmp.renameTo(dst)) throw new Exception("保存失败");
        } finally {
            c.disconnect();
            if (tmp.isFile()) tmp.delete();
        }
    }

    synchronized void start(String hotwords) {
        if (running) return;
        if (act.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingHotwords = hotwords == null ? "" : hotwords;
            act.requestPermissions(new String[] { Manifest.permission.RECORD_AUDIO }, REQ_MIC);
            return;
        }
        running = true;
        final String hw = hotwords == null ? "" : hotwords;
        worker = new Thread(new Runnable() { public void run() { loop(hw); } }, "km-asr");
        worker.start();
    }

    /** MainActivity.onRequestPermissionsResult 转过来 */
    void onPermission(boolean granted) {
        String hw = pendingHotwords;
        pendingHotwords = null;
        if (hw == null) return;
        if (granted) start(hw);
        else error("perm", "没有麦克风权限");
    }

    void stop() {
        running = false;
        Thread t = worker;
        if (t != null) { try { t.join(1500); } catch (InterruptedException ignored) { } }
        worker = null;
    }

    /** 建识别器（模型要已经下载好）；只做一次 */
    synchronized boolean ensureModel() {
        if (rec != null) return true;
        if (!available()) { error("model", "这台设备不支持语音背诵"); return false; }
        if (!modelReady()) { error("model", "语音模型还没下载"); return false; }
        emit("state", "state", "loading");
        try {
            loadLib();
            File dir = modelDir();
            File hwFile = new File(dir, "hotwords.txt");      // 空的热词文件：开了它，每次建流时带的热词才生效
            if (!hwFile.isFile()) new FileOutputStream(hwFile).close();
            OnlineTransducerModelConfig tr = OnlineTransducerModelConfig.builder()
                .setEncoder(new File(dir, FILES[0]).getPath()).setDecoder(new File(dir, FILES[1]).getPath())
                .setJoiner(new File(dir, FILES[2]).getPath()).build();
            OnlineModelConfig model = OnlineModelConfig.builder().setTransducer(tr)
                .setTokens(new File(dir, FILES[3]).getPath()).setNumThreads(2).setDebug(false).setModelingUnit("cjkchar").build();
            // 断句：说过话后停 1.2 秒、或一直没说话 2.4 秒、或一段超过 20 秒，就把这一段定下来
            EndpointConfig ep = EndpointConfig.builder()
                .setRule1(EndpointRule.builder().setMustContainNonSilence(false).setMinTrailingSilence(2.4f).setMinUtteranceLength(0).build())
                .setRule2(EndpointRule.builder().setMustContainNonSilence(true).setMinTrailingSilence(1.2f).setMinUtteranceLength(0).build())
                .setRule3(EndpointRule.builder().setMustContainNonSilence(false).setMinTrailingSilence(0).setMinUtteranceLength(20).build())
                .build();
            OnlineRecognizerConfig cfg = OnlineRecognizerConfig.builder()
                .setFeatureConfig(FeatureConfig.builder().setSampleRate(RATE).setFeatureDim(80).build())
                .setOnlineModelConfig(model).setEndpointConfig(ep).setEnableEndpoint(true)
                .setDecodingMethod("modified_beam_search").setMaxActivePaths(4)
                .setHotwordsFile(hwFile.getPath()).setHotwordsScore(2.0f).build();
            rec = new OnlineRecognizer(cfg);
            tokens = readTokens(new File(dir, FILES[3]));
            return true;
        } catch (Throwable e) {
            Log.w(TAG, "识别模型", e);
            error("model", String.valueOf(e.getMessage()));
            return false;
        }
    }

    static Set<String> readTokens(File f) throws Exception {
        Set<String> s = new HashSet<>();
        try (BufferedReader r = new BufferedReader(new InputStreamReader(new java.io.FileInputStream(f), StandardCharsets.UTF_8))) {
            String line;
            while ((line = r.readLine()) != null) { int sp = line.lastIndexOf(' '); if (sp > 0) s.add(line.substring(0, sp)); }
        }
        return s;
    }

    /** 原文各句 → sherpa-onnx 热词格式（字之间空格、句之间 /）；有不认识的字的句子去掉 */
    String hotwordsFor(String raw) {
        StringBuilder out = new StringBuilder();
        for (String clause : raw.split("/")) {
            StringBuilder c = new StringBuilder();
            boolean ok = clause.length() > 1;
            for (int i = 0; i < clause.length() && ok; ) {
                int cp = clause.codePointAt(i);
                String ch = new String(Character.toChars(cp));
                i += Character.charCount(cp);
                if (!tokens.contains(ch)) { ok = false; break; }
                if (c.length() > 0) c.append(' ');
                c.append(ch);
            }
            if (!ok || c.length() == 0) continue;
            if (out.length() > 0) out.append('/');
            out.append(c);
        }
        return out.toString();
    }

    void loop(String hotwords) {
        AudioRecord ar = null;
        OnlineStream st = null;
        try {
            if (!ensureModel()) return;
            int min = AudioRecord.getMinBufferSize(RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
            ar = new AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION, RATE, AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT, Math.max(min, RATE / 5 * 2));
            if (ar.getState() != AudioRecord.STATE_INITIALIZED) { error("mic", "麦克风打不开"); return; }
            st = rec.createStream(hotwordsFor(hotwords));
            ar.startRecording();
            emit("state", "state", "listening");
            short[] buf = new short[RATE / 10];
            float[] f = new float[buf.length];
            StringBuilder done = new StringBuilder();       // 已断句的部分
            String last = "";
            long lastLevel = 0;
            while (running) {
                int n = ar.read(buf, 0, buf.length);
                if (n <= 0) continue;
                double sum = 0;
                for (int i = 0; i < n; i++) { f[i] = buf[i] / 32768f; sum += f[i] * f[i]; }
                float[] chunk = n == f.length ? f : java.util.Arrays.copyOf(f, n);
                st.acceptWaveform(chunk, RATE);
                while (rec.isReady(st)) rec.decode(st);
                String cur = rec.getResult(st).getText();
                boolean ep = rec.isEndpoint(st);
                if (ep) {
                    done.append(cur);
                    rec.reset(st);
                    cur = "";
                }
                String all = done + cur;
                if (!all.equals(last) || ep) {
                    last = all;
                    JSONObject o = new JSONObject();
                    o.put("type", "text"); o.put("text", all); o.put("seg", ep);
                    emit(o);
                }
                long now = System.currentTimeMillis();
                if (now - lastLevel > 150) {
                    lastLevel = now;
                    emit("level", "v", Math.min(1.0, Math.sqrt(sum / n) * 8));
                }
            }
        } catch (Throwable e) {
            Log.w(TAG, "识别", e);
            error("mic", String.valueOf(e.getMessage()));
        } finally {
            if (ar != null) { try { ar.stop(); } catch (Throwable ignored) { } ar.release(); }
            if (st != null) st.release();
            running = false;
            emit("state", "state", "stopped");
        }
    }
}
