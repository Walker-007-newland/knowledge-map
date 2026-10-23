/* 单词听写：手动输入词单 → 随机听写 → 批改 → 错词本
 * （拍照识别 2026-10 去掉了：手写识别率不够，模型又让 APK 大很多）
 * 在平板 App 里，这一页走 https://appassets.androidplatform.net/ 虚拟地址，词单存在这个地址自己的 localStorage 里，
 * 和图谱进度分开；已有的词单都在那里，所以地址不能改回 file://。 */
(function () {
  'use strict';
  const STORE = 'fjzk-en-dictation-v1';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const inApp = !!(window.KMApp && KMApp.goBack);

  /* ---------------- 数据 ---------------- */
  const DEFAULTS = { scope: 'all', mode: 'paper', read: 'en', reps: '2', pace: 'normal', order: 'random', someN: 10 };
  let db;
  try { db = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { db = null; }
  if (!db || !Array.isArray(db.lists)) db = { lists: [], settings: {} };
  db.settings = Object.assign({}, DEFAULTS, db.settings);
  function save() { try { localStorage.setItem(STORE, JSON.stringify(db)); } catch (e) { /* 存储不可用时只在本次有效 */ } }
  const findList = id => db.lists.find(l => l.id === id);
  const keyOf = en => en.toLowerCase().replace(/\s+/g, ' ').trim();

  /* ---------------- 页面切换（配合返回键） ---------------- */
  const VIEWS = ['vList', 'vEdit', 'vSetup', 'vRun', 'vCheck', 'vResult'];
  const TITLES = { vList: '单词听写', vEdit: '编辑词单', vSetup: '听写设置', vRun: '听写中', vCheck: '批改', vResult: '听写结果' };
  let current = 'vList';
  function show(v, push = true) {
    current = v;
    VIEWS.forEach(id => { document.getElementById(id).hidden = id !== v; });
    $('#title').textContent = TITLES[v];
    $('#subtitle').hidden = v !== 'vList';
    if (push) history.pushState({ v }, '', '#' + v.slice(1).toLowerCase());
    window.scrollTo(0, 0);
    DictRun.keepAwake(v === 'vRun');
  }
  history.replaceState({ v: 'vList' }, '', location.pathname + location.search);
  window.addEventListener('popstate', e => {
    const to = (e.state && e.state.v) || 'vList';
    if (current === 'vRun' && runner.isRunning()) {
      if (!confirm('要结束这次听写吗？')) { history.pushState({ v: 'vRun' }, '', '#run'); return; }
      runner.stopRun();
    }
    if (current === 'vEdit' && editDirty && to !== 'vEdit' && !confirm('修改的内容还没保存，确定离开吗？')) {
      history.pushState({ v: 'vEdit' }, '', '#edit'); return;
    }
    // 听写/批改中途不能靠返回键回去重来，统一回到词单
    if (to === 'vRun' || to === 'vCheck') { show('vList', false); renderLists(); return; }
    show(to, false);
    if (to === 'vList') renderLists();
  });
  $('#btnBack').onclick = () => {
    if (current !== 'vList') { history.back(); return; }
    if (inApp) KMApp.goBack();
    else if (history.length > 1) history.back();
    else location.href = 'index.html';
  };

  /* ---------------- 词单列表 ---------------- */
  function renderLists() {
    const box = $('#lists');
    $('#listsEmpty').hidden = db.lists.length > 0;
    box.innerHTML = db.lists.map(l => {
      const nWrong = Object.keys(l.wrong || {}).length;
      const last = (l.history || [])[l.history.length - 1];
      const lastTxt = last ? `上次 ${last.correct}/${last.total}（${new Date(last.at).toLocaleDateString()}）` : '还没听写过';
      return `<div class="card list-card" data-id="${l.id}">
        <div class="info"><div class="name">${esc(l.name)}</div>
          <div class="meta">${l.words.length} 个词 · ${lastTxt}${nWrong ? ` · <span class="bad">错词 ${nWrong} 个</span>` : ''}</div></div>
        <button class="btn" data-act="del">删除</button>
        <button class="btn" data-act="edit">编辑</button>
        <button class="btn primary" data-act="go">开始听写</button>
      </div>`;
    }).join('');
  }
  $('#lists').addEventListener('click', e => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const l = findList(b.closest('[data-id]').dataset.id);
    if (!l) return;
    if (b.dataset.act === 'go') openSetup(l);
    else if (b.dataset.act === 'edit') openEdit(l);
    else if (b.dataset.act === 'del' && confirm(`删除词单“${l.name}”？`)) {
      db.lists = db.lists.filter(x => x !== l); save(); renderLists();
    }
  });
  $('#btnNewManual').onclick = () => { openEdit(null); addRow({ en: '', zh: '', on: true }, true); };

  /* ---------------- 编辑词单 ---------------- */
  let editing = null, rows = [], editDirty = false;
  function openEdit(list) {
    editing = list;
    rows = list ? list.words.map(w => ({ en: w.en, zh: w.zh || '', on: true })) : [];
    editDirty = false;
    $('#listName').value = list ? list.name : defaultName();
    renderRows();
    show('vEdit');
  }
  function defaultName() {
    const d = new Date();
    return `词单 ${d.getMonth() + 1}月${d.getDate()}日`;
  }
  function renderRows() {
    $('#wordRows').innerHTML = rows.map((r, i) => `<div class="wrow${r.on ? '' : ' off'}" data-i="${i}">
      <input type="checkbox" ${r.on ? 'checked' : ''} aria-label="选用">
      <input type="text" class="en" value="${esc(r.en)}" placeholder="英文" autocapitalize="off" autocorrect="off" spellcheck="false">
      <input type="text" class="zh" value="${esc(r.zh)}" placeholder="中文释义（可不填）">
      <button class="btn icon" data-act="say" aria-label="试听">🔊</button>
      <button class="btn icon" data-act="del" aria-label="删除">✕</button>
    </div>`).join('');
    updateCount();
  }
  function updateCount() {
    const n = rows.filter(r => r.on && r.en.trim()).length;
    $('#wordCount').textContent = `已选 ${n} 个词` + (rows.length > n ? `（共 ${rows.length} 行）` : '');
  }
  function addRow(r, focus) {
    rows.push(r); editDirty = true; renderRows();
    if (focus) { const ins = document.querySelectorAll('#wordRows .wrow:last-child input.en'); if (ins[0]) ins[0].focus(); }
  }
  $('#wordRows').addEventListener('input', e => {
    const row = e.target.closest('.wrow'); if (!row) return;
    const r = rows[+row.dataset.i];
    if (e.target.classList.contains('en')) r.en = e.target.value;
    else if (e.target.classList.contains('zh')) r.zh = e.target.value;
    editDirty = true; updateCount();
  });
  $('#wordRows').addEventListener('change', e => {
    if (e.target.type !== 'checkbox') return;
    const row = e.target.closest('.wrow');
    rows[+row.dataset.i].on = e.target.checked;
    row.classList.toggle('off', !e.target.checked);
    editDirty = true; updateCount();
  });
  $('#wordRows').addEventListener('click', e => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const i = +b.closest('.wrow').dataset.i;
    if (b.dataset.act === 'del') { rows.splice(i, 1); editDirty = true; renderRows(); }
    else if (b.dataset.act === 'say') DictRun.say([{ text: rows[i].en, lang: 'en-US' }]);
  });
  $('#btnAddRow').onclick = () => addRow({ en: '', zh: '', on: true }, true);
  $('#btnCheckAll').onclick = () => { rows.forEach(r => { r.on = true; }); renderRows(); };
  $('#btnCheckNone').onclick = () => { rows.forEach(r => { r.on = false; }); renderRows(); };
  $('#btnEditCancel').onclick = () => history.back();
  $('#btnEditSave').onclick = () => {
    const words = [], seen = new Set();
    rows.forEach(r => {
      const en = r.en.trim().replace(/\s+/g, ' ');
      if (!r.on || !en || seen.has(keyOf(en))) return;
      seen.add(keyOf(en));
      words.push({ en, zh: r.zh.trim() });
    });
    if (!words.length) { alert('还没有选中任何单词。'); return; }
    const name = $('#listName').value.trim() || defaultName();
    if (editing) {
      editing.name = name; editing.words = words;
      const keep = new Set(words.map(w => keyOf(w.en)));
      Object.keys(editing.wrong || {}).forEach(k => { if (!keep.has(k)) delete editing.wrong[k]; });
    } else {
      editing = { id: 'L' + Date.now().toString(36), name, words, wrong: {}, history: [], created: Date.now() };
      db.lists.unshift(editing);
    }
    save();
    editDirty = false;
    openSetup(editing, true);             // 编辑页换成设置页，返回键直接回词单
  };

  /* ---------------- 听写设置 → 听写 → 批改 → 结果（共用模块 dict-run.js） ---------------- */
  const runner = DictRun.create({
    settings: db.settings,
    save,
    show: (v, push) => show(v, push),
    current: () => current,
    wrongCount: l => Object.keys(l.wrong || {}).length,
    isWrong: (l, k) => !!(l.wrong || {})[k],
    record(l, rows, scope) {
      l.wrong = l.wrong || {};
      l.history = l.history || [];
      let correct = 0;
      rows.forEach(({ w, wrong }) => {
        const k = keyOf(w.en);
        if (wrong) l.wrong[k] = (l.wrong[k] || 0) + 1;
        else { correct++; delete l.wrong[k]; }       // 这次写对了就移出错词本
      });
      l.history.push({ at: Date.now(), total: rows.length, correct, scope });
      if (l.history.length > 50) l.history.splice(0, l.history.length - 50);
      save();
    },
    onBack: () => { show('vList'); renderLists(); }
  });
  const openSetup = runner.openSetup;

  /* ---------------- 启动 ---------------- */
  renderLists();
  show('vList', false);
})();
