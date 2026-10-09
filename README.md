# 知识图谱

福建中考各科知识图谱：数学、语文、英语、物理、化学、生物、历史。纯静态网页，可直接在浏览器打开，也可打包成安卓平板 App。

## 下载安装（平板）

到 [Releases](../../releases/latest) 下载 `knowledge-map.apk`（国内访问慢可用镜像：https://cdn.jsdelivr.net/gh/Walker-007-newland/knowledge-map@apk/knowledge-map.apk ），用平板浏览器打开安装（首次需允许“安装未知来源应用”）。新版本直接覆盖安装，学习进度会保留。装好后 App 会自动提示更新。

## 目录

| 目录 | 内容 |
|---|---|
| `math-map/` | 数学，三年级 → 九年级 |
| `chinese-map/` | 语文，四年级 → 初三 |
| `english-map/` | 英语，四年级 → 初三 |
| `science-map/` | 物理、化学（人教版） |
| `bio-history-map/` | 生物（人教版）、历史（统编版） |
| `knowledge-map-app/` | 安卓外壳、总入口页、打包脚本 |

## 打包 APK

需要 JDK 17+ 和 Android SDK（platforms/android-34 + 任一 build-tools），不需要 Gradle：

```powershell
powershell -ExecutionPolicy Bypass -File knowledge-map-app\build.ps1
```

产物在 `knowledge-map-app/out/`。首次运行会在 `knowledge-map-app/signing/` 生成签名密钥——**务必备份**，换了密钥就无法覆盖升级。
