# #1 设备同步的电脑测试（不用模拟器、不用 Node.js；要 JDK 和 Python 3）
#   powershell -ExecutionPolicy Bypass -File knowledge-map-app\android\test\run-sync-harness.ps1                  本地节点，全部场景（约 20 秒）
#   ... run-sync-harness.ps1 -Remote 43.142.41.27:8787                                                          真实节点：临时测试邀请码，跑完删组、作废邀请码（约 3 分钟）
#   ... run-sync-harness.ps1 -Serve 8790                                                                        浏览器测试页后端，再打开 http://127.0.0.1:8790/hub/tests/sync-harness.html
#   ... run-sync-harness.ps1 -Acct                                                                              只跑 #12 账号场景（本地节点）
#   ... run-sync-harness.ps1 -Gate                                                                              只跑 BridgeGateTest
# 真实节点的管理密钥读主目录 knowledge-map-app\signing\sync-node.json（或 $env:KM_SIGNING_DIR），不打印
param([string]$Remote = '', [int]$Serve = 0, [switch]$Gate, [switch]$Acct)
$ErrorActionPreference = 'Stop'
$test = $PSScriptRoot
$android = Split-Path $test -Parent
$root = Split-Path (Split-Path $android -Parent) -Parent
$out = Join-Path ([IO.Path]::GetTempPath()) ('km-sync-classes-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Force $out | Out-Null
try {
  if ($Gate) {
    & javac -encoding UTF-8 -d $out "$android\src\com\fjzk\knowledgemap\BridgeGate.java" "$test\BridgeGateTest.java"
    if ($LASTEXITCODE) { throw 'javac 失败' }
    & java "-Dstdout.encoding=UTF-8" -cp $out com.fjzk.knowledgemap.BridgeGateTest
    exit $LASTEXITCODE
  }
  # 同步内核里除了 SyncAndroid（要 Android SDK）都是纯 Java
  $srcs = @(Get-ChildItem "$android\src\com\fjzk\knowledgemap\sync" -Filter *.java | Where-Object { $_.Name -ne 'SyncAndroid.java' } | ForEach-Object { $_.FullName })
  $srcs += "$test\SyncHarness.java", "$test\HarnessServer.java"
  & javac -encoding UTF-8 -Xlint:none -d $out @srcs
  if ($LASTEXITCODE) { throw 'javac 失败' }
  $a = @('--root', $root)
  if ($Remote) { $a += '--remote', $Remote }
  if ($Serve) { $a += '--serve', "$Serve" }
  if ($Acct) { $a += '--acct' }
  & java "-Dfile.encoding=UTF-8" "-Dstdout.encoding=UTF-8" -cp $out com.fjzk.knowledgemap.sync.SyncHarness @a
  exit $LASTEXITCODE
} finally {
  Remove-Item $out -Recurse -Force -ErrorAction SilentlyContinue
}
