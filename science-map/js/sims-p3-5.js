// 第三阶段 物理组 5 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   SIMS.p3_5_voltmeter  电压表的读数（两个量程、接反、超量程）
//   SIMS.p3_5_rheostat   滑动变阻器的接法（一上一下）与滑片移动
//   SIMS.p3_5_fault      串联电路故障：用电压表、导线查故障（可随机出题）
// 另外导出 SIMS._p3_5 = { dial, kit }：电压表表盘、滑动变阻器实物图。physics/p3-5.js 的静态图也用它们，保证图和演示一致。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;
  const r1 = x => Math.round(x * 10) / 10;

  /* ================= 电压表表盘 ================= */
  // frac：指针位置（0 = 零刻度，1 = 满偏；负数表示反向偏转，超过 1 表示超量程）
  // o.term：'3' | '15' 把所接的接线柱涂实；不给就都画空心。画在 240×205 的区域，左上角 (o.x, o.y)
  function dialInner(frac, o) {
    o = o || {};
    const ox = o.x || 0, oy = o.y || 0;
    const cx = ox + 120, cy = oy + 150, R = 100;
    const pt = (f, r) => {
      const a = (-50 + 100 * f) * Math.PI / 180;
      return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
    };
    let s = F.rect(ox + 8, oy + 8, 224, 160, 'thin', 10);
    const a0 = pt(0, R), a1 = pt(1, R);
    s += `<path class="thin" d="M${r1(a0[0])},${r1(a0[1])} A${R},${R} 0 0 1 ${r1(a1[0])},${r1(a1[1])}"/>`;
    for (let i = 0; i <= 30; i++) {
      const f = i / 30, L = i % 10 === 0 ? 13 : i % 5 === 0 ? 9 : 5;
      const p = pt(f, R), q = pt(f, R - L);
      s += F.line(p[0], p[1], q[0], q[1], i % 10 === 0 ? 'ink' : 'thin');
    }
    [0, 1, 2, 3].forEach((n, k) => { const p = pt(k / 3, R + 12); s += F.text(p[0], p[1], n, { size: 12 }); });
    [0, 5, 10, 15].forEach((n, k) => { const p = pt(k / 3, R - 25); s += F.text(p[0], p[1], n, { size: 11 }); });
    s += `<text x="${cx}" y="${cy - 38}" text-anchor="middle" dominant-baseline="middle" style="font-size:20px;font-weight:700">V</text>`;
    const fp = Math.max(-0.14, Math.min(1.1, frac));
    const tip = pt(fp, R + 4);
    s += F.line(cx, cy, tip[0], tip[1], 'force') + F.circle(cx, cy, 5, 'soft');
    // 接线柱：“−”“3”“15”
    const ty = oy + 188;
    [['−', 60, true], ['3', 120, o.term === '3'], ['15', 180, o.term === '15']].forEach(([lab, x, on]) => {
      const tx = ox + x;
      s += F.circle(tx, ty, 7, 'soft') + (on && o.term ? F.circle(tx, ty, 3.5, 'hi-fill') : '') +
        F.text(tx + 12, ty, lab, { a: 'start', size: 14 });
    });
    return s;
  }
  // reading：读数（伏）；range：3 或 15（所接量程）。o.frac 直接给指针位置；o.noTerm 不标所接接线柱；o.cap 图注
  function dial(reading, range, o) {
    o = o || {};
    const frac = o.frac != null ? o.frac : reading / range;
    return F.svg(240, 205, dialInner(frac, { term: o.noTerm ? null : String(range) }), o.cap);
  }

  /* ================= 滑动变阻器实物图 ================= */
  // p：滑片位置（0 = 最左，1 = 最右）。o.conn：所接的两个接线柱，如 'AD'；接入电路的那段电阻丝涂橙色
  // A、B 在线圈两端（下接线柱），C、D 在金属杆两端（上接线柱）。o.dir = -1 / 1 画滑片移动方向；o.names 标出各部分名称
  // 画在 280×125 区域，左上角 (o.x, o.y)
  function kitInner(p, o) {
    o = o || {};
    const ox = o.x || 0, oy = o.y || 0, conn = o.conn || '';
    const X0 = ox + 40, X1 = ox + 240, Y = oy + 62, H = 28;
    const sx = X0 + 8 + p * (X1 - X0 - 16);
    const hasA = conn.includes('A'), hasB = conn.includes('B');
    let s = F.rect(X0, Y, X1 - X0, H, 'soft', 6);
    // 接入电路的那段电阻丝
    let seg = null;
    if (hasA && hasB) seg = [X0, X1];
    else if (hasA) seg = [X0, sx];
    else if (hasB) seg = [sx, X1];
    if (seg && seg[1] - seg[0] > 0.5) s += `<rect x="${r1(seg[0])}" y="${Y}" width="${r1(seg[1] - seg[0])}" height="${H}" rx="4" style="fill:var(--fig-ray);opacity:.45"/>`;
    for (let x = X0 + 6; x < X1 - 3; x += 5) s += F.line(x, Y + 1, x - 2, Y + H - 1, 'thin');
    // 金属杆和支架
    const barOn = conn.includes('C') && conn.includes('D');
    s += F.line(ox + 28, oy + 34, ox + 28, Y + 10, 'thin') + F.line(ox + 252, oy + 34, ox + 252, Y + 10, 'thin') +
      F.line(ox + 28, Y + 10, X0, Y + 10, 'thin') + F.line(ox + 252, Y + 10, X1, Y + 10, 'thin');
    s += `<line class="${barOn ? 'ray' : 'ink'}" style="stroke-width:4" x1="${ox + 22}" y1="${oy + 34}" x2="${ox + 258}" y2="${oy + 34}"/>`;
    // 下接线柱 A、B 用短导线接到线圈两端
    const T = { C: [ox + 16, oy + 34], D: [ox + 264, oy + 34], A: [X0 - 12, Y + H + 12], B: [X1 + 12, Y + H + 12] };
    s += F.line(X0 + 2, Y + H - 4, T.A[0], T.A[1]) + F.line(X1 - 2, Y + H - 4, T.B[0], T.B[1]);
    // 滑片
    s += F.rect(sx - 10, oy + 26, 20, 16, 'soft', 2) + `<line class="ink" style="stroke-width:3" x1="${r1(sx)}" y1="${oy + 42}" x2="${r1(sx)}" y2="${Y}"/>` +
      F.text(sx, oy + 16, 'P', { cls: 'it', size: 15 });
    if (o.dir) s += F.arrow(sx + o.dir * 12, oy + 4, sx + o.dir * 46, oy + 4, { cls: 'hi', size: 8 });
    // 接线柱
    Object.keys(T).forEach(k => {
      const [x, y] = T[k], on = conn.includes(k);
      s += F.circle(x, y, 6, 'soft') + (on ? F.circle(x, y, 3.5, 'hi-fill') : '');
      const lx = k === 'A' || k === 'C' ? x - 12 : x + 12;
      s += F.text(lx, y + (k === 'A' || k === 'B' ? 4 : 0), k, { size: 14, a: k === 'A' || k === 'C' ? 'end' : 'start' });
    });
    if (o.names) {
      s += F.text(ox + 92, oy + 24, '金属杆', { size: 12 }) + F.text(ox + 140, Y + H + 16, '线圈（缠在瓷筒上的电阻丝）', { size: 12 }) +
        F.text(sx + 14, oy + 16, '滑片', { size: 12, a: 'start' });
    }
    return s;
  }
  function kit(p, o) {
    o = o || {};
    return F.svg(300, 128, kitInner(p, Object.assign({}, o, { x: 10, y: 3 })), o.cap);
  }

  SIMS._p3_5 = { dial, dialInner, kit, kitInner };

  // 发光的灯：亮度 0~1
  function glowLamp(x, y, b, o) {
    let s = F.comp('lamp', x, y, o);
    if (b > 0) {
      const op = Math.min(1, 0.12 + 0.88 * b);
      s += `<circle cx="${x}" cy="${y}" r="9" style="fill:var(--fig-ray);opacity:${op.toFixed(2)}"/>` +
        `<circle cx="${x}" cy="${y}" r="17" style="fill:none;stroke:var(--fig-ray);stroke-width:4;opacity:${(op * 0.5).toFixed(2)}"/>`;
    }
    return s + F.line(x - 7, y - 7, x + 7, y + 7) + F.line(x - 7, y + 7, x + 7, y - 7);
  }

  /* ---------- 电压表的读数 ---------- */
  SIMS.p3_5_voltmeter = function (box) {
    const ui = SIMS.ui(box, '电压表怎样读数');
    const fig = ui.fig();
    const rng = ui.buttons(['接“−”和“3”（0～3 V）', '接“−”和“15”（0～15 V）'], draw, 0);
    const pol = ui.buttons(['正确接法', '正、负接线柱接反'], draw, 0);
    const U = ui.slider({ label: '被测电压', min: 0, max: 15, step: 0.1, value: 2.4, unit: 'V' }, draw);
    const out = ui.out();
    ui.note('读数三步：①看接的是哪个量程；②认清分度值（0～3 V 每小格 0.1 V，0～15 V 每小格 0.5 V）；③数指针偏过了多少小格。表盘共 30 小格，所以同一个指针位置，按 0～15 V 读出的数是按 0～3 V 读的 5 倍。');

    function draw() {
      const big = rng.get() === 1, range = big ? 15 : 3, div = big ? 0.5 : 0.1;
      const u = U.get(), rev = pol.get() === 1;
      const frac = rev ? -0.12 : u / range;
      fig.innerHTML = F.svg(240, 205, dialInner(frac, { term: String(range) }));
      const f = x => SIMS.fmt(x, 2);
      let html;
      if (rev) {
        html = '<b>指针向左偏（反偏）</b>：电流从“−”接线柱流进了电压表，正、负接线柱接反了。要断开开关，把两根导线对调。';
      } else if (u > range) {
        html = `<b>指针偏过了最大刻度！</b>被测电压 ${f(u)} V 超过了量程 ${range} V，可能损坏电压表。应断开开关，改用 0～15 V 量程${u > 15 ? '（若超过 15 V，就要换量程更大的电压表）' : ''}。`;
      } else {
        const n = u / div, nr = Math.round(n);
        const cells = Math.abs(n - nr) < 1e-6 ? `${nr} 小格` : `第 ${Math.floor(n)} 和第 ${Math.ceil(n)} 小格之间`;
        html = `量程 0～${range} V，分度值 <b>${div} V</b>；指针偏过 ${cells}，读数 ≈ <b>${f(u)} V</b>。<br>` +
          `同一个指针位置，按${big ? ' 0～3 V' : ' 0～15 V'} 量程读是 ${f(big ? u / 5 : u * 5)} V（相差 5 倍）。`;
        if (big && u <= 3 && u > 0) html += '<br><span class="muted">被测电压不超过 3 V，指针偏转太小、读数不精确，应改用 0～3 V 量程。</span>';
      }
      out.innerHTML = html;
    }
    draw();
  };

  /* ---------- 滑动变阻器：一上一下 ---------- */
  SIMS.p3_5_rheostat = function (box) {
    const ui = SIMS.ui(box, '滑动变阻器怎样接、滑片怎样移');
    const fig = ui.fig();
    const PAIRS = ['AC', 'AD', 'BC', 'BD', 'AB', 'CD'];
    const pick = ui.buttons(['接 A、C', '接 A、D', '接 B、C', '接 B、D', '接 A、B（两下）', '接 C、D（两上）'], draw, 1);
    const P = ui.slider({ label: '滑片位置', min: 0, max: 100, step: 5, value: 40, fmt: x => (x === 0 ? '最左端' : x === 100 ? '最右端' : '离左端 ' + x + '%') }, draw);
    const out = ui.out();
    ui.note('变阻器最大阻值 20 Ω，灯泡电阻 10 Ω（视为不变），电源电压 3 V。橙色部分是电流实际流过的电阻丝。规律：上面接 C 还是 D 都一样，关键看<b>下面接的是哪一个</b>——滑片离所接的下接线柱越远，接入的电阻丝越长，电阻越大。');

    let lastR = null, lastP = null, lastPair = null;
    function draw() {
      const pair = PAIRS[pick.get()], p = P.get() / 100;
      const hasA = pair.includes('A'), hasB = pair.includes('B');
      const Rx = hasA && hasB ? 20 : hasA ? 20 * p : hasB ? 20 * (1 - p) : 0;
      const I = 3 / (10 + Rx), Pw = I * I * 10;
      // 上面是电路的其余部分（电池组、灯、电流表），两根引线接到所选的两个接线柱
      const kx = 50, ky = 108;   // 变阻器实物图的左上角
      const T = { C: [kx + 16, ky + 34], D: [kx + 264, ky + 34], A: [kx + 28, ky + 102], B: [kx + 252, ky + 102] };
      let s = F.wire([[30, 60], [30, 20], [350, 20], [350, 60]]) +
        F.comp('battery', 100, 20) + glowLamp(190, 20, Pw / 0.9) + F.comp('A', 270, 20);
      const t1 = pair[0], t2 = pair[1];
      const route = (lx, t, k) => {
        const [tx, ty] = T[t];
        if (t === 'A' || t === 'B') return F.wire([[lx, 60], [lx, 240 + k], [tx, 240 + k], [tx, ty + 6]]);
        return F.wire([[lx, 60], [lx, 86 - k], [tx, 86 - k], [tx, ty - 6]]);
      };
      s += route(30, t1, 0) + route(350, t2, 8);
      s += kitInner(p, { x: kx, y: ky, conn: pair });
      s += F.text(270, 46, SIMS.fmt(I, 3) + ' A', { size: 13 });
      fig.innerHTML = F.svg(380, 258, s);

      let what;
      if (pair === 'CD') what = '<b>两个上接线柱</b>：电流只经过金属杆，接入电阻为 0，相当于一根导线。移动滑片灯的亮度不变（很亮），起不到变阻作用。';
      else if (pair === 'AB') what = '<b>两个下接线柱</b>：整根电阻丝都接入，相当于一个 20 Ω 的定值电阻。移动滑片灯的亮度不变（较暗），起不到变阻作用。';
      else {
        const part = hasA ? 'A 与滑片 P 之间（P 左边）' : '滑片 P 与 B 之间（P 右边）';
        what = `一上一下，接法正确。接入电路的是 <b>${part}</b> 的电阻丝，接入电阻 <b>${SIMS.fmt(Rx, 1)} Ω</b>。<br>` +
          `滑片向${hasA ? '右' : '左'}移 → 这段电阻丝变长 → 电阻变大 → 电流变小 → 灯变暗。`;
      }
      let trend = '';
      if (lastPair === pair && lastP != null && lastP !== p && pair !== 'AB' && pair !== 'CD') {
        trend = `<br>刚才滑片向${p > lastP ? '右' : '左'}移，接入电阻${Rx > lastR ? '变大' : '变小'}，电流表示数${Rx > lastR ? '变小' : '变大'}。`;
      }
      out.innerHTML = what + `<br>电路中的电流 ${SIMS.fmt(I, 3)} A。` + trend;
      lastR = Rx; lastP = p; lastPair = pair;
    }
    draw();
  };

  /* ---------- 串联电路故障 ---------- */
  SIMS.p3_5_fault = function (box) {
    const ui = SIMS.ui(box, '电路故障侦探：两灯串联');
    const fig = ui.fig();
    const FAULTS = ['正常', 'L₁ 断路', 'L₂ 断路', 'L₁ 短路', 'L₂ 短路'];
    let mystery = false, secret = 0, revealed = false;
    const fsel = ui.buttons(FAULTS.concat(['随机故障（猜一猜）']), i => {
      mystery = i === 5; revealed = false;
      if (mystery) secret = 1 + Math.floor(Math.random() * 4);
      draw();
    }, 0);
    const det = ui.buttons(['不接检测', '电压表并在 L₁ 两端', '电压表并在 L₂ 两端', '导线并在 L₁ 两端', '导线并在 L₂ 两端'], draw, 1);
    ui.action('揭晓答案', () => { revealed = true; draw(); });
    const out = ui.out();
    ui.note('电源电压 3 V，两灯电阻都是 5 Ω。先选一种故障，看两灯和两表怎样变化；再点“随机故障”，像做题一样用电压表、导线去查，最后点“揭晓答案”。');

    const U0 = 3, RL = 5;
    function draw() {
      const fault = mystery ? secret : fsel.get();
      const d = det.get();
      const open = [fault === 1, fault === 2], shorted = [fault === 3, fault === 4];
      const wire = [d === 3, d === 4];
      const lampR = i => (open[i] ? Infinity : shorted[i] ? 0 : RL);
      const eff = i => (wire[i] ? 0 : lampR(i));
      const Rt = eff(0) + eff(1);
      const srcShort = Rt === 0;
      const I = srcShort ? Infinity : Rt === Infinity ? 0 : U0 / Rt;
      const lampI = i => (wire[i] || shorted[i] || open[i] || !isFinite(I) ? 0 : I);
      let V = null;
      if (d === 1 || d === 2) {
        const i = d - 1, j = 1 - i;
        if (I > 0) V = I * eff(i);
        else V = open[i] && isFinite(eff(j)) ? U0 : 0;
      }

      // 电路：两灯在上，开关、电池组、电流表在下
      let s = F.wire([[60, 110], [60, 210], [340, 210], [340, 110], [60, 110]]);
      if (d) {
        const i = (d - 1) % 2, x1 = i ? 215 : 115, x2 = i ? 285 : 185, isV = d <= 2;
        s += (isV ? F.wire([[x1, 110], [x1, 62], [x2, 62], [x2, 110]]) : F.poly([[x1, 110], [x1, 62], [x2, 62], [x2, 110]], 'hi')) +
          F.node(x1, 110) + F.node(x2, 110);
        if (isV) s += F.comp('V', (x1 + x2) / 2, 62) + F.text((x1 + x2) / 2 + 18, 40, SIMS.fmt(V, 2) + ' V', { a: 'start', size: 13 });
        else s += F.text((x1 + x2) / 2, 50, '检测导线', { size: 12 });
      }
      [0, 1].forEach(i => {
        const x = i ? 250 : 150, li = lampI(i);
        s += glowLamp(x, 110, li > 0 ? li * li * RL / 1.8 : 0, { label: i ? 'L₂' : 'L₁', ly: -24 });
        if (!mystery || revealed) {
          if (open[i]) s += F.text(x, 150, '断路', { cls: 'red', size: 13 });
          if (shorted[i]) s += F.poly([[x - 26, 110], [x - 26, 136], [x + 26, 136], [x + 26, 110]], 'force') + F.text(x, 152, '短路', { cls: 'red', size: 13 });
        }
      });
      s += F.comp('switch', 110, 210, { on: true }) + F.comp('battery', 200, 210) + F.comp('A', 280, 210) +
        F.text(280, 238, srcShort ? '满偏！' : SIMS.fmt(I, 2) + ' A', { size: 13 });
      fig.innerHTML = F.svg(400, 250, s);

      const lit = i => (lampI(i) > 0 ? '亮' : '不亮');
      let html = `L₁ ${lit(0)}，L₂ ${lit(1)}；电流表 ${srcShort ? '<b>指针打满偏</b>' : '<b>' + SIMS.fmt(I, 2) + ' A</b>'}` +
        (V != null ? `；电压表 <b>${SIMS.fmt(V, 2)} V</b>` : '') + '。';
      if (srcShort) html += '<br><span class="warn">电源被短路了！导线把电源两极直接连通，电流很大，会烧坏电源和电流表。查故障时检测导线不能把电源短路。</span>';
      if (mystery && !revealed) html += '<br>（故障藏起来了：换几种检测方法，推断是哪一处故障，再点“揭晓答案”。）';
      if (mystery && revealed) html += `<br>答案：<b>${FAULTS[secret]}</b>。`;
      if (!mystery || revealed) {
        const tips = {
          1: 'L₁ 断路：电路不通，两灯都不亮、电流表无示数；电压表并在 L₁ 两端时被串联进电路，示数接近电源电压；导线并在 L₁ 两端，L₂ 就亮了。',
          2: 'L₂ 断路：两灯都不亮、电流表无示数；电压表并在 L₂ 两端，示数接近电源电压，并在 L₁ 两端示数为 0。',
          3: 'L₁ 短路：L₁ 不亮、L₂ 更亮，电流表示数变大；并在 L₁ 两端的电压表示数为 0，并在 L₂ 两端的示数等于电源电压。',
          4: 'L₂ 短路：L₂ 不亮、L₁ 更亮，电流表示数变大；并在 L₂ 两端的电压表示数为 0，并在 L₁ 两端的示数等于电源电压。'
        };
        if (tips[fault]) html += '<br>' + tips[fault];
      }
      out.innerHTML = html;
    }
    draw();
  };
})();
