// 第二阶段 组 1 互动演示（写法见 js/sims.js 顶部说明，清单见 docs/phase2-spec.md）
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  /* ---------- 刻度尺读数：换分度值、拖物体长度、选起点 ---------- */
  SIMS.p2_1_ruler = function (box) {
    const ui = SIMS.ui(box, '刻度尺读数：估读到分度值的下一位');
    const div = ui.buttons(['分度值 1 mm', '分度值 1 cm'], draw, 0);
    const start = ui.buttons(['从 0 刻度线量起', '从 1.00 cm 量起（零刻度线磨损）'], draw, 0);
    const fig = ui.fig();
    const Ls = ui.slider({ label: '木块长度', min: 1, max: 6, step: 0.05, value: 2.35, unit: 'cm' }, draw);
    const out = ui.out();
    ui.note('读数 = 准确值 + 一位估读值 + 单位。1 mm 分度值的尺，读到 0.01 cm（即 0.1 mm）这一位；1 cm 分度值的尺，读到 0.1 cm 这一位。估读的那一位因人而异，相差 1 都算合理。');

    const X0 = 40, K = 70, C1 = 7;   // 尺子 0~7 cm，每 cm 70 像素
    function draw() {
      const mm = div.get() === 0, c0 = start.get() === 0 ? 0 : 1, L = Ls.get(), c1 = c0 + L;
      let s = F.rect(X0 - 10, 80, C1 * K + 40, 36, 'soft', 2);
      const step = mm ? 0.1 : 1, n = Math.round(C1 / step);
      for (let i = 0; i <= n; i++) {
        const c = i * step, x = X0 + c * K;
        const whole = Math.abs(c - Math.round(c)) < 1e-6, half = Math.abs(c * 2 - Math.round(c * 2)) < 1e-6;
        s += F.line(x, 80, x, 80 + (whole ? 15 : half ? 11 : 6), 'thin');
        if (whole) s += F.text(x, 105, Math.round(c), { size: 12 });
      }
      s += F.text(X0 + C1 * K + 18, 105, 'cm', { size: 12 });
      const xa = X0 + c0 * K, xb = X0 + c1 * K;
      s += F.block(xa, 48, xb - xa, 32, '木块') + F.line(xa, 40, xa, 84, 'thin dash') + F.line(xb, 40, xb, 84, 'thin dash') +
        F.arrow((xa + xb) / 2, 32, xa, 32, { cls: 'thin', size: 6 }) + F.arrow((xa + xb) / 2, 32, xb, 32, { cls: 'thin', size: 6 });
      // 放大镜：把木块右端附近放大 3 倍
      const zx = 360, zy = 130, zw = 200, zk = K * 3;
      const lo = c1 - zw / 2 / zk, hi = c1 + zw / 2 / zk;
      let z = `<clipPath id="p21clip"><rect x="${zx}" y="${zy}" width="${zw}" height="70"/></clipPath><g clip-path="url(#p21clip)">`;
      z += F.rect(zx - 10, zy + 30, zw + 20, 40, 'soft');
      for (let c = Math.floor(lo / step) * step; c <= hi + 1e-9; c += step) {
        const x = zx + zw / 2 + (c - c1) * zk, rc = Math.round(c * 10) / 10;
        const whole = Math.abs(rc - Math.round(rc)) < 1e-6, half = Math.abs(rc * 2 - Math.round(rc * 2)) < 1e-6;
        z += F.line(x, zy + 30, x, zy + 30 + (whole ? 20 : half ? 14 : 8), 'thin');
        if (whole || (mm && half)) z += F.text(x, zy + 60, whole ? Math.round(rc) : SIMS.fmt(rc, 1), { size: 12 });
      }
      z += F.rect(zx + zw / 2 - (c1 - c0) * zk, zy + 2, (c1 - c0) * zk, 28, 'soft') +
        F.line(zx + zw / 2, zy, zx + zw / 2, zy + 34, 'force') + '</g>';
      s += z + F.rect(zx, zy, zw, 70, 'ink', 4) + F.text(zx + zw / 2, zy + 84, '木块右端放大 3 倍', { size: 12 });
      fig.innerHTML = F.svg(560, 225, s);

      const endRead = mm ? c1.toFixed(2) : c1.toFixed(1);
      const len = mm ? L.toFixed(2) : (c1 - c0).toFixed(1);
      const acc = mm ? '准确到 1 mm（0.1 cm）' : '准确到 1 cm';
      let msg = `右端对准：<b>${endRead} cm</b>（${acc}，最后一位是估读的）`;
      if (c0) msg += `<br>起点对准 1.00 cm，木块长度 = ${endRead} cm − ${mm ? '1.00' : '1.0'} cm = <b>${len} cm</b>（别忘了减去起点）`;
      else msg += `<br>木块长度 = <b>${len} cm</b>`;
      if (mm && Math.abs(L * 10 - Math.round(L * 10)) < 1e-6) msg += `<br>末端正好对准刻度线时，估读位写 0：记作 ${len} cm，这个 0 不能省。`;
      if (!mm) msg += '<br>同一长度用 1 mm 分度值的尺测量，能多读出一位，结果更精确。';
      out.innerHTML = msg;
    }
    draw();
  };

  /* ---------- 参照物：同一个场景，选不同的参照物看 ---------- */
  SIMS.p2_1_reference = function (box) {
    const ui = SIMS.ui(box, '选不同的参照物，看到的运动不一样');
    const ref = ui.buttons(['以地面（树）为参照物', '以甲车为参照物', '以乙车为参照物'], () => draw(), 0);
    const fig = ui.fig();
    const vA = ui.slider({ label: '甲车速度（向右为正）', min: -10, max: 10, step: 1, value: 6, unit: 'm/s' }, () => draw());
    const vB = ui.slider({ label: '乙车速度（向右为正）', min: -10, max: 10, step: 1, value: 3, unit: 'm/s' }, () => draw());
    const btnPlay = ui.action('▶ 播放', toggle);
    ui.action('↺ 重置', reset);
    const out = ui.out();
    ui.note('画面始终跟着参照物走：选谁当参照物，谁在画面里就不动。橙色箭头是相对参照物的速度。把两车速度调成一样，再以甲车为参照物，看看乙车怎样——这就是“相对静止”。负数表示向左行驶。');

    const W = 600, K = 8;   // 画面宽 600 像素（循环），1 m = 8 像素
    let t = 0, running = false, gen = 0;
    const X0 = { A: 200, B: 380 };

    function toggle() {
      if (running) { running = false; gen++; btnPlay.textContent = '▶ 继续'; return; }
      running = true; btnPlay.textContent = '⏸ 暂停';
      const my = ++gen;
      let last = 0;
      const step = ts => {
        if (my !== gen || !running) return;
        if (!box.isConnected) { running = false; return; }
        if (last) t += Math.min(0.1, (ts - last) / 1000);
        last = ts;
        draw();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function reset() { running = false; gen++; t = 0; btnPlay.textContent = '▶ 播放'; draw(); }
    const wrap = x => ((x % W) + W) % W;

    function car(x, y, name, cls, vrel) {
      const one = xx => F.rect(xx - 34, y - 14, 68, 22, cls, 5) + F.rect(xx - 18, y - 26, 36, 13, 'soft', 3) +
        F.circle(xx - 20, y + 9, 6, 'soft') + F.circle(xx + 20, y + 9, 6, 'soft') + F.text(xx, y - 3, name, { size: 13 });
      let s = one(x);
      if (x > W - 40) s += one(x - W);
      if (x < 40) s += one(x + W);
      if (Math.abs(vrel) > 1e-9) {
        const len = 12 + Math.abs(vrel) * 5, d = vrel > 0 ? 1 : -1;
        s += F.arrow(x - d * len / 2, y - 46, x + d * len / 2, y - 46, { cls: 'ray', size: 7 });
      }
      return s;
    }

    function draw() {
      const va = vA.get(), vb = vB.get(), r = ref.get();
      const vref = [0, va, vb][r];
      const xa = X0.A + va * t * K, xb = X0.B + vb * t * K;
      const shift = vref * t * K;          // 画面跟着参照物移动
      let s = F.rect(0, 112, W, 74, 'soft') + F.line(0, 149, W, 149, 'thin dash') + F.line(0, 196, W, 196, 'ink');
      // 树（固定在地面上）
      for (let i = 0; i < 4; i++) {
        const x = wrap(75 + i * 150 - shift);
        const tree = xx => F.line(xx, 112, xx, 80, 'ink') + F.circle(xx, 66, 18, 'soft');
        s += tree(x) + (x > W - 20 ? tree(x - W) : '') + (x < 20 ? tree(x + W) : '');
      }
      if (r !== 0 && Math.abs(vref) > 1e-9) {
        const d = -vref > 0 ? 1 : -1, len = 12 + Math.abs(vref) * 5;
        s += F.arrow(W / 2 - d * len / 2, 20, W / 2 + d * len / 2, 20, { cls: 'ray', size: 7 }) + F.text(W / 2 + d * (len / 2 + 8), 20, '树', { a: d > 0 ? 'start' : 'end', size: 13 });
      }
      s += car(wrap(xb - shift), 136, '乙', 'soft', vb - vref) + car(wrap(xa - shift), 176, '甲', 'hi', va - vref);
      fig.innerHTML = F.svg(W, 205, s);

      const nm = ['地面（树）', '甲车', '乙车'][r];
      const desc = (name, vr) => Math.abs(vr) < 1e-9 ? `${name}<b>静止</b>` : `${name}<b>向${vr > 0 ? '右' : '左'}运动</b>（${Math.abs(vr)} m/s）`;
      const items = [];
      if (r !== 0) items.push(desc('树（地面）', -vref));
      if (r !== 1) items.push(desc('甲车', va - vref));
      if (r !== 2) items.push(desc('乙车', vb - vref));
      let msg = `以<b>${nm}</b>为参照物：` + items.join('；') + '。';
      if (va === vb) msg += '<br>两车速度大小、方向都相同，彼此位置不变——<b>相对静止</b>。';
      else if (r === 0 && va * vb > 0) msg += '<br>两车同向行驶但快慢不同。切换到“以' + (Math.abs(va) > Math.abs(vb) ? '甲' : '乙') + '车为参照物”，看看另一辆车怎么动。';
      out.innerHTML = msg;
    }
    draw();
  };

  /* ---------- 托盘天平：加减砝码、移动游码直到平衡 ---------- */
  SIMS.p2_1_balance = function (box) {
    const ui = SIMS.ui(box, '用天平称质量：先大后小加砝码，最后移游码');
    const OBJ = [{ n: '小石块', m: 72.4 }, { n: '橡皮擦', m: 23.6 }, { n: '金属块', m: 157.8 }];
    const pick = ui.buttons(OBJ.map(o => o.n), () => { on.fill(false); syncBtns(); rid.set(0); draw(); }, 0);
    const fig = ui.fig();
    const rid = ui.slider({ label: '游码示数', min: 0, max: 5, step: 0.2, value: 0, unit: 'g' }, draw);
    const W = [100, 50, 20, 20, 10, 5];
    const on = W.map(() => false);
    const btns = W.map((w, i) => ui.action(w + ' g', () => { on[i] = !on[i]; syncBtns(); draw(); }));
    ui.action('取下全部砝码', () => { on.fill(false); syncBtns(); draw(); });
    const out = ui.out();
    ui.note('天平已经调好平衡（游码归零时横梁水平）。点砝码按钮把它放上右盘或取下。指针偏向哪边，说明哪边偏重。这里的指针画在横梁上方，只是示意。');
    function syncBtns() { btns.forEach((b, i) => b.classList.toggle('on', on[i])); }

    function draw() {
      const obj = OBJ[pick.get()];
      const wsum = W.reduce((a, w, i) => a + (on[i] ? w : 0), 0), r = rid.get();
      const diff = obj.m - (wsum + r);
      const bal = Math.abs(diff) < 0.05;
      const deg = bal ? 0 : Math.sign(diff) * Math.min(10, 1.5 + 3 * Math.log10(1 + Math.abs(diff) * 5));
      const th = -deg * Math.PI / 180;        // 左边重 → 左端下沉
      const cx = 280, cy = 150, L = 150;
      const end = sgn => [cx + sgn * L * Math.cos(th), cy + sgn * L * Math.sin(th)];
      const [lx, ly] = end(-1), [rx, ry] = end(1);
      // 底座和立柱
      let s = F.rect(150, 270, 260, 16, 'soft', 4) + F.rect(cx - 8, cy, 16, 120, 'soft');
      // 分度盘（立柱上方）和指针（随横梁转动）
      s += F.path(`M${cx - 30},${cy - 72} A80,80 0 0 1 ${cx + 30},${cy - 72}`, 'ink');
      for (let i = -3; i <= 3; i++) {
        const a = -Math.PI / 2 + i * 0.12;
        s += F.line(cx + 80 * Math.cos(a), cy + 80 * Math.sin(a), cx + (i ? 72 : 66) * Math.cos(a), cy + (i ? 72 : 66) * Math.sin(a), 'thin');
      }
      const pa = -Math.PI / 2 + th;
      s += F.line(cx, cy, cx + 78 * Math.cos(pa), cy + 78 * Math.sin(pa), 'force');
      // 横梁
      s += `<line class="ink" style="stroke-width:5" x1="${lx.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${rx.toFixed(1)}" y2="${ry.toFixed(1)}"/>` + F.dot(cx, cy, 5);
      // 吊盘
      const pan = (x, y) => F.line(x, y, x - 40, y + 70, 'thin') + F.line(x, y, x + 40, y + 70, 'thin') + F.path(`M${x - 50},${y + 70} Q${x},${y + 86} ${x + 50},${y + 70} Z`, 'soft');
      s += pan(lx, ly) + pan(rx, ry);
      // 左盘物体
      const side = 18 + Math.cbrt(obj.m) * 3.2;
      s += F.polygon([[lx - side / 2 - 4, ly + 72], [lx - side / 2 + 2, ly + 72 - side], [lx + side / 2 - 2, ly + 72 - side * 0.9], [lx + side / 2 + 4, ly + 72]], 'soft') +
        F.text(lx, ly + 72 - side / 2, obj.n, { size: 11 });
      // 右盘砝码
      const sel = W.map((w, i) => on[i] ? w : 0).filter(w => w);
      let bx = rx - (sel.length * 17) / 2;
      sel.forEach(w => {
        const h = 10 + Math.cbrt(w) * 4;
        s += F.rect(bx, ry + 72 - h, 15, h, 'hi', 2) + F.text(bx + 7.5, ry + 72 - h - 7, w, { size: 9 });
        bx += 17;
      });
      // 标尺和游码
      const sx0 = 175, sk = 42;
      s += F.rect(sx0 - 10, 300, 5 * sk + 20, 18, 'soft', 3);
      for (let i = 0; i <= 25; i++) s += F.line(sx0 + i * sk / 5, 300, sx0 + i * sk / 5, 300 + (i % 5 ? 5 : 9), 'thin');
      for (let g = 0; g <= 5; g++) s += F.text(sx0 + g * sk, 328, g, { size: 11 });
      s += F.text(sx0 + 5 * sk + 22, 328, 'g', { size: 11 }) + F.rect(sx0 + r * sk, 297, 7, 24, 'hi', 2) + F.text(sx0 - 18, 309, '标尺', { a: 'end', size: 12 });
      fig.innerHTML = F.svg(560, 340, s);

      const f1 = x => SIMS.fmt(x, 1);
      let msg = `右盘砝码 ${wsum} g + 游码 ${f1(r)} g = ${f1(wsum + r)} g　`;
      if (bal) msg += `<br><b>横梁平衡！</b>物体质量 = 砝码总质量 + 游码示数 = ${wsum} g + ${f1(r)} g = <b>${f1(obj.m)} g</b>`;
      else if (diff > 0) msg += `<br>指针<b>偏左</b>：左盘（物体）偏重 → ${diff >= 5 ? '按“先大后小”继续加砝码' : '差不到 5 g，向右移动游码'}`;
      else msg += `<br>指针<b>偏右</b>：右盘砝码偏重 → ${wsum > obj.m ? '砝码加多了，取下最后加的砝码，换小一点的' : '把游码向左移一点'}`;
      out.innerHTML = msg;
    }
    syncBtns();
    draw();
  };

  /* ---------- 水的反常膨胀：调温度，看 1000 g 水的体积和密度 ---------- */
  SIMS.p2_1_water4c = function (box) {
    const ui = SIMS.ui(box, '水在 4 ℃ 时密度最大');
    const fig = ui.fig();
    const T = ui.slider({ label: '水温 t', min: 0, max: 10, step: 0.5, value: 8, unit: '℃' }, draw);
    const out = ui.out();
    ui.note('右边是装着 1000 g 水的细颈瓶，瓶颈很细，能把体积的微小变化“放大”成液面的升降。把温度从 10 ℃ 慢慢降到 0 ℃：先是液面下降（体积变小、密度变大），过了 4 ℃ 液面反而上升——这就是水的反常膨胀。');

    const RW = [0.999840, 0.999899, 0.999940, 0.999964, 0.999972, 0.999964, 0.999940, 0.999901, 0.999848, 0.999781, 0.999700];
    function rhoW(t) {
      const i = Math.max(0, Math.min(9, Math.floor(t))), f = t - i;
      const p = j => RW[Math.max(0, Math.min(10, j))];
      const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
      return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
    }

    function draw() {
      const t = T.get(), r = rhoW(t), V = 1000 / r;
      // 左：ρ-t 图像
      const x0 = 80, y0 = 40, w = 280, h = 180, lo = 0.99965, hi = 1.0;
      const px = tt => x0 + tt / 10 * w, py = rr => y0 + h - (rr - lo) / (hi - lo) * h;
      let s = F.arrow(x0, y0 + h, x0 + w + 16, y0 + h, { size: 7 }) + F.arrow(x0, y0 + h, x0, y0 - 14, { size: 7 });
      for (let k = 0; k <= 10; k += 2) s += F.line(px(k), y0 + h, px(k), y0 + h + 4, 'thin') + F.text(px(k), y0 + h + 14, k, { size: 11 });
      [0.9997, 0.9998, 0.9999, 1.0].forEach(v => { s += F.line(x0 - 4, py(v), x0, py(v), 'thin') + F.text(x0 - 7, py(v), v.toFixed(4), { a: 'end', size: 10 }); });
      s += F.text(x0 + w + 14, y0 + h - 12, 't/℃', { cls: 'it', size: 13, a: 'end' }) + F.text(x0 + 4, y0 - 20, 'ρ/(g·cm⁻³)', { cls: 'it', size: 13, a: 'start' });
      const pts = [];
      for (let i = 0; i <= 100; i++) pts.push([px(i / 10), py(rhoW(i / 10))]);
      s += F.poly(pts, 'hi') + F.line(px(t), py(r), px(t), y0 + h, 'thin dash') +
        `<circle class="hi-fill" cx="${px(t).toFixed(1)}" cy="${py(r).toFixed(1)}" r="5"/>`;
      // 右：细颈瓶。液面高度 = 瓶颈底部以上 (V − 1000) × 450 像素/cm³
      const bx = 470, neckB = 200, k = 450, lv = neckB - (V - 1000) * k;
      s += F.path(`M${bx - 50},${neckB + 10} Q${bx - 55},${neckB + 70} ${bx},${neckB + 75} Q${bx + 55},${neckB + 70} ${bx + 50},${neckB + 10} Z`, 'water') +
        F.rect(bx - 6, lv, 12, neckB + 12 - lv, 'water') + F.line(bx - 6, lv, bx + 6, lv, 'water-line') +
        F.path(`M${bx - 6},40 L${bx - 6},${neckB} Q${bx - 50},${neckB + 4} ${bx - 50},${neckB + 30} Q${bx - 55},${neckB + 70} ${bx},${neckB + 75} Q${bx + 55},${neckB + 70} ${bx + 50},${neckB + 30} Q${bx + 50},${neckB + 4} ${bx + 6},${neckB} L${bx + 6},40`, 'ink');
      // 标出 4 ℃ 时（最低）液面
      const l4 = neckB - (1000 / rhoW(4) - 1000) * k;
      s += F.line(bx + 8, l4, bx + 28, l4, 'thin dash') + F.text(bx + 32, l4, '4 ℃', { a: 'start', size: 11 }) +
        F.text(bx, neckB + 50, '1000 g 水', { size: 12 });
      fig.innerHTML = F.svg(560, 290, s);

      let st;
      if (Math.abs(t - 4) < 1e-9) st = '4 ℃：密度最大，体积最小。';
      else if (t < 4) st = '0~4 ℃：温度升高，体积变小、密度变大——<b>热缩冷胀</b>（反常膨胀）。';
      else st = '高于 4 ℃：温度升高，体积变大、密度变小——和一般物质一样<b>热胀冷缩</b>。';
      out.innerHTML = `t = <b>${SIMS.fmt(t, 1)} ℃</b>　ρ = <b>${r.toFixed(5)} g/cm³</b>　1000 g 水的体积 V = m/ρ = <b>${V.toFixed(2)} cm³</b><br>${st}`;
    }
    draw();
  };
})();
