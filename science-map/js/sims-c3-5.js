// 第三阶段 化学组 5 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   c3_5_displace  金属 + 酸 / 金属化合物溶液：能否反应、现象、方程式
//   c3_5_h2        金属与稀硫酸反应：氢气质量—时间图像
//   c3_5_filter    锌粉加入硝酸银和硝酸铜的混合溶液：滤渣、滤液成分
// 另导出 SIMS._c3_5.h2Graph 供 chemistry/c3-5.js 画题目里的图像
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  const htmlSub = s => String(s).replace(/([A-Za-z)])(\d+)/g, '$1<sub>$2</sub>');
  const chem = s => `<span class="chem">${htmlSub(s)}</span>`;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  // 溶液颜色（只用在演示里）
  const COLOR = {
    blue: { rgb: '40,120,230', a: 0.45, name: '蓝色' },
    green: { rgb: '110,190,90', a: 0.4, name: '浅绿色' },
    none: { rgb: '', a: 0, name: '无色' }
  };
  const tint = (x, y, w, h, c) => (c && c.a ? `<rect x="${x}" y="${y.toFixed(1)}" width="${w}" height="${h.toFixed(1)}" style="fill:rgb(${c.rgb});fill-opacity:${c.a}"/>` : '');

  /* ================= 1. 金属与酸、金属化合物溶液 ================= */
  // rank：金属活动性顺序中的位置（越小越活泼），H 记为 3.5
  const METALS = [
    { s: 'Mg', name: '镁', v: 2, ar: 24, rank: 0 },
    { s: 'Al', name: '铝', v: 3, ar: 27, rank: 1 },
    { s: 'Zn', name: '锌', v: 2, ar: 65, rank: 2 },
    { s: 'Fe', name: '铁', v: 2, ar: 56, rank: 3 },
    { s: 'Cu', name: '铜', v: 2, ar: 64, rank: 4 },
    { s: 'Ag', name: '银', v: 1, ar: 108, rank: 5 }
  ];
  const SOLS = [
    { id: 'HCl', name: '稀盐酸', N: 'H', q: 1, ar: 1, rank: 3.5, color: 'none', acid: true },
    { id: 'H2SO4', name: '稀硫酸', N: 'H', q: 1, ar: 1, rank: 3.5, color: 'none', acid: true },
    { id: 'MgSO4', name: '硫酸镁溶液', N: 'Mg', q: 2, ar: 24, rank: 0, color: 'none' },
    { id: 'ZnSO4', name: '硫酸锌溶液', N: 'Zn', q: 2, ar: 65, rank: 2, color: 'none' },
    { id: 'FeSO4', name: '硫酸亚铁溶液', N: 'Fe', q: 2, ar: 56, rank: 3, color: 'green' },
    { id: 'CuSO4', name: '硫酸铜溶液', N: 'Cu', q: 2, ar: 64, rank: 4, color: 'blue' },
    { id: 'AgNO3', name: '硝酸银溶液', N: 'Ag', q: 1, ar: 108, rank: 5, color: 'none' }
  ];
  // 能发生的反应：方程式、生成的化合物（名称、溶液颜色）
  const RX = {
    'Mg|HCl': ['Mg + 2HCl = MgCl2 + H2↑', '氯化镁', 'none'],
    'Al|HCl': ['2Al + 6HCl = 2AlCl3 + 3H2↑', '氯化铝', 'none'],
    'Zn|HCl': ['Zn + 2HCl = ZnCl2 + H2↑', '氯化锌', 'none'],
    'Fe|HCl': ['Fe + 2HCl = FeCl2 + H2↑', '氯化亚铁', 'green'],
    'Mg|H2SO4': ['Mg + H2SO4 = MgSO4 + H2↑', '硫酸镁', 'none'],
    'Al|H2SO4': ['2Al + 3H2SO4 = Al2(SO4)3 + 3H2↑', '硫酸铝', 'none'],
    'Zn|H2SO4': ['Zn + H2SO4 = ZnSO4 + H2↑', '硫酸锌', 'none'],
    'Fe|H2SO4': ['Fe + H2SO4 = FeSO4 + H2↑', '硫酸亚铁', 'green'],
    'Mg|ZnSO4': ['Mg + ZnSO4 = MgSO4 + Zn', '硫酸镁', 'none'],
    'Al|ZnSO4': ['2Al + 3ZnSO4 = Al2(SO4)3 + 3Zn', '硫酸铝', 'none'],
    'Mg|FeSO4': ['Mg + FeSO4 = MgSO4 + Fe', '硫酸镁', 'none'],
    'Al|FeSO4': ['2Al + 3FeSO4 = Al2(SO4)3 + 3Fe', '硫酸铝', 'none'],
    'Zn|FeSO4': ['Zn + FeSO4 = ZnSO4 + Fe', '硫酸锌', 'none'],
    'Mg|CuSO4': ['Mg + CuSO4 = MgSO4 + Cu', '硫酸镁', 'none'],
    'Al|CuSO4': ['2Al + 3CuSO4 = Al2(SO4)3 + 3Cu', '硫酸铝', 'none'],
    'Zn|CuSO4': ['Zn + CuSO4 = ZnSO4 + Cu', '硫酸锌', 'none'],
    'Fe|CuSO4': ['Fe + CuSO4 = FeSO4 + Cu', '硫酸亚铁', 'green'],
    'Mg|AgNO3': ['Mg + 2AgNO3 = Mg(NO3)2 + 2Ag', '硝酸镁', 'none'],
    'Al|AgNO3': ['Al + 3AgNO3 = Al(NO3)3 + 3Ag', '硝酸铝', 'none'],
    'Zn|AgNO3': ['Zn + 2AgNO3 = Zn(NO3)2 + 2Ag', '硝酸锌', 'none'],
    'Fe|AgNO3': ['Fe + 2AgNO3 = Fe(NO3)2 + 2Ag', '硝酸亚铁', 'green'],
    'Cu|AgNO3': ['Cu + 2AgNO3 = Cu(NO3)2 + 2Ag', '硝酸铜', 'blue']
  };
  const ACID_LOOK = {
    Mg: '反应剧烈，迅速产生大量气泡，试管外壁发烫',
    Al: '产生大量气泡（铝片要先打磨，否则表面的氧化铝薄膜先与酸反应，开始一段时间看不到气泡）',
    Zn: '产生较多气泡，速率适中（实验室常用锌和稀硫酸制取氢气）',
    Fe: '缓慢产生少量气泡，溶液由无色逐渐变为浅绿色'
  };
  const DEPOSIT = {
    Cu: { txt: '红色物质', rgb: '190,80,40' },
    Ag: { txt: '银白色物质', rgb: '200,205,212' },
    Fe: { txt: '灰黑色物质', rgb: '70,70,70' },
    Zn: { txt: '灰黑色物质', rgb: '90,90,90' }
  };

  function beakerFig(x, label, sol, metal, o) {
    const by = 60, bw = 120, bh = 130, wy = by + bh * 0.3;
    let s = F.rect(x, wy, bw, by + bh - wy, 'water') + tint(x, wy, bw, by + bh - wy, COLOR[sol]);
    // 金属片：上端露出液面
    const mx = x + bw / 2 - 9, my = 30, mh = 140;
    s += F.rect(mx, my, 18, mh, 'soft', 2) + F.text(mx + 9, my + 14, metal, { size: 13 });
    if (o && o.deposit) {
      const d = DEPOSIT[o.deposit];
      s += `<rect x="${mx - 3}" y="${wy.toFixed(1)}" width="24" height="${(my + mh - wy).toFixed(1)}" rx="3" style="fill:rgb(${d.rgb});fill-opacity:.85"/>`;
    }
    if (o && o.bubbles) {
      const n = o.bubbles;
      for (let i = 0; i < n; i++) {
        const side = i % 2 ? 1 : -1, yy = wy + 12 + ((i * 37) % (by + bh - wy - 24));
        s += F.circle(mx + 9 + side * (16 + (i * 7) % 14), yy, 2.5 + (i % 3), 'thin');
      }
    }
    s += F.beaker(x, by, bw, bh, 0, { spout: true });
    s += F.text(x + bw / 2, by + bh + 18, label, { size: 13 });
    return s;
  }

  SIMS.c3_5_displace = function (box) {
    const ui = SIMS.ui(box, '金属能和谁反应？');
    let mi = 3, si = 5;   // 默认：铁 + 硫酸铜溶液
    ui.note('<b>① 选金属</b>（已打磨）：');
    ui.buttons(METALS.map(m => m.name + ' ' + m.s), i => { mi = i; draw(); }, mi);
    ui.note('<b>② 选溶液</b>：');
    ui.buttons(SOLS.map(x => x.name), i => { si = i; draw(); }, si);
    const fig = ui.fig();
    const out = ui.out();
    ui.note('金属活动性顺序：K Ca Na Mg Al Zn Fe Sn Pb (H) Cu Hg Ag Pt Au。氢前金属能置换出稀盐酸、稀硫酸中的氢；前面的金属能把后面的金属从它的化合物溶液里置换出来。');

    function draw() {
      const m = METALS[mi], sol = SOLS[si], key = m.s + '|' + sol.id, rx = RX[key];
      const before = beakerFig(40, '反应前：' + sol.name, sol.color, m.s);
      let after;
      if (rx) after = beakerFig(330, '一段时间后', rx[2], m.s,
        sol.acid ? { bubbles: { Mg: 14, Al: 10, Zn: 8, Fe: 4 }[m.s] } : { deposit: sol.N });
      else after = beakerFig(330, '一段时间后', sol.color, m.s);
      const arrow = F.arrow(205, 120, 300, 120, { size: 8 }) + F.text(252, 104, rx ? '能反应' : '不反应', { size: 14, cls: rx ? 'red' : '' });
      fig.innerHTML = F.svg(500, 232, before + arrow + after);

      const pos = sol.acid ? '氢（H）' : `${METALS.find(x => x.s === sol.N).name}（${sol.N}）`;
      let html = '';
      if (m.s === sol.N) {
        html = `${m.name}放入${sol.name}：同种金属，<b>不发生反应</b>。`;
      } else if (!rx) {
        html = `<b>不反应</b>：${m.name}（${m.s}）在金属活动性顺序中位于${pos}<b>后面</b>，不能把${sol.acid ? '酸中的氢' : sol.N + ' 从它的化合物溶液中'}置换出来。`;
        html += `<br>现象：无明显变化。`;
      } else {
        html = `<b>能反应</b>：${m.name}（${m.s}）位于${pos}<b>前面</b>。`;
        if (sol.acid) html += `<br>现象：${ACID_LOOK[m.s]}。`;
        else {
          const c0 = COLOR[sol.color].name, c1 = COLOR[rx[2]].name;
          html += `<br>现象：${m.name}表面覆盖一层${DEPOSIT[sol.N].txt}（${sol.N}）；` + (c0 === c1 ? `溶液颜色无明显变化（都是${c0}）。` : `溶液由${c0}逐渐变为${c1}（生成了${rx[1]}）。`);
        }
        html += `<br>化学方程式：${chem(rx[0])}（置换反应）`;
        // 溶液质量变化：进入溶液的金属 vs 离开溶液的金属（或氢气）
        const g = gcd(m.v, sol.q), a = sol.q / g, b = m.v / g;
        const mIn = a * m.ar, mOut = b * sol.ar;
        html += `<br>溶液质量：每溶解 ${a > 1 ? a + '×' : ''}${m.ar} = ${mIn} 份质量的 ${m.s}，析出 ${b > 1 ? b + '×' : ''}${sol.ar} = ${mOut} 份质量的 ${sol.acid ? 'H（即氢气）' : sol.N}，` +
          (mIn > mOut ? '溶液质量<b>增大</b>' : '溶液质量<b>减小</b>') + (sol.acid ? '。' : `，金属片（固体）质量${mIn > mOut ? '减小' : '增大'}。`);
        if (m.s === 'Fe') html += `<br><span class="muted">注意：铁发生置换反应时生成 +2 价的亚铁化合物（浅绿色），不是 +3 价的铁盐。</span>`;
      }
      out.innerHTML = html;
    }
    draw();
  };

  /* ================= 2. 金属与稀硫酸：氢气质量—时间图像 ================= */
  // series: [{label, t, h}]：从原点直线上升，到 (t, h) 后保持水平。o: {w, h, tmax, ymax, ticks, caption, xlabel, ylabel}
  function h2Graph(series, o) {
    o = o || {};
    const ax = { x: 52, y: 40, w: o.w || 250, h: o.h || 150, xmax: o.tmax || 10, ymax: o.ymax || 1, ylabel: o.ylabel || 'm(H₂)' };
    if (o.xticks) ax.xticks = o.xticks;
    if (o.yticks) ax.yticks = o.yticks;
    // 横轴名写在轴下方右端，避免和右侧的图线标签挤在一起
    let s = SIMS.axes(ax) + F.text(ax.x + ax.w + 14, ax.y + ax.h + 18, o.xlabel || 't', { cls: 'it', size: 14, a: 'end' });
    series.forEach(sr => {
      const p1 = [ax.px(sr.t), ax.py(sr.h)], p2 = [ax.px(ax.xmax), ax.py(sr.h)];
      s += F.poly([[ax.px(0), ax.py(0)], p1, p2], sr.cls || 'hi');
      s += F.text(p2[0] + 6, p2[1] + (sr.dy || 0), sr.label, { a: 'start', size: 13 });
      if (sr.dash) s += F.line(p1[0], p1[1], p1[0], ax.py(0), 'thin dash');
    });
    return F.svg(ax.x + ax.w + 70, ax.y + ax.h + 34, s, o.caption);
  }
  SIMS._c3_5 = { h2Graph };

  const H2M = [
    { s: 'Mg', name: '镁', v: 2, ar: 24, rate: 0.05, eq: 'Mg + H2SO4 = MgSO4 + H2↑' },
    { s: 'Al', name: '铝', v: 3, ar: 27, rate: 0.032, eq: '2Al + 3H2SO4 = Al2(SO4)3 + 3H2↑' },
    { s: 'Zn', name: '锌', v: 2, ar: 65, rate: 0.016, eq: 'Zn + H2SO4 = ZnSO4 + H2↑' },
    { s: 'Fe', name: '铁', v: 2, ar: 56, rate: 0.007, eq: 'Fe + H2SO4 = FeSO4 + H2↑' },
    { s: 'Cu', name: '铜', v: 2, ar: 64, rate: 0, eq: '' }
  ];

  SIMS.c3_5_h2 = function (box) {
    const ui = SIMS.ui(box, '金属与稀硫酸反应：氢气质量随时间的变化');
    const on = [true, true, true, true, false];
    ui.note('选择参加比较的金属（可多选，每种金属分别放进一份同样的稀硫酸里）：');
    const row = document.createElement('div');
    row.className = 'sim-btns';
    H2M.forEach((m, i) => {
      const b = document.createElement('button');
      b.className = 'btn' + (on[i] ? ' on' : '');
      b.textContent = m.name + ' ' + m.s;
      b.onclick = () => { on[i] = !on[i]; b.classList.toggle('on', on[i]); draw(); };
      row.appendChild(b);
    });
    box.appendChild(row);
    const M = ui.slider({ label: '金属质量', min: 1, max: 10, step: 0.1, value: 5.6, unit: 'g' }, draw);
    const A = ui.slider({ label: 'H₂SO₄ 质量', min: 4.9, max: 49, step: 4.9, value: 49, unit: 'g' }, draw);
    ui.note('“H₂SO₄ 质量”指每一份稀硫酸中所含硫酸的质量。');
    const fig = ui.fig();
    const out = ui.out();
    ui.note('为便于比较，假设金属颗粒大小相同、反应速率只由金属活动性决定，图线画成“直线上升 + 水平”的样子。<b>看图两步</b>：① 比陡（斜率）——越陡反应越快，金属越活泼；② 比高（最终高度）——氢气的总质量，由不足量的那种物质决定。');

    function draw() {
      const m = M.get(), acid = A.get(), cap = acid * 2 / 98;   // 酸能提供的最多氢气
      const list = H2M.map((x, i) => {
        if (!on[i]) return null;
        if (!x.rate) return { x, h: 0, t: 0, by: 'none' };
        const hm = m * x.v / x.ar, h = Math.min(hm, cap);
        return { x, h, t: h / x.rate, by: hm < cap - 1e-9 ? 'metal' : hm > cap + 1e-9 ? 'acid' : 'both' };
      }).filter(Boolean);
      const hmax = Math.max(0.1, ...list.map(r => r.h)), tmax = Math.max(10, ...list.map(r => r.t)) * 1.25;
      const ymax = Math.ceil(hmax * 1.2 * 10) / 10;
      const ystep = ymax > 0.8 ? 0.2 : 0.1, yticks = [];
      for (let y = ystep; y <= ymax + 1e-9; y += ystep) yticks.push(+y.toFixed(1));
      const xstep = tmax > 100 ? 40 : tmax > 50 ? 20 : 10, xticks = [];
      for (let t = xstep; t < tmax - xstep * 0.8; t += xstep) xticks.push(t);
      // 标签上下错开，避免重叠
      const sorted = list.slice().sort((a, b) => b.h - a.h);
      let lastY = -1e9;
      const ax = { h: 170, w: 300 };
      sorted.forEach(r => {
        let y = 40 + ax.h - r.h / ymax * ax.h;
        if (y - lastY < 15) r.dy = lastY + 15 - y; else r.dy = 0;
        lastY = y + r.dy;
      });
      fig.innerHTML = h2Graph(list.map(r => ({ label: r.x.name + (r.h ? '' : '（不反应）'), t: r.t, h: r.h, dy: r.dy })),
        { w: ax.w, h: ax.h, tmax, ymax, xticks, yticks, xlabel: 't/s', ylabel: 'm(H₂)/g' });

      const rows = list.map(r => {
        if (!r.h) return `<tr><td>${r.x.name}</td><td>0</td><td>—</td><td>铜在氢后，不与稀硫酸反应</td></tr>`;
        const who = r.by === 'metal' ? '金属反应完（酸有剩余）' : r.by === 'acid' ? '酸反应完（金属有剩余）' : '恰好完全反应';
        return `<tr><td>${r.x.name}</td><td>${SIMS.fmt(r.h, 3)}</td><td>${SIMS.fmt(r.t, 1)}</td><td>${who}</td></tr>`;
      }).join('');
      const act = list.filter(r => r.h > 0);
      const rank = act.slice().sort((a, b) => b.h - a.h);
      let html = `<table class="tbl"><tr><th>金属</th><th>m(H₂)/g</th><th>反应结束/s</th><th>谁先反应完</th></tr>${rows}</table>`;
      if (act.length) {
        html += `生成氢气由多到少：${rank.map(r => r.x.name).join(' ≥ ')}`;
        html += `<br>金属足量时：m(H₂) = 金属质量 × <b>化合价 ÷ 相对原子质量</b>（${act.map(r => `${r.x.s}：${r.x.v}/${r.x.ar}`).join('，')}）`;
        html += `<br>酸足量时：这份稀硫酸最多产生 H₂ ${SIMS.fmt(acid, 1)} g × 2/98 = ${SIMS.fmt(cap, 3)} g`;
        html += '<br>' + act.map(r => chem(r.x.eq)).join('<br>');
      }
      out.innerHTML = html;
    }
    draw();
  };

  /* ================= 3. 滤渣、滤液成分 ================= */
  // 混合溶液含 AgNO₃ 3.4 g（0.02 份）和 Cu(NO₃)₂ 3.76 g（0.02 份），加入锌粉 z g
  SIMS.c3_5_filter = function (box) {
    const ui = SIMS.ui(box, '向硝酸银和硝酸铜的混合溶液中加入锌粉');
    const Z = ui.slider({ label: '加入锌粉', min: 0, max: 2.6, step: 0.05, value: 1.0, unit: 'g' }, draw);
    const fig = ui.fig();
    const out = ui.out();
    ui.note('溶液中含 AgNO₃ 3.4 g、Cu(NO₃)₂ 3.76 g。锌<b>先</b>和活动性差得最远的 AgNO₃ 反应（0.65 g 锌恰好反应完），AgNO₃ 反应完<b>后</b>才和 Cu(NO₃)₂ 反应（再加 1.3 g 恰好反应完）。充分反应后过滤。');
    const E = 1e-9;

    function draw() {
      const z = Z.get();
      const ag = Math.min(z, 0.65) / 65 * 216, cu = Math.max(0, Math.min(z, 1.95) - 0.65) / 65 * 64, zn = Math.max(0, z - 1.95);
      // 图：生成固体的质量
      const ax = { x: 250, y: 40, w: 230, h: 150, xmax: 2.6, ymax: 2.5, xticks: [0.65, 1.95], yticks: [0.65, 1.28, 2.16], ylabel: '固体质量/g' };
      let s = SIMS.axes(ax) + F.text(ax.x + ax.w + 20, ax.y + ax.h, 'm(Zn)/g', { cls: 'it', size: 14, a: 'start' });
      const pt = (x, y) => [ax.px(x), ax.py(y)];
      s += F.poly([pt(0, 0), pt(0.65, 2.16), pt(2.6, 2.16)], 'hi') + F.text(ax.px(2.6) + 4, ax.py(2.16), 'Ag', { a: 'start', size: 13 });
      s += F.poly([pt(0, 0), pt(0.65, 0), pt(1.95, 1.28), pt(2.6, 1.28)], 'ink') + F.text(ax.px(2.6) + 4, ax.py(1.28), 'Cu', { a: 'start', size: 13 });
      s += F.poly([pt(1.95, 0), pt(2.6, 0.65)], 'ink dash') + F.text(ax.px(2.6) + 4, ax.py(0.65), 'Zn 剩余', { a: 'start', size: 13 });
      s += F.line(ax.px(z), ax.py(0), ax.px(z), ax.py(2.5), 'thin dash') + F.dot(ax.px(z), ax.py(ag), 4) + F.dot(ax.px(z), ax.py(cu), 4);
      // 滤液烧杯
      const blue = z < 1.95 - E;
      const bx = 40, by = 70, bw = 110, bh = 110, wy = by + bh * 0.35;
      s += F.rect(bx, wy, bw, by + bh - wy, 'water') + tint(bx, wy, bw, by + bh - wy, blue ? { rgb: '40,120,230', a: 0.35 * Math.min(1, (1.95 - z) / 1.3 + 0.15) } : null);
      s += F.beaker(bx, by, bw, bh, 0) + F.text(bx + bw / 2, by + bh + 18, '滤液：' + (blue ? '蓝色' : '无色'), { size: 13 });
      fig.innerHTML = F.svg(575, 236, s);

      let stage, res, sol;
      if (z < E) { stage = '还没加锌'; res = '无'; sol = 'AgNO3、Cu(NO3)2'; }
      else if (z < 0.65 - E) { stage = '① 锌不足，AgNO₃ 只反应了一部分'; res = 'Ag'; sol = 'Zn(NO3)2、AgNO3、Cu(NO3)2'; }
      else if (z < 0.65 + E) { stage = '② AgNO₃ 恰好反应完，Cu(NO₃)₂ 还没开始反应'; res = 'Ag'; sol = 'Zn(NO3)2、Cu(NO3)2'; }
      else if (z < 1.95 - E) { stage = '③ Cu(NO₃)₂ 反应了一部分'; res = 'Ag、Cu'; sol = 'Zn(NO3)2、Cu(NO3)2'; }
      else if (z < 1.95 + E) { stage = '④ Cu(NO₃)₂ 恰好反应完'; res = 'Ag、Cu'; sol = 'Zn(NO3)2'; }
      else { stage = '⑤ 锌过量'; res = 'Ag、Cu、Zn'; sol = 'Zn(NO3)2'; }
      const cs = t => t.split('、').map(x => x === '无' ? x : chem(x)).join('、');
      let html = `加入锌粉 <b>${SIMS.fmt(z, 2)} g</b>：${stage}`;
      html += `<br>滤渣：<b>${cs(res)}</b>　滤液中的溶质：<b>${cs(sol)}</b>`;
      if (z > E) html += `<br>向滤渣中加稀盐酸：${zn > E ? '<b>有气泡</b>（滤渣中有锌，说明锌过量）' : '无气泡（滤渣中没有锌）'}`;
      html += `<br>先：${chem('Zn + 2AgNO3 = Zn(NO3)2 + 2Ag')}（溶液质量减小：65 份锌进入，216 份银析出）`;
      html += `<br>后：${chem('Zn + Cu(NO3)2 = Zn(NO3)2 + Cu')}（溶液质量略增大：65 份锌进入，64 份铜析出）`;
      out.innerHTML = html;
    }
    draw();
  };
})();
