"""拼读词的音节划分（字母怎么分节），来自两个开源词表，写 docs/audio/hyphen.json：
  1. Moby Hyphenator（Grady Ward，公共领域，Project Gutenberg #3204 mhyph.txt，约 18 万词，词典式划分 com·put·er）
  2. Wiktionary（CC BY-SA，经 kaikki.org 的机器可读版逐词取）
输出 {单词: [[划分1], [划分2], ...]}，Moby 的在前。词表里没有的变形词（animals、boxes、visited、playing）
和复合词（firefighter、website）由原形 / 组成的词推出来。build_phonics.py 依次试这些划分，
跟读音对得上（每节正好一个元音）就用，都对不上才用自己的算法。

用法（english-map 目录下，先跑过一次 build_phonics.py 得到词表）：
  curl -L -o <目录>/mhyph.txt https://www.gutenberg.org/files/3204/files/mhyph.txt
  python docs/audio/fetch_hyphen.py <目录>        （<目录>/wikt/ 是 Wiktionary 的缓存，已有的不重取）
新加了词再跑一遍，然后重跑 build_phonics.py。
"""
import json, os, sys, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

base_dir = sys.argv[1]
cache = os.path.join(base_dir, 'wikt')
os.makedirs(cache, exist_ok=True)
txt = open('data/phonics-words.js', encoding='utf-8').read()
words = sorted(json.loads(txt[txt.index('{'):txt.rindex('}') + 1]))

# ---------- Moby ----------
moby = {}
for line in open(os.path.join(base_dir, 'mhyph.txt'), 'rb').read().split(b'\r\n'):
    parts = [p.decode('latin-1').lower() for p in line.split(b'\xa5')]   # 分隔符是 0xA5
    w = ''.join(parts)
    if line and ' ' not in w and '-' not in w:
        moby.setdefault(w, [])
        if parts not in moby[w]:
            moby[w].append(parts)


# ---------- Wiktionary ----------
def get(w):
    p = os.path.join(cache, w + '.json')
    if os.path.exists(p):
        return
    res = []
    for form in (w, w.capitalize()):                    # 专有名词（April、Chinese）页面是大写开头
        url = 'https://kaikki.org/dictionary/English/meaning/{}/{}/{}.jsonl'.format(
            *(urllib.parse.quote(s) for s in (form[0], form[:2], form)))
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                rows = [json.loads(l) for l in r.read().decode('utf-8').splitlines() if l.strip()]
            res = [{'pos': d.get('pos'), 'hy': [h.get('parts') for h in d.get('hyphenations', [])]} for d in rows]
            break
        except Exception as e:
            if '404' not in str(e):
                print(w, e)
                return                                  # 网络错误不缓存，下次再取
    json.dump(res, open(p, 'w', encoding='utf-8'), ensure_ascii=False)


def wikt(w):
    p = os.path.join(cache, w + '.json')
    if not os.path.exists(p):
        return []
    d = json.load(open(p, encoding='utf-8'))
    out = []
    for e in d if isinstance(d, list) else []:
        for h in e.get('hy', []):
            h = [s.lower() for s in (h or [])]
            if h and ''.join(h) == w and h not in out:
                out.append(h)
    return out


with ThreadPoolExecutor(8) as ex:
    list(ex.map(get, words))


def direct(w):
    out = []
    for h in moby.get(w, []) + wikt(w):
        if h not in out:
            out.append(h)
    return out


# ---------- 变形词、复合词 ----------
def derive(w, depth=0):
    """词表里没有的词：从原形加词尾、或者拆成两个词推出划分"""
    d = direct(w)
    if d or depth > 1:
        return d
    out = []

    def add(hs):
        for h in hs:
            if h not in out and ''.join(h) == w:
                out.append(h)

    def tail(base, suf, own):                          # own：词尾自成一节（box·es、want·ed、play·ing）
        hs = derive(base, depth + 1)
        return [h + [suf] if own else h[:-1] + [h[-1] + suf] for h in hs]

    if w.endswith('ies') and len(w) > 4:               # hob·by → hob·bies
        add([h[:-1] + [h[-1][:-1] + 'ies'] for h in derive(w[:-3] + 'y', depth + 1)])
    if w.endswith('es') and w[-3] in 'sxzh':           # box·es、sand·wich·es
        add(tail(w[:-2], 'es', True))
    if w.endswith('es'):                               # to·ma·toes
        add(tail(w[:-2], 'es', False))
    if w.endswith('s'):                                # an·i·mals
        add(tail(w[:-1], 's', False))
    if w.endswith('ed') and w[-3] in 'td':             # want·ed、vis·it·ed
        add(tail(w[:-2], 'ed', True))
    if w.endswith('ed'):                               # re·laxed、en·dan·gered
        add(tail(w[:-2], 'ed', False))
        add(tail(w[:-1], 'd', False))
    if w.endswith('ing'):
        b = w[:-3]
        add(tail(b, 'ing', True))                      # play·ing、jump·ing
        if len(b) > 2 and b[-1] == b[-2]:              # swim·ming：双写的字母归 -ing 那节
            add([h[:-1] + [h[-1], b[-1] + 'ing'] for h in derive(b[:-1], depth + 1)])
        add([h[:-1] + [h[-1][:-1], 'ing'] for h in derive(b + 'e', depth + 1) if h[-1].endswith('e')])   # mak·ing
    if w.endswith('men'):                              # police·men
        add([h[:-1] + [h[-1][:-3] + 'men'] for h in derive(w[:-3] + 'man', depth + 1)])
    if not out:
        for c in range(2, len(w) - 1):                 # 复合词：fire·fight·er、web·site
            a, b = w[:c], w[c:]
            ha, hb = derive(a, depth + 1), derive(b, depth + 1)
            if ha and hb and len(a) >= 2 and len(b) >= 2:
                add([ha[0] + hb[0]])
                break
    return out


out = {}
for w in words:
    hs = derive(w)
    if hs and (len(hs[0]) > 1 or len(hs) > 1):
        out[w] = hs
open('docs/audio/hyphen.json', 'w', encoding='utf-8', newline='\n').write(
    '{\n' + ',\n'.join(json.dumps(w, ensure_ascii=False) + ':' + json.dumps(out[w], ensure_ascii=False, separators=(',', ':'))
                       for w in sorted(out)) + '\n}\n')
multi = [w for w in words if w in out]
print(f'{len(words)} 个词，有音节划分的 {len(out)} 个')
