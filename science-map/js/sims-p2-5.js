// 第二阶段 组 5 互动演示（写法见 js/sims.js 顶部说明，清单见 docs/phase2-spec.md）
//   SIMS.p2_5_lever    杠杆平衡条件（钩码 / 测力计斜拉）
//   SIMS.p2_5_pulley   定滑轮、动滑轮、滑轮组：拉力、绳端移动距离、机械效率
//   SIMS.p2_5_swing    单摆：动能和重力势能的相互转化（有无空气阻力）
//   SIMS.p2_5_incline  斜面的机械效率与倾斜程度、粗糙程度
// 另外导出 SIMS._p2_5（滑轮组、实验杠杆的画图工具），physics/p2-5.js 画静态图时共用。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const r1 = v => Math.round(v * 10) / 10;

  /* ================= 共用画图工具 ================= */

  // 钩码：从挂点 (x,y) 往下挂 n 个，每个画成小圆柱
  function hooks(x, y, n) {
    let s = F.line(x, y, x, y + 10, 'thin');
    for (let i = 0; i < n; i++) s += F.rect(x - 7, y + 10 + i * 13, 14, 12, 'soft', 2);
    return s;
  }

  // 实验用杠杆（带刻度孔）。o:
  //   cx, cy 支点；u 每格像素；n 每侧格数；base 底座 y；tilt 倾角（度，正 = 右端下沉）
  //   w: [[格号(左负右正), 钩码个数], ...]
  //   sc: {p 格号, a 偏离竖直方向的角度（度，正 = 向远离支点一侧斜），up: true 表示向上拉}
  //   marks: {A: -3, B: 2} 在孔上方标字母；nuts: true 画两端的平衡螺母；noO: 不标 O
  function labLever(o) {
    const cx = o.cx, cy = o.cy, u = o.u || 30, N = o.n || 5, t = (o.tilt || 0) * Math.PI / 180;
    const ct = Math.cos(t), st = Math.sin(t);
    const at = (p, off) => [cx + p * u * ct - (off || 0) * st, cy + p * u * st + (off || 0) * ct];
    let s = F.line(cx, cy, cx, o.base, 'ink') + F.rect(cx - 45, o.base, 90, 7, 'soft', 2);
    s += F.polygon([at(-(N + 0.5), -4), at(N + 0.5, -4), at(N + 0.5, 4), at(-(N + 0.5), 4)], 'soft');
    if (o.nuts) [-(N + 0.5), N + 0.5].forEach(p => { const q = at(p + (p < 0 ? -0.2 : 0.2)); s += F.rect(q[0] - 4, q[1] - 6, 8, 12, 'ink', 2); });
    for (let p = -N; p <= N; p++) if (p) { const q = at(p); s += F.circle(q[0], q[1], 1.8, 'thin'); }
    s += F.circle(cx, cy, 4.5, 'soft') + F.dot(cx, cy, 1.8);
    if (!o.noO) s += F.text(cx, cy - 15, 'O', { cls: 'it', size: 15 });
    (o.w || []).forEach(([p, k]) => { const q = at(p); s += hooks(q[0], q[1], k); });
    Object.keys(o.marks || {}).forEach(k => { const q = at(o.marks[k], -15); s += F.text(q[0], q[1], k, { cls: 'it', size: 15 }); });
    if (o.sc) {
      const q = at(o.sc.p), sg = o.sc.p > 0 ? 1 : -1, a = (o.sc.a || 0) * Math.PI / 180;
      const up = o.sc.up ? -1 : 1;
      const d = [sg * Math.sin(a), up * Math.cos(a)];
      const rot = up > 0 ? -sg * (o.sc.a || 0) : 180 + sg * (o.sc.a || 0);
      s += `<g transform="translate(${r1(q[0])},${r1(q[1])}) rotate(${r1(rot)})">` +
        F.line(0, 0, 0, 12, 'ink') + F.rect(-8, 12, 16, 44, 'soft', 3) + F.line(-4, 22, 4, 22, 'thin') + F.line(-4, 30, 4, 30, 'thin') +
        F.line(-4, 38, 4, 38, 'thin') + F.circle(0, 62, 5, 'ink') + '</g>';
      o.scDir = d; o.scAt = q;
    }
    o.at = at;
    return s;
  }

  // 滑轮组（绳子全部竖直的“锯齿形”排法）。o:
  //   seq：从绳子起点到自由端依次经过的东西。C = 系在天花板，B = 系在动滑轮的框架上，
  //        L = 定滑轮单独使用时绳子左端直接拴物体，F = 定滑轮，M = 动滑轮。
  //        例：'LF' 定滑轮；'CM' 动滑轮；'CMF' n=2 向下拉；'BFM' n=3 向上拉；'CMFMF' n=4 向下拉
  //   x 绳子起点的 x；r 半径；yc 天花板；yf 定滑轮中心；ym 动滑轮中心（L 时是物体上表面）；
  //   tip 自由端末端的 y；rope=false 不画绳子（作图题题目）；hi=true 把承担物重的绳子画成蓝色；
  //   G 物体上写的字；Fl 拉力的标注（'' 不画拉力箭头）；
  // 画完后在 o 上留下 xe（自由端 x）、xc（物体中心 x）、yb（物体上表面 y）、down（自由端是否向下）
  function pulleys(o) {
    const seq = o.seq, r = o.r || 15, x = o.x, yc = o.yc, yf = o.yf, ym = o.ym;
    const list = seq.slice(1).split('');
    const cxs = list.map((k, i) => x + (2 * i + 1) * r);
    const xe = cxs[cxs.length - 1] + r, down = list[list.length - 1] === 'F';
    const rope = o.rope !== false;
    let s = '';
    // 天花板：盖住所有定滑轮和天花板上的系点
    const topX = [];
    if (seq[0] === 'C') topX.push(x);
    list.forEach((k, i) => { if (k === 'F') topX.push(cxs[i] - r, cxs[i] + r); });
    if (seq[0] === 'L' || !down) topX.push(x);
    const cl = Math.min(...topX) - 16, cr = Math.max(...topX) + 16;
    s += F.wall(cl, yc, cr, yc, 'up');
    // 定滑轮：吊杆 + 轮
    list.forEach((k, i) => { if (k === 'F') s += F.line(cxs[i], yc, cxs[i], yf, 'ink') + F.pulley(cxs[i], yf, r); });
    // 动滑轮和下面的框架、物体
    let xc, yb;
    if (seq[0] === 'L') {
      xc = x; yb = ym;
      s += F.block(x - 22, ym, 44, 34, o.G == null ? '' : o.G);
    } else {
      const mx = [];
      list.forEach((k, i) => { if (k === 'M') mx.push(cxs[i]); });
      if (seq[0] === 'B') mx.unshift(x);
      const ybar = ym + r + 10;
      list.forEach((k, i) => { if (k === 'M') s += F.line(cxs[i], ym, cxs[i], ybar, 'ink'); });
      if (seq[0] === 'B') s += F.line(x, ym, x, ybar, 'ink') + F.circle(x, ym, 3, 'ink');
      if (mx.length > 1) s += `<line class="ink" style="stroke-width:4" x1="${r1(mx[0] - 4)}" y1="${r1(ybar)}" x2="${r1(mx[mx.length - 1] + 4)}" y2="${r1(ybar)}"/>`;
      xc = (mx[0] + mx[mx.length - 1]) / 2; yb = ybar + 12;
      s += F.line(xc, ybar, xc, yb, 'ink') + F.block(xc - 22, yb, 44, 34, o.G == null ? '' : o.G);
      list.forEach((k, i) => { if (k === 'M') s += F.pulley(cxs[i], ym, r); });
    }
    // 绳子
    if (rope) {
      const sup = o.hi ? 'hi' : 'ink';
      let px = x, py = seq[0] === 'C' ? yc : ym, fromM = seq[0] === 'B';
      list.forEach((k, i) => {
        const cx = cxs[i], yy = k === 'F' ? yf : ym;
        s += F.line(px, py, cx - r, yy, (fromM || k === 'M') ? sup : 'ink');
        s += `<path class="ink" d="M${r1(cx - r)},${r1(yy)} A${r},${r} 0 0 ${k === 'F' ? 1 : 0} ${r1(cx + r)},${r1(yy)}"/>`;
        px = cx + r; py = yy; fromM = k === 'M';
      });
      const tip = o.tip != null ? o.tip : (down ? ym + 40 : yf + 15);
      s += F.line(px, py, xe, tip, fromM ? sup : 'ink');
      if (o.Fl !== '') s += F.arrow(xe, tip, xe, tip + (down ? 34 : -34), { cls: 'force', label: o.Fl || 'F', lcls: 'it red', lx: 12, ly: down ? -14 : 14 });
    }
    Object.assign(o, { xe, xc, yb, down });
    return s;
  }

  // 直角符号：在 p 点，两条边沿单位向量 a、b
  function rightMark(p, a, b, k) {
    k = k || 7;
    return F.poly([[p[0] + a[0] * k, p[1] + a[1] * k], [p[0] + (a[0] + b[0]) * k, p[1] + (a[1] + b[1]) * k], [p[0] + b[0] * k, p[1] + b[1] * k]], 'thin');
  }

  SIMS._p2_5 = { hooks, labLever, pulleys, rightMark };

  /* ================= 杠杆平衡条件 ================= */
  SIMS.p2_5_lever = function (box) {
    const ui = SIMS.ui(box, '探究杠杆的平衡条件');
    const fig = ui.fig();
    const nL = ui.slider({ label: '左侧钩码', min: 1, max: 4, step: 1, value: 2, unit: '个' }, draw);
    const pL = ui.slider({ label: '左侧挂在', min: 1, max: 5, step: 1, value: 3, fmt: v => '第 ' + v + ' 格' }, draw);
    const mode = ui.buttons(['右侧挂钩码', '右侧用弹簧测力计拉'], () => { rows(); draw(); }, 0);
    const nR = ui.slider({ label: '右侧钩码', min: 1, max: 6, step: 1, value: 2, unit: '个' }, draw);
    const pR = ui.slider({ label: '右侧挂在', min: 1, max: 5, step: 1, value: 2, fmt: v => '第 ' + v + ' 格' }, draw);
    const ang = ui.slider({ label: '测力计偏离竖直', min: 0, max: 60, step: 5, value: 0, unit: '°' }, draw);
    const out = ui.out();
    ui.note('每个钩码重 0.5 N，每格长 5 cm。先挂钩码，找几组能让杠杆水平平衡的挂法，比较“力 × 力臂”；再换成测力计：把测力计慢慢向外倾斜，力的作用线离支点变近，<b>力臂变短，示数变大</b>。');

    const ctrl = box.querySelectorAll('.sim-ctrl');   // 0 nL，1 pL，2 nR，3 pR，4 ang
    function rows() {
      const sc = mode.get() === 1;
      ctrl[2].style.display = sc ? 'none' : '';
      ctrl[4].style.display = sc ? '' : 'none';
    }
    const W0 = 0.5, CM = 5, f2 = v => SIMS.fmt(v, 2);

    function draw() {
      const sc = mode.get() === 1;
      const a = ang.get(), tauL = nL.get() * W0 * pL.get() * CM;
      const o = { cx: 280, cy: 80, u: 40, n: 5, base: 262, nuts: true, w: [[-pL.get(), nL.get()]] };
      let msg;
      if (!sc) {
        const tauR = nR.get() * W0 * pR.get() * CM;
        o.w.push([pR.get(), nR.get()]);
        o.tilt = tauR > tauL + 1e-9 ? 9 : tauR < tauL - 1e-9 ? -9 : 0;
        const fig1 = labLever(o);
        fig.innerHTML = F.svg(560, 280, fig1 + F.text(80, 250, '左：F₂ = ' + f2(nL.get() * W0) + ' N', { a: 'start', size: 13 }) +
          F.text(480, 250, '右：F₁ = ' + f2(nR.get() * W0) + ' N', { a: 'end', size: 13 }));
        msg = `左边：F₂l₂ = ${f2(nL.get() * W0)} N × ${pL.get() * CM} cm = <b>${f2(tauL)} N·cm</b>　右边：F₁l₁ = ${f2(nR.get() * W0)} N × ${pR.get() * CM} cm = <b>${f2(tauR)} N·cm</b><br>` +
          (o.tilt === 0 ? '两边相等，杠杆在水平位置<b>平衡</b>：F₁l₁ = F₂l₂。' :
            (o.tilt > 0 ? '右边的“力 × 力臂”大，<b>右端下沉</b>。' : '左边的“力 × 力臂”大，<b>左端下沉</b>。'));
      } else {
        const l1 = pR.get() * CM * Math.cos(a * Math.PI / 180), Fs = tauL / l1;
        o.sc = { p: pR.get(), a };
        let s = labLever(o);
        // 力的作用线（虚线）和力臂 l₁
        const q = o.scAt, d = o.scDir, O = [o.cx, o.cy];
        const tt = (O[0] - q[0]) * d[0] + (O[1] - q[1]) * d[1];
        const foot = [q[0] + tt * d[0], q[1] + tt * d[1]];
        if (a > 0) {
          s += F.line(q[0], q[1], foot[0] - 14 * d[0], foot[1] - 14 * d[1], 'thin dash');
          const ul = [(O[0] - foot[0]) / Math.hypot(O[0] - foot[0], O[1] - foot[1]), (O[1] - foot[1]) / Math.hypot(O[0] - foot[0], O[1] - foot[1])];
          s += rightMark(foot, ul, d);
        }
        const dy = a > 0 ? 0 : 14;
        s += F.line(O[0], O[1] + dy, foot[0], foot[1] + dy, 'hi') +
          F.text((O[0] + foot[0]) / 2 - (a > 0 ? 8 : 0), (O[1] + foot[1]) / 2 + (a > 0 ? -14 : 30), 'l₁', { cls: 'it', size: 16 });
        s += F.text(480, 250, '测力计示数 F₁ = ' + f2(Fs) + ' N', { a: 'end', size: 14 }) + F.text(80, 250, '左：F₂ = ' + f2(nL.get() * W0) + ' N', { a: 'start', size: 13 });
        fig.innerHTML = F.svg(560, 280, s);
        msg = `左边：F₂l₂ = ${f2(nL.get() * W0)} N × ${pL.get() * CM} cm = <b>${f2(tauL)} N·cm</b><br>` +
          `右边：动力臂 l₁ = ${f2(l1)} cm${a > 0 ? `（比挂点到 O 的距离 ${pR.get() * CM} cm 短）` : '（竖直拉时，力臂就是挂点到 O 的距离）'}，` +
          `F₁ = F₂l₂ / l₁ = <b>${f2(Fs)} N</b>`;
      }
      out.innerHTML = msg;
    }
    rows();
    draw();
  };

  /* ================= 滑轮与滑轮组 ================= */
  SIMS.p2_5_pulley = function (box) {
    const ui = SIMS.ui(box, '滑轮和滑轮组：省多少力，费多少距离');
    const KINDS = [
      { name: '定滑轮', seq: 'LF', n: 1, m: 0 },
      { name: '动滑轮', seq: 'CM', n: 2, m: 1 },
      { name: '滑轮组 n=2', seq: 'CMF', n: 2, m: 1 },
      { name: '滑轮组 n=3', seq: 'BFM', n: 3, m: 1 },
      { name: '滑轮组 n=4', seq: 'CMFMF', n: 4, m: 2 }
    ];
    const kind = ui.buttons(KINDS.map(k => k.name), draw, 3);
    const fig = ui.fig();
    const G = ui.slider({ label: '物重 G', min: 2, max: 20, step: 1, value: 12, unit: 'N' }, draw);
    const Gd = ui.slider({ label: '每个动滑轮重', min: 0, max: 4, step: 0.5, value: 1.5, unit: 'N' }, draw);
    const H = ui.slider({ label: '物体上升 h', min: 0, max: 20, step: 1, value: 0, unit: 'cm' }, draw);
    const out = ui.out();
    ui.note('不计绳重和摩擦。蓝色的绳子是<b>承担物重（与动滑轮相连）的绳子</b>，有几段就是 n。拖“物体上升 h”，看绳子自由端移动的距离 s = nh；改物重和动滑轮重，看拉力和机械效率怎么变。');

    const K = 1.5;   // 1 cm 画 1.5 px
    function draw() {
      const k = KINDS[kind.get()], g = G.get(), gd = Gd.get() * k.m, h = H.get(), n = k.n;
      const Fp = (g + gd) / n, sDist = n * h;
      const r = 15, L = k.seq.length - 1;
      const o = { seq: k.seq, r, x: 170 - r * L, yc: 30, yf: 75, ym: 225 - h * K, hi: true, G: 'G' };
      const down = k.seq[k.seq.length - 1] === 'F';
      const tip0 = down ? 250 : 150;
      o.tip = down ? tip0 + sDist * K : tip0 - sDist * K;
      let s = pulleys(o);
      // h 和 s 的标注（起点画虚线）
      const yb0 = o.yb + h * K + 34;   // 物体下表面原来的位置
      s += F.line(o.xc - 34, yb0, o.xc + 34, yb0, 'thin dash');
      if (h > 0) s += F.arrow(o.xc - 40, yb0, o.xc - 40, yb0 - h * K, { cls: 'thin', size: 6 }) + F.text(o.xc - 48, yb0 - h * K / 2, 'h', { cls: 'it', a: 'end' });
      s += F.line(o.xe - 10, tip0, o.xe + 30, tip0, 'thin dash');
      if (h > 0) s += F.arrow(o.xe + 24, tip0, o.xe + 24, o.tip, { cls: 'thin', size: 6 }) + F.text(o.xe + 32, (tip0 + o.tip) / 2, 's', { cls: 'it', a: 'start' });
      s += F.text(330, 70, '拉力 F = ' + SIMS.fmt(Fp, 2) + ' N', { a: 'start', size: 15 }) +
        F.text(330, 98, n === 1 ? '定滑轮：n = 1' : '承担物重的绳子 n = ' + n, { a: 'start', size: 14 }) +
        F.text(330, 126, 'h = ' + h + ' cm　s = ' + sDist + ' cm', { a: 'start', size: 14 });
      fig.innerHTML = F.svg(560, 420, s);

      const Wy = g * h / 100, Wz = Fp * sDist / 100, eta = (g + gd) > 0 ? g / (g + gd) : 1;
      let html = `<b>F</b> = (G + G<sub>动</sub>) / n = (${g} N + ${SIMS.fmt(gd, 1)} N) / ${n} = <b>${SIMS.fmt(Fp, 2)} N</b>` +
        (k.m === 0 ? '（定滑轮不省力，只改变力的方向）' : '') + '<br>' +
        `<b>s</b> = nh = ${n} × ${h} cm = <b>${sDist} cm</b><br>`;
      html += h > 0 ? `W<sub>有</sub> = Gh = ${g} N × ${SIMS.fmt(h / 100, 2)} m = ${SIMS.fmt(Wy, 3)} J　W<sub>总</sub> = Fs = ${SIMS.fmt(Fp, 2)} N × ${SIMS.fmt(sDist / 100, 2)} m = ${SIMS.fmt(Wz, 3)} J<br>` : '拖动“物体上升 h”就能算出有用功和总功。<br>';
      html += `机械效率 η = G / (G + G<sub>动</sub>) = <b>${SIMS.fmt(eta * 100, 1)}%</b>` + (k.m === 0 ? '（理想情况）' : '');
      out.innerHTML = html;
    }
    draw();
  };

  /* ================= 单摆：动能和势能的相互转化 ================= */
  SIMS.p2_5_swing = function (box) {
    const ui = SIMS.ui(box, '单摆：动能和重力势能的相互转化');
    const fig = ui.fig();
    const A0 = ui.slider({ label: '拉开的角度', min: 15, max: 60, step: 5, value: 45, unit: '°' }, reset);
    const air = ui.buttons(['不计空气阻力', '有空气阻力'], reset, 0);
    const btn = ui.action('▶ 放手', toggle);
    ui.action('↺ 重置', reset);
    const out = ui.out();
    ui.note('把小球拉到 A 点由静止放手。看右边的能量条：下降时重力势能变小、动能变大；上升时反过来。不计空气阻力时机械能（两段加起来）不变，小球总能回到同样高；有空气阻力时，一部分机械能转化为内能，小球越摆越低。');

    const PX = 200, PY = 30, LEN = 170, W = 2.4;   // 悬点、摆长（px）、角频率
    let t = 0, running = false, gen = 0;
    function state() {
      const a0 = A0.get() * Math.PI / 180, gam = air.get() ? 0.05 : 0;
      const amp = a0 * Math.exp(-gam * t), th = amp * Math.cos(W * t);
      const E0 = 1 - Math.cos(a0), E = 1 - Math.cos(amp), Ep = 1 - Math.cos(th);
      const vel = -amp * W * Math.sin(W * t);
      return { a0, th, E0, E, Ep, Ek: Math.max(0, E - Ep), Q: E0 - E, vel };
    }
    function toggle() {
      if (running) { running = false; gen++; btn.textContent = '▶ 继续'; return; }
      running = true; btn.textContent = '⏸ 暂停';
      const my = ++gen; let last = 0;
      const step = ts => {
        if (my !== gen || !running) return;
        if (!box.isConnected) { running = false; return; }
        if (last) t += Math.min(0.05, (ts - last) / 1000);
        last = ts;
        if (t > 60) t = 60;
        draw();
        if (running) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function reset() { running = false; gen++; t = 0; btn.textContent = '▶ 放手'; draw(); }

    function draw() {
      const c = state();
      const bx = PX - LEN * Math.sin(c.th), by = PY + LEN * Math.cos(c.th);
      const ax = PX - LEN * Math.sin(c.a0), ay = PY + LEN * Math.cos(c.a0);
      let s = F.wall(PX - 40, PY, PX + 40, PY, 'up');
      // 摆动轨迹（虚线圆弧）和 A、B、C 三点
      s += `<path class="thin dash" d="M${r1(ax)},${r1(ay)} A${LEN},${LEN} 0 0 0 ${r1(2 * PX - ax)},${r1(ay)}"/>`;
      s += F.line(PX, PY, PX, PY + LEN + 16, 'thin dash') + F.line(ax - 20, ay, 2 * PX - ax + 20, ay, 'thin dash');
      s += F.text(ax - 12, ay - 10, 'A', { cls: 'it' }) + F.text(PX + 12, PY + LEN + 20, 'B', { cls: 'it' }) + F.text(2 * PX - ax + 12, ay - 10, 'C', { cls: 'it' });
      s += F.line(PX, PY, bx, by, 'ink') + F.circle(bx, by, 11, 'soft') + F.dot(PX, PY, 3);
      // 能量条
      const bars = [[['动能'], c.Ek, 'hi-fill'], [['重力', '势能'], c.Ep, 'ray-head'], [['机械能'], c.E, 'solid'], [['内能', '(增加)'], c.Q, 'force-head']];
      const x0 = 420, bh = 150, base = 230, scale = bh / c.E0;
      bars.forEach(([name, val, cls], i) => {
        const x = x0 + i * 46, hgt = Math.max(0, val * scale);
        s += `<rect class="${cls}" x="${x}" y="${r1(base - hgt)}" width="30" height="${r1(hgt)}" style="opacity:${cls === 'solid' ? 0.35 : 0.85}"/>`;
        name.forEach((nm, j) => { s += F.text(x + 15, base + 14 + j * 15, nm, { size: 12 }); });
      });
      s += F.line(x0 - 8, base, x0 + 4 * 46, base, 'ink') + F.line(x0 - 8, base - bh, x0 + 4 * 46, base - bh, 'thin dash') +
        F.text(x0 - 12, base - bh, '开始时', { a: 'end', size: 11 });
      fig.innerHTML = F.svg(620, 270, s);
      let msg;
      if (t === 0) msg = `小球在 A 点静止：动能为 0，重力势能最大。点“放手”。`;
      else if (Math.abs(c.th) < 0.04) msg = '经过最低点 B：重力势能最小，<b>动能最大</b>（速度最大）。';
      else if (c.th * c.vel < 0) msg = '小球正在<b>下降</b>：高度减小、速度增大 → <b>重力势能转化为动能</b>。';
      else msg = '小球正在<b>上升</b>：速度减小、高度增大 → <b>动能转化为重力势能</b>。';
      msg += air.get() ? `<br>有空气阻力：机械能已经减少了 ${SIMS.fmt(c.Q / c.E0 * 100, 0)}%，这部分转化为<b>内能</b>，所以小球摆不回原来的高度（总能量仍然守恒）。`
        : '<br>不计空气阻力：只有动能和势能相互转化，<b>机械能守恒</b>，小球每次都能摆到与 A 等高的 C 点。';
      out.innerHTML = msg;
    }
    draw();
  };

  /* ================= 斜面的机械效率 ================= */
  SIMS.p2_5_incline = function (box) {
    const ui = SIMS.ui(box, '斜面：省力和机械效率');
    const fig = ui.fig();
    const Hh = ui.slider({ label: '斜面高度 h', min: 0.1, max: 0.8, step: 0.05, value: 0.3, unit: 'm' }, draw);
    const rough = ui.buttons(['斜面较光滑', '斜面较粗糙'], draw, 1);
    const out = ui.out();
    ui.note('斜面长 s = 1 m 不变，沿斜面把重 G = 10 N 的木块匀速拉到顶端。斜面越平缓，拉力越小（越省力）；但在粗糙程度相同时，斜面越陡，机械效率越高；坡度相同时，斜面越光滑，机械效率越高。');

    const G = 10, S = 1, LP = 320;
    function draw() {
      const h = Hh.get(), mu = rough.get() ? 0.3 : 0.1;
      const sn = h / S, cs = Math.sqrt(1 - sn * sn);
      const f = mu * G * cs, Fp = G * sn + f;
      const Wy = G * h, We = f * S, Wz = Fp * S, eta = Wy / Wz;
      // 斜面：左下角 A，右下角 B，顶点 C（右上）
      const A = [40, 230], B = [40 + LP * cs, 230], C = [40 + LP * cs, 230 - LP * sn];
      let s = F.ground(20, 400, 230) + F.polygon([A, B, C], 'soft');
      const u = [cs, -sn], nrm = [-sn, -cs];   // 沿斜面向上、垂直斜面向外
      const P = (d, off) => [A[0] + u[0] * d + nrm[0] * off, A[1] + u[1] * d + nrm[1] * off];
      const d0 = LP * 0.45;
      s += F.polygon([P(d0 - 22, 0), P(d0 + 22, 0), P(d0 + 22, 26), P(d0 - 22, 26)], 'hi');
      const pc = P(d0 + 22, 13);
      s += F.force(pc[0], pc[1], pc[0] + u[0] * 60, pc[1] + u[1] * 60, 'F', { lx: 4, ly: -12 });
      s += F.line(C[0] + 14, C[1], C[0] + 14, B[1], 'thin') + F.text(C[0] + 22, (C[1] + B[1]) / 2, 'h = ' + SIMS.fmt(h, 2) + ' m', { a: 'start', size: 13 });
      const mid = P(LP * 0.8, -16);
      s += F.text(mid[0], mid[1] + 6, 's = 1 m', { size: 13 });
      // 功的条形图
      const bx = 430, by = 60, bw = 150, sc = bw / 10;
      s += F.text(bx, by - 18, '总功 W总 = ' + SIMS.fmt(Wz, 2) + ' J', { a: 'start', size: 13 }) +
        `<rect class="hi-fill" x="${bx}" y="${by}" width="${r1(Wy * sc)}" height="22" style="opacity:.8"/>` +
        `<rect class="force-head" x="${r1(bx + Wy * sc)}" y="${by}" width="${r1(We * sc)}" height="22" style="opacity:.8"/>` +
        F.text(bx, by + 40, '■ 有用功 ' + SIMS.fmt(Wy, 2) + ' J', { a: 'start', size: 12 }) +
        F.text(bx, by + 60, '■ 额外功 ' + SIMS.fmt(We, 2) + ' J', { a: 'start', size: 12, cls: 'red' }) +
        F.text(bx, by + 100, 'η = ' + SIMS.fmt(eta * 100, 1) + '%', { a: 'start', size: 18 }) +
        F.text(bx, by + 130, 'F = ' + SIMS.fmt(Fp, 2) + ' N', { a: 'start', size: 16 });
      fig.innerHTML = F.svg(600, 260, s);
      out.innerHTML = `W<sub>有</sub> = Gh = 10 N × ${SIMS.fmt(h, 2)} m = <b>${SIMS.fmt(Wy, 2)} J</b>（不用斜面、直接把木块提上去要做的功）<br>` +
        `W<sub>额</sub> = fs = ${SIMS.fmt(f, 2)} N × 1 m = <b>${SIMS.fmt(We, 2)} J</b>（克服摩擦力做的功）<br>` +
        `W<sub>总</sub> = Fs = ${SIMS.fmt(Fp, 2)} N × 1 m = <b>${SIMS.fmt(Wz, 2)} J</b>　η = W<sub>有</sub> / W<sub>总</sub> = <b>${SIMS.fmt(eta * 100, 1)}%</b>`;
    }
    draw();
  };
})();
