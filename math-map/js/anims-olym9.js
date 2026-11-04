// 奥数拓展 第 9 批（olym9）的动画：列方程、工程问题、比例应用题、浓度问题、经济问题、牛吃草问题
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider } = window.AH;
  const A = {};
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  // 化简分数，返回竖式分数 HTML（整数直接返回数字）
  const frac = (p, q) => {
    const g = gcd(p, q);
    p /= g; q /= g;
    return q === 1 ? `${p}` : window.fr(p, q);
  };
  const xs = (k) => (k === 1 ? 'x' : `${k}x`);

  // ───────────── 列方程：线段图与方程对照 ─────────────
  A.o_eq_app_compare = function (el) {
    const W = 460, Hh = 272;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mode = 0, k = 3, n = 12, step = 0, busy = false;
    const nextB = btn(c, '下一步', () => {
      if (busy) return;
      if (step >= 3) { step = 0; draw(1); return; }
      step++;
      busy = true;
      tween(700, (t) => draw(t), () => { busy = false; draw(1); });
    });
    const modeB = btn(c, '换成差倍问题', () => {
      if (busy) return;
      mode = 1 - mode;
      modeB.textContent = mode ? '换成和倍问题' : '换成差倍问题';
      step = 0; draw(1);
    }, 'alt');
    const c2 = ctrl(el);
    slider(c2, 'eqk', '倍数', 2, 5, 1, k, (v) => { if (busy) return; k = v; step = 0; draw(1); });
    slider(c2, 'eqn', '乙是', 4, 20, 1, n, (v) => { if (busy) return; n = v; step = 0; draw(1); });

    function draw(t) {
      g.innerHTML = '';
      const parts = mode ? k - 1 : k + 1;
      const tot = parts * n;
      const q = mode ? `甲比乙多 ${tot}，甲是乙的 ${k} 倍` : `甲、乙共 ${tot}，甲是乙的 ${k} 倍`;
      T(g, W / 2, 24, q + '，甲、乙各是多少？', 'tb');
      S('line', { x1: 236, x2: 236, y1: 40, y2: Hh - 6, class: 'sline dash' }, g);
      T(g, 118, 52, '算术：画线段图', 'note');
      T(g, 348, 52, '方程：设未知数', 'note');
      const u = 30, x0 = 44, yA = 70, yB = 110, bh = 24;
      const op = (s) => (step === s ? t : step > s ? 1 : 0);
      // 第 1 步：画线段 / 设 x
      if (step >= 1) {
        const o = op(1);
        const gg = S('g', { opacity: o }, g);
        T(gg, 26, yA + 17, '甲', 'tb');
        T(gg, 26, yB + 17, '乙', 'tb');
        for (let i = 0; i < k; i++) {
          S('rect', { x: x0 + i * u * o, y: yA, width: u, height: bh, class: 'f2s s2' }, gg);
          T(gg, x0 + i * u * o + u / 2, yA + 17, '1份', 'ts');
        }
        S('rect', { x: x0, y: yB, width: u, height: bh, class: 'f1s s1' }, gg);
        T(gg, x0 + u / 2, yB + 17, '1份', 'ts');
        T(gg, 250, 90, '设乙为 x，', 'tl t1', 'start');
        T(gg, 250, 118, `则甲为 ${xs(k)}。`, 'tl t2', 'start');
      }
      // 第 2 步：找等量关系
      if (step >= 2) {
        const o = op(2);
        const gg = S('g', { opacity: o }, g);
        if (mode === 0) {
          const y3 = 150;
          T(gg, 26, y3 + 17, '合', 'tb');
          for (let i = 0; i <= k; i++) S('rect', { x: x0 + i * u, y: y3, width: u, height: bh, class: (i < k ? 'f2s s2' : 'f1s s1') }, gg);
          const xe = x0 + (k + 1) * u;
          S('path', { d: `M${x0},${y3 + bh + 6} v8 H${xe} v-8`, class: 'fnone sstrong' }, gg);
          T(gg, (x0 + xe) / 2, y3 + bh + 30, `${k + 1} 份，共 ${tot}`, 'tb');
          T(gg, 250, 162, `x + ${k}x = ${tot}`, 'tl tb', 'start');
          T(gg, 250, 184, '（乙 + 甲 = 和）', 'ts tm', 'start');
        } else {
          const xa = x0 + u, xe = x0 + k * u;
          S('rect', { x: xa, y: yB, width: xe - xa, height: bh, class: 'f3s s3 dash' }, gg);
          T(gg, (xa + xe) / 2, yB + 17, `多 ${tot}`, 'tb');
          T(gg, (xa + xe) / 2, yB + bh + 22, `${k - 1} 份`, 'ts tm');
          T(gg, 250, 162, `${k}x − x = ${tot}`, 'tl tb', 'start');
          T(gg, 250, 184, '（甲 − 乙 = 差）', 'ts tm', 'start');
        }
      }
      // 第 3 步：求解
      if (step >= 3) {
        const o = op(3);
        const gg = S('g', { opacity: o }, g);
        T(gg, 20, 232, `1 份 = ${tot} ÷ ${parts} = ${n}`, 'tb t1', 'start');
        T(gg, 20, 256, `甲 = ${n} × ${k} = ${n * k}`, 'tb t2', 'start');
        T(gg, 250, 212, `${parts}x = ${tot}`, 'tl', 'start');
        T(gg, 250, 238, `x = ${n}`, 'tl tb t1', 'start');
        T(gg, 250, 262, `甲：${k}x = ${n * k}`, 'tb t2', 'start');
      }
      nextB.textContent = step >= 3 ? '重新开始' : '下一步';
      const msg = [
        '先读题。左边用算术的线段图，右边用方程，看两种方法怎样一一对应。点“下一步”。',
        `线段图把乙看作 <span class="k1">1 份</span>，方程就设乙为 <span class="k1"><i>x</i></span>；甲是乙的 ${k} 倍：<span class="k2">${k} 份</span> ↔ <span class="k2">${k}<i>x</i></span>。`,
        mode === 0
          ? `线段图里两段合起来是 ${k + 1} 份，共 ${tot}；方程把同一句话写成等量关系“乙 + 甲 = 和”：<b><i>x</i> + ${k}<i>x</i> = ${tot}</b>。`
          : `线段图里甲比乙多出 ${k - 1} 份，就是多的 ${tot}；方程写成“甲 − 乙 = 差”：<b>${k}<i>x</i> − <i>x</i> = ${tot}</b>。`,
        `左边倒着想：${tot} ÷ ${parts} 求出 1 份；右边顺着算：${parts}<i>x</i> = ${tot}，两边同时除以 ${parts}。两边都得到 <span class="k1">乙 = ${n}</span>、<span class="k2">甲 = ${n * k}</span>。`
      ];
      read.innerHTML = msg[step];
    }
    draw(1);
  };

  // ───────────── 列方程：天平解方程 ─────────────
  A.o_eq_app_balance = function (el) {
    const W = 480, Hh = 230, px = 240, py = 150;
    const svg = stage(el, W, Hh);
    const eqT = T(svg, W / 2, 32, '', 'tl tb');
    S('polygon', { points: `${px},${py + 4} ${px - 26},${py + 58} ${px + 26},${py + 58}`, class: 'fsurf2 sstrong' }, svg);
    S('line', { x1: 150, x2: 330, y1: py + 59, y2: py + 59, class: 'sstrong' }, svg);
    const beam = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 3, cx = 1, x = 4, b = 5, busy = false, tilt = 0;
    let st;
    const nextB = btn(c, '下一步', next);
    btn(c, '只动一边会怎样', oneSide, 'alt');
    btn(c, '重来', () => { if (!busy) { reset(); draw(); } }, 'alt');
    const c2 = ctrl(el);
    slider(c2, 'ba', '左边 x 个数', 2, 4, 1, a, (v) => { if (busy) return; a = v; if (cx > a - 1) { cx = a - 1; sc.set(cx); } reset(); draw(); });
    const sc = slider(c2, 'bcx', '右边 x 个数', 0, 2, 1, cx, (v) => { if (busy) return; cx = Math.min(v, a - 1); sc.set(cx); reset(); draw(); });
    slider(c2, 'bb', '左边砝码', 1, 12, 1, b, (v) => { if (busy) return; b = v; reset(); draw(); });
    slider(c2, 'bx', '藏着的 x', 1, 9, 1, x, (v) => { if (busy) return; x = v; reset(); draw(); });

    function reset() {
      st = { L: { n: a, w: b }, R: { n: cx, w: (a - cx) * x + b }, step: 0, fade: null, msg: '' };
      tilt = 0;
    }
    const side = (o) => {
      const p = [];
      if (o.n) p.push(xs(o.n));
      if (o.w) p.push(`${o.w}`);
      return p.length ? p.join(' + ') : '0';
    };
    // items: [{kind:'x'|'w', val, op}]
    function items(sd, f) {
      const o = st[sd], out = [];
      const fx = f ? f[sd + 'x'] || 0 : 0;
      for (let i = 0; i < o.n; i++) out.push({ kind: 'x', op: i >= o.n - fx ? f.op : 1 });
      if (o.w) {
        const parts = f && f[sd + 'w'];
        if (parts) parts.forEach((p) => out.push({ kind: 'w', val: p[0], op: p[1] ? f.op : 1 }));
        else out.push({ kind: 'w', val: o.w, op: 1 });
      }
      return out;
    }
    function drawSide(list, cxp) {
      const wOf = (it) => (it.kind === 'x' ? 30 : Math.max(34, 14 + String(it.val).length * 10));
      const total = list.reduce((s, it) => s + wOf(it) + 6, -6);
      let xx = cxp - total / 2;
      list.forEach((it) => {
        const w = wOf(it);
        const gg = S('g', { opacity: it.op }, beam);
        if (it.kind === 'x') {
          S('rect', { x: xx, y: py - 34, width: w, height: 30, rx: 4, class: 'f2s s2' }, gg);
          T(gg, xx + w / 2, py - 14, 'x', 'tb ital');
        } else {
          S('rect', { x: xx, y: py - 30, width: w, height: 26, rx: 6, class: 'f1s s1' }, gg);
          T(gg, xx + w / 2, py - 12, `${it.val}`, 'tb');
        }
        xx += w + 6;
      });
    }
    function draw() {
      beam.innerHTML = '';
      beam.setAttribute('transform', `rotate(${tilt},${px},${py})`);
      S('rect', { x: 20, y: py - 3, width: W - 40, height: 7, rx: 3, class: 'fstrong' }, beam);
      drawSide(items('L', st.fade), 128);
      drawSide(items('R', st.fade), 352);
      eqT.textContent = `${side(st.L)} = ${side(st.R)}`;
      const done = st.L.n === 1 && !st.L.w && !st.R.n;
      nextB.disabled = done;
      if (st.msg) read.innerHTML = st.msg;
      else read.innerHTML = `天平两边一样重：<b>${side(st.L)} = ${side(st.R)}</b>。每个 <i>x</i> 盒子里藏着同样重的东西，点“下一步”把它找出来。`;
    }
    function animate(fade, commit, msg) {
      busy = true;
      st.fade = fade; fade.op = 1;
      draw();
      setTimeout(() => {
        tween(800, (t) => { fade.op = 1 - t; draw(); }, () => {
          st.fade = null; commit(); st.msg = msg(); busy = false; draw();
        });
      }, 350);
    }
    function next() {
      if (busy) return;
      const L = st.L, R = st.R;
      if (R.n > 0) {
        const m = R.n;
        animate({ Lx: m, Rx: m }, () => { L.n -= m; R.n = 0; },
          () => `两边同时拿走 ${m} 个 <i>x</i>，天平还是平的：<b>${side(L)} = ${side(R)}</b>。现在只有左边有 <i>x</i> 了。`);
      } else if (L.w > 0) {
        const w = L.w;
        animate({ Lw: [[w, true]], Rw: [[R.w - w, false], [w, true]] }, () => { R.w -= w; L.w = 0; },
          () => `两边同时减去 ${w}（右边的砝码也拆出一个 ${w} 拿走）：<b>${side(L)} = ${side(R)}</b>。`);
      } else if (L.n > 1) {
        const m = L.n, each = R.w / m;
        const parts = [];
        for (let i = 0; i < m; i++) parts.push([each, i > 0]);
        animate({ Lx: m - 1, Rw: parts }, () => { L.n = 1; R.w = each; },
          () => `${m} 个 <i>x</i> 重 ${each * m}，把两边同时平均分成 ${m} 份，只留 1 份：<b><i>x</i> = ${each}</b>。检验：把 ${each} 放回原方程，两边一样重。`);
      }
    }
    function oneSide() {
      if (busy) return;
      busy = true;
      const keep = st.msg;
      st.msg = '只在<b>左边</b>拿走东西，右边不动——左边变轻，天平歪了！解方程时，两边必须做<b>同样的事</b>。';
      tween(600, (t) => { tilt = 9 * t; draw(); }, () => {
        setTimeout(() => {
          tween(600, (t) => { tilt = 9 * (1 - t); draw(); }, () => { tilt = 0; st.msg = keep; busy = false; draw(); });
        }, 1300);
      });
    }
    H('p', { class: 'anim-tip' }, el, '提示：蓝色是砝码（数字表示重量），橙色盒子是 x。先拖动滑块编一个方程，再点“下一步”。');
    reset();
    draw();
  };

  // ───────────── 工程问题：水池注水 ─────────────
  A.o_work_pool = function (el) {
    const W = 460, Hh = 270;
    const svg = stage(el, W, Hh);
    const px0 = 70, px1 = 240, top = 70, bot = 250, ph = bot - top;
    const g = S('g', {}, svg);
    const info = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let a = 10, b = 15, mode = 0, prog = 0, busy = false, stop = null;
    const MODES = ['甲乙一起', '只开甲', '只开乙'];
    btn(c, '开始注水', run);
    const mb = MODES.map((m, i) => btn(c, m, () => { if (busy) return; mode = i; prog = 0; mb.forEach((x, j) => x.classList.toggle('alt', j !== i)); draw(); }, i ? 'alt' : ''));
    const c2 = ctrl(el);
    slider(c2, 'wa', '甲独做天数', 2, 20, 1, a, (v) => { a = v; halt(); draw(); });
    slider(c2, 'wb', '乙独做天数', 2, 20, 1, b, (v) => { b = v; halt(); draw(); });
    function halt() { if (stop) stop(); stop = null; busy = false; prog = 0; }
    // 效率（以 a*b 为分母的整数表示）
    const rateNum = () => (mode === 0 ? a + b : mode === 1 ? b : a); // 每天完成 rateNum/(a*b)
    const days = () => (a * b) / rateNum();

    function draw() {
      g.innerHTML = '';
      const D = days();
      const day = prog;
      const fill = Math.min(1, day / D);
      const shA = mode === 2 ? 0 : mode === 1 ? 1 : b / (a + b);
      // 水管
      const pipes = mode === 0 ? [[110, '甲', 'f1s s1'], [200, '乙', 'f2s s2']] : mode === 1 ? [[110, '甲', 'f1s s1']] : [[200, '乙', 'f2s s2']];
      pipes.forEach(([x, name, cls]) => {
        S('rect', { x: x - 16, y: 18, width: 32, height: 24, rx: 4, class: cls }, g);
        T(g, x, 35, name, 'tb');
        if (busy && fill < 1) S('line', { x1: x, x2: x, y1: 42, y2: bot - fill * ph, class: (name === '甲' ? 's1' : 's2') + ' thick dash' }, g);
      });
      // 水
      const hA = fill * ph * shA, hB = fill * ph * (1 - shA);
      if (hA > 0) S('rect', { x: px0, y: bot - hA, width: px1 - px0, height: hA, class: 'f1s' }, g);
      if (hB > 0) S('rect', { x: px0, y: bot - hA - hB, width: px1 - px0, height: hB, class: 'f2s' }, g);
      // 池壁
      S('path', { d: `M${px0},${top - 8} V${bot} H${px1} V${top - 8}`, class: 'fnone sstrong' }, g);
      S('line', { x1: px0 - 6, x2: px1 + 6, y1: top, y2: top, class: 'sline dash' }, g);
      T(g, px1 + 10, top + 4, '满（1）', 'ts tm', 'start');
      // 每天刻度
      const nd = Math.floor(D + 1e-9);
      const gap = ph / D;
      const every = gap >= 14 ? 1 : gap >= 7 ? 2 : 5;
      for (let i = 1; i <= nd; i++) {
        const y = bot - (i / D) * ph;
        if (y < top - 0.5) break;
        S('line', { x1: px0, x2: px0 + 10, y1: y, y2: y, class: 'smuted' }, g);
        if (i % every === 0 || i === nd) T(g, px0 - 6, y + 4, `${i}天`, 'ts tm', 'end');
      }
      // 右边说明
      info.innerHTML = '';
      const x = 270;
      T(info, x, 104, `甲每天注 1/${a} 池`, 't1 tb', 'start');
      T(info, x, 128, `乙每天注 1/${b} 池`, 't2 tb', 'start');
      const rn = rateNum(), g1 = gcd(rn, a * b);
      const rTxt = (rn / g1 === a * b / g1) ? '1' : `${rn / g1}/${(a * b) / g1}`;
      T(info, x, 158, mode === 0 ? `合起来每天 ${rTxt} 池` : mode === 1 ? `只开甲：每天 1/${a} 池` : `只开乙：每天 1/${b} 池`, 'tb', 'start');
      T(info, x, 184, `注满要 1 ÷ ${rTxt === '1' ? 1 : rTxt}`, '', 'start');
      T(info, x, 210, `= ${fmt(D)} 天`, 'tl tb t3', 'start');
      T(info, x, 238, `已过 ${fmt(Math.min(day, D))} 天`, 'ts tm', 'start');
      // 读数
      if (!busy && prog === 0) {
        read.innerHTML = `把整池水看作 1。甲 ${a} 天注满，每天注 ${window.fr(1, a)}；乙 ${b} 天注满，每天注 ${window.fr(1, b)}。点“开始注水”。`;
      } else {
        const d = Math.min(Math.floor(day + 1e-9), nd);
        if (fill >= 1) {
          read.innerHTML = mode === 0
            ? `注满了！合作效率 ${window.fr(1, a)} + ${window.fr(1, b)} = ${frac(a + b, a * b)}，1 ÷ ${frac(a + b, a * b)} = <b>${frac(a * b, a + b)}${Number.isInteger(D) ? '' : ' = ' + fmt(D)} 天</b>，比甲（${a} 天）、乙（${b} 天）单独做都快。`
            : `只用${mode === 1 ? '甲' : '乙'}，要 <b>${mode === 1 ? a : b} 天</b>才注满。再点“甲乙一起”比较一下。`;
        } else {
          read.innerHTML = `第 ${d} 天结束：注了 ${d} × ${frac(rn, a * b)} = <b>${frac(d * rn, a * b)}</b> 池${d ? '' : '（第 1 天还没过完）'}。`;
        }
      }
    }
    function run() {
      if (busy) return;
      busy = true; prog = 0;
      const D = days();
      const ms = Math.min(6000, 700 * D);
      stop = tween(ms, (t, raw) => { prog = raw * D; draw(); }, () => { busy = false; stop = null; prog = D; draw(); });
    }
    draw();
  };

  // ───────────── 工程问题：设总量为公倍数，格子填色 ─────────────
  A.o_work_grid = function (el) {
    const PRE = [[10, 15], [4, 6], [12, 18], [6, 9], [20, 30], [8, 12], [12, 20], [6, 10]];
    const W = 460, Hh = 230;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, day = 0, busy = false, auto = false;
    btn(c, '过一天', () => { if (!auto) step(); });
    btn(c, '一口气做完', () => {
      if (busy || auto) return;
      auto = true;
      const go = () => { if (!finished()) { step(); setTimeout(go, 750); } else auto = false; };
      go();
    });
    btn(c, '换一组数', () => { if (busy || auto) return; pi = (pi + 1) % PRE.length; day = 0; draw(-1); }, 'alt');
    btn(c, '重来', () => { if (busy || auto) return; day = 0; draw(-1); }, 'alt');
    const cur = () => {
      const [a, b] = PRE[pi], L = lcm(a, b);
      return { a, b, L, ea: L / a, eb: L / b, s: L / a + L / b };
    };
    const finished = () => { const q = cur(); return day * q.s >= q.L; };
    function step() {
      if (busy || finished()) return;
      busy = true; day++;
      tween(600, (t) => draw(t), () => { busy = false; draw(1); });
    }
    function draw(t) {
      g.innerHTML = '';
      const q = cur();
      const cols = q.L <= 12 ? q.L : q.L <= 36 ? 12 : 15;
      const rows = Math.ceil(q.L / cols);
      const cs = Math.min(28, 400 / cols, 140 / rows);
      const gx = (W - cols * cs) / 2, gy = 50;
      T(g, W / 2, 22, `甲 ${q.a} 天、乙 ${q.b} 天：总量看作 ${q.L} 格（最小公倍数）`, 'tb');
      // 每个格子属于第几天、谁
      const owner = [];
      let d = 0, k = 0;
      while (k < q.L) {
        d++;
        const last = (d * q.s) > q.L;
        for (let i = 0; i < q.ea && k < q.L; i++) owner.push([d, last ? 'f3s' : 'f1s']), k++;
        for (let i = 0; i < q.eb && k < q.L; i++) owner.push([d, last ? 'f3s' : 'f2s']), k++;
      }
      for (let i = 0; i < q.L; i++) {
        const r = Math.floor(i / cols), cc = i % cols;
        const [od, cls] = owner[i];
        const on = od < day || (od === day && (t === -1 ? false : true));
        const op = od === day && t >= 0 ? t : 1;
        S('rect', { x: gx + cc * cs + 1, y: gy + r * cs + 1, width: cs - 2, height: cs - 2, rx: 3, class: on ? cls + ' sline' : 'fsurf2 sline', opacity: on ? op : 1 }, g);
        if (on && cs >= 20) T(g, gx + cc * cs + cs / 2, gy + r * cs + cs / 2 + 4, `${od}`, 'ts');
      }
      const yb = gy + rows * cs + 24;
      svg.setAttribute('viewBox', `0 0 ${W} ${yb + 14}`);
      S('rect', { x: 40, y: yb - 12, width: 14, height: 14, class: 'f1s s1' }, g);
      T(g, 60, yb, `甲每天 ${q.L} ÷ ${q.a} = ${q.ea} 格`, 'ts', 'start');
      S('rect', { x: 250, y: yb - 12, width: 14, height: 14, class: 'f2s s2' }, g);
      T(g, 270, yb, `乙每天 ${q.L} ÷ ${q.b} = ${q.eb} 格`, 'ts', 'start');
      const doneCells = Math.min(q.L, day * q.s);
      if (day === 0) {
        read.innerHTML = `格子里的数字表示第几天做的。两人合作每天做 ${q.ea} + ${q.eb} = <b>${q.s}</b> 格。点“过一天”。`;
      } else if (doneCells < q.L) {
        read.innerHTML = `第 ${day} 天后：做了 ${day} × ${q.s} = <b>${doneCells}</b> 格，还剩 ${q.L - doneCells} 格。`;
      } else {
        const exact = q.L % q.s === 0;
        read.innerHTML = exact
          ? `做完了！${q.L} ÷ ${q.s} = <b>${q.L / q.s} 天</b>。和“看作 1”算的 1 ÷ (${window.fr(1, q.a)} + ${window.fr(1, q.b)}) 结果一样，但全是整数。`
          : `最后一天（绿色）只剩 ${q.L - (day - 1) * q.s} 格，不到一整天的 ${q.s} 格。合作时间 = ${q.L} ÷ ${q.s} = <b>${fmt(q.L / q.s)} 天</b>。`;
      }
    }
    draw(-1);
  };

  // ───────────── 比例应用：按比分糖果 ─────────────
  A.o_ratio_app_candy = function (el) {
    const W = 460, Hh = 300;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const cg = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let r = [2, 3, 0], m = 4, busy = false, given = 0, candies = [];
    const NAMES = ['甲', '乙', '丙'];
    const CLS = ['f1 s1', 'f2 s2', 'f3 s3'];
    const goB = btn(c, '开始分', () => runAll());
    btn(c, '分一轮', () => { if (!busy) round(); }, 'alt');
    btn(c, '重来', () => { if (!busy) setup(); }, 'alt');
    const c2 = ctrl(el);
    slider(c2, 'ca', '甲的份数', 1, 5, 1, r[0], (v) => { if (busy) return; r[0] = v; setup(); });
    slider(c2, 'cb', '乙的份数', 1, 5, 1, r[1], (v) => { if (busy) return; r[1] = v; setup(); });
    slider(c2, 'cc', '丙的份数', 0, 5, 1, r[2], (v) => { if (busy) return; r[2] = v; setup(); });
    slider(c2, 'cm', '轮数', 1, 6, 1, m, (v) => { if (busy) return; m = v; setup(); });
    const per = () => r[0] + r[1] + r[2];
    const N = () => per() * m;
    const pileX = (i) => (r[2] ? [80, 230, 380][i] : [120, 340][i]);
    function homePos(i) {
      const cols = 15, R = 13;
      const n = N(), rows = Math.ceil(n / cols);
      const rr = Math.floor(i / cols), cc = i % cols;
      const inRow = rr === rows - 1 ? n - rr * cols : cols;
      return [W / 2 - ((inRow - 1) * R) / 2 + cc * R, 40 + rr * R];
    }
    function pilePos(p, j) {
      const R = 13;
      return [pileX(p) - 2 * R + (j % 5) * R, 280 - Math.floor(j / 5) * R];
    }
    function setup() {
      given = 0;
      cg.innerHTML = '';
      candies = [];
      for (let i = 0; i < N(); i++) {
        const [x, y] = homePos(i);
        candies.push({ el: S('circle', { cx: x, cy: y, r: 5.5, class: 'fsurf2 sstrong thin' }, cg), x, y });
      }
      drawStatic();
      goB.disabled = false;
      read.innerHTML = `一共 <b>${N()}</b> 颗糖，按 ${r.slice(0, r[2] ? 3 : 2).join(' : ')} 分给${r[2] ? '甲、乙、丙' : '甲、乙'}。一轮一轮地发：每轮${NAMES.slice(0, r[2] ? 3 : 2).map((n, i) => n + ' ' + r[i] + ' 颗').join('，')}。`;
    }
    function drawStatic() {
      g.innerHTML = '';
      T(g, W / 2, 20, `糖果堆：共 ${N()} 颗`, 'ts tm');
      const cnt = [0, 1, 2].map((i) => Math.min(given, m) * r[i]);
      for (let i = 0; i < (r[2] ? 3 : 2); i++) {
        S('rect', { x: pileX(i) - 40, y: 196, width: 80, height: 96, rx: 8, class: 'fnone sline' }, g);
        T(g, pileX(i), 188, `${NAMES[i]}（${r[i]} 份）：${cnt[i]} 颗`, 'tb ' + ['t1', 't2', 't3'][i]);
      }
    }
    function round() {
      if (given >= m) return Promise.resolve();
      busy = true;
      const moves = [];
      let idx = N() - given * per() - 1;
      for (let p = 0; p < 3; p++) {
        for (let j = 0; j < r[p]; j++) {
          const cd = candies[idx--];
          const [tx, ty] = pilePos(p, given * r[p] + j);
          moves.push([cd, p, tx, ty]);
        }
      }
      return new Promise((res) => {
        moves.forEach(([cd, p]) => cd.el.setAttribute('class', CLS[p]));
        tween(550, (t) => {
          moves.forEach(([cd, p, tx, ty]) => {
            cd.el.setAttribute('cx', lerp(cd.x, tx, t));
            cd.el.setAttribute('cy', lerp(cd.y, ty, t) - 40 * Math.sin(Math.PI * t));
          });
        }, () => {
          moves.forEach(([cd, p, tx, ty]) => { cd.x = tx; cd.y = ty; });
          given++;
          drawStatic();
          busy = false;
          const k = r[2] ? 3 : 2;
          if (given < m) read.innerHTML = `第 ${given} 轮：每轮发 ${per()} 颗，已经发了 ${given} × ${per()} = ${given * per()} 颗。`;
          else {
            goB.disabled = true;
            read.innerHTML = `发完了，一共 ${N()} ÷ ${per()} = <b>${m}</b> 轮——这就是“1 份”。${NAMES.slice(0, k).map((n, i) => `${n} = ${r[i]} × ${m} = <b>${r[i] * m}</b>`).join('，')}。`;
          }
          res();
        });
      });
    }
    async function runAll() {
      if (busy) return;
      while (given < m) { await round(); await new Promise((s) => setTimeout(s, 150)); }
    }
    setup();
  };

  // ───────────── 比例应用：找不变量的线段图 ─────────────
  A.o_ratio_app_bar = function (el) {
    // mode: sum 和不变 / diff 差不变 / fix 一方不变（乙变）
    const PRE = [
      { mode: 'sum', a: 3, b: 2, c: 1, d: 1, A: 36, B: 24, A2: 30, B2: 30, n1: '甲', n2: '乙', q: '甲、乙糖果数的比是 3 : 2，甲给乙 6 颗后变成 1 : 1。', ch: '甲给乙 6 颗' },
      { mode: 'sum', a: 5, b: 3, c: 3, d: 5, A: 25, B: 15, A2: 15, B2: 25, n1: '甲', n2: '乙', q: '甲、乙画片数的比是 5 : 3，甲给乙 10 张后变成 3 : 5。', ch: '甲给乙 10 张' },
      { mode: 'diff', a: 1, b: 4, c: 2, d: 5, A: 6, B: 24, A2: 12, B2: 30, n1: '女儿', n2: '妈妈', q: '今年女儿和妈妈的年龄比是 1 : 4，6 年后是 2 : 5。', ch: '两人都长 6 岁' },
      { mode: 'diff', a: 2, b: 7, c: 1, d: 2, A: 10, B: 35, A2: 25, B2: 50, n1: '甲', n2: '乙', q: '甲、乙两数的比是 2 : 7，两数都加上 15 后变成 1 : 2。', ch: '都加上 15' },
      { mode: 'fix', a: 3, b: 2, c: 6, d: 5, A: 30, B: 20, A2: 30, B2: 25, n1: '男生', n2: '女生', q: '男生和女生人数比是 3 : 2，又转来 5 名女生后变成 6 : 5。', ch: '女生多了 5 人' },
      { mode: 'fix', a: 4, b: 3, c: 4, d: 5, A: 40, B: 30, A2: 40, B2: 50, n1: '苹果树', n2: '梨树', q: '苹果树和梨树棵数比是 4 : 3，又种 20 棵梨树后变成 4 : 5。', ch: '梨树多了 20 棵' }
    ];
    const W = 460, Hh = 250;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, step = 0, busy = false;
    const nb = btn(c, '下一步', () => {
      if (busy) return;
      if (step >= 3) { step = 0; draw(1); return; }
      step++; busy = true;
      tween(650, (t) => draw(t), () => { busy = false; draw(1); });
    });
    btn(c, '换一题', () => { if (busy) return; pi = (pi + 1) % PRE.length; step = 0; draw(1); }, 'alt');

    function draw(t) {
      g.innerHTML = '';
      const p = PRE[pi];
      const sum = p.mode === 'sum';
      const maxV = sum ? p.A + p.B : Math.max(p.A, p.B, p.A2, p.B2);
      const sc = 330 / maxV, x0 = 92;
      // 统一后的 1 份
      const v = sum ? (p.A + p.B) / lcm(p.a + p.b, p.c + p.d) : p.mode === 'diff' ? Math.abs(p.B - p.A) / lcm(Math.abs(p.b - p.a), Math.abs(p.d - p.c)) : p.A / lcm(p.a, p.c);
      const uni = step >= 2;
      const op = (s) => (step === s ? t : step > s ? 1 : 0);
      T(g, W / 2, 20, p.q, 'tb');
      // 画一条带刻度的线段
      function seg(x, y, val, part, cls, label, o) {
        const w = val * sc;
        const gg = S('g', { opacity: o }, g);
        S('rect', { x, y, width: w, height: 26, class: cls }, gg);
        const n = Math.round(val / part);
        for (let i = 1; i < n; i++) S('line', { x1: x + i * part * sc, x2: x + i * part * sc, y1: y, y2: y + 26, class: 'sstrong thin' }, gg);
        if (label) T(gg, x + w / 2, y + 18, label, 'ts tb');
        return gg;
      }
      const parts = (val, part) => Math.round(val / part);
      const rows = [
        { lab: '原来', y: 50, A: p.A, B: p.B, pa: p.A / p.a, ra: [p.a, p.b] },
        { lab: '后来', y: 150, A: p.A2, B: p.B2, pa: p.A2 / p.c, ra: [p.c, p.d] }
      ];
      rows.forEach((row, ri) => {
        const o = ri === 0 ? 1 : op(1);
        if (o <= 0) return;
        const part = uni ? v : row.pa;
        const tA = uni ? `${parts(row.A, v)}份` : `${row.ra[0]}份`;
        const tB = uni ? `${parts(row.B, v)}份` : `${row.ra[1]}份`;
        const lg = S('g', { opacity: o }, g);
        T(lg, 8, row.y + 4, row.lab, 'tb', 'start');
        if (sum) {
          T(lg, x0 - 8, row.y + 36, `${p.n1}+${p.n2}`, 'ts', 'end');
          seg(x0, row.y + 18, row.A, part, 'f1s s1', `${p.n1} ${tA}`, o);
          seg(x0 + row.A * sc, row.y + 18, row.B, part, 'f2s s2', `${p.n2} ${tB}`, o);
        } else {
          T(lg, x0 - 8, row.y + 18, p.n1, 'ts', 'end');
          T(lg, x0 - 8, row.y + 52, p.n2, 'ts', 'end');
          seg(x0, row.y, row.A, part, 'f1s s1', tA, o);
          seg(x0, row.y + 34, row.B, part, 'f2s s2', tB, o);
        }
      });
      // 第 2 步：标出不变量
      if (step >= 2) {
        const o = op(2);
        const gg = S('g', { opacity: o }, g);
        if (sum) {
          const xe = x0 + (p.A + p.B) * sc;
          S('line', { x1: xe, x2: xe, y1: 60, y2: 202, class: 's3 dash' }, gg);
          T(gg, xe - 4, 132, '总数不变', 't3 tb', 'end');
        } else if (p.mode === 'diff') {
          [[50, p.A, p.B], [150, p.A2, p.B2]].forEach(([y, a1, b1]) => {
            S('rect', { x: x0 + a1 * sc, y: y + 36, width: (b1 - a1) * sc, height: 22, class: 'f3s s3 dash', opacity: 0.45 }, gg);
          });
          T(gg, x0 + p.A2 * sc + ((p.B2 - p.A2) * sc) / 2, 132, '差不变', 't3 tb');
        } else {
          [50, 150].forEach((y) => S('rect', { x: x0 - 3, y: y - 3, width: p.A * sc + 6, height: 32, class: 'fnone s3 dash' }, gg));
          T(gg, x0 + (p.A * sc) / 2, 132, `${p.n1}不变`, 't3 tb');
        }
      }
      // 第 3 步：变化的份数
      let kParts = 0, amt = 0;
      if (sum) { kParts = parts(p.A, v) - parts(p.A2, v); amt = p.A - p.A2; }
      else if (p.mode === 'diff') { kParts = parts(p.A2, v) - parts(p.A, v); amt = p.A2 - p.A; }
      else { kParts = parts(p.B2, v) - parts(p.B, v); amt = p.B2 - p.B; }
      if (step >= 3) {
        const o = op(3);
        const gg = S('g', { opacity: o }, g);
        let x1, x2, y;
        if (sum) { x1 = x0 + p.A2 * sc; x2 = x0 + p.A * sc; y = 68; }
        else if (p.mode === 'diff') { x1 = x0 + p.A * sc; x2 = x0 + p.A2 * sc; y = 150; }
        else { x1 = x0 + p.B * sc; x2 = x0 + p.B2 * sc; y = 184; }
        S('rect', { x: x1, y, width: x2 - x1, height: 26, class: 'f3 s3', opacity: 0.55 }, gg);
        S('path', { d: `M${x1},${y + 30} v6 H${x2} v-6`, class: 'fnone s3' }, gg);
        T(gg, (x1 + x2) / 2, p.mode === 'diff' ? y - 6 : y + 50, `${kParts} 份 = ${amt}`, 'tb t3');
      }
      nb.textContent = step >= 3 ? '重新开始' : '下一步';
      const inv = sum ? '两人的<b>总数</b>不变' : p.mode === 'diff' ? '两人的<b>差</b>不变' : `<b>${p.n1}</b>的数量不变`;
      const unify = sum ? `总份数 ${p.a + p.b} 和 ${p.c + p.d} 统一成 ${lcm(p.a + p.b, p.c + p.d)}` : p.mode === 'diff' ? `份数差 ${Math.abs(p.b - p.a)} 和 ${Math.abs(p.d - p.c)} 统一成 ${lcm(Math.abs(p.b - p.a), Math.abs(p.d - p.c))}` : `${p.n1}的份数 ${p.a} 和 ${p.c} 统一成 ${lcm(p.a, p.c)}`;
      const ua = parts(p.A, v), ub = parts(p.B, v), ua2 = parts(p.A2, v), ub2 = parts(p.B2, v);
      const msg = [
        `原来 ${p.n1} : ${p.n2} = ${p.a} : ${p.b}。点“下一步”看变化后的样子。`,
        p.A / p.a === p.A2 / p.c
          ? `${p.ch}，变成 ${p.c} : ${p.d}。这道题前后的“1 份”碰巧一样大，但一般情况下不一样，所以还是要先找不变量，再统一份数。`
          : `${p.ch}，变成 ${p.c} : ${p.d}。注意：前后两个比的“1 份”一样大吗？看看刻度——不一样，不能直接拿份数相减！`,
        `${p.ch}，${inv}。把${unify}：原来 ${ua} : ${ub}，后来 ${ua2} : ${ub2}，现在每一小份一样大了。`,
        `变化的部分是 <b>${kParts} 份</b>，正好对应 <b>${amt}</b>，所以 1 份 = ${amt} ÷ ${kParts} = ${v}。原来 ${p.n1} ${ua} × ${v} = <b>${p.A}</b>，${p.n2} ${ub} × ${v} = <b>${p.B}</b>。`
      ];
      read.innerHTML = msg[step];
    }
    draw(1);
  };

  // ───────────── 浓度：烧杯里加水、加糖、蒸发 ─────────────
  A.o_conc_beaker = function (el) {
    const W = 440, Hh = 270;
    const svg = stage(el, W, Hh);
    const bx0 = 50, bx1 = 210, bot = 250, top = 40, MAX = 500;
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let s = 20, w = 80, busy = false, note = '';
    const seeds = Array.from({ length: 80 }, () => [Math.random(), Math.random()]);
    function change(ds, dw, msg) {
      if (busy) return;
      const s2 = s + ds, w2 = w + dw;
      if (s2 + w2 > MAX) { read.innerHTML = '杯子快满了，先“蒸发”一些水或点“重来”吧。'; return; }
      if (w2 < 20) { read.innerHTML = '水太少了，不能再蒸发了。'; return; }
      busy = true;
      const s0 = s, w0 = w, p0 = s / (s + w);
      tween(800, (t) => { s = lerp(s0, s2, t); w = lerp(w0, w2, t); draw(); }, () => {
        s = s2; w = w2; busy = false;
        const p1 = s / (s + w);
        note = `${msg}浓度从 ${fmt(p0 * 100)}% 变成 ${fmt(p1 * 100)}%${p1 > p0 ? '，变浓了' : '，变淡了'}。`;
        draw();
      });
    }
    btn(c, '加 50 克水', () => change(0, 50, '加水：糖没变，糖水变多了，'));
    btn(c, '加 10 克糖', () => change(10, 0, '加糖：水没变，糖和糖水都变多了，'));
    btn(c, '蒸发 50 克水', () => change(0, -50, '蒸发：糖没变，糖水变少了，'));
    btn(c, '重来', () => { if (busy) return; s = 20; w = 80; note = ''; draw(); }, 'alt');
    function draw() {
      g.innerHTML = '';
      const tot = s + w, p = s / tot;
      const h = (tot / MAX) * (bot - top);
      // 液体
      const op = Math.min(0.95, 0.12 + p * 2.2);
      S('rect', { x: bx0 + 3, y: bot - h, width: bx1 - bx0 - 6, height: h, class: 'f2', style: `opacity:${op}` }, g);
      // 糖粒（1 粒代表 2 克）
      const nd = Math.min(80, Math.round(s / 2));
      for (let i = 0; i < nd; i++) {
        const [rx, ry] = seeds[i];
        S('rect', { x: bx0 + 10 + rx * (bx1 - bx0 - 26), y: bot - 6 - ry * (h - 12), width: 4, height: 4, class: 'fsurf' }, g);
      }
      // 杯子
      S('path', { d: `M${bx0 - 6},${top - 10} L${bx0},${top} V${bot} H${bx1} V${top - 10}`, class: 'fnone sstrong round' }, g);
      for (let v = 100; v <= MAX; v += 100) {
        const y = bot - (v / MAX) * (bot - top);
        S('line', { x1: bx1 - 12, x2: bx1, y1: y, y2: y, class: 'smuted' }, g);
        T(g, bx1 + 6, y + 4, `${v}g`, 'ts tm', 'start');
      }
      // 右边：比例条
      const rx = 280, rw = 140, ry = 70;
      T(g, rx + rw / 2, ry - 12, '糖在糖水里占多少', 'ts tm');
      S('rect', { x: rx, y: ry, width: rw, height: 26, class: 'f1s s1' }, g);
      S('rect', { x: rx, y: ry, width: rw * p, height: 26, class: 'f2' }, g);
      T(g, rx + rw / 2, ry + 46, `浓度 ${fmt(p * 100)}%`, 'tl tb t2');
      T(g, rx, 158, `溶质（糖）：${fmt(s)} 克`, 'tb t2', 'start');
      T(g, rx, 182, `溶剂（水）：${fmt(w)} 克`, 'tb t1', 'start');
      T(g, rx, 206, `溶液：${fmt(tot)} 克`, 'tb', 'start');
      T(g, rx, 236, `${fmt(s)} ÷ ${fmt(tot)} = ${fmt(p * 100)}%`, 'ts', 'start');
      if (!busy) read.innerHTML = note || `现在：糖 <span class="k2">${fmt(s)} 克</span>，水 <span class="k1">${fmt(w)} 克</span>，糖水 <b>${fmt(tot)} 克</b>，浓度 = ${fmt(s)} ÷ ${fmt(tot)} = <b>${fmt(p * 100)}%</b>。颜色越深，糖水越甜。`;
    }
    draw();
  };

  // ───────────── 浓度：两杯混合 + 十字交叉 ─────────────
  A.o_conc_mix = function (el) {
    const W = 460, Hh = 270;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mA = 100, pA = 20, mB = 300, pB = 40, mix = 0, busy = false;
    const pourB = btn(c, '倒在一起', () => {
      if (busy) return;
      busy = true;
      const from = mix, to = mix ? 0 : 1;
      tween(1200, (t) => { mix = lerp(from, to, t); draw(); }, () => { mix = to; busy = false; pourB.textContent = to ? '分开' : '倒在一起'; draw(); });
    });
    const c2 = ctrl(el);
    const reset = () => { mix = 0; pourB.textContent = '倒在一起'; draw(); };
    slider(c2, 'mxa', '甲杯克数', 100, 400, 50, mA, (v) => { if (busy) return; mA = v; reset(); });
    slider(c2, 'mxpa', '甲杯浓度%', 5, 60, 5, pA, (v) => { if (busy) return; pA = v; reset(); });
    slider(c2, 'mxb', '乙杯克数', 100, 400, 50, mB, (v) => { if (busy) return; mB = v; reset(); });
    slider(c2, 'mxpb', '乙杯浓度%', 5, 60, 5, pB, (v) => { if (busy) return; pB = v; reset(); });
    const op = (p) => Math.min(0.95, 0.12 + (p / 100) * 2.2);
    function beaker(x, y, w, h, cap, m, p, label) {
      const lh = (m / cap) * h;
      if (lh > 0.5) S('rect', { x: x + 2, y: y + h - lh, width: w - 4, height: lh, class: 'f2', style: `opacity:${op(p)}` }, g);
      S('path', { d: `M${x},${y} V${y + h} H${x + w} V${y}`, class: 'fnone sstrong' }, g);
      T(g, x + w / 2, y + h + 18, label, 'ts tb');
    }
    function draw() {
      g.innerHTML = '';
      const sA = (mA * pA) / 100, sB = (mB * pB) / 100;
      const M = mA + mB, P = ((sA + sB) / M) * 100;
      const left = 1 - mix;
      beaker(14, 30, 64, 80, 400, mA * left, pA, `甲 ${mA}克 ${pA}%`);
      beaker(150, 30, 64, 80, 400, mB * left, pB, `乙 ${mB}克 ${pB}%`);
      // 混合杯
      const mm = M * mix;
      const shownP = mix > 0 ? P : 0;
      beaker(62, 150, 100, 92, 800, mm, shownP, mix > 0.99 ? `混合 ${M}克 ${fmt(P)}%` : '混合杯');
      if (busy) {
        S('path', { d: `M78,70 Q100,${110} 100,${150 + 92 - (mm / 800) * 92}`, class: 's2 thick dash fnone' }, g);
        S('path', { d: `M150,70 Q125,${110} 124,${150 + 92 - (mm / 800) * 92}`, class: 's2 thick dash fnone' }, g);
      }
      // 十字交叉
      const cx0 = 262;
      S('line', { x1: 238, x2: 238, y1: 20, y2: Hh - 10, class: 'sline dash' }, g);
      T(g, 350, 24, '十字交叉', 'tb');
      if (mix < 0.99) {
        T(g, 350, 130, '先把两杯倒在一起', 'ts tm');
      } else if (pA === pB) {
        T(g, 350, 130, '两杯浓度一样，混合后不变', 'ts tm');
      } else {
        const lo = Math.min(pA, pB), hi = Math.max(pA, pB);
        const dLo = hi - P, dHi = P - lo; // 低浓度对应的份 = 高 − 目标
        T(g, cx0 + 4, 64, `${lo}%`, 'tl tb', 'start');
        T(g, cx0 + 4, 190, `${hi}%`, 'tl tb', 'start');
        S('line', { x1: cx0 + 46, y1: 70, x2: 410, y2: 180, class: 'smuted' }, g);
        S('line', { x1: cx0 + 46, y1: 180, x2: 410, y2: 70, class: 'smuted' }, g);
        S('rect', { x: 318, y: 112, width: 64, height: 28, rx: 6, class: 'fsurf' }, g);
        T(g, 350, 132, `${fmt(P)}%`, 'tl tb t2');
        T(g, 452, 64, fmt(dLo), 'tl tb t1', 'end');
        T(g, 452, 190, fmt(dHi), 'tl tb t1', 'end');
        T(g, 350, 228, `${fmt(dLo)} : ${fmt(dHi)} = ${pA < pB ? mA : mB} : ${pA < pB ? mB : mA}`, 'tb t3');
        T(g, 350, 250, `（${lo}% 的克数 : ${hi}% 的克数）`, 'ts tm');
      }
      if (mix < 0.99) {
        read.innerHTML = `甲杯：糖 ${mA} × ${pA}% = <b>${fmt(sA)}</b> 克；乙杯：糖 ${mB} × ${pB}% = <b>${fmt(sB)}</b> 克。点“倒在一起”。`;
      } else {
        const lo = pA <= pB ? [mA, pA] : [mB, pB], hi = pA <= pB ? [mB, pB] : [mA, pA];
        read.innerHTML = `糖加糖：${fmt(sA)} + ${fmt(sB)} = ${fmt(sA + sB)} 克；糖水加糖水：${mA} + ${mB} = ${M} 克。浓度 = ${fmt(sA + sB)} ÷ ${M} = <b>${fmt(P)}%</b>，在 ${Math.min(pA, pB)}% 和 ${Math.max(pA, pB)}% 之间，靠近分量多的那杯。` +
          (pA === pB ? '' : `<br>十字交叉：(${hi[1]} − ${fmt(P)}) : (${fmt(P)} − ${lo[1]}) = ${fmt(hi[1] - P)} : ${fmt(P - lo[1])}，正好等于两杯的克数比 ${lo[0]} : ${hi[0]}。`);
      }
    }
    draw();
  };

  // ───────────── 经济问题：价签变化条 ─────────────
  A.o_profit_tag = function (el) {
    const W = 460, Hh = 260;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let C = 200, up = 40, dis = 8, ph = 3, busy = false;
    btn(c, '一步步看', () => {
      if (busy) return;
      busy = true; ph = 0; draw();
      const go = (k) => {
        if (k > 3) { busy = false; return; }
        tween(700, (t) => { ph = k - 1 + t; draw(); }, () => { ph = k; draw(); setTimeout(() => go(k + 1), 350); });
      };
      go(1);
    });
    const c2 = ctrl(el);
    slider(c2, 'pc', '成本（元）', 50, 300, 10, C, (v) => { if (busy) return; C = v; draw(); });
    slider(c2, 'pu', '加价%', 0, 100, 5, up, (v) => { if (busy) return; up = v; draw(); });
    slider(c2, 'pd', '打几折', 5, 10, 0.5, dis, (v) => { if (busy) return; dis = v; draw(); });
    function bar(y, val, cls, label, o, maxV) {
      const sc = 280 / maxV, x0 = 92;
      const gg = S('g', { opacity: o }, g);
      T(gg, x0 - 10, y + 19, label, 'tb', 'end');
      S('rect', { x: x0, y, width: val * sc, height: 28, rx: 4, class: cls }, gg);
      // 价签
      const tx = x0 + val * sc + 8;
      S('path', { d: `M${tx},${y + 14} l10,-12 h52 v24 h-52 Z`, class: 'fsurf s2' }, gg);
      T(gg, tx + 40, y + 19, `${fmt(val)}元`, 'ts tb');
      return sc;
    }
    function draw() {
      g.innerHTML = '';
      const P = C * (1 + up / 100), Q = P * dis / 10, prof = Q - C, rate = (prof / C) * 100;
      const maxV = C * 2;
      const sc = 280 / maxV, x0 = 92;
      const o1 = Math.min(1, Math.max(0, ph)), o2 = Math.min(1, Math.max(0, ph - 1)), o3 = Math.min(1, Math.max(0, ph - 2));
      bar(30, C, 'f1s s1', '成本', o1, maxV);
      // 定价：成本 + 加价
      const pv = lerp(C, P, o2);
      bar(100, pv, 'f2s s2', '定价', o2 > 0 ? 1 : 0.15, maxV);
      // 售价
      const qv = lerp(P, Q, o3);
      bar(170, qv, Q >= C ? 'f3s s3' : 'f2 s2', '售价', o3 > 0 ? 1 : 0.15, maxV);
      // 成本参考线
      S('line', { x1: x0 + C * sc, x2: x0 + C * sc, y1: 22, y2: 214, class: 'sstrong dash thin' }, g);
      T(g, x0 + C * sc, 232, '成本线', 'ts tm');
      if (o2 > 0) T(g, x0 + C * sc + ((pv - C) * sc) / 2, 94, `+${up}%`, 'ts t2');
      if (o3 >= 1) {
        const x1 = x0 + Math.min(C, Q) * sc, x2 = x0 + Math.max(C, Q) * sc;
        if (Math.abs(Q - C) > 0.001) S('rect', { x: x1, y: 202, width: x2 - x1, height: 8, class: Q >= C ? 'f3' : 'f2' }, g);
      }
      const head = `成本 <b>${C}</b> 元 → 定价 ${C} × (1 + ${up}%) = <b>${fmt(P)}</b> 元 → 打 ${fmt(dis)} 折：${fmt(P)} × ${fmt(dis * 10)}% = <b>${fmt(Q)}</b> 元。`;
      if (ph < 3) {
        read.innerHTML = ph < 1 ? '先看成本：这是商店进货花的钱。' : ph < 2 ? `定价以<b>成本</b>为单位 1：${C} × (1 + ${up}%) = ${fmt(P)} 元。` : `打折以<b>定价</b>为单位 1：${fmt(P)} × ${fmt(dis * 10)}% = ${fmt(Q)} 元。`;
      } else if (Math.abs(prof) < 0.001) {
        read.innerHTML = head + '<br>售价正好等于成本：不赚也不亏，利润率 0%。';
      } else if (prof > 0) {
        read.innerHTML = head + `<br>利润 = ${fmt(Q)} − ${C} = <span class="k3">${fmt(prof)} 元</span>，利润率 = ${fmt(prof)} ÷ ${C} = <span class="k3">${fmt(rate)}%</span>（除以<b>成本</b>）。`;
      } else {
        read.innerHTML = head + `<br>售价比成本低，<span class="k2">亏了 ${fmt(-prof)} 元</span>，亏损率 = ${fmt(-prof)} ÷ ${C} = <span class="k2">${fmt(-rate)}%</span>。`;
      }
    }
    draw();
  };

  // ───────────── 经济问题：先涨后降 ─────────────
  A.o_profit_updown = function (el) {
    const W = 460, Hh = 236;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let x = 20, order = 0, ph = 2, busy = false;
    btn(c, '播放', () => {
      if (busy) return;
      busy = true; ph = 0; draw();
      tween(900, (t) => { ph = t; draw(); }, () => {
        setTimeout(() => tween(900, (t) => { ph = 1 + t; draw(); }, () => { ph = 2; busy = false; draw(); }), 400);
      });
    });
    const ob = btn(c, '换成先降后涨', () => { if (busy) return; order = 1 - order; ob.textContent = order ? '换成先涨后降' : '换成先降后涨'; ph = 2; draw(); }, 'alt');
    const c2 = ctrl(el);
    slider(c2, 'udx', '百分数%', 5, 50, 5, x, (v) => { if (busy) return; x = v; ph = 2; draw(); });
    function draw() {
      g.innerHTML = '';
      const f1 = order ? 1 - x / 100 : 1 + x / 100, f2 = order ? 1 + x / 100 : 1 - x / 100;
      const v0 = 100, v1 = v0 * f1, v2 = v1 * f2;
      const sc = 260 / 150, x0 = 96;
      const rows = [[40, '原价', v0, 'f1s s1', 1], [110, order ? '先降后' : '先涨后', lerp(v0, v1, Math.min(1, ph)), 'f2s s2', ph > 0 ? 1 : 0.2], [180, order ? '再涨后' : '再降后', lerp(v1, v2, Math.max(0, ph - 1)), 'f3s s3', ph > 1 ? 1 : 0.2]];
      rows.forEach(([y, lab, val, cls, o]) => {
        const gg = S('g', { opacity: o }, g);
        T(gg, x0 - 10, y + 19, lab, 'tb', 'end');
        S('rect', { x: x0, y, width: val * sc, height: 28, rx: 4, class: cls }, gg);
        T(gg, x0 + val * sc + 8, y + 19, fmt(val), 'tb', 'start');
      });
      S('line', { x1: x0 + 100 * sc, x2: x0 + 100 * sc, y1: 30, y2: 222, class: 'sstrong dash thin' }, g);
      T(g, x0 + 100 * sc, 232, '原价 100', 'ts tm');
      if (ph >= 1) T(g, x0 + 4, 106, `单位 1 是 100，${order ? '降' : '涨'} ${x}%：${order ? '−' : '+'}${fmt(100 * x / 100)}`, 'ts t2', 'start');
      if (ph >= 2) T(g, x0 + 4, 176, `单位 1 是 ${fmt(v1)}，${order ? '涨' : '降'} ${x}%：${order ? '+' : '−'}${fmt(v1 * x / 100)}`, 'ts t3', 'start');
      if (ph < 2) read.innerHTML = ph < 1 ? '原价看作 100 元。' : `第一次以 <b>100</b> 为单位 1：100 × ${order ? `(1 − ${x}%)` : `(1 + ${x}%)`} = ${fmt(v1)}。`;
      else read.innerHTML = `100 × ${order ? `(1 − ${x}%)` : `(1 + ${x}%)`} × ${order ? `(1 + ${x}%)` : `(1 − ${x}%)`} = <b>${fmt(v2)}</b>。第二次的单位 1 是 ${fmt(v1)}，不是 100，所以${order ? '涨回来的' : '降下去的'} ${fmt(v1 * x / 100)} 和第一次的 ${x} 不一样多，最后比原价<b>低了 ${fmt(100 - v2)}%</b>。`;
    }
    draw();
  };

  // ───────────── 牛吃草：草地上的草一边长一边被吃 ─────────────
  A.o_cows_field = function (el) {
    const W = 460, Hh = 290;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let n = 25, r = 5, G = 100, tNow = 0, busy = false, stop = null;
    btn(c, '放牛吃草', run);
    btn(c, '重来', () => { halt(); draw(); }, 'alt');
    const c2 = ctrl(el);
    slider(c2, 'cwn', '牛的头数', 1, 30, 1, n, (v) => { n = v; halt(); draw(); });
    slider(c2, 'cwr', '每天长草', 0, 10, 1, r, (v) => { r = v; halt(); draw(); });
    slider(c2, 'cwg', '原有草', 40, 200, 20, G, (v) => { G = v; halt(); draw(); });
    function halt() { if (stop) stop(); stop = null; busy = false; tNow = 0; }
    const finishes = () => n > r;
    const Dend = () => (finishes() ? G / (n - r) : Infinity);
    const span = () => (finishes() ? Math.max(4, Math.ceil(Dend())) : 20);
    function cow(x, y) {
      const gg = S('g', { transform: `translate(${x},${y})` }, g);
      S('line', { x1: -5, y1: 3, x2: -5, y2: 9, class: 'sstrong thin' }, gg);
      S('line', { x1: 5, y1: 3, x2: 5, y2: 9, class: 'sstrong thin' }, gg);
      S('ellipse', { cx: 0, cy: 0, rx: 8, ry: 5, class: 'fsurf2 sstrong thin' }, gg);
      S('circle', { cx: -2, cy: -1, r: 2, class: 'fstrong' }, gg);
      S('circle', { cx: 9, cy: -4, r: 3.5, class: 'fsurf2 sstrong thin' }, gg);
    }
    function draw() {
      g.innerHTML = '';
      const D = Dend(), sp = span();
      const amt = (t) => Math.max(0, G + (r - n) * t);
      const maxA = Math.max(G, G + (r - n) * sp, 1);
      // 左边：草量柱
      const bx = 30, bw = 56, bt = 70, bb = 250;
      const cur = amt(tNow);
      const hh = (cur / maxA) * (bb - bt);
      S('rect', { x: bx, y: bb - hh, width: bw, height: hh, class: 'f3s s3' }, g);
      if (hh > 4) for (let i = 0; i < 7; i++) S('path', { d: `M${bx + 4 + i * 8},${bb - hh} l3,-8 l3,8`, class: 'fnone s3 thin' }, g);
      S('line', { x1: bx - 6, x2: bx + bw + 6, y1: bb, y2: bb, class: 'sstrong' }, g);
      T(g, bx + bw / 2, bb + 18, `${fmt(cur)} 份`, 'tb');
      T(g, bx + bw / 2, 24, `长 +${r}/天`, 'ts t3');
      T(g, bx + bw / 2, 42, `吃 −${n}/天`, 'ts t2');
      // 牛
      for (let i = 0; i < n; i++) cow(132 + (i % 15) * 21, 14 + Math.floor(i / 15) * 20);
      // 右边：草量变化图
      const gx0 = 130, gx1 = 440, gy0 = 64, gy1 = 250;
      const X = (t) => gx0 + (t / sp) * (gx1 - gx0), Y = (a) => gy1 - (a / maxA) * (gy1 - gy0);
      S('line', { x1: gx0, x2: gx1, y1: gy1, y2: gy1, class: 'sstrong' }, g);
      S('line', { x1: gx0, x2: gx0, y1: gy0, y2: gy1, class: 'sstrong' }, g);
      const stepT = [1, 2, 5, 10, 20, 25, 50, 100].find((s0) => s0 >= sp / 8) || 100;
      for (let t = 0; t <= sp; t += stepT) T(g, X(t), gy1 + 16, `${t}`, 'tick');
      T(g, gx1, gy1 + 30, '天', 'ts tm', 'end');
      T(g, gx0 + 4, gy0 - 4, '草量', 'ts tm', 'start');
      T(g, gx0 - 4, Y(G) + 4, `${G}`, 'tick', 'end');
      const tEnd = Math.min(tNow, sp);
      if (tEnd > 0) {
        const pts = [];
        for (let k = 0; k <= 40; k++) { const t = (tEnd * k) / 40; pts.push(`${X(t)},${Y(amt(t))}`); }
        S('polyline', { points: pts.join(' '), class: 'fnone s3 thick' }, g);
        S('circle', { cx: X(tEnd), cy: Y(amt(tEnd)), r: 5, class: 'f3' }, g);
      }
      // 读数
      if (tNow === 0) {
        read.innerHTML = `原有草 <b>${G}</b> 份，每天长 <span class="k3">${r}</span> 份；${n} 头牛每天吃 <span class="k2">${n}</span> 份。点“放牛吃草”。`;
      } else if (!finishes()) {
        read.innerHTML = n === r
          ? `牛每天吃 ${n} 份，草每天也长 ${r} 份，正好吃掉新长的——草一直是 ${G} 份，<b>永远吃不完</b>。`
          : `牛每天只吃 ${n} 份，草每天长 ${r} 份，草越来越多，<b>永远吃不完</b>。`;
      } else if (tNow >= D - 1e-9) {
        read.innerHTML = `每天净减少 ${n} − ${r} = <b>${n - r}</b> 份，原有的 ${G} 份草：${G} ÷ ${n - r} = <b>${fmt(D)} 天</b>吃完。也可以想成：${r} 头牛专吃新长的草，另外 ${n - r} 头吃原有的草。`;
      } else {
        read.innerHTML = `第 ${fmt(tNow)} 天：长了 ${r} × ${fmt(tNow)} = ${fmt(r * tNow)} 份，吃了 ${n} × ${fmt(tNow)} = ${fmt(n * tNow)} 份，还剩 ${fmt(amt(tNow))} 份。`;
      }
    }
    function run() {
      if (busy) return;
      busy = true;
      const D = finishes() ? Dend() : span();
      stop = tween(Math.min(4000, 500 + D * 250), (t, raw) => { tNow = raw * D; draw(); }, () => { tNow = D; busy = false; stop = null; draw(); });
    }
    draw();
  };

  // ───────────── 牛吃草：两种吃法比一比，求长草量 ─────────────
  A.o_cows_solve = function (el) {
    const PRE = [[10, 20, 15, 10], [27, 6, 23, 9], [24, 6, 21, 8]];
    const W = 460, Hh = 250;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let pi = 0, step = 0, busy = false, ask = 25;
    const nb = btn(c, '下一步', () => {
      if (busy) return;
      if (step >= 3) { step = 0; draw(1); return; }
      step++; busy = true;
      tween(700, (t) => draw(t), () => { busy = false; draw(1); });
    });
    btn(c, '换一组数', () => { if (busy) return; pi = (pi + 1) % PRE.length; step = 0; const q = calc(); ask = Math.min(40, q.r + 10); sl.set(ask); draw(1); }, 'alt');
    const c2 = ctrl(el);
    const sl = slider(c2, 'csq', '问：放几头牛', 1, 40, 1, ask, (v) => { ask = v; draw(1); });
    function calc() {
      let [n1, d1, n2, d2] = PRE[pi];
      if (d1 < d2) [n1, d1, n2, d2] = [n2, d2, n1, d1]; // 让第一组天数多
      const T1 = n1 * d1, T2 = n2 * d2, r = (T1 - T2) / (d1 - d2), G0 = T1 - r * d1;
      return { n1, d1, n2, d2, T1, T2, r, G0 };
    }
    function draw(t) {
      g.innerHTML = '';
      const q = calc();
      const [a1, b1, a2, b2] = PRE[pi];
      T(g, W / 2, 22, `一片草地可供 ${a1} 头牛吃 ${b1} 天，或供 ${a2} 头牛吃 ${b2} 天`, 'tb');
      const sc = 330 / q.T1, x0 = 100;
      const op = (s) => (step === s ? t : step > s ? 1 : 0);
      const rows = [[60, q.n1, q.d1, q.T1], [130, q.n2, q.d2, q.T2]];
      rows.forEach(([y, nn, dd, TT]) => {
        T(g, x0 - 8, y + 12, `${nn}头×${dd}天`, 'ts tb', 'end');
        T(g, x0 - 8, y + 28, `= ${TT} 份`, 'ts', 'end');
        if (step === 0) { S('rect', { x: x0, y, width: TT * sc, height: 32, class: 'fsurf2 sline' }, g); return; }
        const o = op(1);
        if (step < 3) {
          S('rect', { x: x0, y, width: TT * sc * (step === 1 ? o : 1), height: 32, class: 'fsurf2 sstrong thin' }, g);
          T(g, x0 + (TT * sc) / 2, y + 21, `吃掉 ${TT} 份`, 'ts tb');
        } else {
          const o3 = op(3);
          const gw = q.G0 * sc, rw = q.r * dd * sc;
          S('rect', { x: x0, y, width: gw, height: 32, class: 'f1s s1' }, g);
          T(g, x0 + gw / 2, y + 21, `原有 ${q.G0}`, 'ts tb');
          S('rect', { x: x0 + gw, y, width: rw, height: 32, class: 'f3s s3', opacity: lerp(0.3, 1, o3) }, g);
          T(g, x0 + gw + rw / 2, y + 21, `新长 ${q.r}×${dd}`, 'ts tb');
        }
      });
      if (step >= 2) {
        const o = op(2);
        const gg = S('g', { opacity: o }, g);
        const xa = x0 + q.T2 * sc, xb = x0 + q.T1 * sc;
        S('rect', { x: xa, y: 60, width: xb - xa, height: 32, class: 'f2 s2', opacity: 0.45 }, gg);
        S('line', { x1: xa, x2: xa, y1: 54, y2: 168, class: 's2 dash' }, gg);
        T(gg, (xa + xb) / 2, 112, `多 ${q.T1 - q.T2}`, 'tb t2');
      }
      // 第 4 部分：提问
      const by = 196;
      if (step >= 3) {
        const can = ask > q.r;
        T(g, 20, by, `每天长 ${q.r} 份，原有 ${q.G0} 份。放 ${ask} 头牛：`, 'tb', 'start');
        T(g, 20, by + 26, can ? `${q.G0} ÷ (${ask} − ${q.r}) = ${fmt(q.G0 / (ask - q.r))} 天吃完` : `${ask} 头不超过每天长的 ${q.r} 份，永远吃不完`, 'tl tb ' + (can ? 't3' : 't2'), 'start');
      }
      nb.textContent = step >= 3 ? '重新开始' : '下一步';
      const msg = [
        '规定 1 头牛 1 天吃 1 份草。先算两种吃法各吃了多少份。点“下一步”。',
        `${q.n1} × ${q.d1} = ${q.T1} 份，${q.n2} × ${q.d2} = ${q.T2} 份。两次都是“原有的草 + 那些天新长的草”。`,
        `原有的草一样多，多吃的 ${q.T1} − ${q.T2} = <b>${q.T1 - q.T2}</b> 份，是因为多长了 ${q.d1} − ${q.d2} = ${q.d1 - q.d2} 天。每天长 ${q.T1 - q.T2} ÷ ${q.d1 - q.d2} = <b>${q.r}</b> 份。`,
        `原有草量 = ${q.T1} − ${q.r} × ${q.d1} = <b>${q.G0}</b> 份（用另一组算：${q.T2} − ${q.r} × ${q.d2} = ${q.G0}，一样）。拖动滑块，问问放几头牛几天吃完。`
      ];
      read.innerHTML = msg[step];
    }
    draw(1);
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
