// jmix 组（初中 统计 + 综合与实践）的互动动画
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  const pct = (p) => (Math.round(p * 1000) / 10) + '%';
  const near = (a, b) => Math.abs(a - b) < 1e-9;

  // ───────── 数据的收集：从一袋豆子里抽样 ─────────
  A.s_collect_beans = function (el) {
    const W = 460, Hh = 300;
    const svg = stage(el, W, Hh);
    const N = 400, COLS = 20, cell = 10, bx = 25, by = 80;
    const KINDS = [
      { name: '橙豆', cls: 'f2', n: 120 },
      { name: '蓝豆', cls: 'f1', n: 200 },
      { name: '绿豆', cls: 'f3', n: 80 }
    ];
    T(svg, 126, 20, '一袋豆子，共 400 粒', 'note strong');
    S('path', { d: 'M72,30 L72,46 Q14,50 14,100 L14,270 Q14,292 36,292 L216,292 Q238,292 238,270 L238,100 Q238,50 180,46 L180,30 Z', class: 'fsurf2 sstrong' }, svg);
    // 橙豆个头大，更容易沉到袋底：排序时给它加一点“重量”
    const list = [];
    KINDS.forEach((k, i) => { for (let j = 0; j < k.n; j++) list.push({ k: i, key: Math.random() + (i === 0 ? 0.4 : 0) }); });
    list.sort((a, b) => a.key - b.key);
    const gB = S('g', {}, svg);
    const beans = list.map((o, i) => ({
      k: o.k,
      el: S('circle', { cx: bx + (i % COLS) * cell + 5, cy: by + Math.floor(i / COLS) * cell + 5, r: 4, class: KINDS[o.k].cls }, gB)
    }));
    const mouth = S('rect', { x: 20, y: 78, width: 212, height: 0, rx: 4, class: 'fnone s2 dash' }, svg);

    // 右侧：样本中各色豆子的比例
    T(svg, 258, 24, '样本中各色豆子的比例', 'note strong', 'start');
    const bars = KINDS.map((k, i) => {
      const y = 40 + i * 32;
      T(svg, 258, y + 14, k.name, 'ts', 'start');
      S('rect', { x: 290, y, width: 120, height: 18, rx: 4, class: 'fsurf2' }, svg);
      const bar = S('rect', { x: 290, y, width: 0, height: 18, rx: 4, class: k.cls }, svg);
      const px = 290 + (k.n / N) * 120;
      S('line', { x1: px, x2: px, y1: y - 4, y2: y + 22, class: 'sstrong dash thin' }, svg);
      const txt = T(svg, 456, y + 14, '', 'ts tb', 'end');
      return { bar, txt, w: 0 };
    });
    T(svg, 258, 150, '虚线 = 整袋豆子的真实比例', 'tick', 'start');

    // 右下：每次抽样的橙豆比例
    const sx0 = 270, sx1 = 446, sy = 262;
    const SX = (p) => sx0 + (Math.min(p, 0.6) / 0.6) * (sx1 - sx0);
    T(svg, 258, 184, '每次抽样中橙豆的比例：', 'tick', 'start');
    S('line', { x1: sx0, x2: sx1, y1: sy, y2: sy, class: 'sstrong' }, svg);
    for (let i = 0; i <= 6; i++) {
      S('line', { x1: SX(i / 10), x2: SX(i / 10), y1: sy, y2: sy + 5, class: 'sstrong thin' }, svg);
      T(svg, SX(i / 10), sy + 18, i * 10 + '%', 'tick');
    }
    S('line', { x1: SX(0.3), x2: SX(0.3), y1: 194, y2: sy, class: 'guide' }, svg);
    const gDots = S('g', {}, svg);

    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 40, busy = false, hist = [];
    slider(c, 'sn', 'n', 10, 400, 10, n, (v) => {
      n = v; hist = []; drawDots();
      read.innerHTML = `样本容量改成 <b>${n}</b>，下面的记录清空了。点“随机抽样”或“连抽 10 次”看看。`;
    });
    btn(c, '随机抽样', () => { if (!busy) sample('rand', true); });
    btn(c, '连抽 10 次', () => {
      if (busy) return;
      busy = true;
      let i = 0;
      const step = () => {
        if (i >= 10) { busy = false; return; }
        i++;
        sample('rand', false);
        setTimeout(step, RM ? 0 : 260);
      };
      step();
    });
    btn(c, '只从袋口抓', () => { if (!busy) sample('top', true); }, 'alt');
    btn(c, '普查：全部数一遍', () => { if (!busy) sample('all', true); }, 'alt');
    H('p', { class: 'anim-tip' }, el, 'n 是样本容量。右下角：橙色实心点 = 随机抽样，蓝色空心点 = 只从袋口抓。');

    function sample(mode, lock) {
      if (n >= N) mode = 'all';
      const all = beans.map((_, i) => i);
      let idx;
      if (mode === 'all') idx = all;
      else if (mode === 'top') idx = all.slice(0, n);
      else {
        for (let i = 0; i < n; i++) {
          const j = i + Math.floor(Math.random() * (N - i));
          const tmp = all[i]; all[i] = all[j]; all[j] = tmp;
        }
        idx = all.slice(0, n);
      }
      const on = new Set(idx), cnt = [0, 0, 0];
      idx.forEach((i) => { cnt[beans[i].k]++; });
      beans.forEach((b, i) => b.el.setAttribute('opacity', on.has(i) ? 1 : 0.15));
      const m = idx.length;
      mouth.setAttribute('height', mode === 'top' ? Math.ceil(m / COLS) * cell + 4 : 0);
      const from = bars.map((b) => b.w);
      const to = cnt.map((k) => (k / m) * 120);
      bars.forEach((b, i) => { b.w = to[i]; b.txt.textContent = pct(cnt[i] / m); });
      if (lock) busy = true;
      tween(350, (t) => bars.forEach((b, i) => b.bar.setAttribute('width', lerp(from[i], to[i], t))), () => { if (lock) busy = false; });
      const p = cnt[0] / m;
      if (mode !== 'all') {
        hist.push({ p, top: mode === 'top' });
        if (hist.length > 60) hist.shift();
      }
      drawDots();
      const P = pct(p);
      if (mode === 'all') {
        read.innerHTML = `<b>普查</b>：400 粒全部数一遍，橙豆 ${cnt[0]} 粒，正好占 <span class="k2">30%</span>。结果最准确，但如果有几万粒豆子，一粒一粒数就太费时间了。`;
      } else if (mode === 'top') {
        read.innerHTML = `只从袋口抓了 ${m} 粒，橙豆只占 <span class="k2">${P}</span>，比真实的 30% 少很多。橙豆个头大、沉在袋底，袋口的豆子<b>没有代表性</b>，这样的样本会“骗人”。`;
      } else {
        read.innerHTML = `随机抽了 ${m} 粒（<b>样本容量</b>是 ${m}），其中橙豆 ${cnt[0]} 粒，占 <span class="k2">${P}</span>。用样本估计总体：袋中橙豆约 400 × ${P} ≈ <b>${Math.round(400 * p)}</b> 粒（真实是 120 粒）。` +
          (m < 50 ? '样本小，每次结果忽高忽低，多抽几次，看右下角的点有多散。' : m >= 200 ? '样本大，结果稳稳地贴近 30%。' : '');
      }
    }
    function drawDots() {
      gDots.innerHTML = '';
      const stack = {};
      hist.forEach((h) => {
        const b = Math.round(Math.min(h.p, 0.6) * 50);
        stack[b] = (stack[b] || 0) + 1;
        const y = sy - 5 - (stack[b] - 1) * 7;
        if (y < 196) return;
        S('circle', { cx: SX(b / 50), cy: y, r: 3, class: h.top ? 'fsurf s1 thin' : 'f2' }, gDots);
      });
    }
    sample('rand', false);
  };

  // ───────── 数据的整理：划记 → 条形图 / 扇形图 ─────────
  A.s_collect_tally = function (el) {
    const W = 460, Hh = 290;
    const svg = stage(el, W, Hh);
    const CAT = [
      { name: '篮球', n: 12, cls: 'f1', tc: 'tw' },
      { name: '足球', n: 8, cls: 'f2', tc: 'tw' },
      { name: '乒乓球', n: 10, cls: 'f3', tc: 'tw' },
      { name: '羽毛球', n: 6, cls: 'f1s', tc: '' },
      { name: '跳绳', n: 4, cls: 'f2s', tc: '' }
    ];
    const TOTAL = 40;
    const seq = [];
    CAT.forEach((cc, i) => { for (let j = 0; j < cc.n; j++) seq.push(i); });
    for (let i = seq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = seq[i]; seq[i] = seq[j]; seq[j] = tmp;
    }
    // 问卷卡片
    S('rect', { x: 6, y: 8, width: 168, height: 34, rx: 8, class: 'fsurf s2' }, svg);
    const cardT = T(svg, 90, 30, '', 'ts tb');
    // 频数表
    T(svg, 12, 62, '项目', 'ts tb', 'start');
    T(svg, 84, 62, '划记', 'ts tb');
    T(svg, 154, 62, '人数', 'ts tb');
    S('line', { x1: 6, x2: 174, y1: 68, y2: 68, class: 'sline' }, svg);
    const STROKES = [[0, 0, 12, 0], [6, 0, 6, 13], [6, 6, 11, 6], [2, 6, 2, 13], [0, 13, 12, 13]];
    const hl = [], tg = [], cntT = [];
    CAT.forEach((cc, i) => {
      const y = 72 + i * 38;
      hl.push(S('rect', { x: 6, y, width: 168, height: 32, rx: 6, class: 'f2s', opacity: 0 }, svg));
      T(svg, 12, y + 21, cc.name, 'ts', 'start');
      tg.push(S('g', { transform: `translate(62,${y + 9})` }, svg));
      cntT.push(T(svg, 154, y + 21, '0', 'tb'));
    });
    S('line', { x1: 6, x2: 174, y1: 264, y2: 264, class: 'sline' }, svg);
    T(svg, 12, 282, '合计', 'ts tb', 'start');
    const totT = T(svg, 154, 282, '0', 'tb');
    function drawTally(g, cnt) {
      g.innerHTML = '';
      for (let s = 0; s < cnt; s++) {
        const ox = Math.floor(s / 5) * 18, st = STROKES[s % 5];
        S('line', { x1: ox + st[0], y1: st[1], x2: ox + st[2], y2: st[3], class: 'sstrong round' }, g);
      }
    }
    // 条形图
    const gBar = S('g', {}, svg);
    const x0 = 214, y0 = 240, unit = 180 / 14;
    for (let v = 0; v <= 14; v += 2) {
      S('line', { x1: x0, x2: 452, y1: y0 - v * unit, y2: y0 - v * unit, class: 'sline' }, gBar);
      T(gBar, x0 - 6, y0 - v * unit + 4, v, 'tick', 'end');
    }
    S('line', { x1: x0, x2: x0, y1: y0, y2: 52, class: 'sstrong' }, gBar);
    S('line', { x1: x0, x2: 452, y1: y0, y2: y0, class: 'sstrong' }, gBar);
    T(gBar, x0 + 4, 48, '人数', 'tick', 'start');
    const barR = [], barV = [];
    CAT.forEach((cc, i) => {
      const cx = x0 + 26 + i * 48;
      barR.push(S('rect', { x: cx - 14, y: y0, width: 28, height: 0, class: cc.cls + ' sstrong thin' }, gBar));
      barV.push(T(gBar, cx, y0 - 5, '', 'ts tb'));
      T(gBar, cx, y0 + 16, cc.name, 'ts');
    });
    // 扇形图
    const gPie = S('g', {}, svg);
    const pcx = 326, pcy = 158, pr = 96;
    const gPieS = S('g', {}, gPie);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let k = 0, mode = 'bar', busy = false;
    const cnt = [0, 0, 0, 0, 0];
    btn(c, '看下一张问卷', () => { if (!busy) next(true); });
    btn(c, '一口气统计完', () => {
      if (busy || k >= TOTAL) return;
      busy = true;
      const step = () => {
        if (k >= TOTAL) { busy = false; say(); return; }
        next(false);
        setTimeout(step, RM ? 0 : 70);
      };
      step();
    });
    const mb = btn(c, '换成扇形图', () => {
      mode = mode === 'bar' ? 'pie' : 'bar';
      mb.textContent = mode === 'bar' ? '换成扇形图' : '换成条形图';
      render(); say();
    }, 'alt');
    btn(c, '重来', () => { if (busy) return; k = 0; cnt.fill(0); render(); say(); }, 'alt');

    function next(flash) {
      if (k >= TOTAL) { read.innerHTML = '40 张问卷已经全部统计完了。可以换成扇形图看看，或者点“重来”。'; return; }
      const i = seq[k];
      cnt[i]++; k++;
      if (flash) tween(600, (t) => hl[i].setAttribute('opacity', 1 - t));
      else { hl.forEach((h) => h.setAttribute('opacity', 0)); hl[i].setAttribute('opacity', 0.6); }
      render(); say();
    }
    function info(i) {
      const p = cnt[i] / k, deg = (cnt[i] * 360) / k;
      read.innerHTML = `<b>${CAT[i].name}</b>：${cnt[i]} 人，占 ${cnt[i]} ÷ ${k} ${near(p * 1000, Math.round(p * 1000)) ? '=' : '≈'} ${pct(p)}。<br>圆心角 = ${pct(p)} × 360° ${Number.isInteger(deg) ? '=' : '≈'} <b>${fmt(Math.round(deg * 10) / 10)}°</b>。`;
    }
    function render() {
      CAT.forEach((cc, i) => { drawTally(tg[i], cnt[i]); cntT[i].textContent = cnt[i]; });
      totT.textContent = k;
      cardT.textContent = k === 0 ? '问卷还没开始看' : `第 ${k} 张问卷：${CAT[seq[k - 1]].name}`;
      gBar.style.display = mode === 'bar' ? '' : 'none';
      gPie.style.display = mode === 'pie' ? '' : 'none';
      CAT.forEach((cc, i) => {
        const h = cnt[i] * unit;
        barR[i].setAttribute('y', y0 - h);
        barR[i].setAttribute('height', h);
        barV[i].setAttribute('y', y0 - h - 5);
        barV[i].textContent = cnt[i] ? cnt[i] : '';
      });
      gPieS.innerHTML = '';
      if (k === 0) {
        S('circle', { cx: pcx, cy: pcy, r: pr, class: 'fsurf2 sline' }, gPieS);
        T(gPieS, pcx, pcy + 5, '还没有数据', 'tm');
        return;
      }
      let a0 = -PI / 2;
      CAT.forEach((cc, i) => {
        if (!cnt[i]) return;
        const a1 = a0 + (cnt[i] / k) * 2 * PI;
        let shape;
        if (cnt[i] === k) shape = S('circle', { cx: pcx, cy: pcy, r: pr, class: cc.cls + ' clickable' }, gPieS);
        else {
          const d = `M${pcx},${pcy} L${pcx + pr * Math.cos(a0)},${pcy + pr * Math.sin(a0)} A${pr},${pr} 0 ${a1 - a0 > PI ? 1 : 0} 1 ${pcx + pr * Math.cos(a1)},${pcy + pr * Math.sin(a1)} Z`;
          shape = S('path', { d, class: cc.cls + ' clickable', style: 'stroke: var(--surface); stroke-width: 2' }, gPieS);
        }
        shape.addEventListener('click', () => info(i));
        const mid = (a0 + a1) / 2, lr = cnt[i] === k ? 0 : pr * 0.62;
        const lx = pcx + lr * Math.cos(mid), ly = pcy + lr * Math.sin(mid);
        const t1 = T(gPieS, lx, ly - 2, cc.name, 'ts ' + cc.tc);
        const t2 = T(gPieS, lx, ly + 13, pct(cnt[i] / k), 'ts tb ' + cc.tc);
        t1.style.pointerEvents = 'none'; t2.style.pointerEvents = 'none';
        a0 = a1;
      });
    }
    function say() {
      if (k === 0) { read.innerHTML = '某班 40 名同学填写了“你最喜欢的运动”问卷。点“看下一张问卷”，每看一张，就在对应项目后面画一笔。'; return; }
      if (k < TOTAL) { read.innerHTML = `已看 ${k} 张。每 5 笔凑成一个“正”字，数起来又快又不容易错。`; return; }
      read.innerHTML = mode === 'bar'
        ? '统计完毕，一共 40 人。<b>条形图</b>能直接看出“各有多少”：喜欢篮球的最多（12 人），跳绳最少（4 人）。'
        : '统计完毕。<b>扇形图</b>看“各占多少”：所有百分比加起来是 100%。<b>点一块扇形</b>，看看它的圆心角怎么算。';
    }
    render(); say();
  };

  // ───────── 数据的分析：拖动数据点，看平均数、中位数、众数、方差 ─────────
  A.s_stat_drag = function (el) {
    const W = 460, Hh = 244;
    const svg = stage(el, W, Hh);
    const x0 = 30, u = 20, yL = 178, MAXV = 20;
    const X = (v) => x0 + v * u;
    S('line', { x1: x0 - 10, x2: X(MAXV) + 12, y1: yL, y2: yL, class: 'sstrong' }, svg);
    for (let v = 0; v <= MAXV; v++) {
      S('line', { x1: X(v), x2: X(v), y1: yL, y2: yL + (v % 5 ? 4 : 7), class: 'sstrong thin' }, svg);
      if (v % 2 === 0) T(svg, X(v), yL + 20, v, 'tick');
    }
    const gDev = S('g', {}, svg);
    const meanL = S('line', { y1: 26, y2: yL, class: 's2 dash thin' }, svg);
    const medL = S('line', { y1: 26, y2: yL, class: 's3 dash' }, svg);
    const medT = T(svg, 0, 18, '中位数', 'ts t3 tb');
    const meanP = S('path', { class: 'f2' }, svg);
    const meanT = T(svg, 0, 236, '平均数', 'ts t2 tb');
    const gDots = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const BASE = [5, 6, 7, 7, 7, 8, 9];
    let data = BASE.slice(), dots = [], busy = false, showDev = true;

    function build() {
      gDots.innerHTML = '';
      dots = data.map((_, i) => {
        const g = S('g', {}, gDots);
        const ring = S('circle', { r: 12, class: 'fnone sstrong' }, g);
        S('circle', { r: 9, class: 'f1' }, g);
        const hit = S('circle', { r: 14, class: 'fnone', style: 'pointer-events: all; cursor: grab' }, g);
        hit.addEventListener('pointerdown', (e) => {
          if (busy) return;
          e.preventDefault();
          hit.setPointerCapture(e.pointerId);
          const move = (ev) => {
            const p = svgPoint(svg, ev);
            data[i] = Math.max(0, Math.min(MAXV, Math.round((p.x - x0) / u)));
            render();
          };
          const up = () => { hit.removeEventListener('pointermove', move); hit.removeEventListener('pointerup', up); };
          hit.addEventListener('pointermove', move);
          hit.addEventListener('pointerup', up);
        });
        return { g, ring };
      });
    }
    function render() {
      const n = data.length;
      const groups = {};
      data.forEach((v, i) => {
        const key = Math.round(v);
        if (!groups[key]) groups[key] = [];
        groups[key].push(i);
      });
      const sum = data.reduce((s, v) => s + v, 0), mean = sum / n;
      const s2 = data.reduce((s, v) => s + (v - mean) * (v - mean), 0) / n;
      const srt = data.slice().sort((a, b) => a - b);
      const med = n % 2 ? srt[(n - 1) / 2] : (srt[n / 2 - 1] + srt[n / 2]) / 2;
      let mx = 0;
      Object.keys(groups).forEach((key) => { mx = Math.max(mx, groups[key].length); });
      const modes = mx > 1 ? Object.keys(groups).filter((key) => groups[key].length === mx).map(Number).sort((a, b) => a - b) : [];
      gDev.innerHTML = '';
      Object.keys(groups).forEach((key) => {
        const arr = groups[key];
        const sp = arr.length > 1 ? Math.min(22, 130 / (arr.length - 1)) : 22;
        arr.forEach((i, j) => {
          const x = X(data[i]), y = yL - 14 - j * sp;
          dots[i].g.setAttribute('transform', `translate(${x},${y})`);
          dots[i].ring.setAttribute('opacity', modes.indexOf(+key) >= 0 ? 1 : 0);
          if (showDev) S('line', { x1: x, x2: X(mean), y1: y, y2: y, class: 's2 thin' }, gDev);
        });
      });
      const mxp = X(mean), mdp = X(med);
      meanL.setAttribute('x1', mxp); meanL.setAttribute('x2', mxp);
      meanP.setAttribute('d', `M${mxp},204 l-8,14 h16 Z`);
      meanT.setAttribute('x', Math.max(30, Math.min(430, mxp)));
      medL.setAttribute('x1', mdp); medL.setAttribute('x2', mdp);
      medT.setAttribute('x', Math.max(30, Math.min(430, mdp)));
      const eq = (v) => (near(v * 100, Math.round(v * 100)) ? '=' : '≈');
      const medTxt = n % 2 ? `第 ${(n + 1) / 2} 个数` : `第 ${n / 2}、${n / 2 + 1} 个数的平均数`;
      read.innerHTML = `从小到大：${srt.map((v) => fmt(v)).join(', ')}（共 ${n} 个）<br>` +
        `<span class="k2">平均数 = ${fmt(sum)} ÷ ${n} ${eq(mean)} ${fmt(mean)}</span>　<span class="k3">中位数 = ${fmt(med)}</span>（${medTxt}）　` +
        `<b>众数 = ${modes.length ? modes.join(' 和 ') : '找不出（每个数都只出现 1 次）'}</b><br>` +
        `方差 <i>s</i><sup>2</sup> ${eq(s2)} ${fmt(s2)}　（橙色细线是每个数到平均数的距离，距离越大，方差越大）` +
        (Math.abs(mean - med) >= 1 ? '<br>看！平均数被极端值“拉”走了，中位数却几乎不动。' : '');
    }
    btn(c, '拖出一个极端值', () => {
      if (busy) return;
      let im = 0;
      data.forEach((v, i) => { if (v > data[im]) im = i; });
      const from = data[im];
      if (from >= MAXV) { read.innerHTML += '<br>最大的数已经在最右边了，先点“恢复原来的数据”。'; return; }
      busy = true;
      tween(900, (t) => { data[im] = lerp(from, MAXV, t); render(); }, () => { data[im] = MAXV; busy = false; render(); });
    });
    btn(c, '恢复原来的数据', () => {
      if (busy) return;
      if (data.length !== BASE.length) { data = BASE.slice(); build(); render(); return; }
      const from = data.slice();
      busy = true;
      tween(700, (t) => { data = from.map((v, i) => lerp(v, BASE[i], t)); render(); }, () => { data = BASE.slice(); busy = false; render(); });
    }, 'alt');
    btn(c, '+ 加一个数', () => { if (busy || data.length >= 12) return; data.push(10); build(); render(); }, 'alt');
    btn(c, '− 去掉一个数', () => { if (busy || data.length <= 3) return; data.pop(); build(); render(); }, 'alt');
    const devB = btn(c, '隐藏距离线', () => {
      showDev = !showDev;
      devB.textContent = showDev ? '隐藏距离线' : '显示距离线';
      render();
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：左右拖动蓝色圆点改变数据；带圈的点是众数。');
    build();
    render();
  };

  // ───────── 数据的分析：两组数据比波动 ─────────
  A.s_stat_compare = function (el) {
    const W = 460, Hh = 272;
    const svg = stage(el, W, Hh);
    const JIA = [7, 8, 8, 9, 8, 7, 9, 8, 8, 8];
    const DEV = [-2, 2, -1, 1, 2, -2, 0, 1, -1, 0];
    const cx0 = 46, cx1 = 446, cy0 = 240, cy1 = 30, YMAX = 16;
    const CX = (i) => cx0 + 24 + i * 40;
    const CY = (v) => cy0 - (v / YMAX) * (cy0 - cy1);
    for (let v = 0; v <= YMAX; v += 2) {
      S('line', { x1: cx0, x2: cx1, y1: CY(v), y2: CY(v), class: 'sline' }, svg);
      T(svg, cx0 - 6, CY(v) + 4, v, 'tick', 'end');
    }
    S('line', { x1: cx0, x2: cx0, y1: cy0, y2: cy1 - 6, class: 'sstrong' }, svg);
    S('line', { x1: cx0, x2: cx1, y1: cy0, y2: cy0, class: 'sstrong' }, svg);
    for (let i = 0; i < 10; i++) T(svg, CX(i), cy0 + 16, i + 1, 'tick');
    T(svg, cx1, cy0 + 30, '第几次', 'tick', 'end');
    T(svg, cx0 + 6, cy1 - 12, '成绩', 'tick', 'start');
    S('line', { x1: 300, x2: 322, y1: 14, y2: 14, class: 's1' }, svg);
    T(svg, 328, 19, '甲', 'ts tb t1', 'start');
    S('line', { x1: 360, x2: 382, y1: 14, y2: 14, class: 's2' }, svg);
    T(svg, 388, 19, '乙', 'ts tb t2', 'start');
    const meanJ = S('line', { x1: cx0, x2: cx1, class: 's1 dash thin' }, svg);
    const meanY = S('line', { x1: cx0, x2: cx1, class: 's2 dash thin' }, svg);
    const devG = S('g', {}, svg);
    const polyJ = S('polyline', { class: 'fnone s1 round' }, svg);
    const polyY = S('polyline', { class: 'fnone s2 round' }, svg);
    const dotG = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let k = 1, a = 0, shown = 10, busy = false;
    slider(c, 'ck', 'k', 0, 1.5, 0.25, 1, (v) => { k = v; render(); });
    slider(c, 'ca', 'a', -3, 3, 1, 0, (v) => { a = v; render(); });
    btn(c, '一次一次画出来', () => {
      if (busy) return;
      busy = true; shown = 0; render();
      const step = () => {
        shown++; render();
        if (shown < 10) setTimeout(step, RM ? 0 : 280);
        else busy = false;
      };
      setTimeout(step, RM ? 0 : 280);
    });
    H('p', { class: 'anim-tip' }, el, 'k：乙的每个数据离平均数的距离放大几倍；a：乙的每个数据都加上 a。');
    const variance = (arr) => {
      const m = arr.reduce((s, v) => s + v, 0) / arr.length;
      return [m, arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length];
    };
    function render() {
      const YI = DEV.map((d) => 8 + a + k * d);
      const [mJ, vJ] = variance(JIA), [mY, vY] = variance(YI);
      meanJ.setAttribute('y1', CY(mJ)); meanJ.setAttribute('y2', CY(mJ));
      meanY.setAttribute('y1', CY(mY)); meanY.setAttribute('y2', CY(mY));
      devG.innerHTML = ''; dotG.innerHTML = '';
      const pj = [], py = [];
      for (let i = 0; i < shown; i++) {
        pj.push(`${CX(i)},${CY(JIA[i])}`);
        py.push(`${CX(i)},${CY(YI[i])}`);
        S('line', { x1: CX(i) - 3, x2: CX(i) - 3, y1: CY(JIA[i]), y2: CY(mJ), class: 's1 thin' }, devG);
        S('line', { x1: CX(i) + 3, x2: CX(i) + 3, y1: CY(YI[i]), y2: CY(mY), class: 's2 thin' }, devG);
        S('circle', { cx: CX(i), cy: CY(JIA[i]), r: 4.5, class: 'f1' }, dotG);
        S('circle', { cx: CX(i), cy: CY(YI[i]), r: 4.5, class: 'f2' }, dotG);
      }
      polyJ.setAttribute('points', pj.join(' '));
      polyY.setAttribute('points', py.join(' '));
      let cmp;
      if (vY > vJ + 1e-9) cmp = '乙的折线上下起伏大，离平均数远，方差大，<b>波动大</b>；甲更稳定。';
      else if (vY < vJ - 1e-9) cmp = '现在乙的方差比甲小，乙的成绩更稳定。';
      else cmp = '两人方差相等，一样稳定。';
      let notes = '';
      if (a !== 0) notes += `<br>乙的每个数据都加上 ${fmt(a)}：平均数也跟着变了 ${fmt(a)}，但方差不变——折线只是整体上下平移，起伏一点没变。`;
      if (k !== 1) notes += `<br>乙离平均数的距离都变成原来的 ${fmt(k)} 倍，方差变成原来的 ${fmt(k)}<sup>2</sup> = ${fmt(k * k)} 倍：2 × ${fmt(k * k)} = ${fmt(vY)}。`;
      read.innerHTML = `<span class="k1">甲：平均数 ${fmt(mJ)}，方差 ${fmt(vJ)}</span>　<span class="k2">乙：平均数 ${fmt(mY)}，方差 ${fmt(vY)}</span><br>${cmp}${notes}`;
    }
    render();
  };

  // ───────── 方程与函数的应用：两种收费方案 ─────────
  A.x_apply_plans = function (el) {
    const W = 460, Hh = 300;
    const svg = stage(el, W, Hh);
    const px0 = 50, px1 = 440, py0 = 256, py1 = 24;
    const X = (x) => px0 + (x / 400) * (px1 - px0);
    const Y = (y) => py0 - (y / 100) * (py0 - py1);
    for (let x = 0; x <= 400; x += 50) {
      S('line', { x1: X(x), x2: X(x), y1: py0, y2: py1, class: 'sline' }, svg);
      if (x % 100 === 0) T(svg, X(x), py0 + 16, x, 'tick');
    }
    for (let y = 0; y <= 100; y += 10) {
      S('line', { x1: px0, x2: px1, y1: Y(y), y2: Y(y), class: 'sline' }, svg);
      if (y % 20 === 0) T(svg, px0 - 6, Y(y) + 4, y, 'tick', 'end');
    }
    S('line', { x1: px0, x2: px0, y1: py0, y2: py1 - 6, class: 'sstrong' }, svg);
    S('line', { x1: px0, x2: px1, y1: py0, y2: py0, class: 'sstrong' }, svg);
    T(svg, px0 + 4, 14, '费用 y（元）', 'tick', 'start');
    T(svg, px1, py0 - 6, '通话时间 x（分钟）', 'tick', 'end');
    const bandB = S('rect', { y: 280, height: 18, class: 'f2s' }, svg);
    const bandA = S('rect', { y: 280, height: 18, class: 'f1s' }, svg);
    const bandBT = T(svg, 0, 293, '选 B 更省', 'ts tb');
    const bandAT = T(svg, 0, 293, '选 A 更省', 'ts tb');
    const lineA = S('line', { class: 's1 thick round' }, svg);
    const lineB = S('line', { class: 's2 thick round' }, svg);
    const labA = T(svg, 450, 0, 'A', 'tb t1');
    const labB = T(svg, 450, 0, 'B', 'tb t2');
    const crossL = S('line', { class: 's3 dash thin' }, svg);
    const crossP = S('circle', { r: 6, class: 'f3' }, svg);
    const crossT = T(svg, 0, 0, '', 'ts tb t3', 'end');
    const cur = S('line', { y1: py0, y2: py1, class: 'guide' }, svg);
    const dA = S('circle', { r: 6, class: 'mark-x' }, svg);
    const dB = S('circle', { r: 6, class: 'mark-y' }, svg);
    const tA = T(svg, 0, 0, '', 'ts tb t1', 'start');
    const tB = T(svg, 0, 0, '', 'ts tb t2', 'start');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let x = 100, m = 30, busy = false;
    const sx = slider(c, 'px', 'x', 0, 400, 10, x, (v) => { x = v; render(); });
    slider(c, 'pm', 'm', 15, 60, 15, m, (v) => { m = v; render(); });
    btn(c, '从 0 分钟扫到 400 分钟', () => {
      if (busy) return;
      busy = true;
      tween(3200, (t, raw) => { x = Math.round(raw * 40) * 10; sx.set(x); render(); }, () => { busy = false; x = 400; sx.set(x); render(); });
    });
    H('p', { class: 'anim-tip' }, el, '方案 A：每月月租 m 元，另外每分钟 0.1 元；方案 B：没有月租，每分钟 0.25 元。');
    function render() {
      const fA = (v) => m + v / 10, fB = (v) => v / 4;
      lineA.setAttribute('x1', X(0)); lineA.setAttribute('y1', Y(fA(0)));
      lineA.setAttribute('x2', X(400)); lineA.setAttribute('y2', Y(fA(400)));
      lineB.setAttribute('x1', X(0)); lineB.setAttribute('y1', Y(0));
      lineB.setAttribute('x2', X(400)); lineB.setAttribute('y2', Y(100));
      labA.setAttribute('y', Y(fA(400)) + 5 + (m >= 60 ? 16 : 0));
      labB.setAttribute('y', Y(100) + 5);
      const xs = (m * 20) / 3, ys = xs / 4;
      crossL.setAttribute('x1', X(xs)); crossL.setAttribute('x2', X(xs));
      crossL.setAttribute('y1', Y(ys)); crossL.setAttribute('y2', py0);
      crossP.setAttribute('cx', X(xs)); crossP.setAttribute('cy', Y(ys));
      crossT.setAttribute('x', X(xs) - 8); crossT.setAttribute('y', Y(ys) - 8);
      crossT.textContent = `交点 (${fmt(xs)}, ${fmt(ys)})`;
      bandB.setAttribute('x', X(0)); bandB.setAttribute('width', X(xs) - X(0));
      bandA.setAttribute('x', X(xs)); bandA.setAttribute('width', Math.max(0, X(400) - X(xs)));
      bandBT.setAttribute('x', (X(0) + X(xs)) / 2);
      bandAT.setAttribute('x', (X(xs) + X(400)) / 2);
      bandBT.setAttribute('opacity', X(xs) - X(0) > 70 ? 1 : 0);
      bandAT.setAttribute('opacity', X(400) - X(xs) > 70 ? 1 : 0);
      const yA = fA(x), yB = fB(x);
      cur.setAttribute('x1', X(x)); cur.setAttribute('x2', X(x));
      dA.setAttribute('cx', X(x)); dA.setAttribute('cy', Y(yA));
      dB.setAttribute('cx', X(x)); dB.setAttribute('cy', Y(yB));
      const tx = x > 300 ? X(x) - 8 : X(x) + 8, anc = x > 300 ? 'end' : 'start';
      tA.setAttribute('text-anchor', anc); tB.setAttribute('text-anchor', anc);
      tA.setAttribute('x', tx); tB.setAttribute('x', tx);
      const aHigher = yA >= yB;
      tA.setAttribute('y', Y(yA) + (aHigher ? -14 : 22));
      tB.setAttribute('y', Y(yB) + (aHigher ? 22 : -14));
      tA.textContent = `A: ${fmt(yA)} 元`;
      tB.textContent = `B: ${fmt(yB)} 元`;
      let verdict;
      if (near(yA, yB)) verdict = '两种方案<b>一样贵</b>——正好在交点上！';
      else if (yA < yB) verdict = '<b>选 A 更省</b>（蓝线在下面）。';
      else verdict = '<b>选 B 更省</b>（橙线在下面）。';
      read.innerHTML = `通话 <b>${x}</b> 分钟：<span class="k1">A：${m} + 0.1 × ${x} = ${fmt(yA)} 元</span>，<span class="k2">B：0.25 × ${x} = ${fmt(yB)} 元</span>。${verdict}<br>` +
        `交点：令 ${m} + 0.1<i>x</i> = 0.25<i>x</i>，得 <i>x</i> = ${fmt(xs)}。所以 <i>x</i> &lt; ${fmt(xs)} 时选 B，<i>x</i> = ${fmt(xs)} 时两种一样，<i>x</i> &gt; ${fmt(xs)} 时选 A。`;
    }
    render();
  };

  // ───────── 方程与函数的应用：围篱笆，面积最大 ─────────
  A.x_apply_fence = function (el) {
    const W = 460, Hh = 290;
    const svg = stage(el, W, Hh);
    const sc = 10, cxp = 118, wy = 56;
    // 左：示意图
    const wall = S('rect', { y: wy - 9, height: 9, class: 'fmuted' }, svg);
    const wallT = T(svg, cxp, wy - 15, '', 'ts tb');
    const field = S('rect', { y: wy, class: 'f3s' }, svg);
    const fence = S('path', { class: 'fnone s2 thick round' }, svg);
    const lx = T(svg, 0, 0, 'x', 'ts tb t2 ital', 'end');
    const lL = T(svg, cxp, 0, '20 − 2x', 'ts tb t2');
    const lS = T(svg, cxp, 0, '', 'ts tb');
    const info1 = T(svg, 8, 206, '', 'ts', 'start');
    const info2 = T(svg, 8, 228, '', 'ts', 'start');
    const info3 = T(svg, 8, 250, '', 'ts tb', 'start');
    const warn = T(svg, 8, 274, '', 'ts tb t2', 'start');
    // 右：S–x 图象
    const gx0 = 262, gx1 = 446, gy0 = 240, gy1 = 30;
    const GX = (v) => gx0 + (v / 10) * (gx1 - gx0);
    const GY = (v) => gy0 - (v / 50) * (gy0 - gy1);
    for (let v = 0; v <= 10; v += 2) {
      S('line', { x1: GX(v), x2: GX(v), y1: gy0, y2: gy1, class: 'sline' }, svg);
      T(svg, GX(v), gy0 + 16, v, 'tick');
    }
    for (let v = 0; v <= 50; v += 10) {
      S('line', { x1: gx0, x2: gx1, y1: GY(v), y2: GY(v), class: 'sline' }, svg);
      T(svg, gx0 - 6, GY(v) + 4, v, 'tick', 'end');
    }
    S('line', { x1: gx0, x2: gx0, y1: gy0, y2: gy1 - 8, class: 'sstrong' }, svg);
    S('line', { x1: gx0, x2: gx1, y1: gy0, y2: gy0, class: 'sstrong' }, svg);
    T(svg, gx1, gy0 + 30, 'x', 'tick ital', 'end');
    T(svg, gx0 + 6, gy1 - 10, 'S', 'tick ital', 'start');
    const curveBad = S('path', { class: 'fnone smuted dash' }, svg);
    const curve = S('path', { class: 'fline' }, svg);
    const vtx = S('circle', { cx: GX(5), cy: GY(50), r: 5, class: 'fsurf s3' }, svg);
    const vtxT = T(svg, GX(5), GY(50) - 9, '顶点 (5, 50)', 'ts t3 tb');
    const best6 = S('circle', { cx: GX(6), cy: GY(48), r: 5, class: 'f3' }, svg);
    const best6T = T(svg, GX(6) + 8, GY(48) + 16, '(6, 48)', 'ts t3 tb', 'start');
    const gv = S('line', { class: 'smuted dash thin' }, svg);
    const gh = S('line', { class: 'smuted dash thin' }, svg);
    const dot = S('circle', { r: 6, class: 'mark-y' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let x = 2, lim = false, busy = false;
    const sx = slider(c, 'fx', 'x', 0.5, 9.5, 0.5, x, (v) => { if (busy) return; x = v; render(); });
    btn(c, '自动找最大值', () => {
      if (busy) return;
      busy = true;
      const best = lim ? 6 : 5;
      tween(2200, (t, raw) => { x = lerp(0.5, 9.5, raw); sx.set(Math.round(x * 2) / 2); render(); }, () => {
        tween(700, (t) => { x = lerp(9.5, best, t); sx.set(Math.round(x * 2) / 2); render(); }, () => { x = best; sx.set(best); busy = false; render(); });
      });
    });
    const limB = btn(c, '改成：墙只有 8 m 长', () => {
      if (busy) return;
      lim = !lim;
      limB.textContent = lim ? '改成：墙足够长' : '改成：墙只有 8 m 长';
      render();
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '用 20 m 长的篱笆，一边靠墙围一块长方形菜园。拖动滑块改变垂直于墙的边长 x（米）。');
    const pathOf = (a, b) => {
      let d = '';
      for (let v = a; v <= b + 1e-9; v += 0.1) d += (d ? 'L' : 'M') + GX(v).toFixed(1) + ',' + GY(v * (20 - 2 * v)).toFixed(1);
      return d;
    };
    function render() {
      const L = 20 - 2 * x, area = x * L;
      const half = (L * sc) / 2, h = x * sc;
      const ww = lim ? 8 * sc : 206;
      wall.setAttribute('x', cxp - ww / 2); wall.setAttribute('width', ww);
      wallT.textContent = lim ? '墙（长 8 m）' : '墙（足够长）';
      field.setAttribute('x', cxp - half); field.setAttribute('width', L * sc); field.setAttribute('height', h);
      const bad = lim && L > 8 + 1e-9;
      field.setAttribute('class', bad ? 'f2s' : 'f3s');
      fence.setAttribute('d', `M${cxp - half},${wy} V${wy + h} H${cxp + half} V${wy}`);
      lx.setAttribute('x', cxp - half - 5); lx.setAttribute('y', wy + h / 2 + 5);
      lL.setAttribute('y', wy + h + 17);
      lS.setAttribute('y', wy + h / 2 + 5);
      lS.textContent = h > 22 && L > 4 ? `S = ${fmt(area)}` : '';
      info1.textContent = `垂直于墙的边：x = ${fmt(x)} m`;
      info2.textContent = `平行于墙的边：20 − 2x = ${fmt(L)} m`;
      info3.textContent = `面积 S = ${fmt(x)} × ${fmt(L)} = ${fmt(area)} m²`;
      warn.textContent = bad ? `${fmt(L)} m 比墙还长，围不成！` : '';
      if (lim) { curveBad.setAttribute('d', pathOf(0, 6)); curve.setAttribute('d', pathOf(6, 10)); }
      else { curveBad.setAttribute('d', ''); curve.setAttribute('d', pathOf(0, 10)); }
      best6.setAttribute('opacity', lim ? 1 : 0); best6T.setAttribute('opacity', lim ? 1 : 0);
      vtx.setAttribute('opacity', 1); vtxT.setAttribute('opacity', 1);
      dot.setAttribute('cx', GX(x)); dot.setAttribute('cy', GY(area));
      gv.setAttribute('x1', GX(x)); gv.setAttribute('x2', GX(x)); gv.setAttribute('y1', GY(area)); gv.setAttribute('y2', gy0);
      gh.setAttribute('x1', gx0); gh.setAttribute('x2', GX(x)); gh.setAttribute('y1', GY(area)); gh.setAttribute('y2', GY(area));
      let msg = `<i>S</i> = <i>x</i>(20 − 2<i>x</i>) = −2<i>x</i><sup>2</sup> + 20<i>x</i> = −2(<i>x</i> − 5)<sup>2</sup> + 50。`;
      if (busy) msg += '正在沿着抛物线找最高点……';
      else if (!lim) {
        if (near(x, 5)) msg += '<br>现在 <i>x</i> = 5，正好在顶点，<b>面积最大，是 50 m²</b>（平行于墙的边 10 m）。';
        else msg += `<br>顶点是 (5, 50)。把 <i>x</i> 调得${x < 5 ? '大' : '小'}一点，面积会更大。`;
      } else {
        msg += '<br>墙长 8 m，要求 20 − 2<i>x</i> ≤ 8，即 <b><i>x</i> ≥ 6</b>；又 20 − 2<i>x</i> &gt; 0，所以 6 ≤ <i>x</i> &lt; 10。';
        if (bad) msg += `<br>现在平行于墙的边是 ${fmt(L)} m，<b>超过墙长，不合题意</b>（灰色虚线那段抛物线不能用）。`;
        else if (near(x, 6)) msg += '<br>顶点 <i>x</i> = 5 不在范围内！在 <i>x</i> ≥ 6 时 <i>S</i> 随 <i>x</i> 增大而减小，所以 <b><i>x</i> = 6 时面积最大，为 48 m²</b>。';
        else msg += '<br>在 <i>x</i> ≥ 6 这一段，抛物线一直往下走，<i>x</i> 越小面积越大。试着把 <i>x</i> 调到 6。';
      }
      read.innerHTML = msg;
    }
    render();
  };

  // ───────── 动点问题：矩形边上的动点，分段函数 ─────────
  A.x_dynamic_rect = function (el) {
    const W = 460, Hh = 270;
    const svg = stage(el, W, Hh);
    const sc = 40, Ax = 30, Ay = 210;
    const pt = (x, y) => [Ax + x * sc, Ay - y * sc];
    const V = { A: [0, 0], B: [4, 0], C: [4, 3], D: [0, 3] };
    const tri = S('polygon', { class: 'f2s s2' }, svg);
    const edges = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']].map(([p, q]) => {
      const a = pt(...V[p]), b = pt(...V[q]);
      return S('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'sstrong round' }, svg);
    });
    T(svg, pt(0, 0)[0] - 10, pt(0, 0)[1] + 16, 'A', 'tb ital');
    T(svg, pt(4, 0)[0] + 10, pt(4, 0)[1] + 16, 'B', 'tb ital');
    T(svg, pt(4, 3)[0] + 10, pt(4, 3)[1] - 6, 'C', 'tb ital');
    T(svg, pt(0, 3)[0] - 10, pt(0, 3)[1] - 6, 'D', 'tb ital');
    T(svg, pt(2, 0)[0], pt(2, 0)[1] + 42, 'AB = 4', 'ts tm');
    T(svg, pt(4, 1.5)[0] + 8, pt(4, 1.5)[1] + 4, 'BC = 3', 'ts tm', 'start');
    const hLine = S('line', { class: 's2 dash thin' }, svg);
    const P = S('circle', { r: 7, class: 'mark-y' }, svg);
    const PT = T(svg, 0, 0, 'P', 'tb t2 ital');
    const sT = T(svg, 0, 0, '', 'ts tb');
    // 图象
    const gx0 = 262, gx1 = 446, gy0 = 220, gy1 = 60;
    const GX = (v) => gx0 + (v / 11) * (gx1 - gx0);
    const GY = (v) => gy0 - (v / 7) * (gy0 - gy1);
    S('line', { x1: gx0, x2: gx0, y1: gy0, y2: gy1 - 16, class: 'sstrong' }, svg);
    S('line', { x1: gx0, x2: gx1 + 6, y1: gy0, y2: gy0, class: 'sstrong' }, svg);
    [0, 4, 7, 11].forEach((v) => T(svg, GX(v), gy0 + 16, v, 'tick'));
    [3, 6].forEach((v) => {
      S('line', { x1: gx0, x2: gx1, y1: GY(v), y2: GY(v), class: 'sline' }, svg);
      T(svg, gx0 - 6, GY(v) + 4, v, 'tick', 'end');
    });
    [4, 7].forEach((v) => S('line', { x1: GX(v), x2: GX(v), y1: gy0, y2: gy1 - 10, class: 'smuted dash thin' }, svg));
    T(svg, gx1 + 6, gy0 - 6, 't', 'tick ital', 'end');
    T(svg, gx0 - 8, gy1 - 8, 'S', 'tick ital', 'end');
    const segT = [['① AB 段', 0, 4], ['② BC 段', 4, 7], ['③ CD 段', 7, 11]].map(([s, a, b]) => T(svg, GX((a + b) / 2), gy1 - 22, s, 'ts'));
    const trace = S('polyline', { class: 'fline' }, svg);
    const gdot = S('circle', { r: 6, class: 'mark-y' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let t = 0, playing = false, raf = 0, last = 0;
    const playB = btn(c, '▶ 播放', () => { if (playing) pause(); else play(); });
    btn(c, '回到起点', () => { pause(); t = 0; sl.set(0); render(); }, 'alt');
    const sl = slider(c, 'rt', 't', 0, 11, 0.1, 0, (v) => { pause(); t = v; render(); });
    H('p', { class: 'anim-tip' }, el, '点 P 从 A 出发，以每秒 1 个单位的速度沿 A→B→C→D 运动。播放是真实速度：1 秒走 1 个单位。');
    const posOf = (tt) => (tt <= 4 ? [tt, 0] : tt <= 7 ? [4, tt - 4] : [11 - tt, 3]);
    const Sof = (tt) => (tt <= 4 ? 1.5 * tt : tt <= 7 ? 6 : 1.5 * (11 - tt));
    function play() {
      if (RM) {
        t = t < 4 ? 4 : t < 7 ? 7 : 11;
        sl.set(t); render(); return;
      }
      if (t >= 11) t = 0;
      playing = true; playB.textContent = '❚❚ 暂停';
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function pause() { playing = false; playB.textContent = '▶ 播放'; cancelAnimationFrame(raf); }
    function loop(now) {
      if (!playing) return;
      if (!el.isConnected) { playing = false; return; }
      t = Math.min(11, t + Math.max(0, now - last) / 1000);
      last = now;
      sl.set(Math.round(t * 10) / 10);
      render();
      if (t >= 11) { pause(); return; }
      raf = requestAnimationFrame(loop);
    }
    function render() {
      const p = posOf(t), s = Sof(t), seg = t <= 4 ? 0 : t <= 7 ? 1 : 2;
      const pp = pt(...p), a = pt(0, 0), d = pt(0, 3);
      tri.setAttribute('points', [a, pp, d].map((q) => q.join(',')).join(' '));
      edges.forEach((e, i) => e.setAttribute('class', i === seg ? 's1 thick round' : 'sstrong round'));
      hLine.setAttribute('x1', pp[0]); hLine.setAttribute('y1', pp[1]);
      hLine.setAttribute('x2', Ax); hLine.setAttribute('y2', pp[1]);
      P.setAttribute('cx', pp[0]); P.setAttribute('cy', pp[1]);
      PT.setAttribute('x', pp[0] + (seg === 1 ? 16 : 0)); PT.setAttribute('y', pp[1] + (seg === 0 ? 24 : seg === 2 ? -12 : 5));
      sT.setAttribute('x', (a[0] + pp[0] + d[0]) / 3); sT.setAttribute('y', (a[1] + pp[1] + d[1]) / 3 + 5);
      sT.textContent = s > 1.2 ? `S = ${fmt(s)}` : '';
      segT.forEach((st, i) => st.setAttribute('class', i === seg ? 'ts tb t1' : 'ts tm'));
      const pts = [];
      for (let v = 0; v < t; v += 0.1) pts.push(`${GX(v)},${GY(Sof(v))}`);
      pts.push(`${GX(t)},${GY(s)}`);
      trace.setAttribute('points', pts.join(' '));
      gdot.setAttribute('cx', GX(t)); gdot.setAttribute('cy', GY(s));
      const fr = window.fr, tv = fmt(t);
      let txt;
      if (seg === 0) txt = `① P 在 <b>AB</b> 上（0 ≤ <i>t</i> ≤ 4）：AP = <i>t</i> = ${tv}。以 AD = 3 为底，高就是 AP，<b><i>S</i> = ${fr('3<i>t</i>', 2)}</b> = ${fmt(s)}。<i>S</i> 均匀变大，图象是上升的线段。`;
      else if (seg === 1) txt = `② P 在 <b>BC</b> 上（4 &lt; <i>t</i> ≤ 7）：不管 P 走到哪，它到 AD 的距离都是 AB = 4，<b><i>S</i> = ${fr(1, 2)} × 3 × 4 = 6</b>，不变，图象是水平线段。`;
      else txt = `③ P 在 <b>CD</b> 上（7 &lt; <i>t</i> ≤ 11）：PD = 11 − <i>t</i> = ${fmt(11 - t)}，<b><i>S</i> = ${fr('3(11 − <i>t</i>)', 2)}</b> = ${fmt(s)}，图象是下降的线段。`;
      read.innerHTML = `<i>t</i> = ${tv} 秒，P 走过的路程 = ${tv}。<br>${txt}` + (t >= 11 - 1e-9 ? '<br>P 到达 D，三角形“压扁”了，<i>S</i> = 0。整个图象分成三段——这就是要<b>分段讨论</b>的原因。' : '');
    }
    render();
  };

  // ───────── 动点问题：两个点一起动，面积最值与相似 ─────────
  A.x_dynamic_tri = function (el) {
    const W = 460, Hh = 282;
    const svg = stage(el, W, Hh);
    const sc = 20, Bx = 78, By = 232;
    const Ap = [Bx, By - 6 * sc], Cp = [Bx + 8 * sc, By];
    const tri = S('polygon', { class: 'f2s s2' }, svg);
    S('polygon', { points: `${Ap.join(',')} ${Bx},${By} ${Cp.join(',')}`, class: 'fnone sstrong' }, svg);
    S('path', { d: `M${Bx + 10},${By} v-10 h-10`, class: 'fnone sstrong thin' }, svg);
    T(svg, Ap[0] - 12, Ap[1] + 4, 'A', 'tb ital');
    T(svg, Bx - 12, By + 14, 'B', 'tb ital');
    T(svg, Cp[0] + 10, Cp[1] + 14, 'C', 'tb ital');
    T(svg, 16, 20, 'AB = 6，BC = 8，∠B = 90°', 'ts tm', 'start');
    const P = S('circle', { r: 6, class: 'mark-y' }, svg);
    const Q = S('circle', { r: 6, class: 'mark-x' }, svg);
    const PT = T(svg, 0, 0, 'P', 'tb t2 ital', 'start');
    const QT = T(svg, 0, 0, 'Q', 'tb t1 ital');
    const pbT = T(svg, 0, 0, '', 'ts tb t2', 'end');
    const bqT = T(svg, 0, By + 18, '', 'ts tb t1');
    const simT = T(svg, 16, 44, '', 'tb t3', 'start');
    // 图象
    const gx0 = 272, gx1 = 446, gy0 = 232, gy1 = 44;
    const GX = (v) => gx0 + (v / 4) * (gx1 - gx0);
    const GY = (v) => gy0 - (v / 10) * (gy0 - gy1);
    S('line', { x1: gx0, x2: gx0, y1: gy0, y2: gy1 - 12, class: 'sstrong' }, svg);
    S('line', { x1: gx0, x2: gx1 + 6, y1: gy0, y2: gy0, class: 'sstrong' }, svg);
    for (let v = 0; v <= 4; v++) T(svg, GX(v), gy0 + 16, v, 'tick');
    [3, 6, 9].forEach((v) => {
      S('line', { x1: gx0, x2: gx1, y1: GY(v), y2: GY(v), class: 'sline' }, svg);
      T(svg, gx0 - 6, GY(v) + 4, v, 'tick', 'end');
    });
    T(svg, gx1 + 6, gy0 - 6, 't', 'tick ital', 'end');
    T(svg, gx0 + 6, gy1 - 14, 'S', 'tick ital', 'start');
    let gd = '';
    for (let v = 0; v <= 4.0001; v += 0.05) gd += (gd ? 'L' : 'M') + GX(v).toFixed(1) + ',' + GY(v * (6 - v)).toFixed(1);
    S('path', { d: gd, class: 'fnone smuted dash' }, svg);
    const T1 = 18 / 11, T2 = 2.4;
    [[T1, '①'], [T2, '②']].forEach(([v, s]) => {
      S('line', { x1: GX(v), x2: GX(v), y1: gy0, y2: GY(v * (6 - v)), class: 's3 dash thin' }, svg);
      T(svg, GX(v), gy0 + 30, s, 'ts tb t3');
    });
    T(svg, GX(3), GY(9) - 8, '(3, 9)', 'ts tb t2');
    const trace = S('path', { class: 'fline' }, svg);
    const gdot = S('circle', { r: 6, class: 'mark-y' }, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let t = 1, playing = false, raf = 0, last = 0, busy = false;
    const playB = btn(c, '▶ 播放', () => { if (busy) return; if (playing) pause(); else play(); });
    const sl = slider(c, 'qt', 't', 0, 4, 0.02, t, (v) => { if (busy) return; pause(); t = v; render(); });
    const c2 = ctrl(el);
    const jump = (to) => {
      if (busy) return;
      pause(); busy = true;
      const from = t;
      tween(700, (k) => { t = lerp(from, to, k); sl.set(Math.round(t * 100) / 100); render(); }, () => { t = to; busy = false; sl.set(Math.round(t * 100) / 100); render(); });
    };
    btn(c2, '面积最大时', () => jump(3), 'alt');
    btn(c2, '相似情况①', () => jump(T1), 'alt');
    btn(c2, '相似情况②', () => jump(T2), 'alt');
    H('p', { class: 'anim-tip' }, el, 'P 从 A 向 B 每秒走 1 个单位，Q 从 B 向 C 每秒走 2 个单位，同时出发。Q 先到终点（4 秒），所以 0 ≤ t ≤ 4。');
    function play() {
      if (RM) { t = 4; sl.set(4); render(); return; }
      if (t >= 4) t = 0;
      playing = true; playB.textContent = '❚❚ 暂停';
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function pause() { playing = false; playB.textContent = '▶ 播放'; cancelAnimationFrame(raf); }
    function loop(now) {
      if (!playing) return;
      if (!el.isConnected) { playing = false; return; }
      t = Math.min(4, t + Math.max(0, now - last) / 1000);
      last = now;
      sl.set(Math.round(t * 100) / 100);
      render();
      if (t >= 4) { pause(); return; }
      raf = requestAnimationFrame(loop);
    }
    function render() {
      const pb = 6 - t, bq = 2 * t, s = (pb * bq) / 2;
      const pp = [Bx, By - pb * sc], qq = [Bx + bq * sc, By];
      tri.setAttribute('points', `${pp.join(',')} ${Bx},${By} ${qq.join(',')}`);
      P.setAttribute('cx', pp[0]); P.setAttribute('cy', pp[1]);
      Q.setAttribute('cx', qq[0]); Q.setAttribute('cy', qq[1]);
      PT.setAttribute('x', pp[0] + 10); PT.setAttribute('y', pp[1] - 4);
      QT.setAttribute('x', qq[0]); QT.setAttribute('y', qq[1] - 12);
      pbT.setAttribute('x', Bx - 8); pbT.setAttribute('y', (pp[1] + By) / 2 + 4);
      pbT.textContent = pb > 0.6 ? `PB=${fmt(pb)}` : '';
      bqT.setAttribute('x', (Bx + qq[0]) / 2);
      bqT.textContent = bq > 0.6 ? `BQ = ${fmt(bq)}` : '';
      let d = '';
      for (let v = 0; v < t; v += 0.05) d += (d ? 'L' : 'M') + GX(v).toFixed(1) + ',' + GY(v * (6 - v)).toFixed(1);
      d += (d ? 'L' : 'M') + GX(t).toFixed(1) + ',' + GY(s).toFixed(1);
      trace.setAttribute('d', d);
      gdot.setAttribute('cx', GX(t)); gdot.setAttribute('cy', GY(s));
      const e = 0.011;
      const sim1 = Math.abs(t - T1) < e, sim2 = Math.abs(t - T2) < e;
      tri.setAttribute('class', sim1 || sim2 ? 'f3s s3' : 'f2s s2');
      simT.textContent = sim1 || sim2 ? '△PBQ 与 △ABC 相似！' : '';
      const fr = window.fr;
      const tTxt = sim1 ? `${fr(18, 11)} ≈ 1.64` : fmt(t);
      let txt = `<i>t</i> = ${tTxt} 秒：PB = 6 − <i>t</i> = ${sim1 ? fr(48, 11) : fmt(pb)}，BQ = 2<i>t</i> = ${sim1 ? fr(36, 11) : fmt(bq)}<br>` +
        `<i>S</i> = ${fr(1, 2)} × PB × BQ = ${fr(1, 2)}(6 − <i>t</i>) · 2<i>t</i> = −<i>t</i><sup>2</sup> + 6<i>t</i> = −(<i>t</i> − 3)<sup>2</sup> + 9 ${sim1 ? '≈' : '='} ${fmt(s)}`;
      if (Math.abs(t - 3) < e) txt += '<br><b>t = 3 是顶点，面积最大，S = 9。</b>3 在 0 ≤ t ≤ 4 范围内，可以取到。';
      else if (sim1) txt += `<br><b>情况①：</b>${fr('PB', 'CB')} = ${fr('BQ', 'AB')} = ${fr(6, 11)}，又 ∠B = ∠B，所以 △PBQ ∽ △CBA（P 对应 C，Q 对应 A）。`;
      else if (sim2) txt += `<br><b>情况②：</b>${fr('PB', 'AB')} = ${fr('BQ', 'CB')} = 0.6，又 ∠B = ∠B，所以 △PBQ ∽ △ABC（P 对应 A，Q 对应 C）。`;
      else txt += '<br>相似有两种对应方式，点下面的按钮看两种情况。';
      read.innerHTML = txt;
    }
    render();
  };

  // ───────── 频数分布直方图：拖动组距，看直方图怎么变 ─────────
  A.s_collect_hist = function (el) {
    const W = 460, Hh = 270;
    const svg = stage(el, W, Hh);
    const DATA = [141, 145, 148, 150, 151, 153, 154, 155, 156, 156, 157, 158, 158, 159, 160, 160, 160, 161, 161, 162,
      162, 163, 163, 164, 164, 165, 165, 166, 167, 168, 168, 169, 170, 171, 172, 173, 174, 175, 176, 178];
    const N = DATA.length, MIN = Math.min(...DATA), MAX = Math.max(...DATA), START = MIN - 0.5;
    const x0 = 56, x1 = 446, y0 = 222, yTop = 46;
    const px = (x1 - x0) / 50; // 横轴显示 50 cm 的范围
    const X = (v) => x0 + (v - START) * px;
    const gGrid = S('g', {}, svg);
    const gBars = S('g', {}, svg);
    S('line', { x1: x0, x2: x0, y1: y0, y2: yTop - 8, class: 'sstrong' }, svg);
    S('line', { x1: x0, x2: x1, y1: y0, y2: y0, class: 'sstrong' }, svg);
    T(svg, x0 + 6, yTop - 14, '频数（人）', 'tick', 'start');
    T(svg, x1, Hh - 6, '身高/cm', 'tick', 'end');
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let d = 5, sel = -1, gap = false, grow = 1, stop = null;
    slider(c, 'hd', '组距', 3, 12, 1, d, (v) => { d = v; sel = -1; animate(); });
    const gb = btn(c, '换成条形图的样子', () => {
      gap = !gap;
      gb.textContent = gap ? '换回直方图' : '换成条形图的样子';
      draw(); say();
    }, 'alt');
    function groups() {
      const n = Math.floor((MAX - START) / d) + 1;
      const f = new Array(n).fill(0);
      DATA.forEach((v) => { f[Math.floor((v - START) / d)]++; });
      return f;
    }
    function draw() {
      const f = groups(), n = f.length, top = Math.max(...f);
      const stepY = top <= 10 ? 2 : (top <= 20 ? 4 : 5);
      const ymax = Math.ceil(top / stepY) * stepY, uy = (y0 - yTop) / ymax;
      gGrid.innerHTML = '';
      for (let v = 0; v <= ymax; v += stepY) {
        if (v) S('line', { x1: x0, x2: x1, y1: y0 - v * uy, y2: y0 - v * uy, class: 'sline' }, gGrid);
        T(gGrid, x0 - 6, y0 - v * uy + 4, v, 'tick', 'end');
      }
      const every = Math.max(1, Math.ceil(42 / (d * px)));
      for (let i = 0; i <= n; i += every) {
        const bx = X(START + i * d);
        S('line', { x1: bx, x2: bx, y1: y0, y2: y0 + 5, class: 'sstrong thin' }, gGrid);
        T(gGrid, bx, y0 + 18, String(START + i * d), 'tick');
      }
      gBars.innerHTML = '';
      f.forEach((cnt, i) => {
        const bw = d * px, bx = X(START + i * d), hgt = cnt * uy * grow;
        const w = gap ? bw * 0.6 : bw, xx = gap ? bx + bw * 0.2 : bx;
        const r = S('rect', { x: xx, y: y0 - hgt, width: w, height: hgt, class: (i === sel ? 'f2s s2' : 'f1s s1') + ' clickable' }, gBars);
        r.addEventListener('click', () => { sel = i; draw(); say(); });
        if (cnt && grow > 0.99) {
          const t = T(gBars, bx + bw / 2, y0 - hgt - 4, cnt, 'ts tb');
          t.style.pointerEvents = 'none';
        }
      });
    }
    function say() {
      const f = groups(), n = f.length, R = MAX - MIN, q = R / d;
      let s = `${N} 名同学的身高：最大 ${MAX}，最小 ${MIN}，极差 = ${MAX} − ${MIN} = ${R}。<br>组距 = <span class="k2">${d}</span>，${R} ÷ ${d} ${Number.isInteger(q) ? '=' : '≈'} ${fmt(q)}，${Number.isInteger(q) ? '' : '进一，'}分成 <span class="k1">${n}</span> 组。`;
      if (gap) {
        s += `<br>直条之间留了空隙，看起来像<b>条形图</b>。可是横轴是连续的身高分组，相邻两组首尾相接（如 ${START}～${START + d} 和 ${START + d}～${START + 2 * d}），中间没有空当，所以<b>直方图的直条之间没有空隙</b>。`;
      } else if (sel >= 0 && sel < n) {
        const a = START + sel * d;
        s += `<br>你点的这一组：${a}～${a + d} cm，频数 <span class="k3">${f[sel]}</span> 人，频率 = ${f[sel]} ÷ ${N} = ${+(f[sel] / N).toFixed(3)}。`;
      } else {
        s += '<br>组距越小，组数越多，直条又细又多；组距太大，组数太少，看不出数据的分布。<b>点一根直条</b>，看它的频数和频率。';
      }
      read.innerHTML = s;
    }
    function animate() {
      if (stop) stop();
      stop = tween(500, (t) => { grow = t; draw(); }, () => { grow = 1; stop = null; draw(); say(); });
      say();
    }
    H('p', { class: 'anim-tip' }, el, '提示：分组的端点取 .5（如 140.5），每个身高都是整数，就不会落在两组的分界上。');
    draw(); say();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
