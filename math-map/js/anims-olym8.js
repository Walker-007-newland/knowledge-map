// 奥数拓展 第 8 组：计数（加乘原理、容斥、排列、组合、枚举与标数、构造与染色、计数与概率）
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, grid, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  let uid = 0;
  const rid = (p) => p + '-o8-' + (++uid) + '-' + Math.floor(Math.random() * 1e6);
  const later = (ms, fn) => setTimeout(fn, RM ? 0 : ms);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  // 分数显示：能约分时写出约分结果
  const frac = (m, n) => {
    if (m === 0) return '0';
    if (m === n) return `${window.fr(m, n)} = 1`;
    const g = gcd(m, n);
    return g > 1 ? `${window.fr(m, n)} = ${window.fr(m / g, n / g)}` : window.fr(m, n);
  };
  // 闪烁：透明度来回变化，结束后回到 base
  function flash(elm, ms, base, done) {
    return tween(ms, (t, raw) => elm.setAttribute('opacity', 0.15 + 0.85 * Math.abs(Math.cos(raw * PI * 3))), () => {
      elm.setAttribute('opacity', base == null ? 1 : base);
      if (done) done();
    });
  }
  const prodList = (from, cnt) => Array.from({ length: cnt }, (_, i) => from - i);
  const prodOf = (arr) => arr.reduce((a, b) => a * b, 1);

  // ───────── 加法原理与乘法原理：路线图 ─────────
  A.o_add_mul_route = function (el) {
    const W = 440, Hh = 270;
    const svg = stage(el, W, Hh);
    const cap = T(svg, W / 2, 18, '', 'ts tm');
    const gR = S('g', {}, svg);
    const gN = S('g', {}, svg);
    const dot = S('circle', { r: 7, class: 'f2', opacity: 0 }, svg);
    const P = { A: [50, 120], B: [220, 120], C: [390, 120] };
    [['A', '家'], ['B', '书店'], ['C', '学校']].forEach(([k, nm]) => {
      S('circle', { cx: P[k][0], cy: P[k][1], r: 19, class: 'fsurf sstrong' }, gN);
      T(gN, P[k][0], P[k][1] + 6, k, 'tl tb');
      T(gN, P[k][0], P[k][1] - 26, nm, 'ts tb');
    });
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let m = 3, n = 2, k = 1, run = 0, stopT = null;
    let roads = [], routes = [];
    const LET = 'abcd';
    const qpath = (p, q, cy) => `M${p[0]},${p[1]} Q${(p[0] + q[0]) / 2},${cy} ${q[0]},${q[1]}`;
    function badge(x, y, txt, cls) {
      S('circle', { cx: x, cy: y, r: txt.length > 1 ? 13 : 10, class: 'fsurf ' + cls }, gR);
      T(gR, x, y + 4, txt, 'ts tb');
    }
    function build() {
      run++;
      if (stopT) stopT();
      dot.setAttribute('opacity', 0);
      gR.innerHTML = '';
      roads = []; routes = [];
      const ab = [], bc = [], ac = [];
      for (let i = 0; i < m; i++) {
        const off = (i - (m - 1) / 2) * 30;
        const p = S('path', { d: qpath(P.A, P.B, 120 + off * 2), class: 'fnone smuted' }, gR);
        ab.push(p); roads.push(p);
      }
      for (let j = 0; j < n; j++) {
        const off = (j - (n - 1) / 2) * 30;
        const p = S('path', { d: qpath(P.B, P.C, 120 + off * 2), class: 'fnone smuted' }, gR);
        bc.push(p); roads.push(p);
      }
      for (let d = 0; d < k; d++) {
        const peak = 205 + d * 23;
        const p = S('path', { d: qpath(P.A, P.C, 2 * peak - 120), class: 'fnone smuted' }, gR);
        ac.push(p); roads.push(p);
      }
      for (let i = 0; i < m; i++) badge(135, 120 + (i - (m - 1) / 2) * 30, String(i + 1), 's1');
      for (let j = 0; j < n; j++) badge(305, 120 + (j - (n - 1) / 2) * 30, LET[j], 's2');
      for (let d = 0; d < k; d++) badge(220, 205 + d * 23, '直' + (d + 1), 's3');
      for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) routes.push({ paths: [ab[i], bc[j]], name: `${i + 1}${LET[j]}`, i, j });
      for (let d = 0; d < k; d++) routes.push({ paths: [ac[d]], name: `直${d + 1}`, d });
      cap.textContent = `A→B 有 ${m} 条路，B→C 有 ${n} 条路，A→C 直达 ${k} 条路`;
      read.innerHTML = `从家（A）去学校（C）有两类走法：<b>经过书店 B</b>，或者<b>直达</b>。点“一条一条数”，看看一共有几条路线。`;
    }
    function finish() {
      let s = `经过书店：每条 A→B 的路都能接上 ${n} 条 B→C 的路，要<b>分两步</b>走完，用乘法：<span class="k1">${m} × ${n} = ${m * n}</span> 条。`;
      if (k > 0) s += `<br>直达：<span class="k3">${k}</span> 条。两类走法只要选一类就能到学校，用加法：<b>${m * n} + ${k} = ${m * n + k}</b> 条。`;
      else s += `<br>没有直达的路，一共 <b>${m * n}</b> 条。`;
      read.innerHTML = s;
    }
    function count() {
      const my = ++run;
      if (stopT) stopT();
      const done = [];
      let idx = 0;
      function next() {
        if (my !== run) return;
        roads.forEach((r) => r.setAttribute('class', 'fnone smuted'));
        if (idx >= routes.length) { dot.setAttribute('opacity', 0); finish(); return; }
        const rt = routes[idx];
        rt.paths.forEach((p) => p.setAttribute('class', 'fnone s2 thick'));
        dot.setAttribute('opacity', 1);
        const lens = rt.paths.map((p) => p.getTotalLength());
        const tot = lens.reduce((a, b) => a + b, 0);
        stopT = tween(650, (t, raw) => {
          let d = raw * tot, s = 0;
          while (s < rt.paths.length - 1 && d > lens[s]) { d -= lens[s]; s++; }
          const pt = rt.paths[s].getPointAtLength(Math.min(d, lens[s]));
          dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        }, () => {
          if (my !== run) return;
          done.push(rt.name);
          const how = rt.d != null ? `走直达路“${rt.name}”` : `先走第 ${rt.i + 1} 条路到书店，再走 ${LET[rt.j]} 路到学校`;
          read.innerHTML = `第 <b>${done.length}</b> 条路线：${how}。<br>已数：${done.join('、')}`;
          idx++;
          later(280, next);
        });
      }
      next();
    }
    btn(c, '一条一条数', count);
    slider(c, 'o8ab', 'A→B', 1, 4, 1, m, (v) => { m = v; build(); });
    slider(c, 'o8bc', 'B→C', 1, 4, 1, n, (v) => { n = v; build(); });
    slider(c, 'o8ac', '直达', 0, 3, 1, k, (v) => { k = v; build(); });
    build();
  };

  // ───────── 加法原理与乘法原理：挑一件 vs 配一套 ─────────
  A.o_add_mul_outfit = function (el) {
    const W = 440, Hh = 262;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let m = 3, n = 4, run = 0;
    const SHIRT = 'M-8,-12 L-16,-7 L-12,0 L-8,-3 L-8,12 L8,12 L8,-3 L12,0 L16,-7 L8,-12 Q0,-5 -8,-12 Z';
    const PANTS = 'M-9,-12 L9,-12 L11,12 L3,12 L0,-1 L-3,12 L-11,12 Z';
    const LET = 'ABCDE';
    const X0 = 100, Y0 = 70, CW = 62, CH = 44;
    let shirts = [], pants = [], cells = [];
    function build() {
      run++;
      g.innerHTML = '';
      shirts = []; pants = []; cells = [];
      T(g, 40, 62, '上衣', 'ts tm');
      T(g, X0 + (n * CW) / 2, 16, '裤子', 'ts tm');
      for (let i = 0; i < m; i++) {
        const cy = Y0 + i * CH + CH / 2;
        const p = S('path', { d: SHIRT, class: 'f1s s1', transform: `translate(34,${cy})` }, g);
        T(g, 62, cy + 5, String(i + 1), 'tb t1');
        shirts.push(p);
      }
      for (let j = 0; j < n; j++) {
        const cx = X0 + j * CW + CW / 2;
        const p = S('path', { d: PANTS, class: 'f2s s2', transform: `translate(${cx - 6},44)` }, g);
        T(g, cx + 14, 49, LET[j], 'tb t2');
        pants.push(p);
      }
      for (let i = 0; i < m; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
          const x = X0 + j * CW, y = Y0 + i * CH;
          const r = S('rect', { x: x + 4, y: y + 4, width: CW - 8, height: CH - 8, rx: 7, class: 'fsurf sline' }, g);
          const t = T(g, x + CW / 2, y + CH / 2 + 5, '', 'tb');
          row.push({ r, t });
        }
        cells.push(row);
      }
      read.innerHTML = `${m} 件上衣、${n} 条裤子。点“挑一件送人”和“配一套穿上”，比较两种问题的数法。`;
    }
    function resetLook() {
      shirts.forEach((p) => p.setAttribute('class', 'f1s s1'));
      pants.forEach((p) => p.setAttribute('class', 'f2s s2'));
      cells.forEach((row) => row.forEach((cl) => { cl.r.setAttribute('class', 'fsurf sline'); cl.t.textContent = ''; }));
    }
    function pickOne() {
      const my = ++run;
      resetLook();
      const seq = shirts.map((p) => [p, 'f1 s1']).concat(pants.map((p) => [p, 'f2 s2']));
      let i = 0;
      (function step() {
        if (my !== run) return;
        if (i >= seq.length) {
          read.innerHTML = `只要挑<b>一件</b>：从上衣里挑有 <span class="k1">${m}</span> 种，从裤子里挑有 <span class="k2">${n}</span> 种。挑上衣或挑裤子，任选<b>一类</b>就完成了——这是<b>分类</b>，用加法：<b>${m} + ${n} = ${m + n}</b> 种。`;
          return;
        }
        seq[i][0].setAttribute('class', seq[i][1]);
        i++;
        read.innerHTML = `挑一件送人，可以挑这一件……已数 <b>${i}</b> 种。`;
        later(380, step);
      })();
    }
    function makeSets() {
      const my = ++run;
      resetLook();
      let i = 0, j = 0, cnt = 0;
      (function step() {
        if (my !== run) return;
        if (i >= m) {
          shirts.forEach((p) => p.setAttribute('class', 'f1s s1'));
          pants.forEach((p) => p.setAttribute('class', 'f2s s2'));
          read.innerHTML = `配一套要<b>先选上衣、再选裤子</b>，两步都做完才算一套——这是<b>分步</b>。每件上衣都能配 ${n} 条裤子（一行 ${n} 套），一共 ${m} 行：<b>${m} × ${n} = ${m * n}</b> 种。`;
          return;
        }
        shirts.forEach((p, k) => p.setAttribute('class', k === i ? 'f1 s1' : 'f1s s1'));
        pants.forEach((p, k) => p.setAttribute('class', k === j ? 'f2 s2' : 'f2s s2'));
        const cl = cells[i][j];
        cl.r.setAttribute('class', 'f3s s3');
        cl.t.textContent = `${i + 1}${LET[j]}`;
        cnt++;
        read.innerHTML = `上衣 ${i + 1} 配裤子 ${LET[j]}，这是第 <b>${cnt}</b> 套。`;
        j++;
        if (j >= n) { j = 0; i++; }
        later(300, step);
      })();
    }
    btn(c, '挑一件送人（分类）', pickOne);
    btn(c, '配一套穿上（分步）', makeSets);
    slider(c, 'o8sh', '上衣', 1, 4, 1, m, (v) => { m = v; build(); });
    slider(c, 'o8pa', '裤子', 1, 5, 1, n, (v) => { n = v; build(); });
    build();
  };

  // ───────── 容斥原理：两个圈 ─────────
  A.o_inclusion_venn2 = function (el) {
    const W = 440, Hh = 268;
    const svg = stage(el, W, Hh);
    const cid = rid('vclip');
    const cp = S('clipPath', { id: cid }, svg);
    S('circle', { cx: 170, cy: 145, r: 90 }, cp);
    const uni = S('rect', { x: 15, y: 30, width: 410, height: 228, rx: 10, class: 'fsurf2 sline' }, svg);
    T(svg, 28, 52, '全班', 'tb tm', 'start');
    const fA = S('circle', { cx: 170, cy: 145, r: 90, class: 'f1s', opacity: 0 }, svg);
    const fB = S('circle', { cx: 270, cy: 145, r: 90, class: 'f2s', opacity: 0 }, svg);
    const lens = S('circle', { cx: 270, cy: 145, r: 90, class: 'f2', opacity: 0, 'clip-path': `url(#${cid})` }, svg);
    S('circle', { cx: 170, cy: 145, r: 90, class: 'fnone s1' }, svg);
    S('circle', { cx: 270, cy: 145, r: 90, class: 'fnone s2' }, svg);
    T(svg, 140, 92, '喜欢足球', 'ts tb t1');
    T(svg, 300, 92, '喜欢篮球', 'ts tb t2');
    const tA = T(svg, 122, 152, '', 'tl tb');
    const tX = T(svg, 220, 152, '', 'tl tb');
    const tB = T(svg, 318, 152, '', 'tl tb');
    T(svg, 125, 172, '只喜欢足球', 'ts tm');
    T(svg, 318, 172, '只喜欢篮球', 'ts tm');
    T(svg, 220, 118, '都喜欢', 'ts tm');
    const badge = T(svg, 220, 176, '', 'ts tb t2');
    T(svg, 62, 226, '两样都不', 'ts tm');
    const tY = T(svg, 62, 248, '', 'tl tb');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 12, x = 5, b = 8, y = 3, st = 0, stop = null;
    const nb = btn(c, '下一步', () => { st = st >= 4 ? 0 : st + 1; render(true); });
    btn(c, '重来', () => { st = 0; render(false); }, 'alt');
    const c2 = ctrl(el);
    const reset = () => { st = 0; render(false); };
    slider(c2, 'o8va', '只足球', 0, 20, 1, a, (v) => { a = v; reset(); });
    slider(c2, 'o8vx', '都喜欢', 0, 12, 1, x, (v) => { x = v; reset(); });
    slider(c2, 'o8vb', '只篮球', 0, 20, 1, b, (v) => { b = v; reset(); });
    slider(c2, 'o8vy', '都不', 0, 10, 1, y, (v) => { y = v; reset(); });
    function render(anim) {
      if (stop) { stop(); stop = null; }
      const NA = a + x, NB = b + x;
      tA.textContent = a; tX.textContent = x; tB.textContent = b; tY.textContent = y;
      fA.setAttribute('opacity', st >= 1 ? 0.75 : 0);
      fB.setAttribute('opacity', st >= 2 ? 0.75 : 0);
      lens.setAttribute('opacity', 0);
      uni.setAttribute('opacity', 1);
      badge.textContent = st === 2 ? '被数了 2 次！' : st >= 3 ? '只算 1 次' : '';
      nb.textContent = st >= 4 ? '再看一遍' : '下一步';
      if (st === 0) read.innerHTML = `喜欢足球的一共 ${a} + ${x} = <span class="k1">${NA}</span> 人，喜欢篮球的一共 ${b} + ${x} = <span class="k2">${NB}</span> 人。全班有多少人？点“下一步”。`;
      else if (st === 1) read.innerHTML = `先数喜欢足球的：<span class="k1">${NA}</span> 人（只喜欢足球的 ${a} 人 + 两样都喜欢的 ${x} 人，整个蓝圈）。`;
      else if (st === 2) {
        read.innerHTML = `再加上喜欢篮球的 <span class="k2">${NB}</span> 人：${NA} + ${NB} = ${NA + NB}。可是中间重叠的 <b>${x}</b> 人既在蓝圈里、又在橙圈里，<b>被数了 2 次</b>！`;
        if (anim) stop = flash(lens, 1500, 0);
      } else if (st === 3) {
        read.innerHTML = `多数了一次，就减掉一次：${NA} + ${NB} − ${x} = <b>${NA + NB - x}</b>，这是<b>至少喜欢一样</b>的人数。`;
        if (anim) stop = flash(lens, 1200, 0);
      } else {
        read.innerHTML = `最后加上圈外两样都不喜欢的 ${y} 人：全班 = ${NA} + ${NB} − ${x} + ${y} = <b>${NA + NB - x + y}</b> 人。`;
        if (anim) stop = flash(uni, 1200, 1);
      }
    }
    render(false);
  };

  // ───────── 容斥原理：三个圈 ─────────
  A.o_inclusion_venn3 = function (el) {
    const W = 440, Hh = 300;
    const svg = stage(el, W, Hh);
    const CS = [[170, 110, 'f1s', 's1', '美术'], [270, 110, 'f2s', 's2', '音乐'], [220, 195, 'f3s', 's3', '体育']];
    const fills = CS.map(([x, y, f]) => S('circle', { cx: x, cy: y, r: 80, class: f, opacity: 0 }, svg));
    CS.forEach(([x, y, , s]) => S('circle', { cx: x, cy: y, r: 80, class: 'fnone ' + s }, svg));
    T(svg, 90, 40, '美术', 'tb t1'); T(svg, 350, 40, '音乐', 'tb t2'); T(svg, 220, 293, '体育', 'tb t3');
    // 区域：只A、只B、只C、AB、AC、BC、ABC
    const POS = [[140, 93], [300, 93], [220, 229], [220, 92], [179, 161], [261, 161], [220, 138]];
    const regs = POS.map(([x, y]) => {
      const gg = S('g', {}, svg);
      const num = T(gg, x, y + 3, '', 'tb');
      const bd = T(gg, x, y + 17, '', 'ts t2');
      return { gg, num, bd };
    });
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let d = [], st = 0, stops = [];
    const nb = btn(c, '下一步', () => { st = st >= 3 ? 0 : st + 1; render(true); });
    btn(c, '换一组数据', () => { newData(); st = 0; render(false); }, 'alt');
    const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
    function newData() { d = [rnd(3, 9), rnd(3, 9), rnd(3, 9), rnd(1, 4), rnd(1, 4), rnd(1, 4), rnd(1, 3)]; }
    function render(anim) {
      stops.forEach((s) => s()); stops = [];
      const [a, b, cc, ab, ac, bc, abc] = d;
      const NA = a + ab + ac + abc, NB = b + ab + bc + abc, NC = cc + ac + bc + abc;
      const AB = ab + abc, AC = ac + abc, BC = bc + abc;
      const S1 = NA + NB + NC, S2 = S1 - AB - AC - BC, tot = S2 + abc;
      regs.forEach((r, i) => { r.num.textContent = d[i]; r.gg.setAttribute('opacity', 1); });
      fills.forEach((f) => f.setAttribute('opacity', st >= 1 ? 0.55 : 0));
      const times = st === 0 ? null : st === 1 ? [1, 1, 1, 2, 2, 2, 3] : st === 2 ? [1, 1, 1, 1, 1, 1, 0] : [1, 1, 1, 1, 1, 1, 1];
      regs.forEach((r, i) => { r.bd.textContent = times ? `数了${times[i]}次` : ''; });
      nb.textContent = st >= 3 ? '再看一遍' : '下一步';
      const facts = `美术 <span class="k1">${NA}</span> 人，音乐 <span class="k2">${NB}</span> 人，体育 <span class="k3">${NC}</span> 人；美术和音乐都参加 ${AB} 人，美术和体育 ${AC} 人，音乐和体育 ${BC} 人，三个都参加 ${abc} 人。`;
      if (st === 0) read.innerHTML = facts + '<br>（图里每块写的是<b>只</b>在这一块的人数。）至少参加一组的有多少人？点“下一步”。';
      else if (st === 1) {
        read.innerHTML = `先把三个圈加起来：${NA} + ${NB} + ${NC} = ${S1}。看小字：两圈重叠的地方被数了 <b>2 次</b>，中间三圈重叠的地方被数了 <b>3 次</b>。`;
        if (anim) [3, 4, 5, 6].forEach((i) => stops.push(flash(regs[i].gg, 1500, 1)));
      } else if (st === 2) {
        read.innerHTML = `减去两两重叠的部分：${S1} − ${AB} − ${AC} − ${BC} = ${S2}。两圈重叠的地方只剩 1 次了，可中心在三个“两两重叠”里都有，被减了 3 次，变成 <b>0 次</b>——漏掉了！`;
        if (anim) stops.push(flash(regs[6].gg, 1500, 1));
      } else {
        read.innerHTML = `把中心的 ${abc} 人加回来：${S2} + ${abc} = <b>${tot}</b> 人。现在每一块都正好数了 1 次。<br>这就是：A + B + C − AB − AC − BC + ABC。`;
        if (anim) stops.push(flash(regs[6].gg, 1200, 1));
      }
    }
    newData();
    render(false);
  };

  // ───────── 排列：排座位 ─────────
  A.o_perm_seats = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const NM = ['甲', '乙', '丙', '丁', '戊', '己'];
    const CL = ['f1s s1', 'f2s s2', 'f3s s3', 'f1s s1', 'f2s s2', 'f3s s3'];
    const gS = S('g', {}, svg), gP = S('g', {}, svg);
    T(svg, W / 2, 244, '等着入座的人', 'ts tm');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 4, k = 3, filled = 0, run = 0, busy = false, people = [], chT = [], mulT = [], choices = [];
    const SY = 62, HY = 196;
    const seatX = (i) => W / 2 + (i - (k - 1) / 2) * Math.min(76, 420 / k);
    const homeX = (i) => W / 2 + (i - (n - 1) / 2) * 64;
    const place = (p) => p.g.setAttribute('transform', `translate(${p.x},${p.y})`);
    function build() {
      run++; busy = false; filled = 0; choices = [];
      gS.innerHTML = ''; gP.innerHTML = ''; people = []; chT = []; mulT = [];
      for (let i = 0; i < k; i++) {
        const x = seatX(i);
        T(gS, x, SY - 34, `${i + 1} 号座`, 'ts tm');
        S('rect', { x: x - 26, y: SY - 26, width: 52, height: 52, rx: 9, class: 'fsurf2 sline' }, gS);
        chT.push(T(gS, x, SY + 48, '', 'tb t2'));
        mulT.push(i > 0 ? T(gS, x - Math.min(76, 420 / k) / 2, SY + 48, '', 'tb') : null);
      }
      for (let i = 0; i < n; i++) {
        const g = S('g', {}, gP);
        S('circle', { r: 21, class: CL[i] }, g);
        T(g, 0, 6, NM[i], 'tb tl');
        const p = { g, x: homeX(i), y: HY, seat: -1, i };
        place(p);
        people.push(p);
      }
      read.innerHTML = `${n} 个人坐 ${k} 个座位，每个座位坐 1 人。点“坐下一个座位”，看看每个座位有几种选择。`;
    }
    function step() {
      if (busy) return;
      if (filled >= k) { read.innerHTML += '<br>座位都坐满了，点“重来”再试一次。'; return; }
      busy = true;
      const my = run;
      const rem = people.filter((p) => p.seat < 0);
      const r = rem.length;
      chT[filled].textContent = `${r} 种`;
      if (mulT[filled]) mulT[filled].textContent = '×';
      rem.forEach((p) => flash(p.g, 700, 1));
      read.innerHTML = `第 ${filled + 1} 个座位：还没坐下的有 <b>${r}</b> 人，谁都可以坐，所以有 <b>${r}</b> 种选择。`;
      later(750, () => {
        if (my !== run) return;
        const p = rem[Math.floor(Math.random() * r)];
        const fx = p.x, fy = p.y, tx = seatX(filled), ty = SY;
        p.seat = filled;
        tween(650, (t) => { p.x = lerp(fx, tx, t); p.y = lerp(fy, ty, t) - 40 * Math.sin(t * PI); place(p); }, () => {
          if (my !== run) return;
          p.x = tx; p.y = ty; place(p);
          choices.push(r);
          filled++;
          busy = false;
          const pr = prodOf(choices);
          if (filled < k) read.innerHTML = `第 ${filled} 个座位坐了 ${NM[p.i]}。到现在：${choices.join(' × ')} = <b>${pr}</b> 种坐法。点“坐下一个座位”继续。`;
          else read.innerHTML = `${k} 个座位都坐满了！每个座位的选择数相乘：<b>${choices.join(' × ')} = ${pr}</b> 种坐法。（图上只是其中一种。）<br>每坐下一个人，剩下可选的人就少 1 个，所以乘数一个比一个少 1。`;
        });
      });
    }
    btn(c, '坐下一个座位', step);
    btn(c, '重来', build, 'alt');
    slider(c, 'o8pn', '人数', 2, 6, 1, n, (v) => { n = v; if (k > n) { k = n; kS.set(k); } build(); });
    const kS = slider(c, 'o8pk', '座位', 1, 6, 1, k, (v) => { k = Math.min(v, n); if (v > n) kS.set(k); build(); });
    build();
  };

  // ───────── 排列：树状图 ─────────
  A.o_perm_tree = function (el) {
    const W = 440;
    const svg = stage(el, W, 300);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const NM = ['甲', '乙', '丙', '丁'];
    let n = 3, k = 3, shown = 0, ban = false, items = [], levels = [], run = 0;
    function seqs(len) {
      const out = [];
      (function rec(cur) {
        if (cur.length === len) { out.push(cur.slice()); return; }
        for (let i = 0; i < n; i++) if (!cur.includes(i)) { cur.push(i); rec(cur); cur.pop(); }
      })([]);
      return out;
    }
    function build() {
      run++;
      g.innerHTML = '';
      shown = 0; items = [];
      const leaves = seqs(k);
      const L = leaves.length;
      const sp = Math.min(32, 360 / L);
      const Hh = Math.round(46 + L * sp + 8);
      svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
      const xs = k === 3 ? [80, 170, 260] : [100, 220];
      const wordX = k === 3 ? 300 : 260;
      const small = sp < 20 ? ' ts' : '';
      const yLeaf = (i) => 40 + i * sp + sp / 2;
      // 每个前缀对应的 y：它下面叶子的平均
      const yOf = (pre) => {
        const idx = leaves.map((s, i) => [s, i]).filter(([s]) => pre.every((v, j) => s[j] === v)).map(([, i]) => yLeaf(i));
        return (idx[0] + idx[idx.length - 1]) / 2;
      };
      const rootY = yOf([]);
      S('circle', { cx: 24, cy: rootY, r: 6, class: 'fstrong' }, g);
      levels = [];
      for (let l = 1; l <= k; l++) {
        const lg = S('g', { opacity: 0 }, g);
        levels.push(lg);
        T(g, xs[l - 1], 22, `第 ${l} 位`, 'ts tm');
        seqs(l).forEach((pre) => {
          const y = yOf(pre), py = l === 1 ? rootY : yOf(pre.slice(0, -1));
          const px = l === 1 ? 30 : xs[l - 2] + 10;
          const ln = S('line', { x1: px, y1: py, x2: xs[l - 1] - 10, y2: y, class: 'smuted thin' }, lg);
          const tx = T(lg, xs[l - 1], y + 5, NM[pre[l - 1]], 'tb' + small);
          items.push({ elms: [ln, tx], bad: pre[0] === 0 });
        });
      }
      const wg = S('g', { opacity: 0 }, g);
      levels.push(wg);
      T(g, wordX + 20, 22, '排法', 'ts tm');
      leaves.forEach((s, i) => {
        const tx = T(wg, wordX, yLeaf(i) + 5, s.map((v) => NM[v]).join(''), 'tb t1' + small, 'start');
        items.push({ elms: [tx], bad: s[0] === 0 });
      });
      levels.forEach((lv) => lv.setAttribute('opacity', 1));
      shown = k;
      applyBan();
      read.innerHTML = `这是从 ${n} 个人里选 ${k} 个排成一排的树状图，最右边每一行是一种排法，一共 ${prodList(n, k).join(' × ')} = <b>${prodOf(prodList(n, k))}</b> 种。点“一层一层画”，看看这个乘法是怎么来的。`;
    }
    function applyBan() {
      items.forEach((it) => it.elms.forEach((e) => e.setAttribute('opacity', ban && it.bad ? 0.18 : 1)));
    }
    function total() { return ban ? (n - 1) * prodOf(prodList(n - 1, k - 1)) : prodOf(prodList(n, k)); }
    function factors() { return ban ? [n - 1].concat(prodList(n - 1, k - 1)) : prodList(n, k); }
    function stepLayer() {
      if (shown >= k) { levels.forEach((lv) => lv.setAttribute('opacity', 0)); shown = 0; }
      const lg = levels[shown];
      tween(450, (t) => lg.setAttribute('opacity', t));
      shown++;
      const f = factors().slice(0, shown);
      if (shown === 1) read.innerHTML = ban ? `第 1 位：甲不能站，只有 <b>${n - 1}</b> 种（灰色的“甲”那一枝要去掉）。<b>有特殊要求的位置先排</b>。` : `第 1 位：${n} 个人谁都可以站，画出 <b>${n}</b> 个分支。`;
      else read.innerHTML = `第 ${shown} 位：前面已经用掉 ${shown - 1} 人，每个分支下面还剩 <b>${f[shown - 1]}</b> 种。现在一共 ${f.join(' × ')} = <b>${prodOf(f)}</b> 个分支。`;
      if (shown === k) {
        const wg = levels[k];
        tween(450, (t) => wg.setAttribute('opacity', t));
        read.innerHTML += `<br>最右边每一行就是一种排法，一共 <b>${f.join(' × ')} = ${total()}</b> 种。`;
      }
    }
    btn(c, '一层一层画', stepLayer);
    const banB = btn(c, '加条件：甲不能排第 1 位', () => {
      ban = !ban;
      banB.textContent = ban ? '去掉条件' : '加条件：甲不能排第 1 位';
      applyBan();
      read.innerHTML = ban ? `加上“甲不能排第 1 位”：所有以甲开头的分支变灰。第 1 位只剩 ${n - 1} 种，后面每位照常。一共 ${factors().join(' × ')} = <b>${total()}</b> 种。` : `去掉条件，一共 ${prodList(n, k).join(' × ')} = <b>${prodOf(prodList(n, k))}</b> 种。`;
    }, 'alt');
    btn(c, '重画', build, 'alt');
    slider(c, 'o8tn', '人数', 3, 4, 1, n, (v) => { n = v; build(); });
    slider(c, 'o8tk', '排几位', 2, 3, 1, k, (v) => { k = v; build(); });
    build();
  };

  // ───────── 组合：握手 ─────────
  A.o_comb_handshake = function (el) {
    const W = 400, Hh = 330;
    const svg = stage(el, W, Hh);
    const gL = S('g', {}, svg), gP = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 5, run = 0, lines = [], ppl = [], cnts = [];
    const pos = (i, r) => [200 + (r || 120) * Math.sin((2 * PI * i) / n), 165 - (r || 120) * Math.cos((2 * PI * i) / n)];
    const CLS = ['s1', 's2', 's3'];
    function build() {
      run++;
      gL.innerHTML = ''; gP.innerHTML = '';
      lines = []; ppl = []; cnts = [];
      for (let i = 0; i < n; i++) {
        const [x, y] = pos(i);
        const g = S('g', {}, gP);
        S('circle', { cx: x, cy: y, r: 17, class: 'fsurf sstrong' }, g);
        T(g, x, y + 5, String(i + 1), 'tb');
        ppl.push(g);
        const [cx, cy] = pos(i, 152);
        cnts.push(T(gP, cx, cy + 5, '', 'ts tb t2'));
      }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const [x1, y1] = pos(i), [x2, y2] = pos(j);
        const p = S('path', { d: `M${x1},${y1} L${x2},${y2}`, class: 'fnone ' + CLS[i % 3], pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, gL);
        lines.push({ p, i, j });
        p.setAttribute('stroke-dashoffset', 0);
        p.setAttribute('class', 'fnone sline');
      }
      read.innerHTML = `${n} 个人，每两个人握一次手，每条线代表一次握手。一共握几次？用两种方法数一数。`;
    }
    function clear() {
      lines.forEach((l) => { l.p.setAttribute('stroke-dashoffset', 1); l.p.setAttribute('class', 'fnone ' + CLS[l.i % 3]); });
      cnts.forEach((t) => (t.textContent = ''));
    }
    function inOrder() {
      const my = ++run;
      clear();
      const terms = [];
      let li = 0;
      (function step() {
        if (my !== run) return;
        if (li >= lines.length) {
          const tot = (n * (n - 1)) / 2;
          read.innerHTML = `一共 ${terms.join(' + ')} = <b>${tot}</b> 次。前面的人已经和后面的人握过，后面的人就不再重复握。`;
          return;
        }
        const l = lines[li];
        tween(220, (t) => l.p.setAttribute('stroke-dashoffset', 1 - t));
        const isLast = li + 1 >= lines.length || lines[li + 1].i !== l.i;
        if (isLast) {
          terms.push(n - 1 - l.i);
          cnts[l.i].textContent = `新握 ${n - 1 - l.i}`;
          read.innerHTML = `${l.i + 1} 号和排在后面的人握手：<b>${n - 1 - l.i}</b> 次。<br>累计：${terms.join(' + ')} = ${terms.reduce((a, b) => a + b, 0)}`;
        }
        li++;
        later(isLast ? 600 : 260, step);
      })();
    }
    function eachCount() {
      const my = ++run;
      clear();
      lines.forEach((l) => { l.p.setAttribute('stroke-dashoffset', 0); l.p.setAttribute('class', 'fnone sline'); });
      let i = 0;
      (function step() {
        if (my !== run) return;
        if (i < n) {
          cnts[i].textContent = `握 ${n - 1} 次`;
          read.innerHTML = `每个人都要和另外 ${n - 1} 人握手。已数 ${i + 1} 人：${i + 1} × ${n - 1} = ${(i + 1) * (n - 1)} 次。`;
          i++;
          later(350, step);
          return;
        }
        if (n < 2) return;
        const l = lines[0];
        l.p.setAttribute('class', 'fnone s2 thick');
        flash(ppl[0], 1200, 1); flash(ppl[1], 1200, 1);
        read.innerHTML = `${n} 人加起来是 ${n} × ${n - 1} = ${n * (n - 1)} 次。可是看这条线：1 号和 2 号握的这<b>一次</b>手，1 号数了一次，2 号也数了一次——<b>每次握手都被数了 2 次</b>！<br>所以要除以 2：${n} × ${n - 1} ÷ 2 = <b>${(n * (n - 1)) / 2}</b> 次。`;
      })();
    }
    btn(c, '按顺序握手', inOrder);
    btn(c, '每人数一数', eachCount);
    slider(c, 'o8hn', '人数', 2, 9, 1, n, (v) => { n = v; build(); });
    build();
  };

  // ───────── 组合：排列数 ÷ 重复次数 ─────────
  A.o_comb_group = function (el) {
    const W = 440;
    const svg = stage(el, W, 240);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const NM = ['甲', '乙', '丙', '丁', '戊'];
    const GC = ['f1s s1', 'f2s s2', 'f3s s3'];
    let n = 4, k = 2, grouped = false, busy = false, chips = [], heads = [], C = 0, P = 0, run = 0;
    const kf = () => (k === 2 ? 2 : 6);
    const kfTxt = () => (k === 2 ? '2 × 1 = 2' : '3 × 2 × 1 = 6');
    function build() {
      run++; busy = false; grouped = false;
      g.innerHTML = ''; chips = []; heads = [];
      const perms = [];
      (function rec(cur) {
        if (cur.length === k) { perms.push(cur.slice()); return; }
        for (let i = 0; i < n; i++) if (!cur.includes(i)) { cur.push(i); rec(cur); cur.pop(); }
      })([]);
      const keys = [];
      perms.forEach((p) => { const key = p.slice().sort().join(''); if (!keys.includes(key)) keys.push(key); });
      keys.sort();
      P = perms.length; C = keys.length;
      const per = 10, rowsA = Math.ceil(P / per), rowsB = kf();
      const cw = 42, rh = 28;
      const xA0 = (W - Math.min(per, P) * cw) / 2 + cw / 2;
      const xB0 = (W - C * cw) / 2 + cw / 2;
      const Hh = 64 + Math.max(rowsA, rowsB) * rh;
      svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
      const seen = {};
      keys.forEach((key, gi) => {
        const t = T(g, xB0 + gi * cw, 36, key.split('').map((v) => NM[+v]).join(''), 'ts tb t2');
        t.setAttribute('opacity', 0);
        heads.push(t);
      });
      perms.forEach((p, idx) => {
        const key = p.slice().sort().join('');
        const gi = keys.indexOf(key);
        seen[key] = (seen[key] || 0) + 1;
        const ri = seen[key] - 1;
        const ax = xA0 + (idx % per) * cw, ay = 60 + Math.floor(idx / per) * rh;
        const bx = xB0 + gi * cw, by = 60 + ri * rh;
        const cg = S('g', {}, g);
        const r = S('rect', { x: -19, y: -11, width: 38, height: 22, rx: 5, class: 'fsurf sline' }, cg);
        T(cg, 0, 4, p.map((v) => NM[v]).join(''), 'ts tb');
        const ch = { cg, r, ax, ay, bx, by, gi };
        cg.setAttribute('transform', `translate(${ax},${ay})`);
        chips.push(ch);
      });
      gb.textContent = '把成员相同的归成一组';
      read.innerHTML = `从 ${n} 人里选 ${k} 人<b>排成一排</b>（讲顺序）：${prodList(n, k).join(' × ')} = <b>${P}</b> 种，每个小方块是一种排法。`;
    }
    function toggle() {
      if (busy) return;
      busy = true;
      const my = run;
      const to = !grouped;
      chips.forEach((ch) => ch.r.setAttribute('class', to ? GC[ch.gi % 3] : 'fsurf sline'));
      tween(1100, (t) => {
        chips.forEach((ch) => {
          const u = to ? t : 1 - t;
          ch.cg.setAttribute('transform', `translate(${lerp(ch.ax, ch.bx, u)},${lerp(ch.ay, ch.by, u)})`);
        });
        heads.forEach((h) => h.setAttribute('opacity', to ? t : 1 - t));
      }, () => {
        if (my !== run) return;
        busy = false; grouped = to;
        gb.textContent = grouped ? '拆开，按顺序排' : '把成员相同的归成一组';
        if (grouped) read.innerHTML = `成员一样的放进同一列：每列 ${kf()} 个，只是顺序不同（${k} 个人排一排有 ${kfTxt()} 种）。如果<b>只选人、不排顺序</b>，同一列只算 1 种。<br>所以 ${P} ÷ ${kf()} = <b>${C}</b> 种选法。`;
        else read.innerHTML = `从 ${n} 人里选 ${k} 人<b>排成一排</b>（讲顺序）：${prodList(n, k).join(' × ')} = <b>${P}</b> 种。`;
      });
    }
    const gb = btn(c, '把成员相同的归成一组', toggle);
    slider(c, 'o8gn', '人数', 3, 5, 1, n, (v) => { n = v; build(); });
    slider(c, 'o8gk', '选几人', 2, 3, 1, k, (v) => { k = v; build(); });
    build();
  };

  // ───────── 枚举与标数法：方格路线 ─────────
  A.o_enum_grid = function (el) {
    const W = 440, Hh = 290;
    const svg = stage(el, W, Hh);
    const gG = S('g', {}, svg), gH = S('g', {}, svg), gN = S('g', {}, svg), gP = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let w = 4, h = 3, block = new Set(), run = 0, busy = false, nums = {};
    let u, x0, y0;
    const X = (i) => x0 + i * u, Y = (j) => y0 - j * u;
    const key = (i, j) => i + ',' + j;
    function values() {
      const v = {};
      for (let j = 0; j <= h; j++) for (let i = 0; i <= w; i++) {
        if (block.has(key(i, j))) v[key(i, j)] = 0;
        else if (i === 0 && j === 0) v[key(i, j)] = 1;
        else v[key(i, j)] = (i > 0 ? v[key(i - 1, j)] : 0) + (j > 0 ? v[key(i, j - 1)] : 0);
      }
      return v;
    }
    function build() {
      run++; busy = false;
      gG.innerHTML = ''; gH.innerHTML = ''; gN.innerHTML = ''; gP.innerHTML = ''; nums = {};
      u = Math.min(330 / w, 210 / h, 64);
      x0 = (W - w * u) / 2; y0 = 255;
      for (let j = 0; j <= h; j++) S('line', { x1: X(0), x2: X(w), y1: Y(j), y2: Y(j), class: 'sstrong thin' }, gG);
      for (let i = 0; i <= w; i++) S('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(h), class: 'sstrong thin' }, gG);
      T(gG, X(0) - 14, Y(0) + 20, 'A', 'tb tl');
      T(gG, X(w) + 14, Y(h) - 8, 'B', 'tb tl');
      for (let j = 0; j <= h; j++) for (let i = 0; i <= w; i++) {
        const kk = key(i, j);
        const isEnd = (i === 0 && j === 0) || (i === w && j === h);
        if (block.has(kk)) {
          const d = 7;
          S('path', { d: `M${X(i) - d},${Y(j) - d} L${X(i) + d},${Y(j) + d} M${X(i) + d},${Y(j) - d} L${X(i) - d},${Y(j) + d}`, class: 's2 thick round' }, gP);
        } else S('circle', { cx: X(i), cy: Y(j), r: isEnd ? 7 : 4.5, class: isEnd ? 'f2' : 'fstrong' }, gP);
        nums[kk] = T(gN, X(i) + 6, Y(j) - 7, '', 'tb t1', 'start');
        if (!isEnd) {
          const hit = S('circle', { cx: X(i), cy: Y(j), r: 13, class: 'f2 clickable', style: 'fill-opacity: 0' }, gP);
          hit.addEventListener('click', () => {
            if (busy) return;
            if (block.has(kk)) block.delete(kk); else block.add(kk);
            build();
            read.innerHTML = `${block.has(kk) ? '设了' : '取消了'}一个障碍点（✕ 表示这个点不能走）。点“逐点标数”重新算。`;
          });
        }
      }
      read.innerHTML = `从 A 走到 B，每次只能<b>向右</b>或<b>向上</b>走一格（最短路线）。一共有几条？点“逐点标数”。也可以点格点设置障碍。`;
    }
    function fill(fast) {
      if (busy) return;
      const my = ++run;
      const v = values();
      Object.values(nums).forEach((t) => (t.textContent = ''));
      gH.innerHTML = '';
      const order = [];
      for (let j = 0; j <= h; j++) for (let i = 0; i <= w; i++) order.push([i, j]);
      if (fast) {
        order.forEach(([i, j]) => (nums[key(i, j)].textContent = v[key(i, j)]));
        done(v);
        return;
      }
      busy = true;
      let s = 0;
      (function step() {
        if (my !== run) return;
        gH.innerHTML = '';
        if (s >= order.length) { busy = false; done(v); return; }
        const [i, j] = order[s];
        const kk = key(i, j);
        S('circle', { cx: X(i), cy: Y(j), r: 11, class: 'fnone s2' }, gH);
        let msg;
        if (block.has(kk)) msg = '这是障碍点，走不到这里，标 <b>0</b>。';
        else if (i === 0 && j === 0) msg = '起点 A 标 <b>1</b>。';
        else {
          const parts = [];
          if (i > 0) { S('line', { x1: X(i - 1), y1: Y(j), x2: X(i), y2: Y(j), class: 's2 thick round' }, gH); parts.push(`左边 ${v[key(i - 1, j)]}`); }
          if (j > 0) { S('line', { x1: X(i), y1: Y(j - 1), x2: X(i), y2: Y(j), class: 's3 thick round' }, gH); parts.push(`下边 ${v[key(i, j - 1)]}`); }
          msg = parts.length === 1 ? `这一行（列）只能从${parts[0].slice(0, 2)}一个方向走来：标 <b>${v[kk]}</b>。` : `走到这个点，最后一步要么从左边来、要么从下边来：${parts.join(' + ')} = <b>${v[kk]}</b>。`;
        }
        nums[kk].textContent = v[kk];
        read.innerHTML = msg;
        s++;
        later(420, step);
      })();
    }
    function done(v) {
      gH.innerHTML = '';
      S('circle', { cx: X(w), cy: Y(h), r: 12, class: 'fnone s2 thick' }, gH);
      read.innerHTML = `标完了！终点 B 上的数就是答案：从 A 到 B 一共 <b>${v[key(w, h)]}</b> 条最短路线。${block.size ? '（障碍点标 0，经过它的路线都不算。）' : ''}`;
    }
    btn(c, '逐点标数', () => fill(false));
    btn(c, '一下填完', () => { busy = false; run++; fill(true); }, 'alt');
    btn(c, '清除障碍', () => { block.clear(); build(); }, 'alt');
    slider(c, 'o8gw', '横格', 1, 6, 1, w, (val) => { w = val; block.clear(); build(); });
    slider(c, 'o8gh', '竖格', 1, 5, 1, h, (val) => { h = val; block.clear(); build(); });
    H('p', { class: 'anim-tip' }, el, '提示：点格点（起点、终点除外）可以设置或取消障碍。');
    build();
  };

  // ───────── 枚举：有序列举凑钱 ─────────
  A.o_enum_coins = function (el) {
    const W = 440;
    const svg = stage(el, W, 200);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let amt = 8, run = 0;
    const COIN = { 5: 'f2s s2', 2: 'f1s s1', 1: 'f3s s3' };
    function rows() {
      const out = [];
      for (let f = Math.floor(amt / 5); f >= 0; f--) {
        const r1 = amt - 5 * f;
        for (let t = Math.floor(r1 / 2); t >= 0; t--) out.push([f, t, r1 - 2 * t]);
      }
      return out;
    }
    function groupsOf(rs) {
      const gs = [];
      rs.forEach((r) => { const last = gs[gs.length - 1]; if (last && last.f === r[0]) last.n++; else gs.push({ f: r[0], n: 1 }); });
      return gs;
    }
    function draw(animate) {
      const my = ++run;
      g.innerHTML = '';
      const rs = rows(), gs = groupsOf(rs);
      const rh = 24;
      svg.setAttribute('viewBox', `0 0 ${W} ${40 + rs.length * rh + 8}`);
      T(g, 12, 22, `凑出 ${amt} 元（5 元、2 元、1 元硬币都足够多）`, 'ts tm', 'start');
      const rowG = [], grpLabel = [];
      let lastF = null, gi = -1;
      rs.forEach((r, idx) => {
        const y = 44 + idx * rh;
        const rg = S('g', { opacity: animate ? 0 : 1 }, g);
        if (r[0] !== lastF) {
          gi++;
          lastF = r[0];
          if (idx > 0) S('line', { x1: 10, x2: W - 10, y1: y - 12, y2: y - 12, class: 'sline dash' }, rg);
        }
        T(rg, 24, y + 5, String(idx + 1), 'ts tm');
        let x = 50;
        [[5, r[0]], [2, r[1]], [1, r[2]]].forEach(([val, cnt]) => {
          for (let q = 0; q < cnt; q++) {
            S('circle', { cx: x, cy: y, r: 10, class: COIN[val] }, rg);
            T(rg, x, y + 4, String(val), 'ts tb');
            x += 22;
          }
        });
        rowG.push(rg);
        if (idx === rs.length - 1 || rs[idx + 1][0] !== r[0]) {
          const lb = T(g, W - 10, y + 5, `5元用${r[0]}枚：${gs[gi].n}种`, 'ts tb t2', 'end');
          lb.setAttribute('opacity', animate ? 0 : 1);
          grpLabel.push([idx, lb]);
        }
      });
      const summary = `按“<b>5 元从多到少</b>，同样多时 <b>2 元从多到少</b>，剩下补 1 元”的顺序列，不重复、不遗漏：${gs.map((q) => q.n).join(' + ')} = <b>${rs.length}</b> 种。`;
      if (!animate) { read.innerHTML = summary; return; }
      let i = 0;
      (function step() {
        if (my !== run) return;
        if (i >= rs.length) { read.innerHTML = summary; return; }
        const rg = rowG[i];
        tween(250, (t) => rg.setAttribute('opacity', t));
        const r = rs[i];
        read.innerHTML = `第 ${i + 1} 种：5 元 ${r[0]} 枚，2 元 ${r[1]} 枚，1 元 ${r[2]} 枚（${r[0] ? 5 * r[0] + ' + ' : ''}${r[1] ? 2 * r[1] + ' + ' : ''}${r[2]} = ${amt}）。`;
        grpLabel.forEach(([gi2, lb]) => { if (gi2 === i) tween(250, (t) => lb.setAttribute('opacity', t)); });
        i++;
        later(520, step);
      })();
    }
    btn(c, '按顺序一种一种列', () => draw(true));
    slider(c, 'o8ca', '钱数', 3, 12, 1, amt, (v) => { amt = v; draw(false); });
    draw(false);
  };

  // ───────── 构造与染色：骨牌覆盖棋盘 ─────────
  A.o_construct_domino = function (el) {
    const W = 400, Hh = 300;
    const svg = stage(el, W, Hh);
    const gB = S('g', {}, svg), gD = S('g', {}, svg), gS = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let N = 8, mode = 0, colorOn = true, sel = null, doms = [], busy = false, run = 0, cells = {};
    let cs, x0, y0;
    const key = (r, cc) => r * N + cc;
    const removed = () => (mode === 0 ? [key(0, 0), key(N - 1, N - 1)] : [key(0, 0), key(0, N - 1)]);
    const isBlack = (r, cc) => (r + cc) % 2 === 0;
    const occ = () => { const o = {}; doms.forEach((d, i) => { o[d[0]] = i; o[d[1]] = i; }); return o; };
    function build() {
      run++; busy = false; sel = null; doms = [];
      cs = 280 / N; x0 = (W - 280) / 2; y0 = 10;
      drawBoard(); drawDoms(); info();
    }
    function drawBoard() {
      gB.innerHTML = ''; cells = {};
      const rem = removed();
      for (let r = 0; r < N; r++) for (let cc = 0; cc < N; cc++) {
        const x = x0 + cc * cs, y = y0 + r * cs, k = key(r, cc);
        if (rem.includes(k)) {
          S('rect', { x: x + 2, y: y + 2, width: cs - 4, height: cs - 4, class: 'fnone smuted dash' }, gB);
          T(gB, x + cs / 2, y + cs / 2 + 5, '✕', 'tm');
          continue;
        }
        const cls = colorOn ? (isBlack(r, cc) ? 'fmuted' : 'fsurf') : 'fsurf2';
        const rc = S('rect', { x, y, width: cs, height: cs, class: cls + ' sline clickable' }, gB);
        cells[k] = rc;
        rc.addEventListener('click', () => clickCell(r, cc));
      }
      S('rect', { x: x0, y: y0, width: 280, height: 280, class: 'fnone sstrong' }, gB);
    }
    function domRect(d) {
      const r1 = Math.floor(d[0] / N), c1 = d[0] % N, r2 = Math.floor(d[1] / N), c2 = d[1] % N;
      return { x: x0 + Math.min(c1, c2) * cs + 3, y: y0 + Math.min(r1, r2) * cs + 3, width: (Math.abs(c1 - c2) + 1) * cs - 6, height: (Math.abs(r1 - r2) + 1) * cs - 6 };
    }
    function drawDoms() {
      gD.innerHTML = ''; gS.innerHTML = '';
      doms.forEach((d, i) => {
        const rr = S('rect', Object.assign(domRect(d), { rx: 5, class: 'f3 s3 clickable', style: 'fill-opacity: .4' }), gD);
        rr.addEventListener('click', () => { if (busy) return; doms.splice(i, 1); drawDoms(); info(); });
      });
      if (sel) S('rect', { x: x0 + sel[1] * cs + 2, y: y0 + sel[0] * cs + 2, width: cs - 4, height: cs - 4, class: 'fnone s2 thick' }, gS);
    }
    function clickCell(r, cc) {
      if (busy) return;
      const k = key(r, cc), o = occ();
      if (o[k] != null) { doms.splice(o[k], 1); sel = null; drawDoms(); info(); return; }
      if (sel && Math.abs(sel[0] - r) + Math.abs(sel[1] - cc) === 1) {
        doms.push([key(sel[0], sel[1]), k]);
        sel = null;
      } else sel = [r, cc];
      drawDoms(); info();
    }
    function counts() {
      const rem = removed(), o = occ();
      let b = 0, w = 0, ub = 0, uw = 0;
      for (let r = 0; r < N; r++) for (let cc = 0; cc < N; cc++) {
        const k = key(r, cc);
        if (rem.includes(k)) continue;
        if (isBlack(r, cc)) { b++; if (o[k] == null) ub++; } else { w++; if (o[k] == null) uw++; }
      }
      return { b, w, ub, uw };
    }
    function info(extra) {
      const { b, w, ub, uw } = counts();
      const left = ub + uw;
      let s = `${N}×${N} 棋盘去掉${mode === 0 ? '<b>对角</b>' : '<b>同一边</b>'}两个角，剩 ${b + w} 格。已放 ${doms.length} 块骨牌，还空 ${left} 格。`;
      if (colorOn) {
        s += `<br><span class="k1">黑格 ${b} 个</span>、白格 ${w} 个；每块骨牌盖住的两格是相邻的，一定<b>一黑一白</b>。还空着：黑 ${ub}、白 ${uw}。`;
        if (b !== w) s += `<br>黑白格数不相等，而骨牌总是一黑一白地盖，所以<b>无论怎么摆都盖不满</b>。`;
        else if (left === 0) s += `<br><b>全盖满了！</b>摆出了一种方法，就说明“能做到”——这就是构造。`;
        else s += `<br>黑白一样多，有希望盖满。试着摆一摆，或者点“自动摆”。`;
      } else s += left === 0 ? '<br><b>全盖满了！</b>' : '<br>点“染色”看看黑白格各有几个。';
      if (extra) s = extra + '<br>' + s;
      read.innerHTML = s;
    }
    function auto() {
      if (busy) return;
      const my = ++run;
      doms = []; sel = null; drawDoms();
      const rem = removed(), used = new Set(rem), plan = [];
      for (let r = 0; r < N; r++) {
        let cc = 0;
        while (cc < N) {
          if (!used.has(key(r, cc)) && cc + 1 < N && !used.has(key(r, cc + 1))) { plan.push([key(r, cc), key(r, cc + 1)]); used.add(key(r, cc)); used.add(key(r, cc + 1)); cc += 2; }
          else cc++;
        }
      }
      busy = true;
      let i = 0;
      (function step() {
        if (my !== run) return;
        if (i < plan.length) { doms.push(plan[i]); i++; drawDoms(); info(); later(90, step); return; }
        busy = false;
        const o = occ(), leftK = [];
        for (let k = 0; k < N * N; k++) if (!rem.includes(k) && o[k] == null) leftK.push(k);
        if (leftK.length) {
          leftK.forEach((k) => { if (cells[k]) flash(cells[k], 1600, 1); });
          const same = leftK.length === 2 && isBlack(Math.floor(leftK[0] / N), leftK[0] % N) === isBlack(Math.floor(leftK[1] / N), leftK[1] % N);
          info(`一行一行横着摆，最后剩下 ${leftK.length} 格${same ? '，它们<b>颜色相同</b>，不相邻，永远凑不成一块骨牌' : ''}。换别的摆法也一样，因为黑白格数不相等。`);
        } else info('按行横着摆，全部盖满。');
      })();
    }
    const mB = btn(c, '改成：去掉同一边两角', () => {
      mode = 1 - mode;
      mB.textContent = mode === 0 ? '改成：去掉同一边两角' : '改成：去掉对角两格';
      build();
    });
    const cB = btn(c, '染色：开', () => { colorOn = !colorOn; cB.textContent = colorOn ? '染色：开' : '染色：关'; drawBoard(); drawDoms(); info(); }, 'alt');
    btn(c, '自动摆', auto, 'alt');
    btn(c, '清空', build, 'alt');
    slider(c, 'o8dn', '边长', 4, 8, 2, N, (v) => { N = v; build(); });
    H('p', { class: 'anim-tip' }, el, '提示：先点一格，再点它旁边的一格，就放下一块骨牌；点骨牌可以拿掉。');
    build();
  };

  // ───────── 构造与染色：翻杯子（奇偶） ─────────
  A.o_construct_cups = function (el) {
    const W = 440, Hh = 190;
    const svg = stage(el, W, Hh);
    const head = T(svg, W / 2, 24, '', 'tb');
    const gC = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 7, k = 4, cups = [], sel = new Set(), moves = 0, busy = false, run = 0;
    const CY = 95;
    const cx = (i) => W / 2 + (i - (n - 1) / 2) * 46;
    function build() {
      run++; busy = false; moves = 0; sel = new Set();
      gC.innerHTML = ''; cups = [];
      for (let i = 0; i < n; i++) {
        const g = S('g', { transform: `translate(${cx(i)},${CY})`, class: 'clickable' }, gC);
        const mark = S('rect', { x: -21, y: -34, width: 42, height: 68, rx: 6, class: 'fnone s3 dash', opacity: 0 }, g);
        const inner = S('g', {}, g);
        const body = S('path', { d: 'M-15,-20 L15,-20 L10,20 L-10,20 Z', class: 'f1s s1' }, inner);
        const mouth = S('ellipse', { cx: 0, cy: -20, rx: 15, ry: 4, class: 'fsurf s1' }, inner);
        const lab = T(g, 0, 52, '朝上', 'ts tm');
        S('rect', { x: -21, y: -34, width: 42, height: 96, style: 'fill-opacity: 0', class: 'f1' }, g);
        const cup = { g, inner, body, mouth, lab, mark, rot: 0 };
        g.addEventListener('click', () => toggleSel(i));
        cups.push(cup);
      }
      paint();
      read.innerHTML = `${n} 个杯子口都朝上。每次<b>必须正好翻 ${k} 个</b>，能不能让所有杯子口都朝下？点杯子选 ${k} 个，再点“翻！”。`;
    }
    const isUp = (cp) => (((cp.rot % 360) + 360) % 360) === 0;
    function paint() {
      cups.forEach((cp, i) => {
        const up = isUp(cp);
        cp.body.setAttribute('class', up ? 'f1s s1' : 'f2s s2');
        cp.mouth.setAttribute('class', up ? 'fsurf s1' : 'fsurf s2');
        cp.lab.textContent = up ? '朝上' : '朝下';
        cp.mark.setAttribute('opacity', sel.has(i) ? 1 : 0);
      });
      const down = cups.filter((cp) => !isUp(cp)).length;
      head.textContent = `已翻 ${moves} 次　朝下 ${down} 个　已选 ${sel.size}/${k}`;
    }
    function toggleSel(i) {
      if (busy) return;
      if (sel.has(i)) sel.delete(i);
      else if (sel.size < k) sel.add(i);
      paint();
    }
    function flip(done) {
      if (sel.size !== k) { read.innerHTML = `要正好选 ${k} 个杯子才能翻（现在选了 ${sel.size} 个）。`; return; }
      busy = true;
      const my = run;
      const list = [...sel];
      const from = list.map((i) => cups[i].rot);
      tween(600, (t) => list.forEach((i, q) => cups[i].inner.setAttribute('transform', `rotate(${from[q] + 180 * t})`)), () => {
        if (my !== run) return;
        list.forEach((i, q) => { cups[i].rot = from[q] + 180; });
        moves++; sel = new Set(); busy = false;
        paint();
        const allDown = cups.every((cp) => !isUp(cp));
        if (allDown) read.innerHTML = `成功！翻了 ${moves} 次，全部口朝下。`;
        else if (!done) read.innerHTML = `翻了 ${moves} 次。继续选 ${k} 个再翻。`;
        if (done) done();
      });
    }
    function parityText() {
      let s = `想一想：每个杯子要从朝上变成朝下，必须被翻<b>奇数次</b>。${n} 个奇数加起来是<b>${n % 2 ? '奇数' : '偶数'}</b>；每次翻 ${k} 个，翻杯子的总次数是 ${k} 的倍数，`;
      if (k % 2 === 0) s += `<b>一定是偶数</b>。`;
      else s += `次数为${n % 2 ? '奇' : '偶'}数时是${n % 2 ? '奇' : '偶'}数。`;
      if (k % 2 === 0 && n % 2 === 1) s += `<br>奇数不可能等于偶数，所以<b>永远做不到</b>！`;
      else s += `<br>奇偶没有矛盾，可以试着<b>构造</b>出翻法。`;
      return s;
    }
    function solve() {
      if (busy) return;
      const full = (1 << n) - 1;
      let start = 0;
      cups.forEach((cp, i) => { if (isUp(cp)) start |= 1 << i; });
      const ms = [];
      for (let m = 0; m <= full; m++) { let b = 0, x = m; while (x) { b += x & 1; x >>= 1; } if (b === k) ms.push(m); }
      const prev = new Map([[start, null]]);
      const q = [start];
      while (q.length && !prev.has(0)) {
        const s = q.shift();
        for (const m of ms) { const t = s ^ m; if (!prev.has(t)) { prev.set(t, [s, m]); q.push(t); } }
      }
      if (!prev.has(0)) { read.innerHTML = parityText(); return; }
      const path = [];
      let cur = 0;
      while (prev.get(cur)) { const [s, m] = prev.get(cur); path.unshift(m); cur = s; }
      if (!path.length) { read.innerHTML = '已经全部朝下了。'; return; }
      const my = run;
      let i = 0;
      read.innerHTML = `电脑找到一种翻法：再翻 <b>${path.length}</b> 次就行。看它怎么翻……`;
      (function step() {
        if (my !== run) return;
        if (i >= path.length) { read.innerHTML = `完成！全部口朝下。${parityText()}`; return; }
        sel = new Set();
        for (let b = 0; b < n; b++) if (path[i] >> b & 1) sel.add(b);
        paint();
        i++;
        later(650, () => { if (my === run) flip(() => later(350, step)); });
      })();
    }
    btn(c, '翻！', () => { if (!busy) flip(); });
    btn(c, '电脑来试', solve, 'alt');
    btn(c, '重来', build, 'alt');
    slider(c, 'o8cn', '杯子数', 3, 9, 1, n, (v) => { n = v; if (k > n) { k = n; kS.set(k); } build(); });
    const kS = slider(c, 'o8ck', '每次翻', 1, 9, 1, k, (v) => { k = Math.min(v, n); if (v > n) kS.set(k); build(); });
    H('p', { class: 'anim-tip' }, el, '提示：试试 7 个杯子每次翻 4 个（做不到），再试试 6 个杯子每次翻 5 个（做得到）。');
    build();
  };

  // ───────── 计数与概率：摸球连线 ─────────
  A.c_count_prob_bag = function (el) {
    const W = 400, Hh = 310;
    const svg = stage(el, W, Hh);
    const head = T(svg, W / 2, 20, '', 'ts tm');
    const gL = S('g', {}, svg), gB = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let r = 3, w = 2, ev = 0, run = 0, lines = [], balls = [];
    const EV = [
      ['两个都是红球', (a, b) => a && b],
      ['一红一白', (a, b) => a !== b],
      ['两个都是白球', (a, b) => !a && !b],
      ['至少一个白球', (a, b) => !a || !b]
    ];
    const isRed = (i) => i < r;
    function build() {
      run++;
      gL.innerHTML = ''; gB.innerHTML = ''; lines = []; balls = [];
      const N = r + w;
      const pos = (i) => [200 + 115 * Math.sin((2 * PI * i) / N), 165 - 115 * Math.cos((2 * PI * i) / N)];
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const [x1, y1] = pos(i), [x2, y2] = pos(j);
        lines.push({ p: S('line', { x1, y1, x2, y2, class: 'sline' }, gL), i, j });
      }
      for (let i = 0; i < N; i++) {
        const [x, y] = pos(i);
        const g = S('g', {}, gB);
        S('circle', { cx: x, cy: y, r: 19, class: isRed(i) ? 'f2 s2' : 'fsurf sstrong' }, g);
        T(g, x, y + 4, isRed(i) ? `红${i + 1}` : `白${i - r + 1}`, isRed(i) ? 'ts tb tw' : 'ts tb');
        balls.push(g);
      }
      head.textContent = `${r} 个红球、${w} 个白球，一次摸 2 个。每条线代表一种摸法，共 ${(N * (N - 1)) / 2} 条。`;
      read.innerHTML = `一次摸出 2 个球（不讲顺序），所有摸法 = 两两连线的条数：${N} × ${N - 1} ÷ 2 = <b>${(N * (N - 1)) / 2}</b> 种，每种可能性相等。点下面的事件，数一数它包含几条线。`;
    }
    function show(e) {
      ev = e;
      const my = ++run;
      lines.forEach((l) => l.p.setAttribute('class', 'sline'));
      const tot = lines.length;
      const good = lines.filter((l) => EV[e][1](isRed(l.i), isRed(l.j)));
      let i = 0;
      (function step() {
        if (my !== run) return;
        if (i >= good.length) {
          read.innerHTML = `所有摸法一共 ${tot} 种，“${EV[e][0]}”的有 <b>${good.length}</b> 种（橙色的线），所以 <i>P</i> = ${frac(good.length, tot)}。`;
          if (e === 3) read.innerHTML += `<br>也可以反过来想：“至少一个白球”的反面是“两个都是红球”，<i>P</i> = 1 − ${window.fr(lines.filter((l) => isRed(l.i) && isRed(l.j)).length, tot)}。`;
          return;
        }
        good[i].p.setAttribute('class', 's2 thick');
        i++;
        read.innerHTML = `“${EV[e][0]}”：已数到 <b>${i}</b> 种。`;
        later(170, step);
      })();
    }
    function drawOnce() {
      run++;
      lines.forEach((l) => l.p.setAttribute('class', 'sline'));
      const l = lines[Math.floor(Math.random() * lines.length)];
      l.p.setAttribute('class', 's3 thick');
      flash(balls[l.i], 900, 1); flash(balls[l.j], 900, 1);
      const nm = (i) => (isRed(i) ? `红${i + 1}` : `白${i - r + 1}`);
      const ok = EV[ev][1](isRed(l.i), isRed(l.j));
      read.innerHTML = `随机摸到：${nm(l.i)} 和 ${nm(l.j)}（绿色的线）。它${ok ? '<b>属于</b>' : '<b>不属于</b>'}“${EV[ev][0]}”。每条线被摸到的机会一样大。`;
    }
    const c2 = ctrl(el);
    EV.forEach(([nm], e) => btn(c2, nm, () => show(e), 'alt'));
    btn(c, '随机摸一次', drawOnce);
    slider(c, 'o8br', '红球', 1, 5, 1, r, (v) => { r = v; build(); });
    slider(c, 'o8bw', '白球', 1, 5, 1, w, (v) => { w = v; build(); });
    build();
  };

  // ───────── 计数与概率：排队相邻 ─────────
  A.c_count_prob_queue = function (el) {
    const W = 440, Hh = 220;
    const svg = stage(el, W, Hh);
    const NM = ['甲', '乙', '丙', '丁', '戊', '己'];
    const gS = S('g', {}, svg), gR = S('g', {}, svg), gP = S('g', {}, svg), gBar = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 4, order = [], ppl = [], trials = 0, hits = 0, busy = false, run = 0;
    const PY = 80;
    const sx = (s) => W / 2 + (s - (n - 1) / 2) * 64;
    const adj = (o) => Math.abs(o.indexOf(0) - o.indexOf(1)) === 1;
    const fact = (m) => prodList(m, m);
    function build() {
      run++; busy = false; trials = 0; hits = 0;
      gS.innerHTML = ''; gP.innerHTML = ''; gR.innerHTML = ''; ppl = [];
      order = Array.from({ length: n }, (_, i) => i);
      for (let s = 0; s < n; s++) {
        S('line', { x1: sx(s) - 24, x2: sx(s) + 24, y1: PY + 30, y2: PY + 30, class: 'sstrong' }, gS);
        T(gS, sx(s), PY + 48, `${s + 1}号位`, 'ts tm');
      }
      for (let i = 0; i < n; i++) {
        const g = S('g', {}, gP);
        S('circle', { r: 22, class: i < 2 ? 'f2s s2' : 'f1s s1' }, g);
        T(g, 0, 6, NM[i], 'tb tl');
        ppl.push(g);
      }
      place();
      drawBar();
      read.innerHTML = `${n} 个人随机排成一排，甲、乙（橙色）<b>相邻</b>的概率是多少？先点“随机排一次”或“连排 100 次”做试验，再点“数一数”算出准确的概率。`;
    }
    function place() {
      order.forEach((p, s) => ppl[p].setAttribute('transform', `translate(${sx(s)},${PY})`));
      rope();
    }
    function rope() {
      gR.innerHTML = '';
      if (adj(order)) {
        const s = Math.min(order.indexOf(0), order.indexOf(1));
        S('rect', { x: sx(s) - 30, y: PY - 30, width: 124, height: 60, rx: 28, class: 'fnone s2 dash' }, gR);
      }
    }
    function drawBar() {
      gBar.innerHTML = '';
      const x0 = 70, bw = 300, y = 170;
      T(gBar, x0 - 8, y + 13, '频率', 'ts tm', 'end');
      S('rect', { x: x0, y, width: bw, height: 18, rx: 4, class: 'fsurf2 sline' }, gBar);
      if (trials) S('rect', { x: x0, y, width: (bw * hits) / trials, height: 18, rx: 4, class: 'f2s s2' }, gBar);
      const tx = x0 + (bw * 2) / n;
      S('line', { x1: tx, x2: tx, y1: y - 6, y2: y + 24, class: 's3 thick' }, gBar);
      T(gBar, tx, y + 40, `理论值 2/${n}`, 'ts t3');
      T(gBar, x0, y + 40, '0', 'ts tm'); T(gBar, x0 + bw, y + 40, '1', 'ts tm');
    }
    function shuffled() {
      const o = order.slice();
      for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
      return o;
    }
    function stat() {
      return `排了 ${trials} 次，甲乙相邻 ${hits} 次，频率 ≈ ${fmt(hits / trials)}。试验次数越多，频率越接近理论值 ${window.fr(2, n)} ≈ ${fmt(2 / n)}。`;
    }
    function once() {
      if (busy) return;
      busy = true;
      const my = run;
      const no = shuffled();
      gR.innerHTML = '';
      tween(700, (t) => {
        for (let p = 0; p < n; p++) {
          const x = lerp(sx(order.indexOf(p)), sx(no.indexOf(p)), t);
          const y = PY - 34 * Math.sin(t * PI) * (p % 2 ? 1 : -0.6);
          ppl[p].setAttribute('transform', `translate(${x},${y})`);
        }
      }, () => {
        if (my !== run) return;
        order = no; place();
        trials++; if (adj(order)) hits++;
        busy = false;
        drawBar();
        read.innerHTML = `这一次甲乙${adj(order) ? '<b>相邻</b>（虚线框）' : '<b>不相邻</b>'}。` + stat();
      });
    }
    function hundred() {
      if (busy) return;
      for (let i = 0; i < 100; i++) { const o = shuffled(); trials++; if (adj(o)) hits++; order = o; }
      place(); drawBar();
      read.innerHTML = stat();
    }
    function explain() {
      if (busy) return;
      run++;
      const tot = prodOf(fact(n)), good = 2 * prodOf(fact(n - 1));
      order = [0, 1].concat(Array.from({ length: n - 2 }, (_, i) => i + 2));
      place();
      flash(gR, 1400, 1);
      read.innerHTML = `<b>所有排法</b>：${n} 个人排一排，${fact(n).join(' × ')} = ${tot} 种，每种可能性相等。<br><b>甲乙相邻</b>：用绳子把甲乙捆成一个“大人”，和其余 ${n - 2} 人一起是 ${n - 1} 个，排法 ${fact(n - 1).join(' × ')} = ${prodOf(fact(n - 1))} 种；绳子里甲乙还能交换位置，再乘 2：${good} 种。<br><i>P</i>(甲乙相邻) = ${frac(good, tot)}。`;
    }
    btn(c, '随机排一次', once);
    btn(c, '连排 100 次', hundred, 'alt');
    btn(c, '数一数', explain, 'alt');
    slider(c, 'o8qn', '人数', 3, 6, 1, n, (v) => { n = v; build(); });
    build();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
