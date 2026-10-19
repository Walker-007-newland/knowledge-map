# 文员提交文档：只提交 docs/ 下的改动并推送 main
# 用法：powershell -ExecutionPolicy Bypass -File team\docs-commit.ps1 -Message "更新知识图谱更新说明"
# 和 release.ps1 共用排队锁：上线进行中时等待，避免 main 在上线中途前进导致快进失败
param([Parameter(Mandatory)][string]$Message)
$ErrorActionPreference = 'Stop'
$teach = Split-Path $PSScriptRoot -Parent
$lockPath = Join-Path (Split-Path $teach -Parent) 'teach-team-wt\.release-lock'
New-Item -ItemType Directory -Force (Split-Path $lockPath) | Out-Null
$lock = $null
$deadline = (Get-Date).AddMinutes(60)
while (-not $lock) {
  try { $lock = [IO.File]::Open($lockPath, 'CreateNew', 'Write', 'None') }
  catch {
    if ((Test-Path $lockPath) -and ((Get-Date) - (Get-Item $lockPath).LastWriteTime).TotalMinutes -gt 90) { Remove-Item $lockPath -Force; continue }
    if ((Get-Date) -gt $deadline) { throw '等了 60 分钟仍有需求单在上线，稍后再试' }
    Write-Host '有需求单正在上线，排队等待…'; Start-Sleep -Seconds 30
  }
}
try {
  git -C $teach add -- docs
  # 只允许提交 docs/：暂存区里出现别的文件就停下
  $staged = @(git -C $teach diff --cached --name-only)
  $other = @($staged | Where-Object { $_ -notlike 'docs/*' })
  if ($other.Count) { throw "暂存区里有 docs/ 以外的文件，已停止：$($other -join ', ')" }
  if (-not $staged.Count) { Write-Host '文档没有变化'; exit 0 }
  git -C $teach commit -q -m $Message -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
  if ($LASTEXITCODE) { throw 'git commit 失败' }
  $token = [IO.File]::ReadAllText("$teach\knowledge-map-app\signing\github-token.txt").Trim()
  $basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$token"))
  git -C $teach -c "http.extraheader=Authorization: Basic $basic" push -q origin main
  if ($LASTEXITCODE) { throw 'git push 失败（提交已在本地，下次上线时会一起推送）' }
  Write-Host "已提交并推送：$Message"
} finally {
  $lock.Dispose(); Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
}
