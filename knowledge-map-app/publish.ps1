# 发布到 GitHub：推送源码 + 新建 Release 并上传 APK
# 先运行 build.ps1 打包；token 放在 signing\github-token.txt（已被 .gitignore 排除）
# 固定下载地址：https://github.com/<用户名>/knowledge-map/releases/latest/download/knowledge-map.apk
# 用法：publish.ps1 [-Notes "这次更新了什么"]，不写就用最近一次提交的标题；平板 App 的更新提示里会显示它
param([string]$Notes)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$here = $PSScriptRoot
$teach = Split-Path $here -Parent
$repoName = 'knowledge-map'

$tokenFile = "$here\signing\github-token.txt"
if (-not (Test-Path $tokenFile)) { throw "找不到 $tokenFile，请把 GitHub token 粘贴进去保存" }
$token = [IO.File]::ReadAllText($tokenFile).Trim()
$h = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json'; 'X-GitHub-Api-Version' = '2022-11-28' }

function Api($method, $url, $body) {
  $p = @{ Method = $method; Uri = $url; Headers = $h; UseBasicParsing = $true }
  if ($body) {
    $p.Body = [Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Depth 5))
    $p.ContentType = 'application/json; charset=utf-8'
  }
  Invoke-RestMethod @p
}

# 1. 账号和仓库（没有就在个人空间新建公开仓库）
$login = (Api GET 'https://api.github.com/user').login
$repo = "$login/$repoName"
try { Api GET "https://api.github.com/repos/$repo" | Out-Null; Write-Host "仓库已存在：$repo" }
catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
  Api POST 'https://api.github.com/user/repos' @{ name = $repoName; description = '福建中考各科知识图谱（数学/语文/英语/物理/化学/生物/历史），含安卓平板 App'; private = $false } | Out-Null
  Write-Host "已新建仓库：$repo"
}

# 2. 推送源码（token 只通过临时请求头传给 git，不写进配置）
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$token"))
$remote = "https://github.com/$repo.git"
if ((git -C $teach remote) -contains 'origin') { git -C $teach remote set-url origin $remote }
else { git -C $teach remote add origin $remote }
git -C $teach -c "http.extraheader=Authorization: Basic $basic" push -u origin main
if ($LASTEXITCODE) { throw 'git push 失败' }

# 3. 新建 Release，上传最新打包的 APK
$apk = Get-ChildItem "$here\out" -Filter '知识图谱-*.apk' | Sort-Object LastWriteTime | Select-Object -Last 1
if (-not $apk) { throw '没有找到 APK，请先运行 build.ps1' }
$ver = $apk.BaseName.Substring('知识图谱-'.Length)
$commit = (git -C $teach rev-parse HEAD).Trim()
if (-not $Notes) { $Notes = (git -C $teach log -1 --format=%s).Trim() }

# 国内镜像：GitHub 的安装包放在 *.githubusercontent.com，国内经常连不上。
# 把 APK 和 version.json 推到单独的 apk 分支并打 tag apk-v<版本>，jsDelivr 就能分发：
#   https://cdn.jsdelivr.net/gh/<仓库>@apk-v<版本>/knowledge-map.apk
# 要在建 Release 之前推，保证 App 查到新版本时镜像已经可用
$mirror = "$here\out\apk-branch"
if (Test-Path $mirror) { Remove-Item $mirror -Recurse -Force }
New-Item -ItemType Directory $mirror | Out-Null
Copy-Item $apk.FullName "$mirror\knowledge-map.apk"
$info = @{ version = $ver; notes = $Notes; size = $apk.Length } | ConvertTo-Json
[IO.File]::WriteAllText("$mirror\version.json", $info, (New-Object Text.UTF8Encoding $false))
git -C $mirror init -q -b apk
git -C $mirror add -A
git -C $mirror commit -q -m "APK $ver" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -C $mirror tag "apk-v$ver"
git -C $mirror -c "http.extraheader=Authorization: Basic $basic" push --force $remote apk "refs/tags/apk-v$ver"
if ($LASTEXITCODE) { throw '推送 apk 镜像分支失败' }
Remove-Item $mirror -Recurse -Force
# 刷新 jsDelivr 上 @apk 分支的缓存（version.json 是 App 检查更新的备用来源；@apk 下的 APK 是给浏览器下载用的固定地址），失败不要紧
foreach ($f in 'version.json', 'knowledge-map.apk') {
  try { Invoke-RestMethod "https://purge.jsdelivr.net/gh/$repo@apk/$f" -UseBasicParsing | Out-Null } catch { }
}

$rel = Api POST "https://api.github.com/repos/$repo/releases" @{
  tag_name = "v$ver"; target_commitish = $commit; name = "知识图谱 $ver"
  body = $Notes
}
$upload = $rel.upload_url -replace '\{.*\}$', ''
Invoke-RestMethod -Method POST -Uri "$upload`?name=knowledge-map.apk" -Headers $h -InFile $apk.FullName `
  -ContentType 'application/vnd.android.package-archive' -UseBasicParsing | Out-Null

Write-Host ""
Write-Host "发布完成：$($rel.html_url)"
Write-Host "固定下载地址：https://github.com/$repo/releases/latest/download/knowledge-map.apk"
# 给人手动下载用带版本号的地址：@apk 分支地址会被浏览器缓存 7 天、国内节点也可能没刷新，容易拿到旧版
Write-Host "国内镜像地址（本版）：https://cdn.jsdelivr.net/gh/$repo@apk-v$ver/knowledge-map.apk"
