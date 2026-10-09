// 化学互动演示（写法见 js/sims.js 顶部说明）
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  const SUBD = '₀₁₂₃₄₅₆₇₈₉';
  const uniSub = s => String(s).replace(/\d/g, d => SUBD[d]);                      // 'SO4' → 'SO₄'（SVG 里用）
  const htmlSub = s => String(s).replace(/([A-Za-z)])(\d+)/g, '$1<sub>$2</sub>');  // HTML 里用
  const chem = s => `<span class="chem">${htmlSub(s)}</span>`;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const sgn = v => (v > 0 ? '+' : '−') + Math.abs(v);
  const CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

  // 相对原子质量
  const AR = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, P: 31, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 64, Zn: 65, Ba: 137 };

  /* ---------- 化合价与化学式 ---------- */
  // id 唯一键；sym 写法（数字是下标）；v 化合价；comp 组成；grp 原子团；inner 原子团内各元素的化合价
  const POS = [
    { id: 'H', sym: 'H', v: 1, comp: { H: 1 }, name: '氢' },
    { id: 'Na', sym: 'Na', v: 1, comp: { Na: 1 }, name: '钠' },
    { id: 'K', sym: 'K', v: 1, comp: { K: 1 }, name: '钾' },
    { id: 'NH4', sym: 'NH4', v: 1, comp: { N: 1, H: 4 }, name: '铵', grp: '铵根', inner: 'N −3，H +1' },
    { id: 'Mg', sym: 'Mg', v: 2, comp: { Mg: 1 }, name: '镁' },
    { id: 'Ca', sym: 'Ca', v: 2, comp: { Ca: 1 }, name: '钙' },
    { id: 'Ba', sym: 'Ba', v: 2, comp: { Ba: 1 }, name: '钡' },
    { id: 'Zn', sym: 'Zn', v: 2, comp: { Zn: 1 }, name: '锌' },
    { id: 'Cu', sym: 'Cu', v: 2, comp: { Cu: 1 }, name: '铜' },
    { id: 'Fe2', sym: 'Fe', v: 2, comp: { Fe: 1 }, name: '亚铁' },
    { id: 'Fe3', sym: 'Fe', v: 3, comp: { Fe: 1 }, name: '铁' },
    { id: 'Al', sym: 'Al', v: 3, comp: { Al: 1 }, name: '铝' },
    { id: 'C', sym: 'C', v: 4, comp: { C: 1 }, name: '碳', nonmetal: true },
    { id: 'S', sym: 'S', v: 4, comp: { S: 1 }, name: '硫', nonmetal: true },
    { id: 'P', sym: 'P', v: 5, comp: { P: 1 }, name: '磷', nonmetal: true }
  ];
  const NEG = [
    { id: 'Cl', sym: 'Cl', v: -1, comp: { Cl: 1 }, kind: '氯化', acid: '氯化氢（水溶液叫盐酸）' },
    { id: 'OH', sym: 'OH', v: -1, comp: { O: 1, H: 1 }, kind: '氢氧化', grp: '氢氧根', inner: 'O −2，H +1' },
    { id: 'NO3', sym: 'NO3', v: -1, comp: { N: 1, O: 3 }, kind: '硝酸', grp: '硝酸根', inner: 'N +5，O −2', acid: '硝酸' },
    { id: 'O', sym: 'O', v: -2, comp: { O: 1 }, kind: '氧化' },
    { id: 'SO4', sym: 'SO4', v: -2, comp: { S: 1, O: 4 }, kind: '硫酸', grp: '硫酸根', inner: 'S +6，O −2', acid: '硫酸' },
    { id: 'CO3', sym: 'CO3', v: -2, comp: { C: 1, O: 3 }, kind: '碳酸', grp: '碳酸根', inner: 'C +4，O −2', acid: '碳酸' },
    { id: 'PO4', sym: 'PO4', v: -3, comp: { P: 1, O: 4 }, kind: '磷酸', grp: '磷酸根', inner: 'P +5，O −2', acid: '磷酸' }
  ];
  // 需要特别说明的组合
  const SPECIAL = {
    'H|OH': { show: 'H2O', note: '交叉得到“HOH”，其实就是水，写作 H₂O。H⁺ 与 OH⁻ 结合成水，正是中和反应的实质。' },
    'NH4|OH': { show: 'NH3·H2O', note: '交叉得 NH₄OH，实际写作 NH₃·H₂O（一水合氨，氨水的溶质），初中认识即可。' },
    'NH4|O': { bad: '铵根不能和氧直接组成化合物——按化合价能“写”出来，但这种物质不存在。' },
    'Fe3|CO3': { bad: '按化合价能写出来，但这种物质在水溶液中不能稳定存在，中考不会考。' },
    'Cu|CO3': { note: '按化合价写作 CuCO₃，但它在初中基本不出现；常见的是铜绿——碱式碳酸铜 Cu₂(OH)₂CO₃。' },
    'Al|CO3': { bad: '按化合价能写出来，但这种物质在水溶液中不能稳定存在，中考不会考。' }
  };

  const part = (it, k) => (k > 1 ? (it.grp ? '(' + it.sym + ')' + k : it.sym + k) : it.sym);
  const massOf = comp => Object.keys(comp).reduce((m, e) => m + AR[e] * comp[e], 0);
  const massExpr = (it, k) => {
    const keys = Object.keys(it.comp);
    const inner = keys.map(e => AR[e] + (it.comp[e] > 1 ? '×' + it.comp[e] : '')).join('+');
    const wrap = keys.length > 1 || it.comp[keys[0]] > 1 ? '(' + inner + ')' : inner;
    return k === 1 ? wrap : wrap + '×' + k;
  };
  function nameOf(p, n, np, nn) {
    if (p.id === 'H') return n.id === 'O' || n.id === 'OH' ? '水' : n.acid;
    if (p.nonmetal) return (nn > 1 ? CN[nn] : '') + '氧化' + (np > 1 ? CN[np] : '') + p.name;
    return n.kind + p.name;
  }
  // 粗略估计 SVG 文字宽度
  const tw = (s, size) => [...s].reduce((w, ch) => w + size * (/[₀-₉]/.test(ch) ? 0.5 : /[()]/.test(ch) ? 0.4 : /[A-Z]/.test(ch) ? 0.78 : 0.6), 0);

  SIMS.valence = function (box) {
    const ui = SIMS.ui(box, '交叉法写化学式');
    let pi = 11, ni = 3;   // 默认：Al 与 O
    ui.note('<b>① 选正价部分</b>（金属元素、氢、铵根，或与氧结合的非金属）：');
    ui.buttons(POS.map(p => uniSub(p.sym) + '（' + sgn(p.v) + '）'), i => { pi = i; draw(); }, pi);
    ui.note('<b>② 选负价部分</b>（非金属元素或原子团）：');
    ui.buttons(NEG.map(n => uniSub(n.sym) + '（' + sgn(n.v) + '）'), i => { ni = i; draw(); }, ni);
    const fig = ui.fig();
    const out = ui.out();
    ui.note('步骤：正价在前、负价在后 → 化合价绝对值交叉写到对方右下角 → 能约简的约成最简比 → 用“正负化合价代数和为零”验算。原子团个数大于 1 时要加括号，“1”不写。');

    function draw() {
      const p = POS[pi], n = NEG[ni], key = p.id + '|' + n.id, sp = SPECIAL[key] || {};
      const a = -n.v, b = p.v, g = gcd(a, b), np = a / g, nn = b / g;
      const lx = 110, rx = 240, big = 26, small = 16;
      let s = '';
      // 第 1 行：化合价；第 2 行：符号
      s += F.text(lx, 34, sgn(p.v), { cls: 'orange', size: 17 }) + F.text(rx, 34, sgn(n.v), { cls: 'orange', size: 17 });
      s += F.text(lx, 72, uniSub(p.sym), { size: big }) + F.text(rx, 72, uniSub(n.sym), { size: big });

      if (p.nonmetal && n.id !== 'O') {
        fig.innerHTML = F.svg(540, 190, s + F.text(270, 130, '非金属的正价一般只和氧组合（写氧化物），请选 O', { size: 15 }));
        out.innerHTML = `${p.name}（${sgn(p.v)}）这里只演示它和氧形成的氧化物。请把负价部分选成 <b>O（−2）</b>。`;
        return;
      }
      // 第 3 行：交叉后的式子（未约简）
      const lt = uniSub(p.grp && a > 1 ? '(' + p.sym + ')' : p.sym), rt = uniSub(n.grp && b > 1 ? '(' + n.sym + ')' : n.sym);
      const lsx = lx + tw(lt, big) / 2 + 4, rsx = rx + tw(rt, big) / 2 + 4;
      s += F.text(lx, 146, lt, { size: big }) + F.text(rx, 146, rt, { size: big });
      const subTxt = (x, k) => `<text x="${x.toFixed(1)}" y="158" text-anchor="start" dominant-baseline="middle" class="orange" style="font-size:${small}px${k === 1 ? ';opacity:.45' : ''}">${k}</text>`;
      s += subTxt(lsx, a) + subTxt(rsx, b);
      s += F.arrow(lx + 6, 90, rsx + 4, 144, { cls: 'ray', size: 7 }) + F.arrow(rx - 6, 90, lsx + 4, 144, { cls: 'ray', size: 7 });
      // 右侧：结果
      const plain = part(p, np) + part(n, nn), raw = part(p, a) + part(n, b);
      const shown = sp.show || plain;
      if (g > 1) s += F.text(400, 112, '约简（÷' + g + '）', { size: 13 });
      s += F.text(342, 146, '→', { size: 22 });
      s += F.text(362, 146, uniSub(shown), { a: 'start', size: 24 });
      if (sp.bad) s += F.line(358, 146, 362 + tw(uniSub(shown), 24), 146, 'force');
      fig.innerHTML = F.svg(540, 190, s);

      // 文字说明
      const mr = massOf(p.comp) * np + massOf(n.comp) * nn;
      const vals = [
        p.grp ? `${p.grp} ${chem(p.sym)}：${sgn(p.v)}（其中 ${p.inner}）` : `${p.sym}：${sgn(p.v)}`,
        n.grp ? `${n.grp} ${chem(n.sym)}：${sgn(n.v)}（其中 ${n.inner}）` : `${n.sym}：${sgn(n.v)}`
      ];
      let html = '';
      if (sp.bad) {
        html += `交叉得 ${chem(plain)}，但是：${sp.bad}`;
      } else {
        html += `化学式：<b>${chem(shown)}</b>　读作：${key === 'NH4|OH' ? '一水合氨' : nameOf(p, n, np, nn)}`;
        if (sp.note) html += `<br><span class="muted">${sp.note}</span>`;
      }
      html += `<br>化合价：${vals.join('；')}`;
      if (g > 1) html += `<br>交叉后得 ${chem(raw)}，${a} 和 ${b} 有公约数 ${g}，约简为 ${chem(plain)}`;
      html += `<br>验算：(${sgn(p.v)})×${np} + (${sgn(n.v)})×${nn} = ${p.v * np} − ${-n.v * nn} = <b>0</b> ✓`;
      if (!sp.bad) html += `<br>相对分子质量：${massExpr(p, np)} + ${massExpr(n, nn)} = <b>${SIMS.fmt(mr, 1)}</b>`;
      out.innerHTML = html;
    }
    draw();
  };

  /* ---------- 中和反应：滴加稀盐酸 ---------- */
  // 20 mL 氢氧化钠溶液，滴入等浓度的稀盐酸，加到 20 mL 恰好完全反应（用于画出逼真的 pH 曲线）
  function pHAt(v) {
    const d = (20 - v) * 0.1 / (20 + v), kw = 1e-14;
    if (d >= 0) return 14 + Math.log10((d + Math.sqrt(d * d + 4 * kw)) / 2);
    return -Math.log10((-d + Math.sqrt(d * d + 4 * kw)) / 2);
  }

  SIMS.neutralization = function (box) {
    const ui = SIMS.ui(box, '向滴有酚酞的氢氧化钠溶液中滴加稀盐酸');
    const fig = ui.fig();
    const V = ui.slider({ label: '加入稀盐酸', min: 0, max: 40, step: 0.5, value: 0, unit: 'mL' }, draw);
    const out = ui.out();
    ui.note('烧杯中是 20 mL 氢氧化钠溶液，滴入的稀盐酸浓度与它相当，加到 20 mL 时恰好完全反应。注意：酚酞在 pH 小于约 8.2 时就是无色的，所以“红色恰好褪去”可以看作恰好完全反应；但继续加盐酸，溶液仍是无色——无色不能证明恰好中和。');

    function draw() {
      const v = V.get(), ph = pHAt(v);
      let s = '';
      // 滴定管（装稀盐酸），液面随加入量下降
      const top = 30 + v / 40 * 70;
      s += F.rect(92, 22, 12, 98, 'thin', 2) + F.rect(93, top, 10, 120 - top, 'water');
      for (let y = 30; y <= 100; y += 14) s += F.line(92, y, 98, y, 'thin');
      s += F.rect(91, 120, 14, 5, 'soft') + F.line(98, 125, 98, 134, 'ink');
      if (v > 0 && v < 40) s += F.circle(98, 141, 3, 'hi-fill');
      s += F.text(112, 34, '稀盐酸', { a: 'start', size: 13 });
      // 烧杯中的溶液：碱性时酚酞显红色，pH 越大越深
      const bx = 50, by = 150, bw = 100, bh = 66, level = (20 + v) / 80;
      const wy = by + bh * (1 - level);
      const alpha = ph >= 10 ? 0.55 : ph > 8.2 ? 0.55 * (ph - 8.2) / 1.8 : 0;
      s += F.rect(bx, wy, bw, by + bh - wy, 'water');
      if (alpha > 0) s += `<rect x="${bx}" y="${wy.toFixed(1)}" width="${bw}" height="${(by + bh - wy).toFixed(1)}" style="fill:rgb(225,40,130);fill-opacity:${alpha.toFixed(2)}"/>`;
      s += F.beaker(bx, by, bw, bh, 0, { spout: true });
      s += F.text(100, 236, '氢氧化钠溶液 + 酚酞', { size: 13 });
      s += F.text(170, 170, 'pH ≈ ' + SIMS.fmt(ph, 1), { a: 'start', size: 15 });
      s += F.text(170, 194, alpha > 0.3 ? '红色' : alpha > 0 ? '浅红色' : '无色', { a: 'start', size: 14 });

      // pH 曲线
      const ax = { x: 340, y: 46, w: 200, h: 160, xmax: 40, ymax: 14, xticks: [10, 20, 30], yticks: [7, 14], xlabel: 'V/mL', ylabel: 'pH' };
      s += SIMS.axes(ax);
      s += F.line(ax.px(0), ax.py(7), ax.px(40), ax.py(7), 'thin dash');
      const cur = [ax.px(v), ax.py(ph)], done = [], rest = [cur];
      for (let i = 0; i <= 400; i++) {
        const x = i / 10, pt = [ax.px(x), ax.py(pHAt(x))];
        if (x < v) done.push(pt);
        else if (x > v) rest.push(pt);
      }
      done.push(cur);
      if (rest.length > 1) s += F.poly(rest, 'thin dash');
      if (done.length > 1) s += F.poly(done, 'hi');
      s += `<circle class="hi-fill" cx="${ax.px(v).toFixed(1)}" cy="${ax.py(ph).toFixed(1)}" r="5"/>`;
      fig.innerHTML = F.svg(600, 264, s);

      // 溶质与离子
      let state, solute, ions;
      if (v === 0) { state = '还没加盐酸'; solute = chem('NaOH'); ions = 'Na⁺、OH⁻'; }
      else if (v < 20) { state = '氢氧化钠有剩余'; solute = chem('NaOH') + ' 和 ' + chem('NaCl'); ions = 'Na⁺、OH⁻、Cl⁻'; }
      else if (v === 20) { state = '恰好完全反应'; solute = chem('NaCl'); ions = 'Na⁺、Cl⁻'; }
      else { state = '盐酸过量'; solute = chem('NaCl') + ' 和 ' + chem('HCl'); ions = 'Na⁺、Cl⁻、H⁺'; }
      const kind = ph > 7.05 ? '碱性' : ph < 6.95 ? '酸性' : '中性';
      out.innerHTML = `加入稀盐酸 <b>${SIMS.fmt(v, 1)} mL</b>：pH ≈ <b>${SIMS.fmt(ph, 1)}</b>，溶液呈${kind}（${state}）` +
        `<br>溶液中的溶质：${solute}　主要离子：${ions}` +
        `<br>反应：${chem('NaOH')} + ${chem('HCl')} = ${chem('NaCl')} + ${chem('H2O')}，实质是 H⁺ + OH⁻ → ${chem('H2O')}`;
    }
    draw();
  };
})();
