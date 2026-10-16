# 查词是否在对应年级的词表内：python -X utf8 docs/wordlists/check_word.py <年级> 词1 词2 ...
# 四到六年级对照小学词表，七到九年级对照初中（义务教育）词表；只做原形匹配，变形请自己还原。
import json, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'wordlists.js'), encoding='utf-8').read()
WL = json.loads(src[src.index('{'):src.rindex('}') + 1])
primary, junior, senior = set(WL['primary']), set(WL['junior']), set(WL['senior'])
irr = WL['irr']

grade = int(sys.argv[1])
for w in sys.argv[2:]:
    x = w.lower()
    base = irr.get(x, x)
    if grade <= 6 and (x in primary or base in primary):
        tag = '小学词表 ✓'
    elif x in junior or base in junior:
        tag = '初中词表 ✓' if grade >= 7 else '初中词（四到六年级尽量换成小学词）'
    elif x in senior or base in senior:
        tag = '高中课标词 ✗'
    else:
        tag = '课标外 ✗'
    print(f'{w}: {tag}')
