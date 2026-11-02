"""英文录音：用 Kokoro（Apache-2.0 神经网络语音，离线）生成 MP3。
  1. 课本单元单词整词录音（美式），听写、默写、拼读「连读」时放
  2. 音节拼读录音（英式）：多音节词用英式声音整词读一遍，按每个音的时间点切成一节一节

输出：
  audio/en/<文件名>.mp3      课本词条整词，单声道 32kbps
  audio/index.js             window.KW_AUDIO = { 课本里的写法: 文件名 }，按原样（区分大小写）再按小写查
  audio/syl/<词>-<序号>.mp3  多音节词的每个音节
  audio/syl-index.js         window.KW_SYL_AUDIO = { 小写单词: 文件名前缀 }，第 n 节是 <前缀>-<n>.mp3

注意：kokoro-onnx 给的每个音的时间点整体比实际声音晚 0.15 秒左右（两头都偏），直接按它剪会把每个词的开头剪掉。
所以整词只按音量找声音的起止；音节先按音量定出整词的起止，再把时间点线性对到这一段上，在边界附近最安静处切。
音节要用带 duration 输出的模型。所有录音统一放大到峰值 0.9。

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
SYL_VOICE, SYL_SPEED = 'bf_emma', 0.85  # 音节：英式（和卡片上的英式音标一致）
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
        to_mp3(clip(x * (PEAK / np.abs(x).max()), sr, t0, t1, pre=0.03, post=0.1), sr, path)
        made += 1
        if made % 100 == 0:
            print('整词', made, en, flush=True)
    js = ('// 课本单元单词的英文录音索引：由 docs/audio/build_audio.py 生成，不要手改\n'
          f'// 声音 Kokoro {VOICE}（Apache-2.0），语速 {SPEED}\n'
          'window.KW_AUDIO = ' + json.dumps(index, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n')
    open('audio/index.js', 'w', encoding='utf-8', newline='\n').write(js)
    size = sum(os.path.getsize(p) for p in glob.glob('audio/en/*.mp3'))
    print(f'整词 {len(index)} 条，新生成 {made} 条，共 {size / 1024 / 1024:.1f} MB')


def syllable_audio(k, redo):
    """多音节词：音节音标拼成整词（双写辅音两节共用的音只读一次），英式读一遍，按音的时间点切开"""
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
            t0 = on - 0.02 if n == 0 else quietest(x, sr, at(tm[a].start))
            t1 = off + 0.06 if n == last else quietest(x, sr, at(tm[b - 1].end))
            if t1 - t0 >= 0.12:
                seg = clip(x, sr, t0, t1, pre=0, post=0)
            else:                                                 # 弱读的单个元音在整词里几乎被吞掉：这一节单独读
                y = k.create(syls[n][1].lstrip('ˈ').replace('g', 'ɡ').replace('r', 'ɹ'), voice=SYL_VOICE,
                             speed=SYL_SPEED, lang='en-gb', is_phonemes=True, trim=False)[0]
                u0, u1 = speech_span(y, sr)
                seg = clip(y, sr, u0, u1, pre=0.02, post=0.06)
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
