#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""km-sync 节点测试。

本地（默认）：在 127.0.0.1 随机端口起一个节点（临时目录，跑完即删），逐条测设备协议、邀请码、封禁、换钥新组、
信箱/转交、管理认证与限速、凭据分离、日志、状态；再用 javac/java 编译审批 App 的 Node.java + NodeTest.java 跑互通测试。
    python test_node.py
    python test_node.py --no-java          # 跳过 Java 互通
远程（经 SSH 隧道测真实服务器）：
    ssh -i ~/.ssh/km_tencent -N -L 8787:127.0.0.1:8787 ubuntu@43.142.41.27     （另开一个窗口，或后台）
    python test_node.py --remote 127.0.0.1:8787
  远程只用备注为「自动测试」的临时邀请码和组，结束时自动删除组、作废邀请码。管理密钥读 signing/sync-node.json
  （$env:KM_SIGNING_DIR，没设就用主目录 knowledge-map-app/signing）。

DevClient 是设备协议的参考客户端，只按 PROTOCOL.md 写；AdminClient 是管理接口的参考客户端。
"""
import argparse
import base64
import hashlib
import hmac
import http.client
import json
import os
import re
import secrets
import shutil
import socket
import sqlite3
import ssl
import subprocess
import sys
import tempfile
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import km_sync_node as K  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(HERE))   # 仓库根（工作区根）


# ---------------------------------------------------------------- 编码（PROTOCOL.md「编码」一节）

def b64e(b):
    return base64.urlsafe_b64encode(b).rstrip(b'=').decode()


def b64d(s):
    return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))


def H(key, msg):
    return hmac.new(key, msg, hashlib.sha256).digest()


def xor(a, b):
    return bytes(x ^ y for x, y in zip(a, b))


class Http:
    def __init__(self, host, port, ip=None, tls=None):
        self.host, self.port, self.ip = host, port, ip   # ip：本地测试里假装的来源 IP（X-KM-Test-IP）
        self.tls = tls                                   # ssl.SSLContext：走 https

    def send(self, method, path, body=b'', headers=None, ip=None):
        c = http.client.HTTPSConnection(self.host, self.port, timeout=30, context=self.tls) if self.tls             else http.client.HTTPConnection(self.host, self.port, timeout=30)
        h = dict(headers or {})
        if body or method == 'POST':
            h['Content-Type'] = 'application/json'
        src = ip if ip is not None else self.ip
        if src:
            h['X-KM-Test-IP'] = src
        c.request(method, path, body=body, headers=h)
        r = c.getresponse()
        data = r.read()
        hdrs = dict(r.getheaders())
        c.close()
        try:
            obj = json.loads(data.decode()) if data else None
        except ValueError:
            obj = data
        return r.status, obj, hdrs


# ---------------------------------------------------------------- 设备参考客户端（PROTOCOL.md）

class Invite:
    def __init__(self, text):
        assert text.startswith('kmnode:1?')
        q = dict(p.split('=', 1) for p in text[len('kmnode:1?'):].split('&'))
        self.host, self.port, self.id = q['h'], int(q['p']), q['i']
        s = q['s']
        self.secret = base64.b32decode(s + '=' * (-len(s) % 8))


def wrap(ik, gid, node_key):
    n = secrets.token_bytes(16)
    w = xor(node_key, H(ik, b'km-wrap' + gid.encode() + n))
    mac = H(ik, b'km-create' + gid.encode() + n + w)
    return {'n': b64e(n), 'w': b64e(w), 'mac': b64e(mac)}


class DevClient:
    def __init__(self, http, gid, node_key, dev):
        self.http, self.gid, self.key, self.dev = http, gid, node_key, dev
        self.last = 0

    def next_ctr(self):
        self.last = max(self.last + 1, int(time.time() * 1000))
        return self.last

    def auth(self, method, path, body, ctr=None, key=None):
        ctr = self.next_ctr() if ctr is None else ctr
        msg = f'{method}\n{path}\n{self.dev}\n{ctr}\n{hashlib.sha256(body).hexdigest()}'.encode()
        return f'{self.dev}.{ctr}.{b64e(H(key or self.key, msg))}'

    def call(self, action, obj, ctr=None, key=None, raw=None):
        path = f'/v1/g/{self.gid}/{action}'
        body = raw if raw is not None else json.dumps(obj).encode()
        st, res, _ = self.http.send('POST', path, body, {'X-KM-Auth': self.auth('POST', path, body, ctr, key)})
        return st, res

    def create(self, inv):
        body = {'gid': self.gid, 'inv': inv.id, **wrap(H(inv.secret, b'km-invite'), self.gid, self.key)}
        st, res, _ = self.http.send('POST', '/v1/create', json.dumps(body).encode())
        return st, res

    def successor(self, new_gid, new_key):
        return self.call('successor', {'gid': new_gid, **wrap(self.key, new_gid, new_key)})

    def push(self, items):
        return self.call('push', {'items': [{'sec': s, 'rev': r, 'cid': c, 'data': b64e(d)} for s, r, c, d in items]})

    def pull(self, since=0):
        return self.call('pull', {'since': since})


def new_group():
    return secrets.token_hex(16), secrets.token_bytes(32)


# ---------------------------------------------------------------- 管理参考客户端

class AdminClient:
    """管理接口客户端。管理密钥 K：AdminClient(http, 管理码)；网页会话：AdminClient.session(http, 登录返回的 kid, key)。"""
    def __init__(self, http, text, ip=None, kid=None, key=None):
        if key is not None:                     # 网页会话：会话密钥 S 和会话号，信封完全一样
            self.k, self.kid = key, kid
        else:
            assert text.startswith('kmadmin:1?')
            q = dict(p.split('=', 1) for p in text[len('kmadmin:1?'):].split('&'))
            self.k = b64d(q['k'])
            self.kid = hashlib.sha256(self.k).hexdigest()[:8]
        self.enc = H(self.k, b'km-admin-enc-v1')
        self.http, self.ip = http, ip
        self.last = 0
        self.retried = 0

    def aead(self):
        return K._AESGCM(self.enc) if K._AESGCM else K.PyAESGCM(self.enc)

    def envelope(self, op, args, ctr=None, kid=None):
        ctr = ctr if ctr is not None else max(self.last + 1, int(time.time() * 1000))
        self.last = max(self.last, ctr)
        iv = secrets.token_bytes(12)
        kid = kid or self.kid
        ct = self.aead().encrypt(iv, json.dumps({'op': op, 'args': args or {}}).encode(), f'km-admin-req|{kid}|{ctr}'.encode())
        return ctr, json.dumps({'v': 1, 'kid': kid, 'ctr': ctr, 'iv': b64e(iv), 'ct': b64e(ct)}).encode()

    def send_raw(self, body, ip=None):
        return self.http.send('POST', '/admin/v1', body, ip=ip if ip is not None else self.ip)

    def decrypt(self, ctr, res):
        return json.loads(self.aead().decrypt(b64d(res['iv']), b64d(res['ct']), f'km-admin-resp|{self.kid}|{ctr}'.encode()))

    def call(self, op, args=None, ip=None, retry=True):
        ctr, body = self.envelope(op, args)
        st, res, hdr = self.send_raw(body, ip)
        if st == 403 and retry and hdr.get('X-KM-Retry'):
            iv, ct = hdr['X-KM-Retry'].split('.')
            hint = json.loads(self.aead().decrypt(b64d(iv), b64d(ct), f'km-admin-retry|{self.kid}|{ctr}'.encode()))
            self.last = hint['last']
            self.retried += 1
            return self.call(op, args, ip, retry=False)
        if st != 200:
            return st, None
        return st, self.decrypt(ctr, res)

    def ok(self, op, args=None, ip=None):
        st, r = self.call(op, args, ip)
        if st != 200 or not r.get('ok'):
            raise AssertionError(f'{op} 失败：{st} {r}')
        return r['data']

    @classmethod
    def session(cls, http, kid, key, ip=None):
        return cls(http, None, ip, kid=kid, key=b64d(key) if isinstance(key, str) else key)


def web_login(http, user, pw, code=None, ip=None, ua='km-test'):
    body = {'user': user, 'pw': pw}
    if code is not None:
        body['code'] = code
    st, res, hdr = http.send('POST', '/admin/web/login', json.dumps(body).encode(), {'User-Agent': ua}, ip=ip)
    return st, res, hdr


# ---------------------------------------------------------------- 结果

RESULTS = []


def check(cond, name, detail=''):
    RESULTS.append((bool(cond), name))
    print(('  ✓ ' if cond else '  ✗ ') + name + ('' if cond else f'  —— {detail}'), flush=True)
    return cond


def section(t):
    print('\n■ ' + t, flush=True)


# ---------------------------------------------------------------- 本地节点

class LocalNode:
    def __init__(self):
        self.dir = tempfile.mkdtemp(prefix='km-sync-test-')
        self.clock = K.Clock()
        self.port = 0
        self.start()

    def start(self):
        self.node = K.Node(self.dir, '127.0.0.1', self.port, clock=self.clock, aes=K._AESGCM or K.PyAESGCM)
        self.srv = K.serve(self.node, '127.0.0.1', self.port, test_ip_header=True)
        self.port = self.srv.server_address[1]
        self.node.public_port = self.port
        self.t = threading.Thread(target=self.srv.serve_forever, daemon=True)
        self.t.start()

    def stop(self):
        self.srv.shutdown()
        self.srv.server_close()
        self.node.ndb.close()
        self.node.adb.close()

    def lose_node_db(self):
        self.stop()
        for s in ('', '-wal', '-shm'):
            p = self.node.ndb_path + s
            if os.path.exists(p):
                os.remove(p)
        self.start()

    def advance(self, seconds):
        self.clock.offset += seconds

    def cleanup(self):
        self.stop()
        shutil.rmtree(self.dir, ignore_errors=True)


def all_strings(o):
    if isinstance(o, dict):
        for k, v in o.items():
            yield str(k)
            yield from all_strings(v)
    elif isinstance(o, list):
        for v in o:
            yield from all_strings(v)
    elif o is not None:
        yield str(o)


def log_rows(ln):
    return ln.node.adb.execute('SELECT COUNT(*) FROM log').fetchone()[0]


def run_local(java=True):
    ln = LocalNode()
    http = Http('127.0.0.1', ln.port)
    keyinfo = ln.node.new_admin_key()
    adm = AdminClient(http, keyinfo['admin_qr'].replace('p=0', f'p={ln.port}'))
    responses = []   # 所有管理响应，最后检查里面没有密文字节

    def A(op, args=None, ip=None):
        d = adm.ok(op, args, ip)
        responses.append(d)
        return d

    try:
        # ------------------------------------------------ 设备协议
        section('设备协议')
        st, res, _ = http.send('GET', '/v1/hello')
        check(st == 200 and res['proto'] == 1 and res['ver'] == K.VERSION, '/v1/hello 不签名可用', res)
        inv = Invite(A('invites.create', {'label': '测试', 'days': 7, 'uses': 5})['qr'])
        gid, key = new_group()
        a, b = DevClient(http, gid, key, 'devA'), DevClient(http, gid, key, 'devB')
        st, res = a.create(inv)
        check(st == 200 and res['ok'], '用邀请码建组成功', (st, res))
        lst = {i['id']: i for i in A('invites.list')}
        check(lst[inv.id]['used'] == 1, '建组后邀请码已用次数 +1', lst[inv.id])
        blob1 = secrets.token_bytes(3000)
        st, res = a.push([('s1', 1, 'c1', blob1)])
        check(st == 200 and res['seq'] == 1, 'push 成功并分配组内序号', (st, res))
        row = ln.node.ndb.execute("SELECT data FROM slots WHERE gid=? AND dev='devA' AND sec='s1'", (gid,)).fetchone()
        check(row and row[0] == blob1, '数据库里存的就是上传的字节', '')
        st, res = b.pull(0)
        check(st == 200 and len(res['items']) == 1 and b64d(res['items'][0]['data']) == blob1 and res['items'][0]['dev'] == 'devA',
              'pull 拿到别人的槽', res)
        st, res = a.pull(0)
        check(st == 200 and res['items'] == [], 'pull 不返回自己的槽', res)
        st, res = a.push([('s2', 1, 'c2', b'x' * 10)])
        st, res = b.pull(1)
        check(st == 200 and [i['sec'] for i in res['items']] == ['s2'], 'pull 只返回指定序号之后的', res)
        st, res = a.push([('s1', 1, 'c1', b'old')])
        check(st == 200 and res['stale'] == ['s1'], '版本号不变大的分区不覆盖（stale）', res)
        st, res = a.call('pull', {'since': 0}, key=b'\0' * 32)
        check(st == 401 and res == {'err': 'auth'}, '签名错 → 401', (st, res))
        c = a.next_ctr()
        st1, _ = a.call('pull', {'since': 0}, ctr=c)
        st2, res2 = a.call('pull', {'since': 0}, ctr=c)
        check(st1 == 200 and st2 == 401, '计数重复 → 401', (st1, st2, res2))
        st, res = a.call('pull', {'since': 0}, ctr=c - 5)
        check(st == 401, '计数变小 → 401', (st, res))
        A('limits.set', {'sec_mb': 1, 'req_mb': 2})
        st, res = a.push([('big', 1, 'c', b'\0' * (K.MB + 10))])
        check(st == 413 and res['err'] == 'size', '单分区超限 → 413', (st, res))
        st, res = a.push([('p1', 1, 'c', b'\0' * (K.MB - 100)), ('p2', 1, 'c', b'\0' * (K.MB - 100))])
        check(st == 413, '单请求超限 → 413', (st, res))
        A('groups.setQuota', {'gid': gid, 'mb': 1})
        st, res = a.push([('q1', 1, 'c', b'\0' * 700000)])
        st2, res2 = a.push([('q2', 1, 'c', b'\0' * 700000)])
        check(st == 200 and st2 == 413 and res2['err'] == 'quota', '超过组空间 → 413，且整次请求不落盘', (st, st2, res2))
        check(not ln.node.ndb.execute("SELECT 1 FROM slots WHERE sec='q2'").fetchone(), '超限的那次请求没有写进数据库')
        A('groups.setQuota', {'gid': gid, 'mb': None})
        A('limits.set', dict(K.DEFAULT_LIMITS))
        st, res = DevClient(http, secrets.token_hex(16), key, 'devA').pull(0)
        check(st == 404 and res['err'] == 'nogroup', '组不存在 → 404 nogroup', (st, res))
        # 限速：每 IP 每 10 分钟
        A('limits.set', {'ip_rate': 60})
        rh = Http('127.0.0.1', ln.port, ip='198.18.0.7')
        codes = [rh.send('GET', '/v1/hello')[0] for _ in range(61)]
        check(codes[:60] == [200] * 60 and codes[60] == 429, '每 IP 超过次数 → 429', codes[-3:])
        ln.advance(601)
        check(rh.send('GET', '/v1/hello')[0] == 200, '10 分钟后限速解除')
        A('limits.set', dict(K.DEFAULT_LIMITS))

        # ------------------------------------------------ 邀请码
        section('邀请码')
        g2, k2 = new_group()
        d2 = DevClient(http, g2, k2, 'd2')
        body = {'gid': g2, **wrap(H(inv.secret, b'km-invite'), g2, k2)}
        st, res, _ = http.send('POST', '/v1/create', json.dumps(body).encode())
        check(st == 403 and res['err'] == 'invite', '不带邀请码 → 403 invite', (st, res))
        bad = Invite(inv_text_with_secret(inv, secrets.token_bytes(20)))
        st, res = d2.create(bad)
        check(st == 403 and res['err'] == 'invite', '邀请密钥错 → 403 invite', (st, res))
        one = Invite(A('invites.create', {'label': '一次', 'days': 1, 'uses': 1})['qr'])
        st, _ = d2.create(one)
        g3, k3 = new_group()
        d3 = DevClient(http, g3, k3, 'd3')
        st3, res3 = d3.create(one)
        check(st == 200 and st3 == 403 and res3['err'] == 'invite', '用完 → 403 invite', (st, st3, res3))
        exp = Invite(A('invites.create', {'label': '过期', 'days': 1, 'uses': 5})['qr'])
        rev = Invite(A('invites.create', {'label': '作废', 'days': 30, 'uses': 5})['qr'])
        A('invites.revoke', {'id': rev.id})
        st, res = d3.create(rev)
        check(st == 403 and res['err'] == 'invite', '作废 → 403 invite', (st, res))
        st, res = d2.create(one)
        check(st == 200 and res.get('existed'), '同一组重复建组是幂等的（不占次数）', (st, res))
        A('groups.setNote', {'gid': g2, 'note': '小明'})
        # 封禁一个组，下面验证节点数据丢失后封禁还在
        g4, k4 = new_group()
        d4 = DevClient(http, g4, k4, 'd4')
        d4.create(inv)
        A('groups.remove', {'gid': g4})
        ln.advance(2 * 86400)
        st, res = d3.create(exp)
        check(st == 403 and res['err'] == 'invite', '过期 → 403 invite', (st, res))

        # ------------------------------------------------ 节点数据丢失
        section('节点数据丢失（删掉 node.db 重启）')
        ln.lose_node_db()
        http.port = ln.port
        st, res = d2.pull(0)
        check(st == 404 and res['err'] == 'nogroup', '数据丢失后设备收到 404 nogroup', (st, res))
        st, res = d2.create(one)
        check(st == 200 and res.get('rebuilt'), '用原邀请码重建成功（邀请码已过期、已用完也行）', (st, res))
        lst = {i['id']: i for i in A('invites.list')}
        check(lst[one.id]['used'] == 1, '重建不占次数', lst[one.id])
        gl = {g['gid']: g for g in A('groups.list')}
        check(gl[g2]['note'] == '小明', 'admin.db 里的备注还在', gl.get(g2))
        check(gl[g4]['blocked_at'], 'admin.db 里的封禁还在', gl.get(g4))
        check(lst[rev.id]['state'] == 'revoked' and lst[exp.id]['state'] == 'expired', 'admin.db 里的邀请码还在', '')
        st, res = d4.create(inv)
        check(st == 403 and res['err'] == 'blocked', '被封禁的组数据丢失后也不能重建', (st, res))
        A('invites.revoke', {'id': one.id})
        ln.lose_node_db()
        http.port = ln.port
        st, res = d2.create(one)
        check(st == 403 and res['err'] == 'invite', '邀请码作废后不能再重建', (st, res))

        # ------------------------------------------------ 封禁
        section('封禁')
        g5, k5 = new_group()
        d5 = DevClient(http, g5, k5, 'd5')
        d5.create(inv)
        d5.push([('s', 1, 'c', b'abc')])
        A('groups.remove', {'gid': g5})
        r = [d5.create(inv), d5.push([('s', 2, 'c', b'abc')]), d5.pull(0)]
        check(all(st == 403 and res['err'] == 'blocked' for st, res in r), '移除后建组、重建、push、pull 都是 403 blocked', r)
        check(not ln.node.ndb.execute('SELECT 1 FROM slots WHERE gid=?', (g5,)).fetchone(), '移除后这组数据已删掉')
        A('groups.unblock', {'gid': g5})
        st, res = d5.create(inv)
        check(st == 200 and res.get('rebuilt'), '解除封禁后能重建', (st, res))

        # ------------------------------------------------ 换钥新组 successor
        section('换钥新组 successor')
        ng, nk = new_group()
        st, res = d5.successor(ng, nk)
        check(st == 200 and res['ok'], '用旧组 nodeKey 签名建新组', (st, res))
        kn = ln.node.known(ng)
        check(kn and kn['invite_id'] == inv.id and kn['parent_gid'] == g5, '新组继承邀请号、记上一代组号', kn)
        st, res = DevClient(http, ng, nk, 'd5').push([('s', 1, 'c', b'new')])
        check(st == 200, '新组能用新 nodeKey 正常同步', (st, res))
        ng2, nk2 = new_group()
        st, res = d5.call('successor', {'gid': ng2, **wrap(b'\1' * 32, ng2, nk2)})
        check(st == 401, '包裹用错钥 → 401', (st, res))
        st, res = d5.call('successor', {'gid': ng2, **wrap(k5, ng2, nk2)}, key=b'\2' * 32)
        check(st == 401, '签名错 → 401', (st, res))
        A('groups.remove', {'gid': g5})
        st, res = d5.successor(ng2, nk2)
        check(st == 403 and res['err'] == 'blocked', '旧组被封禁时 403', (st, res))

        # ------------------------------------------------ 1.2.0 换钥后的旧组号墓碑（#1：被移除的设备不能用邀请码把旧组重建出来）
        section('换钥后的旧组不能用邀请码重建（1.2.0）')
        inv7 = Invite(A('invites.create', {'label': '墓碑', 'days': 7, 'uses': 3})['qr'])
        g7, k7 = new_group()
        o7, x7 = DevClient(http, g7, k7, 'owner7'), DevClient(http, g7, k7, 'removed7')
        st, res = o7.create(inv7)
        check(st == 200, '建组', (st, res))
        used0 = {i['id']: i for i in A('invites.list')}[inv7.id]['used']
        g8, k8 = new_group()
        st, res = o7.successor(g8, k8)
        check(st == 200, '换钥建新组', (st, res))
        st, res = x7.create(inv7)
        check(st == 200 and res.get('existed'), '旧组还在时，同一个 nodeKey 再 create 只回 existed（不新建、不占次数）', (st, res))
        st, res = x7.pull(0)
        check(st == 200, '旧组还在时被移除的设备照常能拉旧组（看到「已被移出」的名单）', (st, res))
        st, res = o7.call('drop', {})
        check(st == 200, '换钥的设备 drop 旧组', (st, res))
        st, res = x7.pull(0)
        check(st == 404 and res['err'] == 'nogroup', '旧组删掉后拉取 → 404 nogroup', (st, res))
        st, res = x7.create(inv7)
        check(st == 403 and res == {'err': 'replaced'}, '被移除的设备用邀请码重建旧组 → 403 replaced', (st, res))
        used1 = {i['id']: i for i in A('invites.list')}[inv7.id]['used']
        check(used1 == used0 and not ln.node.ndb.execute('SELECT 1 FROM groups WHERE gid=?', (g7,)).fetchone(),
              '重建被拒：没有建出组、没有占邀请码次数', (used0, used1))
        with ln.node.lock:
            ln.node._delete_group_data(g8)        # 模拟节点数据丢了（墓碑在 admin.db，不受影响）
            ln.node.ndb.commit()
        st, res = x7.create(inv7)
        check(st == 403 and res['err'] == 'replaced', '节点组数据丢了以后墓碑还在（存在 admin.db）：仍然拒绝', (st, res))
        st, res = DevClient(http, g8, k8, 'owner7').create(inv7)
        check(st == 200 and res.get('rebuilt'), '新一代组照常能用邀请码重建', (st, res))
        ln.node.adb.execute('UPDATE tombstones SET created=1 WHERE gid=?', (g7,))
        ln.node.janitor()
        check(not ln.node.adb.execute('SELECT 1 FROM tombstones WHERE gid=?', (g7,)).fetchone(), '墓碑 90 天后由清理任务删掉', '')

        # ------------------------------------------------ 信箱、转交
        section('信箱、转交')
        g6, k6 = new_group()
        m1, m2 = DevClient(http, g6, k6, 'm1'), DevClient(http, g6, k6, 'm2')
        m1.create(inv)
        st, res = m1.call('mail/put', {'to': 'm2', 'data': b64e(b'k' * 100), 'ttl': 600})
        st2, res2 = m2.call('mail/get', {})
        check(st == 200 and st2 == 200 and len(res2['items']) == 1 and b64d(res2['items'][0]['data']) == b'k' * 100, '信箱投递和收取', (res, res2))
        st, res = m1.call('mail/put', {'to': 'm2', 'data': b64e(b'k' * (K.MAIL_MAX + 1)), 'ttl': 600})
        check(st == 413, '信件超过大小上限 → 413', (st, res))
        ln.advance(601)
        ln.node.janitor()
        st2, res2 = m2.call('mail/get', {})
        check(res2['items'] == [] and not ln.node.ndb.execute('SELECT 1 FROM mail').fetchone(), '信件过期后被清理', res2)
        rid = b64e(secrets.token_bytes(16))
        st, res, _ = http.send('POST', f'/v1/rdv/{rid}', json.dumps({'op': 'put', 'side': 'a', 'data': b64e(b'hello')}).encode())
        st2, res2, _ = http.send('POST', f'/v1/rdv/{rid}', json.dumps({'op': 'get', 'side': 'b'}).encode())
        check(st == 200 and b64d(res2['items'][0]['data']) == b'hello', '转交点放入和取出', res2)
        st, res, _ = http.send('POST', f'/v1/rdv/{rid}', json.dumps({'op': 'put', 'side': 'b', 'data': b64e(b'z' * (K.RDV_MAX))}).encode())
        check(st == 413, '转交点超过 16KB → 413', (st, res))
        ln.advance(601)
        ln.node.janitor()
        st2, res2, _ = http.send('POST', f'/v1/rdv/{rid}', json.dumps({'op': 'get', 'side': 'b'}).encode())
        check(res2['items'] == [] and not ln.node.ndb.execute('SELECT 1 FROM rdv').fetchone(), '转交点 10 分钟后被清理', res2)

        # ------------------------------------------------ 管理认证
        section('管理认证')
        ln.advance(7200)   # 让前面的失败计数过期
        every = {
            'status': {}, 'groups.list': {}, 'invites.list': {}, 'log.list': {'limit': 5},
            'groups.setNote': {'gid': g6, 'note': '测试组'}, 'groups.setQuota': {'gid': g6, 'mb': 20},
            'groups.clear': {'gid': g6}, 'invites.create': {'label': '全操作', 'days': 1, 'uses': 1},
            'limits.set': dict(K.DEFAULT_LIMITS), 'expiry.set': {'date': '2026-11-16'},
            'access.set': {'remote': True, 'ips': []},
        }
        okc = [op for op, args in every.items() if adm.call(op, args)[1].get('ok')]
        tmp_inv = A('invites.list')[0]['id']
        okc.append('invites.revoke') if adm.call('invites.revoke', {'id': tmp_inv})[1]['ok'] else None
        g7, k7 = new_group()
        DevClient(http, g7, k7, 'x').create(inv)
        okc.append('groups.remove') if adm.call('groups.remove', {'gid': g7})[1]['ok'] else None
        okc.append('groups.unblock') if adm.call('groups.unblock', {'gid': g7})[1]['ok'] else None
        check(len(okc) == len(every) + 3, f'正确管理密钥每个 op 都成功（{len(okc)} 个）', okc)

        ip = '203.0.113.10'
        ctr, body = adm.envelope('status', {}, kid='00000000')
        st, res, _ = adm.send_raw(body, ip)
        check(st == 403 and res == {}, 'kid 错 → 403 {}', (st, res))
        ctr, body = adm.envelope('status', {})
        env = json.loads(body)
        raw = bytearray(b64d(env['ct']))
        raw[3] ^= 1
        env['ct'] = b64e(bytes(raw))
        st, res, _ = adm.send_raw(json.dumps(env).encode(), '203.0.113.11')
        check(st == 403 and res == {}, '密文改一个字节 → 403 {}', (st, res))
        ctr, body = adm.envelope('status', {})
        st1, _, _ = adm.send_raw(body, '203.0.113.12')
        st2, res2, hdr2 = adm.send_raw(body, '203.0.113.12')
        check(st1 == 200 and st2 == 403 and res2 == {}, '原样重放 → 403 {}', (st1, st2, res2))
        ctr, body = adm.envelope('status', {}, ctr=adm.last - 10)
        st, res, _ = adm.send_raw(body, '203.0.113.13')
        check(st == 403 and res == {}, 'ctr 变小 → 403 {}', (st, res))
        # 别的客户端（时钟快 10 分钟）用过更大的计数，本客户端的计数就落后了
        ctr, body = adm.envelope('status', {}, ctr=int(time.time() * 1000) + 600000)
        adm.send_raw(body)
        adm.last = 1
        st, r = adm.call('status', {})
        check(st == 200 and r['ok'] and adm.retried == 1, '客户端计数落后时，凭只有自己看得懂的提示用更大的 ctr 重试一次成功', (st, adm.retried))

        bad_ip = '203.0.113.50'
        for _ in range(5):
            _, body = adm.envelope('status', {}, kid='ffffffff')
            adm.send_raw(body, bad_ip)
        st, _ = adm.call('status', {}, ip=bad_ip)
        check(st == 403, '同一 IP 失败 5 次后正确请求也 403', st)
        st2 = adm.call('status', {}, ip='203.0.113.51')[0]
        check(st2 == 200, '别的 IP 不受影响', st2)
        st3, _, _ = Http('127.0.0.1', ln.port, ip=bad_ip).send('GET', '/v1/hello')
        check(st3 == 200, '封 IP 只影响管理接口，设备接口不受影响', st3)
        ln.advance(3601)
        st, _ = adm.call('status', {}, ip=bad_ip)
        check(st == 200, '1 小时后自动解封', st)

        ln.advance(7200)
        for i in range(30):
            _, body = adm.envelope('status', {}, kid='eeeeeeee')
            adm.send_raw(body, f'198.51.100.{i + 1}')
        st, _ = adm.call('status', {}, ip='192.0.2.77')
        check(st == 403, '全局 1 小时失败 30 次 → 熔断，外网正确请求也 403', st)
        st, _ = adm.call('status', {})
        check(st == 200, '熔断时本机（127.0.0.1，SSH 隧道）照常', st)
        for _ in range(10):
            _, body = adm.envelope('status', {}, kid='dddddddd')
            adm.send_raw(body)
        st, _ = adm.call('status', {})
        check(st == 200, '本机来源失败多次也不会被封', st)
        ln.advance(3601)
        st, _ = adm.call('status', {}, ip='192.0.2.77')
        check(st == 200, '熔断 1 小时后恢复', st)

        A('access.set', {'remote': False, 'ips': []})
        st, _ = adm.call('status', {}, ip='192.0.2.78')
        st2, _ = adm.call('status', {})
        check(st == 403 and st2 == 200, '关闭外网管理后非本机来源 403、本机照常', (st, st2))
        A('access.set', {'remote': True, 'ips': []})
        st, r = adm.call('access.set', {'remote': True, 'ips': ['10.9.0.0/16']}, ip='192.0.2.79')
        check(st == 200 and not r['ok'] and r['err'] == 'self', 'access.set 不含当前 IP 被拒', r)
        st, r = adm.call('access.set', {'remote': True, 'ips': ['192.0.2.0/24']}, ip='192.0.2.79')
        check(st == 200 and r['ok'], 'access.set 含当前 IP 能保存', r)
        st, _ = adm.call('status', {}, ip='192.0.3.1')
        st2, _ = adm.call('status', {}, ip='192.0.2.80')
        check(st == 403 and st2 == 200, 'IP 名单生效：名单外 403、名单内正常', (st, st2))
        A('access.set', {'remote': True, 'ips': []})
        ln.advance(7200)
        codes = [adm.call('status', {}, ip='192.0.2.90')[0] for _ in range(121)]
        check(codes[:120] == [200] * 120 and codes[120] == 429, '每个 kid 每分钟最多 120 次', codes[-2:])
        ln.advance(61)

        # ------------------------------------------------ 凭据分离
        section('凭据分离')
        body = json.dumps({'v': 1}).encode()
        st, res, _ = http.send('POST', '/admin/v1', body, {'X-KM-Auth': m1.auth('POST', '/admin/v1', body)}, ip='192.0.2.91')
        check(st == 403 and res == {}, '设备签名的请求访问 /admin/v1 → 403', (st, res))
        fake = DevClient(http, g6, adm.k, 'm1')
        st, res = fake.pull(0)
        st2, res2 = DevClient(http, g6, adm.enc, 'm1').pull(0)
        check(st == 401 and st2 == 401, '管理密钥（及其派生钥）调不了 /v1/g/... 接口', (st, st2))
        m1.push([('secret', 1, 'c', b'SECRET-PAYLOAD-' + secrets.token_bytes(64))])
        responses.append(A('groups.list'))
        responses.append(A('log.list', {'limit': 100}))
        responses.append(A('status'))
        responses.append(A('invites.list'))
        blobs = [r[0] for r in ln.node.ndb.execute('SELECT data FROM slots')]
        texts = '\n'.join(s for r in responses for s in all_strings(r))
        leak = [b for b in blobs if len(b) >= 16 and (b64e(b)[:-2] in texts or base64.b64encode(b).decode()[:-4] in texts or b.hex() in texts)]
        check(blobs and not leak, f'所有管理响应里都搜不到槽里的字节（检查了 {len(blobs)} 个槽）', len(leak))

        # ------------------------------------------------ 日志
        section('日志')
        before = log_rows(ln)
        m1.push([('s9', 1, 'c', b'abc')])
        m2.pull(0)
        check(log_rows(ln) == before, '设备 push/pull 不写日志表')
        A('groups.setNote', {'gid': g6, 'note': '日志测试'})
        st, r = adm.call('invites.revoke', {'id': 'zzzzzzzz'})
        items = A('log.list', {'limit': 10})['items']
        okl, fl = items[1], items[0]
        check(okl['op'] == 'groups.setNote' and okl['result'] == '成功' and adm.kid in okl['who'] and okl['ip'] == '127.0.0.1'
              and okl['obj'] == g6[:6] and okl['t'] > 0, '成功的写操作有日志（时间、kid、IP、操作、对象、结果）', okl)
        check(fl['op'] == 'invites.revoke' and fl['result'] == '失败', '失败的写操作也有日志', fl)
        sec = A('log.list', {'limit': 100, 'sec': True})['items']
        check(sec and all(i['sec'] for i in sec) and any(i['op'] == 'ban' for i in sec) and any(i['op'] == 'breaker' for i in sec)
              and any(i['op'] == 'auth' for i in sec), '认证失败、封 IP、熔断都是安全事件', [i['op'] for i in sec][:8])
        page1 = A('log.list', {'limit': 5})
        page2 = A('log.list', {'limit': 5, 'before': page1['items'][-1]['id']})
        check(page1['more'] and page2['items'][0]['id'] < page1['items'][-1]['id'], '日志翻页', '')
        n_old = log_rows(ln)
        ln.advance(91 * 86400)
        A('groups.setNote', {'gid': g6, 'note': '新日志'})
        ln.node.janitor()
        check(log_rows(ln) == 1, f'超过 90 天的日志被清理（{n_old} 条 → {log_rows(ln)} 条）', log_rows(ln))

        # ------------------------------------------------ 状态
        section('状态')
        ln.clock.offset = 0
        s = A('status')
        today = K.datetime.datetime.now(K.CN_TZ).date()
        check(s['expiry'] == '2026-11-16' and s['days_left'] == (K.datetime.date(2026, 11, 16) - today).days, '到期日和剩余天数正确', s['days_left'])
        A('expiry.set', {'date': '2027-11-16'})
        s = A('status')
        check(s['expiry'] == '2027-11-16' and s['days_left'] == (K.datetime.date(2027, 11, 16) - today).days, 'expiry.set 后生效', s['expiry'])
        du = shutil.disk_usage(ln.dir)
        check(s['disk_total'] == du.total and abs(s['disk_free'] - du.free) < 200 * K.MB, '磁盘总量和剩余与实际一致', (s['disk_free'], du.free))
        real = ln.node.ndb.execute('SELECT COUNT(*) FROM groups').fetchone()[0]
        size = ln.node.ndb.execute('SELECT COALESCE(SUM(LENGTH(data)),0) FROM slots').fetchone()[0] + \
            ln.node.ndb.execute('SELECT COALESCE(SUM(LENGTH(data)),0) FROM mail').fetchone()[0]
        check(s['groups'] == real and s['bytes'] == size, f'组数（{real}）和总占用（{size} 字节）与实际一致', (s['groups'], s['bytes']))
        check(s['requests_24h'] >= 1 and s['your_ip'] == '127.0.0.1', '近 24 小时请求数和来源 IP', (s['requests_24h'], s['your_ip']))
        gl = A('groups.list')
        g6row = next(g for g in gl if g['gid'] == g6)
        check(len(g6row['devices']) == 2 and g6row['devices'][0]['dev'] in ('m1', 'm2'), 'groups.list 列出组内设备', g6row['devices'])

        # ------------------------------------------------ 换钥旧组 60 天清理
        section('换钥后的旧组 60 天清理')
        g8, k8 = new_group()
        o = DevClient(http, g8, k8, 'o')
        o.create(Invite(A('invites.create', {'label': '换钥', 'days': 1, 'uses': 1})['qr']))
        g9, k9 = new_group()
        o.successor(g9, k9)
        ln.advance(61 * 86400)
        ln.node.janitor()
        check(not ln.node.ndb.execute('SELECT 1 FROM groups WHERE gid=?', (g8,)).fetchone()
              and ln.node.ndb.execute('SELECT 1 FROM groups WHERE gid=?', (g9,)).fetchone(), '旧组 60 天后删除，新组保留')
        ln.clock.offset = 0

        # ------------------------------------------------ Java 互通
        if java:
            section('Java 互通（team-admin-app Node.java）')
            run_java(f'kmadmin:1?h=127.0.0.1&p={ln.port}&k={b64e(adm.k)}')
    finally:
        ln.cleanup()


# ---------------------------------------------------------------- 网页后台（1.1.0）

def find_openssl():
    for p in (shutil.which('openssl'), r'C:\Program Files\Git\mingw64\bin\openssl.exe', r'C:\Program Files\Git\usr\bin\openssl.exe'):
        if p and os.path.exists(p):
            return p
    return None


def make_cert(d, name, cn='127.0.0.1', days=1):
    """临时自签证书（只给本地测试的 443 用）。"""
    os.makedirs(d, exist_ok=True)
    cert, key = os.path.join(d, name + '.pem'), os.path.join(d, name + '.key')
    env = dict(os.environ, MSYS_NO_PATHCONV='1')
    r = subprocess.run([find_openssl(), 'req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:P-256', '-nodes',
                        '-keyout', key, '-out', cert, '-days', str(days), '-subj', '/CN=' + cn, '-addext', 'subjectAltName=IP:127.0.0.1'],
                       capture_output=True, env=env)
    if r.returncode:
        raise RuntimeError('openssl 生成证书失败：' + r.stderr.decode(errors='replace')[-300:])
    return cert, key


def copy_web(dst):
    """和 deploy.ps1 一样把网页文件拼到一个目录：sync-node/web + 审批 App 的 node.js、node.css、两个二维码库。"""
    www = os.path.join(ROOT, 'team-admin-app', 'www')
    os.makedirs(os.path.join(dst, 'vendor'), exist_ok=True)
    for f in ('index.html', 'web.js', 'web.css'):
        shutil.copy(os.path.join(HERE, 'web', f), os.path.join(dst, f))
    for f in ('node.js', 'node.css', 'vendor/qrcode.js', 'vendor/jsQR.js'):
        shutil.copy(os.path.join(www, *f.split('/')), os.path.join(dst, *f.split('/')))


class WebNode(LocalNode):
    """本地节点 + 网页后台三路（https、80 证书验证/跳转、明文 8788），都在 127.0.0.1 随机端口。"""
    def start(self):
        super().start()
        if not hasattr(self, 'webdir'):
            self.webdir = os.path.join(self.dir, 'web')
            copy_web(self.webdir)
            self.acme = os.path.join(self.dir, 'acme')
            os.makedirs(os.path.join(self.acme, '.well-known', 'acme-challenge'))
            self.tlsdir = os.path.join(self.dir, 'tls')
            c, k = make_cert(self.tlsdir, 'a')
            self.cert, self.key = os.path.join(self.tlsdir, 'fullchain.pem'), os.path.join(self.tlsdir, 'privkey.pem')
            shutil.copy(c, self.cert)
            shutil.copy(k, self.key)
            self.hports = {'https': 0, 'acme': 0, 'web': 0}
        n = self.node
        n.web_dir, n.acme_dir = self.webdir, self.acme
        n.tls = K.TLS(self.cert, self.key, interval=1)
        self.websrv = {}
        for name, channel, tls in (('https', 'web', n.tls), ('acme', 'acme', None), ('web', 'web', None)):
            srv = K.serve(n, '127.0.0.1', self.hports[name], test_ip_header=True, channel=channel, tls=tls)
            self.hports[name] = srv.server_address[1]
            threading.Thread(target=srv.serve_forever, daemon=True).start()
            self.websrv[name] = srv
        n.web_url = f'https://127.0.0.1:{self.hports["https"]}'

    def stop(self):
        for srv in self.websrv.values():
            srv.shutdown()
            srv.server_close()
        super().stop()

    def ctx(self):
        c = ssl.create_default_context(cafile=self.cert)
        return c


def run_web_local():
    ln = WebNode()
    http = Http('127.0.0.1', ln.port)
    keyinfo = ln.node.new_admin_key()
    adm = AdminClient(http, keyinfo['admin_qr'])
    https = Http('127.0.0.1', ln.hports['https'], tls=ln.ctx())
    local = Http('127.0.0.1', ln.hports['web'])             # 127.0.0.1:8788 那一路（SSH 隧道）
    acme = Http('127.0.0.1', ln.hports['acme'])
    secrets_seen = []      # 密码、会话密钥、TOTP 密钥：最后检查日志和响应里都没有
    responses = []
    PW = 'Tq7-' + secrets.token_urlsafe(12)
    PW2 = 'Zr9-' + secrets.token_urlsafe(12)
    secrets_seen += [PW, PW2]
    sessions = []

    def login(pw=PW, user='boss', code=None, ip=None, via=None):
        st, res, hdr = web_login(via or https, user, pw, code, ip)
        if st == 200:
            secrets_seen.append(res['key'])
            s = AdminClient.session(via or https, res['kid'], res['key'], ip)
            sessions.append(s)
            return st, res, s
        return st, res, None

    def S(cli, op, args=None):
        d = cli.ok(op, args)
        responses.append(d)
        return d

    try:
        # ------------------------------------------------ 账号与密码
        section('网页后台：密码')
        st, res, _ = login()
        check(st == 403 and res == {'err': 'login', 'msg': K.LOGIN_FAIL_MSG}, '没设密码时登录 → 统一错误文案', (st, res))
        for bad, why in (('short-pw-1', '至少 12'), ('password1234!', '常见'), ('aaaaaaaaaaaaaa', '常见'), ('123456789012345', '常见'),
                         ('qwertyuiop1234', '常见'), ('myboss-is-great99', '用户名'), ('xxadminxx-2026', 'admin'),
                         ('kmsync-rocks-77', 'kmsync'), ('ip127.0.0.1zz!', '服务器地址')):
            st, r = adm.call('web.setPassword', {'user': 'boss', 'pw': bad})
            if not check(st == 200 and not r['ok'] and why in r['msg'], f'弱密码被拒：「{bad}」→ {r and r.get("msg")}', r):
                break
        st, r = adm.call('web.setPassword', {'user': 'b!', 'pw': PW})
        check(st == 200 and not r['ok'] and '用户名' in r['msg'], '用户名格式不对被拒', r)
        d = S(adm, 'web.setPassword', {'user': 'boss', 'pw': PW})
        check(d['enabled'] and d['user'] == 'boss' and d['has_password'], 'K 设置网页用户名和密码后网页登录打开', d)
        row = ln.node.adb.execute('SELECT pw_hash FROM web_user').fetchone()[0]
        check(row.startswith('scrypt$15$8$1$') and len(row.split('$')) == 6, '存的是 scrypt$15$8$1$盐$哈希', row[:20])
        ln.node.adb.commit()
        raw = b''.join(open(ln.node.adb_path + s_, 'rb').read() for s_ in ('', '-wal') if os.path.exists(ln.node.adb_path + s_))
        check(PW.encode() not in raw, 'admin.db 文件里搜不到密码明文')

        # ------------------------------------------------ 登录
        section('网页后台：登录')
        st, res, s1 = login()
        check(st == 200 and re.fullmatch(r'[0-9a-f]{8}', res['kid']) and len(b64d(res['key'])) == 32 and res['idle'] == 1800,
              '正确用户名 + 密码 → 返回会话号和 32 字节会话密钥', (st, res and {k: v for k, v in res.items() if k != 'key'}))
        same = []
        for args in ({'pw': PW + 'x'}, {'user': 'bosss'}, {'pw': ''}):
            a = {'pw': PW, 'user': 'boss', **args}
            same.append(login(a['pw'], a['user'], ip='198.18.1.1')[:2])
        S(adm, 'web.setEnabled', {'enabled': False})
        same.append(login(ip='198.18.1.2')[:2])
        S(adm, 'web.setEnabled', {'enabled': True})
        check(all(x == (403, {'err': 'login', 'msg': K.LOGIN_FAIL_MSG}) for x in same), '密码错、用户名错、空密码、网页登录关闭 → 同一个错误文案', same)
        check(s1.call('status')[0] == 403, '关闭网页登录时已有会话立即失效', '')
        ln.advance(3700)
        # 同一 IP 5 次失败 → 封 1 小时（和管理接口同一个计数）
        ip = '203.0.113.70'
        for _ in range(5):
            login(PW + '!', ip=ip)
        st, res, _ = login(ip=ip)
        check(st == 403 and res['err'] == 'denied', '同一 IP 登录失败 5 次后，正确密码也被拒（封 1 小时）', (st, res))
        check(adm.call('status', ip=ip)[0] == 403, '登录失败和管理接口进同一个计数：这个 IP 的管理密钥请求也 403', '')
        ln.advance(3601)
        st, res, _ = login(ip=ip)
        check(st == 200, '1 小时后自动解封', (st, res))
        # 管理接口失败也算进登录的计数
        ip = '203.0.113.71'
        for _ in range(5):
            _, body = adm.envelope('status', {}, kid='abababab')
            adm.send_raw(body, ip)
        check(login(ip=ip)[0] == 403, '管理接口认证失败 5 次后，这个 IP 的网页登录也被拒', '')
        ln.advance(7200)
        for i in range(30):
            login(PW + 'bad', ip=f'198.51.100.{100 + i}', user='nobody')
        st, res, _ = login(ip='192.0.2.150')
        check(st == 403 and res['err'] == 'denied', '全局 1 小时失败 30 次 → 熔断，网页登录也被拒', (st, res))
        st, res, _ = login(via=local)
        check(st == 200, '熔断时 127.0.0.1（SSH 隧道）照常登录', (st, res))
        ln.advance(3601)
        # 账号级：1 小时 10 次失败（每次换一个 IP，不触发封 IP）→ 网页登录暂停，管理密钥不受影响
        for i in range(10):
            login(PW + str(i), ip=f'198.51.100.{200 + i}')
        st, res, _ = login(ip='192.0.2.160')
        check(st == 403 and res['err'] == 'paused', '账号 1 小时内失败 10 次 → 网页登录暂停（正确密码也不行）', (st, res))
        check(adm.call('status', ip='192.0.2.161')[0] == 200, '网页登录暂停时，管理密钥 K（审批 App）的请求照常成功', '')
        check(S(adm, 'web.status')['paused'], 'web.status 显示网页登录已暂停', '')
        ln.advance(3601)
        st, res, _ = login(ip='192.0.2.160')
        check(st == 200, '1 小时后网页登录恢复', (st, res))
        # IP 名单、关闭外网管理同样管登录
        S(adm, 'access.set', {'remote': False, 'ips': []})
        st, res, _ = login(ip='192.0.2.170')
        st2, _, _ = login()
        check(st == 403 and res['err'] == 'denied' and st2 == 200, '关闭外网管理后外网来源不能登录、本机照常', (st, st2))
        S(adm, 'access.set', {'remote': True, 'ips': ['192.0.2.0/24']})
        check(login(ip='198.18.9.9')[0] == 403 and login(ip='192.0.2.171')[0] == 200, 'IP 名单对网页登录生效：名单外拒绝、名单内可以', '')
        S(adm, 'access.set', {'remote': True, 'ips': []})
        ln.advance(7200)
        for _ in range(7):
            login(PW + '?')
        check(login()[0] == 200, '127.0.0.1 失败多次也不会被封', '')

        # ------------------------------------------------ 会话
        section('网页后台：会话')
        ln.advance(3700)
        _, _, s = login()
        every = {
            'status': {}, 'groups.list': {}, 'invites.list': {}, 'log.list': {'limit': 5},
            'invites.create': {'label': '网页', 'days': 1, 'uses': 1}, 'limits.set': dict(K.DEFAULT_LIMITS),
            'expiry.set': {'date': '2026-11-16'}, 'access.set': {'remote': True, 'ips': []},
        }
        okc = [op for op, a in every.items() if s.call(op, a)[1].get('ok')]
        inv = Invite(s.ok('invites.create', {'label': '网页', 'days': 1, 'uses': 3})['qr'])
        okc.append('invites.revoke') if s.call('invites.revoke', {'id': s.ok('invites.list')[1]['id']})[1]['ok'] else None
        gid, key = new_group()
        DevClient(http, gid, key, 'w1').create(inv)
        for op in ('groups.setNote', 'groups.setQuota', 'groups.clear', 'groups.remove', 'groups.unblock'):
            a = {'gid': gid, 'note': '网页备注'} if op == 'groups.setNote' else {'gid': gid, 'mb': 30} if op == 'groups.setQuota' else {'gid': gid}
            okc.append(op) if s.call(op, a)[1]['ok'] else None
        check(len(okc) == 14, f'网页会话调第一期全部 14 个管理操作都成功（{len(okc)} 个）', okc)
        ctr, body = s.envelope('status', {})
        st1, _, _ = s.send_raw(body)
        st2, r2, _ = s.send_raw(body)
        check(st1 == 200 and st2 == 403 and r2 == {}, '会话请求原样重放 → 403 {}', (st1, st2, r2))
        ctr, body = s.envelope('status', {}, ctr=s.last - 10)
        check(s.send_raw(body)[:2] == (403, {}), '会话 ctr 变小 → 403 {}', '')
        ctr, body = s.envelope('status', {})
        env = json.loads(body)
        b = bytearray(b64d(env['ct']))
        b[2] ^= 1
        env['ct'] = b64e(bytes(b))
        check(s.send_raw(json.dumps(env).encode())[:2] == (403, {}), '会话密文改一个字节 → 403 {}', '')
        _, body = s.envelope('status', {}, ctr=int(time.time() * 1000) + 600000)   # 别的标签页用过更大的计数
        s.send_raw(body)
        s.last, s.retried = 1, 0
        check(s.call('status')[0] == 200 and s.retried == 1, '会话的计数落后时也能凭只有自己看得懂的提示重试一次', s.retried)
        ln.advance(31 * 60)
        check(s.call('status')[0] == 403, '空闲 30 分钟后会话 403', '')
        _, _, s = login()
        alive = True
        for i in range(40):           # 每 20 分钟用一次，不空闲，到 12 小时也过期
            ln.advance(20 * 60)
            alive = s.call('status')[0] == 200
            if not alive:
                break
        check(not alive and 11 * 3 <= i <= 12 * 3 + 1, f'一直在用的会话 12 小时后也 403（第 {(i + 1) * 20 // 60} 小时）', i)
        ln.advance(3600)
        made = [login()[2] for _ in range(6)]
        st0 = made[0].call('status')[0]
        check(st0 == 403 and all(m.call('status')[0] == 200 for m in made[1:]), '第 6 个会话把最早的踢掉', st0)
        lst = S(made[1], 'web.sessions')
        check(len([x for x in lst if x['alive']]) == 5 and sum(1 for x in lst if x['current']) == 1, '会话列表：5 个，标出当前这个', len(lst))
        S(adm, 'web.revoke', {'kid': made[1].kid})
        check(made[1].call('status')[0] == 403, 'K 踢下线后这个会话立即 403', '')
        S(made[2], 'web.revoke', {'kid': made[3].kid})
        check(made[3].call('status')[0] == 403, '网页上也能踢掉自己的另一个会话', '')
        S(made[2], 'web.logout')
        check(made[2].call('status')[0] == 403, '退出后会话立即 403', '')
        S(adm, 'web.revoke', {'all': True})
        check(all(m.call('status')[0] == 403 for m in made[4:]), 'K「全部踢下线」后所有会话 403', '')
        _, _, s = login()
        on8787 = AdminClient.session(http, s.kid, s.k)
        check(on8787.call('status')[0] == 403, '会话 kid 拿到 8787 上 → 403（会话不能当审批 App 的管理码用）', '')
        st, res, _ = http.send('POST', '/admin/web/login', json.dumps({'user': 'boss', 'pw': PW}).encode())
        check(st == 404, '/admin/web/login 在 8787 上 → 404', (st, res))
        st, res, _ = login(via=local)
        check(st == 200 and res['kid'], '127.0.0.1:8788（SSH 隧道）上也能登录', '')
        check(AdminClient.session(https, res['kid'], res['key']).call('status')[0] == 200, '会话在 443 和 8788 上通用', '')
        check(adm.call('status')[0] == 200 and AdminClient(https, keyinfo['admin_qr']).call('status')[0] == 200, '管理密钥 K 在 8787 和 443 上都能用', '')

        # ------------------------------------------------ 权限
        section('网页后台：权限')
        ln.advance(3700)
        _, _, s = login()
        denied = []
        for op, a in (('web.setPassword', {'user': 'boss', 'pw': PW2}), ('web.totpReset', {}), ('web.setEnabled', {'enabled': False}),
                      ('web.status', {}), ('web.reset', {}), ('access.set', {'remote': False, 'ips': []})):
            st, r = s.call(op, a)
            denied.append(st == 200 and not r['ok'] and r['err'] == 'perm')
        check(all(denied), '会话调 web.setPassword / totpReset / setEnabled / status / reset、改「外网管理」开关 → 拒绝', denied)
        check(S(adm, 'status')['remote_admin'], '外网管理开关没被网页改掉', '')
        denied = []
        for op, a in (('web.changePassword', {'old': PW, 'new': PW2}), ('web.totpBegin', {'pw': PW}), ('web.totpConfirm', {'code': '123456'}),
                      ('web.totpDisable', {'pw': PW, 'code': '123456'}), ('web.whoami', {}), ('web.logout', {})):
            st, r = adm.call(op, a)
            denied.append(st == 200 and not r['ok'] and r['err'] == 'perm')
        check(all(denied), 'K 调网页专用的 changePassword / totp* / whoami / logout → 拒绝', denied)
        me = S(s, 'web.whoami')
        check(me['user'] == 'boss' and me['kid'] == s.kid and not me['totp'], 'web.whoami 返回自己的用户名和会话号', me)

        # ------------------------------------------------ 改密码
        _, _, s2 = login()
        st, r = s.call('web.changePassword', {'old': PW + 'x', 'new': PW2})
        check(st == 200 and not r['ok'] and r['err'] == 'pw', '改密码时旧密码不对 → 拒绝', r)
        st, r = s.call('web.changePassword', {'old': PW, 'new': 'password12345'})
        check(st == 200 and not r['ok'], '改成弱密码 → 拒绝', r)
        S(s, 'web.changePassword', {'old': PW, 'new': PW2})
        check(s.call('status')[0] == 403 and s2.call('status')[0] == 403, '改密码后全部旧会话 403', '')
        check(login()[0] == 403 and login(PW2)[0] == 200, '改密码后旧密码不能登录、新密码可以', '')

        # ------------------------------------------------ 二次验证
        section('网页后台：二次验证（TOTP）')
        seed = b'12345678901234567890'
        vec = [(59, '94287082'), (1111111109, '07081804'), (1111111111, '14050471'), (1234567890, '89005924'), (2000000000, '69279037'),
               (20000000000, '65353130')]
        check(all(K.totp(seed, t // 30, 8) == c for t, c in vec), 'RFC 6238 附录 B 标准测试向量（SHA-1）全部通过', '')
        _, _, s = login(PW2)
        st, r = s.call('web.totpBegin', {'pw': PW})
        check(st == 200 and not r['ok'], '开启二次验证要输对当前密码', r)
        tb = S(s, 'web.totpBegin', {'pw': PW2})
        responses.pop()        # 这一条响应本来就要带 TOTP 密钥（显示二维码用），不算泄露
        sec = base64.b32decode(tb['secret'] + '=' * (-len(tb['secret']) % 8))
        secrets_seen.append(tb['secret'])
        check(tb['uri'].startswith('otpauth://totp/') and 'issuer=km-sync' in tb['uri'] and len(sec) == 20, '开启时给出二维码内容（otpauth://）和文字密钥', tb['uri'][:30])
        now = ln.node.now()
        wrong = '%06d' % ((int(K.totp(sec, int(now // 30))) + 1) % 1000000)
        st, r = s.call('web.totpConfirm', {'code': wrong})
        check(st == 200 and not r['ok'] and not S(adm, 'web.status')['totp'], '确认时输错码 → 不生效', r)
        S(s, 'web.totpConfirm', {'code': K.totp(sec, int(now // 30))})
        check(S(adm, 'web.status')['totp'], '输对当前码 → 二次验证生效', '')
        ln.advance(90)
        now = ln.node.now()
        st, res, _ = login(PW2)
        check(st == 403 and res['msg'] == K.LOGIN_FAIL_MSG, '开了二次验证后只输密码 → 统一错误文案', (st, res))
        check(login(PW2, code=K.totp(sec, int(now // 30) - 1))[0] == 200, '前一个 30 秒的码可以用', '')
        check(login(PW2, code=K.totp(sec, int(now // 30) - 2))[0] == 403, '再前一个 30 秒的码不行', '')
        ln.advance(60)
        now = ln.node.now()
        c = K.totp(sec, int(now // 30) + 1)
        st1 = login(PW2, code=c)[0]
        st2 = login(PW2, code=c)[0]
        check(st1 == 200 and st2 == 403, '后一个 30 秒的码可以用；同一个码第二次被拒（防重放）', (st1, st2))
        ln.advance(120)
        S(adm, 'web.totpReset')
        check(login(PW2)[0] == 200 and not S(adm, 'web.status')['totp'], 'K 关掉二次验证（手机丢了）后只用密码就能登录', '')
        _, _, s = login(PW2)
        tb = S(s, 'web.totpBegin', {'pw': PW2})
        responses.pop()
        secrets_seen.append(tb['secret'])
        sec = base64.b32decode(tb['secret'] + '=' * (-len(tb['secret']) % 8))
        S(s, 'web.totpConfirm', {'code': K.totp(sec, int(ln.node.now() // 30))})
        ln.advance(60)
        S(s, 'web.totpDisable', {'pw': PW2, 'code': K.totp(sec, int(ln.node.now() // 30))})
        check(not S(adm, 'web.status')['totp'], '网页上输密码 + 当前码关闭二次验证', '')

        # ------------------------------------------------ 日志
        section('网页后台：日志')
        _, _, s = login(PW2)
        S(s, 'groups.setNote', {'gid': gid, 'note': '网页写'})
        S(adm, 'groups.setNote', {'gid': gid, 'note': 'App 写'})
        items = S(adm, 'log.list', {'limit': 100})['items']
        w = next(i for i in items if i['op'] == 'groups.setNote' and i['note'] == '备注改为「网页写」')
        a = next(i for i in items if i['op'] == 'groups.setNote' and i['note'] == '备注改为「App 写」')
        check(w['who'].startswith('网页 boss') and a['who'] == f'管理员 {adm.kid}', '网页写操作记「网页 用户名」、App 的记「管理员 kid」', (w['who'], a['who']))
        allog = S(adm, 'log.list', {'limit': 100})['items']
        while True:
            more = S(adm, 'log.list', {'limit': 100, 'before': allog[-1]['id']})
            allog += more['items']
            if not more['more']:
                break
        ops = {(i['op'], i['result']) for i in allog}
        need = [('web.login', '成功'), ('web.login', '拒绝'), ('web.logout', '成功'), ('web.revoke', '成功'), ('web.changePassword', '成功'),
                ('web.totpConfirm', '成功'), ('web.totpDisable', '成功'), ('web.totpReset', '成功'), ('web.setPassword', '成功'),
                ('web.setEnabled', '成功'), ('web.pause', '成功'), ('web.setPassword', '失败')]
        miss = [x for x in need if x not in ops]
        check(not miss, '登录成功/失败、退出、踢下线、改密码、开关二次验证、设密码、暂停都有日志', miss)
        fl = [i for i in allog if i['op'] == 'web.login' and i['result'] == '拒绝']
        check(fl and all(i['sec'] for i in fl) and any('密码不对' in i['note'] for i in fl) and any('用户名不对' in i['note'] for i in fl),
              '登录失败是安全事件，日志里写清原因', fl[:1])
        dbtext = '\n'.join(str(c_) for r in ln.node.adb.execute('SELECT * FROM log') for c_ in r)
        texts = dbtext + '\n'.join(s_ for r in responses for s_ in all_strings(r))
        leak = [x[:6] + '…' for x in secrets_seen if x in texts]
        check(not leak, f'日志和所有管理响应里都没有密码、会话密钥、TOTP 密钥（检查了 {len(secrets_seen)} 个）', leak)

        # ------------------------------------------------ 80 端口、静态文件、安全头
        section('网页后台：80 端口、静态文件、安全头')
        with open(os.path.join(ln.acme, '.well-known', 'acme-challenge', 'tok_ABC-123'), 'w') as f:
            f.write('tok_ABC-123.thumb')
        st, res, hdr = acme.send('GET', '/.well-known/acme-challenge/tok_ABC-123')
        check(st == 200 and res == b'tok_ABC-123.thumb', '80：/.well-known/acme-challenge/<文件> 返回文件内容', (st, res))
        st, res, hdr = acme.send('GET', '/some/page?x=1')
        check(st == 301 and hdr.get('Location') == ln.node.web_url + '/some/page?x=1', '80：其它路径 301 到 https', (st, hdr.get('Location')))
        st1 = acme.send('POST', '/admin/v1', b'{}')[0]
        st2 = acme.send('GET', '/v1/hello')[0]
        st3 = acme.send('GET', '/.well-known/acme-challenge/../../km_sync_node.py')[0]
        check(st1 == 404 and st2 == 404 and st3 == 404, '80：/admin/v1、/v1/hello、跳出目录 都不可用', (st1, st2, st3))
        got = {}
        for path in ('/', '/index.html', '/web.js', '/web.css', '/node.js', '/node.css', '/vendor/qrcode.js', '/vendor/jsQR.js'):
            st, res, hdr = https.send('GET', path)
            got[path] = (st, hdr)
        check(all(v[0] == 200 for v in got.values()), '白名单里的 8 个文件都能取到', {k: v[0] for k, v in got.items()})
        st, res, hdr = https.send('GET', '/')
        check(b'__V__' not in res and K.VERSION.encode() in res and b'<script>' not in res and b'onclick=' not in res,
              'index.html：文件名带版本号、没有内联脚本', '')
        bad = {}
        for path in ('/../km_sync_node.py', '/%2e%2e/km_sync_node.py', '/opt/km-sync/km_sync_node.py', '/km_sync_node.py', '/web', '/vendor/',
                     '/.git/config', '/web.js/../node.js', '//etc/passwd'):
            c_ = http_client_raw('127.0.0.1', ln.hports['https'], ln.ctx(), path)
            bad[path] = c_
        check(all(v == 404 for v in bad.values()), '白名单外的路径（../、%2e%2e、/opt/…、源码）都是 404', bad)
        hs = []
        for cli, path, method, body in ((https, '/', 'GET', b''), (https, '/admin/v1', 'POST', b'{}'), (https, '/admin/web/login', 'POST', b'{}'),
                                        (https, '/nope', 'GET', b''), (local, '/', 'GET', b''), (local, '/admin/v1', 'POST', b'{}')):
            st, res, hdr = cli.send(method, path, body)
            hs.append((cli is https, hdr))
        okh = all(h.get('Content-Security-Policy') == K.CSP and h.get('X-Content-Type-Options') == 'nosniff'
                  and h.get('Referrer-Policy') == 'no-referrer' for _, h in hs)
        check(okh, '443 和 8788 所有响应都带 CSP、nosniff、no-referrer', [h.get('Content-Security-Policy', '')[:20] for _, h in hs])
        check(all(('Strict-Transport-Security' in h) == is443 for is443, h in hs) and hs[0][1]['Strict-Transport-Security'] == 'max-age=604800',
              '443 带 HSTS（7 天），8788 不带', '')
        st, res, hdr = https.send('POST', '/admin/web/login', json.dumps({'user': 'boss', 'pw': 'x'}).encode())
        check(hdr.get('Cache-Control') == 'no-store', '接口响应 Cache-Control: no-store', hdr.get('Cache-Control'))
        check(http.send('GET', '/')[0] == 404 and http.send('GET', '/web.js')[0] == 404, '8787 上没有网页文件', '')

        # ------------------------------------------------ 证书
        section('网页后台：证书热更新、证书出问题不影响 App 和同步')
        der1 = peer_cert(ln.hports['https'])
        srv_before = ln.websrv['https']
        c2, k2 = make_cert(ln.tlsdir, 'b', cn='km-new')
        shutil.copy(k2, ln.key)
        shutil.copy(c2, ln.cert)
        time.sleep(1.2)
        der2 = peer_cert(ln.hports['https'])
        check(der1 and der2 and der1 != der2 and der2 == ssl.PEM_cert_to_DER_cert(open(c2).read()), '换证书文件后，新连接拿到新证书', '')
        check(ln.websrv['https'] is srv_before and K.TLS(ln.cert, ln.key).interval == 60, '进程没有重启（同一个服务）；正式运行每 60 秒检查一次', '')
        with open(ln.cert, 'w') as f:
            f.write('-----BEGIN CERTIFICATE-----\nbroken\n-----END CERTIFICATE-----\n')
        time.sleep(1.2)
        der3 = peer_cert(ln.hports['https'])
        st = AdminClient(http, keyinfo['admin_qr']).call('status')
        check(der3 == der2 and 'loaded' not in str(ln.node.tls.err) and ln.node.tls.err, '证书文件坏了：443 继续用旧证书', ln.node.tls.err)
        check(http.send('GET', '/v1/hello')[0] == 200 and st[0] == 200 and st[1]['data']['tls']['err'], '证书文件坏了：8787 设备接口和 App 管理接口照常，status 里报告证书错误', '')
        # 过期证书：浏览器打不开网页后台，App 和同步不受影响，status 报告剩余小时为负
        ce, ke = make_cert(ln.tlsdir, 'old', days=1)
        shutil.copy(ke, ln.key)
        shutil.copy(ce, ln.cert)
        time.sleep(1.2)
        ln.node.tls.check(force=True)
        ln.advance(3 * 86400)
        s_ = A_ok(adm, 'status')
        check(s_['tls']['enabled'] and s_['tls']['hours_left'] < 0, f'证书过期：status 显示剩余 {s_["tls"]["hours_left"]} 小时（节点标签会出红点）', s_['tls'])
        gid2, key2 = new_group()
        inv2 = Invite(A_ok(adm, 'invites.create', {'label': '证书过期', 'days': 7, 'uses': 1})['qr'])
        d_ = DevClient(http, gid2, key2, 'x')
        st1, _ = d_.create(inv2)
        st2, _ = d_.push([('s', 1, 'c', b'abc')])
        check(st1 == 200 and st2 == 200, '证书过期时学生同步（建组、push）照常', (st1, st2))
        ln.advance(-3 * 86400)
        # 没有证书：443 不接受连接，其它照常
        for p_ in (ln.cert, ln.key):
            os.remove(p_)
        t2 = K.TLS(ln.cert, ln.key, interval=1)
        srv = K.serve(ln.node, '127.0.0.1', 0, channel='web', tls=t2)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        try:
            refused = peer_cert(srv.server_address[1]) is None
        finally:
            srv.shutdown()
            srv.server_close()
        check(refused and not t2.status(ln.node.ms())['enabled'] and http.send('GET', '/v1/hello')[0] == 200,
              '还没有证书：443 不接受连接、status 显示未启用，8787 照常', t2.err)
        # 443 端口被占用起不来：只打印原因，8787 照常
        busy = socket.socket()
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            busy.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)   # Windows：不让别人复用这个端口
        busy.bind(('127.0.0.1', 0))
        busy.listen(1)
        cfg = {'listen': '127.0.0.1', 'public_host': '127.0.0.1', 'https_port': busy.getsockname()[1], 'http_port': 0, 'local_web_port': 0,
               'tls_cert': ln.cert, 'tls_key': ln.key, 'web_dir': ln.webdir, 'acme_dir': ln.acme}
        n2 = K.Node(os.path.join(ln.dir, 'n2'), '127.0.0.1', 0, aes=K._AESGCM or K.PyAESGCM)
        started = K.start_web(n2, cfg)
        busy.close()
        n2.ndb.close()
        n2.adb.close()
        check(started == [] and http.send('GET', '/v1/hello')[0] == 200, '443 端口起不来时 start_web 不抛错，同步照常', started)
    finally:
        ln.cleanup()


def A_ok(adm, op, args=None):
    return adm.ok(op, args)


def peer_cert(port):
    """连 https 拿对方证书（不校验），连不上返回 None。"""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        with socket.create_connection(('127.0.0.1', port), timeout=5) as raw:
            with ctx.wrap_socket(raw, server_hostname='127.0.0.1') as s:
                return s.getpeercert(binary_form=True)
    except (OSError, ssl.SSLError):
        return None


def http_client_raw(host, port, ctx, path):
    """原样发路径（http.client 会原样发，不规范化 ../）。"""
    c = http.client.HTTPSConnection(host, port, timeout=10, context=ctx)
    c.putrequest('GET', path, skip_accept_encoding=True)
    c.endheaders()
    st = c.getresponse().status
    c.close()
    return st


def run_migration():
    section('admin.db 从 1.0.0（表结构 1）升级到 1.1.0（表结构 2）')
    d = tempfile.mkdtemp(prefix='km-sync-mig-')
    try:
        saved = K.ADMIN_SCHEMA
        K.ADMIN_SCHEMA = saved[:1]           # 模拟 1.0.0 的库
        try:
            n = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
            key = n.new_admin_key()
            inv = n.create_invite('旧邀请码', 30, 5)
            n.adb.execute("INSERT INTO known_groups(gid, invite_id, created, blocked_at, note) VALUES(?,?,1,2,'旧备注')", ('ab' * 16, inv['id']))
            n.adb.execute("INSERT INTO bans VALUES('192.0.2.1', 99999999999999)")
            n.log('管理员 x', '1.2.3.4', 'groups.setNote', 'ababab', '成功', '旧日志')
            n.adb.commit()
            ver1 = n.adb.execute("SELECT v FROM meta WHERE k='schema'").fetchone()[0]
            n.ndb.close()
            n.adb.close()
        finally:
            K.ADMIN_SCHEMA = saved
        n = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
        ver2 = n.adb.execute("SELECT v FROM meta WHERE k='schema'").fetchone()[0]
        check(ver1 == '1' and ver2 == str(len(saved)), f'表结构 1 → {len(saved)}', (ver1, ver2))
        ok = (n.adb.execute('SELECT label FROM invites WHERE id=?', (inv['id'],)).fetchone() == ('旧邀请码',)
              and n.known('ab' * 16)['note'] == '旧备注' and n.known('ab' * 16)['blocked_at'] == 2
              and n.adb.execute("SELECT 1 FROM bans WHERE ip='192.0.2.1'").fetchone()
              and n.adb.execute('SELECT kid FROM admin_keys').fetchone()[0] == key['kid']
              and n.adb.execute("SELECT 1 FROM log WHERE note='旧日志'").fetchone())
        check(ok, '升级后邀请码、组登记、封禁、管理密钥、日志都在', '')
        check(os.path.exists(os.path.join(d, 'admin.db.v1.bak')), '升级前备份了 admin.db.v1.bak', os.listdir(d))
        b = sqlite3.connect(os.path.join(d, 'admin.db.v1.bak'))
        check(b.execute("SELECT v FROM meta WHERE k='schema'").fetchone()[0] == '1' and b.execute('SELECT COUNT(*) FROM invites').fetchone()[0] == 1,
              '备份是升级前的表结构 1', '')
        b.close()
        check(n.adb.execute("SELECT 1 FROM log WHERE op='migrate' AND note LIKE '%1 → 2%'").fetchone(), '迁移写了一条日志', '')
        n.ndb.close()
        n.adb.close()
        # 回滚到 1.0.0 的程序：它只认表结构 1 的表，多出来的两张表不影响
        K.ADMIN_SCHEMA = saved[:1]
        try:
            n = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
            check(n.adb.execute('SELECT COUNT(*) FROM invites').fetchone()[0] == 1, '用只认表结构 1 的程序打开新库也正常（模拟回滚到 1.0.0）', '')
            n.ndb.close()
            n.adb.close()
        finally:
            K.ADMIN_SCHEMA = saved
    finally:
        shutil.rmtree(d, ignore_errors=True)


def serve_dev(port):
    """浏览器里手动试网页后台：在 127.0.0.1:<port> 起一个本地节点的网页后台（明文，localhost 是安全上下文），
    临时目录、随机密码（只打印在这个窗口里，Ctrl+C 退出后连同数据一起删掉），并造一些假数据。"""
    ln = LocalNode()
    n = ln.node
    n.web_dir = os.path.join(ln.dir, 'web')
    copy_web(n.web_dir)
    srv = K.serve(n, '127.0.0.1', port, test_ip_header=False, channel='web')
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    http = Http('127.0.0.1', ln.port)
    adm = AdminClient(http, n.new_admin_key()['admin_qr'])
    pw = 'dev-' + secrets.token_urlsafe(12)
    adm.ok('web.setPassword', {'user': 'boss', 'pw': pw})
    for label, uses in (('小明', 3), ('小红', 1)):
        inv = Invite(adm.ok('invites.create', {'label': label, 'days': 7, 'uses': uses})['qr'])
        gid, key = new_group()
        for d in ('padA', 'padB'):
            c = DevClient(http, gid, key, d)
            c.create(inv)
            c.push([('s1', 1, 'c', secrets.token_bytes(20000)), ('s2', 1, 'c', secrets.token_bytes(5000))])
    adm.ok('invites.create', {'label': '作废的', 'days': 1, 'uses': 1})
    adm.ok('invites.revoke', {'id': adm.ok('invites.list')[0]['id']})
    print('')
    print(f'网页后台：http://127.0.0.1:{port}/   用户名 boss   临时密码 {pw}')
    print(f'管理码（审批 App 用，8787 在 127.0.0.1:{ln.port}）只在内存里。Ctrl+C 退出并删除临时数据。', flush=True)
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        pass
    finally:
        srv.shutdown()
        srv.server_close()
        ln.cleanup()


def inv_text_with_secret(inv, secret):
    return f'kmnode:1?h={inv.host}&p={inv.port}&i={inv.id}&s={base64.b32encode(secret).decode().rstrip("=")}'


def find_jdk(tool):
    jh = os.environ.get('JAVA_HOME')
    for p in ([os.path.join(jh, 'bin', tool + '.exe'), os.path.join(jh, 'bin', tool)] if jh else []):
        if os.path.exists(p):
            return p
    return shutil.which(tool)


def run_java(admin_text):
    javac, java = find_jdk('javac'), find_jdk('java')
    if not javac or not java:
        check(False, '找不到 javac/java（设 JAVA_HOME 或加到 PATH）')
        return
    src = os.path.join(ROOT, 'team-admin-app', 'android')
    out = tempfile.mkdtemp(prefix='km-nodetest-')
    try:
        r = subprocess.run([javac, '-encoding', 'UTF-8', '-d', out,
                            os.path.join(src, 'src', 'com', 'fjzk', 'teamadmin', 'Node.java'),
                            os.path.join(src, 'test', 'NodeTest.java')], capture_output=True, text=True)
        if not check(r.returncode == 0, 'javac 编译 Node.java + NodeTest.java', r.stderr[-800:]):
            return
        r = subprocess.run([java, '-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-cp', out, 'com.fjzk.teamadmin.NodeTest', admin_text],
                           capture_output=True, timeout=120)
        text = r.stdout.decode('utf-8', 'replace')
        for line in text.splitlines():
            if line.startswith('OK ') or line.startswith('FAIL '):
                check(line.startswith('OK '), 'Java：' + line[3:].strip() if line.startswith('OK ') else 'Java：' + line[5:].strip())
        check(r.returncode == 0 and 'ALL OK' in text, 'NodeTest 全部通过', text[-800:] + r.stderr.decode('utf-8', 'replace')[-400:])
    finally:
        shutil.rmtree(out, ignore_errors=True)


# ---------------------------------------------------------------- 远程

def signing_dir():
    if os.environ.get('KM_SIGNING_DIR'):
        return os.environ['KM_SIGNING_DIR']
    try:
        common = subprocess.run(['git', '-C', HERE, 'rev-parse', '--path-format=absolute', '--git-common-dir'],
                                capture_output=True, text=True).stdout.strip()
        if common:
            return os.path.join(os.path.dirname(common), 'knowledge-map-app', 'signing')
    except OSError:
        pass
    return os.path.join(ROOT, 'knowledge-map-app', 'signing')


def run_remote_web(http, adm, pub):
    """公网网页后台（1.1.0）：证书由系统信任的 CA 校验（不跳过校验）。
    只在「网页登录还没设置」时用一个临时密码走完整登录流程，结束时 web.reset 恢复成没设置；
    管理员已经设过密码时只测「错误密码被拒、记进日志」，不动管理员的设置。临时密码只在内存里，不打印。"""
    section(f'远程网页后台 https://{pub}/')
    https = Http(pub, 443, tls=ssl.create_default_context())
    st, res, hdr = https.send('GET', '/')
    check(st == 200 and hdr.get('Server', '').startswith('km-sync/') and hdr.get('Content-Security-Policy') == K.CSP
          and 'max-age' in hdr.get('Strict-Transport-Security', ''), f'https 证书校验通过、是 km-sync 的页面（{hdr.get("Server")}），带安全头', (st, hdr.get('Server')))
    st, res, hdr = Http(pub, 80).send('GET', '/abc')
    check(st == 301 and hdr.get('Location') == f'https://{pub}/abc', '80 端口跳转 https', (st, hdr.get('Location')))
    w = adm.ok('status')['web']
    tls = adm.ok('status')['tls']
    check(tls['enabled'] and tls['hours_left'] > 48 and "Let's Encrypt" in tls['issuer'], f'status 里的证书：剩 {tls["hours_left"]} 小时，{tls["issuer"]}', tls)
    if not w['has_password']:
        pw = 'auto-' + secrets.token_urlsafe(18)
        try:
            adm.ok('web.setPassword', {'user': 'autotest', 'pw': pw})
            st, res, _ = web_login(https, 'autotest', pw)
            check(st == 200 and res.get('kid'), '临时密码登录成功（自动测试）', st)
            sess = AdminClient.session(https, res['kid'], res['key'])
            s = sess.ok('status')
            check(s['version'] == K.VERSION or s['version'], f'网页会话调 status 成功（{s["version"]}）', '')
            check(AdminClient.session(http, res['kid'], res['key']).call('status')[0] == 403, '会话 kid 拿到 8787 上 → 403', '')
            sess.ok('web.logout')
            check(sess.call('status')[0] == 403, '退出后会话 403', '')
        finally:
            adm.ok('web.reset')
            pw = None
        check(not adm.ok('web.status')['has_password'], '临时密码已作废：网页登录恢复成「没设置」', '')
    else:
        st, res, _ = web_login(https, w['user'], 'wrong-' + secrets.token_urlsafe(12))
        check(st == 403 and res.get('msg') == K.LOGIN_FAIL_MSG, '管理员已设密码：只测错误密码被拒（不改管理员的设置）', (st, res))
        logs = adm.ok('log.list', {'limit': 20, 'sec': True})['items']
        check(any(i['op'] == 'web.login' and i['result'] == '拒绝' for i in logs), '错误密码记进了安全日志', '')


def run_remote(addr, web=True):
    host, port = addr.rsplit(':', 1)
    port = int(port)
    path = os.path.join(signing_dir(), 'sync-node.json')
    with open(path, encoding='utf-8') as f:
        info = json.load(f)
    http = Http(host, port)
    adm = AdminClient(http, info['admin_qr'])
    LABEL = '自动测试'
    made_groups, made_inv = [], []
    try:
        section(f'远程节点 {addr}')
        st, res, _ = http.send('GET', '/v1/hello')
        check(st == 200 and res['node'] == 'km-sync', f'/v1/hello（版本 {res and res.get("ver")}）', res)
        s = adm.ok('status')
        check(s['version'] == res['ver'] and s['your_ip'] == '127.0.0.1', f'管理接口可用（到期 {s["expiry"]}，还剩 {s["days_left"]} 天，'
              f'磁盘剩 {s["disk_free"] / 1e9:.1f} GB）', s)
        inv = adm.ok('invites.create', {'label': LABEL, 'days': 1, 'uses': 3})
        made_inv.append(inv['id'])
        check(inv['qr'].startswith('kmnode:1?h=43.142.41.27&p=8787&i='), '邀请码二维码内容指向公网地址', inv['qr'][:40])
        iv = Invite(inv['qr'])
        gid, key = new_group()
        made_groups.append((gid, key))
        a, b = DevClient(http, gid, key, 'autotestA'), DevClient(http, gid, key, 'autotestB')
        st, r = a.create(iv)
        check(st == 200, '建组', (st, r))
        blob = secrets.token_bytes(5000)
        st, r = a.push([('s1', 1, 'c1', blob)])
        st2, r2 = b.pull(0)
        check(st == 200 and st2 == 200 and b64d(r2['items'][0]['data']) == blob, 'push / pull', (st, st2))
        st, r = a.call('pull', {'since': 0}, key=b'\0' * 32)
        check(st == 401, '签名错 → 401', st)
        c = a.next_ctr()
        a.call('pull', {'since': 0}, ctr=c)
        st, r = a.call('pull', {'since': 0}, ctr=c)
        check(st == 401, '计数重复 → 401', st)
        g2, k2 = new_group()
        made_groups.append((g2, k2))
        st, r = a.successor(g2, k2)
        check(st == 200, 'successor 新组', (st, r))
        st, r = a.call('mail/put', {'to': 'autotestB', 'data': b64e(b'key-package'), 'ttl': 600})
        st2, r2 = b.call('mail/get', {})
        check(st == 200 and len(r2['items']) == 1, '信箱', (st, r2))
        rid = b64e(secrets.token_bytes(16))
        http.send('POST', f'/v1/rdv/{rid}', json.dumps({'op': 'put', 'side': 'a', 'data': b64e(b'hi')}).encode())
        st, r, _ = http.send('POST', f'/v1/rdv/{rid}', json.dumps({'op': 'get', 'side': 'b'}).encode())
        check(st == 200 and len(r['items']) == 1, '转交点', r)
        gl = {g['gid']: g for g in adm.ok('groups.list')}
        check(gid in gl and gl[gid]['invite_label'] == LABEL and len(gl[gid]['devices']) == 2, 'groups.list 看得到测试组和设备', gl.get(gid))
        texts = '\n'.join(all_strings(list(gl.values())))
        check(b64e(blob)[:40] not in texts, '管理响应里没有密文字节')
        adm.ok('groups.setNote', {'gid': gid, 'note': LABEL})
        # 封禁 / 解除封禁 / 重建用换钥后的新组 g2 测（旧组 gid 已经换钥，1.2.0 起不许重建）
        a2 = DevClient(http, g2, k2, 'autotestA')
        adm.ok('groups.remove', {'gid': g2})
        st, r = a2.pull(0)
        check(st == 403 and r['err'] == 'blocked', '移除后 403 blocked', (st, r))
        adm.ok('groups.unblock', {'gid': g2})
        st, r = a2.create(iv)
        check(st == 200 and r.get('rebuilt'), '解除封禁后重建（新组继承邀请号）', (st, r))
        st, r = a.call('drop', {})
        st2, r2 = b.create(iv)
        check(st == 200 and st2 == 403 and r2 == {'err': 'replaced'}, '换钥后的旧组删掉后，用邀请码重建 → 403 replaced（1.2.0）', (st, r, st2, r2))
        body = json.dumps({'v': 1}).encode()
        st, r, _ = http.send('POST', '/admin/v1', body, {'X-KM-Auth': a.auth('POST', '/admin/v1', body)})
        check(st == 403 and r == {}, '设备签名访问管理接口 → 403 {}', (st, r))
        logs = adm.ok('log.list', {'limit': 30})['items']
        check(any(i['op'] == 'groups.remove' and i['obj'] == g2[:6] for i in logs), '管理日志里有刚才的操作', '')
        if web:
            run_remote_web(http, adm, info.get('host') or '43.142.41.27')
    finally:
        # 清理：设备删组（连同登记一起删），作废邀请码
        for g, k in made_groups:
            d = DevClient(http, g, k, 'autotestA')
            st, _ = d.call('drop', {})
            if st == 403:
                try:
                    adm.ok('groups.unblock', {'gid': g})
                    d.call('drop', {})
                except AssertionError:
                    pass
        for i in made_inv:
            try:
                adm.ok('invites.revoke', {'id': i})
            except AssertionError:
                pass
        left_g = [g for g in adm.ok('groups.list') if g['gid'] in [x for x, _ in made_groups]]
        left_i = [i for i in adm.ok('invites.list') if i['label'] == LABEL and i['state'] == 'ok']
        check(not left_g and not left_i, '清理完毕：没有「自动测试」留下的组和有效邀请码', (left_g, left_i))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--remote', help='host:port，经 SSH 隧道测真实服务器')
    ap.add_argument('--no-java', action='store_true')
    ap.add_argument('--no-web', action='store_true', help='跳过网页后台部分')
    ap.add_argument('--serve', type=int, metavar='PORT', help='在 127.0.0.1:PORT 起一个带假数据的本地网页后台，浏览器里手动试')
    a = ap.parse_args()
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if not K._AESGCM:
        print('（本机没装 cryptography，本地节点和客户端改用内置的纯 Python AES-GCM；服务器上用的是 cryptography）')
    t = time.time()
    if a.serve:
        return serve_dev(a.serve)
    if a.remote:
        run_remote(a.remote, web=not a.no_web)
    else:
        run_local(java=not a.no_java)
        if not a.no_web:
            run_web_local()
            run_migration()
    bad = [n for ok, n in RESULTS if not ok]
    print(f'\n共 {len(RESULTS)} 项，通过 {len(RESULTS) - len(bad)} 项，失败 {len(bad)} 项，用时 {time.time() - t:.1f} 秒')
    for n in bad:
        print('  失败：' + n)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
