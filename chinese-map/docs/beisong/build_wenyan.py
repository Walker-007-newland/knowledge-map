# 文言文背诵的原文：从文言篇目知识点 data/wenyan-pian-*.js、data/wenyan-xx.js（已对照现行课本图片核对）的“原文与译文”小节里
# 取出原文（去掉译文 <span class="zh">、注音 <rt>），按篇整理成 data/beisong/wenyan.js（window.KWY）。改了这些知识点后重跑：python build_wenyan.py
# 每篇 { id, title, grade, c: 小句 [{ t: 字, p: 句末标点, br: 段落结束 }] }，格式同古诗词默写的 poems.js（多了 br）。
import glob, html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PUNCT = '，。？！；：、'
CN = {4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九'}


def original(frag):
    frag = re.sub(r'<span class="zh">.*?</span>', '', frag, flags=re.S)
    frag = re.sub(r'<rt>.*?</rt>', '', frag, flags=re.S)
    t = html.unescape(re.sub(r'<[^>]+>', '', frag)).strip()
    # 括号里的是出处、注释（如《论语》每章后的“（《学而》）”），不背
    return re.sub(r'（[^（）]*）', '', t).strip()


def clauses(paras):
    out = []
    for para in paras:
        buf = ''
        for ch in para:
            if ch in PUNCT:
                if buf:
                    out.append({'t': buf, 'p': ch})
                buf = ''
            elif '㐀' <= ch <= '鿿':
                buf += ch
        if buf:
            out.append({'t': buf, 'p': ''})
        if out:
            out[-1]['br'] = 1
    return out


def title_of(nid, node_title, h):
    return re.sub(r'[《》“”]', '', _title_of(nid, node_title, h))


def _title_of(nid, node_title, h):
    m = re.search(r'《([^》]+)》原文', h)
    if m:
        return m.group(1)
    if nid == 'w-p-mengzi':
        return h
    if nid == 'w-p-chushi':
        return '出师表'
    h2 = re.sub(r'^课文[一二三]：', '', h)
    h2 = re.sub(r'(：原文与译文|（要求背诵）)$', '', h2)
    if '原文与译文' not in h2:
        return h2.strip('《》')
    return re.sub(r'^.*?·第\d+课\s*', '', node_title).strip('《》')


def main():
    texts, order = {}, []
    files = sorted(glob.glob(os.path.join(ROOT, 'data', 'wenyan-pian-*.js'))) + [os.path.join(ROOT, 'data', 'wenyan-xx.js')]
    for f in files:
        s = open(f, encoding='utf-8').read()
        for part in re.split(r"\n\{\s*\n\s*id: '", s)[1:]:
            nid = part.split("'")[0]
            node_title = re.search(r"title: '([^']+)'", part).group(1)
            grade = int(re.search(r'grade: (\d)', part).group(1))
            for h, body in re.findall(r"h: '([^']+)', html: `(.*?)`", part, re.S):
                paras = [original(p) for p in re.findall(r'<p class="ex">(.*?)</p>', body, re.S)]
                paras = [p for p in paras if p]
                if not paras or '读懂即可' in h:
                    continue
                if not ('原文' in h or nid in ('w-p-mengzi', 'w-p-chushi') or nid.startswith('w-x-')):
                    continue
                t = title_of(nid, node_title, h)
                key = (nid, t)
                if key not in texts:
                    texts[key] = {'id': '%s-%d' % (nid, len([k for k in texts if k[0] == nid]) + 1), 'title': t, 'grade': grade, 'node': nid, 'paras': []}
                    order.append(key)
                texts[key]['paras'] += paras
    groups = {}
    for key in order:
        x = texts[key]
        x['c'] = clauses(x.pop('paras'))
        groups.setdefault(x['grade'], []).append(x)
    out = os.path.join(ROOT, 'data', 'beisong', 'wenyan.js')
    with open(out, 'w', encoding='utf-8') as fo:
        fo.write('// 文言文背诵的原文：由 docs/beisong/build_wenyan.py 从 data/wenyan-pian-*.js、wenyan-xx.js 生成，不要手改\n')
        fo.write('window.KWY = { groups: [\n')
        fo.write(',\n'.join('  ' + json.dumps({'grade': g, 'name': CN[g] + '年级', 'texts': groups[g]}, ensure_ascii=False) for g in sorted(groups)))
        fo.write('\n] };\n')
    for g in sorted(groups):
        print(CN[g] + '年级', '、'.join('%s(%d)' % (x['title'], sum(len(c['t']) for c in x['c'])) for x in groups[g]))


if __name__ == '__main__':
    main()
