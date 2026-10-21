# 单元词表拼写校验（需求 #9）：把每个词（短语拆成单词）对照 check_word.py 用的课标词表（小学 / 初中 / 高中）、
# 中考词表 zhongkao.txt、小学词表 xiaoxue.txt 和 COCA 前 2 万词，查不到的列出来，逐个人工确认。
#
# 用法：python -X utf8 docs/wordlists/unit_check.py final.json [--review review.md]
#   带 --review 时：列出的每个词都必须在 review.md 里以 `词` 的形式出现（写明为什么保留），否则退出码 1
# 输出：每个词表外的词一行，标明所在单元和原词条；首字母大写的另标「专有名词？」
import json, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'wordlists.js'), encoding='utf-8').read()
WL = json.loads(src[src.index('{'):src.rindex('}') + 1])
irr = WL['irr']
known = set(WL['primary']) | set(WL['junior']) | set(WL['senior'])
known |= {l.strip().lower() for l in open(os.path.join(here, 'xiaoxue.txt'), encoding='utf-8') if l.strip()}
known |= {l.strip().lower() for l in open(os.path.join(here, 'coca20000.txt'), encoding='utf-8') if l.strip()}
for l in open(os.path.join(here, 'zhongkao.txt'), encoding='utf-8-sig'):
    m = re.match(r"\s*([A-Za-z][A-Za-z'.\-]*)", l)
    if m: known.add(m.group(1).lower())
kb = json.load(open(os.path.join(here, 'kebiao_standard_words.json'), encoding='utf-8'))
known |= {k.lower() for k in kb}

SKIP = {'sb', 'sth', "sb's", "sth's", 'one', "one's", 'etc'}

def variants(t):
    """常见变形还原：复数、三单、过去式、ing、比较级、所有格"""
    t = t.lower().strip("'")
    out = {t, irr.get(t, t)}
    if t.endswith("'s"): out.add(t[:-2])
    if t.endswith("n't"): out.add(t[:-3])
    for suf, rep in (('ies', 'y'), ('es', ''), ('s', ''), ('ied', 'y'), ('ed', ''), ('ed', 'e'), ('ing', ''), ('ing', 'e'),
                     ('er', ''), ('er', 'e'), ('est', ''), ('est', 'e'), ('ier', 'y'), ('iest', 'y')):
        if t.endswith(suf) and len(t) > len(suf) + 1:
            b = t[:-len(suf)] + rep
            out.add(b)
            if len(b) > 2 and b[-1] == b[-2]: out.add(b[:-1])     # stopped → stop
    return out

def check(entry):
    toks = re.findall(r"[A-Za-z][A-Za-z']*(?:-[A-Za-z]+)*", entry)
    bad = []
    for t in toks:
        if t.lower() in SKIP: continue
        parts = [t] + (t.split('-') if '-' in t else [])
        if any(variants(p) & known for p in parts) or (t.lower() in known): continue
        bad.append(t)
    return bad

def main():
    args = sys.argv[1:]
    d = json.load(open(args[0], encoding='utf-8-sig'))
    review = open(args[args.index('--review') + 1], encoding='utf-8').read() if '--review' in args else None
    seen, rows = set(), []
    for w in d['words']:
        for t in check(w['en']):
            if t.lower() in seen: continue
            seen.add(t.lower())
            rows.append((t, w))
    print(f'# {d.get("book")}：共 {len(d["words"])} 个词条，词表外 {len(rows)} 个')
    unresolved = 0
    for t, w in rows:
        tag = '专有名词？' if t[0].isupper() and t != 'I' else ''
        ok = review is not None and f'`{t}`' in review
        if review is not None and not ok: unresolved += 1
        print(f'- `{t}` {tag}（{w["u"]} {w["en"]} {w.get("zh", "")}）' + ('' if review is None else (' 已说明' if ok else ' ← review.md 未说明')))
    if review is not None:
        print(f'# 未说明 {unresolved} 个')
        sys.exit(1 if unresolved else 0)

if __name__ == '__main__':
    main()
