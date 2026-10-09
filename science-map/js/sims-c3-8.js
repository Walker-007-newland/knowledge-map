// 第三阶段 化学组 8 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   c3_8_dd   复分解反应判断器：选两种物质，看离子交换、能否反应、生成什么
//   c3_8_ions 离子共存检查：选几种离子和附加条件，找出不能大量共存的离子对
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  const SUBD = '₀₁₂₃₄₅₆₇₈₉', SUPD = { 1: '', 2: '²', 3: '³' };
  const uniSub = s => String(s).replace(/\d/g, d => SUBD[d]);
  const htmlSub = s => String(s).replace(/([A-Za-z)])(\d+)/g, '$1<sub>$2</sub>');
  const chem = s => `<span class="chem">${htmlSub(s)}</span>`;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  /* ---------- 离子 ---------- */
  // q 电荷；grp 原子团（个数大于 1 时加括号）；name 命名用；color 溶液颜色
  const CAT = {
    H: { sym: 'H', q: 1, name: '氢' },
    Na: { sym: 'Na', q: 1, name: '钠' },
    K: { sym: 'K', q: 1, name: '钾' },
    NH4: { sym: 'NH4', q: 1, name: '铵', grp: true },
    Ba: { sym: 'Ba', q: 2, name: '钡' },
    Ca: { sym: 'Ca', q: 2, name: '钙' },
    Mg: { sym: 'Mg', q: 2, name: '镁' },
    Cu: { sym: 'Cu', q: 2, name: '铜', color: '蓝色' },
    Fe: { sym: 'Fe', q: 3, name: '铁', color: '黄色' },
    Ag: { sym: 'Ag', q: 1, name: '银' }
  };
  const AN = {
    OH: { sym: 'OH', q: 1, kind: '氢氧化', grp: true },
    Cl: { sym: 'Cl', q: 1, kind: '氯化', acid: '盐酸' },
    NO3: { sym: 'NO3', q: 1, kind: '硝酸', grp: true, acid: '硝酸' },
    SO4: { sym: 'SO4', q: 2, kind: '硫酸', grp: true, acid: '硫酸' },
    CO3: { sym: 'CO3', q: 2, kind: '碳酸', grp: true, acid: '碳酸' },
    O: { sym: 'O', q: 2, kind: '氧化' }
  };
  const ionLabel = (it, sign) => uniSub(it.sym) + SUPD[it.q] + sign;
  const catLabel = id => ionLabel(CAT[id], '⁺');
  const anLabel = id => ionLabel(AN[id], '⁻');
  const ionHtml = (it, sign) => `<span class="chem">${htmlSub(it.sym)}<sup>${it.q > 1 ? it.q : ''}${sign}</sup></span>`;
  const catHtml = id => ionHtml(CAT[id], '+');
  const anHtml = id => ionHtml(AN[id], '−');

  // 阳离子与阴离子相遇的结果。t: sol 可溶 | ppt 沉淀 | slight 微溶 | water 水 | gas 气体和水 | na 初中不要求
  const PAIR = {
    'H|OH': { t: 'water', show: 'H2O', m: 1, n: 1 },
    'H|O': { t: 'water', show: 'H2O', m: 2, n: 1 },
    'H|CO3': { t: 'gas', show: 'H2O + CO2↑', m: 2, n: 1, note: '生成的碳酸不稳定，分解为水和二氧化碳' },
    'NH4|OH': { t: 'gas', show: 'NH3↑ + H2O', m: 1, n: 1, note: '铵根离子遇氢氧根离子放出有刺激性气味的氨气' },
    'Ba|SO4': { t: 'ppt', c: '白色', note: '不溶于稀硝酸' },
    'Ba|CO3': { t: 'ppt', c: '白色', note: '能溶于酸并放出二氧化碳' },
    'Ca|CO3': { t: 'ppt', c: '白色', note: '能溶于酸并放出二氧化碳' },
    'Ag|Cl': { t: 'ppt', c: '白色', note: '不溶于稀硝酸' },
    'Ag|CO3': { t: 'ppt', c: '白色', note: '能溶于酸' },
    'Mg|OH': { t: 'ppt', c: '白色' },
    'Cu|OH': { t: 'ppt', c: '蓝色' },
    'Fe|OH': { t: 'ppt', c: '红褐色' },
    'Ca|OH': { t: 'slight' }, 'Ca|SO4': { t: 'slight' }, 'Ag|SO4': { t: 'slight' }, 'Mg|CO3': { t: 'slight' },
    'Cu|CO3': { t: 'na' }, 'Fe|CO3': { t: 'na' }, 'Ag|OH': { t: 'na' }
  };
  const pairOf = (c, a) => PAIR[c + '|' + a] || { t: 'sol' };
  const PPT_FILL = { '白色': '#f2f2f2', '蓝色': '#3d7fe0', '红褐色': '#9a3b1b' };

  // 由离子组成化学式：返回 {f, m, n}（m 个阳离子、n 个阴离子）
  function formula(c, a) {
    const p = pairOf(c, a);
    if (p.show) return { f: p.show, m: p.m, n: p.n };
    const C = CAT[c], A = AN[a], g = gcd(C.q, A.q), m = A.q / g, n = C.q / g;
    const part = (it, k) => (k > 1 ? (it.grp ? '(' + it.sym + ')' + k : it.sym + k) : it.sym);
    return { f: part(C, m) + part(A, n), m, n };
  }
  function nameOf(c, a) {
    if (c === 'H') return AN[a].acid || '水';
    if (c === 'NH4' && a === 'OH') return '氨气和水';
    return AN[a].kind + (c === 'Fe' ? '铁' : CAT[c].name);
  }

  /* ---------- 可选物质 ---------- */
  // c/a 离子；label 按钮文字；solid 为难溶固体
  const SUBS = [
    { c: 'H', a: 'Cl', label: '稀盐酸' }, { c: 'H', a: 'SO4', label: '稀硫酸' },
    { c: 'Na', a: 'OH', label: '氢氧化钠溶液' }, { c: 'Ca', a: 'OH', label: '澄清石灰水' }, { c: 'Ba', a: 'OH', label: '氢氧化钡溶液' },
    { c: 'Na', a: 'CO3', label: '碳酸钠溶液' }, { c: 'K', a: 'CO3', label: '碳酸钾溶液' }, { c: 'Na', a: 'Cl', label: '氯化钠溶液' },
    { c: 'Na', a: 'SO4', label: '硫酸钠溶液' }, { c: 'K', a: 'NO3', label: '硝酸钾溶液' }, { c: 'Ba', a: 'Cl', label: '氯化钡溶液' },
    { c: 'Ba', a: 'NO3', label: '硝酸钡溶液' }, { c: 'Ca', a: 'Cl', label: '氯化钙溶液' }, { c: 'Mg', a: 'Cl', label: '氯化镁溶液' },
    { c: 'Ag', a: 'NO3', label: '硝酸银溶液' }, { c: 'Cu', a: 'SO4', label: '硫酸铜溶液' }, { c: 'Fe', a: 'Cl', label: '氯化铁溶液' },
    { c: 'NH4', a: 'Cl', label: '氯化铵溶液' },
    { c: 'Ca', a: 'CO3', label: '碳酸钙（固体）', solid: true }, { c: 'Cu', a: 'OH', label: '氢氧化铜（固体）', solid: true },
    { c: 'Ba', a: 'SO4', label: '硫酸钡（固体）', solid: true }, { c: 'Ag', a: 'Cl', label: '氯化银（固体）', solid: true },
    { c: 'Fe', a: 'O', label: '氧化铁（铁锈）', solid: true }, { c: 'Cu', a: 'O', label: '氧化铜（固体）', solid: true }
  ];

  // 配平：k1·R1 + k2·R2 = j1·P1 + j2·P2
  function balance(r1, r2, p1, p2) {
    for (let s = 2; s <= 24; s++) for (let k1 = 1; k1 < s; k1++) {
      const k2 = s - k1;
      const a1 = k1 * r1.m, d1 = k2 * r2.n, a2 = k2 * r2.m, d2 = k1 * r1.n;
      if (a1 % p1.m || d1 % p1.n || a2 % p2.m || d2 % p2.n) continue;
      const j1 = a1 / p1.m, j2 = a2 / p2.m;
      if (j1 !== d1 / p1.n || j2 !== d2 / p2.n) continue;
      return [k1, k2, j1, j2];
    }
    return null;
  }
  const coef = (k, f) => f.split(' + ').map(x => (k > 1 ? k : '') + x).join(' + ');
  const mark = (pr, f) => (pr.t === 'ppt' ? f + '↓' : f);

  // 下拉框（样式跟按钮一致）
  function picker(box, label, init, onChange) {
    const row = document.createElement('div');
    row.className = 'sim-ctrl';
    row.style.gridTemplateColumns = 'auto 1fr';
    row.innerHTML = `<label>${label}</label><select class="btn" style="width:100%;font-size:15px;color:var(--text);background:var(--surface)">${SUBS.map((s, i) => `<option value="${i}"${i === init ? ' selected' : ''}>${s.label}　${uniSub(formula(s.c, s.a).f)}</option>`).join('')}</select>`;
    box.appendChild(row);
    const sel = row.querySelector('select');
    sel.addEventListener('change', onChange);
    return { get: () => +sel.value };
  }

  /* ================= 复分解反应判断器 ================= */
  SIMS.c3_8_dd = function (box) {
    const ui = SIMS.ui(box, '复分解反应判断器：两种化合物互相交换成分');
    const A = picker(box, '物质甲', 15, draw);
    const B = picker(box, '物质乙', 2, draw);
    const fig = ui.fig();
    const out = ui.out();
    ui.note('判断步骤：① 写出两种物质中的离子；② 阳离子与对方的阴离子“交换搭档”；③ 看新组合中有没有<b>沉淀、气体或水</b>——有一个就能反应，都没有就不反应。④ 碱和盐、盐和盐反应时，两种反应物都要<b>可溶</b>；难溶的碱、碳酸盐、金属氧化物只能和酸反应。');

    function ionBox(x, y, it, lab, sign) {
      return F.rect(x - 30, y - 15, 60, 30, 'soft', 15) + F.text(x, y, lab, { size: 16 });
    }
    function prodBox(x, pr, fm) {
      let s = '';
      if (pr.t === 'ppt') {
        s += `<rect x="${x - 70}" y="196" width="140" height="22" rx="4" style="fill:${PPT_FILL[pr.c]};stroke:currentColor;stroke-width:1"/>`;
        s += `<text x="${x}" y="207" text-anchor="middle" dominant-baseline="middle" style="fill:${pr.c === '白色' ? '#222' : '#fff'};font-size:13px">${pr.c}沉淀 ↓</text>`;
      } else {
        const t = { sol: '可溶，仍是离子', slight: '微溶', water: '生成水', gas: '生成气体（和水）', na: '初中不要求' }[pr.t];
        s += F.text(x, 207, t, { size: 13, cls: pr.t === 'water' || pr.t === 'gas' ? 'orange' : '' });
      }
      return F.text(x, 176, uniSub(fm.f), { size: 20 }) + s;
    }

    function draw() {
      const s1 = SUBS[A.get()], s2 = SUBS[B.get()];
      const r1 = formula(s1.c, s1.a), r2 = formula(s2.c, s2.a);
      let s = '';
      s += F.text(150, 18, s1.label, { size: 13 }) + F.text(450, 18, s2.label, { size: 13 });
      s += F.text(150, 38, uniSub(r1.f), { size: 17 }) + F.text(450, 38, uniSub(r2.f), { size: 17 });
      const y0 = 72;
      s += ionBox(110, y0, CAT[s1.c], catLabel(s1.c)) + ionBox(190, y0, AN[s1.a], anLabel(s1.a));
      s += ionBox(410, y0, CAT[s2.c], catLabel(s2.c)) + ionBox(490, y0, AN[s2.a], anLabel(s2.a));

      if (A.get() === B.get()) {
        fig.innerHTML = F.svg(600, 230, s + F.text(300, 160, '请选两种不同的物质', { size: 15 }));
        out.innerHTML = '同一种物质混在一起不会发生反应，请选两种不同的物质。';
        return;
      }
      // 交换：甲的阳离子 + 乙的阴离子 → 产物 1；乙的阳离子 + 甲的阴离子 → 产物 2
      const pr1 = pairOf(s1.c, s2.a), pr2 = pairOf(s2.c, s1.a);
      const f1 = formula(s1.c, s2.a), f2 = formula(s2.c, s1.a);
      s += F.arrow(110, y0 + 16, 140, 156, { cls: 'ray', size: 7 }) + F.arrow(490, y0 + 16, 170, 156, { cls: 'ray', size: 7 });
      s += F.arrow(410, y0 + 16, 430, 156, { cls: 'hi', size: 7 }) + F.arrow(190, y0 + 16, 460, 156, { cls: 'hi', size: 7 });
      s += prodBox(150, pr1, f1) + prodBox(450, pr2, f2);
      fig.innerHTML = F.svg(600, 230, s);

      const good = t => t === 'ppt' || t === 'water' || t === 'gas';
      const ok = good(pr1.t) || good(pr2.t);
      const acid1 = s1.c === 'H', acid2 = s2.c === 'H';
      const desc = (c, a, pr, fm) => {
        const n = `${catHtml(c)} + ${anHtml(a)} → ${chem(fm.f)}`;
        if (pr.t === 'ppt') return `${n}：${nameOf(c, a)}，<b>${pr.c}沉淀</b>${pr.note ? '（' + pr.note + '）' : ''}`;
        if (pr.t === 'water') return `${n}：生成<b>水</b>`;
        if (pr.t === 'gas') return `${n}：${pr.note}`;
        if (pr.t === 'slight') return `${n}：${nameOf(c, a)}微溶于水`;
        if (pr.t === 'na') return `${n}：这种组合在初中不要求`;
        return `${n}：${nameOf(c, a)}可溶，在溶液中仍以离子形式存在`;
      };
      let html = '';
      const lines = [desc(s1.c, s2.a, pr1, f1), desc(s2.c, s1.a, pr2, f2)];

      // 难溶物：只有遇到酸才可能反应
      let verdict;
      if ((s1.solid && s2.solid)) verdict = { ok: false, why: '两种都是难溶的固体，不能发生复分解反应。' };
      else if (s1.solid || s2.solid) {
        const sd = s1.solid ? s1 : s2, other = s1.solid ? s2 : s1;
        if (other.c !== 'H') verdict = { ok: false, why: `${sd.label.replace(/（.*）/, '')}难溶于水。难溶的碱、碳酸盐和金属氧化物只能与酸反应；碱和盐、盐和盐之间反应时，两种反应物都要可溶，所以不反应。` };
        else if (sd.c === 'Ba' && sd.a === 'SO4' || sd.c === 'Ag' && sd.a === 'Cl') verdict = { ok: false, why: '硫酸钡、氯化银连酸都不溶，交换后也没有沉淀、气体或水，所以不反应。正因为这样，检验 SO₄²⁻、Cl⁻ 时要加稀硝酸排除干扰。' };
        else verdict = { ok: true };
      } else if (s1.c === s2.c || s1.a === s2.a) verdict = { ok: false, why: '两种物质含有相同的离子，交换成分后还是原来的物质，不发生反应。' };
      else verdict = { ok };

      if (verdict.ok) {
        const k = balance(r1, r2, f1, f2);
        // 生成物里把水、气体写在后面（如 2NaCl + H2O + CO2↑）
        let prods = [coef(k ? k[2] : 1, mark(pr1, f1.f)), coef(k ? k[3] : 1, mark(pr2, f2.f))];
        if ((pr1.t === 'water' || pr1.t === 'gas') && !(pr2.t === 'water' || pr2.t === 'gas')) prods = prods.reverse();
        const eq = k ? `${coef(k[0], r1.f)} + ${coef(k[1], r2.f)} = ${prods.join(' + ')}` : '';
        html += `<b>能反应</b>（${[pr1, pr2].filter(p => good(p.t)).map(p => ({ ppt: '有沉淀生成', water: '有水生成', gas: '有气体生成' }[p.t])).join('，')}）`;
        if (eq) html += `<br>化学方程式：${chem(eq)}`;
      } else if (!verdict.why && [pr1, pr2].some(p => p.t === 'slight' || p.t === 'na')) {
        html += '<b>初中不作要求</b>　交换后生成的是微溶物（或初中不要求的物质），中考一般避开这种组合，不必记它能否反应。';
      } else {
        html += `<b>不反应</b>　` + (verdict.why || '交换成分后既没有沉淀，也没有气体或水生成。');
      }
      html += '<br><span class="muted">离子交换：</span><br>' + lines.join('<br>');
      const colors = [s1, s2].filter(x => !x.solid && CAT[x.c].color).map(x => `${x.label}因含 ${catHtml(x.c)} 显${CAT[x.c].color}`);
      if (colors.length) html += '<br><span class="muted">' + colors.join('；') + '。</span>';
      if (verdict.ok && [pr1, pr2].some(p => p.t === 'gas' && p.show.indexOf('NH3') === 0)) html += '<br><span class="muted">铵盐与碱溶液反应时一般要<b>加热</b>（等号上方标“△”）才能明显放出氨气；与熟石灰固体研磨也能放出氨气。</span>';
      if (verdict.ok && [s1, s2].some(x => x.c === 'Ca' && x.a === 'CO3') && [s1, s2].some(x => x.c === 'H' && x.a === 'SO4')) html += '<br><span class="muted">生成的硫酸钙微溶于水，会覆盖在碳酸钙表面，使反应逐渐停止，所以实验室制二氧化碳不用稀硫酸。</span>';
      if ((acid1 || acid2) && !s1.solid && !s2.solid && ok && (s1.a === 'OH' || s2.a === 'OH')) html +='<br><span class="muted">酸与碱作用生成盐和水，也叫中和反应，实质是 H⁺ + OH⁻ → H₂O。</span>';
      out.innerHTML = html;
    }
    draw();
  };

  /* ================= 离子共存检查 ================= */
  const ION_LIST = [
    ['c', 'H'], ['c', 'Na'], ['c', 'K'], ['c', 'NH4'], ['c', 'Ba'], ['c', 'Ca'], ['c', 'Mg'], ['c', 'Cu'], ['c', 'Fe'], ['c', 'Ag'],
    ['a', 'OH'], ['a', 'Cl'], ['a', 'NO3'], ['a', 'SO4'], ['a', 'CO3']
  ];
  SIMS.c3_8_ions = function (box) {
    const ui = SIMS.ui(box, '离子共存检查');
    const on = new Set([1, 13, 14]);    // 默认：Na⁺、SO₄²⁻、CO₃²⁻
    ui.note('<b>① 点选溶液中的离子</b>（可多选，再点一次取消）：');
    const row = document.createElement('div');
    row.className = 'sim-btns';
    box.appendChild(row);
    ION_LIST.forEach(([k, id], i) => {
      const b = document.createElement('button');
      b.className = 'btn' + (on.has(i) ? ' on' : '');
      b.textContent = k === 'c' ? catLabel(id) : anLabel(id);
      b.onclick = () => { if (on.has(i)) on.delete(i); else on.add(i); b.classList.toggle('on', on.has(i)); draw(); };
      row.appendChild(b);
    });
    ui.note('<b>② 题目的附加条件</b>：');
    const cond = ui.buttons(['没有附加条件', '无色溶液', '酸性溶液（pH = 1）', '碱性溶液（pH = 13）'], draw, 0);
    const out = ui.out();
    ui.note('不能大量共存 = 两种离子相遇会结合成<b>沉淀、气体或水</b>。常见“冤家”：H⁺ 与 OH⁻、CO₃²⁻；OH⁻ 与 NH₄⁺、Cu²⁺、Fe³⁺、Mg²⁺；Ag⁺ 与 Cl⁻；Ba²⁺ 与 SO₄²⁻、CO₃²⁻；Ca²⁺ 与 CO₃²⁻。');

    function draw() {
      const c = cond.get();
      const cats = [], ans = [];
      ION_LIST.forEach(([k, id], i) => { if (on.has(i)) (k === 'c' ? cats : ans).push(id); });
      const hidden = [];
      if (c === 2 && !cats.includes('H')) { cats.push('H'); hidden.push(catHtml('H')); }
      if (c === 3 && !ans.includes('OH')) { ans.push('OH'); hidden.push(anHtml('OH')); }
      const bad = [], warn = [];
      cats.forEach(ci => ans.forEach(ai => {
        const p = pairOf(ci, ai), pair = `${catHtml(ci)} 与 ${anHtml(ai)}`;
        if (p.t === 'ppt') bad.push(`${pair} → ${chem(formula(ci, ai).f)} ${p.c}沉淀`);
        else if (p.t === 'water') bad.push(`${pair} → 水`);
        else if (p.t === 'gas') bad.push(`${pair} → ${chem(formula(ci, ai).f)}（${ci === 'H' ? '二氧化碳气体' : '氨气'}）`);
        else if (p.t === 'na') bad.push(`${pair} → 生成沉淀（初中不要求写出）`);
        else if (p.t === 'slight') warn.push(`${pair} → ${chem(formula(ci, ai).f)} 微溶`);
      }));
      const colored = c === 1 ? cats.filter(ci => CAT[ci].color).map(ci => `${catHtml(ci)} 使溶液显${CAT[ci].color}`) : [];
      let html = '';
      if (!cats.length && !ans.length) { out.innerHTML = '先点选几种离子。'; return; }
      if (hidden.length) html += `隐含条件：溶液中还有大量 ${hidden.join('')}（${c === 2 ? 'pH = 1 说明溶液显酸性' : 'pH = 13 说明溶液显碱性'}）<br>`;
      if (!bad.length && !colored.length) html += '<b>能大量共存</b>：任意两种阴、阳离子结合都不生成沉淀、气体或水。';
      else {
        html += '<b>不能大量共存</b>';
        if (bad.length) html += '<br>' + bad.join('<br>');
        if (colored.length) html += '<br>' + colored.join('；') + '，不符合“无色”';
      }
      if (warn.length) html += '<br><span class="muted">另外：' + warn.join('；') + '，中考题一般避开微溶物。</span>';
      if (cats.length && !ans.length || !cats.length && ans.length) html += '<br><span class="muted">提示：溶液整体呈电中性，真实溶液里阳离子和阴离子都要有。</span>';
      out.innerHTML = html;
    }
    draw();
  };
})();
