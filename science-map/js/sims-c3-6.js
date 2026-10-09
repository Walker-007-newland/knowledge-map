// 第三阶段 化学组 6 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   c3_6_curve  溶解度曲线：拖温度看溶解度，往 100 g 水里加溶质判断是否饱和，降温/升温看析出晶体
//   c3_6_mix    溶质质量分数：100 g 10% 氯化钠溶液加水、蒸发水、加溶质、混合，看质量分数怎么变
//   c3_6_heat   物质溶解时的吸热和放热：U 形管液面变化
// 另外导出 SIMS._c3_6 = { S, DATA, curveFig, utube }：chemistry/c3-6.js 里的静态溶解度曲线、U 形管装置图也用它们画，保证图和演示一致。
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  /* ---------- 溶解度数据（g / 100 g 水），接近课本附录数据 ---------- */
  const DATA = {
    KNO3: { zh: '硝酸钾', f: 'KNO₃', color: 'hi', pts: [[0, 13.3], [10, 20.9], [20, 31.6], [30, 45.8], [40, 63.9], [50, 85.5], [60, 110], [70, 138], [80, 169], [90, 202], [100, 246]] },
    NaCl: { zh: '氯化钠', f: 'NaCl', color: 'ray', pts: [[0, 35.7], [10, 35.8], [20, 36.0], [30, 36.3], [40, 36.6], [50, 37.0], [60, 37.3], [70, 37.8], [80, 38.4], [90, 39.0], [100, 39.8]] },
    CaOH2: { zh: '氢氧化钙', f: 'Ca(OH)₂', color: 'force', pts: [[0, 0.18], [10, 0.17], [20, 0.16], [30, 0.15], [40, 0.14], [50, 0.13], [60, 0.12], [70, 0.106], [80, 0.094], [90, 0.085], [100, 0.077]] },
    // 仿中考的“甲乙丙”曲线：t₁（20）时三者溶解度都是 25 g；t₂（40）时 甲 50 g、乙 30 g、丙 15 g
    A: { zh: '甲', f: '甲', color: 'hi', pts: [[0, 8], [10, 14], [20, 25], [30, 36], [40, 50], [50, 66]] },
    B: { zh: '乙', f: '乙', color: 'ray', pts: [[0, 21], [10, 23], [20, 25], [30, 27.5], [40, 30], [50, 32]] },
    C: { zh: '丙', f: '丙', color: 'force', pts: [[0, 35], [10, 30], [20, 25], [30, 20], [40, 15], [50, 12]] }
  };

  // 单调三次插值（Fritsch–Carlson）：曲线经过所有数据点，且相邻两点之间不会“鼓包”
  function mono(pts) {
    const n = pts.length, x = pts.map(p => p[0]), y = pts.map(p => p[1]), d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((y[i + 1] - y[i]) / (x[i + 1] - x[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    return function (v) {
      if (v <= x[0]) return y[0];
      if (v >= x[n - 1]) return y[n - 1];
      let i = 0;
      while (v > x[i + 1]) i++;
      const h = x[i + 1] - x[i], t = (v - x[i]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * y[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * y[i + 1] + (t3 - t2) * h * m[i + 1];
    };
  }
  const FN = {};
  Object.keys(DATA).forEach(k => { FN[k] = mono(DATA[k].pts); });
  const S = (k, t) => FN[k](t);

  const COLOR = { hi: 'var(--fig-hi)', ray: 'var(--fig-ray)', force: 'var(--fig-force)' };
  const txt = (x, y, s, o) => {
    o = o || {};
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${o.a || 'middle'}" dominant-baseline="middle" style="font-size:${o.size || 13}px${o.color ? ';fill:' + COLOR[o.color] : ''}${o.bold ? ';font-weight:700' : ''}">${s}</text>`;
  };
  const fmtV = v => String(+v.toFixed(v < 1 ? 3 : 1));

  // 溶解度曲线图。o:
  //   subs   ['KNO3','NaCl']        画哪些物质
  //   xmax ymax xticks yticks       坐标范围与刻度（数字刻度）
  //   tlab   {20:'t₁'}               用文字代替某些温度刻度（仿中考的 t₁、t₂），此时这些温度不再标数字
  //   ylab   {25:'25'}               只在 y 轴上标这些值（不写 yticks 时用）
  //   marks  [['KNO3', 60]]          从曲线上该温度的点向两轴画虚线，并在 y 轴标出溶解度数值
  //   pts    [[t, s, 'P']]           标一个点（如交点 P、状态点 A）
  //   names  'f' | 'zh' | 'both'     曲线末端标化学式 / 中文名 / 两者
  //   hl     'KNO3'                  只突出这一条，其余画细虚线
  //   w h    画布内坐标区大小；caption 图注
  function curveFig(o) {
    const W = o.w || 300, H = o.h || 190;
    const ax = { x: 56, y: 40, w: W, h: H, xmax: o.xmax || 80, ymax: o.ymax || 180, xticks: [], yticks: [] };
    let s = SIMS.axes(ax);
    const tl = o.tlab || {};
    (o.xticks || []).forEach(t => { if (!tl[t]) s += F.line(ax.px(t), ax.y + ax.h, ax.px(t), ax.y + ax.h + 4, 'thin') + F.text(ax.px(t), ax.y + ax.h + 14, t, { size: 11 }); });
    Object.keys(tl).forEach(t => { s += F.line(ax.px(+t), ax.y + ax.h, ax.px(+t), ax.y + ax.h + 4, 'thin') + F.text(ax.px(+t), ax.y + ax.h + 15, tl[t], { cls: 'it', size: 14 }); });
    (o.yticks || []).forEach(v => { s += F.line(ax.x - 4, ax.py(v), ax.x, ax.py(v), 'thin') + F.text(ax.x - 7, ax.py(v), fmtV(v), { size: 11, a: 'end' }); });
    s += txt(ax.x + 2, ax.y - 22, '溶解度/g', { a: 'start' });
    s += txt(ax.x + ax.w + 16, ax.y + ax.h + 30, '温度/℃', { a: 'end' });
    // 辅助虚线（先画，压在曲线下面）
    (o.marks || []).forEach(([k, t]) => {
      const v = S(k, t), X = ax.px(t), Y = ax.py(v);
      s += F.line(X, ax.y + ax.h, X, Y, 'thin dash') + F.line(ax.x, Y, X, Y, 'thin dash');
      s += F.text(ax.x - 7, Y, fmtV(v), { size: 11, a: 'end' });
    });
    Object.keys(o.ylab || {}).forEach(v => { s += F.line(ax.x - 4, ax.py(+v), ax.x, ax.py(+v), 'thin') + F.text(ax.x - 7, ax.py(+v), o.ylab[v], { size: 11, a: 'end' }); });
    (o.vl || []).forEach(t => { s += F.line(ax.px(t), ax.y + ax.h, ax.px(t), ax.y + 4, 'thin dash'); });
    // 曲线
    const names = o.names || 'f';
    (o.subs || ['KNO3', 'NaCl']).forEach(k => {
      const d = DATA[k], pts = [];
      let tEnd = ax.xmax;
      for (let t = 0; t <= ax.xmax + 1e-9; t += ax.xmax / 160) {
        const v = S(k, t);
        if (v > ax.ymax) { tEnd = t; break; }
        pts.push([ax.px(t), ax.py(v)]);
      }
      const cls = o.hl && o.hl !== k ? 'thin dash' : d.color;
      s += F.poly(pts, cls);
      const lab = names === 'zh' ? d.zh : names === 'both' ? d.zh + ' ' + d.f : d.f;
      const last = pts[pts.length - 1];
      if (tEnd < ax.xmax) s += txt(last[0], last[1] - 10, lab, { color: d.color, a: 'end' });
      else s += txt(last[0] + 5, last[1] + (o.lift && o.lift[k] || 0), lab, { color: d.color, a: 'start' });
    });
    (o.pts || []).forEach(([t, v, lab, dx, dy]) => {
      s += F.dot(ax.px(t), ax.py(v), 3.5);
      if (lab) s += F.text(ax.px(t) + (dx == null ? 9 : dx), ax.py(v) + (dy == null ? -10 : dy), lab, { cls: 'it', size: 15 });
    });
    return F.svg(ax.x + ax.w + 90, ax.y + ax.h + 44, s, o.caption);
  }

  // U 形管装置：广口瓶中插一支盛水的试管，瓶内空气与 U 形管左管相连，右管开口。d>0 左低右高，d<0 左高右低
  function utube(d, o) {
    o = o || {};
    let s = '';
    s += F.jar(100, 60, 120, 150);
    s += F.rect(56, 48, 88, 16, 'soft', 2);
    s += F.testTube(84, 28, 132, 90, 0.42);
    if (o.solid) [[78, 150], [84, 153], [90, 150], [81, 146], [87, 146]].forEach(([x, y]) => { s += F.dot(x, y, 2); });
    s += F.poly([[120, 48], [120, 22], [220, 22], [220, 80]], 'ink');
    // U 形管：管壁
    s += F.path('M214,80 L214,186 A26,26 0 0 0 266,186 L266,70', 'ink') + F.path('M226,80 L226,186 A14,14 0 0 0 254,186 L254,70', 'ink');
    s += F.line(214, 80, 226, 80, 'thin');
    // 红墨水
    const yL = 140 + d, yR = 140 - d;
    s += `<path d="M220,${yL} L220,186 A20,20 0 0 0 260,186 L260,${yR}" style="fill:none;stroke:var(--fig-force);stroke-opacity:.5;stroke-width:11"/>`;
    s += F.text(84, 232, o.tubeLabel || '试管中盛有水', { size: 12 });
    s += F.text(240, 230, '红墨水', { size: 12 });
    if (o.labels !== false) s += F.text(206, 140, '左', { size: 12, a: 'end' }) + F.text(274, 140, '右', { size: 12, a: 'start' });
    return F.svg(300, 250, s, o.caption);
  }

  SIMS._c3_6 = { S, DATA, curveFig, utube };

  /* ================= 溶解度曲线互动 ================= */
  SIMS.c3_6_curve = function (box) {
    const ui = SIMS.ui(box, '溶解度曲线：往 100 g 水里加溶质');
    const KEYS = ['KNO3', 'NaCl', 'CaOH2'];
    let k = 0, ref = null;
    const scaleM = () => (KEYS[k] === 'CaOH2' ? 1 / 600 : 1);         // 氢氧化钙溶解度很小，滑块按比例缩小
    ui.buttons(['硝酸钾 KNO₃', '氯化钠 NaCl', '氢氧化钙 Ca(OH)₂'], i => { k = i; ref = null; M.set(M.get()); draw(); }, 0);
    const fig = ui.fig();
    const T = ui.slider({ label: '温度', min: 0, max: 80, step: 1, value: 40, unit: '℃' }, draw);
    const M = ui.slider({ label: '加入溶质', min: 0, max: 150, step: 0.1, value: 50, fmt: v => fmtV(v * scaleM()) + ' g' }, draw);
    ui.action('配成 60 ℃ 的饱和溶液', () => {
      const key = KEYS[k];
      T.set(60); M.set(+(S(key, 60) / scaleM()).toFixed(1));
      ref = { t: 60, m: S(key, 60) };
      draw();
    });
    ui.action('记下当前状态', () => { ref = { t: T.get(), m: M.get() * scaleM() }; draw(); });
    const out = ui.out();
    ui.note('图中的点 (温度, 加入溶质的质量) 落在曲线<b>下方</b>：不饱和；落在曲线<b>上</b>：恰好饱和；落在曲线<b>上方</b>：饱和，多出来的溶质溶不了（如果是热的饱和溶液降温得到的，这部分就是<b>析出的晶体</b>）。先点“配成 60 ℃ 的饱和溶液”，再把温度往下拖，比较硝酸钾和氯化钠析出晶体的多少；再试试氢氧化钙——它要<b>升温</b>才会析出。');

    function draw() {
      const key = KEYS[k], d = DATA[key], t = T.get(), m = M.get() * scaleM();
      const sol = S(key, t), eps = key === 'CaOH2' ? 0.0004 : 0.05;
      const dis = Math.min(m, sol), extra = m - dis;
      const st = Math.abs(m - sol) <= eps ? 'eq' : m < sol ? 'un' : 'over';
      let s = '';
      // 左：烧杯
      const bx = 30, by = 70, bw = 120, bh = 130;
      s += F.rect(bx, by + bh * 0.35, bw, bh * 0.65, 'water') + F.line(bx, by + bh * 0.35, bx + bw, by + bh * 0.35, 'water-line');
      if (extra > eps) {
        const frac = Math.min(1, extra / (key === 'CaOH2' ? 0.15 : 80));
        const hh = 6 + 30 * frac;
        s += `<path class="soft" d="M${bx + 8},${by + bh} Q${bx + bw / 2},${(by + bh - hh * 2).toFixed(1)} ${bx + bw - 8},${by + bh} Z"/>`;
      }
      s += F.beaker(bx, by, bw, bh, 0);
      s += F.text(bx + bw / 2, by + bh * 0.55, '100 g 水', { size: 13 });
      s += F.text(bx + bw / 2, by + bh + 20, '温度 ' + t + ' ℃', { size: 13 });
      s += F.text(bx + bw / 2, by - 30, st === 'un' ? '不饱和溶液' : st === 'eq' ? '恰好饱和' : '饱和溶液 + 未溶固体', { size: 14 });
      // 右：曲线
      const caoh = key === 'CaOH2';
      const ax = { x: 250, y: 40, w: 260, h: 190, xmax: 80, ymax: caoh ? 0.25 : 180, xticks: [20, 40, 60, 80], yticks: [] };
      s += SIMS.axes(ax);
      (caoh ? [0.05, 0.10, 0.15, 0.20, 0.25] : [30, 60, 90, 120, 150, 180]).forEach(v => { s += F.line(ax.x - 4, ax.py(v), ax.x, ax.py(v), 'thin') + F.text(ax.x - 7, ax.py(v), fmtV(v), { size: 11, a: 'end' }); });
      s += txt(ax.x + 2, ax.y - 22, '溶解度/g', { a: 'start' }) + txt(ax.x + ax.w + 16, ax.y + ax.h + 30, '温度/℃', { a: 'end' });
      (caoh ? ['CaOH2'] : ['KNO3', 'NaCl']).forEach(kk => {
        const pts = [];
        for (let x = 0; x <= 80.001; x += 0.5) pts.push([ax.px(x), ax.py(S(kk, x))]);
        s += F.poly(pts, kk === key ? DATA[kk].color : 'thin dash');
        const last = pts[pts.length - 1];
        s += txt(last[0] + 5, last[1], DATA[kk].f, { color: DATA[kk].color, a: 'start' });
      });
      // 当前温度的溶解度
      const X = ax.px(t), Ys = ax.py(sol);
      s += F.line(X, ax.y + ax.h, X, ax.y, 'thin dash');
      s += F.line(ax.x, Ys, X, Ys, 'thin dash');
      s += `<circle cx="${X.toFixed(1)}" cy="${Ys.toFixed(1)}" r="4" style="fill:${COLOR[d.color]}"/>`;
      // 状态点
      const Ym = ax.py(Math.min(m, ax.ymax));
      s += `<circle cx="${X.toFixed(1)}" cy="${Ym.toFixed(1)}" r="6" class="hi" style="stroke-width:2.5;fill:var(--fig-bg)"/>`;
      s += F.text(X + 10, Ym - 10, '状态点', { size: 12, a: 'start' });
      if (ref) s += `<circle cx="${ax.px(ref.t).toFixed(1)}" cy="${ax.py(Math.min(ref.m, ax.ymax)).toFixed(1)}" r="4" class="thin"/>` + F.text(ax.px(ref.t) + 8, ax.py(Math.min(ref.m, ax.ymax)) + 12, '记下', { size: 11, a: 'start' });
      fig.innerHTML = F.svg(620, 290, s);

      const g = v => fmtV(v) + ' g';
      const w = dis / (100 + dis) * 100;
      let html = `${t} ℃ 时${d.zh}的溶解度 S = <b>${g(sol)}</b>（100 g 水最多溶解 ${g(sol)}）`;
      html += `<br>加入 ${g(m)}：`;
      if (st === 'un') html += `全部溶解，是<b>不饱和溶液</b>，还能再溶解约 ${g(sol - m)}。`;
      else if (st === 'eq') html += `全部溶解，<b>恰好饱和</b>。`;
      else html += `只能溶解 ${g(sol)}，<b>饱和</b>，有 <b>${g(extra)}</b> 溶不了（留在杯底）。`;
      html += `<br>溶液质量 = 100 g + ${g(dis)} = ${g(100 + dis)}　溶质质量分数 = ${g(dis)} ÷ ${g(100 + dis)} × 100% ≈ <b>${SIMS.fmt(w, caoh ? 3 : 1)}%</b>`;
      if (ref && (ref.t !== t || Math.abs(ref.m - m) > 1e-9)) {
        const d0 = Math.min(ref.m, S(key, ref.t)), w0 = d0 / (100 + d0) * 100;
        if (Math.abs(ref.m - m) < 1e-9) {
          const diff = d0 - dis;
          html += `<br>和记下的 ${ref.t} ℃ 相比：`;
          if (diff > eps) html += `溶解的溶质少了，<b>析出晶体 ${g(diff)}</b>；溶质质量分数从 ${SIMS.fmt(w0, caoh ? 3 : 1)}% 变为 ${SIMS.fmt(w, caoh ? 3 : 1)}%。`;
          else if (diff < -eps) html += `又溶解了 ${g(-diff)}，溶质质量分数从 ${SIMS.fmt(w0, caoh ? 3 : 1)}% 变为 ${SIMS.fmt(w, caoh ? 3 : 1)}%。`;
          else html += `没有晶体析出，溶质、溶剂的质量都没变，<b>溶质质量分数不变</b>（${SIMS.fmt(w, caoh ? 3 : 1)}%）${st === 'un' ? '，但溶液变成了不饱和溶液' : ''}。`;
        } else html += `<br><span class="muted">（加入的溶质改变了，和记下的状态不再是同一份溶液）</span>`;
      }
      out.innerHTML = html;
    }
    draw();
  };

  /* ================= 溶质质量分数：稀释与浓缩 ================= */
  SIMS.c3_6_mix = function (box) {
    const ui = SIMS.ui(box, '100 g 10% 的氯化钠溶液，怎样改变它的溶质质量分数（20 ℃）');
    const MODES = ['加水稀释', '蒸发水', '加入氯化钠', '加入 20% 的氯化钠溶液'];
    let mode = 0;
    ui.buttons(MODES, i => { mode = i; draw(); }, 0);
    const fig = ui.fig();
    const X = ui.slider({ label: '加入/蒸发的质量', min: 0, max: 85, step: 1, value: 0, unit: 'g' }, draw);
    const out = ui.out();
    ui.note('20 ℃ 时氯化钠的溶解度是 36 g，饱和溶液的溶质质量分数最大为 36 ÷ 136 × 100% ≈ 26.5%。注意：蒸发掉一半的<b>水</b>（45 g）质量分数并不会翻倍；要翻倍需要蒸发掉溶液质量一半的水（50 g）。');

    // 返回 {s 加入的溶质总量, water 水, dis 溶解的溶质, crys 未溶/析出}
    function state(mo, x) {
      let s = 10, water = 90;
      if (mo === 0) water += x;
      else if (mo === 1) water -= x;
      else if (mo === 2) s += x;
      else { s += 0.2 * x; water += 0.8 * x; }
      const dis = Math.min(s, water * 0.36);
      return { s, water, dis, crys: s - dis };
    }
    const wOf = st => st.dis / (st.dis + st.water) * 100;

    function draw() {
      const x = X.get(), st = state(mode, x), w = wOf(st);
      let s = '';
      // 左：组成条形图
      const top = 50, bh = 180, scale = bh / 200;
      const hw = st.water * scale, hs = st.dis * scale;
      s += F.rect(60, top + bh - hw, 60, hw, 'water') + F.rect(60, top + bh - hw - hs, 60, hs, 'soft');
      s += F.rect(60, top + bh - hw - hs, 60, hw + hs, 'ink');
      if (st.crys > 0.05) s += F.rect(130, top + bh - st.crys * scale, 30, st.crys * scale, 'soft') + F.text(145, top + bh - st.crys * scale - 10, '析出/未溶', { size: 11 });
      s += F.text(90, top + bh - hw / 2, '水 ' + SIMS.fmt(st.water, 1) + ' g', { size: 12 });
      if (hs > 14) s += F.text(90, top + bh - hw - hs / 2, '溶质 ' + SIMS.fmt(st.dis, 1) + ' g', { size: 12 });
      else s += F.text(90, top + bh - hw - hs - 10, '溶质 ' + SIMS.fmt(st.dis, 1) + ' g', { size: 12 });
      s += F.text(90, top + bh + 18, '溶液 ' + SIMS.fmt(st.dis + st.water, 1) + ' g', { size: 13 });
      // 右：w 随加入量变化
      const ax = { x: 240, y: 40, w: 250, h: 180, xmax: 85, ymax: 30, xticks: [20, 40, 60, 80], yticks: [10, 20, 30], xlabel: 'x/g', ylabel: 'w/%' };
      s += SIMS.axes(ax);
      s += F.line(ax.px(0), ax.py(26.5), ax.px(85), ax.py(26.5), 'thin dash') + F.text(ax.px(85), ax.py(26.5) - 9, '饱和 26.5%', { size: 11, a: 'end' });
      const pts = [];
      for (let v = 0; v <= 85; v += 0.5) pts.push([ax.px(v), ax.py(Math.min(30, wOf(state(mode, v))))]);
      s += F.poly(pts, 'hi');
      s += `<circle class="hi-fill" cx="${ax.px(x).toFixed(1)}" cy="${ax.py(w).toFixed(1)}" r="5"/>`;
      fig.innerHTML = F.svg(560, 270, s);

      const f1 = v => SIMS.fmt(v, 1);
      let how;
      if (mode === 0) how = `加水 ${x} g：溶质不变 10 g，溶液 100 g + ${x} g = ${f1(100 + x)} g`;
      else if (mode === 1) how = `蒸发水 ${x} g：溶质不变 10 g，溶液 100 g − ${x} g = ${f1(100 - x)} g`;
      else if (mode === 2) how = `加入氯化钠 ${x} g：溶质 10 g + ${x} g，溶液 100 g + ${x} g`;
      else how = `加入 20% 的溶液 ${x} g：溶质 10 g + ${x} g × 20% = ${f1(10 + 0.2 * x)} g，溶液 ${f1(100 + x)} g`;
      if (st.crys > 0.05) how += `（但其中有 ${f1(st.crys)} g 氯化钠没有溶解，溶液实际只有 ${f1(st.dis + st.water)} g）`;
      let html = how + `<br>溶质质量分数 = ${f1(st.dis)} g ÷ ${f1(st.dis + st.water)} g × 100% ≈ <b>${f1(w)}%</b>`;
      if (st.crys > 0.05) html += `<br>已经饱和：${f1(st.water)} g 水最多只能溶解 ${f1(st.water * 0.36)} g，有 ${f1(st.crys)} g 氯化钠${mode === 1 ? '析出' : '溶不了'}，质量分数停在 26.5%。`;
      if (mode === 0) html += '<br><span class="muted">稀释前后溶质质量不变：100 g × 10% = (100 g + 加水质量) × 稀释后的质量分数。</span>';
      if (mode === 3) html += '<br><span class="muted">两种浓度的溶液混合，结果一定在 10% 和 20% 之间，不会等于 (10% + 20%) ÷ 2，除非两者质量相等。</span>';
      out.innerHTML = html;
    }
    draw();
  };

  /* ================= 溶解时的吸热和放热 ================= */
  SIMS.c3_6_heat = function (box) {
    const ui = SIMS.ui(box, '物质溶解时的吸热和放热');
    const SUBS = [
      { name: '氢氧化钠固体', d: 26, t: '明显升高', why: '溶解时<b>放热</b>，瓶内空气受热膨胀，气压增大，把左管液面压低' },
      { name: '硝酸铵固体', d: -26, t: '明显降低', why: '溶解时<b>吸热</b>，瓶内空气遇冷收缩，气压减小，大气把右管液面压低、左管液面升高' },
      { name: '氯化钠固体', d: 0, t: '基本不变', why: '溶解时吸热和放热差不多，温度基本不变' }
    ];
    let i = 0, added = false;
    ui.buttons(SUBS.map(x => x.name), v => { i = v; added = false; draw(); }, 0);
    const fig = ui.fig();
    ui.action('把固体加入试管的水中', () => { added = true; draw(); });
    ui.action('重置', () => { added = false; draw(); });
    const out = ui.out();
    ui.note('另外：浓硫酸溶于水也会放出大量的热（稀释浓硫酸要把浓硫酸慢慢注入水中）。生石灰（CaO）放入水中也放热，但那是生石灰与水<b>发生化学反应</b>放热，不是溶解放热。');
    function draw() {
      const x = SUBS[i];
      fig.innerHTML = utube(added ? x.d : 0, { solid: added, tubeLabel: added ? '水 + ' + x.name : '试管中盛有水' });
      out.innerHTML = added
        ? `加入${x.name}后，溶液温度<b>${x.t}</b>：${x.why}。U 形管液面：${x.d > 0 ? '<b>左低右高</b>' : x.d < 0 ? '<b>左高右低</b>' : '仍然<b>相平</b>'}。`
        : '开始时 U 形管两边红墨水液面相平。选一种固体，再点“加入”。';
    }
    draw();
  };
})();
