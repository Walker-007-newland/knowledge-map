// 第三阶段 物理组 8 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
// 电与磁的画图辅助函数也放在这里，导出为 SIMS._p3_8，数据文件 physics/p3-8.js 复用（本文件先加载）。
//
// 约定（所有图都遵守，题目里的图由这些函数按物理规律算出来，保证图文一致）：
//   · 磁极：N 极填浅红色，S 极填浅蓝色，并写字母；不知道极性的写别的字母（如 A、B），填灰色。
//   · 小磁针：红色（实心）一端是 N 极，默认在 N 端旁写小字“N”。
//   · 磁感线：磁体外部从 N 极出发回到 S 极，箭头画在线的中间。
//   · 螺线管：正面（看得见的）导线画粗实线，背面导线画细虚线。
//     wind = 'fd'：从左端引线顺着导线往右看，正面导线从上往下绕；'fu'：正面导线从下往上绕。
//     cur = 'L'：电流从左端引线流入；'R'：从右端流入。
//     正面导线中电流向下 ⇔ N 极在右端（右手握住螺线管，四指指向电流方向，大拇指指向 N 极）。
//   · 电池：长线是正极，图上同时标“+”“−”。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const r1 = v => Math.round(v * 10) / 10;
  const rad = d => d * Math.PI / 180;

  /* ---------------- 基础小件 ---------------- */
  // 实心三角箭头，尖端在 (x,y) 前方 s/2 处，方向 deg（0 向右，90 向下）
  function tri(x, y, deg, cls, s) {
    s = s || 9;
    const a = rad(deg), ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const tx = x + ux * s / 2, ty = y + uy * s / 2, bx = x - ux * s / 2, by = y - uy * s / 2;
    const pts = [[tx, ty], [bx + nx * s * 0.42, by + ny * s * 0.42], [bx - nx * s * 0.42, by - ny * s * 0.42]];
    return `<polygon class="${cls || 'solid'}" points="${pts.map(p => r1(p[0]) + ',' + r1(p[1])).join(' ')}"/>`;
  }
  const POLE_STYLE = {
    N: 'fill:var(--fig-force);fill-opacity:.24;stroke:var(--fig-ink);stroke-width:1.5',
    S: 'fill:var(--fig-hi);fill-opacity:.24;stroke:var(--fig-ink);stroke-width:1.5'
  };
  // 一个磁极块：左上角 (x,y)，宽 w 高 h，label 为 'N' | 'S' | 其他文字（灰色）| ''
  function pole(x, y, w, h, label) {
    const st = POLE_STYLE[label];
    const box = st ? `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" style="${st}"/>` : F.rect(x, y, w, h, 'soft');
    return box + (label ? F.text(x + w / 2, y + h / 2 + 1, label, { size: 15 }) : '');
  }
  // 条形磁体：中心 (cx,cy)，长 w 宽 h；left/right 为两端的字（竖放 o.v 时 left 在上、right 在下）
  function bar(cx, cy, w, h, left, right, o) {
    o = o || {};
    if (o.v) return pole(cx - h / 2, cy - w / 2, h, w / 2, left) + pole(cx - h / 2, cy, h, w / 2, right);
    return pole(cx - w / 2, cy - h / 2, w / 2, h, left) + pole(cx, cy - h / 2, w / 2, h, right);
  }
  // 小磁针：中心 (cx,cy)，N 极指向 deg（0 向右，90 向下，-90 向上，180 向左）
  function needle(cx, cy, deg, o) {
    o = o || {};
    const L = o.len || 17, w = 5, a = rad(deg), ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const P = pts => pts.map(p => r1(p[0]) + ',' + r1(p[1])).join(' ');
    const n = [cx + ux * L, cy + uy * L], s = [cx - ux * L, cy - uy * L], A = [cx + nx * w, cy + ny * w], B = [cx - nx * w, cy - ny * w];
    let str = `<polygon points="${P([s, A, B])}" style="fill:var(--fig-bg);stroke:var(--fig-ink);stroke-width:1.3"/>` +
      `<polygon points="${P([n, A, B])}" style="fill:var(--fig-force);stroke:var(--fig-ink);stroke-width:1.3"/>` + F.dot(cx, cy, 1.8);
    if (o.label !== false) str += F.text(cx + ux * (L + 9), cy + uy * (L + 9), 'N', { size: 11 });
    return str;
  }
  // 磁感线（细线）上的箭头
  const arrowOn = (x, y, deg) => tri(x, y, deg, 'solid', 8);

  /* ---------------- 磁感线 ---------------- */
  // 条形磁体周围的磁感线：磁体中心 (cx,cy)，长 w 宽 h；from = 'L' 表示磁感线从左端出发（左端是 N 极），'R' 相反
  // o.loops 上下各几条（默认 3）；o.axis 是否画两端轴线上的直线（默认画）。先画磁感线再画磁体，磁体会盖住线头。
  function barField(cx, cy, w, h, from, o) {
    o = o || {};
    const xL = cx - w / 2, xR = cx + w / 2, k = o.loops || 3, toR = from === 'L';
    let s = '';
    for (let i = 1; i <= k; i++) {
      const c = 14 + 13 * i, d = 20 * i;
      [-1, 1].forEach(sg => {
        const y0 = cy + sg * h / 2;
        s += `<path class="thin" d="M${r1(xL + 3)},${r1(y0)} C${r1(xL - c)},${r1(y0 + sg * d)} ${r1(xR + c)},${r1(y0 + sg * d)} ${r1(xR - 3)},${r1(y0)}"/>`;
        s += arrowOn(cx, y0 + sg * d * 0.75, toR ? 0 : 180);
      });
    }
    if (o.axis !== false) {
      const L = o.axisLen || 38;
      s += F.line(xL - L, cy, xL, cy, 'thin') + F.line(xR, cy, xR + L, cy, 'thin');
      // 左端：N 极则箭头离开磁体（向左），S 极则指向磁体（向右）；右端：S 极则指向磁体（向左），N 极则离开（向右）
      s += arrowOn(xL - L / 2, cy, toR ? 180 : 0) + arrowOn(xR + L / 2, cy, toR ? 180 : 0);
    }
    return s;
  }
  // 两个平行磁极面之间的匀强磁场：竖直线（xs 各一条，从 y1 到 y2），down=true 箭头向下
  function vField(xs, y1, y2, down) {
    return xs.map(x => F.line(x, y1, x, y2, 'thin dash') + arrowOn(x, (y1 + y2) / 2, down ? 90 : -90)).join('');
  }
  // 水平方向的：ys 各一条，从 x1 到 x2，right=true 箭头向右
  function hField(ys, x1, x2, right) {
    return ys.map(y => F.line(x1, y, x2, y, 'thin') + arrowOn((x1 + x2) / 2, y, right ? 0 : 180)).join('');
  }
  // 同名磁极相对：两个磁极面分别在 x = gx - g/2、gx + g/2，中心高 cy；p = 'N'（磁感线离开磁极面）| 'S'（指向磁极面）
  function likeField(gx, cy, g, p) {
    let s = '';
    const out = p === 'N';
    [-1, 1].forEach(side => {          // 左、右两个磁极面
      const fx = gx + side * g / 2;
      [-1, 1].forEach(sg => {          // 上、下
        [5, 12].forEach((off, j) => {
          const ex = gx + side * (6 + j * 10), ey = cy + sg * 62;
          s += `<path class="thin" d="M${r1(fx)},${r1(cy + sg * off)} Q${r1(gx + side * (4 + j * 8))},${r1(cy + sg * off)} ${r1(ex)},${r1(ey)}"/>`;
          s += arrowOn(ex, cy + sg * 48, out ? (sg < 0 ? -90 : 90) : (sg < 0 ? 90 : -90));
        });
      });
    });
    return s;
  }

  /* ---------------- 蹄形磁体（平放，弯的一端在左，两臂向右）---------------- */
  // 弯头圆心 (x,y)，两臂伸到 x+L；top 为上臂磁极（'N' 或 'S'），下臂为另一极。两臂之间（y-33 ~ y+33）是磁场区，磁感线竖直。
  function horseshoe(x, y, top, o) {
    o = o || {};
    const L = o.L || 150, R = 55, r = 33;
    const bot = top === 'N' ? 'S' : top === 'S' ? 'N' : (o.bot || '');
    let s = `<path class="soft" d="M${x + L},${y - R} L${x},${y - R} A${R},${R} 0 0 0 ${x},${y + R} L${x + L},${y + R} L${x + L},${y + r} L${x},${y + r} A${r},${r} 0 0 1 ${x},${y - r} L${x + L},${y - r} Z"/>`;
    s += pole(x + L - 40, y - R, 40, R - r, top) + pole(x + L - 40, y + r, 40, R - r, bot);
    if (o.field && (top === 'N' || top === 'S')) s += vField([x + L - 30, x + L - 10], y - r, y + r, top === 'N');
    return s;
  }

  /* ---------------- 灵敏电流计 ---------------- */
  // 中心 (cx,cy)，defl 指针偏转（-1 ~ 1，正数向右偏）；表盘下写“G”
  function galv(cx, cy, defl, o) {
    o = o || {};
    const a = rad(-90 + 50 * Math.max(-1, Math.min(1, defl || 0)));
    let s = F.circle(cx, cy, 20, 'soft') + `<path class="thin" d="M${r1(cx - 13)},${r1(cy - 4)} A15,15 0 0 1 ${r1(cx + 13)},${r1(cy - 4)}"/>` +
      F.line(cx, cy - 15, cx, cy - 11, 'thin') +
      `<line class="force" x1="${cx}" y1="${cy + 8}" x2="${r1(cx + 20 * Math.cos(a))}" y2="${r1(cy + 8 + 20 * Math.sin(a))}"/>` + F.dot(cx, cy + 8, 2.5);
    if (o.label !== false) s += F.text(cx, cy + 32, 'G', { cls: 'it', size: 15 });
    return s;
  }

  /* ---------------- 电池（横放，自己画，可以选择正极在哪边） ---------------- */
  // 中心 (cx,cy)，左右两端 ±20 接导线；posLeft=true 正极（长线）在左。o.signs=false 不标 +、−
  function cellH(cx, cy, posLeft, o) {
    o = o || {};
    const lx = cx - 4, sx = cx + 4;     // 先按“正极在左”画，再按需镜像
    const k = posLeft ? 1 : -1;
    const X = x => cx + (x - cx) * k;
    let s = `<rect class="mask" x="${cx - 12}" y="${cy - 15}" width="24" height="30"/>` +
      F.line(cx - 20, cy, X(lx), cy) + F.line(X(sx), cy, cx + 20, cy) +
      F.line(X(lx), cy - 13, X(lx), cy + 13) + `<line class="ink" style="stroke-width:4" x1="${X(sx)}" y1="${cy - 7}" x2="${X(sx)}" y2="${cy + 7}"/>`;
    if (o.signs !== false) s += F.text(X(cx - 13), cy - 15, '+', { size: 14 }) + F.text(X(cx + 13), cy - 15, '−', { size: 14 });
    return s;
  }
  // 竖放的电池：中心 (cx,cy)，上下两端 ±20；posTop=true 正极在上
  function cellV(cx, cy, posTop, o) {
    o = o || {};
    const k = posTop ? 1 : -1, Y = y => cy + (y - cy) * k;
    let s = `<rect class="mask" x="${cx - 15}" y="${cy - 12}" width="30" height="24"/>` +
      F.line(cx, cy - 20, cx, Y(cy - 4)) + F.line(cx, Y(cy + 4), cx, cy + 20) +
      F.line(cx - 13, Y(cy - 4), cx + 13, Y(cy - 4)) + `<line class="ink" style="stroke-width:4" x1="${cx - 7}" y1="${Y(cy + 4)}" x2="${cx + 7}" y2="${Y(cy + 4)}"/>`;
    if (o.signs !== false) s += F.text(cx + 20, Y(cy - 9), '+', { size: 14, a: 'start' }) + F.text(cx + 20, Y(cy + 9), '−', { size: 14, a: 'start' });
    return s;
  }

  /* ---------------- 通电螺线管 ---------------- */
  // 螺线管 N 极在哪端：'R' | 'L'
  function solN(wind, cur) { return (wind === 'fd') === (cur === 'L') ? 'R' : 'L'; }
  // 螺线管：中心 (cx,cy)，o.len 长、o.r 半高、o.n 匝数、o.wind、o.cur（null = 不画电流箭头）、o.core 铁芯、
  // o.lead 引线向下伸出的长度：左引线末端 (cx-len/2-16, cy+r+lead)，右引线末端 (cx+len/2+16, cy+r+lead)
  // o.poles 在两端外侧写 N/S（按 o.curTrue || o.cur 判断）；o.ends = ['A','B'] 在两端外侧写字母（不写极性）
  function solenoid(cx, cy, o) {
    o = Object.assign({ len: 140, r: 22, n: 5, wind: 'fd', lead: 40 }, o || {});
    const x0 = cx - o.len / 2, x1 = cx + o.len / 2, r = o.r, p = o.len / o.n, top = cy - r, bot = cy + r;
    const fd = o.wind === 'fd', yS = fd ? top : bot;      // 引线接在上沿（fd）还是下沿（fu）
    const yEnd = cy + r + o.lead;
    let s = '';
    // 管子 / 铁芯
    if (o.core) s += F.rect(x0 - 14, cy - r + 6, o.len + 28, 2 * r - 12, 'soft', 2);
    else s += F.rect(x0, top, o.len, 2 * r, 'soft', 3);
    // 背面导线（细虚线）
    for (let i = 0; i < o.n; i++) {
      const xa = x0 + i * p + p / 2, xb = x0 + (i + 1) * p;
      s += F.line(xa, fd ? bot : top, xb, fd ? top : bot, 'thin dash');
    }
    // 正面导线（粗实线）
    let mid = null;
    for (let i = 0; i < o.n; i++) {
      const xa = x0 + i * p, xb = xa + p / 2;
      s += `<line class="ink" style="stroke-width:2.6" x1="${r1(xa)}" y1="${r1(fd ? top : bot)}" x2="${r1(xb)}" y2="${r1(fd ? bot : top)}"/>`;
      if (i === Math.floor(o.n / 2)) mid = [(xa + xb) / 2, cy, Math.atan2((fd ? bot - top : top - bot), p / 2) * 180 / Math.PI];
    }
    // 引线
    s += F.wire([[x0, yS], [x0 - 16, yS], [x0 - 16, yEnd]]) + F.wire([[x1, yS], [x1 + 16, yS], [x1 + 16, yEnd]]);
    // 电流方向箭头
    if (o.cur === 'L' || o.cur === 'R') {
      const inL = o.cur === 'L';
      const ly = (yS + yEnd) / 2 + (fd ? 4 : 0);
      s += tri(x0 - 16, ly, inL ? -90 : 90, 'ray-head', 10) + tri(x1 + 16, ly, inL ? 90 : -90, 'ray-head', 10);
      // 正面中间一匝导线上的箭头：沿导线“从左端引线顺下去”的方向，电流从右端流入则反过来
      const d = mid[2] + (inL ? 0 : 180);
      s += tri(mid[0], mid[1], d, 'ray-head', 11);
    }
    if (o.poles) {
      const nR = solN(o.wind, o.curTrue || o.cur) === 'R';
      s += F.text(x0 - 32, cy, nR ? 'S' : 'N', { size: 16 }) + F.text(x1 + 32, cy, nR ? 'N' : 'S', { size: 16 });
    }
    if (o.ends) s += F.text(x0 - 32, cy, o.ends[0], { size: 16, cls: 'it' }) + F.text(x1 + 32, cy, o.ends[1], { size: 16, cls: 'it' });
    return s;
  }
  // 螺线管电路整图（返回 svg 内部字符串，画布建议 360×190）：
  // o 同 solenoid，另有 o.cx/o.cy（默认 180、62），o.src = 'cell'（默认，画电池并标 +−）| 'box'（画“电源”方框，不标极性，两端可写 o.boxEnds）
  // o.sw 开关（默认闭合，'off' 断开，false 不画），o.needles 小磁针位置数组：'L' 左端外、'R' 右端外、'T' 正上方、'B' 正下方
  // o.rheo 串一个滑动变阻器（简单画法）
  function solCircuit(o) {
    o = Object.assign({ cx: 180, cy: 62, len: 140, r: 22, n: 5, wind: 'fd', cur: 'L', lead: 46, src: 'cell', sw: true }, o || {});
    const x0 = o.cx - o.len / 2, x1 = o.cx + o.len / 2, yb = o.cy + o.r + o.lead;
    const xl = x0 - 16, xr = x1 + 16;
    let s = F.wire([[xl, yb], [xr, yb]]);
    s += solenoid(o.cx, o.cy, Object.assign({}, o, { cur: o.arrows === false ? null : o.cur, curTrue: o.cur }));
    const bx = o.cx - 35;
    if (o.src === 'box') {
      s += F.rect(bx - 26, yb - 12, 52, 24, 'soft', 3) + F.text(bx, yb + 1, '电源', { size: 13 });
      if (o.boxEnds) s += F.text(bx - 36, yb - 14, o.boxEnds[0], { size: 13, cls: 'it' }) + F.text(bx + 36, yb - 14, o.boxEnds[1], { size: 13, cls: 'it' });
    } else s += cellH(bx, yb, o.cur === 'L');
    if (o.sw) s += F.comp('switch', o.cx + (o.rheo ? 10 : 30), yb, { on: o.sw !== 'off', label: 'S', ly: 18 });
    if (o.rheo) s += F.comp('rheo', o.cx + 60, yb, { label: o.rheo === true ? '' : o.rheo, ly: 22 });
    const nR = solN(o.wind, o.cur) === 'R';
    const NL = { label: false };   // 螺线管图里小磁针不写“N”，免得和磁极字母挤在一起；红色一端就是 N 极
    (o.needles || []).forEach(pos => {
      if (pos === 'L') s += needle(x0 - 72, o.cy, nR ? 0 : 180, NL);           // 左端外：N 在左时磁场向左
      if (pos === 'R') s += needle(x1 + 72, o.cy, nR ? 0 : 180, NL);           // 右端外：N 在右时磁场向右
      if (pos === 'T') s += needle(o.cx, o.cy - o.r - 22, nR ? 180 : 0, NL);   // 外部磁感线从 N 端绕到 S 端
      if (pos === 'B') s += needle(o.cx, o.cy + o.r + 20, nR ? 180 : 0, NL);
    });
    return s;
  }

  /* ---------------- 竖直的电磁铁 ---------------- */
  // 铁芯中心 x = cx，从 top 到 top+h，绕 n 匝；引线从左侧出：上 (cx-24, top+8)、下 (cx-24, top+h-8)
  function emV(cx, top, h, n, o) {
    o = o || {};
    const w = 18, y0 = top + 8, y1 = top + h - 8, p = (y1 - y0) / n;
    let s = F.rect(cx - w / 2, top, w, h, 'soft', 2);
    for (let i = 0; i < n; i++) {
      const ya = y0 + i * p;
      s += F.line(cx + w / 2 + 3, ya + p / 2, cx - w / 2 - 3, ya + p, 'thin dash');
      s += `<line class="ink" style="stroke-width:2.2" x1="${r1(cx - w / 2 - 3)}" y1="${r1(ya)}" x2="${r1(cx + w / 2 + 3)}" y2="${r1(ya + p / 2)}"/>`;
    }
    s += F.wire([[cx - w / 2 - 3, y0], [cx - 24, y0]]) + F.wire([[cx - w / 2 - 3, y1], [cx - 24, y1]]);
    if (o.label) s += F.text(cx, top - 10, o.label, { size: 13 });
    return s;
  }
  // 吸在铁芯下端的大头针：铁芯下端中心 (cx, y)，n 根
  function pins(cx, y, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = cx - (n - 1) * 3 + i * 6, tilt = (i - (n - 1) / 2) * 2.2;
      s += F.line(x, y, x + tilt, y + 20, 'thin') + F.dot(x, y + 1, 1.8);
    }
    return s;
  }

  /* ---------------- 电磁继电器整图 ---------------- */
  // 画布 460×230。左边控制电路：电池（竖放，正极在上）+ o.ctrl 元件（默认开关，{type, label, on}）+ 电磁铁；
  // 右边工作电路：电源 → 衔铁（杠杆）→ 动触点；上静触点接 o.up 用电器，下静触点接 o.down 用电器（{type, label} 或 null）。
  // o.ac = '220 V' 时工作电路电源画成交流电源方框。o.on = true 画衔铁被吸下（动触点与下静触点接触），否则被弹簧拉起（与上静触点接触）。o.names 标注各部分名称。
  function relay(o) {
    o = o || {};
    const on = !!o.on;
    const px = 120, py = 108, ex = 270, ey = on ? 114 : 84;
    const at = x => py + (ey - py) * (x - px) / (ex - px);
    let s = '';
    // 控制电路
    s += emV(159, 118, 70, 6) + F.wire([[135, 126], [70, 126], [70, 180], [135, 180]]);
    s += cellV(70, 153, true);
    const c = o.ctrl || { type: 'switch', label: 'S', on };
    if (c.type === 'switch') s += F.comp('switch', 105, 180, { on: c.on, label: c.label, ly: 18 });
    else if (c.type) s += F.comp(c.type, 105, 180, { label: c.label, ly: 22 });
    if (c.text) s += F.text(105, 200, c.text, { size: 12 });
    // 支点、衔铁、弹簧
    s += `<line class="ink" style="stroke-width:5" x1="${px}" y1="${py}" x2="${r1(200)}" y2="${r1(at(200))}"/>` +
      `<line class="ink" style="stroke-width:2.5" x1="200" y1="${r1(at(200))}" x2="${ex}" y2="${ey}"/>` + F.dot(ex, ey, 4) + F.circle(px, py, 4.5, 'soft');   // 转轴（衔铁绕它转动，导线从这里接入工作电路）
    s += F.wall(185, 30, 235, 30, 'up') + F.spring(212, 30, at(212), 6);
    // 静触点
    s += `<line class="ink" style="stroke-width:3" x1="264" y1="80" x2="300" y2="80"/>` + `<line class="ink" style="stroke-width:3" x1="264" y1="118" x2="300" y2="118"/>`;
    // 工作电路：支点 → 上方 → 右侧电源 → 用电器 → 静触点
    s += F.wire([[px, py], [px, 18], [430, 18], [430, o.down ? 118 : 80]]);
    if (o.ac) s += F.rect(414, 34, 32, 28, 'soft', 3) + F.text(430, 48, '~', { size: 18 }) + F.text(408, 48, o.ac, { size: 12, a: 'end' });
    else s += cellV(430, 48, true) + F.text(410, 48, o.power || '电源', { size: 12, a: 'end' });
    if (o.up) s += F.wire([[300, 80], [430, 80]]) + F.comp(o.up.type, 365, 80, { label: o.up.label, ly: -18 }) + (o.down ? F.node(430, 80) : '');
    if (o.down) s += F.wire([[300, 118], [430, 118]]) + F.comp(o.down.type, 365, 118, { label: o.down.label, ly: 22 });
    if (o.names) {
      s += F.text(178, 165, '电磁铁', { size: 12, a: 'start' }) + F.text(150, 86, '衔铁', { size: 12 }) +
        F.text(232, 58, '弹簧', { size: 12, a: 'start' }) + F.text(282, 70, '静触点', { size: 11 }) + F.text(282, 132, '静触点', { size: 11 }) +
        F.text(245, on ? 128 : 100, '动触点', { size: 11 });
    }
    s += F.text(100, 222, '控制电路', { size: 12 }) + F.text(365, 160, '工作电路', { size: 12 });
    return s;
  }

  /* ---------------- 磁场中的导体（截面图） ---------------- */
  // 上下两个磁极，中间竖直磁感线；导体垂直纸面，画成小圆：sym = 'in'（⊗ 电流向纸里）| 'out'（⊙ 向外）| ''（不标）
  // o.top 上磁极 'N'|'S'；o.move 运动方向角（度，0 向右，-90 向上）或 null；o.force 受力方向角或 null；o.dx 导体水平偏移
  function cross(cx, cy, o) {
    o = o || {};
    const top = o.top || 'N', bot = top === 'N' ? 'S' : 'N';
    let s = pole(cx - 60, cy - 72, 120, 22, top) + pole(cx - 60, cy + 50, 120, 22, bot) +
      vField([cx - 44, cx + 44], cy - 50, cy + 50, top === 'N');
    const x = cx + (o.dx || 0);
    s += `<circle cx="${r1(x)}" cy="${cy}" r="10" style="fill:var(--fig-bg);stroke:var(--fig-ink);stroke-width:2"/>`;
    if (o.sym === 'out') s += F.dot(x, cy, 3);
    if (o.sym === 'in') s += F.line(x - 6, cy - 6, x + 6, cy + 6) + F.line(x - 6, cy + 6, x + 6, cy - 6);
    if (o.move != null) {
      const a = rad(o.move);
      s += F.arrow(x + 14 * Math.cos(a), cy + 14 * Math.sin(a), x + 40 * Math.cos(a), cy + 40 * Math.sin(a), { cls: 'hi', size: 8 });
      if (o.vLabel) s += F.text(x + 50 * Math.cos(a), cy + 50 * Math.sin(a) - 2, o.vLabel, { size: 12 });
    }
    if (o.force != null) {
      const a = rad(o.force);
      s += F.arrow(x + 12 * Math.cos(a), cy + 12 * Math.sin(a), x + (14 + (o.fLen || 26)) * Math.cos(a), cy + (14 + (o.fLen || 26)) * Math.sin(a), { cls: 'force', size: 9 });
      s += F.text(x + (24 + (o.fLen || 26)) * Math.cos(a) + 6, cy + (24 + (o.fLen || 26)) * Math.sin(a), 'F', { cls: 'it red', size: 15 });
    }
    return s;
  }

  /* ---------------- 导体 ab 放在蹄形磁体中的实验装置 ---------------- */
  // 画布 360×210。o.top 上臂磁极；o.kind = 'G'（接灵敏电流计，电磁感应）| 'battery'（接电源和开关，磁场对电流的作用）
  // o.move 导体运动方向文字箭头：'L' 'R' 'U' 'D'（只画箭头）；o.defl 电流计偏转
  function rodSetup(o) {
    o = o || {};
    let s = horseshoe(72, 105, o.top || 'N', { L: 128 });
    const a = [178, 128], b = [204, 82];
    s += `<line class="ink" style="stroke-width:5" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>` +
      F.text(a[0] - 10, a[1] + 6, 'a', { cls: 'it', size: 15 }) + F.text(b[0] + 10, b[1] - 8, 'b', { cls: 'it', size: 15 });
    s += F.wire([a, [240, 128], [240, 175], [300, 175], [300, 125]]) + F.wire([b, [215, 82], [215, 36], [300, 36], [300, 85]]);
    if (o.kind === 'battery') {
      s += cellV(300, 105, true) + F.comp('switch', 258, 36, { on: o.on !== false, label: 'S', ly: -16 });
    } else s += F.wire([[300, 82], [300, 128]]) + `<rect class="mask" x="276" y="81" width="48" height="48"/>` + galv(300, 105, o.defl || 0, { label: false }) + F.text(336, 105, 'G', { cls: 'it', size: 15 });
    const mv = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] }[o.move];
    if (mv) {
      const mx = 110 - mv[0] * 16, my = 105 - mv[1] * 16;
      s += F.arrow(mx, my, mx + mv[0] * 32, my + mv[1] * 32, { cls: 'hi', size: 8 }) + F.text(110, 131, '导体运动方向', { size: 11 });
    }
    return s;
  }

  /* ---------------- 地磁场 ---------------- */
  function earth() {
    const cx = 160, cy = 120, R = 62;
    let s = '';
    // 外部磁感线：从地理南极附近（地磁 N 极）出发，绕到地理北极附近（地磁 S 极）
    [1, -1].forEach(sg => {
      [0, 1].forEach(k => {
        const w = 120 + k * 40;
        s += `<path class="thin" d="M${cx + sg * 8},${cy + R - 4} C${cx + sg * w},${cy + R + 40 + k * 20} ${cx + sg * w},${cy - R - 40 - k * 20} ${cx + sg * 8},${cy - R + 4}"/>`;
        s += arrowOn(cx + sg * (0.75 * w + 2), cy, -90);
      });
    });
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" style="fill:var(--fig-water);stroke:var(--fig-ink);stroke-width:1.5"/>`;
    s += F.line(cx, cy - R - 16, cx, cy + R + 16, 'thin dash');
    // 地球里面的“大磁体”：略偏离地轴
    s += `<g transform="rotate(12 ${cx} ${cy})">${bar(cx, cy, 70, 16, 'S', 'N', { v: true })}</g>`;
    s += F.text(cx, cy - R - 26, '地理北极', { size: 12 }) + F.text(cx, cy + R + 26, '地理南极', { size: 12 });
    return s;
  }

  const H = { tri, pole, bar, needle, barField, vField, hField, likeField, horseshoe, galv, cellH, cellV, solN, solenoid, solCircuit, emV, pins, relay, cross, rodSetup, earth };
  SIMS._p3_8 = H;

  /* ==================== 演示 1：安培定则 ==================== */
  SIMS.p3_8_ampere = function (box) {
    const ui = SIMS.ui(box, '安培定则：通电螺线管的 N 极在哪端？');
    const fig = ui.fig();
    const cur = ui.buttons(['电流从左端流入', '电流从右端流入'], draw, 0);
    const wind = ui.buttons(['绕法甲（正面导线从上往下绕）', '绕法乙（正面导线从下往上绕）'], draw, 0);
    const show = ui.buttons(['显示磁极', '先自己判断'], draw, 0);
    const out = ui.out();
    ui.note('橙色箭头是电流方向，粗实线是螺线管正面的导线，细虚线是背面的导线；小磁针红色一端是 N 极。先选“先自己判断”，用右手试一试，再切回“显示磁极”核对。');
    function draw() {
      const c = cur.get() === 0 ? 'L' : 'R', w = wind.get() === 0 ? 'fd' : 'fu', sh = show.get() === 0;
      const nSide = H.solN(w, c);
      const s = solCircuit({ cur: c, wind: w, poles: sh, needles: sh ? ['L', 'R', 'T'] : [], cx: 190 });
      fig.innerHTML = F.svg(380, 180, s);
      const down = nSide === 'R';
      out.innerHTML = `电源${c === 'L' ? '左' : '右'}边是正极，电流从螺线管<b>${c === 'L' ? '左' : '右'}端</b>流入。` +
        (sh ? `看正面导线：电流<b>${down ? '向下' : '向上'}</b>。右手握住螺线管，四指沿正面导线${down ? '向下' : '向上'}弯，大拇指指向<b>${nSide === 'R' ? '右' : '左'}端</b>——${nSide === 'R' ? '右' : '左'}端是 <b>N 极</b>。<br>只改电流方向或只改绕法，N 极都会换到另一端；两样都改，N 极位置不变。`
          : '想一想：哪端是 N 极？三个小磁针静止时 N 极各指向哪边？');
    }
    draw();
  };

  /* ==================== 演示 2：磁场对通电导线的作用 ==================== */
  SIMS.p3_8_force = function (box) {
    const ui = SIMS.ui(box, '磁场对通电导线的作用');
    const fig = ui.fig();
    const cur = ui.buttons(['电流垂直纸面向里 ⊗', '电流垂直纸面向外 ⊙', '断开电路'], draw, 0);
    const mag = ui.buttons(['N 极在上', 'S 极在上'], draw, 0);
    const I = ui.slider({ label: '电流大小', min: 1, max: 3, step: 1, value: 2, fmt: v => ['小', '中', '大'][v - 1] }, draw);
    const out = ui.out();
    ui.note('图是从导体一端看过去的截面图：小圆就是导体，⊗ 表示电流流进纸面，⊙ 表示流出纸面；虚线是磁感线（从 N 极到 S 极）。');
    function draw() {
      const k = cur.get(), top = mag.get() === 0 ? 'N' : 'S';
      if (k === 2) {
        fig.innerHTML = F.svg(300, 170, cross(130, 85, { top, sym: '' }));
        out.innerHTML = '没有电流，导体不受磁场力，静止不动。';
        return;
      }
      // F = I L × B：磁场 N→S；N 在上时磁场向下
      const iz = k === 0 ? -1 : 1, by = top === 'N' ? -1 : 1;   // y 轴向上的坐标
      const fx = -iz * by;            // (0,0,iz) × (0,by,0) = (-iz·by, 0, 0)
      const len = 10 + I.get() * 10;
      fig.innerHTML = F.svg(300, 170, cross(130, 85, { top, sym: k === 0 ? 'in' : 'out', force: fx > 0 ? 0 : 180, fLen: len }));
      out.innerHTML = `导体受力方向：<b>水平向${fx > 0 ? '右' : '左'}</b>。` +
        '只改变电流方向，或者只把磁极上下对调，受力方向都会反过来；两个同时改变，受力方向不变。电流越大，受力越大。';
    }
    draw();
  };

  /* ==================== 演示 3：电磁感应 ==================== */
  SIMS.p3_8_induction = function (box) {
    const ui = SIMS.ui(box, '电磁感应：导体怎样运动才产生电流？');
    const fig = ui.fig();
    const MOVES = [['静止', null], ['向左', [-1, 0]], ['向右', [1, 0]], ['向上', [0, 1]], ['向下', [0, -1]], ['斜向右上', [0.71, 0.71]]];
    let anim = null;
    const stop = () => { anim = null; };
    const mv = ui.buttons(MOVES.map(m => m[0]), () => { stop(); draw(); }, 2);
    const mag = ui.buttons(['N 极在上', 'S 极在上'], () => draw(), 0);
    const ckt = ui.buttons(['电路闭合', '电路断开'], () => draw(), 0);
    const spd = ui.slider({ label: '运动快慢', min: 1, max: 3, step: 1, value: 2, fmt: v => ['慢', '中', '快'][v - 1] }, () => draw());
    ui.action('▶ 让导体左右来回运动', () => {
      if (anim) { stop(); return; }
      anim = { t0: performance.now() };
      const loop = now => {
        if (!anim || !box.isConnected) { anim = null; return; }
        const t = (now - anim.t0) / 1000, w = 2.2;
        draw({ dx: 34 * Math.sin(w * t), vx: Math.cos(w * t) });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
    const out = ui.out();
    ui.note('截面图：小圆是垂直纸面放置的导体 ab，两端用导线接着灵敏电流计 G（导线没画出）。上下是两个磁极，中间竖直的虚线是磁感线。');

    function draw(a) {
      const top = mag.get() === 0 ? 'N' : 'S', closed = ckt.get() === 0, k = spd.get();
      let v, dx = 0;
      if (a) { v = [a.vx, 0]; dx = a.dx; } else v = MOVES[mv.get()][1];
      const by = top === 'N' ? -1 : 1;                 // y 轴向上
      const cut = v ? v[0] * by : 0;                   // (v×B)_z = vx·By − vy·Bx，Bx = 0
      const z = closed ? cut * k : 0;                  // z>0 电流垂直纸面向外
      const sym = Math.abs(z) < 1e-6 ? '' : z > 0 ? 'out' : 'in';
      const moveDeg = v ? Math.atan2(-v[1], v[0]) * 180 / Math.PI : null;
      let s = cross(130, 95, { top, sym, move: (v && (!a || Math.abs(a.vx) > 0.15)) ? (a ? (a.vx > 0 ? 0 : 180) : moveDeg) : null, dx });
      s += galv(290, 95, -z / 3.2) + F.text(290, 150, closed ? '' : '电路断开', { size: 13 });
      fig.innerHTML = F.svg(360, 190, s);
      if (a) {
        out.innerHTML = !closed ? '电路断开，导体虽然在来回切割磁感线，但没有感应电流，指针不动。' : `导体来回运动，电流方向跟着来回改变，电流计指针<b>左右摆动</b>——这就是<b>交变电流</b>，发电机发出的就是这种电。`;
        return;
      }
      if (!v) out.innerHTML = '导体静止，不切割磁感线，<b>没有</b>感应电流，指针不偏转。';
      else if (Math.abs(cut) < 1e-6) out.innerHTML = '导体顺着磁感线上下运动，<b>没有切割磁感线</b>，不产生感应电流。';
      else if (!closed) out.innerHTML = '导体切割了磁感线，但电路是断开的——两端有感应电压，却<b>没有感应电流</b>，指针不偏转。';
      else out.innerHTML = `导体切割磁感线，电路闭合，产生<b>感应电流</b>（图中 ${z > 0 ? '⊙ 垂直纸面向外' : '⊗ 垂直纸面向里'}），指针向${z > 0 ? '左' : '右'}偏。` +
        '<br>只改变运动方向或只对调磁极，电流方向反过来；运动越快，电流越大。';
    }
    draw();
  };
})();
