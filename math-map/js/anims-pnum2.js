// pnum2 组动画：小学 数与代数 第二部分（分数、简易方程、比、百分数、负数）
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, svgPoint, RM } = window.AH;
  const A = {};

  const fr = (a, b) => window.fr(a, b);
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  // 化成最简分数（HTML）；分母是 1 时只写整数
  const frS = (a, b) => {
    const g = gcd(a, b);
    a /= g; b /= g;
    return b === 1 ? String(a) : fr(a, b);
  };
  // 假分数写成带分数（HTML）
  const mixed = (a, b) => {
    const q = Math.floor(a / b), r = a % b;
    if (r === 0) return String(q);
    return (q ? String(q) : '') + frS(r, b);
  };
  const later = (ms, fn) => setTimeout(fn, RM ? 0 : ms);
  // SVG 里的竖式分数，y 是分数线的位置
  function sfrac(parent, x, y, a, b, cls) {
    const g = S('g', {}, parent);
    const big = /tl/.test(cls || '');
    const w = Math.max(String(a).length, String(b).length) * (big ? 11 : 9) + 8;
    T(g, x, y - (big ? 7 : 5), String(a), cls || 'tb');
    S('line', { x1: x - w / 2, x2: x + w / 2, y1: y, y2: y, class: 'sstrong thin' }, g);
    T(g, x, y + (big ? 20 : 16), String(b), cls || 'tb');
    return g;
  }
  function makeSelect(row, label, items, value) {
    if (label) H('span', {}, row, label);
    const sel = H('select', { 'aria-label': label || '选择' }, row);
    items.forEach((t, i) => H('option', { value: i }, sel, t));
    sel.value = String(value || 0);
    return sel;
  }

  // ════════════════════ n_frac：分数的意义和性质 ════════════════════

  // ── 分数基本性质：长条再细分、合并（约分） ──
  A.n_frac_split = function (el) {
    const W = 440, Hh = 180, x0 = 30, bw = 380, y0 = 44, bh = 60, yR = 140;
    const svg = stage(el, W, Hh);
    T(svg, x0, 28, '这一整条是单位“1”', 'note', 'start');
    const lab = T(svg, x0 + bw, 28, '', 'tb t2', 'end');
    const gFill = S('g', {}, svg);
    const gTxt = S('g', {}, svg);
    const gCut = S('g', {}, svg);
    S('rect', { x: x0, y: y0, width: bw, height: bh, class: 'fnone sstrong' }, svg);
    T(svg, x0, yR - 8, '开始时涂色部分的长度：', 'note', 'start');
    const ref = S('rect', { x: x0, y: yR, height: 14, rx: 3, class: 'f2s s2' }, svg);
    const guide = S('line', { y1: y0 - 8, y2: yR + 22, class: 'guide' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const START = [[1, 2], [2, 3], [3, 4], [4, 8], [6, 9], [8, 12]];
    const sel = makeSelect(row, '开始的分数：', START.map(([p, q]) => `${p}/${q}`), 0);
    const c = ctrl(el);
    let a0 = 1, b0 = 2, a = 1, b = 2, busy = false, msg = '', cur = 0;
    btn(c, '每份切成 2 份', () => split(2));
    btn(c, '每份切成 3 份', () => split(3));
    btn(c, '每 2 份合成 1 份', () => merge(2), 'alt');
    btn(c, '每 3 份合成 1 份', () => merge(3), 'alt');
    sel.addEventListener('change', () => {
      if (busy) { sel.value = String(cur); return; }
      cur = +sel.value;
      a0 = a = START[cur][0]; b0 = b = START[cur][1]; msg = '';
      draw();
    });

    function draw() {
      gFill.innerHTML = ''; gTxt.innerHTML = ''; gCut.innerHTML = '';
      const w = bw / b;
      S('rect', { x: x0, y: y0, width: w * a, height: bh, class: 'f2' }, gFill);
      for (let i = 1; i < b; i++) S('line', { x1: x0 + i * w, x2: x0 + i * w, y1: y0, y2: y0 + bh, class: 'sstrong' }, gCut);
      if (w >= 30) for (let i = 0; i < b; i++) T(gTxt, x0 + i * w + w / 2, y0 + bh / 2 + 5, `1/${b}`, 'ts' + (i < a ? ' tw' : ''));
      lab.textContent = `涂色部分：${a}/${b}`;
      ref.setAttribute('width', (bw * a0) / b0);
      const gx = x0 + (bw * a) / b;
      guide.setAttribute('x1', gx); guide.setAttribute('x2', gx);
      let txt;
      if (a === a0 && b === b0) {
        txt = `涂色部分是 ${fr(a, b)}。点上面的按钮，把每一份再切小，或者把几份合成一份，看看涂色部分的长度会不会变。`;
      } else {
        let rel;
        if (b % b0 === 0) rel = `${fr(a0, b0)} 的分子、分母<b>同时乘 ${b / b0}</b>，得到 ${fr(a, b)}。`;
        else if (b0 % b === 0) rel = `${fr(a0, b0)} 的分子、分母<b>同时除以 ${b0 / b}</b>，得到 ${fr(a, b)}。`;
        else rel = `${fr(a0, b0)} 变成了 ${fr(a, b)}。`;
        txt = rel + ` 橙色虚线没有动，涂色部分一样长，所以 <b>${fr(a0, b0)} = ${fr(a, b)}</b>。`;
      }
      if (gcd(a, b) === 1) txt += ` ${fr(a, b)} 的分子、分母只有公因数 1，是<b>最简分数</b>。`;
      read.innerHTML = (msg ? `<span class="k2">${msg}</span><br>` : '') + txt;
    }
    function split(k) {
      if (busy) return;
      if (b * k > 24) { msg = '份数太多，切不下了。先合并一下吧。'; draw(); return; }
      busy = true; msg = '';
      const nb = b * k, w = bw / nb, lines = [];
      for (let j = 1; j < nb; j++) {
        if (j % k) lines.push(S('line', { x1: x0 + j * w, x2: x0 + j * w, y1: y0, y2: y0, class: 's1' }, gCut));
      }
      gTxt.innerHTML = '';
      tween(700, (t) => lines.forEach((l) => l.setAttribute('y2', y0 + bh * t)), () => {
        a *= k; b = nb; busy = false; draw();
      });
    }
    function merge(k) {
      if (busy) return;
      if (b % k || a % k) {
        msg = b % k ? `${b} 份不能每 ${k} 份正好合成一组。` : `涂色的 ${a} 份不能每 ${k} 份正好合成一组。`;
        draw(); return;
      }
      busy = true; msg = '';
      const lines = [...gCut.children].filter((_, i) => (i + 1) % k !== 0);
      gTxt.innerHTML = '';
      tween(700, (t) => lines.forEach((l) => l.setAttribute('opacity', 1 - t)), () => {
        a /= k; b /= k; busy = false; draw();
      });
    }
    draw();
  };

  // ── 分数单位；真分数、假分数、带分数 ──
  A.n_frac_pieces = function (el) {
    const W = 440, Hh = 206, x0 = 60, bw = 360, bh = 42;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const sel = makeSelect(row, '把 1 平均分成', ['2 份', '3 份', '4 份', '5 份', '6 份'], 2);
    const c = ctrl(el);
    let d = 4, n = 3, busy = false, msg = '';
    btn(c, '+ 1 份', () => add());
    btn(c, '− 1 份', () => { if (busy) return; if (n > 0) n--; msg = ''; draw(); }, 'alt');
    btn(c, '清空', () => { if (busy) return; n = 0; msg = ''; draw(); }, 'alt');
    sel.addEventListener('change', () => { if (busy) return; d = +sel.value + 2; n = Math.min(n, 3 * d); msg = ''; draw(); });
    let cells = [];
    function draw() {
      g.innerHTML = ''; cells = [];
      const w = bw / d;
      for (let r = 0; r < 3; r++) {
        const y = 14 + r * 64;
        T(g, x0 - 12, y + bh / 2 + 6, '1', 'tb tm', 'end');
        for (let i = 0; i < d; i++) {
          const idx = r * d + i;
          const on = idx < n;
          const rc = S('rect', { x: x0 + i * w, y, width: w, height: bh, class: on ? 'f2' : 'fsurf' }, g);
          cells.push(rc);
          T(g, x0 + i * w + w / 2, y + bh / 2 + 5, `1/${d}`, 'ts' + (on ? ' tw' : ' tm'));
        }
        for (let i = 1; i < d; i++) S('line', { x1: x0 + i * w, x2: x0 + i * w, y1: y, y2: y + bh, class: 'sstrong thin' }, g);
        S('rect', { x: x0, y, width: bw, height: bh, class: 'fnone sstrong' }, g);
      }
      say();
    }
    function say() {
      const u = fr(1, d);
      const q = Math.floor(n / d), r = n % d;
      let kind;
      if (n === 0) kind = '还没有涂色。点“+ 1 份”，一份一份地涂。';
      else if (n < d) kind = `${fr(n, d)} 比 1 小，分子比分母小，叫<b>真分数</b>。`;
      else if (n === d) kind = `${fr(n, d)} 正好涂满一整条，等于 1。分子和分母相等，它是<b>假分数</b>。`;
      else if (r === 0) kind = `${fr(n, d)} 涂满了 ${q} 整条，等于 ${q}。分子比分母大，它是<b>假分数</b>。`;
      else kind = `${fr(n, d)} 比 1 大，分子比分母大，叫<b>假分数</b>。它涂满了 ${q} 整条，还多 ${fr(r, d)}，可以写成<b>带分数</b> ${q}${fr(r, d)}。`;
      read.innerHTML = (msg ? `<span class="k2">${msg}</span><br>` : '') +
        `每条都是 1，平均分成 ${d} 份，每份是 ${u}。${u} 叫这些分数的<b>分数单位</b>。` +
        (n ? `涂了 ${n} 个 ${u}。<br>` : '<br>') + kind;
    }
    function add() {
      if (busy) return;
      if (n >= 3 * d) { msg = '三条都涂满啦。'; say(); return; }
      busy = true; msg = '';
      n++;
      draw();
      const rc = cells[n - 1];
      const drop = S('rect', { x: rc.getAttribute('x'), y: rc.getAttribute('y'), width: rc.getAttribute('width'), height: bh, class: 'f2 s2' }, g);
      rc.setAttribute('class', 'fsurf');
      tween(420, (t) => {
        drop.setAttribute('transform', `translate(0,${-40 * (1 - t)})`);
        drop.setAttribute('opacity', t);
      }, () => { drop.remove(); rc.setAttribute('class', 'f2'); busy = false; });
    }
    draw();
  };

  // ════════════════════ n_fracop：分数加减法 ════════════════════

  // ── 通分：两条长条重新切成同样大的份，再加减 ──
  A.n_fracop_common = function (el) {
    const W = 440, Hh = 200, x0 = 40, bw = 370, bh = 44, yT = 40, yB = 136;
    const svg = stage(el, W, Hh);
    const gF = S('g', {}, svg), gM = S('g', {}, svg), gC = S('g', {}, svg);
    S('rect', { x: x0, y: yT, width: bw, height: bh, class: 'fnone sstrong' }, svg);
    S('rect', { x: x0, y: yB, width: bw, height: bh, class: 'fnone sstrong' }, svg);
    const labT = T(svg, x0, yT - 10, '', 'tb t1', 'start');
    const labB = T(svg, x0, yB - 10, '', 'tb t2', 'start');
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const PAIRS = [[1, 2, 1, 3], [1, 2, 1, 4], [2, 3, 1, 4], [3, 4, 1, 6], [1, 2, 2, 5], [1, 3, 1, 6]];
    const sel = makeSelect(row, '算式：', PAIRS.map(([a, b, c2, d]) => `${a}/${b} 和 ${c2}/${d}`), 0);
    const c = ctrl(el);
    let P = PAIRS[0], L = 6, common = false, busy = false, run = 0;
    btn(c, '① 通分：切成一样大的份', () => { if (busy) return; const my = ++run; doCommon(my, () => { busy = false; }); });
    btn(c, '② 加起来', () => op('add'));
    btn(c, '② 相减', () => op('sub'));
    btn(c, '重来', () => reset(), 'alt');
    sel.addEventListener('change', () => reset());

    function reset() {
      run++; busy = false; common = false;
      P = PAIRS[+sel.value];
      L = lcm(P[1], P[3]);
      draw();
      const [a, b, c2, d] = P;
      read.innerHTML = `蓝条涂了 ${fr(a, b)}，橙条涂了 ${fr(c2, d)}。看竖线：两条的“每一份”不一样大，不能直接数份数相加。先点“通分”。`;
    }
    function cuts(y, n, cls) {
      for (let i = 1; i < n; i++) {
        const x = x0 + (bw * i) / n;
        S('line', { x1: x, x2: x, y1: y, y2: y + bh, class: cls }, gC);
      }
    }
    function draw() {
      const [a, b, c2, d] = P;
      gF.innerHTML = ''; gC.innerHTML = ''; gM.innerHTML = '';
      S('rect', { x: x0, y: yT, width: (bw * a) / b, height: bh, class: 'f1' }, gF);
      S('rect', { x: x0, y: yB, width: (bw * c2) / d, height: bh, class: 'f2' }, gF);
      cuts(yT, common ? L : b, 'sstrong thin');
      cuts(yB, common ? L : d, 'sstrong thin');
      labT.textContent = common ? `${a}/${b} = ${(a * L) / b}/${L}` : `${a}/${b}`;
      labB.textContent = common ? `${c2}/${d} = ${(c2 * L) / d}/${L}` : `${c2}/${d}`;
    }
    function doCommon(my, cb) {
      if (common) { cb(); return; }
      busy = true;
      const [a, b, c2, d] = P;
      const nl = [];
      for (let i = 1; i < L; i++) {
        const x = x0 + (bw * i) / L;
        if ((i * b) % L) { const l = S('line', { x1: x, x2: x, y1: yT, y2: yT, class: 's3' }, gC); l._y = yT; nl.push(l); }
        if ((i * d) % L) { const l = S('line', { x1: x, x2: x, y1: yB, y2: yB, class: 's3' }, gC); l._y = yB; nl.push(l); }
      }
      tween(800, (t) => nl.forEach((l) => l.setAttribute('y2', l._y + bh * t)), () => {
        if (my !== run) return;
        common = true;
        draw();
        read.innerHTML = `两条都切成 ${L} 份，每一份都是 ${fr(1, L)}，一样大了：${fr(a, b)} = ${fr((a * L) / b, L)}，${fr(c2, d)} = ${fr((c2 * L) / d, L)}。${L} 是 ${b} 和 ${d} 的最小公倍数。现在可以加减了。`;
        later(300, () => { if (my === run) cb(); });
      });
    }
    function op(kind) {
      if (busy) return;
      const my = ++run;
      busy = true;
      doCommon(my, () => {
        busy = true;
        draw();
        const [a, b, c2, d] = P;
        const wA = (bw * a) / b, wB = (bw * c2) / d;
        const mv = S('rect', { x: x0, y: yB, width: wB, height: bh, class: 'f2' }, gM);
        const tx = kind === 'add' ? wA : 0;
        tween(900, (t) => mv.setAttribute('transform', `translate(${tx * t},${(yT - yB) * t})`), () => {
          if (my !== run) return;
          const A1 = (a * L) / b, C1 = (c2 * L) / d;
          if (kind === 'add') {
            const s = A1 + C1;
            read.innerHTML = `橙色接在蓝色后面：${A1} 个 ${fr(1, L)} 加 ${C1} 个 ${fr(1, L)}，一共 ${s} 个。<br>` +
              `<b>${fr(a, b)} + ${fr(c2, d)} = ${fr(A1, L)} + ${fr(C1, L)} = ${fr(s, L)}${gcd(s, L) > 1 ? ' = ' + frS(s, L) : ''}</b>`;
            busy = false;
          } else {
            mv.setAttribute('class', 'f2s s2');
            const rest = S('rect', { x: x0 + wB, y: yT, width: wA - wB, height: bh, class: 'f3', opacity: 0 }, gM);
            tween(400, (t) => rest.setAttribute('opacity', t), () => {
              if (my !== run) return;
              const s = A1 - C1;
              read.innerHTML = `从蓝色里去掉和橙色一样长的部分，剩下<span class="k3">绿色</span>：${A1} 个 ${fr(1, L)} 减 ${C1} 个，剩 ${s} 个。<br>` +
                `<b>${fr(a, b)} − ${fr(c2, d)} = ${fr(A1, L)} − ${fr(C1, L)} = ${fr(s, L)}${gcd(s, L) > 1 ? ' = ' + frS(s, L) : ''}</b>`;
              busy = false;
            });
          }
        });
      });
    }
    reset();
  };

  // ── 找公分母：排出两个分母的倍数，找最小公倍数 ──
  A.n_fracop_lcm = function (el) {
    const W = 460, Hh = 170, cw = 40, gap = 4, xs = 12;
    const svg = stage(el, W, Hh);
    const lab1 = T(svg, xs, 30, '', 'tb t1', 'start');
    const lab2 = T(svg, xs, 106, '', 'tb t2', 'start');
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const nums = [2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);
    const s1 = makeSelect(row, '分母一：', nums, 2);
    const s2 = makeSelect(row, '分母二：', nums, 4);
    const c = ctrl(el);
    let m = 4, n = 6, busy = false, run = 0, chips = [[], []];
    btn(c, '从小到大一个一个找', () => scan());
    btn(c, '重来', () => reset(), 'alt');
    s1.addEventListener('change', () => reset());
    s2.addEventListener('change', () => reset());
    const cx = (k) => xs + (k - 1) * (cw + gap) + cw / 2;
    function draw() {
      g.innerHTML = ''; chips = [[], []];
      [m, n].forEach((d, r) => {
        const y = r ? 116 : 40;
        for (let k = 1; k <= 10; k++) {
          const cg = S('g', { transform: `translate(${cx(k) - cw / 2},${y})` }, g);
          const rc = S('rect', { width: cw, height: 30, rx: 6, class: 'fsurf sline' }, cg);
          T(cg, cw / 2, 20, String(d * k), 'tb');
          chips[r].push({ v: d * k, k, rc });
        }
      });
      lab1.textContent = `${m} 的倍数：`;
      lab2.textContent = `${n} 的倍数：`;
    }
    function reset() {
      run++; busy = false;
      m = +s1.value + 2; n = +s2.value + 2;
      draw();
      read.innerHTML = `${fr(1, m)} 和 ${fr(1, n)} 通分，要找一个既是 ${m} 的倍数、又是 ${n} 的倍数的数。点“一个一个找”，从小到大找第一个两行都有的数。`;
    }
    function scan() {
      if (busy) return;
      const my = ++run;
      busy = true;
      draw();
      const L = lcm(m, n);
      const vals = [...new Set(chips[0].concat(chips[1]).map((ch) => ch.v).filter((v) => v <= L))].sort((p, q) => p - q);
      let i = 0;
      const step = () => {
        if (my !== run) return;
        const v = vals[i++];
        const hits = [0, 1].map((r) => chips[r].find((ch) => ch.v === v));
        if (v === L) {
          hits.forEach((h) => h.rc.setAttribute('class', 'f3s s3 thick'));
          S('line', { x1: cx(hits[0].k), y1: 72, x2: cx(hits[1].k), y2: 114, class: 's3 dash' }, g);
          let note = '';
          if (L === m * n && m !== n) note = `${m} 和 ${n} 只有公因数 1，最小公倍数就是它们的乘积 ${m} × ${n} = ${L}。`;
          else if (L === Math.max(m, n)) note = `${Math.max(m, n)} 是 ${Math.min(m, n)} 的倍数，所以最小公倍数就是 ${Math.max(m, n)}。`;
          read.innerHTML = `找到了！<b>${L}</b> 两行都有，它是 ${m} 和 ${n} 的<b>最小公倍数</b>。${note}<br>` +
            `通分时用 ${L} 作公分母：${fr(1, m)} = ${fr(L / m, L)}，${fr(1, n)} = ${fr(L / n, L)}。`;
          busy = false;
          return;
        }
        hits.forEach((h, r) => { if (h) h.rc.setAttribute('class', r ? 'f2s s2' : 'f1s s1'); });
        read.innerHTML = `${v} 只在一行里有，不是公倍数……继续找。`;
        later(500, step);
      };
      step();
    }
    reset();
  };

  // ════════════════════ n_eq0：简易方程 ════════════════════

  // ── 天平：两边同时拿走、放入、平均分 ──
  A.n_eq0_balance = function (el) {
    const W = 440, Hh = 270, cx = 220, cy = 92, L = 150;
    const svg = stage(el, W, Hh);
    S('polygon', { points: `${cx},${cy} ${cx - 34},${Hh - 16} ${cx + 34},${Hh - 16}`, class: 'fsurf2 sstrong round' }, svg);
    S('line', { x1: cx - 110, x2: cx + 110, y1: Hh - 16, y2: Hh - 16, class: 'sstrong thick round' }, svg);
    const eqT = T(svg, cx, 24, '', 'tl tb');
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const PROBS = [
      { nx: 1, a: 3, b: 8, x: 5, t: 'x + 3 = 8' },
      { nx: 1, a: 5, b: 9, x: 4, t: 'x + 5 = 9' },
      { nx: 2, a: 1, b: 7, x: 3, t: '2x + 1 = 7' },
      { nx: 3, a: 0, b: 12, x: 4, t: '3x = 12' },
      { nx: 2, a: 4, b: 10, x: 3, t: '2x + 4 = 10' }
    ];
    const sel = makeSelect(row, '方程：', PROBS.map((p) => p.t), 0);
    const c = ctrl(el);
    let p = PROBS[0], nx = 1, a = 3, b = 8, busy = false, run = 0, msg = '';
    btn(c, '两边各拿走 1 个砝码', () => takeBoth());
    btn(c, '两边各放上 1 个砝码', () => addBoth(), 'alt');
    btn(c, '两边都平均分', () => divideBoth());
    btn(c, '只拿走左边 1 个（会怎样？）', () => onlyLeft(), 'alt');
    sel.addEventListener('change', () => reset());
    H('p', { class: 'anim-tip' }, el, '蓝色盒子里装着同样重的东西，重量是 x；橙色小方块是 1 克的砝码。');

    function eqStr() {
      return `${nx === 1 ? '' : nx}x${a ? ' + ' + a : ''} = ${b}`;
    }
    function render(th) {
      g.innerHTML = '';
      const co = Math.cos(th), si = Math.sin(th);
      const lx = cx - L * co, ly = cy - L * si, rx = cx + L * co, ry = cy + L * si;
      S('line', { x1: lx, y1: ly, x2: rx, y2: ry, class: 'sstrong thick round' }, g);
      S('circle', { cx, cy, r: 6, class: 'fstrong' }, g);
      return { L: pan(lx, ly, nx, a), R: pan(rx, ry, 0, b) };
    }
    function pan(px, py, boxes, ones) {
      const drop = 72, base0 = py + drop;
      S('line', { x1: px, y1: py, x2: px - 62, y2: base0, class: 'smuted' }, g);
      S('line', { x1: px, y1: py, x2: px + 62, y2: base0, class: 'smuted' }, g);
      S('path', { d: `M${px - 70},${base0} h140 l-12,10 h-116 Z`, class: 'fsurf2 sstrong round' }, g);
      const items = { boxes: [], ones: [] };
      let base = base0;
      for (let i = 0; i < boxes; i++) {
        const gx = px - (boxes * 34) / 2 + i * 34 + 2, gy = base - 31;
        const it = S('g', { transform: `translate(${gx},${gy})` }, g);
        it._x = gx; it._y = gy;
        S('rect', { width: 30, height: 30, rx: 4, class: 'f1s s1' }, it);
        T(it, 15, 20, 'x', 'tb ital');
        items.boxes.push(it);
      }
      if (boxes) base -= 32;
      for (let i = 0; i < ones; i++) {
        const r = Math.floor(i / 6), k = i % 6, inRow = Math.min(6, ones - r * 6);
        const gx = px - (inRow * 20) / 2 + k * 20 + 1, gy = base - 19 - r * 20;
        const it = S('g', { transform: `translate(${gx},${gy})` }, g);
        it._x = gx; it._y = gy;
        S('rect', { width: 18, height: 18, rx: 3, class: 'f2s s2' }, it);
        T(it, 9, 13, '1', 'ts tb');
        items.ones.push(it);
      }
      return items;
    }
    const tiltOf = () => Math.max(-0.22, Math.min(0.22, (b - (nx * p.x + a)) * 0.06));
    function lift(items, up, t) {
      items.forEach((it) => {
        const dy = up ? -50 * t : -50 * (1 - t);
        it.setAttribute('transform', `translate(${it._x},${it._y + dy})`);
        it.setAttribute('opacity', up ? 1 - t : t);
      });
    }
    function say() {
      eqT.textContent = eqStr();
      let txt;
      if (nx === 1 && a === 0) {
        txt = `左边只剩 1 个 <i>x</i>，右边是 ${b} 克，天平平衡，所以 <b><i>x</i> = ${b}</b>。<br>` +
          `检验：把 ${b} 放回原方程，${p.nx === 1 ? b : p.nx + ' × ' + b}${p.a ? ' + ' + p.a : ''} = ${p.b}，左右相等，对了！`;
      } else if (a > 0) {
        txt = `现在：<b>${eqStr().replace(/x/g, '<i>x</i>')}</b>。天平是平的，两边一样重。想让左边只剩 <i>x</i>，先把左边的砝码拿走，右边也要拿走同样多。`;
      } else {
        txt = `现在：<b>${eqStr().replace(/x/g, '<i>x</i>')}</b>。左边有 ${nx} 个 <i>x</i>，点“两边都平均分”，两边都分成 ${nx} 份，各留一份。`;
      }
      read.innerHTML = (msg ? `<span class="k2">${msg}</span><br>` : '') + txt;
      msg = '';
    }
    function reset() {
      run++; busy = false;
      p = PROBS[+sel.value];
      nx = p.nx; a = p.a; b = p.b;
      render(0); say();
    }
    function takeBoth() {
      if (busy) return;
      if (a === 0) { msg = '左边已经没有砝码可拿了。'; say(); return; }
      busy = true;
      const my = run;
      const refs = render(0);
      const its = [refs.L.ones[a - 1], refs.R.ones[b - 1]];
      tween(600, (t) => lift(its, true, t), () => {
        if (my !== run) return;
        a--; b--; busy = false;
        msg = '左右两边同时减去 1，天平还是平的。';
        render(0); say();
      });
    }
    function addBoth() {
      if (busy) return;
      if (a >= 6 || b >= 15) { msg = '盘子快放不下了。'; say(); return; }
      busy = true;
      const my = run;
      a++; b++;
      const refs = render(0);
      const its = [refs.L.ones[a - 1], refs.R.ones[b - 1]];
      lift(its, false, 0);
      tween(600, (t) => lift(its, false, t), () => {
        if (my !== run) return;
        busy = false;
        msg = '左右两边同时加上 1，天平还是平的。不过这样离答案更远了，再拿走吧。';
        say();
      });
    }
    function divideBoth() {
      if (busy) return;
      if (nx === 1) { msg = '左边只有 1 个 x，不用再分了。'; say(); return; }
      if (a > 0) { msg = '先把左边的砝码拿走，让左边只剩下 x，再平均分。'; say(); return; }
      busy = true;
      const my = run, k = nx, nb = b / nx;
      const refs = render(0);
      const gone = refs.L.boxes.slice(1).concat(refs.R.ones.slice(nb));
      tween(800, (t) => lift(gone, true, t), () => {
        if (my !== run) return;
        nx = 1; b = nb; busy = false;
        msg = `左右两边同时除以 ${k}：${k} 个 x 留下 1 个，${k * nb} 克留下 ${nb} 克。`;
        render(0); say();
      });
    }
    function onlyLeft() {
      if (busy) return;
      if (a === 0) { msg = '左边没有砝码了，换一个方程试试。'; say(); return; }
      busy = true;
      const my = run;
      const refs = render(0);
      const it = refs.L.ones[a - 1];
      tween(500, (t) => lift([it], true, t), () => {
        if (my !== run) return;
        a--;
        const th = tiltOf();
        read.innerHTML = '<span class="k2">天平歪了！</span>只在一边拿走，两边就不一样重了，等式不成立。';
        tween(600, (t) => render(th * t), () => later(1100, () => {
          if (my !== run) return;
          a++;
          tween(600, (t) => render(th * (1 - t)), () => {
            if (my !== run) return;
            busy = false;
            msg = '放回去，又平衡了。记住：两边要同时做一样的事。';
            render(0); say();
          });
        }));
      });
    }
    reset();
  };

  // ── 试一试：x 取几时左右两边一样长 ──
  A.n_eq0_guess = function (el) {
    const W = 440, Hh = 160, x0 = 64, bw = 360, bh = 32, y1 = 44, y2 = 100;
    const svg = stage(el, W, Hh);
    const title = T(svg, W / 2, 22, '', 'tb');
    T(svg, x0 - 8, y1 + 21, '左边', 'note', 'end');
    T(svg, x0 - 8, y2 + 21, '右边', 'note', 'end');
    S('line', { x1: x0, x2: x0, y1: y1 - 6, y2: y2 + bh + 6, class: 'sstrong' }, svg);
    const barL = S('rect', { x: x0, y: y1, height: bh, width: 0, rx: 3, class: 'f1' }, svg);
    const barR = S('rect', { x: x0, y: y2, height: bh, width: 0, rx: 3, class: 'f2' }, svg);
    const tL = T(svg, 0, y1 + 21, '', 'tb', 'start');
    const tR = T(svg, 0, y2 + 21, '', 'tb', 'start');
    const gd = S('line', { y1: y1 - 8, y2: y2 + bh + 8, class: 'guide' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const EQS = [
      { t: '3x + 2 = 14', f: (x) => 3 * x + 2, s: (x) => `3 × ${x} + 2`, r: 14 },
      { t: '4x = 20', f: (x) => 4 * x, s: (x) => `4 × ${x}`, r: 20 },
      { t: 'x − 3 = 6', f: (x) => x - 3, s: (x) => `${x} − 3`, r: 6 },
      { t: '2x − 4 = 10', f: (x) => 2 * x - 4, s: (x) => `2 × ${x} − 4`, r: 10 },
      { t: '5x + 5 = 30', f: (x) => 5 * x + 5, s: (x) => `5 × ${x} + 5`, r: 30 }
    ];
    const sel = makeSelect(row, '方程：', EQS.map((e) => e.t), 0);
    const c = ctrl(el);
    let e = EQS[0], x = 0, u = 1, wL = 0, busy = false, run = 0, stopT = null;
    btn(c, '− 1', () => { if (!busy && x > 0) { x--; upd(); } }, 'alt');
    const xBtn = H('span', { class: 'k1' }, c, '');
    btn(c, '+ 1', () => { if (!busy && x < 12) { x++; upd(); } }, 'alt');
    btn(c, '从 0 开始一个个试', () => auto());
    sel.addEventListener('change', () => { run++; busy = false; e = EQS[+sel.value]; x = 0; setup(); });
    function setup() {
      u = bw / Math.max(e.f(12), e.r);
      title.textContent = '方程：' + e.t + '　　x 是几？';
      barR.setAttribute('width', e.r * u);
      tR.setAttribute('x', x0 + e.r * u + 6); tR.textContent = String(e.r);
      gd.setAttribute('x1', x0 + e.r * u); gd.setAttribute('x2', x0 + e.r * u);
      upd();
    }
    function upd() {
      xBtn.innerHTML = `<i>x</i> = ${x}`;
      const v = e.f(x), target = Math.max(0, v) * u, from = wL;
      if (stopT) stopT();
      stopT = tween(300, (t) => {
        wL = lerp(from, target, t);
        barL.setAttribute('width', wL);
        tL.setAttribute('x', x0 + wL + 6);
      });
      tL.textContent = v < 0 ? '不够减' : String(v);
      const xs = `<i>x</i> = ${x} 时，`;
      if (v < 0) read.innerHTML = `${xs}${e.s(x)} 不够减。<i>x</i> 要再大一些。`;
      else if (v === e.r) read.innerHTML = `${xs}左边 ${e.s(x)} = ${v}，正好等于右边 ${e.r}，两条一样长！<br>所以 <b><i>x</i> = ${x}</b> 是这个方程的<b>解</b>。`;
      else if (v < e.r) read.innerHTML = `${xs}左边 ${e.s(x)} = ${v}，比右边 ${e.r} 小。<i>x</i> 要再大一点。`;
      else read.innerHTML = `${xs}左边 ${e.s(x)} = ${v}，比右边 ${e.r} 大。<i>x</i> 要再小一点。`;
    }
    function auto() {
      if (busy) return;
      busy = true;
      const my = ++run;
      x = 0; upd();
      const step = () => {
        if (my !== run) return;
        if (e.f(x) === e.r || x >= 12) { busy = false; return; }
        x++; upd();
        later(650, step);
      };
      later(650, step);
    }
    setup();
  };

  // ════════════════════ n_fracmul：分数乘除法 ════════════════════

  // ── 分数乘分数：面积模型 ──
  A.n_fracmul_area = function (el) {
    const W = 440, Hh = 270, x0 = 20, y0 = 16, s = 230;
    const svg = stage(el, W, Hh);
    const gA = S('g', {}, svg), gB = S('g', {}, svg), gV = S('g', {}, svg), gHz = S('g', {}, svg), gLab = S('g', {}, svg);
    S('rect', { x: x0, y: y0, width: s, height: s, class: 'fnone sstrong' }, svg);
    const panel = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const FR = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6]];
    const names = FR.map(([p, q]) => `${p}/${q}`);
    const sp = makeSelect(row, '先取', names, 2);
    const sq = makeSelect(row, '再取它的', names, 4);
    const c = ctrl(el);
    let a = 2, b = 3, cc = 3, d = 4, phase = 0, busy = false, run = 0;
    btn(c, '① 竖着切，取第一个分数', () => { if (busy || phase > 0) return; const my = ++run; step1(my, () => { busy = false; }); });
    btn(c, '② 横着切，再取第二个分数', () => {
      if (busy || phase > 1) return;
      const my = ++run;
      if (phase === 0) step1(my, () => later(300, () => step2(my)));
      else step2(my);
    });
    btn(c, '重来', () => reset(), 'alt');
    sp.addEventListener('change', () => reset());
    sq.addEventListener('change', () => reset());

    function reset() {
      run++; busy = false; phase = 0;
      [a, b] = FR[+sp.value]; [cc, d] = FR[+sq.value];
      [gA, gB, gV, gHz, gLab, panel].forEach((gg) => { gg.innerHTML = ''; });
      T(panel, 345, 110, '这一整块', 'tm');
      T(panel, 345, 140, '面积是 1', 'tl tb');
      read.innerHTML = `一块正方形的地，面积是 1。先取它的 ${fr(a, b)}，再取这一部分的 ${fr(cc, d)}。最后取到的是整块地的几分之几？点 ①。`;
    }
    function step1(my, cb) {
      busy = true;
      const lines = [];
      for (let i = 1; i < b; i++) lines.push(S('line', { x1: x0 + (s * i) / b, x2: x0 + (s * i) / b, y1: y0, y2: y0, class: 'sstrong thin' }, gV));
      const blue = S('rect', { x: x0, y: y0, height: s, width: 0, class: 'f1s' }, gA);
      tween(600, (t) => lines.forEach((l) => l.setAttribute('y2', y0 + s * t)), () => {
        if (my !== run) return;
        tween(600, (t) => blue.setAttribute('width', ((s * a) / b) * t), () => {
          if (my !== run) return;
          phase = 1;
          T(gLab, x0 + (s * a) / b / 2, y0 + s + 20, `${a}/${b}`, 'tb t1');
          panel.innerHTML = '';
          sfrac(panel, 345, 120, a, b, 'tl tb t1');
          T(panel, 345, 175, '蓝色部分', 'tm');
          read.innerHTML = `竖着平均切成 ${b} 份，取其中 ${a} 份：<span class="k1">蓝色</span>是整块的 ${fr(a, b)}。`;
          cb();
        });
      });
    }
    function step2(my) {
      if (my !== run) return;
      busy = true;
      const lines = [];
      for (let i = 1; i < d; i++) lines.push(S('line', { x1: x0, x2: x0, y1: y0 + (s * i) / d, y2: y0 + (s * i) / d, class: 'sstrong thin' }, gHz));
      const wA = (s * a) / b, hC = (s * cc) / d;
      const green = S('rect', { x: x0, y: y0, width: wA, height: 0, class: 'f3', opacity: 0.85 }, gB);
      tween(600, (t) => lines.forEach((l) => l.setAttribute('x2', x0 + s * t)), () => {
        if (my !== run) return;
        tween(700, (t) => green.setAttribute('height', hC * t), () => {
          if (my !== run) return;
          phase = 2; busy = false;
          T(gLab, x0 + wA + 6, y0 + hC / 2 + 5, `${cc}/${d}`, 'tb t3', 'start');
          panel.innerHTML = '';
          sfrac(panel, 300, 90, a, b, 'tl tb t1');
          T(panel, 327, 97, '×', 'tl');
          sfrac(panel, 354, 90, cc, d, 'tl tb t3');
          T(panel, 300, 167, '=', 'tl');
          sfrac(panel, 340, 160, a * cc, b * d, 'tl tb');
          const g = gcd(a * cc, b * d);
          if (g > 1) {
            T(panel, 300, 237, '=', 'tl');
            sfrac(panel, 340, 230, (a * cc) / g, (b * d) / g, 'tl tb');
          }
          read.innerHTML = `横着再平均切成 ${d} 份，在蓝色里取 ${cc} 份：<span class="k3">绿色</span>是蓝色的 ${fr(cc, d)}。<br>` +
            `整块被切成 ${b} × ${d} = ${b * d} 个小格，绿色有 ${a} × ${cc} = ${a * cc} 格。所以 ` +
            `<b>${fr(a, b)} × ${fr(cc, d)} = ${fr(a * cc, b * d)}${g > 1 ? ' = ' + frS(a * cc, b * d) : ''}</b>。分子乘分子，分母乘分母。`;
        });
      });
    }
    reset();
  };

  // ── 除以分数：里面包含几个（跳格） ──
  A.n_fracmul_div = function (el) {
    const W = 460, Hh = 180, x0 = 30, x1 = 430, yL = 132;
    const svg = stage(el, W, Hh);
    const gAx = S('g', {}, svg), gJ = S('g', {}, svg);
    const ball = S('circle', { r: 7, class: 'f2 s2' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const sN = makeSelect(row, '被除数：', ['1', '2', '3'], 1);
    const DV = [[1, 2], [1, 3], [1, 4], [2, 3], [3, 4]];
    const sD = makeSelect(row, '除数：', DV.map(([p, q]) => `${p}/${q}`), 4);
    const c = ctrl(el);
    let N = 2, cn = 3, d = 4, busy = false, run = 0;
    btn(c, '开始跳', () => go());
    btn(c, '重来', () => reset(), 'alt');
    sN.addEventListener('change', () => reset());
    sD.addEventListener('change', () => reset());
    const X = (v) => x0 + ((x1 - x0) * v) / N;
    function reset() {
      run++; busy = false;
      N = +sN.value + 1; [cn, d] = DV[+sD.value];
      gAx.innerHTML = ''; gJ.innerHTML = '';
      S('line', { x1: x0, x2: x1, y1: yL, y2: yL, class: 'sstrong' }, gAx);
      for (let i = 0; i <= N * d; i++) {
        const major = i % d === 0;
        S('line', { x1: X(i / d), x2: X(i / d), y1: yL - (major ? 8 : 5), y2: yL + (major ? 8 : 5), class: major ? 'sstrong' : 'smuted' }, gAx);
        if (major) T(gAx, X(i / d), yL + 26, String(i / d), 'tb');
      }
      T(gAx, X(0), yL + 44, `每小格是 1/${d}`, 'note', 'start');
      ball.setAttribute('cx', X(0)); ball.setAttribute('cy', yL - 8);
      read.innerHTML = `${N} ÷ ${fr(cn, d)} 就是问：<b>${N} 里面有几个 ${fr(cn, d)}？</b>点“开始跳”，小球每步跳 ${fr(cn, d)}（${cn} 小格）。`;
    }
    function arc(xa, xb, h, cls) {
      return S('path', { d: `M${xa},${yL - 8} Q${(xa + xb) / 2},${yL - 8 - 2 * h} ${xb},${yL - 8}`, class: 'fnone ' + cls, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, gJ);
    }
    function go() {
      if (busy) return;
      const my = ++run;
      busy = true;
      gJ.innerHTML = '';
      const len = cn / d, q = Math.floor((N * d) / cn), r = N * d - q * cn;
      const px = X(len) - X(0), h = Math.min(56, 18 + px * 0.35);
      let i = 0;
      const jump = () => {
        if (my !== run) return;
        if (i >= q) { tail(); return; }
        const xa = X(i * len), xb = X((i + 1) * len);
        const p = arc(xa, xb, h, 's1');
        const k = ++i;
        tween(RM ? 1 : 520, (t) => {
          p.setAttribute('stroke-dashoffset', 1 - t);
          ball.setAttribute('cx', lerp(xa, xb, t));
          ball.setAttribute('cy', yL - 8 - 4 * h * t * (1 - t));
        }, () => {
          if (my !== run) return;
          T(gJ, (xa + xb) / 2, yL - 14 - h, String(k), 'tb t1');
          read.innerHTML = `跳了 ${k} 步……`;
          later(120, jump);
        });
      };
      const tail = () => {
        let txt = `${N} 里面有 <b>${q}</b> 个 ${fr(cn, d)}`;
        if (r) {
          const xa = X(q * len), xb = X(N);
          const p = arc(xa, xb, h * 0.6, 's3 dash');
          p.setAttribute('stroke-dasharray', '0.06 0.04');
          p.setAttribute('stroke-dashoffset', 0);
          T(gJ, (xa + xb) / 2, yL - 14 - h * 0.6, `${r / gcd(r, cn)}/${cn / gcd(r, cn)} 步`, 'tb t3');
          txt += `，还剩 ${fr(r, d)}，不够跳一整步，只是一步的 <span class="k3">${frS(r, cn)}</span>`;
        }
        const rec = cn === 1 ? String(d) : fr(d, cn);
        const res = frS(N * d, cn);
        const mix = (N * d) % cn && N * d > cn ? ' = ' + mixed(N * d, cn) : '';
        read.innerHTML = txt + `。所以 <b>${N} ÷ ${fr(cn, d)} = ${mixed(N * d, cn)}</b>。<br>` +
          `用倒数来算：${N} ÷ ${fr(cn, d)} = ${N} × ${rec} = ${res}${mix}。答案一样！`;
        busy = false;
      };
      jump();
    }
    reset();
  };

  // ════════════════════ n_ratio：比和比例 ════════════════════

  // ── 调果汁：橙汁和水的比一样，味道就一样 ──
  A.n_ratio_juice = function (el) {
    const W = 440, Hh = 270, cupY = 40, cupH = 180, cupW = 100, unit = 15;
    const svg = stage(el, W, Hh);
    const XA = 70, XB = 270;
    const liqA = S('rect', { x: XA + 3, width: cupW - 6, class: 'f2' }, svg);
    const liqB = S('rect', { x: XB + 3, width: cupW - 6, class: 'f2' }, svg);
    [XA, XB].forEach((x) => {
      S('path', { d: `M${x},${cupY} V${cupY + cupH} H${x + cupW} V${cupY}`, class: 'fnone sstrong thick round' }, svg);
      for (let k = 2; k <= 12; k += 2) S('line', { x1: x + cupW, x2: x + cupW + 6, y1: cupY + cupH - k * unit, y2: cupY + cupH - k * unit, class: 'smuted' }, svg);
    });
    const drop = S('circle', { r: 7, cx: XB + cupW / 2, cy: 10, opacity: 0, class: 'f2' }, svg);
    T(svg, XA + cupW / 2, cupY + cupH + 22, 'A 杯（配方）', 'tb');
    T(svg, XB + cupW / 2, cupY + cupH + 22, 'B 杯（你来调）', 'tb');
    const labA = T(svg, XA + cupW / 2, cupY + cupH + 42, '', 'note');
    const labB = T(svg, XB + cupW / 2, cupY + cupH + 42, '', 'note');
    T(svg, (XA + cupW + XB) / 2, cupY + 90, '比一比', 'note');
    T(svg, (XA + cupW + XB) / 2, cupY + 110, '颜色深浅', 'note');
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const REC = [[1, 2], [1, 3], [2, 3]];
    const sel = makeSelect(row, 'A 杯配方 橙汁 : 水 =', REC.map(([p, q]) => `${p} : ${q}`), 0);
    const c = ctrl(el);
    let ra = 1, rb = 2, j = 1, w = 1, busy = false, msg = '';
    btn(c, '+ 1 杯橙汁', () => pour(true));
    btn(c, '+ 1 杯水', () => pour(false));
    btn(c, '倒掉重来', () => { if (busy) return; j = 0; w = 0; msg = ''; draw(); }, 'alt');
    sel.addEventListener('change', () => { if (busy) return; [ra, rb] = REC[+sel.value]; draw(); });
    const shade = (jj, ww) => `fill: var(--a2); opacity: ${(0.12 + 0.88 * jj / (jj + ww)).toFixed(3)}`;
    function setLiq(rect, units, jj, ww) {
      rect.setAttribute('y', cupY + cupH - units * unit);
      rect.setAttribute('height', Math.max(0, units * unit));
      rect.setAttribute('style', jj + ww > 0 ? shade(jj, ww) : 'opacity: 0');
    }
    function draw() {
      setLiq(liqA, ra + rb, ra, rb);
      setLiq(liqB, j + w, j, w);
      labA.textContent = `橙汁 ${ra} 杯 : 水 ${rb} 杯`;
      labB.textContent = `橙汁 ${j} 杯 : 水 ${w} 杯`;
      say();
    }
    function say() {
      let txt;
      const vA = frS(ra, rb);
      if (j + w === 0) txt = '杯子是空的。点按钮往 B 杯里倒橙汁和水。';
      else if (w === 0) txt = `B 杯只有橙汁，没有水，比 A 杯浓多了。（比的后项不能是 0，${j} : 0 不是一个比。）`;
      else if (j * rb === w * ra) {
        const g = gcd(j, w);
        txt = `B 杯 橙汁 : 水 = ${j} : ${w}${g > 1 ? `，化简后是 ${j / g} : ${w / g}` : ''}，和 A 杯一样，<b>颜色一样深，味道一样</b>！` +
          `两个比的比值都是 ${vA}，所以可以写成比例：<b>${ra} : ${rb} = ${j} : ${w}</b>。`;
      } else if (j * rb > w * ra) txt = `B 杯 ${j} : ${w}，比值是 ${frS(j, w)}，比 A 杯的 ${vA} 大。橙汁占得多，颜色<b>更深</b>（更浓）。加点水试试。`;
      else txt = `B 杯 ${j} : ${w}，比值是 ${frS(j, w)}，比 A 杯的 ${vA} 小。水占得多，颜色<b>更浅</b>（更淡）。加点橙汁试试。`;
      read.innerHTML = (msg ? `<span class="k2">${msg}</span><br>` : '') + txt;
      msg = '';
    }
    function pour(isJuice) {
      if (busy) return;
      if (j + w >= 12) { msg = '杯子满了，倒掉重来吧。'; say(); return; }
      busy = true;
      drop.setAttribute('class', isJuice ? 'f2' : 'f1');
      const top = cupY + cupH - (j + w) * unit;
      tween(450, (t) => { drop.setAttribute('cy', lerp(10, top, t)); drop.setAttribute('opacity', 1); }, () => {
        drop.setAttribute('opacity', 0);
        const j0 = j, w0 = w;
        if (isJuice) j++; else w++;
        tween(400, (t) => {
          const u = lerp(j0 + w0, j + w, t);
          setLiq(liqB, u, lerp(j0, j, t) + 1e-9, lerp(w0, w, t));
        }, () => { busy = false; draw(); });
      });
    }
    draw();
  };

  // ── 正比例和反比例：描点看图象 ──
  A.n_ratio_plot = function (el) {
    const W = 440, Hh = 262, ox = 50, oy = 232, ux = 60, uy = 11;
    const svg = stage(el, W, Hh);
    const X = (v) => ox + v * ux, Y = (v) => oy - v * uy;
    const gAx = S('g', {}, svg);
    for (let k = 3; k <= 18; k += 3) {
      S('line', { x1: X(0), x2: X(6.4), y1: Y(k), y2: Y(k), class: 'gridl' }, gAx);
      T(gAx, ox - 8, Y(k) + 4, String(k), 'tick', 'end');
    }
    for (let k = 1; k <= 6; k++) {
      S('line', { x1: X(k), x2: X(k), y1: Y(0), y2: Y(18.5), class: 'gridl' }, gAx);
      T(gAx, X(k), oy + 16, String(k), 'tick');
    }
    S('line', { x1: X(0), x2: X(6.6), y1: oy, y2: oy, class: 'axis' }, gAx);
    S('line', { x1: X(0), x2: X(0), y1: oy, y2: Y(19.5), class: 'axis' }, gAx);
    T(gAx, ox - 8, oy + 16, '0', 'tick', 'end');
    const xName = T(gAx, X(6.6), oy - 6, '', 'note', 'end');
    const yName = T(gAx, ox + 6, Y(19.5) + 4, '', 'note', 'start');
    const rectG = S('rect', { x: ox, class: 'f3s s3 thin', opacity: 0.7 }, svg);
    const curve = S('path', { class: 'fline' }, svg);
    const guides = S('g', {}, svg);
    const dots = S('g', {}, svg);
    const cur = S('circle', { r: 8, class: 'handle' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mode = 0, x = 2, seen = new Set([2]), busy = false, run = 0;
    const f = (v) => (mode === 0 ? 3 * v : 12 / v);
    const modeBtn = btn(c, '换成反比例', () => {
      if (busy) return;
      mode = 1 - mode; seen = new Set([x]); curve.setAttribute('d', '');
      modeBtn.textContent = mode ? '换成正比例' : '换成反比例';
      draw();
    }, 'alt');
    btn(c, '← x 减 1', () => { if (!busy && x > 1) { x--; seen.add(x); draw(); } });
    btn(c, 'x 加 1 →', () => { if (!busy && x < 6) { x++; seen.add(x); draw(); } });
    btn(c, '描出所有点，连起来', () => all());
    function draw() {
      const y = f(x);
      xName.textContent = mode ? '长 x' : '数量 x（本）';
      yName.textContent = mode ? '宽 y' : '总价 y（元）';
      if (mode) {
        rectG.setAttribute('y', Y(y)); rectG.setAttribute('width', x * ux); rectG.setAttribute('height', y * uy);
        rectG.setAttribute('opacity', 0.7);
      } else rectG.setAttribute('opacity', 0);
      guides.innerHTML = '';
      S('line', { x1: X(x), x2: X(x), y1: oy, y2: Y(y), class: 's2 dash thin' }, guides);
      S('line', { x1: ox, x2: X(x), y1: Y(y), y2: Y(y), class: 's2 dash thin' }, guides);
      T(guides, x >= 5 ? X(x) - 10 : X(x) + 10, Y(y) - 8, `(${x}, ${fmt(y)})`, 'tb t2', x >= 5 ? 'end' : 'start');
      dots.innerHTML = '';
      seen.forEach((v) => S('circle', { cx: X(v), cy: Y(f(v)), r: 5, class: 'dot' }, dots));
      cur.setAttribute('cx', X(x)); cur.setAttribute('cy', Y(y));
      const ys = fmt(y);
      read.innerHTML = mode === 0
        ? `练习本每本 3 元。买 <b>${x}</b> 本，总价 <b>${ys}</b> 元。<br>总价 ÷ 数量 = ${ys} ÷ ${x} = <b>3</b>（单价），这个<b>比值一直不变</b>，所以总价和数量成<b>正比例</b>。描出的点都在一条经过 0 点的直线上。`
        : `面积是 12 的长方形：长 <b>${x}</b>，宽 <b>${ys}</b>（绿色长方形）。<br>长 × 宽 = ${x} × ${ys} = <b>12</b>，这个<b>乘积一直不变</b>，所以长和宽成<b>反比例</b>。长越大，宽越小，点连成一条曲线。`;
    }
    function all() {
      if (busy) return;
      busy = true;
      const my = ++run;
      curve.setAttribute('d', '');
      let i = 1;
      const next = () => {
        if (my !== run) return;
        if (i > 6) { line(); return; }
        x = i; seen.add(i); draw(); i++;
        later(380, next);
      };
      const line = () => {
        let dd = '';
        if (mode === 0) dd = `M${X(0)},${Y(0)} L${X(6)},${Y(18)}`;
        else for (let v = 12 / 18; v <= 6.001; v += 0.05) dd += (dd ? 'L' : 'M') + X(v).toFixed(1) + ',' + Y(12 / v).toFixed(1);
        curve.setAttribute('d', dd);
        curve.setAttribute('pathLength', 1);
        curve.setAttribute('stroke-dasharray', 1);
        tween(900, (t) => curve.setAttribute('stroke-dashoffset', 1 - t), () => { if (my === run) busy = false; });
      };
      next();
    }
    draw();
  };

  // ════════════════════ n_percent：百分数 ════════════════════

  // ── 百格图涂色 ──
  A.n_percent_grid = function (el) {
    const W = 440, Hh = 250, gx = 14, gy = 14, cs = 22;
    const svg = stage(el, W, Hh);
    const cells = [];
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(i / 10), k = i % 10;
      const rc = S('rect', { x: gx + k * cs, y: gy + r * cs, width: cs, height: cs, class: 'fsurf sline clickable', tabindex: 0, role: 'button', 'aria-label': `涂到第${i + 1}格` }, svg);
      rc.addEventListener('click', () => go(i + 1, '点格子'));
      rc.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(i + 1, '点格子'); } });
      cells.push(rc);
    }
    S('rect', { x: gx, y: gy, width: cs * 10, height: cs * 10, class: 'fnone sstrong' }, svg);
    const big = T(svg, 340, 80, '', 'txl t2');
    const panel = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 0, busy = false, src = '';
    [['涂 25%', 25, '25%'], ['涂 1/5', 20, fr(1, 5)], ['涂 0.6', 60, '0.6'], ['涂 3/4', 75, fr(3, 4)], ['涂 100%', 100, '100%']].forEach(([lab, v, s]) => btn(c, lab, () => go(v, s)));
    btn(c, '清空', () => go(0, ''), 'alt');
    H('p', { class: 'anim-tip' }, el, '也可以直接点格子：点第几格，就涂到第几格。');
    function paint(k) {
      cells.forEach((rc, i) => rc.setAttribute('class', (i < k ? 'f2' : 'fsurf') + ' sline clickable'));
    }
    function go(v, s) {
      if (busy) return;
      busy = true;
      const from = n;
      src = s;
      tween(Math.min(900, 200 + Math.abs(v - from) * 12), (t) => {
        const k = Math.round(lerp(from, v, t));
        paint(k); big.textContent = k + '%';
      }, () => { n = v; busy = false; show(); });
    }
    function show() {
      paint(n);
      big.textContent = n + '%';
      panel.innerHTML = '';
      T(panel, 300, 147, '=', 'tl');
      sfrac(panel, 345, 140, n, 100, 'tl tb');
      T(panel, 300, 207, '=', 'tl');
      T(panel, 345, 207, fmt(n / 100), 'tl tb');
      if (n === 0) { read.innerHTML = '一共 100 个小格。点按钮或点格子来涂色。'; return; }
      const g = gcd(n, 100);
      let txt = `100 个小格里涂了 <b>${n}</b> 个，就是 ${fr(n, 100)}，写成百分数是 <b class="k2">${n}%</b>，写成小数是 ${fmt(n / 100)}。`;
      if (g > 1) txt += ` 约分：${fr(n, 100)} = ${frS(n, 100)}。`;
      if (src && src !== '点格子' && src !== n + '%') txt += `<br>${src} 化成百分数就是 ${n}%。`;
      read.innerHTML = txt;
    }
    show();
  };

  // ── 打折：现价 = 原价 × 折扣 ──
  A.n_percent_sale = function (el) {
    const W = 440, Hh = 212, x0 = 40, bw = 360, bh = 34, y1 = 50, y2 = 130;
    const svg = stage(el, W, Hh);
    const t1 = T(svg, x0, y1 - 10, '', 'tb t1', 'start');
    S('rect', { x: x0, y: y1, width: bw, height: bh, class: 'f1s s1' }, svg);
    for (let k = 1; k < 10; k++) S('line', { x1: x0 + (bw * k) / 10, x2: x0 + (bw * k) / 10, y1: y1, y2: y1 + bh, class: 'sline' }, svg);
    T(svg, x0 + bw, y1 + bh / 2 + 5, '100%', 'tb', 'end');
    const t2 = T(svg, x0, y2 - 10, '', 'tb t2', 'start');
    const saved = S('rect', { x: x0, y: y2, width: 0, height: bh, class: 'fnone s2 dash' }, svg);
    const now = S('rect', { x: x0, y: y2, width: bw, height: bh, class: 'f2' }, svg);
    const pct = T(svg, x0 + bw - 6, y2 + bh / 2 + 5, '', 'tb tw', 'end');
    const savT = T(svg, x0 + bw, y2 + bh + 22, '', 'tb t2', 'end');
    for (let k = 0; k <= 10; k += 2) T(svg, x0 + (bw * k) / 10, y2 + bh + 40, k * 10 + '%', 'tick');
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const PRICES = [80, 120, 200, 360];
    const DIS = [['九折', 90], ['八折', 80], ['七五折', 75], ['六折', 60], ['五折', 50]];
    const sP = makeSelect(row, '原价：', PRICES.map((v) => v + ' 元'), 1);
    const sD = makeSelect(row, '折扣：', DIS.map((d) => d[0]), 1);
    const c = ctrl(el);
    let price = 120, rate = 80, cur = 100, busy = false, run = 0;
    btn(c, '打折！', () => sale());
    btn(c, '恢复原价', () => { run++; busy = false; setTo(100); intro(); }, 'alt');
    sP.addEventListener('change', () => { run++; busy = false; price = PRICES[+sP.value]; setTo(100); intro(); });
    sD.addEventListener('change', () => { run++; busy = false; rate = DIS[+sD.value][1]; setTo(100); intro(); });
    function setTo(p) {
      cur = p;
      const w = (bw * p) / 100;
      now.setAttribute('width', w);
      saved.setAttribute('x', x0 + w); saved.setAttribute('width', bw - w);
      pct.setAttribute('x', x0 + w - 6);
      pct.textContent = Math.round(p) + '%';
      t1.textContent = `原价 ${price} 元（看作单位“1”，是 100%）`;
      t2.textContent = `现在的价格：${fmt((price * p) / 100)} 元`;
      savT.textContent = p < 100 ? `便宜了 ${fmt(price - (price * p) / 100)} 元` : '';
    }
    function intro() {
      const nm = DIS.find((d) => d[1] === rate)[0];
      read.innerHTML = `“${nm}”就是按原价的 <b>${rate}%</b> 卖。点“打折！”看看现价是多少。`;
    }
    function sale() {
      if (busy) return;
      const my = ++run;
      busy = true;
      const from = cur;
      tween(1200, (t) => setTo(lerp(from, rate, t)), () => {
        if (my !== run) return;
        setTo(rate); busy = false;
        const nm = DIS.find((d) => d[1] === rate)[0];
        const np = (price * rate) / 100;
        read.innerHTML = `${nm}：现价 = 原价 × ${rate}% = ${price} × ${fmt(rate / 100)} = <b>${fmt(np)} 元</b>。<br>便宜了 ${price} − ${fmt(np)} = ${fmt(price - np)} 元，正好是原价的 ${100 - rate}%。`;
      });
    }
    setTo(100); intro();
  };

  // ════════════════════ n_neg0：负数的初步认识 ════════════════════

  // ── 温度计 ──
  A.n_neg0_thermo = function (el) {
    const W = 440, Hh = 262, tx = 100, tw = 16;
    const svg = stage(el, W, Hh);
    const Y = (t) => 130 - t * 9;
    S('rect', { x: 70, y: Y(10) - 6, width: 300, height: Y(0) - Y(10) + 6, class: 'f2s', opacity: 0.35 }, svg);
    S('rect', { x: 70, y: Y(0), width: 300, height: Y(-10) - Y(0) + 6, class: 'f1s', opacity: 0.45 }, svg);
    T(svg, 44, Y(5) + 5, '零上', 'tb t2');
    T(svg, 44, Y(-5) + 5, '零下', 'tb t1');
    S('rect', { x: tx, y: Y(10) - 12, width: tw, height: Y(-10) - Y(10) + 30, rx: 8, class: 'fsurf sstrong' }, svg);
    S('circle', { cx: tx + tw / 2, cy: Y(-10) + 24, r: 14, class: 'f2 sstrong' }, svg);
    const merc = S('rect', { x: tx + 4, width: tw - 8, class: 'f2' }, svg);
    for (let t = -10; t <= 10; t++) {
      const long = t % 5 === 0;
      S('line', { x1: tx + tw, x2: tx + tw + (long ? 12 : 6), y1: Y(t), y2: Y(t), class: long ? 'sstrong thin' : 'smuted thin' }, svg);
      if (t % 2 === 0) T(svg, tx + tw + 16, Y(t) + 4, fmt(t), t === 0 ? 'ts tb' : 'ts', 'start');
    }
    S('line', { x1: 150, x2: 370, y1: Y(0), y2: Y(0), class: 'sstrong dash' }, svg);
    T(svg, 370, Y(0) - 6, '0℃', 'tb', 'end');
    const big = T(svg, 290, 80, '', 'txl');
    const sub = T(svg, 290, 106, '', 'tb');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let temp = 3, busy = false;
    btn(c, '降低 5℃', () => change(-5));
    btn(c, '降低 1℃', () => change(-1));
    btn(c, '升高 1℃', () => change(1), 'alt');
    btn(c, '升高 5℃', () => change(5), 'alt');
    function setT(v) {
      merc.setAttribute('y', Y(v));
      merc.setAttribute('height', Y(-10) + 24 - Y(v));
    }
    function name(t) {
      if (t > 0) return `零上 ${t} 摄氏度（也可以写成 +${t}℃）`;
      if (t < 0) return `零下 ${-t} 摄氏度，也读作“负 ${-t} 摄氏度”`;
      return '0 摄氏度。0 既不是正数，也不是负数';
    }
    function show(extra) {
      setT(temp);
      big.textContent = fmt(temp) + '℃';
      big.setAttribute('class', 'txl ' + (temp > 0 ? 't2' : temp < 0 ? 't1' : ''));
      sub.textContent = temp > 0 ? '比 0℃ 高' : temp < 0 ? '比 0℃ 低' : '正好 0℃';
      read.innerHTML = (extra ? extra + '<br>' : '') + `现在是 <b>${fmt(temp)}℃</b>，读作${name(temp)}。`;
    }
    function change(dl) {
      if (busy) return;
      const to = temp + dl;
      if (to > 10 || to < -10) { show('<span class="k2">温度计上只画到 −10℃ 到 10℃，换个按钮试试。</span>'); return; }
      busy = true;
      const from = temp;
      tween(400 + Math.abs(dl) * 90, (t) => {
        const v = lerp(from, to, t);
        setT(v);
        big.textContent = fmt(Math.round(v)) + '℃';
      }, () => {
        temp = to; busy = false;
        let ex = `从 ${fmt(from)}℃ ${dl > 0 ? '升高' : '降低'} ${Math.abs(dl)}℃，变成 ${fmt(to)}℃。`;
        if (from > 0 && to < 0) ex += ` 先降 ${from}℃ 到 0℃，再往下降 ${-to}℃。`;
        if (from < 0 && to > 0) ex += ` 先升 ${-from}℃ 到 0℃，再往上升 ${to}℃。`;
        show(ex);
      });
    }
    show('');
  };

  // ── 数轴上比大小（拖动两个点） ──
  A.n_neg0_line = function (el) {
    const W = 460, Hh = 160, x0 = 230, u = 26, yL = 82, LIM = 8;
    const svg = stage(el, W, Hh);
    const X = (v) => x0 + v * u;
    S('line', { x1: 10, x2: W - 8, y1: yL, y2: yL, class: 'sstrong' }, svg);
    S('path', { d: `M${W - 6},${yL} l-11,-6 v12 Z`, class: 'fstrong' }, svg);
    for (let v = -LIM; v <= LIM; v++) {
      S('line', { x1: X(v), x2: X(v), y1: yL - 5, y2: yL + 5, class: 'sstrong thin' }, svg);
      T(svg, X(v), yL + 21, fmt(v), v === 0 ? 'ts tb' : 'ts');
    }
    T(svg, 12, Hh - 6, '← 西', 'note', 'start');
    T(svg, W - 10, Hh - 6, '东 →', 'note', 'end');
    T(svg, X(0), Hh - 6, '学校 0', 'note');
    function marker(cls, txt, above) {
      const g = S('g', { class: 'clickable', tabindex: 0, role: 'button', 'aria-label': '点' + txt }, svg);
      const yy = above ? yL - 30 : yL + 46;
      S('line', { x1: 0, x2: 0, y1: above ? yy + 13 : yy - 13, y2: above ? yL - 6 : yL + 8, class: cls.split(' ')[1] }, g);
      S('circle', { cx: 0, cy: yy, r: 13, class: cls }, g);
      T(g, 0, yy + 5, txt, 'tb');
      return g;
    }
    const dotA = S('circle', { r: 5, cy: yL, class: 'f1' }, svg);
    const dotB = S('circle', { r: 5, cy: yL, class: 'f2' }, svg);
    const mA = marker('f1s s1', 'A', true);
    const mB = marker('f2s s2', 'B', false);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = -3, b = 2;
    btn(c, 'A ←', () => { a = Math.max(-LIM, a - 1); draw(); }, 'alt');
    btn(c, 'A →', () => { a = Math.min(LIM, a + 1); draw(); }, 'alt');
    btn(c, 'B ←', () => { b = Math.max(-LIM, b - 1); draw(); }, 'alt');
    btn(c, 'B →', () => { b = Math.min(LIM, b + 1); draw(); }, 'alt');
    btn(c, '随便放两个点', () => {
      a = Math.floor(Math.random() * 15) - 7;
      b = Math.floor(Math.random() * 15) - 7;
      draw();
    });
    H('p', { class: 'anim-tip' }, el, '提示：可以拖动 A、B 两个圆点。每一格表示 1 千米。');
    const where = (v) => (v > 0 ? `学校东边 ${v} 千米，记作 +${v} 千米` : v < 0 ? `学校西边 ${-v} 千米，记作 −${-v} 千米` : '就在学校，记作 0');
    function draw() {
      mA.setAttribute('transform', `translate(${X(a)},0)`);
      mB.setAttribute('transform', `translate(${X(b)},0)`);
      dotA.setAttribute('cx', X(a)); dotB.setAttribute('cx', X(b));
      const fa = fmt(a), fb = fmt(b);
      let cmp;
      if (a < b) cmp = `A 在 B 的<b>左边</b>，所以 <b>${fa} &lt; ${fb}</b>。`;
      else if (a > b) cmp = `A 在 B 的<b>右边</b>，所以 <b>${fa} &gt; ${fb}</b>。`;
      else cmp = `A 和 B 在同一个点，${fa} = ${fb}。`;
      let tip = '';
      if (a < 0 && b < 0 && a !== b) tip = ' 两个都是负数：负号后面的数越大，这个数反而越小。';
      read.innerHTML = `<span class="k1">A 表示 ${fa}</span>：${where(a)}。<span class="k2">B 表示 ${fb}</span>：${where(b)}。<br>${cmp}在数轴上，<b>右边的数总比左边的大</b>。${tip}`;
    }
    [[mA, (v) => { a = v; }], [mB, (v) => { b = v; }]].forEach(([m, setV]) => {
      m.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        m.setPointerCapture(e.pointerId);
        const move = (ev) => {
          const pt = svgPoint(svg, ev);
          setV(Math.max(-LIM, Math.min(LIM, Math.round((pt.x - x0) / u))));
          draw();
        };
        const up = () => { m.removeEventListener('pointermove', move); m.removeEventListener('pointerup', up); };
        m.addEventListener('pointermove', move);
        m.addEventListener('pointerup', up);
      });
    });
    draw();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
