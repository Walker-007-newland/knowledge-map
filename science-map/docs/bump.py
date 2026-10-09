# 更新内容后运行：python docs/bump.py
# 给页面里引用的本地 js/css 加上版本号（?v=时间戳），避免浏览器继续用缓存里的旧文件。
import re, time, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
v = time.strftime('%Y%m%d%H%M')
for page in ['physics.html', 'chemistry.html', 'index.html']:
    p = root / page
    s = p.read_text(encoding='utf-8')
    s = re.sub(r'((?:src|href)="(?:js|css|physics|chemistry)/[^"?]+\.(?:js|css))(?:\?v=\d+)?"', r'\1?v=' + v + '"', s)
    p.write_text(s, encoding='utf-8')
print('版本号已更新为', v)
