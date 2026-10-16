# AI 团队上线脚本：测试通过后由测试员运行
# 用法：powershell -ExecutionPolicy Bypass -File team\release.ps1 -Issue 12 -Notes "新增……"
# 流程：在隔离工作区合并最新 main → 打包 → 把本地 main 快进到该分支 → 发布 → 清理工作区
# 打包用工作区里已提交的代码，主目录里你没提交的改动不会被带进正式版
# 退出码：0 成功；2 和 main 有合并冲突；3 主目录 main 无法快进（未提交改动和本次改动撞同一文件，或 main 分叉）；其它为打包/发布失败
param([Parameter(Mandatory)][int]$Issue, [Parameter(Mandatory)][string]$Notes)
$ErrorActionPreference = 'Stop'
$teach = Split-Path $PSScriptRoot -Parent
$wt = Join-Path (Split-Path $teach -Parent) "teach-team-wt\issue-$Issue"
$branch = "team/issue-$Issue"
if (-not (Test-Path $wt)) { throw "找不到工作区 $wt" }
if ($Notes -match '[“”]') { throw 'Notes 里不能用中文弯引号，请用「」' }

# 多个需求单并行开发时，上线必须排队：同一时间只允许一个 release（抢 main、抢版本号）
$lockPath = Join-Path (Split-Path $teach -Parent) 'teach-team-wt\.release-lock'
$lock = $null
$deadline = (Get-Date).AddMinutes(60)
while (-not $lock) {
  try { $lock = [IO.File]::Open($lockPath, 'CreateNew', 'Write', 'None') }
  catch {
    # 锁文件超过 90 分钟视为上次异常退出留下的，清掉重试
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

# 2. 打包（签名密钥用主目录的）
$env:KM_SIGNING_DIR = Join-Path $teach 'knowledge-map-app\signing'
& "$wt\knowledge-map-app\build.ps1"

# 3. 本地 main 快进到本分支（git 会保护主目录里未提交的改动，有冲突就拒绝）
git -C $teach merge --ff-only $branch
if ($LASTEXITCODE) { Write-Host '主目录 main 无法快进'; exit 3 }

# 4. 发布：publish.ps1 推送的是本地 main（工作区和主目录共用同一个 main 引用）
& "$wt\knowledge-map-app\publish.ps1" -Notes $Notes

# 5. 清理
git -C $teach worktree remove $wt --force
git -C $teach branch -d $branch
Write-Host "上线完成：#$Issue"
} finally {
  $lock.Dispose(); Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
}
