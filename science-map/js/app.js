(function () {
  'use strict';

  const KG = window.KG;
  const CFG = KG.config;
  const PASS = 80;                      // 测试正确率达到 80% 记为掌握
  const QUIZ_N = 10;                    // 每次测试从题库里抽约 10 题（共用材料的题整组抽）
  const STORE = CFG.key + '-progress-v1';
  const DRAFTS = CFG.key + '-drafts-v1';
  const TERMS = CFG.terms.map(t => t.id);
  const TERM_NAME = {};
  const TERM_ORDER = {};
  CFG.terms.forEach((t, i) => { TERM_NAME[t.id] = t.name; TERM_ORDER[t.id] = i; });
  const STATUS_NAME = { new: '未学', learning: '学习中', weak: '需加强', mastered: '已掌握' };
  const SVGNS = 'http://www.w3.org/2000/svg';

  const modById = {};
  KG.modules.forEach((m, i) => { m.order = i; modById[m.id] = m; });
  const nodes = KG.nodes;
  const byId = {};
  nodes.forEach((n, i) => {
    n._i = i;
    if (byId[n.id]) console.warn('知识点 id 重复：', n.id);
    if (TERM_ORDER[n.term] == null) console.warn('学期不存在：', n.term, '←', n.id);
    if (!modById[n.module]) console.warn('模块不存在：', n.module, '←', n.id);
    byId[n.id] = n;
  });
  const termIdx = n => TERM_ORDER[n.term] ?? 0;
  nodes.forEach(n => {
    n.prereqs = (n.prereqs || []).filter(p => {
      if (!byId[p]) { console.warn('前置知识点不存在：', p, '←', n.id); return false; }
      if (termIdx(byId[p]) > termIdx(n)) console.warn('前置知识点学期更晚：', p, '→', n.id);
      return true;
    });
  });
  const dependents = {};
  nodes.forEach(n => { dependents[n.id] = []; });
  nodes.forEach(n => n.prereqs.forEach(p => dependents[p].push(n.id)));

  /* ---------------- 进度 ---------------- */
  let progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { progress = {}; }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (e) { /* 存储不可用时只在本次会话有效 */ } }
  function status(id) {
    const p = progress[id];
    if (!p) return 'new';
    if (p.last == null) return 'learning';
    return p.last >= PASS ? 'mastered' : 'weak';
  }
  function isReady(n) { return n.prereqs.every(p => status(p) === 'mastered'); }
  function recommended() {
    const st = n => status(n.id);
    const weak = nodes.filter(n => st(n) === 'weak');
    const ready = nodes.filter(n => st(n) !== 'mastered' && st(n) !== 'weak' && isReady(n));
    const sortFn = (a, b) => termIdx(a) - termIdx(b) || (st(a) === 'learning' ? -1 : 0) - (st(b) === 'learning' ? -1 : 0) || a._i - b._i;
    return { weak: weak.sort(sortFn), ready: ready.sort(sortFn) };
  }

  /* ---------------- 布局 ---------------- */
  const NW = 172, NH = 50, COLW = 204, ROWH = 66, PADX = 16, HEADH = 44, PADY = 18;
  let W = 0, H = 0;
  const termBlocks = {};
  const hiddenMods = new Set();      // 被筛选隐藏的模块
  let shown = nodes;                 // 当前显示在图上的知识点
  const isShown = id => !hiddenMods.has(byId[id].module);
  const shownPre = n => n.prereqs.filter(isShown);

  // 只对当前显示的知识点排版：筛选模块后图会重新紧凑排列
  function layout() {
    shown = nodes.filter(n => isShown(n.id));
    const depth = {};
    const visiting = {};
    function d(n) {
      if (depth[n.id] != null) return depth[n.id];
      if (visiting[n.id]) return 0;
      visiting[n.id] = true;
      let v = 0;
      shownPre(n).forEach(p => { const q = byId[p]; if (q.term === n.term) v = Math.max(v, d(q) + 1); });
      return (depth[n.id] = v);
    }
    shown.forEach(d);

    let col = 0;
    TERMS.forEach(t => {
      const ts = shown.filter(n => n.term === t);
      const cols = ts.length ? Math.max(...ts.map(n => depth[n.id])) + 1 : 1;
      termBlocks[t] = { start: col, count: cols };
      col += cols;
    });
    const columns = {};
    shown.forEach(n => {
      const c = termBlocks[n.term].start + depth[n.id];
      (columns[c] = columns[c] || []).push(n);
    });
    // 逐列从左到右排：每个点按前置知识点的平均高度排序（重心法），减少连线交叉
    let maxRows = 1;
    Object.keys(columns).sort((a, b) => a - b).forEach(c => {
      const arr = columns[c];
      arr.forEach(n => {
        const pre = shownPre(n);
        n._bary = pre.length ? pre.reduce((s, p) => s + byId[p].y, 0) / pre.length : -1;
      });
      arr.sort((a, b) => a._bary - b._bary || modById[a.module].order - modById[b.module].order || a._i - b._i);
      arr.forEach((n, i) => {
        n.x = PADX + (+c) * COLW + (COLW - NW) / 2;
        n.y = HEADH + PADY + i * ROWH;
      });
      maxRows = Math.max(maxRows, arr.length);
    });
    W = PADX * 2 + col * COLW;
    H = HEADH + PADY * 2 + maxRows * ROWH;
  }

  /* ---------------- 绘制图谱 ---------------- */
  const svg = document.getElementById('graph');
  const wrap = document.getElementById('graphWrap');
  let nodeEls = {};
  let edgeEls = [];
  let zoom = 1;

  function el(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function drawGraph() {
    svg.innerHTML = '';
    nodeEls = {};
    edgeEls = [];
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const defs = el('defs', {}, svg);
    const mk = el('marker', { id: 'arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'edge-arrow' }, mk);

    TERMS.forEach((t, i) => {
      const b = termBlocks[t];
      const x = PADX + b.start * COLW;
      if (i % 2 === 0) el('rect', { x, y: 0, width: b.count * COLW, height: H, class: 'band' }, svg);
      const tx = el('text', { x: x + b.count * COLW / 2, y: 28, 'text-anchor': 'middle', class: 'band-label' }, svg);
      tx.textContent = TERM_NAME[t];
      tx.addEventListener('click', () => wrap.scrollTo({ left: Math.max(0, x * zoom - 8) }));
    });

    const gEdges = el('g', {}, svg);
    shown.forEach(n => shownPre(n).forEach(pid => {
      const p = byId[pid];
      const x1 = p.x + NW, y1 = p.y + NH / 2, x2 = n.x - 2, y2 = n.y + NH / 2;
      const dx = Math.max(30, (x2 - x1) / 2);
      const path = el('path', { d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`, class: 'edge', 'marker-end': 'url(#arrow)' }, gEdges);
      edgeEls.push({ from: pid, to: n.id, el: path });
    }));

    shown.forEach(n => {
      const g = el('g', { class: 'node', transform: `translate(${n.x},${n.y})`, tabindex: 0, role: 'button' }, svg);
      el('rect', { class: 'box', width: NW, height: NH, rx: 10 }, g);
      el('rect', { x: 0, y: 0, width: 6, height: NH, rx: 3, fill: modById[n.module].color }, g);
      const t = el('text', { x: 16, y: 21, class: 'title' }, g);
      t.textContent = n.short || n.title;
      const m = el('text', { x: 16, y: 39, class: 'meta' }, g);
      m.textContent = modById[n.module].name + '  ';
      const s = el('tspan', { class: 'stars' }, m);
      s.textContent = '★'.repeat(n.freq || 1);
      const badge = el('text', { x: NW - 12, y: 30, 'text-anchor': 'middle', class: 'badge' }, g);
      const ttl = el('title', {}, g);
      ttl.textContent = n.title;
      g.addEventListener('click', () => openNode(n.id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNode(n.id); } });
      nodeEls[n.id] = { g, badge };
    });
    applyZoom();
  }

  function refreshNodes() {
    const rec = recommended();
    const recSet = new Set(rec.ready.filter(n => status(n.id) === 'new').map(n => n.id));
    shown.forEach(n => {
      const { g, badge } = nodeEls[n.id];
      const st = status(n.id);
      g.classList.remove('st-new', 'st-learning', 'st-weak', 'st-mastered');
      g.classList.add('st-' + st);
      g.classList.toggle('recommend', recSet.has(n.id));
      g.classList.toggle('sel', n.id === selId);
      badge.textContent = st === 'mastered' ? '✓' : st === 'weak' ? '!' : '';
    });
    const done = nodes.filter(n => status(n.id) === 'mastered').length;
    document.getElementById('progressText').textContent = `已掌握 ${done} / ${nodes.length}`;
    document.getElementById('progressFill').style.width = (nodes.length ? done / nodes.length * 100 : 0) + '%';
  }

  function ancestors(id, acc) {
    byId[id].prereqs.forEach(p => { if (!acc.has(p)) { acc.add(p); ancestors(p, acc); } });
    return acc;
  }

  function applyFocus() {
    if (!selId) {
      svg.classList.remove('focus');
      Object.values(nodeEls).forEach(o => o.g.classList.remove('dim'));
      edgeEls.forEach(e => e.el.classList.remove('dim', 'rel'));
      return;
    }
    // 高亮：从起点到当前知识点的整条前置链 + 直接后续
    const chain = ancestors(selId, new Set([selId]));
    const keep = new Set(chain);
    dependents[selId].forEach(d => keep.add(d));
    svg.classList.add('focus');
    shown.forEach(n => nodeEls[n.id].g.classList.toggle('dim', !keep.has(n.id)));
    edgeEls.forEach(e => {
      const rel = (chain.has(e.from) && chain.has(e.to)) || e.from === selId;
      e.el.classList.toggle('rel', rel);
      e.el.classList.toggle('dim', !rel);
    });
  }

  /* ---------------- 缩放、筛选、搜索 ---------------- */
  function applyZoom() {
    svg.setAttribute('width', Math.round(W * zoom));
    svg.setAttribute('height', Math.round(H * zoom));
  }
  function fitZoom() {
    const z = Math.min(wrap.clientWidth / W, wrap.clientHeight / H);
    zoom = Math.max(0.5, Math.min(1.3, z));
    applyZoom();
  }
  document.getElementById('zoomIn').onclick = () => { zoom = Math.min(2, zoom * 1.2); applyZoom(); };
  document.getElementById('zoomOut').onclick = () => { zoom = Math.max(0.4, zoom / 1.2); applyZoom(); };
  document.getElementById('zoomFit').onclick = fitZoom;
  wrap.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    zoom = Math.max(0.4, Math.min(2, zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
    applyZoom();
  }, { passive: false });

  // 点模块 = 只看这个模块（再点一次回到全部）；按住 Ctrl 点可以多选
  function drawChips() {
    const box = document.getElementById('moduleChips');
    box.innerHTML = '';
    const mods = KG.modules.filter(m => nodes.some(n => n.module === m.id));
    const all = document.createElement('button');
    all.className = 'chip' + (hiddenMods.size ? ' off' : ' on');
    all.textContent = `全部 ${nodes.length}`;
    all.onclick = () => { hiddenMods.clear(); drawChips(); applyFilter(); };
    box.appendChild(all);
    mods.forEach(m => {
      const count = nodes.filter(n => n.module === m.id).length;
      const visible = !hiddenMods.has(m.id);
      const b = document.createElement('button');
      b.className = 'chip' + (visible && hiddenMods.size ? ' on' : '') + (visible ? '' : ' off');
      b.innerHTML = `<i style="background:${m.color}"></i>${m.name} ${count}`;
      b.title = '点击只看这个模块；按住 Ctrl 点击可以多选';
      b.onclick = e => {
        if (e.ctrlKey || e.metaKey) {
          if (visible) { if (hiddenMods.size < mods.length - 1) hiddenMods.add(m.id); }
          else hiddenMods.delete(m.id);
        } else {
          const solo = visible && hiddenMods.size === mods.length - 1;
          hiddenMods.clear();
          if (!solo) mods.forEach(x => { if (x.id !== m.id) hiddenMods.add(x.id); });
        }
        drawChips(); applyFilter();
      };
      box.appendChild(b);
    });
  }
  function applyFilter() {
    layout();
    drawGraph();
    refreshNodes();
    applyFocus();
    if (selId && isShown(selId)) scrollToNode(selId);
  }

  const search = document.getElementById('search');
  function matches(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return nodes.filter(n => (n.title + ' ' + (n.short || '') + ' ' + (n.keywords || '')).toLowerCase().includes(q));
  }
  search.addEventListener('input', () => {
    const m = new Set(matches(search.value).map(n => n.id));
    shown.forEach(n => nodeEls[n.id].g.classList.toggle('match', m.has(n.id)));
  });
  search.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const m = matches(search.value);
    if (m.length) openNode(m[0].id);
  });

  function scrollToNode(id) {
    const n = byId[id];
    const cx = (n.x + NW / 2) * zoom, cy = (n.y + NH / 2) * zoom;
    const left = cx - wrap.clientWidth / 2, top = cy - wrap.clientHeight / 2;
    wrap.scrollTo({ left: Math.max(0, left), top: Math.max(0, top) });
  }

  /* ---------------- 互动演示 ---------------- */
  // 讲解里写 <div class="sim" data-sim="名字"></div>，由 js/sims*.js 里注册的 SIMS[名字](容器) 绘制
  function mountSims(root) {
    root.querySelectorAll('.sim[data-sim]').forEach(box => {
      const f = (window.SIMS || {})[box.dataset.sim];
      if (!f) { box.innerHTML = '<p class="muted">（互动演示加载失败）</p>'; return; }
      try { f(box); } catch (e) { console.error(e); box.innerHTML = '<p class="muted">（互动演示出错了）</p>'; }
    });
  }

  /* ---------------- 详情面板 ---------------- */
  const panel = document.getElementById('panel');
  let selId = null;
  let tab = 'learn';
  const quiz = {};   // 每个知识点当前这次测验的状态

  function openNode(id, toTab) {
    selId = id;
    tab = toTab || 'learn';
    if (!progress[id]) { progress[id] = { viewed: Date.now(), last: null, best: null, attempts: 0 }; save(); }
    if (!isShown(id)) { hiddenMods.delete(byId[id].module); drawChips(); layout(); drawGraph(); }
    panel.classList.add('open');
    scrollToNode(id);   // 宽屏下面板是瞬间展开的，此时图谱区宽度已经是最终值
    panel.setAttribute('aria-hidden', 'false');
    renderPanel();
    refreshNodes();
    applyFocus();
    hidePopovers();
  }
  function closePanel() {
    selId = null;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    refreshNodes();
    applyFocus();
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function relButtons(ids) {
    return ids.map(id => {
      const st = status(id);
      return `<button data-go="${id}"><i class="dot st-${st}"></i>${esc(byId[id].short || byId[id].title)}</button>`;
    }).join('');
  }

  function renderPanel() {
    const n = byId[selId];
    if (!n) return;
    const st = status(n.id);
    const p = progress[n.id] || {};
    const mod = modById[n.module];
    const tests = n.tests || [];
    panel.innerHTML = `
      <div class="p-head">
        <div class="p-head-top">
          <div style="flex:1">
            <div class="tags">
              <span class="tag">${TERM_NAME[n.term]}${n.chapter ? ' · ' + esc(n.chapter) : ''}</span>
              <span class="tag" style="color:${mod.color}">${mod.name}</span>
              <span class="tag stars" title="中考考频">${'★'.repeat(n.freq || 1)}${'☆'.repeat(3 - (n.freq || 1))}</span>
              <span class="tag status st-${st}">${STATUS_NAME[st]}${p.best != null ? ' · 最好 ' + p.best + '%' : ''}</span>
            </div>
            <h2>${esc(n.title)}</h2>
          </div>
          <button class="btn icon p-close" id="pClose" aria-label="关闭">✕</button>
        </div>
        ${n.prereqs.length ? `<div class="rel-row">需要先学：${relButtons(n.prereqs)}</div>` : ''}
        ${dependents[n.id].length ? `<div class="rel-row">学完可以学：${relButtons(dependents[n.id])}</div>` : ''}
        <div class="tabs">
          <button class="tab ${tab === 'learn' ? 'on' : ''}" data-tab="learn">讲解</button>
          <button class="tab ${tab === 'examples' ? 'on' : ''}" data-tab="examples">例题 ${(n.examples || []).length}</button>
          <button class="tab ${tab === 'test' ? 'on' : ''}" data-tab="test">测试</button>
          ${(n.practice || []).length ? `<button class="tab ${tab === 'practice' ? 'on' : ''}" data-tab="practice">作图·简答 ${n.practice.length}</button>` : ''}
        </div>
      </div>
      <div class="p-body" id="pBody"></div>`;
    panel.querySelector('#pClose').onclick = closePanel;
    panel.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; renderPanel(); });
    panel.querySelectorAll('.p-head [data-go]').forEach(b => b.onclick = () => openNode(b.dataset.go));
    const body = panel.querySelector('#pBody');
    if (tab === 'learn') renderLearn(n, body);
    else if (tab === 'practice') renderPractice(n, body);
    else if (tab === 'examples') renderExamples(n, body);
    else renderTest(n, body);
  }

  function renderLearn(n, body) {
    body.innerHTML = (n.tip ? `<div class="tipbox">📌 <b>中考提示</b>：${n.tip}</div>` : '') +
      (n.learn || []).map(s => `<div class="sec"><h3>${s.h}</h3>${s.html}</div>`).join('') +
      `<div class="quiz-foot" style="margin-top:24px"><button class="btn" data-tab-go="examples">看例题 →</button><button class="btn primary" data-tab-go="test">直接测试 →</button></div>`;
    mountSims(body);
    bindTabGo(body);
  }

  // 实验材料、情境材料：多道题共用一段
  function passageBlock(n, key) {
    const ps = (n.passages || {})[key];
    if (!ps) return '';
    return `<div class="passage"><div class="passage-title">${ps.title || '材料'}</div>${ps.html || ''}</div>`;
  }
  function bindTabGo(body) {
    body.querySelectorAll('[data-tab-go]').forEach(b => b.onclick = () => { tab = b.dataset.tabGo; renderPanel(); });
  }

  /* ---------------- 作图·简答（自己做、对照评分要点自查、看参考答案） ---------------- */
  let drafts = {};
  try { drafts = JSON.parse(localStorage.getItem(DRAFTS) || '{}') || {}; } catch (e) { drafts = {}; }
  function saveDrafts() { try { localStorage.setItem(DRAFTS, JSON.stringify(drafts)); } catch (e) { /* 忽略 */ } }

  function renderPractice(n, body) {
    const mine = drafts[n.id] || (drafts[n.id] = {});
    body.innerHTML = `<p class="quiz-intro">这些题不自动打分：作图题在草稿纸上画，简答题可以写在下面的框里（自动保存）。做完后看参考答案，按“评分要点”逐条打勾自查。</p>` +
      n.practice.map((pr, i) => {
        const d = mine[i] || { text: '', checks: [] };
        return `<div class="q practice" data-i="${i}">
          <div class="q-stem"><span class="num">练习 ${i + 1}</span>${pr.title || ''}</div>
          <div class="prompt">${pr.prompt}</div>
          ${pr.write ? `<textarea class="draft" rows="5" placeholder="在这里写你的答案…">${esc(d.text || '')}</textarea>` : ''}
          <div class="reveal"><button class="btn" data-sample="${i}">看参考答案</button></div>
          <div class="sample-wrap" hidden>
            <div class="explain sample"><b>参考答案</b>${pr.sample}${pr.notes ? `<div class="notes">${pr.notes}</div>` : ''}</div>
            ${(pr.checklist || []).length ? `<div class="checklist"><b>评分要点（做到了就打勾）</b>${pr.checklist.map((c, j) => `<label><input type="checkbox" data-j="${j}" ${d.checks && d.checks[j] ? 'checked' : ''}> ${c}</label>`).join('')}</div>` : ''}
          </div>
        </div>`;
      }).join('');
    body.querySelectorAll('.practice').forEach(div => {
      const i = +div.dataset.i;
      const d = mine[i] || (mine[i] = { text: '', checks: [] });
      const ta = div.querySelector('.draft');
      if (ta) ta.addEventListener('input', () => { d.text = ta.value; saveDrafts(); });
      div.querySelectorAll('.checklist input').forEach(cb => cb.addEventListener('change', () => {
        d.checks = d.checks || [];
        d.checks[+cb.dataset.j] = cb.checked;
        saveDrafts();
      }));
      div.querySelector('[data-sample]').onclick = e => {
        const box = div.querySelector('.sample-wrap');
        box.hidden = !box.hidden;
        e.target.textContent = box.hidden ? '看参考答案' : '收起参考答案';
      };
    });
    mountSims(body);
  }

  const LETTERS = 'ABCDEFG';

  function answerText(q, order) {
    if (q.type === 'choice') return (order ? LETTERS[order.indexOf(q.answer)] + '. ' : '') + q.options[q.answer];
    if (q.type === 'num') return fmtNum(q.answer) + (q.unit ? ' ' + q.unit : '');
    return esc(q.answer[0]);
  }

  function renderExamples(n, body) {
    const ex = n.examples || [];
    // 例题选项也打乱，避免正确答案总在同一个位置
    const orders = ex.map(q => q.type === 'choice' ? shuffle(q.options.map((o, j) => j)) : null);
    let lastP = null;
    body.innerHTML = ex.map((q, i) => {
      let head = '';
      if (q.passage && q.passage !== lastP) head = passageBlock(n, q.passage);
      lastP = q.passage || null;
      return head + `
      <div class="q">
        <div class="q-stem"><span class="num">例 ${i + 1}</span>${q.q}</div>
        ${q.type === 'choice' ? `<div class="opts">${orders[i].map((oi, j) => `<button class="opt" disabled data-oi="${oi}"><b>${LETTERS[j]}.</b>${q.options[oi]}</button>`).join('')}</div>` : ''}
        <div class="reveal"><button class="btn" data-show="${i}">看答案和解析</button></div>
        <div class="explain" id="exp${i}" hidden>
          <span class="mark ok">答案：${answerText(q, orders[i])}</span><br>${q.explain}
        </div>
      </div>`;
    }).join('') +
      `<div class="quiz-foot"><button class="btn primary" data-tab-go="test">开始测试 →</button></div>`;
    body.querySelectorAll('[data-show]').forEach(b => b.onclick = () => {
      const i = +b.dataset.show;
      body.querySelector('#exp' + i).hidden = false;
      b.parentElement.remove();
      if (ex[i].type === 'choice') {
        body.querySelectorAll('.q')[i].querySelector(`.opt[data-oi="${ex[i].answer}"]`).classList.add('right');
      }
    });
    mountSims(body);
    bindTabGo(body);
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function newQuiz(n) {
    // 共用同一段材料的题捆成一组、组内保持顺序；组与组、组与其他题之间照常打乱
    const blocks = [];
    (n.tests || []).forEach((q, i) => {
      const last = blocks[blocks.length - 1];
      if (q.passage && last && last.p === q.passage) last.idx.push(i);
      else blocks.push({ p: q.passage || null, idx: [i] });
    });
    // 题库大时每次只抽一部分：整组地取，凑满 QUIZ_N 题为止
    const picked = [];
    let count = 0;
    for (const b of shuffle(blocks)) {
      if (count >= QUIZ_N) break;
      picked.push(b);
      count += b.idx.length;
    }
    return {
      submitted: false,
      items: picked.flatMap(b => b.idx).map(qi => {
        const q = n.tests[qi];
        return { qi, order: q.type === 'choice' && !q.fixed ? shuffle(q.options.map((o, j) => j)) : q.type === 'choice' ? q.options.map((o, j) => j) : null, ans: null };
      })
    };
  }

  // 填空比对：全角转半角、下标数字转普通数字（H₂O = H2O）、去掉空格和句末标点
  function norm(s) {
    let t = String(s).normalize('NFKC').replace(/\s+/g, '').replace(/[。．.!！?？；;，,]+$/, '');
    if (!CFG.caseSensitive) t = t.toLowerCase();
    return t;
  }
  // 数值：支持 2.5、-3、1/3、2.5e3、2.5×10^3、2.5×10³
  function parseNum(s) {
    let t = String(s).normalize('NFKC').replace(/\s+/g, '').replace(/[，,]/g, '');
    t = t.replace(/[×xX*]10\^?(-?\d+)/, 'e$1');
    if (/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(t)) { const [a, b] = t.split('/').map(Number); return b ? a / b : NaN; }
    if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(t)) return NaN;
    return Number(t);
  }
  function fmtNum(x) {
    if (Math.abs(x) >= 1e5 || (Math.abs(x) < 1e-3 && x !== 0)) {
      const [m, e] = x.toExponential().split('e');
      return `${+(+m).toFixed(4)}×10<sup>${+e}</sup>`;
    }
    return String(+x.toFixed(6));
  }
  function isRight(q, ans) {
    if (ans == null || ans === '') return false;
    if (q.type === 'choice') return ans === q.answer;
    if (q.type === 'num') {
      const v = parseNum(ans);
      if (isNaN(v)) return false;
      const tol = q.tol != null ? q.tol : 0.01;    // 默认允许 1% 的相对误差
      return Math.abs(v - q.answer) <= Math.max(Math.abs(q.answer) * tol, 1e-9);
    }
    return q.answer.some(a => norm(a) === norm(ans));
  }

  function renderTest(n, body) {
    const tests = n.tests || [];
    if (!tests.length) { body.innerHTML = '<p class="muted">这个知识点还没有测试题。</p>'; return; }
    const qz = quiz[n.id] || (quiz[n.id] = newQuiz(n));
    let html = '';

    if (qz.submitted) {
      const right = qz.items.filter(it => isRight(tests[it.qi], it.ans)).length;
      const pct = Math.round(right / qz.items.length * 100);
      const pass = pct >= PASS;
      let next = '';
      if (pass) {
        const ready = dependents[n.id].filter(d => status(d) !== 'mastered' && isReady(byId[d]));
        next = ready.length ? `<div class="rel-row">现在可以学：${relButtons(ready)}</div>` : '';
      } else {
        const weakPre = n.prereqs.filter(p => status(p) !== 'mastered');
        next = weakPre.length ? `<div class="rel-row">建议先复习：${relButtons(weakPre)}</div>` : '<p>回到“讲解”再看一遍错题对应的内容，然后再测一次。</p>';
      }
      html += `<div class="score-card ${pass ? 'pass' : 'fail'}">
        <div class="score-num">${pct}%</div>
        <div><p><b>${pass ? '太棒了，这个知识点你已经掌握了！' : '还差一点，再练练！'}</b></p>
        <p>答对 ${right} / ${qz.items.length} 题，达到 ${PASS}% 算掌握。</p>${next}</div></div>`;
    } else {
      html += `<p class="quiz-intro">本次 ${qz.items.length} 题（题库共 ${tests.length} 题，每次随机抽），答对 ${PASS}% 以上就算掌握。${tests.some(q => q.type === 'num') ? '计算题只填数字（可以写分数或 2.5×10^3 这样的形式），单位已经给出。' : ''}</p>`;
    }

    let lastP = null;
    qz.items.forEach((it, k) => {
      const q = tests[it.qi];
      const ok = isRight(q, it.ans);
      if (q.passage && q.passage !== lastP) html += passageBlock(n, q.passage);
      lastP = q.passage || null;
      html += `<div class="q" data-k="${k}"><div class="q-stem"><span class="num">${k + 1}.</span>${q.q}</div>`;
      if (q.type === 'choice') {
        html += '<div class="opts">' + it.order.map((oi, j) => {
          let cls = 'opt';
          if (qz.submitted) {
            if (oi === q.answer) cls += ' right';
            else if (oi === it.ans) cls += ' wrong';
          } else if (oi === it.ans) cls += ' picked';
          return `<button class="${cls}" data-oi="${oi}" ${qz.submitted ? 'disabled' : ''}><b>${LETTERS[j]}.</b>${q.options[oi]}</button>`;
        }).join('') + '</div>';
      } else {
        html += `<div class="fill-row">${q.pre ? `<span class="unit">${q.pre}</span>` : ''}<input class="fill-in ${q.type === 'num' ? 'num' : ''} ${qz.submitted ? (ok ? 'right' : 'wrong') : ''}" value="${esc(it.ans || '')}"
          placeholder="${q.type === 'num' ? '填数字' : '在这里填写答案'}" ${q.type === 'num' ? 'inputmode="decimal"' : ''}
          autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ${qz.submitted ? 'disabled' : ''}>${q.unit ? `<span class="unit">${q.unit}</span>` : ''}</div>`;
      }
      if (qz.submitted) {
        const correct = q.type === 'fill' ? esc(q.answer.join(' / ')) : answerText(q);
        html += `<div class="explain"><span class="mark ${ok ? 'ok' : 'no'}">${ok ? '✓ 正确' : '✗ 正确答案：' + correct}</span><br>${q.explain}</div>`;
      }
      html += '</div>';
    });

    html += qz.submitted
      ? `<div class="quiz-foot"><button class="btn primary" id="qRetry">再测一次</button><button class="btn" data-tab-go="learn">回到讲解</button></div>`
      : `<div class="quiz-foot"><button class="btn primary" id="qSubmit">交卷</button><span class="quiz-msg" id="qMsg"></span></div>`;
    body.innerHTML = html;

    body.querySelectorAll('.q').forEach(div => {
      const it = qz.items[+div.dataset.k];
      div.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        it.ans = +b.dataset.oi;
        div.querySelectorAll('.opt').forEach(x => x.classList.toggle('picked', x === b));
      });
      const inp = div.querySelector('.fill-in');
      if (inp) inp.addEventListener('input', () => { it.ans = inp.value; });
    });
    const sub = body.querySelector('#qSubmit');
    if (sub) sub.onclick = () => {
      const left = qz.items.filter(it => it.ans == null || String(it.ans).trim() === '').length;
      if (left) { body.querySelector('#qMsg').textContent = `还有 ${left} 题没作答哦。`; return; }
      const bad = qz.items.filter(it => tests[it.qi].type === 'num' && isNaN(parseNum(it.ans))).length;
      if (bad) { body.querySelector('#qMsg').textContent = `有 ${bad} 道计算题填的不是数字，只填数字就行，不用写单位。`; return; }
      qz.submitted = true;
      const right = qz.items.filter(it => isRight(tests[it.qi], it.ans)).length;
      const pct = Math.round(right / qz.items.length * 100);
      const p = progress[n.id] || (progress[n.id] = { viewed: Date.now() });
      p.last = pct;
      p.best = Math.max(p.best || 0, pct);
      p.attempts = (p.attempts || 0) + 1;
      p.updated = Date.now();
      save();
      refreshNodes();
      renderPanel();
      panel.querySelector('#pBody').scrollTop = 0;
    };
    const retry = body.querySelector('#qRetry');
    if (retry) retry.onclick = () => { quiz[n.id] = newQuiz(n); renderPanel(); };
    body.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openNode(b.dataset.go));
    bindTabGo(body);
  }

  /* ---------------- 弹出层 ---------------- */
  const popNext = document.getElementById('popNext');
  const popBackup = document.getElementById('popBackup');
  function hidePopovers() { popNext.hidden = true; popBackup.hidden = true; }
  function itemBtn(n) {
    return `<button class="item" data-go="${n.id}"><i class="dot st-${status(n.id)}"></i>${esc(n.title)}<small>${TERM_NAME[n.term]}</small></button>`;
  }
  document.getElementById('btnNext').onclick = e => {
    e.stopPropagation();
    if (!popNext.hidden) { hidePopovers(); return; }
    hidePopovers();
    const rec = recommended();
    let html = Object.keys(progress).length ? '' : `<div class="tipbox">第一次使用？建议先做 <button class="linkish" id="nDiag">入门诊断测试</button>，把已经会的知识点标出来。</div>`;
    if (rec.weak.length) html += `<h3>先补一补</h3><p class="muted">这些测试还没过关：</p>${rec.weak.slice(0, 3).map(itemBtn).join('')}`;
    if (rec.ready.length) html += `<h3 style="margin-top:12px">可以学新的了</h3><p class="muted">前置知识都已掌握：</p>${rec.ready.slice(0, 4).map(itemBtn).join('')}`;
    if (!html) html = '<h3>全部掌握了！🎉</h3><p>目前所有知识点都已通过测试，新的内容很快就来。</p>';
    popNext.innerHTML = html;
    popNext.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openNode(b.dataset.go));
    const nd = popNext.querySelector('#nDiag');
    if (nd) nd.onclick = () => diagSetup();
    popNext.insertAdjacentHTML('beforeend', `<div class="row"><button class="btn" id="nPath">查看完整学习路径</button></div>`);
    popNext.querySelector('#nPath').onclick = () => pathView();
    popNext.hidden = false;
  };
  document.getElementById('btnBackup').onclick = e => {
    e.stopPropagation();
    const wasHidden = popBackup.hidden;
    hidePopovers();
    popBackup.hidden = !wasHidden;
    document.getElementById('backupMsg').textContent = '';
  };
  [popNext, popBackup].forEach(p => p.addEventListener('click', e => e.stopPropagation()));
  document.addEventListener('click', hidePopovers);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!popNext.hidden || !popBackup.hidden) hidePopovers();
    else if (selId) closePanel();
  });

  document.getElementById('btnExport').onclick = () => {
    const data = { app: CFG.key, version: 1, exported: new Date().toISOString(), progress, drafts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${CFG.subject}学习进度-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    document.getElementById('backupMsg').textContent = '已导出。';
  };
  document.getElementById('fileImport').onchange = e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const msg = document.getElementById('backupMsg');
    f.text().then(txt => {
      const data = JSON.parse(txt);
      if (!data || data.app !== CFG.key || typeof data.progress !== 'object') throw new Error('bad');
      if (!confirm('导入会覆盖这台设备上现有的进度，确定吗？')) return;
      progress = data.progress;
      save();
      if (data.drafts && typeof data.drafts === 'object') { drafts = data.drafts; saveDrafts(); }
      refreshNodes();
      if (selId) renderPanel();
      msg.textContent = '导入成功！';
    }).catch(() => { msg.textContent = `这个文件不是有效的${CFG.subject}进度文件。`; });
  };

  /* ---------------- 弹窗：入门诊断测试、学习路径 ---------------- */
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const DIAG_PER = 2;          // 每个知识点抽 2 题：都对记为掌握，否则记为需加强
  let diag = null;             // { items: [{nid, q, order, ans}], submitted }

  function openModal(title) {
    document.getElementById('modalTitle').textContent = title;
    modal.hidden = false;
    modalBody.scrollTop = 0;
    hidePopovers();
  }
  function closeModal() {
    if (diag && !diag.submitted && diag.items.some(it => it.ans != null && it.ans !== '') &&
        !confirm('诊断测试还没交卷，关闭后这次的作答不会保存。确定关闭吗？')) return;
    modal.hidden = true;
    diag = null;
  }
  document.getElementById('modalClose').onclick = closeModal;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  function bindGo(root) {
    root.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { modal.hidden = true; diag = null; openNode(b.dataset.go); });
  }

  // 诊断只用不依赖共用材料的题
  const diagPool = n => (n.tests || []).filter(q => !q.passage);

  function diagSetup() {
    openModal('入门诊断测试');
    const terms = CFG.terms.filter(t => nodes.some(n => n.term === t.id && diagPool(n).length));
    const mods = KG.modules.filter(m => nodes.some(n => n.module === m.id));
    modalBody.innerHTML = `
      <p>诊断测试帮你快速找出哪些知识点<b>已经会了</b>、哪些<b>需要补</b>。每个知识点抽 ${DIAG_PER} 道题：两道都答对记为“已掌握”，否则记为“需加强”。<b>不会的题直接空着</b>，不要猜——猜对了反而会漏掉要补的地方。</p>
      <p class="muted">已经在“测试”里做过的知识点，诊断结果只作参考，不会覆盖原来的成绩。</p>
      <h3>1. 选学过的学期</h3>
      <div class="pick" id="dTerms">${terms.map((t, i) => `<label><input type="checkbox" value="${t.id}" ${i === 0 ? 'checked' : ''}> ${t.name}</label>`).join('')}</div>
      <h3>2. 选模块</h3>
      <div class="pick" id="dMods">${mods.map(m => `<label><input type="checkbox" value="${m.id}" checked> <i style="background:${m.color}"></i>${m.name}</label>`).join('')}</div>
      <p class="d-count" id="dCount"></p>
      <div class="quiz-foot"><button class="btn primary" id="dStart">开始诊断</button></div>`;
    const sel = () => {
      const ts = new Set([...modalBody.querySelectorAll('#dTerms input:checked')].map(i => i.value));
      const ms = new Set([...modalBody.querySelectorAll('#dMods input:checked')].map(i => i.value));
      return nodes.filter(n => ts.has(n.term) && ms.has(n.module) && diagPool(n).length)
        .sort((a, b) => termIdx(a) - termIdx(b) || a._i - b._i);
    };
    const upd = () => {
      // 所选学期里没有内容的模块变灰
      const ts = new Set([...modalBody.querySelectorAll('#dTerms input:checked')].map(i => i.value));
      modalBody.querySelectorAll('#dMods label').forEach(l => {
        const has = nodes.some(n => ts.has(n.term) && n.module === l.querySelector('input').value && diagPool(n).length);
        l.classList.toggle('empty', !has);
      });
      const s = sel();
      const qn = s.reduce((a, n) => a + Math.min(DIAG_PER, diagPool(n).length), 0);
      modalBody.querySelector('#dCount').textContent = s.length
        ? `共 ${s.length} 个知识点、${qn} 道题，大约需要 ${Math.ceil(qn * 1.2)} 分钟。题多的话可以少选几个模块，分几次做。`
        : '请至少选一个学期和一个模块。';
      modalBody.querySelector('#dStart').disabled = !s.length;
    };
    modalBody.querySelectorAll('input').forEach(i => { i.onchange = upd; });
    upd();
    modalBody.querySelector('#dStart').onclick = () => {
      const items = [];
      sel().forEach(n => shuffle(diagPool(n)).slice(0, DIAG_PER).forEach(q => items.push({
        nid: n.id, q, ans: null,
        order: q.type === 'choice' ? (q.fixed ? q.options.map((o, j) => j) : shuffle(q.options.map((o, j) => j))) : null
      })));
      diag = { items, submitted: false };
      diagRender();
    };
  }

  function diagRender() {
    const sub = diag.submitted;
    let html = '';
    if (sub) html += diagReport();
    else html += `<p class="quiz-intro">共 ${diag.items.length} 题。不会的空着即可。${diag.items.some(it => it.q.type === 'num') ? '计算题只填数字，单位已经给出。' : ''}</p>`;
    let lastMod = null;
    diag.items.forEach((it, k) => {
      const n = byId[it.nid], q = it.q, ok = isRight(q, it.ans);
      if (n.module !== lastMod) { html += `<h3 class="d-mod" style="border-color:${modById[n.module].color}">${modById[n.module].name}</h3>`; lastMod = n.module; }
      html += `<div class="q" data-k="${k}"><div class="q-stem"><span class="num">${k + 1}.</span>${q.q}</div>`;
      if (q.type === 'choice') {
        html += '<div class="opts">' + it.order.map((oi, j) => {
          let cls = 'opt';
          if (sub) { if (oi === q.answer) cls += ' right'; else if (oi === it.ans) cls += ' wrong'; }
          else if (oi === it.ans) cls += ' picked';
          return `<button class="${cls}" data-oi="${oi}" ${sub ? 'disabled' : ''}><b>${LETTERS[j]}.</b>${q.options[oi]}</button>`;
        }).join('') + '</div>';
      } else {
        html += `<div class="fill-row">${q.pre ? `<span class="unit">${q.pre}</span>` : ''}<input class="fill-in ${q.type === 'num' ? 'num' : ''} ${sub ? (ok ? 'right' : 'wrong') : ''}" value="${esc(it.ans || '')}"
          placeholder="${q.type === 'num' ? '填数字' : '填写答案'}" autocomplete="off" spellcheck="false" ${sub ? 'disabled' : ''}>${q.unit ? `<span class="unit">${q.unit}</span>` : ''}</div>`;
      }
      if (sub) {
        const correct = q.type === 'fill' ? esc(q.answer.join(' / ')) : answerText(q);
        html += `<details class="explain"><summary><span class="mark ${ok ? 'ok' : 'no'}">${ok ? '✓ 正确' : (it.ans == null || it.ans === '' ? '— 未作答' : '✗ 答错')}</span> 所属知识点：<button class="linkish" data-go="${n.id}">${esc(n.title)}</button></summary>
          <p>${ok ? '' : '正确答案：' + correct + '<br>'}${q.explain}</p></details>`;
      }
      html += '</div>';
    });
    html += sub
      ? `<div class="quiz-foot"><button class="btn primary" id="dPath">看学习路径</button><button class="btn" id="dAgain">再诊断其他部分</button></div>`
      : `<div class="quiz-foot"><button class="btn primary" id="dSubmit">交卷</button><span class="quiz-msg" id="dMsg"></span></div>`;
    modalBody.innerHTML = html;
    modalBody.scrollTop = 0;

    if (!sub) {
      modalBody.querySelectorAll('.q').forEach(div => {
        const it = diag.items[+div.dataset.k];
        div.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          it.ans = it.ans === +b.dataset.oi ? null : +b.dataset.oi;   // 再点一次取消选择
          div.querySelectorAll('.opt').forEach(x => x.classList.toggle('picked', +x.dataset.oi === it.ans));
        });
        const inp = div.querySelector('.fill-in');
        if (inp) inp.addEventListener('input', () => { it.ans = inp.value; });
      });
      modalBody.querySelector('#dSubmit').onclick = () => {
        const left = diag.items.filter(it => it.ans == null || String(it.ans).trim() === '').length;
        if (left && !confirm(`还有 ${left} 题没作答，会按“不会”处理。确定交卷吗？`)) return;
        diag.submitted = true;
        diagApply();
        diagRender();
      };
    } else {
      bindGo(modalBody);
      modalBody.querySelector('#dPath').onclick = () => { diag = null; pathView(); };
      modalBody.querySelector('#dAgain').onclick = () => { diag = null; diagSetup(); };
    }
  }

  function diagResults() {
    const res = {};
    diag.items.forEach(it => {
      const r = res[it.nid] || (res[it.nid] = { right: 0, total: 0 });
      r.total++;
      if (isRight(it.q, it.ans)) r.right++;
    });
    return res;
  }
  function diagApply() {
    const res = diagResults(), now = Date.now();
    Object.keys(res).forEach(id => {
      const r = res[id], pct = Math.round(r.right / r.total * 100);
      const p = progress[id] || (progress[id] = { viewed: now, last: null, best: null, attempts: 0 });
      p.diag = { pct, at: now };
      if (!p.attempts) { p.last = pct; p.best = Math.max(p.best || 0, pct); }   // 做过正式测试的不覆盖
    });
    save();
    refreshNodes();
    if (selId) renderPanel();
  }
  function diagReport() {
    const res = diagResults();
    const ids = Object.keys(res);
    const ok = ids.filter(id => res[id].right === res[id].total);
    const bad = ids.filter(id => res[id].right < res[id].total);
    const kept = ids.filter(id => (progress[id] || {}).attempts);
    const right = diag.items.filter(it => isRight(it.q, it.ans)).length;
    const pct = Math.round(right / diag.items.length * 100);
    const chip = id => `<button class="d-chip ${res[id].right === res[id].total ? 'ok' : 'no'}" data-go="${id}">${esc(byId[id].short || byId[id].title)} <small>${res[id].right}/${res[id].total}</small></button>`;
    return `<div class="score-card ${pct >= PASS ? 'pass' : 'fail'}"><div class="score-num">${pct}%</div>
        <div><p><b>答对 ${right} / ${diag.items.length} 题</b></p>
        <p>${ok.length} 个知识点记为已掌握，${bad.length} 个需要加强。${kept.length ? `其中 ${kept.length} 个之前做过正式测试，保留原成绩。` : ''}</p></div></div>
      ${bad.length ? `<h3>需要加强（点名称去学）</h3><div class="d-chips">${bad.map(chip).join('')}</div>` : ''}
      ${ok.length ? `<h3>已经掌握</h3><div class="d-chips">${ok.map(chip).join('')}</div>` : ''}
      <p class="muted" style="margin-top:12px">下面是每道题的对错，点开可以看解析。</p>`;
  }

  // 学习路径：拓扑排序（先学前置），同等条件下按学期、再按图谱顺序
  function pathOrder() {
    const indeg = {};
    nodes.forEach(n => { indeg[n.id] = n.prereqs.length; });
    const avail = nodes.filter(n => !indeg[n.id]);
    const out = [], seen = new Set();
    const key = n => termIdx(n) * 1e5 + n._i;
    while (avail.length) {
      avail.sort((a, b) => key(a) - key(b));
      const n = avail.shift();
      out.push(n); seen.add(n.id);
      dependents[n.id].forEach(d => { if (--indeg[d] === 0) avail.push(byId[d]); });
    }
    nodes.forEach(n => { if (!seen.has(n.id)) out.push(n); });   // 有环时兜底
    return out;
  }
  function pathView() {
    openModal('学习路径');
    const order = pathOrder();
    const done = nodes.filter(n => status(n.id) === 'mastered').length;
    const weak = order.filter(n => status(n.id) === 'weak');
    const next = order.filter(n => status(n.id) !== 'mastered' && status(n.id) !== 'weak' && isReady(n)).slice(0, 5);
    let html = `<p>按“先学前置知识、再学后续”的顺序，把全部 ${nodes.length} 个知识点排好了。已掌握 <b>${done}</b> 个。点名称直接去学。</p>`;
    html += '<div class="path-terms">' + CFG.terms.map(t => {
      const ns = nodes.filter(n => n.term === t.id);
      if (!ns.length) return '';
      const d = ns.filter(n => status(n.id) === 'mastered').length;
      return `<div class="path-term"><span>${t.name}</span><div class="progress-bar"><div class="progress-fill" style="width:${d / ns.length * 100}%"></div></div><span class="muted">${d}/${ns.length}</span></div>`;
    }).join('') + '</div>';
    if (Object.keys(progress).length === 0) html += `<div class="tipbox">还没有学习记录。可以先做一次 <button class="linkish" id="pDiag">入门诊断测试</button>，把已经会的知识点标出来，路径会更准。</div>`;
    if (weak.length) html += `<h3>① 先补一补（${weak.length}）</h3>${weak.slice(0, 8).map(itemBtn).join('')}${weak.length > 8 ? `<p class="muted">还有 ${weak.length - 8} 个，在下面“完整顺序”里用红框标出。建议按顺序从前往后补。</p>` : ''}`;
    if (next.length) html += `<h3>${weak.length ? '②' : '①'} 接下来学</h3>${next.map(itemBtn).join('')}`;
    // 全部顺序：按“学期 · 章”分组
    const groups = [];
    const gIdx = {};
    order.forEach(n => {
      const g = n.term + '|' + (n.chapter || modById[n.module].name);
      if (gIdx[g] == null) { gIdx[g] = groups.length; groups.push({ title: `${TERM_NAME[n.term]} · ${n.chapter || modById[n.module].name}`, items: [] }); }
      groups[gIdx[g]].items.push(n);
    });
    let k = 0;
    html += '<h3>完整顺序</h3>' + groups.map(g => {
      const left = g.items.filter(n => status(n.id) !== 'mastered').length;
      const lis = g.items.map(n => {
        const st = status(n.id);
        const num = st === 'mastered' ? '✓' : String(++k);
        return `<li class="${st === 'mastered' ? 'done' : ''}"><span class="p-num">${num}</span><button class="linkish" data-go="${n.id}"><i class="dot st-${st}"></i>${esc(n.title)}</button></li>`;
      }).join('');
      return `<details class="path-group" ${left ? 'open' : ''}><summary>${esc(g.title)} <span class="muted">${g.items.length - left}/${g.items.length}</span></summary><ol class="path">${lis}</ol></details>`;
    }).join('');
    modalBody.innerHTML = html;
    bindGo(modalBody);
    const pd = modalBody.querySelector('#pDiag');
    if (pd) pd.onclick = diagSetup;
  }

  document.getElementById('btnDiag').onclick = e => { e.stopPropagation(); diagSetup(); };
  document.getElementById('btnPath').onclick = e => { e.stopPropagation(); pathView(); };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) { e.stopImmediatePropagation(); closeModal(); }
  }, true);

  /* ---------------- 启动 ---------------- */
  document.title = CFG.title;
  document.getElementById('appTitle').textContent = CFG.title;
  document.getElementById('appSub').textContent = CFG.sub;
  layout();
  drawGraph();
  drawChips();
  refreshNodes();
  // 知识点多了以后整张图缩到一屏字会太小，启动时保证可读
  zoom = Math.max(0.8, Math.min(1.1, Math.min(wrap.clientWidth / W, wrap.clientHeight / H)));
  applyZoom();
})();
