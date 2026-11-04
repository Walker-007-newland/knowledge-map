// 奥数拓展 olym11：八、九年级代数竞赛专题的互动动画
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, grid, RM } = window.AH;
  const A = {};

  // ── 小工具 ──
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const wait = (ms, fn) => setTimeout(fn, RM ? 0 : ms);
  const gcd = (p, q) => { p = Math.abs(p); q = Math.abs(q); while (q) { const r = p % q; p = q; q = r; } return p || 1; };
  // 分数结果（HTML）
  function fracH(p, q) {
    if (q < 0) { p = -p; q = -q; }
    const g = gcd(p, q); p /= g; q /= g;
    if (q === 1) return fmt(p);
    return (p < 0 ? '−' : '') + window.fr(Math.abs(p), q);
  }
  function sel(parent, names, onchange) {
    const s = H('select', {}, parent);
    names.forEach((nm, i) => H('option', { value: i }, s, nm));
    s.addEventListener('change', () => onchange(+s.value, s));
    return s;
  }
  // 文字宽度：优先实测，测不到时估算
  const est = (s) => [...s].reduce((w, ch) => w + (/[一-鿿]/.test(ch) ? 18 : /[²³⁴]/.test(ch) ? 7 : ch === ' ' ? 5 : 10.5), 0);
  function tw(t) {
    let w = 0;
    try { w = t.getComputedTextLength(); } catch (e) { w = 0; }
    return w > 0 ? w : est(t.textContent);
  }
  // 拖拽
  function drag(svg, h, onMove) {
    h.addEventListener('pointerdown', (e) => {
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
  // 函数曲线路径
  function fpath(G, f, x0, x1) {
    let d = '';
    for (let x = x0; x <= x1 + 1e-9; x += 0.05) {
      const y = clamp(f(x), -60, 60);
      d += (d ? 'L' : 'M') + G.X(x).toFixed(1) + ',' + G.Y(y).toFixed(1);
    }
    return d;
  }
  function setLine(G, ln, f) {
    ln.setAttribute('x1', G.X(-7)); ln.setAttribute('y1', G.Y(clamp(f(-7), -60, 60)));
    ln.setAttribute('x2', G.X(7)); ln.setAttribute('y2', G.Y(clamp(f(7), -60, 60)));
  }
  // 多项式 HTML：cs = [二次项系数, 一次项系数, 常数项]
  function polyTxt(cs, v) {
    v = v || 'x';
    let s = '';
    [[cs[0], `<i>${v}</i><sup>2</sup>`], [cs[1], `<i>${v}</i>`], [cs[2], '']].forEach(([cf, vv]) => {
      if (Math.abs(cf) < 1e-9) return;
      const neg = cf < 0, ab = Math.abs(cf);
      const num = vv && Math.abs(ab - 1) < 1e-9 ? '' : fmt(ab);
      s += s ? (neg ? ' − ' : ' + ') : (neg ? '−' : '');
      s += num + vv;
    });
    return s || '0';
  }
  // 纯文本多项式（用于 SVG 和下拉框）
  function polyPlain(cs) {
    let s = '';
    [[cs[0], 'x²'], [cs[1], 'x'], [cs[2], '']].forEach(([cf, vv]) => {
      if (cf === 0) return;
      const ab = Math.abs(cf);
      s += s ? (cf < 0 ? ' − ' : ' + ') : (cf < 0 ? '−' : '');
      s += (vv && ab === 1 ? '' : ab) + vv;
    });
    return s;
  }
  const lineTxt = (k, b) => {
    if (Math.abs(k) < 1e-9) return `<i>y</i> = ${fmt(b)}`;
    const kx = Math.abs(k - 1) < 1e-9 ? '' : Math.abs(k + 1) < 1e-9 ? '−' : fmt(k);
    const bs = Math.abs(b) < 1e-9 ? '' : b > 0 ? ` + ${fmt(b)}` : ` − ${fmt(-b)}`;
    return `<i>y</i> = ${kx}<i>x</i>${bs}`;
  };
  const rt = (n) => (Number.isInteger(Math.sqrt(n)) ? String(Math.sqrt(n)) : '√' + n);

  // ── 通用：式子变形动画（每一步的“块”会移动、出现、消失） ──
  // list: [{ name, given, stages: [{ cap, toks: [[id, 文字, class]], box: [[起 id, 止 id]] }] }]
  function morph(el, list) {
    const W = 460, BASE = 100;
    const svg = stage(el, W, 130);
    const given = T(svg, W / 2, 26, '', 't2 tb');
    const prev = T(svg, W / 2, 58, '', 'tm ts');
    const gBox = S('g', {}, svg), gTok = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let ex = 0, st = 0, busy = false, nodes = {};
    sel(c, list.map((e) => e.name), (i, s) => { if (busy) { s.value = ex; return; } ex = i; reset(); });
    const nb = btn(c, '下一步 ▶', step);
    btn(c, '重来', () => { if (!busy) reset(); }, 'alt');
    const OPS = '+−=×', OPEN = '([', CLOSE = ')]';
    const tight = (pt, txt) => OPEN.includes(pt[pt.length - 1]) || CLOSE.includes(txt[0]) || (OPEN.includes(txt[0]) && !OPS.includes(pt));
    const str = (toks) => toks.map((t, i) => (i > 0 && !tight(toks[i - 1][1], t[1]) ? ' ' : '') + t[1]).join('');
    function layout(toks) {
      const ws = toks.map(([id]) => tw(nodes[id]));
      const xs = [];
      let x = 0;
      toks.forEach(([, txt], i) => {
        if (i > 0) x += tight(toks[i - 1][1], txt) ? 1 : 8;
        xs.push(x);
        x += ws[i];
      });
      const off = (W - x) / 2;
      return { xs: xs.map((v) => v + off), ws };
    }
    function show(i, animate, done) {
      const stg = list[ex].stages[i];
      const keep = new Set(stg.toks.map((t) => t[0]));
      const old = {};
      Object.keys(nodes).forEach((id) => { old[id] = +nodes[id].getAttribute('x'); });
      const fresh = [];
      stg.toks.forEach(([id, txt, cls]) => {
        let n = nodes[id];
        if (!n) {
          n = T(gTok, 0, BASE, txt, 'tl ' + (cls || ''), 'start');
          nodes[id] = n;
          fresh.push(id);
          n.setAttribute('opacity', animate ? 0 : 1);
        } else {
          n.textContent = txt;
          n.setAttribute('class', 'tl ' + (cls || ''));
        }
      });
      const gone = Object.keys(nodes).filter((id) => !keep.has(id));
      const L = layout(stg.toks);
      const target = {};
      stg.toks.forEach(([id], j) => { target[id] = L.xs[j]; });
      gBox.innerHTML = '';
      const finish = () => {
        gone.forEach((id) => { nodes[id].remove(); delete nodes[id]; });
        stg.toks.forEach(([id]) => {
          nodes[id].setAttribute('x', target[id]);
          nodes[id].setAttribute('y', BASE);
          nodes[id].setAttribute('opacity', 1);
        });
        (stg.box || []).forEach(([p, q]) => {
          const j0 = stg.toks.findIndex((t) => t[0] === p), j1 = stg.toks.findIndex((t) => t[0] === q);
          const x0 = L.xs[j0] - 5, x1 = L.xs[j1] + L.ws[j1] + 5;
          S('rect', { x: x0, y: BASE - 22, width: x1 - x0, height: 31, rx: 7, class: 'f2s s2', style: 'opacity: .55' }, gBox);
        });
        if (done) done();
      };
      if (!animate) { finish(); return; }
      fresh.forEach((id) => nodes[id].setAttribute('x', target[id]));
      tween(800, (t) => {
        stg.toks.forEach(([id]) => {
          const n = nodes[id];
          if (fresh.includes(id)) { n.setAttribute('opacity', t); n.setAttribute('y', BASE - 16 * (1 - t)); }
          else n.setAttribute('x', lerp(old[id], target[id], t));
        });
        gone.forEach((id) => { nodes[id].setAttribute('opacity', 1 - t); nodes[id].setAttribute('y', BASE + 16 * t); });
      }, finish);
    }
    function upd() {
      const e = list[ex];
      cap.textContent = e.stages[st].cap;
      prev.textContent = st > 0 ? '上一步：' + str(e.stages[st - 1].toks) : '';
      read.innerHTML = e.stages.slice(0, st + 1).map((s, i) => (i ? '= ' : '') + str(s.toks)).join('<br>');
      nb.disabled = st >= e.stages.length - 1;
      nb.textContent = nb.disabled ? '完成' : '下一步 ▶';
    }
    function step() {
      if (busy || st >= list[ex].stages.length - 1) return;
      busy = true;
      st++;
      upd();
      show(st, true, () => { busy = false; });
    }
    function reset() {
      gTok.innerHTML = '';
      gBox.innerHTML = '';
      nodes = {};
      st = 0;
      given.textContent = list[ex].given;
      show(0, false);
      upd();
    }
    reset();
  }

  // ════════════════ c_identity 恒等变形与整体代入 ════════════════

  // 面积图：(a + b)²、a² + b²、ab 之间知二求三
  A.c_identity_area = function (el) {
    const svg = stage(el, 460, 250);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const MODES = ['知 a + b 和 ab，求 a² + b²', '知 a + b 和 a² + b²，求 ab', '知 a² + b² 和 ab，求 (a + b)²'];
    let a = 4, b = 2, mode = 0, out = 0, busy = false;
    sel(c, MODES, (i, s) => { if (busy) { s.value = mode; return; } mode = i; out = mode === 2 ? 1 : 0; render(); });
    btn(c, '演示', () => {
      if (busy) return;
      busy = true;
      const from = mode === 2 ? 1 : 0, to = 1 - from;
      out = from;
      render();
      wait(300, () => tween(1300, (t) => { out = lerp(from, to, t); render(); }, () => { out = to; busy = false; render(); }));
    });
    btn(c, '复原', () => { if (busy) return; out = mode === 2 ? 1 : 0; render(); }, 'alt');
    const c2 = ctrl(el);
    slider(c2, 'ia', 'a', 1, 6, 1, a, (v) => { a = v; render(); });
    slider(c2, 'ib', 'b', 1, 6, 1, b, (v) => { b = v; render(); });
    function piece(x, y, w, h, cls, lab) {
      S('rect', { x, y, width: w, height: h, class: cls + ' sstrong thin' }, g);
      if (Math.min(w, h) >= 22) T(g, x + w / 2, y + h / 2 + 6, lab, 'ital tb');
    }
    function render() {
      g.innerHTML = '';
      const L = 200, x0 = 18, y0 = 34, sc = L / (a + b), D = 222;
      const A_ = a * sc, B_ = b * sc;
      S('rect', { x: x0, y: y0, width: L, height: L, class: 'fnone sstrong dash' }, g);
      T(g, x0 + A_ / 2, y0 - 9, 'a', 'ital t1'); T(g, x0 + A_ + B_ / 2, y0 - 9, 'b', 'ital t3');
      T(g, x0 - 9, y0 + A_ / 2 + 5, 'a', 'ital t1'); T(g, x0 - 9, y0 + A_ + B_ / 2 + 5, 'b', 'ital t3');
      const moveAB = mode !== 1, dx = D * out;
      piece(x0 + (moveAB ? 0 : dx), y0, A_, A_, 'f1s', 'a²');
      piece(x0 + A_ + (moveAB ? 0 : dx), y0 + A_, B_, B_, 'f3s', 'b²');
      piece(x0 + A_ + (moveAB ? dx : 0), y0, B_, A_, 'f2s', 'ab');
      piece(x0 + (moveAB ? dx : 0), y0 + A_, A_, B_, 'f2s', 'ab');
      if (out > 0.5) T(g, 340, 20, mode === 1 ? '移出来的 a² 和 b²' : '在外面的 2 块 ab', 'ts tm');
      const s = a + b, p = a * b, q = a * a + b * b;
      const done = (mode === 2 ? out === 0 : out === 1);
      if (mode === 0) {
        cap.textContent = `已知 a + b = ${s}，ab = ${p}，求 a² + b²`;
        read.innerHTML = done
          ? `拿走两块 <i>ab</i>，剩下的正好是 <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup>：<br><b><i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> = (<i>a</i> + <i>b</i>)<sup>2</sup> − 2<i>ab</i> = ${s}<sup>2</sup> − 2 × ${p} = <span class="k3">${q}</span></b>`
          : `整个大正方形的面积是 (<i>a</i> + <i>b</i>)<sup>2</sup> = ${s}<sup>2</sup> = ${s * s}，里面有两块橙色的 <i>ab</i>。点“演示”把它们拿走。`;
      } else if (mode === 1) {
        cap.textContent = `已知 a + b = ${s}，a² + b² = ${q}，求 ab`;
        read.innerHTML = done
          ? `大正方形去掉 <i>a</i><sup>2</sup> 和 <i>b</i><sup>2</sup>，剩下两块 <i>ab</i>：2<i>ab</i> = ${s}<sup>2</sup> − ${q} = ${2 * p}，<br><b><i>ab</i> = ${window.fr('(<i>a</i> + <i>b</i>)<sup>2</sup> − (<i>a</i><sup>2</sup> + <i>b</i><sup>2</sup>)', 2)} = <span class="k3">${p}</span></b>`
          : `大正方形面积 ${s}<sup>2</sup> = ${s * s}，其中蓝、绿两块合起来是 <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> = ${q}。点“演示”把它们移出来。`;
      } else {
        cap.textContent = `已知 a² + b² = ${q}，ab = ${p}，求 (a + b)²`;
        read.innerHTML = done
          ? `补上两块 <i>ab</i>，拼成边长 <i>a</i> + <i>b</i> 的正方形：<br><b>(<i>a</i> + <i>b</i>)<sup>2</sup> = <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> + 2<i>ab</i> = ${q} + 2 × ${p} = <span class="k3">${s * s}</span></b>（<i>a</i>、<i>b</i> 都是正数时 <i>a</i> + <i>b</i> = ${s}）`
          : `现在只有 <i>a</i><sup>2</sup> 和 <i>b</i><sup>2</sup>（和是 ${q}），两块 <i>ab</i> 在右边。点“演示”把它们补进去。`;
      }
      if (!done && busy) read.innerHTML = '正在移动……';
    }
    render();
  };

  // 整体代入、降次：式子一步步变形
  A.c_identity_sub = function (el) {
    morph(el, [
      {
        name: '已知 x² − 2x = 3，求 2x² − 4x + 1',
        given: '已知 x² − 2x = 3',
        stages: [
          { cap: '求不出 x 也没关系：先看要求的式子和已知式有什么关系。', toks: [['a', '2x²'], ['o1', '−'], ['b', '4x'], ['o2', '+'], ['c', '1']] },
          { cap: '前两项提出 2，括号里正好是已知式 x² − 2x。', toks: [['k', '2'], ['lp', '('], ['a', 'x²'], ['o1', '−'], ['b', '2x'], ['rp', ')'], ['o2', '+'], ['c', '1']], box: [['lp', 'rp']] },
          { cap: '把 x² − 2x 当成一个整体，换成 3。', toks: [['k', '2'], ['x', '×'], ['v', '3', 't2 tb'], ['o2', '+'], ['c', '1']] },
          { cap: '算出结果。', toks: [['r', '7', 't3 tb']] }
        ]
      },
      {
        name: '已知 a + b = 5，ab = 3，求 a²b + ab²',
        given: '已知 a + b = 5，ab = 3',
        stages: [
          { cap: '两项里都有 a 和 b，想到提公因式。', toks: [['p', 'a²b'], ['o', '+'], ['q', 'ab²']] },
          { cap: '提出公因式 ab，剩下 (a + b)：两个已知式都出现了。', toks: [['ab', 'ab'], ['lp', '('], ['a', 'a'], ['o', '+'], ['b', 'b'], ['rp', ')']], box: [['ab', 'ab'], ['lp', 'rp']] },
          { cap: '整体代入：ab = 3，a + b = 5。', toks: [['v1', '3', 't2 tb'], ['x', '×'], ['v2', '5', 't2 tb']] },
          { cap: '算出结果。', toks: [['r', '15', 't3 tb']] }
        ]
      },
      {
        name: '已知 x² + x − 1 = 0，求 x³ + 2x² + 2026',
        given: '已知 x² + x − 1 = 0，所以 x² = 1 − x，x² + x = 1',
        stages: [
          { cap: '三次方太高，想办法“降次”：用 x² = 1 − x 把次数降下来。', toks: [['c3', 'x³'], ['o1', '+'], ['c2', '2x²'], ['o2', '+'], ['k', '2026']] },
          { cap: 'x³ = x · x²，把其中的 x² 换成 (1 − x)。', toks: [['xx', 'x'], ['lp', '('], ['one', '1'], ['m', '−'], ['xin', 'x'], ['rp', ')'], ['o1', '+'], ['c2', '2x²'], ['o2', '+'], ['k', '2026']], box: [['lp', 'rp']] },
          { cap: '去括号。', toks: [['p1', 'x'], ['m', '−'], ['p2', 'x²'], ['o1', '+'], ['c2', '2x²'], ['o2', '+'], ['k', '2026']] },
          { cap: '合并同类项：−x² + 2x² = x²，正好凑出 x² + x。', toks: [['p2', 'x²'], ['o3', '+'], ['p1', 'x'], ['o2', '+'], ['k', '2026']], box: [['p2', 'p1']] },
          { cap: '整体代入 x² + x = 1。', toks: [['v', '1', 't2 tb'], ['o2', '+'], ['k', '2026']] },
          { cap: '算出结果。', toks: [['r', '2027', 't3 tb']] }
        ]
      },
      {
        name: '已知 a − b = 2，b − c = 3，求 a² + b² + c² − ab − bc − ca',
        given: '已知 a − b = 2，b − c = 3',
        stages: [
          { cap: '六项的式子，直接代不进去。想办法凑出 (a − b)²、(b − c)²。', toks: [['s', 'a² + b² + c² − ab − bc − ca']] },
          { cap: '乘 2 再除以 2：2a² + 2b² + 2c² − 2ab − 2bc − 2ca 恰好是三个完全平方的和。', toks: [['h', '½'], ['lb', '['], ['u', '(a − b)²'], ['p1', '+'], ['v', '(b − c)²'], ['p2', '+'], ['w', '(c − a)²'], ['rb', ']']] },
          { cap: 'c − a = −(a − b) − (b − c) = −5，三个括号都代入。', toks: [['h', '½'], ['lb', '['], ['u', '2²', 't2 tb'], ['p1', '+'], ['v', '3²', 't2 tb'], ['p2', '+'], ['w', '(−5)²', 't2 tb'], ['rb', ']']] },
          { cap: '4 + 9 + 25 = 38。', toks: [['h', '½'], ['x', '×'], ['t', '38']] },
          { cap: '算出结果。', toks: [['r', '19', 't3 tb']] }
        ]
      }
    ]);
  };

  // ════════════════ c_factor_adv 因式分解技巧 ════════════════

  // 十字相乘：逐组试数
  A.c_factor_adv_cross = function (el) {
    const svg = stage(el, 460, 240);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const PL = [[1, 5, 6], [1, -1, -12], [1, -7, 10], [2, -5, -3], [3, 10, 8], [6, 1, -2]];
    let pi = 0, trials = [], ti = -1, busy = false, done = false, gen = 0;
    sel(c, PL.map((p) => polyPlain(p)), (i) => { pi = i; reset(); });
    const b1 = btn(c, '试一组', () => { if (!busy) step(); });
    const b2 = btn(c, '自动试到成功', auto);
    btn(c, '重来', reset, 'alt');
    const mono = (k) => (k === 1 ? 'x' : k + 'x');
    const sgn = (v) => (v < 0 ? '−' + Math.abs(v) : '+' + v);
    const pv = (v) => (v < 0 ? '(−' + Math.abs(v) + ')' : String(v));
    const fx = (k) => (k === 1 ? 'x' : k === -1 ? '−x' : (k < 0 ? '−' + Math.abs(k) : k) + 'x');
    function build() {
      const [a, b, cc] = PL[pi], ap = [], cp = [];
      for (let d = 1; d * d <= a; d++) if (a % d === 0) ap.push([d, a / d]);
      const C = Math.abs(cc);
      for (let d = 1; d <= C; d++) if (C % d === 0) {
        const e = cc / d;
        if (cc > 0) { const s = b >= 0 ? 1 : -1; cp.push([s * d, s * e]); }
        else cp.push([d, e], [-d, -e]);
      }
      trials = [];
      ap.forEach((p) => cp.forEach((q) => trials.push([p[0], p[1], q[0], q[1]])));
    }
    const LX = 80, RX = 180, Y1 = 80, Y2 = 140;
    function draw(tr, anim) {
      g.innerHTML = '';
      const [a, b, cc] = PL[pi];
      T(g, 230, 30, polyPlain(PL[pi]), 'tl tb');
      const [a1, a2, c1, c2] = tr || ['?', '?', '?', '?'];
      T(g, LX, Y1 + 7, tr ? mono(a1) : '?x', 'tl tb t1');
      T(g, LX, Y2 + 7, tr ? mono(a2) : '?x', 'tl tb t1');
      T(g, RX, Y1 + 7, tr ? sgn(c1) : '?', 'tl tb t2');
      T(g, RX, Y2 + 7, tr ? sgn(c2) : '?', 'tl tb t2');
      const L1 = S('line', { x1: LX + 24, y1: Y1 + 2, x2: RX - 24, y2: Y2 - 4, class: 'sstrong' }, g);
      const L2 = S('line', { x1: LX + 24, y1: Y2 - 4, x2: RX - 24, y2: Y1 + 2, class: 'sstrong' }, g);
      if (!tr) {
        T(g, 330, Y1 + 7, '左边：拆二次项系数', 'ts tm');
        T(g, 330, Y2 + 7, '右边：拆常数项', 'ts tm');
        T(g, 230, 200, '交叉相乘再相加 = 一次项系数？', 'ts tm');
        return false;
      }
      const p1 = a1 * c2, p2 = a2 * c1, sum = p1 + p2, ok = sum === b;
      const t1 = T(g, 222, Y1 + 7, `↘ ${a1} × ${pv(c2)} = ${p1}`, 'ts', 'start');
      const t2 = T(g, 222, Y2 + 7, `↗ ${a2} × ${pv(c1)} = ${p2}`, 'ts', 'start');
      T(g, 130, 176, `竖着乘：${a1} × ${a2} = ${a}，${pv(c1)} × ${pv(c2)} = ${cc}`, 'ts tm');
      const t3 = T(g, 230, 204, `交叉相加：${fx(p1)} + ${pv(p2)}x = ${fx(sum)}，${ok ? '等于' : '不等于'}一次项 ${fx(b)}  ${ok ? '✓' : '✗'}`, 'tb ' + (ok ? 't3' : 't2'));
      let t4 = null;
      if (ok) t4 = T(g, 230, 232, `${polyPlain(PL[pi])} = (${mono(a1)} ${sgn(c1).replace(/^([+−])/, '$1 ')})(${mono(a2)} ${sgn(c2).replace(/^([+−])/, '$1 ')})`, 'tb t3');
      if (anim) {
        [L1, L2].forEach((ln) => {
          const len = Math.hypot(RX - LX - 48, Y2 - Y1 - 6);
          ln.style.strokeDasharray = len; ln.style.strokeDashoffset = len;
        });
        [t1, t2, t3, t4].forEach((t) => t && t.setAttribute('opacity', 0));
        tween(350, (t) => { L1.style.strokeDashoffset = (1 - t) * 200; t1.setAttribute('opacity', t); }, () => {
          L1.style.strokeDasharray = '';
          tween(350, (t) => { L2.style.strokeDashoffset = (1 - t) * 200; t2.setAttribute('opacity', t); }, () => {
            L2.style.strokeDasharray = '';
            tween(250, (t) => { t3.setAttribute('opacity', t); if (t4) t4.setAttribute('opacity', t); });
          });
        });
      }
      return ok;
    }
    function step() {
      if (done || ti >= trials.length - 1) return false;
      ti++;
      const tr = trials[ti];
      const ok = draw(tr, true);
      const [a1, a2, c1, c2] = tr;
      cap.textContent = `第 ${ti + 1} 组（按符号规律，一共只需试 ${trials.length} 组以内）`;
      if (ok) {
        done = true;
        b1.disabled = true; b2.disabled = true;
        read.innerHTML = `试成功了！横着读两行：第一行 ${mono(a1)} 和 ${sgn(c1)}，第二行 ${mono(a2)} 和 ${sgn(c2)}，<br>所以 <b>${polyTxt(PL[pi])} = (${mono(a1).replace('x', '<i>x</i>')} ${c1 < 0 ? '−' : '+'} ${Math.abs(c1)})(${mono(a2).replace('x', '<i>x</i>')} ${c2 < 0 ? '−' : '+'} ${Math.abs(c2)})</b>。乘回去检验一下吧。`;
      } else {
        read.innerHTML = `交叉相乘的和是 ${a1 * c2 + a2 * c1}，不是 ${PL[pi][1]}，这一组不行，换下一组。`;
      }
      return ok;
    }
    function auto() {
      if (busy || done) return;
      busy = true;
      const my = gen;
      const loop = () => {
        if (my !== gen) return;
        const ok = step();
        if (ok || ti >= trials.length - 1) { busy = false; return; }
        wait(1300, loop);
      };
      loop();
    }
    function reset() {
      gen++;
      busy = false; done = false; ti = -1;
      b1.disabled = false; b2.disabled = false;
      build();
      draw(null, false);
      const [, b, cc] = PL[pi];
      cap.textContent = '把二次项系数拆在左边，常数项拆在右边，交叉相乘再相加。';
      read.innerHTML = cc > 0
        ? `常数项 ${cc} 是正数：拆成的两个数<b>同号</b>，并且和一次项系数 ${b} 的符号相同。点“试一组”。`
        : `常数项 ${cc} 是负数：拆成的两个数<b>异号</b>。点“试一组”。`;
    }
    reset();
  };

  // 分组分解、拆项添项、换元：项的移动重排
  A.c_factor_adv_group = function (el) {
    morph(el, [
      {
        name: 'ax + ay + bx + by（二二分组）',
        given: '四项，没有公共的公因式',
        stages: [
          { cap: '四项找不到所有项都有的公因式，但前两项都有 a、后两项都有 b。', toks: [['t1', 'ax'], ['p1', '+'], ['t2', 'ay'], ['p2', '+'], ['t3', 'bx'], ['p3', '+'], ['t4', 'by']] },
          { cap: '前两项一组，后两项一组。', toks: [['l1', '('], ['t1', 'ax'], ['p1', '+'], ['t2', 'ay'], ['r1', ')'], ['p2', '+'], ['l2', '('], ['t3', 'bx'], ['p3', '+'], ['t4', 'by'], ['r2', ')']], box: [['l1', 'r1'], ['l2', 'r2']] },
          { cap: '每组各自提公因式，两组出现了相同的 (x + y)。', toks: [['ka', 'a'], ['g1', '(x + y)'], ['p2', '+'], ['kb', 'b'], ['g2', '(x + y)']], box: [['g1', 'g1'], ['g2', 'g2']] },
          { cap: '把 (x + y) 整体提出来，分解完成。', toks: [['g1', '(x + y)', 't3 tb'], ['g3', '(a + b)', 't3 tb']] }
        ]
      },
      {
        name: 'x² − y² + 2x + 1（三一分组）',
        given: '有 x²、2x、1，像完全平方的一部分',
        stages: [
          { cap: '二二分组试试看：怎么分都提不出相同的因式。注意 x²、2x、1 三项。', toks: [['a', 'x²'], ['m1', '−'], ['b', 'y²'], ['p1', '+'], ['c', '2x'], ['p2', '+'], ['d', '1']] },
          { cap: '把能凑成完全平方的三项移到一起（−y² 移到最后，带着它的符号）。', toks: [['a', 'x²'], ['p1', '+'], ['c', '2x'], ['p2', '+'], ['d', '1'], ['m1', '−'], ['b', 'y²']], box: [['a', 'd']] },
          { cap: '前三项是完全平方 (x + 1)²，整个式子变成“平方 − 平方”。', toks: [['sq', '(x + 1)²'], ['m1', '−'], ['b', 'y²']], box: [['sq', 'sq'], ['b', 'b']] },
          { cap: '用平方差公式 A² − B² = (A + B)(A − B)，这里 A = x + 1，B = y。', toks: [['f1', '(x + 1 + y)', 't3 tb'], ['f2', '(x + 1 − y)', 't3 tb']] }
        ]
      },
      {
        name: 'x³ − x² + x − 1（二二分组）',
        given: '前两项有 x²，后两项是 x − 1',
        stages: [
          { cap: '前两项都有 x²，后两项本身就是 x − 1。', toks: [['a', 'x³'], ['m1', '−'], ['b', 'x²'], ['p1', '+'], ['c', 'x'], ['m2', '−'], ['d', '1']] },
          { cap: '分成两组。', toks: [['l1', '('], ['a', 'x³'], ['m1', '−'], ['b', 'x²'], ['r1', ')'], ['p1', '+'], ['l2', '('], ['c', 'x'], ['m2', '−'], ['d', '1'], ['r2', ')']], box: [['l1', 'r1'], ['l2', 'r2']] },
          { cap: '前一组提出 x²，两组都出现 (x − 1)。', toks: [['k', 'x²'], ['g1', '(x − 1)'], ['p1', '+'], ['g2', '(x − 1)']], box: [['g1', 'g1'], ['g2', 'g2']] },
          { cap: '提出公因式 (x − 1)。x² + 1 不能再分解了。', toks: [['g1', '(x − 1)', 't3 tb'], ['g3', '(x² + 1)', 't3 tb']] }
        ]
      },
      {
        name: 'x⁴ + 4（拆项添项）',
        given: '只有两项，又不是平方差',
        stages: [
          { cap: 'x⁴ = (x²)²，4 = 2²，差一个中间项 2 · x² · 2 = 4x² 就能凑成完全平方。', toks: [['a', 'x⁴'], ['p', '+'], ['b', '4']] },
          { cap: '添上 4x²，再减去 4x²，式子的值不变。', toks: [['a', 'x⁴'], ['p2', '+'], ['n', '4x²', 't2 tb'], ['p', '+'], ['b', '4'], ['m', '−'], ['n2', '4x²', 't2 tb']], box: [['a', 'b']] },
          { cap: '前三项是完全平方，4x² = (2x)²：又变成“平方 − 平方”。', toks: [['sq', '(x² + 2)²'], ['m', '−'], ['n2', '(2x)²']], box: [['sq', 'sq'], ['n2', 'n2']] },
          { cap: '平方差公式，再把每个括号按降幂排好。', toks: [['f1', '(x² + 2x + 2)', 't3 tb'], ['f2', '(x² − 2x + 2)', 't3 tb']] }
        ]
      },
      {
        name: '(x² + x)² − 8(x² + x) + 12（换元）',
        given: 'x² + x 出现了两次',
        stages: [
          { cap: '展开会得到四次式，很麻烦。注意 x² + x 反复出现。', toks: [['A', '(x² + x)²'], ['m', '−'], ['B', '8(x² + x)'], ['p', '+'], ['C', '12']] },
          { cap: '设 t = x² + x，式子变成 t 的二次三项式。', toks: [['A', 't²', 't2 tb'], ['m', '−'], ['B', '8t', 't2 tb'], ['p', '+'], ['C', '12']] },
          { cap: '十字相乘：(−2) × (−6) = 12，(−2) + (−6) = −8。', toks: [['f1', '(t − 2)'], ['f2', '(t − 6)']] },
          { cap: '把 t 换回 x² + x。', toks: [['f1', '(x² + x − 2)'], ['f2', '(x² + x − 6)']] },
          { cap: '检查：两个括号都还能十字相乘，继续分解到底。', toks: [['g1', '(x + 2)', 't3 tb'], ['g2', '(x − 1)', 't3 tb'], ['g3', '(x + 3)', 't3 tb'], ['g4', '(x − 2)', 't3 tb']] }
        ]
      }
    ]);
  };

  // ════════════════ c_frac_trick 分式恒等变形 ════════════════

  // 设比值 k：每个字母都是几份 k，k 最后约掉
  A.c_frac_trick_k = function (el) {
    const svg = stage(el, 460, 290);
    const gBar = S('g', {}, svg), gRow = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const RAT = [[2, 3, 4], [1, 2, 3], [3, 4, 5]];
    const EX = [
      { name: '(x + y + z) ÷ (x − y + z)', num: [1, 1, 1], den: [1, -1, 1] },
      { name: '(x + 2y − z) ÷ (2x + z)', num: [1, 2, -1], den: [2, 0, 1] },
      { name: '(x + y) ÷ z', num: [1, 1, 0], den: [0, 0, 1] }
    ];
    let ri = 0, ei = 0, k = 1, busy = false, ran = false;
    sel(c, RAT.map((r) => `x : y : z = ${r.join(' : ')}`), (i, s) => { if (busy) { s.value = ri; return; } ri = i; reset(); });
    sel(c, EX.map((e) => '求 ' + e.name), (i, s) => { if (busy) { s.value = ei; return; } ei = i; reset(); });
    const c2 = ctrl(el);
    slider(c2, 'fk', 'k', 0.5, 3, 0.5, k, (v) => { if (busy) return; k = v; gRow.innerHTML = ''; ran = false; drawBars(); text(); });
    btn(c2, '代入 k，数份数', run);
    btn(c2, '重来', () => { if (!busy) reset(); }, 'alt');
    const X0 = 56, U = 22, BH = 24, ROWY = [22, 60, 98], NUMY = 168, DENY = 236;
    const CLS = ['f1s s1', 'f2s s2', 'f3s s3'];
    let blocks = [[], [], []];
    function drawBars() {
      gBar.innerHTML = '';
      const r = RAT[ri];
      blocks = [[], [], []];
      ['x', 'y', 'z'].forEach((nm, i) => {
        T(gBar, 22, ROWY[i] + 18, nm, 'ital tl');
        for (let j = 0; j < r[i]; j++) {
          const bx = X0 + j * k * U;
          S('rect', { x: bx, y: ROWY[i], width: k * U - 2, height: BH, rx: 3, class: CLS[i] }, gBar);
          blocks[i].push({ x: bx, y: ROWY[i], w: k * U - 2 });
          if (k * U >= 20) T(gBar, bx + (k * U - 2) / 2, ROWY[i] + 17, 'k', 'ital ts');
        }
        T(gBar, X0 + r[i] * k * U + 6, ROWY[i] + 17, `= ${r[i]}k = ${fmt(r[i] * k)}`, 'ts', 'start');
      });
    }
    const val = (co) => co.reduce((s, cf, i) => s + cf * RAT[ri][i], 0);
    function gather(co, y) {
      const r = RAT[ri], pos = [], neg = [];
      co.forEach((cf, i) => {
        for (let rep = 0; rep < Math.abs(cf); rep++) for (let j = 0; j < r[i]; j++) (cf > 0 ? pos : neg).push({ i, j });
      });
      const P = pos.length, N = neg.length, bw = Math.min(26, 330 / Math.max(P, 1));
      const make = (it, slot, cls) => {
        const b0 = blocks[it.i][it.j];
        const rc = S('rect', { x: b0.x, y: b0.y, width: b0.w, height: BH, rx: 3, class: cls }, gRow);
        return { rc, b0, tx: 64 + slot * bw, tw: bw - 3 };
      };
      const ps = pos.map((it, idx) => make(it, idx, CLS[it.i]));
      const ns = neg.map((it, idx) => make(it, P - 1 - idx, 'fsurf2 sstrong dash'));
      const all = ps.concat(ns);
      return {
        step(t) {
          all.forEach((o) => {
            o.rc.setAttribute('x', lerp(o.b0.x, o.tx, t));
            o.rc.setAttribute('y', lerp(o.b0.y, y, t));
            o.rc.setAttribute('width', lerp(o.b0.w, o.tw, t));
          });
        },
        fade(t) {
          ns.forEach((o) => o.rc.setAttribute('opacity', 1 - t));
          ps.slice(P - N).forEach((o) => o.rc.setAttribute('opacity', 1 - t));
        },
        label() {
          T(gRow, 64 + (P - N) * bw + 8, y + 17, `${P - N} 份 = ${P - N}k`, 'ts tb', 'start');
        },
        N
      };
    }
    function run() {
      if (busy) return;
      busy = true;
      gRow.innerHTML = '';
      const e = EX[ei];
      T(gRow, 28, NUMY + 17, '分子', 'ts tb');
      T(gRow, 28, DENY + 17, '分母', 'ts tb');
      const my = (NUMY + BH + DENY) / 2;
      S('line', { x1: 52, x2: 450, y1: my, y2: my, class: 'sstrong' }, gRow);
      const p1 = gather(e.num, NUMY), p2 = gather(e.den, DENY);
      cap.textContent = '把每个字母的“份”搬下来：分子、分母各有几份 k？';
      tween(900, (t) => { p1.step(t); p2.step(t); }, () => {
        if (p1.N || p2.N) cap.textContent = '虚线块是要减去的份数，和同样多的份抵消。';
        tween(p1.N || p2.N ? 600 : 1, (t) => { p1.fade(t); p2.fade(t); }, () => {
          p1.label(); p2.label();
          busy = false; ran = true;
          text();
        });
      });
    }
    function text() {
      const r = RAT[ri], e = EX[ei], nv = val(e.num), dv = val(e.den);
      const vals = ['x', 'y', 'z'].map((nm, i) => `<i>${nm}</i> = ${r[i]}<i>k</i> = ${fmt(r[i] * k)}`).join('，');
      read.innerHTML = `现在 <i>k</i> = ${fmt(k)}：${vals}。<br>分子 = ${fmt(nv * k)}，分母 = ${fmt(dv * k)}，比值 = ${fracH(nv, dv)}。` +
        (ran ? `<br><b>分子 ${nv} 份，分母 ${dv} 份，每份都是 <i>k</i>：${fracH(nv, 1)}<i>k</i> ÷ ${fracH(dv, 1)}<i>k</i> = ${fracH(nv, dv)}，<i>k</i> 约掉了。</b>拖动 <i>k</i>，结果不变。` : '<br>拖动 <i>k</i> 看看：三个数都在变，比值变不变？');
    }
    function reset() {
      gRow.innerHTML = '';
      ran = false;
      drawBars();
      const r = RAT[ri];
      cap.textContent = `设 x/${r[0]} = y/${r[1]} = z/${r[2]} = k，则 x = ${r[0]}k，y = ${r[1]}k，z = ${r[2]}k`;
      text();
    }
    reset();
  };

  // 裂项相消：一项拆两项，前后抵消
  A.c_frac_trick_split = function (el) {
    const svg = stage(el, 460, 290);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const MODES = ['1/(1×2) + 1/(2×3) + …', '1/[x(x+1)] + 1/[(x+1)(x+2)] + …', '1/(1×3) + 1/(3×5) + …（差为 2）'];
    let mode = 0, n = 4, st = 0, busy = false, gen = 0, rows = [];
    sel(c, MODES, (i) => { mode = i; reset(); });
    const nb = btn(c, '裂项 ▶', next);
    btn(c, '重来', reset, 'alt');
    const c2 = ctrl(el);
    slider(c2, 'fn', '项数', 2, 6, 1, n, (v) => { n = v; reset(); });
    const d = (j) => (j === 0 ? 'x' : `(x+${j})`);
    function texts(k) {
      if (mode === 0) return [`1/(${k}×${k + 1})`, k === 1 ? '1' : `1/${k}`, `− 1/${k + 1}`];
      if (mode === 1) return [`1/[${d(k - 1)}${d(k)}]`, `1/${d(k - 1)}`, `− 1/${d(k)}`];
      return [`1/(${2 * k - 1}×${2 * k + 1})`, k === 1 ? '½(1' : `½(1/${2 * k - 1}`, `− 1/${2 * k + 1})`];
    }
    function result() {
      if (mode === 0) return `1 − 1/${n + 1} = ${n}/${n + 1}`;
      if (mode === 1) return `1/x − 1/(x+${n}) = ${n}/[x(x+${n})]`;
      return `½(1 − 1/${2 * n + 1}) = ${n}/${2 * n + 1}`;
    }
    const RULE = [
      `1/[<i>n</i>(<i>n</i> + 1)] = 1/<i>n</i> − 1/(<i>n</i> + 1)：分母是相邻两数之积，拆成两个分数的差。`,
      `1/[(<i>x</i> + <i>m</i>)(<i>x</i> + <i>m</i> + 1)] = 1/(<i>x</i> + <i>m</i>) − 1/(<i>x</i> + <i>m</i> + 1)：两个因式相差 1，直接拆。`,
      `1/[<i>n</i>(<i>n</i> + 2)] = ½[1/<i>n</i> − 1/(<i>n</i> + 2)]：两个因式相差 2，拆完要乘 ½（差是几就乘几分之一）。`
    ];
    function reset() {
      gen++;
      busy = false; st = 0; rows = [];
      g.innerHTML = '';
      for (let k = 1; k <= n; k++) {
        const y = 34 + (k - 1) * 36, [L, A1, B1] = texts(k);
        if (k > 1) T(g, 12, y, '+', 'tl');
        T(g, 24, y, L, 'tl', 'start');
        const eq = T(g, 186, y, '=', 'tl');
        const ta = T(g, 200, y, A1, 'tl', 'start'), tb = T(g, 290, y, B1, 'tl', 'start');
        [eq, ta, tb].forEach((e) => e.setAttribute('opacity', 0));
        rows.push({ y, eq, ta, tb });
      }
      nb.disabled = false;
      nb.textContent = '裂项 ▶';
      cap.textContent = '先看每一项的分母：都是两个“差一样多”的因式相乘。';
      read.innerHTML = RULE[mode];
    }
    function cancel(p, q) {
      [p, q].forEach((e) => {
        const x = +e.getAttribute('x'), y = +e.getAttribute('y'), w = tw(e);
        const ln = S('line', { x1: x, y1: y - 6, x2: x, y2: y - 6, class: 's2 thick round' }, g);
        tween(350, (t) => ln.setAttribute('x2', x + w * t));
        e.setAttribute('opacity', 0.45);
      });
      const x1 = +p.getAttribute('x') + tw(p) / 2, y1 = +p.getAttribute('y') + 6;
      const x2 = +q.getAttribute('x') + tw(q) / 2, y2 = +q.getAttribute('y') - 18;
      S('line', { x1, y1, x2, y2, class: 's2 dash thin' }, g);
    }
    function next() {
      if (busy || st >= 3) return;
      busy = true;
      const my = gen;
      if (st === 0) {
        cap.textContent = '第一步：每一项拆成两个分数的差。';
        rows.forEach((r, i) => wait(i * 350, () => {
          if (my !== gen) return;
          tween(300, (t) => [r.eq, r.ta, r.tb].forEach((e) => e.setAttribute('opacity', t)));
        }));
        wait(rows.length * 350 + 350, () => {
          if (my !== gen) return;
          st = 1; busy = false; nb.textContent = '抵消 ▶';
          read.innerHTML = '仔细看：上一行最后减去的，正好是下一行一开始加上的。';
        });
      } else if (st === 1) {
        cap.textContent = '第二步：相邻两行一减一加，互相抵消。';
        for (let i = 0; i < n - 1; i++) wait(i * 450, () => { if (my === gen) cancel(rows[i].tb, rows[i + 1].ta); });
        wait((n - 1) * 450 + 400, () => {
          if (my !== gen) return;
          st = 2; busy = false; nb.textContent = '求和 ▶';
          read.innerHTML = `中间的 ${n - 1} 对全部抵消，只剩<b>第一行的第一个</b>和<b>最后一行的最后一个</b>。`;
        });
      } else {
        rows[0].ta.setAttribute('class', 'tl t3 tb');
        rows[n - 1].tb.setAttribute('class', 'tl t3 tb');
        const t = T(g, 230, rows[n - 1].y + 44, '合计 = ' + result(), 'tl tb t3');
        t.setAttribute('opacity', 0);
        tween(500, (u) => t.setAttribute('opacity', u), () => { busy = false; });
        st = 3; nb.disabled = true; nb.textContent = '完成';
        cap.textContent = '第三步：首尾两项相减，就是结果。';
        read.innerHTML = `${n} 项的和 = <b>${result()}</b>。项数再多也一样，只剩首尾。`;
      }
    }
    reset();
  };

  // ════════════════ c_radical_trick 二次根式化简技巧 ════════════════

  // 分母有理化 + 裂项：数轴上的“接龙”
  A.c_radical_trick_line = function (el) {
    const svg = stage(el, 460, 220);
    const g0 = S('g', {}, svg), g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let N = 9, busy = false, gen = 0;
    btn(c, '一项一项加', run);
    btn(c, '重来', reset, 'alt');
    slider(c, 'rn', 'N', 2, 16, 1, N, (v) => { N = v; reset(); });
    const X = (v) => 30 + v * 100, LY = 76, SY = 160;
    (function base() {
      S('line', { x1: X(0) - 6, x2: X(4.15), y1: LY, y2: LY, class: 'axis' }, g0);
      for (let i = 0; i <= 4; i++) {
        S('line', { x1: X(i), x2: X(i), y1: LY - 7, y2: LY + 7, class: 'sstrong' }, g0);
        T(g0, X(i), LY + 24, String(i), 'ts tb');
      }
      for (let k = 2; k <= 16; k++) {
        const v = Math.sqrt(k);
        if (Number.isInteger(v)) continue;
        S('line', { x1: X(v), x2: X(v), y1: LY - 4, y2: LY + 4, class: 'smuted' }, g0);
        if (k <= 7) T(g0, X(v), LY - 12 - (k % 2) * 14, '√' + k, 'ts tm');
      }
      T(g0, 12, SY + 5, '和', 'ts tm', 'start');
    })();
    let segs = [];
    function reset() {
      gen++;
      busy = false;
      g.innerHTML = '';
      segs = [];
      for (let k = 1; k < N; k++) {
        segs.push(S('line', { x1: X(Math.sqrt(k)), x2: X(Math.sqrt(k + 1)), y1: LY, y2: LY, class: (k % 2 ? 's1' : 's3') + ' thick', opacity: 0.3 }, g));
      }
      cap.textContent = `1/(√1 + √2) + 1/(√2 + √3) + … + 1/(√${N - 1} + √${N})，共 ${N - 1} 项`;
      read.innerHTML = `每一项分母有理化：${window.fr(1, '√<i>k</i> + √(<i>k</i> + 1)')} = ${window.fr('√(<i>k</i> + 1) − √<i>k</i>', '(<i>k</i> + 1) − <i>k</i>')} = √(<i>k</i> + 1) − √<i>k</i>，正好是数轴上从 √<i>k</i> 到 √(<i>k</i> + 1) 的一小段。点“一项一项加”。`;
    }
    function run() {
      if (busy) return;
      reset();
      busy = true;
      const my = gen;
      const step = (k) => {
        if (my !== gen) return;
        if (k >= N) {
          const x1 = X(1), x2 = X(Math.sqrt(N));
          S('path', { d: `M${x1},${SY + 12} v8 H${x2} v-8`, class: 'fnone s2' }, g);
          T(g, (x1 + x2) / 2, SY + 40, `√${N} − 1 = ${Number.isInteger(Math.sqrt(N)) ? Math.sqrt(N) - 1 : '√' + N + ' − 1'}`, 'tb t2');
          cap.textContent = '所有小段首尾相接，从 1 一直接到 √' + N + '。';
          read.innerHTML = `中间的 √2、√3、…… 都是一加一减抵消了，和 = <b>√${N} − √1 = ${Number.isInteger(Math.sqrt(N)) ? Math.sqrt(N) - 1 : '√' + N + ' − 1'}</b>。` + (Number.isInteger(Math.sqrt(N)) ? '' : '把 N 调成 4、9、16 试试，结果是整数。');
          busy = false;
          return;
        }
        const a = Math.sqrt(k), b = Math.sqrt(k + 1);
        segs[k - 1].setAttribute('opacity', 1);
        const drop = S('line', { x1: X(a), x2: X(b), y1: LY, y2: LY, class: (k % 2 ? 's1' : 's3') + ' thick' }, g);
        cap.textContent = `第 ${k} 项：1/(${rt(k)} + ${rt(k + 1)}) = ${rt(k + 1)} − ${rt(k)} ≈ ${fmt(b - a)}`;
        tween(380, (t) => { drop.setAttribute('y1', lerp(LY, SY, t)); drop.setAttribute('y2', lerp(LY, SY, t)); }, () => wait(180, () => step(k + 1)));
      };
      step(1);
    }
    reset();
  };

  // 双重根式：√(a ± 2√b) 配成完全平方的拼图
  A.c_radical_trick_double = function (el) {
    const svg = stage(el, 460, 260);
    const gF = S('g', {}, svg), gT = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const LIST = [[3, 2], [5, 6], [4, 3], [7, 12], [8, 15], [6, 8], [9, 20]];
    let li = 0, sign = 1, busy = false, gen = 0;
    const twoRoot = (q) => {
      let s = 1;
      for (let i = 2; i * i <= q; i++) if (q % (i * i) === 0) s = i;
      const r = q / (s * s), co = 2 * s;
      return co + (r === 1 ? '' : '√' + r);
    };
    const target = () => `√(${LIST[li][0]} ${sign > 0 ? '+' : '−'} ${twoRoot(LIST[li][1])})`;
    sel(c, LIST.map(([p, q]) => `√(${p} ± ${twoRoot(q)})`), (i) => { li = i; reset(); });
    sel(c, ['中间取 +', '中间取 −'], (i) => { sign = i ? -1 : 1; reset(); });
    btn(c, '找 m、n', run);
    btn(c, '重来', reset, 'alt');
    function figure(m, n, sym, sp) {
      gF.innerHTML = '';
      const rm = Math.sqrt(m), rn = Math.sqrt(n), sc = 196 / (rm + rn), x0 = 26, y0 = 40, cx = x0 + 98, cy = y0 + 98;
      const P = [
        [0, 0, rm, rm, 'f1s', sym ? 'm' : String(m)],
        [rm, rm, rn, rn, 'f3s', sym ? 'n' : String(n)],
        [rm, 0, rn, rm, 'f2s', sym ? '√(mn)' : '√' + m * n],
        [0, rm, rm, rn, 'f2s', sym ? '√(mn)' : '√' + m * n]
      ];
      S('rect', { x: x0, y: y0, width: 196, height: 196, class: 'fnone sstrong dash' }, gF);
      P.forEach(([px, py, w, h, cls, lab]) => {
        let X = x0 + px * sc, Y = y0 + py * sc;
        const dx = X + (w * sc) / 2 - cx, dy = Y + (h * sc) / 2 - cy, len = Math.hypot(dx, dy) || 1;
        X += (dx / len) * 26 * sp; Y += (dy / len) * 26 * sp;
        S('rect', { x: X, y: Y, width: w * sc, height: h * sc, class: cls + ' sstrong thin' }, gF);
        if (Math.min(w, h) * sc >= 24) T(gF, X + (w * sc) / 2, Y + (h * sc) / 2 + 5, lab, 'tb' + (sym ? ' ital' : ''));
      });
      T(gF, x0 + (rm * sc) / 2, y0 - 8, sym ? '√m' : rt(m), 'ts t1');
      T(gF, x0 + rm * sc + (rn * sc) / 2, y0 - 8, sym ? '√n' : rt(n), 'ts t3');
      T(gF, x0 - 4, y0 + (rm * sc) / 2 + 4, sym ? '√m' : rt(m), 'ts t1', 'end');
      T(gF, x0 - 4, y0 + rm * sc + (rn * sc) / 2 + 4, sym ? '√n' : rt(n), 'ts t3', 'end');
    }
    function reset() {
      gen++;
      busy = false;
      gT.innerHTML = '';
      figure(3, 2, true, 0);
      const [p, q] = LIST[li];
      T(gT, 350, 34, target(), 'tl tb t2');
      T(gT, 350, 64, `要找 m + n = ${p}，m × n = ${q}`, 'ts tb');
      cap.textContent = `(√m ${sign > 0 ? '+' : '−'} √n)² = m + n ${sign > 0 ? '+' : '−'} 2√(mn)：大正方形 = m + n + 两块 √(mn)。`;
      read.innerHTML = `${target()} 里的 ${twoRoot(q)} = 2√${q}，对应图中“两块长方形”2√(<i>mn</i>)，所以要找两个数 <i>m</i>、<i>n</i>：<b>和是 ${p}，积是 ${q}</b>。点“找 m、n”。`;
    }
    function run() {
      if (busy) return;
      reset();
      busy = true;
      const my = gen;
      const [p, q] = LIST[li];
      const tries = [];
      for (let m = p - 1; m >= Math.ceil(p / 2); m--) tries.push([m, p - m]);
      const step = (i) => {
        if (my !== gen) return;
        const [m, n] = tries[i], ok = m * n === q;
        T(gT, 350, 96 + i * 26, `m = ${m}，n = ${n}：${m} × ${n} = ${m * n} ${ok ? '✓' : '✗'}`, ok ? 't3 tb' : 'tm');
        if (!ok && i < tries.length - 1) { wait(700, () => step(i + 1)); return; }
        if (!ok) { busy = false; return; }
        cap.textContent = `找到了：m = ${m}，n = ${n}。把这四块拼成正方形。`;
        tween(1000, (t) => figure(m, n, false, 1 - t), () => {
          busy = false;
          const res = `${rt(m)} ${sign > 0 ? '+' : '−'} ${rt(n)}`;
          T(gT, 350, 228, `${target()} = ${res}`, 'tb t3');
          read.innerHTML = `边长 ${rt(m)} + ${rt(n)} 的正方形面积 = ${m} + ${n} + 2√${q} = ${p} + ${twoRoot(q)}。<br>` +
            (sign > 0
              ? `所以 <b>${target()} = ${res}</b>。`
              : `中间是减号：(${rt(m)} − ${rt(n)})<sup>2</sup> = ${p} − ${twoRoot(q)}，开方时<b>大的减小的</b>（${rt(m)} &gt; ${rt(n)}），<b>${target()} = ${res}</b>。`);
        });
      };
      step(0);
    }
    reset();
  };

  // ════════════════ c_linear_adv 一次函数综合 ════════════════

  // 两条直线与坐标轴围成的三角形面积
  A.c_linear_adv_area = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const gT = S('g', {}, svg);
    const l1 = S('line', { class: 'fline', 'clip-path': G.clip }, svg);
    const l2 = S('line', { class: 's2 thick round', 'clip-path': G.clip }, svg);
    const gP = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let k = -1, b = 4, mode = 0, busy = false;
    sel(c, ['和 x 轴围成的三角形', '和 y 轴围成的三角形'], (i) => { mode = i; draw(); });
    btn(c, '让 b 动起来', () => {
      if (busy) return;
      busy = true;
      tween(3500, (t) => { b = lerp(-4, 6, t); draw(); }, () => { b = 6; sb.set(6); busy = false; draw(); });
    });
    const c2 = ctrl(el);
    slider(c2, 'lk', 'k', -3, 3, 0.5, k, (v) => { k = v; draw(); });
    const sb = slider(c2, 'lb', 'b', -4, 6, 1, b, (v) => { if (!busy) { b = v; draw(); } });
    const dot = (x, y, lab) => {
      if (Math.abs(x) > 6.3 || Math.abs(y) > 6.3) return;
      S('circle', { cx: G.X(x), cy: G.Y(y), r: 5, class: 'dot' }, gP);
      T(gP, G.X(x) + 8, G.Y(y) - 7, lab, 'tb', 'start');
    };
    function draw() {
      setLine(G, l1, (x) => x + 2);
      setLine(G, l2, (x) => k * x + b);
      gT.innerHTML = ''; gP.innerHTML = '';
      const head = `<span class="k1">l<sub>1</sub>：<i>y</i> = <i>x</i> + 2</span>　<span class="k2">l<sub>2</sub>：${lineTxt(k, b)}</span><br>`;
      if (Math.abs(k - 1) < 1e-9) { read.innerHTML = head + '<i>k</i> = 1 时两直线平行，没有交点，围不成三角形。'; return; }
      const px = (b - 2) / (1 - k), py = px + 2;
      let pts, txt;
      if (mode === 0) {
        if (Math.abs(k) < 1e-9) { read.innerHTML = head + 'l<sub>2</sub> 是水平直线，和 <i>x</i> 轴没有交点（或重合），围不成三角形。'; dot(px, py, 'P'); return; }
        const xb = -b / k, base = Math.abs(-2 - xb), h = Math.abs(py), S2 = (base * h) / 2;
        pts = [[-2, 0], [xb, 0], [px, py]];
        dot(-2, 0, 'A'); dot(xb, 0, 'B'); dot(px, py, 'P');
        txt = `交点 P(${fmt(px)}, ${fmt(py)})；与 <i>x</i> 轴交于 A(−2, 0)、B(${fmt(xb)}, 0)。<br>以 AB 为底，P 到 <i>x</i> 轴的距离 |${fmt(py)}| 为高：<b>S = ${window.fr(1, 2)} × ${fmt(base)} × ${fmt(h)} = ${fmt(S2)}</b>`;
      } else {
        const base = Math.abs(2 - b), h = Math.abs(px), S2 = (base * h) / 2;
        pts = [[0, 2], [0, b], [px, py]];
        dot(0, 2, 'C'); dot(0, b, 'D'); dot(px, py, 'P');
        txt = `交点 P(${fmt(px)}, ${fmt(py)})；与 <i>y</i> 轴交于 C(0, 2)、D(0, ${fmt(b)})。<br>以 CD 为底，P 到 <i>y</i> 轴的距离 |${fmt(px)}| 为高：<b>S = ${window.fr(1, 2)} × ${fmt(base)} × ${fmt(h)} = ${fmt(S2)}</b>`;
      }
      S('polygon', { points: pts.map(([x, y]) => `${G.X(x)},${G.Y(y)}`).join(' '), class: 'f3s s3', style: 'opacity: .75', 'clip-path': G.clip }, gT);
      read.innerHTML = head + txt;
    }
    draw();
  };

  // 过定点的直线：绕定点转动，与线段 AB 何时相交
  A.c_linear_adv_pivot = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    S('line', { x1: G.X(2), y1: G.Y(1), x2: G.X(-1), y2: G.Y(4), class: 'smuted dash' }, svg);
    S('line', { x1: G.X(2), y1: G.Y(1), x2: G.X(5), y2: G.Y(4), class: 'smuted dash' }, svg);
    S('line', { x1: G.X(-1), y1: G.Y(4), x2: G.X(5), y2: G.Y(4), class: 's3 thick round' }, svg);
    T(svg, G.X(-1) - 4, G.Y(4) - 8, 'A(−1, 4)', 'ts tb', 'end');
    T(svg, G.X(5), G.Y(4) - 10, 'B(5, 4)', 'ts tb');
    const ln = S('line', { class: 'fline', 'clip-path': G.clip }, svg);
    const hit = S('circle', { r: 6, class: 'mark-x' }, svg);
    S('circle', { cx: G.X(2), cy: G.Y(1), r: 6, class: 'mark-y' }, svg);
    T(svg, G.X(2) + 10, G.Y(1) + 18, 'P(2, 1)', 'ts tb', 'start');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let k = 0.5, busy = false;
    const sk = slider(c, 'pk', 'k', -4, 4, 0.25, k, (v) => { if (!busy) { k = v; draw(); } });
    btn(c, '绕 P 转一转', () => {
      if (busy) return;
      busy = true;
      const th0 = -1.4, th1 = 1.4;
      tween(5000, (t) => { k = Math.tan(lerp(th0, th1, t)); draw(); }, () => { k = 4; sk.set(4); busy = false; draw(); });
    });
    function draw() {
      setLine(G, ln, (x) => k * (x - 2) + 1);
      let on = false, xi = 0;
      if (Math.abs(k) > 1e-9) { xi = 2 + 3 / k; on = xi >= -1 - 1e-9 && xi <= 5 + 1e-9; }
      hit.setAttribute('opacity', on ? 1 : 0);
      if (on) { hit.setAttribute('cx', G.X(xi)); hit.setAttribute('cy', G.Y(4)); }
      read.innerHTML = `<i>y</i> = <i>kx</i> − 2<i>k</i> + 1 = <i>k</i>(<i>x</i> − 2) + 1：不管 <i>k</i> 是多少，<i>x</i> = 2 时 <i>y</i> = 1，所以直线<b>总经过 P(2, 1)</b>。<br>
        现在 <i>k</i> = ${fmt(k)}：${on ? `<span class="k3">与线段 AB 交于 (${fmt(xi)}, 4)</span>` : '<span class="k2">与线段 AB 没有交点</span>'}。<br>
        边界是 PA（<i>k</i> = −1）和 PB（<i>k</i> = 1）。直线从 PB 转到竖直、再转到 PA 时才扫过 AB，所以 <b><i>k</i> ≥ 1 或 <i>k</i> ≤ −1</b>。`;
    }
    draw();
  };

  // 分段函数：逐段画出图象
  A.c_linear_adv_piece = function (el) {
    const svg = stage(el, 460, 270);
    const gA = S('g', {}, svg), gL = S('g', {}, svg), gM = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const box = H('div', { class: 'anim-ctrl' }, el);
    const SC = [
      {
        name: '出租车计价', xr: [0, 10], yr: [0, 24], xs: 1, ys: 4, xl: 'x/千米', yl: 'y/元', step: 0.5, x0: 5,
        intro: '3 千米以内收起步价 8 元；超过 3 千米的部分，每千米 2 元。',
        pcs: [{ a: 0, b: 3, f: () => 8, t: 'y = 8（0 < x ≤ 3）', cr: true }, { a: 3, b: 10, f: (x) => 2 * x + 2, t: 'y = 2x + 2（x > 3）', cr: true }]
      },
      {
        name: '阶梯水价', xr: [0, 25], yr: [0, 80], xs: 5, ys: 10, xl: 'x/吨', yl: 'y/元', step: 1, x0: 16,
        intro: '10 吨以内每吨 2 元；10～20 吨的部分每吨 3 元；超过 20 吨的部分每吨 5 元。',
        pcs: [
          // lp：标签位置（数据坐标）和对齐方式，放在折线左上方的空白处，避免压线
          { a: 0, b: 10, f: (x) => 2 * x, t: 'y = 2x（0 ≤ x ≤ 10）', cr: true, lp: [0.5, 30, 'start'] },
          { a: 10, b: 20, f: (x) => 3 * x - 10, t: 'y = 3x − 10（10 < x ≤ 20）', cr: true, lp: [14, 52, 'end'] },
          { a: 20, b: 25, f: (x) => 5 * x - 50, t: 'y = 5x − 50（x > 20）', cr: true, lp: [21.5, 76, 'end'] }
        ]
      },
      {
        name: 'y = |x − 2| + 1', xr: [-3, 7], yr: [0, 7], xs: 1, ys: 1, xl: 'x', yl: 'y', step: 0.5, x0: 4,
        intro: '去绝对值：x ≥ 2 时 |x − 2| = x − 2；x < 2 时 |x − 2| = 2 − x。',
        pcs: [{ a: -3, b: 2, f: (x) => -x + 3, t: 'y = −x + 3（x < 2）', cr: false }, { a: 2, b: 7, f: (x) => x - 1, t: 'y = x − 1（x ≥ 2）', cr: true }]
      }
    ];
    let si = 0, xv = 5, busy = false, gen = 0;
    sel(c, SC.map((s) => s.name), (i, s) => { if (busy) { s.value = si; return; } si = i; xv = SC[si].x0; setup(); });
    btn(c, '逐段画出', play);
    const PX0 = 50, PX1 = 440, PY0 = 236, PY1 = 22;
    let X, Y, lines = [], labs = [];
    function setup() {
      gen++;
      busy = false;
      const s = SC[si];
      X = (v) => PX0 + ((v - s.xr[0]) / (s.xr[1] - s.xr[0])) * (PX1 - PX0);
      Y = (v) => PY0 - ((v - s.yr[0]) / (s.yr[1] - s.yr[0])) * (PY0 - PY1);
      gA.innerHTML = ''; gL.innerHTML = ''; lines = []; labs = [];
      for (let v = s.xr[0]; v <= s.xr[1] + 1e-9; v += s.xs) {
        S('line', { x1: X(v), x2: X(v), y1: Y(s.yr[0]), y2: Y(s.yr[1]), class: 'gridl' }, gA);
        if (v !== 0 && (s.xs > 1 || v % 2 === 0)) T(gA, X(v), PY0 + 16, String(v).replace('-', '−'), 'tick');
      }
      for (let v = s.yr[0]; v <= s.yr[1] + 1e-9; v += s.ys) {
        S('line', { x1: X(s.xr[0]), x2: X(s.xr[1]), y1: Y(v), y2: Y(v), class: 'gridl' }, gA);
        if (v !== 0) T(gA, X(Math.max(0, s.xr[0])) - 6, Y(v) + 4, String(v), 'tick', 'end');
      }
      S('line', { x1: X(s.xr[0]), x2: X(s.xr[1]) + 6, y1: Y(0), y2: Y(0), class: 'axis' }, gA);
      S('line', { x1: X(Math.max(0, s.xr[0])), x2: X(Math.max(0, s.xr[0])), y1: Y(s.yr[0]), y2: Y(s.yr[1]) - 6, class: 'axis' }, gA);
      T(gA, X(Math.max(0, s.xr[0])) - 8, PY0 + 16, 'O', 'tick ital');
      T(gA, PX1 + 4, Y(0) - 8, s.xl, 'tick', 'end');
      T(gA, X(Math.max(0, s.xr[0])) + 8, PY1 + 4, s.yl, 'tick', 'start');
      s.pcs.forEach((p, i) => {
        lines.push(S('line', { x1: X(p.a), y1: Y(p.f(p.a)), x2: X(p.b), y2: Y(p.f(p.b)), class: 'fline' }, gL));
        if (p.lp) { labs.push(T(gL, X(p.lp[0]), Y(p.lp[1]), p.t, 'ts t2 tb', p.lp[2])); return; }
        const mx = clamp(X((p.a + p.b) / 2), 110, 360), my = Y(p.f((p.a + p.b) / 2));
        labs.push(T(gL, mx - (i % 2 ? -18 : 18), my - 14 + (i % 2 ? 0 : -4), p.t, 'ts t2 tb'));
      });
      box.innerHTML = '';
      slider(box, 'px', 'x', s.xr[0], s.xr[1], s.step, xv, (v) => { xv = v; mark(); });
      cap.textContent = s.intro;
      mark();
    }
    function mark() {
      gM.innerHTML = '';
      const s = SC[si];
      let idx = s.pcs.findIndex((p) => xv < p.b || (xv === p.b && p.cr));
      if (idx < 0) idx = s.pcs.length - 1;
      const p = s.pcs[idx], yv = p.f(xv);
      S('line', { x1: X(xv), y1: Y(0), x2: X(xv), y2: Y(yv), class: 'guide' }, gM);
      S('line', { x1: X(Math.max(0, s.xr[0])), y1: Y(yv), x2: X(xv), y2: Y(yv), class: 'guide' }, gM);
      S('circle', { cx: X(xv), cy: Y(yv), r: 6, class: 'mark-y' }, gM);
      lines.forEach((ln, i) => ln.setAttribute('class', i === idx ? 'fline thick' : 'fline'));
      read.innerHTML = `<i>x</i> = ${fmt(xv)} 落在第 ${idx + 1} 段（${p.t.match(/（(.*)）/)[1]}），用 ${p.t.replace(/（.*）/, '')} 计算：<b><i>y</i> = ${fmt(yv)}</b>。` +
        '<br>先判断 <i>x</i> 在哪一段，再选那一段的式子。';
    }
    function play() {
      if (busy) return;
      busy = true;
      const my = gen;
      lines.forEach((ln) => { const L = Math.hypot(ln.x2.baseVal.value - ln.x1.baseVal.value, ln.y2.baseVal.value - ln.y1.baseVal.value); ln.style.strokeDasharray = L; ln.style.strokeDashoffset = L; ln.dataset.len = L; });
      labs.forEach((t) => t.setAttribute('opacity', 0));
      const one = (i) => {
        if (my !== gen) return;
        if (i >= lines.length) { busy = false; cap.textContent = '画完了：每一段都是一条线段，连起来是一条折线。拖动 x 滑块看看每一段怎么算。'; return; }
        const ln = lines[i], L = +ln.dataset.len;
        cap.textContent = `第 ${i + 1} 段：${SC[si].pcs[i].t}`;
        tween(900, (t) => { ln.style.strokeDashoffset = L * (1 - t); labs[i].setAttribute('opacity', t); }, () => {
          ln.style.strokeDasharray = ''; ln.style.strokeDashoffset = '';
          wait(250, () => one(i + 1));
        });
      };
      one(0);
    }
    setup();
  };

  // ════════════════ c_vieta 韦达定理与根的分布 ════════════════

  // 滑块改系数：两根之和、两根之积实时显示
  A.c_vieta_slider = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const axl = S('line', { class: 'symaxis', 'clip-path': G.clip }, svg);
    const curve = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const gR = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 1, b = -1, cc = -6, busy = false;
    const sa = slider(c, 'va', 'a', -2, 2, 0.5, a, (v) => { if (v === 0) { v = 0.5; sa.set(0.5); } a = v; draw(); });
    slider(c, 'vb', 'b', -6, 6, 0.5, b, (v) => { b = v; draw(); });
    const sc = slider(c, 'vc', 'c', -6, 6, 0.5, cc, (v) => { if (!busy) { cc = v; draw(); } });
    const c2 = ctrl(el);
    btn(c2, '让 c 慢慢变化', () => {
      if (busy) return;
      busy = true;
      const c0 = cc, c1 = a > 0 ? 6 : -6;
      tween(3500, (t) => { cc = lerp(c0, c1, t); draw(); }, () => { cc = c1; sc.set(c1); busy = false; draw(); });
    });
    function draw() {
      const f = (x) => a * x * x + b * x + cc;
      curve.setAttribute('d', fpath(G, f, -7, 7));
      const h = -b / (2 * a);
      axl.setAttribute('x1', G.X(h)); axl.setAttribute('x2', G.X(h));
      axl.setAttribute('y1', G.Y(7)); axl.setAttribute('y2', G.Y(-7));
      gR.innerHTML = '';
      const D = b * b - 4 * a * cc;
      const eq = `<b>${polyTxt([a, b, cc])} = 0</b>　（<i>a</i> = ${fmt(a)}，<i>b</i> = ${fmt(b)}，<i>c</i> = ${fmt(cc)}）<br>`;
      if (D < -1e-9) {
        read.innerHTML = eq + `Δ = ${fmt(D)} &lt; 0，抛物线和 <i>x</i> 轴没有交点，<b>没有实数根</b>。<br>这时 −${window.fr('<i>b</i>', '<i>a</i>')} = ${fmt(-b / a)}、${window.fr('<i>c</i>', '<i>a</i>')} = ${fmt(cc / a)} 照样算得出，但它们不是“两根之和、两根之积”——用韦达定理前先看 Δ ≥ 0。`;
        return;
      }
      const s = Math.sqrt(Math.max(0, D));
      const x1 = (-b - s) / (2 * a), x2 = (-b + s) / (2 * a);
      [x1, x2].forEach((r) => { if (Math.abs(r) <= 6.2) S('circle', { cx: G.X(r), cy: G.Y(0), r: 6, class: 'mark-x' }, gR); });
      read.innerHTML = eq + `Δ = ${fmt(D)} ${D > 1e-9 ? '&gt;' : '='} 0，两根 <i>x</i><sub>1</sub> ≈ ${fmt(Math.min(x1, x2))}，<i>x</i><sub>2</sub> ≈ ${fmt(Math.max(x1, x2))}（蓝点）。<br>
        <span class="k1"><i>x</i><sub>1</sub> + <i>x</i><sub>2</sub> = ${fmt(x1 + x2)}</span>，而 −${window.fr('<i>b</i>', '<i>a</i>')} = ${fmt(-b / a)}；
        <span class="k2"><i>x</i><sub>1</sub><i>x</i><sub>2</sub> = ${fmt(x1 * x2)}</span>，而 ${window.fr('<i>c</i>', '<i>a</i>')} = ${fmt(cc / a)}。<br>
        两根关于对称轴（橙色虚线 <i>x</i> = ${fmt(h)}）对称，所以两根之和 = 2 × ${fmt(h)}。`;
    }
    draw();
  };

  // 根的分布：两根都大于 k 需要哪几个条件
  A.c_vieta_dist = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const zone = S('rect', { class: 'f3s', style: 'opacity: .35', 'clip-path': G.clip }, svg);
    const kl = S('line', { class: 'guide', 'clip-path': G.clip }, svg);
    const axl = S('line', { class: 'symaxis', 'clip-path': G.clip }, svg);
    const curve = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const gR = S('g', {}, svg);
    const fk = S('circle', { r: 6, class: 'mark-y' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const MODES = ['两根都大于 k', '两根都小于 k', '一根大于 k，一根小于 k'];
    let h = 2.5, v = -2, k = 1, mode = 0, busy = false;
    sel(c, MODES, (i, s) => { if (busy) { s.value = mode; return; } mode = i; draw(); });
    btn(c, '只看 f(k) 的正负行吗？', () => {
      if (busy) return;
      busy = true;
      const h0 = h, v0 = v, h1 = mode === 1 ? k + 2.5 : k - 2.5, v1 = -1;
      tween(1500, (t) => { h = lerp(h0, h1, t); v = lerp(v0, v1, t); draw(); }, () => {
        h = h1; v = v1; sh.set(h); sv.set(v); busy = false; draw();
      });
    }, 'alt');
    const c2 = ctrl(el);
    const sh = slider(c2, 'dh', 'h', -4, 4, 0.5, h, (x) => { if (!busy) { h = x; draw(); } });
    const sv = slider(c2, 'dv', 'v', -5, 3, 0.5, v, (x) => { if (!busy) { v = x; draw(); } });
    slider(c2, 'dk', 'k', -4, 4, 0.5, k, (x) => { if (!busy) { k = x; draw(); } });
    const mk = (ok, txt) => `<span class="${ok ? 'k3' : 'k2'}">${ok ? '✓' : '✗'} ${txt}</span>`;
    function draw() {
      const f = (x) => (x - h) * (x - h) + v;
      curve.setAttribute('d', fpath(G, f, -7, 7));
      kl.setAttribute('x1', G.X(k)); kl.setAttribute('x2', G.X(k)); kl.setAttribute('y1', G.Y(7)); kl.setAttribute('y2', G.Y(-7));
      axl.setAttribute('x1', G.X(h)); axl.setAttribute('x2', G.X(h)); axl.setAttribute('y1', G.Y(7)); axl.setAttribute('y2', G.Y(-7));
      const left = mode === 1;
      zone.setAttribute('x', left ? G.X(-6) : G.X(k)); zone.setAttribute('y', G.Y(6));
      zone.setAttribute('width', Math.max(0, left ? G.X(k) - G.X(-6) : G.X(6) - G.X(k)));
      zone.setAttribute('height', G.Y(-6) - G.Y(6));
      zone.style.opacity = mode === 2 ? 0 : 0.35;
      const fv = f(k);
      fk.setAttribute('cx', G.X(k)); fk.setAttribute('cy', G.Y(clamp(fv, -6.3, 6.3)));
      gR.innerHTML = '';
      const has = v <= 1e-9, s = Math.sqrt(Math.max(0, -v)), r1 = h - s, r2 = h + s;
      if (has) [r1, r2].forEach((r) => { if (Math.abs(r) <= 6.2) S('circle', { cx: G.X(r), cy: G.Y(0), r: 6, class: 'mark-x' }, gR); });
      const eq = `<i>y</i> = ${polyTxt([1, -2 * h, h * h + v])}　对称轴 <i>x</i> = ${fmt(h)}，<i>f</i>(${fmt(k)}) = ${fmt(fv)}<br>`;
      let conds, real;
      if (mode === 0) {
        conds = [mk(has, 'Δ ≥ 0（有实根）'), mk(h > k, `对称轴 ${fmt(h)} &gt; ${fmt(k)}`), mk(fv > 1e-9, `<i>f</i>(${fmt(k)}) &gt; 0`)];
        real = has && r1 > k + 1e-9;
      } else if (mode === 1) {
        conds = [mk(has, 'Δ ≥ 0（有实根）'), mk(h < k, `对称轴 ${fmt(h)} &lt; ${fmt(k)}`), mk(fv > 1e-9, `<i>f</i>(${fmt(k)}) &gt; 0`)];
        real = has && r2 < k - 1e-9;
      } else {
        conds = [mk(fv < -1e-9, `<i>f</i>(${fmt(k)}) &lt; 0（开口向上时只要这一条）`)];
        real = has && r1 < k - 1e-9 && r2 > k + 1e-9;
      }
      read.innerHTML = eq + '条件：' + conds.join('　') + '<br>实际情况：' +
        (has ? `两根 ${fmt(r1)} 和 ${fmt(r2)}，` : '没有实根，') +
        (real ? `<b class="k3">${MODES[mode].replace(/k/g, fmt(k))} ✓</b>` : `<b class="k2">不满足“${MODES[mode].replace(/k/g, fmt(k))}”</b>`) +
        (mode < 2 ? '<br>三个条件<b>同时</b>成立，才能保证两根都在 <i>k</i> 的同一侧。' : '');
    }
    draw();
  };

  // ════════════════ c_quad_max 二次函数区间最值 ════════════════

  function markExt(G, g, f, lo, hi, h, up) {
    const cands = [[lo, f(lo)], [hi, f(hi)]];
    if (h > lo && h < hi) cands.push([h, f(h)]);
    const ys = cands.map((p) => p[1]);
    const mx = Math.max(...ys), mn = Math.min(...ys);
    cands.forEach(([x, y]) => {
      if (Math.abs(y - mx) < 1e-9) { S('circle', { cx: G.X(x), cy: G.Y(clamp(y, -6.3, 6.3)), r: 7, class: 'mark-y' }, g); T(g, G.X(x), G.Y(clamp(y, -6.3, 6.3)) - 12, '最大', 'ts tb t2'); }
      if (Math.abs(y - mn) < 1e-9) { S('circle', { cx: G.X(x), cy: G.Y(clamp(y, -6.3, 6.3)), r: 7, class: 'mark-x' }, g); T(g, G.X(x), G.Y(clamp(y, -6.3, 6.3)) + 22, '最小', 'ts tb t1'); }
    });
    return { mx, mn };
  }

  // 定轴动区间：拖动区间 [m, m + 2]
  A.c_quad_max_window = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const band = S('rect', { class: 'f2s', style: 'opacity: .35' }, svg);
    const axl = S('line', { class: 'symaxis', 'clip-path': G.clip }, svg);
    const ghost = S('path', { class: 'ghostp', 'clip-path': G.clip }, svg);
    const part = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const gM = S('g', {}, svg);
    const hd = S('circle', { r: 12, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const FS = [
      { name: 'y = ½(x − 1)² − 3（开口向上）', f: (x) => 0.5 * (x - 1) ** 2 - 3, h: 1, up: true },
      { name: 'y = −½(x − 1)² + 3（开口向下）', f: (x) => -0.5 * (x - 1) ** 2 + 3, h: 1, up: false }
    ];
    let fi = 0, m = -3, busy = false;
    sel(c, FS.map((F) => F.name), (i) => { fi = i; draw(); });
    btn(c, '区间从左扫到右', () => {
      if (busy) return;
      busy = true;
      tween(6000, (t) => { m = lerp(-3, 3, t); draw(); }, () => { m = 3; sm.set(3); busy = false; draw(); });
    });
    const c2 = ctrl(el);
    const sm = slider(c2, 'wm', 'm', -3, 3, 0.25, m, (v) => { if (!busy) { m = v; draw(); } });
    drag(svg, hd, (p) => {
      if (busy) return;
      m = clamp(Math.round(((p.x - G.X(0)) / G.u - 1) * 4) / 4, -3, 3);
      sm.set(m);
      draw();
    });
    function draw() {
      const F = FS[fi], n = m + 2;
      band.setAttribute('x', G.X(m)); band.setAttribute('width', G.X(n) - G.X(m));
      band.setAttribute('y', G.Y(6)); band.setAttribute('height', G.Y(-6) - G.Y(6));
      axl.setAttribute('x1', G.X(F.h)); axl.setAttribute('x2', G.X(F.h)); axl.setAttribute('y1', G.Y(7)); axl.setAttribute('y2', G.Y(-7));
      ghost.setAttribute('d', fpath(G, F.f, -7, 7));
      part.setAttribute('d', fpath(G, F.f, m, n));
      hd.setAttribute('cx', G.X(m + 1)); hd.setAttribute('cy', G.Y(-5.4));
      gM.innerHTML = '';
      const r = markExt(G, gM, F.f, m, n, F.h, F.up);
      let where;
      if (F.h <= m) where = `对称轴 <i>x</i> = ${fmt(F.h)} 在区间<b>左边</b>：区间在对称轴右侧，<i>y</i> 随 <i>x</i> 增大而${F.up ? '增大' : '减小'}，最值都在端点。`;
      else if (F.h >= n) where = `对称轴 <i>x</i> = ${fmt(F.h)} 在区间<b>右边</b>：区间在对称轴左侧，<i>y</i> 随 <i>x</i> 增大而${F.up ? '减小' : '增大'}，最值都在端点。`;
      else where = `对称轴 <i>x</i> = ${fmt(F.h)} 在区间<b>里面</b>：${F.up ? '最小' : '最大'}值在顶点，${F.up ? '最大' : '最小'}值在离对称轴<b>较远</b>的端点。`;
      read.innerHTML = `区间 [${fmt(m)}, ${fmt(n)}]（拖动橙色圆点或滑块）。<br>${where}<br>
        <span class="k2">最大值 ${fmt(r.mx)}</span>，<span class="k1">最小值 ${fmt(r.mn)}</span>。`;
    }
    draw();
  };

  // 动轴定区间：对称轴 x = a 移动，区间 [0, 2] 固定
  A.c_quad_max_axis = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    S('rect', { x: G.X(0), y: G.Y(6), width: G.X(2) - G.X(0), height: G.Y(-6) - G.Y(6), class: 'f2s', style: 'opacity: .35' }, svg);
    T(svg, G.X(1), G.Y(-5.6), '区间 [0, 2]', 'ts tb');
    const axl = S('line', { class: 'symaxis', 'clip-path': G.clip }, svg);
    const ghost = S('path', { class: 'ghostp', 'clip-path': G.clip }, svg);
    const part = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const gM = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = -1.5, busy = false;
    const f = (x) => 0.5 * (x - a) ** 2 - 3;
    const sa = slider(c, 'qa', 'a', -2, 4, 0.25, a, (v) => { if (!busy) { a = v; draw(); } });
    btn(c, '让对称轴走一遍', () => {
      if (busy) return;
      busy = true;
      tween(6000, (t) => { a = lerp(-2, 4, t); draw(); }, () => { a = 4; sa.set(4); busy = false; draw(); });
    });
    function draw() {
      axl.setAttribute('x1', G.X(a)); axl.setAttribute('x2', G.X(a)); axl.setAttribute('y1', G.Y(7)); axl.setAttribute('y2', G.Y(-7));
      ghost.setAttribute('d', fpath(G, f, -7, 7));
      part.setAttribute('d', fpath(G, f, 0, 2));
      gM.innerHTML = '';
      const r = markExt(G, gM, f, 0, 2, a, true);
      let mn, mx;
      if (a < 0) mn = `<i>a</i> &lt; 0：对称轴在区间左边，最小值 = <i>f</i>(0) = ${fmt(f(0))}`;
      else if (a <= 2) mn = `0 ≤ <i>a</i> ≤ 2：对称轴在区间里，最小值 = 顶点纵坐标 −3`;
      else mn = `<i>a</i> &gt; 2：对称轴在区间右边，最小值 = <i>f</i>(2) = ${fmt(f(2))}`;
      if (a < 1) mx = `<i>a</i> &lt; 1：<i>x</i> = 2 离对称轴更远，最大值 = <i>f</i>(2) = ${fmt(f(2))}`;
      else if (a > 1) mx = `<i>a</i> &gt; 1：<i>x</i> = 0 离对称轴更远，最大值 = <i>f</i>(0) = ${fmt(f(0))}`;
      else mx = '<i>a</i> = 1：两个端点离对称轴一样远，最大值 = <i>f</i>(0) = <i>f</i>(2) = −2.5';
      read.innerHTML = `<i>y</i> = ${window.fr(1, 2)}(<i>x</i> − ${fmt(a)})<sup>2</sup> − 3，对称轴 <i>x</i> = ${fmt(a)}。<br>
        <span class="k1">最小值：${mn}</span><br><span class="k2">最大值：${mx}</span><br>
        <span class="anim-tip">最小值按 0、2 分三类；最大值按区间中点 1 分两类。（现在最大 ${fmt(r.mx)}，最小 ${fmt(r.mn)}）<br>讲解里的 <i>y</i> = <i>x</i><sup>2</sup> − 2<i>ax</i> + 1 对称轴也是 <i>x</i> = <i>a</i>，分类方法和这里完全相同。</span>`;
    }
    draw();
  };

  // ════════════════ c_mean_ineq 配方与均值不等式 ════════════════

  // 周长一定的长方形：什么时候面积最大
  A.c_mean_ineq_rect = function (el) {
    const svg = stage(el, 460, 250);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const Ps = [12, 16, 20, 24];
    let P = 20, x = 2, busy = false, sx = null;
    const s0 = sel(c, Ps.map((p) => '周长 ' + p), (i, s) => {
      if (busy) { s.value = Ps.indexOf(P); return; }
      P = Ps[i]; x = Math.min(x, P / 2 - 0.5); makeSlider(); render();
    });
    s0.value = 2;
    btn(c, '找面积最大', () => {
      if (busy) return;
      busy = true;
      const x0 = x, x1 = P / 4;
      tween(1200, (t) => { x = lerp(x0, x1, t); render(); }, () => { x = x1; sx.set(x); busy = false; render(); });
    });
    const box = H('div', { class: 'anim-ctrl' }, el);
    function makeSlider() {
      box.innerHTML = '';
      sx = slider(box, 'mx', '长', 0.5, P / 2 - 0.5, 0.5, x, (v) => { if (!busy) { x = v; render(); } });
    }
    function render() {
      g.innerHTML = '';
      const half = P / 2, w = half - x, sc = 186 / half, rx = 16, ry = 34;
      S('rect', { x: rx, y: ry, width: x * sc, height: w * sc, class: 'f1s s1' }, g);
      T(g, rx + (x * sc) / 2, ry - 9, '长 ' + fmt(x), 'ts');
      T(g, rx + x * sc + 5, ry + (w * sc) / 2 + 4, '宽 ' + fmt(w), 'ts', 'start');
      if (x * sc > 40 && w * sc > 24) T(g, rx + (x * sc) / 2, ry + (w * sc) / 2 + 6, fmt(x * w), 'tb');
      const gx0 = 262, gx1 = 448, gy0 = 222, gy1 = 36, Smax = (P / 4) ** 2;
      const GX = (v) => gx0 + (v / half) * (gx1 - gx0), GY = (s) => gy0 - (s / Smax) * (gy0 - gy1);
      S('line', { x1: gx0, y1: gy0, x2: gx1 + 4, y2: gy0, class: 'axis' }, g);
      S('line', { x1: gx0, y1: gy0, x2: gx0, y2: gy1 - 14, class: 'axis' }, g);
      T(g, gx1, gy0 + 16, '长', 'tick');
      T(g, gx0 + 6, gy1 - 18, '面积', 'tick', 'start');
      let d = '';
      for (let v = 0; v <= half + 1e-9; v += half / 60) d += (d ? 'L' : 'M') + GX(v).toFixed(1) + ',' + GY(v * (half - v)).toFixed(1);
      S('path', { d, class: 'fline' }, g);
      S('line', { x1: GX(P / 4), y1: gy0, x2: GX(P / 4), y2: GY(Smax), class: 'guide' }, g);
      T(g, GX(P / 4), gy0 + 16, fmt(P / 4), 'tick');
      T(g, GX(P / 4), GY(Smax) - 8, '最大 ' + fmt(Smax), 'ts tb t2');
      S('circle', { cx: GX(x), cy: GY(x * w), r: 6, class: 'mark-x' }, g);
      const diff = x - P / 4;
      read.innerHTML = `周长 ${P}，长 + 宽 = ${fmt(half)}。长 ${fmt(x)}，宽 ${fmt(w)}，<b>面积 = ${fmt(x * w)}</b>。<br>
        配方：面积 = <i>x</i>(${fmt(half)} − <i>x</i>) = ${fmt(Smax)} − (<i>x</i> − ${fmt(P / 4)})<sup>2</sup> = ${fmt(Smax)} − ${fmt(diff * diff)}。<br>
        ${Math.abs(diff) < 1e-9 ? '<span class="k3">长 = 宽，是正方形，面积最大！</span>' : '长和宽相差越小，减去的部分越小，面积越大。'}`;
    }
    makeSlider();
    render();
  };

  // 正方形内拼四个矩形：(a + b)² ≥ 4ab
  A.c_mean_ineq_pinwheel = function (el) {
    const svg = stage(el, 440, 270);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 4, b = 2, sp = 1, busy = false;
    const bt = btn(c, '拼成大正方形', () => {
      if (busy) return;
      busy = true;
      const from = sp, to = sp > 0.5 ? 0 : 1;
      tween(1100, (t) => { sp = lerp(from, to, t); render(); }, () => { sp = to; busy = false; render(); });
    });
    btn(c, '让 b 慢慢变成 a', () => {
      if (busy) return;
      busy = true;
      sp = 0;
      const b0 = b;
      tween(1800, (t) => { b = lerp(b0, a, t); render(); }, () => { b = a; sb.set(b); busy = false; render(); });
    }, 'alt');
    const c2 = ctrl(el);
    slider(c2, 'pa', 'a', 1, 6, 0.5, a, (v) => { if (!busy) { a = v; render(); } });
    const sb = slider(c2, 'pb', 'b', 1, 6, 0.5, b, (v) => { if (!busy) { b = v; render(); } });
    function render() {
      g.innerHTML = '';
      const L = 196, cx = 220, cy = 135, sc = L / (a + b), x0 = cx - L / 2, y0 = cy - L / 2;
      S('rect', { x: x0, y: y0, width: L, height: L, class: 'fnone sstrong dash' }, g);
      T(g, cx, y0 - 8, 'a + b', 'ts ital');
      const lo = Math.min(a, b), hole = Math.abs(a - b);
      if (hole > 1e-9) {
        S('rect', { x: x0 + lo * sc, y: y0 + lo * sc, width: hole * sc, height: hole * sc, class: 'f3s s3', opacity: 1 - sp }, g);
        if (hole * sc > 44 && sp < 0.5) T(g, cx, cy + 5, '(a − b)²', 'ts tb');
      }
      const R = [[0, 0, a, b], [a, 0, b, a], [b, a, a, b], [0, b, b, a]];
      R.forEach(([rx, ry, w, h], i) => {
        const ccx = rx + w / 2 - (a + b) / 2, ccy = ry + h / 2 - (a + b) / 2, len = Math.hypot(ccx, ccy) || 1;
        const X = x0 + rx * sc + (ccx / len) * 34 * sp, Y = y0 + ry * sc + (ccy / len) * 34 * sp;
        S('rect', { x: X, y: Y, width: w * sc, height: h * sc, class: (i % 2 ? 'f2s' : 'f1s') + ' sstrong thin' }, g);
        if (Math.min(w, h) * sc >= 20) T(g, X + (w * sc) / 2, Y + (h * sc) / 2 + 5, 'ab', 'ital');
      });
      bt.textContent = sp > 0.5 ? '拼成大正方形' : '拆开';
      const s = a + b;
      read.innerHTML = sp > 0.5
        ? `四块一样的长方形，长 <i>a</i> = ${fmt(a)}、宽 <i>b</i> = ${fmt(b)}，每块面积 <i>ab</i> = ${fmt(a * b)}。把它们首尾相接拼成边长 <i>a</i> + <i>b</i> 的正方形，会发生什么？`
        : `大正方形 (<i>a</i> + <i>b</i>)<sup>2</sup> = ${fmt(s * s)}，四块长方形 4<i>ab</i> = ${fmt(4 * a * b)}，中间的空洞 (<i>a</i> − <i>b</i>)<sup>2</sup> = ${fmt((a - b) ** 2)}。<br>
           <b>(<i>a</i> + <i>b</i>)<sup>2</sup> = 4<i>ab</i> + (<i>a</i> − <i>b</i>)<sup>2</sup> ≥ 4<i>ab</i></b>，即 <i>ab</i> ≤ (${window.fr('<i>a</i> + <i>b</i>', 2)})<sup>2</sup>。` +
          (hole < 1e-9 ? '<br><span class="k3"><i>a</i> = <i>b</i>，空洞消失，等号成立！</span>' : '<br>空洞还在，所以是“&gt;”。点“让 b 慢慢变成 a”。');
    }
    render();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
