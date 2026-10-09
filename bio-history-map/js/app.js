(function () {
  'use strict';

  const KG = window.KG;
  const CFG = KG.config;
  const PASS = 80;                      // 测试正确率达到 80% 记为掌握
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
          <button class="tab ${tab === 'test' ? 'on' : ''}" data-tab="test">测试 ${tests.length}</button>
          ${(n.practice || []).length ? `<button class="tab ${tab === 'practice' ? 'on' : ''}" data-tab="practice">${CFG.practiceName || '作图·简答'} ${n.practice.length}</button>` : ''}
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
  // 主观题的参考答案和评分要点
  const ptTotal = q => q.points.reduce((a, x) => a + x.s, 0);
  function refBlock(q) {
    return `<div class="ref"><b>参考答案</b>${q.ref}</div>
      <div class="ref"><b>评分要点（共 ${ptTotal(q)} 分）</b><ul class="points">${q.points.map(x => `<li><span class="pt">${x.s} 分</span>${x.p}</li>`).join('')}</ul></div>`;
  }

  function renderExamples(n, body) {
    const ex = n.examples || [];
    // 例题选项也打乱，避免正确答案总在同一个位置
    const orders = ex.map(q => q.type !== 'choice' ? null : q.fixed ? q.options.map((o, j) => j) : shuffle(q.options.map((o, j) => j)));
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
          ${q.type === 'open' ? refBlock(q) : `<span class="mark ok">答案：${answerText(q, orders[i])}</span><br>`}${q.explain || ''}
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
    return {
      submitted: false,   // 交卷后客观题出分；有主观题时还要自评
      graded: false,
      items: shuffle(blocks).flatMap(b => b.idx).map(qi => {
        const q = n.tests[qi];
        return { qi, order: q.type === 'choice' && !q.fixed ? shuffle(q.options.map((o, j) => j)) : q.type === 'choice' ? q.options.map((o, j) => j) : null, ans: null, got: [] };
      })
    };
  }

  // 填空比对：全角转半角、去掉空格、引号书名号（《马关条约》= 马关条约）和句末标点
  function norm(s) {
    let t = String(s).normalize('NFKC').replace(/\s+/g, '').replace(/[“”"《》〈〉]/g, '').replace(/[。．.!！?？；;，,、]+$/, '');
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
    if (ans == null || ans === '' || q.type === 'open') return false;
    if (q.type === 'choice') return ans === q.answer;
    if (q.type === 'num') {
      const v = parseNum(ans);
      if (isNaN(v)) return false;
      const tol = q.tol != null ? q.tol : 0.01;    // 默认允许 1% 的相对误差
      return Math.abs(v - q.answer) <= Math.max(Math.abs(q.answer) * tol, 1e-9);
    }
    return q.answer.some(a => norm(a) === norm(ans));
  }
  // 每题记 1 分；主观题按自评得分折算
  function score(q, it) {
    if (q.type !== 'open') return isRight(q, it.ans) ? 1 : 0;
    return it.got.reduce((a, j) => a + q.points[j].s, 0) / ptTotal(q);
  }
  function quizPct(n, qz) {
    const sum = qz.items.reduce((a, it) => a + score(n.tests[it.qi], it), 0);
    return Math.round(sum / n.tests.length * 100);
  }
  function record(n, pct) {
    const p = progress[n.id] || (progress[n.id] = { viewed: Date.now() });
    p.last = pct;
    p.best = Math.max(p.best || 0, pct);
    p.attempts = (p.attempts || 0) + 1;
    p.updated = Date.now();
    save();
  }

  function renderTest(n, body) {
    const tests = n.tests || [];
    if (!tests.length) { body.innerHTML = '<p class="muted">这个知识点还没有测试题。</p>'; return; }
    const qz = quiz[n.id] || (quiz[n.id] = newQuiz(n));
    const hasOpen = tests.some(q => q.type === 'open');
    let html = '';

    if (qz.graded) {
      const pct = quizPct(n, qz);
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
        <p>得分率达到 ${PASS}% 算掌握${hasOpen ? '（主观题按你的自评折算）' : ''}。</p>${next}</div></div>`;
    } else if (qz.submitted) {
      html += `<div class="tipbox">✍️ <b>还差最后一步：自评</b>。对照每道主观题的参考答案，把你答到的要点勾上（意思对就算，不要求字字相同），然后点最下面的“自评完成，出成绩”。</div>`;
    } else {
      html += `<p class="quiz-intro">共 ${tests.length} 题，得分率 ${PASS}% 以上就算掌握。每次测试题目和选项的顺序都会打乱。${hasOpen ? '主观题交卷后对照参考答案自己给分。' : ''}${tests.some(q => q.type === 'num') ? '计算题只填数字，单位已经给出。' : ''}</p>`;
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
      } else if (q.type === 'open') {
        html += `<textarea class="open-in" rows="${q.rows || 3}" placeholder="在这里写你的答案" ${qz.submitted ? 'disabled' : ''}>${esc(it.ans || '')}</textarea>`;
      } else {
        html += `<div class="fill-row">${q.pre ? `<span class="unit">${q.pre}</span>` : ''}<input class="fill-in ${q.type === 'num' ? 'num' : ''} ${qz.submitted ? (ok ? 'right' : 'wrong') : ''}" value="${esc(it.ans || '')}"
          placeholder="${q.type === 'num' ? '填数字' : '在这里填写答案'}" ${q.type === 'num' ? 'inputmode="decimal"' : ''}
          autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" ${qz.submitted ? 'disabled' : ''}>${q.unit ? `<span class="unit">${q.unit}</span>` : ''}</div>`;
      }
      if (qz.submitted && q.type === 'open') {
        const got = it.got.reduce((a, j) => a + q.points[j].s, 0);
        html += `<div class="explain"><div class="ref"><b>参考答案</b>${q.ref}</div>
          <div class="ref"><b>评分要点：答到哪点勾哪点</b>${q.points.map((x, j) => `<label class="pt-row"><input type="checkbox" data-j="${j}" ${it.got.includes(j) ? 'checked' : ''} ${qz.graded ? 'disabled' : ''}><span class="pt">${x.s} 分</span><span>${x.p}</span></label>`).join('')}
          <div class="pt-sum">自评：<b>${got}</b> / ${ptTotal(q)} 分</div></div>${q.explain ? `<div class="ref-note">${q.explain}</div>` : ''}</div>`;
      } else if (qz.submitted) {
        const correct = q.type === 'fill' ? esc(q.answer.join(' / ')) : answerText(q);
        html += `<div class="explain"><span class="mark ${ok ? 'ok' : 'no'}">${ok ? '✓ 正确' : '✗ 正确答案：' + correct}</span><br>${q.explain}</div>`;
      }
      html += '</div>';
    });

    if (qz.graded) html += `<div class="quiz-foot"><button class="btn primary" id="qRetry">再测一次</button><button class="btn" data-tab-go="learn">回到讲解</button></div>`;
    else if (qz.submitted) html += `<div class="quiz-foot"><button class="btn primary" id="qGrade">自评完成，出成绩</button></div>`;
    else html += `<div class="quiz-foot"><button class="btn primary" id="qSubmit">交卷</button><span class="quiz-msg" id="qMsg"></span></div>`;
    body.innerHTML = html;

    body.querySelectorAll('.q').forEach(div => {
      const it = qz.items[+div.dataset.k];
      const q = tests[it.qi];
      div.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        it.ans = +b.dataset.oi;
        div.querySelectorAll('.opt').forEach(x => x.classList.toggle('picked', x === b));
      });
      const inp = div.querySelector('.fill-in, .open-in');
      if (inp) inp.addEventListener('input', () => { it.ans = inp.value; });
      div.querySelectorAll('.pt-row input').forEach(cb => cb.addEventListener('change', () => {
        const j = +cb.dataset.j;
        it.got = it.got.filter(x => x !== j);
        if (cb.checked) it.got.push(j);
        div.querySelector('.pt-sum').innerHTML = `自评：<b>${it.got.reduce((a, x) => a + q.points[x].s, 0)}</b> / ${ptTotal(q)} 分`;
      }));
    });
    const sub = body.querySelector('#qSubmit');
    if (sub) sub.onclick = () => {
      const left = qz.items.filter(it => it.ans == null || String(it.ans).trim() === '').length;
      if (left) { body.querySelector('#qMsg').textContent = `还有 ${left} 题没作答哦。`; return; }
      const bad = qz.items.filter(it => tests[it.qi].type === 'num' && isNaN(parseNum(it.ans))).length;
      if (bad) { body.querySelector('#qMsg').textContent = `有 ${bad} 道计算题填的不是数字，只填数字就行，不用写单位。`; return; }
      qz.submitted = true;
      if (!hasOpen) { qz.graded = true; record(n, quizPct(n, qz)); refreshNodes(); }
      renderPanel();
      panel.querySelector('#pBody').scrollTop = 0;
    };
    const grade = body.querySelector('#qGrade');
    if (grade) grade.onclick = () => {
      qz.graded = true;
      record(n, quizPct(n, qz));
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
    let html = '';
    if (rec.weak.length) html += `<h3>先补一补</h3><p class="muted">这些测试还没过关：</p>${rec.weak.slice(0, 3).map(itemBtn).join('')}`;
    if (rec.ready.length) html += `<h3 style="margin-top:12px">可以学新的了</h3><p class="muted">前置知识都已掌握：</p>${rec.ready.slice(0, 4).map(itemBtn).join('')}`;
    if (!html) html = '<h3>全部掌握了！🎉</h3><p>目前所有知识点都已通过测试，新的内容很快就来。</p>';
    popNext.innerHTML = html;
    popNext.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openNode(b.dataset.go));
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
