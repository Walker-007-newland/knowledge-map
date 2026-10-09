// 第二阶段 组 2 互动演示（写法见 js/sims.js 顶部说明，清单见 docs/phase2-spec.md）
//   p2_2_melt  晶体 / 非晶体的熔化和凝固：试管里的物质 + 温度-时间图像
//   p2_2_boil  观察水的沸腾：气泡变化、温度-时间图像、撤去酒精灯
//   p2_2_phase 物态变化判断器：点一个现象，三态图上亮出对应的箭头
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  /* ---------- 小工具 ---------- */
  // 温度-时间坐标：横轴画在底部，纵轴从 ymin 开始（ymin > 0 时画折断号，ymin = 0 时标 O）
  function tAxes(o) {
    o.px = t => o.x + t / o.xmax * o.w;
    o.py = T => o.y + o.h - (T - o.ymin) / (o.ymax - o.ymin) * o.h;
    const yb = o.y + o.h;
    let s = F.arrow(o.x, yb, o.x + o.w + 14, yb, { size: 7 }) + F.arrow(o.x, yb, o.x, o.y - 14, { size: 7 });
    if (o.ymin > 0) s += F.rect(o.x - 4, yb - 19, 8, 12, 'mask') + F.poly([[o.x, yb - 20], [o.x - 4, yb - 16], [o.x + 4, yb - 11], [o.x, yb - 7]], 'thin');
    (o.xticks || []).forEach(t => { s += F.line(o.px(t), yb, o.px(t), yb + 4, 'thin') + F.text(o.px(t), yb + 14, t, { size: 11 }); });
    (o.yticks || []).forEach(T => { s += F.line(o.x - 4, o.py(T), o.x, o.py(T), 'thin') + F.text(o.x - 8, o.py(T), T, { size: 11, a: 'end' }); });
    s += F.text(o.x + o.w + 14, yb - 12, o.xlabel || '时间/min', { size: 12, a: 'end' }) +
      F.text(o.x + 6, o.y - 18, o.ylabel || '温度/℃', { size: 12, a: 'start' });
    if (o.ymin === 0) s += F.text(o.x - 8, yb + 12, 'O', { cls: 'it', size: 13 });
    return s;
  }

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

  /* ---------- 熔化和凝固 ---------- */
  SIMS.p2_2_melt = function (box) {
    const ui = SIMS.ui(box, '晶体和非晶体：熔化与凝固的温度变化');
    const MATS = [
      { name: '冰', crystal: true, T0: -10, mp: 0, rs: 5, dur: 5, rl: 2.5, ymin: -10, ymax: 15, yticks: [-10, -5, 0, 5, 10, 15] },
      { name: '海波', crystal: true, T0: 36, mp: 48, rs: 3, dur: 5, rl: 2.4, ymin: 30, ymax: 60, yticks: [36, 42, 48, 54, 60] },
      { name: '石蜡', crystal: false, T0: 30, ymin: 20, ymax: 80, yticks: [20, 40, 60, 80] }
    ];
    const TEND = 12, RATE = 1.2;   // 横轴 0~12 min；动画里 1 s 相当于 1.2 min
    const mat = ui.buttons(MATS.map(m => m.name), reset, 1);
    const mode = ui.buttons(['加热：熔化', '冷却：凝固'], reset, 0);
    const fig = ui.fig();
    const btn = ui.action('▶ 开始', toggle);
    ui.action('↺ 重置', reset);
    const out = ui.out();
    ui.note('晶体（冰、海波）熔化时有一段<b>温度不变</b>的水平线，这时处于<b>固液共存</b>状态，仍在吸热；对应的温度就是熔点。非晶体（石蜡）先变软、再变稀，温度一直升高，没有熔点。切换到“冷却”看凝固：晶体凝固时放热、温度不变，同种晶体的凝固点等于熔点。');

    let t = 0;
    const anim = animator(box, dt => {
      t += dt * RATE;
      if (t >= TEND) { t = TEND; draw(); return false; }
      draw();
    }, () => { btn.textContent = '▶ 重新开始'; });

    function toggle() {
      if (anim.running) { anim.stop(); btn.textContent = '▶ 继续'; return; }
      if (t >= TEND) t = 0;
      btn.textContent = '⏸ 暂停';
      anim.start();
    }
    function reset() { anim.stop(); t = 0; btn.textContent = '▶ 开始'; draw(); }

    // 加热了 th 分钟时的状态：温度 T、液态比例 liq、状态名
    function heat(m, th) {
      if (m.crystal) {
        const t1 = (m.mp - m.T0) / m.rs, t2 = t1 + m.dur;
        if (th < t1) return { T: m.T0 + m.rs * th, liq: 0, st: '固态', ph: 0 };
        if (th <= t2) return { T: m.mp, liq: (th - t1) / m.dur, st: '固液共存', ph: 1 };
        return { T: m.mp + m.rl * (th - t2), liq: 1, st: '液态', ph: 2 };
      }
      const T = m.T0 + 5 * th - 0.08 * th * th;
      const liq = Math.max(0, Math.min(1, (T - 45) / 22));
      const st = T < 45 ? '固态' : T < 56 ? '变软' : T < 67 ? '变稀（黏稠）' : '液态';
      return { T, liq, st, ph: T < 45 ? 0 : T < 67 ? 1 : 2 };
    }
    // 演示时刻 tt 对应的状态（冷却 = 把加热过程倒过来放）
    const at = (m, cool, tt) => heat(m, cool ? TEND - tt : tt);

    function draw() {
      const m = MATS[mat.get()], cool = mode.get() === 1, c = at(m, cool, t);
      // 左：烧杯（水浴）+ 试管 + 温度计
      let s = F.beaker(40, 110, 130, 130, 0.78) + F.rect(28, 240, 154, 5, 'soft');
      const tx = 105, top = 60, bot = 230, r = 13;
      const sTop = 166, sH = bot - r - sTop;   // 物质区域
      // 物质
      if (m.crystal) {
        const lh = (sH + r) * c.liq;
        if (lh > 0) s += F.rect(tx - r, bot - lh, 2 * r, lh, 'water');
        const solidTop = sTop, solidBot = bot - lh;
        for (let yy = solidTop; yy < solidBot - 4; yy += 11) {
          for (let xx = tx - r + 2; xx < tx + r - 6; xx += 9) {
            const k = ((xx * 7 + yy * 3) % 5) - 2;
            s += F.rect(xx, yy + k * 0.6, 7, 7, 'soft', 1);
          }
        }
      } else {
        s += `<rect class="soft" x="${tx - r}" y="${sTop}" width="${2 * r}" height="${bot - sTop}" style="opacity:${(1 - c.liq * 0.85).toFixed(2)}"/>` +
          `<rect class="water" x="${tx - r}" y="${sTop}" width="${2 * r}" height="${bot - sTop}" style="opacity:${c.liq.toFixed(2)}"/>`;
      }
      s += `<path class="ink" d="M${tx - r},${top} L${tx - r},${bot - r} A${r},${r} 0 0 0 ${tx + r},${bot - r} L${tx + r},${top}"/>`;
      // 温度计（液柱高低随温度）
      const thx = tx + 4, ty0 = 24, tyB = 206;
      const lev = tyB - 12 - (c.T - m.ymin) / (m.ymax - m.ymin) * 150;
      s += F.rect(thx - 3, ty0, 6, tyB - ty0, 'soft', 3) + F.rect(thx - 1.2, lev, 2.4, tyB - lev, 'force-head') + F.circle(thx, tyB, 4.5, 'force-head') +
        F.text(thx + 10, ty0 + 6, SIMS.fmt(c.T, 1) + ' ℃', { a: 'start', size: 13 });
      s += F.text(52, 228, '水', { a: 'start', size: 12 }) + F.text(192, 298, m.name + '：' + c.st, { size: 13 });
      // 加热：酒精灯；冷却：不加热
      if (!cool) s += F.lamp(105, 268, { fire: true });
      else s += F.text(105, 262, '（撤去酒精灯，自然冷却）', { size: 12 });

      // 右：温度-时间图像
      const ax = { x: 260, y: 40, w: 290, h: 220, xmax: TEND, ymin: m.ymin, ymax: m.ymax, xticks: [2, 4, 6, 8, 10, 12], yticks: m.yticks };
      s += tAxes(ax);
      if (m.crystal) {
        s += F.line(ax.x, ax.py(m.mp), ax.x + ax.w, ax.py(m.mp), 'thin dash') +
          F.text(ax.x + ax.w, ax.py(m.mp) - 10, (cool ? '凝固点 ' : '熔点 ') + m.mp + ' ℃', { a: 'end', size: 12 });
      }
      // 整条曲线淡淡地画出来，已经过的部分加粗
      const full = [], done = [];
      for (let i = 0; i <= 240; i++) {
        const tt = i / 240 * TEND, p = [ax.px(tt), ax.py(at(m, cool, tt).T)];
        full.push(p);
        if (tt <= t + 1e-9) done.push(p);
      }
      done.push([ax.px(t), ax.py(c.T)]);
      s += F.poly(full, 'thin dash') + F.poly(done, 'hi') + `<circle class="hi-fill" cx="${ax.px(t).toFixed(1)}" cy="${ax.py(c.T).toFixed(1)}" r="5"/>`;
      fig.innerHTML = F.svg(600, 312, s);

      // 文字说明
      let msg = `t = <b>${SIMS.fmt(t, 1)} min</b>　温度 <b>${SIMS.fmt(c.T, 1)} ℃</b>　状态：<b>${c.st}</b><br>`;
      if (m.crystal) {
        if (!cool) msg += ['固态，吸热，温度升高（还没达到熔点）', '<b>正在熔化</b>：固液共存，继续吸热，但温度保持在熔点 ' + m.mp + ' ℃ 不变', '已全部熔化成液体，继续吸热，温度又开始升高'][c.ph];
        else msg += ['已全部凝固成固体，继续放热，温度降低', '<b>正在凝固</b>：固液共存，继续放热，但温度保持在凝固点 ' + m.mp + ' ℃ 不变', '液态，放热，温度降低（还没降到凝固点）'][c.ph];
      } else {
        msg += cool ? '石蜡是非晶体：放热，温度一直降低，由稀变稠、变硬，没有凝固点' : '石蜡是非晶体：吸热，温度一直升高，先变软、再变稀，没有固定的熔点';
      }
      out.innerHTML = msg;
    }
    draw();
  };

  /* ---------- 水的沸腾 ---------- */
  SIMS.p2_2_boil = function (box) {
    const ui = SIMS.ui(box, '观察水的沸腾');
    const fig = ui.fig();
    const M = ui.slider({ label: '水的质量', min: 100, max: 300, step: 50, value: 200, unit: 'g' }, reset);
    const P = ui.buttons(['实验室（气压略低，沸点 98 ℃）', '标准大气压（沸点 100 ℃）'], reset, 0);
    const btn = ui.action('▶ 开始加热', toggle);
    const lampBtn = ui.action('撤去酒精灯', toggleLamp);
    ui.action('↺ 重置', reset);
    const out = ui.out();
    ui.note('从 90 ℃ 开始记录。注意看：①沸腾前、沸腾时气泡的变化；②沸腾后继续加热，温度计示数变不变；③沸腾后撤去酒精灯会怎样。再改变水的质量，看到达沸腾的时间和沸点各有没有变化。');

    const TMAX = 12, RATE = 0.8, T0 = 90;
    let t, T, lamp, offT, boiling, hist;
    const anim = animator(box, dt => {
      const d = dt * RATE, bp = P.get() ? 100 : 98, rate = 400 / M.get() * 0.9;   // 200 g 时约 1.8 ℃/min
      t += d;
      if (lamp) {
        offT = 0;
        if (T < bp) T = Math.min(bp, T + rate * d);
        boiling = T >= bp - 1e-9;
      } else {
        offT += d;
        // 撤去酒精灯后，陶土网和烧杯底的温度还高于水，水还能吸一会儿热
        if (boiling && offT < 0.4) { /* 仍在沸腾 */ } else { boiling = false; T = Math.max(80, T - 0.8 * d); }
      }
      hist.push([t, T]);
      if (t >= TMAX) { t = TMAX; draw(); return false; }
      draw();
    }, () => { btn.textContent = '▶ 重新开始'; });

    function toggle() {
      if (anim.running) { anim.stop(); btn.textContent = '▶ 继续'; return; }
      if (t >= TMAX) init();
      btn.textContent = '⏸ 暂停';
      anim.start();
    }
    function toggleLamp() {
      lamp = !lamp;
      lampBtn.textContent = lamp ? '撤去酒精灯' : '放回酒精灯';
      draw();
    }
    function init() { t = 0; T = T0; lamp = true; offT = 0; boiling = false; hist = [[0, T0]]; lampBtn.textContent = '撤去酒精灯'; }
    function reset() { anim.stop(); init(); btn.textContent = '▶ 开始加热'; draw(); }

    function draw() {
      const bp = P.get() ? 100 : 98;
      const bx = 50, by = 90, bw = 140, bh = 150, lv = 0.72, surf = by + bh * (1 - lv), bottom = by + bh;
      let s = F.beaker(bx, by, bw, bh, lv) + F.rect(bx - 15, bottom, bw + 30, 5, 'soft') + F.text(bx + bw + 18, bottom + 3, '陶土网', { a: 'start', size: 12 });
      // 气泡：沸腾前少量气泡上升时变小、到不了水面；沸腾时大量气泡上升变大、到水面破裂
      const near = T >= bp - 5 && (lamp || boiling);
      if (near || boiling) {
        const n = boiling ? 9 : 4;
        for (let i = 0; i < n; i++) {
          const x = bx + 18 + (n > 1 ? i * (bw - 36) / (n - 1) : 0) + (i % 2 ? 4 : -4);
          const ph = (t * (boiling ? 2.2 : 1.4) + i * 0.37) % 1;
          const y = bottom - 6 - ph * (bottom - surf - 6);
          if (boiling) s += F.circle(x, y, (2 + 7 * ph).toFixed(1), 'thin');
          else if (ph < 0.55) s += F.circle(x, y, (4.5 * (1 - ph / 0.55) + 0.8).toFixed(1), 'thin');
        }
      }
      if (boiling) {
        [70, 100, 125].forEach((x, i) => {
          const dy = (t * 30 + i * 9) % 18;
          s += F.path(`M${x},${by - 8 - dy} q6,-8 0,-16 q-6,-8 0,-16`, 'thin dash');
        });
        s += F.text(bx + bw + 10, by - 20, '“白气”', { a: 'start', size: 12 });
      }
      // 温度计
      const thx = 150, ty0 = 20, tyB = 200;
      const lev = tyB - 10 - (Math.max(80, T) - 80) / 22 * 150;
      s += F.rect(thx - 3, ty0, 6, tyB - ty0, 'soft', 3) + F.rect(thx - 1.2, lev, 2.4, tyB - lev, 'force-head') + F.circle(thx, tyB, 4.5, 'force-head') +
        F.text(thx + 10, ty0 + 8, SIMS.fmt(T, 1) + ' ℃', { a: 'start', size: 13 });
      if (lamp) s += F.lamp(120, bottom + 30, { fire: true });
      else s += F.text(120, bottom + 30, '（酒精灯已撤去）', { size: 12 });

      // 温度-时间图像
      const ax = { x: 300, y: 40, w: 250, h: 210, xmax: TMAX, ymin: 88, ymax: 102, xticks: [2, 4, 6, 8, 10, 12], yticks: [90, 92, 94, 96, 98, 100, 102] };
      s += tAxes(ax) + F.line(ax.x, ax.py(bp), ax.x + ax.w, ax.py(bp), 'thin dash') +
        F.text(ax.x + ax.w, ax.py(bp) - 10, '沸点 ' + bp + ' ℃', { a: 'end', size: 12 });
      const pts = hist.filter((p, i) => i % 3 === 0 || i === hist.length - 1).map(p => [ax.px(p[0]), ax.py(Math.max(88, p[1]))]);
      s += F.poly(pts, 'hi') + `<circle class="hi-fill" cx="${ax.px(t).toFixed(1)}" cy="${ax.py(Math.max(88, T)).toFixed(1)}" r="5"/>`;
      fig.innerHTML = F.svg(600, 315, s);

      let msg = `t = <b>${SIMS.fmt(t, 1)} min</b>　水温 <b>${SIMS.fmt(T, 1)} ℃</b><br>`;
      if (boiling && lamp) msg += '<b>沸腾</b>：大量气泡上升、<b>变大</b>，到水面破裂，里面的水蒸气散发到空气中。继续吸热，但温度保持在沸点 ' + bp + ' ℃ 不变。';
      else if (boiling) msg += '刚撤去酒精灯，水还沸腾了一小会儿：陶土网和烧杯底的温度高于水温，水还能继续吸热。';
      else if (!lamp && T < bp) msg += hist.some(p => p[1] >= bp) ? '停止加热后，水不能继续吸热，<b>沸腾停止</b>，温度下降 → 沸腾需要持续吸热。' : '没有加热，水温不会升到沸点。';
      else if (near) msg += '沸腾前：水中有少量气泡，上升过程中<b>变小</b>（上层水温较低，气泡里的水蒸气遇冷液化）。';
      else msg += '加热中：吸热，温度升高。';
      if (t >= TMAX - 1e-9) {
        const tb = hist.find(p => p[1] >= bp - 1e-9);
        if (tb) msg += `<br>本次从 90 ℃ 加热到沸腾用了约 ${SIMS.fmt(tb[0], 1)} min。水越多，用时越长，但沸点不变。`;
      }
      out.innerHTML = msg;
    }
    init();
    draw();
  };

  /* ---------- 物态变化判断器 ---------- */
  // 三态图：hl 为高亮的变化编号（0 熔化 1 凝固 2 汽化 3 液化 4 升华 5 凝华），不传则全部按吸热（蓝）/放热（橙）上色
  function phaseTri(hl) {
    const N = { s: [250, 50, '固态'], l: [90, 236, '液态'], g: [410, 236, '气态'] };
    const CH = [['s', 'l', '熔化', 1], ['l', 's', '凝固', 0], ['l', 'g', '汽化', 1], ['g', 'l', '液化', 0], ['s', 'g', '升华', 1], ['g', 's', '凝华', 0]];
    let s = '';
    CH.forEach((c, i) => {
      const A = N[c[0]], B = N[c[1]];
      const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      const sh = 42, off = 8;
      const x1 = A[0] + ux * sh + nx * off, y1 = A[1] + uy * sh + ny * off, x2 = B[0] - ux * sh + nx * off, y2 = B[1] - uy * sh + ny * off;
      const on = hl == null || hl === i;
      const cls = !on ? 'thin' : c[3] ? 'hi' : 'ray';
      s += F.arrow(x1, y1, x2, y2, { cls, size: on ? 10 : 7 });
      const mx = (A[0] + B[0]) / 2 + nx * 30, my = (A[1] + B[1]) / 2 + ny * 30;
      s += F.text(mx, my - 7, c[2], { size: hl === i ? 16 : 14, cls: on ? (c[3] ? '' : 'orange') : '' }) +
        F.text(mx, my + 10, c[3] ? '（吸热）' : '（放热）', { size: 11, cls: on && !c[3] ? 'orange' : '' });
    });
    Object.keys(N).forEach(k => { const n = N[k]; s += F.rect(n[0] - 34, n[1] - 16, 68, 32, 'soft', 8) + F.text(n[0], n[1], n[2], { size: 15 }); });
    return s;
  }

  SIMS.p2_2_phase = function (box) {
    const ui = SIMS.ui(box, '物态变化判断器：先看“从什么态”，再看“变成什么态”');
    const NAMES = ['熔化', '凝固', '汽化', '液化', '升华', '凝华'];
    const PH = [
      ['冰雪消融', 0, '冰、雪（固态）→ 水（液态）'],
      ['河水结冰', 1, '水（液态）→ 冰（固态）'],
      ['湿衣服晾干', 2, '衣服上的水（液态）→ 水蒸气（气态），是蒸发'],
      ['露珠的形成', 3, '空气中的水蒸气（气态）夜间遇冷 → 小水珠（液态）'],
      ['冰棍冒“白气”', 3, '冰棍周围空气中的水蒸气（气态）遇冷 → 小水珠（液态）。“白气”是看得见的小水珠，不是水蒸气'],
      ['樟脑丸变小', 4, '樟脑丸（固态）直接 → 樟脑蒸气（气态），没有经过液态'],
      ['霜的形成', 5, '空气中的水蒸气（气态）遇到 0 ℃ 以下的地面、草叶直接 → 冰晶（固态）'],
      ['雾凇', 5, '空气中的水蒸气（气态）遇到极冷的树枝直接 → 冰晶（固态）'],
      ['铁水浇铸成工件', 1, '铁水（液态）→ 铁（固态）'],
      ['干冰变小', 4, '干冰（固态二氧化碳）直接 → 二氧化碳气体（气态）'],
      ['雾的形成', 3, '空气中的水蒸气（气态）遇冷 → 悬浮在空气中的小水珠（液态）'],
      ['窗玻璃内侧的冰花', 5, '室内温暖空气中的水蒸气（气态）遇到冰冷的玻璃直接 → 冰晶（固态），所以冰花在<b>内侧</b>']
    ];
    const pick = ui.buttons(PH.map(p => p[0]), draw, 0);
    const fig = ui.fig();
    const out = ui.out();
    ui.note('蓝色箭头吸热，橙色箭头放热。记法：从固 → 液 → 气，分子越来越“自由”，都要<b>吸热</b>（熔化、汽化、升华）；反过来都<b>放热</b>（凝固、液化、凝华）。');
    function draw() {
      const p = PH[pick.get()], k = p[1];
      fig.innerHTML = F.svg(500, 290, phaseTri(k));
      out.innerHTML = `<b>${p[0]}</b>：${p[2]}<br>属于 <b>${NAMES[k]}</b>，${k % 2 === 0 ? '<b>吸热</b>' : '<b>放热</b>'}。`;
    }
    draw();
  };
})();
