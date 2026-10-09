// 第三阶段 物理组 4 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   SIMS.p3_4_electroscope  验电器：带电棒接触金属球，看金属箔张角
//   SIMS.p3_4_circuit       串联、并联电路：开关通断、短路，看灯亮不亮和各处电流
//   SIMS.p3_4_ammeter       电流表读数：两个量程，同一位置读数差 5 倍
// 另外导出 SIMS._p3_4 = { circ, dial, dialSvg }，physics/p3-4.js 的静态图也用它们，保证图和演示一致。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const fmt = (x, d) => SIMS.fmt(x, d);

  /* ================= 通用电路图（矩形回路） ================= */
  // o.rows：从上到下的各行，每行是元件数组，元件写成 [type, label, opts]（type 同 FIG.comp）
  //   只有 1 行 → 串联回路（这一行 + 底边干路）；2 行以上 → 并联（每行一条支路，左右两条竖线相连）
  // o.main：底边（干路）上的元件；o.left：左边竖线上的元件（竖放，放在最后一行和底边之间）
  // o.W 宽（默认 300）；o.gap 行距（默认 64）；o.extra(g) 返回追加的 SVG，g = {xl, xr, ys, yMain, pos, mainPos}
  function circ(o) {
    const W = o.W || 300, xl = 40, xr = W - 40, top = o.top || 40, gap = o.gap || 64;
    const rows = o.rows || [[]], n = rows.length;
    const ys = rows.map((r, i) => top + i * gap);
    const yMain = top + n * gap;
    const place = (items, a, b) => items.map((it, k) => a + (b - a) * (k + 1) / (items.length + 1));
    const pos = rows.map(r => place(r, xl, xr));
    const mainPos = place(o.main || [], xl, xr);
    let s = F.wire([[xl, top], [xl, yMain], [xr, yMain], [xr, top]]);
    ys.forEach((y, i) => {
      s += F.line(xl, y, xr, y, 'ink');
      if (i > 0) s += F.node(xl, y) + F.node(xr, y);
    });
    const comp = (it, x, y, extra) => F.comp(it[0], x, y, Object.assign({ label: it[1] }, extra || {}, it[2] || {}));
    rows.forEach((r, i) => r.forEach((it, k) => { s += comp(it, pos[i][k], ys[i]); }));
    (o.main || []).forEach((it, k) => { s += comp(it, mainPos[k], yMain); });
    const yl0 = ys[n - 1], lp = place(o.left || [], yl0, yMain);
    (o.left || []).forEach((it, k) => { s += comp(it, xl, lp[k], { v: true, lx: -30 }); });
    if (o.extra) s += o.extra({ xl, xr, ys, yMain, pos, mainPos });
    return F.svg(W, yMain + (o.bottom || 26), s, o.cap);
  }

  /* ================= 电流表表盘 ================= */
  // 画在 220×190 的区域内（原点在左上角）；o.val 电流值、o.range 所用量程（0.6 或 3），指针偏转 = val/range；
  // 也可以直接给 o.f（0~1，超过 1 表示超量程）。o.range 给出时，把所用的两个接线柱接上导线。
  // o.x、o.y 平移，o.s 缩放
  function dial(o) {
    o = o || {};
    const cx = 110, cy = 116, R = 86;
    const f = o.f != null ? o.f : (o.range ? o.val / o.range : 0);
    const P = (deg, r) => [cx + r * Math.sin(deg * Math.PI / 180), cy - r * Math.cos(deg * Math.PI / 180)];
    const ang = k => -45 + 90 * k / 30;
    let s = F.rect(0, 0, 220, 150, 'soft', 8) + F.rect(12, 8, 196, 100, 'mask', 4) +
      `<path class="ink" d="M${P(-45, R).join(',')} A${R},${R} 0 0 1 ${P(45, R).join(',')}"/>`;
    for (let k = 0; k <= 30; k++) {
      const len = k % 10 === 0 ? 12 : k % 5 === 0 ? 9 : 6;
      const a = P(ang(k), R - len), b = P(ang(k), R);
      s += F.line(a[0], a[1], b[0], b[1], k % 5 === 0 ? 'ink' : 'thin');
    }
    ['0', '1', '2', '3'].forEach((t, i) => { const p = P(ang(i * 10), R + 11); s += F.text(p[0], p[1], t, { size: 12 }); });
    ['0', '0.2', '0.4', '0.6'].forEach((t, i) => { const p = P(ang(i * 10), R - 24); s += F.text(p[0], p[1], t, { size: 11 }); });
    s += `<text x="${cx}" y="90" text-anchor="middle" dominant-baseline="middle" style="font-size:16px;font-weight:700">A</text>`;
    // 指针（超过量程时打到右边头上再多一点）
    const fa = Math.max(-0.02, Math.min(1.06, f));
    const tip = P(-45 + 90 * fa, R + 2);
    s += `<line class="hi" style="stroke-width:2.5" x1="${cx}" y1="${cy}" x2="${tip[0].toFixed(1)}" y2="${tip[1].toFixed(1)}"/>` + F.dot(cx, cy, 4);
    // 接线柱
    const posts = [[60, '−'], [110, '0.6'], [160, '3']];
    posts.forEach(([x, t]) => {
      const used = o.range && (t === '−' || +t === o.range);
      if (used) s += F.line(x, 162, x, 190, 'ink');
      s += F.circle(x, 160, 6, 'soft') + F.dot(x, 160, 2) + F.text(x + (t === '−' ? -14 : 0), t === '−' ? 160 : 140, t, { size: 13 });
    });
    const tr = `translate(${o.x || 0},${o.y || 0}) scale(${o.s || 1})`;
    return `<g transform="${tr}">${s}</g>`;
  }
  // 单独一张表盘图
  function dialSvg(val, range, cap, scale) {
    const k = scale || 1;
    return F.svg(Math.round(220 * k), Math.round(192 * k), dial({ val, range, s: k }), cap);
  }

  SIMS._p3_4 = { circ, dial, dialSvg };

  /* ================= 演示 1：验电器 ================= */
  SIMS.p3_4_electroscope = function (box) {
    const ui = SIMS.ui(box, '验电器：带电棒接触金属球');
    const fig = ui.fig();
    const rod = ui.buttons(['丝绸摩擦过的玻璃棒（带正电）', '毛皮摩擦过的橡胶棒（带负电）'], draw, 0);
    let q = 0, msg = '验电器原来不带电，两片金属箔合在一起。';
    ui.action('用棒接触金属球', () => {
      const sg = rod.get() === 0 ? 1 : -1, before = q;
      q = Math.max(-4, Math.min(4, q + sg));
      const who = sg > 0 ? '玻璃棒带正电（缺电子），验电器上的一部分<b>电子转移到玻璃棒上</b>' : '橡胶棒带负电（多电子），橡胶棒上的一部分<b>电子转移到验电器上</b>';
      if (before !== 0 && Math.sign(before) !== sg) msg = who + '，和验电器原来带的电荷发生中和，所带电荷变少，张角' + (q === 0 ? '变为零（金属箔闭合）' : '变小') + '。';
      else if (before === q) msg = '这个演示里电荷量最多加到 4 份。';
      else msg = who + '。两片金属箔带上<b>同种电荷</b>，相互排斥而张开；电荷越多，张角越大。';
      draw();
    });
    ui.action('用手摸一下金属球', () => {
      msg = q === 0 ? '验电器本来就不带电。' : '人体是导体，验电器上的电荷经人体导入大地，验电器不再带电，金属箔闭合。';
      q = 0; draw();
    });
    const out = ui.out();
    ui.note('试一试：先用玻璃棒接触两次，再换成橡胶棒接触——张角先变小、闭合，然后又张开。注意：在金属中能移动的是带负电的<b>自由电子</b>，正电荷（原子核）不移动。');

    function signs(x, y, n, sg) {
      let s = '';
      for (let i = 0; i < n; i++) s += F.text(x, y + i * 13, sg > 0 ? '+' : '−', { cls: sg > 0 ? 'red' : 'orange', size: 14 });
      return s;
    }
    function draw() {
      const cx = 230, a = (q === 0 ? 0 : 8 + 9 * Math.abs(q)) * Math.PI / 180, L = 60, hy = 190;
      // 玻璃瓶、金属杆、金属球
      let s = `<path class="ink" d="M180,130 L180,270 L280,270 L280,130 Z"/>` + F.rect(214, 122, 32, 14, 'soft', 2) +
        F.line(cx, 62, cx, hy) + F.circle(cx, 52, 13, 'soft');
      // 金属箔
      const fl = [cx - L * Math.sin(a), hy + L * Math.cos(a)], fr = [cx + L * Math.sin(a), hy + L * Math.cos(a)];
      s += `<line class="hi" style="stroke-width:5" x1="${cx}" y1="${hy}" x2="${fl[0].toFixed(1)}" y2="${fl[1].toFixed(1)}"/>` +
        `<line class="hi" style="stroke-width:5" x1="${cx}" y1="${hy}" x2="${fr[0].toFixed(1)}" y2="${fr[1].toFixed(1)}"/>`;
      if (q !== 0) {
        const n = Math.min(3, Math.abs(q));
        s += signs(fl[0] - 12, hy + 20, n, q) + signs(fr[0] + 12, hy + 20, n, q) +
          F.text(cx, 52, q > 0 ? '+' : '−', { cls: q > 0 ? 'red' : 'orange', size: 16 });
      }
      s += F.text(cx + 30, 52, '金属球', { a: 'start', size: 12 }) + F.text(cx + 58, hy + 30, '金属箔', { a: 'start', size: 12 });
      // 带电棒
      const sg = rod.get() === 0 ? 1 : -1;
      s += `<line class="${sg > 0 ? 'hi' : 'ink'}" style="stroke-width:9;opacity:.75" x1="40" y1="110" x2="200" y2="48"/>`;
      for (let i = 0; i < 4; i++) s += F.text(130 + i * 16, 64 - i * 6 + 20, sg > 0 ? '+' : '−', { cls: sg > 0 ? 'red' : 'orange', size: 14 });
      s += F.text(70, 130, sg > 0 ? '玻璃棒' : '橡胶棒', { size: 13 });
      fig.innerHTML = F.svg(380, 290, s);
      out.innerHTML = msg + `<br>验电器现在${q === 0 ? '<b>不带电</b>' : `带<b>${q > 0 ? '正' : '负'}电</b>（${Math.abs(q)} 份）`}。`;
    }
    draw();
  };

  /* ================= 演示 2：串联、并联电路 ================= */
  SIMS.p3_4_circuit = function (box) {
    const ui = SIMS.ui(box, '串联和并联：开关、短路和电流');
    const fig = ui.fig();
    const mode = ui.buttons(['串联', '并联'], draw, 0);
    const st = { S: true, S1: true, S2: true, short: false };
    const btn = {};
    const lab = { S: '开关 S', S1: '开关 S₁', S2: '开关 S₂' };
    ['S', 'S1', 'S2'].forEach(k => { btn[k] = ui.action('', () => { st[k] = !st[k]; draw(); }); });
    btn.short = ui.action('', () => { st.short = !st.short; draw(); });
    const out = ui.out();
    ui.note('电源电压 3 V，L₁、L₂ 规格不同（这里按 10 Ω、15 Ω 算，后面学了欧姆定律就会算）。灯的亮度按实际功率画。' +
      '串联：断开任何一处，两灯都灭；用导线把 L₁ 两端连起来，L₁ 被<b>短接</b>（不亮），L₂ 更亮。并联：支路开关只管本支路；这时再把 L₁ 两端用导线连起来，就成了<b>电源短路</b>！');

    const U = 3, R1 = 10, R2 = 15;
    function lampGlow(x, y, p) {
      if (!(p > 0)) return '';
      const op = Math.min(1, 0.15 + 0.85 * p / 0.9);
      return `<circle cx="${x}" cy="${y}" r="9" style="fill:var(--fig-ray);opacity:${op.toFixed(2)}"/>` +
        `<circle cx="${x}" cy="${y}" r="17" style="fill:none;stroke:var(--fig-ray);stroke-width:4;opacity:${(op * 0.5).toFixed(2)}"/>` +
        F.line(x - 7, y - 7, x + 7, y + 7) + F.line(x - 7, y + 7, x + 7, y - 7);
    }
    const bridge = (x, y) => F.wire([[x - 30, y], [x - 30, y - 28], [x + 30, y - 28], [x + 30, y]]) + F.node(x - 30, y) + F.node(x + 30, y);

    function draw() {
      const par = mode.get() === 1;
      btn.S1.style.display = btn.S2.style.display = par ? '' : 'none';
      ['S', 'S1', 'S2'].forEach(k => { btn[k].textContent = (st[k] ? '断开' : '闭合') + lab[k]; });
      btn.short.textContent = st.short ? '拆掉 L₁ 两端的导线' : '用导线连接 L₁ 两端';
      let i1 = 0, i2 = 0, i = 0, sc = false, txt;
      if (!par) {
        if (st.S) { i = st.short ? U / R2 : U / (R1 + R2); i1 = st.short ? 0 : i; i2 = i; }
        txt = !st.S ? '开关断开，电路是<b>断路</b>，两灯都不亮。串联电路只有一条路径，一处断开处处断。' :
          st.short ? 'L₁ 被导线<b>短接</b>：电流从导线流过而不经过 L₁，L₁ 不亮；电路总电阻变小，电流变大，L₂ 更亮。' :
            '两灯串联，电流只有一条路径，通过 L₁、L₂ 的电流<b>相等</b>。';
      } else {
        sc = st.short && st.S && st.S1;
        if (st.S && !sc) { i1 = st.S1 && !st.short ? U / R1 : 0; i2 = st.S2 ? U / R2 : 0; i = i1 + i2; }
        txt = sc ? '<b>电源短路！</b>电流不经过任何用电器，从电源正极经导线直接回到负极，电流非常大，会烧坏电源和导线。两灯都不亮。' :
          !st.S ? '干路开关 S 断开，整个电路断开，两灯都不亮——干路开关控制所有用电器。' :
            `两灯并联，电流在分支点分成两路：干路电流 = 各支路电流之和。${!st.S1 || !st.S2 ? '断开的那条支路没有电流，但另一条支路照常工作——并联的用电器互不影响。' : ''}`;
      }
      let s;
      const rowsPar = [[['lamp', 'L₁', { ly: 24 }], ['switch', 'S₁', { on: st.S1 }], ['A', 'A₁']], [['lamp', 'L₂', { ly: 24 }], ['switch', 'S₂', { on: st.S2 }], ['A', 'A₂']]];
      if (!par) {
        s = circ({ W: 360, rows: [[['lamp', 'L₁', { ly: 24 }], ['lamp', 'L₂', { ly: 24 }]]], gap: 100, top: 50, bottom: 40,
          main: [['switch', 'S', { on: st.S }], ['battery', ''], ['A', 'A']],
          extra: g => lampGlow(g.pos[0][0], 50, i1 * i1 * R1) + lampGlow(g.pos[0][1], 50, i2 * i2 * R2) + (st.short ? bridge(g.pos[0][0], 50) : '') +
            F.text(g.mainPos[2], 175, fmt(i, 2) + ' A', { size: 13 }) });
      } else {
        s = circ({ W: 360, rows: rowsPar, gap: 76, top: 50, bottom: 40,
          main: [['switch', 'S', { on: st.S }], ['battery', ''], ['A', 'A']],
          extra: g => lampGlow(g.pos[0][0], g.ys[0], i1 * i1 * R1) + lampGlow(g.pos[1][0], g.ys[1], i2 * i2 * R2) + (st.short ? bridge(g.pos[0][0], g.ys[0]) : '') +
            (sc ? '' : F.text(g.pos[0][2], g.ys[0] + 26, fmt(i1, 2) + ' A', { size: 13 }) + F.text(g.pos[1][2], g.ys[1] + 26, fmt(i2, 2) + ' A', { size: 13 })) +
            (sc ? F.text(180, g.yMain + 30, '电源短路！', { cls: 'red', size: 15 }) : F.text(g.mainPos[2], g.yMain + 26, fmt(i, 2) + ' A', { size: 13 })) });
      }
      fig.innerHTML = s;
      out.innerHTML = txt + (sc ? '' : par ? `<br>I = I₁ + I₂：${fmt(i, 2)} A = ${fmt(i1, 2)} A + ${fmt(i2, 2)} A` : `<br>I = I₁ = I₂ = ${fmt(i, 2)} A`);
    }
    draw();
  };

  /* ================= 演示 3：电流表读数 ================= */
  SIMS.p3_4_ammeter = function (box) {
    const ui = SIMS.ui(box, '电流表的读数：先看量程，再看分度值');
    const fig = ui.fig();
    const rg = ui.buttons(['接“−”和“0.6”（0～0.6 A）', '接“−”和“3”（0～3 A）'], draw, 0);
    const I = ui.slider({ label: '电路中的实际电流', min: 0, max: 2.8, step: 0.02, value: 0.36, unit: 'A' }, draw);
    const out = ui.out();
    ui.note('同一个表盘上有两排数字：上排对应 0～3 A（每大格 1 A，每小格 0.1 A），下排对应 0～0.6 A（每大格 0.2 A，每小格 0.02 A）。指针在同一位置时，大量程的读数是小量程的 <b>5 倍</b>。');

    function draw() {
      const big = rg.get() === 1, range = big ? 3 : 0.6, dv = big ? 0.1 : 0.02, i = I.get();
      const over = i > range + 1e-9;
      const div = Math.round(i / dv);   // 指针大约停在第几小格
      fig.innerHTML = F.svg(240, 200, dial({ val: i, range, x: 10, y: 4 }));
      if (over) out.innerHTML = `<b>超过量程！</b>${i.toFixed(2)} A 大于 0.6 A，指针偏转到最右边以外，可能打弯指针、烧坏电流表。应改接“−”和“3”两个接线柱（用大量程）。`;
      else {
        const small = big && i <= 0.6;
        out.innerHTML = `量程 0～${range} A，分度值 ${dv} A。指针在第 ${div} 小格，读数 = ${div} × ${dv} A = <b>${fmt(div * dv, 2)} A</b>` +
          (small ? '<br>电流不超过 0.6 A 时，用小量程指针偏转更大、读数更精确。' : '') +
          (big ? '' : `<br>如果误按 0～3 A 那排读，会读成 ${fmt(div * 0.1, 2)} A（正好是 5 倍）。`);
      }
    }
    draw();
  };
})();
