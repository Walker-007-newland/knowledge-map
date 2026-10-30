"""课本单元单词的英文录音：用 Kokoro（Apache-2.0 神经网络语音，离线）生成 MP3，听写时优先播放录音。

输出：
  audio/en/<文件名>.mp3   每个词条一个，单声道 32kbps
  audio/index.js          window.KW_AUDIO = { 课本里的写法: 文件名 }，dict-run.js 按原样（区分大小写）再按小写查

用法（模型文件很大，不放仓库；在 english-map 目录下运行）：
  python -m venv venv && venv/Scripts/pip install kokoro-onnx==0.6.1 onnxruntime==1.20.1 lameenc
  下载 https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx 和 voices-v1.0.bin
  venv/Scripts/python docs/audio/build_audio.py <模型所在目录>
已经生成过的词条不重做（换声音或语速时先删掉 audio/en）。新加了课本词表后重跑一遍即可。
"""
import glob, json, os, re, sys

import lameenc
import numpy as np
from kokoro_onnx import Kokoro

VOICE, SPEED = 'af_heart', 0.9          # 美式女声；略慢一点，听写更清楚
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


def trim(x, sr, thr=0.01, pad=0.06):
    idx = np.where(np.abs(x) > thr)[0]
    if not len(idx):
        return x
    p = int(pad * sr)
    return x[max(0, idx[0] - p): min(len(x), idx[-1] + p)]


def to_mp3(x, sr, path):
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()
    e = lameenc.Encoder()
    e.set_bit_rate(KBPS); e.set_in_sample_rate(sr); e.set_channels(1); e.set_quality(2)
    with open(path, 'wb') as f:
        f.write(e.encode(pcm) + e.flush())


def main():
    model_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
    words = []
    for f in sorted(glob.glob('data/words/mj*.js')):
        for m in re.finditer(r'en:\s*"([^"]+)"', open(f, encoding='utf-8').read()):
            en = m.group(1).strip()
            if en not in words:
                words.append(en)
    os.makedirs('audio/en', exist_ok=True)
    k = Kokoro(os.path.join(model_dir, 'kokoro-v1.0.onnx'), os.path.join(model_dir, 'voices-v1.0.bin'))
    used, index, made = {}, {}, 0
    for en in words:
        stem = stem_of(en, used)
        index[en] = stem
        path = f'audio/en/{stem}.mp3'
        if os.path.exists(path):
            continue
        x, sr = k.create(spoken(en), voice=VOICE, speed=SPEED, lang='en-us')
        to_mp3(trim(x, sr), sr, path)
        made += 1
        if made % 50 == 0:
            print(made, en, flush=True)
    js = ('// 课本单元单词的英文录音索引：由 docs/audio/build_audio.py 生成，不要手改\n'
          f'// 声音 Kokoro {VOICE}（Apache-2.0），语速 {SPEED}\n'
          'window.KW_AUDIO = ' + json.dumps(index, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n')
    open('audio/index.js', 'w', encoding='utf-8', newline='\n').write(js)
    size = sum(os.path.getsize(p) for p in glob.glob('audio/en/*.mp3'))
    print(f'{len(index)} 条，新生成 {made} 条，共 {size / 1024 / 1024:.1f} MB')


if __name__ == '__main__':
    main()
