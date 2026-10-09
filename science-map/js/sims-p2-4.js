// 第二阶段 组 4 互动演示（写法见 js/sims.js 顶部说明，清单见 docs/phase2-spec.md）
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const fmt = (x, d) => SIMS.fmt(x, d);
  const mercRect = (x, y, w, h) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" style="fill:var(--fig-ink);opacity:.45"/>`;

  /* ---------- 液体压强：压强计探头的深度、液体种类、橡皮膜朝向 ---------- */
  SIMS.p2_4_liquid = function (box) {
    const ui = SIMS.ui(box, '液体压强：探头越深，U 形管高度差越大');
    const fig = ui.fig();
    const H = ui.slider({ label: '探头深度 h', min: 0, max: 20, step: 1, value: 8, unit: 'cm' }, draw);
    const LIQ = [{ n: '水', r: 1.0 }, { n: '盐水', r: 1.2 }, { n: '酒精', r: 0.8 }];
    const liq = ui.buttons(LIQ.map(l => l.n), draw, 0);
    const dir = ui.buttons(['橡皮膜朝下', '朝上', '朝侧面'], draw, 0);
    const out = ui.out();
    ui.note('U 形管里装的是水。探头处液体的压强 p = ρ液gh，它使 U 形管两侧水面出现高度差 Δh，ρ水gΔh = p（g 取 10 N/kg，盐水 1.2×10³ kg/m³，酒精 0.8×10³ kg/m³）。试试：同一深度换个朝向，高度差变不变？');

    const K = 10, YS = 70;           // 容器里 1 cm = 10 px，液面 y = 70
    const XL = 300, XR = 350, Y0 = 160, KU = 4;   // U 形管：两管位置、液面平衡位置、1 cm = 4 px

    function draw() {
      const h = H.get(), L = LIQ[liq.get()], d = dir.get();
      const p = L.r * 1000 * 10 * h / 100;    // Pa
      const dh = L.r * h;                      // U 形管中水的高度差（cm）
      const cx = 120, cy = YS + h * K;
      // 容器和液体
      let s = F.beaker(30, 50, 200, 250, 230 / 250) + F.text(42, 288, L.n, { a: 'start', size: 13 });
      // 深度标注
      if (h > 0) {
        s += F.line(cx + 12, cy, 205, cy, 'thin dash') + F.arrow(200, (YS + cy) / 2, 200, YS, { cls: 'thin', size: 6 }) +
          F.arrow(200, (YS + cy) / 2, 200, cy, { cls: 'thin', size: 6 }) + F.text(196, (YS + cy) / 2, 'h', { cls: 'it', a: 'end' });
      }
      // 探头和橡皮膜（蓝色粗线）
      s += F.rect(cx - 12, cy - 8, 24, 16, 'soft', 3);
      const mem = d === 0 ? [cx - 12, cy + 8, cx + 12, cy + 8] : d === 1 ? [cx - 12, cy - 8, cx + 12, cy - 8] : [cx - 12, cy - 8, cx - 12, cy + 8];
      s += `<line class="hi" style="stroke-width:4" x1="${mem[0]}" y1="${mem[1]}" x2="${mem[2]}" y2="${mem[3]}"/>`;
      // 软管
      s += F.poly([[cx + 12, cy], [165, cy], [165, 30], [XL, 30], [XL, 62]], 'ink');
      // U 形管
      const yl = Y0 + dh * KU / 2, yr = Y0 - dh * KU / 2;
      s += F.rect(XL - 6, yl, 12, 260 - yl, 'water') + F.rect(XR - 6, yr, 12, 260 - yr, 'water') + F.rect(XL - 6, 260, XR - XL + 12, 12, 'water') +
        F.line(XL - 6, yl, XL + 6, yl, 'water-line') + F.line(XR - 6, yr, XR + 6, yr, 'water-line') +
        F.poly([[XL - 6, 62], [XL - 6, 272], [XR + 6, 272], [XR + 6, 62]], 'ink') +
        F.poly([[XL + 6, 62], [XL + 6, 260], [XR - 6, 260], [XR - 6, 62]], 'ink');
      if (dh > 0) {
        s += F.line(XL + 6, yl, XR + 22, yl, 'thin dash') + F.line(XR + 6, yr, XR + 22, yr, 'thin dash') +
          F.text(XR + 26, Y0, 'Δh = ' + fmt(dh, 1) + ' cm', { a: 'start', size: 12 });
      }
      s += F.text(325, 292, 'U 形管压强计', { size: 12 });
      // p–h 图像
      const ax = { x: 470, y: 50, w: 150, h: 200, xmax: 20, ymax: 2.4, xticks: [10, 20], yticks: [0.8, 1.6, 2.4], xlabel: 'h/cm', ylabel: 'p/kPa' };
      s += SIMS.axes(ax);
      LIQ.forEach(l => {
        const on = l === L;
        s += F.line(ax.px(0), ax.py(0), ax.px(20), ax.py(2 * l.r), on ? 'hi' : 'thin dash') +
          F.text(ax.px(20) + 6, ax.py(2 * l.r), l.n, { a: 'start', size: 11 });
      });
      s += `<circle class="hi-fill" cx="${ax.px(h).toFixed(1)}" cy="${ax.py(p / 1000).toFixed(1)}" r="5"/>`;
      fig.innerHTML = F.svg(670, 305, s);

      out.innerHTML = `p = ρ<sub>液</sub>gh = ${L.r.toFixed(1)}×10³ kg/m³ × 10 N/kg × ${fmt(h / 100, 2)} m = <b>${fmt(p, 0)} Pa</b>　→　U 形管高度差 <b>${fmt(dh, 1)} cm</b><br>` +
        (d === 0 ? '同种液体中，深度越深，压强越大；深度相同时，液体密度越大，压强越大。' :
          '换了橡皮膜的朝向，高度差<b>不变</b>：液体内部同一深度，向各个方向的压强都相等。');
    }
    draw();
  };

  /* ---------- 托里拆利实验：倾斜、海拔、混入空气 ---------- */
  SIMS.p2_4_torricelli = function (box) {
    const ui = SIMS.ui(box, '托里拆利实验：什么会改变水银柱的高度');
    const fig = ui.fig();
    const T = ui.slider({ label: '玻璃管倾斜角', min: 0, max: 40, step: 5, value: 0, unit: '°' }, draw);
    const PLACES = [{ n: '海平面', p: 760 }, { n: '海拔约 1000 m', p: 674 }, { n: '海拔约 2000 m', p: 596 }, { n: '海拔约 3000 m', p: 526 }];
    const place = ui.buttons(PLACES.map(x => x.n), draw, 0);
    const air = ui.buttons(['管内是真空', '管内混入少量空气'], draw, 0);
    const out = ui.out();
    ui.note('玻璃管长 1000 mm，各海拔的大气压是大致数值（用 mm 水银柱表示）。先只拖倾斜角：水银柱变长，但竖直高度不变。再换地点：海拔越高，高度越小。最后混入空气：空气也向下压水银柱，高度变小，测得的大气压偏小（混入空气时管子倾斜，气体被压缩，高度也会跟着变）。');

    const LEN = 1000, C = 40 * 280, KP = 0.25;     // 管长 mm；混入的空气：海平面竖直时气柱 280 mm、压强 40 mm 水银柱；0.25 px/mm
    const PX = 210, PY = 300;                       // 玻璃管转轴（槽中水银面处）

    function height(p0, c, withAir) {
      if (!withAir) return p0;
      let lo = 0, hi = Math.min(p0, LEN * c);
      for (let i = 0; i < 60; i++) {
        const m = (lo + hi) / 2;
        if ((p0 - m) * (LEN - m / c) - C > 0) lo = m; else hi = m;
      }
      return (lo + hi) / 2;
    }

    function draw() {
      const th = T.get(), rad = th * Math.PI / 180, c = Math.cos(rad);
      const p0 = PLACES[place.get()].p, withAir = air.get() === 1;
      const h = height(p0, c, withAir), len = h / c;
      // 水银槽
      let s = mercRect(90, PY, 240, 30) + F.line(90, PY, 330, PY, 'thin') + F.poly([[90, 285], [90, 330], [330, 330], [330, 285]], 'ink');
      // 玻璃管（在转动后的坐标系里竖直画）
      const yTop = PY - LEN * KP, yM = PY - len * KP;
      s += `<g transform="rotate(${th} ${PX} ${PY})">` +
        (withAir ? `<rect x="${PX - 7}" y="${yTop}" width="14" height="${(yM - yTop).toFixed(1)}" style="fill:var(--fig-ray);opacity:.18"/>` : '') +
        mercRect(PX - 7, yM, 14, PY + 18 - yM) +
        F.path(`M${PX - 7},${PY + 18} L${PX - 7},${yTop + 8} Q${PX},${yTop - 6} ${PX + 7},${yTop + 8} L${PX + 7},${PY + 18}`, 'ink') + '</g>';
      // 管顶标注
      const tx = PX + LEN * KP * Math.sin(rad), ty = PY - LEN * KP * c;
      s += F.text(tx + 16, ty + 12, withAir ? '空气' : '真空', { a: 'start', size: 12 });
      // 竖直高度
      const yh = PY - h * KP, xm = PX + len * KP * Math.sin(rad);
      s += F.line(60, yh, xm + 24, yh, 'thin dash') + F.arrow(70, (yh + PY) / 2, 70, yh, { cls: 'thin', size: 6 }) +
        F.arrow(70, (yh + PY) / 2, 70, PY, { cls: 'thin', size: 6 }) + F.line(60, PY, 90, PY, 'thin') +
        F.text(64, (yh + PY) / 2, fmt(h, 0) + ' mm', { a: 'end', size: 13 });
      if (th > 0) s += F.line(PX, PY, PX, PY - 250, 'thin dash');
      fig.innerHTML = F.svg(480, 340, s);

      const pa = 13.6e3 * 9.8 * h / 1000;
      out.innerHTML = `管内外水银面的竖直高度差 <b>h = ${fmt(h, 0)} mm</b>，管内水银柱的长度 = h ÷ cos${th}° = ${fmt(len, 0)} mm<br>` +
        (withAir
          ? `管内气体压强 + 水银柱压强 = 大气压：${fmt(p0 - h, 0)} mm + ${fmt(h, 0)} mm = ${p0} mm 水银柱。只读 h 会以为大气压是 ${fmt(h, 0)} mm 水银柱，<b>偏小</b>。`
          : `大气压 p<sub>0</sub> = ρ<sub>水银</sub>gh = 13.6×10³ kg/m³ × 9.8 N/kg × ${fmt(h / 1000, 3)} m ≈ <b>${(pa / 1e5).toFixed(3)}×10⁵ Pa</b>` +
            (th > 0 ? '。管子倾斜了，竖直高度仍不变。' : ''));
    }
    draw();
  };

  /* ---------- 浮沉条件：改变物体密度和液体，看最终状态、受力和液面变化 ---------- */
  SIMS.p2_4_float = function (box) {
    const ui = SIMS.ui(box, '浮沉条件：物体最后停在哪里');
    const fig = ui.fig();
    const R = ui.slider({ label: '物体密度 ρ物', min: 0.2, max: 2.0, step: 0.1, value: 0.6, unit: 'g/cm³' }, draw);
    const LIQ = [{ n: '水', r: 1.0 }, { n: '盐水', r: 1.2 }, { n: '酒精', r: 0.8 }];
    const liq = ui.buttons(LIQ.map(l => l.n), draw, 0);
    const out = ui.out();
    ui.note('物体是边长 5 cm 的实心正方体（V = 125 cm³）；柱形容器底面积 150 cm²，放入物体前液体深 12 cm；g 取 10 N/kg。力的箭头按 1 N = 30 像素画。把 ρ物 调到和液体密度相同，看看悬浮。');

    const A = 25, V = 125, S = 150, H0 = 12, K = 12;     // cm²、cm³、cm²、cm、px/cm
    const X0 = 70, W = 168, YB = 310, HC = 20;            // 容器左边、宽、底、高（cm）
    const NAMES = ['漂浮', '悬浮', '沉底'];

    function draw() {
      const rho = R.get(), L = LIQ[liq.get()], rl = L.r;
      const state = Math.abs(rho - rl) < 1e-6 ? 1 : rho < rl ? 0 : 2;
      const d = state === 0 ? 5 * rho / rl : 5;            // 浸入深度 cm
      const vp = A * d, rise = vp / S, H = H0 + rise;
      const G = rho * V * 0.01, Fb = rl * vp * 0.01, FbFull = rl * V * 0.01, Fn = state === 2 ? G - Fb : 0;
      const ys = YB - H * K, cx = X0 + W / 2, side = 5 * K;
      let top;
      if (state === 0) top = ys + d * K - side;
      else if (state === 1) top = (ys + YB) / 2 - side / 2;
      else top = YB - side;
      const cy = top + side / 2;

      let s = F.block(cx - side / 2, top, side, side, '') + F.beaker(X0, YB - HC * K, W, HC * K, H / HC) +
        F.text(X0 + 8, YB - 12, L.n, { a: 'start', size: 13 });
      // 原液面和液面上升
      const y0 = YB - H0 * K;
      s += F.line(X0, y0, X0 + W + 30, y0, 'thin dash') + F.text(X0 + W + 34, y0 + 8, '原液面', { a: 'start', size: 11 });
      s += F.line(X0 + W, ys, X0 + W + 30, ys, 'thin') + F.text(X0 + W + 34, ys - 8, 'Δh = ' + fmt(rise, 2) + ' cm', { a: 'start', size: 11 });
      // 受力
      const k = 30;
      s += F.force(cx, cy, cx, cy + G * k, 'G', { lx: 12, ly: -8 });
      s += F.force(cx - 12, cy, cx - 12, cy - Fb * k, 'F浮', { lx: -18, ly: 8 });
      if (state === 2) s += F.force(cx + 12, cy, cx + 12, cy - Fn * k, 'F支', { lx: 18, ly: 8 });
      s += F.text(cx, YB - HC * K - 16, NAMES[state], { size: 15 });
      fig.innerHTML = F.svg(380, 395, s);

      const cmp = state === 0 ? 'F浮 &gt; G，松手后<b>上浮</b>，最后漂浮' : state === 1 ? 'F浮 = G，<b>悬浮</b>' : 'F浮 &lt; G，松手后<b>下沉</b>，最后沉底';
      let st;
      if (state === 0) st = `漂浮：F<sub>浮</sub> = G = ${fmt(G, 3)} N，V<sub>排</sub> = ${fmt(vp, 1)} cm³，浸入的比例 V<sub>排</sub>/V = ρ<sub>物</sub>/ρ<sub>液</sub> = ${fmt(rho / rl, 3)}`;
      else if (state === 1) st = `悬浮：F<sub>浮</sub> = G = ${fmt(G, 3)} N，V<sub>排</sub> = V = 125 cm³`;
      else st = `沉底：F<sub>浮</sub> = ${fmt(Fb, 3)} N，F<sub>支</sub> = G − F<sub>浮</sub> = ${fmt(Fn, 3)} N，V<sub>排</sub> = V = 125 cm³`;
      out.innerHTML = `浸没时 F<sub>浮</sub> = ρ<sub>液</sub>gV = ${fmt(FbFull, 3)} N，G = ρ<sub>物</sub>gV = ${fmt(G, 3)} N → ${cmp}<br>${st}<br>` +
        `液面上升 Δh = V<sub>排</sub>/S = ${fmt(vp, 1)} cm³ ÷ 150 cm² = ${fmt(rise, 2)} cm，液体对容器底的压强增加 Δp = ρ<sub>液</sub>gΔh = <b>${fmt(rl * 100 * rise, 1)} Pa</b>`;
    }
    draw();
  };
})();
