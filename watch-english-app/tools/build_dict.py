"""把 ECDICT（MIT 许可，https://github.com/skywind3000/ECDICT）裁剪成 App 内置的离线词典 www/dict/dict.js。

用法：python -X utf8 tools/build_dict.py <ecdict.csv> <lemma.en.txt>
- 单词：有考试标签（中考/高考/四六级/考研/托福/雅思/GRE）、词频前 4 万、柯林斯星级或牛津核心词
- 释义只留词性行（去掉 [网络] [计] 这类专业行），最多 3 行
- 词形还原表：ECDICT 的 exchange 字段 + lemma.en.txt
- 短语：tools/spoken.txt 里自编的口语表达 + ECDICT 里「常用动词 + 小品词」的短语动词
"""
import csv
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'www', 'dict')
LEVEL = {'zk': 1, 'gk': 2, 'cet4': 3, 'cet6': 4, 'ky': 5, 'toefl': 5, 'ielts': 5, 'gre': 6}
PARTICLES = set('up down out off in on over away back through around about along by after across apart ahead together'.split())
PRONOUNS = set('i me my mine you your yours he him his she her hers it its we us our ours they them their theirs ya ye em'.split())
POS_LINE = re.compile(r'^(n|v|vt|vi|a|adj|adv|prep|conj|pron|int|interj|abbr|art|num|aux|modal|pl|suf|pref)\.')


def num(x):
    try:
        return int(x)
    except ValueError:
        return 0


def trim(trans):
    lines = [l.strip() for l in trans.replace('\\n', '\n').split('\n') if l.strip()]
    keep = [l for l in lines if not l.startswith('[')]
    pos = [l for l in keep if POS_LINE.match(l)]
    keep = (pos or keep or lines)[:3]
    out = []
    for l in keep:
        l = l.replace('|', '/').replace('\t', ' ')
        if len(l) > 46:   # 在分隔符处截断
            cut = max(l.rfind(c, 0, 46) for c in '，,；;')
            l = l[:cut] if cut > 10 else l[:46]
        out.append(l)
    return '|'.join(out)


def main(ecdict, lemma_txt):
    csv.field_size_limit(10 ** 8)
    rows = list(csv.DictReader(open(ecdict, encoding='utf-8')))
    words = {}
    for r in rows:
        w = r['word']
        if not re.fullmatch(r"[a-z][a-z'\-]*", w) or not r['translation'].strip():
            continue
        frq, bnc = num(r['frq']), num(r['bnc'])
        if not (r['tag'].strip() or 0 < frq <= 40000 or 0 < bnc <= 40000 or num(r['collins']) > 0 or r['oxford'] == '1'):
            continue
        lv = min([LEVEL[t] for t in r['tag'].split() if t in LEVEL] or [9])
        rank = frq or bnc or 0
        words[w] = [r['phonetic'].replace('\t', ' '), lv, rank, trim(r['translation']), r['exchange']]

    lemma = {}
    for w, v in words.items():
        for part in v[4].split('/'):
            if ':' not in part:
                continue
            k, form = part.split(':', 1)
            if k in 'pdi3srt' and form != w and re.fullmatch(r"[a-z][a-z'\-]*", form):
                lemma.setdefault(form, w)
    for line in open(lemma_txt, encoding='utf-8'):
        if line.startswith(';') or '->' not in line:
            continue
        head, forms = line.split('->')
        base = head.split('/')[0].strip()
        if base not in words or base in PRONOUNS:   # lemma.en.txt 把 they 归到 it、me 归到 i，查词时不对
            continue
        for form in forms.strip().split(','):
            form = form.strip()
            if len(form) > 1 and "'" not in form and form != base and form not in PRONOUNS and re.fullmatch(r'[a-z\-]+', form):
                lemma.setdefault(form, base)

    phrases, slang = {}, {}
    for line in open(os.path.join(HERE, 'spoken.txt'), encoding='utf-8'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        expr, zh, *lv = line.split('|')
        expr = expr.strip().lower()
        if ' ' in expr:
            phrases[expr] = (zh.strip(), 'i', int(lv[0]) if lv else 4)
        else:
            slang[expr] = zh.strip()
    common = {w for w, v in words.items() if 0 < v[2] <= 8000}
    for r in rows:
        p = r['word']
        parts = p.split(' ')
        if len(parts) == 2 and parts[0] in common and parts[1] in PARTICLES and p not in phrases and r['translation'].strip():
            phrases[p] = (trim(r['translation']), 'p', 9)

    for w, zh in slang.items():
        if w in words:
            words[w][3] = zh + '|' + words[w][3]
        else:
            words[w] = ['', 9, 0, zh, '']
        words[w][1] = min(words[w][1], 3) if w in ('gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'yep', 'yup', 'nope', 'nah', 'ya', 'dunno', 'lemme', 'gimme', "ain't") else words[w][1]

    wtxt = '\n'.join('\t'.join([w, v[0], str(v[1]), str(v[2]), v[3]]) for w, v in sorted(words.items()))
    ltxt = '\n'.join(f'{f}\t{b}' for f, b in sorted(lemma.items()))
    ptxt = '\n'.join(f'{p}\t{zh}\t{k}\t{lv}' for p, (zh, k, lv) in sorted(phrases.items()))
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'dict.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('// 离线词典，由 tools/build_dict.py 从 ECDICT（MIT 许可，见 LICENSE-ECDICT.txt）生成，不要手改\n')
        f.write('window.WE_DICT={words:' + json.dumps(wtxt, ensure_ascii=False) + ',\nlemma:' + json.dumps(ltxt, ensure_ascii=False)
                + ',\nphrases:' + json.dumps(ptxt, ensure_ascii=False) + '};\n')
    lic = os.path.join(os.path.dirname(os.path.abspath(ecdict)), 'LICENSE')
    if os.path.exists(lic):
        with open(os.path.join(OUT, 'LICENSE-ECDICT.txt'), 'w', encoding='utf-8', newline='\n') as f:
            f.write('离线词典数据来自 ECDICT：https://github.com/skywind3000/ECDICT\n\n' + open(lic, encoding='utf-8').read())
    print(f'单词 {len(words)}，词形 {ltxt.count(chr(10)) + 1}，短语 {len(phrases)}，'
          f'dict.js {os.path.getsize(os.path.join(OUT, "dict.js")) // 1024} KB')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
