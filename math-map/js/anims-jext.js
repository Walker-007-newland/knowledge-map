// 初中 数与代数 补充：幂的运算与整式除法 的互动动画
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider } = window.AH;
  const PI = Math.PI;
  const A = {};

  // ── 小工具 ──
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻', '−': '⁻', '+': '⁺' };
  const su = (k) => String(k).split('').map((ch) => SUP[ch] || ch).join(''); // SVG 文字里的上标
  const ia = '<i>a</i>', ib = '<i>b</i>';
  const sp = (k) => `<sup>${String(k).replace('-', '−')}</sup>`; // HTML 上标

  // ═════════════ 数一数有几个 a 相乘 ═════════════
  A.n_exp_count = function (el) {
    const W = 440, Hh = 236;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el);
    const c2 = ctrl(el);
    let mode = 'mul', m = 3, n = 2, st = 0, busy = false;
    const NAMES = { mul: '同底数幂相乘', pow: '幂的乘方', prod: '积的乘方' };
    const BT = { mul: ['合起来数一数', '分回两组'], pow: ['排成一行数一数', '分回各组'], prod: ['按字母重新排队', '恢复原来的顺序'] };
    const mb = {};
    ['mul', 'pow', 'prod'].forEach((k) => {
      mb[k] = btn(c1, NAMES[k], () => {
        if (busy) return;
        mode = k; st = 0;
        sync(); draw();
      }, k === mode ? '' : 'alt');
    });
    const sm = slider(c2, 'exm' + Math.random().toString(36).slice(2, 6), 'm', 1, 4, 1, m, (v) => {
      if (busy) { sm.set(m); return; }
      m = v; st = 0; sync(); draw();
    });
    const smWrap = c2.lastElementChild;
    const sn = slider(c2, 'exn' + Math.random().toString(36).slice(2, 6), 'n', 1, 4, 1, n, (v) => {
      if (busy) { sn.set(n); return; }
      n = v; st = 0; sync(); draw();
    });
    const go = btn(c2, BT.mul[0], () => {
      if (busy) return;
      busy = true;
      const from = st, to = st > 0.5 ? 0 : 1;
      tween(1100, (t) => { st = lerp(from, to, t); draw(); }, () => {
        st = to; busy = false;
        sync(); draw();
      });
    });
    function sync() {
      for (const k in mb) mb[k].className = 'abtn' + (k === mode ? '' : ' alt');
      smWrap.style.display = mode === 'prod' ? 'none' : '';
      go.textContent = BT[mode][st > 0.5 ? 1 : 0];
    }
    const GC = ['f1s', 'f2s', 'f3s', 'fsurf2'], GT = ['t1', 't2', 't3', 'tm'];
    function card(x, y, cw, ch, cls, lab) {
      S('rect', { x, y, width: cw, height: ch, rx: 6, class: cls + ' sstrong thin' }, g);
      T(g, x + cw / 2, y + ch / 2 + 5, lab, 'ital tb');
    }
    function brace(x1, x2, yy, text, cls, op) {
      const gg = S('g', { opacity: op }, g);
      S('path', { d: `M${x1} ${yy + 6}V${yy}H${x2}V${yy + 6}`, class: 'fnone smuted' }, gg);
      T(gg, (x1 + x2) / 2, yy - 6, text, cls);
    }
    function nums(list, yy, op) {
      const gg = S('g', { opacity: op }, g);
      list.forEach((q) => T(gg, q.x, yy, String(q.k), 'ts tm'));
    }
    function draw() {
      g.innerHTML = '';
      const gap = 4;
      const done = st > 0.5;
      let eq = '';
      if (mode === 'mul') {
        const N = m + n, ch = 38, sep = 34, yy = 124;
        const cw = Math.min(36, (W - 60 - (N - 1) * gap) / N);
        const w0 = N * cw + (N - 2) * gap + sep, w1 = N * cw + (N - 1) * gap;
        const xa = (W - w0) / 2, xb = (W - w1) / 2;
        const nl = [];
        for (let i = 0; i < N; i++) {
          const first = i < m;
          const x0 = xa + i * (cw + gap) + (first ? 0 : sep - gap);
          const x1 = xb + i * (cw + gap);
          card(lerp(x0, x1, st), yy, cw, ch, first ? 'f1s' : 'f2s', 'a');
          nl.push({ x: x1 + cw / 2, k: i + 1 });
        }
        const e1 = xa + m * cw + (m - 1) * gap;
        brace(xa, e1, yy - 12, 'a' + su(m), 'ital tb t1', 1 - st);
        brace(e1 + sep, e1 + sep + n * cw + (n - 1) * gap, yy - 12, 'a' + su(n), 'ital tb t2', 1 - st);
        T(g, e1 + sep / 2, yy + ch / 2 + 7, '·', 'tl tb').setAttribute('opacity', 1 - st);
        brace(xb, xb + w1, yy - 12, `${m} + ${n} = ${N} 个 a`, 'tb t2', st);
        nums(nl, yy + ch + 18, st);
        eq = `a${su(m)} · a${su(n)} = ` + (done ? `a${su(m)}⁺${su(n)} = a${su(N)}` : '?');
        read.innerHTML = done
          ? `连在一起数一数：${m} 个 ${ia} 加上 ${n} 个 ${ia}，一共 <span class="k2">${m} + ${n} = ${N}</span> 个 ${ia} 相乘。<br>所以 ${ia}${sp(m)} · ${ia}${sp(n)} = ${ia}${sp(N)}：<b>底数不变，指数相加</b>。注意不是 ${ia}${sp(m * n)}。`
          : `${ia}${sp(m)} 是 <span class="k1">${m} 个 ${ia}</span> 相乘，${ia}${sp(n)} 是 <span class="k2">${n} 个 ${ia}</span> 相乘。点“合起来数一数”，看一共有几个 ${ia}。`;
      } else if (mode === 'pow') {
        const N = m * n, ch = 32, rg = 8, top = 70;
        const cw = Math.min(36, (W - 60 - (N - 1) * gap) / N);
        const wr = m * cw + (m - 1) * gap, w1 = N * cw + (N - 1) * gap;
        const xr = (W - wr) / 2, xb = (W - w1) / 2;
        const yf = top + ((n - 1) * (ch + rg)) / 2;
        const nl = [];
        for (let r = 0; r < n; r++) {
          const y0 = top + r * (ch + rg);
          for (let i = 0; i < m; i++) {
            const k = r * m + i;
            const x1 = xb + k * (cw + gap);
            card(lerp(xr + i * (cw + gap), x1, st), lerp(y0, yf, st), cw, ch, GC[r % 4], 'a');
            nl.push({ x: x1 + cw / 2, k: k + 1 });
          }
          T(g, xr - 10, y0 + ch / 2 + 5, 'a' + su(m), 'ital tb ' + GT[r % 4], 'end').setAttribute('opacity', 1 - st);
          T(g, xr + wr + 10, y0 + ch / 2 + 5, `第 ${r + 1} 组`, 'ts tm', 'start').setAttribute('opacity', 1 - st);
        }
        brace(xb, xb + w1, yf - 12, `${n} 组 × 每组 ${m} 个 = ${N} 个 a`, 'tb t2', st);
        nums(nl, yf + ch + 18, st);
        eq = `(a${su(m)})${su(n)} = ` + (done ? `a${su(m)}ˣ${su(n)} = a${su(N)}` : '?');
        read.innerHTML = done
          ? `${n} 组，每组 ${m} 个，一共 <span class="k2">${m} × ${n} = ${N}</span> 个 ${ia}。<br>所以 (${ia}${sp(m)})${sp(n)} = ${ia}${sp(N)}：<b>底数不变，指数相乘</b>。` + (m + n !== N ? `注意不是 ${ia}${sp(m + n)}。` : '（这里恰好 ' + m + ' + ' + n + ' 也等于 ' + N + '，换个指数试试就能看出区别。）')
          : `(${ia}${sp(m)})${sp(n)} 表示 <b>${n} 个 ${ia}${sp(m)}</b> 相乘：一共 ${n} 组，每组 ${m} 个 ${ia}。点“排成一行数一数”。`;
      } else {
        const cw = 30, ch = 38, ps = 18, sep = 34, yy = 120;
        const w0 = n * (2 * cw + gap) + (n - 1) * ps;
        const wg = n * cw + (n - 1) * gap, w1 = 2 * wg + sep;
        const xa = (W - w0) / 2, xb = (W - w1) / 2;
        const lift = Math.sin(PI * st) * 46;
        const nl = [];
        for (let k = 0; k < n; k++) {
          const px = xa + k * (2 * cw + gap + ps);
          const ax1 = xb + k * (cw + gap), bx1 = xb + wg + sep + k * (cw + gap);
          card(lerp(px, ax1, st), yy - lift, cw, ch, 'f1s', 'a');
          card(lerp(px + cw + gap, bx1, st), yy + lift, cw, ch, 'f2s', 'b');
          nl.push({ x: ax1 + cw / 2, k: k + 1 }, { x: bx1 + cw / 2, k: k + 1 });
          brace(px, px + 2 * cw + gap, yy - 12, 'ab', 'ital tm ts', 1 - st);
          if (k > 0) T(g, px - ps / 2, yy + ch / 2 + 7, '·', 'tl tb').setAttribute('opacity', 1 - st);
        }
        brace(xb, xb + wg, yy - 12, `a${su(n)}`, 'ital tb t1', st);
        brace(xb + wg + sep, xb + w1, yy - 12, `b${su(n)}`, 'ital tb t2', st);
        T(g, xb + wg + sep / 2, yy + ch / 2 + 7, '·', 'tl tb').setAttribute('opacity', st);
        nums(nl, yy + ch + 18, st);
        eq = `(ab)${su(n)} = ` + (done ? `a${su(n)}b${su(n)}` : '?');
        read.innerHTML = done
          ? `乘法可以交换顺序、任意结合：${n} 个 ${ia} 排一队，${n} 个 ${ib} 排一队。<br>所以 (${ia}${ib})${sp(n)} = ${ia}${sp(n)}${ib}${sp(n)}：<b>每个因式都要乘方</b>。比如 (2${ia})<sup>3</sup> = 2<sup>3</sup>${ia}<sup>3</sup> = 8${ia}<sup>3</sup>，系数 2 也要立方。`
          : `(${ia}${ib})${sp(n)} 表示 <b>${n} 个 ${ia}${ib}</b> 相乘。点“按字母重新排队”，让 ${ia} 和 ${ib} 各站一队。`;
      }
      T(g, W / 2, 38, eq, 'big2');
    }
    sync();
    draw();
  };

  // ═════════════ 指数楼梯：0 次幂与负指数 ═════════════
  A.n_exp_ladder = function (el) {
    const W = 460, Hh = 300;
    const svg = stage(el, W, Hh);
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    const c1 = ctrl(el);
    const c2 = ctrl(el);
    const EX = [4, 3, 2, 1, 0, -1, -2, -3];
    let base = 2, idx = 0, ball = 0, barK = 1 / 2, busy = false;
    const down = btn(c1, '往下走一级（÷2）', () => step(1));
    const up = btn(c1, '往上走一级（×2）', () => step(-1), 'alt');
    const bb = {};
    [2, 3, 10].forEach((v) => {
      bb[v] = btn(c2, '底数 ' + v, () => {
        if (busy) return;
        base = v; barK = 1 / base;
        sync(); draw();
      }, v === base ? '' : 'alt');
    });
    function sync() {
      for (const k in bb) bb[k].className = 'abtn' + (+k === base ? '' : ' alt');
      down.textContent = `往下走一级（÷${base}）`;
      up.textContent = `往上走一级（×${base}）`;
      down.disabled = idx >= EX.length - 1;
      up.disabled = idx <= 0;
    }
    function step(d) {
      if (busy) return;
      const to = idx + d;
      if (to < 0 || to >= EX.length) return;
      busy = true;
      const from = idx;
      idx = to;
      sync();
      tween(800, (t) => {
        ball = lerp(from, to, t);
        barK = d > 0 ? lerp(1, 1 / base, t) : lerp(1 / (base * base), 1 / base, t);
        draw();
      }, () => {
        ball = to; barK = 1 / base; busy = false;
        sync(); draw();
      });
    }
    function val(e) {
      if (e >= 0) return String(Math.pow(base, e));
      if (base === 10) return '0.' + '0'.repeat(-e - 1) + '1';
      return '1/' + Math.pow(base, -e);
    }
    function valHtml(e) {
      if (e >= 0) return String(Math.pow(base, e));
      return window.fr(1, Math.pow(base, -e));
    }
    function draw() {
      g.innerHTML = '';
      const sx = 12, sw = 55, top = 50, dy = 16, bot = 206;
      T(g, W - 10, 18, `指数楼梯：每往下一级 ÷${base}`, 'ts tm', 'end');
      EX.forEach((e, i) => {
        const x = sx + i * sw, yy = top + i * dy, cx = x + (sw - 3) / 2;
        const cls = i === idx ? 'f2s' : i < idx ? 'f1s' : 'fsurf2';
        S('rect', { x, y: yy, width: sw - 3, height: bot - yy, rx: 4, class: cls + ' sline' }, g);
        T(g, cx, yy + 19, base + su(e), 'tb' + (e === 0 ? ' t3' : e < 0 ? ' t2' : ''));
        T(g, cx, yy + 36, val(e), 'ts');
        if (i > 0) T(g, x + 1, yy - 4, '÷' + base, 'ts tm', 'start');
      });
      // 小球
      const bi = Math.floor(ball), fpart = ball - bi;
      const bx = sx + ball * sw + (sw - 3) / 2;
      const by = top + ball * dy - 24 - Math.sin(PI * fpart) * 16;
      S('circle', { cx: bx, cy: by, r: 8, class: 'f2 sstrong thin' }, g);
      // 条形对比：上一级与这一级
      const e = EX[idx], L = 300, x0 = 140;
      S('line', { x1: 8, x2: W - 8, y1: 216, y2: 216, class: 'sline' }, g);
      T(g, x0 - 8, 243, `${base}${su(e + 1)} = ${val(e + 1)}`, '', 'end');
      S('rect', { x: x0, y: 228, width: L, height: 20, rx: 3, class: 'f1s s1 thin' }, g);
      T(g, x0 - 8, 281, `${base}${su(e)} = ${val(e)}`, 'tb', 'end');
      S('rect', { x: x0, y: 266, width: Math.max(1, L * barK), height: 20, rx: 3, class: 'f2' }, g);
      if (!busy) T(g, x0 + L * barK + 6, 281, `是上一级的 1/${base}`, 'ts t2', 'start');
      // 读数
      let s;
      if (e > 0) {
        s = `${base}${sp(e)} = ${Array(e).fill(base).join(' × ')} = <b>${val(e)}</b>。每往下走一级，就少乘一个 ${base}，也就是 <span class="k2">÷${base}</span>。一直往下走，看看指数变成 0 和负数时会怎样。`;
      } else if (e === 0) {
        s = `${base}${sp(1)} = ${base}，再 ÷${base} 得 <b>1</b>，所以 <span class="k3">${base}${sp(0)} = 1</span>。<br>用除法也能看出来：${base}${sp(3)} ÷ ${base}${sp(3)} = 1，而按法则它等于 ${base}${sp('3−3')} = ${base}${sp(0)}。任何不为 0 的数的 0 次幂都等于 1。`;
      } else {
        const q = -e;
        s = `${base}${sp(e)} = ${valHtml(e)} = ${window.fr(1, `${base}${sp(q)}`)}`;
        if (base === 10) {
          s += ` = <b>${val(e)}</b>。10${sp(e)} 就是小数点后第 ${q} 位上是 1 的小数。<br>所以很小的数可以写成 <i>a</i> × 10${sp('−n')}，比如 0.000 012 = 1.2 × 10${sp('−5')}。`;
        } else {
          s += `。负指数不是负数，而是<span class="k2">倒数</span>：${base}${sp(e)} 是 ${base}${sp(q)} 的倒数，<i>a</i>${sp('−p')} = ${window.fr(1, `<i>a</i>${sp('p')}`)}（<i>a</i> ≠ 0）。`;
        }
      }
      read.innerHTML = s;
    }
    sync();
    draw();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
