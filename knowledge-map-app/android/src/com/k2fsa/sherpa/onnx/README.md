# sherpa-onnx Java 接口（流式识别部分）

来自 https://github.com/k2-fsa/sherpa-onnx v2.0.1 的 `sherpa-onnx/java-api/src/main/java/com/k2fsa/sherpa/onnx/`，Apache License 2.0（版权归原作者 / Xiaomi Corporation）。
只取了流式识别（Online*）用到的类，供语文背诵（chinese-map/beisong.html）的离线语音识别用。

改动：
- `LibraryLoader.java`：改为直接 `System.loadLibrary("sherpa-onnx-jni")`，去掉 `LibraryUtils.java`（用了 API 26 才有的 java.nio.file）。
- `OnlineRecognizer.java`：加了 `createStream(String hotwords)`。

原生库 libsherpa-onnx-jni.so（static-link-onnxruntime 版）和识别模型不进仓库，由 build.ps1 按固定地址下载、校验 SHA-256 后缓存到 asr-cache/。
