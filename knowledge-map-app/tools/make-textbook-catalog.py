# -*- coding: utf-8 -*-
"""
电子教材目录索引：把国家中小学智慧教育平台的官方教材目录（约 33MB、3500 多条）精简成 hub/textbooks/catalog.js。

  python -I knowledge-map-app/tools/make-textbook-catalog.py              # 联网拉官方目录
  python -I knowledge-map-app/tools/make-textbook-catalog.py <目录>       # 用已下载的 part_*.json / p*.json

只要：小学、初中（含五•四学制，版本名后注明）、带「电子教材」标签；去掉盲校、聋校、培智等特殊教育版本。
字段：id、书名、学段、学科、版本、年级、册、类型（专题课 thematic_course 的 PDF 要从另一个接口取）。
按 学段 → 学科 → 版本 → 年级 → 册 排序。输出用字典表压缩（学科、版本等字符串只存一次）。
"""
import json
import os
import re
import sys
import urllib.request

ROOT = 'https://s-file-1.ykt.cbern.com.cn/zxx/ndrs/resources/tch_material/version/data_version.json'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'hub', 'textbooks', 'catalog.js')

STAGES = {'小学': '小学', '初中': '初中', '小学（五•四学制）': '小学', '初中（五•四学制）': '初中'}
SPECIAL = re.compile('盲校|聋校|培智|低视力|特殊教育')
SUBJECT_ORDER = ['语文', '数学', '英语', '英语（三年级起点）', '道德与法治', '中国历史', '世界历史', '历史', '地理', '地理图册',
                 '物理', '化学', '生物学', '科学', '信息科技', '信息技术', '体育与健康', '艺术·音乐', '音乐', '艺术·美术', '美术',
                 '艺术·舞蹈/影视/戏剧', '语文·书法练习指导', '日语', '俄语', '法语', '德语', '西班牙语']
GRADE_ORDER = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级',
               '一至二年级', '三至四年级', '五至六年级', '七至九年级']
VOL_ORDER = ['上册', '下册', '全一册', '第一册', '第二册']


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def load(src):
    items = []
    if src:
        for name in sorted(os.listdir(src)):
            if re.match(r'^(part_|p)\d+\.json$', name):
                with open(os.path.join(src, name), encoding='utf-8') as f:
                    items += json.load(f)
        return items
    ver = fetch(ROOT)
    for u in ver['urls'].split(',') if isinstance(ver['urls'], str) else ver['urls']:
        print('下载', u)
        items += fetch(u.strip())
    return items


def tags(it):
    d = {}
    for t in it.get('tag_list') or []:
        d.setdefault(t.get('tag_dimension_id'), []).append(t.get('tag_name') or '')
    return d


def order(lst, v):
    return (lst.index(v), '') if v in lst else (len(lst), v)


def main():
    items = load(sys.argv[1] if len(sys.argv) > 1 else None)
    books, seen, skipped = [], set(), {'特殊教育': 0, '非电子教材或学段': 0, '重复': 0}
    for it in items:
        tg = tags(it)
        stage_raw = (tg.get('zxxxd') or [''])[0]
        if stage_raw not in STAGES or '电子教材' not in (tg.get('5036342742') or []):
            skipped['非电子教材或学段'] += 1
            continue
        title = (it.get('title') or (it.get('global_title') or {}).get('zh-CN') or '').strip()
        if tg.get('zxxlb') or SPECIAL.search(title):
            skipped['特殊教育'] += 1
            continue
        if it.get('id') in seen:
            skipped['重复'] += 1
            continue
        seen.add(it['id'])
        version = (tg.get('zxxbb') or ['其他'])[0]
        if '五•四' in stage_raw:
            version += '（五•四学制）'
        books.append({
            'id': it['id'], 'title': title, 'stage': STAGES[stage_raw],
            'subject': (tg.get('zxxxk') or ['其他'])[0], 'version': version,
            'grade': (tg.get('zxxnj') or ['其他'])[0], 'vol': (tg.get('zxxcc') or [''])[0],
            'thematic': it.get('resource_type_code') == 'thematic_course',
        })

    # 每个学科里，版本按书的数量从多到少，五•四学制排在后面（页面再把常用版本置顶）
    vcount = {}
    for b in books:
        k = (b['stage'], b['subject'], b['version'])
        vcount[k] = vcount.get(k, 0) + 1
    books.sort(key=lambda b: (b['stage'] != '小学', order(SUBJECT_ORDER, b['subject']),
                              '五•四' in b['version'], -vcount[(b['stage'], b['subject'], b['version'])], b['version'],
                              order(GRADE_ORDER, b['grade']), order(VOL_ORDER, b['vol']), b['title']))

    dicts = {k: [] for k in ('stage', 'subject', 'version', 'grade', 'vol')}
    def idx(k, v):
        lst = dicts[k]
        if v not in lst:
            lst.append(v)
        return lst.index(v)
    rows = []
    for b in books:
        rows.append([b['id'], b['title'], idx('stage', b['stage']), idx('subject', b['subject']), idx('version', b['version']),
                     idx('grade', b['grade']), idx('vol', b['vol']), 1 if b['thematic'] else 0])

    data = {'v': 1, 'source': '国家中小学智慧教育平台 tch_material', 'count': len(rows),
            'fields': ['id', 'title', 'stage', 'subject', 'version', 'grade', 'vol', 'thematic'], 'dict': dicts, 'rows': rows}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    text = ('// 电子教材目录（由 knowledge-map-app/tools/make-textbook-catalog.py 生成，不要手改）\n'
            '// rows 每行：[id, 书名, 学段, 学科, 版本, 年级, 册, 专题课]，后五项是 dict 里对应表的下标\n'
            'window.KM_TEXTBOOKS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)

    sys.stdout.reconfigure(encoding='utf-8')
    print('总条数', len(items), '收录', len(rows), '跳过', skipped)
    for st in ('小学', '初中'):
        n = sum(1 for b in books if b['stage'] == st)
        subs = {}
        for b in books:
            if b['stage'] == st:
                subs[b['subject']] = subs.get(b['subject'], 0) + 1
        print(st, n, subs)
    print('输出', os.path.normpath(OUT), round(len(text.encode('utf-8')) / 1024), 'KB')


if __name__ == '__main__':
    main()
