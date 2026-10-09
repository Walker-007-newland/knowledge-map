// 第三阶段 物理组 3 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
// 透镜、凸透镜成像的规律、生活中的透镜、眼睛和眼镜（新版人教版 八年级上册 第五章 透镜及其应用）
// 另外导出 SIMS._p3_3 = { optics, eye }：physics/p3-3.js 里的静态光路图也用它们画，保证图和演示一致。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  /* ================= 共用画图函数 ================= */

  // 从 P 沿方向 d 延伸到画布边缘（留 4 px 边）
  function toEdge(P, d, W, H) {
    let t = Infinity;
    if (d[0] > 1e-9) t = Math.min(t, (W - 4 - P[0]) / d[0]); else if (d[0] < -1e-9) t = Math.min(t, (4 - P[0]) / d[0]);
    if (d[1] > 1e-9) t = Math.min(t, (H - 4 - P[1]) / d[1]); else if (d[1] < -1e-9) t = Math.min(t, (4 - P[1]) / d[1]);
    if (!isFinite(t) || t < 0) t = 0;
    return [P[0] + t * d[0], P[1] + t * d[1]];
  }

  // 透镜成像光路图（单位都是 px）。返回 {svg, v, hi, real, none}
  // o: W,H 画布；L 透镜所在 x；Y 主光轴 y；f 焦距；kind 'convex'|'concave'；u 物距；h 物高（向上为正）
  //    rays 要画的特殊光线 [1 平行主光轴, 2 过光心, 3 过（指向）焦点]，默认全画；twoF 标 2F；lensH 透镜高
  //    noImage 不画像（作图题题目用）；noRays 不画光线；screen 实像处画光屏；objLabel/imgLabel 物、像顶端字母
  function optics(o) {
    const W = o.W, H = o.H, L = o.L, Y = o.Y, f = o.f, u = o.u, h = o.h;
    const cv = o.kind !== 'concave', lh = o.lensH || H - 40;
    let s = F.axis(6, W - 6, Y) + F.lens(L, Y, lh, cv ? 'convex' : 'concave');
    if (o.marks !== false) {
      [-1, 1].forEach(sd => {
        s += F.mark(L + sd * f, Y, 'F');
        if (o.twoF && L + sd * 2 * f > 8 && L + sd * 2 * f < W - 8) s += F.mark(L + sd * 2 * f, Y, '2F');
      });
      s += F.text(L + 10, Y + 13, 'O', { cls: 'it', size: 13 });
    }
    const xA = L - u, yA = Y - h, A = [xA, yA];
    const fs = cv ? f : -f;
    let v = null, hi = null, real = false;
    const none = Math.abs(u - fs) < 1e-6;
    if (!none) { v = u * fs / (u - fs); hi = -h * v / u; real = v > 0; }
    const I = none ? null : [L + v, Y - hi];
    const exitDir = P => none ? [u, h] : real ? [I[0] - P[0], I[1] - P[1]] : [P[0] - I[0], P[1] - I[1]];

    if (!o.noRays) {
      const rays = o.rays || [1, 2, 3];
      const draw = (P, pre) => {
        const E = toEdge(P, exitDir(P), W, H);
        let r = F.ray([A, P, E]);
        if (!none && !real && !o.noImage) r += F.ray([P, I], { dash: true, noArrow: true });
        return (pre || '') + r;
      };
      if (rays.includes(1) && h < lh / 2) {
        const P1 = [L, yA];
        s += draw(P1, !cv ? F.ray([P1, [L - f, Y]], { dash: true, noArrow: true }) : '');
      }
      if (rays.includes(2)) s += draw([L, Y]);
      if (rays.includes(3)) {
        const xT = cv ? L - f : L + f;
        if (Math.abs(xT - xA) > 1e-6) {
          const y3 = yA + (Y - yA) * (L - xA) / (xT - xA);
          if (Math.abs(y3 - Y) < lh / 2) {
            const P3 = [L, y3];
            let pre = '';
            if (cv && u < f) pre = F.ray([[xT, Y], A], { dash: true, noArrow: true });   // 反向延长线过焦点
            if (!cv) pre = F.ray([P3, [xT, Y]], { dash: true, noArrow: true });          // 延长线过另一侧焦点
            s += draw(P3, pre);
          }
        }
      }
    }
    s += F.obj(xA, Y, h);
    if (o.objLabel) s += F.text(xA - 13, yA, o.objLabel, { cls: 'it' });
    if (!none && !o.noImage) {
      if (real && o.screen) s += F.rect(L + v + 3, Y - lh / 2 + 6, 6, lh - 12, 'soft');
      s += F.obj(L + v, Y, hi, { dash: !real });
      if (o.imgLabel) s += F.text(L + v + 15, Y - hi, o.imgLabel, { cls: 'it' });
    }
    return { svg: s, v, hi, real, none };
  }

  // 眼睛示意图。mode: 'far' 正常眼看远处 | 'near' 正常眼看近处 | 'myopia' 近视眼看远处 | 'hyper' 远视眼看近处
  // glasses: 0 不戴 | 1 凹透镜 | 2 凸透镜。返回 {svg, xf, pos: 'on'|'front'|'back'}（画布 540×220）
  function eye(mode, glasses, o) {
    o = o || {};
    const CX = 380, CY = 110, R = 75, XL = 318, XR = CX + R - 2;     // XR：视网膜（主光轴处）
    const near = mode === 'near' || mode === 'hyper';
    const thick = { far: 7, near: 11, myopia: 13, hyper: 4 }[mode];
    const base = { far: XR, near: XR, myopia: XR - 36, hyper: XR + 40 }[mode];
    const xf = base + (glasses === 1 ? 36 : glasses === 2 ? -40 : 0);
    const pos = Math.abs(xf - XR) < 3 ? 'on' : xf < XR ? 'front' : 'back';
    let s = F.circle(CX, CY, R, 'ink');
    // 角膜（前面略凸出）、视网膜（后壁加粗）、晶状体
    s += `<path class="ink" d="M${CX - R + 10},${CY - 38} Q${CX - R - 16},${CY} ${CX - R + 10},${CY + 38}"/>`;
    s += `<path class="hi" style="stroke-width:4" d="M${CX + R * Math.cos(-0.9)},${CY + R * Math.sin(-0.9)} A${R},${R} 0 0 1 ${CX + R * Math.cos(0.9)},${CY + R * Math.sin(0.9)}"/>`;
    s += `<ellipse class="soft" cx="${XL}" cy="${CY}" rx="${thick}" ry="34"/>`;
    s += F.axis(10, 530, CY);
    // 光源
    const XG = 200, XS = 70;
    const hs = [-26, 0, 26];
    let gH, eH;           // 光线在眼镜处、晶状体处的高度（相对主光轴的倍数）
    if (!near) { gH = glasses === 1 ? 18 : glasses === 2 ? 30 : 26; eH = glasses === 1 ? 26 : glasses === 2 ? 22 : 26; }
    else { gH = 26 * (XG - XS) / (XL - XS); eH = glasses === 1 ? 32 : glasses === 2 ? 17 : 26; }
    const k = y => y / 26;
    hs.forEach(y0 => {
      const yg = CY + gH * k(y0), ye = CY + eH * k(y0);
      const start = near ? [XS, CY] : [16, glasses ? yg : ye];
      const pts = glasses ? [start, [XG, yg], [XL, ye]] : [start, [XL, ye]];
      // 晶状体之后：会聚到 (xf, CY)
      const d = [xf - XL, CY - ye];
      if (xf <= XR || y0 === 0) {
        const t = (XR - 2 - XL) / d[0];
        pts.push(xf <= XR && y0 !== 0 ? [XL + d[0] * Math.min(t, 1.0), ye + d[1] * Math.min(t, 1.0)] : [XL + d[0] * t, ye + d[1] * t]);
        if (xf < XR && y0 !== 0) pts.push([XR - 2, CY - (ye - CY) * (XR - 2 - xf) / (xf - XL)]);
        s += F.ray(pts);
      } else {
        const t = (XR - 2 - XL) / d[0], P = [XL + d[0] * t, ye + d[1] * t];
        pts.push(P);
        s += F.ray(pts) + F.ray([P, [xf, CY]], { dash: true, noArrow: true });
      }
    });
    if (pos !== 'on') s += F.dot(xf, CY, 3.5);
    if (near) s += F.dot(XS, CY, 4) + F.text(XS, CY + 22, o.srcLabel || '近处的物体', { size: 12 });
    else s += F.text(60, 40, o.srcLabel || '来自远处物体的光', { size: 12 });
    if (glasses) s += F.lens(XG, CY, 110, glasses === 1 ? 'concave' : 'convex') + F.text(XG, 40, glasses === 1 ? '凹透镜' : '凸透镜', { size: 12 });
    if (o.labels !== false) {
      s += F.line(XL, CY + 34, XL - 6, 182, 'thin') + F.text(XL - 6, 194, '晶状体', { size: 12 }) +
        F.line(CX + 58, CY - 48, CX + 92, 26, 'thin') + F.text(CX + 104, 18, '视网膜', { size: 12 });
    }
    return { svg: s, xf, pos };
  }

  SIMS._p3_3 = { optics, eye, toEdge };

  /* ================= 演示 1：透镜对光的作用与三条特殊光线 ================= */
  SIMS.p3_3_lens = function (box) {
    const ui = SIMS.ui(box, '透镜对光的作用：三条特殊光线');
    const kind = ui.buttons(['凸透镜', '凹透镜'], draw, 0);
    const which = ui.buttons(['一束平行光', '平行于主光轴', '经过（指向）焦点', '经过光心'], draw, 0);
    const fig = ui.fig();
    const Hs = ui.slider({ label: '入射点高度', min: -3, max: 3, step: 0.5, value: 1.5, unit: '格' }, draw);
    const out = ui.out();
    ui.note('橙色实线是真实的光线，橙色虚线是光线的延长线（没有真实的光）。“格”只是为了方便调节：1 格 = 主光轴上下 25 px。');

    const W = 600, H = 260, L = 300, Y = 130, f = 100, G = 25;
    function draw() {
      const cv = kind.get() === 0, w = which.get(), hv = Hs.get();
      let s = F.axis(6, W - 6, Y) + F.lens(L, Y, 220, cv ? 'convex' : 'concave') +
        F.mark(L - f, Y, 'F') + F.mark(L + f, Y, 'F') + F.text(L + 10, Y + 13, 'O', { cls: 'it', size: 13 }) +
        F.line(L + f, Y + 6, L + f, H - 8, 'thin dash') +
        F.arrow(L + f / 2, H - 14, L, H - 14, { cls: 'thin', size: 6 }) + F.arrow(L + f / 2, H - 14, L + f, H - 14, { cls: 'thin', size: 6 }) +
        F.text(L + f / 2, H - 26, '焦距 f', { size: 12 });
      let msg = '';
      const par = y => {      // 平行于主光轴、在高度 y（px，向上为正）入射
        const P = [L, Y - y];
        if (cv) return F.ray([[20, Y - y], P, toEdge(P, [f, y], W, H)]);
        return F.ray([[20, Y - y], P, toEdge(P, [f, -y], W, H)]) + F.ray([P, [L - f, Y]], { dash: true, noArrow: true });
      };
      if (w === 0) {
        [-2, -1, 1, 2].forEach(k => { s += par(k * G * 1.2); });
        s += F.ray([[20, Y], [W - 4, Y]]);
        msg = cv ? '凸透镜把平行于主光轴的光<b>会聚</b>到主光轴上的一点——<b>焦点 F</b>（真实光线会聚，是实焦点）。凸透镜对光有<b>会聚作用</b>。'
          : '凹透镜使平行于主光轴的光<b>发散</b>，发散光线的<b>反向延长线</b>交于入射一侧的焦点 F（虚焦点）。凹透镜对光有<b>发散作用</b>。';
      } else if (w === 1) {
        s += par(hv * G);
        msg = cv ? '规律①：平行于主光轴的光线，经凸透镜折射后<b>经过另一侧的焦点</b>。' : '规律①：平行于主光轴的光线，经凹透镜折射后发散，其<b>反向延长线经过入射一侧的焦点</b>（虚线）。';
        if (hv === 0) msg += '（高度为 0 时光线沿主光轴入射，方向不变。）';
      } else if (w === 2) {
        const P = [L, Y - hv * G];
        if (cv) {
          // 从左侧经过焦点 F(L-f, Y) 射到 P
          const d = [P[0] - (L - f), P[1] - Y];
          const S = toEdge([L - f, Y], [-d[0], -d[1]], W, H);
          s += F.ray([S, P, [W - 4, P[1]]]);
          msg = '规律②：经过焦点的光线，经凸透镜折射后<b>平行于主光轴</b>射出（这是规律①的光路可逆）。';
        } else {
          // 射向另一侧焦点 F(L+f, Y) 的光线
          const d = [(L + f) - P[0], Y - P[1]];
          const S = toEdge(P, [-d[0], -d[1]], W, H);
          s += F.ray([S, P, [W - 4, P[1]]]) + F.ray([P, [L + f, Y]], { dash: true, noArrow: true });
          msg = '规律②：<b>射向另一侧焦点</b>的光线（延长线过异侧焦点），经凹透镜折射后<b>平行于主光轴</b>射出。';
        }
      } else {
        const S = [20, Y - hv * G * 1.6];
        const d = [L - S[0], Y - S[1]];
        s += F.ray([S, [L, Y], toEdge([L, Y], d, W, H)]);
        msg = '规律③：经过<b>光心</b>的光线，传播方向<b>不变</b>（凸透镜、凹透镜都一样）。';
      }
      fig.innerHTML = F.svg(W, H, s);
      out.innerHTML = msg;
    }
    draw();
  };

  /* ================= 演示 2：凸透镜成像的规律 ================= */
  SIMS.p3_3_imaging = function (box) {
    const ui = SIMS.ui(box, '凸透镜成像：拖动物距，看像怎样变');
    const fb = ui.buttons(['焦距 f = 10 cm', '焦距 f = 15 cm'], () => { U.set(Math.min(50, U.get())); draw(); }, 0);
    const fig = ui.fig();
    const U = ui.slider({ label: '物距 u', min: 3, max: 50, step: 1, value: 30, unit: 'cm' }, draw);
    const show = ui.buttons(['画出三条特殊光线', '只看物和像'], draw, 0);
    const fv = () => (fb.get() === 0 ? 10 : 15);
    [['u > 2f', 2.6], ['u = 2f', 2], ['f < u < 2f', 1.5], ['u = f', 1], ['u < f', 0.6]].forEach(([lab, k]) => {
      ui.action(lab, () => { U.set(Math.round(fv() * k)); draw(); });
    });
    const out = ui.out();
    ui.note('蓝色实线箭头是物体，蓝色实线（倒立）是实像，蓝色虚线（正立）是虚像；实像位置画了光屏。像距 v 是用透镜成像公式算出来的，只为了让演示准确，初中不要求会算。像跑出画面时，说明像距或像太大了。');

    const W = 640, H = 300, L = 330, Y = 150, K = 6, HOBJ = 8;
    let lastU = null, lastF = null;
    const f1 = x => SIMS.fmt(x, 1);
    function draw() {
      const f = fv(), u = U.get();
      const r = optics({ W, H, L, Y, f: f * K, u: u * K, h: HOBJ * K, kind: 'convex', twoF: true, lensH: 250, screen: true,
        rays: show.get() === 0 ? [1, 2, 3] : [], noRays: show.get() === 1 });
      let s = r.svg;
      fig.innerHTML = F.svg(W, H, s);

      const v = r.none ? null : r.v / K, hi = r.none ? null : Math.abs(r.hi / K);
      let zone, row;
      if (u > 2 * f) { zone = 'u > 2f'; row = 0; } else if (u === 2 * f) { zone = 'u = 2f'; row = 1; }
      else if (u > f) { zone = 'f < u < 2f'; row = 2; } else if (u === f) { zone = 'u = f'; row = 3; } else { zone = 'u < f'; row = 4; }
      let msg = `焦距 f = <b>${f} cm</b>，物距 u = <b>${u} cm</b>　→　<b>${zone}</b><br>`;
      if (r.none) msg += '折射光线都平行，<b>不成像</b>（光屏放在哪里都接不到像）。';
      else if (r.real) {
        const vz = v > 2 * f + 1e-9 ? 'v > 2f' : Math.abs(v - 2 * f) < 1e-9 ? 'v = 2f' : 'f < v < 2f';
        const size = Math.abs(hi - HOBJ) < 1e-9 ? '等大' : hi > HOBJ ? '放大' : '缩小';
        msg += `像距 v ≈ <b>${f1(v)} cm</b>（${vz}，像在透镜另一侧）　像高 ≈ <b>${f1(hi)} cm</b>（物高 ${HOBJ} cm）<br>像的性质：<b>倒立、${size}的实像</b>，光屏能接到。`;
        if (L + r.v > W) msg += '<br><span style="color:var(--st-weak)">像距太大，像已经跑出画面：真实实验中光具座可能不够长，光屏上找不到像。</span>';
      } else {
        msg += `像在透镜<b>同侧</b>、离透镜约 <b>${f1(-v)} cm</b>，像高 ≈ <b>${f1(hi)} cm</b><br>像的性质：<b>正立、放大的虚像</b>，光屏接不到，要从光屏一侧<b>透过透镜</b>观察。`;
        if (L + r.v < 0) msg += '<br><span style="color:var(--st-weak)">虚像离透镜很远，已经跑出画面。</span>';
      }
      if (lastU != null && lastF === f && lastU !== u && !r.none) {
        const closer = u < lastU;
        const lastReal = lastU > f;
        if (r.real && lastReal) msg += `<br>趋势：物体${closer ? '靠近' : '远离'}透镜 → 像${closer ? '远离透镜、变大' : '靠近透镜、变小'}（成实像时“物近像远像变大”）。`;
        else if (!r.real && lastU < f) msg += `<br>趋势：物体${closer ? '靠近' : '远离'}透镜 → 虚像${closer ? '靠近透镜、变小' : '远离透镜、变大'}（成虚像时“物近像近像变小”）。`;
      }
      lastU = u; lastF = f;
      const rows = [
        ['u > 2f', 'f < v < 2f', '倒立、缩小、实像', '照相机'],
        ['u = 2f', 'v = 2f', '倒立、等大、实像', '测焦距'],
        ['f < u < 2f', 'v > 2f', '倒立、放大、实像', '投影仪'],
        ['u = f', '—', '不成像', '获得平行光'],
        ['u < f', '与物同侧', '正立、放大、虚像', '放大镜']
      ];
      msg += '<table class="tbl" style="margin-top:8px"><tr><th>物距</th><th>像距</th><th>像的性质</th><th>应用</th></tr>' +
        rows.map((rw, i) => `<tr${i === row ? ' style="background:var(--warn-bg);font-weight:700"' : ''}>${rw.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') + '</table>';
      out.innerHTML = msg;
    }
    draw();
  };

  /* ================= 演示 3：眼睛的成像、近视眼和远视眼的矫正 ================= */
  SIMS.p3_3_eye = function (box) {
    const ui = SIMS.ui(box, '眼睛和眼镜：像成在视网膜的哪里？');
    const mode = ui.buttons(['正常眼看远处', '正常眼看近处', '近视眼看远处', '远视眼看近处'], draw, 2);
    const gl = ui.buttons(['不戴眼镜', '戴凹透镜', '戴凸透镜'], draw, 0);
    const fig = ui.fig();
    const out = ui.out();
    ui.note('光线在眼球里会聚的那一点（黑点）就是像点。会聚点正好在视网膜上，看得清；在视网膜前或后，视网膜上是一个模糊的光斑，看不清。');
    const MODES = ['far', 'near', 'myopia', 'hyper'];
    function draw() {
      const m = MODES[mode.get()], g = gl.get();
      const r = eye(m, g);
      fig.innerHTML = F.svg(540, 210, r.svg);
      const where = { on: '正好成在<b>视网膜上</b>，看得清楚', front: '成在视网膜<b>前方</b>，看不清', back: '成在视网膜<b>后方</b>，看不清' }[r.pos];
      let msg = '像' + where + '。<br>';
      const why = {
        far: '正常眼看远处时，睫状体放松，晶状体<b>变薄</b>，焦距变大（折光能力变弱）。',
        near: '正常眼看近处时，睫状体收缩，晶状体<b>变厚</b>，焦距变小（折光能力变强）。',
        myopia: '近视眼：晶状体太厚、折光能力太强（或眼球前后方向太长），远处物体的像成在视网膜<b>前方</b>。',
        hyper: '远视眼：晶状体太薄、折光能力太弱（或眼球前后方向太短），近处物体的像成在视网膜<b>后方</b>。'
      }[m];
      msg += why;
      if (m === 'myopia') msg += g === 1 ? '<br>戴<b>凹透镜</b>：先让光发散一些，像后移到视网膜上——近视眼用凹透镜矫正。' : g === 2 ? '<br>戴凸透镜会让光更会聚，像更靠前，更看不清。' : '<br>试试给它戴哪种眼镜，能把像“推”到视网膜上？';
      if (m === 'hyper') msg += g === 2 ? '<br>戴<b>凸透镜</b>：先让光会聚一些，像前移到视网膜上——远视眼（老花眼）用凸透镜矫正。' : g === 1 ? '<br>戴凹透镜会让光更发散，像更靠后，更看不清。' : '<br>试试给它戴哪种眼镜，能把像“拉”到视网膜上？';
      if ((m === 'far' || m === 'near') && g) msg += '<br>正常眼不需要戴眼镜，戴了反而使像偏离视网膜。';
      out.innerHTML = msg;
    }
    draw();
  };
})();
