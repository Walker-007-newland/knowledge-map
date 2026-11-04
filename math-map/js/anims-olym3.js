// 奥数拓展第 3 组（三、四年级典型应用题）的动画：和差、和倍差倍、年龄、盈亏、平均数、还原、最值
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint } = window.AH;
  const A = {};
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const TC = { s1: 't1', s2: 't2', s3: 't3' };

  function rect(g, x, y, w, h, cls, extra) {
    return S('rect', Object.assign({ x, y, width: Math.max(0, w), height: Math.max(0, h), rx: 3, class: cls }, extra || {}), g);
  }
  // 横向括号：above 为 true 时括号在线段上方（两脚朝下）
  function brace(g, x1, x2, y, above, label, c) {
    const legs = above ? 7 : -7;
    S('path', { d: `M${x1},${y + legs} V${y} H${x2} V${y + legs}`, class: 'fnone ' + (c || 'smuted') }, g);
    if (label != null) T(g, (x1 + x2) / 2, above ? y - 6 : y + 17, label, 'ts tb ' + (TC[c] || 'tm'));
  }
  // 竖向括号（在右边），两行文字
  function vbrace(g, x, y1, y2, l1, l2, c) {
    S('path', { d: `M${x - 6},${y1} H${x} V${y2} H${x - 6}`, class: 'fnone ' + (c || 'smuted') }, g);
    const ym = (y1 + y2) / 2;
    if (l1 != null) T(g, x + 6, ym - 2, l1, 'tb ' + (TC[c] || 'tm'), 'start');
    if (l2 != null) T(g, x + 6, ym + 15, l2, 'ts ' + (TC[c] || 'tm'), 'start');
  }

  // ───────── 和差问题：截长补短 ─────────
  A.o_sumdiff_cut = function (el) {
    const W = 420, Hh = 190, x0 = 62, y1 = 50, y2 = 118, bh = 30;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let s = 8, d = 4, mode = '', p = 0, busy = false;
    function render() {
      g.innerHTML = '';
      const u = Math.min(16, 220 / (s + d)), sum = 2 * s + d, done = mode && p >= 1;
      T(g, x0 - 10, y1 + 20, '大数', 'tb', 'end');
      T(g, x0 - 10, y2 + 20, '小数', 'tb', 'end');
      rect(g, x0, y1, s * u, bh, 'f1s s1');
      T(g, x0 + (s * u) / 2, y1 + 20, done ? s : '?', 't1 tb');
      const cut = mode === 'cut' ? p : 0;
      const dg = S('g', { transform: `translate(${cut * 36},${-cut * 14})`, opacity: 1 - cut * 0.7 }, g);
      rect(dg, x0 + s * u, y1, d * u, bh, 'f2s s2');
      T(dg, x0 + s * u + (d * u) / 2, y1 + 20, d, 't2 tb');
      brace(dg, x0 + s * u, x0 + (s + d) * u, y1 - 8, true, '差', 's2');
      rect(g, x0, y2, s * u, bh, 'f1s s1');
      T(g, x0 + (s * u) / 2, y2 + 20, done ? s : '?', 't1 tb');
      if (mode === 'add') {
        rect(g, x0 + s * u, y2, d * u * p, bh, 'f2s s2 dash');
        if (p > 0.7) T(g, x0 + s * u + (d * u) / 2, y2 + 20, '+' + d, 't2 tb');
      }
      if (mode === 'cut' && done) vbrace(g, x0 + s * u + 10, y1, y2 + bh, `${sum} − ${d} = ${sum - d}`, '是 2 个小数', 's1');
      else if (mode === 'add' && done) vbrace(g, x0 + (s + d) * u + 10, y1, y2 + bh, `${sum} + ${d} = ${sum + d}`, '是 2 个大数', 's2');
      else if (!mode) vbrace(g, x0 + (s + d) * u + 10, y1, y2 + bh, `和 = ${sum}`, '两条合起来', '');
      T(g, W / 2, Hh - 10, `已知：和 = ${sum}，差 = ${d}`, 'tb');
      if (!mode) read.innerHTML = `两个数的和是 <b>${sum}</b>，大数比小数多 <span class="k2">${d}</span>（橙色那段就是差）。两条线段不一样长，没法直接平均分。点“截长”或“补短”，让它们变得一样长。`;
      else if (!done) read.innerHTML = mode === 'cut' ? '把大数多出来的那一段截掉……' : '给小数补上一段，补得和大数一样长……';
      else if (mode === 'cut') read.innerHTML = `截掉差 ${d}，两条线段一样长，都是小数：<span class="k1">${sum} − ${d} = ${sum - d}</span>，正好是 2 个小数。小数 = ${sum - d} ÷ 2 = <b>${s}</b>，大数 = ${s} + ${d} = <b>${s + d}</b>。`;
      else read.innerHTML = `补上差 ${d}，两条线段一样长，都是大数：<span class="k2">${sum} + ${d} = ${sum + d}</span>，正好是 2 个大数。大数 = ${sum + d} ÷ 2 = <b>${s + d}</b>，小数 = ${s + d} − ${d} = <b>${s}</b>。`;
    }
    function go(m) {
      if (busy) return;
      busy = true; mode = m; p = 0;
      tween(1100, (t) => { p = t; render(); }, () => { p = 1; busy = false; render(); });
    }
    btn(c, '截长：去掉差', () => go('cut'));
    btn(c, '补短：补上差', () => go('add'));
    btn(c, '还原', () => { if (!busy) { mode = ''; p = 0; render(); } }, 'alt');
    btn(c, '换一组数', () => { if (!busy) { s = ri(5, 20); d = ri(2, 12); mode = ''; p = 0; render(); } }, 'alt');
    render();
  };

  // ───────── 和差问题：甲给乙，差少 2 ─────────
  A.o_sumdiff_give = function (el) {
    const W = 420, Hh = 160, x0 = 70, gap = 20, r = 8, yA = 50, yB = 118;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const fly = S('circle', { r, class: 'f2 s2', opacity: 0 }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a0 = 14, b0 = 6, k = 0, busy = false;
    function render() {
      g.innerHTML = '';
      const a = a0 - k, b = b0 + k;
      T(g, 24, yA - 2, '甲', 'tb');
      T(g, 24, yA + 15, a + ' 颗', 'ts tm');
      T(g, 24, yB - 2, '乙', 'tb');
      T(g, 24, yB + 15, b + ' 颗', 'ts tm');
      if (a > b) {
        rect(g, x0 + b * gap - 10, yA - 13, (a - b) * gap, 26, 'fnone s2 dash');
        T(g, x0 + b * gap - 10 + ((a - b) * gap) / 2, yA - 20, `甲多 ${a - b} 颗`, 'ts tb t2');
      }
      for (let i = 0; i < a; i++) S('circle', { cx: x0 + i * gap, cy: yA, r, class: 'f1 s1' }, g);
      for (let i = 0; i < b; i++) S('circle', { cx: x0 + i * gap, cy: yB, r, class: i >= b0 ? 'f2 s2' : 'f3 s3' }, g);
      if (k === 0) read.innerHTML = `甲有 ${a} 颗，乙有 ${b} 颗，甲比乙多 <span class="k2">${a - b}</span> 颗。甲每给乙 1 颗，相差的颗数会怎样变？`;
      else if (a > b) read.innerHTML = `甲给了乙 <span class="k2">${k}</span> 颗：甲 ${a} 颗，乙 ${b} 颗，还差 ${a - b} 颗。给 1 颗，甲少 1、乙多 1，相差就少 <b>2</b>。`;
      else read.innerHTML = `一样多了，都是 ${a} 颗！甲一共给了乙 <span class="k2">${k}</span> 颗，原来相差 ${a0 - b0} 颗 = ${k} × 2。所以“甲给乙 ${k} 颗后一样多”，说明原来甲比乙多 <b>${2 * k}</b> 颗。`;
    }
    btn(c, '甲给乙 1 颗', () => {
      if (busy) return;
      const a = a0 - k, b = b0 + k;
      if (a <= b) { read.innerHTML = '已经一样多了，再给就变成乙多了。点“重来”再看一遍。'; return; }
      busy = true;
      const fx = x0 + (a - 1) * gap, tx = x0 + b * gap;
      const last = [...g.querySelectorAll('circle')].filter((e) => +e.getAttribute('cy') === yA).pop();
      if (last) last.setAttribute('opacity', 0);
      fly.setAttribute('opacity', 1);
      tween(650, (t) => {
        fly.setAttribute('cx', lerp(fx, tx, t));
        fly.setAttribute('cy', lerp(yA, yB, t) - 40 * Math.sin(Math.PI * t));
      }, () => { fly.setAttribute('opacity', 0); k++; busy = false; render(); });
    });
    btn(c, '重来', () => { if (!busy) { k = 0; render(); } }, 'alt');
    btn(c, '换一组', () => { if (!busy) { b0 = ri(2, 7); a0 = b0 + 2 * ri(2, 5); k = 0; render(); } }, 'alt');
    render();
  };

  // ───────── 和倍、差倍：数“份数” ─────────
  A.o_summul_blocks = function (el) {
    const W = 420, Hh = 200, x0 = 64, y1 = 52, y2 = 122, bh = 32;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mode = 'sum', n = 3, v = 6, phase = 0, cnt = 0, busy = false;
    function render() {
      g.innerHTML = '';
      const bw = Math.min(60, 240 / n), total = mode === 'sum' ? v * (n + 1) : v * (n - 1);
      const parts = mode === 'sum' ? n + 1 : n - 1;
      T(g, x0 - 10, y1 + 21, '大数', 'tb', 'end');
      T(g, x0 - 10, y2 + 21, '小数', 'tb', 'end');
      // 计数顺序：和倍先数小数再数大数；差倍只数大数多出来的
      const order = [];
      if (mode === 'sum') { order.push(['s', 0]); for (let i = 0; i < n; i++) order.push(['b', i]); }
      else for (let i = 1; i < n; i++) order.push(['b', i]);
      const num = (row, i) => { const j = order.findIndex((o) => o[0] === row && o[1] === i); return j; };
      const block = (row, i, x, y) => {
        const j = num(row, i);
        const on = j >= 0 && (phase === 2 || j < cnt);
        rect(g, x, y, bw - 2, bh, on ? 'f2s s2' : 'f1s s1');
        let lab = '';
        if (phase === 2) lab = v;
        else if (on) lab = j + 1;
        else if (row === 's') lab = '1 份';
        T(g, x + bw / 2 - 1, y + 21, lab, (on ? 't2' : 't1') + ' tb' + (lab === '1 份' ? ' ts' : ''));
      };
      for (let i = 0; i < n; i++) block('b', i, x0 + i * bw, y1);
      block('s', 0, x0, y2);
      if (mode === 'sum') vbrace(g, x0 + n * bw + 10, y1, y2 + bh, `和 = ${total}`, `${phase ? parts + ' 份' : ''}`, 's2');
      else {
        S('line', { x1: x0 + bw - 2, x2: x0 + bw - 2, y1: y1 - 4, y2: y2 + bh, class: 'smuted dash' }, g);
        brace(g, x0 + bw, x0 + n * bw - 2, y1 - 10, true, `差 = ${total}${phase ? '，' + parts + ' 份' : ''}`, 's2');
      }
      T(g, W / 2, Hh - 8, `大数是小数的 ${n} 倍，${mode === 'sum' ? '两数的和' : '两数的差'}是 ${total}`, 'tb');
      if (phase === 0) read.innerHTML = `把小数看成 <b>1 份</b>，大数是它的 ${n} 倍，就是 ${n} 份。${mode === 'sum' ? `已知两数的<b>和</b>是 ${total}。` : `已知大数比小数<b>多</b> ${total}。`}先点“① 数份数”。`;
      else if (phase === 1) read.innerHTML = mode === 'sum'
        ? `和里一共有 ${n} + 1 = <span class="k2">${parts}</span> 份（大数 ${n} 份，小数 1 份）。`
        : `对齐以后，大数比小数多出 ${n} − 1 = <span class="k2">${parts}</span> 份，差就是这 ${parts} 份。`;
      else read.innerHTML = `1 份 = ${total} ÷ ${parts} = <b>${v}</b>。小数是 1 份：<b>${v}</b>；大数是 ${n} 份：${v} × ${n} = <b>${v * n}</b>。验算：${mode === 'sum' ? `${v * n} + ${v} = ${total}` : `${v * n} − ${v} = ${total}`}。`;
    }
    function reset() { phase = 0; cnt = 0; render(); }
    btn(c, '和倍', () => { if (!busy) { mode = 'sum'; reset(); } });
    btn(c, '差倍', () => { if (!busy) { mode = 'diff'; reset(); } });
    btn(c, '① 数份数', () => {
      if (busy) return;
      busy = true; phase = 1; cnt = 0;
      const total = mode === 'sum' ? n + 1 : n - 1;
      tween(320 * total, (t, raw) => { cnt = Math.min(total, Math.floor(raw * total) + 1); render(); }, () => { cnt = total; busy = false; render(); });
    });
    btn(c, '② 求 1 份', () => { if (!busy) { phase = 2; render(); } });
    slider(c, 'smn', '倍数', 2, 5, 1, n, (x) => { if (!busy) { n = x; reset(); } });
    btn(c, '换数据', () => { if (!busy) { v = ri(3, 15); reset(); } }, 'alt');
    render();
  };

  // ───────── 和倍：几倍多几、几倍少几 ─────────
  A.o_summul_extra = function (el) {
    const W = 420, Hh = 190, x0 = 64, y1 = 50, y2 = 118, bh = 32;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let v = 12, n = 3, r = 4, p = 0, busy = false;
    let actBtn;
    function render() {
      g.innerHTML = '';
      const bw = Math.min(56, 200 / n), sw = (Math.abs(r) / v) * bw, S0 = v * (n + 1) + r, S1 = S0 - r;
      T(g, x0 - 10, y1 + 21, '大数', 'tb', 'end');
      T(g, x0 - 10, y2 + 21, '小数', 'tb', 'end');
      for (let i = 0; i < n; i++) {
        const last = i === n - 1 && r < 0;
        rect(g, x0 + i * bw, y1, bw - 2 - (last ? sw * (1 - p) : 0), bh, 'f1s s1');
        if (last) rect(g, x0 + i * bw + bw - 2 - sw, y1, sw, bh, 'fnone s2 dash');
        T(g, x0 + i * bw + bw / 2 - 1, y1 + 21, p >= 1 ? v : '', 't1 tb');
      }
      if (r > 0) {
        const sg = S('g', { transform: `translate(${p * 30},${-p * 18})`, opacity: 1 - p * 0.75 }, g);
        rect(sg, x0 + n * bw, y1, sw, bh, 'f2s s2');
        T(sg, x0 + n * bw + sw / 2, y1 - 8, '多 ' + r, 'ts tb t2');
      } else {
        T(g, x0 + n * bw - 2 - sw / 2, y1 - 8, (p > 0.5 ? '补 ' : '少 ') + -r, 'ts tb t2');
      }
      rect(g, x0, y2, bw - 2, bh, 'f1s s1');
      T(g, x0 + bw / 2 - 1, y2 + 21, p >= 1 ? v : '1 份', 't1 tb' + (p >= 1 ? '' : ' ts'));
      const right = x0 + n * bw + (r > 0 ? sw + 12 : 10);
      if (p < 1) vbrace(g, right, y1, y2 + bh, `和 = ${S0}`, '', 's2');
      else vbrace(g, right, y1, y2 + bh, `${S0} ${r > 0 ? '−' : '+'} ${Math.abs(r)} = ${S1}`, `正好 ${n + 1} 份`, 's2');
      T(g, W / 2, Hh - 8, `两数的和是 ${S0}，大数是小数的 ${n} 倍${r > 0 ? '多' : '少'} ${Math.abs(r)}`, 'tb');
      actBtn.textContent = r > 0 ? `去掉多的 ${r}` : `补上少的 ${-r}`;
      if (p === 0) read.innerHTML = r > 0
        ? `大数比 ${n} 份还<b>多</b>出一小段 ${r}，所以和不是整份数。先把多出的 ${r} 去掉。`
        : `大数比 ${n} 份还<b>少</b>一小段 ${-r}（虚线），所以和不是整份数。先把少的 ${-r} 补上。`;
      else if (p < 1) read.innerHTML = '正在调整……';
      else read.innerHTML = `${r > 0 ? '去掉' : '补上'} ${Math.abs(r)} 后：${S0} ${r > 0 ? '−' : '+'} ${Math.abs(r)} = ${S1}，正好是 ${n} + 1 = ${n + 1} 份。1 份 = ${S1} ÷ ${n + 1} = <b>${v}</b>，小数 <b>${v}</b>，大数 = ${v} × ${n} ${r > 0 ? '+' : '−'} ${Math.abs(r)} = <b>${v * n + r}</b>。`;
    }
    function newData(sign) { v = ri(6, 12); n = ri(2, 4); r = sign * ri(1, v - 3); p = 0; render(); }
    actBtn = btn(c, '去掉多的', () => {
      if (busy || p >= 1) return;
      busy = true;
      tween(1000, (t) => { p = t; render(); }, () => { p = 1; busy = false; render(); });
    });
    btn(c, '“几倍多几”', () => { if (!busy) newData(1); });
    btn(c, '“几倍少几”', () => { if (!busy) newData(-1); });
    btn(c, '还原', () => { if (!busy) { p = 0; render(); } }, 'alt');
    render();
  };

  // ───────── 年龄问题：一起长大，差不变 ─────────
  A.o_age_bars = function (el) {
    const W = 420, Hh = 170, x0 = 70, y1 = 46, y2 = 112, bh = 30;
    const FAM = [[32, 4], [30, 6], [36, 8], [28, 4], [40, 10]];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let fi = 0, k = 0, busy = false;
    function render() {
      g.innerHTML = '';
      const [M, C] = FAM[fi], D = M - C, u = 270 / (M + 20);
      const m = M + k, ch = C + k;
      T(g, x0 - 10, y1 + 20, '妈妈', 'tb', 'end');
      T(g, x0 - 10, y2 + 20, '孩子', 'tb', 'end');
      rect(g, x0, y1, ch * u, bh, 'f1s s1');
      rect(g, x0 + ch * u, y1, D * u, bh, 'f2s s2');
      T(g, x0 + ch * u + (D * u) / 2, y1 + 20, '差 ' + D, 't2 tb');
      T(g, x0 + m * u + 6, y1 + 20, m + ' 岁', 'tb', 'start');
      rect(g, x0, y2, ch * u, bh, 'f1s s1');
      T(g, x0 + ch * u + 6, y2 + 20, ch + ' 岁', 'tb', 'start');
      S('line', { x1: x0 + ch * u, x2: x0 + ch * u, y1: y1 - 4, y2: y2 + bh + 4, class: 'smuted dash' }, g);
      T(g, W / 2, Hh - 6, k === 0 ? '今年' : k > 0 ? `${k} 年后` : `${-k} 年前`, 'tb t3');
      const when = k === 0 ? '今年' : k > 0 ? `${k} 年后` : `${-k} 年前`;
      let txt = `${when}：妈妈 <span class="k2">${m}</span> 岁，孩子 <span class="k1">${ch}</span> 岁。年龄差 ${m} − ${ch} = <b>${D}</b>，永远不变。`;
      txt += `年龄和 ${m + ch}${k ? `（比今年${k > 0 ? '多' : '少'} 2 × ${Math.abs(k)} = ${2 * Math.abs(k)}）` : ''}。`;
      txt += m % ch === 0 ? `这时妈妈正好是孩子的 <span class="k3">${m / ch}</span> 倍。` : '这时妈妈的年龄不是孩子的整数倍。';
      read.innerHTML = txt;
    }
    const sl = slider(c, 'agek', '过了几年', -3, 20, 1, 0, (x) => { if (!busy) { k = x; render(); } });
    btn(c, '▶ 一年一年长大', () => {
      if (busy) return;
      busy = true;
      const from = k >= 20 ? 0 : k;
      tween(3500, (t, raw) => { k = Math.round(lerp(from, 20, raw)); sl.set(k); render(); }, () => { k = 20; sl.set(k); busy = false; render(); });
    });
    btn(c, '换一家', () => { if (!busy) { fi = (fi + 1) % FAM.length; k = 0; sl.set(0); render(); } }, 'alt');
    H('p', { class: 'anim-tip' }, el, '滑块拨到负数表示“几年前”。注意橙色那段（年龄差）一直一样长，只是跟着往右移。');
    render();
  };

  // ───────── 年龄问题：几年后是几倍（差倍） ─────────
  A.o_age_times = function (el) {
    const W = 420, Hh = 230, x0 = 70, y1 = 40, y2 = 96, bh = 30, yT = 182;
    const FAM = [[32, 4], [36, 6], [40, 4], [30, 6]];
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let fi = 0, n = 3, p = 1, busy = false;
    function render() {
      g.innerHTML = '';
      const [M, C] = FAM[fi], D = M - C, ok = D % (n - 1) === 0, cc = ok ? D / (n - 1) : 0;
      const bw = Math.min(46, 290 / n);
      T(g, x0 - 10, y1 + 20, '妈妈', 'tb', 'end');
      T(g, x0 - 10, y2 + 20, '孩子', 'tb', 'end');
      for (let i = 0; i < n; i++) {
        const extra = i > 0;
        const w = (bw - 2) * (extra ? Math.min(1, p * 1.4) : 1);
        rect(g, x0 + i * bw, y1, w, bh, extra ? 'f2s s2' : 'f1s s1');
        if (p >= 1) T(g, x0 + i * bw + bw / 2 - 1, y1 + 20, ok ? cc : '?', (extra ? 't2' : 't1') + ' tb' + (bw < 40 ? ' ts' : ''));
      }
      rect(g, x0, y2, bw - 2, bh, 'f1s s1');
      if (p >= 1) T(g, x0 + bw / 2 - 1, y2 + 20, ok ? cc : '?', 't1 tb' + (bw < 40 ? ' ts' : ''));
      brace(g, x0 + bw, x0 + n * bw - 2, y1 - 8, true, `年龄差 ${D}，是 ${n - 1} 份`, 's2');
      // 年龄轴：孩子的年龄
      const amax = 40, X = (a) => x0 + (a * 300) / amax;
      S('line', { x1: X(0), x2: X(amax), y1: yT, y2: yT, class: 'sstrong' }, g);
      for (let a = 0; a <= amax; a += 5) {
        S('line', { x1: X(a), x2: X(a), y1: yT - 4, y2: yT + 4, class: 'smuted' }, g);
        T(g, X(a), yT + 18, a, 'ts tm');
      }
      T(g, x0 - 10, yT + 4, '孩子几岁', 'ts tb', 'end');
      S('circle', { cx: X(C), cy: yT, r: 6, class: 'f1' }, g);
      T(g, X(C), yT - 30, '今年', 'ts tb t1');
      if (ok && cc !== C) {
        const xe = lerp(X(C), X(cc), Math.min(1, p));
        S('path', { d: `M${X(C)},${yT - 12} H${xe}`, class: 'fnone s2 thick' }, g);
        S('path', { d: `M${xe},${yT - 12} l${cc > C ? -7 : 7},-5 v10 Z`, class: 'f2' }, g);
        if (p >= 1) {
          S('circle', { cx: X(cc), cy: yT, r: 6, class: 'f2' }, g);
          T(g, (X(C) + X(cc)) / 2, yT - 18, `${Math.abs(cc - C)} 年${cc > C ? '后' : '前'}`, 'ts tb t2');
        }
      }
      let txt = `妈妈今年 ${M} 岁，孩子 ${C} 岁，年龄差 <b>${D}</b> 岁永远不变。妈妈是孩子的 ${n} 倍时，妈妈比孩子多 ${n} − 1 = ${n - 1} 份，`;
      if (!ok) txt += `可是 ${D} 不能平均分成 ${n - 1} 份，所以妈妈的年龄<b>不会</b>正好是孩子的 ${n} 倍。换个倍数试试。`;
      else {
        txt += `1 份 = ${D} ÷ ${n - 1} = <span class="k1">${cc}</span>，就是那时孩子的年龄（妈妈 ${cc * n} 岁）。`;
        txt += cc === C ? '正好是<b>今年</b>！' : cc > C ? `${cc} 比今年的 ${C} 大，是 <b>${cc - C} 年后</b>。` : `${cc} 比今年的 ${C} 小，是 <b>${C - cc} 年前</b>。`;
      }
      read.innerHTML = txt;
    }
    function play() {
      if (busy) return;
      busy = true; p = 0;
      tween(1200, (t) => { p = t; render(); }, () => { p = 1; busy = false; render(); });
    }
    slider(c, 'agen', '几倍', 2, 8, 1, n, (x) => { n = x; if (!busy) play(); });
    btn(c, '▶ 演示', play);
    btn(c, '换一家', () => { if (!busy) { fi = (fi + 1) % FAM.length; play(); } }, 'alt');
    render();
  };

  // ───────── 盈亏问题：分糖果 ─────────
  A.o_surplus_candy = function (el) {
    const W = 440, Hh = 230, yKid = 204, r = 7;
    const svg = stage(el, W, Hh);
    const gBack = S('g', {}, svg), gC = S('g', {}, svg), gTop = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 5, a = 3, b = 5, s = 6, p = 0, busy = false, dots = [];
    const kx = (i) => 40 + i * 54;
    const sy = (j) => 176 - j * 17;
    const pile = (q) => [372 + (q % 3) * 18, 176 - Math.floor(q / 3) * 17];
    let b1, b2;
    function pos(idx, st) {
      if (idx < n * a) return [kx(idx % n), sy(Math.floor(idx / n))];
      const e = idx - n * a;
      if (st === 0) return pile(e);
      return [kx(e % n), sy(a + Math.floor(e / n))];
    }
    function build() {
      gBack.innerHTML = ''; gC.innerHTML = '';
      const tot = n * a + s;
      for (let i = 0; i < n; i++) {
        S('circle', { cx: kx(i), cy: yKid, r: 12, class: 'f3s s3' }, gBack);
        T(gBack, kx(i), yKid + 5, i + 1, 'ts tb');
      }
      rect(gBack, 358, 100, 70, 92, 'fsurf2 sline');
      T(gBack, 393, 210, '盒子', 'ts tm');
      // 不够的位置（虚线圈）
      const need = n * (b - a);
      for (let e = s; e < need; e++) S('circle', { cx: kx(e % n), cy: sy(a + Math.floor(e / n)), r, class: 'fnone s2 dash miss' }, gBack);
      dots = [];
      for (let i = 0; i < tot; i++) dots.push(S('circle', { r, class: i < n * a ? 'f1 s1' : 'f2 s2' }, gC));
      b1.textContent = `每人分 ${a} 颗`;
      b2.textContent = `每人分 ${b} 颗`;
    }
    function render() {
      dots.forEach((d, i) => {
        const p0 = pos(i, 0), p1 = pos(i, 1);
        d.setAttribute('cx', lerp(p0[0], p1[0], p));
        d.setAttribute('cy', lerp(p0[1], p1[1], p) - 30 * Math.sin(Math.PI * p) * (i >= n * a ? 1 : 0));
      });
      gBack.querySelectorAll('.miss').forEach((m) => m.setAttribute('opacity', p > 0.8 ? (p - 0.8) * 5 : 0));
      gTop.innerHTML = '';
      const d = n * (b - a) - s, T0 = n * a + s;
      if (p < 0.5) T(gTop, W / 2, 26, `每人 ${a} 颗：多 ${s} 颗`, 'tb t2');
      else T(gTop, W / 2, 26, `每人 ${b} 颗：少 ${d} 颗`, 'tb t2');
      if (p === 0) read.innerHTML = `每人分 <span class="k1">${a}</span> 颗，分完盒子里还<b>多 ${s} 颗</b>。如果每人分 ${b} 颗呢？点上面的按钮。`;
      else if (p < 1) read.innerHTML = '盒子里的糖一颗颗分出去……';
      else read.innerHTML = `每人分 <span class="k2">${b}</span> 颗，每人比刚才多分 ${b} − ${a} = ${b - a} 颗。盒子里的 ${s} 颗分完了，还<b>差 ${d} 颗</b>（虚线圈）。一共要多拿 ${s} + ${d} = <b>${s + d}</b> 颗，每人多 ${b - a} 颗，所以人数 = ${s + d} ÷ ${b - a} = <b>${n}</b>，糖 = ${n} × ${a} + ${s} = <b>${T0}</b> 颗。`;
    }
    function go(to) {
      if (busy || p === to) return;
      busy = true;
      const from = p;
      tween(1300, (t) => { p = lerp(from, to, t); render(); }, () => { p = to; busy = false; render(); });
    }
    b1 = btn(c, '每人分 3 颗', () => go(0));
    b2 = btn(c, '每人分 5 颗', () => go(1));
    btn(c, '换一题', () => {
      if (busy) return;
      n = ri(3, 6); a = ri(2, 3); b = a + ri(1, 2);
      s = ri(1, n * (b - a) - 1); p = 0; build(); render();
    }, 'alt');
    build(); render();
  };

  // ───────── 盈亏问题：三种情况对比 ─────────
  A.o_surplus_types = function (el) {
    const W = 420, Hh = 240, x0 = 104, a = 3, b = 5, bh = 26;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let type = 'pd', n = 5, busy = false, shown = null;
    function total(tp) {
      if (tp === 'pd') return 4 * n + 1;
      if (tp === 'pp') return 5 * n + 4;
      if (tp === 'dd') return 3 * n - 3;
      return 3 * n;
    }
    function render(Tv) {
      g.innerHTML = '';
      const u = 270 / (5 * n + 6), X = (v) => x0 + v * u, A1 = a * n, B1 = b * n;
      const rows = [[30, '糖果总数', Tv, 'f3s s3'], [86, `每人 ${a} 颗要`, A1, 'f1s s1'], [142, `每人 ${b} 颗要`, B1, 'f2s s2']];
      rows.forEach(([y, lab, len, cls]) => {
        T(g, x0 - 8, y + 18, lab, 'ts tb', 'end');
        rect(g, x0, y, len * u, bh, cls);
      });
      S('line', { x1: X(Tv), x2: X(Tv), y1: 24, y2: 176, class: 's3 dash' }, g);
      const gapLab = (y, need) => {
        const dlt = Math.round(Tv - need);
        if (dlt === 0) { T(g, X(need) + 8, y + 18, '刚好', 'ts tb t3', 'start'); return; }
        const lo = Math.min(X(Tv), X(need)), hi = Math.max(X(Tv), X(need));
        S('rect', { x: lo, y: y + 4, width: hi - lo, height: bh - 8, class: dlt > 0 ? 'f3s' : 'fsurf2', opacity: 0.9 }, g);
        T(g, hi + 4, y + 18, dlt > 0 ? `多 ${dlt}` : `少 ${-dlt}`, 'ts tb ' + (dlt > 0 ? 't3' : 't2'), 'start');
      };
      gapLab(86, A1); gapLab(142, B1);
      rows.forEach(([y, , len]) => T(g, x0 + 6, y + 18, Math.round(len), 'ts tb', 'start'));
      brace(g, X(A1), X(B1), 196, false, `两种分法相差 ${n} × ${b - a} = ${B1 - A1}`, 's2');
      S('line', { x1: X(A1), x2: X(A1), y1: 112, y2: 196, class: 's1 dash thin' }, g);
      S('line', { x1: X(B1), x2: X(B1), y1: 168, y2: 196, class: 's2 dash thin' }, g);
    }
    function readout() {
      const Tv = total(type), A1 = a * n, B1 = b * n, x = Tv - A1, y = Tv - B1;
      const head = `${n} 个人分 ${Tv} 颗糖。每人 ${a} 颗${x > 0 ? '多 ' + x : x < 0 ? '少 ' + -x : '刚好'}，每人 ${b} 颗${y > 0 ? '多 ' + y : '少 ' + -y}。`;
      let how;
      if (type === 'pd') how = `<b>一盈一亏</b>：总数夹在两种需要中间，相差 = 多的 + 少的 = ${x} + ${-y} = ${B1 - A1}。`;
      else if (type === 'pp') how = `<b>两盈</b>：总数比两种需要都多，相差 = 大盈 − 小盈 = ${x} − ${y} = ${B1 - A1}。`;
      else if (type === 'dd') how = `<b>两亏</b>：总数比两种需要都少，相差 = 大亏 − 小亏 = ${-y} − ${-x} = ${B1 - A1}。`;
      else how = `<b>刚好分完</b>：这一次盈亏是 0，相差 = ${-y} − 0 = ${B1 - A1}。`;
      read.innerHTML = head + how + `人数 = ${B1 - A1} ÷ (${b} − ${a}) = <b>${n}</b>。`;
    }
    function go(tp) {
      if (busy) return;
      busy = true;
      const from = shown == null ? total(tp) : shown, to = total((type = tp));
      tween(700, (t) => { shown = lerp(from, to, t); render(shown); }, () => { shown = to; busy = false; render(to); readout(); });
    }
    btn(c, '一盈一亏', () => go('pd'));
    btn(c, '两盈', () => go('pp'));
    btn(c, '两亏', () => go('dd'));
    btn(c, '刚好分完', () => go('z0'));
    slider(c, 'surn', '人数', 3, 8, 1, n, (x) => { if (!busy) { n = x; shown = total(type); render(shown); readout(); } });
    shown = total(type); render(shown); readout();
  };

  // ───────── 平均数：移多补少 ─────────
  A.o_avg_level = function (el) {
    const W = 420, Hh = 240, base = 212, u = 14, bw = 44;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let h = [6, 9, 4, 8, 3], p = 0, busy = false;
    const bx = (i) => 40 + i * 66;
    function render() {
      g.innerHTML = '';
      const sum = h.reduce((x, y) => x + y, 0), avg = sum / h.length;
      S('line', { x1: 30, x2: W - 10, y1: base, y2: base, class: 'sstrong' }, g);
      h.forEach((hi, i) => {
        const cur = lerp(hi, avg, p), x = bx(i), lo = Math.min(hi, avg);
        rect(g, x, base - lo * u, bw, lo * u, 'f1s s1', { rx: 0 });
        if (hi > avg) rect(g, x, base - cur * u, bw, (cur - avg) * u, 'f2s s2', { rx: 0 });
        if (hi < avg) {
          rect(g, x, base - avg * u, bw, (avg - hi) * u, 'fnone s3 dash', { rx: 0 });
          rect(g, x, base - cur * u, bw, (cur - hi) * u, 'f3s s3', { rx: 0 });
        }
        for (let k = 1; k < Math.max(cur, lo); k++) S('line', { x1: x, x2: x + bw, y1: base - k * u, y2: base - k * u, class: 'sline' }, g);
        T(g, x + bw / 2, base - Math.max(cur, hi < avg ? avg : cur) * u - 16, fmt(p >= 1 ? avg : hi), 'tb');
        T(g, x + bw / 2, base + 18, `第${i + 1}堆`, 'ts tm');
        if (p === 0) {
          const hd = S('circle', { cx: x + bw / 2, cy: base - hi * u, r: 9, class: 'handle', tabindex: 0 }, g);
          hd.addEventListener('pointerdown', (e) => {
            if (busy) return;
            e.preventDefault();
            hd.setPointerCapture(e.pointerId);
            const move = (ev) => {
              const pt = svgPoint(svg, ev);
              const nv = Math.max(1, Math.min(12, Math.round((base - pt.y) / u)));
              if (nv !== h[i]) { h[i] = nv; hd.setAttribute('cy', base - nv * u); drawLight(); }
            };
            const up = () => { hd.removeEventListener('pointermove', move); hd.removeEventListener('pointerup', up); render(); };
            hd.addEventListener('pointermove', move);
            hd.addEventListener('pointerup', up);
          });
        }
      });
      S('line', { x1: 30, x2: W - 10, y1: base - avg * u, y2: base - avg * u, class: 's3 dash' }, g);
      T(g, 354, base - avg * u - 6, `平均 ${fmt(avg)}`, 'ts tb t3', 'start');
      if (p === 0) read.innerHTML = `5 堆积木一共 <b>${sum}</b> 块。橙色是比平均高出来的，绿色虚线框是比平均缺的。平均数 = ${sum} ÷ 5 = <b>${fmt(avg)}</b>${Number.isInteger(avg) ? '' : '（不是整数也没关系）'}。`;
      else if (p < 1) read.innerHTML = '把高出来的移给矮的……';
      else read.innerHTML = `移多补少以后，5 堆一样高，都是 <b>${fmt(avg)}</b> 块：这就是平均数。总数没变，还是 ${sum} = ${fmt(avg)} × 5。`;
    }
    // 拖动时只更新说明，避免重建正在拖的圆点
    function drawLight() {
      const sum = h.reduce((x, y) => x + y, 0);
      read.innerHTML = `拖动中：第 ${h.map((x) => x).join('、')} 块，总数 ${sum}，平均 ${fmt(sum / 5)}。松手后更新图。`;
    }
    btn(c, '移多补少', () => {
      if (busy || p >= 1) return;
      busy = true;
      tween(1400, (t) => { p = t; render(); }, () => { p = 1; busy = false; render(); });
    });
    btn(c, '还原', () => { if (!busy) { p = 0; render(); } }, 'alt');
    btn(c, '随机一组', () => {
      if (busy) return;
      h = [0, 0, 0, 0].map(() => ri(1, 11));
      let s4 = h.reduce((x, y) => x + y, 0), f = ri(1, 12);
      while ((s4 + f) % 5) f = f % 12 + 1;
      h.push(f); p = 0; render();
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：拖动柱子顶上的圆点可以改变每堆的块数。');
    render();
  };

  // ───────── 平均数：基准数 ─────────
  A.o_avg_base = function (el) {
    const W = 420, Hh = 250, bw = 40;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let vals = [88, 93, 85, 97, 92], B = 90;
    const Y = (v) => 214 - (v - 76) * 8;
    const bx = (i) => 92 + i * 64;
    function render() {
      g.innerHTML = '';
      const sum = vals.reduce((x, y) => x + y, 0), avg = sum / 5, ds = vals.map((v) => v - B), sd = ds.reduce((x, y) => x + y, 0);
      vals.forEach((v, i) => {
        const x = bx(i), d = v - B;
        if (d !== 0) rect(g, x, Math.min(Y(v), Y(B)), bw, Math.abs(Y(v) - Y(B)), d > 0 ? 'f1s s1' : 'f2s s2', { rx: 0 });
        S('line', { x1: x - 4, x2: x + bw + 4, y1: Y(v), y2: Y(v), class: 'sstrong' }, g);
        T(g, x + bw / 2, d >= 0 ? Y(v) - 6 : Y(v) + 16, d > 0 ? '+' + d : d < 0 ? '−' + -d : '0', 'ts tb ' + (d > 0 ? 't1' : d < 0 ? 't2' : 't3'));
        T(g, x + bw / 2, 240, v, 'tb');
      });
      T(g, 40, 240, '分数', 'ts tm');
      S('line', { x1: 70, x2: W - 6, y1: Y(B), y2: Y(B), class: 'sstrong dash' }, g);
      T(g, 66, Y(B) + 4, `基准 ${B}`, 'ts tb', 'end');
      if (avg !== B) {
        S('line', { x1: 70, x2: W - 6, y1: Y(avg), y2: Y(avg), class: 's3' }, g);
        T(g, W - 6, Y(avg) + (avg > B ? -5 : 15), `平均 ${fmt(avg)}`, 'ts tb t3', 'end');
      }
      const parts = ds.map((d) => (d > 0 ? '+' + d : d < 0 ? '−' + -d : '0')).join('、');
      let txt = `以 <b>${B}</b> 为基准，每个数比它多或少：${parts}。加起来 = ${fmt(sd)}。`;
      txt += sd === 0 ? `正好是 0，基准数就是平均数：<b>${B}</b>！` : `平均数 = ${B} ${sd > 0 ? '+' : '−'} ${Math.abs(sd)} ÷ 5 = <b>${fmt(avg)}</b>。`;
      read.innerHTML = txt;
    }
    const sl = slider(c, 'avgB', '基准数', 80, 95, 1, B, (x) => { B = x; render(); });
    btn(c, '用平均数当基准', () => { B = vals.reduce((x, y) => x + y, 0) / 5; sl.set(B); render(); });
    btn(c, '换一组', () => {
      let o, last;
      do { o = [0, 0, 0, 0].map(() => ri(-7, 7)); last = -o.reduce((x, y) => x + y, 0); } while (Math.abs(last) > 7);
      const Av = ri(86, 93);
      vals = o.concat([last]).map((d) => Av + d);
      render();
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '拖动“基准数”滑块：不管选哪个基准，算出来的平均数都一样。');
    render();
  };

  // ───────── 还原问题：运算倒着走 ─────────
  A.o_restore_machine = function (el) {
    const W = 420, Hh = 180, y = 92, r = 23;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const tok = S('g', { opacity: 0 }, svg);
    S('circle', { r: 16, class: 'f2s s2' }, tok);
    const tokT = T(tok, 0, 5, '', 'ts tb');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const INV = { '+': '−', '−': '+', '×': '÷', '÷': '×' };
    const apply = (v, op, k) => (op === '+' ? v + k : op === '−' ? v - k : op === '×' ? v * k : v / k);
    let ops = [['+', 5], ['×', 3], ['−', 4], ['÷', 2]], vals = [], known = [], lines = [], busy = false;
    const nx = (i) => 42 + i * 84;
    function setup(start) {
      vals = [start];
      ops.forEach(([o, k]) => vals.push(apply(vals[vals.length - 1], o, k)));
      known = vals.map((_, i) => i === 4);
      lines = [`最后的结果是 <b>${vals[4]}</b>。从它出发，一步一步倒着走回去。`];
    }
    function render() {
      g.innerHTML = '';
      ops.forEach(([o, k], i) => {
        const xa = nx(i) + r + 2, xb = nx(i + 1) - r - 4;
        S('line', { x1: xa, x2: xb, y1: y, y2: y, class: 'sstrong' }, g);
        S('path', { d: `M${xb + 3},${y} l-8,-5 v10 Z`, class: 'fstrong' }, g);
        T(g, (xa + xb) / 2, y - 14, `${o} ${k}`, 'tb t1');
        if (known[i]) T(g, (xa + xb) / 2, y + 34, `${INV[o]} ${k}`, 'tb t2');
      });
      vals.forEach((v, i) => {
        S('circle', { cx: nx(i), cy: y, r, class: known[i] ? (i === 0 ? 'f3s s3' : 'f1s s1') : 'fsurf2 smuted' }, g);
        T(g, nx(i), y + 6, known[i] ? v : '?', 'tb');
      });
      T(g, nx(0), y - 36, '原数', 'ts tm');
      T(g, nx(4), y - 36, '结果', 'ts tm');
      T(g, W / 2, 22, '正着：' + ops.map(([o, k]) => `${o} ${k}`).join(' → '), 'ts tb t1');
      T(g, W / 2, Hh - 8, known.some((x, i) => x && i < 4) ? '倒着：' + ops.slice().reverse().map(([o, k]) => `${INV[o]} ${k}`).join(' → ') : '', 'ts tb t2');
      read.innerHTML = lines.join('<br>');
    }
    function moveTok(from, to, label, ms, below, done) {
      tok.setAttribute('opacity', 1);
      tokT.textContent = label;
      tween(ms, (t) => {
        const x = lerp(nx(from), nx(to), t), yy = y + (below ? 1 : -1) * 46 * Math.sin(Math.PI * t);
        tok.setAttribute('transform', `translate(${x},${yy})`);
      }, () => { tok.setAttribute('opacity', 0); done(); });
    }
    function backStep(done) {
      const j = known.indexOf(true) - 1;
      if (j < 0) { if (done) done(); return false; }
      const [o, k] = ops[j];
      busy = true;
      moveTok(j + 1, j, `${INV[o]}${k}`, 800, true, () => {
        known[j] = true;
        lines.push(`这一步原来是“${o} ${k}”，倒回去就“${INV[o]} ${k}”：${vals[j + 1]} ${INV[o]} ${k} = <b>${vals[j]}</b>。`);
        if (j === 0) lines.push(`原数是 <b>${vals[0]}</b>。点“正着验算”检查一下。`);
        busy = false; render();
        if (done) done();
      });
      return true;
    }
    btn(c, '倒推一步', () => { if (!busy) backStep(); });
    btn(c, '全部倒推', () => {
      if (busy) return;
      const loop = () => { if (known[0]) return; backStep(loop); };
      loop();
    });
    btn(c, '正着验算', () => {
      if (busy) return;
      if (!known[0]) { lines.push('先倒推出原数，才能验算。'); render(); return; }
      busy = true;
      let i = 0;
      const chk = [];
      const step = () => {
        if (i >= 4) {
          lines.push('验算：' + chk.join('，') + `，和结果一样，对了！`);
          busy = false; render(); return;
        }
        const [o, k] = ops[i];
        moveTok(i, i + 1, `${o}${k}`, 550, false, () => { chk.push(`${vals[i]} ${o} ${k} = ${vals[i + 1]}`); i++; step(); });
      };
      step();
    }, 'alt');
    btn(c, '换一题', () => {
      if (busy) return;
      let start, ok = false;
      while (!ok) {
        start = ri(2, 12); let cur = start; ops = []; ok = true;
        for (let s = 0; s < 4; s++) {
          const cand = [];
          cand.push(['+', ri(2, 9)]);
          if (cur > 3) cand.push(['−', ri(1, Math.min(9, cur - 2))]);
          if (cur <= 24) cand.push(['×', ri(2, 4)]);
          const dv = [2, 3, 4].filter((k) => cur % k === 0 && cur / k >= 2);
          if (dv.length) cand.push(['÷', dv[ri(0, dv.length - 1)]]);
          const pick = cand[ri(0, cand.length - 1)];
          if (ops.length && ops[ops.length - 1][0] === pick[0]) { s--; if (cand.length === 1) { ok = false; break; } continue; }
          ops.push(pick); cur = apply(cur, pick[0], pick[1]);
        }
      }
      setup(start); render();
    }, 'alt');
    setup(5); render();
  };

  // ───────── 还原问题：用去一半还多（少）几 ─────────
  A.o_restore_half = function (el) {
    const W = 420, Hh = 220, x0 = 92, bh = 26;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let type = 'more', k = 2, r = 3, Am = [], m = 3, p = 1, busy = false, lines = [];
    const ry = (i) => 22 + i * 48;
    const half = (i) => (type === 'more' ? Am[i + 1] + k : Am[i + 1] - k);
    function setup() {
      Am = [0, 0, 0, r];
      for (let i = 2; i >= 0; i--) Am[i] = (type === 'more' ? Am[i + 1] + k : Am[i + 1] - k) * 2;
      m = 3; p = 1;
      lines = [];
    }
    function render() {
      g.innerHTML = '';
      const u = 270 / Am[0];
      const names = ['原来', '第 1 天后', '第 2 天后', '第 3 天后'];
      for (let i = 0; i < 4; i++) {
        const yy = ry(i);
        T(g, x0 - 8, yy + 18, names[i], 'ts tb', 'end');
        if (i === 3) { rect(g, x0, yy, Am[3] * u, bh, 'f1s s1'); T(g, x0 + Am[3] * u + 6, yy + 18, Am[3], 'tb', 'start'); continue; }
        if (i < m) { T(g, x0 + 6, yy + 18, '?', 'tb tm', 'start'); continue; }
        const q = i === m ? p : 1, hf = half(i), nxt = Am[i + 1];
        const p1 = Math.min(1, q * 2), p2 = Math.max(0, q * 2 - 1);
        if (type === 'more') {
          rect(g, x0, yy, nxt * u, bh, 'f1s s1');
          rect(g, x0 + nxt * u, yy, k * u * p1, bh, 'f3s s3');
          if (p1 > 0.6) T(g, x0 + nxt * u + (k * u) / 2, yy - 3, '+' + k, 'ts tb t3');
        } else {
          rect(g, x0, yy, (nxt - k * p1) * u, bh, 'f1s s1');
          if (p1 > 0.3) T(g, x0 + (nxt - k / 2) * u, yy - 3, '−' + k, 'ts tb t2');
        }
        if (p2 > 0) rect(g, x0 + hf * u * p2, yy, hf * u, bh, 'f1s s1 dash', { opacity: p2 });
        if (q >= 1) {
          S('line', { x1: x0 + hf * u, x2: x0 + hf * u, y1: yy - 2, y2: yy + bh + 2, class: 'sstrong' }, g);
          T(g, x0 + 2 * hf * u + 6, yy + 18, Am[i], 'tb', 'start');
        }
      }
      cap.textContent = `每天用去一半还${type === 'more' ? '多' : '少'} ${k} 个，3 天后还剩 ${r} 个。原来有几个？`;
      read.innerHTML = lines.length ? lines.join('<br>') : `从最后剩下的 ${r} 个出发，倒着推，每次推回一天。`;
    }
    function step(done) {
      if (busy || m === 0) { if (done) done(); return; }
      busy = true; m--; p = 0;
      const i = m, hf = half(i);
      tween(1300, (t) => { p = t; render(); }, () => {
        p = 1; busy = false;
        lines.push(type === 'more'
          ? `第 ${i + 1} 天后剩 ${Am[i + 1]}：先把多用的 ${k} 加回来，${Am[i + 1]} + ${k} = ${hf}，这是第 ${i + 1} 天开始时的一半；再 × 2：${hf} × 2 = <b>${Am[i]}</b>。`
          : `第 ${i + 1} 天后剩 ${Am[i + 1]}：少用的 ${k} 要减掉，${Am[i + 1]} − ${k} = ${hf}，这是第 ${i + 1} 天开始时的一半；再 × 2：${hf} × 2 = <b>${Am[i]}</b>。`);
        if (i === 0) lines.push(`原来有 <b>${Am[0]}</b> 个。`);
        render();
        if (done) done();
      });
    }
    btn(c, '倒推一天', () => step());
    btn(c, '全部倒推', () => { if (busy) return; const loop = () => { if (m > 0) step(loop); }; loop(); });
    btn(c, '“还多几”', () => { if (!busy) { type = 'more'; k = ri(1, 3); r = ri(1, 5); setup(); render(); } }, 'alt');
    btn(c, '“还少几”', () => { if (!busy) { type = 'less'; k = ri(1, 3); r = ri(2 * k + 1, 2 * k + 5); setup(); render(); } }, 'alt');
    btn(c, '重来', () => { if (!busy) { setup(); render(); } }, 'alt');
    setup(); render();
  };

  // ───────── 最值：周长一定，面积何时最大 ─────────
  A.o_maxmin_rect = function (el) {
    const W = 440, Hh = 240, gx = 12, gy = 20;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let P = 20, L = 7, busy = false;
    function render() {
      g.innerHTML = '';
      const hf = P / 2, Wd = hf - L, area = L * Wd, cs = Math.min(22, 180 / (hf - 1));
      rect(g, gx, gy, L * cs, Wd * cs, 'f1s s1', { rx: 0 });
      for (let i = 1; i < L; i++) S('line', { x1: gx + i * cs, x2: gx + i * cs, y1: gy, y2: gy + Wd * cs, class: 'sline' }, g);
      for (let j = 1; j < Wd; j++) S('line', { x1: gx, x2: gx + L * cs, y1: gy + j * cs, y2: gy + j * cs, class: 'sline' }, g);
      T(g, gx + (L * cs) / 2, gy + Wd * cs + 16, '长 ' + L, 'ts tb t1');
      T(g, gx + L * cs + 6, gy + (Wd * cs) / 2 + 4, '宽 ' + Wd, 'ts tb t1', 'start');
      // 右边：每种长对应的面积柱
      const cx0 = 250, cw = 182, n = hf - 1, colw = cw / n, base = 196;
      let maxA = 0;
      for (let l = 1; l < hf; l++) maxA = Math.max(maxA, l * (hf - l));
      S('line', { x1: cx0, x2: cx0 + cw, y1: base, y2: base, class: 'sstrong' }, g);
      for (let l = 1; l < hf; l++) {
        const a = l * (hf - l), hh = (a / maxA) * 140;
        const cls = l === L ? 'f2 s2' : a === maxA ? 'f3s s3' : 'fsurf2 sline';
        rect(g, cx0 + (l - 1) * colw + 1, base - hh, colw - 2, hh, cls, { rx: 1 });
        if (colw >= 14 || l === L) T(g, cx0 + (l - 1) * colw + colw / 2, base + 14, l, 'ts ' + (l === L ? 'tb t2' : 'tm'));
      }
      T(g, cx0 + cw / 2, base - 150, `面积（长从 1 到 ${hf - 1}）`, 'ts tm');
      T(g, cx0 + (L - 1) * colw + colw / 2, base - (area / maxA) * 140 - 5, area, 'ts tb t2');
      T(g, cx0 + cw / 2, 228, '长', 'ts tm');
      let txt = `周长 ${P}，长 + 宽 = ${P} ÷ 2 = <b>${hf}</b>。现在长 <span class="k1">${L}</span>、宽 <span class="k1">${Wd}</span>，面积 = ${L} × ${Wd} = <span class="k2">${area}</span>。`;
      if (area === maxA) txt += L === Wd ? ' <b>长和宽相等（正方形），面积最大！</b>' : ' <b>长和宽只差 1，已经最接近了，面积最大！</b>';
      else txt += ` 长和宽相差 ${Math.abs(L - Wd)}，再接近一些面积会更大。`;
      read.innerHTML = txt;
    }
    const lenIn = () => c.querySelectorAll('input[type=range]')[1];
    slider(c, 'mmP', '周长', 12, 32, 2, P, (x) => {
      if (busy) return;
      P = x;
      const mx = P / 2 - 1;
      if (L > mx) { L = mx; slL.set(L); }
      lenIn().max = mx;
      render();
    });
    const slL = slider(c, 'mmL', '长', 1, 9, 1, L, (x) => { if (busy) return; L = Math.min(x, P / 2 - 1); slL.set(L); render(); });
    btn(c, '▶ 从细长到方正扫一遍', () => {
      if (busy) return;
      busy = true;
      const mx = P / 2 - 1;
      tween(2600, (t, raw) => { L = Math.max(1, Math.round(lerp(mx, 1, raw))); slL.set(L); render(); }, () => { busy = false; render(); });
    });
    render();
  };

  // ───────── 最值：面积一定，周长何时最短 ─────────
  A.o_maxmin_area = function (el) {
    const W = 420, Hh = 230;
    const svg = stage(el, W, Hh);
    const gCells = S('g', {}, svg), gTop = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let N = 36, pairs = [], idx = 0, cells = [], busy = false;
    function pairsOf(n) { const r = []; for (let w = 1; w * w <= n; w++) if (n % w === 0) r.push([n / w, w]); return r; }
    function layout(pr) {
      const [L, Wd] = pr, cs = Math.min(26, 380 / L, 140 / Wd);
      const ox = (W - L * cs) / 2, oy = 20 + (140 - Wd * cs) / 2;
      return { cs, ox, oy, L, Wd, at: (k) => [ox + (k % L) * cs, oy + Math.floor(k / L) * cs] };
    }
    function build() {
      gCells.innerHTML = '';
      pairs = pairsOf(N); idx = 0;
      cells = [];
      for (let k = 0; k < N; k++) cells.push(S('rect', { class: 'f1s s1 thin' }, gCells));
      place(layout(pairs[0]), layout(pairs[0]), 1);
      over();
    }
    function place(a, b, t) {
      const cs = lerp(a.cs, b.cs, t);
      cells.forEach((cell, k) => {
        const p0 = a.at(k), p1 = b.at(k);
        cell.setAttribute('x', lerp(p0[0], p1[0], t));
        cell.setAttribute('y', lerp(p0[1], p1[1], t));
        cell.setAttribute('width', cs);
        cell.setAttribute('height', cs);
      });
    }
    function over() {
      gTop.innerHTML = '';
      const lay = layout(pairs[idx]), [L, Wd] = pairs[idx], per = 2 * (L + Wd);
      S('rect', { x: lay.ox, y: lay.oy, width: L * lay.cs, height: Wd * lay.cs, class: 'fnone s2 thick' }, gTop);
      const minP = Math.min(...pairs.map(([a, b]) => 2 * (a + b)));
      const sp = W / (pairs.length + 1);
      pairs.forEach(([a, b], i) => {
        const pp = 2 * (a + b);
        T(gTop, sp * (i + 1), 186, `${a}×${b}`, 'ts ' + (i === idx ? 'tb t2' : 'tm'));
        T(gTop, sp * (i + 1), 204, `周长 ${pp}`, 'ts ' + (i === idx ? 'tb t2' : pp === minP ? 'tb t3' : 'tm'));
      });
      T(gTop, W / 2, 224, '所有拼法（绿色是周长最短的）', 'ts tm');
      read.innerHTML = `${N} 个小正方形拼成长 <span class="k1">${L}</span>、宽 <span class="k1">${Wd}</span> 的长方形：面积都是 ${N}，周长 = (${L} + ${Wd}) × 2 = <span class="k2">${per}</span>。` +
        (per === minP ? ' <b>长和宽最接近，周长最短！</b>' : ' 再拼得方正一点，周长还能变短。');
    }
    btn(c, '换一种拼法 →', () => {
      if (busy) return;
      busy = true;
      const a = layout(pairs[idx]);
      idx = (idx + 1) % pairs.length;
      const b = layout(pairs[idx]);
      gTop.innerHTML = '';
      tween(900, (t) => place(a, b, t), () => { busy = false; over(); });
    });
    [12, 16, 24, 36].forEach((n) => btn(c, n + ' 块', () => { if (!busy) { N = n; build(); } }, 'alt'));
    build();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
