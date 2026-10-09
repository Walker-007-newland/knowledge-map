# 一键打包“知识图谱”APK（不用 Gradle，直接调 Android SDK 工具）
# 用法：在 knowledge-map-app 目录下运行  powershell -ExecutionPolicy Bypass -File build.ps1
# 产物：out\知识图谱-<版本>.apk
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
$maps = 'math-map', 'chinese-map', 'english-map', 'science-map', 'bio-history-map'
$skipDirs = @('docs', '.claude')
$skipFiles = @('*.md', '*.gz', '*.7z', '*.sh', '*.py', 'test.html', 'check.html', 'coverage.js')
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

# 2. 资源编译 + 链接
& "$bt\aapt2.exe" compile --dir "$here\android\res" -o "$work\res.zip"
if ($LASTEXITCODE) { throw 'aapt2 compile 失败' }
& "$bt\aapt2.exe" link -o "$work\base.apk" -I $androidJar --manifest "$here\android\AndroidManifest.xml" `
  -A "$work\assets" --java "$work\gen" --min-sdk-version 24 --target-sdk-version 34 `
  --version-code $versionCode --version-name $versionName "$work\res.zip"
if ($LASTEXITCODE) { throw 'aapt2 link 失败' }

# 3. 编译 Java -> dex
$srcs = @(Get-ChildItem "$here\android\src", "$work\gen" -Recurse -Filter *.java | ForEach-Object { $_.FullName })
& "$jdkBin\javac.exe" -encoding UTF-8 --release 11 -nowarn -cp $androidJar -d "$work\classes" @srcs
if ($LASTEXITCODE) { throw 'javac 失败' }
$classes = @(Get-ChildItem "$work\classes" -Recurse -Filter *.class | ForEach-Object { $_.FullName })
& "$bt\d8.bat" --release --min-api 24 --lib $androidJar --output "$work\dex" @classes
if ($LASTEXITCODE) { throw 'd8 失败' }

# 4. 把 classes.dex 放进 apk，对齐，签名
Push-Location "$work\dex"
& "$bt\aapt.exe" add "$work\base.apk" classes.dex | Out-Null
Pop-Location
if ($LASTEXITCODE) { throw 'aapt add 失败' }
& "$bt\zipalign.exe" -f -p 4 "$work\base.apk" "$work\aligned.apk"
if ($LASTEXITCODE) { throw 'zipalign 失败' }

# 签名密钥只放本机（已在 .gitignore 里），丢了以后就不能覆盖升级，记得备份
$ks = "$here\signing\release.jks"
$pwFile = "$here\signing\password.txt"
if (-not (Test-Path $ks)) {
  New-Item -ItemType Directory -Force (Split-Path $ks) | Out-Null
  $pw = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
  [IO.File]::WriteAllText($pwFile, $pw)
  & "$jdkBin\keytool.exe" -genkeypair -keystore $ks -storepass $pw -keypass $pw -alias km `
    -keyalg RSA -keysize 2048 -validity 36500 -dname 'CN=Knowledge Map'
  if ($LASTEXITCODE) { throw 'keytool 失败' }
  Write-Host "已生成签名密钥 $ks（请备份 signing 目录）"
}
$pw = [IO.File]::ReadAllText($pwFile).Trim()
$apk = "$out\知识图谱-$versionName.apk"
& "$bt\apksigner.bat" sign --ks $ks --ks-pass "pass:$pw" --ks-key-alias km --out $apk "$work\aligned.apk"
if ($LASTEXITCODE) { throw 'apksigner 失败' }
Copy-Item $apk "$out\knowledge-map.apk" -Force

Remove-Item $work -Recurse -Force
$size = [math]::Round((Get-Item $apk).Length / 1MB, 1)
Write-Host "完成：$apk （$size MB，versionCode $versionCode）"
