# 发布「同步探测」APK：打包 → 推到公开仓库 knowledge-map 的 probe-apk 分支并打 tag probe-v<版本> → 校验 jsDelivr 能下载 → 生成下载二维码
# 只给管理员真机测试用（#1 第一期第一步），不进知识图谱 App 的更新通道
# 用法：$env:KM_SIGNING_DIR='C:\Users\newland\Documents\teach\knowledge-map-app\signing'; powershell -ExecutionPolicy Bypass -File sync-probe\publish.ps1
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$teach = Split-Path $here -Parent
$repo = 'Walker-007-newland/knowledge-map'
$signDir = if ($env:KM_SIGNING_DIR) { $env:KM_SIGNING_DIR } else { "$teach\knowledge-map-app\signing" }

& "$here\build.ps1"
$apk = Get-Item "$here\out\sync-probe.apk"
$bt = Get-ChildItem "$(if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" })\build-tools" -Directory | Sort-Object { [version]$_.Name } | Select-Object -Last 1 -ExpandProperty FullName
$ver = ((& "$bt\aapt2.exe" dump badging $apk.FullName | Select-String "versionName='([^']+)'").Matches[0].Groups[1].Value)
if (-not $ver) { throw '读不到版本号' }
$tag = "probe-v$ver"

# tag 不能和已有的 apk-v* / admin-v* / v* 冲突（前缀不同，这里再确认一次同名 tag 不存在）
$existing = git ls-remote --tags "https://github.com/$repo.git" "refs/tags/$tag"
if ($existing) { throw "tag $tag 已存在" }

$token = [IO.File]::ReadAllText("$signDir\github-token.txt").Trim()
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$token"))
$mirror = "$here\out\probe-branch"
if (Test-Path $mirror) { Remove-Item $mirror -Recurse -Force }
New-Item -ItemType Directory $mirror | Out-Null
Copy-Item $apk.FullName "$mirror\sync-probe.apk"
$info = @{ version = $ver; size = $apk.Length; note = '#1 同步探测包（真机测试局域网明文 HTTP 与 NSD 发现）' } | ConvertTo-Json
[IO.File]::WriteAllText("$mirror\version.json", $info, (New-Object Text.UTF8Encoding $false))
git -C $mirror init -q -b probe-apk
git -C $mirror add -A
git -C $mirror commit -q -m "同步探测 APK $ver" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -C $mirror tag $tag
git -C $mirror -c "http.extraheader=Authorization: Basic $basic" push -q --force "https://github.com/$repo.git" probe-apk "refs/tags/$tag"
if ($LASTEXITCODE) { throw '推送 probe-apk 分支失败' }
Remove-Item $mirror -Recurse -Force

# 校验 jsDelivr 带 tag 的地址能下载、大小一致（刚推完可能要等一会儿）
$url = "https://cdn.jsdelivr.net/gh/$repo@$tag/sync-probe.apk"
$tmp = "$here\out\jsdelivr-check.apk"
$ok = $false
for ($i = 0; $i -lt 10 -and -not $ok; $i++) {
  if ($i) { Start-Sleep -Seconds 15 }
  & curl.exe -sSL -o $tmp $url
  if ((Test-Path $tmp) -and (Get-Item $tmp).Length -eq $apk.Length) { $ok = $true }
}
if (Test-Path $tmp) { Remove-Item $tmp -Force }
if (-not $ok) { throw "jsDelivr 下载校验失败：$url" }

python "$here\qr.py" $url $ver "$here\out\sync-probe-qr.png"
Write-Host "发布完成：$ver"
Write-Host "下载地址：$url"
Write-Host "二维码：$here\out\sync-probe-qr.png"
