# 把语文背诵用的语音识别模型推到 GitHub 仓库的 tag asr-zh14m-v1（单独的孤立提交，不在 main 历史里），
# App 第一次语音背诵时经 jsDelivr 国内镜像下载（见 android/src/com/fjzk/knowledgemap/Asr.java 的 MODEL_TAG、文件清单和 SHA-256）。
# 只需运行一次；换模型时改 tag 名（-v2…）并同步改 Asr.java。
# 模型：k2-fsa sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23（Apache-2.0），只取 int8 encoder/joiner、fp32 decoder 和 tokens.txt。
# 用法：powershell -ExecutionPolicy Bypass -File tools\publish-asr-model.ps1
$ErrorActionPreference = 'Stop'
$here = Split-Path $PSScriptRoot -Parent
$tag = 'asr-zh14m-v1'
$repo = 'Walker-007-newland/knowledge-map'
$sha = @{ 'sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23-mobile.tar.bz2' = 'd394cab72b17f788b8b09ffc610f5f070e610fecf022eedca2eae9e38be4f20a' }
$url = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23-mobile.tar.bz2'

$work = "$here\out\asr-model"
if (Test-Path $work) { Remove-Item $work -Recurse -Force }
New-Item -ItemType Directory -Force "$work\src", "$work\repo" | Out-Null
& curl.exe -sSfL -o "$work\m.tar.bz2" $url
if ($LASTEXITCODE) { throw "下载失败：$url" }
if ((Get-FileHash "$work\m.tar.bz2" -Algorithm SHA256).Hash.ToLower() -ne $sha.Values[0]) { throw 'SHA-256 不对' }
& python -I -c "import sys, tarfile; tarfile.open(sys.argv[1], 'r:bz2').extractall(sys.argv[2])" "$work\m.tar.bz2" "$work\src"
if ($LASTEXITCODE) { throw '解压失败' }
$m = Get-ChildItem "$work\src" -Directory | Select-Object -First 1 -ExpandProperty FullName
Copy-Item "$m\encoder-epoch-99-avg-1.int8.onnx" "$work\repo\encoder.int8.onnx"
Copy-Item "$m\decoder-epoch-99-avg-1.onnx" "$work\repo\decoder.onnx"
Copy-Item "$m\joiner-epoch-99-avg-1.int8.onnx" "$work\repo\joiner.int8.onnx"
Copy-Item "$m\tokens.txt" "$work\repo\tokens.txt"
$readme = @"
# 语文背诵的离线语音识别模型（$tag）

来源：k2-fsa/sherpa-onnx 的 sherpa-onnx-streaming-zipformer-zh-14M-2023-02-23（Apache License 2.0），
原始地址 $url 。
知识图谱 App 第一次语音背诵时从这里（经 jsDelivr）下载到平板，之后离线使用。
"@
[IO.File]::WriteAllText("$work\repo\README.md", $readme, (New-Object Text.UTF8Encoding $false))
Get-ChildItem "$work\repo" | ForEach-Object { Write-Host ("{0}  {1}  {2}" -f $_.Name, $_.Length, (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower()) }

$token = [IO.File]::ReadAllText("$here\signing\github-token.txt").Trim()
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$token"))
git -C "$work\repo" init -q -b asr-model
git -C "$work\repo" add -A
git -C "$work\repo" commit -q -m "语音识别模型 $tag" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git -C "$work\repo" tag $tag
git -C "$work\repo" -c "http.extraheader=Authorization: Basic $basic" push "https://github.com/$repo.git" "refs/tags/$tag"
if ($LASTEXITCODE) { throw '推送失败' }
Remove-Item $work -Recurse -Force
Write-Host "已推送：https://cdn.jsdelivr.net/gh/$repo@$tag/encoder.int8.onnx"
