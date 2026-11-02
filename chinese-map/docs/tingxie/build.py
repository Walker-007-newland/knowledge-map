# 由双人录入的 entries/<册id>-A.json 生成 data/tingxie/<册id>.js 和 books.js 里该册的目录
# 用法：python build.py tb4a   （要求 A、B 两份词语完全一致，否则报错退出，先裁定再生成）
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CN = '一二三四五六七八九十'

BOOKS = {
    'tb4a': dict(grade=4, term='上', pub='统编版', ed='根据2022年版课标修订版',
                 src='国家中小学智慧教育平台电子课本《义务教育教科书·语文四年级上册》（根据2022年版课程标准修订，人民教育出版社），书末“词语表”第127–129页；内容 ID 5cd7e623-5c38-4602-871a-3fba8a551db2'),
    # 下面四册是平台现行旧版（新版尚未发布），新版出来后重新录入
    'tb4b': dict(grade=4, term='下', pub='统编版', ed='现行版（旧版，新版出来后更新）',
                 src='国家中小学智慧教育平台电子课本《义务教育教科书·语文四年级下册》（人民教育出版社，现行旧版），书末“词语表”；内容 ID 53d6315e-5f90-42c4-904f-2d4e95fe99ed'),
    'tb5b': dict(grade=5, term='下', pub='统编版', ed='现行版（旧版，新版出来后更新）',
                 src='国家中小学智慧教育平台电子课本《义务教育教科书·语文五年级下册》（人民教育出版社，现行旧版），书末“词语表”；内容 ID 98172dc9-8fba-4da6-9fae-6a3d1166f038'),
    'tb6b': dict(grade=6, term='下', pub='统编版', ed='现行版（旧版，新版出来后更新）',
                 src='国家中小学智慧教育平台电子课本《义务教育教科书·语文六年级下册》（人民教育出版社，现行旧版），书末“词语表”；内容 ID 06422d77-21f1-45c3-b409-fa2947eee424'),
    'tb9b': dict(grade=9, term='下', pub='统编版', ed='现行版（旧版，新版出来后更新）',
                 src='国家中小学智慧教育平台电子课本《义务教育教科书·语文九年级下册》（人民教育出版社，现行旧版），各课“读读写写”；内容 ID a45516ee-78ed-46f0-b88b-671174f2a2fe'),
}


def norm_tag(t):
    return '语文园地' if str(t).startswith('语文园地') else str(t)


def main(bid):
    A = json.load(open(os.path.join(HERE, 'entries', bid + '-A.json'), encoding='utf-8'))
    B = json.load(open(os.path.join(HERE, 'entries', bid + '-B.json'), encoding='utf-8'))
    ka = [(norm_tag(w['tag']), w['unit'], w['w']) for w in A['words']]
    kb = [(norm_tag(w['tag']), w['unit'], w['w']) for w in B['words']]
    if ka != kb:
        sys.exit('A、B 词语不一致，先裁定再生成')

    has_words = {}
    for tag, unit, w in ka:
        has_words.setdefault((tag, unit), 0)
        has_words[(tag, unit)] += 1

    units, words = [], []
    for u in A['toc']:
        if not isinstance(u.get('unit'), int):
            continue
        n = u['unit']
        lessons = []
        for it in u['items']:
            if it.get('type') == 'lesson':
                lessons.append({'id': 'k%d' % it['no'], 'no': it['no'], 'name': it['title']})
            elif it.get('type') == 'garden' and has_words.get(('语文园地', n)):
                lessons.append({'id': 'g%d' % n, 'type': 'garden', 'name': '语文园地'})
        units.append({'id': 'u%d' % n, 'name': '第%s单元' % CN[n - 1], 'lessons': lessons})
    for tag, unit, w in ka:
        words.append({'k': 'g%d' % unit if tag == '语文园地' else 'k' + tag, 'w': w})

    # 每个词的课都要在目录里
    ids = {l['id'] for u in units for l in u['lessons']}
    missing = sorted({x['k'] for x in words} - ids)
    if missing:
        sys.exit('词语所属的课不在目录里：%s' % missing)

    out = os.path.join(ROOT, 'data', 'tingxie', bid + '.js')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('// %s 词语表：由 docs/tingxie/build.py 从双人录入的 docs/tingxie/entries/%s-A/B.json 生成，不要手改（核对记录见 docs/tingxie/%s-review.md）\n' % (bid, bid, bid))
        f.write('KT.add(%s, [\n' % json.dumps(bid))
        f.write(',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in words))
        f.write('\n]);\n')

    meta = dict(id=bid, **BOOKS[bid], checked=False, units=units)
    books_path = os.path.join(ROOT, 'data', 'tingxie', 'books.js')
    s = open(books_path, encoding='utf-8').read()
    entry = '  ' + json.dumps(meta, ensure_ascii=False) + ',\n'
    # 已有同 id 的行就替换，没有就加在数组末尾
    pat = re.compile(r'  \{"id": "%s".*\},\n' % bid)
    if pat.search(s):
        s = pat.sub(lambda m: entry, s)
    else:
        s = s.replace('KT.books = [\n', 'KT.books = [\n' + entry, 1)
    open(books_path, 'w', encoding='utf-8').write(s)
    print('%s：%d 个单元，%d 课/园地，%d 个词' % (bid, len(units), len(ids), len(words)))


if __name__ == '__main__':
    main(sys.argv[1])
