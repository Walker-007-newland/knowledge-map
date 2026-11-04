// 奥数拓展 olym7（小学几何）：巧求面积、等积变形、蝴蝶模型、立体图形计数、圆的组合图形、格点与面积
(function () {
  const { S, H, T, tween, lerp, stage, ctrl, btn, slider, svgPoint } = window.AH;
  const PI = Math.PI;
  const A = {};

  // ── 本文件的小工具 ──
  const pts = (P) => P.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const polyArea = (P) => {
    let s = 0;
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      s += a[0] * b[1] - b[0] * a[1];
    }
    return Math.abs(s) / 2;
  };
  // 显示用：最多保留 4 位小数，负号用 −
  const nf = (n) => {
    const v = Math.round(n * 10000) / 10000;
    return String(Object.is(v, -0) ? 0 : v).replace('-', '−');
  };
  // 保留两位小数显示，四舍五入过的前面加 ≈
  const r2 = (v) => { const r = Math.round(v * 100) / 100; return (Math.abs(r - v) > 1e-9 ? "≈" : "") + nf(r); };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
  function dragOn(svg, h, move, ok) {
    h.addEventListener('pointerdown', (e) => {
      if (ok && !ok()) return;
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      const mv = (ev) => move(svgPoint(svg, ev));
      const up = () => {
        h.removeEventListener('pointermove', mv);
        h.removeEventListener('pointerup', up);
        h.removeEventListener('pointercancel', up);
      };
      h.addEventListener('pointermove', mv);
      h.addEventListener('pointerup', up);
      h.addEventListener('pointercancel', up);
    });
  }
  function arcPts(cx, cy, r, a0, a1, n) {
    n = n || 40;
    const out = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return out;
  }
  // 用半平面 f(p) ≥ 0 裁剪多边形
  function clipHalf(P, f) {
    const out = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      const fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) {
        const t = fa / (fa - fb);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  }
  function lineX(p1, p2, p3, p4) {
    const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
    if (Math.abs(d) < 1e-9) return null;
    const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0])) / d;
    return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
  }
  const cen = (P) => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];

  // ═════════════════════ 巧求面积 ═════════════════════

  // 平移小路：草地被十字小路分成 4 块，把小路移到边上
  A.o_area_cut_road = function (el) {
    const W = 420, Hh = 290;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let L = 16, Wd = 10, d = 2, t = 0, busy = false;
    const mv = btn(c, '把小路移到边上', () => {
      if (busy) return;
      busy = true;
      const from = t, to = t ? 0 : 1;
      tween(1300, (k) => { t = lerp(from, to, k); draw(); }, () => { busy = false; t = to; draw(); });
    });
    slider(c, 'arL', '长', 8, 20, 1, L, (v) => { L = v; draw(); });
    slider(c, 'arW', '宽', 6, 14, 1, Wd, (v) => { Wd = v; draw(); });
    slider(c, 'ard', '路宽', 1, 3, 1, d, (v) => { d = v; draw(); });
    function draw() {
      g.innerHTML = '';
      const u = Math.min(360 / L, 220 / Wd), ox = (W - L * u) / 2, oy = 34;
      const X = (x) => ox + x * u, Y = (y) => oy + y * u;
      const vx = Math.floor((L - d) / 2), hy = Math.floor((Wd - d) / 2);
      const rx = lerp(vx, L - d, t), ry = lerp(hy, Wd - d, t);
      S('rect', { x: X(0), y: Y(0), width: L * u, height: Wd * u, class: 'fsurf2 sline' }, g);
      // 小路
      S('rect', { x: X(rx), y: Y(0), width: d * u, height: Wd * u, class: 'f2s' }, g);
      S('rect', { x: X(0), y: Y(ry), width: L * u, height: d * u, class: 'f2s' }, g);
      S('rect', { x: X(rx), y: Y(ry), width: d * u, height: d * u, class: 'f2', style: 'opacity:.55' }, g);
      // 四块草地
      const w1 = vx, w2 = L - d - vx, h1 = hy, h2 = Wd - d - hy;
      const blocks = [
        [0, 0, w1, h1, 0, 0], [vx + d, 0, w2, h1, vx + d - t * d, 0],
        [0, hy + d, w1, h2, 0, hy + d - t * d], [vx + d, hy + d, w2, h2, vx + d - t * d, hy + d - t * d]
      ];
      blocks.forEach((b) => {
        if (b[2] <= 0 || b[3] <= 0) return;
        S('rect', { x: X(b[4]), y: Y(b[5]), width: b[2] * u, height: b[3] * u, class: 'f3s s3' }, g);
      });
      S('rect', { x: X(0), y: Y(0), width: L * u, height: Wd * u, class: 'fnone sstrong' }, g);
      T(g, X(L / 2), Y(0) - 10, `长 ${L} 米`, 'ts');
      T(g, X(0) - 8, Y(Wd / 2), `宽 ${Wd} 米`, 'ts').setAttribute('transform', `rotate(-90 ${X(0) - 8} ${Y(Wd / 2)})`);
      if (t > 0.99) {
        S('rect', { x: X(0), y: Y(0), width: (L - d) * u, height: (Wd - d) * u, class: 'fnone s3 thick dash' }, g);
        T(g, X((L - d) / 2), Y((Wd - d) / 2) + 6, `${L - d} × ${Wd - d}`, 'tl tb t3');
        T(g, X(L / 2), Y(Wd) + 22, `草地拼成了一个长 ${L - d} 米、宽 ${Wd - d} 米的长方形`, 'ts tm');
      } else {
        T(g, X(L / 2), Y(Wd) + 22, '小路的交叉处（深色）是两条路共用的', 'ts tm');
      }
      const grass = (L - d) * (Wd - d);
      if (t > 0.99) {
        read.innerHTML = `把右边的草地向左、下边的草地向上各平移 ${d} 米，小路被“挤”到了边上。<br>草地面积 = <span class="k3">(${L} − ${d}) × (${Wd} − ${d}) = ${L - d} × ${Wd - d} = ${grass}</span>（平方米）`;
      } else if (t < 0.01) {
        read.innerHTML = `一块长 ${L} 米、宽 ${Wd} 米的草地，中间有横、竖两条宽 ${d} 米的小路，草地被分成 4 块。四块的长、宽都不知道，怎么求草地面积？点“把小路移到边上”。<br>也可以用“总面积 − 路”：${L} × ${Wd} − ${L} × ${d} − ${Wd} × ${d} + ${d} × ${d} = ${grass}，交叉处被减了两次，要加回一次。`;
      } else read.innerHTML = '草地正在平移……';
      mv.textContent = t > 0.5 ? '把小路放回中间' : '把小路移到边上';
    }
    draw();
  };

  // 分割与添补：直角多边形（拐角都是直角）
  A.o_area_cut_split = function (el) {
    const W = 420, Hh = 300;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const SHAPES = [
      { name: 'L 形', P: [[0, 0], [5, 0], [5, 3], [8, 3], [8, 6], [0, 6]] },
      { name: '凹字形', P: [[0, 0], [3, 0], [3, 3], [6, 3], [6, 0], [9, 0], [9, 6], [0, 6]] },
      { name: '凸字形', P: [[3, 0], [6, 0], [6, 2], [9, 2], [9, 6], [0, 6], [0, 2], [3, 2]] },
      { name: '台阶形', P: [[0, 0], [2, 0], [2, 2], [4, 2], [4, 4], [6, 4], [6, 6], [0, 6]] }
    ];
    let si = 0, mode = 'none', t = 0, busy = false;
    btn(c, '横着切', () => go('h'));
    btn(c, '竖着切', () => go('v'));
    btn(c, '补成大长方形', () => go('fill'));
    btn(c, '换一个图形', () => { if (busy) return; si = (si + 1) % SHAPES.length; mode = 'none'; t = 0; draw(); }, 'alt');
    function go(m) {
      if (busy) return;
      busy = true; mode = m; t = 0;
      tween(900, (k) => { t = k; draw(); }, () => { busy = false; t = 1; draw(); });
    }
    // 按横带切成长方形：返回 [x0, y0, x1, y1]
    function bands(P, swap) {
      const Q = swap ? P.map((p) => [p[1], p[0]]) : P;
      const ys = [...new Set(Q.map((p) => p[1]))].sort((a, b) => a - b);
      let out = [];
      for (let i = 0; i + 1 < ys.length; i++) {
        const ym = (ys[i] + ys[i + 1]) / 2, xs = [];
        for (let j = 0; j < Q.length; j++) {
          const a = Q[j], b = Q[(j + 1) % Q.length];
          if ((a[1] > ym) !== (b[1] > ym)) xs.push(a[0] + ((ym - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
        }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) {
          const prev = out.find((r) => r[0] === xs[k] && r[2] === xs[k + 1] && r[3] === ys[i]);
          if (prev) prev[3] = ys[i + 1];
          else out.push([xs[k], ys[i], xs[k + 1], ys[i + 1]]);
        }
      }
      if (swap) out = out.map((r) => [r[1], r[0], r[3], r[2]]);
      return out;
    }
    // 外框里缺掉的部分
    function missing(P) {
      const x0 = Math.min(...P.map((p) => p[0])), x1 = Math.max(...P.map((p) => p[0]));
      const ys = [...new Set(P.map((p) => p[1]))].sort((a, b) => a - b);
      const out = [];
      for (let i = 0; i + 1 < ys.length; i++) {
        const ym = (ys[i] + ys[i + 1]) / 2, xs = [x0];
        for (let j = 0; j < P.length; j++) {
          const a = P[j], b = P[(j + 1) % P.length];
          if ((a[1] > ym) !== (b[1] > ym)) xs.push(a[0] + ((ym - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
        }
        xs.push(x1);
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) {
          if (xs[k + 1] - xs[k] < 1e-9) continue;
          const prev = out.find((r) => r[0] === xs[k] && r[2] === xs[k + 1] && r[3] === ys[i]);
          if (prev) prev[3] = ys[i + 1];
          else out.push([xs[k], ys[i], xs[k + 1], ys[i + 1]]);
        }
      }
      return out;
    }
    function draw() {
      g.innerHTML = '';
      const sh = SHAPES[si], P = sh.P;
      const bw = Math.max(...P.map((p) => p[0])), bh = Math.max(...P.map((p) => p[1]));
      const u = 30, ox = (W - bw * u) / 2, oy = 40;
      const X = (x) => ox + x * u, Y = (y) => oy + y * u;
      for (let i = 0; i <= bw; i++) S('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(bh), class: 'gridl' }, g);
      for (let j = 0; j <= bh; j++) S('line', { x1: X(0), x2: X(bw), y1: Y(j), y2: Y(j), class: 'gridl' }, g);
      const area = polyArea(P);
      const CL = ['f1s s1', 'f3s s3', 'f2s s2'];
      if (mode === 'h' || mode === 'v') {
        const R = bands(P, mode === 'v');
        const cc = cen(P);
        const parts = [];
        R.forEach((r, i) => {
          const rc = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
          const dx = (rc[0] - cc[0]) * 0.12 * t, dy = (rc[1] - cc[1]) * 0.12 * t;
          S('rect', { x: X(r[0] + dx), y: Y(r[1] + dy), width: (r[2] - r[0]) * u, height: (r[3] - r[1]) * u, class: CL[i % 3] }, g);
          const w = r[2] - r[0], h = r[3] - r[1];
          if (t > 0.5) T(g, X(rc[0] + dx), Y(rc[1] + dy) + 5, `${w}×${h}`, 'tb');
          parts.push(`${w} × ${h} = ${w * h}`);
        });
        read.innerHTML = t < 1 ? '沿着拐角的边一刀刀切开……' :
          `${mode === 'h' ? '横着' : '竖着'}切成 ${R.length} 个长方形：${parts.join('，')}。<br>加起来：<b>${R.map((r) => (r[2] - r[0]) * (r[3] - r[1])).join(' + ')} = ${area}</b>（平方厘米）`;
      } else {
        S('polygon', { points: pts(P.map((p) => [X(p[0]), Y(p[1])])), class: 'f1s s1' }, g);
        if (mode === 'fill') {
          const M = missing(P);
          S('rect', { x: X(0), y: Y(0), width: bw * u, height: bh * u, class: 'fnone s2 thick dash' }, g);
          const parts = [];
          M.forEach((r) => {
            const w = r[2] - r[0], h = r[3] - r[1];
            S('rect', { x: X(r[0]), y: Y(r[1]) - (1 - t) * 40, width: w * u, height: h * u, class: 'f2s s2', opacity: t }, g);
            if (t > 0.5) T(g, X((r[0] + r[2]) / 2), Y((r[1] + r[3]) / 2) + 5, `${w}×${h}`, 'tb t2');
            parts.push(w * h);
          });
          read.innerHTML = t < 1 ? '把缺掉的地方补上……' :
            `补上橙色的部分，变成长 ${bw}、宽 ${bh} 的大长方形。<br>原图形面积 = 大长方形 − 补上的部分 = <b>${bw} × ${bh} − ${parts.join(' − ')} = ${area}</b>（平方厘米）`;
        } else {
          read.innerHTML = `一个${sh.name}图形，每个小方格边长 1 厘米，所有拐角都是直角。可以“横着切”“竖着切”分成长方形，也可以“补成大长方形”再减去补上的部分。`;
        }
      }
      S('polygon', { points: pts(P.map((p) => [X(p[0]), Y(p[1])])), class: 'fnone sstrong' }, g);
      T(g, X(bw / 2), Y(bh) + 24, `每格边长 1 厘米`, 'ts tm');
    }
    draw();
  };

  // 旋转：两个同样大的正方形，一个的顶点在另一个的中心
  A.o_area_cut_rotate = function (el) {
    const W = 420, Hh = 330;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 8, th = 25, busy = false;
    let sl;
    btn(c, '转一转', () => {
      if (busy) return;
      busy = true;
      tween(2400, (k) => { th = Math.min(89, Math.round(90 * Math.sin(k * PI))); if (sl) sl.set(th); draw(); }, () => { busy = false; th = 0; if (sl) sl.set(0); draw(); });
    });
    sl = slider(c, 'arot', '转动角度', 0, 89, 1, th, (v) => { if (!busy) { th = v; draw(); } });
    slider(c, 'aside', '边长', 4, 12, 2, a, (v) => { a = v; draw(); });
    function draw() {
      g.innerHTML = '';
      const s = 130, O = [165, 125]; // 正方形 A 边长 s 像素，中心 O
      const half = s / 2;
      const SQ = [[O[0] - half, O[1] - half], [O[0] + half, O[1] - half], [O[0] + half, O[1] + half], [O[0] - half, O[1] + half]];
      const r = (th * PI) / 180;
      const uu = [Math.cos(r), Math.sin(r)], vv = [-Math.sin(r), Math.cos(r)];
      const B = [O, [O[0] + s * uu[0], O[1] + s * uu[1]], [O[0] + s * (uu[0] + vv[0]), O[1] + s * (uu[1] + vv[1])], [O[0] + s * vv[0], O[1] + s * vv[1]]];
      S('polygon', { points: pts(SQ), class: 'fsurf2 sstrong' }, g);
      S('polygon', { points: pts(B), class: 'fnone s1', style: 'fill: var(--a1s); fill-opacity:.35' }, g);
      let ov = clipHalf(SQ, (p) => (p[0] - O[0]) * uu[0] + (p[1] - O[1]) * uu[1]);
      ov = clipHalf(ov, (p) => (p[0] - O[0]) * vv[0] + (p[1] - O[1]) * vv[1]);
      S('polygon', { points: pts(ov), class: 'f2s s2' }, g);
      // 参照：不转时的小正方形
      S('rect', { x: O[0], y: O[1], width: half, height: half, class: 'fnone smuted dash' }, g);
      if (th > 0) {
        // 多出的三角形和少掉的三角形
        const gain = clipHalf(clipHalf(SQ, (p) => O[0] - p[0]), (p) => (p[0] - O[0]) * uu[0] + (p[1] - O[1]) * uu[1]);
        const lose = clipHalf(clipHalf(SQ, (p) => p[1] - O[1]), (p) => -((p[0] - O[0]) * vv[0] + (p[1] - O[1]) * vv[1]));
        if (gain.length > 2) S('polygon', { points: pts(gain), class: 'f3s s3' }, g);
        if (lose.length > 2) S('polygon', { points: pts(lose), class: 'fnone s3 dash' }, g);
      }
      S('circle', { cx: O[0], cy: O[1], r: 4, class: 'fstrong' }, g);
      T(g, O[0] - 10, O[1] - 8, 'O', 'ts tb', 'end');
      T(g, O[0], O[1] - half - 10, `正方形边长 ${a} 厘米`, 'ts tm');
      const real = polyArea(ov) / (s * s) * a * a;
      read.innerHTML = `两个一样大的正方形，蓝色正方形的一个顶点在灰色正方形的中心 O。转了 ${th}°，重叠部分（橙色）面积 = <b>${nf(real)}</b> 平方厘米。` +
        (th > 0 ? `<br>和虚线小正方形比：绿色三角形是多出来的，虚线三角形是少掉的，两块转一下就能重合，一样大。所以重叠部分始终是 ${a} × ${a} ÷ 4 = <span class="k2">${a * a / 4}</span>。` : `<br>没有转时，重叠部分正好是灰色正方形的四分之一：${a} × ${a} ÷ 4 = <span class="k2">${a * a / 4}</span>。拖动滑块或点“转一转”。`);
    }
    draw();
  };

  // ═════════════════════ 等积变形 ═════════════════════

  // 顶点沿平行线滑动
  A.o_equal_area_slide = function (el) {
    const W = 440, Hh = 270;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const ghostG = S('g', {}, svg);
    const top = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const u = 28, yb = 220;
    let b = 6, h = 5, ax = 4, busy = false; // ax：顶点横坐标（单位格）
    const bx0 = 4; // 底边起点（格）
    const ghosts = [];
    btn(c, '自动滑动', () => {
      if (busy) return;
      busy = true;
      const from = ax, d1 = from, d2 = 15, d3 = 15 - from, tot = d1 + d2 + d3;
      tween(3200, (k, raw) => {
        const s = raw * tot;
        ax = s < d1 ? from - s : s < d1 + d2 ? s - d1 : 15 - (s - d1 - d2);
        draw();
      }, () => { busy = false; ax = from; draw(); });
    });
    btn(c, '留下影子', () => { if (ghosts.length > 3) ghosts.shift(); ghosts.push([ax, b, h]); draw(); }, 'alt');
    btn(c, '清除影子', () => { ghosts.length = 0; draw(); }, 'alt');
    slider(c, 'eqb', '底', 2, 8, 1, b, (v) => { b = v; ghosts.length = 0; draw(); });
    slider(c, 'eqh', '高', 2, 6, 1, h, (v) => { h = v; ghosts.length = 0; draw(); });
    const X = (x) => 10 + x * u, Y = (y) => yb - y * u;
    const handle = S('circle', { r: 12, class: 'handle' }, top);
    dragOn(svg, handle, (p) => { ax = Math.max(0, Math.min(15, Math.round(((p.x - 10) / u) * 2) / 2)); draw(); }, () => !busy);
    function draw() {
      g.innerHTML = ''; ghostG.innerHTML = '';
      S('line', { x1: 4, x2: W - 4, y1: Y(h), y2: Y(h), class: 'smuted dash' }, g);
      S('line', { x1: 4, x2: W - 4, y1: Y(0), y2: Y(0), class: 'smuted' }, g);
      T(g, W - 8, Y(h) - 6, '这两条线平行', 'ts tm', 'end');
      const Bp = [X(bx0), Y(0)], Cp = [X(bx0 + b), Y(0)], Ap = [X(ax), Y(h)];
      ghosts.forEach((gh) => { if (gh[1] === b && gh[2] === h) S('polygon', { points: pts([[X(gh[0]), Y(h)], Bp, Cp]), class: 'fnone s1 dash' }, ghostG); });
      // 高（必要时延长底边）
      if (ax < bx0 || ax > bx0 + b) S('line', { x1: Ap[0], x2: ax < bx0 ? Bp[0] : Cp[0], y1: Y(0), y2: Y(0), class: 'sstrong dash' }, g);
      S('line', { x1: Ap[0], x2: Ap[0], y1: Ap[1], y2: Y(0), class: 's2 dash' }, g);
      S('path', { d: `M${Ap[0]},${Y(0) - 8} h${ax > bx0 + b / 2 ? -8 : 8} v8`, class: 'fnone s2 thin' }, g);
      S('polygon', { points: pts([Ap, Bp, Cp]), class: 'f1s s1' }, g);
      T(g, Ap[0], Ap[1] - 16, 'A', 'tb');
      T(g, Bp[0] - 4, Bp[1] + 18, 'B', 'tb');
      T(g, Cp[0] + 4, Cp[1] + 18, 'C', 'tb');
      T(g, (Bp[0] + Cp[0]) / 2, Y(0) + 34, `底 BC = ${b}`, 'ts t1');
      T(g, Ap[0] + 8, Y(h / 2), `高 ${h}`, 'ts t2', 'start');
      handle.setAttribute('cx', Ap[0]); handle.setAttribute('cy', Ap[1]);
      const ar = b * h / 2;
      read.innerHTML = `拖动顶点 A，它只能在上面那条平行线上滑。三角形 ABC 的样子一直在变，但<b>底</b>始终是 BC = ${b}，<b>高</b>始终是两条平行线的距离 ${h}。<br>面积 = <span class="k1">${b} × ${h} ÷ 2 = ${nf(ar)}</span>，一直不变！` +
        (ghosts.length ? `<br>虚线是留下的影子，它们和现在的三角形面积都是 ${nf(ar)}。` : '');
    }
    draw();
  };

  // 同高三角形：面积比 = 底之比
  A.o_equal_area_ratio = function (el) {
    const W = 440, Hh = 260;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const top = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 6, k = 2, ax = 3.5, cut = 0, busy = false;
    const h = 6, u = 30, x0 = 40, yb = 220;
    const X = (x) => x0 + x * u, Y = (y) => yb - y * u;
    const cb = btn(c, '切成小三角形', () => {
      if (busy) return;
      busy = true;
      const from = cut, to = cut ? 0 : 1;
      tween(1000, (t) => { cut = lerp(from, to, t); draw(); }, () => { busy = false; cut = to; draw(); });
    });
    const sk = slider(c, 'eqk', 'BD 的段数', 1, 9, 1, k, (v) => { k = Math.min(v, n - 1); if (k !== v) sk.set(k); draw(); });
    slider(c, 'eqn', 'BC 的段数', 2, 10, 1, n, (v) => { n = v; if (k > n - 1) { k = n - 1; sk.set(k); } draw(); });
    const handle = S('circle', { r: 12, class: 'handle' }, top);
    dragOn(svg, handle, (p) => { ax = Math.max(0, Math.min(11.5, Math.round(((p.x - x0) / u) * 2) / 2)); draw(); }, () => !busy);
    function more() {
      if (k * 2 === n) return ' D 是中点，AD 把三角形分成面积相等的两半。';
      if ((n - k) % k === 0) return ` 橙色面积是蓝色的 ${(n - k) / k} 倍。`;
      if (k % (n - k) === 0) return ` 蓝色面积是橙色的 ${k / (n - k)} 倍。`;
      return '';
    }
    function draw() {
      g.innerHTML = '';
      const uL = 10 / n; // 每段的像素格数（BC 总长 10 格）
      const Ap = [X(ax), Y(h)], Bp = [X(0), Y(0)], Cp = [X(10), Y(0)], Dp = [X(k * uL), Y(0)];
      S('line', { x1: 4, x2: W - 4, y1: Y(h), y2: Y(h), class: 'smuted dash' }, g);
      S('polygon', { points: pts([Ap, Bp, Dp]), class: 'f1s' }, g);
      S('polygon', { points: pts([Ap, Dp, Cp]), class: 'f2s' }, g);
      for (let i = 1; i < n; i++) {
        const P = [X(i * uL), Y(0)];
        S('line', { x1: P[0], x2: P[0], y1: P[1] - 5, y2: P[1] + 5, class: 'sstrong thin' }, g);
        if (cut > 0) S('line', { x1: Ap[0], y1: Ap[1], x2: lerp(Ap[0], P[0], cut), y2: lerp(Ap[1], P[1], cut), class: 'smuted thin' }, g);
      }
      S('polygon', { points: pts([Ap, Bp, Cp]), class: 'fnone sstrong' }, g);
      S('line', { x1: Ap[0], y1: Ap[1], x2: Dp[0], y2: Dp[1], class: 'sstrong' }, g);
      T(g, Ap[0], Ap[1] - 16, 'A', 'tb');
      T(g, Bp[0] - 6, Bp[1] + 18, 'B', 'tb');
      T(g, Cp[0] + 6, Cp[1] + 18, 'C', 'tb');
      T(g, Dp[0], Dp[1] + 20, 'D', 'tb t2');
      T(g, (Bp[0] + Dp[0]) / 2, Y(0) + 36, `${k} 段`, 'ts t1');
      T(g, (Dp[0] + Cp[0]) / 2, Y(0) + 36, `${n - k} 段`, 'ts t2');
      handle.setAttribute('cx', Ap[0]); handle.setAttribute('cy', Ap[1]);
      read.innerHTML = `底 BC 被平均分成 ${n} 段，BD 占 ${k} 段，DC 占 ${n - k} 段。△ABD 和 △ADC 的高都是 A 到 BC 的距离，<b>同高</b>。<br>` +
        (cut > 0.99 ? `从 A 连到每个分点，切出 ${n} 个小三角形：底都是 1 段，高都一样，所以<b>面积都相等</b>。蓝色有 ${k} 个，橙色有 ${n - k} 个：` : '') +
        `<span class="k1">△ABD</span> 的面积占 <b>${k}</b> 份，<span class="k2">△ADC</span> 的面积占 <b>${n - k}</b> 份，和底 BD、DC 的段数一样。` + more();
      cb.textContent = cut > 0.5 ? '合起来' : '切成小三角形';
    }
    draw();
  };

  // 两个正方形并排：△AEG 的面积只和大正方形有关
  A.o_equal_area_squares = function (el) {
    const W = 440, Hh = 300;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 4, bb = 6, t = 0, busy = false;
    const mb = btn(c, '把 A 沿虚线滑到 C', () => {
      if (busy) return;
      busy = true;
      const from = t, to = t ? 0 : 1;
      tween(1600, (k) => { t = lerp(from, to, k); draw(); }, () => { busy = false; t = to; draw(); });
    });
    slider(c, 'eqa', '小正方形边长', 2, 8, 1, a, (v) => { a = v; draw(); });
    slider(c, 'eqbb', '大正方形边长', 3, 9, 1, bb, (v) => { bb = v; draw(); });
    function draw() {
      g.innerHTML = '';
      const u = Math.min(28, 380 / (a + bb)), ox = (W - (a + bb) * u) / 2, oy = 250;
      const X = (x) => ox + x * u, Y = (y) => oy - y * u;
      const Bq = [0, 0], Cq = [a, 0], Dq = [a, a], Aq = [0, a], Eq = [a + bb, 0], Fq = [a + bb, bb], Gq = [a, bb];
      const P = (q) => [X(q[0]), Y(q[1])];
      S('polygon', { points: pts([Aq, Bq, Cq, Dq].map(P)), class: 'fsurf2 sstrong' }, g);
      S('polygon', { points: pts([Cq, Eq, Fq, Gq].map(P)), class: 'fsurf2 sstrong' }, g);
      const Am = [lerp(0, a, t), lerp(a, 0, t)];
      S('line', { x1: X(0) - (u * 0.6), y1: Y(a) - u * 0.6, x2: X(a) + u * 0.6, y2: Y(0) + u * 0.6, class: 'smuted dash' }, g);
      S('line', { x1: X(a), y1: Y(bb), x2: X(a + bb), y2: Y(0), class: 's2 thick' }, g);
      S('polygon', { points: pts([Am, Eq, Gq].map(P)), class: 'f1s s1', style: 'fill-opacity:.7' }, g);
      const lab = (q, s, dx, dy) => T(g, X(q[0]) + dx, Y(q[1]) + dy, s, 'tb');
      lab(Aq, 'A', -10, -4); lab(Bq, 'B', -8, 16); lab(Cq, 'C', 0, 18); lab(Dq, 'D', -10, -4);
      lab(Eq, 'E', 8, 16); lab(Fq, 'F', 8, -4); lab(Gq, 'G', -8, -6);
      if (t > 0 && t < 1) S('circle', { cx: X(Am[0]), cy: Y(Am[1]), r: 5, class: 'f2' }, g);
      const ar = polyArea([Am, Eq, Gq]);
      read.innerHTML = `小正方形 ABCD 边长 ${a}，大正方形 CEFG 边长 ${bb}。连 AC 和 GE：它们都是正方形的对角线，方向一样，<b>AC ∥ GE</b>。<br>` +
        (t > 0.99 ? `A 滑到 C 后，三角形变成 △CEG，正好是大正方形的一半：<span class="k1">${bb} × ${bb} ÷ 2 = ${nf(bb * bb / 2)}</span>。` :
          `以 GE 为底，A 在和 GE 平行的线 AC 上滑动，高不变，面积不变。现在面积 = <span class="k1">${nf(ar)}</span>。`) +
        ' 改变小正方形的边长试试，面积和它无关！';
      mb.textContent = t > 0.5 ? '把顶点放回 A' : '把 A 沿虚线滑到 C';
    }
    draw();
  };

  // ═════════════════════ 蝴蝶模型 ═════════════════════

  // 梯形蝴蝶
  A.o_butterfly_trap = function (el) {
    const W = 440;
    const u = 26, hh = 7, yt = 40, ox = 25;
    const Hh = yt + hh * u + 50;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const top = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let V = { A: 5, D: 9, B: 1, C: 13 }, st = 0;
    const X = (x) => ox + x * u;
    const yB = yt + hh * u;
    const sb = btn(c, '看两翼为什么相等', () => { st = (st + 1) % 4; draw(); });
    btn(c, '换一个梯形', () => {
      const r = (m) => Math.floor(Math.random() * m);
      const a = 2 + r(5), b = a + 2 + r(Math.max(1, 13 - a));
      const bs = r(15 - b);
      const as = Math.max(0, Math.min(15 - a, bs + r(b - a + 1)));
      V = { B: bs, C: bs + b, A: as, D: as + a };
      st = 0; draw();
    }, 'alt');
    const hs = {};
    ['A', 'D', 'B', 'C'].forEach((k) => {
      hs[k] = S('circle', { r: 11, class: 'handle' }, top);
      dragOn(svg, hs[k], (p) => {
        let x = Math.max(0, Math.min(15, Math.round((p.x - ox) / u)));
        if (k === 'A') x = Math.min(x, V.D - 1);
        if (k === 'D') x = Math.max(x, V.A + 1);
        if (k === 'B') x = Math.min(x, V.C - 1);
        if (k === 'C') x = Math.max(x, V.B + 1);
        V[k] = x; draw();
      });
    });
    function draw() {
      g.innerHTML = '';
      const Ap = [V.A, 0], Dp = [V.D, 0], Bp = [V.B, hh], Cp = [V.C, hh];
      const Op = lineX(Ap, Cp, Bp, Dp);
      const P = (q) => [X(q[0]), yt + q[1] * u];
      for (let i = 0; i <= 15; i++) for (let j = 0; j <= hh; j++) S('circle', { cx: X(i), cy: yt + j * u, r: 1.2, class: 'fmuted' }, g);
      const sUp = polyArea([Ap, Op, Dp]), sDn = polyArea([Bp, Op, Cp]), sL = polyArea([Ap, Bp, Op]), sR = polyArea([Dp, Op, Cp]);
      const reg = [[[Ap, Op, Dp], 'f1s', sUp], [[Bp, Op, Cp], 'f2s', sDn], [[Ap, Bp, Op], 'f3s', sL], [[Dp, Op, Cp], 'f3s', sR]];
      reg.forEach(([Q, cl]) => S('polygon', { points: pts(Q.map(P)), class: cl }, g));
      S('polygon', { points: pts([Ap, Dp, Cp, Bp].map(P)), class: 'fnone sstrong' }, g);
      S('line', { x1: P(Ap)[0], y1: P(Ap)[1], x2: P(Cp)[0], y2: P(Cp)[1], class: 'sstrong thin' }, g);
      S('line', { x1: P(Bp)[0], y1: P(Bp)[1], x2: P(Dp)[0], y2: P(Dp)[1], class: 'sstrong thin' }, g);
      if (st > 0) {
        const hl = st === 1 ? [Ap, Bp, Cp] : st === 2 ? [Dp, Bp, Cp] : [Bp, Op, Cp];
        S('polygon', { points: pts(hl.map(P)), class: st === 3 ? 'fsurf sstrong thick' : 'fnone s1 thick', style: st === 3 ? 'fill-opacity:.8' : 'fill: var(--a1); fill-opacity:.25' }, g);
      }
      reg.forEach(([Q, , s]) => { const cc = cen(Q); T(g, P(cc)[0], P(cc)[1] + 5, r2(s), 'ts tb'); });
      const lab = (q, s, dy) => T(g, P(q)[0], P(q)[1] + dy, s, 'tb');
      lab(Ap, 'A', -17); lab(Dp, 'D', -17); lab(Bp, 'B', 22); lab(Cp, 'C', 22);
      T(g, P(Op)[0] + 12, P(Op)[1] + 4, 'O', 'ts tb t2', 'start');
      ['A', 'D', 'B', 'C'].forEach((k) => { const q = k === 'A' ? Ap : k === 'D' ? Dp : k === 'B' ? Bp : Cp; hs[k].setAttribute('cx', P(q)[0]); hs[k].setAttribute('cy', P(q)[1]); });
      const a = V.D - V.A, b = V.C - V.B;
      const expl = [
        '',
        `△ABC：底 BC，高是梯形的高，面积 = ${b} × ${hh} ÷ 2 = ${nf(b * hh / 2)}。`,
        `△DBC：也是底 BC、高是梯形的高（D 和 A 在同一条平行线上），面积也是 ${nf(b * hh / 2)}，和 △ABC 相等。`,
        `△ABC 和 △DBC 都去掉公共的 △OBC，剩下的 △AOB 和 △DOC 当然也相等：两翼相等！`
      ];
      read.innerHTML = `上底 AD = ${a}，下底 BC = ${b}，高 ${hh}。<span class="k1">上 ${r2(sUp)}</span>，<span class="k2">下 ${r2(sDn)}</span>，<span class="k3">左 ${r2(sL)}</span>，<span class="k3">右 ${r2(sR)}</span>。` +
        `<br>两翼相等：<b>左 = 右 = ${r2(sL)}</b>；上 × 下 = ${r2(sUp * sDn)}，左 × 右 = ${r2(sL * sR)}，<b>相等</b>。` +
        `<br>四块的份数：上 ${a}×${a} = ${a * a} 份，左、右各 ${a}×${b} = ${a * b} 份，下 ${b}×${b} = ${b * b} 份。` +
        (st ? `<br><b>${expl[st]}</b>` : '');
      sb.textContent = st === 0 ? '看两翼为什么相等' : st === 3 ? '看完了，重来' : '下一步';
    }
    draw();
  };

  // 任意四边形蝴蝶
  A.o_butterfly_quad = function (el) {
    const W = 420, Hh = 340, u = 26, ox = 20, oy = 24;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const top = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const PRE = [
      [[2, 1], [3, 7], [12, 11], [12, 1]],
      [[1, 2], [5, 11], [11, 7], [8, 2]],
      [[4, 1], [1, 9], [13, 9], [8, 1]]
    ];
    let pi = 0, Q = PRE[0].map((p) => p.slice());
    btn(c, '换一个四边形', () => { pi = (pi + 1) % PRE.length; Q = PRE[pi].map((p) => p.slice()); draw(); }, 'alt');
    const X = (x) => ox + x * u, Y = (y) => oy + y * u;
    const NM = ['A', 'B', 'C', 'D'];
    const hs = NM.map((_, i) => {
      const h = S('circle', { r: 11, class: 'handle' }, top);
      dragOn(svg, h, (p) => {
        Q[i] = [Math.max(0, Math.min(15, Math.round((p.x - ox) / u))), Math.max(0, Math.min(11, Math.round((p.y - oy) / u)))];
        draw();
      });
      return h;
    });
    function convex() {
      let sg = 0;
      for (let i = 0; i < 4; i++) {
        const a = Q[i], b = Q[(i + 1) % 4], cc = Q[(i + 2) % 4];
        const cr = (b[0] - a[0]) * (cc[1] - b[1]) - (b[1] - a[1]) * (cc[0] - b[0]);
        if (Math.abs(cr) < 1e-9) return false;
        if (!sg) sg = Math.sign(cr); else if (Math.sign(cr) !== sg) return false;
      }
      return true;
    }
    function draw() {
      g.innerHTML = '';
      for (let i = 0; i <= 15; i++) for (let j = 0; j <= 11; j++) S('circle', { cx: X(i), cy: Y(j), r: 1.2, class: 'fmuted' }, g);
      const P = (q) => [X(q[0]), Y(q[1])];
      hs.forEach((h, i) => { h.setAttribute('cx', X(Q[i][0])); h.setAttribute('cy', Y(Q[i][1])); });
      NM.forEach((nm, i) => {
        const cc = cen(Q), d = [Q[i][0] - cc[0], Q[i][1] - cc[1]], L = Math.hypot(d[0], d[1]) || 1;
        T(g, X(Q[i][0]) + d[0] / L * 20, Y(Q[i][1]) + d[1] / L * 20 + 5, nm, 'tb');
      });
      if (!convex()) {
        S('polygon', { points: pts(Q.map(P)), class: 'fsurf2 sstrong' }, g);
        read.innerHTML = '现在不是一个“凸”的四边形（有一个角凹进去了，或三点在一条直线上），两条对角线不在里面相交。再拖一拖顶点。';
        return;
      }
      const O = lineX(Q[0], Q[2], Q[1], Q[3]);
      const R = [[Q[0], Q[1], O], [Q[1], Q[2], O], [Q[2], Q[3], O], [Q[3], Q[0], O]];
      const CL = ['f1s', 'f3s', 'f2s', 'f3s'];
      const ar = R.map((r) => polyArea(r));
      R.forEach((r, i) => S('polygon', { points: pts(r.map(P)), class: CL[i] }, g));
      S('polygon', { points: pts(Q.map(P)), class: 'fnone sstrong' }, g);
      S('line', { x1: P(Q[0])[0], y1: P(Q[0])[1], x2: P(Q[2])[0], y2: P(Q[2])[1], class: 'sstrong thin' }, g);
      S('line', { x1: P(Q[1])[0], y1: P(Q[1])[1], x2: P(Q[3])[0], y2: P(Q[3])[1], class: 'sstrong thin' }, g);
      R.forEach((r, i) => { const cc = cen(r); T(g, P(cc)[0], P(cc)[1] + 5, `S${i + 1}=${r2(ar[i])}`, 'ts tb'); });
      T(g, P(O)[0] + 10, P(O)[1] - 6, 'O', 'ts tb t2', 'start');
      const AO = Math.hypot(Q[0][0] - O[0], Q[0][1] - O[1]), OC = Math.hypot(Q[2][0] - O[0], Q[2][1] - O[1]);
      read.innerHTML = `对角线 AC、BD 交于 O，把四边形分成四块：<span class="k1">S1 = △AOB</span>、S2 = △BOC、<span class="k2">S3 = △COD</span>、S4 = △DOA。<br>` +
        `对角相乘：<span class="k1">S1</span> × <span class="k2">S3</span> = ${r2(ar[0])} × ${r2(ar[2])} = <b>${r2(ar[0] * ar[2])}</b>，S2 × S4 = ${r2(ar[1])} × ${r2(ar[3])} = <b>${r2(ar[1] * ar[3])}</b>，相等！` +
        `<br>为什么？S1 和 S2 同高（顶点 B），S1 ÷ S2 = AO ÷ OC = ${r2(AO / OC)}；S4 和 S3 也同高（顶点 D），S4 ÷ S3 也等于 AO ÷ OC。`;
    }
    draw();
  };

  // ═════════════════════ 立体图形计数 ═════════════════════

  // 大正方体切块染色（等轴测图）
  A.o_cube_paint = function (el) {
    const W = 420, Hh = 340;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const c2 = ctrl(el);
    let n = 3, ex = 0, cat = -1, busy = false;
    slider(c, 'cun', '每条棱切成几段 n', 2, 6, 1, n, (v) => { n = v; draw(); });
    const eb = btn(c, '拆开看看', () => {
      if (busy) return;
      busy = true;
      const from = ex, to = ex ? 0 : 1;
      tween(1000, (k) => { ex = lerp(from, to, k); draw(); }, () => { busy = false; ex = to; draw(); });
    });
    const NAMES = ['没有涂色', '一面涂色', '两面涂色', '三面涂色'];
    [3, 2, 1, 0].forEach((k) => btn(c2, NAMES[k], () => { cat = k; draw(); }, 'alt'));
    btn(c2, '全部显示', () => { cat = -1; draw(); }, 'alt');
    function painted(i, j, k) {
      return (i === 0) + (i === n - 1) + (j === 0) + (j === n - 1) + (k === 0) + (k === n - 1);
    }
    function draw() {
      g.innerHTML = '';
      const gap = 0.7 * ex, m = n + (n - 1) * gap, L = 150 / m;
      const ox = W / 2, oy = 172;
      const pr = (x, y, z) => [ox + (x - y) * L * 0.866, oy + (x + y) * L * 0.5 - z * L];
      const list = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) list.push([i, j, k]);
      list.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]));
      const cnt = [0, 0, 0, 0];
      list.forEach(([i, j, k]) => {
        const pc = painted(i, j, k);
        cnt[pc]++;
        const x = i * (1 + gap) - m / 2, y = j * (1 + gap) - m / 2, z = k * (1 + gap) - m / 2;
        const on = cat < 0 || cat === pc;
        const grp = S('g', { opacity: on ? 1 : 0.07 }, g);
        const top = [pr(x, y, z + 1), pr(x + 1, y, z + 1), pr(x + 1, y + 1, z + 1), pr(x, y + 1, z + 1)];
        const right = [pr(x + 1, y, z), pr(x + 1, y + 1, z), pr(x + 1, y + 1, z + 1), pr(x + 1, y, z + 1)];
        const left = [pr(x, y + 1, z), pr(x + 1, y + 1, z), pr(x + 1, y + 1, z + 1), pr(x, y + 1, z + 1)];
        const hl = cat >= 0 && on;
        S('polygon', { points: pts(top), class: (k === n - 1 ? 'f2' : 'fsurf') + (hl ? ' s1' : ' sstrong thin') }, grp);
        S('polygon', { points: pts(right), class: (i === n - 1 ? 'f2' : 'fsurf2') + (hl ? ' s1' : ' sstrong thin'), style: i === n - 1 ? 'fill-opacity:.8' : '' }, grp);
        S('polygon', { points: pts(left), class: (j === n - 1 ? 'f2' : 'fsurf2') + (hl ? ' s1' : ' sstrong thin'), style: j === n - 1 ? 'fill-opacity:.55' : '' }, grp);
      });
      const m2 = n - 2;
      const why = [
        `藏在最里面，一面也碰不到外面。去掉外面一层，里面是棱长 ${m2} 的小正方体：${m2} × ${m2} × ${m2} = <b>${cnt[0]}</b> 块。`,
        `在 6 个面的中间。每个面去掉一圈，剩下 ${m2} × ${m2} 块，6 个面：6 × ${m2} × ${m2} = <b>${cnt[1]}</b> 块。`,
        `在 12 条棱上，但不算两头的顶点。每条棱上 ${n} − 2 = ${m2} 块，12 条棱：12 × ${m2} = <b>${cnt[2]}</b> 块。`,
        `在 8 个顶点上，不管切成几段都是 <b>8</b> 块。`
      ];
      read.innerHTML = `把表面涂成橙色的大正方体，每条棱切成 ${n} 段，得到 ${n} × ${n} × ${n} = ${n * n * n} 个小正方体。<br>` +
        (cat >= 0 ? `<b>${NAMES[cat]}</b>的小正方体${why[cat]}${cat === 0 && !ex ? ' 点“拆开看看”能看见里面。' : ''}` :
          `三面 ${cnt[3]} + 两面 ${cnt[2]} + 一面 ${cnt[1]} + 没有 ${cnt[0]} = ${n * n * n}。点下面的按钮分类看。`);
      eb.textContent = ex > 0.5 ? '合起来' : '拆开看看';
    }
    draw();
  };

  // 一层一层数（长方体也行，可选底面不涂色）
  A.o_cube_layer = function (el) {
    const W = 440, Hh = 290;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const c2 = ctrl(el);
    let a = 4, b = 3, h = 3, lay = 0, bottom = true, busy = false;
    btn(c, '上一层', () => { if (!busy && lay < h - 1) { lay++; draw(); } });
    btn(c, '下一层', () => { if (!busy && lay > 0) { lay--; draw(); } });
    btn(c, '从上到下数一遍', () => {
      if (busy) return;
      busy = true;
      let i = h - 1;
      lay = i; draw();
      const step = () => {
        i--;
        if (i < 0) { busy = false; return; }
        tween(700, () => {}, () => { lay = i; draw(); step(); });
      };
      step();
    }, 'alt');
    const bb = btn(c, '底面不涂色', () => { bottom = !bottom; draw(); }, 'alt');
    slider(c2, 'cla', '长', 2, 6, 1, a, (v) => { a = v; draw(); });
    slider(c2, 'clb', '宽', 2, 6, 1, b, (v) => { b = v; draw(); });
    slider(c2, 'clh', '高', 2, 6, 1, h, (v) => { h = v; lay = Math.min(lay, h - 1); draw(); });
    const cntOf = (i, j, k) => (i === 0) + (i === a - 1) + (j === 0) + (j === b - 1) + (bottom && k === 0) + (k === h - 1);
    const FILL = ['fsurf', 'f3s', 'f2s', 'f1s'];
    function draw() {
      g.innerHTML = '';
      // 左边：侧面看，一层层
      const sw = 70, lh = Math.min(36, 220 / h), sx = 20, sy = 30 + (220 - lh * h);
      for (let k = 0; k < h; k++) {
        const y = sy + (h - 1 - k) * lh;
        S('rect', { x: sx, y, width: sw, height: lh - 3, class: (k === lay ? 'f2 s2' : 'fsurf2 sline'), style: k === lay ? 'fill-opacity:.5' : '' }, g);
        T(g, sx + sw / 2, y + lh / 2 + 3, `第 ${h - k} 层`, 'ts');
      }
      if (!bottom) T(g, sx + sw / 2, sy + h * lh + 14, '底面不涂', 'ts t2');
      // 右边：这一层的俯视图
      const cs = Math.min(44, 300 / a, 200 / b), gx = 120 + (300 - cs * a) / 2, gy = 20 + (220 - cs * b) / 2;
      const tl = [0, 0, 0, 0];
      for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) {
        const v = cntOf(i, j, lay);
        tl[v]++;
        S('rect', { x: gx + i * cs, y: gy + j * cs, width: cs, height: cs, class: FILL[v] + ' sstrong thin' }, g);
        T(g, gx + i * cs + cs / 2, gy + j * cs + cs / 2 + 5, String(v), 'tb');
      }
      T(g, gx + cs * a / 2, gy + cs * b + 22, `第 ${h - lay} 层（从上往下数）：格子里的数 = 这块有几面涂色`, 'ts tm');
      const tot = [0, 0, 0, 0];
      for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) for (let k = 0; k < h; k++) tot[cntOf(i, j, k)]++;
      const a2 = a - 2, b2 = b - 2, h2 = h - 2;
      read.innerHTML = `长 ${a}、宽 ${b}、高 ${h} 的长方体，表面涂色后切成 ${a * b * h} 个小正方体（${bottom ? '六个面都涂' : '<b>底面不涂</b>'}）。<br>` +
        `这一层：三面 ${tl[3]}，两面 ${tl[2]}，一面 ${tl[1]}，没有 ${tl[0]}。<br>` +
        `整个长方体：<span class="k1">三面 ${tot[3]}</span>，<span class="k2">两面 ${tot[2]}</span>，<span class="k3">一面 ${tot[1]}</span>，没有 ${tot[0]}。` +
        (bottom ? `<br>公式：三面 8；两面 4 × (${a2} + ${b2} + ${h2}) = ${4 * (a2 + b2 + h2)}；一面 2 × (${a2}×${b2} + ${a2}×${h2} + ${b2}×${h2}) = ${2 * (a2 * b2 + a2 * h2 + b2 * h2)}；没有 ${a2}×${b2}×${h2} = ${a2 * b2 * h2}。` : '<br>底面不涂时，最下面一层的块少了一面颜色：别直接套公式，一层一层数最稳。');
      bb.textContent = bottom ? '底面不涂色' : '六个面都涂色';
    }
    draw();
  };

  // ═════════════════════ 圆的组合图形 ═════════════════════

  // 加一块、减一块
  A.o_circle_area_steps = function (el) {
    const W = 440, Hh = 300;
    const svg = stage(el, W, Hh);
    const base = S('g', {}, svg);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const sel = H('select', { class: 'anim-input', style: 'width:auto' }, row);
    [['corner', '正方形里去掉四分之一圆'], ['bow', '弓形'], ['leaf', '树叶形（两个弓形）'], ['ring', '圆里去掉正方形'], ['moon', '两个月牙']].forEach(([v, t]) => H('option', { value: v }, sel, t));
    const c = ctrl(el);
    let shape = 'corner', r = 4, step = 0, busy = false, anim = 1;
    btn(c, '下一步', () => {
      if (busy) return;
      const sp = steps();
      if (step >= sp.length) return;
      busy = true; step++; anim = 0;
      tween(900, (k) => { anim = k; draw(); }, () => { busy = false; anim = 1; draw(); });
    });
    btn(c, '重新开始', () => { if (!busy) { step = 0; draw(); } }, 'alt');
    slider(c, 'car', '边长/半径', 2, 10, 1, r, (v) => { r = v; draw(); });
    sel.addEventListener('change', () => { if (busy) return; shape = sel.value; step = 0; draw(); });
    const SZ = 200, ox = 120, oy = 50;
    const path = (P) => 'M' + P.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' Z';
    function geo() {
      if (shape === 'moon') {
        const u = 300 / 5, Ax = 70, Ay = 250;
        const Ap = [Ax, Ay], Bp = [Ax + 5 * u, Ay], Cp = [Ax + 1.8 * u, Ay - 2.4 * u];
        const semi = (P, Q, away) => {
          const M = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], rr = Math.hypot(P[0] - Q[0], P[1] - Q[1]) / 2;
          const a0 = Math.atan2(P[1] - M[1], P[0] - M[0]);
          const c1 = arcPts(M[0], M[1], rr, a0, a0 + PI), c2 = arcPts(M[0], M[1], rr, a0, a0 - PI);
          const mid1 = c1[20], d1 = Math.hypot(mid1[0] - away[0], mid1[1] - away[1]);
          const mid2 = c2[20], d2 = Math.hypot(mid2[0] - away[0], mid2[1] - away[1]);
          return d1 > d2 ? c1 : c2;
        };
        return { Ap, Bp, Cp, tri: [Ap, Bp, Cp], sA: semi(Ap, Cp, Bp), sB: semi(Cp, Bp, Ap), big: semi(Ap, Bp, [Ax + 2.5 * u, Ay + 50]) };
      }
      if (shape === 'ring') {
        const R = 100, cx = ox + SZ / 2, cy = oy + SZ / 2 + 10;
        return { cx, cy, R, circ: arcPts(cx, cy, R, 0, 2 * PI, 80), sq: [[cx + R, cy], [cx, cy + R], [cx - R, cy], [cx, cy - R]] };
      }
      const sq = [[ox, oy], [ox + SZ, oy], [ox + SZ, oy + SZ], [ox, oy + SZ]];
      const sector = [[ox, oy + SZ]].concat(arcPts(ox, oy + SZ, SZ, -PI / 2, 0));
      const bow = arcPts(ox, oy + SZ, SZ, -PI / 2, 0);
      return { sq, sector, bow, tri: [[ox, oy + SZ], [ox, oy], [ox + SZ, oy + SZ]] };
    }
    function steps() {
      const G = geo();
      const q = 3.14 * r * r / 4;
      if (shape === 'corner') return [
        { op: 'add', P: G.sq, txt: `加：正方形 ${r} × ${r} = ${r * r}` },
        { op: 'cut', P: G.sector, txt: `减：四分之一圆 3.14 × ${r} × ${r} ÷ 4 = ${nf(q)}` }
      ];
      if (shape === 'bow' || shape === 'leaf') {
        const s = [
          { op: 'add', P: G.sector, txt: `加：四分之一圆（扇形）3.14 × ${r} × ${r} ÷ 4 = ${nf(q)}` },
          { op: 'cut', P: G.tri, txt: `减：三角形 ${r} × ${r} ÷ 2 = ${nf(r * r / 2)}` }
        ];
        if (shape === 'leaf') s.push({ op: 'copy', P: G.bow, txt: `把弓形转半圈复制一个：树叶 = 2 个弓形` });
        return s;
      }
      if (shape === 'ring') return [
        { op: 'add', P: G.circ, txt: `加：圆 3.14 × ${r} × ${r} = ${nf(3.14 * r * r)}` },
        { op: 'cut', P: G.sq, txt: `减：正方形，两条对角线都是 ${2 * r}，面积 = ${2 * r} × ${2 * r} ÷ 2 = ${2 * r * r}` }
      ];
      const k = r / 2; // 月牙：直角边 3k、4k，斜边 5k
      return [
        { op: 'add', P: G.tri, txt: `加：直角三角形 ${3 * k} × ${4 * k} ÷ 2 = ${6 * k * k}` },
        { op: 'add', P: G.sA, txt: `加：直角边 ${3 * k} 上的半圆 3.14 × ${nf(1.5 * k)} × ${nf(1.5 * k)} ÷ 2 = ${nf(3.14 * 2.25 * k * k / 2)}` },
        { op: 'add', P: G.sB, txt: `加：直角边 ${4 * k} 上的半圆 3.14 × ${2 * k} × ${2 * k} ÷ 2 = ${nf(3.14 * 4 * k * k / 2)}` },
        { op: 'cut', P: G.big, txt: `减：斜边 ${5 * k} 上的半圆 3.14 × ${nf(2.5 * k)} × ${nf(2.5 * k)} ÷ 2 = ${nf(3.14 * 6.25 * k * k / 2)}` }
      ];
    }
    function result() {
      const q = 3.14 * r * r / 4;
      if (shape === 'corner') return `阴影 = ${r * r} − ${nf(q)} = <b>${nf(r * r - q)}</b>`;
      if (shape === 'bow') return `弓形 = ${nf(q)} − ${nf(r * r / 2)} = <b>${nf(q - r * r / 2)}</b>`;
      if (shape === 'leaf') return `树叶 = (${nf(q)} − ${nf(r * r / 2)}) × 2 = <b>${nf((q - r * r / 2) * 2)}</b>`;
      if (shape === 'ring') return `阴影 = ${nf(3.14 * r * r)} − ${2 * r * r} = <b>${nf(1.14 * r * r)}</b>`;
      const k = r / 2;
      return `两个月牙 = ${6 * k * k} + ${nf(3.5325 * k * k)} + ${nf(6.28 * k * k)} − ${nf(9.8125 * k * k)} = <b>${6 * k * k}</b>，正好等于三角形的面积！`;
    }
    function draw() {
      base.innerHTML = ''; g.innerHTML = '';
      const G = geo(), sp = steps();
      // 底图轮廓
      if (shape === 'moon') {
        [G.tri, G.sA, G.sB, G.big].forEach((P) => S('path', { d: path(P), class: 'fnone smuted' }, base));
        T(base, G.Ap[0] - 8, G.Ap[1] + 16, 'A', 'tb'); T(base, G.Bp[0] + 8, G.Bp[1] + 16, 'B', 'tb'); T(base, G.Cp[0], G.Cp[1] + 22, 'C', 'tb');
        T(base, 30, 24, `直角边 ${nf(1.5 * r)}、${2 * r}，斜边 ${nf(2.5 * r)}`, 'ts tm', 'start');
      } else if (shape === 'ring') {
        S('path', { d: path(G.circ), class: 'fnone smuted' }, base);
        S('path', { d: path(G.sq), class: 'fnone smuted' }, base);
        S('line', { x1: G.cx, y1: G.cy, x2: G.cx + G.R, y2: G.cy, class: 'smuted dash' }, base);
        T(base, G.cx + G.R / 2, G.cy - 6, `r = ${r}`, 'ts');
      } else {
        S('path', { d: path(G.sq), class: 'fnone smuted' }, base);
        S('path', { d: path(G.sector), class: 'fnone smuted dash' }, base);
        if (shape === 'leaf') S('path', { d: path([[ox + SZ, oy]].concat(arcPts(ox + SZ, oy, SZ, PI / 2, PI))), class: 'fnone smuted dash' }, base);
        T(base, ox + SZ / 2, oy + SZ + 22, `正方形边长 ${r}`, 'ts');
      }
      for (let i = 0; i < step; i++) {
        const s = sp[i], k = i === step - 1 ? anim : 1;
        if (s.op === 'add') S('path', { d: path(s.P), class: 'f1s s1', opacity: k }, g);
        else if (s.op === 'cut') S('path', { d: path(s.P), class: 'fsurf sstrong dash', transform: `translate(${(1 - k) * 160},0)`, opacity: Math.min(1, k * 2) }, g);
        else S('path', { d: path(s.P), class: 'f1s s1', transform: `rotate(${180 * k} ${ox + SZ / 2} ${oy + SZ / 2})` }, g);
      }
      const done = sp.slice(0, step).map((s) => s.txt);
      read.innerHTML = (step === 0 ? '先认一认图形，然后点“下一步”：加一块、减一块。（π 取 3.14）' : done.join('<br>')) +
        (step === sp.length ? '<br>' + result() : '');
    }
    draw();
  };

  // 四个半圆组成的花瓣
  A.o_circle_area_petal = function (el) {
    const W = 420, Hh = 300;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 4, step = 0, busy = false, anim = 1, bows = false;
    btn(c, '下一步', () => {
      if (busy || step >= 5) return;
      busy = true; step++; anim = 0;
      tween(800, (k) => { anim = k; draw(); }, () => { busy = false; anim = 1; draw(); });
    });
    btn(c, '重新开始', () => { if (!busy) { step = 0; bows = false; draw(); } }, 'alt');
    btn(c, '看成 8 个弓形', () => { if (!busy) { step = 5; bows = !bows; draw(); } }, 'alt');
    slider(c, 'cpa', '正方形边长', 2, 10, 2, a, (v) => { a = v; draw(); });
    const SZ = 220, ox = 100, oy = 30, h = SZ / 2, ccx = ox + h, ccy = oy + h;
    const path = (P) => 'M' + P.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' Z';
    const SEMI = [
      arcPts(ox + h, oy, h, 0, PI), arcPts(ox + SZ, oy + h, h, PI / 2, 1.5 * PI),
      arcPts(ox + h, oy + SZ, h, PI, 2 * PI), arcPts(ox, oy + h, h, -PI / 2, PI / 2)
    ];
    const petal0 = arcPts(ox + h, oy, h, PI, PI / 2, 24).concat(arcPts(ox, oy + h, h, 0, -PI / 2, 24));
    const rot = (P, k) => P.map((p) => {
      const dx = p[0] - ccx, dy = p[1] - ccy, cs = Math.cos(k * PI / 2), sn = Math.sin(k * PI / 2);
      return [ccx + dx * cs - dy * sn, ccy + dx * sn + dy * cs];
    });
    function draw() {
      g.innerHTML = '';
      S('rect', { x: ox, y: oy, width: SZ, height: SZ, class: 'fnone sstrong' }, g);
      SEMI.forEach((P) => S('path', { d: path(P), class: 'fnone smuted dash' }, g));
      const shown = Math.min(step, 4);
      for (let i = 0; i < shown; i++) {
        const k = i === step - 1 ? anim : 1;
        S('path', { d: path(SEMI[i]), class: 's1 thin', style: `fill: var(--a1); fill-opacity:${0.28 * k * (step === 5 ? 1 - anim : 1)}` }, g);
      }
      if (step === 5) {
        for (let k = 0; k < 4; k++) S('path', { d: path(rot(petal0, k)), class: 'f2s s2', opacity: anim }, g);
        if (bows) {
          for (let k = 0; k < 4; k++) {
            const P = rot([[ox, oy], [ccx, ccy]], k);
            S('line', { x1: P[0][0], y1: P[0][1], x2: P[1][0], y2: P[1][1], class: 'sstrong dash' }, g);
          }
        }
      }
      T(g, ox + h, oy + SZ + 22, `正方形边长 ${a}，半圆直径 ${a}、半径 ${nf(a / 2)}`, 'ts');
      const rr = a / 2, semi = 3.14 * rr * rr / 2;
      const lines = [
        '正方形里，以每条边为直径向里画半圆。四个半圆叠在一起，中间形成四片花瓣。点“下一步”一个个放进去。（π 取 3.14）',
        `第 1 个半圆：3.14 × ${nf(rr)} × ${nf(rr)} ÷ 2 = ${nf(semi)}`,
        '第 2 个半圆：和第 1 个有一片重叠，颜色变深的地方被算了两次。',
        '第 3 个半圆：又多了一片深色的花瓣。',
        `第 4 个半圆放好：4 个半圆刚好铺满正方形，花瓣（深色）都被算了两次。4 个半圆 = 2 个圆 = 2 × 3.14 × ${nf(rr)} × ${nf(rr)} = ${nf(4 * semi)}。`,
        `4 个半圆的面积 = 正方形 + 花瓣（多算的那一次）。所以 花瓣 = ${nf(4 * semi)} − ${a} × ${a} = <b>${nf(4 * semi - a * a)}</b>。`
      ];
      read.innerHTML = lines[step] + (step === 5 && bows ? `<br>另一种看法：虚线把每片花瓣分成 2 个弓形，共 8 个。每个弓形 = 四分之一圆 − 三角形 = 3.14 × ${nf(rr)} × ${nf(rr)} ÷ 4 − ${nf(rr)} × ${nf(rr)} ÷ 2 = ${nf(3.14 * rr * rr / 4 - rr * rr / 2)}，8 个一共 ${nf(8 * (3.14 * rr * rr / 4 - rr * rr / 2))}，结果一样。` : '');
    }
    draw();
  };

  // ═════════════════════ 格点与面积 ═════════════════════

  function lattice(g, X, Y, nx, ny) {
    for (let i = 0; i <= nx; i++) S('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(ny), class: 'gridl' }, g);
    for (let j = 0; j <= ny; j++) S('line', { x1: X(0), x2: X(nx), y1: Y(j), y2: Y(j), class: 'gridl' }, g);
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) S('circle', { cx: X(i), cy: Y(j), r: 2, class: 'fmuted' }, g);
  }
  function selfCross(P) {
    const n = P.length;
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      const a = P[i], b = P[(i + 1) % n], cc = P[j], d = P[(j + 1) % n];
      const d1 = cr(a, b, cc), d2 = cr(a, b, d), d3 = cr(cc, d, a), d4 = cr(cc, d, b);
      if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
    }
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (P[i][0] === P[j][0] && P[i][1] === P[j][1]) return true;
    return false;
  }
  function pickCount(P) {
    const onB = new Set(), bList = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], k = gcd(dx, dy);
      for (let s = 0; s < k; s++) {
        const p = [a[0] + dx / k * s, a[1] + dy / k * s], key = p.join(',');
        if (!onB.has(key)) { onB.add(key); bList.push(p); }
      }
    }
    const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]), iList = [];
    for (let x = Math.min(...xs); x <= Math.max(...xs); x++) for (let y = Math.min(...ys); y <= Math.max(...ys); y++) {
      if (onB.has(x + ',' + y)) continue;
      let inside = false;
      for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const a = P[i], b = P[j];
        if ((a[1] > y) !== (b[1] > y) && x < a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1])) inside = !inside;
      }
      if (inside) iList.push([x, y]);
    }
    return { bList, iList };
  }

  // 皮克定理：拖顶点，数点
  A.o_grid_pick = function (el) {
    const W = 420, Hh = 330, u = 36, nx = 10, ny = 8, ox = 30, oy = 20;
    const svg = stage(el, W, Hh);
    const bg = S('g', {}, svg);
    const g = S('g', {}, svg);
    const top = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const X = (x) => ox + x * u, Y = (y) => oy + (ny - y) * u;
    lattice(bg, X, Y, nx, ny);
    const PRE = {
      3: [[1, 1], [8, 2], [4, 7]],
      4: [[1, 2], [6, 1], [9, 5], [3, 7]],
      5: [[2, 1], [7, 1], [9, 4], [5, 7], [1, 5]]
    };
    let P = PRE[3].map((p) => p.slice()), shown = -1, busy = false, hs = [];
    btn(c, '三角形', () => setP(3), 'alt');
    btn(c, '四边形', () => setP(4), 'alt');
    btn(c, '五边形', () => setP(5), 'alt');
    btn(c, '一个一个数', () => {
      if (busy) return;
      if (selfCross(P)) return;
      const { bList, iList } = pickCount(P);
      const tot = bList.length + iList.length;
      busy = true;
      tween(Math.min(4000, 150 * tot + 400), (k, raw) => { shown = Math.floor(raw * tot); draw(); }, () => { busy = false; shown = -1; draw(); });
    });
    function setP(n) { if (busy) return; P = PRE[n].map((p) => p.slice()); makeHandles(); draw(); }
    function makeHandles() {
      top.innerHTML = '';
      hs = P.map((_, i) => {
        const h = S('circle', { r: 12, class: 'handle' }, top);
        dragOn(svg, h, (p) => {
          P[i] = [Math.max(0, Math.min(nx, Math.round((p.x - ox) / u))), Math.max(0, Math.min(ny, Math.round(ny - (p.y - oy) / u)))];
          draw();
        }, () => !busy);
        return h;
      });
    }
    function draw() {
      g.innerHTML = '';
      const SP = P.map((p) => [X(p[0]), Y(p[1])]);
      hs.forEach((h, i) => { h.setAttribute('cx', SP[i][0]); h.setAttribute('cy', SP[i][1]); });
      if (selfCross(P)) {
        S('polygon', { points: pts(SP), class: 'fnone smuted dash' }, g);
        read.innerHTML = '边交叉了（或两个顶点重合了），这不是一个正常的多边形。拖一拖顶点。';
        return;
      }
      const ar = polyArea(P);
      S('polygon', { points: pts(SP), class: 'f1s s1', style: 'fill-opacity:.5' }, g);
      if (ar === 0) { read.innerHTML = '顶点都在一条直线上了，围不成图形。'; return; }
      const { bList, iList } = pickCount(P);
      const all = bList.map((p) => [p, 'b']).concat(iList.map((p) => [p, 'i']));
      all.forEach(([p, t], idx) => {
        const vis = shown < 0 || idx <= shown;
        if (!vis) return;
        S('circle', { cx: X(p[0]), cy: Y(p[1]), r: t === 'b' ? 6 : 5.5, class: t === 'b' ? 'f2 s2' : 'f1 s1' }, g);
        if (shown >= 0) T(g, X(p[0]) + 9, Y(p[1]) - 7, String(t === 'b' ? idx + 1 : idx - bList.length + 1), 'ts tb ' + (t === 'b' ? 't2' : 't1'), 'start');
      });
      const B = bList.length, N = iList.length;
      if (shown >= 0) {
        read.innerHTML = shown < B ? `先数<b>边上</b>的格点（橙色，顶点也算）：${Math.min(shown + 1, B)} 个……` : `再数<b>里面</b>的格点（蓝色）：${shown - B + 1} 个……`;
        return;
      }
      read.innerHTML = `边上的格点（橙，含顶点）<span class="k2"><i>b</i> = ${B}</span>，里面的格点（蓝）<span class="k1"><i>n</i> = ${N}</span>。<br>` +
        `皮克定理：面积 = <i>n</i> + <i>b</i> ÷ 2 − 1 = ${N} + ${B} ÷ 2 − 1 = <b>${nf(N + B / 2 - 1)}</b>；实际面积 = <b>${nf(ar)}</b>，${Math.abs(N + B / 2 - 1 - ar) < 1e-9 ? '一模一样！' : '不一样？再检查一下。'}`;
    }
    makeHandles();
    draw();
  };

  // 补形法：外框长方形减去直角三角形
  A.o_grid_box = function (el) {
    const W = 420, Hh = 330, u = 36, nx = 10, ny = 8, ox = 30, oy = 20;
    const svg = stage(el, W, Hh);
    const bg = S('g', {}, svg);
    const g = S('g', {}, svg);
    const top = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const X = (x) => ox + x * u, Y = (y) => oy + (ny - y) * u;
    lattice(bg, X, Y, nx, ny);
    const PRE = [[[1, 1], [7, 3], [3, 6]], [[2, 1], [8, 1], [5, 6]], [[1, 2], [8, 1], [9, 7]], [[2, 2], [9, 7], [6, 3]]];
    let pi = 0, P = PRE[0].map((p) => p.slice()), step = 0, busy = false, anim = 1;
    const nb = btn(c, '补成长方形', () => {
      if (busy) return;
      if (step >= 3) { step = 0; draw(); return; }
      busy = true; step++; anim = 0;
      tween(700, (k) => { anim = k; draw(); }, () => { busy = false; anim = 1; draw(); });
    });
    btn(c, '换一个三角形', () => { if (busy) return; pi = (pi + 1) % PRE.length; P = PRE[pi].map((p) => p.slice()); step = 0; draw(); }, 'alt');
    const hs = P.map((_, i) => {
      const h = S('circle', { r: 12, class: 'handle' }, top);
      dragOn(svg, h, (p) => {
        P[i] = [Math.max(0, Math.min(nx, Math.round((p.x - ox) / u))), Math.max(0, Math.min(ny, Math.round(ny - (p.y - oy) / u)))];
        step = 0; draw();
      }, () => !busy);
      return h;
    });
    function pieces() {
      const x0 = Math.min(...P.map((p) => p[0])), x1 = Math.max(...P.map((p) => p[0]));
      const y0 = Math.min(...P.map((p) => p[1])), y1 = Math.max(...P.map((p) => p[1]));
      const out = [];
      const side = (a, b, p) => Math.sign((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]));
      const corners = [];
      for (let i = 0; i < 3; i++) {
        const a = P[i], b = P[(i + 1) % 3], o = P[(i + 2) % 3];
        if (a[0] === b[0] || a[1] === b[1]) { corners.push(null); continue; }
        const c1 = [a[0], b[1]], c2 = [b[0], a[1]];
        const cc = side(a, b, c1) !== side(a, b, o) ? c1 : c2;
        corners.push(cc);
        out.push({ P: [a, cc, b], w: Math.abs(b[0] - a[0]), h: Math.abs(b[1] - a[1]) });
      }
      // 有顶点在外框里面时，要再减一个小长方形
      P.forEach((v, i) => {
        if (v[0] > x0 && v[0] < x1 && v[1] > y0 && v[1] < y1) {
          const ca = corners[i], cb = corners[(i + 2) % 3];
          if (!ca || !cb) return;
          const qx = ca[0] === v[0] ? cb[0] : ca[0], qy = ca[1] === v[1] ? cb[1] : ca[1];
          out.push({ P: [v, [qx, v[1]], [qx, qy], [v[0], qy]], w: Math.abs(qx - v[0]), h: Math.abs(qy - v[1]), rect: true });
        }
      });
      return { x0, x1, y0, y1, out };
    }
    function draw() {
      g.innerHTML = '';
      const SP = P.map((p) => [X(p[0]), Y(p[1])]);
      hs.forEach((h, i) => { h.setAttribute('cx', SP[i][0]); h.setAttribute('cy', SP[i][1]); });
      const ar = polyArea(P);
      if (ar === 0) {
        S('polygon', { points: pts(SP), class: 'fnone smuted' }, g);
        read.innerHTML = '三个顶点在一条直线上，围不成三角形。拖一拖顶点。';
        nb.textContent = '补成长方形';
        return;
      }
      const { x0, x1, y0, y1, out } = pieces();
      const bw = x1 - x0, bh = y1 - y0;
      if (step >= 1) S('rect', { x: X(x0), y: Y(y1), width: bw * u, height: bh * u, class: 'fnone s2 thick dash', opacity: step === 1 ? anim : 1 }, g);
      const CL = ['f3s s3', 'f2s s2', 'f3s s3', 'f2s s2'];
      if (step >= 2) out.forEach((pc, i) => {
        S('polygon', { points: pts(pc.P.map((p) => [X(p[0]), Y(p[1])])), class: pc.rect ? 'fsurf2 sstrong' : CL[i % 4], opacity: step === 2 ? anim : 1 }, g);
        const cc = cen(pc.P);
        T(g, X(cc[0]), Y(cc[1]) + 5, pc.rect ? `${pc.w * pc.h}` : nf(pc.w * pc.h / 2), 'ts tb');
      });
      S('polygon', { points: pts(SP), class: step >= 3 ? 'f1s s1 thick' : 'f1s s1', style: step >= 2 && step < 3 ? 'fill-opacity:.3' : '' }, g);
      if (step >= 3) T(g, X(cen(P)[0]), Y(cen(P)[1]) + 6, nf(ar), 'tl tb t1');
      const sum = out.reduce((s, pc) => s + (pc.rect ? pc.w * pc.h : pc.w * pc.h / 2), 0);
      const terms = out.map((pc) => pc.rect ? `${pc.w}×${pc.h}` : `${pc.w}×${pc.h}÷2`).join(' + ');
      const msg = [
        '三角形的边是斜的，不能直接数格子。拖动顶点换一个三角形，然后点“补成长方形”。',
        `第 1 步：画一个刚好把三角形框住的长方形，长 ${bw}、宽 ${bh}，面积 ${bw} × ${bh} = ${bw * bh}。`,
        `第 2 步：长方形里多出来的部分是${out.some((p) => p.rect) ? '几个直角三角形和一个小长方形' : '几个直角三角形'}，它们的两条直角边都能数出来：${terms} = ${nf(sum)}。`,
        `第 3 步：三角形面积 = ${bw * bh} − ${nf(sum)} = <b>${nf(bw * bh - sum)}</b>。` + (Math.abs(bw * bh - sum - ar) < 1e-9 ? '' : '（这个形状要再分一分，换一个试试）')
      ];
      read.innerHTML = msg[step];
      nb.textContent = step >= 3 ? '重新来' : step === 0 ? '补成长方形' : '下一步';
    }
    draw();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
