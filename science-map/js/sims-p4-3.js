// 第四阶段 物理组 3 互动演示（清单见 docs/phase4-spec.md）
//   SIMS.p4_3_range  串联电路的安全范围：拖动滑片，看电流表、电压表、小灯泡哪一个先“超标”
//   SIMS.p4_3_gear3  三挡电热器（单刀双掷开关 S₂ + 开关 S₁）：切换开关看电路状态和功率
// 另外导出 SIMS._p4_3 = { gear3 }：physics/p4-3.js 里的静态电路图也用它画，保证图和演示一致。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const fm = (x, d) => SIMS.fmt(x, d == null ? 2 : d);

  /* ================= 三挡电热器电路（画布 400×215） ================= */
  // R₁ 在 A、B 之间，R₂ 在 B、C 之间；S₁ 把 C 接回 A；单刀双掷开关 S₂ 的刀接电源一端，触点 a 接 B、触点 b 接 C。
  // s1：S₁ 是否闭合；s2：'a' | 'b' | null（不画刀，作图题用）
  function gear3(s1, s2, o) {
    o = o || {};
    let s = F.wire([[80, 60], [360, 60]]) +
      F.wire([[80, 60], [80, 22], [360, 22], [360, 60]]) +
      F.wire([[80, 60], [80, 170], [96, 170]]) + F.wire([[134, 170], [230, 170]]) +
      F.wire([[220, 60], [220, 110], [270, 110], [270, 148]]) +
      F.wire([[270, 192], [360, 192], [360, 60]]) +
      F.node(80, 60) + F.node(220, 60) + F.node(360, 60);
    s += F.comp('R', 150, 60, { label: o.r1 || 'R₁', ly: 22 }) + F.comp('R', 290, 60, { label: o.r2 || 'R₂', ly: 22 }) +
      F.comp('switch', 220, 22, { on: s1, label: 'S₁', ly: 16 });
    s += F.circle(100, 170, 4, 'ink') + F.circle(130, 170, 4, 'ink') + F.text(115, 192, o.volt || '220 V', { size: 13 });
    s += F.dot(230, 170, 3) + F.dot(270, 148, 3) + F.dot(270, 192, 3) +
      F.text(284, 146, 'a', { cls: 'it', size: 14 }) + F.text(284, 204, 'b', { cls: 'it', size: 14 }) +
      F.text(205, 152, 'S₂', { cls: 'it', size: 14 });
    if (s2 === 'a') s += F.line(230, 170, 267, 150);
    else if (s2 === 'b') s += F.line(230, 170, 267, 190);
    if (o.names) s += F.text(80, 48, 'A', { cls: 'it', size: 13, a: 'end' }) + F.text(220, 46, 'B', { cls: 'it', size: 13 }) + F.text(372, 70, 'C', { cls: 'it', size: 13, a: 'start' });
    return s;
  }
  SIMS._p4_3 = { gear3 };

  /* ================= 演示 1：串联电路的安全范围 ================= */
  // 例题数据：电源 4.5 V，灯“2.5 V 1.25 W”（视为 5 Ω 不变），滑动变阻器“20 Ω 1 A”，电流表 0~0.6 A，电压表（测变阻器）0~3 V
  SIMS.p4_3_range = function (box) {
    const ui = SIMS.ui(box, '拖动滑片：哪个元件先“超标”？');
    const fig = ui.fig();
    const U = 4.5, RL = 5, RM = 20, IL = 0.5, IA = 0.6, IR = 1, UV = 3;
    let R = 8;
    const sl = ui.slider({ label: '变阻器接入电阻 R₂', min: 0, max: 20, step: 0.5, value: R, unit: 'Ω' }, v => { R = v; draw(); });
    const out = ui.out();
    ui.note('灯的电阻视为 5 Ω 不变。电压表测的是滑动变阻器两端的电压：R₂ 越大，它分到的电压越大。安全范围是 4 Ω ~ 10 Ω，试着把滑片拖到两端外面看看。');
    function draw() {
      const p = R / RM * 60 - 30;
      const S6 = SIMS._p3_6;
      fig.innerHTML = F.svg(340, 210, S6.dynSeries({ el: 'lamp', lab: 'L', v: 'b', p }));
      const I = U / (RL + R), U2 = I * R, UL = I * RL;
      const bad = [];
      if (I > IL + 1e-9) bad.push(`电流 ${fm(I, 3)} A 超过灯的额定电流 ${IL} A（灯会烧坏）`);
      if (I > IA + 1e-9) bad.push(`超过电流表量程 ${IA} A`);
      if (I > IR + 1e-9) bad.push(`超过变阻器允许的 ${IR} A`);
      if (U2 > UV + 1e-9) bad.push(`电压表示数 ${fm(U2)} V 超过量程 ${UV} V`);
      out.innerHTML = `电流 <b>${fm(I, 3)} A</b>，灯两端电压 ${fm(UL)} V，电压表示数（变阻器两端）<b>${fm(U2)} V</b>，灯的功率 ${fm(UL * I, 3)} W，电路总功率 ${fm(U * I, 3)} W<br>` +
        (bad.length ? `<span style="color:var(--fig-force)">✗ ${bad.join('；')}</span>` : '<span>✓ 各元件都安全</span>');
    }
    sl.set(R);
    draw();
  };

  /* ================= 演示 2：三挡电热器 ================= */
  SIMS.p4_3_gear3 = function (box) {
    const ui = SIMS.ui(box, '三挡电热器：切换开关看挡位（R₁ = R₂ = 110 Ω）');
    const fig = ui.fig();
    let s1 = false, s2 = 'b';
    ui.buttons(['S₁ 断开', 'S₁ 闭合'], i => { s1 = i === 1; draw(); }, 0);
    ui.buttons(['S₂ 接 a', 'S₂ 接 b'], i => { s2 = i === 0 ? 'a' : 'b'; draw(); }, 1);
    const out = ui.out();
    const R1 = 110, R2 = 110, U = 220;
    function draw() {
      fig.innerHTML = F.svg(400, 215, gear3(s1, s2, { names: true }));
      let txt;
      if (s1 && s2 === 'b') txt = '<span style="color:var(--fig-force)">✗ 电源两端经 S₁、S₂ 直接用导线连通——<b>短路</b>！这种组合绝对不允许出现。</span>';
      else if (!s1 && s2 === 'b') txt = `R₁、R₂ <b>串联</b>（A→R₁→B→R₂→C→b），总电阻 ${R1 + R2} Ω 最大，功率 P = U²/R = ${fm(U * U / (R1 + R2), 1)} W —— <b>低温挡</b>`;
      else if (!s1 && s2 === 'a') txt = `只有 R₁ 接入（A→R₁→B→a），R₂ 一端悬空没有电流，功率 ${fm(U * U / R1, 1)} W —— <b>中温挡</b>`;
      else txt = `S₁ 把 C 接到 A，R₁、R₂ 都接在 A、B 之间——<b>并联</b>，总电阻 ${fm(R1 * R2 / (R1 + R2), 1)} Ω 最小，功率 ${fm(U * U / R1 + U * U / R2, 1)} W —— <b>高温挡</b>`;
      out.innerHTML = txt;
    }
    draw();
  };
})();
