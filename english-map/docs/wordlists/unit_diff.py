# 单元词表比对（需求 #9）：两份独立录入（或 最终数据 vs 某份录入）逐单元比对英文拼写、单元归属、词性、释义、必背标记。
#
# 用法：
#   python -X utf8 docs/wordlists/unit_diff.py <册id> a.json b.json
#       列出 a、b 的全部不一致（每条有一个编号，如 `u3/look after/zh`），交给第三人回到课本裁定
#   python -X utf8 docs/wordlists/unit_diff.py <册id> a.json b.json --final final.json --review review.md
#       最终数据分别和 a、b 比，凡是不一致的条目，编号必须出现在 review.md 里（即已裁定）；有未裁定的退出码 1
#
# 录入文件格式（两个代理、最终数据都一样）：
#   { "book": "mj3a", "units": [{ "id": "u1", "name": "Unit 1 ..." }], "mustMarked": false,
#     "words": [{ "u": "u1", "en": "hello", "pos": "interj.", "zh": "你好", "must": 1 }] }
import json, re, sys

def norm_en(s):
    return re.sub(r'\s+', ' ', str(s).replace('’', "'").replace('‘', "'")).strip()

def key(s):
    return norm_en(s).lower()

def norm_zh(s):
    s = str(s or '')
    s = s.replace(';', '；').replace(',', '，').replace('(', '（').replace(')', '）')
    return re.sub(r'\s+', '', s)

def norm_pos(s):
    return re.sub(r'\s+', '', str(s or '')).lower()

def load(path):
    d = json.load(open(path, encoding='utf-8-sig'))
    units = [(u['id'], norm_en(u['name'])) for u in d.get('units', [])]
    words = {}
    order = []
    for w in d.get('words', []):
        k = (w['u'], key(w['en']))
        if k in words:
            order.append(('dup', k))
        words[k] = w
        order.append(('w', k))
    return d, units, words, order

def diff(a_path, b_path, la='A', lb='B'):
    """返回 [(编号, 说明)]"""
    da, ua, wa, oa = load(a_path)
    db, ub, wb, ob = load(b_path)
    out = []
    # 单元目录
    ia, ib = dict(ua), dict(ub)
    for uid in sorted(set(ia) | set(ib), key=lambda x: (len(x), x)):
        if ia.get(uid) != ib.get(uid):
            out.append((f'{uid}/@unit', f'单元名：{la} {ia.get(uid)!r} ≠ {lb} {ib.get(uid)!r}'))
    if bool(da.get('mustMarked')) != bool(db.get('mustMarked')):
        out.append(('@book/mustMarked', f'是否区分必背：{la} {da.get("mustMarked")} ≠ {lb} {db.get("mustMarked")}'))
    for tag, k in oa:
        if tag == 'dup':
            out.append((f'{k[0]}/{k[1]}/dup', f'{la} 同一单元里重复录了 {k[1]!r}'))
    for tag, k in ob:
        if tag == 'dup':
            out.append((f'{k[0]}/{k[1]}/dup', f'{lb} 同一单元里重复录了 {k[1]!r}'))
    # 词的单元归属、拼写（大小写也比）
    units_of_a, units_of_b = {}, {}
    for (u, k) in wa: units_of_a.setdefault(k, set()).add(u)
    for (u, k) in wb: units_of_b.setdefault(k, set()).add(u)
    for (u, k) in sorted(set(wa) | set(wb), key=lambda x: (len(x[0]), x[0], x[1])):
        x, y = wa.get((u, k)), wb.get((u, k))
        if x is None or y is None:
            have, miss = (lb, la) if x is None else (la, lb)
            other = (units_of_a if x is None else units_of_b).get(k, set())
            hint = f'（{miss} 把它放在 {"、".join(sorted(other))}）' if other else f'（{miss} 没有这个词）'
            out.append((f'{u}/{k}/missing', f'{u} {k!r}：只有 {have} 有{hint}'))
            continue
        if norm_en(x['en']) != norm_en(y['en']):
            out.append((f'{u}/{k}/en', f'{u} 拼写/大小写：{la} {x["en"]!r} ≠ {lb} {y["en"]!r}'))
        if norm_pos(x.get('pos')) != norm_pos(y.get('pos')):
            out.append((f'{u}/{k}/pos', f'{u} {k!r} 词性：{la} {x.get("pos")!r} ≠ {lb} {y.get("pos")!r}'))
        if norm_zh(x.get('zh')) != norm_zh(y.get('zh')):
            out.append((f'{u}/{k}/zh', f'{u} {k!r} 释义：{la} {x.get("zh")!r} ≠ {lb} {y.get("zh")!r}'))
        if int(x.get('must', 1)) != int(y.get('must', 1)):
            out.append((f'{u}/{k}/must', f'{u} {k!r} 必背：{la} {x.get("must")} ≠ {lb} {y.get("must")}'))
    # 每单元词数
    ca, cb = {}, {}
    for (u, k) in wa: ca[u] = ca.get(u, 0) + 1
    for (u, k) in wb: cb[u] = cb.get(u, 0) + 1
    counts = [(u, ca.get(u, 0), cb.get(u, 0)) for u in sorted(set(ca) | set(cb), key=lambda x: (len(x), x))]
    return out, counts, (len(wa), len(wb))

def main():
    args = sys.argv[1:]
    if len(args) < 3:
        print(__doc__ if __doc__ else '用法见文件头'); sys.exit(2)
    book, a, b = args[0], args[1], args[2]
    final = review = None
    if '--final' in args: final = args[args.index('--final') + 1]
    if '--review' in args: review = args[args.index('--review') + 1]
    if not final:
        out, counts, tot = diff(a, b)
        print(f'# {book}：A {tot[0]} 词，B {tot[1]} 词')
        print('# 每单元词数（A / B）：' + '，'.join(f'{u} {x}/{y}{"" if x == y else " ≠"}' for u, x, y in counts))
        print(f'# 不一致 {len(out)} 处')
        for i, t in out: print(f'- `{i}` {t}')
        return
    text = open(review, encoding='utf-8').read() if review else ''
    bad = 0
    for path, lab in ((a, 'A'), (b, 'B')):
        out, counts, tot = diff(final, path, '最终', lab)
        unresolved = [(i, t) for i, t in out if f'`{i}`' not in text]
        print(f'# 最终 vs {lab}：不一致 {len(out)} 处，未在 review.md 裁定 {len(unresolved)} 处')
        for i, t in unresolved: print(f'- `{i}` {t}')
        bad += len(unresolved)
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()
