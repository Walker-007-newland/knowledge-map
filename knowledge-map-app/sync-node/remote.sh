#!/bin/bash
# 服务器端安装脚本：deploy.ps1 把它和 km_sync_node.py、km-sync.service 传到 /tmp/km-sync-upload 后，用 sudo 执行
# 用法：sudo bash remote.sh install|rollback|newkey|reset|check
# 只装 km-sync 一个服务：不改 SSH、不开防火墙、不装软件包
set -euo pipefail
U=/tmp/km-sync-upload
APP=/opt/km-sync
DATA=/var/lib/km-sync
ETC=/etc/km-sync
PY=/usr/bin/python3
run_node() { sudo -u kmsync "$PY" "$APP/km_sync_node.py" --config "$ETC/config.json" "$@"; }
wait_hello() {
  for i in $(seq 1 30); do
    if curl -sf --max-time 2 http://127.0.0.1:8787/v1/hello >/dev/null; then return 0; fi
    sleep 0.5
  done
  echo "KMERR 服务没有在 15 秒内响应 /v1/hello"; journalctl -u km-sync -n 30 --no-pager || true; exit 12
}

case "${1:-}" in
install)
  if ! "$PY" -c 'from cryptography.hazmat.primitives.ciphers.aead import AESGCM' 2>/dev/null; then
    echo "KMERR 服务器上导入不了 python3-cryptography（管理接口要用）。不自动安装，请管理员决定是否 apt install python3-cryptography"; exit 10
  fi
  id kmsync >/dev/null 2>&1 || useradd --system --no-create-home --home-dir "$DATA" --shell /usr/sbin/nologin kmsync
  install -d -o kmsync -g kmsync -m 700 "$DATA"
  install -d -o root -g root -m 755 "$APP"
  install -d -o root -g kmsync -m 750 "$ETC"
  if [ ! -f "$ETC/config.json" ]; then
    printf '{"listen": "0.0.0.0", "port": 8787, "data_dir": "%s", "public_host": "%s", "public_port": 8787}\n' "$DATA" "${KM_PUBLIC_HOST:-43.142.41.27}" > "$ETC/config.json"
  fi
  chown kmsync:kmsync "$ETC/config.json"; chmod 600 "$ETC/config.json"
  changed=1
  if [ -f "$APP/km_sync_node.py" ] && cmp -s "$U/km_sync_node.py" "$APP/km_sync_node.py" && cmp -s "$U/km-sync.service" /etc/systemd/system/km-sync.service; then
    changed=0
  fi
  if [ "$changed" = 1 ]; then
    [ -f "$APP/km_sync_node.py" ] && ! cmp -s "$U/km_sync_node.py" "$APP/km_sync_node.py" && cp -p "$APP/km_sync_node.py" "$APP/km_sync_node.py.bak"
    install -o root -g root -m 644 "$U/km_sync_node.py" "$APP/km_sync_node.py"
    install -o root -g root -m 644 "$U/km-sync.service" /etc/systemd/system/km-sync.service
    systemctl daemon-reload
  fi
  systemctl enable km-sync >/dev/null 2>&1
  run_node --init
  if [ "$changed" = 1 ] || ! systemctl is-active --quiet km-sync; then systemctl restart km-sync; echo "KMINFO 已重启服务"; else echo "KMINFO 程序没有变化，未重启"; fi
  wait_hello
  echo "KMINFO 版本 $("$PY" "$APP/km_sync_node.py" --version)，上一版 $([ -f "$APP/km_sync_node.py.bak" ] && "$PY" "$APP/km_sync_node.py.bak" --version || echo 无)"
  ;;
rollback)
  [ -f "$APP/km_sync_node.py.bak" ] || { echo "KMERR 没有上一版（.bak）"; exit 11; }
  mv "$APP/km_sync_node.py" "$APP/km_sync_node.py.new"
  mv "$APP/km_sync_node.py.bak" "$APP/km_sync_node.py"
  mv "$APP/km_sync_node.py.new" "$APP/km_sync_node.py.bak"
  systemctl restart km-sync
  wait_hello
  echo "KMINFO 已回滚到 $("$PY" "$APP/km_sync_node.py" --version)（再部署一次即回到新版）"
  ;;
newkey) run_node --new-admin-key ;;
reset) run_node --reset-access ;;
check)
  echo "active=$(systemctl is-active km-sync || true)"
  echo "enabled=$(systemctl is-enabled km-sync || true)"
  pid=$(systemctl show -p MainPID --value km-sync)
  echo "user=$( [ "$pid" != 0 ] && ps -o user= -p "$pid" || echo none)"
  echo "listen=$(ss -ltnH | awk '{print $4}' | grep -v -E '^(127\.|\[::1\]|\[::ffff:127)' | sed -E 's/.*://' | sort -un | tr '\n' ',')"
  echo "config_mode=$(stat -c %a "$ETC/config.json" 2>/dev/null || echo none)"
  echo "data_mode=$(stat -c %a "$DATA" 2>/dev/null || echo none)"
  echo "disk=$(df -h "$DATA" 2>/dev/null | awk 'NR==2{print $4 " free of " $2}')"
  echo "hello=$(curl -sf --max-time 3 http://127.0.0.1:8787/v1/hello || echo none)"
  echo "restarts=$(systemctl show -p NRestarts --value km-sync)"
  ;;
*) echo "用法：remote.sh install|rollback|newkey|reset|check"; exit 2 ;;
esac
