# -*- coding: utf-8 -*-
"""根据 signing/sync-node.json 生成两张二维码图片（deploy.ps1 调用；需要 pip 的 qrcode、pillow，本机已装）：
  sync-node-admin.png   管理码：审批 App「节点」页扫一次（里面有管理密钥，只放在 signing 目录，不要发给别人）
  sync-node-invite.png  初始邀请码：#1 第二期起平板扫它加入同步节点
用法：python make_codes.py <signing 目录>
"""
import json
import os
import sys

import qrcode
from PIL import Image, ImageDraw, ImageFont


def draw(text, title, sub, out):
    q = qrcode.QRCode(box_size=8, border=4, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(text)
    q.make(fit=True)
    img = q.make_image(fill_color='black', back_color='white').convert('RGB')
    w, h = img.size
    canvas = Image.new('RGB', (max(w, 560), h + 110), 'white')
    canvas.paste(img, ((canvas.width - w) // 2, 0))
    try:
        big, small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 26), ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 18)
    except OSError:
        big = small = ImageFont.load_default()
    d = ImageDraw.Draw(canvas)
    d.text(((canvas.width - d.textlength(title, font=big)) / 2, h + 10), title, fill='black', font=big)
    d.text(((canvas.width - d.textlength(sub, font=small)) / 2, h + 52), sub, fill='#555', font=small)
    canvas.save(out)


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    sign = sys.argv[1]
    with open(os.path.join(sign, 'sync-node.json'), encoding='utf-8') as f:
        info = json.load(f)
    draw(info['admin_qr'], f'同步节点管理码 · {info["kid"]}', '团队审批 App →「节点」→ 扫描管理码。内含管理密钥，勿外传',
         os.path.join(sign, 'sync-node-admin.png'))
    if info.get('invite_qr'):
        draw(info['invite_qr'], f'同步节点邀请码 · {info.get("invite_id", "")}', '知识图谱 App「设备同步」→ 添加同步节点，扫这张图',
             os.path.join(sign, 'sync-node-invite.png'))
    print('二维码已生成：' + sign)


if __name__ == '__main__':
    main()
