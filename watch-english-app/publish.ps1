# 发布「看剧学英文」APK：打包 → 推到公开仓库 knowledge-map 的 watch-apk 分支并打 tag watch-v<版本> → 生成下载二维码
# 已装的 App 打开时会查 watch-v* 标签，发现新版就弹窗更新（见 android\src\...\Updater.java）
# 用法：powershell -ExecutionPolicy Bypass -File watch-english-app\publish.ps1 -Notes "这次更新了什么"
# Notes 里不要用中文弯引号，用「」
param([Parameter(Mandatory)][string]$Notes)
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$teach = Split-Path $here -Parent
$repo = 'Walker-007-newland/knowledge-map'
if ($Notes -match '[“”]') { throw 'Notes 里不能用中文弯引号，请用「」' }

& "$here\build.ps1"
$apk = Get-Item "$here\out\watch-english.apk"
# 版本号从 APK 里读（build.ps1 用打包时间作版本号）
$bt = Get-ChildItem "$(if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" })\build-tools" -Directory | Sort-Object { [version]$_.Name } | Select-Object -Last 1 -ExpandProperty FullName
$ver = ((& "$bt\aapt2.exe" dump badging $apk.FullName | Select-String "versionName='([^']+)'").Matches[0].Groups[1].Value)
if (-not $ver) { throw '读不到版本号' }

$signDir = if ($env:KM_SIGNING_DIR) { $env:KM_SIGNING_DIR } else { "$teach\knowledge-map-app\signing" }
$token = [IO.File]::ReadAllText("$signDir\github-token.txt").Trim()
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$token"))
$mirror = "$here\out\watch-branch"
if (Test-Path $mirror) { Remove-Item $mirror -Recurse -Force }
New-Item -ItemType Directory $mirror | Out-Null
Copy-Item $apk.FullName "$mirror\watch-english.apk"
$info = @{ version = $ver; notes = $Notes; size = $apk.Length } | ConvertTo-Json
[IO.File]::WriteAllText("$mirror\version.json", $info, (New-Object Text.UTF8Encoding $false))
git -C $mirror init -q -b watch-apk
git -C $mirror add -A
git -C $mirror commit -q -m "看剧学英文 APK $ver" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -C $mirror tag "watch-v$ver"
git -C $mirror -c "http.extraheader=Authorization: Basic $basic" push -q --force "https://github.com/$repo.git" watch-apk "refs/tags/watch-v$ver"
if ($LASTEXITCODE) { throw '推送 watch-apk 分支失败' }
Remove-Item $mirror -Recurse -Force
try { Invoke-RestMethod "https://purge.jsdelivr.net/gh/$repo@watch-apk/version.json" -UseBasicParsing | Out-Null } catch { }

# 二维码用带版本号的 tag 地址（分支地址 jsDelivr 会缓存 7 天，可能下到旧版）
$url = "https://cdn.jsdelivr.net/gh/$repo@watch-v$ver/watch-english.apk"
python "$teach\team-admin-app\qr.py" $url $ver "$here\out\watch-english-qr.png" "看剧学英文"
Write-Host "发布完成：$ver"
Write-Host "下载地址：$url"
Write-Host "二维码：$here\out\watch-english-qr.png"
