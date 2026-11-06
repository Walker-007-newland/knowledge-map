"""英文录音：用 Kokoro（Apache-2.0 神经网络语音，离线）生成 MP3。
  1. 课本单元单词整词录音（美式），听写、默写、拼读「连读」时放
  2. 音节拼读录音（英式）：多音节词的每个音节按音标单独读一遍（像老师拼读那样一节一节读清楚）

输出：
  audio/en/<文件名>.mp3      课本词条整词，单声道 32kbps
  audio/index.js             window.KW_AUDIO = { 课本里的写法: 文件名 }，按原样（区分大小写）再按小写查
  audio/syl/<词>-<序号>.mp3  多音节词的每个音节（各节音标记在 docs/audio/syl-sig.json，用来判断要不要重做）
  audio/syl-index.js         window.KW_SYL_AUDIO = { 小写单词: 文件名前缀 }，第 n 节是 <前缀>-<n>.mp3

注意：kokoro-onnx 给的每个音的时间点整体比实际声音晚 0.15 秒左右（两头都偏），直接按它剪会把每个词的开头剪掉。
所以整词只按音量找声音的起止。所有录音统一放大到峰值 0.9。
音节以前是整词读一遍再切（syllable_audio_sliced，留作对照），切出来每节只有 0.2 秒左右、带着前后音，听着不准；
2026-11-05 起每节单独合成，docs/audio/syl-sig.json 记着每节音标，音标没变的不重做。

用法（模型文件很大，不放仓库；在 english-map 目录下运行；先跑 build_phonics.py）：
  python -m venv venv && venv/Scripts/pip install kokoro-onnx==0.6.1 onnxruntime==1.20.1 lameenc
  下载 https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx（v1.1 这一版带 duration）
     和 https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
  venv/Scripts/python docs/audio/build_audio.py <模型所在目录> [--redo]
已经生成过的不重做（--redo 全部重新生成）。新加了课本词表后重跑一遍即可。
"""
import glob, json, os, re, sys

import lameenc
import numpy as np
from kokoro_onnx import Kokoro

VOICE, SPEED = 'af_heart', 0.9          # 整词：美式女声，略慢一点，听写更清楚
SYL_VOICE, SYL_SPEED, SYL_LANG = 'af_heart', 0.85, 'en-us'  # 音节：美式，和整词同一个声音（2026-11-05 用户要美式；原来 bf_emma 英式）
KBPS = 32

# 不能照字面读的写法：缩写读字母、称谓读全称
SPEAK = {
    'Dr.': 'Doctor', 'Mr.': 'Mister', 'Mrs.': 'Missus', 'Ms.': 'Miz',
    'a.m.': 'A. M.', 'p.m.': 'P. M.', 'Covid-19': 'Covid nineteen',
    'IT': 'I. T.', 'PE': 'P. E.', 'TV': 'T. V.', 'UK': 'U. K.', 'USA': 'U. S. A.', 'OK': 'O. K.',
}


def spoken(en):
    if en in SPEAK:
        return SPEAK[en]
    t = en.replace('...', ' ').replace('…', ' ')
    t = re.sub(r'\bsb\.', 'somebody', t)
    t = re.sub(r'\bsth\.', 'something', t)
    t = t.replace('/', ', ')                 # is/are、a/an：两种都读
    return re.sub(r'\s+', ' ', t).strip()


def stem_of(en, used):
    s = re.sub(r'[^a-z0-9]+', '-', en.lower()).strip('-') or 'w'
    base, n = s, 2
    while s in used and used[s] != en:       # IT 和 it 是两条
        s = f'{base}-{n}'; n += 1
    used[s] = en
    return s


def clip(x, sr, t0, t1, pre=0.03, post=0.08):
    """按时间剪一段，两头各淡入淡出 10ms，免得有咔哒声"""
    seg = x[max(0, int((t0 - pre) * sr)): min(len(x), int((t1 + post) * sr))].copy()
    f = min(int(0.01 * sr), len(seg) // 2)
    if f:
        seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    return seg


PEAK = 0.9


def envelope(x, sr, step=0.005):
    w = int(sr * step)
    n = len(x) // w
    return np.sqrt(np.mean(x[:n * w].reshape(n, w) ** 2, axis=1)), step


def quietest(x, sr, t, span=0.04):
    """t 前后 span 秒里最安静的时刻（在这里切开，不会带上相邻音节的一点声音）"""
    e, st = envelope(x, sr)
    a, b = max(0, int((t - span) / st)), min(len(e) - 1, int((t + span) / st))
    if b <= a:
        return t
    return (a + int(np.argmin(e[a:b + 1]))) * st


def speech_span(x, sr, ratio=0.03):
    """声音的起止：10ms 窗口能量超过峰值 3% 的第一处和最后一处"""
    e, st = envelope(x, sr, 0.01)
    idx = np.where(e > e.max() * ratio)[0]
    return idx[0] * st, (idx[-1] + 1) * st


# Kokoro 读辅音开头的词时，常在辅音前多出一小团浊音（听起来像「呃-cat」「呃-six」）：
# 一段低过零率（浊音）的声音 → 能量掉下去或者开始出现摩擦噪音 → 才是真正的辅音和元音。
# 只处理清辅音和 b/d/g/dʒ 开头的词；v、z、th（ð）、ʒ 本身就是浊音，前面那段很可能就是辅音，不切。
LEAD_CONS = set('ptkfθsʃhʧbdgɡʤ')


def zcr(x, sr, step=0.01):
    w = int(sr * step)
    n = len(x) // w
    s = np.sign(x[:n * w].reshape(n, w))
    return np.mean(np.abs(np.diff(s, axis=1)) > 0, axis=1)


def lead_cut(x, sr, t0, phonemes):
    """返回去掉开头那团多余浊音后的起点（秒）；不需要切就返回 t0"""
    ph = phonemes.lstrip('ˈˌ ')
    if not ph or ph[0] not in LEAD_CONS:
        return t0
    e, st = envelope(x, sr, 0.01)
    e = e / e.max()
    z = zcr(x, sr, 0.01)
    i0 = int(round(t0 / st))
    s = next((i for i in range(i0, min(i0 + 3, len(e))) if z[i] <= 0.15 and e[i] >= 0.15), None)
    if s is None:                                   # 一开头就是摩擦噪音（t、s、ch 等），正常
        return t0
    peak, cut = 0.0, None
    for i in range(s, min(s + 14, len(e))):
        if z[i] > 0.15 or (peak >= 0.25 and e[i] <= 0.6 * peak):
            cut = i
            break
        peak = max(peak, e[i])
    if cut is None or cut <= s or peak < 0.25 or e[cut:cut + 20].max() < max(peak, 0.6):
        return t0
    return cut * st


def to_mp3(x, sr, path):
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    e = lameenc.Encoder()
    e.set_bit_rate(KBPS); e.set_in_sample_rate(sr); e.set_channels(1); e.set_quality(2)
    data = e.encode(pcm) + e.flush()
    # Windows 上杀毒软件会短暂占用刚写的文件：先写临时文件再替换，失败就等一下重试
    import time
    for i in range(10):
        try:
            with open(path + '.tmp', 'wb') as f:
                f.write(data)
            os.replace(path + '.tmp', path)
            return
        except OSError:
            time.sleep(0.3 * (i + 1))
    raise OSError('写不进 ' + path)


def word_audio(k, redo):
    words = []
    for f in sorted(glob.glob('data/words/mj*.js')):
        for m in re.finditer(r'en:\s*"([^"]+)"', open(f, encoding='utf-8').read()):
            en = m.group(1).strip()
            if en not in words:
                words.append(en)
    # 2026-11-06：自建听写词单里的词多半不在课本单元词表里，原来全走平板的系统语音，音质差一截。
    # 把课标小学 + 初中词表（docs/wordlists/wordlists.js）、不规则变化形式（went、children）、拼读词也录好
    have = {w.lower() for w in words}
    wl = open('docs/wordlists/wordlists.js', encoding='utf-8').read()
    WL = json.loads(wl[wl.index('{'):wl.rindex('}') + 1])
    ph = open('data/phonics-words.js', encoding='utf-8').read()
    extra = sorted(set(WL['primary']) | set(WL['junior']) | set(WL['irr'])
                   | set(json.loads(ph[ph.index('{'):ph.rindex('}') + 1])))
    for en in extra:
        if re.fullmatch(r"[a-z]+(?:[-' ][a-z]+)*", en) and en not in have:
            words.append(en); have.add(en)
    os.makedirs('audio/en', exist_ok=True)
    used, index, made = {}, {}, 0
    for en in words:
        stem = stem_of(en, used)
        index[en] = stem
        path = f'audio/en/{stem}.mp3'
        if os.path.exists(path) and not redo:
            continue
        x, sr = k.create(spoken(en), voice=VOICE, speed=SPEED, lang='en-us', trim=False)
        t0, t1 = speech_span(x, sr)
        c = lead_cut(x, sr, t0, k.tokenizer.phonemize(spoken(en), 'en-us'))
        to_mp3(clip(x * (PEAK / np.abs(x).max()), sr, c, t1, pre=0.03 if c == t0 else 0, post=0.1), sr, path)
        made += 1
        if made % 100 == 0:
            print('整词', made, en, flush=True)
    js = ('// 英文单词录音索引（课本单元单词 + 课标小学/初中词表 + 不规则变化形式 + 拼读词）：由 docs/audio/build_audio.py 生成，不要手改\n'
          f'// 声音 Kokoro {VOICE}（Apache-2.0），语速 {SPEED}\n'
          'window.KW_AUDIO = ' + json.dumps(index, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n')
    open('audio/index.js', 'w', encoding='utf-8', newline='\n').write(js)
    size = sum(os.path.getsize(p) for p in glob.glob('audio/en/*.mp3'))
    print(f'整词 {len(index)} 条，新生成 {made} 条，共 {size / 1024 / 1024:.1f} MB')


_UNITS = ('aɪə', 'aʊə', 'tʃ', 'dʒ', 'aɪ', 'eɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə', 'iː', 'ɑː', 'ɔː', 'uː', 'ɜː')
_V = {'æ', 'e', 'ɪ', 'ɒ', 'ʌ', 'ʊ', 'ə', 'i', 'iː', 'ɑː', 'ɔː', 'uː', 'ɜː', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə',
      'aɪə', 'aʊə'}
# 英式 → 美式（元音后的 r 读出来时）
_R = {'ɑː': 'ɑːɹ', 'ɔː': 'ɔːɹ', 'ɜː': 'ɜːɹ', 'ə': 'ɚ', 'eə': 'ɛɹ', 'ɪə': 'ɪɹ', 'ʊə': 'ʊɹ', 'aɪə': 'aɪɚ', 'aʊə': 'aʊɚ',
      'e': 'ɛɹ', 'ɪ': 'ɪɹ', 'ʌ': 'ɜːɹ', 'ɒ': 'ɔːɹ', 'æ': 'ɛɹ'}
_PLAIN = {'əʊ': 'oʊ', 'ɒ': 'ɑː', 'e': 'ɛ', 'eə': 'ɛ', 'ɪə': 'ɪə', 'ʊə': 'ʊ'}


# 英美读音不按规则变的词：整词每节的美式音标
US_WORD = {'banana': 'bə næ nə', 'tomato': 'tə meɪ toʊ', 'tomatoes': 'tə meɪ toʊz'}


def to_us(p, g):
    """课本的英式音节音标 + 这一节的字母 → 给美式声音读的音标：
    元音后不读的 r 读出来（teach·er、car、bird），əʊ→oʊ，hot 的 ɒ→ɑː，bas·ket、af·ter 的 ɑː→æ，
    t/d/n/s/l/θ 后面的 juː 去掉 j（stu·dent、new）"""
    p = p.lstrip('ˈ')
    us, i = [], 0
    while i < len(p):
        u = next((u for u in _UNITS if p.startswith(u, i)), p[i])
        us.append(u); i += len(u)
    vi = [n for n, u in enumerate(us) if u in _V]
    # 字母里元音后面跟 r，且 r 后面不是元音字母（或者只剩词尾 e）：英式不读这个 r，美式要读
    r_col = bool(re.search(r'[aeiouy]r+(?:[^aeiouy]|e?s?$)', g)) and not any(
        us[n + 1:n + 2] == ['r'] for n in vi)
    for n in vi:
        u = us[n]
        if r_col and n == vi[-1]:
            us[n] = _R.get(u, u + 'ɹ')
        elif u == 'ɑː' and 'a' in g and not re.search('al|au|aw', g) and n < len(us) - 1:   # 闭音节：bas、af、glass
            us[n] = 'æ'
        else:
            us[n] = _PLAIN.get(u, u)
    out = ''.join(us)
    out = re.sub(r'(?<=[tdnslθ])juː', 'uː', out)
    return out.replace('g', 'ɡ').replace('r', 'ɹ').replace('ɹɹ', 'ɹ')


def one_syllable(k, p):
    """一个音节单独读（像老师拼读时一节一节读清楚）：按音标合成，每节都按重读读，去掉开头多余的浊音。
    p 已经是给声音读的音标（美式见 to_us）"""
    p = p.lstrip('ˈ')
    x, sr = k.create('ˈ' + p, voice=SYL_VOICE, speed=SYL_SPEED,
                     lang=SYL_LANG, is_phonemes=True, trim=False)
    t0, t1 = speech_span(x, sr)
    c = lead_cut(x, sr, t0, p)
    seg = clip(x, sr, c, t1, pre=0.02 if c == t0 else 0, post=0.06)
    return seg * (PEAK / max(np.abs(seg).max(), 1e-6)), sr


def syllable_audio(k, redo):
    """多音节词：每个音节按它的音标单独合成一遍（2026-11-05 起；以前是整词读一遍再切，切出来太短、带着前后音，听着不准）"""
    src = open('data/phonics-words.js', encoding='utf-8').read()
    data = json.loads(src[src.index('{'):src.rindex('}') + 1])
    os.makedirs('audio/syl', exist_ok=True)
    index, made, keep, memo = {}, 0, set(), {}
    sig_path = 'docs/audio/syl-sig.json'                        # 每个词各节的音标：音标没变的录音不重做
    old_sig = json.load(open(sig_path, encoding='utf-8')) if os.path.exists(sig_path) else {}
    new_sig = {}
    for w, v in sorted(data.items()):
        syls = [t.split('=', 1) for t in v.split('|')[1].split(' ')]
        if len(syls) < 2:
            continue
        stem = re.sub(r'[^a-z0-9]+', '-', w)
        paths = [f'audio/syl/{stem}-{n}.mp3' for n in range(len(syls))]
        said = US_WORD[w].split(' ') if SYL_LANG == 'en-us' and w in US_WORD else [to_us(p, g) if SYL_LANG == 'en-us' else p.lstrip('ˈ').replace('g', 'ɡ').replace('r', 'ɹ') for g, p in syls]
        sig = new_sig[w] = SYL_VOICE + ' ' + ' '.join(said)
        if not redo and all(os.path.exists(p) for p in paths) and old_sig.get(w) == sig:
            index[w] = stem; keep.update(paths); continue
        for q, path in zip(said, paths):
            if q not in memo:
                memo[q] = one_syllable(k, q)
            to_mp3(memo[q][0], memo[q][1], path)
        index[w] = stem; keep.update(paths); made += 1
        if made % 100 == 0:
            print('音节', made, w, flush=True)
    open(sig_path, 'w', encoding='utf-8', newline='\n').write(
        '{\n' + ',\n'.join(json.dumps(w, ensure_ascii=False) + ':' + json.dumps(new_sig[w], ensure_ascii=False)
                           for w in sorted(new_sig)) + '\n}\n')
    for f in glob.glob('audio/syl/*'):                            # 不再用到的音节录音删掉
        if f.replace('\\', '/') not in keep:
            os.remove(f)
    js = ('// 音节拼读录音索引：由 docs/audio/build_audio.py 生成，不要手改\n'
          f'// 声音 Kokoro {SYL_VOICE}（{"美式" if SYL_LANG == "en-us" else "英式"}），每个音节单独读；第 n 节是 audio/syl/<前缀>-<n>.mp3\n'
          'window.KW_SYL_AUDIO = ' + json.dumps(index, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n')
    open('audio/syl-index.js', 'w', encoding='utf-8', newline='\n').write(js)
    size = sum(os.path.getsize(f) for f in glob.glob('audio/syl/*.mp3'))
    print(f'音节录音 {len(index)} 个词，新生成 {made} 个，不同的音节 {len(memo)} 个，共 {size / 1024 / 1024:.1f} MB')


def syllable_audio_sliced(k, redo):
    """旧做法（留作对照，不再调用）：音节音标拼成整词，英式读一遍，按音的时间点切开"""
    src = open('data/phonics-words.js', encoding='utf-8').read()
    data = json.loads(src[src.index('{'):src.rindex('}') + 1])
    os.makedirs('audio/syl', exist_ok=True)
    index, made, skipped, keep, alone = {}, 0, [], set(), []
    for w, v in sorted(data.items()):
        syls = [t.split('=', 1) for t in v.split('|')[1].split(' ')]
        if len(syls) < 2:
            continue
        full, spans = '', []
        for n, (g, p) in enumerate(syls):
            stress = p.startswith('ˈ'); p = p.lstrip('ˈ')
            shared = full and full.replace('ˈ', '')[-1:] == p[:1] and syls[n - 1][0][-1:] == g[:1]
            if shared:                                            # rab /ræb/ · bit /bɪt/：b 只读一次，两节都包含它
                if stress:
                    full = full[:-1] + 'ˈ' + full[-1]
                start = len(full) - 1
                full += p[1:]
            else:
                if stress:
                    full += 'ˈ'
                start = len(full)
                full += p
            spans.append((start, len(full)))
        stem = re.sub(r'[^a-z0-9]+', '-', w)
        paths = [f'audio/syl/{stem}-{n}.mp3' for n in range(len(syls))]
        if all(os.path.exists(p) for p in paths) and not redo:
            index[w] = stem; keep.update(paths); continue
        x, sr, tm = k.create_timed(full.replace('g', 'ɡ').replace('r', 'ɹ'), voice=SYL_VOICE, speed=SYL_SPEED,
                                   lang='en-gb', is_phonemes=True, trim=False)
        if len(tm) != len(full):                                  # 时间点和音对不上：这个词不做音节录音（页面会退回语音引擎）
            skipped.append(w); continue
        # 时间点整体偏晚：把 [第一个音的开始, 最后一个音的结束] 线性对到实际声音的起止上
        on, off = speech_span(x, sr)
        a0, a1 = tm[0].start, tm[-1].end
        at = lambda t: on + (t - a0) * (off - on) / (a1 - a0)
        last = len(spans) - 1
        for n, ((a, b), path) in enumerate(zip(spans, paths)):
            while a < b and full[a] == 'ˈ':
                a += 1
            # 第一节从声音起点开始，最后一节到声音终点再留一点余音；中间在边界附近最安静处切，不带相邻音节的声音
            if n == 0:
                c = lead_cut(x, sr, on, full)
                t0 = on - 0.02 if c == on else c
            else:
                t0 = quietest(x, sr, at(tm[a].start))
            t1 = off + 0.06 if n == last else quietest(x, sr, at(tm[b - 1].end))
            if t1 - t0 >= 0.12:
                seg = clip(x, sr, t0, t1, pre=0, post=0)
            else:                                                 # 弱读的单个元音在整词里几乎被吞掉：这一节单独读
                y = k.create(syls[n][1].lstrip('ˈ').replace('g', 'ɡ').replace('r', 'ɹ'), voice=SYL_VOICE,
                             speed=SYL_SPEED, lang='en-gb', is_phonemes=True, trim=False)[0]
                u0, u1 = speech_span(y, sr)
                c = lead_cut(y, sr, u0, syls[n][1])
                seg = clip(y, sr, c, u1, pre=0.02 if c == u0 else 0, post=0.06)
                alone.append(f'{w}-{n}')
            # 每节单独放大到 PEAK（弱读音节本来就轻，最多放大 4 倍）
            to_mp3(seg * min(4.0, PEAK / max(np.abs(seg).max(), 1e-6)), sr, path)
        index[w] = stem; keep.update(paths); made += 1
    for f in glob.glob('audio/syl/*.mp3'):                        # 不再用到的音节录音删掉
        if f.replace('\\', '/') not in keep:
            os.remove(f)
    js = ('// 音节拼读录音索引：由 docs/audio/build_audio.py 生成，不要手改\n'
          f'// 声音 Kokoro {SYL_VOICE}（英式），整词读一遍再按音的时间点切开；第 n 节是 audio/syl/<前缀>-<n>.mp3\n'
          'window.KW_SYL_AUDIO = ' + json.dumps(index, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n')
    open('audio/syl-index.js', 'w', encoding='utf-8', newline='\n').write(js)
    size = sum(os.path.getsize(f) for f in glob.glob('audio/syl/*.mp3'))
    print(f'音节录音 {len(index)} 个词，新生成 {made} 个，跳过 {len(skipped)} 个 {skipped[:10]}，单独读 {len(alone)} 节 {alone}，共 {size / 1024 / 1024:.1f} MB')


def main():
    model_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
    redo = '--redo' in sys.argv
    k = Kokoro(os.path.join(model_dir, 'kokoro-v1.0.onnx'), os.path.join(model_dir, 'voices-v1.0.bin'))
    if not k.has_timings:
        sys.exit('这个模型文件没有 duration 输出，剪不准开头，请用 model-files-v1.1 里的 kokoro-v1.0.onnx')
    word_audio(k, redo)
    syllable_audio(k, redo)


if __name__ == '__main__':
    main()
