# 同步探测包（#1 第一期第一步）

独立的小测试 App，包名 `com.fjzk.syncprobe`，可以和知识图谱 App 同时安装。只验证两件事：

1. **局域网明文 HTTP 能否连通**：自写 Socket HTTP（`MiniHttp.java`，正式同步打算用的方式）和系统 `HttpURLConnection` 各测一次。App 的 targetSdk 是 34，且**故意不加** network_security_config，所以测的就是 Android 9+ 默认禁止明文的情况：预期 Socket 能通、HttpURLConnection 被系统拦截。
2. **NSD（mDNS）能否互相发现**：服务类型 `_kmprobe._tcp`（不用正式版的 `_kmsync._tcp`，免得以后互相干扰），发现期间持有 MulticastLock；API 34+ 用 `registerServiceInfoCallback` 解析，旧系统用 `resolveService` 排队一次一个。

局域网服务优先监听 TCP 47811，被占用时随机端口。接口：`GET /hello`（本机名称、型号、API）、`POST /echo`（返回收到的字节数和 SHA-256，用来测 256KB 大请求）。

## 文件

| 文件 | 作用 |
|---|---|
| `android/src/com/fjzk/syncprobe/MiniHttp.java` | 极简 HTTP/1.1 客户端 + 服务端，纯 Java（第一期正式同步内核可沿用） |
| `android/src/com/fjzk/syncprobe/Discovery.java` | NSD 广播、发现、解析 |
| `android/src/com/fjzk/syncprobe/MainActivity.java` | WebView（file:///android_asset/www，和正式 App 一样）+ 原生桥 `Probe` |
| `www/index.html` | 中文界面；没有原生桥时（电脑浏览器）用模拟数据，只为检查界面 |
| `build.ps1` | 打包（aapt2/javac/d8/apksigner，无 Gradle），末尾自检包名、权限、targetSdk、签名、dex 里的类 |
| `publish.ps1` | 打包 → 推公开仓库 `probe-apk` 分支 + tag `probe-v<版本>` → curl 校验 jsDelivr 能下载、大小一致 → 生成 `out/sync-probe-qr.png` |

## 打包 / 发布

```
$env:KM_SIGNING_DIR='C:\Users\newland\Documents\teach\knowledge-map-app\signing'
powershell -ExecutionPolicy Bypass -File sync-probe\build.ps1     # 只打包
powershell -ExecutionPolicy Bypass -File sync-probe\publish.ps1   # 打包并发布
```

下载地址格式：`https://cdn.jsdelivr.net/gh/Walker-007-newland/knowledge-map@probe-v<版本>/sync-probe.apk`

## 管理员怎么测（两台安卓设备，同一个 Wi-Fi，约 10 分钟）

1. 两台都扫 `out/sync-probe-qr.png` 下载安装「同步探测」，打开。
2. 看「本机」一栏：局域网服务「已开启」、NSD 广播「已广播」，记下「本机地址」。
3. 各点一次「本机自测」，结果里 Socket GET 应该成功。
4. 两台都点「开始发现」，等 30 秒左右，看「自动发现」里有没有出现另一台；出现了就点它的「测试连接」。
5. 不管有没有发现，都在「手动输入地址」里输入**另一台**的本机地址，点「测试连接」。
6. 两台都点「复制结果」，把两段文字贴回需求单 #1 的评论。

测完可以卸载，和知识图谱 App 的数据无关。
