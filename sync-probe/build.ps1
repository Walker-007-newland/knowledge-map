# 打包「同步探测」APK（#1 第一期第一步：真机验证局域网明文 Socket HTTP 和 NSD 发现）
# 不用 Gradle，和 team-admin-app\build.ps1 同一套工具链；签名用知识图谱 App 的密钥（包名不同，可同时安装）
# 用法：$env:KM_SIGNING_DIR='C:\Users\newland\Documents\teach\knowledge-map-app\signing'; powershell -ExecutionPolicy Bypass -File sync-probe\build.ps1
# 产物：sync-probe\out\sync-probe.apk
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$teach = Split-Path $here -Parent

$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
$bt = Get-ChildItem "$sdk\build-tools" -Directory | Sort-Object { [version]$_.Name } | Select-Object -Last 1 -ExpandProperty FullName
$androidJar = "$sdk\platforms\android-34\android.jar"
$jdkBin = if ($env:JAVA_HOME) { "$env:JAVA_HOME\bin" } else { Split-Path (Get-Command java).Source }

$signDir = if ($env:KM_SIGNING_DIR) { $env:KM_SIGNING_DIR } else { "$teach\knowledge-map-app\signing" }
if (-not (Test-Path "$signDir\release.jks")) { throw "找不到签名密钥 $signDir\release.jks（工作区里打包要设 KM_SIGNING_DIR 指向主目录的 signing）" }

$now = Get-Date
$versionCode = [int][math]::Floor(($now - [datetime]'2026-01-01').TotalMinutes)
$versionName = $now.ToString('yyyy.MM.dd.HHmm')

$out = "$here\out"
$work = "$out\build"
if (Test-Path $work) { Remove-Item $work -Recurse -Force }
New-Item -ItemType Directory -Force "$work\classes", "$work\dex", "$work\gen" | Out-Null

& "$bt\aapt2.exe" compile --dir "$here\android\res" -o "$work\res.zip"
if ($LASTEXITCODE) { throw 'aapt2 compile 失败' }
& "$bt\aapt2.exe" link -o "$work\base.apk" -I $androidJar --manifest "$here\android\AndroidManifest.xml" `
  --java "$work\gen" --min-sdk-version 24 --target-sdk-version 34 `
  --version-code $versionCode --version-name $versionName "$work\res.zip"
if ($LASTEXITCODE) { throw 'aapt2 link 失败' }

$srcs = @(Get-ChildItem "$here\android\src", "$work\gen" -Recurse -Filter *.java | ForEach-Object { $_.FullName })
& "$jdkBin\javac.exe" -encoding UTF-8 --release 11 -nowarn -cp $androidJar -d "$work\classes" @srcs
if ($LASTEXITCODE) { throw 'javac 失败' }
$classes = @(Get-ChildItem "$work\classes" -Recurse -Filter *.class | ForEach-Object { $_.FullName })
& "$bt\d8.bat" --release --min-api 24 --lib $androidJar --output "$work\dex" @classes
if ($LASTEXITCODE) { throw 'd8 失败' }

# 用 .NET 写入 dex 和网页（aapt 在 Windows 上会把路径写成反斜杠）
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::Open("$work\base.apk", 'Update')
try {
  [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "$work\dex\classes.dex", 'classes.dex', 'Optimal')
  Get-ChildItem "$here\www" -Recurse -File | ForEach-Object {
    $name = 'assets/www/' + $_.FullName.Substring("$here\www".Length + 1).Replace('\', '/')
    [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $name, 'Optimal')
  }
} finally { $zip.Dispose() }
& "$bt\zipalign.exe" -f -p 4 "$work\base.apk" "$work\aligned.apk"
if ($LASTEXITCODE) { throw 'zipalign 失败' }

$pw = [IO.File]::ReadAllText("$signDir\password.txt").Trim()
$apk = "$out\sync-probe.apk"
& "$bt\apksigner.bat" sign --ks "$signDir\release.jks" --ks-pass "pass:$pw" --ks-key-alias km --out $apk "$work\aligned.apk"
if ($LASTEXITCODE) { throw 'apksigner 失败' }

# ---------- 自检 ----------
$zip = [IO.Compression.ZipFile]::OpenRead($apk)
try {
  $names = @($zip.Entries | ForEach-Object { $_.FullName })
  if (@($names | Where-Object { $_.Contains('\') }).Count) { throw 'APK 里有反斜杠路径' }
  foreach ($must in 'assets/www/index.html', 'classes.dex', 'resources.arsc', 'AndroidManifest.xml') { if ($names -notcontains $must) { throw "APK 里缺少 $must" } }
} finally { $zip.Dispose() }
$badging = (& "$bt\aapt2.exe" dump badging $apk) -join "`n"
if ($badging -notmatch "package: name='com.fjzk.syncprobe'") { throw '包名不是 com.fjzk.syncprobe' }
foreach ($perm in 'android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE', 'android.permission.CHANGE_WIFI_MULTICAST_STATE') {
  if ($badging -notmatch [regex]::Escape("uses-permission: name='$perm'")) { throw "缺少权限 $perm" }
}
if ($badging -notmatch "targetSdkVersion:'34'") { throw 'targetSdk 应为 34（要测默认禁止明文的情况）' }
if ($badging -notmatch "sdkVersion:'24'") { throw 'minSdk 应为 24' }
& "$bt\apksigner.bat" verify $apk
if ($LASTEXITCODE) { throw 'apksigner verify 失败' }
$dexText = [Text.Encoding]::ASCII.GetString([IO.File]::ReadAllBytes("$work\dex\classes.dex"))
foreach ($cls in 'Lcom/fjzk/syncprobe/MainActivity;', 'Lcom/fjzk/syncprobe/MiniHttp;', 'Lcom/fjzk/syncprobe/Discovery;', 'Lcom/fjzk/syncprobe/Discovery$Api34;') {
  if (-not $dexText.Contains($cls)) { throw "dex 里缺少 $cls" }
}
Remove-Item $work -Recurse -Force
Write-Host "完成：$apk （版本 $versionName）"
