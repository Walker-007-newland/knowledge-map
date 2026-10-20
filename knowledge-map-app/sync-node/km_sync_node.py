#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""km-sync 同步节点：设备协议 /v1（只存密文）+ 管理接口 /admin/v1（只给元数据）+ 网页后台（1.1.0 起）。

协议见同目录 PROTOCOL.md，部署见 README.md。单文件、单进程，跑在 Python 3.10+：
- 设备协议只用标准库；
- 管理接口用系统自带的 python3-cryptography（AESGCM），导入不了时管理接口整体关闭（回 403），设备接口照常。

运行：python3 km_sync_node.py --config /etc/km-sync/config.json（1.3.0：彻底删除组登记、App 里换管理密钥、日志一页 500 条）
监听（端口都可在 config.json 里改，0 = 不开）：
  8787            设备协议 + 审批 App 管理接口（明文 HTTP + 整包加密）
  443  (TLS)      网页后台：静态页面、/admin/web/login、/admin/v1（会话密钥或管理密钥）；证书 /etc/km-sync/tls/，60 秒内热更新
  80              只有 Let's Encrypt 验证文件 /.well-known/acme-challenge/ 和跳转 https
  127.0.0.1:8788  网页后台的明文版，只给 SSH 隧道用（localhost 是浏览器的安全上下文）
  80/443/8788 起不来或证书有问题时只影响网页后台，8787 照常。
其它命令（部署脚本经 SSH 调用，以 kmsync 身份运行）：
  --init             建库；没有管理密钥就生成一把，没有邀请码就生成一张「初始」邀请码（30 天、10 次），结果以 KMJSON 行输出
  --new-admin-key    换管理密钥（旧的立即失效），输出新的
  --reset-access     清空 IP 封禁、熔断和 IP 名单，打开外网管理（同时清空网页登录的失败计数）
  --reset-web-login  清空网页用户名、密码、二次验证和所有网页会话，网页登录关闭（要在审批 App 里重新设密码）
  --version          只打印版本号
"""
import argparse
import base64
import datetime
import hashlib
import hmac
import ipaddress
import json
import os
import re
import secrets
import shutil
import socket
import sqlite3
import ssl
import sys
import threading
import time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

VERSION = '1.3.0'
PROTO = 1
MB = 1024 * 1024
CN_TZ = datetime.timezone(datetime.timedelta(hours=8))

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM as _AESGCM
    CRYPTO_ERR = None
except Exception as _e:  # noqa: BLE001
    _AESGCM = None
    CRYPTO_ERR = repr(_e)

DEFAULT_LIMITS = {'max_groups': 30, 'group_mb': 50, 'sec_mb': 4, 'req_mb': 8, 'ip_rate': 600}
LIMIT_RANGES = {'max_groups': (1, 200), 'group_mb': (1, 500), 'sec_mb': (1, 16), 'req_mb': (1, 32), 'ip_rate': (60, 10000)}
DEFAULT_EXPIRY = '2026-11-16'
MAIL_MAX = 64 * 1024          # 单封信件
MAIL_PER_GROUP = 200
RDV_MAX = 16 * 1024           # 一个转交点所有消息合计
RDV_MSGS = 8
RDV_TTL = 600
RDV_TOTAL = 500
ADMIN_BODY_MAX = 64 * 1024
LOG_KEEP_DAYS = 90
SUPERSEDED_DAYS = 60
TOMBSTONE_DAYS = 90          # 换钥后的旧组号记多久（期间不许用邀请码把它重建出来）

# 网页后台（1.1.0）
WEB_IDLE = 30 * 60            # 会话空闲 30 分钟过期
WEB_MAX_AGE = 12 * 3600       # 会话最长 12 小时
WEB_MAX_SESSIONS = 5
WEB_ACCOUNT_FAILS = 10        # 账号 1 小时内失败 10 次 → 网页登录暂停 1 小时
LOGIN_BODY_MAX = 4096
LOGIN_FAIL_MSG = '用户名、密码或验证码不对'
LOGIN_DENIED_MSG = '暂时不能登录：这个网络被限制，或失败次数过多被暂时封禁（1 小时后自动恢复）'
LOGIN_PAUSED_MSG = '网页登录因失败次数过多暂停 1 小时。可以在审批 App「节点 → 限额与访问 → 网页登录」里处理'
RE_USER = re.compile(r'^[A-Za-z0-9]{3,32}$')
SCRYPT_N, SCRYPT_R, SCRYPT_P = 15, 8, 1
# 只发这些文件（相对 web_dir）；其它路径一律 404
WEB_FILES = {
    '/': ('index.html', 'text/html; charset=utf-8'),
    '/index.html': ('index.html', 'text/html; charset=utf-8'),
    '/web.js': ('web.js', 'application/javascript; charset=utf-8'),
    '/web.css': ('web.css', 'text/css; charset=utf-8'),
    '/node.js': ('node.js', 'application/javascript; charset=utf-8'),
    '/node.css': ('node.css', 'text/css; charset=utf-8'),
    '/vendor/qrcode.js': ('vendor/qrcode.js', 'application/javascript; charset=utf-8'),
    '/vendor/jsQR.js': ('vendor/jsQR.js', 'application/javascript; charset=utf-8'),
}
CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
       "connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
RE_ACME = re.compile(r'^[A-Za-z0-9_-]{1,128}$')

RE_GID = re.compile(r'^[0-9a-f]{32}$')
RE_DEV = re.compile(r'^[A-Za-z0-9_-]{1,64}$')
RE_SEC = re.compile(r'^[A-Za-z0-9_-]{1,64}$')
RE_CID = re.compile(r'^[A-Za-z0-9_-]{0,64}$')
RE_INV = re.compile(r'^[a-z2-9]{8}$')
RE_RDV = re.compile(r'^[A-Za-z0-9_-]{16,64}$')
INV_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'


# ---------------------------------------------------------------- 编码

def b64e(b):
    return base64.urlsafe_b64encode(b).rstrip(b'=').decode('ascii')


def b64d(s):
    if not isinstance(s, str) or not re.fullmatch(r'[A-Za-z0-9_-]*', s):
        raise ValueError('base64')
    return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))


def hm(key, msg):
    return hmac.new(key, msg, hashlib.sha256).digest()


def xor(a, b):
    return bytes(x ^ y for x, y in zip(a, b))


# ---------------------------------------------------------------- 纯 Python AES-256-GCM（只给本机测试用）
# 正式运行只用 cryptography；本机电脑没装 cryptography 时，test_node.py 用它起本地节点。
# 和 Java javax.crypto、服务器上的 cryptography 互通由 test_node.py 验证。

def _rotl8(x, s):
    return ((x << s) | (x >> (8 - s))) & 0xFF


def _make_sbox():
    sbox = [0] * 256
    p = q = 1
    while True:
        p = p ^ ((p << 1) & 0xFF) ^ (0x1B if p & 0x80 else 0)
        q ^= q << 1
        q ^= q << 2
        q ^= q << 4
        q &= 0xFF
        if q & 0x80:
            q ^= 0x09
        sbox[p] = (q ^ _rotl8(q, 1) ^ _rotl8(q, 2) ^ _rotl8(q, 3) ^ _rotl8(q, 4) ^ 0x63) & 0xFF
        if p == 1:
            break
    sbox[0] = 0x63
    return sbox


_SBOX = _make_sbox()


def _xt(a):
    return ((a << 1) ^ 0x1B) & 0xFF if a & 0x80 else a << 1


class PyAESGCM:
    def __init__(self, key):
        if len(key) != 32:
            raise ValueError('key')
        w = [list(key[i:i + 4]) for i in range(0, 32, 4)]
        rcon = 1
        for i in range(8, 60):
            t = list(w[i - 1])
            if i % 8 == 0:
                t = t[1:] + t[:1]
                t = [_SBOX[x] for x in t]
                t[0] ^= rcon
                rcon = _xt(rcon)
            elif i % 8 == 4:
                t = [_SBOX[x] for x in t]
            w.append([a ^ b for a, b in zip(w[i - 8], t)])
        self._rk = [sum(w[r * 4:r * 4 + 4], []) for r in range(15)]
        self._h = int.from_bytes(self._block(bytes(16)), 'big')

    def _block(self, b):
        rk, sb = self._rk, _SBOX
        s = [x ^ k for x, k in zip(b, rk[0])]
        for r in range(1, 15):
            s = [sb[x] for x in s]
            s = [s[((i // 4 + i % 4) % 4) * 4 + i % 4] for i in range(16)]
            if r != 14:
                m = []
                for c in range(4):
                    a0, a1, a2, a3 = s[c * 4:c * 4 + 4]
                    m += [_xt(a0) ^ _xt(a1) ^ a1 ^ a2 ^ a3, a0 ^ _xt(a1) ^ _xt(a2) ^ a2 ^ a3,
                          a0 ^ a1 ^ _xt(a2) ^ _xt(a3) ^ a3, _xt(a0) ^ a0 ^ a1 ^ a2 ^ _xt(a3)]
                s = m
            s = [x ^ k for x, k in zip(s, rk[r])]
        return bytes(s)

    def _gmul(self, x):
        z, v = 0, self._h
        for i in range(127, -1, -1):
            if (x >> i) & 1:
                z ^= v
            v = (v >> 1) ^ (0xE1 << 120) if v & 1 else v >> 1
        return z

    def _ghash(self, aad, ct):
        x = 0
        for data in (aad, ct):
            for i in range(0, len(data), 16):
                x = self._gmul(x ^ int.from_bytes(data[i:i + 16].ljust(16, b'\0'), 'big'))
        x = self._gmul(x ^ ((len(aad) * 8) << 64 | (len(ct) * 8)))
        return x.to_bytes(16, 'big')

    def _ctr(self, iv, data):
        out = bytearray()
        c = int.from_bytes(iv, 'big') << 32 | 1
        for i in range(0, len(data), 16):
            c = (c & ~0xFFFFFFFF) | ((c + 1) & 0xFFFFFFFF)
            ks = self._block(c.to_bytes(16, 'big'))
            out += xor(data[i:i + 16], ks)
        return bytes(out)

    def encrypt(self, iv, data, aad):
        if len(iv) != 12:
            raise ValueError('iv')
        ct = self._ctr(iv, data)
        j0 = self._block(iv + b'\0\0\0\1')
        return ct + xor(j0, self._ghash(aad or b'', ct))

    def decrypt(self, iv, data, aad):
        if len(iv) != 12 or len(data) < 16:
            raise ValueError('bad')
        ct, tag = data[:-16], data[-16:]
        j0 = self._block(iv + b'\0\0\0\1')
        if not hmac.compare_digest(xor(j0, self._ghash(aad or b'', ct)), tag):
            raise ValueError('tag')
        return self._ctr(iv, ct)


# ---------------------------------------------------------------- 工具

class Clock:
    """可调的时钟：测试里改 offset 模拟过了很久。"""
    def __init__(self):
        self.offset = 0.0

    def now(self):
        return time.time() + self.offset


class Reject(Exception):
    def __init__(self, status, err, note=''):
        super().__init__(err)
        self.status, self.err, self.note = status, err, note


class OpError(Exception):
    def __init__(self, msg, code='bad'):
        super().__init__(msg)
        self.msg, self.code = msg, code


def ip_in(ip, nets):
    try:
        a = ipaddress.ip_address(ip)
    except ValueError:
        return False
    for n in nets:
        try:
            if a in ipaddress.ip_network(n, strict=False):
                return True
        except ValueError:
            continue
    return False


def is_local(ip):
    return ip in ('127.0.0.1', '::1')


# ---------------------------------------------------------------- 网页密码、二次验证

_scrypt_lock = threading.Lock()     # 同一时间只算一个 scrypt（约 32MB 内存），防止狂发登录把内存吃满
_DUMMY_SALT = b'km-sync-dummy-salt'


def _scrypt(pw, salt, n, r, p):
    with _scrypt_lock:
        return hashlib.scrypt(pw.encode('utf-8'), salt=salt, n=1 << n, r=r, p=p, maxmem=64 * MB, dklen=32)


def pw_hash(pw):
    salt = secrets.token_bytes(16)
    return f'scrypt${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${b64e(salt)}${b64e(_scrypt(pw, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P))}'


def pw_check(pw, stored):
    """stored 为空时也算一次（假的），让「没有这个用户」和「密码错」用时一样。"""
    if not isinstance(pw, str) or len(pw) > 128:
        pw = ''
    try:
        alg, n, r, p, salt, h = (stored or '').split('$')
        if alg != 'scrypt':
            raise ValueError
        n, r, p, salt, h = int(n), int(r), int(p), b64d(salt), b64d(h)
        if not (10 <= n <= 20 and 1 <= r <= 16 and 1 <= p <= 4):
            raise ValueError
    except ValueError:
        _scrypt(pw, _DUMMY_SALT, SCRYPT_N, SCRYPT_R, SCRYPT_P)
        return False
    return hmac.compare_digest(_scrypt(pw, salt, n, r, p), h)


# 常见弱密码（12 位以上的；更短的本来就不允许）+ 规则检查。不依赖外部密码表。
_WEAK_WORDS = {
    'password', 'passw0rd', 'p@ssw0rd', 'p@ssword', 'iloveyou', 'qwerty', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'admin',
    'administrator', 'welcome', 'letmein', 'dragon', 'monkey', 'football', 'baseball', 'sunshine', 'princess', 'superman',
    'master', 'shadow', 'michael', 'woaini', 'aini', 'woaiwojia', 'abc', 'abcd', 'abcdef', 'qazwsx', 'qweasd', 'qweasdzxc',
    'changeme', 'secret', 'default', 'root', 'test', 'guest', 'login', 'kmsync', 'zhongkao', 'fujian', 'tencent', 'qq',
    'computer', 'internet', 'whatever', 'trustno', 'starwars', 'pokemon', 'chocolate', 'liverpool', 'jordan', 'hello',
    'helloworld', 'zaq', 'xsw', 'mima', 'wodemima', 'woshinidie', 'nihao', 'baobao', 'beijing', 'shanghai', 'china',
}
_WEAK_SEQ = ('0123456789012345678901234567890', '9876543210987654321098765432109', 'abcdefghijklmnopqrstuvwxyz',
             'qwertyuiopasdfghjklzxcvbnm', '1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0p', 'qazwsxedcrfvtgbyhnujmikolp',
             '1q2w3e4r5t6y7u8i9o0p', 'zaq12wsxcde34rfvbgt56yhnmju78ik', 'qweasdzxcrtyfghvbnuiojklm')


def pw_problem(pw, user, host):
    """返回中文原因，或 None（可以用）。按 NIST 800-63B：看长度和黑名单，不要求「大写 + 符号」。"""
    if not isinstance(pw, str):
        return '密码格式不对'
    if len(pw) < 12:
        return '密码至少 12 个字符'
    if len(pw) > 128:
        return '密码最多 128 个字符'
    low = pw.lower()
    for bad, name in ((user, '用户名'), ('admin', '「admin」'), ('kmsync', '「kmsync」'), (host, '服务器地址')):
        if bad and str(bad).lower() in low:
            return f'密码里不能包含{name}'
    core = re.sub(r'^[\d\W_]+|[\d\W_]+$', '', low)
    if len(set(low)) <= 3 or core in _WEAK_WORDS or core == '' or any(low in s for s in _WEAK_SEQ):
        return '这个密码太常见、太好猜，请换一个（可以用几个不相关的词加数字）'
    for n in range(1, 7):
        if len(low) % n == 0 and low == low[:n] * (len(low) // n):
            return '这个密码太常见、太好猜，请换一个（可以用几个不相关的词加数字）'
    return None


def totp(secret, step, digits=6, alg='sha1'):
    """RFC 6238（HOTP，30 秒一步）。"""
    h = hmac.new(secret, int(step).to_bytes(8, 'big'), alg).digest()
    o = h[-1] & 15
    return str((int.from_bytes(h[o:o + 4], 'big') & 0x7FFFFFFF) % 10 ** digits).zfill(digits)


def totp_match(secret, code, now, last_step=0):
    """允许前后各差一个 30 秒；用过的时间步（<= last_step）不再接受。返回匹配的时间步或 None。"""
    if not isinstance(code, str) or not re.fullmatch(r'\d{6}', code.strip()):
        return None
    code = code.strip()
    cur = int(now // 30)
    for st in (cur, cur - 1, cur + 1):
        if st > (last_step or 0) and hmac.compare_digest(totp(secret, st), code):
            return st
    return None


def b32(b):
    return base64.b32encode(b).decode('ascii').rstrip('=')


# ---------------------------------------------------------------- TLS 证书（热更新）

def cert_info(path):
    """读证书的到期时间、签发者、SAN（只读文件，不联网）。"""
    try:
        d = ssl._ssl._test_decode_cert(path)   # noqa: SLF001 CPython 自带，读 PEM 证书
    except Exception as e:  # noqa: BLE001
        return {'err': repr(e)[:200]}
    issuer = ', '.join(f'{k}={v}' for rdn in d.get('issuer', ()) for k, v in rdn)
    return {'not_after': int(ssl.cert_time_to_seconds(d['notAfter']) * 1000), 'not_before': int(ssl.cert_time_to_seconds(d['notBefore']) * 1000),
            'issuer': issuer, 'san': [v for _, v in d.get('subjectAltName', ())]}


class TLS:
    """443 用的证书：每隔 interval 秒看一次文件修改时间，变了就换新的 SSLContext（新连接用新证书，不用重启）。
    新证书加载失败时继续用旧的；一直没有可用证书时 443 不接受连接。都不影响 8787。"""

    def __init__(self, cert, key, interval=60):
        self.cert, self.key, self.interval = cert, key, interval
        self.ctx, self.mt, self.checked, self.err, self.info = None, None, 0.0, None, {}
        self.lock = threading.Lock()
        self.check(force=True)

    def _mtimes(self):
        try:
            a, b = os.stat(self.cert), os.stat(self.key)
            return (a.st_mtime_ns, a.st_size, b.st_mtime_ns, b.st_size)
        except OSError:
            return None

    def check(self, force=False):
        with self.lock:
            now = time.monotonic()
            if not force and now - self.checked < self.interval:
                return self.ctx
            self.checked = now
            mt = self._mtimes()
            if mt is None:
                if self.ctx is None:
                    self.err = '还没有证书（deploy.ps1 -SetupTls 签发）'
                return self.ctx
            if mt == self.mt:
                return self.ctx
            try:
                ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                ctx.minimum_version = ssl.TLSVersion.TLSv1_2
                ctx.load_cert_chain(self.cert, self.key)
                ctx.set_alpn_protocols(['http/1.1'])
            except (ssl.SSLError, OSError, ValueError) as e:
                self.err = '新证书加载失败，继续用旧的：' + repr(e)[:160] if self.ctx else '证书加载失败：' + repr(e)[:160]
                print(self.err, flush=True)
                return self.ctx
            self.ctx, self.mt, self.err, self.info = ctx, mt, None, cert_info(self.cert)
            print(f'已加载证书，到期 {self.info.get("not_after")}，签发者 {self.info.get("issuer")}', flush=True)
            return ctx

    def status(self, now_ms):
        self.check()
        na = self.info.get('not_after')
        return {'enabled': self.ctx is not None, 'not_after': na, 'hours_left': round((na - now_ms) / 3600000, 1) if na else None,
                'issuer': self.info.get('issuer', ''), 'err': self.err}


# ---------------------------------------------------------------- 节点

class Node:
    def __init__(self, data_dir, public_host='127.0.0.1', public_port=8787, clock=None, aes=None):
        self.data_dir = data_dir
        self.public_host, self.public_port = public_host, public_port
        self.clock = clock or Clock()
        self.aes = aes if aes is not None else _AESGCM   # 测试可传 PyAESGCM
        self.lock = threading.RLock()
        self.started = self.clock.now()
        os.makedirs(data_dir, exist_ok=True)
        self.ndb_path = os.path.join(data_dir, 'node.db')
        self.adb_path = os.path.join(data_dir, 'admin.db')
        self.ndb = self._open(self.ndb_path)
        self.adb = self._open(self.adb_path)
        self.ip_hits = {}               # 设备接口每 IP 请求时间
        self.fail_ip = {}               # 管理接口每 IP 认证失败时间
        self.fail_all = deque()         # 管理接口所有外网来源失败时间
        self.kid_hits = {}              # 管理接口每个 kid 成功请求时间
        self.hours = {}                 # 小时 -> [请求数, 错误数]
        # 网页后台（main() / 测试里设置）
        self.tls = None                 # TLS 实例；None = 没配置 443
        self.web_dir = None             # 静态文件目录
        self.acme_dir = None            # Let's Encrypt webroot（80 端口只从这里读验证文件）
        self.web_url = f'https://{public_host}'
        self.cur = None                 # 当前管理请求的身份（admin() 持锁时设置）
        self._migrate()
        self.janitor()

    # ---------- 存储
    def _open(self, path):
        db = sqlite3.connect(path, check_same_thread=False, timeout=15)
        db.execute('PRAGMA journal_mode=WAL')
        db.execute('PRAGMA synchronous=NORMAL')
        db.execute('PRAGMA busy_timeout=15000')
        return db

    def _migrate(self):
        with self.lock:
            for db, name, steps in ((self.ndb, 'node', NODE_SCHEMA), (self.adb, 'admin', ADMIN_SCHEMA)):
                db.execute('CREATE TABLE IF NOT EXISTS meta(k TEXT PRIMARY KEY, v TEXT)')
                row = db.execute("SELECT v FROM meta WHERE k='schema'").fetchone()
                ver = int(row[0]) if row else 0
                if name == 'admin' and 0 < ver < len(steps):
                    # 升级表结构前备份一份（admin.db.v<旧版本>.bak），回滚时可以对照
                    bak = sqlite3.connect(f'{self.adb_path}.v{ver}.bak')
                    db.backup(bak)
                    bak.close()
                for i, sql in enumerate(steps, 1):
                    if i > ver:
                        db.executescript(sql)
                        db.execute("INSERT OR REPLACE INTO meta VALUES('schema', ?)", (str(i),))
                        if ver:
                            self.log('系统', '', 'migrate', name, '成功', f'表结构 {ver} → {i}')
                db.commit()

    def now(self):
        return self.clock.now()

    def ms(self):
        return int(self.now() * 1000)

    def setting(self, k, default=None):
        row = self.adb.execute('SELECT v FROM settings WHERE k=?', (k,)).fetchone()
        return json.loads(row[0]) if row else default

    def set_setting(self, k, v):
        self.adb.execute('INSERT OR REPLACE INTO settings VALUES(?, ?)', (k, json.dumps(v, ensure_ascii=False)))

    def limits(self):
        lim = dict(DEFAULT_LIMITS)
        lim.update(self.setting('limits', {}) or {})
        return lim

    def log(self, who, ip, op, obj, result, note='', sec=False):
        self.adb.execute('INSERT INTO log(t, who, ip, op, obj, result, note, sec) VALUES(?,?,?,?,?,?,?,?)',
                         (self.ms(), who, ip or '', op, obj or '', result, note or '', 1 if sec else 0))
        self.adb.commit()

    def count_hit(self, err):
        h = int(self.now() // 3600)
        with self.lock:
            b = self.hours.setdefault(h, [0, 0])
            b[0] += 1
            b[1] += 1 if err else 0
            for k in [k for k in self.hours if k < h - 24]:
                del self.hours[k]

    # ---------- 清理（启动时和每 5 分钟）
    def janitor(self):
        with self.lock:
            now = self.ms()
            self.ndb.execute('DELETE FROM mail WHERE expires < ?', (now,))
            self.ndb.execute('DELETE FROM rdv WHERE expires < ?', (now,))
            self.adb.execute('DELETE FROM bans WHERE until < ?', (now,))
            self.adb.execute('DELETE FROM log WHERE t < ?', (now - LOG_KEEP_DAYS * 86400000,))
            # 过期的网页会话保留一天（期间再用它只回 403、不计入失败），之后删掉
            try:
                self.adb.execute('DELETE FROM web_sessions WHERE expires < ? OR last_used < ?',
                                 (now - 86400000, now - WEB_IDLE * 1000 - 86400000))
            except sqlite3.OperationalError:
                pass        # 只认表结构 1 的库（测试里模拟回滚）
            # 换钥后的旧组：有了下一代组超过 60 天，整个删掉（设备应该早就迁走了）
            old = self.adb.execute('SELECT DISTINCT parent_gid FROM known_groups WHERE parent_gid IS NOT NULL AND created < ?',
                                   (now - SUPERSEDED_DAYS * 86400000,)).fetchall()
            for (gid,) in old:
                if self.ndb.execute('SELECT 1 FROM groups WHERE gid=?', (gid,)).fetchone():
                    self._delete_group_data(gid)
                    self.log('系统', '', 'cleanup', gid[:6], '成功', '换钥后的旧组超过 60 天，已删除')
            try:
                # 1.3.0：管理员「彻底删除」的组登记留下的墓碑（purged 不为空）永久保留，这个组号永远不能再建
                self.adb.execute('DELETE FROM tombstones WHERE created < ? AND purged IS NULL', (now - TOMBSTONE_DAYS * 86400000,))
            except sqlite3.OperationalError:
                pass        # 只认旧表结构的库（测试里模拟回滚）
            for gid in list(self._group_ids()):
                self._recount(gid)
            self.ndb.commit()
            self.adb.commit()

    def _group_ids(self):
        return [r[0] for r in self.ndb.execute('SELECT gid FROM groups')]

    def _delete_group_data(self, gid):
        for t in ('slots', 'counters', 'mail', 'groups'):
            self.ndb.execute(f'DELETE FROM {t} WHERE gid=?', (gid,))

    def _recount(self, gid):
        s = self.ndb.execute('SELECT COALESCE(SUM(LENGTH(data)),0) FROM slots WHERE gid=?', (gid,)).fetchone()[0]
        m = self.ndb.execute('SELECT COALESCE(SUM(LENGTH(data)),0) FROM mail WHERE gid=?', (gid,)).fetchone()[0]
        self.ndb.execute('UPDATE groups SET bytes=? WHERE gid=?', (s + m, gid))
        return s + m

    def known(self, gid):
        row = self.adb.execute('SELECT gid, invite_id, parent_gid, created, blocked_at, note, quota_mb FROM known_groups WHERE gid=?',
                               (gid,)).fetchone()
        return dict(zip(('gid', 'invite_id', 'parent_gid', 'created', 'blocked_at', 'note', 'quota_mb'), row)) if row else None

    def purged(self, gid):
        """管理员彻底删除过登记的组号（1.3.0）：对设备来说和「已封禁」一样，永远 403 blocked。"""
        try:
            return bool(self.adb.execute('SELECT 1 FROM tombstones WHERE gid=? AND purged IS NOT NULL', (gid,)).fetchone())
        except sqlite3.OperationalError:
            return False

    def quota_bytes(self, gid):
        k = self.known(gid)
        mb = k['quota_mb'] if k and k['quota_mb'] else self.limits()['group_mb']
        return mb * MB

    # ================================================================ 设备协议 /v1

    def rate_ok(self, ip):
        lim = self.limits()['ip_rate']
        now = self.now()
        with self.lock:
            q = self.ip_hits.setdefault(ip, deque())
            while q and q[0] < now - 600:
                q.popleft()
            if len(q) >= lim:
                return False
            q.append(now)
            if len(self.ip_hits) > 5000:
                for k in [k for k, v in self.ip_hits.items() if not v or v[-1] < now - 600]:
                    del self.ip_hits[k]
            return True

    def device(self, method, path, headers, body, ip):
        """返回 (状态码, dict)。"""
        if path == '/v1/hello' and method == 'GET':
            return 200, {'node': 'km-sync', 'proto': PROTO, 'ver': VERSION, 'time': self.ms()}
        if method != 'POST':
            raise Reject(405, 'method')
        try:
            req = json.loads(body.decode('utf-8')) if body else {}
            if not isinstance(req, dict):
                raise ValueError
        except ValueError:
            raise Reject(400, 'bad', 'JSON 解析失败')
        if path == '/v1/create':
            return self.v_create(req)
        m = re.fullmatch(r'/v1/rdv/([A-Za-z0-9_-]+)', path)
        if m:
            return self.v_rdv(m.group(1), req)
        m = re.fullmatch(r'/v1/g/([^/]+)/(pull|push|forget|drop|successor|mail/put|mail/get|mail/del)', path)
        if not m:
            raise Reject(404, 'path')
        gid, action = m.group(1), m.group(2)
        if not RE_GID.match(gid):
            raise Reject(400, 'bad', 'gid 格式')
        with self.lock:
            k = self.known(gid)
            if (k and k['blocked_at']) or self.purged(gid):
                raise Reject(403, 'blocked')
            g = self.ndb.execute('SELECT node_key FROM groups WHERE gid=?', (gid,)).fetchone()
            if not g:
                raise Reject(404, 'nogroup')
            dev = self.verify(gid, g[0], method, path, headers.get('X-KM-Auth', ''), body)
            self.ndb.execute('UPDATE groups SET last_seen=? WHERE gid=?', (self.ms(), gid))
            try:
                fn = getattr(self, 'v_' + action.replace('/', '_'))
                res = fn(gid, dev, req, g[0])
                self.ndb.commit()
                self.adb.commit()
                return res
            except BaseException:
                self.ndb.rollback()
                raise

    def verify(self, gid, node_key, method, path, auth, body):
        parts = auth.split('.')
        if len(parts) != 3 or not RE_DEV.match(parts[0]) or not parts[1].isdigit() or len(parts[1]) > 16:
            raise Reject(401, 'auth', '签名格式')
        dev, ctr = parts[0], int(parts[1])
        msg = f'{method}\n{path}\n{dev}\n{ctr}\n{hashlib.sha256(body).hexdigest()}'.encode()
        try:
            got = b64d(parts[2])
        except ValueError:
            raise Reject(401, 'auth', '签名格式')
        if not hmac.compare_digest(hm(node_key, msg), got):
            raise Reject(401, 'auth', '签名错')
        row = self.ndb.execute('SELECT last FROM counters WHERE gid=? AND dev=?', (gid, dev)).fetchone()
        if row and ctr <= row[0]:
            raise Reject(401, 'auth', '计数重复')
        self.ndb.execute('INSERT INTO counters(gid, dev, last, last_seen) VALUES(?,?,?,?) '
                         'ON CONFLICT(gid, dev) DO UPDATE SET last=excluded.last, last_seen=excluded.last_seen',
                         (gid, dev, ctr, self.ms()))
        return dev

    @staticmethod
    def _unwrap(ik, gid, req):
        try:
            n, w, mac = b64d(req.get('n', '')), b64d(req.get('w', '')), b64d(req.get('mac', ''))
        except ValueError:
            raise Reject(400, 'bad', '编码')
        if len(n) != 16 or len(w) != 32 or len(mac) != 32:
            raise Reject(400, 'bad', '长度')
        ok = hmac.compare_digest(hm(ik, b'km-create' + gid.encode() + n + w), mac)
        return (xor(w, hm(ik, b'km-wrap' + gid.encode() + n)) if ok else None)

    def _new_group(self, gid, node_key):
        lim = self.limits()
        if self.ndb.execute('SELECT COUNT(*) FROM groups').fetchone()[0] >= lim['max_groups']:
            raise Reject(413, 'groups', '组数已满')
        now = self.ms()
        self.ndb.execute('INSERT INTO groups(gid, node_key, seq, bytes, created, last_seen, gen) VALUES(?,?,0,0,?,?,?)',
                         (gid, node_key, now, now, secrets.token_hex(4)))

    def _existing(self, gid, node_key):
        row = self.ndb.execute('SELECT node_key, gen FROM groups WHERE gid=?', (gid,)).fetchone()
        if not row:
            return None
        if not hmac.compare_digest(row[0], node_key):
            raise Reject(409, 'exists')
        return {'ok': True, 'existed': True, 'gen': row[1]}

    def v_create(self, req):
        gid, inv = req.get('gid'), req.get('inv')
        if not isinstance(gid, str) or not RE_GID.match(gid):
            raise Reject(400, 'bad', 'gid 格式')
        if not isinstance(inv, str) or not RE_INV.match(inv):
            self.log('设备', '', 'invite.use', gid[:6], '拒绝', '没带邀请码或格式不对')
            raise Reject(403, 'invite')
        with self.lock:
            try:
                k = self.known(gid)
                if k and k['blocked_at']:
                    self.log('设备', '', 'invite.use', f'{inv} / {gid[:6]}', '拒绝', '组已封禁')
                    raise Reject(403, 'blocked')
                if self.purged(gid):
                    self.log('设备', '', 'invite.use', f'{inv} / {gid[:6]}', '拒绝', '组已移除，登记已彻底删除')
                    raise Reject(403, 'blocked')
                row = self.adb.execute('SELECT secret, expires, max_uses, used, revoked_at FROM invites WHERE id=?', (inv,)).fetchone()
                if not row:
                    self.log('设备', '', 'invite.use', f'{inv} / {gid[:6]}', '拒绝', '邀请码不存在')
                    raise Reject(403, 'invite')
                secret, expires, max_uses, used, revoked = row
                node_key = self._unwrap(hm(secret, b'km-invite'), gid, req)
                if node_key is None:
                    self.log('设备', '', 'invite.use', f'{inv} / {gid[:6]}', '拒绝', '邀请密钥错')
                    raise Reject(403, 'invite')
                if revoked:
                    self.log('设备', '', 'invite.use', f'{inv} / {gid[:6]}', '拒绝', '邀请码已作废')
                    raise Reject(403, 'invite')
                ex = self._existing(gid, node_key)
                if ex:
                    return 200, ex
                # 1.2.0：这个组号已经换钥（有了下一代组）。旧组被删后，被移除的设备不能凭旧组身份用邀请码把它重建出来
                if self.adb.execute('SELECT 1 FROM tombstones WHERE gid=?', (gid,)).fetchone():
                    self.log('设备', '', 'invite.use', f'{inv} / {gid[:6]}', '拒绝', '这个组已换钥，不能重建')
                    raise Reject(403, 'replaced')
                rebuild = bool(k and k['invite_id'] == inv)
                if not rebuild:
                    if expires < self.ms():
                        self.log('设备', '', 'invite.use', f'{inv} / {gid[:6]}', '拒绝', '邀请码已过期')
                        raise Reject(403, 'invite')
                    if used >= max_uses:
                        self.log('设备', '', 'invite.use', f'{inv} / {gid[:6]}', '拒绝', '邀请码已用完')
                        raise Reject(403, 'invite')
                self._new_group(gid, node_key)
                if rebuild:
                    note = '重建（节点数据丢失后）'
                else:
                    self.adb.execute('UPDATE invites SET used=used+1 WHERE id=?', (inv,))
                    if k:
                        self.adb.execute('UPDATE known_groups SET invite_id=? WHERE gid=?', (inv, gid))
                    else:
                        self.adb.execute('INSERT INTO known_groups(gid, invite_id, created) VALUES(?,?,?)', (gid, inv, self.ms()))
                    note = '新建组'
                self.ndb.commit()
                self.adb.commit()
                self.log('设备', '', 'invite.use', f'{inv} / {gid[:6]}', '成功', note)
                gen = self.ndb.execute('SELECT gen FROM groups WHERE gid=?', (gid,)).fetchone()[0]
                return 200, {'ok': True, 'rebuilt': rebuild, 'gen': gen}
            except BaseException:
                self.ndb.rollback()
                self.adb.rollback()
                raise

    def v_successor(self, gid, dev, req, node_key):
        new = req.get('gid')
        if not isinstance(new, str) or not RE_GID.match(new) or new == gid:
            raise Reject(400, 'bad', '新 gid 格式')
        nk = self._unwrap(node_key, new, req)
        if nk is None:
            raise Reject(401, 'auth', '包裹校验错')
        k = self.known(new)
        if (k and k['blocked_at']) or self.purged(new):
            raise Reject(403, 'blocked')
        ex = self._existing(new, nk)
        if ex:
            return 200, ex
        self._new_group(new, nk)
        parent = self.known(gid)
        inv = parent['invite_id'] if parent else None
        self.adb.execute('INSERT OR REPLACE INTO known_groups(gid, invite_id, parent_gid, created, note, quota_mb) VALUES(?,?,?,?,?,?)',
                         (new, inv, gid, self.ms(), parent['note'] if parent else None, parent['quota_mb'] if parent else None))
        self.adb.execute('INSERT OR IGNORE INTO tombstones(gid, successor, created) VALUES(?,?,?)', (gid, new, self.ms()))
        self.log('设备', '', 'successor', f'{gid[:6]} → {new[:6]}', '成功', '换钥后的新组')
        gen = self.ndb.execute('SELECT gen FROM groups WHERE gid=?', (new,)).fetchone()[0]
        return 200, {'ok': True, 'gen': gen}

    def _gen_seq(self, gid):
        return self.ndb.execute('SELECT gen, seq FROM groups WHERE gid=?', (gid,)).fetchone()

    def v_push(self, gid, dev, req, _nk):
        items = req.get('items')
        if not isinstance(items, list):
            raise Reject(400, 'bad', 'items')
        lim = self.limits()
        stale, now = [], self.ms()
        for it in items:
            if not isinstance(it, dict):
                raise Reject(400, 'bad', 'item')
            sec, rev, cid, data = it.get('sec'), it.get('rev'), it.get('cid', ''), it.get('data')
            if not isinstance(sec, str) or not RE_SEC.match(sec) or not isinstance(rev, int) or rev < 0 \
                    or not isinstance(cid, str) or not RE_CID.match(cid) or not isinstance(data, str):
                raise Reject(400, 'bad', 'item 字段')
            try:
                raw = b64d(data)
            except ValueError:
                raise Reject(400, 'bad', 'data 编码')
            if len(raw) > lim['sec_mb'] * MB:
                raise Reject(413, 'size', '单分区超限')
            row = self.ndb.execute('SELECT rev FROM slots WHERE gid=? AND dev=? AND sec=?', (gid, dev, sec)).fetchone()
            if row and row[0] >= rev:
                stale.append(sec)
                continue
            self.ndb.execute('UPDATE groups SET seq=seq+1 WHERE gid=?', (gid,))
            seq = self.ndb.execute('SELECT seq FROM groups WHERE gid=?', (gid,)).fetchone()[0]
            self.ndb.execute('INSERT OR REPLACE INTO slots(gid, dev, sec, rev, cid, seq, data, updated) VALUES(?,?,?,?,?,?,?,?)',
                             (gid, dev, sec, rev, cid, seq, raw, now))
        if self._recount(gid) > self.quota_bytes(gid):
            raise Reject(413, 'quota', '组空间超限')
        gen, seq = self._gen_seq(gid)
        return 200, {'ok': True, 'seq': seq, 'gen': gen, 'stale': stale}

    def v_pull(self, gid, dev, req, _nk):
        since = req.get('since', 0)
        if not isinstance(since, int) or since < 0:
            raise Reject(400, 'bad', 'since')
        budget = self.limits()['req_mb'] * MB
        out, size, more = [], 0, False
        for d, sec, rev, cid, seq, data in self.ndb.execute(
                'SELECT dev, sec, rev, cid, seq, data FROM slots WHERE gid=? AND seq>? AND dev<>? ORDER BY seq', (gid, since, dev)):
            if out and size + len(data) * 4 // 3 > budget:
                more = True
                break
            size += len(data) * 4 // 3 + 200
            out.append({'dev': d, 'sec': sec, 'rev': rev, 'cid': cid, 'seq': seq, 'data': b64e(data)})
        gen, gseq = self._gen_seq(gid)
        mail = self.ndb.execute("SELECT COUNT(*) FROM mail WHERE gid=? AND (to_dev=? OR to_dev='*') AND from_dev<>? AND expires>=?",
                                (gid, dev, dev, self.ms())).fetchone()[0]
        return 200, {'ok': True, 'gen': gen, 'seq': gseq, 'items': out, 'more': more, 'mail': mail}

    def v_forget(self, gid, dev, req, _nk):
        who = req.get('dev')
        if not isinstance(who, str) or not RE_DEV.match(who):
            raise Reject(400, 'bad', 'dev')
        n = self.ndb.execute('DELETE FROM slots WHERE gid=? AND dev=?', (gid, who)).rowcount
        self._recount(gid)
        return 200, {'ok': True, 'removed': n}

    def v_drop(self, gid, dev, req, _nk):
        self._delete_group_data(gid)
        self.adb.execute('DELETE FROM known_groups WHERE gid=? AND blocked_at IS NULL', (gid,))
        self.log('设备', '', 'drop', gid[:6], '成功', '设备删除了这个组（换钥后的旧组）')
        return 200, {'ok': True}

    def v_mail_put(self, gid, dev, req, _nk):
        to, data, ttl = req.get('to'), req.get('data'), req.get('ttl', 86400)
        if not isinstance(to, str) or not (to == '*' or RE_DEV.match(to)) or not isinstance(data, str) \
                or not isinstance(ttl, int) or not 600 <= ttl <= 60 * 86400:
            raise Reject(400, 'bad', 'mail 字段')
        try:
            raw = b64d(data)
        except ValueError:
            raise Reject(400, 'bad', 'data 编码')
        if len(raw) > MAIL_MAX:
            raise Reject(413, 'size', '信件太大')
        if self.ndb.execute('SELECT COUNT(*) FROM mail WHERE gid=?', (gid,)).fetchone()[0] >= MAIL_PER_GROUP:
            raise Reject(413, 'size', '信箱已满')
        mid = secrets.token_hex(8)
        now = self.ms()
        self.ndb.execute('INSERT INTO mail(id, gid, to_dev, from_dev, data, created, expires) VALUES(?,?,?,?,?,?,?)',
                         (mid, gid, to, dev, raw, now, now + ttl * 1000))
        if self._recount(gid) > self.quota_bytes(gid):
            raise Reject(413, 'quota', '组空间超限')
        return 200, {'ok': True, 'id': mid}

    def v_mail_get(self, gid, dev, req, _nk):
        rows = self.ndb.execute("SELECT id, from_dev, to_dev, data, created, expires FROM mail WHERE gid=? AND (to_dev=? OR to_dev='*') "
                                "AND from_dev<>? AND expires>=? ORDER BY created", (gid, dev, dev, self.ms())).fetchall()
        return 200, {'ok': True, 'items': [{'id': r[0], 'from': r[1], 'to': r[2], 'data': b64e(r[3]), 't': r[4], 'exp': r[5]} for r in rows]}

    def v_mail_del(self, gid, dev, req, _nk):
        ids = req.get('ids')
        if not isinstance(ids, list) or not all(isinstance(i, str) for i in ids):
            raise Reject(400, 'bad', 'ids')
        n = 0
        for i in ids[:500]:
            n += self.ndb.execute("DELETE FROM mail WHERE gid=? AND id=? AND (to_dev=? OR from_dev=?)", (gid, i, dev, dev)).rowcount
        self._recount(gid)
        return 200, {'ok': True, 'removed': n}

    def v_rdv(self, rid, req):
        if not RE_RDV.match(rid):
            raise Reject(400, 'bad', 'rdv id')
        op, side = req.get('op'), req.get('side')
        if op not in ('put', 'get') or side not in ('a', 'b'):
            raise Reject(400, 'bad', 'op/side')
        with self.lock:
            now = self.ms()
            rows = self.ndb.execute('SELECT side, n, data, created, expires FROM rdv WHERE id=? AND expires>=? ORDER BY n',
                                    (rid, now)).fetchall()
            if op == 'get':
                return 200, {'ok': True, 'items': [{'n': r[1], 'data': b64e(r[2])} for r in rows if r[0] != side]}
            data = req.get('data')
            try:
                raw = b64d(data) if isinstance(data, str) else None
            except ValueError:
                raw = None
            if raw is None:
                raise Reject(400, 'bad', 'data')
            if len(rows) >= RDV_MSGS or sum(len(r[2]) for r in rows) + len(raw) > RDV_MAX:
                raise Reject(413, 'size', '转交点已满')
            if not rows and self.ndb.execute('SELECT COUNT(DISTINCT id) FROM rdv WHERE expires>=?', (now,)).fetchone()[0] >= RDV_TOTAL:
                raise Reject(413, 'size', '转交点太多')
            expires = rows[0][4] if rows else now + RDV_TTL * 1000
            n = (rows[-1][1] + 1) if rows else 1
            self.ndb.execute('INSERT INTO rdv(id, side, n, data, created, expires) VALUES(?,?,?,?,?,?)', (rid, side, n, raw, now, expires))
            self.ndb.commit()
            return 200, {'ok': True, 'n': n, 'exp': expires}

    # ================================================================ 管理接口 /admin/v1

    def admin_key(self, kid):
        row = self.adb.execute('SELECT enc_key, last_ctr FROM admin_keys WHERE kid=?', (kid,)).fetchone()
        return row

    def _fail(self, ip, reason, kid='', op='auth', who='?'):
        """认证失败（管理接口和网页登录共用）：记安全日志，计数，必要时封 IP / 熔断。"""
        now = self.now()
        self.log(who, ip, op, kid, '拒绝', reason, sec=True)
        if is_local(ip):
            return
        q = self.fail_ip.setdefault(ip, deque())
        q.append(now)
        while q and q[0] < now - 600:
            q.popleft()
        if len(q) >= 5:
            self.adb.execute('INSERT OR REPLACE INTO bans VALUES(?, ?)', (ip, int((now + 3600) * 1000)))
            self.adb.commit()
            q.clear()
            self.log('系统', ip, 'ban', ip, '成功', '10 分钟内认证失败 5 次，封禁这个 IP 1 小时', sec=True)
        self.fail_all.append(now)
        while self.fail_all and self.fail_all[0] < now - 3600:
            self.fail_all.popleft()
        if len(self.fail_all) >= 30:
            self.set_setting('breaker_until', int((now + 3600) * 1000))
            self.adb.commit()
            self.fail_all.clear()
            self.log('系统', ip, 'breaker', '管理接口', '成功', '1 小时内认证失败合计 30 次，外网管理暂停 1 小时', sec=True)

    def _gate(self, ip, what='管理接口'):
        """外网来源的总闸（管理接口和网页登录共用）：封禁、熔断、关闭外网管理、IP 名单。返回 True = 拒绝。本机来源不受限。"""
        if is_local(ip):
            return False
        now = self.ms()
        ban = self.adb.execute('SELECT until FROM bans WHERE ip=?', (ip,)).fetchone()
        if ban and ban[0] > now:
            return True
        if (self.setting('breaker_until', 0) or 0) > now:
            return True
        if not self.setting('remote_admin', True):
            return True
        ips = self.setting('allow_ips', []) or []
        if ips and not ip_in(ip, ips):
            self._fail(ip, f'不在 IP 名单里（{what}）', op='web.login' if what == '网页登录' else 'auth')
            return True
        return False

    def _session(self, kid):
        return self.adb.execute('SELECT enc_key, last_ctr, user, last_used, expires FROM web_sessions WHERE kid=?', (kid,)).fetchone()

    def admin(self, body, ip, channel='node'):
        """返回 (状态码, dict 或 bytes 响应体, 额外响应头)。认证失败一律 403 {}。
        channel='node'（8787）只认管理密钥；channel='web'（443、127.0.0.1:8788）还认网页会话密钥。"""
        deny = (403, {}, {})
        if self.aes is None:
            return deny
        local = is_local(ip)
        with self.lock:
            if self._gate(ip):
                return deny
            try:
                env = json.loads(body.decode('utf-8'))
                kid, ctr = env['kid'], env['ctr']
                iv, ct = b64d(env['iv']), b64d(env['ct'])
                if env.get('v') != 1 or not isinstance(kid, str) or not re.fullmatch(r'[0-9a-f]{8}', kid) \
                        or not isinstance(ctr, int) or isinstance(ctr, bool) or ctr <= 0 or len(iv) != 12:
                    raise ValueError
            except Exception:  # noqa: BLE001
                self._fail(ip, '请求格式不对')
                return deny
            row = self.admin_key(kid)
            ident = None
            if row:
                enc_key, last = row
                ident = {'kind': 'key', 'kid': kid}
            elif channel == 'web':
                s = self._session(kid)
                if s:
                    enc_key, last, user, last_used, expires = s
                    now = self.ms()
                    if last_used + WEB_IDLE * 1000 < now or expires < now:
                        # 过期的会话：不算认证失败（网页同时发几个请求时不至于把自己的 IP 封掉）
                        self.log(f'网页 {user}', ip, 'auth', kid[:4], '拒绝', '网页会话已过期')
                        return deny
                    ident = {'kind': 'web', 'kid': kid, 'user': user}
            if not ident:
                self._fail(ip, 'kid 不对', kid)
                return deny
            aead = self.aes(enc_key)
            try:
                plain = aead.decrypt(iv, ct, f'km-admin-req|{kid}|{ctr}'.encode())
            except Exception:  # noqa: BLE001
                self._fail(ip, '解不开（密钥不对或被篡改）', kid)
                return deny
            if ctr <= last:
                self._fail(ip, '计数重复（重放或计数变小）', kid)
                # 只有持有密钥的人能看懂的提示：告诉合法客户端上次的计数，让它用更大的重试
                hiv = secrets.token_bytes(12)
                hint = aead.encrypt(hiv, json.dumps({'last': last}, separators=(',', ':')).encode(), f'km-admin-retry|{kid}|{ctr}'.encode())
                return 403, {}, {'X-KM-Retry': b64e(hiv) + '.' + b64e(hint)}
            if ident['kind'] == 'key':
                self.adb.execute('UPDATE admin_keys SET last_ctr=? WHERE kid=?', (ctr, kid))
            else:
                self.adb.execute('UPDATE web_sessions SET last_ctr=?, last_used=? WHERE kid=?', (ctr, self.ms(), kid))
            self.adb.commit()
            if not local:
                q = self.kid_hits.setdefault(kid, deque())
                t = self.now()
                while q and q[0] < t - 60:
                    q.popleft()
                if len(q) >= 120:
                    return 429, {}, {}
                q.append(t)
            try:
                req = json.loads(plain.decode('utf-8'))
                op, args = req.get('op'), req.get('args') or {}
                if not isinstance(op, str) or not isinstance(args, dict):
                    raise ValueError
            except Exception:  # noqa: BLE001
                op, args = None, {}
            self.cur = ident
            try:
                result = self.admin_op(op, args, ident, ip)
            finally:
                self.cur = None
            riv = secrets.token_bytes(12)
            rct = aead.encrypt(riv, json.dumps(result, ensure_ascii=False, separators=(',', ':')).encode('utf-8'), f'km-admin-resp|{kid}|{ctr}'.encode())
            return 200, {'iv': b64e(riv), 'ct': b64e(rct)}, {}

    READ_OPS = ('status', 'groups.list', 'invites.list', 'log.list', 'web.status', 'web.sessions', 'web.whoami')
    KEY_ONLY_OPS = ('web.status', 'web.setPassword', 'web.setEnabled', 'web.totpReset', 'web.reset', 'admin.rotateKey')
    SESSION_ONLY_OPS = ('web.changePassword', 'web.totpBegin', 'web.totpConfirm', 'web.totpDisable', 'web.whoami', 'web.logout')

    @staticmethod
    def who_of(ident):
        if not ident:
            return '?'
        return f'管理员 {ident["kid"]}' if ident['kind'] == 'key' else f'网页 {ident["user"]}（会话 {ident["kid"][:4]}）'

    def admin_op(self, op, args, ident, ip):
        if isinstance(ident, str):        # 兼容旧调用：直接传 kid
            ident = {'kind': 'key', 'kid': ident}
        fn = getattr(self, 'op_' + op.replace('.', '_'), None) if isinstance(op, str) and re.fullmatch(r'[a-z]+(\.[a-zA-Z]+)?', op) else None
        who = self.who_of(ident)
        if not fn:
            self.log(who, ip, str(op)[:30], '', '失败', '没有这个操作')
            return {'ok': False, 'err': 'op', 'msg': '没有这个操作'}
        if op in self.KEY_ONLY_OPS and ident['kind'] != 'key':
            self.log(who, ip, op, '', '失败', '网页上不能做这个操作（只能在审批 App 里做）')
            return {'ok': False, 'err': 'perm', 'msg': '网页上不能做这个操作，请在审批 App 里做'}
        if op in self.SESSION_ONLY_OPS and ident['kind'] != 'web':
            self.log(who, ip, op, '', '失败', '这个操作只能在网页后台里做')
            return {'ok': False, 'err': 'perm', 'msg': '这个操作只能在网页后台里做'}
        try:
            data, obj, note = fn(args, ip)
            self.ndb.commit()
            self.adb.commit()
            if op not in self.READ_OPS:
                self.log(who, ip, op, obj, '成功', note)
            return {'ok': True, 'data': data}
        except OpError as e:
            self.ndb.rollback()
            self.adb.rollback()
            if op not in self.READ_OPS:
                self.log(who, ip, op, str(args.get('gid') or args.get('id') or args.get('kid') or '')[:8], '失败', e.msg)
            return {'ok': False, 'err': e.code, 'msg': e.msg}

    # ---------- 各操作：返回 (data, 日志对象, 日志说明)
    @staticmethod
    def _gid_arg(args):
        gid = args.get('gid')
        if not isinstance(gid, str) or not RE_GID.match(gid):
            raise OpError('组号不对')
        return gid

    def op_status(self, args, ip):
        du = shutil.disk_usage(self.data_dir)
        size = lambda p: sum(os.path.getsize(p + s) for s in ('', '-wal') if os.path.exists(p + s))  # noqa: E731
        expiry = self.setting('expiry', DEFAULT_EXPIRY)
        today = datetime.datetime.fromtimestamp(self.now(), CN_TZ).date()
        days = (datetime.date.fromisoformat(expiry) - today).days
        total = self.ndb.execute('SELECT COUNT(*), COALESCE(SUM(bytes),0) FROM groups').fetchone()
        h = int(self.now() // 3600)
        req = sum(v[0] for k, v in self.hours.items() if k > h - 24)
        err = sum(v[1] for k, v in self.hours.items() if k > h - 24)
        return {
            'version': VERSION, 'proto': PROTO, 'started': int(self.started * 1000), 'uptime': int(self.now() - self.started),
            'now': self.ms(), 'disk_total': du.total, 'disk_free': du.free,
            'node_db': size(self.ndb_path), 'admin_db': size(self.adb_path),
            'groups': total[0], 'bytes': total[1], 'requests_24h': req, 'errors_24h': err,
            'expiry': expiry, 'days_left': days, 'limits': self.limits(),
            'remote_admin': bool(self.setting('remote_admin', True)), 'allow_ips': self.setting('allow_ips', []) or [],
            'breaker_until': self.setting('breaker_until', 0) or 0,
            'your_ip': ip, 'host': self.public_host, 'port': self.public_port,
            'tls': self.tls.status(self.ms()) if self.tls else {'enabled': False, 'not_after': None, 'hours_left': None, 'issuer': '', 'err': '没有配置 443'},
            'web': self.web_summary(),
        }, '', ''

    def op_groups_list(self, args, ip):
        groups = {}
        for gid, seq, bts, created, last_seen in self.ndb.execute('SELECT gid, seq, bytes, created, last_seen FROM groups'):
            groups[gid] = {'gid': gid, 'live': True, 'bytes': bts, 'created': created, 'last_seen': last_seen, 'devices': []}
        for k in self.adb.execute('SELECT gid, invite_id, parent_gid, created, blocked_at, note, quota_mb FROM known_groups'):
            g = groups.setdefault(k[0], {'gid': k[0], 'live': False, 'bytes': 0, 'created': k[3], 'last_seen': None, 'devices': []})
            g.update({'invite': k[1], 'parent': k[2], 'blocked_at': k[4], 'note': k[5] or '', 'quota_mb': k[6]})
        labels = dict(self.adb.execute('SELECT id, label FROM invites').fetchall())
        default_mb = self.limits()['group_mb']
        for gid, g in groups.items():
            g.setdefault('invite', None)
            g.setdefault('parent', None)
            g.setdefault('blocked_at', None)
            g.setdefault('note', '')
            g.setdefault('quota_mb', None)
            g['invite_label'] = labels.get(g['invite'], '') if g['invite'] else ''
            g['quota'] = (g['quota_mb'] or default_mb) * MB
            devs = {}
            for dev, last_seen in self.ndb.execute('SELECT dev, last_seen FROM counters WHERE gid=?', (gid,)):
                devs[dev] = {'dev': dev[:6], 'last_seen': last_seen, 'last_upload': None, 'sections': 0, 'bytes': 0}
            for dev, n, b, up in self.ndb.execute('SELECT dev, COUNT(*), SUM(LENGTH(data)), MAX(updated) FROM slots WHERE gid=? GROUP BY dev', (gid,)):
                d = devs.setdefault(dev, {'dev': dev[:6], 'last_seen': None})
                d.update({'last_upload': up, 'sections': n, 'bytes': b})
            g['devices'] = sorted(devs.values(), key=lambda d: -(d['last_seen'] or 0))
        return sorted(groups.values(), key=lambda g: -(g['last_seen'] or g['created'] or 0)), '', ''

    def op_groups_clear(self, args, ip):
        gid = self._gid_arg(args)
        if not self.ndb.execute('SELECT 1 FROM groups WHERE gid=?', (gid,)).fetchone():
            raise OpError('这个组在节点上没有数据')
        self.ndb.execute('DELETE FROM slots WHERE gid=?', (gid,))
        self.ndb.execute('DELETE FROM mail WHERE gid=?', (gid,))
        self.ndb.execute('UPDATE groups SET gen=? WHERE gid=?', (secrets.token_hex(4), gid))
        self._recount(gid)
        return {}, gid[:6], '清空数据（设备下次同步会重新上传）'

    def op_groups_remove(self, args, ip):
        gid = self._gid_arg(args)
        k = self.known(gid)
        if k and k['blocked_at']:
            raise OpError('这个组已经被移除了')
        if not k and not self.ndb.execute('SELECT 1 FROM groups WHERE gid=?', (gid,)).fetchone():
            raise OpError('没有这个组')
        self._delete_group_data(gid)
        if k:
            self.adb.execute('UPDATE known_groups SET blocked_at=? WHERE gid=?', (self.ms(), gid))
        else:
            self.adb.execute('INSERT INTO known_groups(gid, created, blocked_at) VALUES(?,?,?)', (gid, self.ms(), self.ms()))
        return {}, gid[:6], '移除并封禁'

    def op_groups_unblock(self, args, ip):
        gid = self._gid_arg(args)
        k = self.known(gid)
        if not k or not k['blocked_at']:
            raise OpError('这个组没有被封禁')
        self.adb.execute('UPDATE known_groups SET blocked_at=NULL WHERE gid=?', (gid,))
        return {}, gid[:6], '解除封禁'

    def op_groups_purge(self, args, ip):
        """彻底删除「已移除并封禁、节点上没有数据」的组登记（1.3.0）：从列表里消失，但组号记进永久墓碑，
        设备再来建组、重建、同步一律 403 blocked，也不能再解除封禁。"""
        gid = self._gid_arg(args)
        k = self.known(gid)
        if not k or not k['blocked_at']:
            raise OpError('只能彻底删除「已移除并封禁」的组')
        if self.ndb.execute('SELECT 1 FROM groups WHERE gid=?', (gid,)).fetchone() or \
                self.ndb.execute('SELECT 1 FROM slots WHERE gid=? UNION SELECT 1 FROM mail WHERE gid=?', (gid, gid)).fetchone():
            raise OpError('这个组在节点上还有数据，不能彻底删除')
        now = self.ms()
        if self.adb.execute('UPDATE tombstones SET purged=? WHERE gid=?', (now, gid)).rowcount == 0:
            self.adb.execute('INSERT INTO tombstones(gid, successor, created, purged) VALUES(?,?,?,?)', (gid, None, now, now))
        self.adb.execute('DELETE FROM known_groups WHERE gid=?', (gid,))
        inv = f'，来源邀请码 {k["invite_id"]}' if k['invite_id'] else ''
        return {}, gid[:6], f'彻底删除登记（组号永久封禁，不能再建、不能解除封禁{inv}）'

    def _ensure_known(self, gid):
        if self.known(gid):
            return
        row = self.ndb.execute('SELECT created FROM groups WHERE gid=?', (gid,)).fetchone()
        if not row:
            raise OpError('没有这个组')
        self.adb.execute('INSERT INTO known_groups(gid, created) VALUES(?,?)', (gid, row[0]))

    def op_groups_setQuota(self, args, ip):
        gid = self._gid_arg(args)
        mb = args.get('mb')
        if mb is not None and (not isinstance(mb, int) or isinstance(mb, bool) or not 1 <= mb <= 500):
            raise OpError('空间上限要在 1–500 MB 之间')
        self._ensure_known(gid)
        self.adb.execute('UPDATE known_groups SET quota_mb=? WHERE gid=?', (mb, gid))
        return {}, gid[:6], f'空间上限改为 {mb} MB' if mb else '空间上限改为默认'

    def op_groups_setNote(self, args, ip):
        gid = self._gid_arg(args)
        note = args.get('note', '')
        if not isinstance(note, str) or len(note) > 40:
            raise OpError('备注最多 40 个字')
        self._ensure_known(gid)
        self.adb.execute('UPDATE known_groups SET note=? WHERE gid=?', (note.strip(), gid))
        return {}, gid[:6], f'备注改为「{note.strip()}」'

    def invite_qr(self, iid, secret):
        s = base64.b32encode(secret).decode('ascii').rstrip('=')
        return f'kmnode:1?h={self.public_host}&p={self.public_port}&i={iid}&s={s}'

    def create_invite(self, label, days, uses):
        iid = ''.join(secrets.choice(INV_ALPHABET) for _ in range(8))
        secret = secrets.token_bytes(20)
        now = self.ms()
        self.adb.execute('INSERT INTO invites(id, secret, label, created, expires, max_uses, used) VALUES(?,?,?,?,?,?,0)',
                         (iid, secret, label, now, now + days * 86400000, uses))
        return {'id': iid, 'qr': self.invite_qr(iid, secret), 'expires': now + days * 86400000}

    def op_invites_create(self, args, ip):
        label, days, uses = args.get('label', ''), args.get('days'), args.get('uses')
        if not isinstance(label, str) or len(label.strip()) > 20:
            raise OpError('备注最多 20 个字')
        if not isinstance(days, int) or isinstance(days, bool) or not 1 <= days <= 90:
            raise OpError('有效期要在 1–90 天之间')
        if not isinstance(uses, int) or isinstance(uses, bool) or not 1 <= uses <= 50:
            raise OpError('可用次数要在 1–50 次之间')
        inv = self.create_invite(label.strip(), days, uses)
        return inv, inv['id'], f'生成邀请码「{label.strip()}」{days} 天 {uses} 次'

    def op_invites_list(self, args, ip):
        now = self.ms()
        used_by = dict(self.adb.execute('SELECT invite_id, COUNT(*) FROM known_groups WHERE invite_id IS NOT NULL GROUP BY invite_id').fetchall())
        out = []
        for iid, secret, label, created, expires, max_uses, used, revoked in self.adb.execute(
                'SELECT id, secret, label, created, expires, max_uses, used, revoked_at FROM invites ORDER BY created DESC'):
            state = 'revoked' if revoked else 'expired' if expires < now else 'used' if used >= max_uses else 'ok'
            out.append({'id': iid, 'label': label or '', 'created': created, 'expires': expires, 'max_uses': max_uses, 'used': used,
                        'revoked_at': revoked, 'state': state, 'groups': used_by.get(iid, 0), 'qr': self.invite_qr(iid, secret)})
        return out, '', ''

    def op_invites_revoke(self, args, ip):
        iid = args.get('id')
        if not isinstance(iid, str) or not RE_INV.match(iid):
            raise OpError('邀请号不对')
        row = self.adb.execute('SELECT revoked_at FROM invites WHERE id=?', (iid,)).fetchone()
        if not row:
            raise OpError('没有这张邀请码')
        if row[0]:
            raise OpError('这张邀请码已经作废了')
        self.adb.execute('UPDATE invites SET revoked_at=? WHERE id=?', (self.ms(), iid))
        return {}, iid, '作废邀请码'

    def op_limits_set(self, args, ip):
        lim = self.limits()
        names = {'max_groups': '最多组数', 'group_mb': '每组默认空间（MB）', 'sec_mb': '单分区（MB）', 'req_mb': '单请求（MB）',
                 'ip_rate': '每 IP 每 10 分钟次数'}
        for k, (lo, hi) in LIMIT_RANGES.items():
            if k in args:
                v = args[k]
                if not isinstance(v, int) or isinstance(v, bool) or not lo <= v <= hi:
                    raise OpError(f'{names[k]}要在 {lo}–{hi} 之间')
                lim[k] = v
        if lim['sec_mb'] > lim['req_mb']:
            raise OpError('单分区不能大于单请求')
        self.set_setting('limits', lim)
        return lim, '限额', '，'.join(f'{names[k]} {lim[k]}' for k in LIMIT_RANGES)

    def op_expiry_set(self, args, ip):
        d = args.get('date')
        try:
            if not isinstance(d, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', d):
                raise ValueError
            datetime.date.fromisoformat(d)
        except ValueError:
            raise OpError('日期格式是 YYYY-MM-DD')
        self.set_setting('expiry', d)
        return {}, '到期日', f'改为 {d}'

    def op_access_set(self, args, ip):
        remote, ips = args.get('remote'), args.get('ips', [])
        if not isinstance(remote, bool) or not isinstance(ips, list) or len(ips) > 50:
            raise OpError('参数不对')
        clean = []
        for n in ips:
            if not isinstance(n, str):
                raise OpError('IP 名单格式不对')
            n = n.strip()
            if not n:
                continue
            try:
                ipaddress.ip_network(n, strict=False)
            except ValueError:
                raise OpError(f'「{n}」不是 IP 或网段')
            clean.append(n)
        if self.cur and self.cur['kind'] == 'web' and remote != bool(self.setting('remote_admin', True)):
            raise OpError('网页上不能改「外网管理」开关（会把自己和审批 App 一起关在外面），请在审批 App 里改', 'perm')
        if not is_local(ip):
            if clean and not ip_in(ip, clean):
                raise OpError(f'名单里没有你现在的 IP {ip}，保存后你会被锁在外面', 'self')
        self.set_setting('remote_admin', remote)
        self.set_setting('allow_ips', clean)
        return {'remote': remote, 'ips': clean}, '访问', ('外网管理开' if remote else '外网管理关') + (f'，IP 名单 {len(clean)} 条' if clean else '，不限 IP')

    def op_log_list(self, args, ip):
        before, limit, sec = args.get('before'), args.get('limit', 50), bool(args.get('sec'))
        if not isinstance(limit, int) or not 1 <= limit <= 500:      # 1.3.0 起 500（导出日志时一页多取些）
            raise OpError('limit 要在 1–500 之间')
        sql, p = 'SELECT id, t, who, ip, op, obj, result, note, sec FROM log WHERE 1=1', []
        if isinstance(before, int):
            sql += ' AND id<?'
            p.append(before)
        if sec:
            sql += ' AND sec=1'
        rows = self.adb.execute(sql + ' ORDER BY id DESC LIMIT ?', p + [limit + 1]).fetchall()
        keys = ('id', 't', 'who', 'ip', 'op', 'obj', 'result', 'note', 'sec')
        return {'items': [dict(zip(keys, r)) for r in rows[:limit]], 'more': len(rows) > limit}, '', ''

    # ================================================================ 网页后台：账号、会话、二次验证

    def web_user(self):
        row = self.adb.execute('SELECT user, pw_hash, totp_secret, totp_pending, totp_last_step, enabled, pw_changed, fail_times '
                               'FROM web_user WHERE id=1').fetchone()
        keys = ('user', 'pw_hash', 'totp_secret', 'totp_pending', 'totp_last_step', 'enabled', 'pw_changed', 'fail_times')
        if not row:
            return {'user': 'admin', 'pw_hash': None, 'totp_secret': None, 'totp_pending': None, 'totp_last_step': 0,
                    'enabled': 0, 'pw_changed': None, 'fail_times': '[]'}
        return dict(zip(keys, row))

    def _save_web_user(self, u):
        self.adb.execute('INSERT OR REPLACE INTO web_user(id, user, pw_hash, totp_secret, totp_pending, totp_last_step, enabled, pw_changed, fail_times) '
                         'VALUES(1,?,?,?,?,?,?,?,?)', (u['user'], u['pw_hash'], u['totp_secret'], u['totp_pending'], u['totp_last_step'] or 0,
                                                     1 if u['enabled'] else 0, u['pw_changed'], u['fail_times'] or '[]'))

    def _account_fails(self, u):
        try:
            t = [x for x in json.loads(u['fail_times'] or '[]') if isinstance(x, int) and x > self.ms() - 3600000]
        except ValueError:
            t = []
        return t

    def _revoke_sessions(self, keep=None):
        if keep:
            return self.adb.execute('DELETE FROM web_sessions WHERE kid<>?', (keep,)).rowcount
        return self.adb.execute('DELETE FROM web_sessions').rowcount

    def web_summary(self):
        u = self.web_user()
        n = self.adb.execute('SELECT COUNT(*) FROM web_sessions WHERE expires>=? AND last_used>=?',
                             (self.ms(), self.ms() - WEB_IDLE * 1000)).fetchone()[0]
        return {'enabled': bool(u['enabled'] and u['pw_hash']), 'user': u['user'] if u['pw_hash'] else '', 'has_password': bool(u['pw_hash']),
                'totp': bool(u['totp_secret']), 'sessions': n, 'pw_changed': u['pw_changed'], 'url': self.web_url,
                'paused': len(self._account_fails(u)) >= WEB_ACCOUNT_FAILS}

    def web_login(self, body, ip, ua=''):
        """POST /admin/web/login {user, pw, code?} → 200 {ok, kid, key, user, idle, expires}；失败 403 {err, msg}。
        失败和管理接口的认证失败进同一套计数（封 IP、熔断）；另有账号级：1 小时 10 次失败 → 网页登录暂停 1 小时。"""
        fail = (403, {'err': 'login', 'msg': LOGIN_FAIL_MSG})
        local = is_local(ip)
        with self.lock:
            if self._gate(ip, '网页登录'):
                return 403, {'err': 'denied', 'msg': LOGIN_DENIED_MSG}
            u = self.web_user()
            if not local and len(self._account_fails(u)) >= WEB_ACCOUNT_FAILS:
                self._fail(ip, '网页登录暂停中（账号 1 小时内失败 10 次）', op='web.login')
                return 403, {'err': 'paused', 'msg': LOGIN_PAUSED_MSG}
        try:
            req = json.loads(body.decode('utf-8'))
            user, pw, code = req.get('user'), req.get('pw'), req.get('code') or ''
            if not isinstance(user, str) or not isinstance(pw, str) or not isinstance(code, str):
                raise ValueError
        except Exception:  # noqa: BLE001
            user, pw, code = '', '', ''
        # scrypt 很慢，不占着节点的锁（设备同步不用等）；它自己有一把锁，同一时间只算一个
        pw_ok = pw_check(pw, u['pw_hash'])
        with self.lock:
            u = self.web_user()       # 算哈希期间可能被改过，重读
            reason, step = None, None
            if not u['pw_hash']:
                reason = '还没设置网页密码'
            elif not u['enabled']:
                reason = '网页登录已关闭'
            elif not hmac.compare_digest(user.strip().encode(), u['user'].encode()):
                reason = '用户名不对'
            elif not pw_ok:
                reason = '密码不对'
            elif u['totp_secret']:
                step = totp_match(u['totp_secret'], code, self.now(), u['totp_last_step'])
                if step is None:
                    reason = '验证码不对或已用过' if code else '没填验证码'
            shown = re.sub(r'[^\w.@-]', '', user)[:32] or '?'
            if reason:
                self._fail(ip, '网页登录失败：' + reason, op='web.login', who=f'网页 {shown}')
                if u['pw_hash'] and not local:
                    t = self._account_fails(u) + [self.ms()]
                    u['fail_times'] = json.dumps(t[-50:])
                    self._save_web_user(u)
                    if len(t) == WEB_ACCOUNT_FAILS:
                        self.log('系统', ip, 'web.pause', u['user'], '成功', '网页账号 1 小时内失败 10 次，网页登录暂停 1 小时（审批 App 不受影响）', sec=True)
                    self.adb.commit()
                return fail
            if step is not None:
                u['totp_last_step'] = step
            u['fail_times'] = '[]'
            self._save_web_user(u)
            key = secrets.token_bytes(32)
            while True:
                kid = secrets.token_hex(4)
                if not self.admin_key(kid) and not self._session(kid):
                    break
            now = self.ms()
            ua = re.sub(r'[\x00-\x1f]', '', ua or '')[:160]
            self.adb.execute('INSERT INTO web_sessions(kid, enc_key, last_ctr, user, created, last_used, expires, ip, ua) VALUES(?,?,0,?,?,?,?,?,?)',
                             (kid, hm(key, b'km-admin-enc-v1'), u['user'], now, now, now + WEB_MAX_AGE * 1000, ip, ua))
            old = self.adb.execute('SELECT kid FROM web_sessions ORDER BY created DESC, rowid DESC LIMIT -1 OFFSET ?', (WEB_MAX_SESSIONS,)).fetchall()
            for (k,) in old:
                self.adb.execute('DELETE FROM web_sessions WHERE kid=?', (k,))
                self.log('系统', ip, 'web.revoke', k[:4], '成功', f'同时登录超过 {WEB_MAX_SESSIONS} 个，踢掉最早的会话')
            self.adb.commit()
            self.log(f'网页 {u["user"]}（会话 {kid[:4]}）', ip, 'web.login', kid[:4], '成功', '登录' + ('（二次验证）' if step is not None else '') + (f'，浏览器 {ua[:60]}' if ua else ''))
            return 200, {'ok': True, 'kid': kid, 'key': b64e(key), 'user': u['user'], 'idle': WEB_IDLE, 'expires': now + WEB_MAX_AGE * 1000}

    # ---------- 只有管理密钥 K（审批 App）能做
    def op_web_status(self, args, ip):
        return self.web_summary(), '', ''

    def op_web_setPassword(self, args, ip):
        user, pw = args.get('user', 'admin'), args.get('pw')
        if not isinstance(user, str) or not RE_USER.match(user.strip()):
            raise OpError('用户名要 3–32 位字母或数字')
        user = user.strip()
        bad = pw_problem(pw, user, self.public_host)
        if bad:
            raise OpError(bad)
        u = self.web_user()
        u.update({'user': user, 'pw_hash': pw_hash(pw), 'enabled': 1, 'pw_changed': self.ms(), 'fail_times': '[]'})
        self._save_web_user(u)
        n = self._revoke_sessions()
        return self.web_summary(), user, f'设置网页用户名和密码（用户名 {user}），网页登录打开' + (f'，{n} 个网页会话已失效' if n else '')

    def op_web_setEnabled(self, args, ip):
        on = args.get('enabled')
        if not isinstance(on, bool):
            raise OpError('参数不对')
        u = self.web_user()
        if on and not u['pw_hash']:
            raise OpError('还没设置网页密码，先设密码')
        u['enabled'] = 1 if on else 0
        if on:
            u['fail_times'] = '[]'
        self._save_web_user(u)
        n = 0 if on else self._revoke_sessions()
        return self.web_summary(), '网页登录', ('打开网页登录' if on else '关闭网页登录') + (f'，{n} 个网页会话已失效' if n else '')

    def op_web_totpReset(self, args, ip):
        u = self.web_user()
        if not u['totp_secret'] and not u['totp_pending']:
            raise OpError('二次验证本来就没开')
        u['totp_secret'] = u['totp_pending'] = None
        self._save_web_user(u)
        return self.web_summary(), '二次验证', '在审批 App 里关闭网页二次验证（之后只用密码登录）'

    def op_web_reset(self, args, ip):
        u = self.web_user()
        if not u['pw_hash'] and not u['totp_secret']:
            raise OpError('网页登录本来就没设置')
        self.adb.execute('DELETE FROM web_user')
        n = self._revoke_sessions()
        return self.web_summary(), '网页登录', f'清空网页用户名、密码和二次验证（{n} 个网页会话已失效），网页登录关闭'

    # ---------- K 和网页都能做：看会话、踢会话
    def op_web_sessions(self, args, ip):
        now, me = self.ms(), self.cur['kid'] if self.cur else None
        out = []
        for kid, user, created, last_used, expires, sip, ua in self.adb.execute(
                'SELECT kid, user, created, last_used, expires, ip, ua FROM web_sessions ORDER BY created DESC'):
            alive = expires >= now and last_used + WEB_IDLE * 1000 >= now
            out.append({'kid': kid, 'user': user, 'created': created, 'last_used': last_used, 'expires': min(expires, last_used + WEB_IDLE * 1000),
                        'ip': sip, 'ua': ua, 'alive': alive, 'current': kid == me})
        return out, '', ''

    def op_web_revoke(self, args, ip):
        if args.get('all') is True:
            n = self._revoke_sessions()
            return {'removed': n}, '全部会话', f'踢掉全部网页会话（{n} 个）'
        kid = args.get('kid')
        if not isinstance(kid, str) or not re.fullmatch(r'[0-9a-f]{8}', kid):
            raise OpError('会话号不对')
        n = self.adb.execute('DELETE FROM web_sessions WHERE kid=?', (kid,)).rowcount
        if not n:
            raise OpError('没有这个会话（可能已经过期或退出）')
        return {'removed': n}, kid[:4], '踢下线'

    # ---------- 只有网页会话能做
    def _need_pw(self, pw):
        u = self.web_user()
        if not pw_check(pw if isinstance(pw, str) else '', u['pw_hash']):
            raise OpError('当前密码不对', 'pw')
        return u

    def op_web_whoami(self, args, ip):
        kid = self.cur['kid']
        row = self.adb.execute('SELECT user, created, last_used, expires, ip FROM web_sessions WHERE kid=?', (kid,)).fetchone()
        u = self.web_user()
        return {'user': row[0], 'kid': kid, 'created': row[1], 'expires': row[3], 'idle': WEB_IDLE, 'ip': row[4], 'totp': bool(u['totp_secret'])}, '', ''

    def op_web_logout(self, args, ip):
        self.adb.execute('DELETE FROM web_sessions WHERE kid=?', (self.cur['kid'],))
        return {}, self.cur['kid'][:4], '退出'

    def op_web_changePassword(self, args, ip):
        u = self._need_pw(args.get('old'))
        new = args.get('new')
        bad = pw_problem(new, u['user'], self.public_host)
        if bad:
            raise OpError(bad)
        if pw_check(new, u['pw_hash']):
            raise OpError('新密码和旧密码一样')
        u.update({'pw_hash': pw_hash(new), 'pw_changed': self.ms()})
        self._save_web_user(u)
        n = self._revoke_sessions()
        return {'revoked': n}, u['user'], f'网页上改密码，全部 {n} 个网页会话已失效（要重新登录）'

    def op_web_totpBegin(self, args, ip):
        u = self._need_pw(args.get('pw'))
        if u['totp_secret']:
            raise OpError('二次验证已经开着')
        sec = secrets.token_bytes(20)
        u['totp_pending'] = sec
        self._save_web_user(u)
        label = f'km-sync:{u["user"]}@{self.public_host}'
        return {'secret': b32(sec), 'uri': f'otpauth://totp/{label}?secret={b32(sec)}&issuer=km-sync&algorithm=SHA1&digits=6&period=30'}, \
            '二次验证', '开始开启二次验证（还没生效）'

    def op_web_totpConfirm(self, args, ip):
        u = self.web_user()
        if not u['totp_pending']:
            raise OpError('请先点「开启二次验证」')
        step = totp_match(u['totp_pending'], args.get('code'), self.now(), 0)
        if step is None:
            raise OpError('验证码不对：请输入手机验证器上当前显示的 6 位数字', 'code')
        u.update({'totp_secret': u['totp_pending'], 'totp_pending': None, 'totp_last_step': step})
        self._save_web_user(u)
        return self.web_summary(), '二次验证', '开启二次验证'

    def op_web_totpDisable(self, args, ip):
        u = self._need_pw(args.get('pw'))
        if not u['totp_secret']:
            raise OpError('二次验证本来就没开')
        step = totp_match(u['totp_secret'], args.get('code'), self.now(), u['totp_last_step'])
        if step is None:
            raise OpError('验证码不对或已用过', 'code')
        u.update({'totp_secret': None, 'totp_pending': None, 'totp_last_step': step})
        self._save_web_user(u)
        return self.web_summary(), '二次验证', '网页上关闭二次验证'

    def reset_web_login(self):
        self.adb.execute('DELETE FROM web_user')
        n = self._revoke_sessions()
        self.adb.commit()
        self.log('系统', '', 'web.reset', '网页登录', '成功', f'经 SSH 清空网页用户名、密码、二次验证和 {n} 个会话，网页登录关闭')

    # ---------- 审批 App 里换管理密钥（1.3.0，只有管理密钥 K 能做）
    def op_admin_rotateKey(self, args, ip):
        """App 生成新的 32 字节 K'，装在用旧 K 加密的请求里发来；换上后旧 K 立即失效（响应仍用旧 K 加密）。
        和 deploy.ps1 -NewAdminKey 一样只保留一把管理密钥；电脑上 signing/sync-node.json 里的旧管理码随之失效。"""
        try:
            k = b64d(args.get('key', ''))
        except ValueError:
            k = b''
        if len(k) != 32 or len(set(k)) < 8:
            raise OpError('新的管理密钥格式不对（要 32 字节随机数）')
        kid = hashlib.sha256(k).hexdigest()[:8]
        old = self.cur['kid'] if self.cur else ''
        if kid == old or self.admin_key(kid) or self._session(kid):
            raise OpError('新的管理密钥和现有的撞了，请再试一次')
        self.adb.execute('DELETE FROM admin_keys')
        self.adb.execute('INSERT INTO admin_keys(kid, enc_key, last_ctr, created) VALUES(?,?,0,?)', (kid, hm(k, b'km-admin-enc-v1'), self.ms()))
        self.kid_hits.pop(old, None)
        return {'kid': kid}, kid, f'在审批 App 里换管理密钥：旧 kid {old} 立即失效，新 kid {kid}（电脑上的旧管理码也失效）'

    # ---------- 命令行（部署脚本用）
    def new_admin_key(self):
        k = secrets.token_bytes(32)
        kid = hashlib.sha256(k).hexdigest()[:8]
        self.adb.execute('DELETE FROM admin_keys')
        self.adb.execute('INSERT INTO admin_keys(kid, enc_key, last_ctr, created) VALUES(?,?,0,?)',
                         (kid, hm(k, b'km-admin-enc-v1'), self.ms()))
        self.adb.commit()
        self.log('系统', '', 'admin.key', kid, '成功', '生成新的管理密钥（旧的立即失效）')
        return {'kid': kid, 'key': b64e(k), 'admin_qr': f'kmadmin:1?h={self.public_host}&p={self.public_port}&k={b64e(k)}'}

    def reset_access(self):
        self.adb.execute('DELETE FROM bans')
        self.set_setting('breaker_until', 0)
        self.set_setting('allow_ips', [])
        self.set_setting('remote_admin', True)
        self.adb.execute("UPDATE web_user SET fail_times='[]'")
        self.adb.commit()
        self.fail_ip.clear()
        self.fail_all.clear()
        self.log('系统', '', 'access.reset', '访问', '成功', '经 SSH 清空封禁和 IP 名单，打开外网管理，清空网页登录的失败计数')


NODE_SCHEMA = [
    """
    CREATE TABLE groups(gid TEXT PRIMARY KEY, node_key BLOB NOT NULL, seq INTEGER NOT NULL, bytes INTEGER NOT NULL,
                        created INTEGER, last_seen INTEGER, gen TEXT);
    CREATE TABLE slots(gid TEXT, dev TEXT, sec TEXT, rev INTEGER, cid TEXT, seq INTEGER, data BLOB, updated INTEGER,
                       PRIMARY KEY(gid, dev, sec));
    CREATE INDEX slots_seq ON slots(gid, seq);
    CREATE TABLE counters(gid TEXT, dev TEXT, last INTEGER, last_seen INTEGER, PRIMARY KEY(gid, dev));
    CREATE TABLE mail(id TEXT PRIMARY KEY, gid TEXT, to_dev TEXT, from_dev TEXT, data BLOB, created INTEGER, expires INTEGER);
    CREATE INDEX mail_gid ON mail(gid);
    CREATE TABLE rdv(id TEXT, side TEXT, n INTEGER, data BLOB, created INTEGER, expires INTEGER, PRIMARY KEY(id, n));
    """,
]
ADMIN_SCHEMA = [
    """
    CREATE TABLE invites(id TEXT PRIMARY KEY, secret BLOB, label TEXT, created INTEGER, expires INTEGER,
                         max_uses INTEGER, used INTEGER, revoked_at INTEGER);
    CREATE TABLE known_groups(gid TEXT PRIMARY KEY, invite_id TEXT, parent_gid TEXT, created INTEGER, blocked_at INTEGER,
                              note TEXT, quota_mb INTEGER);
    CREATE TABLE admin_keys(kid TEXT PRIMARY KEY, enc_key BLOB, last_ctr INTEGER, created INTEGER);
    CREATE TABLE log(id INTEGER PRIMARY KEY AUTOINCREMENT, t INTEGER, who TEXT, ip TEXT, op TEXT, obj TEXT, result TEXT,
                     note TEXT, sec INTEGER);
    CREATE INDEX log_t ON log(t);
    CREATE TABLE bans(ip TEXT PRIMARY KEY, until INTEGER);
    CREATE TABLE settings(k TEXT PRIMARY KEY, v TEXT);
    """,
    # 2（1.1.0）：网页后台。只加表，不动旧表，回滚到 1.0.0 不受影响
    """
    CREATE TABLE web_user(id INTEGER PRIMARY KEY CHECK(id = 1), user TEXT, pw_hash TEXT, totp_secret BLOB, totp_pending BLOB,
                          totp_last_step INTEGER, enabled INTEGER, pw_changed INTEGER, fail_times TEXT);
    CREATE TABLE web_sessions(kid TEXT PRIMARY KEY, enc_key BLOB, last_ctr INTEGER, user TEXT, created INTEGER, last_used INTEGER,
                              expires INTEGER, ip TEXT, ua TEXT);
    """,
    # 3（1.2.0）：换钥后的旧组号墓碑（#1 第一期返工）。只加表，回滚到 1.1.0 不受影响
    """
    CREATE TABLE tombstones(gid TEXT PRIMARY KEY, successor TEXT, created INTEGER);
    """,
    # 4（1.3.0）：管理员彻底删除组登记后留下的永久墓碑。只加一列，回滚到 1.2.0 时这些组号仍按墓碑拒绝重建
    """
    ALTER TABLE tombstones ADD COLUMN purged INTEGER;
    """,
]


# ---------------------------------------------------------------- HTTP

class Server(ThreadingHTTPServer):
    """tls 不为空时每个连接用当前证书包一层 TLS（握手放到处理线程里做，慢客户端不会卡住 accept）。"""
    daemon_threads = True
    request_queue_size = 64
    tls = None

    def get_request(self):
        sock, addr = self.socket.accept()
        if self.tls is None:
            return sock, addr
        ctx = self.tls.check()
        if ctx is None:
            sock.close()
            raise OSError('没有可用证书')
        return ctx.wrap_socket(sock, server_side=True, do_handshake_on_connect=False), addr

    def handle_error(self, request, client_address):
        e = sys.exc_info()[1]
        if isinstance(e, (ssl.SSLError, ConnectionError, TimeoutError, socket.timeout)):
            return      # 扫描器、握手失败、断线：不刷日志
        print(f'连接出错 {client_address[0]}：{e!r}'[:300], flush=True)


def make_handler(node, test_ip_header=False, channel='node', https=False):
    """channel：node = 8787（设备 + App 管理）；web = 443 / 127.0.0.1:8788（网页后台）；acme = 80（证书验证 + 跳转）。"""
    class H(BaseHTTPRequestHandler):
        server_version = 'km-sync/' + VERSION
        sys_version = ''
        timeout = 30

        def log_message(self, fmt, *args):   # 由 _done 记简短访问日志
            pass

        def _ip(self):
            if test_ip_header and self.headers.get('X-KM-Test-IP'):
                return self.headers['X-KM-Test-IP']
            return self.client_address[0]

        def _send(self, status, obj, extra=None, ctype='application/json; charset=utf-8', cache='no-store'):
            body = obj if isinstance(obj, bytes) else json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
            self.send_response(status)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', cache)
            self.send_header('Connection', 'close')
            if channel == 'web':
                self.send_header('Content-Security-Policy', CSP)
                self.send_header('X-Content-Type-Options', 'nosniff')
                self.send_header('Referrer-Policy', 'no-referrer')
                self.send_header('X-Frame-Options', 'DENY')
                if https:
                    self.send_header('Strict-Transport-Security', 'max-age=604800')
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(body)
            node.count_hit(status >= 400)
            path = re.sub(r'/g/([0-9a-f]{6})[0-9a-f]+', r'/g/\1…', self.path.split('?')[0])
            path = re.sub(r'/rdv/(.{4}).*', r'/rdv/\1…', path)
            path = re.sub(r'/acme-challenge/(.{4}).*', r'/acme-challenge/\1…', path)[:120]
            tag = {'node': '', 'web': ' [web]' if https else ' [web-local]', 'acme': ' [80]'}[channel]
            print(f'{datetime.datetime.now(CN_TZ):%m-%d %H:%M:%S} {self._ip()}{tag} {self.command} {path} {status} {len(body)}', flush=True)

        def _body(self, limit):
            n = self.headers.get('Content-Length')
            if n is None or not n.isdigit():
                if self.command == 'POST':
                    raise Reject(411, 'length')
                return b''
            n = int(n)
            if n > limit:
                # 读掉（不保存）再回 413，否则客户端还在发送时连接被关，只会看到“连接中断”
                if n <= 64 * MB:
                    left = n
                    while left > 0:
                        chunk = self.rfile.read(min(left, 65536))
                        if not chunk:
                            break
                        left -= len(chunk)
                raise Reject(413, 'size', '请求太大')
            return self.rfile.read(n)

        def _admin(self, path, ip):
            if self.command != 'POST':
                return self._send(403, {})
            try:
                body = self._body(ADMIN_BODY_MAX)
            except Reject:
                return self._send(403, {})
            status, obj, extra = node.admin(body, ip, 'web' if channel == 'web' else 'node')
            return self._send(status, obj, extra)

        def _acme(self, path):
            """80 端口：只回 Let's Encrypt 的验证文件；其它一律跳转 https（不提供任何页面和接口）。"""
            if path.startswith('/v1/') or path.startswith('/admin'):
                return self._send(404, {'err': 'path'})
            if self.command not in ('GET', 'HEAD'):
                return self._send(405, {'err': 'method'})
            pre = '/.well-known/acme-challenge/'
            if path.startswith(pre):
                tok = path[len(pre):]
                f = os.path.join(node.acme_dir or '/nonexistent', '.well-known', 'acme-challenge', tok)
                if RE_ACME.match(tok) and os.path.isfile(f):
                    with open(f, 'rb') as fh:
                        return self._send(200, fh.read(4096), ctype='text/plain')
                return self._send(404, b'not found', ctype='text/plain')
            target = self.path if self.path.startswith('/') else '/'
            return self._send(301, b'', {'Location': node.web_url + target}, ctype='text/plain')

        def _static(self, path):
            if self.command not in ('GET', 'HEAD'):
                return self._send(405, {'err': 'method'})
            ent = WEB_FILES.get(path)
            if not ent or not node.web_dir:
                return self._send(404, b'not found', ctype='text/plain')
            f = os.path.join(node.web_dir, *ent[0].split('/'))
            try:
                with open(f, 'rb') as fh:
                    data = fh.read()
            except OSError:
                return self._send(404, b'not found', ctype='text/plain')
            if ent[0] == 'index.html':
                data = data.replace(b'__V__', VERSION.encode())
            return self._send(200, data, ctype=ent[1], cache='no-cache')

        def _handle(self):
            path = self.path.split('?')[0]
            ip = self._ip()
            try:
                if channel == 'acme':
                    return self._acme(path)
                if path == '/admin/v1':
                    return self._admin(path, ip)
                if channel == 'web':
                    if path == '/admin/web/login':
                        if self.command != 'POST':
                            return self._send(405, {'err': 'method'})
                        try:
                            body = self._body(LOGIN_BODY_MAX)
                        except Reject:
                            return self._send(403, {'err': 'login', 'msg': LOGIN_FAIL_MSG})
                        status, obj = node.web_login(body, ip, self.headers.get('User-Agent', ''))
                        return self._send(status, obj)
                    return self._static(path)
                if not path.startswith('/v1/'):
                    return self._send(404, {'err': 'path'})
                if not node.rate_ok(ip):
                    return self._send(429, {'err': 'rate'})
                body = self._body(node.limits()['req_mb'] * MB + 64 * 1024)
                status, obj = node.device(self.command, path, self.headers, body, ip)
                return self._send(status, obj)
            except Reject as r:
                return self._send(r.status, {'err': r.err})
            except (ConnectionError, TimeoutError, socket.timeout, ssl.SSLError):
                return None     # 客户端断开 / 超时：不用回
            except Exception as e:  # noqa: BLE001
                print('内部错误', repr(e), flush=True)
                return self._send(500, {'err': 'internal'})

        do_GET = do_POST = do_HEAD = _handle

        def do_PUT(self):
            self._send(405, {'err': 'method'})

        do_DELETE = do_OPTIONS = do_PUT

    return H


def serve(node, host, port, test_ip_header=False, channel='node', tls=None):
    srv = Server((host, port), make_handler(node, test_ip_header, channel, https=tls is not None))
    srv.tls = tls
    return srv


def janitor_loop(node, stop):
    while not stop.wait(300):
        try:
            node.janitor()
        except Exception as e:  # noqa: BLE001
            print('清理出错', repr(e), flush=True)


def load_config(path):
    cfg = {'listen': '0.0.0.0', 'port': 8787, 'data_dir': '/var/lib/km-sync', 'public_host': '43.142.41.27', 'public_port': 8787,
           # 网页后台（1.1.0）；端口填 0 = 不开
           'https_port': 443, 'http_port': 80, 'local_web_port': 8788,
           'tls_cert': '/etc/km-sync/tls/fullchain.pem', 'tls_key': '/etc/km-sync/tls/privkey.pem',
           'acme_dir': '/var/lib/km-sync-acme', 'web_dir': '/opt/km-sync/web'}
    if path and os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            cfg.update(json.load(f))
    return cfg


def start_web(node, cfg, test_ip_header=False):
    """起 443 / 80 / 127.0.0.1:8788。任何一路起不来只打印原因，不影响 8787。返回 [(说明, server)]。"""
    hp = int(cfg.get('https_port') or 0)
    node.web_dir, node.acme_dir = cfg.get('web_dir'), cfg.get('acme_dir')
    node.web_url = f'https://{cfg["public_host"]}' + ('' if hp in (0, 443) else f':{hp}')
    if hp:
        node.tls = TLS(cfg['tls_cert'], cfg['tls_key'], int(cfg.get('tls_check_interval', 60)))
        if node.tls.err:
            print('443：' + node.tls.err + '（有证书后 60 秒内自动开始服务，不用重启）', flush=True)
    out = []
    for name, host, port, channel, tls in (('网页后台 https', cfg['listen'], hp, 'web', node.tls),
                                           ('证书验证/跳转 http', cfg['listen'], int(cfg.get('http_port') or 0), 'acme', None),
                                           ('网页后台（SSH 隧道）', '127.0.0.1', int(cfg.get('local_web_port') or 0), 'web', None)):
        if not port:
            continue
        try:
            srv = serve(node, host, port, test_ip_header, channel, tls)
        except OSError as e:
            print(f'{name} 监听 {host}:{port} 失败：{e}（只影响网页后台，同步和审批 App 照常）', flush=True)
            continue
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        print(f'{name} 监听 {host}:{srv.server_address[1]}', flush=True)
        out.append((name, srv))
    return out


def main():
    ap = argparse.ArgumentParser(description='km-sync 同步节点')
    ap.add_argument('--config', default='/etc/km-sync/config.json')
    ap.add_argument('--init', action='store_true')
    ap.add_argument('--new-admin-key', action='store_true')
    ap.add_argument('--reset-access', action='store_true')
    ap.add_argument('--reset-web-login', action='store_true')
    ap.add_argument('--version', action='store_true')
    a = ap.parse_args()
    if a.version:
        print(VERSION)
        return
    cfg = load_config(a.config)
    node = Node(cfg['data_dir'], cfg['public_host'], cfg['public_port'])
    if a.init or a.new_admin_key or a.reset_access or a.reset_web_login:
        out = {'version': VERSION, 'crypto': CRYPTO_ERR is None}
        with node.lock:
            if a.new_admin_key or (a.init and not node.adb.execute('SELECT 1 FROM admin_keys').fetchone()):
                out['admin'] = node.new_admin_key()
            else:
                row = node.adb.execute('SELECT kid FROM admin_keys').fetchone()
                out['kid'] = row[0] if row else None
            if a.init and not node.adb.execute('SELECT 1 FROM invites').fetchone():
                out['invite'] = node.create_invite('初始', 30, 10)
                node.adb.commit()
                node.log('系统', '', 'invites.create', out['invite']['id'], '成功', '部署时生成初始邀请码（30 天 10 次）')
            if a.reset_access:
                node.reset_access()
            if a.reset_web_login:
                node.reset_web_login()
            out['web'] = node.web_summary()
        print('KMJSON ' + json.dumps(out, ensure_ascii=True))
        return
    if CRYPTO_ERR:
        print('管理接口已关闭：导入不了 cryptography（' + CRYPTO_ERR + '），设备接口照常', flush=True)
    node.log('系统', '', 'start', VERSION, '成功', '服务启动' + ('' if CRYPTO_ERR is None else '（管理接口不可用：缺 cryptography）'))
    srv = serve(node, cfg['listen'], int(cfg['port']))
    stop = threading.Event()
    threading.Thread(target=janitor_loop, args=(node, stop), daemon=True).start()
    start_web(node, cfg)
    print(f'km-sync {VERSION} 监听 {cfg["listen"]}:{cfg["port"]}，数据目录 {cfg["data_dir"]}', flush=True)
    try:
        srv.serve_forever()
    finally:
        stop.set()


if __name__ == '__main__':
    main()
