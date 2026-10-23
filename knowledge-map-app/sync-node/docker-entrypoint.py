#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""km-sync 容器入口（1.4.0，#12）。所有数据都在卷 /data：
  /data/config.json   配置（第一次启动时按环境变量生成，之后改这个文件）
  /data/db/           node.db、admin.db（账号、组、邀请码、管理密钥、日志都在这里）
  /data/tls/          网页后台 https 证书 fullchain.pem、privkey.pem（家里局域网一般没有，见 DOCKER.md）
  /data/backups/      backup 命令的输出
  /data/first-run.txt 第一次启动生成的管理码、初始邀请码（只有容器里的 kmsync 用户能读）

用法（docker compose run --rm km-sync <命令>，不带命令就是启动服务）：
  serve            启动服务（默认）
  backup           在线备份数据库到 /data/backups/
  admin-qr         再显示一次第一次启动时的管理码二维码
  new-admin-key    换一把新的管理密钥（旧的立即失效），显示新管理码
  reset-access     清空 IP 封禁和 IP 名单，打开外网管理
  reset-web-login  清空网页后台的用户名、密码、二次验证
  version          显示版本
"""
import json
import os
import subprocess
import sys

DATA = os.environ.get('KM_DATA', '/data')      # 电脑上测试入口脚本时可以改
APP = os.environ.get('KM_APP', '/app')
CFG = os.path.join(DATA, 'config.json')
FIRST = os.path.join(DATA, 'first-run.txt')
NODE = [sys.executable, os.path.join(APP, 'km_sync_node.py'), '--config', CFG]


def ensure_config():
    for d in ('db', 'tls', 'acme', 'backups'):
        os.makedirs(os.path.join(DATA, d), exist_ok=True)
    if os.path.exists(CFG):
        return
    host = os.environ.get('KM_PUBLIC_HOST', '').strip()
    if not host:
        print('第一次启动要告诉节点它在局域网 / 公网上的地址：在 docker-compose.yml 里填 KM_PUBLIC_HOST（例如 192.168.1.20）', flush=True)
        sys.exit(2)
    cfg = {
        'listen': '0.0.0.0', 'port': 8787, 'data_dir': os.path.join(DATA, 'db'),
        'public_host': host, 'public_port': int(os.environ.get('KM_PUBLIC_PORT', '8787') or 8787),
        # 网页后台：家里局域网没有正式证书，默认只开 127.0.0.1:8788（在跑 Docker 的那台电脑上用浏览器开 http://localhost:8788）
        'https_port': int(os.environ.get('KM_HTTPS_PORT', '0') or 0), 'http_port': 0, 'local_web_port': 8788,
        'tls_cert': os.path.join(DATA, 'tls', 'fullchain.pem'), 'tls_key': os.path.join(DATA, 'tls', 'privkey.pem'),
        'acme_dir': os.path.join(DATA, 'acme'), 'web_dir': os.path.join(APP, 'web'),
        # 局域网发现：平板在同一个 Wi-Fi 里能自动找到节点（要 network_mode: host）
        'discovery_port': int(os.environ.get('KM_DISCOVERY_PORT', '8787') or 0),
    }
    with open(CFG, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    os.chmod(CFG, 0o600)
    print(f'已生成 {CFG}（对外地址 {host}）', flush=True)


def kmjson(args):
    r = subprocess.run(NODE + args, capture_output=True, text=True)
    sys.stderr.write(r.stderr)
    for line in r.stdout.splitlines():
        if line.startswith('KMJSON '):
            return json.loads(line[7:])
        print(line, flush=True)
    raise SystemExit(f'节点命令 {args} 没有输出结果')


def show_qr(text, title):
    print('\n' + title, flush=True)
    try:
        import qrcode
        q = qrcode.QRCode(border=1)
        q.add_data(text)
        q.make(fit=True)
        q.print_ascii(invert=True)
    except Exception as e:  # noqa: BLE001
        print(f'（画不了二维码：{e}）')
    print(text + '\n', flush=True)


def init():
    out = kmjson(['--init'])
    if out.get('admin') or out.get('invite'):
        lines = []
        if out.get('admin'):
            lines.append('管理码（审批 App「节点」页扫码；内含管理密钥，勿外传）：' + out['admin']['admin_qr'])
        if out.get('invite'):
            lines.append('初始同步邀请码：' + out['invite']['qr'])
        old = open(FIRST, encoding='utf-8').read() if os.path.exists(FIRST) else ''
        with open(FIRST, 'w', encoding='utf-8') as f:
            f.write(old + '\n'.join(lines) + '\n')
        os.chmod(FIRST, 0o600)
        if out.get('admin'):
            show_qr(out['admin']['admin_qr'], '== 第一次启动：管理码（用团队审批 App「节点」页扫这个二维码）==')
            print('以后要再看：docker compose run --rm km-sync admin-qr', flush=True)
    if not out.get('crypto'):
        print('警告：镜像里导入不了 cryptography，管理接口和账号接口用不了', flush=True)


def drop_root():
    """以 root 启动时（绑定挂载的目录默认属 root）：把 /data 交给 kmsync（uid 10001），然后降成 kmsync 再干活。"""
    if not hasattr(os, 'getuid') or os.getuid() != 0:
        return
    for base, dirs, files in os.walk(DATA):
        for n in [base] + [os.path.join(base, x) for x in dirs + files]:
            try:
                os.chown(n, 10001, 10001)
            except OSError:
                pass
    os.setgroups([])
    os.setgid(10001)
    os.setuid(10001)
    os.environ['HOME'] = DATA


def main():
    drop_root()
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'serve'
    if cmd == 'version':
        os.execv(sys.executable, NODE[:2] + ['--version'])
    ensure_config()
    if cmd == 'serve':
        init()
        os.execv(sys.executable, NODE)
    elif cmd == 'backup':
        out = kmjson(['--backup', os.path.join(DATA, 'backups')])
        print('备份好了：' + out['backup'] + '（在卷里；docker cp 或直接拷卷目录拿出来）')
    elif cmd == 'admin-qr':
        if not os.path.exists(FIRST):
            print('没有 first-run.txt（数据是从别的节点搬来的）。管理密钥还是原来那把：审批 App 里把节点地址改成新地址即可；'
                  '或者 new-admin-key 换一把新的')
            return
        for line in open(FIRST, encoding='utf-8'):
            if 'kmadmin:' in line:
                show_qr(line[line.index('kmadmin:'):].strip(), '管理码')
    elif cmd == 'new-admin-key':
        out = kmjson(['--new-admin-key'])
        with open(FIRST, 'a', encoding='utf-8') as f:
            f.write('新管理码：' + out['admin']['admin_qr'] + '\n')
        os.chmod(FIRST, 0o600)
        show_qr(out['admin']['admin_qr'], '新管理码（旧的已失效，审批 App 重新扫）')
    elif cmd in ('reset-access', 'reset-web-login'):
        kmjson(['--' + cmd])
        print('好了')
    else:
        print(__doc__)
        sys.exit(2)


if __name__ == '__main__':
    main()
