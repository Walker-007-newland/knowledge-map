"""音标课录音（data/yinbiao.js 用）
  1. 音标：维基共享资源的国际音标真人录音（CC BY-SA 3.0 / 公有领域），辅音录音里有好几段，只截第一段
     8 个双元音和 tr dr ts dz 没有现成录音，页面上改放第一个例词
  2. 例词：Kokoro 英式 bf_emma 整词读（按实际声音的起止剪）
  3. 字母名称音：Kokoro 英式按音标读

输出：
  audio/ipa/s-<码>.mp3   音标，码是每个字符的 Unicode 十六进制用 - 连起来（iː → 69-2d0）
  audio/ipa/w-<词>.mp3   例词
  audio/ipa/l-<字母>.mp3 字母
  audio/ipa/CREDITS.txt  音标录音的来源、作者和许可（CC BY-SA 要求署名）
  audio/ipa-index.js     window.YB_AUDIO = { sym: [有录音的音标], words: {写法: 文件名} }

用法（在 english-map 目录下，和 build_audio.py 用同一个 venv，另需 soundfile）：
  venv/Scripts/python docs/audio/build_ipa.py <Kokoro 模型目录> <下载缓存目录> [--redo]
最后会列出例词音标和 espeak 英式音标不一致的地方，逐条人工看一遍（课本写法和 espeak 有些本来就不同，如 /ʊə/）。
"""
import glob, json, os, re, sys, time, urllib.parse, urllib.request

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_audio import PEAK, clip, envelope, speech_span, to_mp3   # noqa: E402

VOICE, SPEED = 'bf_emma', 0.85
UA = 'KnowledgeMapEdu/1.0 (https://github.com/Walker-007-newland/knowledge-map)'
COMMONS = {
    'iː': 'Close front unrounded vowel', 'ɪ': 'Near-close near-front unrounded vowel',
    'e': 'Close-mid front unrounded vowel', 'æ': 'Near-open front unrounded vowel',
    'ɜː': 'Open-mid central unrounded vowel', 'ə': 'Mid-central vowel', 'ʌ': 'Open-mid back unrounded vowel',
    'uː': 'Close back rounded vowel', 'ʊ': 'Near-close near-back rounded vowel', 'ɔː': 'Open-mid back rounded vowel',
    'ɒ': 'Open back rounded vowel', 'ɑː': 'Open back unrounded vowel',
    'p': 'Voiceless bilabial plosive', 'b': 'Voiced bilabial plosive', 't': 'Voiceless alveolar plosive',
    'd': 'Voiced alveolar plosive', 'k': 'Voiceless velar plosive', 'ɡ': 'Voiced velar plosive',
    'f': 'Voiceless labiodental fricative', 'v': 'Voiced labiodental fricative', 'θ': 'Voiceless dental fricative',
    'ð': 'Voiced dental fricative', 's': 'Voiceless alveolar sibilant', 'z': 'Voiced alveolar sibilant',
    'ʃ': 'Voiceless palato-alveolar sibilant', 'ʒ': 'Voiced palato-alveolar sibilant',
    'tʃ': 'Voiceless palato-alveolar affricate', 'dʒ': 'Voiced palato-alveolar affricate',
    'm': 'Bilabial nasal', 'n': 'Alveolar nasal', 'ŋ': 'Velar nasal', 'h': 'Voiceless glottal fricative',
    'l': 'Alveolar lateral approximant', 'r': 'Alveolar approximant', 'w': 'Voiced labio-velar approximant',
    'j': 'Palatal approximant',
}
# 照字面读会读成别的音：按课程音标读（/ʊə/ 现在多读 /ɔː/，课本仍写 /ʊə/；use 作动词读 /juːz/）
BY_IPA = {'tour', 'poor', 'sure', 'cure', 'use'}
VOWELS = {'iː', 'ɪ', 'e', 'æ', 'ɜː', 'ə', 'ʌ', 'uː', 'ʊ', 'ɔː', 'ɒ', 'ɑː'}


def code(sym):
    return '-'.join(f'{ord(c):x}' for c in sym)


def stem(word):
    return re.sub(r'[^a-z0-9]+', '-', word.lower()).strip('-')


def read_data():
    src = open('data/yinbiao.js', encoding='utf-8').read()
    words = {}
    for m in re.finditer(r"\['((?:[^'\\]|\\.)*)', '([^']+)', '([^']*[一-鿿][^']*)'\]", src):   # 第三项是中文才是例词
        g = m.group(1).replace("\\'", "'")
        words.setdefault(g.replace('[', '').replace(']', ''), m.group(2))
    letters = re.findall(r"\['([A-Z])', '([^']+)'\]", src)
    return words, letters


def http(url):
    for t in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA})).read()
        except Exception as e:                       # 429 限流：要等 10 分钟
            print('  下载失败，稍后重试', e, flush=True)
            time.sleep(5 if t == 0 else 620)
    raise OSError('下载不了 ' + url)


def symbol_audio(cache, redo):
    os.makedirs(cache, exist_ok=True)
    titles = {s: f'File:{n}.ogg' for s, n in COMMONS.items()}
    q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'prop': 'imageinfo', 'redirects': 1,
                                'iiprop': 'url|extmetadata', 'iiextmetadatafilter': 'LicenseShortName|Artist',
                                'titles': '|'.join(titles.values())})
    d = json.loads(http('https://commons.wikimedia.org/w/api.php?' + q))['query']
    alias = {r['from']: r['to'] for r in d.get('normalized', []) + d.get('redirects', [])}
    pages = {p['title']: p for p in d['pages'].values()}
    credits = []
    for s, t in titles.items():
        while t in alias:
            t = alias[t]
        info = pages[t]['imageinfo'][0]
        meta = info.get('extmetadata', {})
        lic = meta.get('LicenseShortName', {}).get('value', '')
        artist = re.sub(r'<[^>]+>', '', meta.get('Artist', {}).get('value', '')).strip() or '见文件页'
        credits.append(f'/{s}/\t{t}\t{artist}\t{lic}\thttps://commons.wikimedia.org/wiki/{urllib.parse.quote(t.replace(" ", "_"))}')
        out = f'audio/ipa/s-{code(s)}.mp3'
        if os.path.exists(out) and not redo:
            continue
        raw = os.path.join(cache, code(s) + '.ogg')
        if not (os.path.exists(raw) and open(raw, 'rb').read(4) == b'OggS'):
            open(raw, 'wb').write(http(info['url'].split('?')[0]))
            time.sleep(3)
        x, sr = sf.read(raw)
        x = x.mean(1) if x.ndim > 1 else x
        t0, t1 = speech_span(x, sr)
        if s not in VOWELS:                          # 辅音录音有好几段（单读、放在元音里读），只要第一段
            e, st = envelope(x, sr, 0.01)
            on = e > e.max() * 0.2                   # 有的录音底噪到 15%
            seen, off = False, 0
            for i, v in enumerate(on):
                if v:
                    seen, off = True, 0
                elif seen:
                    off += 1
                    if off >= 10:                    # 隔了 100ms 静音：第一段到这里为止
                        t1 = min(t1, (i - off + 1) * st + 0.03)
                        break
        seg = clip(x, sr, t0, t1, pre=0.03, post=0.05)
        to_mp3(seg * (PEAK / np.abs(seg).max()), sr, out)
    open('audio/ipa/CREDITS.txt', 'w', encoding='utf-8', newline='\n').write(
        '音标录音来自维基共享资源（Wikimedia Commons），按各自许可使用；辅音只截取了第一段并调整了音量。\n'
        '音标\t文件\t作者\t许可\t地址\n' + '\n'.join(credits) + '\n')
    return sorted(COMMONS)


def tts(k, text, phonemes=False):
    x, sr = k.create(text, voice=VOICE, speed=SPEED, lang='en-gb', is_phonemes=phonemes, trim=False)
    t0, t1 = speech_span(x, sr)
    return clip(x * (PEAK / np.abs(x).max()), sr, t0, t1, pre=0.03, post=0.1), sr


def word_audio(k, words, letters, redo):
    index = {}
    for w in words:
        index[w] = stem(w)
        out = f'audio/ipa/w-{stem(w)}.mp3'
        if redo or not os.path.exists(out):
            ipa = words[w].replace('g', 'ɡ').replace('r', 'ɹ')
            to_mp3(*(tts(k, ipa, phonemes=True) if w in BY_IPA else tts(k, w)), out)
    for L, ipa in letters:
        out = f'audio/ipa/l-{L.lower()}.mp3'
        if redo or not os.path.exists(out):
            to_mp3(*tts(k, ipa.replace('g', 'ɡ').replace('r', 'ɹ'), phonemes=True), out)
    return index


def check_ipa(words):
    """和 espeak 英式（RP）音标对一下，列出不一样的"""
    import phonemizer
    from kokoro_onnx.tokenizer import Tokenizer
    Tokenizer()
    from build_phonics import norm_ipa
    diff = []
    for w, mine in words.items():
        es = norm_ipa(phonemizer.phonemize(w, 'en-gb-x-rp', with_stress=True).strip())
        a, b = mine.replace('ˈ', '').replace('ɡ', 'g'), es.replace('ˈ', '').replace('ˌ', '').replace('ɡ', 'g')
        if a != b:
            diff.append(f'{w}: 课程 /{mine}/  espeak /{es}/')
    print(f'例词 {len(words)} 个，音标和 espeak 不同的 {len(diff)} 个：')
    print('\n'.join('  ' + d for d in diff))


def main():
    model_dir, cache = sys.argv[1], sys.argv[2]
    redo = '--redo' in sys.argv
    from kokoro_onnx import Kokoro
    os.makedirs('audio/ipa', exist_ok=True)
    words, letters = read_data()
    k = Kokoro(os.path.join(model_dir, 'kokoro-v1.0.onnx'), os.path.join(model_dir, 'voices-v1.0.bin'))
    syms = symbol_audio(cache, redo)
    index = word_audio(k, words, letters, redo)
    keep = {f'audio/ipa/s-{code(s)}.mp3' for s in syms} | {f'audio/ipa/w-{v}.mp3' for v in index.values()} \
        | {f'audio/ipa/l-{L.lower()}.mp3' for L, _ in letters}
    for f in glob.glob('audio/ipa/*.mp3'):
        if f.replace('\\', '/') not in keep:
            os.remove(f)
    js = ('// 音标课录音索引：由 docs/audio/build_ipa.py 生成，不要手改\n'
          '// 音标录音来自维基共享资源（来源和许可见 audio/ipa/CREDITS.txt）；例词、字母是 Kokoro 英式 bf_emma\n'
          'window.YB_AUDIO = ' + json.dumps({'sym': syms, 'words': index}, ensure_ascii=False, separators=(',', ':'),
                                            sort_keys=True) + ';\n')
    open('audio/ipa-index.js', 'w', encoding='utf-8', newline='\n').write(js)
    size = sum(os.path.getsize(f) for f in glob.glob('audio/ipa/*.mp3'))
    print(f'音标 {len(syms)} 个，例词 {len(index)} 个，字母 {len(letters)} 个，共 {size / 1024:.0f} KB')
    check_ipa(words)


if __name__ == '__main__':
    main()
