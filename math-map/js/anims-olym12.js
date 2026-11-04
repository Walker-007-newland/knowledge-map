// olym12 组动画：奥数拓展·八、九年级几何竞赛
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint } = window.AH;
  const PI = Math.PI;
  const A = {};

  // ───────── 本组通用小工具 ─────────
  const R2D = 180 / PI, D2R = PI / 180;
  const pts = (arr) => arr.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const unit = (p, q) => { const d = dist(p, q) || 1; return [(q[0] - p[0]) / d, (q[1] - p[1]) / d]; };
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const mul = (p, k) => [p[0] * k, p[1] * k];
  const lp = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  const cen = (arr) => [arr.reduce((s, p) => s + p[0], 0) / arr.length, arr.reduce((s, p) => s + p[1], 0) / arr.length];
  const f1 = (v) => fmt(Math.round(v * 10) / 10);
  function line(parent, P, Q, cls) { return S('line', { x1: P[0].toFixed(1), y1: P[1].toFixed(1), x2: Q[0].toFixed(1), y2: Q[1].toFixed(1), class: cls }, parent); }
  function dot(parent, P, r, cls) { return S('circle', { cx: P[0].toFixed(1), cy: P[1].toFixed(1), r: r || 4, class: cls || 'fstrong' }, parent); }
  function setC(c, P) { c.setAttribute('cx', P[0].toFixed(1)); c.setAttribute('cy', P[1].toFixed(1)); }
  function label(parent, P, C, text, cls, gap) {
    let u = unit(C, P);
    if (dist(C, P) < 1e-6) u = [0, -1];
    const g = gap || 16;
    return T(parent, P[0] + u[0] * g, P[1] + u[1] * g + 5, text, cls || 'vname');
  }
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
  function wedgeD(V, U, W, r) {
    const [a, s] = spanOf(V, U, W);
    const p0 = [V[0] + r * Math.cos(a), V[1] + r * Math.sin(a)];
    const p1 = [V[0] + r * Math.cos(a + s), V[1] + r * Math.sin(a + s)];
    return `M${V[0].toFixed(1)},${V[1].toFixed(1)} L${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${r},${r} 0 0 ${s > 0 ? 1 : 0} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} Z`;
  }
  function angPos(V, U, W, r) {
    const [a, s] = spanOf(V, U, W);
    const m = a + s / 2;
    return [V[0] + r * Math.cos(m), V[1] + r * Math.sin(m)];
  }
  function wedge(parent, V, U, W, r, cls, text, tcls) {
    S('path', { d: wedgeD(V, U, W, r), class: cls || 'f2s' }, parent);
    if (text) { const p = angPos(V, U, W, r + 13); T(parent, p[0], p[1] + 4, text, tcls || 'ts tb t2'); }
  }
  function rightD(V, U, W, s) {
    const u = unit(V, U), w = unit(V, W);
    const p1 = [V[0] + u[0] * s, V[1] + u[1] * s], p2 = [p1[0] + w[0] * s, p1[1] + w[1] * s], p3 = [V[0] + w[0] * s, V[1] + w[1] * s];
    return `M${p1[0].toFixed(1)},${p1[1].toFixed(1)} L${p2[0].toFixed(1)},${p2[1].toFixed(1)} L${p3[0].toFixed(1)},${p3[1].toFixed(1)}`;
  }
  // 等长记号
  function tick(parent, P, Q, n) {
    const m = mid(P, Q), u = unit(P, Q), nr = [-u[1], u[0]];
    let d = '';
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * 5;
      const c = [m[0] + u[0] * off, m[1] + u[1] * off];
      d += `M${(c[0] - nr[0] * 6).toFixed(1)},${(c[1] - nr[1] * 6).toFixed(1)} L${(c[0] + nr[0] * 6).toFixed(1)},${(c[1] + nr[1] * 6).toFixed(1)} `;
    }
    S('path', { d, class: 'fnone sstrong thin' }, parent);
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
  // 屏幕坐标中旋转：deg 为正时看上去是顺时针，为负时是逆时针
  const rs = (P, O, deg) => {
    const r = deg * D2R, dx = P[0] - O[0], dy = P[1] - O[1];
    return [O[0] + dx * Math.cos(r) - dy * Math.sin(r), O[1] + dx * Math.sin(r) + dy * Math.cos(r)];
  };
  const foot = (P, X, Y) => { const u = unit(X, Y); const t = (P[0] - X[0]) * u[0] + (P[1] - X[1]) * u[1]; return [X[0] + u[0] * t, X[1] + u[1] * t]; };
  const refl = (P, X, Y) => { const F = foot(P, X, Y); return [2 * F[0] - P[0], 2 * F[1] - P[1]]; };
  // 翻折动画：t 从 0 到 1，点从原处翻到对称点
  const flip = (P, X, Y, t) => { const F = foot(P, X, Y); return [F[0] + (P[0] - F[0]) * (1 - 2 * t), F[1] + (P[1] - F[1]) * (1 - 2 * t)]; };
  // 直线 PQ 与直线 RS 的交点
  function inter(P, Q, R, Sx) {
    const d1 = sub(Q, P), d2 = sub(Sx, R);
    const den = d1[0] * d2[1] - d1[1] * d2[0];
    if (Math.abs(den) < 1e-9) return null;
    const t = ((R[0] - P[0]) * d2[1] - (R[1] - P[1]) * d2[0]) / den;
    return [P[0] + d1[0] * t, P[1] + d1[1] * t];
  }
  function cci(P, r1, Q, r2) {
    const d = dist(P, Q);
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
    const ux = (Q[0] - P[0]) / d, uy = (Q[1] - P[1]) / d;
    const mx = P[0] + a * ux, my = P[1] + a * uy;
    return [[mx - h * uy, my + h * ux], [mx + h * uy, my - h * ux]];
  }
  function circ3(P, Q, R) {
    const ax = P[0], ay = P[1], bx = Q[0], by = Q[1], cx = R[0], cy = R[1];
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(d) < 1e-6) return null;
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    return { c: [ux, uy], r: Math.hypot(ax - ux, ay - uy) };
  }
  const sqrtTxt = (n) => {
    const r = Math.round(Math.sqrt(n));
    return r * r === n ? String(r) : `√${n} ≈ ${fmt(Math.sqrt(n))}`;
  };

  // ═════════ 三角形辅助线：倍长中线 ═════════
  A.c_tri_aux_double = function (el) {
    const W = 440, Hh = 330, U = 30;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const P = { A: [190, 45], B: [80, 160], C: [330, 165] };
    const LIM = { A: [40, 400, 35, 110], B: [25, 210, 130, 175], C: [230, 415, 130, 175] };
    const hs = {};
    ['A', 'B', 'C'].forEach((k) => { hs[k] = S('circle', { r: 12, class: 'handle' }, svg); });
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let ext = 0, rot = 0, busy = false;
    function doExt(done) {
      if (ext >= 1) { if (done) done(); return; }
      busy = true;
      tween(900, (t) => { ext = t; render(); }, () => { ext = 1; busy = false; render(); if (done) done(); });
    }
    btn(c, '① 延长 AD 到 E，使 DE = AD', () => { if (!busy) doExt(); });
    const rb = btn(c, '② 把 △ADC 绕点 D 旋转 180°', () => {
      if (busy) return;
      doExt(() => {
        busy = true;
        const from = rot, to = rot >= 1 ? 0 : 1;
        tween(1500, (t) => { rot = lerp(from, to, t); render(); }, () => {
          rot = to; busy = false; render();
          rb.textContent = to ? '把 △ADC 转回去' : '② 把 △ADC 绕点 D 旋转 180°';
        });
      });
    });
    btn(c, '重置', () => { if (busy) return; ext = 0; rot = 0; rb.textContent = '② 把 △ADC 绕点 D 旋转 180°'; render(); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：拖动 A、B、C 三个圆点换一个三角形，结论不变。');

    function render() {
      g.innerHTML = '';
      const a = P.A, b = P.B, cc = P.C;
      const D = mid(b, cc), E = [2 * D[0] - a[0], 2 * D[1] - a[1]];
      const Ec = lp(D, E, ext);
      S('polygon', { points: pts([a, b, cc]), class: 'fsurf sstrong' }, g);
      if (rot > 0) {
        S('polygon', { points: pts([a, D, cc]), class: 'f1s s1', style: 'opacity:.7' }, g);
        const img = [a, D, cc].map((p) => rs(p, D, 180 * rot));
        S('polygon', { points: pts(img), class: 'f2s s2', style: 'opacity:.8' }, g);
      }
      line(g, a, D, 's1');
      if (ext > 0) line(g, D, Ec, 's1 dash');
      if (rot >= 1) line(g, b, E, 's2 thick');
      tick(g, b, D, 1); tick(g, D, cc, 1);
      if (ext >= 1) { tick(g, a, D, 2); tick(g, D, E, 2); }
      const ctr = cen([a, b, cc]);
      label(g, a, D, 'A'); label(g, b, ctr, 'B'); label(g, cc, ctr, 'C');
      T(g, D[0] + 14, D[1] - 6, 'D', 'vname');
      dot(g, D, 3.5);
      if (ext > 0.95) { dot(g, E, 3.5); label(g, E, D, 'E'); }
      ['A', 'B', 'C'].forEach((k) => setC(hs[k], P[k]));
      const ab = dist(a, b) / U, ac = dist(a, cc) / U, ad = dist(a, D) / U;
      if (busy && rot > 0 && rot < 1) { read.innerHTML = '△ADC 正在绕点 D 旋转……转 180° 后，A 落到 E，C 落到 B。'; return; }
      if (rot >= 1) {
        read.innerHTML = `△ADC 转 180° 后和 △EDB 完全重合：<b>△ADC ≌ △EDB（SAS）</b>，所以 <span class="k2">BE = AC = ${f1(ac)}</span>。<br>现在 AB、BE、AE 在同一个 △ABE 里：AE = 2AD = ${f1(2 * ad)}，<span class="k1">AB = ${f1(ab)}</span>。由三边关系 ${f1(Math.abs(ab - ac))} &lt; 2AD &lt; ${f1(ab + ac)}，得 <b>${fmt(Math.round(Math.abs(ab - ac) * 10) / 20)} &lt; AD &lt; ${fmt(Math.round((ab + ac) * 10) / 20)}</b>。`;
      } else if (ext >= 1) {
        read.innerHTML = `现在 DE = AD = ${f1(ad)}，BD = CD。看 △ADC 和 △EDB：AD = ED，∠ADC = ∠EDB（对顶角），CD = BD。它们全等吗？点②让 △ADC 转过去看看。`;
      } else {
        read.innerHTML = `AD 是中线（BD = CD）。<span class="k1">AB = ${f1(ab)}</span>，AC = ${f1(ac)}，AD = ${f1(ad)}。这三条线段不在同一个三角形里，没法直接用三边关系。点①把中线延长一倍。`;
      }
    }
    ['A', 'B', 'C'].forEach((k) => {
      drag(svg, hs[k], (p) => {
        const L = LIM[k], old = P[k];
        P[k] = [clamp(p.x, L[0], L[1]), clamp(p.y, L[2], L[3])];
        const E = [P.B[0] + P.C[0] - P.A[0], P.B[1] + P.C[1] - P.A[1]];
        if (E[0] < 20 || E[0] > W - 20 || E[1] > Hh - 20) P[k] = old;
        render();
      }, () => !busy);
    });
    render();
  };

  // ═════════ 三角形辅助线：截长补短 ═════════
  A.c_tri_aux_cut = function (el) {
    const W = 440, Hh = 330;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let bDeg = 30, mode = 0, t1 = 0, t2 = 0, busy = false;
    const sB = slider(c, 'cb', '∠B', 15, 45, 1, bDeg, (v) => { if (busy) { sB.set(bDeg); return; } bDeg = v; render(); });
    const c2 = ctrl(el);
    const mb = [
      btn(c2, '截长：在 AB 上截取 AE = AC', () => {
        if (busy) return;
        mode = 1; t1 = 0; setActive(mb, 0); busy = true;
        tween(1500, (t) => { t1 = t; render(); }, () => { t1 = 1; busy = false; render(); });
      }, 'alt'),
      btn(c2, '补短：延长 AC 到 F，使 CF = CD', () => {
        if (busy) return;
        mode = 2; t2 = 0; setActive(mb, 1); busy = true;
        tween(900, (t) => { t2 = t; render(); }, () => {
          tween(1400, (t) => { t2 = 1 + t; render(); }, () => { t2 = 2; busy = false; render(); });
        });
      }, 'alt')
    ];
    btn(c2, '重置', () => { if (busy) return; mode = 0; t1 = t2 = 0; setActive(mb, -1); render(); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '条件：∠C = 2∠B，AD 平分 ∠BAC。拖动滑块改变 ∠B，两种方法都能证明 AB = AC + CD。');

    function geo() {
      const b = bDeg * D2R, aAng = PI - 3 * b;
      const ABl = Math.sin(2 * b) / Math.sin(aAng), ACl = Math.sin(b) / Math.sin(aAng);
      const Am = [ABl * Math.cos(b), ABl * Math.sin(b)], Bm = [0, 0], Cm = [1, 0];
      const Dm = [ABl / (ABl + ACl), 0];
      const CDl = ACl / (ABl + ACl);
      const uAC = unit(Am, Cm);
      const Fm = [Am[0] + uAC[0] * (ACl + CDl), Am[1] + uAC[1] * (ACl + CDl)];
      const all = [Am, Bm, Cm, Fm];
      const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const k = Math.min((W - 90) / (x1 - x0), (Hh - 80) / (y1 - y0));
      const ox = (W - (x1 - x0) * k) / 2 - x0 * k, oy = Hh - 40 - ((Hh - 80) - (y1 - y0) * k) / 2 + y0 * k;
      const M = (p) => [ox + p[0] * k, oy - p[1] * k];
      const Ap = M(Am), Bp = M(Bm), Cp = M(Cm), Dp = M(Dm), Fp = M(Fm);
      const Ep = add(Ap, mul(unit(Ap, Bp), dist(Ap, Cp)));
      return { Ap, Bp, Cp, Dp, Ep, Fp, ab: ABl * 10, ac: ACl * 10, cd: CDl * 10 };
    }
    function render() {
      g.innerHTML = '';
      const { Ap, Bp, Cp, Dp, Ep, Fp, ab, ac, cd } = geo();
      S('polygon', { points: pts([Ap, Bp, Cp]), class: 'fsurf sstrong' }, g);
      S('path', { d: wedgeD(Ap, Bp, Dp, 30), class: 'f1s' }, g);
      S('path', { d: wedgeD(Ap, Dp, Cp, 34), class: 'f1s' }, g);
      line(g, Ap, Dp, 's1');
      let txt = '';
      if (mode === 1) {
        const Cf = flip(Cp, Ap, Dp, t1);
        if (t1 >= 1) S('polygon', { points: pts([Ep, Dp, Bp]), class: 'f3s s3' }, g);
        S('polygon', { points: pts([Ap, Cf, Dp]), class: 'f2s s2', style: 'opacity:.75' }, g);
        if (t1 >= 1) {
          dot(g, Ep, 3.5); label(g, Ep, Dp, 'E');
          tick(g, Ap, Ep, 2); tick(g, Ap, Cp, 2);
          tick(g, Ep, Dp, 1); tick(g, Ep, Bp, 1); tick(g, Dp, Cp, 1);
          txt = `把 △ACD 沿 AD 翻折，C 正好落在 AB 上的 E 处：AE = AC，∠EAD = ∠CAD，AD 公共，所以 <b>△AED ≌ △ACD（SAS）</b>，ED = CD，∠AED = ∠C = ${2 * bDeg}°。<br>∠AED 是 △EDB 的外角：∠EDB = ${2 * bDeg}° − ${bDeg}° = ${bDeg}° = ∠B，所以 <span class="k3">EB = ED = CD</span>。<br>AB = AE + EB = AC + CD：<b>${f1(ab)} = ${f1(ac)} + ${f1(cd)}</b>。`;
        } else txt = '在 AB 上截取 AE = AC，相当于把 △ACD 沿角平分线 AD 翻折过去……';
      } else if (mode === 2) {
        const e1 = Math.min(1, t2), u = Math.max(0, t2 - 1);
        const Fc = lp(Cp, Fp, e1);
        line(g, Cp, Fc, 's2 dash');
        if (e1 >= 1) {
          line(g, Dp, Fp, 's2');
          dot(g, Fp, 3.5); label(g, Fp, Cp, 'F');
          tick(g, Cp, Fp, 1); tick(g, Cp, Dp, 1);
        }
        if (u > 0) {
          const Bf = flip(Bp, Ap, Dp, u);
          S('polygon', { points: pts([Ap, Bf, Dp]), class: 'f3s s3', style: 'opacity:.7' }, g);
        }
        if (t2 >= 2) txt = `CF = CD，所以 ∠F = ∠CDF，而 ∠ACB = ∠F + ∠CDF = 2∠F，所以 <b>∠F = ${bDeg}° = ∠B</b>。<br>再加上 ∠BAD = ∠FAD、AD 公共，得 <b>△ABD ≌ △AFD（AAS）</b>：把 △ABD 沿 AD 翻折，B 正好落在 F 上。<br>所以 AB = AF = AC + CF = AC + CD：<b>${f1(ab)} = ${f1(ac)} + ${f1(cd)}</b>。`;
        else txt = '把短的 AC 补长：延长 AC 到 F，使 CF = CD……';
      } else {
        txt = `∠B = ${bDeg}°，∠C = ${2 * bDeg}°，AD 平分 ∠BAC。量一量：<span class="k1">AB = ${f1(ab)}</span>，AC = ${f1(ac)}，CD = ${f1(cd)}，AC + CD = ${f1(ac + cd)}。<br>要证“一条线段 = 两条线段的和”，就把长的截成两段（截长），或把短的补成一段（补短）。点上面的按钮。`;
      }
      S('path', { d: wedgeD(Bp, Cp, Ap, 26), class: 'f2s', style: 'opacity:.8' }, g);
      S('path', { d: wedgeD(Cp, Ap, Bp, 22), class: 'f2s', style: 'opacity:.8' }, g);
      const pb = angPos(Bp, Cp, Ap, 42), pc = angPos(Cp, Ap, Bp, 38);
      T(g, pb[0], pb[1] + 4, bDeg + '°', 'ts tb t2'); T(g, pc[0], pc[1] + 4, 2 * bDeg + '°', 'ts tb t2');
      const ct = cen([Ap, Bp, Cp]);
      label(g, Ap, ct, 'A'); label(g, Bp, ct, 'B'); label(g, Cp, ct, 'C');
      dot(g, Dp, 3.5); T(g, Dp[0], Dp[1] + 20, 'D', 'vname');
      read.innerHTML = txt;
    }
    render();
  };

  // ═════════ 几何最值：角内一点，三角形周长最小（两次对称） ═════════
  A.c_shortest_angle = function (el) {
    const W = 440, Hh = 340, U = 30, O = [60, 170];
    const rl = () => Math.min(375, 150 / Math.sin((al / 2) * D2R));
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hM = S('circle', { r: 12, class: 'handle' }, svg);
    const hN = S('circle', { r: 12, class: 'handle' }, svg);
    const hP = S('circle', { r: 12, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let al = 50, pr = 130, pa = 6, m = 200, n = 110, sym = 0, busy = false;
    const dA = () => [Math.cos((al / 2) * D2R), Math.sin((al / 2) * D2R)];   // 下边射线 OA
    const dB = () => [Math.cos((al / 2) * D2R), -Math.sin((al / 2) * D2R)];  // 上边射线 OB
    const Pp = () => [O[0] + pr * Math.cos(pa * D2R), O[1] + pr * Math.sin(pa * D2R)];
    function best() {
      const P = Pp(), P1 = refl(P, O, add(O, dA())), P2 = refl(P, O, add(O, dB()));
      const Mx = inter(P1, P2, O, add(O, dA())), Nx = inter(P1, P2, O, add(O, dB()));
      return { P, P1, P2, m: dist(O, Mx), n: dist(O, Nx) };
    }
    const sA = slider(c, 'sa', '∠AOB', 30, 70, 2, al, (v) => {
      if (busy) { sA.set(al); return; }
      al = v; pa = clamp(pa, -al / 2 + 4, al / 2 - 4); render();
    });
    const c2 = ctrl(el);
    function showSym(done) {
      if (sym >= 1) { if (done) done(); return; }
      busy = true;
      tween(900, (t) => { sym = t; render(); }, () => { sym = 1; busy = false; render(); if (done) done(); });
    }
    btn(c2, '作两次对称', () => { if (!busy) showSym(); });
    btn(c2, '找最小周长', () => {
      if (busy) return;
      showSym(() => {
        const bs = best(), m0 = m, n0 = n;
        busy = true;
        tween(1000, (t) => { m = lerp(m0, bs.m, t); n = lerp(n0, bs.n, t); render(); }, () => { m = bs.m; n = bs.n; busy = false; render(); });
      });
    });
    btn(c2, '重置', () => { if (busy) return; sym = 0; m = 200; n = 110; render(); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：拖动 M、N 沿两边移动，拖动 P 换位置。靠近最小位置时会自动吸过去。');

    function render() {
      g.innerHTML = '';
      const bs = best(), P = bs.P, P1 = bs.P1, P2 = bs.P2;
      const da = dA(), db = dB(), RL = rl();
      m = Math.min(m, RL - 10); n = Math.min(n, RL - 10);
      const M = add(O, mul(da, m)), N = add(O, mul(db, n));
      line(g, O, add(O, mul(da, RL)), 'sstrong');
      line(g, O, add(O, mul(db, RL)), 'sstrong');
      S('path', { d: wedgeD(O, add(O, da), add(O, db), 30), class: 'f2s' }, g);
      T(g, O[0] + 44, O[1] + 5, al + '°', 'ts tb t2', 'start');
      T(g, O[0] - 14, O[1] + 5, 'O', 'vname');
      const ea = add(O, mul(da, RL)), eb = add(O, mul(db, RL));
      T(g, ea[0] - 14, ea[1] - 4, 'A', 'vname'); T(g, eb[0] - 14, eb[1] + 16, 'B', 'vname');
      if (sym > 0) {
        const s = S('g', { opacity: sym }, g);
        line(s, P, P1, 'sline dash'); line(s, P, P2, 'sline dash');
        line(s, O, P1, 'sline'); line(s, O, P2, 'sline');
        line(s, P1, M, 's1 dash'); line(s, N, P2, 's3 dash');
        dot(s, P1, 4, 'fmuted'); dot(s, P2, 4, 'fmuted');
        T(s, P1[0] + 6, P1[1] + 18, 'P₁', 'vname', 'start');
        T(s, P2[0] + 6, P2[1] - 8, 'P₂', 'vname', 'start');
      }
      const onBest = Math.abs(m - bs.m) < 0.6 && Math.abs(n - bs.n) < 0.6;
      if (onBest && sym >= 1) line(g, P1, P2, 's2 thin dash');
      S('polygon', { points: pts([P, M, N]), class: 'f2s', style: 'opacity:.35' }, g);
      line(g, P, M, 's1 thick'); line(g, M, N, 's2 thick'); line(g, N, P, 's3 thick');
      dot(g, P, 4.5); dot(g, M, 4); dot(g, N, 4);
      T(g, P[0] + 14, P[1] + 4, 'P', 'vname', 'start');
      T(g, M[0] + 4, M[1] + 22, 'M', 'vname');
      T(g, N[0] + 4, N[1] - 12, 'N', 'vname');
      setC(hP, P); setC(hM, M); setC(hN, N);
      const pm = dist(P, M) / U, mn = dist(M, N) / U, np = dist(N, P) / U;
      const sum = pm + mn + np, mn0 = dist(P1, P2) / U;
      if (busy) { read.innerHTML = sym < 1 ? '作 P 关于 OA 的对称点 P₁，关于 OB 的对称点 P₂……' : 'M、N 正在移到直线 P₁P₂ 与两边的交点……'; return; }
      let s = `<span class="k1">PM = ${f1(pm)}</span>，<span class="k2">MN = ${f1(mn)}</span>，<span class="k3">NP = ${f1(np)}</span>，<b>△PMN 周长 = ${f1(sum)}</b>。`;
      if (sym >= 1 && onBest) s += `<br>P₁、M、N、P₂ 在一条直线上，周长 = P₁M + MN + NP₂ = <b>P₁P₂ = ${f1(mn0)}</b>，这就是最小值。OP₁ = OP₂ = OP = ${f1(pr / U)}，∠P₁OP₂ = 2∠AOB = ${2 * al}°。`;
      else if (sym >= 1) s += `<br>OA 垂直平分 PP₁，所以 PM = P₁M；同理 PN = P₂N。周长 = P₁M + MN + NP₂，是从 P₁ 到 P₂ 的一条折线。折线什么时候最短？点“找最小周长”。`;
      else s += '<br>M 在 OA 上、N 在 OB 上，两个点都能动。拖一拖，周长最小大约是多少？';
      read.innerHTML = s;
    }
    drag(svg, hM, (p) => {
      const t = (p.x - O[0]) * dA()[0] + (p.y - O[1]) * dA()[1];
      m = clamp(t, 8, rl() - 10);
      const bs = best(); if (Math.abs(m - bs.m) < 6) m = bs.m;
      render();
    }, () => !busy);
    drag(svg, hN, (p) => {
      const t = (p.x - O[0]) * dB()[0] + (p.y - O[1]) * dB()[1];
      n = clamp(t, 8, rl() - 10);
      const bs = best(); if (Math.abs(n - bs.n) < 6) n = bs.n;
      render();
    }, () => !busy);
    drag(svg, hP, (p) => {
      pr = clamp(dist(O, [p.x, p.y]), 50, 150);
      pa = clamp(Math.atan2(p.y - O[1], p.x - O[0]) * R2D, -al / 2 + 4, al / 2 - 4);
      render();
    }, () => !busy);
    render();
  };

  // ═════════ 几何最值：造桥选址（平移河宽） ═════════
  A.c_shortest_bridge = function (el) {
    const W = 440, Hh = 330, U = 30, Y1 = 125;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hA = S('circle', { r: 12, class: 'handle' }, svg);
    const hB = S('circle', { r: 12, class: 'handle' }, svg);
    const hM = S('circle', { r: 12, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let d = 60, Ap = [80, 45], Bp = [370, 295], mx = 110, tr = 0, busy = false;
    const bestX = () => {
      const As = [Ap[0], Ap[1] + d], Y2 = Y1 + d;
      return As[0] + ((Bp[0] - As[0]) * (Y2 - As[1])) / (Bp[1] - As[1]);
    };
    const sD = slider(c, 'bd', '河宽', 1, 3, 0.5, d / U, (v) => {
      if (busy) { sD.set(d / U); return; }
      d = v * U; Bp[1] = Math.max(Bp[1], Y1 + d + 25); render();
    });
    const c2 = ctrl(el);
    function doTr(done) {
      if (tr >= 1) { if (done) done(); return; }
      busy = true;
      tween(1000, (t) => { tr = t; render(); }, () => { tr = 1; busy = false; render(); if (done) done(); });
    }
    btn(c2, '把 A 平移一个河宽', () => { if (!busy) doTr(); });
    btn(c2, '找最短路线', () => {
      if (busy) return;
      doTr(() => {
        const x0 = mx, x1 = bestX();
        busy = true;
        tween(1000, (t) => { mx = lerp(x0, x1, t); render(); }, () => { mx = x1; busy = false; render(); });
      });
    });
    btn(c2, "重置", () => { if (busy) return; tr = 0; mx = 110; render(); }, "alt");
    H('p', { class: 'anim-tip' }, el, '桥 MN 必须和河岸垂直。左右拖动桥头 M；A、B 两个村庄也能拖。');

    function render() {
      g.innerHTML = '';
      const Y2 = Y1 + d;
      S('rect', { x: 10, y: Y1, width: W - 20, height: d, class: 'f1s' }, g);
      line(g, [10, Y1], [W - 10, Y1], 'sstrong'); line(g, [10, Y2], [W - 10, Y2], 'sstrong');
      T(g, W - 16, Y1 + d / 2 + 5, '河', 'tm', 'end');
      const M = [mx, Y1], N = [mx, Y2], As = [Ap[0], Ap[1] + d];
      if (tr > 0) {
        const off = [0, d * tr];
        const s = S('g', {}, g);
        if (tr >= 1) {
          S('polygon', { points: pts([Ap, M, N, As]), class: 'fnone sline dash' }, s);
        }
        line(s, add(Ap, off), add(M, off), 's1 dash');
        dot(s, add(Ap, off), 4, 'fmuted');
        if (tr >= 1) T(s, As[0] - 10, As[1] + 5, 'A′', 'vname', 'end');
      }
      const onBest = Math.abs(mx - bestX()) < 0.6;
      if (tr >= 1 && onBest) line(g, As, Bp, 's3 thin dash');
      line(g, Ap, M, 's1 thick'); line(g, M, N, 's2 thick'); line(g, N, Bp, 's3 thick');
      dot(g, Ap, 4.5); dot(g, Bp, 4.5); dot(g, M, 3.5); dot(g, N, 3.5);
      T(g, Ap[0] - 12, Ap[1] - 6, 'A', 'vname'); T(g, Bp[0] + 12, Bp[1] + 4, 'B', 'vname');
      T(g, M[0] + 14, M[1] - 7, 'M', 'vname'); T(g, N[0] + 14, N[1] + 18, 'N', 'vname');
      setC(hA, Ap); setC(hB, Bp); setC(hM, M);
      const am = dist(Ap, M) / U, nb = dist(N, Bp) / U, w = d / U, tot = am + w + nb;
      if (busy) { read.innerHTML = tr < 1 ? '把 A 沿垂直河岸的方向平移一个河宽，得到 A′；线段 AM 跟着平移成 A′N……' : '桥正在移到 A′B 与河岸的交点……'; return; }
      let s = `<span class="k1">AM = ${f1(am)}</span>，<span class="k2">MN = ${fmt(w)}（河宽，不变）</span>，<span class="k3">NB = ${f1(nb)}</span>，<b>总路程 = ${f1(tot)}</b>。`;
      if (tr >= 1 && onBest) s += `<br>A′、N、B 在一条直线上：AM + NB = A′N + NB = <b>A′B = ${f1(dist(As, Bp) / U)}</b>，总路程最短 = A′B + 河宽 = ${f1(dist(As, Bp) / U + w)}。`;
      else if (tr >= 1) s += '<br>AMNA′ 是平行四边形（AA′ 与 MN 平行且相等），所以 AM = A′N。总路程 = A′N + NB + 河宽，河宽固定，只要 A′N + NB 最短。点“找最短路线”。';
      else s += '<br>河宽是固定的，真正要变短的是 AM + NB。可是 AM、NB 被河隔开，连不成一条线……';
      read.innerHTML = s;
    }
    drag(svg, hM, (p) => { mx = clamp(p.x, 20, W - 20); if (Math.abs(mx - bestX()) < 5) mx = bestX(); render(); }, () => !busy);
    drag(svg, hA, (p) => { Ap = [clamp(p.x, 20, W - 20), clamp(p.y, 20, Y1 - 20)]; render(); }, () => !busy);
    drag(svg, hB, (p) => { Bp = [clamp(p.x, 20, W - 20), clamp(p.y, Y1 + d + 20, Hh - 15)]; render(); }, () => !busy);
    render();
  };

  // ═════════ 勾股综合：长方体表面蚂蚁爬行（三种展开） ═════════
  A.c_pyth_adv_box = function (el) {
    const W = 440, Hh = 320, KX = 0.42, KY = 0.3;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let a = 4, b = 2, ch = 1, way = 1, phi = 0, busy = false;
    const c1 = ctrl(el);
    const NAMES = ['前面 + 右面', '前面 + 上面', '下面 + 右面'];
    const wb = NAMES.map((s, i) => btn(c1, '方式' + '一二三'[i] + '：' + s, () => {
      if (busy) return; way = i; phi = 0; setActive(wb, i); ub.textContent = '展开'; render();
    }, i === way ? '' : 'alt'));
    const c2 = ctrl(el);
    const ub = btn(c2, '展开', () => {
      if (busy) return;
      busy = true;
      const from = phi, to = phi > 0.5 ? 0 : PI / 2;
      tween(1300, (t) => { phi = lerp(from, to, t); render(); }, () => { phi = to; busy = false; ub.textContent = to ? '折回去' : '展开'; render(); });
    });
    const c3 = ctrl(el);
    const sl = (nm, lb, v, set) => { const s = slider(c3, nm, lb, 1, 6, 1, v, (x) => { if (busy) { s.set(v); return; } set(x); v = x; render(); }); return s; };
    sl('pa', '长', a, (x) => { a = x; });
    sl('pb', '宽', b, (x) => { b = x; });
    sl('pc', '高', ch, (x) => { ch = x; });

    function data(w, ph) {
      const s = Math.sin(ph), co = Math.cos(ph);
      const front = [[0, 0, 0], [a, 0, 0], [a, ch, 0], [0, ch, 0]];
      if (w === 0) return { f1: front, f2: [[0, 0], [0, b], [ch, b], [ch, 0]].map(([y, z]) => [a + z * s, y, z * co]), X: [a, (ch * a) / (a + b), 0], G: [a + b * s, ch, b * co] };
      if (w === 1) return { f1: front, f2: [[0, 0], [a, 0], [a, b], [0, b]].map(([x, z]) => [x, ch + z * s, z * co]), X: [(a * ch) / (b + ch), ch, 0], G: [a, ch + b * s, b * co] };
      return { f1: [[0, 0, 0], [a, 0, 0], [a, 0, b], [0, 0, b]], f2: [[0, 0], [ch, 0], [ch, b], [0, b]].map(([y, z]) => [a + y * s, y * co, z]), X: [a, 0, (b * a) / (a + ch)], G: [a + ch * s, ch * co, b] };
    }
    const raw = (p) => [p[0] + KX * p[2], p[1] + KY * p[2]];
    function render() {
      g.innerHTML = '';
      // 用三种展开后的位置一起定比例，切换方式时画面不跳
      const all = [];
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let l = 0; l < 2; l++) all.push(raw([i * a, j * ch, l * b]));
      [0, 1, 2].forEach((w) => { const d = data(w, PI / 2); d.f2.forEach((p) => all.push(raw(p))); });
      const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const k = Math.min((W - 70) / (x1 - x0), (Hh - 60) / (y1 - y0));
      const ox = (W - (x1 - x0) * k) / 2 - x0 * k, oy = Hh - 30 - ((Hh - 60) - (y1 - y0) * k) / 2 + y0 * k;
      const P = (p) => { const r = raw(p); return [ox + r[0] * k, oy - r[1] * k]; };
      // 长方体线框
      const V = (i, j, l) => P([i * a, j * ch, l * b]);
      const edges = [
        [[0, 0, 0], [1, 0, 0]], [[0, 1, 0], [1, 1, 0]], [[0, 1, 1], [1, 1, 1]], [[0, 0, 1], [1, 0, 1]],
        [[0, 0, 0], [0, 1, 0]], [[1, 0, 0], [1, 1, 0]], [[1, 0, 1], [1, 1, 1]], [[0, 0, 1], [0, 1, 1]],
        [[0, 0, 0], [0, 0, 1]], [[1, 0, 0], [1, 0, 1]], [[1, 1, 0], [1, 1, 1]], [[0, 1, 0], [0, 1, 1]]
      ];
      edges.forEach(([p, q]) => {
        const hidden = (p[0] === 0 && p[1] === 0 && p[2] === 1) || (q[0] === 0 && q[1] === 0 && q[2] === 1);
        line(g, V(...p), V(...q), hidden ? 'smuted thin dash' : 'smuted');
      });
      const d = data(way, phi);
      S('polygon', { points: pts(d.f1.map(P)), class: 'f1s s1', style: 'opacity:.75' }, g);
      S('polygon', { points: pts(d.f2.map(P)), class: 'f3s s3', style: 'opacity:.75' }, g);
      const A0 = P([0, 0, 0]), Xp = P(d.X), Gp = P(d.G);
      S('path', { d: `M${A0[0].toFixed(1)},${A0[1].toFixed(1)} L${Xp[0].toFixed(1)},${Xp[1].toFixed(1)} L${Gp[0].toFixed(1)},${Gp[1].toFixed(1)}`, class: 'fnone s2 thick round' }, g);
      dot(g, A0, 4.5); dot(g, Gp, 4.5, 'f2');
      T(g, A0[0] - 10, A0[1] + 16, 'A', 'vname');
      T(g, Gp[0] + 10, Gp[1] - 6, 'G', 'vname', 'start');
      T(g, (V(0, 0, 0)[0] + V(1, 0, 0)[0]) / 2, V(0, 0, 0)[1] + 16, '长 ' + a, 'ts tm');
      T(g, V(0, 0, 0)[0] - 8, (V(0, 0, 0)[1] + V(0, 1, 0)[1]) / 2 + 4, '高 ' + ch, 'ts tm', 'end');
      const wbp = mid(V(1, 0, 0), V(1, 0, 1));
      if (way !== 2 || phi < 0.1) T(g, wbp[0] + 8, wbp[1] + 12, '宽 ' + b, 'ts tm', 'start');
      const L = [(a + b) ** 2 + ch * ch, a * a + (b + ch) ** 2, (a + ch) ** 2 + b * b];
      const F = [`√((${a} + ${b})² + ${ch}²)`, `√(${a}² + (${b} + ${ch})²)`, `√((${a} + ${ch})² + ${b}²)`];
      const mn = Math.min(...L);
      let s = '';
      if (busy) s = phi > 0.01 && phi < PI / 2 - 0.01 ? '绿色的面正绕着棱转动……展开后，两个面落在同一个平面里。<br>' : '';
      else if (phi > 0.5) s = `展开后两个面拼成一个长方形，<b>两点之间线段最短</b>：橙色路线是这个长方形的对角线。<br>`;
      else s = '橙色是这种走法的最短路线（经过一条棱）。点“展开”把它摊平看看。<br>';
      s += L.map((v, i) => {
        const t = `方式${'一二三'[i]}（${NAMES[i]}）：${F[i]} = ${sqrtTxt(v)}`;
        const tt = i === way ? `<span class="k2">${t}</span>` : t;
        return v === mn ? `<b>${tt}　← 最短</b>` : tt;
      }).join('<br>');
      read.innerHTML = s;
    }
    render();
  };

  // ═════════ 勾股综合：折叠后重合，列方程 ═════════
  A.c_pyth_adv_fold = function (el) {
    const W = 440, Hh = 320;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let w = 8, h = 4, t = 0, busy = false;
    const c = ctrl(el);
    const fb = btn(c, '折叠：让 C 落到 A 上', () => {
      if (busy) return;
      busy = true;
      const from = t, to = t > 0.5 ? 0 : 1;
      tween(1500, (x) => { t = lerp(from, to, x); sT.set(t); render(); }, () => { t = to; sT.set(t); busy = false; fb.textContent = to ? '展开' : '折叠：让 C 落到 A 上'; render(); });
    });
    const c2 = ctrl(el);
    const sT = slider(c2, 'ft', '折叠', 0, 1, 0.05, t, (v) => { if (busy) { sT.set(t); return; } t = v; render(); });
    const sW = slider(c2, 'fw', 'AB', 5, 10, 1, w, (v) => { if (busy) { sW.set(w); return; } w = v; if (h > w) { h = w; sH.set(h); } render(); });
    const sH = slider(c2, 'fh', 'BC', 2, 7, 1, h, (v) => { if (busy) { sH.set(h); return; } h = Math.min(v, w); sH.set(h); render(); });

    function render() {
      g.innerHTML = '';
      const x = (w * w + h * h) / (2 * w);
      const Am = [0, 0], Bm = [w, 0], Cm = [w, h], Dm = [0, h], Em = [x, 0], Fm = [w - x, h];
      const B2 = refl(Bm, Em, Fm);
      const all = [Am, Bm, Cm, Dm, B2];
      const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const k = Math.min((W - 80) / (x1 - x0), (Hh - 70) / (y1 - y0));
      const ox = (W - (x1 - x0) * k) / 2 - x0 * k, oy = Hh - 35 - ((Hh - 70) - (y1 - y0) * k) / 2 + y0 * k;
      const M = (p) => [ox + p[0] * k, oy - p[1] * k];
      const Ap = M(Am), Bp = M(Bm), Cp = M(Cm), Dp = M(Dm), Ep = M(Em), Fp = M(Fm);
      S('polygon', { points: pts([Ap, Bp, Cp, Dp]), class: 'fnone sline dash' }, g);
      S('polygon', { points: pts([Ap, Ep, Fp, Dp]), class: 'fsurf sstrong' }, g);
      const flap = [Ep, Bp, Cp, Fp].map((p) => flip(p, Ep, Fp, t));
      if (t === 0) S('polygon', { points: pts([Ep, Bp, Cp]), class: 'f3s' }, g);
      S('polygon', { points: pts(flap), class: t === 0 ? 'fnone s2' : 'f2s s2', style: 'opacity:.85' }, g);
      line(g, Ep, Fp, 's3 dash');
      if (t === 0) { line(g, Ap, Cp, 'sline dash'); line(g, Ep, Cp, 's1'); }
      const ct = M([w / 2, h / 2]);
      label(g, Ap, ct, 'A'); label(g, Dp, ct, 'D'); label(g, Ep, ct, 'E', 'vname', 18); label(g, Fp, ct, 'F', 'vname', 18);
      if (t < 0.05) { label(g, Bp, ct, 'B'); label(g, Cp, ct, 'C'); }
      else if (t > 0.95) { T(g, flap[1][0], flap[1][1] + 20, 'B′', 'vname'); T(g, Ap[0] + 18, Ap[1] - 6, 'C′', 'vname t2'); }
      const ef = Math.hypot(2 * x - w, h);
      let s;
      if (t > 0 && t < 1) s = '纸片正沿折痕 EF 翻过去……折痕 EF 就是 AC 的垂直平分线。';
      else if (t >= 1) s = `C 和 A 重合了。翻过来的 △AB′E 和原来的 △CBE 全等：AB′ = CB = ${h}，B′E = BE，AE = CE。`;
      else s = `长方形 ABCD，AB = ${w}，BC = ${h}。沿 EF 折叠使 C 与 A 重合。`;
      s += `<br>设 AE = <i>x</i>。折叠后 <span class="k1">CE = AE = <i>x</i></span>，BE = ${w} − <i>x</i>。在 Rt△EBC 中：<i>x</i><sup>2</sup> = (${w} − <i>x</i>)<sup>2</sup> + ${h}<sup>2</sup>，解得 <b><i>x</i> = ${fmt(x)}</b>。`;
      s += `<br>由对称性 CF = AE = ${fmt(x)}，折痕 EF = √((${fmt(2 * x - w)})<sup>2</sup> + ${h}<sup>2</sup>) ≈ ${fmt(ef)}。`;
      read.innerHTML = s;
    }
    render();
  };

  // ═════════ 四边形综合：正方形半角模型 ═════════
  A.c_quad_shape_half = function (el) {
    const W = 440, Hh = 290, s = 210, U = 35;
    const Ap = [205, 40], Bp = [205, 40 + s], Cp = [205 + s, 40 + s], Dp = [205 + s, 40];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hE = S('circle', { r: 12, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let e = 2 * U, th = 45, rot = 0, busy = false;
    const c = ctrl(el);
    const rb = btn(c, '把 △ADF 绕 A 旋转 90°', () => {
      if (busy) return;
      busy = true;
      const from = rot, to = rot >= 1 ? 0 : 1;
      tween(1500, (x) => { rot = lerp(from, to, x); render(); }, () => { rot = to; busy = false; rb.textContent = to ? '转回去' : '把 △ADF 绕 A 旋转 90°'; render(); });
    });
    const sTh = slider(c, 'hth', '∠EAF', 30, 60, 1, th, (v) => { if (busy) { sTh.set(th); return; } th = v; fixE(); render(); });
    H('p', { class: 'anim-tip' }, el, '提示：拖动 BC 上的点 E，F 会自动移动，保持 ∠EAF 不变。把 ∠EAF 调离 45° 再旋转，看看结论还成不成立。');
    function fixE() {
      const maxBAE = 88 - th;  // 保证 ∠DAF ≥ 2°
      e = clamp(e, s * 0.06, Math.min(s * 0.94, s * Math.tan(maxBAE * D2R)));
    }
    function render() {
      g.innerHTML = '';
      const bae = Math.atan(e / s) * R2D, daf = 90 - th - bae;
      const df = s * Math.tan(daf * D2R);
      const E = [Bp[0] + e, Bp[1]], F = [Dp[0], Dp[1] + df];
      const G = rs(F, Ap, 90);
      S('polygon', { points: pts([Ap, Bp, Cp, Dp]), class: 'fsurf sstrong' }, g);
      const ok = Math.abs(th - 45) < 0.01;
      S('polygon', { points: pts([Ap, Dp, F]), class: 'f3s s3', style: 'opacity:.5' }, g);
      if (rot > 0) {
        const img = [Ap, Dp, F].map((p) => rs(p, Ap, 90 * rot));
        S('polygon', { points: pts(img), class: 'f3s s3', style: rot >= 1 ? 'opacity:.35' : 'opacity:.85' }, g);
      }
      if (rot >= 1) {
        S('polygon', { points: pts([Ap, G, E]), class: 'f1s s1', style: 'opacity:.75' }, g);
        S('polygon', { points: pts([Ap, E, F]), class: ok ? 'f1s s1' : 'f2s s2', style: 'opacity:.75' }, g);
        line(g, G, Bp, 's2 thick dash'); line(g, Ap, G, 's3');
      } else S('polygon', { points: pts([Ap, E, F]), class: 'f1s', style: 'opacity:.5' }, g);
      wedge(g, Ap, E, F, 34, 'f2s', th + '°');
      line(g, Ap, E, 's1'); line(g, Ap, F, 's1'); line(g, E, F, 's2 thick');
      const ct = [Ap[0] + s / 2, Ap[1] + s / 2];
      label(g, Ap, ct, 'A'); label(g, Bp, ct, 'B'); label(g, Cp, ct, 'C'); label(g, Dp, ct, 'D');
      T(g, E[0], E[1] + 22, 'E', 'vname'); T(g, F[0] + 16, F[1] + 5, 'F', 'vname');
      if (rot >= 1) { dot(g, G, 3.5); T(g, G[0], G[1] + 22, 'G', 'vname'); }
      setC(hE, E);
      const be = e / U, dfu = df / U, efu = dist(E, F) / U;
      const per = (s - e) / U + (s - df) / U + efu;
      if (busy) { read.innerHTML = '△ADF 绕 A 旋转 90°：AD 转到 AB 上，F 转到 CB 的延长线上的 G 处……'; return; }
      let t = `正方形边长 6。<span class="k1">BE = ${f1(be)}</span>，<span class="k3">DF = ${f1(dfu)}</span>，BE + DF = ${f1(be + dfu)}，<span class="k2">EF = ${f1(efu)}</span>。`;
      if (rot >= 1 && ok) t += `<br>转过去后 △ABG ≌ △ADF：AG = AF，BG = DF。∠GAE = ∠GAB + ∠BAE = ∠DAF + ∠BAE = 90° − 45° = 45° = ∠EAF，AE 公共，所以 <b>△AGE ≌ △AFE（SAS）</b>（两个蓝色三角形），<b>EF = GE = BE + DF</b>。`;
      else if (rot >= 1) t += `<br>∠GAE = 90° − ${th}° = ${90 - th}°，不等于 ∠EAF = ${th}°，两个三角形<b>不全等</b>，GE ≠ EF。半角模型要求 ∠EAF 正好是 ∠BAD 的一半（45°）。`;
      else if (ok) t += `<br>不管 E 在哪里，EF 都等于 BE + DF！△CEF 的周长 = ${f1(per)} = 2 × 边长。为什么？点“旋转”把 DF 搬到 BE 旁边。`;
      else t += `<br>现在 ∠EAF = ${th}° ≠ 45°，EF 和 BE + DF 不再相等。`;
      read.innerHTML = t;
    }
    drag(svg, hE, (p) => { e = p.x - Bp[0]; fixE(); render(); }, () => !busy);
    render();
  };

  // ═════════ 四边形综合：正方形里的“十字架” ═════════
  A.c_quad_shape_cross = function (el) {
    const W = 440, Hh = 320, s = 240, U = 40, L = 100, R = 340, TOP = 40, BOT = 280;
    const Ap = [L, TOP], Bp = [L, BOT], Cp = [R, BOT], Dp = [R, TOP];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hM = S('circle', { r: 12, class: 'handle' }, svg);
    const hN = S('circle', { r: 12, class: 'handle' }, svg);
    const hP = S('circle', { r: 12, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let mx = 180, nx = 250, py = 210, tr = 0, busy = false;
    const c = ctrl(el);
    const tb = btn(c, '平移到顶点', () => {
      if (busy) return;
      busy = true;
      const from = tr, to = tr >= 1 ? 0 : 1;
      tween(1300, (x) => { tr = lerp(from, to, x); render(); }, () => { tr = to; busy = false; tb.textContent = to ? '移回去' : '平移到顶点'; render(); });
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动 M、N 改变蓝线方向，拖动 P 上下移动橙线。橙线始终和蓝线垂直。');
    function fix() {
      mx = clamp(mx, L, R); nx = clamp(nx, mx, Math.min(R, mx + 0.75 * s));
      py = clamp(py, TOP + (nx - mx), BOT);
    }
    function render() {
      g.innerHTML = '';
      const dx = nx - mx;
      const M = [mx, TOP], N = [nx, BOT], P = [L, py], Q = [R, py - dx];
      const o1 = mul(sub(Ap, M), tr), o2 = mul(sub(Bp, P), tr);
      const M2 = add(M, o1), N2 = add(N, o1), P2 = add(P, o2), Q2 = add(Q, o2);
      S('polygon', { points: pts([Ap, Bp, Cp, Dp]), class: 'fsurf sstrong' }, g);
      if (tr >= 1) {
        S('polygon', { points: pts([Ap, Bp, N2]), class: 'f3s s3', style: 'opacity:.7' }, g);
        S('polygon', { points: pts([Bp, Cp, Q2]), class: 'f3s s3', style: 'opacity:.7' }, g);
      }
      if (tr > 0) { line(g, M, N, 's1 thin dash'); line(g, P, Q, 's2 thin dash'); }
      line(g, M2, N2, 's1 thick'); line(g, P2, Q2, 's2 thick');
      const X = inter(M2, N2, P2, Q2);
      if (X && X[0] > L - 1 && X[0] < R + 1 && X[1] > TOP - 1 && X[1] < BOT + 1) S('path', { d: rightD(X, N2, Q2, 10), class: 'fnone sstrong thin' }, g);
      const ct = [L + s / 2, TOP + s / 2];
      label(g, Ap, ct, 'A'); label(g, Bp, ct, 'B'); label(g, Cp, ct, 'C'); label(g, Dp, ct, 'D');
      if (tr === 0) {
        T(g, M[0], M[1] - 8, 'M', 'vname'); T(g, N[0], N[1] + 22, 'N', 'vname');
        T(g, P[0] - 14, P[1] + 5, 'P', 'vname'); T(g, Q[0] + 14, Q[1] + 5, 'Q', 'vname');
      } else if (tr >= 1) {
        T(g, N2[0], N2[1] + 22, 'E', 'vname'); T(g, Q2[0] + 14, Q2[1] + 5, 'F', 'vname');
      }
      [hM, hN, hP].forEach((h, i) => { setC(h, [M, N, P][i]); h.style.display = tr === 0 ? '' : 'none'; });
      const len = Math.hypot(dx, s) / U;
      if (busy) { read.innerHTML = '两条线段各自平移（方向、长度都不变）：蓝线的一端移到 A，橙线的一端移到 B……'; return; }
      if (tr >= 1) read.innerHTML = `平移后变成 AE ⊥ BF。∠BAE 和 ∠CBF 都等于 90° − ∠AEB（同角的余角相等），AB = BC，∠ABE = ∠BCF = 90°，所以 <b>△ABE ≌ △BCF（ASA）</b>（两个绿色三角形），<b>AE = BF = ${f1(len)}</b>。平移不改变长度，所以原来的 MN = PQ。`;
      else read.innerHTML = `<span class="k1">MN = ${f1(len)}</span>，<span class="k2">PQ = ${f1(len)}</span>，MN ⊥ PQ。不管怎么拖，两条互相垂直、端点分别在两组对边上的线段<b>总相等</b>。点“平移到顶点”看看为什么。`;
    }
    drag(svg, hM, (p) => { mx = clamp(p.x, Math.max(L, nx - 0.75 * s), nx); fix(); render(); }, () => !busy && tr === 0);
    drag(svg, hN, (p) => { nx = p.x; fix(); render(); }, () => !busy && tr === 0);
    drag(svg, hP, (p) => { py = p.y; fix(); render(); }, () => !busy && tr === 0);
    fix();
    render();
  };

  // ═════════ 圆的综合：拖动四点，对角互补时共圆 ═════════
  A.c_circle_adv_concyclic = function (el) {
    const W = 440, Hh = 330, O0 = [220, 165], R0 = 125;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const NM = ['A', 'B', 'C', 'D'];
    const at = (deg, r) => [O0[0] + r * Math.cos(deg * D2R), O0[1] + r * Math.sin(deg * D2R)];
    let Pt = [at(200, R0), at(120, R0), at(25, R0), at(-80, R0 - 30)];
    const hs = NM.map(() => S('circle', { r: 12, class: 'handle' }, svg));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let busy = false, showC = true;
    btn(c, '把 D 吸到圆上', () => {
      if (busy) return;
      const cr = circ3(Pt[0], Pt[1], Pt[2]); if (!cr) return;
      const from = Pt[3], to = add(cr.c, mul(unit(cr.c, Pt[3]), cr.r));
      busy = true;
      tween(800, (t) => { Pt[3] = lp(from, to, t); render(); }, () => { Pt[3] = to; busy = false; render(); });
    });
    btn(c, '把 D 拉离圆', () => {
      if (busy) return;
      const cr = circ3(Pt[0], Pt[1], Pt[2]); if (!cr) return;
      const from = Pt[3], to = add(cr.c, mul(unit(cr.c, Pt[3]), cr.r * 0.78));
      busy = true;
      tween(800, (t) => { Pt[3] = lp(from, to, t); render(); }, () => { Pt[3] = to; busy = false; render(); });
    }, 'alt');
    const cb = btn(c, '隐藏过 A、B、C 的圆', () => { showC = !showC; cb.textContent = showC ? '隐藏过 A、B、C 的圆' : '显示过 A、B、C 的圆'; render(); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：四个点都能拖。保持 ABCD 是凸四边形，拖到对角互补时会自动吸附。');
    function convex() {
      let sg = 0;
      for (let i = 0; i < 4; i++) {
        const p = Pt[i], q = Pt[(i + 1) % 4], r = Pt[(i + 2) % 4];
        const cr = (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]);
        const s = Math.sign(cr);
        if (s === 0) return false;
        if (sg === 0) sg = s; else if (s !== sg) return false;
      }
      return true;
    }
    function render() {
      g.innerHTML = '';
      const [Pa, Pb, Pc, Pd] = Pt;
      const cr = circ3(Pa, Pb, Pc);
      const angA = angDeg(Pa, Pd, Pb), angB = angDeg(Pb, Pa, Pc), angC = angDeg(Pc, Pb, Pd), angD = angDeg(Pd, Pc, Pa);
      const ok = convex() && Math.abs(angA + angC - 180) < 0.6;
      if (cr && (showC || ok)) S('circle', { cx: cr.c[0].toFixed(1), cy: cr.c[1].toFixed(1), r: cr.r.toFixed(1), class: ok ? 'fnone s3 thick' : 'fnone smuted dash' }, g);
      S('polygon', { points: pts(Pt), class: 'fsurf sstrong', style: 'fill-opacity:.6' }, g);
      line(g, Pb, Pd, 'sline'); line(g, Pa, Pc, 'sline');
      wedge(g, Pa, Pd, Pb, 26, 'f1s', Math.round(angA) + '°', 'ts tb t1');
      wedge(g, Pc, Pb, Pd, 26, 'f2s', Math.round(angC) + '°', 'ts tb t2');
      const ct = cen(Pt);
      Pt.forEach((p, i) => { dot(g, p, 3.5); label(g, p, ct, NM[i], 'vname', 20); setC(hs[i], p); });
      const abd = angDeg(Pb, Pa, Pd), acd = angDeg(Pc, Pa, Pd);
      if (!convex()) { read.innerHTML = '请保持 ABCD 是凸四边形（四个点按 A→B→C→D 的顺序围一圈）。'; return; }
      let s = `<span class="k1">∠A = ${f1(angA)}°</span>，<span class="k2">∠C = ${f1(angC)}°</span>，∠A + ∠C = <b>${f1(angA + angC)}°</b>（∠B + ∠D = ${f1(angB + angD)}°）。<br>同侧张角：∠ABD = ${f1(abd)}°，∠ACD = ${f1(acd)}°。`;
      if (ok) s += '<br><b>对角互补 → A、B、C、D 四点共圆！</b>这时 ∠ABD = ∠ACD（同弧 AD 所对的圆周角）也相等。';
      else if (cr) s += `<br>D ${dist(Pd, cr.c) < cr.r ? '在圆内：∠A + ∠C 小于 180°' : '在圆外：∠A + ∠C 大于 180°'}，四点不共圆。`;
      read.innerHTML = s;
    }
    hs.forEach((h, i) => {
      drag(svg, h, (p) => {
        let q = [clamp(p.x, 15, W - 15), clamp(p.y, 15, Hh - 15)];
        const o = Pt.filter((_, j) => j !== i);
        const cr = circ3(o[0], o[1], o[2]);
        if (cr && Math.abs(dist(q, cr.c) - cr.r) < 5) q = add(cr.c, mul(unit(cr.c, q), cr.r));
        Pt[i] = q; render();
      }, () => !busy);
    });
    render();
  };

  // ═════════ 圆的综合：定弦定角，找隐藏的圆 ═════════
  A.c_circle_adv_hidden = function (el) {
    const W = 440, Hh = 300, U = 30, Ap = [130, 250], Bp = [310, 250], Cp = [405, 60];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hP = S('circle', { r: 12, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let al = 90, P = [250, 120], showArc = false, best = false, busy = false;
    const c = ctrl(el);
    const sA = slider(c, 'ha', '定角 α', 45, 150, 5, al, (v) => { if (busy) { sA.set(al); return; } al = v; best = false; render(); });
    const c2 = ctrl(el);
    const ab = btn(c2, '画出所有 ∠APB = α 的点', () => { if (busy) return; showArc = !showArc; ab.textContent = showArc ? '隐藏圆弧' : '画出所有 ∠APB = α 的点'; render(); });
    btn(c2, '求 CP 的最小值', () => {
      if (busy) return;
      showArc = true; ab.textContent = '隐藏圆弧';
      const { Q } = circ(), from = P;
      busy = true;
      tween(1100, (t) => { P = lp(from, Q, t); render(); }, () => { P = Q; best = true; busy = false; render(); });
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：拖动点 P（只在 AB 上方）。P 变绿说明 ∠APB 正好等于 α。');
    function circ() {
      const half = dist(Ap, Bp) / 2, Mx = mid(Ap, Bp);
      const R = half / Math.sin(al * D2R);
      const O = [Mx[0], Mx[1] - half / Math.tan(al * D2R)];
      let Q = add(O, mul(unit(O, Cp), R));
      if (Q[1] > Ap[1] - 1) Q = dist(Cp, Ap) < dist(Cp, Bp) ? Ap : Bp;
      return { O, R, Q };
    }
    function render() {
      g.innerHTML = '';
      const { O, R, Q } = circ();
      if (showArc) {
        const large = al < 90 ? 1 : 0;
        S('circle', { cx: O[0].toFixed(1), cy: O[1].toFixed(1), r: R.toFixed(1), class: 'fnone sline dash' }, g);
        S('path', { d: `M${Ap[0]},${Ap[1]} A${R.toFixed(1)},${R.toFixed(1)} 0 ${large} 1 ${Bp[0]},${Bp[1]}`, class: 'fnone s3 thick' }, g);
        dot(g, O, 3, 'fmuted'); T(g, O[0] + 8, O[1] - 6, 'O', 'vname', 'start');
        line(g, O, Ap, 'sline'); line(g, O, Bp, 'sline');
      }
      line(g, Ap, Bp, 'sstrong thick');
      const ang = angDeg(P, Ap, Bp), on = Math.abs(ang - al) < 1;
      line(g, P, Ap, 's1'); line(g, P, Bp, 's1');
      wedge(g, P, Ap, Bp, 22, on ? 'f3s' : 'f1s', Math.round(ang) + '°', on ? 'ts tb t3' : 'ts tb t1');
      line(g, Cp, P, best ? 's2 thick' : 's2 thin dash');
      dot(g, Cp, 4.5, 'f2'); T(g, Cp[0] - 8, Cp[1] - 8, 'C', 'vname', 'end');
      dot(g, Ap, 4); dot(g, Bp, 4); dot(g, P, 4.5, on ? 'f3' : 'fstrong');
      T(g, Ap[0] - 12, Ap[1] + 18, 'A', 'vname'); T(g, Bp[0] + 12, Bp[1] + 18, 'B', 'vname');
      T(g, P[0] + 12, P[1] - 8, 'P', 'vname', 'start');
      setC(hP, P);
      const oc = dist(O, Cp) / U, r = R / U;
      if (busy) { read.innerHTML = '连接 C 和圆心 O，P 移到 CO 与圆弧的交点……'; return; }
      let s = `AB = 6，<b>∠APB = ${f1(ang)}°</b>，定角 α = ${al}°。` + (on ? '<span class="k3">P 在“定角”的位置上！</span>' : '');
      if (showArc) {
        s += `<br>绿色圆弧上的每一点都满足 ∠APB = ${al}°（同弧所对的圆周角相等）。圆心 O 在 AB 的垂直平分线上，∠AOB = ${al <= 90 ? 2 * al : 360 - 2 * al}°，半径 R = ${f1(r)}。`;
        if (al === 90) s += '这时 AB 正好是直径（90° 的圆周角所对的弦是直径）。';
      } else s += '<br>拖着 P 找几个让 ∠APB = α 的位置，它们排成了什么形状？';
      if (best) s += `<br><b>CP 最小 = CO − R = ${f1(oc)} − ${f1(r)} = ${f1(oc - r)}</b>（圆外一点到圆上的点，沿过圆心的直线最近）。`;
      read.innerHTML = s;
    }
    drag(svg, hP, (p) => {
      P = [clamp(p.x, 15, W - 15), clamp(p.y, 15, Ap[1] - 8)];
      best = false;
      const { O, R } = circ();
      if (Math.abs(dist(P, O) - R) < 5) { const q = add(O, mul(unit(O, P), R)); if (q[1] < Ap[1] - 4) P = q; }
      render();
    }, () => !busy);
    render();
  };

  // ═════════ 相似模型：一线三等角（K 字型） ═════════
  A.c_similar_model_k = function (el) {
    const W = 440, Hh = 280, U = 26, Bp = [80, 250], Cp = [340, 250], AB = 4;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hP = S('circle', { r: 12, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let al = 90, p = 3, busy = false;
    const c = ctrl(el);
    const sA = slider(c, 'ka', '等角', 45, 120, 5, al, (v) => { if (busy) { sA.set(al); return; } al = v; render(); });
    btn(c, '让 P 从 B 走到 C', () => {
      if (busy) return;
      busy = true;
      tween(3500, (t) => { p = Math.round(lerp(0.3, 9.7, t) * 10) / 10; render(); }, () => { p = 9.7; busy = false; render(); });
    });
    btn(c, 'P 放到中点', () => { if (busy) return; p = 5; render(); }, 'alt');
    H('p', { class: 'anim-tip' }, el, 'BC = 10，AB = 4。三个橙色角始终相等（∠B = ∠APD = ∠C）。拖动 P，D 会跟着找到让 ∠APD 等于这个角的位置。');
    function render() {
      g.innerHTML = '';
      const a = al * D2R, cd = (p * (10 - p)) / AB;
      const Ap = [Bp[0] + AB * U * Math.cos(a), Bp[1] - AB * U * Math.sin(a)];
      const Dp = [Cp[0] - cd * U * Math.cos(a), Cp[1] - cd * U * Math.sin(a)];
      const P = [Bp[0] + p * U, Bp[1]];
      line(g, [30, Bp[1]], [W - 30, Bp[1]], 'sline');
      S('polygon', { points: pts([Ap, Bp, P]), class: 'f1s s1', style: 'opacity:.75' }, g);
      S('polygon', { points: pts([P, Cp, Dp]), class: 'f3s s3', style: 'opacity:.75' }, g);
      line(g, Ap, P, 'sstrong'); line(g, P, Dp, 'sstrong'); line(g, Bp, Cp, 'sstrong');
      wedge(g, Bp, Cp, Ap, 20, 'f2s', al + '°');
      wedge(g, P, Ap, Dp, 20, 'f2s', al + '°');
      wedge(g, Cp, Bp, Dp, 20, 'f2s', al + '°');
      dot(g, Ap, 3.5); dot(g, Dp, 3.5); dot(g, P, 4);
      T(g, Ap[0] - 4, Ap[1] - 10, 'A', 'vname'); T(g, Dp[0] + 4, Dp[1] - 10, 'D', 'vname');
      T(g, Bp[0] - 4, Bp[1] + 20, 'B', 'vname'); T(g, Cp[0] + 4, Cp[1] + 20, 'C', 'vname'); T(g, P[0], P[1] + 20, 'P', 'vname');
      setC(hP, P);
      const pc = 10 - p;
      let s = `<span class="k1">AB = 4</span>，<span class="k1">BP = ${fmt(p)}</span>，<span class="k3">PC = ${fmt(pc)}</span>，<span class="k3">CD = ${fmt(cd)}</span>。`;
      s += `<br>∠APC 是 △ABP 的外角：∠B + ∠BAP = ∠APD + ∠DPC，而 ∠B = ∠APD，所以 <b>∠BAP = ∠CPD</b>，再加 ∠B = ∠C，得 <b>△ABP ∽ △PCD</b>。`;
      s += `<br>AB : PC = BP : CD，即 AB · CD = BP · PC：4 × ${fmt(cd)} ≈ ${fmt(p)} × ${fmt(pc)} = ${fmt(p * pc)}。`;
      if (Math.abs(p - 5) < 0.05) s += '<br>P 在中点时 BP · PC 最大，<b>CD 最大 = 25 ÷ 4 = 6.25</b>。';
      read.innerHTML = s;
    }
    drag(svg, hP, (q) => { p = Math.round(clamp((q.x - Bp[0]) / U, 0.3, 9.7) * 10) / 10; if (Math.abs(p - 5) < 0.15) p = 5; render(); }, () => !busy);
    render();
  };

  // ═════════ 相似模型：母子型（共角共边） ═════════
  A.c_similar_model_mother = function (el) {
    const W = 440, Hh = 290, U = 34, Ap = [50, 260], Bp = [410, 260];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hC = S('circle', { r: 12, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let Cp = [200, 90], u = 0, busy = false;
    const c = ctrl(el);
    const fb = btn(c, '把 △ACD 翻过来、放大', () => {
      if (busy) return;
      busy = true;
      const from = u, to = u >= 1 ? 0 : 1;
      tween(1600, (t) => { u = lerp(from, to, t); render(); }, () => { u = to; busy = false; fb.textContent = to ? '放回去' : '把 △ACD 翻过来、放大'; render(); });
    });
    btn(c, '变成直角三角形', () => {
      if (busy) return;
      const M = mid(Ap, Bp), to = add(M, mul(unit(M, Cp), dist(Ap, Bp) / 2)), from = Cp;
      if (to[1] > Ap[1] - 30) return;
      busy = true;
      tween(900, (t) => { Cp = lp(from, to, t); render(); }, () => { Cp = to; busy = false; render(); });
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：拖动 C。D 在 AB 上，位置由 ∠ACD = ∠B 决定（两个橙色角相等）。');
    function render() {
      g.innerHTML = '';
      const ab = dist(Ap, Bp), ac = dist(Ap, Cp);
      const ad = (ac * ac) / ab;
      const Dp = add(Ap, mul(unit(Ap, Bp), ad));
      S('polygon', { points: pts([Ap, Bp, Cp]), class: 'f1s s1', style: 'opacity:.55' }, g);
      line(g, Cp, Dp, 'sstrong');
      wedge(g, Bp, Ap, Cp, 26, 'f2s');
      wedge(g, Cp, Ap, Dp, 26, 'f2s');
      wedge(g, Ap, Bp, Cp, 20, 'f3s');
      const tri = [Ap, Cp, Dp].map((q, i) => lp(q, [Ap, Bp, Cp][i], u));
      S('polygon', { points: pts(tri), class: 'f2s s2', style: 'opacity:.8' }, g);
      const right = Math.abs(angDeg(Cp, Ap, Bp) - 90) < 0.5;
      if (right && u === 0) S('path', { d: rightD(Dp, Bp, Cp, 9), class: 'fnone sstrong thin' }, g);
      const ct = cen([Ap, Bp, Cp]);
      label(g, Ap, ct, 'A'); label(g, Bp, ct, 'B'); label(g, Cp, ct, 'C');
      dot(g, Dp, 3.5); T(g, Dp[0], Dp[1] + 20, 'D', 'vname');
      setC(hC, Cp);
      const AC = ac / U, AD = ad / U, AB = ab / U, BD = AB - AD, CD = dist(Cp, Dp) / U, BC = dist(Bp, Cp) / U;
      if (busy) { read.innerHTML = '△ACD 绕着公共角 ∠A 翻过来，再放大……'; return; }
      let s = '';
      if (u >= 1) s = `△ACD 翻过来放大 ${fmt(AB / AC)} 倍，正好盖住 △ABC：A→A，C→B，D→C。<b>△ACD ∽ △ABC</b>。<br>`;
      s += `公共角 ∠A，又 ∠ACD = ∠B，所以 △ACD ∽ △ABC，<b>AC : AB = AD : AC</b>，即 <b>AC<sup>2</sup> = AD · AB</b>：<span class="k2">AC<sup>2</sup> = ${f1(AC)}<sup>2</sup> ≈ ${f1(AC * AC)}</span>，<span class="k1">AD · AB = ${f1(AD)} × ${f1(AB)} ≈ ${f1(AD * AB)}</span>。`;
      if (right) s += `<br>∠ACB = 90° 时，∠ACD = ∠B 就是 CD ⊥ AB（射影定理）：还有 CD<sup>2</sup> = AD · BD（${f1(CD * CD)} ≈ ${f1(AD * BD)}），BC<sup>2</sup> = BD · BA（${f1(BC * BC)} ≈ ${f1(BD * AB)}）。`;
      read.innerHTML = s;
    }
    drag(svg, hC, (p) => {
      let q = [clamp(p.x, 70, 390), clamp(p.y, 30, Ap[1] - 30)];
      const ab = dist(Ap, Bp);
      if (dist(Ap, q) > 0.93 * ab) q = add(Ap, mul(unit(Ap, q), 0.93 * ab));
      Cp = q; render();
    }, () => !busy && u === 0);
    render();
  };

  // ═════════ 旋转模型：手拉手 ═════════
  A.c_rotate_model_hand = function (el) {
    const W = 440, Hh = 340, U = 20, Ac = [220, 160];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let mode = 0, th = 150, r2 = 70, busy = false;
    const c = ctrl(el);
    const mb = ['两个等边三角形', '两个正方形'].map((s, i) => btn(c, s, () => { if (busy) return; mode = i; setActive(mb, i); render(); }, i ? 'alt' : ''));
    const c2 = ctrl(el);
    const sT = slider(c2, 'ht', '旋转角', 0, 360, 1, th, (v) => { if (busy) { sT.set(th); return; } th = v; render(); });
    slider(c2, 'hr', '小图形边长', 2, 5, 0.5, r2 / U, (v) => { r2 = v * U; render(); });
    btn(c2, '播放旋转', () => {
      if (busy) return;
      busy = true;
      const from = th;
      tween(6000, (t) => { th = (from + 360 * t) % 360; sT.set(Math.round(th)); render(); }, () => { th = from; sT.set(th); busy = false; render(); });
    });
    H('p', { class: 'anim-tip' }, el, '小图形绕公共顶点 A 旋转。两个同色三角形始终全等。');
    const dir = (deg, r) => [Ac[0] + r * Math.cos(deg * D2R), Ac[1] + r * Math.sin(deg * D2R)];
    function render() {
      g.innerHTML = '';
      let big, small, t1, t2, s1, s2, nm, ang, txt;
      if (mode === 0) {
        const r1 = 140;
        const B = dir(120, r1), C = rs(B, Ac, -60);
        const D = rs(dir(120, r2), Ac, -th), E = rs(D, Ac, -60);
        big = [Ac, B, C]; small = [Ac, D, E];
        t1 = [Ac, B, D]; t2 = [Ac, C, E]; s1 = [B, D]; s2 = [C, E];
        nm = [[Ac, 'A'], [B, 'B'], [C, 'C'], [D, 'D'], [E, 'E']]; ang = 60;
        txt = ['BD', 'CE', '△ABD', '△ACE', 'AB = AC，AD = AE，∠BAD = ∠CAE（∠BAC = ∠DAE = 60°，各自加上或减去同一个 ∠CAD）'];
      } else {
        const r1 = 110;
        const B = dir(135, r1), D = rs(B, Ac, -90), C = add(B, sub(D, Ac));
        const E = rs(dir(135, r2), Ac, -th), G = rs(E, Ac, -90), F = add(E, sub(G, Ac));
        big = [Ac, B, C, D]; small = [Ac, E, F, G];
        t1 = [Ac, B, E]; t2 = [Ac, D, G]; s1 = [B, E]; s2 = [D, G];
        nm = [[Ac, 'A'], [B, 'B'], [C, 'C'], [D, 'D'], [E, 'E'], [F, 'F'], [G, 'G']]; ang = 90;
        txt = ['BE', 'DG', '△ABE', '△ADG', 'AB = AD，AE = AG，∠BAE = ∠DAG（∠BAD = ∠EAG = 90°，各自加上或减去同一个 ∠DAE）'];
      }
      S('polygon', { points: pts(big), class: 'fsurf sstrong' }, g);
      S('polygon', { points: pts(small), class: 'fsurf s1' }, g);
      S('polygon', { points: pts(t1), class: 'f2s s2', style: 'opacity:.55' }, g);
      S('polygon', { points: pts(t2), class: 'f2s s2', style: 'opacity:.55' }, g);
      line(g, s1[0], s1[1], 's2 thick'); line(g, s2[0], s2[1], 's2 thick');
      const X = inter(s1[0], s1[1], s2[0], s2[1]);
      let deg = null;
      if (X) {
        const u1 = unit(s1[0], s1[1]), u2 = unit(s2[0], s2[1]);
        deg = Math.acos(Math.abs(u1[0] * u2[0] + u1[1] * u2[1])) * R2D;
        if (X[0] > 10 && X[0] < W - 10 && X[1] > 10 && X[1] < Hh - 10) {
          line(g, X, s1[0], 'sline dash'); line(g, X, s2[0], 'sline dash');
          dot(g, X, 4, 'f3');
        }
      }
      nm.forEach(([p, n]) => { dot(g, p, 3); label(g, p, n === 'A' ? add(p, [0, 1]) : Ac, n, 'vname', n === 'A' ? 16 : 15); });
      const l1 = dist(s1[0], s1[1]) / U, l2 = dist(s2[0], s2[1]) / U;
      let s = `<span class="k2">${txt[0]} = ${f1(l1)}</span>，<span class="k2">${txt[1]} = ${f1(l2)}</span>`;
      s += deg != null ? `，直线 ${txt[0]} 与 ${txt[1]} 所夹的锐角 = <b>${Math.round(deg)}°</b>（绿点是交点）。` : '。';
      s += `<br>${txt[4]}，所以 <b>${txt[2]} ≌ ${txt[3]}（SAS）</b>：${txt[3]} 就是 ${txt[2]} 绕 A 旋转 ${ang}° 得到的，所以 <b>${txt[0]} = ${txt[1]}</b>，两线夹角等于旋转角 ${ang}°。`;
      read.innerHTML = s;
    }
    render();
  };

  // ═════════ 旋转模型：等边三角形内一点，PA、PB、PC 集中 ═════════
  A.c_rotate_model_three = function (el) {
    const W = 440, Hh = 360, side = 240;
    const Bp = [100, 250], Cp = [100 + side, 250], Ap = [100 + side / 2, 250 - side * Math.sqrt(3) / 2];
    const k345 = side / Math.sqrt(25 + 12 * Math.sqrt(3)); // PA:PB:PC = 3:4:5 时的单位长
    const U = k345;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const hP = S('circle', { r: 12, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let P = [215, 170], rot = 0, busy = false;
    const c = ctrl(el);
    const rb = btn(c, '把 △ABP 绕 B 旋转 60°', () => {
      if (busy) return;
      busy = true;
      const from = rot, to = rot >= 1 ? 0 : 1;
      tween(1500, (t) => { rot = lerp(from, to, t); render(); }, () => { rot = to; busy = false; rb.textContent = to ? '转回去' : '把 △ABP 绕 B 旋转 60°'; render(); });
    });
    btn(c, '设成 PA = 3，PB = 4，PC = 5', () => {
      if (busy) return;
      const cand = cci(Ap, 3 * k345, Bp, 4 * k345);
      const to = cand.reduce((best, q) => (Math.abs(dist(q, Cp) - 5 * k345) < Math.abs(dist(best, Cp) - 5 * k345) ? q : best));
      const from = P;
      busy = true;
      tween(900, (t) => { P = lp(from, to, t); render(); }, () => { P = to; busy = false; render(); });
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：拖动三角形里的点 P（旋转前才能拖）。');
    function inside(q) {
      const s = (p1, p2, p3) => (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
      const d1 = s(q, Ap, Bp), d2 = s(q, Bp, Cp), d3 = s(q, Cp, Ap);
      return (d1 > 0 && d2 > 0 && d3 > 0) || (d1 < 0 && d2 < 0 && d3 < 0);
    }
    function render() {
      g.innerHTML = '';
      const P2 = rs(P, Bp, 60);
      S('polygon', { points: pts([Ap, Bp, Cp]), class: 'fsurf sstrong' }, g);
      if (rot > 0) {
        const img = [Ap, Bp, P].map((q) => rs(q, Bp, 60 * rot));
        S('polygon', { points: pts([Ap, Bp, P]), class: 'f1s', style: 'opacity:.5' }, g);
        S('polygon', { points: pts(img), class: 'f1s s1', style: 'opacity:.75' }, g);
      }
      if (rot >= 1) {
        S('polygon', { points: pts([Bp, P, P2]), class: 'f2s s2', style: 'opacity:.6' }, g);
        S('polygon', { points: pts([P, P2, Cp]), class: 'f3s s3', style: 'opacity:.7' }, g);
        line(g, P, P2, 's2 thick'); line(g, P2, Cp, 's1 thick');
        dot(g, P2, 4); T(g, P2[0] + 6, P2[1] + 18, 'P′', 'vname', 'start');
      }
      line(g, P, Ap, 's1 thick'); line(g, P, Bp, 's2 thick'); line(g, P, Cp, 's3 thick');
      dot(g, P, 4.5);
      const ct = cen([Ap, Bp, Cp]);
      label(g, Ap, ct, 'A'); label(g, Bp, ct, 'B'); label(g, Cp, ct, 'C');
      T(g, P[0] - 10, P[1] - 10, 'P', 'vname', 'end');
      setC(hP, P);
      hP.style.display = rot === 0 ? '' : 'none';
      const pa = dist(P, Ap) / U, pb = dist(P, Bp) / U, pc = dist(P, Cp) / U;
      if (busy) { read.innerHTML = '△ABP 绕 B 旋转 60°：BA 转到 BC 上，P 转到 P′……'; return; }
      let s = `<span class="k1">PA = ${f1(pa)}</span>，<span class="k2">PB = ${f1(pb)}</span>，<span class="k3">PC = ${f1(pc)}</span>，∠APB = ${f1(angDeg(P, Ap, Bp))}°。`;
      if (rot >= 1) {
        const a1 = angDeg(P2, P, Cp), a2 = angDeg(P2, Bp, Cp);
        s += `<br>旋转后 BP′ = BP，∠PBP′ = 60°，所以 △BPP′ 是<b>等边三角形</b>：<span class="k2">PP′ = PB</span>；又 <span class="k1">P′C = PA</span>。<br>三条线段 PA、PB、PC 集中到了绿色的 △PP′C 里！∠PP′C = ${f1(a1)}°，∠APB = ∠CP′B = ` + (Math.abs(a2 - 60 - a1) < 0.6 ? `60° + ∠PP′C = <b>${f1(60 + a1)}°</b>。` : `<b>${f1(a2)}°</b>。`);
        if (Math.abs(a1 - 90) < 0.6) s += '<br>3<sup>2</sup> + 4<sup>2</sup> = 5<sup>2</sup>，所以 ∠PP′C = 90°，<b>∠APB = 150°</b>。';
      } else s += '<br>PA、PB、PC 三条线段散在三个地方，不好用。用旋转把它们搬到一个三角形里。';
      read.innerHTML = s;
    }
    drag(svg, hP, (p) => { const q = [p.x, p.y]; if (inside(q) && dist(q, Ap) > 15 && dist(q, Bp) > 15 && dist(q, Cp) > 15 && rs(q, Bp, 60)[1] < Hh - 25) P = q; render(); }, () => !busy && rot === 0);
    render();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
