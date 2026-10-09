// 第三阶段 物理组 7 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   SIMS.p3_7_lamp    测量小灯泡的电功率（调滑动变阻器、读电表、记录数据、画 I-U 图像）
//   SIMS.p3_7_joule   探究电流通过导体产生的热量跟电阻、电流的关系（U 形管液面高度差）
//   SIMS.p3_7_gears   多挡位电热器（串联短接型 / 并联型）
//   SIMS.p3_7_house   家庭电路中电流过大的原因（总功率过大、短路，保险丝熔断）
// 另外导出 SIMS._p3_7 = { dial, joule, gear }：physics/p3-7.js 里的静态图也用它们，保证图和演示一致。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const fm = (x, d) => SIMS.fmt(x, d == null ? 2 : d);

  /* ================= 电表表盘 ================= */
  // 左上角 (x,y)，大小 140×96。kind：'A' | 'V'；val 读数；range 所用量程（0.6/3 或 3/15），决定指针位置。
  // 表盘上同时印两排刻度：外排大量程，内排小量程（和实验室电表一样），每大格 10 小格。
  function dial(x, y, kind, val, range) {
    const cx = x + 70, cy = y + 84, r = 56;
    const big = kind === 'A' ? 3 : 15, small = kind === 'A' ? 0.6 : 3;
    const ang = f => (-140 + 100 * f) * Math.PI / 180;
    const at = (a, rr) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
    let s = F.rect(x, y, 140, 96, 'soft', 6);
    for (let i = 0; i <= 30; i++) {
      const a = ang(i / 30), l = i % 10 === 0 ? 9 : i % 5 === 0 ? 7 : 4;
      const p1 = at(a, r), p2 = at(a, r - l);
      s += F.line(p1[0], p1[1], p2[0], p2[1], 'thin');
    }
    for (let k = 0; k <= 3; k++) {
      const a = ang(k / 3), po = at(a, r + 8), pi = at(a, r - 17);
      s += F.text(po[0], po[1], fm(big * k / 3), { size: 10 }) + F.text(pi[0], pi[1], fm(small * k / 3), { size: 9 });
    }
    s += F.text(cx, cy - 14, kind, { size: 14 });
    const f = Math.max(-0.04, Math.min(1.04, val / range));
    const tip = at(ang(f), r - 3);
    s += F.line(cx, cy, tip[0], tip[1], 'force') + F.dot(cx, cy, 3);
    return s;
  }

  /* ================= 焦耳定律实验装置 ================= */
  // U 形管：左臂左壁在 x0，左臂通容器（封闭），右臂开口。hd 为两侧液面高度差（像素，0~80）
  function utube(x0, hd) {
    hd = Math.max(0, Math.min(80, hd));
    const yL = 85 + hd / 2, yR = 85 - hd / 2;
    return F.rect(x0, yL, 10, 140 - yL, 'water') + F.rect(x0 + 30, yR, 10, 140 - yR, 'water') + F.rect(x0, 130, 40, 10, 'water') +
      F.line(x0, yL, x0 + 10, yL, 'water-line') + F.line(x0 + 30, yR, x0 + 40, yR, 'water-line') +
      F.poly([[x0, 40], [x0, 140], [x0 + 40, 140], [x0 + 40, 40]]) + F.poly([[x0 + 10, 40], [x0 + 10, 130], [x0 + 30, 130], [x0 + 30, 40]]) +
      F.line(x0 - 2, 40, x0 + 12, 40);
  }
  // 密闭容器（内有电阻丝和空气），左上角 (x,110)，宽 100 高 80；电阻丝中心 (x+50,165)，引线从 x+20、x+80 穿出底部
  function box(x, name, rl) {
    return F.rect(x, 110, 100, 80, 'ink', 4) + F.text(x + 10, 122, name, { a: 'start', size: 13 }) + F.text(x + 82, 128, '空气', { size: 11 }) +
      F.wire([[x + 30, 165], [x + 20, 165], [x + 20, 190]]) + F.wire([[x + 70, 165], [x + 80, 165], [x + 80, 190]]) +
      F.comp('R', x + 50, 165, { label: rl, ly: -18 }) +
      F.wire([[x + 50, 110], [x + 50, 25], [x + 110, 25], [x + 110, 40]]);
  }
  // kind：'R' 两个容器里的电阻丝 ra、rb 串联；'I' 两个容器里都是 5 Ω，右边容器外再并联一个 5 Ω。
  // ha、hb：两个 U 形管的液面高度差（像素）。画布 400×285。
  function joule(kind, ha, hb, o) {
    o = o || {};
    const ra = o.ra || '5Ω', rb = o.rb || (kind === 'I' ? '5Ω' : '10Ω');
    let s = box(30, 'A', ra) + utube(135, ha) + box(230, 'B', rb) + utube(335, hb);
    // A 的右引线 → B 的左引线（串联）
    s += F.wire([[110, 190], [110, 230], [250, 230], [250, 190]]);
    if (kind === 'I') {
      s += F.wire([[250, 207], [260, 207]]) + F.wire([[300, 207], [310, 207]]) + F.node(250, 207) + F.node(310, 207) +
        F.comp('R', 280, 207, { label: '5Ω', ly: 15 });
    }
    // 电源、开关
    s += F.wire([[50, 190], [50, 262], [310, 262], [310, 190]]) +
      F.comp('battery', 130, 262) + F.comp('switch', 220, 262, { on: o.on !== false, label: 'S', ly: -18 });
    return s;
  }

  /* ================= 多挡位电热器电路 ================= */
  // kind：'series' R₁、R₂ 串联，S₂ 并联在 R₂ 两端；'par' R₁、R₂ 并联，S₂ 与 R₂ 串联。S₁ 在干路。画布 350×205。
  function gear(kind, s1, s2) {
    let s = '';
    const term = F.circle(95, 170, 4, 'ink') + F.circle(125, 170, 4, 'ink') + F.text(110, 192, '220 V', { size: 13 });
    if (kind === 'series') {
      s += F.wire([[91, 170], [50, 170], [50, 70], [310, 70], [310, 170], [129, 170]]) +
        F.wire([[195, 70], [195, 30], [265, 30], [265, 70]]) + F.node(195, 70) + F.node(265, 70) +
        F.comp('R', 120, 70, { label: 'R₁', ly: 22 }) + F.comp('R', 230, 70, { label: 'R₂', ly: 22 }) +
        F.comp('switch', 230, 30, { on: s2, label: 'S₂', ly: -18 }) +
        F.comp('switch', 230, 170, { on: s1, label: 'S₁', ly: -18 });
    } else {
      s += F.wire([[91, 170], [60, 170], [60, 40], [300, 40], [300, 170], [129, 170]]) + F.wire([[60, 100], [300, 100]]) +
        F.node(60, 100) + F.node(300, 100) +
        F.comp('R', 180, 40, { label: 'R₁', ly: -18 }) + F.comp('R', 140, 100, { label: 'R₂', ly: -18 }) +
        F.comp('switch', 230, 100, { on: s2, label: 'S₂', ly: -18 }) +
        F.comp('switch', 230, 170, { on: s1, label: 'S₁', ly: -18 });
    }
    return s + term;
  }

  SIMS._p3_7 = { dial, joule, gear };

  /* ================= 演示 1：测量小灯泡的电功率 ================= */
  SIMS.p3_7_lamp = function (box) {
    const ui = SIMS.ui(box, '测量“2.5 V”小灯泡的电功率');
    const fig = ui.fig();
    const RP = ui.slider({ label: '变阻器接入电阻 R′', min: 0, max: 20, step: 0.5, value: 20, unit: 'Ω' }, draw);
    ui.action('记录这组数据', record);
    ui.action('清空记录', () => { rec.length = 0; draw(); });
    const out = ui.out();
    const plot = ui.fig();
    ui.note('电源电压 4.5 V，滑动变阻器“20 Ω 1 A”，电压表用 0~3 V 量程，电流表用 0~0.6 A 量程。先让滑片在阻值最大处，再慢慢减小 R′：使电压表示数分别略低于、等于、略高于 2.5 V（不要超过额定电压的 1.2 倍，即 3 V），各记录一组。记录几组后看 I-U 图像：它不是直线——灯丝温度升高，电阻变大。');

    const E0 = 4.5, A = 0.25 / Math.pow(2.5, 0.6);      // 灯：I = A·U^0.6，2.5 V 时 0.25 A（R′ = 8 Ω 时正常发光）
    const IL = u => A * Math.pow(u, 0.6);
    const rec = [];
    function solve(rp) {                                 // U + rp·I(U) = E0，二分法
      let lo = 0, hi = E0;
      for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (m + rp * IL(m) > E0) hi = m; else lo = m; }
      return lo;
    }
    function state() {
      const rp = RP.get(), u = solve(rp), i = IL(u);
      return { rp, u, i, p: u * i };
    }
    function record() {
      const c = state();
      if (c.u > 3.0001) return;
      rec.push({ u: +c.u.toFixed(2), i: +c.i.toFixed(2) });
      draw();
    }
    function draw() {
      const c = state(), burnt = c.u > 3.0001;
      // 电路
      let s = F.wire([[50, 75], [50, 185], [290, 185], [290, 75], [50, 75]]) +
        F.wire([[100, 75], [100, 30], [160, 30], [160, 75]]) + F.node(100, 75) + F.node(160, 75) +
        F.comp('V', 130, 30) + F.comp('lamp', 130, 75, { label: 'L', ly: 26 });
      if (!burnt && c.p > 0) {
        const op = Math.min(1, 0.1 + 0.9 * c.p / 0.9);
        s += `<circle cx="130" cy="75" r="9" style="fill:var(--fig-ray);opacity:${op.toFixed(2)}"/>` +
          `<circle cx="130" cy="75" r="17" style="fill:none;stroke:var(--fig-ray);stroke-width:4;opacity:${(op * 0.5).toFixed(2)}"/>` +
          F.line(123, 68, 137, 82) + F.line(123, 82, 137, 68);
      }
      const px = 225 - 28 + 56 * c.rp / 20;
      s += F.rect(195, 66, 71, 18, 'mask') + F.rect(195, 68, 60, 14, 'ink') +
        F.arrow(px, 45, px, 67, { size: 7 }) + F.wire([[px, 45], [267, 45], [267, 75]]) +
        F.text(px - 11, 45, 'P', { cls: 'it', size: 14 }) + F.text(225, 98, 'R′', { cls: 'it', size: 15 }) +
        F.comp('A', 230, 185) + F.comp('battery', 50, 130, { v: true }) +
        F.comp('switch', 120, 185, { on: true, label: 'S', ly: -20 });
      s += dial(330, 10, 'V', c.u, 3) + dial(330, 115, 'A', c.i, 0.6);
      fig.innerHTML = F.svg(480, 215, s);

      let st;
      if (burnt) st = '<b>电压超过 3 V（额定电压的 1.2 倍），灯丝可能烧断，电压表也超出量程！</b>请增大 R′。';
      else if (Math.abs(c.u - 2.5) < 0.015) st = '<b>电压表示数等于额定电压 2.5 V，灯正常发光</b>，此时的功率就是额定功率。';
      else if (c.u < 2.5) st = '实际电压低于额定电压，灯比正常发光暗。要使灯正常发光，应<b>减小</b> R′（滑片向左移）。';
      else st = '实际电压高于额定电压，灯比正常发光亮。';
      out.innerHTML = `电压表 <b>${fm(c.u)} V</b>，电流表 <b>${fm(c.i)} A</b>，实际功率 P = UI = <b>${fm(c.p, 3)} W</b><br>${st}` +
        (rec.length ? '<table class="tbl"><tr><th>次数</th><th>U/V</th><th>I/A</th><th>P/W</th><th>R/Ω</th></tr>' +
          rec.map((r, k) => `<tr><td>${k + 1}</td><td>${r.u}</td><td>${r.i}</td><td>${fm(r.u * r.i, 3)}</td><td>${fm(r.u / r.i, 1)}</td></tr>`).join('') + '</table>' : '');

      if (rec.length) {
        const o = { x: 50, y: 30, w: 230, h: 130, xmax: 3, ymax: 0.35, xticks: [1, 2, 3], yticks: [0.1, 0.2, 0.3], xlabel: 'U/V', ylabel: 'I/A' };
        let g = SIMS.axes(o);
        const pts = [];
        for (let k = 0; k <= 30; k++) pts.push([o.px(k / 10), o.py(IL(k / 10))]);
        g += F.poly(pts, 'thin dash');
        rec.forEach(r => { g += `<circle class="hi-fill" cx="${o.px(r.u).toFixed(1)}" cy="${o.py(r.i).toFixed(1)}" r="4"/>`; });
        plot.innerHTML = F.svg(320, 190, g, '记录的数据点（虚线为灯的 I-U 图像）');
      } else plot.innerHTML = '';
    }
    draw();
  };

  /* ================= 演示 2：探究焦耳定律 ================= */
  SIMS.p3_7_joule = function (box) {
    const ui = SIMS.ui(box, '电流通过导体产生的热量跟什么因素有关');
    const fig = ui.fig();
    const kind = ui.buttons(['跟电阻的关系', '跟电流的关系'], draw, 0);
    const I = ui.slider({ label: '干路电流 I', min: 0.5, max: 2, step: 0.1, value: 1, unit: 'A' }, draw);
    const T = ui.slider({ label: '通电时间 t', min: 0, max: 120, step: 5, value: 0, unit: 's' }, draw);
    const out = ui.out();
    ui.note('电阻丝放出的热量使容器里的空气受热膨胀，推动 U 形管里的液面：<b>液面高度差越大，说明产生的热量越多</b>（转换法）。“跟电阻的关系”：5 Ω 与 10 Ω 串联，电流和通电时间相同。“跟电流的关系”：两个容器里都是 5 Ω，右边容器外并联一个 5 Ω 分走一半电流，电阻和通电时间相同。');

    function draw() {
      const k = kind.get(), i = I.get(), t = T.get();
      const ia = i, ib = k === 1 ? i / 2 : i, ra = 5, rb = k === 1 ? 5 : 10;
      const qa = ia * ia * ra * t, qb = ib * ib * rb * t;
      const K = 80 / 4800;                              // 像素 / J
      let s = joule(k === 1 ? 'I' : 'R', qa * K, qb * K);
      s += F.text(80, 205, 'I = ' + fm(ia) + ' A', { size: 12 }) + F.text(280, k === 1 ? 182 : 205, 'I = ' + fm(ib) + ' A', { size: 12 });
      fig.innerHTML = F.svg(400, 285, s);
      out.innerHTML = `A：Q = I²Rt = (${fm(ia)} A)² × ${ra} Ω × ${t} s = <b>${fm(qa, 1)} J</b>；B：Q = (${fm(ib)} A)² × ${rb} Ω × ${t} s = <b>${fm(qb, 1)} J</b><br>` +
        (t === 0 ? '拖动“通电时间”开始加热。' : k === 0
          ? '电流、时间相同，<b>电阻大的 B 产生的热量多</b>（是 A 的 2 倍）。'
          : '电阻、时间相同，<b>电流大的 A 产生的热量多</b>：电流是 B 的 2 倍，热量是 B 的 4 倍（Q 与 I² 成正比）。') +
        (t > 0 ? '<br>再看同一个容器：通电时间越长，高度差越大——产生的热量越多。' : '');
    }
    draw();
  };

  /* ================= 演示 3：多挡位电热器 ================= */
  SIMS.p3_7_gears = function (box) {
    const ui = SIMS.ui(box, '电热器的高温挡和低温挡');
    const fig = ui.fig();
    const kind = ui.buttons(['串联型：S₂ 短接 R₂', '并联型：S₂ 接入 R₂'], draw, 0);
    const b1 = ui.buttons(['S₁ 断开', 'S₁ 闭合'], draw, 1);
    const b2 = ui.buttons(['S₂ 断开', 'S₂ 闭合'], draw, 0);
    const out = ui.out();
    ui.note('串联型：R₁ = 44 Ω，R₂ = 66 Ω；并联型：R₁ = 110 Ω，R₂ = 55 Ω。电压一定，由 P = U²/R：<b>总电阻越小，功率越大，是高温挡</b>。串联型闭合 S₂ 把 R₂ 短路，只剩 R₁；并联型闭合 S₂ 多并上一个 R₂，总电阻变小。');

    function draw() {
      const ser = kind.get() === 0, s1 = b1.get() === 1, s2 = b2.get() === 1;
      fig.innerHTML = F.svg(350, 205, gear(ser ? 'series' : 'par', s1, s2));
      const U = 220;
      let r, desc;
      if (!s1) { out.innerHTML = 'S₁ 断开，电路不通，电热器不工作。'; return; }
      if (ser) {
        if (s2) { r = 44; desc = 'S₂ 把 R₂ 短路，只有 R₁ 工作'; }
        else { r = 110; desc = 'R₁、R₂ 串联'; }
      } else {
        if (s2) { r = 110 * 55 / 165; desc = 'R₁、R₂ 并联'; }
        else { r = 110; desc = '只有 R₁ 工作'; }
      }
      const p = U * U / r, hi = (ser && s2) || (!ser && s2);
      out.innerHTML = `${desc}，总电阻 R = ${fm(r, 2)} Ω<br>P = U²/R = (220 V)² ÷ ${fm(r, 2)} Ω = <b>${fm(p, 0)} W</b>，电流 I = P/U = ${fm(p / U, 2)} A` +
        `<br>这是<b>${hi ? '高温挡' : '低温挡'}</b>。`;
    }
    draw();
  };

  /* ================= 演示 4：家庭电路中电流过大 ================= */
  SIMS.p3_7_house = function (box) {
    const ui = SIMS.ui(box, '家庭电路中电流过大的原因');
    const fig = ui.fig();
    const APP = [
      { n: '电灯', p: 40 }, { n: '电视机', p: 200 }, { n: '电饭锅', p: 800 },
      { n: '电热水壶', p: 1500 }, { n: '空调', p: 2000 }, { n: '电暖器', p: 2200 }
    ];
    const on = APP.map(() => false);
    let shorted = false, blown = false;
    const btns = APP.map((a, k) => {
      const b = ui.action(a.n + ' ' + a.p + ' W', () => { if (blown) return; on[k] = !on[k]; b.classList.toggle('on', on[k]); draw(); });
      return b;
    });
    ui.action('⚡ 短路', () => { if (blown) return; shorted = true; draw(); });
    ui.action('↺ 换新保险丝', () => { blown = false; shorted = false; on.fill(false); btns.forEach(b => b.classList.remove('on')); draw(); });
    const out = ui.out();
    ui.note('保险丝的额定电流为 20 A，即电路最多允许 P = UI = 220 V × 20 A = 4400 W。用电器是并联的，每多开一个，干路电流就增大。');

    function draw() {
      const P = APP.reduce((s, a, k) => s + (on[k] ? a.p : 0), 0);
      let I = P / 220;
      if (shorted) blown = true;
      if (!blown && I > 20) blown = true;
      let s = F.line(20, 40, 470, 40) + F.line(20, 210, 470, 210) +
        F.text(22, 26, '火线', { a: 'start', size: 13 }) + F.text(22, 226, '零线', { a: 'start', size: 13 });
      s += F.rect(50, 34, 40, 12, 'mask') + F.comp('fuse', 70, 40);
      if (blown) s += F.rect(62, 30, 16, 20, 'mask') + F.text(70, 60, '熔断', { cls: 'red', size: 12 });
      else s += F.text(70, 60, '保险丝', { size: 12 });
      APP.forEach((a, k) => {
        const x = 140 + k * 62;
        s += F.wire([[x, 40], [x, 60]]) + F.node(x, 40) + F.comp('switch', x, 80, { v: true, on: on[k] }) +
          F.wire([[x, 100], [x, 120]]) + F.rect(x - 27, 120, 54, 40, on[k] && !blown ? 'water' : 'soft', 4) +
          F.text(x, 133, a.n, { size: 11 }) + F.text(x, 148, a.p + ' W', { size: 11 }) +
          F.wire([[x, 160], [x, 210]]) + F.node(x, 210);
      });
      if (shorted) s += F.wire([[110, 40], [110, 210]]).replace('class="ink"', 'class="force"') + F.node(110, 40) + F.node(110, 210) +
        F.text(104, 175, '短路', { a: 'end', cls: 'red', size: 12 });
      fig.innerHTML = F.svg(490, 240, s);
      if (shorted) {
        out.innerHTML = '<b>短路！</b>火线和零线直接连通，电路中电阻几乎为零，电流非常大，保险丝立即熔断，切断电路。（没有保险丝的话，导线会急剧发热，可能引起火灾。）';
      } else if (blown) {
        out.innerHTML = `总功率 ${P} W，干路电流 I = P/U = ${P} W ÷ 220 V ≈ <b>${fm(I, 1)} A &gt; 20 A</b>：<b>用电器总功率过大</b>，保险丝熔断，所有用电器停止工作。点“换新保险丝”重来。`;
      } else {
        out.innerHTML = `正在工作的总功率 P = <b>${P} W</b>，干路电流 I = P/U = ${P} W ÷ 220 V ≈ <b>${fm(I, 2)} A</b>（保险丝额定电流 20 A）` +
          (P ? '' : '<br>点上面的用电器按钮把它们打开。');
      }
    }
    draw();
  };
})();
