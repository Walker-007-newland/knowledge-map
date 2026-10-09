// 第三阶段 化学组 4 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   c3_4_fire  燃烧的条件：选物质、是否接触氧气、加热温度，看能否燃烧；再用三种方法灭火
//   c3_4_co2   二氧化碳的性质实验：倾倒阶梯蜡烛、软塑料瓶、石蕊纸花、澄清石灰水
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  const htmlSub = s => String(s).replace(/([A-Za-z)])(\d+)/g, '$1<sub>$2</sub>');
  const chem = s => `<span class="chem">${htmlSub(s)}</span>`;
  const r1 = v => Math.round(v * 10) / 10;
  // 火焰：底部 (x,y)，k 缩放
  const flame = (x, y, k) => `<path class="ray" style="fill:var(--fig-ray);fill-opacity:.35" d="M${r1(x)},${r1(y - 18 * k)} Q${r1(x + 6 * k)},${r1(y - 6 * k)} ${r1(x)},${r1(y)} Q${r1(x - 6 * k)},${r1(y - 6 * k)} ${r1(x)},${r1(y - 18 * k)} Z"/>`;

  // 按钮组：在 ui.buttons 基础上加一个 set()，方便程序切换
  function pick(ui, box, labels, init, onPick) {
    let cur = init;
    ui.buttons(labels, i => { cur = i; onPick(i); }, init);
    const row = box.lastElementChild;
    return {
      get: () => cur,
      set(i) { cur = i; row.querySelectorAll('.btn').forEach((b, j) => b.classList.toggle('on', j === i)); }
    };
  }

  // 简单动画：dur 秒内 t 从 0 走到 1
  function tween(box, dur, onT) {
    let gen = 0;
    return {
      play() {
        const my = ++gen;
        let t0 = 0;
        const step = ts => {
          if (my !== gen || !box.isConnected) return;
          if (!t0) t0 = ts;
          const t = Math.min(1, (ts - t0) / 1000 / dur);
          onT(t);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      stop() { gen++; }
    };
  }

  /* ---------- 燃烧的条件与灭火 ---------- */
  SIMS.c3_4_fire = function (box) {
    const ui = SIMS.ui(box, '燃烧的条件与灭火');
    const MAT = [
      { name: '白磷', fuel: true, ign: 40, note: '白磷的着火点约 40 ℃' },
      { name: '红磷', fuel: true, ign: 240, note: '红磷的着火点约 240 ℃' },
      { name: '小木块', fuel: true, ign: 300, note: '木材的着火点约 250～330 ℃，这里取 300 ℃' },
      { name: '小煤块', fuel: true, ign: 450, note: '煤的着火点比木材高，不同的煤差别很大，这里取 450 ℃ 示意' },
      { name: '小石块', fuel: false, note: '石块不是可燃物，加热到多高温度都不会燃烧' }
    ];
    let removed = false;
    ui.note('<b>① 选物质</b>（放在铜片上）');
    const mat = pick(ui, box, MAT.map(m => m.name), 2, () => { removed = false; draw(); });
    ui.note('<b>② 是否与氧气接触</b>');
    const ox = pick(ui, box, ['与空气接触', '罩上烧杯（隔绝氧气）'], 0, draw);
    const T = ui.slider({ label: '③ 加热到的温度', min: 20, max: 600, step: 10, value: 20, unit: '℃' }, draw);
    const fig = ui.fig();
    ui.action('灭火：移走可燃物', () => { removed = true; draw(); });
    ui.action('灭火：罩上烧杯', () => { ox.set(1); draw(); });
    ui.action('灭火：用水降温', () => { T.set(20); draw(); });
    ui.action('重置', () => { removed = false; ox.set(0); T.set(20); draw(); });
    const out = ui.out();
    ui.note('燃烧要<b>同时</b>满足三个条件；灭火只要破坏其中<b>任意一个</b>。注意：着火点是物质本身的属性，一般不能改变，灭火是把<b>温度</b>降到着火点以下。图中温度计上的虚线标出所选物质的着火点（大致数值）。');

    function draw() {
      const m = MAT[mat.get()], t = T.get(), cover = ox.get() === 1;
      const c1 = m.fuel && !removed, c2 = !cover, c3 = m.fuel && t >= m.ign;
      const burn = c1 && c2 && c3;
      let s = '';
      // 铜片、支架、酒精灯
      s += F.rect(50, 150, 180, 6, 'soft') + F.line(60, 156, 50, 222) + F.line(220, 156, 230, 222) + F.line(40, 222, 240, 222);
      s += F.lamp(140, 180, { fire: t > 20 });
      // 物质
      const x = 140, y = 150;
      if (!removed) {
        if (m.name === '白磷') s += F.circle(x, y - 7, 7, 'soft');
        else if (m.name === '红磷') s += F.circle(x, y - 7, 7, 'solid');
        else if (m.name === '小木块') s += F.rect(x - 16, y - 14, 32, 14, 'soft', 2);
        else if (m.name === '小煤块') s += F.polygon([[x - 14, y], [x - 12, y - 11], [x + 2, y - 15], [x + 13, y - 8], [x + 12, y]], 'solid');
        else s += F.polygon([[x - 14, y], [x - 10, y - 10], [x + 4, y - 13], [x + 14, y - 5], [x + 13, y]], 'thin');
        s += F.text(x + 26, y - 7, m.name, { a: 'start', size: 12 });
      } else s += F.text(x, y - 8, '（可燃物已移走）', { size: 12 });
      if (burn) s += flame(x - 6, y - 12, 1.6) + flame(x + 7, y - 12, 1.9) + flame(x, y - 14, 2.6);
      // 罩上的烧杯（倒扣）
      if (cover) s += F.poly([[78, 148], [78, 60], [202, 60], [202, 148]], 'ink') + F.text(140, 50, '倒扣的烧杯', { size: 12 });
      // 温度计
      const ty = v => 200 - v / 600 * 160;
      s += F.rect(270, 36, 12, 166, 'thin', 6) + F.rect(272, ty(t), 8, 200 - ty(t), 'water') + F.circle(276, 206, 9, 'water');
      [0, 200, 400, 600].forEach(v => { s += F.line(282, ty(v), 288, ty(v), 'thin') + F.text(292, ty(v), v, { a: 'start', size: 11 }); });
      s += F.text(276, 22, t + ' ℃', { size: 13 });
      if (m.fuel) s += F.line(250, ty(m.ign), 300, ty(m.ign), 'force dash') + F.text(246, ty(m.ign), '着火点', { a: 'end', size: 11, cls: 'red' });
      // 三个条件
      const row = (yy, ok, txt) => F.text(350, yy, (ok ? '✓ ' : '✗ ') + txt, { a: 'start', size: 14, cls: ok ? '' : 'red' });
      s += F.text(350, 50, '燃烧的三个条件', { a: 'start', size: 14 });
      s += row(82, c1, '可燃物') + row(110, c2, '与氧气接触') + row(138, c3, '温度达到着火点');
      s += F.text(350, 182, burn ? '→ 燃烧！' : '→ 不能燃烧', { a: 'start', size: 18, cls: burn ? 'orange' : '' });
      fig.innerHTML = F.svg(540, 236, s);

      let html = `<b>${removed ? '可燃物已移走' : m.name}</b>：${m.note}。当前温度 <b>${t} ℃</b>，${cover ? '已用烧杯罩住（隔绝氧气）' : '与空气接触'}。<br>`;
      if (burn) {
        html += '三个条件都满足，<b>燃烧</b>。要灭火，破坏任一个条件即可：移走可燃物（<b>清除可燃物</b>）、罩上烧杯（<b>隔绝氧气</b>）、用水降温（<b>使温度降到着火点以下</b>）。';
      } else {
        const miss = [];
        if (!c1) miss.push(removed ? '没有可燃物——对应灭火原理“清除或隔离可燃物”（如关闭燃气阀门、开辟隔离带）' : '石块不是可燃物');
        if (!c2) miss.push('没有与氧气接触——对应灭火原理“隔绝氧气”（如盖锅盖、灯帽盖灭酒精灯）');
        if (m.fuel && !c3) miss.push(`温度 ${t} ℃ 低于着火点 ${m.ign} ℃——对应灭火原理“使温度降到着火点以下”（如用水灭火）`);
        html += '<b>不能燃烧</b>，因为：' + miss.join('；') + '。';
      }
      out.innerHTML = html;
    }
    draw();
  };

  /* ---------- 二氧化碳的性质实验 ---------- */
  SIMS.c3_4_co2 = function (box) {
    const ui = SIMS.ui(box, '二氧化碳的性质实验');
    const EXP = ['倾倒二氧化碳', '软塑料瓶', '石蕊纸花', '澄清石灰水'];
    let k = 0, t = 0, stage = 0;     // t：动画进度 0～1；stage：纸花实验的步骤
    const anim = tween(box, 3, v => { t = v; draw(); });
    pick(ui, box, EXP, 0, i => { k = i; reset(); });
    const fig = ui.fig();
    const go = ui.action('做实验', () => {
      if (k === 2) { stage = Math.min(2, stage + 1); draw(); return; }
      t = 0; anim.play();
    });
    ui.action('重置', reset);
    const out = ui.out();

    function reset() { anim.stop(); t = 0; stage = 0; draw(); }

    const PURPLE = 'rgb(130,80,190)', RED = 'rgb(225,40,90)';
    function flower(x, y, color, label, sub) {
      let s = '';
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        s += `<circle cx="${r1(x + 13 * Math.cos(a))}" cy="${r1(y + 13 * Math.sin(a))}" r="10" style="fill:${color};fill-opacity:.75"/>`;
      }
      s += F.circle(x, y, 6, 'soft') + F.line(x, y + 22, x, y + 58, 'ink');
      s += F.text(x, y + 76, label, { size: 14 }) + F.text(x, y + 96, sub, { size: 12 });
      return s;
    }

    function draw() {
      let s = '', html = '';
      if (k === 0) {
        // 阶梯 + 两支蜡烛，二氧化碳从底部逐渐升高
        const bx = 170, by = 50, bw = 190, bh = 160, bot = by + bh;
        const level = bot - t * (bh - 10);
        if (t > 0) s += `<rect x="${bx}" y="${r1(level)}" width="${bw}" height="${r1(bot - level)}" style="fill:var(--fig-hi);fill-opacity:.15"/>`;
        s += F.polygon([[bx + 2, bot - 2], [bx + 2, bot - 30], [bx + 95, bot - 30], [bx + 95, bot - 70], [bx + bw - 2, bot - 70], [bx + bw - 2, bot - 2]], 'soft');
        const cands = [[bx + 48, bot - 30], [bx + 142, bot - 70]];
        cands.forEach(([x, yb]) => {
          const top = yb - 26, lit = level > top - 4;
          s += F.rect(x - 7, top, 14, 26, 'soft', 1) + F.line(x, top, x, top - 5, 'ink') + (lit ? flame(x, top - 3, 1) : '');
        });
        s += F.beaker(bx, by, bw, bh, 0);
        if (t > 0 && t < 1) s += F.arrow(bx + 20, by - 10, bx + 30, by + 40, { cls: 'hi', dash: true, size: 7 });
        s += F.text(bx - 10, 40, t > 0 ? '倒入二氧化碳 →' : '', { a: 'end', size: 13 });
        s += F.text(bx + 48, bot + 18, '下层', { size: 12 }) + F.text(bx + 142, bot + 18, '上层', { size: 12 });
        fig.innerHTML = F.svg(540, 236, s);
        html = t === 0 ? '点“做实验”，把二氧化碳沿烧杯壁慢慢倒入。' :
          `现象：二氧化碳从烧杯底部逐渐“装满”，<b>下层蜡烛先熄灭，上层蜡烛后熄灭</b>。<br>结论：二氧化碳<b>密度比空气大</b>（物理性质）；<b>不燃烧，也不支持燃烧</b>（化学性质）。所以二氧化碳可以用来灭火。`;
      } else if (k === 1) {
        // 软塑料瓶：振荡后变瘪
        const cx = 270, top = 60, bot = 210, hw = 55, d = 24 * t;
        const w = y => hw - d * Math.sin(Math.PI * (y - top - 20) / (bot - top - 20));
        const pts = [];
        for (let y = top + 20; y <= bot; y += 5) pts.push([cx - w(y), y]);
        const right = pts.map(([x, y]) => [2 * cx - x, y]).reverse();
        const water = bot - (bot - top - 20) / 3;
        const wl = [], wr = [];
        for (let y = water; y <= bot; y += 5) { wl.push([cx - w(y), y]); wr.push([cx + w(y), y]); }
        s += F.polygon(wl.concat(wr.reverse()), 'water');
        s += F.poly([[cx - 14, top - 8], [cx - 14, top], [cx - hw, top + 20]].concat(pts, [[cx + w(bot), bot]], right, [[cx + hw, top + 20], [cx + 14, top], [cx + 14, top - 8]]), 'ink');
        s += F.rect(cx - 17, top - 20, 34, 14, 'soft', 3);
        s += F.text(cx, top + 60, '二氧化碳', { size: 13 }) + F.text(cx + hw + 14, water + 20, '水（约 1/3）', { a: 'start', size: 13 });
        fig.innerHTML = F.svg(540, 236, s);
        html = t === 0 ? '收集满二氧化碳的软塑料瓶中倒入约 1/3 体积的水，旋紧瓶盖。点“做实验”振荡。' :
          `现象：塑料瓶<b>变瘪</b>。<br>结论：二氧化碳<b>能溶于水</b>，瓶内气体减少，压强小于外界大气压。<br><span class="muted">注意：这个实验不能证明二氧化碳与水发生了反应——只是溶解也会变瘪。</span>`;
      } else if (k === 2) {
        const col = [RED, PURPLE, PURPLE, stage === 2 ? PURPLE : RED];
        const lab = [['Ⅰ', '喷稀醋酸'], ['Ⅱ', '喷水'], ['Ⅲ', '直接放入 CO₂'], ['Ⅳ', stage === 2 ? '烘烤后' : '喷水后放入 CO₂']];
        lab.forEach(([a, b], i) => { s += flower(90 + i * 120, 70, stage === 0 ? PURPLE : col[i], a, b); });
        fig.innerHTML = F.svg(540, 236, s);
        go.textContent = stage === 0 ? '做实验' : stage === 1 ? '把 Ⅳ 烘烤' : '已完成';
        html = stage === 0 ? '四朵用紫色石蕊溶液染成紫色的干燥纸花。点“做实验”分别处理。' :
          stage === 1 ? `现象：Ⅰ 变红，Ⅱ、Ⅲ 不变色，Ⅳ 变红。<br>分析：Ⅱ 说明水不能使石蕊变红，Ⅲ 说明干燥的二氧化碳也不能；Ⅳ 变红，说明二者反应生成了酸：${chem('CO2')} + ${chem('H2O')} = ${chem('H2CO3')}（碳酸使石蕊变红，对照 Ⅰ）。` :
            `现象：烘烤后 Ⅳ 由红色变回紫色。<br>结论：碳酸不稳定，受热分解：${chem('H2CO3')} = ${chem('H2O')} + ${chem('CO2')}↑。`;
      } else {
        // 向澄清石灰水中通入二氧化碳
        s += F.testTube(270, 50, 150, 90, 0.55);
        const lt = 50 + 150 * 0.45;
        if (t > 0) s += `<rect x="262" y="${r1(lt)}" width="16" height="${r1(200 - 9 - lt)}" style="fill:var(--fig-ink);fill-opacity:${(0.35 * t).toFixed(2)}"/>`;
        s += F.poly([[160, 30], [266, 30], [266, 186]], 'ink') + F.text(150, 30, 'CO₂', { a: 'end', size: 14 });
        if (t > 0 && t < 1) [0, 1, 2].forEach(i => { const yy = 186 - ((t * 400 + i * 30) % 80); s += F.circle(268, yy, 3, 'thin'); });
        s += F.text(300, 160, t > 0.3 ? '变浑浊' : '澄清石灰水', { a: 'start', size: 13 });
        fig.innerHTML = F.svg(540, 236, s);
        html = t === 0 ? '点“做实验”，向澄清石灰水中通入二氧化碳。' :
          `现象：澄清石灰水<b>变浑浊</b>（生成白色沉淀碳酸钙）。<br>${chem('CO2')} + ${chem('Ca(OH)2')} = ${chem('CaCO3')}↓ + ${chem('H2O')}<br>这是<b>检验</b>二氧化碳的方法。燃着的木条熄灭不能证明是二氧化碳（氮气也能使它熄灭）。`;
      }
      if (k !== 2) go.textContent = '做实验';
      out.innerHTML = html;
    }
    draw();
  };
})();
