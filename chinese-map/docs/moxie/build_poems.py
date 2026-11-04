# 古诗词默写的诗文：从按课本整理的古诗知识点 data/gushi-kb-*.js（已对照现行课本图片逐字核对）里
# 取出每首诗的题目、作者和正文，生成 data/moxie/poems.js。改了 gushi-kb-*.js 以后重跑：python build_poems.py
import glob, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CN = {4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九'}
PUNCT = '，。？！；：、'


def text_of(frag):
    return html.unescape(re.sub(r'<[^>]+>', '', frag)).strip()


def clauses(lines):
    # 按标点切成小句：{t: 字, p: 句末标点}；引号、书名号等不算字，也不当分句
    out = []
    for ln in lines:
        buf = ''
        for ch in ln:
            if ch in PUNCT:
                if buf:
                    out.append({'t': buf, 'p': ch})
                buf = ''
            elif '\u3400' <= ch <= '\u9fff':
                buf += ch
        if buf:
            out.append({'t': buf, 'p': ''})
    return out


def main():
    books, odd = {}, []
    for f in sorted(glob.glob(os.path.join(ROOT, 'data', 'gushi-kb-*.js'))):
        s = open(f, encoding='utf-8').read()
        for part in re.split(r"\n\{\s*\n\s*id: '", s)[1:]:
            nid = part.split("'")[0]
            title = re.search(r"title: '([^']+)'", part).group(1)
            grade = int(re.search(r'grade: (\d)', part).group(1))
            term = '上' if nid.split('-')[2].endswith('a') else '下'
            poems = []
            for m in re.finditer(r'<div class="poem[^"]*">(.*?)</div>', part, re.S):
                blk = m.group(1)
                hs = re.findall(r"h: '([^']+)'", part[:m.start()])
                h = hs[-1] if hs else ''
                body = [text_of(x) for x in re.findall(r'<p>(.*?)</p>', blk, re.S)]
                for ln in body:
                    bad = [c for c in ln if not ('㐀' <= c <= '鿿' or c in PUNCT + '“”‘’《》（）·—…')]
                    if bad:
                        odd.append((nid, h, ''.join(bad)))
                tm = re.search(r'<p class="poem-title">(.*?)</p>', blk)
                if not tm and h.startswith('原文') and poems:
                    # 长诗分几段讲（如《木兰诗》“原文（二）”）：接到上一首后面
                    poems[-1]['lines'] += body
                    poems[-1]['c'] = clauses(poems[-1]['lines'])
                    continue
                a = re.search(r'<p class="poem-author">(.*?)</p>', blk)
                # 没有题目的是课本里的名句组（如四下“勤学的名句”）：用小节标题
                t = text_of(tm.group(1)) if tm else re.sub(r'（[^）]*）$', '', h)
                poems.append({'id': '%s-%d' % (nid, len(poems) + 1), 'title': t, 'author': text_of(a.group(1)) if a else '',
                              'lines': body, 'c': clauses(body)})
            # 组名：去掉“四上·”前缀和括号里的篇目
            name = re.sub(r'^[四五六七八九][上下]·', '', title)
            name = re.sub(r'（[^（）]*(（[^（）]*）[^（）]*)*）$', '', name).strip()
            b = books.setdefault((grade, term), {'grade': grade, 'term': term, 'name': CN[grade] + term, 'groups': []})
            b['groups'].append({'id': nid, 'name': name, 'poems': poems})
    out = os.path.join(ROOT, 'data', 'moxie', 'poems.js')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as fo:
        fo.write('// 古诗词默写的诗文：由 docs/moxie/build_poems.py 从 data/gushi-kb-*.js 生成，不要手改\n')
        fo.write('// 每首 { id, title, author, lines: 原文各段, c: 小句 [{ t: 字, p: 句末标点 }] }\n')
        fo.write('window.KMX = { books: [\n')
        fo.write(',\n'.join('  ' + json.dumps(b, ensure_ascii=False) for _, b in sorted(books.items(), key=lambda x: (x[0][0], x[0][1] != '上'))))
        fo.write('\n] };\n')
    n = sum(len(g['poems']) for b in books.values() for g in b['groups'])
    print('%d 册，%d 组，%d 首' % (len(books), sum(len(b['groups']) for b in books.values()), n))
    for x in odd:
        print('  非汉字/常见标点：', x)


if __name__ == '__main__':
    main()
