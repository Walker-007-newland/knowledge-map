// 第四阶段 化学题型技能 互动演示（清单见 docs/phase4-spec.md）
//   c4_3_mix  向盐酸和氯化钙的混合溶液（制 CO₂ 后的废液）中滴加碳酸钠溶液：同一个过程的 pH、气体、沉淀、NaCl、溶液质量五条曲线
// 另导出 SIMS._c4_3 = { plot, panels, mixVal, mixFig }：chemistry/c4-3.js 用它们画坐标图（本文件先加载）。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  /* ---------- 通用坐标图 ----------
     o: xmax ymax xticks yticks xlabel ylabel（同 SIMS.axes）；x0 y0 w h 坐标区位置与大小
        xlab [[值,'文字']] / ylab [[值,'文字']]   自定义刻度文字（如 a、b、P₀）
        hdash [y]  水平虚线（横贯）；vdash [x] 竖直虚线；guides [[x,y]] 从点向两轴画虚线
        series [{pts | f, from, to, cls, label, at, dx, dy, a}]  图线（f 为函数时自动取点）
        dots [[x, y, '标签', dx, dy]]；raw: true 时只返回内部 SVG 片段（拼多图用）；W H caption */
  function plot(o) {
    const ax = {
      x: o.x0 != null ? o.x0 : 52, y: o.y0 != null ? o.y0 : 38, w: o.w || 230, h: o.h || 140,
      xmax: o.xmax, ymax: o.ymax, xticks: o.xticks || [], yticks: o.yticks || [], xlabel: o.xlBelow ? '' : o.xlabel, ylabel: o.ylabel
    };
    let s = SIMS.axes(ax);
    if (o.xlBelow) s += F.text(ax.x + ax.w + 14, ax.y + ax.h + 32, o.xlabel, { cls: 'it', size: 13, a: 'end' });   // 横轴名写在刻度下面一行，避免压住图线
    const X = ax.px, Y = ax.py;
    (o.hdash || []).forEach(v => { s += F.line(X(0), Y(v), X(ax.xmax), Y(v), 'thin dash'); });
    (o.vdash || []).forEach(v => { s += F.line(X(v), Y(0), X(v), ax.y + 6, 'thin dash'); });
    (o.guides || []).forEach(([a, b]) => { s += F.line(X(a), Y(b), X(a), Y(0), 'thin dash') + F.line(X(0), Y(b), X(a), Y(b), 'thin dash'); });
    (o.xlab || []).forEach(([v, t]) => { s += F.line(X(v), ax.y + ax.h, X(v), ax.y + ax.h + 4, 'thin') + F.text(X(v), ax.y + ax.h + 15, t, { size: 12 }); });
    (o.ylab || []).forEach(([v, t]) => { s += F.line(ax.x - 4, Y(v), ax.x, Y(v), 'thin') + F.text(ax.x - 7, Y(v), t, { size: 12, a: 'end' }); });
    (o.series || []).forEach(sr => {
      let pts = sr.pts;
      if (sr.f) {
        pts = [];
        const a = sr.from || 0, b = sr.to != null ? sr.to : ax.xmax;
        for (let i = 0; i <= 160; i++) { const x = a + (b - a) * i / 160; pts.push([x, sr.f(x)]); }
      }
      s += F.poly(pts.map(([x, y]) => [X(x), Y(y)]), sr.cls || 'hi');
      if (sr.label) {
        const p = sr.at || pts[pts.length - 1];
        s += F.text(X(p[0]) + (sr.dx != null ? sr.dx : 6), Y(p[1]) + (sr.dy || 0), sr.label, { a: sr.a || 'start', size: 13 });
      }
    });
    (o.dots || []).forEach(([x, y, t, dx, dy]) => {
      s += F.dot(X(x), Y(y), 3.5) + (t ? F.text(X(x) + (dx == null ? 8 : dx), Y(y) + (dy == null ? -10 : dy), t, { cls: 'it', size: 14 }) : '');
    });
    if (o.raw) return s;
    return F.svg(o.W || ax.x + ax.w + (o.padR != null ? o.padR : 40), o.H || ax.y + ax.h + (o.padB != null ? o.padB : o.xlBelow ? 44 : 30), s, o.caption);
  }

  // 2 列排的若干小图（选项 ①②③④ 用）。list: plot 的参数（不用写位置），每个小图下方标 ①②…
  function panels(list, caption) {
    const N = ['①', '②', '③', '④', '⑤', '⑥'];
    let s = '';
    list.forEach((p, i) => {
      const c = i % 2, r = Math.floor(i / 2), x0 = c * 205 + 48, y0 = r * 158 + 36;
      s += plot(Object.assign({}, p, { raw: true, x0, y0, w: 128, h: 82 }));
      s += F.text(x0 + 64, y0 + 82 + 34, N[i], { size: 15 });
    });
    return F.svg(410, Math.ceil(list.length / 2) * 158 + 14, s, caption);
  }

  /* ---------- 盐酸 + 氯化钙 混合溶液中滴加碳酸钠溶液 ----------
     100 g 废液中含 HCl 3.65 g、CaCl₂ 5.55 g；滴加溶质质量分数为 10.6% 的 Na₂CO₃ 溶液 x g。
     0～50 g：Na₂CO₃ + 2HCl ＝ 2NaCl + H₂O + CO₂↑（共放出 2.2 g CO₂）
     50～100 g：Na₂CO₃ + CaCl₂ ＝ CaCO₃↓ + 2NaCl（共生成 5 g CaCO₃）；100 g 以后 Na₂CO₃ 过量 */
  function mixVal(k, x) {
    const gas = Math.min(x, 50) * 0.044;
    const ppt = Math.max(0, Math.min(x, 100) - 50) * 0.1;
    if (k === 'gas') return gas;
    if (k === 'ppt') return ppt;
    if (k === 'nacl') return Math.min(x, 100) * 0.117;
    if (k === 'sol') return 100 + x - gas - ppt;
    // pH 曲线是示意：盐酸阶段由约 1 缓慢上升、接近 a 点时陡升到 7；a～b 之间保持 7；b 之后碳酸钠过量，pH 升到约 11.6
    if (x < 50) return 1 + 6 * Math.pow(x / 50, 8);
    if (x <= 100) return 7;
    return 7 + 4.6 * (1 - Math.exp(-(x - 100) / 6));
  }
  const MIXK = {
    pH: { ylabel: 'pH', ymax: 14, ylab: [[7, '7']] },
    gas: { ylabel: '气体质量/g', ymax: 3, ylab: [[2.2, '2.2']] },
    ppt: { ylabel: '沉淀质量/g', ymax: 6.5, ylab: [[5, '5']] },
    nacl: { ylabel: 'NaCl 质量/g', ymax: 15, ylab: [[11.7, '11.7']] },
    sol: { ylabel: '溶液质量/g', ymax: 270, ylab: [[100, '100']] }
  };
  // kind：pH | gas | ppt | nacl | sol；o.letters 用 a、b 代替 50、100；o.noY 不标纵轴数值
  function mixFig(kind, o) {
    o = o || {};
    const m = MIXK[kind];
    return plot({
      xmax: 150, ymax: m.ymax, xlabel: 'm(Na₂CO₃溶液)/g', xlBelow: true, ylabel: m.ylabel,
      xlab: o.letters ? [[50, 'a'], [100, 'b']] : [[50, '50'], [100, '100']],
      ylab: o.noY ? [] : m.ylab,
      hdash: kind === 'pH' ? [7] : [],
      vdash: o.vdash === false ? [] : [50, 100],
      series: [{ f: x => mixVal(kind, x) }],
      w: o.w || 250, h: o.h || 140, padR: 30, caption: o.caption
    });
  }

  SIMS._c4_3 = { plot, panels, mixVal, mixFig };

  /* ================= 演示：一个过程，五条曲线 ================= */
  SIMS.c4_3_mix = function (box) {
    const ui = SIMS.ui(box, '向盐酸和氯化钙的混合溶液中滴加碳酸钠溶液');
    const fig = ui.fig();
    const KEYS = ['pH', 'gas', 'ppt', 'nacl', 'sol'];
    const NAMES = ['pH', '气体质量', '沉淀质量', 'NaCl 质量', '溶液质量'];
    let k = 0;
    ui.buttons(NAMES, i => { k = i; draw(); }, 0);
    const sl = ui.slider({ label: '加入 Na₂CO₃ 溶液', min: 0, max: 150, step: 1, value: 30, unit: 'g' }, () => draw());
    const out = ui.out();
    ui.note('废液 100 g，含 HCl 3.65 g、CaCl₂ 5.55 g；碳酸钠溶液的溶质质量分数为 10.6%。pH 曲线只画趋势（示意），质量按方程式计算。');
    const f1 = v => String(+v.toFixed(2));
    function draw() {
      const x = sl.get(), key = KEYS[k], m = MIXK[key], y = mixVal(key, x);
      const ax = { x: 56, y: 40, w: 300, h: 160, xmax: 150, ymax: m.ymax };
      let s = plot({
        raw: true, x0: ax.x, y0: ax.y, w: ax.w, h: ax.h, xmax: 150, ymax: m.ymax, xlabel: 'm(Na₂CO₃溶液)/g', xlBelow: true, ylabel: m.ylabel,
        xlab: [[50, '50'], [100, '100']], ylab: m.ylab, hdash: key === 'pH' ? [7] : [], vdash: [50, 100],
        series: [{ f: t => mixVal(key, t) }]
      });
      const px = ax.x + x / 150 * ax.w, py = ax.y + ax.h - y / m.ymax * ax.h;
      s += F.line(px, ax.y + ax.h, px, py, 'thin') + `<circle class="hi-fill" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="5"/>`;
      s += F.text(ax.x + 25 / 150 * ax.w, ax.y + 8, '① 产生气泡', { size: 12 }) + F.text(ax.x + 75 / 150 * ax.w, ax.y + 8, '② 产生沉淀', { size: 12 }) +
        F.text(ax.x + 125 / 150 * ax.w, ax.y + 8, '③ Na₂CO₃ 过量', { size: 12 });
      fig.innerHTML = F.svg(400, 248, s);
      const gas = mixVal('gas', x), ppt = mixVal('ppt', x), nacl = mixVal('nacl', x);
      let st;
      if (x < 50) st = `<b>第 ① 段</b>：碳酸钠先与<b>盐酸</b>反应（Na₂CO₃ + 2HCl ＝ 2NaCl + H₂O + CO₂↑），看到<b>气泡</b>。就算生成了一点 CaCO₃，也会马上被盐酸溶解，所以这一段<b>没有沉淀</b>。溶液中的溶质：CaCl₂、NaCl、${x === 0 ? '' : '剩余的 '}HCl。`;
      else if (x === 50) st = '<b>a 点（50 g）</b>：盐酸恰好反应完，pH = 7，气体不再增加。溶液中的溶质：NaCl、CaCl₂。';
      else if (x < 100) st = '<b>第 ② 段</b>：碳酸钠与<b>氯化钙</b>反应（Na₂CO₃ + CaCl₂ ＝ CaCO₃↓ + 2NaCl），产生<b>白色沉淀</b>；溶液呈中性，pH 保持 7。溶质：NaCl、剩余的 CaCl₂。';
      else if (x === 100) st = '<b>b 点（100 g）</b>：氯化钙恰好反应完，沉淀达到最大值。溶液中的溶质只有 NaCl。';
      else st = '<b>第 ③ 段</b>：碳酸钠<b>过量</b>，不再反应，碳酸钠溶液显碱性，pH 升高到 7 以上。溶质：NaCl、Na₂CO₃。';
      out.innerHTML = `${st}<br>此时：气体 ${f1(gas)} g，沉淀 ${f1(ppt)} g，NaCl ${f1(nacl)} g，溶液 ${f1(mixVal('sol', x))} g。` +
        (key === 'nacl' ? '<br><span class="muted">两个反应都是 1 份 Na₂CO₃ 生成 2 份 NaCl，所以 NaCl 的图线在 0～100 g 是<b>同一条直线</b>，没有转折。</span>' : '') +
        (key === 'sol' ? '<br><span class="muted">溶液质量 = 100 g + 加入的溶液 − 气体 − 沉淀。①段每 100 g 少 4.4 g，②段每 100 g 少 10 g，③段不减少，三段略有不同，但一直在增大。</span>' : '');
    }
    draw();
  };
})();
