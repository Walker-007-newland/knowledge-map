# 把裁定后的最终词表 docs/unit-words/<册id>.json 生成页面用的 data/words/<册id>.js，并更新 data/words/books.js 里这一册的单元目录（需求 #9）
# 用法：python -X utf8 docs/wordlists/unit_build.py <册id> [<册id> ...]
# books.js 里册的其它信息（年级、版本、来源、是否已核对 checked）手工维护；这里只改 units 和 mustMarked
import json, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.normpath(os.path.join(here, '..', '..'))

def js_str(s):
    return json.dumps(s, ensure_ascii=False)

for book in sys.argv[1:]:
    d = json.load(open(os.path.join(root, 'docs', 'unit-words', book + '.json'), encoding='utf-8-sig'))
    assert d['book'] == book, d['book']
    uids = [u['id'] for u in d['units']]
    lines = []
    for w in d['words']:
        assert w['u'] in uids, (book, w)
        en = re.sub(r'\s+', ' ', w['en']).strip()
        lines.append('  { u: %s, en: %s, pos: %s, zh: %s, must: %d }' % (
            js_str(w['u']), js_str(en), js_str(w.get('pos', '')), js_str(w['zh']), int(w.get('must', 1))))
    out = (f'// {book} 单元词表：由 docs/wordlists/unit_build.py 从 docs/unit-words/{book}.json 生成，不要手改（核对记录见 docs/unit-words/{book}-review.md）\n'
           f'KW.add({js_str(book)}, [\n' + ',\n'.join(lines) + '\n]);\n')
    open(os.path.join(root, 'data', 'words', book + '.js'), 'w', encoding='utf-8', newline='\n').write(out)
    # 更新 books.js 里的 units / mustMarked
    bp = os.path.join(root, 'data', 'words', 'books.js')
    s = open(bp, encoding='utf-8').read()
    units = '[\n' + ',\n'.join('      { id: %s, name: %s }' % (js_str(u['id']), js_str(u['name'])) for u in d['units']) + '\n    ]'
    pat = re.compile(r"(\{ id: '%s',.*?units: )\[.*?\n    \]" % re.escape(book), re.S)
    if not pat.search(s):
        sys.exit(f'books.js 里没有 {book} 这一册（先手工加上册信息，units: [] 写成多行）')
    s = pat.sub(lambda m: m.group(1) + units, s, count=1)
    s = re.sub(r"(\{ id: '%s',.*?mustMarked: )(true|false)" % re.escape(book), lambda m: m.group(1) + ('true' if d.get('mustMarked') else 'false'), s, count=1, flags=re.S)
    open(bp, 'w', encoding='utf-8', newline='\n').write(s)
    print(f'{book}: {len(d["units"])} 个单元，{len(d["words"])} 个词条 → data/words/{book}.js')
