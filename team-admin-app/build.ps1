# 打包“团队审批”管理员 APK（不用 Gradle，和 knowledge-map-app\build.ps1 同一套工具链和签名密钥）
# 用法：powershell -ExecutionPolicy Bypass -File team-admin-app\build.ps1
# 产物：team-admin-app\out\team-admin.apk（只给管理员自己装，不发布）
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$teach = Split-Path $here -Parent

$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
$bt = Get-ChildItem "$sdk\build-tools" -Directory | Sort-Object { [version]$_.Name } | Select-Object -Last 1 -ExpandProperty FullName
$androidJar = "$sdk\platforms\android-34\android.jar"
$jdkBin = if ($env:JAVA_HOME) { "$env:JAVA_HOME\bin" } else { Split-Path (Get-Command java).Source }

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

$signDir = "$teach\knowledge-map-app\signing"
$pw = [IO.File]::ReadAllText("$signDir\password.txt").Trim()
$apk = "$out\team-admin.apk"
& "$bt\apksigner.bat" sign --ks "$signDir\release.jks" --ks-pass "pass:$pw" --ks-key-alias km --out $apk "$work\aligned.apk"
if ($LASTEXITCODE) { throw 'apksigner 失败' }

$zip = [IO.Compression.ZipFile]::OpenRead($apk)
try {
  $names = @($zip.Entries | ForEach-Object { $_.FullName })
  if (@($names | Where-Object { $_.Contains('\') }).Count) { throw 'APK 里有反斜杠路径' }
  foreach ($must in 'assets/www/index.html', 'classes.dex', 'resources.arsc') { if ($names -notcontains $must) { throw "APK 里缺少 $must" } }
} finally { $zip.Dispose() }
Remove-Item $work -Recurse -Force
Write-Host "完成：$apk （版本 $versionName）"
