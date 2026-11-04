// 奥数拓展 第 10 批（七年级竞赛入门）动画
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, grid, RM } = window.AH;
  const PI = Math.PI;
  const A = {};

  // ───────── 公共小工具 ─────────
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  // 最简分数文字：frac(6, 4) → '3/2'，frac(-2, 1) → '−2'
  function frac(p, q) {
    if (q < 0) { p = -p; q = -q; }
    const g = gcd(p, q); p /= g; q /= g;
    const s = q === 1 ? String(Math.abs(p)) : Math.abs(p) + '/' + q;
    return (p < 0 ? '−' : '') + s;
  }
  // 一次式 p·x + q；html 为真时字母用 <i>x</i>
  function lin(p, q, html) {
    const xv = html ? '<i>x</i>' : 'x';
    let s = '';
    if (Math.abs(p) > 1e-9) s = (p === 1 ? '' : p === -1 ? '−' : fmt(p)) + xv;
    if (Math.abs(q) > 1e-9 || !s) {
      if (s) s += q > 0 ? ' + ' + fmt(q) : ' − ' + fmt(-q);
      else s = fmt(q);
    }
    return s;
  }
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sup = (n) => String(n).split('').map((d) => SUP[+d]).join('');
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  // 数轴：返回坐标换算函数 X(v)
  function numLine(svg, x0, x1, y, min, max, every) {
    const X = (v) => x0 + ((v - min) * (x1 - x0)) / (max - min);
    const g = S('g', {}, svg);
    S('line', { x1: x0 - 12, x2: x1 + 12, y1: y, y2: y, class: 'stroke-strong' }, g);
    S('path', { d: `M${x1 + 18},${y} l-10,-5 v10 Z`, class: 'fill-strong' }, g);
    for (let v = min; v <= max; v++) {
      S('line', { x1: X(v), x2: X(v), y1: y - 5, y2: y + 5, class: 'stroke-strong' }, g);
      if (!every || v % every === 0) T(g, X(v), y + 20, fmt(v), 'tick');
    }
    return X;
  }
  // 拖拽
  function draggable(svg, elm, onMove, canStart) {
    elm.style.touchAction = 'none';
    elm.addEventListener('pointerdown', (e) => {
      if (canStart && !canStart()) return;
      e.preventDefault();
      elm.setPointerCapture(e.pointerId);
      const move = (ev) => onMove(svgPoint(svg, ev));
      const up = () => {
        elm.removeEventListener('pointermove', move);
        elm.removeEventListener('pointerup', up);
        elm.removeEventListener('pointercancel', up);
      };
      elm.addEventListener('pointermove', move);
      elm.addEventListener('pointerup', up);
      elm.addEventListener('pointercancel', up);
    });
  }
  // 圆弧（走较短的一边）；wedge 为真时画扇形
  function arcD(cx, cy, r, a1, a2, wedge) {
    let d = a2 - a1;
    while (d > PI) d -= 2 * PI;
    while (d <= -PI) d += 2 * PI;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a1 + d), y2 = cy + r * Math.sin(a1 + d);
    const arc = `A${r},${r} 0 0 ${d > 0 ? 1 : 0} ${x2},${y2}`;
    return wedge ? `M${cx},${cy} L${x1},${y1} ${arc} Z` : `M${x1},${y1} ${arc}`;
  }
  // 下拉框
  function pick(parent, label, options, value, onchange) {
    if (label) H('span', {}, parent, label);
    const s = H('select', { class: 'anim-input', style: 'width:auto' }, parent);
    options.forEach((o, i) => H('option', { value: i }, s, o));
    s.value = value;
    s.addEventListener('change', () => onchange(+s.value));
    return s;
  }
  // 数字输入框
  function numInput(parent, label, value) {
    if (label) H('span', {}, parent, label);
    return H('input', { class: 'anim-input', type: 'number', value, min: 1 }, parent);
  }
  // 竖式分数（SVG）
  function fracG(parent, x, y, num, den, cls) {
    const g = S('g', { transform: `translate(${x},${y})` }, parent);
    const w = Math.max(String(num).length, String(den).length) * 8 + 6;
    T(g, 0, -5, num, cls || '');
    S('line', { x1: -w / 2, x2: w / 2, y1: 0, y2: 0, class: 'sstrong thin' }, g);
    T(g, 0, 15, den, cls || '');
    return g;
  }

  // ════════════ c_abs 绝对值与零点分段 ════════════
  // 绝对值项 [s, m, n] 表示 s·|m·x + n|（s = ±1）
  function absText(terms, html) {
    return terms.map(([s, m, n], i) => (i === 0 ? (s < 0 ? '−' : '') : s < 0 ? ' − ' : ' + ') + '|' + lin(m, n, html) + '|').join('');
  }
  function pieces(terms) {
    const zs = [...new Set(terms.map(([, m, n]) => -n / m))].sort((a, b) => a - b);
    const segs = [];
    for (let j = 0; j <= zs.length; j++) {
      const lo = j === 0 ? -Infinity : zs[j - 1], hi = j === zs.length ? Infinity : zs[j];
      const xs = j === 0 ? hi - 1 : j === zs.length ? lo + 1 : (lo + hi) / 2;
      let P = 0, Q = 0;
      terms.forEach(([s, m, n]) => { const sg = m * xs + n > 0 ? 1 : -1; P += s * sg * m; Q += s * sg * n; });
      segs.push({ lo, hi, P, Q, xs });
    }
    return { zs, segs };
  }
  function segLabel(s, html) {
    const x = html ? '<i>x</i>' : 'x';
    if (s.lo === -Infinity) return `${x} &lt; ${fmt(s.hi)}`;
    if (s.hi === Infinity) return `${x} ≥ ${fmt(s.lo)}`;
    return `${fmt(s.lo)} ≤ ${x} &lt; ${fmt(s.hi)}`;
  }

  A.c_abs_zeros = function (el) {
    const PRE = [
      [[1, 1, 1], [1, 1, -2]],
      [[1, 1, -1], [-1, 1, 2]],
      [[1, 2, -4], [1, 1, 1]],
      [[1, 1, 2], [1, 1, 0], [1, 1, -3]],
      [[1, 1, 0], [1, 1, -1], [-1, 1, 2]]
    ];
    const W = 480, Hh = 240, yL = 112, MIN = -5, MAX = 5;
    const svg = stage(el, W, Hh);
    const title = T(svg, W / 2, 30, '', 'tl tb');
    const bands = S('g', {}, svg);
    const hl = S('rect', { class: 'fnone s2', y: yL - 17, height: 23, rx: 3 }, svg);
    const X = numLine(svg, 30, 450, yL, MIN, MAX);
    const U = X(1) - X(0);
    const zg = S('g', {}, svg);
    const fg = S('g', {}, svg);
    const handle = S('circle', { r: 11, cy: yL, class: 'handle' }, svg);
    const hT = T(svg, 0, yL - 24, '', 'tb');
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let cur = 0, terms = PRE[0], pc, x = 0.5, busy = false, fEls = [], gen = 0;
    const sel = pick(row, '式子：', PRE.map((p) => absText(p, false)), 0, (i) => {
      gen++; busy = false; cur = i; terms = PRE[i]; x = 0.5; build(); update();
    });
    const c = ctrl(el);
    function build() {
      pc = pieces(terms);
      title.textContent = '原式 = ' + absText(terms, false);
      bands.innerHTML = ''; zg.innerHTML = ''; fg.innerHTML = '';
      fEls = pc.segs.map((s, j) => {
        const a = s.lo === -Infinity ? MIN - 0.25 : s.lo, b = s.hi === Infinity ? MAX + 0.25 : s.hi;
        S('rect', { x: X(a), y: yL - 16, width: Math.max(0, X(b) - X(a)), height: 21, class: j % 2 ? 'f3s' : 'f1s' }, bands);
        const cx = (X(Math.max(a, MIN)) + X(Math.min(b, MAX))) / 2;
        const y = yL + (j % 2 ? 92 : 70);
        const t = T(fg, cx, y, lin(s.P, s.Q, false), j % 2 ? 't3 tb' : 't1 tb');
        t.setAttribute('opacity', 0);
        t._q = T(fg, cx, y, '原式 = ?', 'tm ts');
        return t;
      });
      pc.zs.forEach((z) => {
        S('circle', { cx: X(z), cy: yL, r: 6, class: 'f2' }, zg);
        T(zg, X(z), yL + 38, '零点', 't2 ts');
      });
    }
    function update() {
      handle.setAttribute('cx', X(x));
      hT.setAttribute('x', X(x));
      hT.textContent = 'x = ' + fmt(x);
      const j = pc.zs.filter((z) => z <= x + 1e-9).length;
      const s = pc.segs[j];
      const a = s.lo === -Infinity ? MIN - 0.25 : s.lo, b = s.hi === Infinity ? MAX + 0.25 : s.hi;
      hl.setAttribute('x', X(a)); hl.setAttribute('width', Math.max(0, X(b) - X(a)));
      const parts = terms.map(([sg, m, n]) => {
        const v = m * x + n, inner = lin(m, n, true);
        const pre = sg < 0 ? '（前面有减号）' : '';
        if (Math.abs(v) < 1e-9) return `${inner} = 0，|${inner}| = 0${pre}`;
        if (v > 0) return `${inner} = ${fmt(v)} &gt; 0，|${inner}| = ${inner}${pre}`;
        return `${inner} = ${fmt(v)} &lt; 0，|${inner}| = −(${inner}) = ${lin(-m, -n, true)}${pre}`;
      });
      const val = terms.reduce((acc, [sg, m, n]) => acc + sg * Math.abs(m * x + n), 0);
      read.innerHTML = `零点：${pc.zs.map(fmt).join('、')}（橙点），把数轴分成 ${pc.segs.length} 段。<br>${parts.join('<br>')}<br>所以在 <b>${segLabel(s, true)}</b> 这一段：<span class="k2">原式 = ${lin(s.P, s.Q, true)}</span>，代入 <i>x</i> = ${fmt(x)} 得 ${fmt(val)}。`;
    }
    draggable(svg, handle, (p) => {
      x = clamp(Math.round(((p.x - X(0)) / U) * 4) / 4, MIN, MAX);
      update();
    }, () => !busy);
    btn(c, '逐段化简', () => {
      if (busy) return;
      busy = true;
      const my = ++gen;
      const show = (f, v) => { f.setAttribute('opacity', v); f._q.setAttribute('opacity', 1 - v); };
      fEls.forEach((f) => show(f, 0));
      let j = 0;
      const next = () => {
        if (my !== gen) return;
        if (j >= pc.segs.length) { busy = false; return; }
        const from = x, to = clamp(pc.segs[j].xs, MIN, MAX), fe = fEls[j];
        tween(650, (t) => { if (my !== gen) return; x = lerp(from, to, t); update(); show(fe, t); }, () => {
          if (my !== gen) return;
          x = to; update(); j++;
          setTimeout(next, RM ? 0 : 900);
        });
      };
      next();
    });
    btn(c, '直接显示每段结果', () => { if (!busy) fEls.forEach((f) => { f.setAttribute('opacity', 1); f._q.setAttribute('opacity', 0); }); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：拖动数轴上的圆点改变 x，看每个绝对值里面是正还是负。');
    void sel; void cur;
    build(); update();
  };

  A.c_abs_solve = function (el) {
    const PRE = [
      { t: [[1, 1, -1], [1, 1, 2]], c: 5 },
      { t: [[1, 1, 1], [1, 2, -4]], c: 6 },
      { t: [[1, 1, -3], [-1, 1, 1]], c: 2 },
      { t: [[1, 1, -1], [1, 1, 2]], c: 3 },
      { t: [[1, 1, -1], [1, 1, 2]], c: 2 }
    ];
    const W = 480, Hh = 230, yL = 112, MIN = -5, MAX = 5;
    const svg = stage(el, W, Hh);
    const title = T(svg, W / 2, 30, '', 'tl tb');
    const bands = S('g', {}, svg);
    const hl = S('rect', { class: 'f2s', y: yL - 17, height: 23, rx: 3, opacity: 0 }, svg);
    const X = numLine(svg, 30, 450, yL, MIN, MAX);
    const zg = S('g', {}, svg);
    const mk = S('g', {}, svg);
    const stepT = T(svg, W / 2, 178, '', 'tb');
    const stepT2 = T(svg, W / 2, 204, '', 'tm');
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let P = PRE[0], pc, res, step = 0, lines = [];
    pick(row, '方程：', PRE.map((p) => absText(p.t, false) + ' = ' + p.c), 0, (i) => { P = PRE[i]; reset(); });
    const c = ctrl(el);
    const nb = btn(c, '下一步', next);
    btn(c, '从头再来', reset, 'alt');
    const inSeg = (s, v) => (s.lo === -Infinity || v >= s.lo - 1e-9) && (s.hi === Infinity || v < s.hi - 1e-9);
    function solve() {
      return pc.segs.map((s) => {
        if (s.P === 0) return { s, kind: s.Q === P.c ? 'all' : 'none' };
        const num = P.c - s.Q, v = num / s.P;
        return { s, kind: 'pt', v, txt: frac(num, s.P), ok: inSeg(s, v) };
      });
    }
    function reset() {
      pc = pieces(P.t); res = solve(); step = 0; lines = [];
      title.textContent = absText(P.t, false) + ' = ' + P.c;
      bands.innerHTML = ''; zg.innerHTML = ''; mk.innerHTML = '';
      hl.setAttribute('opacity', 0);
      stepT.textContent = '第 1 步：找零点'; stepT2.textContent = '让每个绝对值里面等于 0';
      nb.textContent = '下一步';
      read.innerHTML = '分段解方程分三步：<b>找零点 → 分段去绝对值 → 每段解出来再检验</b>。点“下一步”。';
    }
    const segX = (s) => [X(s.lo === -Infinity ? MIN - 0.25 : s.lo), X(s.hi === Infinity ? MAX + 0.25 : s.hi)];
    function next() {
      const ns = pc.segs.length;
      if (step === 0) {
        pc.segs.forEach((s, j) => {
          const [a, b] = segX(s);
          S('rect', { x: a, y: yL - 16, width: b - a, height: 21, class: j % 2 ? 'f3s' : 'f1s' }, bands);
        });
        pc.zs.forEach((z) => { S('circle', { cx: X(z), cy: yL, r: 6, class: 'f2' }, zg); T(zg, X(z), yL + 38, '零点', 't2 ts'); });
        const zt = P.t.map(([, m, n]) => `令 ${lin(m, n, true)} = 0，得 <i>x</i> = ${frac(-n, m)}`).join('；');
        lines.push(`<b>找零点：</b>${zt}。数轴被分成 ${ns} 段。`);
        stepT.textContent = `零点把数轴分成 ${ns} 段`;
        stepT2.textContent = '下面一段一段地去掉绝对值';
      } else if (step <= ns) {
        const r = res[step - 1], s = r.s;
        const [a, b] = segX(s);
        hl.setAttribute('x', a); hl.setAttribute('width', b - a);
        tween(300, (t) => hl.setAttribute('opacity', t));
        const head = `当 ${segLabel(s, true)} 时，原式 = ${lin(s.P, s.Q, true)}`;
        let tail;
        if (r.kind === 'pt') {
          tail = `，方程 ${lin(s.P, s.Q, true)} = ${P.c}，得 <i>x</i> = ${r.txt}，` + (r.ok ? '在这一段里 ✓' : '不在这一段里，舍去 ✗');
          stepT.textContent = `${lin(s.P, s.Q)} = ${P.c}  →  x = ${r.txt}  ${r.ok ? '✓' : '✗ 舍去'}`;
          stepT2.textContent = r.ok ? '解出来的数在这一段里，保留' : '解出来的数不在这一段的范围里，舍去';
          const vx = X(clamp(r.v, MIN - 0.25, MAX + 0.25));
          if (r.ok) {
            const dot = S('circle', { cx: vx, cy: yL, r: 0, class: 'f3' }, mk);
            T(mk, vx, yL - 22, r.txt, 't3 tb');
            tween(400, (t) => dot.setAttribute('r', 8 * t));
          } else {
            S('circle', { cx: vx, cy: yL, r: 7, class: 'fnone smuted' }, mk);
            T(mk, vx, yL - 44, '✗ ' + r.txt + ' 舍去', 'tm ts');
          }
        } else if (r.kind === 'all') {
          tail = `，${fmt(s.Q)} = ${P.c} 总成立，<b>这一段的每个数都是解</b> ✓`;
          stepT.textContent = `${fmt(s.Q)} = ${P.c} 总成立`;
          stepT2.textContent = '这一段里的每个数都是解';
          S('line', { x1: X(clamp(s.lo, MIN, MAX)), x2: X(clamp(s.hi, MIN, MAX)), y1: yL, y2: yL, class: 's3 thick round', style: 'stroke-width:6' }, mk);
          if (s.lo !== -Infinity) S('circle', { cx: X(s.lo), cy: yL, r: 7, class: 'f3' }, mk);
          if (s.hi !== Infinity) S('circle', { cx: X(s.hi), cy: yL, r: 7, class: 'fsurf s3' }, mk);
        } else {
          tail = `，${fmt(s.Q)} = ${P.c} 不成立，这一段<b>无解</b>`;
          stepT.textContent = `${fmt(s.Q)} = ${P.c} 不成立`;
          stepT2.textContent = '这一段没有解';
        }
        lines.push(head + tail);
      } else if (step === ns + 1) {
        hl.setAttribute('opacity', 0);
        const pts = res.filter((r) => r.kind === 'pt' && r.ok).map((r) => r.v);
        const ivs = res.filter((r) => r.kind === 'all').map((r) => ({ lo: r.s.lo, hi: r.s.hi, closed: false }));
        const lone = [];
        pts.forEach((v) => {
          const iv = ivs.find((q) => Math.abs(q.hi - v) < 1e-9);
          if (iv) iv.closed = true; else if (!ivs.some((q) => v >= q.lo && v < q.hi)) lone.push(v);
        });
        const parts = ivs.map((q) => `${fmt(q.lo)} ≤ <i>x</i> ${q.closed ? '≤' : '&lt;'} ${fmt(q.hi)}`)
          .concat(res.filter((r) => r.kind === 'pt' && r.ok && lone.includes(r.v)).map((r) => `<i>x</i> = ${r.txt}`));
        const sum = parts.length ? parts.join(' 或 ') : '方程无解';
        lines.push(`<b>结论：</b>${sum}。`);
        stepT.textContent = '把各段保留下来的解合在一起';
        stepT2.textContent = parts.length ? '绿色就是方程的解' : '每一段都没有解，方程无解';
        nb.textContent = '已完成';
      } else return;
      step++;
      read.innerHTML = lines.join('<br>');
    }
    reset();
  };

  // ════════════ c_rational_trick 有理数巧算 ════════════
  A.c_rational_trick_pair = function (el) {
    const W = 480, Hh = 230;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let mode = 0, n = 10, busy = false, gen = 0, done = false;
    pick(row, '算式：', ['正负交替 1 − 2 + 3 − 4 + …', '倒序相加 1 + 2 + 3 + … + n', '四个一组 1 − 2 − 3 + 4 + …'], 0, (i) => { mode = i; draw(); });
    const c = ctrl(el);
    slider(c, 'rtn', 'n', 4, 20, 1, n, (v) => { n = v; draw(); });
    const go = btn(c, '两两配对', act);
    btn(c, '重来', () => draw(), 'alt');
    const sg = (i) => (mode === 0 ? (i % 2 ? 1 : -1) : mode === 1 ? 1 : (i % 4 === 1 || i % 4 === 0 ? 1 : -1));
    let cw, x0, cx;
    function exprText() {
      const head = [1, 2, 3, 4].map((i) => (i === 1 ? '' : sg(i) > 0 ? ' + ' : ' − ') + i).join('');
      return head + ' + … ' + (sg(n) > 0 ? '+ ' : '− ') + n;
    }
    function draw() {
      gen++; busy = false; done = false;
      g.innerHTML = '';
      cw = Math.min(40, 440 / n); x0 = (W - n * cw) / 2;
      cx = (i) => x0 + (i - 0.5) * cw;
      const cls = cw < 28 ? 'ts' : '';
      T(g, W / 2, 26, exprText(), 'tm');
      for (let i = 1; i <= n; i++) {
        const s = sg(i);
        T(g, cx(i), 66, (i === 1 ? (s < 0 ? '−' : '') : s < 0 ? '−' : '+') + i, cls + (s < 0 ? ' t2' : ' t1'));
      }
      go.textContent = ['两两配对', '倒过来再写一遍', '四个一组'][mode];
      const total = Array.from({ length: n }, (_, k) => sg(k + 1) * (k + 1)).reduce((p, q) => p + q, 0);
      read.innerHTML = `一共 <b>${n}</b> 项。一个一个加太慢了，点“${go.textContent}”看看怎样让它们互相抵消。<span class="tm">（答案是 ${total}，看看巧算能不能一下得到它）</span>`;
    }
    function bracket(i1, i2, label, cls, y) {
      const a = cx(i1) - cw * 0.4, b = cx(i2) + cw * 0.4;
      S('path', { d: `M${a},${y} v8 H${b} v-8`, class: 'fnone ' + cls.replace('t', 's') + ' thin' }, g);
      T(g, (a + b) / 2, y + 24, label, cls + ' tb' + (cw < 28 ? ' ts' : ''));
    }
    function act() {
      if (busy || done) return;
      busy = true; done = true;
      const my = gen;
      const later = (ms, f) => setTimeout(() => { if (my === gen) f(); }, RM ? 0 : ms);
      if (mode === 0) {
        const pairs = Math.floor(n / 2), odd = n % 2 === 1;
        for (let k = 0; k < pairs; k++) later(k * 160, () => bracket(2 * k + 1, 2 * k + 2, '−1', 't2', 76));
        later(pairs * 160 + 100, () => {
          if (odd) {
            S('rect', { x: cx(n) - cw / 2, y: 48, width: cw, height: 26, rx: 4, class: 'f3s' }, g);
            T(g, cx(n), 108, '+' + n, 't3 tb');
          }
          const res = -pairs + (odd ? n : 0);
          T(g, W / 2, 160, `${pairs} 对，每对 1 − 2 = −1：(−1) × ${pairs}${odd ? ' + ' + n : ''} = ${fmt(res)}`, 'tb');
          T(g, W / 2, 190, odd ? `项数是奇数，最后的 ${n} 没有伙伴，要单独加上` : '项数是偶数，正好全部配成对', 'tm');
          read.innerHTML = `相邻两项配成一对：(1 − 2) + (3 − 4) + … 每一对都是 <b>−1</b>。共 ${n} 项，配成 ${pairs} 对${odd ? `，剩下最后一项 ${n}` : ''}，结果是 <span class="k2">${fmt(res)}</span>。`;
          busy = false;
        });
      } else if (mode === 1) {
        const items = [];
        for (let i = 1; i <= n; i++) {
          const t = T(g, cx(i), 106, String(n + 1 - i), (cw < 28 ? 'ts ' : '') + 't2');
          t.setAttribute('transform', `translate(${W},0)`);
          items.push(t);
        }
        tween(900, (t) => items.forEach((it) => it.setAttribute('transform', `translate(${W * (1 - t)},0)`)), () => {
          if (my !== gen) return;
          for (let i = 1; i <= n; i++) {
            later(i * 60, () => {
              S('line', { x1: cx(i) - cw * 0.35, x2: cx(i) + cw * 0.35, y1: 116, y2: 116, class: 'sline' }, g);
              T(g, cx(i), 136, String(n + 1), (cw < 28 ? 'ts ' : '') + 't3 tb');
            });
          }
          later(n * 60 + 200, () => {
            T(g, W / 2, 176, `每一列都是 ${n + 1}，一共 ${n} 列：2S = ${n + 1} × ${n} = ${n * (n + 1)}`, 'tb');
            T(g, W / 2, 204, `S = ${n * (n + 1)} ÷ 2 = ${(n * (n + 1)) / 2}`, 't3 tb');
            read.innerHTML = `把 S = 1 + 2 + … + ${n} 倒过来再写一遍，上下对齐相加：每列都是 <b>首项 + 末项 = ${n + 1}</b>。两个 S 的和是 ${n + 1} × ${n}，所以 S = <span class="k3">${(n * (n + 1)) / 2}</span>。`;
            busy = false;
          });
        });
      } else {
        const groups = Math.floor(n / 4), rest = n % 4;
        for (let k = 0; k < groups; k++) later(k * 220, () => bracket(4 * k + 1, 4 * k + 4, '0', 't3', 76));
        later(groups * 220 + 100, () => {
          let rs = 0;
          const restTxt = [];
          for (let i = 4 * groups + 1; i <= n; i++) {
            rs += sg(i) * i;
            restTxt.push((sg(i) < 0 ? '−' : restTxt.length ? '+' : '') + i);
            S('rect', { x: cx(i) - cw / 2, y: 48, width: cw, height: 26, rx: 4, class: 'f2s' }, g);
          }
          T(g, W / 2, 160, `每 4 个一组：1 − 2 − 3 + 4 = 0，${groups} 组都是 0`, 'tb');
          T(g, W / 2, 190, rest ? `剩下 ${restTxt.join(' ')} = ${fmt(rs)}，结果是 ${fmt(rs)}` : '没有剩余，结果是 0', rest ? 't2 tb' : 't3 tb');
          read.innerHTML = `符号按“+ − − +”循环，每 4 个一组：<i>k</i> − (<i>k</i> + 1) − (<i>k</i> + 2) + (<i>k</i> + 3) = 0。${n} ÷ 4 = ${groups} 组余 ${rest} 个，结果 = <b>${fmt(rs)}</b>。`;
          busy = false;
        });
      }
    }
    draw();
  };

  A.c_rational_trick_split = function (el) {
    const W = 480, Hh = 250;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let d = 1, n = 5, stage_ = 0, busy = false, gen = 0;
    pick(row, '类型：', ['1/(1×2) + 1/(2×3) + …（相差 1）', '1/(1×3) + 1/(3×5) + …（相差 2）'], 0, (i) => { d = i + 1; reset(); });
    const c = ctrl(el);
    slider(c, 'rsn', '项数', 2, 6, 1, n, (v) => { n = v; reset(); });
    const nb = btn(c, '裂项', next);
    btn(c, '重来', reset, 'alt');
    let terms, pieces2, c1, c2;
    function reset() {
      gen++; busy = false; stage_ = 0;
      g.innerHTML = '';
      terms = Array.from({ length: n }, (_, i) => [1 + i * d, 1 + i * d + d]);
      const w1 = 440 / n;
      c1 = (i) => 20 + w1 * (i + 0.5);
      terms.forEach(([a, b], i) => {
        if (i) T(g, 20 + w1 * i, 60, '+', 'tm');
        fracG(g, c1(i), 55, 1, `${a}×${b}`, n > 4 ? 'ts' : '');
      });
      nb.textContent = '裂项';
      const last = terms[n - 1][1];
      read.innerHTML = `每一项的分母都是两个相差 ${d} 的数相乘。直接通分很麻烦，点“裂项”把每一项拆成两个分数的差。<span class="tm">（最后一项分母 ${terms[n - 1][0]}×${last}）</span>`;
    }
    function next() {
      if (busy) return;
      const my = gen;
      const later = (ms, f) => setTimeout(() => { if (my === gen) f(); }, RM ? 0 : ms);
      if (stage_ === 0) {
        busy = true;
        const left = d === 2 ? 72 : 24, right = d === 2 ? 446 : 456;
        const w2 = (right - left) / (2 * n);
        c2 = (k) => left + w2 * (k + 0.5);
        if (d === 2) { T(g, 34, 140, '½ ×', 'tb'); T(g, right + 10, 140, ')', 'tl'); T(g, 62, 141, '(', 'tl'); }
        T(g, 10, 140, '=', 'tb');
        pieces2 = [];
        terms.forEach(([a, b], i) => {
          later(i * 320, () => {
            const pos = fracG(g, c1(i), 55, 1, a, 't1');
            const neg = fracG(g, c1(i), 55, 1, b, 't2');
            const sgP = T(g, c2(2 * i) - w2 / 2 + 3, 140, i ? '+' : '', 't1');
            const sgN = T(g, c2(2 * i + 1) - w2 / 2 + 3, 140, '−', 't2');
            sgP.setAttribute('opacity', 0); sgN.setAttribute('opacity', 0);
            pieces2[2 * i] = { g: pos, s: sgP }; pieces2[2 * i + 1] = { g: neg, s: sgN };
            tween(500, (t) => {
              pos.setAttribute('transform', `translate(${lerp(c1(i), c2(2 * i) + 4, t)},${lerp(55, 135, t)})`);
              neg.setAttribute('transform', `translate(${lerp(c1(i), c2(2 * i + 1) + 4, t)},${lerp(55, 135, t)})`);
              sgP.setAttribute('opacity', t); sgN.setAttribute('opacity', t);
            });
          });
        });
        later(n * 320 + 500, () => {
          busy = false; stage_ = 1; nb.textContent = '抵消';
          read.innerHTML = d === 1
            ? `裂项公式：${'<span class="k1">1/(<i>n</i>(<i>n</i> + 1)) = 1/<i>n</i> − 1/(<i>n</i> + 1)</span>'}。验算第一项：1/1 − 1/2 = 1/2 ✓。`
            : `裂项公式：<span class="k1">1/(<i>n</i>(<i>n</i> + 2)) = ½ × (1/<i>n</i> − 1/(<i>n</i> + 2))</span>。拆完两项相减得 2/(<i>n</i>(<i>n</i> + 2))，是原来的 2 倍，所以前面要乘 ½。`;
        });
      } else if (stage_ === 1) {
        busy = true;
        for (let i = 0; i < n - 1; i++) {
          later(i * 380, () => {
            const A1 = pieces2[2 * i + 1], B1 = pieces2[2 * i + 2];
            const xa = c2(2 * i + 1) + 4, xb = c2(2 * i + 2) + 4;
            S('path', { d: `M${xa},112 Q${(xa + xb) / 2},92 ${xb},112`, class: 'fnone s3' }, g);
            S('line', { x1: xa - 12, x2: xa + 12, y1: 148, y2: 122, class: 's3' }, g);
            S('line', { x1: xb - 12, x2: xb + 12, y1: 148, y2: 122, class: 's3' }, g);
            tween(350, (t) => { [A1, B1].forEach((p) => { p.g.setAttribute('opacity', 1 - 0.7 * t); p.s.setAttribute('opacity', 1 - 0.7 * t); }); });
          });
        }
        later((n - 1) * 380 + 300, () => {
          busy = false; stage_ = 2; nb.textContent = '看结果';
          read.innerHTML = `前一项减去的 1/${terms[0][1]}，正好被后一项加上的 1/${terms[1][0]} 抵消……中间全部两两抵消，<b>只剩下第一个和最后一个</b>。`;
        });
      } else if (stage_ === 2) {
        const b = terms[n - 1][1];
        const res = frac(b - 1, d * b);
        T(g, W / 2, 205, d === 1 ? `= 1 − 1/${b} = ${res}` : `= ½ × (1 − 1/${b}) = ½ × ${frac(b - 1, b)} = ${res}`, 'tl tb t3');
        stage_ = 3; nb.textContent = '已完成';
        read.innerHTML = `结果 = <span class="k3">${res}</span>。规律：${d === 1 ? `1/(1×2) + … + 1/(<i>n</i>(<i>n</i> + 1)) = <i>n</i>/(<i>n</i> + 1)` : '相差 2 的裂项，别忘了前面的 ½'}。改变项数再试一次。`;
      }
    }
    reset();
  };

  // ════════════ c_int_eq 不定方程与整数解 ════════════
  A.c_int_eq_grid = function (el) {
    const size = 380, MIN = -1, MAX = 13;
    const svg = stage(el, size, size);
    const G = grid(svg, size, MIN, MAX);
    const line = S('line', { class: 'fline', 'clip-path': G.clip }, svg);
    const scan = S('line', { class: 'guide', opacity: 0 }, svg);
    const dots = S('g', {}, svg);
    const lab = T(svg, size - 28, 44, '', 'tb', 'end');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 3, b = 5, cc = 31, onlyPos = false, busy = false, gen = 0, dotEls = {};
    slider(c, 'iga', 'a', 1, 6, 1, a, (v) => { a = v; draw(); });
    slider(c, 'igb', 'b', 1, 6, 1, b, (v) => { b = v; draw(); });
    slider(c, 'igc', 'c', 1, 40, 1, cc, (v) => { cc = v; draw(); });
    const c2 = ctrl(el);
    const tog = btn(c2, '只看正整数解', () => { onlyPos = !onlyPos; draw(); }, 'alt');
    btn(c2, '沿直线逐个找', scanRun);
    const posSols = () => { const r = []; for (let x = 1; a * x < cc; x++) if ((cc - a * x) % b === 0) r.push([x, (cc - a * x) / b]); return r; };
    function draw() {
      gen++; busy = false; scan.setAttribute('opacity', 0);
      const f = (x) => (cc - a * x) / b;
      line.setAttribute('x1', G.X(MIN - 1)); line.setAttribute('y1', G.Y(f(MIN - 1)));
      line.setAttribute('x2', G.X(MAX + 1)); line.setAttribute('y2', G.Y(f(MAX + 1)));
      lab.textContent = `${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${cc}`;
      dots.innerHTML = ''; dotEls = {};
      for (let x = MIN; x <= MAX; x++) {
        if ((cc - a * x) % b !== 0) continue;
        const y = (cc - a * x) / b;
        if (y < MIN || y > MAX) continue;
        const pos = x > 0 && y > 0;
        const d = S('circle', { cx: G.X(x), cy: G.Y(y), r: pos ? 6 : 4, class: pos ? 'f3' : 'fmuted' }, dots);
        if (!pos && onlyPos) d.setAttribute('opacity', 0.12);
        dotEls[x] = d;
      }
      tog.textContent = onlyPos ? '显示全部整数点' : '只看正整数解';
      const ps = posSols(), g0 = gcd(a, b);
      let txt = `直线上每个<b>整数点</b>（横、纵坐标都是整数）就是一组整数解。`;
      if (cc % g0 !== 0) txt += `<br><span class="k2">${a} 和 ${b} 的公因数 ${g0} 整除不了 ${cc}，左边总是 ${g0} 的倍数，所以<b>没有整数解</b>，直线一个整数点也不经过。</span>`;
      else if (!ps.length) txt += '<br>直线在第一象限里没有整数点：<b>没有正整数解</b>。';
      else {
        txt += `<br>正整数解（绿色）有 <span class="k3">${ps.length} 组</span>：${ps.map(([x, y]) => `(${x}, ${y})`).join('、')}。`;
        if (ps.some(([x, y]) => x > MAX || y > MAX)) txt += '（有的点在画面外面）';
        if (ps.length > 1) txt += `<br>相邻两组解：<i>x</i> 每次增加 ${b / g0}，<i>y</i> 就减少 ${a / g0}。`;
      }
      read.innerHTML = txt;
    }
    function scanRun() {
      if (busy) return;
      busy = true;
      const my = ++gen;
      const xmax = Math.min(MAX, Math.floor((cc - 1) / a));
      const found = [];
      let x = 1;
      const stepF = () => {
        if (my !== gen) return;
        if (x > xmax) {
          busy = false; scan.setAttribute('opacity', 0);
          read.innerHTML = `从 <i>x</i> = 1 试到 <i>x</i> = ${xmax}（再大 <i>y</i> 就不是正数了），找到 <span class="k3">${found.length} 组</span>正整数解${found.length ? '：' + found.map(([p, q]) => `(${p}, ${q})`).join('、') : ''}。`;
          return;
        }
        scan.setAttribute('x1', G.X(x)); scan.setAttribute('x2', G.X(x));
        scan.setAttribute('y1', G.Y(MIN)); scan.setAttribute('y2', G.Y(MAX));
        scan.setAttribute('opacity', 1);
        const rest = cc - a * x, ok = rest % b === 0;
        read.innerHTML = `<i>x</i> = ${x}：${cc} − ${a} × ${x} = ${rest}，${rest} ÷ ${b} ${ok ? `= <span class="k3">${rest / b}</span>，是整数 ✓` : '不是整数 ✗'}`;
        if (ok) {
          found.push([x, rest / b]);
          const d = dotEls[x];
          if (d) tween(500, (t) => d.setAttribute('r', 6 + 6 * Math.sin(PI * t)));
        }
        x++;
        setTimeout(stepF, RM ? 0 : 650);
      };
      stepF();
    }
    draw();
  };

  A.c_int_eq_try = function (el) {
    const PRE = [[3, 5, 31], [7, 4, 60], [2, 5, 23], [5, 3, 46], [4, 6, 25]];
    const W = 480, Hh = 300, L = 70, R = 392, top = 74, rh = 24;
    const svg = stage(el, W, Hh);
    const title = T(svg, W / 2, 26, '', 'tl tb');
    const sub = T(svg, W / 2, 52, '', 'tm ts');
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let P = PRE[0], t = 0, busy = false, gen = 0, info;
    pick(row, '方程：', PRE.map(([a, b, c]) => `${a}x + ${b}y = ${c}`), 0, (i) => { P = PRE[i]; reset(); });
    const c = ctrl(el);
    const nb = btn(c, '试下一个', () => tryOne(true));
    btn(c, '一口气试完', all);
    btn(c, '重来', reset, 'alt');
    function reset() {
      gen++; busy = false; t = 0; g.innerHTML = '';
      const [a, b, cc] = P;
      // 系数大的未知数拿来试
      const vx = a > b; // true：试 x
      const big = vx ? a : b, small = vx ? b : a;
      const tv = vx ? 'x' : 'y', ov = vx ? 'y' : 'x';
      const max = Math.floor((cc - small) / big);
      info = { a, b, cc, big, small, tv, ov, max, found: [] };
      title.textContent = `${a}x + ${b}y = ${cc}，求正整数解`;
      sub.textContent = `${tv} 的系数大，拿 ${tv} 来试：${ov} ≥ 1，所以 ${big}${tv} ≤ ${cc} − ${small}，${tv} ≤ ${max}`;
      T(g, L + 2, top - 4, `■ 橙色：${big} 的倍数（${big}${tv}）   ■ 蓝色：剩下的能不能分成 ${small} 一份`, 'ts tm', 'start');
      nb.textContent = '试下一个';
      read.innerHTML = `把 ${cc} 看成一根长条：先拿出 ${tv} 份 ${big}，剩下的部分如果正好能切成若干份 ${small}，就得到一组解。${tv} 只能从 1 试到 ${max}。`;
    }
    function tryOne(anim) {
      if (busy && anim) return false;
      const I = info;
      if (t >= I.max) { finish(); return false; }
      t++;
      const y = top + 10 + (t - 1) * rh, uw = (R - L) / I.cc;
      const used = I.big * t, rest = I.cc - used, ok = rest % I.small === 0;
      T(g, L - 8, y + 15, `${I.tv} = ${t}`, 'ts', 'end');
      const parts = [];
      for (let k = 0; k < t; k++) parts.push(S('rect', { x: L + k * I.big * uw, y, width: I.big * uw, height: rh - 6, class: 'f2s s2 thin' }, g));
      const nk = Math.floor(rest / I.small);
      for (let k = 0; k < nk; k++) parts.push(S('rect', { x: L + used * uw + k * I.small * uw, y, width: I.small * uw, height: rh - 6, class: 'f1s s1 thin' }, g));
      if (!ok) parts.push(S('rect', { x: L + (used + nk * I.small) * uw, y, width: (rest % I.small) * uw, height: rh - 6, class: 'fsurf2 smuted thin' }, g));
      const res = ok ? `✓ ${I.ov} = ${rest / I.small}` : `✗ 余 ${rest % I.small}`;
      T(g, R + 8, y + 14, res, (ok ? 't3' : 'tm') + ' ts tb', 'start');
      if (anim) {
        busy = true;
        const my = gen;
        parts.forEach((p) => p.setAttribute('opacity', 0));
        parts.forEach((p, i) => setTimeout(() => { if (my === gen) p.setAttribute('opacity', 1); }, RM ? 0 : i * 70));
        setTimeout(() => { if (my === gen) busy = false; }, RM ? 0 : parts.length * 70 + 50);
      }
      if (ok) I.found.push(I.tv === 'x' ? [t, rest / I.small] : [rest / I.small, t]);
      read.innerHTML = `${I.tv} = ${t}：${I.cc} − ${I.big} × ${t} = ${rest}，${rest} ÷ ${I.small} ${ok ? `= ${rest / I.small}，正好分完 ✓` : `不能整除（余 ${rest % I.small}）✗`}`;
      if (t >= I.max) finish();
      return true;
    }
    function finish() {
      const I = info;
      nb.textContent = '已试完';
      const odd = gcd(I.a, I.b) > 1 && I.cc % gcd(I.a, I.b) !== 0;
      read.innerHTML = `试完了 ${I.tv} = 1 ～ ${I.max}，正整数解共 <span class="k3">${I.found.length} 组</span>${I.found.length ? '：' + I.found.map(([x, y]) => `<i>x</i> = ${x}，<i>y</i> = ${y}`).join('；') : ''}。` +
        (odd ? `<br>其实一眼就能看出来：${I.a}<i>x</i> 和 ${I.b}<i>y</i> 都是 ${gcd(I.a, I.b)} 的倍数，和也是 ${gcd(I.a, I.b)} 的倍数，而 ${I.cc} 不是，所以<b>根本没有整数解</b>。` : '');
    }
    function all() {
      if (busy) return;
      while (t < info.max) tryOne(false);
      finish();
    }
    reset();
  };

  // ════════════ c_param_eq 含参方程 ════════════
  A.c_param_eq_slider = function (el) {
    const W = 480, Hh = 215, yL = 150, MIN = -6, MAX = 6;
    const svg = stage(el, W, Hh);
    const title = T(svg, W / 2, 32, '', 'tl tb');
    const status = T(svg, W / 2, 72, '', 'tl tb');
    const whole = S('line', { y1: yL, y2: yL, class: 's3', style: 'stroke-width:7;opacity:.75' }, svg);
    const X = numLine(svg, 30, 450, yL, MIN, MAX);
    const dot = S('circle', { cy: yL, r: 8, class: 'f1' }, svg);
    const dotT = T(svg, 0, yL - 18, '', 't1 tb');
    const arrow = S('path', { class: 'f1' }, svg);
    const cross = T(svg, W / 2, yL - 30, '', 't2 tb');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 3, b = 4, busy = false, gen = 0;
    const sa = slider(c, 'pea', 'a', -3, 5, 0.5, a, (v) => { gen++; busy = false; a = v; update(); });
    slider(c, 'peb', 'b', -4, 4, 1, b, (v) => { b = v; update(); });
    btn(c, '让 a 从 −3 走到 5', sweep);
    const kx = (k) => (Math.abs(k - 1) < 1e-9 ? 'x' : Math.abs(k + 1) < 1e-9 ? '−x' : fmt(k) + 'x');
    function update() {
      const k = a - 1;
      title.textContent = `(${fmt(a)} − 1)x = ${fmt(b)}，即 ${kx(k)} = ${fmt(b)}`;
      whole.setAttribute('opacity', 0); dot.setAttribute('opacity', 0); dotT.textContent = ''; arrow.setAttribute('d', ''); cross.textContent = '';
      if (Math.abs(k) < 1e-6) {
        if (b === 0) {
          status.setAttribute('class', 'tl tb t3'); status.textContent = '无数解';
          whole.setAttribute('x1', X(MIN) - 10); whole.setAttribute('x2', X(MAX) + 10); whole.setAttribute('opacity', 1);
          read.innerHTML = '<i>a</i> = 1 时左边是 0<i>x</i>，0 乘任何数都得 0；右边 <i>b</i> 也是 0。<b>任何数都是解</b>，整条数轴都亮了。';
        } else {
          status.setAttribute('class', 'tl tb t2'); status.textContent = '无解';
          cross.textContent = `0 · x 永远是 0，不可能等于 ${fmt(b)}`;
          read.innerHTML = `<i>a</i> = 1 时左边是 0<i>x</i>，不管 <i>x</i> 是几都得 0，可右边是 ${fmt(b)}，<b>找不到解</b>。`;
        }
        return;
      }
      const x = b / k;
      status.setAttribute('class', 'tl tb t1');
      status.textContent = `唯一解 x = ${fmt(b)} ÷ ${fmt(k)} = ${fmt(x)}`;
      if (x >= MIN && x <= MAX) {
        dot.setAttribute('cx', X(x)); dot.setAttribute('opacity', 1);
        dotT.setAttribute('x', X(x)); dotT.textContent = 'x = ' + fmt(x);
      } else {
        const right = x > MAX, ex = right ? X(MAX) + 16 : X(MIN) - 16;
        arrow.setAttribute('d', right ? `M${ex + 10},${yL - 22} l-12,-7 v14 Z` : `M${ex - 10},${yL - 22} l12,-7 v14 Z`);
        dotT.setAttribute('x', right ? X(MAX) - 30 : X(MIN) + 30); dotT.textContent = `x = ${fmt(x)}，跑出画面了`;
      }
      read.innerHTML = `<i>a</i> − 1 = ${fmt(k)} ≠ 0，两边除以 ${fmt(k)}，得 <i>x</i> = ${fmt(x)}，<b>只有这一个解</b>。<i>a</i> 越靠近 1，除数越接近 0，解就跑得越远。`;
    }
    function sweep() {
      if (busy) return;
      busy = true;
      const my = ++gen;
      const run = (from, to, done) => tween(2400, (t) => { if (my !== gen) return; a = lerp(from, to, t); sa.set(Math.round(a * 100) / 100); update(); }, () => { if (my === gen) done(); });
      run(-3, 0.999, () => {
        a = 1; sa.set(1); update();
        setTimeout(() => { if (my === gen) run(1.001, 5, () => { a = 5; sa.set(5); update(); busy = false; }); }, RM ? 0 : 1300);
      });
    }
    update();
  };

  A.c_param_eq_move = function (el) {
    const W = 480, Hh = 200, Y0 = 92;
    const svg = stage(el, W, Hh);
    T(svg, W / 2, 30, '关于 x 的方程  mx − 2 = 3x + n', 'tm');
    const tg = S('g', {}, svg);
    const cap = T(svg, W / 2, 140, '', 't2 tb');
    const note = T(svg, W / 2, 172, '', 'tm ts');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let m = 5, n = 1, step = 0, busy = false, gen = 0, els = {};
    slider(c, 'pmm', 'm', -2, 6, 1, m, (v) => { m = v; reset(); });
    slider(c, 'pmn', 'n', -4, 4, 1, n, (v) => { n = v; reset(); });
    const nb = btn(c, '下一步', next);
    btn(c, '重来', reset, 'alt');
    const kx = (k) => (k === 1 ? 'x' : k === -1 ? '−x' : fmt(k) + 'x');
    const sgn = (v) => (v < 0 ? '− ' + fmt(-v) : '+ ' + fmt(v));
    function tokens(st) {
      const k = m - 3, r = n + 2;
      if (st === 0) return [['L1', kx(m), ''], ['L2', '− 2', ''], ['EQ', '=', ''], ['R1', '3x', ''], ['R2', sgn(n), '']];
      if (st === 1) return [['L1', kx(m), ''], ['R1', '− 3x', 't2'], ['EQ', '=', ''], ['R2', fmt(n), ''], ['L2', '+ 2', 't2']];
      if (st === 2) return [['L1', `(${fmt(m)} − 3)x`, 't1'], ['EQ', '=', ''], ['R2', `${fmt(n)} + 2`, 't1']];
      if (st === 3) return [['L1', k === 0 ? '0x' : kx(k), 't1'], ['EQ', '=', ''], ['R2', fmt(r), 't1']];
      if (k !== 0) return [['L1', 'x', 't3'], ['EQ', '=', ''], ['R2', frac(r, k), 't3']];
      return [['L1', '0x', 't2'], ['EQ', '=', ''], ['R2', fmt(r), 't2']];
    }
    const CAP = [
      '目标：把方程整理成 ax = b 的样子',
      '移项要变号：3x 移到左边变 −3x，−2 移到右边变 +2',
      '合并同类项',
      '整理好了：a = m − 3，b = n + 2',
      ''
    ];
    function layout(tk) {
      const ws = tk.map(([, s]) => s.length * 11 + 4);
      const total = ws.reduce((p, q) => p + q, 0) + 14 * (tk.length - 1);
      let x = W / 2 - total / 2;
      const pos = {};
      tk.forEach(([id], i) => { pos[id] = x + ws[i] / 2; x += ws[i] + 14; });
      return pos;
    }
    function render(st, anim) {
      const tk = tokens(st), pos = layout(tk);
      const my = ++gen;
      const eqOld = els.EQ ? els.EQ.x : pos.EQ;
      Object.keys(els).forEach((id) => {
        if (id in pos) return;
        const o = els[id]; delete els[id];
        const tx = o.x < eqOld ? pos.L1 : pos.R2, fx = o.x;
        if (!anim) { o.el.remove(); return; }
        tween(600, (t) => { o.el.setAttribute('x', lerp(fx, tx, t)); o.el.setAttribute('opacity', 1 - t); }, () => o.el.remove());
      });
      tk.forEach(([id, s, cls]) => {
        let o = els[id];
        if (!o) {
          o = els[id] = { el: T(tg, pos[id], Y0, s, 'tl tb ' + cls), x: pos[id] };
          if (anim) { o.el.setAttribute('opacity', 0); tween(500, (t) => o.el.setAttribute('opacity', t)); }
          return;
        }
        const fx = o.x, tx = pos[id], cross = id !== 'EQ' && (fx - eqOld) * (tx - pos.EQ) < 0;
        o.x = tx;
        if (!anim) { o.el.setAttribute('x', tx); o.el.setAttribute('y', Y0); o.el.textContent = s; o.el.setAttribute('class', 'tl tb ' + cls); return; }
        let swapped = false;
        tween(cross ? 900 : 600, (t) => {
          if (my !== gen) return;
          o.el.setAttribute('x', lerp(fx, tx, t));
          o.el.setAttribute('y', Y0 - (cross ? 42 * Math.sin(PI * t) : 0));
          if (!swapped && t >= 0.5) { swapped = true; o.el.textContent = s; o.el.setAttribute('class', 'tl tb ' + cls); }
        });
      });
      const k = m - 3, r = n + 2;
      if (st < 4) {
        cap.textContent = CAP[st]; cap.setAttribute('class', 't2 tb');
        note.textContent = st === 3 ? (k === 0 ? 'a = 0，不能两边除以 a，要再看 b' : 'a ≠ 0，可以两边除以 a') : '';
      } else if (k !== 0) {
        cap.textContent = `a = ${k} ≠ 0：有唯一解 x = ${frac(r, k)}`; cap.setAttribute('class', 't3 tb');
        note.textContent = '两边同时除以 a';
      } else if (r === 0) {
        cap.textContent = 'a = 0 且 b = 0：无数解'; cap.setAttribute('class', 't3 tb');
        note.textContent = '0x = 0，任何数代进去都成立';
      } else {
        cap.textContent = `a = 0 但 b = ${r} ≠ 0：无解`; cap.setAttribute('class', 't2 tb');
        note.textContent = `0x 永远等于 0，不可能等于 ${r}`;
      }
      read.innerHTML = `现在 <i>m</i> = ${m}，<i>n</i> = ${n}。整理后 (<i>m</i> − 3)<i>x</i> = <i>n</i> + 2：` +
        '<i>m</i> ≠ 3 时唯一解；<i>m</i> = 3 且 <i>n</i> = −2 时无数解；<i>m</i> = 3 且 <i>n</i> ≠ −2 时无解。' +
        (st === 4 ? '' : '<br><span class="tm">点“下一步”一步步整理。试试把 m 拖到 3，再把 n 拖到 −2。</span>');
    }
    function next() {
      if (busy || step >= 4) return;
      busy = true;
      step++;
      render(step, true);
      setTimeout(() => { busy = false; }, RM ? 0 : 950);
      nb.textContent = step >= 4 ? '已完成' : '下一步';
    }
    function reset() {
      gen++; busy = false; step = 0;
      tg.innerHTML = ''; els = {};
      nb.textContent = '下一步';
      render(0, false);
    }
    reset();
  };

  // ════════════ c_ineq_adv 不等式综合 ════════════
  A.c_ineq_adv_count = function (el) {
    const W = 480, Hh = 270, y1 = 108, y2 = 222, MIN = -4, MAX = 6;
    const svg = stage(el, W, Hh);
    const title = T(svg, W / 2, 28, '', 'tl tb');
    const cntT = T(svg, W / 2, 60, '', 't3 tb');
    const shade = S('g', {}, svg);
    const X = numLine(svg, 30, 450, y1, MIN, MAX);
    const ints = S('g', {}, svg);
    const sub = T(svg, 30, y2 - 40, '', 'tm ts', 'start');
    const band = S('g', {}, svg);
    numLine(svg, 30, 450, y2, MIN, MAX);
    const aMark = S('path', { class: 'f2' }, svg);
    const aT = T(svg, 0, y2 - 24, 'a', 't2 tb');
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let a = 0.5, b = 3, sL = true, sR = false, k = 3, reveal = -Infinity, busy = false, gen = 0;
    const resetReveal = () => { gen++; busy = false; reveal = -Infinity; };
    pick(row, '', ['x > a', 'x ≥ a'], 0, (i) => { sL = i === 0; resetReveal(); draw(); });
    pick(row, '', ['x < b', 'x ≤ b'], 1, (i) => { sR = i === 0; resetReveal(); draw(); });
    pick(row, '要求整数解恰好', ['1 个', '2 个', '3 个', '4 个'], 2, (i) => { k = i + 1; resetReveal(); draw(); });
    const c = ctrl(el);
    const sa = slider(c, 'iaa', 'a', -3, 4, 0.25, a, (v) => { gen++; busy = false; a = v; draw(); });
    slider(c, 'iab', 'b', -1, 5, 1, b, (v) => { b = v; resetReveal(); draw(); });
    btn(c, '扫一扫：a 从 −3 走到 4', sweep);
    const inSet = (v, av) => (sL ? v > av + 1e-9 : v >= av - 1e-9) && (sR ? v < b - 1e-9 : v <= b + 1e-9);
    const sols = (av) => { const r = []; for (let v = -12; v <= 12; v++) if (inSet(v, av)) r.push(v); return r; };
    function range() {
      const topI = sR ? b - 1 : b;
      return sL ? { lo: topI - k, hi: topI - k + 1, loC: true, hiC: false } : { lo: topI - k, hi: topI - k + 1, loC: false, hiC: true };
    }
    function draw() {
      title.textContent = `{ x ${sL ? '>' : '≥'} a，x ${sR ? '<' : '≤'} ${b} }    现在 a = ${fmt(a)}`;
      shade.innerHTML = ''; ints.innerHTML = ''; band.innerHTML = '';
      const has = a < b || (a === b && !sL && !sR);
      if (has) {
        const xa = X(clamp(a, MIN - 0.3, MAX)), xb = X(b);
        S('line', { x1: xa, x2: xb, y1: y1, y2: y1, class: 's1', style: 'stroke-width:6;opacity:.8' }, shade);
        if (a >= MIN - 0.3) S('circle', { cx: xa, cy: y1, r: 6, class: sL ? 'fsurf s1' : 'f1' }, shade);
        S('circle', { cx: xb, cy: y1, r: 6, class: sR ? 'fsurf s1' : 'f1' }, shade);
      }
      const ss = sols(a);
      ss.forEach((v) => { if (v >= MIN && v <= MAX) S('circle', { cx: X(v), cy: y1 - 20, r: 7, class: 'f3' }, ints); });
      cntT.textContent = ss.length ? `整数解：${ss.map(fmt).join('、')}，共 ${ss.length} 个` : '没有整数解';
      cntT.setAttribute('class', ss.length === k ? 't3 tb' : 'tm tb');
      // 第二条数轴：a 的范围
      const R = range();
      sub.textContent = `下面这条数轴记录：a 取哪些值时，整数解恰好 ${k} 个`;
      if (reveal > R.lo) {
        const hiShow = Math.min(R.hi, reveal);
        S('line', { x1: X(R.lo), x2: X(hiShow), y1: y2, y2: y2, class: 's3', style: 'stroke-width:7;opacity:.8' }, band);
        S('circle', { cx: X(R.lo), cy: y2, r: 6, class: R.loC ? 'f3' : 'fsurf s3' }, band);
        if (reveal >= R.hi) S('circle', { cx: X(R.hi), cy: y2, r: 6, class: R.hiC ? 'f3' : 'fsurf s3' }, band);
      }
      const xa2 = X(clamp(a, MIN, MAX));
      aMark.setAttribute('d', `M${xa2},${y2 - 8} l-6,-10 h12 Z`);
      aT.setAttribute('x', xa2);
      let txt = has ? `解集在数轴上是蓝色部分，绿点是其中的整数（${ss.length} 个）。` : '两个条件没有公共部分：<b>不等式组无解</b>。';
      if (reveal >= R.hi || reveal === Infinity) {
        const nLo = sols(R.lo).length, nHi = sols(R.hi).length;
        txt += `<br><span class="k3">恰有 ${k} 个整数解 ⇔ ${fmt(R.lo)} ${R.loC ? '≤' : '&lt;'} <i>a</i> ${R.hiC ? '≤' : '&lt;'} ${fmt(R.hi)}</span>。` +
          `端点要单独检验：<i>a</i> = ${fmt(R.lo)} 时整数解有 ${nLo} 个（${nLo === k ? '能取等' : '不能取等'}），<i>a</i> = ${fmt(R.hi)} 时有 ${nHi} 个（${nHi === k ? '能取等' : '不能取等'}）。`;
      } else txt += `<br><span class="tm">点“扫一扫”，让 a 从左往右走，看整数解的个数什么时候正好是 ${k}。</span>`;
      read.innerHTML = txt;
    }
    function sweep() {
      if (busy) return;
      busy = true;
      const my = ++gen;
      reveal = -Infinity;
      tween(4200, (t, raw) => {
        if (my !== gen) return;
        a = lerp(-3, 4, raw); reveal = a; sa.set(Math.round(a * 4) / 4); draw();
      }, () => {
        if (my !== gen) return;
        // 扫完后停在范围中间，方便对照
        a = range().lo + 0.5; reveal = Infinity; sa.set(a); busy = false; draw();
      });
    }
    draw();
  };

  A.c_ineq_adv_flip = function (el) {
    const W = 480, Hh = 230, yL = 190, MIN = -6, MAX = 6;
    const svg = stage(el, W, Hh);
    const l1 = T(svg, W / 2, 34, '', 'tl tb');
    const g2 = S('g', {}, svg);
    const xT = T(g2, W / 2 - 60, 96, 'x', 'txl');
    const sgT = T(g2, W / 2, 96, '>', 'txl t2');
    const vT = T(g2, W / 2 + 70, 96, '', 'txl');
    const note = T(svg, W / 2, 136, '', 't2 tb');
    const shade = S('g', {}, svg);
    const X = numLine(svg, 30, 450, yL, MIN, MAX);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = -2, b = 4, busy = false, gen = 0;
    slider(c, 'ifa', 'a', -3, 3, 0.5, a, (v) => { a = v; draw(true); });
    slider(c, 'ifb', 'b', -4, 4, 1, b, (v) => { b = v; draw(true); });
    btn(c, '两边同时除以 a', demo);
    const kx = (k) => (k === 1 ? 'x' : k === -1 ? '−x' : fmt(k) + 'x');
    function setSign(deg) { sgT.setAttribute('transform', `rotate(${deg},${W / 2},${90})`); }
    function draw(final) {
      gen++; busy = false;
      l1.textContent = `${kx(a)} > ${fmt(b)}`;
      shade.innerHTML = '';
      setSign(0);
      if (a === 0) {
        const ok = 0 > b;
        xT.textContent = '0'; sgT.textContent = '>'; vT.textContent = fmt(b);
        note.textContent = ok ? `0 > ${fmt(b)} 总成立：任何数都是解` : `0 > ${fmt(b)} 不成立：无解`;
        note.setAttribute('class', ok ? 't3 tb' : 't2 tb');
        if (ok) S('line', { x1: X(MIN) - 10, x2: X(MAX) + 10, y1: yL, y2: yL, class: 's3', style: 'stroke-width:7;opacity:.8' }, shade);
        read.innerHTML = `<i>a</i> = 0 时左边是 0<i>x</i> = 0，<b>不能两边除以 0</b>，要直接看 0 &gt; ${fmt(b)} 对不对：${ok ? '对，所以任何数都是解' : '不对，所以无解'}。`;
        g2.setAttribute('opacity', 1);
        return;
      }
      const v = b / a;
      g2.setAttribute('opacity', 1);
      xT.textContent = 'x'; vT.textContent = fmt(v);
      sgT.textContent = final && a < 0 ? '<' : '>';
      note.textContent = a > 0 ? `除以正数 ${fmt(a)}，不等号方向不变` : `除以负数 ${fmt(a)}，不等号要改变方向！`;
      note.setAttribute('class', a > 0 ? 't1 tb' : 't2 tb');
      const right = a > 0;
      const xv = X(clamp(v, MIN - 0.3, MAX + 0.3));
      S('line', { x1: xv, x2: right ? X(MAX) + 12 : X(MIN) - 12, y1: yL, y2: yL, class: 's1', style: 'stroke-width:6;opacity:.8' }, shade);
      S('circle', { cx: xv, cy: yL, r: 6, class: 'fsurf s1' }, shade);
      T(shade, xv, yL - 16, right ? `x > ${fmt(v)}` : `x < ${fmt(v)}`, 't1 tb');
      read.innerHTML = `${kx(a)} &gt; ${fmt(b)}，两边除以 <i>a</i> = ${fmt(a)}：` + (a > 0 ? `正数，方向不变，<b><i>x</i> &gt; ${fmt(v)}</b>。` : `<span class="k2">负数，“&gt;”要变成“&lt;”</span>，<b><i>x</i> &lt; ${fmt(v)}</b>。验算：取 <i>x</i> = ${fmt(v - 1)}，${fmt(a)} × (${fmt(v - 1)}) = ${fmt(a * (v - 1))} &gt; ${fmt(b)} ✓`);
    }
    function demo() {
      if (busy || a === 0) return;
      busy = true;
      const my = ++gen;
      sgT.textContent = '>'; setSign(0);
      g2.setAttribute('opacity', 0);
      tween(500, (t) => { if (my === gen) g2.setAttribute('opacity', t); }, () => {
        if (my !== gen) return;
        if (a > 0) { busy = false; return; }
        setTimeout(() => {
          if (my !== gen) return;
          tween(900, (t) => { if (my === gen) setSign(180 * t); }, () => {
            if (my !== gen) return;
            setSign(0); sgT.textContent = '<'; busy = false;
          });
        }, RM ? 0 : 400);
      });
    }
    draw(true);
  };

  // ════════════ c_integer 整数问题 ════════════
  A.c_integer_cycle = function (el) {
    const W = 480, Hh = 262;
    const svg = stage(el, W, Hh);
    const cxs = [90, 190, 290, 390];
    const hl = S('rect', { y: 30, width: 92, height: 226, rx: 8, class: 'f2s', opacity: 0 }, svg);
    ['n÷4 余 1', '余 2', '余 3', '余 0（整除）'].forEach((s, i) => T(svg, cxs[i], 48, s, 'ts tm'));
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let base = 2, digits = [], busy = false;
    pick(row, '底数：', ['2', '3', '4', '5', '6', '7', '8', '9'], 0, (i) => { base = i + 2; reset(); });
    const inp = numInput(row, '　n =', 2026);
    const c = ctrl(el);
    btn(c, '下一项', () => add(true));
    btn(c, '一下生成 12 项', () => { while (digits.length < 12) add(false); explain(); });
    btn(c, '求第 n 项的个位', query);
    btn(c, '重来', reset, 'alt');
    function reset() {
      g.innerHTML = ''; digits = []; hl.setAttribute('opacity', 0); busy = false;
      add(false);
      read.innerHTML = `只看个位：${base}<sup>1</sup> 的个位是 ${base}。下一项的个位 = 上一项的个位 × ${base}，再取个位。点“下一项”一个个生成。`;
    }
    function add(anim) {
      if (digits.length >= 16) { read.innerHTML = '表格满了。点“求第 n 项的个位”试试大数。'; return; }
      const k = digits.length + 1;
      const prev = digits[k - 2];
      const d = k === 1 ? base % 10 : (prev * base) % 10;
      digits.push(d);
      const col = (k - 1) % 4, rw = Math.floor((k - 1) / 4);
      const x = cxs[col], y = 80 + rw * 46;
      const cell = S('g', {}, g);
      S('rect', { x: x - 40, y: y - 20, width: 80, height: 40, rx: 6, class: 'fsurf2' }, cell);
      T(cell, x - 22, y + 5, `${base}${sup(k)}`, 'ts tm');
      T(cell, x + 16, y + 9, String(d), 'txl ' + ['t1', 't2', 't3', ''][col]);
      if (anim) {
        cell.setAttribute('opacity', 0);
        tween(350, (t) => cell.setAttribute('opacity', t));
        read.innerHTML = k === 1 ? `${base}<sup>1</sup> 的个位是 ${d}。` : `${base}<sup>${k}</sup> 的个位：上一个个位 ${prev} × ${base} = ${prev * base}，取个位 <b>${d}</b>。`;
        if (k > 4) explain(true);
      }
    }
    function period() { for (const p of [1, 2, 4]) if (digits.length > p && digits.every((d, i) => i < p || d === digits[i - p])) return p; return 4; }
    function explain(append) {
      const p = period();
      const s = `个位按 <b>${digits.slice(0, p).join('、')}</b> 循环，周期是 ${p}${p < 4 ? '（4 是它的倍数，所以每一列的数字也都一样）' : ''}：同一列的个位全都相同！`;
      read.innerHTML = append ? read.innerHTML + '<br>' + s : s;
    }
    function query() {
      if (busy) return;
      const n = Math.floor(+inp.value);
      if (!(n >= 1) || n > 1e12) { read.innerHTML = '请输入一个正整数 n。'; return; }
      while (digits.length < 4) add(false);
      const r = n % 4, col = r === 0 ? 3 : r - 1, q = Math.floor(n / 4);
      hl.setAttribute('x', cxs[col] - 46);
      busy = true;
      tween(500, (t) => hl.setAttribute('opacity', 0.9 * t), () => { busy = false; });
      read.innerHTML = `${n} ÷ 4 = ${q} 余 ${r}${r === 0 ? '（整除，看“余 0”那一列，也就是周期的最后一个）' : `，看“余 ${r}”那一列`}。<br>所以 ${base}<sup>${n}</sup> 的个位是 <span class="k2">${digits[col]}</span>。`;
    }
    reset();
  };

  A.c_integer_clock = function (el) {
    const W = 480, Hh = 290, cx = 240, cy = 150, R = 100;
    const svg = stage(el, W, Hh);
    const title = T(svg, W / 2, 24, '', 'tb');
    const arrows = S('g', {}, svg);
    const nodes = S('g', {}, svg);
    const tok = S('circle', { r: 9, class: 'f2' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let a = 2, m = 7, seq = [], busy = false, gen = 0, nodeEls = [];
    pick(row, '底数：', ['2', '3', '4', '5'], 0, (i) => { a = i + 2; reset(); });
    pick(row, '除数：', ['3', '4', '5', '6', '7', '8', '9'], 4, (i) => { m = i + 3; reset(); });
    const inp = numInput(row, '　n =', 100);
    const c = ctrl(el);
    btn(c, '乘一次', () => step(true));
    btn(c, '连续走 6 步', () => { if (busy) return; let k = 0; const go = () => { if (k++ < 6) { step(true, go); } }; go(); });
    btn(c, '求余数', query);
    btn(c, '重来', reset, 'alt');
    const P = (r) => { const t = -PI / 2 + (2 * PI * r) / m; return [cx + R * Math.cos(t), cy + R * Math.sin(t)]; };
    function full() { // 余数序列：从第 s 项开始每 T 项循环
      const s = [a % m], seen = { [a % m]: 1 };
      for (let k = 2; k < 100; k++) {
        const r = (s[k - 2] * a) % m;
        if (seen[r]) return { s, start: seen[r], T: k - seen[r] };
        seen[r] = k; s.push(r);
      }
      return { s, start: 1, T: s.length };
    }
    function reset() {
      gen++; busy = false;
      arrows.innerHTML = ''; nodes.innerHTML = '';
      title.textContent = `${a}ⁿ 除以 ${m} 的余数在“余数钟”上走`;
      nodeEls = [];
      for (let r = 0; r < m; r++) {
        const [x, y] = P(r);
        const ci = S('circle', { cx: x, cy: y, r: 17, class: 'fsurf2 sline' }, nodes);
        T(nodes, x, y + 5, String(r), 'tb');
        nodeEls.push(ci);
      }
      seq = [a % m];
      mark();
      const [x, y] = P(seq[0]);
      tok.setAttribute('cx', x); tok.setAttribute('cy', y);
      read.innerHTML = `${a}<sup>1</sup> = ${a}，除以 ${m} 余 <b>${seq[0]}</b>。余数只可能是 0～${m - 1}，所以走下去<b>一定会重复</b>。点“乘一次”。`;
    }
    function mark() { nodeEls.forEach((ci, r) => ci.setAttribute('class', r === seq[seq.length - 1] ? 'f2s s2' : seq.includes(r) ? 'f1s sline' : 'fsurf2 sline')); }
    function step(anim, done) {
      if (busy) return;
      const r0 = seq[seq.length - 1], r1 = (r0 * a) % m, k = seq.length + 1;
      seq.push(r1);
      const F = full(), firstRep = F.start + F.T;
      const [x0, y0] = P(r0), [x1, y1] = P(r1);
      const mx = (x0 + x1) / 2, my_ = (y0 + y1) / 2;
      const qx = cx + (mx - cx) * 0.35, qy = cy + (my_ - cy) * 0.35;
      if (r0 === r1) S('circle', { cx: x0 + (x0 - cx) * 0.28, cy: y0 + (y0 - cy) * 0.28, r: 12, class: 'fnone s1' }, arrows);
      else {
        S('path', { d: `M${x0},${y0} Q${qx},${qy} ${x1},${y1}`, class: 'fnone s1' }, arrows);
        const ang = Math.atan2(y1 - qy, x1 - qx), ex = x1 - 18 * Math.cos(ang), ey = y1 - 18 * Math.sin(ang);
        S('path', { d: `M${ex},${ey} l${-9 * Math.cos(ang - 0.4)},${-9 * Math.sin(ang - 0.4)} l${9 * Math.cos(ang - 0.4) - 9 * Math.cos(ang + 0.4)},${9 * Math.sin(ang - 0.4) - 9 * Math.sin(ang + 0.4)} Z`, class: 'f1' }, arrows);
      }
      const msg = `${a}<sup>${k}</sup> 除以 ${m} 的余数 = 上一个余数 ${r0} × ${a} = ${r0 * a}，再除以 ${m} 余 <b>${r1}</b>。` +
        (k === firstRep ? `<br><span class="k2">余数 ${r1} 和第 ${F.start} 项一样！从这里开始重复，每 ${F.T} 项一个循环。</span>`
          : k > firstRep ? `<br><span class="tm">已经在转圈了：从第 ${F.start} 项起每 ${F.T} 项一个循环。</span>` : '');
      read.innerHTML = msg + `<br>余数序列：${seq.join('，')}`;
      const fin = () => { mark(); busy = false; if (done) setTimeout(done, RM ? 0 : 250); };
      if (!anim) { tok.setAttribute('cx', x1); tok.setAttribute('cy', y1); fin(); return; }
      busy = true;
      const my = gen;
      tween(600, (t) => {
        if (my !== gen) return;
        const u = 1 - t;
        tok.setAttribute('cx', u * u * x0 + 2 * u * t * qx + t * t * x1);
        tok.setAttribute('cy', u * u * y0 + 2 * u * t * qy + t * t * y1);
      }, () => { if (my === gen) fin(); });
    }
    function query() {
      const n = Math.floor(+inp.value);
      if (!(n >= 1) || n > 1e12) { read.innerHTML = '请输入一个正整数 n。'; return; }
      const F = full();
      let idx;
      if (n <= F.s.length) idx = n;
      else idx = F.start + ((n - F.start) % F.T);
      const r = F.s[idx - 1];
      const cyc = F.s.slice(F.start - 1);
      let txt = `余数序列：${F.s.join('，')}，……从第 ${F.start} 项起按 <b>${cyc.join('、')}</b> 循环，周期 ${F.T}。<br>`;
      if (F.start === 1) {
        const q = n % F.T;
        txt += `${n} ÷ ${F.T} 余 ${q}${q === 0 ? '（余 0 取周期里最后一个）' : `，取周期里第 ${q} 个`}，所以 ${a}<sup>${n}</sup> 除以 ${m} 余 <span class="k2">${r}</span>。`;
      } else txt += `第 ${n} 项对应循环里的第 ${idx} 项，所以 ${a}<sup>${n}</sup> 除以 ${m} 余 <span class="k2">${r}</span>。`;
      read.innerHTML = txt;
      nodeEls.forEach((ci, rr) => ci.setAttribute('class', rr === r ? 'f3s s3' : 'fsurf2 sline'));
    }
    reset();
  };

  // ════════════ c_pattern 规律探究 ════════════
  A.c_pattern_match = function (el) {
    const W = 480, Hh = 290;
    const svg = stage(el, W, Hh);
    const fig = S('g', {}, svg);
    const tbl = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const SH = [
      { name: '正方形', a: 3, b: 1, unit: '个正方形' },
      { name: '三角形', a: 2, b: 1, unit: '个三角形' },
      { name: '六边形', a: 5, b: 1, unit: '个六边形' }
    ];
    let sh = 0, n = 1, busy = false, gen = 0;
    pick(row, '图形：', SH.map((s) => s.name + '一排'), 0, (i) => { sh = i; n = 1; draw(false); });
    const c = ctrl(el);
    btn(c, '加一个', () => { if (busy || n >= 7) return; n++; draw(true); });
    btn(c, '第 100 个要几根？', () => {
      const s = SH[sh];
      read.innerHTML = `第 <i>n</i> 个用 ${s.a}<i>n</i> + ${s.b} 根，<i>n</i> = 100 时：${s.a} × 100 + ${s.b} = <span class="k2">${s.a * 100 + s.b}</span> 根。不用真的摆 100 个！`;
    }, 'alt');
    btn(c, '重来', () => { n = 1; draw(false); }, 'alt');
    function polys(k) {
      const ps = [];
      for (let i = 0; i < k; i++) {
        if (sh === 0) { const s = 46; ps.push([[i * s, 0], [(i + 1) * s, 0], [(i + 1) * s, s], [i * s, s]]); }
        else if (sh === 1) {
          const s = 52, h = s * Math.sqrt(3) / 2, j = Math.floor(i / 2);
          ps.push(i % 2 === 0 ? [[j * s, h], [(j + 1) * s, h], [j * s + s / 2, 0]] : [[j * s + s / 2, 0], [(j + 1) * s + s / 2, 0], [(j + 1) * s, h]]);
        } else {
          const r = 26, w = r * Math.sqrt(3), ccx = i * w;
          ps.push([0, 1, 2, 3, 4, 5].map((q) => { const t = (-90 + 60 * q) * PI / 180; return [ccx + r * Math.cos(t), r + r * Math.sin(t)]; }));
        }
      }
      return ps;
    }
    function edges(k) {
      const seen = {}, out = [];
      polys(k).forEach((p, i) => p.forEach((q, j) => {
        const r = p[(j + 1) % p.length];
        const key = [q, r].map((v) => Math.round(v[0]) + ',' + Math.round(v[1])).sort().join('|');
        if (!seen[key]) { seen[key] = 1; out.push({ q, r, piece: i }); }
      }));
      return out;
    }
    function draw(anim) {
      const my = ++gen;
      busy = false;
      fig.innerHTML = ''; tbl.innerHTML = '';
      const es = edges(n);
      const xs = es.flatMap((e) => [e.q[0], e.r[0]]), ys = es.flatMap((e) => [e.q[1], e.r[1]]);
      const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
      const ox = W / 2 - w / 2 - Math.min(...xs), oy = 40 + (70 - h) / 2 - Math.min(...ys);
      const newOnes = [];
      es.forEach((e) => {
        const isNew = e.piece === n - 1 && n > 1;
        const ln = S('line', { x1: e.q[0] + ox, y1: e.q[1] + oy, x2: e.r[0] + ox, y2: e.r[1] + oy, class: (isNew ? 's2' : 's1') + ' round', style: 'stroke-width:4' }, fig);
        if (isNew) newOnes.push(ln);
      });
      const s = SH[sh];
      const first = s.a + s.b;
      // 表格
      const tx = (i) => 130 + i * 48;
      T(tbl, 70, 178, '序号 n', 'ts tm');
      T(tbl, 70, 210, '根数', 'ts tm');
      S('line', { x1: 30, x2: 460, y1: 188, y2: 188, class: 'sline' }, tbl);
      for (let i = 1; i <= n; i++) {
        T(tbl, tx(i - 1), 178, String(i), 'tb');
        T(tbl, tx(i - 1), 210, String(s.a * i + s.b), 'tb ' + (i === n ? 't2' : 't1'));
        if (i > 1) T(tbl, tx(i - 1) - 24, 236, '+' + s.a, 'ts t3');
      }
      T(tbl, W / 2, 274, n >= 3 ? `每次多 ${s.a} 根 → 第 n 个：${first} + ${s.a}(n − 1) = ${s.a}n + ${s.b}` : '多摆几个，看看根数每次增加多少', n >= 3 ? 'tb t3' : 'tm');
      if (anim) {
        busy = true;
        newOnes.forEach((ln) => {
          const L = Math.hypot(+ln.getAttribute('x2') - +ln.getAttribute('x1'), +ln.getAttribute('y2') - +ln.getAttribute('y1'));
          ln.style.strokeDasharray = L; ln.style.strokeDashoffset = L;
        });
        newOnes.forEach((ln, i) => setTimeout(() => {
          if (my !== gen) return;
          const L = parseFloat(ln.style.strokeDasharray);
          tween(380, (t) => { ln.style.strokeDashoffset = L * (1 - t); });
        }, RM ? 0 : i * 400));
        setTimeout(() => { if (my === gen) busy = false; }, RM ? 0 : newOnes.length * 400 + 100);
      }
      read.innerHTML = `第 ${n} 个图形：${n} ${s.unit}，用了 <span class="k2">${s.a * n + s.b}</span> 根火柴。` +
        (n > 1 ? `新加的 ${s.a} 根是橙色的——和前面的图形<b>共用</b>了一条边，所以不是多 ${s.a + 1} 根。` : `第 1 个用 ${first} 根。点“加一个”。`);
    }
    draw(false);
  };

  A.c_pattern_dots = function (el) {
    const W = 480, Hh = 260, sp = 24, ox = 40, oy = 34;
    const svg = stage(el, W, Hh);
    const fig = S('g', {}, svg);
    const txt = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let mode = 0, n = 3, dbl = false, busy = false, gen = 0;
    pick(row, '点阵：', ['正方形点阵（奇数的和）', '三角形点阵（1 + 2 + 3 + …）'], 0, (i) => { mode = i; n = 3; dbl = false; draw(false); });
    const c = ctrl(el);
    btn(c, '下一个', () => { if (busy || n >= 8) return; n++; dbl = false; draw(true); });
    const db = btn(c, '再拼一个倒过来的', () => { if (busy || mode !== 1) return; dbl = !dbl; draw(true, true); }, 'alt');
    btn(c, '重来', () => { n = 1; dbl = false; draw(false); }, 'alt');
    function draw(anim, onlyCopy) {
      const my = ++gen;
      busy = false;
      fig.innerHTML = ''; txt.innerHTML = '';
      db.style.display = mode === 1 ? '' : 'none';
      db.textContent = dbl ? '拿走倒过来的' : '再拼一个倒过来的';
      const pop = [];
      if (mode === 0) {
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const L = Math.max(i, j);
          const d = S('circle', { cx: ox + i * sp, cy: oy + j * sp, r: 8, class: L % 2 ? 'f2' : 'f1' }, fig);
          if (L === n - 1) pop.push(d);
        }
        if (n > 1) {
          const e = ox + (n - 1) * sp;
          S('path', { d: `M${e + 13},${oy - 13} V${e + 13 - ox + oy} H${ox - 13}`, class: 'fnone s3 dash' }, fig);
        }
        for (let k = 1; k <= n; k++) {
          const s = Array.from({ length: k }, (_, i) => 2 * i + 1).join(' + ');
          T(txt, 270, 40 + (k - 1) * 26, `${k <= 4 ? s : '1 + 3 + … + ' + (2 * k - 1)} = ${k}² = ${k * k}`, k === n ? 'tb t2 ts' : 'ts', 'start');
        }
        read.innerHTML = `第 ${n} 个正方形点阵是 ${n} × ${n} = <span class="k2">${n * n}</span> 个点。每次在外面包一层“L 形”，新的一层有 ${2 * n - 1} 个点（第 ${n} 个奇数）。所以 <b>1 + 3 + 5 + … + (2<i>n</i> − 1) = <i>n</i>²</b>。`;
      } else {
        for (let r = 0; r < n; r++) for (let cc = 0; cc <= r; cc++) {
          const d = S('circle', { cx: ox + cc * sp, cy: oy + r * sp, r: 8, class: 'f1' }, fig);
          if (r === n - 1 && !onlyCopy) pop.push(d);
        }
        if (dbl) {
          for (let r = 0; r < n; r++) for (let cc = 0; cc <= r; cc++) {
            const d = S('circle', { cx: ox + (n - cc) * sp, cy: oy + (n - 1 - r) * sp, r: 8, class: 'f2' }, fig);
            pop.push(d);
          }
          S('rect', { x: ox - 14, y: oy - 14, width: n * sp + 28, height: (n - 1) * sp + 28, rx: 6, class: 'fnone s3 dash' }, fig);
        }
        for (let k = 1; k <= n; k++) {
          const s = k <= 4 ? Array.from({ length: k }, (_, i) => i + 1).join(' + ') : '1 + 2 + … + ' + k;
          T(txt, 270, 40 + (k - 1) * 26, `${s} = ${(k * (k + 1)) / 2}`, k === n ? 'tb t2 ts' : 'ts', 'start');
        }
        read.innerHTML = dbl
          ? `两个一样的三角形拼成 ${n} 行 × ${n + 1} 列的长方形，共 ${n} × ${n + 1} = ${n * (n + 1)} 个点，所以一个三角形有 ${n * (n + 1)} ÷ 2 = <span class="k2">${(n * (n + 1)) / 2}</span> 个：<b>1 + 2 + … + <i>n</i> = <i>n</i>(<i>n</i> + 1) ÷ 2</b>。`
          : `第 ${n} 个三角形点阵有 1 + 2 + … + ${n} = <span class="k2">${(n * (n + 1)) / 2}</span> 个点。点“再拼一个倒过来的”，看看怎样一下子算出来。`;
      }
      if (anim && pop.length) {
        busy = true;
        pop.forEach((d) => d.setAttribute('r', 0));
        pop.forEach((d, i) => setTimeout(() => { if (my === gen) tween(250, (t) => d.setAttribute('r', 8 * t)); }, RM ? 0 : i * 60));
        setTimeout(() => { if (my === gen) busy = false; }, RM ? 0 : pop.length * 60 + 260);
      }
    }
    draw(false);
  };

  // ════════════ c_parallel_model 平行线拐角模型 ════════════
  const deg = (r) => (r * 180) / PI;
  const angBetween = (u, v) => Math.acos(clamp((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v)), -1, 1));

  A.c_parallel_model_turn = function (el) {
    const W = 480, Hh = 300, yT = 70, yB = 240;
    const svg = stage(el, W, Hh);
    S('line', { x1: 16, x2: 464, y1: yT, y2: yT, class: 'stroke-strong' }, svg);
    S('line', { x1: 16, x2: 464, y1: yB, y2: yB, class: 'stroke-strong' }, svg);
    T(svg, 22, yT - 10, 'A', 'tb', 'start');
    T(svg, 22, yB + 22, 'C', 'tb', 'start');
    T(svg, 462, Hh - 8, 'AB ∥ CD', 'tm ts', 'end');
    const par = S('line', { y1: 0, y2: 0, class: 's3 dash' }, svg);
    const parT = T(svg, 0, 0, 'F', 't3 tb');
    const arcs = S('g', {}, svg);
    const segs = S('g', {}, svg);
    const labs = S('g', {}, svg);
    const hB = S('circle', { r: 10, cy: yT, class: 'handle' }, svg);
    const hD = S('circle', { r: 10, cy: yB, class: 'handle' }, svg);
    const hE = S('circle', { r: 11, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let B = [330, yT], D = [300, yB], E = [160, 155], showPar = false, parT_ = 0, busy = false, gen = 0;
    btn(c, '猪蹄型', () => moveE([150, 155]));
    btn(c, '铅笔型', () => moveE([440, 155]));
    const pb = btn(c, '过 E 作平行线', () => {
      if (busy) return;
      showPar = !showPar;
      const my = ++gen;
      const from = parT_, to = showPar ? 1 : 0;
      tween(700, (t) => { if (my === gen) { parT_ = lerp(from, to, t); render(); } });
      pb.textContent = showPar ? '去掉平行线' : '过 E 作平行线';
    }, 'alt');
    function moveE(to) {
      if (busy) return;
      busy = true;
      const from = E.slice();
      tween(700, (t) => { E = [lerp(from[0], to[0], t), lerp(from[1], to[1], t)]; render(); }, () => { busy = false; render(); });
    }
    function wedge(P, a1, a2, r, cls) { S('path', { d: arcD(P[0], P[1], r, a1, a2, true), class: cls, style: 'opacity:.75' }, arcs); }
    function label(P, a1, a2, r, text, cls) {
      let d = a2 - a1; while (d > PI) d -= 2 * PI; while (d <= -PI) d += 2 * PI;
      const m = a1 + d / 2;
      T(labs, P[0] + (r + 15) * Math.cos(m), P[1] + (r + 15) * Math.sin(m) + 5, text, cls);
    }
    function render() {
      arcs.innerHTML = ''; segs.innerHTML = ''; labs.innerHTML = '';
      S('polyline', { points: [B, E, D].map((p) => p.join(',')).join(' '), class: 'fnone sstrong round', style: 'stroke-width:2.5' }, segs);
      [[B, 'B', -14], [D, 'D', 26]].forEach(([p, s, dy]) => T(labs, p[0] + 4, p[1] + dy, s, 'tb'));
      T(labs, E[0] + (E[0] > (B[0] + D[0]) / 2 ? 16 : -16), E[1] + 5, 'E', 'tb');
      const vBE = [E[0] - B[0], E[1] - B[1]], vDE = [E[0] - D[0], E[1] - D[1]];
      const vEB = [-vBE[0], -vBE[1]], vED = [-vDE[0], -vDE[1]];
      const al = deg(angBetween([-1, 0], vBE)), ga = deg(angBetween([-1, 0], vDE));
      const pig = al + ga <= 180;
      const da = Math.round(al), dg = Math.round(ga), de = pig ? da + dg : 360 - da - dg;
      const aBE = Math.atan2(vBE[1], vBE[0]), aDE = Math.atan2(vDE[1], vDE[0]);
      const aEB = Math.atan2(vEB[1], vEB[0]), aED = Math.atan2(vED[1], vED[0]);
      wedge(B, PI, aBE, 24, 'f1s s1'); label(B, PI, aBE, 24, da + '°', 't1 tb ts');
      wedge(D, PI, aDE, 24, 'f2s s2'); label(D, PI, aDE, 24, dg + '°', 't2 tb ts');
      const side = pig ? 0 : PI; // 角 BED 开口的方向
      if (parT_ > 0) {
        const L = 210 * parT_;
        par.setAttribute('x1', E[0] - L); par.setAttribute('x2', E[0] + L);
        par.setAttribute('y1', E[1]); par.setAttribute('y2', E[1]); par.setAttribute('opacity', 1);
        const fx = E[0] + (pig ? 1 : -1) * Math.min(L, 60);
        parT.setAttribute('x', fx); parT.setAttribute('y', E[1] - 8); parT.setAttribute('opacity', parT_);
        wedge(E, side, aEB, 30, 'f1s s1'); wedge(E, side, aED, 30, 'f2s s2');
        label(E, side, aEB, 30, '∠1', 't1 ts tb'); label(E, side, aED, 30, '∠2', 't2 ts tb');
      } else {
        par.setAttribute('opacity', 0); parT.setAttribute('opacity', 0);
        wedge(E, aEB, aED, 30, 'f3s s3'); label(E, aEB, aED, 30, de + '°', 't3 tb ts');
      }
      [[hB, B], [hD, D], [hE, E]].forEach(([h, p]) => { h.setAttribute('cx', p[0]); h.setAttribute('cy', p[1]); });
      let t;
      if (pig) {
        t = `<b>猪蹄型</b>（拐点 E 朝 A、C 那一侧凸出）：<span class="k1">∠ABE = ${da}°</span>，<span class="k2">∠CDE = ${dg}°</span>，<span class="k3">∠BED = ${de}°</span> = ${da}° + ${dg}°。`;
        if (parT_ > 0) t += '<br>过 E 作 EF ∥ AB，则 EF ∥ CD。∠1 = ∠ABE，∠2 = ∠CDE（两直线平行，内错角相等），所以 <b>∠BED = ∠1 + ∠2 = ∠B + ∠D</b>。';
      } else {
        t = `<b>铅笔型</b>（拐点 E 朝另一侧凸出）：<span class="k1">∠ABE = ${da}°</span>，<span class="k2">∠CDE = ${dg}°</span>，<span class="k3">∠BED = ${de}°</span>，三个角加起来 ${da} + ${dg} + ${de} = <b>360°</b>。`;
        if (parT_ > 0) t += `<br>过 E 作 EF ∥ AB，则 EF ∥ CD。∠ABE + ∠1 = 180°，∠CDE + ∠2 = 180°（两直线平行，同旁内角互补），所以 <b>∠B + ∠BED + ∠D = 360°</b>。`;
      }
      read.innerHTML = t;
    }
    draggable(svg, hB, (p) => { B = [clamp(p.x, 120, 450), yT]; render(); }, () => !busy);
    draggable(svg, hD, (p) => { D = [clamp(p.x, 120, 450), yB]; render(); }, () => !busy);
    draggable(svg, hE, (p) => { E = [clamp(p.x, 30, 455), clamp(p.y, yT + 22, yB - 22)]; render(); }, () => !busy);
    H('p', { class: 'anim-tip' }, el, '提示：拖动 B、D、E 三个圆点。把 E 拖到另一边，猪蹄型就变成铅笔型。');
    render();
  };

  A.c_parallel_model_zigzag = function (el) {
    const W = 480, Hh = 310, yT = 50, yB = 270;
    const svg = stage(el, W, Hh);
    S('line', { x1: 16, x2: 464, y1: yT, y2: yT, class: 'stroke-strong' }, svg);
    S('line', { x1: 16, x2: 464, y1: yB, y2: yB, class: 'stroke-strong' }, svg);
    T(svg, 22, yT - 10, 'A', 'tb', 'start');
    const cLab = T(svg, 22, yB + 24, 'C', 'tb', 'start');
    const pars = S('g', {}, svg);
    const arcs = S('g', {}, svg);
    const segs = S('g', {}, svg);
    const labs = S('g', {}, svg);
    const hs = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const NAMES = ['E', 'F', 'G'];
    // 每种拐点个数的默认位置：[拐点横坐标们, D 的横坐标, B 的横坐标]
    const DEF = { 1: [[150], 330, 330], 2: [[180, 320], 170, 330], 3: [[170, 310, 170], 300, 300] };
    let k = 2, xs = [], bx = 330, dx = 140, showPar = false, parT_ = 0, gen = 0;
    pick(row, '拐点个数：', ['1 个（猪蹄型）', '2 个', '3 个'], 1, (i) => { k = i + 1; init(); });
    const c = ctrl(el);
    const pb = btn(c, '过拐点作平行线', () => {
      showPar = !showPar;
      const my = ++gen, from = parT_, to = showPar ? 1 : 0;
      tween(700, (t) => { if (my === gen) { parT_ = lerp(from, to, t); render(); } });
      pb.textContent = showPar ? '去掉平行线' : '过拐点作平行线';
    }, 'alt');
    btn(c, '恢复原样', () => init(), 'alt');
    function init() {
      xs = DEF[k][0].slice(); dx = DEF[k][1]; bx = DEF[k][2];
      cLab.setAttribute('x', k % 2 ? 22 : 458);
      cLab.setAttribute('text-anchor', k % 2 ? 'start' : 'end');
      buildHandles();
      render();
    }
    const ys = () => Array.from({ length: k }, (_, i) => yT + ((yB - yT) * (i + 1)) / (k + 1));
    let handles = [];
    function buildHandles() {
      hs.innerHTML = '';
      handles = [];
      const mk = (getP, setX) => {
        const h = S('circle', { r: 10, class: 'handle' }, hs);
        draggable(svg, h, (p) => { setX(clamp(p.x, 40, 445)); render(); });
        handles.push([h, getP]);
      };
      mk(() => [bx, yT], (x) => { bx = x; });
      for (let i = 0; i < k; i++) mk(() => [xs[i], ys()[i]], (x) => { xs[i] = x; });
      mk(() => [dx, yB], (x) => { dx = x; });
    }
    function render() {
      pars.innerHTML = ''; arcs.innerHTML = ''; segs.innerHTML = ''; labs.innerHTML = '';
      const Y = ys();
      const pts = [[bx, yT]].concat(xs.map((x, i) => [x, Y[i]])).concat([[dx, yB]]);
      const bottomDir = k % 2 ? [-1, 0] : [1, 0];
      S('polyline', { points: pts.map((p) => p.join(',')).join(' '), class: 'fnone sstrong round', style: 'stroke-width:2.5' }, segs);
      const names = ['B'].concat(NAMES.slice(0, k)).concat(['D']);
      const info = pts.map((p, i) => {
        const u = i === 0 ? [-1, 0] : [pts[i - 1][0] - p[0], pts[i - 1][1] - p[1]];
        const v = i === pts.length - 1 ? bottomDir : [pts[i + 1][0] - p[0], pts[i + 1][1] - p[1]];
        const nu = Math.hypot(...u), nv = Math.hypot(...v);
        const bis = u[0] / nu + v[0] / nv;
        return { p, u, v, val: deg(angBetween(u, v)), left: bis < 0 };
      });
      const r = 22;
      info.forEach((o, i) => {
        const a1 = Math.atan2(o.u[1], o.u[0]), a2 = Math.atan2(o.v[1], o.v[0]);
        S('path', { d: arcD(o.p[0], o.p[1], r, a1, a2, true), class: o.left ? 'f1s s1' : 'f2s s2', style: 'opacity:.75' }, arcs);
        o.disp = Math.round(o.val);
        o.a1 = a1; o.a2 = a2;
        const lx = o.p[0] + (o.left ? -1 : 1) * 44;
        T(labs, o.p[0] + (o.left ? 1 : -1) * 16, o.p[1] + (i === 0 ? -10 : i === pts.length - 1 ? 26 : 5), names[i], 'tb');
        o.lx = lx;
      });
      const alt = info.every((o, i) => o.left === (i % 2 === 0));
      if (alt) { // 让显示的整数度数也满足等式（四舍五入误差记到最后一个角上）
        const last = info[info.length - 1];
        const sumL = info.filter((o, i) => o.left && o !== last).reduce((s, o) => s + o.disp, 0);
        const sumR = info.filter((o) => !o.left && o !== last).reduce((s, o) => s + o.disp, 0);
        last.disp = last.left ? sumR - sumL : sumL - sumR;
      }
      info.forEach((o) => T(labs, o.lx, o.p[1] + (o.p[1] === yT ? 18 : o.p[1] === yB ? -8 : 5), o.disp + '°', (o.left ? 't1' : 't2') + ' ts tb'));
      if (parT_ > 0) {
        info.slice(1, -1).forEach((o) => {
          const L = 200 * parT_;
          S('line', { x1: o.p[0] - L, x2: o.p[0] + L, y1: o.p[1], y2: o.p[1], class: 's3 dash', style: `opacity:${parT_}` }, pars);
        });
      }
      handles.forEach(([h, getP]) => { const p = getP(); h.setAttribute('cx', p[0]); h.setAttribute('cy', p[1]); });
      const Ls = info.map((o, i) => [names[i], o]).filter(([, o]) => o.left);
      const Rs = info.map((o, i) => [names[i], o]).filter(([, o]) => !o.left);
      const sum = (arr) => arr.reduce((s, [, o]) => s + o.disp, 0);
      let t = `<span class="k1">开口朝左的角：${Ls.map(([nm, o]) => `∠${nm} = ${o.disp}°`).join('，')}，和 = ${sum(Ls)}°</span><br><span class="k2">开口朝右的角：${Rs.map(([nm, o]) => `∠${nm} = ${o.disp}°`).join('，')}，和 = ${sum(Rs)}°</span>`;
      if (alt) t += `<br><b>朝左的角之和 = 朝右的角之和</b>。${parT_ > 0 ? '过每个拐点作 AB 的平行线，把拐点处的角分成两块，每一块都和相邻的角是内错角，一对一对相等，所以两边的和相等。' : '点“过拐点作平行线”看看为什么。'}`;
      else t += '<br><span class="tm">现在的拐点没有一左一右交替，已经不是锯齿型了（有的地方变成了铅笔型），把圆点拖回去试试。</span>';
      read.innerHTML = t;
    }
    H('p', { class: 'anim-tip' }, el, '提示：左右拖动 B、D 和每个拐点上的圆点，角度会实时变化。');
    init();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
