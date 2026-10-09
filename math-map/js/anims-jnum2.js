// 初中 数与代数 第二部分（八、九年级）的互动动画
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, grid, RM } = window.AH;
  const PI = Math.PI;
  const A = {};

  // ── 小工具 ──
  const fr = (p, q) => window.fr(p, q);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const pv = (v) => (v < 0 ? `(${fmt(v)})` : fmt(v)); // 负数加括号
  const approx = (v) => Math.abs(v * 100 - Math.round(v * 100)) > 1e-6;
  const fa = (v) => (approx(v) ? '≈ ' + fmt(v) : fmt(v));
  const sup = (n) => (n === 1 ? '' : n === 2 ? '²' : n === 3 ? '³' : '^' + n);
  // 把 n 写成 k² × m，k 尽量大
  function simpRoot(n) {
    let k = 1;
    for (let i = 2; i * i <= n; i++) if (n % (i * i) === 0) k = i;
    return { k, m: n / (k * k) };
  }
  function rootText(n) {
    const { k, m } = simpRoot(n);
    if (m === 1) return String(k);
    return (k === 1 ? '' : k) + '√' + m;
  }
  // 在 (x, y) 处画 wu × hu 个单位小格的格线
  function cells(parent, x, y, wu, hu, sc) {
    for (let i = 1; i < wu - 1e-9; i++) S('line', { x1: x + i * sc, x2: x + i * sc, y1: y, y2: y + hu * sc, class: 'cell' }, parent);
    for (let j = 1; j < hu - 1e-9; j++) S('line', { x1: x, x2: x + wu * sc, y1: y + j * sc, y2: y + j * sc, class: 'cell' }, parent);
  }
  // 拖拽：onMove 收到 SVG 坐标
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
  function mkSelect(parent, items, onchange) {
    const s = H('select', {}, parent);
    items.forEach((t, i) => H('option', { value: i }, s, t));
    s.addEventListener('change', () => onchange(+s.value));
    return s;
  }
  // 多项式 ax² + bx + c 的 HTML
  function polyHtml(a, b, c) {
    let s = (a === 1 ? '' : a === -1 ? '−' : fmt(a)) + '<i>x</i><sup>2</sup>';
    if (Math.abs(b) > 1e-9) s += (b < 0 ? ' − ' : ' + ') + (Math.abs(b) === 1 ? '' : fmt(Math.abs(b))) + '<i>x</i>';
    if (Math.abs(c) > 1e-9) s += (c < 0 ? ' − ' : ' + ') + fmt(Math.abs(c));
    return s;
  }

  // ═════════════ 整式乘法：完全平方公式拼图 ═════════════
  A.n_poly_square = function (el) {
    const W = 420, Hh = 300;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 4, b = 2, sp = 0, busy = false;
    slider(c, 'psa', 'a', 1, 6, 1, a, (v) => { a = v; draw(); });
    slider(c, 'psb', 'b', 1, 6, 1, b, (v) => { b = v; draw(); });
    const bt = btn(c, '拆开看看', () => {
      if (busy) return;
      busy = true;
      const from = sp, to = sp > 0.5 ? 0 : 1;
      tween(900, (t) => { sp = lerp(from, to, t); draw(); }, () => {
        sp = to; busy = false;
        bt.textContent = to ? '拼回去' : '拆开看看';
        draw();
      });
    });
    function piece(x, y, wu, hu, sc, cls, lab, val) {
      const w = wu * sc, h = hu * sc;
      S('rect', { x, y, width: w, height: h, class: cls + ' sstrong' }, g);
      cells(g, x, y, wu, hu, sc);
      if (w >= 64 && h >= 30) T(g, x + w / 2, y + h / 2 + 5, `${lab} = ${val}`, 'tb');
      else if (w >= 20 && h >= 18) T(g, x + w / 2, y + h / 2 + 4, lab, 'tb ts');
    }
    function draw() {
      g.innerHTML = '';
      const n = a + b, gap = 24 * sp;
      const sc = Math.min((W - 90) / n, (Hh - 70) / n);
      const tot = n * sc + gap;
      const ox = (W - tot) / 2 + 8, oy = (Hh - tot) / 2 + 10;
      const A2 = a * sc, B2 = b * sc;
      piece(ox, oy, a, a, sc, 'f1s', 'a²', a * a);
      piece(ox + A2 + gap, oy, b, a, sc, 'f3s', 'ab', a * b);
      piece(ox, oy + A2 + gap, a, b, sc, 'f3s', 'ab', a * b);
      piece(ox + A2 + gap, oy + A2 + gap, b, b, sc, 'f2s', 'b²', b * b);
      T(g, ox + A2 / 2, oy - 8, 'a', 't1 tb ital');
      T(g, ox + A2 + gap + B2 / 2, oy - 8, 'b', 't2 tb ital');
      T(g, ox - 8, oy + A2 / 2 + 5, 'a', 't1 tb ital', 'end');
      T(g, ox - 8, oy + A2 + gap + B2 / 2 + 5, 'b', 't2 tb ital', 'end');
      if (sp < 0.01) S('rect', { x: ox, y: oy, width: tot, height: tot, class: 'fnone sstrong thick' }, g);
      const s = n * n;
      read.innerHTML = sp > 0.5
        ? `拆开后：<span class="k1"><i>a</i><sup>2</sup> = ${a * a}</span>，<b>两块</b> <span class="k3"><i>ab</i> = ${a * b}</span>，<span class="k2"><i>b</i><sup>2</sup> = ${b * b}</span>。<br>${a * a} + 2 × ${a * b} + ${b * b} = <b>${s}</b>，正好等于 (${a} + ${b})<sup>2</sup>。所以 (<i>a</i> + <i>b</i>)<sup>2</sup> = <i>a</i><sup>2</sup> + <b>2<i>ab</i></b> + <i>b</i><sup>2</sup>。`
        : `边长 <i>a</i> + <i>b</i> = ${a} + ${b} = ${n} 的大正方形，面积 (<i>a</i> + <i>b</i>)<sup>2</sup> = ${n}<sup>2</sup> = <b>${s}</b>。<br>而 <i>a</i><sup>2</sup> + <i>b</i><sup>2</sup> 只有 ${a * a + b * b}，少了 ${2 * a * b}——少的就是两块绿色长方形。`;
    }
    draw();
  };

  // ═════════════ 整式乘法：平方差公式剪拼 ═════════════
  A.n_poly_diff = function (el) {
    const W = 440, Hh = 290;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 6, b = 2, st = 0, busy = false;
    const bt = btn(c, '剪开并拼起来', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 0.5 ? 0 : 1;
      tween(1400, (t) => { st = lerp(from, to, t); draw(); }, () => {
        st = to; busy = false;
        bt.textContent = to ? '放回原处' : '剪开并拼起来';
        draw();
      });
    });
    const sa = slider(c, 'pda', 'a', 3, 8, 1, a, (v) => {
      if (busy) { sa.set(a); return; }
      a = v;
      if (b > a - 1) { b = a - 1; sb.set(b); }
      draw();
    });
    const sb = slider(c, 'pdb', 'b', 1, 7, 1, b, (v) => {
      if (busy) { sb.set(b); return; }
      b = Math.min(v, a - 1);
      sb.set(b);
      draw();
    });
    function draw() {
      g.innerHTML = '';
      const d = a - b;
      const sc = Math.min((W - 100) / (a + b), (Hh - 80) / a);
      const ox = (W - (a + b) * sc) / 2, oy = 36;
      // 剪掉的小正方形
      const cut = S('rect', { x: ox + d * sc, y: oy, width: b * sc, height: b * sc, class: 'fnone smuted dash' }, g);
      cut.setAttribute('opacity', 1 - st);
      if (st < 0.5) T(g, ox + (d + b / 2) * sc, oy + (b * sc) / 2 + 5, '剪掉 b²', 'tm ts');
      // 下面的长条（不动）
      S('rect', { x: ox, y: oy + b * sc, width: a * sc, height: d * sc, class: 'f1s sstrong' }, g);
      cells(g, ox, oy + b * sc, a, d, sc);
      T(g, ox + (a * sc) / 2, oy + (b + d / 2) * sc + 5, `${a} × ${d}`, 'tb');
      // 左上角那块：转 90° 接到右边
      const th = 90 * st, rad = (th * PI) / 180;
      const tx = ox + lerp(0, a + b, st) * sc, ty = oy + lerp(0, b, st) * sc;
      const g2 = S('g', { transform: `translate(${tx},${ty}) rotate(${th})` }, g);
      S('rect', { x: 0, y: 0, width: d * sc, height: b * sc, class: 'f2s sstrong' }, g2);
      cells(g2, 0, 0, d, b, sc);
      const lx = tx + ((d / 2) * Math.cos(rad) - (b / 2) * Math.sin(rad)) * sc;
      const ly = ty + ((d / 2) * Math.sin(rad) + (b / 2) * Math.cos(rad)) * sc;
      T(g, lx, ly + 5, `${d} × ${b}`, Math.min(d, b) * sc < 32 ? 'tb ts' : 'tb');
      // 边长标注
      const o0 = String(1 - st), o1 = String(st);
      T(g, ox + (a * sc) / 2, oy - 10, `a = ${a}`, 't1 tb').setAttribute('opacity', o0);
      T(g, ox - 6, oy + (a * sc) / 2 + 5, 'a', 't1 tb ital', 'end').setAttribute('opacity', o0);
      T(g, ox + ((a + b) * sc) / 2, oy + a * sc + 22, `a + b = ${a + b}`, 't1 tb').setAttribute('opacity', o1);
      T(g, ox - 6, oy + (b + d / 2) * sc + 5, 'a − b', 't2 tb ts', 'end').setAttribute('opacity', o1);
      if (st >= 1) S('rect', { x: ox, y: oy + b * sc, width: (a + b) * sc, height: d * sc, class: 'fnone sstrong thick' }, g);
      if (st <= 0) {
        read.innerHTML = `边长 <i>a</i> = ${a} 的正方形，剪掉边长 <i>b</i> = ${b} 的小正方形，剩下的面积是 <i>a</i><sup>2</sup> − <i>b</i><sup>2</sup> = ${a * a} − ${b * b} = <b>${a * a - b * b}</b>。`;
      } else if (st >= 1) {
        read.innerHTML = `拼成了一个长方形：长 <i>a</i> + <i>b</i> = ${a + b}，宽 <i>a</i> − <i>b</i> = ${d}，面积 ${a + b} × ${d} = <b>${(a + b) * d}</b>。<br>剪拼前后面积不变，所以 (<i>a</i> + <i>b</i>)(<i>a</i> − <i>b</i>) = <i>a</i><sup>2</sup> − <i>b</i><sup>2</sup>。`;
      } else {
        read.innerHTML = '橙色那块正在转过去……';
      }
    }
    draw();
  };

  // ═════════════ 因式分解：代数片拼长方形 ═════════════
  A.n_factorize_tiles = function (el) {
    const W = 440, Hh = 250, X = 64, u = 20, rx = 250, ry = 40;
    // [名称, p, q, r, s, 结果, 方法]：长 = px + q，宽 = rx + s
    const POLYS = [
      ['x² + 3x', 1, 3, 1, 0, 'x(x + 3)', '提公因式 x'],
      ['x² + 2x + 1', 1, 1, 1, 1, '(x + 1)²', '完全平方公式'],
      ['x² + 4x + 4', 1, 2, 1, 2, '(x + 2)²', '完全平方公式'],
      ['x² + 6x + 9', 1, 3, 1, 3, '(x + 3)²', '完全平方公式'],
      ['x² + 3x + 2', 1, 1, 1, 2, '(x + 1)(x + 2)', '拓展：十字相乘法'],
      ['x² + 5x + 6', 1, 2, 1, 3, '(x + 2)(x + 3)', '拓展：十字相乘法'],
      ['2x² + 3x + 1', 2, 1, 1, 1, '(2x + 1)(x + 1)', '拓展：十字相乘法']
    ];
    const svg = stage(el, W, Hh);
    T(svg, 15, 16, '一堆代数片', 'tm ts', 'start');
    T(svg, rx, 16, '拼成长方形', 'tm ts', 'start');
    const gL = S('g', {}, svg), gT = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let cur = 0, st = 0, busy = false, tiles = [];
    const sel = mkSelect(c, POLYS.map((p) => p[0]), (i) => {
      if (busy) { sel.value = cur; return; }
      cur = i; build();
    });
    const bt = btn(c, '拼成长方形', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 0.5 ? 0 : 1;
      tween(1600, (t) => { st = lerp(from, to, t); render(); }, () => {
        st = to; busy = false;
        bt.textContent = to ? '打散' : '拼成长方形';
        render();
      });
    });
    H('p', { class: 'anim-tip' }, el, '蓝色大正方形是 x²（边长 x），绿色长条是 x（长 x、宽 1），橙色小方块是 1（边长 1）。');
    const fac = (p, q) => (p === 1 ? '' : p) + 'x' + (q ? ' + ' + q : '');

    function build() {
      gT.innerHTML = ''; gL.innerHTML = '';
      st = 0; bt.textContent = '拼成长方形';
      const [, p, q, r, s] = POLYS[cur];
      tiles = [];
      let iq = 0, ix = 0, iu = 0;
      const add = (type, tx, ty, rot) => {
        let hx, hy;
        if (type === 'sq') { hx = 15 + X / 2 + iq * (X + 8); hy = 28 + X / 2; iq++; }
        else if (type === 'x') { hx = 15 + u / 2 + ix * (u + 8); hy = 104 + X / 2; ix++; }
        else { hx = 15 + u / 2 + (iu % 7) * (u + 8); hy = 182 + u / 2 + Math.floor(iu / 7) * (u + 8); iu++; }
        const w = type === 'sq' ? X : u, h = type === 'u' ? u : X;
        const grp = S('g', {}, gT);
        S('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 2, class: type === 'sq' ? 'f1s s1' : type === 'x' ? 'f3s s3' : 'f2s s2' }, grp);
        T(grp, 0, type === 'u' ? 4 : 5, type === 'sq' ? 'x²' : type === 'x' ? 'x' : '1', type === 'u' ? 'ts' : 'tb');
        tiles.push({ grp, hx, hy, tx, ty, rot });
      };
      const colX = (i) => rx + i * X, colU = (j) => rx + p * X + j * u;
      const rowX = (i) => ry + i * X, rowU = (j) => ry + r * X + j * u;
      for (let i = 0; i < p; i++) for (let j = 0; j < r; j++) add('sq', colX(i) + X / 2, rowX(j) + X / 2, 0);
      for (let i = 0; i < q; i++) for (let j = 0; j < r; j++) add('x', colU(i) + u / 2, rowX(j) + X / 2, 0);
      for (let i = 0; i < p; i++) for (let j = 0; j < s; j++) add('x', colX(i) + X / 2, rowU(j) + u / 2, 90);
      for (let i = 0; i < q; i++) for (let j = 0; j < s; j++) add('u', colU(i) + u / 2, rowU(j) + u / 2, 0);
      // 拼好后的边长标注
      const wd = p * X + q * u, ht = r * X + s * u;
      S('rect', { x: rx, y: ry, width: wd, height: ht, class: 'fnone sstrong thick' }, gL);
      T(gL, rx + wd / 2, ry - 8, fac(p, q), 't2 tb');
      T(gL, rx - 8, ry + ht / 2 + 5, fac(r, s), 't2 tb', 'end');
      render();
    }
    function render() {
      const N = tiles.length;
      tiles.forEach((t, i) => {
        const d = N > 1 ? (i / (N - 1)) * 0.4 : 0;
        const pr = clamp((st - d) / 0.6, 0, 1);
        t.grp.setAttribute('transform', `translate(${lerp(t.hx, t.tx, pr)},${lerp(t.hy, t.ty, pr)}) rotate(${t.rot * pr})`);
      });
      gL.setAttribute('opacity', st >= 1 ? 1 : 0);
      const [name, p, q, r, s, res, how] = POLYS[cur];
      const nx = p * s + q * r, n1 = q * s;
      if (st <= 0) {
        read.innerHTML = `${name}：一共 ${p * r} 个 x²、${nx} 个 x${n1 ? '、' + n1 + ' 个 1' : ''}。能不能把它们<b>不重叠、不留空</b>地拼成一个长方形？`;
      } else if (st >= 1) {
        const sq = p === r && q === s;
        read.innerHTML = `拼成了${sq ? '正方形' : '长方形'}！长是 <span class="k2">${fac(p, q)}</span>，宽是 <span class="k2">${fac(r, s)}</span>。<br>面积 = 长 × 宽，所以 <b>${name} = ${res}</b>（${how}）。`;
      } else {
        read.innerHTML = '代数片正在移动……';
      }
    }
    build();
  };

  // ═════════════ 因式分解：找公因式、提出来 ═════════════
  A.n_factorize_common = function (el) {
    const W = 440, Hh = 260, CW = 30, CH = 30, GAP = 8, X0 = 104;
    const PROBS = [
      ['6x²y − 9xy²', [['+', ['2', '3', 'x', 'x', 'y']], ['−', ['3', '3', 'x', 'y', 'y']]], ''],
      ['4a² + 8ab', [['+', ['2', '2', 'a', 'a']], ['+', ['2', '2', '2', 'a', 'b']]], ''],
      ['3x³ − 6x² + 3x', [['+', ['3', 'x', 'x', 'x']], ['−', ['2', '3', 'x', 'x']], ['+', ['3', 'x']]], '括号里的 x² − 2x + 1 还能用完全平方公式继续分解，最终结果是 3x(x − 1)²。']
    ];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let cur = 0, step = 0, busy = false, rows = [], common = [], finalT = null, ones = [];
    const sel = mkSelect(c, PROBS.map((p) => p[0]), (i) => {
      if (busy) { sel.value = cur; return; }
      cur = i; build();
    });
    btn(c, '① 找公因式', () => {
      if (busy || step !== 0) return;
      step = 1;
      rows.forEach((row) => row.chips.forEach((ch) => { if (ch.isC) ch.rect.setAttribute('class', 'f2s s2'); }));
      busy = true;
      tween(500, (t, raw) => {
        const s = 1 + 0.15 * Math.sin(raw * PI);
        rows.forEach((row) => row.chips.forEach((ch) => {
          if (ch.isC) ch.grp.setAttribute('transform', `translate(${ch.x + CW / 2},${ch.y + CH / 2}) scale(${s}) translate(${-CW / 2},${-CH / 2})`);
        }));
      }, () => { busy = false; say(); });
    });
    btn(c, '② 提出来', () => {
      if (busy) return;
      if (step === 0) { read.innerHTML = '先点“① 找公因式”。'; return; }
      if (step !== 1) return;
      busy = true;
      tween(1300, (t) => {
        rows.forEach((row, ri) => {
          let j = 0, kk = 0;
          row.chips.forEach((ch) => {
            let x, y, op = 1;
            if (ch.isC) {
              if (ri === 0) { x = lerp(ch.x, X0 + j * (CW + GAP), t); y = lerp(ch.y, 190, t); j++; }
              else { x = ch.x; y = ch.y - 14 * t; op = 1 - t; }
            } else { x = lerp(ch.x, X0 + kk * (CW + GAP), t); y = ch.y; kk++; }
            ch.grp.setAttribute('transform', `translate(${x},${y})`);
            ch.grp.setAttribute('opacity', op);
          });
        });
        ones.forEach((o) => o.setAttribute('opacity', t));
        finalT.setAttribute('opacity', t);
      }, () => { busy = false; step = 2; say(); });
    });
    btn(c, '重来', () => { if (!busy) build(); }, 'alt');

    function mono(fs) {
      let coef = 1;
      const lets = [], cnt = {};
      fs.forEach((f) => {
        if (/^\d+$/.test(f)) coef *= +f;
        else { if (!cnt[f]) { cnt[f] = 0; lets.push(f); } cnt[f]++; }
      });
      if (!lets.length) return String(coef);
      return (coef === 1 ? '' : coef) + lets.map((l) => l + sup(cnt[l])).join('');
    }
    function build() {
      g.innerHTML = '';
      step = 0; ones = [];
      const [name, terms] = PROBS[cur];
      const need = {};
      terms[0][1].forEach((f) => {
        if (need[f] === undefined) need[f] = Math.min(...terms.map((t) => t[1].filter((z) => z === f).length));
      });
      common = [];
      rows = terms.map(([sg, fs], ri) => {
        const left = Object.assign({}, need);
        const y = 20 + ri * 50;
        const lab = (ri === 0 ? (sg === '−' ? '−' : '') : sg + ' ') + mono(fs) + ' =';
        T(g, X0 - 10, y + CH / 2 + 5, lab, 'tb', 'end');
        const chips = fs.map((f, ci) => {
          const isC = left[f] > 0;
          if (isC) { left[f]--; if (ri === 0) common.push(f); }
          const x = X0 + ci * (CW + GAP);
          const grp = S('g', { transform: `translate(${x},${y})` }, g);
          const rect = S('rect', { x: 0, y: 0, width: CW, height: CH, rx: 6, class: 'fsurf2 sstrong thin' }, grp);
          T(grp, CW / 2, CH / 2 + 5, f, /\d/.test(f) ? 'tb' : 'tb ital');
          return { grp, rect, f, isC, x, y };
        });
        const rest = chips.filter((ch) => !ch.isC).map((ch) => ch.f);
        if (!rest.length) {
          // 整项被提走，括号里留下 1
          const o = S('g', { transform: `translate(${X0},${y})`, opacity: 0 }, g);
          S('rect', { x: 0, y: 0, width: CW, height: CH, rx: 6, class: 'f3s s3' }, o);
          T(o, CW / 2, CH / 2 + 5, '1', 'tb');
          ones.push(o);
        }
        return { sg, chips, rest };
      });
      T(g, X0 - 10, 190 + CH / 2 + 5, '公因式', 't2 tb', 'end');
      S('line', { x1: 20, x2: W - 20, y1: 176, y2: 176, class: 'sline dash' }, g);
      const inner = rows.map((row, i) => (i === 0 ? (row.sg === '−' ? '−' : '') : ` ${row.sg} `) + mono(row.rest)).join('');
      finalT = T(g, W / 2, 248, `${name} = ${mono(common)}(${inner})`, 'tl tb');
      finalT.setAttribute('opacity', 0);
      say();
    }
    function say() {
      const [name, , extra] = PROBS[cur];
      const C = mono(common);
      if (step === 0) {
        read.innerHTML = `把 ${name} 的每一项拆成一个个因数相乘。哪些因数是<b>每一项都有</b>的？点“① 找公因式”。`;
      } else if (step === 1) {
        read.innerHTML = `橙色的是每一项都有的因数：${common.join(' · ')}。<br>系数取最大公因数，字母取每项都有的、次数最低的，公因式就是 <b>${C}</b>。点“② 提出来”。`;
      } else {
        const inner = rows.map((row, i) => (i === 0 ? (row.sg === '−' ? '−' : '') : ` ${row.sg} `) + mono(row.rest)).join('');
        const hasOne = rows.some((row) => !row.rest.length);
        read.innerHTML = `把公因式 ${C} 提到括号外面，每一项剩下的放进括号：<br><b>${name} = ${C}(${inner})</b>` +
          (hasOne ? '<br>注意：有一项被整个提走了，括号里要留下 <b>1</b>（绿色）。' : '') +
          (extra ? '<br>' + extra : '');
      }
    }
    build();
  };

  // ═════════════ 分式：分母为 0 的“禁区” ═════════════
  A.n_fraction_zero = function (el) {
    const W = 440, Hh = 230, x0 = 30, u = 38, yL = 160;
    const FS = [
      ['x + 1', 'x − 2', (v) => v + 1, (v) => v - 2],
      ['x² − 1', 'x + 1', (v) => v * v - 1, (v) => v + 1],
      ['x', 'x² − 4', (v) => v, (v) => v * v - 4]
    ];
    const svg = stage(el, W, Hh);
    const X = (v) => x0 + (v + 5) * u;
    const numT = T(svg, 150, 42, '', 'tl');
    S('line', { x1: 50, x2: 250, y1: 56, y2: 56, class: 'sstrong' }, svg);
    const denT = T(svg, 150, 82, '', 'tl');
    const valT = T(svg, 345, 66, '', 'txl');
    S('line', { x1: 12, x2: W - 10, y1: yL, y2: yL, class: 'sstrong' }, svg);
    S('path', { d: `M${W - 8},${yL} l-10,-5 v10 Z`, class: 'fstrong' }, svg);
    for (let v = -5; v <= 5; v++) {
      S('line', { x1: X(v), x2: X(v), y1: yL - 5, y2: yL + 5, class: 'sstrong' }, svg);
      T(svg, X(v), yL + 22, fmt(v), 'ts');
    }
    T(svg, W - 12, yL - 12, 'x', 'tb ital', 'end');
    const marks = S('g', {}, svg);
    const ptr = S('g', {}, svg);
    S('path', { d: 'M0,-8 l-8,-16 h16 Z', class: 'f2' }, ptr);
    const hdl = S('circle', { cx: 0, cy: 0, r: 13, class: 'handle' }, ptr);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let cur = 0, xv = 3, busy = false;
    const sel = mkSelect(c, FS.map((f) => `(${f[0]}) / (${f[1]})`), (i) => {
      if (busy) { sel.value = cur; return; }
      cur = i; drawMarks(); draw();
    });
    const sl = slider(c, 'fzx', 'x', -5, 5, 0.5, xv, (v) => {
      if (busy) { sl.set(xv); return; }
      xv = v; draw();
    });
    btn(c, '让 x 从 −5 走到 5', () => {
      if (busy) return;
      busy = true;
      let v = -5;
      const stepF = () => {
        xv = v; sl.set(v); draw();
        v += 0.5;
        if (v <= 5) setTimeout(stepF, RM ? 0 : 260);
        else busy = false;
      };
      stepF();
    });
    H('p', { class: 'anim-tip' }, el, '提示：也可以直接拖动数轴上的圆点。');
    drag(svg, hdl, (p) => {
      if (busy) return;
      xv = clamp(Math.round(((p.x - x0) / u - 5) * 2) / 2, -5, 5);
      sl.set(xv); draw();
    });
    const pts = () => {
      const f = FS[cur], forb = [], zs = [], both = [];
      for (let v = -5; v <= 5; v += 0.5) {
        const dz = Math.abs(f[3](v)) < 1e-9, nz = Math.abs(f[2](v)) < 1e-9;
        if (dz) forb.push(v);
        if (dz && nz) both.push(v);
        if (nz && !dz) zs.push(v);
      }
      return { forb, zs, both };
    };
    function drawMarks() {
      marks.innerHTML = '';
      const { forb, zs } = pts();
      forb.forEach((v) => {
        S('circle', { cx: X(v), cy: yL, r: 9, class: 'fsurf s2' }, marks);
        S('path', { d: `M${X(v) - 5},${yL - 5} l10,10 M${X(v) + 5},${yL - 5} l-10,10`, class: 's2' }, marks);
        T(marks, X(v), yL + 44, '禁区', 't2 ts tb');
      });
      zs.forEach((v) => {
        S('circle', { cx: X(v), cy: yL, r: 7, class: 'f3' }, marks);
        T(marks, X(v), yL + 44, '值为 0', 't3 ts tb');
      });
    }
    function draw() {
      const f = FS[cur];
      const nv = f[2](xv), dv = f[3](xv);
      const sub = (s, val) => (s === 'x' ? fmt(xv) : `${s.replace(/x/g, pv(xv))} = ${fmt(val)}`);
      numT.textContent = sub(f[0], nv);
      denT.textContent = sub(f[1], dv);
      const zero = Math.abs(dv) < 1e-9;
      denT.setAttribute('class', zero ? 'tl tb t2' : 'tl');
      ptr.setAttribute('transform', `translate(${X(xv)},${yL})`);
      if (zero) { valT.textContent = '无意义'; valT.setAttribute('class', 'tl tb t2'); }
      else {
        const v = nv / dv;
        valT.textContent = (approx(v) ? '≈ ' : '= ') + fmt(v);
        valT.setAttribute('class', Math.abs(nv) < 1e-9 ? 'txl t3' : 'txl');
      }
      const { forb, zs, both } = pts();
      let txt;
      if (zero) txt = `<i>x</i> = ${fmt(xv)} 时，分母 ${f[1]} = 0，0 不能作除数，<b>分式没有意义</b>。这就是“禁区”。`;
      else if (Math.abs(nv) < 1e-9) txt = `<i>x</i> = ${fmt(xv)} 时，分子 = 0，分母 = ${fmt(dv)} ≠ 0，所以<b>分式的值为 0</b>。`;
      else txt = `<i>x</i> = ${fmt(xv)} 时，分式的值 = ${fmt(nv)} ÷ ${pv(dv)} ${fa(nv / dv).startsWith('≈') ? fa(nv / dv) : '= ' + fmt(nv / dv)}。`;
      txt += `<br>有意义的条件：<b>${forb.map((v) => '<i>x</i> ≠ ' + fmt(v)).join(' 且 ')}</b>；值为 0 的条件：<b>${zs.length ? zs.map((v) => '<i>x</i> = ' + fmt(v)).join(' 或 ') : '不存在'}</b>。`;
      if (both.length) txt += `<br>注意：<i>x</i> = ${both.map(fmt).join('、')} 时分子也是 0，但分母同时为 0，不能算“值为 0”。`;
      read.innerHTML = txt;
    }
    drawMarks();
    draw();
  };

  // ═════════════ 分式：约分 ═════════════
  A.n_fraction_reduce = function (el) {
    const W = 440, Hh = 200, cx = 220, yN = 44, yD = 112, CH = 34, SEP = 18;
    const RS = [
      { o: ['x² − 4', 'x² + 2x'], n: ['(x + 2)', '(x − 2)'], d: ['x', '(x + 2)'], p: [[0, 1]], cond: 'x ≠ 0 且 x ≠ −2' },
      { o: ['6a²b', '9ab²'], n: ['3', 'a', 'b', '2a'], d: ['3', 'a', 'b', '3b'], p: [[0, 0], [1, 1], [2, 2]], cond: 'a ≠ 0 且 b ≠ 0' },
      { o: ['x² − 2x + 1', 'x² − 1'], n: ['(x − 1)', '(x − 1)'], d: ['(x + 1)', '(x − 1)'], p: [[0, 1]], cond: 'x ≠ 1 且 x ≠ −1' }
    ];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let cur = 0, step = 0, busy = false, E = null;
    const sel = mkSelect(c, RS.map((r) => `(${r.o[0]}) / (${r.o[1]})`), (i) => {
      if (busy) { sel.value = cur; return; }
      cur = i; build();
    });
    const nb = btn(c, '下一步', () => next());
    btn(c, '重来', () => { if (!busy) build(); }, 'alt');
    const cw = (f) => 14 + f.length * 10;
    const strip = (s) => (s.startsWith('(') && s.endsWith(')') ? s.slice(1, -1) : s);
    const joinF = (fs) => (fs.length === 0 ? '1' : fs.length === 1 ? strip(fs[0]) : fs.join(''));
    function layout(fs) {
      const tot = fs.reduce((s, f) => s + cw(f), 0) + Math.max(0, fs.length - 1) * SEP;
      let x = cx - tot / 2;
      return fs.map((f) => { const p = x; x += cw(f) + SEP; return p; });
    }
    function row(fs, y) {
      const xs = layout(fs);
      return fs.map((f, i) => {
        const grp = S('g', { opacity: 0 }, g);
        const rect = S('rect', { x: xs[i], y, width: cw(f), height: CH, rx: 8, class: 'fnone' }, grp);
        const txt = T(grp, xs[i] + cw(f) / 2, y + CH / 2 + 6, f, 'tl');
        const strike = S('line', { x1: xs[i] + 2, y1: y + CH - 4, x2: xs[i] + 2, y2: y + CH - 4, class: 's2 thick' }, grp);
        const dot = i ? T(g, xs[i] - SEP / 2, y + CH / 2 + 6, '·', 'tl tb') : null;
        if (dot) dot.setAttribute('opacity', 0);
        return { f, x: xs[i], y, w: cw(f), grp, rect, txt, strike, dot, gone: false };
      });
    }
    function build() {
      g.innerHTML = '';
      step = 0; nb.disabled = false; nb.textContent = '下一步：分解因式';
      const R = RS[cur];
      const oN = T(g, cx, yN + CH / 2 + 6, R.o[0], 'tl');
      const oD = T(g, cx, yD + CH / 2 + 6, R.o[1], 'tl');
      const bar = S('line', { y1: (yN + CH + yD) / 2, y2: (yN + CH + yD) / 2, class: 'sstrong' }, g);
      const N = row(R.n, yN), D = row(R.d, yD);
      const links = S('g', { opacity: 0 }, g);
      R.p.forEach(([i, j]) => {
        N[i].gone = true; D[j].gone = true;
        S('line', { x1: N[i].x + N[i].w / 2, y1: yN + CH, x2: D[j].x + D[j].w / 2, y2: yD, class: 'guide' }, links);
      });
      const remN = N.filter((z) => !z.gone), remD = D.filter((z) => !z.gone);
      const res = S('g', { opacity: 0 }, g);
      if (!remN.length) T(res, cx, yN + CH / 2 + 6, '1', 'tl tb');
      if (!remD.length) T(res, cx, yD + CH / 2 + 6, '1', 'tl tb');
      const span = (arr) => {
        const xs = arr.map((z) => z.x), xe = arr.map((z) => z.x + z.w);
        return [Math.min(...xs), Math.max(...xe)];
      };
      const [a0, a1] = span(N.concat(D));
      const o0 = Math.min(cx - 70, a0 - 10), o1 = Math.max(cx + 70, a1 + 10);
      bar.setAttribute('x1', o0); bar.setAttribute('x2', o1);
      E = { oN, oD, bar, N, D, links, res, remN, remD, o0, o1 };
      say();
    }
    function next() {
      if (busy || step >= 3) return;
      busy = true;
      if (step === 0) {
        tween(700, (t) => {
          E.oN.setAttribute('opacity', 1 - t); E.oD.setAttribute('opacity', 1 - t);
          E.N.concat(E.D).forEach((z) => { z.grp.setAttribute('opacity', t); if (z.dot) z.dot.setAttribute('opacity', t); });
        }, () => { busy = false; step = 1; nb.textContent = '下一步：找公因式'; say(); });
      } else if (step === 1) {
        E.N.concat(E.D).forEach((z) => { if (z.gone) z.rect.setAttribute('class', 'f2s s2'); });
        tween(500, (t) => E.links.setAttribute('opacity', t), () => { busy = false; step = 2; nb.textContent = '下一步：约分'; say(); });
      } else {
        const all = E.N.concat(E.D);
        const nxs = layout(E.remN.map((z) => z.f)), dxs = layout(E.remD.map((z) => z.f));
        const tgt = new Map();
        E.remN.forEach((z, i) => tgt.set(z, nxs[i]));
        E.remD.forEach((z, i) => tgt.set(z, dxs[i]));
        const rest = E.remN.concat(E.remD);
        const [b0, b1] = rest.length ? [Math.min(...rest.map((z) => tgt.get(z))), Math.max(...rest.map((z) => tgt.get(z) + z.w))] : [cx, cx];
        const n0 = Math.min(cx - 40, b0 - 10), n1 = Math.max(cx + 40, b1 + 10);
        tween(1500, (t, raw) => {
          const t1 = clamp(raw / 0.35, 0, 1), t2 = clamp((raw - 0.4) / 0.6, 0, 1);
          all.forEach((z) => {
            if (z.gone) {
              z.strike.setAttribute('x2', z.x + 2 + (z.w - 4) * t1);
              z.strike.setAttribute('y2', z.y + CH - 4 - (CH - 8) * t1);
              z.grp.setAttribute('opacity', 1 - t2);
            } else {
              z.grp.setAttribute('transform', `translate(${(tgt.get(z) - z.x) * t2},0)`);
            }
            if (z.dot) z.dot.setAttribute('opacity', 1 - t2);
          });
          E.links.setAttribute('opacity', 1 - t2);
          E.bar.setAttribute('x1', lerp(E.o0, n0, t2)); E.bar.setAttribute('x2', lerp(E.o1, n1, t2));
          E.res.setAttribute('opacity', t2);
        }, () => {
          // 剩下的因式之间补上乘号
          [E.remN, E.remD].forEach((arr) => arr.forEach((z, i) => {
            if (i) T(g, tgt.get(z) - SEP / 2, z.y + CH / 2 + 6, '·', 'tl tb');
            if (arr.length === 1) z.txt.textContent = strip(z.f); // 只剩一个因式时去掉括号
          }));
          busy = false; step = 3; nb.disabled = true; nb.textContent = '完成'; say();
        });
      }
    }
    function say() {
      const R = RS[cur];
      const fo = fr(R.o[0], R.o[1]);
      if (step === 0) read.innerHTML = `约分 ${fo}。分子、分母要先写成<b>因式相乘</b>的形式，才能看出公因式。`;
      else if (step === 1) read.innerHTML = `分解后：分子 = ${R.n.join(' · ')}，分母 = ${R.d.join(' · ')}。`;
      else if (step === 2) read.innerHTML = `分子、分母都有的因式（橙色）就是公因式：${R.p.map(([i]) => R.n[i]).join(' · ')}。`;
      else read.innerHTML = `分子、分母同时除以公因式，得到最简分式 <b>${fr(joinF(E.remN.map((z) => z.f)), joinF(E.remD.map((z) => z.f)))}</b>。<br>注意：原分式要求 ${R.cond}，约分只是让式子变简单，这个条件不变。`;
    }
    build();
  };

  // ═════════════ 二次根式：把被开方数分成几个正方形 ═════════════
  A.n_radical_split = function (el) {
    const W = 440, Hh = 215, NS = [8, 12, 18, 20, 24, 27, 32, 45, 48, 50, 72];
    const svg = stage(el, W, Hh);
    const gF = S('g', {}, svg), gS = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 12, st = 0, busy = false, sq = [];
    const sel = mkSelect(c, NS.map((v) => '√' + v), (i) => {
      if (busy) { sel.value = NS.indexOf(n); return; }
      n = NS[i]; build();
    });
    sel.value = NS.indexOf(n);
    const bt = btn(c, '分组', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 0.5 ? 0 : 1;
      tween(1600, (t) => { st = lerp(from, to, t); render(); }, () => {
        st = to; busy = false;
        bt.textContent = to ? '打乱' : '分组';
        render();
      });
    });
    H('p', { class: 'anim-tip' }, el, '要找被开方数里<b>最大</b>的完全平方因数。比如 48 = 16 × 3，而不是 4 × 12（12 里还藏着 4）。');
    function build() {
      gS.innerHTML = ''; gF.innerHTML = '';
      st = 0; bt.textContent = '分组';
      const { k, m } = simpRoot(n);
      const gap = 18;
      const s = Math.min(26, (W - 40 - (m - 1) * gap) / (m * k), 150 / k);
      const cols0 = Math.min(n, 12);
      const s0x = (W - cols0 * s) / 2;
      const tw = m * k * s + (m - 1) * gap, t0x = (W - tw) / 2;
      sq = [];
      for (let i = 0; i < n; i++) {
        const hx = s0x + (i % cols0) * s, hy = 20 + Math.floor(i / cols0) * s;
        const gi = Math.floor(i / (k * k)), w = i % (k * k);
        const tx = t0x + gi * (k * s + gap) + (w % k) * s, ty = 20 + Math.floor(w / k) * s;
        const r = S('rect', { width: s - 2, height: s - 2, rx: 2, class: 'f1s s1 thin' }, gS);
        sq.push({ r, hx, hy, tx, ty, gi });
      }
      for (let gi = 0; gi < m; gi++) {
        const x = t0x + gi * (k * s + gap);
        S('rect', { x: x - 3, y: 17, width: k * s + 4, height: k * s + 4, rx: 4, class: 'fnone s2' }, gF);
        T(gF, x + (k * s) / 2, 20 + k * s + 22, `${k}×${k}=${k * k}`, 't2 tb ts');
      }
      render();
    }
    function render() {
      const N = sq.length;
      sq.forEach((q, i) => {
        const d = N > 1 ? (i / (N - 1)) * 0.5 : 0;
        const p = clamp((st - d) / 0.5, 0, 1);
        q.r.setAttribute('x', lerp(q.hx, q.tx, p) + 1);
        q.r.setAttribute('y', lerp(q.hy, q.ty, p) + 1);
        q.r.setAttribute('class', st >= 1 && q.gi % 2 ? 'f3s s3 thin' : 'f1s s1 thin');
      });
      gF.setAttribute('opacity', st >= 1 ? 1 : 0);
      const { k, m } = simpRoot(n);
      if (st <= 0) {
        read.innerHTML = `√${n} 是面积为 ${n} 的正方形的边长。这里有 ${n} 个小方块，能不能把它们分成几个<b>一样大的正方形</b>？点“分组”。`;
      } else if (st >= 1) {
        read.innerHTML = `${n} = <span class="k2">${k * k}</span> × ${m}：分成了 ${m} 个 ${k}×${k} 的正方形。<br>√${n} = √(${k * k} × ${m}) = √${k * k} × √${m} = <b>${rootText(n)}</b>。${k * k} 是完全平方数，开出来变成 ${k} 写到根号外面，${m} 留在根号里。<br>验算：√${n} ≈ ${fmt(Math.sqrt(n))}，${rootText(n)} ≈ ${fmt(k * Math.sqrt(m))}，相等。`;
      } else {
        read.innerHTML = '小方块正在分组……';
      }
    }
    build();
  };

  // ═════════════ 二次根式：在数轴上找到 √n ═════════════
  A.n_radical_line = function (el) {
    const W = 440, Hh = 262, x0 = 30, u = 64, yL = 212;
    const svg = stage(el, W, Hh);
    const X = (v) => x0 + v * u, Y = (v) => yL - v * u;
    S('line', { x1: 10, x2: W - 8, y1: yL, y2: yL, class: 'sstrong' }, svg);
    S('path', { d: `M${W - 6},${yL} l-10,-5 v10 Z`, class: 'fstrong' }, svg);
    for (let v = 0; v <= 6; v++) {
      S('line', { x1: X(v), x2: X(v), y1: yL - 5, y2: yL + 5, class: 'sstrong' }, svg);
      T(svg, X(v), yL + 20, String(v), 'ts');
    }
    T(svg, X(0), yL - 8, 'O', 'tb ital', 'end');
    const tri = S('polygon', { class: 'f1s s1' }, svg);
    const rmark = S('path', { class: 'fnone sstrong thin' }, svg);
    const rad = S('line', { class: 'guide' }, svg);
    const arc = S('path', { class: 'fnone s2 dash' }, svg);
    const hyp = S('line', { class: 's2 thick round' }, svg);
    const labA = T(svg, 0, 0, '', 't1 tb ts');
    const labB = T(svg, 0, 0, '', 't1 tb ts', 'start');
    const labH = T(svg, 0, 0, '', 't2 tb', 'end');
    const pt = S('circle', { r: 6, class: 'mark-y' }, svg);
    const labP = T(svg, 0, 0, '', 't2 tb');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 1, b = 1, st = 0, busy = false;
    const bt = btn(c, '用圆规转到数轴上', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 0.5 ? 0 : 1;
      tween(1400, (t) => { st = lerp(from, to, t); render(); }, () => {
        st = to; busy = false;
        bt.textContent = to ? '收回' : '用圆规转到数轴上';
        render();
      });
    });
    const sa = slider(c, 'rla', 'OA', 1, 4, 1, a, (v) => { if (busy) { sa.set(a); return; } a = v; reset(); });
    const sb = slider(c, 'rlb', 'AB', 1, 3, 1, b, (v) => { if (busy) { sb.set(b); return; } b = v; reset(); });
    function reset() { st = 0; bt.textContent = '用圆规转到数轴上'; render(); }
    function render() {
      const n = a * a + b * b, r = Math.sqrt(n), th0 = Math.atan2(b, a);
      tri.setAttribute('points', `${X(0)},${Y(0)} ${X(a)},${Y(0)} ${X(a)},${Y(b)}`);
      rmark.setAttribute('d', `M${X(a) - 12},${yL} v-12 h12`);
      hyp.setAttribute('x1', X(0)); hyp.setAttribute('y1', yL);
      hyp.setAttribute('x2', X(a)); hyp.setAttribute('y2', Y(b));
      labA.setAttribute('x', X(a / 2)); labA.setAttribute('y', yL - 8); labA.textContent = String(a);
      labB.setAttribute('x', X(a) + 8); labB.setAttribute('y', Y(b / 2) + 5); labB.textContent = String(b);
      labH.setAttribute('x', X(a / 2) - 8); labH.setAttribute('y', Y(b / 2) - 6); labH.textContent = '√' + n;
      const th = th0 * (1 - st);
      const px = X(0) + r * u * Math.cos(th), py = yL - r * u * Math.sin(th);
      arc.setAttribute('d', st > 0 ? `M${X(a)},${Y(b)} A${r * u},${r * u} 0 0 1 ${px},${py}` : '');
      rad.setAttribute('x1', X(0)); rad.setAttribute('y1', yL);
      rad.setAttribute('x2', px); rad.setAttribute('y2', py);
      rad.setAttribute('opacity', st > 0 && st < 1 ? 1 : 0);
      pt.setAttribute('cx', px); pt.setAttribute('cy', py);
      const simp = rootText(n), same = simp === '√' + n;
      labP.setAttribute('x', px); labP.setAttribute('y', yL + 42);
      labP.textContent = st >= 1 ? '√' + n + (same ? '' : ' = ' + simp) : '';
      let txt = `直角边 <i>OA</i> = ${a}，<i>AB</i> = ${b}。由勾股定理，斜边 <i>OB</i> = √(${a}<sup>2</sup> + ${b}<sup>2</sup>) = <b>√${n}</b>。`;
      if (st >= 1) {
        txt += `<br>以 <i>O</i> 为圆心、<i>OB</i> 为半径画弧，交数轴于一点，这个点就表示 <b>√${n}</b>` +
          (same ? '' : ` = ${simp}`) + (Number.isInteger(r) ? `，正好是整数 ${r}。` : `，约等于 ${fmt(r)}。`) +
          (Number.isInteger(r) ? '' : '<br>无理数也能在数轴上找到准确的位置。');
      } else if (st <= 0) txt += ' 点按钮，把斜边“转”到数轴上。';
      read.innerHTML = txt;
    }
    render();
  };

  // ═════════════ 函数：函数机 ═════════════
  A.n_func_machine = function (el) {
    const W = 460, Hh = 280;
    const RULES = [
      ['y = 2x + 1', (x) => 2 * x + 1, (x) => `2 × ${pv(x)} + 1`],
      ['y = x²', (x) => x * x, (x) => `${pv(x)}²`],
      ['y = −x + 3', (x) => -x + 3, (x) => (x === 0 ? '0 + 3' : `−${pv(x)} + 3`)]
    ];
    const svg = stage(el, W, Hh);
    const GX = (x) => 345 + x * 30, GY = (y) => 32 + (10 - y) * 14;
    // 坐标系
    const cid = 'nfm' + Math.random().toString(36).slice(2, 8);
    const cp = S('clipPath', { id: cid }, svg);
    S('rect', { x: GX(-3.5), y: GY(10), width: GX(3.5) - GX(-3.5), height: GY(-6) - GY(10) }, cp);
    for (let x = -3; x <= 3; x++) {
      S('line', { x1: GX(x), x2: GX(x), y1: GY(10), y2: GY(-6), class: x === 0 ? 'axis' : 'gridl' }, svg);
      if (x) T(svg, GX(x), GY(0) + 14, String(x).replace('-', '−'), 'tick');
    }
    for (let y = -6; y <= 10; y += 2) {
      S('line', { x1: GX(-3.5), x2: GX(3.5), y1: GY(y), y2: GY(y), class: y === 0 ? 'axis' : 'gridl' }, svg);
      if (y) T(svg, GX(0) - 5, GY(y) + 4, String(y).replace('-', '−'), 'tick', 'end');
    }
    T(svg, GX(3.5) - 2, GY(0) - 5, 'x', 'tick ital', 'end');
    T(svg, GX(0) + 6, GY(10) + 10, 'y', 'tick ital', 'start');
    const curve = S('path', { class: 'fline', 'clip-path': `url(#${cid})` }, svg);
    const dots = S('g', {}, svg);
    const lastLab = T(svg, 0, 0, '', 'tb ts t2');
    // 机器
    T(svg, 105, 18, '输入 x', 'tm ts');
    const mach = S('g', {}, svg);
    S('polygon', { points: '68,62 142,62 118,96 92,96', class: 'fsurf2 sstrong' }, mach);
    S('rect', { x: 28, y: 96, width: 154, height: 92, rx: 12, class: 'f1s s1 thick' }, mach);
    const ruleT = T(mach, 105, 138, '', 'tl tb');
    T(mach, 105, 164, '函数机', 'tm ts');
    S('rect', { x: 182, y: 150, width: 24, height: 24, class: 'fsurf2 sstrong' }, mach);
    T(svg, 194, 202, '输出 y', 'tm ts');
    const inBall = S('g', { opacity: 0 }, svg);
    S('circle', { r: 16, class: 'f2s s2' }, inBall);
    const inT = T(inBall, 0, 5, '', 'tb');
    const outBall = S('g', { opacity: 0 }, svg);
    S('circle', { r: 16, class: 'f3s s3' }, outBall);
    const outT = T(outBall, 0, 5, '', 'tb');
    const tbl = H('div', { class: 'tbl-wrap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let cur = 0, xv = 1, busy = false, fed = new Map();
    const sel = mkSelect(c, RULES.map((r) => r[0]), (i) => {
      if (busy) { sel.value = cur; return; }
      cur = i; clear();
    });
    const sx = slider(c, 'fmx', 'x', -3, 3, 1, xv, (v) => { xv = v; });
    btn(c, '放进机器', () => { if (!busy) feed(xv, false); });
    btn(c, '全部放一遍', () => {
      if (busy) return;
      let i = -3;
      const nx = () => {
        if (i > 3) { read.innerHTML += '<br>七个点都描好了，点“连线”看看图象。'; return; }
        const v = i++;
        sx.set(v); xv = v;
        feed(v, true, nx);
      };
      nx();
    });
    btn(c, '连线', () => {
      if (busy) return;
      const R = RULES[cur];
      let d = '';
      for (let x = -3; x <= 3.001; x += 0.05) d += (d ? 'L' : 'M') + GX(x).toFixed(1) + ',' + GY(clamp(R[1](x), -8, 12)).toFixed(1);
      curve.setAttribute('d', d);
      busy = true;
      const len = curve.getTotalLength ? curve.getTotalLength() : 600;
      curve.style.strokeDasharray = len; curve.style.strokeDashoffset = len;
      tween(1000, (t) => { curve.style.strokeDashoffset = len * (1 - t); }, () => {
        curve.style.strokeDasharray = ''; curve.style.strokeDashoffset = '';
        busy = false;
        read.innerHTML = `把 <i>x</i> 取 −3 到 3 之间<b>所有</b>的数，得到的点连成这条线，就是函数 <b>${R[0]}</b> 的图象。<br>列表 → 描点 → 连线，这就是画函数图象的方法。`;
      });
    }, 'alt');
    btn(c, '清空', () => { if (!busy) clear(); }, 'alt');

    function clear() {
      fed = new Map();
      dots.innerHTML = ''; curve.setAttribute('d', ''); lastLab.textContent = '';
      ruleT.textContent = RULES[cur][0];
      table();
      read.innerHTML = `机器的规则是 <b>${RULES[cur][0]}</b>。拖动滑块选一个 <i>x</i>，点“放进机器”。`;
    }
    function table() {
      const xs = [...fed.keys()].sort((p, q) => p - q);
      tbl.innerHTML = xs.length
        ? `<table class="mini vals"><tr><th><i>x</i></th>${xs.map((x) => `<td>${fmt(x)}</td>`).join('')}</tr><tr><th><i>y</i></th>${xs.map((x) => `<td>${fmt(fed.get(x))}</td>`).join('')}</tr></table>`
        : '';
    }
    function feed(x, fast, done) {
      busy = true;
      const R = RULES[cur], y = R[1](x), again = fed.has(x);
      const k = fast ? 0.5 : 1;
      inT.textContent = fmt(x);
      inBall.setAttribute('opacity', 1);
      inBall.setAttribute('transform', 'translate(105,36)');
      read.innerHTML = `把 <i>x</i> = ${fmt(x)} 放进机器……`;
      tween(500 * k, (t) => inBall.setAttribute('transform', `translate(105,${lerp(36, 100, t)}) scale(${lerp(1, 0.5, t)})`), () => {
        inBall.setAttribute('opacity', 0);
        tween(500 * k, (t, raw) => mach.setAttribute('transform', `translate(${Math.sin(raw * PI * 8) * 3},0)`), () => {
          mach.setAttribute('transform', '');
          outT.textContent = fmt(y);
          outBall.setAttribute('opacity', 1);
          const tx = GX(x), ty = GY(y);
          tween(800 * k, (t) => {
            const xx = lerp(214, tx, t), yy = lerp(162, ty, t) - 50 * Math.sin(PI * t);
            outBall.setAttribute('transform', `translate(${xx},${yy}) scale(${lerp(1, 0.45, t)})`);
          }, () => {
            outBall.setAttribute('opacity', 0);
            if (!again) {
              fed.set(x, y);
              S('circle', { cx: tx, cy: ty, r: 5, class: 'dot' }, dots);
              table();
            }
            lastLab.setAttribute('x', clamp(tx, 272, 425));
            lastLab.setAttribute('y', ty > 60 ? ty - 10 : ty + 20);
            lastLab.textContent = `(${fmt(x)}, ${fmt(y)})`;
            read.innerHTML = `输入 <i>x</i> = ${fmt(x)}，按规则计算：<i>y</i> = ${R[2](x)} = <b>${fmt(y)}</b>，得到点 (${fmt(x)}, ${fmt(y)})。` +
              (again ? '<br>这个 <i>x</i> 以前放过，出来的 <i>y</i> 还是一样——每个 <i>x</i> 只对应<b>唯一</b>的 <i>y</i>，这正是函数的特点。' : '');
            busy = false;
            if (done) done();
          });
        });
      });
    }
    clear();
  };

  // ═════════════ 函数：读行程图象 ═════════════
  A.n_func_trip = function (el) {
    const W = 440, Hh = 300, px0 = 56, px1 = 420, py0 = 200, py1 = 30, TM = 35;
    const svg = stage(el, W, Hh);
    const TX = (t) => px0 + (t / TM) * (px1 - px0);
    const DY = (d) => py0 - (d / 1000) * (py0 - py1);
    const dist = (t) => (t <= 10 ? 80 * t : t <= 25 ? 800 : t <= 33 ? 800 - 100 * (t - 25) : 0);
    for (let t = 5; t <= TM; t += 5) {
      S('line', { x1: TX(t), x2: TX(t), y1: py0, y2: py1, class: 'gridl' }, svg);
      T(svg, TX(t), py0 + 16, String(t), 'tick');
    }
    for (let d = 200; d <= 1000; d += 200) {
      S('line', { x1: px0, x2: px1, y1: DY(d), y2: DY(d), class: 'gridl' }, svg);
      T(svg, px0 - 6, DY(d) + 4, String(d), 'tick', 'end');
    }
    S('line', { x1: px0, x2: px1 + 8, y1: py0, y2: py0, class: 'axis' }, svg);
    S('line', { x1: px0, x2: px0, y1: py0, y2: py1 - 10, class: 'axis' }, svg);
    T(svg, px0 - 6, py0 + 16, 'O', 'tick ital', 'end');
    T(svg, px1 + 6, py0 - 8, '时间 t（分）', 'tick', 'end');
    T(svg, px0 + 6, py1 - 12, '离家距离 s（米）', 'tick', 'start');
    S('polyline', { points: [[0, 0], [10, 800], [25, 800], [33, 0], [35, 0]].map(([t, d]) => `${TX(t)},${DY(d)}`).join(' '), class: 'fline' }, svg);
    const gv = S('line', { class: 'guide' }, svg), gh = S('line', { class: 'guide' }, svg);
    const dot = S('circle', { r: 6, class: 'mark-y' }, svg);
    const lab = T(svg, 0, 0, '', 'tb ts');
    const hdl = S('circle', { r: 12, class: 'handle' }, svg);
    // 下面的小场景
    const rd0 = 70, rd1 = 390, ry = 262;
    S('line', { x1: rd0, x2: rd1, y1: ry, y2: ry, class: 'smuted thick round' }, svg);
    S('polygon', { points: `${rd0 - 14},${ry - 14} ${rd0},${ry - 28} ${rd0 + 14},${ry - 14}`, class: 'f2s s2' }, svg);
    S('rect', { x: rd0 - 10, y: ry - 14, width: 20, height: 14, class: 'f2s s2' }, svg);
    T(svg, rd0, ry + 20, '家', 'ts tb');
    S('rect', { x: rd1 - 14, y: ry - 30, width: 28, height: 30, class: 'f1s s1' }, svg);
    T(svg, rd1, ry + 20, '图书馆', 'ts tb');
    const man = S('circle', { r: 8, class: 'f3 s3' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let tv = 5, busy = false;
    btn(c, '播放全过程', () => {
      if (busy) return;
      busy = true;
      tween(7000, (t, raw) => { tv = Math.round(raw * TM * 2) / 2; draw(); }, () => { busy = false; tv = TM; draw(); });
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动横轴上的圆点，选一个时刻。');
    drag(svg, hdl, (p) => {
      if (busy) return;
      tv = clamp(Math.round(((p.x - px0) / (px1 - px0)) * TM * 2) / 2, 0, TM);
      draw();
    });
    function draw() {
      const d = dist(tv), x = TX(tv), y = DY(d);
      gv.setAttribute('x1', x); gv.setAttribute('x2', x); gv.setAttribute('y1', py0); gv.setAttribute('y2', y);
      gh.setAttribute('x1', px0); gh.setAttribute('x2', x); gh.setAttribute('y1', y); gh.setAttribute('y2', y);
      dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      hdl.setAttribute('cx', x); hdl.setAttribute('cy', py0);
      lab.setAttribute('x', clamp(x, 90, 380)); lab.setAttribute('y', y - 12);
      lab.textContent = `(${fmt(tv)}, ${fmt(d)})`;
      man.setAttribute('cx', rd0 + (d / 800) * (rd1 - rd0)); man.setAttribute('cy', ry - 10);
      let s;
      if (tv < 10) s = '图象<b>上升</b>：离家越来越远，小明正走向图书馆，每分钟走 800 ÷ 10 = 80 米。';
      else if (tv <= 25) s = '图象<b>水平</b>：时间在走，离家距离一直是 800 米不变——小明在图书馆看书。';
      else if (tv < 33) s = '图象<b>下降</b>：离家越来越近，小明在回家。这段比去的时候<b>更陡</b>，每分钟走 800 ÷ 8 = 100 米，走得更快。';
      else s = '离家距离是 0：小明已经到家了。';
      read.innerHTML = `第 <b>${fmt(tv)}</b> 分钟，小明离家 <b>${fmt(d)}</b> 米。${s}<br>每一个时刻 <i>t</i> 都对应<b>唯一</b>的距离 <i>s</i>，所以 <i>s</i> 是 <i>t</i> 的函数。`;
    }
    draw();
  };

  // ═════════════ 一元二次方程：配方的面积动画 ═════════════
  A.n_quadeq_complete = function (el) {
    const W = 440, Hh = 250, X = 120, K = 14, ox = 40, oy = 50;
    const EQS = [[6, 16], [4, 5], [8, 9], [2, 3]];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let cur = 0, step = 0, busy = false;
    const sel = mkSelect(c, EQS.map(([b, cc]) => `x² + ${b}x = ${cc}`), (i) => {
      if (busy) { sel.value = cur; return; }
      cur = i; step = 0; cap.textContent = ''; render(0);
    });
    btn(c, '① 对半分开', () => go(1));
    btn(c, '② 补上一角', () => go(2));
    btn(c, '③ 开平方', () => go(3));
    btn(c, '重来', () => { if (!busy) { step = 0; cap.textContent = ''; render(0); } }, 'alt');
    function go(s) {
      if (busy) return;
      if (s !== step + 1) {
        cap.textContent = s <= step ? '这一步已经做过了，点“重来”可以重新开始。' : `请按顺序来，先做第 ${step + 1} 步。`;
        return;
      }
      busy = true;
      cap.textContent = ['', '把长条对半分开，贴到正方形的右边和下边', '右下角缺一块，补上它', '左边成了完全平方，开平方求解'][s];
      tween(s === 3 ? 700 : 1200, (t) => render(s - 1 + t), () => { step = s; busy = false; render(s); });
    }
    function render(p) {
      g.innerHTML = '';
      const [b, cc] = EQS[cur], h = b / 2, hk = h * K, sx = ox + X + 34;
      const p1 = clamp(p, 0, 1), p2 = clamp(p - 1, 0, 1), p3 = clamp(p - 2, 0, 1);
      const r = Math.sqrt(cc + h * h);
      // x² 正方形
      S('rect', { x: ox, y: oy, width: X, height: X, class: 'f1s sstrong' }, g);
      T(g, ox + X / 2, oy + X / 2 + 10, 'x²', 'txl');
      T(g, ox + X / 2, oy - 8, 'x', 'tb ital');
      T(g, ox - 8, oy + X / 2 + 5, 'x', 'tb ital', 'end');
      // 缺的角 / 补上的角
      if (p1 >= 1) {
        S('rect', { x: ox + X, y: oy + X, width: hk, height: hk, class: 'fnone s2 dash' }, g);
        if (p2 > 0) S('rect', { x: ox + X, y: oy + X, width: hk * p2, height: hk * p2, class: 'f2 s2' }, g);
        T(g, ox + X + hk + 6, oy + X + hk / 2 + 5, p2 > 0 ? `+ ${h}² = ${h * h}` : '缺一块', 't2 tb ts', 'start');
      }
      // 两个半条
      const halves = [
        [sx + hk / 2, oy + X / 2, ox + X + hk / 2, oy + X / 2, 0],
        [sx + hk * 1.5, oy + X / 2, ox + X / 2, oy + X + hk / 2, 90]
      ];
      halves.forEach(([fx, fy, tx, ty, rot]) => {
        const ang = rot * p1;
        const grp = S('g', { transform: `translate(${lerp(fx, tx, p1)},${lerp(fy, ty, p1)}) rotate(${ang})` }, g);
        S('rect', { x: -hk / 2, y: -X / 2, width: hk, height: X, class: 'f3s sstrong' }, grp);
        if (p1 > 0) {
          const lt = T(grp, 0, 5, `${h}x`, hk < 24 ? 'tb ts' : 'tb');
          lt.setAttribute('transform', `rotate(${-ang})`);
        }
      });
      if (p1 <= 0) {
        T(g, sx + hk, oy + X / 2 + 6, `${b}x`, 'tl tb');
        T(g, sx + hk, oy - 8, String(b), 'tb');
      } else if (p1 >= 1) {
        T(g, ox + X + hk / 2, oy - 8, String(h), 't3 tb ts');
        T(g, ox - 8, oy + X + hk / 2 + 5, String(h), 't3 tb ts', 'end');
      }
      if (p3 > 0) {
        const fr2 = S('rect', { x: ox, y: oy, width: X + hk, height: X + hk, class: 'fnone s2 thick' }, g);
        fr2.setAttribute('opacity', p3);
        T(g, ox + (X + hk) / 2, oy - 28, `边长 x + ${h}`, 't2 tb').setAttribute('opacity', p3);
      }
      // 右侧的方程
      const ex = 362;
      const lines = [[0, `x² + ${b}x = ${cc}`]];
      if (p >= 2) lines.push([2, `x² + ${b}x + ${h * h} = ${cc} + ${h * h}`], [2, `(x + ${h})² = ${cc + h * h}`]);
      if (p >= 3) lines.push([3, `x + ${h} = ±${r}`], [3, `x₁ = ${fmt(r - h)}，x₂ = ${fmt(-r - h)}`]);
      lines.forEach(([, s], i) => T(g, ex, 70 + i * 34, s, i === lines.length - 1 && p >= 2 ? 'tb t2' : 'tb'));
      // 文字说明
      if (p <= 0) read.innerHTML = `方程 <i>x</i><sup>2</sup> + ${b}<i>x</i> = ${cc}。左边是一个 <i>x</i> × <i>x</i> 的正方形加一块 ${b} × <i>x</i> 的长条，现在还拼不成正方形。`;
      else if (p === 1) read.innerHTML = `把 ${b}<i>x</i> 对半分成两个 ${h}<i>x</i>，贴在右边和下边。右下角缺了一个 ${h} × ${h} 的小正方形。`;
      else if (p === 2) read.innerHTML = `补上 ${h}<sup>2</sup> = ${h * h}，左边变成边长 <i>x</i> + ${h} 的正方形：<i>x</i><sup>2</sup> + ${b}<i>x</i> + ${h * h} = (<i>x</i> + ${h})<sup>2</sup>。<br>方程左边加了 ${h * h}，右边也要加 ${h * h}：${cc} + ${h * h} = ${cc + h * h}。（补的正是一次项系数一半的平方：(${b} ÷ 2)<sup>2</sup> = ${h * h}。）`;
      else if (p === 3) read.innerHTML = `(<i>x</i> + ${h})<sup>2</sup> = ${cc + h * h}，开平方：<i>x</i> + ${h} = ±${r}，所以 <b><i>x</i><sub>1</sub> = ${fmt(r - h)}，<i>x</i><sub>2</sub> = ${fmt(-r - h)}</b>。<br>负根 ${fmt(-r - h)} 在图里画不出来，但它代入方程同样成立：(${fmt(-r - h)})<sup>2</sup> + ${b} × (${fmt(-r - h)}) = ${fmt((-r - h) * (-r - h) + b * (-r - h))}。`;
    }
    render(0);
  };

  // ═════════════ 一元二次方程：判别式与交点 ═════════════
  A.n_quadeq_delta = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const curve = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const roots = S('g', {}, svg);
    S('rect', { x: 26, y: 26, width: 110, height: 30, rx: 8, class: 'fsurf sline' }, svg);
    const dT = T(svg, 81, 47, '', 'tb tl');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 1, b = -2, cc = -3, busy = false;
    const sa = slider(c, 'qda', 'a', -2, 2, 1, a, (v) => {
      if (busy) { sa.set(a); return; }
      a = v === 0 ? (a > 0 ? -1 : 1) : v;
      sa.set(a); draw();
    });
    const sb = slider(c, 'qdb', 'b', -6, 6, 1, b, (v) => { if (busy) { sb.set(b); return; } b = v; draw(); });
    const sc = slider(c, 'qdc', 'c', -6, 6, 1, cc, (v) => { if (busy) { sc.set(cc); return; } cc = v; draw(); });
    btn(c, '让 c 从 −6 走到 6', () => {
      if (busy) return;
      busy = true;
      let v = -6;
      const stepF = () => {
        cc = v; sc.set(v); draw();
        if (v >= 6) { busy = false; return; }
        const from = v;
        v += 1;
        setTimeout(() => tween(300, (t) => { cc = lerp(from, v, t); draw(); }, stepF), RM ? 0 : 450);
      };
      stepF();
    });
    function draw() {
      let d = '';
      for (let x = -7; x <= 7.001; x += 0.05) {
        const y = clamp(a * x * x + b * x + cc, -50, 50);
        d += (d ? 'L' : 'M') + G.X(x).toFixed(1) + ',' + G.Y(y).toFixed(1);
      }
      curve.setAttribute('d', d);
      roots.innerHTML = '';
      const D = b * b - 4 * a * cc;
      dT.textContent = 'Δ = ' + fmt(D);
      dT.setAttribute('class', 'tb tl ' + (D > 1e-9 ? 't3' : D < -1e-9 ? 't2' : 't1'));
      const eq = polyHtml(a, b, cc) + ' = 0';
      const calc = `Δ = <i>b</i><sup>2</sup> − 4<i>ac</i> = ${pv(b)}<sup>2</sup> − 4 × ${pv(a)} × ${pv(cc)} = <b>${fmt(D)}</b>`;
      let txt;
      if (D > 1e-9) {
        const r1 = (-b - Math.sqrt(D)) / (2 * a), r2 = (-b + Math.sqrt(D)) / (2 * a);
        const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
        [lo, hi].forEach((r) => { if (Math.abs(r) <= 6) S('circle', { cx: G.X(r), cy: G.Y(0), r: 6, class: 'mark-x' }, roots); });
        txt = `Δ &gt; 0：抛物线与 <i>x</i> 轴有<b>两个</b>交点，方程有两个不相等的实数根。<br><i>x</i> = ${fr(`${fmt(-b)} ± √${fmt(D)}`, fmt(2 * a))}，<i>x</i><sub>1</sub> ${fa(lo).startsWith('≈') ? fa(lo) : '= ' + fmt(lo)}，<i>x</i><sub>2</sub> ${fa(hi).startsWith('≈') ? fa(hi) : '= ' + fmt(hi)}`;
      } else if (D >= -1e-9) {
        const r = -b / (2 * a);
        if (Math.abs(r) <= 6) S('circle', { cx: G.X(r), cy: G.Y(0), r: 6, class: 'mark-x' }, roots);
        txt = `Δ = 0：抛物线的顶点正好落在 <i>x</i> 轴上，只有<b>一个</b>交点，方程有两个相等的实数根 <i>x</i><sub>1</sub> = <i>x</i><sub>2</sub> = ${fmt(r)}`;
      } else {
        txt = 'Δ &lt; 0：抛物线和 <i>x</i> 轴<b>没有</b>交点，方程<b>没有实数根</b>（根号里是负数，开不了平方）';
      }
      read.innerHTML = `方程 <b>${eq}</b><br>${calc}<br>${txt}。`;
    }
    draw();
  };

  // ═════════════ 反比例函数：k 与面积 ═════════════
  A.n_inverse_area = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const rect = S('rect', { class: 'f2s s2', style: 'fill-opacity: .75' }, svg);
    const triP = S('polygon', { class: 'f3s s3' }, svg);
    const br1 = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const br2 = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const pDot = S('circle', { r: 6, class: 'mark-y' }, svg);
    const hdl = S('circle', { r: 14, class: 'handle' }, svg);
    const pLab = T(svg, 0, 0, '', 'tb ts');
    const areaT = T(svg, 0, 0, '', 'tb t2');
    const fT = T(svg, size - 28, 44, '', 'tl tb t1', 'end');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let k = 4, px = 2, tri = false, busy = false;
    const sk = slider(c, 'iak', 'k', -8, 8, 1, k, (v) => {
      if (busy) { sk.set(k); return; }
      k = v === 0 ? (k > 0 ? -1 : 1) : v;
      sk.set(k); fix(); draw();
    });
    const tb = btn(c, '看三角形 OPA', () => {
      tri = !tri;
      tb.textContent = tri ? '看矩形' : '看三角形 OPA';
      draw();
    }, 'alt');
    btn(c, 'P 沿曲线走一走', () => {
      if (busy) return;
      busy = true;
      const sg = px < 0 ? -1 : 1, lo = lowX(), start = Math.abs(px);
      tween(1600, (t) => { px = sg * lerp(start, 6, t); draw(); }, () => {
        tween(2200, (t) => { px = sg * lerp(6, lo, t); draw(); }, () => {
          tween(1000, (t) => { px = sg * lerp(lo, 2.5, t); draw(); }, () => { busy = false; draw(); });
        });
      });
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动圆点 P，可以把它拖到另一支曲线上。');
    const lowX = () => Math.max(0.3, Math.abs(k) / 6);
    function fix() {
      const sg = px < 0 ? -1 : 1;
      px = sg * clamp(Math.abs(px), lowX(), 6);
    }
    drag(svg, hdl, (p) => {
      if (busy) return;
      let v = (p.x - G.X(0)) / G.u;
      const sg = v < 0 ? -1 : 1;
      v = sg * clamp(Math.abs(v), lowX(), 6);
      px = Math.round(v * 10) / 10;
      fix(); draw();
    });
    function branch(sg) {
      let d = '';
      for (let x = 0.05; x <= 6.6; x += 0.05) {
        const xx = sg * x, y = clamp(k / xx, -20, 20);
        d += (d ? 'L' : 'M') + G.X(xx).toFixed(1) + ',' + G.Y(y).toFixed(1);
      }
      return d;
    }
    function draw() {
      br1.setAttribute('d', branch(1));
      br2.setAttribute('d', branch(-1));
      const py = k / px;
      const X0 = G.X(0), Y0 = G.Y(0), XP = G.X(px), YP = G.Y(py);
      rect.setAttribute('x', Math.min(X0, XP)); rect.setAttribute('width', Math.abs(XP - X0));
      rect.setAttribute('y', Math.min(Y0, YP)); rect.setAttribute('height', Math.abs(YP - Y0));
      rect.setAttribute('opacity', tri ? 0.25 : 1);
      triP.setAttribute('points', `${X0},${Y0} ${XP},${YP} ${XP},${Y0}`);
      triP.setAttribute('opacity', tri ? 1 : 0);
      pDot.setAttribute('cx', XP); pDot.setAttribute('cy', YP);
      hdl.setAttribute('cx', XP); hdl.setAttribute('cy', YP);
      pLab.setAttribute('x', clamp(XP + (px > 0 ? 10 : -10), 40, size - 40));
      pLab.setAttribute('y', clamp(YP + (py > 0 ? -12 : 22), 30, size - 20));
      pLab.setAttribute('text-anchor', px > 0 ? 'start' : 'end');
      pLab.textContent = `P(${fmt(px)}, ${fmt(py)})`;
      const cxA = tri ? (X0 + 2 * XP) / 3 : (X0 + XP) / 2, cyA = tri ? (2 * Y0 + YP) / 3 : (Y0 + YP) / 2;
      areaT.setAttribute('x', cxA); areaT.setAttribute('y', cyA + 5);
      const ak = Math.abs(k);
      areaT.textContent = Math.abs(XP - X0) > 30 && Math.abs(YP - Y0) > 24 ? (tri ? fmt(ak / 2) : String(ak)) : '';
      fT.textContent = `y = ${k}/x`.replace('-', '−');
      const quad = k > 0 ? '一、三' : '二、四';
      const mono = k > 0 ? '减小' : '增大';
      read.innerHTML = `<i>k</i> = ${fmt(k)} ${k > 0 ? '&gt;' : '&lt;'} 0：图象在第${quad}象限，在每个象限内 <i>y</i> 随 <i>x</i> 的增大而${mono}。<br>` +
        `P(${fmt(px)}, ${fmt(py)})：` +
        (tri
          ? `△<i>OPA</i> 的面积 = ${fr(1, 2)}|<i>x</i>| · |<i>y</i>| = ${fr('|<i>k</i>|', 2)} = <b>${fmt(ak / 2)}</b>，P 怎么动都不变。`
          : `矩形面积 = |<i>x</i>| · |<i>y</i>| = |<i>xy</i>| = |<i>k</i>| = <b>${ak}</b>。拖动 P，长变长时宽就变短，面积始终是 ${ak}。`);
    }
    draw();
  };

  // ═════════════ 反比例函数：与一次函数比大小 ═════════════
  A.n_inverse_line = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const band = S('g', { 'clip-path': G.clip }, svg);
    const axHi = S('g', {}, svg);
    const br1 = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const br2 = S('path', { class: 'fline', 'clip-path': G.clip }, svg);
    const ln = S('line', { class: 's3 thick', 'clip-path': G.clip }, svg);
    const pts = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let k = 2, m = 1, n = 1;
    const sk = slider(c, 'ilk', 'k', -6, 6, 1, k, (v) => { k = v === 0 ? (k > 0 ? -1 : 1) : v; sk.set(k); draw(); });
    slider(c, 'ilm', 'm', -3, 3, 1, m, (v) => { m = v; draw(); });
    slider(c, 'iln', 'n', -4, 4, 1, n, (v) => { n = v; draw(); });
    H('p', { class: 'anim-tip' }, el, '蓝线：双曲线 y = k/x；绿线：直线 y = mx + n；橙色：直线在双曲线上方的 x 范围。');
    function branch(sg) {
      let d = '';
      for (let x = 0.05; x <= 6.6; x += 0.05) {
        const xx = sg * x, y = clamp(k / xx, -20, 20);
        d += (d ? 'L' : 'M') + G.X(xx).toFixed(1) + ',' + G.Y(y).toFixed(1);
      }
      return d;
    }
    const lineHtml = () => {
      if (m === 0) return fmt(n);
      const mx = (m === 1 ? '' : m === -1 ? '−' : fmt(m)) + '<i>x</i>';
      return mx + (n === 0 ? '' : n > 0 ? ' + ' + n : ' − ' + -n);
    };
    const kHtml = () => (k < 0 ? '−' : '') + fr(Math.abs(k), '<i>x</i>');
    function draw() {
      br1.setAttribute('d', branch(1));
      br2.setAttribute('d', branch(-1));
      ln.setAttribute('x1', G.X(-7)); ln.setAttribute('y1', G.Y(-7 * m + n));
      ln.setAttribute('x2', G.X(7)); ln.setAttribute('y2', G.Y(7 * m + n));
      // 交点：mx² + nx − k = 0
      let rs = [];
      if (m === 0) { if (n !== 0) rs = [k / n]; }
      else {
        const D = n * n + 4 * m * k;
        if (D > 1e-9) rs = [(-n - Math.sqrt(D)) / (2 * m), (-n + Math.sqrt(D)) / (2 * m)];
        else if (Math.abs(D) <= 1e-9) rs = [-n / (2 * m)];
      }
      rs.sort((p, q) => p - q);
      const f = (x) => m * x + n - k / x;
      const cr = rs.concat([0]).sort((p, q) => p - q);
      const ivs = [];
      for (let i = 0; i <= cr.length; i++) {
        const lo = i === 0 ? -Infinity : cr[i - 1], hi = i === cr.length ? Infinity : cr[i];
        const mid = lo === -Infinity ? hi - 1 : hi === Infinity ? lo + 1 : (lo + hi) / 2;
        if (f(mid) > 0) ivs.push([lo, hi]);
      }
      // 着色
      band.innerHTML = ''; axHi.innerHTML = ''; pts.innerHTML = '';
      ivs.forEach(([lo, hi]) => {
        const a0 = Math.max(lo, -6), a1 = Math.min(hi, 6);
        if (a1 <= a0) return;
        S('rect', { x: G.X(a0), y: G.Y(6), width: G.X(a1) - G.X(a0), height: G.Y(-6) - G.Y(6), class: 'f2s', style: 'opacity: .45' }, band);
        S('line', { x1: G.X(a0), x2: G.X(a1), y1: G.Y(0), y2: G.Y(0), class: 's2 thick' }, axHi);
        [lo, hi].forEach((e) => { if (isFinite(e) && Math.abs(e) <= 6) S('circle', { cx: G.X(e), cy: G.Y(0), r: 4.5, class: 'fsurf s2' }, axHi); });
      });
      rs.forEach((r) => {
        const yy = k / r;
        if (Math.abs(r) > 6 || Math.abs(yy) > 6) return;
        S('line', { x1: G.X(r), x2: G.X(r), y1: G.Y(yy), y2: G.Y(0), class: 'guide' }, pts);
        S('circle', { cx: G.X(r), cy: G.Y(yy), r: 6, class: 'mark-x' }, pts);
        T(pts, clamp(G.X(r) + (r > 0 ? 8 : -8), 30, size - 30), clamp(G.Y(yy) + (yy > 0 ? -10 : 20), 30, size - 20), `(${fmt(r)}, ${fmt(yy)})`, 'tb ts', r > 0 ? 'start' : 'end');
      });
      const ivTxt = ivs.length
        ? ivs.map(([lo, hi]) => (lo === -Infinity ? `<i>x</i> &lt; ${fmt(hi)}` : hi === Infinity ? `<i>x</i> &gt; ${fmt(lo)}` : `${fmt(lo)} &lt; <i>x</i> &lt; ${fmt(hi)}`)).join(' 或 ')
        : '没有';
      const rough = rs.some(approx);
      read.innerHTML = `直线 <i>y</i> = ${lineHtml()}，双曲线 <i>y</i> = ${kHtml()}。` +
        (rs.length ? `交点：${rs.map((r) => `(${fa(r)}, ${fa(k / r)})`).join('、')}。` : '它们<b>没有交点</b>。') +
        `<br>分界点：${rs.length ? '交点的横坐标和 ' : ''}<i>x</i> = 0。<br>${lineHtml()} &gt; ${kHtml()} 的解集：<b>${ivTxt}</b>` +
        (rough ? '（端点是近似值）' : '') + '。';
    }
    draw();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
