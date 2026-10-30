/* 生字词听写：内置课本生字词表，选 年级 → 册 → 单元 / 课 后听写（流程见 tingxie-run.js）、错词本
 * 词表：data/tingxie/books.js（册目录）+ data/tingxie/<册id>.js（一册的词，选中时用 <script> 动态加载，file:// 下可用）
 * 存储（图谱页的 localStorage，纳入「我的数据」导出导入与设备同步，合并规则同英语单元单词，见 hub/km-data.js joinWord）：
 *   fjzk-zh-tingxie-v1      逐词记录 { "<词语>": { r, rt, w: {设备: 写错次数}, n: {设备: 听写次数} } }
 *                           r：最近一次听写对 1 / 错 0（r=0 即在错词本，写对一次就移出），rt：时间；同一个词出现在多课 / 多册只记一份
 *   fjzk-zh-tingxie-set-v1  年级、册、各册勾选的课、听写设置 */
(function () {
  'use strict';
  const STORE = 'fjzk-zh-tingxie-v1', SETS = 'fjzk-zh-tingxie-set-v1';
  const $ = s => document.querySelector(s);
  const TR = window.TingxieRun, esc = TR.esc, keyOf = TR.keyOf;
  const inApp = !!(window.KMApp && KMApp.goBack);
  const GRADES = [3, 4, 5, 6, 7, 8, 9];
  const CN = { 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' };
  const KT = window.KT;

  /* ---------------- 存储 ---------------- */
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  function readJSON(k) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return isObj(v) ? v : null; } catch (e) { return null; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 存储不可用时只在本次有效 */ } }
  const DICT_DEFAULTS = { scope: 'all', mode: 'paper', reps: '2', pace: 'normal', order: 'random', someN: 10 };
  let S = readJSON(SETS) || {};
  S = Object.assign({ grade: 4, term: '上', sel: {} }, S);
  S.dict = Object.assign({}, DICT_DEFAULTS, isObj(S.dict) ? S.dict : {});
  if (!isObj(S.sel)) S.sel = {};
  function saveSet() { writeJSON(SETS, S); }
  // 逐词记录：每次读最新的（设备同步、导入可能在别处改过）
  let recCache = null;
  function recs() { if (!recCache) recCache = readJSON(STORE) || {}; return recCache; }
  function rec(key) { const r = recs()[key]; return isObj(r) ? r : null; }
  function updateRecs(fn) { recCache = null; const all = recs(); fn(all); writeJSON(STORE, all); }
  function devId() { try { return window.KMData ? KMData.device().id : 'web'; } catch (e) { return 'web'; } }
  const inWrong = key => { const r = rec(key); return !!(r && r.r === 0); };
  const wrongTimes = key => { const r = rec(key); return r && isObj(r.w) ? Object.keys(r.w).reduce((s, d) => s + (+r.w[d] || 0), 0) : 0; };
  // 页面回到前台、别的页面写过：丢掉缓存重新读
  window.addEventListener('pageshow', () => { recCache = null; if (current === 'vHome') renderHome(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { recCache = null; if (current === 'vHome') renderHome(); } });

  /* ---------------- 词表加载 ---------------- */
  const loading = {};
  function loadBook(id) {
    if (KT.words[id]) return Promise.resolve(KT.words[id]);
    if (loading[id]) return loading[id];
    loading[id] = new Promise((ok, bad) => {
      const s = document.createElement('script');
      s.src = 'data/tingxie/' + id + '.js';
      s.onload = () => KT.words[id] ? ok(KT.words[id]) : bad(new Error('词表文件没有内容：' + id));
      s.onerror = () => { delete loading[id]; bad(new Error('词表加载失败：' + id)); };
      document.head.appendChild(s);
    });
    return loading[id];
  }
  const loadAll = () => Promise.all(KT.books.map(b => loadBook(b.id)));
  const shortName = b => CN[b.grade] + b.term;          // 四上
  const isGarden = l => l.type === 'garden';
  const lessonLabel = l => isGarden(l) ? (l.name || '语文园地') : (l.no != null ? l.no + ' ' : '') + l.name;
  const allLessons = b => b.units.reduce((a, u) => a.concat(u.lessons || []), []);
  function lessonOf(b, kid) { for (const u of b.units) { const l = (u.lessons || []).find(x => x.id === kid); if (l) return { u, l }; } return null; }
  // 选中的课里的词，按课本顺序；带上 key
  function wordsOf(b, kids) {
    const set = new Set(kids);
    return (KT.words[b.id] || []).filter(w => set.has(w.k)).map(w => Object.assign({ key: keyOf(w.w) }, w));
  }
  // 去重（同一个词在所选的几课里都有，只听写一次）
  function dedupe(words) {
    const seen = new Set();
    return words.filter(w => !seen.has(w.key) && seen.add(w.key));
  }

  /* ---------------- 页面切换（配合返回键） ---------------- */
  const VIEWS = ['vHome', 'vWrong', 'vSetup', 'vRun', 'vCheck', 'vResult'];
  const TITLES = { vHome: '生字词听写', vWrong: '错词本', vSetup: '听写设置', vRun: '听写中', vCheck: '批改', vResult: '听写结果' };
  let current = 'vHome';
  function show(v, push = true) {
    current = v;
    VIEWS.forEach(id => { document.getElementById(id).hidden = id !== v; });
    $('#title').textContent = TITLES[v];
    $('#subtitle').hidden = v !== 'vHome';
    document.body.classList.toggle('on-home', v === 'vHome');
    if (push) history.pushState({ v }, '', '#' + v.slice(1).toLowerCase());
    window.scrollTo(0, 0);
    TR.keepAwake(v === 'vRun');
  }
  history.replaceState({ v: 'vHome' }, '', location.pathname + location.search);
  window.addEventListener('popstate', e => {
    const to = (e.state && e.state.v) || 'vHome';
    if (current === 'vRun' && runner.isRunning()) {
      if (!confirm('要结束这次听写吗？')) { history.pushState({ v: 'vRun' }, '', '#run'); return; }
      runner.stopRun();
    }
    // 听写 / 批改中途不能靠返回键回去重来，统一回到单元
    if (to === 'vRun' || to === 'vCheck') { show('vHome', false); renderHome(); return; }
    show(to, false);
    if (to === 'vHome') renderHome();
    else if (to === 'vWrong') renderWrong();
  });
  $('#btnBack').onclick = () => {
    if (current !== 'vHome') { history.back(); return; }
    if (inApp) KMApp.goBack();
    else if (history.length > 1) history.back();
    else location.href = 'index.html';
  };
  let toastTimer = 0;
  function toast(t) {
    const el = $('#toast');
    el.textContent = t; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
  }

  /* ---------------- 选单元、选课 ---------------- */
  const opened = new Set();     // 展开的单元（册id/单元id），只在本次有效
  function gradesWithData() { return new Set(KT.books.map(b => b.grade)); }
  function currentBook() {
    const list = KT.books.filter(b => b.grade === S.grade);
    return list.find(b => b.term === S.term) || list[0] || null;
  }
  function selOf(b) {
    const ids = new Set(allLessons(b).map(l => l.id));
    return Array.isArray(S.sel[b.id]) ? S.sel[b.id].filter(k => ids.has(k)) : [];
  }
  function setSel(b, set) { S.sel[b.id] = allLessons(b).map(l => l.id).filter(id => set.has(id)); saveSet(); }
  function renderHome() {
    const has = gradesWithData();
    if (!has.has(S.grade) && KT.books.length) S.grade = KT.books[0].grade;
    $('#grades').innerHTML = GRADES.map(g => `<button class="grade${g === S.grade ? ' on' : ''}${has.has(g) ? '' : ' off'}" data-g="${g}" role="tab" aria-selected="${g === S.grade}">${CN[g]}<span class="g-suffix">年级</span></button>`).join('');
    const b = currentBook();
    if (!b) {
      $('#terms').querySelectorAll('button').forEach(x => { x.classList.remove('on'); x.disabled = true; });
      $('#bookName').textContent = '';
      $('#bookUnchecked').hidden = true;
      $('#bookSrc').textContent = '';
      $('#chkAll').disabled = true;
      $('#units').innerHTML = '<p class="empty">生字词表还在整理。</p>';
      updateBar(null);
      return;
    }
    S.term = b.term;
    $('#chkAll').disabled = false;
    const terms = new Set(KT.books.filter(x => x.grade === S.grade).map(x => x.term));
    $('#terms').querySelectorAll('button').forEach(x => { x.classList.toggle('on', x.dataset.t === b.term); x.disabled = !terms.has(x.dataset.t); });
    $('#bookName').textContent = [b.pub, b.ed].filter(Boolean).join(' · ');
    $('#bookUnchecked').hidden = !!b.checked;
    $('#bookSrc').textContent = b.src ? '词表来源：' + b.src : '';
    if (!KT.words[b.id]) {
      $('#units').innerHTML = '';
      $('#unitsLoading').hidden = false;
      loadBook(b.id).then(() => { if (currentBook() === b) renderHome(); })
        .catch(err => { $('#unitsLoading').textContent = '词表载入失败：' + err.message; });
      updateBar(b);
      return;
    }
    $('#unitsLoading').hidden = true;
    const sel = new Set(selOf(b));
    $('#units').innerHTML = b.units.map(u => {
      const ls = u.lessons || [];
      const nSel = ls.filter(l => sel.has(l.id)).length;
      const uw = dedupe(wordsOf(b, ls.map(l => l.id)));
      const uWrong = uw.filter(w => inWrong(w.key)).length;
      const open = opened.has(b.id + '/' + u.id);
      const nLesson = ls.filter(l => !isGarden(l)).length;
      return `<div class="unit${nSel ? ' on' : ''}" data-u="${esc(u.id)}">
        <div class="u-head">
          <input type="checkbox" class="u-chk" aria-label="选中${esc(u.name)}全部课" ${nSel && nSel === ls.length ? 'checked' : ''} data-half="${nSel > 0 && nSel < ls.length ? 1 : 0}">
          <button class="u-tog" aria-expanded="${open}"><span class="u-name">${esc(u.name)}<small>${nLesson} 课 · ${uw.length} 词${nSel ? ` · 已选 ${nSel}` : ''}</small></span>
            <span class="u-wrong${uWrong ? ' bad' : ''}">${uWrong ? '错词 ' + uWrong : ''}</span><span class="u-arrow">${open ? '▾' : '▸'}</span></button>
        </div>
        <div class="lessons"${open ? '' : ' hidden'}>${ls.map(l => {
          const ws = dedupe(wordsOf(b, [l.id]));
          const nw = ws.filter(w => inWrong(w.key)).length;
          return `<label class="lesson${sel.has(l.id) ? ' on' : ''}${isGarden(l) ? ' garden' : ''}" data-k="${esc(l.id)}">
            <input type="checkbox" ${sel.has(l.id) ? 'checked' : ''}>
            <span class="l-no">${isGarden(l) ? '' : esc(l.no != null ? l.no : '')}</span>
            <span class="l-name">${esc(isGarden(l) ? (l.name || '语文园地') : l.name)}</span>
            <span class="l-n">${ws.length} 词</span>
            <span class="l-wrong${nw ? ' bad' : ''}">${nw ? '错 ' + nw : '错 0'}</span>
          </label>`;
        }).join('')}</div>
      </div>`;
    }).join('');
    // 半选状态只能用脚本设
    $('#units').querySelectorAll('.u-chk').forEach(c => { c.indeterminate = c.dataset.half === '1'; });
    const nAll = allLessons(b).length;
    $('#chkAll').checked = nAll > 0 && sel.size === nAll;
    $('#chkAll').indeterminate = sel.size > 0 && sel.size < nAll;
    updateBar(b);
  }
  function updateBar(b) {
    const sel = b ? selOf(b) : [];
    const ready = b && KT.words[b.id];
    const m = ready ? dedupe(wordsOf(b, sel)).length : 0;
    $('#selInfo').textContent = sel.length ? `已选 ${sel.length} 课 · ${m} 个词` : '先勾选要听写的课';
    $('#btnDict').disabled = !sel.length || !m;
    updateAllWrong();
  }
  // 全部错词数：要把所有册都载入才算得出，后台慢慢载
  function updateAllWrong() {
    const n = KT.books.every(b => KT.words[b.id]) ? allWrongWords().length : null;
    $('#btnWrong').textContent = n ? `错词本（${n}）` : '错词本';
    if (n === null) loadAll().then(() => { if (current === 'vHome') updateAllWrong(); }).catch(() => {});
  }
  function allWrongWords() {
    const out = [], seen = new Set();
    KT.books.forEach(b => dedupe(wordsOf(b, allLessons(b).map(l => l.id))).forEach(w => {
      if (seen.has(w.key) || !inWrong(w.key)) return;
      seen.add(w.key); out.push(w);
    }));
    return out;
  }
  $('#grades').addEventListener('click', e => {
    const btn = e.target.closest('button[data-g]'); if (!btn) return;
    const g = +btn.dataset.g;
    if (!gradesWithData().has(g)) { toast(CN[g] + '年级的生字词表还在整理'); return; }
    S.grade = g; saveSet(); renderHome();
  });
  $('#terms').addEventListener('click', e => {
    const btn = e.target.closest('button[data-t]'); if (!btn || btn.disabled) return;
    S.term = btn.dataset.t; saveSet(); renderHome();
  });
  $('#units').addEventListener('click', e => {
    const tog = e.target.closest('.u-tog'); if (!tog) return;
    const b = currentBook(), id = b.id + '/' + tog.closest('.unit').dataset.u;
    if (opened.has(id)) opened.delete(id); else opened.add(id);
    renderHome();
  });
  $('#units').addEventListener('change', e => {
    const b = currentBook(); if (!b) return;
    const sel = new Set(selOf(b));
    const unitEl = e.target.closest('.unit');
    if (e.target.classList.contains('u-chk')) {
      // 单元复选框：选中 / 取消整单元所有课（半选时点一下 = 全选）
      const u = b.units.find(x => x.id === unitEl.dataset.u);
      (u.lessons || []).forEach(l => { if (e.target.checked) sel.add(l.id); else sel.delete(l.id); });
    } else {
      const row = e.target.closest('.lesson'); if (!row) return;
      if (e.target.checked) sel.add(row.dataset.k); else sel.delete(row.dataset.k);
    }
    setSel(b, sel);
    renderHome();
  });
  $('#chkAll').onchange = e => {
    const b = currentBook(); if (!b) return;
    setSel(b, new Set(e.target.checked ? allLessons(b).map(l => l.id) : []));
    renderHome();
  };
  // 选中范围的名字：整单元写单元名，否则写课题；整册写「全册」
  function selName(b, sel) {
    const set = new Set(sel), parts = [];
    let whole = true;
    b.units.forEach(u => {
      const ls = u.lessons || [];
      const picked = ls.filter(l => set.has(l.id));
      if (picked.length !== ls.length) whole = false;
      if (picked.length && picked.length === ls.length) parts.push(u.name);
      else picked.forEach(l => parts.push(isGarden(l) ? u.name + '语文园地' : l.name));
    });
    if (whole) return shortName(b) + ' 全册';
    return shortName(b) + ' ' + (parts.length > 4 ? parts.slice(0, 4).join('、') + ' 等' : parts.join('、'));
  }
  $('#btnDict').onclick = () => {
    const b = currentBook(); if (!b || !KT.words[b.id]) return;
    const sel = selOf(b), words = dedupe(wordsOf(b, sel));
    if (words.length) runner.openSetup({ name: selName(b, sel) + '（' + words.length + ' 个词）', words });
  };
  $('#btnWrong').onclick = () => {
    loadAll().then(() => { renderWrong(); show('vWrong'); }).catch(err => toast(err.message));
  };

  /* ---------------- 错词本：按册、按课 ---------------- */
  let wrongList = [], wrongByBook = {};
  function renderWrong() {
    const seen = new Set();
    wrongList = []; wrongByBook = {};
    const html = KT.books.map(b => {
      const bookWords = [];
      const inner = b.units.map(u => (u.lessons || []).map(l => {
        const ws = dedupe(wordsOf(b, [l.id])).filter(w => inWrong(w.key) && !seen.has(w.key));
        if (!ws.length) return '';
        ws.forEach(w => seen.add(w.key));
        bookWords.push(...ws);
        return `<h4 class="w-lesson">${esc(u.name)} · ${esc(lessonLabel(l))}</h4>` + ws.map(w => `<div class="w-row">
          <b>${esc(w.w)}</b><span class="w-n">错过 ${wrongTimes(w.key)} 次</span>
          <button class="btn icon" data-say="${esc(w.say || w.w)}" aria-label="读">🔊</button></div>`).join('');
      }).join('')).join('');
      if (!bookWords.length) return '';
      wrongByBook[b.id] = bookWords;
      wrongList.push(...bookWords);
      return `<div class="w-book"><div class="w-book-head"><h3>${esc(shortName(b))}册 <small>${bookWords.length} 个</small></h3>
        <button class="btn" data-dict="${esc(b.id)}">听写这一册的错词</button></div>${inner}</div>`;
    }).join('');
    $('#wrongRows').innerHTML = html;
    $('#wrongEmpty').hidden = wrongList.length > 0;
    $('#btnWrongDict').disabled = !wrongList.length;
  }
  $('#wrongRows').addEventListener('click', e => {
    const s = e.target.closest('button[data-say]'); if (s) { TR.say([s.dataset.say]); return; }
    const d = e.target.closest('button[data-dict]');
    if (d) {
      const b = KT.books.find(x => x.id === d.dataset.dict), ws = wrongByBook[d.dataset.dict] || [];
      if (b && ws.length) runner.openSetup({ name: shortName(b) + '册错词（' + ws.length + ' 个）', words: ws.slice() });
    }
  });
  $('#btnWrongDict').onclick = () => { if (wrongList.length) runner.openSetup({ name: '全部错词（' + wrongList.length + ' 个）', words: wrongList.slice() }); };

  /* ---------------- 听写（tingxie-run.js） ---------------- */
  const runner = TR.create({
    settings: S.dict,
    save: saveSet,
    show: (v, push) => show(v, push),
    current: () => current,
    wrongCount: src => src.words.filter(w => inWrong(w.key)).length,
    isWrong: key => inWrong(key),
    record(src, rows) {
      const now = Date.now(), me = devId();
      updateRecs(all => rows.forEach(({ w, wrong }) => {
        const e = isObj(all[w.key]) ? all[w.key] : {};
        e.r = wrong ? 0 : 1; e.rt = now;           // r=0 在错词本；写对一次就移出
        e.n = isObj(e.n) ? e.n : {}; e.n[me] = (+e.n[me] || 0) + 1;
        e.w = isObj(e.w) ? e.w : {}; if (wrong) e.w[me] = (+e.w[me] || 0) + 1;
        all[w.key] = e;
      }));
    },
    onBack: () => { show('vHome'); renderHome(); }
  });

  /* ---------------- 启动 ---------------- */
  renderHome();
  show('vHome', false);
  // 调试 / 测试用
  window.__tingxie = { S, recs: () => (recCache = null, recs()), loadAll, currentBook };
})();
