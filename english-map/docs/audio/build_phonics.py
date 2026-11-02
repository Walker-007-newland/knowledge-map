"""自然拼读数据：把每个单词切成“字母组合 → 音”的块（br-igh-t → /b/ /r/ /aɪ/ /t/），给拼读卡片用。

音标用 espeak-ng 的英式标准音 RP（en-gb-x-rp，和国内课本一样），再按课本写法统一符号（ɹ→r、a→æ 等）。
字母和音的对应用自然拼读规则表做动态规划对齐：优先用规则表里的字母组合，对不上的才逐个字母硬配（记进报告人工检查）。

输出 data/phonics-words.js：window.KW_PHONICS = { 小写单词: "/音标/|字母=音 字母=音 ..." }
  静音字母写成 字母=（空），magic e 的元音写成 a~ 表示和词尾 e 相连（cake: c=k a~=eɪ k=k e=）
报告 docs/audio/phonics-report.txt：对不齐的词（要人工改 FIX 或规则表）

用法（english-map 目录下，用 build_audio.py 同一个 venv）：venv/Scripts/python docs/audio/build_phonics.py
"""
import glob, json, re, sys

from kokoro_onnx.tokenizer import Tokenizer
import phonemizer

# ---------------- 取词 ----------------
def words_from_sources():
    words = set()
    for f in sorted(glob.glob('data/words/mj*.js')):
        for m in re.finditer(r'en:\s*"([^"]+)"', open(f, encoding='utf-8').read()):
            words.update(re.findall(r"[A-Za-z']+(?:-[A-Za-z']+)*", m.group(1)))
    for f in sorted(glob.glob('data/*.js')):                      # 知识图谱讲解里 <span class="w"> 的词
        for m in re.finditer(r'class="w">([^<]+)<', open(f, encoding='utf-8').read()):
            words.update(re.findall(r"[A-Za-z']+(?:-[A-Za-z']+)*", m.group(1)))
    out = set()
    for w in words:
        for part in w.split('-'):                                # ping-pong 按两个词处理
            low = part.lower()
            if "'" in part or low in SKIP or not re.search('[aeiouy]', low):   # isn't、Mr、Dr 这类不拼读
                continue
            if len(part) >= 2 or low in ('a', 'i'):
                if not (part.isupper() and len(part) > 1):       # IT、TV、UK 这类缩写按字母读，不拼读
                    out.add(low)
    return sorted(out)

# 拼音地名、外来专名：拼读规则套不上，不做
SKIP = {'fuzhou', 'fujian', 'gulangyu', 'qingming', 'quanzhou', 'yuanxiao', 'yangtze', 'tokyo', 'beijing', 'xiamen',
        'zhongqiu', 'jiaozi', 'tangyuan', 'zongzi', 'wuyi', 'putian', 'zhangzhou', 'longyan', 'sanming', 'nanping', 'ningde',
        'shanghai', 'guangzhou', 'shenzhen', 'hangzhou', 'xi', 'hainan', 'taiwan', 'hongkong', 'macao', 'mrs', 'mr', 'ms', 'dr', 'll'}

# ---------------- 音标 ----------------
UNITS = ['tʃ', 'dʒ', 'aɪə', 'aʊə', 'aɪ', 'eɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə', 'iː', 'ɑː', 'ɔː', 'uː', 'ɜː']
NORM = [('ɹ', 'r'), ('ɡ', 'g'), ('ɐ', 'ə'), ('iə', 'ɪə'), ('ᵻ', 'ɪ'), ('ɚ', 'ə'), ('ɾ', 't'), ('ʔ', 't'), ('ɬ', 'l'), ('ɫ', 'l'),
        ('oː', 'ɔː'), ('ɛ', 'e'), ('æ', 'æ'), ('ɑ̃', 'ɒ'), ('n̩', 'ən'), ('l̩', 'əl'), ('ɪ̈', 'ɪ'), ('ː', 'ː')]

def norm_ipa(p):
    p = p.strip().replace(' ', '')
    for a, b in NORM:
        p = p.replace(a, b)
    p = re.sub(r'(?<![aɔe])ɪ$', 'i', p)                                     # 词尾 y 的音，课本写 /i/（happy /ˈhæpi/）
    return p

def units(p):
    """音标切成音素（双元音、长元音、tʃ dʒ 算一个），去掉重音符号"""
    p = p.replace('ˈ', '').replace('ˌ', '')
    out, i = [], 0
    while i < len(p):
        for u in ('tʃ', 'dʒ', 'aɪ', 'eɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə', 'iː', 'ɑː', 'ɔː', 'uː', 'ɜː'):
            if p.startswith(u, i):
                out.append(u); i += len(u); break
        else:
            out.append(p[i]); i += 1
    return out

VOWELS = {'æ', 'e', 'ɪ', 'ɒ', 'ʌ', 'ʊ', 'ə', 'i', 'iː', 'ɑː', 'ɔː', 'uː', 'ɜː', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə'}
ONSETS = {'sp', 'st', 'sk', 'sm', 'sn', 'sl', 'sw', 'pr', 'br', 'tr', 'dr', 'kr', 'gr', 'fr', 'θr', 'ʃr', 'pl', 'bl', 'kl', 'gl', 'fl',
          'tw', 'dw', 'kw', 'pj', 'bj', 'tj', 'dj', 'kj', 'fj', 'mj', 'nj', 'hj', 'vj', 'lj', 'spr', 'str', 'skr', 'spl', 'skw', 'skj', 'spj', 'stj', 'gw', 'θj', 'sj', 'zj', 'gj'}

def stressed_vowel(p):
    """espeak 音标里重读的是第几个元音（只算主重音）"""
    n, i, us = 0, 0, []
    p = p.replace('ˌ', '')
    k = None
    for u in units(p.replace('ˈ', '§')):
        if u == '§':
            k = n
        elif u in VOWELS:
            n += 1
    return k

def show_ipa(ph, k):
    """课本写法：重音符号放在重读音节开头，单音节词不标"""
    vs = [i for i, u in enumerate(ph) if u in VOWELS]
    if len(vs) < 2 or k is None or k >= len(vs):
        return '/' + ''.join(ph) + '/'
    v = vs[k]
    lo = vs[k - 1] + 1 if k > 0 else 0
    start = v
    for j in range(lo, v):                                       # 元音前面的辅音，取最长的合法音节开头
        cl = ''.join(ph[j:v])
        if j == v - 1 and ph[j] != 'ŋ' or cl in ONSETS:
            start = j
            break
    return '/' + ''.join(ph[:start]) + 'ˈ' + ''.join(ph[start:]) + '/'

# ---------------- 拼读规则表：字母组合 → 可能的音（越靠前越常见） ----------------
R = {}
def rule(g, *opts):
    R.setdefault(g, [])
    for o in opts:
        R[g].append(tuple(o.split()) if o else ())

# 辅音
for c in 'bfklmnprvz':
    rule(c, c)
rule('j', 'dʒ'); rule('d', 'd', 't'); rule('xc', 'k s'); rule('mn', 'm'); rule('zz', 't s', 'z'); rule('oar', 'ɔː')
rule('eir', 'eə'); rule('awy', 'ɔɪ')
for c in 'bdfglmnprstz':
    rule(c + c, c)
rule('c', 'k', 's'); rule('cc', 'k', 'k s'); rule('ck', 'k'); rule('ch', 'tʃ', 'k', 'ʃ'); rule('tch', 'tʃ')
rule('g', 'g', 'dʒ'); rule('dge', 'dʒ'); rule('gh', 'f', 'g', ''); rule('gn', 'n')
rule('h', 'h', ''); rule('kn', 'n'); rule('wr', 'r'); rule('mb', 'm'); rule('ph', 'f')
rule('qu', 'k w', 'k'); rule('q', 'k')
rule('s', 's', 'z', 'ʃ', 'ʒ'); rule('ss', 's', 'ʃ'); rule('sh', 'ʃ'); rule('sc', 's', 's k')
rule('th', 'θ', 'ð', 't'); rule('ng', 'ŋ', 'ŋ g'); rule('nk', 'ŋ k'); rule('n', 'n', 'ŋ')
rule('w', 'w', ''); rule('wh', 'w', 'h'); rule('x', 'k s', 'g z', 'z'); rule('y', 'j', 'ɪ', 'i', 'aɪ')
rule('t', 't', 'ʃ', 'tʃ', ''); rule('ti', 'ʃ'); rule('si', 'ʒ', 'ʃ'); rule('ci', 'ʃ'); rule('l', 'l', ''); rule('le', 'ə l')
rule('ture', 'tʃ ə'); rule('sure', 'ʒ ə', 'ʃ ʊə', 'ʃ ɔː')
# 元音
rule('a', 'æ', 'eɪ', 'ɑː', 'ɒ', 'ə', 'ɔː', 'e', 'ɪ', 'eə'); rule('ae', 'eə')
rule('e', 'e', 'iː', 'ɪ', 'ə', 'i', 'ɪə', '')
rule('i', 'ɪ', 'aɪ', 'iː', 'ə', 'i', 'j', 'aɪ ə')
rule('o', 'ɒ', 'əʊ', 'ʌ', 'uː', 'ə', 'ʊ', 'ɔː', 'ɪ', 'w ʌ')
rule('u', 'ʌ', 'j uː', 'uː', 'ʊ', 'ə', 'ɪ', 'e', 'j ʊ', 'j ə', 'w')
rule('ai', 'eɪ', 'e', 'ɪ', 'ə'); rule('ay', 'eɪ'); rule('au', 'ɔː', 'ɒ', 'ɑː', 'æ'); rule('aw', 'ɔː'); rule('al', 'ɔː', 'ɑː')
rule('ar', 'ɑː', 'ə', 'ɔː'); rule('air', 'eə'); rule('are', 'eə', 'ɑː'); rule('ear', 'ɪə', 'ɜː', 'eə')
rule('ea', 'iː', 'e', 'eɪ', 'ɪə'); rule('ee', 'iː', 'ɪ', 'i'); rule('eer', 'ɪə'); rule('ere', 'ɪə', 'eə')
rule('er', 'ɜː', 'ə'); rule('ir', 'ɜː'); rule('ur', 'ɜː', 'ə'); rule('or', 'ɔː', 'ɜː', 'ə'); rule('ore', 'ɔː')
rule('oor', 'ɔː', 'ʊə'); rule('our', 'ɔː', 'aʊ ə', 'ʊə', 'ə', 'ɜː'); rule('ure', 'j ʊə', 'ʊə', 'ə')
rule('ew', 'j uː', 'uː'); rule('ey', 'eɪ', 'i', 'iː'); rule('ie', 'aɪ', 'iː', 'i', 'e'); rule('igh', 'aɪ'); rule('eigh', 'eɪ')
rule('oa', 'əʊ', 'ɔː'); rule('oe', 'əʊ', 'uː'); rule('oi', 'ɔɪ'); rule('oy', 'ɔɪ'); rule('oo', 'uː', 'ʊ', 'ʌ', 'ɔː')
rule('ou', 'aʊ', 'ʌ', 'uː', 'ə', 'ɔː', 'əʊ', 'ʊ', 'ʊə'); rule('ow', 'aʊ', 'əʊ'); rule('ue', 'uː', 'j uː'); rule('ui', 'uː', 'ɪ')
rule('ough', 'ɔː', 'ʌ f', 'ɒ f', 'əʊ', 'aʊ', 'uː'); rule('augh', 'ɔː', 'ɑː f'); rule('ei', 'eɪ', 'iː', 'aɪ'); rule('eu', 'j uː')
rule('ire', 'aɪ ə'); rule('ier', 'ɪə'); rule('ia', 'ɪə', 'aɪ ə'); rule('io', 'ə', 'aɪ ə'); rule('ious', 'ə s'); rule('tion', 'ʃ ə n')
rule('sion', 'ʒ ə n', 'ʃ ə n')

LONG = {'eɪ', 'aɪ', 'əʊ', 'uː', 'iː', 'j uː'}

def align(word, ph):
    """动态规划：字母串和音素串对齐。返回 [(字母, 音素串)], 总代价, 硬配次数"""
    W, P = len(word), len(ph)
    INF = 1e9
    best = [[INF] * (P + 1) for _ in range(W + 1)]
    back = [[None] * (P + 1) for _ in range(W + 1)]
    best[0][0] = 0
    for i in range(W):
        for j in range(P + 1):
            c0 = best[i][j]
            if c0 >= INF:
                continue
            for L in range(1, 5):
                g = word[i:i + L]
                if len(g) < L or g not in R:
                    continue
                for k, opt in enumerate(R[g]):
                    n = len(opt)
                    if tuple(ph[j:j + n]) != opt:
                        continue
                    if not n and g not in ('e', 'h', 'gh', 'w', 'l', 't'):
                        continue
                    if g == 'al' and word[i + 2:i + 3] == 'l':           # ball、tall 是 a + ll，不是 al + l
                        continue
                    c = c0 + 1 + 0.15 * k + (0.6 if not n else 0)
                    if g == 'e' and not n and i != W - 1 and word[i + 1:] not in ('s', 'd'):
                        c += 1.5                                  # 不在词尾的 e 一般不是静音
                    if c < best[i + L][j + n]:
                        best[i + L][j + n] = c; back[i + L][j + n] = (i, j, g, opt, False)
            # 硬配：一个字母对一个音或不发音
            for n in (0, 1):
                if j + n <= P:
                    c = c0 + (5 if n else 6)
                    if c < best[i + 1][j + n]:
                        best[i + 1][j + n] = c; back[i + 1][j + n] = (i, j, word[i], tuple(ph[j:j + n]), True)
    if best[W][P] >= INF:
        return None, INF, 99
    chunks, i, j, forced = [], W, P, 0
    while i > 0:
        pi, pj, g, opt, f = back[i][j]
        chunks.append([g, ' '.join(opt)]); forced += f
        i, j = pi, pj
    chunks.reverse()
    # magic e：元音字母 + 一个辅音 + 词尾静音 e，元音读长音
    if len(chunks) >= 3 and chunks[-1] == ['e', ''] and len(chunks[-3][0]) == 1 and chunks[-3][0] in 'aeiou' \
            and chunks[-3][1] in LONG and chunks[-2][0] not in 'aeiouy':
        chunks[-3][0] += '~'
    return chunks, best[W][P], forced

# 规则表处理不好的个别词，人工指定（字母=音，空格分开）
FIX = {
    'one': 'one=w ʌ n', 'once': 'o=w ʌ n=n ce=s', 'two': 't=t wo=uː', 'eye': 'eye=aɪ', 'women': 'w=w o=ɪ m=m e=ɪ n=n',
    'island': 'i=aɪ s= l=l a=ə n=n d=d', 'sugar': 's=ʃ u=ʊ g=g ar=ə', 'friend': 'f=f r=r ie=e n=n d=d',
    'people': 'p=p eo=iː p=p le=ə l', 'colonel': 'colonel=k ɜː n ə l', 'busy': 'b=b u=ɪ s=z y=i',
    'said': 's=s ai=e d=d', 'says': 's=s ay=e s=z', 'does': 'd=d oe=ʌ s=z', 'done': 'd=d o=ʌ n=n e=',
    'some': 's=s o=ʌ m=m e=', 'come': 'c=k o=ʌ m=m e=', 'love': 'l=l o=ʌ v=v e=', 'have': 'h=h a=æ v=v e=',
    'give': 'g=g i=ɪ v=v e=', 'live': 'l=l i=ɪ v=v e=', 'are': 'are=ɑː', 'were': 'w=w ere=ɜː', 'where': 'wh=w ere=eə',
    'there': 'th=ð ere=eə', 'here': 'h=h ere=ɪə', 'who': 'wh=h o=uː', 'whose': 'wh=h o=uː s=z e=',
    'whole': 'wh=h o~=əʊ l=l e=', 'answer': 'a=ɑː n=n s=s w= er=ə', 'listen': 'l=l i=ɪ s=s t= e=ə n=n',
    'hour': 'h= our=aʊə', 'honest': 'h= o=ɒ n=n e=ɪ s=s t=t', 'climb': 'c=k l=l i=aɪ mb=m',
    'Wednesday': 'w=w e=e d= n=n e= s=z d=d ay=eɪ', 'wednesday': 'w=w e=e d= n=n e= s=z d=d ay=eɪ',
    'beautiful': 'b=b eau=j uː t=t i=ɪ f=f u=ə l=l', 'shoe': 'sh=ʃ oe=uː', 'shoes': 'sh=ʃ oe=uː s=z',
    'any': 'a=e n=n y=i', 'many': 'm=m a=e n=n y=i', 'again': 'a=ə g=g ai=e n=n', 'heart': 'h=h ear=ɑː t=t',
    'build': 'b=b ui=ɪ l=l d=d', 'buy': 'b=b uy=aɪ', 'guess': 'gu=g e=e ss=s', 'guide': 'gu=g i~=aɪ d=d e=',
    'of': 'o=ɒ f=v', 'the': 'th=ð e=ə', 'a': 'a=ə', 'to': 't=t o=uː', 'do': 'd=d o=uː', 'you': 'y=j ou=uː',
    'I': 'I=aɪ', 'i': 'i=aɪ', 'water': 'w=w a=ɔː t=t er=ə', 'father': 'f=f a=ɑː th=ð er=ə',
    'business': 'b=b u=ɪ s=z i= n=n e=ə ss=s', 'medicine': 'm=m e=e d=d i= c=s i=ə n=n e=',
    'restaurant': 'r=r e=e s=s t=t au=ɒ r=r a=ə n=n t=t', 'soldier': 's=s o=əʊ l=l d=dʒ ie=ə r=',
    'souvenir': 's=s ou=uː v=v e=ə n=n ir=ɪə', 'their': 'th=ð eir=eə', 'favourite': 'f=f a=eɪ v=v ou= r=r i=ɪ t=t e=',
    'lawyer': 'l=l awy=ɔɪ er=ə', 'eighth': 'eigh=eɪ t=t h=θ', 'everyone': 'e=e v=v e= r=r y=i o=w ʌ n=n e=',
    'someone': 's=s o=ʌ m=m e= o=w ʌ n=n e=', 'anyone': 'a=e n=n y=i o=w ʌ n=n e=',
    'education': 'e=e d=dʒ u=uː c=k a=eɪ tion=ʃ ə n', 'experience': 'e=ɪ x=k s p=p e=ɪə r=r i=i e=ə n=n c=s e=',
    'museum': 'm=m u=j uː s=z e=iː u=ə m=m', 'onion': 'o=ʌ n=n i=j o=ə n=n',
    'twentieth': 't=t w=w e=e n=n t=t i=i e=ə th=θ', 'drawing': 'd=d r=r aw=ɔː i=ɪ ng=ŋ',
}

SHORT = {'æ', 'e', 'ɪ', 'ɒ', 'ʌ', 'ʊ'}


def syllabify(chunks, k, force=()):
    """按读音分音节，再对回字母：返回 [(音节字母, 音节音标)]
    - 两个元音之间的辅音：能做音节开头的尽量给后一节（li·bra·ry、mu·sic）
    - 重读短元音后面至少留一个辅音（sev·en、vis·it、hap·py）
    - 不发音的辅音字母跟后一节（lis·ten），不发音的元音字母跟前一节（love·ly）
    - 双写辅音从中间分开（hap·py、bal·loon）
    - force：必须从这些字母位置开始新音节（复合词 hard·work、后缀 work·ing）"""
    # nk 拆成 n /ŋ/ + k /k/（mon·key）；r 前面被 espeak 吞掉的元音字母补回 /ə/（dif·fer·ent、ev·er·y）
    ch2 = []
    for i, (g, p) in enumerate(chunks):
        if g == 'nk' and p.replace(' ', '') == 'ŋk':
            ch2 += [['n', 'ŋ'], ['k', 'k']]
        elif g == 'ng' and p.replace(' ', '') == 'ŋg':
            ch2 += [['n', 'ŋ'], ['g', 'g']]
        elif not p and g in ('e', 'a', 'o') and 0 < i < len(chunks) - 1 and chunks[i + 1][0] in ('r', 'rr')                 and chunks[i - 1][1] and not any(c in 'aeiouy' for c in chunks[i - 1][0]):
            ch2.append([g, 'ə'])
        else:
            ch2.append([g, p])
    chunks = ch2
    fpos, acc = set(), 0
    for ci, (g, p) in enumerate(chunks):
        if acc in force and ci:
            fpos.add(ci)
        acc += len(g)
    seq = []                                                      # 每个音素属于哪个字母块
    for ci, (g, p) in enumerate(chunks):
        for u in units(p.replace(' ', '')):
            seq.append((ci, u))
    nuc = [i for i, (ci, u) in enumerate(seq) if u in VOWELS]
    # aɪ/aʊ + ə 在同一个字母块里（fire、our）算一个音节
    nuc = [i for n, i in enumerate(nuc) if not (n and seq[i][1] == 'ə' and seq[i - 1][0] == seq[i][0] and seq[i - 1][1] in ('aɪ', 'aʊ'))]
    if len(nuc) < 2:
        return [(''.join(g for g, p in chunks), ''.join(u for _, u in seq))]
    starts = [0]                                                  # 每个音节从第几个字母块开始
    for n in range(1, len(nuc)):
        v1, v2 = nuc[n - 1], nuc[n]
        cons = [u for _, u in seq[v1 + 1:v2]]
        m = 0
        for j in range(len(cons), 0, -1):
            cl = ''.join(cons[-j:])
            if (j == 1 and cons[-1] != 'ŋ') or cl in ONSETS:
                m = j; break
        if m == len(cons) and cons and seq[v1][1] in SHORT and k == n - 1:
            m -= 1                                                # 重读短元音后面留一个辅音
        elif m >= 2 and m == len(cons) and cons[-m] == 's':
            m -= 1                                                # s+辅音：s 归前一节（bas·ket、sis·ter）
        fc = [c for c in fpos if seq[v1][0] < c <= seq[v2][0]]
        if fc:                                                    # 复合词、-ing：在词的分界处断开
            starts.append(fc[0])
            continue
        b = v2 - m                                                # 后一节从第 b 个音素开始
        cb = seq[b][0]
        if b > 0 and seq[b - 1][0] == cb and seq[v2][0] != cb:    # 边界落在一个字母块中间（x = ks）：整块归前一节
            cb += 1                                               # （块里有后一节的元音时整块归后一节：plea·sure）
        while cb - 1 > starts[-1] and not chunks[cb - 1][1] and chunks[cb - 1][0][0] not in 'aeiouy':
            cb -= 1                                               # 不发音的辅音字母跟后一节
        if cb > starts[-1]:
            starts.append(cb)
    # 字母边界：双写辅音拆开
    bounds, pos = [], []
    acc = 0
    for g, p in chunks:
        pos.append(acc); acc += len(g)
    share = {}                                                    # 双写辅音拆开时，它的音两节都有（rab /ræb/ · bit /bɪt/）
    dbl = lambda g: len(g) == 2 and g[0] == g[1] and g[0] not in 'aeiou'
    isv = lambda i: 0 <= i < len(chunks) and any(c in 'aeiouy' for c in chunks[i][0]) and chunks[i][1]
    for n, s in enumerate(starts[1:], 1):
        L = pos[s]
        prev, cur = chunks[s - 1][0], chunks[s][0]
        if dbl(prev) and isv(s) and isv(s - 2):
            L -= 1; share[n] = chunks[s - 1][1]
        elif dbl(cur) and isv(s + 1) and isv(s - 1):
            L += 1                                               # hel·lo：重读在后一节，音只放后一节
        bounds.append(L)
    word = ''.join(g for g, p in chunks)
    edges = [0] + bounds + [len(word)]
    out = []
    starts_end = starts + [len(chunks)]
    syl = [[u for ci, u in seq if starts_end[n] <= ci < starts_end[n + 1]] for n in range(len(starts))]
    for n, p in share.items():
        us = units(p.replace(' ', ''))
        if len(us) == 1:
            syl[n].insert(0, us[0])                               # bb = /b/：两节都有
        else:                                                     # cc = /ks/、zz = /ts/：前一个音留前一节，后面的给后一节
            del syl[n - 1][len(syl[n - 1]) - len(us) + 1:]
            syl[n][:0] = us[1:]
    for n in range(len(starts)):
        ph = ''.join(syl[n])
        if n == k:
            ph = 'ˈ' + ph
        out.append((word[edges[n]:edges[n + 1]], ph))
    return out


def parse_fix(spec):
    """FIX 的写法 'u=j uː s=z'：带 = 的开始一个块，不带 = 的是上一个块的后续音素"""
    out = []
    for tok in spec.split(' '):
        if '=' in tok:
            out.append(tok.split('=', 1))
        elif out:
            out[-1][1] += ' ' + tok
    return out


def main():
    Tokenizer()                                                    # 让 phonemizer 用 kokoro 带的 espeak-ng
    words = words_from_sources()
    ipas = {}
    for w in words:
        ipas[w] = norm_ipa(phonemizer.phonemize(w, 'en-gb-x-rp', preserve_punctuation=False, with_stress=True))
    out, report = {}, []
    clean = {}                                                     # 先对齐一遍，干净的词给复合词用
    for w in words:
        if w not in FIX:
            c, _, f = align(w, units(ipas[w]))
            if c and not f:
                clean[w] = [[g.rstrip('~'), p] for g, p in c]
        else:
            clean[w] = [[g.rstrip('~'), p] for g, p in parse_fix(FIX[w])]
    for w in words:
        ipa = ipas[w]
        ph = units(ipa)
        if w in FIX:
            chunks, forced = parse_fix(FIX[w]), 0
        else:
            chunks, cost, forced = align(w, ph)
        if chunks is None:
            report.append(f'{w}\t/{ipa}/\t对不齐'); continue
        if forced:
            for k in range(2, len(w) - 1):
                a, b = w[:k], w[k:]
                if a in clean and b in clean:
                    chunks, forced = clean[a] + clean[b], 0
                    break
        if forced:
            report.append(f'{w}\t/{ipa}/\t硬配 {forced} 处：' + ' '.join(f'{g}={p}' for g, p in chunks))
        chunks = [[g.rstrip('~'), p] for g, p in chunks]
        ph_out = [u for g, p in chunks for u in units(p.replace(' ', ''))]
        k = stressed_vowel(ipa)
        disp = show_ipa(ph_out, k)
        # 复合词（hard·work·ing）和 -ing 后缀：在分界处断开
        force = set()
        cuts = [c for c in range(3, len(w) - 2) if w[:c] in clean and w[c:] in clean]
        if cuts:
            force.add(cuts[0])
        base = w[:-3]
        if w.endswith('ing') and len(w) > 5 and w not in ('evening',) and (base in clean or base + 'e' in clean
                or any(base[:c] in clean and base[c:] in clean for c in range(3, len(base) - 2))):
            force.add(len(w) - 3)                                 # 原形是个词才按 -ing 断（read·ing、din·ing；mor·ning 不算）
            for c in range(3, len(base) - 2):
                if base[:c] in clean and base[c:] in clean:
                    force.add(c); break
        syls = syllabify(chunks, k, force)
        out[w] = f'{disp}|' + ' '.join(f'{g}={s}' for g, s in syls)
    js = ('// 音节拼读数据：由 docs/audio/build_phonics.py 生成，不要手改（要改就改脚本里的 FIX 或规则表再重跑）\n'
          '// 格式：小写单词 → "/音标/|音节字母=音节音标 ..."；带 ˈ 的是重读音节；单音节词只有一节\n'
          'window.KW_PHONICS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n')
    open('data/phonics-words.js', 'w', encoding='utf-8', newline='\n').write(js)
    open('docs/audio/phonics-report.txt', 'w', encoding='utf-8', newline='\n').write('\n'.join(report) + '\n')
    sym = sorted({u for w in out for u in units(ipas[w])})
    print(f'{len(words)} 个词，生成 {len(out)} 个，需要检查 {len(report)} 个；音素 {len(sym)} 种：' + ' '.join(sym))

if __name__ == '__main__':
    main()
