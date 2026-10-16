# -*- coding: utf-8 -*-
"""生成下载二维码：python qr.py <网址> <版本> <输出.png>（需要 pip install qrcode pillow）"""
import sys
import qrcode
from PIL import Image, ImageDraw, ImageFont

url, ver, out = sys.argv[1:4]
q = qrcode.QRCode(box_size=10, border=3)
q.add_data(url)
q.make(fit=True)
img = q.make_image(fill_color='black', back_color='white').convert('RGB')
w, h = img.size
canvas = Image.new('RGB', (w, h + 70), 'white')
canvas.paste(img, (0, 0))
try:
    font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 26)
except OSError:
    font = ImageFont.load_default()
d = ImageDraw.Draw(canvas)
text = f'团队审批 App {ver}'
d.text(((w - d.textlength(text, font=font)) / 2, h + 12), text, fill='black', font=font)
canvas.save(out)
