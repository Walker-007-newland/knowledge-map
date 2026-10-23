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

        # ------------------------------------------------ 1.3.0 彻底删除已移除的组登记（#6 第三期）
        section('彻底删除已移除的组登记（1.3.0）')
        invp = Invite(A('invites.create', {'label': '彻底删除', 'days': 7, 'uses': 5})['qr'])
        gp, kp = new_group()
        dp = DevClient(http, gp, kp, 'dp')
        dp.create(invp)
        dp.push([('s', 1, 'c', b'data')])
        st, r = adm.call('groups.purge', {'gid': gp})
        check(st == 200 and not r['ok'] and '已移除' in r['msg'], '没移除的组不能彻底删除', r)
        A('groups.remove', {'gid': gp})
        A('groups.purge', {'gid': gp})
        gl = {g['gid'] for g in A('groups.list')}
        check(gp not in gl and not ln.node.known(gp), '彻底删除后组登记从列表和 admin.db 里消失', '')
        row = ln.node.adb.execute('SELECT purged FROM tombstones WHERE gid=?', (gp,)).fetchone()
        check(row and row[0], '组号记进永久墓碑（purged）', row)
        r4 = [dp.create(invp), dp.pull(0), dp.push([('s', 2, 'c', b'x')])]
        check(all(s_ == 403 and res_ == {'err': 'blocked'} for s_, res_ in r4), '彻底删除后建组 / 重建、pull、push 都是 403 blocked（不能被复活）', r4)
        st, r = adm.call('groups.unblock', {'gid': gp})
        check(st == 200 and not r['ok'], '彻底删除后不能「解除封禁」', r)
        st, r = adm.call('groups.purge', {'gid': gp})
        check(st == 200 and not r['ok'], '重复彻底删除 → 失败提示', r)
        g_new, k_new = new_group()
        dq = DevClient(http, g_new, k_new, 'dq')
        dq.create(invp)
        st, res = dq.call('successor', {'gid': gp, **wrap(k_new, gp, kp)})
        check(st == 403 and res == {'err': 'blocked'}, '换钥建新组也不能用已彻底删除的组号（403 blocked）', (st, res))
        lg = A('log.list', {'limit': 20})['items']
        okp = [i for i in lg if i['op'] == 'groups.purge' and i['result'] == '成功']
        check(okp and okp[0]['obj'] == gp[:6] and adm.kid in okp[0]['who'] and '彻底删除' in okp[0]['note'], '彻底删除有日志（谁、对象、说明）', okp[:1])
        check(any(i['op'] == 'groups.purge' and i['result'] == '失败' for i in lg), '失败的彻底删除也有日志', '')
        check(any(i['op'] == 'invite.use' and i['result'] == '拒绝' and '彻底删除' in i['note'] for i in lg), '设备拿已删除的组号来建组：日志里记拒绝', '')
        far = (K.TOMBSTONE_DAYS + 5) * 86400
        ln.advance(far)
        ln.node.janitor()
        check(ln.node.purged(gp), f'永久墓碑过了 {K.TOMBSTONE_DAYS} 天也不清理', '')
        ln.advance(-far)
        ln.lose_node_db()
        http.port = ln.port
        st, res = dp.create(invp)
        check(st == 403 and res == {'err': 'blocked'}, '节点数据丢了以后（墓碑在 admin.db）仍然 403 blocked', (st, res))
        # 已经因为换钥有普通墓碑的组号：移除后彻底删除，墓碑变成永久的
        gr, kr = new_group()
        dr = DevClient(http, gr, kr, 'dr')
        dr.create(invp)
        gr2, kr2 = new_group()
        dr.successor(gr2, kr2)
        A('groups.remove', {'gid': gr})
        A('groups.purge', {'gid': gr})
        row = ln.node.adb.execute('SELECT successor, purged FROM tombstones WHERE gid=?', (gr,)).fetchone()
        check(row and row[0] == gr2 and row[1], '换钥后的旧组号彻底删除：保留原墓碑（下一代组号）并标成永久', row)
        check(ln.node.known(gr2) and ln.node.known(gr2)['parent_gid'] == gr, '下一代组不受影响', '')

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

        # ------------------------------------------------ 1.3.0 导出日志：按 before 翻页（每页最多 500）能完整、不重复地取到全部日志
        section('导出日志（1.3.0）')
        for i in range(620):
            ln.node.log('测试', '192.0.2.200', 'groups.setNote', f'x{i}', '成功', f'造日志 {i}')
        db_ids = [r[0] for r in ln.node.adb.execute('SELECT id FROM log ORDER BY id DESC')]
        got, before, pages = [], None, 0
        while True:
            pg = A('log.list', {'limit': 500, **({'before': before} if before else {})})
            got += pg['items']
            pages += 1
            if not pg['more']:
                break
            before = pg['items'][-1]['id']
        check([i['id'] for i in got] == db_ids and pages == 2, f'翻页导出 {len(got)} 条 = 库里 {len(db_ids)} 条，顺序一致、不重复（{pages} 页）', (len(got), len(db_ids)))
        row = ln.node.adb.execute('SELECT t, who, ip, op, obj, result, note, sec FROM log WHERE id=?', (got[0]['id'],)).fetchone()
        check(tuple(got[0][k] for k in ('t', 'who', 'ip', 'op', 'obj', 'result', 'note', 'sec')) == row, '导出的字段和库里一致', (got[0], row))
        st, r = adm.call('log.list', {'limit': 501})
        check(st == 200 and not r['ok'], 'limit 超过 500 被拒', r)

        # ------------------------------------------------ 1.3.0 在审批 App 里换管理密钥（#6 第三期）
        section('换管理密钥（1.3.0）')
        old_kid, old_k = adm.kid, adm.k
        for bad, why in ((b64e(b'\0' * 32), '全 0'), (b64e(secrets.token_bytes(16)), '16 字节'), ('不是base64!', '格式'), (None, '缺参数')):
            st, r = adm.call('admin.rotateKey', {} if bad is None else {'key': bad})
            check(st == 200 and not r['ok'], f'新密钥{why} → 拒绝', r)
        check(adm.call('status')[0] == 200, '格式不对时旧管理密钥照常可用', '')
        new_k = secrets.token_bytes(32)
        d = A('admin.rotateKey', {'key': b64e(new_k)})
        new_kid = hashlib.sha256(new_k).hexdigest()[:8]
        check(d['kid'] == new_kid, f'换管理密钥成功，返回新 kid {new_kid}', d)
        st, res = adm.call('status')
        check(st == 403 and res is None, '换钥后旧管理密钥 K → 403', st)
        adm2 = AdminClient(http, f'kmadmin:1?h=127.0.0.1&p={ln.port}&k={b64e(new_k)}')
        st, r = adm2.call('status')
        check(st == 200 and r['ok'], '换钥后新管理密钥 K\' 成功', st)
        check(ln.node.adb.execute('SELECT kid FROM admin_keys').fetchall() == [(new_kid,)], '服务器只剩新的一把管理密钥', '')
        adm = adm2
        lg = A('log.list', {'limit': 10})['items']
        rk = [i for i in lg if i['op'] == 'admin.rotateKey' and i['result'] == '成功']
        check(rk and old_kid in rk[0]['who'] and rk[0]['obj'] == new_kid and old_kid in rk[0]['note'], '换钥有日志（旧 kid 做的、对象是新 kid）', rk[:1])
        check(any(i['op'] == 'auth' and i['obj'] == old_kid and i['result'] == '拒绝' for i in A('log.list', {'limit': 10, 'sec': True})['items']),
              '之后用旧密钥的请求记成安全事件', '')
        responses.append(d)
        check(b64e(new_k) not in json.dumps(A('log.list', {'limit': 100}), ensure_ascii=False) and b64e(old_k) not in json.dumps(lg, ensure_ascii=False),
              '日志里没有新旧管理密钥本身', '')

        # ------------------------------------------------ Java 互通
        if java:
            section('Java 互通（team-admin-app Node.java）')
            run_java(f'kmadmin:1?h=127.0.0.1&p={ln.port}&k={b64e(adm.k)}')
    finally:
        ln.cleanup()


# ---------------------------------------------------------------- 账号（1.4.0，#12）参考客户端：PROTOCOL.md 第 7 节

ACCT_SALT = b'km-acct-v1'


def aes(key):
    return K._AESGCM(key) if K._AESGCM else K.PyAESGCM(key)


def box(key, plain, aad):
    return K.aes_box(aes, key, plain, aad)


def unbox(key, b, aad):
    return K.aes_unbox(aes, key, b, aad)


class AcctClient:
    """一台设备上的账号客户端。pw 只在内存里；mk / authKey / wrapKey 按协议派生。"""
    ITERS = 100000          # 测试用最低次数，省时间

    def __init__(self, http, user, pw, dev, name='测试平板'):
        self.http, self.user, self.pw, self.dev, self.name = http, user, pw, dev, name
        self.sent = []          # 本客户端发出的全部请求正文（检查里面没有密码和密钥）
        self.tok = None
        self.gk = self.gid = self.node_key = None

    def post(self, path, obj, headers=None):
        body = json.dumps(obj).encode()
        self.sent.append(body + json.dumps(headers or {}).encode())
        st, res, _ = self.http.send('POST', path, body, headers)
        return st, res

    def keys(self, salt, iters):
        mk = hashlib.pbkdf2_hmac('sha256', self.pw.encode(), salt, iters, 32)
        self.mk = mk
        return K.hkdf(mk, ACCT_SALT, 'km-acct-auth'), K.hkdf(mk, ACCT_SALT, 'km-acct-wrap')

    def bundle(self, invite=''):
        return json.dumps({'v': 1, 'user': self.user, 'gk': b64e(self.gk or bytes(32)),'epoch': 1, 'gkT': 1, 'invite': invite}, separators=(',', ':')).encode()

    def new_gk(self):
        self.gk = secrets.token_bytes(32)
        self.gid = K.hkdf(self.gk, b'km-sync-v1', 'gid', 16).hex()
        self.node_key = K.hkdf(self.gk, b'km-sync-v1', 'node', 32)

    def register(self, code, bind=None, iters=None, user=None):
        """bind=DevClient（把这个已有的组升级成账号）；否则新建组"""
        user = user or self.user
        code_n = K.acct_code_norm(code)
        salt = secrets.token_bytes(16)
        iters = iters or self.ITERS
        self.auth, self.wrapk = self.keys(salt, iters)
        if bind is not None:
            self.gid = bind.gid
        elif self.gk is None:
            self.new_gk()
        ik = K.acct_ik(code_n) if code_n else secrets.token_bytes(32)
        body = {'user': user, 'code': code, 'gid': self.gid, 'salt': b64e(salt), 'iters': iters, 'dev': self.dev, 'devName': self.name,
                'appVer': '2026.10.23.0000',
                'abox': b64e(box(K.hkdf(ik, ACCT_SALT, 'km-acct-abox'), self.auth, f'km-acct-abox|{user}|{self.gid}')),
                'wrap_pw': b64e(box(self.wrapk, self.bundle(), f'km-acct-pw|{user}')),
                'wrap_admin': b64e(json.dumps({'v': 1, 'epk': b64e(secrets.token_bytes(91)), 'box': b64e(secrets.token_bytes(120))}).encode())}
        headers = None
        if bind is None:
            body.update(wrap(ik, self.gid, self.node_key))
        else:
            raw = json.dumps(body).encode()
            headers = {'X-KM-Auth': bind.auth('POST', '/v1/acct/register', raw)}
            self.sent.append(raw)
            st, res, _ = self.http.send('POST', '/v1/acct/register', raw, headers)
            return self._took(st, res)
        st, res = self.post('/v1/acct/register', body)
        return self._took(st, res)

    def _took(self, st, res):
        if st == 200 and res.get('tok'):
            self.tok = unbox(K.hkdf(self.auth, ACCT_SALT, 'km-devtok'), b64d(res['tok']), f'km-devtok|{self.user}|{self.dev}')
        return st, res

    def pre(self):
        return self.post('/v1/acct/pre', {'user': self.user})

    def login(self, pw=None, nonce_override=None, dev=None):
        pw0 = self.pw
        if pw is not None:
            self.pw = pw
        try:
            st, p = self.pre()
            if st != 200:
                return st, p
            self.auth, self.wrapk = self.keys(b64d(p['salt']), p['iters'])
            nonce = nonce_override or p['nonce']
            dev = dev or self.dev
            proof = H(self.auth, f'km-login|{self.user}|{nonce}|{dev}'.encode())
            st, res = self.post('/v1/acct/login', {'user': self.user, 'nonce': nonce, 'dev': dev, 'devName': self.name,
                                                   'appVer': '2026.10.23.0000', 'proof': b64e(proof)})
            self.last_nonce = nonce
            if st == 200:
                plain = unbox(self.wrapk, b64d(res['wrap_pw']), f'km-acct-pw|{self.user}')
                self.bundle_got = json.loads(plain) if plain else None
                if self.bundle_got:
                    self.gk = b64d(self.bundle_got['gk'])
                    self.gid = K.hkdf(self.gk, b'km-sync-v1', 'gid', 16).hex()
                    self.node_key = K.hkdf(self.gk, b'km-sync-v1', 'node', 32)
                self._took(st, res)
            return st, res
        finally:
            self.pw = pw0

    def dev_client(self):
        """带 X-KM-Dev 的组客户端"""
        acct = self

        class D(DevClient):
            def call(self, action, obj, ctr=None, key=None, raw=None, tok=None):
                path = f'/v1/g/{self.gid}/{action}'
                body = raw if raw is not None else json.dumps(obj).encode()
                a = self.auth('POST', path, body, ctr, key)
                h = {'X-KM-Auth': a}
                t = tok if tok is not None else acct.tok
                if t:
                    msg = f'POST\n{path}\n{self.dev}\n{a.split(".")[1]}\n{hashlib.sha256(body).hexdigest()}'.encode()
                    h['X-KM-Dev'] = b64e(H(hashlib.sha256(t).digest(), msg))
                acct.sent.append(body + json.dumps(h).encode())
                st, res, _ = self.http.send('POST', path, body, h)
                return st, res
        return D(self.http, self.gid, self.node_key, self.dev)


def run_accounts():
    ln = LocalNode()
    http = Http('127.0.0.1', ln.port)
    adm = AdminClient(http, ln.node.new_admin_key()['admin_qr'].replace('p=0', f'p={ln.port}'))
    A = adm.ok
    clients = []
    try:
        section('账号：注册码（1.4.0）')
        c1 = A('invites.create', {'kind': 'acct', 'label': '小明', 'days': 30, 'uses': 1})
        check(re.fullmatch(r'[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}', c1['code']) and c1['qr'] == f'kmreg:1?c={c1["code"]}&h=127.0.0.1&p={ln.port}',
              '生成注册码：XXXX-XXXX-XXXX，二维码 kmreg:1?c=…', c1)
        lst = A('invites.list', {'kind': 'acct'})
        check(len(lst) == 1 and lst[0]['kind'] == 'acct' and lst[0]['code'] == c1['code'] and lst[0]['users'] == [], 'invites.list 按种类筛选，带注册码原文', lst)
        st, res, _ = http.send('GET', '/v1/hello')
        check(res['ver'] == '1.4.0' and res.get('acct') == 1, '/v1/hello 显示 1.4.0、支持账号', res)

        section('账号：注册新建组')
        x = AcctClient(http, 'xiaoming', 'shuxue2026a', 'devX800', 'X800')
        clients.append(x)
        st, res = x.register(c1['code'].lower().replace('-', ' '))
        check(st == 200 and res['ok'] and res['pw_ver'] == 1 and x.tok and len(x.tok) == 32, '注册成功（注册码大小写、空格不敏感），拿到通行证', (st, res))
        row = ln.node.acct_row('xiaoming')
        check(row and row['gid'] == x.gid and row['auth_key'] == x.auth and ln.node.known(x.gid)['invite_id'] == c1['id'],
              '节点存了 authKey、组号；组登记的邀请号 = 注册码前 4 位', '')
        dv = ln.node.adb.execute('SELECT tok_hash FROM acct_devices WHERE user=?', ('xiaoming',)).fetchone()
        check(dv and dv[0] == hashlib.sha256(x.tok).digest(), '节点只存通行证的 SHA-256', '')
        y = AcctClient(http, 'xiaohong', 'yuwen2026b', 'devP70')
        clients.append(y)
        st, res = y.register(c1['code'])
        check(st == 403 and res == {'err': 'code'}, '注册码用完 → 403 code', (st, res))
        c2 = A('invites.create', {'kind': 'acct', 'label': '小红', 'days': 30, 'uses': 3})
        st, res = AcctClient(http, 'xiaoming', 'abcdefg123', 'devQ').register(c2['code'])
        check(st == 409 and res == {'err': 'user'}, '用户名已被占用 → 409 user', (st, res))
        st, res = y.register('ABCD-EFGH-JKMN')
        check(st == 403 and res == {'err': 'code'}, '注册码不存在 → 403 code', (st, res))
        bad = c2['code'][:5] + ('0' if c2['code'][5] != '0' else '1') + c2['code'][6:]
        st, res = y.register(bad)
        check(st == 403 and res == {'err': 'code'}, '注册码秘密部分错一位 → 403 code', (st, res))
        st, res = y.register('kmreg:1?c=xx')
        check(st == 403 and res == {'err': 'code'}, '注册码格式不对 → 403 code', (st, res))
        c3 = A('invites.create', {'kind': 'acct', 'label': '作废', 'days': 30, 'uses': 1})
        A('invites.revoke', {'id': c3['id']})
        st, res = y.register(c3['code'])
        check(st == 403 and res == {'err': 'code'}, '注册码作废 → 403 code', (st, res))
        c4 = A('invites.create', {'kind': 'acct', 'label': '过期', 'days': 1, 'uses': 1})
        ln.advance(2 * 86400)
        st, res = y.register(c4['code'])
        check(st == 403 and res == {'err': 'code'}, '注册码过期 → 403 code', (st, res))
        ln.advance(-2 * 86400)
        st, res = y.register(c2['code'], user='Bad-Name')
        check(st == 400, '用户名不合规则 → 400', (st, res))
        st, res = y.register(c2['code'], iters=50000)
        check(st == 400, 'PBKDF2 次数低于 100000 → 400', (st, res))
        zg, zk = new_group()
        body = {'gid': zg, 'inv': c2['id'], **wrap(K.acct_ik(K.acct_code_norm(c2['code'])), zg, zk)}
        st, res, _ = http.send('POST', '/v1/create', json.dumps(body).encode())
        check(st == 403 and res == {'err': 'invite'}, '注册码不能当同步邀请码建组（403 invite）', (st, res))
        lst = {i['id']: i for i in A('invites.list', {'kind': 'acct'})}
        check(lst[c1['id']]['users'] == ['xiaoming'] and lst[c1['id']]['state'] == 'used' and lst[c2['id']]['used'] == 0,
              '列表里用掉的注册码显示用户名；失败的注册不占次数', lst[c1['id']])

        section('账号：登录（挑战应答）')
        p = AcctClient(http, 'xiaoming', 'shuxue2026a', 'devP70', 'P70')
        clients.append(p)
        st, res = p.login()
        check(st == 200 and res['gid'] == x.gid and p.gk == x.gk and p.bundle_got['user'] == 'xiaoming', '新设备登录：解开 wrap_pw 拿到同一把组密钥', (st, res))
        st, r1 = AcctClient(http, 'xiaoming', 'wrongpass1', 'devP70').login()
        st2, r2 = AcctClient(http, 'nosuchuser', 'wrongpass1', 'devP70').login()
        check(st == 403 and st2 == 403 and r1 == r2 == {'err': 'login'}, '密码错和用户名不存在：响应完全一样（403 login）', (r1, r2))
        _, pa = AcctClient(http, 'xiaoming', '', 'd').pre()
        _, pb = AcctClient(http, 'nosuchuser', '', 'd').pre()
        _, pb2 = AcctClient(http, 'nosuchuser', '', 'd').pre()
        check(set(pa) == set(pb) and len(b64d(pb['salt'])) == 16 and pb['iters'] == K.ACCT_ITERS and pb['salt'] == pb2['salt'],
              'pre：不存在的用户名也返回同样格式、固定的假盐（不能探测用户名）', (pa, pb))
        st, res = p.login(nonce_override=p.last_nonce)
        check(st == 403 and res == {'err': 'login'}, 'nonce 重放 → 403', (st, res))
        q = AcctClient(http, 'xiaoming', 'shuxue2026a', 'devQ')
        st, pre = q.pre()
        ln.advance(130)
        q.auth, _ = q.keys(b64d(pre['salt']), pre['iters'])
        st, res = q.post('/v1/acct/login', {'user': 'xiaoming', 'nonce': pre['nonce'], 'dev': 'devQ',
                                            'proof': b64e(H(q.auth, f'km-login|xiaoming|{pre["nonce"]}|devQ'.encode()))})
        check(st == 403, 'nonce 超过 2 分钟 → 403', (st, res))
        ln.advance(-130)
        st, pre = q.pre()
        st, res = q.post('/v1/acct/login', {'user': 'xiaoming', 'nonce': pre['nonce'], 'dev': 'devOther',
                                            'proof': b64e(H(q.auth, f'km-login|xiaoming|{pre["nonce"]}|devQ'.encode()))})
        check(st == 403, 'proof 绑定设备号：换个设备号 → 403', (st, res))

        section('账号：设备通行证 X-KM-Dev')
        dx, dp = x.dev_client(), p.dev_client()
        st, res = dx.push([('s1', 1, 'c1', b'from-x800')])
        check(st == 200 and res.get('acct') == 'xiaoming', '带通行证 push 成功，响应带 acct', (st, res))
        st, res = dp.pull(0)
        check(st == 200 and res['acct'] == 'xiaoming' and b64d(res['items'][0]['data']) == b'from-x800', '另一台登录的设备 pull 到数据', (st, res))
        st, res = dp.call('pull', {'since': 0}, tok=b'')
        check(st == 403 and res == {'err': 'relogin'}, '账号组请求不带 X-KM-Dev → 403 relogin', (st, res))
        st, res = dp.call('pull', {'since': 0}, tok=secrets.token_bytes(32))
        check(st == 403 and res == {'err': 'relogin'}, '带错的 X-KM-Dev → 403 relogin', (st, res))
        st, res = DevClient(http, x.gid, x.node_key, 'stranger').pull(0)
        check(st == 403 and res == {'err': 'relogin'}, '知道组密钥但没登录过的设备 → 403 relogin', (st, res))
        st, res = dx.call('successor', {'gid': secrets.token_hex(16), **wrap(x.node_key, secrets.token_hex(16), secrets.token_bytes(32))})
        check(st == 403 and res == {'err': 'acct'}, '账号组不能换钥（successor → 403 acct）', (st, res))
        old_tok = p.tok
        st, res = p.login()
        st2, res2 = p.dev_client().call('pull', {'since': 0}, tok=old_tok)
        check(st == 200 and st2 == 403 and res2['err'] == 'relogin', '同一设备重新登录后旧通行证作废', (st, st2))

        section('账号：错 5 次暂停 15 分钟')
        w = AcctClient(http, 'xiaoming', 'wrong-pass-0', 'devW')
        codes = [w.login()[0] for _ in range(5)]
        st, res = p.login()
        check(codes == [403] * 5 and st == 429 and res == {'err': 'paused'}, '15 分钟内错 5 次 → 正确密码也 429 paused', (codes, st, res))
        check(any(i['op'] == 'acct.pause' and i['sec'] for i in A('log.list', {'limit': 20, 'sec': True})['items']), '暂停记进安全日志', '')
        ln.advance(15 * 60 + 1)
        st, res = p.login()
        check(st == 200, '15 分钟后恢复', (st, res))

        section('账号：把已有的同步组升级成账号（老设备过渡）')
        inv = Invite(A('invites.create', {'label': '老同步组', 'days': 7, 'uses': 3})['qr'])
        h = AcctClient(http, 'xiaohong', 'yuwen2026b', 'hA')
        clients.append(h)
        h.new_gk()
        ga, gb, gc = (DevClient(http, h.gid, h.node_key, d) for d in ('hA', 'hB', 'hC'))
        ga.create(inv)
        ga.push([('s', 1, 'c', b'a')])
        gb.push([('s', 1, 'c', b'b')])
        gc.pull(0)
        st, res = h.register(c2['code'], bind=ga)
        check(st == 200 and res['legacy'] == 2, '组员注册（X-KM-Auth 证明是组员），不新建组；另两台记为老设备', (st, res))
        check(ln.node.known(h.gid)['invite_id'] == inv.id, '组登记的邀请号还是原来的同步邀请码', ln.node.known(h.gid))
        st, res = gb.pull(0)
        check(st == 200 and res['acct'] == 'xiaohong', '老设备（旧版 App，不带通行证）照常同步，并看到 acct 用户名', (st, res))
        h2 = AcctClient(http, 'xiaohong2', 'yuwen2026b', 'hX')
        st, res = h2.register(c2['code'], bind=ga)
        check(st == 409 and res == {'err': 'bound', 'user': 'xiaohong'}, '同一个组再注册 → 409 bound', (st, res))
        st, res = h2.register(c2['code'], bind=DevClient(http, h.gid, b'\0' * 32, 'hA'))
        check(st in (401, 409), '签名不对不能绑定', (st, res))
        hb = AcctClient(http, 'xiaohong', 'yuwen2026b', 'hB')
        st, res = hb.login()
        st2, res2 = hb.dev_client().pull(0)
        legacy = ln.node.adb.execute("SELECT legacy, tok_hash IS NOT NULL FROM acct_devices WHERE user='xiaohong' AND dev='hB'").fetchone()
        check(st == 200 and res['gid'] == h.gid and st2 == 200 and legacy == (0, 1), '老设备升级后登录：同一个组，老设备标记消失、有了通行证', (st, legacy))
        st, res = gb.pull(0)
        check(st == 403 and res['err'] == 'relogin', '登录后再不带通行证 → 403 relogin', (st, res))
        ln.advance(61 * 86400)
        ln.node.janitor()
        st, res = gc.pull(0)
        check(st == 403 and res['err'] == 'relogin', '老设备过渡满 60 天后要登录（403 relogin）', (st, res))
        ln.advance(-61 * 86400)

        section('账号：管理（停用、重设密码、移除设备、备注、删除）')
        lst = {a['user']: a for a in A('accounts.list')}
        check(set(lst) == {'xiaoming', 'xiaohong'} and lst['xiaoming']['devices'] == 2 and lst['xiaoming']['state'] == 'ok'
              and lst['xiaoming']['last_dev'] == 'P70' and lst['xiaoming']['bytes'] > 0, 'accounts.list 字段齐全', lst.get('xiaoming'))
        check([a['user'] for a in A('accounts.list', {'q': 'hong'})] == ['xiaohong'], '按用户名搜索', '')
        g = A('accounts.get', {'user': 'xiaoming'})
        check(len(g['list']) == 2 and {d['name'] for d in g['list']} == {'X800', 'P70'} and 'wrap_admin' not in g, 'accounts.get 设备列表（不带恢复包）', g)
        A('accounts.setDisabled', {'user': 'xiaoming', 'disabled': True})
        st, res = dx.pull(0)
        st2, res2 = p.login()
        check(st == 403 and res == {'err': 'disabled'} and st2 == 403 and res2 == {'err': 'disabled'}, '停用后同步和登录（密码对）都 → 403 disabled', (res, res2))
        st3, res3 = AcctClient(http, 'xiaoming', 'wrong-pass-9', 'd').login()
        check(res3 == {'err': 'login'}, '停用时密码错只说 login（不泄露停用）', res3)
        A('accounts.setDisabled', {'user': 'xiaoming', 'disabled': False})
        st, res = dx.pull(0)
        st2, _ = p.login()
        check(st == 403 and res['err'] == 'relogin' and st2 == 200, '启用后旧通行证作废（relogin），重新登录成功', (st, st2))
        x.login()
        dx = x.dev_client()
        # 重设密码：审批 App 解开 wrap_admin 后算新的 salt / authKey / wrap_pw
        g = A('accounts.get', {'user': 'xiaoming', 'wrap': True})
        check('wrap_admin' in g, '管理密钥能取恢复包 wrap_admin', '')
        nx = AcctClient(http, 'xiaoming', 'newpass2026x', 'devX800')
        nx.gk = x.gk
        salt = secrets.token_bytes(16)
        na, nw = nx.keys(salt, 100000)
        A('accounts.resetPassword', {'user': 'xiaoming', 'salt': b64e(salt), 'iters': 100000, 'auth_key': b64e(na),
                                     'wrap_pw': b64e(box(nw, nx.bundle(), 'km-acct-pw|xiaoming'))})
        st, res = dx.pull(0)
        st2, res2 = p.dev_client().pull(0)
        check(st == 403 and res['err'] == 'relogin' and st2 == 403, '重设密码后所有设备 → 403 relogin', (res, res2))
        st, res = x.login()
        st2, res2 = nx.login()
        check(st == 403 and st2 == 200 and nx.gk == x.gk and res2['pw_ver'] == 2, '旧密码登录失败，新密码登录成功、组密钥不变', (st, st2))
        check(nx.dev_client().pull(0)[0] == 200, '新密码登录后照常同步', '')
        A('accounts.removeDevice', {'user': 'xiaoming', 'dev': 'devX800'})
        st, res = nx.dev_client().pull(0)
        check(st == 403 and res['err'] == 'relogin' and not ln.node.ndb.execute("SELECT 1 FROM slots WHERE dev='devX800' AND gid=?", (x.gid,)).fetchone(),
              '移除设备：它回登录页（relogin），它在节点上的槽删掉', (st, res))
        A('accounts.setNote', {'user': 'xiaoming', 'note': '初三 2 班'})
        check(A('accounts.list')[-1]['note'] == '初三 2 班' or any(a['note'] == '初三 2 班' for a in A('accounts.list')), '修改备注', '')
        logs = A('log.list', {'limit': 100})['items']
        for op in ('accounts.setDisabled', 'accounts.resetPassword', 'accounts.removeDevice', 'accounts.setNote', 'acct.register', 'acct.login'):
            check(any(i['op'] == op and i['result'] == '成功' for i in logs), f'日志里有 {op}', '')
        st, r = adm.call('accounts.delete', {'user': 'xiaohong', 'confirm': 'xiaoming'})
        check(st == 200 and not r['ok'], '删除账号要输入正确的用户名确认', r)
        A('accounts.delete', {'user': 'xiaohong', 'confirm': 'xiaohong'})
        st, res = hb.dev_client().pull(0)
        check(st == 403 and res['err'] == 'blocked' and not ln.node.acct_row('xiaohong'), '删除账号后组号永久封禁', (st, res))

        section('账号：网页会话的权限')
        ln.node.web_dir = None
        pw = 'acct-test-' + secrets.token_urlsafe(10)
        A('web.setPassword', {'user': 'boss', 'pw': pw})
        wsrv = K.serve(ln.node, '127.0.0.1', 0, test_ip_header=True, channel='web')
        threading.Thread(target=wsrv.serve_forever, daemon=True).start()
        whttp = Http('127.0.0.1', wsrv.server_address[1])
        st, res, _ = web_login(whttp, 'boss', pw)
        sess = AdminClient.session(whttp, res['kid'], res['key'])
        check(len(sess.ok('accounts.list')) == 1 and sess.ok('invites.create', {'kind': 'acct', 'label': '网页', 'days': 30, 'uses': 1})['code'],
              '网页后台能看账号列表、发注册码', '')
        r1 = sess.call('accounts.resetPassword', {'user': 'xiaoming'})[1]
        r2 = sess.call('accounts.delete', {'user': 'xiaoming', 'confirm': 'xiaoming'})[1]
        r3 = sess.call('accounts.get', {'user': 'xiaoming', 'wrap': True})[1]
        check(r1['err'] == 'perm' and r2['err'] == 'perm' and r3['err'] == 'perm', '网页后台不能重设密码、删除账号、取恢复包（第一期）', (r1, r2, r3))
        check(sess.ok('accounts.setDisabled', {'user': 'xiaoming', 'disabled': True})['state'] == 'disabled'
              and sess.ok('accounts.setDisabled', {'user': 'xiaoming', 'disabled': False}), '网页后台能停用 / 启用', '')
        wsrv.shutdown()
        wsrv.server_close()

        section('账号：节点数据丢失后用注册码重建')
        k = AcctClient(http, 'xiaoke', 'huaxue2026c', 'kA')
        clients.append(k)
        c5 = A('invites.create', {'kind': 'acct', 'label': '重建', 'days': 30, 'uses': 1})
        k.register(c5['code'])
        A('invites.revoke', {'id': c5['id']})
        ln.lose_node_db()
        http.port = ln.port
        dk = k.dev_client()
        st, res = dk.pull(0)
        st2, res2 = dk.create(Invite(f'kmnode:1?h=127.0.0.1&p={ln.port}&i={c5["id"]}&s=AAAA'))   # secret 不对
        ik_ok = DevClient(http, k.gid, k.node_key, 'kA')
        body = {'gid': k.gid, 'inv': c5['id'], **wrap(K.acct_ik(K.acct_code_norm(c5['code'])), k.gid, k.node_key)}
        st3, res3, _ = http.send('POST', '/v1/create', json.dumps(body).encode())
        st4, res4 = dk.pull(0)
        check(st == 404 and st2 == 403 and st3 == 200 and res3['rebuilt'] and st4 == 200 and res4['acct'] == 'xiaoke',
              '数据丢失 → nogroup → 用注册码重建（注册码已作废也行，账号说了算）→ 通行证照常', (st, st2, st3, res3, st4))

        section('账号：网络上没有明文密码和密钥（验收 8）')
        secrets_found = []
        for c in clients:
            vals = [c.pw.encode()]
            for attr in ('mk', 'auth', 'wrapk', 'gk', 'tok'):
                v = getattr(c, attr, None)
                if v:
                    vals.append(v)
            blob = b'\n'.join(c.sent)
            for v in vals:
                for form in (v, v.hex().encode(), b64e(v).encode(), base64.b64encode(v).rstrip(b'=')):
                    if len(form) >= 8 and form in blob:
                        secrets_found.append((c.user, form[:12]))
        check(not secrets_found, f'{len(clients)} 个客户端发出的全部请求里搜不到密码、mk、authKey、wrapKey、gk、devToken（原文 / hex / base64）', secrets_found)

        section('搬家：在线备份、局域网发现（1.4.0）')
        out = tempfile.mkdtemp(prefix='km-sync-bak-')
        try:
            d = K.backup_to(ln.node, out)
            b = sqlite3.connect(os.path.join(d, 'admin.db'))
            users = {r[0] for r in b.execute('SELECT user FROM accounts')}
            b.close()
            n2 = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
            ok = n2.acct_row('xiaoke') and n2.ndb.execute('SELECT 1 FROM groups WHERE gid=?', (k.gid,)).fetchone() \
                and n2.adb.execute('SELECT kid FROM admin_keys').fetchone()[0] == adm.kid
            n2.ndb.close()
            n2.adb.close()
            check(users == {'xiaoming', 'xiaoke'} and ok, '--backup 复制出的 node.db / admin.db 直接能当新节点的数据目录用（账号、组、管理密钥都在）', users)
            ver0 = ln.node.adb.execute("SELECT v FROM meta WHERE k='schema'").fetchone()[0]
            d2 = K.backup_to(ln.dir, out)       # 命令行 --backup 的做法：只读打开数据目录，不建 Node、不升级表结构
            b2 = sqlite3.connect(os.path.join(d2, 'admin.db'))
            users2 = {r[0] for r in b2.execute('SELECT user FROM accounts')}
            b2.close()
            check(users2 == users and ln.node.adb.execute("SELECT v FROM meta WHERE k='schema'").fetchone()[0] == ver0,
                  '--backup 只读备份数据目录（运行中的节点照常、表结构不动）', users2)
        finally:
            shutil.rmtree(out, ignore_errors=True)
        stop = threading.Event()
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.bind(('127.0.0.1', 0))
        port = s.getsockname()[1]
        s.close()
        threading.Thread(target=K.discovery_loop, args=(ln.node, '127.0.0.1', port, stop), daemon=True).start()
        time.sleep(0.3)
        c = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        c.settimeout(2)
        c.sendto(b'hello?', ('127.0.0.1', port))
        c.sendto(K.DISCOVERY_MAGIC, ('127.0.0.1', port))
        try:
            reply = json.loads(c.recvfrom(1024)[0])
        except (socket.timeout, ValueError):
            reply = None
        c.close()
        stop.set()
        check(reply and reply['node'] == 'km-sync' and reply['acct'] == 1 and reply['port'] == ln.node.public_port and 'host' in reply,
              '局域网发现：广播 km-sync? 收到 hello（带对外地址、端口），别的内容不理', reply)
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
        # 1.3.0：网页上也能彻底删除已移除的组登记；不能换管理密钥
        gpw, kpw = new_group()
        DevClient(http, gpw, kpw, 'w2').create(inv)
        s.ok('groups.remove', {'gid': gpw})
        st, r = s.call('groups.purge', {'gid': gpw})
        check(st == 200 and r['ok'] and not ln.node.known(gpw) and ln.node.purged(gpw), '网页会话能彻底删除已移除的组登记（1.3.0）', r)
        lg = s.ok('log.list', {'limit': 5})['items']
        check(any(i['op'] == 'groups.purge' and i['who'].startswith('网页 boss') for i in lg), '网页上的彻底删除记成「网页 用户名」', lg[:2])
        st, r = s.call('admin.rotateKey', {'key': b64e(secrets.token_bytes(32))})
        check(st == 200 and not r['ok'] and r['err'] == 'perm' and adm.call('status')[0] == 200, '网页会话不能换管理密钥（1.3.0），K 照常可用', r)
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
        cols = [r[1] for r in sqlite3.connect(os.path.join(d, 'admin.db')).execute('PRAGMA table_info(tombstones)')]
        check('purged' in cols and len(saved) >= 4, '表结构 4（1.3.0）：tombstones 加了 purged 列', cols)
    finally:
        shutil.rmtree(d, ignore_errors=True)
    # 1.2.0（表结构 3）的库：已有的换钥墓碑升级后还在、仍按 90 天清理
    d = tempfile.mkdtemp(prefix='km-sync-mig3-')
    try:
        saved = K.ADMIN_SCHEMA
        K.ADMIN_SCHEMA = saved[:3]
        try:
            n = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
            n.adb.execute('INSERT INTO tombstones(gid, successor, created) VALUES(?,?,?)', ('cd' * 16, 'ef' * 16, n.ms()))
            n.adb.commit()
            n.ndb.close()
            n.adb.close()
        finally:
            K.ADMIN_SCHEMA = saved
        n = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
        row = n.adb.execute('SELECT successor, purged FROM tombstones WHERE gid=?', ('cd' * 16,)).fetchone()
        check(os.path.exists(os.path.join(d, 'admin.db.v3.bak')), '1.2.0 → 1.4.0 也备份了 admin.db.v3.bak', os.listdir(d))
        check(row == ('ef' * 16, None) and not n.purged('cd' * 16) and os.path.exists(os.path.join(d, 'admin.db.v3.bak')),
              '1.2.0 的库升级到表结构 4：换钥墓碑还在（不是永久的），备份了 admin.db.v3.bak', row)
        n.ndb.close()
        n.adb.close()
        K.ADMIN_SCHEMA = saved[:3]
        try:
            n = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
            check(n.adb.execute('SELECT COUNT(*) FROM tombstones').fetchone()[0] == 1, '用只认表结构 3 的程序打开新库也正常（模拟回滚到 1.2.0）', '')
            n.ndb.close()
            n.adb.close()
        finally:
            K.ADMIN_SCHEMA = saved
    finally:
        shutil.rmtree(d, ignore_errors=True)
    run_migration_v5()


def run_migration_v5():
    """1.3.0（表结构 4）→ 1.4.0（表结构 5，账号）：只加表和一列；组数上限 30 → 300；回滚到 1.3.0 照常。"""
    section('admin.db 从 1.3.0（表结构 4）升级到 1.4.0（表结构 5，账号）')
    d = tempfile.mkdtemp(prefix='km-sync-mig5-')
    try:
        saved = K.ADMIN_SCHEMA
        K.ADMIN_SCHEMA = saved[:4]
        try:
            n = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
            key = n.new_admin_key()
            inv = n.create_invite('旧邀请码', 30, 5)
            n.adb.execute("INSERT INTO known_groups(gid, invite_id, created, note) VALUES(?,?,1,'小明')", ('ab' * 16, inv['id']))
            n.set_setting('limits', dict(K.DEFAULT_LIMITS, max_groups=30))
            n.adb.commit()
            n.ndb.close()
            n.adb.close()
        finally:
            K.ADMIN_SCHEMA = saved
        n = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
        ver = n.adb.execute("SELECT v FROM meta WHERE k='schema'").fetchone()[0]
        check(ver == '5' and os.path.exists(os.path.join(d, 'admin.db.v4.bak')), '表结构 4 → 5，升级前备份了 admin.db.v4.bak', (ver, os.listdir(d)))
        lst = n.op_invites_list({}, '127.0.0.1')[0]
        check(lst[0]['id'] == inv['id'] and lst[0]['kind'] == 'node' and n.known('ab' * 16)['note'] == '小明'
              and n.adb.execute('SELECT kid FROM admin_keys').fetchone()[0] == key['kid'], '升级后旧邀请码（种类 node）、组登记、管理密钥都在', lst[:1])
        check(n.limits()['max_groups'] == 300, '组数上限 30 自动提到 300', n.limits())
        cols = [r[1] for r in n.adb.execute('PRAGMA table_info(accounts)')]
        check('wrap_admin' in cols and 'bound_at' in cols, '新表 accounts、acct_devices 建好了', cols)
        n.ndb.close()
        n.adb.close()
        K.ADMIN_SCHEMA = saved[:4]
        try:
            n = K.Node(d, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
            check(n.adb.execute('SELECT COUNT(*) FROM invites').fetchone()[0] == 1 and n.acct_by_gid('ab' * 16) is None,
                  '用只认表结构 4 的程序打开新库也正常（模拟回滚到 1.3.0）', '')
            n.ndb.close()
            n.adb.close()
        finally:
            K.ADMIN_SCHEMA = saved
        # 管理员自己改过的上限不动
        d2 = tempfile.mkdtemp(prefix='km-sync-mig5b-')
        K.ADMIN_SCHEMA = saved[:4]
        try:
            n = K.Node(d2, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
            n.set_setting('limits', dict(K.DEFAULT_LIMITS, max_groups=50))
            n.adb.commit()
            n.ndb.close()
            n.adb.close()
        finally:
            K.ADMIN_SCHEMA = saved
        n = K.Node(d2, '127.0.0.1', 8787, aes=K._AESGCM or K.PyAESGCM)
        check(n.limits()['max_groups'] == 50, '管理员改过的组数上限（50）升级后不变', n.limits())
        n.ndb.close()
        n.adb.close()
        shutil.rmtree(d2, ignore_errors=True)
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
                            os.path.join(src, 'src', 'com', 'fjzk', 'teamadmin', 'NodeHealth.java'),
                            os.path.join(src, 'test', 'NodeTest.java')], capture_output=True, text=True)
        if not check(r.returncode == 0, 'javac 编译 Node.java + NodeHealth.java + NodeTest.java', r.stderr[-800:]):
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


def run_remote_accounts(http, adm, made_inv):
    """远程节点的账号（1.4.0，#12 验收 22）：只用备注「自动测试」的临时注册码和 autotest_ 开头的临时账号，结束时删账号、作废注册码，
    不消耗管理员的码。"""
    section('远程节点：账号（1.4.0）')
    user = 'autotest_' + secrets.token_hex(3)
    made = []
    try:
        c = adm.ok('invites.create', {'kind': 'acct', 'label': '自动测试', 'days': 1, 'uses': 1})
        made_inv.append(c['id'])
        x = AcctClient(http, user, 'auto' + secrets.token_hex(6) + '9', 'autotestX')
        st, r = x.register(c['code'])
        made.append(user)
        check(st == 200 and r.get('ok'), f'临时注册码注册 {user}', (st, r))
        p = AcctClient(http, user, x.pw, 'autotestP')
        st, r = p.login()
        check(st == 200 and p.gk == x.gk, '另一台登录拿到同一把组密钥', (st, r))
        blob = secrets.token_bytes(3000)
        st, r = x.dev_client().push([('s1', 1, 'c1', blob)])
        st2, r2 = p.dev_client().pull(0)
        check(st == 200 and st2 == 200 and r2.get('acct') == user and b64d(r2['items'][0]['data']) == blob, '带通行证 push / pull，响应带 acct', (st, st2))
        st, r = DevClient(http, x.gid, x.node_key, 'autotestZ').pull(0)
        check(st == 403 and r == {'err': 'relogin'}, '没登录的设备 → 403 relogin', (st, r))
        st, r = AcctClient(http, user, 'wrong-pass-1', 'autotestW').login()
        check(st == 403 and r == {'err': 'login'}, '密码错 → 403 login', (st, r))
        adm.ok('accounts.setDisabled', {'user': user, 'disabled': True})
        st, r = x.dev_client().pull(0)
        check(st == 403 and r == {'err': 'disabled'}, '停用 → 403 disabled', (st, r))
        adm.ok('accounts.setDisabled', {'user': user, 'disabled': False})
        lst = [a for a in adm.ok('accounts.list', {'q': user}) if a['user'] == user]
        check(len(lst) == 1 and lst[0]['state'] in ('ok', 'relogin'), '账号列表里看得到', lst)
    finally:
        for u in made:
            try:
                adm.ok('accounts.delete', {'user': u, 'confirm': u})
            except AssertionError:
                pass
        left = [a for a in adm.ok('accounts.list', {}) if a['user'].startswith('autotest_')]
        check(not left, '清理完毕：没有 autotest_ 开头的测试账号', left)


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
    stale = False
    try:
        section(f'远程节点 {addr}')
        st, res, _ = http.send('GET', '/v1/hello')
        check(st == 200 and res['node'] == 'km-sync', f'/v1/hello（版本 {res and res.get("ver")}）', res)
        if adm.call('status')[0] == 403:
            check(False, '本机 sync-node.json 的管理密钥被节点拒绝：可能已在审批 App 里换过管理密钥（1.3.0）'
                  + (f'——{info["stale_note"]}' if info.get('stale_note') else '') + '。需要时运行 deploy.ps1 -NewAdminKey（手机要重新扫码）')
            stale = True
            return
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
        # 1.3.0：彻底删除已移除的组登记
        if s['version'] >= '1.3.0':
            g3, k3 = new_group()
            made_groups.append((g3, k3))
            a3 = DevClient(http, g3, k3, 'autotestA')
            st, r = a3.create(iv)
            adm.ok('groups.remove', {'gid': g3})
            adm.ok('groups.purge', {'gid': g3})
            made_groups.remove((g3, k3))
            gl = {g['gid'] for g in adm.ok('groups.list')}
            st2, r2 = a3.create(iv)
            check(st == 200 and g3 not in gl and st2 == 403 and r2 == {'err': 'blocked'}, '彻底删除登记后从列表消失，设备用邀请码重建 → 403 blocked（1.3.0）', (st, st2, r2))
            pg = adm.ok('log.list', {'limit': 500})
            check(len(pg['items']) > 0 and any(i['op'] == 'groups.purge' and i['obj'] == g3[:6] for i in pg['items']), '日志一页取 500 条（导出用）、有彻底删除记录', len(pg['items']))
        body = json.dumps({'v': 1}).encode()
        st, r, _ = http.send('POST', '/admin/v1', body, {'X-KM-Auth': a.auth('POST', '/admin/v1', body)})
        check(st == 403 and r == {}, '设备签名访问管理接口 → 403 {}', (st, r))
        logs = adm.ok('log.list', {'limit': 30})['items']
        check(any(i['op'] == 'groups.remove' and i['obj'] == g2[:6] for i in logs), '管理日志里有刚才的操作', '')
        if s['version'] >= '1.4.0':
            run_remote_accounts(http, adm, made_inv)
        if web:
            run_remote_web(http, adm, info.get('host') or '43.142.41.27')
    finally:
        # 清理：设备删组（连同登记一起删），作废邀请码
        if stale:
            return
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
        run_accounts()
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
