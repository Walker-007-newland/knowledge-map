# -*- coding: utf-8 -*-
"""生成「账号恢复密钥」（#12 第一期）：一对 P-256 密钥。
  私钥 → signing/km-recovery.json（不提交）和 signing/km-recovery.png（二维码 kmrecov:1?k=<私钥>&id=<编号>，审批 App「节点 → 账号」里扫一次导入）
  公钥 → 打包时 build.ps1 从 km-recovery.json 读出来写进知识图谱 APK；学生注册时用它加密一份「恢复包」（wrap_admin），
         只有拿着私钥的审批 App 能解开，用来帮学生重设密码。节点上没有私钥，节点被攻破也解不开。

用法：python make_recovery_key.py [signing 目录]        已有 km-recovery.json 时拒绝覆盖（丢了旧私钥就解不开已注册账号的恢复包）
      python make_recovery_key.py [signing 目录] --force（只在还没有任何学生注册时用）
只用 Python 标准库算密钥（P-256 标量乘）；二维码图片用 qrcode + pillow（make_codes.py 同款，没装就只生成 json）。
"""
import base64
import datetime
import hashlib
import json
import os
import secrets
import sys

# P-256（secp256r1）参数
P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff
A = P - 3
N = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551
GX = 0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296
GY = 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5

SPKI_PREFIX = bytes.fromhex('3059301306072a8648ce3d020106082a8648ce3d030107034200')
PKCS8_PREFIX = bytes.fromhex('3041020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420')


def _add(p, q):
    if p is None:
        return q
    if q is None:
        return p
    if p[0] == q[0] and (p[1] + q[1]) % P == 0:
        return None
    if p == q:
        lam = (3 * p[0] * p[0] + A) * pow(2 * p[1], -1, P) % P
    else:
        lam = (q[1] - p[1]) * pow(q[0] - p[0], -1, P) % P
    x = (lam * lam - p[0] - q[0]) % P
    return x, (lam * (p[0] - x) - p[1]) % P


def _mul(k, pt):
    r = None
    while k:
        if k & 1:
            r = _add(r, pt)
        pt = _add(pt, pt)
        k >>= 1
    return r


def new_key():
    d = secrets.randbelow(N - 1) + 1
    x, y = _mul(d, (GX, GY))
    assert (y * y - x * x * x - A * x) % P == 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b % P
    pub = SPKI_PREFIX + b'\x04' + x.to_bytes(32, 'big') + y.to_bytes(32, 'big')
    priv = PKCS8_PREFIX + d.to_bytes(32, 'big')
    return priv, pub


def b64e(b):
    return base64.urlsafe_b64encode(b).rstrip(b'=').decode()


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    here = os.path.dirname(os.path.abspath(__file__))
    sign = args[0] if args else os.environ.get('KM_SIGNING_DIR') or os.path.join(os.path.dirname(here), 'signing')
    path = os.path.join(sign, 'km-recovery.json')
    if os.path.exists(path) and '--force' not in sys.argv:
        with open(path, encoding='utf-8') as f:
            kid = json.load(f).get('kid')
        print(f'已经有账号恢复密钥 {kid}（{path}），不覆盖。丢了旧私钥就解不开已注册账号的恢复包；确实要换（还没有学生注册）加 --force')
        return 1
    os.makedirs(sign, exist_ok=True)
    priv, pub = new_key()
    kid = hashlib.sha256(pub).hexdigest()[:8]
    info = {'v': 1, 'kid': kid, 'pub': b64e(pub), 'priv': b64e(priv),
            'qr': f'kmrecov:1?k={b64e(priv)}&id={kid}',
            'created': datetime.datetime.now().astimezone().isoformat(timespec='seconds'),
            'note': '知识图谱账号恢复密钥（#12）。私钥能解开学生账号的恢复包，只放 signing 和审批 App，另存一份到安全的地方，勿外传'}
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False, indent=2)
    print(f'已生成账号恢复密钥 {kid}：{path}')
    try:
        sys.path.insert(0, here)
        from make_codes import draw
        draw(info['qr'], f'账号恢复密钥 · {kid}', '团队审批 App →「节点 → 账号」→ 导入恢复密钥，扫这张图。勿外传',
             os.path.join(sign, 'km-recovery.png'))
        print('二维码：' + os.path.join(sign, 'km-recovery.png'))
    except ImportError as e:
        print(f'（没装 qrcode / pillow，没生成二维码图片：{e}）')
    return 0


if __name__ == '__main__':
    sys.exit(main())
