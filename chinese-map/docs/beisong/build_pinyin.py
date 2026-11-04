# 背诵比对用的拼音表：识别模型能输出的字（tokens.txt）+ 古诗词默写诗文里的字 → 不带声调的拼音（多音字列出全部读音）
# 生成 data/beisong/pinyin.js（window.KBP = { "字": "xie|xia", … }），页面按拼音比对，同音、近音字都算背对。
# 用法：python build_pinyin.py <tokens.txt>（识别模型的字表：https://cdn.jsdelivr.net/gh/Walker-007-newland/knowledge-map@asr-zh14m-v1/tokens.txt）
import json, os, re, sys
from pypinyin import pinyin, Style

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
han = lambda c: '\u3400' <= c <= '\u9fff'


def main(tokens):
    chars = set()
    for line in open(tokens, encoding='utf-8'):
        t = line.rsplit(' ', 1)[0]
        if len(t) == 1 and han(t):
            chars.add(t)
    chars.update(c for c in open(os.path.join(ROOT, 'data', 'moxie', 'poems.js'), encoding='utf-8').read() if han(c))
    table = {}
    for c in sorted(chars):
        ps = [p for p in pinyin(c, style=Style.NORMAL, heteronym=True)[0] if re.fullmatch(r'[a-zü]+', p)]
        if ps:
            table[c] = '|'.join(dict.fromkeys(p.replace('ü', 'v') for p in ps))
    out = os.path.join(ROOT, 'data', 'beisong', 'pinyin.js')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write('// 背诵比对用的拼音表（不带声调，多音字 | 分隔）：docs/beisong/build_pinyin.py 用 pypinyin 生成，不要手改\n')
        f.write('window.KBP = %s;\n' % json.dumps(table, ensure_ascii=False, separators=(',', ':')))
    print('%d 个字，%d KB' % (len(table), os.path.getsize(out) // 1024))


if __name__ == '__main__':
    main(sys.argv[1])
