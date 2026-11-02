# 手写听写用的笔画数据：从 hanzi-writer-data（npm 包，字形来自 Make Me a Hanzi，Arphic Public License）
# 取出各册词表用到的字，按 Unicode 码位分桶写成 data/tingxie/strokes/sNN.js（KT.addStrokes({...})），
# 页面只载入要听写的字所在的桶，file:// 下可用。
# 用法：python build_strokes.py <hanzi-writer-data 解包目录>（即含 字.json 的 package 目录）
# 新增或修改词表后重跑一次。
import glob, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
BUCKETS = 16


def main(src):
    chars = set()
    for f in glob.glob(os.path.join(ROOT, 'data', 'tingxie', 'tb*.js')):
        for w in re.findall(r'"w": "([^"]+)"', open(f, encoding='utf-8').read()):
            chars.update(c for c in w if '㐀' <= c <= '鿿')
    out_dir = os.path.join(ROOT, 'data', 'tingxie', 'strokes')
    if os.path.isdir(out_dir):
        shutil.rmtree(out_dir)
    os.makedirs(out_dir)
    buckets, missing = {}, []
    for c in sorted(chars):
        p = os.path.join(src, c + '.json')
        if not os.path.exists(p):
            missing.append(c)
            continue
        d = json.load(open(p, encoding='utf-8'))
        buckets.setdefault(ord(c) % BUCKETS, {})[c] = {'strokes': d['strokes'], 'medians': d['medians']}
    for n, data in buckets.items():
        with open(os.path.join(out_dir, 's%02d.js' % n), 'w', encoding='utf-8') as f:
            f.write('// 由 docs/tingxie/build_strokes.py 生成，不要手改。字形数据：hanzi-writer-data（Make Me a Hanzi），Arphic Public License，见同目录 ARPHICPL.TXT\n')
            f.write('KT.addStrokes(%s);\n' % json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    shutil.copy(os.path.join(src, 'ARPHICPL.TXT'), out_dir)
    print('%d 个字，分 %d 个文件；缺字形：%s' % (len(chars) - len(missing), len(buckets), missing or '无'))


if __name__ == '__main__':
    main(sys.argv[1])
