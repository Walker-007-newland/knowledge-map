// 第三阶段 物理组 6 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   SIMS.p3_6_vam      伏安法测电阻：定值电阻 / 小灯泡，读电表、记录数据、看要不要求平均
//   SIMS.p3_6_dynamic  动态电路：串联滑片（V 测 R₁ / 测 R₂）、并联滑片、热敏电阻
//   SIMS.p3_6_meter    电能表：用电器工作一段时间，示数和指示灯闪烁次数怎么变
// 另外导出 SIMS._p3_6：电路和表盘画图函数，physics/p3-6.js 里的静态图也用它们（图和演示一致）。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const r1 = v => Math.round(v * 10) / 10;

  /* ================= 画图函数 ================= */
  // 滑动变阻器（与 physics/samples-b.js 的画法一致）：电阻丝中心 (x,y)，左端接电路、右端空着，
  // 滑片在 x+p 处（p 取 -30~30），滑片导线往右接回电路 (x+42, y)。必须在主导线之后画。
  // 接入电路的是 P 左边那段电阻丝：滑片 P 向右移 → 接入电阻变大。
  function rheoP(x, y, p, o) {
    o = o || {};
    const sx = x + p, ty = y - 30;
    return F.rect(x - 30, y - 9, 71, 18, 'mask') + F.rect(x - 30, y - 7, 60, 14, 'ink') +
      F.arrow(sx, ty, sx, y - 8, { size: 7 }) + F.wire([[sx, ty], [x + 42, ty], [x + 42, y]]) +
      F.text(sx - 11, ty, 'P', { cls: 'it', size: 14 }) +
      (o.label ? F.text(x, y + 23, o.label, { cls: 'it', size: 15 }) : '');
  }
  // 敏感电阻（热敏、光敏、气敏、压敏）：定值电阻符号上加一条带“脚”的斜线
  function sens(x, y, label, o) {
    o = o || {};
    return F.comp('R', x, y, { label, ly: o.ly }) + F.line(x - 15, y + 11, x + 15, y - 11, 'thin') + F.line(x - 22, y + 11, x - 15, y + 11, 'thin');
  }

  // 串联动态电路：元件 el（标注 lab）与滑动变阻器 R₂ 串联；o.v = 'a' 电压表测 el，'b' 测 R₂；o.p 滑片位置
  // （与 samples-b.js 的 figDyn 画法相同）
  function dynSeries(o) {
    o = o || {};
    const el = o.el || 'R', lab = o.lab || 'R₁';
    let s = F.wire([[50, 75], [50, 175], [300, 175], [300, 75], [50, 75]]);
    if (o.v === 'b') s += F.wire([[160, 75], [160, 125], [262, 125], [262, 75]]) + F.node(160, 75) + F.node(262, 75) + F.comp('V', 211, 125);
    else if (o.v === 'a') s += F.wire([[80, 75], [80, 30], [140, 30], [140, 75]]) + F.node(80, 75) + F.node(140, 75) + F.comp('V', 110, 30);
    s += (el === 'sens' ? sens(110, 75, lab, { ly: o.v === 'b' ? -22 : 26 }) : F.comp(el, 110, 75, { label: lab, ly: o.v === 'b' ? -22 : 24 })) +
      rheoP(205, 75, o.p != null ? o.p : 6, { label: 'R₂' }) +
      F.comp('battery', 150, 175) + F.comp('A', 240, 175) +
      F.comp('switch', 50, 125, { v: true, on: true, label: 'S', lx: -30 });
    return s;   // 画布 340×210
  }
  // 并联动态电路：上支路 R₁ 与 A₁，中支路滑动变阻器 R₂，干路有电源、开关 S、电流表 A；最上面是电压表 V
  function dynPar(o) {
    o = o || {};
    let s = F.wire([[90, 50], [330, 50], [330, 190], [90, 190], [90, 50]]) + F.wire([[90, 120], [330, 120]]) +
      F.wire([[90, 50], [90, 20], [330, 20], [330, 50]]) +
      F.node(90, 50) + F.node(330, 50) + F.node(90, 120) + F.node(330, 120) +
      F.comp('V', 210, 20) +
      F.comp('R', 170, 50, { label: 'R₁', ly: 22 }) + F.comp('A', 270, 50, { label: 'A₁', ly: 24 }) +
      rheoP(190, 120, o.p != null ? o.p : 6, { label: 'R₂' }) +
      F.comp('battery', 150, 190) + F.comp('A', 260, 190) +
      F.comp('switch', 90, 155, { v: true, on: true, label: 'S', lx: -28 });
    return '<g transform="translate(-50,0)">' + s + '</g>';   // 画布 320×215
  }
  // 串联的敏感电阻电路：R₀ 与敏感电阻串联，o.v = 'a' 电压表测 R₀，'b' 测敏感电阻；o.lab 敏感电阻的名字
  function sensSeries(o) {
    o = o || {};
    let s = F.wire([[50, 75], [50, 175], [300, 175], [300, 75], [50, 75]]);
    const cx = o.v === 'b' ? 220 : 110;
    if (o.v) s += F.wire([[cx - 30, 75], [cx - 30, 30], [cx + 30, 30], [cx + 30, 75]]) + F.node(cx - 30, 75) + F.node(cx + 30, 75) + F.comp('V', cx, 30);
    s += F.comp('R', 110, 75, { label: 'R₀', ly: 24 }) + sens(220, 75, o.lab || 'R', { ly: 28 }) +
      F.comp('battery', 150, 175) + F.comp('A', 240, 175) +
      F.comp('switch', 50, 125, { v: true, on: true, label: 'S', lx: -30 });
    return s;   // 画布 340×205
  }

  // 电流表 / 电压表表盘：左上角 (x,y)，180×150。kind 'A' | 'V'；val 示数；big=true 表示用的是大量程
  function dial(x, y, kind, val, big) {
    const cx = x + 90, cy = y + 104, r = 74;
    const max = kind === 'A' ? (big ? 3 : 0.6) : (big ? 15 : 3);
    const labS = kind === 'A' ? ['0', '0.2', '0.4', '0.6'] : ['0', '1', '2', '3'];
    const labB = kind === 'A' ? ['0', '1', '2', '3'] : ['0', '5', '10', '15'];
    const ang = f => (-140 + 100 * f) * Math.PI / 180;
    const pt = (f, rr) => [cx + rr * Math.cos(ang(f)), cy + rr * Math.sin(ang(f))];
    const a0 = pt(0, r), a1 = pt(1, r);
    let s = F.rect(x, y, 180, 150, 'ink', 8) +
      `<path class="thin" d="M${r1(a0[0])},${r1(a0[1])} A${r},${r} 0 0 1 ${r1(a1[0])},${r1(a1[1])}"/>`;
    for (let i = 0; i <= 30; i++) {
      const f = i / 30, len = i % 10 === 0 ? 10 : i % 5 === 0 ? 7 : 4;
      const p1 = pt(f, r), p2 = pt(f, r - len);
      s += F.line(p1[0], p1[1], p2[0], p2[1], 'thin');
    }
    for (let k = 0; k <= 3; k++) {
      const o = pt(k / 3, r + 11), n = pt(k / 3, r - 21);
      s += F.text(o[0], o[1], labB[k], { size: 11 }) + F.text(n[0], n[1], labS[k], { size: 10 });
    }
    s += F.text(cx, cy - 30, kind, { size: 18 });
    const f = Math.max(-0.03, Math.min(1.04, val / max)), tip = pt(f, r - 3);
    s += F.line(cx, cy, tip[0], tip[1], 'force') + F.dot(cx, cy, 3.5);
    const tl = kind === 'A' ? ['−', '0.6', '3'] : ['−', '3', '15'];
    [45, 90, 135].forEach((dx, k) => {
      s += F.circle(x + dx, y + 127, 5, 'ink') + F.text(x + dx, y + 142, tl[k], { size: 11 });
    });
    return s;
  }

  // 电能表表盘：左上角 (x,y)，200×190。reading 示数（kW·h，最后一位是小数）；o.imp 参数文字；o.amp 电流参数
  function energyMeter(x, y, reading, o) {
    o = o || {};
    const str = String(Math.floor(reading * 10 + 1e-6)).padStart(5, '0').slice(-5);
    let s = F.rect(x, y, 200, 190, 'ink', 10) + F.text(x + 100, y + 18, o.title || '单相电子式电能表', { size: 12 });
    for (let i = 0; i < 5; i++) {
      const bx = x + 30 + i * 28;
      s += F.rect(bx, y + 32, 26, 34, i === 4 ? 'hi' : 'soft', 2) + F.text(bx + 13, y + 50, str[i], { size: 20, cls: i === 4 ? 'red' : '' });
    }
    s += F.text(x + 100, y + 82, 'kW·h', { size: 13 }) +
      F.text(x + 100, y + 108, '220 V  ' + (o.amp || '10(40) A') + '  50 Hz', { size: 12 }) +
      F.text(x + 100, y + 128, o.imp || '3000 imp/(kW·h)', { size: 12 }) +
      F.circle(x + 62, y + 158, 7, o.on ? 'hi-fill' : 'ink') + F.text(x + 76, y + 158, '指示灯', { a: 'start', size: 12 });
    return s;
  }

  SIMS._p3_6 = { rheoP, sens, dynSeries, dynPar, sensSeries, dial, energyMeter };

  /* ================= 伏安法测电阻 ================= */
  SIMS.p3_6_vam = function (box) {
    const ui = SIMS.ui(box, '伏安法测电阻：定值电阻和小灯泡');
    const fig = ui.fig();
    const kind = ui.buttons(['定值电阻 Rx', '小灯泡（额定电压 2.5 V）'], () => { rows = []; draw(); }, 0);
    const RP = ui.slider({ label: '变阻器接入 R′', min: 0, max: 20, step: 1, value: 20, unit: 'Ω' }, draw);
    ui.action('记录这组数据', () => { if (rows.length < 6) rows.push(cur); draw(); });
    ui.action('清空记录', () => { rows = []; draw(); });
    const out = ui.out();
    ui.note('电源为两节干电池（3 V）。闭合开关前滑片在阻值最大处（R′ = 20 Ω）。拖动滑片，读出两个电表的示数并记录 3~4 组：定值电阻几次算出的电阻几乎相同，求平均值可以减小误差；小灯泡电压越高、灯丝越热，电阻越大，不能求平均。');

    let rows = [], cur = null;
    // 灯丝电阻随电压（温度）升高而变大：R = 5 + 2U（Ω），2.5 V 时为 10 Ω
    function solve(rp, lamp) {
      if (!lamp) { const i = 3 / (10 + rp); return { u: i * 10, i }; }
      let lo = 0, hi = 3;
      for (let k = 0; k < 50; k++) {
        const m = (lo + hi) / 2;
        if (m + m / (5 + 2 * m) * rp > 3) hi = m; else lo = m;
      }
      return { u: lo, i: lo / (5 + 2 * lo) };
    }
    function draw() {
      const lamp = kind.get() === 1, rp = RP.get();
      const r = solve(rp, lamp);
      // 电表读数按最小分度取整（电压 0.1 V，电流 0.02 A 的一半估读到 0.01 A）
      const U = Math.round(r.u * 10) / 10, I = Math.round(r.i * 100) / 100;
      cur = { u: U, i: I };
      const p = -30 + 60 * rp / 20;
      let s = F.wire([[50, 75], [50, 185], [290, 185], [290, 75], [50, 75]]) +
        F.wire([[100, 75], [100, 30], [160, 30], [160, 75]]) + F.node(100, 75) + F.node(160, 75) +
        F.comp('V', 130, 30) + F.comp(lamp ? 'lamp' : 'R', 130, 75, { label: lamp ? 'L' : 'Rx', ly: 24 }) +
        rheoP(225, 75, Math.max(-27, Math.min(27, p)), { label: 'R′' }) +
        F.comp('A', 230, 185) + F.comp('battery', 50, 130, { v: true }) +
        F.comp('switch', 120, 185, { on: true, label: 'S', ly: -20 });
      fig.innerHTML = F.svg(340, 212, s) + F.svg(390, 156, dial(5, 3, 'V', r.u, false) + dial(205, 3, 'A', r.i, false), '电压表用 0~3 V 量程，电流表用 0~0.6 A 量程');
      let html = `读数：<b>U = ${SIMS.fmt(U, 1)} V</b>，<b>I = ${SIMS.fmt(I, 2)} A</b>，R = U/I ≈ <b>${SIMS.fmt(U / I, 1)} Ω</b>` +
        (lamp && U > 2.5 ? '（已超过额定电压，灯偏亮，容易烧坏）' : '');
      if (rows.length) {
        html += '<table class="tbl"><tr><th>次数</th><th>U/V</th><th>I/A</th><th>R/Ω</th></tr>' +
          rows.map((w, k) => `<tr><td>${k + 1}</td><td>${SIMS.fmt(w.u, 1)}</td><td>${SIMS.fmt(w.i, 2)}</td><td>${SIMS.fmt(w.u / w.i, 1)}</td></tr>`).join('') + '</table>';
        if (!lamp) {
          const avg = rows.reduce((a, w) => a + w.u / w.i, 0) / rows.length;
          html += `电阻的平均值 R ≈ <b>${SIMS.fmt(avg, 1)} Ω</b>（几次结果的差别来自读数误差，求平均可以减小误差）`;
        } else {
          html += rows.length > 1 ? '电压越大，灯丝电阻越大——这是温度升高造成的，不是误差，<b>不能求平均值</b>。' : '再换几个位置记录，看看灯丝电阻怎么变。';
        }
        // 记录点的 I–U 图像
        const ax = { x: 50, y: 30, w: 200, h: 120, xmax: 3, ymax: 0.3, xticks: [1, 2, 3], yticks: [0.1, 0.2, 0.3], xlabel: 'U/V', ylabel: 'I/A' };
        let g = SIMS.axes(ax);
        if (!lamp) g += F.line(ax.px(0), ax.py(0), ax.px(3), ax.py(0.3), 'thin dash');
        else {
          const pts = [];
          for (let k = 0; k <= 30; k++) { const u = k / 10; pts.push([ax.px(u), ax.py(u / (5 + 2 * u))]); }
          g += F.poly(pts, 'thin dash');
        }
        rows.forEach(w => { g += `<circle class="hi-fill" cx="${r1(ax.px(w.u))}" cy="${r1(ax.py(w.i))}" r="4"/>`; });
        html += F.svg(300, 180, g, lamp ? '小灯泡的 I–U 图像是一条向电压轴弯曲的曲线' : '定值电阻的 I–U 图像是过原点的直线');
      }
      out.innerHTML = html;
    }
    draw();
  };

  /* ================= 动态电路 ================= */
  SIMS.p3_6_dynamic = function (box) {
    const MODES = ['串联·V 测 R₁', '串联·V 测 R₂', '并联', '热敏电阻'];
    function build(mode) {
      const ui = SIMS.ui(box, '动态电路：电表示数怎么变');
      ui.buttons(MODES, build, mode);
      const fig = ui.fig();
      const thermo = mode === 3;
      const sl = thermo ? ui.slider({ label: '温度 t', min: 0, max: 100, step: 5, value: 20, unit: '℃' }, draw)
        : ui.slider({ label: 'R₂ 接入电阻', min: mode === 2 ? 4 : 0, max: 20, step: 1, value: 10, unit: 'Ω' }, draw);
      const out = ui.out();
      ui.note(['电源电压 6 V，R₁ = 10 Ω。滑片向右移，R₂ 变大：总电阻变大 → 电流变小 → R₁ 两端电压变小。',
        '电源电压 6 V，R₁ = 10 Ω。电压表测变阻器：先算 U₁ = IR₁，再用 U₂ = U − U₁，别用 U₂ = IR₂ 去判断。',
        '电源电压 6 V，R₁ = 10 Ω（R₂ 不能调到 0，否则电源短路）。并联各支路互不影响：A₁ 和 V 都不变，只有 R₂ 支路和干路电流变化。',
        '电源电压 6 V，R₀ = 10 Ω，热敏电阻 Rₜ 的阻值随温度升高而变小（0 ℃ 时 40 Ω，100 ℃ 时 10 Ω）。把敏感电阻当成“会自己变的滑动变阻器”来分析。'][mode]);
      let prev = null;
      const arrow = (a, b) => prev == null || Math.abs(a - b) < 1e-9 ? '' : a > b ? ' <b style="color:var(--fig-force)">↑</b>' : ' <b style="color:var(--fig-hi)">↓</b>';
      function draw() {
        const x = sl.get(), U = 6, R1 = 10;
        let vals, s;
        if (mode <= 1) {
          const I = U / (R1 + x), U1 = I * R1;
          vals = [['R₂', x, 'Ω'], ['总电阻 R', R1 + x, 'Ω'], ['电流表 A', I, 'A'], [mode ? '电压表 V（U₂）' : '电压表 V（U₁）', mode ? U - U1 : U1, 'V']];
          s = F.svg(340, 210, dynSeries({ v: mode ? 'b' : 'a', p: -30 + 60 * x / 20 }));
        } else if (mode === 2) {
          const I1 = U / R1, I2 = U / x;
          vals = [['R₂', x, 'Ω'], ['电流表 A₁', I1, 'A'], ['R₂ 支路电流', I2, 'A'], ['电流表 A', I1 + I2, 'A'], ['电压表 V', U, 'V']];
          s = F.svg(320, 215, dynPar({ p: -30 + 60 * x / 20 }));
        } else {
          const Rt = 40 - 0.3 * x, I = U / (R1 + Rt);
          vals = [['Rₜ', Rt, 'Ω'], ['电流表 A', I, 'A'], ['电压表 V（测 R₀）', I * R1, 'V']];
          s = F.svg(340, 205, sensSeries({ v: 'a', lab: 'Rₜ' }));
        }
        fig.innerHTML = s;
        out.innerHTML = '<table class="tbl"><tr>' + vals.map(v => `<th>${v[0]}</th>`).join('') + '</tr><tr>' +
          vals.map((v, k) => `<td>${SIMS.fmt(v[1], 2)} ${v[2]}${prev ? arrow(v[1], prev[k]) : ''}</td>`).join('') + '</tr></table>' +
          (prev ? '' : '拖动滑块，箭头会标出每个量比上一次变大（↑）还是变小（↓）。');
        prev = vals.map(v => v[1]);
      }
      draw();
    }
    build(0);
  };

  /* ================= 电能表 ================= */
  SIMS.p3_6_meter = function (box) {
    const ui = SIMS.ui(box, '电能表：用了多少电');
    const APP = [{ n: '电热水壶', i: 5 }, { n: '电饭锅', i: 4 }, { n: '电视机', i: 0.5 }];
    const fig = ui.fig();
    const k = ui.buttons(APP.map(a => a.n + '（220 V, ' + a.i + ' A）'), draw, 0);
    const T = ui.slider({ label: '工作时间 t', min: 0, max: 120, step: 1, value: 30, unit: 'min' }, draw);
    const out = ui.out();
    ui.note('家里只让这一个用电器工作。开始时电能表示数为 2168.4 kW·h（最后一位红框是小数）。电能表参数“3000 imp/(kW·h)”：每消耗 1 kW·h 的电能，指示灯闪烁 3000 次。');
    const START = 2168.4;
    function draw() {
      const a = APP[k.get()], t = T.get();
      const W = 220 * a.i * t * 60, kwh = W / 3.6e6, n = Math.floor(kwh * 3000 + 1e-9);
      fig.innerHTML = F.svg(470, 200, energyMeter(10, 5, START, {}) +
        F.arrow(222, 100, 252, 100, { size: 8 }) + energyMeter(262, 5, START + kwh, { on: n > 0 }), '左：开始时　右：工作 ' + t + ' min 后');
      out.innerHTML = `W = UIt = 220 V × ${a.i} A × ${t * 60} s = <b>${SIMS.fmt(W, 0)} J</b> = <b>${SIMS.fmt(kwh, 3)} kW·h</b><br>` +
        `指示灯闪烁 n = ${SIMS.fmt(kwh, 3)} × 3000 ≈ <b>${n} 次</b>；电能表示数变为 ${(Math.floor((START + kwh) * 10 + 1e-6) / 10).toFixed(1)} kW·h`;
    }
    draw();
  };
})();
