// 奥数拓展 olym5 组的动画：等差数列、数字谜、分数裂项、分数巧算、进位制、周期问题
(function () {
  const { S, H, T, tween, lerp, stage, ctrl, btn, slider, RM } = window.AH;
  const A = {};
  const tr = (x, y) => `translate(${x},${y})`;
  const later = (ms, f) => setTimeout(f, RM ? 0 : ms);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const fracTxt = (p, q) => { const g = gcd(p, q); p /= g; q /= g; return q === 1 ? `${p}` : `${p}/${q}`; };
  const frH = (p, q) => { const g = gcd(p, q); p /= g; q /= g; return q === 1 ? `${p}` : window.fr(p, q); };

  // ───────────── 等差数列：台阶柱子（第 n 项 = 首项 + (n − 1) × 公差） ─────────────
  A.o_arith_stairs = function (el) {
    const W = 440, Hh = 270;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 3, d = 2, n = 6, sel = 6, grow = 99, busy = false;
    slider(c, 'oas-a', '首项', 1, 6, 1, a, (v) => { a = v; draw(); });
    slider(c, 'oas-d', '公差', 1, 4, 1, d, (v) => { d = v; draw(); });
    slider(c, 'oas-n', '项数', 3, 10, 1, n, (v) => { n = v; if (sel > n) sel = n; draw(); });
    const c2 = ctrl(el);
    btn(c2, '一项一项长出来', () => {
      if (busy) return;
      busy = true;
      tween(450 * n, (t, raw) => { grow = raw * n; draw(); }, () => { grow = 99; busy = false; draw(); });
    });
    btn(c2, '看最后一项', () => { sel = n; draw(); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：点任意一根柱子，看它是怎样从第 1 根“长”出来的。蓝色是首项，橙、绿交替的每一层是一个公差。');

    function draw() {
      g.innerHTML = '';
      const x0 = 48, base = 226, top = 36;
      const maxV = a + (n - 1) * d;
      const u = Math.min(16, (base - top) / maxV);
      const cw = Math.min(40, (W - x0 - 14) / n), bw = cw * 0.72;
      S('line', { x1: x0 - 6, x2: x0 + n * cw + 4, y1: base, y2: base, class: 'sstrong' }, g);
      S('line', { x1: x0 - 6, x2: x0 + n * cw + 4, y1: base - a * u, y2: base - a * u, class: 'smuted dash' }, g);
      T(g, x0 - 10, base - a * u + 4, '首项', 'ts tm', 'end');
      T(g, x0 - 10, base + 17, '第几项', 'ts tm', 'end');
      for (let i = 0; i < n; i++) {
        const v = a + i * d, f = clamp(grow - i, 0, 1);
        const isSel = i + 1 === sel;
        const col = S('g', { class: 'clickable', opacity: isSel || busy ? 1 : 0.8 }, g);
        const x = x0 + i * cw + (cw - bw) / 2;
        S('rect', { x: x0 + i * cw + 1, y: top - 24, width: cw - 2, height: base - top + 46, rx: 6, class: isSel && !busy ? 'f2s' : 'fsurf', opacity: isSel && !busy ? 0.45 : 0 }, col);
        T(col, x + bw / 2, base + 17, `${i + 1}`, 'ts tm');
        if (f <= 0) continue;
        const shown = Math.ceil(v * f - 1e-9);
        for (let j = 0; j < shown; j++) {
          const part = j < a ? 0 : 1 + Math.floor((j - a) / d);
          const cls = part === 0 ? 'f1s s1 thin' : part % 2 ? 'f2s s2 thin' : 'f3s s3 thin';
          S('rect', { x, y: base - (j + 1) * u, width: bw, height: Math.max(1, u - 1), class: cls }, col);
        }
        T(col, x + bw / 2, base - shown * u - 6, `${v}`, isSel ? 'ts tb t2' : 'ts tb');
        if (isSel && i > 0 && f >= 1) {
          const bx = x + bw + 4;
          S('path', { d: `M${bx},${base - a * u} h4 V${base - v * u} h-4`, class: 's2 fnone' }, g);
        }
        col.addEventListener('click', () => { sel = i + 1; draw(); });
      }
      const k = sel, v = a + (k - 1) * d;
      const list = [];
      for (let i = 0; i < n; i++) list.push(a + i * d);
      if (busy) {
        read.innerHTML = `一项一项长出来：每一根都比前一根多 <span class="k2">${d}</span> 块。`;
      } else {
        read.innerHTML = `这列数：${list.join(', ')}。<br>第 <b>${k}</b> 项 = 首项 <span class="k1">${a}</span> + <span class="k2">${k - 1}</span> 个公差 = ${a} + ${k - 1} × ${d} = <b>${v}</b>。从第 1 项到第 ${k} 项只上了 ${k - 1} 级台阶。`;
      }
    }
    draw();
  };

  // ───────────── 等差数列：高斯求和（正着排 + 倒着排拼成长方形） ─────────────
  A.o_arith_gauss = function (el) {
    const W = 460, Hh = 290;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 1, d = 1, n = 6, st = 0, busy = false;
    slider(c, 'oag-a', '首项', 1, 5, 1, a, (v) => { a = v; if (!busy) st = 0; draw(); });
    slider(c, 'oag-d', '公差', 1, 3, 1, d, (v) => { d = v; if (!busy) st = 0; draw(); });
    slider(c, 'oag-n', '项数', 3, 8, 1, n, (v) => { n = v; if (!busy) st = 0; draw(); });
    const c2 = ctrl(el);
    const mb = btn(c2, '拼起来', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 0.5 ? 0 : 1;
      tween(1300, (t) => { st = lerp(from, to, t); draw(); }, () => { st = to; busy = false; draw(); });
    });

    function draw() {
      g.innerHTML = '';
      const t = (i) => a + i * d;
      const last = t(n - 1), Sm = a + last, span = (n - 1) * d;
      const x0 = 40;
      const u = Math.min(16, (W - x0 - 50) / (Sm + span + 1));
      const gapPx = span * u + Math.max(16, u);
      const rowH = Math.min(28, 196 / n), y0 = 36;
      const R = x0 + Sm * u + gapPx * (1 - st);
      for (let i = 0; i < n; i++) {
        const y = y0 + i * rowH, hh = rowH - 5;
        const tb = t(i), to = t(n - 1 - i);
        for (let j = 0; j < tb; j++) S('rect', { x: x0 + j * u, y, width: u, height: hh, class: 'f1s s1 thin' }, g);
        for (let j = 0; j < to; j++) S('rect', { x: R - (j + 1) * u, y, width: u, height: hh, class: 'f2s s2 thin' }, g);
        T(g, x0 - 7, y + hh / 2 + 5, `${tb}`, 'ts tb t1', 'end');
        T(g, R + 6, y + hh / 2 + 5, `${to}`, 'ts tb t2', 'start');
      }
      const yb = y0 + n * rowH + 4;
      const done = S('g', { opacity: st > 0.95 ? 1 : 0 }, g);
      S('path', { d: `M${x0},${yb} v6 H${x0 + Sm * u} v-6`, class: 'sstrong fnone' }, done);
      T(done, x0 + (Sm * u) / 2, yb + 24, `每行 ${a} + ${last} = ${Sm}`, 'tb');
      T(g, x0, 22, '蓝：正着排', 'ts t1', 'start');
      T(g, W - 10, 22, '橙：倒着排', 'ts t2', 'end');
      mb.textContent = st > 0.5 ? '分开' : '拼起来';
      const list = [];
      for (let i = 0; i < n; i++) list.push(t(i));
      if (st === 0) read.innerHTML = `蓝色楼梯是 ${list.join(' + ')}，一共 ${n} 项。橙色是同一个楼梯倒过来放。点“拼起来”。`;
      else if (st === 1) read.innerHTML = `每一行：蓝 + 橙 = 首项 + 末项 = ${a} + ${last} = <b>${Sm}</b>，一共 ${n} 行。<br>长方形 = ${Sm} × ${n} = ${Sm * n}，这是<b>两个</b>楼梯；一个楼梯 = ${Sm * n} ÷ 2 = <b>${(Sm * n) / 2}</b>。`;
      else read.innerHTML = '橙色楼梯正在滑过去……';
    }
    draw();
  };

  // ───────────── 数字谜：竖式逐位推理 ─────────────
  A.o_digit_column = function (el) {
    const PZ = [
      { name: '加法', op: '+', rows: ['3a6', 'b4c'], res: '812', sol: { a: '6', b: '4', c: '6' }, steps: [
        { col: 0, set: ['c'], mark: [1, '1'], t: '个位：6 + □ 的个位是 2，只能是 6 + 6 = 12。所以 □ = 6，向十位进 1（看十位上方的小字）。' },
        { col: 1, set: ['a'], mark: [2, '1'], t: '十位：□ + 4 + 进上来的 1，个位是 1。□ + 5 = 11，□ = 6，再向百位进 1。' },
        { col: 2, set: ['b'], t: '百位：3 + □ + 进上来的 1 = 8，□ = 4。' },
        { col: -1, t: '验算：366 + 446 = 812 ✓ 全部推出来了！' }] },
      { name: '减法', op: '−', rows: ['8a3', '36b'], res: 'c56', sol: { a: '2', b: '7', c: '4' }, steps: [
        { col: 0, set: ['b'], mark: [1, '借1'], t: '个位：3 减 □ 得 6。3 不够减，向十位借 1，变成 13：13 − □ = 6，□ = 7。' },
        { col: 1, set: ['a'], mark: [2, '借1'], t: '十位：□ 被借走 1，再减 6 得 5。□ − 1 − 6 = 5 要 □ = 12，不可能，所以也向百位借 1：□ + 10 − 1 − 6 = 5，□ = 2。' },
        { col: 2, set: ['c'], t: '百位：8 被借走 1，8 − 1 − 3 = 4，□ = 4。' },
        { col: -1, t: '验算：456 + 367 = 823 ✓' }] },
      { name: '最高位', op: '+', rows: ['a7b', '6c4'], res: '1102', sol: { a: '4', b: '8', c: '2' }, steps: [
        { col: 3, t: '先看最高位：两个三位数相加，最大是 999 + 999 = 1998，所以千位的 1 一定是百位进上来的。' },
        { col: 0, set: ['b'], mark: [1, '1'], t: '个位：□ + 4 的个位是 2，□ = 8（8 + 4 = 12），进 1。' },
        { col: 1, set: ['c'], mark: [2, '1'], t: '十位：7 + □ + 1 的个位是 0，只能等于 10，□ = 2，进 1。' },
        { col: 2, set: ['a'], mark: [3, '1'], t: '百位：□ + 6 + 1 = 11（向千位进 1），□ = 4。' },
        { col: -1, t: '验算：478 + 624 = 1102 ✓' }] },
      { name: '乘法', op: '×', rows: ['a3', '7'], res: '4b1', sol: { a: '6', b: '4' }, steps: [
        { col: 0, mark: [1, '2'], t: '个位：3 × 7 = 21，积的个位写 1，向十位进 2。' },
        { col: 1, set: ['a', 'b'], t: '十位：□ × 7 + 2 要在 40～49 之间。试 5：5 × 7 + 2 = 37，太小；试 6：6 × 7 + 2 = 44，合适；试 7：51，太大。所以 □ = 6，积的十位是 4。' },
        { col: -1, t: '验算：63 × 7 = 441 ✓' }] },
      { name: '汉字谜', op: '+', rows: ['数学', '数学'], res: '1学8', sol: { 数: '7', 学: '4' }, steps: [
        { col: 0, t: '个位：学 + 学 的个位是 8，学可能是 4（4 + 4 = 8），也可能是 9（9 + 9 = 18）。' },
        { col: 1, t: '试 学 = 9：个位进 1，十位 数 + 数 + 1 = 19，数 = 9。可是“数”和“学”是不同的字，不能都是 9，排除！' },
        { col: 1, set: ['学', '数'], t: '试 学 = 4：个位不进位，十位 数 + 数 = 14，数 = 7。' },
        { col: -1, t: '验算：74 + 74 = 148 ✓ 相同的字是相同的数，不同的字是不同的数。' }] }
    ];
    const W = 420, Hh = 236, cell = 42, R = 290;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, si = 0;
    PZ.forEach((p, i) => btn(c, p.name, () => { pi = i; si = 0; draw(); }, 'alt'));
    const c2 = ctrl(el);
    btn(c2, '下一步', () => { if (si < PZ[pi].steps.length) { si++; draw(true); } });
    btn(c2, '重来', () => { si = 0; draw(); }, 'alt');
    const cx = (k) => R - k * cell - cell / 2;

    function draw(anim) {
      g.innerHTML = '';
      const P = PZ[pi];
      const done = P.steps.slice(0, si);
      const known = new Set(), marks = {};
      done.forEach((s) => { (s.set || []).forEach((k) => known.add(k)); if (s.mark) marks[s.mark[0]] = s.mark[1]; });
      const fresh = new Set(si ? PZ[pi].steps[si - 1].set || [] : []);
      const cur = si ? P.steps[si - 1].col : -2;
      const ncol = Math.max(P.res.length, ...P.rows.map((r) => r.length));
      const rowY = (r) => 76 + r * 46;
      const lineY = rowY(P.rows.length - 1) + 20;
      const resY = lineY + 34;
      if (cur >= 0) S('rect', { x: R - (cur + 1) * cell + 2, y: 20, width: cell - 4, height: resY - 6, rx: 8, class: 'f2s', opacity: 0.6 }, g);
      if (cur === -1) S('rect', { x: R - ncol * cell - 30, y: 20, width: ncol * cell + 36, height: resY - 6, rx: 8, class: 'f3s', opacity: 0.5 }, g);
      const put = (ch, k, y) => {
        const x = cx(k);
        const isDigit = /[0-9]/.test(ch);
        if (isDigit) { T(g, x, y, ch, 'tl'); return; }
        S('rect', { x: x - 16, y: y - 25, width: 32, height: 34, rx: 5, class: known.has(ch) ? 'fnone s3 thin' : 'fnone s2 dash' }, g);
        if (known.has(ch)) {
          const tx = T(g, x, y, P.sol[ch], 'tl tb t3');
          if (anim && fresh.has(ch)) { tx.setAttribute('opacity', 0); tween(500, (t) => tx.setAttribute('opacity', t)); }
        } else T(g, x, y, /[a-z]/.test(ch) ? '' : ch, 'tl t2');
      };
      P.rows.forEach((r, ri) => { for (let k = 0; k < r.length; k++) put(r[r.length - 1 - k], k, rowY(ri)); });
      T(g, R - ncol * cell - 14, rowY(P.rows.length - 1), P.op, 'tl tb');
      S('line', { x1: R - ncol * cell - 28, x2: R + 4, y1: lineY, y2: lineY, class: 'sstrong' }, g);
      for (let k = 0; k < P.res.length; k++) put(P.res[P.res.length - 1 - k], k, resY);
      Object.keys(marks).forEach((k) => T(g, cx(+k), 40, marks[k], 'ts tb t2'));
      ['个', '十', '百', '千'].slice(0, ncol).forEach((nm, k) => T(g, cx(k), Hh - 6, nm + '位', 'ts tm'));
      cap.textContent = `第 ${pi + 1} 题：${P.name}`;
      if (!si) read.innerHTML = P.op === '×' ? '方框里的数字看不清了。先从个位开始，点“下一步”。' : (/[a-z]/.test(P.rows.join('')) ? '方框里的数字看不清了。先从个位（或最高位）开始，点“下一步”。' : '相同的汉字代表相同的数字，不同的汉字代表不同的数字。点“下一步”。');
      else read.innerHTML = P.steps[si - 1].t + (si === P.steps.length ? '' : `（第 ${si} 步，共 ${P.steps.length} 步）`);
    }
    draw();
  };

  // ───────────── 数字谜：候选数字 0～9 逐个试、排除 ─────────────
  A.o_digit_try = function (el) {
    const TP = [
      { q: '□ × 7 的个位是 1，□ 是几？', f: (d) => [`${d} × 7 = ${d * 7}`, (d * 7) % 10 === 1] },
      { q: '好 + 好 + 好 = 1好，“好”是几？', f: (d) => [`${d} + ${d} + ${d} = ${3 * d}`, 3 * d === 10 + d] },
      { q: '2△ × 4 = 1○2，△ 是几？', f: (d) => { const p = (20 + d) * 4; return [`2${d} × 4 = ${p}`, p >= 100 && p < 200 && p % 10 === 2]; } },
      { q: '□ × □ 的个位还是 □，□ 可以是几？', f: (d) => [`${d} × ${d} = ${d * d}`, (d * d) % 10 === d] }
    ];
    const W = 440, Hh = 170;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, k = 0, res = [], busy = false, gen = 0;
    TP.forEach((p, i) => btn(c, `第 ${i + 1} 题`, () => { if (busy) return; pi = i; reset(); }, 'alt'));
    const c2 = ctrl(el);
    btn(c2, '一个一个试', () => {
      if (busy || k > 9) return;
      busy = true;
      const my = gen;
      const step = () => {
        if (my !== gen) return;
        if (k > 9) { busy = false; draw(); return; }
        testOne(() => later(260, step));
      };
      step();
    });
    btn(c2, '试下一个', () => { if (!busy && k <= 9) { busy = true; testOne(() => { busy = false; }); } }, 'alt');
    btn(c2, '重来', () => { if (!busy) reset(); }, 'alt');
    const X = (d) => 32 + d * 41.5;
    function reset() { k = 0; res = []; gen++; draw(); }
    function testOne(done) {
      const d = k, my = gen;
      const [txt, ok] = TP[pi].f(d);
      tween(260, (t) => { if (my === gen) drawPointer(lerp(X(Math.max(0, d - 1)), X(d), d ? t : 1)); }, () => {
        if (my !== gen) return;
        res[d] = { txt, ok };
        k++;
        draw();
        done();
      });
    }
    let ptr = null;
    function drawPointer(x) { if (ptr) ptr.setAttribute('transform', tr(x, 36)); }
    function draw() {
      g.innerHTML = '';
      for (let d = 0; d <= 9; d++) {
        const r = res[d];
        const cls = !r ? 'fsurf s1 thin' : r.ok ? 'f3s s3 thick' : 'fsurf2 smuted';
        S('circle', { cx: X(d), cy: 76, r: 17, class: cls }, g);
        T(g, X(d), 82, `${d}`, r && !r.ok ? 'tl tm' : 'tl tb');
        if (r && !r.ok) {
          S('line', { x1: X(d) - 11, y1: 65, x2: X(d) + 11, y2: 87, class: 'smuted' }, g);
          S('line', { x1: X(d) + 11, y1: 65, x2: X(d) - 11, y2: 87, class: 'smuted' }, g);
        }
        if (r && r.ok) T(g, X(d), 112, '✓', 'tl tb t3');
      }
      ptr = S('path', { d: 'M-7,-8 L7,-8 L0,4 Z', class: 'f2' }, g);
      drawPointer(X(Math.min(9, Math.max(0, k - 1))));
      ptr.setAttribute('opacity', k ? 1 : 0);
      const last = res[k - 1];
      if (last) T(g, W / 2, 150, `试 ${k - 1}：${last.txt}　${last.ok ? '符合 ✓' : '不符合 ✗'}`, 'tl ' + (last.ok ? 't3' : 'tm'));
      cap.textContent = TP[pi].q;
      const good = res.map((r, d) => (r && r.ok ? d : -1)).filter((d) => d >= 0);
      if (k === 0) read.innerHTML = '候选的数字是 0～9。点“一个一个试”，不符合的划掉，符合的圈出来。';
      else if (k <= 9) read.innerHTML = `已经试了 ${k} 个数字。目前符合的：${good.length ? good.join('、') : '还没有'}。别停，要全部试完！`;
      else read.innerHTML = good.length === 1 ? `试完了！只有 <b>${good[0]}</b> 符合，答案是唯一的。` : `试完了！符合的有 <b>${good.join('、')}</b>，一共 ${good.length} 个。找到一个就停下的话，就会漏掉别的答案。`;
    }
    draw();
  };

  // ───────────── 分数裂项：1/n 比 1/(n+1) 长出的一小段 ─────────────
  A.o_frac_split_bar = function (el) {
    const W = 440, Hh = 250, x0 = 74, L = 340;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 2, st = 0, fine = false, busy = false;
    slider(c, 'ofsb-n', 'n', 2, 9, 1, n, (v) => { n = v; draw(); });
    const c2 = ctrl(el);
    const cb = btn(c2, '比一比', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 0.5 ? 0 : 1;
      tween(1400, (t) => { st = lerp(from, to, t); draw(); }, () => { st = to; busy = false; draw(); });
    });
    const fb = btn(c2, '分成小格', () => { fine = !fine; draw(); }, 'alt');

    function bar(x, y, w, cls, cells) {
      S('rect', { x, y, width: w, height: 26, rx: 3, class: cls }, g);
      if (fine && cells > 1) for (let i = 1; i < cells; i++) S('line', { x1: x + (w * i) / cells, x2: x + (w * i) / cells, y1: y + 3, y2: y + 23, class: 'sline' }, g);
    }
    function draw() {
      g.innerHTML = '';
      const N = n * (n + 1);
      const wB = L / n, wG = L / (n + 1), wD = wB - wG;
      const s1 = Math.min(1, st * 2), s2 = Math.max(0, st * 2 - 1);
      [x0 + wG, x0 + wB].forEach((x) => S('line', { x1: x, x2: x, y1: 24, y2: 212, class: 'smuted dash thin' }, g));
      bar(x0, 24, L, 'fsurf2 sline', N);
      T(g, x0 - 10, 42, '1', 'tb', 'end');
      bar(x0, 74, wB, 'f1s s1', n + 1);
      T(g, x0 - 10, 92 - 8 * s1, `1/${n}`, 'tb t1', 'end');
      const gy = lerp(124, 74, s1);
      bar(x0, gy, wG, 'f3s s3', n);
      T(g, x0 - 10, gy + 18 + 8 * s1, `1/${n + 1}`, 'tb t3', 'end');
      if (s1 >= 1) {
        const py = lerp(74, 176, s2);
        S('rect', { x: x0 + wG, y: py, width: Math.max(2, wD), height: 26, class: 'f2 s2' }, g);
        if (s2 > 0.5) {
          const lx = clamp(x0 + wG + wD / 2, x0 + 80, W - 100);
          T(g, lx, 230, `1/${n} − 1/${n + 1} = 1/${N}`, 'tb t2');
          T(g, x0 - 10, 194, '差', 'tb t2', 'end');
        }
      }
      cb.textContent = st > 0.5 ? '放回去' : '比一比';
      fb.textContent = fine ? '去掉小格' : '分成小格';
      const f = window.fr;
      let txt;
      if (st === 0) txt = `最上面一条是 1。蓝条是 ${f(1, n)}，绿条是 ${f(1, n + 1)}。点“比一比”，把绿条叠到蓝条上。`;
      else if (st === 1) txt = `蓝条比绿条多出的橙色小段：${f(1, n)} − ${f(1, n + 1)} = ${f(n + 1, N)} − ${f(n, N)} = <b>${f(1, N)}</b>，而 ${N} = ${n} × ${n + 1}。所以 ${f(1, `${n} × ${n + 1}`)} = ${f(1, n)} − ${f(1, n + 1)}。`;
      else txt = '绿条叠上去，看看蓝条多出了多少……';
      if (fine) txt += `<br>把 1 平均分成 ${n} × ${n + 1} = ${N} 小格：蓝条占 ${n + 1} 格，绿条占 ${n} 格，正好差 <b>1 格</b>。`;
      read.innerHTML = txt;
    }
    draw();
  };

  // ───────────── 分数裂项：消消乐 ─────────────
  A.o_frac_split_cancel = function (el) {
    const W = 440;
    const svg = stage(el, W, 340);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 5, sp = 0, k = 0, kt = 0, res = 0, busy = false, gen = 0;
    slider(c, 'ofsc-n', '项数', 2, 8, 1, n, (v) => { n = v; reset(); });
    const c2 = ctrl(el);
    btn(c2, '裂开', () => {
      if (busy || sp >= 1) return;
      busy = true;
      const my = gen;
      tween(800, (t) => { if (my === gen) { sp = t; draw(); } }, () => { if (my === gen) { sp = 1; busy = false; draw(); } });
    });
    btn(c2, '消消乐', () => {
      if (busy || res >= 1) return;
      busy = true;
      const my = gen;
      const step = () => {
        if (my !== gen) return;
        if (k >= n - 1) { tween(800, (t) => { if (my === gen) { res = t; draw(); } }, () => { if (my === gen) { res = 1; busy = false; draw(); } }); return; }
        tween(600, (t) => { if (my === gen) { kt = t; draw(); } }, () => { if (my !== gen) return; k++; kt = 0; draw(); later(150, step); });
      };
      if (sp < 1) tween(800, (t) => { if (my === gen) { sp = t; draw(); } }, () => { if (my === gen) { sp = 1; step(); } });
      else step();
    });
    btn(c2, '重来', () => reset(), 'alt');
    function reset() { gen++; busy = false; sp = 0; k = 0; kt = 0; res = 0; draw(); }

    const XT = 62, XA = 172, XM = 214, XB = 258;
    function draw() {
      g.innerHTML = '';
      const rowH = 38, y0 = 34;
      const yr = y0 + n * rowH + 6;
      const Hh = yr + 92;
      svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
      const cst = (j) => (j <= k ? 1 : j === k + 1 ? kt : 0);
      for (let i = 1; i <= n; i++) {
        const y = y0 + (i - 1) * rowH;
        if (i > 1) T(g, 20, y, '+', 'tl tb');
        T(g, XT, y, `1/${i * (i + 1)}`, 'tl');
        T(g, XT, y + 15, `(${i}×${i + 1})`, 'ts tm');
        if (sp <= 0) continue;
        const sg = S('g', { opacity: sp, transform: tr(lerp(-90, 0, sp), 0) }, g);
        T(sg, 118, y, '=', 'tl');
        T(sg, 140, y, '(', 'tl tm');
        T(sg, 296, y, ')', 'tl tm');
        T(sg, XM, y, '−', 'tl');
        const cA = i === 1 ? 0 : cst(i - 1), cB = i === n ? 0 : cst(i);
        const keepA = i === 1 && res > 0, keepB = i === n && res > 0;
        const ta = T(sg, XA, y, i === 1 ? '1' : `1/${i}`, keepA ? 'tl tb t1' : 'tl');
        const tb = T(sg, XB, y, `1/${i + 1}`, keepB ? 'tl tb t1' : 'tl');
        ta.setAttribute('opacity', 1 - 0.7 * cA);
        tb.setAttribute('opacity', 1 - 0.7 * cB);
        if (cA > 0) S('line', { x1: XA - 20, x2: lerp(XA - 20, XA + 20, cA), y1: y - 5, y2: y - 5, class: 's2 thick' }, sg);
        if (cB > 0) S('line', { x1: XB - 26, x2: lerp(XB - 26, XB + 26, cB), y1: y - 5, y2: y - 5, class: 's2 thick' }, sg);
        if (i < n) {
          const c0 = cst(i);
          if (c0 > 0) {
            S('path', { d: `M${XB - 4},${y + 6} Q${(XA + XB) / 2 + 30},${y + rowH / 2 + 4} ${XA + 6},${y + rowH - 16}`, class: 's2 fnone', opacity: c0 < 1 ? 1 : 0.35 }, g);
            if (c0 < 1) T(g, 330, y + rowH / 2 + 4, `−1/${i + 1} 和 +1/${i + 1} 抵消`, 'ts t2', 'start');
          }
        }
      }
      const rg = S('g', { opacity: res }, g);
      T(rg, 20, yr + 10, `= 1 − 1/${n + 1} = ${n}/${n + 1}`, 'tl tb t1', 'start');
      const bx = 30, bw = 380, by = yr + 34;
      S('rect', { x: bx, y: by, width: bw, height: 22, rx: 3, class: 'fsurf2 sline' }, g);
      S('rect', { x: bx, y: by, width: Math.max(0, (bw * n * res) / (n + 1)), height: 22, rx: 3, class: 'f3s s3' }, g);
      T(g, bx + bw + 4, by + 16, '1', 'ts tm', 'start');
      if (res > 0.9) T(g, bx + bw - bw / (n + 1) / 2, by + 40, `差 1/${n + 1}`, 'ts tb t2');
      const f = window.fr;
      if (sp === 0) read.innerHTML = `要算 ${n} 个分数的和。每个分母都是两个相邻的数相乘。点“裂开”。`;
      else if (k === 0 && kt === 0 && res === 0) read.innerHTML = `每项都裂成了“前一个 − 后一个”。看：第 1 行减 ${f(1, 2)}，第 2 行又加 ${f(1, 2)}……点“消消乐”。`;
      else if (res < 1) read.innerHTML = `一对一对抵消中：已经消掉 ${k} 对……`;
      else read.innerHTML = `中间 ${n - 1} 对全部抵消，只剩第一个数 1 和最后一个 ${f(1, n + 1)}：和 = 1 − ${f(1, n + 1)} = <b>${f(n, n + 1)}</b>。长条也只差最后那一小块 ${f(1, n + 1)}。`;
    }
    draw();
  };

  // ───────────── 分数巧算：提取公因数（同高长方形拼起来） ─────────────
  A.o_frac_trick_factor = function (el) {
    const PS = [
      { lab: '3/7 × 5 + 3/7 × 2', num: 3, den: 7, w1: 5, w2: 2, op: '+' },
      { lab: '3/4 × 99 + 3/4', num: 3, den: 4, w1: 99, w2: 1, op: '+' },
      { lab: '5/8 × 13 − 5/8 × 5', num: 5, den: 8, w1: 13, w2: 5, op: '−' },
      { lab: '0.75 × 7 + 3/4 × 5', num: 3, den: 4, w1: 7, w2: 5, op: '+', dis: '0.75' }
    ];
    const W = 440, Hh = 250, x0 = 56, base = 196, Hf = 140;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, st = 0, busy = false;
    PS.forEach((p, i) => btn(c, p.lab, () => { if (busy) return; pi = i; st = 0; draw(); }, 'alt'));
    const c2 = ctrl(el);
    const mb = btn(c2, '拼起来', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 0.5 ? 0 : 1;
      tween(1200, (t) => { st = lerp(from, to, t); draw(); }, () => { st = to; busy = false; draw(); });
    });

    function draw() {
      g.innerHTML = '';
      const P = PS[pi];
      const fv = `${P.num}/${P.den}`;
      const h = (Hf * P.num) / P.den, top = base - h;
      const plus = P.op === '+';
      const U = plus ? P.w1 + P.w2 : P.w1;
      const gap = 34;
      const u = Math.min(30, (W - x0 - 30 - (plus ? gap : 0)) / U);
      S('line', { x1: x0 - 6, x2: W - 10, y1: base - Hf, y2: base - Hf, class: 'smuted dash thin' }, g);
      T(g, W - 10, base - Hf - 6, '高 = 1', 'ts tm', 'end');
      S('line', { x1: x0 - 6, x2: W - 10, y1: base, y2: base, class: 'sstrong' }, g);
      T(g, x0 - 8, top + h / 2 + 5, fv, 'tb', 'end');
      const grid = (x, w, units) => { if (u >= 7) for (let i = 1; i < units; i++) S('line', { x1: x + i * u, x2: x + i * u, y1: top + 2, y2: base - 2, class: 'sline' }, g); S('rect', { x, y: top, width: w, height: h, class: 'fnone sstrong thin' }, g); };
      const prod = P.num * (plus ? P.w1 + P.w2 : P.w1 - P.w2);
      if (plus) {
        const x2 = x0 + P.w1 * u + gap * (1 - st);
        S('rect', { x: x0, y: top, width: P.w1 * u, height: h, class: 'f1s' }, g);
        S('rect', { x: x2, y: top, width: P.w2 * u, height: h, class: 'f2s' }, g);
        grid(x0, P.w1 * u, P.w1);
        grid(x2, P.w2 * u, P.w2);
        const l1 = P.dis && st < 0.5 ? `${P.dis} × ${P.w1}` : `${fv} × ${P.w1}`;
        T(g, x0 + (P.w1 * u) / 2, top - 8, l1, 'ts tb t1');
        const thin = P.w2 * u < 30, lx2 = thin ? x2 + P.w2 * u + 2 : x2 + (P.w2 * u) / 2, an2 = thin ? 'end' : 'middle';
        T(g, lx2, top - 8, `${fv} × ${P.w2}`, 'ts tb t2', an2);
        T(g, x0 + P.w1 * u + (gap * (1 - st)) / 2, top + h / 2 + 6, '+', 'tl tb').setAttribute('opacity', 1 - st);
        T(g, x0 + (P.w1 * u) / 2, base + 18, `宽 ${P.w1}`, 'ts t1');
        T(g, lx2, base + 18, `宽 ${P.w2}`, 'ts t2', an2);
      } else {
        const keep = P.w1 - P.w2;
        S('rect', { x: x0, y: top, width: keep * u, height: h, class: 'f1s' }, g);
        const cx = x0 + keep * u + st * 30, cy = top - st * 20;
        const cut = S('g', { opacity: 1 - 0.85 * st, transform: tr(cx - (x0 + keep * u), cy - top) }, g);
        S('rect', { x: x0 + keep * u, y: top, width: P.w2 * u, height: h, class: 'f2s s2' }, cut);
        T(cut, x0 + keep * u + (P.w2 * u) / 2, top + h / 2 + 5, `减去 ${fv} × ${P.w2}`, 'ts tb t2');
        grid(x0, keep * u, keep);
        T(g, x0 + (P.w1 * u) / 2, top - 8, `${fv} × ${P.w1}`, 'ts tb t1').setAttribute('opacity', 1 - st);
        T(g, x0 + (keep * u) / 2, base + 18, st > 0.5 ? `宽 ${P.w1} − ${P.w2} = ${keep}` : `宽 ${P.w1}`, 'ts t1');
      }
      if (st > 0.95) {
        const wAll = (plus ? P.w1 + P.w2 : P.w1 - P.w2) * u;
        S('path', { d: `M${x0},${base + 26} v6 H${x0 + wAll} v-6`, class: 'sstrong fnone' }, g);
        T(g, x0 + wAll / 2, base + 48, plus ? `宽 ${P.w1} + ${P.w2} = ${U}` : `宽 ${P.w1 - P.w2}`, 'ts tb');
        T(g, W / 2, 26, `${fv} × ${plus ? U : P.w1 - P.w2} = ${fracTxt(prod, P.den)}`, 'tl tb t3');
      }
      mb.textContent = st > 0.5 ? '拆开' : (plus ? '拼起来' : '剪掉');
      cap.textContent = P.lab.replace(/-/g, '−');
      const f = window.fr;
      const fh = f(P.num, P.den);
      const ans = frH(prod, P.den);
      if (st === 0) {
        if (P.dis) read.innerHTML = `0.75 = ${f(3, 4)}，这两个长方形其实<b>一样高</b>！它们的面积就是两个乘积。点“拼起来”。`;
        else if (plus) read.innerHTML = `每个乘积都是一个长方形：高都是 ${fh}，宽分别是 ${P.w1} 和 ${P.w2}。${P.w2 === 1 ? `后面的 ${fh} 就是 ${fh} × 1，宽是 1，别漏掉它。` : ''}点“拼起来”。`;
        else read.innerHTML = `大长方形高 ${fh}、宽 ${P.w1}，要减去同样高、宽 ${P.w2} 的一块。点“剪掉”。`;
      } else if (st === 1) {
        read.innerHTML = plus
          ? `高一样，拼成一个大长方形：宽 ${P.w1} + ${P.w2} = ${U}，面积 = ${fh} × ${U} = <b>${ans}</b>。这就是 <i>a</i> × <i>b</i> + <i>a</i> × <i>c</i> = <i>a</i> × (<i>b</i> + <i>c</i>)。`
          : `剩下的长方形高还是 ${fh}，宽 ${P.w1} − ${P.w2} = ${P.w1 - P.w2}，面积 = ${fh} × ${P.w1 - P.w2} = <b>${ans}</b>。这就是 <i>a</i> × <i>b</i> − <i>a</i> × <i>c</i> = <i>a</i> × (<i>b</i> − <i>c</i>)。`;
      } else read.innerHTML = '长方形在移动……';
    }
    draw();
  };

  // ───────────── 分数巧算：1/2 + 1/4 + 1/8 + …（补一块） ─────────────
  A.o_frac_trick_half = function (el) {
    const W = 440, Hh = 250, sx = 16, sy = 15, side = 220;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let k = 0, fill = false, pop = 1, busy = false;
    btn(c, '加一项', () => {
      if (busy || k >= 8) return;
      busy = true; fill = false; k++;
      tween(500, (t) => { pop = t; draw(); }, () => { pop = 1; busy = false; draw(); });
    });
    const fb = btn(c, '补一块', () => { if (!busy && k > 0) { fill = !fill; draw(); } }, 'alt');
    btn(c, '重来', () => { if (!busy) { k = 0; fill = false; draw(); } }, 'alt');
    const CL = ['f1s s1 thin', 'f2s s2 thin', 'f3s s3 thin'];

    function draw() {
      g.innerHTML = '';
      let rem = { x: 0, y: 0, w: 1, h: 1 };
      for (let i = 1; i <= k; i++) {
        let p;
        if (i % 2) { p = { x: rem.x, y: rem.y, w: rem.w / 2, h: rem.h }; rem = { x: rem.x + rem.w / 2, y: rem.y, w: rem.w / 2, h: rem.h }; }
        else { p = { x: rem.x, y: rem.y, w: rem.w, h: rem.h / 2 }; rem = { x: rem.x, y: rem.y + rem.h / 2, w: rem.w, h: rem.h / 2 }; }
        const r = S('rect', { x: sx + p.x * side, y: sy + p.y * side, width: p.w * side, height: p.h * side, class: CL[(i - 1) % 3] }, g);
        if (i === k) r.setAttribute('opacity', pop);
        if (Math.min(p.w, p.h) * side >= 26) T(g, sx + (p.x + p.w / 2) * side, sy + (p.y + p.h / 2) * side + 5, `1/${2 ** i}`, i <= 2 ? 'tl tb' : 'ts tb');
      }
      S('rect', { x: sx, y: sy, width: side, height: side, class: 'fnone sstrong' }, g);
      if (k > 0) {
        S('rect', { x: sx + rem.x * side, y: sy + rem.y * side, width: rem.w * side, height: rem.h * side, class: fill ? 'f2 s2' : 'fnone s2 dash', opacity: fill ? 0.55 : 1 }, g);
      }
      const px = 256;
      const pw = 2 ** k;
      if (k === 0) {
        T(g, px, 60, '正方形看作 1', 'tl tb', 'start');
        T(g, px, 90, '点“加一项”开始涂：', 'ts tm', 'start');
        T(g, px, 110, '每次涂剩下的一半', 'ts tm', 'start');
      } else {
        T(g, px, 36, `已经加了 ${k} 项：`, 'ts tm', 'start');
        const terms = [];
        for (let i = 1; i <= k; i++) terms.push(`1/${2 ** i}`);
        const expr = k <= 4 ? terms.join(' + ') : `1/2 + 1/4 + … + 1/${pw}`;
        T(g, px, 62, expr, 'ts tb', 'start');
        T(g, px, 98, `= 1 − 1/${pw}`, 'tl tb t1', 'start');
        T(g, px, 128, `= ${pw - 1}/${pw}`, 'tl tb', 'start');
        T(g, px, 166, `虚线那块还没涂：1/${pw}`, 'ts t2', 'start');
        T(g, px, 186, '和最后一项一样大！', 'ts t2', 'start');
        if (fill) T(g, px, 222, `补上它：${pw - 1}/${pw} + 1/${pw} = 1`, 'ts tb t3', 'start');
      }
      fb.textContent = fill ? '拿走补的那块' : '补一块';
      const f = window.fr;
      if (k === 0) read.innerHTML = '整个正方形是 1。每次都把<b>还没涂的部分</b>涂一半。';
      else read.innerHTML = `${f(1, 2)}${k > 1 ? ' + … + ' + f(1, pw) : ''} = 1 − ${f(1, pw)} = <b>${f(pw - 1, pw)}</b>。没涂的那块正好等于最后一项 ${f(1, pw)}${fill ? '；补上它，正方形就满了，所以和是“1 减最后一项”。' : '。点“补一块”看看。'}`;
    }
    draw();
  };

  // ───────────── 进位制：计数器（满几进一） ─────────────
  A.o_base_counter = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), fx = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let b = 2, dg = [0, 0, 0, 0], total = 0, busy = false, msg = '', carrying = false;
    const NM = { 2: '二', 3: '三', 5: '五', 10: '十' };
    [2, 3, 5, 10].forEach((v) => btn(c, `满 ${v} 进 1`, () => { if (busy) return; b = v; dg = [0, 0, 0, 0]; total = 0; msg = ''; draw(); }, 'alt'));
    const c2 = ctrl(el);
    btn(c2, '+1', () => { if (!busy) { busy = true; plus(330, () => { busy = false; draw(); }); } });
    btn(c2, '数到下一次进位', () => {
      if (busy) return;
      busy = true;
      const go = () => {
        const willCarry = dg[0] === b - 1;
        plus(200, () => { if (willCarry) { busy = false; draw(); } else later(60, go); });
      };
      go();
    });
    btn(c2, '清零', () => { if (!busy) { dg = [0, 0, 0, 0]; total = 0; msg = ''; draw(); } }, 'alt');
    const xc = (p) => 374 - p * 98;
    const slotY = (j) => 192 - j * 15;
    const BC = ['f1 s1 thin', 'f2 s2 thin', 'f3 s3 thin', 'fstrong'];

    function plus(ms, done) {
      msg = '';
      total++;
      addBead(0, xc(0), 40, ms, done);
    }
    function addBead(p, fx0, fy0, ms, done) {
      const n = dg[p];
      const bead = S('circle', { r: 7, cx: fx0, cy: fy0, class: BC[p] }, fx);
      tween(ms, (t) => { bead.setAttribute('cx', lerp(fx0, xc(p), t)); bead.setAttribute('cy', lerp(fy0, slotY(n), t)); }, () => {
        fx.innerHTML = '';
        dg[p]++;
        if (dg[p] === b) { carrying = true; draw(); later(ms * 0.4, () => carry(p, ms, done)); }
        else { carrying = false; draw(); done(); }
      });
    }
    function carry(p, ms, done) {
      if (p === 3) {
        msg = '计数器四位都满了，放不下了，清零重来。';
        carrying = false; dg = [0, 0, 0, 0]; total = 0; draw(); done(); return;
      }
      msg = `这一位满 ${b} 颗了！把这 ${b} 颗换成左边一位的 1 颗。`;
      dg[p] = 0;
      draw();
      const beads = [];
      for (let j = 0; j < b; j++) beads.push(S('circle', { r: 7, cx: xc(p), cy: slotY(j), class: BC[p] }, fx));
      tween(ms * 1.6, (t) => { beads.forEach((bd, j) => { bd.setAttribute('cy', lerp(slotY(j), 46, t)); bd.setAttribute('opacity', 1 - 0.8 * t); }); }, () => {
        fx.innerHTML = '';
        addBead(p + 1, xc(p), 46, ms * 1.4, done);
      });
    }
    function draw() {
      g.innerHTML = '';
      for (let p = 0; p < 4; p++) {
        const x = xc(p);
        T(g, x, 22, `每颗 = ${b ** p}`, 'ts tm');
        S('line', { x1: x, x2: x, y1: 36, y2: 200, class: 'smuted' }, g);
        S('rect', { x: x - 34, y: 200, width: 68, height: 7, rx: 3, class: 'fmuted' }, g);
        for (let j = 0; j < dg[p]; j++) S('circle', { r: 7, cx: x, cy: slotY(j), class: BC[p] }, g);
        T(g, x, 236, `${dg[p]}`, 'txl');
      }
      let hi = 3;
      while (hi > 0 && dg[hi] === 0) hi--;
      let str = '';
      for (let p = hi; p >= 0; p--) str += dg[p];
      const parts = [];
      for (let p = hi; p >= 0; p--) if (dg[p]) parts.push(`${dg[p]} 个 ${b ** p}`);
      const desc = b === 10 ? `十进制的 <b>${str}</b>` : `${NM[b]}进制的 <b>(${str})<sub>${b}</sub></b>`;
      const val = parts.length ? `${parts.join(' + ')} = <b>${total}</b>` : '0';
      if (carrying) { read.innerHTML = msg || `这一位满 ${b} 颗了！`; return; }
      read.innerHTML = (msg ? msg + '<br>' : '') + `满 ${b} 进 1。现在是${desc}，表示 ${val}（十进制）。`;
    }
    draw();
  };

  // ───────────── 进位制：二进制灯泡 ─────────────
  A.o_base_bulbs = function (el) {
    const V = [32, 16, 8, 4, 2, 1];
    const W = 440, Hh = 190;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let on = [0, 0, 1, 0, 1, 1], target = 25, cur = -1, busy = false;
    slider(c, 'obb-t', '十进制数', 1, 63, 1, target, (v) => { target = v; if (!busy) cap.textContent = `要把 ${v} 化成二进制：点“自动拆”。`; });
    btn(c, '自动拆', () => {
      if (busy) return;
      busy = true;
      on = [0, 0, 0, 0, 0, 0];
      let rem = target, i = 0;
      const step = () => {
        if (i >= 6) {
          cur = -1; busy = false;
          cap.textContent = `拆完了：${target} = ${V.filter((v, j) => on[j]).join(' + ')}。`;
          draw(); return;
        }
        cur = i;
        if (rem >= V[i]) { on[i] = 1; cap.textContent = `${rem} 里放得下 ${V[i]}：这盏灯亮（写 1），还剩 ${rem} − ${V[i]} = ${rem - V[i]}。`; rem -= V[i]; }
        else cap.textContent = `${rem} 里放不下 ${V[i]}：这盏灯灭（写 0）。`;
        draw();
        i++;
        later(900, step);
      };
      step();
    });
    btn(c, '全部关掉', () => { if (!busy) { on = [0, 0, 0, 0, 0, 0]; cap.textContent = ''; draw(); } }, 'alt');
    const X = (i) => 46 + i * 70;
    function draw() {
      g.innerHTML = '';
      V.forEach((v, i) => {
        const x = X(i);
        const bg = S('g', { class: 'clickable', tabindex: 0, role: 'button', 'aria-label': `${v} 的灯` }, g);
        T(bg, x, 24, `${v}`, 'tb');
        if (i === cur) S('rect', { x: x - 32, y: 34, width: 64, height: 140, rx: 10, class: 'fnone s1 dash' }, bg);
        if (on[i]) S('circle', { cx: x, cy: 78, r: 30, class: 'f2s' }, bg);
        S('circle', { cx: x, cy: 78, r: 21, class: on[i] ? 'f2 s2' : 'fsurf2 smuted' }, bg);
        S('rect', { x: x - 9, y: 99, width: 18, height: 12, rx: 2, class: 'fmuted' }, bg);
        T(bg, x, 150, on[i] ? '1' : '0', on[i] ? 'txl t2' : 'txl tm');
        const tog = () => { if (busy) return; on[i] = on[i] ? 0 : 1; cap.textContent = ''; draw(); };
        bg.addEventListener('click', tog);
        bg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
      });
      const val = V.reduce((s, v, i) => s + v * on[i], 0);
      const first = on.indexOf(1);
      const bin = first < 0 ? '0' : on.slice(first).join('');
      const parts = V.filter((v, i) => on[i]);
      read.innerHTML = `二进制 <b>(${bin})<sub>2</sub></b> = ${parts.length ? parts.join(' + ') : '0'} = <b>${val}</b>（十进制）。亮是 1，灭是 0。`;
    }
    cap.textContent = '点灯泡开关试试；或者选一个十进制数，点“自动拆”。';
    draw();
  };

  // ───────────── 周期问题：彩灯按周期分组排列 ─────────────
  A.o_cycle_rows = function (el) {
    const PT = [
      { name: '蓝橙绿绿', seq: [1, 2, 3, 3] },
      { name: '蓝橙绿', seq: [1, 2, 3] },
      { name: '橙橙蓝绿蓝', seq: [2, 2, 1, 3, 1] }
    ];
    const CN = { 1: '蓝', 2: '橙', 3: '绿' };
    const W = 440, Hh = 230;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, n = 30, shown = 999, busy = false;
    PT.forEach((p, i) => btn(c, p.name.split('').join('、'), () => { if (busy) return; pi = i; draw(); }, 'alt'));
    const c2 = ctrl(el);
    slider(c2, 'ocr-n', '第几盏', 1, 60, 1, n, (v) => { n = v; draw(); });
    btn(c2, '一组一组数', () => {
      if (busy) return;
      busy = true;
      tween(Math.min(2600, 300 + n * 45), (t, raw) => { shown = raw * n; draw(); }, () => { shown = 999; busy = false; draw(); });
    });

    function draw() {
      g.innerHTML = '';
      const seq = PT[pi].seq, p = seq.length;
      const cols = Math.ceil(n / p);
      const x0 = 34, y0 = 34;
      const cw = Math.min(36, (W - x0 - 10) / cols);
      const rh = Math.min(32, 150 / p);
      const r = Math.min(11, cw * 0.36, rh * 0.36);
      const q = Math.floor(n / p), rm = n % p;
      for (let j = 0; j < p; j++) T(g, x0 - 10, y0 + j * rh + rh / 2 + 4, `${j + 1}`, 'ts tm', 'end');
      T(g, x0 - 10, y0 - 12, '组里第几', 'ts tm', 'start');
      for (let col = 0; col < cols; col++) {
        const full = col < q;
        const vis = Math.min(n, shown) > col * p;
        if (!vis) continue;
        S('rect', { x: x0 + col * cw + 1, y: y0 - 2, width: cw - 2, height: p * rh + 4, rx: 5, class: full ? 'fsurf2 sline' : 'f2s sline' }, g);
        if (cols <= 12 || (col + 1) % 5 === 0 || col === cols - 1) T(g, x0 + col * cw + cw / 2, y0 + p * rh + 18, `${col + 1}`, 'ts tm');
      }
      T(g, W - 10, y0 + p * rh + 36, '下面数字：第几组', 'ts tm', 'end');
      for (let i = 0; i < n; i++) {
        if (i >= shown) break;
        const col = Math.floor(i / p), row = i % p;
        const x = x0 + col * cw + cw / 2, y = y0 + row * rh + rh / 2;
        S('circle', { cx: x, cy: y, r, class: `f${seq[row]}` }, g);
        if (i === n - 1 && shown >= n) {
          S('circle', { cx: x, cy: y, r: r + 5, class: 'fnone sstrong thick' }, g);
        }
      }
      const pos = rm === 0 ? p : rm;
      const color = CN[seq[pos - 1]];
      const cnt = { 1: 0, 2: 0, 3: 0 };
      for (let i = 0; i < n; i++) cnt[seq[i % p]]++;
      const stat = [1, 2, 3].filter((k) => seq.includes(k)).map((k) => `${CN[k]} ${cnt[k]} 盏`).join('、');
      if (busy) { read.innerHTML = `一组 ${p} 盏，一组一组往下数……`; return; }
      read.innerHTML = rm
        ? `每组 ${p} 盏。${n} ÷ ${p} = ${q} …… ${rm}：前面有 ${q} 个完整的组，再往下数 ${rm} 盏，是一组里的第 ${rm} 盏——<b>${color}色</b>。`
        : `每组 ${p} 盏。${n} ÷ ${p} = ${q}，没有余数：正好排满 ${q} 组，第 ${n} 盏是一组里的<b>最后一盏</b>——<b>${color}色</b>。`;
      read.innerHTML += `<br>前 ${n} 盏里：${stat}。`;
    }
    draw();
  };

  // ───────────── 周期问题：星期转盘 ─────────────
  A.o_cycle_week = function (el) {
    const DN = ['一', '二', '三', '四', '五', '六', '日'];
    const W = 440, Hh = 260, cx = 130, cy = 130, R = 96;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    H('span', {}, row, '今天是');
    const sel = H('select', { 'aria-label': '今天星期几' }, row);
    DN.forEach((d, i) => { const o = H('option', { value: i }, sel, '星期' + d); if (i === 2) o.selected = true; });
    const c = ctrl(el);
    let today = 2, n = 100, ang = 0, laps = 0, steps = 0, phase = 0, busy = false;
    sel.addEventListener('change', () => { if (busy) { sel.value = today; return; } today = +sel.value; phase = 0; ang = 0; draw(); });
    slider(c, 'ocw-n', '再过几天', 1, 400, 1, n, (v) => { n = v; if (!busy) { phase = 0; ang = 0; draw(); } });
    const c2 = ctrl(el);
    btn(c2, '出发', () => {
      if (busy) return;
      busy = true;
      const N = n, q = Math.floor(N / 7), r = N % 7;
      phase = 1; laps = 0; steps = 0; ang = 0;
      const stepPhase = () => {
        phase = 2;
        let s = 0;
        const one = () => {
          if (s >= r) { phase = 3; busy = false; draw(); return; }
          const a0 = q * 7 + s;
          tween(380, (t) => { ang = a0 + t; draw(); }, () => { s++; steps = s; ang = q * 7 + s; draw(); later(120, one); });
        };
        one();
      };
      if (q > 0) tween(Math.min(2400, 700 + q * 60), (t) => { ang = 7 * q * t; laps = Math.floor(q * t + 1e-9); draw(); }, () => { laps = q; ang = 7 * q; draw(); later(250, stepPhase); });
      else stepPhase();
    });
    btn(c2, '回到今天', () => { if (!busy) { phase = 0; ang = 0; draw(); } }, 'alt');
    const pos = (i, rad) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; };

    function draw() {
      g.innerHTML = '';
      const q = Math.floor(n / 7), r = n % 7, res = (today + r) % 7;
      S('circle', { cx, cy, r: R, class: 'fnone sline' }, g);
      for (let i = 0; i < 7; i++) {
        const [x, y] = pos(i, R);
        const cls = phase === 3 && i === res ? 'f2 s2' : i === today ? 'f1s s1' : 'fsurf s1 thin';
        S('circle', { cx: x, cy: y, r: 21, class: cls }, g);
        T(g, x, y + 6, DN[i], 'tl tb');
      }
      const [hx, hy] = pos(today + ang, R - 34);
      S('line', { x1: cx, y1: cy, x2: hx, y2: hy, class: 'sstrong thick round' }, g);
      S('circle', { cx: hx, cy: hy, r: 7, class: 'f2' }, g);
      S('circle', { cx, cy, r: 5, class: 'fstrong' }, g);
      const px = 262;
      T(g, px, 44, `今天星期${DN[today]}，再过 ${n} 天`, 'ts tm', 'start');
      T(g, px, 78, `${n} ÷ 7 = ${q} …… ${r}`, 'tl tb', 'start');
      if (phase >= 1) T(g, px, 116, `转了 ${phase === 1 ? laps : q} 整圈`, 'tl t1', 'start');
      if (phase >= 1) T(g, px, 136, '（还是星期' + DN[today] + '）', 'ts tm', 'start');
      if (phase >= 2) T(g, px, 170, `再走 ${steps} 天`, 'tl t2', 'start');
      if (phase === 3) T(g, px, 210, `是星期${DN[res]}`, 'txl t2', 'start');
      if (phase === 0) read.innerHTML = `星期 7 天一转。点“出发”，指针每过一天走一格。`;
      else if (phase < 3) read.innerHTML = phase === 1 ? `每转一整圈正好 7 天，又回到星期${DN[today]}……` : `整圈转完了，再往后走余下的 ${r} 天……`;
      else read.innerHTML = `${n} ÷ 7 = ${q} …… ${r}：转 ${q} 整圈回到星期${DN[today]}，再往后走 ${r} 天，是<b>星期${DN[res]}</b>。${r === 0 ? '余数是 0，正好整周，还是同一天。' : ''}`;
    }
    draw();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
