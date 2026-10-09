// 第二阶段 组 6 互动演示（写法见 js/sims.js 顶部说明，清单见 docs/phase2-spec.md）
//   SIMS.p2_6_diffusion  扩散与温度（分子热运动）
//   SIMS.p2_6_heating    比较水和其他物质的吸热能力（比热容）
//   SIMS.p2_6_engine     四冲程汽油机
// 另外导出 SIMS._p2_6_engine(theta, o)：汽油机示意图，physics/p2-6.js 里的静态图也用它，保证图和演示一致。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const r1 = x => (Math.round(x * 10) / 10).toFixed(1);

  /* ================= 四冲程汽油机示意图 ================= */
  // theta：曲轴转角（度）。0~180 吸气，180~360 压缩，360~540 做功，540~720 排气；0 时活塞在最上端。
  // 画在 200×240 的区域内（原点在左上角）。
  // o.gas 给汽缸里的气体上色；o.arrow 画活塞运动方向；o.flow 画进气/排气的气流方向；o.spark 强制画（true）或不画（false）火花
  function engineSvg(theta, o) {
    o = o || {};
    const th = ((theta % 720) + 720) % 720, k = Math.min(3, Math.floor(th / 180)), f = (th - k * 180) / 180;
    const a = th * Math.PI / 180, cx = 100, cy = 200, R = 18, L = 70;
    const kx = cx + R * Math.sin(a), ky = cy - R * Math.cos(a);              // 曲柄销
    const pinY = ky - Math.sqrt(L * L - (kx - cx) * (kx - cx));             // 活塞销
    const yp = pinY - 14, X1 = 65, X2 = 135, TOP = 70;                      // 活塞顶面、汽缸内壁、汽缸顶
    const lift = n => (k === n ? 11 * Math.sin(f * Math.PI) : 0);           // 气门打开的程度
    let s = '';
    if (o.gas) {
      const col = k === 2 ? 'var(--fig-ray)' : k === 3 ? 'var(--fig-ink)' : 'var(--fig-hi)';
      const op = k === 0 ? 0.12 : k === 1 ? 0.12 + 0.22 * f : k === 2 ? 0.55 - 0.3 * f : 0.1;
      s += `<rect x="${X1}" y="${TOP}" width="${X2 - X1}" height="${r1(yp - TOP)}" style="fill:${col};opacity:${op.toFixed(2)}"/>`;
    }
    // 连杆、曲轴、飞轮（先画，活塞盖在连杆上端）
    s += F.circle(cx, cy, 27, 'thin') +
      `<line class="ink" style="stroke-width:5" x1="${cx}" y1="${cy}" x2="${r1(kx)}" y2="${r1(ky)}"/>` +
      `<line class="ink" style="stroke-width:4" x1="${cx}" y1="${r1(pinY)}" x2="${r1(kx)}" y2="${r1(ky)}"/>` +
      F.dot(kx, ky, 3) + F.dot(cx, cy, 3.5);
    // 汽缸壁、汽缸盖、进气道和排气道
    s += F.line(X1, TOP, X1, 178) + F.line(X2, TOP, X2, 178) + F.rect(X1 - 12, 50, X2 - X1 + 24, 20, 'soft');
    [82, 118].forEach(vc => { s += F.rect(vc - 8, 49, 16, 22, 'mask') + F.line(vc - 8, 36, vc - 8, 70) + F.line(vc + 8, 36, vc + 8, 70); });
    // 气门（左：进气门，右：排气门）。关闭时阀盘堵住气道口，打开时阀盘下移
    [[82, lift(0)], [118, lift(3)]].forEach(([vc, l]) => {
      const yv = TOP + l;
      s += F.line(vc, 30, vc, yv - 2) + `<line class="ink" style="stroke-width:4" x1="${vc - 8}" y1="${r1(yv)}" x2="${vc + 8}" y2="${r1(yv)}"/>`;
    });
    // 火花塞
    s += F.rect(95, 34, 10, 16, 'soft', 2) + F.line(100, 50, 100, 75);
    const spark = o.spark != null ? o.spark : (k === 2 && f <= 0.5);
    if (spark) for (let i = 0; i < 8; i++) {
      const an = i * Math.PI / 4;
      s += `<line class="ray" x1="${r1(100 + 4 * Math.cos(an))}" y1="${r1(81 + 4 * Math.sin(an))}" x2="${r1(100 + 10 * Math.cos(an))}" y2="${r1(81 + 10 * Math.sin(an))}"/>`;
    }
    // 活塞
    s += F.rect(X1 + 2, yp, X2 - X1 - 4, 22, 'soft', 2) + F.line(X1 + 2, yp + 6, X2 - 2, yp + 6, 'thin') + F.dot(cx, pinY, 3);
    if (o.arrow) {
      const d = k % 2 ? -1 : 1, my = yp + 11;
      s += F.arrow(X2 + 20, my - d * 16, X2 + 20, my + d * 16, { cls: 'hi', size: 8 });
    }
    if (o.flow && k === 0) s += F.arrow(50, 20, 74, 42, { cls: 'ray', size: 7 });
    if (o.flow && k === 3) s += F.arrow(126, 42, 150, 20, { cls: 'ray', size: 7 });
    return s;
  }
  SIMS._p2_6_engine = engineSvg;

  const STROKES = [
    { n: '吸气冲程', iv: '打开', ev: '关闭', dir: '向下', e: '吸入汽油和空气的混合物（没有能量转化）' },
    { n: '压缩冲程', iv: '关闭', ev: '关闭', dir: '向上', e: '机械能 → 内能（混合物温度升高、压强增大）' },
    { n: '做功冲程', iv: '关闭', ev: '关闭', dir: '向下', e: '火花塞点火，内能 → 机械能（唯一对外做功的冲程）' },
    { n: '排气冲程', iv: '关闭', ev: '打开', dir: '向上', e: '排出废气（没有能量转化）' }
  ];

  /* ---------- 四冲程汽油机：播放 / 单步，看气门、活塞、能量转化 ---------- */
  SIMS.p2_6_engine = function (box) {
    const ui = SIMS.ui(box, '四冲程汽油机是怎样工作的');
    const fig = ui.fig();
    const spd = ui.buttons(['慢速', '快速'], () => {}, 0);
    const btnPlay = ui.action('▶ 播放', toggle);
    ui.action('⏭ 下一个冲程', next);
    ui.action('↺ 重置', reset);
    const out = ui.out();
    ui.note('判断冲程先看气门：一开一关是吸气或排气（活塞向下是吸气，向上是排气）；两个气门都关是压缩或做功（活塞向上是压缩，向下并且火花塞点火的是做功）。快速播放时数一数：曲轴转 2 圈，才对外做功 1 次。');

    let total = 90, running = false, gen = 0;   // total：曲轴累计转过的角度（度），从吸气冲程中间开始

    function toggle() {
      if (running) { running = false; gen++; btnPlay.textContent = '▶ 继续'; return; }
      running = true; btnPlay.textContent = '⏸ 暂停';
      const my = ++gen;
      let last = 0;
      const step = ts => {
        if (my !== gen || !running) return;
        if (!box.isConnected) { running = false; return; }
        if (last) total += Math.min(0.1, (ts - last) / 1000) * (spd.get() ? 540 : 60);
        last = ts;
        draw();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function next() {
      running = false; gen++; btnPlay.textContent = '▶ 播放';
      total = (Math.floor(total / 180) + 1) * 180 + 90;
      draw();
    }
    function reset() {
      running = false; gen++; btnPlay.textContent = '▶ 播放';
      total = 90;
      draw();
    }

    function draw() {
      const th = total % 720, k = Math.min(3, Math.floor(th / 180)), st = STROKES[k];
      let s = `<g transform="translate(10,8)">${engineSvg(th, { gas: true, arrow: true, flow: true })}</g>` +
        F.text(90, 12, '进气门', { a: 'end', size: 11 }) + F.text(130, 12, '排气门', { a: 'start', size: 11 });
      // 右侧：一个工作循环的四个冲程
      const X = 245, BW = 75;
      STROKES.forEach((x, i) => {
        s += F.rect(X + i * BW, 34, BW, 30, i === k ? 'hi' : 'thin', 3) + F.text(X + i * BW + BW / 2, 49, x.n.slice(0, 2), { size: 13 });
      });
      s += F.text(X, 20, '一个工作循环（曲轴转 2 圈）', { a: 'start', size: 12 });
      const mx = X + th / 720 * BW * 4;
      s += F.line(X + BW * 2, 64, X + BW * 2, 86, 'thin dash') +
        F.text(X + BW, 78, '曲轴第 1 圈', { size: 11 }) + F.text(X + BW * 3, 78, '曲轴第 2 圈', { size: 11 }) +
        F.line(mx, 30, mx, 68, 'force');
      s += F.text(X + 150, 116, st.n, { size: 22 }) +
        F.text(X + 150, 148, '进气门' + st.iv + '，排气门' + st.ev + '，活塞' + st.dir, { size: 13 }) +
        F.text(X + 150, 176, st.e.split('（')[0], { size: 14, cls: k === 1 || k === 2 ? 'orange' : '' }) +
        (st.e.includes('（') ? F.text(X + 150, 198, '（' + st.e.split('（')[1], { size: 12 }) : '');
      fig.innerHTML = F.svg(560, 250, s);

      const turns = Math.floor(total / 360), strokes = Math.floor(total / 180);
      const works = total >= 540 ? Math.floor((total - 540) / 720) + 1 : 0;
      out.innerHTML = `曲轴（飞轮）转过 <b>${turns}</b> 圈，活塞完成 <b>${strokes}</b> 个冲程，对外做功 <b>${works}</b> 次` +
        '<br>规律：一个工作循环 = 4 个冲程 = 曲轴转 2 圈 = 对外做功 1 次。除做功冲程外，其余三个冲程靠飞轮的惯性完成。';
    }
    draw();
  };

  /* ---------- 比热容：相同的电加热器给质量相同的水和另一种物质加热 ---------- */
  SIMS.p2_6_heating = function (box) {
    const ui = SIMS.ui(box, '比较不同物质的吸热能力');
    const MATS = [{ n: '食用油', c: 2100 }, { n: '沙石', c: 920 }];
    const pick = ui.buttons(['水和食用油', '水和沙石'], reset, 0);
    const fig = ui.fig();
    const M = ui.slider({ label: '质量（两者相同）', min: 100, max: 400, step: 50, value: 200, unit: 'g' }, reset);
    const btnPlay = ui.action('▶ 开始加热', toggle);
    ui.action('↺ 重置', reset);
    const out = ui.out();
    ui.note('两个电加热器规格相同，功率都是 100 W：每分钟都放出 6000 J 的热量，所以<b>加热时间相同，吸收的热量就相同</b>（转换法）。初温都是 20 ℃，不计热量损失；食用油的比热容取约 2.1×10³ J/(kg·℃)。水到 100 ℃ 会沸腾，温度不再升高。');

    const P = 100, T0 = 20, TMAX = 6;   // W、℃、min
    let t = 0, running = false, gen = 0;

    function temp(c, mkg, tmin, water) {
      const T = T0 + P * tmin * 60 / (c * mkg);
      return water ? Math.min(100, T) : T;
    }
    function toggle() {
      if (running) { running = false; gen++; btnPlay.textContent = '▶ 继续加热'; return; }
      if (t >= TMAX - 1e-9) t = 0;
      running = true; btnPlay.textContent = '⏸ 暂停';
      const my = ++gen;
      let last = 0;
      const step = ts => {
        if (my !== gen || !running) return;
        if (!box.isConnected) { running = false; return; }
        if (last) t += Math.min(0.1, (ts - last) / 1000) * 0.5;   // 动画里 1 s 相当于 0.5 min
        last = ts;
        if (t >= TMAX) { t = TMAX; running = false; btnPlay.textContent = '▶ 重新加热'; }
        draw();
        if (running) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function reset() {
      running = false; gen++; t = 0; btnPlay.textContent = '▶ 开始加热';
      draw();
    }

    // 烧杯 + 电加热器 + 温度计（温度计液柱 0~150 ℃）
    function cup(x, name, T, on) {
      let s = F.beaker(x, 80, 96, 110, 0.72) + F.text(x + 48, 208, name, { size: 14 });
      s += F.rect(x + 20, 42, 26, 14, 'soft', 2) + F.line(x + 26, 56, x + 26, 178) + F.line(x + 40, 56, x + 40, 178) +
        F.path(`M${x + 26},178 Q${x + 33},186 ${x + 40},178`, 'ink');
      if (on) s += F.line(x + 26, 150, x + 40, 150, 'ray') + F.line(x + 26, 162, x + 40, 162, 'ray');
      const tx = x + 72, yb = 176, len = 120, yt = yb - Math.min(150, T) / 150 * len;
      s += F.rect(tx - 4, yb - len - 6, 8, len + 6, 'thin', 4) + F.circle(tx, yb + 4, 6, 'force-head') +
        F.line(tx, yb, tx, yt, 'force') + F.text(tx, yb - len - 16, SIMS.fmt(T, 1) + ' ℃', { size: 12 });
      return s;
    }

    function draw() {
      const B = MATS[pick.get()], mkg = M.get() / 1000;
      const Tw = temp(4200, mkg, t, true), Tb = temp(B.c, mkg, t, false);
      let s = cup(20, '水', Tw, running) + cup(150, B.n, Tb, running);
      const ax = { x: 330, y: 40, w: 200, h: 170, xmax: TMAX, ymax: 100, xticks: [1, 2, 3, 4, 5, 6], yticks: [20, 40, 60, 80, 100], xlabel: '时间/min', ylabel: '温度/℃' };
      s += SIMS.axes(ax);
      const curve = (c, water) => {
        const pts = [];
        for (let i = 0; i <= 60; i++) {
          const ti = t * i / 60, T = temp(c, mkg, ti, water);
          if (T > 100 + 1e-9) break;
          pts.push([ax.px(ti), ax.py(T)]);
        }
        return pts;
      };
      const pw = curve(4200, true), pb = curve(B.c, false);
      if (pw.length > 1) s += F.poly(pw, 'hi');
      if (pb.length > 1) s += F.poly(pb, 'ray');
      if (t > 0) {
        s += `<circle class="hi-fill" cx="${r1(ax.px(t))}" cy="${r1(ax.py(Tw))}" r="4.5"/>`;
        if (Tb <= 100) s += `<circle class="ray-head" cx="${r1(ax.px(t))}" cy="${r1(ax.py(Tb))}" r="4.5"/>`;
      }
      s += F.line(370, 238, 390, 238, 'hi') + F.text(396, 238, '水', { a: 'start', size: 13 }) +
        F.line(430, 238, 450, 238, 'ray') + F.text(456, 238, B.n, { a: 'start', size: 13 });
      fig.innerHTML = F.svg(580, 252, s);

      const Q = P * t * 60, f = x => SIMS.fmt(x, 1);
      let html = `加热 <b>${f(t)} min</b>，两者吸收的热量相同：Q = Pt = 100 W × ${SIMS.fmt(t * 60, 0)} s = <b>${SIMS.fmt(Q, 0)} J</b><br>`;
      html += `水升高了 <b>${f(Tw - T0)} ℃</b>${Tw >= 100 ? '（已经沸腾，温度保持 100 ℃）' : ''}；${B.n}升高了 <b>${f(Tb - T0)} ℃</b>${Tb > 100 ? '（已超出图像范围）' : ''}`;
      if (t > 0 && Tw < 100) {
        html += `<br>水：Q/(mΔt) = ${SIMS.fmt(Q, 0)} J ÷ (${mkg} kg × ${f(Tw - T0)} ℃) = <b>${SIMS.fmt(Q / (mkg * (Tw - T0)), 0)} J/(kg·℃)</b>；` +
          `${B.n}：Q/(mΔt) = <b>${SIMS.fmt(Q / (mkg * (Tb - T0)), 0)} J/(kg·℃)</b>`;
        html += `<br>吸收相同的热量，<b>水升温少</b> → 水的吸热能力强，比热容大。反过来，要升高相同的温度，水需要加热更长时间。`;
      }
      out.innerHTML = html;
    }
    draw();
  };

  /* ---------- 扩散：抽掉隔板，墨水分子和水分子彼此进入对方；温度越高越快 ---------- */
  SIMS.p2_6_diffusion = function (box) {
    const ui = SIMS.ui(box, '扩散：温度越高，分子运动越剧烈');
    const fig = ui.fig();
    const T = ui.slider({ label: '温度', min: 0, max: 90, step: 5, value: 20, unit: '℃' }, () => {});
    const btnOpen = ui.action('抽掉隔板', open);
    const btnPause = ui.action('⏸ 暂停', pause);
    ui.action('↺ 重置', reset);
    const out = ui.out();
    ui.note('橙色点代表墨水分子，蓝色圈代表水分子（为了看得见画得特别大，真实的分子用光学显微镜也看不到）。注意：<b>隔板抽掉之前分子也在不停地运动</b>。抽掉隔板后，两种分子彼此进入对方——这就是扩散。把温度调高再试一次，扩散明显变快（演示中的速度差别做了夸张）。');

    const N = 70, X0 = 20, Y0 = 16, BW = 480, BH = 180, MID = X0 + BW / 2, RAD = 4;
    let ps = [], wall = true, paused = false, tSim = 0, gen = 0;

    function init() {
      ps = [];
      for (let i = 0; i < 2 * N; i++) {
        const ink = i < N;
        ps.push({
          ink,
          x: (ink ? X0 : MID) + RAD + Math.random() * (BW / 2 - 2 * RAD),
          y: Y0 + RAD + Math.random() * (BH - 2 * RAD),
          a: Math.random() * 2 * Math.PI
        });
      }
      wall = true; tSim = 0;
      btnOpen.disabled = false;
    }
    function open() { wall = false; btnOpen.disabled = true; tSim = 0; }
    function pause() { paused = !paused; btnPause.textContent = paused ? '▶ 继续' : '⏸ 暂停'; }
    function reset() { init(); draw(); }

    function stepAll(dt) {
      const v = (1 + T.get() / 20) * dt * 60;    // 每帧移动的像素（按 60 帧/秒折算）
      ps.forEach(p => {
        p.a += (Math.random() - 0.5) * 0.8;
        p.x += v * Math.cos(p.a); p.y += v * Math.sin(p.a);
        const left = X0 + RAD, right = X0 + BW - RAD;
        if (p.x < left) { p.x = 2 * left - p.x; p.a = Math.PI - p.a; }
        if (p.x > right) { p.x = 2 * right - p.x; p.a = Math.PI - p.a; }
        if (p.y < Y0 + RAD) { p.y = 2 * (Y0 + RAD) - p.y; p.a = -p.a; }
        if (p.y > Y0 + BH - RAD) { p.y = 2 * (Y0 + BH - RAD) - p.y; p.a = -p.a; }
        if (wall) {
          const onLeft = p.ink;   // 有隔板时墨水分子在左边，水分子在右边
          if (onLeft && p.x > MID - RAD) { p.x = 2 * (MID - RAD) - p.x; p.a = Math.PI - p.a; }
          if (!onLeft && p.x < MID + RAD) { p.x = 2 * (MID + RAD) - p.x; p.a = Math.PI - p.a; }
        }
      });
    }

    function draw() {
      let s = F.rect(X0, Y0, BW, BH, 'thin', 4);
      if (wall) s += `<line class="ink" style="stroke-width:4" x1="${MID}" y1="${Y0}" x2="${MID}" y2="${Y0 + BH}"/>`;
      ps.forEach(p => {
        s += p.ink ? `<circle class="ray-head" cx="${r1(p.x)}" cy="${r1(p.y)}" r="${RAD}"/>` : `<circle class="hi" cx="${r1(p.x)}" cy="${r1(p.y)}" r="${RAD - 0.5}"/>`;
      });
      s += F.text(X0 + BW / 4, Y0 + BH + 16, '左半边', { size: 12 }) + F.text(X0 + BW * 3 / 4, Y0 + BH + 16, '右半边', { size: 12 });
      fig.innerHTML = F.svg(520, 222, s);
      const inkR = ps.filter(p => p.ink && p.x > MID).length, watL = ps.filter(p => !p.ink && p.x < MID).length;
      out.innerHTML = wall
        ? `隔板还在：墨水分子在左、水分子在右，各自在不停地做无规则运动。温度 ${T.get()} ℃。`
        : `抽掉隔板后 <b>${SIMS.fmt(tSim, 1)} s</b>：跑到右半边的墨水分子 <b>${inkR}</b> 个，跑到左半边的水分子 <b>${watL}</b> 个（完全混匀时大约各 ${N / 2} 个）。温度 ${T.get()} ℃。`;
    }

    init();
    let last = 0;
    const my = ++gen;
    const loop = ts => {
      if (my !== gen) return;
      if (!box.isConnected) return;    // 面板关掉或切换了标签页，停止动画
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      if (!paused && dt > 0) { stepAll(dt); if (!wall) tSim += dt; draw(); }
      requestAnimationFrame(loop);
    };
    draw();
    requestAnimationFrame(loop);
  };
})();
