package com.k2fsa.sherpa.onnx;

// 知识图谱 App 改：libsherpa-onnx-jni.so 不在 APK 里（只有 64 位的放 lib/ 会让 32 位平板装不上整个 App；APK 也要小于 20 MB），
// 而是 Asr.java 第一次语音背诵时下载到 App 私有目录后 loadFrom(路径) 加载；没加载过才退回 System.loadLibrary。
// 不用原版的 LibraryUtils（它用 java.nio.file，API 26 才有，App 最低支持 API 24）
public class LibraryLoader {
    private static volatile boolean isLoaded = false;

    public static synchronized void loadFrom(String path) {
        if (!isLoaded) {
            System.load(path);
            isLoaded = true;
        }
    }

    static synchronized void loadLibrary() {
        if (!isLoaded) {
            System.loadLibrary("sherpa-onnx-jni");
            isLoaded = true;
        }
    }

    static void maybeLoad() {
        loadLibrary();
    }
}
