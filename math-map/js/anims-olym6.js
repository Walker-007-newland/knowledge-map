// 奥数拓展第 6 批（数论，五、六年级）的互动动画
(function () {
  const { S, H, T, tween, lerp, stage, ctrl, btn, slider } = window.AH;
  const PI = Math.PI;
  const A = {};

  // ── 小工具 ──
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  function factorize(n) {
    const f = [];
    let m = n;
    for (let p = 2; p * p <= m; p++) while (m % p === 0) { f.push(p); m /= p; }
    if (m > 1) f.push(m);
    return f;
  }
  function primePowers(n) {
    const out = [];
    factorize(n).forEach((p) => {
      const l = out[out.length - 1];
      if (l && l[0] === p) l[1]++; else out.push([p, 1]);
    });
    return out;
  }
  const isPrime = (n) => n > 1 && factorize(n).length === 1;
  const supH = (p, e) => (e === 1 ? `${p}` : `${p}<sup>${e}</sup>`);
  const powStr = (n) => primePowers(n).map(([p, e]) => supH(p, e)).join(' × ');
  const digitSum = (n) => String(n).split('').reduce((s, d) => s + +d, 0);
  function divisorsOf(n) {
    const d = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i);
    return d;
  }
  // 输入框一行：回车或改动后触发
  function numBox(parent, label, val, min, max, onGo) {
    const row = H('div', { class: 'anim-row' }, parent);
    H('label', {}, row, label);
    const inp = H('input', { class: 'anim-input', type: 'number', min, max, value: val, inputmode: 'numeric' }, row);
    const go = () => {
      let v = Math.floor(+inp.value);
      if (!(v >= min && v <= max)) { v = Math.max(min, Math.min(max, v || min)); inp.value = v; }
      onGo(v);
    };
    inp.addEventListener('change', go);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    btn(row, '确定', go, 'alt');
    return { set(v) { inp.value = v; } };
  }
  function pick(parent, label, list, val, onChange) {
    const row = H('div', { class: 'anim-row' }, parent);
    H('label', {}, row, label);
    const s = H('select', { 'aria-label': label }, row);
    list.forEach((v) => { const o = H('option', { value: v }, s, String(v)); if (v === val) o.selected = true; });
    s.addEventListener('change', () => onChange(+s.value));
    return s;
  }

  // ═════════════ 整除特征：看哪几位 ═════════════
  A.o_divisible_check = function (el) {
    const W = 440, Hh = 230;
    const svg = stage(el, W, Hh);
    const gD = S('g', {}, svg), gF = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let s = '7128', busy = false, stop = null, rects = [];
    const bw = 40;
    const X = (i) => W / 2 - (s.length * bw) / 2 + i * bw + bw / 2;
    function draw() {
      if (stop) stop();
      stop = null; busy = false;
      gD.innerHTML = ''; gF.innerHTML = '';
      rects = [];
      for (let i = 0; i < s.length; i++) {
        rects.push(S('rect', { x: X(i) - 17, y: 22, width: 34, height: 44, rx: 6, class: 'fsurf2 sline' }, gD));
        T(gD, X(i), 53, s[i], 'tl tb');
      }
    }
    function intro() {
      draw();
      T(gF, W / 2, 130, '点下面的按钮：不用做除法，', 'tm');
      T(gF, W / 2, 155, '只看其中几位数字，就能判断能不能整除。', 'tm');
      read.innerHTML = `这个数是 <b>${s}</b>。选一种判断方法试试。`;
    }
    function verdict(N, d) {
      return N % d === 0 ? `<span class="k3">能被 ${d} 整除</span>` : `<span class="k2">不能被 ${d} 整除</span>`;
    }
    function fly(items, after) {
      busy = true;
      const fl = items.map((it) => {
        rects[it.i].setAttribute('class', it.box);
        return { t: T(gF, X(it.i), 53, s[it.i], it.cls), x0: X(it.i), tx: it.tx, ty: it.ty };
      });
      stop = tween(900, (e) => {
        fl.forEach((f) => { f.t.setAttribute('x', lerp(f.x0, f.tx, e)); f.t.setAttribute('y', lerp(53, f.ty, e)); });
      }, () => { busy = false; stop = null; after(); });
    }
    function tail(k) {
      if (busy) return;
      draw();
      const n = s.length, kk = Math.min(k, n), N = +s, t = +s.slice(-kk);
      const pair = k === 1 ? [2, 5] : k === 2 ? [4, 25] : [8, 125];
      const base = k === 1 ? 10 : k === 2 ? 100 : 1000;
      const items = [];
      for (let j = 0; j < kk; j++) items.push({ i: n - kk + j, tx: W / 2 - (kk * 26) / 2 + j * 26 + 13, ty: 140, cls: 't2 txl', box: 'f2s s2' });
      fly(items, () => {
        T(gF, W / 2, 105, k === 1 ? '看个位' : `看末${k === 2 ? '两' : '三'}位`, 'tm');
        const lines = pair.map((d) => { const q = Math.floor(t / d), r = t % d; return `${t} ÷ ${d} = ${q}${r ? ' …… ' + r : ''}`; });
        T(gF, W / 2, 185, lines.join('　　'), 'tb');
        const front = Math.floor(N / base);
        const why = `${base} = ${pair[0]} × ${pair[1]}，所以 ${base} 的倍数一定能被 ${pair[0]} 和 ${pair[1]} 整除。`;
        read.innerHTML = (front > 0 ? `${N} = ${front} × ${base} + ${t}。前一部分是 ${base} 的倍数，` : '') +
          `${why}只要看${k === 1 ? '个位' : '末' + (k === 2 ? '两' : '三') + '位'} <b>${t}</b>：${N} ${verdict(N, pair[0])}，${verdict(N, pair[1])}。`;
      });
    }
    function sum39() {
      if (busy) return;
      draw();
      const n = s.length, N = +s, sp = 34;
      const total = n * sp + 70, left = W / 2 - total / 2;
      const items = [];
      for (let i = 0; i < n; i++) items.push({ i, tx: left + i * sp + 12, ty: 140, cls: 't1 tl tb', box: 'f1s s1' });
      fly(items, () => {
        const ds = digitSum(N);
        for (let i = 1; i < n; i++) T(gF, left + i * sp - 5, 140, '+', 'tl tm');
        T(gF, left + n * sp - 5, 140, `= ${ds}`, 'tl tb', 'start');
        T(gF, W / 2, 105, '把各位数字加起来', 'tm');
        T(gF, W / 2, 190, `${ds} ÷ 3 = ${Math.floor(ds / 3)}${ds % 3 ? ' …… ' + (ds % 3) : ''}　　${ds} ÷ 9 = ${Math.floor(ds / 9)}${ds % 9 ? ' …… ' + (ds % 9) : ''}`, 'tb');
        read.innerHTML = `各位数字和是 <b>${ds}</b>。数字和是 3 的倍数，这个数就能被 3 整除；是 9 的倍数，就能被 9 整除。所以 ${N} ${verdict(N, 3)}，${verdict(N, 9)}。` +
          (ds >= 10 ? `（${ds} 还可以再求一次数字和：${digitSum(ds)}，结论一样。）` : '');
      });
    }
    function eleven() {
      if (busy) return;
      draw();
      const n = s.length, N = +s, sp = 30;
      const odd = [], even = [];
      for (let i = 0; i < n; i++) {
        const pos = n - i;
        T(gD, X(i), 82, `第${pos}位`, 'ts tm');
        (pos % 2 ? odd : even).unshift(i);
      }
      const items = [];
      odd.forEach((i, j) => items.push({ i, tx: 112 + j * sp, ty: 130, cls: 't1 tl tb', box: 'f1s s1' }));
      even.forEach((i, j) => items.push({ i, tx: 112 + j * sp, ty: 170, cls: 't2 tl tb', box: 'f2s s2' }));
      fly(items, () => {
        const so = odd.reduce((a, i) => a + +s[i], 0), se = even.reduce((a, i) => a + +s[i], 0);
        T(gF, 14, 130, '奇数位：', 't1 tb', 'start');
        T(gF, 14, 170, '偶数位：', 't2 tb', 'start');
        for (let j = 1; j < odd.length; j++) T(gF, 112 + j * sp - 15, 130, '+', 'tm');
        for (let j = 1; j < even.length; j++) T(gF, 112 + j * sp - 15, 170, '+', 'tm');
        T(gF, 112 + odd.length * sp - 10, 130, `= ${so}`, 'tl tb', 'start');
        if (even.length) T(gF, 112 + even.length * sp - 10, 170, `= ${se}`, 'tl tb', 'start');
        const big = Math.max(so, se), small = Math.min(so, se), d = big - small;
        T(gF, W / 2, 212, `大的减小的：${big} − ${small} = ${d}`, 'tb');
        read.innerHTML = `从个位数起，第 1、3、5……位是奇数位（蓝），第 2、4、6……位是偶数位（橙）。两组数字和相差 <b>${d}</b>，` +
          (d % 11 === 0 ? `是 11 的倍数（0 也算），所以 ${N} ${verdict(N, 11)}。` : `不是 11 的倍数，所以 ${N} ${verdict(N, 11)}。`);
      });
    }
    btn(c, '÷2、5：看个位', () => tail(1));
    btn(c, '÷4、25：看末两位', () => tail(2));
    btn(c, '÷8、125：看末三位', () => tail(3));
    btn(c, '÷3、9：看数字和', sum39);
    btn(c, '÷11：奇偶位', eleven);
    const box = numBox(el, '换一个数（最多 9 位）：', 7128, 1, 999999999, (v) => { s = String(v); intro(); });
    btn(c, '随机换一个数', () => {
      const m = [1, 3, 4, 8, 9, 11, 36, 72, 99][rnd(0, 8)];
      s = String(rnd(100, 99999) * m);
      box.set(s); intro();
    }, 'alt');
    intro();
  };

  // ═════════════ 整除特征：为什么看数字和 ═════════════
  A.o_divisible_blocks = function (el) {
    const W = 440, Hh = 262;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), gB = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 2, b = 3, d = 4, st = 0, k = 9, busy = false, stop = null;
    let units = [], bigs = [];
    function build() {
      if (stop) stop();
      stop = null; busy = false; st = 0;
      g.innerHTML = ''; gB.innerHTML = '';
      units = []; bigs = [];
      T(g, 10, 16, '百位：100 = 99 + 1', 'ts t1', 'start');
      T(g, 150, 16, '十位：10 = 9 + 1', 'ts t3', 'start');
      T(g, 268, 16, '个位', 'ts t2', 'start');
      for (let i = 0; i < a; i++) {
        const r = S('g', {}, g);
        S('rect', { x: 10, y: 26 + i * 30, width: 84, height: 22, rx: 3, class: 'f1s s1' }, r);
        T(r, 52, 42 + i * 30, '99', 'ts tb');
        bigs.push(r);
        units.push({ x: 98, y: 29 + i * 30 });
      }
      for (let j = 0; j < b; j++) {
        const r = S('g', {}, g);
        S('rect', { x: 150, y: 26 + j * 30, width: 48, height: 22, rx: 3, class: 'f3s s3' }, r);
        T(r, 174, 42 + j * 30, '9', 'ts tb');
        bigs.push(r);
        units.push({ x: 202, y: 29 + j * 30 });
      }
      for (let m = 0; m < d; m++) units.push({ x: 268 + (m % 5) * 22, y: 29 + Math.floor(m / 5) * 30 });
      units.forEach((u) => { u.el = S('rect', { x: u.x, y: u.y, width: 16, height: 16, rx: 2, class: 'f2' }, g); });
      T(g, 10, 196, '剩下：', 'ts tm', 'start');
      readOut();
    }
    const N = () => a * 100 + b * 10 + d;
    const target = (i) => [52 + i * 21, 184];
    function brackets() {
      gB.innerHTML = '';
      if (st !== 1) return;
      const n = units.length;
      for (let s0 = 0; s0 < n; s0 += k) {
        const e = Math.min(n, s0 + k) - 1, full = e - s0 + 1 === k;
        const x1 = target(s0)[0], x2 = target(e)[0] + 16;
        S('path', { d: `M${x1},208 v6 H${x2} v-6`, class: (full ? 's3' : 's2') + ' fnone' }, gB);
        T(gB, (x1 + x2) / 2, 232, full ? `${k} 个` : `余 ${e - s0 + 1}`, 'ts ' + (full ? 't3' : 't2 tb'));
      }
    }
    function readOut() {
      const n = N(), sum = a + b + d;
      if (st === 0) {
        read.innerHTML = `<b>${n}</b> = ${a} 个 100 + ${b} 个 10 + ${d} 个 1。每个 100 拆成 <span class="k1">99</span> + 1，每个 10 拆成 <span class="k3">9</span> + 1。点“拿走 9 的倍数”。`;
        return;
      }
      const r = sum % k;
      read.innerHTML = `99 和 9 都是 9 的倍数（也是 3 的倍数），拿走它们不影响余数。剩下的橙色方块正好是 ${a} + ${b} + ${d} = <b>${sum}</b> 个，就是<b>各位数字的和</b>！` +
        `${sum} 个按 ${k} 个一组，${r ? `余 <b>${r}</b> 个，所以 ${n} 除以 ${k} 也余 ${r}，不能被 ${k} 整除。` : `正好分完，所以 ${n} 能被 ${k} 整除。`}`;
    }
    const goBtn = btn(c, '拿走 9 的倍数', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st ? 0 : 1;
      if (!to) gB.innerHTML = '';
      stop = tween(1100, (e) => {
        const t = lerp(from, to, e);
        bigs.forEach((r) => r.setAttribute('opacity', 1 - 0.75 * t));
        units.forEach((u, i) => {
          const [tx, ty] = target(i);
          u.el.setAttribute('x', lerp(u.x, tx, t)); u.el.setAttribute('y', lerp(u.y, ty, t));
        });
      }, () => {
        busy = false; stop = null; st = to;
        goBtn.textContent = st ? '放回去' : '拿走 9 的倍数';
        brackets(); readOut();
      });
    });
    const kBtn = btn(c, '改成 3 个一组', () => {
      k = k === 9 ? 3 : 9;
      kBtn.textContent = k === 9 ? '改成 3 个一组' : '改成 9 个一组';
      brackets(); readOut();
    }, 'alt');
    const row = H('div', { class: 'anim-row' }, el);
    const reset = () => { goBtn.textContent = '拿走 9 的倍数'; build(); };
    slider(row, 'dbh', '百位', 0, 4, 1, a, (v) => { a = v; reset(); });
    slider(row, 'dbt', '十位', 0, 5, 1, b, (v) => { b = v; reset(); });
    slider(row, 'dbo', '个位', 0, 9, 1, d, (v) => { d = v; reset(); });
    build();
  };

  // ═════════════ 余数：分小棒 ═════════════
  A.o_remainder_sticks = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), gB = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 23, b = 5, st = 0, busy = false, stop = null, sticks = [];
    const home = (i) => [20 + i * 8, 34];
    function spot(i) {
      const q = Math.floor(a / b), gw = b * 7 + 16, gpr = Math.floor(400 / gw);
      if (i < q * b) {
        const gi = Math.floor(i / b), j = i % b;
        return [20 + (gi % gpr) * gw + j * 7, 100 + Math.floor(gi / gpr) * 50];
      }
      const rows = Math.ceil(q / gpr);
      return [20 + (i - q * b) * 9, 100 + rows * 50];
    }
    function build() {
      if (stop) stop();
      stop = null; busy = false; st = 0;
      g.innerHTML = ''; gB.innerHTML = '';
      sticks = [];
      for (let i = 0; i < a; i++) {
        const [x, y] = home(i);
        sticks.push(S('line', { x1: x, x2: x, y1: y, y2: y + 30, class: 'sstrong thick round' }, g));
      }
      goBtn.textContent = `每 ${b} 根捆成一捆`;
      readOut();
    }
    function place(i, x, y) { const l = sticks[i]; l.setAttribute('x1', x); l.setAttribute('x2', x); l.setAttribute('y1', y); l.setAttribute('y2', y + 30); }
    function bands() {
      gB.innerHTML = '';
      if (!st) return;
      const q = Math.floor(a / b), r = a % b;
      for (let gi = 0; gi < q; gi++) {
        const [x, y] = spot(gi * b);
        S('line', { x1: x - 4, x2: x + (b - 1) * 7 + 4, y1: y + 15, y2: y + 15, class: 's2 thick round' }, gB);
      }
      for (let i = q * b; i < a; i++) sticks[i].setAttribute('class', 's2 thick round');
      if (r) { const [x, y] = spot(a - 1); T(gB, x + 14, y + 22, `剩 ${r} 根`, 't2 tb', 'start'); }
    }
    function readOut() {
      const q = Math.floor(a / b), r = a % b;
      if (!st) {
        read.innerHTML = `一共 <b>${a}</b> 根小棒，每 <b>${b}</b> 根捆成一捆。能捆几捆？还剩几根？`;
        return;
      }
      read.innerHTML = `${a} ÷ ${b} = <span class="k1">${q}</span>${r ? ` …… <span class="k2">${r}</span>` : ''}：捆了 ${q} 捆，${r ? `剩 ${r} 根` : '正好捆完'}。<br>` +
        `验算：被除数 = 除数 × 商 + 余数，${a} = ${b} × ${q} + ${r}。` +
        (r ? `剩下的 ${r} 根比 ${b} 根少，不够再捆一捆，所以<b>余数一定比除数小</b>。` : `没有剩余，说明 ${a} 能被 ${b} 整除。`);
    }
    const goBtn = btn(c, '每 5 根捆成一捆', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st ? 0 : 1;
      if (!to) { gB.innerHTML = ''; sticks.forEach((l) => l.setAttribute('class', 'sstrong thick round')); }
      stop = tween(1200, (e) => {
        const t = lerp(from, to, e);
        for (let i = 0; i < a; i++) {
          const p0 = home(i), p1 = spot(i);
          place(i, lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t));
        }
      }, () => {
        busy = false; stop = null; st = to;
        goBtn.textContent = st ? '拆开重来' : `每 ${b} 根捆成一捆`;
        bands(); readOut();
      });
    });
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'rsa', '被除数', 5, 50, 1, a, (v) => { a = v; build(); });
    slider(row, 'rsb', '除数', 2, 9, 1, b, (v) => { b = v; build(); });
    build();
  };

  // ═════════════ 余数：和的余数 ═════════════
  A.o_remainder_add = function (el) {
    const W = 440, Hh = 262;
    const svg = stage(el, W, Hh);
    const gL = S('g', {}, svg), g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 23, b = 19, m = 5, st = 0, busy = false, stop = null, items = [], newB = null;
    const BW = 19, SW = 9;
    const rowY = [30, 100, 182];
    function rowPos(list, y) {
      // list: 元素数组（先捆后散），返回每个的位置
      let x = 20, prevKind = 'b';
      return list.map((it) => {
        if (it.kind === 's' && prevKind === 'b') x += 6;
        prevKind = it.kind;
        const p = [x, y];
        x += it.kind === 'b' ? BW : SW;
        return p;
      });
    }
    function mkBundle(cls) {
      const e = S('g', {}, g);
      S('rect', { x: 0, y: 0, width: 16, height: 30, rx: 3, class: cls }, e);
      T(e, 8, 20, String(m), 'ts tb');
      return e;
    }
    function mkStick(cls) {
      const e = S('g', {}, g);
      S('line', { x1: 3, x2: 3, y1: 0, y2: 30, class: cls + ' thick round' }, e);
      return e;
    }
    const put = (e, x, y) => e.setAttribute('transform', `translate(${x},${y})`);
    function build() {
      if (stop) stop();
      stop = null; busy = false; st = 0; newB = null;
      g.innerHTML = ''; gL.innerHTML = '';
      const q1 = Math.floor(a / m), r1 = a % m, q2 = Math.floor(b / m), r2 = b % m;
      T(gL, 20, 22, `甲：${a} = ${m} × ${q1} + ${r1}`, 'ts t1 tb', 'start');
      T(gL, 20, 92, `乙：${b} = ${m} × ${q2} + ${r2}`, 'ts t3 tb', 'start');
      items = [];
      const A1 = [], B1 = [];
      for (let i = 0; i < q1; i++) A1.push({ kind: 'b', el: mkBundle('f1s s1') });
      for (let i = 0; i < r1; i++) A1.push({ kind: 's', el: mkStick('s1') });
      for (let i = 0; i < q2; i++) B1.push({ kind: 'b', el: mkBundle('f3s s3') });
      for (let i = 0; i < r2; i++) B1.push({ kind: 's', el: mkStick('s3') });
      rowPos(A1, rowY[0]).forEach((p, i) => { A1[i].p0 = p; });
      rowPos(B1, rowY[1]).forEach((p, i) => { B1[i].p0 = p; });
      items = A1.concat(B1);
      const merged = items.filter((it) => it.kind === 'b').concat(items.filter((it) => it.kind === 's'));
      rowPos(merged, rowY[2]).forEach((p, i) => { merged[i].p1 = p; });
      items.forEach((it) => put(it.el, it.p0[0], it.p0[1]));
      goBtn.textContent = '合在一起';
      readOut();
    }
    function readOut() {
      const r1 = a % m, r2 = b % m, s = r1 + r2, R = (a + b) % m;
      if (st === 0) {
        read.innerHTML = `每 ${m} 根一捆。甲除以 ${m} 余 <span class="k1">${r1}</span>，乙除以 ${m} 余 <span class="k3">${r2}</span>。把它们合起来，除以 ${m} 余几？`;
        return;
      }
      read.innerHTML = `合起来一共 ${a + b} 根。整捆的还是整捆，只有零散的 ${r1} + ${r2} = <b>${s}</b> 根要重新看：` +
        (s >= m ? `${s} 根又能捆成 1 捆，剩 <b>${R}</b> 根。` : `不够 ${m} 根，捆不成，就剩 <b>${R}</b> 根。`) +
        `<br>所以 (${a} + ${b}) ÷ ${m} 余 ${R}，和 (${r1} + ${r2}) ÷ ${m} 的余数一样：<b>和的余数 = 余数和的余数</b>。`;
    }
    const goBtn = btn(c, '合在一起', () => {
      if (busy) return;
      if (st) { build(); return; }
      busy = true;
      stop = tween(1100, (e) => {
        items.forEach((it) => put(it.el, lerp(it.p0[0], it.p1[0], e), lerp(it.p0[1], it.p1[1], e)));
      }, () => {
        const loose = items.filter((it) => it.kind === 's');
        const nb = items.filter((it) => it.kind === 'b').length;
        if (loose.length < m) { finish(); return; }
        // 零散的凑够一捆：前 m 根挤到一起变成新的一捆
        const bx = 20 + nb * BW, take = loose.slice(0, m), rest = loose.slice(m);
        const restFrom = rest.map((it) => it.p1);
        stop = tween(900, (e) => {
          take.forEach((it, i) => put(it.el, lerp(it.p1[0], bx + 2 + i * (12 / m), e), rowY[2]));
          rest.forEach((it, i) => put(it.el, lerp(restFrom[i][0], bx + BW + 6 + i * SW, e), rowY[2]));
        }, () => {
          take.forEach((it) => it.el.setAttribute('opacity', 0));
          newB = mkBundle('f2s s2'); put(newB, bx, rowY[2]);
          finish();
        });
      });
      function finish() {
        busy = false; stop = null; st = 1;
        T(gL, 20, rowY[2] - 8, `合起来：${a} + ${b} = ${a + b} = ${m} × ${Math.floor((a + b) / m)} + ${(a + b) % m}`, 'ts t2 tb', 'start');
        goBtn.textContent = '分开重来';
        readOut();
      }
    });
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'raa', '甲', 5, 30, 1, a, (v) => { a = v; build(); });
    slider(row, 'rab', '乙', 5, 30, 1, b, (v) => { b = v; build(); });
    slider(row, 'ram', '除数', 3, 9, 1, m, (v) => { m = v; build(); });
    build();
  };

  // ═════════════ 余数：积的余数（方格图） ═════════════
  A.o_remainder_mul = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 11, b = 13, m = 4, step = 0, busy = false, stop = null, ov = [];
    function build() {
      if (stop) stop();
      stop = null; busy = false; step = 0;
      g.innerHTML = '';
      const u = Math.min(20, 360 / b, 190 / a);
      const x0 = (W - b * u) / 2 + 14, y0 = 34;
      const q1 = Math.floor(a / m), r1 = a % m, q2 = Math.floor(b / m), r2 = b % m;
      S('rect', { x: x0, y: y0, width: b * u, height: a * u, class: 'fsurf2' }, g);
      ov = [
        S('rect', { x: x0, y: y0, width: b * u, height: m * q1 * u, class: 'f1s', opacity: 0 }, g),
        S('rect', { x: x0, y: y0 + m * q1 * u, width: m * q2 * u, height: r1 * u, class: 'f3s', opacity: 0 }, g),
        S('rect', { x: x0 + m * q2 * u, y: y0 + m * q1 * u, width: r2 * u, height: r1 * u, class: 'f2', opacity: 0 }, g)
      ];
      for (let i = 0; i <= a; i++) S('line', { x1: x0, x2: x0 + b * u, y1: y0 + i * u, y2: y0 + i * u, class: i % m === 0 && i <= m * q1 ? 'smuted' : 'sline' }, g);
      for (let j = 0; j <= b; j++) S('line', { y1: y0, y2: y0 + a * u, x1: x0 + j * u, x2: x0 + j * u, class: j % m === 0 && j <= m * q2 ? 'smuted' : 'sline' }, g);
      // 行列标注
      T(g, x0 - 6, y0 + (m * q1 * u) / 2 + 4, `${m * q1}`, 'ts t1 tb', 'end');
      if (r1) T(g, x0 - 6, y0 + (m * q1 + r1 / 2) * u + 4, `${r1}`, 'ts t2 tb', 'end');
      T(g, x0 + (m * q2 * u) / 2, y0 - 8, `${m * q2}`, 'ts t3 tb');
      if (r2) T(g, x0 + (m * q2 + r2 / 2) * u, y0 - 8, `${r2}`, 'ts t2 tb');
      T(g, 14, 20, `${a} 行 × ${b} 列`, 'ts tm', 'start');
      nextBtn.textContent = '下一步';
      readOut();
    }
    function readOut() {
      const q1 = Math.floor(a / m), r1 = a % m, q2 = Math.floor(b / m), r2 = b % m, P = a * b;
      const msg = [
        `${a} 行 × ${b} 列 = ${P} 个小格。${P} ÷ ${m} 余几？不用真的去除：${a} = ${m} × ${q1} + ${r1}，${b} = ${m} × ${q2} + ${r2}。点“下一步”把方格拆开看。`,
        `蓝色部分有 <span class="k1">${m * q1}</span> 行，是 ${m} 的倍数，格子数 ${m * q1} × ${b} 一定能被 ${m} 整除，先拿走。`,
        `绿色部分是 ${r1} 行 × <span class="k3">${m * q2}</span> 列，列数是 ${m} 的倍数，格子数也能被 ${m} 整除，也拿走。`,
        r1 * r2 === 0
          ? `右下角没有格子了（有一个余数是 0），所以 ${a} × ${b} = ${P} 能被 ${m} 整除。`
          : `只剩右下角 <span class="k2">${r1} × ${r2} = ${r1 * r2}</span> 格。所以 ${a} × ${b} 除以 ${m} 的余数 = ${r1} × ${r2} 除以 ${m} 的余数 = <b>${(r1 * r2) % m}</b>。<br>验算：${P} ÷ ${m} = ${Math.floor(P / m)} …… ${P % m}。<b>积的余数 = 余数积的余数</b>。`
      ];
      read.innerHTML = msg[step];
    }
    const nextBtn = btn(c, '下一步', () => {
      if (busy) return;
      if (step >= 3) { build(); return; }
      busy = true;
      const r = ov[step];
      stop = tween(600, (e) => r.setAttribute('opacity', 0.9 * e), () => {
        busy = false; stop = null; step++;
        if (step >= 3) nextBtn.textContent = '重来';
        readOut();
      });
    });
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'rma', '行', 7, 15, 1, a, (v) => { a = v; build(); });
    slider(row, 'rmb', '列', 7, 18, 1, b, (v) => { b = v; build(); });
    slider(row, 'rmm', '除数', 3, 6, 1, m, (v) => { m = v; build(); });
    build();
  };

  // ═════════════ 分解质因数：短除法 ═════════════
  A.o_prime_short = function (el) {
    const W = 440;
    const svg = stage(el, W, 200);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 360, steps = [], k = 0, busy = false, stop = null, auto = false;
    const xd = 170, xn = 215, rh = 38, y0 = 40;
    function plan() {
      steps = [];
      let m = n;
      while (m > 1 && !isPrime(m)) { const p = factorize(m)[0]; steps.push({ m, p }); m /= p; }
      svg.setAttribute('viewBox', `0 0 ${W} ${Math.max(150, y0 + steps.length * rh + 40)}`);
    }
    function reason(m, p) {
      if (p === 2) return `${m} 是偶数，用最小的质数 2 去除`;
      if (p === 3) return `${m} 是奇数；各位数字和 ${digitSum(m)} 是 3 的倍数，用 3 去除`;
      if (p === 5) return `${m} 不能被 2、3 整除，末位是 ${m % 10}，用 5 去除`;
      return `${m} 不能被 2、3、5 整除，再试 7、11、13……，能被 ${p} 整除`;
    }
    function drawRows(upto, t) {
      g.innerHTML = '';
      for (let r = 0; r < upto; r++) {
        const { m, p } = steps[r], y = y0 + r * rh, last = r === upto - 1, tt = last ? t : 1;
        if (r === 0) T(g, xn, y, String(m), 'tl tb', 'start');
        const pd = T(g, xd, y, String(p), 'tl tb t2', 'end');
        pd.setAttribute('opacity', Math.min(1, tt * 2));
        S('line', { x1: xd + 12, x2: xd + 12, y1: y - 22, y2: lerp(y - 22, y + 8, Math.min(1, tt * 2)), class: 'sstrong' }, g);
        S('line', { x1: xd + 12, x2: lerp(xd + 12, xn + 70, Math.min(1, tt * 2)), y1: y + 8, y2: y + 8, class: 'sstrong' }, g);
        const q = T(g, xn, lerp(y, y + rh, tt), String(m / p), 'tl tb' + (r === steps.length - 1 && tt === 1 ? ' t3' : ''), 'start');
        q.setAttribute('opacity', tt > 0.5 ? 1 : 0);
      }
      if (upto === 0) T(g, xn, y0, String(n), 'tl tb' + (isPrime(n) ? ' t3' : ''), 'start');
    }
    function readOut() {
      if (!steps.length) {
        read.innerHTML = `<b>${n}</b> 是质数，它只有 1 和它本身两个因数，不能再分解。换一个合数试试。`;
        return;
      }
      if (k === 0) { read.innerHTML = `把 <b>${n}</b> 分解质因数：每次用能整除它的<b>最小质数</b>去除，商写在下面。点“下一步”。`; return; }
      const fs = steps.slice(0, k).map((s) => s.p);
      const cur = steps[k - 1].m / steps[k - 1].p;
      if (k < steps.length) {
        read.innerHTML = `${reason(steps[k - 1].m, steps[k - 1].p)}，商是 <b>${cur}</b>。<br>${cur} 还是合数，继续往下除。`;
      } else {
        const all = fs.concat([cur]);
        read.innerHTML = `${reason(steps[k - 1].m, steps[k - 1].p)}，商是 <span class="k3">${cur}</span>，它是质数，停下来。<br>` +
          `把左边的除数和最下面的商乘起来：<b>${n} = ${all.join(' × ')}</b> = ${powStr(n)}。`;
      }
    }
    function step() {
      if (busy || k >= steps.length) return false;
      busy = true; k++;
      stop = tween(700, (e) => drawRows(k, e), () => {
        busy = false; stop = null; drawRows(k, 1); readOut();
        if (auto && k < steps.length) setTimeout(() => { if (auto) step(); }, 350);
        else auto = false;
      });
      return true;
    }
    function reset() {
      if (stop) stop();
      stop = null; busy = false; auto = false; k = 0;
      plan(); drawRows(0, 1); readOut();
    }
    btn(c, '下一步', () => { auto = false; step(); });
    btn(c, '一口气做完', () => { if (busy) return; auto = true; if (!step()) auto = false; });
    btn(c, '重来', reset, 'alt');
    const box = numBox(el, '要分解的数（4～999）：', n, 4, 999, (v) => { n = v; reset(); });
    btn(c, '随机换一个', () => {
      do { n = rnd(12, 999); } while (isPrime(n) || factorize(n).length < 3);
      box.set(n); reset();
    }, 'alt');
    reset();
  };

  // ═════════════ 分解质因数：因数树 ═════════════
  A.o_prime_tree = function (el) {
    const W = 440, Hh = 310;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 72, root = null, busy = false, stop = null, tries = 0, auto = false;
    function leaves(nd, out) { if (!nd.kids.length) out.push(nd); else nd.kids.forEach((k) => leaves(k, out)); return out; }
    function all(nd, out) { out.push(nd); nd.kids.forEach((k) => all(k, out)); return out; }
    function layout() {
      const L = leaves(root, []);
      L.forEach((lf, i) => { lf.tx = (W / L.length) * (i + 0.5); });
      (function setY(nd, dep) {
        nd.ty = 30 + dep * 52;
        nd.kids.forEach((k) => setY(k, dep + 1));
        if (nd.kids.length) nd.tx = (nd.kids[0].tx + nd.kids[1].tx) / 2;
      })(root, 0);
    }
    function render() {
      g.innerHTML = '';
      const nodes = all(root, []);
      nodes.forEach((nd) => nd.kids.forEach((k) => S('line', { x1: nd.x, y1: nd.y, x2: k.x, y2: k.y, class: 'smuted' }, g)));
      nodes.forEach((nd) => {
        const leaf = !nd.kids.length, pr = isPrime(nd.v);
        const e = S('g', { class: leaf && !pr ? 'clickable' : '' }, g);
        S('circle', { cx: nd.x, cy: nd.y, r: 18, class: leaf ? (pr ? 'f3s s3' : 'f2s s2') : 'fsurf sline' }, e);
        T(e, nd.x, nd.y + 5, String(nd.v), 'tb' + (String(nd.v).length > 2 ? ' ts' : ''));
        if (leaf && !pr) {
          e.setAttribute('tabindex', 0); e.setAttribute('role', 'button');
          e.addEventListener('click', () => split(nd));
          e.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') split(nd); });
        }
      });
    }
    function readOut() {
      const L = leaves(root, []), comp = L.filter((l) => !isPrime(l.v));
      if (comp.length) {
        read.innerHTML = root.kids.length
          ? `橙色的数还是合数，可以接着拆；绿色的是质数，拆不开了。`
          : `点橙色的 <b>${n}</b>，把它拆成两个数相乘（每次随机拆）。也可以点“拆开一个”。`;
        return;
      }
      tries++;
      const ps = L.map((l) => l.v).sort((x, y) => x - y);
      read.innerHTML = `拆完了！所有“树叶”都是质数，从小到大排：<b>${ps.join('、')}</b>。<br>${n} = ${ps.join(' × ')} = ${powStr(n)}。` +
        (tries > 1 ? `<br>你已经拆了 <b>${tries}</b> 次，树长得不一样，可树叶上的质数每次都一样！` : `<br>点“换一种拆法”，看看结果会不会变。`);
    }
    function split(nd) {
      if (busy || nd.kids.length || isPrime(nd.v)) return false;
      const ds = [];
      for (let d = 2; d * d <= nd.v; d++) if (nd.v % d === 0) ds.push(d);
      const d = ds[rnd(0, ds.length - 1)];
      nd.kids = [{ v: d, kids: [], x: nd.x, y: nd.y }, { v: nd.v / d, kids: [], x: nd.x, y: nd.y }];
      const nodes = all(root, []);
      nodes.forEach((k) => { k.fx = k.x; k.fy = k.y; });
      layout();
      busy = true;
      stop = tween(600, (e) => {
        nodes.forEach((k) => { k.x = lerp(k.fx, k.tx, e); k.y = lerp(k.fy, k.ty, e); });
        render();
      }, () => {
        busy = false; stop = null; render(); readOut();
        if (auto) setTimeout(() => { if (auto && !splitFirst()) auto = false; }, 250);
      });
      return true;
    }
    function splitFirst() {
      const lf = leaves(root, []).find((l) => !isPrime(l.v));
      return lf ? split(lf) : false;
    }
    function reset(keepTries) {
      if (stop) stop();
      stop = null; busy = false; auto = false;
      if (!keepTries) tries = 0;
      root = { v: n, kids: [], x: W / 2, y: 30 };
      layout(); root.x = root.tx; root.y = root.ty;
      render(); readOut();
    }
    btn(c, '拆开一个', () => { auto = false; splitFirst(); });
    btn(c, '全部拆完', () => { if (busy) return; auto = true; if (!splitFirst()) auto = false; });
    btn(c, '换一种拆法', () => reset(true), 'alt');
    pick(el, '要分解的数：', [36, 48, 60, 72, 84, 90, 96, 100, 120, 144, 180, 210, 360], n, (v) => { n = v; reset(false); });
    reset(false);
  };

  // ═════════════ 约数：摆长方形 ═════════════
  A.o_divisors_rect = function (el) {
    const W = 440, Hh = 262;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), gT = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 12, w = 0, tiles = [], pairs = [], busy = false, stop = null, auto = false, pos = [];
    function layoutPos(rows) {
      const cols = Math.ceil(n / rows), sz = Math.min(26, 400 / cols, 170 / rows);
      const left = (W - cols * sz) / 2, top = 14 + (170 - rows * sz) / 2;
      return tiles.map((_, i) => ({ x: left + Math.floor(i / rows) * sz, y: top + (i % rows) * sz, s: sz }));
    }
    function drawList() {
      gT.innerHTML = '';
      T(gT, W / 2, 212, pairs.length ? '找到的约数对：' + pairs.map(([p, q]) => `${p} × ${q}`).join('　') : '还没有找到约数对', 'tb');
      if (done()) {
        T(gT, W / 2, 240, `${n} 的约数：${divisorsOf(n).join('、')}（共 ${divisorsOf(n).length} 个）`, 't3 tb');
      }
    }
    const done = () => (w + 1) * (w + 1) > n;
    function build() {
      if (stop) stop();
      stop = null; busy = false; auto = false; w = 0; pairs = [];
      g.innerHTML = '';
      tiles = [];
      for (let i = 0; i < n; i++) tiles.push(S('rect', { rx: 2, class: 'f1s s1 thin' }, g));
      // 初始：堆在一起（摆成接近正方形的一堆）
      const side = Math.ceil(Math.sqrt(n));
      pos = layoutPos(side);
      paint(pos);
      drawList();
      read.innerHTML = `有 <b>${n}</b> 个同样大的小方块，能摆成几种长方形（必须摆满，不能缺角）？点“试下一种”，从摆 1 行开始试。`;
      tryBtn.disabled = false;
    }
    function paint(P, cls) {
      tiles.forEach((t, i) => {
        t.setAttribute('x', P[i].x + 1); t.setAttribute('y', P[i].y + 1);
        t.setAttribute('width', P[i].s - 2); t.setAttribute('height', P[i].s - 2);
        if (cls) t.setAttribute('class', cls(i));
      });
    }
    function tryNext() {
      if (busy || done()) return false;
      w++;
      const from = pos, to = layoutPos(w);
      busy = true;
      tiles.forEach((t) => t.setAttribute('class', 'f1s s1 thin'));
      stop = tween(700, (e) => {
        paint(from.map((p, i) => ({ x: lerp(p.x, to[i].x, e), y: lerp(p.y, to[i].y, e), s: lerp(p.s, to[i].s, e) })));
      }, () => {
        busy = false; stop = null; pos = to;
        const ok = n % w === 0, cols = Math.ceil(n / w);
        const lastStart = (cols - 1) * w;
        paint(pos, (i) => (ok ? 'f3s s3 thin' : i >= lastStart ? 'f2 s2 thin' : 'f1s s1 thin'));
        if (ok) pairs.push([w, n / w]);
        drawList();
        let msg = ok
          ? `摆 <b>${w}</b> 行，每行 <b>${n / w}</b> 个，正好摆满！${w} × ${n / w} = ${n}，所以 <span class="k3">${w} 和 ${n / w}</span> 都是 ${n} 的约数——约数是<b>成对</b>出现的。`
          : `摆 ${w} 行，最后一列只有 <span class="k2">${n % w}</span> 个，摆不满。${n} ÷ ${w} = ${Math.floor(n / w)} …… ${n % w}，${w} 不是 ${n} 的约数。`;
        if (done()) {
          msg += `<br>再往下试，就要摆 ${w + 1} 行了，可每行的个数会比行数还少，只是把前面的长方形竖过来，不用再试。约数全部找齐！`;
          tryBtn.disabled = true;
          auto = false;
        }
        read.innerHTML = msg;
        if (auto) setTimeout(() => { if (auto && !tryNext()) auto = false; }, 500);
      });
      return true;
    }
    const tryBtn = btn(c, '试下一种', () => { auto = false; tryNext(); });
    btn(c, '一直试到底', () => { if (busy) return; auto = true; if (!tryNext()) auto = false; });
    btn(c, '重来', build, 'alt');
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'drn', '方块数', 2, 48, 1, n, (v) => { n = v; build(); });
    build();
  };

  // ═════════════ 约数：列表格求个数与和 ═════════════
  A.o_divisors_table = function (el) {
    const W = 440, Hh = 262;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let N = 72, p, a, q, b, cells = [], busy = false, stop = null, filled = 0, showSum = false;
    const cw = 58, chh = 32;
    function setup() {
      const pp = primePowers(N);
      [p, a] = pp[0];
      if (pp[1]) [q, b] = pp[1]; else { q = 0; b = 0; }
    }
    function build() {
      if (stop) stop();
      stop = null; busy = false; filled = 0; showSum = false;
      setup();
      draw();
      readOut();
    }
    function draw() {
      g.innerHTML = '';
      const cols = b + 2, rows = a + 2;
      const x0 = (W - (cols + 1) * cw) / 2, y0 = 14;
      const cell = (r, cc, txt, cls, tcls) => {
        S('rect', { x: x0 + cc * cw + 1, y: y0 + r * chh + 1, width: cw - 2, height: chh - 2, rx: 4, class: cls }, g);
        if (txt !== '') T(g, x0 + cc * cw + cw / 2, y0 + r * chh + chh / 2 + 5, txt, tcls || 'tb');
      };
      const hl = showSum ? 'f2s s2' : 'fsurf2 sline';
      cell(0, 0, '×', 'fnone', 'tm');
      for (let j = 0; j <= b; j++) cell(0, j + 1, String(Math.pow(q || 1, j)), hl, 't3 tb');
      for (let i = 0; i <= a; i++) cell(i + 1, 0, String(Math.pow(p, i)), hl, 't1 tb');
      cells = [];
      for (let i = 0; i <= a; i++) for (let j = 0; j <= b; j++) cells.push([i, j]);
      cells.forEach(([i, j], k) => {
        const v = Math.pow(p, i) * Math.pow(q || 1, j);
        cell(i + 1, j + 1, k < filled ? String(v) : '', k < filled ? 'f1s sline' : 'fsurf sline');
      });
      if (showSum) {
        const sp = sumPow(p, a), sq = q ? sumPow(q, b) : 1;
        T(g, x0 + cw / 2, y0 + (a + 2) * chh + 20, `和 ${sp}`, 't2 tb');
        T(g, x0 + (b + 2) * cw + cw / 2, y0 + chh / 2 + 5, `和 ${sq}`, 't2 tb');
      }
    }
    const sumPow = (x, e) => { let s = 0; for (let i = 0; i <= e; i++) s += Math.pow(x, i); return s; };
    const powList = (x, e) => { const l = []; for (let i = 0; i <= e; i++) l.push(Math.pow(x, i)); return l; };
    function readOut() {
      const cnt = (a + 1) * (b + 1);
      const form = q ? `${N} = ${supH(p, a)} × ${supH(q, b)}` : `${N} = ${supH(p, a)}`;
      if (filled === 0) {
        read.innerHTML = `${form}。${N} 的每个约数 = （左边一列的一个数）×（上面一行的一个数）。左边是 ${p} 的 0～${a} 次（“0 次”就是不取 ${p}，写成 1），${q ? `上面是 ${q} 的 0～${b} 次。` : `上面只有 1。`}点“逐格填写”。`;
      } else if (filled < cells.length) {
        read.innerHTML = `已经填了 ${filled} 个约数……`;
      } else if (!showSum) {
        read.innerHTML = `表格填满了：一共 ${a + 1} 行 × ${b + 1} 列 = <b>${cnt}</b> 个约数，一个不多、一个不少。<br>` +
          `<b>约数个数 = (指数 + 1) × (指数 + 1)</b>：(${a} + 1) × (${b} + 1) = ${cnt}。`;
      } else {
        const sp = sumPow(p, a), sq = q ? sumPow(q, b) : 1;
        read.innerHTML = `每一行的和 = 左边的数 × (${powList(q || 1, b).join(' + ')})，把各行加起来：<br>约数和 = (${powList(p, a).join(' + ')}) × (${powList(q || 1, b).join(' + ')}) = ${sp} × ${sq} = <b>${sp * sq}</b>。`;
      }
    }
    btn(c, '逐格填写', () => {
      if (busy) return;
      showSum = false; filled = 0;
      busy = true;
      const tot = cells.length || (a + 1) * (b + 1);
      stop = tween(Math.min(3000, 250 * tot), (e, raw) => {
        const m = Math.round(raw * tot);
        if (m !== filled) { filled = m; draw(); readOut(); }
      }, () => { busy = false; stop = null; filled = tot; draw(); readOut(); });
    });
    btn(c, '求约数和', () => {
      if (busy) return;
      filled = (a + 1) * (b + 1); showSum = true; draw(); readOut();
    });
    btn(c, '清空', build, 'alt');
    pick(el, '选一个数：', [12, 16, 18, 20, 24, 36, 48, 72, 81, 100, 108, 200], N, (v) => { N = v; build(); });
    build();
  };

  // ═════════════ 公因数：从长方形里切正方形 ═════════════
  A.o_gcd_app_cut = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 30, b = 18, cuts = [], rem = null, busy = false, stop = null, tiled = false, auto = false;
    let u, x0, y0;
    function geo() { u = Math.min(400 / a, 190 / b); x0 = (W - a * u) / 2; y0 = 34; }
    function build() {
      if (stop) stop();
      stop = null; busy = false; auto = false; tiled = false;
      cuts = []; rem = { x: 0, y: 0, w: a, h: b };
      geo(); draw(1); readOut();
      cutBtn.disabled = false; tileBtn.disabled = true;
    }
    function draw(t) {
      g.innerHTML = '';
      T(g, x0 + (a * u) / 2, 22, `长 ${a}`, 'ts tm');
      T(g, x0 - 6, y0 + (b * u) / 2 + 4, `宽 ${b}`, 'ts tm', 'end');
      S('rect', { x: x0, y: y0, width: a * u, height: b * u, class: 'fsurf2 sstrong' }, g);
      cuts.forEach((q, i) => {
        const last = i === cuts.length - 1, k = last ? t : 1;
        const r = S('rect', { x: x0 + q.x * u, y: y0 + q.y * u, width: q.s * u * (q.horiz ? k : 1), height: q.s * u * (q.horiz ? 1 : k), class: (i % 2 ? 'f3s s3' : 'f1s s1') }, g);
        r.setAttribute('opacity', 0.4 + 0.6 * k);
        if (k === 1 && q.s * u >= 22) T(g, x0 + (q.x + q.s / 2) * u, y0 + (q.y + q.s / 2) * u + 5, String(q.s), 'tb');
      });
      if (rem && rem.w > 0 && rem.h > 0 && t === 1) S('rect', { x: x0 + rem.x * u, y: y0 + rem.y * u, width: rem.w * u, height: rem.h * u, class: 'fnone s2 dash' }, g);
      if (tiled) {
        const G = gcd(a, b);
        for (let x = G; x < a; x += G) S('line', { x1: x0 + x * u, x2: x0 + x * u, y1: y0, y2: y0 + b * u, class: 'sstrong thin' }, g);
        for (let y = G; y < b; y += G) S('line', { y1: y0 + y * u, y2: y0 + y * u, x1: x0, x2: x0 + a * u, class: 'sstrong thin' }, g);
      }
    }
    function readOut() {
      const G = gcd(a, b);
      if (!cuts.length) { read.innerHTML = `一张长 ${a}、宽 ${b} 的长方形纸，要剪成同样大的正方形，没有剩余，正方形最大多大？先从里面切下<b>最大的正方形</b>（边长等于短边）。`; return; }
      if (tiled) {
        read.innerHTML = `用边长 ${G} 的正方形铺：长边放 ${a} ÷ ${G} = ${a / G} 个，宽边放 ${b} ÷ ${G} = ${b / G} 个，一共 ${a / G} × ${b / G} = <b>${(a / G) * (b / G)}</b> 个，正好铺满。<br>正方形的边长必须同时整除 ${a} 和 ${b}，是它们的<b>公因数</b>；要最大，就是<b>最大公因数 ${G}</b>。`;
        return;
      }
      if (rem.w > 0 && rem.h > 0) {
        read.innerHTML = `切下一个边长 ${cuts[cuts.length - 1].s} 的正方形，还剩 <span class="k2">${rem.w} × ${rem.h}</span> 的长方形（虚线）。接着从剩下的里面切最大的正方形。`;
      } else {
        read.innerHTML = `最后切下的正方形边长 <b>${G}</b>，正好把剩下的切完！它就是 ${a} 和 ${b} 的<b>最大公因数</b>。<br>为什么？前面切下的正方形边长都是 ${G} 的倍数，边长 ${G} 的小正方形能把它们每一个都铺满。点“铺满看看”。`;
      }
    }
    function cut() {
      if (busy || !rem || rem.w <= 0 || rem.h <= 0) return false;
      const s = Math.min(rem.w, rem.h);
      const horiz = rem.w >= rem.h;
      cuts.push({ x: rem.x, y: rem.y, s, horiz });
      rem = horiz ? { x: rem.x + s, y: rem.y, w: rem.w - s, h: rem.h } : { x: rem.x, y: rem.y + s, w: rem.w, h: rem.h - s };
      busy = true;
      stop = tween(550, (e) => draw(e), () => {
        busy = false; stop = null; draw(1); readOut();
        if (rem.w <= 0 || rem.h <= 0) { cutBtn.disabled = true; tileBtn.disabled = false; auto = false; }
        else if (auto) setTimeout(() => { if (auto) cut(); }, 300);
      });
      return true;
    }
    const cutBtn = btn(c, '切下最大的正方形', () => { auto = false; cut(); });
    btn(c, '一直切到底', () => { if (busy) return; auto = true; if (!cut()) auto = false; });
    const tileBtn = btn(c, '铺满看看', () => { if (busy) return; tiled = true; draw(1); readOut(); }, 'alt');
    btn(c, '重来', build, 'alt');
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'gca', '长', 4, 36, 1, a, (v) => { a = v; build(); });
    slider(row, 'gcb', '宽', 4, 24, 1, b, (v) => { b = v; build(); });
    build();
  };

  // ═════════════ 公倍数：两路车同时发车 ═════════════
  A.o_gcd_app_bus = function (el) {
    const W = 440, Hh = 200;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), gM = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 6, b = 8, L = 48, busy = false, stop = null, marks = [];
    const yL = 110, xa = 20, xb = 420;
    const X = (t) => xa + (t * (xb - xa)) / L;
    function build() {
      if (stop) stop();
      stop = null; busy = false;
      const M = lcm(a, b);
      L = M * 2 <= 120 ? M * 2 : M;
      g.innerHTML = ''; gM.innerHTML = '';
      S('line', { x1: xa, x2: xb, y1: yL, y2: yL, class: 'sstrong' }, g);
      T(g, xa, yL + 40, '0', 'ts tm');
      T(g, xb, yL + 40, `${L} 分`, 'ts tm');
      for (let t = M; t < L; t += M) T(g, X(t), yL + 40, `${t}`, 'ts tm');
      T(g, xa, 30, '1 路', 'ts t1 tb', 'start');
      T(g, xa, 190, '2 路', 'ts t3 tb', 'start');
      marks = [];
      for (let t = 0; t <= L; t++) {
        const ia = t % a === 0, ib = t % b === 0;
        if (!ia && !ib) continue;
        const e = S('g', { opacity: 0 }, gM);
        if (ia) S('rect', { x: X(t) - 3, y: yL - 30, width: 6, height: 24, rx: 2, class: 'f1' }, e);
        if (ib) S('rect', { x: X(t) - 3, y: yL + 6, width: 6, height: 24, rx: 2, class: 'f3' }, e);
        if (ia && ib) {
          S('circle', { cx: X(t), cy: yL, r: 8, class: 'f2' }, e);
          T(e, X(t), yL - 40, `${t}`, 't2 tb');
        }
        marks.push({ t, e, both: ia && ib });
      }
      cur = S('line', { x1: xa, x2: xa, y1: yL - 50, y2: yL + 50, class: 's2 dash', opacity: 0 }, g);
      read.innerHTML = `1 路车每 <span class="k1">${a}</span> 分钟发一班，2 路车每 <span class="k3">${b}</span> 分钟发一班，0 分钟时同时发车。下一次同时发车在什么时候？点“开始发车”。`;
    }
    let cur;
    function finish() {
      const M = lcm(a, b);
      const la = [], lb = [];
      for (let t = 0; t <= Math.min(L, 4 * a); t += a) la.push(t);
      for (let t = 0; t <= Math.min(L, 4 * b); t += b) lb.push(t);
      const both = [];
      for (let t = 0; t <= L; t += M) both.push(t);
      read.innerHTML = `1 路发车时刻：${la.join('、')}……（${a} 的倍数）<br>2 路发车时刻：${lb.join('、')}……（${b} 的倍数）<br>` +
        `同时发车的时刻既是 ${a} 的倍数又是 ${b} 的倍数，是<b>公倍数</b>：${both.join('、')}……第一次再同时发车是 <b>${M}</b> 分钟后，就是 ${a} 和 ${b} 的<b>最小公倍数</b>。` +
        (M < a * b ? `（不是 ${a} × ${b} = ${a * b}！）` : '');
    }
    btn(c, '开始发车', () => {
      if (busy) return;
      busy = true;
      marks.forEach((m) => m.e.setAttribute('opacity', 0));
      cur.setAttribute('opacity', 1);
      let firstBoth = false;
      stop = tween(Math.min(5000, 1500 + L * 30), (e, raw) => {
        const t = raw * L;
        cur.setAttribute('x1', X(t)); cur.setAttribute('x2', X(t));
        marks.forEach((m) => {
          if (m.t <= t + 1e-9 && m.e.getAttribute('opacity') === '0') {
            m.e.setAttribute('opacity', 1);
            if (m.both && m.t > 0 && !firstBoth) { firstBoth = true; read.innerHTML = `第 <b>${m.t}</b> 分钟：两路车又同时发车了！`; }
            else if (!firstBoth) read.innerHTML = `第 ${m.t} 分钟：${m.t % a === 0 ? '1 路' : ''}${m.t % a === 0 && m.t % b === 0 ? '和' : ''}${m.t % b === 0 ? '2 路' : ''}发车。`;
          }
        });
      }, () => { busy = false; stop = null; cur.setAttribute('opacity', 0); finish(); });
    });
    btn(c, '直接看全部', () => {
      if (stop) stop();
      stop = null; busy = false;
      marks.forEach((m) => m.e.setAttribute('opacity', 1));
      cur.setAttribute('opacity', 0);
      finish();
    }, 'alt');
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'gba', '1 路间隔', 2, 12, 1, a, (v) => { a = v; build(); });
    slider(row, 'gbb', '2 路间隔', 2, 12, 1, b, (v) => { b = v; build(); });
    build();
  };

  // ═════════════ 奇偶：两两配对 ═════════════
  A.o_parity_pairs = function (el) {
    const W = 440, Hh = 232;
    const svg = stage(el, W, Hh);
    const gL = S('g', {}, svg), g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 7, b = 5, st = 0, busy = false, stop = null, dots = [];
    const sp = 15, xs = 120;
    const at = (i, y) => [xs + Math.floor(i / 2) * sp, y + (i % 2) * sp];
    const odd = (n) => n % 2 === 1;
    const word = (n) => (odd(n) ? '奇数' : '偶数');
    function build() {
      if (stop) stop();
      stop = null; busy = false; st = 0;
      g.innerHTML = ''; gL.innerHTML = '';
      T(gL, 20, 46, `甲 ${a}`, 't1 tb', 'start');
      T(gL, 20, 116, `乙 ${b}`, 't3 tb', 'start');
      T(gL, 20, 196, '合起来', 't2 tb', 'start');
      dots = [];
      for (let i = 0; i < a; i++) dots.push({ p0: at(i, 36), p1: at(i, 186), cls: 'f1', el: null });
      for (let i = 0; i < b; i++) dots.push({ p0: at(i, 106), p1: at(a + i, 186), cls: 'f3', el: null });
      dots.forEach((d) => { d.el = S('circle', { cx: d.p0[0], cy: d.p0[1], r: 6, class: d.cls }, g); });
      mark(false);
      goBtn.textContent = '合起来';
      readOut();
    }
    // 落单的点画上橙色圈
    function mark(merged) {
      g.querySelectorAll('.lone').forEach((e) => e.remove());
      const ring = (p) => S('circle', { cx: p[0], cy: p[1], r: 10, class: 'fnone s2 lone' }, g);
      if (!merged) {
        if (odd(a)) ring(dots[a - 1].p0);
        if (odd(b)) ring(dots[a + b - 1].p0);
      } else if (odd(a + b)) ring(dots[a + b - 1].p1);
    }
    function readOut() {
      if (!st) {
        read.innerHTML = `把点两个两个配成对。<span class="k1">${a}</span> 是${word(a)}${odd(a) ? '，剩 1 个落单（橙圈）' : '，正好配完'}；<span class="k3">${b}</span> 是${word(b)}${odd(b) ? '，剩 1 个落单' : '，正好配完'}。合起来呢？`;
        return;
      }
      let why;
      if (odd(a) && odd(b)) why = '两个落单的点碰到一起，正好配成一对：<b>奇数 + 奇数 = 偶数</b>。';
      else if (odd(a) || odd(b)) why = '只有一个落单的点，合起来还是落单：<b>奇数 + 偶数 = 奇数</b>。';
      else why = '本来就没有落单的点：<b>偶数 + 偶数 = 偶数</b>。';
      read.innerHTML = `${a} + ${b} = ${a + b}，是${word(a + b)}。${why}<br>所以一串数相加，只要数一数<b>有几个奇数</b>：奇数有偶数个，和是偶数；有奇数个，和是奇数。`;
    }
    const goBtn = btn(c, '合起来', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st ? 0 : 1;
      g.querySelectorAll('.lone').forEach((e) => e.remove());
      stop = tween(1000, (e) => {
        const t = lerp(from, to, e);
        dots.forEach((d) => { d.el.setAttribute('cx', lerp(d.p0[0], d.p1[0], t)); d.el.setAttribute('cy', lerp(d.p0[1], d.p1[1], t)); });
      }, () => {
        busy = false; stop = null; st = to; mark(!!st);
        goBtn.textContent = st ? '分开' : '合起来';
        readOut();
      });
    });
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'ppa', '甲', 1, 15, 1, a, (v) => { a = v; build(); });
    slider(row, 'ppb', '乙', 1, 15, 1, b, (v) => { b = v; build(); });
    build();
  };

  // ═════════════ 奇偶：翻杯子 ═════════════
  A.o_parity_cups = function (el) {
    const W = 440, Hh = 160;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 7, k = 2, up = [], sel = new Set(), moves = 0, busy = false, stop = null, cups = [], msg = '';
    const X = (i) => W / 2 + (i - (n - 1) / 2) * 50;
    const cy = 80;
    function build() {
      if (stop) stop();
      stop = null; busy = false;
      if (k > n) k = n;
      up = Array(n).fill(true); sel = new Set(); moves = 0; msg = '';
      draw(); readOut();
    }
    function draw(flipT) {
      g.innerHTML = '';
      cups = [];
      for (let i = 0; i < n; i++) {
        const e = S('g', { class: 'clickable', tabindex: 0, role: 'button', 'aria-label': `第${i + 1}只杯子` }, g);
        if (sel.has(i)) S('rect', { x: X(i) - 23, y: cy - 34, width: 46, height: 68, rx: 8, class: 'f2s s2' }, e);
        let sy = up[i] ? 1 : -1;
        if (flipT != null && sel.has(i)) sy = Math.cos(PI * flipT) * (up[i] ? 1 : -1);
        const cup = S('g', { transform: `translate(${X(i)},${cy}) scale(1,${sy})` }, e);
        const cls = up[i] ? 'f1s s1' : 'f3s s3';
        S('path', { d: 'M-16,-20 L16,-20 L11,22 L-11,22 Z', class: cls }, cup);
        S('ellipse', { cx: 0, cy: -20, rx: 16, ry: 5, class: up[i] ? 'fsurf s1' : 'f3 s3' }, cup);
        T(e, X(i), cy + 52, up[i] ? '口朝上' : '口朝下', 'ts ' + (up[i] ? 't1' : 't3'));
        const tog = () => {
          if (busy) return;
          if (sel.has(i)) sel.delete(i); else sel.add(i);
          msg = ''; draw(); readOut();
        };
        e.addEventListener('click', tog);
        e.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tog(); } });
        cups.push(e);
      }
      T(g, W / 2, 20, `已翻 ${moves} 次，口朝上的有 ${up.filter((x) => x).length} 只`, 'ts tm');
    }
    function readOut() {
      const U = up.filter((x) => x).length;
      if (U === 0) { read.innerHTML = `全部口朝下了！一共翻了 ${moves} 次。`; return; }
      let tip = `每次必须正好翻 <b>${k}</b> 只。点杯子选中（已选 ${sel.size} 只），再点“翻转”。口朝上的现在有 <b>${U}</b> 只，是${U % 2 ? '奇数' : '偶数'}。`;
      if (moves > 0) {
        tip += k % 2 === 0
          ? `<br>每次翻 ${k} 只（偶数）：翻的杯子里，原来朝上的变朝下、朝下的变朝上，朝上的只数每次只会变化偶数个（或不变），<b>奇偶性永远不变</b>。` +
            (n % 2 ? `一开始 ${n} 只朝上（奇数），永远不可能变成 0 只，所以<b>做不到</b>。` : '')
          : `<br>每次翻 ${k} 只（奇数），朝上的只数每翻一次就变一次奇偶。`;
      }
      read.innerHTML = (msg ? msg + '<br>' : '') + tip;
    }
    function flip() {
      if (busy) return;
      if (sel.size !== k) { msg = `<span class="k2">要正好选 ${k} 只，现在选了 ${sel.size} 只。</span>`; readOut(); return; }
      busy = true;
      stop = tween(700, (e) => draw(e), () => {
        sel.forEach((i) => { up[i] = !up[i]; });
        sel = new Set(); moves++; busy = false; stop = null; msg = '';
        draw(); readOut();
      });
    }
    btn(c, '翻转选中的杯子', flip);
    btn(c, '随机选好', () => {
      if (busy) return;
      sel = new Set();
      while (sel.size < k) sel.add(rnd(0, n - 1));
      msg = ''; draw(); readOut();
    }, 'alt');
    btn(c, '重来', build, 'alt');
    const row = H('div', { class: 'anim-row' }, el);
    const sk = slider(row, 'pck', '每次翻几只', 1, 8, 1, k, (v) => { k = Math.min(v, n); if (k !== v) sk.set(k); build(); });
    slider(row, 'pcn', '杯子数', 3, 8, 1, n, (v) => { n = v; if (k > n) { k = n; sk.set(k); } build(); });
    build();
  };

  // ═════════════ 奇偶：握手 ═════════════
  A.o_parity_hand = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const gE = S('g', {}, svg), g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 6, edges = [], first = -1, busy = false, stop = null;
    const cx = 220, cy = 125, R = 95;
    const P = (i) => [cx + R * Math.sin((2 * PI * i) / n), cy - R * Math.cos((2 * PI * i) / n)];
    const key = (i, j) => (i < j ? `${i}-${j}` : `${j}-${i}`);
    const deg = (i) => edges.filter(([x, y]) => x === i || y === i).length;
    function build() {
      if (stop) stop();
      stop = null; busy = false; edges = []; first = -1;
      draw(); readOut();
    }
    function draw(grow) {
      gE.innerHTML = ''; g.innerHTML = '';
      edges.forEach(([i, j], k) => {
        const p = P(i), q = P(j), t = grow != null && k === edges.length - 1 ? grow : 1;
        S('line', { x1: p[0], y1: p[1], x2: lerp(p[0], q[0], t), y2: lerp(p[1], q[1], t), class: 'smuted' }, gE);
      });
      for (let i = 0; i < n; i++) {
        const [x, y] = P(i), d = deg(i);
        const e = S('g', { class: 'clickable', tabindex: 0, role: 'button', 'aria-label': `第${i + 1}个人` }, g);
        if (first === i) S('circle', { cx: x, cy: y, r: 24, class: 'fnone s3 thick' }, e);
        S('circle', { cx: x, cy: y, r: 18, class: d % 2 ? 'f2s s2' : 'f1s s1' }, e);
        T(e, x, y + 5, String(d), 'tb');
        const tap = () => click(i);
        e.addEventListener('click', tap);
        e.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') tap(); });
      }
    }
    function add(i, j) {
      edges.push([i, j]);
      busy = true;
      stop = tween(450, (e) => draw(e), () => { busy = false; stop = null; draw(); readOut(); });
    }
    function click(i) {
      if (busy) return;
      if (first < 0) { first = i; draw(); readOut(); return; }
      if (first === i) { first = -1; draw(); readOut(); return; }
      const k = key(first, i), j = first;
      first = -1;
      const idx = edges.findIndex(([x, y]) => key(x, y) === k);
      if (idx >= 0) { edges.splice(idx, 1); draw(); readOut(); return; }
      add(j, i);
    }
    function readOut() {
      const E = edges.length, ds = [];
      for (let i = 0; i < n; i++) ds.push(deg(i));
      const sum = ds.reduce((x, y) => x + y, 0), oddN = ds.filter((d) => d % 2).length;
      if (!E) {
        read.innerHTML = first >= 0 ? '再点另一个人，他们俩就握一次手。' : `${n} 个人，圆圈里的数是这个人握手的次数。点两个人让他们握手（再点一次同样的两人就取消），或者点“随机握一次手”。`;
        return;
      }
      read.innerHTML = `一共握手 <b>${E}</b> 次。每人握手次数加起来：${ds.join(' + ')} = <b>${sum}</b> = 2 × ${E}。` +
        `每次握手两个人<b>各算 1 次</b>，所以总数一定是<b>偶数</b>。<br>握了奇数次的人（橙色）有 <span class="k2">${oddN}</span> 个——不管怎么握，它永远是<b>偶数</b>个。` +
        (first >= 0 ? '<br>（已选中一个人，再点另一个人。）' : '');
    }
    btn(c, '随机握一次手', () => {
      if (busy) return;
      const free = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (!edges.some(([x, y]) => key(x, y) === key(i, j))) free.push([i, j]);
      if (!free.length) { read.innerHTML = '每两个人都已经握过手了！'; return; }
      first = -1;
      const [i, j] = free[rnd(0, free.length - 1)];
      add(i, j);
    });
    btn(c, '清空', build, 'alt');
    const row = H('div', { class: 'anim-row' }, el);
    slider(row, 'phn', '人数', 4, 8, 1, n, (v) => { n = v; build(); });
    build();
  };

  // ═════════════ 完全平方数：点阵一层层加 ═════════════
  A.o_square_num_dots = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg), gT = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 4, busy = false, stop = null, auto = false;
    const sp = 19, ox = 24, oy = 22, MAX = 11;
    function draw(grow) {
      g.innerHTML = ''; gT.innerHTML = '';
      const show = grow != null ? n + 1 : n;
      for (let i = 0; i < show; i++) {
        for (let j = 0; j < show; j++) {
          const L = Math.max(i, j);
          const isNew = grow != null && L === n;
          const e = S('circle', { cx: ox + j * sp, cy: oy + i * sp, r: 7, class: isNew ? 'f2' : L % 2 ? 'f3' : 'f1' }, g);
          if (isNew) {
            // 新的一层按顺序冒出来
            const order = i === n ? j : n + (n - i);
            const t = Math.max(0, Math.min(1, grow * (2 * n + 1) - order));
            e.setAttribute('r', 7 * t);
          }
        }
      }
      for (let k = 1; k <= n; k++) {
        T(gT, 262, oy + 4 + (k - 1) * 19, `+${2 * k - 1}`, 'ts ' + (k % 2 ? 't3' : 't1') + ' tb', 'start');
        T(gT, 300, oy + 4 + (k - 1) * 19, `→ ${k * k} = ${k} × ${k}`, 'ts', 'start');
      }
    }
    function readOut() {
      read.innerHTML = `${n} × ${n} = <b>${n * n}</b> 个点，一层一层数：1 + 3 + 5${n > 3 ? ' + …' : ''}${n > 2 ? ' + ' + (2 * n - 1) : ''} = ${n * n}（前 ${n} 个奇数的和）。` +
        (n < MAX ? `<br>要变成 ${n + 1} × ${n + 1}，要在右边和下边加一个“L”形：${n} + ${n} + 1 = <b>${2 * n + 1}</b> 个点，所以 ${n + 1}<sup>2</sup> − ${n}<sup>2</sup> = ${n} + ${n + 1} = ${2 * n + 1}。` : '');
    }
    function grow() {
      if (busy || n >= MAX) return false;
      busy = true;
      stop = tween(500 + n * 120, (e, raw) => draw(raw), () => {
        busy = false; stop = null; n++; draw(); readOut(); sl.set(n);
        if (auto && n < MAX) setTimeout(() => { if (auto) grow(); }, 250); else auto = false;
      });
      return true;
    }
    btn(c, '加一层', () => { auto = false; grow(); });
    btn(c, '从 1 开始搭', () => {
      if (stop) stop();
      stop = null; busy = false;
      n = 1; draw(); readOut(); sl.set(n); auto = true; grow();
    });
    btn(c, '减一层', () => { if (busy || n <= 1) return; auto = false; n--; draw(); readOut(); sl.set(n); }, 'alt');
    const row = H('div', { class: 'anim-row' }, el);
    const sl = slider(row, 'sqn', 'n', 1, MAX, 1, n, (v) => { if (stop) stop(); stop = null; busy = false; auto = false; n = v; draw(); readOut(); });
    draw(); readOut();
  };

  // ═════════════ 完全平方数：约数配对 ═════════════
  A.o_square_num_pairs = function (el) {
    const W = 440, Hh = 220;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let N = 36, ds = [], shown = 0, busy = false, stop = null;
    const yl = 150;
    let sp, r;
    const X = (i) => W / 2 + (i - (ds.length - 1) / 2) * sp;
    function build() {
      if (stop) stop();
      stop = null; busy = false; shown = 0;
      ds = divisorsOf(N);
      sp = Math.min(40, 410 / ds.length);
      r = Math.min(15, sp / 2 - 1);
      draw(1); readOut();
    }
    const pairsN = () => Math.ceil(ds.length / 2);
    function draw(t) {
      g.innerHTML = '';
      const k = ds.length, sq = k % 2 === 1;
      for (let p = 0; p < shown; p++) {
        const i = p, j = k - 1 - p;
        if (i === j) continue;
        const last = p === shown - 1, tt = last ? t : 1;
        const h = 14 + (j - i) * sp * 0.25;
        const d = `M${X(i)},${yl - r} Q${(X(i) + X(j)) / 2},${yl - r - 2 * h} ${X(j)},${yl - r}`;
        const pa = S('path', { d, class: 'fnone ' + (p % 2 ? 's3' : 's1') }, g);
        pa.setAttribute('opacity', tt);
        if (tt === 1) T(g, (X(i) + X(j)) / 2, yl - r - h - 4, `${ds[i]}×${ds[j]}`, 'ts tm');
      }
      ds.forEach((v, i) => {
        const lone = sq && i === (k - 1) / 2 && shown >= pairsN();
        S('circle', { cx: X(i), cy: yl, r, class: lone ? 'f2 s2' : 'fsurf s1' }, g);
        T(g, X(i), yl + 4, String(v), String(v).length > 2 || r < 13 ? 'ts tb' : 'tb');
        if (lone) T(g, X(i), yl + r + 22, `${v} × ${v}，自己配自己`, 't2 tb');
      });
    }
    function readOut() {
      const k = ds.length, sq = k % 2 === 1, rt = Math.round(Math.sqrt(N));
      if (shown < pairsN()) {
        read.innerHTML = `<b>${N}</b> 有 ${k} 个约数，从小到大排好。约数总是成对的：一个约数 × 另一个约数 = ${N}。点“配对”，把它们一对一对连起来。`;
        return;
      }
      read.innerHTML = sq
        ? `${N} = ${rt} × ${rt} 是<b>完全平方数</b>：其他约数都两两配好，只有中间的 <span class="k2">${rt}</span> 配不成别人，只能自己配自己，所以约数个数 ${k} 是<b>奇数</b>。`
        : `${N} 的 ${k} 个约数正好配成 ${k / 2} 对，约数个数是<b>偶数</b>。${N} 不是完全平方数，没有“自己配自己”的约数。`;
    }
    btn(c, '配对', () => {
      if (busy) return;
      if (shown >= pairsN()) shown = 0;
      busy = true;
      const go = () => {
        shown++;
        stop = tween(380, (e) => draw(e), () => {
          draw(1);
          if (shown < pairsN()) go();
          else { busy = false; stop = null; readOut(); }
        });
      };
      go();
    });
    btn(c, '跳到下一个完全平方数', () => {
      let m = Math.floor(Math.sqrt(N)) + 1;
      if (m * m > 100) m = 1;
      N = m * m; sl.set(N); build();
    }, 'alt');
    const row = H('div', { class: 'anim-row' }, el);
    const sl = slider(row, 'sqp', '这个数', 1, 100, 1, N, (v) => { N = v; build(); });
    build();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
