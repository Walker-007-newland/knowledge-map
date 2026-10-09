// 小学 数与代数（一）：乘除法、小数初步、大数、运算律、小数的意义、因数与倍数、用字母表示数
(function () {
  const { S, H, T, tween, lerp, stage, ctrl, btn, slider, svgPoint, RM } = window.AH;
  const A = {};
  const fr = (a, b) => window.fr(a, b);
  const tr = (x, y) => `translate(${x},${y})`;

  // 让一个 SVG 元素可以点击（也能用键盘）
  function tap(e, fn) {
    e.setAttribute('tabindex', 0);
    e.setAttribute('role', 'button');
    e.classList.add('clickable');
    e.addEventListener('click', fn);
    e.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(); }
    });
  }
  // 一段文字里混排不同样式：parts = [[文字, class], ...]
  function TT(parent, x, y, parts, cls, anchor) {
    const t = S('text', { x, y, class: cls || '', 'text-anchor': anchor || 'middle' }, parent);
    parts.forEach(([s, c]) => {
      const sp = S('tspan', c ? { class: c } : {}, t);
      sp.textContent = s;
    });
    return t;
  }

  // 中文读数（0 ～ 999999999）
  const CN = '零一二三四五六七八九';
  function cnRead(n) {
    if (n === 0) return '零';
    const s = String(n), U = ['', '十', '百', '千'], G = ['', '万', '亿'];
    let out = '', zero = false, groupHas = false;
    for (let i = 0; i < s.length; i++) {
      const d = +s[i], pos = s.length - 1 - i, r = pos % 4, gi = Math.floor(pos / 4);
      if (d === 0) zero = true;
      else {
        if (zero && out) out += '零';
        zero = false;
        out += (d === 1 && r === 1 && out === '' ? '' : CN[d]) + U[r];
        groupHas = true;
      }
      if (r === 0 && gi > 0) {
        if (groupHas) out += G[gi];
        groupHas = false;
        zero = false; // 每级末尾的 0 不读
      }
    }
    return out;
  }

  // ───────────── 乘法：面积模型拆分 ─────────────
  A.n_mul_area = function (el) {
    const W = 460, Hh = 320, x0 = 52, y0 = 40;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 23, b = 12, sp = 0, hl = 0, busy = false;
    slider(c, 'mula', '每行', 11, 39, 1, a, (v) => { a = v; hl = 0; draw(); });
    slider(c, 'mulb', '行数', 11, 29, 1, b, (v) => { b = v; hl = 0; draw(); });
    const c2 = ctrl(el);
    const splitBtn = btn(c2, '拆开', () => {
      if (busy) return;
      busy = true;
      hl = 0;
      const from = sp, to = sp > 0.5 ? 0 : 1;
      tween(900, (t) => { sp = lerp(from, to, t); draw(); }, () => {
        sp = to; busy = false;
        splitBtn.textContent = to ? '合起来' : '拆开';
        draw();
      });
    });
    const vBtn = btn(c2, '竖式第一步', () => {
      if (busy) return;
      hl = hl >= 3 ? 1 : hl + 1;
      if (hl === 1 && b % 10 === 0) hl = 2;
      draw();
    }, 'alt');

    function draw() {
      g.innerHTML = '';
      const at = a - (a % 10), ao = a % 10, bt = b - (b % 10), bo = b % 10;
      const gap = 18 * sp;
      const u = Math.min((W - x0 - 30) / a, (Hh - y0 - 40) / b);
      const cols = [[0, at], [at, ao]], rows = [[0, bt], [bt, bo]];
      const cls = [['f1s', 'f3s'], ['f2s', 'fsurf2']];
      cols.forEach(([c0, n], i) => {
        if (!n) return;
        const x = x0 + c0 * u + i * gap;
        T(g, x + (n * u) / 2, y0 - 12, String(n), 'tb');
      });
      rows.forEach(([r0, m], j) => {
        if (!m) return;
        const y = y0 + r0 * u + j * gap;
        T(g, x0 - 10, y + (m * u) / 2 + 5, String(m), 'tb', 'end');
      });
      const labs = [];
      rows.forEach(([r0, m], j) => cols.forEach(([c0, n], i) => {
        if (!n || !m) return;
        const x = x0 + c0 * u + i * gap, y = y0 + r0 * u + j * gap, w = n * u, h = m * u;
        const on = hl === 0 || hl === 3 || (hl === 1 && j === 1) || (hl === 2 && j === 0);
        const pg = S('g', { opacity: on ? 1 : 0.22 }, g);
        S('rect', { x, y, width: w, height: h, class: cls[j][i] + ' sstrong' }, pg);
        for (let k = 1; k < n; k++) S('line', { x1: x + k * u, x2: x + k * u, y1: y, y2: y + h, class: 'cell' }, pg);
        for (let k = 1; k < m; k++) S('line', { x1: x, x2: x + w, y1: y + k * u, y2: y + k * u, class: 'cell' }, pg);
        if (w >= 18 && h >= 16) labs.push([x + w / 2, y + h / 2, w > 100 && h > 26 ? `${n}×${m}=${n * m}` : String(n * m), on]);
      }));
      const lg = S('g', { opacity: Math.max(0, (sp - 0.5) * 2) }, g);
      labs.forEach(([x, y, txt, on]) => {
        const tw = txt.length * 8 + 10;
        const lab = S('g', { opacity: on ? 1 : 0.3 }, lg);
        S('rect', { x: x - tw / 2, y: y - 11, width: tw, height: 21, rx: 5, class: 'fsurf' }, lab);
        T(lab, x, y + 5, txt, 'tb');
      });

      const parts = [];
      rows.forEach(([, m]) => cols.forEach(([, n]) => { if (n && m) parts.push([n, m]); }));
      const splitA = ao ? `${a} = ${at} + ${ao}` : `${a} 是整十数`;
      const splitB = bo ? `${b} = ${bt} + ${bo}` : `${b} 是整十数`;
      let s;
      if (hl === 1) s = `竖式第一步：先算 ${a} × ${bo} = <span class="k2">${a * bo}</span>，就是下面亮着的 ${bo} 行。`;
      else if (hl === 2) s = `竖式第二步：再算 ${a} × ${bt} = <span class="k1">${a * bt}</span>，就是上面亮着的 ${bt} 行。竖式里这一行末尾的 0 通常不写，所以 ${a * bt / 10} 要从<b>十位</b>开始写。`;
      else if (hl === 3) s = `两步合起来：${bo ? `${a * bo} + ${a * bt} = ` : ''}<b>${a * b}</b>。所以 ${a} × ${b} = <b>${a * b}</b>。`;
      else if (sp < 0.5) s = `${b} 行，每行 ${a} 个小方格，一共有 ${a} × ${b} 个。一个一个数太慢啦！点“拆开”：${splitA}，${splitB}。`;
      else s = `拆成 ${parts.length} 块，每块都好算：${parts.map(([n, m]) => `${n} × ${m} = ${n * m}`).join('，')}。<br>合起来：${parts.map(([n, m]) => n * m).join(' + ')} = <b>${a * b}</b>`;
      read.innerHTML = s;
      vBtn.textContent = ['竖式第一步', '竖式第二步', '合起来', '竖式第一步'][hl];
    }
    draw();
  };

  // ───────────── 除法：分小棒 ─────────────
  A.n_mul_share = function (el) {
    const W = 460, Hh = 300;
    const svg = stage(el, W, Hh);
    T(svg, 14, 15, '要分的小棒（一捆是 10 根）', 'note', 'start');
    S('line', { x1: 10, x2: W - 10, y1: 132, y2: 132, class: 'sline dash' }, svg);
    const plateG = S('g', {}, svg), itemG = S('g', {}, svg);
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let N = 52, d = 4, step = 0, busy = false, gen = 0, tens = [], ones = [];
    slider(c, 'dvn', '被除数', 12, 99, 1, N, (v) => { N = v; reset(); });
    slider(c, 'dvd', '除数', 2, 9, 1, d, (v) => { d = v; reset(); });
    const c2 = ctrl(el);
    const nextBtn = btn(c2, '下一步', () => next());
    btn(c2, '重来', () => reset(), 'alt');

    const pw = () => (W - 20) / d;
    const pileTen = (i) => [16 + i * 18, 24];
    const pileOne = (i) => [196 + (i % 25) * 10, 22 + Math.floor(i / 25) * 27];
    const plateTen = (j, k) => [10 + j * pw() + 8 + k * 16, 150];
    const plateOne = (j, k) => [10 + j * pw() + 6 + (k % 5) * 8, 204 + Math.floor(k / 5) * 30];

    function mk(type, x, y) {
      const e = S('g', { transform: tr(x, y) }, itemG);
      if (type === 'ten') {
        S('rect', { x: 0, y: 0, width: 12, height: 44, rx: 2, class: 'f2s s2' }, e);
        S('rect', { x: -2, y: 18, width: 16, height: 6, rx: 2, class: 'f2' }, e);
      } else {
        S('rect', { x: 0, y: 0, width: 4, height: 22, rx: 2, class: 'f3' }, e);
      }
      return { e, x, y };
    }
    // list: [[物品, 目标x, 目标y], ...]
    function move(list, ms, done) {
      const my = gen;
      const from = list.map(([it]) => [it.x, it.y]);
      tween(ms, (t) => {
        if (my !== gen) return;
        list.forEach(([it, x, y], i) => {
          it.e.setAttribute('transform', tr(lerp(from[i][0], x, t), lerp(from[i][1], y, t) - 30 * Math.sin(Math.PI * t)));
        });
      }, () => {
        if (my !== gen) return;
        list.forEach(([it, x, y]) => { it.x = x; it.y = y; it.e.setAttribute('transform', tr(x, y)); });
        if (done) done();
      });
    }
    function reset() {
      gen++; busy = false; step = 0;
      plateG.innerHTML = ''; itemG.innerHTML = '';
      const p = pw();
      for (let j = 0; j < d; j++) {
        S('rect', { x: 10 + j * p + 3, y: 142, width: p - 6, height: 126, rx: 10, class: 'fsurf2 sline' }, plateG);
        T(plateG, 10 + j * p + p / 2, 288, `第${j + 1}份`, 'ts tm');
      }
      const nt = Math.floor(N / 10), no = N % 10;
      tens = []; ones = [];
      for (let i = 0; i < nt; i++) tens.push(mk('ten', ...pileTen(i)));
      for (let i = 0; i < no; i++) ones.push(mk('one', ...pileOne(i)));
      nextBtn.disabled = false;
      nextBtn.textContent = '第 1 步：分整捆';
      cap.textContent = `${N} ÷ ${d}：把 ${N} 根小棒平均分成 ${d} 份`;
      read.innerHTML = `${N} 是 ${nt} 个十和 ${no} 个一，也就是 ${nt} 捆和 ${no} 根。先分整捆的，点“第 1 步”。`;
    }
    function next() {
      if (busy || step >= 3) return;
      const nt = Math.floor(N / 10), no = N % 10;
      const q1 = Math.floor(nt / d), r1 = nt % d;
      const s = r1 * 10 + no, q2 = Math.floor(s / d), r2 = s % d;
      busy = true;
      if (step === 0) {
        const list = [];
        for (let k = 0; k < q1 * d; k++) list.push([tens[k], ...plateTen(k % d, Math.floor(k / d))]);
        move(list, 1000, () => {
          busy = false; step = 1;
          nextBtn.textContent = r1 ? '第 2 步：拆开剩下的捆' : '第 2 步：看看剩下的';
          cap.textContent = `第 1 步：分整捆　${nt} ÷ ${d} = ${q1}${r1 ? '……' + r1 : ''}`;
          read.innerHTML = q1
            ? `${nt} 捆平均分成 ${d} 份，每份 <b>${q1}</b> 捆（${q1 * 10} 根）${r1 ? `，还剩 <b>${r1}</b> 捆` : '，正好分完'}。竖式里：商的<b>十位</b>写 ${q1}。`
            : `${nt} 捆不够分成 ${d} 份，每份先分 0 捆，商的十位不写。要把整捆拆开再分。`;
        });
      } else if (step === 1) {
        const left = tens.slice(q1 * d);
        const fresh = [];
        left.forEach((tn) => { for (let k = 0; k < 10; k++) fresh.push(mk('one', tn.x + 4, tn.y + 11)); });
        const my = gen;
        tween(500, (t) => { if (my === gen) left.forEach((tn) => tn.e.setAttribute('opacity', 1 - t)); });
        move(fresh.map((it, i) => [it, ...pileOne(no + i)]), 1000, () => {
          left.forEach((tn) => tn.e.remove());
          ones = ones.concat(fresh);
          busy = false; step = 2;
          nextBtn.textContent = '第 3 步：分单根';
          cap.textContent = r1 ? `第 2 步：拆开　${r1} 个十和 ${no} 个一合成 ${s}` : '第 2 步：整捆正好分完';
          read.innerHTML = r1
            ? `剩下的 ${r1} 捆拆开，变成 ${r1 * 10} 根，和原来的 ${no} 根合起来是 <b>${s}</b> 根。竖式里：余下的 ${r1} 和落下来的 ${no} 合成 ${s}。`
            : `整捆正好分完，不用拆。接下来分剩下的 ${no} 根。`;
        });
      } else {
        const list = [];
        for (let k = 0; k < q2 * d; k++) list.push([ones[k], ...plateOne(k % d, Math.floor(k / d))]);
        move(list, 1000, () => {
          busy = false; step = 3;
          nextBtn.disabled = true;
          nextBtn.textContent = '分完了';
          const Q = q1 * 10 + q2;
          cap.textContent = `第 3 步：分单根　${s} ÷ ${d} = ${q2}${r2 ? '……' + r2 : ''}`;
          read.innerHTML = `${s} 根平均分成 ${d} 份，每份 <b>${q2}</b> 根${r2 ? `，还剩 <b>${r2}</b> 根不够再分` : ''}。商的<b>个位</b>写 ${q2}。<br>每份是 ${q1} 捆和 ${q2} 根，也就是 ${Q} 根：<b>${N} ÷ ${d} = ${Q}${r2 ? '……' + r2 : ''}</b>`;
        });
      }
    }
    reset();
  };

  // ───────────── 小数初步：米尺 ─────────────
  A.n_dec0_meter = function (el) {
    const W = 460, Hh = 215, x0 = 40, L = 380, seg = L / 10, y = 70, h = 46;
    const svg = stage(el, W, Hh);
    T(svg, W / 2, 22, '1 米长的尺子，平均分成 10 份，每份是 1 分米', 'note');
    const fill = S('rect', { x: x0, y, width: 0, height: h, class: 'f2s' }, svg);
    const mLab = [];
    for (let i = 0; i <= 10; i++) {
      const x = x0 + i * seg;
      S('line', { x1: x, x2: x, y1: y, y2: y + h, class: i % 10 ? 'smuted' : 'sstrong' }, svg);
      mLab.push(T(svg, x, y - 8, i === 0 ? '0' : i === 10 ? '1' : '0.' + i, 'ts t1'));
      T(svg, x, y + h + 18, String(i), 'ts tm');
    }
    S('rect', { x: x0, y, width: L, height: h, class: 'fnone sstrong' }, svg);
    const brk = S('path', { class: 'fnone s2' }, svg);
    const brkT = T(svg, 0, y + h + 58, '', 'tb t2');
    T(svg, W / 2, Hh - 4, '上面的数以“米”为单位，下面的数以“分米”为单位', 'ts tm');
    let k = 3, shown = 3, busy = false, gen = 0;
    for (let i = 0; i < 10; i++) {
      const hit = S('rect', { x: x0 + i * seg, y, width: seg, height: h, class: 'fsurf', style: 'fill-opacity: 0' }, svg);
      tap(hit, () => { if (!busy) go(k === i + 1 ? i : i + 1); });
    }
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    btn(c, '− 1 格', () => { if (!busy && k > 0) go(k - 1); });
    btn(c, '+ 1 格', () => { if (!busy && k < 10) go(k + 1); });
    btn(c, '一格一格数', () => {
      if (busy) return;
      const my = ++gen;
      busy = true;
      k = 0; render(0);
      const nxt = () => {
        if (my !== gen) return;
        if (k >= 10) { busy = false; return; }
        k++;
        tween(350, (t) => { if (my === gen) render(lerp(k - 1, k, t)); }, () => setTimeout(nxt, RM ? 0 : 450));
      };
      setTimeout(nxt, RM ? 0 : 300);
    }, 'alt');

    function go(to) {
      const from = shown;
      k = to;
      busy = true;
      tween(400, (t) => render(lerp(from, to, t)), () => { busy = false; render(to); });
    }
    function render(v) {
      shown = v;
      fill.setAttribute('width', v * seg);
      const kk = Math.round(v);
      mLab.forEach((t, i) => t.setAttribute('class', i === kk ? 'tb t1' : 'ts t1'));
      if (v > 0.05) {
        const xe = x0 + v * seg, yb = y + h + 30;
        brk.setAttribute('d', `M${x0},${yb - 6} v6 H${xe} v-6`);
        brkT.setAttribute('x', (x0 + xe) / 2);
        brkT.textContent = kk === 10 ? '10 分米 = 1 米' : `${kk} 分米 = 0.${kk} 米`;
      } else { brk.setAttribute('d', ''); brkT.textContent = ''; }
      if (kk === 0) read.innerHTML = '还没有涂色。点尺子上的格子，或者按“+ 1 格”。';
      else if (kk === 10) read.innerHTML = '涂满了 10 格：10 分米 = <b>1 米</b>。10 个 0.1 米就是 1 米。';
      else read.innerHTML = `涂了 <b>${kk}</b> 格，就是 ${kk} 分米。1 分米是 1 米的 ${fr(1, 10)}，${kk} 分米就是 ${fr(kk, 10)} 米，写成小数是 <b>0.${kk}</b> 米，读作“零点${CN[kk]}”。`;
    }
    render(k);
  };

  // ───────────── 小数初步：元和角 ─────────────
  A.n_dec0_money = function (el) {
    const W = 460, Hh = 250;
    const svg = stage(el, W, Hh);
    T(svg, 14, 22, '元', 'tb', 'start');
    T(svg, 14, 164, '角', 'tb', 'start');
    S('line', { x1: 10, x2: 300, y1: 138, y2: 138, class: 'sline dash' }, svg);
    const coinG = S('g', {}, svg);
    const big = T(svg, 380, 112, '', 'txl');
    const small = T(svg, 380, 146, '', 'tm');
    T(svg, 380, 60, '一共有', 'note');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let yuan = 3, jiao = 5, busy = false, gen = 0, jc = [];
    const yPos = (i) => [62 + (i % 5) * 50, 50 + Math.floor(i / 5) * 50];
    const jPos = (i) => [58 + (i % 5) * 46, 175 + Math.floor(i / 5) * 40];

    function coin(x, y, kind) {
      const g = S('g', { transform: tr(x, y) }, coinG);
      if (kind === 'y') {
        S('circle', { r: 22, class: 'coin' }, g);
        T(g, 0, 5, '1元', 'tb');
      } else {
        S('circle', { r: 16, class: 'f3s s3' }, g);
        T(g, 0, 4, '1角', 'ts tb');
      }
      return g;
    }
    function draw() {
      coinG.innerHTML = '';
      for (let i = 0; i < yuan; i++) coin(...yPos(i), 'y');
      jc = [];
      for (let i = 0; i < jiao; i++) jc.push(coin(...jPos(i), 'j'));
      if (jiao >= 10) return;
      big.textContent = jiao ? `${yuan}.${jiao} 元` : `${yuan} 元`;
      small.textContent = `${yuan} 元 ${jiao} 角`;
      if (yuan === 0 && jiao === 0) read.innerHTML = '钱包空了。点“+ 1 角”或“+ 1 元”放钱进去。';
      else if (jiao === 0) read.innerHTML = `${yuan} 元整，没有角。再放几角试试。`;
      else read.innerHTML = `${yuan} 元 ${jiao} 角 = <b>${yuan}.${jiao}</b> 元。1 角是 1 元的 ${fr(1, 10)}，写成 0.1 元；${jiao} 角就是 0.${jiao} 元。小数点左边是整元，右边是几角。` + (yuan === 0 ? '不满 1 元，小数点左边要写 0。' : '');
    }
    function addJiao() {
      if (busy) return;
      if (yuan >= 10) { read.innerHTML = '钱包装满啦，先拿走一些吧。'; return; }
      jiao++;
      draw();
      if (jiao < 10) return;
      busy = true;
      const my = gen;
      big.textContent = '10 角 = 1 元';
      small.textContent = '';
      read.innerHTML = '凑够 10 角了！<b>10 角 = 1 元</b>，换成 1 个 1 元硬币。';
      const [tx, ty] = yPos(yuan);
      const from = jc.map((_, i) => jPos(i));
      setTimeout(() => tween(900, (t) => {
        if (my !== gen) return;
        jc.forEach((cg, i) => {
          cg.setAttribute('transform', tr(lerp(from[i][0], tx, t), lerp(from[i][1], ty, t)));
          cg.setAttribute('opacity', 1 - 0.7 * t);
        });
      }, () => {
        if (my !== gen) return;
        yuan++; jiao = 0; busy = false;
        draw();
      }), RM ? 0 : 500);
    }
    btn(c, '+ 1 元', () => {
      if (busy) return;
      if (yuan >= 9) { read.innerHTML = '元的位置放满啦，先拿走一些吧。'; return; }
      yuan++; draw();
    });
    btn(c, '+ 1 角', addJiao);
    btn(c, '− 1 元', () => { if (!busy && yuan > 0) { yuan--; draw(); } }, 'alt');
    btn(c, '− 1 角', () => { if (!busy && jiao > 0) { jiao--; draw(); } }, 'alt');
    btn(c, '清空', () => { gen++; busy = false; yuan = 0; jiao = 0; draw(); }, 'alt');
    draw();
  };

  // ───────────── 大数：计数器 ─────────────
  A.n_bigint_abacus = function (el) {
    const W = 460, Hh = 300, yB = 196;
    const svg = stage(el, W, Hh);
    const NAMES = ['亿', '千万', '百万', '十万', '万', '千', '百', '十', '个'];
    const X = (i) => 38 + i * 48;
    const groupCls = (i) => (i === 0 ? 'f3' : i <= 4 ? 'f2' : 'f1');
    const unit = (i) => (i === 8 ? '一' : NAMES[i]);
    [[0, 0, '亿级', 't3'], [1, 4, '万级', 't2'], [5, 8, '个级', 't1']].forEach(([i0, i1, nm, cl]) => {
      S('path', { d: `M${X(i0) - 20},40 v-8 H${X(i1) + 20} v8`, class: 'fnone smuted' }, svg);
      T(svg, (X(i0) + X(i1)) / 2, 22, nm, 'ts tb ' + cl);
    });
    for (let i = 0; i < 9; i++) S('line', { x1: X(i), x2: X(i), y1: 46, y2: yB, class: 'smuted' }, svg);
    S('rect', { x: 12, y: yB, width: W - 24, height: 8, rx: 3, class: 'fstrong' }, svg);
    const rodG = [];
    for (let i = 0; i < 9; i++) rodG.push(S('g', {}, svg));
    NAMES.forEach((nm, i) => T(svg, X(i), yB + 26, nm, 'ts'));
    const read = H('p', { class: 'anim-read' }, el);
    let digits = [0, 0, 0, 3, 0, 0, 5, 0, 0], busy = false, msg = '';
    NAMES.forEach((nm, i) => {
      [['+', 248, () => add(i)], ['−', 280, () => sub(i)]].forEach(([s, y, fn]) => {
        const b = S('g', {}, svg);
        S('circle', { cx: X(i), cy: y, r: 13, class: 'fsurf s1' }, b);
        T(b, X(i), y + 5, s, 'tb t1');
        b.setAttribute('aria-label', `${nm}位${s === '+' ? '加' : '减'}一颗珠子`);
        tap(b, fn);
      });
    });
    const c = ctrl(el);
    btn(c, '随机拨一个数', () => {
      if (busy) return;
      const len = 5 + Math.floor(Math.random() * 5);
      digits = digits.map((_, i) => {
        const pos = 8 - i;
        if (pos >= len) return 0;
        if (pos === len - 1) return 1 + Math.floor(Math.random() * 9);
        return Math.random() < 0.4 ? 0 : 1 + Math.floor(Math.random() * 9);
      });
      msg = '先自己试着读一读，再看下面的答案。';
      drawAll();
    });
    btn(c, '拨 99999，再加 1', () => {
      if (busy) return;
      digits = [0, 0, 0, 0, 9, 9, 9, 9, 9];
      msg = '看好了，个位再加 1 颗珠子……';
      drawAll();
      busy = true;
      setTimeout(() => { busy = false; add(8); }, RM ? 0 : 900);
    }, 'alt');
    btn(c, '清零', () => { if (busy) return; digits = digits.map(() => 0); msg = ''; drawAll(); }, 'alt');

    const val = () => digits.reduce((s, d) => s * 10 + Math.min(d, 9), 0);
    function drawRod(i) {
      const g = rodG[i];
      g.innerHTML = '';
      for (let k = 0; k < digits[i]; k++) {
        S('ellipse', { cx: X(i), cy: yB - 8 - k * 15, rx: 18, ry: 7, class: groupCls(i) + ' sline' }, g);
      }
    }
    function drawAll() { for (let i = 0; i < 9; i++) drawRod(i); say(); }
    function say() {
      const n = val(), s = String(n);
      const ge = s.slice(-4), wan = s.length > 4 ? s.slice(-8, -4) : '', yi = s.length > 8 ? s.slice(0, -8) : '';
      const grp = (yi ? `<span class="k3">${yi}</span> ` : '') + (wan ? `<span class="k2">${wan}</span> ` : '') + `<span class="k1">${ge}</span>`;
      read.innerHTML = (msg ? msg + '<br>' : '') +
        `写作：<b>${n}</b>　读作：<b>${cnRead(n)}</b><br>分级看：${grp}（从右往左每 4 位一级，先读亿级，再读万级，最后读个级）`;
    }
    function add(i) {
      if (busy) return;
      if (val() + Math.pow(10, 8 - i) > 999999999) { msg = '再加就超过这个计数器能表示的数啦。'; say(); return; }
      busy = true;
      msg = '';
      addAt(i, () => { busy = false; say(); });
    }
    function addAt(i, done) {
      digits[i]++;
      drawRod(i);
      if (digits[i] < 10) { done(); return; }
      msg = `${NAMES[i]}位满十了！10 个${unit(i)}是 1 个${unit(i - 1)}，<b>向${NAMES[i - 1]}位进一</b>。`;
      read.innerHTML = msg;
      const g = rodG[i];
      setTimeout(() => tween(600, (t) => {
        g.setAttribute('opacity', 1 - t);
        g.setAttribute('transform', tr(0, -24 * t));
      }, () => {
        digits[i] = 0;
        g.setAttribute('opacity', 1);
        g.setAttribute('transform', '');
        drawRod(i);
        addAt(i - 1, done);
      }), RM ? 0 : 400);
    }
    function sub(i) {
      if (busy) return;
      if (!digits[i]) { msg = `${NAMES[i]}位上已经没有珠子了。`; say(); return; }
      digits[i]--;
      msg = '';
      drawRod(i);
      say();
    }
    H('p', { class: 'anim-tip' }, el, '提示：点每一位下面的 + 和 − 拨珠子。一颗珠子在哪一位，就表示 1 个什么。');
    drawAll();
  };

  // ───────────── 大数：四舍五入求近似数 ─────────────
  A.n_bigint_round = function (el) {
    const W = 460, Hh = 190, x0 = 40, x1 = 420, yL = 100;
    const svg = stage(el, W, Hh);
    const X = (k) => x0 + (k * (x1 - x0)) / 100;
    S('rect', { x: X(0), y: yL - 16, width: X(50) - X(0), height: 16, class: 'f1s' }, svg);
    S('rect', { x: X(50), y: yL - 16, width: X(100) - X(50), height: 16, class: 'f2s' }, svg);
    S('line', { x1: x0 - 10, x2: x1 + 10, y1: yL, y2: yL, class: 'sstrong' }, svg);
    for (let k = 0; k <= 100; k += 10) {
      const big = k % 50 === 0;
      S('line', { x1: X(k), x2: X(k), y1: yL - (big ? 10 : 5), y2: yL + (big ? 10 : 5), class: big ? 'sstrong' : 'smuted' }, svg);
    }
    const lab0 = T(svg, X(0), yL + 28, '', 'ts'), lab5 = T(svg, X(50), yL + 28, '', 'ts tm'), lab1 = T(svg, X(100), yL + 28, '', 'ts');
    const wan0 = T(svg, X(0), yL + 46, '', 'tb t1'), wan1 = T(svg, X(100), yL + 46, '', 'tb t2');
    T(svg, (X(0) + X(50)) / 2, yL + 72, '千位是 0～4：舍去尾数', 'ts t1');
    T(svg, (X(50) + X(100)) / 2, yL + 72, '千位是 5～9：向万位进 1', 'ts t2');
    const arrow = S('path', { class: 'fnone guide' }, svg);
    const numT = T(svg, 0, 46, '', 'tb');
    const handle = S('circle', { cy: yL, r: 11, class: 'handle', tabindex: 0 }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let B = 34, k = 38;
    btn(c, '− 1000', () => set(k - 10));
    btn(c, '− 100', () => set(k - 1));
    btn(c, '+ 100', () => set(k + 1));
    btn(c, '+ 1000', () => set(k + 10));
    btn(c, '换一组数', () => { B = 10 + Math.floor(Math.random() * 89); set(Math.floor(Math.random() * 101)); }, 'alt');
    function set(v) { k = Math.max(0, Math.min(100, v)); render(); }
    function render() {
      const N = B * 10000 + k * 100;
      const th = Math.floor(N / 1000) % 10;
      const ap = Math.floor(N / 10000) + (th >= 5 ? 1 : 0);
      lab0.textContent = String(B * 10000); lab5.textContent = String(B * 10000 + 5000); lab1.textContent = String((B + 1) * 10000);
      wan0.textContent = `${B}万`; wan1.textContent = `${B + 1}万`;
      handle.setAttribute('cx', X(k));
      numT.setAttribute('x', Math.max(50, Math.min(410, X(k))));
      numT.textContent = String(N);
      const end = th >= 5 || k === 100 ? X(100) : X(0);
      const hx = X(k);
      arrow.setAttribute('d', Math.abs(end - hx) < 2 ? '' : `M${hx},${yL - 14} Q${(hx + end) / 2},${yL - 70} ${end},${yL - 18}`);
      let s = `<b>${N}</b>：省略万位后面的尾数，要看<b>千位</b>。千位上是 <b>${th}</b>，`;
      s += th >= 5 ? `${th} ≥ 5，向万位进 1（五入）` : `${th} &lt; 5，把尾数直接舍去（四舍）`;
      s += `，所以 ${N} ≈ <b>${ap}万</b>。`;
      if (N % 10000 === 0) s = `<b>${N}</b> 末尾正好有 4 个 0，可以直接改写成 <b>${N / 10000}万</b>，这时用“=”。`;
      read.innerHTML = s;
    }
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      const mv = (ev) => {
        const p = svgPoint(svg, ev);
        set(Math.round(((p.x - x0) / (x1 - x0)) * 100));
      };
      const up = () => { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); };
      handle.addEventListener('pointermove', mv);
      handle.addEventListener('pointerup', up);
    });
    handle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); set(k - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); set(k + 1); }
    });
    H('p', { class: 'anim-tip' }, el, '提示：拖动橙色圆点，或者用按钮改变这个数。');
    render();
  };

  // ───────────── 运算律：点阵转一转（交换律） ─────────────
  A.n_ops_dots = function (el) {
    const W = 460, Hh = 250, cx = 230, cy = 125, s = 26;
    const svg = stage(el, W, Hh);
    const rot = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let R = 3, C = 5, pts = [], busy = false, last = null;
    const sr = slider(c, 'opr', '行数', 1, 8, 1, R, (v) => { if (busy) { sr.set(R); return; } R = v; build(); });
    const sc = slider(c, 'opc', '每行', 1, 8, 1, C, (v) => { if (busy) { sc.set(C); return; } C = v; build(); });
    const c2 = ctrl(el);
    btn(c2, '转 90°', () => {
      if (busy) return;
      busy = true;
      last = [R, C];
      tween(1100, (t) => rot.setAttribute('transform', `rotate(${90 * t} ${cx} ${cy})`), () => {
        pts.forEach((p) => { const dx = p.dx; p.dx = -p.dy; p.dy = dx; });
        const t0 = R; R = C; C = t0;
        sr.set(R); sc.set(C);
        rot.setAttribute('transform', '');
        busy = false;
        draw();
      });
    });
    function build() {
      pts = [];
      for (let r = 0; r < R; r++) for (let q = 0; q < C; q++) pts.push({ dx: q - (C - 1) / 2, dy: r - (R - 1) / 2, cls: r === 0 ? 'f2' : 'f1' });
      last = null;
      draw();
    }
    function draw() {
      rot.innerHTML = '';
      pts.forEach((p) => S('circle', { cx: cx + p.dx * s, cy: cy + p.dy * s, r: 9, class: p.cls }, rot));
      const n = R * C;
      if (last) {
        read.innerHTML = `转之前：${last[0]} 行，每行 ${last[1]} 个，${last[1]} × ${last[0]} = ${n}。<br>转之后：${R} 行，每行 ${C} 个，${C} × ${R} = ${n}。<br>点子一个没多、一个没少！所以 <b>${last[1]} × ${last[0]} = ${last[0]} × ${last[1]}</b>。交换两个因数的位置，积不变，这就是<b>乘法交换律</b>。`;
      } else {
        read.innerHTML = `${R} 行，每行 ${C} 个，一共 ${C} × ${R} = <b>${n}</b> 个点。点“转 90°”，看看橙色那一行转到哪里去了。`;
      }
    }
    build();
  };

  // ───────────── 运算律：面积图（分配律） ─────────────
  A.n_ops_dist = function (el) {
    const W = 460, Hh = 270, x0 = 60, y0 = 46;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const ct = ctrl(el);
    let a = 4, b = 6, c = 3, sp = 0, busy = false;
    slider(ct, 'oda', '行数', 1, 8, 1, a, (v) => { a = v; draw(); });
    slider(ct, 'odb', '蓝', 1, 10, 1, b, (v) => { b = v; draw(); });
    slider(ct, 'odc', '橙', 1, 6, 1, c, (v) => { c = v; draw(); });
    const c2 = ctrl(el);
    const sw = btn(c2, '拆开', () => {
      if (busy) return;
      busy = true;
      const from = sp, to = sp > 0.5 ? 0 : 1;
      tween(900, (t) => { sp = lerp(from, to, t); draw(); }, () => {
        sp = to; busy = false;
        sw.textContent = to ? '合起来' : '拆开';
        draw();
      });
    });
    function piece(x, y, n, m, u, cls) {
      S('rect', { x, y, width: n * u, height: m * u, class: cls + ' sstrong' }, g);
      for (let k = 1; k < n; k++) S('line', { x1: x + k * u, x2: x + k * u, y1: y, y2: y + m * u, class: 'cell' }, g);
      for (let k = 1; k < m; k++) S('line', { x1: x, x2: x + n * u, y1: y + k * u, y2: y + k * u, class: 'cell' }, g);
    }
    function draw() {
      g.innerHTML = '';
      const gap = 40 * sp;
      const u = Math.min(26, (W - x0 - 30 - 40) / (b + c), (Hh - y0 - 60) / a);
      const xb = x0, xc = x0 + b * u + gap;
      piece(xb, y0, b, a, u, 'f1s');
      piece(xc, y0, c, a, u, 'f2s');
      T(g, x0 - 10, y0 + (a * u) / 2 + 5, String(a), 'tb', 'end');
      T(g, xb + (b * u) / 2, y0 - 10, String(b), 'tb t1');
      T(g, xc + (c * u) / 2, y0 - 10, String(c), 'tb t2');
      const yb = y0 + a * u + 24;
      const lo = S('g', { opacity: Math.max(0, 1 - sp * 2) }, g);
      S('path', { d: `M${xb},${yb - 12} v6 H${xb + (b + c) * u} v-6`, class: 'fnone smuted' }, lo);
      T(lo, xb + ((b + c) * u) / 2, yb + 10, `每行 ${b} + ${c} = ${b + c} 个`, 'ts');
      const hi = S('g', { opacity: Math.max(0, sp * 2 - 1) }, g);
      T(hi, xb + (b * u) / 2, yb + 4, `${a} × ${b} = ${a * b}`, 'tb t1');
      T(hi, xc + (c * u) / 2, yb + 22, `${a} × ${c} = ${a * c}`, 'tb t2');
      const tot = a * (b + c);
      if (sp < 0.5) {
        read.innerHTML = `合起来看：${a} 行，每行 ${b} + ${c} = ${b + c} 个，<b>(${b} + ${c}) × ${a}</b> = ${b + c} × ${a} = <b>${tot}</b>。<br>点“拆开”，把蓝色和橙色分开数。`;
      } else {
        read.innerHTML = `分开看：蓝色 ${b} × ${a} = ${a * b}，橙色 ${c} × ${a} = ${a * c}，<b>${b} × ${a} + ${c} × ${a}</b> = ${a * b} + ${a * c} = <b>${tot}</b>。<br>格子还是那么多，所以 <b>(${b} + ${c}) × ${a} = ${b} × ${a} + ${c} × ${a}</b>。这就是<b>乘法分配律</b>。`;
      }
    }
    draw();
  };

  // ───────────── 小数的意义：百格图 ─────────────
  A.n_dec_square = function (el) {
    const W = 460, Hh = 290, u = 26, gx = 16, gy = 14;
    const svg = stage(el, W, Hh);
    const cells = [];
    let k = 37, shown = 37, busy = false;
    for (let col = 0; col < 10; col++) {
      for (let row = 0; row < 10; row++) {
        const idx = col * 10 + row;
        const r = S('rect', { x: gx + col * u, y: gy + row * u, width: u, height: u, class: 'fsurf sline clickable' }, svg);
        r.addEventListener('click', () => { if (!busy) go(k === idx + 1 ? idx : idx + 1); });
        cells[idx] = r;
      }
    }
    S('rect', { x: gx, y: gy, width: 10 * u, height: 10 * u, class: 'fnone sstrong' }, svg);
    const rx = 375;
    const bigT = T(svg, rx, 70, '', 'txl');
    const numT = T(svg, rx, 128, '', 'tl tb');
    S('line', { x1: rx - 28, x2: rx + 28, y1: 136, y2: 136, class: 'sstrong' }, svg);
    T(svg, rx, 158, '100', 'tl tb');
    const tenT = T(svg, rx, 206, '', 'ts t1');
    const hunT = T(svg, rx, 228, '', 'ts t2');
    T(svg, rx, 30, '涂色部分是', 'note');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    btn(c, '+ 0.1', () => { if (!busy) go(Math.min(100, k + 10)); });
    btn(c, '+ 0.01', () => { if (!busy) go(Math.min(100, k + 1)); });
    btn(c, '− 0.01', () => { if (!busy) go(Math.max(0, k - 1)); }, 'alt');
    btn(c, '− 0.1', () => { if (!busy) go(Math.max(0, k - 10)); }, 'alt');
    btn(c, '清空', () => { if (!busy) go(0); }, 'alt');
    const decStr = (v) => (v === 100 ? '1' : v === 0 ? '0' : '0.' + String(v).padStart(2, '0'));
    function go(to) {
      const from = shown;
      k = to;
      busy = true;
      tween(Math.min(900, 60 * Math.abs(to - from) + 100), (t) => paint(Math.round(lerp(from, to, t))), () => { busy = false; paint(to); say(); });
    }
    function paint(v) {
      shown = v;
      const full = Math.floor(v / 10) * 10;
      cells.forEach((r, i) => r.setAttribute('class', (i < full ? 'f1s' : i < v ? 'f2s' : 'fsurf') + ' sline clickable'));
      bigT.textContent = decStr(v);
      numT.textContent = String(v);
      tenT.textContent = `${Math.floor(v / 10)} 整列 = ${Math.floor(v / 10)} 个 0.1`;
      hunT.textContent = `${v % 10} 个单格 = ${v % 10} 个 0.01`;
    }
    function say() {
      const t = Math.floor(k / 10), h = k % 10;
      let s;
      if (k === 0) s = `整个大正方形看作 1，平均分成 100 个小格，每格是 ${fr(1, 100)}，写成 <b>0.01</b>。一整列 10 格是 ${fr(1, 10)}，写成 <b>0.1</b>。点格子涂色试试。`;
      else if (k === 100) s = '涂满了！100 个 0.01 是 1，10 个 0.1 也是 1。';
      else {
        s = `涂了 ${k} 格，是 ${fr(k, 100)}，写成 <b>${decStr(k)}</b>。`;
        const bits = [];
        if (t) bits.push(`<span class="k1">${t} 个 0.1</span>`);
        if (h) bits.push(`<span class="k2">${h} 个 0.01</span>`);
        s += `它由 ${bits.join(' 和 ')} 组成。`;
        if (h === 0) s += `<br>${decStr(k)} 和 0.${t} 涂的一样多，所以 <b>${decStr(k)} = 0.${t}</b>：小数末尾添上 0 或去掉 0，大小不变。`;
      }
      read.innerHTML = s;
    }
    paint(k); say();
  };

  // ───────────── 小数加减：对齐小数点 ─────────────
  A.n_dec_add = function (el) {
    const W = 420, Hh = 180, xp = 240, cw = 20, off = 12, yA = 56, yB = 100, yR = 156;
    const svg = stage(el, W, Hh);
    const guide = S('line', { x1: xp, x2: xp, y1: 22, y2: 166, class: 'guide', opacity: 0 }, svg);
    const gA = S('g', {}, svg), gB = S('g', {}, svg), gZ = S('g', {}, svg), gR = S('g', {}, svg);
    S('line', { x1: 110, x2: 340, y1: 118, y2: 118, class: 'sstrong' }, svg);
    const opT = T(svg, 120, yB, '+', 'txl');
    const PRE = [['3.5', '+', '1.25'], ['12.6', '+', '4.38'], ['2.85', '+', '0.9'], ['8', '−', '2.75'], ['6.4', '−', '3.82']];
    const cap = H('p', { class: 'anim-cap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const sel = H('select', { 'aria-label': '选择题目' }, c);
    PRE.forEach(([a, op, b], i) => H('option', { value: i }, sel, `${a} ${op} ${b}`));
    sel.addEventListener('change', () => load(+sel.value));
    const nextBtn = btn(c, '下一步', () => next());
    btn(c, '重来', () => load(+sel.value), 'alt');
    let P, step = 0, busy = false, gen = 0;
    const PLACE = ['个位', '十分位', '百分位'];
    const decOf = (s) => (s.split('.')[1] || '').length;
    const xInt = (k) => xp - off - k * cw;
    const xDec = (j) => xp + off + (j - 1) * cw;
    const lastX = (s) => (decOf(s) ? xDec(decOf(s)) : xInt(0));
    function numDraw(g, str, cls) {
      g.innerHTML = '';
      const parts = str.split('.'), ip = parts[0], dp = parts[1] || '';
      for (let k = 0; k < ip.length; k++) T(g, xInt(k), 0, ip[ip.length - 1 - k], cls);
      if (dp) {
        T(g, xp, 0, '.', cls);
        for (let j = 1; j <= dp.length; j++) T(g, xDec(j), 0, dp[j - 1], cls);
      }
    }
    function load(i) {
      gen++; busy = false; step = 0;
      const [a, op, b] = PRE[i];
      const da = decOf(a), db = decOf(b), md = Math.max(da, db);
      const A100 = Math.round(parseFloat(a) * 100), B100 = Math.round(parseFloat(b) * 100);
      const r = op === '+' ? A100 + B100 : A100 - B100;
      P = { a, op, b, da, db, md, res: (r / 100).toFixed(md) };
      numDraw(gA, a, 'txl');
      numDraw(gB, b, 'txl');
      gZ.innerHTML = ''; gR.innerHTML = '';
      opT.textContent = op;
      const m = Math.max(lastX(a), lastX(b));
      P.sa = m - lastX(a); P.sb = m - lastX(b);
      gA.setAttribute('transform', tr(P.sa, yA));
      gB.setAttribute('transform', tr(P.sb, yB));
      guide.setAttribute('opacity', 0);
      nextBtn.disabled = false;
      nextBtn.textContent = '对齐小数点';
      cap.textContent = '这样对齐，对吗？';
      read.innerHTML = `现在是<b>末尾对齐</b>：${a} 的最后一位是${PLACE[da]}，${b} 的最后一位是${PLACE[db]}。` +
        (da === db ? '' : '相同数位没有对齐，“几个 0.1”和“几个 0.01”就加在一起了，这样不对！点“对齐小数点”。');
    }
    function next() {
      if (busy) return;
      const my = gen;
      if (step === 0) {
        busy = true;
        const sa = P.sa, sb = P.sb;
        tween(900, (t) => {
          if (my !== gen) return;
          gA.setAttribute('transform', tr(lerp(sa, 0, t), yA));
          gB.setAttribute('transform', tr(lerp(sb, 0, t), yB));
        }, () => {
          if (my !== gen) return;
          busy = false; step = 1;
          guide.setAttribute('opacity', 1);
          nextBtn.textContent = '补上 0';
          cap.textContent = '第 1 步：小数点对齐';
          read.innerHTML = '小数点对齐了，相同数位也就对齐了：个位对个位，十分位对十分位，百分位对百分位。';
        });
      } else if (step === 1) {
        step = 2;
        gZ.innerHTML = '';
        [[P.a, P.da, yA], [P.b, P.db, yB]].forEach(([s, d, y]) => {
          if (d >= P.md) return;
          if (d === 0) T(gZ, xp, y, '.', 'txl tm');
          for (let j = d + 1; j <= P.md; j++) T(gZ, xDec(j), y, '0', 'txl tm');
        });
        const pads = [[P.a, P.da], [P.b, P.db]].filter(([, d]) => d < P.md).map(([s]) => `${s} = ${(+s).toFixed(P.md)}`);
        nextBtn.textContent = '开始计算';
        cap.textContent = '第 2 步：空位补 0';
        read.innerHTML = pads.length
          ? `空着的数位可以补上 0（灰色的），大小不变：${pads.join('，')}。这样每一位都有数，算起来不容易错。`
          : '两个数的小数位数一样，不用补 0。';
      } else if (step === 2) {
        busy = true; step = 3;
        nextBtn.disabled = true;
        const res = P.res;
        const [ri, rd] = res.split('.');
        const a2 = (+P.a).toFixed(P.md).split('.'), b2 = (+P.b).toFixed(P.md).split('.');
        const len = Math.max(a2[0].length, b2[0].length);
        const digA = (a2[0].padStart(len, '0') + (a2[1] || '')).split('').map(Number);
        const digB = (b2[0].padStart(len, '0') + (b2[1] || '')).split('').map(Number);
        const names = [];
        for (let j = P.md; j >= 1; j--) names.push(PLACE[j]);
        const INT = ['个位', '十位', '百位'];
        for (let k = 0; k < len; k++) names.push(INT[k]);
        const cols = [];
        let carry = 0;
        for (let i = digA.length - 1, q = 0; i >= 0; i--, q++) {
          const x = digA[i], y = digB[i];
          let txt, v;
          if (P.op === '+') {
            v = x + y + carry;
            txt = `${names[q]}：${x} + ${y}${carry ? ' + 1（进上来的）' : ''} = ${v}` + (v >= 10 ? `，写 ${v % 10}，向前一位进 1` : '');
            carry = v >= 10 ? 1 : 0;
            v %= 10;
          } else {
            v = x - y - carry;
            const x2 = x - carry;
            if (x2 < 0) {
              txt = `${names[q]}：这一位是 0，不够借给后一位，要先向前一位借 1 当 10，再借给后一位 1，还剩 9，9 − ${y} = ${9 - y}`;
              v = 9 - y; carry = 1;
            } else if (v < 0) {
              txt = `${names[q]}：${carry ? `${x} 被借走 1 还剩 ${x2}，` : ''}${x2} 减 ${y} 不够减，向前一位借 1 当 10，${x2 + 10} − ${y} = ${v + 10}`;
              v += 10; carry = 1;
            } else {
              txt = `${names[q]}：${carry ? `${x} 被借走 1 还剩 ${x2}，` : ''}${x2} − ${y} = ${v}`;
              carry = 0;
            }
          }
          const xx = q < P.md ? xDec(P.md - q) : xInt(q - P.md);
          cols.push([xx, String(v), txt]);
        }
        // 去掉多余的最高位 0（得数整数部分以 res 为准）
        const keep = rd ? rd.length + ri.length : ri.length;
        const shownCols = cols.slice(0, keep);
        if (rd) T(gR, xp, yR, '.', 'txl t2');
        const els = shownCols.map(([xx, d]) => {
          const t = T(gR, xx, yR, d, 'txl t2');
          t.setAttribute('opacity', 0);
          return t;
        });
        let i = 0;
        const stepf = () => {
          if (my !== gen) return;
          if (i >= els.length) {
            busy = false;
            cap.textContent = '算完了';
            read.innerHTML = `${P.a} ${P.op} ${P.b} = <b>${res}</b>。得数的小数点，要和上面的小数点对齐。`;
            return;
          }
          const e = els[i];
          read.innerHTML = shownCols[i][2] + '。';
          cap.textContent = '第 3 步：从最低位算起';
          tween(300, (t) => { if (my === gen) e.setAttribute('opacity', t); });
          i++;
          setTimeout(stepf, RM ? 200 : 1300);
        };
        stepf();
      }
    }
    load(0);
  };

  // ───────────── 因数：小方块排长方形 ─────────────
  A.n_factor_rect = function (el) {
    const W = 460, Hh = 220, x0 = 20, y0 = 20, AW = 420, AH = 180;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const list = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 12, r = 1, sq = [], gen = 0, autoGen = 0, tried = new Set(), found = new Set();
    slider(c, 'fcn', '方块数', 2, 36, 1, n, (v) => { autoGen++; n = v; tried = new Set(); found = new Set(); render(true); });
    const sr = slider(c, 'fcr', '行数', 1, 6, 1, r, (v) => { autoGen++; r = v; render(true); });
    const c2 = ctrl(el);
    btn(c2, '自动试一遍（1～6 行）', () => {
      const my = ++autoGen;
      let rr = 1;
      const stepf = () => {
        if (my !== autoGen) return;
        if (rr > Math.min(6, n)) return;
        r = rr++;
        sr.set(r);
        render(true);
        setTimeout(stepf, RM ? 400 : 1500);
      };
      stepf();
    });
    function target(i) {
      const cols = Math.ceil(n / r), u = Math.min(30, AW / cols, AH / r);
      const ox = x0 + (AW - cols * u) / 2, oy = y0 + (AH - r * u) / 2;
      return [ox + Math.floor(i / r) * u, oy + (i % r) * u, u];
    }
    function place(s, x, y, u) {
      s.x = x; s.y = y; s.u = u;
      s.e.setAttribute('x', x + 1); s.e.setAttribute('y', y + 1);
      s.e.setAttribute('width', Math.max(1, u - 2)); s.e.setAttribute('height', Math.max(1, u - 2));
    }
    function render(animate) {
      const my = ++gen;
      while (sq.length > n) sq.pop().e.remove();
      while (sq.length < n) {
        const s = { e: S('rect', { rx: 2 }, g) };
        place(s, ...target(sq.length));
        sq.push(s);
      }
      const full = Math.floor(n / r) * r;
      sq.forEach((s, i) => s.e.setAttribute('class', i < full ? 'f1s s1 thin' : 'f2s s2 thin'));
      const to = sq.map((_, i) => target(i));
      const from = sq.map((s) => [s.x, s.y, s.u]);
      const apply = (t) => sq.forEach((s, i) => place(s, lerp(from[i][0], to[i][0], t), lerp(from[i][1], to[i][1], t), lerp(from[i][2], to[i][2], t)));
      if (animate) tween(700, (t) => { if (my === gen) apply(t); }, () => { if (my === gen) apply(1); });
      else apply(1);
      after();
    }
    function after() {
      const q = Math.floor(n / r), rem = n % r;
      tried.add(r);
      if (!rem) { found.add(r); found.add(q); }
      if (r > n) read.innerHTML = `${n} 个方块不够排成 ${r} 行。`;
      else if (!rem) read.innerHTML = `${n} 个方块排成 <b>${r}</b> 行，每行 <b>${q}</b> 个，正好是一个长方形！${r} × ${q} = ${n}，所以 ${r} 和 ${q} 都是 ${n} 的<b>因数</b>，${n} 是 ${r} 和 ${q} 的<b>倍数</b>。`;
      else read.innerHTML = `排成 ${r} 行：摆满了 ${q} 列，还剩 <span class="k2">${rem}</span> 个凑不满一列，排不成长方形。${n} ÷ ${r} = ${q}……${rem}，所以 ${r} <b>不是</b> ${n} 的因数。`;
      const fs = [...found].sort((x, y) => x - y);
      const lim = Math.floor(Math.sqrt(n));
      let all = true;
      for (let i = 1; i <= lim; i++) if (!tried.has(i)) all = false;
      if (all) {
        list.innerHTML = `${n} 的因数全找齐了：<b>${fs.join('、')}</b>，一共 ${fs.length} 个。` +
          (fs.length === 2 ? `只有 1 和它本身，${n} 是<b>质数</b>。` : `除了 1 和它本身还有别的因数，${n} 是<b>合数</b>。`);
      } else {
        list.innerHTML = `已经找到的因数：${fs.length ? fs.join('、') : '还没有'}。换不同的行数接着试（试到 ${lim} 行就够了，因为因数是一对一对出现的）。`;
      }
    }
    render(false);
  };

  // ───────────── 因数：百数表（倍数特征、筛质数） ─────────────
  A.n_factor_sieve = function (el) {
    const W = 420, Hh = 416, cs = 40;
    const svg = stage(el, W, Hh);
    const cells = [];
    const read = H('p', { class: 'anim-read' }, el);
    let crossed = new Set(), primes = new Set(), hl = 0, si = 0, busy = false, gen = 0;
    for (let k = 1; k <= 100; k++) {
      const col = (k - 1) % 10, row = Math.floor((k - 1) / 10);
      const x = 10 + col * cs, y = 8 + row * cs;
      const g = S('g', { class: 'clickable' }, svg);
      const r = S('rect', { x: x + 1, y: y + 1, width: cs - 2, height: cs - 2, rx: 6, class: 'fsurf sline' }, g);
      const t = T(g, x + cs / 2, y + 25, String(k), 'tb');
      const ln = S('line', { x1: x + 8, y1: y + 32, x2: x + 32, y2: y + 8, class: 's2 round', opacity: 0 }, g);
      g.addEventListener('click', () => info(k));
      cells[k] = { r, t, ln };
    }
    const c = ctrl(el);
    const LABELS = ['划去 1', '圈 2，划去 2 的倍数', '圈 3，划去 3 的倍数', '圈 5，划去 5 的倍数', '圈 7，划去 7 的倍数', '圈出剩下的数', '筛完了'];
    const STEPS = [1, 2, 3, 5, 7, 'rest'];
    const nextBtn = btn(c, LABELS[0], () => stepNext());
    btn(c, '重来', () => {
      gen++; busy = false; si = 0; crossed = new Set(); primes = new Set(); hl = 0;
      nextBtn.disabled = false; nextBtn.textContent = LABELS[0];
      render();
      read.innerHTML = '用“筛子”找出 100 以内的质数：按上面的按钮，一步一步来。也可以点任意一个数，看它有哪些因数。';
    }, 'alt');
    const c2 = ctrl(el);
    [[2, '2 的倍数'], [5, '5 的倍数'], [3, '3 的倍数']].forEach(([p, nm]) => btn(c2, nm, () => {
      if (busy) return;
      hl = hl === p ? 0 : p;
      render();
      if (!hl) { read.innerHTML = '取消了标记。'; return; }
      if (p === 2) read.innerHTML = '橙色的是 2 的倍数：<b>个位是 0、2、4、6、8</b>。2 的倍数也叫<b>偶数</b>，不是 2 的倍数的叫<b>奇数</b>。';
      if (p === 5) read.innerHTML = '橙色的是 5 的倍数：<b>个位是 0 或 5</b>。';
      if (p === 3) read.innerHTML = '橙色的是 3 的倍数。看个位看不出来！要把<b>各位上的数加起来</b>：比如 57，5 + 7 = 12，12 是 3 的倍数，所以 57 也是 3 的倍数。';
    }, 'alt'));
    function render() {
      for (let k = 1; k <= 100; k++) {
        const cl = cells[k];
        cl.r.setAttribute('class', primes.has(k) ? 'f3s s3' : hl && k % hl === 0 ? 'f2s sline' : 'fsurf sline');
        cl.t.setAttribute('class', crossed.has(k) ? 'tm' : 'tb');
        cl.ln.setAttribute('opacity', crossed.has(k) ? 1 : 0);
      }
    }
    function info(k) {
      if (busy) return;
      const fs = [];
      for (let i = 1; i <= k; i++) if (k % i === 0) fs.push(i);
      const kind = k === 1 ? '1 只有一个因数，<b>既不是质数，也不是合数</b>' : fs.length === 2 ? `只有 1 和 ${k} 两个因数，${k} 是<b>质数</b>` : `因数多于两个，${k} 是<b>合数</b>`;
      read.innerHTML = `${k} 的因数有：${fs.join('、')}。${kind}。`;
    }
    function stepNext() {
      if (busy || si >= STEPS.length) return;
      const p = STEPS[si++];
      const my = gen;
      hl = 0;
      const after = () => {
        nextBtn.textContent = LABELS[si];
        if (si >= STEPS.length) nextBtn.disabled = true;
      };
      if (p === 1) {
        crossed.add(1); render(); after();
        read.innerHTML = '1 只有一个因数（它自己），<b>既不是质数，也不是合数</b>，先划去。';
        return;
      }
      busy = true;
      if (p === 'rest') {
        const lst = [];
        for (let k = 2; k <= 100; k++) if (!crossed.has(k) && !primes.has(k)) lst.push(k);
        tween(1200, (t) => {
          if (my !== gen) return;
          const m = Math.ceil(t * lst.length);
          for (let i = 0; i < m; i++) primes.add(lst[i]);
          render();
        }, () => {
          if (my !== gen) return;
          busy = false; after();
          read.innerHTML = `剩下没被划去的数，都只有 1 和它本身两个因数，全是<b>质数</b>。100 以内一共有 <b>${primes.size}</b> 个质数。<br>为什么筛到 7 就够了？因为 100 以内的合数，一定是 2、3、5、7 中某个数的倍数。`;
        });
        return;
      }
      primes.add(p);
      const lst = [];
      for (let k = 2 * p; k <= 100; k += p) if (!crossed.has(k)) lst.push(k);
      render();
      tween(Math.max(500, lst.length * 40), (t) => {
        if (my !== gen) return;
        const m = Math.ceil(t * lst.length);
        for (let i = 0; i < m; i++) crossed.add(lst[i]);
        render();
      }, () => {
        if (my !== gen) return;
        busy = false; after();
        read.innerHTML = `${p} 只有 1 和 ${p} 两个因数，是质数，圈出来。${p} 的倍数（${p} 自己除外）都有因数 ${p}，一定是合数，划去。这一次新划去 ${lst.length} 个数${lst.length <= 8 ? '：' + lst.join('、') : ''}。`;
      });
    }
    render();
    read.innerHTML = '用“筛子”找出 100 以内的质数：按上面的按钮，一步一步来。也可以点任意一个数，看它有哪些因数。';
  };

  // ───────────── 用字母表示数：火柴棒搭三角形 ─────────────
  A.n_letter_match = function (el) {
    const W = 460, Hh = 190, s = 56, bx = 40, yb = 160, yt = 160 - 56 * 0.866;
    const svg = stage(el, W, Hh);
    const cnt = T(svg, W / 2, 34, '', 'tl tb');
    const sub = T(svg, W / 2, 58, '', 'ts tm');
    const stickG = S('g', {}, svg);
    const tbl = H('div', { class: 'tbl-wrap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const Bp = (k) => [bx + k * s, yb];
    const Tp = (k) => [bx + s / 2 + k * s, yt];
    function sticksFor(m) {
      if (m === 1) return [[Bp(0), Bp(1)], [Bp(0), Tp(0)], [Bp(1), Tp(0)]];
      if (m % 2 === 0) { const j = m / 2; return [[Tp(j - 1), Tp(j)], [Bp(j), Tp(j)]]; }
      const j = (m - 1) / 2;
      return [[Bp(j), Bp(j + 1)], [Bp(j + 1), Tp(j)]];
    }
    let n = 0, busy = false, groups = [], big = false;
    function addOne(animate, done) {
      n++;
      groups.forEach((gr) => gr.forEach((st) => st.line.setAttribute('class', 'sstrong thick round')));
      const gr = sticksFor(n).map(([p, q]) => {
        const line = S('line', { x1: p[0], y1: p[1], x2: p[0], y2: p[1], class: 's2 thick round' }, stickG);
        const head = S('circle', { cx: q[0], cy: q[1], r: 4.5, class: 'f2', opacity: 0 }, stickG);
        return { line, head, p, q };
      });
      groups.push(gr);
      const fin = () => {
        gr.forEach((st) => { st.line.setAttribute('x2', st.q[0]); st.line.setAttribute('y2', st.q[1]); st.head.setAttribute('opacity', 1); });
        say();
        if (done) done();
      };
      if (!animate) { fin(); return; }
      tween(600, (t) => gr.forEach((st) => {
        st.line.setAttribute('x2', lerp(st.p[0], st.q[0], t));
        st.line.setAttribute('y2', lerp(st.p[1], st.q[1], t));
      }), fin);
    }
    btn(c, '再搭一个', () => {
      if (busy) return;
      if (n >= 12) { read.innerHTML = '摆不下啦！不过不用真的去摆，规律已经找到了。点“搭 50 个呢？”看看。'; return; }
      busy = true; big = false;
      addOne(true, () => { busy = false; });
    });
    btn(c, '拆掉一个', () => {
      if (busy || n <= 1) return;
      groups.pop().forEach((st) => { st.line.remove(); st.head.remove(); });
      n--; big = false;
      groups[groups.length - 1].forEach((st) => st.line.setAttribute('class', 's2 thick round'));
      say();
    }, 'alt');
    btn(c, '搭 50 个呢？', () => { if (!busy) { big = true; say(); } }, 'alt');
    function say() {
      const m = 2 * n + 1;
      cnt.textContent = `${n} 个三角形，用了 ${m} 根小棒`;
      sub.textContent = n > 1 ? `第 1 个用 3 根，后面 ${n - 1} 个每个只添 2 根（橙色是刚添的）` : '第 1 个三角形用 3 根';
      const cols = [];
      for (let i = 1; i <= Math.min(n, 5); i++) cols.push(i);
      if (n > 5) cols.push(n);
      tbl.innerHTML = `<table class="mini"><tr><th>三角形个数</th>${cols.map((i) => `<td>${i}</td>`).join('')}<td>…</td><td><i>n</i></td></tr>` +
        `<tr><th>小棒根数</th>${cols.map((i) => `<td>${2 * i + 1}</td>`).join('')}<td>…</td><td>2<i>n</i> + 1</td></tr></table>`;
      if (big) {
        read.innerHTML = `搭 50 个，不用真的去摆：把 <i>n</i> = 50 代入，2 × 50 + 1 = <b>101</b> 根。这就是用字母表示数的好处：一个式子管所有的情况！`;
        return;
      }
      read.innerHTML = `搭 ${n} 个三角形用 <b>${m}</b> 根：3 + 2 × ${n - 1} = ${m}。换个看法：先放 1 根，每个三角形再配 2 根，1 + 2 × ${n} = ${m}。<br>用字母 <i>n</i> 表示三角形的个数，小棒根数就是 <b>2<i>n</i> + 1</b>。`;
    }
    addOne(false);
    addOne(false);
    addOne(false);
    groups.forEach((gr, i) => gr.forEach((st) => st.line.setAttribute('class', i === groups.length - 1 ? 's2 thick round' : 'sstrong thick round')));
  };

  // ───────────── 用字母表示数：年龄 ─────────────
  A.n_letter_age = function (el) {
    const W = 460, Hh = 210, x0 = 64, k = 6, D = 28, h = 34, y1 = 46, y2 = 116;
    const svg = stage(el, W, Hh);
    T(svg, x0 - 10, y1 + h / 2 + 5, '小明', 'tb', 'end');
    T(svg, x0 - 10, y2 + h / 2 + 5, '爸爸', 'tb', 'end');
    const bar1 = S('rect', { x: x0, y: y1, height: h, rx: 4, class: 'f1s s1' }, svg);
    const bar2a = S('rect', { x: x0, y: y2, height: h, rx: 4, class: 'f1s s1' }, svg);
    const bar2b = S('rect', { y: y2, height: h, rx: 4, width: D * k, class: 'f2s s2' }, svg);
    const dash = S('line', { y1: y1 + h, y2: y2, class: 'smuted dash' }, svg);
    const lab1 = S('g', {}, svg), lab2 = S('g', {}, svg), labD = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 8, shown = 8, letter = false, busy = false;
    const sa = slider(c, 'lta', '小明', 1, 20, 1, a, (v) => { if (busy) { sa.set(a); return; } a = v; shown = v; draw(); });
    const c2 = ctrl(el);
    btn(c2, '过 1 年', () => {
      if (busy) return;
      if (a >= 20) { read.innerHTML = '小明已经 20 岁啦，往回拖动滑块再试试。'; return; }
      busy = true;
      const from = a;
      a++;
      sa.set(a);
      tween(700, (t) => { shown = lerp(from, a, t); draw(); }, () => { shown = a; busy = false; draw(); });
    });
    const lb = btn(c2, '换成字母 a', () => {
      letter = !letter;
      lb.textContent = letter ? '换回数字' : '换成字母 a';
      draw();
    }, 'alt');
    function draw() {
      const w1 = shown * k;
      bar1.setAttribute('width', w1);
      bar2a.setAttribute('width', w1);
      bar2b.setAttribute('x', x0 + w1);
      dash.setAttribute('x1', x0 + w1); dash.setAttribute('x2', x0 + w1);
      lab1.innerHTML = ''; lab2.innerHTML = ''; labD.innerHTML = '';
      const age = Math.round(shown);
      if (letter) {
        TT(lab1, x0 + w1 + 8, y1 + h / 2 + 6, [['a', 'ital'], [' 岁', '']], 'tb', 'start');
        TT(lab2, x0 + w1 + D * k + 8, y2 + h / 2 + 6, [['(', ''], ['a', 'ital'], [` + ${D}) 岁`, '']], 'tb', 'start');
      } else {
        T(lab1, x0 + w1 + 8, y1 + h / 2 + 6, `${age} 岁`, 'tb', 'start');
        T(lab2, x0 + w1 + D * k + 8, y2 + h / 2 + 6, `${age + D} 岁`, 'tb', 'start');
      }
      S('path', { d: `M${x0 + w1},${y2 + h + 8} v6 H${x0 + w1 + D * k} v-6`, class: 'fnone s2' }, labD);
      T(labD, x0 + w1 + (D * k) / 2, y2 + h + 30, `永远多 ${D} 岁`, 'tb t2');
      if (letter) {
        read.innerHTML = `小明 <i>a</i> 岁，爸爸就是 <b>(<i>a</i> + ${D})</b> 岁。<i>a</i> + ${D} 这个式子，既能算出爸爸的年龄，又说清了“爸爸比小明大 ${D} 岁”。<br>当 <i>a</i> = ${age} 时，<i>a</i> + ${D} = ${age} + ${D} = ${age + D}。`;
      } else {
        read.innerHTML = `小明 ${age} 岁时，爸爸 ${age} + ${D} = <b>${age + D}</b> 岁。点“过 1 年”：两个人都长 1 岁，爸爸总是比小明大 ${D} 岁。`;
      }
    }
    draw();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
