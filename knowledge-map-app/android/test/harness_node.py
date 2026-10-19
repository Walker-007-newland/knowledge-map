#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SyncHarness 的节点助手（#1 第一期电脑测试）：由 SyncHarness.java 启动，stdin 一行一个 JSON 命令，stdout 一行一个 JSON 回答。

本地模式（默认）：在临时目录、127.0.0.1 随机端口起一个 km_sync_node（knowledge-map-app/sync-node），跑完删掉目录。
    命令：invite / clear / remove / unblock / revoke / groups / lose_db / stop / start / advance / row / rdv_tamper / log / quit
远程模式（--remote host:port）：真实节点，管理命令经 /admin/v1（管理密钥读 signing/sync-node.json，不打印）。
    只支持 invite / clear / remove / unblock / revoke / groups / quit；邀请码备注固定「自动测试」，quit 时作废本次生成的全部邀请码。
"""
import argparse
import json
import os
import secrets
import shutil
import sys
import tempfile
import threading

HERE = os.path.dirname(os.path.abspath(__file__))
NODE_DIR = os.path.join(os.path.dirname(HERE), '..', 'sync-node')
sys.path.insert(0, os.path.abspath(NODE_DIR))
import km_sync_node as K  # noqa: E402
import test_node as T     # noqa: E402

LABEL = '自动测试'


class Local:
    def __init__(self):
        self.dir = tempfile.mkdtemp(prefix='km-harness-')
        self.clock = K.Clock()
        self.port = 0
        self.srv = None
        self.start()

    def start(self):
        if self.srv:
            return {'port': self.port}
        self.node = K.Node(self.dir, '127.0.0.1', self.port, clock=self.clock, aes=K._AESGCM or K.PyAESGCM)
        self.node.rate_ok = lambda ip: True          # 测试里一个 IP 发很多请求，不限速
        self.srv = K.serve(self.node, '127.0.0.1', self.port)
        self.port = self.srv.server_address[1]
        self.node.public_port = self.port
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        return {'port': self.port}

    def stop(self):
        if self.srv:
            self.srv.shutdown()
            self.srv.server_close()
            self.node.ndb.close()
            self.node.adb.close()
            self.srv = None
        return {}

    def op(self, name, args):
        with self.node.lock:
            fn = getattr(self.node, 'op_' + name.replace('.', '_'))
            data, _, _ = fn(args, '127.0.0.1')
            self.node.ndb.commit()
            self.node.adb.commit()
            return data

    def handle(self, c):
        cmd = c['cmd']
        if cmd == 'invite':
            return self.op('invites.create', {'label': LABEL, 'days': c.get('days', 7), 'uses': c.get('uses', 10)})
        if cmd == 'clear':
            return self.op('groups.clear', {'gid': c['gid']})
        if cmd == 'remove':
            return self.op('groups.remove', {'gid': c['gid']})
        if cmd == 'unblock':
            return self.op('groups.unblock', {'gid': c['gid']})
        if cmd == 'revoke':
            return self.op('invites.revoke', {'id': c['id']})
        if cmd == 'groups':
            return self.op('groups.list', {})
        if cmd == 'invites':
            return [{'id': i['id'], 'label': i['label'], 'state': i['state'], 'used': i['used']} for i in self.op('invites.list', {})]
        if cmd == 'lose_db':
            self.stop()
            for s in ('', '-wal', '-shm'):
                p = os.path.join(self.dir, 'node.db' + s)
                if os.path.exists(p):
                    os.remove(p)
            return self.start()
        if cmd == 'stop':
            return self.stop()
        if cmd == 'start':
            return self.start()
        if cmd == 'advance':
            self.clock.offset += c['sec']
            return {}
        if cmd == 'row':        # 节点数据库里抽查一行密文
            r = self.node.ndb.execute('SELECT dev, sec, rev, cid, data FROM slots WHERE gid=? ORDER BY seq LIMIT 1', (c['gid'],)).fetchone()
            return None if not r else {'dev': r[0], 'sec': r[1], 'rev': r[2], 'cid': r[3], 'data': T.b64e(r[4]), 'n': len(r[4])}
        if cmd == 'rows':
            return [{'dev': r[0], 'sec': r[1], 'rev': r[2]} for r in
                    self.node.ndb.execute('SELECT dev, sec, rev FROM slots WHERE gid=? ORDER BY seq', (c['gid'],))]
        if cmd == 'rdv_tamper':  # 模拟节点篡改转交点某一边的数据
            with self.node.lock:
                rows = self.node.ndb.execute('SELECT n, data FROM rdv WHERE id=? AND side=? ORDER BY n', (c['rid'], c['side'])).fetchall()
                for n, data in rows:
                    bad = bytearray(data)
                    bad[len(bad) // 2] ^= 0x55
                    self.node.ndb.execute('UPDATE rdv SET data=? WHERE id=? AND n=?', (bytes(bad), c['rid'], n))
                self.node.ndb.commit()
            return {'n': len(rows)}
        if cmd == 'log':
            return [{'op': r[0], 'obj': r[1], 'result': r[2], 'note': r[3]} for r in
                    self.node.adb.execute('SELECT op, obj, result, note FROM log ORDER BY id DESC LIMIT ?', (c.get('n', 20),))]
        raise ValueError('不认识的命令 ' + cmd)

    def close(self):
        self.stop()
        shutil.rmtree(self.dir, ignore_errors=True)


class Remote:
    def __init__(self, addr):
        host, port = addr.rsplit(':', 1)
        with open(os.path.join(T.signing_dir(), 'sync-node.json'), encoding='utf-8') as f:
            info = json.load(f)
        self.http = T.Http(host, int(port))
        self.adm = T.AdminClient(self.http, info['admin_qr'])
        self.port = int(port)
        self.host = host
        self.invites = []

    def handle(self, c):
        cmd = c['cmd']
        if cmd == 'invite':
            r = self.adm.ok('invites.create', {'label': LABEL, 'days': 1, 'uses': c.get('uses', 5)})
            self.invites.append(r['id'])
            return r
        if cmd == 'clear':
            return self.adm.ok('groups.clear', {'gid': c['gid']})
        if cmd == 'remove':
            return self.adm.ok('groups.remove', {'gid': c['gid']})
        if cmd == 'unblock':
            return self.adm.ok('groups.unblock', {'gid': c['gid']})
        if cmd == 'revoke':
            return self.adm.ok('invites.revoke', {'id': c['id']})
        if cmd == 'groups':
            return self.adm.ok('groups.list')
        if cmd == 'invites':
            return [{'id': i['id'], 'label': i['label'], 'state': i['state'], 'used': i['used']} for i in self.adm.ok('invites.list')]
        raise ValueError('远程模式不支持 ' + cmd)

    def close(self):
        for i in self.invites:
            try:
                self.adm.ok('invites.revoke', {'id': i})
            except AssertionError:
                pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--remote')
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stdin.reconfigure(encoding='utf-8')
    out = sys.stdout
    sys.stdout = sys.stderr          # 节点自己的访问日志等 print 都走 stderr，stdout 只留给协议
    global print
    _print = print
    print = lambda *a, **k: _print(*a, **{**k, 'file': out})  # noqa: E731
    h = Remote(a.remote) if a.remote else Local()
    print(json.dumps({'ok': True, 'data': {'host': getattr(h, 'host', '127.0.0.1'), 'port': h.port}}), flush=True)
    try:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            c = json.loads(line)
            if c.get('cmd') == 'quit':
                break
            try:
                print(json.dumps({'ok': True, 'data': h.handle(c)}, ensure_ascii=False), flush=True)
            except Exception as e:  # noqa: BLE001
                print(json.dumps({'ok': False, 'err': getattr(e, 'msg', None) or repr(e)}, ensure_ascii=False), flush=True)
    finally:
        h.close()
        print(json.dumps({'ok': True, 'data': 'bye'}), flush=True)


if __name__ == '__main__':
    main()
