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
 * 语文背诵（chinese-map/beisong.html）的离线语音识别：sherpa-onnx 流式 zipformer 中文模型（14M，assets/asr/），全程不联网。
 * 第一次用时把模型从 assets 复制到 files/asr/（sherpa-onnx 按文件路径读），再建识别器（之后一直留着）。
 * 录音 16 kHz 单声道，每 100 ms 送一次；识别结果、音量、出错经 Sink 发给页面：
 *   {type:"state", state:"loading"|"listening"|"stopped"}、{type:"text", text, seg}（seg：已断句的部分 + 正在说的）、
 *   {type:"level", v:0~1}、{type:"error", code:"perm"|"model"|"mic", msg}
 * 热词：页面传原文各句（/ 分隔），模型字表里没有的字整句去掉（有一个不认识的字，sherpa-onnx 会把整组热词都丢掉）。
 */
public class Asr {
    static final String TAG = "KMAsr";
    static final int RATE = 16000;
    static final String[] FILES = { "encoder.int8.onnx", "decoder.onnx", "joiner.int8.onnx", "tokens.txt" };
    public static final int REQ_MIC = 7;

    public interface Sink { void event(String json); }

    final Activity act;
    Sink sink;
    OnlineRecognizer rec;
    Set<String> tokens;
    volatile boolean running;
    Thread worker;
    String pendingHotwords;     // 等麦克风权限时先记着

    Asr(Activity a) { act = a; }

    void emit(JSONObject o) { Sink s = sink; if (s != null) s.event(o.toString()); }
    void emit(String type, String k, Object v) {
        try { JSONObject o = new JSONObject(); o.put("type", type); if (k != null) o.put(k, v); emit(o); } catch (Exception ignored) { }
    }
    void error(String code, String msg) {
        try { JSONObject o = new JSONObject(); o.put("type", "error"); o.put("code", code); o.put("msg", msg == null ? "" : msg); emit(o); } catch (Exception ignored) { }
    }

    /** 页面问：App 里有没有带识别模型（打包时没带上就是 false） */
    boolean available() {
        try { for (String f : FILES) { InputStream in = act.getAssets().open("asr/" + f); in.close(); } return true; }
        catch (Exception e) { return false; }
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

    /** 模型复制到 files/asr/、建识别器；只做一次 */
    synchronized boolean ensureModel() {
        if (rec != null) return true;
        emit("state", "state", "loading");
        try {
            File dir = new File(act.getFilesDir(), "asr");
            dir.mkdirs();
            for (String f : FILES) copyAsset("asr/" + f, new File(dir, f));
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

    void copyAsset(String name, File dst) throws Exception {
        long want;
        try (android.content.res.AssetFileDescriptor fd = act.getAssets().openFd(name)) { want = fd.getLength(); }
        catch (Exception e) { want = -1; }     // 压缩存放的 asset 拿不到长度：已有文件就不再复制
        if (dst.isFile() && (want < 0 ? dst.length() > 0 : dst.length() == want)) return;
        File tmp = new File(dst.getPath() + ".tmp");
        try (InputStream in = act.getAssets().open(name); OutputStream out = new FileOutputStream(tmp)) {
            byte[] buf = new byte[1 << 16];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        }
        if (!tmp.renameTo(dst)) throw new Exception("复制模型失败：" + name);
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
