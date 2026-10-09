// 物理样板知识点（八年级上）：速度、平面镜成像、密度及其测量
(function () {
  'use strict';
  const F = window.FIG, SIMS = window.SIMS;

  /* ================= 本文件用到的画图小工具 ================= */

  // 水平尺寸标注：x1~x2，两端箭头；o.below 文字在线下方；o.cls 文字样式
  function dimH(x1, x2, y, label, o) {
    o = o || {};
    const m = (x1 + x2) / 2;
    return F.arrow(m, y, x1, y, { cls: 'thin', size: 6 }) + F.arrow(m, y, x2, y, { cls: 'thin', size: 6 }) +
      F.text(m, y + (o.below ? 13 : -11), label, { size: o.size || 13, cls: o.cls });
  }
  // 直角符号：镜面竖直（在 x 处）、连线水平时，画在交点左上方
  function rightV(x, y) { return F.poly([[x - 8, y], [x - 8, y - 8], [x, y - 8]], 'thin'); }
  // 直角符号：镜面水平（在 y 处）、连线竖直时，画在交点右上方
  function rightH(x, y) { return F.poly([[x + 8, y], [x + 8, y - 8], [x, y - 8]], 'thin'); }
  // 蜡烛：底部中心 (x,yBase)，烛身高 h；o.lit 点燃；o.ghost 用虚线画火焰（表示 A 的像与 B 重合）
  function candle(x, yBase, h, o) {
    o = o || {};
    const fy = yBase - h - 5;
    let s = F.rect(x - 6, yBase - h, 12, h, 'soft', 1) + F.line(x, yBase - h, x, fy, 'ink');
    if (o.lit || o.ghost) s += `<path class="ray${o.ghost ? ' dash' : ''}" d="M${x},${fy - 18} Q${x + 7},${fy - 6} ${x},${fy} Q${x - 7},${fy - 6} ${x},${fy - 18} Z"/>`;
    return s;
  }
  // 眼睛（朝右看）
  function eye(x, y) { return `<path class="ink" d="M${x - 12},${y} Q${x},${y - 9} ${x + 12},${y} Q${x},${y + 9} ${x - 12},${y} Z"/>` + F.circle(x + 3, y, 3, 'solid'); }
  // 量筒：刻度部分左上角 (x,y)、宽 w、高 h 对应 0~vmax mL；水面在 v mL；o.stone 画用细线拴着、浸没在水中的石块；o.tag 水面旁的文字；o.minor/o.num 刻度间隔
  function cyl(x, y, w, h, vmax, v, o) {
    o = o || {};
    const yv = val => y + h - val / vmax * h;
    let s = '';
    if (v > 0) s += F.rect(x, yv(v), w, y + h - yv(v), 'water') + F.line(x, yv(v), x + w, yv(v), 'water-line');
    if (o.stone) {
      const c = x + w / 2, b = y + h;
      s += F.line(c, y - 16, c, b - 22, 'thin') +
        F.polygon([[c - 11, b - 3], [c - 14, b - 14], [c - 4, b - 22], [c + 9, b - 19], [c + 13, b - 8], [c + 5, b - 2]], 'soft');
    }
    s += F.poly([[x, y - 10], [x, y + h], [x + w, y + h], [x + w, y - 10]], 'ink') + F.rect(x - 10, y + h, w + 20, 6, 'soft', 2);
    const minor = o.minor || 5, num = o.num || 20;   // 小刻度间隔、标数字的间隔（mL）
    for (let k = minor; k <= vmax; k += minor) {
      const yy = yv(k);
      s += F.line(x, yy, x + (k % 10 === 0 ? 11 : 6), yy, 'thin');
      if (k % num === 0) s += F.text(x - 6, yy, k, { a: 'end', size: 10 });
    }
    s += F.text(x + w + 6, y - 6, 'mL', { a: 'start', size: 11 });
    if (o.tag) s += F.text(x + w + 8, yv(v), o.tag, { a: 'start', size: 13, cls: 'it' });
    return s;
  }
  // 天平横梁标尺（0~5 g，分度值 0.2 g）和游码，val 是游码左边缘对准的刻度
  function rider(val) {
    const x0 = 44, k = 56, y = 45;
    let s = F.rect(x0 - 14, y, 5 * k + 28, 22, 'soft', 3);
    for (let i = 0; i <= 25; i++) s += F.line(x0 + i * k / 5, y, x0 + i * k / 5, y + (i % 5 ? 6 : 11), 'thin');
    for (let g = 0; g <= 5; g++) s += F.text(x0 + g * k, y - 11, g, { size: 12 });
    s += F.text(x0 + 5 * k + 24, y - 11, 'g', { size: 12 });
    const xr = x0 + val * k;
    s += F.rect(xr, y - 3, 9, 28, 'hi', 2) + F.arrow(xr + 40, y + 46, xr + 3, y + 28, { cls: 'thin', size: 6 }) + F.text(xr + 46, y + 48, '游码', { a: 'start', size: 12 });
    return F.svg(380, 115, s, '图乙 横梁标尺上游码的位置');
  }

  /* ---------- 速度用图 ---------- */
  // 测平均速度：斜面上的小车
  function slopeFig() {
    const P0 = [40, 70], P1 = [360, 170];
    const L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
    const u = [(P1[0] - P0[0]) / L, (P1[1] - P0[1]) / L], n = [u[1], -u[0]];     // n：垂直斜面向外
    const at = (d, off) => [P0[0] + u[0] * d + n[0] * off, P0[1] + u[1] * d + n[1] * off];
    const dA = 60, dB = 180, dC = 300;
    let s = F.ground(20, 390, 170) + F.polygon([[40, 170], P1, P0], 'soft');
    s += F.polygon([at(20, 1), at(dA, 1), at(dA, 15), at(20, 15)], 'hi') + F.circle(at(28, 4)[0], at(28, 4)[1], 3, 'solid') + F.circle(at(52, 4)[0], at(52, 4)[1], 3, 'solid');
    s += `<line class="ink" style="stroke-width:4" x1="${at(dC, 0)[0].toFixed(1)}" y1="${at(dC, 0)[1].toFixed(1)}" x2="${at(dC, 22)[0].toFixed(1)}" y2="${at(dC, 22)[1].toFixed(1)}"/>`;
    [[dA, 'A'], [dB, 'B'], [dC, 'C']].forEach(([d, t]) => {
      const p = at(d, -14);
      s += F.text(p[0], p[1], t, { cls: 'it' }) + F.line(at(d, 0)[0], at(d, 0)[1], at(d, d === dB ? 32 : 62)[0], at(d, d === dB ? 32 : 62)[1], 'thin');
    });
    const dimS = (d1, d2, off, lab) => {
      const m = at((d1 + d2) / 2, off), a = at(d1, off), b = at(d2, off), t = at((d1 + d2) / 2, off + 12);
      return F.arrow(m[0], m[1], a[0], a[1], { cls: 'thin', size: 6 }) + F.arrow(m[0], m[1], b[0], b[1], { cls: 'thin', size: 6 }) + F.text(t[0], t[1], lab, { cls: 'it' });
    };
    s += dimS(dA, dB, 28, 's₂') + dimS(dA, dC, 58, 's₁');
    s += F.text(at(dC, 30)[0] + 26, at(dC, 30)[1], '金属片', { size: 12 });
    return F.svg(400, 200, s, '图 1 测量小车沿斜面下滑的平均速度');
  }
  // s-t 图像与 v-t 图像对比
  function stvtFig() {
    const a = { x: 50, y: 40, w: 180, h: 120, xmax: 6, ymax: 30, xticks: [2, 4, 6], yticks: [10, 20, 30], xlabel: 't/s', ylabel: 's/m' };
    let s = SIMS.axes(a);
    s += F.line(a.px(0), a.py(0), a.px(6), a.py(30), 'hi') + F.text(a.px(6) + 8, a.py(30), '甲', { a: 'start' }) +
      F.line(a.px(0), a.py(0), a.px(6), a.py(12), 'ray') + F.text(a.px(6) + 8, a.py(12), '乙', { a: 'start' }) +
      F.line(a.px(0), a.py(20), a.px(6), a.py(20), 'ink') + F.text(a.px(6) + 8, a.py(20), '丙（静止）', { a: 'start', size: 13 });
    const b = { x: 350, y: 40, w: 150, h: 120, xmax: 6, ymax: 6, xticks: [2, 4, 6], yticks: [2, 4, 6], xlabel: 't/s', ylabel: 'v/(m·s⁻¹)' };
    s += SIMS.axes(b);
    s += F.line(b.px(0), b.py(5), b.px(6), b.py(5), 'hi') + F.text(b.px(6) + 8, b.py(5), '甲', { a: 'start' }) +
      F.line(b.px(0), b.py(2), b.px(6), b.py(2), 'ray') + F.text(b.px(6) + 8, b.py(2), '乙', { a: 'start' });
    return F.svg(560, 200, s, '图 2 左：s-t 图像　右：v-t 图像（甲 5 m/s，乙 2 m/s）');
  }
  // 例题：甲、乙两车的 s-t 图像
  function stExFig() {
    const a = { x: 50, y: 40, w: 240, h: 150, xmax: 6, ymax: 30, xticks: [1, 2, 3, 4, 5, 6], yticks: [10, 20, 30], xlabel: 't/s', ylabel: 's/m' };
    let s = SIMS.axes(a);
    s += F.line(a.px(4), a.py(0), a.px(4), a.py(20), 'thin dash') + F.line(a.px(0), a.py(20), a.px(4), a.py(20), 'thin dash') +
      F.line(a.px(5), a.py(0), a.px(5), a.py(10), 'thin dash') + F.line(a.px(0), a.py(10), a.px(5), a.py(10), 'thin dash');
    s += F.line(a.px(0), a.py(0), a.px(6), a.py(30), 'hi') + F.text(a.px(6) + 10, a.py(30), '甲', { a: 'start' }) +
      F.line(a.px(0), a.py(0), a.px(6), a.py(12), 'ray') + F.text(a.px(6) + 10, a.py(12), '乙', { a: 'start' });
    return F.svg(340, 225, s);
  }
  // 测试题选项里的小图像。kind: st-line | st-flat | vt-line | st-curve
  function miniGraph(kind) {
    const o = { x: 30, y: 48, w: 70, h: 45, xmax: 1, ymax: 1, xlabel: 't', ylabel: kind[0] };
    let s = SIMS.axes(o);
    if (kind === 'st-line' || kind === 'vt-line') s += F.line(o.px(0), o.py(0), o.px(0.9), o.py(0.85), 'hi');
    if (kind === 'st-flat') s += F.line(o.px(0), o.py(0.6), o.px(0.9), o.py(0.6), 'hi');
    if (kind === 'st-curve') s += F.path(`M${o.px(0)},${o.py(0)} Q${o.px(0.6)},${o.py(0)} ${o.px(0.9)},${o.py(0.85)}`, 'hi');
    return F.svg(140, 125, s);
  }
  // 练习：根据表格画 s-t 图像（withLine=true 时画出参考答案）
  function practiceGrid(withLine) {
    const a = { x: 60, y: 40, w: 250, h: 150, xmax: 5, ymax: 7.5, xticks: [1, 2, 3, 4, 5], yticks: [1.5, 3, 4.5, 6, 7.5], xlabel: 't/s', ylabel: 's/m' };
    let s = '';
    a.xticks.forEach(t => { s += F.line(a.x + t / 5 * a.w, a.y, a.x + t / 5 * a.w, a.y + a.h, 'thin dash'); });
    a.yticks.forEach(v => { s += F.line(a.x, a.y + a.h - v / 7.5 * a.h, a.x + a.w, a.y + a.h - v / 7.5 * a.h, 'thin dash'); });
    s += SIMS.axes(a);
    if (withLine) {
      s += F.line(a.px(0), a.py(0), a.px(5), a.py(7.5), 'hi');
      [0, 1, 2, 3, 4].forEach(t => { s += F.dot(a.px(t), a.py(1.5 * t), 4); });
    }
    return F.svg(360, 225, s, withLine ? '参考答案：各点在一条过原点的直线上' : '');
  }

  /* ---------- 平面镜用图 ---------- */
  function mirrorFeatureFig() {
    let s = F.line(60, 170, 360, 170, 'thin') + F.mirror(210, 30, 210, 175, -1);
    s += F.obj(110, 170, 90) + F.obj(310, 170, 90, { dash: true }) + F.line(110, 80, 310, 80, 'thin dash') + rightV(210, 80);
    s += F.text(96, 80, 'A', { cls: 'it' }) + F.text(96, 170, 'B', { cls: 'it' }) + F.text(326, 80, 'A′', { cls: 'it' }) + F.text(326, 170, 'B′', { cls: 'it' });
    s += F.line(110, 172, 110, 198, 'thin') + F.line(210, 175, 210, 198, 'thin') + F.line(310, 172, 310, 198, 'thin') +
      dimH(110, 210, 192, 'u', { below: true, cls: 'it' }) + dimH(210, 310, 192, 'v', { below: true, cls: 'it' });
    return F.svg(420, 235, s, '图 1 物体 AB 和它的像 A′B′ 关于镜面对称（u 物距，v 像距）');
  }
  function mirrorPrincipleFig() {
    let s = F.mirror(220, 30, 220, 200, -1) + F.normal(220, 60, 0, 50) + F.normal(220, 150, 0, 50);
    s += F.ray([[100, 90], [220, 60], [124, 36]]) + F.ray([[100, 90], [220, 150], [124, 198]]);
    s += F.line(220, 60, 340, 90, 'thin dash') + F.line(220, 150, 340, 90, 'thin dash');
    s += F.dot(100, 90, 4) + F.text(84, 90, 'S', { cls: 'it' }) + F.dot(340, 90, 3) + F.text(356, 90, 'S′', { cls: 'it' }) +
      F.text(300, 60, '反向延长线', { size: 12 });
    return F.svg(420, 225, s, '图 2 反射光线的反向延长线交于 S′，S′ 就是 S 的像');
  }
  function mirrorExpFig() {
    let s = F.line(20, 170, 400, 170, 'ink') + F.rect(207, 60, 6, 110, 'soft');
    s += candle(110, 170, 50, { lit: true }) + candle(310, 170, 50, { ghost: true });
    s += eye(40, 105) + F.text(210, 45, '薄玻璃板（竖直放置）', { size: 13 }) +
      F.text(110, 192, '蜡烛 A（点燃）', { size: 13 }) + F.text(310, 192, '蜡烛 B（不点燃）', { size: 13 });
    return F.svg(420, 220, s, '图 3 从 A 这一侧透过玻璃板看，B 好像也被“点燃”了（虚线火焰是 A 的像）');
  }
  function mirrorSymFig() {
    let s = F.mirror(190, 40, 190, 185, -1) + F.text(176, 40, 'M', { cls: 'it' }) + F.text(176, 185, 'N', { cls: 'it' });
    s += F.arrow(120, 160, 80, 70, { cls: 'hi' }) + F.arrow(260, 160, 300, 70, { cls: 'hi', dash: true });
    s += F.line(80, 70, 300, 70, 'thin dash') + F.line(120, 160, 260, 160, 'thin dash') + rightV(190, 70) + rightV(190, 160);
    s += F.text(68, 62, 'A', { cls: 'it' }) + F.text(116, 176, 'B', { cls: 'it' }) + F.text(316, 62, 'A′', { cls: 'it' }) + F.text(266, 176, 'B′', { cls: 'it' });
    return F.svg(380, 210, s, '图 4 对称法：分别作 A、B 的对称点，再用虚线连成像');
  }
  function mirrorRayFig() {
    let s = F.mirror(40, 150, 340, 150, 1) + F.line(190, 150, 190, 92, 'thin dash');
    s += F.line(100, 60, 100, 240, 'thin dash') + rightH(100, 150) + F.line(190, 150, 100, 240, 'thin dash');
    s += F.ray([[100, 60], [190, 150], [290, 50]]);
    s += F.dot(100, 60, 4) + F.text(84, 56, 'S', { cls: 'it' }) + F.dot(100, 240, 3) + F.text(118, 244, 'S′', { cls: 'it' }) +
      F.dot(290, 50, 3) + F.text(306, 50, 'P', { cls: 'it' }) + F.text(204, 172, 'O', { cls: 'it' });
    return F.svg(380, 270, s, '图 5 先找像点 S′，连 S′P 交镜面于 O，再画 SO、OP');
  }
  // 视力表（例题）
  function eyeChartFig() {
    let s = F.ground(40, 400, 150) + F.mirror(380, 55, 380, 150, -1) + F.text(380, 40, '平面镜', { size: 13 });
    s += F.rect(74, 70, 12, 60, 'soft') + F.line(80, 130, 80, 150, 'ink') + F.text(66, 100, '视力表', { a: 'end', size: 13 });
    s += F.circle(128, 85, 8, 'ink') + F.line(128, 93, 128, 125, 'ink') + F.line(128, 125, 121, 150, 'ink') + F.line(128, 125, 135, 150, 'ink');
    s += F.line(80, 70, 80, 34, 'thin') + F.line(128, 77, 128, 34, 'thin') + dimH(80, 128, 40, '0.4 m');
    s += F.line(80, 150, 80, 174, 'thin') + F.line(380, 150, 380, 174, 'thin') + dimH(80, 380, 168, '2.5 m', { below: true });
    return F.svg(440, 200, s, '视力表在人的身后，人看镜中视力表的像');
  }
  // 测试题选项：k=0 正确；1 像画成实线；2 像距大于物距；3 像倒立
  function mirrorOpt(k) {
    let s = F.mirror(85, 25, 85, 95, -1) + F.obj(45, 90, 50);
    if (k === 0) s += F.obj(125, 90, 50, { dash: true });
    if (k === 1) s += F.obj(125, 90, 50);
    if (k === 2) s += F.obj(150, 90, 50, { dash: true });
    if (k === 3) s += F.obj(125, 40, -50, { dash: true });
    return F.svg(175, 110, s);
  }
  // 练习 1：画 AB 的像
  function practiceAB(ans) {
    let s = F.mirror(200, 35, 200, 185, -1) + F.text(186, 35, 'M', { cls: 'it' }) + F.text(186, 185, 'N', { cls: 'it' });
    s += F.arrow(140, 150, 90, 60, { cls: 'hi' }) + F.text(78, 54, 'A', { cls: 'it' }) + F.text(140, 166, 'B', { cls: 'it' });
    if (ans) {
      s += F.line(90, 60, 310, 60, 'thin dash') + F.line(140, 150, 260, 150, 'thin dash') + rightV(200, 60) + rightV(200, 150) +
        F.arrow(260, 150, 310, 60, { cls: 'hi', dash: true }) + F.text(324, 54, 'A′', { cls: 'it' }) + F.text(262, 166, 'B′', { cls: 'it' });
    }
    return F.svg(400, 210, s);
  }
  // 练习 2：S 发出的光经镜面反射后过 P
  function practiceSP(ans) {
    const Ox = 80 + 220 * (70 / 170);   // S′(80,210) 与 P(300,40) 的连线和镜面 y=140 的交点
    let s = F.mirror(30, 140, 350, 140, 1);
    s += F.dot(80, 70, 4) + F.text(64, 66, 'S', { cls: 'it' }) + F.dot(300, 40, 3) + F.text(316, 40, 'P', { cls: 'it' });
    if (ans) {
      s += F.line(80, 70, 80, 210, 'thin dash') + rightH(80, 140) + F.dot(80, 210, 3) + F.text(98, 214, 'S′', { cls: 'it' }) +
        F.line(80, 210, Ox, 140, 'thin dash') + F.ray([[80, 70], [Ox, 140], [300, 40]]) + F.text(Ox + 6, 156, 'O', { cls: 'it' });
    }
    return F.svg(380, ans ? 250 : 170, s);
  }

  /* ---------- 密度用图 ---------- */
  function cylStepsFig() {
    const s = cyl(60, 40, 40, 160, 100, 50, { tag: 'V₁' }) + cyl(240, 40, 40, 160, 100, 70, { stone: true, tag: 'V₂' }) +
      F.text(80, 228, '① 倒入适量的水，读出 V₁', { size: 13 }) + F.text(260, 228, '② 用细线拴住石块浸没，读出 V₂', { size: 13 });
    return F.svg(380, 250, s, '石块的体积 V = V₂ − V₁（排水法）');
  }
  function cylExFig() {
    const s = cyl(60, 40, 40, 160, 50, 20, { minor: 2, num: 10 }) + cyl(190, 40, 40, 160, 50, 44, { stone: true, minor: 2, num: 10 }) +
      F.text(80, 228, '放石块前', { size: 13 }) + F.text(210, 228, '放石块后', { size: 13 });
    return F.svg(300, 250, s, '图丙 量筒读数');
  }
  function mvTestFig() {
    const a = { x: 50, y: 40, w: 200, h: 150, xmax: 40, ymax: 40, xticks: [10, 20, 30, 40], yticks: [10, 20, 30, 40], ylabel: 'm/g' };
    let s = SIMS.axes(a) + F.text(a.x + a.w + 20, a.y + a.h + 14, 'V/cm³', { cls: 'it', size: 14, a: 'start' });
    s += F.line(a.px(20), a.py(0), a.px(20), a.py(40), 'thin dash') + F.line(a.px(0), a.py(40), a.px(20), a.py(40), 'thin dash') +
      F.line(a.px(40), a.py(0), a.px(40), a.py(20), 'thin dash') + F.line(a.px(0), a.py(20), a.px(40), a.py(20), 'thin dash');
    s += F.line(a.px(0), a.py(0), a.px(20), a.py(40), 'hi') + F.text(a.px(20) + 10, a.py(40), '甲', { a: 'start' }) +
      F.line(a.px(0), a.py(0), a.px(40), a.py(20), 'ray') + F.text(a.px(40) + 6, a.py(20) - 12, '乙', { a: 'start' });
    return F.svg(340, 225, s);
  }

  /* ================= 知识点 ================= */

  KG.nodes.push(

    /* ---------------- 速度 ---------------- */
    {
      id: 'p-speed',
      title: '速度',
      short: '速度',
      module: 'motion',
      term: '8a',
      chapter: '第一章 机械运动',
      freq: 3,
      keywords: '速度 平均速度 匀速直线运动 s-t图像 v-t图像 km/h m/s 单位换算 测量平均速度',
      prereqs: ['p-length-time', 'p-motion-reference'],
      tip: '速度计算年年考：先统一单位（1 m/s = 3.6 km/h）；平均速度一定是“总路程 ÷ 总时间”，不能把几段速度直接相加除以段数；图像题先看纵轴是 s 还是 v。',
      learn: [
        {
          h: '怎样比较快慢：速度',
          html: `<p>比较谁跑得快，平时有两种办法：</p>
<ul><li><b>相同时间比路程</b>：比赛进行中，观众看谁跑在前面，谁就快；</li>
<li><b>相同路程比时间</b>：百米赛跑的裁判看谁先到终点（用时短），谁就快。</li></ul>
<p>如果路程和时间都不一样呢？那就把路程除以时间，算出“每秒走多远”，再比较。这个比值就是<b>速度</b>：</p>
<div class="formula"><span class="v">v</span> = <span class="v">s</span> / <span class="v">t</span><span class="zh">（速度 = 路程 ÷ 时间）</span></div>
<p>它可以变形成 <span class="v">s</span> = <span class="v">v</span><span class="v">t</span>（求路程）、<span class="v">t</span> = <span class="v">s</span> / <span class="v">v</span>（求时间）。</p>
<div class="key">速度是表示物体运动快慢的物理量。国际单位是 m/s，常用单位还有 km/h。“5 m/s”的意思是：物体在 1 s 内通过的路程是 5 m。</div>`
        },
        {
          h: '单位换算：1 m/s = 3.6 km/h',
          html: `<p>为什么是 3.6？把 1 m/s 里的“米”和“秒”分别换成“千米”和“小时”就知道了：</p>
<div class="formula">1 m/s = <sup>1</sup>/<sub>1000</sub> km ÷ <sup>1</sup>/<sub>3600</sub> h = 3600/1000 km/h = 3.6 km/h</div>
<div class="key">m/s → km/h：乘 3.6；　km/h → m/s：除以 3.6。<br>记法：km/h 的数字总是更大（3.6 倍）。</div>
<div class="steps"><p>例：72 km/h = 72 ÷ 3.6 m/s = <b>20 m/s</b></p><p>例：15 m/s = 15 × 3.6 km/h = <b>54 km/h</b></p></div>
<p>记住几个常见速度，估测题就不会出错：</p>
<table class="tbl"><tr><th>物体</th><th>速度（约）</th></tr>
<tr><td>人正常步行</td><td>1.1 m/s（约 4 km/h）</td></tr>
<tr><td>骑自行车</td><td>5 m/s（约 18 km/h）</td></tr>
<tr><td>声音在 15 ℃ 空气中</td><td>340 m/s</td></tr>
<tr><td>高铁（复兴号）</td><td>最高约 350 km/h（约 97 m/s）</td></tr>
<tr><td>光在真空中</td><td>3×10<sup>8</sup> m/s</td></tr></table>
<p class="warn">计算前先统一单位：路程用 m、时间用 s，算出来就是 m/s；路程用 km、时间用 h，算出来就是 km/h。千万不要 km 和 s 混着用。</p>`
        },
        {
          h: '匀速直线运动与平均速度',
          html: `<p><b>匀速直线运动</b>：物体沿直线运动，速度大小不变。这时 <span class="v">v</span> 是一个定值，<b>和路程、时间无关</b>——不能说“速度与路程成正比”。</p>
<p>生活中大多数运动快慢是变化的（变速运动），我们用<b>平均速度</b>粗略描述它在某段路程（或某段时间）内的快慢：</p>
<div class="formula"><span class="v">v</span><sub>平均</sub> = <span class="v">s</span><sub>总</sub> / <span class="v">t</span><sub>总</sub><span class="zh">（总路程 ÷ 总时间，停下来休息的时间也要算进去）</span></div>
<div class="steps"><p>已知：汽车先以 20 m/s 行驶 100 s，再以 10 m/s 行驶 300 s。</p>
<p>求：全程的平均速度。</p>
<p>解：<span class="v">s</span><sub>1</sub> = <span class="v">v</span><sub>1</sub><span class="v">t</span><sub>1</sub> = 20 m/s × 100 s = 2000 m；<span class="v">s</span><sub>2</sub> = <span class="v">v</span><sub>2</sub><span class="v">t</span><sub>2</sub> = 10 m/s × 300 s = 3000 m</p>
<p><span class="v">v</span> = (<span class="v">s</span><sub>1</sub> + <span class="v">s</span><sub>2</sub>) / (<span class="v">t</span><sub>1</sub> + <span class="v">t</span><sub>2</sub>) = 5000 m / 400 s = 12.5 m/s</p>
<p>答：全程平均速度为 12.5 m/s。</p></div>
<p class="warn">(20 + 10) ÷ 2 = 15 m/s 是错的！两段用的时间不一样，不能直接求速度的平均数。</p>
<p><b>测量平均速度</b>（课本实验）：原理是 <span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span>，用<b>刻度尺</b>测路程、<b>停表</b>测时间。</p>
${slopeFig()}
<ul><li>斜面坡度要<b>小一些</b>：小车下滑慢，时间长，便于测准时间；</li>
<li>终点放金属片：小车撞到金属片会发出声音，便于确定终点、准确计时；</li>
<li>小车从 A 运动到 C 越来越快，所以下半段（B→C）的平均速度大于上半段（A→B）；</li>
<li>如果小车过了终点才停止计时，测得时间偏大，算出的平均速度<b>偏小</b>。</li></ul>`
        },
        {
          h: '运动图像：s-t 图和 v-t 图',
          html: `<p>用图像描述运动，中考选择题几乎每年都有。先看清<b>纵轴是什么</b>：</p>
${stvtFig()}
<table class="tbl"><tr><th>图像</th><th>匀速直线运动</th><th>静止</th></tr>
<tr><td>s-t 图</td><td>过原点的倾斜直线；<b>越陡速度越大</b>，速度 = 路程 ÷ 时间（从图上任取一点读数计算）</td><td>平行于时间轴的直线（路程不变）</td></tr>
<tr><td>v-t 图</td><td>平行于时间轴的直线（速度不变）</td><td>与时间轴重合（v = 0）</td></tr></table>
<p class="warn">别把两种图搞混：s-t 图里的水平线表示“静止”，v-t 图里的水平线却表示“匀速”。</p>
<p>动手试一试：让两辆车同时出发，看它们的 s-t 图线怎样变化。</p>
<div class="sim" data-sim="speed"></div>`
        }
      ],
      examples: [
        {
          type: 'num',
          q: '某次动车从福州开往厦门，行驶路程约 270 km，用时 1.5 h。这次动车全程的平均速度是多少 m/s？',
          answer: 50, unit: 'm/s',
          explain: `<div class="steps"><p>已知：<span class="v">s</span> = 270 km，<span class="v">t</span> = 1.5 h</p><p>求：平均速度 <span class="v">v</span></p>
<p>解：<span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> = 270 km / 1.5 h = 180 km/h = 180 ÷ 3.6 m/s = 50 m/s</p><p>答：平均速度是 50 m/s。</p></div>
也可以先换单位：270 km = 2.7×10<sup>5</sup> m，1.5 h = 5400 s，<span class="v">v</span> = 270000 m / 5400 s = 50 m/s，结果一样。`
        },
        {
          type: 'choice',
          q: `甲、乙两车同时从同一地点出发，向东做直线运动，它们的 s-t 图像如图所示。下列说法正确的是${stExFig()}`,
          options: ['甲车速度为 5 m/s，乙车速度为 2 m/s', '甲、乙两车都在做加速运动', '经过 4 s，甲、乙两车相距 8 m', '乙车通过 10 m 所用的时间比甲车短'],
          answer: 0,
          explain: `从图上读点：甲在 4 s 内通过 20 m，<span class="v">v</span><sub>甲</sub> = 20 m / 4 s = 5 m/s；乙在 5 s 内通过 10 m，<span class="v">v</span><sub>乙</sub> = 10 m / 5 s = 2 m/s。<br>
两条图线都是过原点的直线，说明都在做匀速直线运动，不是加速运动。<br>
4 s 时甲走了 20 m，乙走了 2 m/s × 4 s = 8 m，两车相距 20 m − 8 m = 12 m，不是 8 m（8 m 是乙走的路程）。<br>
通过 10 m，甲只用 2 s，乙要用 5 s，乙用时更长。`
        },
        {
          type: 'num',
          q: '小华家到学校的路程是 1800 m。她前一半路程步行，速度为 1.5 m/s；后一半路程骑共享单车，速度为 4.5 m/s。她从家到学校的平均速度是多少 m/s？',
          answer: 2.25, unit: 'm/s',
          explain: `<div class="steps"><p>已知：<span class="v">s</span><sub>1</sub> = <span class="v">s</span><sub>2</sub> = 900 m，<span class="v">v</span><sub>1</sub> = 1.5 m/s，<span class="v">v</span><sub>2</sub> = 4.5 m/s</p>
<p>解：<span class="v">t</span><sub>1</sub> = <span class="v">s</span><sub>1</sub>/<span class="v">v</span><sub>1</sub> = 900 m / 1.5 m/s = 600 s；<span class="v">t</span><sub>2</sub> = <span class="v">s</span><sub>2</sub>/<span class="v">v</span><sub>2</sub> = 900 m / 4.5 m/s = 200 s</p>
<p><span class="v">v</span> = <span class="v">s</span><sub>总</sub>/<span class="v">t</span><sub>总</sub> = 1800 m / (600 s + 200 s) = 2.25 m/s</p><p>答：平均速度是 2.25 m/s。</p></div>
<p class="warn">(1.5 + 4.5) ÷ 2 = 3 m/s 是典型错误：步行那一半用的时间长得多，平均速度会更靠近步行速度。</p>`
        },
        {
          type: 'choice',
          q: '运动会百米赛跑时，看台上的观众看谁跑在前面就认为谁快；终点裁判看谁先到终点就判谁快。观众和裁判比较快慢的方法分别是',
          options: ['观众：相同时间比路程；裁判：相同路程比时间', '观众：相同路程比时间；裁判：相同时间比路程', '观众和裁判都是相同时间比路程', '观众和裁判都是相同路程比时间'],
          answer: 0,
          explain: '比赛进行中，运动员同时起跑、跑了相同的时间，观众看谁跑在前面（路程大），用的是“相同时间比路程”。裁判在终点比较的是跑完同样 100 m 谁用时短，用的是“相同路程比时间”。如果路程和时间都不同，就要算出速度 <span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> 来比较。'
        },
        {
          type: 'choice',
          q: '“声音在 15 ℃ 的空气中传播速度是 340 m/s”，这句话表示',
          options: ['声音在空气中每秒传播的路程是 340 m', '声音在空气中传播的路程一定是 340 m', '声音在空气中每传播 1 m 需要 340 s', '声音在空气中传播 340 s 通过的路程是 1 m'],
          answer: 0,
          explain: '速度是表示物体运动快慢的物理量，数值上等于物体在单位时间内通过的路程。340 m/s 就是 1 s 内传播 340 m。它不是说总路程是 340 m；传播 1 m 只需要 1/340 s。'
        },
        {
          type: 'choice',
          q: '下列速度中，最大的是',
          options: ['20 m/s', '54 km/h', '1 km/min', '600 m/min'],
          answer: 0,
          explain: `统一换成 m/s 再比较：<div class="steps"><p>54 km/h = 54 ÷ 3.6 m/s = 15 m/s</p><p>1 km/min = 1000 m / 60 s ≈ 16.7 m/s</p><p>600 m/min = 600 m / 60 s = 10 m/s</p></div>所以 20 m/s 最大。不能只看数字大小，54 比 20 大，但单位不同，54 km/h 其实更慢。`
        },
        {
          type: 'choice',
          q: '下列估测最接近实际的是',
          options: ['中学生骑自行车的速度约 5 m/s', '中学生正常步行的速度约 5 m/s', '声音在空气中的传播速度约 3×10<sup>8</sup> m/s', '复兴号高铁的最高运行速度约 350 m/s'],
          answer: 0,
          explain: '骑自行车约 5 m/s（18 km/h），符合实际。步行约 1.1 m/s，5 m/s 太快；3×10<sup>8</sup> m/s 是光在真空中的速度，声音在空气中约 340 m/s；复兴号最高约 350 km/h，即约 97 m/s，不是 350 m/s。'
        },
        {
          type: 'choice',
          q: '一辆汽车在平直公路上做匀速直线运动，10 s 内通过的路程是 200 m。下列说法正确的是',
          options: ['它在第 5 s 时的速度是 20 m/s', '它在前 5 s 内的速度是 10 m/s', '它行驶的路程越长，速度越大', '它在 1 min 内通过的路程是 200 m'],
          answer: 0,
          explain: '<span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> = 200 m / 10 s = 20 m/s。匀速直线运动的速度始终不变，任何时刻、任何一段时间内都是 20 m/s，与路程、时间无关，所以前 5 s 也是 20 m/s，不是 10 m/s。1 min 内通过的路程 <span class="v">s</span> = <span class="v">v</span><span class="v">t</span> = 20 m/s × 60 s = 1200 m。'
        },
        {
          type: 'num',
          q: '一辆汽车从甲地开往乙地，先以 60 km/h 的速度行驶 0.5 h，然后在服务区休息 0.5 h，再以 80 km/h 的速度行驶 1.5 h 到达乙地。汽车从甲地到乙地全程的平均速度是多少 km/h？',
          answer: 60, unit: 'km/h',
          explain: `<div class="steps"><p>已知：<span class="v">v</span><sub>1</sub> = 60 km/h，<span class="v">t</span><sub>1</sub> = 0.5 h；休息 <span class="v">t</span><sub>2</sub> = 0.5 h；<span class="v">v</span><sub>3</sub> = 80 km/h，<span class="v">t</span><sub>3</sub> = 1.5 h</p>
<p>求：全程平均速度 <span class="v">v</span></p>
<p>解：<span class="v">s</span><sub>1</sub> = <span class="v">v</span><sub>1</sub><span class="v">t</span><sub>1</sub> = 60 km/h × 0.5 h = 30 km；<span class="v">s</span><sub>3</sub> = <span class="v">v</span><sub>3</sub><span class="v">t</span><sub>3</sub> = 80 km/h × 1.5 h = 120 km</p>
<p><span class="v">v</span> = <span class="v">s</span><sub>总</sub>/<span class="v">t</span><sub>总</sub> = (30 km + 120 km) / (0.5 h + 0.5 h + 1.5 h) = 150 km / 2.5 h = 60 km/h</p>
<p>答：全程平均速度是 60 km/h。</p></div>
<p class="warn">休息的 0.5 h 也是全程用的时间，必须算进总时间。漏掉它会算成 75 km/h。</p>`
        },
        {
          type: 'num',
          q: `如图 1，让小车从斜面上 A 点由静止下滑，B 是 AC 的中点，AC 长 80.0 cm。测得小车从 A 到 C 用时 2.5 s，从 A 到 B 用时 1.6 s。小车通过下半段 BC 的平均速度是多少 m/s？（结果保留两位小数）${slopeFig()}`,
          answer: 0.44, unit: 'm/s', tol: 0.02,
          explain: `<div class="steps"><p>已知：<span class="v">s</span><sub>BC</sub> = 80.0 cm ÷ 2 = 40.0 cm = 0.400 m，<span class="v">t</span><sub>AC</sub> = 2.5 s，<span class="v">t</span><sub>AB</sub> = 1.6 s</p>
<p>求：BC 段的平均速度 <span class="v">v</span><sub>BC</sub></p>
<p>解：<span class="v">t</span><sub>BC</sub> = <span class="v">t</span><sub>AC</sub> − <span class="v">t</span><sub>AB</sub> = 2.5 s − 1.6 s = 0.9 s</p>
<p><span class="v">v</span><sub>BC</sub> = <span class="v">s</span><sub>BC</sub>/<span class="v">t</span><sub>BC</sub> = 0.400 m / 0.9 s ≈ 0.44 m/s</p>
<p>答：BC 段的平均速度约为 0.44 m/s。</p></div>
对比：<span class="v">v</span><sub>AB</sub> = 0.400 m / 1.6 s = 0.25 m/s，<span class="v">v</span><sub>AC</sub> = 0.800 m / 2.5 s = 0.32 m/s。小车越滑越快，下半段平均速度最大，全程居中。BC 段的时间不能直接测，要用 <span class="v">t</span><sub>AC</sub> − <span class="v">t</span><sub>AB</sub>。`
        },
        {
          type: 'num',
          q: '一列长 360 m 的高铁匀速通过一座长 1440 m 的大桥，从车头上桥到车尾离开大桥共用时 30 s。高铁的速度是多少 km/h？',
          answer: 216, unit: 'km/h',
          explain: `<div class="steps"><p>已知：<span class="v">L</span><sub>车</sub> = 360 m，<span class="v">L</span><sub>桥</sub> = 1440 m，<span class="v">t</span> = 30 s</p>
<p>求：速度 <span class="v">v</span>（km/h）</p>
<p>解：从车头上桥到车尾离桥，火车通过的路程 <span class="v">s</span> = <span class="v">L</span><sub>桥</sub> + <span class="v">L</span><sub>车</sub> = 1440 m + 360 m = 1800 m</p>
<p><span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> = 1800 m / 30 s = 60 m/s = 60 × 3.6 km/h = 216 km/h</p>
<p>答：高铁的速度是 216 km/h。</p></div>
画一画车头的位置变化：车尾离桥时车头已经过了桥头 360 m，所以路程要加上车长。`
        },
        {
          type: 'choice',
          q: '甲、乙两车都做匀速直线运动，速度之比 <span class="v">v</span><sub>甲</sub>∶<span class="v">v</span><sub>乙</sub> = 3∶1，所用时间之比 <span class="v">t</span><sub>甲</sub>∶<span class="v">t</span><sub>乙</sub> = 2∶3，则通过的路程之比 <span class="v">s</span><sub>甲</sub>∶<span class="v">s</span><sub>乙</sub> 为',
          options: ['2∶1', '1∶2', '9∶2', '2∶9'],
          answer: 0,
          explain: '<span class="v">s</span> = <span class="v">v</span><span class="v">t</span>，所以 <span class="v">s</span><sub>甲</sub>∶<span class="v">s</span><sub>乙</sub> = (<span class="v">v</span><sub>甲</sub><span class="v">t</span><sub>甲</sub>)∶(<span class="v">v</span><sub>乙</sub><span class="v">t</span><sub>乙</sub>) = (3 × 2)∶(1 × 3) = 6∶3 = 2∶1。比值题的通用方法：先写出所求量的公式，再把比值代入，可以设 <span class="v">v</span><sub>甲</sub> = 3、<span class="v">v</span><sub>乙</sub> = 1 来算。'
        },
        {
          type: 'choice',
          q: '下列关于运动图像的说法，正确的是',
          options: ['v-t 图像中平行于时间轴的直线（不在时间轴上）表示物体做匀速直线运动', 's-t 图像中平行于时间轴的直线表示物体做匀速直线运动', 'v-t 图像中过原点的倾斜直线表示物体做匀速直线运动', '同一 s-t 图像中，图线越平缓，表示速度越大'],
          answer: 0,
          explain: 'v-t 图中的水平线表示速度不变，是匀速直线运动；s-t 图中的水平线表示路程不变，物体静止。v-t 图中过原点的倾斜直线表示速度越来越大，是加速运动。s-t 图中越陡，相同时间内通过的路程越大，速度越大；越平缓速度越小。'
        }
      ],
      passages: {
        p1: {
          title: '实验：测量小车的平均速度',
          html: `<p>小华用如图 1 所示的装置测量小车的平均速度。让小车从斜面 A 点由静止开始下滑，分别测出小车到达 B 点和 C 点所用的时间。已知 AC 长 1.20 m，B 是 AC 的中点；小车从 A 到 B 用时 2.4 s，从 A 到 C 用时 4.0 s。</p>${slopeFig()}`
        }
      },
      tests: [
        {
          type: 'num',
          q: '一辆汽车的速度是 54 km/h，合多少 m/s？',
          answer: 15, unit: 'm/s',
          explain: 'km/h 换成 m/s 要除以 3.6：54 ÷ 3.6 = 15，即 54 km/h = 15 m/s。'
        },
        {
          type: 'choice',
          q: '关于匀速直线运动的速度公式 <span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span>，下列理解正确的是',
          options: ['物体的速度与通过的路程、所用的时间无关', '速度与路程成正比', '速度与时间成反比', '运动的时间越短，速度一定越大'],
          answer: 0,
          explain: '做匀速直线运动的物体，速度大小始终不变，路程变长时时间也按比例变长，比值不变。所以速度与路程、时间无关，不能说成正比或反比。“时间越短速度越大”还要看路程，路程不确定时无法比较。'
        },
        {
          type: 'choice',
          q: '下列对中学生正常步行速度的估测，最接近实际的是',
          options: ['1.1 m/s', '11 m/s', '5 m/s', '0.1 m/s'],
          answer: 0,
          explain: '人正常步行约 1.1 m/s（约 4 km/h）。5 m/s 接近骑自行车的速度；11 m/s 比百米世界冠军的平均速度（约 10 m/s）还快；0.1 m/s 比蜗牛快不了多少。'
        },
        {
          type: 'num',
          q: '雷雨天，你看到闪电后 3 s 才听到雷声。已知声音在空气中的传播速度为 340 m/s，光传播的时间忽略不计，打雷处离你约多少米？',
          answer: 1020, unit: 'm',
          explain: '光速极大，看到闪电几乎就是打雷的时刻，所以声音传过来用了 3 s。<span class="v">s</span> = <span class="v">v</span><span class="v">t</span> = 340 m/s × 3 s = 1020 m。'
        },
        {
          type: 'choice',
          q: '在“测量小车沿斜面下滑的平均速度”实验中，下列做法或说法正确的是',
          options: ['斜面的坡度应小一些，使小车下滑得慢一些，便于测量时间', '斜面的坡度应大一些，使小车尽快到达底端', '只需要刻度尺，不需要停表', '小车过了终点才停止计时，测得的平均速度偏大'],
          answer: 0,
          explain: '坡度小，小车运动慢、时间长，计时误差相对更小。原理是 <span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span>，路程要用刻度尺测，时间要用停表测。过了终点才停止计时，测得的时间偏大，平均速度偏小，而不是偏大。'
        },
        {
          type: 'num',
          q: '一辆汽车前 10 min 行驶了 9 km，接着又用 20 min 行驶了 27 km。汽车在这 30 min 内的平均速度是多少 m/s？',
          answer: 20, unit: 'm/s',
          explain: '总路程 <span class="v">s</span> = 9 km + 27 km = 36 km = 36000 m，总时间 <span class="v">t</span> = 30 min = 1800 s，<span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> = 36000 m / 1800 s = 20 m/s（即 72 km/h）。'
        },
        {
          type: 'choice',
          q: '下列图像中，表示物体做匀速直线运动的是',
          options: [miniGraph('st-line'), miniGraph('st-flat'), miniGraph('vt-line'), miniGraph('st-curve')],
          answer: 0,
          explain: 's-t 图中过原点的倾斜直线，表示路程与时间成正比，是匀速直线运动。s-t 图中的水平线表示路程不变，物体静止；v-t 图中的倾斜直线表示速度越来越大，是加速运动；s-t 图中向上弯的曲线表示相同时间内路程越来越大，也是加速运动。'
        },
        {
          type: 'fill',
          q: '速度是表示物体运动______的物理量。',
          answer: ['快慢', '运动快慢', '快慢程度'],
          explain: '速度是表示物体运动快慢的物理量，等于路程与时间之比。'
        },
        {
          type: 'num',
          q: '一列长 200 m 的火车以 20 m/s 的速度匀速通过一条长 1000 m 的隧道。从车头进入隧道到车尾离开隧道，共需要多少秒？',
          answer: 60, unit: 's',
          explain: '车尾离开隧道时，车头已经走出隧道 200 m，所以火车通过的路程 = 隧道长 + 车长 = 1000 m + 200 m = 1200 m。<span class="v">t</span> = <span class="v">s</span>/<span class="v">v</span> = 1200 m / 20 m/s = 60 s。'
        },
        {
          type: 'choice',
          q: '甲、乙两物体都做匀速直线运动，速度之比 <span class="v">v</span><sub>甲</sub>∶<span class="v">v</span><sub>乙</sub> = 2∶3，通过的路程之比 <span class="v">s</span><sub>甲</sub>∶<span class="v">s</span><sub>乙</sub> = 3∶4，则所用时间之比 <span class="v">t</span><sub>甲</sub>∶<span class="v">t</span><sub>乙</sub> 为',
          options: ['9∶8', '8∶9', '1∶2', '2∶1'],
          answer: 0,
          explain: '<span class="v">t</span> = <span class="v">s</span>/<span class="v">v</span>，所以 <span class="v">t</span><sub>甲</sub>∶<span class="v">t</span><sub>乙</sub> = (<span class="v">s</span><sub>甲</sub>/<span class="v">v</span><sub>甲</sub>)∶(<span class="v">s</span><sub>乙</sub>/<span class="v">v</span><sub>乙</sub>) = (3/2)∶(4/3) = 9∶8。把两个比直接相乘得到 1∶2 是常见错误。'
        },
        {
          type: 'choice',
          q: '“龟兔赛跑”刚开始时，观众认为兔子跑得快；比赛结束时，裁判判定先到终点的乌龟跑得快。下列说法正确的是',
          options: ['观众用的是“相同时间比路程”，裁判用的是“相同路程比时间”', '观众用的是“相同路程比时间”，裁判用的是“相同时间比路程”', '观众和裁判比较快慢的方法相同', '裁判判定乌龟快，说明乌龟在比赛中每时每刻都比兔子快'],
          answer: 0,
          explain: '比赛开始后经过相同的时间，兔子跑在前面（路程大），观众是“相同时间比路程”。裁判比较的是跑完同样的全程谁用时短，是“相同路程比时间”。裁判比较的是全程的平均快慢，不代表乌龟每时每刻都更快——开始时兔子明显更快。'
        },
        {
          type: 'fill',
          q: '百米赛跑时，终点裁判是用“通过相同的______，比较所用时间”的方法判断运动员快慢的。',
          answer: ['路程', '距离'],
          explain: '运动员跑的都是 100 m，裁判比较谁用的时间短，这是“相同路程比时间”。'
        },
        {
          type: 'choice',
          q: '一名同学骑自行车的速度是 5 m/s，它表示',
          options: ['这名同学每秒通过的路程是 5 m', '这名同学通过的路程是 5 m', '这名同学每通过 1 m 需要 5 s', '这名同学运动 5 s 通过的路程是 1 m'],
          answer: 0,
          explain: '速度在数值上等于单位时间内通过的路程，5 m/s 表示 1 s 内通过 5 m。它不表示总路程；通过 1 m 只需要 0.2 s。'
        },
        {
          type: 'num',
          q: '某运动员百米赛跑的平均速度是 10 m/s，合多少 km/h？',
          answer: 36, unit: 'km/h',
          explain: 'm/s 换成 km/h 要乘 3.6：10 × 3.6 = 36，即 10 m/s = 36 km/h。'
        },
        {
          type: 'choice',
          q: '下列物体运动最快的是',
          options: ['奔跑的猎豹，速度 30 m/s', '高速公路上的小汽车，速度 90 km/h', '飞行的雨燕，速度 1.5 km/min', '百米赛跑运动员，100 m 用时 10 s'],
          answer: 0,
          explain: '统一换成 m/s：90 km/h = 90 ÷ 3.6 m/s = 25 m/s；1.5 km/min = 1500 m / 60 s = 25 m/s；运动员 100 m / 10 s = 10 m/s。猎豹 30 m/s 最快。'
        },
        {
          type: 'choice',
          q: '下列运动的速度最接近 18 km/h 的是',
          options: ['中学生骑自行车上学', '中学生正常步行', '高铁正常运行', '声音在空气中传播'],
          answer: 0,
          explain: '18 km/h = 18 ÷ 3.6 m/s = 5 m/s，接近骑自行车的速度。步行约 1.1 m/s（约 4 km/h）；高铁约 300 km/h 以上；声音在空气中约 340 m/s（约 1224 km/h）。'
        },
        {
          type: 'num',
          q: '一个物体做匀速直线运动，前 4 s 内通过的路程是 12 m。它在第 10 s 时的速度是多少 m/s？',
          answer: 3, unit: 'm/s',
          explain: '匀速直线运动的速度不变，<span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> = 12 m / 4 s = 3 m/s，第 10 s 时的速度仍是 3 m/s。'
        },
        {
          type: 'num',
          q: '一个物体做匀速直线运动，2 s 内通过的路程是 10 m。保持这样的运动，它在 6 s 内通过的路程是多少米？',
          answer: 30, unit: 'm',
          explain: '<span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> = 10 m / 2 s = 5 m/s，速度不变，6 s 内通过的路程 <span class="v">s</span> = <span class="v">v</span><span class="v">t</span> = 5 m/s × 6 s = 30 m。'
        },
        {
          type: 'num',
          q: '福州地铁某段线路长 2.4 km，列车在这段线路上的平均速度为 40 km/h。列车跑完这段线路需要多少分钟？',
          answer: 3.6, unit: 'min',
          explain: '<span class="v">t</span> = <span class="v">s</span>/<span class="v">v</span> = 2.4 km / 40 km/h = 0.06 h = 0.06 × 60 min = 3.6 min。'
        },
        {
          type: 'num',
          q: '小明骑自行车上学，先用 5 min 骑了 1.5 km，在路口等红灯用了 1 min，又用 4 min 骑了 1.2 km 到达学校。他从家到学校的平均速度是多少 m/s？',
          answer: 4.5, unit: 'm/s',
          explain: '总路程 <span class="v">s</span> = 1.5 km + 1.2 km = 2.7 km = 2700 m；总时间要包括等红灯的时间，<span class="v">t</span> = 5 min + 1 min + 4 min = 10 min = 600 s。<span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> = 2700 m / 600 s = 4.5 m/s。'
        },
        {
          type: 'num',
          q: '一辆汽车在前一半时间内的速度是 20 m/s，后一半时间内的速度是 30 m/s。汽车全程的平均速度是多少 m/s？',
          answer: 25, unit: 'm/s',
          explain: '设总时间为 2<span class="v">t</span>，则 <span class="v">s</span> = 20 m/s × <span class="v">t</span> + 30 m/s × <span class="v">t</span> = (50 m/s)<span class="v">t</span>，<span class="v">v</span> = <span class="v">s</span>/(2<span class="v">t</span>) = 25 m/s。注意：只有“前后两段时间相等”时，平均速度才恰好等于两个速度的平均数；“前后两段路程相等”时就不是。'
        },
        {
          type: 'choice',
          q: '某同学跑 800 m，前 400 m 的平均速度是 5 m/s，后 400 m 的平均速度是 4 m/s。下列说法正确的是',
          options: ['全程的平均速度约为 4.4 m/s', '全程的平均速度是 4.5 m/s', '全程的平均速度是 9 m/s', '后 400 m 用时 80 s'],
          answer: 0,
          explain: '<span class="v">t</span><sub>1</sub> = 400 m / 5 m/s = 80 s，<span class="v">t</span><sub>2</sub> = 400 m / 4 m/s = 100 s，全程 <span class="v">v</span> = 800 m / 180 s ≈ 4.4 m/s。4.5 m/s 是把两个速度直接取平均的错误结果；后 400 m 用时是 100 s，80 s 是前 400 m 的用时。'
        },
        {
          type: 'num',
          passage: 'p1',
          q: '小车通过全程 AC 的平均速度是多少 m/s？',
          answer: 0.3, unit: 'm/s',
          explain: '<span class="v">v</span><sub>AC</sub> = <span class="v">s</span><sub>AC</sub>/<span class="v">t</span><sub>AC</sub> = 1.20 m / 4.0 s = 0.3 m/s。'
        },
        {
          type: 'num',
          passage: 'p1',
          q: '小车通过下半段 BC 的平均速度是多少 m/s？（结果保留三位小数）',
          answer: 0.375, unit: 'm/s',
          explain: '<span class="v">s</span><sub>BC</sub> = 1.20 m ÷ 2 = 0.60 m，<span class="v">t</span><sub>BC</sub> = <span class="v">t</span><sub>AC</sub> − <span class="v">t</span><sub>AB</sub> = 4.0 s − 2.4 s = 1.6 s，<span class="v">v</span><sub>BC</sub> = 0.60 m / 1.6 s = 0.375 m/s。它大于上半段的 0.60 m / 2.4 s = 0.25 m/s，说明小车越滑越快。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '如果小车过了 A 点才开始计时，测得的 AC 段平均速度会',
          options: ['偏大', '偏小', '不变', '无法判断'],
          answer: 0,
          explain: '过了 A 点才开始计时，测得的时间比真实时间短，路程不变，由 <span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> 可知平均速度偏大。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '为了测小车在 BC 段的平均速度，小明让小车从 B 点由静止释放，测出它到达 C 点的时间。这种做法',
          options: ['不正确，小车从 A 下滑经过 B 点时速度不为零，这样测得的时间偏大', '正确，BC 段的路程和时间都能测准', '不正确，这样测得的时间偏小', '正确，只是应该把斜面坡度调大'],
          answer: 0,
          explain: '题目要的是小车从 A 下滑过程中经过 BC 段的平均速度。小车从 A 滑到 B 时已经有了速度，而从 B 点由静止释放时速度为零，通过 BC 用的时间更长，测得的平均速度偏小。正确做法是用 <span class="v">t</span><sub>AC</sub> − <span class="v">t</span><sub>AB</sub>。'
        },
        {
          type: 'choice',
          q: '在“测量小车沿斜面下滑的平均速度”实验中，在斜面底端放一块金属片，它的作用是',
          options: ['小车撞击金属片发出声音，便于确定终点、准确计时', '使小车下滑得更快', '减小小车下滑时受到的阻力', '使小车运动得更平稳'],
          answer: 0,
          explain: '小车撞到金属片会发出声音并停下，计时的同学听到声音就停表，便于准确确定小车到达终点的时刻，减小计时误差。'
        },
        {
          type: 'choice',
          q: '一个物体运动的 v-t 图像是一条平行于时间轴的直线（v ≠ 0），说明该物体',
          options: ['做匀速直线运动', '处于静止状态', '做加速运动', '做减速运动'],
          answer: 0,
          explain: 'v-t 图中的水平线表示速度大小不随时间变化，物体做匀速直线运动。如果是 s-t 图中的水平线，才表示静止。'
        },
        {
          type: 'num',
          q: `甲、乙两车同时从同一地点出发，向东做直线运动，它们的 s-t 图像如图所示。经过 6 s，两车相距多少米？${stExFig()}`,
          answer: 18, unit: 'm',
          explain: '由图读出 6 s 时甲通过 30 m；乙的速度 <span class="v">v</span><sub>乙</sub> = 10 m / 5 s = 2 m/s，6 s 内通过 2 m/s × 6 s = 12 m。两车同向运动，相距 30 m − 12 m = 18 m。'
        },
        {
          type: 'fill',
          q: '在 s-t 图像中，一条平行于时间轴的直线表示物体处于______状态。',
          answer: ['静止'],
          explain: 's-t 图中图线水平，表示随着时间推移路程不变，物体静止。'
        },
        {
          type: 'choice',
          q: '甲、乙两人都做匀速直线运动，速度之比 <span class="v">v</span><sub>甲</sub>∶<span class="v">v</span><sub>乙</sub> = 4∶3。通过相同的路程，他们所用的时间之比 <span class="v">t</span><sub>甲</sub>∶<span class="v">t</span><sub>乙</sub> 为',
          options: ['3∶4', '4∶3', '1∶1', '16∶9'],
          answer: 0,
          explain: '路程相同时，<span class="v">t</span> = <span class="v">s</span>/<span class="v">v</span>，时间与速度成反比，<span class="v">t</span><sub>甲</sub>∶<span class="v">t</span><sub>乙</sub> = <span class="v">v</span><sub>乙</sub>∶<span class="v">v</span><sub>甲</sub> = 3∶4。'
        },
        {
          type: 'num',
          q: '一列长 150 m 的火车以 30 m/s 的速度匀速通过一座大桥，火车<b>完全在桥上</b>的时间是 20 s。这座桥长多少米？',
          answer: 750, unit: 'm',
          explain: '“完全在桥上”是从车尾上桥到车头离桥，这段时间火车通过的路程 = 桥长 − 车长。<span class="v">s</span> = <span class="v">v</span><span class="v">t</span> = 30 m/s × 20 s = 600 m，所以桥长 = 600 m + 150 m = 750 m。'
        },
        {
          type: 'num',
          q: '一列长 300 m 的火车以 72 km/h 的速度匀速通过一条长 1500 m 的隧道。从车头进入隧道到车尾离开隧道，共需要多少秒？',
          answer: 90, unit: 's',
          explain: '72 km/h = 72 ÷ 3.6 m/s = 20 m/s。火车通过的路程 = 隧道长 + 车长 = 1500 m + 300 m = 1800 m，<span class="v">t</span> = <span class="v">s</span>/<span class="v">v</span> = 1800 m / 20 m/s = 90 s。'
        }
      ],
      practice: [
        {
          title: '作图：画 s-t 图像',
          prompt: `<p>小车在水平面上做直线运动，测得的数据如下表：</p>
<table class="tbl"><tr><th>时间 <span class="v">t</span>/s</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td></tr>
<tr><th>路程 <span class="v">s</span>/m</th><td>0</td><td>1.5</td><td>3.0</td><td>4.5</td><td>6.0</td></tr></table>
<p>（1）在下面的坐标中描点，画出小车的 s-t 图像（可以在草稿纸上照着画）；<br>（2）小车做的是什么运动？速度是多少？</p>${practiceGrid(false)}`,
          write: true,
          sample: `${practiceGrid(true)}<p>（1）描出 (0, 0)、(1, 1.5)、(2, 3.0)、(3, 4.5)、(4, 6.0) 五个点，用直尺连成一条过原点的直线（可以延长到 5 s）。</p>
<p>（2）图像是过原点的倾斜直线，说明路程与时间成正比，小车做<b>匀速直线运动</b>；<span class="v">v</span> = <span class="v">s</span>/<span class="v">t</span> = 6.0 m / 4 s = <b>1.5 m/s</b>。</p>`,
          checklist: ['五个点位置都描对了', '用直尺连成一条直线，并且经过原点', '指出是匀速直线运动，并说明理由（过原点的直线）', '速度算对：1.5 m/s，写了单位']
        }
      ]
    },

    /* ---------------- 平面镜成像 ---------------- */
    {
      id: 'p-plane-mirror',
      title: '平面镜成像',
      short: '平面镜成像',
      module: 'light',
      term: '8a',
      chapter: '第四章 光现象',
      freq: 3,
      keywords: '平面镜 虚像 对称 玻璃板 蜡烛 光屏 倒影 作图 像距 物距',
      prereqs: ['p-reflection'],
      tip: '作图题（对称法画像、找像点画反射光路）和探究实验（为什么用薄玻璃板、两支相同的蜡烛、光屏接不到像说明是虚像）必考；易错：人走近镜子，像的大小不变。',
      learn: [
        {
          h: '平面镜成像的特点',
          html: `<p>照镜子时，镜子里的“你”就是你在平面镜中成的像。它有四个特点，记成八个字：<b>等大、等距、垂直、虚像</b>。</p>
${mirrorFeatureFig()}
<ul><li><b>等大</b>：像与物体大小相等；</li>
<li><b>等距</b>：像到镜面的距离等于物体到镜面的距离（像距 = 物距）；</li>
<li><b>垂直</b>：像与物体对应点的连线与镜面垂直；</li>
<li><b>虚像</b>：像不是实际光线会聚成的，用光屏接不到。</li></ul>
<div class="key">一句话：平面镜所成的像与物体<b>关于镜面对称</b>（正立、等大的虚像，左右相反）。</div>
<p class="warn">人走近镜子时，觉得像“变大了”，那是因为离得近、看起来视角大；像的实际大小始终和人一样大，不会变。</p>`
        },
        {
          h: '为什么是虚像',
          html: `<p>点 S 发出的光射到镜面上发生反射。反射光线进入眼睛，而人眼总是认为光是沿直线传来的，于是就“看到”光好像是从这些反射光线<b>反向延长线的交点 S′</b> 发出的。</p>
${mirrorPrincipleFig()}
<p>镜子后面其实没有光，S′ 只是反向延长线的交点，所以是<b>虚像</b>。作图时，虚像和反向延长线都要画成<b>虚线</b>。</p>
<p>拖动下面的滑块，看物距、物体高度变化时，像怎样跟着变：</p>
<div class="sim" data-sim="mirror"></div>`
        },
        {
          h: '探究平面镜成像的特点（实验）',
          html: `${mirrorExpFig()}
<p>实验步骤：在桌上铺一张白纸，把薄玻璃板竖直立在纸上；点燃蜡烛 A 放在玻璃板前面，拿一支<b>完全相同但不点燃</b>的蜡烛 B 在玻璃板后面移动，直到从前面看去 B 与 A 的像完全重合；记下 A、B 的位置，用刻度尺测出它们到玻璃板的距离。改变 A 的位置，重复几次。</p>
<table class="tbl"><tr><th>器材或做法</th><th>目的</th></tr>
<tr><td>用<b>玻璃板</b>代替平面镜</td><td>玻璃板透明，既能看到 A 的像，又能看到后面的 B，<b>便于确定像的位置</b></td></tr>
<tr><td>选<b>薄</b>玻璃板</td><td>厚玻璃板前后两个面都会成像，看到两个像，不好确定位置</td></tr>
<tr><td>玻璃板与桌面<b>垂直</b></td><td>否则像会偏高或偏低，B 怎么移动都无法与像重合</td></tr>
<tr><td>两支<b>完全相同</b>的蜡烛</td><td>B 能与 A 的像完全重合，说明<b>像与物大小相等</b></td></tr>
<tr><td>刻度尺</td><td>测量像与物到镜面的距离，比较是否相等</td></tr>
<tr><td>在像的位置放<b>光屏</b></td><td>光屏上接不到像，说明平面镜成的是<b>虚像</b>（要直接看光屏，不能透过玻璃板看）</td></tr>
<tr><td>在较<b>暗</b>的环境中做</td><td>烛焰与环境对比明显，像更清楚</td></tr>
<tr><td>改变物距，多做几次</td><td>使结论具有普遍性，避免偶然性</td></tr></table>`
        },
        {
          h: '平面镜成像作图',
          html: `<p><b>方法一：对称法画像。</b>分别过 A、B 向镜面作垂线并延长，使像点到镜面的距离等于物点到镜面的距离，得到 A′、B′，再用<b>虚线</b>连接 A′B′（画上箭头）。</p>
${mirrorSymFig()}
<p><b>方法二：利用像点画反射光路。</b>题目常说“S 发出的一条光线经平面镜反射后经过 P 点，画出这条光线”。步骤：</p>
<ol><li>作 S 关于镜面的对称点 S′（像点）；</li>
<li>连接 S′P，与镜面交于 O 点，S′O 段画虚线；</li>
<li>连接 SO，就是入射光线；OP 就是反射光线，都画实线并标箭头。</li></ol>
${mirrorRayFig()}
<p>为什么这样画是对的？因为所有反射光线的反向延长线都经过像点 S′，所以经过 P 的那条反射光线一定在直线 S′P 上。也可以用反射定律检验：过 O 作法线，入射角等于反射角。</p>
<p class="warn">作图规范：光线是实线带箭头；像、法线、反向延长线、物像连线都是虚线；对称点连线要画垂直符号。</p>`
        }
      ],
      examples: [
        {
          type: 'choice',
          q: '小红站在竖直放置的穿衣镜前 1.5 m 处，她沿垂直镜面的方向向镜子走近了 0.5 m。这时她的像与她的距离、像的大小分别是',
          options: ['2 m，像的大小不变', '2 m，像变大', '1 m，像的大小不变', '3 m，像变小'],
          answer: 0,
          explain: '走近 0.5 m 后，小红到镜面的距离为 1.5 m − 0.5 m = 1 m。像到镜面的距离也是 1 m，所以像与她相距 1 m + 1 m = 2 m（1 m 只是她到镜面的距离）。平面镜成的像与物体大小相等，人走近时像的大小不变。'
        },
        {
          type: 'choice',
          q: '在“探究平面镜成像的特点”实验中，用玻璃板代替平面镜，主要是为了',
          options: ['便于确定像的位置', '使成的像更清晰', '使玻璃板成实像', '使像变得更大'],
          answer: 0,
          explain: '玻璃板是透明的，在前面既能看到蜡烛 A 的像，又能看到后面的蜡烛 B，移动 B 使它与像重合，就能确定像的位置。玻璃板反射的光比镜子少，像反而暗一些；玻璃板成的仍是正立、等大的虚像，大小不会改变。'
        },
        {
          type: 'num',
          q: `检查视力时，视力表挂在平面镜正对面的墙上，视力表到平面镜的距离为 2.5 m。小明面向平面镜坐在视力表前方 0.4 m 处（如图）。镜中视力表的像到小明的距离是多少米？${eyeChartFig()}`,
          answer: 4.6, unit: 'm',
          explain: `<div class="steps"><p>视力表的像到镜面的距离 = 视力表到镜面的距离 = 2.5 m</p>
<p>小明到镜面的距离 = 2.5 m − 0.4 m = 2.1 m</p>
<p>像到小明的距离 = 2.1 m + 2.5 m = 4.6 m</p></div>
画一条示意线段把各段距离标出来，就不容易漏加或多加。`
        },
        {
          type: 'num',
          q: '福建土楼前有一口平静的池塘，水深 1.5 m。土楼顶端到水面的高度是 18 m，土楼顶端在水中的“倒影”到水面的距离是多少米？',
          answer: 18, unit: 'm',
          explain: `<div class="steps"><p>已知：土楼顶端到水面（镜面）的距离 <span class="v">u</span> = 18 m</p><p>求：倒影顶端到水面的距离 <span class="v">v</span></p>
<p>解：平静的水面相当于平面镜，倒影是土楼的虚像。由像距等于物距，<span class="v">v</span> = <span class="v">u</span> = 18 m</p><p>答：倒影顶端到水面的距离是 18 m。</p></div>
<p class="warn">水深 1.5 m 是干扰条件：镜面是水面，像距只看物体到水面的距离，与水的深浅无关。</p>`
        },
        {
          type: 'choice',
          q: '小明面对平面镜举起右手，镜中的“小明”举起的是哪只手？下列说法正确的是',
          options: ['像举起的是“左手”，因为像与人关于镜面对称，左右相反', '像举起的是“右手”，因为像与人完全相同', '像举起的是“左手”，因为平面镜成倒立的像', '无法确定，因为像是虚像'],
          answer: 0,
          explain: '平面镜成正立、等大的虚像，像与物关于镜面对称。人和像面对面，对称后右手对应的是像的“左手”，这就是“左右相反”。平面镜成的是正立的像，不是倒立的。'
        },
        {
          type: 'choice',
          q: '人能在平面镜中看到物体的像，原因是',
          options: ['物体发出的光经镜面反射后进入人眼，人眼逆着反射光线看去，觉得光好像是从像点发出的', '像点发出的光进入了人眼', '镜子后面有实际光线会聚成了像', '物体发出的光透过镜子从后面射入人眼'],
          answer: 0,
          explain: '物体发出的光射到镜面发生反射，反射光线进入人眼。人眼认为光沿直线传播，看到光好像是从反射光线反向延长线的交点发出的，这个交点就是像点。镜子后面并没有光，所以像是虚像。'
        },
        {
          type: 'choice',
          q: '在“探究平面镜成像的特点”实验中，小明透过玻璃板看到蜡烛 A 有两个不重合的像。产生这一现象的原因和改进方法是',
          options: ['玻璃板的前后两个面各成一个像；换用薄玻璃板', '玻璃板没有与桌面垂直；把玻璃板竖直放置', '蜡烛 A 太亮；换一支较暗的蜡烛', '环境太暗；在明亮的环境中实验'],
          answer: 0,
          explain: '玻璃板有前、后两个反射面，各成一个像。玻璃板越厚，两个像离得越远，看起来就是两个像，不好确定像的位置。换用薄玻璃板，两个像几乎重合。玻璃板不垂直会使像偏高或偏低，不会出现两个像；实验应在较暗的环境中做，像更清楚。'
        },
        {
          type: 'choice',
          q: '在“探究平面镜成像的特点”实验中，无论怎样在桌面上移动蜡烛 B，都无法使它与蜡烛 A 的像完全重合，原因可能是',
          options: ['玻璃板没有与桌面垂直', '蜡烛 B 没有点燃', '玻璃板太薄', '实验环境太暗'],
          answer: 0,
          explain: '像与物关于镜面对称。玻璃板倾斜时，A 的像会偏到桌面上方或下方，而 B 只能在桌面上移动，所以无法与像重合。蜡烛 B 本来就不点燃；用薄玻璃板、在较暗环境中做都是正确的做法。'
        },
        {
          type: 'choice',
          q: '小明在探究平面镜成像特点时，只测了一组物距和像距（都是 6.0 cm），就得出“像距等于物距”的结论。这样做的不妥之处及改进方法是',
          options: ['只做了一次，结论有偶然性；应改变蜡烛 A 的位置，多测几组数据', '应换用厚玻璃板再做一次', '应把蜡烛 B 也点燃', '应在明亮的环境中再做一次'],
          answer: 0,
          explain: '只凭一组数据得出的结论可能是偶然的。改变物距多做几次，每次都发现像距等于物距，结论才有普遍性。厚玻璃板会出现重影；蜡烛 B 点燃后会分不清像和 B；明亮环境中像不清楚。'
        },
        {
          type: 'choice',
          q: '用对称法画物体 AB 在平面镜中的像 A′B′，下列作图规范正确的是',
          options: ['像 A′B′ 以及连线 AA′、BB′ 都画成虚线，并标出垂直符号', '像 A′B′ 画成实线，连线 AA′、BB′ 画成虚线', 'A′ 到镜面的距离比 A 到镜面的距离稍小', '连线 AA′ 与镜面平行'],
          answer: 0,
          explain: '平面镜成的是虚像，像要画虚线；物像连线是辅助线，也画虚线，并标出与镜面垂直的符号。像点与物点到镜面的距离相等，连线与镜面垂直，不是平行。'
        },
        {
          type: 'choice',
          q: '要画出点光源 S 发出的、经平面镜反射后经过 P 点的光线，可以先作 S 关于镜面的对称点 S′，再连接 S′P 与镜面交于 O 点。这样做的依据是',
          options: ['所有反射光线的反向延长线都经过像点 S′', '所有入射光线都经过像点 S′', '所有反射光线都经过点光源 S', '光从 S′ 沿直线射到 P 点'],
          answer: 0,
          explain: '平面镜成像时，S 发出的光经镜面反射后，所有反射光线的反向延长线都相交于像点 S′。经过 P 的那条反射光线也不例外，它的反向延长线经过 S′，所以反射光线一定在直线 S′P 上，与镜面的交点 O 就是入射点。S′ 处并没有真实的光，S′O 要画虚线。'
        }
      ],
      passages: {
        p1: {
          title: '实验：探究平面镜成像的特点',
          html: `<p>小芳在水平桌面上铺一张白纸，把一块薄玻璃板竖直立在纸上。点燃蜡烛 A 放在玻璃板前面，拿一支外形完全相同、未点燃的蜡烛 B 在玻璃板后面移动，直到从前面看去 B 与 A 的像完全重合，记下 A、B 的位置，用刻度尺测出它们到玻璃板的距离。改变 A 的位置，又做了两次，数据如下表。</p>
${mirrorExpFig()}
<table class="tbl"><tr><th>实验次数</th><th>1</th><th>2</th><th>3</th></tr>
<tr><th>A 到玻璃板的距离 / cm</th><td>5.0</td><td>8.0</td><td>12.0</td></tr>
<tr><th>B 到玻璃板的距离 / cm</th><td>5.0</td><td>8.0</td><td>12.0</td></tr></table>`
        }
      },
      tests: [
        {
          type: 'choice',
          q: '关于平面镜成像，下列说法正确的是',
          options: ['像与物体到镜面的距离相等', '物体离平面镜越远，像越小', '平面镜成的是倒立的实像', '像与物体对应点的连线与镜面平行'],
          answer: 0,
          explain: '平面镜成像的特点是等大、等距、垂直、虚像：像与物到镜面的距离相等；像的大小只与物体大小有关，与距离无关；成的是正立的虚像；对应点的连线与镜面垂直，不是平行。'
        },
        {
          type: 'num',
          q: '一只小鸟在平静的湖面上方 3 m 处飞过，湖水深 2 m。小鸟在湖中的“倒影”与小鸟相距多少米？',
          answer: 6, unit: 'm',
          explain: '平静的水面相当于平面镜，倒影是小鸟的虚像。像到水面的距离 = 小鸟到水面的距离 = 3 m，与水深无关。像与小鸟相距 3 m + 3 m = 6 m。'
        },
        {
          type: 'choice',
          q: '在探究平面镜成像的实验中，移去蜡烛 B，在它的位置放一个光屏，直接观察光屏，会发现',
          options: ['光屏上接不到蜡烛 A 的像，说明平面镜成虚像', '光屏上能看到倒立的像', '光屏上能看到正立的像', '光屏上接不到像，是因为像太暗了'],
          answer: 0,
          explain: '平面镜成像是反射光线的反向延长线会聚成的，像的位置并没有实际光线到达，所以光屏上接不到像，这说明平面镜成的是虚像。'
        },
        {
          type: 'choice',
          q: '在探究平面镜成像的实验中，选用两支完全相同的蜡烛，目的是',
          options: ['比较像与物的大小关系', '使玻璃板后面的像更亮', '检验像是虚像还是实像', '代替光屏来承接像'],
          answer: 0,
          explain: '未点燃的蜡烛 B 能和 A 的像完全重合，而 B 和 A 一模一样，说明像与物大小相等。检验虚像、实像要用光屏；像的亮度与蜡烛 B 无关。'
        },
        {
          type: 'choice',
          q: '实验中，如果玻璃板没有与桌面垂直，会出现的情况是',
          options: ['无论怎样移动蜡烛 B，都不能与 A 的像完全重合', '看不到蜡烛 A 的像', '蜡烛 A 的像变大', '蜡烛 A 成实像'],
          answer: 0,
          explain: '像与物关于镜面对称。玻璃板倾斜时，像会偏到桌面上方或下方，而蜡烛 B 立在桌面上，所以怎样移动都无法与像重合。像仍然能看到，仍是等大的虚像。'
        },
        {
          type: 'num',
          q: '小明站在竖直放置的平面镜前 3 m 处，以 0.5 m/s 的速度沿垂直镜面的方向走向平面镜。2 s 后，他与自己的像之间的距离是多少米？',
          answer: 4, unit: 'm',
          explain: '2 s 内走了 0.5 m/s × 2 s = 1 m，这时他到镜面的距离为 3 m − 1 m = 2 m，像到镜面也是 2 m，人与像相距 2 m + 2 m = 4 m。'
        },
        {
          type: 'fill',
          q: '平面镜所成的像是______像（填“实”或“虚”）。',
          answer: ['虚', '虚像'],
          explain: '平面镜成像是反射光线的反向延长线相交形成的，不是实际光线会聚而成，光屏接不到，所以是虚像。'
        },
        {
          type: 'choice',
          q: '下列四幅图中，正确画出物体（实线箭头）在平面镜中所成的像的是',
          options: [mirrorOpt(0), mirrorOpt(1), mirrorOpt(2), mirrorOpt(3)],
          answer: 0,
          explain: '平面镜成正立、等大的虚像，像与物关于镜面对称。正确的图中，像是正立的，到镜面距离与物体相同，并且用虚线画。像画成实线不符合虚像的作图规范；像离镜面比物体远，不满足等距；像倒立了也不对。'
        },
        {
          type: 'choice',
          q: '下列现象中，属于平面镜成像的是',
          options: ['平静的湖面上映出岸边树木的倒影', '树荫下地面上的圆形光斑', '阳光下人的影子', '雨后天空出现的彩虹'],
          answer: 0,
          explain: '平静的水面相当于平面镜，倒影是树木在水面所成的虚像。树荫下的圆形光斑是小孔成像，影子是光沿直线传播被挡住形成的，二者都属于光的直线传播；彩虹是光的色散。'
        },
        {
          type: 'num',
          q: '检查视力时，要求人与视力表的像相距 5 m。视力表挂在平面镜正对面的墙上，到平面镜的距离为 3 m，人面向平面镜坐在视力表前方。人到平面镜的距离应为多少米？',
          answer: 2, unit: 'm',
          explain: '视力表的像在镜后 3 m 处。设人到镜面的距离为 <span class="v">x</span>，则 <span class="v">x</span> + 3 m = 5 m，得 <span class="v">x</span> = 2 m（即人坐在视力表前方 1 m 处）。'
        },
        {
          type: 'choice',
          q: '小丽沿垂直镜面的方向远离竖直放置的平面镜，在这个过程中，她在镜中的像',
          options: ['大小不变，像到镜面的距离变大', '变小，像到镜面的距离变大', '大小不变，像到镜面的距离不变', '变大，像到镜面的距离变小'],
          answer: 0,
          explain: '平面镜成像，像与物大小相等，人的大小不变，像的大小就不变；觉得像变小只是因为离得远、视角变小。像距等于物距，人远离镜面，像也远离镜面。'
        },
        {
          type: 'num',
          q: '身高 1.6 m 的小芳站在竖直放置的平面镜前 2 m 处，她在镜中的像高多少米？',
          answer: 1.6, unit: 'm',
          explain: '平面镜所成的像与物体大小相等，像高等于人高 1.6 m，与人到镜面的距离 2 m 无关。'
        },
        {
          type: 'choice',
          q: '救护车车头上的“AMBULANCE”字样常常是左右反着写的，这样做是为了',
          options: ['让前方车辆的司机从后视镜中看到正写的字', '让路边的行人看到正写的字', '让救护车司机自己看到正写的字', '让字在夜间更明亮'],
          answer: 0,
          explain: '平面镜成的像与物体关于镜面对称，左右相反。反写的字经后视镜（平面镜）成像后又被左右反过来，前车司机在后视镜里看到的就是正写的字，便于及时让行。'
        },
        {
          type: 'choice',
          q: '小明从平面镜中看到身后墙上一只指针式时钟的像，像中时针指向“3”、分针指向“12”。实际的时间是',
          options: ['9:00', '3:00', '6:00', '12:00'],
          answer: 0,
          explain: '像与钟关于镜面对称，左右相反，竖直方向不变。像中分针指向 12（竖直向上），实际也指向 12；像中时针指向右边的 3，实际指向左边的 9，所以实际时间是 9:00。'
        },
        {
          type: 'choice',
          q: '平面镜所成像的性质是',
          options: ['正立、等大的虚像', '倒立、等大的实像', '正立、缩小的虚像', '倒立、等大的虚像'],
          answer: 0,
          explain: '平面镜成像的特点：像与物大小相等、正立、是虚像，像与物关于镜面对称。'
        },
        {
          type: 'choice',
          q: '关于平面镜所成的虚像，下列说法正确的是',
          options: ['虚像是反射光线的反向延长线相交形成的', '虚像是实际光线会聚而成的', '虚像能用光屏承接', '人眼看不到虚像'],
          answer: 0,
          explain: '平面镜成像时，镜后并没有实际光线，像点只是反射光线反向延长线的交点，所以是虚像，光屏接不到。但反射光线能进入人眼，所以人眼能看到虚像。'
        },
        {
          type: 'fill',
          q: '画平面镜成像光路图时，反射光线的反向延长线和所成的像都要用______线画。',
          answer: ['虚', '虚线'],
          explain: '反向延长线上没有真实的光，像也不是实际光线会聚成的，作图时都画成虚线；只有真实的光线才画实线并标箭头。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '实验中用薄玻璃板代替平面镜，主要目的是',
          options: ['既能看到 A 的像，又能看到后面的 B，便于确定像的位置', '玻璃板反射的光更多，像更亮', '玻璃板能成实像，便于用光屏承接', '使像比蜡烛 A 大一些，便于观察'],
          answer: 0,
          explain: '玻璃板透明，在玻璃板前既能看到 A 的像，又能透过玻璃板看到 B，移动 B 与像重合就确定了像的位置。玻璃板反射的光比镜子少，像反而暗一些；玻璃板成的仍是等大的虚像。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '实验中选用“薄”玻璃板而不用厚玻璃板，原因是',
          options: ['厚玻璃板前后两个面各成一个像，出现重影，不便于确定像的位置', '厚玻璃板不透明，看不到蜡烛 B', '厚玻璃板成的像比物体大', '厚玻璃板成实像'],
          answer: 0,
          explain: '玻璃板的两个面都会反射成像，厚玻璃板的两个像相距较远，看到重影，无法准确确定像的位置。厚玻璃板仍然透明，成的也是等大的虚像。'
        },
        {
          type: 'fill',
          passage: 'p1',
          q: '分析表中数据可以得出：像到平面镜的距离______物体到平面镜的距离。',
          answer: ['等于', '相等'],
          explain: '三次实验中 B（即 A 的像）到玻璃板的距离都和 A 到玻璃板的距离相同，说明像距等于物距。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '实验中用刻度尺的作用是',
          options: ['测量像和物到玻璃板的距离，比较它们的关系', '测量像和物的高度，比较它们的大小', '检验像是虚像还是实像', '确定玻璃板是否竖直'],
          answer: 0,
          explain: '刻度尺用来测量 A、B 到玻璃板的距离，即物距和像距。像与物的大小关系是用两支完全相同的蜡烛比较的，虚实是用光屏检验的。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '实验中改变蜡烛 A 的位置，多做了两次，目的是',
          options: ['使结论具有普遍性，避免偶然性', '求平均值，减小测量误差', '使像变得更清楚', '检验像的虚实'],
          answer: 0,
          explain: '这是探究规律的实验，改变物距多做几次，是为了得到普遍规律，避免一次实验的偶然性。它不是同一个量反复测量求平均值。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '为了使看到的像更清楚，实验最好在什么环境中进行',
          options: ['较暗的环境', '较亮的环境', '有阳光直射的环境', '任何环境效果都一样'],
          answer: 0,
          explain: '环境较暗时，点燃的蜡烛 A 与周围对比明显，A 的像更清楚；环境太亮，玻璃板后面的物体透过来的光会干扰观察。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '把蜡烛 A 向远离玻璃板的方向移动一段距离，A 的像将',
          options: ['远离玻璃板，大小不变', '远离玻璃板，变小', '靠近玻璃板，大小不变', '靠近玻璃板，变大'],
          answer: 0,
          explain: '像距等于物距，A 远离玻璃板，像也远离玻璃板；像与物大小相等，A 的大小不变，像的大小也不变。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '移去蜡烛 B，在原来 B 的位置放一个光屏，用来检验像的虚实。观察时应该',
          options: ['在玻璃板后面直接观察光屏', '在蜡烛 A 一侧透过玻璃板观察光屏', '在任意一侧观察都可以', '把光屏贴在玻璃板上观察'],
          answer: 0,
          explain: '透过玻璃板看光屏，看到的仍是 A 经玻璃板反射成的虚像，会误以为光屏上有像。应在玻璃板后面直接看光屏，光屏上没有像，说明平面镜成虚像。'
        },
        {
          type: 'choice',
          q: '探究平面镜成像时，如果玻璃板上端向蜡烛 A 一侧倾斜，那么 A 的像与桌面上的蜡烛 B 相比',
          options: ['像偏高，B 无法与像重合', '像偏低，B 无法与像重合', '像的位置不变，B 仍能与像重合', '像变大，B 无法与像重合'],
          answer: 0,
          explain: '像与物关于镜面对称。玻璃板上端向 A 倾斜时，A 关于玻璃板的对称点会偏到桌面上方，像偏高，B 立在桌面上无法与像重合。像的大小仍与 A 相等。'
        },
        {
          type: 'fill',
          q: '用对称法画物体 AB 在平面镜中的像时，物点与对应像点的连线 AA′ 与镜面______，并且 A、A′ 到镜面的距离相等。',
          answer: ['垂直', '互相垂直'],
          explain: '平面镜成像特点之一是像与物对应点的连线与镜面垂直，所以作图时要过物点作镜面的垂线，并画上垂直符号。'
        },
        {
          type: 'choice',
          q: '作“点光源 S 发出的光经平面镜反射后经过 P 点”的光路图（S′ 为像点，O 为入射点），下列画法正确的是',
          options: ['SO、OP 画实线并标箭头，S′O 画虚线', 'SO、OP、S′O 都画实线', 'SO 画虚线，OP 画实线', 'OP 画实线但不用标箭头'],
          answer: 0,
          explain: 'SO 是入射光线、OP 是反射光线，都是真实的光线，画实线并标出传播方向的箭头。S′O 是反射光线的反向延长线，没有真实的光，画虚线。'
        },
        {
          type: 'choice',
          q: '点光源 S 发出的两条光线射到平面镜上，它们的反射光线的反向延长线相交于一点，这个交点',
          options: ['在镜面后方，与 S 关于镜面对称', '在镜面前方，与 S 重合', '在镜面上', '位置随两条光线的选取而改变'],
          answer: 0,
          explain: 'S 发出的任意两条光线，反射光线的反向延长线都交于同一点，就是像点 S′。它在镜后，与 S 关于镜面对称，不随光线的选取而改变。'
        },
        {
          type: 'num',
          q: '小明以 1 m/s 的速度沿垂直镜面的方向走向竖直放置的平面镜，他的像相对于他的速度是多少 m/s？',
          answer: 2, unit: 'm/s',
          explain: '像与人关于镜面对称，人以 1 m/s 靠近镜面，像也以 1 m/s 靠近镜面，二者相向运动，人与像之间的距离每秒减少 2 m，所以像相对于人的速度是 2 m/s。'
        }
      ],
      practice: [
        {
          title: '作图：画出物体 AB 在平面镜中的像',
          prompt: `<p>根据平面镜成像的特点，画出物体 AB 在平面镜 MN 中所成的像 A′B′。</p>${practiceAB(false)}`,
          write: false,
          sample: practiceAB(true) + '<p>分别过 A、B 作镜面的垂线并延长，在镜后取 A′、B′，使它们到镜面的距离分别等于 A、B 到镜面的距离；用虚线连接 A′B′，在 A′ 处画箭头。</p>',
          checklist: ['A′、B′ 与 A、B 关于镜面对称（到镜面距离相等）', 'AA′、BB′ 连线用虚线，并标出垂直符号', '像 A′B′ 用虚线画，箭头方向与物体对应', '标出了字母 A′、B′']
        },
        {
          title: '作图：画出经过 P 点的反射光线',
          prompt: `<p>S 为点光源，它发出的一条光线经平面镜反射后恰好经过 P 点。请画出这条入射光线和反射光线。</p>${practiceSP(false)}`,
          write: false,
          sample: practiceSP(true) + '<p>先作 S 关于镜面的对称点 S′；连接 S′P，与镜面交于 O 点；连接 SO 为入射光线，OP 为反射光线。</p>',
          checklist: ['正确作出像点 S′（SS′ 垂直镜面，到镜面距离相等）', 'S′O 用虚线，SO、OP 用实线', '入射光线、反射光线都标了箭头，方向正确', '入射点 O 在 S′P 与镜面的交点上'],
          notes: '检验：过 O 点作法线，量一量入射角和反射角，它们应该相等。'
        }
      ]
    },

    /* ---------------- 密度及其测量 ---------------- */
    {
      id: 'p-density',
      title: '密度及其测量',
      short: '密度',
      module: 'matter',
      term: '8a',
      chapter: '第六章 质量与密度',
      freq: 3,
      keywords: '密度 ρ=m/V 天平 量筒 测密度 g/cm³ kg/m³ 排水法 误差分析 m-V图像',
      prereqs: ['p-mass'],
      tip: '密度计算和测密度实验每年必考：单位换算 1 g/cm³ = 1.0×10³ kg/m³；天平“左物右砝”、读数 = 砝码 + 游码；量筒视线与凹液面底部相平；误差分析要看先测质量还是先测体积。',
      learn: [
        {
          h: '什么是密度',
          html: `<p>取体积不同的几块铝，分别测出质量和体积：</p>
<table class="tbl"><tr><th>体积 V/cm³</th><th>质量 m/g</th><th>m/V（g/cm³）</th></tr>
<tr><td>10</td><td>27</td><td>2.7</td></tr><tr><td>20</td><td>54</td><td>2.7</td></tr><tr><td>30</td><td>81</td><td>2.7</td></tr></table>
<p>同一种物质，质量与体积的比值是<b>不变</b>的；换成铁，这个比值是 7.9 g/cm³，又是另一个定值。于是把这个比值叫作<b>密度</b>：</p>
<div class="formula">ρ = <span class="v">m</span> / <span class="v">V</span><span class="zh">（密度 = 质量 ÷ 体积）</span></div>
<p>变形：<span class="v">m</span> = ρ<span class="v">V</span>（求质量），<span class="v">V</span> = <span class="v">m</span>/ρ（求体积）。</p>
<div class="key">密度是物质的一种特性：同种物质（状态不变时）密度一定，与质量、体积无关。一杯水倒掉一半，剩下的水密度不变。</div>
<p class="warn">密度会随<b>状态和温度</b>改变：水结成冰，质量不变，密度从 1.0×10³ kg/m³ 变成 0.9×10³ kg/m³，体积变大——所以冬天水管会被冻裂。</p>
<table class="tbl"><tr><th>物质</th><th>密度 / (kg·m⁻³)</th><th>物质</th><th>密度 / (kg·m⁻³)</th></tr>
<tr><td>铁</td><td>7.9×10<sup>3</sup></td><td>水</td><td>1.0×10<sup>3</sup></td></tr>
<tr><td>铜</td><td>8.9×10<sup>3</sup></td><td>冰</td><td>0.9×10<sup>3</sup></td></tr>
<tr><td>铝</td><td>2.7×10<sup>3</sup></td><td>酒精、煤油</td><td>0.8×10<sup>3</sup></td></tr></table>`
        },
        {
          h: '单位换算：1 g/cm³ = 1.0×10³ kg/m³',
          html: `<p>密度的国际单位是 kg/m³，实验室常用 g/cm³。换算方法：</p>
<div class="formula">1 g/cm³ = 10⁻³ kg ÷ 10⁻⁶ m³ = 1.0×10³ kg/m³</div>
<div class="key">g/cm³ → kg/m³：乘 1000；　kg/m³ → g/cm³：除以 1000。<br>体积：1 mL = 1 cm³，1 L = 1 dm³ = 10⁻³ m³。</div>
<p>水的密度 1.0×10³ kg/m³ 表示：<b>体积为 1 m³ 的水，质量是 1.0×10³ kg</b>。</p>
<div class="steps"><p>已知：一瓶矿泉水 <span class="v">V</span> = 550 mL = 550 cm³，ρ<sub>水</sub> = 1.0 g/cm³</p>
<p>求：瓶中水的质量 <span class="v">m</span></p>
<p>解：<span class="v">m</span> = ρ<span class="v">V</span> = 1.0 g/cm³ × 550 cm³ = 550 g = 0.55 kg</p>
<p>答：瓶中水的质量是 0.55 kg。</p></div>
<p class="warn">代入公式前三个量的单位要配套：g、cm³、g/cm³ 一套，kg、m³、kg/m³ 一套，不能混用。</p>`
        },
        {
          h: 'm-V 图像',
          html: `<p>以体积为横轴、质量为纵轴，同一种物质画出来是一条<b>过原点的直线</b>。在直线上任取一点，读出 <span class="v">m</span> 和 <span class="v">V</span>，相除就是密度。几条直线放在一起比：<b>越陡（越靠近纵轴），密度越大</b>。</p>
<p>选不同材料，拖动体积滑块试一试：</p>
<div class="sim" data-sim="density"></div>
<p class="warn">读图时注意坐标单位：横轴是 cm³、纵轴是 g，算出来的是 g/cm³，题目要 kg/m³ 时再乘 1000。</p>`
        },
        {
          h: '用天平和量筒测密度',
          html: `<p><b>天平的使用</b>：① 放在水平台上，游码移到标尺左端零刻度线处；② 调节平衡螺母，使指针指在分度盘中央（指针<b>左偏右调</b>，右偏左调）；③ <b>左物右砝</b>，用镊子加减砝码，最后移动游码使横梁平衡（称量时不能再调平衡螺母）；④ 物体质量 = 砝码总质量 + 游码对应的刻度值（读游码<b>左边缘</b>）。</p>
<p><b>量筒的使用</b>：读数时视线要与凹液面的<b>底部</b>相平。俯视读数偏大，仰视读数偏小。</p>
<p><b>测小石块的密度</b>（先测质量，再测体积）：</p>
<ol><li>用天平测出石块的质量 <span class="v">m</span>；</li>
<li>在量筒中倒入适量的水，读出体积 <span class="v">V</span><sub>1</sub>；</li>
<li>用细线拴住石块，使它浸没在水中，读出总体积 <span class="v">V</span><sub>2</sub>；</li>
<li>ρ = <span class="v">m</span> / (<span class="v">V</span><sub>2</sub> − <span class="v">V</span><sub>1</sub>)。</li></ol>
${cylStepsFig()}
<p>“适量的水”是指：水要能把石块完全浸没，放入石块后水面又不能超过量筒的最大刻度。</p>
<p><b>测盐水的密度</b>（剩余法）：</p>
<ol><li>用天平测出烧杯和盐水的总质量 <span class="v">m</span><sub>1</sub>；</li>
<li>把烧杯中的一部分盐水倒入量筒，读出体积 <span class="v">V</span>；</li>
<li>测出烧杯和剩余盐水的总质量 <span class="v">m</span><sub>2</sub>；</li>
<li>ρ = (<span class="v">m</span><sub>1</sub> − <span class="v">m</span><sub>2</sub>) / <span class="v">V</span>。</li></ol>
<p>这样做，倒进量筒的盐水的质量和体积是“一一对应”的，烧杯壁上沾的盐水不会带来误差。</p>`
        },
        {
          h: '误差分析',
          html: `<p>判断方法：先找出哪个量（<span class="v">m</span> 还是 <span class="v">V</span>）测得不准，偏大还是偏小，再用 ρ = <span class="v">m</span>/<span class="v">V</span> 判断密度。</p>
<table class="tbl"><tr><th>操作</th><th>哪个量有偏差</th><th>测得的密度</th></tr>
<tr><td>测石块：先用量筒测体积，再取出石块直接测质量</td><td>石块上沾水，<span class="v">m</span> 偏大</td><td>偏大</td></tr>
<tr><td>测石块：石块会吸水（先测了质量）</td><td>水被吸进石块，<span class="v">V</span><sub>2</sub> 读数偏小，<span class="v">V</span> 偏小</td><td>偏大</td></tr>
<tr><td>测液体：先测空烧杯质量，再测烧杯和液体总质量，然后把液体<b>全部</b>倒入量筒</td><td>烧杯壁残留液体，<span class="v">V</span> 偏小</td><td>偏大</td></tr>
<tr><td>测液体体积时俯视读数</td><td><span class="v">V</span> 偏大</td><td>偏小</td></tr>
<tr><td>砝码磨损（实际质量比标的小）</td><td><span class="v">m</span> 偏大</td><td>偏大</td></tr>
<tr><td>砝码生锈（实际质量比标的大）</td><td><span class="v">m</span> 偏小</td><td>偏小</td></tr></table>
<div class="key">改进：测固体要先测质量、后测体积；测液体用“剩余法”。</div>`
        }
      ],
      examples: [
        {
          type: 'num',
          q: '一个空瓶的质量为 200 g，装满水后的总质量为 700 g；倒掉水后装满某种液体，总质量为 600 g。这种液体的密度是多少 kg/m³？（ρ<sub>水</sub> = 1.0×10³ kg/m³）',
          answer: 800, unit: 'kg/m³',
          explain: `<div class="steps"><p>已知：<span class="v">m</span><sub>瓶</sub> = 200 g，<span class="v">m</span><sub>水</sub> = 700 g − 200 g = 500 g，<span class="v">m</span><sub>液</sub> = 600 g − 200 g = 400 g</p>
<p>解：瓶的容积 <span class="v">V</span> = <span class="v">m</span><sub>水</sub>/ρ<sub>水</sub> = 500 g / 1.0 g/cm³ = 500 cm³</p>
<p>液体装满瓶子，<span class="v">V</span><sub>液</sub> = <span class="v">V</span> = 500 cm³</p>
<p>ρ<sub>液</sub> = <span class="v">m</span><sub>液</sub>/<span class="v">V</span><sub>液</sub> = 400 g / 500 cm³ = 0.8 g/cm³ = 0.8×10³ kg/m³</p>
<p>答：液体的密度是 0.8×10³ kg/m³。</p></div>
关键是“同一个瓶子装满，体积相同”，先用水求出瓶的容积。`
        },
        {
          type: 'num',
          q: `用天平和量筒测小石块的密度。天平平衡时，右盘中有 50 g 和 10 g 的砝码各一个，游码位置如图乙；量筒中放入石块前后的水面如图丙。石块的密度是多少 g/cm³？${rider(2.4)}${cylExFig()}`,
          answer: 2.6, unit: 'g/cm³', tol: 0.003,
          explain: `<div class="steps"><p>质量：标尺分度值是 0.2 g，游码左边缘对准 2.4 g，<span class="v">m</span> = 50 g + 10 g + 2.4 g = 62.4 g</p>
<p>体积：量筒分度值是 2 mL，放石块前 <span class="v">V</span><sub>1</sub> = 20 mL，放石块后 <span class="v">V</span><sub>2</sub> = 44 mL，<span class="v">V</span> = 44 mL − 20 mL = 24 mL = 24 cm³</p>
<p>密度：ρ = <span class="v">m</span>/<span class="v">V</span> = 62.4 g / 24 cm³ = 2.6 g/cm³</p></div>
<p class="warn">两个常见失误：游码读成右边缘；忘了先看分度值（标尺 0.2 g、量筒 2 mL）。</p>`
        },
        {
          type: 'choice',
          q: '小明测小石块的密度时，先用量筒和水测出石块的体积，再把石块从水中取出，直接放在天平上测质量。这样测得的密度',
          options: ['偏大，因为石块上沾有水，测得的质量偏大', '偏小，因为石块上沾有水，测得的质量偏大', '偏大，因为测得的体积偏大', '准确，因为石块的质量和体积都没有变'],
          answer: 0,
          explain: '石块从水里取出时表面沾着水，测得的质量比石块的真实质量大，而体积测得是准确的。由 ρ = <span class="v">m</span>/<span class="v">V</span> 可知，<span class="v">m</span> 偏大，密度偏大。正确做法是先测质量，再测体积。'
        },
        {
          type: 'choice',
          q: '一块铁块被锻打成薄铁片（不计损耗），它的质量和密度变化情况是',
          options: ['质量不变，密度不变', '质量不变，密度变小', '质量变小，密度不变', '质量变大，密度变大'],
          answer: 0,
          explain: '质量是物体所含物质的多少，形状改变时质量不变。密度是物质的一种特性，铁还是铁、状态没变，密度也不变。体积跟着质量算：<span class="v">V</span> = <span class="v">m</span>/ρ，同样不变，只是形状变了。'
        },
        {
          type: 'choice',
          q: '铜的密度是 8.9×10³ kg/m³，它表示',
          options: ['体积为 1 m³ 的铜，质量是 8.9×10³ kg', '质量为 1 kg 的铜，体积是 8.9×10³ m³', '铜的质量是 8.9×10³ kg', '体积为 1 m³ 的铜，密度是 8.9×10³ kg'],
          answer: 0,
          explain: '密度在数值上等于单位体积某种物质的质量。8.9×10³ kg/m³ 就是 1 m³ 的铜质量为 8.9×10³ kg。1 kg 铜的体积只有约 1.1×10⁻⁴ m³；密度的单位是 kg/m³，不是 kg。'
        },
        {
          type: 'num',
          q: '一块花岗岩纪念碑的体积是 2 m³，花岗岩的密度是 2.6×10³ kg/m³。这块纪念碑的质量是多少吨？',
          answer: 5.2, unit: 't',
          explain: `<div class="steps"><p>已知：<span class="v">V</span> = 2 m³，ρ = 2.6×10³ kg/m³</p><p>求：质量 <span class="v">m</span></p>
<p>解：<span class="v">m</span> = ρ<span class="v">V</span> = 2.6×10³ kg/m³ × 2 m³ = 5.2×10³ kg = 5.2 t</p><p>答：纪念碑的质量是 5.2 t。</p></div>
大物体不方便直接称质量，可以测出体积、查出密度，用 <span class="v">m</span> = ρ<span class="v">V</span> 算出来。`
        },
        {
          type: 'num',
          q: '一桶食用油的体积是 5 L，食用油的密度是 0.9×10³ kg/m³。这桶油的质量是多少千克？',
          answer: 4.5, unit: 'kg',
          explain: `<div class="steps"><p>已知：<span class="v">V</span> = 5 L = 5 dm³ = 5×10⁻³ m³，ρ = 0.9×10³ kg/m³</p><p>求：质量 <span class="v">m</span></p>
<p>解：<span class="v">m</span> = ρ<span class="v">V</span> = 0.9×10³ kg/m³ × 5×10⁻³ m³ = 4.5 kg</p><p>答：这桶油的质量是 4.5 kg。</p></div>
也可以用另一套单位：0.9×10³ kg/m³ = 0.9 g/cm³，5 L = 5000 cm³，<span class="v">m</span> = 0.9 g/cm³ × 5000 cm³ = 4500 g = 4.5 kg。`
        },
        {
          type: 'num',
          q: '一个容积为 500 mL 的玻璃瓶装满水，放进冰箱冷冻，水全部结成冰后，冰的体积是多少 cm³？（ρ<sub>水</sub> = 1.0 g/cm³，ρ<sub>冰</sub> = 0.9 g/cm³，结果保留一位小数）',
          answer: 555.6, unit: 'cm³', tol: 0.002,
          explain: `<div class="steps"><p>已知：<span class="v">V</span><sub>水</sub> = 500 mL = 500 cm³，ρ<sub>水</sub> = 1.0 g/cm³，ρ<sub>冰</sub> = 0.9 g/cm³</p><p>求：冰的体积 <span class="v">V</span><sub>冰</sub></p>
<p>解：<span class="v">m</span><sub>水</sub> = ρ<sub>水</sub><span class="v">V</span><sub>水</sub> = 1.0 g/cm³ × 500 cm³ = 500 g</p>
<p>水结成冰，质量不变：<span class="v">m</span><sub>冰</sub> = 500 g，<span class="v">V</span><sub>冰</sub> = <span class="v">m</span><sub>冰</sub>/ρ<sub>冰</sub> = 500 g / 0.9 g/cm³ ≈ 555.6 cm³</p>
<p>答：冰的体积约为 555.6 cm³。</p></div>
冰的体积比瓶子的容积大约 55.6 cm³，所以装满水的玻璃瓶冷冻后会被胀破。`
        },
        {
          type: 'choice',
          q: `甲、乙两种物质的 m-V 图像如图所示。用甲、乙两种物质分别制成质量相等的实心物体，它们的体积之比 <span class="v">V</span><sub>甲</sub>∶<span class="v">V</span><sub>乙</sub> 为${mvTestFig()}`,
          options: ['1∶4', '4∶1', '1∶2', '2∶1'],
          answer: 0,
          explain: '从图上读点：ρ<sub>甲</sub> = 40 g / 20 cm³ = 2 g/cm³，ρ<sub>乙</sub> = 20 g / 40 cm³ = 0.5 g/cm³。质量相等时，<span class="v">V</span> = <span class="v">m</span>/ρ，体积与密度成反比，<span class="v">V</span><sub>甲</sub>∶<span class="v">V</span><sub>乙</sub> = ρ<sub>乙</sub>∶ρ<sub>甲</sub> = 0.5∶2 = 1∶4。也可以在图上画一条水平线（如 <span class="v">m</span> = 20 g）：甲对应 10 cm³，乙对应 40 cm³。'
        },
        {
          type: 'choice',
          q: '用天平称物体质量时，向右盘加入最小的砝码后，指针偏向分度盘中线的右侧；取下这个最小砝码后，指针又偏向左侧。接下来应该',
          options: ['取下最小砝码，向右移动游码，直到横梁平衡', '向左调节平衡螺母，直到横梁平衡', '保留最小砝码，向右移动游码', '保留最小砝码，向右调节平衡螺母'],
          answer: 0,
          explain: '加上最小砝码右边偏重，取下后左边偏重，说明物体质量介于两者之间，差的那一点要用游码来补：取下最小砝码，向右移动游码直到平衡。称量过程中不能再调节平衡螺母。'
        },
        {
          type: 'num',
          q: '用天平和量筒测酸奶的密度：先测出烧杯和酸奶的总质量为 123.2 g；把烧杯中的一部分酸奶倒入量筒，读出体积为 40 mL；再测出烧杯和剩余酸奶的总质量为 75.2 g。酸奶的密度是多少 g/cm³？',
          answer: 1.2, unit: 'g/cm³',
          explain: `<div class="steps"><p>已知：<span class="v">m</span><sub>1</sub> = 123.2 g，<span class="v">m</span><sub>2</sub> = 75.2 g，<span class="v">V</span> = 40 mL = 40 cm³</p><p>求：酸奶的密度 ρ</p>
<p>解：倒入量筒中酸奶的质量 <span class="v">m</span> = <span class="v">m</span><sub>1</sub> − <span class="v">m</span><sub>2</sub> = 123.2 g − 75.2 g = 48 g</p>
<p>ρ = <span class="v">m</span>/<span class="v">V</span> = 48 g / 40 cm³ = 1.2 g/cm³</p><p>答：酸奶的密度是 1.2 g/cm³。</p></div>
这就是“剩余法”：量筒里那部分酸奶的质量（两次称量之差）和体积正好对应，烧杯壁上残留的酸奶不影响结果。`
        },
        {
          type: 'num',
          q: '一个铜球的质量是 178 g，体积是 40 cm³（ρ<sub>铜</sub> = 8.9 g/cm³）。这个铜球是空心的，若在空心部分注满水，球的总质量是多少克？（ρ<sub>水</sub> = 1.0 g/cm³）',
          answer: 198, unit: 'g',
          explain: `<div class="steps"><p>已知：<span class="v">m</span><sub>球</sub> = 178 g，<span class="v">V</span><sub>球</sub> = 40 cm³，ρ<sub>铜</sub> = 8.9 g/cm³，ρ<sub>水</sub> = 1.0 g/cm³</p><p>求：注满水后的总质量 <span class="v">m</span><sub>总</sub></p>
<p>解：178 g 铜的体积 <span class="v">V</span><sub>铜</sub> = <span class="v">m</span>/ρ<sub>铜</sub> = 178 g / 8.9 g/cm³ = 20 cm³ &lt; 40 cm³，所以球是空心的</p>
<p>空心部分体积 <span class="v">V</span><sub>空</sub> = 40 cm³ − 20 cm³ = 20 cm³</p>
<p>注入水的质量 <span class="v">m</span><sub>水</sub> = ρ<sub>水</sub><span class="v">V</span><sub>空</sub> = 1.0 g/cm³ × 20 cm³ = 20 g</p>
<p><span class="v">m</span><sub>总</sub> = 178 g + 20 g = 198 g</p><p>答：注满水后球的总质量是 198 g。</p></div>
判断空心也可以比密度：178 g / 40 cm³ = 4.45 g/cm³ &lt; 8.9 g/cm³；但要求空心体积，还是比体积最方便。`
        }
      ],
      passages: {
        p1: {
          title: '实验：测量盐水的密度',
          html: `<p>小林用天平和量筒测量盐水的密度，步骤如下：</p>
<p>① 把天平放在水平台上，游码归零，调节平衡螺母使横梁平衡；<br>
② 用天平测出烧杯和盐水的总质量 <span class="v">m</span><sub>1</sub> = 116 g；<br>
③ 把烧杯中的一部分盐水倒入量筒，读出量筒中盐水的体积 <span class="v">V</span> = 40 cm³；<br>
④ 用天平测出烧杯和剩余盐水的总质量 <span class="v">m</span><sub>2</sub> = 72 g。</p>`
        }
      },
      tests: [
        {
          type: 'choice',
          q: '关于密度，下列说法正确的是',
          options: ['同种物质（状态不变）的密度与它的质量、体积无关', '物体的质量越大，密度越大', '一杯水倒掉一半，剩下水的密度变为原来的一半', '物体的体积越大，密度越小'],
          answer: 0,
          explain: '密度是物质的一种特性，同种物质在状态、温度不变时密度一定，跟质量多少、体积大小无关。一杯水倒掉一半，质量和体积都减半，比值不变，密度不变。'
        },
        {
          type: 'num',
          q: '铝的密度是 2.7 g/cm³，合多少 kg/m³？',
          answer: 2700, unit: 'kg/m³',
          explain: '1 g/cm³ = 1.0×10³ kg/m³，所以 2.7 g/cm³ = 2.7×10³ kg/m³ = 2700 kg/m³。'
        },
        {
          type: 'fill',
          q: '水的密度是 1.0×10³ kg/m³，它表示体积为 1 m³ 的水的______是 1.0×10³ kg。',
          answer: ['质量'],
          explain: '密度是单位体积某种物质的质量。1.0×10³ kg/m³ 表示 1 m³ 的水的质量是 1.0×10³ kg。'
        },
        {
          type: 'num',
          q: '质量为 900 g 的水完全结成冰后，体积增大了多少 cm³？（ρ<sub>水</sub> = 1.0 g/cm³，ρ<sub>冰</sub> = 0.9 g/cm³）',
          answer: 100, unit: 'cm³',
          explain: '水结成冰，质量不变，<span class="v">m</span><sub>冰</sub> = 900 g。<span class="v">V</span><sub>水</sub> = 900 g / 1.0 g/cm³ = 900 cm³，<span class="v">V</span><sub>冰</sub> = 900 g / 0.9 g/cm³ = 1000 cm³，体积增大 1000 cm³ − 900 cm³ = 100 cm³。'
        },
        {
          type: 'choice',
          q: `甲、乙两种物质的 m-V 图像如图所示。下列说法正确的是${mvTestFig()}`,
          options: ['ρ<sub>甲</sub>∶ρ<sub>乙</sub> = 4∶1', 'ρ<sub>甲</sub>∶ρ<sub>乙</sub> = 2∶1', '乙的密度大于甲的密度', '体积相同时，乙的质量较大'],
          answer: 0,
          explain: '从图上读点：ρ<sub>甲</sub> = 40 g / 20 cm³ = 2 g/cm³，ρ<sub>乙</sub> = 20 g / 40 cm³ = 0.5 g/cm³，所以 ρ<sub>甲</sub>∶ρ<sub>乙</sub> = 4∶1，甲的密度大。体积相同时，密度大的甲质量较大。'
        },
        {
          type: 'num',
          q: '一个铝球的质量是 54 g，体积是 30 cm³。已知 ρ<sub>铝</sub> = 2.7×10³ kg/m³，这个铝球是空心的，空心部分的体积是多少 cm³？',
          answer: 10, unit: 'cm³',
          explain: 'ρ<sub>铝</sub> = 2.7×10³ kg/m³ = 2.7 g/cm³。54 g 铝的实际体积 <span class="v">V</span><sub>铝</sub> = <span class="v">m</span>/ρ = 54 g / 2.7 g/cm³ = 20 cm³，小于球的体积 30 cm³，所以是空心的，空心部分体积 = 30 cm³ − 20 cm³ = 10 cm³。'
        },
        {
          type: 'choice',
          q: '用量筒测液体的体积，下列说法正确的是',
          options: ['俯视读数，读出的体积偏大', '仰视读数，读出的体积偏大', '视线应与凹液面的最高处相平', '读数时可以把量筒举起来，举到与眼睛一样高'],
          answer: 0,
          explain: '读数时量筒要放在水平桌面上，视线与凹液面的底部相平。俯视时视线斜向下，读到的刻度在液面上方，读数偏大；仰视时读数偏小。'
        },
        {
          type: 'choice',
          q: '使用天平前调节横梁平衡时（盘中还没有放物体），发现指针偏向分度盘中线的左侧，应该',
          options: ['向右调节平衡螺母', '向左调节平衡螺母', '向右移动游码', '在右盘中添加砝码'],
          answer: 0,
          explain: '指针左偏说明左边重，应把平衡螺母向右调（左偏右调）。游码和砝码是称量物体时才用的，调节横梁平衡时游码要放在零刻度线处。'
        },
        {
          type: 'num',
          passage: 'p1',
          q: '根据小林的数据，盐水的密度是多少 g/cm³？',
          answer: 1.1, unit: 'g/cm³',
          explain: '倒入量筒中盐水的质量 <span class="v">m</span> = <span class="v">m</span><sub>1</sub> − <span class="v">m</span><sub>2</sub> = 116 g − 72 g = 44 g，ρ = <span class="v">m</span>/<span class="v">V</span> = 44 g / 40 cm³ = 1.1 g/cm³。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '小东设计了另一种方案：先测出空烧杯的质量，再倒入盐水测出烧杯和盐水的总质量，然后把烧杯中的盐水全部倒入量筒测体积。按这个方案测得的盐水密度会',
          options: ['偏大，因为烧杯内壁沾有盐水，测得的体积偏小', '偏小，因为烧杯内壁沾有盐水，测得的体积偏小', '偏大，因为测得的质量偏大', '不受影响'],
          answer: 0,
          explain: '盐水不可能全部倒干净，烧杯内壁会沾一些，量筒里的盐水比称的盐水少，测得的体积偏小，而质量是准确的。由 ρ = <span class="v">m</span>/<span class="v">V</span> 可知，密度偏大。小林的“剩余法”可以避免这个误差。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '按小林的步骤操作，烧杯内壁沾有的盐水对测量结果的影响是',
          options: ['没有影响，因为算出的质量正好是倒入量筒中那部分盐水的质量', '使密度偏大，因为测得的体积偏小', '使密度偏小，因为测得的质量偏小', '使密度偏大，因为测得的质量偏大'],
          answer: 0,
          explain: '小林用 <span class="v">m</span><sub>1</sub> − <span class="v">m</span><sub>2</sub> 求出的是倒进量筒那部分盐水的质量，量筒读出的也是这部分盐水的体积，二者一一对应。烧杯壁上沾的盐水在两次称量中都包含在内，相减后抵消，不影响结果。'
        },
        {
          type: 'choice',
          passage: 'p1',
          q: '小林在读量筒中盐水的体积时，如果俯视读数，测得的盐水密度会',
          options: ['偏小', '偏大', '不变', '无法判断'],
          answer: 0,
          explain: '俯视读数，读出的体积比真实体积大，而质量是准确的，由 ρ = <span class="v">m</span>/<span class="v">V</span> 可知，测得的密度偏小。'
        },
        {
          type: 'choice',
          q: '下列情况中，物质的密度发生了变化的是',
          options: ['钢瓶中的氧气用掉一半', '一块橡皮用掉一半', '一杯牛奶喝掉一半', '一根铁丝剪掉一半'],
          answer: 0,
          explain: '橡皮、牛奶、铁丝用掉一部分，质量和体积按比例减少，密度不变。钢瓶中的氧气用掉一半，质量减半，但剩下的气体仍然充满整个钢瓶，体积不变，所以密度变为原来的一半。'
        },
        {
          type: 'fill',
          q: '同种物质在状态、温度不变时，质量与体积的比值是一定的，说明密度是物质的一种______。',
          answer: ['特性'],
          explain: '密度反映的是物质本身的性质，不同物质密度一般不同，同种物质（状态、温度不变）密度一定，与质量、体积无关，所以说密度是物质的一种特性。'
        },
        {
          type: 'choice',
          q: '冰的密度是 0.9×10³ kg/m³，它表示',
          options: ['体积为 1 m³ 的冰，质量是 0.9×10³ kg', '质量为 1 kg 的冰，体积是 0.9×10³ m³', '体积为 1 m³ 的冰，密度是 0.9×10³ kg', '冰的质量是 0.9×10³ kg'],
          answer: 0,
          explain: '密度在数值上等于单位体积某种物质的质量，0.9×10³ kg/m³ 表示 1 m³ 的冰质量为 0.9×10³ kg。'
        },
        {
          type: 'num',
          q: '一个实心铁块的质量是 158 g，铁的密度是 7.9 g/cm³。这个铁块的体积是多少 cm³？',
          answer: 20, unit: 'cm³',
          explain: '<span class="v">V</span> = <span class="v">m</span>/ρ = 158 g / 7.9 g/cm³ = 20 cm³。'
        },
        {
          type: 'num',
          q: '一间教室长 9 m、宽 6 m、高 3.5 m，空气的密度是 1.29 kg/m³。教室里空气的质量约是多少千克？（结果保留整数）',
          answer: 244, unit: 'kg', tol: 0.003,
          explain: '教室的容积 <span class="v">V</span> = 9 m × 6 m × 3.5 m = 189 m³，空气的质量 <span class="v">m</span> = ρ<span class="v">V</span> = 1.29 kg/m³ × 189 m³ ≈ 244 kg。空气虽然“轻”，一间教室的空气也有两百多千克。'
        },
        {
          type: 'choice',
          q: '寒冷的冬天，室外的自来水管容易被冻裂，主要原因是',
          options: ['水结冰后质量不变，密度变小，体积变大', '水结冰后质量变大，体积变大', '水结冰后密度变大，体积变大', '水管遇冷收缩，被挤破'],
          answer: 0,
          explain: '水结成冰，质量不变，密度从 1.0×10³ kg/m³ 变为 0.9×10³ kg/m³，由 <span class="v">V</span> = <span class="v">m</span>/ρ 可知体积变大，把水管胀裂。'
        },
        {
          type: 'num',
          q: '体积为 1 m³ 的冰完全熔化成水后，水的体积是多少 m³？（ρ<sub>冰</sub> = 0.9×10³ kg/m³，ρ<sub>水</sub> = 1.0×10³ kg/m³）',
          answer: 0.9, unit: 'm³',
          explain: '<span class="v">m</span><sub>冰</sub> = ρ<sub>冰</sub><span class="v">V</span><sub>冰</sub> = 0.9×10³ kg/m³ × 1 m³ = 900 kg。冰熔化成水质量不变，<span class="v">V</span><sub>水</sub> = <span class="v">m</span>/ρ<sub>水</sub> = 900 kg / (1.0×10³ kg/m³) = 0.9 m³。'
        },
        {
          type: 'choice',
          q: '质量相等的实心铜球、铁球和铝球（ρ<sub>铜</sub> &gt; ρ<sub>铁</sub> &gt; ρ<sub>铝</sub>），体积最大的是',
          options: ['铝球', '铁球', '铜球', '三个球一样大'],
          answer: 0,
          explain: '质量相等时，<span class="v">V</span> = <span class="v">m</span>/ρ，密度越小体积越大。铝的密度最小，所以铝球体积最大。'
        },
        {
          type: 'choice',
          q: '一个瓶子最多能装下 1 kg 的水，用它一定能装下 1 kg 的',
          options: ['盐水', '酒精', '煤油', '植物油'],
          answer: 0,
          explain: '瓶子的容积等于 1 kg 水的体积。质量相同时，密度越大体积越小。盐水的密度比水大，1 kg 盐水的体积比 1 kg 水小，一定装得下；酒精、煤油、植物油的密度都比水小，1 kg 的体积比瓶子容积大，装不下。'
        },
        {
          type: 'num',
          q: '酒精的密度是 0.8×10³ kg/m³，合多少 g/cm³？',
          answer: 0.8, unit: 'g/cm³',
          explain: 'kg/m³ 换成 g/cm³ 要除以 1000：0.8×10³ kg/m³ = 800 kg/m³ = 800 ÷ 1000 g/cm³ = 0.8 g/cm³。'
        },
        {
          type: 'num',
          q: '一个饮料瓶的容积是 1.5 L，合多少 m³？（用小数填写）',
          answer: 0.0015, unit: 'm³',
          explain: '1 L = 1 dm³ = 10⁻³ m³，所以 1.5 L = 1.5×10⁻³ m³ = 0.0015 m³。'
        },
        {
          type: 'num',
          q: `甲、乙两种物质的 m-V 图像如图所示。体积为 60 cm³ 的乙物质，质量是多少克？${mvTestFig()}`,
          answer: 30, unit: 'g',
          explain: '由图读点：乙体积为 40 cm³ 时质量为 20 g，ρ<sub>乙</sub> = 20 g / 40 cm³ = 0.5 g/cm³。60 cm³ 乙物质的质量 <span class="v">m</span> = ρ<span class="v">V</span> = 0.5 g/cm³ × 60 cm³ = 30 g。'
        },
        {
          type: 'choice',
          q: '同种物质的 m-V 图像是一条过原点的倾斜直线，这说明',
          options: ['同种物质的质量与体积成正比', '同种物质的密度与质量成正比', '同种物质的密度与体积成反比', '同种物质的质量与体积成反比'],
          answer: 0,
          explain: '过原点的直线表示 <span class="v">m</span> 与 <span class="v">V</span> 成正比，比值 <span class="v">m</span>/<span class="v">V</span>（即密度）是定值。密度与质量、体积无关，不能说成正比或反比。'
        },
        {
          type: 'choice',
          q: '用已调好的天平称量物体质量时，发现指针偏向分度盘中线的左侧，接下来应该',
          options: ['向右盘加砝码或向右移动游码', '向右调节平衡螺母', '向左调节平衡螺母', '从右盘中取下砝码'],
          answer: 0,
          explain: '称量时指针左偏，说明左盘的物体比右盘的砝码重，应该加砝码或向右移动游码。平衡螺母只在称量前调节横梁平衡时使用，称量过程中不能再动。'
        },
        {
          type: 'num',
          q: `用天平称物体的质量，天平平衡时右盘中有 20 g、5 g 的砝码各一个，游码在标尺上的位置如图乙所示。物体的质量是多少克？${rider(3.2)}`,
          answer: 28.2, unit: 'g', tol: 0.003,
          explain: '标尺的分度值是 0.2 g，游码左边缘对准 3.2 g。物体质量 = 砝码总质量 + 游码对应的刻度值 = 20 g + 5 g + 3.2 g = 28.2 g。'
        },
        {
          type: 'choice',
          q: '关于天平的使用，下列做法正确的是',
          options: ['用镊子夹取砝码，按“左物右砝”放置', '用手直接拿取砝码', '把物体放在右盘，砝码放在左盘', '称量过程中调节平衡螺母使横梁平衡'],
          answer: 0,
          explain: '砝码要用镊子夹取，手上的汗渍会使砝码生锈；称量时物体放左盘、砝码放右盘；平衡螺母只在称量前调节，称量时用加减砝码和移动游码使横梁平衡。'
        },
        {
          type: 'num',
          q: `如图所示，量筒中水的体积是多少 mL？${F.svg(160, 230, cyl(60, 40, 40, 160, 50, 36, { minor: 2, num: 10 }))}`,
          answer: 36, unit: 'mL',
          explain: '先看分度值：10 mL 之间分成 5 小格，每小格 2 mL。液面在 30 mL 上方第 3 小格处，读数为 30 mL + 3 × 2 mL = 36 mL。读数时视线要与凹液面的底部相平。'
        },
        {
          type: 'choice',
          q: '用量筒量取液体时，仰视读数为 30 mL，则量筒内液体的实际体积',
          options: ['大于 30 mL', '小于 30 mL', '等于 30 mL', '无法确定'],
          answer: 0,
          explain: '仰视时视线斜向上，读到的刻度在凹液面底部的下方，读数偏小，所以实际体积比 30 mL 大。'
        },
        {
          type: 'choice',
          q: '用量筒和水测小石块的体积时，先在量筒中倒入“适量”的水。“适量”是指',
          options: ['水能浸没石块，且放入石块后水面不超过量筒的最大刻度', '水越多越好', '水面刚好到量筒的一半', '水的体积等于石块的体积'],
          answer: 0,
          explain: '水太少，石块不能完全浸没，测出的体积偏小；水太多，放入石块后水面超过最大刻度，无法读数。'
        },
        {
          type: 'choice',
          q: '用天平、量筒和水测小石块的密度，下列步骤顺序最合理的是：① 量筒中倒入适量水，读出体积 <span class="v">V</span><sub>1</sub>；② 用天平测出石块质量 <span class="v">m</span>；③ 用细线拴住石块浸没在水中，读出总体积 <span class="v">V</span><sub>2</sub>；④ 计算密度',
          options: ['①③②④', '②①③④', '②③①④', '③①②④'],
          answer: 1, fixed: true,
          explain: '应先测质量，再用排水法测体积。如果先测体积，石块从水中取出后会沾水，再测质量就偏大，密度偏大。'
        },
        {
          type: 'num',
          q: '用天平和量筒测某金属块的密度：金属块的质量是 54 g；量筒中原有水 30 mL，用细线拴住金属块浸没后水面到达 50 mL。金属块的密度是多少 kg/m³？',
          answer: 2700, unit: 'kg/m³',
          explain: '<span class="v">V</span> = 50 mL − 30 mL = 20 mL = 20 cm³，ρ = <span class="v">m</span>/<span class="v">V</span> = 54 g / 20 cm³ = 2.7 g/cm³ = 2.7×10³ kg/m³。'
        },
        {
          type: 'choice',
          q: '测石块密度时，如果所用的砝码磨损了（实际质量比标注的小），测得的石块密度会',
          options: ['偏大', '偏小', '不变', '无法判断'],
          answer: 0,
          explain: '砝码磨损后实际质量变小，要放更多（标注值更大）的砝码才能平衡，读出的质量比真实质量大，体积准确，所以密度偏大。'
        },
        {
          type: 'choice',
          q: '小明先用天平测出一块吸水性很强的石块的质量，再用排水法测它的体积。这样测得的石块密度会',
          options: ['偏大，因为石块吸水使测得的体积偏小', '偏小，因为石块吸水使测得的体积偏大', '偏大，因为石块吸水使测得的质量偏大', '不受影响'],
          answer: 0,
          explain: '石块浸入水中后会吸进一部分水，量筒中水面上升得少，<span class="v">V</span><sub>2</sub> 偏小，算出的体积偏小。质量是先测的，准确。由 ρ = <span class="v">m</span>/<span class="v">V</span> 可知密度偏大。'
        },
        {
          type: 'choice',
          q: '用天平测质量时，如果砝码生锈了（实际质量比标注的大），测得的质量会',
          options: ['偏小', '偏大', '不变', '无法判断'],
          answer: 0,
          explain: '生锈的砝码实际质量比标注值大，用较少的（标注值较小的）砝码就能平衡，读出的质量比真实质量小。'
        },
        {
          type: 'choice',
          q: '质量和体积都相等的铜球、铁球和铝球（ρ<sub>铜</sub> &gt; ρ<sub>铁</sub> &gt; ρ<sub>铝</sub>），下列判断正确的是',
          options: ['铜球和铁球一定是空心的，铝球可能是实心的', '三个球一定都是空心的', '铝球一定是空心的', '铜球可能是实心的'],
          answer: 0,
          explain: '质量相等时，实心的铜、铁、铝体积依次变大，铝的实心体积最大。三个球体积相同，若铝球是实心的，铜球、铁球的实心部分体积都小于球的体积，必定空心；即使铝球空心，铜球、铁球也一定空心。所以铜球、铁球一定空心，铝球可能实心也可能空心。'
        },
        {
          type: 'num',
          q: '一个瓶子装满水时总质量为 400 g，装满酒精时总质量为 350 g。瓶子的质量是多少克？（ρ<sub>水</sub> = 1.0 g/cm³，ρ<sub>酒精</sub> = 0.8 g/cm³）',
          answer: 150, unit: 'g',
          explain: '设瓶的质量为 <span class="v">m</span><sub>0</sub>、容积为 <span class="v">V</span>：<span class="v">m</span><sub>0</sub> + 1.0 g/cm³ × <span class="v">V</span> = 400 g，<span class="v">m</span><sub>0</sub> + 0.8 g/cm³ × <span class="v">V</span> = 350 g。两式相减：0.2 g/cm³ × <span class="v">V</span> = 50 g，<span class="v">V</span> = 250 cm³，<span class="v">m</span><sub>0</sub> = 400 g − 250 g = 150 g。'
        },
        {
          type: 'num',
          q: '一个瓶子最多能装 500 g 水，用它最多能装多少克酒精？（ρ<sub>水</sub> = 1.0 g/cm³，ρ<sub>酒精</sub> = 0.8 g/cm³）',
          answer: 400, unit: 'g',
          explain: '瓶子的容积 <span class="v">V</span> = <span class="v">m</span><sub>水</sub>/ρ<sub>水</sub> = 500 g / 1.0 g/cm³ = 500 cm³。装满酒精，酒精体积也是 500 cm³，<span class="v">m</span><sub>酒精</sub> = ρ<sub>酒精</sub><span class="v">V</span> = 0.8 g/cm³ × 500 cm³ = 400 g。'
        }
      ],
      practice: [
        {
          title: '实验设计：没有量筒怎么测酱油的密度',
          prompt: '<p>器材：天平（含砝码）、一个带盖的空玻璃瓶、足量的水和酱油（水的密度用 ρ<sub>水</sub> 表示）。没有量筒，请设计实验测出酱油的密度。写出主要步骤（测量的物理量用字母表示）和酱油密度的表达式。</p>',
          write: true,
          sample: `<ol><li>用天平测出空瓶的质量 <span class="v">m</span><sub>0</sub>；</li>
<li>瓶中装满水，盖上盖子，测出瓶和水的总质量 <span class="v">m</span><sub>1</sub>；</li>
<li>倒掉水并把瓶擦干，再装满酱油，盖上盖子，测出瓶和酱油的总质量 <span class="v">m</span><sub>2</sub>。</li></ol>
<p>思路：水和酱油都装满同一个瓶子，体积相等：<span class="v">V</span> = (<span class="v">m</span><sub>1</sub> − <span class="v">m</span><sub>0</sub>) / ρ<sub>水</sub>。</p>
<div class="formula">ρ<sub>酱油</sub> = (<span class="v">m</span><sub>2</sub> − <span class="v">m</span><sub>0</sub>) ρ<sub>水</sub> / (<span class="v">m</span><sub>1</sub> − <span class="v">m</span><sub>0</sub>)</div>`,
          checklist: ['测了空瓶质量 m₀', '用“装满水”求出瓶的容积（等效替代法）', '换装满酱油测总质量，前后都要“装满”', '表达式正确，并写了 ρ水'],
          notes: '这是中考常见的“等体积替代”思路：用水的体积代替待测液体的体积。'
        }
      ]
    }
  );
})();
