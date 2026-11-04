package com.k2fsa.sherpa.onnx;

// 知识图谱 App 改：libsherpa-onnx-jni.so 不放 APK 的 lib/（只有 64 位的，放进去 32 位平板就装不上整个 App），
// 而是放在 assets 里，由 Asr.java 复制到 App 私有目录后 loadFrom(路径) 加载；没加载过才退回 System.loadLibrary。
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
