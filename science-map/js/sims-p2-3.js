// 第二阶段 组 3 互动演示（写法见 js/sims.js 顶部说明，清单见 docs/phase2-spec.md）
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  /* ---------- 弹簧的伸长量与拉力：逐个挂钩码，画 ΔL-F 图像 ---------- */
  SIMS.p2_3_spring = function (box) {
    const ui = SIMS.ui(box, '弹簧的伸长量与拉力');
    const fig = ui.fig();
    const N = ui.slider({ label: '钩码个数', min: 0, max: 8, step: 1, value: 2, fmt: n => n + ' 个（' + SIMS.fmt(n * 0.5, 1) + ' N）' }, draw);
    const out = ui.out();
    ui.note('每个钩码重 0.5 N，弹簧原长 10 cm，弹性限度为 3 N（演示用的设定）。3 N 以内，每增加 0.5 N 就伸长 1 cm，伸长量与拉力成正比，图像是过原点的直线；超过 3 N，伸长量不再与拉力成正比，弹簧会被拉坏，撤去钩码后也回不到原长——所以测力计不能超过量程使用。');

    const L0 = 10, K = 2, LIM = 3, PX = 8, Y0 = 30, X = 150;   // 原长 cm、cm/N、弹性限度 N、px/cm、弹簧顶端、弹簧位置
    const ext = f => f <= LIM ? K * f : K * LIM + 5 * (f - LIM);   // 超过弹性限度后伸长得更快（示意）

    function draw() {
      const n = N.get(), f = n * 0.5, dl = ext(f), yEnd = Y0 + (L0 + dl) * PX;
      // 铁架、刻度尺（0~25 cm）
      let s = F.wall(90, Y0, 200, Y0, 'up') + F.rect(52, Y0, 22, 25 * PX, 'soft', 2);
      for (let c = 0; c <= 25; c++) {
        const y = Y0 + c * PX;
        s += F.line(74, y, 74 - (c % 5 ? 5 : 10), y, 'thin');
        if (c % 5 === 0) s += F.text(48, y, c, { a: 'end', size: 11 });
      }
      s += F.text(48, Y0 - 12, 'cm', { a: 'end', size: 11 });
      // 弹簧、指针、钩码
      s += F.spring(X, Y0, yEnd, 14) + F.line(74, yEnd, X - 8, yEnd, 'thin dash') + F.dot(X, yEnd, 2.5);
      for (let i = 0; i < n; i++) s += F.rect(X - 9, yEnd + 3 + i * 12, 18, 11, 'soft', 2);
      s += F.text(X + 22, Y0 + L0 * PX / 2, '原长 10 cm', { a: 'start', size: 12 }) +
        F.line(X + 14, Y0 + L0 * PX, X + 20, Y0 + L0 * PX, 'thin');
      // 右侧：ΔL-F 图像
      const ax = { x: 290, y: 40, w: 250, h: 200, xmax: 4, ymax: 12, xticks: [1, 2, 3, 4], yticks: [2, 4, 6, 8, 10, 12], xlabel: 'F/N', ylabel: 'ΔL/cm' };
      s += SIMS.axes(ax) + F.line(ax.px(0), ax.py(0), ax.px(4), ax.py(8), 'thin dash') +
        F.line(ax.px(LIM), ax.py(0), ax.px(LIM), ax.py(12), 'thin dash') + F.text(ax.px(LIM) + 4, ax.py(11.5), '弹性限度', { a: 'start', size: 12 });
      const pts = [];
      for (let i = 0; i <= n; i++) pts.push([ax.px(i * 0.5), ax.py(Math.min(12, ext(i * 0.5)))]);
      if (pts.length > 1) s += F.poly(pts, 'hi');
      pts.forEach(p => { s += `<circle class="hi-fill" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4"/>`; });
      fig.innerHTML = F.svg(590, 320, s);

      let msg = `拉力 F = <b>${SIMS.fmt(f, 1)} N</b>，弹簧长度 L = <b>${SIMS.fmt(L0 + dl, 1)} cm</b>，伸长量 ΔL = L − L₀ = <b>${SIMS.fmt(dl, 1)} cm</b>`;
      if (f === 0) msg += '<br>没挂钩码，弹簧保持原长，伸长量为 0。';
      else if (f <= LIM) msg += `<br>ΔL / F = ${SIMS.fmt(dl / f, 1)} cm/N，比值不变 → 在弹性限度内，伸长量与拉力成正比。注意：长度 ${SIMS.fmt(L0 + dl, 1)} cm 与拉力并不成正比。`;
      else msg += '<br><b>超过弹性限度了！</b>点已经偏离虚线，伸长量不再与拉力成正比，弹簧会被拉坏。';
      out.innerHTML = msg;
    }
    draw();
  };

  /* ---------- 阻力对物体运动的影响：小车从斜面滑下，在不同表面上滑行 ---------- */
  SIMS.p2_3_newton1 = function (box) {
    const ui = SIMS.ui(box, '阻力对物体运动的影响');
    const SURF = [
      { name: '毛巾', mu: 0.5 },
      { name: '棉布', mu: 0.25 },
      { name: '木板', mu: 0.1 },
      { name: '假如没有阻力', mu: 0 }
    ];
    const pick = ui.buttons(SURF.map(s => s.name), () => { reset(); }, 0);
    const fig = ui.fig();
    const Hs = ui.slider({ label: '释放高度 h', min: 10, max: 30, step: 5, value: 20, unit: 'cm' }, () => { records = {}; reset(); });
    const btn = ui.action('▶ 放手', start);
    ui.action('↺ 重置', () => { records = {}; reset(); });
    const out = ui.out();
    ui.note('小车从斜面上同一高度由静止滑下，到达水平面时速度都相同（不计斜面上的阻力，g 取 10 N/kg；斜面没有按比例画）。依次选毛巾、棉布、木板各放一次，比一比小车停在哪里。表面越光滑，阻力越小，小车速度减小得越慢、滑得越远；推理：如果没有阻力，小车将一直做匀速直线运动。改变高度会清空记录——高度不同，到达水平面的速度不同，就没法比较了。');

    const G = 10, SIN = 0.5, COS = Math.sqrt(3) / 2, KS = 220, KF = 120;   // 斜面 30°；斜面 220 px/m（示意），水平面 120 px/m
    const BX = 200, BY = 200, XEND = 590, SLOW = 0.6;                    // 斜面底端、水平面右端、动画慢放
    let phase = 'ready', t0 = 0, tt = 0, gen = 0, records = {};

    function params() {
      const h = Hs.get() / 100, L = h / SIN, a1 = G * SIN, t1 = Math.sqrt(2 * L / a1), v0 = Math.sqrt(2 * G * h);
      const mu = SURF[pick.get()].mu, a2 = mu * G;
      return { h, L, a1, t1, v0, mu, a2, sStop: mu > 0 ? v0 * v0 / (2 * a2) : Infinity, tStop: mu > 0 ? v0 / a2 : Infinity };
    }
    // 由经过的时间求小车位置：在斜面上（d 为离底端的距离）或水平面上（x 为离斜面底端的距离）
    function state(t) {
      const p = params();
      if (t < p.t1) { const s = 0.5 * p.a1 * t * t; return { on: 'slope', d: p.L - s, v: p.a1 * t }; }
      const tau = t - p.t1;
      if (p.mu > 0 && tau >= p.tStop) return { on: 'flat', x: p.sStop, v: 0, done: true };
      return { on: 'flat', x: p.v0 * tau - 0.5 * p.a2 * tau * tau, v: p.v0 - p.a2 * tau };
    }

    function start() {
      if (phase === 'run') return;
      if (phase === 'done') reset();
      phase = 'run'; btn.textContent = '…滑行中';
      const my = ++gen;
      t0 = 0;
      const step = ts => {
        if (my !== gen || phase !== 'run') return;
        if (!box.isConnected) { phase = 'ready'; return; }
        if (!t0) t0 = ts;
        tt = (ts - t0) / 1000 * SLOW;
        const st = state(tt);
        if (st.done || (st.on === 'flat' && BX + st.x * KF > XEND + 40)) {
          phase = 'done'; btn.textContent = '▶ 再放一次';
          const p = params();
          records[pick.get()] = p.mu > 0 ? p.sStop : Infinity;
        }
        draw();
        if (phase === 'run') requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function reset() { gen++; phase = 'ready'; tt = 0; btn.textContent = '▶ 放手'; draw(); }

    function carAt(x, y, deg) {
      return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${deg})">` + F.rect(-15, -15, 30, 11, 'hi', 2) +
        F.circle(-9, -3, 3, 'solid') + F.circle(9, -3, 3, 'solid') + '</g>';
    }
    function texture(k, y) {
      let s = '';
      if (k === 0) for (let x = BX + 6; x < XEND; x += 5) s += F.line(x, y, x - 2, y - 4, 'thin');
      if (k === 1) for (let x = BX + 6; x < XEND; x += 9) s += F.dot(x, y - 2.5, 1.1);
      if (k === 2) for (let x = BX + 20; x < XEND; x += 60) s += F.line(x, y + 4, x + 30, y + 4, 'thin');
      return s;
    }

    function draw() {
      const k = pick.get(), p = params();
      const top = [BX - KS * p.L * COS, BY - KS * p.L * SIN];
      const LMAX = 0.6, peak = [BX - KS * LMAX * COS, BY - KS * LMAX * SIN];
      // 斜面、水平面
      let s = F.polygon([[peak[0], BY], [BX, BY], peak], 'soft') + F.line(BX, BY, XEND, BY, 'ink') + texture(k, BY) +
        F.line(20, BY, peak[0], BY, 'ink') + F.text(BX + 6, BY + 18, SURF[k].name + (k === 3 ? '（理想情况）' : '表面'), { a: 'start', size: 13 });
      // 释放高度标注
      s += F.line(top[0], top[1], 30, top[1], 'thin dash') + F.arrow(30, (top[1] + BY) / 2, 30, top[1], { cls: 'thin', size: 6 }) +
        F.arrow(30, (top[1] + BY) / 2, 30, BY, { cls: 'thin', size: 6 }) + F.text(36, (top[1] + BY) / 2, 'h', { cls: 'it', a: 'start' });
      // 水平面上的距离刻度（m）
      for (let m = 0; m <= 3; m += 0.5) {
        const x = BX + m * KF;
        s += F.line(x, BY + 26, x, BY + 32, 'thin') + (m % 1 === 0 ? F.text(x, BY + 44, m + (m === 3 ? ' m' : ''), { size: 11 }) : '');
      }
      s += F.line(BX, BY + 29, BX + 3 * KF, BY + 29, 'thin');
      // 之前几次停下的位置
      Object.keys(records).forEach(i => {
        const d = records[i];
        if (!isFinite(d)) return;
        const x = BX + d * KF;
        s += F.line(x, BY - 34, x, BY, 'thin dash') + F.text(x, BY - 42, SURF[i].name, { size: 11 });
      });
      // 小车
      const st = phase === 'ready' ? { on: 'slope', d: p.L, v: 0 } : state(tt);
      if (st.on === 'slope') {
        s += carAt(BX - KS * st.d * COS, BY - KS * st.d * SIN, 30);
      } else {
        const x = BX + st.x * KF;
        if (x < XEND + 20) s += carAt(x, BY, 0);
        else s += F.text(XEND - 4, BY - 22, '→ 一直运动下去', { a: 'end', size: 13 });
      }
      fig.innerHTML = F.svg(600, 170, '<g transform="translate(0,-85)">' + s + '</g>');

      let msg = `释放高度 h = ${Hs.get()} cm，到达水平面时的速度约为 <b>${SIMS.fmt(p.v0, 2)} m/s</b>（三种表面都一样）`;
      if (phase === 'run') msg += `<br>当前速度 v = <b>${SIMS.fmt(Math.max(0, st.v), 2)} m/s</b>`;
      if (phase === 'done') msg += k === 3 ? '<br>没有阻力，小车的速度不再减小，将以 ' + SIMS.fmt(p.v0, 2) + ' m/s 永远做匀速直线运动。' :
        `<br>在${SURF[k].name}表面上滑行了 <b>${SIMS.fmt(p.sStop, 2)} m</b> 后停下。`;
      const done = Object.keys(records).filter(i => isFinite(records[i])).map(Number).sort((a, b) => a - b);
      if (done.length) msg += '<br>记录：' + done.map(i => `${SURF[i].name} ${SIMS.fmt(records[i], 2)} m`).join('，') + (done.length >= 2 ? '　→ 阻力越小，滑得越远' : '');
      out.innerHTML = msg;
    }
    draw();
  };

  /* ---------- 探究滑动摩擦力：拉木块，看静摩擦、滑动摩擦和 f-t 图像 ---------- */
  SIMS.p2_3_friction = function (box) {
    const ui = SIMS.ui(box, '探究滑动摩擦力的大小');
    const SURF = [{ name: '木板', mu: 0.2 }, { name: '棉布', mu: 0.3 }, { name: '毛巾', mu: 0.5 }];
    const LOAD = [{ name: '木块', n: 2, k: 0 }, { name: '木块 + 1 个砝码', n: 3, k: 1 }, { name: '木块 + 2 个砝码', n: 4, k: 2 }];
    const surf = ui.buttons(SURF.map(s => s.name), draw, 0);
    const load = ui.buttons(LOAD.map(l => l.name), draw, 0);
    const lay = ui.buttons(['平放', '侧放'], draw, 0);
    const fig = ui.fig();
    const Fs = ui.slider({ label: '拉力 F（测力计示数）', min: 0, max: 3, step: 0.1, value: 0, unit: 'N' }, draw);
    ui.action('设为匀速拉动', () => {
      const c = cur();
      Fs.set(c.fk);
      if (vel === 0) vel = 0.15;   // 先让木块动起来，再保持拉力等于滑动摩擦力
      draw();
    });
    ui.action('↺ 重置', () => { vel = 0; Fs.set(0); hist = []; T = 0; draw(); });
    const out = ui.out();
    ui.note('慢慢增大拉力：木块没动时，静摩擦力随拉力一起变大；拉力超过最大静摩擦力（比滑动摩擦力略大）木块才开始滑动，之后摩擦力变成滑动摩擦力，大小不变。只有<b>匀速直线运动</b>时，测力计示数才等于滑动摩擦力。换接触面、加砝码看滑动摩擦力怎么变；平放、侧放比一比接触面积有没有影响。（木块重 2 N，每个砝码重 1 N，g 取 10 N/kg）');

    let vel = 0, off = 0, T = 0, hist = [], last = 0, fNow = 0;
    function cur() {
      const s = SURF[surf.get()], l = LOAD[load.get()];
      const fk = Math.round(s.mu * l.n * 100) / 100;
      return { s, l, fk, fmax: Math.round(fk * 1.25 * 100) / 100, m: l.n / 10 };
    }
    function step(dt) {
      const c = cur(), F0 = Fs.get();
      if (vel === 0) {
        if (F0 > c.fmax + 1e-9) { vel = 1e-4; fNow = c.fk; } else fNow = F0;
      }
      if (vel > 0) {
        fNow = c.fk;
        const a = Math.abs(F0 - c.fk) < 1e-9 ? 0 : (F0 - c.fk) / c.m;
        vel += a * dt;
        if (vel <= 0) { vel = 0; fNow = Math.min(F0, c.fmax); }
        if (vel > 2) vel = 2;
      }
      off = (off + vel * dt * 120) % 60;
      T += dt;
      hist.push([T, fNow, F0]);
      while (hist.length && hist[0][0] < T - 8) hist.shift();
    }
    function loop(ts) {
      if (!box.isConnected) return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      if (dt) step(dt);
      draw();
      requestAnimationFrame(loop);
    }

    function draw() {
      const c = cur(), F0 = Fs.get(), side = lay.get() === 1;
      if (vel === 0 && F0 <= c.fmax + 1e-9) fNow = F0;   // 静止时静摩擦力随拉力立即变化
      const Y = 120;
      // 接触面（随木块相对运动而滚动）
      let s = F.rect(20, Y, 560, 10, 'soft', 1);
      const k = surf.get();
      for (let x = 20 - off; x < 580; x += 60) {
        for (let j = 0; j < 60; j += (k === 0 ? 60 : k === 1 ? 10 : 5)) {
          const xx = x + j;
          if (xx < 22 || xx > 578) continue;
          s += k === 0 ? F.line(xx, Y + 5, xx + 26, Y + 5, 'thin') : k === 1 ? F.dot(xx, Y - 2, 1.1) : F.line(xx, Y, xx - 2, Y - 4, 'thin');
        }
      }
      // 木块（平放 80×36，侧放 40×64）和砝码
      const bw = side ? 40 : 80, bh = side ? 64 : 36, bx = 260 - bw, by = Y - bh;
      s += F.block(bx, by, bw, bh, '木块');
      for (let i = 0; i < c.l.k; i++) s += F.rect(bx + bw / 2 - 12, by - 14 - i * 14, 24, 13, 'soft', 2);
      // 测力计和拉力
      const my = by + bh / 2;
      s += F.line(260, my, 300, my, 'thin') + F.rect(300, my - 9, 110, 18, 'soft', 4);
      for (let i = 0; i <= 10; i++) { const xx = 310 + i * 9; s += F.line(xx, my - 9, xx, my - (i % 5 ? 5 : 1), 'thin'); }
      const px = 310 + Math.min(F0, 3) / 3 * 90;
      s += F.line(px, my - 9, px, my + 9, 'force') + F.line(410, my, 425, my, 'thin') +
        F.text(355, my - 22, '测力计示数 ' + SIMS.fmt(F0, 1) + ' N', { size: 12 });
      if (F0 > 0) s += F.arrow(425, my, 425 + 20 + F0 * 40, my, { cls: 'hi', size: 8, label: 'F', lx: 2, ly: -12 });
      if (fNow > 0.001) s += F.force(bx + bw / 2, Y - 4, bx + bw / 2 - 16 - fNow * 40, Y - 4, 'f', { ly: -12 });
      // f-t 和 F-t 图像（最近 8 s）
      const ax = { x: 70, y: 175, w: 420, h: 110, xmax: 8, ymax: 3, xticks: [], yticks: [0.5, 1, 1.5, 2, 2.5, 3], xlabel: 't', ylabel: 'f/N' };
      s += SIMS.axes(ax);
      const t0 = Math.max(0, T - 8);
      const pf = hist.map(h => [ax.px(h[0] - t0), ax.py(h[1])]), pF = hist.map(h => [ax.px(h[0] - t0), ax.py(Math.min(3, h[2]))]);
      if (pF.length > 1) s += F.poly(pF, 'ray dash') + F.poly(pf, 'hi');
      s += F.line(ax.px(0), ax.py(c.fk), ax.px(8), ax.py(c.fk), 'thin dash') + F.text(ax.px(8) + 6, ax.py(c.fk), 'f滑 = ' + SIMS.fmt(c.fk, 2) + ' N', { a: 'start', size: 11 }) +
        F.line(420, 160, 440, 160, 'hi') + F.text(444, 160, '摩擦力 f', { a: 'start', size: 12 }) +
        F.line(510, 160, 530, 160, 'ray dash') + F.text(534, 160, '拉力 F', { a: 'start', size: 12 });
      fig.innerHTML = F.svg(600, 305, s);

      let st;
      if (vel === 0) st = F0 > 0 ? `木块<b>静止</b>：静摩擦力 f = F = <b>${SIMS.fmt(fNow, 2)} N</b>（二力平衡）。要拉动它，拉力要超过最大静摩擦力 ${SIMS.fmt(c.fmax, 2)} N。` : '木块静止，没有拉力，也没有摩擦力。';
      else if (Math.abs(F0 - c.fk) < 1e-9) st = `木块做<b>匀速直线运动</b>：F = f滑 = <b>${SIMS.fmt(c.fk, 2)} N</b>，这时测力计示数等于滑动摩擦力。`;
      else if (F0 > c.fk) st = `木块<b>加速</b>运动（速度 ${SIMS.fmt(vel, 2)} m/s${vel >= 2 ? '，演示中到 2 m/s 就不再加速' : ''}）：F &gt; f滑，测力计示数 ${SIMS.fmt(F0, 1)} N <b>不等于</b>滑动摩擦力 ${SIMS.fmt(c.fk, 2)} N。`;
      else st = `木块<b>减速</b>运动：F &lt; f滑，滑动摩擦力仍为 ${SIMS.fmt(c.fk, 2)} N。`;
      out.innerHTML = `接触面：${c.s.name}　压力 F压 = ${c.l.n} N　滑动摩擦力 f滑 = <b>${SIMS.fmt(c.fk, 2)} N</b>（${side ? '侧放' : '平放'}，与接触面积无关）<br>` + st;
    }
    draw();
    requestAnimationFrame(loop);
  };
})();
