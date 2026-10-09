// 第四阶段 物理组 1 互动演示（写法见 js/sims.js，清单见 docs/phase4-spec.md）
//   SIMS.p4_1_graph  图像题：拖动横坐标读数，看斜率（速度、密度、电阻）和面积（路程）的意义
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const fm = (x, d) => SIMS.fmt(x, d == null ? 2 : d);

  // 每种图像：两条（或一条分段）图线 + 读数说明
  const KINDS = [
    { name: 's-t：斜率 = 速度', xmax: 8, ymax: 40, xt: [2, 4, 6, 8], yt: [10, 20, 30, 40], xl: 't/s', yl: 's/m', xu: 's', yu: 'm',
      lines: [{ k: 5, lab: '甲', cls: 'hi' }, { k: 2.5, lab: '乙', cls: 'ray' }],
      say: (x, a, b) => `t = ${fm(x, 1)} s：s<sub>甲</sub> = ${fm(a, 1)} m，s<sub>乙</sub> = ${fm(b, 1)} m。` +
        (x > 0 ? `<br>斜率 s/t：v<sub>甲</sub> = ${fm(a, 1)} ÷ ${fm(x, 1)} = <b>5 m/s</b>，v<sub>乙</sub> = <b>2.5 m/s</b>——不管取哪一点，比值都不变，所以是匀速直线运动；越陡速度越大。` : '<br>拖动滑块，在图线上取一点。') },
    { name: 'm-V：斜率 = 密度', xmax: 50, ymax: 100, xt: [10, 20, 30, 40, 50], yt: [20, 40, 60, 80, 100], xl: 'V/cm³', yl: 'm/g', xu: 'cm³', yu: 'g',
      lines: [{ k: 2, lab: '甲', cls: 'hi' }, { k: 0.5, lab: '乙', cls: 'ray' }],
      say: (x, a, b) => `V = ${fm(x, 1)} cm³：m<sub>甲</sub> = ${fm(a, 1)} g，m<sub>乙</sub> = ${fm(b, 1)} g。` +
        (x > 0 ? `<br>斜率 m/V：ρ<sub>甲</sub> = <b>2 g/cm³</b>，ρ<sub>乙</sub> = <b>0.5 g/cm³</b>。同种物质质量与体积成正比，密度不随体积改变。体积相同时，m<sub>甲</sub> : m<sub>乙</sub> = 4 : 1。` : '<br>拖动滑块，在图线上取一点。') },
    { name: 'I-U：越陡电阻越小', xmax: 6, ymax: 1.2, xt: [1, 2, 3, 4, 5, 6], yt: [0.2, 0.4, 0.6, 0.8, 1, 1.2], xl: 'U/V', yl: 'I/A', xu: 'V', yu: 'A',
      lines: [{ k: 0.2, lab: '甲', cls: 'hi' }, { k: 0.1, lab: '乙', cls: 'ray' }],
      say: (x, a, b) => `U = ${fm(x, 1)} V：I<sub>甲</sub> = ${fm(a)} A，I<sub>乙</sub> = ${fm(b)} A。` +
        (x > 0 ? `<br>R = U/I：R<sub>甲</sub> = <b>5 Ω</b>，R<sub>乙</sub> = <b>10 Ω</b>。纵轴是电流，图线越陡，相同电压下电流越大，<b>电阻越小</b>。并联在 ${fm(x, 1)} V 时干路电流 = ${fm(a + b)} A。` : '<br>拖动滑块，在图线上取一点。') },
    { name: 'v-t：面积 = 路程', xmax: 10, ymax: 7, xt: [2, 4, 6, 8, 10], yt: [1, 2, 3, 4, 5, 6, 7], xl: 't/s', yl: 'v/(m·s⁻¹)', xu: 's', yu: 'm/s',
      step: true,
      say: (x, a, s) => `t = ${fm(x, 1)} s 时速度 v = ${fm(a, 1)} m/s。<br>阴影面积 = 0~${fm(x, 1)} s 内的路程 s = ` +
        (x <= 4 ? `6 m/s × ${fm(x, 1)} s = <b>${fm(s, 1)} m</b>` : `6 m/s × 4 s + 3 m/s × ${fm(x - 4, 1)} s = <b>${fm(s, 1)} m</b>`) +
        (x > 0 ? `，平均速度 = ${fm(s, 1)} m ÷ ${fm(x, 1)} s = ${fm(s / x)} m/s。` : '。') }
  ];
  const vStep = t => (t <= 4 ? 6 : 3);
  const sStep = t => (t <= 4 ? 6 * t : 24 + 3 * (t - 4));

  SIMS.p4_1_graph = function (box) {
    const ui = SIMS.ui(box, '图像题：读数、斜率与面积');
    const fig = ui.fig();
    let sl;
    const kind = ui.buttons(KINDS.map(k => k.name), () => { sl.set(sl.get()); draw(); }, 0);
    sl = ui.slider({ label: '横坐标', min: 0, max: 1, step: 0.025, value: 0.5,
      fmt: f => { const K = KINDS[kind.get()]; return fm(f * K.xmax, 2) + ' ' + K.xu; } }, draw);
    const out = ui.out();
    ui.note('读图三步：<b>看轴</b>（什么量、单位、每格多少）→ <b>看线</b>（过原点的直线 = 正比）→ <b>找点</b>（取图线上的点读数，代公式）。s-t、m-V、I-U 看斜率；v-t 看面积。');

    function draw() {
      const K = KINDS[kind.get()], x = sl.get() * K.xmax;
      const o = { x: 60, y: 40, w: 280, h: 170, xmax: K.xmax, ymax: K.ymax, xticks: K.xt, yticks: K.yt, xlabel: K.xl, ylabel: K.yl };
      let s = SIMS.axes(o), g = '';
      K.xt.forEach(t => { g += F.line(o.px(t), o.py(0), o.px(t), o.py(K.ymax), 'thin dash'); });
      K.yt.forEach(t => { g += F.line(o.px(0), o.py(t), o.px(K.xmax), o.py(t), 'thin dash'); });
      s += '<g style="opacity:.3">' + g + '</g>';
      if (K.step) {
        const pts = [[0, 0], [0, 6]];
        if (x <= 4) pts.push([x, 6], [x, 0]); else pts.push([4, 6], [4, 3], [x, 3], [x, 0]);
        if (x > 0) s += '<g style="opacity:.6">' + F.polygon(pts.map(p => [o.px(p[0]), o.py(p[1])]), 'water') + '</g>';
        s += F.line(o.px(0), o.py(6), o.px(4), o.py(6), 'hi') + F.line(o.px(4), o.py(3), o.px(10), o.py(3), 'hi');
        const v = vStep(x);
        s += F.line(o.px(x), o.py(0), o.px(x), o.py(v), 'force dash') + F.dot(o.px(x), o.py(v), 4);
        out.innerHTML = K.say(x, v, sStep(x));
      } else {
        const ys = K.lines.map(l => l.k * x);
        K.lines.forEach(l => {
          const xe = Math.min(K.xmax, K.ymax / l.k);
          s += F.line(o.px(0), o.py(0), o.px(xe), o.py(l.k * xe), l.cls) + F.text(o.px(xe) + 6, o.py(l.k * xe) - 8, l.lab, { size: 14, a: 'start' });
        });
        s += F.line(o.px(x), o.py(0), o.px(x), o.py(Math.min(K.ymax, Math.max.apply(null, ys))), 'force dash');
        ys.forEach(y => {
          if (y <= K.ymax) s += F.line(o.px(0), o.py(y), o.px(x), o.py(y), 'thin dash') + F.dot(o.px(x), o.py(y), 4);
        });
        out.innerHTML = K.say(x, ys[0], ys[1]) + (ys[0] > K.ymax ? '<br>（甲的读数已超出图的范围，往左拖一点。）' : '');
      }
      fig.innerHTML = F.svg(390, 245, s);
    }
    draw();
  };
})();
