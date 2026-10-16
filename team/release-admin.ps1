# AI 团队上线脚本（审批 App / 同步节点用）：测试通过后由测试员运行。改知识图谱 App 的单用 release.ps1
# 用法：powershell -ExecutionPolicy Bypass -File team\release-admin.ps1 -Issue 6 -Notes "审批 App 新增「节点」页"
#   -SkipNode   只改了审批 App，不部署同步节点
#   -SkipAdmin  只改了同步节点，不发布审批 App
# 流程：工作区合并最新 main → 用工作区代码部署同步节点并体检 → 主目录 main 快进到该分支 → 用工作区的 publish.ps1 发布审批 App → 清理工作区
# 退出码：0 成功；2 和 main 有合并冲突；3 主目录 main 无法快进（未提交改动和本次改动撞同一文件，或 main 分叉）；其它为部署/打包/发布失败
# Notes 里不能用中文弯引号，用「」
param([Parameter(Mandatory)][int]$Issue, [Parameter(Mandatory)][string]$Notes, [switch]$SkipNode, [switch]$SkipAdmin)
$ErrorActionPreference = 'Stop'
# 主目录：从工作区里运行（本脚本第一次上线前只在工作区里有）也能找到
$teach = Split-Path (git -C $PSScriptRoot rev-parse --path-format=absolute --git-common-dir).Trim() -Parent
$wt = Join-Path (Split-Path $teach -Parent) "teach-team-wt\issue-$Issue"
$branch = "team/issue-$Issue"
if (-not (Test-Path $wt)) { throw "找不到工作区 $wt" }
if ($Notes -match '[“”]') { throw 'Notes 里不能用中文弯引号，请用「」' }

# 和 release.ps1 共用一把锁：同一时间只允许一个需求单上线
$lockPath = Join-Path (Split-Path $teach -Parent) 'teach-team-wt\.release-lock'
$lock = $null
$deadline = (Get-Date).AddMinutes(60)
while (-not $lock) {
  try { $lock = [IO.File]::Open($lockPath, 'CreateNew', 'Write', 'None') }
  catch {
    if ((Test-Path $lockPath) -and ((Get-Date) - (Get-Item $lockPath).LastWriteTime).TotalMinutes -gt 90) { Remove-Item $lockPath -Force; continue }
    if ((Get-Date) -gt $deadline) { throw '等了 60 分钟仍有别的需求单在上线，稍后再试' }
    Write-Host '另一个需求单正在上线，排队等待…'; Start-Sleep -Seconds 30
  }
}
try {

# 1. 合并最新 main
git -C $wt merge main --no-edit
if ($LASTEXITCODE) { git -C $wt merge --abort; Write-Host '和 main 有冲突'; exit 2 }
if (git -C $wt status --porcelain) { throw '工作区还有未提交的改动，请先提交' }

# 签名密钥、GitHub token、节点管理密钥都用主目录的 signing
$env:KM_SIGNING_DIR = Join-Path $teach 'knowledge-map-app\signing'

# 2. 部署同步节点（同版本重复部署无副作用），再只读体检
if (-not $SkipNode) {
  & "$wt\knowledge-map-app\sync-node\deploy.ps1"
  & "$wt\knowledge-map-app\sync-node\deploy.ps1" -Check
  if ($LASTEXITCODE) { throw '同步节点体检不通过' }
}

# 3. 本地 main 快进到本分支（git 会保护主目录里未提交的改动，有冲突就拒绝）
git -C $teach merge --ff-only $branch
if ($LASTEXITCODE) { Write-Host '主目录 main 无法快进'; exit 3 }

# 4. 发布审批 App：推到公开仓库 admin-apk 分支 + tag admin-v<版本>，已装的打开时自动更新
if (-not $SkipAdmin) {
  & "$wt\team-admin-app\publish.ps1" -Notes $Notes
}

# 5. 清理
git -C $teach worktree remove $wt --force
git -C $teach branch -d $branch
Write-Host "上线完成：#$Issue"
} finally {
  $lock.Dispose(); Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
}
