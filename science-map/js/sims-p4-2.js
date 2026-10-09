// 第四阶段 物理组 2 互动演示（写法见 js/sims.js 顶部说明，清单见 docs/phase4-spec.md）
//   SIMS.p4_2_ratio  串联、并联电路中的比例：调 R₁、R₂，看 I、U、P 之比怎么跟着电阻比变
//   SIMS.p4_2_lift   用滑轮组从水中打捞物体：物体逐渐露出水面，浮力、拉力、机械效率怎么变
// 另外导出 SIMS._p4_2 = { ratioFig, liftFig }：physics/p4-2.js 的静态图也用它们，保证图和演示一致。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const fmt = (x, d) => SIMS.fmt(x, d);

  /* ================= 画图函数 ================= */
  // 串联 / 并联两个电阻的电路图。par = true 并联；o.l1、o.l2 电阻标注
  function ratioFig(par, o) {
    o = o || {};
    const l1 = o.l1 || 'R₁', l2 = o.l2 || 'R₂';
    let s;
    if (!par) {
      s = F.wire([[50, 50], [50, 140], [290, 140], [290, 50], [50, 50]]) +
        F.comp('R', 120, 50, { label: l1 }) + F.comp('R', 220, 50, { label: l2 }) +
        F.comp('switch', 110, 140, { on: true, label: 'S', ly: 20 }) + F.comp('battery', 220, 140);
      return F.svg(340, 170, s, o.cap);
    }
    s = F.wire([[90, 40], [250, 40], [250, 160], [90, 160], [90, 40]]) + F.wire([[90, 100], [250, 100]]) +
      F.node(90, 100) + F.node(250, 100) +
      F.comp('R', 170, 40, { label: l1 }) + F.comp('R', 170, 100, { label: l2 }) +
      F.comp('switch', 130, 160, { on: true, label: 'S', ly: 20 }) + F.comp('battery', 210, 160);
    return F.svg(340, 190, s, o.cap);
  }

  // 打捞示意图：n = 2 的滑轮组（向下拉）把长方体从水中匀速提起。
  // k：物体露出水面的高度占物体高度的比例（0 = 刚好浸没，1 = 完全出水）；o.labels 在物体旁写“物体”
  function liftFig(k, o) {
    o = o || {};
    const H = SIMS._p2_5;
    const Wy = 168, r = 16, bh = 34;                 // 水面 y、滑轮半径、物体高度（像素）
    const top = Wy - bh * k;                        // 物体上表面 y
    const ym = top - r - 22;                        // 动滑轮中心（pulleys 里：物体上表面 = ym + r + 22）
    const p = { seq: 'CMF', x: 70, r, yc: 22, yf: 52, ym, tip: 100, G: '', Fl: o.Fl };
    let s = H.pulleys(p);
    s += F.rect(20, Wy, 200, 250 - Wy, 'water') + F.line(20, Wy, 220, Wy, 'water-line');
    s += F.line(20, 250, 220, 250, 'ink');
    if (o.labels) s += F.text(p.xc + 30, top + bh / 2, '物体', { a: 'start', size: 13 });
    s += F.text(214, Wy - 10, '水面', { a: 'end', size: 12 });
    return F.svg(240, 262, s, o.cap);
  }

  /* ================= 演示 1：串并联比例 ================= */
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  // 两个正整数化成最简整数比
  const ratio = (x, y) => { const g = gcd(x, y); return (x / g) + ' : ' + (y / g); };

  SIMS.p4_2_ratio = function (box) {
    const ui = SIMS.ui(box, '串联、并联电路中的比例');
    let par = 0;
    ui.buttons(['串联', '并联'], i => { par = i; draw(); }, 0);
    const fig = ui.fig();
    const s1 = ui.slider({ label: '电阻 R₁', min: 2, max: 30, step: 1, value: 10, unit: 'Ω' }, draw);
    const s2 = ui.slider({ label: '电阻 R₂', min: 2, max: 30, step: 1, value: 20, unit: 'Ω' }, draw);
    const out = ui.out();
    ui.note('电源电压 6 V。先看“谁相同”：串联电流相同，其余各量之比都等于电阻之比（正比）；并联电压相同，其余各量之比都等于电阻的反比。');
    function draw() {
      const R1 = s1.get(), R2 = s2.get(), U = 6;
      let I1, I2, U1, U2;
      if (!par) { I1 = I2 = U / (R1 + R2); U1 = I1 * R1; U2 = I2 * R2; }
      else { U1 = U2 = U; I1 = U / R1; I2 = U / R2; }
      const P1 = U1 * I1, P2 = U2 * I2;
      fig.innerHTML = ratioFig(!!par);
      // 比值用电阻（整数）来写：串联时与电阻成正比，并联时成反比
      const same = '1 : 1', pro = ratio(R1, R2), inv = ratio(R2, R1);
      const row = (name, a, b, unit, d, rt) => `<tr><td>${name}</td><td>${fmt(a, d)} ${unit}</td><td>${fmt(b, d)} ${unit}</td><td><b>${rt}</b></td></tr>`;
      out.innerHTML = '<table class="tbl"><tr><th></th><th>R₁</th><th>R₂</th><th>比值（R₁ 的 : R₂ 的）</th></tr>' +
        row('电阻', R1, R2, 'Ω', 0, pro) + row('电流', I1, I2, 'A', 3, par ? inv : same) + row('电压', U1, U2, 'V', 2, par ? same : pro) +
        row('电功率', P1, P2, 'W', 2, par ? inv : pro) + '</table>' +
        (par ? '并联：电压之比 1 : 1，电流之比、电功率之比都等于 R₂ : R₁ = ' + inv + '。'
          : '串联：电流之比 1 : 1，电压之比、电功率之比都等于 R₁ : R₂ = ' + pro + '。');
    }
    draw();
  };

  /* ================= 演示 2：打捞物体 ================= */
  SIMS.p4_2_lift = function (box) {
    const ui = SIMS.ui(box, '从水中打捞物体：浮力、拉力和机械效率');
    const fig = ui.fig();
    const sl = ui.slider({ label: '露出水面的高度', min: 0, max: 0.4, step: 0.05, value: 0, unit: 'm' }, draw);
    const out = ui.out();
    ui.note('物体重 G = 600 N，高 0.4 m、底面积 0.05 m²（体积 0.02 m³），动滑轮重 100 N，n = 2，不计绳重、摩擦和水的阻力，水面高度视为不变，g 取 10 N/kg。' +
      '有用功是滑轮组对物体的拉力做的功：在水中 W有 = (G − F浮)h，所以浮力越小（露出越多），拉力越大，机械效率越高。');
    function draw() {
      const e = sl.get(), G = 600, Gd = 100, n = 2, V = 0.02, S = 0.05;
      const Vp = Math.max(0, V - S * e);
      const Ff = 1000 * 10 * Vp, T = G - Ff, Fp = (T + Gd) / n, eta = T / (T + Gd);
      fig.innerHTML = liftFig(e / 0.4, { labels: true });
      out.innerHTML = '<table class="tbl"><tr><th>V排</th><th>浮力 F浮</th><th>滑轮组对物体的拉力 G − F浮</th><th>绳端拉力 F</th><th>机械效率 η</th></tr><tr>' +
        `<td>${fmt(Vp, 3)} m³</td><td>${fmt(Ff, 1)} N</td><td>${fmt(T, 1)} N</td><td>${fmt(Fp, 1)} N</td><td>${fmt(eta * 100, 1)}%</td></tr></table>` +
        (e === 0 ? '刚好浸没：浮力最大，拉力最小，效率最低。完全浸没后在水下继续提升，浮力不变，拉力也不变。'
          : e >= 0.4 ? '完全出水：浮力为 0，F = (G + G动)/n，效率最高。' : '物体正在出水：V排 变小 → 浮力变小 → 拉力变大、机械效率变大。');
    }
    draw();
  };

  SIMS._p4_2 = { ratioFig, liftFig };
})();
