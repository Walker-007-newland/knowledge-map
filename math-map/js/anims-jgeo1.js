// 初中 图形与几何（一）：线段射线直线、余角补角、相交线与平行线、平面直角坐标系、三角形、全等、轴对称
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, grid, RM } = window.AH;
  const PI = Math.PI;
  const A = {};

  // ── 本文件用到的小工具 ──
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const ang = (V, P) => Math.atan2(P[1] - V[1], P[0] - V[0]); // 屏幕角（弧度）
  const deg = (r) => (r * 180) / PI;
  const rad = (d) => (d * PI) / 180;
  const ptsStr = (arr) => arr.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const setLine = (ln, p, q) => { ln.setAttribute('x1', p[0]); ln.setAttribute('y1', p[1]); ln.setAttribute('x2', q[0]); ln.setAttribute('y2', q[1]); };
  const setXY = (t, x, y) => { t.setAttribute('x', x); t.setAttribute('y', y); };
  const setC = (c, p) => { c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); };
  const len1 = (px) => (px / 40).toFixed(1); // 40 像素算 1 个单位
  // 数学角（度，逆时针为正）对应的屏幕方向
  const dirM = (m) => [Math.cos(rad(m)), -Math.sin(rad(m))];
  const polM = (P, m, r) => [P[0] + r * Math.cos(rad(m)), P[1] - r * Math.sin(rad(m))];
  // 扇形：屏幕角从 s1 增加到 s2
  function sector(cx, cy, r, s1, s2) {
    const x1 = cx + r * Math.cos(s1), y1 = cy + r * Math.sin(s1);
    const x2 = cx + r * Math.cos(s2), y2 = cy + r * Math.sin(s2);
    const large = s2 - s1 > PI ? 1 : 0;
    return `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`;
  }
  // 数学角 m1 → m2（逆时针）的扇形
  const sectorM = (cx, cy, r, m1, m2) => sector(cx, cy, r, -rad(m2), -rad(m1));
  // 射线 VP 与 VQ 之间（小于 180°）的扇形
  function wedge(V, P, Q, r) {
    let a1 = ang(V, P);
    const a2 = ang(V, Q);
    let d = a2 - a1;
    while (d > PI) d -= 2 * PI;
    while (d < -PI) d += 2 * PI;
    if (d < 0) { a1 = a2; d = -d; }
    return sector(V[0], V[1], r, a1, a1 + d);
  }
  // 角 PVQ 的平分方向（单位向量）
  function bisDir(V, P, Q) {
    const a = ang(V, P), b = ang(V, Q);
    const x = Math.cos(a) + Math.cos(b), y = Math.sin(a) + Math.sin(b);
    const l = Math.hypot(x, y) || 1;
    return [x / l, y / l];
  }
  // 角 PVQ 的度数（0～180）
  function angDeg(V, P, Q) {
    let d = Math.abs(ang(V, P) - ang(V, Q));
    if (d > PI) d = 2 * PI - d;
    return deg(d);
  }
  // 圆弧（不封闭）：屏幕角 s1 → s2
  function arc(cx, cy, r, s1, s2) {
    const large = Math.abs(s2 - s1) > PI ? 1 : 0, sweep = s2 > s1 ? 1 : 0;
    return `M${(cx + r * Math.cos(s1)).toFixed(1)},${(cy + r * Math.sin(s1)).toFixed(1)} A${r},${r} 0 ${large} ${sweep} ${(cx + r * Math.cos(s2)).toFixed(1)},${(cy + r * Math.sin(s2)).toFixed(1)}`;
  }
  // 直线 P + s·d 与 Q + u·e 的交点
  function meet(P, d, Q, e) {
    const det = -d[0] * e[1] + e[0] * d[1];
    const dx = Q[0] - P[0], dy = Q[1] - P[1];
    const s = (-dx * e[1] + e[0] * dy) / det;
    return [P[0] + d[0] * s, P[1] + d[1] * s];
  }
  // 拖拽
  function drag(svg, el, onMove, ok) {
    el.addEventListener('pointerdown', (e) => {
      if (ok && !ok()) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const move = (ev) => onMove(svgPoint(svg, ev));
      const up = () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  }

  // ═════════════ 线段、射线、直线 ═════════════
  A.g_line_extend = function (el) {
    const W = 440, Hh = 220, FAR = 620;
    const svg = stage(el, W, Hh);
    let P = [[140, 135], [290, 95]];
    let ext = [0, 0], mode = 'seg', busy = false;
    const exA = S('line', { class: 's2 thick round dash' }, svg);
    const exB = S('line', { class: 's2 thick round dash' }, svg);
    const seg = S('line', { class: 'sstrong thick round' }, svg);
    const dots = [0, 1].map(() => S('circle', { r: 5, class: 'fstrong' }, svg));
    const names = ['A', 'B'].map((n) => T(svg, 0, 0, n, 'vname'));
    const hs = [0, 1].map(() => S('circle', { r: 13, class: 'handle' }, svg));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const MODES = { seg: [0, 0], rayAB: [0, FAR], rayBA: [FAR, 0], line: [FAR, FAR] };
    const go = (m) => {
      if (busy) return;
      busy = true; mode = m;
      const from = ext.slice(), to = MODES[m];
      render();
      tween(1500, (t, raw) => { ext = [lerp(from[0], to[0], raw), lerp(from[1], to[1], raw)]; render(); }, () => { busy = false; render(); });
    };
    btn(c, '线段 AB', () => go('seg'));
    btn(c, '射线 AB', () => go('rayAB'));
    btn(c, '射线 BA', () => go('rayBA'));
    btn(c, '直线 AB', () => go('line'));

    function render() {
      const [a, b] = P;
      const L = dist(a, b) || 1, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
      setLine(seg, a, b);
      setLine(exA, a, [a[0] - ux * ext[0], a[1] - uy * ext[0]]);
      setLine(exB, b, [b[0] + ux * ext[1], b[1] + uy * ext[1]]);
      exA.style.display = ext[0] < 1 ? 'none' : '';
      exB.style.display = ext[1] < 1 ? 'none' : '';
      P.forEach((p, i) => {
        setC(dots[i], p); setC(hs[i], p);
        setXY(names[i], p[0] + uy * 24, p[1] - ux * 24 + 5);
      });
      const txt = {
        seg: `<b>线段 AB</b>：有 <span class="k1">2 个端点</span>，不向任何一方延伸，可以量出长度：AB ≈ ${len1(L)} cm。线段 AB 也可以写成线段 BA。`,
        rayAB: `<b>射线 AB</b>：只有 <span class="k1">1 个端点 A</span>，从 A 出发、经过 B，<span class="k2">向 B 那一方无限延伸</span>，不能度量长度。表示射线时，端点 A 必须写在前面。`,
        rayBA: `<b>射线 BA</b>：端点是 B，<span class="k2">向 A 那一方无限延伸</span>。它和射线 AB 端点不同、方向相反，<b>不是同一条射线</b>。`,
        line: `<b>直线 AB</b>：<span class="k1">没有端点</span>，<span class="k2">向两方无限延伸</span>，不能度量长度。直线 AB 也可以写成直线 BA。拖动 A、B：经过两点只能画出一条直线——<b>两点确定一条直线</b>。`
      };
      read.innerHTML = busy ? '正在延伸……' : txt[mode];
    }
    hs.forEach((h, i) => drag(svg, h, (p) => {
      const q = [clamp(p.x, 20, W - 20), clamp(p.y, 24, Hh - 20)];
      if (dist(q, P[1 - i]) < 40) return;
      P[i] = q; render();
    }));
    // 延长部分的虚线一直向外“流动”，表示无限延伸
    let off = 0, seen = false, idle = 0;
    function flow() {
      if (svg.isConnected) { seen = true; idle = 0; } else if (seen || ++idle > 600) return;
      off -= 0.7;
      exA.style.strokeDashoffset = off; exB.style.strokeDashoffset = off;
      requestAnimationFrame(flow);
    }
    if (!RM) requestAnimationFrame(flow);
    H('p', { class: 'anim-tip' }, el, '提示：点上面的按钮切换；拖动 A、B 两个圆点可以改变位置。橙色虚线表示一直延伸下去。');
    render();
  };

  A.g_line_path = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const PA = [60, 160], PB = [380, 160];
    let C = [190, 50], M = [240, 222], busy = false, raced = false;
    const pS = S('line', { class: 's1 thick round' }, svg);
    const pBk = S('polyline', { class: 's2 thick round fnone' }, svg);
    const pCv = S('path', { class: 's3 thick round fnone' }, svg);
    [PA, PB].forEach((p) => S('circle', { cx: p[0], cy: p[1], r: 6, class: 'fstrong' }, svg));
    T(svg, PA[0] - 14, PA[1] + 5, 'A', 'vname', 'end');
    T(svg, PB[0] + 14, PB[1] + 5, 'B', 'vname', 'start');
    const cName = T(svg, 0, 0, 'C', 'vname');
    const ants = ['f1', 'f2', 'f3'].map((k) => S('circle', { r: 7, class: k }, svg));
    const hC = S('circle', { r: 13, class: 'handle' }, svg);
    const hM = S('circle', { r: 13, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);

    const curvePts = () => {
      const Q = [2 * M[0] - (PA[0] + PB[0]) / 2, 2 * M[1] - (PA[1] + PB[1]) / 2];
      const out = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60, u = 1 - t;
        out.push([u * u * PA[0] + 2 * u * t * Q[0] + t * t * PB[0], u * u * PA[1] + 2 * u * t * Q[1] + t * t * PB[1]]);
      }
      return out;
    };
    const plen = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]); return s; };
    const posAt = (pts, s) => {
      for (let i = 1; i < pts.length; i++) {
        const d = dist(pts[i - 1], pts[i]);
        if (s <= d) return [lerp(pts[i - 1][0], pts[i][0], d ? s / d : 0), lerp(pts[i - 1][1], pts[i][1], d ? s / d : 0)];
        s -= d;
      }
      return pts[pts.length - 1];
    };
    const paths = () => [[PA, PB], [PA, C, PB], curvePts()];

    function render() {
      const ps = paths();
      setLine(pS, PA, PB);
      pBk.setAttribute('points', ptsStr(ps[1]));
      pCv.setAttribute('d', 'M' + ps[2].map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L'));
      setC(hC, C); setXY(cName, C[0], C[1] - 18);
      setC(hM, M);
      if (!busy) ants.forEach((a) => setC(a, PA));
      const L = ps.map(plen).map(len1);
      let s = `<span class="k1">线段 AB = ${L[0]}</span>，<span class="k2">折线 A→C→B = ${L[1]}</span>，<span class="k3">曲线 = ${L[2]}</span>（单位：cm）。`;
      s += raced
        ? '<br>三只小蚂蚁速度一样，走<b>线段</b>的蓝色蚂蚁最先到达 B。连接两点的所有线中，<b>线段最短</b>。线段 AB 的长度叫做 A、B 两点间的<b>距离</b>。'
        : '<br>拖动橙色折线的拐点 C、绿色曲线上的圆点，改变路线，再让蚂蚁赛跑。';
      read.innerHTML = s;
    }
    btn(c, '三只蚂蚁同时出发', () => {
      if (busy) return;
      busy = true; raced = false;
      const ps = paths(), L = ps.map(plen), mx = Math.max(...L);
      read.innerHTML = '三只蚂蚁速度一样，看谁先到 B……';
      tween(1200 + mx * 5, (t, raw) => {
        const s = raw * mx;
        ants.forEach((a, i) => setC(a, posAt(ps[i], Math.min(s, L[i]))));
      }, () => { busy = false; raced = true; render(); ants.forEach((a) => setC(a, PB)); });
    });
    drag(svg, hC, (p) => { C = [clamp(p.x, 20, W - 20), clamp(p.y, 20, Hh - 15)]; raced = false; render(); }, () => !busy);
    drag(svg, hM, (p) => { M = [clamp(p.x, 120, 320), clamp(p.y, 20, Hh - 15)]; raced = false; render(); }, () => !busy);
    render();
  };

  // ═════════════ 余角和补角 ═════════════
  A.g_anglec_drag = function (el) {
    const W = 440, Hh = 250, O = [220, 212], R = 165;
    const svg = stage(el, W, Hh);
    let a = 35, mode = 'comp', bis = false, busy = false;
    const secO = S('path', { class: 'f2s' }, svg);
    const secM = S('path', { class: 'f1s' }, svg);
    const rayA = S('line', { class: 'sstrong' }, svg); setLine(rayA, O, polM(O, 0, 205));
    const rayC = S('line', { class: 'sstrong' }, svg); setLine(rayC, O, polM(O, 90, R + 10));
    const rayD = S('line', { class: 'sstrong' }, svg); setLine(rayD, O, polM(O, 180, 205));
    const rayE = S('line', { class: 's3 dash' }, svg);
    const rayB = S('line', { class: 's1 thick round' }, svg);
    S('circle', { cx: O[0], cy: O[1], r: 4, class: 'fstrong' }, svg);
    T(svg, O[0], O[1] + 24, 'O', 'vname');
    T(svg, 418, O[1] + 22, 'A', 'vname');
    const nC = T(svg, O[0] + 14, O[1] - R - 2, 'C', 'vname');
    const nD = T(svg, 22, O[1] + 22, 'D', 'vname');
    const nB = T(svg, 0, 0, 'B', 'vname');
    const nE = T(svg, 0, 0, 'E', 'vname t3');
    const tM = T(svg, 0, 0, '', 't1 tb');
    const tO = T(svg, 0, 0, '', 't2 tb');
    const hB = S('circle', { r: 13, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const modeBtns = [];
    const setMode = (m) => { mode = m; modeBtns.forEach((b, i) => { b.className = 'abtn' + ((i === 0) === (m === 'comp') ? '' : ' alt'); }); render(); };
    modeBtns.push(btn(c, '看余角', () => setMode('comp')));
    modeBtns.push(btn(c, '看补角', () => setMode('supp'), 'alt'));
    const bBtn = btn(c, '画角平分线', () => { bis = !bis; bBtn.textContent = bis ? '去掉角平分线' : '画角平分线'; render(); }, 'alt');
    btn(c, '转一转', () => {
      if (busy) return;
      busy = true;
      tween(3600, (t, raw) => { a = Math.round(lerp(5, 175, raw)); render(); }, () => { busy = false; render(); });
    }, 'alt');

    function render() {
      const B = polM(O, a, R);
      setLine(rayB, O, B); setC(hB, B);
      const nb = polM(O, a, R + 22); setXY(nB, nb[0], nb[1] + 5);
      secM.setAttribute('d', sectorM(O[0], O[1], 46, 0, a));
      const lm = polM(O, a / 2, 72); setXY(tM, lm[0], lm[1] + 5); tM.textContent = a + '°';
      rayC.style.display = nC.style.display = mode === 'comp' ? '' : 'none';
      rayD.style.display = nD.style.display = mode === 'supp' ? '' : 'none';
      const other = mode === 'comp' ? 90 : 180;
      if (a < other) {
        secO.setAttribute('d', sectorM(O[0], O[1], 34, a, other));
        const lo = polM(O, (a + other) / 2, mode === 'comp' ? 104 : 62);
        setXY(tO, lo[0], lo[1] + 5); tO.textContent = (other - a) + '°';
      } else { secO.setAttribute('d', ''); tO.textContent = ''; }
      rayE.style.display = nE.style.display = bis ? '' : 'none';
      setLine(rayE, O, polM(O, a / 2, 190));
      const ne = polM(O, a / 2, 204); setXY(nE, ne[0], ne[1] + 5);

      let s;
      if (mode === 'comp') {
        if (a < 90) s = `∠1 = ∠AOB = <span class="k1">${a}°</span>。它的余角 ∠BOC = 90° − ${a}° = <span class="k2">${90 - a}°</span>，两个角合起来正好是直角 ∠AOC。`;
        else if (a === 90) s = '∠1 = 90°，正好是直角，<b>没有余角</b>。';
        else s = `∠1 = <span class="k1">${a}°</span>，是钝角，比直角还大，<b>没有余角</b>。只有锐角才有余角。`;
      } else {
        s = `∠1 = ∠AOB = <span class="k1">${a}°</span>。它的补角 ∠BOD = 180° − ${a}° = <span class="k2">${180 - a}°</span>，两个角合起来是平角 ∠AOD。`;
        if (a < 90) s += `它的余角是 ${90 - a}°，补角比余角大 ${180 - a}° − ${90 - a}° = 90°。`;
      }
      if (bis) s += `<br><span class="k3">OE 平分 ∠AOB</span>：∠AOE = ∠EOB = ${fmt(a / 2)}°，是 ∠AOB 的一半。`;
      read.innerHTML = s;
    }
    drag(svg, hB, (p) => {
      let m = deg(Math.atan2(O[1] - p.y, p.x - O[0]));
      if (m < 0) m = p.x > O[0] ? 1 : 179;
      a = clamp(Math.round(m), 1, 179); render();
    }, () => !busy);
    H('p', { class: 'anim-tip' }, el, '提示：拖动射线 OB 末端的圆点，改变 ∠1 的大小。');
    render();
  };

  A.g_anglec_bearing = function (el) {
    const W = 400, Hh = 300, O = [200, 150], R = 112;
    const svg = stage(el, W, Hh);
    S('line', { x1: O[0], y1: 24, x2: O[0], y2: 276, class: 'sline' }, svg);
    S('line', { x1: 64, y1: O[1], x2: 336, y2: O[1], class: 'sline' }, svg);
    S('circle', { cx: O[0], cy: O[1], r: R, class: 'fnone sline' }, svg);
    T(svg, O[0], 18, '北', 'tb'); T(svg, O[0], 294, '南', 'tb');
    T(svg, 344, O[1] + 5, '东', 'tb', 'start'); T(svg, 56, O[1] + 5, '西', 'tb', 'end');
    const pb = (b, r) => [O[0] + r * Math.sin(rad(b)), O[1] - r * Math.cos(rad(b))];
    const sec = S('path', { class: 'f2s' }, svg);
    const ray = S('line', { class: 's1 thick round' }, svg);
    const lab = T(svg, 0, 0, '', 't2 tb');
    S('circle', { cx: O[0], cy: O[1], r: 4, class: 'fstrong' }, svg);
    T(svg, O[0] - 12, O[1] + 18, 'O', 'vname');
    const pN = T(svg, 0, 0, 'P', 'vname');
    const h = S('circle', { r: 13, class: 'handle' }, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let b = 40, target = null;
    const norm = (x) => ((x % 360) + 360) % 360;
    function name(bb) {
      bb = norm(bb);
      if (bb === 0) return '正北';
      if (bb === 90) return '正东';
      if (bb === 180) return '正南';
      if (bb === 270) return '正西';
      if (bb < 90) return `北偏东 ${bb}°`;
      if (bb < 180) return `南偏东 ${180 - bb}°`;
      if (bb < 270) return `南偏西 ${bb - 180}°`;
      return `北偏西 ${360 - bb}°`;
    }
    btn(c, '出一道题', () => {
      const q = Math.floor(Math.random() * 4), k = 1 + Math.floor(Math.random() * 17);
      target = norm(q * 90 + k * 5);
      if (target % 90 === 0) target = norm(target + 25);
      render();
    });
    btn(c, '回到北偏东 40°', () => { b = 40; render(); }, 'alt');

    function render() {
      const P = pb(b, R);
      setLine(ray, O, P); setC(h, P);
      const pn = pb(b, R + 20); setXY(pN, pn[0], pn[1] + 5);
      const axis = (b <= 90 || b >= 270) ? 0 : 180;
      const span = Math.abs(((b - axis + 540) % 360) - 180);
      if (span > 0 && span < 90) {
        sec.setAttribute('d', wedge(O, pb(axis, R), P, 46));
        const d = bisDir(O, pb(axis, R), P);
        setXY(lab, O[0] + d[0] * 64, O[1] + d[1] * 64 + 5); lab.textContent = span + '°';
      } else { sec.setAttribute('d', ''); lab.textContent = ''; }
      let s = `射线 OP 的方向是 <b>${name(b)}</b>`;
      const special = { 45: '东北', 135: '东南', 225: '西南', 315: '西北' }[b];
      if (special) s += `，也叫<b>${special}方向</b>`;
      s += '。';
      if (span > 0 && span < 90) s += `先看正${axis === 0 ? '北' : '南'}方向，再向${b < 180 ? '东' : '西'}转 ${span}°。`;
      s += `<br>反过来，点 O 在点 P 的 <span class="k2">${name(b + 180)}</span> 方向（度数不变，方向全反）。`;
      read.innerHTML = s;
      if (target === null) cap.textContent = '';
      else cap.textContent = b === target ? `任务：把 OP 拖到 ${name(target)} 方向。✓ 对了！` : `任务：把 OP 拖到 ${name(target)} 方向。`;
    }
    drag(svg, h, (p) => {
      const v = Math.round(deg(Math.atan2(p.x - O[0], O[1] - p.y)));
      b = norm(v); render();
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动圆点 P 改变方向。方位角总是从正北或正南开始量。');
    render();
  };

  // ═════════════ 相交线与平行线 ═════════════
  A.g_intersect_vert = function (el) {
    const W = 400, Hh = 250, O = [200, 125], L = 190;
    const svg = stage(el, W, Hh);
    let th = 60, mode = 'vert', busy = false;
    const secs = [0, 1, 2, 3].map(() => S('path', {}, svg));
    const l1 = S('line', { class: 'sstrong' }, svg); setLine(l1, polM(O, 180, L), polM(O, 0, L));
    const l2 = S('line', { class: 'sstrong' }, svg);
    const rm = S('path', { class: 'fnone sstrong thin' }, svg);
    const labs = [0, 1, 2, 3].map(() => T(svg, 0, 0, '', 'tb'));
    S('circle', { cx: O[0], cy: O[1], r: 4, class: 'fstrong' }, svg);
    const h = S('circle', { r: 13, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    btn(c, '看对顶角', () => { mode = 'vert'; render(); });
    btn(c, '看邻补角', () => { mode = 'adj'; render(); });
    const turnTo = (fromV, toV, ms) => {
      if (busy) return;
      busy = true;
      tween(ms, (t, raw) => { th = Math.round(lerp(fromV, toV, ms > 2000 ? raw : t)); render(); }, () => { busy = false; th = toV; render(); });
    };
    btn(c, '转成垂直', () => turnTo(th, 90, 700), 'alt');
    btn(c, '慢慢转动', () => turnTo(20, 160, 3600), 'alt');

    function render() {
      const bd = [0, th, 180, th + 180, 360];
      setLine(l2, polM(O, th + 180, L), polM(O, th, L));
      setC(h, polM(O, th, 100));
      const val = [th, 180 - th, th, 180 - th];
      secs.forEach((s, i) => {
        s.setAttribute('d', sectorM(O[0], O[1], 32, bd[i], bd[i + 1]));
        let cls;
        if (mode === 'vert') cls = i % 2 === 0 ? 'f1s' : 'f2s';
        else cls = i === 0 ? 'f1s' : i === 1 ? 'f2s' : 'fsurf2';
        s.setAttribute('class', cls);
        const p = polM(O, (bd[i] + bd[i + 1]) / 2, 62);
        setXY(labs[i], p[0], p[1] + 5);
        labs[i].textContent = `∠${i + 1}=${val[i]}°`;
        const on = mode === 'vert' || i < 2;
        labs[i].setAttribute('class', 'tb ts ' + (on ? (mode === 'vert' ? (i % 2 === 0 ? 't1' : 't2') : (i === 0 ? 't1' : 't2')) : 'tm'));
      });
      rm.setAttribute('d', th === 90 ? `M${O[0] + 14},${O[1]} v-14 h-14` : '');
      let s;
      if (mode === 'vert') {
        s = `∠1 和 ∠3 是<b>对顶角</b>：<span class="k1">∠1 = ∠3 = ${th}°</span>；∠2 和 ∠4 也是对顶角：<span class="k2">∠2 = ∠4 = ${180 - th}°</span>。不管怎么转，<b>对顶角相等</b>。`;
      } else {
        s = `∠1 和 ∠2 是<b>邻补角</b>（有一条公共边，另一边互为反向延长线）：<span class="k1">${th}°</span> + <span class="k2">${180 - th}°</span> = 180°。∠1 和 ∠3 都与 ∠2 互补，所以 ∠1 = ∠3（同角的补角相等），这就是对顶角相等的道理。`;
      }
      if (th === 90) s += '<br>现在四个角都是 90°：两条直线<b>互相垂直</b>。';
      read.innerHTML = s;
    }
    drag(svg, h, (p) => {
      let m = deg(Math.atan2(O[1] - p.y, p.x - O[0]));
      if (m < 0) m += 180;
      th = clamp(Math.round(m), 20, 160); render();
    }, () => !busy);
    H('p', { class: 'anim-tip' }, el, '提示：拖动圆点转动第二条直线。');
    render();
  };

  A.g_intersect_par = function (el) {
    const W = 440, Hh = 300, P1 = [220, 95], MB = [220, 205];
    const svg = stage(el, W, Hh);
    let th = 60, ph = 0, type = '同位角', idx = 0, busy = false;
    const PAIRS = { '同位角': [[1, 5], [2, 6], [3, 7], [4, 8]], '内错角': [[3, 5], [4, 6]], '同旁内角': [[3, 6], [4, 5]] };
    const WHERE = {
      '同位角': '在截线 c 的同一侧，并且在两条被截直线的同一方（像字母 F）',
      '内错角': '在截线 c 的两侧，并且夹在两条被截直线之间（像字母 Z）',
      '同旁内角': '在截线 c 的同一侧，并且夹在两条被截直线之间（像字母 U）'
    };
    const secs = [];
    for (let i = 0; i < 8; i++) secs.push(S('path', { class: 'fnone' }, svg));
    const la = S('line', { class: 'sstrong' }, svg); setLine(la, [10, P1[1]], [430, P1[1]]);
    const lb = S('line', { class: 'sstrong' }, svg);
    const lc = S('line', { class: 's1' }, svg);
    T(svg, 428, P1[1] - 8, 'a', 'ital tb', 'end');
    const nb = T(svg, 0, 0, 'b', 'ital tb', 'end');
    const nc = T(svg, 0, 0, 'c', 'ital tb t1', 'start');
    const nums = [];
    for (let i = 0; i < 8; i++) nums.push(T(svg, 0, 0, String(i + 1), 'ts tm'));
    const h = S('circle', { r: 13, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    Object.keys(PAIRS).forEach((k) => btn(c, k, () => {
      if (type === k) idx = (idx + 1) % PAIRS[k].length; else { type = k; idx = 0; }
      render();
    }));
    const c2 = ctrl(el);
    const sl = slider(c2, 'tilt', '倾斜', -15, 15, 1, 0, (v) => { ph = v; render(); });
    btn(c2, '摆回平行', () => {
      if (busy || ph === 0) return;
      busy = true;
      const from = ph;
      tween(600, (t) => { ph = Math.round(lerp(from, 0, t)); sl.set(ph); render(); }, () => { busy = false; ph = 0; sl.set(0); render(); });
    }, 'alt');

    function render() {
      const dc = dirM(th), db = dirM(ph);
      const P2 = meet(P1, dc, MB, db);
      setLine(lb, [MB[0] - db[0] * 240, MB[1] - db[1] * 240], [MB[0] + db[0] * 240, MB[1] + db[1] * 240]);
      setLine(lc, [P1[0] + dc[0] * 420, P1[1] + dc[1] * 420], [P1[0] - dc[0] * 420, P1[1] - dc[1] * 420]);
      setXY(nb, MB[0] + db[0] * 208, MB[1] + db[1] * 208 - 8);
      setXY(nc, P1[0] + dc[0] * 52 + 12, P1[1] + dc[1] * 52);
      setC(h, [P1[0] + dc[0] * 72, P1[1] + dc[1] * 72]);
      const bd = [[0, th, 180, th + 180, 360], [ph, th, ph + 180, th + 180, ph + 360]];
      const D = [th, 180 - th, th, 180 - th, th - ph, 180 - th + ph, th - ph, 180 - th + ph];
      const [pi, pj] = PAIRS[type][idx];
      for (let k = 0; k < 8; k++) {
        const V = k < 4 ? P1 : P2, b = bd[k < 4 ? 0 : 1], i = k % 4;
        secs[k].setAttribute('d', sectorM(V[0], V[1], 26, b[i], b[i + 1]));
        const n = k + 1;
        secs[k].setAttribute('class', n === pi ? 'f1s' : n === pj ? 'f2s' : 'fnone');
        const p = polM(V, (b[i] + b[i + 1]) / 2, 40);
        setXY(nums[k], p[0], p[1] + 5);
        nums[k].setAttribute('class', n === pi ? 't1 tb' : n === pj ? 't2 tb' : 'ts tm');
      }
      const di = D[pi - 1], dj = D[pj - 1], par = ph === 0;
      let s = `${par ? '<i>a</i>∥<i>b</i>。' : '现在 <i>a</i> 与 <i>b</i> <b>不平行</b>。'}${type}：<span class="k1">∠${pi} = ${di}°</span>，<span class="k2">∠${pj} = ${dj}°</span>。`;
      if (type === '同旁内角') {
        s += par ? `∠${pi} + ∠${pj} = 180°：<b>两直线平行，同旁内角互补</b>。` : `∠${pi} + ∠${pj} = ${di + dj}°，不是 180°。`;
      } else {
        s += par ? `它们相等：<b>两直线平行，${type}相等</b>。` : `它们不相等。只有两直线平行时，${type}才相等。`;
      }
      s += `<br>${type}的位置：${WHERE[type]}。`;
      read.innerHTML = s;
    }
    drag(svg, h, (p) => {
      let m = deg(Math.atan2(P1[1] - p.y, p.x - P1[0]));
      if (m < 0) m += 180;
      th = clamp(Math.round(m), 40, 140); render();
    }, () => !busy);
    H('p', { class: 'anim-tip' }, el, '提示：拖动截线 c 上的圆点改变它的方向；拖动“倾斜”滑块让直线 b 歪过去。再点一次同一个按钮，换下一对角。');
    render();
  };

  // ═════════════ 平面直角坐标系 ═════════════
  A.g_coord_drag = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const inv = (p) => [Math.round(-6 + (p.x - G.X(-6)) / G.u), Math.round(6 - (p.y - G.Y(6)) / G.u)];
    let x = 3, y = 2, fx = 0, fy = 0, task = null, busy = false;
    const QL = [[3.4, 5.3, '第一象限(+,+)'], [-3.4, 5.3, '第二象限(−,+)'], [-3.4, -5.6, '第三象限(−,−)'], [3.4, -5.6, '第四象限(+,−)']]
      .map(([a, b, s]) => T(svg, G.X(a), G.Y(b), s, 'ts tm'));
    const gx = S('line', { class: 'guide' }, svg), gy = S('line', { class: 'guide' }, svg);
    const cx1 = S('line', { class: 'smuted dash' }, svg), cy1 = S('line', { class: 'smuted dash' }, svg);
    const mx = S('circle', { r: 6, class: 'f1' }, svg), my = S('circle', { r: 6, class: 'f3' }, svg);
    const tmx = T(svg, 0, 0, '', 'ts tb t1'), tmy = T(svg, 0, 0, '', 'ts tb t3');
    const pt = S('circle', { r: 7, class: 'f2' }, svg);
    const tp = T(svg, 0, 0, '', 'tb t2');
    const h = S('circle', { r: 14, class: 'handle' }, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const fly = (which) => {
      if (busy) return;
      busy = true;
      const from = which === 'x' ? fx : fy, to = from > 0.5 ? 0 : 1;
      tween(650, (t) => { if (which === 'x') fx = lerp(from, to, t); else fy = lerp(from, to, t); render(); }, () => { busy = false; render(); });
    };
    btn(c, '关于 <i>x</i> 轴对称', () => fly('x'), 'alt');
    btn(c, '关于 <i>y</i> 轴对称', () => fly('y'), 'alt');
    btn(c, '出一道题', () => {
      let a, b;
      do { a = Math.floor(Math.random() * 11) - 5; b = Math.floor(Math.random() * 11) - 5; } while ((a === x && b === y) || a === 0 || b === 0);
      task = [a, b]; render();
    });
    const label = (t, px, py, s) => {
      t.textContent = s;
      const right = px <= 2;
      t.setAttribute('text-anchor', right ? 'start' : 'end');
      setXY(t, G.X(px) + (right ? 10 : -10), G.Y(py) - 9);
    };

    function render() {
      setC(pt, [G.X(x), G.Y(y)]); setC(h, [G.X(x), G.Y(y)]);
      setLine(gx, [G.X(x), G.Y(y)], [G.X(x), G.Y(0)]);
      setLine(gy, [G.X(x), G.Y(y)], [G.X(0), G.Y(y)]);
      label(tp, x, y, `P(${fmt(x)}, ${fmt(y)})`);
      const q = x > 0 && y > 0 ? 1 : x < 0 && y > 0 ? 2 : x < 0 && y < 0 ? 3 : x > 0 && y < 0 ? 4 : 0;
      QL.forEach((t, i) => t.setAttribute('class', i + 1 === q ? 'ts tb t2' : 'ts tm'));
      // 对称点（飞过去的动画）
      const sx = [x, lerp(y, -y, fx)], sy = [lerp(x, -x, fy), y];
      [[mx, cx1, tmx, sx, fx, `(${fmt(x)}, ${fmt(-y)})`], [my, cy1, tmy, sy, fy, `(${fmt(-x)}, ${fmt(y)})`]].forEach(([dot, ln, tt, p, f, s]) => {
        const on = f > 0.02;
        dot.style.display = ln.style.display = tt.style.display = on ? '' : 'none';
        setC(dot, [G.X(p[0]), G.Y(p[1])]);
        setLine(ln, [G.X(x), G.Y(y)], [G.X(p[0]), G.Y(p[1])]);
        if (on) label(tt, p[0], p[1], f > 0.98 ? s : '');
      });
      let s = `P(${fmt(x)}, ${fmt(y)})：`;
      if (x === 0 && y === 0) s += '这是<b>原点</b>。';
      else if (y === 0) s += '在 <b><i>x</i> 轴上</b>，纵坐标为 0，不属于任何象限。';
      else if (x === 0) s += '在 <b><i>y</i> 轴上</b>，横坐标为 0，不属于任何象限。';
      else s += `在<b>第${'一二三四'[q - 1]}象限</b>，横坐标${x > 0 ? '为正' : '为负'}，纵坐标${y > 0 ? '为正' : '为负'}。`;
      s += `<br>到 <i>x</i> 轴的距离 = |${fmt(y)}| = ${Math.abs(y)}，到 <i>y</i> 轴的距离 = |${fmt(x)}| = ${Math.abs(x)}。`;
      if (fx > 0.98) s += `<br><span class="k1">关于 <i>x</i> 轴的对称点 (${fmt(x)}, ${fmt(-y)})</span>：横坐标不变，纵坐标变成相反数。`;
      if (fy > 0.98) s += `<br><span class="k3">关于 <i>y</i> 轴的对称点 (${fmt(-x)}, ${fmt(y)})</span>：纵坐标不变，横坐标变成相反数。`;
      read.innerHTML = s;
      if (task) cap.textContent = `任务：把点 P 拖到 (${fmt(task[0])}, ${fmt(task[1])})。` + (x === task[0] && y === task[1] ? '✓ 找对了！' : '');
      else cap.textContent = '';
    }
    drag(svg, h, (p) => {
      const [a, b] = inv(p);
      const na = clamp(a, -6, 6), nb = clamp(b, -6, 6);
      if (na !== x || nb !== y) { x = na; y = nb; render(); }
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动橙色的点 P，它会自动对准格点。先横后纵：(横坐标, 纵坐标)。');
    render();
  };

  A.g_coord_move = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const P0 = [[-3, 3], [-4, 1], [-1, 1]], NM = ['A', 'B', 'C'];
    let dx = 0, dy = 0, cx = 0, cy = 0, busy = false;
    const scr = (p) => [G.X(p[0]), G.Y(p[1])];
    S('polygon', { points: ptsStr(P0.map(scr)), class: 'fnone smuted dash' }, svg);
    P0.forEach((p, i) => T(svg, G.X(p[0]) - 8, G.Y(p[1]) - 8, NM[i], 'ts tm', 'end'));
    const arrow = S('line', { class: 'guide' }, svg);
    const poly = S('polygon', { class: 'f1s s1' }, svg);
    const vs = P0.map(() => S('circle', { r: 5, class: 'f1' }, svg));
    const labs = P0.map(() => T(svg, 0, 0, '', 'ts tb t1', 'start'));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const move = (ddx, ddy) => {
      if (busy) return;
      const nx = dx + ddx, ny = dy + ddy;
      const ok = P0.every(([x, y]) => x + nx >= -6 && x + nx <= 6 && y + ny >= -6 && y + ny <= 6);
      if (!ok) { read.innerHTML = '再移就出格子了，换个方向试试。'; return; }
      busy = true;
      const fx = cx, fy = cy;
      dx = nx; dy = ny;
      tween(450, (t) => { cx = lerp(fx, dx, t); cy = lerp(fy, dy, t); render(false); }, () => { busy = false; render(true); });
    };
    btn(c, '← 左移 1', () => move(-1, 0));
    btn(c, '右移 1 →', () => move(1, 0));
    btn(c, '↑ 上移 1', () => move(0, 1));
    btn(c, '↓ 下移 1', () => move(0, -1));
    btn(c, '回到原处', () => { if (!busy && (dx || dy)) move(-dx, -dy); }, 'alt');

    function render(full) {
      const pts = P0.map(([x, y]) => [x + cx, y + cy]);
      poly.setAttribute('points', ptsStr(pts.map(scr)));
      pts.forEach((p, i) => {
        setC(vs[i], scr(p));
        setXY(labs[i], G.X(p[0]) + 7, G.Y(p[1]) + 16);
        labs[i].textContent = (dx || dy) ? NM[i] + '′' : '';
      });
      setLine(arrow, scr(P0[0]), scr(pts[0]));
      arrow.style.display = (cx || cy) ? '' : 'none';
      if (!full) return;
      if (!dx && !dy) { read.innerHTML = '点按钮移动三角形 ABC（虚线是原来的位置）。左右移动改的是横坐标，上下移动改的是纵坐标。'; return; }
      const mv = [];
      if (dx) mv.push(`向${dx > 0 ? '右' : '左'}平移 ${Math.abs(dx)} 个单位`);
      if (dy) mv.push(`向${dy > 0 ? '上' : '下'}平移 ${Math.abs(dy)} 个单位`);
      const rx = dx ? `横坐标都<b>${dx > 0 ? '加' : '减'} ${Math.abs(dx)}</b>` : '横坐标不变';
      const ry = dy ? `纵坐标都<b>${dy > 0 ? '加' : '减'} ${Math.abs(dy)}</b>` : '纵坐标不变';
      read.innerHTML = `${mv.join('，再')}：${rx}，${ry}。<br>` +
        P0.map(([x, y], i) => `${NM[i]}(${fmt(x)}, ${fmt(y)}) → ${NM[i]}′(${fmt(x + dx)}, ${fmt(y + dy)})`).join('；') + '。';
    }
    render(true);
  };

  // ═════════════ 三角形的边与角 ═════════════
  A.g_tri_sticks = function (el) {
    const W = 440, Hh = 260, Y0 = 228;
    const svg = stage(el, W, Hh);
    const len = { a: 3, b: 4, c: 6 };
    let an = [72, 72], state = 'open', stop = null;
    const arcL = S('path', { class: 'fnone smuted dash thin' }, svg);
    const arcR = S('path', { class: 'fnone smuted dash thin' }, svg);
    const fill = S('polygon', { class: 'f3s' }, svg);
    const gap = S('line', { class: 'guide' }, svg);
    const CLS = { a: 's1', b: 's2', c: 's3' }, TC = { a: 't1', b: 't2', c: 't3' };
    const st = {}, lab = {};
    ['a', 'b', 'c'].forEach((k) => {
      st[k] = S('line', { class: CLS[k] + ' round', style: 'stroke-width: 7' }, svg);
      lab[k] = T(svg, 0, 0, '', 'ital tb ' + TC[k]);
    });
    const hinge = [0, 1].map(() => S('circle', { r: 4, class: 'fstrong' }, svg));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const reset = () => { if (stop) stop(); stop = null; an = [72, 72]; state = 'open'; render(); };
    slider(c, 'sa', 'a', 1, 10, 1, len.a, (v) => { len.a = v; reset(); });
    slider(c, 'sb', 'b', 1, 10, 1, len.b, (v) => { len.b = v; reset(); });
    slider(c, 'sc', 'c', 1, 10, 1, len.c, (v) => { len.c = v; reset(); });
    const c2 = ctrl(el);
    btn(c2, '围起来', () => {
      if (state === 'moving') return;
      const g = layout();
      let to;
      if (g.ok) {
        to = [deg(Math.acos((g.p * g.p + g.L * g.L - g.q * g.q) / (2 * g.p * g.L))),
          deg(Math.acos((g.q * g.q + g.L * g.L - g.p * g.p) / (2 * g.q * g.L)))];
      } else to = [0, 0];
      const from = an.slice();
      state = 'moving'; render();
      stop = tween(1300, (t) => { an = [lerp(from[0], to[0], t), lerp(from[1], to[1], t)]; render(); }, () => {
        stop = null; state = g.ok ? 'closed' : 'flat'; render();
      });
    });
    btn(c2, '重新立起来', reset, 'alt');

    function layout() {
      const keys = ['a', 'b', 'c'].sort((p, q) => len[q] - len[p]);
      const L = len[keys[0]], p = len[keys[1]], q = len[keys[2]];
      const u = Math.min(36, 340 / L, 190 / p);
      const x0 = (W - L * u) / 2;
      return { kL: keys[0], kp: keys[1], kq: keys[2], L, p, q, u, x0, x1: x0 + L * u, ok: p + q > L };
    }
    function render() {
      const g = layout();
      const tipL = [g.x0 + g.p * g.u * Math.cos(rad(an[0])), Y0 - g.p * g.u * Math.sin(rad(an[0]))];
      const tipR = [g.x1 - g.q * g.u * Math.cos(rad(an[1])), Y0 - g.q * g.u * Math.sin(rad(an[1]))];
      setLine(st[g.kL], [g.x0, Y0], [g.x1, Y0]);
      setLine(st[g.kp], [g.x0, Y0], tipL);
      setLine(st[g.kq], [g.x1, Y0], tipR);
      setC(hinge[0], [g.x0, Y0]); setC(hinge[1], [g.x1, Y0]);
      arcL.setAttribute('d', arc(g.x0, Y0, g.p * g.u, 0, -PI));
      arcR.setAttribute('d', arc(g.x1, Y0, g.q * g.u, -PI, 0));
      lab[g.kL].textContent = `${g.kL} = ${g.L}`;
      setXY(lab[g.kL], (g.x0 + g.x1) / 2, Y0 + 24);
      lab[g.kp].textContent = `${g.kp} = ${g.p}`;
      lab[g.kp].setAttribute('text-anchor', 'end');
      setXY(lab[g.kp], (g.x0 + tipL[0]) / 2 - 10, (Y0 + tipL[1]) / 2);
      lab[g.kq].textContent = `${g.kq} = ${g.q}`;
      lab[g.kq].setAttribute('text-anchor', 'start');
      setXY(lab[g.kq], (g.x1 + tipR[0]) / 2 + 10, (Y0 + tipR[1]) / 2);
      fill.style.display = state === 'closed' ? '' : 'none';
      fill.setAttribute('points', ptsStr([[g.x0, Y0], [g.x1, Y0], tipL]));
      const showGap = state === 'flat' && g.p + g.q < g.L;
      gap.style.display = showGap ? '' : 'none';
      setLine(gap, [tipL[0], Y0 - 14], [tipR[0], Y0 - 14]);
      // 文字
      const sum = g.p + g.q, cmp = sum > g.L ? '&gt;' : sum === g.L ? '=' : '&lt;';
      const head = `最长的一根是 <i>${g.kL}</i> = ${g.L}，另外两根：<i>${g.kp}</i> + <i>${g.kq}</i> = ${g.p} + ${g.q} = ${sum} ${cmp} ${g.L}`;
      if (state === 'open') read.innerHTML = head + '。虚线是两根小棒的端点能到达的范围。点“围起来”试试。';
      else if (state === 'moving') read.innerHTML = '两根小棒转动中……';
      else if (state === 'closed') read.innerHTML = head + '：两根小棒的端点碰到一起，<b>能围成三角形</b>。两条较短边之和大于最长边就行。';
      else if (sum === g.L) read.innerHTML = head + '：两根小棒要完全放平才刚好碰到，三根叠在一条线上，<b>围不成三角形</b>。';
      else read.innerHTML = head + `：放平了还差 ${g.L - sum}，两根小棒碰不到，<b>围不成三角形</b>（虚线圆弧没有交点）。`;
    }
    H('p', { class: 'anim-tip' }, el, '提示：拖动滑块改变三根小棒的长度。最长的一根总是放在底下。试试 2、3、6 和 3、3、6。');
    render();
  };

  A.g_tri_ext = function (el) {
    const W = 440, Hh = 260;
    const svg = stage(el, W, Hh);
    const B = [60, 220], C = [270, 220], D = [428, 220];
    let Ap = [140, 70], t = 0, busy = false;
    S('line', { x1: B[0], y1: B[1], x2: D[0], y2: D[1], class: 'sstrong' }, svg);
    const ext = S('path', { class: 'f3s' }, svg);
    const tri = S('polygon', { class: 'tri' }, svg);
    const wA = S('path', { class: 'f1s' }, svg), wB = S('path', { class: 'f2s' }, svg);
    const ce = S('line', { class: 'smuted dash' }, svg);
    const mA = S('path', { class: 'f1', style: 'opacity: .7' }, svg);
    const mB = S('path', { class: 'f2', style: 'opacity: .7' }, svg);
    const nA = T(svg, 0, 0, 'A', 'vname');
    T(svg, B[0] - 6, B[1] + 22, 'B', 'vname');
    T(svg, C[0], C[1] + 22, 'C', 'vname');
    T(svg, D[0] - 6, D[1] + 22, 'D', 'vname');
    const nE = T(svg, 0, 0, 'E', 'vname');
    const tA = T(svg, 0, 0, '', 'ts tb t1'), tB = T(svg, 0, 0, '', 'ts tb t2'), tX = T(svg, 0, 0, '', 'tb t3');
    const h = S('circle', { r: 13, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const go = btn(c, '把 ∠A、∠B 拼到外角上', () => {
      if (busy) return;
      busy = true;
      const from = t, to = t ? 0 : 1;
      tween(1600, (k) => { t = lerp(from, to, k); render(); }, () => {
        busy = false; t = to; render();
        go.textContent = to ? '放回去' : '把 ∠A、∠B 拼到外角上';
      });
    });

    function render() {
      const M = [(Ap[0] + C[0]) / 2, (Ap[1] + C[1]) / 2];
      tri.setAttribute('points', ptsStr([Ap, B, C]));
      const r = 30;
      const dA = wedge(Ap, B, C, r), dB = wedge(B, C, Ap, r);
      wA.setAttribute('d', dA); wB.setAttribute('d', dB);
      mA.setAttribute('d', dA); mB.setAttribute('d', dB);
      mA.setAttribute('transform', `rotate(${(180 * t).toFixed(2)} ${M[0].toFixed(1)} ${M[1].toFixed(1)})`);
      mB.setAttribute('transform', `translate(${((C[0] - B[0]) * t).toFixed(1)},0)`);
      mA.style.display = mB.style.display = t > 0.001 ? '' : 'none';
      ext.setAttribute('d', wedge(C, Ap, D, 54));
      const L = dist(B, Ap), u = [(Ap[0] - B[0]) / L, (Ap[1] - B[1]) / L];
      const E = [C[0] + u[0] * 150, C[1] + u[1] * 150];
      setLine(ce, C, E);
      ce.style.opacity = nE.style.opacity = t;
      setXY(nE, E[0] + 10, E[1]);
      const ba = bisDir(Ap, B, C);
      setXY(nA, Ap[0] - ba[0] * 18, Ap[1] - ba[1] * 18 + 5);
      setC(h, Ap);
      const gA = Math.round(angDeg(Ap, B, C)), gB = Math.round(angDeg(B, C, Ap));
      const gX = gA + gB, gC = 180 - gX;
      setXY(tA, Ap[0] + ba[0] * 46, Ap[1] + ba[1] * 46 + 4); tA.textContent = gA + '°';
      const bb = bisDir(B, C, Ap);
      setXY(tB, B[0] + bb[0] * 46, B[1] + bb[1] * 46 + 4); tB.textContent = gB + '°';
      const bx = bisDir(C, Ap, D);
      setXY(tX, C[0] + bx[0] * 76, C[1] + bx[1] * 76 + 5); tX.textContent = gX + '°';
      tA.style.opacity = tB.style.opacity = 1 - t;
      let s = `外角 <span class="k3">∠ACD = ${gX}°</span> = <span class="k1">∠A ${gA}°</span> + <span class="k2">∠B ${gB}°</span>。`;
      if (t >= 1) s += '<br>∠B 沿直线 BD 平移到 C（同位角），∠A 绕 AC 的中点转半圈到 C（内错角），两块正好把外角拼满，CE∥AB。';
      else if (t <= 0) s += `<br>∠ACB = ${gC}°，它和外角 ∠ACD 合起来是平角：${gC}° + ${gX}° = 180°。`;
      else s = '两个角正在移动……';
      read.innerHTML = s;
    }
    drag(svg, h, (p) => { Ap = [clamp(p.x, 30, 330), clamp(p.y, 40, 185)]; render(); }, () => !busy && t === 0);
    H('p', { class: 'anim-tip' }, el, '提示：拖动顶点 A 改变三角形的形状（拼好后要先放回去才能拖）。');
    render();
  };

  // ═════════════ 全等三角形 ═════════════
  A.g_congr_move = function (el) {
    const W = 440, Hh = 250, AXX = 220, CY = 130;
    const svg = stage(el, W, Hh);
    const ORIG = [[85, 60], [40, 180], [180, 170]];
    const MODES = { move: '平移', turn: '旋转', flip: '翻折' };
    let mode = 'move', t = 0, busy = false;
    const axisL = S('line', { x1: AXX, y1: 10, x2: AXX, y2: 240, class: 's3 dash' }, svg);
    const pivot = S('circle', { cx: AXX, cy: CY, r: 5, class: 'f3' }, svg);
    const orig = S('polygon', { points: ptsStr(ORIG), class: 'f1s s1' }, svg);
    const copy = S('polygon', { class: 'f2s s2', style: 'opacity: .85' }, svg);
    const G0 = [(ORIG[0][0] + ORIG[1][0] + ORIG[2][0]) / 3, (ORIG[0][1] + ORIG[1][1] + ORIG[2][1]) / 3];
    ['A', 'B', 'C'].forEach((n, i) => {
      const v = ORIG[i], d = dist(v, G0);
      T(svg, v[0] + (v[0] - G0[0]) / d * 14, v[1] + (v[1] - G0[1]) / d * 14 + 5, n, 'tb t1');
    });
    const cl = ['D', 'E', 'F'].map((n) => T(svg, 0, 0, n, 'tb t2'));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const anim = (to, done) => {
      busy = true;
      const from = t;
      tween(1500, (k) => { t = lerp(from, to, k); render(); }, () => { t = to; busy = false; render(); if (done) done(); });
    };
    Object.keys(MODES).forEach((m) => btn(c, MODES[m], () => {
      if (busy) return;
      mode = m; t = 1; render();
      anim(0);
    }));
    const ov = btn(c, '叠上去', () => {
      if (busy) return;
      anim(t > 0.5 ? 0 : 1, () => { ov.textContent = t ? '分开' : '叠上去'; });
    }, 'alt');
    // t = 1：与原三角形重合；t = 0：变换后的位置
    function place(p) {
      if (mode === 'move') return [p[0] + 220 * (1 - t), p[1]];
      if (mode === 'flip') return [AXX + (p[0] - AXX) * (2 * t - 1), p[1]];
      const r = rad(180 * (1 - t)), x = p[0] - AXX, y = p[1] - CY;
      return [AXX + x * Math.cos(r) - y * Math.sin(r), CY + x * Math.sin(r) + y * Math.cos(r)];
    }
    function render() {
      const P = ORIG.map(place);
      copy.setAttribute('points', ptsStr(P));
      const G = [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
      P.forEach((v, i) => {
        const d = dist(v, G) || 1;
        setXY(cl[i], v[0] + (v[0] - G[0]) / d * 30, v[1] + (v[1] - G[1]) / d * 30 + 5);
      });
      axisL.style.display = mode === 'flip' ? '' : 'none';
      pivot.style.display = mode === 'turn' ? '' : 'none';
      ov.textContent = t > 0.5 ? '分开' : '叠上去';
      const how = { move: '向右平移', turn: '绕绿色的点旋转 180°', flip: '沿绿色虚线翻折' }[mode];
      if (busy) read.innerHTML = '移动中……';
      else if (t >= 1) {
        read.innerHTML = `<b>完全重合！</b>△ABC ≌ △DEF，对应顶点：A 与 D、B 与 E、C 与 F。<br>对应边相等：AB = DE，BC = EF，CA = FD；对应角相等：∠A = ∠D，∠B = ∠E，∠C = ∠F。`;
      } else {
        read.innerHTML = `橙色的 △DEF 是把 △ABC ${how}得到的。${MODES[mode]}只改变位置，<b>不改变形状和大小</b>。点“叠上去”，看它们能不能完全重合。`;
      }
    }
    render();
  };

  A.g_congr_build = function (el) {
    const W = 440, Hh = 262, U = 40, Y0 = 212;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let busy = false, cur = 'SSS';
    const B = [70, Y0];
    const line = (p, q, cls) => S('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: cls }, g);
    const grow = (p, q, cls) => {
      const ln = line(p, p, cls);
      return (t) => { ln.setAttribute('x2', lerp(p[0], q[0], t)); ln.setAttribute('y2', lerp(p[1], q[1], t)); };
    };
    const growArc = (cx, cy, r, s0, s1, cls) => {
      const pth = S('path', { class: cls }, g);
      return (t) => pth.setAttribute('d', t < 0.01 ? '' : arc(cx, cy, r, s0, lerp(s0, s1, t)));
    };
    const fade = (e) => { e.setAttribute('opacity', 0); return (t) => e.setAttribute('opacity', t); };
    const all = (...fs) => (t) => fs.forEach((f) => f(t));
    const dot = (P, name, dx, dy) => {
      const gg = S('g', {}, g);
      S('circle', { cx: P[0], cy: P[1], r: 4, class: 'fstrong' }, gg);
      T(gg, P[0] + dx, P[1] + dy, name, 'vname');
      return gg;
    };
    const mark = (V, m1, m2, r, label) => {
      const gg = S('g', {}, g);
      S('path', { d: sectorM(V[0], V[1], r, m1, m2), class: 'f2s s2 thin' }, gg);
      const p = polM(V, (m1 + m2) / 2, r + 16);
      T(gg, p[0], p[1] + 4, label, 'ts tb t2');
      return gg;
    };
    const tri = (pts, cls) => S('polygon', { points: ptsStr(pts), class: cls }, g);

    const CASES = {
      SSS() {
        const C = [B[0] + 7 * U, Y0];
        const ax = (49 + 25 - 36) / 14, ay = Math.sqrt(25 - ax * ax);
        const Ap = [B[0] + ax * U, Y0 - ay * U];
        const f = fade(tri([Ap, B, C], 'f1s s1'));
        dot(B, 'B', -8, 22); dot(C, 'C', 8, 22);
        const fa = fade(dot(Ap, 'A', -14, -6));
        return {
          given: '已知三边：BC = 7，AB = 5，AC = 6',
          steps: [
            [600, grow(B, C, 'sstrong'), '① 画线段 BC = 7'],
            [1000, growArc(B[0], Y0, 5 * U, -0.05, -PI + 0.05, 'fnone s2 dash'), '② 以 B 为圆心、5 为半径画弧'],
            [1000, growArc(C[0], Y0, 6 * U, -PI + 0.05, -0.05, 'fnone s3 dash'), '③ 以 C 为圆心、6 为半径画弧'],
            [600, all(f, fa), '④ 两弧交于点 A，连接 AB、AC']
          ],
          done: '三条边定了，两条弧在 BC 上方只有一个交点 A，三角形就<b>唯一确定</b>：<b>SSS</b> 可以判定全等。（BC 下方的交点画出的三角形，翻折过来和它重合。）'
        };
      },
      SAS() {
        const C = [B[0] + 7 * U, Y0];
        const Ap = polM(B, 50, 5 * U);
        const f = fade(tri([Ap, B, C], 'f1s s1'));
        dot(B, 'B', -8, 22); dot(C, 'C', 8, 22);
        const fa = fade(dot(Ap, 'A', -14, -6));
        return {
          given: '已知：BC = 7，∠B = 50°，AB = 5',
          steps: [
            [600, grow(B, C, 'sstrong'), '① 画线段 BC = 7'],
            [800, all(grow(B, polM(B, 50, 300), 'smuted dash'), fade(mark(B, 0, 50, 26, '50°'))), '② 在 B 处画 ∠B = 50°，得到一条射线'],
            [700, all(grow(B, Ap, 's2 thick'), fa), '③ 在射线上截取 BA = 5，点 A 就定下来了'],
            [600, all(grow(Ap, C, 'sstrong'), f), '④ 连接 AC']
          ],
          done: '两边和它们的<b>夹角</b>定了，点 A 只有一个位置：<b>SAS</b> 可以判定全等。'
        };
      },
      ASA() {
        const C = [B[0] + 6 * U, Y0];
        const Ap = meet(B, dirM(50), C, dirM(120));
        const f = fade(tri([Ap, B, C], 'f1s s1'));
        dot(B, 'B', -8, 22); dot(C, 'C', 8, 22);
        const fa = fade(dot(Ap, 'A', -14, -6));
        return {
          given: '已知：BC = 6，∠B = 50°，∠C = 60°',
          steps: [
            [600, grow(B, C, 'sstrong'), '① 画线段 BC = 6'],
            [800, all(grow(B, polM(B, 50, 290), 'smuted dash'), fade(mark(B, 0, 50, 26, '50°'))), '② 在 B 处画 ∠B = 50°'],
            [800, all(grow(C, polM(C, 120, 250), 'smuted dash'), fade(mark(C, 120, 180, 26, '60°'))), '③ 在 C 处画 ∠C = 60°'],
            [600, all(f, fa), '④ 两条射线只交于一点 A']
          ],
          done: '两角和它们的<b>夹边</b>定了，两条射线只有一个交点：<b>ASA</b> 可以判定全等。两个角定了，第三个角也定了（内角和 180°），所以 <b>AAS</b> 也可以。'
        };
      },
      SSA() {
        const Ap = polM(B, 40, 6 * U);
        const r = 4.5 * U, hgt = Y0 - Ap[1], half = Math.sqrt(r * r - hgt * hgt);
        const C1 = [Ap[0] - half, Y0], C2 = [Ap[0] + half, Y0];
        const f2 = fade(tri([Ap, B, C2], 'f2s s2'));
        const f1 = fade(tri([Ap, B, C1], 'f1s s1'));
        dot(B, 'B', -8, 22);
        const fa = fade(dot(Ap, 'A', -6, -12));
        const fc = all(fade(dot(C1, 'C₁', 0, 22)), fade(dot(C2, 'C₂', 0, 22)));
        return {
          given: '已知：AB = 6，AC = 4.5，∠B = 40°',
          steps: [
            [600, grow(B, [430, Y0], 'sstrong'), '① 画 ∠B 的一条边（点 C 在这条射线上，位置还不知道）'],
            [800, all(grow(B, Ap, 'sstrong'), fade(mark(B, 0, 40, 30, '40°')), fa), '② 画 ∠B = 40° 的另一条边，截取 BA = 6'],
            [1100, all(growArc(Ap[0], Ap[1], r, PI / 2, PI / 2 + 1.2, 'fnone s2 dash'), growArc(Ap[0], Ap[1], r, PI / 2, PI / 2 - 1.2, 'fnone s2 dash')), '③ 以 A 为圆心、4.5 为半径画弧，找点 C'],
            [700, all(f1, f2, fc), '④ 弧和射线有两个交点 C₁、C₂！']
          ],
          done: '蓝色 △ABC₁ 和橙色 △ABC₂ 都满足 AB = 6、AC = 4.5、∠B = 40°，但形状明显不同，<b>不全等</b>。所以“两边和其中一边的对角对应相等”（SSA）<b>不能</b>判定全等。'
        };
      }
    };
    function play(name, instant) {
      if (busy) return;
      cur = name;
      g.innerHTML = '';
      const plan = CASES[name]();
      T(g, W / 2, Hh - 6, plan.given, 'tb');
      read.innerHTML = '';
      if (instant || RM) {
        plan.steps.forEach((s) => s[1](1));
        cap.textContent = name === 'SSA' ? 'SSA：画出了两个不同的三角形' : `${name}：只能画出一个三角形`;
        read.innerHTML = plan.done;
        return;
      }
      busy = true;
      let i = 0;
      const next = () => {
        if (i >= plan.steps.length) { busy = false; read.innerHTML = plan.done; return; }
        const [ms, fn, txt] = plan.steps[i++];
        cap.textContent = txt;
        tween(ms, fn, () => setTimeout(next, 300));
      };
      next();
    }
    btn(c, 'SSS', () => play('SSS'));
    btn(c, 'SAS', () => play('SAS'));
    btn(c, 'ASA', () => play('ASA'));
    btn(c, 'SSA（不行）', () => play('SSA'));
    btn(c, '再画一次', () => play(cur), 'alt');
    play('SSS', true);
  };

  // ═════════════ 轴对称与等腰三角形 ═════════════
  A.g_axis_fold = function (el) {
    const W = 440, Hh = 260, AX = 220;
    const svg = stage(el, W, Hh);
    const half = [[220, 28], [175, 62], [108, 40], [66, 92], [118, 132], [78, 196], [150, 222], [220, 182]];
    const mir = (p) => [2 * AX - p[0], p[1]];
    S('polygon', { points: ptsStr(half.map(mir)), class: 'fnone smuted dash' }, svg);
    S('polygon', { points: ptsStr(half), class: 'f1s s1' }, svg);
    S('line', { x1: AX, y1: 8, x2: AX, y2: 252, class: 's3 dash' }, svg);
    T(svg, AX + 8, 22, 'l', 'ital tb t3', 'start');
    const seg = S('line', { class: 's2' }, svg);
    const rm = S('path', { class: 'fnone sstrong thin' }, svg);
    const dL = T(svg, 0, 0, '', 'ts tb t2'), dR = T(svg, 0, 0, '', 'ts tb t2');
    const pp = S('circle', { r: 5, class: 'f2' }, svg), qq = S('circle', { r: 5, class: 'f2' }, svg);
    const pN = T(svg, 0, 0, 'P', 'vname'), qN = T(svg, 0, 0, 'P′', 'vname');
    const flipG = S('g', {}, svg);
    S('polygon', { points: ptsStr(half), class: 'f1s s1', style: 'opacity: .85' }, flipG);
    const fp = S('circle', { r: 6, class: 'f2' }, flipG);
    const h = S('circle', { r: 13, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let P = [140, 108], f = 0, busy = false;
    const fb = btn(c, '沿 <i>l</i> 翻折', () => {
      if (busy) return;
      busy = true;
      const from = f, to = f ? 0 : 1;
      tween(1500, (t) => { f = lerp(from, to, t); render(); }, () => {
        busy = false; f = to; render();
        fb.innerHTML = to ? '展开' : '沿 <i>l</i> 翻折';
      });
    });
    function render() {
      const Q = mir(P), F = [AX, P[1]];
      flipG.setAttribute('transform', `translate(${AX},0) scale(${(1 - 2 * f).toFixed(3)},1) translate(${-AX},0)`);
      flipG.style.display = f > 0.001 ? '' : 'none';
      setC(fp, P);
      setLine(seg, P, Q);
      rm.setAttribute('d', `M${AX - 10},${F[1]} v-10 h10`);
      setC(pp, P); setC(qq, Q); setC(h, P);
      setXY(pN, P[0] - 14, P[1] - 10); setXY(qN, Q[0] + 16, Q[1] - 10);
      const d = len1(AX - P[0]);
      dL.textContent = d; dR.textContent = d;
      setXY(dL, (P[0] + AX) / 2, P[1] + 18); setXY(dR, (Q[0] + AX) / 2, P[1] + 18);
      if (busy) read.innerHTML = '正在沿对称轴翻折……';
      else if (f >= 1) read.innerHTML = '翻过去后，左边的图形和右边的虚线框<b>完全重合</b>，点 P 正好落在 P′ 上。成轴对称的两个图形<b>全等</b>。';
      else read.innerHTML = `P 和 P′ 关于直线 <i>l</i> 对称：P 到 <i>l</i> 的距离 = P′ 到 <i>l</i> 的距离 = <span class="k2">${d}</span>，并且 PP′ ⊥ <i>l</i>。也就是说，<b>对称轴垂直平分对应点的连线</b>。`;
    }
    drag(svg, h, (p) => { P = [clamp(p.x, 20, AX - 14), clamp(p.y, 20, Hh - 20)]; render(); }, () => !busy);
    H('p', { class: 'anim-tip' }, el, '提示：拖动左边的点 P，看它的对称点 P′ 怎样跟着动。');
    render();
  };

  A.g_axis_perp = function (el) {
    const W = 440, Hh = 260, PA = [130, 205], PB = [310, 205], MX = 220;
    const svg = stage(el, W, Hh);
    S('line', { x1: MX, y1: 10, x2: MX, y2: 252, class: 's3 dash' }, svg);
    T(svg, MX + 8, 22, 'l', 'ital tb t3', 'start');
    S('line', { x1: PA[0], y1: PA[1], x2: PB[0], y2: PB[1], class: 'sstrong' }, svg);
    S('path', { d: `M${MX},${PA[1] - 12} h12 v12`, class: 'fnone sstrong thin' }, svg);
    [175, 265].forEach((x) => S('line', { x1: x, y1: PA[1] - 6, x2: x, y2: PA[1] + 6, class: 'sstrong thin' }, svg));
    const lA = S('line', { class: 's1' }, svg), lB = S('line', { class: 's2' }, svg);
    const tA = T(svg, 0, 0, '', 'ts tb t1', 'end'), tB = T(svg, 0, 0, '', 'ts tb t2', 'start');
    [PA, PB].forEach((p) => S('circle', { cx: p[0], cy: p[1], r: 4, class: 'fstrong' }, svg));
    S('circle', { cx: MX, cy: PA[1], r: 3, class: 'fstrong' }, svg);
    T(svg, PA[0] - 8, PA[1] + 20, 'A', 'vname'); T(svg, PB[0] + 8, PB[1] + 20, 'B', 'vname');
    T(svg, MX - 10, PA[1] + 20, 'M', 'vname');
    const pt = S('circle', { r: 5, class: 'f2' }, svg);
    const pN = T(svg, 0, 0, 'P', 'vname');
    const h = S('circle', { r: 13, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let P = [MX, 70], busy = false;
    btn(c, '让 P 在 <i>l</i> 上走一走', () => {
      if (busy) return;
      busy = true;
      tween(3000, (t, raw) => { P = [MX, lerp(24, 245, raw)]; render(); }, () => { busy = false; P = [MX, 70]; render(); });
    });
    btn(c, '把 P 放回 <i>l</i> 上', () => { if (!busy) { P = [MX, P[1]]; render(); } }, 'alt');
    function render() {
      setLine(lA, P, PA); setLine(lB, P, PB);
      setC(pt, P); setC(h, P); setXY(pN, P[0] + 14, P[1] - 8);
      const a = len1(dist(P, PA)), b = len1(dist(P, PB));
      tA.textContent = a; tB.textContent = b;
      setXY(tA, (P[0] + PA[0]) / 2 - 8, (P[1] + PA[1]) / 2);
      setXY(tB, (P[0] + PB[0]) / 2 + 8, (P[1] + PB[1]) / 2);
      if (P[0] === MX) {
        read.innerHTML = `P 在线段 AB 的垂直平分线 <i>l</i> 上：<span class="k1">PA = ${a}</span>，<span class="k2">PB = ${b}</span>，<b>PA = PB</b>。<br>垂直平分线上的点，到线段两个端点的距离相等。`;
      } else {
        const left = P[0] < MX;
        read.innerHTML = `P 不在 <i>l</i> 上：<span class="k1">PA = ${a}</span>，<span class="k2">PB = ${b}</span>，不相等。P 在 <i>l</i> 的${left ? '左' : '右'}侧，离 ${left ? 'A' : 'B'} 更近。<br>反过来，到 A、B 距离相等的点，一定在 <i>l</i> 上。`;
      }
    }
    drag(svg, h, (p) => {
      let x = clamp(p.x, 20, W - 20);
      if (Math.abs(x - MX) < 8) x = MX;
      P = [x, clamp(p.y, 20, Hh - 15)]; render();
    }, () => !busy);
    H('p', { class: 'anim-tip' }, el, '提示：拖动点 P。靠近绿色虚线时，P 会自动吸到线上。');
    render();
  };

  A.g_axis_iso = function (el) {
    const W = 440, Hh = 270, B = [110, 235], C = [330, 235], MX = 220;
    const svg = stage(el, W, Hh);
    S('line', { x1: MX, y1: 20, x2: MX, y2: 262, class: 'sline dash' }, svg);
    const tri = S('polygon', { class: 'tri' }, svg);
    const bs = S('line', { class: 's3', style: 'stroke-width: 8; opacity: .45' }, svg);
    const md = S('line', { class: 's2', style: 'stroke-width: 4' }, svg);
    const hl = S('line', { class: 's1 dash' }, svg);
    const rm = S('path', { class: 'fnone sstrong thin' }, svg);
    const fH = S('circle', { r: 4, class: 'f1' }, svg), fM = S('circle', { r: 4, class: 'f2' }, svg), fE = S('circle', { r: 4, class: 'f3' }, svg);
    const nA = T(svg, 0, 0, 'A', 'vname');
    T(svg, B[0] - 12, B[1] + 6, 'B', 'vname', 'end');
    T(svg, C[0] + 12, C[1] + 6, 'C', 'vname', 'start');
    const tB = T(svg, B[0] + 44, B[1] - 8, '', 'ts tb'), tC = T(svg, C[0] - 44, C[1] - 8, '', 'ts tb');
    const h = S('circle', { r: 13, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let Ap = [MX, 80], busy = false;
    const moveTo = (to) => {
      if (busy) return;
      busy = true;
      const from = Ap.slice();
      tween(800, (t) => { Ap = [lerp(from[0], to[0], t), lerp(from[1], to[1], t)]; render(); }, () => { busy = false; Ap = to; render(); });
    };
    btn(c, '变成不等腰', () => moveTo([150, 90]), 'alt');
    btn(c, '变回等腰', () => moveTo([MX, Ap[1]]));
    btn(c, '变成等边', () => moveTo([MX, B[1] - 110 * Math.sqrt(3)]));
    function render() {
      tri.setAttribute('points', ptsStr([Ap, B, C]));
      const ab = dist(Ap, B), ac = dist(Ap, C), bc = dist(B, C);
      const Hf = [Ap[0], B[1]], Mf = [MX, B[1]];
      const k = ab / (ab + ac), Ef = [lerp(B[0], C[0], k), B[1]];
      setLine(bs, Ap, Ef); setLine(md, Ap, Mf); setLine(hl, Ap, Hf);
      setC(fH, Hf); setC(fM, Mf); setC(fE, Ef);
      rm.setAttribute('d', `M${Hf[0] + 10},${Hf[1]} v-10 h-10`);
      setXY(nA, Ap[0], Ap[1] - 12); setC(h, Ap);
      const gB = Math.round(angDeg(B, C, Ap)), gC = Math.round(angDeg(C, B, Ap));
      tB.textContent = gB + '°'; tC.textContent = gC + '°';
      const iso = Math.abs(Ap[0] - MX) < 0.01;
      const equi = iso && Math.abs(ab - bc) < 0.5;
      if (busy) { read.innerHTML = '顶点 A 移动中……'; return; }
      if (iso) {
        read.innerHTML = `AB = AC = ${len1(ab)}，是<b>等腰三角形</b>，∠B = ∠C = ${gB}°（<b>等边对等角</b>）。<br><span class="k3">顶角平分线</span>、<span class="k2">底边上的中线</span>、<span class="k1">底边上的高</span>重合成一条线：<b>三线合一</b>。` +
          (equi ? '<br>三条边都相等，这是<b>等边三角形</b>，三个角都是 60°。' : '');
      } else {
        read.innerHTML = `AB = ${len1(ab)}，AC = ${len1(ac)}，不相等；∠B = ${gB}°，∠C = ${gC}°，也不相等。<br>现在<span class="k1">高</span>、<span class="k2">中线</span>、<span class="k3">角平分线</span>分成了三条不同的线。把 A 拖回中间的虚线上试试。`;
      }
    }
    drag(svg, h, (p) => {
      let x = clamp(p.x, 120, 320);
      if (Math.abs(x - MX) < 7) x = MX;
      Ap = [x, clamp(p.y, 40, 200)]; render();
    }, () => !busy);
    H('p', { class: 'anim-tip' }, el, '提示：拖动顶点 A。蓝色虚线是高，橙色是中线，绿色宽线是角平分线。');
    render();
  };

  // 最短路径（将军饮马）：A、B 在直线 l 同侧，在 l 上找 P 使 PA + PB 最小
  A.g_axis_shortest = function (el) {
    const W = 440, Hh = 300, LY = 170, PA = [110, 60], PB = [330, 100];
    const AS = [PA[0], 2 * LY - PA[1]]; // A 关于 l 的对称点 A′
    const BX = AS[0] + ((PB[0] - AS[0]) * (AS[1] - LY)) / (AS[1] - PB[1]); // A′B 与 l 的交点横坐标
    const svg = stage(el, W, Hh);
    S('line', { x1: 10, y1: LY, x2: W - 10, y2: LY, class: 'sstrong' }, svg);
    T(svg, W - 14, LY - 8, 'l', 'ital tb', 'end');
    T(svg, W - 30, LY + 20, '（河边）', 'ts tm', 'end');
    const best = S('line', { x1: AS[0], y1: AS[1], x2: PB[0], y2: PB[1], class: 's3 dash' }, svg);
    const symG = S('g', {}, svg);
    const lAA = S('line', { class: 'sline dash' }, symG);
    S('path', { d: `M${PA[0] + 10},${LY} v-10 h-10`, class: 'fnone sstrong thin' }, symG);
    const lPS = S('line', { class: 's1 dash' }, symG);
    const cS = S('circle', { r: 4, class: 'fmuted' }, symG);
    const nS = T(symG, 0, 0, 'A′', 'vname');
    const tPS = T(symG, 0, 0, '', 'ts tb t1', 'end');
    const lA = S('line', { class: 's1' }, svg), lB = S('line', { class: 's2' }, svg);
    const tA = T(svg, 0, 0, '', 'ts tb t1', 'end'), tB = T(svg, 0, 0, '', 'ts tb t2', 'start');
    [PA, PB].forEach((p) => S('circle', { cx: p[0], cy: p[1], r: 4, class: 'fstrong' }, svg));
    T(svg, PA[0] - 14, PA[1] - 6, 'A', 'vname'); T(svg, PB[0] + 14, PB[1] - 6, 'B', 'vname');
    const pt = S('circle', { r: 5, class: 'f2' }, svg);
    const pN = T(svg, 0, 0, 'P', 'vname');
    const h = S('circle', { r: 13, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let P = [180, LY], sym = 0, busy = false;
    function render() {
      const Ac = [PA[0], lerp(PA[1], AS[1], sym)];
      symG.style.display = sym > 0.001 ? '' : 'none';
      setLine(lAA, PA, Ac); setC(cS, Ac); setXY(nS, Ac[0] - 18, Ac[1] + 6);
      setLine(lPS, P, Ac);
      setLine(lA, P, PA); setLine(lB, P, PB);
      setC(pt, P); setC(h, P); setXY(pN, P[0] + 14, P[1] - 10);
      const a = +len1(dist(P, PA)), b = +len1(dist(P, PB)), s = (a + b).toFixed(1);
      tA.textContent = a.toFixed(1); tB.textContent = b.toFixed(1);
      tPS.textContent = sym >= 1 ? a.toFixed(1) : '';
      setXY(tA, (P[0] + PA[0]) / 2 - 8, (P[1] + PA[1]) / 2);
      setXY(tB, (P[0] + PB[0]) / 2 + 8, (P[1] + PB[1]) / 2);
      setXY(tPS, (P[0] + Ac[0]) / 2 - 8, (P[1] + Ac[1]) / 2 + 6);
      const on = Math.abs(P[0] - BX) < 0.5;
      best.style.display = on && sym >= 1 ? '' : 'none';
      if (busy) { read.innerHTML = sym < 1 ? '正在作点 A 关于 <i>l</i> 的对称点 A′……' : '点 P 正在移到 A′B 与 <i>l</i> 的交点……'; return; }
      let txt = `<span class="k1">PA = ${a.toFixed(1)}</span>，<span class="k2">PB = ${b.toFixed(1)}</span>，<b>PA + PB = ${s}</b>。`;
      if (on && sym >= 1) txt += '<br>A′、P、B 在同一条直线上：PA + PB = PA′ + PB = A′B，这时最小。<span class="k3">两点之间，线段最短</span>。';
      else if (on) txt += '<br>这就是最小值！为什么偏偏是这里？点“作对称点”找原因。';
      else if (sym >= 1) txt += '<br><i>l</i> 垂直平分 AA′，所以 <span class="k1">PA′ = PA</span>，PA + PB = PA′ + PB，就是折线 A′→P→B 的长。折线什么时候最短？点“找最短”。';
      else txt += '<br>A、B 在 <i>l</i> 的同侧。左右拖动 P，看 PA + PB 什么时候最小。';
      read.innerHTML = txt;
    }
    function showSym(done) {
      if (sym >= 1) { if (done) done(); return; }
      busy = true;
      tween(1000, (t) => { sym = t; render(); }, () => { sym = 1; busy = false; render(); if (done) done(); });
    }
    btn(c, '作对称点', () => { if (!busy) showSym(); });
    btn(c, '找最短', () => {
      if (busy) return;
      showSym(() => {
        busy = true;
        const from = P[0];
        tween(1000, (t) => { P = [lerp(from, BX, t), LY]; render(); }, () => { busy = false; P = [BX, LY]; render(); });
      });
    });
    btn(c, '重置', () => { if (busy) return; sym = 0; P = [180, LY]; render(); }, 'alt');
    drag(svg, h, (p) => {
      let x = clamp(p.x, 20, W - 20);
      if (Math.abs(x - BX) < 5) x = BX;
      P = [x, LY]; render();
    }, () => !busy);
    H('p', { class: 'anim-tip' }, el, '提示：点 P 只能在直线 <i>l</i> 上左右拖动。靠近最短位置时会自动吸过去。');
    render();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
