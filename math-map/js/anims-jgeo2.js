// jgeo2 组动画：初中图形与几何（八、九年级）
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, grid, RM } = window.AH;
  const PI = Math.PI;
  const A = {};

  // ───────── 本组通用小工具 ─────────
  const R2D = 180 / PI, D2R = PI / 180;
  const pts = (arr) => arr.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const unit = (p, q) => { const d = dist(p, q) || 1; return [(q[0] - p[0]) / d, (q[1] - p[1]) / d]; };
  const cen = (arr) => [arr.reduce((s, p) => s + p[0], 0) / arr.length, arr.reduce((s, p) => s + p[1], 0) / arr.length];
  const f1 = (v) => fmt(Math.round(v * 10) / 10);
  const norm360 = (d) => ((d % 360) + 360) % 360;
  function line(parent, P, Q, cls) { return S('line', { x1: P[0], y1: P[1], x2: Q[0], y2: Q[1], class: cls }, parent); }
  function dot(parent, P, r, cls) { return S('circle', { cx: P[0], cy: P[1], r: r || 4, class: cls || 'fstrong' }, parent); }
  // ∠UVW 的度数（0～180）
  function angDeg(V, U, W) {
    const a = Math.atan2(U[1] - V[1], U[0] - V[0]), b = Math.atan2(W[1] - V[1], W[0] - V[0]);
    let d = Math.abs(a - b);
    if (d > PI) d = 2 * PI - d;
    return d * R2D;
  }
  function spanOf(V, U, W) {
    const a = Math.atan2(U[1] - V[1], U[0] - V[0]);
    let s = Math.atan2(W[1] - V[1], W[0] - V[0]) - a;
    while (s > PI) s -= 2 * PI;
    while (s < -PI) s += 2 * PI;
    return [a, s];
  }
  // 角的小扇形（较小的那个角）
  function wedgeD(V, U, W, r, closed) {
    const [a, s] = spanOf(V, U, W);
    const p0 = [V[0] + r * Math.cos(a), V[1] + r * Math.sin(a)];
    const p1 = [V[0] + r * Math.cos(a + s), V[1] + r * Math.sin(a + s)];
    const arc = `A${r},${r} 0 0 ${s > 0 ? 1 : 0} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
    return closed
      ? `M${V[0].toFixed(1)},${V[1].toFixed(1)} L${p0[0].toFixed(1)},${p0[1].toFixed(1)} ${arc} Z`
      : `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} ${arc}`;
  }
  function angPos(V, U, W, r) {
    const [a, s] = spanOf(V, U, W);
    const m = a + s / 2;
    return [V[0] + r * Math.cos(m), V[1] + r * Math.sin(m)];
  }
  // 直角记号
  function rightD(V, U, W, s) {
    const u = unit(V, U), w = unit(V, W);
    const p1 = [V[0] + u[0] * s, V[1] + u[1] * s], p2 = [p1[0] + w[0] * s, p1[1] + w[1] * s], p3 = [V[0] + w[0] * s, V[1] + w[1] * s];
    return `M${p1[0].toFixed(1)},${p1[1].toFixed(1)} L${p2[0].toFixed(1)},${p2[1].toFixed(1)} L${p3[0].toFixed(1)},${p3[1].toFixed(1)}`;
  }
  // 等长记号：在线段中点画 n 条短线
  function tickD(P, Q, n) {
    const m = mid(P, Q), u = unit(P, Q), nr = [-u[1], u[0]];
    let d = '';
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * 5;
      const c = [m[0] + u[0] * off, m[1] + u[1] * off];
      d += `M${(c[0] - nr[0] * 6).toFixed(1)},${(c[1] - nr[1] * 6).toFixed(1)} L${(c[0] + nr[0] * 6).toFixed(1)},${(c[1] + nr[1] * 6).toFixed(1)} `;
    }
    return d;
  }
  // 在点 P 外侧（远离 C 的方向）写标签
  function label(parent, P, C, text, cls, gap) {
    let u = unit(C, P);
    if (dist(C, P) < 1e-6) u = [0, -1];
    const g = gap || 16;
    return T(parent, P[0] + u[0] * g, P[1] + u[1] * g + 5, text, cls || 'vname');
  }
  function arrow(parent, P, Q, cls, fcls) {
    line(parent, P, Q, cls + ' round');
    const u = unit(P, Q), n = [-u[1], u[0]];
    const b = [Q[0] - u[0] * 11, Q[1] - u[1] * 11];
    S('polygon', { points: pts([Q, [b[0] + n[0] * 6, b[1] + n[1] * 6], [b[0] - n[0] * 6, b[1] - n[1] * 6]]), class: fcls }, parent);
  }
  function drag(svg, h, onMove, canStart) {
    h.addEventListener('pointerdown', (e) => {
      if (canStart && !canStart()) return;
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
  function setActive(btns, i) { btns.forEach((b, j) => { b.className = 'abtn' + (j === i ? '' : ' alt'); }); }
  function cci(P, r1, Q, r2) {
    const d = dist(P, Q);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
    const ux = (Q[0] - P[0]) / d, uy = (Q[1] - P[1]) / d;
    const mx = P[0] + a * ux, my = P[1] + a * uy;
    return [[mx - h * uy, my + h * ux], [mx + h * uy, my - h * ux]];
  }

  // ═════════ 平行四边形：拖动顶点看性质 ═════════
  A.g_quad_drag = function (el) {
    const W = 440, Hh = 300, U = 30;
    const svg = stage(el, W, Hh);
    const P = { a: [90, 235], b: [290, 235], d: [150, 85] };
    const quad = S('polygon', { class: 'tri' }, svg);
    const g = S('g', {}, svg);
    const hs = {};
    ['a', 'b', 'd'].forEach((k) => { hs[k] = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg); });
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const MODES = ['看对边', '看对角', '看对角线'];
    let mode = 0;
    const mb = MODES.map((name, i) => btn(c, name, () => { mode = i; render(); }));
    H('p', { class: 'anim-tip' }, el, '提示：拖动 A、B、D 三个顶点上的圆点改变形状，C 会自动跟着动，保证两组对边一直平行。');
    const cOf = () => [P.b[0] + P.d[0] - P.a[0], P.b[1] + P.d[1] - P.a[1]];
    function render() {
      setActive(mb, mode);
      const pa = P.a, pb = P.b, pd = P.d, pc = cOf(), O = mid(pa, pc);
      quad.setAttribute('points', pts([pa, pb, pc, pd]));
      g.innerHTML = '';
      const ab = dist(pa, pb) / U, ad = dist(pa, pd) / U;
      if (mode === 0) {
        [[pa, pb, 's1', 1, ab], [pd, pc, 's1', 1, ab], [pa, pd, 's2', 2, ad], [pb, pc, 's2', 2, ad]].forEach(([p, q, cls, n, v]) => {
          line(g, p, q, cls + ' thick round');
          S('path', { d: tickD(p, q, n), class: cls + ' fnone' }, g);
          label(g, mid(p, q), O, f1(v), 'tb ' + (cls === 's1' ? 't1' : 't2'), 20);
        });
        read.innerHTML = `<span class="k1">AB = CD = ${f1(ab)}</span>，<span class="k2">AD = BC = ${f1(ad)}</span>。怎么拖都一样：平行四边形的<b>两组对边分别相等</b>（也分别平行）。`;
      } else if (mode === 1) {
        const r = clamp(Math.min(ab, ad) * U * 0.28, 16, 30);
        const degA = Math.round(angDeg(pa, pb, pd)), degB = 180 - degA;
        [[pa, pb, pd, 'f1s s1 thin', 't1', degA], [pc, pd, pb, 'f1s s1 thin', 't1', degA],
          [pb, pc, pa, 'f2s s2 thin', 't2', degB], [pd, pa, pc, 'f2s s2 thin', 't2', degB]].forEach(([v, u, w, cls, tc, deg]) => {
          S('path', { d: wedgeD(v, u, w, r, true), class: cls }, g);
          const lp = angPos(v, u, w, r + 16);
          T(g, lp[0], lp[1] + 5, deg + '°', 'tb ts ' + tc);
        });
        read.innerHTML = `<span class="k1">∠A = ∠C = ${degA}°</span>，<span class="k2">∠B = ∠D = ${degB}°</span>。平行四边形的<b>对角相等</b>；相邻两个角加起来是 180°（因为 AD ∥ BC，同旁内角互补）。`;
      } else {
        line(g, pa, pc, 's1'); line(g, pb, pd, 's2');
        S('path', { d: tickD(pa, O, 1) + tickD(O, pc, 1), class: 's1 fnone' }, g);
        S('path', { d: tickD(pb, O, 2) + tickD(O, pd, 2), class: 's2 fnone' }, g);
        dot(g, O, 4);
        T(g, O[0], O[1] + 22, 'O', 'vname');
        read.innerHTML = `<span class="k1">OA = OC = ${f1(dist(pa, O) / U)}</span>，<span class="k2">OB = OD = ${f1(dist(pb, O) / U)}</span>。两条对角线互相把对方分成相等的两半：<b>对角线互相平分</b>。`;
      }
      [['A', pa], ['B', pb], ['C', pc], ['D', pd]].forEach(([n, p]) => label(g, p, O, n, 'vname', 22));
      ['a', 'b', 'd'].forEach((k) => { hs[k].setAttribute('cx', P[k][0]); hs[k].setAttribute('cy', P[k][1]); });
    }
    ['a', 'b', 'd'].forEach((k) => drag(svg, hs[k], (p) => {
      const old = P[k];
      P[k] = [clamp(p.x, 20, W - 20), clamp(p.y, 20, Hh - 20)];
      const pc = cOf();
      const cr = (P.b[0] - P.a[0]) * (P.d[1] - P.a[1]) - (P.b[1] - P.a[1]) * (P.d[0] - P.a[0]);
      if (pc[0] < 20 || pc[0] > W - 20 || pc[1] < 20 || pc[1] > Hh - 20 || cr > -3000 || dist(P.a, P.b) < 50 || dist(P.a, P.d) < 50) { P[k] = old; return; }
      render();
    }));
    render();
  };

  // ═════════ 平行四边形：对角线互相平分 → 平行四边形 ═════════
  A.g_quad_diag = function (el) {
    const W = 440, Hh = 310, U = 20, O = [220, 155];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let th = 60, ac = 10, bd = 8, half = true, busy = false;
    const sT = slider(c, 'qdt', '夹角', 20, 160, 5, th, (v) => { if (busy) { sT.set(Math.round(th)); return; } th = v; render(); });
    slider(c, 'qda', 'AC', 4, 12, 1, ac, (v) => { ac = v; render(); });
    slider(c, 'qdb', 'BD', 4, 10, 1, bd, (v) => { bd = v; render(); });
    const c2 = ctrl(el);
    const hb = btn(c2, '让 O 不再是 BD 的中点', () => {
      half = !half;
      hb.textContent = half ? '让 O 不再是 BD 的中点' : '让 O 回到 BD 的中点';
      render();
    }, 'alt');
    btn(c2, '转动一根木棒', () => {
      if (busy) return;
      busy = true;
      tween(2200, (t) => { th = lerp(20, 160, t); render(); }, () => { th = 160; sT.set(160); busy = false; render(); });
    });
    H('p', { class: 'anim-tip' }, el, '想象两根木棒 AC、BD 在 O 点钉在一起：拖动滑块改变夹角和木棒长度。');
    function render() {
      g.innerHTML = '';
      const r = th * D2R, a = ac * U / 2, b = bd * U / 2;
      const w = [Math.cos(r), -Math.sin(r)];
      const b1 = half ? b : b * 0.6, b2 = half ? b : b * 1.4;
      const pa = [O[0] - a, O[1]], pc = [O[0] + a, O[1]];
      const pb = [O[0] - w[0] * b1, O[1] - w[1] * b1], pd = [O[0] + w[0] * b2, O[1] + w[1] * b2];
      S('polygon', { points: pts([pa, pb, pc, pd]), class: (half ? 'f3s' : 'fsurf2') + ' sstrong' }, g);
      line(g, pa, pc, 's1 thick round'); line(g, pb, pd, 's2 thick round');
      S('path', { d: tickD(pa, O, 1) + tickD(O, pc, 1), class: 's1 fnone' }, g);
      if (half) S('path', { d: tickD(pb, O, 2) + tickD(O, pd, 2), class: 's2 fnone' }, g);
      dot(g, O, 4);
      T(g, O[0] + 6, O[1] + 22, 'O', 'vname');
      [['A', pa], ['B', pb], ['C', pc], ['D', pd]].forEach(([n, p]) => label(g, p, O, n, 'vname', 18));
      const AB = dist(pa, pb) / U, BC = dist(pb, pc) / U, CD = dist(pc, pd) / U, DA = dist(pd, pa) / U;
      if (half) {
        read.innerHTML = `O 同时是两条对角线的中点：<span class="k1">OA = OC = ${f1(ac / 2)}</span>，<span class="k2">OB = OD = ${f1(bd / 2)}</span>。<br>连起来的四边形中 AB = CD = ${f1(AB)}，AD = BC = ${f1(BC)}，两组对边分别平行且相等，是<b>平行四边形</b>。<b>对角线互相平分的四边形是平行四边形。</b>`;
      } else {
        read.innerHTML = `OA = OC，但 <span class="k2">OB = ${f1(b1 / U)}，OD = ${f1(b2 / U)}</span>，对角线<b>没有互相平分</b>。<br>AB = ${f1(AB)}，CD = ${f1(CD)}，AD = ${f1(DA)}，BC = ${f1(BC)}；AB 与 CD 不平行，AD 与 BC 也不平行，ABCD <b>不是</b>平行四边形。`;
      }
    }
    render();
  };

  // ═════════ 特殊平行四边形：变身 ═════════
  A.g_special_morph = function (el) {
    const W = 440, Hh = 290, U = 30, AB = 5;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let ang = 60, ad = 3.5, busy = false;
    const sA = slider(c, 'spa', '∠A', 30, 90, 5, ang, (v) => { if (busy) { sA.set(ang); return; } ang = v; render(); });
    const sD = slider(c, 'spd', 'AD', 2, 7, 0.5, ad, (v) => { if (busy) { sD.set(ad); return; } ad = v; render(); });
    H('p', { class: 'anim-tip' }, el, 'AB 固定为 5。拖动滑块，或点下面的按钮让它“变身”。');
    const c2 = ctrl(el);
    function go(ta, td) {
      if (busy) return;
      busy = true;
      const a0 = ang, d0 = ad;
      tween(900, (t) => { ang = lerp(a0, ta, t); ad = lerp(d0, td, t); render(); }, () => {
        ang = ta; ad = td; sA.set(ta); sD.set(td); busy = false; render();
      });
    }
    btn(c2, '角变成 90°', () => go(90, ad));
    btn(c2, '邻边变相等', () => go(ang, AB));
    btn(c2, '两个都满足', () => go(90, AB));
    btn(c2, '回到一般平行四边形', () => go(60, 3.5), 'alt');
    function render() {
      g.innerHTML = '';
      const r = ang * D2R;
      const wd = (AB + ad * Math.cos(r)) * U, ht = ad * Math.sin(r) * U;
      const x0 = (W - wd) / 2, y0 = Hh / 2 + ht / 2 + 5;
      const pa = [x0, y0], pb = [x0 + AB * U, y0], pd = [x0 + ad * U * Math.cos(r), y0 - ad * U * Math.sin(r)];
      const pc = [pb[0] + pd[0] - pa[0], pb[1] + pd[1] - pa[1]], O = mid(pa, pc);
      const isR = Math.abs(ang - 90) < 1e-6, isH = Math.abs(ad - AB) < 1e-6, isS = isR && isH;
      S('polygon', { points: pts([pa, pb, pc, pd]), class: (isS ? 'f3s' : isR ? 'f1s' : isH ? 'f2s' : 'fsurf2') + ' sstrong' }, g);
      line(g, pa, pc, isR ? 's3 thick' : 'smuted dash');
      line(g, pb, pd, isR ? 's3 thick' : 'smuted dash');
      if (isR) [[pa, pb, pd], [pb, pc, pa], [pc, pd, pb], [pd, pa, pc]].forEach(([v, u, w]) => S('path', { d: rightD(v, u, w, 12), class: 'sstrong thin fnone' }, g));
      if (isH) S('path', { d: rightD(O, pa, pb, 11), class: 's2 fnone' }, g);
      const tk = isH ? [1, 1, 1, 1] : [1, 2, 1, 2];
      [[pa, pb], [pb, pc], [pc, pd], [pd, pa]].forEach(([p, q], i) => S('path', { d: tickD(p, q, tk[i]), class: 'sstrong thin fnone' }, g));
      dot(g, O, 3.5);
      [['A', pa], ['B', pb], ['C', pc], ['D', pd]].forEach(([n, p]) => label(g, p, O, n, 'vname', 18));
      const acL = dist(pa, pc) / U, bdL = dist(pb, pd) / U, da = Math.round(angDeg(O, pa, pb));
      const base = `（现在 AC = ${f1(acL)}，BD = ${f1(bdL)}，对角线夹角 ${da}°）`;
      if (isS) read.innerHTML = `<b>正方形</b>：既是矩形，又是菱形。四个角都是直角，四条边都相等；对角线<span class="k3">相等</span>、<span class="k2">互相垂直</span>、互相平分，并且每条对角线平分一组对角。${base}`;
      else if (isR) read.innerHTML = `<b>矩形</b>（有一个角是 90° 的平行四边形）。比平行四边形多出来的性质：四个角都是直角，<span class="k3">对角线相等</span>。${base}`;
      else if (isH) read.innerHTML = `<b>菱形</b>（邻边 AB = AD 的平行四边形）。比平行四边形多出来的性质：四条边都相等，<span class="k2">对角线互相垂直</span>，每条对角线平分一组对角。${base}`;
      else read.innerHTML = `一般的<b>平行四边形</b>：对边相等、对角相等、对角线互相平分，但对角线既不相等也不垂直。${base}<br>试着把 ∠A 拖到 90°，或者把 AD 拖到 5。`;
    }
    render();
  };

  // ═════════ 特殊平行四边形：中点四边形 ═════════
  A.g_special_midquad = function (el) {
    const W = 440, Hh = 300, U = 20;
    const svg = stage(el, W, Hh);
    const PRE = {
      gen: [[90, 250], [350, 235], [300, 70], [140, 95]],
      eq: [[100, 240], [340, 240], [290, 90], [150, 90]],
      perp: [[220, 265], [330, 150], [220, 45], [160, 150]],
      both: [[220, 265], [330, 150], [220, 45], [110, 150]]
    };
    let Q = PRE.gen.map((p) => p.slice()), busy = false;
    const g = S('g', {}, svg);
    const hs = Q.map(() => S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const go = (key) => {
      if (busy) return;
      busy = true;
      const from = Q.map((p) => p.slice()), to = PRE[key];
      tween(900, (t) => { Q = from.map((p, i) => [lerp(p[0], to[i][0], t), lerp(p[1], to[i][1], t)]); render(); },
        () => { Q = to.map((p) => p.slice()); busy = false; render(); });
    };
    btn(c, '对角线相等', () => go('eq'), 'alt');
    btn(c, '对角线垂直', () => go('perp'), 'alt');
    btn(c, '相等且垂直', () => go('both'), 'alt');
    btn(c, '一般四边形', () => go('gen'), 'alt');
    H('p', { class: 'anim-tip' }, el, '拖动 A、B、C、D 四个顶点。橙色区域是顺次连接四边中点得到的“中点四边形” EFGH。');
    function render() {
      g.innerHTML = '';
      const [pa, pb, pc, pd] = Q;
      const ctr = cen(Q);
      S('polygon', { points: pts(Q), class: 'fnone sstrong' }, g);
      line(g, pa, pc, 's1 dash thin'); line(g, pb, pd, 's3 dash thin');
      const E = mid(pa, pb), F = mid(pb, pc), G = mid(pc, pd), Hm = mid(pd, pa);
      S('polygon', { points: pts([E, F, G, Hm]), class: 'f2s' }, g);
      line(g, E, F, 's1 thick round'); line(g, Hm, G, 's1 thick round');
      line(g, F, G, 's3 thick round'); line(g, E, Hm, 's3 thick round');
      [E, F, G, Hm].forEach((p) => dot(g, p, 4, 'f2'));
      [['E', E], ['F', F], ['G', G], ['H', Hm]].forEach(([n, p]) => label(g, p, ctr, n, 'vname ts', 14));
      [['A', pa], ['B', pb], ['C', pc], ['D', pd]].forEach(([n, p]) => label(g, p, ctr, n, 'vname', 20));
      hs.forEach((h, i) => { h.setAttribute('cx', Q[i][0]); h.setAttribute('cy', Q[i][1]); });
      const ac = dist(pa, pc) / U, bd = dist(pb, pd) / U;
      const u = unit(pa, pc), v = unit(pb, pd);
      const da = Math.acos(clamp(Math.abs(u[0] * v[0] + u[1] * v[1]), 0, 1)) * R2D;
      const eq = Math.abs(ac - bd) / Math.max(ac, bd) < 0.03, perp = Math.abs(da - 90) < 2;
      const type = eq && perp ? '正方形' : eq ? '菱形' : perp ? '矩形' : '平行四边形';
      const why = eq && perp ? '原四边形的对角线相等且垂直 → EFGH 的邻边相等且垂直'
        : eq ? '原四边形的对角线相等 → EFGH 的邻边相等'
          : perp ? '原四边形的对角线垂直 → EFGH 的邻边垂直'
            : '原四边形的对角线既不相等也不垂直';
      read.innerHTML = `由三角形中位线定理：<span class="k1">EF ∥ AC，HG ∥ AC，EF = HG = ½AC = ${f1(ac / 2)}</span>；<span class="k3">FG ∥ BD，EH ∥ BD，FG = EH = ½BD = ${f1(bd / 2)}</span>。所以 EFGH 一定是平行四边形。<br>AC = ${f1(ac)}，BD = ${f1(bd)}，两条对角线夹角约 ${Math.round(da)}°：${why}，EFGH 是<b>${type}</b>。`;
    }
    hs.forEach((h, i) => drag(svg, h, (p) => {
      const np = [clamp(p.x, 20, W - 20), clamp(p.y, 20, Hh - 20)];
      if (Q.some((q, j) => j !== i && dist(q, np) < 30)) return;
      Q[i] = np;
      render();
    }, () => !busy));
    render();
  };

  // ═════════ 旋转：绕可拖动的中心旋转 ═════════
  A.g_rotate_spin = function (el) {
    const W = 440, Hh = 330, U = 20;
    const svg = stage(el, W, Hh);
    const F = [[260, 120], [340, 150], [285, 185]];
    const NM = ['A', 'B', 'C'];
    let O = [210, 190], th = 90, cur = 90, busy = false;
    const g = S('g', {}, svg);
    const hO = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const sT = slider(c, 'rth', '角度', 0, 360, 5, th, (v) => { if (busy) { sT.set(th); return; } th = v; cur = v; render(); });
    btn(c, '播放旋转', () => play(0, th === 0 ? 90 : th));
    btn(c, '转到 180°（中心对称）', () => play(cur, 180), 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：拖动橙色圆点 O 换一个旋转中心。绿色虚线是每个顶点走过的路，它们都是以 O 为圆心的圆弧。');
    function play(from, to) {
      if (busy) return;
      busy = true;
      tween(Math.max(700, Math.abs(to - from) * 8), (t) => { cur = lerp(from, to, t); render(); }, () => {
        cur = th = to; sT.set(to); busy = false; render();
      });
    }
    // 屏幕上看是逆时针旋转
    const rot = (P, deg) => {
      const r = deg * D2R, dx = P[0] - O[0], dy = P[1] - O[1];
      return [O[0] + dx * Math.cos(r) + dy * Math.sin(r), O[1] - dx * Math.sin(r) + dy * Math.cos(r)];
    };
    const arcPath = (P, deg) => {
      let d = '';
      const n = Math.max(1, Math.ceil(deg / 3));
      for (let i = 0; i <= n; i++) {
        const q = rot(P, (deg * i) / n);
        d += (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1);
      }
      return d;
    };
    function render() {
      g.innerHTML = '';
      const img = F.map((p) => rot(p, cur));
      F.forEach((p, i) => {
        line(g, O, p, 'sline'); line(g, O, img[i], 'sline');
        if (cur > 0.5) S('path', { d: arcPath(p, cur), class: 'trail' }, g);
      });
      if (cur > 0.5) {
        const u = unit(O, F[0]);
        const p0 = [O[0] + u[0] * 26, O[1] + u[1] * 26];
        S('path', { d: `M${O[0]},${O[1]} ` + arcPath(p0, cur).replace('M', 'L') + ' Z', class: 'f2s s2 thin' }, g);
        const lp = rot([O[0] + u[0] * 46, O[1] + u[1] * 46], cur / 2);
        T(g, lp[0], lp[1] + 5, Math.round(cur) + '°', 'tb ts t2');
      }
      S('polygon', { points: pts(F), class: 'f1s s1', style: 'opacity:.55' }, g);
      S('polygon', { points: pts(img), class: 'f2s s2' }, g);
      const c0 = cen(F), c1 = cen(img);
      F.forEach((p, i) => {
        label(g, p, c0, NM[i], 'vname');
        if (Math.round(cur) % 360 !== 0) label(g, img[i], c1, NM[i] + '′', 'vname t2');
      });
      dot(g, O, 4);
      T(g, O[0] - 16, O[1] + 20, 'O', 'vname');
      hO.setAttribute('cx', O[0]); hO.setAttribute('cy', O[1]);
      const deg = Math.round(cur);
      if (deg % 360 === 0) {
        read.innerHTML = `旋转 ${deg}°，图形回到原来的位置。拖动滑块或点“播放旋转”。`;
        return;
      }
      let s = `绕点 O <b>逆时针</b>旋转 ${deg}°。<span class="k2">OA = OA′ = ${f1(dist(O, F[0]) / U)}</span>，OB = OB′，OC = OC′（对应点到旋转中心的距离相等）；∠AOA′ = ∠BOB′ = ∠COC′ = ${deg}°（都等于旋转角）。旋转前后两个三角形<b>全等</b>。`;
      if (deg === 180) s += '<br><b>旋转 180°，这就是中心对称：</b>A、O、A′ 在同一条直线上，O 是 AA′ 的中点（B、C 也一样）。';
      read.innerHTML = s;
    }
    drag(svg, hO, (p) => { O = [clamp(p.x, 40, W - 40), clamp(p.y, 40, Hh - 40)]; render(); }, () => !busy);
    render();
  };

  // ═════════ 旋转：坐标系中绕原点旋转 ═════════
  A.g_rotate_coord = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const gL = S('g', {}, svg);
    const hP = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let P = [3, 2], mode = 0, cur = 180, busy = false;
    const MODES = [[180, '绕原点转 180°'], [90, '逆时针转 90°'], [-90, '顺时针转 90°']];
    const mb = MODES.map(([deg, name], i) => btn(c, name, () => {
      if (busy) return;
      mode = i; busy = true;
      tween(1000, (t) => { cur = deg * t; render(); }, () => { cur = deg; busy = false; render(); });
    }));
    H('p', { class: 'anim-tip' }, el, '提示：拖动橙色的点 P（会自动对齐到格点），再点上面的按钮看它转到哪里。');
    const rotXY = (p, deg) => { const r = deg * D2R; return [p[0] * Math.cos(r) - p[1] * Math.sin(r), p[0] * Math.sin(r) + p[1] * Math.cos(r)]; };
    const px = (p) => [G.X(p[0]), G.Y(p[1])];
    function ptLabel(p, text, cls) {
      const q = px(p);
      T(gL, clamp(q[0], 48, size - 48), q[1] + (p[1] >= 0 ? -14 : 26), text, cls);
    }
    function render() {
      setActive(mb, mode);
      gL.innerHTML = '';
      const deg = MODES[mode][0];
      const Q = rotXY(P, cur), O = px([0, 0]);
      line(gL, O, px(P), 's2');
      line(gL, O, px(Q), 's1');
      let d = '';
      for (let i = 0; i <= 40; i++) {
        const q = px(rotXY(P, (cur * i) / 40));
        d += (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1);
      }
      S('path', { d, class: 'trail' }, gL);
      dot(gL, px(Q), 6, 'f1');
      const a = P[0], b = P[1];
      ptLabel(P, `P(${fmt(a)}, ${fmt(b)})`, 'tb ts t2');
      hP.setAttribute('cx', px(P)[0]); hP.setAttribute('cy', px(P)[1]);
      if (Math.abs(cur - deg) > 1e-6) { read.innerHTML = '正在旋转……'; return; }
      const q = [Math.round(Q[0]), Math.round(Q[1])];
      ptLabel(q, `P′(${fmt(q[0])}, ${fmt(q[1])})`, 'tb ts t1');
      if (deg === 180) read.innerHTML = `P(${fmt(a)}, ${fmt(b)}) 绕原点 O 旋转 180° 得到 <span class="k1">P′(${fmt(-a)}, ${fmt(-b)})</span>：<b>横、纵坐标都变成相反数</b>。P、O、P′ 在一条直线上，OP = OP′，P 和 P′ <b>关于原点对称</b>。`;
      else if (deg === 90) read.innerHTML = `P(${fmt(a)}, ${fmt(b)}) 绕原点逆时针旋转 90° 得到 <span class="k1">P′(${fmt(-b)}, ${fmt(a)})</span>。OP = OP′，并且 OP ⊥ OP′。规律：(<i>a</i>, <i>b</i>) → (−<i>b</i>, <i>a</i>)。（拓展内容，画图就能看出来，不用死记。）`;
      else read.innerHTML = `P(${fmt(a)}, ${fmt(b)}) 绕原点顺时针旋转 90° 得到 <span class="k1">P′(${fmt(b)}, ${fmt(-a)})</span>。OP = OP′，并且 OP ⊥ OP′。规律：(<i>a</i>, <i>b</i>) → (<i>b</i>, −<i>a</i>)。（拓展内容，画图就能看出来，不用死记。）`;
    }
    drag(svg, hP, (p) => {
      const x = clamp(Math.round((p.x - G.X(0)) / G.u), -5, 5);
      const y = clamp(Math.round((G.Y(0) - p.y) / G.u), -5, 5);
      if (x === 0 && y === 0) return;
      if (x === P[0] && y === P[1]) return;
      P = [x, y];
      cur = MODES[mode][0];
      render();
    }, () => !busy);
    render();
  };

  // ═════════ 圆：圆周角与圆心角 ═════════
  A.g_circle_angle = function (el) {
    const W = 440, Hh = 300, O = [220, 150], R = 115;
    const svg = stage(el, W, Hh);
    S('circle', { cx: O[0], cy: O[1], r: R, class: 'fnone sstrong' }, svg);
    const g = S('g', {}, svg);
    const NM = ['A', 'B', 'C'];
    let t = [210, 330, 100], busy = false;
    const hs = t.map(() => S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const pos = (d) => [O[0] + R * Math.cos(d * D2R), O[1] - R * Math.sin(d * D2R)];
    const arcPts = (start, span, rad) => {
      let d = '';
      const n = Math.max(2, Math.ceil(span / 3));
      for (let i = 0; i <= n; i++) {
        const a = (start + (span * i) / n) * D2R;
        d += (i ? 'L' : 'M') + (O[0] + rad * Math.cos(a)).toFixed(1) + ',' + (O[1] - rad * Math.sin(a)).toFixed(1);
      }
      return d;
    };
    function arcInfo() {
      const tt = t.map((v) => norm360(Math.round(v)));
      const s1 = norm360(tt[1] - tt[0]), cIn = norm360(tt[2] - tt[0]) < s1;
      return { tt, start: cIn ? tt[1] : tt[0], span: cIn ? 360 - s1 : s1 };
    }
    function animTo(target) {
      if (busy) return;
      busy = true;
      const from = t.slice(), dl = target.map((v, i) => ((((v - from[i]) % 360) + 540) % 360) - 180);
      tween(1000, (k) => { t = from.map((v, i) => v + dl[i] * k); render(); }, () => { t = target.map(norm360); busy = false; render(); });
    }
    btn(c, '让 AB 成为直径', () => animTo([200, 20, 110]));
    btn(c, '让 C 在弧上走一走', () => {
      if (busy) return;
      const { start, span } = arcInfo();
      const from = start + span + 8, to = start + 360 - 8;
      if (to - from < 10) return;
      busy = true;
      tween(2400, (k) => { t[2] = norm360(Math.round(lerp(from, to, k))); render(); }, () => { busy = false; render(); });
    });
    btn(c, '重来', () => animTo([210, 330, 100]), 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：A、B、C 三个点都可以沿着圆拖动。');
    function render() {
      g.innerHTML = '';
      const { tt, start, span } = arcInfo();
      const pa = pos(tt[0]), pb = pos(tt[1]), pc = pos(tt[2]);
      S('path', { d: arcPts(start, span, R), class: 's3 fnone', style: 'stroke-width:6;stroke-linecap:round' }, g);
      S('path', { d: `M${O[0]},${O[1]} ` + arcPts(start, span, 24).replace('M', 'L') + ' Z', class: 'f1s s1 thin' }, g);
      line(g, O, pa, 's1'); line(g, O, pb, 's1');
      line(g, pc, pa, 's2'); line(g, pc, pb, 's2');
      S('path', { d: wedgeD(pc, pa, pb, 24, true), class: 'f2s s2 thin' }, g);
      if (span === 180) S('path', { d: rightD(pc, pa, pb, 12), class: 'sstrong thin fnone' }, g);
      const mA = (start + span / 2) * D2R;
      T(g, O[0] + 48 * Math.cos(mA), O[1] - 48 * Math.sin(mA) + 5, span + '°', 'tb ts t1');
      const lp = angPos(pc, pa, pb, 44);
      T(g, lp[0], lp[1] + 5, fmt(span / 2) + '°', 'tb ts t2');
      dot(g, O, 4);
      T(g, O[0] - 18 * Math.cos(mA), O[1] + 18 * Math.sin(mA) + 5, 'O', 'vname');
      [pa, pb, pc].forEach((p, i) => label(g, p, O, NM[i], 'vname', 22));
      hs.forEach((h, i) => { const p = pos(t[i]); h.setAttribute('cx', p[0]); h.setAttribute('cy', p[1]); });
      let s = `<span class="k3">弧 AB</span>（绿色，不含点 C 的那一段）所对的<span class="k1">圆心角是 ${span}°</span>，圆周角 <span class="k2">∠ACB = ${fmt(span / 2)}°</span>，正好是圆心角的<b>一半</b>。`;
      if (span === 180) s += '<br>AB 是<b>直径</b>：直径所对的圆周角是直角（90°）。';
      else if (span > 180) s += '<br>C 在劣弧上，∠ACB 对着的是<b>优弧</b>，优弧的圆心角大于 180°，所以 ∠ACB 是钝角。';
      s += '<br>C 在同一段弧上移动时，∠ACB 不变：同弧所对的圆周角相等。';
      read.innerHTML = s;
    }
    hs.forEach((h, i) => drag(svg, h, (p) => {
      const d = norm360(Math.round(Math.atan2(O[1] - p.y, p.x - O[0]) * R2D));
      const ok = t.every((v, j) => j === i || Math.min(norm360(d - v), norm360(v - d)) >= 6);
      if (ok) { t[i] = d; render(); }
    }, () => !busy));
    render();
  };

  // ═════════ 圆：垂径定理与直线和圆的位置关系 ═════════
  A.g_circle_dist = function (el) {
    const W = 440, Hh = 300, O = [170, 150], U = 22;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let r = 5, d = 3, busy = false;
    const sR = slider(c, 'cr', 'r', 3, 6, 0.5, r, (v) => { if (busy) { sR.set(r); return; } r = v; render(); });
    const sD = slider(c, 'cd', 'd', 0, 7, 0.5, d, (v) => { if (busy) { sD.set(d); return; } d = v; render(); });
    btn(c, '播放：直线慢慢移开', () => {
      if (busy) return;
      busy = true;
      tween(3500, (k) => { d = Math.round(lerp(0, 7, k) * 2) / 2; render(); }, () => { d = 7; sD.set(7); busy = false; render(); });
    });
    H('p', { class: 'anim-tip' }, el, 'r 是圆的半径，d 是圆心 O 到直线 l 的距离。');
    const num = (v) => {
      const sq = Math.sqrt(v);
      return Math.abs(sq * 10 - Math.round(sq * 10)) < 1e-9 ? { exact: true, t: fmt(sq), v: sq } : { exact: false, t: `√${fmt(v)} ≈ ${fmt(sq)}`, v: sq };
    };
    function render() {
      g.innerHTML = '';
      const Rp = r * U, lx = O[0] + d * U, M = [lx, O[1]];
      S('circle', { cx: O[0], cy: O[1], r: Rp, class: 'f1s sstrong' }, g);
      line(g, [lx, 12], [lx, Hh - 12], 's2 thick');
      T(g, lx + 10, 28, 'l', 'vname t2', 'start');
      dot(g, O, 4);
      T(g, O[0] - 14, O[1] + 20, 'O', 'vname');
      if (d > 0) {
        line(g, O, M, d > r ? 'sstrong dash' : 'sstrong');
        T(g, (O[0] + lx) / 2, O[1] + 20, 'd', 'vname');
      }
      let s;
      if (d < r) {
        const h2 = r * r - d * d, hv = num(h2), h = hv.v * U;
        const pa = [lx, O[1] - h], pb = [lx, O[1] + h];
        line(g, O, pa, 's3');
        const mr = mid(O, pa);
        T(g, mr[0] - 10, mr[1] - 4, 'r', 'vname t3', 'end');
        dot(g, pa, 5, 'f2'); dot(g, pb, 5, 'f2');
        T(g, lx + 12, pa[1] - 2, 'A', 'vname', 'start');
        T(g, lx + 12, pb[1] + 12, 'B', 'vname', 'start');
        const chord = hv.exact ? fmt(2 * hv.v) : `2√${fmt(h2)} ≈ ${fmt(2 * hv.v)}`;
        if (d > 0) {
          S('path', { d: rightD(M, O, pa, 10), class: 'sstrong thin fnone' }, g);
          S('path', { d: tickD(pa, M, 1) + tickD(M, pb, 1), class: 'sstrong fnone' }, g);
          T(g, lx + 12, O[1] + 20, 'M', 'vname', 'start');
          s = `d = ${fmt(d)} &lt; r = ${fmt(r)}：直线 l 与圆<b>相交</b>，有 2 个公共点 A、B，AB 是一条弦。<br><b>垂径定理：</b>OM ⊥ AB，所以 AM = MB。在 Rt△OAM 中，AM = √(<i>r</i><sup>2</sup> − <i>d</i><sup>2</sup>) = √(${fmt(r * r)} − ${fmt(d * d)}) = ${hv.t}，弦 AB = ${chord}。`;
        } else {
          s = `d = 0：直线经过圆心，和圆有 2 个公共点，弦 AB 就是<b>直径</b>，AB = 2r = ${fmt(2 * r)}。`;
        }
      } else {
        const rp = [O[0] - Rp * Math.SQRT1_2, O[1] - Rp * Math.SQRT1_2];
        line(g, O, rp, 's3');
        const mr = mid(O, rp);
        T(g, mr[0] + 6, mr[1] - 6, 'r', 'vname t3', 'start');
        if (d === r) {
          dot(g, M, 5, 'f2');
          S('path', { d: rightD(M, O, [lx, 0], 10), class: 'sstrong thin fnone' }, g);
          T(g, lx + 12, O[1] - 8, 'T', 'vname', 'start');
          s = `d = r = ${fmt(r)}：直线 l 与圆<b>相切</b>，只有 1 个公共点 T（切点），l 是圆的<b>切线</b>。<br>切线垂直于过切点的半径：OT ⊥ l。`;
        } else {
          s = `d = ${fmt(d)} &gt; r = ${fmt(r)}：直线 l 与圆<b>相离</b>，没有公共点。`;
        }
      }
      read.innerHTML = s + '<br>记住：<b>d &lt; r 相交，d = r 相切，d &gt; r 相离</b>。';
    }
    render();
  };

  // ═════════ 相似：位似放缩 ═════════
  A.g_similar_scale = function (el) {
    const W = 440, Hh = 300;
    const svg = stage(el, W, Hh);
    const F = [[80, 248], [160, 258], [105, 178]];
    const NM = ['A', 'B', 'C'];
    let O = [40, 270], k = 2, busy = false;
    const g = S('g', {}, svg);
    const hO = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const sK = slider(c, 'sk', 'k', 0.5, 2.5, 0.5, k, (v) => { if (busy) { sK.set(k); return; } k = v; render(); });
    btn(c, '播放：从 0.5 倍放大到 2.5 倍', () => {
      if (busy) return;
      busy = true;
      tween(2500, (t) => { k = lerp(0.5, 2.5, t); render(); }, () => { k = 2.5; sK.set(2.5); busy = false; render(); });
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动橙色圆点 O（位似中心）换个位置，再拖动滑块 k。');
    function render() {
      g.innerHTML = '';
      const img = F.map((p) => [O[0] + k * (p[0] - O[0]), O[1] + k * (p[1] - O[1])]);
      F.forEach((p, i) => line(g, O, k >= 1 ? img[i] : p, 'sline dash'));
      const drawF = () => S('polygon', { points: pts(F), class: 'f1s s1' }, g);
      const drawI = () => S('polygon', { points: pts(img), class: 'f2s s2', style: 'fill-opacity:.75' }, g);
      if (k >= 1) { drawI(); drawF(); } else { drawF(); drawI(); }
      const c0 = cen(F), c1 = cen(img);
      F.forEach((p, i) => {
        label(g, p, c0, NM[i], 'vname', 15);
        if (Math.abs(k - 1) > 1e-6) label(g, img[i], c1, NM[i] + '′', 'vname t2', 16);
      });
      dot(g, O, 4);
      T(g, O[0] - 10, O[1] + 18, 'O', 'vname');
      hO.setAttribute('cx', O[0]); hO.setAttribute('cy', O[1]);
      read.innerHTML = `相似比 <i>k</i> = ${fmt(k)}：<span class="k2">A′B′ : AB = B′C′ : BC = C′A′ : CA = ${fmt(k)}</span>，而且 OA′ : OA = OB′ : OB = ${fmt(k)}。对应角都相等，形状不变。<br>周长比 = ${fmt(k)}；如果 △ABC 的面积是 4，△A′B′C′ 的面积就是 ${fmt(4 * k * k)}，面积比 = ${fmt(k)}<sup>2</sup> = <b>${fmt(k * k)}</b>。` + (Math.abs(k - 1) < 1e-6 ? '<br><i>k</i> = 1 时两个三角形重合（全等）。' : '');
    }
    drag(svg, hO, (p) => { O = [clamp(p.x, 20, 140), clamp(p.y, 235, 285)]; render(); }, () => !busy);
    render();
  };

  // ═════════ 相似：A 字型与 8 字型 ═════════
  A.g_similar_ax = function (el) {
    const W = 440, Hh = 300;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mode = 0, t = 0.5, busy = false;
    const mb = [btn(c, 'A 字型', () => { mode = 0; render(); }), btn(c, '8 字型', () => { mode = 1; render(); })];
    const sT = slider(c, 'axt', 'k', 0.2, 0.9, 0.1, t, (v) => { if (busy) { sT.set(t); return; } t = v; render(); });
    btn(c, '移动 DE', () => {
      if (busy) return;
      busy = true;
      tween(2000, (q) => { t = lerp(0.2, 0.9, q); render(); }, () => { t = 0.9; sT.set(0.9); busy = false; render(); });
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, 'k 表示 AD : AB。DE 始终和 BC 平行；颜色相同的角相等。');
    function render() {
      setActive(mb, mode);
      g.innerHTML = '';
      let pa, pb, pc, pd, pe;
      if (mode === 0) {
        pa = [220, 40]; pb = [70, 265]; pc = [380, 265];
        pd = [lerp(pa[0], pb[0], t), lerp(pa[1], pb[1], t)];
        pe = [lerp(pa[0], pc[0], t), lerp(pa[1], pc[1], t)];
      } else {
        pa = [220, 170]; pb = [110, 270]; pc = [350, 270];
        pd = [pa[0] + t * (pa[0] - pb[0]), pa[1] + t * (pa[1] - pb[1])];
        pe = [pa[0] + t * (pa[0] - pc[0]), pa[1] + t * (pa[1] - pc[1])];
      }
      S('polygon', { points: pts([pa, pb, pc]), class: 'f1s s1' }, g);
      S('polygon', { points: pts([pa, pd, pe]), class: 'f2s s2' }, g);
      line(g, pb, pc, 's1 thick'); line(g, pd, pe, 's2 thick');
      S('path', { d: wedgeD(pd, pa, pe, 20, true), class: 'f3s s3 thin' }, g);
      S('path', { d: wedgeD(pb, pa, pc, 20, true), class: 'f3s s3 thin' }, g);
      S('path', { d: wedgeD(pe, pa, pd, 15, true), class: 'fsurf2 sstrong thin' }, g);
      S('path', { d: wedgeD(pc, pa, pb, 15, true), class: 'fsurf2 sstrong thin' }, g);
      const cB = cen([pa, pb, pc]), cS = cen([pa, pd, pe]);
      if (mode === 0) T(g, pa[0], pa[1] - 10, 'A', 'vname');
      else T(g, pa[0] + 20, pa[1] + 6, 'A', 'vname');
      label(g, pb, cB, 'B', 'vname', 18); label(g, pc, cB, 'C', 'vname', 18);
      label(g, pd, mode === 0 ? [pd[0] + 50, pd[1]] : cS, 'D', 'vname t2', 18);
      label(g, pe, mode === 0 ? [pe[0] - 50, pe[1]] : cS, 'E', 'vname t2', 18);
      if (mode === 0) {
        read.innerHTML = `DE ∥ BC，所以 <b>△ADE ∽ △ABC</b>（A 字型）：∠ADE = ∠B（同位角），∠A 是公共角。<br>AD : AB = AE : AC = DE : BC = <b>${fmt(t)}</b>。比如 BC = 10，那么 DE = ${fmt(10 * t)}。`;
      } else {
        read.innerHTML = `DE ∥ BC，所以 <b>△ADE ∽ △ABC</b>（8 字型）：∠D = ∠B（内错角），∠DAE = ∠BAC（对顶角）。<br>AD : AB = AE : AC = DE : BC = <b>${fmt(t)}</b>。注意对应关系：D 对应 B，E 对应 C。`;
      }
    }
    render();
  };

  // ═════════ 三角函数：直角三角形中的比 ═════════
  A.g_trig_ratio = function (el) {
    const W = 440, Hh = 290, U = 24, pa = [50, 262];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let al = 30, cc = 8;
    const sA = slider(c, 'ta', 'α', 5, 85, 1, al, (v) => { al = v; render(); });
    slider(c, 'tc', '斜边', 4, 10, 1, cc, (v) => { cc = v; render(); });
    const c2 = ctrl(el);
    [30, 45, 60].forEach((v) => btn(c2, v + '°', () => { al = v; sA.set(v); render(); }, 'alt'));
    function render() {
      g.innerHTML = '';
      const fr = window.fr;
      const r = al * D2R, cpx = cc * U;
      const pb = [pa[0] + cpx * Math.cos(r), pa[1] - cpx * Math.sin(r)], pc = [pb[0], pa[1]];
      S('polygon', { points: pts([pa, pb, pc]), class: 'fsurf' }, g);
      line(g, pa, pc, 's1 thick round'); line(g, pc, pb, 's2 thick round'); line(g, pa, pb, 's3 thick round');
      S('path', { d: rightD(pc, pa, pb, 12), class: 'sstrong thin fnone' }, g);
      S('path', { d: wedgeD(pa, pc, pb, 30, true), class: 'f2s s2 thin' }, g);
      const lp = angPos(pa, pc, pb, 44);
      T(g, lp[0], lp[1] + 5, 'α', 'vname t2');
      const sn = Math.sin(r), cs = Math.cos(r), tn = Math.tan(r);
      const a = cc * sn, b = cc * cs;
      T(g, (pa[0] + pc[0]) / 2, pa[1] + 22, `邻边 ${fmt(b)}`, 'tb ts t1');
      T(g, pc[0] + 8, (pb[1] + pc[1]) / 2 + 4, `对边 ${fmt(a)}`, 'tb ts t2', 'start');
      const m = mid(pa, pb), nr = [-sn, -cs];
      T(g, m[0] + nr[0] * 16, m[1] + nr[1] * 16, `斜边 ${cc}`, 'tb ts t3', al > 30 ? 'end' : 'middle');
      T(g, pa[0] - 10, pa[1] + 6, 'A', 'vname', 'end');
      T(g, pb[0] + 4, pb[1] - 10, 'B', 'vname');
      T(g, pc[0] + 12, pc[1] + 18, 'C', 'vname');
      T(g, 305, 42, `sin α ≈ ${sn.toFixed(3)}`, 'tb t2', 'start');
      T(g, 305, 70, `cos α ≈ ${cs.toFixed(3)}`, 'tb t1', 'start');
      T(g, 305, 98, `tan α ≈ ${tn.toFixed(3)}`, 'tb', 'start');
      const EX = {
        30: [fr(1, 2), fr('√3', 2), fr('√3', 3)],
        45: [fr('√2', 2), fr('√2', 2), '1'],
        60: [fr('√3', 2), fr(1, 2), '√3']
      };
      let s = `α = ${al}°（∠C = 90°）。<span class="k2">sin α = 对边 ÷ 斜边 = ${fmt(a)} ÷ ${cc} ≈ ${sn.toFixed(3)}</span>；<span class="k1">cos α = 邻边 ÷ 斜边 = ${fmt(b)} ÷ ${cc} ≈ ${cs.toFixed(3)}</span>；tan α = 对边 ÷ 邻边 ≈ ${tn.toFixed(3)}。<br>拖动“斜边”让三角形变大变小：边长都变了，<b>比值不变</b>——因为这些直角三角形都相似。只有改变 α，比值才会变。`;
      if (EX[al]) s += `<br><b>特殊角 ${al}°：</b>sin ${al}° = ${EX[al][0]}，cos ${al}° = ${EX[al][1]}，tan ${al}° = ${EX[al][2]}。`;
      read.innerHTML = s;
    }
    render();
  };

  // ═════════ 三角函数：测量旗杆高度 ═════════
  A.g_trig_flag = function (el) {
    const W = 440, Hh = 280, G0 = 250, s = 14, px = 380, HP = 13.5, EYE = 1.5;
    const svg = stage(el, W, Hh);
    line(svg, [10, G0], [W - 10, G0], 'sstrong');
    const top = [px, G0 - HP * s];
    line(svg, [px, G0], top, 'sstrong thick');
    S('polygon', { points: pts([top, [px + 32, top[1] + 11], [px, top[1] + 22]]), class: 'f2' }, svg);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let d = 12, dep = false;
    slider(c, 'fd', 'd', 6, 24, 1, d, (v) => { d = v; render(); });
    const db = btn(c, '显示俯角', () => { dep = !dep; db.textContent = dep ? '隐藏俯角' : '显示俯角'; render(); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '拖动滑块 d，把测角仪（高 1.5 m）放到离旗杆不同的位置去测仰角。');
    function render() {
      g.innerHTML = '';
      const ex = px - d * s, E = [ex, G0 - EYE * s], Cp = [px, E[1]];
      line(g, [ex, G0], E, 'sstrong');
      line(g, [ex - 8, G0], [ex, G0 - 9], 'sstrong thin');
      line(g, [ex + 8, G0], [ex, G0 - 9], 'sstrong thin');
      dot(g, E, 4);
      line(g, E, Cp, 'smuted dash');
      line(g, E, top, 's2');
      S('path', { d: wedgeD(E, Cp, top, 36, true), class: 'f2s s2 thin' }, g);
      const lp = angPos(E, Cp, top, 52);
      T(g, lp[0], lp[1] + 5, 'α', 'vname t2');
      line(g, [ex, G0 + 9], [px, G0 + 9], 'sline');
      T(g, (ex + px) / 2, G0 + 24, `d = ${d} m`, 'tb ts');
      T(g, px + 8, (top[1] + E[1]) / 2 + 30, 'BC', 'tb ts t2', 'start');
      T(g, px + 8, (E[1] + G0) / 2 + 4, '1.5 m', 'ts tm', 'start');
      T(g, ex - 10, E[1] - 6, 'A', 'vname', 'end');
      T(g, px - 10, top[1] - 4, 'B', 'vname', 'end');
      T(g, px - 10, E[1] - 6, 'C', 'vname', 'end');
      if (dep) {
        const hz = [top[0] - 110, top[1]];
        line(g, top, hz, 'smuted dash');
        S('path', { d: wedgeD(top, hz, E, 36, true), class: 'f3s s3 thin' }, g);
        const lq = angPos(top, hz, E, 54);
        T(g, lq[0], lq[1] + 5, 'β', 'vname t3');
      }
      const al = Math.round(Math.atan((HP - EYE) / d) * R2D * 10) / 10;
      const tn = Math.tan(al * D2R), bc = d * tn;
      let str = `测得仰角 α ≈ ${fmt(al)}°，水平距离 AC = d = ${d} m。<br>在 Rt△ABC 中，tan α = BC ÷ AC，所以 BC = d · tan α ≈ ${d} × ${tn.toFixed(3)} ≈ ${f1(bc)} m。<br>旗杆高 = BC + 1.5 ≈ <b>${f1(bc + EYE)} m</b>。换个位置再测一次，算出来的高度还是一样。`;
      if (dep) str += `<br><span class="k3">从 B 往下看 A，俯角 β = α ≈ ${fmt(al)}°</span>（两条水平线平行，内错角相等）。`;
      read.innerHTML = str;
    }
    render();
  };

  // ═════════ 投影与视图：小正方体堆的三视图 ═════════
  A.g_view_cubes = function (el) {
    const W = 460, Hh = 280, s = 40, dd = 14.1, ox = 62, oy = 262;
    const svg = stage(el, W, Hh);
    const h = [[2, 3, 1], [1, 1, 0], [1, 0, 0]]; // h[行][列]，第 0 行是后排
    let sel = 0;
    const g3 = S('g', {}, svg), gA = S('g', {}, svg), gV = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const NAMES = ['主视图', '左视图', '俯视图'];
    const vb = NAMES.map((n, i) => btn(c, n, () => { sel = i; render(true); }));
    H('p', { class: 'anim-tip' }, el, '下面的格子就是俯视图：数字表示这个位置叠了几个小正方体，上面一行是后排，下面一行是前排。点格子可以增减方块（0～3 个）。');
    const box = H('div', { style: 'display:grid;grid-template-columns:repeat(3,46px);gap:6px;margin-top:6px' }, el);
    for (let r = 0; r < 3; r++) {
      for (let x = 0; x < 3; x++) {
        const b = btn(box, String(h[r][x]), () => { h[r][x] = (h[r][x] + 1) % 4; b.textContent = String(h[r][x]); render(false); }, 'alt');
      }
    }
    const P3 = (x, y, z) => [ox + x * s + y * dd, oy - z * s - y * dd];
    const face = (arr, cls) => S('polygon', { points: pts(arr.map((q) => P3(q[0], q[1], q[2]))), class: cls }, g3);
    function render(anim) {
      setActive(vb, sel);
      g3.innerHTML = ''; gA.innerHTML = ''; gV.innerHTML = '';
      for (let i = 0; i <= 3; i++) { line(g3, P3(i, 0, 0), P3(i, 3, 0), 'sline'); line(g3, P3(0, i, 0), P3(3, i, 0), 'sline'); }
      let n = 0;
      for (let r = 0; r < 3; r++) {
        const y = 2 - r;
        for (let x = 0; x < 3; x++) {
          for (let z = 0; z < h[r][x]; z++) {
            n++;
            face([[x, y, z], [x + 1, y, z], [x + 1, y, z + 1], [x, y, z + 1]], 'fsurf sstrong thin');
            face([[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]], 'fsurf2 sstrong thin');
            face([[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]], 'f1s sstrong thin');
          }
        }
      }
      T(g3, P3(1.5, 0, 0)[0], oy + 15, '正面', 'ts tm');
      const AR = [[P3(1.5, -2, 1), P3(1.5, -0.25, 1)], [P3(-1.2, 1.5, 1.2), P3(-0.15, 1.5, 1.2)], [P3(1.5, 1.5, 4.5), P3(1.5, 1.5, 3.35)]][sel];
      arrow(gA, AR[0], AR[1], 's2 thick', 'f2');
      // 三视图
      const cell = 24;
      const front = [0, 1, 2].map((x) => Math.max(h[0][x], h[1][x], h[2][x]));
      const left = [0, 1, 2].map((r) => Math.max(h[r][0], h[r][1], h[r][2]));
      const VIEWS = [{ x: 268, y: 34 }, { x: 364, y: 34 }, { x: 268, y: 168 }];
      VIEWS.forEach((v, i) => {
        const vg = S('g', {}, gV);
        T(vg, v.x + 36, v.y - 10, NAMES[i], i === sel ? 'tb t2' : 'tb');
        for (let k = 0; k <= 3; k++) {
          line(vg, [v.x + k * cell, v.y], [v.x + k * cell, v.y + 3 * cell], 'sline');
          line(vg, [v.x, v.y + k * cell], [v.x + 3 * cell, v.y + k * cell], 'sline');
        }
        const cls = i === sel ? 'f2s s2' : 'f1s sstrong thin';
        const sq = (col, row) => S('rect', { x: v.x + col * cell, y: v.y + row * cell, width: cell, height: cell, class: cls }, vg);
        if (i === 0) front.forEach((ht, x) => { for (let z = 0; z < ht; z++) sq(x, 2 - z); });
        else if (i === 1) left.forEach((ht, j) => { for (let z = 0; z < ht; z++) sq(j, 2 - z); });
        else {
          for (let r = 0; r < 3; r++) {
            for (let x = 0; x < 3; x++) {
              if (h[r][x] > 0) { sq(x, r); T(vg, v.x + x * cell + cell / 2, v.y + r * cell + cell / 2 + 4, String(h[r][x]), 'ts tm'); }
            }
          }
        }
        if (i === sel && anim) tween(500, (t) => vg.setAttribute('opacity', t));
      });
      if (n === 0) { read.innerHTML = '一个方块也没有了，点下面的格子加几个。'; return; }
      const cnt = `（一共 ${n} 个小正方体）`;
      if (sel === 0) read.innerHTML = `<b>主视图</b>：从<b>正面</b>往后看（橙色箭头）。每一列画几层，由这一列里<b>最高</b>的那一摞决定：从左到右是 ${front.join('、')} 层。${cnt}`;
      else if (sel === 1) read.innerHTML = `<b>左视图</b>：从<b>左面</b>往右看，画在主视图的<b>右边</b>，和主视图一样高（高平齐）。看过去时物体的后排在左、前排在右，每一列的层数由这一排最高的那摞决定：从左到右（后排→前排）是 ${left.join('、')} 层。${cnt}`;
      else read.innerHTML = `<b>俯视图</b>：从<b>上面</b>往下看，画在主视图的<b>下面</b>，和主视图一样长（长对正）。只看哪些位置有方块，看不出叠了几层；上方是后排，下方是前排。格子里的数字是这个位置的个数。${cnt}`;
    }
    render(false);
  };

  // ═════════ 投影：灯光与太阳光 ═════════
  A.g_view_shadow = function (el) {
    const W = 440, Hh = 260, G0 = 225, SH = 60, M = 30;
    const svg = stage(el, W, Hh);
    line(svg, [8, G0], [W - 8, G0], 'sstrong');
    const g = S('g', {}, svg);
    const hL = S('circle', { r: 13, class: 'handle', tabindex: 0 }, svg);
    const hS = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mode = 0, L = [140, 50], x2 = 320, sun = 45;
    const x1 = 200;
    const mb = [btn(c, '灯光', () => { mode = 0; render(); }), btn(c, '太阳光', () => { mode = 1; render(); })];
    slider(c, 'vsun', '太阳高度角', 20, 70, 5, sun, (v) => { sun = v; if (mode === 1) render(); });
    H('p', { class: 'anim-tip' }, el, '两根杆都高 2 m。拖动杆 2 顶上的圆点移动它；灯光模式下还可以拖动灯泡。');
    function render() {
      setActive(mb, mode);
      g.innerHTML = '';
      const r = sun * D2R;
      const tips = [x1, x2].map((x) => (mode === 0 ? L[0] + ((x - L[0]) * (G0 - L[1])) / (G0 - L[1] - SH) : x + SH / Math.tan(r)));
      if (mode === 0) {
        line(g, [L[0], L[1] + 10], [L[0], G0], 'smuted');
        S('circle', { cx: L[0], cy: L[1], r: 9, class: 'f2' }, g);
      } else {
        S('circle', { cx: 36, cy: 36, r: 16, class: 'f2' }, g);
      }
      [x1, x2].forEach((x, i) => {
        const tp = [x, G0 - SH], tip = [tips[i], G0];
        const from = mode === 0 ? L : [x - 500 * Math.cos(r), G0 - SH - 500 * Math.sin(r)];
        line(g, from, tip, 's3 thin dash');
        line(g, [x, G0], tip, 's2 thick round');
        line(g, [x, G0], tp, 'sstrong thick round');
        T(g, x, G0 + 20, '杆 ' + (i + 1), 'ts tm');
      });
      hL.setAttribute('cx', L[0]); hL.setAttribute('cy', L[1]);
      hL.setAttribute('display', mode === 0 ? 'inline' : 'none');
      hS.setAttribute('cx', x2); hS.setAttribute('cy', G0 - SH);
      const l1 = Math.abs(tips[0] - x1) / M, l2 = Math.abs(tips[1] - x2) / M;
      if (mode === 0) {
        read.innerHTML = `灯光从一个点（灯泡）发出，光线交于一点——这是<b>中心投影</b>。<br>杆 1 影长 <span class="k2">${f1(l1)} m</span>，杆 2 影长 <span class="k2">${f1(l2)} m</span>：两根杆一样高，影子却可能不一样长。离灯越远，影子越长。`;
      } else {
        read.innerHTML = `太阳离我们非常远，光线可以看成<b>互相平行</b>——这是<b>平行投影</b>。<br>两根杆的影子一样长，都是 <span class="k2">${f1(l1)} m</span>。太阳越高，影子越短。同一时刻，物高 ÷ 影长 都相同。`;
      }
    }
    drag(svg, hL, (p) => { if (mode !== 0) return; L = [clamp(p.x, 20, W - 20), clamp(p.y, 30, 120)]; render(); });
    drag(svg, hS, (p) => { x2 = clamp(p.x, 30, W - 20); render(); });
    render();
  };

  // ═════════ 尺规作图：分步演示 ═════════
  A.g_construct_steps = function (el) {
    const W = 440, Hh = 300;
    const svg = stage(el, W, Hh);
    const base = S('g', {}, svg), work = S('g', {}, svg), tool = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el), c2 = ctrl(el);
    const angOf = (C, P) => Math.atan2(P[1] - C[1], P[0] - C[0]) * R2D;
    const around = (C, P, sp) => { const a = angOf(C, P); return [a - sp, a + sp]; };
    const along = (P, Q, len) => { const u = unit(P, Q); return [P[0] + u[0] * len, P[1] + u[1] * len]; };
    const polar = (C, r, deg) => [C[0] + r * Math.cos(deg * D2R), C[1] + r * Math.sin(deg * D2R)];

    function taskPerp() {
      const pa = [110, 160], pb = [330, 160], r = 140;
      const [q1, q2] = cci(pa, r, pb, r);
      const P = q1[1] < q2[1] ? q1 : q2, Q = q1[1] < q2[1] ? q2 : q1;
      const M = mid(pa, pb);
      return {
        name: '作线段 AB 的垂直平分线',
        base: (b) => {
          line(b, pa, pb, 'sstrong thick round'); dot(b, pa); dot(b, pb);
          T(b, pa[0] - 10, pa[1] + 5, 'A', 'vname', 'end'); T(b, pb[0] + 10, pb[1] + 5, 'B', 'vname', 'start');
        },
        intro: '已知线段 AB，要作出它的垂直平分线。点“下一步”开始。',
        steps: [
          { cap: '第一步', txt: '以点 A 为圆心，以<b>大于 ½AB</b> 的长为半径，在 AB 的上方和下方各画一段弧。', acts: [{ arc: [pa, r, ...around(pa, P, 18)] }, { arc: [pa, r, ...around(pa, Q, 18)] }] },
          { cap: '第二步', txt: '圆规张开的大小<b>不变</b>，以点 B 为圆心画弧，和刚才的两段弧分别交于点 P、Q。', acts: [{ arc: [pb, r, ...around(pb, P, 18)] }, { arc: [pb, r, ...around(pb, Q, 18)] }, { pt: [P, 'P', 10, -6] }, { pt: [Q, 'Q', 10, 18] }] },
          { cap: '第三步', txt: '用直尺作直线 PQ，交 AB 于点 M。直线 PQ 就是线段 AB 的垂直平分线。', acts: [{ line: [along(Q, P, dist(Q, P) + 50), along(P, Q, dist(P, Q) + 40)] }, { mark: rightD(M, pb, P, 10) + ' ' + tickD(pa, M, 1) + tickD(M, pb, 1) }, { pt: [M, 'M', 8, 18] }] }
        ],
        done: '为什么对？画弧的半径都相同，所以 PA = PB，QA = QB。到线段两端距离相等的点在线段的垂直平分线上，两点确定一条直线，所以直线 PQ 就是 AB 的垂直平分线。'
      };
    }
    function taskBis() {
      const O = [80, 240], a2 = -52, r1 = 110, r2 = 80;
      const pa = polar(O, 300, 0), pb = polar(O, 280, a2);
      const Mp = polar(O, r1, 0), Np = polar(O, r1, a2);
      const [q1, q2] = cci(Mp, r2, Np, r2);
      const P = dist(q1, O) > dist(q2, O) ? q1 : q2;
      return {
        name: '作 ∠AOB 的平分线',
        base: (b) => {
          line(b, O, pa, 'sstrong thick round'); line(b, O, pb, 'sstrong thick round'); dot(b, O);
          T(b, O[0] - 10, O[1] + 16, 'O', 'vname', 'end'); T(b, pa[0] - 4, pa[1] + 22, 'A', 'vname'); T(b, pb[0] + 14, pb[1] + 8, 'B', 'vname');
        },
        intro: '已知 ∠AOB，要作出它的平分线。点“下一步”开始。',
        steps: [
          { cap: '第一步', txt: '以 O 为圆心、适当长为半径画弧，分别交 OA、OB 于点 M、N。', acts: [{ arc: [O, r1, a2 - 10, 10] }, { pt: [Mp, 'M', 4, 22] }, { pt: [Np, 'N', -20, -4] }] },
          { cap: '第二步', txt: '分别以 M、N 为圆心，以<b>大于 ½MN</b> 的同样长度为半径画弧，两弧在角的内部交于点 P。', acts: [{ arc: [Mp, r2, ...around(Mp, P, 20)] }, { arc: [Np, r2, ...around(Np, P, 20)] }, { pt: [P, 'P', 8, -8] }] },
          { cap: '第三步', txt: '作射线 OP。射线 OP 就是 ∠AOB 的平分线。', acts: [{ line: [O, along(O, P, 300)] }] }
        ],
        done: '为什么对？连接 PM、PN：OM = ON，PM = PN，OP = OP，所以 △OMP ≌ △ONP（SSS），∠MOP = ∠NOP。'
      };
    }
    function taskCopy() {
      const O = [40, 250], aw = -40, r = 80;
      const pa = polar(O, 150, 0), pb = polar(O, 150, aw);
      const C1 = polar(O, r, 0), D1 = polar(O, r, aw);
      const O2 = [240, 250], pa2 = [430, 250], C2 = [O2[0] + r, O2[1]];
      const cd = dist(C1, D1);
      const [q1, q2] = cci(O2, r, C2, cd);
      const D2 = q1[1] < q2[1] ? q1 : q2;
      const end = along(O2, D2, 170);
      return {
        name: '作 ∠A′O′B′ 等于已知角 ∠AOB',
        base: (b) => {
          line(b, O, pa, 'sstrong thick round'); line(b, O, pb, 'sstrong thick round'); dot(b, O);
          T(b, O[0] - 4, O[1] + 20, 'O', 'vname'); T(b, pa[0], pa[1] + 20, 'A', 'vname'); T(b, pb[0] + 12, pb[1] + 2, 'B', 'vname');
          line(b, O2, pa2, 'sstrong thick round'); dot(b, O2);
          T(b, O2[0] - 4, O2[1] + 20, 'O′', 'vname'); T(b, pa2[0] - 14, pa2[1] + 20, 'A′', 'vname');
          T(b, 95, 290, '已知角', 'ts tm'); T(b, 335, 290, '在射线 O′A′ 上作一个相等的角', 'ts tm');
        },
        intro: '已知 ∠AOB 和射线 O′A′，要以 O′ 为顶点作 ∠A′O′B′ = ∠AOB。点“下一步”开始。',
        steps: [
          { cap: '第一步', txt: '以 O 为圆心、适当长为半径画弧，交 OA 于 C，交 OB 于 D。', acts: [{ arc: [O, r, aw - 10, 10] }, { pt: [C1, 'C', 4, 20] }, { pt: [D1, 'D', -16, -6] }] },
          { cap: '第二步', txt: '以 O′ 为圆心、<b>同样长</b>为半径画弧，交 O′A′ 于点 C′。', acts: [{ arc: [O2, r, -62, 10] }, { pt: [C2, 'C′', 4, 20] }] },
          { cap: '第三步', txt: '用圆规量出 CD 的长，再以 C′ 为圆心、CD 长为半径画弧，与上一段弧交于点 D′。', acts: [{ line: [C1, D1], cls: 'guide' }, { arc: [C2, cd, ...around(C2, D2, 25)] }, { pt: [D2, 'D′', -22, -8] }] },
          { cap: '第四步', txt: '过点 D′ 作射线 O′B′。∠A′O′B′ 就是所求作的角。', acts: [{ line: [O2, end] }, { pt: [end, 'B′', 6, -4] }] }
        ],
        done: '为什么对？O′C′ = OC，O′D′ = OD，C′D′ = CD，所以 △C′O′D′ ≌ △COD（SSS），∠A′O′B′ = ∠AOB。'
      };
    }
    const TASKS = [taskPerp(), taskBis(), taskCopy()];
    let ti = 0, step = 0, busy = false;
    const tb = ['垂直平分线', '角平分线', '作等角'].map((n, i) => btn(c1, n, () => { if (busy) return; ti = i; reset(); }));
    const nb = btn(c2, '下一步 →', next);
    btn(c2, '重来', () => { if (!busy) reset(); }, 'alt');

    function run(acts, done) {
      let i = 0;
      const nxt = () => {
        if (i >= acts.length) { tool.innerHTML = ''; if (done) done(); return; }
        const a = acts[i++];
        if (a.arc) {
          const [C, r, a0, a1] = a.arc;
          const p = S('path', { class: 's1 fnone' }, work);
          const p0 = polar(C, r, a0);
          tween(800, (t) => {
            const cur = lerp(a0, a1, t), q = polar(C, r, cur);
            p.setAttribute('d', `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${r},${r} 0 ${cur - a0 > 180 ? 1 : 0} 1 ${q[0].toFixed(1)},${q[1].toFixed(1)}`);
            tool.innerHTML = '';
            line(tool, C, q, 'smuted');
            dot(tool, C, 3, 'fmuted'); dot(tool, q, 4, 'f2');
          }, nxt);
        } else if (a.line) {
          const [P, Q] = a.line;
          const l = line(work, P, P, a.cls || 's2 thick round');
          tween(700, (t) => { l.setAttribute('x2', lerp(P[0], Q[0], t)); l.setAttribute('y2', lerp(P[1], Q[1], t)); }, nxt);
        } else if (a.pt) {
          const [P, name, dx, dy] = a.pt;
          dot(work, P, 4);
          T(work, P[0] + dx, P[1] + dy, name, 'vname', 'start');
          nxt();
        } else if (a.mark) {
          S('path', { d: a.mark, class: 'sstrong thin fnone' }, work);
          nxt();
        } else nxt();
      };
      nxt();
    }
    function reset() {
      setActive(tb, ti);
      const tk = TASKS[ti];
      base.innerHTML = ''; work.innerHTML = ''; tool.innerHTML = '';
      tk.base(base);
      step = 0; nb.disabled = false;
      cap.textContent = tk.name;
      read.innerHTML = tk.intro;
    }
    function next() {
      if (busy) return;
      const tk = TASKS[ti];
      if (step >= tk.steps.length) return;
      const st = tk.steps[step];
      busy = true;
      cap.textContent = `${tk.name}：${st.cap}（共 ${tk.steps.length} 步）`;
      read.innerHTML = st.txt;
      run(st.acts, () => {
        busy = false;
        step++;
        if (step >= tk.steps.length) { nb.disabled = true; read.innerHTML = st.txt + '<br>' + tk.done; }
      });
    }
    reset();
  };

  // ═════════ 尺规作图：为什么这样作是对的 ═════════
  A.g_construct_why = function (el) {
    const W = 440, Hh = 280, U = 20;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hP = S('circle', { r: 12, class: 'handle', tabindex: 0 }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const pa = [110, 210], pb = [330, 210], mx = 220;
    const O = [60, 250], a2 = -50 * D2R, u2 = [Math.cos(a2), Math.sin(a2)], bis = -25 * D2R, ub = [Math.cos(bis), Math.sin(bis)];
    const PP = [[220, 80], [O[0] + 200 * ub[0], O[1] + 200 * ub[1]]];
    let mode = 0, P = PP[0].slice();
    const mb = [
      btn(c, '垂直平分线上的点', () => { mode = 0; P = PP[0].slice(); render(); }),
      btn(c, '角平分线上的点', () => { mode = 1; P = PP[1].slice(); render(); })
    ];
    H('p', { class: 'anim-tip' }, el, '拖动橙色的点 P。靠近绿色虚线时，P 会自动吸到线上。');
    function render() {
      setActive(mb, mode);
      g.innerHTML = '';
      if (mode === 0) {
        line(g, pa, pb, 'sstrong thick round'); dot(g, pa); dot(g, pb);
        T(g, pa[0] - 10, pa[1] + 5, 'A', 'vname', 'end'); T(g, pb[0] + 10, pb[1] + 5, 'B', 'vname', 'start');
        line(g, [mx, 15], [mx, Hh - 10], 's3 dash');
        S('path', { d: rightD([mx, pa[1]], pb, [mx, 0], 10) + ' ' + tickD(pa, [mx, pa[1]], 1) + tickD([mx, pa[1]], pb, 1), class: 's3 thin fnone' }, g);
        line(g, P, pa, 's1'); line(g, P, pb, 's2');
        T(g, P[0] + 14, P[1] - 12, 'P', 'vname', 'start');
        const da = dist(P, pa) / U, db = dist(P, pb) / U, on = Math.abs(P[0] - mx) < 0.5;
        read.innerHTML = on
          ? `P 在 AB 的垂直平分线上：<span class="k1">PA = ${f1(da)}</span>，<span class="k2">PB = ${f1(db)}</span>，<b>PA = PB</b>。<br>反过来，到 A、B 距离相等的点也一定在这条线上。所以作图时，用同样的半径分别以 A、B 为圆心画弧，找到两个交点，连起来就是垂直平分线。`
          : `P 不在垂直平分线上：<span class="k1">PA = ${f1(da)}</span>，<span class="k2">PB = ${f1(db)}</span>，不相等。把 P 拖到绿色虚线上看看。`;
      } else {
        const pA = [420, O[1]], pB = [O[0] + 300 * u2[0], O[1] + 300 * u2[1]];
        line(g, O, pA, 'sstrong thick round'); line(g, O, pB, 'sstrong thick round'); dot(g, O);
        T(g, O[0] - 8, O[1] + 16, 'O', 'vname', 'end'); T(g, pA[0] - 6, pA[1] + 22, 'A', 'vname'); T(g, pB[0] + 14, pB[1] + 6, 'B', 'vname');
        line(g, O, [O[0] + 380 * ub[0], O[1] + 380 * ub[1]], 's3 dash');
        const v = [P[0] - O[0], P[1] - O[1]];
        const E = [P[0], O[1]], tF = v[0] * u2[0] + v[1] * u2[1], Fp = [O[0] + tF * u2[0], O[1] + tF * u2[1]];
        line(g, P, E, 's1'); line(g, P, Fp, 's2');
        S('path', { d: rightD(E, O, P, 9) + ' ' + rightD(Fp, O, P, 9), class: 'sstrong thin fnone' }, g);
        dot(g, E, 3.5); dot(g, Fp, 3.5);
        T(g, E[0], E[1] + 20, 'E', 'vname');
        label(g, Fp, P, 'F', 'vname', 16);
        T(g, P[0] + 12, P[1] + 4, 'P', 'vname', 'start');
        const pe = dist(P, E) / U, pf = dist(P, Fp) / U, on = Math.abs(v[0] * ub[1] - v[1] * ub[0]) < 0.5;
        read.innerHTML = on
          ? `P 在 ∠AOB 的平分线上：<span class="k1">PE = ${f1(pe)}</span>，<span class="k2">PF = ${f1(pf)}</span>，<b>P 到角两边的距离相等</b>。<br>作角平分线的道理：OM = ON，PM = PN，OP 是公共边，△OMP ≌ △ONP（SSS），所以 ∠MOP = ∠NOP。`
          : `P 不在角平分线上：<span class="k1">PE = ${f1(pe)}</span>，<span class="k2">PF = ${f1(pf)}</span>，不相等。把 P 拖到绿色虚线上看看。`;
      }
      hP.setAttribute('cx', P[0]); hP.setAttribute('cy', P[1]);
    }
    drag(svg, hP, (p) => {
      if (mode === 0) {
        let x = clamp(p.x, 20, W - 20);
        const y = clamp(p.y, 20, Hh - 15);
        if (Math.abs(x - mx) < 8) x = mx;
        P = [x, y];
      } else {
        const vx = p.x - O[0], vy = p.y - O[1];
        const ang = clamp(Math.atan2(vy, vx), -47 * D2R, -3 * D2R);
        const len = clamp(Math.hypot(vx, vy), 60, 300);
        let q = [O[0] + len * Math.cos(ang), O[1] + len * Math.sin(ang)];
        const w = [q[0] - O[0], q[1] - O[1]];
        if (Math.abs(w[0] * ub[1] - w[1] * ub[0]) < 8) { const tt = w[0] * ub[0] + w[1] * ub[1]; q = [O[0] + tt * ub[0], O[1] + tt * ub[1]]; }
        P = q;
      }
      render();
    });
    render();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
