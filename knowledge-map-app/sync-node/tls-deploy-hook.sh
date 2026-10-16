#!/bin/sh
# certbot 签发 / 续期成功后执行（--deploy-hook，root 身份）：把证书复制到 /etc/km-sync/tls/（kmsync 所有、600）。
# km-sync 每 60 秒看一次文件修改时间，读到新证书后新连接就用新证书，不用重启服务。
# 先写 .new 再改名，km-sync 不会读到写了一半的文件；两个文件之间短暂不配对时 km-sync 继续用旧证书，下一次检查再换。
set -eu
L="${RENEWED_LINEAGE:-}"
[ -n "$L" ] && [ -f "$L/fullchain.pem" ] || { echo "km-sync hook：没有 RENEWED_LINEAGE" >&2; exit 1; }
D=/etc/km-sync/tls
install -d -o root -g kmsync -m 750 "$D"
for f in fullchain.pem privkey.pem; do
  install -o kmsync -g kmsync -m 600 "$L/$f" "$D/$f.new"
done
mv -f "$D/privkey.pem.new" "$D/privkey.pem"
mv -f "$D/fullchain.pem.new" "$D/fullchain.pem"
echo "km-sync hook：证书已复制到 $D（来自 $L）"
