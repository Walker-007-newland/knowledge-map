# 一键打包“知识图谱”APK（不用 Gradle，直接调 Android SDK 工具）
# 用法：在 knowledge-map-app 目录下运行  powershell -ExecutionPolicy Bypass -File build.ps1
# 产物：out\知识图谱-<版本>.apk
# -SelfTest：真机自检测试包（需求 #5），多打进 selftest/ 自检页、总入口加一个入口按钮，产物是 out\selftest-<版本>.apk，
#            不覆盖 knowledge-map.apk，也不叫「知识图谱-*.apk」（publish.ps1 只认那个名字，不会把测试包发成正式版）
param([switch]$SelfTest)
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$teach = Split-Path $here -Parent

$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
$bt = Get-ChildItem "$sdk\build-tools" -Directory | Sort-Object { [version]$_.Name } | Select-Object -Last 1 -ExpandProperty FullName
$androidJar = "$sdk\platforms\android-34\android.jar"
$jdkBin = if ($env:JAVA_HOME) { "$env:JAVA_HOME\bin" } else { Split-Path (Get-Command java).Source }

# 版本号用时间：versionCode 每次构建递增，覆盖安装时进度不丢
$now = Get-Date
$versionCode = [int][math]::Floor(($now - [datetime]'2026-01-01').TotalMinutes)
$versionName = $now.ToString('yyyy.MM.dd.HHmm')

$out = "$here\out"
$work = "$out\build"
if (Test-Path $work) { Remove-Item $work -Recurse -Force }
New-Item -ItemType Directory -Force "$work\assets\www", "$work\classes", "$work\dex", "$work\gen" | Out-Null

# 1. 复制网页：各图谱目录 + 总入口，排除开发用文件
$maps = 'math-map', 'chinese-map', 'english-map', 'science-map', 'bio-history-map', 'skills-map'
$skipDirs = @('docs', '.claude')
$skipFiles = @('*.md', '*.tar.gz', '*.7z', '*.sh', '*.py', 'test.html', 'check.html', 'page.html', 'coverage.js')
foreach ($m in $maps) {
  $src = Join-Path $teach $m
  Get-ChildItem $src -Recurse -File | Where-Object {
    $rel = $_.FullName.Substring($src.Length + 1)
    $name = $_.Name
    -not ($skipDirs -contains $rel.Split('\')[0]) -and -not ($skipFiles | Where-Object { $name -like $_ })
  } | ForEach-Object {
    $rel = $_.FullName.Substring($src.Length + 1)
    $dst = Join-Path "$work\assets\www\$m" $rel
    New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null
    Copy-Item $_.FullName $dst
  }
}
$hub = [IO.File]::ReadAllText("$here\hub\index.html", [Text.Encoding]::UTF8).Replace('__VERSION__', $versionName)
[IO.File]::WriteAllText("$work\assets\www\index.html", $hub, (New-Object Text.UTF8Encoding $false))
Copy-Item "$here\hub\km-shim.js" "$work\assets\www\km-shim.js"
Copy-Item "$here\hub\km-data.js" "$work\assets\www\km-data.js"
Copy-Item "$here\hub\data.html" "$work\assets\www\data.html"
Copy-Item "$here\hub\km-study.js" "$work\assets\www\km-study.js"
Copy-Item "$here\hub\km-narrate.js" "$work\assets\www\km-narrate.js"
Copy-Item "$here\hub\km-reward.js" "$work\assets\www\km-reward.js"
# #1 设备同步：km-sync.js（发布分区、安全页面合并）、设备同步页、扫码和生成二维码（jsQR Apache-2.0、qrcode-generator MIT，单文件，file:// 可用）
Copy-Item "$here\hub\km-sync.js" "$work\assets\www\km-sync.js"
Copy-Item "$here\hub\sync.html" "$work\assets\www\sync.html"
New-Item -ItemType Directory -Force "$work\assets\www\vendor" | Out-Null
Copy-Item "$here\hub\vendor\jsQR.js" "$work\assets\www\vendor\jsQR.js"
Copy-Item "$here\hub\vendor\qrcode.js" "$work\assets\www\vendor\qrcode.js"
if ($SelfTest) {
  New-Item -ItemType Directory -Force "$work\assets\www\selftest" | Out-Null
  Copy-Item "$here\selftest\*.html" "$work\assets\www\selftest\"
  $idx = [IO.File]::ReadAllText("$work\assets\www\index.html", [Text.Encoding]::UTF8)
  $btn = '<a href="selftest/bridge.html" style="position:fixed;right:12px;bottom:12px;z-index:99;padding:10px 14px;border-radius:10px;background:#e8893b;color:#fff;font-weight:700;text-decoration:none">原生接口自检（测试包）</a>'
  $idx = ([regex]'</body>').Replace($idx, "$btn`n</body>", 1)
  [IO.File]::WriteAllText("$work\assets\www\index.html", $idx, (New-Object Text.UTF8Encoding $false))
}
# 宠物狗页面（three.js + 狗模型），模型转换脚本不打包
$petSrc = "$here\hub\pet"
Get-ChildItem $petSrc -Recurse -File | Where-Object { $_.Extension -ne '.py' } | ForEach-Object {
  $dst = Join-Path "$work\assets\www\pet" $_.FullName.Substring($petSrc.Length + 1)
  New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null
  Copy-Item $_.FullName $dst
}

# 每个页面：<head> 里最先加载 km-shim.js（下载、朗读补丁）、km-data.js（学习数据中枢：修改记录、设备编号、听写词单互通，「我的数据」页用）、km-study.js（学习计时，重复加载会自动跳过）、km-narrate.js（知识点语音讲解，只在讲解页出现）、pet/pet-core.js + km-reward.js（掌握知识点当场发骨头，并同步桌面小狗）、km-sync.js（#1 设备同步：发布分区、安全页面合并）；去掉 ?v= 缓存参数，避免 file:// 下找不到文件
$utf8 = New-Object Text.UTF8Encoding $false
Get-ChildItem "$work\assets\www" -Recurse -Filter *.html | ForEach-Object {
  $depth = $_.DirectoryName.Substring("$work\assets\www".Length).Split('\', [StringSplitOptions]::RemoveEmptyEntries).Count
  $shim = ('../' * $depth) + 'km-shim.js'
  $html = [IO.File]::ReadAllText($_.FullName, $utf8)
  $html = [regex]::Replace($html, '((?:src|href)="[^"?#]+)\?v=[^"]*"', '$1"')
  $data = ('../' * $depth) + 'km-data.js'
  $study = ('../' * $depth) + 'km-study.js'
  $narrate = ('../' * $depth) + 'km-narrate.js'
  $petCore = ('../' * $depth) + 'pet/pet-core.js'
  $reward = ('../' * $depth) + 'km-reward.js'
  $syncJs = ('../' * $depth) + 'km-sync.js'
  $tag = "<script src=`"$shim`"></script>`n<script src=`"$data`"></script>`n<script src=`"$study`"></script>`n<script src=`"$narrate`"></script>`n<script src=`"$petCore`"></script>`n<script src=`"$reward`"></script>`n<script src=`"$syncJs`"></script>"
  $html = if ($html -match '<head>') { ([regex]'<head>').Replace($html, "<head>`n$tag", 1) } else { "$tag`n$html" }
  if ($html -notmatch [regex]::Escape($shim)) { throw "没能在 $($_.FullName) 注入 km-shim.js" }
  [IO.File]::WriteAllText($_.FullName, $html, $utf8)
}

# 2. 资源编译 + 链接
& "$bt\aapt2.exe" compile --dir "$here\android\res" -o "$work\res.zip"
if ($LASTEXITCODE) { throw 'aapt2 compile 失败' }
& "$bt\aapt2.exe" link -o "$work\base.apk" -I $androidJar --manifest "$here\android\AndroidManifest.xml" `
  --java "$work\gen" --min-sdk-version 24 --target-sdk-version 34 `
  --version-code $versionCode --version-name $versionName "$work\res.zip"
if ($LASTEXITCODE) { throw 'aapt2 link 失败' }

# 3. 编译 Java -> dex
$srcs = @(Get-ChildItem "$here\android\src", "$work\gen" -Recurse -Filter *.java | ForEach-Object { $_.FullName })
& "$jdkBin\javac.exe" -encoding UTF-8 --release 11 -nowarn -cp $androidJar -d "$work\classes" @srcs
if ($LASTEXITCODE) { throw 'javac 失败' }
# 类文件先打成一个 jar 再交给 d8（#1 加了同步内核后类文件多了，逐个传会超出 Windows 命令行长度）
& "$jdkBin\jar.exe" cf "$work\classes.jar" -C "$work\classes" .
if ($LASTEXITCODE) { throw 'jar 失败' }
& "$bt\d8.bat" --release --min-api 24 --lib $androidJar --output "$work\dex" "$work\classes.jar"
if ($LASTEXITCODE) { throw 'd8 失败' }

# 4. 把 classes.dex 和网页放进 apk，对齐，签名
# 不用 aapt2 -A / aapt add：它们在 Windows 上会把路径存成 assets/www\xxx（反斜杠），安卓上找不到文件
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::Open("$work\base.apk", 'Update')
try {
  [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "$work\dex\classes.dex", 'classes.dex', 'Optimal')
  Get-ChildItem "$work\assets" -Recurse -File | ForEach-Object {
    $name = 'assets/' + $_.FullName.Substring("$work\assets".Length + 1).Replace('\', '/')
    [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $name, 'Optimal')
  }
} finally { $zip.Dispose() }
& "$bt\zipalign.exe" -f -p 4 "$work\base.apk" "$work\aligned.apk"
if ($LASTEXITCODE) { throw 'zipalign 失败' }

# 签名密钥只放本机（已在 .gitignore 里），丢了以后就不能覆盖升级，记得备份
# AI 团队在隔离工作区里发布时，用 KM_SIGNING_DIR 指向主目录的 signing，不能另生成一把新密钥
$signDir = if ($env:KM_SIGNING_DIR) { $env:KM_SIGNING_DIR } else { "$here\signing" }
$ks = "$signDir\release.jks"
$pwFile = "$signDir\password.txt"
if (-not (Test-Path $ks)) {
  if ($env:KM_SIGNING_DIR) { throw "KM_SIGNING_DIR 下找不到 release.jks：$ks" }
  New-Item -ItemType Directory -Force (Split-Path $ks) | Out-Null
  $pw = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
  [IO.File]::WriteAllText($pwFile, $pw)
  & "$jdkBin\keytool.exe" -genkeypair -keystore $ks -storepass $pw -keypass $pw -alias km `
    -keyalg RSA -keysize 2048 -validity 36500 -dname 'CN=Knowledge Map'
  if ($LASTEXITCODE) { throw 'keytool 失败' }
  Write-Host "已生成签名密钥 $ks（请备份 signing 目录）"
}
$pw = [IO.File]::ReadAllText($pwFile).Trim()
$apk = if ($SelfTest) { "$out\selftest-$versionName.apk" } else { "$out\知识图谱-$versionName.apk" }
& "$bt\apksigner.bat" sign --ks $ks --ks-pass "pass:$pw" --ks-key-alias km --out $apk "$work\aligned.apk"
if ($LASTEXITCODE) { throw 'apksigner 失败' }
if (-not $SelfTest) { Copy-Item $apk "$out\knowledge-map.apk" -Force }

# 自检：直接查 zip 原始目录里的文件名（Python 等工具读取时会自动纠正斜杠，不能用来查），确认首页在、路径里没有反斜杠
$zip = [IO.Compression.ZipFile]::OpenRead($apk)
try {
  $names = @($zip.Entries | ForEach-Object { $_.FullName })
  $bad = @($names | Where-Object { $_.Contains('\') })
  if ($bad.Count) { throw "APK 里有反斜杠路径：$($bad[0]) 等 $($bad.Count) 个" }
  foreach ($must in 'assets/www/index.html', 'assets/www/km-shim.js', 'assets/www/km-data.js', 'assets/www/data.html', 'assets/www/km-study.js', 'assets/www/km-narrate.js', 'assets/www/km-reward.js', 'assets/www/km-sync.js', 'assets/www/sync.html', 'assets/www/vendor/jsQR.js', 'assets/www/vendor/qrcode.js', 'assets/www/pet/study.html','assets/www/math-map/index.html', 'assets/www/pet/index.html', 'assets/www/pet/models/shiba.js', 'classes.dex', 'resources.arsc') {
    if ($names -notcontains $must) { throw "APK 里缺少 $must" }
  }
  # 自检页只在 -SelfTest 包里（正式包里没有 selftest/，也就不会注入 KMSelfTest）
  $st = @($names | Where-Object { $_.StartsWith('assets/www/selftest/') })
  if ($SelfTest) {
    foreach ($must in 'assets/www/selftest/bridge.html', 'assets/www/selftest/frame.html') { if ($names -notcontains $must) { throw "测试包里缺少 $must" } }
  } elseif ($st.Count) { throw "正式包里不能有 selftest/：$($st[0])" }
  $arsc = $zip.GetEntry('resources.arsc')
  if ($arsc.CompressedLength -ne $arsc.Length) { throw 'resources.arsc 被压缩了，Android 11+ 会拒绝安装' }
} finally { $zip.Dispose() }

Remove-Item $work -Recurse -Force
$size = [math]::Round((Get-Item $apk).Length / 1MB, 1)
Write-Host "完成：$apk （$size MB，versionCode $versionCode）"
