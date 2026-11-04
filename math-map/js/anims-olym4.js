// 奥数拓展 olym4 组（行程问题）的动画：相遇、追及、火车过桥、流水行船、钟面、行程中的比例
(function () {
  const { S, H, T, fmt, stage, ctrl, btn, slider, svgPoint, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const put = (g, x, y, extra) => g.setAttribute('transform', `translate(${x},${y})${extra || ''}`);
  const near = (a, b) => Math.abs(a - b) < 1e-6;

  // 小人标记：圆头 + 尖角指向路面。down 为真时画在路面下方
  function pin(parent, label, k, down) {
    const g = S('g', {}, parent);
    const s = down ? -1 : 1;
    S('path', { d: `M0,0 L-6,${-12 * s} L6,${-12 * s} Z`, class: 'f' + k }, g);
    S('circle', { cx: 0, cy: -22 * s, r: 12, class: 'f' + k }, g);
    T(g, 0, -22 * s + 4.5, label, 'tw tb ts');
    return g;
  }

  // 时间轴：播放 / 暂停 + 可拖动的时间滑块；到 stops 里的时刻自动暂停
  function player(el, o) {
    const c = ctrl(el);
    const pb = btn(c, '▶ 播放', () => (playing ? pause() : play()));
    const wrap = H('div', { class: 'aslider' }, c);
    H('label', {}, wrap, o.label || '时间');
    const inp = H('input', { type: 'range', min: 0, max: o.max, step: o.step || 'any', value: 0, 'aria-label': o.label || '时间' }, wrap);
    inp.style.width = '150px';
    const out = H('output', {}, wrap, '');
    let t = 0, max = o.max, stops = o.stops || [], playing = false, last = 0;
    // 读数用的时刻：在停靠点（相遇、追上等）和终点取精确值；其余时刻向下取到 0.01（或 o.round），
    // 这样“速度 × 时间 = 路程”的读数四舍五入后也能对得上；取整后不会越过前后的停靠点
    const val = () => {
      if (o.snap) return Math.round(t / o.snap) * o.snap;
      const marks = stops.concat([0, max]);
      let lastStop = 0;
      for (const s of marks) {
        if (Math.abs(t - s) < 1e-9) return s;
        if (s < t && s > lastStop) lastStop = s;
      }
      const inv = 1 / (o.round || 0.01);
      return Math.max(lastStop, Math.floor(t * inv + 1e-9) / inv);
    };
    function set(v) {
      t = Math.max(0, Math.min(max, v));
      inp.value = t;
      out.textContent = fmt(val()) + (o.unit || '');
      o.onTime(val());
    }
    function pause() { playing = false; pb.textContent = '▶ 播放'; }
    function nextStop() {
      for (const s of stops) if (t < s - 1e-9) return s;
      return max;
    }
    function frame(now) {
      if (!playing) return;
      if (!el.isConnected) { playing = false; return; }
      const dt = Math.min(64, now - last);
      last = now;
      let nt = t + (dt * max) / (o.dur || 7000);
      const ns = nextStop();
      let hit = false;
      if (nt >= ns - 1e-9) { nt = ns; hit = true; }
      set(nt);
      if (hit) pause(); else requestAnimationFrame(frame);
    }
    function play() {
      if (t >= max - 1e-9) set(0);
      if (RM) { set(nextStop()); return; }
      playing = true;
      pb.textContent = '⏸ 暂停';
      last = performance.now();
      requestAnimationFrame(frame);
    }
    inp.addEventListener('input', () => { pause(); set(+inp.value); });
    // 等动画函数里的变量都声明完再画第一帧
    Promise.resolve().then(() => set(0));
    return {
      set(v) { pause(); set(v); },
      get: () => t,
      reset(m, st) { pause(); max = m; inp.max = m; stops = (st || []).slice().sort((a, b) => a - b); set(0); }
    };
  }

  // 带分数的 HTML：num / den 分钟
  function mixedHTML(num, den) {
    const q = Math.floor(num / den), r = num % den;
    if (!r) return String(q);
    const g = gcd(r, den);
    return (q ? q + ' ' : '') + window.fr(r / g, den / g);
  }
  function mixedText(num, den) {
    const q = Math.floor(num / den), r = num % den;
    if (!r) return String(q);
    const g = gcd(r, den);
    return (q ? q + '又' : '') + `${r / g}/${den / g}`;
  }
  // 分数 num / den（都是整数）：能除尽就写整数，否则写成带分数
  const qHTML = (num, den) => mixedHTML(num, den);

  // ───────────── 相遇问题：线段图 ─────────────
  A.o_meet_line = function (el) {
    const W = 460, Hh = 200, x0 = 40, x1 = 420, yL = 80;
    const svg = stage(el, W, Hh);
    S('line', { x1: x0, x2: x1, y1: yL, y2: yL, class: 'smuted' }, svg);
    S('line', { x1: x0, x2: x0, y1: yL - 8, y2: yL + 8, class: 'sstrong' }, svg);
    S('line', { x1: x1, x2: x1, y1: yL - 8, y2: yL + 8, class: 'sstrong' }, svg);
    T(svg, x0 - 10, yL + 5, 'A', 'tb', 'end');
    T(svg, x1 + 10, yL + 5, 'B', 'tb', 'start');
    const g = S('g', {}, svg);
    const pA = pin(svg, '甲', 1), pB = pin(svg, '乙', 2, true);
    const read = H('p', { class: 'anim-read' }, el);
    let v1 = 60, v2 = 40, D = 500, T0 = 5;
    const pl = player(el, { max: T0, unit: ' 分', onTime: draw });
    const c2 = ctrl(el);
    slider(c2, 'omv1', '甲每分走', 40, 90, 10, v1, (v) => { v1 = v; reset(); });
    slider(c2, 'omv2', '乙每分走', 30, 80, 10, v2, (v) => { v2 = v; reset(); });
    slider(c2, 'omd', '全程', 300, 900, 100, D, (v) => { D = v; reset(); });
    H('p', { class: 'anim-tip' }, el, '提示：拖动“时间”滑块可以停在任意时刻；改变速度或全程后重新播放。下面的长条把两人走的路一分钟一分钟接起来。');
    function reset() { T0 = D / (v1 + v2); pl.reset(T0, []); }
    function draw(t) {
      g.innerHTML = '';
      const sc = (x1 - x0) / D, X = (d) => x0 + d * sc;
      const d1 = v1 * t, d2 = v2 * t, met = near(t, T0);
      S('line', { x1: X(0), x2: X(d1), y1: yL, y2: yL, class: 's1 thick round' }, g);
      S('line', { x1: X(D - d2), x2: X(D), y1: yL, y2: yL, class: 's2 thick round' }, g);
      for (let k = 1; k <= Math.floor(t + 1e-9); k++) {
        S('circle', { cx: X(v1 * k), cy: yL, r: 3.5, class: 'f1 sline' }, g);
        S('circle', { cx: X(D - v2 * k), cy: yL, r: 3.5, class: 'f2 sline' }, g);
      }
      if (!met) {
        const gap = D - d1 - d2;
        T(g, (X(d1) + X(D - d2)) / 2, yL - 46, `还差 ${fmt(gap)} 米`, 'ts tb');
      } else {
        T(g, X(d1), yL - 46, '相遇！', 'tb t3');
      }
      // 合起来的长条
      const yb = 150, hb = 18;
      T(g, x0, yb - 7, `把两人走的路接起来（每分钟合走 ${v1} + ${v2} = ${v1 + v2} 米）`, 'ts tm', 'start');
      S('rect', { x: x0, y: yb, width: x1 - x0, height: hb, class: 'fnone sline' }, g);
      for (let k = 0; k < t - 1e-9; k++) {
        const f = Math.min(1, t - k), bx = X(k * (v1 + v2));
        S('rect', { x: bx, y: yb, width: v1 * f * sc, height: hb, class: 'f1s' }, g);
        S('rect', { x: bx + v1 * f * sc, y: yb, width: v2 * f * sc, height: hb, class: 'f2s' }, g);
        S('line', { x1: bx, x2: bx, y1: yb, y2: yb + hb, class: 'sstrong thin' }, g);
        if (f === 1 && (v1 + v2) * sc >= 28) T(g, bx + ((v1 + v2) * sc) / 2, yb + 13.5, `第${k + 1}分`, 'ts');
      }
      T(g, x1, yb + hb + 16, `全程 ${D} 米`, 'ts tm', 'end');
      put(pA, X(d1), yL - 3);
      put(pB, X(D - d2), yL + 3);
      read.innerHTML = met
        ? `相遇啦！相遇时间 = 全程 ÷ 速度和 = ${D} ÷ (${v1} + ${v2}) = <b>${qHTML(D, v1 + v2)}</b> 分。<br>甲走了 <span class="k1">${v1} × ${qHTML(D, v1 + v2)} = ${qHTML(v1 * D, v1 + v2)}</span> 米，乙走了 <span class="k2">${v2} × ${qHTML(D, v1 + v2)} = ${qHTML(v2 * D, v1 + v2)}</span> 米，合起来正好是全程 <b>${D}</b> 米。`
        : t === 0
          ? `甲从 A、乙从 B 同时出发，面对面走。全程 ${D} 米，甲每分走 ${v1} 米，乙每分走 ${v2} 米。点“播放”看看。`
          : `第 ${fmt(t)} 分：甲走了 <span class="k1">${fmt(d1)}</span> 米，乙走了 <span class="k2">${fmt(d2)}</span> 米，合起来 ${fmt(d1 + d2)} 米 = ${v1 + v2} × ${fmt(t)}。两人每分钟一共靠近 ${v1 + v2} 米，还相距 <b>${fmt(D - d1 - d2)}</b> 米。`;
    }
  };

  // ───────────── 相遇问题：二次相遇 ─────────────
  A.o_meet_twice = function (el) {
    const W = 460, Hh = 210, x0 = 40, x1 = 420, yL = 110;
    const svg = stage(el, W, Hh);
    S('line', { x1: x0, x2: x1, y1: yL, y2: yL, class: 'smuted' }, svg);
    S('line', { x1: x0, x2: x0, y1: yL - 8, y2: yL + 8, class: 'sstrong' }, svg);
    S('line', { x1: x1, x2: x1, y1: yL - 8, y2: yL + 8, class: 'sstrong' }, svg);
    T(svg, x0 - 10, yL + 5, 'A', 'tb', 'end');
    T(svg, x1 + 10, yL + 5, 'B', 'tb', 'start');
    const g = S('g', {}, svg);
    const pA = pin(svg, '甲', 1), pB = pin(svg, '乙', 2, true);
    const read = H('p', { class: 'anim-read' }, el);
    let v1 = 60, v2 = 40, D = 500, t1 = 5;
    const pl = player(el, { max: 3 * t1, stops: [t1], unit: ' 分', onTime: draw, dur: 9000 });
    const c2 = ctrl(el);
    slider(c2, 'om2v1', '甲每分走', 40, 80, 10, v1, (v) => { v1 = v; reset(); });
    slider(c2, 'om2v2', '乙每分走', 40, 80, 10, v2, (v) => { v2 = v; reset(); });
    slider(c2, 'om2d', '全程', 300, 900, 100, D, (v) => { D = v; reset(); });
    H('p', { class: 'anim-tip' }, el, '两人到达对方出发点后立刻往回走。上方折线是甲走过的路，下方折线是乙走过的路；播放到第 1 次相遇会自动暂停，再点播放继续。');
    function reset() { t1 = D / (v1 + v2); pl.reset(3 * t1, [t1]); }
    const refl = (s) => { const m = s % (2 * D); return m <= D ? m : 2 * D - m; };
    function legs(s, fromA, k, ySign) {
      const sc = (x1 - x0) / D, X = (d) => x0 + d * sc;
      for (let i = 0; i < 3; i++) {
        const part = Math.max(0, Math.min(D, s - i * D));
        if (part <= 0) break;
        const right = (i % 2 === 0) === fromA;
        const a = right ? 0 : D, b = right ? part : D - part;
        const y = yL + ySign * (44 + 10 * i);
        S('line', { x1: X(a), x2: X(b), y1: y, y2: y, class: `s${k} round` }, g);
        const dir = right ? 1 : -1;
        S('path', { d: `M${X(b)},${y} l${-7 * dir},-4 v8 Z`, class: 'f' + k }, g);
      }
    }
    function draw(t) {
      g.innerHTML = '';
      const sc = (x1 - x0) / D, X = (d) => x0 + d * sc;
      const s1 = v1 * t, s2 = v2 * t, sum = s1 + s2, t2 = 3 * t1;
      legs(s1, true, 1, -1);
      legs(s2, false, 2, 1);
      const m1 = v1 * t1, m2 = refl(v1 * t2);
      [[t1, m1, '第1次'], [t2, m2, '第2次']].forEach(([tt, m, lb]) => {
        if (t < tt - 1e-6) return;
        S('line', { x1: X(m), x2: X(m), y1: 28, y2: yL + 72, class: 's3 dash thin' }, g);
        T(g, X(m), 22, lb + '相遇', 'ts tb t3');
      });
      put(pA, X(refl(s1)), yL - 3);
      put(pB, X(D - refl(s2)), yL + 3);
      let txt;
      // 用分数显示，避免四舍五入后算式对不上：所有量都以 1/S 为单位（S 是速度和）
      const Sv = v1 + v2, P = 2 * D * Sv, p3 = (3 * v1 * D) % P, m2n = p3 <= D * Sv ? p3 : P - p3;
      if (near(t, t1)) txt = `<b>第 1 次相遇：</b>两人合走了 <b>1 个全程</b>（${D} 米），用了 ${D} ÷ ${Sv} = ${qHTML(D, Sv)} 分。这时甲走了 <span class="k1">${v1} × ${qHTML(D, Sv)} = ${qHTML(v1 * D, Sv)}</span> 米。`;
      else if (near(t, t2)) txt = `<b>第 2 次相遇：</b>两人合走了 <b>3 个全程</b>（${3 * D} 米），用时是第 1 次的 3 倍：${qHTML(D, Sv)} × 3 = ${qHTML(3 * D, Sv)} 分。<br>甲走的路也是第 1 次的 3 倍：<span class="k1">${qHTML(v1 * D, Sv)} × 3 = ${qHTML(3 * v1 * D, Sv)}</span> 米，离 A 地 ${qHTML(m2n, Sv)} 米、离 B 地 ${qHTML(D * Sv - m2n, Sv)} 米。`;
      else if (t < t1) txt = t === 0 ? `甲从 A、乙从 B 同时出发相向而行，全程 ${D} 米。` : `两人合走了 ${fmt(sum)} 米，还不到 1 个全程。`;
      else txt = `相遇后两人继续走，各自走到对方的出发点再折回。现在合走了 ${fmt(sum)} 米 ${near(sum * 100 / D, Math.round(sum * 100 / D)) ? '=' : '≈'} <b>${fmt(sum / D)}</b> 个全程。第 2 次相遇时会是几个全程？`;
      read.innerHTML = txt;
    }
  };

  // ───────────── 追及问题：线段图 ─────────────
  A.o_chase_line = function (el) {
    const W = 460, Hh = 200, x0 = 30, x1 = 440, yL = 82;
    const svg = stage(el, W, Hh);
    S('line', { x1: x0, x2: x1, y1: yL, y2: yL, class: 'smuted' }, svg);
    const g = S('g', {}, svg);
    const pA = pin(svg, '甲', 1), pB = pin(svg, '乙', 2, true);
    const read = H('p', { class: 'anim-read' }, el);
    let v1 = 60, v2 = 100, d = 200, Tc = 5;
    const pl = player(el, { max: Tc, unit: ' 分', onTime: draw });
    const c2 = ctrl(el);
    slider(c2, 'ocv1', '甲（前）每分', 40, 80, 10, v1, (v) => { v1 = v; reset(); });
    slider(c2, 'ocv2', '乙（后）每分', 50, 120, 10, v2, (v) => { v2 = v; reset(); });
    slider(c2, 'ocd', '开始相距', 100, 400, 50, d, (v) => { d = v; reset(); });
    H('p', { class: 'anim-tip' }, el, '甲在前、乙在后，同时向右走。下面的长条是“开始相距的路”，绿色部分是乙已经追回来的。');
    const ok = () => v2 > v1;
    function reset() { Tc = ok() ? d / (v2 - v1) : 6; pl.reset(Tc, []); }
    function draw(t) {
      g.innerHTML = '';
      const L = ok() ? v2 * Tc : Math.max(d + v1 * Tc, v2 * Tc);
      const sc = (x1 - x0) / L, X = (s) => x0 + s * sc;
      const pa = d + v1 * t, pbx = v2 * t, caught = ok() && near(t, Tc);
      S('line', { x1: X(0), x2: X(0), y1: yL - 8, y2: yL + 8, class: 'sstrong' }, g);
      T(g, X(0) + 3, yL - 12, '乙出发处', 'ts tm', 'start');
      S('line', { x1: X(d), x2: X(d), y1: yL - 8, y2: yL + 8, class: 'sstrong' }, g);
      S('line', { x1: X(d), x2: X(pa), y1: yL, y2: yL, class: 's1 thick round' }, g);
      S('line', { x1: X(0), x2: X(pbx), y1: yL + 4, y2: yL + 4, class: 's2 thick round' }, g);
      const gap = pa - pbx;
      if (!caught && gap > 0) {
        S('path', { d: `M${X(pbx)},${yL - 44} v-6 H${X(pa)} v6`, class: 'bracket' }, g);
        T(g, (X(pbx) + X(pa)) / 2, yL - 56, `相距 ${fmt(gap)} 米`, 'ts tb');
      } else if (caught) T(g, X(pa), yL - 46, '追上了！', 'tb t3');
      // 路程差长条
      const yb = 150, hb = 18, bs = (x1 - x0) / d;
      T(g, x0, yb - 7, `开始相距 ${d} 米：每分钟追回 ${v2} − ${v1} = ${v2 - v1} 米`, 'ts tm', 'start');
      S('rect', { x: x0, y: yb, width: x1 - x0, height: hb, class: 'f1s' }, g);
      if (ok()) {
        for (let k = 0; k < t - 1e-9; k++) {
          const f = Math.min(1, t - k), bx = x0 + k * (v2 - v1) * bs;
          S('rect', { x: bx, y: yb, width: (v2 - v1) * f * bs, height: hb, class: 'f3s' }, g);
          S('line', { x1: bx, x2: bx, y1: yb, y2: yb + hb, class: 'sstrong thin' }, g);
          if (f === 1 && (v2 - v1) * bs >= 30) T(g, bx + ((v2 - v1) * bs) / 2, yb + 13.5, `第${k + 1}分`, 'ts');
        }
      }
      S('rect', { x: x0, y: yb, width: x1 - x0, height: hb, class: 'fnone sline' }, g);
      put(pA, X(pa), yL - 3);
      put(pB, X(pbx), yL + 7);
      if (!ok()) {
        read.innerHTML = `乙每分走 ${v2} 米，不比甲（${v1} 米）快，两人的距离不会缩小，<b>永远追不上</b>。把乙的速度调大一些试试。`;
      } else if (caught) {
        read.innerHTML = `追上了！追及时间 = 路程差 ÷ 速度差 = ${d} ÷ (${v2} − ${v1}) = <b>${qHTML(d, v2 - v1)}</b> 分。<br>乙走了 <span class="k2">${qHTML(v2 * d, v2 - v1)}</span> 米，甲走了 <span class="k1">${qHTML(v1 * d, v2 - v1)}</span> 米，乙比甲多走的正好是开始相距的 <b>${d}</b> 米。`;
      } else if (t === 0) {
        read.innerHTML = `甲在乙前面 ${d} 米，两人同时向右走。乙每分比甲多走 ${v2 - v1} 米，点“播放”看乙怎样一点点追上。`;
      } else {
        read.innerHTML = `第 ${fmt(t)} 分：乙走了 <span class="k2">${fmt(pbx)}</span> 米，甲走了 <span class="k1">${fmt(v1 * t)}</span> 米，乙比甲多走 <b>${fmt((v2 - v1) * t)}</b> 米 = ${v2 - v1} × ${fmt(t)}，还相距 ${fmt(gap)} 米。`;
      }
    }
  };

  // ───────────── 追及问题：环形跑道 ─────────────
  A.o_chase_ring = function (el) {
    const W = 460, Hh = 250, cx = 135, cy = 125, r = 92;
    const svg = stage(el, W, Hh);
    S('circle', { cx, cy, r, class: 'fnone smuted thick' }, svg);
    S('line', { x1: cx, x2: cx, y1: cy - r - 10, y2: cy - r + 10, class: 'sstrong' }, svg);
    T(svg, cx, cy - r - 16, '起点', 'ts tm');
    const g = S('g', {}, svg);
    const ra = S('g', {}, svg), rb = S('g', {}, svg);
    S('circle', { r: 11, class: 'f1' }, ra); T(ra, 0, 4.5, '甲', 'tw tb ts');
    S('circle', { r: 11, class: 'f2' }, rb); T(rb, 0, 4.5, '乙', 'tw tb ts');
    const tx = 260;
    const lines = [0, 1, 2, 3, 4].map((i) => T(svg, tx, 50 + i * 30, '', i === 3 ? 'tb' : '', 'start'));
    const read = H('p', { class: 'anim-read' }, el);
    let v1 = 70, v2 = 30, C = 400, same = true;
    const rel = () => (same ? v1 - v2 : v1 + v2);
    let T1 = C / rel();
    const pl = player(el, { max: 3 * T1, stops: [T1, 2 * T1], unit: ' 分', onTime: draw, dur: 9000 });
    const c2 = ctrl(el);
    const mb = btn(c2, '换成：反向跑', () => { same = !same; mb.textContent = same ? '换成：反向跑' : '换成：同向跑'; reset(); }, 'alt');
    slider(c2, 'orv1', '甲每分', 60, 120, 10, v1, (v) => { v1 = v; reset(); });
    slider(c2, 'orv2', '乙每分', 20, 50, 10, v2, (v) => { v2 = v; reset(); });
    slider(c2, 'orc', '一圈', 300, 600, 100, C, (v) => { C = v; reset(); });
    H('p', { class: 'anim-tip' }, el, '两人从起点同时出发。播放到每一次“追上”（或“相遇”）都会自动暂停。');
    function reset() { T1 = C / rel(); pl.reset(3 * T1, [T1, 2 * T1]); }
    const pos = (s, rr, dir) => {
      const a = -PI / 2 + (dir * 2 * PI * s) / C;
      return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
    };
    function draw(t) {
      g.innerHTML = '';
      const s1 = v1 * t, s2 = v2 * t, k = Math.floor(t / T1 + 1e-6);
      for (let i = 1; i <= k && i <= 3; i++) {
        const p = pos(v1 * T1 * i, r, 1);
        S('circle', { cx: p[0], cy: p[1], r: 6, class: 'f3' }, g);
        const q = pos(v1 * T1 * i, r + 22, 1);
        T(g, q[0], q[1] + 4, String(i), 'ts tb t3');
      }
      put(ra, ...pos(s1, r + 0, 1));
      put(rb, ...pos(s2, r - 0, same ? 1 : -1));
      if (Math.hypot(...pos(s1, r, 1).map((v, i) => v - pos(s2, r, same ? 1 : -1)[i])) < 20) {
        put(ra, ...pos(s1, r + 13, 1));
        put(rb, ...pos(s2, r - 13, same ? 1 : -1));
      }
      const diff = same ? s1 - s2 : s1 + s2;
      lines[0].textContent = `甲跑了 ${fmt(s1)} 米`;
      lines[1].textContent = `乙跑了 ${fmt(s2)} 米`;
      lines[2].textContent = same ? `甲比乙多跑 ${fmt(diff)} 米` : `两人合跑 ${fmt(diff)} 米`;
      lines[3].textContent = `= ${fmt(diff / C)} 圈`;
      lines[4].textContent = same ? `已追上 ${k} 次` : `已相遇 ${k} 次`;
      lines[0].setAttribute('class', 't1');
      lines[1].setAttribute('class', 't2');
      const word = same ? '追上' : '相遇';
      if (k >= 1 && near(t, k * T1)) {
        read.innerHTML = same
          ? `第 ${k} 次追上！甲比乙正好多跑了 <b>${k} 圈</b>（${k * C} 米）。<br>每次追上要多跑 1 圈：追及时间 = 一圈 ÷ 速度差 = ${C} ÷ (${v1} − ${v2}) = <b>${qHTML(C, v1 - v2)}</b> 分。`
          : `第 ${k} 次相遇！两人合起来正好跑了 <b>${k} 圈</b>（${k * C} 米）。<br>每相遇一次合跑 1 圈：相遇时间 = 一圈 ÷ 速度和 = ${C} ÷ (${v1} + ${v2}) = <b>${qHTML(C, v1 + v2)}</b> 分。`;
      } else {
        read.innerHTML = same
          ? `同向跑：甲每分比乙多跑 ${v1} − ${v2} = ${v1 - v2} 米。甲要比乙多跑整整 1 圈，才能从后面再${word}乙。`
          : `反向跑：两人每分合跑 ${v1} + ${v2} = ${v1 + v2} 米。合起来跑满 1 圈，就迎面${word}一次。`;
      }
    }
  };

  // ───────────── 火车过桥 ─────────────
  A.o_train_bridge = function (el) {
    const W = 460, Hh = 236, yR = 100;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const pH = pin(svg, '头', 1), pT = pin(svg, '尾', 3);
    const read = H('p', { class: 'anim-read' }, el);
    let B = 400, L = 200, v = 20, mode = 0;
    const dist = () => (mode ? B - L : B + L);
    const pl = player(el, { max: dist() / v, unit: ' 秒', onTime: draw });
    const c2 = ctrl(el);
    const mb = btn(c2, '换成：完全在桥上', () => { mode = 1 - mode; mb.textContent = mode ? '换成：完全通过' : '换成：完全在桥上'; reset(); }, 'alt');
    slider(c2, 'otb', '桥长', 300, 900, 100, B, (x) => { B = x; reset(); });
    slider(c2, 'otl', '车长', 100, 250, 50, L, (x) => { L = x; reset(); });
    slider(c2, 'otv', '每秒', 10, 30, 5, v, (x) => { v = x; reset(); });
    H('p', { class: 'anim-tip' }, el, '蓝色“头”是车头，绿色“尾”是车尾。下面两条线分别是车头、车尾走过的路——它们一样长。');
    function reset() { pl.reset(dist() / v, []); }
    function train(head, cls, extra) {
      const n = Math.max(2, Math.round(L / 50)), cw = L / n;
      const gg = S('g', extra || {}, g);
      for (let i = 0; i < n; i++) {
        const a = X(head - L + i * cw), b = X(head - L + (i + 1) * cw);
        S('rect', { x: a + 1, y: yR - 20, width: Math.max(1, b - a - 2), height: 17, rx: 3, class: cls }, gg);
      }
      return gg;
    }
    let X = (w) => w;
    function draw(t) {
      g.innerHTML = '';
      const lo = -L - 30, hi = B + L + 30, sc = 440 / (hi - lo);
      X = (w) => 10 + (w - lo) * sc;
      // 地面、桥、河
      S('rect', { x: X(0), y: yR + 8, width: B * sc, height: 44, class: 'f1s' }, g);
      for (let i = 0; i < 4; i++) {
        const wx = X(0) + ((i + 0.5) * B * sc) / 4;
        S('path', { d: `M${wx - 14},${yR + 30} q7,-6 14,0 q7,6 14,0`, class: 'fnone s1 thin' }, g);
      }
      S('line', { x1: 10, x2: X(0), y1: yR, y2: yR, class: 'sstrong' }, g);
      S('line', { x1: X(B), x2: W - 10, y1: yR, y2: yR, class: 'sstrong' }, g);
      S('rect', { x: X(0), y: yR - 2, width: B * sc, height: 8, class: 'fsurf2 sstrong thin' }, g);
      [0.33, 0.67].forEach((f) => S('line', { x1: X(B * f), x2: X(B * f), y1: yR + 6, y2: yR + 52, class: 'sstrong' }, g));
      T(g, X(B / 2), yR + 68, `桥长 ${B} 米`, 'ts tm');
      const h0 = mode ? L : 0, head = h0 + v * t, tail = head - L, done = near(t, dist() / v);
      // 起点、终点位置的虚影
      train(h0, 'fnone smuted dash');
      train(mode ? B : B + L, 'fnone smuted dash');
      train(head, 'f2s s2 thin');
      put(pH, X(head), yR - 22);
      put(pT, X(tail), yR - 22);
      // 车头、车尾走过的路
      const y1 = yR + 90, y2 = yR + 112;
      S('line', { x1: X(h0), x2: X(head), y1, y2: y1, class: 's1 thick round' }, g);
      S('line', { x1: X(h0 - L), x2: X(tail), y1: y2, y2, class: 's3 thick round' }, g);
      T(g, 12, y1 - 6, `车头走了 ${fmt(v * t)} 米`, 'ts t1', 'start');
      T(g, W - 12, y2 + 16, `车尾也走了 ${fmt(v * t)} 米`, 'ts t3', 'end');
      if (done) {
        read.innerHTML = mode
          ? `车头刚到桥尾，整列火车都还在桥上。从“车尾上桥”到现在，车尾走了 <b>桥长 − 车长 = ${B} − ${L} = ${B - L}</b> 米。<br>时间 = ${B - L} ÷ ${v} = <b>${qHTML(B - L, v)}</b> 秒。`
          : `车尾离开桥了！看车尾：它从桥前 ${L} 米处一直走到桥尾，走了 <b>桥长 + 车长 = ${B} + ${L} = ${B + L}</b> 米。<br>时间 = ${B + L} ÷ ${v} = <b>${qHTML(B + L, v)}</b> 秒。`;
      } else if (t === 0) {
        read.innerHTML = mode
          ? `<b>完全在桥上：</b>从车尾刚上桥开始，到车头刚要离开桥为止。车长 ${L} 米，桥长 ${B} 米。`
          : `<b>完全通过：</b>从车头刚上桥开始，到车尾离开桥为止。车长 ${L} 米，桥长 ${B} 米，每秒行 ${v} 米。`;
      } else {
        read.innerHTML = `第 ${fmt(t)} 秒：车头走了 ${v} × ${fmt(t)} = <span class="k1">${fmt(v * t)}</span> 米，车尾也走了同样多。盯住${mode ? '车头，看它什么时候到桥尾' : '车尾，看它什么时候离开桥'}。`;
      }
    }
  };

  // ───────────── 火车错车与超车 ─────────────
  A.o_train_pass = function (el) {
    const W = 460, Hh = 215, yA = 70, yB = 125;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let L1 = 200, L2 = 200, v1 = 15, v2 = 25, mode = 0;
    const rel = () => (mode ? v2 - v1 : v1 + v2);
    const Tt = () => (L1 + L2) / rel();
    const pl = player(el, { max: Tt(), unit: ' 秒', onTime: draw });
    const c2 = ctrl(el);
    const mb = btn(c2, '换成：同向超车', () => { mode = 1 - mode; mb.textContent = mode ? '换成：相向错车' : '换成：同向超车'; reset(); }, 'alt');
    slider(c2, 'opl1', '甲车长', 100, 300, 50, L1, (x) => { L1 = x; reset(); });
    slider(c2, 'opl2', '乙车长', 100, 300, 50, L2, (x) => { L2 = x; reset(); });
    slider(c2, 'opv1', '甲每秒', 10, 20, 5, v1, (x) => { v1 = x; reset(); });
    slider(c2, 'opv2', '乙每秒', 25, 40, 5, v2, (x) => { v2 = x; reset(); });
    H('p', { class: 'anim-tip' }, el, '上面是甲车，下面是乙车，圆点是车头。最下面的长条表示“两车车长之和”，看它怎样被一点点走完。');
    function reset() { pl.reset(Tt(), []); }
    function train(tail, head, y, k, name) {
      const a = Math.min(tail, head), b = Math.max(tail, head);
      S('rect', { x: X(a), y: y - 18, width: (b - a) * sc, height: 18, rx: 4, class: `f${k}s s${k} thin` }, g);
      S('circle', { cx: X(head), cy: y - 9, r: 5, class: 'f' + k }, g);
      T(g, X((a + b) / 2), y - 4.5, name, 'ts tb');
      S('line', { x1: X(head), x2: X(head), y1: y - 22, y2: y + 4, class: 's' + k }, g);
      T(g, X(head), y - 26, '头', 'ts t' + k);
      T(g, X(tail), y - 26, '尾', 'ts tm');
    }
    let X = (w) => w, sc = 1;
    function draw(t) {
      g.innerHTML = '';
      const TT = Tt();
      let aT, aH, bT, bH, lo, hi;
      if (!mode) {
        aH = v1 * t; aT = aH - L1; bH = -v2 * t; bT = bH + L2;
        lo = Math.min(-L1, -v2 * TT) - 20; hi = Math.max(L2, v1 * TT) + 20;
      } else {
        aT = v1 * t; aH = aT + L1; bH = v2 * t; bT = bH - L2;
        lo = -L2 - 20; hi = v2 * TT + 20;
      }
      sc = 420 / (hi - lo);
      X = (w) => 20 + (w - lo) * sc;
      S('line', { x1: 10, x2: W - 10, y1: yA + 2, y2: yA + 2, class: 'sline' }, g);
      S('line', { x1: 10, x2: W - 10, y1: yB + 2, y2: yB + 2, class: 'sline' }, g);
      // 方向箭头
      T(g, 14, yA + 18, '甲 →', 'ts t1', 'start');
      T(g, mode ? 14 : W - 14, yB + 18, mode ? '乙 →' : '← 乙', 'ts t2', mode ? 'start' : 'end');
      train(aT, aH, yA, 1, '甲');
      train(bT, bH, yB, 2, '乙');
      // 两车长之和的长条
      const yb = 168, hb = 16, x0 = 20, x1 = 440, bs = (x1 - x0) / (L1 + L2);
      const done = Math.min(L1 + L2, rel() * t);
      S('rect', { x: x0, y: yb, width: L1 * bs, height: hb, class: 'f1s' }, g);
      S('rect', { x: x0 + L1 * bs, y: yb, width: L2 * bs, height: hb, class: 'f2s' }, g);
      S('rect', { x: x0, y: yb + hb - 5, width: done * bs, height: 5, class: 'f3' }, g);
      S('rect', { x: x0, y: yb, width: x1 - x0, height: hb, class: 'fnone sline' }, g);
      T(g, x0, yb - 5, `两车长之和 ${L1} + ${L2} = ${L1 + L2} 米（绿色是已经走完的）`, 'ts tm', 'start');
      T(g, x1, yb + hb + 15, `每秒走完 ${mode ? `${v2} − ${v1}` : `${v1} + ${v2}`} = ${rel()} 米`, 'ts tm', 'end');
      const fin = near(t, TT);
      if (fin) {
        read.innerHTML = mode
          ? `超车完成！乙车车尾刚好越过甲车车头。乙车比甲车多走了 <b>${L1} + ${L2} = ${L1 + L2}</b> 米。<br>时间 = 车长和 ÷ 速度差 = ${L1 + L2} ÷ (${v2} − ${v1}) = <b>${qHTML(L1 + L2, v2 - v1)}</b> 秒。`
          : `错车完成！两车车尾刚好分开。两车合起来走了 <b>${L1} + ${L2} = ${L1 + L2}</b> 米。<br>时间 = 车长和 ÷ 速度和 = ${L1 + L2} ÷ (${v1} + ${v2}) = <b>${qHTML(L1 + L2, v1 + v2)}</b> 秒。`;
      } else if (t === 0) {
        read.innerHTML = mode
          ? `<b>同向超车：</b>乙车车头刚追上甲车车尾。要等乙车车尾越过甲车车头，才算超过。`
          : `<b>相向错车：</b>两车车头刚好相遇。要等两车车尾分开，才算错车完成。`;
      } else {
        read.innerHTML = mode
          ? `第 ${fmt(t)} 秒：乙车比甲车多走了 (${v2} − ${v1}) × ${fmt(t)} = <b>${fmt(rel() * t)}</b> 米，还要多走 ${fmt(L1 + L2 - rel() * t)} 米。`
          : `第 ${fmt(t)} 秒：两车合走了 (${v1} + ${v2}) × ${fmt(t)} = <b>${fmt(rel() * t)}</b> 米，还要合走 ${fmt(L1 + L2 - rel() * t)} 米。`;
      }
    }
  };

  // ───────────── 流水行船：顺水与逆水 ─────────────
  A.o_flow_boat = function (el) {
    const W = 460, Hh = 210, xA = 50, xB = 410, yT = 112, yBot = 178;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const boat = S('g', {}, svg);
    S('path', { d: 'M-20,-4 L20,-4 L13,8 L-13,8 Z', class: 'f2 sstrong thin' }, boat);
    S('rect', { x: -8, y: -14, width: 14, height: 10, rx: 2, class: 'f2s sstrong thin' }, boat);
    const read = H('p', { class: 'anim-read' }, el);
    let vb = 8, vw = 2, D = 60;
    const Td = () => D / (vb + vw), Tu = () => D / (vb - vw);
    const pl = player(el, { max: Td() + Tu(), stops: [Td()], unit: ' 时', onTime: draw, dur: 9000 });
    const c2 = ctrl(el);
    slider(c2, 'ofb', '船速', 4, 10, 1, vb, (x) => { vb = x; reset(); });
    slider(c2, 'ofw', '水速', 1, 3, 1, vw, (x) => { vw = x; reset(); });
    slider(c2, 'ofd', '两港相距', 30, 90, 30, D, (x) => { D = x; reset(); });
    H('p', { class: 'anim-tip' }, el, '船速指船在静水中每小时行几千米，水速指水每小时流几千米。播放到 B 码头会暂停，再点播放看它逆水返回。');
    function reset() { pl.reset(Td() + Tu(), [Td()]); }
    function arrow(y, len, k, label) {
      const ox = 230, x2 = ox + len * 11;
      S('line', { x1: ox, x2, y1: y, y2: y, class: `s${k} thick` }, g);
      const dir = len >= 0 ? 1 : -1;
      S('path', { d: `M${x2 + dir * 6},${y} l${-dir * 9},-6 v12 Z`, class: 'f' + k }, g);
      T(g, 12, y + 4, label, 'ts', 'start');
      T(g, x2 + dir * 12, y + 4, `${Math.abs(len)}`, `ts tb t${k}`, dir > 0 ? 'start' : 'end');
    }
    function draw(t) {
      g.innerHTML = '';
      const down = t <= Td() + 1e-9;
      const sc = (xB - xA) / D;
      const pos = down ? (vb + vw) * t : D - (vb - vw) * (t - Td());
      // 速度箭头
      S('line', { x1: 230, x2: 230, y1: 12, y2: 84, class: 'sline dash' }, g);
      arrow(22, down ? vb : -vb, 2, '船自己划');
      arrow(48, vw, 1, '水流推');
      arrow(74, down ? vb + vw : -(vb - vw), 3, down ? '顺水实际' : '逆水实际');
      // 河
      S('rect', { x: 0, y: yT, width: W, height: yBot - yT, class: 'f1s' }, g);
      S('line', { x1: 0, x2: W, y1: yT, y2: yT, class: 'sstrong' }, g);
      S('line', { x1: 0, x2: W, y1: yBot, y2: yBot, class: 'sstrong' }, g);
      const off = (vw * t * 26) % 50;
      for (let row = 0; row < 2; row++) {
        for (let i = -1; i < 11; i++) {
          const x = i * 50 + off + row * 25, y = yT + 16 + row * 34;
          S('path', { d: `M${x - 6},${y - 5} l6,5 l-6,5`, class: 'fnone s1 thin round' }, g);
        }
      }
      [[xA, 'A 港（上游）'], [xB, 'B 港（下游）']].forEach(([x, lb]) => {
        S('rect', { x: x - 3, y: yT - 14, width: 6, height: 16, class: 'fstrong' }, g);
        T(g, x, yT - 18, lb, 'ts tm');
      });
      T(g, W / 2, yBot + 18, '水流方向 →', 'ts t1');
      put(boat, xA + pos * sc, yT + 30, down ? '' : ' scale(-1,1)');
      let txt;
      if (t === 0) txt = `船从 A 港顺水开往 B 港（两港相距 ${D} 千米），再逆水开回来。`;
      else if (near(t, Td())) txt = `到达 B 港！顺水速度 = 船速 + 水速 = ${vb} + ${vw} = <b>${vb + vw}</b> 千米/时，用了 ${D} ÷ ${vb + vw} = <b>${qHTML(D, vb + vw)}</b> 小时。`;
      else if (down) txt = `顺水：船自己每小时划 ${vb} 千米，水再推它 ${vw} 千米，实际每小时走 <span class="k3">${vb + vw}</span> 千米。已走 ${fmt(pos)} 千米。`;
      else if (near(t, Td() + Tu())) txt = `回到 A 港！逆水速度 = 船速 − 水速 = ${vb} − ${vw} = <b>${vb - vw}</b> 千米/时，用了 ${D} ÷ ${vb - vw} = <b>${qHTML(D, vb - vw)}</b> 小时。<br>顺水比逆水每小时快 ${2 * vw} 千米，正好是 2 个水速。`;
      else txt = `逆水：水往回推，船每小时只能前进 ${vb} − ${vw} = <span class="k3">${vb - vw}</span> 千米。离 A 港还有 ${fmt(pos)} 千米。`;
      read.innerHTML = txt;
    }
  };

  // ───────────── 流水行船：掉草帽（漂流物） ─────────────
  A.o_flow_float = function (el) {
    const W = 460, Hh = 210, yT = 70, yBot = 160;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hat = S('g', {}, svg);
    S('ellipse', { cx: 0, cy: 0, rx: 12, ry: 4, class: 'f3 sstrong thin' }, hat);
    S('path', { d: 'M-6,0 Q0,-12 6,0 Z', class: 'f3 sstrong thin' }, hat);
    const boat = S('g', {}, svg);
    S('path', { d: 'M-20,-4 L20,-4 L13,8 L-13,8 Z', class: 'f2 sstrong thin' }, boat);
    S('rect', { x: -8, y: -14, width: 14, height: 10, rx: 2, class: 'f2s sstrong thin' }, boat);
    const read = H('p', { class: 'anim-read' }, el);
    let vb = 60, vw = 20, m = 6, water = false;
    const pl = player(el, { max: 2 * m, stops: [m], unit: ' 分', onTime: draw, dur: 9000 });
    const c2 = ctrl(el);
    const vbtn = btn(c2, '换成：跟着水漂着看', () => { water = !water; vbtn.textContent = water ? '换成：站在岸上看' : '换成：跟着水漂着看'; draw(cur); }, 'alt');
    slider(c2, 'offb', '船速', 40, 80, 10, vb, (x) => { vb = x; reset(); });
    slider(c2, 'offw', '水速', 10, 30, 10, vw, (x) => { vw = x; reset(); });
    slider(c2, 'offm', '几分后发现', 4, 12, 2, m, (x) => { m = x; reset(); });
    H('p', { class: 'anim-tip' }, el, '船逆水向左开，草帽在第 0 分掉进水里。速度单位都是“米/分”。试试“跟着水漂着看”：水不动了，岸在往后退。');
    let cur = 0;
    function reset() { pl.reset(2 * m, [m]); }
    function draw(t) {
      cur = t;
      g.innerHTML = '';
      const hatW = vw * t;
      const boatW = t <= m ? -(vb - vw) * t : -(vb - vw) * m + (vb + vw) * (t - m);
      const off = water ? vw * t : 0;
      const lo = -vb * m, hi = 2 * vw * m;
      const sc = 380 / (hi - lo), X = (w) => 40 + (w - off - lo) * sc;
      // 河和岸
      S('rect', { x: 0, y: yT, width: W, height: yBot - yT, class: 'f1s' }, g);
      S('line', { x1: 0, x2: W, y1: yT, y2: yT, class: 'sstrong' }, g);
      S('line', { x1: 0, x2: W, y1: yBot, y2: yBot, class: 'sstrong' }, g);
      const step = 50, span = (hi - lo) * 1.6;
      for (let w = Math.floor((lo - span) / step) * step; w <= hi + span; w += step) {
        const x = X(w);
        if (x < -10 || x > W + 10) continue;
        S('path', { d: `M${x},${yT - 4} l-7,-14 h14 Z`, class: 'f3s s3 thin' }, g);
        S('line', { x1: x, x2: x, y1: yT - 4, y2: yT, class: 'sstrong thin' }, g);
      }
      const flowOff = water ? 0 : (vw * t * sc) % 50;
      for (let row = 0; row < 2; row++) {
        for (let i = -1; i < 11; i++) {
          const x = i * 50 + flowOff + row * 25, y = yT + 18 + row * 52;
          S('path', { d: `M${x - 6},${y - 5} l6,5 l-6,5`, class: 'fnone s1 thin round' }, g);
        }
      }
      T(g, W - 10, yBot + 16, water ? '跟着水看：水是“静止”的' : '水流方向 →', 'ts t1', 'end');
      // 掉帽子的地方
      S('line', { x1: X(0), x2: X(0), y1: yT, y2: yBot, class: 'smuted dash thin' }, g);
      T(g, X(0), yBot + 16, '掉帽处', 'ts tm');
      const yW = yT + 45;
      put(hat, X(hatW), yW + 4);
      put(boat, X(boatW), yW, t <= m ? ' scale(-1,1)' : '');
      const gap = Math.abs(hatW - boatW);
      if (gap > 1e-6) {
        S('path', { d: `M${X(boatW)},${yBot + 26} v6 H${X(hatW)} v-6`, class: 'bracket' }, g);
        T(g, (X(boatW) + X(hatW)) / 2, yBot + 46, `相距 ${fmt(gap)} 米`, 'ts tb');
      }
      const pre = water ? `（跟着水看：草帽一动不动，船只用自己的速度 ${vb} 米/分开出去、再开回来。）<br>` : '';
      let txt;
      if (t === 0) txt = `船逆水往上游开时，草帽掉进了水里。船上的人 ${m} 分钟后才发现，马上调头去追。追回草帽要几分钟？`;
      else if (t < m - 1e-9) txt = `船逆水每分走 ${vb} − ${vw} = ${vb - vw} 米（向左），草帽顺水每分漂 ${vw} 米（向右），两者每分拉开 ${vb - vw} + ${vw} = <b>${vb}</b> 米。`;
      else if (near(t, m)) txt = `第 ${m} 分发现草帽丢了！这时相距 ${vb} × ${m} = <b>${vb * m}</b> 米。调头去追。`;
      else if (near(t, 2 * m)) txt = `追上了！追回也用了 <b>${m}</b> 分钟，和离开草帽的时间一样。水速对船和草帽的影响一样大，互相抵消了。`;
      else txt = `船顺水每分走 ${vb} + ${vw} = ${vb + vw} 米，草帽也往前漂 ${vw} 米，每分追近 ${vb + vw} − ${vw} = <b>${vb}</b> 米。`;
      read.innerHTML = pre + txt;
    }
  };

  // 钟面：返回 set(时针角度, 分针角度)，并画出两针之间较小的夹角
  function clockFace(svg, cx, cy, r) {
    S('circle', { cx, cy, r, class: 'fsurf sstrong' }, svg);
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 * PI) / 180, r1 = i % 5 ? r - 5 : r - 11;
      S('line', { x1: cx + r1 * Math.sin(a), y1: cy - r1 * Math.cos(a), x2: cx + r * Math.sin(a), y2: cy - r * Math.cos(a), class: i % 5 ? 'sline' : 'sstrong' }, svg);
    }
    for (let h = 1; h <= 12; h++) {
      const a = (h * 30 * PI) / 180;
      T(svg, cx + (r - 24) * Math.sin(a), cy - (r - 24) * Math.cos(a) + 5, String(h), 'tb');
    }
    const sector = S('path', { class: 'f2s', style: 'opacity: .75' }, svg);
    const angT = T(svg, 0, 0, '', 'ts tb t2');
    const hh = S('line', { x1: cx, y1: cy, class: 's1 round', style: 'stroke-width: 6' }, svg);
    const mh = S('line', { x1: cx, y1: cy, class: 's2 round', style: 'stroke-width: 4' }, svg);
    S('circle', { cx, cy, r: 5, class: 'fstrong' }, svg);
    const P = (deg, rr) => [cx + rr * Math.sin((deg * PI) / 180), cy - rr * Math.cos((deg * PI) / 180)];
    return {
      P,
      set(ha, ma) {
        let [x, y] = P(ha, r * 0.52);
        hh.setAttribute('x2', x); hh.setAttribute('y2', y);
        [x, y] = P(ma, r * 0.8);
        mh.setAttribute('x2', x); mh.setAttribute('y2', y);
        let d = (((ha - ma) % 360) + 360) % 360;
        let a1 = ma, sp = d;
        if (d > 180) { a1 = ha; sp = 360 - d; }
        const rr = r * 0.36, p1 = P(a1, rr), p2 = P(a1 + sp, rr);
        sector.setAttribute('d', sp < 0.01 ? '' : `M${cx},${cy} L${p1[0]},${p1[1]} A${rr},${rr} 0 0 1 ${p2[0]},${p2[1]} Z`);
        const pm = P(a1 + sp / 2, rr + 14);
        angT.setAttribute('x', pm[0]); angT.setAttribute('y', pm[1] + 4);
        angT.textContent = sp >= 12 ? `${fmt(sp)}°` : '';
        return sp;
      }
    };
  }

  // ───────────── 钟面：时针分针转动与夹角 ─────────────
  A.o_clock_face = function (el) {
    const W = 460, Hh = 260, cx = 135, cy = 130, r = 115;
    const svg = stage(el, W, Hh);
    const ck = clockFace(svg, cx, cy, r);
    const handle = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const tx = 285;
    const timeT = T(svg, tx, 62, '', 'txl', 'start');
    const l1 = T(svg, tx, 104, '', 't2 tb', 'start');
    const l2 = T(svg, tx, 132, '', 't1 tb', 'start');
    const l3 = T(svg, tx, 168, '', 'tl tb', 'start');
    T(svg, tx, 200, '拖动分针上的圆点', 'ts tm', 'start');
    T(svg, tx, 218, '可以拨动时间', 'ts tm', 'start');
    const read = H('p', { class: 'anim-read' }, el);
    let M = 0;
    const pl = player(el, { max: 720, step: 1, snap: 1, unit: ' 分', label: '从 12:00 起经过', onTime: draw, dur: 36000 });
    const c2 = ctrl(el);
    const add = (k) => pl.set((((Math.round(pl.get()) + k) % 720) + 720) % 720);
    btn(c2, '+1 分', () => add(1), 'alt');
    btn(c2, '+5 分', () => add(5), 'alt');
    btn(c2, '+1 时', () => add(60), 'alt');
    btn(c2, '3:30', () => pl.set(210), 'alt');
    btn(c2, '8:20', () => pl.set(500), 'alt');
    function draw(v) {
      M = ((v % 720) + 720) % 720;
      const h = Math.floor(M / 60), mm = M % 60;
      const ma = 6 * mm, ha = 30 * h + 0.5 * mm;
      const ang = ck.set(ha, ma);
      const hp = ck.P(ma, r * 0.8);
      handle.setAttribute('cx', hp[0]); handle.setAttribute('cy', hp[1]);
      const H12 = h === 0 ? 12 : h, ms = String(mm).padStart(2, '0');
      timeT.textContent = `${H12}:${ms}`;
      l1.textContent = `分针 ${fmt(ma)}°`;
      l2.textContent = `时针 ${fmt(ha)}°`;
      l3.textContent = `夹角 ${fmt(ang)}°`;
      const diff = Math.abs(ha - ma);
      read.innerHTML = `${H12}:${ms}　从 12 开始顺时针量：分针走了 ${mm} 格，6° × ${mm} = <span class="k2">${fmt(ma)}°</span>；时针走了 ${h} 大格又 ${mm} 分，30° × ${h} + 0.5° × ${mm} = <span class="k1">${fmt(ha)}°</span>。<br>两针相差 ${fmt(diff)}°` +
        (diff > 180 ? `，超过 180°，较小的夹角是 360° − ${fmt(diff)}° = <b>${fmt(ang)}°</b>。` : `，夹角就是 <b>${fmt(ang)}°</b>。`);
    }
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const p = svgPoint(svg, ev);
        let a = (Math.atan2(p.x - cx, -(p.y - cy)) * 180) / PI;
        if (a < 0) a += 360;
        const nm = Math.round(a / 6) % 60, curM = M % 60;
        let dlt = nm - curM;
        if (dlt > 30) dlt -= 60;
        if (dlt < -30) dlt += 60;
        if (dlt) pl.set((((M + dlt) % 720) + 720) % 720);
      };
      const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
  };

  // ───────────── 钟面：分针追时针 ─────────────
  A.o_clock_chase = function (el) {
    const W = 460, Hh = 260, cx = 135, cy = 130, r = 105;
    const svg = stage(el, W, Hh);
    const arc = S('path', { class: 'fnone s3 thick round' }, svg);
    const ck = clockFace(svg, cx, cy, r);
    const tx = 270;
    const timeT = T(svg, tx, 44, '', 'tl tb', 'start');
    const evT = [0, 1, 2, 3].map((i) => T(svg, tx, 84 + i * 26, '', 'ts', 'start'));
    T(svg, tx, 200, '绿色弧：分针还落后', 'ts t3', 'start');
    T(svg, tx, 218, '时针多少度', 'ts t3', 'start');
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    H('label', {}, row, '从几点整出发：');
    const sel = H('select', { 'aria-label': '从几点整出发' }, row);
    for (let i = 1; i <= 11; i++) H('option', { value: i }, sel, `${i} 点`);
    let h = 3;
    sel.value = '3';
    const events = () => {
      const out = [];
      [270, 180, 90, 0, -90, -180, -270].forEach((a) => {
        const need = 30 * h - a;
        if (need > 0 && need / 5.5 < 60) {
          const x = Math.abs(a) % 360, ang = Math.min(x, 360 - x);
          out.push({ need, m: need / 5.5, ang, name: ang === 0 ? '重合' : ang === 90 ? '成直角' : '成一直线' });
        }
      });
      return out.sort((p, q) => p.m - q.m);
    };
    const pl = player(el, { max: 60, stops: events().map((e) => e.m), round: 0.1, unit: ' 分', label: '经过', onTime: draw, dur: 15000 });
    sel.addEventListener('change', () => { h = +sel.value; pl.reset(60, events().map((e) => e.m)); });
    H('p', { class: 'anim-tip' }, el, '播放时，每到“重合”“成直角”“成一直线”的时刻会自动暂停，再点播放继续。');
    function draw(m) {
      const ma = 6 * m, ha = 30 * h + 0.5 * m;
      const ang = ck.set(ha, ma);
      const gap = (((ha - ma) % 360) + 360) % 360;
      const rr = r + 10, p1 = ck.P(ma, rr), p2 = ck.P(ma + gap, rr);
      arc.setAttribute('d', gap < 0.05 || gap > 359.95 ? '' : `M${p1[0]},${p1[1]} A${rr},${rr} 0 ${gap > 180 ? 1 : 0} 1 ${p2[0]},${p2[1]}`);
      timeT.textContent = `${h} 点 ${fmt(m)} 分`;
      const evs = events();
      evs.forEach((e, i) => {
        evT[i].textContent = `${m >= e.m - 1e-6 ? '✓' : '○'} ${h}点${mixedText(2 * e.need, 11)}分 ${e.name}`;
        evT[i].setAttribute('class', m >= e.m - 1e-6 ? 'ts tb t3' : 'ts tm');
      });
      for (let i = evs.length; i < 4; i++) evT[i].textContent = '';
      const hit = evs.find((e) => near(m, e.m));
      let txt = `从 ${h}:00 出发时，分针指 12，时针指 ${h}，分针落后时针 30° × ${h} = <b>${30 * h}°</b>。分针每分钟比时针多走 6° − 0.5° = <b>5.5°</b>，就像跑得快的人在追跑得慢的人。`;
      if (hit) {
        txt = `<b>${h} 点 ${mixedHTML(2 * hit.need, 11)} 分，两针${hit.name}！</b>分针一共比时针多走了 ${hit.need}°，<br>时间 = ${hit.need} ÷ 5.5 = ${hit.need * 2} ÷ 11 = ${mixedHTML(2 * hit.need, 11)} 分。`;
      } else if (m > 0) {
        txt = `过了 ${fmt(m)} 分：分针比时针多走了 5.5 × ${fmt(m)} = ${fmt(5.5 * m)}°。现在两针的夹角是 <b>${fmt(ang)}°</b>${gap > 0.05 && gap < 359.95 ? `，分针还落后时针 ${fmt(gap)}°` : ''}。`;
      }
      read.innerHTML = txt;
    }
  };

  // ───────────── 行程中的比例：时间相同，路程比 = 速度比 ─────────────
  A.o_speed_ratio_bars = function (el) {
    const W = 460, Hh = 190, x0 = 30, x1 = 430;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let v1 = 60, v2 = 40, meet = false;
    const TM = 6;
    const pl = player(el, { max: TM, unit: ' 分', onTime: draw, dur: 8000 });
    const c2 = ctrl(el);
    const mb = btn(c2, '换成：相向而行', () => { meet = !meet; mb.textContent = meet ? '换成：同向并排走' : '换成：相向而行'; pl.reset(TM, []); }, 'alt');
    slider(c2, 'osv1', '甲每分', 30, 90, 10, v1, (x) => { v1 = x; pl.reset(TM, []); });
    slider(c2, 'osv2', '乙每分', 30, 90, 10, v2, (x) => { v2 = x; pl.reset(TM, []); });
    H('p', { class: 'anim-tip' }, el, '每一小格是 1 分钟走的路。两人走的时间总是一样长，数一数各有几格、每格多长。');
    function blocks(from, dir, v, t, y, k, sc) {
      for (let i = 0; i < t - 1e-9; i++) {
        const f = Math.min(1, t - i), w = v * f * sc;
        const a = from + dir * i * v * sc, x = dir > 0 ? a : a - w;
        S('rect', { x, y, width: w, height: 22, class: `f${k}s s${k} thin` }, g);
        if (f === 1 && v * sc >= 18) T(g, x + w / 2, y + 15.5, String(v), 'ts');
      }
    }
    function draw(t) {
      g.innerHTML = '';
      const a = v1 / gcd(v1, v2), b = v2 / gcd(v1, v2);
      const d1 = v1 * t, d2 = v2 * t;
      if (!meet) {
        const sc = (x1 - x0) / (Math.max(v1, v2) * TM);
        T(g, x0, 32, '甲', 'tb t1', 'start');
        T(g, x0, 102, '乙', 'tb t2', 'start');
        blocks(x0, 1, v1, t, 40, 1, sc);
        blocks(x0, 1, v2, t, 110, 2, sc);
        S('line', { x1: x0, x2: x0, y1: 36, y2: 138, class: 'sstrong' }, g);
        T(g, x0 + d1 * sc + 6, 56, t > 0 ? `${fmt(d1)} 米` : '', 'ts tb t1', 'start');
        T(g, x0 + d2 * sc + 6, 126, t > 0 ? `${fmt(d2)} 米` : '', 'ts tb t2', 'start');
        T(g, W / 2, 168, `速度比 ${v1} : ${v2} = ${a} : ${b}`, 'tb');
      } else {
        const D = (v1 + v2) * TM, sc = (x1 - x0) / D, y = 70;
        S('line', { x1: x0, x2: x1, y1: y + 11, y2: y + 11, class: 'smuted' }, g);
        T(g, x0, y - 10, 'A（甲出发）', 'ts tm', 'start');
        T(g, x1, y - 10, 'B（乙出发）', 'ts tm', 'end');
        blocks(x0, 1, v1, t, y, 1, sc);
        blocks(x1, -1, v2, t, y, 2, sc);
        if (near(t, TM)) {
          const mx = x0 + d1 * sc;
          S('line', { x1: mx, x2: mx, y1: y - 6, y2: y + 40, class: 's3 thick' }, g);
          T(g, mx, y + 56, '相遇点', 'ts tb t3');
          T(g, (x0 + mx) / 2, y + 40, `${a} 份`, 'tb t1');
          T(g, (mx + x1) / 2, y + 40, `${b} 份`, 'tb t2');
        }
        T(g, W / 2, 168, `全程 ${D} 米，速度比 ${a} : ${b}`, 'tb');
      }
      if (t === 0) read.innerHTML = meet ? '甲从 A、乙从 B 同时出发相向而行。相遇时，两人走的时间一样长。' : '甲、乙同时出发，走同样长的时间。点“播放”。';
      else if (meet && near(t, TM)) read.innerHTML = `相遇了！两人都走了 ${TM} 分钟，甲走 <span class="k1">${fmt(d1)}</span> 米，乙走 <span class="k2">${fmt(d2)}</span> 米，路程比 = ${a} : ${b} = 速度比。<br>相遇点把全程分成 ${a} : ${b}，甲走了全程的 ${window.fr(a, a + b)}，乙走了全程的 ${window.fr(b, a + b)}。`;
      else read.innerHTML = `都走了 ${fmt(t)} 分：甲 <span class="k1">${v1} × ${fmt(t)} = ${fmt(d1)}</span> 米，乙 <span class="k2">${v2} × ${fmt(t)} = ${fmt(d2)}</span> 米。路程比 ${fmt(d1)} : ${fmt(d2)} = <b>${a} : ${b}</b>，不管走多久，都等于速度比。`;
    }
  };

  // ───────────── 行程中的比例：路程相同，时间比 = 速度的反比 ─────────────
  A.o_speed_ratio_time = function (el) {
    const W = 460, Hh = 200, x0 = 40, x1 = 420;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const pA = pin(svg, '甲', 1), pB = pin(svg, '乙', 2);
    const read = H('p', { class: 'anim-read' }, el);
    let v1 = 80, v2 = 40, D = 480;
    const tm = () => Math.max(D / v1, D / v2);
    const pl = player(el, { max: tm(), stops: [Math.min(D / v1, D / v2)], unit: ' 分', onTime: draw, dur: 8000 });
    const c2 = ctrl(el);
    slider(c2, 'otv1', '甲每分', 40, 120, 20, v1, (x) => { v1 = x; reset(); });
    slider(c2, 'otv2', '乙每分', 40, 120, 20, v2, (x) => { v2 = x; reset(); });
    slider(c2, 'otd', '路程', 240, 960, 240, D, (x) => { D = x; reset(); });
    H('p', { class: 'anim-tip' }, el, '两人走同样长的路。每条路下面的小格表示走了几分钟。');
    function reset() { pl.reset(tm(), [Math.min(D / v1, D / v2)]); }
    function draw(t) {
      g.innerHTML = '';
      const sc = (x1 - x0) / D, ts = (x1 - x0) / tm();
      [[v1, 50, 1, pA, '甲'], [v2, 125, 2, pB, '乙']].forEach(([v, y, k, p, nm]) => {
        const tt = D / v, el2 = Math.min(t, tt), s = v * el2;
        S('line', { x1: x0, x2: x1, y1: y, y2: y, class: 'smuted' }, g);
        S('line', { x1: x0, x2: x0 + s * sc, y1: y, y2: y, class: `s${k} thick round` }, g);
        S('line', { x1: x1, x2: x1, y1: y - 8, y2: y + 8, class: 'sstrong' }, g);
        put(p, x0 + s * sc, y - 3);
        // 时间格
        for (let i = 0; i < el2 - 1e-9; i++) {
          const f = Math.min(1, el2 - i);
          S('rect', { x: x0 + i * ts, y: y + 10, width: f * ts, height: 12, class: `f${k}s s${k} thin` }, g);
        }
        T(g, x0 - 8, y + 5, nm, `tb t${k}`, 'end');
        const arrived = t >= tt - 1e-9;
        T(g, x0 + el2 * ts + 6, y + 21, arrived ? `到了！用 ${fmt(tt)} 分` : `${fmt(el2)} 分`, `ts ${arrived ? 'tb t3' : 'tm'}`, 'start');
      });
      T(g, x1, 182, `路程都是 ${D} 米`, 'ts tm', 'end');
      const a = v1 / gcd(v1, v2), b = v2 / gcd(v1, v2);
      const t1 = D / v1, t2 = D / v2;
      if (near(t, tm())) {
        read.innerHTML = `都到了！路程一样，甲用 <span class="k1">${fmt(t1)}</span> 分，乙用 <span class="k2">${fmt(t2)}</span> 分。<br>速度比 ${v1} : ${v2} = <b>${a} : ${b}</b>，时间比 ${fmt(t1)} : ${fmt(t2)} = <b>${b} : ${a}</b>——正好反过来，这叫“成反比”。`;
      } else if (t === 0) {
        read.innerHTML = `甲每分走 ${v1} 米，乙每分走 ${v2} 米，都要走 ${D} 米。谁用的时间少？少多少？`;
      } else {
        read.innerHTML = `第 ${fmt(t)} 分：甲走了 ${fmt(Math.min(D, v1 * t))} 米，乙走了 ${fmt(Math.min(D, v2 * t))} 米。${v1 === v2 ? '两人一样快，会同时到达。' : '走得快的先到，走得慢的用时多。'}`;
      }
    }
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
