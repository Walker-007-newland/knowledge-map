// 小学 图形与几何（第二部分）的动画：长方体、图形的运动、圆、圆柱圆锥、位置与方向
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  const pts = (arr) => arr.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const num = (n) => String(parseFloat(n.toFixed(4)));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ez = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const fr = (a, b) => (window.fr ? window.fr(a, b) : a + '/' + b);

  // ───────── 长方体：线框 + 摆小正方体数体积 ─────────
  A.g_solid0_cubes = function (el) {
    const W = 440, Hh = 300, u = 40, k = 0.354, ox = 72, oy = 268;
    const svg = stage(el, W, Hh);
    const P = (x, y, z) => [ox + (x + y * k) * u, oy - (z + y * k) * u];
    const gBack = S('g', {}, svg), gCube = S('g', {}, svg), gEdge = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 4, b = 3, h = 2, n = 0, busy = false, stopFn = null;
    const N = () => a * b * h;
    function order() {
      const list = [];
      for (let z = 0; z < h; z++) for (let y = b - 1; y >= 0; y--) for (let x = 0; x < a; x++) list.push([x, y, z]);
      return list;
    }
    function cube(x, y, z) {
      const f = [P(x, y, z), P(x + 1, y, z), P(x + 1, y, z + 1), P(x, y, z + 1)];
      const tp = [P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)];
      const rt = [P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)];
      S('polygon', { points: pts(f), class: 'f1s sstrong thin' }, gCube);
      S('polygon', { points: pts(tp), class: 'fsurf sstrong thin' }, gCube);
      S('polygon', { points: pts(rt), class: 'sstrong thin', style: 'fill: var(--a1); fill-opacity: .4' }, gCube);
    }
    function draw() {
      gBack.innerHTML = ''; gCube.innerHTML = ''; gEdge.innerHTML = '';
      order().slice(0, n)
        .sort((p, q) => (q[1] - p[1]) || (p[2] - q[2]) || (p[0] - q[0]))
        .forEach((p) => cube(p[0], p[1], p[2]));
      // 12 条棱：看不见的 3 条画成虚线
      const V = (p) => P(p[0] * a, p[1] * b, p[2] * h);
      const isHid = (p) => p[0] === 0 && p[1] === 1 && p[2] === 0;
      for (let i = 0; i < 8; i++) {
        const p = [i & 1, (i >> 1) & 1, (i >> 2) & 1];
        [0, 1, 2].forEach((d) => {
          if (p[d] === 1) return;
          const q = p.slice(); q[d] = 1;
          const hid = isHid(p) || isHid(q);
          const p1 = V(p), p2 = V(q);
          S('line', { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], class: hid ? 'smuted dash' : 'sstrong round' }, hid ? gBack : gEdge);
        });
      }
      const pl = P(a / 2, 0, 0); T(gEdge, pl[0], pl[1] + 22, `长 ${a} cm`, 't1 tb');
      const ph = P(0, 0, h / 2); T(gEdge, ph[0] - 8, ph[1] + 5, `高 ${h} cm`, 't3 tb', 'end');
      const pw = P(a, b / 2, 0); T(gEdge, pw[0] + 8, pw[1] + 8, `宽 ${b} cm`, 't2 tb', 'start');
      const isCube = a === b && b === h;
      const L = (a + b + h) * 4, Sa = (a * b + a * h + b * h) * 2;
      if (n === 0) {
        read.innerHTML = `${isCube ? '长、宽、高都相等，这是一个<b>正方体</b>。' : ''}棱长总和 = (${a} + ${b} + ${h}) × 4 = <b>${L} cm</b>；表面积 = (${a}×${b} + ${a}×${h} + ${b}×${h}) × 2 = <b>${Sa} cm²</b>。<br>它的体积是多少？点“摆小正方体”，用 1 cm³ 的小正方体把它摆满。`;
      } else if (n < N()) {
        read.innerHTML = `已经摆了 <b>${n}</b> 个小正方体……（正在摆第 ${Math.floor((n - 1) / (a * b)) + 1} 层）`;
      } else {
        read.innerHTML = `摆满了！每排 <span class="k1">${a}</span> 个，每层 ${a} × ${b} = <span class="k2">${a * b}</span> 个，一共 <span class="k3">${h}</span> 层：${a} × ${b} × ${h} = <b>${N()}</b> 个。<br>每个小正方体是 1 cm³，所以体积 V = 长 × 宽 × 高 = <b>${N()} cm³</b>。`;
      }
    }
    const halt = () => { if (stopFn) stopFn(); stopFn = null; busy = false; };
    btn(c, '摆小正方体', () => {
      if (busy) return;
      busy = true; n = 0;
      const tot = N(), ms = Math.min(4500, 400 + tot * 45);
      stopFn = tween(ms, (e, raw) => {
        const m = Math.round(raw * tot);
        if (m !== n) { n = m; draw(); }
      }, () => { busy = false; stopFn = null; n = tot; draw(); });
    });
    btn(c, '清空', () => { halt(); n = 0; draw(); }, 'alt');
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'sa', '长', 1, 6, 1, a, (v) => { halt(); a = v; n = 0; draw(); });
    slider(row, 'sb', '宽', 1, 4, 1, b, (v) => { halt(); b = v; n = 0; draw(); });
    slider(row, 'sh', '高', 1, 4, 1, h, (v) => { halt(); h = v; n = 0; draw(); });
    H('p', { class: 'anim-tip' }, el, '提示：斜着画的“宽”看起来短一些，这是为了画出立体感，实际长度不变。虚线是从前面看不见的棱。');
    draw();
  };

  // ───────── 长方体：展开图 ─────────
  A.g_solid0_net = function (el) {
    const W = 440, Hh = 330;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let dims = [4, 2, 3], t = 0, busy = false, isCube = false;
    // 长 a 沿 x，宽 b 沿 y（向里），高 hh 沿 z（向上）；t=0 折好，t=1 摊平
    function faces(a, b, hh, tt) {
      const th = tt * PI / 2, sn = Math.sin(th), cs = Math.cos(th);
      const vy = -Math.cos(2 * th), vz = Math.sin(2 * th);
      const Hy = b + hh * sn, Hz = hh * cs;
      return [
        { n: '下', cls: 'f2s', p: [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0]] },
        { n: '前', cls: 'f1s', p: [[0, 0, 0], [a, 0, 0], [a, -hh * sn, hh * cs], [0, -hh * sn, hh * cs]] },
        { n: '后', cls: 'f1s', p: [[0, b, 0], [a, b, 0], [a, Hy, Hz], [0, Hy, Hz]] },
        { n: '左', cls: 'f3s', p: [[0, 0, 0], [0, b, 0], [-hh * sn, b, hh * cs], [-hh * sn, 0, hh * cs]] },
        { n: '右', cls: 'f3s', p: [[a, 0, 0], [a, b, 0], [a + hh * sn, b, hh * cs], [a + hh * sn, 0, hh * cs]] },
        { n: '上', cls: 'f2s', p: [[0, Hy, Hz], [a, Hy, Hz], [a, Hy + b * vy, Hz + b * vz], [0, Hy + b * vy, Hz + b * vz]] }
      ];
    }
    function render() {
      const [a, b, hh] = dims;
      const fs = faces(a, b, hh, t);
      const vb = t * t;
      const kx = lerp(0.4, 0, vb), ky = lerp(0.4, 1, vb), cz = 1 - vb;
      const pr = (p) => [p[0] + p[1] * kx, -(p[2] * cz + p[1] * ky)];
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      fs.forEach((f) => {
        f.q = f.p.map(pr);
        f.q.forEach(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
        const cen = [0, 1, 2].map((i) => f.p.reduce((s, p) => s + p[i], 0) / 4);
        f.d = cen[1] - 0.3 * cen[0] - 0.3 * cen[2];
      });
      const sc = Math.min((W - 40) / (maxX - minX), (Hh - 40) / (maxY - minY), 46);
      const offX = W / 2 - sc * (minX + maxX) / 2, offY = Hh / 2 - sc * (minY + maxY) / 2;
      g.innerHTML = '';
      fs.sort((p, q) => q.d - p.d).forEach((f) => {
        const s = f.q.map(([x, y]) => [offX + sc * x, offY + sc * y]);
        S('polygon', { points: pts(s), class: f.cls + ' sstrong round', style: 'fill-opacity: .92' }, g);
        const mx = s.reduce((v, p) => v + p[0], 0) / 4, my = s.reduce((v, p) => v + p[1], 0) / 4;
        T(g, mx, my + 5, f.n, 'tb');
      });
      const top = a * b, fr2 = a * hh, sd = b * hh, SA = 2 * (top + fr2 + sd);
      if (t <= 0.001) {
        read.innerHTML = `这是一个${isCube ? '正方体' : '长方体'}：长 ${a} cm、宽 ${b} cm、高 ${hh} cm，一共有 6 个面。拖动“展开”滑块，或点“展开”按钮，把它剪开铺平。`;
      } else if (t < 0.999) {
        read.innerHTML = '正在展开……注意看：颜色相同的两个面是<b>相对</b>的面。';
      } else if (isCube) {
        read.innerHTML = `正方体的展开图：6 个面是<b>完全一样</b>的正方形，每个都是 ${a} × ${a} = ${a * a} cm²。<br>表面积 = ${a * a} × 6 = <b>${a * a * 6} cm²</b>`;
      } else {
        read.innerHTML = `展开图由 6 个长方形组成，相对的面完全一样：<br><span class="k2">上、下</span>：${a} × ${b} = ${top}　<span class="k1">前、后</span>：${a} × ${hh} = ${fr2}　<span class="k3">左、右</span>：${b} × ${hh} = ${sd}<br>表面积 = (${top} + ${fr2} + ${sd}) × 2 = <b>${SA} cm²</b>`;
      }
    }
    const sl = slider(c, 'nt', '展开', 0, 100, 1, 0, (v) => { if (busy) return; t = v / 100; render(); upd(); });
    const goBtn = btn(c, '展开', () => {
      if (busy) return;
      busy = true;
      const from = t, to = t > 0.5 ? 0 : 1;
      tween(1800, (e) => { t = lerp(from, to, e); sl.set(Math.round(t * 100)); render(); }, () => {
        busy = false; t = to; sl.set(to * 100); render(); upd();
      });
    });
    function upd() { goBtn.textContent = t > 0.5 ? '折回去' : '展开'; }
    const kindBtn = btn(c, '换成正方体', () => {
      if (busy) return;
      isCube = !isCube;
      dims = isCube ? [3, 3, 3] : [4, 2, 3];
      kindBtn.textContent = isCube ? '换成长方体' : '换成正方体';
      render();
    }, 'alt');
    render();
  };

  // ───────── 轴对称：补全另一半，再对折检查 ─────────
  A.g_move0_flip = function (el) {
    const C = 12, R = 8, cs = 32, x0 = 28, y0 = 26;
    const W = 440, Hh = y0 + R * cs + 10;
    const svg = stage(el, W, Hh);
    const ax = x0 + 6 * cs;
    const X = (cc) => x0 + cc * cs, Y = (r) => y0 + r * cs;
    const SHAPES = [
      { name: '小房子', cells: [[5, 1], [4, 2], [5, 2], [3, 3], [4, 3], [5, 3], [4, 4], [5, 4], [4, 5], [5, 5], [3, 6], [4, 6], [5, 6]] },
      { name: '蝴蝶', cells: [[4, 0], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [2, 3], [3, 3], [4, 3], [5, 3], [3, 4], [4, 4], [5, 4], [2, 5], [3, 5], [4, 5], [5, 5], [3, 6]] },
      { name: '小旗', cells: [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [1, 3], [1, 4], [1, 5], [1, 6]] }
    ];
    const gGrid = S('g', {}, svg);
    const gLeft = S('g', { style: 'pointer-events: none' }, svg);
    const gRight = S('g', { style: 'pointer-events: none' }, svg);
    const gCopy = S('g', { style: 'pointer-events: none' }, svg);
    const gMark = S('g', { style: 'pointer-events: none' }, svg);
    S('line', { x1: ax, x2: ax, y1: y0 - 4, y2: Y(R) + 6, class: 's2 thick dash' }, svg);
    T(svg, ax + 6, 18, '对称轴', 't2 tb ts', 'start');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let si = 0, t = 0, busy = false;
    const right = new Set();
    for (let r = 0; r < R; r++) {
      for (let cc = 0; cc < C; cc++) {
        const rc = S('rect', { x: X(cc), y: Y(r), width: cs, height: cs, class: 'fsurf sline' + (cc >= 6 ? ' clickable' : '') }, gGrid);
        if (cc >= 6) rc.addEventListener('click', () => toggle(cc, r));
      }
    }
    function toggle(cc, r) {
      if (busy) return;
      const key = cc + ',' + r;
      if (right.has(key)) right.delete(key); else right.add(key);
      drawCells();
      say();
    }
    function drawCells() {
      gLeft.innerHTML = ''; gRight.innerHTML = ''; gCopy.innerHTML = '';
      SHAPES[si].cells.forEach(([cc, r]) => {
        S('rect', { x: X(cc) + 1, y: Y(r) + 1, width: cs - 2, height: cs - 2, rx: 3, class: 'f1s s1 thin' }, gLeft);
        S('rect', { x: X(cc) + 1, y: Y(r) + 1, width: cs - 2, height: cs - 2, rx: 3, class: 's2 thin', style: 'fill: var(--a2); fill-opacity: .55' }, gCopy);
      });
      right.forEach((key) => {
        const [cc, r] = key.split(',').map(Number);
        S('rect', { x: X(cc) + 1, y: Y(r) + 1, width: cs - 2, height: cs - 2, rx: 3, class: 'f3s s3 thin' }, gRight);
      });
    }
    function setFold() {
      const s = Math.cos(PI * t);
      gCopy.setAttribute('transform', `translate(${ax},0) scale(${s.toFixed(4)},1) translate(${-ax},0)`);
      gCopy.setAttribute('opacity', t > 0 ? 1 : 0);
    }
    function say() {
      gMark.innerHTML = '';
      const nm = SHAPES[si].name;
      if (t < 1) {
        read.innerHTML = `这是“${nm}”的左半边，橙色虚线是<b>对称轴</b>。在右边点格子（会变绿），把另一半补出来，再点“对折检查”。<br>提示：对应的格子离对称轴一样远。现在右边涂了 ${right.size} 格。`;
        return;
      }
      const target = new Set(SHAPES[si].cells.map(([cc, r]) => (11 - cc) + ',' + r));
      let miss = 0, extra = 0;
      target.forEach((key) => { if (!right.has(key)) miss++; });
      right.forEach((key) => {
        if (target.has(key)) return;
        extra++;
        const [cc, r] = key.split(',').map(Number);
        const x1 = X(cc) + 8, y1 = Y(r) + 8, x2 = X(cc) + cs - 8, y2 = Y(r) + cs - 8;
        S('path', { d: `M${x1},${y1} L${x2},${y2} M${x2},${y1} L${x1},${y2}`, class: 'fnone s2 thick round' }, gMark);
      });
      if (!miss && !extra) {
        read.innerHTML = `对折后，左右两边<b>完全重合</b>，你补对了！“${nm}”是一个<b>轴对称图形</b>：每一格和它的对应格到对称轴的距离都相等。`;
      } else {
        read.innerHTML = `橙色是左半边翻折过来的位置。还有 <b>${miss}</b> 格没补上，<b>${extra}</b> 格补错了（打 ×）。点“展开”再改一改。<br>提示：数一数每一格离对称轴有几格，右边也要离几格。`;
      }
    }
    const foldBtn = btn(c, '对折检查', () => {
      if (busy) return;
      busy = true;
      const from = t, to = t > 0.5 ? 0 : 1;
      gMark.innerHTML = '';
      tween(1200, (e) => { t = lerp(from, to, e); setFold(); }, () => {
        t = to; busy = false; setFold();
        foldBtn.textContent = to ? '展开' : '对折检查';
        say();
      });
    });
    btn(c, '换一个图形', () => {
      if (busy) return;
      si = (si + 1) % SHAPES.length; right.clear(); t = 0;
      foldBtn.textContent = '对折检查';
      drawCells(); setFold(); say();
    }, 'alt');
    btn(c, '清空右边', () => { if (busy) return; right.clear(); drawCells(); say(); }, 'alt');
    drawCells(); setFold(); say();
  };

  // ───────── 平移与旋转：方格纸上的图形 ─────────
  A.g_move0_move = function (el) {
    const GC = 14, GR = 10, cs = 30, gx0 = 10, gy0 = 10;
    const W = 440, Hh = gy0 * 2 + GR * cs;
    const svg = stage(el, W, Hh);
    const X = (x) => gx0 + x * cs, Y = (y) => gy0 + (GR - y) * cs;
    for (let i = 0; i <= GC; i++) S('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(GR), class: 'gridl' }, svg);
    for (let j = 0; j <= GR; j++) S('line', { x1: X(0), x2: X(GC), y1: Y(j), y2: Y(j), class: 'gridl' }, svg);
    const SH = [[0, 0], [1, 0], [1, 3], [3, 3], [3, 4], [0, 4]], PA = [3, 4];
    const ghost = S('polygon', { class: 'fnone smuted dash' }, svg);
    const ghostOA = S('line', { class: 'smuted dash' }, svg);
    const poly = S('polygon', { class: 'f1s s1 round', style: 'fill-opacity: .85' }, svg);
    const oa = S('line', { class: 's2' }, svg);
    const dO = S('circle', { r: 5, class: 'fstrong' }, svg);
    const dA = S('circle', { r: 5, class: 'f2' }, svg);
    const tO = T(svg, 0, 0, 'O', 'tb');
    const tA = T(svg, 0, 0, 'A', 'tb t2');
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el), c2 = ctrl(el);
    const START = [5, 3];
    let pos = START.slice(), ang = 0, busy = false, dx = 0, dy = 0, rot = 0, last = '';
    // ang：顺时针旋转的度数（y 轴向上的方格坐标）
    const world = (p, ps, an) => {
      const r = an * PI / 180, co = Math.cos(r), sn = Math.sin(r);
      return [ps[0] + p[0] * co + p[1] * sn, ps[1] - p[0] * sn + p[1] * co];
    };
    const scr = (p) => [X(p[0]), Y(p[1])];
    function render(ps, an) {
      poly.setAttribute('points', pts(SH.map((p) => scr(world(p, ps, an)))));
      const o = scr(ps), a = scr(world(PA, ps, an));
      oa.setAttribute('x1', o[0]); oa.setAttribute('y1', o[1]); oa.setAttribute('x2', a[0]); oa.setAttribute('y2', a[1]);
      dO.setAttribute('cx', o[0]); dO.setAttribute('cy', o[1]);
      dA.setAttribute('cx', a[0]); dA.setAttribute('cy', a[1]);
      tO.setAttribute('x', o[0] - 12); tO.setAttribute('y', o[1] + 18);
      tA.setAttribute('x', a[0] + 12); tA.setAttribute('y', a[1] - 6);
    }
    function setGhost(ps, an) {
      if (!ps) { ghost.setAttribute('points', ''); ghostOA.setAttribute('opacity', 0); return; }
      ghost.setAttribute('points', pts(SH.map((p) => scr(world(p, ps, an)))));
      const o = scr(ps), a = scr(world(PA, ps, an));
      ghostOA.setAttribute('x1', o[0]); ghostOA.setAttribute('y1', o[1]); ghostOA.setAttribute('x2', a[0]); ghostOA.setAttribute('y2', a[1]);
      ghostOA.setAttribute('opacity', 1);
    }
    function inside(ps, an) {
      return SH.every((p) => {
        const w = world(p, ps, an);
        return w[0] >= -0.01 && w[0] <= GC + 0.01 && w[1] >= -0.01 && w[1] <= GR + 0.01;
      });
    }
    function say() {
      const parts = [];
      if (dx) parts.push(`向${dx > 0 ? '右' : '左'} ${Math.abs(dx)} 格`);
      if (dy) parts.push(`向${dy > 0 ? '上' : '下'} ${Math.abs(dy)} 格`);
      const r = ((rot % 360) + 360) % 360;
      read.innerHTML = (last ? last + '<br>' : '') +
        `从开始算：点 O ${parts.length ? '一共' + parts.join('、') : '还在原来的位置'}；图形${r === 0 ? '的方向和开始时一样' : `相当于绕点 O 顺时针转了 ${r}°`}。`;
    }
    function move(ddx, ddy, name) {
      if (busy) return;
      const to = [pos[0] + ddx, pos[1] + ddy];
      if (!inside(to, ang)) { read.innerHTML = '再移就出格子了，换个方向试试。'; return; }
      busy = true;
      setGhost(pos, ang);
      const from = pos.slice();
      tween(500, (e) => render([lerp(from[0], to[0], e), lerp(from[1], to[1], e)], ang), () => {
        pos = to; dx += ddx; dy += ddy; busy = false;
        last = `<b>向${name}平移了 1 格</b>：点 O、点 A 和图形上的每一个点，都向${name}移动了 1 格。形状、大小、方向都没变。`;
        render(pos, ang); say();
      });
    }
    function turn(d) {
      if (busy) return;
      const to = ang + d;
      if (!inside(pos, to)) { read.innerHTML = '再转就出格子了，先把图形平移到中间一点。'; return; }
      busy = true;
      setGhost(pos, ang);
      const from = ang;
      tween(900, (e) => render(pos, lerp(from, to, e)), () => {
        ang = to; rot += d; busy = false;
        last = `<b>绕点 O ${d > 0 ? '顺' : '逆'}时针旋转了 90°</b>：点 O 不动，线段 OA 转了 90°，长度没变。图形的形状、大小不变，方向变了。`;
        render(pos, ang); say();
      });
    }
    btn(c1, '← 左移', () => move(-1, 0, '左'));
    btn(c1, '右移 →', () => move(1, 0, '右'));
    btn(c1, '↑ 上移', () => move(0, 1, '上'));
    btn(c1, '↓ 下移', () => move(0, -1, '下'));
    btn(c2, '顺时针转 90°', () => turn(90));
    btn(c2, '逆时针转 90°', () => turn(-90));
    btn(c2, '复位', () => {
      if (busy) return;
      pos = START.slice(); ang = 0; dx = 0; dy = 0; rot = 0;
      last = '回到了开始的位置。';
      setGhost(null); render(pos, ang); say();
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '虚线是图形上一次的位置。平移每次移 1 格；旋转都是绕点 O 转。');
    last = '用按钮让图形<b>平移</b>，或者绕点 O <b>旋转</b> 90°。盯住橙色的点 A，看它怎么走。';
    setGhost(null); render(pos, ang); say();
  };

  // ───────── 圆的周长：滚一圈 ─────────
  A.g_circle0_roll = function (el) {
    const W = 460, Hh = 230, yL = 165, x0 = 60, k = 25;
    const svg = stage(el, W, Hh);
    S('line', { x1: 10, x2: W - 10, y1: yL, y2: yL, class: 'sstrong' }, svg);
    const gT = S('g', {}, svg);
    const lay = S('line', { class: 's2 thick round' }, svg);
    const circ = S('circle', { class: 'fsurf smuted' }, svg);
    const rest = S('path', { class: 'fnone s2 thick' }, svg);
    const dia = S('line', { class: 's1' }, svg);
    const ctr = S('circle', { r: 3, class: 'fstrong' }, svg);
    const mk = S('circle', { r: 5, class: 'f2' }, svg);
    const dT = T(svg, 0, 0, 'd', 'tb t1 ital');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let d = 3, phi = 0, busy = false, stopFn = null, endMark = null, endLab = null;
    function arc(cx, cy, r, a1, a2) {
      if (a2 - a1 < 1e-4) return '';
      const m = (a1 + a2) / 2;
      const p = (a) => (cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2);
      return `M${p(a1)} A${r},${r} 0 0 1 ${p(m)} A${r},${r} 0 0 1 ${p(a2)}`;
    }
    function ticks() {
      gT.innerHTML = '';
      const dp = d * k;
      for (let i = 0; i <= 3; i++) {
        const x = x0 + i * dp;
        S('line', { x1: x, x2: x, y1: yL, y2: yL + 8, class: 'sstrong' }, gT);
        T(gT, x, yL + 24, i === 0 ? '起点' : `${i}d`, 'ts tm');
      }
      const xe = x0 + PI * dp;
      endMark = S('line', { x1: xe, x2: xe, y1: yL - 4, y2: yL + 34, class: 's2' }, gT);
      endLab = T(gT, xe, yL + 50, '约 3.14d', 'ts t2 tb');
    }
    function render() {
      const r = d * k / 2, cx = x0 + r * phi, cy = yL - r;
      circ.setAttribute('cx', cx); circ.setAttribute('cy', cy); circ.setAttribute('r', r);
      ctr.setAttribute('cx', cx); ctr.setAttribute('cy', cy);
      lay.setAttribute('x1', x0); lay.setAttribute('y1', yL); lay.setAttribute('x2', cx); lay.setAttribute('y2', yL);
      lay.setAttribute('opacity', phi > 0 ? 1 : 0);
      rest.setAttribute('d', arc(cx, cy, r, PI / 2 + phi, PI / 2 + 2 * PI));
      const am = PI / 2 + phi, mx = cx + r * Math.cos(am), my = cy + r * Math.sin(am);
      dia.setAttribute('x1', mx); dia.setAttribute('y1', my); dia.setAttribute('x2', 2 * cx - mx); dia.setAttribute('y2', 2 * cy - my);
      mk.setAttribute('cx', mx); mk.setAttribute('cy', my);
      const still = phi === 0 || phi >= 2 * PI - 1e-6;
      dT.setAttribute('x', cx + 12); dT.setAttribute('y', cy - r / 2 + 5); dT.setAttribute('opacity', still ? 1 : 0);
      const done = phi >= 2 * PI - 1e-6;
      endMark.setAttribute('opacity', done ? 1 : 0); endLab.setAttribute('opacity', done ? 1 : 0);
      const Cv = num(3.14 * d);
      if (phi === 0) {
        read.innerHTML = `圆的直径 <i>d</i> = ${d} cm。圆的一周（橙色）有多长？让圆在直线上滚一圈，把它的“边”铺在地上量一量。`;
      } else if (!done) {
        read.innerHTML = `滚动中……已经铺开了 <b>${fmt((r * phi) / (d * k))}</b> 个直径那么长。`;
      } else {
        read.innerHTML = `滚了一整圈！铺开的橙色线段就是圆的<b>周长</b>：比 3 个直径多一点，约是 <b>3.14</b> 个直径。<br>周长 ÷ 直径 = 圆周率 π ≈ 3.14，所以 <b><i>C</i> = π<i>d</i></b> ≈ 3.14 × ${d} = <b>${Cv} cm</b>。`;
      }
    }
    const halt = () => { if (stopFn) stopFn(); stopFn = null; busy = false; };
    btn(c, '滚一圈', () => {
      if (busy) return;
      busy = true; phi = 0;
      stopFn = tween(3200, (e, raw) => { phi = raw * 2 * PI; render(); }, () => {
        busy = false; stopFn = null; phi = 2 * PI; render();
      });
    });
    btn(c, '重来', () => { halt(); phi = 0; render(); }, 'alt');
    slider(c, 'rd', '直径', 2, 4, 0.5, d, (v) => { halt(); d = v; phi = 0; ticks(); render(); });
    H('p', { class: 'anim-tip' }, el, '换一个直径再滚一次：不管圆大圆小，周长总是直径的 3.14 倍左右。');
    ticks(); render();
  };

  // ───────── 圆的面积：切开拼成近似长方形 ─────────
  A.g_circle0_cut = function (el) {
    const W = 460, Hh = 220, r = 80, cx = 230, cy = 110, yTop = 55;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), gLab = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 8, t = 0, busy = false, secs = [];
    function build() {
      g.innerHTML = ''; gLab.innerHTML = '';
      const dl = 2 * PI / n, hh = dl / 2;
      const d = `M0,0 L${(r * Math.cos(-hh)).toFixed(2)},${(r * Math.sin(-hh)).toFixed(2)} A${r},${r} 0 0 1 ${(r * Math.cos(hh)).toFixed(2)},${(r * Math.sin(hh)).toFixed(2)} Z`;
      const w = 2 * r * Math.sin(hh), TW = (n / 2) * w + w / 2;
      const left = (W - TW) / 2, xs = left + w / 2, yBot = yTop + r * Math.cos(hh);
      secs = [];
      for (let j = 0; j < n; j++) {
        const half = j < n / 2 ? 0 : 1, i = half ? j - n / 2 : j;
        const m0 = -PI / 2 + (j + 0.5) * dl;
        const tgt = half ? -PI / 2 : PI / 2;
        let diff = tgt - m0;
        while (diff > PI) diff -= 2 * PI;
        while (diff <= -PI) diff += 2 * PI;
        const fx = half ? xs + w / 2 + i * w : xs + i * w, fy = half ? yBot : yTop;
        const p = S('path', { d, class: (half ? 'f2s' : 'f1s') + ' sstrong thin round' }, g);
        secs.push({ p, m0, diff, fx, fy, j });
      }
      // 拼好后的标注
      const by = yTop + r + 12;
      S('line', { x1: left + w / 4, x2: left + TW - w / 4, y1: by, y2: by, class: 's1' }, gLab);
      T(gLab, W / 2, by + 20, 'πr（圆周长的一半）', 't1 tb');
      S('line', { x1: left - 10, x2: left - 10, y1: yTop, y2: yTop + r, class: 's3' }, gLab);
      T(gLab, left - 16, yTop + r / 2 + 5, 'r', 't3 tb ital', 'end');
    }
    function render() {
      secs.forEach((s) => {
        const q = clamp(t * 1.5 - 0.5 * s.j / n, 0, 1), e = ez(q);
        const x = lerp(cx, s.fx, e), y = lerp(cy, s.fy, e), a = s.m0 + s.diff * e;
        s.p.setAttribute('transform', `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${(a * 180 / PI).toFixed(2)})`);
      });
      gLab.setAttribute('opacity', t >= 0.999 ? 1 : 0);
      if (t <= 0.001) {
        read.innerHTML = `把圆平均分成 <b>${n}</b> 份，像切披萨一样。蓝色是右半圆，橙色是左半圆。点“拼一拼”，把它们一上一下交错拼起来。`;
      } else if (t < 0.999) {
        read.innerHTML = '正在拼……';
      } else {
        read.innerHTML = `${n} 份拼成了一个<b>近似的长方形</b>${n < 32 ? '。分得越多，边越直，越像长方形，试试更多份' : '，已经非常像长方形了'}。<br>长方形的长 ≈ 圆周长的一半 = <span class="k1">π<i>r</i></span>，宽 = <span class="k3">半径 <i>r</i></span>，所以：<b><i>S</i> = π<i>r</i> × <i>r</i> = π<i>r</i><sup>2</sup></b>`;
      }
      goBtn.textContent = t > 0.5 ? '还原成圆' : '拼一拼';
    }
    const goBtn = btn(c, '拼一拼', () => {
      if (busy) return;
      busy = true;
      const from = t, to = t > 0.5 ? 0 : 1;
      tween(2000, (e, raw) => { t = lerp(from, to, raw); render(); }, () => { busy = false; t = to; render(); });
    });
    [8, 16, 32].forEach((m) => btn(c, `分成 ${m} 份`, () => {
      if (busy) return;
      n = m; t = 0; build(); render();
    }, 'alt'));
    build(); render();
  };

  // ───────── 圆柱：侧面展开成长方形 ─────────
  A.g_cyl_unroll = function (el) {
    const W = 460, Hh = 250, cx = 230, baseY = 212, k = 22, e = 0.3, NS = 48;
    const svg = stage(el, W, Hh);
    const gBot = S('g', {}, svg), gS = S('g', {}, svg), gTop = S('g', {}, svg), gLab = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let r = 2, h = 4, t = 0, busy = false;
    function render() {
      const R = r * k, Hp = h * k, kap = (1 - t) / R;
      gBot.innerHTML = ''; gS.innerHTML = ''; gTop.innerHTML = ''; gLab.innerHTML = '';
      const fade = clamp(1 - t * 2, 0, 1);
      S('ellipse', { cx, cy: baseY - R * e, rx: R, ry: R * e, class: 'f2s sstrong thin', opacity: fade }, gBot);
      // 侧面上一点：s 是沿底边的弧长（0 在正前方），z 是高度
      const P = (s, z) => {
        let x, y;
        if (kap < 1e-6) { x = s; y = 0; } else { x = Math.sin(kap * s) / kap; y = (1 - Math.cos(kap * s)) / kap; }
        return [cx + x, baseY - z - y * e, y];
      };
      const step = (2 * PI * R) / NS, strips = [];
      for (let i = 0; i < NS; i++) {
        const s0 = -PI * R + i * step, s1 = s0 + step, sm = s0 + step / 2;
        const a0 = P(s0, 0), a1 = P(s1, 0), b1 = P(s1, Hp), b0 = P(s0, Hp);
        const outer = kap < 1e-6 || Math.cos(kap * sm) > 0;
        strips.push({ q: [a0, a1, b1, b0], d: (a0[2] + a1[2]) / 2, outer, s0, s1 });
      }
      strips.sort((p, q) => q.d - p.d).forEach((s) => {
        S('polygon', { points: pts(s.q), class: (s.outer ? 'f1s' : 'fsurf2') + ' sline' }, gS);
        if (s.outer || t > 0.25) {
          const p0 = P(s.s0, 0), p1 = P(s.s1, 0);
          S('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], class: 's2 thick round' }, gS);
        }
      });
      const sOp = clamp(t * 4, 0, 1);
      [-PI * R, PI * R].forEach((s) => {
        const p0 = P(s, 0), p1 = P(s, Hp);
        S('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], class: 's3 thick', opacity: sOp }, gS);
      });
      S('ellipse', { cx, cy: baseY - Hp - R * e, rx: R, ry: R * e, class: 'f2s sstrong thin', opacity: fade }, gTop);
      const C = num(6.28 * r), Sd = num(6.28 * r * h);
      if (t <= 0.001) {
        S('line', { x1: cx, y1: baseY - Hp - R * e, x2: cx + R, y2: baseY - Hp - R * e, class: 's1' }, gLab);
        T(gLab, cx + R / 2, baseY - Hp - R * e - 6, 'r', 't1 tb ital');
        T(gLab, cx + R + 10, baseY - Hp / 2, `h = ${h} cm`, 't3 tb', 'start');
        read.innerHTML = `圆柱：底面半径 <i>r</i> = ${r} cm，高 <i>h</i> = ${h} cm。它的侧面就像一张卷起来的纸。点“展开侧面”，沿一条高剪开铺平。`;
      } else if (t < 0.999) {
        read.innerHTML = '侧面正在慢慢铺平……看橙色的边：它原来是底面的一圈。';
      } else {
        T(gLab, cx, baseY + 24, `长 = 底面周长 ≈ ${C} cm`, 't2 tb');
        T(gLab, cx - PI * R + 8, baseY - Hp / 2 + 5, `宽 = 高 = ${h} cm`, 't3 tb', 'start');
        read.innerHTML = `侧面展开是一个<b>长方形</b>：<br><span class="k2">长 = 底面周长 = 2 × 3.14 × ${r} = ${C} cm</span>，<span class="k3">宽 = 圆柱的高 = ${h} cm</span><br>侧面积 = 底面周长 × 高 = ${C} × ${h} = <b>${Sd} cm²</b>`;
      }
    }
    const sl = slider(c, 'ut', '展开', 0, 100, 1, 0, (v) => { if (busy) return; t = v / 100; render(); upd(); });
    const goBtn = btn(c, '展开侧面', () => {
      if (busy) return;
      busy = true;
      const from = t, to = t > 0.5 ? 0 : 1;
      tween(2000, (ee) => { t = lerp(from, to, ee); sl.set(Math.round(t * 100)); render(); }, () => {
        busy = false; t = to; sl.set(to * 100); render(); upd();
      });
    });
    function upd() { goBtn.textContent = t > 0.5 ? '卷回去' : '展开侧面'; }
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'ur', 'r', 1, 3, 0.5, r, (v) => { if (busy) return; r = v; render(); });
    slider(row, 'uh', 'h', 2, 5, 1, h, (v) => { if (busy) return; h = v; render(); });
    render();
  };

  // ───────── 圆锥体积：倒三次沙子 ─────────
  A.g_cyl_sand = function (el) {
    const W = 440, Hh = 290, e = 0.3, r = 48, hh = 120;
    const CX = 320, CB = 250, CT = CB - hh;
    const HOME = [110, CT, 0], POUR = [315, 88, 120];
    const svg = stage(el, W, Hh);
    // 等高的虚线
    S('line', { x1: 40, x2: 400, y1: CT, y2: CT, class: 'sline dash' }, svg);
    S('line', { x1: 40, x2: 400, y1: CB, y2: CB, class: 'sline dash' }, svg);
    S('path', { d: `M${CX - r},${CB} A${r},${r * e} 0 0 1 ${CX + r},${CB}`, class: 'fnone smuted dash' }, svg);
    const sandBody = S('path', { style: 'fill: var(--a2); fill-opacity: .55' }, svg);
    const sandTop = S('ellipse', { cx: CX, rx: r, ry: r * e, class: 'f2s s2 thin' }, svg);
    S('path', { d: `M${CX - r},${CT} L${CX - r},${CB} A${r},${r * e} 0 0 0 ${CX + r},${CB} L${CX + r},${CT}`, class: 'fnone sstrong' }, svg);
    S('ellipse', { cx: CX, cy: CT, rx: r, ry: r * e, class: 'fnone sstrong' }, svg);
    [1, 2].forEach((i) => {
      const y = CB - hh * i / 3;
      S('line', { x1: CX + r + 4, x2: CX + r + 14, y1: y, y2: y, class: 'sstrong thin' }, svg);
      T(svg, CX + r + 18, y + 5, `${i}/3`, 'ts tm', 'start');
    });
    T(svg, CX, Hh - 10, '圆柱', 'tb');
    T(svg, HOME[0], Hh - 10, '圆锥', 'tb');
    T(svg, 220, CT - 6, '一样高', 'ts tm');
    const stream = S('line', { class: 's2 thick round', opacity: 0 }, svg);
    const cone = S('g', {}, svg);
    const sandC = S('path', { style: 'fill: var(--a2); fill-opacity: .55' }, cone);
    const sandCT = S('ellipse', { class: 'f2s s2 thin' }, cone);
    S('path', { d: `M${-r},0 L0,${hh} L${r},0`, class: 'fnone sstrong round' }, cone);
    S('ellipse', { cx: 0, cy: 0, rx: r, ry: r * e, class: 'fnone sstrong' }, cone);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pours = 0, busy = false;
    function setLevel(L) {
      const yS = CB - hh * L;
      if (L <= 0.001) { sandBody.setAttribute('d', ''); sandTop.setAttribute('opacity', 0); return yS; }
      sandBody.setAttribute('d', `M${CX - r},${yS} L${CX - r},${CB} A${r},${r * e} 0 0 0 ${CX + r},${CB} L${CX + r},${yS} Z`);
      sandTop.setAttribute('cy', yS); sandTop.setAttribute('opacity', 1);
      return yS;
    }
    function setCone(rem) {
      const lam = Math.cbrt(Math.max(0, rem));
      if (lam < 0.01) { sandC.setAttribute('d', ''); sandCT.setAttribute('opacity', 0); return; }
      const yl = hh - lam * hh, wl = lam * r;
      sandC.setAttribute('d', `M${-wl},${yl} L0,${hh} L${wl},${yl} Z`);
      sandCT.setAttribute('cx', 0); sandCT.setAttribute('cy', yl);
      sandCT.setAttribute('rx', wl); sandCT.setAttribute('ry', wl * e);
      sandCT.setAttribute('opacity', 1);
    }
    const place = (x, y, a) => cone.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a.toFixed(1)})`);
    function say() {
      if (pours === 0) read.innerHTML = '圆锥和圆柱<b>等底等高</b>（底面一样大，高也一样）。圆锥里装满了沙子，倒进圆柱，要倒几次才能装满？先猜一猜，再点“倒一次”。';
      else if (pours === 1) read.innerHTML = `倒了 <b>1</b> 次，沙子只到圆柱高度的 ${fr(1, 3)}。圆锥又装满了，继续倒。`;
      else if (pours === 2) read.innerHTML = `倒了 <b>2</b> 次，到了圆柱高度的 ${fr(2, 3)}。还差一次！`;
      else read.innerHTML = `倒了 <b>3</b> 次，正好装满！<br>所以：圆锥的体积是和它<b>等底等高</b>的圆柱体积的 ${fr(1, 3)}，<b><i>V</i> = ${fr(1, 3)}<i>Sh</i></b>。`;
    }
    const pourBtn = btn(c, '倒一次', () => {
      if (busy || pours >= 3) return;
      busy = true;
      const L0 = pours / 3;
      tween(3000, (ee, tt) => {
        if (tt < 0.3) {
          const q = ez(tt / 0.3);
          place(lerp(HOME[0], POUR[0], q), lerp(HOME[1], POUR[1], q), POUR[2] * q);
          stream.setAttribute('opacity', 0);
        } else if (tt < 0.75) {
          const q = (tt - 0.3) / 0.45;
          place(POUR[0], POUR[1], POUR[2]);
          setCone(1 - q);
          const yS = setLevel(L0 + q / 3);
          stream.setAttribute('x1', 300); stream.setAttribute('y1', 122);
          stream.setAttribute('x2', 300); stream.setAttribute('y2', Math.max(124, yS));
          stream.setAttribute('opacity', q < 0.97 ? 1 : 0);
        } else {
          const q = ez((tt - 0.75) / 0.25);
          setCone(0); setLevel(L0 + 1 / 3);
          stream.setAttribute('opacity', 0);
          place(lerp(POUR[0], HOME[0], q), lerp(POUR[1], HOME[1], q), POUR[2] * (1 - q));
        }
      }, () => {
        pours++; busy = false;
        stream.setAttribute('opacity', 0);
        place(HOME[0], HOME[1], 0); setLevel(pours / 3); setCone(pours < 3 ? 1 : 0);
        pourBtn.disabled = pours >= 3;
        say();
      });
    });
    btn(c, '重来', () => {
      if (busy) return;
      pours = 0; pourBtn.disabled = false;
      place(HOME[0], HOME[1], 0); setLevel(0); setCone(1); say();
    }, 'alt');
    place(HOME[0], HOME[1], 0); setLevel(0); setCone(1); say();
  };

  // ───────── 数对：点格子 ─────────
  A.g_pos_pair = function (el) {
    const NC = 8, NR = 6, cs = 44, gx = 46, gy = 290;
    const W = 440, Hh = 320;
    const svg = stage(el, W, Hh);
    const X = (cc) => gx + cc * cs, Y = (r) => gy - r * cs;
    for (let i = 0; i <= NC; i++) S('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(NR), class: i === 0 ? 'sstrong thin' : 'gridl' }, svg);
    for (let j = 0; j <= NR; j++) S('line', { x1: X(0), x2: X(NC), y1: Y(j), y2: Y(j), class: j === 0 ? 'sstrong thin' : 'gridl' }, svg);
    const colT = [], rowT = [];
    for (let i = 0; i <= NC; i++) colT.push(T(svg, X(i), Y(0) + 20, String(i), 'ts tm'));
    for (let j = 0; j <= NR; j++) rowT.push(T(svg, X(0) - 12, Y(j) + 5, String(j), 'ts tm', 'end'));
    T(svg, X(NC) + 18, Y(0) + 20, '列', 'tb t1');
    T(svg, X(0) - 12, Y(NR) - 10, '行', 'tb t3', 'end');
    const MARKS = [['学校', 2, 5], ['书店', 6, 5], ['公园', 5, 2], ['家', 1, 1]];
    MARKS.forEach(([nm, cc, r]) => {
      S('rect', { x: X(cc) - 7, y: Y(r) - 7, width: 14, height: 14, rx: 3, class: 'f3s s3 thin' }, svg);
      T(svg, X(cc) + 10, Y(r) + 18, nm, 'ts tb', 'start');
    });
    const gSel = S('g', { style: 'pointer-events: none' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let target = null, score = 0;
    function drawSel(cc, r) {
      gSel.innerHTML = '';
      colT.forEach((tx, i) => tx.setAttribute('class', i === cc ? 'tb t1' : 'ts tm'));
      rowT.forEach((tx, j) => tx.setAttribute('class', j === r ? 'tb t3' : 'ts tm'));
      if (cc == null) return;
      S('line', { x1: X(cc), x2: X(cc), y1: Y(r), y2: Y(0), class: 's1 dash' }, gSel);
      S('line', { x1: X(0), x2: X(cc), y1: Y(r), y2: Y(r), class: 's3 dash' }, gSel);
      const dot = S('circle', { cx: X(cc), cy: Y(r), r: 7, class: 'f2' }, gSel);
      tween(260, (e) => dot.setAttribute('r', 7 + 6 * (1 - e)));
      const right = cc >= 6;
      T(gSel, X(cc) + (right ? -10 : 10), Y(r) - 10, `(${cc}, ${r})`, 'tb t2', right ? 'end' : 'start');
    }
    function pick(cc, r) {
      drawSel(cc, r);
      if (target) {
        if (cc === target[0] && r === target[1]) {
          score++;
          read.innerHTML = `<b>对了！</b>(${cc}, ${r}) 就是第 ${cc} 列、第 ${r} 行。已经答对 ${score} 题，再点“考考我”换一题。`;
          target = null;
        } else if (cc === target[1] && r === target[0]) {
          read.innerHTML = `你点的是 (${cc}, ${r})，<b>列和行弄反了</b>。数对先写列（竖排，看下面的数），再写行（横排，看左边的数）。再试一次。`;
        } else {
          read.innerHTML = `你点的是 (${cc}, ${r})，不是 (${target[0]}, ${target[1]})。先在下面找第 ${target[0]} 列，再往上数到第 ${target[1]} 行。再试一次。`;
        }
        return;
      }
      const m = MARKS.find((q) => q[1] === cc && q[2] === r);
      read.innerHTML = `${m ? '这是<b>' + m[0] + '</b>：' : '这个点'}在第 <span class="k1">${cc}</span> 列、第 <span class="k3">${r}</span> 行，用数对写作 <b>(${cc}, ${r})</b>。` +
        (m && r === 5 ? '<br>学校和书店都在第 5 行，所以它们数对的第二个数相同。' : '');
    }
    svg.addEventListener('pointerdown', (ev) => {
      const p = svgPoint(svg, ev);
      const cc = Math.round((p.x - gx) / cs), r = Math.round((gy - p.y) / cs);
      if (cc < 0 || cc > NC || r < 0 || r > NR) return;
      if (Math.hypot(p.x - X(cc), p.y - Y(r)) > 20) return;
      pick(cc, r);
    });
    btn(c, '考考我', () => {
      let a, b;
      do { a = 1 + Math.floor(Math.random() * NC); b = 1 + Math.floor(Math.random() * NR); } while (a === b);
      target = [a, b];
      drawSel(null, null);
      read.innerHTML = `请在图上点出 <b>(${a}, ${b})</b> 这个位置。`;
    });
    btn(c, '自由点', () => {
      target = null;
      drawSel(null, null);
      read.innerHTML = '点格子线的交叉点，看看它的数对。';
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '竖排叫“列”，从左往右数；横排叫“行”，从下往上（从前往后）数。');
    read.innerHTML = '点格子线的交叉点（比如“学校”），看看它的数对。也可以点“考考我”做练习。';
  };

  // ───────── 方向和距离：按路线走 ─────────
  A.g_pos_walk = function (el) {
    const W = 420, Hh = 400, ox = 210, oy = 200, u = 34, RR = 5 * u;
    const svg = stage(el, W, Hh);
    for (let i = 1; i <= 5; i++) {
      S('circle', { cx: ox, cy: oy, r: i * u, class: 'fnone sline' }, svg);
      T(svg, ox + i * u, oy + 14, String(i * 100), 'ts tm');
    }
    S('line', { x1: ox, x2: ox, y1: oy - RR - 10, y2: oy + RR + 10, class: 'smuted dash' }, svg);
    S('line', { x1: ox - RR - 10, x2: ox + RR + 10, y1: oy, y2: oy, class: 'smuted dash' }, svg);
    T(svg, ox + 10, oy - RR - 2, '北', 'tb', 'start');
    T(svg, ox + 10, oy + RR + 14, '南', 'tb', 'start');
    T(svg, ox + RR + 6, oy - 6, '东', 'tb', 'start');
    T(svg, ox - RR - 6, oy - 6, '西', 'tb', 'end');
    S('path', { d: 'M30,72 L30,36 M22,46 L30,34 L38,46', class: 'fnone sstrong round' }, svg);
    T(svg, 30, 28, '北', 'tb');
    T(svg, W - 8, Hh - 8, '单位：米', 'ts tm', 'end');
    const preview = S('line', { class: 'smuted dash' }, svg);
    const refB = S('line', { class: 's3 dash', opacity: 0 }, svg);
    const path = S('line', { class: 's2 thick round', opacity: 0 }, svg);
    const arcO = S('path', { class: 'fnone s1' }, svg);
    const arcOT = T(svg, 0, 0, '', 'ts t1 tb');
    const arcB = S('path', { class: 'fnone s3', opacity: 0 }, svg);
    const arcBT = T(svg, 0, 0, '', 'ts t3 tb');
    S('circle', { cx: ox, cy: oy, r: 6, class: 'fstrong' }, svg);
    T(svg, ox - 8, oy + 18, '学校', 'tb', 'end');
    const bDot = S('circle', { r: 6, class: 'f2', opacity: 0 }, svg);
    const bT = T(svg, 0, 0, '少年宫', 'tb t2', 'start');
    const walker = S('circle', { r: 8, class: 'f3 sstrong thin' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const sel = H('select', {}, row);
    ['北偏东', '北偏西', '南偏东', '南偏西'].forEach((v) => H('option', { value: v }, sel, v));
    const c = ctrl(el);
    let ns = '北', ew = '东', th = 30, dist = 300, phase = 0, busy = false, stopFn = null;
    const vec = () => {
      const sx = ew === '东' ? 1 : -1, sy = ns === '北' ? -1 : 1, a = th * PI / 180;
      return [sx * Math.sin(a), sy * Math.cos(a)];
    };
    const other = (s) => ({ 北: '南', 南: '北', 东: '西', 西: '东' }[s]);
    const dirName = (n1, e1) => (th === 0 ? '正' + n1 : th === 90 ? '正' + e1 : `${n1}偏${e1} ${th}°`);
    function arcD(px, py, ref, v, R) {
      const a = [px + ref[0] * R, py + ref[1] * R], b = [px + v[0] * R, py + v[1] * R];
      const cr = ref[0] * v[1] - ref[1] * v[0];
      return `M${a[0].toFixed(1)},${a[1].toFixed(1)} A${R},${R} 0 0 ${cr > 0 ? 1 : 0} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;
    }
    function angLabel(txt, el2, px, py, ref, v, R) {
      let mx = ref[0] + v[0], my = ref[1] + v[1];
      const L = Math.hypot(mx, my) || 1;
      mx /= L; my /= L;
      el2.setAttribute('x', px + mx * (R + 14)); el2.setAttribute('y', py + my * (R + 14) + 4);
      el2.textContent = txt;
    }
    function setup() {
      const v = vec(), L = dist / 100 * u;
      const bx = ox + v[0] * L, by = oy + v[1] * L;
      preview.setAttribute('x1', ox); preview.setAttribute('y1', oy); preview.setAttribute('x2', bx); preview.setAttribute('y2', by);
      const ref = [0, ns === '北' ? -1 : 1];
      if (th > 0 && th < 90) { arcO.setAttribute('d', arcD(ox, oy, ref, v, 36)); angLabel(th + '°', arcOT, ox, oy, ref, v, 36); }
      else { arcO.setAttribute('d', ''); arcOT.textContent = ''; }
      bDot.setAttribute('cx', bx); bDot.setAttribute('cy', by);
      const rightSide = bx > 320;
      bT.setAttribute('x', bx + (rightSide ? -10 : 10)); bT.setAttribute('y', by - 10);
      bT.setAttribute('text-anchor', rightSide ? 'end' : 'start');
      return [bx, by];
    }
    function reset() {
      if (stopFn) stopFn();
      stopFn = null; busy = false; phase = 0;
      setup();
      walker.setAttribute('cx', ox); walker.setAttribute('cy', oy);
      path.setAttribute('opacity', 0); bDot.setAttribute('opacity', 0); bT.setAttribute('opacity', 0);
      refB.setAttribute('opacity', 0); arcB.setAttribute('opacity', 0); arcBT.textContent = '';
      const turnTxt = th === 0 || th === 90 ? `一直朝${dirName(ns, ew)}走` : `先面向正${ns}，再向${ew}转 ${th}°，然后直走`;
      read.innerHTML = `计划：从学校出发，向 <b>${dirName(ns, ew)}</b> 方向走 <b>${dist} 米</b>。<br>${turnTxt}，走 ${dist / 100} 格（1 格表示 100 米）。点“出发”。`;
    }
    function go() {
      if (busy || phase !== 0) return;
      busy = true;
      const [bx, by] = setup();
      path.setAttribute('opacity', 1);
      stopFn = tween(1600, (e) => {
        const x = lerp(ox, bx, e), y = lerp(oy, by, e);
        walker.setAttribute('cx', x); walker.setAttribute('cy', y);
        path.setAttribute('x1', ox); path.setAttribute('y1', oy); path.setAttribute('x2', x); path.setAttribute('y2', y);
      }, () => {
        busy = false; stopFn = null; phase = 1;
        bDot.setAttribute('opacity', 1); bT.setAttribute('opacity', 1);
        read.innerHTML = `到了！少年宫在学校的 <b>${dirName(ns, ew)}</b> 方向 <b>${dist} 米</b>处。<br>说清一个位置要两样东西：<b>方向</b>（以谁为中心、偏多少度）和<b>距离</b>。`;
      });
    }
    function back() {
      if (busy || phase !== 1) return;
      busy = true;
      const [bx, by] = setup();
      const v = vec(), bv = [-v[0], -v[1]], ref = [0, ns === '北' ? 1 : -1];
      refB.setAttribute('x1', bx); refB.setAttribute('x2', bx); refB.setAttribute('y1', by - 46); refB.setAttribute('y2', by + 46);
      refB.setAttribute('opacity', 1);
      if (th > 0 && th < 90) { arcB.setAttribute('d', arcD(bx, by, ref, bv, 30)); arcB.setAttribute('opacity', 1); angLabel(th + '°', arcBT, bx, by, ref, bv, 30); }
      stopFn = tween(1600, (e) => {
        walker.setAttribute('cx', lerp(bx, ox, e)); walker.setAttribute('cy', lerp(by, oy, e));
      }, () => {
        busy = false; stopFn = null; phase = 2;
        read.innerHTML = `原路返回：站在少年宫看，学校在少年宫的 <b>${dirName(other(ns), other(ew))}</b> 方向 <b>${dist} 米</b>处。<br>观测点换了，方向正好<b>相反</b>（北↔南，东↔西），角度和距离不变。`;
      });
    }
    sel.addEventListener('change', () => { ns = sel.value[0]; ew = sel.value[2]; reset(); });
    slider(c, 'wa', '角度', 0, 90, 5, th, (v) => { th = v; reset(); });
    slider(c, 'wd', '米', 100, 500, 100, dist, (v) => { dist = v; reset(); });
    const c2 = ctrl(el);
    btn(c2, '出发', go);
    btn(c2, '原路返回', back);
    btn(c2, '重来', reset, 'alt');
    reset();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
