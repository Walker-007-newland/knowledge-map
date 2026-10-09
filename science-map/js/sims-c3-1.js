// 第三阶段 化学组 1 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   c3_1_classify  物理变化还是化学变化：逐张判断生活、传统文化中的变化
//   c3_1_o2        测定空气中氧气的含量（红磷燃烧）：规范操作与各种误差
//   c3_1_burn      木炭、硫、铁丝、红磷在空气中和在氧气中燃烧的现象对比
// 另外导出 SIMS._c3_1.o2App（测氧装置图）、SIMS._c3_1.burnJar（集气瓶中燃烧图），chemistry/c3-1.js 复用
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  const sub = s => s.replace(/([A-Za-z)])(\d+)/g, '$1<sub>$2</sub>');
  const C = s => `<span class="chem">${sub(s)}</span>`;
  const COND = (top, bot) => `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;margin:0 .3em"><span style="font-size:.7em;min-height:1.15em">${top ? sub(top) : ''}</span><span style="display:block;width:2.4em;border-top:3px double currentColor"></span><span style="font-size:.7em;min-height:1.15em">${bot || ''}</span></span>`;
  const EQI = (l, r, top, bot) => `<span class="chem" style="white-space:normal">${sub(l)}${COND(top, bot)}${sub(r)}</span>`;

  // 动画循环：每帧调用 tick(dt 秒)，tick 返回 false 时停止
  function animator(box, tick, onStop) {
    let gen = 0, running = false;
    return {
      get running() { return running; },
      start() {
        running = true;
        const my = ++gen;
        let last = 0;
        const step = ts => {
          if (my !== gen || !running) return;
          if (!box.isConnected) { running = false; return; }
          const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
          last = ts;
          if (tick(dt) === false) { running = false; onStop && onStop(); return; }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      stop() { running = false; gen++; }
    };
  }

  // 火焰：尖端 (x, y-h)，底部 (x, y)，半宽 w；style 可指定颜色
  const flame = (x, y, h, w, style) =>
    `<path class="ray" style="${style || 'fill:var(--fig-water)'}" d="M${x},${y - h} Q${x + w},${y - h * 0.36} ${x},${y} Q${x - w},${y - h * 0.36} ${x},${y - h} Z"/>`;
  const fade = (svg, a) => `<g style="opacity:${a.toFixed(2)}">${svg}</g>`;

  // 白烟颗粒的固定位置（集气瓶内，相对瓶口中心）
  const SMOKE = [];
  for (let i = 0; i < 46; i++) {
    const u = Math.sin(i * 12.9898) * 43758.5453, v = Math.sin(i * 78.233) * 12345.678;
    SMOKE.push([(u - Math.floor(u)) * 84 - 42, 34 + (v - Math.floor(v)) * 100, 3 + (i % 3) * 1.5]);
  }

  /* ---------- 测定空气中氧气含量的装置图 ---------- */
  // o: rise 进入集气瓶的水占瓶内空气体积的比例（0~1）；burn 0~1 火焰大小；smoke 0~1；
  //    open 弹簧夹打开；fuel 'P' 红磷 | 'C' 木炭 | ''；bubbles 导管口冒气泡；labels 标出仪器名；marks 标 1~5 刻度
  function o2App(o) {
    o = Object.assign({ rise: 0, burn: 0, smoke: 0, open: false, fuel: 'P', bubbles: 0, labels: true, marks: true }, o);
    const x = 110, y = 56, w = 104, h = 170;          // 集气瓶：瓶口 (x,y)，瓶底 y+h
    const top = y + 24, bot = y + h - 10;              // 瓶内空气：瓶肩到原有少量水的水面
    const air = bot - top;
    let s = '';
    // 瓶底原有的少量水 + 进入的水
    const wl = bot - air * o.rise;
    s += F.rect(x - w / 2, wl, w, y + h - wl, 'water') + F.line(x - w / 2, wl, x + w / 2, wl, 'water-line');
    // 白烟
    if (o.smoke > 0) SMOKE.forEach(([dx, dy, r]) => { if (y + dy < wl - 4) s += `<circle style="fill:var(--fig-ink);opacity:${(o.smoke * 0.3).toFixed(2)}" cx="${x + dx}" cy="${y + dy}" r="${r}"/>`; });
    s += F.jar(x, y, w, h);
    // 刻度：把瓶内空气体积分成 5 等份
    if (o.marks) for (let k = 1; k <= 5; k++) {
      const yy = bot - air * k / 5;
      s += F.line(x + w / 2 - 12, yy, x + w / 2, yy, 'thin') + F.text(x + w / 2 + 8, yy, k, { size: 12, a: 'start' });
    }
    // 橡胶塞、燃烧匙
    s += F.rect(x - 38, y - 16, 76, 20, 'soft', 2);
    const sx = x - 14, cy = y + 92;
    s += F.line(sx, y - 34, sx, cy, 'ink') + `<path class="ink" d="M${sx - 13},${cy} Q${sx},${cy + 16} ${sx + 13},${cy}"/>` + F.line(sx - 13, cy, sx + 13, cy, 'thin');
    if (o.fuel) {
      const cls = o.fuel === 'P' ? 'force-head' : 'solid';
      [[-6, 3], [0, 5], [6, 3], [-3, 0], [3, 0]].forEach(([dx, dy], i) => { if (o.fuel !== 'P' || o.burn < 0.01 || i < 5) s += `<circle class="${cls}" cx="${sx + dx}" cy="${cy + dy}" r="2.6"/>`; });
    }
    if (o.burn > 0.01) {
      s += o.fuel === 'C' ? `<circle class="ray" style="fill:var(--fig-ray);opacity:.45" cx="${sx}" cy="${cy}" r="${(7 + 6 * o.burn).toFixed(1)}"/>`
        : flame(sx, cy - 2, 14 + 20 * o.burn, 6 + 5 * o.burn, 'fill:var(--fig-ray);fill-opacity:.55');
    }
    // 导管 + 弹簧夹 + 烧杯
    const tx = x + 16, ty = y - 40, bx = 252, by = 150;
    const bLevel = Math.max(0.2, 0.72 - o.rise * 1.4);
    s += F.beaker(bx, by, 96, 74, bLevel);
    s += F.poly([[tx, y - 2], [tx, ty], [bx + 48, ty], [bx + 48, by + 64]], 'ink');
    const cx = 210;
    if (o.open) s += F.rect(cx - 9, ty - 16, 18, 8, 'soft', 2) + F.rect(cx - 9, ty + 8, 18, 8, 'soft', 2);
    else s += F.rect(cx - 9, ty - 8, 18, 16, 'soft', 2) + F.line(cx - 9, ty, cx + 9, ty, 'ink');
    if (o.bubbles > 0) [[0, 0], [-6, -12], [5, -22]].forEach(([dx, dy], i) => {
      const yy = by + 58 + dy - (o.bubbles * 30 + i * 7) % 26;
      if (yy > by + 74 * (1 - bLevel) + 3) s += F.circle(bx + 48 + dx, yy, 3, 'thin');
    });
    if (o.open && o.rise > 0) s += F.arrow(bx + 30, ty + 30, bx + 30, ty + 6, { size: 6 });
    if (o.labels) {
      s += F.text(cx, ty + 28, '弹簧夹', { size: 12 }) + F.text(sx - 26, y - 30, '燃烧匙', { size: 12, a: 'end' });
      s += F.text(bx + 48, by + 90, '水', { size: 12 }) + F.text(x, y + h + 16, '集气瓶', { size: 12 });
      if (o.fuel) s += F.text(sx - 20, cy + 22, o.fuel === 'P' ? '红磷' : '木炭', { size: 12, a: 'end' });
    }
    return s;
  }

  /* ---------- 集气瓶中的燃烧 ---------- */
  // kind: 'C' 木炭 | 'S' 硫 | 'Fe' 铁丝 | 'P' 红磷；o2 true 在氧气中 / false 在空气中；bottom: 'water' | 'sand' | ''
  function burnJar(kind, o2, x, y, bottom) {
    const w = 96, h = 150;
    let s = '';
    if (bottom === 'water') s += F.rect(x - w / 2, y + h - 18, w, 18, 'water') + F.line(x - w / 2, y + h - 18, x + w / 2, y + h - 18, 'water-line');
    if (bottom === 'sand') for (let i = 0; i < 26; i++) s += F.dot(x - w / 2 + 4 + i * 3.5, y + h - 4 - (i % 3) * 3, 1.6);
    s += F.jar(x, y, w, h);
    s += F.line(x - 36, y - 2, x + 36, y - 2, 'hi');       // 玻璃片（移开一半）
    if (kind === 'Fe') {
      // 螺旋状铁丝，下端系火柴
      const sx = x, top = y - 30, end = y + 92;
      s += F.line(sx, top, sx, y + 30, 'ink');
      let d = `M${sx},${y + 30}`;
      for (let k = 0; k < 6; k++) d += ` q${k % 2 ? -14 : 14},5 0,10`;
      s += `<path class="ink" d="${d}"/>` + F.line(sx, y + 90, sx, end, 'ink');
      if (o2) {
        s += `<circle style="fill:var(--fig-ray);opacity:.5" cx="${sx}" cy="${y + 70}" r="12"/>`;
        for (let k = 0; k < 12; k++) {
          const a = k * Math.PI / 6 + 0.2, r1 = 14, r2 = 26 + (k % 3) * 6;
          s += F.line(sx + r1 * Math.cos(a), y + 70 + r1 * Math.sin(a), sx + r2 * Math.cos(a), y + 70 + r2 * Math.sin(a), 'ray');
        }
        [[-14, 112], [10, 120], [-4, 128]].forEach(([dx, yy]) => { s += F.dot(sx + dx, y + yy, 2.5); });
      } else {
        s += `<circle style="fill:var(--fig-ray);opacity:.35" cx="${sx}" cy="${y + 86}" r="7"/>`;
      }
      return s;
    }
    // 燃烧匙
    const sx = x, cy = y + 76;
    s += F.line(sx, y - 30, sx, cy, 'ink') + `<path class="ink" d="M${sx - 12},${cy} Q${sx},${cy + 15} ${sx + 12},${cy}"/>` + F.line(sx - 12, cy, sx + 12, cy, 'thin');
    if (kind === 'C') {
      s += F.circle(sx, cy - 3, 6, 'solid');
      s += `<circle style="fill:var(--fig-ray);opacity:${o2 ? 0.25 : 0.45}" cx="${sx}" cy="${cy - 3}" r="${o2 ? 22 : 10}"/>`;
      if (o2) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; s += F.line(sx + 14 * Math.cos(a), cy - 3 + 14 * Math.sin(a), sx + 24 * Math.cos(a), cy - 3 + 24 * Math.sin(a), 'ray'); }
    } else if (kind === 'S') {
      s += F.circle(sx, cy, 5, 'soft');
      s += o2 ? flame(sx, cy - 2, 40, 13, 'fill:rgb(110,80,235);fill-opacity:.55;stroke:rgb(110,80,235)')
        : flame(sx, cy - 2, 16, 6, 'fill:rgb(120,170,240);fill-opacity:.35;stroke:rgb(120,170,240)');
    } else if (kind === 'P') {
      [[-5, 2], [0, 4], [5, 2]].forEach(([dx, dy]) => { s += `<circle class="force-head" cx="${sx + dx}" cy="${cy + dy}" r="2.6"/>`; });
      s += flame(sx, cy - 2, o2 ? 34 : 22, o2 ? 11 : 7, 'fill:var(--fig-ray);fill-opacity:.5');
      SMOKE.slice(0, o2 ? 40 : 24).forEach(([dx, dy, r]) => { if (dy < 130) s += `<circle style="fill:var(--fig-ink);opacity:.25" cx="${x + dx}" cy="${y + dy - 10}" r="${r}"/>`; });
    }
    return s;
  }

  SIMS._c3_1 = { o2App, burnJar, flame };

  /* ---------- 物理变化还是化学变化 ---------- */
  const CARDS = [
    ['水沸腾变成水蒸气', 0, '只是水由液态变为气态，没有新物质生成。'],
    ['石蜡受热熔化', 0, '石蜡由固态变为液态，还是石蜡。'],
    ['蜡烛燃烧', 1, '生成了二氧化碳和水等新物质。'],
    ['铁锅生锈', 1, '铁锈是新物质（主要成分是氧化铁）。'],
    ['灯泡通电发光、放热', 0, '有发光放热现象，但钨丝还是钨丝，没有新物质生成。发光放热不是判断化学变化的依据。'],
    ['粮食酿酒', 1, '淀粉经发酵生成了酒精，有新物质生成。'],
    ['用葡萄榨成葡萄汁', 0, '只是把汁液和果渣分开，没有新物质生成。'],
    ['酒精挥发', 0, '酒精由液态变为气态。'],
    ['自行车轮胎在烈日下爆炸', 0, '气体受热膨胀把轮胎胀破，没有新物质生成。爆炸不一定是化学变化。'],
    ['烟花爆竹爆炸', 1, '火药燃烧生成了新物质（如二氧化硫等）。'],
    ['牛奶变酸', 1, '牛奶中的乳糖等在微生物作用下变成了乳酸等新物质。'],
    ['冰雪融化', 0, '固态的水变成液态的水。'],
    ['用活性炭吸附冰箱里的异味', 0, '活性炭把有气味的物质吸附在表面，没有新物质生成。'],
    ['德化白瓷在窑中高温烧制', 1, '黏土等原料在高温下发生复杂的变化，生成了新物质。'],
    ['茶叶的揉捻（把茶叶揉成条）', 0, '只改变了茶叶的形状。'],
    ['分离液态空气制氧气', 0, '利用氮气、氧气沸点不同把它们分开，氧气本来就在空气里，没有新物质生成。'],
    ['澄清石灰水敞口放置，表面出现一层白膜', 1, '石灰水吸收空气中的二氧化碳，生成了白色的碳酸钙。'],
    ['干冰升华，用于人工降雨', 0, '固态二氧化碳直接变成气态二氧化碳。'],
    ['绿色植物的光合作用', 1, '二氧化碳和水转化为有机物和氧气。'],
    ['木材加工成桌椅', 0, '只改变了木材的形状。'],
    ['食物腐烂', 1, '食物缓慢氧化，生成了有异味的新物质。'],
    ['铜丝导电', 0, '导电时铜还是铜，导电性是物理性质。'],
    ['用天然气做饭', 1, '天然气燃烧生成二氧化碳和水。'],
    ['湿衣服晾干', 0, '水蒸发到空气中，水还是水。']
  ];

  SIMS.c3_1_classify = function (box) {
    const ui = SIMS.ui(box, '判断：物理变化还是化学变化？');
    const fig = ui.fig();
    const btns = ui.buttons(['物理变化', '化学变化'], pick, -1);
    const row = box.querySelectorAll('.sim-btns')[0];
    const out = ui.out();
    ui.action('下一个 →', next);
    ui.action('重新开始', reset);
    ui.note('判断依据只有一条：<b>有没有生成新物质</b>。发光、放热、变色、放出气体、爆炸……这些现象只能帮你“想到”可能是化学变化，不能作为判断依据。');
    let order = [], i = 0, done = false, right = 0, total = 0;

    function reset() {
      order = CARDS.map((c, k) => k);
      for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
      i = 0; right = 0; total = 0; show();
    }
    function show() {
      done = false;
      row.querySelectorAll('.btn').forEach(b => b.classList.remove('on'));
      const c = CARDS[order[i]];
      fig.innerHTML = `<div style="font-size:20px;font-weight:600;text-align:center;padding:22px 8px;border:1px dashed var(--line, #ccc);border-radius:10px;margin:6px 0">${c[0]}</div>`;
      out.innerHTML = `第 ${i + 1} / ${CARDS.length} 张　已答 ${total} 张，答对 ${right} 张`;
    }
    function pick(k) {
      if (done) return;
      done = true;
      const c = CARDS[order[i]], ok = k === c[1];
      total++; if (ok) right++;
      out.innerHTML = `${ok ? '✓ 对了' : '✗ 不对'}：“${c[0]}”是<b>${c[1] ? '化学变化' : '物理变化'}</b>。${c[2]}<br><span class="muted">已答 ${total} 张，答对 ${right} 张</span>`;
    }
    function next() {
      if (i < CARDS.length - 1) { i++; show(); }
      else out.innerHTML = `全部完成！共 ${CARDS.length} 张，答对 ${right} 张。点“重新开始”再练一遍（顺序会打乱）。`;
    }
    void btns;
    reset();
  };

  /* ---------- 测定空气中氧气的含量 ---------- */
  const CASES = [
    { name: '规范操作', rise: 0.2, res: '水进入集气瓶，到达刻度 <b>1</b> 处，约占瓶内空气体积的 <b>1/5</b>。', why: '红磷足量，把瓶内氧气基本耗尽；装置不漏气；冷却到室温才打开弹簧夹。结论：<b>氧气约占空气体积的 1/5</b>。' },
    { name: '红磷量不足', rise: 0.13, res: '进入的水<b>不到</b> 1/5 —— 结果<b>偏小</b>。', why: '红磷太少，瓶内的氧气没有被耗尽，剩下的氧气仍占着体积，进入的水就少了。所以红磷要<b>足量（过量）</b>。' },
    { name: '装置漏气', rise: 0.12, res: '进入的水<b>不到</b> 1/5 —— 结果<b>偏小</b>。', why: '冷却时瓶内气压减小，外面的空气从漏气处钻进瓶内，补充了一部分体积，进入的水就少了。所以实验前要<b>检查装置的气密性</b>。' },
    { name: '没冷却就打开弹簧夹', rise: 0.14, early: true, res: '进入的水<b>不到</b> 1/5 —— 结果<b>偏小</b>。', why: '瓶内剩余气体温度还高、仍在膨胀，压强偏大，进入的水就少了。要<b>冷却到室温</b>再打开弹簧夹。' },
    { name: '弹簧夹没夹紧', rise: 0.26, loose: true, res: '进入的水<b>超过</b> 1/5 —— 结果<b>偏大</b>。', why: '红磷燃烧放热，瓶内气体受热膨胀，一部分空气沿导管从水中逸出（看烧杯里的气泡）。冷却后瓶内气体比原来少得更多，进入的水就多了。' },
    { name: '点燃红磷后伸入过慢', rise: 0.25, slow: true, res: '进入的水<b>超过</b> 1/5 —— 结果<b>偏大</b>。', why: '伸入燃烧匙、塞橡胶塞的过程中，瓶内空气受热膨胀，一部分从瓶口逸出了。所以点燃红磷后要<b>立即伸入瓶中并塞紧</b>橡胶塞。' },
    { name: '用木炭代替红磷', rise: 0.01, fuel: 'C', res: '水<b>几乎不</b>进入集气瓶。', why: `木炭燃烧消耗氧气，但生成了<b>二氧化碳气体</b>（${EQI('C + O2', 'CO2', '点燃')}），气体总体积变化不大，瓶内气压几乎不变。所以要选<b>只与氧气反应、且生成物不是气体</b>的物质。` }
  ];

  SIMS.c3_1_o2 = function (box) {
    const ui = SIMS.ui(box, '测定空气中氧气的含量（红磷燃烧法）');
    const fig = ui.fig();
    let ci = 0;
    ui.buttons(CASES.map(c => c.name), k => { ci = k; reset(); }, 0);
    ui.action('▶ 开始实验', start);
    ui.action('重置', reset);
    const out = ui.out();
    ui.note(`原理：${EQI('4P + 5O2', '2P2O5', '点燃')}。红磷燃烧消耗瓶内的氧气，生成的五氧化二磷是<b>固体</b>（白烟），瓶内气体减少、气压减小；冷却后打开弹簧夹，烧杯里的水在大气压作用下进入集气瓶，<b>进入的水的体积 ≈ 被消耗的氧气的体积</b>。剩下的气体主要是氮气：水进入一部分就不再上升，说明氮气<b>难溶于水</b>；红磷熄灭，说明氮气<b>不能燃烧、也不支持燃烧</b>。`);

    let t = 0, st = null;
    const anim = animator(box, dt => { t += dt; draw(); return t < st.end; });

    function reset() {
      anim.stop();
      const c = CASES[ci];
      t = 0;
      st = { end: c.early ? 4.6 : 7.2, open: c.early ? 2.6 : 5.2 };
      draw(true);
      out.innerHTML = `情形：<b>${c.name}</b>。点“开始实验”：点燃燃烧匙里的${c.fuel === 'C' ? '木炭' : '红磷'}，${c.slow ? '<b>慢慢地</b>' : '立即'}伸入集气瓶并塞紧橡胶塞。`;
    }
    function start() { reset(); anim.start(); }

    function draw(idle) {
      const c = CASES[ci];
      let burn = 0, smoke = 0, rise = 0, open = false, bubbles = 0, msg;
      if (idle) msg = null;
      else if (t < 2.4) {
        burn = Math.min(1, t / 0.4) * (t > 2 ? (2.4 - t) / 0.4 : 1);
        smoke = c.fuel === 'C' ? 0 : Math.min(1, t / 1.6);
        if (c.loose) bubbles = t;
        msg = c.fuel === 'C' ? '木炭在瓶中燃烧（发红光），生成无色气体……' : '红磷燃烧，产生大量<b>白烟</b>，放出热量……';
      } else if (t < st.open) {
        smoke = c.fuel === 'C' ? 0 : Math.max(0.15, 1 - (t - 2.4) / 3);
        msg = c.early ? '火焰刚熄灭，瓶子还很热，就打开了弹簧夹……' : '火焰熄灭，等待集气瓶<b>冷却到室温</b>，白烟逐渐消失……';
      } else {
        open = true;
        smoke = c.fuel === 'C' ? 0 : Math.max(0, 0.15 - (t - st.open) / 4);
        rise = c.rise * Math.min(1, (t - st.open) / 1.6);
        msg = t >= st.end - 0.05 ? `<b>结果</b>：${c.res}<br><b>原因</b>：${c.why}` : '打开弹簧夹，烧杯中的水沿导管进入集气瓶……';
      }
      let s = o2App({ rise, burn, smoke, open, bubbles, fuel: c.fuel || 'P' });
      if (c.name === '装置漏气') s += F.text(110, 22, '橡胶塞处漏气', { size: 12, cls: 'red' });
      fig.innerHTML = F.svg(380, 260, s);
      if (msg) out.innerHTML = msg;
    }
    reset();
  };

  /* ---------- 在空气中 / 在氧气中燃烧 ---------- */
  const BURN = {
    C: { name: '木炭', air: '持续红热（发红光），没有火焰', o2: '剧烈燃烧，<b>发出白光</b>，放出热量；生成能使澄清石灰水变浑浊的气体', eq: ['C + O2', 'CO2'],
      tip: '盛有木炭的燃烧匙要<b>由瓶口向下缓慢插入</b>，让木炭与瓶中氧气充分反应（插得太快，瓶内氧气受热逸出，木炭很快熄灭）。燃烧后向瓶中倒入澄清石灰水并振荡，石灰水变浑浊，证明生成了二氧化碳。', bottom: '' },
    S: { name: '硫', air: '发出<b>微弱的淡蓝色火焰</b>，放热，生成有刺激性气味的气体', o2: '发出<b>明亮的蓝紫色火焰</b>，放出热量，生成有刺激性气味的气体', eq: ['S + O2', 'SO2'],
      tip: '集气瓶底预先放<b>少量水</b>，用来<b>吸收二氧化硫</b>，防止污染空气（二氧化硫有毒）。硫是淡黄色固体。', bottom: 'water' },
    Fe: { name: '铁丝', air: '只能烧至红热，<b>不能燃烧</b>', o2: '剧烈燃烧，<b>火星四射</b>，放出大量的热，生成<b>黑色固体</b>', eq: ['3Fe + 2O2', 'Fe3O4'],
      tip: '瓶底预先放<b>少量水或铺一层细沙</b>，防止高温熔融物溅落使瓶底炸裂；铁丝<b>绕成螺旋状</b>，增大与氧气的接触面积（受热面积）；下端系一根<b>火柴</b>引燃，待<b>火柴快燃尽时</b>再伸入瓶中，避免火柴燃烧消耗过多氧气。', bottom: 'water' },
    P: { name: '红磷', air: '燃烧，产生<b>大量白烟</b>，放出热量', o2: '燃烧更剧烈，发出白光，产生大量白烟，放出热量', eq: ['4P + 5O2', '2P2O5'],
      tip: '白烟是五氧化二磷固体小颗粒，不是“白雾”（雾是小液滴）。红磷燃烧常用来测定空气中氧气的含量。', bottom: '' }
  };
  const BKEYS = ['C', 'S', 'Fe', 'P'];

  SIMS.c3_1_burn = function (box) {
    const ui = SIMS.ui(box, '在空气中和在氧气中燃烧，有什么不同？');
    let k = 0, env = 1;
    ui.buttons(BKEYS.map(x => BURN[x].name), i => { k = i; draw(); }, 0);
    ui.buttons(['在空气中', '在氧气中'], i => { env = i; draw(); }, 1);
    const fig = ui.fig();
    const out = ui.out();
    ui.note('同一种物质在氧气中燃烧比在空气中<b>更剧烈</b>：空气中氧气只占约 1/5，氧气浓度越大，燃烧越剧烈。描述现象时注意：“光”和“火焰”不同（木炭、铁丝没有火焰），“烟”（固体小颗粒）和“雾”（小液滴）不同；“生成二氧化碳”是结论，不是现象。');
    function draw() {
      const key = BKEYS[k], b = BURN[key], o2 = env === 1;
      let s = burnJar(key, o2, 130, 50, o2 ? b.bottom : '');
      s += F.text(130, 222, o2 ? '集气瓶中：氧气' : '集气瓶中：空气', { size: 13 });
      fig.innerHTML = F.svg(260, 236, s);
      out.innerHTML = `<b>${b.name}${o2 ? '在氧气中' : '在空气中'}</b>：${o2 ? b.o2 : b.air}。` +
        (key === 'Fe' && !o2 ? '' : `<br>反应：${EQI(b.eq[0], b.eq[1], '点燃')}`) +
        (o2 ? `<br><span class="muted">${b.tip}</span>` : `<br><span class="muted">对比：在氧气中——${b.o2}。</span>`);
    }
    draw();
  };
})();
