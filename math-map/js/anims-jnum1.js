// 初中 数与代数 第一部分（七年级）的互动动画。动画名都以知识点 id 开头。
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, grid, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  const fr = (a, b) => window.fr(a, b);

  // ── 本文件的小工具 ──
  const later = (ms, fn) => setTimeout(fn, RM ? 0 : ms);
  const moveTo = (el, x, y) => el.setAttribute('transform', `translate(${x},${y})`);
  const par = (n) => (n < 0 ? '(' + fmt(n) + ')' : fmt(n)); // 负数加括号
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const sup = (n) => String(n).split('').map((d) => SUP[+d]).join('');
  // 一元多项式：c = [x² 的系数, x 的系数, 常数项]
  function polyTxt(c, html) {
    const V = html ? ['<i>x</i><sup>2</sup>', '<i>x</i>', ''] : ['x²', 'x', ''];
    let s = '';
    c.forEach((k, i) => {
      if (!k) return;
      const abs = Math.abs(k), body = (abs === 1 && i < 2 ? '' : abs) + V[i];
      s += s ? (k < 0 ? ' − ' : ' + ') + body : (k < 0 ? '−' : '') + body;
    });
    return s || '0';
  }
  const linTxt = (k, b, html) => polyTxt([0, k, b], html);
  // 二元一次式 p x + q y = r
  function lin2(p, q, r, html) {
    const X = html ? '<i>x</i>' : 'x', Y = html ? '<i>y</i>' : 'y';
    const t = (k, v, first) => {
      if (!k) return '';
      const abs = Math.abs(k), body = (abs === 1 ? '' : abs) + v;
      return first ? (k < 0 ? '−' : '') + body : (k < 0 ? ' − ' : ' + ') + body;
    };
    return t(p, X, true) + t(q, Y, !p) + ' = ' + fmt(r);
  }
  // 数轴：返回坐标换算函数
  function numLine(parent, o) {
    const g = S('g', {}, parent);
    const X = (v) => o.x0 + v * o.u;
    const every = o.every || 1;
    S('line', { x1: X(o.min) - 12, x2: X(o.max) + 14, y1: o.y, y2: o.y, class: 'stroke-strong' }, g);
    S('path', { d: `M${X(o.max) + 20},${o.y} l-10,-5 v10 Z`, class: 'fill-strong' }, g);
    for (let v = o.min; v <= o.max; v++) {
      const big = v % every === 0;
      S('line', { x1: X(v), x2: X(v), y1: o.y - (big ? 6 : 4), y2: o.y + (big ? 6 : 4), class: big ? 'stroke-strong' : 'stroke-strong thin' }, g);
      if (big) T(g, X(v), o.y + 22, fmt(v), v === 0 ? 'tick lg strong' : 'tick lg');
    }
    return X;
  }

  // ════════════════════ 有理数：数卡片分类 ════════════════════
  A.n_rational_sort = function (el) {
    const W = 480, Hh = 340, BY = 180, BH = 150, BW = 88;
    const svg = stage(el, W, Hh);
    T(svg, W / 2, 22, '把数卡片拖进下面对应的框里', 'note');
    const BOX = [['pi', '正整数'], ['z', '0'], ['ni', '负整数'], ['pf', '正分数'], ['nf', '负分数']];
    const CARDS = [
      ['7', 'pi', '7 是正的整数，属于正整数。'],
      ['+12', 'pi', '+12 就是 12，“+”号可以省略，是正整数。'],
      ['0', 'z', '0 是整数，但它既不是正数也不是负数，单独一类。'],
      ['−3', 'ni', '−3 是负的整数，属于负整数。'],
      ['−100', 'ni', '−100 是负的整数，属于负整数。'],
      ['0.5', 'pf', '0.5 = 1/2，有限小数能化成分数，是正分数。'],
      ['2/3', 'pf', '2/3 是正分数。'],
      ['3.14', 'pf', '3.14 = 314/100，有限小数能化成分数，是正分数。'],
      ['−2.5', 'nf', '−2.5 = −5/2，有限小数能化成分数，是负分数。'],
      ['−1/4', 'nf', '−1/4 是负分数。']
    ];
    const boxes = BOX.map(([k, name], i) => {
      const x = 8 + i * (BW + 6);
      const r = S('rect', { x, y: BY, width: BW, height: BH, rx: 10, class: 'fsurf2 sline' }, svg);
      T(svg, x + BW / 2, BY + 22, name, 'tb');
      return { k, name, x, r };
    });
    const layer = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    btn(c, '看答案', () => {
      if (busy) return;
      cards.filter((cd) => !cd.done).forEach((cd, i) => later(i * 120, () => settle(cd, true)));
    }, 'alt');
    btn(c, '重新开始', () => { if (!busy) reset(); }, 'alt');
    let cards = [], count = {}, placed = 0, busy = false;
    const boxAt = (p) => boxes.find((b) => p.x >= b.x && p.x <= b.x + BW && p.y >= BY && p.y <= BY + BH);
    const place = (cd) => moveTo(cd.g, cd.x, cd.y);
    function fly(cd, x, y, done) {
      const x0 = cd.x, y0 = cd.y;
      tween(320, (t) => { cd.x = lerp(x0, x, t); cd.y = lerp(y0, y, t); place(cd); }, done);
    }
    function settle(cd, auto) {
      if (cd.done) return;
      cd.done = true;
      const b = boxes.find((bb) => bb.k === cd.k);
      const j = count[cd.k]++;
      cd.r.setAttribute('class', 'f3s s3');
      cd.g.style.cursor = 'default';
      fly(cd, b.x + BW / 2, BY + 52 + j * 38);
      placed++;
      if (placed === CARDS.length) {
        read.innerHTML = '全部放好了！<b>正整数、0、负整数</b>合起来叫<b>整数</b>；<b>正分数、负分数</b>合起来叫<b>分数</b>。整数和分数统称<b>有理数</b>。';
      } else if (!auto) {
        read.innerHTML = `<span class="k3">✓ 放对了！</span>${cd.why}（已放好 ${placed}/${CARDS.length}）`;
      }
    }
    function drop(cd, b) {
      if (!b) { fly(cd, cd.hx, cd.hy); return; }
      if (b.k === cd.k) { settle(cd, false); return; }
      cd.r.setAttribute('class', 'f2s s2');
      read.innerHTML = `<span class="k2">✗ ${cd.t} 不是“${b.name}”。</span>${cd.why}再试一次。`;
      busy = true;
      fly(cd, cd.hx, cd.hy, () => { busy = false; cd.r.setAttribute('class', 'fsurf sstrong'); });
    }
    function makeCard(data, i) {
      const g = S('g', { style: 'cursor: grab' }, layer);
      const r = S('rect', { x: -39, y: -17, width: 78, height: 34, rx: 8, class: 'fsurf sstrong' }, g);
      const tt = T(g, 0, 6, data[0], 'tl tb');
      tt.style.pointerEvents = 'none';
      const cd = { t: data[0], k: data[1], why: data[2], g, r, done: false };
      cd.hx = 53 + (i % 5) * 92; cd.hy = 62 + Math.floor(i / 5) * 52;
      cd.x = cd.hx; cd.y = cd.hy; place(cd);
      g.addEventListener('pointerdown', (e) => {
        if (cd.done || busy) return;
        e.preventDefault();
        g.setPointerCapture(e.pointerId);
        layer.appendChild(g);
        const p0 = svgPoint(svg, e), dx = cd.x - p0.x, dy = cd.y - p0.y;
        let hot = null;
        const move = (ev) => {
          const p = svgPoint(svg, ev);
          cd.x = p.x + dx; cd.y = p.y + dy; place(cd);
          const b = boxAt(p);
          if (hot !== b) {
            if (hot) hot.r.setAttribute('class', 'fsurf2 sline');
            hot = b;
            if (b) b.r.setAttribute('class', 'f1s s1');
          }
        };
        const up = (ev) => {
          g.removeEventListener('pointermove', move);
          g.removeEventListener('pointerup', up);
          g.removeEventListener('pointercancel', up);
          if (hot) hot.r.setAttribute('class', 'fsurf2 sline');
          drop(cd, boxAt(svgPoint(svg, ev)));
        };
        g.addEventListener('pointermove', move);
        g.addEventListener('pointerup', up);
        g.addEventListener('pointercancel', up);
      });
      return cd;
    }
    function reset() {
      layer.innerHTML = '';
      count = { pi: 0, z: 0, ni: 0, pf: 0, nf: 0 };
      placed = 0;
      const order = CARDS.map((d) => d).sort(() => Math.random() - 0.5);
      cards = order.map((d, i) => makeCard(d, i));
      read.innerHTML = '用手指或鼠标按住卡片，拖进下面的框里。放错了会弹回来，并告诉你原因。';
    }
    H('p', { class: 'anim-tip' }, el, '提示：有限小数（如 0.5、3.14）能化成分数，所以算作分数。');
    reset();
  };

  // ════════════════════ 有理数：两种分类树 ════════════════════
  A.n_rational_tree = function (el) {
    const svg = stage(el, 480, 262);
    const LX = 300, RX = 50, RY = 131;
    const MODES = {
      def: {
        l1: [['整数', 170, 75], ['分数', 170, 197]],
        leaf: { pi: 30, z: 75, ni: 120, pf: 175, nf: 220 },
        edges: [['r', 'a'], ['r', 'b'], ['a', 'pi'], ['a', 'z'], ['a', 'ni'], ['b', 'pf'], ['b', 'nf']]
      },
      sign: {
        l1: [['正有理数', 170, 52], ['负有理数', 170, 208]],
        leaf: { pi: 30, pf: 75, z: 131, ni: 186, nf: 231 },
        edges: [['r', 'a'], ['r', 'b'], ['r', 'z'], ['a', 'pi'], ['a', 'pf'], ['b', 'ni'], ['b', 'nf']]
      }
    };
    const LEAF = {
      pi: ['正整数', '1, 2, 3, +12…', '正整数：1、2、3、+12……大于 0 的整数。'],
      z: ['0', '只有 0 一个', '0：既不是正数也不是负数，但它是整数。'],
      ni: ['负整数', '−1, −2, −100…', '负整数：−1、−2、−100……小于 0 的整数。'],
      pf: ['正分数', '1/2, 0.5, 3.14…', '正分数：1/2、0.5、3.14……有限小数和无限循环小数都能化成分数。'],
      nf: ['负分数', '−1/4, −2.5…', '负分数：−1/4、−2.5……']
    };
    const eg = S('g', {}, svg);
    function box(w, label, cls) {
      const g = S('g', {}, svg);
      const r = S('rect', { x: -w / 2, y: -16, width: w, height: 32, rx: 8, class: cls }, g);
      const t = T(g, 0, 5, label, 'tb');
      return { g, r, t };
    }
    const root = box(76, '有理数', 'f1s s1');
    moveTo(root.g, RX, RY);
    const l1 = [box(92, '', 'fsurf2 sstrong'), box(92, '', 'fsurf2 sstrong')];
    const leaves = {};
    Object.keys(LEAF).forEach((k) => {
      const b = box(84, LEAF[k][0], 'fsurf sstrong');
      T(b.g, 52, 5, LEAF[k][1], 'ts tm', 'start');
      b.g.style.cursor = 'pointer';
      b.g.addEventListener('click', () => {
        mark([k]);
        read.innerHTML = LEAF[k][2];
      });
      leaves[k] = b;
    });
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mode = 'def', busy = false;
    const modeBtn = btn(c, '换一种分法', () => switchMode());
    btn(c, '圈出“非负数”', () => { mark(['pi', 'z', 'pf']); read.innerHTML = '<b>非负数</b> = 正数和 0（“不是负数”的数）。0 也在里面！'; }, 'alt');
    btn(c, '圈出“负数”', () => { mark(['ni', 'nf']); read.innerHTML = '<b>负数</b> = 负整数和负分数。0 不是负数。'; }, 'alt');
    btn(c, '圈出“整数”', () => { mark(['pi', 'z', 'ni']); read.innerHTML = '<b>整数</b> = 正整数、0、负整数。其中正整数和 0 合起来叫<b>非负整数</b>（自然数）。'; }, 'alt');
    function mark(keys) {
      Object.keys(leaves).forEach((k) => leaves[k].r.setAttribute('class', keys.includes(k) ? 'f2s s2' : 'fsurf sstrong'));
    }
    function P(m, id) {
      if (id === 'r') return [RX, RY];
      if (id === 'a') return [m.l1[0][1], m.l1[0][2]];
      if (id === 'b') return [m.l1[1][1], m.l1[1][2]];
      return [LX, m.leaf[id]];
    }
    const half = (id) => (id === 'r' ? 38 : id === 'a' || id === 'b' ? 46 : 42);
    function drawEdges(m) {
      eg.innerHTML = '';
      m.edges.forEach(([p, q]) => {
        const a = P(m, p), b = P(m, q);
        const x1 = a[0] + half(p), x2 = b[0] - half(q), xm = (x1 + x2) / 2;
        S('path', { d: `M${x1},${a[1]} C${xm},${a[1]} ${xm},${b[1]} ${x2},${b[1]}`, class: 'fnone smuted' }, eg);
      });
    }
    function layout(m) {
      m.l1.forEach(([lab, x, y], i) => { l1[i].t.textContent = lab; moveTo(l1[i].g, x, y); });
      Object.keys(leaves).forEach((k) => moveTo(leaves[k].g, LX, m.leaf[k]));
      drawEdges(m);
    }
    function describe() {
      read.innerHTML = mode === 'def'
        ? '按<b>定义</b>分：有理数分成<b>整数</b>和<b>分数</b>两大类。点右边任意一类，看看有哪些数。'
        : '按<b>正负</b>分：有理数分成<b>正有理数</b>、<b>0</b>、<b>负有理数</b>。同样的五小类，换了一种分组方式。';
      modeBtn.textContent = mode === 'def' ? '换成按正负分' : '换成按定义分';
    }
    function switchMode() {
      if (busy) return;
      busy = true;
      const from = MODES[mode];
      mode = mode === 'def' ? 'sign' : 'def';
      const to = MODES[mode];
      const fades = [eg, l1[0].g, l1[1].g];
      mark([]);
      tween(300, (t) => fades.forEach((e) => e.setAttribute('opacity', 1 - t)), () => {
        l1.forEach((b, i) => { b.t.textContent = to.l1[i][0]; moveTo(b.g, to.l1[i][1], to.l1[i][2]); });
        drawEdges(to);
        tween(700, (t) => Object.keys(leaves).forEach((k) => moveTo(leaves[k].g, LX, lerp(from.leaf[k], to.leaf[k], t))), () => {
          tween(300, (t) => fades.forEach((e) => e.setAttribute('opacity', t)), () => { busy = false; });
        });
      });
      describe();
    }
    layout(MODES.def);
    describe();
  };

  // ════════════════════ 有理数运算：正负圆片抵消 ════════════════════
  A.n_ratop_chips = function (el) {
    const W = 480, Hh = 262, X0 = 120, DX = 30, YA = 70, YB = 130, YR = 220;
    const svg = stage(el, W, Hh);
    T(svg, 12, 22, '蓝 ⊕ = +1，橙 ⊖ = −1，一蓝一橙是一个“零对”，合起来 = 0', 'ts tm', 'start');
    const labA = T(svg, 12, YA + 6, '', 'tl tb', 'start');
    const labB = T(svg, 12, YB + 6, '', 'tl tb', 'start');
    T(svg, 12, YR + 6, '结果', 'tb', 'start');
    const labR = T(svg, 56, YR + 6, '', 'tl tb', 'start');
    S('line', { x1: 10, x2: 470, y1: 172, y2: 172, class: 'sline dash' }, svg);
    const layer = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 5, b = -3, op = '+', busy = false, gen = 0, rowA = [], rowB = [];
    slider(c, 'ca', 'a', -6, 6, 1, a, (v) => { a = v; draw(); });
    slider(c, 'cb', 'b', -6, 6, 1, b, (v) => { b = v; draw(); });
    const c2 = ctrl(el);
    btn(c2, '算一算', () => go());
    const opBtn = btn(c2, '换成减法', () => { op = op === '+' ? '−' : '+'; opBtn.textContent = op === '+' ? '换成减法' : '换成加法'; draw(); }, 'alt');
    btn(c2, '重来', () => draw(), 'alt');
    const put = (o) => o.g.setAttribute('transform', `translate(${o.x},${o.y}) scale(${o.sx},1)`);
    function setSign(o, s) {
      o.s = s;
      o.c.setAttribute('class', s > 0 ? 'f1s s1' : 'f2s s2');
      o.t.setAttribute('class', s > 0 ? 't1 tl tb' : 't2 tl tb');
      o.t.textContent = s > 0 ? '+' : '−';
    }
    function chip(s, x, y) {
      const g = S('g', {}, layer);
      const o = { g, c: S('circle', { r: 13 }, g), t: T(g, 0, 6, '', ''), x, y, sx: 1, s };
      setSign(o, s);
      put(o);
      return o;
    }
    const expr = () => `${fmt(a)} ${op} ${par(b)}`;
    function draw() {
      gen++; busy = false;
      layer.innerHTML = '';
      rowA = []; rowB = [];
      for (let i = 0; i < Math.abs(a); i++) rowA.push(chip(Math.sign(a), X0 + i * DX, YA));
      for (let i = 0; i < Math.abs(b); i++) rowB.push(chip(Math.sign(b), X0 + i * DX, YB));
      labA.textContent = fmt(a);
      labB.textContent = op === '+' ? '+ ' + par(b) : '− ' + par(b);
      labR.textContent = '';
      cap.textContent = '';
      read.innerHTML = `要算 <b>${expr()}</b>。第一行是 ${fmt(a)}，第二行是 ${fmt(b)}。点“算一算”。`;
    }
    function go() {
      if (busy) return;
      draw();
      busy = true;
      const my = gen;
      const eb = op === '+' ? b : -b;
      const r = a + eb;
      const steps = [];
      if (op === '−') {
        steps.push((next) => {
          cap.textContent = `减去 ${par(b)}，等于加上它的相反数 ${par(-b)}：第二行每个圆片都翻面`;
          labB.textContent = '+ ' + par(-b);
          if (!rowB.length) { later(600, next); return; }
          let flipped = false;
          tween(700, (t) => {
            rowB.forEach((o) => { o.sx = Math.max(0.05, Math.abs(Math.cos(PI * t))); put(o); });
            if (t >= 0.5 && !flipped) { flipped = true; rowB.forEach((o) => setSign(o, -o.s)); }
          }, () => later(500, next));
        });
      }
      steps.push((next) => {
        const pairs = Math.sign(a) * Math.sign(eb) < 0 ? Math.min(Math.abs(a), Math.abs(eb)) : 0;
        if (!pairs) {
          cap.textContent = a === 0 || eb === 0 ? '有一个数是 0，没有可以抵消的' : '两行符号相同，没有可以抵消的零对，直接合在一起';
          later(700, next);
          return;
        }
        cap.textContent = `一蓝一橙配成零对，一共 ${pairs} 对，每对都是 0，抵消掉`;
        const lines = [];
        for (let i = 0; i < pairs; i++) lines.push(S('line', { x1: X0 + i * DX, x2: X0 + i * DX, y1: YA + 14, y2: YB - 14, class: 's3 dash' }, layer));
        later(500, () => {
          if (my !== gen) return;
          tween(700, (t) => {
            for (let i = 0; i < pairs; i++) {
              rowA[i].g.setAttribute('opacity', 1 - t);
              rowB[i].g.setAttribute('opacity', 1 - t);
              lines[i].setAttribute('opacity', 1 - t);
            }
          }, () => {
            rowA.splice(0, pairs);
            rowB.splice(0, pairs);
            later(300, next);
          });
        });
      });
      steps.push((next) => {
        const left = rowA.concat(rowB);
        cap.textContent = left.length ? '剩下的圆片就是结果' : '全部抵消了，结果是 0';
        const from = left.map((o) => [o.x, o.y]);
        tween(700, (t) => left.forEach((o, i) => { o.x = lerp(from[i][0], X0 + i * DX, t); o.y = lerp(from[i][1], YR, t); put(o); }), next);
      });
      let i = 0;
      const next = () => {
        if (my !== gen) return;
        if (i < steps.length) { steps[i++](next); return; }
        busy = false;
        labR.textContent = fmt(r);
        const A1 = Math.abs(a), B1 = Math.abs(eb);
        let why;
        if (a === 0 || eb === 0) why = '一个数同 0 相加，仍得这个数。';
        else if (Math.sign(a) === Math.sign(eb)) why = `同号相加：符号不变（都是${a > 0 ? '正' : '负'}的），绝对值相加 ${A1} + ${B1} = ${A1 + B1}。`;
        else if (A1 === B1) why = '互为相反数的两个数相加，全部抵消，得 0。';
        else why = `异号相加：取绝对值较大的数的符号（${A1 > B1 ? fmt(a) : fmt(eb)} 的符号），用较大的绝对值减去较小的：${Math.max(A1, B1)} − ${Math.min(A1, B1)} = ${Math.abs(r)}。`;
        read.innerHTML = (op === '−' ? `${expr()} = ${fmt(a)} + ${par(-b)} = <b>${fmt(r)}</b>。` : `${expr()} = <b>${fmt(r)}</b>。`) + why;
      };
      next();
    }
    draw();
  };

  // ════════════════════ 有理数运算：乘法在数轴上连跳 ════════════════════
  A.n_ratop_jump = function (el) {
    const W = 480, Hh = 178, x0 = 240, u = 18, yL = 118;
    const svg = stage(el, W, Hh);
    const X = numLine(svg, { x0, y: yL, u, min: -12, max: 12, every: 2 });
    const jg = S('g', {}, svg);
    const resT = T(svg, 0, 62, '', 'tl tb');
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = -3, b = -2, busy = false, gen = 0, dot;
    slider(c, 'ja', '每跳', -4, 4, 1, a, (v) => { a = v; reset(); });
    slider(c, 'jb', '乘', -3, 3, 1, b, (v) => { b = v; reset(); });
    const c2 = ctrl(el);
    btn(c2, '开始跳', () => go());
    btn(c2, '重来', () => reset(), 'alt');
    H('p', { class: 'anim-tip' }, el, '符号规律：(+)×(+) 得 +，(−)×(−) 得 +，(+)×(−) 得 −，(−)×(+) 得 −。');
    function mirror(s) { jg.setAttribute('transform', `translate(${x0},0) scale(${s},1) translate(${-x0},0)`); }
    function reset() {
      gen++; busy = false;
      jg.innerHTML = '';
      mirror(1);
      dot = S('circle', { cx: X(0), cy: yL, r: 7, class: 'f3 s3' }, jg);
      resT.textContent = '';
      cap.textContent = '';
      const dir = a > 0 ? `向右跳 ${a} 格` : a < 0 ? `向左跳 ${-a} 格` : '原地不动（跳 0 格）';
      read.innerHTML = `算 <b>${fmt(a)} × ${par(b)}</b>：从 0 出发，每次${dir}，跳 ${Math.abs(b)} 次` +
        (b < 0 ? '；因为乘的是<b>负数</b>，最后还要整体翻到原点的另一边（取相反数）。' : '。');
    }
    function finish() {
      busy = false;
      const r = a * b;
      resT.setAttribute('x', X(r));
      resT.textContent = fmt(r);
      let rule;
      if (a === 0 || b === 0) rule = '任何数同 0 相乘，都得 0。';
      else if ((a > 0) === (b > 0)) rule = `<b>同号得正</b>，绝对值相乘：${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(r)}。`;
      else rule = `<b>异号得负</b>，绝对值相乘：${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(r)}。`;
      read.innerHTML = `${fmt(a)} × ${par(b)} = <b>${fmt(r)}</b>。${rule}`;
    }
    function go() {
      if (busy) return;
      reset();
      busy = true;
      const my = gen, n = Math.abs(b), h = 12 + Math.abs(a) * 5;
      let k = 0;
      const hop = () => {
        if (my !== gen) return;
        if (k >= n || a === 0) { after(); return; }
        const x1 = X(k * a), x2 = X((k + 1) * a);
        cap.textContent = `第 ${k + 1} 跳：${fmt(k * a)} → ${fmt((k + 1) * a)}`;
        const p = S('path', { d: `M${x1},${yL - 4} Q${(x1 + x2) / 2},${yL - 4 - 2 * h} ${x2},${yL - 4}`, class: 'fnone s1', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, jg);
        jg.appendChild(dot);
        tween(520, (t) => {
          p.setAttribute('stroke-dashoffset', 1 - t);
          dot.setAttribute('cx', lerp(x1, x2, t));
          dot.setAttribute('cy', yL - 4 * h * t * (1 - t));
        }, () => { k++; later(150, hop); });
      };
      const after = () => {
        if (my !== gen) return;
        if (b < 0 && a !== 0) {
          cap.textContent = `乘的是负数：把结果 ${fmt(a * n)} 翻到原点另一边，变成 ${fmt(-a * n)}`;
          later(400, () => {
            if (my !== gen) return;
            let swapped = false;
            tween(900, (t) => {
              mirror(Math.cos(PI * t));
              if (t > 0.5 && !swapped) { swapped = true; jg.querySelectorAll('path').forEach((p) => p.setAttribute('class', 'fnone s2')); }
            }, finish);
          });
        } else {
          if (a === 0 || b === 0) cap.textContent = '有一个因数是 0，结果停在 0';
          finish();
        }
      };
      hop();
    }
    reset();
  };

  // ════════════════════ 乘方：对折纸张 ════════════════════
  A.n_power_fold = function (el) {
    const W = 460, Hh = 250, X0 = 40, BASE = 232, L0 = 320, TH = 3.5, MAXV = 5;
    const svg = stage(el, W, Hh);
    const t1 = T(svg, 20, 28, '', 'tl tb', 'start');
    const t2 = T(svg, 20, 54, '', '', 'start');
    const t3 = T(svg, 20, 80, '', 'ts tm', 'start');
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 0, busy = false;
    btn(c, '对折一次', () => fold());
    btn(c, '展开（重来）', () => { if (!busy) { n = 0; sl.set(0); draw(); } }, 'alt');
    const c2 = ctrl(el);
    const sl = slider(c2, 'pf', 'n', 0, 30, 1, 0, (v) => { if (!busy) { n = v; draw(); } else sl.set(n); });
    H('p', { class: 'anim-tip' }, el, '拖动滑块可以“想象”对折更多次（真实的纸折不了那么多次）。纸厚按 0.1 毫米算。');
    function layers(parent, m, w, x, cls0) {
      for (let i = 0; i < m; i++) S('rect', { x, y: BASE - (i + 1) * TH, width: w, height: TH, class: i % 2 ? 'f1' : cls0 }, parent);
    }
    function thick(k) {
      const mm = 0.1 * Math.pow(2, k);
      if (mm < 10) return fmt(mm) + ' 毫米';
      if (mm < 1000) return fmt(mm / 10) + ' 厘米';
      if (mm < 1e6) return fmt(mm / 1000) + ' 米';
      return fmt(mm / 1e6) + ' 千米';
    }
    function big(m) {
      if (m < 1e6) return String(m);
      const e = String(m).length - 1;
      return `${m}，约 ${fmt(m / Math.pow(10, e))} × 10${sup(e)}`;
    }
    function draw() {
      g.innerHTML = '';
      const m = Math.pow(2, n);
      if (n > 0) {
        S('rect', { x: X0, y: BASE - TH, width: L0, height: TH, class: 'fnone smuted dash' }, g);
        T(g, X0 + L0, BASE + 14, '虚线：没折之前纸的长度', 'ts tm', 'end');
      }
      if (n <= MAXV) {
        layers(g, m, L0 / m, X0, 'f1s');
      } else {
        layers(g, 32, L0 / 32, X0, 'f1s');
        T(g, X0 + 40, BASE - 60, '层数太多，画不下了……', 'note', 'start');
        T(g, X0 + 40, BASE - 38, '纸已经厚到看不清每一层', 'note', 'start');
      }
      t1.textContent = n === 0 ? '还没有对折：1 层' : `对折 ${n} 次`;
      if (n === 0) t2.textContent = '每对折一次，层数就乘 2';
      else if (n <= 6) t2.textContent = `层数 = ${Array(n).fill('2').join(' × ')} = 2${sup(n)} = ${m}`;
      else t2.textContent = `层数 = 2 × 2 × … × 2（${n} 个 2）= 2${sup(n)}`;
      t3.textContent = `厚度约 ${thick(n)}`;
      let txt = n === 0 ? '一张纸只有 1 层。点“对折一次”。' : `对折 ${n} 次，层数是 <b>2<sup>${n}</sup> = ${big(m)}</b> 层。底数 2 表示每次乘 2，指数 ${n} 表示乘了 ${n} 次。`;
      if (n > 0) txt += `如果纸厚 0.1 毫米，叠起来约 <b>${thick(n)}</b>。`;
      if (n >= 27) txt += '已经比珠穆朗玛峰（约 8848 米）还高了！';
      read.innerHTML = txt;
    }
    function fold() {
      if (busy) return;
      if (n >= MAXV) { read.innerHTML = `已经 ${Math.pow(2, n)} 层了，真实的纸很难再折。拖动下面的滑块，“想象”继续折下去。`; return; }
      busy = true;
      g.innerHTML = '';
      const m = Math.pow(2, n), w = L0 / m, half = w / 2;
      layers(g, m, half, X0, 'f1s');
      const rg = S('g', {}, g);
      layers(rg, m, half, X0 + half, 'f1s');
      const px = X0 + half, py = BASE - m * TH;
      tween(800, (t) => rg.setAttribute('transform', `rotate(${-180 * t},${px},${py})`), () => {
        n++; sl.set(n); busy = false; draw();
      });
    }
    draw();
  };

  // ════════════════════ 科学记数法：小数点滑动 ════════════════════
  A.n_power_sci = function (el) {
    const W = 480, Hh = 200, CW = 36, BY = 44, BH = 44;
    const svg = stage(el, W, Hh);
    const DATA = [
      ['384000', '地球到月球的平均距离约 384000 千米'],
      ['1400000000', '我国人口约 14 亿，即 1400000000 人'],
      ['300000', '光每秒大约传播 300000 千米'],
      ['149600000', '地球到太阳的平均距离约 149600000 千米'],
      ['6400', '地球的半径约 6400 千米']
    ];
    const capT = T(svg, W / 2, 22, '', 'note');
    const g = S('g', {}, svg);
    const hops = S('g', {}, svg);
    const pt = S('circle', { r: 5, class: 'f2' }, svg);
    const eqT = T(svg, W / 2, 150, '', 'tl tb');
    const subT = T(svg, W / 2, 178, '', 'ts tm');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let di = 0, digits = '', p = 0, sx = 0, busy = false, cells = [];
    btn(c, '← 小数点左移一位', () => move(-1));
    btn(c, '右移一位 →', () => move(1), 'alt');
    btn(c, '一步到位', () => auto(), 'alt');
    btn(c, '换一个数', () => { if (!busy) { di = (di + 1) % DATA.length; load(); } }, 'alt');
    const ptX = (k) => sx + k * CW;
    function aStr(k) {
      const intPart = digits.slice(0, k), rest = digits.slice(k).replace(/0+$/, '');
      return rest ? intPart + '.' + rest : intPart;
    }
    function load() {
      digits = DATA[di][0];
      capT.textContent = DATA[di][1];
      p = digits.length;
      sx = (W - digits.length * CW) / 2;
      g.innerHTML = ''; hops.innerHTML = '';
      cells = digits.split('').map((d, i) => {
        S('rect', { x: sx + i * CW + 2, y: BY, width: CW - 4, height: BH, rx: 6, class: 'fsurf sline' }, g);
        return T(g, sx + i * CW + CW / 2, BY + 32, d, 'txl');
      });
      pt.setAttribute('cx', ptX(p)); pt.setAttribute('cy', BY + BH - 4);
      show();
    }
    function show() {
      const n = digits.length - p;
      cells.forEach((t, i) => {
        const after = i >= p;
        const dropped = after && /^0*$/.test(digits.slice(i));
        t.setAttribute('class', 'txl' + (dropped ? ' tm' : after ? ' t1' : ''));
      });
      const a = aStr(p);
      eqT.textContent = n === 0 ? `${digits}（小数点在最后，平时省略不写）` : `${digits} = ${a} × 10${sup(n)}`;
      subT.textContent = n === 0 ? '' : `小数点左移了 ${n} 位，数缩小为原来的 1/10${n > 1 ? sup(n) : ''}，所以乘 10${n > 1 ? sup(n) : ''} 补回来`;
      if (p === 1) {
        read.innerHTML = `<span class="k3">✓ 现在 <i>a</i> = ${a}，满足 1 ≤ <i>a</i> &lt; 10。</span>小数点一共左移了 ${n} 位，所以 <i>n</i> = ${n}。规律：<i>n</i> = 整数位数 − 1 = ${digits.length} − 1 = ${n}。`;
      } else if (n === 0) {
        read.innerHTML = `${digits} 是一个 ${digits.length} 位数。把小数点向左移，直到前面只剩一位数字。`;
      } else {
        read.innerHTML = `现在 <i>a</i> = ${a}，比 10 大，还不符合 1 ≤ <i>a</i> &lt; 10，继续向左移。`;
      }
    }
    function move(d, done) {
      if (busy) return;
      const to = p + d;
      if (to < 1) { read.innerHTML = '已经只剩一位整数了，再移 <i>a</i> 就比 1 小，不符合要求。'; return; }
      if (to > digits.length) { read.innerHTML = '小数点已经在最后了。'; return; }
      busy = true;
      const x1 = ptX(p), x2 = ptX(to), yb = BY + BH - 4;
      if (d < 0) {
        const k = digits.length - to;
        S('path', { d: `M${x1},${yb + 10} Q${(x1 + x2) / 2},${yb + 30} ${x2},${yb + 10}`, class: 'fnone s2', 'data-k': k }, hops);
      } else {
        const last = hops.lastChild;
        if (last) hops.removeChild(last);
      }
      tween(380, (t) => {
        pt.setAttribute('cx', lerp(x1, x2, t));
        pt.setAttribute('cy', yb + 16 * Math.sin(PI * t));
      }, () => { p = to; busy = false; show(); if (done) done(); });
    }
    function auto() {
      if (busy || p <= 1) return;
      const step = () => { if (p > 1) move(-1, () => later(120, step)); };
      step();
    }
    load();
  };

  // ════════════════════ 整式：找同类项并合并 ════════════════════
  A.n_expr_like = function (el) {
    const W = 480, Hh = 250, CW = 124, CH = 42;
    const svg = stage(el, W, Hh);
    const TERMS = [
      [3, 'a²b', 'g1'], [-2, 'ab²', 'g2'], [5, 'ab', 'g3'],
      [7, '', 'g4'], [-1, 'a²b', 'g1'], [4, 'ab²', 'g2'],
      [-1, 'ab', 'g3'], [2, 'ba²', 'g1'], [-3, '', 'g4']
    ];
    const GROUP = {
      g1: ['a²b', '这一组的字母都是 <i>a</i> 和 <i>b</i>，并且 <i>a</i> 都是 2 次、<i>b</i> 都是 1 次。2<i>ba</i><sup>2</sup> 只是字母顺序不同，也是同类项。', 0],
      g2: ['ab²', '这一组的字母都是 <i>a</i> 和 <i>b</i>，<i>a</i> 是 1 次、<i>b</i> 是 2 次。它和 <i>a</i><sup>2</sup><i>b</i> 字母相同但指数不同，<b>不是</b>同类项！', 1],
      g3: ['ab', '这一组的字母都是 <i>a</i> 和 <i>b</i>，而且都是 1 次。', 2],
      g4: ['', '不含字母的数叫常数项，所有常数项都是同类项。', 3]
    };
    T(svg, W / 2, 20, '点一张卡片，找出它的同类项', 'note');
    const term = (k, v) => (v ? (k === 1 ? '' : k === -1 ? '−' : fmt(k)) + v : fmt(k));
    const signed = (k, v, first) => {
      const s = term(Math.abs(k), v);
      return first ? (k < 0 ? '−' : '') + s : (k < 0 ? ' − ' : ' + ') + s;
    };
    const layer = S('g', {}, svg);
    S('line', { x1: 10, x2: 470, y1: 190, y2: 190, class: 'sline dash' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let cards = [], sel = null, merged = {}, busy = false;
    const mBtn = btn(c, '合并这一组', () => mergeGroup(sel));
    btn(c, '全部合并', () => mergeAll(), 'alt');
    btn(c, '重来', () => { if (!busy) reset(); }, 'alt');
    function cardEl(x, y, text, cls) {
      const g = S('g', { style: 'cursor: pointer' }, layer);
      const r = S('rect', { x: -CW / 2, y: -CH / 2, width: CW, height: CH, rx: 10, class: cls }, g);
      const t = T(g, 0, 7, text, 'tl tb');
      moveTo(g, x, y);
      return { g, r, t, x, y };
    }
    function paint() {
      cards.forEach((cd) => {
        if (cd.gone) return;
        const on = sel && cd.grp === sel;
        cd.r.setAttribute('class', on ? 'f3s s3' : 'fsurf sstrong');
        cd.g.setAttribute('opacity', sel && !on ? 0.4 : 1);
      });
      mBtn.disabled = !sel || merged[sel];
    }
    function pick(grp) {
      if (busy || merged[grp]) return;
      sel = grp;
      paint();
      const list = cards.filter((cd) => cd.grp === grp);
      read.innerHTML = `同类项：<b>${list.map((cd, i) => signed(cd.k, cd.v, i === 0)).join('')}</b>。${GROUP[grp][1]}`;
    }
    function sumOf(grp) { return cards.filter((cd) => cd.grp === grp).reduce((s, cd) => s + cd.k, 0); }
    function mergeGroup(grp, done) {
      if (busy || !grp || merged[grp]) { if (done) done(); return; }
      busy = true;
      const list = cards.filter((cd) => cd.grp === grp);
      const slot = GROUP[grp][2], tx = 70 + slot * 112, ty = 222;
      const from = list.map((cd) => [cd.x, cd.y]);
      list.forEach((cd) => cd.g.setAttribute('opacity', 1));
      tween(700, (t) => list.forEach((cd, i) => { cd.x = lerp(from[i][0], tx, t); cd.y = lerp(from[i][1], ty, t); moveTo(cd.g, cd.x, cd.y); }), () => {
        const s = sumOf(grp), v = GROUP[grp][0];
        list.forEach((cd, i) => { if (i) { cd.g.remove(); cd.gone = true; } });
        const keep = list[0];
        keep.r.setAttribute('class', 'f1s s1');
        keep.r.setAttribute('width', 100); keep.r.setAttribute('x', -50);
        keep.t.textContent = s === 0 ? '0' : term(s, v);
        keep.g.style.cursor = 'default';
        merged[grp] = true;
        const coefs = list.map((cd, i) => (i === 0 ? fmt(cd.k) : (cd.k < 0 ? ' − ' + fmt(-cd.k) : ' + ' + fmt(cd.k)))).join('');
        const lhs = list.map((cd, i) => signed(cd.k, cd.v, i === 0)).join('');
        read.innerHTML = v
          ? `${lhs} = (${coefs})${GROUP[grp][0]} = <b>${s === 0 ? '0' : term(s, GROUP[grp][0])}</b>。系数相加，字母和指数不变。`
          : `${lhs} = <b>${fmt(s)}</b>。常数项直接相加减。`;
        sel = null; busy = false; paint();
        if (Object.keys(merged).length === 4) {
          read.innerHTML += '<br>全部合并完成：原式 = <b>4<i>a</i><sup>2</sup><i>b</i> + 2<i>ab</i><sup>2</sup> + 4<i>ab</i> + 4</b>。';
        }
        if (done) done();
      });
    }
    function mergeAll() {
      if (busy) return;
      const order = ['g1', 'g2', 'g3', 'g4'].filter((g) => !merged[g]);
      let i = 0;
      const next = () => { if (i < order.length) { sel = order[i++]; paint(); later(350, () => mergeGroup(sel, () => later(250, next))); } };
      next();
    }
    function reset() {
      layer.innerHTML = '';
      merged = {}; sel = null;
      cards = TERMS.map(([k, v, grp], i) => {
        const x = 85 + (i % 3) * 155, y = 52 + Math.floor(i / 3) * 52;
        const cd = cardEl(x, y, term(k, v), 'fsurf sstrong');
        Object.assign(cd, { k, v, grp, gone: false });
        cd.g.addEventListener('click', () => pick(grp));
        return cd;
      });
      paint();
      read.innerHTML = '点任意一张卡片，和它是同类项的卡片会一起亮起来。看清楚：字母相同、相同字母的指数也相同，才是同类项。';
    }
    reset();
  };

  // ════════════════════ 整式加减：代数片 ════════════════════
  A.n_expr_tiles = function (el) {
    const W = 380, Hh = 306;
    const svg = stage(el, W, Hh);
    const PRE = [
      [[2, 3, -1], [-1, 1, 4], '+'],
      [[1, -2, 3], [2, -1, 1], '−'],
      [[1, 2, 0], [-1, 3, -2], '−'],
      [[-1, 4, -3], [1, -2, 5], '+']
    ];
    const SZ = [[36, 36], [12, 36], [12, 12]];
    const ROWY = [42, 116], ZX = [12, 150, 282], PY = 206, NY = 258;
    const lab1 = T(svg, 12, 32, '', '', 'start');
    const lab2 = T(svg, 12, 106, '', '', 'start');
    S('line', { x1: 8, x2: 372, y1: 168, y2: 168, class: 'sline dash' }, svg);
    ['x² 项', 'x 项', '常数项'].forEach((s, i) => T(svg, ZX[i], 192, s, 'tm', 'start'));
    const layer = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, P, tiles = [], step = 0, steps = [], busy = false;
    const nextBtn = btn(c, '下一步', () => doStep());
    btn(c, '重来', () => { if (!busy) load(); }, 'alt');
    btn(c, '换一题', () => { if (!busy) { pi = (pi + 1) % PRE.length; load(); } }, 'alt');
    H('p', { class: 'anim-tip' }, el, '大方块 = <i>x</i><sup>2</sup>，长条 = <i>x</i>，小方块 = 1；蓝色是正，橙色是负。');
    const put = (o) => {
      const w = SZ[o.type][0];
      o.g.setAttribute('transform', `translate(${o.x + w / 2},${o.y}) scale(${o.sx},1) translate(${-w / 2},0)`);
    };
    function setSign(o, s) {
      o.s = s;
      o.r.setAttribute('class', (s > 0 ? 'f1s s1' : 'f2s s2') + ' thin');
      if (o.t) { o.t.textContent = s > 0 ? 'x²' : '−x²'; o.t.setAttribute('class', 'ts ' + (s > 0 ? 't1' : 't2')); }
    }
    function tile(type, s, row, x) {
      const [w, h] = SZ[type];
      const g = S('g', {}, layer);
      const o = { type, row, g, r: S('rect', { x: 0, y: 0, width: w, height: h, rx: 2 }, g), t: null, x, y: ROWY[row], sx: 1 };
      if (type === 0) o.t = T(g, w / 2, h / 2 + 4, '', 'ts');
      setSign(o, s);
      put(o);
      return o;
    }
    function load() {
      busy = false;
      P = PRE[pi];
      layer.innerHTML = '';
      tiles = [];
      [P[0], P[1]].forEach((poly, row) => {
        let x = 12;
        poly.forEach((k, type) => {
          for (let i = 0; i < Math.abs(k); i++) { tiles.push(tile(type, Math.sign(k), row, x)); x += SZ[type][0] + 4; }
          if (k) x += 14;
        });
      });
      lab1.textContent = '第一个多项式：' + polyTxt(P[0]);
      lab2.textContent = (P[2] === '+' ? '加上：+(' : '减去：−(') + polyTxt(P[1]) + ')';
      steps = [];
      if (P[2] === '−') steps.push(flip);
      steps.push(group, cancel, result);
      step = 0;
      nextBtn.disabled = false;
      cap.textContent = '';
      read.innerHTML = `要算 <b>(${polyTxt(P[0], true)}) ${P[2]} (${polyTxt(P[1], true)})</b>。上面一行是第一个多项式，下面一行是第二个。点“下一步”。`;
    }
    const eff = () => P[1].map((k) => (P[2] === '+' ? k : -k));
    function doStep() {
      if (busy || step >= steps.length) return;
      busy = true;
      steps[step++](() => { busy = false; if (step >= steps.length) nextBtn.disabled = true; });
    }
    function flip(done) {
      cap.textContent = '第 1 步　去括号：括号前是“−”，括号里每一项都变号（每块片翻面）';
      const row2 = tiles.filter((o) => o.row === 1);
      let swapped = false;
      tween(800, (t) => {
        row2.forEach((o) => { o.sx = Math.max(0.05, Math.abs(Math.cos(PI * t))); put(o); });
        if (t >= 0.5 && !swapped) { swapped = true; row2.forEach((o) => setSign(o, -o.s)); }
      }, () => {
        lab2.textContent = '去括号后：' + polyTxt(eff()).replace(/^(?!−)/, '+ ');
        read.innerHTML = `−(${polyTxt(P[1], true)}) = ${polyTxt(eff(), true)}`;
        done();
      });
    }
    function group(done) {
      cap.textContent = `第 ${steps.length === 4 ? 2 : 1} 步　把同类项放在一起：同一种形状的片放进同一栏，正的在上、负的在下`;
      const cnt = {};
      const target = tiles.map((o) => {
        const key = o.type + (o.s > 0 ? 'p' : 'n');
        const i = cnt[key] = (cnt[key] || 0) + 1;
        return [ZX[o.type] + (i - 1) * (SZ[o.type][0] + 4), o.s > 0 ? PY : NY];
      });
      const from = tiles.map((o) => [o.x, o.y]);
      tween(900, (t) => tiles.forEach((o, i) => { o.x = lerp(from[i][0], target[i][0], t); o.y = lerp(from[i][1], target[i][1], t); put(o); }), () => {
        read.innerHTML = '同类项排好了。同一栏里，上面一块蓝的和下面一块橙的正好凑成一个零对。';
        done();
      });
    }
    function cancel(done) {
      cap.textContent = `第 ${steps.length === 4 ? 3 : 2} 步　一正一负抵消（零对）`;
      const gone = [];
      [0, 1, 2].forEach((type) => {
        const pos = tiles.filter((o) => o.type === type && o.s > 0), neg = tiles.filter((o) => o.type === type && o.s < 0);
        for (let i = 0; i < Math.min(pos.length, neg.length); i++) gone.push(pos[i], neg[i]);
      });
      if (!gone.length) { read.innerHTML = '没有可以抵消的零对。'; done(); return; }
      tween(800, (t) => gone.forEach((o) => o.g.setAttribute('opacity', 1 - t)), () => {
        tiles = tiles.filter((o) => !gone.includes(o));
        read.innerHTML = `抵消掉 ${gone.length / 2} 对。剩下的片已经没有可以配对的了。`;
        done();
      });
    }
    function result(done) {
      cap.textContent = `第 ${steps.length} 步　数一数剩下的片，写出结果`;
      const e = eff(), sum = P[0].map((k, i) => k + e[i]);
      const NAME = ['<i>x</i><sup>2</sup> 项', '<i>x</i> 项', '常数项'];
      const parts = [0, 1, 2].filter((i) => P[0][i] || e[i]).map((i) => `${NAME[i]}：${fmt(P[0][i])} ${e[i] < 0 ? '−' : '+'} ${fmt(Math.abs(e[i]))} = ${fmt(sum[i])}`);
      read.innerHTML = `${parts.join('；')}。<br>结果：(${polyTxt(P[0], true)}) ${P[2]} (${polyTxt(P[1], true)}) = <b>${polyTxt(sum, true)}</b>`;
      tiles.forEach((o) => o.g.setAttribute('opacity', 1));
      tween(500, (t) => tiles.forEach((o) => o.r.style.strokeWidth = 1 + 2 * Math.sin(PI * t)), done);
    }
    load();
  };

  // ════════════════════ 一元一次方程：天平 ════════════════════
  A.n_lin1_balance = function (el) {
    const W = 480, Hh = 320, PX = 240, PY = 92, ARM = 140, DROP = 150;
    const svg = stage(el, W, Hh);
    const PRE = [[3, 2, 1, 8], [5, 1, 2, 13], [4, 6, 1, 12]];
    const eqT = T(svg, PX, 36, '', 'txl');
    S('path', { d: `M${PX},${PY} L${PX - 36},${Hh - 8} L${PX + 36},${Hh - 8} Z`, class: 'fsurf2 sstrong' }, svg);
    const beam = S('line', { class: 'stroke-strong thick round' }, svg);
    S('circle', { cx: PX, cy: PY, r: 6, class: 'fstrong' }, svg);
    const pans = [0, 1].map(() => {
      const g = S('g', {}, svg);
      S('line', { x1: 0, y1: -DROP, x2: -72, y2: 0, class: 'smuted thin' }, g);
      S('line', { x1: 0, y1: -DROP, x2: 72, y2: 0, class: 'smuted thin' }, g);
      const items = S('g', {}, g);
      S('path', { d: 'M-78,0 L78,0 Q70,16 0,16 Q-70,16 -78,0 Z', class: 'fsurf2 sstrong' }, g);
      return { g, items };
    });
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, a, b, cc, d, sol, L, R, step, busy = false, gen = 0, theta = 0, els = [null, null];
    const nextBtn = btn(c, '下一步', () => doStep());
    btn(c, '错误示范：只动一边', () => wrong(), 'alt');
    btn(c, '换一个方程', () => { pi = (pi + 1) % PRE.length; load(); }, 'alt');
    btn(c, '重来', () => load(), 'alt');
    H('p', { class: 'anim-tip' }, el, '蓝色盒子里装着同样重的东西，重量是未知数 <i>x</i>；橙色圆是 1 个单位重的砝码。');
    function setTilt(th) {
      theta = th;
      const r = (th * PI) / 180, dx = ARM * Math.cos(r), dy = ARM * Math.sin(r);
      beam.setAttribute('x1', PX - dx); beam.setAttribute('y1', PY - dy);
      beam.setAttribute('x2', PX + dx); beam.setAttribute('y2', PY + dy);
      moveTo(pans[0].g, PX - dx, PY - dy + DROP);
      moveTo(pans[1].g, PX + dx, PY + dy + DROP);
    }
    function renderSide(i, side) {
      const g = pans[i].items;
      g.innerHTML = '';
      const xs = [], cs = [];
      const boxRows = Math.ceil(side.x / 4);
      for (let k = 0; k < side.x; k++) {
        const it = S('g', {}, g);
        S('rect', { x: -14, y: -14, width: 28, height: 28, rx: 4, class: 'f1s s1' }, it);
        T(it, 0, 5, 'x', 'tb t1');
        const pos = [-48 + (k % 4) * 32, -16 - Math.floor(k / 4) * 32];
        moveTo(it, pos[0], pos[1]);
        xs.push({ g: it, pos });
      }
      for (let k = 0; k < side.c; k++) {
        const it = S('g', {}, g);
        S('circle', { r: 9, class: 'f2s s2' }, it);
        T(it, 0, 4, '1', 'ts t2');
        const pos = [-52.5 + (k % 6) * 21, -2 - boxRows * 32 - 10 - Math.floor(k / 6) * 21];
        moveTo(it, pos[0], pos[1]);
        cs.push({ g: it, pos });
      }
      els[i] = { xs, cs };
    }
    function render() { renderSide(0, L); renderSide(1, R); eqT.textContent = `${linTxt(L.x, L.c)} = ${linTxt(R.x, R.c)}`; }
    function load() {
      gen++; busy = false;
      [a, b, cc, d] = PRE[pi];
      sol = (d - b) / (a - cc);
      L = { x: a, c: b }; R = { x: cc, c: d };
      step = 0;
      setTilt(0);
      render();
      nextBtn.disabled = false;
      cap.textContent = '';
      read.innerHTML = `天平左边：${a} 个 <i>x</i> 和 ${b} 个 1；右边：${cc} 个 <i>x</i> 和 ${d} 个 1。天平平衡，说明 <b>${linTxt(a, b, true)} = ${linTxt(cc, d, true)}</b>。`;
    }
    // 把选中的物体淡出并向上飘走
    function vanish(list, done) {
      tween(700, (t) => list.forEach((o) => { o.g.setAttribute('opacity', 1 - t); moveTo(o.g, o.pos[0], o.pos[1] - 30 * t); }), done);
    }
    function doStep() {
      if (busy) return;
      const my = gen;
      const k = a - cc, q = d - b;
      if (step === 0) {
        busy = true;
        cap.textContent = `第 1 步　两边同时拿走 ${cc} 个 x（等式性质 1）`;
        vanish(els[0].xs.slice(-cc).concat(els[1].xs.slice(-cc)), () => {
          if (my !== gen) return;
          L.x -= cc; R.x -= cc; render(); busy = false; step = 1;
          read.innerHTML = `两边同时减去 ${cc === 1 ? '' : cc}<i>x</i>，天平仍然平衡：<b>${linTxt(L.x, L.c, true)} = ${linTxt(R.x, R.c, true)}</b>。写在纸上，就像把右边的 ${cc === 1 ? '' : cc}<i>x</i> 移到左边变成 −${cc === 1 ? '' : cc}<i>x</i>，再合并。`;
        });
      } else if (step === 1) {
        busy = true;
        cap.textContent = `第 2 步　两边同时拿走 ${b} 个 1（等式性质 1）`;
        vanish(els[0].cs.slice(-b).concat(els[1].cs.slice(-b)), () => {
          if (my !== gen) return;
          L.c -= b; R.c -= b; render(); busy = false; step = 2;
          read.innerHTML = `两边同时减去 ${b}：<b>${linTxt(L.x, L.c, true)} = ${linTxt(R.x, R.c, true)}</b>。现在左边只剩 <i>x</i>，右边只剩数。`;
        });
      } else if (step === 2) {
        busy = true;
        cap.textContent = `第 3 步　两边同时除以 ${k}：分成 ${k} 份，各留 1 份（等式性质 2）`;
        const keepX = els[0].xs.slice(0, 1), keepC = els[1].cs.slice(0, q / k);
        keepX.concat(keepC).forEach((o) => o.g.firstChild.setAttribute('class', 'f3s s3'));
        later(600, () => {
          if (my !== gen) return;
          vanish(els[0].xs.slice(1).concat(els[1].cs.slice(q / k)), () => {
            if (my !== gen) return;
            L.x = 1; R.c = q / k; render(); busy = false; step = 3;
            read.innerHTML = `${k} 个 <i>x</i> 重 ${q}，那么 1 个 <i>x</i> 重 ${q} ÷ ${k} = ${q / k}：<b><i>x</i> = ${sol}</b>。`;
          });
        });
      } else if (step === 3) {
        step = 4;
        nextBtn.disabled = true;
        cap.textContent = '第 4 步　检验';
        read.innerHTML = `把 <i>x</i> = ${sol} 代回原方程：左边 = ${a} × ${sol} + ${b} = ${a * sol + b}，右边 = ${cc === 1 ? '' : cc + ' × '}${sol} + ${d} = ${cc * sol + d}。左边 = 右边，<b><i>x</i> = ${sol}</b> 是方程的解。`;
      }
    }
    function wrong() {
      if (busy) return;
      if (step !== 0) { read.innerHTML = '先点“重来”，回到原方程再看错误示范。'; return; }
      busy = true;
      const my = gen;
      const list = els[0].cs.slice();
      cap.textContent = `错误示范：只在左边拿走 ${b} 个 1，右边不动`;
      vanish(list, () => {
        if (my !== gen) return;
        const lw = a * sol, rw = cc * sol + d;
        const target = Math.max(-14, Math.min(14, (rw - lw) * 4));
        eqT.textContent = `${linTxt(a, 0)} ≠ ${linTxt(cc, d)}`;
        tween(600, (t) => setTilt(lerp(0, target, t)), () => {
          read.innerHTML = `天平歪了！左边变轻，等式 ${linTxt(a, 0, true)} = ${linTxt(cc, d, true)} 不再成立。<b>等式两边必须做同样的事</b>。`;
          later(1800, () => {
            if (my !== gen) return;
            tween(500, (t) => setTilt(lerp(target, 0, t)), () => {
              render(); busy = false; cap.textContent = '';
              read.innerHTML += '（已恢复原样）';
            });
          });
        });
      });
    }
    void theta;
    load();
  };

  // ════════════════════ 一元一次方程：移项变号 ════════════════════
  A.n_lin1_move = function (el) {
    const W = 400, Hh = 140, Y0 = 92;
    const svg = stage(el, W, Hh);
    const PRE = [[5, -3, 2, 9], [2, 7, -1, 1], [4, -5, 6, 3]];
    const hint = T(svg, W / 2, 30, '', 'note');
    const layer = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, P, toks = [], eqTok, step = 0, busy = false, gen = 0;
    const nextBtn = btn(c, '下一步', () => doStep());
    btn(c, '重来', () => load(), 'alt');
    btn(c, '换一个方程', () => { pi = (pi + 1) % PRE.length; load(); }, 'alt');
    const termStr = (k, isX, first) => {
      const abs = Math.abs(k), body = isX ? (abs === 1 ? '' : abs) + 'x' : String(abs);
      return first ? (k < 0 ? '−' : '') + body : (k < 0 ? '− ' : '+ ') + body;
    };
    const plain = (k, isX) => termStr(k, isX, true);
    const pm = (k, isX) => (k < 0 ? '−' : '+') + plain(Math.abs(k), isX);
    function mk(k, isX, side) {
      const g = S('g', {}, layer);
      const t = T(g, 0, 0, '', 'txl' + (isX ? ' t1' : ''));
      return { k, isX, side, g, t, x: W / 2, y: Y0 };
    }
    function texts() {
      ['L', 'R'].forEach((s) => toks.filter((o) => o.side === s).forEach((o, i) => { o.txt = termStr(o.k, o.isX, i === 0); }));
    }
    function targets() {
      texts();
      const order = toks.filter((o) => o.side === 'L').concat([eqTok], toks.filter((o) => o.side === 'R'));
      const wid = (o) => (o === eqTok ? 40 : 14 + o.txt.length * 16);
      const total = order.reduce((s, o) => s + wid(o), 0);
      let x = (W - total) / 2;
      order.forEach((o) => { o.tx = x + wid(o) / 2; x += wid(o); });
    }
    function placeAll() { targets(); [eqTok].concat(toks).forEach((o) => { o.x = o.tx; moveTo(o.g, o.x, o.y); if (o.t && o !== eqTok) o.t.textContent = o.txt; }); }
    function animate(mover, dur, done) {
      const from = new Map();
      [eqTok].concat(toks).forEach((o) => from.set(o, o.x));
      targets();
      let switched = false;
      tween(dur, (t) => {
        [eqTok].concat(toks).forEach((o) => {
          o.x = lerp(from.get(o), o.tx, t);
          const lift = o === mover ? -46 * Math.sin(PI * t) : 0;
          moveTo(o.g, o.x, o.y + lift);
        });
        if (mover && t > 0.5 && !switched) { switched = true; mover.t.textContent = mover.txt; mover.t.setAttribute('class', 'txl t2'); }
      }, () => {
        toks.forEach((o) => { if (o !== mover) o.t.textContent = o.txt; });
        if (done) done();
      });
      if (!mover) toks.forEach((o) => { o.t.textContent = o.txt; });
    }
    function load() {
      gen++; busy = false;
      P = PRE[pi];
      layer.innerHTML = '';
      toks = [mk(P[0], true, 'L'), mk(P[1], false, 'L'), mk(P[2], true, 'R'), mk(P[3], false, 'R')];
      const eg = S('g', {}, layer);
      eqTok = { g: eg, t: T(eg, 0, 0, '=', 'txl'), x: W / 2, y: Y0, txt: '=' };
      placeAll();
      step = 0;
      nextBtn.disabled = false;
      hint.textContent = '把含 x 的项移到左边，常数项移到右边';
      cap.textContent = '';
      read.innerHTML = `解方程 <b>${linTxt(P[0], P[1], true)} = ${linTxt(P[2], P[3], true)}</b>。点“下一步”。`;
    }
    const doing = (k, isX) => (k > 0 ? '减去 ' : '加上 ') + plain(Math.abs(k), isX);
    function doStep() {
      if (busy) return;
      const my = gen;
      if (step === 0) {
        busy = true;
        const m = toks[2];
        const old = plain(m.k, true);
        m.k = -m.k; m.side = 'L';
        toks = [toks[0], m, toks[1], toks[3]];
        cap.textContent = `移项：把右边的 ${old} 移到左边，变号成 ${pm(m.k, true)}`;
        animate(m, 1000, () => {
          if (my !== gen) return;
          busy = false; step = 1;
          read.innerHTML = `为什么要变号？其实是等式两边同时<b>${doing(-m.k, true).replace('x', '<i>x</i>')}</b>：右边的它被消掉，左边就多出了 ${pm(m.k, true).replace('x', '<i>x</i>')}。`;
        });
      } else if (step === 1) {
        busy = true;
        const m = toks[2];
        const old = plain(m.k, false);
        m.k = -m.k; m.side = 'R';
        toks = [toks[0], toks[1], toks[3], m];
        cap.textContent = `移项：把左边的 ${old} 移到右边，变号成 ${pm(m.k, false)}`;
        animate(m, 1000, () => {
          if (my !== gen) return;
          busy = false; step = 2;
          read.innerHTML = `相当于等式两边同时<b>${doing(-m.k, false)}</b>。现在左边全是含 <i>x</i> 的项，右边全是数。`;
        });
      } else if (step === 2) {
        busy = true;
        const k = toks[0].k + toks[1].k, q = toks[2].k + toks[3].k;
        cap.textContent = '合并同类项：左边系数相加，右边数相加';
        const [x1, x2, c1, c2] = toks;
        const fx = [x2.x, c2.x], tx = [x1.x, c1.x];
        tween(600, (t) => {
          moveTo(x2.g, lerp(fx[0], tx[0], t), Y0); x2.g.setAttribute('opacity', 1 - t);
          moveTo(c2.g, lerp(fx[1], tx[1], t), Y0); c2.g.setAttribute('opacity', 1 - t);
        }, () => {
          if (my !== gen) return;
          x2.g.remove(); c2.g.remove();
          x1.k = k; c1.k = q;
          x1.t.setAttribute('class', 'txl t1'); c1.t.setAttribute('class', 'txl');
          toks = [x1, c1];
          animate(null, 400, () => {
            busy = false; step = 3;
            read.innerHTML = `${fmt(P[0])} ${P[2] > 0 ? '−' : '+'} ${fmt(Math.abs(P[2]))} = ${fmt(k)}，${fmt(P[3])} ${P[1] > 0 ? '−' : '+'} ${fmt(Math.abs(P[1]))} = ${fmt(q)}，得到 <b>${linTxt(k, 0, true)} = ${fmt(q)}</b>。`;
          });
        });
      } else if (step === 3) {
        busy = true;
        const k = toks[0].k, q = toks[1].k, s = q / k;
        cap.textContent = `系数化为 1：两边同时除以 ${par(k)}`;
        tween(400, (t) => toks.forEach((o) => o.g.setAttribute('opacity', 1 - t)), () => {
          if (my !== gen) return;
          toks[0].k = 1; toks[1].k = s;
          animate(null, 1, () => {
            tween(400, (t) => toks.forEach((o) => o.g.setAttribute('opacity', t)), () => {
              busy = false; step = 4; nextBtn.disabled = true;
              hint.textContent = '解出来了！';
              read.innerHTML = `<i>x</i> = ${fmt(q)} ÷ ${par(k)} = <b>${fmt(s)}</b>。检验：左边 = ${fmt(P[0])} × ${par(s)} ${P[1] < 0 ? '−' : '+'} ${fmt(Math.abs(P[1]))} = ${fmt(P[0] * s + P[1])}，右边 = ${fmt(P[2])} × ${par(s)} ${P[3] < 0 ? '−' : '+'} ${fmt(Math.abs(P[3]))} = ${fmt(P[2] * s + P[3])}，相等。`;
            });
          });
        });
      }
    }
    load();
  };

  // ════════════════════ 二元一次方程组：两条直线的交点 ════════════════════
  A.n_sys_lines = function (el) {
    const size = 360;
    const svg = stage(el, size, size);
    const G = grid(svg, size, -6, 6);
    const PRE = [[[1, 1, 5], [2, 1, 8]], [[1, -1, 1], [1, 2, 4]], [[2, 1, 4], [1, -1, -1]]];
    const l1 = S('line', { class: 'fline', 'clip-path': G.clip }, svg);
    const l2 = S('line', { class: 'fnone s2 thick', 'clip-path': G.clip }, svg);
    const dots = S('g', {}, svg);
    const hit = S('circle', { r: 13, class: 'fnone s3 thick', opacity: 0 }, svg);
    const hd = S('circle', { r: 9, class: 'handle' }, svg);
    const legend = H('p', { class: 'anim-tip' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, E, px = 0, py = 0, busy = false, gen = 0;
    btn(c, '画出 ① 的几个整数解', () => showSols());
    btn(c, '直接找交点', () => goSolve(), 'alt');
    btn(c, '换一组', () => { if (!busy) { pi = (pi + 1) % PRE.length; load(); } }, 'alt');
    const inv = (sx, sy) => [Math.round((sx - G.X(0)) / G.u), Math.round((G.Y(0) - sy) / G.u)];
    const clamp = (v) => Math.max(-6, Math.min(6, v));
    function setLine(ln, [p, q, r]) {
      const f = (x) => (r - p * x) / q;
      ln.setAttribute('x1', G.X(-7)); ln.setAttribute('y1', G.Y(f(-7)));
      ln.setAttribute('x2', G.X(7)); ln.setAttribute('y2', G.Y(f(7)));
    }
    function solution() {
      const [[a1, b1, c1], [a2, b2, c2]] = E;
      const D = a1 * b2 - a2 * b1;
      return [(c1 * b2 - c2 * b1) / D, (a1 * c2 - a2 * c1) / D];
    }
    const sub = ([p, q], x, y) => `${fmt(p)}×${par(x)} + ${fmt(q)}×${par(y)}`;
    function update() {
      hd.setAttribute('cx', G.X(px)); hd.setAttribute('cy', G.Y(py));
      hit.setAttribute('cx', G.X(px)); hit.setAttribute('cy', G.Y(py));
      const ok = E.map(([p, q, r]) => p * px + q * py === r);
      const line = (i) => {
        const [p, q, r] = E[i], v = p * px + q * py;
        return `${i ? '②' : '①'}：${sub(E[i], px, py)} = ${fmt(v)} ${v === r ? '✓' : '≠ ' + fmt(r) + ' ✗'}`;
      };
      let tail;
      if (ok[0] && ok[1]) tail = `<b>两个方程都满足！</b><i>x</i> = ${px}，<i>y</i> = ${py} 就是方程组的解，也正是两条直线的交点。`;
      else if (ok[0]) tail = '点在蓝线上：是 ① 的一个解，但不满足 ②，不是方程组的解。';
      else if (ok[1]) tail = '点在橙线上：是 ② 的一个解，但不满足 ①，不是方程组的解。';
      else tail = '这个点两个方程都不满足。';
      hit.setAttribute('opacity', ok[0] && ok[1] ? 1 : 0);
      read.innerHTML = `点 (${fmt(px)}, ${fmt(py)})<br>${line(0)}<br>${line(1)}<br>${tail}`;
    }
    function load() {
      gen++; busy = false;
      E = PRE[pi];
      setLine(l1, E[0]); setLine(l2, E[1]);
      dots.innerHTML = '';
      px = 0; py = 0;
      legend.innerHTML = `<span class="k1">蓝线 ①：${lin2(E[0][0], E[0][1], E[0][2], true)}</span>　<span class="k2">橙线 ②：${lin2(E[1][0], E[1][1], E[1][2], true)}</span>`;
      update();
    }
    function showSols() {
      if (busy) return;
      busy = true;
      const my = gen;
      dots.innerHTML = '';
      const [p, q, r] = E[0], pts = [];
      for (let x = -6; x <= 6; x++) {
        const y = (r - p * x) / q;
        if (Number.isInteger(y) && Math.abs(y) <= 6) pts.push([x, y]);
      }
      pts.forEach(([x, y], i) => later(i * 220, () => {
        if (my !== gen) return;
        const d = S('circle', { cx: G.X(x), cy: G.Y(y), r: 0, class: 'f1' }, dots);
        tween(200, (t) => d.setAttribute('r', 5 * t));
        read.innerHTML = `① 的解：(${pts.slice(0, i + 1).map(([a, b]) => `${fmt(a)}, ${fmt(b)}`).join(')、(')})……<br>二元一次方程有<b>无数组解</b>，画出来都在蓝线上。`;
        if (i === pts.length - 1) busy = false;
      }));
      if (!pts.length) busy = false;
    }
    function goSolve() {
      if (busy) return;
      busy = true;
      const my = gen;
      const [sx, sy] = solution(), fx = px, fy = py;
      tween(800, (t) => {
        hd.setAttribute('cx', G.X(lerp(fx, sx, t))); hd.setAttribute('cy', G.Y(lerp(fy, sy, t)));
      }, () => { if (my !== gen) return; px = sx; py = sy; busy = false; update(); });
    }
    svg.addEventListener('pointerdown', (e) => {
      if (busy) return;
      e.preventDefault();
      svg.setPointerCapture(e.pointerId);
      const setP = (ev) => {
        const pt = svgPoint(svg, ev), [x, y] = inv(pt.x, pt.y);
        if (clamp(x) !== px || clamp(y) !== py) { px = clamp(x); py = clamp(y); update(); }
      };
      setP(e);
      const up = () => { svg.removeEventListener('pointermove', setP); svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up); };
      svg.addEventListener('pointermove', setP);
      svg.addEventListener('pointerup', up);
      svg.addEventListener('pointercancel', up);
    });
    load();
  };

  // ════════════════════ 二元一次方程组：买水果消元 ════════════════════
  A.n_sys_fruit = function (el) {
    const W = 400, Hh = 256, X0 = 56, DX = 32, Y1 = 58, Y2 = 118, Y3 = 190, Y4 = 232;
    const svg = stage(el, W, Hh);
    const PRE = [[2, 1, 8, 1, 1, 5], [3, 2, 19, 1, 2, 9], [1, 3, 13, 1, 1, 7]];
    const layer = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, P, step = 0, busy = false, gen = 0, f1, f2, oX;
    const nextBtn = btn(c, '下一步', () => doStep());
    btn(c, '重来', () => load(), 'alt');
    btn(c, '换一组', () => { pi = (pi + 1) % PRE.length; load(); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '绿色是苹果（每个 <i>x</i> 元），橙色是橙子（每个 <i>y</i> 元）。');
    function fruit(kind, x, y) {
      const g = S('g', {}, layer);
      if (kind === 'a') {
        S('line', { x1: 0, y1: -13, x2: 3, y2: -19, class: 's3 round' }, g);
        S('circle', { r: 13, class: 'f3s s3' }, g);
        T(g, 0, 4, '苹', 'ts t3');
      } else {
        S('circle', { r: 13, class: 'f2s s2' }, g);
        T(g, 0, 4, '橙', 'ts t2');
      }
      moveTo(g, x, y);
      return { g, kind, x, y };
    }
    function row(na, nb, y, amax) {
      const list = [];
      for (let i = 0; i < na; i++) list.push(fruit('a', X0 + i * DX, y));
      for (let j = 0; j < nb; j++) list.push(fruit('b', oX(amax) + j * DX, y));
      return list;
    }
    const nameOf = (k) => (k === 'a' ? '苹果' : '橙子');
    function load() {
      gen++; busy = false;
      P = PRE[pi];
      layer.innerHTML = '';
      const amax = Math.max(P[0], P[3]), bmax = Math.max(P[1], P[4]);
      oX = (am) => X0 + am * DX + 16;
      const priceX = oX(amax) + bmax * DX + 4;
      T(layer, 14, Y1 + 6, '①', 'tl tb', 'start');
      T(layer, 14, Y2 + 6, '②', 'tl tb', 'start');
      f1 = row(P[0], P[1], Y1, amax);
      f2 = row(P[3], P[4], Y2, amax);
      T(layer, priceX, Y1 + 6, `= ${P[2]} 元`, 'tl tb', 'start');
      T(layer, priceX, Y2 + 6, `= ${P[5]} 元`, 'tl tb', 'start');
      S('line', { x1: 10, x2: 390, y1: 156, y2: 156, class: 'sline dash' }, layer);
      step = 0;
      nextBtn.disabled = false;
      cap.textContent = '';
      read.innerHTML = `① ${P[0]} 个苹果和 ${P[1]} 个橙子共 ${P[2]} 元；② ${P[3]} 个苹果和 ${P[4]} 个橙子共 ${P[5]} 元。<br>设苹果每个 <i>x</i> 元，橙子每个 <i>y</i> 元：① ${lin2(P[0], P[1], P[2], true)}，② ${lin2(P[3], P[4], P[5], true)}。`;
    }
    function solve() {
      const [a1, b1, c1, a2, b2, c2] = P;
      if (b1 === b2) { const x = (c1 - c2) / (a1 - a2); return { elim: 'b', keep: 'a', n: a1 - a2, m: c1 - c2, x, y: (c2 - a2 * x) / b2 }; }
      const y = (c1 - c2) / (b1 - b2);
      return { elim: 'a', keep: 'b', n: b1 - b2, m: c1 - c2, x: (c2 - b2 * y) / a2, y };
    }
    function doStep() {
      if (busy) return;
      const my = gen, s = solve();
      if (step === 0) {
        step = 1;
        const cnt = s.elim === 'b' ? P[1] : P[0];
        cap.textContent = `第 1 步　观察：两个式子里${nameOf(s.elim)}一样多（都是 ${cnt} 个）`;
        f1.concat(f2).filter((f) => f.kind === s.elim).forEach((f) => f.g.querySelector('circle').setAttribute('class', s.elim === 'a' ? 'f3 s3' : 'f2 s2'));
        read.innerHTML = `${nameOf(s.elim)}的个数相同，用 ① − ② 就能把${nameOf(s.elim)}“消掉”，只剩下一种水果。这就是<b>加减消元</b>。`;
      } else if (step === 1) {
        busy = true;
        cap.textContent = '第 2 步　① − ②：两边同样的水果去掉，钱数也相减';
        const gone = [];
        f2.forEach((f) => {
          const twin = f1.find((g) => g.kind === f.kind && g.x === f.x && !gone.includes(g));
          if (twin) {
            gone.push(f, twin);
            S('line', { x1: f.x, x2: f.x, y1: Y1 + 15, y2: Y2 - 15, class: 's1 dash' }, layer);
          }
        });
        later(500, () => {
          if (my !== gen) return;
          tween(700, (t) => gone.forEach((f) => f.g.setAttribute('opacity', 1 - 0.8 * t)), () => {
            const left = f1.filter((f) => !gone.includes(f));
            const from = left.map((f) => [f.x, f.y]);
            tween(700, (t) => left.forEach((f, i) => moveTo(f.g, lerp(from[i][0], X0 + i * DX, t), lerp(from[i][1], Y3, t))), () => {
              if (my !== gen) return;
              T(layer, X0 + left.length * DX, Y3 + 6, `= ${P[2]} − ${P[5]} = ${s.m} 元`, 'tl tb', 'start');
              if (s.n > 1) T(layer, X0 + left.length * DX + 150, Y3 + 6, `→ 1 个 ${s.m / s.n} 元`, 'tb t1', 'start');
              const v = s.keep === 'a' ? '<i>x</i>' : '<i>y</i>';
              const val = s.keep === 'a' ? s.x : s.y;
              read.innerHTML = s.n === 1
                ? `① − ②：<b>${v} = ${P[2]} − ${P[5]} = ${s.m}</b>。一个${nameOf(s.keep)} ${val} 元。`
                : `① − ②：${s.n}${v} = ${P[2]} − ${P[5]} = ${s.m}，所以 <b>${v} = ${val}</b>。一个${nameOf(s.keep)} ${val} 元。`;
              busy = false; step = 2;
            });
          });
        });
      } else if (step === 2) {
        step = 3;
        nextBtn.disabled = true;
        cap.textContent = '第 3 步　代入：把求出的价钱放回 ② 里，求另一种水果';
        const [, , , a2, b2, c2] = P;
        let txt;
        if (s.keep === 'a') txt = `代入 ②：${a2 === 1 ? '' : a2 + ' × '}${s.x} + ${b2 === 1 ? '' : b2}y = ${c2}，y = ${s.y}`;
        else txt = `代入 ②：${a2 === 1 ? '' : a2}x + ${b2 === 1 ? '' : b2 + ' × '}${s.y} = ${c2}，x = ${s.x}`;
        const t = T(layer, X0 - 40, Y4 + 6, txt, 'tb', 'start');
        tween(500, (k) => t.setAttribute('opacity', k));
        read.innerHTML = `方程组的解是 <b><i>x</i> = ${s.x}，<i>y</i> = ${s.y}</b>：苹果每个 ${s.x} 元，橙子每个 ${s.y} 元。<br>检验 ①：${P[0]} × ${s.x} + ${P[1]} × ${s.y} = ${P[0] * s.x + P[1] * s.y} ✓　②：${a2} × ${s.x} + ${b2} × ${s.y} = ${a2 * s.x + b2 * s.y} ✓`;
      }
    }
    load();
  };

  // ════════════════════ 不等式：乘负数，左右颠倒 ════════════════════
  A.n_ineq_flip = function (el) {
    const W = 480, Hh = 196, x0 = 240, u = 14, yL = 140;
    const svg = stage(el, W, Hh);
    const X = numLine(svg, { x0, y: yL, u, min: -15, max: 15, every: 5 });
    const topT = T(svg, W / 2, 26, '', 'note');
    const lT = T(svg, 190, 64, '', 'tl tb t1', 'end');
    const rel = T(svg, 240, 66, '', 'txl');
    const rT = T(svg, 290, 64, '', 'tl tb t2', 'start');
    const pv = T(svg, 0, yL - 30, '', 'tb t1');
    const qv = T(svg, 0, yL - 14, '', 'tb t2');
    const pd = S('circle', { r: 8, cy: yL, class: 'f1 s1' }, svg);
    const qd = S('circle', { r: 8, cy: yL, class: 'f2 s2' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const PAIRS = [[1, 4], [-3, 2], [-4, -1]];
    let pi = 0, p, q, k = 1, busy = false;
    const sl = slider(c, 'ik', 'k', -3, 3, 0.5, k, (v) => { if (!busy) { k = v; draw(); } });
    const c2 = ctrl(el);
    btn(c2, '从 ×2 慢慢变到 ×(−2)', () => {
      if (busy) return;
      busy = true;
      tween(2600, (t) => { k = lerp(2, -2, t); sl.set(Math.round(k * 100) / 100); draw(); }, () => { k = -2; sl.set(-2); busy = false; draw(); });
    });
    btn(c2, '换一对数', () => { if (!busy) { pi = (pi + 1) % PAIRS.length; load(); } }, 'alt');
    function load() { [p, q] = PAIRS[pi]; draw(); }
    function draw() {
      const a = p * k, b = q * k;
      pd.setAttribute('cx', X(a)); qd.setAttribute('cx', X(b));
      pv.setAttribute('x', X(a)); pv.textContent = fmt(a);
      qv.setAttribute('x', X(b)); qv.textContent = fmt(b);
      topT.textContent = `原来：${fmt(p)} < ${fmt(q)}，两边同乘 k = ${fmt(k)}`;
      lT.textContent = `${fmt(p)} × ${par(k)} = ${fmt(a)}`;
      rT.textContent = `${fmt(b)} = ${fmt(q)} × ${par(k)}`;
      const r = Math.abs(a - b) < 1e-9 ? '=' : a < b ? '<' : '>';
      rel.textContent = r;
      rel.setAttribute('class', 'txl' + (r === '>' ? ' t2' : ''));
      if (k > 0) read.innerHTML = `乘<b>正数</b>：两个点只是一起被拉伸或压缩，左右顺序不变，所以 ${fmt(a)} &lt; ${fmt(b)}，<b>不等号方向不变</b>。`;
      else if (Math.abs(k) < 1e-9) read.innerHTML = '乘 0：两边都变成 0，变成了等式。所以不等式的性质只说“乘正数”和“乘负数”。';
      else read.innerHTML = `乘<b>负数</b>：每个点都翻到原点另一边，原来在左边的 <span class="k1">${fmt(p)}</span> 跑到了右边，左右顺序颠倒，所以 ${fmt(a)} &gt; ${fmt(b)}，<b>不等号方向改变</b>。`;
    }
    load();
  };

  // ════════════════════ 不等式组：数轴上找公共部分 ════════════════════
  A.n_ineq_line = function (el) {
    const W = 480, Hh = 206, x0 = 240, u = 32, yL = 160, RY = [62, 106];
    const svg = stage(el, W, Hh);
    const band = S('g', {}, svg);
    const X = numLine(svg, { x0, y: yL, u, min: -6, max: 6, every: 1 });
    const rays = [S('g', {}, svg), S('g', {}, svg)];
    const ends = S('g', {}, svg);
    const C = [{ op: '>', v: -2 }, { op: '≤', v: 3 }];
    const OPS = ['>', '≥', '<', '≤'];
    const ctlRows = C.map((cnd, i) => {
      const r = H('div', { class: 'anim-row' }, el);
      H('span', {}, r, `${i ? '②' : '①'}　<i>x</i>`);
      const sel = H('select', { 'aria-label': '不等号' }, r);
      OPS.forEach((o) => H('option', { value: o }, sel, o));
      sel.value = cnd.op;
      sel.addEventListener('change', () => { cnd.op = sel.value; draw(); });
      const sl = slider(r, 'iv' + i, '', -5, 5, 1, cnd.v, (v) => { cnd.v = v; draw(); });
      return { sel, sl };
    });
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    btn(c, '随机换一组', () => {
      C.forEach((cnd, i) => {
        cnd.op = OPS[Math.floor(Math.random() * 4)];
        cnd.v = Math.floor(Math.random() * 11) - 5;
        ctlRows[i].sel.value = cnd.op; ctlRows[i].sl.set(cnd.v);
      });
      draw();
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '实心点：包含这个数（≥、≤）；空心圈：不包含（>、<）。');
    const isLo = (op) => op === '>' || op === '≥';
    const inc = (op) => op === '≥' || op === '≤';
    let stop = null;
    function drawRay(g, cnd, cls, y, t) {
      g.innerHTML = '';
      const xa = X(cnd.v), dir = isLo(cnd.op) ? 1 : -1;
      const xe = dir > 0 ? X(6.6) : X(-6.6);
      const xt = lerp(xa, xe, t);
      S('line', { x1: xa, x2: xa, y1: y, y2: yL, class: 'smuted dash thin' }, g);
      S('line', { x1: xa, x2: xt, y1: y, y2: y, class: cls + ' thick' }, g);
      S('path', { d: `M${xt + dir * 6},${y} l${-dir * 10},-6 v12 Z`, class: cls === 's1' ? 'f1' : 'f2' }, g);
      S('circle', { cx: xa, cy: y, r: 6, class: (inc(cnd.op) ? (cls === 's1' ? 'f1 ' : 'f2 ') : 'fsurf ') + cls }, g);
      T(g, xa, y - 14, `x ${cnd.op} ${fmt(cnd.v)}`, 'tb ' + (cls === 's1' ? 't1' : 't2'));
    }
    function solve() {
      let lo = null, loI = false, hi = null, hiI = false;
      C.forEach(({ op, v }) => {
        const i = inc(op);
        if (isLo(op)) { if (lo === null || v > lo || (v === lo && !i)) { lo = v; loI = i; } }
        else if (hi === null || v < hi || (v === hi && !i)) { hi = v; hiI = i; }
      });
      return { lo, loI, hi, hiI };
    }
    function draw() {
      if (stop) stop();
      const s = solve();
      band.innerHTML = ''; ends.innerHTML = '';
      const kinds = C.map((cnd) => isLo(cnd.op));
      let rule, txt, seg = null;
      if (kinds[0] && kinds[1]) { rule = '同大取大'; txt = `<i>x</i> ${s.loI ? '≥' : '&gt;'} ${fmt(s.lo)}`; seg = [s.lo, 6.6, s.loI, null]; }
      else if (!kinds[0] && !kinds[1]) { rule = '同小取小'; txt = `<i>x</i> ${s.hiI ? '≤' : '&lt;'} ${fmt(s.hi)}`; seg = [-6.6, s.hi, null, s.hiI]; }
      else if (s.lo < s.hi) { rule = '大小小大中间找'; txt = `${fmt(s.lo)} ${s.loI ? '≤' : '&lt;'} <i>x</i> ${s.hiI ? '≤' : '&lt;'} ${fmt(s.hi)}`; seg = [s.lo, s.hi, s.loI, s.hiI]; }
      else if (s.lo === s.hi && s.loI && s.hiI) { rule = '两个端点重合，而且都包含'; txt = `<i>x</i> = ${fmt(s.lo)}`; seg = [s.lo, s.lo, true, true]; }
      else if (s.lo === s.hi) { rule = '两个端点重合，但没有都包含这个数'; txt = '无解（没有公共部分）'; }
      else { rule = '大大小小找不到'; txt = '无解（没有公共部分）'; }
      const draws = (t) => {
        drawRay(rays[0], C[0], 's1', RY[0], t);
        drawRay(rays[1], C[1], 's2', RY[1], t);
      };
      stop = tween(450, draws, () => {
        stop = null;
        if (seg) {
          const xa = X(seg[0]), xb = X(seg[1]);
          const r = S('rect', { x: Math.min(xa, xb), y: yL - 7, width: Math.max(4, Math.abs(xb - xa)), height: 14, rx: 3, class: 'f3s', opacity: 0 }, band);
          tween(300, (t) => r.setAttribute('opacity', t));
          [[seg[0], seg[2]], [seg[1], seg[3]]].forEach(([v, i]) => {
            if (i === null || Math.abs(v) > 6.5) return;
            S('circle', { cx: X(v), cy: yL, r: 6, class: (i ? 'f3 ' : 'fsurf ') + 's3' }, ends);
          });
        }
      });
      read.innerHTML = `① <i>x</i> ${C[0].op.replace('>', '&gt;').replace('<', '&lt;')} ${fmt(C[0].v)}，② <i>x</i> ${C[1].op.replace('>', '&gt;').replace('<', '&lt;')} ${fmt(C[1].v)}。口诀：<b>${rule}</b>。<br>不等式组的解集：<b>${txt}</b>`;
    }
    draw();
  };

  // ════════════════════ 实数：两个小正方形拼成面积为 2 的大正方形 ════════════════════
  A.n_real_square = function (el) {
    const W = 460, Hh = 270, s = 90, CX = 345, CY = 135;
    const svg = stage(el, W, Hh);
    const AX = 26, BX = 136, SY = 88;
    const labs = S('g', {}, svg);
    T(labs, AX + s / 2, SY + s + 20, '1', 'tb');
    T(labs, BX + s / 2, SY + s + 20, '1', 'tb');
    T(labs, AX + s / 2, SY - 10, '面积 1', 'ts tm');
    T(labs, BX + s / 2, SY - 10, '面积 1', 'ts tm');
    const tris = [];
    // [颜色, 起点(直角顶点), 起始角, 目标角]
    const DEF = [
      ['f1s', [AX + s, SY], 90, 90],
      ['f1s', [AX, SY + s], -90, -90],
      ['f3s', [BX + s, SY], 90, 180],
      ['f3s', [BX, SY + s], -90, 0]
    ];
    DEF.forEach(([cls]) => {
      const g = S('g', {}, svg);
      S('polygon', { points: `0,0 ${s},0 0,${s}`, class: cls + ' sstrong thin' }, g);
      S('line', { x1: s, y1: 0, x2: 0, y2: s, class: 's2 thick round' }, g);
      tris.push(g);
    });
    const guess = S('polygon', { class: 'fnone s1 dash', opacity: 0 }, svg);
    const info = S('g', { opacity: 0 }, svg);
    T(info, CX, CY + 6, '面积 = 2', 'tl tb');
    T(info, CX + s / 2 + 26, CY - s / 2 - 14, '边长 = ?', 'tb t2');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let st = 0, busy = false, g0 = 1.4;
    const mainBtn = btn(c, '沿对角线剪开，拼成大正方形', () => {
      if (busy) return;
      busy = true;
      const from = st, to = st ? 0 : 1;
      if (to === 0) { info.setAttribute('opacity', 0); guess.setAttribute('opacity', 0); }
      tween(1400, (t) => { st = lerp(from, to, t); render(); }, () => {
        busy = false;
        mainBtn.textContent = to ? '拆开，放回原样' : '沿对角线剪开，拼成大正方形';
        if (to) { info.setAttribute('opacity', 1); guess.setAttribute('opacity', 1); showGuess(); }
        else read.innerHTML = '两个边长为 1 的小正方形，面积一共是 2。橙色的线是对角线。';
      });
    });
    const c2 = ctrl(el);
    slider(c2, 'rg', '猜边长', 1, 2, 0.01, g0, (v) => { g0 = v; if (st === 1) showGuess(); });
    function render() {
      DEF.forEach(([, p0, a0, a1], i) => {
        const x = lerp(p0[0], CX, st), y = lerp(p0[1], CY, st), a = lerp(a0, a1, st);
        tris[i].setAttribute('transform', `translate(${x},${y}) rotate(${a})`);
      });
      labs.setAttribute('opacity', 1 - st);
    }
    function showGuess() {
      const h = (g0 * s) / Math.SQRT2;
      guess.setAttribute('points', `${CX + h},${CY} ${CX},${CY - h} ${CX - h},${CY} ${CX},${CY + h}`);
      const sq = Math.round(g0 * g0 * 10000) / 10000;
      const cmp = Math.abs(sq - 2) < 1e-9 ? '=' : sq < 2 ? '&lt;' : '&gt;';
      read.innerHTML = `4 块三角形正好拼成一个大正方形，面积还是 <b>2</b>，它的边就是小正方形的对角线（橙色）。<br>猜边长 <i>a</i> = <b>${g0.toFixed(2)}</b>：<i>a</i><sup>2</sup> = ${sq} ${cmp} 2，蓝色虚线框${sq < 2 ? '比大正方形小' : '比大正方形大'}。` +
        '<br>怎么调都不可能正好等于 2——边长是一个新的数，记作 <b>√2</b> ≈ 1.414。';
    }
    render();
    read.innerHTML = '两个边长为 1 的小正方形，面积一共是 2。橙色的线是对角线。能把它们拼成一个大正方形吗？';
  };

  // ════════════════════ 实数：用圆规画出 √2，并逐步放大 ════════════════════
  A.n_real_zoom = function (el) {
    const W = 480, Hh = 300, O = 60, u = 120, yL = 170, ZL = 40, ZR = 440, ZY = 262;
    const svg = stage(el, W, Hh);
    const X = (v) => O + v * u;
    const R2 = Math.SQRT2;
    S('line', { x1: X(-0.2), x2: X(3.1), y1: yL, y2: yL, class: 'stroke-strong' }, svg);
    S('path', { d: `M${X(3.1) + 8},${yL} l-10,-5 v10 Z`, class: 'fill-strong' }, svg);
    for (let v = 0; v <= 3; v++) {
      S('line', { x1: X(v), x2: X(v), y1: yL - 6, y2: yL + 6, class: 'stroke-strong' }, svg);
      T(svg, X(v), yL + 22, String(v), v === 0 ? 'tick lg strong' : 'tick lg');
    }
    S('rect', { x: X(0), y: yL - u, width: u, height: u, class: 'f1s s1' }, svg);
    T(svg, X(0.5), yL - u - 8, '1', 'tb t1');
    T(svg, X(1) + 10, yL - u / 2, '1', 'tb t1', 'start');
    S('line', { x1: X(0), y1: yL, x2: X(1), y2: yL - u, class: 's2 thick round' }, svg);
    T(svg, X(0.42), yL - u * 0.58, '√2', 'tb t2', 'end');
    const arc = S('path', { class: 'fnone s2 dash' }, svg);
    const arm = S('line', { x1: X(0), y1: yL, x2: X(1), y2: yL - u, class: 'smuted', opacity: 0 }, svg);
    const mk = S('g', { opacity: 0 }, svg);
    S('circle', { cx: X(R2), cy: yL, r: 6, class: 'f2' }, mk);
    T(mk, X(R2), yL + 40, '√2', 'tb t2');
    const zoom = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const AK = [1, 14, 141, 1414, 14142];
    let drawn = false, lvl = 0, busy = false;
    btn(c, '用圆规画出 √2', () => compass());
    const zBtn = btn(c, '放大一层', () => zoomIn());
    btn(c, '重来', () => { if (!busy) reset(); }, 'alt');
    const dec = (n, k) => (n / Math.pow(10, k)).toFixed(k);
    function sqStr(n, k) {
      let s = String(n * n);
      while (s.length < 2 * k + 1) s = '0' + s;
      s = s.slice(0, s.length - 2 * k) + '.' + s.slice(s.length - 2 * k);
      return s.replace(/0+$/, '').replace(/\.$/, '');
    }
    function compass(done) {
      if (busy || drawn) { if (done) done(); return; }
      busy = true;
      arm.setAttribute('opacity', 1);
      const R = R2 * u;
      tween(1200, (t) => {
        const ang = lerp(-PI / 4, 0, t);
        const ex = X(0) + R * Math.cos(ang), ey = yL + R * Math.sin(ang);
        arm.setAttribute('x2', ex); arm.setAttribute('y2', ey);
        arc.setAttribute('d', `M${X(1)},${yL - u} A${R},${R} 0 0 1 ${ex},${ey}`);
      }, () => {
        drawn = true; busy = false;
        mk.setAttribute('opacity', 1);
        read.innerHTML = '以原点为圆心、对角线长为半径画弧，和数轴交于一点，这个点表示的数就是 <b>√2</b>。它在 1 和 2 之间。点“放大一层”看得更细。';
        zBtn.disabled = false;
        if (done) done();
      });
    }
    function zoomIn() {
      if (busy) return;
      if (!drawn) { compass(() => zoomIn()); return; }
      if (lvl >= 4) return;
      lvl++;
      const k = lvl, lo = AK[k - 1] / Math.pow(10, k - 1), w = 1 / Math.pow(10, k - 1);
      const Z = (v) => ZL + ((v - lo) / w) * (ZR - ZL);
      zoom.innerHTML = '';
      const g = S('g', { opacity: 0 }, zoom);
      S('line', { x1: X(lo), y1: yL + 6, x2: ZL, y2: ZY - 8, class: 'smuted dash thin' }, g);
      S('line', { x1: X(lo + w), y1: yL + 6, x2: ZR, y2: ZY - 8, class: 'smuted dash thin' }, g);
      const a = AK[k], b = a + 1;
      S('rect', { x: Z(a / Math.pow(10, k)), y: ZY - 7, width: (ZR - ZL) / 10, height: 14, class: 'f3s' }, g);
      S('line', { x1: ZL, x2: ZR, y1: ZY, y2: ZY, class: 'stroke-strong' }, g);
      for (let i = 0; i <= 10; i++) {
        const n = AK[k - 1] * 10 + i;
        S('line', { x1: Z(n / Math.pow(10, k)), x2: Z(n / Math.pow(10, k)), y1: ZY - 5, y2: ZY + 5, class: 'stroke-strong thin' }, g);
        const showLab = k >= 3 ? i === 0 || i === 10 || n === a : true;
        if (showLab) T(g, Z(n / Math.pow(10, k)), ZY + 20, dec(n, k), 'tick' + (n === a || n === b ? ' strong' : ''));
      }
      S('circle', { cx: Z(R2), cy: ZY, r: 5, class: 'f2' }, g);
      T(g, Z(R2), ZY - 12, '√2', 'tb t2');
      tween(500, (t) => g.setAttribute('opacity', t));
      read.innerHTML = `把 ${dec(AK[k - 1], k - 1)} 到 ${dec(AK[k - 1] + 1, k - 1)} 这一段放大，平均分成 10 份：<br>${dec(a, k)}<sup>2</sup> = ${sqStr(a, k)} &lt; 2，${dec(b, k)}<sup>2</sup> = ${sqStr(b, k)} &gt; 2，所以 <b>${dec(a, k)} &lt; √2 &lt; ${dec(b, k)}</b>。` +
        (k === 4 ? '<br>√2 = 1.41421356…，小数点后面的数字无穷无尽，而且不循环，所以 √2 是<b>无理数</b>。' : '');
      if (k === 4) zBtn.disabled = true;
    }
    function reset() {
      drawn = false; lvl = 0;
      zoom.innerHTML = '';
      arc.setAttribute('d', '');
      arm.setAttribute('opacity', 0);
      mk.setAttribute('opacity', 0);
      zBtn.disabled = false;
      read.innerHTML = '边长为 1 的正方形，对角线（橙色）长 √2——上一节拼成的大正方形，边正是这条对角线。怎样在数轴上找到 √2？';
    }
    reset();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
