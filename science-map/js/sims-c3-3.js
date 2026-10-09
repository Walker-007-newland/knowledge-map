// 第三阶段 化学组 3 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   c3_3_balance   化学方程式配平器：逐个调化学计量数，两边各原子数实时对比
//   c3_3_limestone 石灰石与稀盐酸：边加盐酸边看二氧化碳质量曲线、烧杯总质量（差量法、拐点）
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  const sub = s => String(s).replace(/([A-Za-z)])(\d+)/g, '$1<sub>$2</sub>');
  const chem = s => `<span class="chem">${sub(s)}</span>`;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  // 方程式中间的长等号，上下写条件（与 chemistry/samples.js 的写法一致）
  const COND = (top, bot) => `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;margin:0 .3em"><span style="font-size:.7em;min-height:1.15em">${top ? sub(top) : ''}</span><span style="display:block;width:2.4em;border-top:3px double currentColor"></span><span style="font-size:.7em;min-height:1.15em">${bot || ''}</span></span>`;

  /* ---------- 配平器 ---------- */
  // 每种物质：[化学式, 组成, 箭头]；ans 为正确的化学计量数；top/bot 为等号上下的条件
  const RX = [
    { name: '氢气燃烧', L: [['H2', { H: 2 }], ['O2', { O: 2 }]], R: [['H2O', { H: 2, O: 1 }]], ans: [2, 1, 2], top: '点燃',
      hint: '观察法：右边 O 只有 1 个，左边有 2 个，先在 H₂O 前配 2；这时右边 H 有 4 个，再在 H₂ 前配 2。' },
    { name: '铁丝燃烧', L: [['Fe', { Fe: 1 }], ['O2', { O: 2 }]], R: [['Fe3O4', { Fe: 3, O: 4 }]], ans: [3, 2, 1], top: '点燃',
      hint: '以 Fe₃O₄ 为准（定为 1）：右边 Fe 3 个、O 4 个，所以 Fe 前配 3，O₂ 前配 2。' },
    { name: '铝与氧气', L: [['Al', { Al: 1 }], ['O2', { O: 2 }]], R: [['Al2O3', { Al: 2, O: 3 }]], ans: [4, 3, 2], top: '',
      hint: '最小公倍数法：O 原子左边 2 个、右边 3 个，最小公倍数是 6，所以 O₂ 前配 3、Al₂O₃ 前配 2，最后 Al 前配 4。（铝在常温下就能与氧气反应，表面生成致密的氧化铝薄膜）' },
    { name: '甲烷燃烧', L: [['CH4', { C: 1, H: 4 }], ['O2', { O: 2 }]], R: [['CO2', { C: 1, O: 2 }], ['H2O', { H: 2, O: 1 }]], ans: [1, 2, 1, 2], top: '点燃',
      hint: '定一法：把最复杂的 CH₄ 定为 1 → C 守恒得 CO₂ 为 1，H 守恒得 H₂O 为 2 → 右边 O 共 2 + 2 = 4 个，O₂ 配 2。' },
    { name: '乙醇燃烧', L: [['C2H5OH', { C: 2, H: 6, O: 1 }], ['O2', { O: 2 }]], R: [['CO2', { C: 1, O: 2 }], ['H2O', { H: 2, O: 1 }]], ans: [1, 3, 2, 3], top: '点燃',
      hint: '定一法：C₂H₅OH 定为 1 → CO₂ 为 2，H₂O 为 3 → 右边 O 共 4 + 3 = 7 个，左边乙醇已有 1 个 O，还差 6 个，O₂ 配 3。注意乙醇里 H 一共 6 个（5 + 1）。' },
    { name: '电解水', L: [['H2O', { H: 2, O: 1 }]], R: [['H2', { H: 2 }, '↑'], ['O2', { O: 2 }, '↑']], ans: [2, 2, 1], top: '通电',
      hint: '右边 O₂ 有 2 个 O，左边 H₂O 前配 2；左边 H 变成 4 个，右边 H₂ 前配 2。' },
    { name: '过氧化氢分解', L: [['H2O2', { H: 2, O: 2 }]], R: [['H2O', { H: 2, O: 1 }], ['O2', { O: 2 }, '↑']], ans: [2, 2, 1], top: 'MnO2',
      hint: '奇数配偶法：右边 H₂O 中 O 是奇数个（1 个），先在 H₂O 前配 2 变成偶数 → H 共 4 个，H₂O₂ 前配 2 → 左边 O 4 个，右边已有 2 个，O₂ 配 1。' },
    { name: '加热高锰酸钾', L: [['KMnO4', { K: 1, Mn: 1, O: 4 }]], R: [['K2MnO4', { K: 2, Mn: 1, O: 4 }], ['MnO2', { Mn: 1, O: 2 }], ['O2', { O: 2 }, '↑']], ans: [2, 1, 1, 1], bot: '△',
      hint: '右边 K₂MnO₄ 有 2 个 K，KMnO₄ 前配 2；这时左边 Mn 2 个、O 8 个，右边 Mn 1 + 1 = 2，O 4 + 2 + 2 = 8，已经平了。' },
    { name: '木炭还原氧化铜', L: [['C', { C: 1 }], ['CuO', { Cu: 1, O: 1 }]], R: [['Cu', { Cu: 1 }], ['CO2', { C: 1, O: 2 }, '↑']], ans: [1, 2, 2, 1], top: '高温',
      hint: 'CO₂ 有 2 个 O，所以 CuO 前配 2，Cu 前也配 2。反应物中没有气体，生成的 CO₂ 要标“↑”。' },
    { name: '一氧化碳炼铁', L: [['Fe2O3', { Fe: 2, O: 3 }], ['CO', { C: 1, O: 1 }]], R: [['Fe', { Fe: 1 }], ['CO2', { C: 1, O: 2 }]], ans: [1, 3, 2, 3], top: '高温',
      hint: '得氧法：每个 CO 夺得 1 个 O 变成 CO₂，Fe₂O₃ 有 3 个 O，需要 3 个 CO，生成 3 个 CO₂；Fe 配 2。反应物中有气体 CO，所以 CO₂ 不标“↑”。' },
    { name: '氢氧化钠与硫酸铜', L: [['NaOH', { Na: 1, O: 1, H: 1 }], ['CuSO4', { Cu: 1, S: 1, O: 4 }]], R: [['Cu(OH)2', { Cu: 1, O: 2, H: 2 }, '↓'], ['Na2SO4', { Na: 2, S: 1, O: 4 }]], ans: [2, 1, 1, 1], top: '',
      hint: '原子团当成一个整体：右边 Na₂SO₄ 有 2 个 Na、Cu(OH)₂ 有 2 个 OH，所以 NaOH 前配 2。溶液中生成蓝色沉淀，标“↓”。' }
  ];

  SIMS.c3_3_balance = function (box) {
    const ui = SIMS.ui(box, '化学方程式配平器');
    let ri = 0, k = [];
    ui.note('<b>① 选一个反应：</b>');
    ui.buttons(RX.map(r => r.name), i => { ri = i; reset(); }, 0);
    ui.note('<b>② 用 − / + 调每种物质前面的化学计量数</b>（只能改前面的数字，不能改化学式里的小数字）：');
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0;font-size:18px';
    box.appendChild(row);
    const fig = ui.fig();
    const out = ui.out();
    let hintShown = false;
    ui.action('提示', () => { hintShown = true; draw(); });
    ui.action('看答案', () => { k = RX[ri].ans.slice(); hintShown = true; draw(); });
    ui.action('重来', reset);
    ui.note('配平依据：质量守恒定律——反应前后每种原子的个数都不变。化学计量数为 1 时省略不写，各计量数要化成最简整数比。');

    function reset() { const r = RX[ri]; k = r.L.concat(r.R).map(() => 1); hintShown = false; draw(); }

    function count(list, ks) {
      const c = {};
      list.forEach((sp, i) => Object.keys(sp[1]).forEach(e => { c[e] = (c[e] || 0) + sp[1][e] * ks[i]; }));
      return c;
    }

    function draw() {
      const r = RX[ri], all = r.L.concat(r.R), nL = r.L.length;
      // 方程式那一行（带按钮）
      row.innerHTML = '';
      all.forEach((sp, i) => {
        if (i > 0) {
          const s = document.createElement('span');
          s.innerHTML = i === nL ? '&nbsp;→&nbsp;' : '&nbsp;+&nbsp;';
          row.appendChild(s);
        }
        const g = document.createElement('span');
        g.style.cssText = 'display:inline-flex;align-items:center;gap:3px;border:1px solid var(--line, #ccc);border-radius:8px;padding:2px 4px';
        const minus = document.createElement('button'), plus = document.createElement('button'), num = document.createElement('b');
        minus.className = plus.className = 'btn';
        minus.style.cssText = plus.style.cssText = 'min-height:30px;padding:0 9px';
        minus.textContent = '−'; plus.textContent = '+';
        num.textContent = k[i]; num.style.cssText = 'min-width:1em;text-align:center;font-family:"Times New Roman",serif';
        minus.onclick = () => { if (k[i] > 1) { k[i]--; draw(); } };
        plus.onclick = () => { if (k[i] < 9) { k[i]++; draw(); } };
        const f = document.createElement('span');
        f.innerHTML = chem(sp[0]);
        g.append(minus, num, plus, f);
        row.appendChild(g);
      });

      // 两边原子数对比图
      const cl = count(r.L, k.slice(0, nL)), cr = count(r.R, k.slice(nL));
      const els = Object.keys(Object.assign({}, cl, cr));
      const rowH = 34, top = 40, cx = 280, unit = 9, cap = 24;
      const H = top + els.length * rowH + 16;
      let s = F.text(cx - 130, 18, '反应物中的原子', { size: 14 }) + F.text(cx + 130, 18, '生成物中的原子', { size: 14 });
      s += F.line(cx, 30, cx, H - 8, 'thin dash');
      let ok = true;
      els.forEach((e, j) => {
        const a = cl[e] || 0, b = cr[e] || 0, y = top + j * rowH + rowH / 2, eq = a === b;
        if (!eq) ok = false;
        const fill = eq ? 'class="hi-fill"' : 'style="fill:var(--fig-force)"';
        const wa = Math.min(a, cap) * unit, wb = Math.min(b, cap) * unit;
        s += `<rect ${fill} x="${cx - 26 - wa}" y="${y - 9}" width="${wa}" height="18" rx="3" opacity="0.8"/>`;
        s += `<rect ${fill} x="${cx + 26}" y="${y - 9}" width="${wb}" height="18" rx="3" opacity="0.8"/>`;
        for (let t = 1; t < Math.min(a, cap); t++) s += F.line(cx - 26 - t * unit, y - 9, cx - 26 - t * unit, y + 9, 'thin');
        for (let t = 1; t < Math.min(b, cap); t++) s += F.line(cx + 26 + t * unit, y - 9, cx + 26 + t * unit, y + 9, 'thin');
        s += F.text(cx, y, e, { size: 15 });
        s += F.text(cx - 34 - wa, y, a, { a: 'end', size: 15 }) + F.text(cx + 34 + wb, y, b, { a: 'start', size: 15 });
        s += F.text(cx + 270, y, eq ? '✓' : '✗', { size: 16, cls: eq ? '' : 'red' });
      });
      fig.innerHTML = F.svg(580, H, s);

      // 文字结论
      const g = k.reduce((m, v) => gcd(m, v));
      let html = '';
      if (ok && g === 1) {
        const side = (list, off) => list.map((sp, i) => (k[off + i] > 1 ? k[off + i] : '') + sub(sp[0]) + (sp[2] || '')).join(' + ');
        html = `<b>✓ 配平了！</b> 每种原子两边个数都相等。写完整（注明条件和 ↑↓）：<div class="formula"><span class="chem">${side(r.L, 0)}${COND(r.top, r.bot)}${side(r.R, nL)}</span></div>`;
      } else if (ok) {
        html = `原子数都相等了，但化学计量数 ${k.join('、')} 有公约数 ${g}，要化成<b>最简整数比</b>：${k.map(v => v / g).join('、')}。`;
      } else {
        const bad = els.filter(e => (cl[e] || 0) !== (cr[e] || 0)).map(e => `${e}（左 ${cl[e] || 0}，右 ${cr[e] || 0}）`);
        html = `还没平：${bad.join('；')}。`;
      }
      if (hintShown) html += `<br><span class="muted">思路：${r.hint}</span>`;
      out.innerHTML = html;
    }
    reset();
  };

  /* ---------- 石灰石与稀盐酸：差量法与图像拐点 ---------- */
  // 烧杯中 12.5 g 石灰石样品（含 CaCO₃ 10 g，杂质不反应也不溶于水），逐渐加入稀盐酸，加到 100 g 时恰好完全反应
  SIMS.c3_3_limestone = function (box) {
    const ui = SIMS.ui(box, '向石灰石样品中逐渐加入稀盐酸');
    const fig = ui.fig();
    const V = ui.slider({ label: '加入稀盐酸', min: 0, max: 150, step: 5, value: 0, unit: 'g' }, draw);
    const out = ui.out();
    ui.note('烧杯中是 12.5 g 石灰石样品（杂质不与盐酸反应、也不溶于水）。电子秤称的是烧杯内物质的总质量（烧杯本身已去皮）。减少的质量就是逸出的二氧化碳——这就是“差量法”。');
    const CO2 = v => Math.min(v, 100) / 100 * 4.4;

    function draw() {
      const v = V.get(), m = CO2(v), total = 12.5 + v - m;
      let s = '';
      // 电子秤 + 烧杯
      const bx = 60, by = 110, bw = 110, bh = 90;
      const level = Math.min(0.85, 0.12 + v / 150 * 0.7);
      s += F.beaker(bx, by, bw, bh, level, { spout: true });
      // 固体颗粒：随反应减少
      const left = Math.round(18 * (1 - Math.min(v, 100) / 100)) + 4;
      for (let i = 0; i < left; i++) s += F.dot(bx + 12 + (i * 23) % (bw - 24), by + bh - 6 - (i % 3) * 5, 2.6);
      // 气泡：正在反应时显示
      if (v > 0 && v < 100) [[90, 0.5], [118, 0.35], [140, 0.6]].forEach(([x, f]) => { s += F.circle(x, by + bh * (1 - level * f), 3.5, 'thin'); });
      s += F.rect(40, 202, 150, 22, 'soft', 4) + F.text(115, 213, SIMS.fmt(total, 2) + ' g', { size: 14 });
      s += F.text(115, 244, '电子秤读数（烧杯内物质）', { size: 12 });
      // 曲线
      const ax = { x: 290, y: 40, w: 230, h: 170, xmax: 150, ymax: 5, xticks: [50, 100, 150], yticks: [2.2, 4.4], xlabel: '盐酸/g', ylabel: 'CO₂/g' };
      s += SIMS.axes(ax);
      s += F.poly([[ax.px(0), ax.py(0)], [ax.px(100), ax.py(4.4)], [ax.px(150), ax.py(4.4)]], 'thin dash');
      const pts = [[ax.px(0), ax.py(0)]];
      if (v > 100) pts.push([ax.px(100), ax.py(4.4)]);
      pts.push([ax.px(v), ax.py(m)]);
      s += F.poly(pts, 'hi');
      s += F.line(ax.px(100), ax.py(4.4), ax.px(100), ax.py(0), 'thin dash');
      s += F.text(ax.px(100) + 4, ax.py(4.4) - 12, '拐点：恰好完全反应', { size: 12, a: 'middle' });
      s += `<circle class="hi-fill" cx="${ax.px(v).toFixed(1)}" cy="${ax.py(m).toFixed(1)}" r="5"/>`;
      fig.innerHTML = F.svg(580, 256, s);

      let state;
      if (v === 0) state = '还没加盐酸';
      else if (v < 100) state = '碳酸钙还有剩余，盐酸全部反应';
      else if (v === 100) state = '碳酸钙与盐酸恰好完全反应';
      else state = '碳酸钙已反应完，盐酸过量（不再产生气体）';
      const caco3 = m * 100 / 44;
      out.innerHTML = `加入稀盐酸 <b>${v} g</b>：${state}` +
        `<br>生成 CO₂ 质量 = 12.5 g + ${v} g − ${SIMS.fmt(total, 2)} g = <b>${SIMS.fmt(m, 2)} g</b>` +
        `<br>${chem('CaCO3')} + 2${chem('HCl')} = ${chem('CaCl2')} + ${chem('H2O')} + ${chem('CO2')}↑　质量关系 100 : 44` +
        (v > 0 ? `<br>已反应的 ${chem('CaCO3')}：<span class="v">x</span> = 100 × ${SIMS.fmt(m, 2)} g ÷ 44 = <b>${SIMS.fmt(caco3, 2)} g</b>` : '') +
        (v >= 100 ? `<br>样品中碳酸钙的质量分数 = 10 g ÷ 12.5 g × 100% = <b>80%</b>（要等碳酸钙反应完，才能用 CO₂ 的总质量算纯度）` : '');
    }
    draw();
  };
})();
