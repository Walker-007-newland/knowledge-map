// 第三阶段 化学组 2 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   c3_2_atom        原子结构示意图：1–20 号元素的核外电子排布，得失电子形成离子
//   c3_2_electrolysis 电解水：正氧负氢，体积比 1 : 2
// 画图函数通过 SIMS._c3_2 导出，供 chemistry/c3-2.js 复用（本文件先加载）。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  /* ---------- 1–20 号元素 ---------- */
  // [符号, 名称, 相对原子质量（教材元素周期表中的值）, 类别 m 金属 / n 非金属 / r 稀有气体]
  const ELEM = [null,
    ['H', '氢', '1.008', 'n'], ['He', '氦', '4.003', 'r'], ['Li', '锂', '6.941', 'm'], ['Be', '铍', '9.012', 'm'], ['B', '硼', '10.81', 'n'],
    ['C', '碳', '12.01', 'n'], ['N', '氮', '14.01', 'n'], ['O', '氧', '16.00', 'n'], ['F', '氟', '19.00', 'n'], ['Ne', '氖', '20.18', 'r'],
    ['Na', '钠', '22.99', 'm'], ['Mg', '镁', '24.31', 'm'], ['Al', '铝', '26.98', 'm'], ['Si', '硅', '28.09', 'n'], ['P', '磷', '30.97', 'n'],
    ['S', '硫', '32.06', 'n'], ['Cl', '氯', '35.45', 'n'], ['Ar', '氩', '39.95', 'r'], ['K', '钾', '39.10', 'm'], ['Ca', '钙', '40.08', 'm']
  ];
  // 初中常见的简单离子所带电荷
  const IONQ = { 1: 1, 3: 1, 4: 2, 8: -2, 9: -1, 11: 1, 12: 2, 13: 3, 16: -2, 17: -1, 19: 1, 20: 2 };
  const CN = ['', '一', '二', '三', '四'];

  // 1–20 号元素原子的核外电子排布
  function shells(z) {
    const s = [];
    let left = z;
    [2, 8, 8, 2].forEach(c => { if (left > 0) { const k = Math.min(c, left); s.push(k); left -= k; } });
    return s;
  }
  // 离子的电子排布：失电子去掉最外层，得电子把最外层补到 8
  function ionShells(z) {
    const q = IONQ[z], s = shells(z);
    if (q > 0) return s.slice(0, -1);
    s[s.length - 1] -= q;
    return s;
  }
  const SUPD = { 1: '', 2: '²', 3: '³' };
  const ionTxt = (sym, q) => sym + SUPD[Math.abs(q)] + (q > 0 ? '⁺' : '⁻');                       // SVG 用：Mg²⁺
  const ionHtml = (sym, q) => `<span class="chem">${sym}<sup>${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '+' : '−'}</sup></span>`;

  // 原子（离子）结构示意图：原子核圆心 (cx, cy)，z 质子数，sh 各层电子数；o.hl 最外层数字用橙色
  function atom(cx, cy, z, sh, o) {
    o = o || {};
    let s = F.circle(cx, cy, 16, 'ink') + F.text(cx, cy + 1, '+' + z, { size: 13 });
    sh.forEach((n, i) => {
      const x = cx + 30 + i * 20, h = 16 + i * 5;
      s += F.path(`M${x - 5},${cy - h} Q${x + 9},${cy} ${x - 5},${cy + h}`, 'ink');
      s += F.rect(x - 4, cy - 8, 12, 16, 'mask') + F.text(x + 2, cy + 1, n, { size: 13, cls: o.hl && i === sh.length - 1 ? 'orange' : '' });
    });
    return s;
  }
  // 示意图右端的 x（用来排版）
  const atomRight = (cx, n) => cx + 30 + Math.max(0, n - 1) * 20 + 9;

  /* ---------- 电解水装置（水电解器） ---------- */
  // o.posLeft 左管接正极（默认 true）；o.h 负极管中气体高度（像素，正极管为其一半）；o.lab 两管上方的标注；o.bubbles 画气泡
  function electro(o) {
    o = o || {};
    const posLeft = o.posLeft !== false, h = o.h == null ? 80 : o.h;
    const top = 40, bot = 196;
    const gas = posLeft ? [h / 2, h] : [h, h / 2];
    let s = '';
    // 水
    s += F.rect(70, top + gas[0], 22, bot - top - gas[0], 'water') + F.rect(190, top + gas[1], 22, bot - top - gas[1], 'water');
    s += F.rect(70, bot, 142, 14, 'water') + F.rect(130, 96, 22, bot - 96, 'water');
    s += `<path class="water" d="M131,90 A22,22 0 0 0 151,90 Z"/>`;
    // 玻璃管外形
    s += F.poly([[70, top], [70, bot + 14], [212, bot + 14], [212, top]]);
    s += F.poly([[92, top], [92, bot], [130, bot], [130, 96]]) + F.poly([[152, 96], [152, bot], [190, bot], [190, top]]);
    s += F.line(70, top, 92, top) + F.line(190, top, 212, top);
    s += `<path class="ink" d="M130,96 A22,22 0 1 1 152,96"/>`;
    // 刻度
    [0, 1].forEach(k => { const x = k ? 212 : 92; for (let y = top + 20; y < bot; y += 20) s += F.line(x, y, x - 6, y, 'thin'); });
    // 活塞和尖嘴
    [81, 201].forEach(x => { s += F.rect(x - 8, top - 12, 16, 12, 'soft', 2) + F.line(x, top - 12, x, top - 24); });
    // 电极
    [81, 201].forEach(x => { s += `<line class="ink" style="stroke-width:5" x1="${x}" y1="160" x2="${x}" y2="${bot + 14}"/>`; });
    if (o.bubbles) [81, 201].forEach((x, i) => {
      const n = gas[i] > 0 ? 4 : 0;
      for (let j = 0; j < n; j++) s += F.circle(x + (j % 2 ? 5 : -5), 150 - j * 14, 2.2, 'thin');
    });
    // 导线和电源
    s += F.wire([[81, bot + 14], [81, 240], [121, 240]]) + F.wire([[201, bot + 14], [201, 240], [161, 240]]);
    const bat = F.comp('battery', 141, 240);
    s += posLeft ? bat : `<g transform="translate(282,0) scale(-1,1)">${bat}</g>`;
    s += F.text(108, 226, posLeft ? '+' : '−', { size: 16 }) + F.text(174, 226, posLeft ? '−' : '+', { size: 16 });
    if (o.lab) { s += F.text(81, 8, o.lab[0], { size: 14, cls: o.labCls || '' }) + F.text(201, 8, o.lab[1], { size: 14, cls: o.labCls || '' }); }
    return s;
  }

  SIMS._c3_2 = { ELEM, IONQ, shells, ionShells, atom, atomRight, electro, ionTxt, ionHtml };

  /* ---------- 演示 1：原子结构示意图 ---------- */
  SIMS.c3_2_atom = function (box) {
    const ui = SIMS.ui(box, '原子结构示意图（1～20 号元素）');
    let z = 11, mode = 0;
    ui.note('<b>① 选一种元素</b>（按原子序数排列）：');
    ui.buttons(ELEM.slice(1).map((e, i) => (i + 1) + ' ' + e[0]), i => { z = i + 1; draw(); }, z - 1);
    ui.note('<b>② 看原子，还是看它形成的离子：</b>');
    ui.buttons(['原子', '得失电子后的离子'], i => { mode = i; draw(); }, 0);
    const fig = ui.fig();
    const out = ui.out();
    ui.note('规律：第一层最多 2 个电子，第二层最多 8 个，最外层最多 8 个（只有一层时最多 2 个）。电子层数 = 周期数。圆圈里的“+11”是核电荷数（质子数），弧线表示电子层，弧线上的数字是该层的电子数。');

    function draw() {
      const [sym, name, mass, kind] = ELEM[z];
      const sh = shells(z), outer = sh[sh.length - 1], q = IONQ[z];
      let s = atom(60, 70, z, sh, { hl: true }) + F.text(atomRight(60, sh.length) / 2 + 22, 134, name + '原子 ' + sym, { size: 14 });
      let html = `<b>${name}（${sym}）</b>：原子序数 ${z} = 核电荷数 = 质子数 = 核外电子数 = ${z}；` +
        `${sh.length} 个电子层（位于第${CN[sh.length]}周期），最外层 ${outer} 个电子。` +
        `<br>相对原子质量 ${mass}，约等于质子数 + 中子数，所以这种原子（最常见的一种）中子数约为 ${Math.round(+mass) - z}。`;
      if (kind === 'r') html += `<br>稀有气体元素：最外层 ${outer} 个电子${z === 2 ? '（只有一层，2 个就是稳定结构）' : ''}，是相对稳定结构，化学性质很不活泼。`;
      else if (z === 1) html += `<br>非金属元素：只有 1 个电子层、1 个电子。氢原子失去这个电子就形成 ${ionHtml(sym, 1)}（酸溶液中都含有 H⁺）。`;
      else if (q > 0) html += `<br>${kind === 'm' ? '金属元素' : '非金属元素'}：最外层 ${outer} 个电子，化学反应中容易<b>失去</b> ${q} 个电子，形成带 ${q} 个单位正电荷的阳离子 ${ionHtml(sym, q)}。`;
      else if (q < 0) html += `<br>非金属元素：最外层 ${outer} 个电子，化学反应中容易<b>得到</b> ${-q} 个电子，形成带 ${-q} 个单位负电荷的阴离子 ${ionHtml(sym, q)}。`;
      else html += `<br>${kind === 'm' ? '金属' : '非金属'}元素：最外层 ${outer} 个电子，初中阶段不讨论它形成的简单离子。`;

      if (mode === 1) {
        if (q) {
          const ish = ionShells(z), ix = 330;
          s += F.arrow(210, 70, 280, 70, { size: 8 }) + F.text(245, 54, (q > 0 ? '失去 ' : '得到 ') + Math.abs(q) + ' 个电子', { size: 13 });
          s += ish.length ? atom(ix, 70, z, ish) : F.circle(ix, 70, 16, 'ink') + F.text(ix, 71, '+1', { size: 13 });
          s += F.text(ish.length ? atomRight(ix, ish.length) / 2 + ix / 2 - 4 : ix, 134, name + '离子 ' + ionTxt(sym, q), { size: 14 });
          const e = ish.reduce((a, b) => a + b, 0);
          html += `<br><b>离子</b>：质子数 ${z}，核外电子数 ${e}，质子数 ${q > 0 ? '＞' : '＜'} 电子数，所以是${q > 0 ? '阳' : '阴'}离子 ${ionHtml(sym, q)}。` +
            (z === 1 ? '氢原子失去唯一的 1 个电子后只剩一个质子（原子核），H⁺ 在酸中很常见。' :
              q > 0 ? `电子层比原子少了一层，最外层变成 ${ish[ish.length - 1]} 个电子的稳定结构。` : '电子层数不变，最外层补到 8 个电子，达到稳定结构。') +
            '<br>得失电子时质子数不变，所以离子和原子属于同一种元素；但最外层电子数变了，化学性质也就不同了。';
        } else {
          s += F.text(390, 70, kind === 'r' ? '已是稳定结构，不易得失电子' : '初中不讨论它的简单离子', { size: 14 });
        }
      }
      fig.innerHTML = F.svg(520, 150, s);
      out.innerHTML = html;
    }
    draw();
  };

  /* ---------- 演示 2：电解水 ---------- */
  SIMS.c3_2_electrolysis = function (box) {
    const ui = SIMS.ui(box, '电解水（水中加了少量硫酸钠增强导电性）');
    let posLeft = true, tested = null;
    ui.buttons(['左管接电源正极', '左管接电源负极'], i => { posLeft = i === 0; tested = null; draw(); }, 0);
    const fig = ui.fig();
    const T = ui.slider({ label: '通电时间', min: 0, max: 10, step: 0.5, value: 4, unit: 'min' }, () => { tested = null; draw(); });
    ui.action('检验左管气体', () => { tested = 0; draw(); });
    ui.action('检验右管气体', () => { tested = 1; draw(); });
    const out = ui.out();
    ui.note('理想情况下，每分钟负极产生约 2 mL 氢气、正极产生约 1 mL 氧气。实际实验中，由于氧气在水中溶解得比氢气多一些，测得的氢气与氧气体积比往往略大于 2 : 1。');

    function draw() {
      const t = T.get(), vH = 2 * t, vO = t;
      const h = vH * 6;                       // 1 mL ≈ 6 像素
      const lab = posLeft ? ['正极 · 氧气', '负极 · 氢气'] : ['负极 · 氢气', '正极 · 氧气'];
      let s = electro({ posLeft, h, bubbles: t > 0, lab: t > 0 ? lab : ['左管', '右管'] });
      const vL = posLeft ? vO : vH, vR = posLeft ? vH : vO;
      s += F.text(40, 120, SIMS.fmt(vL, 1) + ' mL', { size: 13, a: 'end' }) + F.text(244, 120, SIMS.fmt(vR, 1) + ' mL', { size: 13, a: 'start' });
      fig.innerHTML = F.svg(300, 262, s);
      let html = t === 0 ? '还没通电，两管都充满了水。拖动滑块开始电解。' :
        `通电 ${SIMS.fmt(t, 1)} min：正极产生氧气约 <b>${SIMS.fmt(vO, 1)} mL</b>，负极产生氢气约 <b>${SIMS.fmt(vH, 1)} mL</b>，` +
        `V(氧气) : V(氢气) = <b>1 : 2</b>（正氧负氢，氢二氧一）。质量比 m(氢气) : m(氧气) = 4 : 32 = <b>1 : 8</b>。`;
      if (tested != null) {
        const isO = (tested === 0) === posLeft, name = tested === 0 ? '左管' : '右管';
        if (t === 0) html += `<br>${name}里还没有气体。`;
        else html += isO ? `<br><b>检验${name}</b>（接正极）：打开活塞，用<b>带火星的木条</b>靠近尖嘴，木条<b>复燃</b> → 是氧气。`
          : `<br><b>检验${name}</b>（接负极）：打开活塞，用<b>燃着的木条</b>靠近尖嘴，气体<b>燃烧，产生淡蓝色火焰</b> → 是氢气。`;
      }
      html += `<br>反应：2H<sub>2</sub>O ═通电═ 2H<sub>2</sub>↑ + O<sub>2</sub>↑。结论：水是由<b>氢元素和氧元素</b>组成的。`;
      out.innerHTML = html;
    }
    draw();
  };
})();
