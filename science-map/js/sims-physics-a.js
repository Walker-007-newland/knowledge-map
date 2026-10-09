// 物理互动演示（八年级上部分，写法见 js/sims.js 顶部说明）
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  /* ---------- 速度：甲、乙两车同时从起点出发做匀速直线运动，实时画 s-t 图像 ---------- */
  SIMS.speed = function (box) {
    const ui = SIMS.ui(box, '比快慢：两车的 s-t 图像');
    const fig = ui.fig();
    const vA = ui.slider({ label: '甲车速度', min: 1, max: 10, step: 1, value: 8, unit: 'm/s' }, reset);
    const vB = ui.slider({ label: '乙车速度', min: 1, max: 10, step: 1, value: 4, unit: 'm/s' }, reset);
    const btnPlay = ui.action('▶ 播放', toggle);
    ui.action('↺ 重置', reset);
    const out = ui.out();
    ui.note('先调好两车速度再点“播放”。看两点：①同一时刻谁跑得远；②谁的 s-t 图线更陡。速度越大，图线越陡（倾斜程度表示速度）。调速度会自动重置。');

    const L = 100;      // 跑道长 100 m
    const TMAX = 20;    // 图像横轴 0~20 s
    const RATE = 2;     // 动画里 1 s 相当于 2 s
    const X0 = 60, X1 = 540, px = s => X0 + s / L * (X1 - X0);
    let t = 0, running = false, gen = 0;

    function tEnd() { return Math.min(TMAX, L / Math.max(vA.get(), vB.get())); }

    function toggle() {
      if (running) { running = false; gen++; btnPlay.textContent = '▶ 继续'; return; }
      if (t >= tEnd() - 1e-9) t = 0;
      running = true;
      btnPlay.textContent = '⏸ 暂停';
      const my = ++gen;
      let last = 0;
      const step = ts => {
        if (my !== gen || !running) return;
        if (!box.isConnected) { running = false; return; }   // 面板关掉或切换了标签页
        if (last) t += Math.min(0.1, (ts - last) / 1000) * RATE;
        last = ts;
        if (t >= tEnd()) { t = tEnd(); running = false; btnPlay.textContent = '▶ 重新播放'; }
        draw();
        if (running) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    function reset() {
      running = false; gen++; t = 0;
      btnPlay.textContent = '▶ 播放';
      draw();
    }

    function car(s, y, cls, name) {
      const x = px(s);
      return F.rect(x - 36, y - 12, 36, 20, cls, 4) + F.circle(x - 28, y + 10, 4, 'solid') + F.circle(x - 8, y + 10, 4, 'solid') +
        F.text(x - 18, y - 2, name, { size: 13 });
    }

    function draw() {
      const a = vA.get(), b = vB.get();
      const sa = Math.min(L, a * t), sb = Math.min(L, b * t);
      // 跑道
      let s = F.line(X0, 30, X0, 118, 'ink') + F.line(X1, 30, X1, 118, 'ink') +
        F.line(X0 - 40, 62, X1 + 20, 62, 'thin') + F.line(X0 - 40, 108, X1 + 20, 108, 'thin');
      for (let m = 0; m <= L; m += 20) {
        s += F.line(px(m), 118, px(m), 124, 'thin') + F.text(px(m), 136, m + (m === L ? ' m' : ''), { size: 11 });
      }
      s += car(sa, 48, 'hi', '甲') + car(sb, 94, 'ray', '乙');
      // s-t 图像
      const ax = { x: 70, y: 180, w: 360, h: 110, xmax: TMAX, ymax: L, xticks: [5, 10, 15, 20], yticks: [20, 40, 60, 80, 100], xlabel: 't/s', ylabel: 's/m' };
      s += SIMS.axes(ax);
      if (t > 0) {
        s += F.line(ax.px(0), ax.py(0), ax.px(t), ax.py(sa), 'hi') + F.line(ax.px(0), ax.py(0), ax.px(t), ax.py(sb), 'ray');
        s += `<circle class="hi-fill" cx="${ax.px(t).toFixed(1)}" cy="${ax.py(sa).toFixed(1)}" r="4.5"/>` +
          `<circle class="ray-head" cx="${ax.px(t).toFixed(1)}" cy="${ax.py(sb).toFixed(1)}" r="4.5"/>`;
      }
      // 图例
      s += F.line(470, 205, 492, 205, 'hi') + F.text(498, 205, '甲 ' + a + ' m/s', { a: 'start', size: 13 }) +
        F.line(470, 232, 492, 232, 'ray') + F.text(498, 232, '乙 ' + b + ' m/s', { a: 'start', size: 13 });
      fig.innerHTML = F.svg(600, 325, s);

      let msg = `t = <b>${SIMS.fmt(t, 1)} s</b>　甲：s = <b>${SIMS.fmt(sa, 1)} m</b>　乙：s = <b>${SIMS.fmt(sb, 1)} m</b>`;
      if (t > 0) {
        if (a === b) msg += '<br>两车速度相同：相同时间内通过的路程相等，两条图线重合。';
        else {
          const fast = a > b ? '甲' : '乙';
          msg += `<br>相同时间内${fast}车通过的路程更长 → ${fast}车运动得更快，它的 s-t 图线也更陡。`;
        }
      }
      out.innerHTML = msg;
    }
    draw();
  };

  /* ---------- 平面镜成像：拖物距和物高，画像（虚线）和两条反射光线 ---------- */
  SIMS.mirror = function (box) {
    const ui = SIMS.ui(box, '平面镜成像：像与物关于镜面对称');
    const fig = ui.fig();
    const U = ui.slider({ label: '物距 u', min: 5, max: 25, step: 1, value: 15, unit: 'cm' }, draw);
    const Hs = ui.slider({ label: '物体高度', min: 4, max: 12, step: 1, value: 8, unit: 'cm' }, draw);
    const out = ui.out();
    ui.note('从 A 点射到镜面的两条光线被反射回来（橙色）。人眼逆着反射光线看去，光好像是从镜子后面的 A′ 点发出的——A′ 处并没有光真正到达，所以像是<b>虚像</b>，作图时像和反向延长线都画成虚线。');

    const K = 10, MX = 300, GY = 230, TOP = 46;   // 1 cm 画 10 px；镜面在 x=300；桌面 y=230

    function draw() {
      const u = U.get(), h = Hs.get();
      const xo = MX - u * K, xi = MX + u * K, yA = GY - h * K;
      let s = F.line(30, GY, 570, GY, 'thin') + F.mirror(MX, TOP, MX, GY, -1) + F.text(MX, 30, '平面镜', { size: 13 });
      // 两条入射光线 → 反射光线，反射光线的反向延长线交于像点 A′
      const y1 = yA - 0.5 * (yA - TOP), y2 = yA + 0.45 * (GY - yA);
      [y1, y2].forEach(yo => {
        const dx = MX - xo, dy = yo - yA, len = Math.hypot(dx, dy);
        let k = Math.min(130 / len, (MX - 30) / dx);
        if (dy < 0) k = Math.min(k, (yo - 22) / -dy);
        else if (dy > 0) k = Math.min(k, (GY - 4 - yo) / dy);
        s += F.normal(MX, yo, 0, 44) + F.line(MX, yo, xi, yA, 'thin dash') +
          F.ray([[xo, yA], [MX, yo], [MX - k * dx, yo + k * dy]]);
      });
      // 物体（实线）和像（虚线）
      s += F.obj(xo, GY, h * K) + F.obj(xi, GY, h * K, { dash: true }) +
        F.text(xo - 14, yA, 'A', { cls: 'it' }) + F.text(xi + 16, yA, 'A′', { cls: 'it' });
      // 物距、像距标注
      s += F.line(xo, GY, xo, 258, 'thin') + F.line(MX, GY, MX, 258, 'thin') + F.line(xi, GY, xi, 258, 'thin') +
        F.arrow((xo + MX) / 2, 252, xo, 252, { cls: 'thin', size: 6 }) + F.arrow((xo + MX) / 2, 252, MX, 252, { cls: 'thin', size: 6 }) +
        F.arrow((xi + MX) / 2, 252, MX, 252, { cls: 'thin', size: 6 }) + F.arrow((xi + MX) / 2, 252, xi, 252, { cls: 'thin', size: 6 }) +
        F.text(MX - 8, 270, '物距 ' + u + ' cm', { a: 'end', size: 13 }) + F.text(MX + 8, 270, '像距 ' + u + ' cm', { a: 'start', size: 13 });
      fig.innerHTML = F.svg(600, 295, s);
      out.innerHTML = `物距 u = <b>${u} cm</b>，像距 v = <b>${u} cm</b>　→ 像距等于物距<br>物高 = 像高 = <b>${h} cm</b>　→ 像与物大小相等（离镜子远近不影响像的大小）`;
    }
    draw();
  };

  /* ---------- 密度：选材料、拖体积，看质量和 m-V 图像 ---------- */
  SIMS.density = function (box) {
    const ui = SIMS.ui(box, '密度：同种物质的 m-V 图像');
    const MATS = [
      { name: '木头', rho: 0.5, note: '（松木，约值）' },
      { name: '水', rho: 1.0, note: '' },
      { name: '铝', rho: 2.7, note: '' },
      { name: '铁', rho: 7.9, note: '' }
    ];
    const pick = ui.buttons(MATS.map(m => m.name), draw, 2);
    const fig = ui.fig();
    const V = ui.slider({ label: '体积 V', min: 1, max: 10, step: 0.5, value: 6, unit: 'cm³' }, draw);
    const out = ui.out();
    ui.note('同种物质的 m-V 图像是一条过原点的直线：体积变成 2 倍，质量也变成 2 倍，m 与 V 的比值（密度）不变。不同物质的直线倾斜程度不同——<b>越陡，密度越大</b>。');

    function draw() {
      const cur = MATS[pick.get()], v = V.get(), m = cur.rho * v;
      const ax = { x: 70, y: 50, w: 300, h: 240, xmax: 10, ymax: 80, xticks: [2, 4, 6, 8, 10], yticks: [20, 40, 60, 80], ylabel: 'm/g' };
      let s = SIMS.axes(ax) + F.text(ax.x + ax.w + 20, ax.y + ax.h + 14, 'V/cm³', { cls: 'it', size: 14, a: 'start' });
      MATS.forEach(mt => {
        const on = mt === cur;
        s += F.line(ax.px(0), ax.py(0), ax.px(10), ax.py(mt.rho * 10), on ? 'hi' : 'thin') +
          F.text(ax.px(10) + 8, ax.py(mt.rho * 10), mt.name, { a: 'start', size: 12 });
      });
      s += F.line(ax.px(v), ax.py(0), ax.px(v), ax.py(m), 'thin dash') + F.line(ax.px(0), ax.py(m), ax.px(v), ax.py(m), 'thin dash') +
        `<circle class="hi-fill" cx="${ax.px(v).toFixed(1)}" cy="${ax.py(m).toFixed(1)}" r="5"/>`;
      // 右侧：这块物体（边长按体积的立方根缩放）
      const side = 30 * Math.cbrt(v);
      s += F.block(510 - side / 2, 200 - side, side, side, cur.name) +
        F.text(510, 226, 'V = ' + SIMS.fmt(v, 1) + ' cm³', { size: 13 }) +
        F.text(510, 248, 'm = ' + SIMS.fmt(m, 2) + ' g', { size: 13 });
      fig.innerHTML = F.svg(600, 325, s);
      out.innerHTML = `ρ<sub>${cur.name}</sub> = ${cur.rho.toFixed(1)} g/cm³ = ${cur.rho.toFixed(1)}×10³ kg/m³${cur.note}<br>` +
        `m = ρV = ${cur.rho.toFixed(1)} g/cm³ × ${SIMS.fmt(v, 1)} cm³ = <b>${SIMS.fmt(m, 2)} g</b>`;
    }
    draw();
  };
})();
