package com.k2fsa.sherpa.onnx;

// 知识图谱 App 改：安卓上 libsherpa-onnx-jni.so 在 APK 的 lib/<abi>/ 里，直接 System.loadLibrary；
// 不用原版的 LibraryUtils（它用 java.nio.file，API 26 才有，App 最低支持 API 24）
public class LibraryLoader {
    private static volatile boolean isLoaded = false;

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
