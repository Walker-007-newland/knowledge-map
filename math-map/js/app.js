(function () {
  const M = window.MAP, L = window.LESSONS || {}, ANIMS = window.ANIMS || {};
  const fr = window.fr;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r) => (r || document).querySelector(s);

  // ── 数据 ──
  const nodes = M.nodes.map((a) => ({ id: a[0], name: a[1], g: a[2], d: a[3], pre: a[4], kid: a[5], next: [] }));
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  nodes.forEach((n) => n.pre.forEach((p) => byId[p] && byId[p].next.push(n.id)));
  const gradeOf = Object.fromEntries(M.grades.map((g) => [g.g, g]));
  const domOf = Object.fromEntries(M.domains.map((d) => [d.id, d]));

  // ── 学习进度（只存在本机浏览器）──
  const KEY = 'mathmap-progress-v1';
  let prog = {};
  try { prog = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { prog = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) { /* 无法保存时忽略 */ } };
  const status = (id) => { const p = prog[id]; if (!p) return null; return p.best >= 0.8 ? 'good' : p.best >= 0.5 ? 'mid' : 'bad'; };
  const ST_TXT = { good: '已掌握', mid: '再练练', bad: '没掌握' };
  // 错题本：{ "知识点id#题号": { n: 做错次数, at: 最近一次做错的时间 } }
  const WKEY = 'mathmap-wrong-v1';
  let wrong = {};
  try { wrong = JSON.parse(localStorage.getItem(WKEY) || '{}') || {}; } catch (e) { wrong = {}; }
  const saveWrong = () => { try { localStorage.setItem(WKEY, JSON.stringify(wrong)); } catch (e) { /* 无法保存时忽略 */ } };
  const wrongList = () => Object.keys(wrong).filter((k) => { const [id, i] = k.split('#'); return L[id] && L[id].quiz[+i]; });
  function markWrong(id, i, ok) {
    const k = id + '#' + i;
    if (ok) delete wrong[k];
    else wrong[k] = { n: ((wrong[k] && wrong[k].n) || 0) + 1, at: Date.now() };
  }

  // ── 布局：横向按年级分列，纵向按领域分带 ──
  const COLW = 196, NW = 156, NH = 40, ROWH = 52, LEFT = 104, TOP = 74, GAP = 26;
  const gList = M.grades.map((g) => g.g), dList = M.domains.map((d) => d.id);
  const rows = {};
  dList.forEach((d) => { rows[d] = Math.max(...gList.map((g) => nodes.filter((n) => n.g === g && n.d === d).length)); });
  const bandY = {};
  let yy = TOP;
  dList.forEach((d) => { bandY[d] = yy; yy += rows[d] * ROWH + GAP; });
  const MAPW = LEFT + gList.length * COLW + 20, MAPH = yy;
  const pos = {};
  gList.forEach((g, gi) => {
    dList.forEach((d) => {
      let list = nodes.filter((n) => n.g === g && n.d === d);
      const key = (n) => { const ys = n.pre.filter((p) => pos[p]).map((p) => pos[p].y); return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 1e9; };
      list.sort((a, b) => key(a) - key(b));
      // 同一列里的前置知识点排在前面
      for (let guard = 0; guard < 20; guard++) {
        let moved = false;
        list.forEach((n, i) => {
          const last = Math.max(-1, ...n.pre.map((p) => list.findIndex((m) => m.id === p)));
          if (last > i) { list.splice(i, 1); list.splice(last, 0, n); moved = true; }
        });
        if (!moved) break;
      }
      list.forEach((n, r) => { pos[n.id] = { x: LEFT + gi * COLW + (COLW - NW) / 2, y: bandY[d] + r * ROWH + 6, gi }; });
    });
  });

  // ── 画地图 ──
  const svg = $('#mapSvg');
  const S = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const vp = S('g', {}, svg);
  dList.forEach((d) => {
    S('rect', { x: 0, y: bandY[d] - 8, width: MAPW, height: rows[d] * ROWH + 10, class: 'band band-' + d, rx: 14 }, vp);
    const t = S('text', { x: 18, y: bandY[d] + 22, class: 'band-t band-t-' + d }, vp);
    t.textContent = domOf[d].name;
  });
  const sixIdx = gList.indexOf(6);
  const sepX = LEFT + (sixIdx + 1) * COLW;
  S('line', { x1: sepX, x2: sepX, y1: 8, y2: MAPH - GAP, class: 'stage-sep' }, vp);
  S('text', { x: sepX - 12, y: 22, class: 'stage-t', 'text-anchor': 'end' }, vp).textContent = '小学 · 打基础';
  S('text', { x: sepX + 12, y: 22, class: 'stage-t', 'text-anchor': 'start' }, vp).textContent = '初中 · 中考范围';
  gList.forEach((g, gi) => {
    const t = S('text', { x: LEFT + gi * COLW + COLW / 2, y: 52, class: 'grade-t', 'text-anchor': 'middle' }, vp);
    t.textContent = gradeOf[g].label;
  });
  const edgeG = S('g', {}, vp), nodeG = S('g', {}, vp);
  const edges = [];
  nodes.forEach((n) => n.pre.forEach((p) => {
    if (!pos[p]) return;
    const a = pos[p], b = pos[n.id];
    let d;
    if (a.gi === b.gi) {
      const x = a.x + NW, y1 = a.y + NH / 2, y2 = b.y + NH / 2;
      d = `M${x},${y1} C${x + 34},${y1} ${x + 34},${y2} ${x},${y2}`;
    } else {
      const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2, mx = (x1 + x2) / 2;
      d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    }
    edges.push({ from: p, to: n.id, el: S('path', { d, class: 'edge' }, edgeG) });
  }));
  const nodeEls = {};
  nodes.forEach((n) => {
    const p = pos[n.id], has = !!L[n.id];
    const g = S('g', { class: `node d-${n.d}${has ? ' has' : ''}`, transform: `translate(${p.x},${p.y})`, tabindex: 0, role: 'button', 'data-id': n.id, 'aria-label': n.name }, nodeG);
    S('rect', { width: NW, height: NH, rx: 11, class: 'nbox' }, g);
    if (has) S('path', { d: 'M12,13 L22,20 L12,27 Z', class: 'nplay' }, g);
    const t = S('text', { x: has ? NW / 2 + 7 : NW / 2, y: NH / 2 + 5, 'text-anchor': 'middle', class: 'ntext' }, g);
    t.textContent = n.name;
    S('circle', { cx: NW - 3, cy: 3, r: 7, class: 'ndot' }, g);
    nodeEls[n.id] = g;
  });
  function paintStatus() {
    nodes.forEach((n) => {
      const el = nodeEls[n.id];
      el.classList.remove('st-good', 'st-mid', 'st-bad');
      const s = status(n.id);
      if (s) el.classList.add('st-' + s);
    });
    const done = nodes.filter((n) => status(n.id) === 'good').length;
    const tested = nodes.filter((n) => prog[n.id]).length;
    $('#progress').innerHTML = `<b>${done}</b> 个已掌握 · ${tested} 个测过 · 共 ${nodes.length} 个知识点`;
    const wn = wrongList().length;
    $('#wrongBtn').innerHTML = `错题本${wn ? ` <span class="wcount">${wn}</span>` : ''}`;
  }

  // ── 高亮学习路径 ──
  function ancestors(id, set = new Set()) {
    byId[id].pre.forEach((p) => { if (!set.has(p)) { set.add(p); ancestors(p, set); } });
    return set;
  }
  let selected = null;
  function highlight(id) {
    svg.classList.toggle('focus', !!id);
    const anc = id ? ancestors(id) : new Set();
    const nxt = id ? new Set(byId[id].next) : new Set();
    nodes.forEach((n) => {
      const el = nodeEls[n.id];
      el.classList.toggle('hl', n.id === id || anc.has(n.id) || nxt.has(n.id));
      el.classList.toggle('cur', n.id === id);
      el.classList.toggle('nx', nxt.has(n.id));
    });
    edges.forEach((e) => {
      const inPath = id && anc.has(e.from) && (e.to === id || anc.has(e.to));
      const out = id && e.from === id;
      e.el.classList.toggle('hl', !!inPath);
      e.el.classList.toggle('hlo', !!out);
    });
  }

  // ── 平移与缩放 ──
  const view = { x: 0, y: 0, s: 1 };
  const apply = () => vp.setAttribute('transform', `translate(${view.x},${view.y}) scale(${view.s})`);
  const clampS = (s) => Math.max(0.3, Math.min(2.4, s));
  function zoomAt(px, py, f) {
    const ns = clampS(view.s * f);
    view.x = px - (px - view.x) * (ns / view.s);
    view.y = py - (py - view.y) * (ns / view.s);
    view.s = ns; apply();
  }
  function fit() {
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    view.s = clampS(Math.min(r.width / MAPW, r.height / MAPH) * 0.97);
    if (r.width < 600) view.s = clampS(Math.max(view.s, 0.55));
    view.x = Math.max(8, (r.width - MAPW * view.s) / 2);
    view.y = Math.max(4, (r.height - MAPH * view.s) / 2);
    apply();
  }
  function centerOn(id) {
    const r = svg.getBoundingClientRect(), p = pos[id];
    if (!r.width) return;
    if (view.s < 0.6) view.s = 0.6;
    const tx = r.width / 2 - (p.x + NW / 2) * view.s, ty = r.height / 2 - (p.y + NH / 2) * view.s;
    const fx = view.x, fy = view.y, t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 350), e = 1 - Math.pow(1 - t, 3);
      view.x = fx + (tx - fx) * e; view.y = fy + (ty - fy) * e; apply();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const ptrs = new Map();
  let drag = null;
  svg.addEventListener('pointerdown', (e) => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const nodeEl = e.target.closest('.node');
    drag = { x: e.clientX, y: e.clientY, moved: false, node: nodeEl && nodeEl.dataset.id, pinch: null };
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      drag.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      drag.moved = true;
    }
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag || !ptrs.has(e.pointerId)) return;
    const prev = ptrs.get(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2 && drag.pinch) {
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y), r = svg.getBoundingClientRect();
      zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / drag.pinch);
      drag.pinch = d;
      return;
    }
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) drag.moved = true;
    if (drag.moved) { view.x += e.clientX - prev.x; view.y += e.clientY - prev.y; apply(); svg.classList.add('dragging'); }
  });
  const endPtr = (e) => {
    ptrs.delete(e.pointerId);
    if (drag && ptrs.size === 0) {
      if (!drag.moved && drag.node) open(drag.node);
      drag = null; svg.classList.remove('dragging');
    }
  };
  window.addEventListener('pointerup', endPtr);
  window.addEventListener('pointercancel', endPtr);
  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });
  svg.addEventListener('keydown', (e) => {
    const n = e.target.closest && e.target.closest('.node');
    if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(n.dataset.id); }
  });
  svg.addEventListener('mouseover', (e) => { const n = e.target.closest('.node'); if (n && !drag) highlight(n.dataset.id); });
  svg.addEventListener('mouseout', (e) => { if (e.target.closest('.node')) highlight(selected); });
  $('#zin').addEventListener('click', () => { const r = svg.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1.25); });
  $('#zout').addEventListener('click', () => { const r = svg.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 0.8); });
  $('#zfit').addEventListener('click', fit);

  // ── 搜索与筛选 ──
  const filt = { q: '', doms: new Set(dList), onlyLesson: false };
  function applyFilter() {
    const q = filt.q.trim();
    nodes.forEach((n) => {
      const ok = filt.doms.has(n.d) && (!filt.onlyLesson || L[n.id]) && (!q || n.name.includes(q) || n.kid.includes(q));
      nodeEls[n.id].classList.toggle('faded', !ok);
      nodeEls[n.id].classList.toggle('match', !!q && ok);
    });
  }
  const chipBox = $('#chips');
  M.domains.forEach((d) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip on chip-' + d.id; b.textContent = d.name; b.setAttribute('aria-pressed', 'true');
    b.addEventListener('click', () => {
      filt.doms.has(d.id) ? filt.doms.delete(d.id) : filt.doms.add(d.id);
      if (!filt.doms.size) filt.doms.add(d.id);
      chipBox.querySelectorAll('.chip-' + d.id).forEach((c) => { const on = filt.doms.has(d.id); c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
      applyFilter();
    });
    chipBox.appendChild(b);
  });
  const search = $('#search');
  search.addEventListener('input', () => { filt.q = search.value; applyFilter(); });
  search.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = search.value.trim();
    const hit = nodes.find((n) => n.name.includes(q)) || nodes.find((n) => n.kid.includes(q));
    if (q && hit) open(hit.id);
  });

  // ── 详情面板 ──
  const app = $('#app'), panel = $('#panel'), pBody = $('#pBody');
  let curTab = 'learn';
  function chip(id) {
    const n = byId[id], s = status(id);
    return `<button type="button" class="pchip d-${n.d}" data-go="${id}">${L[id] ? '<span class="pp">▶</span>' : ''}${n.name}${s ? `<span class="sdot st-${s}" title="${ST_TXT[s]}"></span>` : ''}</button>`;
  }
  function open(id, tab) {
    const n = byId[id];
    if (!n) return;
    selected = id;
    curTab = tab || 'learn';
    highlight(id);
    app.classList.add('panel-open');
    panel.hidden = false;
    renderPanel();
    panel.scrollTop = 0;
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* 忽略 */ }
    requestAnimationFrame(() => centerOn(id));
  }
  function close() {
    selected = null;
    highlight(null);
    panel.hidden = true;
    app.classList.remove('panel-open');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* 忽略 */ }
  }
  $('#pClose').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  panel.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) { open(go.dataset.go, go.dataset.tab); return; }
    const tb = e.target.closest('[data-tab]');
    if (tb) { curTab = tb.dataset.tab; renderPanel(); panel.scrollTop = 0; }
  });

  function renderPanel() {
    const n = byId[selected], les = L[n.id], s = status(n.id), gr = gradeOf[n.g];
    $('#pHead').innerHTML = `
      <div class="tags"><span class="tag">${gr.stage} · ${gr.label}</span><span class="tag tag-${n.d}">${domOf[n.d].name}</span>${s ? `<span class="tag st-${s}">${ST_TXT[s]} · 最好成绩 ${Math.round(prog[n.id].best * 100)}%</span>` : ''}</div>
      <h2>${n.name}</h2>
      <p class="kid">${n.kid}</p>
      <div class="path">
        ${n.pre.length ? `<div><span class="plabel">先学这些</span>${n.pre.map(chip).join('')}</div>` : '<div><span class="plabel">先学这些</span><span class="none">这是起点，直接开始吧</span></div>'}
        ${n.next.length ? `<div><span class="plabel">学完可以学</span>${n.next.map(chip).join('')}</div>` : ''}
      </div>
      ${les ? `<nav class="tabs" role="tablist">
        ${[['learn', '动画讲解'], ['ex', `例题 ${les.examples.length}`], ['quiz', `测一测 ${les.quiz.length}`]].map(([k, t]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${curTab === k}" class="${curTab === k ? 'on' : ''}">${t}</button>`).join('')}
      </nav>` : ''}`;
    pBody.innerHTML = '';
    if (!les) { renderTodo(n); return; }
    if (curTab === 'learn') renderLearn(n, les);
    else if (curTab === 'ex') renderEx(n, les);
    else renderQuiz(n, les);
  }

  function renderTodo(n) {
    const ready = nodes.filter((m) => L[m.id]).map((m) => m.id);
    pBody.innerHTML = `<div class="todo">
      <p><b>这个知识点的动画讲解还在制作中。</b></p>
      <p>现在可以先看看它在地图上的位置：左边连着的是要先学的，右边连着的是学完它以后要学的。</p>
      <p class="plabel">已经做好的样板</p>
      <div class="chips-wrap">${ready.map(chip).join('')}</div></div>`;
  }

  function renderLearn(n, les) {
    const wrap = document.createElement('div');
    wrap.className = 'learn';
    wrap.innerHTML = `<div class="goal"><div><span class="plabel">中考要求</span><p>${les.goal}</p></div><div><span class="plabel">福建卷怎么考</span><p>${les.fj}</p></div></div>`;
    les.sections.forEach((s, i) => {
      const sec = document.createElement('section');
      sec.className = 'lsec';
      sec.innerHTML = `<h3><span class="secno">${i + 1}</span>${s.h}</h3><div class="rich">${s.html}</div>`;
      if (s.anim && ANIMS[s.anim]) {
        const box = document.createElement('div');
        box.className = 'anim';
        sec.appendChild(box);
        try { ANIMS[s.anim](box); } catch (err) { box.textContent = '动画加载失败：' + err.message; }
      }
      wrap.appendChild(sec);
    });
    const pit = document.createElement('div');
    pit.className = 'pit';
    pit.innerHTML = `<h3>容易错的地方</h3><ul>${les.pitfalls.map((p) => `<li>${p}</li>`).join('')}</ul>`;
    wrap.appendChild(pit);
    const nav = document.createElement('div');
    nav.className = 'next-row';
    nav.innerHTML = `<button type="button" class="big-btn" data-tab="ex">看例题 →</button>`;
    wrap.appendChild(nav);
    pBody.appendChild(wrap);
  }

  function renderEx(n, les) {
    const wrap = document.createElement('div');
    wrap.className = 'exs';
    les.examples.forEach((ex, i) => {
      const art = document.createElement('article');
      art.className = 'ex';
      art.innerHTML = `<div class="ex-q"><span class="ex-no">例 ${i + 1}</span><div class="rich">${ex.q}</div></div>
        <ol class="steps">${ex.steps.map((s) => `<li hidden class="rich">${s}</li>`).join('')}<li hidden class="ans rich"><b>答：</b>${ex.ans}</li></ol>
        <div class="ex-ctrl"><button type="button" class="abtn">先自己想一想，再看第一步</button><button type="button" class="abtn alt">直接看全部</button></div>`;
      const lis = [...art.querySelectorAll('.steps li')];
      const [stepB, allB] = art.querySelectorAll('.ex-ctrl button');
      let k = 0;
      const show = (all) => {
        if (all) { lis.forEach((li) => { li.hidden = false; }); k = lis.length; }
        else lis[k++].hidden = false;
        if (k >= lis.length) { stepB.disabled = true; stepB.textContent = '已经看完'; allB.hidden = true; }
        else stepB.textContent = k === lis.length - 1 ? '看答案' : '下一步';
      };
      stepB.addEventListener('click', () => show(false));
      allB.addEventListener('click', () => show(true));
      wrap.appendChild(art);
    });
    const nav = document.createElement('div');
    nav.className = 'next-row';
    nav.innerHTML = `<button type="button" class="big-btn" data-tab="quiz">去测一测 →</button>`;
    wrap.appendChild(nav);
    pBody.appendChild(wrap);
  }

  // ── 测试与判分 ──
  const norm = (s) => String(s)
    .replace(/[\s　]/g, '')
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 65248))
    .replace(/[－—–−]/g, '-').replace(/／/g, '/').replace(/．/g, '.')
    .replace(/[°度%％]/g, '').replace(/^[a-z]=/i, '');
  const numOf = (s) => {
    const m = s.match(/^(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?$/);
    if (!m) return null;
    const b = m[2] != null ? +m[2] : 1;
    return b === 0 ? null : +m[1] / b;
  };
  function checkFill(input, answers) {
    const u = norm(input);
    if (!u) return false;
    const un = numOf(u);
    return answers.some((a) => {
      const an = norm(a);
      if (an === u) return true;
      const av = numOf(an);
      return un != null && av != null && Math.abs(un - av) < 1e-6;
    });
  }
  function renderQuiz(n, les) {
    const wrap = document.createElement('div');
    wrap.className = 'quiz';
    const prev = prog[n.id];
    wrap.innerHTML = `<p class="qintro">共 ${les.quiz.length} 题，答对 80% 以上就算<b>掌握</b>。${prev ? `上次答对 ${Math.round(prev.last * 100)}%。` : ''}填空题里分数写成 3/8，负数写成 -4。</p>`;
    const picks = [];
    les.quiz.forEach((q, i) => {
      const box = document.createElement('div');
      box.className = 'q';
      let body = `<div class="q-stem"><span class="qno">${i + 1}</span><div class="rich">${q.q}</div></div>`;
      if (q.type === 'choice') {
        body += `<div class="opts" role="radiogroup">${q.opts.map((o, j) => `<button type="button" role="radio" aria-checked="false" class="opt" data-j="${j}"><span class="ol">${'ABCD'[j]}</span><span class="rich">${o}</span></button>`).join('')}</div>`;
      } else {
        body += `<input class="fill" id="q-${n.id}-${i}" type="text" inputmode="text" autocomplete="off" placeholder="在这里填答案" aria-label="第 ${i + 1} 题答案">`;
      }
      body += '<div class="why" hidden></div>';
      box.innerHTML = body;
      if (q.type === 'choice') {
        box.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
          if (wrap.classList.contains('done')) return;
          box.querySelectorAll('.opt').forEach((x) => { x.classList.remove('picked'); x.setAttribute('aria-checked', 'false'); });
          b.classList.add('picked'); b.setAttribute('aria-checked', 'true');
          picks[i] = +b.dataset.j;
          countAnswered();
        }));
      }
      wrap.appendChild(box);
    });
    const res = document.createElement('div');
    res.className = 'result';
    res.hidden = true;
    const row = document.createElement('div');
    row.className = 'next-row quiz-bar';
    row.innerHTML = `<span class="qcount">已答 0 / ${les.quiz.length}</span><button type="button" class="big-btn" id="submitQuiz">交卷，看看对了几题</button>`;
    function countAnswered() {
      const boxes = wrap.querySelectorAll('.q');
      const done = les.quiz.filter((q, i) => (q.type === 'choice' ? picks[i] != null : boxes[i].querySelector('input').value.trim())).length;
      row.querySelector('.qcount').textContent = `已答 ${done} / ${les.quiz.length}`;
    }
    wrap.addEventListener('input', countAnswered);
    wrap.appendChild(row);
    wrap.appendChild(res);
    pBody.appendChild(wrap);
    let warned = false;
    $('#submitQuiz').addEventListener('click', (ev) => {
      if (wrap.classList.contains('done')) return;
      const boxes = wrap.querySelectorAll('.q');
      const blank = les.quiz.filter((q, i) => (q.type === 'choice' ? picks[i] == null : !boxes[i].querySelector('input').value.trim())).length;
      if (blank && !warned) {
        warned = true;
        ev.currentTarget.textContent = `还有 ${blank} 题没做，确定要交卷就再点一次`;
        return;
      }
      let right = 0;
      les.quiz.forEach((q, i) => {
        const box = boxes[i], why = box.querySelector('.why');
        let ok, ansTxt;
        if (q.type === 'choice') {
          ok = picks[i] === q.ans;
          ansTxt = `${'ABCD'[q.ans]}. ${q.opts[q.ans]}`;
          box.querySelectorAll('.opt').forEach((b) => { if (+b.dataset.j === q.ans) b.classList.add('right'); else if (b.classList.contains('picked')) b.classList.add('wrong'); });
        } else {
          const inp = box.querySelector('input');
          ok = checkFill(inp.value, q.ans);
          inp.readOnly = true;
          inp.classList.add(ok ? 'right' : 'wrong');
          ansTxt = q.ans[0];
        }
        if (ok) right++;
        markWrong(n.id, i, ok);
        box.classList.add(ok ? 'ok' : 'no');
        why.hidden = false;
        why.innerHTML = `<b>${ok ? '✓ 答对了' : '✗ 正确答案：' + ansTxt}</b>　${q.why}`;
      });
      wrap.classList.add('done');
      const rate = right / les.quiz.length;
      const old = prog[n.id];
      prog[n.id] = { best: Math.max(rate, old ? old.best : 0), last: rate, at: Date.now() };
      save(); saveWrong(); paintStatus();
      const st = rate >= 0.8 ? 'good' : rate >= 0.5 ? 'mid' : 'bad';
      const weak = n.pre.filter((p) => status(p) !== 'good');
      const msg = st === 'good'
        ? `太棒了，你已经掌握了“${n.name}”！${n.next.length ? '<br>接下来可以学：' + n.next.map(chip).join('') : ''}`
        : `${st === 'mid' ? '差一点就掌握了。' : '还没有掌握，别着急。'}先看看错题下面的解析，回到“动画讲解”再玩一玩。${weak.length ? '<br>也可以先复习这些前置知识：' + weak.map(chip).join('') : ''}`;
      res.hidden = false;
      res.className = 'result st-' + st;
      res.innerHTML = `<div class="score"><b>${right}</b> / ${les.quiz.length}</div><p>${msg}</p><button type="button" class="abtn" id="retry">再做一次</button>`;
      row.hidden = true;
      $('#retry').addEventListener('click', () => { renderPanel(); panel.scrollTop = 0; });
      res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // ── 错题本 ──
  function openWrong() {
    selected = null;
    highlight(null);
    app.classList.add('panel-open');
    panel.hidden = false;
    renderWrong();
    panel.scrollTop = 0;
    try { history.replaceState(null, '', '#wrong'); } catch (e) { /* 忽略 */ }
  }
  $('#wrongBtn').addEventListener('click', openWrong);
  function renderWrong() {
    const keys = wrongList();
    const order = (k) => { const n = byId[k.split('#')[0]]; return n.g * 1e4 + pos[n.id].y; };
    keys.sort((a, b) => order(a) - order(b) || +a.split('#')[1] - +b.split('#')[1]);
    $('#pHead').innerHTML = `<div class="tags"><span class="tag">我的错题</span></div>
      <h2>错题本</h2>
      <p class="kid">${keys.length ? `还有 <b>${keys.length}</b> 道错题。重新做一遍，做对了就会从错题本里移走。` : '错题本是空的。'}</p>`;
    pBody.innerHTML = '';
    if (!keys.length) {
      pBody.innerHTML = '<div class="todo"><p>测试里做错的题会自动收进这里。</p><p>在这里重新做对，或者回到知识点的“测一测”里做对，它就会被移走。</p></div>';
      return;
    }
    let lastId = null, group = null;
    keys.forEach((k) => {
      const [id, iStr] = k.split('#'), i = +iStr, n = byId[id], q = L[id].quiz[i], w = wrong[k];
      if (id !== lastId) {
        lastId = id;
        group = document.createElement('section');
        group.className = 'wgroup';
        group.innerHTML = `<h3 class="wtitle"><span>${gradeOf[n.g].label} · ${n.name}</span><button type="button" class="abtn alt" data-go="${id}">回到这个知识点</button></h3>`;
        pBody.appendChild(group);
      }
      const box = document.createElement('div');
      box.className = 'q';
      let body = `<div class="q-stem"><span class="qno">${i + 1}</span><div class="rich">${q.q}</div></div>
        <div class="wmeta">做错 ${w.n} 次 · 最近一次 ${new Date(w.at).toLocaleDateString('zh-CN')}</div>`;
      if (q.type === 'choice') body += `<div class="opts" role="radiogroup">${q.opts.map((o, j) => `<button type="button" role="radio" aria-checked="false" class="opt" data-j="${j}"><span class="ol">${'ABCD'[j]}</span><span class="rich">${o}</span></button>`).join('')}</div>`;
      else body += `<input class="fill" id="w-${id}-${i}" type="text" autocomplete="off" placeholder="在这里填答案" aria-label="答案">`;
      body += '<div class="wctrl"><button type="button" class="abtn wsub">提交这道题</button></div><div class="why" hidden></div>';
      box.innerHTML = body;
      let pick = null, done = false;
      box.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
        if (done) return;
        box.querySelectorAll('.opt').forEach((x) => { x.classList.remove('picked'); x.setAttribute('aria-checked', 'false'); });
        b.classList.add('picked'); b.setAttribute('aria-checked', 'true');
        pick = +b.dataset.j;
      }));
      const why = box.querySelector('.why'), sub = box.querySelector('.wsub'), wctrl = box.querySelector('.wctrl');
      sub.addEventListener('click', () => {
        if (done) return;
        let ok, ansTxt;
        if (q.type === 'choice') {
          if (pick == null) { why.hidden = false; why.innerHTML = '先选一个答案。'; return; }
          ok = pick === q.ans;
          ansTxt = `${'ABCD'[q.ans]}. ${q.opts[q.ans]}`;
          box.querySelectorAll('.opt').forEach((b) => { if (+b.dataset.j === q.ans) b.classList.add('right'); else if (b.classList.contains('picked')) b.classList.add('wrong'); });
        } else {
          const inp = box.querySelector('input');
          if (!inp.value.trim()) { why.hidden = false; why.innerHTML = '先填一个答案。'; return; }
          ok = checkFill(inp.value, q.ans);
          inp.readOnly = true;
          inp.classList.add(ok ? 'right' : 'wrong');
          ansTxt = q.ans[0];
        }
        done = true;
        box.classList.add(ok ? 'ok' : 'no');
        why.hidden = false;
        sub.hidden = true;
        markWrong(id, i, ok);
        saveWrong(); paintStatus();
        const left = wrongList().length, kid = $('#pHead .kid');
        if (kid) kid.innerHTML = left ? `还有 <b>${left}</b> 道错题。重新做一遍，做对了就会从错题本里移走。` : '全部订正完了，真棒！';
        if (ok) {
          why.innerHTML = `<b>✓ 订正成功，已移出错题本</b>　${q.why}`;
        } else {
          why.innerHTML = `<b>✗ 还是不对，正确答案：${ansTxt}</b>　${q.why}<br>这道题会留在错题本里。建议先回到知识点看看动画讲解，过一会儿再来做。`;
          const again = document.createElement('button');
          again.type = 'button'; again.className = 'abtn alt'; again.textContent = '刷新错题本';
          again.addEventListener('click', () => { renderWrong(); panel.scrollTop = 0; });
          wctrl.appendChild(again);
        }
      });
      group.appendChild(box);
    });
  }

  // ── 推荐下一个：按年级顺序，找第一个“还没掌握、但前置都掌握了”的知识点 ──
  function recommend() {
    const order = nodes.slice().sort((a, b) => a.g - b.g || pos[a.id].y - pos[b.id].y);
    const todo = order.filter((n) => status(n.id) !== 'good');
    return todo.find((n) => n.pre.every((p) => status(p) === 'good')) || todo[0];
  }
  $('#nextBtn').addEventListener('click', () => {
    const n = recommend();
    if (n) open(n.id);
  });

  // ── 启动 ──
  paintStatus();
  fit();
  window.addEventListener('resize', () => { if (!selected) fit(); });
  const fromHash = () => { const h = location.hash.slice(1); if (h === 'wrong') openWrong(); else if (byId[h] && h !== selected) open(h); };
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
