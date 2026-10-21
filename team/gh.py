# -*- coding: utf-8 -*-
"""AI 团队看板工具：读写私有仓库 knowledge-map-team 的 Issue（需求单）。

token 读 knowledge-map-app/signing/github-token.txt（已 gitignore，不要打印、不要提交）。
所有输出都是 UTF-8 JSON / 文本，供各角色 agent 调用。

用法（在 teach 目录下）：
  python team/gh.py list [状态]                 列出未关闭需求单，可按状态过滤，如 list 已批准
  python team/gh.py show <编号>                 需求单正文 + 全部评论（含管理员意见）
  python team/gh.py new <标题> <正文文件>        新建需求单，状态=待评审
  python team/gh.py comment <编号> <正文文件>    追加评论（方案、开发说明、测试报告都用它）
  python team/gh.py state <编号> <新状态>        切换状态标签，如 state 12 待测试
  python team/gh.py close <编号> [状态]          关闭需求单（可同时打上最终状态）
  python team/gh.py history [天数]              最近关闭的需求单（去重用），默认 60 天
  python team/gh.py status <角色> <状态> <在做什么> [编号]
                                                上报自己的状态，管理员 App「办公室」页实时显示
                                                角色：需求员/产品/开发/开发2/开发3/测试/文员/CEO；状态：工作中/空闲/阻塞
  python team/gh.py setup                       建仓库标签和团队状态单（只需一次）
正文文件写成 UTF-8 的 .md，避免命令行中文编码问题。
"""
import json, os, re, sys, urllib.request, urllib.error, urllib.parse, datetime

sys.stdout.reconfigure(encoding='utf-8')
REPO = 'Walker-007-newland/knowledge-map-team'
API = 'https://api.github.com'
HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN_FILE = os.path.join(HERE, '..', 'knowledge-map-app', 'signing', 'github-token.txt')

STATES = {
    '待评审': ('c5def5', '需求员提出，等产品评审'),
    '待审批': ('fbca04', '产品已出方案，等管理员审批'),
    '需修改': ('f9d0c4', '管理员要求产品改方案'),
    '已批准': ('0e8a16', '管理员批准，等开发'),
    '开发中': ('1d76db', '开发正在做'),
    '待测试': ('5319e7', '开发完成，等测试'),
    '返工':   ('d93f0b', '测试不通过，开发修复'),
    '已上线': ('0b5d1e', '测试通过并已发布'),
    '已驳回': ('b60205', '管理员驳回'),
    '产品否决': ('777777', '产品评审认为不做'),
    '阻塞':   ('000000', '需要人工处理'),
}
PREFIX = '状态:'
STATUS_LABEL = '团队状态'          # 这张单只存团队成员的实时状态，不是需求
ROLES = ['需求员', '产品', '开发', '开发2', '开发3', '测试', '文员', 'CEO']  # 开发2/开发3：并行开发时的工位；CEO：调度员兼审批员
MEMBER_STATES = {'工作中': 'working', '空闲': 'idle', '阻塞': 'blocked'}


def token():
    with open(TOKEN_FILE, encoding='utf-8') as f:
        return f.read().strip()


def api(method, path, body=None):
    url = path if path.startswith('http') else API + path
    data = json.dumps(body).encode('utf-8') if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        'Authorization': 'Bearer ' + token(),
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'km-team',
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        msg = e.read().decode('utf-8', 'replace')
        raise SystemExit(f'GitHub API {method} {path} -> {e.code}: {msg}')


def q(s):
    return urllib.parse.quote(s, safe='')


def state_of(issue):
    for l in issue.get('labels', []):
        n = l['name'] if isinstance(l, dict) else l
        if n.startswith(PREFIX):
            return n[len(PREFIX):]
    return ''


def is_status(i):
    return any((l['name'] if isinstance(l, dict) else l) == STATUS_LABEL for l in i.get('labels', []))


def brief(i):
    return {'number': i['number'], 'title': i['title'], 'state': state_of(i),
            'updated': i['updated_at'], 'url': i['html_url']}


ADMIN_HEADS = ('## 给管理员',)
ADMIN_LIMIT = 500


def admin_len(body):
    """摘要字数：去掉标题行、Markdown 符号和空白后的字符数。"""
    lines = body.strip().splitlines()[1:]
    text = re.sub(r'[#*`>|\-]', '', '\n'.join(lines))
    return len(re.sub(r'\s', '', text))


def check_admin(body):
    head = body.strip().splitlines()[0] if body.strip() else ''
    if head.startswith(ADMIN_HEADS):
        n = admin_len(body)
        if n > ADMIN_LIMIT:
            raise SystemExit(f'「给管理员」摘要 {n} 字，超过 {ADMIN_LIMIT} 字上限。只写结论、理由、管理员要做什么；细节另发一条「## 详细说明」。')


def read_file(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def set_state(n, new):
    if new not in STATES:
        raise SystemExit(f'未知状态 {new}，可选：{"/".join(STATES)}')
    issue = api('GET', f'/repos/{REPO}/issues/{n}')
    for l in issue['labels']:
        if l['name'].startswith(PREFIX) and l['name'] != PREFIX + new:
            api('DELETE', f'/repos/{REPO}/issues/{n}/labels/{q(l["name"])}')
    api('POST', f'/repos/{REPO}/issues/{n}/labels', {'labels': [PREFIX + new]})


def status_issue():
    items = api('GET', f'/repos/{REPO}/issues?state=open&labels={q(STATUS_LABEL)}&sort=updated&direction=desc&per_page=5')
    if items:
        return items[0]
    return api('POST', f'/repos/{REPO}/issues', {
        'title': '【团队状态】AI 团队实时状态（自动更新，请勿关闭）',
        'body': status_body({'members': {}, 'log': []}), 'labels': [STATUS_LABEL]})


def status_body(data):
    return ('AI 团队成员用 `python team/gh.py status` 自动更新这张单，管理员 App 的「办公室」页读取它。请勿手动编辑或关闭。\n\n'
            '```json\n' + json.dumps(data, ensure_ascii=False, indent=1) + '\n```\n')


def status_data(issue):
    body = issue.get('body') or ''
    try:
        return json.loads(body.split('```json', 1)[1].split('```', 1)[0])
    except Exception:
        return {'members': {}, 'log': []}


def set_status(role, st, text, issue_no=None):
    if role not in ROLES:
        raise SystemExit(f'未知角色 {role}，可选：{"/".join(ROLES)}')
    if st not in MEMBER_STATES:
        raise SystemExit(f'未知状态 {st}，可选：{"/".join(MEMBER_STATES)}')
    now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    iss = status_issue()
    data = status_data(iss)
    m = {'state': MEMBER_STATES[st], 'text': text[:120], 'at': now}
    if issue_no:
        m['issue'] = int(issue_no)
    data.setdefault('members', {})[role] = m
    log = data.setdefault('log', [])
    log.insert(0, {'role': role, 'state': m['state'], 'text': m['text'], 'issue': m.get('issue'), 'at': now})
    del log[40:]
    api('PATCH', f'/repos/{REPO}/issues/{iss["number"]}', {'body': status_body(data)})


def main(argv):
    if not argv:
        print(__doc__); return
    cmd, a = argv[0], argv[1:]
    if cmd == 'setup':
        have = {l['name'] for l in api('GET', f'/repos/{REPO}/labels?per_page=100')}
        for name, (color, desc) in STATES.items():
            if PREFIX + name not in have:
                api('POST', f'/repos/{REPO}/labels', {'name': PREFIX + name, 'color': color, 'description': desc})
        if STATUS_LABEL not in have:
            api('POST', f'/repos/{REPO}/labels', {'name': STATUS_LABEL, 'color': 'ededed', 'description': '团队成员实时状态，不是需求'})
        print('labels ok; 团队状态单 #%d' % status_issue()['number'])
    elif cmd == 'status':
        set_status(a[0], a[1], a[2], a[3] if len(a) > 3 else None)
        print(f'{a[0]}：{a[1]} {a[2]}')
    elif cmd == 'list':
        items = api('GET', f'/repos/{REPO}/issues?state=open&per_page=100')
        items = [brief(i) for i in items if 'pull_request' not in i and not is_status(i)]
        if a:
            items = [i for i in items if i['state'] == a[0]]
        print(json.dumps(items, ensure_ascii=False, indent=1))
    elif cmd == 'history':
        days = int(a[0]) if a else 60
        since = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)).strftime('%Y-%m-%dT%H:%M:%SZ')
        items = api('GET', f'/repos/{REPO}/issues?state=all&since={since}&per_page=100')
        print(json.dumps([brief(i) for i in items if 'pull_request' not in i and not is_status(i)], ensure_ascii=False, indent=1))
    elif cmd == 'show':
        n = a[0]
        i = api('GET', f'/repos/{REPO}/issues/{n}')
        print(f'#{n} {i["title"]}  [状态:{state_of(i)}] {"(已关闭)" if i["state"] == "closed" else ""}')
        print('=' * 60)
        print(i['body'] or '')
        for c in api('GET', f'/repos/{REPO}/issues/{n}/comments?per_page=100'):
            print('\n' + '-' * 60)
            print(f'[{c["created_at"]}] {c["user"]["login"]}:')
            print(c['body'])
    elif cmd == 'new':
        i = api('POST', f'/repos/{REPO}/issues', {'title': a[0], 'body': read_file(a[1]), 'labels': [PREFIX + '待评审']})
        print(json.dumps(brief(i), ensure_ascii=False))
    elif cmd == 'comment':
        check_admin(read_file(a[1]))
        c = api('POST', f'/repos/{REPO}/issues/{a[0]}/comments', {'body': read_file(a[1])})
        print(c['html_url'])
    elif cmd == 'state':
        set_state(a[0], a[1]); print(f'#{a[0]} -> {a[1]}')
    elif cmd == 'close':
        if len(a) > 1:
            set_state(a[0], a[1])
        api('PATCH', f'/repos/{REPO}/issues/{a[0]}', {'state': 'closed'})
        print(f'#{a[0]} closed')
    else:
        print(__doc__)


if __name__ == '__main__':
    main(sys.argv[1:])
