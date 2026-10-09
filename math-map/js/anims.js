// 互动动画。每个函数接收一个容器元素，在里面画出 SVG 和控制按钮。
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PI = Math.PI;
  let uid = 0;

  function S(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function H(tag, attrs, parent, html) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'class') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function T(parent, x, y, text, cls, anchor) {
    const t = S('text', { x, y, class: cls || '', 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = text;
    return t;
  }
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  function tween(ms, fn, done) {
    if (RM) ms = 1;
    const t0 = performance.now();
    let stopped = false;
    function f(now) {
      if (stopped) return;
      const t = Math.min(1, (now - t0) / ms);
      fn(ease(t), t);
      if (t < 1) requestAnimationFrame(f);
      else if (done) done();
    }
    requestAnimationFrame(f);
    return () => { stopped = true; };
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (n) => {
    const v = Math.round(n * 100) / 100;
    return (Object.is(v, -0) ? 0 : v).toString().replace('-', '−');
  };
  function stage(el, w, h) {
    return S('svg', { viewBox: `0 0 ${w} ${h}`, class: 'anim-svg', role: 'img' }, el);
  }
  function ctrl(el) { return H('div', { class: 'anim-ctrl' }, el); }
  function btn(parent, label, onclick, cls) {
    const b = H('button', { class: 'abtn' + (cls ? ' ' + cls : ''), type: 'button' }, parent, label);
    b.addEventListener('click', onclick);
    return b;
  }
  function slider(parent, name, label, min, max, step, val, oninput) {
    const id = 'sl-' + name + '-' + (++uid);
    const wrap = H('div', { class: 'aslider' }, parent);
    H('label', { for: id, class: /^[a-zA-Zα-ω]$/.test(label) ? 'var' : '' }, wrap, label);
    const inp = H('input', { id, type: 'range', min, max, step, value: val }, wrap);
    const out = H('output', { for: id }, wrap, fmt(val));
    inp.addEventListener('input', () => { out.textContent = fmt(+inp.value); oninput(+inp.value); });
    return { set(v) { inp.value = v; out.textContent = fmt(v); } };
  }
  function svgPoint(svg, evt) {
    const p = svg.createSVGPoint();
    p.x = evt.clientX; p.y = evt.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  // 坐标网格：返回坐标换算函数
  function grid(svg, size, min, max) {
    const pad = 22, u = (size - 2 * pad) / (max - min);
    const X = (x) => pad + (x - min) * u;
    const Y = (y) => pad + (max - y) * u;
    const g = S('g', {}, svg);
    for (let i = min; i <= max; i++) {
      S('line', { x1: X(i), x2: X(i), y1: Y(min), y2: Y(max), class: i === 0 ? 'axis' : 'gridl' }, g);
      S('line', { y1: Y(i), y2: Y(i), x1: X(min), x2: X(max), class: i === 0 ? 'axis' : 'gridl' }, g);
      if (i !== 0 && i % 2 === 0) {
        T(g, X(i), Y(0) + 15, fmt(i), 'tick');
        T(g, X(0) - 6, Y(i) + 4, fmt(i), 'tick', 'end');
      }
    }
    T(g, X(0) - 8, Y(0) + 15, 'O', 'tick ital');
    T(g, X(max) - 4, Y(0) - 7, 'x', 'tick ital');
    T(g, X(0) + 9, Y(max) + 10, 'y', 'tick ital', 'start');
    const cid = 'clip' + (++uid);
    const cp = S('clipPath', { id: cid }, svg);
    S('rect', { x: X(min), y: Y(max), width: X(max) - X(min), height: Y(min) - Y(max) }, cp);
    return { X, Y, u, clip: `url(#${cid})` };
  }

  const A = {};

  // ── 分数：分饼 ──
  A.fracPie = function (el) {
    const svg = stage(el, 420, 240);
    const cx = 120, cy = 120, r = 100;
    const gS = S('g', {}, svg), gC = S('g', {}, svg);
    S('circle', { cx, cy, r, class: 'stroke-strong', fill: 'none' }, svg);
    const fx = 268;
    const num = T(svg, fx, 100, '1', 'big');
    S('line', { x1: fx - 30, x2: fx + 30, y1: 116, y2: 116, class: 'stroke-strong' }, svg);
    const den = T(svg, fx, 162, '4', 'big');
    T(svg, 305, 94, '← 涂了几份', 'note', 'start');
    T(svg, 305, 156, '← 平均分成几份', 'note', 'start');
    const tip = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 4, on = new Set([0]);
    btn(c, '− 少分一份', () => { if (n > 2) { n--; on = new Set([...on].filter((i) => i < n)); draw(true); } });
    btn(c, '多分一份 +', () => { if (n < 12) { n++; draw(true); } });
    btn(c, '全部涂满', () => { on = new Set([...Array(n).keys()]); draw(false); });
    btn(c, '清空', () => { on.clear(); draw(false); });

    function draw(cut) {
      gS.innerHTML = ''; gC.innerHTML = '';
      for (let i = 0; i < n; i++) {
        const a0 = -PI / 2 + (i * 2 * PI) / n, a1 = a0 + (2 * PI) / n;
        const d = `M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 0 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`;
        const p = S('path', { d, class: 'pie' + (on.has(i) ? ' on' : ''), tabindex: 0, role: 'button', 'aria-label': `第${i + 1}块` }, gS);
        const toggle = () => { on.has(i) ? on.delete(i) : on.add(i); draw(false); };
        p.addEventListener('click', toggle);
        p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        const ln = S('line', { x1: cx, y1: cy, x2: cx, y2: cy, class: 'cut' }, gC);
        const ex = cx + r * Math.cos(a0), ey = cy + r * Math.sin(a0);
        if (cut) {
          setTimeout(() => tween(260, (t) => { ln.setAttribute('x2', lerp(cx, ex, t)); ln.setAttribute('y2', lerp(cy, ey, t)); }), RM ? 0 : i * 70);
        } else { ln.setAttribute('x2', ex); ln.setAttribute('y2', ey); }
      }
      const m = on.size;
      num.textContent = m; den.textContent = n;
      tip.innerHTML = m === n
        ? `全部涂满了！${window.fr(n, n)} = 1，就是一整个圆。`
        : m === 0
          ? `把圆平均分成 ${n} 份。点一块，给它涂上颜色。`
          : `把圆平均分成 <b>${n}</b> 份，涂了其中 <b>${m}</b> 份，涂色部分是这个圆的 ${window.fr(m, n)}。`;
    }
    draw(false);
  };

  // ── 分数墙 ──
  A.fracWall = function (el) {
    const rows = 8, rh = 32, x0 = 64, W = 340;
    const svg = stage(el, 420, rows * rh + 16);
    const g = S('g', {}, svg);
    const guide = S('line', { y1: 4, y2: rows * rh + 10, class: 'guide' }, svg);
    const tip = H('p', { class: 'anim-read' }, el);
    let sel = { n: 2, i: 0 };
    function draw() {
      g.innerHTML = '';
      const v = (sel.i + 1) / sel.n;
      const equal = [];
      for (let n = 1; n <= rows; n++) {
        const y = 8 + (n - 1) * rh, w = W / n;
        T(g, x0 - 10, y + rh / 2 + 3, n === 1 ? '1' : `${n}等份`, 'note', 'end');
        const exact = Math.abs(v * n - Math.round(v * n)) < 1e-9;
        if (exact && n !== sel.n) equal.push([Math.round(v * n), n]);
        for (let i = 0; i < n; i++) {
          const filled = (i + 1) / n <= v + 1e-9;
          const cls = 'brick' + (filled ? (n === sel.n ? ' sel' : exact ? ' eq' : ' part') : '');
          const r = S('rect', { x: x0 + i * w + 1, y, width: w - 2, height: rh - 4, rx: 4, class: cls, tabindex: 0, role: 'button' }, g);
          T(g, x0 + i * w + w / 2, y + rh / 2 + 3, n === 1 ? '1' : `1/${n}`, 'brick-t');
          const pick = () => { sel = { n, i }; draw(); };
          r.addEventListener('click', pick);
          r.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(); });
        }
      }
      const gx = x0 + v * W;
      guide.setAttribute('x1', gx); guide.setAttribute('x2', gx);
      const me = window.fr(sel.i + 1, sel.n);
      tip.innerHTML = equal.length
        ? `${me} 和 ${equal.map(([a, b]) => window.fr(a, b)).join('、')} <b>一样长</b>，它们的大小相等。绿色的块就是和它一样长的。`
        : `${me} 这么长。比一比：其他行的浅色块都比它短。`;
    }
    draw();
  };

  // ── 三角形内角和：撕角拼平角 ──
  A.triTear = function (el) {
    const W = 420, Hh = 300;
    const svg = stage(el, W, Hh);
    let P = [[80, 215], [340, 230], [190, 55]];
    const NAMES = ['A', 'B', 'C'];
    const base = S('line', { x1: 60, x2: 360, y1: 272, y2: 272, class: 'stroke-strong', opacity: 0 }, svg);
    const baseT = T(svg, 210, 293, '三个角拼成一个平角：180°', 'note strong', 'middle');
    baseT.setAttribute('opacity', 0);
    const tri = S('polygon', { class: 'tri' }, svg);
    const wedges = [0, 1, 2].map((i) => S('path', { class: 'wedge w' + (i + 1) }, svg));
    const angT = [0, 1, 2].map(() => T(svg, 0, 0, '', 'angt'));
    const nameT = [0, 1, 2].map((i) => T(svg, 0, 0, NAMES[i], 'vname'));
    const handles = [0, 1, 2].map(() => S('circle', { r: 11, class: 'handle', tabindex: 0 }, svg));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let torn = 0, busy = false;
    const tearBtn = btn(c, '撕下三个角，拼在一起', () => {
      if (busy) return;
      busy = true;
      const from = torn, to = torn ? 0 : 1;
      tween(1400, (t) => { torn = lerp(from, to, t); render(); }, () => {
        busy = false;
        tearBtn.textContent = to ? '把角放回去' : '撕下三个角，拼在一起';
      });
    });
    btn(c, '换一个形状', () => {
      if (torn || busy) return;
      const r = () => Math.random();
      P = [[40 + r() * 100, 180 + r() * 60], [280 + r() * 100, 180 + r() * 60], [80 + r() * 260, 40 + r() * 70]];
      render();
    });

    function angles() {
      return [0, 1, 2].map((i) => {
        const V = P[i], U = P[(i + 1) % 3], Wp = P[(i + 2) % 3];
        let a1 = Math.atan2(U[1] - V[1], U[0] - V[0]);
        const a2 = Math.atan2(Wp[1] - V[1], Wp[0] - V[0]);
        let span = (a2 - a1 + 4 * PI) % (2 * PI);
        if (span > PI) { a1 = a2; span = 2 * PI - span; }
        return { a1, span };
      });
    }
    function render() {
      tri.setAttribute('points', P.map((p) => p.join(',')).join(' '));
      tri.setAttribute('opacity', 1 - 0.6 * torn);
      const an = angles();
      const side = (i, j) => Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]);
      const minSide = Math.min(side(0, 1), side(1, 2), side(2, 0));
      const r = Math.max(18, Math.min(42, minSide * 0.35));
      let deg = an.map((a) => Math.round((a.span * 180) / PI));
      deg[2] = 180 - deg[0] - deg[1];
      let cum = PI;
      const target = [210, 272];
      an.forEach((a, i) => {
        const sp = a.span;
        wedges[i].setAttribute('d', `M0,0 L${r},0 A${r},${r} 0 0 1 ${r * Math.cos(sp)},${r * Math.sin(sp)} Z`);
        let d = cum - a.a1;
        d = ((d + 3 * PI) % (2 * PI)) - PI;
        const rot = a.a1 + d * torn;
        const x = lerp(P[i][0], target[0], torn), y = lerp(P[i][1], target[1], torn);
        wedges[i].setAttribute('transform', `translate(${x},${y}) rotate(${(rot * 180) / PI}) scale(${lerp(1, 56 / r, torn)})`);
        cum += sp;
        const mid = a.a1 + sp / 2;
        angT[i].setAttribute('x', P[i][0] + Math.cos(mid) * (r + 16));
        angT[i].setAttribute('y', P[i][1] + Math.sin(mid) * (r + 16) + 5);
        angT[i].textContent = deg[i] + '°';
        angT[i].setAttribute('opacity', 1 - torn);
        nameT[i].setAttribute('x', P[i][0] - Math.cos(mid) * 18);
        nameT[i].setAttribute('y', P[i][1] - Math.sin(mid) * 18 + 5);
        handles[i].setAttribute('cx', P[i][0]); handles[i].setAttribute('cy', P[i][1]);
        handles[i].setAttribute('opacity', torn ? 0 : 1);
      });
      base.setAttribute('opacity', torn); baseT.setAttribute('opacity', torn);
      read.innerHTML = `<span class="k1">∠A = ${deg[0]}°</span> + <span class="k2">∠B = ${deg[1]}°</span> + <span class="k3">∠C = ${deg[2]}°</span> = <b>180°</b>`;
    }
    handles.forEach((h, i) => {
      h.addEventListener('pointerdown', (e) => {
        if (torn || busy) return;
        e.preventDefault();
        h.setPointerCapture(e.pointerId);
        const move = (ev) => {
          const p = svgPoint(svg, ev);
          P[i] = [Math.max(20, Math.min(W - 20, p.x)), Math.max(20, Math.min(250, p.y))];
          render();
        };
        const up = () => { h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); };
        h.addEventListener('pointermove', move);
        h.addEventListener('pointerup', up);
      });
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动顶点上的圆点可以改变三角形的形状。');
    render();
  };

  // ── 数轴：青蛙跳 ──
  A.frogLine = function (el) {
    const W = 480, Hh = 215, x0 = 240, u = 36, yL = 120, LIM = 6;
    const svg = stage(el, W, Hh);
    const X = (v) => x0 + v * u;
    S('line', { x1: 8, x2: W - 6, y1: yL, y2: yL, class: 'stroke-strong' }, svg);
    S('path', { d: `M${W - 4},${yL} l-11,-6 v12 Z`, class: 'fill-strong' }, svg);
    T(svg, W - 8, yL - 14, '正方向 →', 'note', 'end');
    for (let v = -LIM; v <= LIM; v++) {
      S('line', { x1: X(v), x2: X(v), y1: yL - 6, y2: yL + 6, class: 'stroke-strong' }, svg);
      T(svg, X(v), yL + 24, fmt(v), v === 0 ? 'tick lg strong' : 'tick lg');
    }
    T(svg, X(0), yL + 42, '原点', 'note');
    const absG = S('g', {}, svg);
    const absPath = S('path', { class: 'bracket' }, absG);
    const absT = T(absG, 0, yL + 82, '', 'note strong');
    const oppG = S('g', { opacity: 0 }, svg);
    const oppArc = S('path', { class: 'opparc' }, oppG);
    const trail = S('path', { class: 'trail' }, svg);
    function frog(parent, cls) {
      const g = S('g', { class: cls }, parent);
      S('ellipse', { cx: 0, cy: 0, rx: 15, ry: 11, class: 'frog-body' }, g);
      S('circle', { cx: -6, cy: -10, r: 5, class: 'frog-eye' }, g);
      S('circle', { cx: 6, cy: -10, r: 5, class: 'frog-eye' }, g);
      S('circle', { cx: -6, cy: -10, r: 2.2, class: 'frog-pupil' }, g);
      S('circle', { cx: 6, cy: -10, r: 2.2, class: 'frog-pupil' }, g);
      S('path', { d: 'M-6,2 Q0,6 6,2', class: 'frog-mouth' }, g);
      return g;
    }
    const ghost = frog(oppG, 'ghost');
    const fg = frog(svg, '');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let v = 0, busy = false, showOpp = false;
    const place = (g, x, y) => g.setAttribute('transform', `translate(${x},${y})`);
    const sgn = (n) => (n < 0 ? `(−${-n})` : `${n}`);
    let eq = '';
    function update() {
      place(fg, X(v), yL - 14);
      const d = Math.abs(v);
      absPath.setAttribute('d', v === 0 ? '' : `M${X(0)},${yL + 54} v8 H${X(v)} v-8`);
      absT.setAttribute('x', (X(0) + X(v)) / 2);
      absT.textContent = v === 0 ? '' : `距离 ${d}，所以 |${fmt(v)}| = ${d}`;
      place(ghost, X(-v), yL - 14);
      const top = yL - 40 - d * 6;
      oppArc.setAttribute('d', v === 0 ? '' : `M${X(v)},${yL - 30} Q${X(0)},${top - 30} ${X(-v)},${yL - 30}`);
      oppG.setAttribute('opacity', showOpp && v !== 0 ? 1 : 0);
      let txt = `青蛙在 <b>${fmt(v)}</b>。${eq ? '刚才：' + eq + '。' : ''}`;
      if (showOpp) txt += v === 0 ? ' 0 的相反数还是 0。' : ` 影子青蛙在 <b>${fmt(-v)}</b>：${fmt(v)} 和 ${fmt(-v)} 互为相反数，到原点的距离都是 ${d}。`;
      read.innerHTML = txt;
    }
    function jump(dlt) {
      if (busy) return;
      const to = v + dlt;
      if (to < -LIM || to > LIM) { read.innerHTML = '再跳就出界啦，换个方向试试。'; return; }
      busy = true;
      const from = v, h = 26 + Math.abs(dlt) * 9;
      trail.setAttribute('d', `M${X(from)},${yL - 4} Q${(X(from) + X(to)) / 2},${yL - 4 - 2 * h} ${X(to)},${yL - 4}`);
      tween(380 + Math.abs(dlt) * 110, (t, raw) => {
        const x = lerp(X(from), X(to), raw);
        const y = yL - 14 - h * 4 * raw * (1 - raw);
        place(fg, x, y);
      }, () => {
        v = to; busy = false;
        eq = `${sgn(from)} ${dlt > 0 ? '+' : '−'} ${Math.abs(dlt)} = ${fmt(to)}`;
        update();
      });
    }
    btn(c, '← 向左跳 3', () => jump(-3));
    btn(c, '← 向左跳 1', () => jump(-1));
    btn(c, '向右跳 1 →', () => jump(1));
    btn(c, '向右跳 3 →', () => jump(3));
    btn(c, '看相反数', () => { showOpp = !showOpp; update(); }, 'alt');
    btn(c, '回到原点', () => { if (!busy) { v = 0; eq = ''; trail.setAttribute('d', ''); update(); } }, 'alt');
    update();
  };

  // ── 勾股定理：三个正方形 ──
  A.pythSquares = function (el) {
    const W = 420, Hh = 340;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 3, b = 4;
    slider(c, 'pa', 'a', 1, 8, 1, a, (v) => { a = v; draw(); });
    slider(c, 'pb', 'b', 1, 8, 1, b, (v) => { b = v; draw(); });
    function draw() { drawShapes(); readout(); }
    function drawShapes() {
      g.innerHTML = '';
      const cc = Math.hypot(a, b);
      const sc = Math.min((W - 30) / (a + 2 * b), (Hh - 30) / (2 * a + b));
      const ox = 15 + b * sc + ((W - 30) - (a + 2 * b) * sc) / 2;
      const oy = 15 + (a + b) * sc + ((Hh - 30) - (2 * a + b) * sc) / 2;
      const P = (x, y) => [ox + x * sc, oy + y * sc];
      function square(p0, d1, d2, side, cls, label) {
        const q = [p0, [p0[0] + d1[0] * side, p0[1] + d1[1] * side], [p0[0] + (d1[0] + d2[0]) * side, p0[1] + (d1[1] + d2[1]) * side], [p0[0] + d2[0] * side, p0[1] + d2[1] * side]];
        S('polygon', { points: q.map((p) => P(...p).join(',')).join(' '), class: 'sq ' + cls }, g);
        for (let k = 1; k < side - 1e-9; k++) {
          const s1 = [p0[0] + d1[0] * k, p0[1] + d1[1] * k], s2 = [p0[0] + d2[0] * k, p0[1] + d2[1] * k];
          S('line', { x1: P(...s1)[0], y1: P(...s1)[1], x2: P(s1[0] + d2[0] * side, s1[1] + d2[1] * side)[0], y2: P(s1[0] + d2[0] * side, s1[1] + d2[1] * side)[1], class: 'cell' }, g);
          S('line', { x1: P(...s2)[0], y1: P(...s2)[1], x2: P(s2[0] + d1[0] * side, s2[1] + d1[1] * side)[0], y2: P(s2[0] + d1[0] * side, s2[1] + d1[1] * side)[1], class: 'cell' }, g);
        }
        const cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2;
        const t = T(g, P(cx, cy)[0], P(cx, cy)[1] + 5, label, 'area');
        t.style.fontSize = Math.max(11, Math.min(18, side * sc * 0.22)) + 'px';
      }
      square([0, 0], [1, 0], [0, 1], a, 'sa', `a² = ${a * a}`);
      square([0, 0], [0, -1], [-1, 0], b, 'sb', `b² = ${b * b}`);
      square([0, -b], [a / cc, b / cc], [b / cc, -a / cc], cc, 'sc', `c² = ${fmt(a * a + b * b)}`);
      S('polygon', { points: [P(0, 0), P(a, 0), P(0, -b)].map((p) => p.join(',')).join(' '), class: 'rtri' }, g);
      const ra = 0.5 * Math.min(1, a, b) * sc * 0.6;
      S('path', { d: `M${P(0, 0)[0] + ra},${P(0, 0)[1]} v${-ra} h${-ra}`, class: 'rmark' }, g);
    }
    function readout() {
      const s = a * a + b * b, cc = Math.sqrt(s);
      const cTxt = Number.isInteger(cc) ? `${cc}` : `√${s} ≈ ${fmt(cc)}`;
      read.innerHTML = `<span class="k1"><i>a</i><sup>2</sup> = ${a * a}</span> + <span class="k2"><i>b</i><sup>2</sup> = ${b * b}</span> = <span class="k3"><i>c</i><sup>2</sup> = ${s}</span>，所以斜边 <i>c</i> = ${cTxt}`;
    }
    draw();
  };

  // ── 勾股定理：拼图证明 ──
  A.pythProof = function (el) {
    const Wd = 340;
    const svg = stage(el, Wd, Wd);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 2, b = 3, st = 0, busy = false;
    const sw = btn(c, '换一种拼法', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st ? 0 : 1;
      tween(1300, (t) => { st = lerp(from, to, t); render(); }, () => { busy = false; render(); });
    });
    slider(c, 'qa', 'a', 1, 5, 0.5, a, (v) => { a = v; render(); });
    slider(c, 'qb', 'b', 1, 5, 0.5, b, (v) => { b = v; render(); });
    function render() {
      g.innerHTML = '';
      const s = a + b, pad = 20, sc = (Wd - 2 * pad) / s;
      const P = (x, y) => `${pad + x * sc},${pad + y * sc}`;
      S('rect', { x: pad, y: pad, width: s * sc, height: s * sc, class: 'frame' }, g);
      const h1 = S('g', { opacity: 1 - st }, g);
      S('polygon', { points: [P(a, 0), P(s, a), P(b, s), P(0, b)].join(' '), class: 'sq sc' }, h1);
      T(h1, pad + (s / 2) * sc, pad + (s / 2) * sc + 7, 'c²', 'area big2');
      const h2 = S('g', { opacity: st }, g);
      S('rect', { x: pad, y: pad, width: a * sc, height: a * sc, class: 'sq sa' }, h2);
      S('rect', { x: pad + a * sc, y: pad + a * sc, width: b * sc, height: b * sc, class: 'sq sb' }, h2);
      T(h2, pad + (a / 2) * sc, pad + (a / 2) * sc + 7, 'a²', 'area big2');
      T(h2, pad + (a + b / 2) * sc, pad + (a + b / 2) * sc + 7, 'b²', 'area big2');
      const tris = [
        [[0, 0], [0, a], 0], [[s, 0], [s, 0], 90], [[s, s], [a, s], 180], [[0, s], [a, a], 270]
      ];
      tris.forEach(([p1, p2, rot], i) => {
        const tx = pad + lerp(p1[0], p2[0], st) * sc, ty = pad + lerp(p1[1], p2[1], st) * sc;
        S('polygon', { points: `0,0 ${a * sc},0 0,${b * sc}`, class: 'ptri t' + (i % 2), transform: `translate(${tx},${ty}) rotate(${rot})` }, g);
      });
      if (st === 0) read.innerHTML = `大正方形 = 4 个直角三角形 + 中间的正方形 <span class="k3"><i>c</i><sup>2</sup></span>`;
      else if (st === 1) read.innerHTML = `大正方形 = 4 个直角三角形 + <span class="k1"><i>a</i><sup>2</sup></span> + <span class="k2"><i>b</i><sup>2</sup></span>。<br>两种拼法去掉同样的 4 个三角形，剩下的面积相等：<b><i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> = <i>c</i><sup>2</sup></b>`;
      else read.innerHTML = '三角形正在移动……';
      sw.textContent = st >= 0.5 ? '换回拼法一' : '换成拼法二';
    }
    render();
  };

  // ── 一次函数 ──
  A.linePlot = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const line = S('line', { class: 'fline', 'clip-path': G.clip }, svg);
    const marks = S('g', {}, svg);
    const dots = S('g', {}, svg);
    const tbl = H('div', { class: 'tbl-wrap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let k = 2, b = 1, busy = false;
    const sk = slider(c, 'lk', 'k', -3, 3, 0.5, k, (v) => { k = v; draw(false); });
    slider(c, 'lb', 'b', -5, 5, 1, b, (v) => { b = v; draw(false); });
    btn(c, '描点连线', () => draw(true));
    const lin = () => {
      if (k === 0) return `<i>y</i> = ${fmt(b)}`;
      const kx = k === 1 ? '' : k === -1 ? '−' : fmt(k);
      const bs = b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${-b}`;
      return `<i>y</i> = ${kx}<i>x</i>${bs}`;
    };
    function draw(animate) {
      if (busy) return;
      const f = (x) => k * x + b;
      line.setAttribute('x1', G.X(-7)); line.setAttribute('y1', G.Y(f(-7)));
      line.setAttribute('x2', G.X(7)); line.setAttribute('y2', G.Y(f(7)));
      dots.innerHTML = ''; marks.innerHTML = '';
      const xs = [-2, -1, 0, 1, 2];
      tbl.innerHTML = `<table class="mini vals"><tr><th><i>x</i></th>${xs.map((x) => `<td>${fmt(x)}</td>`).join('')}</tr><tr><th><i>y</i></th>${xs.map((x, i) => `<td data-i="${i}">${fmt(f(x))}</td>`).join('')}</tr></table>`;
      const ds = xs.map((x) => S('circle', { cx: G.X(x), cy: G.Y(f(x)), r: 5, class: 'dot', 'clip-path': G.clip }, dots));
      if (b >= -6 && b <= 6) S('circle', { cx: G.X(0), cy: G.Y(b), r: 6, class: 'mark-y' }, marks);
      if (k !== 0 && Math.abs(-b / k) <= 6) S('circle', { cx: G.X(-b / k), cy: G.Y(0), r: 6, class: 'mark-x' }, marks);
      if (animate) {
        busy = true;
        const len = Math.hypot(G.X(7) - G.X(-7), G.Y(f(7)) - G.Y(f(-7)));
        line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
        ds.forEach((d) => d.setAttribute('opacity', 0));
        marks.setAttribute('opacity', 0);
        const cells = tbl.querySelectorAll('td[data-i]');
        ds.forEach((d, i) => setTimeout(() => {
          cells.forEach((cc) => cc.classList.remove('hot'));
          cells[i].classList.add('hot');
          tween(250, (t) => { d.setAttribute('opacity', t); d.setAttribute('r', 5 + 6 * (1 - t)); });
        }, RM ? 0 : i * 380));
        setTimeout(() => tween(900, (t) => { line.style.strokeDashoffset = len * (1 - t); }, () => {
          line.style.strokeDasharray = ''; line.style.strokeDashoffset = '';
          marks.setAttribute('opacity', 1); busy = false;
          cells.forEach((cc) => cc.classList.remove('hot'));
        }), RM ? 0 : xs.length * 380 + 100);
      } else { line.style.strokeDasharray = ''; marks.setAttribute('opacity', 1); }
      // 文字说明
      if (k === 0) {
        read.innerHTML = `${lin()}：<i>k</i> = 0 时不是一次函数，图象是一条水平直线。把 <i>k</i> 拖离 0 试试。`;
        return;
      }
      const q = [];
      if (k > 0 || b > 0) q.push('一');
      if (k < 0 || b > 0) q.push('二');
      if (k > 0 || b < 0) q.push('三');
      if (k < 0 || b < 0) q.push('四');
      const xi = -b / k;
      read.innerHTML = `<b>${lin()}</b><br>
        <i>k</i> ${k > 0 ? '&gt; 0：从左往右<b>上升</b>，<i>y</i> 随 <i>x</i> 增大而增大' : '&lt; 0：从左往右<b>下降</b>，<i>y</i> 随 <i>x</i> 增大而减小'}。<br>
        <span class="k2">与 <i>y</i> 轴交于 (0, ${fmt(b)})</span>，<span class="k1">与 <i>x</i> 轴交于 (${fmt(xi)}, 0)</span>。经过第${q.join('、')}象限。${b === 0 ? '<br><i>b</i> = 0，这是正比例函数，图象经过原点。' : ''}`;
    }
    draw(false);
    void sk;
  };

  // ── 二次函数 ──
  A.parabola = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const ghost = S('path', { class: 'ghostp', 'clip-path': G.clip }, svg);
    const axisL = S('line', { class: 'symaxis', 'clip-path': G.clip }, svg);
    const curve = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const roots = S('g', {}, svg);
    const vtx = S('circle', { r: 6, class: 'mark-y' }, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 1, h = 2, k = -3, busy = false;
    const sa = slider(c, 'pa', 'a', -2, 2, 0.25, a, (v) => { a = v === 0 ? 0.25 : v; if (v === 0) sa.set(0.25); cap.textContent = ''; draw(a, h, k); });
    const sh = slider(c, 'ph', 'h', -4, 4, 0.5, h, (v) => { h = v; cap.textContent = ''; draw(a, h, k); });
    const sk = slider(c, 'pk', 'k', -5, 5, 0.5, k, (v) => { k = v; cap.textContent = ''; draw(a, h, k); });
    btn(c, '从 y = x² 变过来', () => {
      if (busy) return;
      busy = true;
      const steps = [
        ['第一步：改变 a，开口' + (a > 0 ? '向上' : '向下') + (Math.abs(a) > 1 ? '，并且变窄' : Math.abs(a) < 1 ? '，并且变宽' : ''), (t) => [lerp(1, a, t), 0, 0]],
        [`第二步：向${h >= 0 ? '右' : '左'}平移 ${fmt(Math.abs(h))} 个单位`, (t) => [a, lerp(0, h, t), 0]],
        [`第三步：向${k >= 0 ? '上' : '下'}平移 ${fmt(Math.abs(k))} 个单位`, (t) => [a, h, lerp(0, k, t)]]
      ];
      let i = 0;
      const next = () => {
        if (i >= steps.length) { busy = false; cap.textContent = '完成！顶点从 (0, 0) 移到了 (' + fmt(h) + ', ' + fmt(k) + ')。'; draw(a, h, k); return; }
        const [txt, fn] = steps[i++];
        cap.textContent = txt;
        tween(1000, (t) => draw(...fn(t)), () => setTimeout(next, RM ? 0 : 300));
      };
      draw(1, 0, 0);
      setTimeout(next, RM ? 0 : 400);
    });
    const pathOf = (A2, H2, K2) => {
      let d = '';
      for (let x = -7; x <= 7.001; x += 0.05) {
        const y = A2 * (x - H2) ** 2 + K2;
        const yy = Math.max(-50, Math.min(50, y));
        d += (d ? 'L' : 'M') + G.X(x).toFixed(1) + ',' + G.Y(yy).toFixed(1);
      }
      return d;
    };
    ghost.setAttribute('d', pathOf(1, 0, 0));
    const term = (coef, v, first) => {
      if (coef === 0) return '';
      const abs = Math.abs(coef), sign = coef < 0 ? (first ? '−' : ' − ') : first ? '' : ' + ';
      const num = v && abs === 1 ? '' : fmt(abs);
      return sign + num + v;
    };
    function draw(A2, H2, K2) {
      curve.setAttribute('d', pathOf(A2, H2, K2));
      axisL.setAttribute('x1', G.X(H2)); axisL.setAttribute('x2', G.X(H2));
      axisL.setAttribute('y1', G.Y(7)); axisL.setAttribute('y2', G.Y(-7));
      vtx.setAttribute('cx', G.X(H2)); vtx.setAttribute('cy', G.Y(Math.max(-6.3, Math.min(6.3, K2))));
      roots.innerHTML = '';
      const B = -2 * A2 * H2, C = A2 * H2 * H2 + K2, D = B * B - 4 * A2 * C;
      let rootTxt;
      if (D > 1e-9) {
        const r1 = (-B - Math.sqrt(D)) / (2 * A2), r2 = (-B + Math.sqrt(D)) / (2 * A2);
        [r1, r2].forEach((r) => { if (Math.abs(r) <= 6) S('circle', { cx: G.X(r), cy: G.Y(0), r: 5, class: 'mark-x' }, roots); });
        rootTxt = `Δ &gt; 0，与 <i>x</i> 轴有两个交点：<i>x</i> ≈ ${fmt(Math.min(r1, r2))} 和 ${fmt(Math.max(r1, r2))}`;
      } else if (Math.abs(D) <= 1e-9) {
        S('circle', { cx: G.X(H2), cy: G.Y(0), r: 5, class: 'mark-x' }, roots);
        rootTxt = 'Δ = 0，顶点正好在 <i>x</i> 轴上，只有一个交点';
      } else rootTxt = 'Δ &lt; 0，与 <i>x</i> 轴没有交点';
      const hx = H2 === 0 ? '<i>x</i>' : `(<i>x</i> ${H2 > 0 ? '−' : '+'} ${fmt(Math.abs(H2))})`;
      const aa = A2 === 1 ? '' : A2 === -1 ? '−' : fmt(A2);
      const kk = K2 === 0 ? '' : K2 > 0 ? ` + ${fmt(K2)}` : ` − ${fmt(-K2)}`;
      const gen = term(A2, '<i>x</i><sup>2</sup>', true) + term(B, '<i>x</i>', false) + (Math.abs(C) < 1e-9 ? '' : (C < 0 ? ' − ' : ' + ') + fmt(Math.abs(C)));
      read.innerHTML = `顶点式：<b><i>y</i> = ${aa}${hx}<sup>2</sup>${kk}</b>　一般式：<i>y</i> = ${gen}<br>
        开口<b>${A2 > 0 ? '向上' : '向下'}</b>；<span class="k2">顶点 (${fmt(H2)}, ${fmt(K2)})</span>；对称轴是直线 <i>x</i> = ${fmt(H2)}；
        ${A2 > 0 ? '最小值' : '最大值'}是 ${fmt(K2)}。<br>${rootTxt}。`;
    }
    draw(a, h, k);
    void sh; void sk;
  };

  // ── 概率：抛硬币 / 掷骰子 ──
  A.coinSim = function (el) {
    const W = 440, Hh = 240;
    const svg = stage(el, W, Hh);
    const coinG = S('g', { transform: 'translate(70,90)' }, svg);
    const inner = S('g', {}, coinG);
    const coinShape = S('circle', { r: 42, class: 'coin' }, inner);
    const dieShape = S('rect', { x: -40, y: -40, width: 80, height: 80, rx: 14, class: 'coin die' }, inner);
    dieShape.style.display = 'none';
    const coinT = T(inner, 0, 10, '正', 'coin-t');
    const cnt = T(svg, 70, 170, '', 'note');
    const cnt2 = T(svg, 70, 190, '', 'note');
    // 图表
    const cx0 = 160, cx1 = 425, cy0 = 210, cy1 = 20;
    const CY = (p) => cy0 - p * (cy0 - cy1);
    S('line', { x1: cx0, x2: cx1, y1: cy0, y2: cy0, class: 'stroke-strong' }, svg);
    S('line', { x1: cx0, x2: cx0, y1: cy0, y2: cy1, class: 'stroke-strong' }, svg);
    [0, 0.5, 1].forEach((p) => T(svg, cx0 - 6, CY(p) + 4, String(p), 'tick', 'end'));
    const pLine = S('line', { x1: cx0, x2: cx1, class: 'guide' }, svg);
    const pLab = T(svg, cx1, 0, '', 'note', 'end');
    const poly = S('polyline', { class: 'freq' }, svg);
    const xLab = T(svg, cx1, cy0 + 22, '', 'tick', 'end');
    T(svg, cx0 + 4, cy1 - 6, '频率', 'tick', 'start');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mode = 'coin', n = 0, hit = 0, hist = [], busy = false;
    const P = () => (mode === 'coin' ? 0.5 : 1 / 6);
    const modeBtn = btn(c, '换成骰子', () => {
      if (busy) return;
      mode = mode === 'coin' ? 'die' : 'coin';
      modeBtn.textContent = mode === 'coin' ? '换成骰子' : '换成硬币';
      coinShape.style.display = mode === 'die' ? 'none' : '';
      dieShape.style.display = mode === 'die' ? '' : 'none';
      reset();
    }, 'alt');
    btn(c, '抛 1 次', () => run(1));
    btn(c, '抛 10 次', () => run(10));
    btn(c, '抛 100 次', () => run(100));
    btn(c, '重来', () => { if (!busy) reset(); }, 'alt');
    function face(r) { return mode === 'coin' ? (r ? '正' : '反') : String(r); }
    function once() {
      let r;
      if (mode === 'coin') r = Math.random() < 0.5 ? 1 : 0; else r = 1 + Math.floor(Math.random() * 6);
      const ok = mode === 'coin' ? r === 1 : r === 6;
      n++; if (ok) hit++;
      hist.push(hit / n);
      return r;
    }
    function run(times) {
      if (busy || n >= 3000) return;
      busy = true;
      if (times === 1) {
        let r;
        tween(500, (t) => {
          inner.setAttribute('transform', `scale(${Math.abs(Math.cos(t * PI * 3))},1)`);
          if (t > 0.5 && r === undefined) { r = once(); coinT.textContent = face(r); }
        }, () => { inner.setAttribute('transform', ''); busy = false; drawChart(); });
        return;
      }
      let done = 0;
      const per = Math.max(1, Math.ceil(times / 30));
      const step = () => {
        let r;
        for (let i = 0; i < per && done < times; i++, done++) r = once();
        coinT.textContent = face(r);
        drawChart();
        if (done < times && !RM) requestAnimationFrame(step);
        else if (done < times) step();
        else busy = false;
      };
      step();
    }
    function reset() { n = 0; hit = 0; hist = []; coinT.textContent = mode === 'coin' ? '正' : '6'; drawChart(); }
    function drawChart() {
      const p = P();
      pLine.setAttribute('y1', CY(p)); pLine.setAttribute('y2', CY(p));
      pLab.setAttribute('y', CY(p) - 6);
      pLab.textContent = mode === 'coin' ? '理论概率 1/2' : '理论概率 1/6';
      const N = Math.max(10, hist.length);
      const stepN = Math.max(1, Math.floor(hist.length / 300));
      const pts = [];
      for (let i = 0; i < hist.length; i += stepN) pts.push(`${cx0 + ((i + 1) / N) * (cx1 - cx0)},${CY(hist[i])}`);
      if (hist.length) pts.push(`${cx1 - (1 - hist.length / N) * (cx1 - cx0)},${CY(hist[hist.length - 1])}`);
      poly.setAttribute('points', pts.join(' '));
      xLab.textContent = `试验次数 ${n}`;
      const ev = mode === 'coin' ? '正面朝上' : '掷出 6 点';
      cnt.textContent = `共 ${n} 次`;
      cnt2.textContent = `${ev} ${hit} 次`;
      const fq = n ? hit / n : 0;
      read.innerHTML = n === 0
        ? `还没开始。每抛一次，折线就记录一次“${ev}”的频率。`
        : `${ev} ${hit} 次 ÷ 共 ${n} 次 = 频率 <b>${fmt(fq)}</b>。理论概率是 ${mode === 'coin' ? window.fr(1, 2) : window.fr(1, 6)} ≈ ${fmt(p)}。` +
          (n < 50 ? ' 次数还少，频率会忽高忽低。' : ' 次数越多，频率越贴近概率。');
    }
    reset();
  };

  // ── 概率：树状图 ──
  A.treeDiagram = function (el) {
    const W = 440, Hh = 260;
    const svg = stage(el, W, Hh);
    const R = [44, 130], L1 = [[160, 70, '正'], [160, 190, '反']];
    const L2 = [[280, 40, '正', 0], [280, 100, '反', 0], [280, 160, '正', 1], [280, 220, '反', 1]];
    T(svg, 160, 18, '第一枚', 'note'); T(svg, 280, 18, '第二枚', 'note'); T(svg, 380, 18, '结果', 'note');
    const edge = (x1, y1, x2, y2) => S('path', { d: `M${x1},${y1} L${x2},${y2}`, class: 'tedge', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, svg);
    const node = (x, y, t) => {
      const g = S('g', { opacity: 0 }, svg);
      S('circle', { cx: x, cy: y, r: 16, class: 'tnode' }, g);
      T(g, x, y + 5, t, 'tnode-t');
      return g;
    };
    S('circle', { cx: R[0], cy: R[1], r: 6, class: 'fill-strong' }, svg);
    T(svg, R[0], R[1] + 24, '开始', 'note');
    const e1 = L1.map(([x, y]) => edge(R[0], R[1], x - 16, y));
    const n1 = L1.map(([x, y, t]) => node(x, y, t));
    const e2 = L2.map(([x, y, , p]) => edge(L1[p][0] + 16, L1[p][1], x - 16, y));
    const n2 = L2.map(([x, y, t]) => node(x, y, t));
    const outs = L2.map(([, y, t, p], i) => {
      const g = S('g', { opacity: 0, class: 'tout' }, svg);
      S('rect', { x: 345, y: y - 14, width: 70, height: 28, rx: 8, class: 'tleaf', id: 'leaf' + uid + '-' + i }, g);
      T(g, 380, y + 5, L1[p][2] + t, 'tnode-t');
      return g;
    });
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let stage2 = 0;
    const draw = (paths, nodes) => {
      paths.forEach((p) => tween(500, (t) => p.setAttribute('stroke-dashoffset', 1 - t)));
      setTimeout(() => nodes.forEach((n) => tween(300, (t) => n.setAttribute('opacity', t))), RM ? 0 : 400);
    };
    const stepBtn = btn(c, '画第一层', () => {
      if (stage2 === 0) { draw(e1, n1); stepBtn.textContent = '画第二层'; read.innerHTML = '第一枚硬币：可能是 正，也可能是 反，有 2 种。'; }
      else if (stage2 === 1) { draw(e2, n2); stepBtn.textContent = '列出所有结果'; read.innerHTML = '每一种情况下，第二枚硬币又有 正、反 2 种。'; }
      else if (stage2 === 2) {
        outs.forEach((o) => tween(400, (t) => o.setAttribute('opacity', t)));
        stepBtn.disabled = true;
        read.innerHTML = '一共 2 × 2 = <b>4</b> 种等可能的结果：正正、正反、反正、反反。点下面的事件，看看它包含几种结果。';
        evBox.hidden = false;
      }
      stage2++;
    });
    btn(c, '重画', () => {
      stage2 = 0; stepBtn.disabled = false; stepBtn.textContent = '画第一层'; evBox.hidden = true;
      [...e1, ...e2].forEach((p) => p.setAttribute('stroke-dashoffset', 1));
      [...n1, ...n2, ...outs].forEach((n) => n.setAttribute('opacity', 0));
      outs.forEach((o) => o.classList.remove('hit'));
      read.innerHTML = '一步一步把所有可能的结果画出来。';
    }, 'alt');
    const evBox = H('div', { class: 'anim-ctrl' }, el);
    evBox.hidden = true;
    const EV = [['两枚都是正面', [0]], ['一正一反', [1, 2]], ['至少一枚正面', [0, 1, 2]]];
    EV.forEach(([name, idx]) => btn(evBox, name, () => {
      outs.forEach((o, i) => o.classList.toggle('hit', idx.includes(i)));
      read.innerHTML = `“${name}”包含 <b>${idx.length}</b> 种结果，所以 <i>P</i> = ${window.fr(idx.length, 4)}${idx.length === 2 ? ' = ' + window.fr(1, 2) : ''}。`;
    }, 'alt'));
    read.innerHTML = '一步一步把所有可能的结果画出来。';
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
  // 公共工具，其他动画文件通过 window.AH 使用
  window.AH = { S, H, T, tween, lerp, ease, fmt, stage, ctrl, btn, slider, svgPoint, grid, RM };
})();
