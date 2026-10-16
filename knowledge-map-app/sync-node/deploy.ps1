# 部署 km-sync 同步节点到腾讯云服务器（经 SSH，用 ~/.ssh/km_tencent）
# 用法（在工作区或主目录都行）：
#   powershell -ExecutionPolicy Bypass -File knowledge-map-app\sync-node\deploy.ps1                    部署 / 更新（保留数据库、管理密钥、邀请码；上一版存成 .bak）
#   ... deploy.ps1 -Check              只读体检：服务状态、监听端口、进程身份、权限、磁盘、版本，不改任何东西
#   ... deploy.ps1 -Rollback           换回上一版并重启（再部署一次即回到新版）
#   ... deploy.ps1 -NewAdminKey        换管理密钥（手机丢了用；旧的立即失效），重出管理码图片
#   ... deploy.ps1 -ResetAdminAccess   清空 IP 封禁、熔断和 IP 名单，打开外网管理（把自己锁在外面时用；也清空网页登录的失败计数）
#   ... deploy.ps1 -SetupTls           网页后台证书：snap 装 certbot（≥5.4），先 staging 再正式签发 Let's Encrypt IP 证书（约 160 小时，自动续期）
#   ... deploy.ps1 -SetupTls -StagingOnly   只签 staging 证书（拦截实测用，浏览器不信任）
#   ... deploy.ps1 -TlsCheck           只读：证书签发者、有效期、剩余时间、续期定时器、certbot renew --dry-run
#   ... deploy.ps1 -ResetWebLogin      清空网页用户名、密码、二次验证和所有网页会话，网页登录关闭（之后在审批 App 里重新设密码）
# 管理密钥、邀请码图片只写在签名目录：$env:KM_SIGNING_DIR，没设就用主目录的 knowledge-map-app\signing（已 gitignore）
# 只部署 km-sync 一个服务：不改 SSH 配置、不开防火墙；唯一装的软件是 -SetupTls 用的 snap 版 certbot（#6 第二期管理员已同意）
param([switch]$Check, [switch]$Rollback, [switch]$NewAdminKey, [switch]$ResetAdminAccess,
      [switch]$SetupTls, [switch]$StagingOnly, [switch]$TlsCheck, [switch]$ResetWebLogin,
      [string]$Server = '43.142.41.27', [string]$User = 'ubuntu', [string]$Key = "$HOME\.ssh\km_tencent")
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object Text.UTF8Encoding $false
$here = $PSScriptRoot
$target = "$User@$Server"
$sshOpts = @('-i', $Key, '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15')

if ($env:KM_SIGNING_DIR) { $signDir = $env:KM_SIGNING_DIR }
else {
  $common = (git -C $here rev-parse --path-format=absolute --git-common-dir).Trim()
  $signDir = Join-Path (Split-Path $common -Parent) 'knowledge-map-app\signing'
}
$infoPath = Join-Path $signDir 'sync-node.json'

function Remote([string]$cmd) {
  $out = & ssh @sshOpts $target $cmd
  $code = $LASTEXITCODE
  $json = $null
  foreach ($l in @($out)) {
    if ($l -like 'KMJSON *') { $json = $l.Substring(7) | ConvertFrom-Json }
    elseif ($l -like 'KMINFO *') { Write-Host $l.Substring(7) }
    elseif ($l -like 'KMERR *') { Write-Host ('错误：' + $l.Substring(6)) -ForegroundColor Red }
    else { Write-Host $l }
  }
  if ($code) { throw "服务器上执行失败（退出码 $code）：$cmd" }
  return $json
}

# 网页后台的静态文件：sync-node/web 下的外壳 + 审批 App 的节点页（node.js / node.css / 两个二维码库），页面只维护一份
$root = Split-Path (Split-Path $here -Parent) -Parent
$webFiles = [ordered]@{
  'index.html' = "$here\web\index.html"; 'web.js' = "$here\web\web.js"; 'web.css' = "$here\web\web.css"
  'node.js' = "$root\team-admin-app\www\node.js"; 'node.css' = "$root\team-admin-app\www\node.css"
  'vendor\qrcode.js' = "$root\team-admin-app\www\vendor\qrcode.js"; 'vendor\jsQR.js' = "$root\team-admin-app\www\vendor\jsQR.js"
}

function Upload {
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ('km-sync-upload-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
  New-Item -ItemType Directory "$tmp\web\vendor" -Force | Out-Null
  try {
    foreach ($f in 'km_sync_node.py', 'km-sync.service', 'remote.sh', 'tls-deploy-hook.sh') {
      # 统一成 LF，避免 Windows 换行让 bash/systemd 出错
      $text = [IO.File]::ReadAllText((Join-Path $here $f)) -replace "`r`n", "`n"
      [IO.File]::WriteAllText((Join-Path $tmp $f), $text, (New-Object Text.UTF8Encoding $false))
    }
    foreach ($k in $webFiles.Keys) {
      if (-not (Test-Path $webFiles[$k])) { throw "缺网页文件：$($webFiles[$k])" }
      Copy-Item $webFiles[$k] (Join-Path "$tmp\web" $k)
    }
    & ssh @sshOpts $target 'rm -rf /tmp/km-sync-upload && mkdir -p /tmp/km-sync-upload'
    if ($LASTEXITCODE) { throw 'SSH 连不上服务器' }
    & scp -i $Key -o BatchMode=yes -q -r "$tmp\km_sync_node.py" "$tmp\km-sync.service" "$tmp\remote.sh" "$tmp\tls-deploy-hook.sh" "$tmp\web" "${target}:/tmp/km-sync-upload/"
    if ($LASTEXITCODE) { throw '上传失败' }
  } finally { Remove-Item $tmp -Recurse -Force }
}

function Save-Info($info) {
  New-Item -ItemType Directory -Force $signDir | Out-Null
  [IO.File]::WriteAllText($infoPath, ($info | ConvertTo-Json), (New-Object Text.UTF8Encoding $false))
  python (Join-Path $here 'make_codes.py') $signDir
  if ($LASTEXITCODE) { throw '生成二维码图片失败（需要 pip 的 qrcode、pillow）' }
}

function Load-Info {
  if (Test-Path $infoPath) { return [IO.File]::ReadAllText($infoPath) | ConvertFrom-Json }
  return $null
}

function Admin-Info($admin, $old) {
  [ordered]@{
    host = $Server; port = 8787; kid = $admin.kid; key = $admin.key; admin_qr = $admin.admin_qr
    invite_id = if ($old) { $old.invite_id } else { $null }; invite_qr = if ($old) { $old.invite_qr } else { $null }
    updated = (Get-Date).ToString('yyyy-MM-dd HH:mm')
  }
}

if ($Check) {
  Upload
  $out = & ssh @sshOpts $target 'sudo bash /tmp/km-sync-upload/remote.sh check; rm -rf /tmp/km-sync-upload'
  if ($LASTEXITCODE) { throw '体检命令失败' }
  $r = @{}
  foreach ($l in @($out)) { $i = $l.IndexOf('='); if ($i -gt 0) { $r[$l.Substring(0, $i)] = $l.Substring($i + 1) } }
  $ports = @($r['listen'].Split(',') | Where-Object { $_ })
  $items = New-Object System.Collections.ArrayList
  function Item($name, $ok, $val) { [void]$items.Add([pscustomobject]@{ name = $name; ok = [bool]$ok; val = $val }) }
  Item 'km-sync 运行中（active）' ($r['active'] -eq 'active') $r['active']
  Item '开机自启（enabled）' ($r['enabled'] -eq 'enabled') $r['enabled']
  Item '进程身份是 kmsync' ($r['user'] -eq 'kmsync') $r['user']
  Item '对外只监听 22、80、443、8787' (($ports -join ',') -eq '22,80,443,8787') ($ports -join ',')
  Item '80、443 由 kmsync 进程监听' ($r['web_owner'] -eq 'kmsync,') $r['web_owner']
  Item '8788 只在 127.0.0.1' ($r['local_web'] -eq '127.0.0.1:8788,') $r['local_web']
  $hl = 0; $okCert = [int]::TryParse([string]$r['cert_hours_left'], [ref]$hl) -and $hl -gt 48
  Item '网页后台证书剩余 > 48 小时' $okCert ("$($r['cert_hours_left']) 小时")
  Item 'https 200、80 端口跳转 301' (($r['https'] -eq '200') -and ($r['http80'] -eq '301')) ("https $($r['https'])，80 $($r['http80'])")
  Item '/etc/km-sync/config.json 权限 600' ($r['config_mode'] -eq '600') $r['config_mode']
  Item '/var/lib/km-sync 权限 700' ($r['data_mode'] -eq '700') $r['data_mode']
  Item '/v1/hello 有响应' ($r['hello'] -like '*km-sync*') $r['hello']
  $bad = 0
  foreach ($it in $items) {
    if ($it.ok) { Write-Host ("  OK   " + $it.name + "：" + $it.val) } else { Write-Host ("  失败 " + $it.name + "：" + $it.val) -ForegroundColor Red; $bad++ }
  }
  Write-Host ("  磁盘：" + $r['disk'] + "；服务重启次数：" + $r['restarts'])
  if ($bad) { Write-Host "体检有 $bad 项不通过" -ForegroundColor Red; exit 1 }
  Write-Host '体检通过'
  exit 0
}

if ($TlsCheck) {
  Upload
  $out = & ssh @sshOpts $target 'sudo bash /tmp/km-sync-upload/remote.sh tlscheck; s=$?; rm -rf /tmp/km-sync-upload; exit $s'
  if ($LASTEXITCODE) { throw '证书检查命令失败' }
  $r = @{}
  foreach ($l in @($out)) {
    $i = $l.IndexOf('='); if ($i -gt 0) { $r[$l.Substring(0, $i)] = $l.Substring($i + 1) }
    if ($l -like 'dry_log=*') { Write-Host ('  ' + $l) }
  }
  $script:bad = 0
  function T($name, $ok, $val) { if ($ok) { Write-Host ("  OK   " + $name + "：" + $val) } else { Write-Host ("  失败 " + $name + "：" + $val) -ForegroundColor Red; $script:bad++ } }
  T "签发者是 Let's Encrypt" ($r['issuer'] -match "Let's Encrypt") $r['issuer']
  T '证书 SAN 是服务器 IP' ($r['san'] -match [regex]::Escape("IP Address:$Server")) $r['san']
  $vh = 0; [void][int]::TryParse([string]$r['valid_hours'], [ref]$vh)
  T '有效期约 160 小时（shortlived）' (($vh -ge 150) -and ($vh -le 170)) "$vh 小时（$($r['not_before']) → $($r['not_after'])）"
  $hl = 0; [void][int]::TryParse([string]$r['hours_left'], [ref]$hl)
  T '剩余 > 48 小时' ($hl -gt 48) "$hl 小时"
  T '续期定时器 active' ($r['timer'] -eq 'active') $r['timer']
  T '剩 3 天就续期' ($r['renew_before'] -eq '3 days') $r['renew_before']
  T 'certbot renew --dry-run 成功' ($r['dry_run'] -eq 'ok') $r['dry_run']
  T '没有遗留的 staging 证书' ($r['lineages'] -notmatch 'staging') $r['lineages']
  if ($script:bad) { Write-Host "证书检查有 $($script:bad) 项不通过" -ForegroundColor Red; exit 1 }
  Write-Host '证书检查通过'
  exit 0
}

if ($SetupTls) {
  Upload
  Remote ("sudo KM_PUBLIC_HOST=$Server bash /tmp/km-sync-upload/remote.sh setup-tls staging" + $(if ($StagingOnly) { ' force' } else { '' })) | Out-Null
  if ($StagingOnly) {
    & ssh @sshOpts $target 'rm -rf /tmp/km-sync-upload' | Out-Null
    Write-Host 'staging 证书已签发（浏览器不信任，只用来实测）。正式签发：deploy.ps1 -SetupTls'
    exit 0
  }
  Remote "sudo KM_PUBLIC_HOST=$Server bash /tmp/km-sync-upload/remote.sh setup-tls prod; s=`$?; rm -rf /tmp/km-sync-upload; exit `$s" | Out-Null
  Write-Host "正式证书已签发，60 秒内 https://$Server/ 生效。查看：deploy.ps1 -TlsCheck"
  exit 0
}

if ($ResetWebLogin) {
  Upload
  Remote 'sudo bash /tmp/km-sync-upload/remote.sh resetweb; s=$?; rm -rf /tmp/km-sync-upload; exit $s' | Out-Null
  Write-Host '已清空网页用户名、密码、二次验证和所有网页会话，网页登录已关闭。请在审批 App「节点 → 限额与访问 → 网页登录」里重新设密码'
  exit 0
}

if ($Rollback) {
  Upload
  Remote 'sudo bash /tmp/km-sync-upload/remote.sh rollback; s=$?; rm -rf /tmp/km-sync-upload; exit $s' | Out-Null
  exit 0
}

if ($NewAdminKey) {
  Upload
  $r = Remote 'sudo bash /tmp/km-sync-upload/remote.sh newkey; s=$?; rm -rf /tmp/km-sync-upload; exit $s'
  if (-not $r.admin) { throw '服务器没有返回新的管理密钥' }
  Save-Info (Admin-Info $r.admin (Load-Info))
  Write-Host "已换管理密钥（kid $($r.admin.kid)），旧的立即失效。请用审批 App 重新扫：$signDir\sync-node-admin.png"
  exit 0
}

if ($ResetAdminAccess) {
  Upload
  Remote 'sudo bash /tmp/km-sync-upload/remote.sh reset; s=$?; rm -rf /tmp/km-sync-upload; exit $s' | Out-Null
  Write-Host '已清空封禁和 IP 名单，外网管理已打开'
  exit 0
}

# ---------- 部署 / 更新
Upload
$r = Remote "sudo KM_PUBLIC_HOST=$Server bash /tmp/km-sync-upload/remote.sh install; s=`$?; rm -rf /tmp/km-sync-upload; exit `$s"
if (-not $r) { throw '服务器没有返回初始化结果' }
$old = Load-Info
if ($r.admin) {
  $info = Admin-Info $r.admin $old
  Write-Host "第一次部署：已在服务器上生成管理密钥（kid $($r.admin.kid)）"
} elseif ($old -and $old.kid -eq $r.kid) {
  $info = [ordered]@{}; $old.PSObject.Properties | ForEach-Object { $info[$_.Name] = $_.Value }
} else {
  throw "服务器上已有管理密钥（kid $($r.kid)），但本机 $infoPath 里没有或不一致。请运行 deploy.ps1 -NewAdminKey 重新生成"
}
if ($r.invite) {
  $info.invite_id = $r.invite.id; $info.invite_qr = $r.invite.qr
  Write-Host "已生成初始邀请码 $($r.invite.id)（30 天、10 次）"
}
$info.version = $r.version
$info.updated = (Get-Date).ToString('yyyy-MM-dd HH:mm')
Save-Info $info
Write-Host "部署完成：km-sync $($r.version) @ ${Server}:8787；网页后台 https://$Server/（证书：deploy.ps1 -SetupTls）"
Write-Host "管理码图片：$signDir\sync-node-admin.png（审批 App「节点」页扫一次）"
