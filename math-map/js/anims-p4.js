// 小学 四年级上册（新版教材补充，p4 组）的动画：多位数乘两位数、加法模型和乘法模型
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider } = window.AH;
  const A = {};
  const tr = (x, y) => `translate(${x},${y})`;

  // ───────────── 三位数乘两位数：面积模型 + 竖式两层 ─────────────
  A.n_mul2_grid = function (el) {
    const W = 460, Hh = 300;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 145, b = 12, hl = 0;
    slider(c, 'm2a', '三位数', 102, 398, 1, a, (v) => { a = v; hl = 0; draw(); });
    slider(c, 'm2b', '两位数', 11, 39, 1, b, (v) => { b = v; hl = 0; draw(); });
    const c2 = ctrl(el);
    const nextBtn = btn(c2, '下一步', () => { hl = hl >= 3 ? 0 : hl + 1; if (hl === 1 && b % 10 === 0) hl = 2; draw(); });
    btn(c2, '重来', () => { hl = 0; draw(); }, 'alt');

    // 方块区：宽固定表示 a，高固定表示 b，按 b 的个位、十位分成两层
    const gx = 40, gy = 46, gw = 222, gh = 170;
    // 竖式区
    const vx = 436, vy0 = 56, lh = 30;

    function draw() {
      g.innerHTML = '';
      const bt = b - (b % 10), bo = b % 10;
      const p1 = a * bo, p2 = a * bt, total = a * b;
      const uy = gh / b;
      const hTop = bt * uy, hBot = bo * uy, gap = bo ? 10 : 0;
      // 顶部标 a，左侧标两层行数
      T(g, gx + gw / 2, gy - 12, `${a}`, 'tb');
      S('line', { x1: gx, x2: gx + gw, y1: gy - 6, y2: gy - 6, class: 'smuted' }, g);
      const rows = [[0, bt, p2, 'f1s', 2], [hTop + gap, bo, p1, 'f2s', 1]];
      rows.forEach(([oy, m, prod, cls, step]) => {
        if (!m) return;
        const y = gy + oy, h = m * uy;
        const on = hl === 0 || hl === 3 || hl === step;
        const pg = S('g', { opacity: on ? 1 : 0.22 }, g);
        S('rect', { x: gx, y, width: gw, height: h, class: cls + ' sstrong', rx: 3 }, pg);
        if (uy >= 7) for (let k = 1; k < m; k++) S('line', { x1: gx, x2: gx + gw, y1: y + k * uy, y2: y + k * uy, class: 'cell' }, pg);
        [100, 200, 300].forEach((k) => { if (k < a) S('line', { x1: gx + (gw * k) / a, x2: gx + (gw * k) / a, y1: y, y2: y + h, class: 'cell' }, pg); });
        T(pg, gx - 8, y + h / 2 + 5, `${m}`, 'tb', 'end');
        if (h >= 20) {
          const txt = `${a} × ${m} = ${prod}`;
          const tw = txt.length * 7.5 + 10;
          S('rect', { x: gx + gw / 2 - tw / 2, y: y + h / 2 - 10, width: tw, height: 20, rx: 5, class: 'fsurf' }, pg);
          T(pg, gx + gw / 2, y + h / 2 + 5, txt, 'tb');
        } else {
          T(pg, gx + gw + 6, y + h / 2 + 5, `${a} × ${m} = ${prod}`, 'ts', 'start');
        }
      });
      T(g, gx + gw / 2, gy + gh + gap + 22, `一共 ${b} 行，每行 ${a}`, 'note');

      // 竖式
      const col = (s, cls, dy, shift) => {
        // 右对齐：shift 表示整体向左挪几位（第二层末位对齐十位）
        const chars = String(s).split('');
        chars.forEach((ch, i) => T(g, vx - (chars.length - 1 - i + (shift || 0)) * 14, dy, ch, cls));
      };
      const lineCls = (step) => (hl === 0 || hl === 3 || hl === step ? 'tl tb' : 'tl tm');
      T(g, 330, vy0 - 26, '竖式', 'note', 'start');
      col(a, 'tl', vy0);
      T(g, vx - 14 * 3 - 10, vy0 + lh, '×', 'tl');
      col(b, 'tl', vy0 + lh);
      S('line', { x1: 318, x2: vx + 10, y1: vy0 + lh + 10, y2: vy0 + lh + 10, class: 'sstrong' }, g);
      let y = vy0 + lh * 2 + 4;
      if (bo) {
        col(p1, lineCls(1), y);
        if (hl === 1) T(g, 312, y, `← ${a}×${bo}`, 'ts t2', 'end');
        y += lh;
      }
      // 第二层：写 a×bt/10，末位对齐十位
      const p2s = p2 / 10;
      col(p2s, lineCls(2), y, 1);
      if (hl === 2) T(g, 312, y, `← ${a}×${bt}`, 'ts t1', 'end');
      if (hl === 2) T(g, vx, y, '0', 'tl tm');
      y += 10;
      S('line', { x1: 318, x2: vx + 10, y1: y, y2: y, class: 'sstrong' }, g);
      y += lh - 6;
      if (hl === 3) col(total, 'tl tb', y);
      else col('?', 'tl tm', y);

      let s;
      if (hl === 1) s = `第一层：用个位上的 <span class="k2">${bo}</span> 去乘 ${a}，${a} × ${bo} = <span class="k2">${p1}</span>，就是下面亮着的 ${bo} 行。末位和<b>个位</b>对齐。`;
      else if (hl === 2) s = `第二层：用十位上的 <span class="k1">${bt / 10}</span> 去乘 ${a}，得 ${a} × ${bt} = <span class="k1">${p2}</span>，就是上面亮着的 ${bt} 行。它表示 ${p2s} 个十，所以 ${p2s} 的末位要写在<b>十位</b>上（末尾的 0 可以不写）。`;
      else if (hl === 3) s = `两层加起来：${bo ? `${p1} + ${p2} = ` : ''}<b>${total}</b>。所以 ${a} × ${b} = <b>${total}</b>。估算检查：${a} 看成 ${Math.round(a / 10) * 10}，${b} 看成 ${Math.round(b / 10) * 10}，${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ${Math.round(a / 10) * 10 * Math.round(b / 10) * 10}，得数在它附近，没算错。`;
      else s = `${b} 行，每行 ${a} 个，一共 ${a} × ${b} 个。把 ${b} 拆成 ${bt}${bo ? ` + ${bo}` : ''}，方块分成${bo ? '两' : '一'}层：${bo ? `${a} × ${bo} 和 ` : ''}${a} × ${bt}。点“下一步”看竖式每一层算的是哪一块。`;
      read.innerHTML = s;
      nextBtn.textContent = ['下一步', '第二层', '加起来', '回到开头'][hl];
    }
    draw();
  };

  // ───────────── 积的变化规律：一个因数不变，另一个乘几 / 除以几 ─────────────
  A.n_mul2_scale = function (el) {
    const W = 460, Hh = 250;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const A0 = 24;
    let mode = 'mul', k = 3, shown = 1; // shown：当前显示的倍数（用于过渡动画）
    const base = () => (mode === 'mul' ? 15 : 60);
    const sl = slider(c, 'm2k', '乘几', 1, 6, 1, k, (v) => { k = v; animTo(); });
    const c2 = ctrl(el);
    const modeBtn = btn(c2, '换成除以', () => {
      mode = mode === 'mul' ? 'div' : 'mul';
      modeBtn.textContent = mode === 'mul' ? '换成除以' : '换成乘';
      c.querySelector('label').textContent = mode === 'mul' ? '乘几' : '除以几';
      k = mode === 'mul' ? 3 : 2;
      sl.set(k);
      animTo();
    }, 'alt');

    let stop = null;
    function animTo() {
      if (stop) stop();
      const from = shown, to = k;
      stop = tween(500, (t) => { shown = lerp(from, to, t); draw(); }, () => { shown = to; stop = null; draw(); });
    }

    function draw() {
      g.innerHTML = '';
      const b0 = base(), P0 = A0 * b0;
      const b1 = mode === 'mul' ? b0 * k : b0 / k, P1 = A0 * b1;
      const bs = mode === 'mul' ? b0 * shown : b0 / shown, Ps = A0 * bs;
      // 比例：最长的条（因数 90 或积 2160）占 300px
      const maxF = mode === 'mul' ? b0 * 6 : b0, maxP = A0 * maxF;
      const x0 = 110, L = 200;
      const row = (y, label, len, val, cls, txt) => {
        T(g, x0 - 8, y + 16, label, 'tb', 'end');
        S('rect', { x: x0, y, width: Math.max(2, len), height: 22, rx: 4, class: cls + ' sstrong' }, g);
        T(g, x0 + Math.max(len, 0) + 6, y + 16, txt == null ? fmt(val) : txt, 'tb', 'start');
      };
      T(g, 14, 22, `一个因数 ${A0} 不变，另一个因数${mode === 'mul' ? '乘' : '除以'} ${k}`, 'note strong', 'start');
      row(40, '原来的因数', (b0 / maxF) * L, b0, 'f1s');
      row(70, '原来的积', (P0 / maxP) * L, P0, 'f2s', `${A0} × ${b0} = ${P0}`);
      S('line', { x1: 14, x2: W - 14, y1: 112, y2: 112, class: 'sline dash' }, g);
      row(130, '现在的因数', (bs / maxF) * L, bs, 'f1', fmt(Math.round(bs * 100) / 100));
      row(160, '现在的积', (Ps / maxP) * L, Ps, 'f2', `${A0} × ${fmt(bs)} = ${fmt(Ps)}`);
      // 倍数标注
      const mark = mode === 'mul' ? `× ${k}` : `÷ ${k}`;
      T(g, x0 - 8, 214, `因数 ${mark}`, 't1 tb', 'end');
      T(g, x0 + 40, 214, '→', 'tm');
      T(g, x0 + 70, 214, `积也 ${mark}`, 't2 tb', 'start');
      T(g, x0 + 160, 214, `${P0} ${mark} = ${P1}`, 'tb', 'start');
      read.innerHTML = mode === 'mul'
        ? `${A0} 不变，${b0} 乘 ${k} 变成 <span class="k1">${b1}</span>，积 ${P0} 也乘 ${k}，变成 <span class="k2">${P1}</span>。${k === 1 ? '拖动滑块试试。' : `看长条：积的长条正好是原来的 ${k} 倍。`}`
        : `${A0} 不变，${b0} 除以 ${k} 变成 <span class="k1">${b1}</span>，积 ${P0} 也除以 ${k}，变成 <span class="k2">${P1}</span>。${k === 1 ? '拖动滑块试试。' : `看长条：积的长条缩成原来的 ${k} 分之一。`}`;
    }
    shown = k;
    draw();
  };

  // ───────────── 加法模型：线段图 ─────────────
  A.n_model_bar = function (el) {
    const W = 460, Hh = 190;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let p1 = 126, p2 = 85, mode = 'sum';
    slider(c, 'bar1', '故事书', 10, 200, 1, p1, (v) => { p1 = v; draw(); });
    slider(c, 'bar2', '科学书', 10, 200, 1, p2, (v) => { p2 = v; draw(); });
    const c2 = ctrl(el);
    const modeBtn = btn(c2, '求部分', () => {
      mode = mode === 'sum' ? 'part' : 'sum';
      modeBtn.textContent = mode === 'sum' ? '求部分' : '求总量';
      draw();
    });

    const x0 = 30, u = 400 / 400, y = 86, h = 28;
    function brace(x1, x2, yy, up) {
      const m = (x1 + x2) / 2, d = up ? -1 : 1;
      S('path', { d: `M${x1} ${yy} q0 ${8 * d} 8 ${8 * d} H${m - 8} q8 0 8 ${8 * d} q0 ${-8 * d} 8 ${-8 * d} H${x2 - 8} q8 0 8 ${-8 * d}`, class: 'fnone sstrong round' }, g);
    }
    function draw() {
      g.innerHTML = '';
      const tot = p1 + p2, w1 = p1 * u, w2 = p2 * u;
      S('rect', { x: x0, y, width: w1, height: h, class: 'f1s sstrong' }, g);
      S('rect', { x: x0 + w1, y, width: w2, height: h, class: 'f2s sstrong' }, g);
      const ask2 = mode === 'part';
      T(g, x0 + w1 / 2, y + h + 20, `故事书 ${p1} 本`, 'tb t1');
      T(g, x0 + w1 + w2 / 2, y + h + 20, ask2 ? '科学书 ？本' : `科学书 ${p2} 本`, 'tb t2');
      brace(x0, x0 + tot * u, y - 6, true);
      T(g, x0 + (tot * u) / 2, y - 24, ask2 ? `一共 ${tot} 本` : '一共 ？本', 'tb');
      if (ask2) {
        // 把“？”的那一段标虚线框强调
        S('rect', { x: x0 + w1, y, width: w2, height: h, class: 'fnone s2 dash' }, g);
        T(g, W / 2, Hh - 12, `${tot} − ${p1} = ${p2}`, 'tl tb');
        read.innerHTML = `知道总量 <b>${tot}</b> 本，故事书 <span class="k1">${p1}</span> 本，求科学书：部分 = 总量 − 另一部分，${tot} − ${p1} = <span class="k2">${p2}</span> 本。`;
      } else {
        T(g, W / 2, Hh - 12, `${p1} + ${p2} = ${tot}`, 'tl tb');
        read.innerHTML = `故事书 <span class="k1">${p1}</span> 本，科学书 <span class="k2">${p2}</span> 本，两部分合起来：总量 = 部分 + 部分，${p1} + ${p2} = <b>${tot}</b> 本。`;
      }
    }
    draw();
  };

  // ───────────── 乘法模型：小车跑路程 ─────────────
  A.n_model_trip = function (el) {
    const W = 460, Hh = 230;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let v = 75, tmax = 3, t = 3, busy = false;
    slider(c, 'spd', '速度', 40, 120, 5, v, (x) => { v = x; if (!busy) { t = tmax; draw(); } });
    slider(c, 'tim', '时间', 0, 6, 1, tmax, (x) => { tmax = x; if (!busy) { t = tmax; draw(); } });
    const c2 = ctrl(el);
    btn(c2, '出发', () => {
      if (busy || tmax === 0) return;
      busy = true;
      tween(1600, (_, lin) => { t = lin * tmax; draw(); }, () => { t = tmax; busy = false; draw(); });
    });

    const x0 = 30, L = 400, maxD = 720, X = (d) => x0 + (d / maxD) * L, ry = 150;
    function car(x) {
      const cg = S('g', { transform: tr(x, ry - 22) }, g);
      S('rect', { x: -22, y: 0, width: 44, height: 16, rx: 4, class: 'f2 sstrong' }, cg);
      S('rect', { x: -12, y: -10, width: 22, height: 12, rx: 3, class: 'f2s sstrong' }, cg);
      S('circle', { cx: -12, cy: 18, r: 5, class: 'fstrong' }, cg);
      S('circle', { cx: 12, cy: 18, r: 5, class: 'fstrong' }, cg);
    }
    function draw() {
      g.innerHTML = '';
      const d = v * t;
      // 公路
      S('rect', { x: x0 - 10, y: ry - 4, width: L + 20, height: 12, rx: 3, class: 'fsurf2 sline' }, g);
      for (let k = 0; k <= maxD; k += 100) {
        S('line', { x1: X(k), x2: X(k), y1: ry - 8, y2: ry + 12, class: 'smuted' }, g);
        T(g, X(k), ry + 30, `${k}`, 'tick');
      }
      T(g, W - 10, ry + 46, '千米', 'tick', 'end');
      // 走过的路程
      if (d > 0) S('rect', { x: x0, y: ry - 2, width: X(d) - x0, height: 8, rx: 2, class: 'f1' }, g);
      // 每小时一段的刻度
      for (let k = 1; k <= Math.floor(t + 1e-9); k++) {
        S('line', { x1: X(v * k), x2: X(v * k), y1: ry - 40, y2: ry - 33, class: 's1' }, g);
        T(g, X(v * k), ry - 44, `${k} 时`, 'ts t1');
      }
      car(X(d));
      T(g, 14, 24, `速度 ${v} 千米/时（每小时行 ${v} 千米），读作“${v} 千米每时”`, 'note strong', 'start');
      T(g, 14, 50, `速度 × 时间 = 路程`, 'tb', 'start');
      T(g, 14, 76, `${v} × ${fmt(t)} = ${fmt(d)}（千米）`, 'tl tb t1', 'start');
      read.innerHTML = tmax === 0
        ? '时间是 0，小车还没出发，路程是 0。拖动“时间”滑块，或点“出发”。'
        : `小车以 <span class="k1">${v} 千米/时</span> 的速度跑了 <span class="k2">${fmt(t)}</span> 小时，每小时跑 ${v} 千米，一共跑了 ${v} × ${fmt(t)} = <b>${fmt(d)}</b> 千米。${t === tmax ? `反过来：路程 ${d} ÷ 时间 ${tmax} = 速度 ${v}，路程 ${d} ÷ 速度 ${v} = 时间 ${tmax}。` : ''}`;
    }
    draw();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
