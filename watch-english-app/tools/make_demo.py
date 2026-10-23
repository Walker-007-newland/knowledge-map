"""生成 App 自带的示例短片（自编对话 + Windows 自带英文语音 + 自绘画面），不含任何电影内容。

用法：python -X utf8 tools/make_demo.py <ffmpeg.exe> [--mkv 另存一份 MKV 的路径，真机测 MKV 用]
产物：www/demo/demo.mp4、www/demo/demo.js（字幕 + 精讲包，App 里「示例短片」用）、www/demo/demo.srt、www/demo/demo.pack.json
"""
import json
import os
import subprocess
import sys
import tempfile
import wave

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'www', 'demo')
VOICE = {'A': 'Microsoft Zira Desktop', 'M': 'Microsoft Hazel Desktop'}
NAME = {'A': 'Anna', 'M': 'Mia'}
TITLE = '示例：车站的早晨'

LINES = [
    ('A', 'Hey, Mia! Over here!', '嘿，米娅！这边！',
     'Over here! 是招呼别人过来时的常用说法，意思是「在这儿、这边」。'),
    ('M', "Sorry I'm late. My bus broke down halfway here.", '抱歉我来晚了，公交车开到半路抛锚了。',
     'broke down 是 break down 的过去式：车辆、机器「抛锚、出故障」，也能说人「情绪崩溃」。\nhalfway here = 在来这儿的半路上，口语里常省掉 to。'),
    ('A', "No big deal. Our train doesn't leave for another twenty minutes.", '没事儿，我们的火车还有二十分钟才开呢。',
     'No big deal 没什么大不了。\nnot … for another + 一段时间：还要再过多久才……\n火车按时刻表开，所以用一般现在时 leave 表示将来。'),
    ('M', 'Thank goodness. I was totally freaking out on the way.', '谢天谢地，我一路上都快急疯了。',
     'Thank goodness 谢天谢地（比 Thank God 温和）。\nfreak out 吓坏、抓狂；过去进行时 was freaking out 强调「那段时间一直」处在这种状态。\ntotally 口语里常用来加强语气。'),
    ('A', 'Come on, take it easy. Do you have the tickets?', '好啦，放轻松。票带了吗？',
     'Come on 用法很多，这里是安抚的「好啦、别这样」。\ntake it easy 放轻松、别紧张。'),
    ('M', "Hang on, I'm pretty sure they're somewhere in this bag.", '等一下，我很确定就在这个包里。',
     'Hang on = 等一下，比 wait 更口语。\npretty 放在形容词前是「相当、挺」：pretty sure 很确定。'),
    ('A', 'You always say that, and then it takes forever.', '你每次都这么说，结果要找半天。',
     'it takes forever：要花很久很久（夸张说法），带点抱怨的语气。'),
    ('M', 'Got them! See? I told you I had everything under control.', '找到了！看吧？我就说一切尽在掌握。',
     'Got them! 是 I\'ve got them! 省掉了主语和助动词，口语里很常见。\nunder control 在掌控之中。'),
    ('A', "Okay, okay. So what's the plan once we arrive?", '好吧好吧。那到了以后有什么安排？',
     'So 放句首用来转话题。\nonce 作连词 = 一……就……：once we arrive 我们一到。'),
    ('M', 'I figured we could drop our bags at the hotel and grab some lunch.', '我想先把包放到酒店，再随便吃点午饭。',
     'I figured … 我想、我估计（美式口语，figure = think）。\ndrop sth at … 把东西放到某处。\ngrab some lunch 随便吃点午饭：grab 在口语里常表示「匆匆吃、喝、拿」。'),
    ('A', "Sounds good. But let's not waste the whole afternoon shopping again.", '听着不错。不过这次别又逛一下午街了。',
     'Sounds good 省掉了主语 That。\nlet\'s not do … 咱们别……\nwaste + 时间 + doing：浪费时间做某事。'),
    ('M', 'Fair enough. You pick the museum, as long as I get to pick dinner.', '行，有道理。博物馆你来挑，只要晚饭让我挑就行。',
     'Fair enough 有道理、行吧（接受对方的意见）。\nas long as 只要。\nget to do 得以、有机会做某事。'),
    ('A', "Deal. Now let's get going before we miss the train.", '一言为定。现在赶紧走吧，别误了火车。',
     'Deal. = It\'s a deal. 一言为定。\nget going 动身、出发。\nbefore 引导的时间状语从句用一般现在时 miss 表示将来。'),
    ('M', "Wait, which platform is it? I can't make out that sign from here.", '等等，是哪个站台？我在这儿看不清那块牌子。',
     'make out 看清、听清、辨认出，常用在 can\'t make out 里。\nplatform 在车站里是「站台」。'),
    ('A', 'Platform six. If we hurry, we can still grab a coffee.', '六号站台。快点的话，还来得及买杯咖啡。',
     'grab a coffee 买杯咖啡（很快地）。\nif 条件句里用一般现在时 hurry 表示将来。'),
    ('M', "Now you're talking!", '这才像话嘛！',
     'Now you\'re talking! 对方终于说出你爱听的提议时用：「这才像话！这就对了！」'),
]
WORDS = [
    ('break down', '（车）抛锚', '本片：My bus broke down. 也能说人情绪崩溃：She broke down in tears.'),
    ('freak out', '急疯了；吓坏', '口语高频，也可以说 Don\'t freak out. 别慌。'),
    ('hang on', '等一下', '打电话时 Hang on a second. = 稍等一下。'),
    ('take forever', '要花好长时间', '夸张说法，常带抱怨。'),
    ('figure', '（口语）认为；估计', 'I figured … = I thought …，美式口语。'),
    ('grab', '（口语）匆匆吃、喝、买', 'grab lunch / grab a coffee / grab a cab'),
    ('fair enough', '有道理；行吧', '接受对方观点时说。'),
    ('make out', '看清；辨认出', '常用于否定：I can\'t make out what he\'s saying.'),
    ('get going', '动身；出发', 'We should get going. 我们该走了。'),
    ('now you\'re talking', '这才像话', '对方提出让你满意的建议时说。'),
    ('halfway', '在半路上', 'halfway here / halfway home'),
]


def tts(text, voice, path):
    ps = ("Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
          f"$s.SelectVoice('{voice}'); $s.Rate = -1; "
          "$f = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono); "
          f"$s.SetOutputToWaveFile('{path}', $f); $s.Speak([Console]::In.ReadToEnd()); $s.Dispose()")
    subprocess.run(['powershell', '-NoProfile', '-Command', ps], input=text.encode('utf-8'), check=True)


def font(size, bold=False):
    for f in (('arialbd.ttf' if bold else 'arial.ttf'), 'msyh.ttc'):
        p = os.path.join(os.environ.get('WINDIR', 'C:/Windows'), 'Fonts', f)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def frame(speaker, path, title=False):
    W, H = 640, 360
    im = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(im)
    for y in range(H):   # 天空渐变
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(250 - 70 * t), int(214 - 60 * t), int(170 + 40 * t)))
    d.rectangle([0, 250, W, H], fill=(96, 92, 88))
    d.rectangle([0, 244, W, 252], fill=(240, 200, 60))
    d.rounded_rectangle([30, 150, 610, 240], 18, fill=(40, 90, 140))   # 火车
    for x in range(60, 600, 80):
        d.rounded_rectangle([x, 168, x + 50, 200], 6, fill=(200, 230, 250))
    d.rounded_rectangle([470, 40, 600, 80], 8, fill=(25, 60, 110))
    d.text((535, 60), 'Platform 6', font=font(18, True), fill='white', anchor='mm')
    if title:
        d.rounded_rectangle([110, 110, 530, 250], 20, fill=(0, 0, 0))
        d.text((320, 160), 'Morning at the Station', font=font(32, True), fill='white', anchor='mm')
        d.text((320, 205), 'a short demo  ·  Anna & Mia', font=font(20), fill=(255, 210, 160), anchor='mm')
        im.save(path)
        return
    for who, cx, col in (('A', 200, (232, 110, 50)), ('M', 440, (30, 150, 140))):
        on = who == speaker
        r = 52 if on else 40
        cy = 300 - r
        d.ellipse([cx - r, cy - r - 40, cx + r, cy + r - 40], fill=col if on else tuple(c // 2 + 60 for c in col))
        d.ellipse([cx - r // 2, cy - r - 30 - r // 2, cx + r // 2, cy - r - 30 + r // 2], fill=(255, 224, 189))
        d.text((cx, 338), NAME[who], font=font(20, True), fill='white', anchor='mm')
        if on:   # 说话气泡
            bx = cx + (60 if who == 'A' else -60)
            d.rounded_rectangle([bx - 40, 92, bx + 40, 132], 14, fill='white')
            d.text((bx, 112), '...', font=font(24, True), fill=(60, 60, 60), anchor='mm')
    im.save(path)


def stamp(ms):
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


def main(ffmpeg, mkv=None):
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='we-demo-')
    rate, gap, lead = 22050, 500, 1500
    pcm = bytearray(b'\0\0' * (rate * lead // 1000))
    cues = []
    for i, (who, en, zh, _) in enumerate(LINES):
        wav = os.path.join(tmp, f'l{i}.wav')
        tts(en, VOICE[who], wav)
        with wave.open(wav) as w:
            data = w.readframes(w.getnframes())
        start = len(pcm) // 2 * 1000 // rate
        pcm += data
        end = len(pcm) // 2 * 1000 // rate
        cues.append((start, end))
        pcm += b'\0\0' * (rate * gap // 1000)
    pcm += b'\0\0' * rate
    audio = os.path.join(tmp, 'audio.wav')
    with wave.open(audio, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(bytes(pcm))
    total = len(pcm) // 2 * 1000 // rate

    # 画面：片头一张，之后每句一张（从这句开始显示到下一句开始）
    concat = []
    frame(None, os.path.join(tmp, 'title.png'), title=True)
    concat.append(("title.png", cues[0][0] / 1000))
    for i, (who, *_rest) in enumerate(LINES):
        frame(who, os.path.join(tmp, f'f{i}.png'))
        nxt = cues[i + 1][0] if i + 1 < len(cues) else total
        concat.append((f'f{i}.png', (nxt - cues[i][0]) / 1000))
    with open(os.path.join(tmp, 'list.txt'), 'w') as f:
        for name, dur in concat:
            f.write(f"file '{name}'\nduration {dur:.3f}\n")
        f.write(f"file '{concat[-1][0]}'\n")
    mp4 = os.path.join(OUT, 'demo.mp4')
    subprocess.run([ffmpeg, '-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-i', 'audio.wav',
                    '-vf', 'fps=12,format=yuv420p', '-c:v', 'libx264', '-profile:v', 'baseline', '-crf', '30', '-preset', 'veryslow',
                    '-c:a', 'aac', '-b:a', '48k', '-ar', '22050', '-shortest', '-movflags', '+faststart', mp4], cwd=tmp, check=True)
    if mkv:
        subprocess.run([ffmpeg, '-y', '-hide_banner', '-loglevel', 'error', '-i', mp4, '-c', 'copy', mkv], check=True)

    srt = ''.join(f'{i + 1}\n{stamp(s)} --> {stamp(e)}\n{LINES[i][1]}\n{LINES[i][2]}\n\n' for i, (s, e) in enumerate(cues))
    with open(os.path.join(OUT, 'demo.srt'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(srt)
    pack = {
        'type': 'watch-english-pack', 'version': 1, 'title': TITLE, 'made': '示例',
        'lines': [{'t': cues[i][0], 'en': en, 'zh': zh, 'note': note} for i, (_, en, zh, note) in enumerate(LINES)],
        'words': [{'w': w, 'zh': zh, 'note': note, 't': [cues[i][0] for i, l in enumerate(LINES) if w.split()[0][:4] in l[1].lower()]} for w, zh, note in WORDS],
    }
    with open(os.path.join(OUT, 'demo.pack.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(pack, f, ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, 'demo.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('// 示例短片的字幕和精讲包，由 tools/make_demo.py 生成\nwindow.WE_DEMO=' + json.dumps({'title': TITLE, 'srt': srt, 'pack': pack}, ensure_ascii=False) + ';\n')
    print(f'时长 {total / 1000:.1f} 秒，{len(cues)} 句，demo.mp4 {os.path.getsize(mp4) // 1024} KB')


if __name__ == '__main__':
    args = sys.argv[1:]
    main(args[0], args[args.index('--mkv') + 1] if '--mkv' in args else None)
