// 第四阶段 化学题型技能 互动演示（清单见 docs/phase4-spec.md）
//   c4_1_train  气体通过装置链：选一种混合气体，依次接上洗气瓶、干燥剂、灼热氧化铜……看每一步的现象、气体成分和结论是否可靠
// 另外导出 SIMS._c4_1 = { gen, wash, utube, cuo, jarUp, lampTail, balloon, cylinder, flow }，chemistry/c4-1.js 的装置图也用它们画
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const r1 = v => Math.round(v * 10) / 10;

  /* ================= 装置零件（每个零件的接口都在 y = top 这条水平线上） ================= */
  // 锥形瓶 + 分液漏斗（或长颈漏斗）发生装置。中心 x，接口在右侧 (x+46, top)；o.funnel = 'long' 画长颈漏斗；o.port 接口字母
  function gen(x, top, o) {
    o = o || {};
    const y = top + 40, nb = y + 20, bot = y + 100, W = 40, n = 10;
    const hw = yy => n + (W - n) * (yy - nb) / (bot - nb);
    const ly = bot - (bot - nb) * 0.32;
    let s = F.polygon([[x - hw(ly), ly], [x + hw(ly), ly], [x + W, bot], [x - W, bot]], 'water');
    s += F.poly([[x - n, y], [x - n, nb], [x - W, bot], [x + W, bot], [x + n, nb], [x + n, y]], 'ink');
    // 块状固体
    [-20, -6, 8, 22].forEach(d => { s += F.polygon([[x + d - 6, bot], [x + d - 4, bot - 7], [x + d + 4, bot - 8], [x + d + 6, bot]], 'soft'); });
    s += F.rect(x - 12, y - 6, 24, 16, 'soft', 2);
    const fx = x - 5;
    if (o.funnel === 'long') {
      s += F.poly([[fx - 14, top - 22], [fx - 2, top - 2], [fx - 2, bot - 8]], 'ink') + F.poly([[fx + 14, top - 22], [fx + 2, top - 2], [fx + 2, bot - 8]], 'ink') + F.line(fx - 14, top - 22, fx + 14, top - 22, 'thin');
    } else {
      const y0 = top - 34;
      s += `<ellipse class="water" cx="${fx}" cy="${y0 + 26}" rx="9" ry="7"/>` +
        F.path(`M${fx - 4},${y0} L${fx - 4},${y0 + 5} C${fx - 24},${y0 + 14} ${fx - 13},${y0 + 36} ${fx - 2},${y0 + 40} L${fx - 2},${y + 22} M${fx + 2},${y + 22} L${fx + 2},${y0 + 40} C${fx + 13},${y0 + 36} ${fx + 24},${y0 + 14} ${fx + 4},${y0 + 5} L${fx + 4},${y0}`, 'ink') +
        F.rect(fx - 8, y0 + 46, 16, 6, 'soft', 2);
    }
    s += F.poly([[x + 6, y + 14], [x + 6, top], [x + 46, top]], 'ink');
    if (o.port) s += F.text(x + 50, top - 10, o.port, { cls: 'it', size: 14 });
    if (o.label) s += F.text(x, bot + 18, o.label, { size: 14 });
    if (o.note) s += F.text(x, bot + 36, o.note, { size: 12 });
    return s;
  }

  // 洗气瓶（也可当多功能瓶）：中心 x，接口在 (x-34, top) 和 (x+34, top)。
  // o.longLeft（默认 true）长管在左；o.ports = ['a','b'] 左右接口字母；o.liq 瓶内液体比例（0 为空瓶）；o.text 瓶中文字；o.label 瓶下标号
  function wash(x, top, o) {
    o = o || {};
    const ll = o.longLeft !== false;
    const y = top + 26, h = o.h || 96, liq = o.liq == null ? 0.55 : o.liq;
    let s = F.jar(x, y, 56, h, liq ? { water: liq } : {});
    s += F.rect(x - 15, y - 6, 30, 14, 'soft', 2);
    const xl = x - 8, xr = x + 8, deep = y + h - 8, shallow = y + 16;
    s += F.poly([[xl, ll ? deep : shallow], [xl, top], [x - 34, top]], 'ink');
    s += F.poly([[xr, ll ? shallow : deep], [xr, top], [x + 34, top]], 'ink');
    if (o.ports) {
      s += F.text(x - 38, top - 10, o.ports[0], { cls: 'it', size: 14 });
      s += F.text(x + 38, top - 10, o.ports[1], { cls: 'it', size: 14 });
    }
    if (o.text) s += F.text(x, y + h - (liq ? h * liq / 2 : h / 2) + 2, o.text, { size: 12 });
    if (o.label) s += F.text(x, y + h + 18, o.label, { size: 14 });
    return s;
  }

  // U 形干燥管：中心 x，两臂顶部接口 (x-34, top)、(x+34, top)；o.text 干燥剂名称；o.ports；o.label
  function utube(x, top, o) {
    o = o || {};
    const y = top + 22, yb = y + 64;
    let s = '';
    for (let i = 0; i < 16; i++) {
      const t = i / 15, ang = Math.PI * t;
      const px = x - 18 * Math.cos(ang), py = yb + 18 * Math.sin(ang) - 4;
      s += F.circle(px, py, 3, 'soft');
    }
    [[x - 18, y + 14], [x - 18, y + 30], [x - 18, y + 46], [x + 18, y + 14], [x + 18, y + 30], [x + 18, y + 46]].forEach(p => { s += F.circle(p[0], p[1], 3, 'soft'); });
    s += F.path(`M${x - 24},${y} L${x - 24},${yb} A24,24 0 0 0 ${x + 24},${yb} L${x + 24},${y}`, 'ink');
    s += F.path(`M${x - 12},${y} L${x - 12},${yb} A12,12 0 0 0 ${x + 12},${yb} L${x + 12},${y}`, 'ink');
    s += F.rect(x - 26, y - 6, 16, 10, 'soft', 2) + F.rect(x + 10, y - 6, 16, 10, 'soft', 2);
    s += F.poly([[x - 18, y], [x - 18, top], [x - 34, top]], 'ink') + F.poly([[x + 18, y], [x + 18, top], [x + 34, top]], 'ink');
    if (o.ports) {
      s += F.text(x - 38, top - 10, o.ports[0], { cls: 'it', size: 14 });
      s += F.text(x + 38, top - 10, o.ports[1], { cls: 'it', size: 14 });
    }
    if (o.text) s += F.text(x, yb + 40, o.text, { size: 12 });
    if (o.label) s += F.text(x, yb + 58, o.label, { size: 14 });
    return s;
  }

  // 硬质玻璃管中加热的氧化铜：管中心 x，管轴 y = top（左右两端就是接口 x-56、x+56）
  function cuo(x, top, o) {
    o = o || {};
    let s = F.line(x - 50, top - 8, x + 50, top - 8) + F.line(x - 50, top + 8, x + 50, top + 8);
    s += F.rect(x - 58, top - 11, 10, 22, 'soft', 2) + F.rect(x + 48, top - 11, 10, 22, 'soft', 2);
    for (let px = x - 18; px <= x + 18; px += 5) s += F.dot(px, top + 5, 1.8) + F.dot(px + 2.5, top + 2, 1.5);
    s += F.lamp(x, top + 32, { fire: true });
    if (o.text) s += F.text(x, top - 22, o.text, { size: 12 });
    if (o.ports) {
      s += F.text(x - 60, top - 18, o.ports[0], { cls: 'it', size: 14 });
      s += F.text(x + 60, top - 18, o.ports[1], { cls: 'it', size: 14 });
    }
    if (o.label) s += F.text(x, top + 92, o.label, { size: 14 });
    return s;
  }

  // 向上排空气法收集：接口 (x-34, top)，导管伸到瓶底
  function jarUp(x, top, o) {
    o = o || {};
    let s = F.jar(x, top + 26, 52, 90, { glass: false });
    s += F.poly([[x - 34, top], [x, top], [x, top + 108]], 'ink');
    if (o.port) s += F.text(x - 38, top - 10, o.port, { cls: 'it', size: 14 });
    if (o.label) s += F.text(x, top + 134, o.label, { size: 14 });
    return s;
  }

  // 尾气点燃：导管从 (x-34, top) 进来，向上弯，管口点燃
  function lampTail(x, top, o) {
    o = o || {};
    let s = F.poly([[x - 34, top], [x, top], [x, top - 20]], 'ink');
    s += `<path class="ray" style="fill:var(--fig-ray);fill-opacity:.3" d="M${x},${top - 40} Q${x + 6},${top - 28} ${x},${top - 22} Q${x - 6},${top - 28} ${x},${top - 40} Z"/>`;
    if (o.label) s += F.text(x, top + 26, o.label, { size: 12 });
    return s;
  }
  // 尾气用气球收集
  function balloon(x, top, o) {
    o = o || {};
    let s = F.line(x - 34, top, x - 6, top) + `<ellipse class="soft" cx="${x + 12}" cy="${top}" rx="18" ry="13"/>`;
    if (o.label) s += F.text(x + 10, top + 28, o.label, { size: 12 });
    return s;
  }

  // 量筒：左上角 (x,y)，宽 w 高 h，液体比例 lv
  function cylinder(x, y, w, h, lv) {
    let s = '';
    if (lv) s += F.rect(x, y + h * (1 - lv), w, h * lv, 'water');
    s += F.poly([[x, y], [x, y + h], [x + w, y + h], [x + w, y]], 'ink') + F.line(x - 8, y + h, x + w + 8, y + h, 'ink');
    for (let i = 1; i < 6; i++) s += F.line(x, y + h * i / 6, x + 7, y + h * i / 6, 'thin');
    return s;
  }

  // 流程框图：一行方框加箭头。items 为文字（可用 \n 换行），arrows 为箭头上方文字
  function flow(items, arrows, o) {
    o = o || {};
    const bw = o.bw || 88, gap = o.gap || 46, bh = o.bh || 44, y = o.y || 30;
    let s = '', x = 6;
    items.forEach((t, i) => {
      s += F.rect(x, y, bw, bh, 'soft', 6);
      const lines = String(t).split('\n');
      lines.forEach((ln, k) => { s += F.text(x + bw / 2, y + bh / 2 + (k - (lines.length - 1) / 2) * 15, ln, { size: 12 }); });
      if (i < items.length - 1) {
        s += F.arrow(x + bw + 3, y + bh / 2, x + bw + gap - 3, y + bh / 2, { size: 7 });
        if (arrows && arrows[i]) {
          const al = String(arrows[i]).split('\n');
          al.forEach((ln, k) => { s += F.text(x + bw + gap / 2, y - 8 - (al.length - 1 - k) * 13, ln, { size: 11 }); });
        }
      }
      x += bw + gap;
    });
    return { s, w: x - gap + 12, h: y + bh + 10 };
  }

  SIMS._c4_1 = { gen, wash, utube, cuo, jarUp, lampTail, balloon, cylinder, flow };

  /* ================= 演示：气体通过装置链 ================= */
  const NAME = { H2O: '水蒸气', CO2: 'CO₂', HCl: 'HCl', CO: 'CO', H2: 'H₂' };
  const MIX = [
    { name: '大理石 + 盐酸制得的 CO₂', tag: 'CO₂ 气体', gas: { CO2: ['orig'], HCl: ['orig'], H2O: ['orig'] }, goal: '得到纯净、干燥的 CO₂', target: 'CO2' },
    { name: '锌粒 + 稀盐酸制得的 H₂', tag: 'H₂ 气体', gas: { H2: ['orig'], HCl: ['orig'], H2O: ['orig'] }, goal: '得到纯净、干燥的 H₂', target: 'H2' },
    { name: '水煤气（CO、H₂、CO₂、H₂O）', tag: '水煤气', gas: { CO: ['orig'], H2: ['orig'], CO2: ['orig'], H2O: ['orig'] }, goal: '依次证明四种成分都存在', target: 'detect' }
  ];
  const DEV = [
    { id: 'cuso4', name: '无水硫酸铜', box: '无水CuSO₄' },
    { id: 'lime', name: '澄清石灰水', box: '澄清石灰水' },
    { id: 'naoh', name: 'NaOH 溶液', box: 'NaOH溶液' },
    { id: 'h2so4', name: '浓硫酸', box: '浓硫酸' },
    { id: 'nahco3', name: '饱和 NaHCO₃ 溶液', box: '饱和NaHCO₃' },
    { id: 'cuo', name: '灼热的 CuO', box: '灼热CuO' },
    { id: 'soda', name: '碱石灰', box: '碱石灰' }
  ];
  const clone = g => { const o = {}; Object.keys(g).forEach(k => { o[k] = g[k].slice(); }); return o; };
  const addSrc = (g, k, src) => { g[k] = g[k] || []; if (!g[k].includes(src)) g[k].push(src); };
  const only = (arr, src) => arr && arr.length === 1 && arr[0] === src;
  const SRC = { orig: '原气体', sol: '前面的溶液', H2: 'H₂ 与 CuO 的反应', CO: 'CO 与 CuO 的反应', HCl: 'HCl 与 NaHCO₃ 的反应' };
  const srcText = arr => arr.map(s => SRC[s]).join('、');

  // 气体通过一个装置：返回 {g 新气体, see 现象, note 说明, prove 证明了什么}
  function pass(id, g0, mix) {
    const g = clone(g0);
    let see = '无明显现象', note = '', prove = null, bad = false;
    const solution = () => addSrc(g, 'H2O', 'sol');
    if (id === 'cuso4') {
      if (g.H2O) {
        see = '白色粉末变蓝';
        if (only(g.H2O, 'orig')) { note = '证明原气体中含水蒸气'; prove = 'H2O'; } else if (only(g.H2O, 'H2')) { note = '水来自 H₂ 还原 CuO，证明原气体中含 H₂'; prove = 'H2'; } else note = '水可能来自' + srcText(g.H2O) + '，不能下结论';
      } else note = '气体中没有水蒸气';
    } else if (id === 'lime') {
      if (g.HCl) {
        see = g.CO2 ? '可能看不到浑浊' : '无明显现象';
        note = g.CO2 ? 'HCl 先与 Ca(OH)₂ 反应（生成的 CaCO₃ 也会被盐酸溶解），不能据此判断有没有 CO₂' : 'HCl 与 Ca(OH)₂ 反应，没有明显现象';
        delete g.HCl;
        if (mix.target === 'CO2') { note += '——石灰水也会与目标气体 CO₂ 反应，不能用它除去 CO₂ 中的 HCl！'; bad = true; }
      } else if (g.CO2) {
        see = '变浑浊';
        if (only(g.CO2, 'orig')) { note = '证明原气体中含 CO₂（石灰水只用来检验，吸收不完全）'; prove = 'CO2'; } else if (only(g.CO2, 'CO')) { note = 'CO₂ 来自 CO 还原 CuO，证明原气体中含 CO'; prove = 'CO'; } else note = 'CO₂ 可能来自' + srcText(g.CO2) + '，不能下结论';
      } else note = '气体中没有 CO₂';
      solution();
    } else if (id === 'naoh') {
      const gone = ['CO2', 'HCl'].filter(k => g[k]);
      gone.forEach(k => delete g[k]);
      note = gone.length ? '吸收了 ' + gone.map(k => NAME[k]).join('、') : '没有能被吸收的气体';
      if (gone.includes('CO2') && mix.target === 'CO2') note += '——目标气体 CO₂ 也被吸收了！';
      solution();
      note += '；气体从溶液中出来，带出水蒸气';
    } else if (id === 'h2so4') {
      if (g.H2O) { delete g.H2O; note = '吸收水蒸气（干燥）'; } else note = '气体已经是干燥的';
    } else if (id === 'nahco3') {
      if (g.HCl) { delete g.HCl; addSrc(g, 'CO2', 'HCl'); note = '吸收 HCl，同时生成 CO₂'; if (mix.target === 'H2') note += '——给 H₂ 引入了新杂质 CO₂！'; } else note = '没有 HCl 可吸收';
      solution();
      note += '；带出水蒸气';
    } else if (id === 'cuo') {
      const r = [];
      if (g.CO) { delete g.CO; addSrc(g, 'CO2', 'CO'); r.push('CO → CO₂'); }
      if (g.H2) { delete g.H2; addSrc(g, 'H2O', 'H2'); r.push('H₂ → H₂O'); }
      if (r.length) { see = '黑色粉末变红'; note = r.join('，'); } else note = '没有能还原 CuO 的气体';
    } else if (id === 'soda') {
      const gone = ['H2O', 'CO2', 'HCl'].filter(k => g[k]);
      gone.forEach(k => delete g[k]);
      note = gone.length ? '吸收了 ' + gone.map(k => NAME[k]).join('、') : '没有能被吸收的气体';
      if (gone.includes('CO2') && mix.target === 'CO2') note += '——目标气体 CO₂ 也被吸收了！';
    }
    return { g, see, note, prove, bad };
  }

  const gasText = g => { const k = Object.keys(g); return k.length ? k.map(x => NAME[x]).join('、') : '（没有气体剩下）'; };

  function drawChain(steps, mix) {
    const labels = [mix.tag].concat(steps.map(id => DEV.find(d => d.id === id).box));
    const per = 5, bw = 92, bh = 34, gx = 24, gy = 26;
    const rows = Math.ceil(labels.length / per);
    let s = '';
    labels.forEach((t, i) => {
      const r = Math.floor(i / per), c = i % per;
      const x = 6 + c * (bw + gx), y = 8 + r * (bh + gy);
      s += F.rect(x, y, bw, bh, i ? 'soft' : 'ink', 6) + F.text(x + bw / 2, y + bh / 2, (i ? i + '. ' : '') + t, { size: 12 });
      if (i < labels.length - 1) {
        if (c < per - 1) s += F.arrow(x + bw + 2, y + bh / 2, x + bw + gx - 2, y + bh / 2, { size: 6 });
        else s += F.poly([[x + bw / 2, y + bh], [x + bw / 2, y + bh + gy / 2], [6 + bw / 2, y + bh + gy / 2]], 'thin') + F.arrow(6 + bw / 2, y + bh + gy / 2, 6 + bw / 2, y + bh + gy - 2, { size: 6 });
      }
    });
    return F.svg(per * (bw + gx), 16 + rows * (bh + gy) - gy, s);
  }

  SIMS.c4_1_train = function (box) {
    const ui = SIMS.ui(box, '气体通过装置链：现象、成分与结论');
    let mi = 0, steps = [];
    ui.buttons(MIX.map(m => m.name), i => { mi = i; steps = []; draw(); }, 0);
    const fig = ui.fig();
    DEV.forEach(d => ui.action('+ ' + d.name, () => { if (steps.length < 9) { steps.push(d.id); draw(); } }));
    ui.action('撤销一步', () => { steps.pop(); draw(); });
    ui.action('清空', () => { steps = []; draw(); });
    const out = ui.out();
    ui.note('规律：从溶液里出来的气体都带有水蒸气，所以“先验水，后验其他”“先除杂，后干燥”；要通过灼热 CuO 检验 H₂、CO，必须先把原有的 H₂O、CO₂ 除尽。石灰水、无水硫酸铜只用来检验，吸收要用 NaOH 溶液、浓硫酸。');

    function draw() {
      const mix = MIX[mi];
      fig.innerHTML = drawChain(steps, mix);
      let g = clone(mix.gas);
      const proved = {};
      let rows = '', lost = false;
      steps.forEach((id, i) => {
        const r = pass(id, g, mix);
        g = r.g;
        if (r.prove) proved[r.prove] = true;
        if (r.bad) lost = true;
        rows += `<tr><td>${i + 1}. ${DEV.find(d => d.id === id).name}</td><td>${r.see}</td><td>${r.note}</td><td>${gasText(g)}</td></tr>`;
      });
      let verdict;
      if (mix.target === 'detect') {
        verdict = ['H2O', 'CO2', 'H2', 'CO'].map(k => (proved[k] ? '✓ ' : '✗ ') + NAME[k].replace('水蒸气', 'H₂O')).join('　');
        verdict = '已可靠证明：' + verdict;
      } else {
        const ks = Object.keys(g);
        if (ks.length === 1 && ks[0] === mix.target && lost) verdict = '✗ 虽然只剩下 ' + NAME[mix.target] + '，但澄清石灰水消耗了一部分目标气体（违反“不减”），除 HCl 应改用饱和 NaHCO₃ 溶液。';
        else if (ks.length === 1 && ks[0] === mix.target) verdict = '✓ 达成目标：只剩下 ' + NAME[mix.target] + '，而且是干燥的。';
        else if (!g[mix.target]) verdict = '✗ 目标气体 ' + NAME[mix.target] + ' 没有了。';
        else verdict = '还混有：' + ks.filter(k => k !== mix.target).map(k => NAME[k]).join('、');
      }
      out.innerHTML = `<div>目标：<b style="font-family:inherit;font-size:inherit">${mix.goal}</b>；原气体：${gasText(mix.gas)}</div>` +
        (steps.length ? `<table class="tbl"><tr><th>装置</th><th>现象</th><th>说明</th><th>出来的气体</th></tr>${rows}</table>` : '<div>点下面的按钮，按顺序接上装置。</div>') +
        `<div>${verdict}</div>`;
    }
    draw();
  };
})();
