(function () {
  'use strict';

  const KG = window.KG;
  const PASS = 80;                      // 测试正确率达到 80% 记为掌握
  const STORE = 'fjzk-zh-progress-v1';
  const GRADES = [4, 5, 6, 7, 8, 9];
  const GRADE_NAME = { 4: '四年级', 5: '五年级', 6: '六年级', 7: '七年级', 8: '八年级', 9: '九年级' };
  const STATUS_NAME = { new: '未学', learning: '学习中', weak: '需加强', mastered: '已掌握' };
  const SVGNS = 'http://www.w3.org/2000/svg';

  const modById = {};
  KG.modules.forEach((m, i) => { m.order = i; modById[m.id] = m; });
  const nodes = KG.nodes;
  const byId = {};
  nodes.forEach((n, i) => { n._i = i; byId[n.id] = n; });
  nodes.forEach(n => {
    n.prereqs = (n.prereqs || []).filter(p => {
      if (!byId[p]) { console.warn('前置知识点不存在：', p, '←', n.id); return false; }
      if (byId[p].grade > n.grade) console.warn('前置知识点年级更高：', p, '→', n.id);
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
    if (p.last != null) return p.last >= PASS ? 'mastered' : 'weak';   // 做过测试，以测试为准
    if (p.diag === 'pass') return 'mastered';                          // 入门诊断判断已掌握
    if (p.diag === 'fail') return 'weak';
    return p.viewed ? 'learning' : 'new';
  }
  function isReady(n) { return n.prereqs.every(p => status(p) === 'mastered'); }
  function recommended() {
    const st = n => status(n.id);
    const weak = nodes.filter(n => st(n) === 'weak');
    const ready = nodes.filter(n => st(n) !== 'mastered' && st(n) !== 'weak' && isReady(n));
    const sortFn = (a, b) => a.grade - b.grade || (st(a) === 'learning' ? -1 : 0) - (st(b) === 'learning' ? -1 : 0) || a._i - b._i;
    return { weak: weak.sort(sortFn), ready: ready.sort(sortFn) };
  }

  /* ---------------- 布局 ---------------- */
  const NW = 172, NH = 50, COLW = 204, ROWH = 66, PADX = 16, HEADH = 44, PADY = 18;
  let W = 0, H = 0;
  const gradeBlocks = {};
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
      shownPre(n).forEach(p => { const q = byId[p]; if (q.grade === n.grade) v = Math.max(v, d(q) + 1); });
      return (depth[n.id] = v);
    }
    shown.forEach(d);

    let col = 0;
    GRADES.forEach(g => {
      const gs = shown.filter(n => n.grade === g);
      const cols = gs.length ? Math.max(...gs.map(n => depth[n.id])) + 1 : 1;
      gradeBlocks[g] = { start: col, count: cols };
      col += cols;
    });
    const columns = {};
    shown.forEach(n => {
      const c = gradeBlocks[n.grade].start + depth[n.id];
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

    GRADES.forEach((g, i) => {
      const b = gradeBlocks[g];
      const x = PADX + b.start * COLW;
      if (i % 2 === 0) el('rect', { x, y: 0, width: b.count * COLW, height: H, class: 'band' }, svg);
      const t = el('text', { x: x + b.count * COLW / 2, y: 28, 'text-anchor': 'middle', class: 'band-label' }, svg);
      t.textContent = GRADE_NAME[g];
      t.addEventListener('click', () => wrap.scrollTo({ left: Math.max(0, x * zoom - 8) }));
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
    return nodes.filter(n => (n.title + ' ' + (n.short || '')).toLowerCase().includes(q));
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

  /* ---------------- 朗读 ---------------- */
  let zhVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    zhVoice = vs.find(v => /^zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, elx) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.8;
    if (zhVoice) u.voice = zhVoice;
    if (elx) { elx.classList.add('speaking'); u.onend = u.onerror = () => elx.classList.remove('speaking'); }
    speechSynthesis.speak(u);
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
    if ('speechSynthesis' in window) speechSynthesis.cancel();
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
              <span class="tag">${GRADE_NAME[n.grade]}</span>
              <span class="tag" style="color:${mod.color}">${mod.name}</span>
              <span class="tag stars" title="中考考频">${'★'.repeat(n.freq || 1)}${'☆'.repeat(3 - (n.freq || 1))}</span>
              <span class="tag status st-${st}">${STATUS_NAME[st]}${p.best != null ? ' · 最好 ' + p.best + '%' : (p.diag ? (p.diagInferred ? ' · 诊断推断' : ' · 入门诊断') : '')}</span>
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
          ${(n.practice || []).length ? `<button class="tab ${tab === 'practice' ? 'on' : ''}" data-tab="practice">写作练习 ${n.practice.length}</button>` : ''}
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
    bindTabGo(body);
  }

  // 朗读：.ex 古诗文/例句（.zh 是译文，不读），.w 单个字词
  panel.addEventListener('click', e => {
    const t = e.target.closest('.ex, .w');
    if (!t || !panel.contains(t)) return;
    const c = t.cloneNode(true);
    c.querySelectorAll('.zh, rt').forEach(z => z.remove());
    speak(c.textContent.trim(), t);
  });
  // 阅读材料：多道题共用一篇
  function passageBlock(n, key) {
    const ps = (n.passages || {})[key];
    if (!ps) return '';
    return `<div class="passage"><div class="passage-title">${ps.title || '阅读材料'}</div>${ps.html || ''}</div>`;
  }
  // 主观题的参考答案和评分要点
  function refBlock(q) {
    const total = q.points.reduce((a, x) => a + x.s, 0);
    return `<div class="ref"><b>参考答案</b>${q.ref}</div>
      <div class="ref"><b>评分要点（共 ${total} 分）</b><ul class="points">${q.points.map(x => `<li><span class="pt">${x.s} 分</span>${x.p}</li>`).join('')}</ul></div>`;
  }
  function bindTabGo(body) {
    body.querySelectorAll('[data-tab-go]').forEach(b => b.onclick = () => { tab = b.dataset.tabGo; renderPanel(); });
  }

  /* ---------------- 写作练习（自己写、对照清单自查、看范文） ---------------- */
  const DRAFTS = 'fjzk-zh-drafts-v1';
  let drafts = {};
  try { drafts = JSON.parse(localStorage.getItem(DRAFTS) || '{}') || {}; } catch (e) { drafts = {}; }
  function saveDrafts() { try { localStorage.setItem(DRAFTS, JSON.stringify(drafts)); } catch (e) { /* 忽略 */ } }
  function wordCount(t) { return t.replace(/\s/g, '').length; }   // 中文作文按字数（含标点）

  function renderPractice(n, body) {
    const mine = drafts[n.id] || (drafts[n.id] = {});
    body.innerHTML = `<p class="quiz-intro">写作没有自动打分：先自己写，再对照“自查清单”逐条检查，最后看范文学习好句子。草稿会自动保存在这台电脑上。</p>` +
      n.practice.map((pr, i) => {
        const d = mine[i] || { text: '', checks: [] };
        const range = pr.words ? `建议 ${pr.words[0]}–${pr.words[1]} 字` : '';
        return `<div class="q practice" data-i="${i}">
          <div class="q-stem"><span class="num">练习 ${i + 1}</span>${esc(pr.title || '')}</div>
          <div class="prompt">${pr.prompt}</div>
          <textarea class="draft" rows="10" placeholder="在这里写…" spellcheck="false">${esc(d.text)}</textarea>
          <div class="wc"><span class="wc-num">${wordCount(d.text)}</span> 字 <span class="muted">${range}</span></div>
          ${(pr.checklist || []).length ? `<div class="checklist"><b>自查清单</b>${pr.checklist.map((c, j) => `<label><input type="checkbox" data-j="${j}" ${d.checks && d.checks[j] ? 'checked' : ''}> ${c}</label>`).join('')}</div>` : ''}
          <div class="reveal"><button class="btn" data-sample="${i}">看范文</button></div>
          <div class="explain sample" hidden><b>范文</b>${pr.sample}${pr.notes ? `<div class="notes">${pr.notes}</div>` : ''}</div>
        </div>`;
      }).join('');
    body.querySelectorAll('.practice').forEach(div => {
      const i = +div.dataset.i;
      const d = mine[i] || (mine[i] = { text: '', checks: [] });
      const ta = div.querySelector('.draft');
      const wc = div.querySelector('.wc-num');
      const pr = n.practice[i];
      const paint = () => {
        const c = wordCount(ta.value);
        wc.textContent = c;
        wc.classList.toggle('ok', !!pr.words && c >= pr.words[0] && c <= pr.words[1]);
      };
      paint();
      ta.addEventListener('input', () => { d.text = ta.value; paint(); saveDrafts(); });
      div.querySelectorAll('.checklist input').forEach(cb => cb.addEventListener('change', () => {
        d.checks = d.checks || [];
        d.checks[+cb.dataset.j] = cb.checked;
        saveDrafts();
      }));
      div.querySelector('[data-sample]').onclick = e => {
        const box = div.querySelector('.sample');
        box.hidden = !box.hidden;
        e.target.textContent = box.hidden ? '看范文' : '收起范文';
      };
    });
  }

  const LETTERS = 'ABCDEFG';

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
          ${q.type === 'open' ? refBlock(q) : `<span class="mark ok">答案：${q.type === 'choice' ? LETTERS[orders[i].indexOf(q.answer)] + '. ' + q.options[q.answer] : esc(q.answer[0])}</span><br>`}${q.explain || ''}
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
    bindTabGo(body);
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function newQuiz(n) {
    const idx = (n.tests || []).map((q, i) => i);
    const grouped = (n.tests || []).some(q => q.passage);   // 共用材料的题不打乱顺序
    return {
      submitted: false,   // 交卷后客观题出分；有主观题时还要自评
      graded: false,
      items: (grouped ? idx : shuffle(idx)).map(qi => {
        const q = n.tests[qi];
        return { qi, order: q.type === 'choice' ? shuffle(q.options.map((o, j) => j)) : null, ans: null, got: [] };
      })
    };
  }
  // 填空比对：忽略空格和标点（默写只看字对不对），英文字母不分大小写
  function norm(s) {
    return String(s).toLowerCase().replace(/[\s，。、；：？！“”‘’"'（）()《》〈〉【】…—·,.;:?!\-]/g, '');
  }
  function isRight(q, ans) {
    if (ans == null || ans === '' || q.type === 'open') return false;
    if (q.type === 'choice') return ans === q.answer;
    return q.answer.some(a => norm(a) === norm(ans));
  }
  // 每题记 1 分；主观题按自评得分折算
  function score(q, it) {
    if (q.type !== 'open') return isRight(q, it.ans) ? 1 : 0;
    const total = q.points.reduce((a, x) => a + x.s, 0);
    return it.got.reduce((a, j) => a + q.points[j].s, 0) / total;
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
        next = weakPre.length ? `<div class="rel-row">建议先复习：${relButtons(weakPre)}</div>` : '<p>回到“讲解”再看一遍错题对应的方法，然后再测一次。</p>';
      }
      html += `<div class="score-card ${pass ? 'pass' : 'fail'}">
        <div class="score-num">${pct}%</div>
        <div><p><b>${pass ? '太棒了，这个知识点你已经掌握了！' : '还差一点，再练练！'}</b></p>
        <p>得分率达到 ${PASS}% 算掌握${hasOpen ? '（主观题按你的自评折算）' : ''}。</p>${next}</div></div>`;
    } else if (qz.submitted) {
      html += `<div class="tipbox">✍️ <b>还差最后一步：自评</b>。对照每道主观题的参考答案，把你答到的要点勾上（意思对就算，不要求字字相同），然后点最下面的“自评完成，出成绩”。</div>`;
    } else {
      html += `<p class="quiz-intro">共 ${tests.length} 题，得分率 ${PASS}% 以上就算掌握。${hasOpen ? '主观题交卷后对照参考答案自己给分。' : ''}</p>`;
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
        const wide = q.answer[0].length > 6 ? ' wide' : '';
        html += `<input class="fill-in${wide} ${qz.submitted ? (ok ? 'right' : 'wrong') : ''}" value="${esc(it.ans || '')}" placeholder="在这里填写答案"
          autocomplete="off" spellcheck="false" ${qz.submitted ? 'disabled' : ''}>`;
      }
      if (qz.submitted && q.type === 'open') {
        const total = q.points.reduce((a, x) => a + x.s, 0);
        const got = it.got.reduce((a, j) => a + q.points[j].s, 0);
        html += `<div class="explain"><div class="ref"><b>参考答案</b>${q.ref}</div>
          <div class="ref"><b>评分要点：答到哪点勾哪点</b>${q.points.map((x, j) => `<label class="pt-row"><input type="checkbox" data-j="${j}" ${it.got.includes(j) ? 'checked' : ''} ${qz.graded ? 'disabled' : ''}><span class="pt">${x.s} 分</span><span>${x.p}</span></label>`).join('')}
          <div class="pt-sum">自评：<b>${got}</b> / ${total} 分</div></div>${q.explain ? `<div class="ref-note">${q.explain}</div>` : ''}</div>`;
      } else if (qz.submitted) {
        const correct = q.type === 'choice' ? q.options[q.answer] : esc(q.answer[0]);
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
        const total = q.points.reduce((a, x) => a + x.s, 0);
        div.querySelector('.pt-sum').innerHTML = `自评：<b>${it.got.reduce((a, x) => a + q.points[x].s, 0)}</b> / ${total} 分`;
      }));
    });
    const sub = body.querySelector('#qSubmit');
    if (sub) sub.onclick = () => {
      const left = qz.items.filter(it => it.ans == null || String(it.ans).trim() === '').length;
      if (left) { body.querySelector('#qMsg').textContent = `还有 ${left} 题没作答哦。`; return; }
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
    return `<button class="item" data-go="${n.id}"><i class="dot st-${status(n.id)}"></i>${esc(n.title)}<small>${GRADE_NAME[n.grade]}</small></button>`;
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
    const data = { app: 'fjzk-chinese-map', version: 1, exported: new Date().toISOString(), progress, drafts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `语文学习进度-${new Date().toISOString().slice(0, 10)}.json`;
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
      if (!data || data.app !== 'fjzk-chinese-map' || typeof data.progress !== 'object') throw new Error('bad');
      if (!confirm('导入会覆盖这台设备上现有的进度，确定吗？')) return;
      progress = data.progress;
      save();
      if (data.drafts && typeof data.drafts === 'object') { drafts = data.drafts; saveDrafts(); }
      refreshNodes();
      if (selId) renderPanel();
      msg.textContent = '导入成功！';
    }).catch(() => { msg.textContent = '这个文件不是有效的进度文件。'; });
  };

  /* ================= 入门诊断（按知识图谱自适应） =================
     思路：测一个知识点（2–3 题）。通过 → 它的所有前置都算掌握；没通过 → 依赖它的后续都先算“未掌握”。
     每次挑“前后都还有很多未判断知识点”的那个来测，这样题量最少。 */
  const DIAG = 'fjzk-zh-diag-v1';
  const DIAG_MAX = 70;           // 第一轮最多题数
  const DIAG_MORE = 40;          // 每次“继续诊断”最多再测的题数
  let diag = null;
  try { diag = JSON.parse(localStorage.getItem(DIAG) || 'null'); } catch (e) { diag = null; }
  function saveDiag() { try { localStorage.setItem(DIAG, JSON.stringify(diag)); } catch (e) { /* 忽略 */ } }

  const ov = document.getElementById('overlay');
  const ovCard = document.getElementById('ovCard');
  function openOverlay() { ov.hidden = false; hidePopovers(); }
  function closeOverlay() { ov.hidden = true; if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  ov.addEventListener('click', e => { if (e.target === ov) closeOverlay(); });

  const descendants = (id, acc) => { dependents[id].forEach(d => { if (!acc.has(d)) { acc.add(d); descendants(d, acc); } }); return acc; };
  const diagPool = n => (n.tests || []).map((q, i) => i).filter(i => !n.tests[i].passage && n.tests[i].type !== 'open');
  function diagScope(grade) {
    return nodes.filter(n => n.grade <= grade && n.module !== 'xiezuo' && diagPool(n).length >= 2).map(n => n.id);
  }
  function diagNewSession(grade) {
    diag = { grade, scope: diagScope(grade), state: {}, asked: 0, right: 0, cur: null, done: false, started: Date.now() };
    diagNext();
  }
  function diagNext() {
    const unk = new Set(diag.scope.filter(id => !diag.state[id]));
    if (!unk.size || diag.asked >= (diag.max || DIAG_MAX)) { diag.cur = null; diag.done = true; saveDiag(); return; }
    let best = null, bestScore = -1, bestLinks = 0;
    unk.forEach(id => {
      const a = [...ancestors(id, new Set())].filter(x => unk.has(x)).length;
      const d = [...descendants(id, new Set())].filter(x => unk.has(x)).length;
      const n = byId[id];
      const score = Math.min(a, d) * 10 + (a + d) + n.freq * 0.1 + n.grade * 0.01;
      if (score > bestScore) { bestScore = score; best = id; bestLinks = a + d; }
    });
    // 和别的未判断知识点没有关联的，答对与否不影响其他判断，只测 1 题，省题量
    const pool = shuffle(diagPool(byId[best]));
    diag.cur = { id: best, qis: pool.slice(0, bestLinks ? 3 : 1), k: 0, results: [], order: null, ans: null, checked: false };
    diagPrepQ();
    saveDiag();
  }
  function diagPrepQ() {
    const c = diag.cur, q = byId[c.id].tests[c.qis[c.k]];
    c.order = q.type === 'choice' ? shuffle(q.options.map((o, j) => j)) : null;
    c.ans = null; c.checked = false;
  }
  // 一个知识点的判定：2 题全对 = 通过；2 题全错 = 未通过；一对一错再加 1 题定胜负
  function diagSettle() {
    const c = diag.cur, r = c.results, ok = r.filter(Boolean).length, bad = r.length - ok;
    let verdict = null;
    if (ok >= 2) verdict = 'pass';
    else if (bad >= 2) verdict = 'fail';
    else if (r.length >= c.qis.length) verdict = ok > bad ? 'pass' : 'fail';
    if (!verdict) { c.k++; diagPrepQ(); return; }
    diag.state[c.id] = verdict;
    const inScope = new Set(diag.scope);
    if (verdict === 'pass') ancestors(c.id, new Set()).forEach(a => { if (inScope.has(a) && !diag.state[a]) diag.state[a] = 'ipass'; });
    else descendants(c.id, new Set()).forEach(d => { if (inScope.has(d) && !diag.state[d]) diag.state[d] = 'ifail'; });
    diagNext();
  }
  // 结果写进学习进度（已经做过正式测试的知识点不覆盖）
  function diagApply() {
    Object.entries(diag.state).forEach(([id, v]) => {
      const p = progress[id] || (progress[id] = {});
      if (p.last != null) return;
      if (v === 'pass' || v === 'ipass') { p.diag = 'pass'; p.diagInferred = v === 'ipass'; }
      else if (v === 'fail') { p.diag = 'fail'; p.diagInferred = false; }
      else { delete p.diag; delete p.diagInferred; }
      p.diagAt = Date.now();
    });
    save();
    refreshNodes();
    if (selId) renderPanel();
  }

  function renderDiag() {
        if (diag && diag.done) { renderDiagReport(); return; }
    if (!diag) {
      ovCard.innerHTML = `
        <div class="ov-head"><h2>入门诊断</h2><button class="btn icon" data-close aria-label="关闭">✕</button></div>
        <p>做一套小测试，系统会自动判断哪些知识点你已经会了、哪些还要学，然后给你一条学习路线。</p>
        <ul class="small">
          <li>题目会根据你的答题情况自动调整：答对了就不再考更简单的，答错了就不再考更难的。</li>
          <li>第一轮最多 ${DIAG_MAX} 题，大约 30–45 分钟，可以随时暂停，下次接着做。语文知识点多，一轮测不完的话，报告里可以点“继续诊断”分几次测完。</li>
          <li>只考选择题和填空题；写作和阅读理解的主观题不在诊断里。</li>
          <li>不会的题不要瞎猜，点“不会，跳过”就行，这样诊断才准。</li>
        </ul>
        <p><b>你现在读几年级？</b>（会测到这个年级为止）</p>
        <div class="grade-pick">${GRADES.map(g => `<button class="btn" data-grade="${g}">${GRADE_NAME[g]}</button>`).join('')}</div>`;
      ovCard.querySelectorAll('[data-grade]').forEach(b => b.onclick = () => { diagNewSession(+b.dataset.grade); renderDiag(); });
      bindOvCommon();
      return;
    }
    const c = diag.cur, n = byId[c.id], q = n.tests[c.qis[c.k]];
    const judged = Object.keys(diag.state).length, total = diag.scope.length;
    const ok = c.checked && isRight(q, c.ans);
    let opts = '';
    if (q.type === 'choice') {
      opts = '<div class="opts">' + c.order.map((oi, j) => {
        let cls = 'opt';
        if (c.checked) { if (oi === q.answer) cls += ' right'; else if (oi === c.ans) cls += ' wrong'; }
        else if (oi === c.ans) cls += ' picked';
        return `<button class="${cls}" data-oi="${oi}" ${c.checked ? 'disabled' : ''}><b>${LETTERS[j]}.</b>${q.options[oi]}</button>`;
      }).join('') + '</div>';
    } else {
      opts = `<input class="fill-in ${c.checked ? (ok ? 'right' : 'wrong') : ''}" value="${esc(c.ans || '')}" placeholder="在这里填写答案"
        autocomplete="off" spellcheck="false" ${c.checked ? 'disabled' : ''}>`;
    }
    const correct = q.type === 'choice' ? q.options[q.answer] : esc(q.answer[0]);
    ovCard.innerHTML = `
      <div class="ov-head"><h2>入门诊断</h2><button class="btn" data-pause>暂停，下次继续</button></div>
      <div class="diag-meta"><span>第 ${diag.asked + (c.checked ? 0 : 1)} 题（本轮最多 ${diag.max || DIAG_MAX}）</span><span>已判断 ${judged} / ${total} 个知识点</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${total ? judged / total * 100 : 0}%"></div></div>
      <div class="q" style="margin-top:14px">
        <div class="tags" style="margin-bottom:8px"><span class="tag">${GRADE_NAME[n.grade]}</span><span class="tag" style="color:${modById[n.module].color}">${modById[n.module].name}</span></div>
        <div class="q-stem">${q.q}</div>${opts}
        ${c.checked ? `<div class="explain"><span class="mark ${ok ? 'ok' : 'no'}">${ok ? '✓ 正确' : '✗ 正确答案：' + correct}</span></div>` : ''}
      </div>
      <div class="quiz-foot">
        ${c.checked ? '<button class="btn primary" data-next>下一题 →</button>' : '<button class="btn primary" data-check>确定</button><button class="btn" data-skip>不会，跳过</button>'}
        <span class="quiz-msg" id="dMsg"></span>
        <button class="btn" data-finish style="margin-left:auto">现在结束，看报告</button>
      </div>`;
    ovCard.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      c.ans = +b.dataset.oi;
      ovCard.querySelectorAll('.opt').forEach(x => x.classList.toggle('picked', x === b));
    });
    const inp = ovCard.querySelector('.fill-in');
    if (inp && !c.checked) {
      inp.addEventListener('input', () => { c.ans = inp.value; });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') ovCard.querySelector('[data-check]').click(); });
      setTimeout(() => inp.focus(), 0);
    }
    const record = right => {
      c.checked = true;
      c.results.push(right);
      diag.asked++;
      if (right) diag.right++;
      saveDiag();
      renderDiag();
    };
    const chk = ovCard.querySelector('[data-check]');
    if (chk) chk.onclick = () => {
      if (c.ans == null || String(c.ans).trim() === '') { ovCard.querySelector('#dMsg').textContent = '先作答，或者点“不会，跳过”。'; return; }
      record(isRight(q, c.ans));
    };
    const skip = ovCard.querySelector('[data-skip]');
    if (skip) skip.onclick = () => { c.ans = null; record(false); };
    const nx = ovCard.querySelector('[data-next]');
    if (nx) nx.onclick = () => { diagSettle(); saveDiag(); renderDiag(); };
    ovCard.querySelector('[data-pause]').onclick = closeOverlay;
    ovCard.querySelector('[data-finish]').onclick = () => {
      if (!confirm('现在结束的话，还没测到的知识点会标记为“未测”。确定结束吗？')) return;
      diag.done = true; diag.cur = null; saveDiag(); renderDiag();
    };
  }

  function bindOvCommon() {
    ovCard.querySelectorAll('[data-close]').forEach(b => b.onclick = closeOverlay);
    ovCard.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { closeOverlay(); openNode(b.dataset.go); });
  }

  function renderDiagReport() {
    if (!diag.applied) { diagApply(); diag.applied = true; saveDiag(); }
    const scope = diag.scope.map(id => byId[id]);
    const cnt = { pass: 0, fail: 0, untested: 0 };
    const byModule = {};
    scope.forEach(n => {
      const v = diag.state[n.id];
      const k = v === 'pass' || v === 'ipass' ? 'pass' : v === 'fail' || v === 'ifail' ? 'fail' : 'untested';
      cnt[k]++;
      const m = byModule[n.module] || (byModule[n.module] = { pass: 0, fail: 0, untested: 0 });
      m[k]++;
    });
    const weakDirect = scope.filter(n => diag.state[n.id] === 'fail');
    const pct = diag.asked ? Math.round(diag.right / diag.asked * 100) : 0;
    const bars = KG.modules.filter(m => byModule[m.id]).map(m => {
      const b = byModule[m.id], t = b.pass + b.fail + b.untested;
      return `<div class="mbar"><span class="mname"><i style="background:${m.color}"></i>${m.name}</span>
        <div class="mtrack"><div class="seg pass" style="width:${b.pass / t * 100}%"></div><div class="seg fail" style="width:${b.fail / t * 100}%"></div></div>
        <span class="mnum">${b.pass} / ${t}</span></div>`;
    }).join('');
    const path = learningPath().slice(0, 8);
    ovCard.innerHTML = `
      <div class="ov-head"><h2>诊断报告</h2><button class="btn icon" data-close aria-label="关闭">✕</button></div>
      <div class="report-top">
        <div><div class="big ok">${cnt.pass}</div><div class="muted">个知识点已掌握</div></div>
        <div><div class="big weak">${cnt.fail}</div><div class="muted">个需要学或加强</div></div>
        <div><div class="big">${diag.asked}</div><div class="muted">道题，答对 ${pct}%</div></div>
      </div>
      <p class="muted small">诊断范围：四年级到${GRADE_NAME[diag.grade]}的 ${scope.length} 个知识点（写作不在诊断里，靠写作练习；阅读理解的主观题也不在诊断里）。${cnt.untested ? `还有 ${cnt.untested} 个没测到。` : ''}“已掌握”里有一部分是根据答对了更难的知识点推断出来的；学的时候如果觉得不熟，做一次测试就会按测试结果更新。</p>
      <h3>各模块掌握情况</h3>
      <div class="legend-row"><span><i class="dot st-mastered"></i>已掌握</span><span><i class="dot st-weak fillbad"></i>需要学</span><span><i class="dot st-new"></i>未测</span></div>
      ${bars}
      ${weakDirect.length ? `<h3>重点补的薄弱点（直接测出来的）</h3><div class="rel-row">${relButtons(weakDirect.map(n => n.id))}</div>` : ''}
      <h3>建议先学这些</h3>
      ${path.length ? `<ol class="path-list">${path.map(pathItem).join('')}</ol>` : '<p>诊断范围内的知识点都掌握了！可以继续往高年级学，或者多做写作练习。</p>'}
      <div class="quiz-foot">
        ${cnt.untested ? `<button class="btn primary" data-more>继续诊断（再测最多 ${DIAG_MORE} 题）</button>` : ''}
        <button class="btn ${cnt.untested ? '' : 'primary'}" data-path>查看完整学习路线</button>
        <button class="btn" data-close>回到图谱</button>
        <button class="btn" data-redo style="margin-left:auto">重新诊断</button>
      </div>`;
    ovCard.querySelector('[data-path]').onclick = renderPath;
    // 语文知识点之间的前后关联少（古诗、名著、文化常识多是独立的点），一轮测不完就分几次继续
    const more = ovCard.querySelector('[data-more]');
    if (more) more.onclick = () => {
      diag.max = diag.asked + DIAG_MORE;
      diag.done = false; diag.applied = false;
      diagNext(); renderDiag();
    };
    ovCard.querySelector('[data-redo]').onclick = () => {
      if (!confirm('重新诊断会清掉上次诊断的结论（正式测试的成绩不受影响）。确定吗？')) return;
      Object.values(progress).forEach(p => { delete p.diag; delete p.diagInferred; delete p.diagAt; });
      save(); refreshNodes();
      diag = null; saveDiag(); renderDiag();
    };
    bindOvCommon();
  }

  /* ================= 学习路线 =================
     把没掌握的知识点排成一条线：前置一定排在前面；同时可学的，先补薄弱的、再按年级从低到高、考频高的优先。 */
  function learningPath() {
    const placed = new Set(nodes.filter(n => status(n.id) === 'mastered').map(n => n.id));
    const todo = nodes.filter(n => !placed.has(n.id));
    const out = [];
    const rank = n => [status(n.id) === 'weak' ? 0 : 1, n.grade, -(n.freq || 1), n._i];
    const cmp = (a, b) => { const x = rank(a), y = rank(b); for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
    while (out.length < todo.length) {
      const ready = todo.filter(n => !placed.has(n.id) && n.prereqs.every(p => placed.has(p))).sort(cmp);
      if (!ready.length) { todo.filter(n => !placed.has(n.id)).forEach(n => { out.push(n); placed.add(n.id); }); break; }
      out.push(ready[0]);
      placed.add(ready[0].id);
    }
    return out;
  }
  // 诊断范围内、但因为题量上限没测到的知识点
  const untestedInDiag = n => diag && diag.done && diag.scope.includes(n.id) && !diag.state[n.id] && !(progress[n.id] || {}).last;
  function pathItem(n) {
    const st = status(n.id);
    return `<li><button class="item" data-go="${n.id}"><i class="dot st-${st}"></i><span>${esc(n.title)}</span>
      <small>${GRADE_NAME[n.grade]} · ${modById[n.module].name}${st === 'weak' ? ' · 需加强' : untestedInDiag(n) ? ' · 诊断未测，会的话直接做测试' : ''}</small></button></li>`;
  }
  function renderPath() {
        const path = learningPath();
    const done = nodes.length - path.length;
    let html = '';
    path.forEach((n, i) => {
      if (i % 5 === 0) html += `${i ? '</ol>' : ''}<h3>第 ${i / 5 + 1} 段${i === 0 ? '（现在就学）' : ''}</h3><ol class="path-list" start="${i + 1}">`;
      html += pathItem(n);
    });
    if (path.length) html += '</ol>';
    ovCard.innerHTML = `
      <div class="ov-head"><h2>我的学习路线</h2><button class="btn icon" data-close aria-label="关闭">✕</button></div>
      <p class="muted">已掌握 ${done} / ${nodes.length}。按顺序往下学：每一项的前置知识都排在它前面，需要加强的会优先安排。每段 5 个，建议一周学完一段。点任意一项开始学。</p>
      ${!diag || !diag.done ? '<div class="tipbox">还没做完入门诊断？先做一次，路线会更准。<button class="btn" data-diag style="margin-left:8px">去做诊断</button></div>' : ''}
      ${path.length ? html : '<p>全部知识点都掌握了！🎉</p>'}`;
    const d = ovCard.querySelector('[data-diag]');
    if (d) d.onclick = renderDiag;
    bindOvCommon();
  }

  document.getElementById('btnDiag').onclick = e => { e.stopPropagation(); openOverlay(); renderDiag(); };
  document.getElementById('btnPath').onclick = e => { e.stopPropagation(); openOverlay(); renderPath(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !ov.hidden) { e.stopImmediatePropagation(); closeOverlay(); } }, true);

  /* ---------------- 启动 ---------------- */
  layout();
  drawGraph();
  drawChips();
  refreshNodes();
  // 知识点多了以后整张图缩到一屏字会太小，启动时保证可读
  zoom = Math.max(0.8, Math.min(1.1, Math.min(wrap.clientWidth / W, wrap.clientHeight / H)));
  applyZoom();
})();
