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
import secrets
import shutil
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
    def __init__(self, host, port, ip=None):
        self.host, self.port, self.ip = host, port, ip   # ip：本地测试里假装的来源 IP（X-KM-Test-IP）

    def send(self, method, path, body=b'', headers=None, ip=None):
        c = http.client.HTTPConnection(self.host, self.port, timeout=30)
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
    def __init__(self, http, text, ip=None):
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


def run_remote(addr):
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
        adm.ok('groups.remove', {'gid': gid})
        st, r = a.pull(0)
        check(st == 403 and r['err'] == 'blocked', '移除后 403 blocked', (st, r))
        adm.ok('groups.unblock', {'gid': gid})
        st, r = a.create(iv)
        check(st == 200 and r.get('rebuilt'), '解除封禁后重建', (st, r))
        body = json.dumps({'v': 1}).encode()
        st, r, _ = http.send('POST', '/admin/v1', body, {'X-KM-Auth': a.auth('POST', '/admin/v1', body)})
        check(st == 403 and r == {}, '设备签名访问管理接口 → 403 {}', (st, r))
        logs = adm.ok('log.list', {'limit': 30})['items']
        check(any(i['op'] == 'groups.remove' and i['obj'] == gid[:6] for i in logs), '管理日志里有刚才的操作', '')
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
    a = ap.parse_args()
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if not K._AESGCM:
        print('（本机没装 cryptography，本地节点和客户端改用内置的纯 Python AES-GCM；服务器上用的是 cryptography）')
    t = time.time()
    if a.remote:
        run_remote(a.remote)
    else:
        run_local(java=not a.no_java)
    bad = [n for ok, n in RESULTS if not ok]
    print(f'\n共 {len(RESULTS)} 项，通过 {len(RESULTS) - len(bad)} 项，失败 {len(bad)} 项，用时 {time.time() - t:.1f} 秒')
    for n in bad:
        print('  失败：' + n)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
