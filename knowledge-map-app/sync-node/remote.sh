#!/bin/bash
# 服务器端安装脚本：deploy.ps1 把它和 km_sync_node.py、km-sync.service 传到 /tmp/km-sync-upload 后，用 sudo 执行
# 用法：sudo bash remote.sh install|rollback|newkey|reset|resetweb|check|setup-tls <staging|prod>|tlscheck
# 只装 km-sync 一个服务：不改 SSH、不开防火墙；唯一装的软件是网页后台证书用的 snap 版 certbot（#6 第二期管理员已同意）
set -euo pipefail
U=/tmp/km-sync-upload
APP=/opt/km-sync
DATA=/var/lib/km-sync
ETC=/etc/km-sync
ACME=/var/lib/km-sync-acme
PUBLIC_IP="${KM_PUBLIC_HOST:-43.142.41.27}"
STAGING_NAME=km-sync-staging
CERTBOT=/snap/bin/certbot
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
    [ -f /etc/systemd/system/km-sync.service ] && ! cmp -s "$U/km-sync.service" /etc/systemd/system/km-sync.service && cp -p /etc/systemd/system/km-sync.service "$APP/km-sync.service.bak"
    install -o root -g root -m 644 "$U/km_sync_node.py" "$APP/km_sync_node.py"
    install -o root -g root -m 644 "$U/km-sync.service" /etc/systemd/system/km-sync.service
    systemctl daemon-reload
  fi
  # 网页后台（1.1.0）：静态文件、证书复制脚本、Let's Encrypt 验证目录、证书目录。换这些不用重启
  if [ -d "$U/web" ]; then
    rm -rf "$APP/web.new"; cp -r "$U/web" "$APP/web.new"
    chown -R root:root "$APP/web.new"; find "$APP/web.new" -type d -exec chmod 755 {} +; find "$APP/web.new" -type f -exec chmod 644 {} +
    rm -rf "$APP/web"; mv "$APP/web.new" "$APP/web"
  fi
  if [ -f "$U/tls-deploy-hook.sh" ]; then install -o root -g root -m 755 "$U/tls-deploy-hook.sh" "$APP/tls-deploy-hook.sh"; fi
  install -d -o root -g root -m 755 "$ACME" "$ACME/.well-known" "$ACME/.well-known/acme-challenge"
  install -d -o root -g kmsync -m 750 "$ETC/tls"
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
  if [ -f "$APP/km-sync.service.bak" ]; then
    # systemd 单元也一起换（1.1.0 加了 80/443 端口权限；1.0.0 用旧单元）
    cp -p /etc/systemd/system/km-sync.service "$APP/km-sync.service.new"
    install -o root -g root -m 644 "$APP/km-sync.service.bak" /etc/systemd/system/km-sync.service
    mv "$APP/km-sync.service.new" "$APP/km-sync.service.bak"
    systemctl daemon-reload
  fi
  systemctl restart km-sync
  wait_hello
  echo "KMINFO 已回滚到 $("$PY" "$APP/km_sync_node.py" --version)（再部署一次即回到新版）"
  ;;
newkey) run_node --new-admin-key ;;
reset) run_node --reset-access ;;
resetweb) run_node --reset-web-login ;;
setup-tls)
  # 网页后台的 Let's Encrypt IP 证书（shortlived，约 160 小时）。webroot 模式：km-sync 的 80 端口只发 $ACME 下的验证文件
  mode="${2:-}"
  if [ "$mode" != staging ] && [ "$mode" != prod ]; then echo "KMERR 用法：remote.sh setup-tls staging|prod"; exit 2; fi
  if [ ! -x "$CERTBOT" ]; then echo "KMINFO 安装 snap 版 certbot"; snap install --classic certbot >/dev/null; fi
  v=$("$CERTBOT" --version 2>&1 | awk '{print $2}')
  if [ "$(printf '%s\n5.4.0\n' "$v" | sort -V | head -1)" != "5.4.0" ]; then
    echo "KMERR certbot 版本 $v 太老（IP 证书的 webroot 模式要 5.4 以上）"; exit 13
  fi
  echo "KMINFO certbot $v"
  install -d -o root -g root -m 755 "$ACME" "$ACME/.well-known" "$ACME/.well-known/acme-challenge"
  if [ ! -x "$APP/tls-deploy-hook.sh" ]; then echo "KMERR 没有 $APP/tls-deploy-hook.sh，先部署 1.1.0"; exit 14; fi
  common=(certonly --non-interactive --webroot -w "$ACME" --ip-address "$PUBLIC_IP" --preferred-profile shortlived
          --agree-tos --register-unsafely-without-email --key-type ecdsa --deploy-hook "$APP/tls-deploy-hook.sh")
  if [ "$mode" = staging ]; then
    if [ -d "/etc/letsencrypt/live/$PUBLIC_IP" ] && [ "${3:-}" != force ]; then
      echo "KMINFO 已有正式证书，跳过 staging"; exit 0
    fi
    "$CERTBOT" "${common[@]}" --staging --cert-name "$STAGING_NAME" --force-renewal
    echo "KMINFO staging 证书签发成功（Let's Encrypt 从境外访问到了 80 端口）"
  else
    # Let's Encrypt 从多个境外地点同时验证，偶尔有一个地点连接超时；失败了隔 30 秒再试，最多 3 次
    ok=0
    for i in 1 2 3; do
      if "$CERTBOT" "${common[@]}" --cert-name "$PUBLIC_IP" --keep-until-expiring; then ok=1; break; fi
      [ "$i" = 3 ] || { echo "KMINFO 第 $i 次签发失败，30 秒后重试"; sleep 30; }
    done
    if [ "$ok" != 1 ]; then echo "KMERR 正式证书 3 次都没签下来（见上面 certbot 的原因）"; exit 15; fi
    # 删掉 staging 那份，免得自动续期时用测试证书覆盖正式证书
    "$CERTBOT" delete --non-interactive --cert-name "$STAGING_NAME" >/dev/null 2>&1 || true
    conf=/etc/letsencrypt/renewal/$PUBLIC_IP.conf
    if grep -q '^renew_before_expiry' "$conf"; then sed -i 's/^renew_before_expiry.*/renew_before_expiry = 3 days/' "$conf"
    else sed -i '1i renew_before_expiry = 3 days' "$conf"; fi
    # 再复制一次，保证 km-sync 用的是正式证书（certonly 遇到已有证书不会重跑 deploy-hook）
    RENEWED_LINEAGE=/etc/letsencrypt/live/$PUBLIC_IP sh "$APP/tls-deploy-hook.sh"
    systemctl enable --now snap.certbot.renew.timer >/dev/null 2>&1 || true
    echo "KMINFO 正式证书已就绪，续期配置 renew_before_expiry = 3 days"
  fi
  ;;
tlscheck)
  f=$ETC/tls/fullchain.pem
  echo "issuer=$(openssl x509 -in "$f" -noout -issuer 2>/dev/null | sed 's/^issuer=//' || echo none)"
  echo "san=$(openssl x509 -in "$f" -noout -ext subjectAltName 2>/dev/null | tail -1 | sed 's/^ *//' || echo none)"
  nb=$(openssl x509 -in "$f" -noout -startdate 2>/dev/null | cut -d= -f2 || true)
  na=$(openssl x509 -in "$f" -noout -enddate 2>/dev/null | cut -d= -f2 || true)
  echo "not_before=$nb"
  echo "not_after=$na"
  if [ -n "$na" ]; then
    echo "valid_hours=$(( ($(date -d "$na" +%s) - $(date -d "$nb" +%s)) / 3600 ))"
    echo "hours_left=$(( ($(date -d "$na" +%s) - $(date +%s)) / 3600 ))"
  fi
  echo "timer=$(systemctl is-active snap.certbot.renew.timer 2>/dev/null || true)"
  echo "renew_before=$(grep '^renew_before_expiry' "/etc/letsencrypt/renewal/$PUBLIC_IP.conf" 2>/dev/null | cut -d= -f2 | xargs || true)"
  echo "lineages=$(ls /etc/letsencrypt/live 2>/dev/null | grep -v README | tr '\n' ',' || true)"
  if "$CERTBOT" renew --dry-run --cert-name "$PUBLIC_IP" --non-interactive >/tmp/km-certbot-dry.log 2>&1; then echo "dry_run=ok"
  else echo "dry_run=fail"; tail -5 /tmp/km-certbot-dry.log | sed 's/^/dry_log=/'; fi
  rm -f /tmp/km-certbot-dry.log
  ;;
check)
  echo "active=$(systemctl is-active km-sync || true)"
  echo "enabled=$(systemctl is-enabled km-sync || true)"
  pid=$(systemctl show -p MainPID --value km-sync)
  echo "user=$( [ "$pid" != 0 ] && ps -o user= -p "$pid" || echo none)"
  echo "listen=$(ss -ltnH | awk '{print $4}' | grep -v -E '^(127\.|\[::1\]|\[::ffff:127)' | sed -E 's/.*://' | sort -un | tr '\n' ',')"
  echo "local_web=$(ss -ltnH | awk '{print $4}' | grep -E ':8788$' | sort -u | tr '\n' ',' || true)"
  echo "web_owner=$(for p in $(ss -ltnpH '( sport = :80 or sport = :443 )' 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u); do ps -o user= -p "$p"; done | sort -u | tr '\n' ',')"
  f=$ETC/tls/fullchain.pem
  if [ -f "$f" ]; then echo "cert_hours_left=$(( ($(date -d "$(openssl x509 -in "$f" -noout -enddate | cut -d= -f2)" +%s) - $(date +%s)) / 3600 ))"; else echo "cert_hours_left=none"; fi
  echo "https=$(curl -sk -o /dev/null -w '%{http_code}' --max-time 5 https://127.0.0.1/ || true)"
  echo "http80=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1/ || true)"
  echo "config_mode=$(stat -c %a "$ETC/config.json" 2>/dev/null || echo none)"
  echo "data_mode=$(stat -c %a "$DATA" 2>/dev/null || echo none)"
  echo "disk=$(df -h "$DATA" 2>/dev/null | awk 'NR==2{print $4 " free of " $2}')"
  echo "hello=$(curl -sf --max-time 3 http://127.0.0.1:8787/v1/hello || echo none)"
  echo "restarts=$(systemctl show -p NRestarts --value km-sync)"
  ;;
*) echo "用法：remote.sh install|rollback|newkey|reset|resetweb|check|setup-tls staging|prod|tlscheck"; exit 2 ;;
esac
