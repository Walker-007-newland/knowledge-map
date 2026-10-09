// 物理互动演示（写法见 js/sims.js 顶部说明）
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  // 欧姆定律：调电压和电阻，看电流表示数和 I-U 图像
  SIMS.ohm = function (box) {
    const ui = SIMS.ui(box, '探究电流与电压、电阻的关系');
    const fig = ui.fig();
    const U = ui.slider({ label: '电源电压 U', min: 0, max: 6, step: 0.5, value: 3, unit: 'V' }, draw);
    const R = ui.slider({ label: '电阻 R', min: 5, max: 20, step: 5, value: 10, unit: 'Ω' }, draw);
    const out = ui.out();
    ui.note('先固定 R 只拖电压：点在一条过原点的直线上移动（电流与电压成正比）。再固定 U 换电阻：R 变成 2 倍，I 变成一半（电流与电阻成反比）。');

    function draw() {
      const u = U.get(), r = R.get(), i = u / r;
      // 电路：电池组在左，电阻在上，电流表和开关在下，电压表并在电阻两端
      let s = F.wire([[50, 60], [50, 165], [240, 165], [240, 60], [50, 60]]) +
        F.comp('battery', 50, 112, { v: true, label: u + 'V', lx: -44 }) +
        F.comp('R', 145, 60, { label: 'R=' + r + 'Ω', ly: 20 }) +
        F.comp('A', 195, 165) +
        F.comp('switch', 100, 165, { on: true }) +
        F.wire([[105, 60], [105, 24], [185, 24], [185, 60]]) + F.node(105, 60) + F.node(185, 60) +
        F.comp('V', 145, 24) +
        F.text(195, 140, SIMS.fmt(i, 2) + ' A', { size: 14 });
      // I-U 图像
      const ax = { x: 360, y: 40, w: 170, h: 120, xmax: 6, ymax: 1.2, xticks: [2, 4, 6], yticks: [0.4, 0.8, 1.2], xlabel: 'U/V', ylabel: 'I/A' };
      s += SIMS.axes(ax);
      [5, 10, 20].forEach(rr => {
        const cls = rr === r ? 'hi' : 'thin dash';
        s += F.line(ax.px(0), ax.py(0), ax.px(Math.min(6, 1.2 * rr)), ax.py(Math.min(6, 1.2 * rr) / rr), cls);
        s += F.text(ax.px(Math.min(6, 1.2 * rr)) + 6, ax.py(Math.min(6, 1.2 * rr) / rr), rr + 'Ω', { a: 'start', size: 11 });
      });
      s += `<circle class="hi-fill" cx="${ax.px(u)}" cy="${ax.py(i)}" r="5"/>`;
      fig.innerHTML = F.svg(590, 190, s);
      out.innerHTML = `<b>I = U / R</b> = ${u} V ÷ ${r} Ω = <b>${SIMS.fmt(i, 2)} A</b>`;
    }
    draw();
  };

  // 浮力：金属块挂在弹簧测力计下，拖滑块让它慢慢浸入液体（水 / 盐水）
  SIMS.buoyancy = function (box) {
    const ui = SIMS.ui(box, '称重法测浮力：金属块慢慢浸入液体');
    const fig = ui.fig();
    const H = ui.slider({ label: '下降高度 h', min: 0, max: 8, step: 0.5, value: 0, unit: 'cm' }, draw);
    const liq = ui.buttons(['水', '盐水'], draw, 0);
    const out = ui.out();
    ui.note('金属块重 G = 5.4 N、体积 200 cm³（底面积 40 cm²、高 5 cm），容器底面积 200 cm²，g 取 10 N/kg，水的密度 1.0×10³ kg/m³，盐水 1.2×10³ kg/m³。' +
      '浸没之前越往下，排开液体的体积越大，浮力越大；浸没以后再往下，V排 不变，浮力也不变。换成盐水：同样的 V排，液体密度越大，浮力越大。');

    const G = 5.4, A = 40, HB = 5, S = 200, K = 10, GAP = 2;   // N、cm²、cm、cm²、像素/cm、起始时块底离液面 cm
    const RHO = [1.0, 1.2], NAME = ['水', '盐水'];
    // 下降 h 时：浸入深度 d（液面会上升，所以 d = (h-GAP)·S/(S-A)），V排、浮力、示数
    function calc(h, rho) {
      const d = Math.min(HB, Math.max(0, h - GAP) * S / (S - A));
      const vp = A * d;                          // cm³
      const fb = rho * 1000 * 10 * vp * 1e-6;    // N
      return { d, vp, rise: vp / S, fb, fs: G - fb };
    }

    function draw() {
      const h = H.get(), k = liq.get(), rho = RHO[k], c = calc(h, rho);
      const cx = 150, bw = 60, bh = HB * K;
      const ySurf = 210 - c.rise * K;               // 液面
      const bBot = 190 + h * K, bTop = bBot - bh;   // 金属块上下表面
      const hook = bTop - 30, rBot = hook - 10, rTop = rBot - 70;   // 细线留长一些，测力计不碰液面
      // 容器和液体
      let s = F.beaker(50, 160, 200, 140, (300 - ySurf) / 140) + F.text(66, 286, NAME[k], { a: 'start', size: 13 });
      // 金属块，浸入部分盖一层液体
      s += F.block(cx - bw / 2, bTop, bw, bh, '');
      if (ySurf < bBot) {
        const y0 = Math.max(bTop, ySurf);
        s += F.rect(cx - bw / 2, y0, bw, bBot - y0, 'water');
        if (ySurf > bTop) s += F.line(cx - bw / 2, ySurf, cx + bw / 2, ySurf, 'water-line');
      }
      s += F.text(cx - 10, (bTop + bBot) / 2, '金属块', { size: 12 });
      // 弹簧测力计（随金属块一起下降），刻度 0~6 N，每 1 N 9 像素，红线是指针
      s += F.circle(cx, rTop - 10, 4, 'ink') + F.line(cx, rTop - 6, cx, rTop) + F.rect(cx - 13, rTop, 26, 70, 'soft', 4);
      for (let n = 0; n <= 6; n++) s += F.line(cx - 13, rTop + 8 + n * 9, cx - (n % 2 ? 8 : 4), rTop + 8 + n * 9, 'thin');
      const py = rTop + 8 + c.fs * 9;
      s += F.line(cx - 10, py, cx + 10, py, 'force') +
        F.line(cx, rBot, cx, hook) + F.dot(cx, hook, 2.5) + F.line(cx, hook, cx, bTop, 'thin') +
        F.text(cx + 22, rTop + 35, 'F示 = ' + SIMS.fmt(c.fs, 2) + ' N', { a: 'start', size: 14 });
      // 浮力箭头（只表示方向和大致大小）
      if (c.fb > 0.001) {
        const my = (bTop + bBot) / 2;
        const len = 10 + c.fb * 15;
        s += F.force(cx + 18, my, cx + 18, my - len, '') + F.text(cx + 46, my - len / 2, 'F浮', { cls: 'it red' });
      }
      // 右边：F示、F浮 随 h 变化的图像
      const ax = { x: 340, y: 70, w: 180, h: 180, xmax: 8, ymax: 6, xticks: [2, 4, 6], yticks: [2, 4, 6], xlabel: 'h/cm', ylabel: 'F/N' };
      s += SIMS.axes(ax);
      const ps = [], pb = [];
      for (let i = 0; i <= 32; i++) {
        const q = calc(i / 4, rho);
        ps.push([ax.px(i / 4), ax.py(q.fs)]);
        pb.push([ax.px(i / 4), ax.py(q.fb)]);
      }
      s += F.poly(ps, 'hi') + F.poly(pb, 'ray') +
        F.circle(ax.px(h), ax.py(c.fs), 5, 'hi-fill') + F.circle(ax.px(h), ax.py(c.fb), 5, 'ray-head') +
        F.line(410, 30, 430, 30, 'hi') + F.text(436, 30, 'F示', { a: 'start', size: 14 }) +
        F.line(476, 30, 496, 30, 'ray') + F.text(502, 30, 'F浮', { a: 'start', size: 14 });
      fig.innerHTML = F.svg(580, 320, s);

      const imm = c.d >= HB - 1e-9;
      out.innerHTML = (c.d === 0 ? '金属块还没碰到液面，F<sub>浮</sub> = 0，示数等于重力。<br>' :
        `浸入深度 ${SIMS.fmt(c.d, 2)} cm，<b>V</b><sub>排</sub> = ${SIMS.fmt(c.vp, 1)} cm³${imm ? '（已浸没，V<sub>排</sub> = V<sub>物</sub>，再往下浮力不变）' : ''}，液面上升 ${SIMS.fmt(c.rise, 2)} cm<br>`) +
        `<b>F</b><sub>浮</sub> = ρ<sub>液</sub>gV<sub>排</sub> = ${rho.toFixed(1)}×10³ kg/m³ × 10 N/kg × ${SIMS.fmt(c.vp, 1)}×10⁻⁶ m³ = <b>${SIMS.fmt(c.fb, 2)} N</b><br>` +
        `<b>F</b><sub>示</sub> = G − F<sub>浮</sub> = 5.4 N − ${SIMS.fmt(c.fb, 2)} N = <b>${SIMS.fmt(c.fs, 2)} N</b>`;
    }
    draw();
  };

  // 电功率：“6V 3W”和“6V 6W”两只灯串联 / 并联，调电源电压看实际功率和亮度
  SIMS.power = function (box) {
    const ui = SIMS.ui(box, '两只灯泡谁更亮？');
    const fig = ui.fig();
    const mode = ui.buttons(['串联', '并联'], draw, 0);
    const U = ui.slider({ label: '电源电压 U', min: 0, max: 12, step: 0.5, value: 6, unit: 'V' }, draw);
    const out = ui.out();
    ui.note('灯丝电阻视为不变。灯的亮度（橙色深浅）按实际功率画。试一试：串联时把电压调到 9 V，看哪只灯正常发光；并联时电压超过 6 V 会怎样？');

    const L = [{ n: 'L₁', ue: 6, pe: 3 }, { n: 'L₂', ue: 6, pe: 6 }];
    L.forEach(l => { l.r = l.ue * l.ue / l.pe; });   // 12 Ω、6 Ω

    // 灯：先画电路符号，再叠一层透明度随功率变化的“光”，最后把叉线重画在上面
    // 实际功率的数值写在 (x+tx, y+ty)
    function lamp(x, y, p, tx, ty) {
      const op = p > 0 ? Math.min(1, 0.1 + 0.9 * p / 6) : 0;
      let s = F.comp('lamp', x, y);
      if (op > 0) {
        s += `<circle cx="${x}" cy="${y}" r="9" style="fill:var(--fig-ray);opacity:${op.toFixed(2)}"/>` +
          `<circle cx="${x}" cy="${y}" r="17" style="fill:none;stroke:var(--fig-ray);stroke-width:4;opacity:${(op * 0.5).toFixed(2)}"/>`;
      }
      return s + F.line(x - 7, y - 7, x + 7, y + 7) + F.line(x - 7, y + 7, x + 7, y - 7) +
        F.text(x + tx, y + ty, SIMS.fmt(p, 2) + ' W', { a: tx ? 'start' : 'middle', size: 12 });
    }

    function draw() {
      const u = U.get(), par = mode.get() === 1;
      const res = L.map(l => ({ l }));
      if (par) res.forEach(r => { r.u = u; r.i = u / r.l.r; });
      else {
        const i = u / (L[0].r + L[1].r);
        res.forEach(r => { r.i = i; r.u = i * r.l.r; });
      }
      res.forEach(r => { r.p = r.u * r.i; });

      let s;
      if (!par) {
        s = F.wire([[60, 75], [340, 75], [340, 190], [60, 190], [60, 75]]) +
          lamp(150, 75, res[0].p, 0, 32) + lamp(250, 75, res[1].p, 0, 32) +
          F.text(150, 38, 'L₁“6V 3W”', { size: 13 }) + F.text(250, 38, 'L₂“6V 6W”', { size: 13 });
      } else {
        s = F.wire([[80, 60], [320, 60], [320, 190], [80, 190], [80, 60]]) + F.wire([[80, 130], [320, 130]]) +
          F.node(80, 130) + F.node(320, 130) +
          lamp(200, 60, res[0].p, 22, -16) + lamp(200, 130, res[1].p, 22, -16) +
          F.text(178, 44, 'L₁“6V 3W”', { a: 'end', size: 13 }) + F.text(178, 114, 'L₂“6V 6W”', { a: 'end', size: 13 });
      }
      s += F.comp('battery', 200, 190) + F.text(200, 216, 'U = ' + u + ' V', { size: 13 });
      fig.innerHTML = F.svg(400, 240, s);

      const f = x => SIMS.fmt(x, 2);
      let html = '<table class="tbl"><tr><th></th><th>电阻</th><th>实际电压</th><th>电流</th><th>实际功率</th><th>情况</th></tr>';
      res.forEach(r => {
        const st = r.p <= 0 ? '不亮' : Math.abs(r.u - r.l.ue) < 1e-9 ? '正常发光' : r.u > r.l.ue ? '超过额定电压，容易烧坏' : '比正常发光暗';
        html += `<tr><td>${r.l.n}“${r.l.ue}V ${r.l.pe}W”</td><td>${r.l.r} Ω</td><td>${f(r.u)} V</td><td>${f(r.i)} A</td><td><b>${f(r.p)} W</b></td><td>${st}</td></tr>`;
      });
      html += '</table>';
      let cmp;
      if (u <= 0) cmp = '电源电压为 0，两灯都不亮。';
      else if (par) cmp = '<b>L₂ 更亮</b>：并联电压相同，由 P = U²/R，电阻小的灯实际功率大。';
      else cmp = '<b>L₁ 更亮</b>：串联电流相同，由 P = I²R，电阻大的灯实际功率大。';
      out.innerHTML = html + '<div>' + cmp + '</div>';
    }
    draw();
  };
})();
