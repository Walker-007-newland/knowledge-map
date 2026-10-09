// 第四阶段 化学题型技能 互动演示（清单见 docs/phase4-spec.md）
//   c4_2_infer  框图推断“破题”分步演示（碳酸钙—氧化钙—氢氧化钙转化图）
//   c4_2_micro  微观示意图“抵消法”：划去没参加反应的分子，读出化学计量数
// 另外导出 SIMS._c4_2 = { ball, mol, legend, react, eqFig, boxes, G4, MIX, molFig, flowBox, flowArrow, gNode, gLink, uni, inferFig }，
// chemistry/c4-2.js 的静态图也用它们画，保证图和演示一致（本文件先加载）。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  const SUBD = '₀₁₂₃₄₅₆₇₈₉';
  // SVG 里不能用 <sub>：CaCO3 → CaCO₃
  const uni = s => String(s).replace(/([A-Za-z)])(\d+)/g, (m, a, d) => a + d.replace(/\d/g, x => SUBD[x]));
  const htmlSub = s => String(s).replace(/([A-Za-z)])(\d+)/g, '$1<sub>$2</sub>');
  const chem = s => `<span class="chem">${htmlSub(s)}</span>`;

  /* ================= 微观粒子 ================= */
  // 球的外观（深色模式下颜色由 CSS 变量自动切换，靠“大小 + 填充”区分）：
  //   w 小白球  W 大白球  k 黑球（深色模式下为浅色实心球）  b 蓝球  o 橙球  r 红球（同一张图里不同时用 o 和 r）
  const LOOK = { w: [6, 'soft'], W: [11, 'soft'], k: [9, 'solid'], b: [9.5, 'hi-fill'], o: [9, 'ray-head'], r: [11, 'force-head'] };
  // 元素 → 外观（默认），名称
  const ELOOK = { H: 'w', O: 'k', C: 'b', N: 'o', S: 'r', Cl: 'r', Si: 'W', Cu: 'W', Mg: 'W' };
  const ENAME = { H: '氢原子', O: '氧原子', C: '碳原子', N: '氮原子', S: '硫原子', Cl: '氯原子', Si: '硅原子', Cu: '铜原子', Mg: '镁原子' };
  const r1 = v => Math.round(v * 10) / 10;
  function ball(x, y, k) {
    const [r, c] = LOOK[k];
    return `<circle class="${c}" cx="${r1(x)}" cy="${r1(y)}" r="${r}" style="stroke:var(--fig-ink);stroke-width:1.2"/>`;
  }
  // 分子形状：[元素, dx, dy]，按顺序画（后画的在上面）
  const SHAPE = {
    H2: [['H', -5, 0], ['H', 5, 0]],
    O2: [['O', -8, 0], ['O', 8, 0]],
    O3: [['O', -14, 5], ['O', 14, 5], ['O', 0, -4]],
    N2: [['N', -8, 0], ['N', 8, 0]],
    Cl2: [['Cl', -10, 0], ['Cl', 10, 0]],
    H2O: [['H', -10, 7], ['H', 10, 7], ['O', 0, -2]],
    H2O2: [['H', -19, 6], ['H', 19, 6], ['O', -7, -2], ['O', 7, -2]],
    H2S: [['H', -12, 8], ['H', 12, 8], ['S', 0, -2]],
    CO: [['C', -8, 0], ['O', 8, 0]],
    CO2: [['O', -16, 0], ['O', 16, 0], ['C', 0, 0]],
    SO2: [['O', -15, 7], ['O', 15, 7], ['S', 0, -3]],
    SO3: [['O', -17, 8], ['O', 17, 8], ['O', 0, -17], ['S', 0, 1]],
    NO: [['N', -8, 0], ['O', 8, 0]],
    NO2: [['O', -15, 7], ['O', 15, 7], ['N', 0, -3]],
    HCl: [['H', -10, 0], ['Cl', 4, 0]],
    HClO: [['H', -18, 6], ['O', -6, 0], ['Cl', 12, 0]],
    NH3: [['H', -12, 7], ['H', 12, 7], ['H', 0, -13], ['N', 0, 1]],
    CH4: [['H', -11, -9], ['H', 11, -9], ['H', -11, 9], ['H', 11, 9], ['C', 0, 0]],
    CH3OH: [['H', -19, -8], ['H', -19, 8], ['H', -8, -14], ['C', -8, 1], ['H', 17, 10], ['O', 9, 0]],
    SiCl4: [['Cl', -15, -12], ['Cl', 15, -12], ['Cl', -15, 12], ['Cl', 15, 12], ['Si', 0, 0]],
    CuO: [['Cu', -7, 0], ['O', 11, 0]],
    MgO: [['Mg', -7, 0], ['O', 11, 0]],
    C: [['C', 0, 0]], S: [['S', 0, 0]], Si: [['Si', 0, 0]], Cu: [['Cu', 0, 0]], Mg: [['Mg', 0, 0]], H: [['H', 0, 0]], O: [['O', 0, 0]]
  };
  const elemsOf = names => {
    const seen = [];
    names.forEach(n => SHAPE[n].forEach(([e]) => { if (!seen.includes(e)) seen.push(e); }));
    return seen;
  };
  // 一个分子，中心 (x,y)；look 可覆盖元素外观
  function mol(x, y, name, look) {
    const L = Object.assign({}, ELOOK, look || {});
    return SHAPE[name].map(([e, dx, dy]) => ball(x + dx, y + dy, L[e])).join('');
  }
  // 图例：items = [[元素, 文字]]，从 (x,y) 起横排
  function legend(x, y, items, look, gap) {
    const L = Object.assign({}, ELOOK, look || {});
    gap = gap || 104;
    return items.map(([e, t], i) => ball(x + i * gap, y, L[e]) + F.text(x + i * gap + 15, y, t, { a: 'start', size: 13 })).join('');
  }
  const autoLegend = (names, o) => elemsOf(names).map(e => [e, (o.names && o.names[e]) || ENAME[e]]);

  // 反应前 → 反应后（两个方框）。o: {before:[[x,y,名]], after:[…]（坐标相对各自方框左上角），cond, blank:[x,y,w,h]（反应后方框里的待补区域）,
  //   look, names（图例文字覆盖）, cap, cross:[下标]（反应前方框中要划去的分子）, crossAfter}
  function react(o) {
    const W = 170, H = 120, X1 = 14, X2 = 266, Y = 12;
    let s = F.rect(X1, Y, W, H, 'thin', 8) + F.rect(X2, Y, W, H, 'thin', 8);
    const draw = (list, X, cross) => list.map(([x, y, n], i) => {
      let t = mol(X + x, Y + y, n, o.look);
      if (cross && cross.includes(i)) t += F.line(X + x - 20, Y + y + 15, X + x + 20, Y + y - 15, 'force') ;
      return t;
    }).join('');
    s += draw(o.before, X1, o.cross) + draw(o.after, X2, o.crossAfter);
    if (o.blank) {
      const [bx, by, bw, bh] = o.blank;
      s += F.rect(X2 + bx, Y + by, bw, bh, 'thin dash', 6) + F.text(X2 + bx + bw / 2, Y + by + bh / 2, '?', { size: 18 });
    }
    s += F.arrow(X1 + W + 12, Y + H / 2, X2 - 12, Y + H / 2, { size: 8 }) + (o.cond ? F.text((X1 + W + X2) / 2, Y + H / 2 - 14, o.cond, { size: 12 }) : '');
    s += F.text(X1 + W / 2, Y + H + 16, '反应前', { size: 12 }) + F.text(X2 + W / 2, Y + H + 16, '反应后', { size: 12 });
    const names = o.before.concat(o.after).map(m => m[2]);
    const items = o.legend || autoLegend(names, o);
    s += legend(Math.max(24, 225 - items.length * 52 + 10), Y + H + 44, items, o.look);
    return F.svg(450, Y + H + 60, s, o.cap);
  }

  // 方程式式样：甲 + 乙 → 丙 + 丁，每格一个分子（不配平）。o: {terms:[[名, 标签]], nL 反应物个数, cond, cap, look, names}
  function eqFig(o) {
    const cw = 84, gap = 30, arrowW = 62;
    let s = '', x = 14;
    o.terms.forEach(([n, lab], i) => {
      s += F.rect(x, 10, cw, 64, 'thin', 6) + mol(x + cw / 2, 42, n, o.look) + F.text(x + cw / 2, 88, lab, { size: 14 });
      x += cw;
      if (i === o.nL - 1) {
        s += F.arrow(x + 8, 42, x + arrowW - 8, 42, { size: 8 }) + (o.cond ? F.text(x + arrowW / 2, 28, o.cond, { size: 11 }) : '');
        x += arrowW;
      } else if (i < o.terms.length - 1) {
        s += F.text(x + gap / 2, 42, '+', { size: 18 });
        x += gap;
      }
    });
    const items = o.legend || autoLegend(o.terms.map(t => t[0]), o);
    const w = Math.max(x + 14, items.length * 104 + 30);
    s += legend(Math.max(24, w / 2 - items.length * 52 + 10), 114, items, o.look);
    return F.svg(w, 130, s, o.cap);
  }

  // 四个方框（甲乙丙丁）。boxes[i] = [[dx, dy, 名]]
  function boxes(list, o) {
    o = o || {};
    let s = '';
    list.forEach((b, i) => {
      const x = 10 + i * 112;
      s += F.rect(x, 8, 102, 88, 'thin', 6) + b.map(([dx, dy, n]) => mol(x + dx, 8 + dy, n, o.look)).join('') + F.text(x + 51, 110, '甲乙丙丁'[i], { size: 14 });
    });
    const names = [].concat(...list.map(b => b.map(m => m[2])));
    const items = o.legend || autoLegend(names, o);
    s += legend(Math.max(24, 230 - items.length * 52 + 10), 136, items, o.look);
    return F.svg(460, 152, s, o.cap);
  }
  const G4 = n => [[30, 26, n], [72, 26, n], [30, 64, n], [72, 64, n]];
  const MIX = (a, b) => [[30, 26, a], [72, 26, b], [30, 64, b], [72, 64, a]];

  // 单个（或几个并排的）分子 + 图例。list = [[x, y, 名]]
  function molFig(list, w, h, o) {
    o = o || {};
    let s = list.map(([x, y, n]) => mol(x, y, n, o.look)).join('');
    if (!o.noLegend) {
      const items = o.legend || autoLegend(list.map(m => m[2]), o);
      s += legend(Math.max(20, w / 2 - items.length * 50 + 10), h - 14, items, o.look, 100);
    }
    return F.svg(w, h, s, o.cap);
  }

  /* ================= 流程图 ================= */
  // 方框：左上角 (x,y)，宽 w 高 h，文字可用 \n 换行；o.cls: 'soft'（默认）| 'thin'（操作步骤，虚线框用 'thin dash'）
  function flowBox(x, y, w, h, text, o) {
    o = o || {};
    let s = F.rect(x, y, w, h, o.cls || 'soft', 6);
    const lines = String(text).split('\n');
    lines.forEach((t, k) => { s += F.text(x + w / 2, y + h / 2 + (k - (lines.length - 1) / 2) * 15, t, { size: o.size || 12 }); });
    return s;
  }
  // 折线箭头：pts = [[x,y],…]，最后一段带箭头；label: [文字, x, y, 对齐] 或数组
  function flowArrow(pts, label, o) {
    o = o || {};
    let s = pts.length > 2 ? F.poly(pts.slice(0, -1), o.dash ? 'ink dash' : 'ink') : '';
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    s += F.arrow(a[0], a[1], b[0], b[1], { size: 7, dash: o.dash });
    const labs = label ? (Array.isArray(label[0]) ? label : [label]) : [];
    labs.forEach(([t, x, y, al]) => { s += F.text(x, y, t, { size: 11, a: al || 'middle' }); });
    return s;
  }

  /* ================= 推断框图 ================= */
  // 字母结点：中心 (x,y)；reveal 时在下方写出推出的化学式
  function gNode(x, y, letter, reveal) {
    let s = F.rect(x - 17, y - 15, 34, 30, 'soft', 6) + F.text(x, y + 1, letter, { size: 15 });
    if (reveal) s += F.text(x, y + 28, uni(reveal), { size: 13, cls: 'red' });
    return s;
  }
  // 连线：两结点中心之间，自动缩短；type: 'r' 相互反应（短线），'c' 转化（箭头）；o.label 标在中点（o.lx/o.ly 偏移）
  function gLink(p, q, type, o) {
    o = o || {};
    const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const cut = v => Math.abs(v[0]) * 15 > Math.abs(v[1]) * 17 ? 19 / Math.abs(v[0] || 1e-9) : 17 / Math.abs(v[1] || 1e-9);
    const t = Math.min(cut([ux, uy]), len / 2 - 2);
    const a = [p[0] + ux * t, p[1] + uy * t], b = [q[0] - ux * t, q[1] - uy * t];
    let s = type === 'c' ? F.arrow(a[0], a[1], b[0], b[1], { size: 7 }) : F.line(a[0], a[1], b[0], b[1], 'ink');
    if (o.label) s += F.text((a[0] + b[0]) / 2 + (o.lx || 0), (a[1] + b[1]) / 2 + (o.ly == null ? -9 : o.ly), o.label, { size: 11 });
    return s;
  }

  SIMS._c4_2 = { ball, mol, legend, react, eqFig, boxes, G4, MIX, molFig, flowBox, flowArrow, gNode, gLink, uni, inferFig };

  /* ================= 演示 1：框图推断分步破题 ================= */
  // 碳酸钙转化图：A 高温→ B、C；B + D → E；E + C → A + D；E + F → A + G
  const P = { A: [60, 70], B: [200, 70], C: [200, 170], E: [340, 70], G: [480, 70] };
  function inferFig(rev) {
    const R = k => rev[k] || '';
    let s = '';
    s += gLink(P.A, P.B, 'c', { label: '高温' }) + gLink(P.A, P.C, 'c', { label: '高温', lx: -18, ly: 2 });
    s += gLink(P.B, P.E, 'c', { label: '+D' }) + gLink(P.E, P.G, 'c', { label: '+F（同时生成 A）' });
    // E + C → A + D：从 E 向下、向左回到 A
    s += F.poly([[340, 86], [340, 226], [60, 226]], 'ink') + F.arrow(60, 226, 60, 87, { size: 7 });
    s += F.text(352, 160, '+C（同时生成 D）', { size: 11, a: 'start' });
    ['A', 'B', 'C', 'E', 'G'].forEach(k => { s += gNode(P[k][0], P[k][1], k, R(k)); });
    let side = '';
    if (rev.D) side += `D：${uni(rev.D)}　`;
    if (rev.F) side += `F：${uni(rev.F)}`;
    if (side) s += F.text(548, 204, side, { size: 13, cls: 'red', a: 'end' });
    return F.svg(560, 244, s);
  }
  const STEPS = [
    { rev: {}, t: '<b>读题</b>：A～G 是初中化学常见物质。已知 A 是大理石的主要成分，D 是最常见的溶剂，F 俗称纯碱。箭头表示转化，箭头上的“+D”表示与 D 反应。' },
    { rev: { A: 'CaCO3', D: 'H2O', F: 'Na2CO3' }, t: '<b>第 1 步 找突破口</b>：“大理石的主要成分”→ A 是 ' + chem('CaCO3') + '；“最常见的溶剂”→ D 是 ' + chem('H2O') + '；“纯碱”→ F 是 ' + chem('Na2CO3') + '。先把这些“题眼”写在框图上。' },
    { rev: { A: 'CaCO3', D: 'H2O', F: 'Na2CO3', B: '?', C: '?' }, t: '<b>第 2 步 顺藤摸瓜</b>：A 高温分解生成 B 和 C，碳酸钙高温分解生成 ' + chem('CaO') + ' 和 ' + chem('CO2') + '，但还不知道哪个是 B、哪个是 C。' },
    { rev: { A: 'CaCO3', D: 'H2O', F: 'Na2CO3', B: 'CaO', C: 'CO2', E: 'Ca(OH)2' }, t: '<b>第 3 步 用下一个条件定下来</b>：B 能与水（D）反应生成 E，再看 E 还要和纯碱反应生成 A（含钙）→ E 含钙，所以 B 是 ' + chem('CaO') + '，C 是 ' + chem('CO2') + '，E 是 ' + chem('Ca(OH)2') + '。' },
    { rev: { A: 'CaCO3', D: 'H2O', F: 'Na2CO3', B: 'CaO', C: 'CO2', E: 'Ca(OH)2', G: 'NaOH' }, t: '<b>第 4 步 推完最后一个</b>：E + F → A + G，即 ' + chem('Ca(OH)2') + ' + ' + chem('Na2CO3') + ' → ' + chem('CaCO3') + '↓ + 2' + chem('NaOH') + '，所以 G 是 ' + chem('NaOH') + '。' },
    { rev: { A: 'CaCO3', D: 'H2O', F: 'Na2CO3', B: 'CaO', C: 'CO2', E: 'Ca(OH)2', G: 'NaOH' }, t: '<b>第 5 步 代入验证</b>：剩下一个箭头 E + C → A + D，即 ' + chem('Ca(OH)2') + ' + ' + chem('CO2') + ' → ' + chem('CaCO3') + '↓ + ' + chem('H2O') + '（二氧化碳使澄清石灰水变浑浊）✓。每个箭头都对得上，答案才算推完。' }
  ];
  SIMS.c4_2_infer = function (box) {
    const ui = SIMS.ui(box, '框图推断：一步一步破题');
    const fig = ui.fig();
    const out = ui.out();
    let i = 0;
    const draw = () => {
      fig.innerHTML = inferFig(STEPS[i].rev);
      out.innerHTML = `<p>${STEPS[i].t}</p><p class="muted">第 ${i + 1} / ${STEPS.length} 步</p>`;
      prev.disabled = i === 0; next.disabled = i === STEPS.length - 1;
    };
    const prev = ui.action('← 上一步', () => { if (i > 0) { i--; draw(); } });
    const next = ui.action('下一步 →', () => { if (i < STEPS.length - 1) { i++; draw(); } });
    ui.note('红色字是推出来的物质。先找“题眼”，再沿着箭头推，最后把答案代回每一个箭头检查。');
    draw();
  };

  /* ================= 演示 2：抵消法 ================= */
  const RX = [
    {
      name: '合成氨', cond: '高温、高压、催化剂', figCond: '一定条件',
      before: [[40, 34, 'N2'], [40, 86, 'N2'], [100, 28, 'H2'], [136, 60, 'H2'], [100, 94, 'H2']],
      after: [[44, 34, 'N2'], [62, 86, 'NH3'], [126, 50, 'NH3']],
      crossB: [0], crossA: [0],
      count: [['N2', 2, 1], ['H2', 3, 0], ['NH3', 0, 2]],
      eq: ['N2 + 3H2', '2NH3']
    },
    {
      name: '甲烷燃烧', cond: '点燃',
      before: [[42, 60, 'CH4'], [104, 26, 'O2'], [132, 62, 'O2'], [104, 98, 'O2']],
      after: [[44, 32, 'CO2'], [40, 90, 'H2O'], [96, 70, 'H2O'], [138, 32, 'O2']],
      crossB: [3], crossA: [3],
      count: [['CH4', 1, 0], ['O2', 3, 1], ['CO2', 0, 1], ['H2O', 0, 2]],
      eq: ['CH4 + 2O2', 'CO2 + 2H2O']
    }
  ];
  SIMS.c4_2_micro = function (box) {
    const ui = SIMS.ui(box, '抵消法：反应前后都有的分子先划掉');
    let k = 0, on = false;
    ui.buttons(RX.map(r => r.name), j => { k = j; on = false; btn.textContent = '划去没参加反应的分子'; draw(); }, 0);
    const fig = ui.fig();
    const out = ui.out();
    const btn = ui.action('划去没参加反应的分子', () => { on = !on; btn.textContent = on ? '恢复原图' : '划去没参加反应的分子'; draw(); });
    function draw() {
      const r = RX[k];
      fig.innerHTML = react({ before: r.before, after: r.after, cond: r.figCond || r.cond, cross: on ? r.crossB : [], crossAfter: on ? r.crossA : [] });
      let h = '<table class="tbl"><tr><th>分子</th><th>反应前</th><th>反应后</th>' + (on ? '<th>实际参加/生成</th>' : '') + '</tr>';
      r.count.forEach(([n, b, a]) => { h += `<tr><td>${chem(n)}</td><td>${b}</td><td>${a}</td>${on ? `<td>${b > a ? '参加 ' + (b - a) : '生成 ' + (a - b)}</td>` : ''}</tr>`; });
      h += '</table>';
      h += on ? `<p>划掉两边都有的分子后，剩下的个数就是化学计量数：<span class="chem">${htmlSub(r.eq[0])} ＝ ${htmlSub(r.eq[1])}</span>（条件：${r.cond}）</p>`
        : '<p>反应前、反应后都出现的同种分子，有一部分其实没有参加反应（过量剩下的）。点按钮把它们划掉。</p>';
      out.innerHTML = h;
    }
    draw();
  };
})();
