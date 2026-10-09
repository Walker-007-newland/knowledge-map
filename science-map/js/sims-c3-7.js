// 第三阶段 化学组 7 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   c3_7_bench  酸、碱、盐的化学性质“反应台”：选一种酸/碱/盐溶液和一种物质，看能否反应、现象、方程式、基本反应类型
//   c3_7_spoil  氢氧化钠变质程度的探究：选样品和检验试剂，看现象与结论是否可靠
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  const htmlSub = s => String(s).replace(/([A-Za-z)])(\d+)/g, '$1<sub>$2</sub>');
  const chem = s => `<span class="chem">${htmlSub(s)}</span>`;
  const SUBD = '₀₁₂₃₄₅₆₇₈₉';
  const uniSub = s => String(s).replace(/([A-Za-z)])(\d+)/g, (m, a, d) => a + d.replace(/\d/g, x => SUBD[x]));

  /* ---------- 画试管：管口中心 (x,y)，长 len ---------- */
  // 液体颜色（半透明，深浅色模式都能看）
  const COL = {
    green: 'rgba(110,190,80,.5)', yellow: 'rgba(235,180,30,.55)', blue: 'rgba(40,110,230,.5)', paleblue: 'rgba(40,110,230,.25)',
    red: 'rgba(225,45,60,.55)', purple: 'rgba(140,70,180,.5)', lblue: 'rgba(40,90,225,.6)', pink: 'rgba(230,40,140,.5)',
    milky: 'rgba(205,205,205,.75)'
  };
  const SOLID = { metal: '#a3a8ae', copper: '#c4683a', black: '#262626', rust: '#8b3a1e', blue: '#4a90e2', white: '#e6e6e6', brown: '#9a3f17' };

  // o: {liq 颜色键或 'none'，frac 液面比例，ppt 沉淀颜色键，solid 固体颜色键，size 固体大小 0~1，coat 表面析出红色，gas 气泡，label}
  function tube(x, y, len, o) {
    const r = 12, b = y + len - r;
    let s = '';
    const frac = o.frac || 0.5, ly = y + len * (1 - frac);
    const liqPath = `M${x - r},${ly} L${x - r},${b} A${r},${r} 0 0 0 ${x + r},${b} L${x + r},${ly} Z`;
    if (!o.liq || o.liq === 'none') s += `<path class="water" d="${liqPath}"/>`;
    else s += `<path d="${liqPath}" style="fill:${COL[o.liq]}"/>`;
    if (o.ppt) {
      s += `<path d="M${x - r},${b - 6} L${x - r},${b} A${r},${r} 0 0 0 ${x + r},${b} L${x + r},${b - 6} Q${x},${b - 15} ${x - r},${b - 6} Z" style="fill:${SOLID[o.ppt]};stroke:var(--fig-ink);stroke-width:.6"/>`;
    }
    if (o.solid && o.size > 0) {
      const k = o.size, cy = b + 4 - 7 * k;
      s += `<ellipse cx="${x}" cy="${cy}" rx="${(8 * k + 2).toFixed(1)}" ry="${(6 * k + 1.5).toFixed(1)}" style="fill:${SOLID[o.solid]};stroke:${o.coat ? SOLID.copper : 'var(--fig-ink)'};stroke-width:${o.coat ? 3 : 0.8}"/>`;
    }
    if (o.gas) [[-5, 0.85], [4, 0.7], [-2, 0.5], [5, 0.35], [-6, 0.25]].forEach(([dx, t]) => {
      const yy = ly + (b - ly) * t;
      s += F.circle(x + dx, yy, 2.4, 'thin');
    });
    s += `<path class="ink" d="M${x - r},${y} L${x - r},${b} A${r},${r} 0 0 0 ${x + r},${b} L${x + r},${y}"/>`;
    s += F.line(x - r - 3, y, x + r + 3, y, 'ink');
    if (o.label) s += F.text(x, y + len + 18, o.label, { size: 13 });
    return s;
  }

  /* ================= 反应台 ================= */
  // 左边：酸、碱、盐溶液
  const AL = [
    { id: 'HCl', name: '稀盐酸', f: 'HCl', cls: '酸' },
    { id: 'H2SO4', name: '稀硫酸', f: 'H2SO4', cls: '酸' },
    { id: 'NaOH', name: '氢氧化钠溶液', f: 'NaOH', cls: '碱' },
    { id: 'CaOH2', name: '氢氧化钙溶液', f: 'Ca(OH)2', cls: '碱' },
    { id: 'Na2CO3', name: '碳酸钠溶液', f: 'Na2CO3', cls: '盐', liq: 'none' },
    { id: 'CuSO4', name: '硫酸铜溶液', f: 'CuSO4', cls: '盐', liq: 'blue' }
  ];
  // 右边：各类物质。state: sol 溶液 / solid 固体 / gas 气体；look 外观颜色
  const BG = [
    ['指示剂', [
      { id: 'litmus', name: '紫色石蕊溶液', kind: 'ind', state: 'sol', liq: 'purple' },
      { id: 'phen', name: '无色酚酞溶液', kind: 'ind', state: 'sol' }]],
    ['金属', [
      { id: 'Mg', name: '镁条', f: 'Mg', kind: 'metal', state: 'solid', look: 'metal' },
      { id: 'Zn', name: '锌粒', f: 'Zn', kind: 'metal', state: 'solid', look: 'metal' },
      { id: 'Fe', name: '铁钉', f: 'Fe', kind: 'metal', state: 'solid', look: 'metal' },
      { id: 'Cu', name: '铜片', f: 'Cu', kind: 'metal', state: 'solid', look: 'copper' }]],
    ['氧化物', [
      { id: 'Fe2O3', name: '铁锈', f: 'Fe2O3', kind: 'mo', state: 'solid', look: 'rust' },
      { id: 'CuO', name: '氧化铜', f: 'CuO', kind: 'mo', state: 'solid', look: 'black' },
      { id: 'CO2', name: '二氧化碳', f: 'CO2', kind: 'nmo', state: 'gas' }]],
    ['酸', [
      { id: 'HCl', name: '稀盐酸', f: 'HCl', kind: 'acid', state: 'sol' },
      { id: 'H2SO4', name: '稀硫酸', f: 'H2SO4', kind: 'acid', state: 'sol' }]],
    ['碱', [
      { id: 'NaOH', name: '氢氧化钠溶液', f: 'NaOH', kind: 'base', state: 'sol' },
      { id: 'CaOH2', name: '氢氧化钙溶液', f: 'Ca(OH)2', kind: 'base', state: 'sol' },
      { id: 'CuOH2', name: '氢氧化铜', f: 'Cu(OH)2', kind: 'base', state: 'solid', look: 'blue', insol: true }]],
    ['盐', [
      { id: 'CaCO3', name: '大理石', f: 'CaCO3', kind: 'salt', state: 'solid', look: 'white', insol: true },
      { id: 'Na2CO3', name: '碳酸钠溶液', f: 'Na2CO3', kind: 'salt', state: 'sol' },
      { id: 'AgNO3', name: '硝酸银溶液', f: 'AgNO3', kind: 'salt', state: 'sol' },
      { id: 'BaCl2', name: '氯化钡溶液', f: 'BaCl2', kind: 'salt', state: 'sol' },
      { id: 'CuSO4', name: '硫酸铜溶液', f: 'CuSO4', kind: 'salt', state: 'sol', liq: 'blue' },
      { id: 'FeCl3', name: '氯化铁溶液', f: 'FeCl3', kind: 'salt', state: 'sol', liq: 'yellow' },
      { id: 'CaCl2', name: '氯化钙溶液', f: 'CaCl2', kind: 'salt', state: 'sol' },
      { id: 'NaCl', name: '氯化钠溶液', f: 'NaCl', kind: 'salt', state: 'sol' }]]
  ];
  const BL = [].concat(...BG.map(g => g[1]));

  const T_SUB = '置换反应', T_EX = '复分解反应', T_NEU = '复分解反应（属于中和反应）', T_NONE = '不属于基本反应类型';
  // 反应表：键 'A|B'（两种顺序都会查）。res：反应后试管里的样子
  const R = {
    'HCl|Mg': { eq: 'Mg + 2HCl = MgCl2 + H2↑', ph: '反应剧烈，产生大量气泡，镁条迅速变小，试管外壁发烫', t: T_SUB, res: { gas: 1, size: 0.3 } },
    'HCl|Zn': { eq: 'Zn + 2HCl = ZnCl2 + H2↑', ph: '锌粒表面产生较多气泡，锌粒逐渐变小', t: T_SUB, res: { gas: 1, size: 0.6 } },
    'HCl|Fe': { eq: 'Fe + 2HCl = FeCl2 + H2↑', ph: '铁钉表面缓慢产生气泡，溶液由无色逐渐变为<b>浅绿色</b>', t: T_SUB, res: { gas: 1, size: 0.8, liq: 'green' } },
    'HCl|Fe2O3': { eq: 'Fe2O3 + 6HCl = 2FeCl3 + 3H2O', ph: '红褐色的铁锈逐渐溶解，溶液由无色变为<b>黄色</b>', t: T_EX, res: { size: 0, liq: 'yellow' } },
    'HCl|CuO': { eq: 'CuO + 2HCl = CuCl2 + H2O', ph: '黑色粉末逐渐溶解，溶液由无色变为<b>蓝色</b>（氯化铜溶液较浓时偏绿）', t: T_EX, res: { size: 0, liq: 'blue' } },
    'HCl|NaOH': { eq: 'NaOH + HCl = NaCl + H2O', ph: '无明显现象（可先在碱溶液里滴酚酞，借红色褪去判断反应发生）', t: T_NEU, res: {} },
    'HCl|CaOH2': { eq: 'Ca(OH)2 + 2HCl = CaCl2 + 2H2O', ph: '无明显现象', t: T_NEU, res: {} },
    'HCl|CuOH2': { eq: 'Cu(OH)2 + 2HCl = CuCl2 + 2H2O', ph: '蓝色固体逐渐溶解，溶液变为蓝色', t: T_NEU, res: { size: 0, liq: 'blue' } },
    'HCl|CaCO3': { eq: 'CaCO3 + 2HCl = CaCl2 + H2O + CO2↑', ph: '固体逐渐溶解，产生大量气泡（气体能使澄清石灰水变浑浊）', t: T_EX, res: { gas: 1, size: 0.5 } },
    'HCl|Na2CO3': { eq: 'Na2CO3 + 2HCl = 2NaCl + H2O + CO2↑', ph: '迅速产生大量气泡', t: T_EX, res: { gas: 1 } },
    'HCl|AgNO3': { eq: 'HCl + AgNO3 = AgCl↓ + HNO3', ph: '产生<b>白色沉淀</b>（AgCl 不溶于稀硝酸，可用来检验 Cl⁻）', t: T_EX, res: { ppt: 'white' } },
    'H2SO4|Mg': { eq: 'Mg + H2SO4 = MgSO4 + H2↑', ph: '反应剧烈，产生大量气泡，镁条迅速变小，试管外壁发烫', t: T_SUB, res: { gas: 1, size: 0.3 } },
    'H2SO4|Zn': { eq: 'Zn + H2SO4 = ZnSO4 + H2↑', ph: '锌粒表面产生较多气泡，锌粒逐渐变小（实验室用这个反应制氢气）', t: T_SUB, res: { gas: 1, size: 0.6 } },
    'H2SO4|Fe': { eq: 'Fe + H2SO4 = FeSO4 + H2↑', ph: '铁钉表面缓慢产生气泡，溶液由无色逐渐变为<b>浅绿色</b>', t: T_SUB, res: { gas: 1, size: 0.8, liq: 'green' } },
    'H2SO4|Fe2O3': { eq: 'Fe2O3 + 3H2SO4 = Fe2(SO4)3 + 3H2O', ph: '红褐色的铁锈逐渐溶解，溶液由无色变为<b>黄色</b>', t: T_EX, res: { size: 0, liq: 'yellow' } },
    'H2SO4|CuO': { eq: 'CuO + H2SO4 = CuSO4 + H2O', ph: '黑色粉末逐渐溶解，溶液由无色变为<b>蓝色</b>', t: T_EX, res: { size: 0, liq: 'blue' } },
    'H2SO4|NaOH': { eq: '2NaOH + H2SO4 = Na2SO4 + 2H2O', ph: '无明显现象', t: T_NEU, res: {} },
    'H2SO4|CaOH2': { eq: 'Ca(OH)2 + H2SO4 = CaSO4 + 2H2O', ph: '无明显现象（改良酸性土壤、处理硫酸厂废水就用这个反应）', t: T_NEU, res: {} },
    'H2SO4|CuOH2': { eq: 'Cu(OH)2 + H2SO4 = CuSO4 + 2H2O', ph: '蓝色固体逐渐溶解，溶液变为蓝色', t: T_NEU, res: { size: 0, liq: 'blue' } },
    'H2SO4|CaCO3': { eq: 'CaCO3 + H2SO4 = CaSO4 + H2O + CO2↑', ph: '开始有气泡，但很快变慢直至停止：生成的硫酸钙微溶于水，覆盖在大理石表面，阻碍反应继续进行（所以实验室制 CO₂ 不用稀硫酸）', t: T_EX, res: { gas: 1, size: 0.9 } },
    'H2SO4|Na2CO3': { eq: 'Na2CO3 + H2SO4 = Na2SO4 + H2O + CO2↑', ph: '迅速产生大量气泡', t: T_EX, res: { gas: 1 } },
    'H2SO4|BaCl2': { eq: 'H2SO4 + BaCl2 = BaSO4↓ + 2HCl', ph: '产生<b>白色沉淀</b>（BaSO₄ 不溶于稀硝酸）', t: T_EX, res: { ppt: 'white' } },
    'H2SO4|AgNO3': { na: '生成的硫酸银微溶于水，这个组合初中不讨论。' },
    'H2SO4|CaCl2': { na: '生成的硫酸钙微溶于水，这个组合初中不讨论。' },
    'NaOH|CO2': { eq: '2NaOH + CO2 = Na2CO3 + H2O', ph: '无明显现象（可以用软塑料瓶变瘪、反应后加稀盐酸有气泡等方法证明反应发生）。氢氧化钠在空气中变质就是这个反应', t: T_NONE, res: {} },
    'CaOH2|CO2': { eq: 'Ca(OH)2 + CO2 = CaCO3↓ + H2O', ph: '澄清石灰水<b>变浑浊</b>（用来检验 CO₂）', t: T_NONE, res: { liq: 'milky', ppt: 'white' } },
    'NaOH|CuSO4': { eq: '2NaOH + CuSO4 = Cu(OH)2↓ + Na2SO4', ph: '产生<b>蓝色沉淀</b>', t: T_EX, res: { ppt: 'blue', liq: 'paleblue' } },
    'NaOH|FeCl3': { eq: '3NaOH + FeCl3 = Fe(OH)3↓ + 3NaCl', ph: '产生<b>红褐色沉淀</b>', t: T_EX, res: { ppt: 'brown' } },
    'CaOH2|Na2CO3': { eq: 'Ca(OH)2 + Na2CO3 = CaCO3↓ + 2NaOH', ph: '产生<b>白色沉淀</b>（工业上用这个反应制烧碱；也用来除去 NaOH 中混有的 Na₂CO₃）', t: T_EX, res: { ppt: 'white' } },
    'CaOH2|CuSO4': { eq: 'Ca(OH)2 + CuSO4 = Cu(OH)2↓ + CaSO4', ph: '产生<b>蓝色沉淀</b>（农业上用石灰乳和硫酸铜配制波尔多液）', t: T_EX, res: { ppt: 'blue', liq: 'paleblue' } },
    'CaOH2|FeCl3': { eq: '3Ca(OH)2 + 2FeCl3 = 2Fe(OH)3↓ + 3CaCl2', ph: '产生<b>红褐色沉淀</b>', t: T_EX, res: { ppt: 'brown' } },
    'Na2CO3|AgNO3': { eq: 'Na2CO3 + 2AgNO3 = Ag2CO3↓ + 2NaNO3', ph: '产生白色沉淀。碳酸银能溶于稀硝酸，所以检验 Cl⁻ 时要再加稀硝酸，排除 CO₃²⁻ 的干扰（拓展）', t: T_EX, res: { ppt: 'white' } },
    'Na2CO3|BaCl2': { eq: 'Na2CO3 + BaCl2 = BaCO3↓ + 2NaCl', ph: '产生<b>白色沉淀</b>', t: T_EX, res: { ppt: 'white' } },
    'Na2CO3|CaCl2': { eq: 'Na2CO3 + CaCl2 = CaCO3↓ + 2NaCl', ph: '产生<b>白色沉淀</b>（检验或除去 Na₂CO₃ 常用它）', t: T_EX, res: { ppt: 'white' } },
    'Na2CO3|CuSO4': { na: '两者反应的产物比较复杂（如碱式碳酸铜），初中不讨论。' },
    'Na2CO3|FeCl3': { na: '两者在水中相互促进，生成氢氧化铁沉淀和二氧化碳，初中不讨论。' },
    'Na2CO3|CO2': { na: '碳酸钠溶液能吸收二氧化碳生成碳酸氢钠，初中不作要求。' },
    'CuSO4|Mg': { eq: 'Mg + CuSO4 = MgSO4 + Cu', ph: '镁条表面析出<b>红色固体</b>，溶液蓝色变浅（还可能看到少量气泡）', t: T_SUB, res: { coat: 1, size: 0.8, liq: 'paleblue' } },
    'CuSO4|Zn': { eq: 'Zn + CuSO4 = ZnSO4 + Cu', ph: '锌粒表面析出<b>红色固体</b>，溶液蓝色逐渐变浅', t: T_SUB, res: { coat: 1, size: 0.9, liq: 'paleblue' } },
    'CuSO4|Fe': { eq: 'Fe + CuSO4 = FeSO4 + Cu', ph: '铁钉表面析出<b>红色固体</b>，溶液由蓝色逐渐变为<b>浅绿色</b>（湿法炼铜）', t: T_SUB, res: { coat: 1, size: 0.9, liq: 'green' } },
    'CuSO4|BaCl2': { eq: 'CuSO4 + BaCl2 = BaSO4↓ + CuCl2', ph: '产生<b>白色沉淀</b>，溶液仍为蓝色', t: T_EX, res: { ppt: 'white', liq: 'blue' } },
    'CuSO4|AgNO3': { na: '生成的硫酸银微溶于水，这个组合初中不讨论。' },
    'CuSO4|CaCl2': { na: '生成的硫酸钙微溶于水，这个组合初中不讨论。' },
    'NaOH|AgNO3': { na: '生成的氢氧化银很不稳定，这个组合初中不讨论。' },
    'CaOH2|AgNO3': { na: '生成的氢氧化银很不稳定，这个组合初中不讨论。' }
  };
  // 规律（按“左边的类别 + 右边的类别”）
  const RULE = {
    '酸|metal': '酸 + 活泼金属 → 盐 + 氢气', '酸|mo': '酸 + 金属氧化物 → 盐 + 水', '酸|base': '酸 + 碱 → 盐 + 水（中和反应）',
    '酸|salt': '酸 + 盐 → 新酸 + 新盐', '碱|nmo': '碱 + 非金属氧化物 → 盐 + 水', '碱|acid': '碱 + 酸 → 盐 + 水（中和反应）',
    '碱|salt': '碱 + 盐 → 新碱 + 新盐', '盐|metal': '盐 + 金属 → 新盐 + 新金属', '盐|acid': '盐 + 酸 → 新盐 + 新酸',
    '盐|base': '盐 + 碱 → 新盐 + 新碱', '盐|salt': '盐 + 盐 → 两种新盐'
  };

  function judge(a, b) {
    if (a.id === b.id) return { na: '这是同一种物质，换一种试试。' };
    if (b.kind === 'ind') {
      if (a.id === 'CuSO4') return { na: '硫酸铜溶液本身是蓝色的，它的酸碱性初中不讨论。' };
      const acid = a.cls === '酸';
      if (b.id === 'litmus') return { ind: 1, ph: `紫色石蕊溶液变<b>${acid ? '红' : '蓝'}</b>`, res: { liq: acid ? 'red' : 'lblue' } };
      return { ind: 1, ph: acid ? '无色酚酞溶液<b>不变色</b>' : '无色酚酞溶液变<b>红</b>', res: { liq: acid ? null : 'pink' } };
    }
    const r = R[a.id + '|' + b.id] || R[b.id + '|' + a.id];
    if (r) return r;
    // 不反应：给出理由
    let why;
    if (a.cls === '酸' && b.id === 'Cu') why = '铜在金属活动性顺序中排在氢<b>后面</b>，不能置换出酸中的氢。';
    else if (a.cls === '酸' && b.kind === 'acid') why = '酸与酸之间不反应。';
    else if (a.cls === '碱' && b.kind === 'base') why = '碱与碱之间不反应。';
    else if (a.cls === '酸' && b.kind === 'nmo') why = '酸不与非金属氧化物反应。';
    else if (a.cls === '碱' && b.kind === 'metal') why = '初中阶段认为碱溶液不与这些金属反应（金属能与酸、某些盐溶液反应）。';
    else if (a.cls === '碱' && b.kind === 'mo') why = '碱不与金属氧化物反应（金属氧化物能与酸反应）。';
    else if (a.id === 'Na2CO3' && b.kind === 'metal') why = '这种金属不如钠活泼，不能把钠从它的盐溶液中置换出来。';
    else if (a.id === 'CuSO4' && b.id === 'Cu') why = '铜不能置换自身，没有变化。';
    else if (a.cls === '盐' && (b.kind === 'mo' || b.kind === 'nmo')) why = '盐一般不与氧化物反应。';
    else if (b.insol && a.cls !== '酸') why = `${b.name}难溶于水。碱与盐、盐与盐反应时，<b>反应物都要可溶</b>，所以不反应（它只能与酸反应）。`;
    else why = '两者交换成分后，没有沉淀、气体或水生成，不能反应（复分解反应发生的条件在后面“复分解反应”里细讲）。';
    return { no: why };
  }

  SIMS.c3_7_bench = function (box) {
    const ui = SIMS.ui(box, '酸、碱、盐的化学性质反应台');
    let ai = 0, bid = 'Zn';
    ui.note('<b>① 试管里放：</b>');
    ui.buttons(AL.map(a => a.name), i => { ai = i; draw(); }, 0);
    ui.note('<b>② 加入：</b>');
    const btns = [];
    BG.forEach(([g, list]) => {
      const row = document.createElement('div');
      row.className = 'sim-btns';
      row.innerHTML = `<span class="muted" style="align-self:center;min-width:4em">${g}</span>`;
      list.forEach(b => {
        const el = document.createElement('button');
        el.className = 'btn' + (b.id === bid ? ' on' : '');
        el.textContent = b.name + (b.f && b.state !== 'sol' ? '（' + uniSub(b.f) + '）' : '');
        el.onclick = () => { bid = b.id; btns.forEach(x => x.el.classList.toggle('on', x.id === bid)); draw(); };
        btns.push({ id: b.id, el });
        row.appendChild(el);
      });
      box.appendChild(row);
    });
    const fig = ui.fig();
    const out = ui.out();
    ui.note('提示：酸的五条化学性质（指示剂、活泼金属、金属氧化物、碱、某些盐），碱的四条化学性质（指示剂、某些非金属氧化物、酸、某些盐）都能在这里试一遍。注意哪些反应“没有明显现象”，哪些反应生成的溶液有颜色：Fe²⁺ 浅绿色、Fe³⁺ 黄色、Cu²⁺ 蓝色。');

    function draw() {
      const a = AL[ai], b = BL.find(x => x.id === bid), r = judge(a, b);
      // 图：左试管（原溶液）+ 加入物 → 右试管（结果）
      let s = '';
      s += tube(70, 40, 120, { liq: a.liq || 'none', frac: 0.45, label: a.name });
      s += F.text(130, 100, '+', { size: 24 });
      // 加入物的图标
      if (b.state === 'solid') {
        s += `<ellipse cx="180" cy="100" rx="13" ry="9" style="fill:${SOLID[b.look]};stroke:var(--fig-ink);stroke-width:.8"/>`;
      } else if (b.state === 'gas') {
        s += F.arrow(165, 100, 200, 100, { cls: 'hi', size: 7 }) + F.text(182, 84, '通入', { size: 12 });
      } else {
        s += F.rect(172, 64, 16, 10, 'soft', 3) + F.rect(176, 74, 8, 30, 'thin', 2);
        s += b.liq ? `<rect x="177" y="88" width="6" height="15" style="fill:${COL[b.liq]}"/>` : F.rect(177, 88, 6, 15, 'water');
        s += F.line(180, 104, 180, 112, 'ink');
      }
      s += F.text(180, 178, b.name, { size: 13 });
      s += F.arrow(222, 100, 262, 100, { size: 8 });

      const res = r.res || {};
      let after;
      if (r.na) after = null;
      else {
        // 默认：溶液颜色取原溶液或加入溶液的颜色；固体不变
        const baseLiq = a.liq && a.liq !== 'none' ? a.liq : (b.liq && b.kind !== 'ind' ? b.liq : 'none');
        after = {
          liq: res.liq !== undefined && res.liq !== null ? res.liq : baseLiq,
          frac: b.state === 'sol' ? 0.6 : 0.45,
          ppt: res.ppt, gas: res.gas, coat: res.coat,
          solid: b.state === 'solid' ? b.look : null,
          size: b.state === 'solid' ? (res.size != null ? res.size : 1) : 0
        };
        if (r.ind && res.liq === null) after.liq = 'none';
      }
      if (after) s += tube(300, 40, 120, Object.assign(after, { label: '反应后' }));
      else s += F.text(300, 100, '？', { size: 30 }) + F.text(300, 178, '初中不讨论', { size: 13 });
      fig.innerHTML = F.svg(400, 196, s);

      // 文字
      const rule = RULE[a.cls + '|' + b.kind];
      let html = `${a.name}（${chem(a.f)}，${a.cls}）+ ${b.name}${b.f ? '（' + chem(b.f) + '）' : ''}<br>`;
      if (r.na) html += `<span class="muted">${r.na}</span>`;
      else if (r.ind) html += `现象：${r.ph}<br><span class="muted">指示剂变色不写化学方程式。${a.id === 'Na2CO3' ? '碳酸钠是<b>盐</b>，但它的溶液显碱性。' : ''}</span>`;
      else if (r.no) html += `能否反应：<b style="font-family:inherit">不能</b>（无明显现象）<br>原因：${r.no}`;
      else {
        html += `能否反应：<b style="font-family:inherit">能</b><br>现象：${r.ph}<br>化学方程式：${chem(r.eq)}<br>基本反应类型：${r.t}`;
        if (rule) html += `<br><span class="muted">规律：${rule}</span>`;
      }
      out.innerHTML = html;
    }
    draw();
  };

  /* ================= 氢氧化钠变质程度的探究 ================= */
  const SAMPLES = [
    { name: '没有变质', oh: 1, co3: 0, comp: 'NaOH' },
    { name: '部分变质', oh: 1, co3: 1, comp: 'NaOH 和 Na2CO3' },
    { name: '全部变质', oh: 0, co3: 1, comp: 'Na2CO3' }
  ];
  const STEP1 = ['无色酚酞溶液', '足量稀盐酸', '澄清石灰水', '过量氯化钙溶液', '过量氯化钡溶液', '少量氯化钙溶液'];

  SIMS.c3_7_spoil = function (box) {
    const ui = SIMS.ui(box, '氢氧化钠变质了吗？变质到什么程度？');
    let si = 1, mystery = -1, revealed = false;
    ui.note('<b>① 选样品</b>（把固体溶于水配成溶液）：');
    ui.buttons(['没有变质', '部分变质', '全部变质', '神秘样品（随机）'], i => {
      if (i === 3) { mystery = Math.floor(Math.random() * 3); revealed = false; } else mystery = -1;
      si = i; draw();
    }, si);
    ui.note('<b>② 第一步：取少量溶液，加入</b>');
    const s1 = ui.buttons(STEP1, draw, 3);
    ui.note('<b>③ 第二步：静置后</b>');
    const s2 = ui.buttons(['不做第二步', '取上层清液，滴入无色酚酞溶液'], draw, 1);
    const fig = ui.fig();
    const out = ui.out();
    ui.action('揭晓神秘样品', () => { revealed = true; draw(); });
    ui.note('思路：先检验并<b>除尽</b> Na₂CO₃（它的溶液也显碱性，会干扰），再检验有没有 NaOH。所以第一步要用<b>过量</b>的、<b>不引入 OH⁻、生成物呈中性</b>的试剂（CaCl₂ 或 BaCl₂ 溶液），第二步再用酚酞。');

    function draw() {
      const smp = SAMPLES[si === 3 ? mystery : si];
      const k = s1.get(), two = s2.get() === 1;
      let p1, liq1 = 'none', ppt1 = null, gas1 = false, eq1 = [], p2 = '', liq2 = 'none', valid, concl;

      if (k === 0) {
        p1 = '溶液变红'; liq1 = 'pink';
        concl = 'NaOH 和 Na₂CO₃ 的溶液都显碱性，酚酞变红<b>不能</b>说明是否变质。'; valid = false;
        if (two) p2 = '溶液本来就是红色，第二步没有意义';
      } else if (k === 1) {
        gas1 = !!smp.co3;
        p1 = smp.co3 ? (smp.oh ? '开始一段时间没有气泡，继续滴加后产生气泡' : '产生气泡') : '无明显现象（没有气泡）';
        if (smp.oh) eq1.push('NaOH + HCl = NaCl + H2O');
        if (smp.co3) eq1.push('Na2CO3 + 2HCl = 2NaCl + H2O + CO2↑');
        concl = smp.co3 ? '有气泡，说明含 Na₂CO₃，氢氧化钠<b>已变质</b>；但盐酸把 NaOH 也反应掉了，<b>不能</b>判断变质程度。' : '没有气泡，说明不含 Na₂CO₃，氢氧化钠<b>没有变质</b>。';
        valid = !smp.co3 ? true : 'half';
        if (two) { p2 = '溶液中有过量盐酸，酚酞不变色——这一步无法判断原来有没有 NaOH'; }
      } else if (k === 2) {
        ppt1 = smp.co3 ? 'white' : null; liq1 = smp.co3 ? 'milky' : 'none';
        p1 = smp.co3 ? '产生白色沉淀' : '无明显现象';
        if (smp.co3) eq1.push('Ca(OH)2 + Na2CO3 = CaCO3↓ + 2NaOH');
        if (two) { p2 = '溶液变红'; liq2 = 'pink'; }
        concl = (smp.co3 ? '有白色沉淀，说明已变质。' : '没有沉淀，说明没有变质。') + '但石灰水本身含 OH⁻，反应又<b>生成了 NaOH</b>，再滴酚酞一定变红，<b>不能</b>判断原样品中有没有 NaOH。';
        valid = smp.co3 ? 'half' : true;
      } else {
        const salt = k === 4 ? 'BaCl2' : 'CaCl2', ppt = k === 4 ? 'BaCO3' : 'CaCO3', enough = k !== 5;
        ppt1 = smp.co3 ? 'white' : null; liq1 = smp.co3 ? 'milky' : 'none';
        p1 = smp.co3 ? '产生白色沉淀' : '无明显现象';
        if (smp.co3) eq1.push(`Na2CO3 + ${salt} = ${ppt}↓ + 2NaCl`);
        const red = smp.oh || (smp.co3 && !enough);
        if (two) { p2 = red ? '溶液变红' : '溶液不变色'; liq2 = red ? 'pink' : 'none'; }
        if (!smp.co3) { concl = '没有白色沉淀，说明不含 Na₂CO₃，氢氧化钠没有变质。'; valid = true; }
        else if (!two) { concl = '有白色沉淀，说明已变质。要判断程度，还要做第二步。'; valid = 'half'; }
        else if (!enough) { concl = '氯化钙<b>少量</b>，Na₂CO₃ 可能没有除尽，剩下的 Na₂CO₃ 也会使酚酞变红，<b>不能</b>判断是否含 NaOH。'; valid = false; }
        else {
          concl = `过量的 ${uniSub(salt)} 已把 Na₂CO₃ 除尽，生成的 NaCl 和剩余的 ${uniSub(salt)} 都呈中性。酚酞${red ? '变红，说明还有 NaOH：<b>部分变质</b>' : '不变色，说明没有 NaOH：<b>全部变质</b>'}。`;
          valid = true;
        }
      }

      // 图
      let s = tube(90, 30, 120, { liq: liq1, frac: 0.5, ppt: ppt1, gas: gas1, label: '第一步' });
      if (two) {
        s += F.arrow(130, 90, 190, 90, { size: 8 }) + F.text(160, 74, '取清液', { size: 12 });
        s += tube(230, 30, 120, { liq: liq2, frac: 0.4, label: '第二步' });
      }
      fig.innerHTML = F.svg(320, 180, s);

      const mark = valid === true ? '✓ 这个方案能得出可靠结论' : valid === 'half' ? '△ 只能判断是否变质，判断不了变质程度' : '✗ 这个方案得不出可靠结论';
      let html = `第一步现象：${p1}`;
      if (eq1.length) html += '<br>' + eq1.map(chem).join('；');
      if (two && p2) html += `<br>第二步现象：${p2}`;
      html += `<br>结论：${concl}<br><b style="font-family:inherit">${mark}</b>`;
      if (si === 3) html += `<br><span class="muted">${revealed ? '神秘样品其实是：' + SAMPLES[mystery].name + '（' + chem(SAMPLES[mystery].comp) + '）' : '先根据现象自己判断，再点“揭晓神秘样品”。'}</span>`;
      else html += `<br><span class="muted">样品成分：${chem(smp.comp)}</span>`;
      out.innerHTML = html;
    }
    if (mystery < 0 && si === 3) mystery = 0;
    draw();
  };

  SIMS._c3_7 = { tube };
})();
