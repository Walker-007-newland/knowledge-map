# 比对双人录入的词表：python diff.py <册id> <A.json> <B.json>
# 输出词数、逐条差异（按顺序对齐）和目录课题差异
import difflib, json, sys


def norm_tag(t):
    return '语文园地' if str(t).startswith('语文园地') else str(t)


def lessons(T):
    out = []
    for u in T['toc']:
        for it in u.get('items', []):
            if it.get('type') == 'lesson':
                out.append((u.get('unit'), it.get('no'), it.get('title')))
    return out


def main(bid, pa, pb):
    A = json.load(open(pa, encoding='utf-8'))
    B = json.load(open(pb, encoding='utf-8'))
    a = [(norm_tag(w['tag']), w.get('unit'), w['w']) for w in A['words']]
    b = [(norm_tag(w['tag']), w.get('unit'), w['w']) for w in B['words']]
    print('%s：A %d 词，B %d 词；书末注明 A=%s B=%s' % (bid, len(a), len(b), A.get('total_note'), B.get('total_note')))
    n = 0
    for op in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op[0] != 'equal':
            n += 1
            print('  词语差异', op[0], 'A:', a[op[1]:op[2]], 'B:', b[op[3]:op[4]])
    la, lb = lessons(A), lessons(B)
    print('  目录课文 A %d 篇，B %d 篇' % (len(la), len(lb)))
    for x, y in zip(la, lb):
        if x[:2] != y[:2]:
            n += 1
            print('  课号/单元差异', x, y)
        elif x[2] != y[2]:
            print('  （课题写法不同，按目录原文裁定）', x, '|', y[2])
    print('  词语与课号差异：%d 处' % n)


if __name__ == '__main__':
    main(*sys.argv[1:4])
