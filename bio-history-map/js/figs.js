// 示意图画图函数。数据文件在加载时调用，返回 SVG 字符串，直接拼进 html 里：
//   html: FIG.svg(300, 160, FIG.ground(20, 280, 130) + FIG.block(110, 90, 80, 40, '木块'), '图 1')
// 颜色全部走 CSS 变量（深色模式自动适配），不要在数据里写死颜色。
// 坐标单位就是 SVG 像素，y 轴向下。常用 class：
//   ink 普通线  thin 细线  dash 虚线(叠加)  ray 光线  force 力  hi 强调蓝  water 水  soft 浅灰填充
(function () {
  'use strict';
  const r1 = v => Math.round(v * 10) / 10;
  const P = pts => pts.map(p => r1(p[0]) + ',' + r1(p[1])).join(' ');
  const escT = s => String(s).replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/</g, '&lt;');

  // 箭头头部：在 (x2,y2) 处，方向从 (x1,y1) 指向 (x2,y2)
  function head(x1, y1, x2, y2, cls, size) {
    const s = size || 9;
    const a = Math.atan2(y2 - y1, x2 - x1);
    const p1 = [x2 - s * Math.cos(a - 0.4), y2 - s * Math.sin(a - 0.4)];
    const p2 = [x2 - s * Math.cos(a + 0.4), y2 - s * Math.sin(a + 0.4)];
    return `<polygon class="${cls}" points="${P([[x2, y2], p1, p2])}"/>`;
  }
  const headCls = { force: 'force-head', ray: 'ray-head', hi: 'hi-fill', ink: 'solid', thin: 'solid' };

  const FIG = {
    // 外框：w×h 画布，caption 可选
    svg(w, h, inner, caption) {
      return `<figure class="fig"><svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
    },

    /* ---------- 基础图形 ---------- */
    line(x1, y1, x2, y2, cls) { return `<line class="${cls || 'ink'}" x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"/>`; },
    poly(pts, cls) { return `<polyline class="${cls || 'ink'}" points="${P(pts)}"/>`; },
    polygon(pts, cls) { return `<polygon class="${cls || 'ink'}" points="${P(pts)}"/>`; },
    path(d, cls) { return `<path class="${cls || 'ink'}" d="${d}"/>`; },
    rect(x, y, w, h, cls, rx) { return `<rect class="${cls || 'ink'}" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"${rx ? ` rx="${rx}"` : ''}/>`; },
    circle(cx, cy, r, cls) { return `<circle class="${cls || 'ink'}" cx="${r1(cx)}" cy="${r1(cy)}" r="${r}"/>`; },
    dot(x, y, r) { return `<circle class="solid" cx="${r1(x)}" cy="${r1(y)}" r="${r || 3}"/>`; },
    // 文字。o.a: start|middle|end；o.cls: it(斜体物理量) red orange；o.size 字号
    text(x, y, s, o) {
      o = o || {};
      return `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${o.a || 'middle'}" dominant-baseline="middle"${o.cls ? ` class="${o.cls}"` : ''}${o.size ? ` style="font-size:${o.size}px"` : ''}>${escT(s)}</text>`;
    },

    /* ---------- 箭头、力、光线 ---------- */
    // 带箭头的线段。o.cls: ink|force|ray|hi；o.label 文字，标在箭头末端外侧（o.lx/o.ly 微调）
    arrow(x1, y1, x2, y2, o) {
      o = o || {};
      const cls = o.cls || 'ink';
      let s = FIG.line(x1, y1, x2, y2, cls + (o.dash ? ' dash' : '')) + head(x1, y1, x2, y2, headCls[cls] || 'solid', o.size);
      if (o.label) {
        const a = Math.atan2(y2 - y1, x2 - x1);
        s += FIG.text(x2 + 14 * Math.cos(a) + (o.lx || 0), y2 + 14 * Math.sin(a) + (o.ly || 0), o.label, { cls: o.lcls || 'it' });
      }
      return s;
    },
    // 力的示意图：作用点画实心点，o.label 如 'F' 'G=5N'
    force(x, y, x2, y2, label, o) {
      o = Object.assign({ cls: 'force', label, lcls: 'it red' }, o || {});
      return FIG.dot(x, y, 3.5) + FIG.arrow(x, y, x2, y2, o);
    },
    // 光线：折线，每一段中点画一个箭头；o.dash 画反向延长线/虚像光线
    ray(pts, o) {
      o = o || {};
      let s = FIG.poly(pts, 'ray' + (o.dash ? ' dash' : ''));
      if (!o.noArrow) for (let i = 1; i < pts.length; i++) {
        const [a, b] = [pts[i - 1], pts[i]];
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        s += head(mx - (b[0] - a[0]) / len, my - (b[1] - a[1]) / len, mx + 4 * (b[0] - a[0]) / len, my + 4 * (b[1] - a[1]) / len, 'ray-head', 9);
      }
      return s;
    },

    /* ---------- 光学 ---------- */
    // 平面镜：(x1,y1)-(x2,y2) 的粗线，side=1/-1 决定背面短斜线画在哪一侧
    mirror(x1, y1, x2, y2, side) {
      side = side || 1;
      const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len;
      const nx = -uy * side, ny = ux * side;   // 背面法向
      let s = `<line class="ink" style="stroke-width:3" x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}"/>`;
      for (let d = 6; d < len; d += 9) {
        const px = x1 + ux * d, py = y1 + uy * d;
        s += FIG.line(px, py, px + nx * 7 - ux * 5, py + ny * 7 - uy * 5, 'thin');
      }
      return s;
    },
    // 透镜符号：竖直放在 x 处，中心 cy，总高 h；kind: 'convex' 凸透镜（两端箭头向外）| 'concave' 凹透镜（向内）
    lens(x, cy, h, kind) {
      const t = cy - h / 2, b = cy + h / 2;
      let s = FIG.line(x, t, x, b, 'hi');
      const k = kind === 'concave' ? -1 : 1;
      [[t, -1], [b, 1]].forEach(([y, dir]) => {
        s += `<polyline class="hi" points="${P([[x - 7, y - dir * 8 * k], [x, y], [x + 7, y - dir * 8 * k]])}"/>`;
      });
      return s;
    },
    // 主光轴（水平虚线）
    axis(x1, x2, y) { return FIG.line(x1, y, x2, y, 'thin dash'); },
    // 焦点等标记点
    mark(x, y, label, dy) { return FIG.dot(x, y, 3) + (label ? FIG.text(x, y + (dy || 14), label, { cls: 'it', size: 14 }) : ''); },
    // 法线（虚线），过 (x,y)，方向角 deg（0=水平向右，90=竖直向下），总长 len
    normal(x, y, deg, len) {
      const a = deg * Math.PI / 180, dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2;
      return FIG.line(x - dx, y - dy, x + dx, y + dy, 'thin dash');
    },
    // 物体/像（竖直箭头）：底端 (x,yBase)，高 h（正数向上，负数表示倒立向下）；o.dash 虚像；o.label
    obj(x, yBase, h, o) {
      o = o || {};
      let s = FIG.arrow(x, yBase, x, yBase - h, { cls: o.cls || 'hi', dash: o.dash });
      if (o.label) s += FIG.text(x, yBase - h + (h > 0 ? -12 : 14), o.label, { size: 13 });
      return s;
    },
    // 量角弧：圆心 (cx,cy)，半径 r，从角 a1 到 a2（度，0=向右，90=向下），label 标在弧中间外侧
    angle(cx, cy, r, a1, a2, label) {
      const A1 = a1 * Math.PI / 180, A2 = a2 * Math.PI / 180;
      const large = Math.abs(a2 - a1) > 180 ? 1 : 0, sweep = a2 > a1 ? 1 : 0;
      let s = `<path class="thin" d="M${r1(cx + r * Math.cos(A1))},${r1(cy + r * Math.sin(A1))} A${r},${r} 0 ${large} ${sweep} ${r1(cx + r * Math.cos(A2))},${r1(cy + r * Math.sin(A2))}"/>`;
      if (label) { const m = (A1 + A2) / 2; s += FIG.text(cx + (r + 12) * Math.cos(m), cy + (r + 12) * Math.sin(m), label, { size: 13 }); }
      return s;
    },

    /* ---------- 力学 ---------- */
    // 地面/桌面：线 + 下方斜线
    ground(x1, x2, y) {
      let s = FIG.line(x1, y, x2, y, 'ink');
      for (let x = x1 + 4; x < x2; x += 10) s += FIG.line(x, y, x - 7, y + 7, 'thin');
      return s;
    },
    // 墙/天花板：竖直或水平线 + 斜线；side 表示斜线在哪侧（'left'|'right'|'up'|'down'）
    wall(x1, y1, x2, y2, side) {
      let s = FIG.line(x1, y1, x2, y2, 'ink');
      const vert = x1 === x2, len = vert ? Math.abs(y2 - y1) : Math.abs(x2 - x1);
      const sx = side === 'left' ? -7 : side === 'right' ? 7 : 0, sy = side === 'up' ? -7 : side === 'down' ? 7 : 0;
      for (let d = 4; d < len; d += 10) {
        const px = vert ? x1 : Math.min(x1, x2) + d, py = vert ? Math.min(y1, y2) + d : y1;
        s += FIG.line(px, py, px + sx + (vert ? 0 : -6), py + sy + (vert ? 6 : 0), 'thin');
      }
      return s;
    },
    // 方块（木块、物体），label 写在中间
    block(x, y, w, h, label) { return FIG.rect(x, y, w, h, 'soft', 2) + (label ? FIG.text(x + w / 2, y + h / 2, label, { size: 13 }) : ''); },
    // 容器（烧杯/水槽）：左上角 (x,y)，宽 w 高 h，水面在容器高度的 level 比例处（0~1）；o.spout 画杯嘴
    beaker(x, y, w, h, level, o) {
      o = o || {};
      let s = '';
      if (level > 0) {
        const wy = y + h * (1 - level);
        s += FIG.rect(x, wy, w, y + h - wy, 'water') + FIG.line(x, wy, x + w, wy, 'water-line');
      }
      s += FIG.poly([[x - (o.spout ? 6 : 0), y - (o.spout ? 4 : 0)], [x, y], [x, y + h], [x + w, y + h], [x + w, y]], 'ink');
      if (o.ticks) for (let i = 1; i < 5; i++) s += FIG.line(x, y + h * i / 5, x + 8, y + h * i / 5, 'thin');
      return s;
    },
    // 弹簧（竖直）：从 (x,y1) 到 (x,y2)，n 圈
    spring(x, y1, y2, n) {
      n = n || 8;
      const pts = [[x, y1], [x, y1 + 6]];
      const seg = (y2 - y1 - 12) / n;
      for (let i = 0; i < n; i++) pts.push([x + (i % 2 ? -7 : 7), y1 + 6 + seg * (i + 0.5)]);
      pts.push([x, y2 - 6], [x, y2]);
      return FIG.poly(pts, 'ink');
    },
    // 弹簧测力计（竖直）：挂钩在下端 (x, yHook)，读数 reading（文字，如 '3.0N'）
    scale(x, yTop, yHook, reading) {
      const h = yHook - yTop - 14;
      return FIG.rect(x - 12, yTop, 24, h, 'soft', 4) + FIG.line(x, yTop + h, x, yHook - 4, 'ink') +
        `<path class="ink" d="M${x},${yHook - 4} q0,6 -5,6"/>` + (reading ? FIG.text(x, yTop + h / 2, reading, { size: 11 }) : '');
    },
    // 定滑轮/动滑轮的轮子
    pulley(cx, cy, r) { return FIG.circle(cx, cy, r || 14, 'soft') + FIG.dot(cx, cy, 2.5); },

    /* ---------- 电路 ---------- */
    // 导线：折线
    wire(pts) { return FIG.poly(pts, 'ink'); },
    // 元件：中心 (x,y)，默认横放（占据 x-20 ~ x+20 的导线），o.v=true 竖放；o.label 标注（如 'L1' 'R'）
    // type: cell 一节电池 | battery 电池组 | lamp 灯 | R 定值电阻 | rheo 滑动变阻器 | A 电流表 | V 电压表 |
    //       switch 开关（o.on=true 闭合）| motor 电动机 | bell 电铃 | fuse 保险丝 | led 发光二极管
    comp(type, x, y, o) {
      o = o || {};
      const g = COMP[type];
      if (!g) return '';
      const rot = o.v ? ' rotate(90)' : '';
      let s = `<g transform="translate(${r1(x)},${r1(y)})${rot}"><rect class="mask" x="-20" y="-6" width="40" height="12"/>${g(o)}</g>`;
      // 电表、电动机里的字母不跟着元件旋转
      const letter = { A: 'A', V: 'V', motor: 'M' }[type];
      if (letter) s += `<text x="${r1(x)}" y="${r1(y + 1)}" text-anchor="middle" dominant-baseline="middle" style="font-size:13px;font-weight:700">${letter}</text>`;
      if (o.label) {
        const lx = o.v ? x + (o.lx != null ? o.lx : 24) : x + (o.lx || 0);
        const ly = o.v ? y + (o.ly || 0) : y + (o.ly != null ? o.ly : -22);
        s += FIG.text(lx, ly, o.label, { cls: 'it', size: 15, a: o.v ? 'start' : 'middle' });
      }
      return s;
    },
    // 导线连接点（实心点）
    node(x, y) { return FIG.dot(x, y, 3.5); },

    /* ---------- 化学仪器 ---------- */
    // 试管：管口中心 (x,y)，长 len，角度 deg（90=竖直向下，管口朝上），liquid 液体占管长比例
    testTube(x, y, len, deg, liquid) {
      const a = deg * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, r = 9;
      const L = (t, s) => [x + ux * t + nx * s, y + uy * t + ny * s];
      let s = '';
      if (liquid) {
        const t0 = len - len * liquid;
        s += `<path class="water" d="M${P([L(t0, -r)])} L${P([L(len - r, -r)])} A${r},${r} 0 0 0 ${P([L(len - r, r)])} L${P([L(t0, r)])} Z"/>`;
      }
      s += `<path class="ink" d="M${P([L(0, -r)])} L${P([L(len - r, -r)])} A${r},${r} 0 0 0 ${P([L(len - r, r)])} L${P([L(0, r)])}"/>`;
      return s;
    },
    // 酒精灯：灯芯顶端 (x,y)，o.fire 画火焰
    lamp(x, y, o) {
      o = o || {};
      let s = `<path class="soft" d="M${x - 22},${y + 40} Q${x - 26},${y + 16} ${x - 8},${y + 12} L${x + 8},${y + 12} Q${x + 26},${y + 16} ${x + 22},${y + 40} Z"/>` +
        FIG.rect(x - 5, y + 4, 10, 8, 'ink') + FIG.line(x, y, x, y + 4, 'ink');
      if (o.fire) s += `<path class="ray" style="fill:var(--fig-water)" d="M${x},${y - 22} Q${x + 8},${y - 8} ${x},${y} Q${x - 8},${y - 8} ${x},${y - 22} Z"/>`;
      return s;
    },
    // 集气瓶：瓶口中心 (x,y)，宽 w 高 h；o.glass 盖玻璃片；o.gas 文字
    jar(x, y, w, h, o) {
      o = o || {};
      w = w || 50; h = h || 80;
      const n = w * 0.32;
      let s = `<path class="ink" d="M${x - n},${y} L${x - n},${y + 8} Q${x - w / 2},${y + 12} ${x - w / 2},${y + 24} L${x - w / 2},${y + h} L${x + w / 2},${y + h} L${x + w / 2},${y + 24} Q${x + w / 2},${y + 12} ${x + n},${y + 8} L${x + n},${y}"/>`;
      if (o.glass) s += FIG.line(x - n - 8, y - 2, x + n + 8, y - 2, 'hi');
      if (o.water) s += FIG.rect(x - w / 2, y + h * (1 - o.water), w, h * o.water, 'water');
      if (o.gas) s += FIG.text(x, y + h / 2 + 10, o.gas, { size: 13 });
      return s;
    }
  };

  // 元件图形（横放，中心在原点，左右两端 ±20 接导线）
  const COMP = {
    cell: () => FIG.line(-20, 0, -4, 0) + FIG.line(4, 0, 20, 0) + FIG.line(-4, -14, -4, 14) + `<line class="ink" style="stroke-width:4" x1="4" y1="-7" x2="4" y2="7"/>`,
    battery: () => FIG.line(-20, 0, -12, 0) + FIG.line(12, 0, 20, 0) +
      FIG.line(-12, -14, -12, 14) + `<line class="ink" style="stroke-width:4" x1="-5" y1="-7" x2="-5" y2="7"/>` +
      FIG.line(5, -14, 5, 14) + `<line class="ink" style="stroke-width:4" x1="12" y1="-7" x2="12" y2="7"/>` + FIG.line(-5, 0, 5, 0, 'thin dash'),
    lamp: () => FIG.line(-20, 0, -10, 0) + FIG.line(10, 0, 20, 0) + FIG.circle(0, 0, 10, 'ink') + FIG.line(-7, -7, 7, 7) + FIG.line(-7, 7, 7, -7),
    R: () => FIG.line(-20, 0, -14, 0) + FIG.line(14, 0, 20, 0) + FIG.rect(-14, -6, 28, 12, 'ink'),
    rheo: o => FIG.line(-20, 0, -14, 0) + FIG.line(14, 0, 20, 0) + FIG.rect(-14, -6, 28, 12, 'ink') +
      FIG.arrow(o.p != null ? o.p : 0, -20, o.p != null ? o.p : 0, -7, { size: 7 }),
    A: () => FIG.line(-20, 0, -11, 0) + FIG.line(11, 0, 20, 0) + FIG.circle(0, 0, 11, 'ink'),
    V: () => FIG.line(-20, 0, -11, 0) + FIG.line(11, 0, 20, 0) + FIG.circle(0, 0, 11, 'ink'),
    motor: () => FIG.line(-20, 0, -11, 0) + FIG.line(11, 0, 20, 0) + FIG.circle(0, 0, 11, 'ink'),
    switch: o => FIG.line(-20, 0, -12, 0) + FIG.line(12, 0, 20, 0) + FIG.dot(-12, 0, 2.5) + FIG.dot(12, 0, 2.5) +
      (o.on ? FIG.line(-12, 0, 12, -2) : FIG.line(-12, 0, 10, -13)),
    bell: () => FIG.line(-20, 0, -8, 0) + FIG.line(8, 0, 20, 0) + `<path class="ink" d="M-12,0 A12,12 0 0 1 12,0 Z"/>` + FIG.line(-8, 0, -8, 4) + FIG.line(8, 0, 8, 4),
    fuse: () => FIG.line(-20, 0, 20, 0) + FIG.rect(-12, -5, 24, 10, 'ink'),
    led: () => FIG.line(-20, 0, -7, 0) + FIG.line(7, 0, 20, 0) + FIG.polygon([[-7, -8], [-7, 8], [7, 0]], 'ink') + FIG.line(7, -8, 7, 8) +
      FIG.arrow(2, -10, 10, -18, { size: 5 }) + FIG.arrow(8, -8, 16, -16, { size: 5 })
  };

  window.FIG = FIG;
})();
