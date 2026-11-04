// 奥数拓展第 1 批动画：植树问题、鸡兔同笼、抽屉原理、鸟头模型、绝对值和的最小值
(function () {
  const { S, H, T, tween: tween0, lerp, fmt, stage, ctrl, btn, slider, svgPoint, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 动画时间 t 限制在 0～1（首帧可能略小于 0）
  const tween = (ms, fn, done) => tween0(ms, (t, raw) => fn(clamp(t, 0, 1), clamp(raw, 0, 1)), done);
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

  // 滑块，额外提供 range(min, max, step, value) 用来改范围
  function slider2(parent, name, label, min, max, step, val, fn) {
    const s = slider(parent, name, label, min, max, step, val, fn);
    const inp = parent.lastElementChild.querySelector('input');
    return {
      set: s.set,
      range(mn, mx, st, v) { inp.min = mn; inp.max = mx; inp.step = st; inp.value = v; s.set(v); }
    };
  }
  // 一组“单选”按钮：选中的实心，其余描边
  function pick(btns, i) { btns.forEach((b, j) => b.classList.toggle('alt', j !== i)); }
  // 可拖动的圆点
  function drag(svg, h, onMove, ok) {
    h.addEventListener('pointerdown', (e) => {
      if (ok && !ok()) return;
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      const move = (ev) => onMove(svgPoint(svg, ev));
      const up = () => {
        h.removeEventListener('pointermove', move);
        h.removeEventListener('pointerup', up);
        h.removeEventListener('pointercancel', up);
      };
      h.addEventListener('pointermove', move);
      h.addEventListener('pointerup', up);
      h.addEventListener('pointercancel', up);
    });
  }
  const pts = (arr) => arr.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const cen = (arr) => [arr.reduce((s, p) => s + p[0], 0) / arr.length, arr.reduce((s, p) => s + p[1], 0) / arr.length];

  // 一棵树：底部在 (x, y)，返回可缩放的内层
  function tree(parent, x, y, r, hot) {
    const g = S('g', { transform: `translate(${x.toFixed(1)},${y.toFixed(1)})` }, parent);
    const inner = S('g', {}, g);
    S('rect', { x: -2, y: -r * 1.1, width: 4, height: r * 1.1, class: 'fmuted' }, inner);
    S('circle', { cx: 0, cy: -r * 1.9, r, class: hot ? 'f2' : 'f3' }, inner);
    return inner;
  }
  function pop(inner, alive) {
    inner.setAttribute('transform', 'scale(0.2)');
    tween(280, (t) => { if (alive()) inner.setAttribute('transform', `scale(${0.2 + 0.8 * t})`); });
  }

  // ════════════════════ 植树问题 ════════════════════

  // ── 一条路上种树：边种边数间隔 ──
  A.o_tree_line = function (el) {
    const W = 480, Hh = 210, X0 = 36, X1 = 444, RY = 122;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el), c2 = ctrl(el), c3 = ctrl(el);
    let L = 20, d = 5, mode = 0, planted = 0, busy = false, gen = 0;
    const NAMES = ['两端都种', '只种一端', '两端都不种'];
    const list = () => {
      const n = L / d, P = [];
      if (mode === 0) for (let i = 0; i <= n; i++) P.push(i);
      else if (mode === 1) for (let i = 0; i < n; i++) P.push(i);
      else for (let i = 1; i < n; i++) P.push(i);
      return P;
    };
    // 每棵树配哪个间隔：两端都种、只种一端配右边的，两端都不种配左边的
    const pairOf = (p) => (mode === 2 ? p - 1 : p < L / d ? p : -1);
    function stop() { gen++; busy = false; }
    const mBtns = NAMES.map((nm, i) => btn(c1, nm, () => { mode = i; stop(); planted = list().length; pick(mBtns, i); draw(false); }, i ? 'alt' : ''));
    btn(c2, '种一棵', () => {
      if (busy) return;
      if (planted >= list().length) planted = 0;
      planted++;
      draw(true);
    });
    btn(c2, '一棵一棵种完', () => {
      if (busy) return;
      if (planted >= list().length) planted = 0;
      busy = true;
      const my = ++gen;
      const step = () => {
        if (my !== gen) return;
        planted++;
        draw(true);
        if (planted < list().length) setTimeout(step, RM ? 0 : 420);
        else busy = false;
      };
      step();
    });
    btn(c2, '拔掉重来', () => { stop(); planted = 0; draw(false); }, 'alt');
    const sd = slider2(c3, 'otd', '间距（米）', 2, 10, 1, d, (v) => {
      d = v;
      L = clamp(Math.round(L / d), 2, 15) * d;
      sL.range(2 * d, 15 * d, d, L);
      stop(); planted = list().length; draw(false);
    });
    const sL = slider2(c3, 'otl', '路长（米）', 2 * d, 15 * d, d, L, (v) => { L = v; stop(); planted = list().length; draw(false); });
    void sd;

    function draw(animLast) {
      g.innerHTML = '';
      const n = L / d, P = list(), step = (X1 - X0) / n, X = (i) => X0 + i * step;
      const r = Math.min(12, step * 0.36);
      const my = gen;
      // 间距标注
      S('path', { d: `M${X(0)},44 v-6 H${X(1)} v6`, class: 'fnone s1' }, g);
      T(g, X(0), 30, `每隔 ${d} 米`, 'ts t1 tb', 'start');
      // 路
      S('rect', { x: X0 - 8, y: RY - 7, width: X1 - X0 + 16, height: 14, rx: 7, class: 'fsurf2 sline' }, g);
      for (let i = 0; i <= n; i++) S('line', { x1: X(i), x2: X(i), y1: RY - 7, y2: RY + 7, class: 'smuted' }, g);
      T(g, X0, RY + 62, '0 米', 'ts tm');
      T(g, X1, RY + 62, L + ' 米', 'ts tm');
      // 间隔
      const paired = new Set();
      P.slice(0, planted).forEach((p) => { const q = pairOf(p); if (q >= 0) paired.add(q); });
      const done = planted === P.length;
      for (let i = 0; i < n; i++) {
        const on = paired.has(i), lone = done && !on;
        S('path', { d: `M${X(i) + 2},${RY + 10} Q${(X(i) + X(i + 1)) / 2},${RY + 32} ${X(i + 1) - 2},${RY + 10}`, class: 'fnone ' + (on ? 's2 thick' : lone ? 's1 dash thick' : 'sline') }, g);
        T(g, (X(i) + X(i + 1)) / 2, RY + 44, String(i + 1), 'ts ' + (on ? 't2 tb' : lone ? 't1 tb' : 'tm'));
      }
      T(g, (X0 + X1) / 2, RY + 62, '间隔', 'ts tm');
      // 树
      P.slice(0, planted).forEach((p, k) => {
        const lone = pairOf(p) < 0;
        const inner = tree(g, X(p), RY - 7, r, lone);
        if (animLast && k === planted - 1) pop(inner, () => my === gen);
      });
      if (done && mode === 0) T(g, X1, 30, '最后这棵没有间隔可配 ↓', 'ts t2 tb', 'end');
      if (done && mode === 2) T(g, X1, 30, '最后这个间隔没有树 ↓', 'ts t1 tb', 'end');
      // 读数
      const rule = [`棵数 = 间隔数 + 1 = ${n} + 1 = ${n + 1}`, `棵数 = 间隔数 = ${n}`, `棵数 = 间隔数 − 1 = ${n} − 1 = ${n - 1}`][mode];
      const pairTxt = mode === 2 ? '每棵树配它<b>左边</b>的间隔' : '每棵树配它<b>右边</b>的间隔';
      let s = `路长 ${L} 米，每隔 ${d} 米种一棵 → 间隔数 = ${L} ÷ ${d} = <span class="k1">${n}</span> 个。<b>${NAMES[mode]}</b>：`;
      if (planted === 0) s += '还没种。点“种一棵”，边种边数间隔。';
      else if (!done) s += `种了 <span class="k3">${planted}</span> 棵，${pairTxt}，配上了 <span class="k2">${paired.size}</span> 个间隔。`;
      else s += [
        `${pairTxt}，最后一棵没有间隔可配，所以 <b>${rule}</b> 棵。`,
        `${pairTxt}，正好一一配完，所以 <b>${rule}</b> 棵。`,
        `${pairTxt}，最后一个间隔没有树，所以 <b>${rule}</b> 棵。`
      ][mode];
      read.innerHTML = s;
    }
    planted = list().length;
    draw(false);
  };

  // ── 围成一圈种树：剪开拉直看看 ──
  A.o_tree_loop = function (el) {
    const W = 480, Hh = 290, CX = 240, CY = 142, R = 102, HALF = 90, LX0 = 34, LX1 = 446, LY = 170;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el), c2 = ctrl(el);
    let sq = false, d = 3, L = 36, planted = 0, u = 0, busy = false, gen = 0;
    function loopPt(s) {
      if (!sq) { const a = -PI / 2 + 2 * PI * s; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; }
      const C = [[CX - HALF, CY - HALF], [CX + HALF, CY - HALF], [CX + HALF, CY + HALF], [CX - HALF, CY + HALF]];
      const k = Math.min(3, Math.floor(s * 4)), f = s * 4 - k, p = C[k], q = C[(k + 1) % 4];
      return [lerp(p[0], q[0], f), lerp(p[1], q[1], f)];
    }
    const pt = (s) => { const p = loopPt(s); return [lerp(p[0], LX0 + (LX1 - LX0) * s, u), lerp(p[1], LY, u)]; };
    const outPt = (s, off) => {
      const p = loopPt(s), N = [[0, -1], [1, 0], [0, 1], [-1, 0]][Math.min(3, Math.floor(s * 4))];
      const dx = sq ? N[0] : p[0] - CX, dy = sq ? N[1] : p[1] - CY, m = Math.hypot(dx, dy) || 1;
      return [lerp(p[0] + (dx / m) * off, LX0 + (LX1 - LX0) * s, u), lerp(p[1] + (dy / m) * off, LY + off + 4, u)];
    };
    function stop() { gen++; busy = false; }
    const shapeBtn = btn(c1, '换成正方形花坛', () => {
      if (busy) return;
      sq = !sq; u = 0; cutBtn.textContent = '剪开拉直看看';
      shapeBtn.textContent = sq ? '换成圆形花坛' : '换成正方形花坛';
      fitL(); planted = L / d; draw(false);
    }, 'alt');
    btn(c1, '种一棵', () => {
      if (busy) return;
      u = 0; cutBtn.textContent = '剪开拉直看看';
      if (planted >= L / d) planted = 0;
      planted++;
      draw(true);
    });
    btn(c1, '一棵一棵种完', () => {
      if (busy) return;
      u = 0; cutBtn.textContent = '剪开拉直看看';
      if (planted >= L / d) planted = 0;
      busy = true;
      const my = ++gen;
      const step = () => {
        if (my !== gen) return;
        planted++;
        draw(true);
        if (planted < L / d) setTimeout(step, RM ? 0 : 300);
        else busy = false;
      };
      step();
    });
    const cutBtn = btn(c1, '剪开拉直看看', () => {
      if (busy) return;
      busy = true;
      planted = L / d;
      const my = ++gen, from = u, to = u > 0.5 ? 0 : 1;
      tween(1300, (t) => { if (my !== gen) return; u = lerp(from, to, t); draw(false); }, () => {
        if (my !== gen) return;
        busy = false; u = to;
        cutBtn.textContent = to ? '再围回去' : '剪开拉直看看';
        draw(false);
      });
    }, 'alt');
    btn(c1, '拔掉重来', () => { stop(); u = 0; cutBtn.textContent = '剪开拉直看看'; planted = 0; draw(false); }, 'alt');
    function fitL() {
      if (sq) { L = clamp(Math.round(L / (4 * d)), 1, 6) * 4 * d; sL.range(4 * d, 24 * d, 4 * d, L); }
      else { L = clamp(Math.round(L / d), 3, 24) * d; sL.range(3 * d, 24 * d, d, L); }
    }
    slider2(c2, 'olp', '间距（米）', 2, 5, 1, d, (v) => { d = v; stop(); u = 0; cutBtn.textContent = '剪开拉直看看'; fitL(); planted = L / d; draw(false); });
    const sL = slider2(c2, 'oll', '周长（米）', 3 * d, 24 * d, d, L, (v) => { L = v; stop(); u = 0; cutBtn.textContent = '剪开拉直看看'; planted = L / d; draw(false); });

    function draw(animLast) {
      g.innerHTML = '';
      const n = L / d, my = gen;
      let dd = '';
      for (let i = 0; i <= 160; i++) { const p = pt(i / 160); dd += (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }
      S('path', { d: dd, class: 'fnone', style: 'stroke: var(--surface2); stroke-width: 14; stroke-linejoin: round' }, g);
      S('path', { d: dd, class: 'fnone smuted' }, g);
      // 间隔
      for (let i = 0; i < n; i++) {
        if (i < planted) {
          let seg = '';
          for (let j = 0; j <= 12; j++) { const p = pt((i + 0.06 + (0.88 * j) / 12) / n); seg += (j ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }
          S('path', { d: seg, class: 'fnone s2 thick round' }, g);
        }
        const q = outPt((i + 0.5) / n, 17);
        T(g, q[0], q[1] + 4, String(i + 1), 'ts ' + (i < planted ? 't2 tb' : 'tm'));
      }
      // 剪开后右端的空位
      if (u > 0.02) {
        const e = pt(1);
        S('circle', { cx: e[0], cy: e[1] - 12, r: 10, class: 'fnone s1 dash', opacity: u }, g);
        if (u > 0.98) T(g, LX1, LY - 40, '这里原来就是第 1 棵树', 'ts t1 tb', 'end');
        const b = pt(0);
        if (u > 0.98) T(g, LX0, LY - 40, '从这里剪开', 'ts tm', 'start');
        S('line', { x1: b[0], x2: b[0], y1: b[1] + 8, y2: b[1] + 16, class: 's1' }, g);
      }
      // 树
      const per = sq ? 4 * HALF * 2 : 2 * PI * R;
      const r = Math.min(10, (per / n) * 0.34);
      for (let i = 0; i < planted; i++) {
        const p = pt(i / n);
        const corner = sq && (i * 4) % n === 0;
        const inner = tree(g, p[0], p[1], r, corner);
        if (animLast && i === planted - 1) pop(inner, () => my === gen);
      }
      // 读数
      const pre = sq ? `正方形花坛每边 ${L / 4} 米，周长 ${L} 米` : `圆形花坛周长 ${L} 米`;
      let s = `${pre}，每隔 ${d} 米种一棵 → 间隔数 = ${L} ÷ ${d} = <span class="k1">${n}</span> 个。`;
      if (u > 0.98) s += `剪开拉直以后，右端那个位置原来就是第 1 棵树，所以右端没有树——变成了“只种一端”：<b>棵数 = 间隔数 = ${n}</b>。`;
      else if (u > 0.02) s += '正在剪开、拉直……';
      else if (planted === 0) s += '点“种一棵”，沿着花坛一圈种过去。';
      else if (planted < n) s += `种了 <span class="k3">${planted}</span> 棵，每棵树配它后面的 1 个间隔，配上了 <span class="k2">${planted}</span> 个。`;
      else {
        s += `转一圈回到起点，首尾是同一棵树，每棵树正好配一个间隔：<b>棵数 = 间隔数 = ${n}</b>。`;
        if (sq) { const m = L / 4 / d; s += `<br>按边来数也行：每边 ${m} 个间隔、${m + 1} 棵（橙色是角上的树）。4 个角上的树被相邻两条边各数了一次，要减掉：4 × ${m + 1} − 4 = ${n}。`; }
      }
      read.innerHTML = s;
    }
    planted = L / d;
    draw(false);
  };

  // ════════════════════ 鸡兔同笼 ════════════════════
  function chicken(parent) {
    const g = S('g', {}, parent);
    const legs = [
      S('line', { x1: -5, y1: 11, x2: -6, y2: 28, class: 'sstrong round' }, g),
      S('line', { x1: 5, y1: 11, x2: 6, y2: 28, class: 'sstrong round' }, g)
    ];
    S('path', { d: 'M-14,-4 L-25,-15 L-22,3 Z', class: 'f2s s2' }, g);
    S('ellipse', { cx: 0, cy: 0, rx: 17, ry: 13, class: 'f2s s2' }, g);
    S('path', { d: 'M8,-21 l2,-6 l3,4 l3,-5 l2,7 Z', class: 'f2' }, g);
    S('circle', { cx: 13, cy: -14, r: 8, class: 'f2s s2' }, g);
    S('path', { d: 'M20,-16 L27,-13 L20,-10 Z', class: 'f2' }, g);
    S('circle', { cx: 15, cy: -15, r: 1.8, class: 'fstrong' }, g);
    return { g, legs };
  }
  function rabbit(parent) {
    const g = S('g', {}, parent);
    const legs = [-14, -7, 7, 13].map((x) => S('line', { x1: x, y1: 8, x2: x, y2: 28, class: 'sstrong round' }, g));
    S('ellipse', { cx: 9, cy: -30, rx: 3.5, ry: 11, class: 'f1s s1', transform: 'rotate(-12 9 -30)' }, g);
    S('ellipse', { cx: 18, cy: -29, rx: 3.5, ry: 11, class: 'f1s s1', transform: 'rotate(14 18 -29)' }, g);
    S('ellipse', { cx: 0, cy: 0, rx: 19, ry: 12, class: 'f1s s1' }, g);
    S('circle', { cx: -19, cy: -3, r: 4.5, class: 'fsurf s1' }, g);
    S('circle', { cx: 14, cy: -13, r: 9, class: 'f1s s1' }, g);
    S('circle', { cx: 17, cy: -14, r: 1.8, class: 'fstrong' }, g);
    return { g, legs };
  }
  // 笼子：返回每个格子的中心
  function cage(parent, n) {
    const cols = n <= 6 ? n : Math.ceil(n / 2), rows = n <= 6 ? 1 : 2, cw = 74, ch = 92;
    const x0 = (480 - cols * cw) / 2, y0 = 12;
    S('rect', { x: x0 - 8, y: y0 - 4, width: cols * cw + 16, height: rows * ch + 8, rx: 10, class: 'fnone sstrong' }, parent);
    for (let i = 1; i < cols * 2; i++) S('line', { x1: x0 + (i * cw) / 2, x2: x0 + (i * cw) / 2, y1: y0 - 4, y2: y0 + rows * ch + 4, class: 'sline' }, parent);
    const cells = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      cells.push([x0 + c * cw + cw / 2, y0 + r * ch + 48]);
    }
    return cells;
  }
  // 头数、腿数滑块（腿数范围随头数变）
  function chickenSliders(c, st, onChange) {
    const sH = slider2(c, 'chh', '头数', 3, 12, 1, st.NH, (v) => { st.NH = v; st.F = clamp(st.F, 2 * v, 4 * v); sF.range(2 * v, 4 * v, 2, st.F); onChange(); });
    const sF = slider2(c, 'chf', '腿数', 2 * st.NH, 4 * st.NH, 2, st.F, (v) => { st.F = v; onChange(); });
    return {
      random() {
        st.NH = 5 + Math.floor(Math.random() * 8);
        const r = 1 + Math.floor(Math.random() * (st.NH - 1));
        st.F = 2 * st.NH + 2 * r;
        sH.set(st.NH); sF.range(2 * st.NH, 4 * st.NH, 2, st.F);
      }
    };
  }

  // ── 假设全是鸡：一只只换成兔 ──
  A.o_chicken_assume = function (el) {
    const W = 480, Hh = 290, BX0 = 40, BX1 = 440, BY = 232;
    const svg = stage(el, W, Hh);
    const gC = S('g', {}, svg), gB = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el), c2 = ctrl(el);
    const st = { NH: 8, F: 26 };
    let k = 0, busy = false, gen = 0, cells = [], note = '';
    const legsNow = () => 2 * st.NH + 2 * k;
    function stop() { gen++; busy = false; }
    btn(c1, '把一只鸡换成兔', () => {
      if (busy) return;
      if (legsNow() >= st.F) { note = '腿数已经对上了，不能再换啦。'; say(); return; }
      busy = true;
      const my = gen;
      morph(k, my, () => { busy = false; });
    });
    btn(c1, '一直换到对上', () => {
      if (busy) return;
      busy = true;
      const my = ++gen;
      const next = () => {
        if (my !== gen) return;
        if (legsNow() >= st.F) { busy = false; say(); return; }
        morph(k, my, () => setTimeout(next, RM ? 0 : 150));
      };
      next();
    });
    btn(c1, '重来', () => { stop(); k = 0; build(); }, 'alt');
    btn(c1, '换一道题', () => { stop(); sl.random(); k = 0; build(); }, 'alt');
    const sl = chickenSliders(c2, st, () => { stop(); k = 0; build(); });

    function build() {
      gC.innerHTML = ''; note = '';
      const pos = cage(gC, st.NH);
      cells = pos.map(([x, y], i) => {
        const g = S('g', { transform: `translate(${x},${y})` }, gC);
        const ch = chicken(g), rb = rabbit(g);
        const isR = i < k;
        ch.g.setAttribute('opacity', isR ? 0 : 1);
        rb.g.setAttribute('opacity', isR ? 1 : 0);
        const lab = T(g, 0, 42, isR ? '兔' : '鸡', 'ts tm');
        return { g, ch, rb, lab };
      });
      bar(legsNow());
      say();
    }
    function morph(i, my, done) {
      const cl = cells[i];
      const plus = T(cl.g, 6, -30, '+2', 'tl t2 tb');
      const from = legsNow();
      tween(650, (t) => {
        if (my !== gen) return;
        cl.ch.g.setAttribute('opacity', 1 - t);
        cl.rb.g.setAttribute('opacity', t);
        plus.setAttribute('y', -30 - 16 * t);
        bar(lerp(from, from + 2, t));
      }, () => {
        if (my !== gen) return;
        plus.remove();
        cl.lab.textContent = '兔';
        k++;
        bar(legsNow());
        say();
        done();
      });
    }
    function bar(v) {
      gB.innerHTML = '';
      const max = 4 * st.NH, X = (x) => BX0 + ((BX1 - BX0) * x) / max;
      S('rect', { x: BX0, y: BY, width: BX1 - BX0, height: 20, rx: 4, class: 'fsurf2 sline' }, gB);
      S('rect', { x: BX0, y: BY, width: Math.max(0, X(v) - BX0), height: 20, rx: 4, class: 'f2s s2' }, gB);
      for (let x = 2; x < max; x += 2) S('line', { x1: X(x), x2: X(x), y1: BY + 14, y2: BY + 20, class: 'sline' }, gB);
      S('line', { x1: X(st.F), x2: X(st.F), y1: BY - 8, y2: BY + 28, class: 's1 thick' }, gB);
      const right = X(st.F) > 360;
      T(gB, X(st.F) + (right ? 6 : -6), BY - 10, `题目：${st.F} 条腿`, 'ts t1 tb', right ? 'end' : 'start');
      T(gB, X(v), BY + 42, `现在 ${Math.round(v)} 条`, 'ts t2 tb');
      T(gB, BX0, BY - 10, '腿数', 'ts tm', 'start');
    }
    function say() {
      const NH = st.NH, F = st.F, r = (F - 2 * NH) / 2, now = legsNow();
      let s;
      if (k === 0) s = `假设 ${NH} 只<b>全是鸡</b>：${NH} × 2 = <span class="k2">${2 * NH}</span> 条腿。题目说有 <span class="k1">${F}</span> 条，少了 ${F} − ${2 * NH} = <b>${F - 2 * NH}</b> 条。少的腿去哪儿了？其实有的是兔！`;
      else if (now < F) s = `换了 <span class="k3">${k}</span> 只：每把一只鸡换成兔，就多 4 − 2 = 2 条腿。现在 ${2 * NH} + 2 × ${k} = <span class="k2">${now}</span> 条，还差 ${F - now} 条。`;
      else s = `对上了！一共换了 ${k} 只。列式：(${F} − ${NH} × 2) ÷ (4 − 2) = ${F - 2 * NH} ÷ 2 = ${r}。所以 <b>兔 ${r} 只，鸡 ${NH} − ${r} = ${NH - r} 只</b>。`;
      if (k === 0 && r === 0) s += '（这道题腿数正好，全都是鸡。）';
      read.innerHTML = s + (note ? `<br>${note}` : '');
      note = '';
    }
    build();
  };

  // ── 抬腿法 ──
  A.o_chicken_lift = function (el) {
    const W = 480, Hh = 280;
    const svg = stage(el, W, Hh);
    const gC = S('g', {}, svg), gT = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el), c2 = ctrl(el);
    const st = { NH: 8, F: 26 };
    let step = 0, busy = false, gen = 0, cells = [];
    const CAPS = ['口令：“全体抬起一半的腿！”', '口令：“每只动物拿出 1 条腿和头配对！”', '剩下的腿全是兔的', '再来一次'];
    function stop() { gen++; busy = false; }
    const nextBtn = btn(c1, CAPS[0], () => {
      if (busy) return;
      if (step === 3) { step = 0; build(); return; }
      if (step === 0) {
        busy = true;
        const my = gen;
        tween(900, (t) => { if (my === gen) lift(t); }, () => { if (my !== gen) return; busy = false; step = 1; paint(); });
        return;
      }
      step++;
      paint();
    });
    btn(c1, '换一道题', () => { stop(); sl.random(); step = 0; build(); }, 'alt');
    const sl = chickenSliders(c2, st, () => { stop(); step = 0; build(); });

    // 兔子均匀地分散在笼子里
    const isRabbit = (i, r, n) => Math.floor(((i + 1) * r) / n) > Math.floor((i * r) / n);
    function build() {
      gC.innerHTML = '';
      const r = (st.F - 2 * st.NH) / 2;
      const pos = cage(gC, st.NH);
      cells = pos.map(([x, y], i) => {
        const g = S('g', { transform: `translate(${x},${y})` }, gC);
        const R = isRabbit(i, r, st.NH);
        const a = R ? rabbit(g) : chicken(g);
        const badge = T(g, 0, 42, R ? '兔' : '鸡', 'ts tm');
        return { R, a, badge };
      });
      lift(0);
      paint();
    }
    function lift(t) {
      cells.forEach(({ R, a }) => {
        if (R) {
          [2, 3].forEach((j) => {
            const x = +a.legs[j].getAttribute('x1');
            a.legs[j].setAttribute('x2', lerp(x, x + 11, t));
            a.legs[j].setAttribute('y2', lerp(28, 14, t));
          });
        } else {
          a.legs[1].setAttribute('x2', lerp(6, 15, t));
          a.legs[1].setAttribute('y2', lerp(28, 19, t));
        }
      });
    }
    function paint() {
      const NH = st.NH, F = st.F, half = F / 2, r = half - NH;
      // 腿的颜色
      cells.forEach(({ R, a, badge }) => {
        const ground = R ? [0, 1] : [0];
        a.legs.forEach((lg, j) => {
          let cls = 'sstrong round';
          if (step >= 1 && !ground.includes(j)) cls = 'smuted dash round';
          if (step >= 2 && j === 0) cls = 'smuted round';
          if (step >= 2 && R && j === 1) cls = 's2 thick round';
          lg.setAttribute('class', cls);
        });
        badge.setAttribute('class', step === 3 ? (R ? 'ts t1 tb' : 'ts t2 tb') : 'ts tm');
      });
      gT.innerHTML = '';
      const L1 = [`头 ${NH} 个，腿 ${F} 条`, `站在地上的腿：${F} ÷ 2 = ${half} 条`, `${half} − ${NH} = ${r} 条（橙色）`, `兔 ${r} 只，鸡 ${NH} − ${r} = ${NH - r} 只`][step];
      T(gT, 240, 236, L1, 'tl tb');
      T(gT, 240, 262, step === 0 ? '先别急着数，听口令' : step === 1 ? '鸡单脚站，兔两脚站' : step === 2 ? '灰色的腿和头一样多，每只动物 1 条' : '每只兔正好多出 1 条橙色的腿', 'ts tm');
      cap.textContent = step === 0 ? '' : CAPS[step - 1].replace('口令：', '');
      nextBtn.textContent = CAPS[step];
      read.innerHTML = [
        `笼子里有 ${NH} 个头、${F} 条腿。鸡有 2 条腿，兔有 4 条腿。点上面的按钮喊口令。`,
        `每只动物都抬起<b>一半</b>的腿：鸡单脚站（1 条），兔用后腿站（2 条）。地上的腿正好是原来的一半：${F} ÷ 2 = <span class="k2">${half}</span> 条。`,
        `每只动物都有 1 个头，先拿出 1 条站着的腿和头配对，用掉 <span class="k1">${NH}</span> 条。鸡已经没有站着的腿了，剩下的 ${half} − ${NH} = <span class="k2">${r}</span> 条全是兔的，每只兔 1 条。`,
        `剩下几条腿就有几只兔：<b>兔 = ${F} ÷ 2 − ${NH} = ${r} 只，鸡 = ${NH} − ${r} = ${NH - r} 只</b>。验算：${NH - r} × 2 + ${r} × 4 = ${2 * (NH - r) + 4 * r} 条 ✓`
      ][step];
    }
    build();
  };

  // ════════════════════ 抽屉原理 ════════════════════
  function apple(parent, x, y, r) {
    const g = S('g', { transform: `translate(${x.toFixed(1)},${y.toFixed(1)})` }, parent);
    S('circle', { cx: 0, cy: 0, r, class: 'f2' }, g);
    S('line', { x1: 0, y1: -r, x2: 1, y2: -r - 4, class: 'sstrong thin' }, g);
    S('ellipse', { cx: 4, cy: -r - 2, rx: 3.5, ry: 1.8, class: 'f3' }, g);
    return g;
  }

  // ── 苹果放进抽屉：最不利的情况 ──
  A.o_pigeon_drawer = function (el) {
    const W = 480, Hh = 262, DY = 92, DH = 124, AR = 8;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), gA = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el), c2 = ctrl(el);
    let n = 5, k = 4, cnt = [0, 0, 0, 0], rand = false, busy = false, gen = 0;
    const placed = () => cnt.reduce((a, b) => a + b, 0);
    function stop() { gen++; busy = false; }
    function geo() {
      const gap = 12, w = Math.min(74, (440 - (k - 1) * gap) / k), x0 = (W - (k * w + (k - 1) * gap)) / 2;
      return { w, X: (i) => x0 + i * (w + gap) };
    }
    const slot = (i, j) => { const { w, X } = geo(); return [X(i) + w / 2 + ((j % 3) - 1) * 19, DY + DH - 14 - Math.floor(j / 3) * 19]; };
    const pileXY = (m) => [24 + (m % 20) * 21.5, 34];
    btn(c1, '放一个（最不利地放）', () => { if (!busy) one(gen, () => { busy = false; }); });
    btn(c1, '一个一个放完', () => {
      if (busy) return;
      if (rand || placed() >= n) { rand = false; cnt = cnt.map(() => 0); draw(); }
      const my = ++gen;
      const next = () => { if (my !== gen) return; if (placed() >= n) { busy = false; draw(); return; } one(my, () => setTimeout(next, RM ? 0 : 120)); };
      next();
    });
    btn(c1, '随便放一次', () => {
      stop(); rand = true;
      cnt = cnt.map(() => 0);
      for (let i = 0; i < n; i++) cnt[Math.floor(Math.random() * k)]++;
      draw();
    }, 'alt');
    btn(c1, '重来', () => { stop(); rand = false; cnt = cnt.map(() => 0); draw(); }, 'alt');
    slider2(c2, 'pgn', '苹果', 2, 20, 1, n, (v) => { n = v; stop(); rand = false; cnt = cnt.map(() => 0); draw(); });
    slider2(c2, 'pgk', '抽屉', 2, 6, 1, k, (v) => { k = v; stop(); rand = false; cnt = Array(k).fill(0); draw(); });

    // 最不利：放进当前最少的抽屉
    function one(my, done) {
      if (rand || placed() >= n) { rand = false; cnt = cnt.map(() => 0); draw(); }
      busy = true;
      let t0 = 0;
      for (let i = 1; i < k; i++) if (cnt[i] < cnt[t0]) t0 = i;
      const from = pileXY(n - placed() - 1), to = slot(t0, cnt[t0]);
      const lastPile = gA.lastElementChild;
      if (lastPile) lastPile.remove();
      const a = apple(g, from[0], from[1], AR);
      tween(420, (t) => {
        if (my !== gen) return;
        a.setAttribute('transform', `translate(${lerp(from[0], to[0], t).toFixed(1)},${(lerp(from[1], to[1], t) - 30 * Math.sin(PI * t)).toFixed(1)})`);
      }, () => {
        if (my !== gen) return;
        cnt[t0]++;
        draw();
        done();
      });
    }
    function draw() {
      g.innerHTML = ''; gA.innerHTML = '';
      const { w, X } = geo(), p = placed(), mx = Math.max(...cnt);
      const need = Math.ceil(n / k), q = Math.floor(n / k), rem = n % k;
      // 待放的苹果
      T(g, 16, 16, `还没放的苹果：${n - p} 个`, 'ts tm', 'start');
      for (let m = 0; m < n - p; m++) { const [x, y] = pileXY(m); apple(gA, x, y, 7); }
      for (let i = 0; i < k; i++) {
        const hot = p > 0 && cnt[i] === mx && mx >= need;
        S('rect', { x: X(i), y: DY, width: w, height: DH, rx: 6, class: 'fsurf2' }, g);
        S('path', { d: `M${X(i)},${DY} V${DY + DH} H${X(i) + w} V${DY}`, class: 'fnone ' + (hot ? 's2 thick' : 'sstrong') }, g);
        S('line', { x1: X(i) + w / 2 - 10, x2: X(i) + w / 2 + 10, y1: DY + DH + 10, y2: DY + DH + 10, class: 'sstrong round' }, g);
        T(g, X(i) + w / 2, DY + DH + 30, `抽屉${i + 1}`, 'ts tm');
        T(g, X(i) + w / 2, DY - 8, cnt[i] + ' 个', hot ? 't2 tb' : 'ts tm');
        for (let j = 0; j < cnt[i]; j++) { const [x, y] = slot(i, j); apple(g, x, y, AR); }
      }
      let s = `${n} 个苹果放进 ${k} 个抽屉。`;
      if (rand) s += `随便放了一次：最多的抽屉有 <span class="k2">${mx}</span> 个。再点几次“随便放一次”——不管怎么放，最多的那个抽屉都<b>不会少于 ${need} 个</b>。`;
      else if (p === 0) s += `能不能让每个抽屉都放得少一点？最“平均”的放法最不容易凑多。点“放一个”，每次都放进<b>最少</b>的抽屉。`;
      else if (p < n) {
        if (p <= k) s += `第 ${p} 个苹果放进空抽屉。最不利的放法：先让每个抽屉都只放 1 个，尽量不让某个抽屉“凑多”。`;
        else s += `像发牌一样轮流放：现在每个抽屉放了 ${Math.floor(p / k)} 个${p % k ? `，有 ${p % k} 个抽屉多 1 个` : ''}，最多的有 ${mx} 个。`;
      } else if (n <= k) s += `苹果不比抽屉多，可以每个抽屉最多放 1 个，只能保证“至少有一个抽屉放 1 个”。`;
      else if (rem === 0) s += `${n} ÷ ${k} = ${q}，正好分完：每个抽屉 ${q} 个。所以<b>至少有一个抽屉放 ${q} 个</b>（整除时不用加 1）。`;
      else s += `${n} ÷ ${k} = ${q} 余 ${rem}：先每个抽屉放 ${q} 个，剩下的 ${rem} 个不管放哪儿，都会让某个抽屉变成 ${q + 1} 个。所以<b>总有一个抽屉至少放 ${q} + 1 = ${q + 1} 个</b>。`;
      read.innerHTML = s;
    }
    draw();
  };

  // ── 摸球：最倒霉的人怎么摸 ──
  A.o_pigeon_socks = function (el) {
    const W = 480, Hh = 262;
    const svg = stage(el, W, Hh);
    const gBag = S('g', {}, svg), gOut = S('g', {}, svg), gBall = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    H('span', {}, row, '问题：');
    const sel = H('select', {}, row);
    const QS = ['保证有 2 个同色', '保证有 3 个同色', '保证摸到绿球', '保证三种颜色都有', '保证有两种不同颜色'];
    QS.forEach((q, i) => H('option', { value: i }, sel, q));
    const c1 = ctrl(el);
    const CN = ['蓝', '橙', '绿'], CC = ['f1', 'f2', 'f3'];
    let cnt = [5, 4, 3], qi = 0, seq = [], t = 0, balls = [], busy = false, gen = 0;
    function stop() { gen++; busy = false; }
    sel.addEventListener('change', () => { qi = +sel.value; stop(); reset(); });
    btn(c1, '摸一个', () => { if (!busy) draw1(gen, () => { busy = false; }); });
    btn(c1, '一直摸到成功', () => {
      if (busy) return;
      if (t >= seq.length) reset();
      const my = ++gen;
      const next = () => { if (my !== gen) return; if (t >= seq.length) { busy = false; return; } draw1(my, () => setTimeout(next, RM ? 0 : 160)); };
      next();
    });
    btn(c1, '放回去重来', () => { stop(); reset(); }, 'alt');
    btn(c1, '换一袋', () => { stop(); cnt = cnt.map(() => 3 + Math.floor(Math.random() * 4)); reset(); }, 'alt');

    function worst() {
      const s = [];
      if (qi <= 1) {
        const m = qi + 2, take = [0, 0, 0];
        let more = true;
        while (more) {
          more = false;
          for (let j = 0; j < 3; j++) if (take[j] < Math.min(cnt[j], m - 1)) { take[j]++; s.push(j); more = true; }
        }
        s.push(cnt.findIndex((c, j) => c - take[j] > 0));
      } else if (qi === 2) {
        for (let j = 0; j < 2; j++) for (let i = 0; i < cnt[j]; i++) s.push(j);
        s.push(2);
      } else if (qi === 3) {
        const order = [0, 1, 2].sort((a, b) => cnt[b] - cnt[a]);
        for (const j of order.slice(0, 2)) for (let i = 0; i < cnt[j]; i++) s.push(j);
        s.push(order[2]);
      } else {
        const big = [0, 1, 2].sort((a, b) => cnt[b] - cnt[a])[0];
        for (let i = 0; i < cnt[big]; i++) s.push(big);
        s.push((big + 1) % 3);
      }
      return s;
    }
    const bagXY = (i) => [56 + (i % 5) * 24, 228 - Math.floor(i / 5) * 24];
    const outXY = (i) => [222 + (i % 9) * 28, 92 + Math.floor(i / 9) * 32];
    function reset() {
      seq = worst(); t = 0;
      gBag.innerHTML = ''; gOut.innerHTML = ''; gBall.innerHTML = '';
      S('path', { d: 'M40,96 Q12,250 104,252 Q196,250 168,96 Z', class: 'fsurf2 sstrong' }, gBag);
      S('path', { d: 'M40,96 Q104,80 168,96', class: 'fnone sstrong' }, gBag);
      T(gBag, 104, 54, '袋子（看不见里面）', 'ts tm');
      T(gBag, 104, 74, cnt.map((c, j) => CN[j] + c).join(' '), 'ts tb');
      T(gOut, 210, 46, '摸出来的球（按最倒霉的顺序）', 'ts tm', 'start');
      balls = [];
      let idx = 0;
      for (let j = 0; j < 3; j++) for (let i = 0; i < cnt[j]; i++) {
        const [x, y] = bagXY(idx++);
        const b = S('g', { transform: `translate(${x},${y})` }, gBall);
        S('circle', { cx: 0, cy: 0, r: 11, class: CC[j] }, b);
        balls.push({ j, b, used: false });
      }
      say();
    }
    function draw1(my, done) {
      if (t >= seq.length) { reset(); }
      busy = true;
      const j = seq[t];
      const ball = balls.filter((x) => x.j === j && !x.used).pop();
      ball.used = true;
      const m = ball.b.getAttribute('transform').match(/translate\(([-\d.]+),([-\d.]+)\)/);
      const from = [+m[1], +m[2]], to = outXY(t);
      const idx = t;
      tween(380, (u) => {
        if (my !== gen) return;
        ball.b.setAttribute('transform', `translate(${lerp(from[0], to[0], u).toFixed(1)},${(lerp(from[1], to[1], u) - 40 * Math.sin(PI * u)).toFixed(1)})`);
      }, () => {
        if (my !== gen) return;
        T(ball.b, 0, 4, String(idx + 1), 'ts tw tb');
        if (idx === seq.length - 1) S('circle', { cx: 0, cy: 0, r: 15, class: 'fnone s3 thick' }, ball.b);
        t++;
        say();
        done();
      });
    }
    function say() {
      const N = seq.length, got = [0, 0, 0];
      for (let i = 0; i < t; i++) got[seq[i]]++;
      const sorted = [0, 1, 2].sort((a, b) => cnt[b] - cnt[a]);
      const formula = [
        `3 种颜色各摸 1 个都不同色：1 × 3 + 1 = ${N}`,
        `每种颜色各摸 2 个，还没有 3 个同色：2 × 3 + 1 = ${N}`,
        `先把蓝球 ${cnt[0]} 个、橙球 ${cnt[1]} 个全摸光：${cnt[0]} + ${cnt[1]} + 1 = ${N}`,
        `先把最多的两种（${CN[sorted[0]]} ${cnt[sorted[0]]} 个、${CN[sorted[1]]} ${cnt[sorted[1]]} 个）全摸光：${cnt[sorted[0]]} + ${cnt[sorted[1]]} + 1 = ${N}`,
        `一直摸到的都是最多的${CN[sorted[0]]}球，把 ${cnt[sorted[0]]} 个全摸光：${cnt[sorted[0]]} + 1 = ${N}`
      ][qi];
      let s = `问题：至少摸几个，才能<b>${QS[qi]}</b>？`;
      if (t === 0) s += '“保证”就是：运气最差的人也能做到。点“摸一个”，看最倒霉的人会怎么摸。';
      else if (t < N) s += `<br>已经摸了 ${t} 个（${got.map((c, j) => CN[j] + ' ' + c).join('，')}），最倒霉的情况下还没做到。`;
      else s += `<br>第 <b>${N}</b> 个（绿圈）：这时不管摸出什么颜色都做到了！最倒霉的情况：${formula}。所以至少要摸 <b>${N}</b> 个。`;
      read.innerHTML = s;
    }
    reset();
  };

  // ════════════════════ 鸟头模型 ════════════════════

  // ── 复习：高相同，面积比 = 底的比 ──
  A.o_bird_base = function (el) {
    const W = 460, Hh = 262, BX = 50, U = 45, BY = 222, AY = 42;
    const svg = stage(el, W, Hh);
    S('line', { x1: 14, x2: W - 14, y1: AY, y2: AY, class: 'guide' }, svg);
    T(svg, W - 14, AY - 10, '和 BC 平行的线', 'ts tm', 'end');
    const g = S('g', {}, svg);
    const hA = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const hD = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let ax = 170, di = 3, busy = false;
    btn(c, '让 A 沿平行线滑一滑', () => {
      if (busy) return;
      busy = true;
      const x0 = ax;
      const way = [x0, 410, 50, x0];
      tween(3200, (t, raw) => { const s = Math.min(2.999, raw * 3), k = Math.floor(s); ax = lerp(way[k], way[k + 1], s - k); draw(); }, () => { ax = x0; busy = false; draw(); });
    });
    btn(c, '把 D 放到中点', () => { if (!busy) { di = 4; draw(); } }, 'alt');
    drag(svg, hA, (p) => { ax = clamp(p.x, 30, 430); draw(); }, () => !busy);
    drag(svg, hD, (p) => { di = clamp(Math.round((p.x - BX) / U), 1, 7); draw(); }, () => !busy);
    H('p', { class: 'anim-tip' }, el, '提示：拖动 A 点左右滑，拖动 D 点改变两段底的长短。');
    function draw() {
      g.innerHTML = '';
      const B = [BX, BY], C = [BX + 8 * U, BY], D = [BX + di * U, BY], Ap = [ax, AY];
      S('polygon', { points: pts([Ap, B, D]), class: 'f1s s1' }, g);
      S('polygon', { points: pts([Ap, D, C]), class: 'f2s s2' }, g);
      S('line', { x1: ax, x2: ax, y1: AY, y2: BY, class: 'smuted dash' }, g);
      if (ax < BX || ax > BX + 8 * U) S('line', { x1: ax, x2: ax < BX ? BX : BX + 8 * U, y1: BY, y2: BY, class: 'sline dash' }, g);
      S('path', { d: `M${ax + 8},${BY} v-8 h-8`, class: 'fnone smuted thin' }, g);
      for (let i = 0; i <= 8; i++) S('line', { x1: BX + i * U, x2: BX + i * U, y1: BY - 4, y2: BY + 4, class: 'sstrong' }, g);
      T(g, ax + 6, (AY + BY) / 2, '高 4', 'ts tm', 'start');
      T(g, ax, AY - 14, 'A', 'vname');
      T(g, BX - 12, BY + 20, 'B', 'vname');
      T(g, BX + 8 * U + 12, BY + 20, 'C', 'vname');
      T(g, D[0], BY + 22, 'D', 'vname');
      T(g, (BX + D[0]) / 2, BY + 38, `BD = ${di}`, 'ts t1 tb');
      T(g, (D[0] + C[0]) / 2, BY + 38, `DC = ${8 - di}`, 'ts t2 tb');
      const s1 = di * 2, s2 = (8 - di) * 2;
      T(g, (ax + BX + D[0]) / 3, (AY + 2 * BY) / 3 + 6, String(s1), 'tl t1 tb');
      T(g, (ax + D[0] + C[0]) / 3, (AY + 2 * BY) / 3 + 6, String(s2), 'tl t2 tb');
      hA.setAttribute('cx', ax); hA.setAttribute('cy', AY);
      hD.setAttribute('cx', D[0]); hD.setAttribute('cy', BY);
      const gg = gcd(di, 8 - di);
      read.innerHTML = `两个三角形的顶点都是 A，底都在 BC 上，所以<b>高一样</b>（都是 4）。<br>
        <span class="k1">S△ABD = ${di} × 4 ÷ 2 = ${s1}</span>，<span class="k2">S△ADC = ${8 - di} × 4 ÷ 2 = ${s2}</span>。
        面积比 ${s1} : ${s2} = ${di / gg} : ${(8 - di) / gg}，正好等于底的比 BD : DC = ${di} : ${8 - di}。` +
        (busy ? '<br>A 在平行线上滑动，高不变，两块面积都不变——这就是<b>等积变形</b>。' : '');
    }
    draw();
  };

  // ── 鸟头模型：拖动 D、E，并分两步推导 ──
  A.o_bird_drag = function (el) {
    const W = 460, Hh = 300, NB = 6, NC = 5;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hD = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const hE = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let Ap = [170, 30], Bp = [40, 262], Cp = [430, 262], i = 2, j = 3, st = 0;
    const LAB = ['连 BE，分两步看为什么', '第二步', '合起来', '回到开头'];
    const stBtn = btn(c, LAB[0], () => { st = (st + 1) % 4; draw(); });
    btn(c, '换一个三角形', () => {
      Ap = [90 + Math.random() * 260, 24 + Math.random() * 40];
      Bp = [24 + Math.random() * 40, 230 + Math.random() * 34];
      Cp = [390 + Math.random() * 46, 214 + Math.random() * 50];
      draw();
    }, 'alt');
    const along = (P, Q, t) => [lerp(P[0], Q[0], t), lerp(P[1], Q[1], t)];
    const proj = (p, P, Q) => {
      const vx = Q[0] - P[0], vy = Q[1] - P[1];
      return ((p.x - P[0]) * vx + (p.y - P[1]) * vy) / (vx * vx + vy * vy);
    };
    const foot = (X, P, Q) => { const t = proj({ x: X[0], y: X[1] }, P, Q); return [along(P, Q, t), t]; };
    drag(svg, hD, (p) => { const v = clamp(Math.round(proj(p, Ap, Bp) * NB), 1, NB); if (v !== i) { i = v; draw(); } });
    drag(svg, hE, (p) => { const v = clamp(Math.round(proj(p, Ap, Cp) * NC), 1, NC); if (v !== j) { j = v; draw(); } });
    H('p', { class: 'anim-tip' }, el, `提示：拖动 D、E 两个圆点（AB 平均分成 ${NB} 份，AC 平均分成 ${NC} 份）。`);
    function height(X, P, Q) {
      const [F, t] = foot(X, P, Q);
      if (t > 1) S('line', { x1: Q[0], y1: Q[1], x2: F[0], y2: F[1], class: 'sline dash' }, g);
      if (t < 0) S('line', { x1: P[0], y1: P[1], x2: F[0], y2: F[1], class: 'sline dash' }, g);
      S('line', { x1: X[0], y1: X[1], x2: F[0], y2: F[1], class: 'smuted dash' }, g);
      S('circle', { cx: F[0], cy: F[1], r: 3, class: 'fmuted' }, g);
    }
    function label(P, text, ctr) {
      const dx = P[0] - ctr[0], dy = P[1] - ctr[1], m = Math.hypot(dx, dy) || 1;
      T(g, P[0] + (dx / m) * 18, P[1] + (dy / m) * 18 + 5, text, 'vname');
    }
    function draw() {
      g.innerHTML = '';
      const D = along(Ap, Bp, i / NB), E = along(Ap, Cp, j / NC), O = cen([Ap, Bp, Cp]);
      S('polygon', { points: pts([Ap, Bp, Cp]), class: 'tri' }, g);
      if (st >= 1) S('polygon', { points: pts([Ap, Bp, E]), class: st === 1 ? 'f1s s1' : 'fnone s1' }, g);
      if (st !== 1) S('polygon', { points: pts([Ap, D, E]), class: 'f2s s2' }, g);
      if (st === 1) height(Bp, Ap, Cp);
      if (st === 2) height(E, Ap, Bp);
      for (let q = 1; q < NB; q++) { const P = along(Ap, Bp, q / NB); S('circle', { cx: P[0], cy: P[1], r: 2.5, class: 'fstrong' }, g); }
      for (let q = 1; q < NC; q++) { const P = along(Ap, Cp, q / NC); S('circle', { cx: P[0], cy: P[1], r: 2.5, class: 'fstrong' }, g); }
      label(Ap, 'A', O); label(Bp, 'B', O); label(Cp, 'C', O);
      const sideOut = (P, Q, X, txt) => {
        const vx = Q[0] - P[0], vy = Q[1] - P[1], m = Math.hypot(vx, vy);
        let nx = -vy / m, ny = vx / m;
        if ((X[0] - O[0]) * nx + (X[1] - O[1]) * ny < 0) { nx = -nx; ny = -ny; }
        T(g, X[0] + nx * 18, X[1] + ny * 18 + 5, txt, 'vname');
      };
      sideOut(Ap, Bp, D, 'D');
      sideOut(Ap, Cp, E, 'E');
      const ade = cen([Ap, D, E]);
      if (st !== 1) T(g, ade[0], ade[1] + 5, `${i * j} 份`, 'ts t2 tb');
      if (st === 1) { const abe = cen([Ap, Bp, E]); T(g, abe[0], abe[1] + 5, `${NB * j} 份`, 'ts t1 tb'); }
      T(g, (Bp[0] + Cp[0]) / 2, Math.max(Bp[1], Cp[1]) + 26, `△ABC = ${NB} × ${NC} = ${NB * NC} 份`, 'ts tm');
      hD.setAttribute('cx', D[0]); hD.setAttribute('cy', D[1]);
      hE.setAttribute('cx', E[0]); hE.setAttribute('cy', E[1]);
      stBtn.textContent = LAB[st];
      const tot = NB * NC, gg = gcd(i * j, tot);
      const ratio = `(${i} × ${j}) : (${NB} × ${NC}) = ${i * j} : ${tot}` + (gg > 1 ? ` = ${i * j / gg} : ${tot / gg}` : '');
      cap.textContent = ['', '第一步：连 BE，看 △ABE 和 △ABC', '第二步：看 △ADE 和 △ABE', '合起来'][st];
      read.innerHTML = [
        `AD = <span class="k2">${i}</span> 份，AB = ${NB} 份；AE = <span class="k2">${j}</span> 份，AC = ${NC} 份。<br><b>S△ADE : S△ABC = (AD × AE) : (AB × AC)</b> = ${ratio}`,
        `△ABE 和 △ABC 的顶点都是 B，底 AE 和 AC 在同一条直线上，<b>高一样</b>（虚线）。把 △ABC 看成 ${NB} × ${NC} = ${tot} 份，AC 有 ${NC} 小段，每段对应 ${tot} ÷ ${NC} = ${NB} 份；AE 有 ${j} 段，所以 <span class="k1">△ABE = ${NB} × ${j} = ${NB * j} 份</span>。`,
        `△ADE 和 △ABE 的顶点都是 E，底 AD 和 AB 在同一条直线上，高一样（虚线）。△ABE 有 ${NB * j} 份，AB 有 ${NB} 小段，每段对应 ${NB * j} ÷ ${NB} = ${j} 份；AD 有 ${i} 段，所以 <span class="k2">△ADE = ${j} × ${i} = ${i * j} 份</span>。`,
        `△ADE = AD × AE = ${i} × ${j} = ${i * j} 份，△ABC = AB × AC = ${NB} × ${NC} = ${tot} 份。<br>这就是鸟头模型：<b>S△ADE : S△ABC = (AD × AE) : (AB × AC)</b> = ${ratio}`
      ][st];
    }
    draw();
  };

  // ── 三边延长：大三角形是原来的几倍 ──
  A.o_bird_extend = function (el) {
    const W = 460, Hh = 340;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el), c2 = ctrl(el);
    let base = [[0.42, 0], [0, 1], [1, 0.82]], k = 1, st = 0, grow = 1, busy = false, gen = 0;
    const LAB = ['第 1 步：延长三条边', '第 2 步：看 B 处的一块', '第 3 步：看 C 处的一块', '第 4 步：看 A 处的一块', '第 5 步：合起来', '从头再看一遍'];
    const stBtn = btn(c1, LAB[0], () => {
      if (busy) return;
      st = (st + 1) % 6;
      busy = true;
      const my = ++gen;
      tween(st === 1 ? 1100 : 600, (t) => { if (my === gen) { grow = st === 1 ? t : 1; draw(t); } }, () => { if (my === gen) { busy = false; grow = 1; draw(1); } });
    });
    btn(c1, '换一个三角形', () => {
      gen++; busy = false;
      base = [[0.2 + Math.random() * 0.6, 0], [0, 0.75 + Math.random() * 0.25], [1, 0.6 + Math.random() * 0.4]];
      grow = 1; draw(1);
    }, 'alt');
    slider2(c2, 'bdk', '延长到原边的几倍', 1, 3, 1, k, (v) => { k = v; gen++; busy = false; st = 0; grow = 1; draw(1); });
    function draw(fade) {
      g.innerHTML = '';
      const [a, b, cc] = base;
      const ext = (P, Q, s) => [Q[0] + s * (Q[0] - P[0]), Q[1] + s * (Q[1] - P[1])];
      const D0 = ext(a, b, k), E0 = ext(b, cc, k), F0 = ext(cc, a, k);
      const all = [a, b, cc, D0, E0, F0];
      const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
      const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
      const sc = Math.min((W - 60) / (maxX - minX), (Hh - 50) / (maxY - minY));
      const ox = (W - (maxX - minX) * sc) / 2, oy = (Hh - (maxY - minY) * sc) / 2;
      const M = (p) => [ox + (p[0] - minX) * sc, oy + (p[1] - minY) * sc];
      const Ap = M(a), Bp = M(b), Cp = M(cc), D = M(D0), E = M(E0), F = M(F0);
      const O = cen([D, E, F]);
      const kk = k * k;
      // 大三角形轮廓
      S('polygon', { points: pts([D, E, F]), class: st >= 5 ? 'f3s sstrong' : 'fnone sline dash' }, g);
      // 三块外面的三角形：每块分成 k 份和 k×k 份
      const pieces = [
        [[D, Bp, Cp], [D, Cp, E], D, Cp],
        [[E, Cp, Ap], [E, Ap, F], E, Ap],
        [[F, Ap, Bp], [F, Bp, D], F, Bp]
      ];
      pieces.forEach(([p1, p2, s0, s1], idx) => {
        if (st < idx + 2) return;
        const op = st === idx + 2 ? fade : 1;
        const gg = S('g', { opacity: op }, g);
        S('polygon', { points: pts(p1), class: 'f1s' }, gg);
        S('polygon', { points: pts(p2), class: 'f2s' }, gg);
        S('line', { x1: s0[0], y1: s0[1], x2: s1[0], y2: s1[1], class: 's1 dash' }, gg);
        const c1p = cen(p1), c2p = cen(p2);
        T(gg, c1p[0], c1p[1] + 5, String(k), 't1 tb');
        T(gg, c2p[0], c2p[1] + 5, String(kk), 't2 tb');
      });
      S('polygon', { points: pts([Ap, Bp, Cp]), class: 'f3s sstrong' }, g);
      const oc = cen([Ap, Bp, Cp]);
      T(g, oc[0], oc[1] + 5, '1', 't3 tb');
      // 延长线
      if (st >= 1) {
        const gr = st === 1 ? grow : 1;
        [[Bp, D], [Cp, E], [Ap, F]].forEach(([P, Q]) => S('line', { x1: P[0], y1: P[1], x2: lerp(P[0], Q[0], gr), y2: lerp(P[1], Q[1], gr), class: 'sstrong' }, g));
      }
      const lab = (P, t) => { const dx = P[0] - O[0], dy = P[1] - O[1], m = Math.hypot(dx, dy) || 1; T(g, P[0] + (dx / m) * 16, P[1] + (dy / m) * 16 + 5, t, 'vname'); };
      lab(D, 'D'); lab(E, 'E'); lab(F, 'F');
      const lab2 = (P, t) => { const dx = P[0] - oc[0], dy = P[1] - oc[1], m = Math.hypot(dx, dy) || 1; T(g, P[0] - (dx / m) * 14, P[1] - (dy / m) * 14 + 5, t, 'vname'); };
      lab2(Ap, 'A'); lab2(Bp, 'B'); lab2(Cp, 'C');
      stBtn.textContent = LAB[st];
      const tot = 1 + 3 * (k + kk);
      const kt = k === 1 ? '一倍（BD = AB，CE = BC，AF = CA）' : `${k} 倍（BD = ${k} × AB，CE = ${k} × BC，AF = ${k} × CA）`;
      cap.textContent = ['', '延长三条边', 'B 处的一块：△DBE', 'C 处的一块：△ECF', 'A 处的一块：△FAD', '合起来'][st];
      read.innerHTML = [
        `把 △ABC 的面积看成 <span class="k3">1</span> 份。把三条边各延长${kt}，连成大三角形 DEF。猜一猜：△DEF 是 △ABC 的几倍？点“第 1 步”。`,
        `AB 延长到 D，BC 延长到 E，CA 延长到 F。下面一块一块地看外面的三个三角形。`,
        `连 DC（虚线）。△DBC 和 △ABC 的顶点都是 C，底 BD 是 AB 的 ${k} 倍，高一样，所以 <span class="k1">△DBC = ${k} 份</span>。△DCE 和 △DBC 的顶点都是 D，底 CE 是 BC 的 ${k} 倍，所以 <span class="k2">△DCE = ${k} × ${k} = ${kk} 份</span>。△DBE = ${k} + ${kk} = <b>${k + kk} 份</b>。`,
        `连 EA。同样的道理：△ECA 是 △ABC 的 ${k} 倍 = <span class="k1">${k} 份</span>，△EAF 是 △ECA 的 ${k} 倍 = <span class="k2">${kk} 份</span>。△ECF = <b>${k + kk} 份</b>。`,
        `连 FB。△FAB = <span class="k1">${k} 份</span>，△FBD = <span class="k2">${kk} 份</span>。△FAD = <b>${k + kk} 份</b>。`,
        `△DEF = 中间 1 份 + 外面 3 块 × ${k + kk} 份 = 1 + 3 × ${k + kk} = <b>${tot} 份</b>，是原来的 <b>${tot} 倍</b>。${k === 1 ? '（各延长一倍时是 7 倍，这个结论要记住。）' : ''}`
      ][st];
    }
    draw(1);
  };

  // ════════════════════ 绝对值和的最小值 ════════════════════
  // 数轴上若干个点 + 动点 x，下面同步画 y = 各距离之和 的图象
  function absCore(el, init, multi) {
    const W = 480, Hh = multi ? 392 : 372, LY = 116, X0 = 240, U = 26, LIM = 8;
    const GY0 = Hh - 22, GH = multi ? 150 : 160;
    const X = (v) => X0 + v * U;
    const NAMES = ['a', 'b', 'c', 'd', 'e'], BC = ['s1', 's2', 's3', 's1', 's2'], KC = ['k1', 'k2', 'k3', 'k1', 'k2'];
    const svg = stage(el, W, Hh);
    // 数轴
    S('line', { x1: 10, x2: W - 10, y1: LY, y2: LY, class: 'sstrong' }, svg);
    S('path', { d: `M${W - 6},${LY} l-10,-5 v10 Z`, class: 'fstrong' }, svg);
    for (let v = -LIM; v <= LIM; v++) {
      S('line', { x1: X(v), x2: X(v), y1: LY - 4, y2: LY + 4, class: 'sstrong' }, svg);
      T(svg, X(v), LY + 20, fmt(v), 'tick');
    }
    // 图象坐标轴
    S('line', { x1: X(-LIM), x2: X(LIM), y1: GY0, y2: GY0, class: 'axis' }, svg);
    S('line', { x1: X(0), x2: X(0), y1: GY0, y2: GY0 - GH - 12, class: 'axis' }, svg);
    for (let v = -LIM; v <= LIM; v += 2) T(svg, X(v), GY0 + 15, fmt(v), 'tick');
    T(svg, X(0) + 8, GY0 - GH - 4, 'y', 'tick ital', 'start');
    T(svg, X(LIM) - 2, GY0 - 6, 'x', 'tick ital', 'end');
    const g = S('g', {}, svg);
    const hx = S('circle', { r: 11, class: 'handle', tabindex: 0 }, svg);
    let P = init.slice(), x = -6, busy = false, gen = 0, showPair = false;
    let hp = [];
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el), c2 = multi ? ctrl(el) : null;
    function stop() { gen++; busy = false; }
    function makeHandles() {
      hp.forEach((h) => h.remove());
      hp = P.map((_, i) => {
        const h = S('circle', { r: 10, class: 'handle', tabindex: 0 }, svg);
        drag(svg, h, (p) => { const v = clamp(Math.round((p.x - X0) / U), -LIM + 1, LIM - 1); if (v !== P[i]) { P[i] = v; draw(); } }, () => !busy);
        return h;
      });
      svg.appendChild(hx);
    }
    drag(svg, hx, (p) => { x = clamp(Math.round(((p.x - X0) / U) * 2) / 2, -LIM, LIM); draw(); }, () => !busy);
    const f = (t) => P.reduce((s, p) => s + Math.abs(t - p), 0);
    const sorted = () => P.slice().sort((a, b) => a - b);
    function best() { const s = sorted(), n = s.length; return n % 2 ? [s[(n - 1) / 2], s[(n - 1) / 2]] : [s[n / 2 - 1], s[n / 2]]; }
    btn(c1, '让 x 从左走到右', () => {
      if (busy) return;
      busy = true;
      const my = ++gen;
      tween(4200, (t, raw) => { if (my !== gen) return; x = Math.round(lerp(-LIM, LIM, raw) * 2) / 2; draw(); }, () => { if (my === gen) { busy = false; draw(); } });
    });
    btn(c1, multi ? '找最小值' : '把 x 放到最低处', () => {
      if (busy) return;
      busy = true;
      const my = ++gen, [l, r] = best(), to = Math.round(((l + r) / 2) * 2) / 2, from = x;
      tween(900, (t) => { if (my !== gen) return; x = lerp(from, to, t); draw(); }, () => { if (my === gen) { x = to; busy = false; draw(); } });
    }, 'alt');
    if (multi) {
      const PRE = { 3: [-4, 1, 3], 4: [-5, -2, 1, 4], 5: [-5, -3, 0, 2, 5] };
      const nb = [3, 4, 5].map((n, i) => btn(c2, `${n} 个点`, () => { stop(); P = PRE[n].slice(); x = -6; pick(nb, i); makeHandles(); draw(); }, i ? 'alt' : ''));
      const pb = btn(c2, '两两配对看', () => { showPair = !showPair; pb.textContent = showPair ? '收起配对' : '两两配对看'; draw(); }, 'alt');
    }
    function draw() {
      g.innerHTML = '';
      const n = P.length, s = sorted(), [l, r] = best();
      const minV = f(l), fx = f(x);
      const ymax = Math.max(f(-LIM), f(LIM), 1), sy = GH / ymax;
      const GY = (y) => GY0 - y * sy;
      // 距离线段
      P.forEach((p, i) => {
        const y = LY - 16 - i * (multi ? 11 : 20);
        S('line', { x1: X(x), x2: X(p), y1: y, y2: y, class: BC[i] + ' thick round' }, g);
        if (!multi && p !== x) T(g, (X(x) + X(p)) / 2, y - 6, `|x − ${NAMES[i]}| = ${fmt(Math.abs(x - p))}`, 'ts tb ' + (i ? 't2' : 't1'));
      });
      T(g, X(x), 22, `x = ${fmt(x)}`, 'ts tb t3');
      // 点的名字
      P.forEach((p, i) => {
        const same = P.slice(0, i).filter((q) => q === p).length;
        T(g, X(p), LY + 38 + same * 14, NAMES[i], 'ital ' + (KC[i] === 'k1' ? 't1' : KC[i] === 'k2' ? 't2' : 't3'));
      });
      // 配对括号
      if (multi && showPair) {
        for (let i = 0; i < Math.floor(n / 2); i++) {
          const y = LY + 56 + i * 16, x1 = X(s[i]), x2 = X(s[n - 1 - i]);
          const inside = x >= s[i] && x <= s[n - 1 - i];
          S('path', { d: `M${x1},${y - 6} V${y} H${x2} V${y - 6}`, class: 'fnone ' + (inside ? 's3' : 's2 dash') }, g);
          T(g, x2 + 4, y + 4, `长 ${s[n - 1 - i] - s[i]}`, 'ts ' + (inside ? 't3' : 't2'), 'start');
        }
      }
      // 图象
      const knots = [-LIM, ...s, LIM];
      S('polyline', { points: knots.map((t) => `${X(t).toFixed(1)},${GY(f(t)).toFixed(1)}`).join(' '), class: 'fline' }, g);
      S('line', { x1: X(l), x2: X(r), y1: GY(minV), y2: GY(minV), class: 's3 thick round' }, g);
      if (l === r) S('circle', { cx: X(l), cy: GY(minV), r: 5, class: 'f3' }, g);
      T(g, X(-LIM), GY0 - GH, `最小值 ${fmt(minV)}`, 'ts t3 tb', 'start');
      S('line', { x1: X(x), x2: X(x), y1: LY + 6, y2: GY(fx), class: 'sline dash' }, g);
      S('circle', { cx: X(x), cy: GY(fx), r: 6, class: 'f2' }, g);
      T(g, X(x) + (x > 4 ? -8 : 8), GY(fx) - 8, `y = ${fmt(fx)}`, 'ts t2 tb', x > 4 ? 'end' : 'start');
      // 圆点
      P.forEach((p, i) => { hp[i].setAttribute('cx', X(p)); hp[i].setAttribute('cy', LY); });
      hx.setAttribute('cx', X(x)); hx.setAttribute('cy', LY);
      // 读数
      const terms = P.map((p, i) => `<span class="${KC[i]}">${fmt(Math.abs(x - p))}</span>`).join(' + ');
      const atMin = x >= l - 1e-9 && x <= r + 1e-9;
      let t = `x = ${fmt(x)}：${multi ? '各段距离' : '到 a、b 的距离'}之和 = ${terms} = <b>${fmt(fx)}</b>。`;
      if (!multi) {
        const lo = Math.min(P[0], P[1]), hi = Math.max(P[0], P[1]);
        if (lo === hi) t += `a、b 重合，x 也在这一点时最小，最小值是 0。`;
        else if (atMin) t += `<br>x 在 a、b <b>之间</b>：两段拼起来正好是 a 到 b 的线段，总长 = ${hi} − (${fmt(lo)}) = ${hi - lo}，不管 x 在中间哪里都<b>不变</b>，这就是最小值（图象的“平底”）。`;
        else { const near = x < lo ? lo : hi; t += `<br>x 在 a、b 的${x < lo ? '左' : '右'}边：两段都要先走到 ${fmt(near)}，多走了一截 ${fmt(Math.abs(x - near))} 两次，总长 = ${hi - lo} + 2 × ${fmt(Math.abs(x - near))} = ${fmt(fx)}，比最小值大。`; }
      } else {
        const mid = n % 2 ? `中位数 ${fmt(l)}` : `中间两点 ${fmt(l)} 和 ${fmt(r)} 之间`;
        if (atMin) t += `<br>x 在${mid}，正是最小值 <b>${fmt(minV)}</b>。${showPair ? '所有配对的括号都包住了 x，每一对的距离和都等于这一对的长度。' : '点“两两配对看”可以看到原因。'}`;
        else t += `<br>还没到最小。最小值在${mid}处取到，等于 ${fmt(minV)}。${showPair ? '虚线括号没有包住 x：这一对的距离和比括号长度大。' : ''}`;
      }
      read.innerHTML = t;
    }
    makeHandles();
    draw();
  }
  A.c_abs_min_two = function (el) { absCore(el, [-3, 4], false); };
  A.c_abs_min_many = function (el) { absCore(el, [-4, 1, 3], true); };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
