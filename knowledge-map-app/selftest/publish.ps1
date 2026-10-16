# 发布真机自检测试包（需求 #5）：build.ps1 -SelfTest 打包 → 推到公开仓库 knowledge-map 的 gate-apk 分支并打 tag gate-v<版本>
# → 校验 jsDelivr 能下载 → 生成下载二维码。只给管理员真机测试用，不进知识图谱 App 的更新通道（不建 Release、不动 apk 分支）
# 用法：$env:KM_SIGNING_DIR='C:\Users\newland\Documents\teach\knowledge-map-app\signing'; powershell -ExecutionPolicy Bypass -File knowledge-map-app\selftest\publish.ps1
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$app = Split-Path $here -Parent
$repo = 'Walker-007-newland/knowledge-map'
$signDir = if ($env:KM_SIGNING_DIR) { $env:KM_SIGNING_DIR } else { "$app\signing" }
$env:KM_SIGNING_DIR = $signDir

& "$app\build.ps1" -SelfTest
$apk = Get-ChildItem "$app\out" -Filter 'selftest-*.apk' | Sort-Object LastWriteTime | Select-Object -Last 1
if (-not $apk) { throw '没有找到 selftest-*.apk' }
$ver = $apk.BaseName.Substring('selftest-'.Length)
$tag = "gate-v$ver"

# tag 前缀和正式版 apk-v*、审批 App admin-v*、同步探测 probe-v* 都不同；再确认一次同名 tag 不存在
$existing = git ls-remote --tags "https://github.com/$repo.git" "refs/tags/$tag"
if ($existing) { throw "tag $tag 已存在" }

$token = [IO.File]::ReadAllText("$signDir\github-token.txt").Trim()
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$token"))
$mirror = "$app\out\gate-branch"
if (Test-Path $mirror) { Remove-Item $mirror -Recurse -Force }
New-Item -ItemType Directory $mirror | Out-Null
Copy-Item $apk.FullName "$mirror\knowledge-map-selftest.apk"
$info = @{ version = $ver; size = $apk.Length; note = '#5 原生接口令牌真机自检包（装上后总入口右下角有「原生接口自检」按钮）' } | ConvertTo-Json
[IO.File]::WriteAllText("$mirror\version.json", $info, (New-Object Text.UTF8Encoding $false))
git -C $mirror init -q -b gate-apk
git -C $mirror add -A
git -C $mirror commit -q -m "原生接口自检包 $ver" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -C $mirror tag $tag
git -C $mirror -c "http.extraheader=Authorization: Basic $basic" push -q --force "https://github.com/$repo.git" gate-apk "refs/tags/$tag"
if ($LASTEXITCODE) { throw '推送 gate-apk 分支失败' }
Remove-Item $mirror -Recurse -Force

# 校验 jsDelivr 带 tag 的地址能下载、大小一致（刚推完可能要等一会儿）
$url = "https://cdn.jsdelivr.net/gh/$repo@$tag/knowledge-map-selftest.apk"
$tmp = "$app\out\jsdelivr-check.apk"
$ok = $false
for ($i = 0; $i -lt 10 -and -not $ok; $i++) {
  if ($i) { Start-Sleep -Seconds 15 }
  & curl.exe -sSL -o $tmp $url
  if ((Test-Path $tmp) -and (Get-Item $tmp).Length -eq $apk.Length) { $ok = $true }
}
if (Test-Path $tmp) { Remove-Item $tmp -Force }
if (-not $ok) { throw "jsDelivr 下载校验失败：$url" }

$qr = "$app\out\selftest-qr.png"
python "$here\qr.py" $url "接口自检包 $ver" $qr
Write-Host "发布完成：$ver"
Write-Host "下载地址：$url"
Write-Host "二维码：$qr"
