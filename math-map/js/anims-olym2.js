// 奥数拓展 olym2 组（三、四年级：计算与图形）的动画
(function () {
  const { S, H, T, tween, lerp, stage, ctrl, btn, slider, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  const tr = (x, y) => `translate(${x},${y})`;
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const later = (ms, fn) => setTimeout(fn, RM ? 0 : ms);
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
  // 卡片：圆角矩形 + 文字，可整体移动
  function card(parent, w, h, text, cls, tcls) {
    const g = S('g', {}, parent);
    const r = S('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, class: cls || 'fsurf sstrong' }, g);
    const t = T(g, 0, 6, text, tcls || 'tl tb');
    const o = { g, r, t, x: 0, y: 0 };
    o.move = (x, y) => { o.x = x; o.y = y; g.setAttribute('transform', tr(x, y)); };
    return o;
  }
  // 逐字排版（18px 字），能知道每个字的位置，方便把数字“飞”进去
  const cw = (ch) => (/[0-9a-z]/.test(ch) ? 11 : ch === ' ' ? 6 : /[()]/.test(ch) ? 8 : 18);
  function layout(s, x) {
    const xs = [];
    for (const ch of s) { const w = cw(ch); xs.push(x + w / 2); x += w; }
    return { xs, end: x };
  }
  const strW = (s) => layout(s, 0).end;
  function drawStr(parent, x, y, s, clsFn, from, to) {
    const L = layout(s, x), chars = [...s];
    chars.forEach((ch, i) => {
      if (ch === ' ' || i < (from || 0) || i >= (to == null ? chars.length : to)) return;
      T(parent, L.xs[i], y, ch, typeof clsFn === 'function' ? clsFn(ch, i) : clsFn || 'tl');
    });
    return L;
  }

  // ───────────── 速算与巧算：数字卡片凑整 ─────────────
  A.o_sum_trick_pair = function (el) {
    const W = 440, Hh = 250, CW = 56, CH = 40, TOPY = 76, BOTY = 166;
    const svg = stage(el, W, Hh);
    const head = T(svg, W / 2, 28, '', 'tl tb');
    S('line', { x1: 10, x2: W - 10, y1: 118, y2: 118, class: 'sline dash' }, svg);
    T(svg, 14, 136, '凑整区', 'ts tm', 'start');
    const layer = S('g', {}, svg);
    const foot = T(svg, W / 2, 238, '', 'tb t3');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let nums = [], cards = [], sel = null, busy = false, done = [], run = 0;

    function gen() {
      let arr, k;
      for (;;) {
        k = ri(2, 3); arr = [];
        for (let i = 0; i < k; i++) {
          const tg = Math.random() < 0.65 ? 100 : 200;
          let a;
          do { a = ri(11, tg - 11); } while (a % 10 === 0);
          arr.push(a, tg - a);
        }
        if (k === 2) {
          let x;
          do { x = ri(12, 98); } while (x % 10 === 0);
          arr.push(x);
        }
        let pairs = 0;
        for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) if ((arr[i] + arr[j]) % 100 === 0) pairs++;
        if (pairs === k && new Set(arr).size === arr.length) break;
      }
      return shuffle(arr);
    }
    function setup(list) {
      run++;
      nums = list.slice(); layer.innerHTML = ''; sel = null; done = []; busy = false;
      head.textContent = nums.join(' + ') + ' = ?';
      foot.textContent = '';
      cards = nums.map((v, i) => {
        const cd = card(layer, CW, CH, String(v));
        cd.v = v; cd.used = false;
        cd.move(W / 2 + (i - (nums.length - 1) / 2) * 66, TOPY);
        cd.g.setAttribute('class', 'clickable');
        cd.g.addEventListener('click', () => pick(cd));
        return cd;
      });
      read.innerHTML = '点两张数字卡片：如果它们加起来正好是<b>整百</b>，就会合成一张。先凑整，再相加，又快又不容易错。';
    }
    function findPair() {
      const rest = cards.filter((x) => !x.used);
      for (let i = 0; i < rest.length; i++) for (let j = i + 1; j < rest.length; j++) if ((rest[i].v + rest[j].v) % 100 === 0) return [rest[i], rest[j]];
      return null;
    }
    function shake(cd) {
      const x0 = cd.x, y0 = cd.y;
      tween(320, (t, raw) => cd.move(x0 + Math.sin(raw * PI * 6) * 5 * (1 - raw), y0));
    }
    function pick(cd) {
      if (busy || cd.used) return;
      if (!sel) { sel = cd; cd.r.setAttribute('class', 'f2s s2'); read.innerHTML = `选了 <b>${cd.v}</b>，再点一张，看能不能和它凑成整百。`; return; }
      if (sel === cd) { cd.r.setAttribute('class', 'fsurf sstrong'); sel = null; read.innerHTML = '取消了。重新选两张卡片。'; return; }
      const a = sel, b = cd, s = a.v + b.v;
      a.r.setAttribute('class', 'fsurf sstrong'); sel = null;
      if (s % 100 !== 0) {
        read.innerHTML = `${a.v} + ${b.v} = ${s}，不是整百。窍门：两个数的<b>个位加起来是 10</b>，十位再加上进的 1 是整十，才能凑成整百。换一张试试。`;
        shake(b);
        return;
      }
      merge(a, b);
    }
    function merge(a, b, then) {
      busy = true; a.used = b.used = true;
      const my = run, bx = 70 + done.length * 100;
      const ax0 = a.x, ay0 = a.y, bx0 = b.x, by0 = b.y;
      a.r.setAttribute('class', 'f1s s1'); b.r.setAttribute('class', 'f1s s1');
      tween(700, (t) => { a.move(lerp(ax0, bx - 30, t), lerp(ay0, BOTY, t)); b.move(lerp(bx0, bx + 30, t), lerp(by0, BOTY, t)); }, () => {
        if (my !== run) return;
        tween(260, (t) => { a.move(lerp(bx - 30, bx, t), BOTY); b.move(lerp(bx + 30, bx, t), BOTY); }, () => {
          if (my !== run) return;
          a.g.remove(); b.g.remove();
          const m = card(layer, 80, 44, String(a.v + b.v), 'f3s s3');
          m.move(bx, BOTY);
          T(m.g, 0, 40, `${a.v} + ${b.v}`, 'ts tm');
          m.v = a.v + b.v; done.push(m);
          read.innerHTML = `<span class="k1">${a.v}</span> + <span class="k1">${b.v}</span> = <span class="k3">${a.v + b.v}</span>，凑成了整百！个位 ${a.v % 10} + ${b.v % 10} = 10。`;
          busy = false;
          checkEnd();
          if (then) then();
        });
      });
    }
    function checkEnd() {
      if (findPair()) return;
      const rest = cards.filter((x) => !x.used);
      rest.forEach((cd) => {
        const bx = 70 + done.length * 100, x0 = cd.x, y0 = cd.y;
        cd.used = true; done.push(cd);
        tween(600, (t) => cd.move(lerp(x0, bx, t), lerp(y0, BOTY, t)));
      });
      const total = nums.reduce((s, v) => s + v, 0);
      foot.textContent = done.map((d) => d.v).join(' + ') + ' = ' + total;
      head.textContent = nums.join(' + ') + ' = ' + total;
      read.innerHTML += `<br>没有能凑整的了。${rest.length ? '把整百数和剩下的数' : '把几个整百数'}加起来：<b>${foot.textContent}</b>。`;
    }
    btn(c, '自动配对', () => {
      if (busy) return;
      if (sel) { sel.r.setAttribute('class', 'fsurf sstrong'); sel = null; }
      const my = run;
      const step = () => { if (my !== run) return; const p = findPair(); if (p) merge(p[0], p[1], () => later(250, step)); };
      step();
    });
    btn(c, '换一组数', () => setup(gen()));
    btn(c, '重来', () => setup(nums), 'alt');
    setup([38, 56, 62, 44]);
  };

  // ───────────── 速算与巧算：接近整百的数（数轴上先跳整百，再调整） ─────────────
  A.o_sum_trick_round = function (el) {
    const W = 460, Hh = 232, yL = 150, x0 = 30, x1 = 430;
    const svg = stage(el, W, Hh);
    const head = T(svg, W / 2, 26, '', 'tl tb');
    const head2 = T(svg, W / 2, 52, '', 'tb t1');
    const g = S('g', {}, svg);
    const frog = S('circle', { r: 8, class: 'f2' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a, b, op, R, p1, p2, lo, hi, st = 0, busy = false;
    const X = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
    const sg = (n) => (n >= 0 ? '+' : '−');
    function setProb(o, aa, bb) {
      op = o; a = aa; b = bb; R = Math.round(b / 100) * 100;
      p1 = op === '+' ? a + R : a - R;
      p2 = op === '+' ? a + b : a - b;
      lo = Math.floor(Math.min(a, p1, p2) / 100) * 100;
      hi = Math.ceil(Math.max(a, p1, p2) / 100) * 100;
      if (hi - lo < 300) hi = lo + 300;
      st = 0; draw();
    }
    function gen() {
      const o = Math.random() < 0.5 ? '+' : '−';
      const r = ri(1, 4) * 100, d = ri(1, 3) * (Math.random() < 0.65 ? -1 : 1);
      setProb(o, o === '+' ? ri(112, 589) : r + ri(60, 450), r + d);
    }
    function dot(x, v, fc, tc, dy) {
      S('circle', { cx: x, cy: yL, r: 5, class: fc }, g);
      T(g, x, yL + dy, String(v), tc);
    }
    function draw() {
      g.innerHTML = '';
      const k = p2 - p1, dir = k > 0 ? 1 : -1, xd2 = X(p1) + dir * 24;
      S('line', { x1: x0 - 12, x2: x1 + 12, y1: yL, y2: yL, class: 'sstrong' }, g);
      for (let v = lo; v <= hi; v += 100) {
        S('line', { x1: X(v), x2: X(v), y1: yL - 6, y2: yL + 6, class: 'sstrong' }, g);
        T(g, X(v), yL + 20, String(v), 'tick');
      }
      dot(X(a), a, 'f1', 't1 tb', 40);
      head.textContent = `${a} ${op} ${b} = ?`;
      head2.textContent = '';
      if (st >= 1) {
        const xa = X(a), xb = X(p1), mid = (xa + xb) / 2;
        S('path', { d: `M${xa},${yL - 8} Q${mid},${yL - 128} ${xb},${yL - 8}`, class: 's2 fnone dash' }, g);
        T(g, mid, yL - 74, `${op} ${R}`, 't2 tb');
        dot(xb, p1, 'f2', 't2', 40);
        head2.textContent = `= ${a} ${op} ${R} ${sg(k)} ${Math.abs(k)}`;
      }
      if (st >= 2) {
        const xb = X(p1);
        S('path', { d: `M${xb},${yL - 8} Q${xb + dir * 12},${yL - 64} ${xd2},${yL - 8}`, class: 's3 fnone' }, g);
        T(g, xb + dir * 12, yL - 42, `${sg(k)}${Math.abs(k)}`, 't3 tb');
        dot(xd2, p2, 'f3', 't3 tb', 62);
        head.textContent = `${a} ${op} ${b} = ${p2}`;
        head2.textContent = `= ${a} ${op} ${R} ${sg(k)} ${Math.abs(k)} = ${p1} ${sg(k)} ${Math.abs(k)} = ${p2}`;
      }
      const fx = st === 0 ? X(a) : st === 1 ? X(p1) : xd2;
      frog.setAttribute('cx', fx); frog.setAttribute('cy', yL - 8);
      const more = b > R, e = Math.abs(b - R);
      const word = op === '+'
        ? (more ? `${b} 比 ${R} 多 ${e}，加 ${R} 就<b>少加了 ${e}</b>，还要再加上 ${e}` : `${b} 比 ${R} 少 ${e}，加 ${R} 就<b>多加了 ${e}</b>，要再减去 ${e}`)
        : (more ? `${b} 比 ${R} 多 ${e}，减 ${R} 就<b>少减了 ${e}</b>，还要再减去 ${e}` : `${b} 比 ${R} 少 ${e}，减 ${R} 就<b>多减了 ${e}</b>，要再加上 ${e}`);
      read.innerHTML = st === 0
        ? `${b} 很接近整百数 <b>${R}</b>。先把它当成 ${R} 来${op === '+' ? '加' : '减'}，再调整。点“下一步”。`
        : st === 1
          ? `先算 <span class="k2">${a} ${op} ${R} = ${p1}</span>。可是 ${word}。`
          : `<span class="k3">${p1} ${sg(k)} ${Math.abs(k)} = ${p2}</span>。记住：<b>多加了要减去，多减了要加上</b>。（绿色这一小跳画大了，方便看清）`;
    }
    function next() {
      if (busy) return;
      if (st >= 2) { st = 0; draw(); return; }
      busy = true;
      if (st === 0) {
        const xa = X(a), xb = X(p1);
        tween(900, (t, raw) => { frog.setAttribute('cx', lerp(xa, xb, raw)); frog.setAttribute('cy', yL - 8 - 240 * raw * (1 - raw)); }, () => { st = 1; busy = false; draw(); });
      } else {
        const xa = X(p1), dir = p2 > p1 ? 1 : -1;
        tween(600, (t, raw) => { frog.setAttribute('cx', xa + dir * 24 * raw); frog.setAttribute('cy', yL - 8 - 112 * raw * (1 - raw)); }, () => { st = 2; busy = false; draw(); });
      }
    }
    btn(c, '下一步', next);
    btn(c, '换一题', () => { if (!busy) gen(); }, 'alt');
    setProb('+', 156, 298);
  };

  // ───────────── 速算与巧算：基准数（移多补少） ─────────────
  A.o_sum_trick_base = function (el) {
    const W = 440, Hh = 262, N = 6, U = 13, BL = 112, BOT = 216, BW = 40;
    const svg = stage(el, W, Hh);
    const head = T(svg, W / 2, 22, '', 'tb');
    const head2 = T(svg, W / 2, 44, '', 'tb t3');
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let base, vals, st = 0, busy = false, run = 0, blocks = [], holes = [], moved = 0;
    const bx = (i) => 70 + i * 60;
    function gen() {
      base = [30, 40, 50, 60, 70, 80, 90, 100, 200][ri(0, 8)];
      do { vals = Array.from({ length: N }, () => base + ri(-3, 3)); } while (!vals.some((v) => v > base) || !vals.some((v) => v < base));
      st = 0; moved = 0; run++; busy = false; draw();
    }
    function pm() {
      let P = 0, M = 0;
      vals.forEach((v) => { if (v > base) P += v - base; else M += base - v; });
      return [P, M];
    }
    function draw() {
      g.innerHTML = '';
      blocks = []; holes = [];
      const sum = vals.reduce((s, v) => s + v, 0), [P, M] = pm();
      head.textContent = `${vals.join(' + ')} = ${st === 2 && !busy ? sum : '?'}`;
      head2.textContent = '';
      if (st >= 1) {
        S('line', { x1: 52, x2: W - 14, y1: BL, y2: BL, class: 's2 dash' }, g);
        T(g, 30, BL - 4, '基准', 'ts t2 tb');
        T(g, 30, BL + 12, String(base), 'ts t2 tb');
      }
      vals.forEach((v, i) => {
        const x = bx(i), dv = v - base, top = BL - dv * U;
        if (st === 0) {
          S('rect', { x, y: top, width: BW, height: BOT - top, class: 'f1s s1' }, g);
        } else {
          S('rect', { x, y: Math.max(top, BL), width: BW, height: BOT - Math.max(top, BL), class: 'f1s s1' }, g);
          for (let j = 0; j < dv; j++) blocks.push({ x, y: BL - (j + 1) * U, i, j });
          for (let j = -dv - 1; j >= 0; j--) holes.push({ x, y: BL + j * U });
          T(g, x + BW / 2, BOT + 18, dv > 0 ? `+${dv}` : dv < 0 ? `−${-dv}` : '0', dv > 0 ? 't2 tb' : dv < 0 ? 't1 tb' : 'tm');
        }
        T(g, x + BW / 2, (st === 0 ? top : Math.min(top, BL)) - 8, String(v), 'tb');
      });
      if (st >= 1) {
        // 每个柱子里多出的小块，从上往下取
        blocks.sort((p, q) => p.i - q.i || q.j - p.j);
        holes.forEach((h, k) => { h.el = S('rect', { x: h.x + 2, y: h.y + 1, width: BW - 4, height: U - 2, class: k < moved ? 'f2' : 'fnone s1 dash thin' }, g); });
        blocks.forEach((b, k) => {
          const to = k < moved ? holes[k] : b;
          if (k < moved) S('rect', { x: b.x + 2, y: b.y + 1, width: BW - 4, height: U - 2, class: 'fnone s2 dash thin' }, g);
          b.el = S('rect', { x: to.x + 2, y: to.y + 1, width: BW - 4, height: U - 2, rx: 2, class: 'f2' }, g);
        });
      }
      if (st === 0) read.innerHTML = `这 ${N} 个数都在 <b>${base}</b> 左右。一个一个加很麻烦，试试“找基准数”：点“下一步”。`;
      else if (st === 1) read.innerHTML = `把 ${base} 当作<b>基准数</b>。比 ${base} 多的部分是橙色小块，一共多 <span class="k2">${P}</span>；比 ${base} 少的部分是虚线空格，一共少 <span class="k1">${M}</span>。点“下一步”移多补少。`;
      else if (!busy) {
        const tail = P >= M ? `${base * N} + ${P - M} = ${sum}` : `${base * N} − ${M - P} = ${sum}`;
        head2.textContent = `= ${base} × ${N} + ${P} − ${M} = ${sum}`;
        read.innerHTML = `多的补给少的，${P === M ? '正好补平' : P > M ? `还多出 <b>${P - M}</b>` : `还少 <b>${M - P}</b>`}。所以总和 = 基准数 × 个数 ${P >= M ? '+ 多出的' : '− 少的'}：${base} × ${N} = ${base * N}，${tail}。`;
      }
    }
    function next() {
      if (busy) return;
      if (st === 0) { st = 1; draw(); return; }
      if (st === 2) { st = 0; moved = 0; draw(); return; }
      st = 2; busy = true; moved = 0; draw();
      const my = run, m = Math.min(blocks.length, holes.length);
      read.innerHTML = '把多出来的小块搬去补空格……';
      const step = () => {
        if (my !== run) return;
        if (moved >= m) { busy = false; draw(); return; }
        const b = blocks[moved], h = holes[moved];
        tween(450, (t) => { b.el.setAttribute('x', lerp(b.x, h.x, t) + 2); b.el.setAttribute('y', lerp(b.y, h.y, t) - 26 * Math.sin(t * PI) + 1); }, () => {
          if (my !== run) return;
          h.el.setAttribute('class', 'f2');
          moved++; later(120, step);
        });
      };
      step();
    }
    btn(c, '下一步', next);
    btn(c, '换一组数', () => gen(), 'alt');
    base = 50; vals = [48, 52, 49, 53, 51, 47]; draw();
  };

  // ───────────── 找规律：数列逐项出现，标出差 ─────────────
  A.o_pattern_seq = function (el) {
    const W = 460, Hh = 200, N = 8, BY = 80;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    H('span', {}, row, '规律类型：');
    const sel = H('select', {}, row);
    [['ap', '每次加同一个数'], ['grow', '加的数越来越大'], ['geo', '每次乘同一个数'], ['fib', '前两项相加'], ['alt', '两列数交替']].forEach(([v, t]) => H('option', { value: v }, sel, t));
    const c = ctrl(el);
    const row2 = H('div', { class: 'anim-row' }, el);
    H('span', {}, row2, '你猜下一项是');
    const inp = H('input', { class: 'anim-input', type: 'text', inputmode: 'numeric', 'aria-label': '下一项' }, row2);
    let type = 'ap', seq = [], P = {}, shown = 4, d2 = false, msg = '';
    const bx = (i) => 38 + i * 55;
    function make(fixed) {
      seq = [];
      if (fixed) { seq = [3, 7, 11, 15, 19, 23, 27, 31]; P = { d: 4 }; }
      else if (type === 'ap') { const a = ri(1, 9), d = ri(2, 9); P = { d }; for (let i = 0; i < N; i++) seq.push(a + i * d); }
      else if (type === 'grow') { let t = ri(1, 5); const d0 = ri(1, 3); P = { d0 }; for (let i = 0; i < N; i++) { seq.push(t); t += d0 + i; } }
      else if (type === 'geo') { const [a, q] = [[1, 3], [1, 2], [2, 2], [3, 2], [5, 2], [2, 3]][ri(0, 5)]; P = { q }; let t = a; for (let i = 0; i < N; i++) { seq.push(t); t *= q; } }
      else if (type === 'fib') { seq.push(ri(1, 3), ri(1, 4)); while (seq.length < N) seq.push(seq[seq.length - 2] + seq[seq.length - 1]); P = {}; }
      else { const p = ri(1, 6), s1 = ri(2, 4), q = ri(30, 45), s2 = ri(2, 5); P = { s1, s2 }; for (let i = 0; i < N; i++) seq.push(i % 2 === 0 ? p + (i / 2) * s1 : q - ((i - 1) / 2) * s2); }
      shown = 4; d2 = false; inp.value = ''; msg = ''; draw(-1);
    }
    function draw(pop) {
      g.innerHTML = '';
      for (let i = 0; i < Math.min(shown + 1, N); i++) {
        const gi = S('g', { transform: tr(bx(i), BY) }, g);
        if (i < shown) {
          S('rect', { x: -24, y: -18, width: 48, height: 36, rx: 8, class: i === pop ? 'f2s s2' : 'f1s s1' }, gi);
          T(gi, 0, 5, String(seq[i]), 'tb');
          if (i === pop) tween(380, (t) => gi.setAttribute('transform', `${tr(bx(i), BY)} scale(${lerp(0.3, 1, t)})`));
        } else {
          S('rect', { x: -24, y: -18, width: 48, height: 36, rx: 8, class: 'fnone smuted dash' }, gi);
          T(gi, 0, 5, '?', 'tb tm');
        }
      }
      const mids = [];
      if (type === 'ap' || type === 'grow' || type === 'geo') {
        for (let i = 0; i + 1 < shown; i++) {
          const m = (bx(i) + bx(i + 1)) / 2;
          mids.push(m);
          S('path', { d: `M${bx(i) + 6},${BY + 20} Q${m},${BY + 46} ${bx(i + 1) - 6},${BY + 20}`, class: 's2 fnone thin' }, g);
          T(g, m, BY + 52, type === 'geo' ? `×${P.q}` : `+${seq[i + 1] - seq[i]}`, 'ts t2 tb');
        }
        if (d2 && type !== 'geo') {
          for (let i = 0; i + 1 < mids.length; i++) {
            const dd = (seq[i + 2] - seq[i + 1]) - (seq[i + 1] - seq[i]);
            S('path', { d: `M${mids[i]},${BY + 58} L${bx(i + 1)},${BY + 76} L${mids[i + 1]},${BY + 58}`, class: 's3 fnone thin' }, g);
            T(g, bx(i + 1), BY + 92, `+${dd}`, 'ts t3 tb');
          }
        }
      } else if (type === 'fib') {
        for (let i = 2; i < shown; i++) T(g, bx(i), BY + 38, `${seq[i - 2]}+${seq[i - 1]}`, 'ts t2');
      } else {
        for (let i = 0; i + 2 < shown; i++) {
          const up = i % 2 === 0, yy = up ? BY - 20 : BY + 20, cy = up ? BY - 52 : BY + 52;
          S('path', { d: `M${bx(i)},${yy} Q${bx(i + 1)},${cy} ${bx(i + 2)},${yy}`, class: (up ? 's1' : 's2') + ' fnone thin' }, g);
          T(g, bx(i + 1), up ? BY - 42 : BY + 54, up ? `+${P.s1}` : `−${P.s2}`, 'ts tb ' + (up ? 't1' : 't2'));
        }
      }
      const diffs = seq.slice(1, shown).map((v, i) => v - seq[i]);
      const rule = {
        ap: `相邻两项的差都是 <b>${P.d}</b>：每次加 ${P.d}。${d2 ? '差都一样，所以“差的差”都是 0。' : ''}`,
        grow: `相邻两项的差是 ${diffs.join('、')}……差每次多 1。${d2 ? '下面绿色的“差的差”都是 +1。' : '点“看差的差”再算一层。'}`,
        geo: `后一项是前一项的 <b>${P.q}</b> 倍：每次乘 ${P.q}。（相邻的差是 ${diffs.slice(0, 3).join('、')}……没有规律时，就试试看倍数。）`,
        fib: '从第 3 项起，每一项都等于<b>它前面两项的和</b>。',
        alt: `单数位置（第 1、3、5……项）每次加 ${P.s1}；双数位置（第 2、4、6……项）每次减 ${P.s2}。两列数要<b>分开看</b>。`
      }[type];
      const nx = shown < N ? '下一项是多少？在下面填一填，或者点“出下一项”。' : '8 项都出来了，点“换数字”再来一组。';
      read.innerHTML = (msg ? msg + '<br>' : '') + rule + ' ' + nx;
      msg = '';
    }
    btn(c, '出下一项', () => { if (shown < N) { shown++; msg = `第 ${shown} 项是 <b>${seq[shown - 1]}</b>。`; draw(shown - 1); } else draw(-1); });
    btn(c, '看差的差', () => {
      if (type !== 'ap' && type !== 'grow') { msg = '这种数列看“倍数”或“前两项”更清楚，不用再算差的差。'; draw(-1); return; }
      d2 = !d2; draw(-1);
    }, 'alt');
    btn(c, '换数字', () => make(false), 'alt');
    btn(row2, '检查', () => {
      if (shown >= N) { msg = '已经出完 8 项了。'; draw(-1); return; }
      const v = Number(inp.value.trim());
      if (inp.value.trim() !== '' && v === seq[shown]) { shown++; msg = `<span class="k3">答对了！</span>第 ${shown} 项就是 ${v}。`; inp.value = ''; draw(shown - 1); }
      else { msg = '<span class="k2">还不对</span>，再看看相邻两项是怎么变的。'; draw(-1); }
    });
    sel.addEventListener('change', () => { type = sel.value; make(false); });
    make(true);
  };

  // ───────────── 找规律：摆小棒 ─────────────
  A.o_pattern_stick = function (el) {
    const W = 440, Hh = 200;
    const svg = stage(el, W, Hh);
    const title = T(svg, W / 2, 30, '', 'tl tb');
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    H('span', {}, row, '摆什么：');
    const sel = H('select', {}, row);
    [['tri', '一排三角形'], ['sq', '一排正方形']].forEach(([v, t]) => H('option', { value: v }, sel, t));
    const c = ctrl(el);
    let shape = 'tri', n = 1;
    function figs(sh, k) {
      const out = [];
      if (sh === 'tri') {
        const s = 46, x0 = 40, yb = 140, yt = 100;
        const B = (i) => [x0 + i * s, yb], Tp = (i) => [x0 + s / 2 + i * s, yt];
        for (let f = 0; f < k; f++) {
          if (f === 0) out.push([[B(0), B(1)], [B(0), Tp(0)], [B(1), Tp(0)]]);
          else if (f % 2 === 1) { const m = (f - 1) / 2; out.push([[Tp(m), Tp(m + 1)], [B(m + 1), Tp(m + 1)]]); }
          else { const j = f / 2; out.push([[B(j), B(j + 1)], [Tp(j), B(j + 1)]]); }
        }
      } else {
        const s = 40, x0 = 40, y0 = 96;
        for (let f = 0; f < k; f++) {
          const xl = x0 + f * s, xr = xl + s;
          const top = [[xl, y0], [xr, y0]], bot = [[xl, y0 + s], [xr, y0 + s]], right = [[xr, y0], [xr, y0 + s]];
          out.push(f === 0 ? [[[xl, y0], [xl, y0 + s]], top, bot, right] : [top, right, bot]);
        }
      }
      return out;
    }
    function draw(anim) {
      g.innerHTML = '';
      figs(shape, n).forEach((fig, f) => {
        const isNew = anim && f === n - 1;
        fig.forEach(([p, q], k) => {
          const ln = S('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: (isNew ? 's2' : 'sstrong') + ' thick round' }, g);
          const hd = S('circle', { cx: q[0], cy: q[1], r: 4, class: 'f2' }, g);
          if (isNew) {
            ln.setAttribute('x2', p[0]); ln.setAttribute('y2', p[1]); hd.setAttribute('opacity', 0);
            later(k * 260, () => tween(340, (t) => { ln.setAttribute('x2', lerp(p[0], q[0], t)); ln.setAttribute('y2', lerp(p[1], q[1], t)); }, () => hd.setAttribute('opacity', 1)));
          }
        });
        const lx = shape === 'tri' ? 40 + 23 + f * 23 : 40 + f * 40 + 20;
        T(g, lx, shape === 'tri' ? 162 : 158, String(f + 1), 'ts tm');
      });
      const F = shape === 'tri' ? 3 : 4, Ad = shape === 'tri' ? 2 : 3, nm = shape === 'tri' ? '三角形' : '正方形';
      const tot = F + Ad * (n - 1);
      title.textContent = `摆 ${n} 个${nm}：${tot} 根小棒`;
      const list = Array.from({ length: n }, (_, i) => F + Ad * i);
      read.innerHTML = `根数：${list.join(' → ')}。第 1 个${nm}用 ${F} 根，以后每多摆一个只要再加 <b>${Ad}</b> 根（有 1 根和前一个${nm}共用）。<br>摆 ${n} 个：${F} + ${Ad} × ${n - 1} = <b>${tot}</b> 根。照这样摆 20 个：${F} + ${Ad} × 19 = ${F + Ad * 19} 根。`;
    }
    btn(c, '再摆一个 +', () => { if (n < 9) { n++; draw(true); } });
    btn(c, '拿走一个 −', () => { if (n > 1) { n--; draw(false); } }, 'alt');
    btn(c, '从头摆', () => { n = 1; draw(true); }, 'alt');
    sel.addEventListener('change', () => { shape = sel.value; n = 1; draw(true); });
    n = 3; draw(false);
  };

  // ───────────── 数图形：线段、角、三角形按顺序数 ─────────────
  A.o_count_fig_line = function (el) {
    const W = 440, Hh = 256;
    const svg = stage(el, W, Hh);
    const gB = S('g', {}, svg), gH = S('g', {}, svg), gL = S('g', {}, svg);
    const cnt = T(svg, W - 12, 26, '', 'tl tb t2', 'end');
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const sel = H('select', {}, row);
    [['seg', '数线段'], ['ang', '数角'], ['tri', '数三角形']].forEach(([v, t]) => H('option', { value: v }, sel, t));
    const c = ctrl(el);
    let mode = 'seg', n = 4, list = [], k = 0, run = 0;
    slider(row, 'cfl', '点数', 2, 7, 1, n, (v) => { n = v; reset(); });
    const LET = 'ABCDEFGH';
    const O = [50, 232], RAD = 200, APEX = [220, 36];
    const ang = (i) => ((8 + (i * 70) / Math.max(1, n - 1)) * PI) / 180;
    const P = (i) => {
      if (mode === 'ang') return [O[0] + RAD * Math.cos(ang(i)), O[1] - RAD * Math.sin(ang(i))];
      return [40 + (i * 360) / (n - 1), mode === 'seg' ? 140 : 226];
    };
    const Lt = (i) => (mode === 'tri' ? LET[i + 1] : LET[i]);
    const unit = () => (mode === 'seg' ? '条' : '个');
    const word = () => ({ seg: '线段', ang: '角', tri: '三角形' }[mode]);
    const name = (f) => (mode === 'seg' ? `线段 ${Lt(f.i)}${Lt(f.j)}` : mode === 'ang' ? `∠${Lt(f.i)}O${Lt(f.j)}` : `△A${Lt(f.i)}${Lt(f.j)}`);
    function base() {
      gB.innerHTML = ''; gL.innerHTML = '';
      if (mode === 'seg') {
        S('line', { x1: P(0)[0], y1: 140, x2: P(n - 1)[0], y2: 140, class: 'sstrong' }, gB);
        for (let i = 0; i < n; i++) { S('circle', { cx: P(i)[0], cy: 140, r: 5, class: 'f1' }, gL); T(gL, P(i)[0], 120, Lt(i), 'tl tb'); }
      } else if (mode === 'ang') {
        for (let i = 0; i < n; i++) { const p = P(i); S('line', { x1: O[0], y1: O[1], x2: p[0], y2: p[1], class: 'sstrong' }, gB); T(gL, O[0] + (RAD + 16) * Math.cos(ang(i)), O[1] - (RAD + 16) * Math.sin(ang(i)) + 6, Lt(i), 'tl tb'); }
        S('circle', { cx: O[0], cy: O[1], r: 4, class: 'fstrong' }, gL);
        T(gL, O[0] - 14, O[1] + 4, 'O', 'tl tb');
      } else {
        S('line', { x1: P(0)[0], y1: 226, x2: P(n - 1)[0], y2: 226, class: 'sstrong' }, gB);
        for (let i = 0; i < n; i++) { const p = P(i); S('line', { x1: APEX[0], y1: APEX[1], x2: p[0], y2: p[1], class: 'sstrong' }, gB); T(gL, p[0], 246, Lt(i), 'tl tb'); }
        T(gL, APEX[0] + 16, APEX[1] + 2, 'A', 'tl tb');
      }
    }
    function hi(f) {
      gH.innerHTML = '';
      if (!f) return;
      if (mode === 'seg') {
        S('line', { x1: P(f.i)[0], y1: 140, x2: P(f.j)[0], y2: 140, class: 's2 round', style: 'stroke-width:8;opacity:.75' }, gH);
      } else if (mode === 'ang') {
        const r = 70, a1 = ang(f.i), a2 = ang(f.j);
        S('path', { d: `M${O[0]},${O[1]} L${O[0] + r * Math.cos(a1)},${O[1] - r * Math.sin(a1)} A${r},${r} 0 0 0 ${O[0] + r * Math.cos(a2)},${O[1] - r * Math.sin(a2)} Z`, class: 'f2s' }, gH);
        [f.i, f.j].forEach((i) => { const p = P(i); S('line', { x1: O[0], y1: O[1], x2: p[0], y2: p[1], class: 's2 thick' }, gH); });
      } else {
        S('polygon', { points: [APEX, P(f.i), P(f.j)].map((p) => p.join(',')).join(' '), class: 'f2s s2 thick round' }, gH);
      }
    }
    function reset() {
      run++;
      list = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) list.push({ i, j });
      k = 0; base(); hi(null); cnt.textContent = '';
      const tot = list.length;
      read.innerHTML = {
        seg: `线段上一共有 ${n} 个点（两个端点也算）。按顺序数：先数以 A 为左端点的，再数以 B 为左端点的……这样不重复、不遗漏。`,
        ang: `从点 O 出发有 ${n} 条射线，每两条射线组成一个角。按顺序数：先数以 OA 为一边的角，再数以 OB 为一边的……`,
        tri: `从顶点 A 向底边连了 ${n} 条线。每个三角形都有一条边躺在底边上，所以数三角形就是数底边上的线段。`
      }[mode] + (tot ? '' : '（只有 1 个点，数不出来，把点数调大一些。）');
    }
    function showOne() {
      if (k >= list.length) return false;
      const f = list[k]; k++;
      hi(f);
      cnt.textContent = `${k} ${unit()}`;
      const groups = [];
      for (let s = 0; s <= f.i; s++) groups.push(s < f.i ? n - 1 - s : f.j - f.i);
      let txt = `第 ${k} 个：<b>${name(f)}</b>（${mode === 'ang' ? `以 O${Lt(f.i)} 为一边` : mode === 'tri' ? `底边是 ${Lt(f.i)}${Lt(f.j)}` : `左端点是 ${Lt(f.i)}`}）<br>已经数了：${groups.join(' + ')}`;
      if (k === list.length) {
        const full = Array.from({ length: n - 1 }, (_, s) => n - 1 - s);
        txt = `第 ${k} 个：<b>${name(f)}</b>。数完了！<br>一共 ${full.join(' + ')} = <b>${k}</b> ${unit()}${word()}。公式：${n} × ${n - 1} ÷ 2 = ${k}。`;
      }
      read.innerHTML = txt;
      return true;
    }
    btn(c, '数下一个', () => { run++; if (!showOne()) reset(); });
    btn(c, '自动数', () => {
      const my = ++run;
      if (k >= list.length) { k = 0; }
      const step = () => { if (my !== run) return; if (showOne()) later(600, step); };
      step();
    });
    btn(c, '重来', reset, 'alt');
    sel.addEventListener('change', () => { mode = sel.value; reset(); });
    reset();
  };

  // ───────────── 数图形：长方形、正方形 ─────────────
  A.o_count_fig_rect = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const gB = S('g', {}, svg), gH = S('g', {}, svg);
    const cnt = T(svg, W - 12, 26, '', 'tl tb t2', 'end');
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const sel = H('select', {}, row);
    [['rect', '数长方形（正方形也算）'], ['sq', '只数正方形']].forEach(([v, t]) => H('option', { value: v }, sel, t));
    const row2 = H('div', { class: 'anim-row' }, el);
    let m = 3, r = 2, mode = 'rect', list = [], k = 0, run = 0, cs, gx, gy;
    slider(row2, 'cfm', '横着几格', 1, 5, 1, m, (v) => { m = v; reset(); });
    slider(row2, 'cfr', '竖着几格', 1, 4, 1, r, (v) => { r = v; reset(); });
    const c = ctrl(el);
    const tri = (q) => (q * (q + 1)) / 2;
    function reset() {
      run++;
      cs = Math.min(60, 320 / m, 170 / r); gx = (W - m * cs) / 2 + 10; gy = 52 + (180 - r * cs) / 2;
      gB.innerHTML = ''; gH.innerHTML = ''; cnt.textContent = '';
      for (let i = 0; i <= m; i++) S('line', { x1: gx + i * cs, y1: gy, x2: gx + i * cs, y2: gy + r * cs, class: 'sstrong' }, gB);
      for (let j = 0; j <= r; j++) S('line', { x1: gx, y1: gy + j * cs, x2: gx + m * cs, y2: gy + j * cs, class: 'sstrong' }, gB);
      if (mode === 'rect') {
        S('line', { x1: gx, y1: gy - 14, x2: gx + m * cs, y2: gy - 14, class: 'smuted' }, gB);
        S('line', { x1: gx - 14, y1: gy, x2: gx - 14, y2: gy + r * cs, class: 'smuted' }, gB);
        for (let i = 0; i <= m; i++) S('circle', { cx: gx + i * cs, cy: gy - 14, r: 3, class: 'fmuted' }, gB);
        for (let j = 0; j <= r; j++) S('circle', { cx: gx - 14, cy: gy + j * cs, r: 3, class: 'fmuted' }, gB);
      }
      list = [];
      if (mode === 'rect') {
        for (let a = 0; a < m; a++) for (let b = a + 1; b <= m; b++) for (let p = 0; p < r; p++) for (let q = p + 1; q <= r; q++) list.push({ a, b, p, q });
      } else {
        for (let s = 1; s <= Math.min(m, r); s++) for (let p = 0; p + s <= r; p++) for (let a = 0; a + s <= m; a++) list.push({ a, b: a + s, p, q: p + s });
      }
      k = 0;
      read.innerHTML = mode === 'rect'
        ? `这是 ${m} × ${r} 的方格。每个长方形由<b>一条横边</b>和<b>一条竖边</b>决定。点“数下一个”或“自动数”，看上方和左边的彩色线段怎么变。`
        : `只数正方形：按大小分类，先数 1 × 1 的，再数 2 × 2 的……`;
    }
    function showOne() {
      if (k >= list.length) return false;
      const f = list[k]; k++;
      gH.innerHTML = '';
      S('rect', { x: gx + f.a * cs + 3, y: gy + f.p * cs + 3, width: (f.b - f.a) * cs - 6, height: (f.q - f.p) * cs - 6, rx: 4, class: 'f2s s2 thick', style: 'fill-opacity:.75' }, gH);
      if (mode === 'rect') {
        S('line', { x1: gx + f.a * cs, y1: gy - 14, x2: gx + f.b * cs, y2: gy - 14, class: 's1 round', style: 'stroke-width:6' }, gH);
        S('line', { x1: gx - 14, y1: gy + f.p * cs, x2: gx - 14, y2: gy + f.q * cs, class: 's3 round', style: 'stroke-width:6' }, gH);
      }
      cnt.textContent = `${k} 个`;
      const w = f.b - f.a, h = f.q - f.p;
      if (k < list.length) {
        read.innerHTML = `第 ${k} 个：${mode === 'rect' ? `长 ${w} 格、宽 ${h} 格` : `${w} × ${w} 的正方形`}。`;
      } else if (mode === 'rect') {
        const Hs = tri(m), Vs = tri(r);
        read.innerHTML = `数完了，一共 <b>${k}</b> 个。<br>横着看：上边有 ${m + 1} 个点，能组成 ${Array.from({ length: m }, (_, i) => m - i).join(' + ')} = <span class="k1">${Hs}</span> 条线段；竖着看：左边有 ${r + 1} 个点，能组成 <span class="k3">${Vs}</span> 条线段。<br>长方形个数 = ${Hs} × ${Vs} = ${Hs * Vs}。`;
      } else {
        const parts = [];
        for (let s = 1; s <= Math.min(m, r); s++) parts.push(`${s} × ${s} 的有 ${m - s + 1} × ${r - s + 1} = ${(m - s + 1) * (r - s + 1)} 个`);
        read.innerHTML = `数完了，一共 <b>${k}</b> 个正方形。<br>${parts.join('；')}。`;
      }
      return true;
    }
    btn(c, '数下一个', () => { run++; if (!showOne()) { reset(); } });
    btn(c, '自动数', () => {
      const my = ++run;
      if (k >= list.length) k = 0;
      const delay = Math.max(70, Math.min(500, 7000 / list.length));
      const step = () => { if (my !== run) return; if (showOne()) later(delay, step); };
      step();
    });
    btn(c, '直接看结果', () => { run++; k = list.length - 1; showOne(); }, 'alt');
    btn(c, '重来', reset, 'alt');
    sel.addEventListener('change', () => { mode = sel.value; reset(); });
    reset();
  };

  // ───────────── 逻辑推理：列表格打 ✓ ✗ ─────────────
  A.o_logic_table = function (el) {
    const W = 420, Hh = 212;
    const PZ = [
      { rows: ['小明', '小红', '小刚'], cols: ['足球', '跳绳', '游泳'], verb: '喜欢', intro: '小明、小红、小刚各喜欢一种运动，三人喜欢的各不相同。',
        clues: [{ t: '小明不喜欢足球，也不喜欢游泳。', x: [[0, 0], [0, 2]] }, { t: '小红不喜欢足球。', x: [[1, 0]] }] },
      { rows: ['甲', '乙', '丙'], cols: ['语文', '数学', '英语'], verb: '教', intro: '甲、乙、丙三位老师分别教语文、数学、英语，每人只教一门。',
        clues: [{ t: '乙不教语文，也不教数学。', x: [[1, 0], [1, 1]] }, { t: '甲不教数学。', x: [[0, 1]] }] },
      { rows: ['小兰', '小芳', '小丽'], cols: ['红裙', '黄裙', '蓝裙'], verb: '穿', intro: '小兰、小芳、小丽穿的裙子颜色各不相同，有红、黄、蓝三种。',
        clues: [{ t: '小兰不穿红裙。', x: [[0, 0]] }, { t: '小芳既不穿黄裙，也不穿蓝裙。', x: [[1, 1], [1, 2]] }, { t: '小丽和穿蓝裙的人是同桌。', note: '小丽不穿蓝裙', x: [[2, 2]] }] }
    ];
    const clueP = H('p', { class: 'anim-tip' }, el);
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, P, grid, used = 0, busy = false, run = 0, cellT, cellR;
    const CX = (j) => 170 + j * 90, RY = (i) => 80 + i * 44;
    function setMark(i, j, mk, anim) {
      grid[i][j] = mk;
      const t = cellT[i][j];
      t.textContent = mk === 'v' ? '✓' : mk === 'x' ? '✗' : '';
      t.setAttribute('class', mk === 'v' ? 't3 txl' : 't2 txl');
      cellR[i][j].setAttribute('class', mk === 'v' ? 'f3s sline' : 'fsurf sline');
      if (anim && mk) tween(320, (tt) => t.setAttribute('transform', `scale(${lerp(1.9, 1, tt)})`));
      else t.removeAttribute('transform');
    }
    function showClues() {
      clueP.innerHTML = `<b>${P.intro}</b><br>` + P.clues.map((cl, i) => `${i < used ? '✔' : '　'} 线索 ${i + 1}：${cl.t}`).join('<br>') + '<br>（也可以自己点格子，打 ✗ 或 ✓。）';
    }
    function load(k) {
      run++; busy = false; pi = k; P = PZ[pi]; used = 0;
      grid = [0, 1, 2].map(() => ['', '', '']);
      g.innerHTML = '';
      P.cols.forEach((cn, j) => T(g, CX(j), 36, cn, 'tb'));
      cellT = []; cellR = [];
      P.rows.forEach((rn, i) => {
        T(g, 64, RY(i) + 5, rn, 'tb');
        cellT.push([]); cellR.push([]);
        P.cols.forEach((cn, j) => {
          const gc = S('g', { transform: tr(CX(j), RY(i)), class: 'clickable' }, g);
          cellR[i].push(S('rect', { x: -43, y: -20, width: 86, height: 40, class: 'fsurf sline' }, gc));
          const t = T(gc, 0, 10, '', 't2 txl');
          cellT[i].push(t);
          gc.addEventListener('click', () => {
            if (busy) return;
            const nx = grid[i][j] === '' ? 'x' : grid[i][j] === 'x' ? 'v' : '';
            setMark(i, j, nx, true);
            read.innerHTML = `你在“${P.rows[i]} — ${P.cols[j]}”${nx === 'x' ? '打了 ✗' : nx === 'v' ? '打了 ✓' : '擦掉了记号'}。`;
          });
        });
      });
      S('rect', { x: CX(0) - 43, y: RY(0) - 20, width: 266, height: 128, class: 'fnone sstrong' }, g);
      showClues();
      read.innerHTML = '从最确定的线索下手。点“用下一条线索”，看每一步怎么打 ✗ 和 ✓。<b>每一行、每一列都只能有一个 ✓。</b>';
    }
    function infer() {
      const R = P.rows, C = P.cols, v = P.verb;
      for (let r = 0; r < 3; r++) for (let cc = 0; cc < 3; cc++) {
        if (grid[r][cc] !== 'v') continue;
        for (let j = 0; j < 3; j++) if (j !== cc && grid[r][j] === '') return { r, c: j, m: 'x', why: `${R[r]}已经确定${v}${C[cc]}，一人只${v}一样，所以${R[r]}不${v}${C[j]}：打 ✗。` };
        for (let i = 0; i < 3; i++) if (i !== r && grid[i][cc] === '') return { r: i, c: cc, m: 'x', why: `${v}${C[cc]}的已经是${R[r]}了，所以${R[i]}不${v}${C[cc]}：打 ✗。` };
      }
      for (let r = 0; r < 3; r++) {
        if (grid[r].includes('v')) continue;
        const open = [0, 1, 2].filter((j) => grid[r][j] === '');
        if (open.length === 1) return { r, c: open[0], m: 'v', why: `${R[r]}这一行只剩“${C[open[0]]}”没被排除，所以${R[r]}${v}${C[open[0]]}：打 ✓。` };
      }
      for (let cc = 0; cc < 3; cc++) {
        if ([0, 1, 2].some((i) => grid[i][cc] === 'v')) continue;
        const open = [0, 1, 2].filter((i) => grid[i][cc] === '');
        if (open.length === 1) return { r: open[0], c: cc, m: 'v', why: `“${C[cc]}”这一列只剩${R[open[0]]}没被排除，所以${R[open[0]]}${v}${C[cc]}：打 ✓。` };
      }
      return null;
    }
    function finish() {
      const solved = grid.every((rw) => rw.includes('v'));
      if (solved) read.innerHTML += '<br><b class="k3">推理完成：</b>' + P.rows.map((rn, i) => `${rn}${P.verb}${P.cols[grid[i].indexOf('v')]}`).join('，') + '。';
      else if (used < P.clues.length) read.innerHTML += '<br>现在还推不出来，点“用下一条线索”。';
    }
    function applyClue() {
      if (busy) return;
      if (used >= P.clues.length) { read.innerHTML = '线索都用完了。点“重来”再推一遍，或者“换一道题”。'; return; }
      busy = true;
      const my = run, cl = P.clues[used++];
      showClues();
      const marks = cl.x.filter(([i, j]) => grid[i][j] !== 'x');
      read.innerHTML = `线索 ${used}：${cl.t}${cl.note ? `也就是说：<b>${cl.note}</b>。` : ''}先在对应的格子打 ✗。`;
      let q = 0;
      const stepInf = () => {
        if (my !== run) return;
        const inf = infer();
        if (!inf) { busy = false; finish(); return; }
        setMark(inf.r, inf.c, inf.m, true);
        read.innerHTML = inf.why;
        later(900, stepInf);
      };
      const stepX = () => {
        if (my !== run) return;
        if (q < marks.length) { const [i, j] = marks[q++]; setMark(i, j, 'x', true); later(500, stepX); return; }
        later(500, stepInf);
      };
      later(300, stepX);
    }
    btn(c, '用下一条线索', applyClue);
    btn(c, '换一道题', () => load((pi + 1) % PZ.length), 'alt');
    btn(c, '重来', () => load(pi), 'alt');
    load(0);
  };

  // ───────────── 逻辑推理：真话假话（假设法） ─────────────
  A.o_logic_liar = function (el) {
    const W = 460, Hh = 236;
    const PZ = [
      { intro: '花瓶被甲、乙、丙中的一个人打碎了。三人中<b>只有一人说了真话</b>。是谁打碎的？', act: '打碎的', need: 1, needTxt: '题目说只有 1 句真话',
        say: ['是乙打碎的。', '不是我打碎的。', '不是我打碎的。'], f: [(k) => k === 1, (k) => k !== 1, (k) => k !== 2] },
      { intro: '蛋糕被甲、乙、丙中的一个人偷吃了。三人中<b>只有一人说了假话</b>。是谁吃的？', act: '吃的', need: 2, needTxt: '题目说只有 1 句假话，也就是要有 2 句真话',
        say: ['是乙吃的。', '是丙吃的。', '不是我吃的。'], f: [(k) => k === 1, (k) => k === 2, (k) => k !== 2] }
    ];
    const WHO = ['甲', '乙', '丙'], PX = [80, 230, 380];
    const intro = H('p', { class: 'anim-tip' }, el);
    const svg = stage(el, W, Hh);
    const top = T(svg, W / 2, 24, '', 'tb');
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, P, busy = false, run = 0, tried = {};
    function render(k, res) {
      g.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const x = PX[i];
        S('path', { d: `M${x - 9},${100} L${x},${122} L${x + 9},${100}`, class: 'fsurf sstrong' }, g);
        S('rect', { x: x - 70, y: 50, width: 140, height: 52, rx: 12, class: 'fsurf sstrong' }, g);
        T(g, x, 81, P.say[i], 'tb');
        S('circle', { cx: x, cy: 158, r: 26, class: i === k ? 'f2s s2' : 'f1s s1' }, g);
        T(g, x, 165, WHO[i], 'tl tb');
        if (i === k) T(g, x, 204, `假设是${WHO[i]}${P.act}`, 'ts t2 tb');
        if (res && i < res.length) {
          const ok = res[i];
          S('circle', { cx: x + 64, cy: 52, r: 14, class: ok ? 'f3' : 'f2' }, g);
          T(g, x + 64, 58, ok ? '真' : '假', 'ts tb tw');
        }
      }
      const parts = WHO.map((w, i) => (i in tried ? `假设${w}：${tried[i] ? '✓ 符合' : '✗ 矛盾'}` : '')).filter(Boolean);
      top.textContent = parts.join('　');
    }
    function load(k) {
      run++; busy = false; pi = k; P = PZ[pi]; tried = {};
      intro.innerHTML = P.intro;
      render(-1, null);
      read.innerHTML = '不知道是谁时，就<b>一个一个假设</b>：假设是某人，再看每句话是真是假，数一数真话的句数和题目对不对得上。';
    }
    function assume(k) {
      if (busy) return;
      busy = true;
      const my = ++run, res = [];
      render(k, res);
      read.innerHTML = `假设是<b>${WHO[k]}</b>${P.act}。一句一句看：`;
      let i = 0;
      const step = () => {
        if (my !== run) return;
        if (i < 3) {
          const ok = P.f[i](k);
          res.push(ok); render(k, res);
          read.innerHTML += `<br>${WHO[i]}说“${P.say[i]}”——${ok ? '<span class="k3">真话</span>' : '<span class="k2">假话</span>'}`;
          i++; later(800, step); return;
        }
        const nT = res.filter(Boolean).length, good = nT === P.need;
        tried[k] = good; render(k, res);
        read.innerHTML += `<br>真话有 <b>${nT}</b> 句，${P.needTxt}，${good ? `<b class="k3">对得上！所以是${WHO[k]}${P.act}。</b>` : '<b class="k2">对不上，这个假设不成立。</b>'}`;
        if (Object.keys(tried).length === 3) read.innerHTML += '<br>三种假设都试过了，只有一种对得上，答案是唯一的。';
        busy = false;
      };
      later(500, step);
    }
    WHO.forEach((w, k) => btn(c, `假设是${w}`, () => assume(k)));
    btn(c, '换一道题', () => load((pi + 1) % PZ.length), 'alt');
    load(0);
  };

  // ───────────── 巧求周长：台阶形，把边平移出去 ─────────────
  A.o_perim_trick_stairs = function (el) {
    const W = 440, Hh = 292;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let Wu, Hu, s, xs, ys, u, ox, oy, st = 0, busy = false, hs = [], vs = [];
    function setShape(w, h, xx, yy) {
      Wu = w; Hu = h; xs = xx; ys = yy; s = yy.length;
      u = Math.min(36, 340 / Wu, 200 / Hu); ox = (W - Wu * u) / 2 - 10; oy = 40;
      st = 0; draw();
    }
    function gen() {
      const w = ri(6, 10), h = ri(4, 7), k = ri(2, 4);
      const pick = (max, cnt) => { const set = new Set(); while (set.size < cnt) set.add(ri(1, max - 1)); return [...set].sort((p, q) => q - p); };
      setShape(w, h, [w, ...pick(w, k - 1), 0], [0, ...pick(h, k - 1).reverse()]);
    }
    const PX = (x) => ox + x * u, PY = (y) => oy + y * u;
    function line(x1, y1, x2, y2, cls, parent) { return S('line', { x1: PX(x1), y1: PY(y1), x2: PX(x2), y2: PY(y2), class: cls }, parent || g); }
    function draw() {
      g.innerHTML = '';
      for (let x = 0; x <= Wu; x++) line(x, 0, x, Hu, 'gridl');
      for (let y = 0; y <= Hu; y++) line(0, y, Wu, y, 'gridl');
      const pts = [[0, Hu], [Wu, Hu], [Wu, 0]];
      for (let j = 1; j < s; j++) pts.push([xs[j], ys[j - 1]], [xs[j], ys[j]]);
      pts.push([0, ys[s - 1]]);
      S('polygon', { points: pts.map((p) => `${PX(p[0])},${PY(p[1])}`).join(' '), class: 'f1s' }, g);
      if (st >= 1) {
        for (let j = 1; j < s; j++) line(xs[j + 1], ys[j], xs[j], ys[j], 'smuted dash thin');
        S('rect', { x: PX(0), y: PY(0), width: Wu * u, height: Hu * u, class: 'fnone smuted dash' }, g);
      }
      if (st >= 2) for (let j = 1; j < s; j++) line(xs[j], ys[j - 1], xs[j], ys[j], 'smuted dash thin');
      line(0, Hu, Wu, Hu, 'sstrong thick round');
      line(Wu, 0, Wu, Hu, 'sstrong thick round');
      line(0, ys[s - 1], 0, Hu, 'sstrong thick round');
      hs = []; vs = [];
      for (let j = 0; j < s; j++) {
        const ln = line(xs[j + 1], ys[j], xs[j], ys[j], 's1 thick round');
        hs.push({ ln, d: ys[j] });
        if (st >= 1) ln.setAttribute('transform', tr(0, -ys[j] * u));
      }
      for (let j = 1; j < s; j++) {
        const ln = line(xs[j], ys[j - 1], xs[j], ys[j], 's3 thick round');
        vs.push({ ln, d: xs[j] });
        if (st >= 2) ln.setAttribute('transform', tr(-xs[j] * u, 0));
      }
      T(g, PX(Wu / 2), PY(Hu) + 24, `${Wu} 厘米`, 'tb');
      T(g, PX(Wu) + 8, PY(Hu / 2) + 5, `${Hu} 厘米`, 'tb', 'start');
      const P = 2 * (Wu + Hu);
      read.innerHTML = st === 0
        ? `这个“台阶形”一共有 ${2 * s + 2} 条边，一条一条量再加很麻烦。点“下一步”：把<span class="k1">蓝色的横边</span>都往上推。`
        : st === 1
          ? `蓝色横边推上去以后，正好接成一整条，和下边一样长，都是 <b>${Wu} 厘米</b>。点“下一步”：把<span class="k3">绿色的竖边</span>往左推。`
          : `绿色竖边推到左边，和左边那段接成一整条，和右边一样长，都是 <b>${Hu} 厘米</b>。<br>所以周长和长方形一样：(${Wu} + ${Hu}) × 2 = <b>${P} 厘米</b>。`;
    }
    function next() {
      if (busy) return;
      if (st === 2) { st = 0; draw(); return; }
      busy = true;
      const arr = st === 0 ? hs : vs;
      tween(1000, (t) => arr.forEach((e) => e.ln.setAttribute('transform', st === 0 ? tr(0, -e.d * u * t) : tr(-e.d * u * t, 0))), () => { st++; busy = false; draw(); });
    }
    btn(c, '下一步', next);
    btn(c, '换一个图形', () => { if (!busy) gen(); }, 'alt');
    setShape(8, 6, [8, 5, 2, 0], [0, 2, 4]);
  };

  // ───────────── 巧求周长：缺角和挖槽的区别 ─────────────
  A.o_perim_trick_notch = function (el) {
    const W = 440, Hh = 270, Wu = 10, Hu = 6, u = 30, ox = 70, oy = 52;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    const sel = H('select', {}, row);
    [['mid', '上边中间挖一个槽'], ['corner', '右上角缺一块']].forEach(([v, t]) => H('option', { value: v }, sel, t));
    let type = 'mid', d = 2, st = 0, busy = false, mv = [];
    slider(row, 'ptd', '凹进去几厘米', 1, 4, 1, d, (v) => { d = v; st = 0; draw(); });
    const c = ctrl(el);
    const PX = (x) => ox + x * u, PY = (y) => oy + y * u;
    function line(x1, y1, x2, y2, cls) { return S('line', { x1: PX(x1), y1: PY(y1), x2: PX(x2), y2: PY(y2), class: cls }, g); }
    function draw() {
      g.innerHTML = ''; mv = [];
      for (let x = 0; x <= Wu; x++) line(x, 0, x, Hu, 'gridl');
      for (let y = 0; y <= Hu; y++) line(0, y, Wu, y, 'gridl');
      const pts = type === 'mid'
        ? [[0, 0], [3, 0], [3, d], [7, d], [7, 0], [Wu, 0], [Wu, Hu], [0, Hu]]
        : [[0, 0], [7, 0], [7, d], [Wu, d], [Wu, Hu], [0, Hu]];
      S('polygon', { points: pts.map((p) => `${PX(p[0])},${PY(p[1])}`).join(' '), class: 'f1s' }, g);
      if (st) S('rect', { x: PX(0), y: PY(0), width: Wu * u, height: Hu * u, class: 'fnone smuted dash' }, g);
      line(0, Hu, Wu, Hu, 'sstrong thick round');
      line(0, 0, 0, Hu, 'sstrong thick round');
      const base = 2 * (Wu + Hu);
      if (type === 'mid') {
        line(0, 0, 3, 0, 'sstrong thick round'); line(7, 0, Wu, 0, 'sstrong thick round'); line(Wu, 0, Wu, Hu, 'sstrong thick round');
        mv.push({ ln: line(3, d, 7, d, 's1 thick round'), dx: 0, dy: -d });
        line(3, 0, 3, d, (st ? 's2' : 'sstrong') + ' thick round');
        line(7, 0, 7, d, (st ? 's2' : 'sstrong') + ' thick round');
        if (st) { T(g, PX(3) + 8, PY(d / 2) + 5, String(d), 'tb t2', 'start'); T(g, PX(7) - 8, PY(d / 2) + 5, String(d), 'tb t2', 'end'); }
        read.innerHTML = st
          ? `蓝边推上去，补上了上边的缺口；可是两条<span class="k2">橙色竖边</span>推不走——左右两边已经是完整的了，它们是<b>多出来的</b>！<br>周长 = (${Wu} + ${Hu}) × 2 + ${d} × 2 = ${base} + ${2 * d} = <b>${base + 2 * d} 厘米</b>。`
          : `一个长 ${Wu} 厘米、宽 ${Hu} 厘米的长方形，上边中间挖了一个深 ${d} 厘米的槽。周长还是 ${base} 厘米吗？点“平移”。`;
      } else {
        line(0, 0, 7, 0, 'sstrong thick round'); line(Wu, d, Wu, Hu, 'sstrong thick round');
        mv.push({ ln: line(7, d, Wu, d, 's1 thick round'), dx: 0, dy: -d });
        mv.push({ ln: line(7, 0, 7, d, 's3 thick round'), dx: 3, dy: 0 });
        read.innerHTML = st
          ? `蓝边往上推、绿边往右推，正好补成长方形缺的那个角。没有多出来的边！<br>周长 = (${Wu} + ${Hu}) × 2 = <b>${base} 厘米</b>，和没缺角时一样。`
          : `一个长 ${Wu} 厘米、宽 ${Hu} 厘米的长方形，右上角缺了一块。周长变了吗？点“平移”。`;
      }
      if (st) mv.forEach((e) => e.ln.setAttribute('transform', tr(e.dx * u, e.dy * u)));
      T(g, PX(Wu / 2), PY(Hu) + 24, `${Wu} 厘米`, 'tb');
      T(g, PX(0) - 8, PY(Hu / 2) + 5, `${Hu} 厘米`, 'tb', 'end');
    }
    btn(c, '平移', () => {
      if (busy) return;
      if (st) { st = 0; draw(); return; }
      busy = true;
      tween(1000, (t) => mv.forEach((e) => e.ln.setAttribute('transform', tr(e.dx * u * t, e.dy * u * t))), () => { st = 1; busy = false; draw(); });
    });
    sel.addEventListener('change', () => { type = sel.value; st = 0; draw(); });
    draw();
  };

  // ───────────── 巧求周长：两个长方形拼在一起 ─────────────
  A.o_perim_trick_join = function (el) {
    const W = 440, Hh = 236, u = 32, by = 196, xA = 40;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let wA = 4, hA = 3, wB = 3, hB = 2, st = 0, busy = false;
    slider(row, 'pjw', 'B 的长', 1, 4, 1, wB, (v) => { wB = v; st = 0; draw(); });
    slider(row, 'pjh', 'B 的宽', 1, 3, 1, hB, (v) => { hB = v; st = 0; draw(); });
    const c = ctrl(el);
    function draw() {
      g.innerHTML = '';
      const xBjoin = xA + wA * u, xB = lerp(xBjoin + 70, xBjoin, st);
      S('rect', { x: xA, y: by - hA * u, width: wA * u, height: hA * u, class: 'f1s s1' }, g);
      S('rect', { x: xB, y: by - hB * u, width: wB * u, height: hB * u, class: 'f2s s2' }, g);
      T(g, xA + (wA * u) / 2, by - (hA * u) / 2 + 5, `A：${wA} × ${hA}`, 'tb');
      T(g, xB + (wB * u) / 2, by - hB * u - 10, `B：${wB} × ${hB}`, 'tb');
      const PA = 2 * (wA + hA), PB = 2 * (wB + hB), sh = Math.min(hA, hB), P = PA + PB - 2 * sh;
      if (st > 0.98) {
        S('polygon', { points: [[xA, by], [xA, by - hA * u], [xBjoin, by - hA * u], [xBjoin, by - hB * u], [xBjoin + wB * u, by - hB * u], [xBjoin + wB * u, by]].map((p) => p.join(',')).join(' '), class: 'fnone sstrong thick round' }, g);
        S('line', { x1: xBjoin, y1: by - sh * u, x2: xBjoin, y2: by, class: 's2 dash', style: 'stroke-width:4' }, g);
        T(g, xBjoin + 8, by - (sh * u) / 2 + 5, `重合 ${sh}`, 'ts t2 tb', 'start');
      }
      T(g, W / 2, 26, st > 0.98 ? `拼起来后周长 = ${P} 厘米` : `周长和 = ${PA} + ${PB} = ${PA + PB} 厘米`, 'tl tb');
      read.innerHTML = st > 0.98
        ? `拼起来后，中间重合的那段（${sh} 厘米）跑到图形里面去了：A 少了一段 ${sh}，B 也少了一段 ${sh}。<br>周长 = ${PA} + ${PB} − ${sh} × 2 = <b>${P} 厘米</b>。反过来，把一个图形剪成两块，周长就多出两条切口。`
        : `A 的周长：(${wA} + ${hA}) × 2 = ${PA} 厘米；B 的周长：(${wB} + ${hB}) × 2 = ${PB} 厘米。点“拼起来”，看周长少了多少。`;
    }
    const jb = btn(c, '拼起来', () => {
      if (busy) return;
      busy = true;
      const from = st > 0.5 ? 1 : 0, to = 1 - from;
      tween(900, (t) => { st = lerp(from, to, t); draw(); }, () => { st = to; busy = false; draw(); jb.textContent = to ? '分开' : '拼起来'; });
    });
    draw();
  };

  // ───────────── 幻方：逐步填入，实时检查每行列和 ─────────────
  A.o_magic_square = function (el) {
    const W = 440, Hh = 290, gx = 40, gy = 40, cs = 60;
    const svg = stage(el, W, Hh);
    const gG = S('g', {}, svg), gF = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    H('span', {}, row, '用哪 9 个数：');
    const sel = H('select', {}, row);
    [['1', '1～9'], ['2', '2～10'], ['11', '11～19']].forEach(([v, t]) => H('option', { value: v }, sel, t));
    const c = ctrl(el);
    let s0 = 1, cells = Array(9).fill(null), pick = null, busy = false, run = 0;
    const nums = () => Array.from({ length: 9 }, (_, i) => s0 + i);
    const Mg = () => 3 * (s0 + 4);
    const cc = (p) => [gx + (p % 3) * cs + cs / 2, gy + Math.floor(p / 3) * cs + cs / 2];
    const pc = (i) => [318 + (i % 3) * 42, 76 + Math.floor(i / 3) * 42];
    const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const LPOS = [[250, 75], [250, 135], [250, 195], [70, 244], [130, 244], [190, 244], [250, 244], [16, 244]];
    function lineState() {
      return LINES.map((ln) => {
        const v = ln.map((p) => cells[p]);
        if (v.some((x) => x == null)) return { full: false, s: v.reduce((a, b) => a + (b || 0), 0) };
        const s = v[0] + v[1] + v[2];
        return { full: true, s, ok: s === Mg() };
      });
    }
    function render() {
      gG.innerHTML = '';
      for (let p = 0; p < 9; p++) {
        const [x, y] = cc(p);
        const gc = S('g', { class: 'clickable' }, gG);
        S('rect', { x: x - cs / 2, y: y - cs / 2, width: cs, height: cs, class: (p === 4 ? 'f2s' : 'fsurf') + ' sstrong' }, gc);
        if (cells[p] != null) T(gc, x, y + 10, String(cells[p]), 'txl');
        gc.addEventListener('click', () => clickCell(p));
      }
      T(gG, 360, 46, '数字卡', 'ts tm');
      nums().forEach((v, i) => {
        const [x, y] = pc(i), usedV = cells.includes(v);
        const gc = S('g', { class: 'clickable', opacity: usedV ? 0.25 : 1 }, gG);
        S('rect', { x: x - 18, y: y - 18, width: 36, height: 36, rx: 7, class: pick === v ? 'f2 s2' : 'f1s s1' }, gc);
        T(gc, x, y + 6, String(v), pick === v ? 'tb tw' : 'tb');
        gc.addEventListener('click', () => { if (busy || usedV) return; pick = pick === v ? null : v; render(); });
      });
      T(gG, 360, 228, `幻和 = ${Mg()}`, 'tl tb t2');
      const ls = lineState();
      ls.forEach((L, i) => {
        const [x, y] = LPOS[i];
        const arrow = i === 6 ? '↘' : i === 7 ? '↙' : '';
        T(gG, x, y, L.full ? `${arrow}${L.s}` : `${arrow}${L.s ? L.s + '…' : ''}`, L.full ? (L.ok ? 't3 tb' : 't2 tb') : 'tm ts');
      });
      const filled = cells.every((x) => x != null);
      if (busy) return;
      if (filled && ls.every((L) => L.ok)) read.innerHTML = `<b class="k3">成功！</b>每行、每列、两条对角线的和都是 ${Mg()}。`;
      else if (filled) read.innerHTML = `填满了，但<span class="k2">橙色</span>的那几条线不是 ${Mg()}。点格子可以把数拿回来重新放。`;
    }
    function clickCell(p) {
      if (busy) return;
      if (pick != null) { cells[p] = pick; pick = null; read.innerHTML = '每放一个数，右边和下面会算出这条线现在的和。绿色表示这条线已经等于幻和。'; }
      else if (cells[p] != null) { cells[p] = null; read.innerHTML = '把这个数拿回来了。'; }
      else { read.innerHTML = '先点右边的一张数字卡，再点格子。'; return; }
      render();
    }
    function intro() {
      const sum = nums().reduce((a, b) => a + b, 0);
      read.innerHTML = `${s0} 到 ${s0 + 8} 这 9 个数的和是 ${sum}，平均分给 3 行，每行是 ${sum} ÷ 3 = <b>${Mg()}</b>，这就是“幻和”。先点一张数字卡，再点格子把它放进去。`;
    }
    function clearAll() { run++; busy = false; cells = Array(9).fill(null); pick = null; render(); intro(); }
    function demo() {
      run++; const my = run;
      cells = Array(9).fill(null); pick = null; busy = true; render();
      const LS = [2, 7, 6, 9, 5, 1, 4, 3, 8], off = s0 - 1, v = (p) => LS[p] + off;
      const M = Mg(), cen = s0 + 4, pr = M - cen;
      const steps = [
        [4, `第一步定中心：9 个数从小到大排，正中间是 <b>${cen}</b>（也就是幻和 ${M} ÷ 3），放在中心。`],
        [0, `过中心的每条线：两头的数 + ${cen} = ${M}，所以<b>相对的两个数加起来是 ${pr}</b>。左上角放 ${v(0)}……`],
        [8, `……右下角就是 ${pr} − ${v(0)} = ${v(8)}。`],
        [2, `右上角放 ${v(2)}……`],
        [6, `……左下角就是 ${pr} − ${v(2)} = ${v(6)}。`],
        [1, `第一行：${v(0)} + ? + ${v(2)} = ${M}，中间是 ${M} − ${v(0)} − ${v(2)} = ${v(1)}。`],
        [7, `第三行：${v(6)} + ? + ${v(8)} = ${M}，中间是 ${v(7)}。`],
        [3, `第一列：${v(0)} + ? + ${v(6)} = ${M}，中间是 ${v(3)}。`],
        [5, `最后一格是 ${v(5)}。检查一下，每条线都是 ${M}！`]
      ];
      let i = 0;
      const step = () => {
        if (my !== run) return;
        if (i >= steps.length) { busy = false; render(); read.innerHTML = `<b class="k3">填好了！</b>小窍门：中心放中间数，<b>角上放的是 ${v(0)}、${v(2)}、${v(6)}、${v(8)}</b>，相对两数的和都是 ${pr}。`; return; }
        const [p, why] = steps[i++], val = v(p), [fx, fy] = pc(val - s0), [tx, ty] = cc(p);
        read.innerHTML = why;
        const cd = card(gF, 36, 36, String(val), 'f2 s2', 'tb tw');
        cd.move(fx, fy);
        tween(650, (t) => cd.move(lerp(fx, tx, t), lerp(fy, ty, t)), () => {
          cd.g.remove();
          if (my !== run) return;
          cells[p] = val; render();
          later(1100, step);
        });
      };
      later(200, step);
    }
    btn(c, '演示填法', demo);
    btn(c, '清空', clearAll, 'alt');
    sel.addEventListener('change', () => { s0 = +sel.value; clearAll(); });
    render(); intro();
  };

  // ───────────── 数阵图：三角形每边和相等 ─────────────
  A.o_magic_tri = function (el) {
    const W = 460, Hh = 296;
    const POS = [[200, 52], [130, 148], [60, 244], [200, 244], [340, 244], [270, 148]];
    const SIDES = [[0, 1, 2], [2, 3, 4], [4, 5, 0]];
    const SPOS = [[84, 140], [200, 288], [318, 140]];
    const DEMO = { 9: [1, 6, 2, 4, 3, 5], 10: [1, 6, 3, 2, 5, 4], 11: [2, 5, 4, 1, 6, 3], 12: [4, 3, 5, 1, 6, 2] };
    const svg = stage(el, W, Hh);
    const gG = S('g', {}, svg), gF = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    H('span', {}, row, '演示每边和：');
    const sel = H('select', {}, row);
    ['9', '10', '11', '12'].forEach((v) => H('option', { value: v }, sel, v));
    const c = ctrl(el);
    let cells = Array(6).fill(null), pick = null, busy = false, run = 0;
    const pc = (i) => [420, 54 + i * 40];
    function render() {
      gG.innerHTML = '';
      [[0, 2], [2, 4], [4, 0]].forEach(([p, q]) => S('line', { x1: POS[p][0], y1: POS[p][1], x2: POS[q][0], y2: POS[q][1], class: 'sstrong' }, gG));
      POS.forEach(([x, y], p) => {
        const gc = S('g', { class: 'clickable' }, gG);
        S('circle', { cx: x, cy: y, r: 22, class: p % 2 === 0 ? 'f2s s2' : 'fsurf sstrong' }, gc);
        if (cells[p] != null) T(gc, x, y + 8, String(cells[p]), 'tl tb');
        gc.addEventListener('click', () => clickCell(p));
      });
      T(gG, 420, 30, '数字卡', 'ts tm');
      for (let v = 1; v <= 6; v++) {
        const [x, y] = pc(v - 1), usedV = cells.includes(v);
        const gc = S('g', { class: 'clickable', opacity: usedV ? 0.25 : 1 }, gG);
        S('rect', { x: x - 17, y: y - 17, width: 34, height: 34, rx: 7, class: pick === v ? 'f2 s2' : 'f1s s1' }, gc);
        T(gc, x, y + 6, String(v), pick === v ? 'tb tw' : 'tb');
        gc.addEventListener('click', () => { if (busy || usedV) return; pick = pick === v ? null : v; render(); });
      }
      const sums = SIDES.map((sd) => (sd.every((p) => cells[p] != null) ? sd.reduce((a, p) => a + cells[p], 0) : null));
      const allFull = sums.every((x) => x != null), eq = allFull && sums[0] === sums[1] && sums[1] === sums[2];
      SIDES.forEach((sd, i) => {
        const v = sums[i];
        T(gG, SPOS[i][0], SPOS[i][1], v == null ? '?' : `和 ${v}`, v == null ? 'tm' : eq ? 't3 tb' : 'tb');
      });
      if (busy) return;
      if (eq) read.innerHTML = `<b class="k3">成功！</b>三条边的和都是 ${sums[0]}。橙色圈（顶点）上的数，每个都被两条边用到。`;
      else if (allFull) read.innerHTML = `三条边的和是 ${sums.join('、')}，还不相等。想一想：顶点上放大数还是小数？`;
    }
    function clickCell(p) {
      if (busy) return;
      if (pick != null) { cells[p] = pick; pick = null; read.innerHTML = '每条边三个数都填上后，旁边会显示这条边的和。'; }
      else if (cells[p] != null) { cells[p] = null; read.innerHTML = '把这个数拿回来了。'; }
      else { read.innerHTML = '先点右边的一张数字卡，再点圆圈。'; return; }
      render();
    }
    function intro() {
      read.innerHTML = '把 1～6 填进 6 个圆圈，使三角形每条边上三个数的和都相等。<b>橙色圈是顶点</b>，每个顶点同时在两条边上。自己试试，或者选一个“每边和”看演示。';
    }
    function demo() {
      run++; const my = run;
      const S0 = +sel.value, arr = DEMO[S0], vsum = 3 * S0 - 21;
      cells = Array(6).fill(null); pick = null; busy = true; render();
      const order = [0, 2, 4, 1, 3, 5];
      const why = (p) => {
        if (p === 0) return `三条边的和加起来是 ${S0} × 3 = ${3 * S0}。1～6 的和是 21，多出来的 ${3 * S0} − 21 = <b>${vsum}</b>，是因为三个顶点各被算了两次。所以<b>三个顶点的和是 ${vsum}</b>：顶点放 ${arr[0]}、${arr[2]}、${arr[4]}。`;
        if (p === 2 || p === 4) return `顶点：${arr[0]} + ${arr[2]} + ${arr[4]} = ${vsum}。`;
        const sd = SIDES.find((x) => x[1] === p);
        return `这条边：${arr[sd[0]]} + ? + ${arr[sd[2]]} = ${S0}，中间填 ${S0} − ${arr[sd[0]]} − ${arr[sd[2]]} = ${arr[p]}。`;
      };
      let i = 0;
      const step = () => {
        if (my !== run) return;
        if (i >= order.length) { busy = false; render(); return; }
        const p = order[i++], val = arr[p], [fx, fy] = pc(val - 1), [tx, ty] = POS[p];
        read.innerHTML = why(p);
        const cd = card(gF, 34, 34, String(val), 'f2 s2', 'tb tw');
        cd.move(fx, fy);
        tween(600, (t) => cd.move(lerp(fx, tx, t), lerp(fy, ty, t)), () => {
          cd.g.remove();
          if (my !== run) return;
          cells[p] = val; render();
          later(p === 0 ? 2200 : 1100, step);
        });
      };
      later(200, step);
    }
    btn(c, '演示', demo);
    btn(c, '清空', () => { run++; busy = false; cells = Array(6).fill(null); pick = null; render(); intro(); }, 'alt');
    render(); intro();
  };

  // ───────────── 定义新运算：把数代入 ─────────────
  const OPS = [
    { s: '★', rhs: 'a × 3 + b', f: (a, b) => a * 3 + b, mid: (a, b) => `${a * 3} + ${b}` },
    { s: '◎', rhs: 'a × b − b', f: (a, b) => a * b - b, mid: (a, b) => `${a * b} − ${b}` },
    { s: '▲', rhs: 'a × 10 + b', f: (a, b) => a * 10 + b, mid: (a, b) => `${a * 10} + ${b}` },
    { s: '△', rhs: '(a + b) × a', f: (a, b) => (a + b) * a, mid: (a, b) => `${a + b} × ${a}` }
  ];
  const subst = (s, a, b) => s.replace(/a/g, String(a)).replace(/b/g, String(b));
  const opSel = (row, onChange) => {
    H('span', {}, row, '规定：');
    const sel = H('select', {}, row);
    OPS.forEach((o, i) => H('option', { value: i }, sel, `a ${o.s} b = ${o.rhs}`));
    sel.addEventListener('change', () => onChange(+sel.value));
    return sel;
  };

  A.o_def_op_machine = function (el) {
    const W = 460, Hh = 236, Y1 = 98, Y2 = 148, Y3 = 190, Y4 = 226;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), gF = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let oi = 0, a = 4, b = 5, busy = false, run = 0, last = null;
    opSel(row, (v) => { oi = v; last = null; draw(); });
    const c = ctrl(el);
    const sa = slider(c, 'dma', 'a', 1, 9, 1, a, (v) => { a = v; draw(); });
    const sb = slider(c, 'dmb', 'b', 1, 9, 1, b, (v) => { b = v; draw(); });
    const c2 = ctrl(el);
    const srcA = [140, 36], srcB = [320, 36];
    let tpl = '', L = null, eqX = 0;
    function draw(showSub) {
      run++; busy = false;
      g.innerHTML = ''; gF.innerHTML = '';
      const o = OPS[oi];
      card(g, 92, 38, `a = ${a}`, 'f1s s1', 'tl tb').move(...srcA);
      card(g, 92, 38, `b = ${b}`, 'f2s s2', 'tl tb').move(...srcB);
      tpl = `a ${o.s} b = ${o.rhs}`;
      const x0 = (W - strW(tpl)) / 2;
      L = drawStr(g, x0, Y1, tpl, (ch) => (ch === 'a' ? 'tl tb t1' : ch === 'b' ? 'tl tb t2' : 'tl'));
      eqX = L.xs[tpl.indexOf('=')] - 9;
      if (showSub) {
        drawStr(g, x0, Y2, subst(tpl, a, b), (ch, i) => (tpl[i] === 'a' ? 'tl tb t1' : tpl[i] === 'b' ? 'tl tb t2' : 'tl'));
        drawStr(g, eqX, Y3, `= ${o.mid(a, b)}`, 'tl');
        drawStr(g, eqX, Y4, `= ${o.f(a, b)}`, 'tl tb t3');
      }
      if (!showSub) read.innerHTML = `规定 a ${o.s} b = ${o.rhs}。意思是：<b>${o.s} 前面的数放进 a 的位置，后面的数放进 b 的位置</b>，再照着算。点“代入计算”。`;
    }
    function go() {
      if (busy) return;
      draw(false);
      busy = true;
      const my = run, o = OPS[oi], x0 = (W - strW(tpl)) / 2;
      const slots = [];
      [...tpl].forEach((ch, i) => { if (ch === 'a' || ch === 'b') slots.push([ch, L.xs[i]]); });
      [...tpl].forEach((ch, i) => { if (ch !== 'a' && ch !== 'b' && ch !== ' ') T(g, L.xs[i], Y2, ch, 'tl tm'); });
      read.innerHTML = `把 a = ${a}、b = ${b} 送进式子里……`;
      let k = 0;
      const fly = () => {
        if (my !== run) return;
        if (k >= slots.length) { later(300, calc); return; }
        const [ch, tx] = slots[k++], src = ch === 'a' ? srcA : srcB, val = ch === 'a' ? a : b;
        const t0 = T(gF, src[0], src[1] + 6, String(val), 'tl tb ' + (ch === 'a' ? 't1' : 't2'));
        tween(600, (t) => { t0.setAttribute('x', lerp(src[0], tx, t)); t0.setAttribute('y', lerp(src[1] + 6, Y2, t) - 30 * Math.sin(t * PI)); });
        later(380, fly);
      };
      const calc = () => {
        if (my !== run) return;
        drawStr(g, eqX, Y3, `= ${o.mid(a, b)}`, 'tl');
        read.innerHTML = `${a} ${o.s} ${b} = ${subst(o.rhs, a, b)}，先算${o.rhs.startsWith('(') ? '括号里' : '乘法'}……`;
        later(800, () => {
          if (my !== run) return;
          const res = o.f(a, b);
          drawStr(g, eqX, Y4, `= ${res}`, 'tl tb t3');
          let txt = `<b>${a} ${o.s} ${b} = ${res}</b>。`;
          if (last && last.oi === oi && last.a === b && last.b === a) {
            txt += ` 刚才 ${b} ${o.s} ${a} = ${last.res}，${last.res === res ? '这次碰巧相等，但' : '两个结果<b>不相等</b>！'}新运算<b>不一定能交换</b>前后两个数。`;
          }
          last = { oi, a, b, res };
          read.innerHTML = txt;
          busy = false;
        });
      };
      later(200, fly);
    }
    btn(c2, '代入计算', go);
    btn(c2, '交换 a 和 b 再算', () => {
      if (busy) return;
      if (!last || last.oi !== oi || last.a !== a || last.b !== b) last = { oi, a, b, res: OPS[oi].f(a, b) };
      [a, b] = [b, a]; sa.set(a); sb.set(b); go();
    }, 'alt');
    draw(false);
  };

  // ───────────── 定义新运算：两层运算，先算括号 ─────────────
  A.o_def_op_nest = function (el) {
    const W = 460, Hh = 236, Y0 = 30, Y1 = 82, Y2 = 136, Y3 = 196;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), gF = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    let oi = 0, a = 2, b = 3, c3 = 4, left = true, st = 0, busy = false, run = 0, rxPos = 230;
    opSel(row, (v) => { oi = v; reset(); });
    const row2 = H('div', { class: 'anim-row' }, el);
    slider(row2, 'dna', 'a', 1, 5, 1, a, (v) => { a = v; reset(); });
    slider(row2, 'dnb', 'b', 1, 5, 1, b, (v) => { b = v; reset(); });
    slider(row2, 'dnc', 'c', 1, 5, 1, c3, (v) => { c3 = v; reset(); });
    const c = ctrl(el);
    function info() {
      const o = OPS[oi], s = o.s;
      const ix = left ? a : b, iy = left ? b : c3, r = o.f(ix, iy);
      const ox = left ? r : a, oy = left ? c3 : r, fin = o.f(ox, oy);
      const expr = left ? `(${a} ${s} ${b}) ${s} ${c3}` : `${a} ${s} (${b} ${s} ${c3})`;
      const innerCalc = `${ix} ${s} ${iy} = ${subst(o.rhs, ix, iy)} = ${o.mid(ix, iy)} = ${r}`;
      const outerCalc = `${ox} ${s} ${oy} = ${subst(o.rhs, ox, oy)} = ${o.mid(ox, oy)} = ${fin}`;
      const other = left ? o.f(a, o.f(b, c3)) : o.f(o.f(a, b), c3);
      const otherExpr = left ? `${a} ${s} (${b} ${s} ${c3})` : `(${a} ${s} ${b}) ${s} ${c3}`;
      return { o, s, ix, iy, r, ox, oy, fin, expr, innerCalc, outerCalc, other, otherExpr };
    }
    function draw() {
      g.innerHTML = ''; gF.innerHTML = '';
      const I = info();
      T(g, W / 2, Y0, `规定：a ${I.s} b = ${I.o.rhs}`, 'tb tm');
      const x1 = (W - strW(I.expr)) / 2, L1 = layout(I.expr, x1);
      const i0 = left ? 0 : I.expr.indexOf('('), i1 = left ? I.expr.indexOf(')') : I.expr.length - 1;
      if (st >= 1) S('rect', { x: L1.xs[i0] - 8, y: Y1 - 24, width: L1.xs[i1] - L1.xs[i0] + 16, height: 34, rx: 8, class: 'f2s s2' }, g);
      drawStr(g, x1, Y1, I.expr, 'tl tb');
      if (st >= 2) {
        const x2 = (W - strW(I.innerCalc)) / 2;
        const L2 = drawStr(g, x2, Y2, I.innerCalc, (ch, i) => (i >= I.innerCalc.length - String(I.r).length ? 'tl tb t2' : 'tl'));
        rxPos = L2.xs[L2.xs.length - 1];
      }
      if (st >= 3) {
        const x3 = (W - strW(I.outerCalc)) / 2;
        const pre = `${I.ox} ${I.s} ${I.oy}`.length;
        drawStr(g, x3, Y3, I.outerCalc, (ch, i) => (i >= I.outerCalc.length - String(I.fin).length ? 'tl tb t3' : 'tl'), 0, st >= 4 ? undefined : pre);
      }
      read.innerHTML = [
        `算 ${I.expr}。这里有两个“${I.s}”，先算哪一个？点“下一步”。`,
        `和平常的四则运算一样：<b>有括号先算括号里面的</b>，也就是 ${left ? `${a} ${I.s} ${b}` : `${b} ${I.s} ${c3}`}。`,
        `把 ${I.ix} 放进 a、${I.iy} 放进 b：${I.innerCalc}。`,
        `括号里的结果 <span class="k2">${I.r}</span> 变成一个新的数，再和 ${left ? c3 : a} 做“${I.s}”运算：${I.ox} ${I.s} ${I.oy}。`,
        `${I.outerCalc}。<br>所以 <b>${I.expr} = ${I.fin}</b>。换一种加括号的方法：${I.otherExpr} = ${I.other}，${I.other === I.fin ? '这次碰巧一样' : '结果<b>不一样</b>'}。括号的位置不能随便改。`
      ][st];
    }
    function reset() { run++; busy = false; st = 0; draw(); }
    function next() {
      if (busy) return;
      if (st >= 4) { st = 0; draw(); return; }
      if (st === 2) {
        busy = true;
        const my = run, I = info(), rx = rxPos;
        const x3 = (W - strW(I.outerCalc)) / 2, L3 = layout(I.outerCalc, x3);
        const rs = String(I.r), idx = left ? 0 : `${I.ox} ${I.s} `.length;
        const tx = (L3.xs[idx] + L3.xs[idx + rs.length - 1]) / 2;
        const cd = card(gF, 14 + rs.length * 11, 30, rs, 'f2s s2', 'tl tb');
        cd.move(rx, Y2 - 6);
        tween(800, (t) => cd.move(lerp(rx, tx, t), lerp(Y2 - 6, Y3 - 6, t)), () => {
          if (my !== run) return;
          later(200, () => { if (my !== run) return; st = 3; busy = false; draw(); });
        });
        return;
      }
      st++; draw();
    }
    btn(c, '下一步', next);
    btn(c, '换一种加括号的位置', () => { left = !left; reset(); }, 'alt');
    draw();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
