"""给电子教材目录标出「可点读」的书（平台详情 ti_items 里有 hot_zone 热区文件的）。

每次用 make-textbook-catalog.py 重新生成 hub/textbooks/catalog.js 之后跑一遍：
    python tools/mark-textbook-diandu.py
逐本查公开的详情接口（约 2000 本，12 个线程，一两分钟），在每行末尾加第 9 项：1 = 可点读，0 = 不能。
查失败的书按 0 处理，并打印出来（可以过一会儿再跑一遍）。App 打开书时还会再查一次，标错了也不影响点读本身。
"""
import concurrent.futures as cf
import json
import os
import sys
import urllib.request

OUT = os.path.join(os.path.dirname(__file__), '..', 'hub', 'textbooks', 'catalog.js')
DETAIL = 'https://s-file-1.ykt.cbern.com.cn/zxx/ndrv2/resources/tch_material/details/%s.json'


def has_zone(book_id):
    req = urllib.request.Request(DETAIL % book_id, headers={'User-Agent': 'Mozilla/5.0'})
    for _ in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.load(r)
            return any(t.get('ti_file_flag') == 'hot_zone' for t in d.get('ti_items') or [])
        except urllib.error.HTTPError as e:
            if e.code in (403, 404):
                return False      # 专题课等不在 tch_material 详情里（平台回 403）
        except Exception:
            pass
    return None


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    text = open(OUT, encoding='utf-8').read()
    head, body = text[:text.index('window.KM_TEXTBOOKS = ')], text[text.index('{'):text.rindex('}') + 1]
    data = json.loads(body)
    rows = data['rows']
    with cf.ThreadPoolExecutor(12) as ex:
        res = list(ex.map(lambda r: has_zone(r[0]), rows))
    for r, h in zip(rows, res):
        del r[8:]
        r.append(1 if h else 0)
    data['fields'] = data['fields'][:8] + ['diandu']
    head = head.replace('册, 专题课]', '册, 专题课, 可点读]')
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(head + 'window.KM_TEXTBOOKS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    D = data['dict']
    print('可点读', sum(1 for h in res if h), '/', len(rows))
    for r, h in zip(rows, res):
        if h is None:
            print('  查询失败：', r[0], r[1])
    subj = {}
    for r, h in zip(rows, res):
        if h:
            subj[D['subject'][r[3]]] = subj.get(D['subject'][r[3]], 0) + 1
    print(subj)


if __name__ == '__main__':
    main()
