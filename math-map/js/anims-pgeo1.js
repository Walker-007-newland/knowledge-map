// 小学 图形与几何（第一部分）的互动动画：周长、面积、角的度量、平行与垂直、多边形的面积
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const pts = (arr) => arr.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  let uidG = 0;
  const uid = () => 'pg1-' + (++uidG) + '-' + Math.floor(Math.random() * 1e6);

  // 背景方格
  function bgGrid(parent, x0, y0, cols, rows, u) {
    const g = S('g', {}, parent);
    for (let i = 0; i <= cols; i++) S('line', { x1: x0 + i * u, x2: x0 + i * u, y1: y0, y2: y0 + rows * u, class: 'sline' }, g);
    for (let j = 0; j <= rows; j++) S('line', { x1: x0, x2: x0 + cols * u, y1: y0 + j * u, y2: y0 + j * u, class: 'sline' }, g);
    return g;
  }

  // 一只小蚂蚁（头朝 +x 方向）
  function makeAnt(parent) {
    const g = S('g', {}, parent);
    const legs = S('g', {}, g);
    [-4, 0, 4].forEach((x) => {
      S('line', { x1: x, y1: 0, x2: x - 3, y2: -9, class: 'sstrong thin round' }, legs);
      S('line', { x1: x, y1: 0, x2: x - 3, y2: 9, class: 'sstrong thin round' }, legs);
    });
    S('ellipse', { cx: -9, cy: 0, rx: 7, ry: 5, class: 'fstrong' }, g);
    S('ellipse', { cx: 0, cy: 0, rx: 4, ry: 3.5, class: 'fstrong' }, g);
    S('circle', { cx: 7, cy: 0, r: 4.2, class: 'fstrong' }, g);
    S('line', { x1: 9, y1: -2, x2: 15, y2: -7, class: 'sstrong thin round' }, g);
    S('line', { x1: 9, y1: 2, x2: 15, y2: 7, class: 'sstrong thin round' }, g);
    return { g, legs };
  }

  // ───────────── 周长：蚂蚁爬一圈 ─────────────
  A.g_perim_ant = function (el) {
    const W = 440, Hh = 262, u = 34, cols = 11, rows = 6, x0 = 33, y0 = 18;
    const svg = stage(el, W, Hh);
    bgGrid(svg, x0, y0, cols, rows, u);
    T(svg, W / 2, Hh - 12, '每个小方格的边长是 1 厘米', 'note');
    const SHAPES = [
      { name: '长方形', pts: [[0, 0], [6, 0], [6, 4], [0, 4]] },
      { name: '正方形', pts: [[0, 0], [4, 0], [4, 4], [0, 4]] },
      { name: '三角形', pts: [[0, 4], [4, 1], [4, 4]] },
      { name: '缺一角', pts: [[0, 0], [6, 0], [6, 4], [2, 4], [2, 2], [0, 2]] }
    ];
    const shapeEl = S('polygon', { class: 'f1s sstrong round' }, svg);
    const walked = S('polyline', { class: 'fnone s2 thick round' }, svg);
    const labG = S('g', {}, svg);
    const startDot = S('circle', { r: 5, class: 'f3' }, svg);
    const ant = makeAnt(svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let cur = 0, busy = false, P = [], L = [], labs = [];
    const shapeBtns = SHAPES.map((s, i) => btn(c, s.name, () => { if (!busy) { cur = i; setup(); } }, 'alt'));
    const c2 = ctrl(el);
    btn(c2, '让蚂蚁爬一圈', walk);
    btn(c2, '重来', () => { if (!busy) setup(); }, 'alt');

    function setup() {
      const sh = SHAPES[cur];
      const w = Math.max(...sh.pts.map((p) => p[0])), h = Math.max(...sh.pts.map((p) => p[1]));
      const gx = Math.floor((cols - w) / 2), gy = Math.floor((rows - h) / 2);
      P = sh.pts.map((p) => [x0 + (p[0] + gx) * u, y0 + (p[1] + gy) * u]);
      L = sh.pts.map((p, i) => {
        const q = sh.pts[(i + 1) % sh.pts.length];
        return Math.round(Math.hypot(q[0] - p[0], q[1] - p[1]));
      });
      shapeEl.setAttribute('points', pts(P));
      walked.setAttribute('points', '');
      labG.innerHTML = '';
      labs = P.map((p, i) => {
        const q = P[(i + 1) % P.length];
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const nx = (q[1] - p[1]) / len, ny = -(q[0] - p[0]) / len; // 指向图形外面
        const anc = nx > 0.5 ? 'start' : nx < -0.5 ? 'end' : 'middle';
        const off = anc === 'middle' ? 15 : 7;
        const t = T(labG, (p[0] + q[0]) / 2 + nx * off, (p[1] + q[1]) / 2 + ny * off + 5, L[i] + ' 厘米', 'tb t2 ts', anc);
        t.setAttribute('opacity', 0);
        return t;
      });
      startDot.setAttribute('cx', P[0][0]); startDot.setAttribute('cy', P[0][1]);
      placeAnt(0);
      shapeBtns.forEach((b, i) => { b.className = 'abtn' + (i === cur ? '' : ' alt'); });
      read.innerHTML = `这是一个<b>${sh.name}</b>。绿点是起点。点“让蚂蚁爬一圈”，看看它一共爬了多远。`;
    }
    function placeAnt(d) {
      // d：已经爬过的长度（厘米）
      let i = 0, rest = d;
      while (i < L.length - 1 && rest > L[i]) { rest -= L[i]; i++; }
      const p = P[i], q = P[(i + 1) % P.length];
      const k = L[i] ? clamp(rest / L[i], 0, 1) : 0;
      const x = lerp(p[0], q[0], k), y = lerp(p[1], q[1], k);
      const ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / PI;
      ant.g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      ant.legs.setAttribute('transform', `rotate(${(Math.sin(d * 9) * 14).toFixed(1)})`);
      const trail = P.slice(0, i + 1).concat([[x, y]]);
      walked.setAttribute('points', pts(trail));
      return i;
    }
    function walk() {
      if (busy) return;
      busy = true;
      const total = L.reduce((s, v) => s + v, 0);
      labs.forEach((t) => t.setAttribute('opacity', 0));
      let shown = 0;
      tween(total * 230, (e, raw) => {
        const d = raw * total;
        const i = placeAnt(d);
        let done = 0, sum = 0;
        for (let j = 0; j < L.length; j++) { if (sum + L[j] <= d + 1e-9) { done = j + 1; sum += L[j]; } else break; }
        if (done !== shown) {
          shown = done;
          labs.forEach((t, j) => t.setAttribute('opacity', j < done ? 1 : 0));
          read.innerHTML = `已经爬了：${L.slice(0, done).join(' + ')} = <span class="k2">${sum}</span> 厘米……`;
        } else if (done === 0 && i === 0) {
          read.innerHTML = '小蚂蚁出发啦……';
        }
      }, () => {
        busy = false;
        placeAnt(total);
        walked.setAttribute('points', pts(P.concat([P[0]])));
        labs.forEach((t) => t.setAttribute('opacity', 1));
        let txt = `爬了一整圈，回到起点：${L.join(' + ')} = <span class="k2">${total}</span> 厘米。这就是这个${SHAPES[cur].name === '缺一角' ? '图形' : SHAPES[cur].name}的<b>周长</b>。`;
        if (cur === 0) txt += '<br>两条长、两条宽：(6 + 4) × 2 = 20。';
        if (cur === 1) txt += '<br>四条边一样长：4 × 4 = 16。';
        if (cur === 2) txt += '<br>斜着的那条边不能数格子，用尺子量是 5 厘米。';
        if (cur === 3) txt += '<br>和 6 × 4 的长方形周长一样！缺口里的两条边，平移出去正好补成原来的长方形。';
        read.innerHTML = txt;
      });
    }
    setup();
  };

  // ───────────── 周长：把四条边拉直 ─────────────
  A.g_perim_unroll = function (el) {
    const W = 460, Hh = 270, LY = 214;
    const svg = stage(el, W, Hh);
    const segG = S('g', {}, svg);
    const tickG = S('g', {}, svg);
    const totalT = T(svg, W / 2, LY + 44, '', 'tb tl');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 6, b = 4, st = 0, busy = false;
    let sb = null;
    slider(c, 'pl', '长', 2, 8, 1, a, (v) => { a = v; if (b > a) { b = a; sb.set(b); } render(); });
    sb = slider(c, 'pw', '宽', 1, 5, 1, b, (v) => { b = Math.min(v, a); if (b !== v) sb.set(b); render(); });
    const c2 = ctrl(el);
    const go = btn(c2, '把四条边拉直', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 2 ? 0 : 4;
      tween(to ? 2600 : 1400, (t) => { st = lerp(from, to, t); render(); }, () => {
        st = to; busy = false; render();
        go.textContent = to ? '变回长方形' : '把四条边拉直';
      });
    });

    function render() {
      const per = 2 * (a + b);
      const u = Math.min(30, 400 / per);
      const w = a * u, h = b * u;
      const rx = (W - w) / 2, ry = 30 + (150 - h) / 2;
      const edges = [
        { p: [rx, ry], q: [rx + w, ry], len: a, cls: 's1', tc: 't1', o: [0, -10], name: '长' },
        { p: [rx + w, ry], q: [rx + w, ry + h], len: b, cls: 's2', tc: 't2', o: [18, 5], name: '宽' },
        { p: [rx + w, ry + h], q: [rx, ry + h], len: a, cls: 's1', tc: 't1', o: [0, 20], name: '长' },
        { p: [rx, ry + h], q: [rx, ry], len: b, cls: 's2', tc: 't2', o: [-18, 5], name: '宽' }
      ];
      segG.innerHTML = ''; tickG.innerHTML = '';
      const lx0 = (W - per * u) / 2;
      let cum = 0;
      if (st < 0.02) S('rect', { x: rx, y: ry, width: w, height: h, class: 'f1s' }, segG);
      else S('rect', { x: rx, y: ry, width: w, height: h, class: 'fnone smuted dash' }, segG);
      edges.forEach((e, i) => {
        const k = smooth(clamp(st - i, 0, 1));
        const c0 = [(e.p[0] + e.q[0]) / 2, (e.p[1] + e.q[1]) / 2];
        const th0 = Math.atan2(e.q[1] - e.p[1], e.q[0] - e.p[0]);
        const th1 = Math.round(th0 / PI) * PI;
        const c1 = [lx0 + (cum + e.len / 2) * u, LY];
        cum += e.len;
        const cx = lerp(c0[0], c1[0], k), cy = lerp(c0[1], c1[1], k) - Math.sin(k * PI) * 30;
        const th = lerp(th0, th1, k), half = e.len * u / 2;
        const dx = Math.cos(th) * half, dy = Math.sin(th) * half;
        S('line', { x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy, class: e.cls + ' thick round' }, segG);
        const ox = lerp(e.o[0], 0, k), oy = lerp(e.o[1], 22, k);
        T(segG, cx + ox, cy + oy, String(e.len), 'tb ' + e.tc);
      });
      if (st > 3.98) {
        let x = lx0;
        S('line', { x1: x, x2: x, y1: LY - 7, y2: LY + 7, class: 'sstrong' }, tickG);
        edges.forEach((e) => { x += e.len * u; S('line', { x1: x, x2: x, y1: LY - 7, y2: LY + 7, class: 'sstrong' }, tickG); });
        totalT.textContent = `一共 ${per} 厘米`;
      } else totalT.textContent = '';
      const sq = a === b;
      if (st < 0.02) {
        read.innerHTML = sq
          ? `长和宽一样长，这是一个<b>正方形</b>，边长 ${a} 厘米。四条边都一样长。点按钮把它们拉直。`
          : `长方形：<span class="k1">长 ${a} 厘米</span>（蓝色，有两条），<span class="k2">宽 ${b} 厘米</span>（橙色，有两条）。点按钮把四条边拉直。`;
      } else if (st > 3.98) {
        read.innerHTML = sq
          ? `拉直后：${a} + ${a} + ${a} + ${a} = <b>${per}</b> 厘米。正方形周长 = 边长 × 4 = ${a} × 4 = <b>${per}</b> 厘米。`
          : `拉直后：<span class="k1">${a}</span> + <span class="k2">${b}</span> + <span class="k1">${a}</span> + <span class="k2">${b}</span> = <b>${per}</b> 厘米。<br>也就是 (<span class="k1">${a}</span> + <span class="k2">${b}</span>) × 2 = ${a + b} × 2 = <b>${per}</b> 厘米。`;
      } else {
        read.innerHTML = '四条边一条接一条，排到下面的直线上……';
      }
    }
    render();
  };

  // ───────────── 面积：一格一格铺 ─────────────
  A.g_area_tiles = function (el) {
    const W = 440, Hh = 270, u = 34;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 5, b = 3, n = 0, busy = false, stop = null;
    slider(c, 'al', '长', 1, 9, 1, a, (v) => { a = v; reset(); });
    slider(c, 'aw', '宽', 1, 6, 1, b, (v) => { b = v; reset(); });
    const c2 = ctrl(el);
    btn(c2, '一格一格铺', () => {
      if (busy) return;
      busy = true;
      n = 0; draw();
      const total = a * b;
      stop = tween(Math.min(4500, 380 + total * 120), (e, raw) => {
        const k = Math.floor(raw * total + 1e-9);
        if (k !== n) { n = k; draw(); }
      }, () => { busy = false; stop = null; n = total; draw(); });
    });
    btn(c2, '全部铺满', () => { if (stop) stop(); stop = null; busy = false; n = a * b; draw(); }, 'alt');
    btn(c2, '清空', () => { reset(); }, 'alt');

    function reset() { if (stop) stop(); stop = null; busy = false; n = 0; draw(); }
    function draw() {
      g.innerHTML = '';
      const w = a * u, h = b * u;
      const ox = Math.round((W - w) / 2) + 10, oy = 34 + Math.round((6 * u - h) / 2);
      T(g, ox - 24, oy + h / 2 + 5, `宽 ${b}`, 'ts tb t2', 'end');
      // 尺子刻度
      for (let i = 0; i <= a; i++) {
        S('line', { x1: ox + i * u, x2: ox + i * u, y1: oy - 8, y2: oy, class: 'sstrong thin' }, g);
        if (i > 0) T(g, ox + i * u - u / 2, oy - 12, String(i), 'ts tm');
      }
      for (let j = 0; j <= b; j++) {
        S('line', { x1: ox - 8, x2: ox, y1: oy + j * u, y2: oy + j * u, class: 'sstrong thin' }, g);
        if (j > 0) T(g, ox - 12, oy + j * u - u / 2 + 4, String(j), 'ts tm');
      }
      for (let k = 0; k < n; k++) {
        const r = Math.floor(k / a), col = k % a;
        S('rect', { x: ox + col * u + 1.5, y: oy + r * u + 1.5, width: u - 3, height: u - 3, rx: 3, class: (r % 2 ? 'f3s' : 'f1s') + ' sline' }, g);
        T(g, ox + col * u + u / 2, oy + r * u + u / 2 + 5, String(k + 1), 'ts');
      }
      S('rect', { x: ox, y: oy, width: w, height: h, class: 'fnone sstrong' }, g);
      // 每行个数
      const fullRows = Math.floor(n / a);
      for (let r = 0; r < fullRows; r++) T(g, ox + w + 10, oy + r * u + u / 2 + 5, `${a} 个`, 'ts t2', 'start');
      T(g, ox + w / 2, oy + h + 22, `长 ${a} 厘米`, 'ts tb t1');
      const total = a * b;
      if (n === 0) {
        read.innerHTML = `一个长 <span class="k1">${a}</span> 厘米、宽 <span class="k2">${b}</span> 厘米的长方形。每个小方格是 1 平方厘米。猜一猜要铺几格？`;
      } else if (n < total) {
        read.innerHTML = `已经铺了 <b>${n}</b> 格……`;
      } else {
        read.innerHTML = `铺满了！每行 <span class="k1">${a}</span> 个，铺了 <span class="k2">${b}</span> 行，一共 ${a} × ${b} = <b>${total}</b> 个。<br>面积是 <b>${total}</b> 平方厘米，正好等于 长 × 宽。` +
          (a === b ? '<br>长和宽一样，这是正方形：边长 × 边长。' : '');
      }
    }
    draw();
  };

  // ───────────── 面积：周长相同，面积不同 ─────────────
  A.g_area_compare = function (el) {
    const W = 440, Hh = 236, u = 30;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const tbl = H('div', { class: 'tbl-wrap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mode = 'p', a = 7, b = 3, busy = false;
    const mp = btn(c, '周长都是 20 厘米', () => setMode('p'));
    const ma = btn(c, '面积都是 12 平方厘米', () => setMode('a'), 'alt');
    const c2 = ctrl(el);
    const sl = slider(c2, 'cl', '长', 5, 9, 1, a, (v) => change(v, 10 - v));
    const aBtns = H('div', { class: 'anim-ctrl' }, el);
    [[12, 1], [6, 2], [4, 3]].forEach(([x, y]) => btn(aBtns, `长 ${x}，宽 ${y}`, () => change(x, y), 'alt'));
    aBtns.hidden = true;

    function setMode(m) {
      if (busy) return;
      mode = m;
      mp.className = 'abtn' + (m === 'p' ? '' : ' alt');
      ma.className = 'abtn' + (m === 'a' ? '' : ' alt');
      c2.hidden = m !== 'p';
      aBtns.hidden = m !== 'a';
      if (m === 'p') { sl.set(7); change(7, 3); } else change(6, 2);
    }
    function change(na, nb) {
      if (busy) return;
      busy = true;
      const fa = a, fb = b;
      tween(500, (t) => draw(lerp(fa, na, t), lerp(fb, nb, t)), () => { a = na; b = nb; busy = false; draw(a, b); });
    }
    function draw(wa, hb) {
      g.innerHTML = '';
      const w = wa * u, h = hb * u;
      const ox = (W - w) / 2, oy = 22 + (6 * u - h) / 2;
      const ca = Math.floor(wa + 1e-6), cb = Math.floor(hb + 1e-6);
      for (let i = 0; i < ca; i++) for (let j = 0; j < cb; j++) {
        S('rect', { x: ox + i * u + 1, y: oy + j * u + 1, width: u - 2, height: u - 2, class: 'f1s' }, g);
      }
      S('rect', { x: ox, y: oy, width: w, height: h, class: 'fnone s2 thick' }, g);
      const done = Math.abs(wa - Math.round(wa)) < 1e-6 && Math.abs(hb - Math.round(hb)) < 1e-6;
      if (done) {
        T(g, ox + w / 2, oy - 7, `长 ${Math.round(wa)}`, 'ts tb');
        T(g, ox + w + 6, oy + h / 2 + 4, `宽 ${Math.round(hb)}`, 'ts tb', 'start');
      }
      const A2 = Math.round(wa) * Math.round(hb), P2 = 2 * (Math.round(wa) + Math.round(hb));
      // 表格
      const list = mode === 'p' ? [[5, 5], [6, 4], [7, 3], [8, 2], [9, 1]] : [[12, 1], [6, 2], [4, 3]];
      const hot = (x, y) => done && x === Math.round(wa) && y === Math.round(hb) ? ' class="hot"' : '';
      tbl.innerHTML = `<table class="mini vals"><tr><th>长</th>${list.map(([x, y]) => `<td${hot(x, y)}>${x}</td>`).join('')}</tr>` +
        `<tr><th>宽</th>${list.map(([x, y]) => `<td${hot(x, y)}>${y}</td>`).join('')}</tr>` +
        `<tr><th>周长</th>${list.map(([x, y]) => `<td${hot(x, y)}>${2 * (x + y)}</td>`).join('')}</tr>` +
        `<tr><th>面积</th>${list.map(([x, y]) => `<td${hot(x, y)}>${x * y}</td>`).join('')}</tr></table>`;
      if (!done) { read.innerHTML = '变形中……'; return; }
      if (mode === 'p') {
        read.innerHTML = `<span class="k2">周长</span> = (${Math.round(wa)} + ${Math.round(hb)}) × 2 = <span class="k2">${P2}</span> 厘米（橙色的框），<span class="k1">面积</span> = ${Math.round(wa)} × ${Math.round(hb)} = <span class="k1">${A2}</span> 平方厘米（蓝色的格子）。` +
          (wa === 5 ? '<br>长和宽一样，是正方形，面积最大！' : '<br>周长一样，面积却不一样。越接近正方形，面积越大。');
      } else {
        read.innerHTML = `<span class="k1">面积</span> = ${Math.round(wa)} × ${Math.round(hb)} = <span class="k1">${A2}</span> 平方厘米，<span class="k2">周长</span> = (${Math.round(wa)} + ${Math.round(hb)}) × 2 = <span class="k2">${P2}</span> 厘米。<br>面积一样，周长却不一样。又细又长的，周长最长。`;
      }
    }
    draw(a, b);
  };

  // ───────────── 角：转动一条边 ─────────────
  A.g_angle_turn = function (el) {
    const W = 440, Hh = 300, O = [220, 150], R = 128;
    const svg = stage(el, W, Hh);
    // 圆形刻度盘
    const dial = S('g', {}, svg);
    S('circle', { cx: O[0], cy: O[1], r: R, class: 'fsurf2 sline' }, dial);
    for (let d = 0; d < 360; d += 10) {
      const r1 = d % 30 === 0 ? R - 12 : R - 6;
      const cs = Math.cos(d * PI / 180), sn = Math.sin(d * PI / 180);
      S('line', { x1: O[0] + R * cs, y1: O[1] - R * sn, x2: O[0] + r1 * cs, y2: O[1] - r1 * sn, class: 'smuted thin' }, dial);
      if (d % 30 === 0) T(dial, O[0] + (R - 24) * cs, O[1] - (R - 24) * sn + 4, String(d), 'ts tm');
    }
    const sector = S('path', { class: 'f2s s2' }, svg);
    const full = S('circle', { cx: O[0], cy: O[1], r: 34, class: 'f2s s2' }, svg);
    const rmark = S('path', { class: 'fnone sstrong' }, svg);
    const ray1 = S('line', { x1: O[0], y1: O[1], class: 's1 thick round' }, svg);
    const ray2 = S('line', { x1: O[0], y1: O[1], class: 's2 thick round' }, svg);
    S('circle', { cx: O[0], cy: O[1], r: 4.5, class: 'fstrong' }, svg);
    T(svg, O[0] - 4, O[1] + 20, '顶点', 'ts tm', 'end');
    const degT = T(svg, 0, 0, '', 'tb t2 tl');
    const nameT = T(svg, 14, 26, '', 'tb tl', 'start');
    const handle = S('circle', { r: 13, class: 'handle', tabindex: 0 }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let th = 50, len = 110, busy = false;
    slider(c, 'alen', '边长', 60, 140, 10, len, (v) => { len = v; render(); });
    const c2 = ctrl(el);
    [['锐角', 50], ['直角', 90], ['钝角', 130], ['平角', 180], ['周角', 360]].forEach(([nm, v]) => btn(c2, nm, () => turnTo(v), 'alt'));

    function turnTo(v) {
      if (busy) return;
      busy = true;
      const from = th;
      tween(300 + Math.abs(v - from) * 6, (t) => { th = lerp(from, v, t); render(); }, () => { th = v; busy = false; render(); });
    }
    function kind(d) {
      if (d <= 0) return ['', '两条边重合在一起，还没张开。拖动橙色圆点，把角张开。'];
      if (d < 90) return ['锐角', '比直角小，是<b>锐角</b>。'];
      if (d === 90) return ['直角', '正好 90°，是<b>直角</b>，像课本的角。'];
      if (d < 180) return ['钝角', '比直角大、比平角小，是<b>钝角</b>。'];
      if (d === 180) return ['平角', '两条边成了一条直线，但它还是一个角（有顶点、两条边），叫<b>平角</b>，等于 2 个直角。'];
      if (d < 360) return ['', '比平角大、比周角小。小学一般不研究这种角，继续转到 360° 看看。'];
      return ['周角', '转了一整圈，两条边又重合了，这是<b>周角</b>，等于 4 个直角。'];
    }
    function render() {
      const d = Math.round(th);
      const rad = th * PI / 180;
      const L1 = len;
      ray1.setAttribute('x2', O[0] + L1); ray1.setAttribute('y2', O[1]);
      const ex = O[0] + L1 * Math.cos(rad), ey = O[1] - L1 * Math.sin(rad);
      ray2.setAttribute('x2', ex.toFixed(1)); ray2.setAttribute('y2', ey.toFixed(1));
      const hx = O[0] + Math.min(L1, 150) * Math.cos(rad), hy = O[1] - Math.min(L1, 150) * Math.sin(rad);
      handle.setAttribute('cx', hx.toFixed(1)); handle.setAttribute('cy', hy.toFixed(1));
      const r = 34;
      full.setAttribute('opacity', d >= 360 ? 1 : 0);
      if (d > 0 && d < 360 && d !== 90) {
        const large = th > 180 ? 1 : 0;
        sector.setAttribute('d', `M${O[0]},${O[1]} L${O[0] + r},${O[1]} A${r},${r} 0 ${large} 0 ${(O[0] + r * Math.cos(rad)).toFixed(1)},${(O[1] - r * Math.sin(rad)).toFixed(1)} Z`);
      } else sector.setAttribute('d', '');
      rmark.setAttribute('d', d === 90 ? `M${O[0] + 18},${O[1]} v-18 h-18` : '');
      const mid = rad / 2;
      const lr = d >= 360 ? 0 : 56;
      degT.setAttribute('x', (O[0] + lr * Math.cos(mid)).toFixed(1));
      degT.setAttribute('y', (O[1] - lr * Math.sin(mid) + (d >= 360 ? -44 : 6)).toFixed(1));
      degT.textContent = d > 0 ? d + '°' : '';
      const [nm, txt] = kind(d);
      nameT.textContent = nm;
      read.innerHTML = `现在这个角是 <span class="k2">${d}°</span>。${txt}<br><span class="k1">边长 ${len}</span>：边变长变短，度数不变。角的大小只看两条边<b>张开得多大</b>。`;
    }
    handle.addEventListener('pointerdown', (e) => {
      if (busy) return;
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const p = svgPoint(svg, ev);
        let raw = Math.atan2(O[1] - p.y, p.x - O[0]) * 180 / PI;
        if (raw < 0) raw += 360;
        let cand = raw;
        while (cand - th > 180) cand -= 360;
        while (th - cand > 180) cand += 360;
        cand = clamp(cand, 0, 360);
        let v = Math.round(cand);
        [0, 90, 180, 360].forEach((s) => { if (Math.abs(v - s) <= 3) v = s; });
        th = v;
        render();
      };
      const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动橙色圆点转动这条边；也可以点下面的按钮。');
    render();
  };

  // ───────────── 角：用量角器量角 ─────────────
  A.g_angle_measure = function (el) {
    const W = 440, Hh = 340, V = [220, 175], R = 140, RL = 162;
    const svg = stage(el, W, Hh);
    const angG = S('g', {}, svg);
    const prot = S('g', { opacity: 0 }, svg);
    // 量角器（局部坐标：中心在原点，直边在 x 轴上，半圆朝上）
    S('path', { d: `M${-R - 6},0 A${R + 6},${R + 6} 0 0 1 ${R + 6},0 Z`, class: 'f1s s1', style: 'fill-opacity: .55' }, prot);
    S('line', { x1: -R - 6, y1: 0, x2: R + 6, y2: 0, class: 's1' }, prot);
    for (let d = 0; d <= 180; d += 5) {
      const cs = Math.cos(d * PI / 180), sn = Math.sin(d * PI / 180);
      const r1 = d % 10 === 0 ? R - 14 : R - 7;
      S('line', { x1: R * cs, y1: -R * sn, x2: r1 * cs, y2: -r1 * sn, class: 'sstrong thin' }, prot);
    }
    S('circle', { cx: 0, cy: 0, r: 3, class: 'f1' }, prot);
    const labs = [];
    for (let d = 0; d <= 180; d += 20) {
      const cs = Math.cos(d * PI / 180), sn = Math.sin(d * PI / 180);
      const oT = T(prot, (R - 27) * cs, -(R - 27) * sn + 4, String(180 - d), 'ts tb');
      const iT = T(prot, (R - 50) * cs, -(R - 50) * sn + 4, String(d), 'ts tb t1');
      labs.push([oT, (R - 27) * cs, -(R - 27) * sn], [iT, (R - 50) * cs, -(R - 50) * sn]);
    }
    const zeroMark = S('circle', { r: 13, class: 'fnone s2 thick', opacity: 0 }, prot);
    const readMark = S('circle', { r: 14, class: 'fnone s2 thick', opacity: 0 }, prot);
    const bigT = T(svg, 16, 36, '', 'txl t2', 'start');
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let alpha = 50, beta = 10, useInner = true, step = 0, busy = false;
    let pos = [V[0], V[1] + 60], rot = 0;
    const nextBtn = btn(c, '下一步', next);
    btn(c, '换一个角', () => { if (!busy) newAngle(); }, 'alt');

    function setProt(p, r, op) {
      prot.setAttribute('transform', `translate(${p[0].toFixed(1)},${p[1].toFixed(1)}) rotate(${(-r).toFixed(2)})`);
      if (op != null) prot.setAttribute('opacity', op);
      labs.forEach(([t, x, y]) => t.setAttribute('transform', `rotate(${r.toFixed(2)},${x.toFixed(1)},${y.toFixed(1)})`));
    }
    function target() { return useInner ? beta : beta + alpha - 180; }
    function drawAngle() {
      angG.innerHTML = '';
      [beta, beta + alpha].forEach((d) => {
        const rd = d * PI / 180;
        S('line', { x1: V[0], y1: V[1], x2: V[0] + RL * Math.cos(rd), y2: V[1] - RL * Math.sin(rd), class: 'sstrong thick round' }, angG);
      });
      const r = 26, a0 = beta * PI / 180, a1 = (beta + alpha) * PI / 180;
      S('path', { d: `M${V[0] + r * Math.cos(a0)},${V[1] - r * Math.sin(a0)} A${r},${r} 0 0 0 ${V[0] + r * Math.cos(a1)},${V[1] - r * Math.sin(a1)}`, class: 'fnone s2' }, angG);
      S('circle', { cx: V[0], cy: V[1], r: 4, class: 'fstrong' }, angG);
    }
    function newAngle() {
      alpha = 5 * (5 + Math.floor(Math.random() * 27)); // 25° ~ 155°
      beta = 5 * (Math.floor(Math.random() * 9) - 2);    // −10° ~ 30°
      useInner = Math.random() < 0.5;
      step = 0;
      pos = [V[0], V[1] + 60]; rot = 0;
      setProt(pos, rot, 0);
      zeroMark.setAttribute('opacity', 0); readMark.setAttribute('opacity', 0);
      bigT.textContent = '';
      drawAngle();
      nextBtn.textContent = '下一步';
      cap.textContent = '';
      read.innerHTML = '先用眼睛估一估：这个角比直角大还是小？然后点“下一步”，用量角器量一量。';
    }
    function next() {
      if (busy) return;
      if (step >= 3) { newAngle(); return; }
      busy = true;
      step++;
      if (step === 1) {
        cap.textContent = '第一步：点对点';
        read.innerHTML = '把量角器的<b>中心点</b>（蓝色小圆点）对准角的<b>顶点</b>。';
        const from = pos.slice();
        tween(900, (t) => setProt([lerp(from[0], V[0], t), lerp(from[1], V[1], t)], rot, t), () => { pos = V.slice(); busy = false; });
      } else if (step === 2) {
        cap.textContent = '第二步：线对边';
        const tg = target();
        const from = rot;
        tween(1200, (t) => { rot = lerp(from, tg, t); setProt(pos, rot); }, () => {
          rot = tg; setProt(pos, rot);
          const zx = useInner ? R - 50 : -(R - 27);
          zeroMark.setAttribute('cx', zx); zeroMark.setAttribute('cy', 0);
          zeroMark.setAttribute('opacity', 1);
          read.innerHTML = `转动量角器，让 0° 刻度线和角的一条边重合。这条边对着的是<b>${useInner ? '内圈（蓝色数字）' : '外圈（黑色数字）'}的 0</b>（橙圈圈出来的）。`;
          busy = false;
        });
        read.innerHTML = '转动量角器……';
      } else {
        cap.textContent = '第三步：读刻度';
        // 另一条边在量角器上的位置（局部角度 φ）
        const phi = useInner ? alpha : 180 - alpha;
        const rr = useInner ? R - 50 : R - 27;
        readMark.setAttribute('cx', (rr * Math.cos(phi * PI / 180)).toFixed(1));
        readMark.setAttribute('cy', (-rr * Math.sin(phi * PI / 180)).toFixed(1));
        tween(500, (t) => readMark.setAttribute('opacity', t), () => {
          busy = false;
          bigT.textContent = alpha + '°';
          nextBtn.textContent = '再量一个';
        });
        const other = 180 - alpha;
        read.innerHTML = `看另一条边指着几。刚才对的是<b>${useInner ? '内圈' : '外圈'}</b>的 0，就读${useInner ? '内圈' : '外圈'}：这个角是 <span class="k2">${alpha}°</span>。` +
          `<br>另一圈在这里是 ${other}，不能读它。检查一下：这个角是${alpha < 90 ? '锐角，比 90° 小' : alpha === 90 ? '直角' : '钝角，比 90° 大'}，${alpha}° 对得上。` +
          '<br>（量角器上每 20° 写一个数，中间的小格每格 5°。）';
      }
    }
    H('p', { class: 'anim-tip' }, el, '量角器外圈是黑色数字，从左边的 0 开始；内圈是蓝色数字，从右边的 0 开始。');
    newAngle();
  };

  // ───────────── 平行与垂直：转动两条直线 ─────────────
  A.g_parallel0_lines = function (el) {
    const W = 440, Hh = 280, C = [220, 140];
    const svg = stage(el, W, Hh);
    const cid = uid();
    const cp = S('clipPath', { id: cid }, svg);
    S('rect', { x: 0, y: 0, width: W, height: Hh }, cp);
    const world = S('g', { 'clip-path': `url(#${cid})` }, svg);
    const PA = [220, 100], PB = [220, 185];
    const lineA = S('line', { class: 's1 thick round' }, world);
    const lineB = S('line', { class: 's2 thick round' }, world);
    const arc = S('path', { class: 'f3s s3' }, world);
    const rmark = S('path', { class: 'fnone sstrong' }, world);
    const xDot = S('circle', { r: 6, class: 'fstrong' }, world);
    const angT = T(world, 0, 0, '', 'tb t3');
    const labA = T(svg, 0, 0, 'a', 'tb t1 tl');
    const labB = T(svg, 0, 0, 'b', 'tb t2 tl');
    const stateT = T(svg, 12, 24, '', 'tb tl', 'start');
    const zoomT = T(svg, W - 10, Hh - 10, '', 'ts tm', 'end');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 15, b = 150, z = 1, busy = false, zoomed = false;
    const sA = slider(c, 'la', '直线 a', 0, 175, 5, a, (v) => { if (busy) { sA.set(Math.round(a)); return; } a = v; render(); });
    const sB = slider(c, 'lb', '直线 b', 0, 175, 5, b, (v) => { if (busy) { sB.set(Math.round(b)); return; } b = v; render(); });
    const c2 = ctrl(el);
    btn(c2, '变成平行', () => turnB(a));
    btn(c2, '变成垂直', () => turnB((a + 90) % 180));
    const zb = btn(c2, '延长看看', () => {
      if (busy) return;
      busy = true;
      const from = z, to = zoomed ? 1 : 0.08;
      tween(1600, (t) => { z = from * Math.pow(to / from, t); render(); }, () => {
        z = to; zoomed = !zoomed; busy = false; render();
        zb.textContent = zoomed ? '缩回来' : '延长看看';
      });
    }, 'alt');

    function turnB(target) {
      if (busy) return;
      busy = true;
      let from = b, to = target;
      // 直线转 180° 和原来一样，选转得少的方向
      if (to - from > 90) to -= 180;
      if (from - to > 90) to += 180;
      tween(900, (t) => { b = lerp(from, to, t); render(); }, () => {
        b = ((Math.round(to) % 180) + 180) % 180;
        sB.set(b); busy = false; render();
      });
    }
    const dir = (d) => [Math.cos(d * PI / 180), -Math.sin(d * PI / 180)];
    const toS = (p) => [C[0] + (p[0] - C[0]) * z, C[1] + (p[1] - C[1]) * z];
    function setLine(ln, P, d) {
      const L = 40000;
      const p1 = toS([P[0] - d[0] * L, P[1] - d[1] * L]), p2 = toS([P[0] + d[0] * L, P[1] + d[1] * L]);
      ln.setAttribute('x1', p1[0].toFixed(1)); ln.setAttribute('y1', p1[1].toFixed(1));
      ln.setAttribute('x2', p2[0].toFixed(1)); ln.setAttribute('y2', p2[1].toFixed(1));
    }
    function render() {
      const da = dir(a), db = dir(b);
      setLine(lineA, PA, da); setLine(lineB, PB, db);
      // 标签
      const sa = toS(PA), sb = toS(PB);
      let la = null;
      [1, -1].forEach((sg) => {
        const p = [sa[0] + da[0] * 160 * sg + 4, sa[1] + da[1] * 160 * sg - 8];
        if (!la && p[0] > 12 && p[0] < W - 12 && p[1] > 20 && p[1] < Hh - 6) la = p;
      });
      if (!la) la = [sa[0] + 14, sa[1] - 10];
      labA.setAttribute('x', la[0].toFixed(1)); labA.setAttribute('y', la[1].toFixed(1));
      // b 的标签：缩小时放在另一头，免得和 a 的标签挤在一起；放不下就换一头
      const order = z < 0.99 ? [-1, 1] : [1, -1];
      let lb = null;
      order.forEach((sg) => {
        const p = [sb[0] + db[0] * 160 * sg + 4, sb[1] + db[1] * 160 * sg + 20];
        if (!lb && p[0] > 12 && p[0] < W - 12 && p[1] > 20 && p[1] < Hh - 6) lb = p;
      });
      if (!lb) lb = [sb[0] + 14, sb[1] + 22];
      labB.setAttribute('x', lb[0].toFixed(1)); labB.setAttribute('y', lb[1].toFixed(1));
      zoomT.textContent = z < 0.99 ? '（缩小了看，线还在延长）' : '';
      let d = ((b - a) % 180 + 180) % 180; // a 转到 b 的角度
      const dr = Math.round(d);
      const parallel = dr === 0 || dr === 180;
      arc.setAttribute('d', ''); rmark.setAttribute('d', ''); angT.textContent = '';
      xDot.setAttribute('opacity', 0);
      if (parallel) {
        stateT.textContent = 'a ∥ b';
        read.innerHTML = '两条直线方向完全一样，怎么延长都<b>不会相交</b>。它们<b>互相平行</b>，记作 <i>a</i> ∥ <i>b</i>。' + (zoomed ? '<br>缩得这么小，它们还是并排走，永远碰不到。' : '<br>点“延长看看”验证一下。');
        return;
      }
      // 求交点：PA + s·da = PB + t·db
      const den = da[0] * db[1] - da[1] * db[0];
      const s = ((PB[0] - PA[0]) * db[1] - (PB[1] - PA[1]) * db[0]) / den;
      const X = [PA[0] + s * da[0], PA[1] + s * da[1]];
      const XS = toS(X);
      const inView = XS[0] > 8 && XS[0] < W - 8 && XS[1] > 8 && XS[1] < Hh - 8;
      const perp = dr === 90;
      stateT.textContent = perp ? 'a ⊥ b' : '相交';
      if (inView) {
        xDot.setAttribute('opacity', 1);
        xDot.setAttribute('cx', XS[0].toFixed(1)); xDot.setAttribute('cy', XS[1].toFixed(1));
        const r = 24;
        if (perp) {
          const p1 = [XS[0] + da[0] * 14, XS[1] + da[1] * 14], p3 = [XS[0] + db[0] * 14, XS[1] + db[1] * 14];
          const p2 = [p1[0] + db[0] * 14, p1[1] + db[1] * 14];
          rmark.setAttribute('d', `M${p1[0].toFixed(1)},${p1[1].toFixed(1)} L${p2[0].toFixed(1)},${p2[1].toFixed(1)} L${p3[0].toFixed(1)},${p3[1].toFixed(1)}`);
        } else {
          const q1 = [XS[0] + da[0] * r, XS[1] + da[1] * r], q2 = [XS[0] + db[0] * r, XS[1] + db[1] * r];
          arc.setAttribute('d', `M${XS[0].toFixed(1)},${XS[1].toFixed(1)} L${q1[0].toFixed(1)},${q1[1].toFixed(1)} A${r},${r} 0 0 0 ${q2[0].toFixed(1)},${q2[1].toFixed(1)} Z`);
        }
        const mid = (a + d / 2) * PI / 180;
        angT.setAttribute('x', (XS[0] + Math.cos(mid) * 42).toFixed(1));
        angT.setAttribute('y', (XS[1] - Math.sin(mid) * 42 + 5).toFixed(1));
        angT.textContent = dr + '°';
      }
      if (perp) {
        read.innerHTML = '两条直线相交成<b>直角</b>（90°），它们<b>互相垂直</b>，记作 <i>a</i> ⊥ <i>b</i>。交点叫做<b>垂足</b>。相交形成的四个角都是 90°。';
      } else if (inView) {
        read.innerHTML = `两条直线<b>相交</b>了，黑点是交点。绿色的角是 <span class="k3">${dr}°</span>，旁边的角是 ${180 - dr}°。它们不是直角，所以不垂直。`;
      } else {
        read.innerHTML = '图里看不到交点……可是两条线方向不一样，它们<b>不平行</b>！点“延长看看”，交点在很远的地方。';
      }
    }
    render();
  };

  // ───────────── 平行与垂直：垂线段最短 ─────────────
  A.g_parallel0_shortest = function (el) {
    const W = 440, Hh = 250, u = 30, LY = 196, P = [220, 196 - 4 * u];
    const svg = stage(el, W, Hh);
    bgGrid(svg, 10, LY - 6 * u, 14, 6, u);
    S('line', { x1: 14, x2: W - 14, y1: LY, y2: LY, class: 'sstrong thick round' }, svg);
    T(svg, W - 16, LY - 10, 'l', 'tb tl tm', 'end');
    const keep = S('g', {}, svg);
    const foot = S('path', { class: 'fnone sstrong' }, svg);
    const seg = S('line', { x1: P[0], y1: P[1], class: 's2 thick round' }, svg);
    const segT = T(svg, 0, 0, '', 'tb t2');
    S('circle', { cx: P[0], cy: P[1], r: 5, class: 'fstrong' }, svg);
    T(svg, P[0], P[1] - 12, 'P', 'tb tl');
    const qT = T(svg, 0, LY + 24, 'Q', 'tb tl');
    const handle = S('circle', { cy: LY, r: 13, class: 'handle', tabindex: 0 }, svg);
    T(svg, 14, 20, '每格 1 厘米：P 离直线 l 有 4 格高', 'ts tm', 'start');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let qx = 360, busy = false, best = Infinity, kept = 0;
    btn(c, '留下这条', () => {
      if (kept >= 6) return;
      kept++;
      const len = Math.hypot(qx - P[0], LY - P[1]) / u;
      S('line', { x1: P[0], y1: P[1], x2: qx, y2: LY, class: 'smuted dash' }, keep);
      T(keep, qx, LY + 42, len.toFixed(1), 'ts tm');
      render();
    }, 'alt');
    btn(c, '找最短的', () => {
      if (busy) return;
      busy = true;
      const from = qx;
      tween(900, (t) => { qx = lerp(from, P[0], t); render(); }, () => { qx = P[0]; busy = false; render(); });
    });
    btn(c, '清除', () => { keep.innerHTML = ''; kept = 0; best = Infinity; render(); }, 'alt');

    function render() {
      seg.setAttribute('x2', qx.toFixed(1)); seg.setAttribute('y2', LY);
      handle.setAttribute('cx', qx.toFixed(1));
      qT.setAttribute('x', qx.toFixed(1));
      const len = Math.hypot(qx - P[0], LY - P[1]) / u;
      best = Math.min(best, len);
      segT.setAttribute('x', ((qx + P[0]) / 2 + (qx >= P[0] ? 16 : -16)).toFixed(1));
      segT.setAttribute('y', ((LY + P[1]) / 2).toFixed(1));
      segT.setAttribute('text-anchor', qx >= P[0] ? 'start' : 'end');
      segT.textContent = `约 ${len.toFixed(1)} 厘米`;
      const isFoot = Math.abs(qx - P[0]) < 0.5;
      foot.setAttribute('d', isFoot ? `M${P[0] + 13},${LY} v-13 h-13` : '');
      if (isFoot) {
        segT.textContent = '4 厘米';
        read.innerHTML = 'PQ 和直线 <i>l</i> <b>垂直</b>了！这条<b>垂线段</b>只有 <span class="k2">4 厘米</span>，是所有线段里<b>最短</b>的。<br>它的长度就是点 P 到直线 <i>l</i> 的<b>距离</b>。';
      } else {
        read.innerHTML = `现在 PQ 约 <span class="k2">${len.toFixed(1)}</span> 厘米，它是<b>斜</b>的。左右拖动 Q，看看什么时候 PQ 最短。` +
          (best < len - 0.05 ? `<br>你刚才找到过更短的：约 ${best.toFixed(1)} 厘米。` : '');
      }
    }
    handle.addEventListener('pointerdown', (e) => {
      if (busy) return;
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const p = svgPoint(svg, ev);
        qx = clamp(p.x, 24, W - 24);
        if (Math.abs(qx - P[0]) < 6) qx = P[0];
        render();
      };
      const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动直线上的橙色圆点 Q。');
    render();
  };

  // ───────────── 多边形面积：平行四边形剪拼成长方形 ─────────────
  A.g_polyarea_cut = function (el) {
    const W = 440, Hh = 262, u = 30, ox = 70, oy = 222, sft = 2;
    const svg = stage(el, W, Hh);
    bgGrid(svg, ox - u, oy - 6 * u, 12, 6, u);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 6, h = 4, st = 0, busy = false;
    slider(c, 'pa', '底', 3, 8, 1, a, (v) => { a = v; render(); });
    slider(c, 'ph', '高', 2, 5, 1, h, (v) => { h = v; render(); });
    const c2 = ctrl(el);
    const go = btn(c2, '沿高剪开', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st < 0.5 ? 1 : st < 1.5 ? 2 : 0;
      tween(to === 2 ? 1500 : 1000, (t) => { st = lerp(from, to, t); render(); }, () => {
        st = to; busy = false; render();
        go.textContent = to === 0 ? '沿高剪开' : to === 1 ? '把三角形移过去' : '还原';
      });
    });
    const M = (x, y) => [ox + x * u, oy - y * u];
    function render() {
      g.innerHTML = '';
      const k1 = clamp(st, 0, 1), k2 = clamp(st - 1, 0, 1);
      const Ap = M(0, 0), B = M(a, 0), Cc = M(a + sft, h), D = M(sft, h), E = M(sft, 0);
      // 右边的部分（梯形）
      S('polygon', { points: pts([E, B, Cc, D]), class: 'f1s' }, g);
      // 左边剪下的三角形
      const dx = k2 * a * u, dy = -Math.sin(k2 * PI) * 22;
      const triCls = st > 0.02 ? 'f2s s2 round' : 'f1s';
      S('polygon', { points: pts([Ap, E, D]), class: triCls, transform: `translate(${dx.toFixed(1)},${dy.toFixed(1)})` }, g);
      // 原来的外框
      S('polygon', { points: pts([Ap, B, Cc, D]), class: 'fnone sstrong round', opacity: (1 - k1 * 0.85).toFixed(2) }, g);
      if (st > 0.02) S('polygon', { points: pts([E, B, Cc, D]), class: 'fnone s1 round' }, g);
      // 高（虚线）
      const hy = lerp(D[1], E[1], st < 0.02 ? 1 : k1);
      S('line', { x1: D[0], y1: D[1], x2: D[0], y2: hy, class: 's2 dash' }, g);
      if (st < 0.02 || k1 >= 1) S('path', { d: `M${E[0] + 10},${E[1]} v-10 h-10`, class: 'fnone sstrong thin' }, g);
      // 标注
      if (k2 < 1) {
        T(g, (Ap[0] + B[0]) / 2, oy + 22, `底 ${a}`, 'tb t1');
      } else {
        T(g, (E[0] + M(a + sft, 0)[0]) / 2, oy + 22, `长 = 底 = ${a}`, 'tb t1');
      }
      T(g, D[0] + 6, (D[1] + E[1]) / 2 + 5, `高 ${h}`, 'tb t2', 'start');
      if (st < 0.02) {
        read.innerHTML = `平行四边形：<span class="k1">底 ${a} 厘米</span>，<span class="k2">高 ${h} 厘米</span>。左右两边是斜的，有好多半格，不好数。<br>注意：斜边不是高，高是从顶点<b>垂直</b>画到底边的线段（橙色虚线）。`;
      } else if (st < 1.02 && st > 0.98) {
        read.innerHTML = '沿着高剪开，剪下左边这个<span class="k2">直角三角形</span>。';
      } else if (st > 1.98) {
        read.innerHTML = `拼成了一个<b>长方形</b>！长方形的长 = 平行四边形的<span class="k1">底 ${a}</span>，宽 = 平行四边形的<span class="k2">高 ${h}</span>。<br>面积没变：平行四边形面积 = 底 × 高 = ${a} × ${h} = <b>${a * h}</b> 平方厘米。数一数格子也是 ${a * h} 个。`;
      } else {
        read.innerHTML = '剪下来的三角形正在平移……';
      }
    }
    render();
  };

  // ───────────── 多边形面积：两个一样的图形拼成平行四边形 ─────────────
  function twinBuild(el, kind) {
    const W = 440, Hh = 262, u = 28, ox = 40, oy = 222;
    const svg = stage(el, W, Hh);
    bgGrid(svg, ox - u, oy - 6 * u, 14, 6, u);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const isTri = kind === 'tri';
    let a = isTri ? 6 : 3, b = 6, h = 4, st = 0, busy = false;
    if (isTri) {
      slider(c, 'ta', '底', 2, 8, 1, a, (v) => { a = v; render(); });
    } else {
      slider(c, 'za', '上底', 1, 3, 1, a, (v) => { a = v; render(); });
      slider(c, 'zb', '下底', 4, 8, 1, b, (v) => { b = v; render(); });
    }
    slider(c, isTri ? 'th' : 'zh', '高', 2, 5, 1, h, (v) => { h = v; render(); });
    const c2 = ctrl(el);
    const go = btn(c2, '再拿一个，转过来拼', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 0.5 ? 0 : 1;
      tween(to ? 1800 : 900, (t) => { st = lerp(from, to, t); render(); }, () => {
        st = to; busy = false; render();
        go.textContent = to ? '拿走一个' : '再拿一个，转过来拼';
      });
    });
    const M = (x, y) => [ox + x * u, oy - y * u];
    function render() {
      g.innerHTML = '';
      let shape, Bm, Cm, name;
      if (isTri) {
        shape = [[0, 0], [a, 0], [1, h]];
        Bm = [a, 0]; Cm = [1, h]; name = '三角形';
      } else {
        shape = [[0, 0], [b, 0], [1 + a, h], [1, h]];
        Bm = [b, 0]; Cm = [1 + a, h]; name = '梯形';
      }
      const scr = shape.map((p) => M(p[0], p[1]));
      const mid = M((Bm[0] + Cm[0]) / 2, (Bm[1] + Cm[1]) / 2);
      // 原图形
      S('polygon', { points: pts(scr), class: 'f1s s1 round' }, g);
      // 高
      const top = M(1, h), bot = M(1, 0);
      S('line', { x1: top[0], y1: top[1], x2: bot[0], y2: bot[1], class: 'sstrong dash thin' }, g);
      S('path', { d: `M${bot[0] + 9},${bot[1]} v-9 h-9`, class: 'fnone sstrong thin' }, g);
      T(g, top[0] - 6, (top[1] + bot[1]) / 2 + 5, `高 ${h}`, 'tb', 'end');
      // 复制出来的图形，绕中点转 180°
      if (st > 0.001) {
        const ang = 180 * smooth(clamp(st, 0, 1));
        S('polygon', { points: pts(scr), class: 'f2s s2 round', style: 'fill-opacity: .85', transform: `rotate(${ang.toFixed(1)},${mid[0].toFixed(1)},${mid[1].toFixed(1)})` }, g);
        S('circle', { cx: mid[0], cy: mid[1], r: 5, class: 'f2' }, g);
      }
      if (isTri) {
        T(g, (scr[0][0] + scr[1][0]) / 2, oy + 22, `底 ${a}`, 'tb t1');
      } else {
        T(g, (scr[0][0] + scr[1][0]) / 2, oy + 22, `下底 ${b}`, 'tb t1');
        T(g, (scr[2][0] + scr[3][0]) / 2, scr[3][1] - 8, `上底 ${a}`, 'tb t1');
      }
      if (st >= 0.999) {
        if (isTri) {
          T(g, M(1 + a / 2, h)[0], M(0, h)[1] - 8, `上面也是 ${a}`, 'tb t2');
        } else {
          T(g, M(b + a / 2, 0)[0], oy + 22, `+ ${a}`, 'tb t2');
          T(g, M(1 + a + b / 2, h)[0], M(0, h)[1] - 8, `+ ${b}`, 'tb t2');
        }
      }
      const area2 = isTri ? a * h : (a + b) * h;
      if (st < 0.001) {
        read.innerHTML = isTri
          ? `一个${name}：<span class="k1">底 ${a} 厘米</span>，高 ${h} 厘米。拿一个和它<b>完全一样</b>的，看看能拼成什么。`
          : `一个${name}：<span class="k1">上底 ${a} 厘米、下底 ${b} 厘米</span>，高 ${h} 厘米。拿一个和它<b>完全一样</b>的，看看能拼成什么。`;
      } else if (st >= 0.999) {
        read.innerHTML = isTri
          ? `拼成了一个<b>平行四边形</b>！它的底是 ${a}，高是 ${h}，面积 = ${a} × ${h} = ${area2} 平方厘米。<br>一个三角形是它的一半：底 × 高 ÷ 2 = ${a} × ${h} ÷ 2 = <b>${fmt(area2 / 2)}</b> 平方厘米。`
          : `拼成了一个<b>平行四边形</b>！它的底 = 上底 + 下底 = ${a} + ${b} = ${a + b}，高是 ${h}，面积 = ${a + b} × ${h} = ${area2} 平方厘米。<br>一个梯形是它的一半：(${a} + ${b}) × ${h} ÷ 2 = <b>${fmt(area2 / 2)}</b> 平方厘米。`;
      } else {
        read.innerHTML = '橙色的那个绕着圆点转半圈……';
      }
    }
    render();
  }
  A.g_polyarea_tri = function (el) { twinBuild(el, 'tri'); };
  A.g_polyarea_trap = function (el) { twinBuild(el, 'trap'); };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
