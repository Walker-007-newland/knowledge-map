// 第三阶段 物理组 2 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
// 光的直线传播、光的反射、光的折射、光的色散
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const rad = d => d * Math.PI / 180;

  // 以水平界面上的点 O 为端点、与竖直法线成 a 度、长 L 的点。q：'ul' 左上 'ur' 右上 'dl' 左下 'dr' 右下
  function at(ox, oy, a, L, q) {
    const dx = L * Math.sin(rad(a)), dy = L * Math.cos(rad(a));
    return [ox + (q[1] === 'r' ? dx : -dx), oy + (q[0] === 'd' ? dy : -dy)];
  }
  // 从法线量到光线的角度弧（q 同上）
  function arc(ox, oy, r, a, q, label) {
    if (a < 0.5) return '';
    const base = q[0] === 'u' ? -90 : 90;
    const sgn = (q[0] === 'u') === (q[1] === 'r') ? 1 : -1;
    const end = base + sgn * a;
    return F.angle(ox, oy, r, Math.min(base, end), Math.max(base, end), label);
  }
  // 眼睛（朝 dir 方向看：1 向右，-1 向左）
  function eye(x, y, dir) {
    dir = dir || 1;
    return `<path class="ink" d="M${x - 12},${y} Q${x},${y - 9} ${x + 12},${y} Q${x},${y + 9} ${x - 12},${y} Z"/>` + F.circle(x + 3 * dir, y, 3, 'solid');
  }
  // 彩色线段（色光演示专用：颜色本身就是演示内容）
  function cl(x1, y1, x2, y2, c, w) {
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" style="stroke:${c};stroke-width:${w || 3};stroke-linecap:round"/>`;
  }
  SIMS._p3_2 = { at, arc, eye };

  /* ---------- 小孔成像：改物距、像距、孔的形状 ---------- */
  SIMS.p3_2_pinhole = function (box) {
    const ui = SIMS.ui(box, '小孔成像：屏上是倒立的实像');
    const shape = ui.buttons(['圆形小孔', '三角形小孔', '方形小孔'], draw, 0);
    const fig = ui.fig();
    const U = ui.slider({ label: '物距（物体到小孔）', min: 10, max: 40, step: 1, value: 25, unit: 'cm' }, draw);
    const V = ui.slider({ label: '像距（光屏到小孔）', min: 10, max: 40, step: 1, value: 20, unit: 'cm' }, draw);
    const out = ui.out();
    ui.note('物体上每一点发出的光，只有穿过小孔的那一小束能射到屏上，上面的点射到下面、左边的点射到右边，于是屏上出现<b>倒立</b>的像。换孔的形状，像的形状不变——像的形状只由物体决定。孔要足够小；孔太大时屏上只是一片和孔形状差不多的亮斑。');

    const K = 6, HX = 300, AY = 150, H = 8;   // 1 cm 画 6 px；小孔在 x=300、y=150；物高 8 cm
    function draw() {
      const u = U.get(), v = V.get(), h2 = H * v / u;
      const xo = HX - u * K, xs = HX + v * K;
      const oT = AY - H * K / 2, oB = AY + H * K / 2;          // 物体 A（上）B（下）
      const iA = AY + H * K / 2 * v / u, iB = AY - H * K / 2 * v / u;   // 像 A′ 在下，B′ 在上
      let s = `<line class="ink" style="stroke-width:4" x1="${HX}" y1="20" x2="${HX}" y2="${AY - 4}"/>` +
        `<line class="ink" style="stroke-width:4" x1="${HX}" y1="${AY + 4}" x2="${HX}" y2="280"/>` +
        F.text(HX + 8, 290, '带小孔的板', { size: 12, a: 'start' });
      s += F.rect(xs, 20, 6, 260, 'soft') + F.text(xs + 3, 292, '光屏', { size: 12 });
      s += F.ray([[xo, oT], [HX, AY], [xs, iA]]) + F.ray([[xo, oB], [HX, AY], [xs, iB]]);
      s += F.arrow(xo, oB, xo, oT, { cls: 'hi' }) + F.text(xo - 14, oT, 'A', { cls: 'it' }) + F.text(xo - 14, oB, 'B', { cls: 'it' });
      s += F.arrow(xs - 4, iB, xs - 4, iA, { cls: 'hi' }) + F.text(xs + 22, iA, 'A′', { cls: 'it' }) + F.text(xs + 22, iB, 'B′', { cls: 'it' });
      // 孔的形状小图
      const k = shape.get();
      s += F.text(24, 24, '孔的形状：', { a: 'start', size: 13 });
      if (k === 0) s += F.circle(108, 24, 7, 'ink');
      if (k === 1) s += F.polygon([[108, 16], [100, 30], [116, 30]], 'ink');
      if (k === 2) s += F.rect(101, 17, 14, 14, 'ink');
      fig.innerHTML = F.svg(600, 300, s);
      const kind = Math.abs(h2 - H) < 1e-9 ? '等大' : h2 > H ? '放大' : '缩小';
      out.innerHTML = `物高 8 cm，像高 = 8 cm × 像距 ÷ 物距 = 8 × ${v} ÷ ${u} = <b>${SIMS.fmt(h2, 1)} cm</b>　→ <b>倒立、${kind}的实像</b><br>` +
        `如果物体是字母“F”，屏上的像是“<span style="display:inline-block;transform:rotate(180deg)">F</span>”（上下、左右都颠倒），与孔是${['圆形', '三角形', '方形'][k]}无关。`;
    }
    draw();
  };

  /* ---------- 光的反射：反射定律、光路可逆、镜面反射与漫反射 ---------- */
  SIMS.p3_2_reflect = function (box) {
    const ui = SIMS.ui(box, '光的反射');
    const mode = ui.buttons(['反射定律', '光路可逆', '镜面反射与漫反射'], draw, 0);
    const fig = ui.fig();
    const I = ui.slider({ label: '入射角 i', min: 0, max: 80, step: 5, value: 40, unit: '°' }, draw);
    const out = ui.out();
    ui.note('入射角、反射角都是光线与<b>法线</b>（虚线）的夹角，不是与镜面的夹角。拖动滑块：入射角变大，反射角跟着变大，两者始终相等。');

    function law(rev) {
      const i = I.get(), O = [300, 230];
      let A = at(O[0], O[1], i, 170, 'ul'), B = at(O[0], O[1], i, 170, 'ur');
      if (i === 0) { A = [294, 60]; B = [306, 60]; }
      const P = i === 0 ? [[294, 230], [306, 230]] : [O, O];
      let s = F.mirror(80, 230, 520, 230, 1) + F.text(500, 252, '平面镜', { size: 12 }) +
        F.line(300, 230, 300, 40, 'thin dash') + F.text(308, 44, '法线', { size: 12, a: 'start' }) + F.text(300, 248, 'O', { cls: 'it' });
      if (!rev) {
        s += F.ray([A, P[0]]) + F.ray([P[1], B]);
        s += F.text(A[0] - 6, A[1] - 12, '入射光线', { size: 12, a: i > 30 ? 'start' : 'end' }) + F.text(B[0] + 6, B[1] - 12, '反射光线', { size: 12, a: i > 30 ? 'end' : 'start' });
      } else {
        s += F.ray([B, P[1]]) + F.ray([P[0], A]);
        s += F.text(580, 24, '入射光线：逆着原来的反射光线射入', { size: 12, a: 'end' }) +
          F.text(20, 24, '反射光线：沿原来的入射光线射出', { size: 12, a: 'start' });
      }
      s += arc(300, 230, 42, i, 'ul', i + '°') + arc(300, 230, 42, i, 'ur', i + '°');
      fig.innerHTML = F.svg(600, 265, s);
      if (!rev) {
        out.innerHTML = `入射角 i = <b>${i}°</b>，反射角 r = <b>${i}°</b>　→ 反射角等于入射角<br>` +
          (i === 0 ? '光垂直射到镜面上：入射角、反射角都是 0°，光沿原路返回。'
            : `入射光线与镜面夹角 ${90 - i}°；入射光线与反射光线的夹角 = 2 × ${i}° = ${2 * i}°`);
      } else {
        out.innerHTML = '让光逆着原来反射光线的方向射到镜面，它就逆着原来入射光线的方向射出——<b>在反射现象中，光路是可逆的</b>。<br>所以你能从镜子里看到同学的眼睛，同学也能从镜子里看到你的眼睛。';
      }
    }

    function scatter() {
      const i = Math.min(I.get(), 50), L = 90;
      const d = [Math.sin(rad(i)), Math.cos(rad(i))];      // 入射方向（向右下）
      const refl = (n) => { const k = 2 * (d[0] * n[0] + d[1] * n[1]); return [d[0] - k * n[0], d[1] - k * n[1]]; };
      let s = F.text(160, 24, '镜面反射（表面光滑）', { size: 13 }) + F.text(485, 24, '漫反射（表面凹凸不平）', { size: 13 });
      // 左：光滑镜面
      s += F.mirror(20, 200, 300, 200, 1);
      [100, 140, 180, 220].forEach(x => {
        const r = refl([0, -1]);
        s += F.ray([[x - L * d[0], 200 - L * d[1]], [x, 200], [x + L * r[0], 200 + L * r[1]]]);
      });
      // 右：粗糙表面，由许多朝向不同的小平面组成
      const hits = [420, 460, 500, 540], tilt = [-16, 12, -8, 14];
      const pts = [[330, 200]];
      hits.forEach((x, j) => {
        const t = rad(tilt[j]), c = [Math.cos(t), Math.sin(t)];
        if (j) pts.push([x - 20, 205]);
        pts.push([x - 11 * c[0], 200 - 11 * c[1]], [x + 11 * c[0], 200 + 11 * c[1]]);
      });
      pts.push([575, 196], [630, 200]);
      s += F.poly(pts, 'ink');
      for (let x = 334; x < 630; x += 10) s += F.line(x, 210, x - 7, 217, 'thin');
      hits.forEach((x, j) => {
        const t = rad(tilt[j]), n = [Math.sin(t), -Math.cos(t)], r = refl(n);
        s += F.line(x, 200, x + 34 * n[0], 200 + 34 * n[1], 'thin dash') +
          F.ray([[x - L * d[0], 200 - L * d[1]], [x, 200], [x + L * r[0], 200 + L * r[1]]]);
      });
      fig.innerHTML = F.svg(640, 235, s);
      out.innerHTML = (I.get() > 50 ? '（这一页入射角最大演示到 50°）<br>' : '') +
        '左：平行光射到光滑表面，反射光仍然平行，只有某个方向的人看到很亮（黑板“反光”、玻璃幕墙光污染）。<br>' +
        '右：粗糙表面各处的法线（虚线）方向不同，平行光反射后射向四面八方，所以各个方向的人都能看到这个物体。<br><b>每一条光线都遵守光的反射定律</b>——漫反射也不例外。';
    }

    function draw() { const m = mode.get(); if (m === 2) scatter(); else law(m === 1); }
    draw();
  };

  /* ---------- 光的折射：空气→水、水→空气、空气→玻璃 ---------- */
  SIMS.p3_2_refract = function (box) {
    const ui = SIMS.ui(box, '光的折射：空气中的角总是大的');
    const mode = ui.buttons(['空气 → 水', '水 → 空气', '空气 → 玻璃'], draw, 0);
    const fig = ui.fig();
    const I = ui.slider({ label: '入射角', min: 0, max: 80, step: 1, value: 40, unit: '°' }, draw);
    const out = ui.out();
    ui.note('界面上光通常<b>同时发生反射和折射</b>（淡色的是反射光）。试一试：“空气 → 水”时入射角 30°，记下折射角；再切到“水 → 空气”，把入射角调到这个折射角附近，看折射角是不是回到约 30°——这就是折射时光路可逆。');

    const MED = [
      { n1: 1, n2: 1.33, up: '空气', down: '水', fromAir: true },
      { n1: 1.33, n2: 1, up: '空气', down: '水', fromAir: false },
      { n1: 1, n2: 1.5, up: '空气', down: '玻璃', fromAir: true }
    ];
    function draw() {
      const m = MED[mode.get()], i = I.get(), Ox = 300, Oy = 160, L = 140;
      const sr = m.n1 * Math.sin(rad(i)) / m.n2;
      const total = sr > 1;
      const r = total ? null : Math.asin(sr) * 180 / Math.PI;
      const qi = m.fromAir ? 'ul' : 'dl', qre = m.fromAir ? 'ur' : 'dr', qr = m.fromAir ? 'dr' : 'ur';
      let s = (m.down === '水' ? F.rect(40, Oy, 520, 125, 'water') + F.line(40, Oy, 560, Oy, 'water-line') : F.rect(40, Oy, 520, 125, 'soft') );
      s += F.line(40, Oy, 560, Oy, 'ink') + F.text(56, 36, m.up, { a: 'start', size: 14 }) + F.text(56, 270, m.down, { a: 'start', size: 14 });
      s += F.line(Ox, 20, Ox, 290, 'thin dash') + F.text(Ox + 6, 26, '法线', { a: 'start', size: 12 }) + F.text(Ox - 12, m.fromAir ? Oy + 14 : Oy - 12, 'O', { cls: 'it' });
      const A = at(Ox, Oy, i, L, qi);
      s += F.ray([A, [Ox, Oy]]);
      if (i > 0) s += `<g style="opacity:${total ? 1 : 0.35}">${F.ray([[Ox, Oy], at(Ox, Oy, i, L * 0.8, qre)])}</g>`;
      if (!total) s += F.ray([[Ox, Oy], at(Ox, Oy, r, L, qr)]) + arc(Ox, Oy, 50, r, qr, SIMS.fmt(r, 1) + '°');
      s += arc(Ox, Oy, 40, i, qi, i + '°');
      fig.innerHTML = F.svg(600, 300, s);
      let msg;
      if (i === 0) msg = '入射角 0°：光<b>垂直</b>射到界面上，折射角也是 0°，传播方向<b>不改变</b>。';
      else if (total) msg = `入射角 ${i}°：光从水射向空气时入射角太大，折射光线消失，只剩反射光（叫全反射，高中再学）。中考作图不会出现这种情况。`;
      else {
        msg = `入射角 = <b>${i}°</b>，折射角 ≈ <b>${SIMS.fmt(r, 1)}°</b>　→ `;
        msg += m.fromAir ? `光从空气斜射入${m.down}，折射角<b>小于</b>入射角，折射光线<b>靠近</b>法线。`
          : '光从水斜射入空气，折射角<b>大于</b>入射角，折射光线<b>偏离</b>法线。';
        msg += '<br>入射角增大，折射角也增大。反射光线与入射光线在同一种介质里，反射角 = 入射角 = ' + i + '°。';
      }
      out.innerHTML = msg;
    }
    draw();
  };

  /* ---------- 色光的三原色：开关红、绿、蓝三盏灯 ---------- */
  SIMS.p3_2_rgb = function (box) {
    const ui = SIMS.ui(box, '色光的混合：红、绿、蓝三盏灯照在白墙上');
    const fig = ui.fig();
    const on = [true, true, true], names = ['红', '绿', '蓝'];
    const btns = names.map((n, k) => ui.action('', () => { on[k] = !on[k]; draw(); }));
    const out = ui.out();
    ui.note('两盏灯重叠的地方：红 + 绿 = <b>黄</b>，绿 + 蓝 = <b>青</b>，红 + 蓝 = <b>品红</b>；三盏都重叠的中间是<b>白色</b>。手机、电视屏幕上每个像素就是由红、绿、蓝三个小发光点组成的。');
    const C = [['#ff0000', 170, 85], ['#00ff00', 130, 150], ['#0000ff', 210, 150]];
    const MIX = { '': '没有光，墙是黑的', '红': '红色', '绿': '绿色', '蓝': '蓝色', '红绿': '黄色', '绿蓝': '青色', '红蓝': '品红色', '红绿蓝': '白色' };
    function draw() {
      btns.forEach((b, k) => { b.textContent = (on[k] ? '关掉' : '打开') + names[k] + '灯'; });
      let s = '<rect x="0" y="0" width="340" height="230" style="fill:#000"/><g style="isolation:isolate">';
      C.forEach(([c, x, y], k) => { if (on[k]) s += `<circle cx="${x}" cy="${y}" r="58" style="fill:${c};mix-blend-mode:screen"/>`; });
      s += '</g>';
      fig.innerHTML = F.svg(340, 230, s);
      const key = names.filter((n, k) => on[k]).join('');
      out.innerHTML = `现在打开的灯：${key ? key.split('').join('、') : '无'}　→ 三束光全部重叠处是 <b>${MIX[key]}</b>`;
    }
    draw();
  };

  /* ---------- 物体的颜色：换照射的色光、换物体 ---------- */
  SIMS.p3_2_color = function (box) {
    const ui = SIMS.ui(box, '物体的颜色：看它反射什么色光');
    const LIGHTS = [['白光', [1, 1, 1]], ['红光', [1, 0, 0]], ['绿光', [0, 1, 0]], ['蓝光', [0, 0, 1]]];
    const OBJS = [['白纸', [1, 1, 1]], ['红纸', [1, 0, 0]], ['绿叶', [0, 1, 0]], ['蓝布', [0, 0, 1]], ['黑布', [0, 0, 0]]];
    const lt = ui.buttons(LIGHTS.map(l => '用' + l[0] + '照'), draw, 0);
    const ob = ui.buttons(OBJS.map(o => o[0]), draw, 1);
    const fig = ui.fig();
    const out = ui.out();
    ui.note('不透明物体的颜色由它<b>反射</b>的色光决定：白色物体反射所有色光，黑色物体吸收所有色光，红纸只反射红光。照射的光里没有它能反射的色光时，它看起来就是<b>黑色</b>。透明物体（如彩色玻璃）同理，看它<b>透过</b>的色光。');
    const COL = ['#e53935', '#2e9e44', '#1e63d6'], CN = ['红', '绿', '蓝'];
    const show = set => set.join('') === '111' ? '#f4f4f4' : set.join('') === '000' ? '#1a1a1a' : COL[set.indexOf(1)];
    const nameOf = set => set.join('') === '111' ? '白色' : set.join('') === '000' ? '黑色' : CN[set.indexOf(1)] + '色';
    const list = set => set.join('') === '111' ? '各种色光' : set.join('') === '000' ? '（什么色光都不反射）' : CN[set.indexOf(1)] + '光';
    function beam(x1, y1, x2, y2, set) {
      if (set.join('') === '111') return cl(x1, y1 - 4, x2, y2 - 4, COL[0], 2) + cl(x1, y1, x2, y2, COL[1], 2) + cl(x1, y1 + 4, x2, y2 + 4, COL[2], 2);
      return cl(x1, y1, x2, y2, COL[set.indexOf(1)], 3);
    }
    function draw() {
      const L = LIGHTS[lt.get()], O = OBJS[ob.get()];
      const seen = L[1].map((v, k) => v & O[1][k]);
      let s = F.circle(70, 60, 22, 'soft') + F.text(70, 60, '灯', { size: 13 }) + F.text(70, 100, L[0], { size: 13 });
      s += beam(92, 70, 250, 150, L[1]) + beam(88, 82, 230, 160, L[1]);
      s += `<rect x="220" y="150" width="140" height="60" rx="4" style="fill:${show(seen)};stroke:var(--fig-ink);stroke-width:1.5"/>` +
        F.text(290, 228, O[0] + '（能反射' + list(O[1]) + '）', { size: 13 });
      if (seen.some(v => v)) s += beam(330, 150, 500, 76, seen) + beam(350, 152, 505, 88, seen);
      else s += F.text(440, 120, '没有光反射进眼睛', { size: 13 });
      s += eye(520, 80, -1) +F.text(520, 104, '眼睛', { size: 12 });
      fig.innerHTML = F.svg(600, 245, s);
      out.innerHTML = `照射的光：${list(L[1]).replace('各种色光', '白光（含各种色光）')}；${O[0]}能反射：${list(O[1])}<br>` +
        `两者共有的色光才会被反射进眼睛 → ${O[0]}看起来是 <b>${nameOf(seen)}</b>`;
    }
    draw();
  };
})();
