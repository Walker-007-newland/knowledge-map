// 小学 统计与概率（pstat 组）的互动动画。
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  const rnd = (n) => Math.floor(Math.random() * n);
  const onKey = (node, fn) => node.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
  });
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  };

  // ════════════════ 数据的整理：先分类，再数 ════════════════
  A.s_table_sort = function (el) {
    const W = 440, Hh = 180;
    const svg = stage(el, W, Hh);
    const COL = ['f1', 'f2', 'f3'], COLN = ['蓝色', '橙色', '绿色'];
    const SHN = ['圆形', '正方形', '三角形'];
    // 每个图形：[形状, 颜色]
    const ITEMS = [[0, 0], [0, 1], [0, 1], [0, 2], [0, 0], [1, 1], [1, 0], [1, 2], [1, 1], [2, 1], [2, 2], [2, 0]];
    const MESS = [[50, 60], [130, 140], [205, 75], [290, 130], [370, 55], [90, 110], [250, 40], [345, 155], [165, 105], [400, 120], [55, 158], [225, 150]];
    const gx = [80, 220, 360];
    const frames = gx.map((x) => S('rect', { x: x - 64, y: 42, width: 128, height: 100, rx: 12, class: 'fnone smuted dash', opacity: 0 }, svg));
    const labels = gx.map((x) => T(svg, x, 32, '', 'tb'));
    const counts = gx.map((x) => T(svg, x, 166, '', 't2 tb'));
    const items = ITEMS.map(([sh, co], i) => {
      const g = S('g', {}, svg);
      const cls = COL[co] + ' sstrong thin';
      if (sh === 0) S('circle', { r: 14, class: cls }, g);
      else if (sh === 1) S('rect', { x: -13, y: -13, width: 26, height: 26, rx: 2, class: cls }, g);
      else S('path', { d: 'M0,-15 L15,12 L-15,12 Z', class: cls + ' round' }, g);
      const it = { g, sh, co, x: MESS[i][0], y: MESS[i][1] };
      g.setAttribute('transform', `translate(${it.x},${it.y})`);
      return it;
    });
    const tbl = H('div', { class: 'tbl-wrap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let mode = 'mess', busy = false;

    const keyOf = (it, m) => (m === 'shape' ? it.sh : it.co);
    function countBy(m) {
      const n = [0, 0, 0];
      items.forEach((it) => { n[keyOf(it, m)]++; });
      return n;
    }
    function targets(m) {
      if (m === 'mess') return MESS;
      const n = [0, 0, 0];
      return items.map((it) => {
        const k = keyOf(it, m), j = n[k]++;
        return [gx[k] - 38 + (j % 3) * 38, 70 + Math.floor(j / 3) * 42];
      });
    }
    function setLabels(m) {
      const names = m === 'shape' ? SHN : COLN, n = countBy(m);
      gx.forEach((x, k) => { labels[k].textContent = names[k]; counts[k].textContent = n[k] + ' 个'; });
    }
    function go(m) {
      if (busy || m === mode) return;
      busy = true;
      const from = items.map((it) => [it.x, it.y]);
      const to = targets(m);
      const wasMess = mode === 'mess', show = m !== 'mess';
      if (show) setLabels(m);
      tween(800, (t) => {
        items.forEach((it, i) => {
          it.x = lerp(from[i][0], to[i][0], t);
          it.y = lerp(from[i][1], to[i][1], t);
          it.g.setAttribute('transform', `translate(${it.x},${it.y})`);
        });
        const op = show ? (wasMess ? t : 1) : 1 - t;
        [...frames, ...labels, ...counts].forEach((e) => e.setAttribute('opacity', op));
      }, () => { mode = m; busy = false; say(); });
    }
    function say() {
      if (mode === 'mess') {
        tbl.innerHTML = '';
        read.innerHTML = '12 个图形乱糟糟的，一下子数不清。先想好<b>按什么分</b>，分好了再数。点下面的按钮试试。';
        return;
      }
      const isShape = mode === 'shape';
      const names = isShape ? SHN : COLN, n = countBy(mode);
      tbl.innerHTML = `<table class="mini"><tr><th>${isShape ? '形状' : '颜色'}</th>${names.map((s) => `<th>${s}</th>`).join('')}<th>合计</th></tr>` +
        `<tr><td>个数</td>${n.map((v) => `<td>${v}</td>`).join('')}<td>${n[0] + n[1] + n[2]}</td></tr></table>`;
      read.innerHTML = `按<b>${isShape ? '形状' : '颜色'}</b>分：${names.map((s, k) => `${s} ${n[k]} 个`).join('，')}。` +
        `${n.join(' + ')} = 12，一个不多，一个不少。<br>同样 12 个图形，换一种分法，分出来的结果就不一样。`;
    }
    btn(c, '按形状分', () => go('shape'));
    btn(c, '按颜色分', () => go('color'));
    btn(c, '打乱', () => go('mess'), 'alt');
    say();
  };

  // ════════════════ 数据的整理：唱票、画“正”字 ════════════════
  A.s_table_vote = function (el) {
    const W = 440, Hh = 300;
    const svg = stage(el, W, Hh);
    const NAMES = ['苹果', '香蕉', '橘子', '葡萄'];
    const DOT = ['f2', 'f3', 'f1', 'fmuted'];
    const VOTES = [0, 2, 1, 0, 3, 2, 0, 1, 2, 0, 3, 0, 2, 1, 0, 2, 3, 1, 0, 2, 2, 3, 1, 0];
    const R0 = 100, RH = 44, MAXN = 30;
    const rowY = (i) => R0 + i * RH;
    let cnt = [0, 0, 0, 0], pos = 0, busy = false;

    T(svg, 20, 40, '唱票：', 'note', 'start');
    const progT = T(svg, 170, 40, '', 'ts tm', 'start');
    S('rect', { x: 20, y: 64, width: 400, height: R0 - 64 + 4 * RH, class: 'fsurf sline' }, svg);
    S('rect', { x: 20.5, y: 64.5, width: 399, height: 35, class: 'fsurf2' }, svg);
    [100, 330].forEach((x) => S('line', { x1: x, x2: x, y1: 64, y2: R0 + 4 * RH, class: 'sline' }, svg));
    for (let i = 0; i < 4; i++) S('line', { x1: 20, x2: 420, y1: rowY(i), y2: rowY(i), class: 'sline' }, svg);
    T(svg, 60, 87, '水果', 'tb');
    T(svg, 215, 87, '画“正”字', 'tb');
    T(svg, 375, 87, '票数', 'tb');
    const totalT = T(svg, 420, 294, '', 'note', 'end');
    const rowG = [], numT = [];
    const read = H('p', { class: 'anim-read' }, el);

    NAMES.forEach((nm, i) => {
      const y = rowY(i);
      S('circle', { cx: 36, cy: y + 22, r: 7, class: DOT[i] }, svg);
      T(svg, 68, y + 27, nm);
      rowG.push(S('g', {}, svg));
      numT.push(T(svg, 375, y + 29, '0', 'tl tb t2'));
      const hit = S('rect', { x: 21, y: y + 1, width: 398, height: RH - 2, class: 'fsurf clickable', style: 'fill-opacity: 0', tabindex: 0, role: 'button', 'aria-label': '给' + nm + '投一票' }, svg);
      const own = () => {
        if (busy) return;
        if (cnt[i] >= MAXN) { say('这一行写满啦。'); return; }
        cnt[i]++;
        drawRow(i, true);
        say(`你给<b>${nm}</b>投了一票，在这一行添一笔。${zheng(i)}`);
      };
      hit.addEventListener('click', own);
      onKey(hit, own);
    });

    const card = S('g', { opacity: 0 }, svg);
    S('rect', { x: -44, y: -17, width: 88, height: 34, rx: 8, class: 'fsurf s1' }, card);
    const cardT = T(card, 0, 6, '', 'tb');

    // “正”字的 5 笔：横、竖、短横、左竖、底横
    function strokePath(k, x, y) {
      return [
        `M${x + 2},${y + 1} H${x + 22}`,
        `M${x + 12},${y + 1} V${y + 23}`,
        `M${x + 12},${y + 12} H${x + 20}`,
        `M${x + 5},${y + 12} V${y + 23}`,
        `M${x + 1},${y + 23} H${x + 23}`
      ][k % 5];
    }
    function drawRow(i, animLast) {
      const g = rowG[i];
      g.innerHTML = '';
      const y = rowY(i) + 10;
      for (let k = 0; k < cnt[i]; k++) {
        const x = 108 + Math.floor(k / 5) * 36;
        const p = S('path', { d: strokePath(k, x, y), class: 'fnone s2 thick round', pathLength: 1 }, g);
        if (animLast && k === cnt[i] - 1) {
          p.setAttribute('stroke-dasharray', 1);
          p.setAttribute('stroke-dashoffset', 1);
          tween(260, (t) => p.setAttribute('stroke-dashoffset', 1 - t));
        }
      }
      numT[i].textContent = cnt[i];
    }
    function zheng(i) {
      const n = cnt[i], z = Math.floor(n / 5), r = n % 5;
      if (!z) return `现在${NAMES[i]}有 ${r} 笔，就是 <b>${n}</b> 票。`;
      const zs = z === 1 ? '5' : `5 × ${z}`;
      return `现在${NAMES[i]}有 ${z} 个“正”${r ? ` 加 ${r} 笔` : ''}：${r ? `${zs} + ${r}` : zs} = <b>${n}</b> 票。`;
    }
    function say(extra) {
      const total = cnt.reduce((a, b) => a + b, 0);
      totalT.textContent = `合计：${total} 票`;
      let s = extra ? extra + '<br>' : '';
      if (!total) s += '点“唱下一票”：老师读一张选票，你就在那一行画一笔。5 笔正好写成一个“正”字，代表 5 票。';
      else {
        const mx = Math.max(...cnt), mn = Math.min(...cnt);
        const who = (v) => NAMES.filter((_, i) => cnt[i] === v).join('、');
        s += `一共 <b>${total}</b> 票。最多的是<span class="k2">${who(mx)}（${mx} 票）</span>，最少的是<span class="k1">${who(mn)}（${mn} 票）</span>，相差 ${mx - mn} 票。`;
      }
      read.innerHTML = s;
    }
    function cast(ms, done) {
      const v = VOTES[pos++];
      progT.textContent = `第 ${pos} 张，共 ${VOTES.length} 张`;
      cardT.textContent = NAMES[v];
      const k = Math.min(cnt[v], MAXN - 1);
      const tx = 108 + Math.floor(k / 5) * 36 + 12, ty = rowY(v) + 22;
      card.setAttribute('transform', 'translate(110,34)');
      tween(ms * 0.3, (t) => card.setAttribute('opacity', t), () => {
        tween(ms * 0.7, (t) => {
          card.setAttribute('transform', `translate(${lerp(110, tx, t)},${lerp(34, ty, t)}) scale(${lerp(1, 0.4, t)})`);
          card.setAttribute('opacity', t < 0.7 ? 1 : (1 - t) / 0.3);
        }, () => {
          card.setAttribute('opacity', 0);
          if (cnt[v] < MAXN) cnt[v]++;
          drawRow(v, true);
          done(v);
        });
      });
    }
    const c = ctrl(el);
    btn(c, '唱下一票', () => {
      if (busy) return;
      if (pos >= VOTES.length) { say('选票已经唱完了。点“重来”可以再来一遍。'); return; }
      busy = true;
      cast(900, (v) => { busy = false; say(`第 ${pos} 票是<b>${NAMES[v]}</b>，在“${NAMES[v]}”这一行添一笔。${zheng(v)}`); });
    });
    btn(c, '把剩下的票唱完', () => {
      if (busy || pos >= VOTES.length) return;
      busy = true;
      const next = () => {
        if (pos >= VOTES.length) {
          busy = false;
          say(`${VOTES.length} 张选票全部唱完！数“正”字时，一个“正”就是 5 票，比一根一根数快多了。`);
          return;
        }
        cast(360, () => { say(); next(); });
      };
      next();
    });
    btn(c, '重来', () => {
      if (busy) return;
      cnt = [0, 0, 0, 0]; pos = 0; progT.textContent = '';
      for (let i = 0; i < 4; i++) drawRow(i, false);
      say();
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：点表格里的某一行，可以替自己投一票。');
    say();
  };

  // ════════════════ 条形统计图：一格代表几 ════════════════
  A.s_bar_grow = function (el) {
    const W = 440, Hh = 296;
    const svg = stage(el, W, Hh);
    const NAMES = ['故事书', '科普书', '漫画书', '诗歌'];
    const vals = [14, 9, 12, 5];
    const x0 = 60, y0 = 262, CELL = 21, NC = 10;
    const cx = (i) => x0 + 50 + i * 88;
    let scale = 2, sel = 0, stop = null;
    const shown = vals.map(() => 0);
    T(svg, 260, 20, '四(1)班同学最喜欢的书', 'tb');
    T(svg, x0 - 6, 36, '人数', 'ts tm', 'start');
    const gridG = S('g', {}, svg);
    S('line', { x1: x0, x2: 425, y1: y0, y2: y0, class: 'sstrong' }, svg);
    S('line', { x1: x0, x2: x0, y1: y0, y2: y0 - NC * CELL - 8, class: 'sstrong' }, svg);
    const bars = vals.map(() => S('rect', { width: 44, class: 'f1' }, svg));
    const vt = vals.map(() => T(svg, 0, 0, '', 'ts tb'));
    NAMES.forEach((n, i) => T(svg, cx(i), y0 + 20, n, 'ts'));
    NAMES.forEach((n, i) => {
      const r = S('rect', { x: cx(i) - 42, y: 28, width: 84, height: y0 - 28 + 26, class: 'fsurf clickable', style: 'fill-opacity: 0', tabindex: 0, role: 'button', 'aria-label': '选中' + n }, svg);
      const pick = () => { sel = i; render(); say(); };
      r.addEventListener('click', pick);
      onKey(r, pick);
    });
    const read = H('p', { class: 'anim-read' }, el);
    const row = H('div', { class: 'anim-row' }, el);
    H('span', {}, row, '一格代表');
    const selEl = H('select', { 'aria-label': '一格代表几人' }, row,
      '<option value="1">1 人</option><option value="2" selected>2 人</option><option value="5">5 人</option>');
    selEl.addEventListener('change', () => { scale = +selEl.value; drawGrid(); animate(); say(); });
    const c = ctrl(el);
    const change = (d) => { vals[sel] = Math.max(0, Math.min(60, vals[sel] + d)); animate(); say(); };
    btn(c, '+1 人', () => change(1));
    btn(c, '−1 人', () => change(-1));
    btn(c, '+5 人', () => change(5), 'alt');
    btn(c, '−5 人', () => change(-5), 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：先点一根直条选中它（变成橙色），再用按钮加减人数。');

    function drawGrid() {
      gridG.innerHTML = '';
      for (let k = 0; k <= NC; k++) {
        const y = y0 - k * CELL;
        if (k) S('line', { x1: x0, x2: 425, y1: y, y2: y, class: 'sline' }, gridG);
        T(gridG, x0 - 7, y + 4, String(k * scale), 'tick', 'end');
      }
    }
    function render() {
      vals.forEach((v, i) => {
        const h = Math.max(0, shown[i]), over = v > NC * scale;
        const b = bars[i];
        b.setAttribute('x', cx(i) - 22);
        b.setAttribute('y', y0 - h);
        b.setAttribute('height', h);
        b.setAttribute('class', over ? 'f2s s2 dash' : i === sel ? 'f2' : 'f1');
        vt[i].setAttribute('x', cx(i));
        vt[i].setAttribute('y', y0 - h - 6);
        vt[i].textContent = over ? v + ' 装不下' : String(v);
      });
    }
    function animate() {
      if (stop) stop();
      const from = shown.slice();
      const to = vals.map((v) => Math.min(v / scale, NC + 0.3) * CELL);
      stop = tween(450, (t) => { for (let i = 0; i < 4; i++) shown[i] = lerp(from[i], to[i], t); render(); });
    }
    function say() {
      const v = vals[sel], cells = v / scale;
      let s = `一格代表 <b>${scale}</b> 人。<span class="k2">${NAMES[sel]}：${v} 人</span>，${v} ÷ ${scale} = ${fmt(cells)}，`;
      if (v > NC * scale) s += `要画 ${fmt(cells)} 格，可是图上只有 ${NC} 格，<b>装不下了</b>！一格应该代表更多的人。`;
      else if (Number.isInteger(cells)) s += `直条画 ${cells} 格高。`;
      else if (Number.isInteger(cells * 2)) s += `直条画 ${Math.floor(cells) ? Math.floor(cells) + ' 格半' : '半格'}高。`;
      else s += `要画 ${fmt(cells)} 格高，不是整格也不是半格，很难画准。`;
      const mx = Math.max(...vals), mn = Math.min(...vals);
      const who = (x) => NAMES.filter((_, i) => vals[i] === x).join('、');
      s += `<br>最多的是${who(mx)}（${mx} 人），最少的是${who(mn)}（${mn} 人），相差 ${mx - mn} 人。`;
      if (vals.some((x) => x > NC * scale)) s += '<br>有直条装不下：试试把“一格代表”改大一些。';
      else if (Math.max(...vals) <= 3 * scale) s += '<br>直条都很矮，不容易比较：试试把“一格代表”改小一些。';
      read.innerHTML = s;
    }
    drawGrid();
    render();
    say();
    animate();
  };

  // ════════════════ 条形统计图：两张单式图合成复式图 ════════════════
  A.s_bar_compare = function (el) {
    const W = 440, Hh = 290;
    const svg = stage(el, W, Hh);
    const NAMES = ['跳绳', '足球', '篮球', '羽毛球'];
    const SEXN = ['男生', '女生'];
    const DATA = [[6, 11, 8, 5], [12, 3, 5, 9]];
    const y0 = 255, PX = 14;
    const AX = [[40, 215], [240, 415]];
    const sepX = (g, i) => AX[g][0] + 22 + i * 42;
    const comX = (g, i) => 100 + i * 88 + (g ? 14 : -14);
    const sepG = S('g', {}, svg), comG = S('g', { opacity: 0 }, svg);
    AX.forEach(([a, b], g) => {
      for (let k = 0; k <= 12; k += 2) {
        const y = y0 - k * PX;
        S('line', { x1: a, x2: b, y1: y, y2: y, class: k ? 'sline' : 'sstrong' }, sepG);
        T(sepG, a - 4, y + 4, String(k), 'tick', 'end');
      }
      S('line', { x1: a, x2: a, y1: y0, y2: y0 - 12 * PX - 8, class: 'sstrong' }, sepG);
      T(sepG, (a + b) / 2, 50, SEXN[g] + '最喜欢的运动', 'tb ts');
      NAMES.forEach((n, i) => T(sepG, sepX(g, i), y0 + 18, n, 'ts'));
    });
    for (let k = 0; k <= 12; k += 2) {
      const y = y0 - k * PX;
      S('line', { x1: 50, x2: 420, y1: y, y2: y, class: k ? 'sline' : 'sstrong' }, comG);
      T(comG, 46, y + 4, String(k), 'tick', 'end');
    }
    S('line', { x1: 50, x2: 50, y1: y0, y2: y0 - 12 * PX - 8, class: 'sstrong' }, comG);
    NAMES.forEach((n, i) => T(comG, 100 + i * 88, y0 + 18, n, 'ts'));
    T(comG, 220, 24, '四(2)班男生、女生最喜欢的运动', 'tb');
    S('rect', { x: 150, y: 38, width: 16, height: 12, class: 'f1' }, comG);
    T(comG, 172, 49, '男生', 'ts', 'start');
    S('rect', { x: 230, y: 38, width: 16, height: 12, class: 'f2' }, comG);
    T(comG, 252, 49, '女生', 'ts', 'start');
    T(svg, 430, 74, '单位：人', 'ts tm', 'end');

    let m = 0, sel = -1, busy = false;
    const bars = [];
    [0, 1].forEach((g) => DATA[g].forEach((v, i) => {
      const r = S('rect', { width: 26, height: v * PX, y: y0 - v * PX, class: (g ? 'f2' : 'f1') + ' clickable', tabindex: 0, role: 'button', 'aria-label': `${SEXN[g]}${NAMES[i]} ${v} 人` }, svg);
      const pick = () => { sel = i; render(); };
      r.addEventListener('click', pick);
      onKey(r, pick);
      bars.push({ r, g, i, v, t: T(svg, 0, y0 - v * PX - 5, String(v), 'ts') });
    }));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    const tog = btn(c, '合成一张复式条形统计图', () => {
      if (busy) return;
      busy = true;
      const from = m, to = m < 0.5 ? 1 : 0;
      tween(1100, (t) => { m = lerp(from, to, t); render(); }, () => {
        busy = false;
        tog.textContent = to ? '分开成两张单式图' : '合成一张复式条形统计图';
        render();
      });
    });
    btn(c, '取消选中', () => { sel = -1; render(); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：点任意一根直条，比一比这个项目的男生和女生。');

    function render() {
      bars.forEach((b) => {
        const x = lerp(sepX(b.g, b.i), comX(b.g, b.i), m);
        b.r.setAttribute('x', x - 13);
        b.t.setAttribute('x', x);
        const op = sel < 0 || sel === b.i ? 1 : 0.3;
        b.r.setAttribute('opacity', op);
        b.t.setAttribute('opacity', op);
      });
      sepG.setAttribute('opacity', 1 - m);
      comG.setAttribute('opacity', m);
      let s;
      if (m > 0 && m < 1) s = '直条正在挪动……';
      else if (m === 0) s = '左边是男生，右边是女生，这是两张<b>单式</b>条形统计图。想比较同一个项目的男生和女生，眼睛要在两张图之间跳来跳去。';
      else s = '合成一张<b>复式</b>条形统计图：同一个项目的两根直条挨在一起。看<b>图例</b>：<span class="k1">蓝色是男生</span>，<span class="k2">橙色是女生</span>。';
      if (sel >= 0 && (m === 0 || m === 1)) {
        const a = DATA[0][sel], b = DATA[1][sel];
        s += `<br><b>${NAMES[sel]}</b>：<span class="k1">男生 ${a} 人</span>，<span class="k2">女生 ${b} 人</span>，` +
          (a === b ? '一样多' : `${a > b ? '男生比女生' : '女生比男生'}多 ${Math.abs(a - b)} 人`) + `，一共 ${a + b} 人。`;
      }
      read.innerHTML = s;
    }
    render();
  };

  // ════════════════ 平均数：移多补少 ════════════════
  A.s_avg_blocks = function (el) {
    const W = 440, Hh = 290;
    const svg = stage(el, W, Hh);
    const NAMES = ['小明', '小红', '小军', '小丽'];
    const base = 252, BH = 22, X = [80, 175, 270, 365];
    const Y = (k) => base - (k + 1) * BH + 2;
    S('line', { x1: 20, x2: 420, y1: base, y2: base, class: 'sstrong' }, svg);
    const gB = S('g', {}, svg);
    const avgL = S('line', { x1: 30, x2: 412, class: 'guide', opacity: 0 }, svg);
    const avgT = T(svg, 420, 0, '', 't2 tb ts', 'end');
    const labT = X.map((x) => T(svg, x, base + 22, '', ''));
    const read = H('p', { class: 'anim-read' }, el);
    let vals = [], stacks = [], sel = -1, busy = false, lineOn = false, moves = 0, hint = '';
    const hits = X.map((x, i) => {
      const r = S('rect', { x: x - 42, y: 8, width: 84, height: base - 8, rx: 10, class: 'fsurf clickable', style: 'fill-opacity: 0', tabindex: 0, role: 'button', 'aria-label': NAMES[i] + '的方块' }, svg);
      r.addEventListener('click', () => pick(i));
      onKey(r, () => pick(i));
      return r;
    });

    function randVals() {
      for (;;) {
        const v = [0, 0, 0].map(() => 1 + rnd(9));
        const s = v[0] + v[1] + v[2];
        for (let d = 1; d <= 9; d++) {
          const all = [...v, d];
          if ((s + d) % 4 === 0 && Math.max(...all) - Math.min(...all) >= 3) return shuffle(all);
        }
      }
    }
    function build(v) {
      vals = v.slice(); gB.innerHTML = ''; sel = -1; moves = 0; lineOn = false;
      stacks = v.map((n, i) => Array.from({ length: n }, (_, k) =>
        S('rect', { x: X[i] - 20, y: Y(k), width: 40, height: BH - 3, rx: 4, class: 'f1s s1' }, gB)));
      update();
    }
    const now = () => stacks.map((s) => s.length);
    function idxMax() { let m = 0; stacks.forEach((s, i) => { if (s.length > stacks[m].length) m = i; }); return m; }
    function idxMin() { let m = 0; stacks.forEach((s, i) => { if (s.length < stacks[m].length) m = i; }); return m; }
    function moveOne(from, to, ms, done) {
      const blk = stacks[from].pop();
      const k = stacks[to].length;
      const xa = +blk.getAttribute('x'), ya = +blk.getAttribute('y'), xb = X[to] - 20, yb = Y(k);
      blk.setAttribute('class', 'f2s s2');
      gB.appendChild(blk);
      update();
      tween(ms, (t) => {
        blk.setAttribute('x', lerp(xa, xb, t));
        blk.setAttribute('y', lerp(ya, yb, t) - 40 * Math.sin(PI * t));
      }, () => { stacks[to].push(blk); moves++; update(); if (done) done(); });
    }
    function pick(i) {
      if (busy) return;
      if (sel < 0) {
        if (!stacks[i].length) { hint = '这一摞没有方块了，先点一摞高的。'; update(); return; }
        sel = i; update(); return;
      }
      if (sel === i) { sel = -1; update(); return; }
      if (stacks[i].length >= 10) { hint = '这一摞太高了，放不下啦。'; sel = -1; update(); return; }
      const from = sel;
      sel = -1; busy = true;
      moveOne(from, i, 500, () => { busy = false; update(); });
    }
    function stepAuto(ms, done) {
      const a = idxMax(), b = idxMin();
      if (stacks[a].length - stacks[b].length <= 1) { done(false); return; }
      moveOne(a, b, ms, () => done(true));
    }
    function update() {
      const n = now(), total = n.reduce((a, b) => a + b, 0), av = total / 4;
      const equal = Math.max(...n) === Math.min(...n);
      labT.forEach((t, i) => { t.textContent = `${NAMES[i]} ${n[i]}`; });
      hits.forEach((r, i) => {
        r.setAttribute('class', (i === sel ? 'f2s s2 dash' : 'fsurf') + ' clickable');
        r.setAttribute('style', i === sel ? 'fill-opacity: .35' : 'fill-opacity: 0');
      });
      const ly = base - av * BH;
      avgL.setAttribute('y1', ly); avgL.setAttribute('y2', ly);
      avgL.setAttribute('opacity', lineOn ? 1 : 0);
      avgT.setAttribute('y', ly - 5);
      avgT.textContent = lineOn ? `平均数 ${fmt(av)}` : '';
      let s = `原来：${NAMES.map((nm, i) => nm + ' ' + vals[i]).join('，')}。一共 ${total} 块，4 个人。`;
      if (equal) {
        s += `<br>现在<b>一样高</b>了！每人 <b class="k2">${av}</b> 块。${av} 就是 ${vals.join('、')} 这组数的<b>平均数</b>。` +
          (moves ? `（一共移动了 ${moves} 次）` : '');
      } else {
        s += `<br>现在：${n.join('、')}。最高 ${Math.max(...n)} 块，最矮 ${Math.min(...n)} 块。` +
          (sel >= 0 ? `已经选中<span class="k2">${NAMES[sel]}</span>，再点另一摞，移一块过去。` : '点一摞高的，再点一摞矮的，把多的移给少的。');
      }
      if (lineOn) s += `<br><span class="k2">橙色虚线</span>就是平均数 ${fmt(av)}：线上面多出来的方块，正好填满线下面空着的地方。`;
      if (hint) { s = hint + '<br>' + s; hint = ''; }
      read.innerHTML = s;
    }
    const c = ctrl(el);
    btn(c, '移多补少（移一块）', () => {
      if (busy) return;
      sel = -1; busy = true;
      stepAuto(550, (moved) => {
        busy = false;
        if (!moved) hint = '已经一样高了，不用再移了。';
        update();
      });
    });
    btn(c, '一直移到一样高', () => {
      if (busy) return;
      sel = -1; busy = true;
      const loop = () => stepAuto(380, (moved) => { if (moved) loop(); else { busy = false; update(); } });
      loop();
    });
    btn(c, '显示平均数线', () => { lineOn = !lineOn; update(); }, 'alt');
    btn(c, '换一组数', () => { if (!busy) build(randVals()); }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：先自己动手——点一摞高的，再点一摞矮的，方块就会飞过去。');
    build([7, 3, 6, 4]);
  };

  // ════════════════ 平均数：先合后分 ════════════════
  A.s_avg_calc = function (el) {
    const W = 440, Hh = 270;
    const svg = stage(el, W, Hh);
    const DAYS = ['周一', '周二', '周三', '周四', '周五'];
    const v = [12, 15, 10, 18, 20];
    const K = 4, base = 242, BW = 36, BX = (i) => 70 + i * 66;
    const SX = 20, SY = 24, SHt = 24;
    S('line', { x1: 30, x2: 362, y1: base, y2: base, class: 'sstrong' }, svg);
    DAYS.forEach((d, i) => T(svg, BX(i), base + 20, d, 'ts'));
    const bars = v.map(() => S('rect', { class: 'f1s s1' }, svg));
    const vt = v.map(() => T(svg, 0, 0, '', 'ts'));
    const cuts = S('g', {}, svg);
    const pieces = v.map(() => S('rect', { class: 'f2s s2', opacity: 0 }, svg));
    const avgL = S('line', { x1: 40, x2: 362, class: 'guide', opacity: 0 }, svg);
    const avgT = T(svg, 366, 0, '', 't2 tb ts', 'start');
    const read = H('p', { class: 'anim-read' }, el);
    let ph = 0, busy = false, known = false, moved = false;
    const sum = () => v.reduce((a, b) => a + b, 0);
    const avg = () => sum() / 5;
    const setR = (r, x, y, w, h) => { r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', Math.max(0, w)); r.setAttribute('height', Math.max(0, h)); };
    const colBox = (i, h) => [BX(i) - BW / 2, base - h * K, BW, h * K];
    function stripBox(i) {
      let pre = 0;
      for (let j = 0; j < i; j++) pre += v[j];
      return [SX + pre * K, SY, v[i] * K, SHt];
    }
    function layoutCols() {
      v.forEach((x, i) => {
        setR(bars[i], ...colBox(i, x));
        bars[i].setAttribute('opacity', 1);
        vt[i].setAttribute('x', BX(i)); vt[i].setAttribute('y', base - x * K - 6);
        vt[i].textContent = x; vt[i].setAttribute('opacity', 1);
        pieces[i].setAttribute('opacity', 0);
      });
      cuts.innerHTML = '';
      const ly = base - avg() * K;
      avgL.setAttribute('y1', ly); avgL.setAttribute('y2', ly);
      avgL.setAttribute('opacity', known ? 1 : 0);
      avgT.setAttribute('y', ly + 4);
      avgT.textContent = known ? `平均 ${fmt(avg())}` : '';
    }
    function say() {
      const s = sum(), a = avg();
      let t;
      if (ph === 0) {
        t = `五天读的页数：${v.join('、')}。有多有少，不一样。`;
        if (known) {
          t += `<br>平均每天读 <b>${fmt(a)}</b> 页（橙色虚线）。它在最少的 ${Math.min(...v)} 和最多的 ${Math.max(...v)} 之间。`;
          if (moved) t += ' 拖动“周五”的滑块：周五读得越多，平均数就被拉得越高。';
        } else t += ' 点“① 先合起来”。';
      } else if (ph === 1) {
        t = `<b>先合起来</b>：${v.join(' + ')} = <b>${s}</b>（页）。五天的直条接成了一长条。`;
      } else {
        t = `<b>再平均分</b>成 5 份：${s} ÷ 5 = <b>${fmt(a)}</b>（页）。<br>如果每天都读 ${fmt(a)} 页，五天一共也是 ${s} 页。所以 <b>平均数 = 总数 ÷ 份数</b>。`;
      }
      read.innerHTML = t;
    }
    const c = ctrl(el);
    const mainB = btn(c, '① 先合起来', () => {
      if (busy) return;
      busy = true;
      if (ph === 0) {
        const from = v.map((x, i) => colBox(i, x)), to = v.map((x, i) => stripBox(i));
        tween(1000, (t) => {
          bars.forEach((r, i) => setR(r, ...from[i].map((q, k) => lerp(q, to[i][k], t))));
          vt.forEach((e) => e.setAttribute('opacity', 1 - t));
          avgL.setAttribute('opacity', known ? 1 - t : 0);
          avgT.setAttribute('opacity', 1 - t);
        }, () => { ph = 1; busy = false; mainB.textContent = '② 再平均分'; say(); });
      } else if (ph === 1) {
        const a = avg();
        cuts.innerHTML = '';
        for (let i = 1; i < 5; i++) {
          const x = SX + i * a * K;
          S('line', { x1: x, x2: x, y1: SY - 6, y2: SY + SHt + 6, class: 'sstrong dash' }, cuts);
        }
        cuts.setAttribute('opacity', 0);
        tween(500, (t) => cuts.setAttribute('opacity', t), () => {
          const from = v.map((x, i) => [SX + i * a * K, SY, a * K, SHt]);
          const to = v.map((x, i) => colBox(i, a));
          pieces.forEach((r, i) => { setR(r, ...from[i]); r.setAttribute('opacity', 1); });
          bars.forEach((r) => r.setAttribute('opacity', 0));
          tween(1000, (t) => {
            pieces.forEach((r, i) => setR(r, ...from[i].map((q, k) => lerp(q, to[i][k], t))));
            cuts.setAttribute('opacity', 1 - t);
          }, () => {
            ph = 2; busy = false; known = true;
            const ly = base - a * K;
            avgL.setAttribute('y1', ly); avgL.setAttribute('y2', ly); avgL.setAttribute('opacity', 1);
            avgT.setAttribute('y', ly + 4); avgT.setAttribute('opacity', 1); avgT.textContent = `平均 ${fmt(a)}`;
            mainB.textContent = '回到原来的样子';
            say();
          });
        });
      } else {
        layoutCols();
        bars.forEach((r) => r.setAttribute('opacity', 0));
        vt.forEach((e) => e.setAttribute('opacity', 0));
        pieces.forEach((r) => r.setAttribute('opacity', 1));
        avgT.setAttribute('opacity', 1);
        tween(600, (t) => {
          bars.forEach((r) => r.setAttribute('opacity', t));
          vt.forEach((e) => e.setAttribute('opacity', t));
          pieces.forEach((r) => r.setAttribute('opacity', 1 - t));
        }, () => { ph = 0; busy = false; mainB.textContent = '① 先合起来'; layoutCols(); say(); });
      }
    });
    const sF = slider(c, 'avgfri', '周五', 0, 40, 1, v[4], (x) => {
      if (busy) { sF.set(v[4]); return; }
      v[4] = x; moved = true;
      if (ph !== 0) { ph = 0; mainB.textContent = '① 先合起来'; }
      avgT.setAttribute('opacity', 1);
      layoutCols(); say();
    });
    layoutCols();
    say();
  };

  // ════════════════ 折线统计图：描点、连线、找最陡的一段 ════════════════
  A.s_line_temp = function (el) {
    const W = 440, Hh = 300;
    const svg = stage(el, W, Hh);
    const HRS = [8, 10, 12, 14, 16, 18];
    const ORIG = [17, 20, 25, 28, 26, 21];
    const tmp = ORIG.slice();
    const X = (i) => 85 + i * 62;
    const Y = (c) => 262 - c * 7;
    for (let c = 0; c <= 30; c += 5) {
      if (c) S('line', { x1: 50, x2: 420, y1: Y(c), y2: Y(c), class: 'sline' }, svg);
      T(svg, 44, Y(c) + 4, String(c), 'tick', 'end');
    }
    HRS.forEach((h, i) => {
      S('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(30), class: 'sline' }, svg);
      T(svg, X(i), Y(0) + 18, h + '时', 'ts');
    });
    S('line', { x1: 50, x2: 425, y1: Y(0), y2: Y(0), class: 'sstrong' }, svg);
    S('line', { x1: 50, x2: 50, y1: Y(0), y2: Y(30) - 12, class: 'sstrong' }, svg);
    T(svg, 54, 30, '气温（°C）', 'ts tm', 'start');
    T(svg, 270, 22, '某地一天的气温变化', 'tb');
    const guideG = S('g', {}, svg);
    const hiG = S('g', {}, svg);
    const path = S('path', { class: 'fline', pathLength: 1 }, svg);
    const dots = HRS.map(() => S('circle', { r: 6, class: 'dot' }, svg));
    const vts = HRS.map(() => T(svg, 0, 0, '', 'ts tb'));
    const handles = HRS.map((h, i) => S('circle', { r: 13, class: 'handle', tabindex: 0, 'aria-label': `${h} 时的气温，可以上下拖动` }, svg));
    const tbl = H('div', { class: 'tbl-wrap' }, el);
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let ph = 0, connected = false, fast = false, busy = false;

    function seg(i, cls, label, tcls) {
      S('line', { x1: X(i), y1: Y(tmp[i]), x2: X(i + 1), y2: Y(tmp[i + 1]), class: cls + ' round', style: 'stroke-width: 10; opacity: .45' }, hiG);
      T(hiG, (X(i) + X(i + 1)) / 2, (Y(tmp[i]) + Y(tmp[i + 1])) / 2 + 26, label, tcls + ' tb ts');
    }
    function render() {
      for (let i = 0; i < 6; i++) {
        const on = i < ph;
        dots[i].setAttribute('cx', X(i)); dots[i].setAttribute('cy', Y(tmp[i]));
        dots[i].setAttribute('opacity', on ? 1 : 0);
        vts[i].setAttribute('x', X(i)); vts[i].setAttribute('y', Y(tmp[i]) - 12);
        vts[i].textContent = tmp[i];
        vts[i].setAttribute('opacity', on ? 1 : 0);
        handles[i].setAttribute('cx', X(i)); handles[i].setAttribute('cy', Y(tmp[i]));
        handles[i].style.display = connected ? '' : 'none';
      }
      path.setAttribute('d', connected ? 'M' + tmp.map((t, i) => `${X(i)},${Y(t)}`).join(' L') : '');
      hiG.innerHTML = '';
      const d = tmp.slice(1).map((t, i) => t - tmp[i]);
      const up = Math.max(...d), dn = Math.min(...d);
      const ups = [], dns = [];
      d.forEach((x, i) => { if (up > 0 && x === up) ups.push(i); if (dn < 0 && x === dn) dns.push(i); });
      if (connected && fast) {
        ups.forEach((i) => seg(i, 's2', `+${up}°C`, 't2'));
        dns.forEach((i) => seg(i, 's3', `−${-dn}°C`, 't3'));
      }
      tbl.innerHTML = `<table class="mini"><tr><th>时刻</th>${HRS.map((h) => `<td>${h} 时</td>`).join('')}</tr>` +
        `<tr><th>气温/°C</th>${tmp.map((t, i) => `<td${i === ph - 1 && !connected ? ' style="font-weight:700"' : ''}>${t}</td>`).join('')}</tr></table>`;
      mainB.textContent = ph < 6 ? `描第 ${ph + 1} 个点` : !connected ? '连线' : fast ? '隐藏最陡的一段' : '找变化最快的一段';
      let s;
      const pt = (i) => `第 ${i + 1} 个点：从横轴的 <b>${HRS[i]} 时</b>往上，从纵轴的 <b>${tmp[i]}°C</b> 往右，两条虚线相交的地方点一个点。`;
      if (ph === 0) s = '先看下面的表格：8 时是 17°C……点“描第 1 个点”，把表格里的数画到图上。';
      else if (ph < 6) s = pt(ph - 1);
      else if (!connected) s = pt(5) + '<br>6 个点都描好了！点“连线”，按时间顺序把点连起来。';
      else {
        const mx = Math.max(...tmp), mn = Math.min(...tmp);
        s = `最高气温在 <b>${HRS[tmp.indexOf(mx)]} 时</b>，${mx}°C；最低在 ${HRS[tmp.indexOf(mn)]} 时，${mn}°C。线往上斜，气温在<b>上升</b>；往下斜，气温在<b>下降</b>。`;
        if (fast) {
          const nm = (arr) => arr.map((i) => `${HRS[i]} 时到 ${HRS[i + 1]} 时`).join('、');
          s += '<br>' + (ups.length ? `上升最快：<span class="k2">${nm(ups)}，升高了 ${up}°C</span>，这一段线最陡。` : '这次没有上升的一段。');
          s += dns.length ? ` 下降最快：<span class="k3">${nm(dns)}，降低了 ${-dn}°C</span>。` : ' 这次没有下降的一段。';
        } else s += ' 点“找变化最快的一段”。';
        s += '<br>还可以上下拖动圆点，改一改气温，看看线怎么变。';
      }
      read.innerHTML = s;
    }
    function plotNext(done) {
      const i = ph;
      guideG.innerHTML = '';
      const vl = S('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(0), class: 'guide' }, guideG);
      const hl = S('line', { x1: 50, x2: 50, y1: Y(tmp[i]), y2: Y(tmp[i]), class: 'guide' }, guideG);
      tween(650, (t) => { vl.setAttribute('y2', lerp(Y(0), Y(tmp[i]), t)); hl.setAttribute('x2', lerp(50, X(i), t)); }, () => {
        ph = i + 1;
        render();
        const d = dots[i];
        tween(260, (t) => d.setAttribute('r', 6 + 6 * (1 - t)), done);
      });
    }
    const mainB = btn(c, '描第 1 个点', () => {
      if (busy) return;
      if (ph < 6) { busy = true; plotNext(() => { busy = false; }); }
      else if (!connected) {
        busy = true; connected = true; guideG.innerHTML = '';
        render();
        path.setAttribute('stroke-dasharray', 1); path.setAttribute('stroke-dashoffset', 1);
        tween(1000, (t) => path.setAttribute('stroke-dashoffset', 1 - t), () => {
          path.removeAttribute('stroke-dasharray'); path.removeAttribute('stroke-dashoffset');
          busy = false; render();
        });
      } else { fast = !fast; render(); }
    });
    btn(c, '一下子画好', () => { if (busy) return; ph = 6; connected = true; guideG.innerHTML = ''; render(); }, 'alt');
    btn(c, '重来', () => {
      if (busy) return;
      ph = 0; connected = false; fast = false; guideG.innerHTML = '';
      tmp.splice(0, 6, ...ORIG);
      render();
    }, 'alt');
    handles.forEach((h, i) => {
      h.addEventListener('pointerdown', (e) => {
        if (!connected || busy) return;
        e.preventDefault();
        h.setPointerCapture(e.pointerId);
        const move = (ev) => {
          const p = svgPoint(svg, ev);
          const val = Math.max(0, Math.min(30, Math.round((262 - p.y) / 7)));
          if (val !== tmp[i]) { tmp[i] = val; render(); }
        };
        const up = () => { h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); };
        h.addEventListener('pointermove', move);
        h.addEventListener('pointerup', up);
      });
      h.addEventListener('keydown', (e) => {
        if (!connected || busy) return;
        if (e.key === 'ArrowUp' && tmp[i] < 30) { tmp[i]++; render(); e.preventDefault(); }
        else if (e.key === 'ArrowDown' && tmp[i] > 0) { tmp[i]--; render(); e.preventDefault(); }
      });
    });
    render();
  };

  // ════════════════ 折线统计图：条形图变折线图、复式折线图 ════════════════
  A.s_line_morph = function (el) {
    const W = 440, Hh = 290;
    const svg = stage(el, W, Hh);
    const MON = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const COLD = [12, 15, 22, 34, 50, 58], HOT = [50, 44, 32, 24, 16, 12];
    const X = (i) => 85 + i * 62;
    const Y = (v) => 250 - v * 3;
    for (let k = 0; k <= 60; k += 10) {
      S('line', { x1: 50, x2: 420, y1: Y(k), y2: Y(k), class: k ? 'sline' : 'sstrong' }, svg);
      T(svg, 44, Y(k) + 4, String(k), 'tick', 'end');
    }
    S('line', { x1: 50, x2: 50, y1: Y(0), y2: Y(60) - 12, class: 'sstrong' }, svg);
    MON.forEach((mo, i) => T(svg, X(i), Y(0) + 18, mo, 'ts'));
    T(svg, 54, 50, '销量（箱）', 'ts tm', 'start');
    const title = T(svg, 250, 22, '', 'tb');
    const legend = S('g', { opacity: 0 }, svg);
    S('line', { x1: 300, x2: 324, y1: 45, y2: 45, class: 's1 thick' }, legend);
    T(legend, 330, 50, '冷饮', 'ts', 'start');
    S('line', { x1: 368, x2: 392, y1: 45, y2: 45, class: 's2 thick' }, legend);
    T(legend, 398, 50, '热饮', 'ts', 'start');
    const bars = COLD.map(() => S('rect', { class: 'f1s s1' }, svg));
    const line1 = S('path', { class: 'fline', pathLength: 1, d: 'M' + COLD.map((v, i) => `${X(i)},${Y(v)}`).join(' L') }, svg);
    const dots1 = COLD.map((v, i) => S('circle', { cx: X(i), cy: Y(v), r: 0, class: 'f1' }, svg));
    const hotG = S('g', {}, svg);
    const line2 = S('path', { class: 'fnone s2 thick round', pathLength: 1, d: 'M' + HOT.map((v, i) => `${X(i)},${Y(v)}`).join(' L') }, hotG);
    const dots2 = HOT.map((v, i) => S('circle', { cx: X(i), cy: Y(v), r: 5, class: 'f2' }, hotG));
    const vt2 = HOT.map((v, i) => T(hotG, X(i), Y(v) - 9, String(v), 'ts t2'));
    const vt1 = COLD.map((v, i) => T(svg, X(i), Y(v) - 9, String(v), 'ts t1'));
    const read = H('p', { class: 'anim-read' }, el);
    const c = ctrl(el);
    let m = 0, h = 0, busy = false;

    function render() {
      const bw = 30 * (1 - m);
      bars.forEach((b, i) => {
        b.setAttribute('x', X(i) - bw / 2); b.setAttribute('y', Y(COLD[i]));
        b.setAttribute('width', bw); b.setAttribute('height', COLD[i] * 3);
        b.setAttribute('opacity', 1 - m * 0.6);
      });
      line1.setAttribute('stroke-dasharray', 1);
      line1.setAttribute('stroke-dashoffset', 1 - m);
      dots1.forEach((d) => d.setAttribute('r', 5 * m));
      line2.setAttribute('stroke-dasharray', 1);
      line2.setAttribute('stroke-dashoffset', 1 - h);
      dots2.forEach((d) => d.setAttribute('opacity', h));
      vt2.forEach((t) => t.setAttribute('opacity', h));
      hotG.style.display = h > 0 ? '' : 'none';
      legend.setAttribute('opacity', h);
      title.textContent = h > 0.5 ? '冷饮和热饮 1—6 月的销量' : '冷饮 1—6 月的销量';
      title.setAttribute('x', h > 0.5 ? 170 : 250);
      morphB.textContent = m > 0.5 ? '变回条形统计图' : '变成折线统计图';
      hotB.textContent = h > 0.5 ? '去掉热饮' : '再加一条：热饮';
      let s;
      if (busy) s = '正在变化……';
      else if (m < 0.5) s = '<b>条形统计图</b>：直条的长短表示<b>多少</b>。6 月卖得最多（58 箱），1 月最少（12 箱）。';
      else if (h < 0.5) s = '<b>折线统计图</b>：直条缩成了点，再把点连成线。它不但能看出多少，还能看出<b>变化</b>：线一直往上走，冷饮越卖越多。<br>4 月到 5 月这一段最陡，增加了 50 − 34 = 16 箱，增长最快。';
      else s = '<b>复式折线统计图</b>：两条线画在一起比较。<span class="k1">冷饮</span>越卖越多，<span class="k2">热饮</span>越卖越少。<br>3 月热饮卖得多，4 月冷饮卖得多，两条线在 3 月和 4 月之间交叉。';
      read.innerHTML = s;
    }
    const animM = (to, done) => { const from = m; tween(1000, (t) => { m = lerp(from, to, t); render(); }, done); };
    const animH = (to, done) => { const from = h; tween(900, (t) => { h = lerp(from, to, t); render(); }, done); };
    const fin = () => { busy = false; render(); };
    const morphB = btn(c, '变成折线统计图', () => {
      if (busy) return;
      busy = true;
      if (m > 0.5) { if (h > 0) animH(0, () => animM(0, fin)); else animM(0, fin); }
      else animM(1, fin);
    });
    const hotB = btn(c, '再加一条：热饮', () => {
      if (busy) return;
      busy = true;
      if (h > 0.5) animH(0, fin);
      else if (m < 0.5) animM(1, () => animH(1, fin));
      else animH(1, fin);
    }, 'alt');
    render();
  };

  // ════════════════ 可能性：摸球 ════════════════
  A.s_possible_box = function (el) {
    const W = 440, Hh = 250;
    const svg = stage(el, W, Hh);
    const CN = ['蓝', '橙', '绿'], CC = ['f1', 'f2', 'f3'];
    const MAXB = 15;
    let balls = [0, 0, 1, 0], tally = [0, 0, 0], busy = false, hint = '';
    T(svg, 130, 236, '摸球盒', 'ts tm');
    const gBalls = S('g', {}, svg);
    S('path', { d: 'M30,92 V222 H230 V92', class: 'fnone sstrong thick round' }, svg);
    S('circle', { cx: 335, cy: 62, r: 20, class: 'fnone smuted dash' }, svg);
    const resB = S('circle', { cx: 335, cy: 62, r: 16, class: 'f1', opacity: 0 }, svg);
    T(svg, 335, 104, '摸出来的球', 'ts tm');
    const tallyT = [0, 1, 2].map((k) => {
      S('circle', { cx: 282, cy: 140 + k * 30, r: 8, class: CC[k] }, svg);
      return T(svg, 298, 145 + k * 30, '', 'ts', 'start');
    });
    const read = H('p', { class: 'anim-read' }, el);
    const pos = (k) => [56 + (k % 5) * 37, 204 - Math.floor(k / 5) * 32];
    let ballEls = [];

    function renderBox() {
      gBalls.innerHTML = '';
      ballEls = balls.map((col, k) => {
        const [x, y] = pos(k);
        return S('circle', { cx: x, cy: y, r: 14, class: CC[col] + ' sstrong thin' }, gBalls);
      });
    }
    function say(prefix) {
      const n = [0, 1, 2].map((col) => balls.filter((b) => b === col).length), N = balls.length;
      const T0 = tally[0] + tally[1] + tally[2];
      tallyT.forEach((t, k) => { t.textContent = `${CN[k]}球：摸到 ${tally[k]} 次`; });
      let s = prefix ? prefix + '<br>' : '';
      if (hint) { s = hint + '<br>' + s; hint = ''; }
      if (!N) { read.innerHTML = s + '盒子是空的，什么也摸不到。用下面的按钮放几个球进去。'; return; }
      s += `盒子里：蓝球 ${n[0]} 个，橙球 ${n[1]} 个，绿球 ${n[2]} 个。<br>`;
      s += n.map((k, i) => (k === N ? `<b>一定</b>摸到${CN[i]}球` : k === 0 ? `<b>不可能</b>摸到${CN[i]}球` : `<b>可能</b>摸到${CN[i]}球`)).join('；') + '。';
      const kinds = n.filter((k) => k > 0).length;
      if (kinds >= 2) {
        const mx = Math.max(...n);
        const big = CN.filter((_, i) => n[i] === mx);
        s += big.length === 1 ? ` ${big[0]}球最多，摸到${big[0]}球的可能性<b>最大</b>。` : ` ${big.join('球、')}球一样多，摸到它们的可能性一样大。`;
      }
      if (T0) s += `<br>一共摸了 ${T0} 次（每次都放回去再摇匀）。`;
      read.innerHTML = s;
    }
    function drawOne() {
      if (busy) return;
      if (!balls.length) { say(); return; }
      busy = true;
      const k = rnd(balls.length), col = balls[k], b = ballEls[k];
      const [bx, by] = pos(k);
      resB.setAttribute('opacity', 0);
      gBalls.appendChild(b);
      tween(350, (t) => b.setAttribute('cy', lerp(by, 50, t)), () => {
        tween(350, (t) => { b.setAttribute('cx', lerp(bx, 335, t)); b.setAttribute('cy', lerp(50, 62, t)); }, () => {
          tally[col]++;
          resB.setAttribute('class', CC[col]);
          resB.setAttribute('opacity', 1);
          b.setAttribute('opacity', 0);
          say(`摸到了一个<b>${CN[col]}球</b>！`);
          setTimeout(() => { shuffle(balls); renderBox(); busy = false; }, RM ? 0 : 500);
        });
      });
    }
    function drawMany(n) {
      if (busy || !balls.length) { if (!balls.length) say(); return; }
      let col = 0;
      for (let i = 0; i < n; i++) { col = balls[rnd(balls.length)]; tally[col]++; }
      resB.setAttribute('class', CC[col]);
      resB.setAttribute('opacity', 1);
      shuffle(balls); renderBox();
      say(`又摸了 ${n} 次，最后一次摸到${CN[col]}球。`);
    }
    function add(col) {
      if (busy) return;
      if (balls.length >= MAXB) { hint = '盒子装满了。'; say(); return; }
      balls.push(col); shuffle(balls);
      tally = [0, 0, 0]; resB.setAttribute('opacity', 0);
      renderBox(); say(`放进一个${CN[col]}球，摸球记录清零。`);
    }
    const c1 = ctrl(el);
    btn(c1, '摸一个（再放回）', drawOne);
    btn(c1, '摸 10 次', () => drawMany(10));
    btn(c1, '记录清零', () => { if (busy) return; tally = [0, 0, 0]; resB.setAttribute('opacity', 0); say(); }, 'alt');
    const c2 = ctrl(el);
    btn(c2, '+ 蓝球', () => add(0), 'alt');
    btn(c2, '+ 橙球', () => add(1), 'alt');
    btn(c2, '+ 绿球', () => add(2), 'alt');
    btn(c2, '倒空盒子', () => {
      if (busy) return;
      balls = []; tally = [0, 0, 0]; resB.setAttribute('opacity', 0);
      renderBox(); say();
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '试一试：倒空盒子，只放蓝球，会怎样？再放一个橙球呢？');
    renderBox();
    say();
  };

  // ════════════════ 可能性：转盘 ════════════════
  A.s_possible_spinner = function (el) {
    const W = 440, Hh = 260;
    const svg = stage(el, W, Hh);
    const cx = 120, cy = 140, R = 100;
    const CN = ['蓝', '橙', '绿'], CC = ['f1', 'f2', 'f3'];
    let nb = 6, no = 4, rot = 0, busy = false, tally = [0, 0, 0], last = -1;
    const disk = S('g', {}, svg);
    S('circle', { cx, cy, r: R + 2, class: 'fnone sstrong' }, svg);
    S('path', { d: `M${cx - 11},${cy - R - 26} L${cx + 11},${cy - R - 26} L${cx},${cy - R + 8} Z`, class: 'fstrong' }, svg);
    S('circle', { cx, cy, r: 7, class: 'fstrong' }, svg);
    T(svg, 340, 30, '转盘结果', 'tb');
    const rows = [0, 1, 2].map((k) => {
      const y = 62 + k * 52;
      S('rect', { x: 252, y: y - 12, width: 14, height: 14, rx: 3, class: CC[k] }, svg);
      const lab = T(svg, 274, y, '', 'ts', 'start');
      const bar = S('rect', { x: 252, y: y + 8, height: 12, width: 0, rx: 3, class: CC[k] }, svg);
      const num = T(svg, 258, y + 19, '', 'ts tb', 'start');
      return { lab, bar, num };
    });
    const totT = T(svg, 340, 236, '', 'ts tm');
    const read = H('p', { class: 'anim-read' }, el);
    const mod = (x) => ((x % 360) + 360) % 360;
    const colorOf = (j) => (j < nb ? 0 : j < nb + no ? 1 : 2);
    const idxAt = (r) => Math.floor(mod(-r) / 30) % 12;

    function drawDisk() {
      disk.innerHTML = '';
      for (let j = 0; j < 12; j++) {
        const a0 = ((-90 + j * 30) * PI) / 180, a1 = a0 + PI / 6;
        S('path', {
          d: `M0,0 L${R * Math.cos(a0)},${R * Math.sin(a0)} A${R},${R} 0 0 1 ${R * Math.cos(a1)},${R * Math.sin(a1)} Z`,
          class: 'wedge ' + CC[colorOf(j)]
        }, disk);
      }
      disk.setAttribute('transform', `translate(${cx},${cy}) rotate(${rot})`);
    }
    function render(prefix) {
      const n = [nb, no, 12 - nb - no];
      const tot = tally[0] + tally[1] + tally[2], mx = Math.max(1, ...tally);
      rows.forEach((r, k) => {
        r.lab.textContent = `${CN[k]}色：占 ${n[k]} 格`;
        const w = (tally[k] / mx) * 130;
        r.bar.setAttribute('width', w);
        r.num.setAttribute('x', 258 + w);
        r.num.textContent = `${tally[k]} 次`;
      });
      totT.textContent = `一共转了 ${tot} 次`;
      let s = prefix ? prefix + '<br>' : '';
      s += `转盘平均分成 12 格：蓝 ${n[0]} 格，橙 ${n[1]} 格，绿 ${n[2]} 格。指针` +
        n.map((k, i) => (k === 12 ? `<b>一定</b>停在${CN[i]}色` : k === 0 ? `<b>不可能</b>停在${CN[i]}色` : `<b>可能</b>停在${CN[i]}色`)).join('，') + '。';
      const kinds = n.filter((k) => k > 0).length;
      if (kinds >= 2) {
        const big = Math.max(...n), small = Math.min(...n.filter((k) => k > 0));
        const bn = CN.filter((_, i) => n[i] === big), sn = CN.filter((_, i) => n[i] === small);
        if (big === small) s += ' 有颜色的格子一样多，停在它们上面的可能性一样大。';
        else s += ` ${bn.join('、')}色格子最多，可能性<b>最大</b>；${sn.join('、')}色格子最少，可能性最小。`;
      }
      if (tot && kinds === 1) s += '<br>只有一种颜色，不管转多少次，结果都一样。';
      else if (tot) s += tot < 20 ? '<br>转的次数还少，结果可能和你猜的不一样。多转几次看看。' : '<br>转得越多，格子多的颜色，停到的次数一般也越多。';
      read.innerHTML = s;
    }
    function spin(times) {
      if (busy) return;
      busy = true;
      const finals = [];
      for (let i = 0; i < times; i++) finals.push(Math.random() * 360);
      const a = finals[times - 1];
      const from = rot, to = rot + 3 * 360 + mod(a - rot);
      tween(times === 1 ? 1800 : 900, (t) => {
        rot = lerp(from, to, t);
        disk.setAttribute('transform', `translate(${cx},${cy}) rotate(${rot})`);
      }, () => {
        rot = mod(to);
        disk.setAttribute('transform', `translate(${cx},${cy}) rotate(${rot})`);
        finals.forEach((f) => { tally[colorOf(idxAt(f))]++; });
        last = colorOf(idxAt(rot));
        busy = false;
        render(times === 1 ? `这次停在<b>${CN[last]}色</b>！` : `又转了 ${times} 次，最后一次停在${CN[last]}色。`);
      });
    }
    const c = ctrl(el);
    btn(c, '转一次', () => spin(1));
    btn(c, '转 20 次', () => spin(20));
    btn(c, '清空记录', () => { if (busy) return; tally = [0, 0, 0]; render(); }, 'alt');
    const c2 = ctrl(el);
    const changed = () => { tally = [0, 0, 0]; drawDisk(); render(); };
    const sB = slider(c2, 'spb', '蓝', 0, 12, 1, nb, (v) => {
      if (busy) { sB.set(nb); return; }
      nb = v;
      if (nb + no > 12) { no = 12 - nb; sO.set(no); }
      changed();
    });
    const sO = slider(c2, 'spo', '橙', 0, 12, 1, no, (v) => {
      if (busy) { sO.set(no); return; }
      no = v;
      if (nb + no > 12) { nb = 12 - no; sB.set(nb); }
      changed();
    });
    H('p', { class: 'anim-tip' }, el, '拖动滑块改变蓝色、橙色的格数，剩下的格子是绿色。试试把蓝色调到 12 格。');
    drawDisk();
    render();
  };

  // ════════════════ 扇形统计图：长条卷成圆 ════════════════
  A.s_pie_roll = function (el) {
    const W = 440, Hh = 290;
    const svg = stage(el, W, Hh);
    const SETS = [
      { t: '小华每月零花钱的用途', n: ['买书', '文具', '零食', '存起来'], p: [40, 25, 15, 20] },
      { t: '同学们上学的方式', n: ['步行', '坐公交', '家长接送'], p: [45, 30, 25] },
      { t: '学校图书角的书', n: ['故事书', '科普书', '其他'], p: [50, 30, 20] }
    ];
    const CLS = ['f1s s1', 'f2s s2', 'f3s s3', 'fsurf2 smuted'];
    const L0 = 20, LW = 400, SY = 44, SH = 34;
    const cx = 220, cy = 180, R = 95;
    const title = T(svg, 220, 24, '', 'tb');
    const g = S('g', {}, svg);
    const read = H('p', { class: 'anim-read' }, el);
    let si = 0, m = 0, busy = false, parts = [];

    function shape(a, b, mm) {
      const N = Math.max(2, Math.ceil((b - a) * 90));
      const out = [], inn = [];
      for (let i = 0; i <= N; i++) {
        const s = a + ((b - a) * i) / N, th = 2 * PI * s;
        out.push([lerp(L0 + LW * s, cx + R * Math.sin(th), mm), lerp(SY, cy - R * Math.cos(th), mm)]);
        inn.push([lerp(L0 + LW * s, cx, mm), lerp(SY + SH, cy, mm)]);
      }
      return 'M' + out.concat(inn.reverse()).map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' L') + ' Z';
    }
    function build() {
      g.innerHTML = '';
      const set = SETS[si];
      title.textContent = set.t;
      let acc = 0;
      parts = set.p.map((p, k) => {
        const a = acc / 100, b = (acc + p) / 100;
        acc += p;
        const path = S('path', { class: CLS[k] }, g);
        const nameS = T(g, L0 + LW * (a + b) / 2, SY + SH + 18, set.n[k], 'ts');
        const mid = 2 * PI * (a + b) / 2;
        const px = cx + 0.6 * R * Math.sin(mid), py = cy - 0.6 * R * Math.cos(mid);
        const nameP = T(g, px, py - 4, set.n[k], 'ts');
        const pct = T(g, 0, 0, p + '%', 'ts tb');
        return { a, b, path, nameS, nameP, pct, sx: L0 + LW * (a + b) / 2, sy: SY + SH / 2 + 5, px, py: py + 13 };
      });
      render();
    }
    function render() {
      parts.forEach((q) => {
        q.path.setAttribute('d', shape(q.a, q.b, m));
        q.nameS.setAttribute('opacity', Math.max(0, 1 - 2 * m));
        q.nameP.setAttribute('opacity', Math.max(0, 2 * m - 1));
        q.pct.setAttribute('x', lerp(q.sx, q.px, m));
        q.pct.setAttribute('y', lerp(q.sy, q.py, m));
      });
      const set = SETS[si];
      const list = set.n.map((nm, k) => `${nm} ${set.p[k]}%`).join('，');
      let s;
      if (m > 0 && m < 1) s = '正在卷……';
      else if (m === 0) s = `这一整条代表<b>整体（100%）</b>。按百分比分成了 ${set.n.length} 段：${list}。<br>${set.p.join('% + ')}% = 100%。`;
      else {
        const big = Math.max(...set.p), bk = set.p.indexOf(big);
        s = `把长条首尾接起来卷成圆，每一段变成了一个<b>扇形</b>。整个圆是 100%，${set.n[bk]}占 ${big}%，扇形最大。` +
          `<br>圆心角 = 360° × 百分比，例如${set.n[0]}：360° × ${set.p[0]}% = ${fmt(3.6 * set.p[0])}°。`;
      }
      read.innerHTML = s;
    }
    const c = ctrl(el);
    const rollB = btn(c, '卷成一个圆', () => {
      if (busy) return;
      busy = true;
      const from = m, to = m < 0.5 ? 1 : 0;
      tween(1500, (t) => { m = lerp(from, to, t); render(); }, () => {
        m = to; busy = false; render();
        rollB.textContent = to ? '展开成长条' : '卷成一个圆';
      });
    });
    btn(c, '换一组数据', () => { if (busy) return; si = (si + 1) % SETS.length; build(); }, 'alt');
    build();
  };

  // ════════════════ 扇形统计图：拖动百分比，和条形图比一比 ════════════════
  A.s_pie_slider = function (el) {
    const W = 440, Hh = 270;
    const svg = stage(el, W, Hh);
    const NAMES = ['运动', '阅读', '音乐', '其他'];
    const CLS = ['f1s s1', 'f2s s2', 'f3s s3', 'fsurf2 smuted'];
    const KC = ['k1', 'k2', 'k3', ''];
    const p = [35, 25, 20, 20];
    let total = 40, sel = 0, stop = null, totalChanged = false;
    const dp = p.slice(), dc = p.map((x) => (total * x) / 100);
    const cx = 115, cy = 145, R = 98;
    const base = 238, BPX = 2.6, bx = (k) => 274 + k * 42;
    const title = T(svg, 220, 20, '', 'tb');
    const gPie = S('g', {}, svg);
    for (let k = 0; k <= 60; k += 10) {
      S('line', { x1: 250, x2: 432, y1: base - k * BPX, y2: base - k * BPX, class: k ? 'sline' : 'sstrong' }, svg);
      T(svg, 246, base - k * BPX + 4, String(k), 'tick', 'end');
    }
    S('line', { x1: 250, x2: 250, y1: base, y2: base - 60 * BPX - 8, class: 'sstrong' }, svg);
    T(svg, 254, 66, '人数', 'ts tm', 'start');
    const bars = NAMES.map((n, k) => {
      const r = S('rect', { x: bx(k) - 14, width: 28, class: CLS[k] + ' clickable', tabindex: 0, role: 'button', 'aria-label': n }, svg);
      r.addEventListener('click', () => { sel = k; draw(); });
      onKey(r, () => { sel = k; draw(); });
      return r;
    });
    const bt = NAMES.map(() => T(svg, 0, 0, '', 'ts'));
    NAMES.forEach((n, k) => T(svg, bx(k), base + 18, n, 'ts'));
    const read = H('p', { class: 'anim-read' }, el);

    function sector(a0, a1) {
      const big = a1 - a0 > PI ? 1 : 0;
      const P = (a) => `${(R * Math.sin(a)).toFixed(2)},${(-R * Math.cos(a)).toFixed(2)}`;
      return `M0,0 L${P(a0)} A${R},${R} 0 ${big} 1 ${P(a1)} Z`;
    }
    function draw() {
      gPie.innerHTML = '';
      title.textContent = `六(1)班 ${total} 名同学最喜欢的课外活动`;
      let acc = 0;
      dp.forEach((v, k) => {
        if (v <= 0.01) return;
        const a0 = (2 * PI * acc) / 100, a1 = (2 * PI * (acc + v)) / 100, mid = (a0 + a1) / 2;
        acc += v;
        const off = k === sel ? 8 : 0;
        const g = S('g', { transform: `translate(${cx + off * Math.sin(mid)},${cy - off * Math.cos(mid)})`, class: 'clickable' }, gPie);
        if (v >= 99.99) S('circle', { r: R, class: CLS[k] }, g);
        else S('path', { d: sector(a0, a1), class: CLS[k] }, g);
        if (v >= 7) {
          const lx = 0.6 * R * Math.sin(mid), ly = -0.6 * R * Math.cos(mid);
          T(g, lx, ly - 3, NAMES[k], 'ts');
          T(g, lx, ly + 13, Math.round(v) + '%', 'ts tb');
        }
        g.addEventListener('click', () => { sel = k; draw(); });
      });
      bars.forEach((r, k) => {
        const hgt = dc[k] * BPX;
        r.setAttribute('y', base - hgt);
        r.setAttribute('height', Math.max(0, hgt));
        r.setAttribute('class', CLS[k] + ' clickable' + (k === sel ? ' thick' : ''));
        bt[k].setAttribute('x', bx(k));
        bt[k].setAttribute('y', base - hgt - 5);
        bt[k].textContent = Math.round(dc[k]);
      });
      const k = sel, cnt = (total * p[k]) / 100;
      let s = `<span class="${KC[k]}">${NAMES[k]}占 ${p[k]}%</span>：圆心角 = 360° × ${p[k]}% = <b>${fmt(3.6 * p[k])}°</b>；人数 = ${total} × ${p[k]}% = <b>${fmt(cnt)}</b> 人。`;
      s += `<br>四部分加起来：${p.join('% + ')}% = 100%，正好是一整个圆。`;
      if (totalChanged) s += `<br>换成 ${total} 人以后，百分比没变，<b>扇形图一点没变</b>；条形图的直条却变了。扇形图看“占整体的百分之几”，条形图看“具体有多少”。`;
      read.innerHTML = s;
    }
    function animate() {
      if (stop) stop();
      const fp = dp.slice(), fc = dc.slice();
      const tc = p.map((x) => (total * x) / 100);
      stop = tween(350, (t) => {
        for (let k = 0; k < 4; k++) { dp[k] = lerp(fp[k], p[k], t); dc[k] = lerp(fc[k], tc[k], t); }
        draw();
      });
    }
    const c = ctrl(el);
    const sl = [];
    const setPart = (k, v) => {
      const others = p[0] + p[1] + p[2] - p[k];
      p[k] = Math.min(v, 100 - others);
      if (p[k] !== v) sl[k].set(p[k]);
      p[3] = 100 - p[0] - p[1] - p[2];
      sel = k;
      animate();
    };
    [0, 1, 2].forEach((k) => { sl.push(slider(c, 'pie' + k, NAMES[k], 0, 100, 5, p[k], (v) => setPart(k, v))); });
    const c2 = ctrl(el);
    const totB = btn(c2, '换成 60 人的班', () => {
      total = total === 40 ? 60 : 40;
      totalChanged = true;
      totB.textContent = total === 40 ? '换成 60 人的班' : '换回 40 人的班';
      animate();
    }, 'alt');
    H('p', { class: 'anim-tip' }, el, '提示：“其他”会自动变化，让四部分加起来总是 100%。点扇形或直条可以选中它。');
    draw();
  };

  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
