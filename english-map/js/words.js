/* 单元单词（需求 #9）：内置课本单元词表，选 年级 → 册 → 单元 后卡片背诵、默写（复用 dict-run.js 的听写流程）、错词本
 * 词表：data/words/books.js（册目录）+ data/words/<册id>.js（一册的词，选中时用 <script> 动态加载，file:// 下可用）
 * 存储（图谱页的 localStorage，和英语进度同一个空间，纳入「我的数据」导出导入与设备同步，合并规则见 hub/km-data.js joinWord）：
 *   fjzk-en-words-v1      逐词记录 { "<英文小写>": { k, kt, r, rt, w: {设备: 写错次数}, n: {设备: 默写次数} } }
 *                         同一个词出现在多个单元 / 册只记一份
 *   fjzk-en-words-set-v1  年级、册、卡片正面、顺序、范围、只看必背、各册勾选的单元、默写设置 */
(function () {
  'use strict';
  const STORE = 'fjzk-en-words-v1', SETS = 'fjzk-en-words-set-v1';
  const $ = s => document.querySelector(s);
  const esc = DictRun.esc, keyOf = DictRun.keyOf;
  const inApp = !!(window.KMApp && KMApp.goBack);
  const GRADES = [3, 4, 5, 6, 7, 8, 9];
  const CN = { 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' };
  const KW = window.KW;

  /* ---------------- 存储 ---------------- */
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  function readJSON(k) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return isObj(v) ? v : null; } catch (e) { return null; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 存储不可用时只在本次有效 */ } }
  const DICT_DEFAULTS = { scope: 'all', mode: 'paper', read: 'en', reps: '2', pace: 'normal', order: 'random', someN: 10 };
  let S = readJSON(SETS) || {};
  S = Object.assign({ grade: 4, term: '上', face: 'en', order: 'book', range: 'todo', must: false, sel: {} }, S);
  S.dict = Object.assign({}, DICT_DEFAULTS, isObj(S.dict) ? S.dict : {});
  if (!isObj(S.sel)) S.sel = {};
  function saveSet() { writeJSON(SETS, S); }
  // 逐词记录：每次读最新的（设备同步、导入可能在别处改过）
  let recCache = null;
  function recs() { if (!recCache) recCache = readJSON(STORE) || {}; return recCache; }
  function rec(key) { const r = recs()[key]; return isObj(r) ? r : null; }
  function updateRecs(fn) {
    recCache = null;
    const all = recs();
    fn(all);
    writeJSON(STORE, all);
  }
  function devId() { try { return window.KMData ? KMData.device().id : 'web'; } catch (e) { return 'web'; } }
  const known = key => { const r = rec(key); return !!(r && r.k === 1); };
  const inWrong = key => { const r = rec(key); return !!(r && r.r === 0); };
  const wrongTimes = key => { const r = rec(key); return r && isObj(r.w) ? Object.keys(r.w).reduce((s, d) => s + (+r.w[d] || 0), 0) : 0; };
  // 页面回到前台、别的页面写过：丢掉缓存重新读
  window.addEventListener('pageshow', () => { recCache = null; if (current === 'vHome') renderHome(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { recCache = null; if (current === 'vHome') renderHome(); } });

  /* ---------------- 词表加载 ---------------- */
  const loading = {};
  function loadBook(id) {
    if (KW.words[id]) return Promise.resolve(KW.words[id]);
    if (loading[id]) return loading[id];
    loading[id] = new Promise((ok, bad) => {
      const s = document.createElement('script');
      s.src = 'data/words/' + id + '.js';
      s.onload = () => KW.words[id] ? ok(KW.words[id]) : bad(new Error('词表文件没有内容：' + id));
      s.onerror = () => { delete loading[id]; bad(new Error('词表加载失败：' + id)); };
      document.head.appendChild(s);
    });
    return loading[id];
  }
  const loadAll = () => Promise.all(KW.books.map(b => loadBook(b.id)));
  const bookById = id => KW.books.find(b => b.id === id);
  const shortName = b => CN[b.grade] + b.term;          // 四上
  const unitName = (b, uid) => { const u = b.units.find(x => x.id === uid); return u ? u.name : uid; };
  const unitShort = (b, uid) => unitName(b, uid).replace(/^(Unit\s*\d+|Starter|Revision\s*\d*).*$/i, '$1');
  function wordsOf(b, uids, mustOnly) {
    const list = KW.words[b.id] || [];
    const set = new Set(uids);
    return list.filter(w => set.has(w.u) && (!mustOnly || !b.mustMarked || w.must));
  }
  // 去重（同一个词在所选的几个单元里都有，只背 / 默一次），带上 key
  function dedupe(words) {
    const seen = new Set(), out = [];
    words.forEach(w => { const k = keyOf(w.en); if (!seen.has(k)) { seen.add(k); out.push(Object.assign({ key: k }, w)); } });
    return out;
  }

  /* ---------------- 页面切换（配合返回键） ---------------- */
  const VIEWS = ['vHome', 'vCard', 'vCardEnd', 'vWrong', 'vSetup', 'vRun', 'vCheck', 'vResult'];
  const TITLES = { vHome: '单元单词', vCard: '背诵', vCardEnd: '本轮背诵结果', vWrong: '错词本', vSetup: '默写设置', vRun: '默写中', vCheck: '批改', vResult: '默写结果' };
  // 历史记录：首页是第 0 层（state.d = 0），每进一层子页面 pushState 一条（d + 1）；
  // 子页面之间的流转（设置 → 默写中 → 批改 → 结果、背诵 → 结果）在同一条记录上 replaceState。
  // 回到单元一律用 goHome() 退回首页那条记录，不再压新记录，保证首页之上不留旧页面：
  // 首页按返回（系统返回键 / App 的 goBack）直接回英语图谱（#9 真机确认问题 1）
  let current = 'vHome';
  const depth = () => (history.state && +history.state.d) || 0;
  function show(v, push = true) {
    current = v;
    VIEWS.forEach(id => { document.getElementById(id).hidden = id !== v; });
    $('#title').textContent = TITLES[v];
    $('#subtitle').hidden = v !== 'vHome';
    document.body.classList.toggle('on-home', v === 'vHome');
    if (push) history.pushState({ v, d: depth() + 1 }, '', '#' + v.slice(1).toLowerCase());
    window.scrollTo(0, 0);
    DictRun.keepAwake(v === 'vRun');
  }
  let homing = false;
  function goHome() {
    endRound();
    const d = depth();
    if (d > 0) { homing = true; history.go(-d); }      // popstate 里显示首页
    else { show('vHome', false); renderHome(); }
  }
  history.replaceState({ v: 'vHome', d: 0 }, '', location.pathname + location.search);
  window.addEventListener('popstate', e => {
    const to = (e.state && e.state.v) || 'vHome';
    const toD = (e.state && +e.state.d) || 0;
    const stay = () => history.pushState({ v: current, d: toD + 1 }, '', '#' + current.slice(1).toLowerCase());
    if (homing) { homing = false; show('vHome', false); renderHome(); return; }
    if (current === 'vRun' && runner.isRunning()) {
      if (!confirm('要结束这次默写吗？')) { stay(); return; }
      runner.stopRun();
    }
    // 批改页（还没点「批改完成」）：返回会丢掉这次默写，先确认（#9 真机确认问题 2）
    if (current === 'vCheck' && runner.isChecking()) {
      if (!confirm('批改还没完成，要放弃这次默写吗？\n（选「取消」继续批改，批改完成后才会记分、记错词）')) { stay(); return; }
      runner.dropCheck();
    }
    if (current === 'vCard' && round && round.marked > 0 && round.idx < round.items.length) {
      if (!confirm('要结束这轮背诵吗？已标记的会保存')) { stay(); return; }
    }
    if (current === 'vCard') endRound(false);
    // 默写 / 批改 / 背诵中途不能靠返回键回去重来（一般不会出现，比如用了前进键），统一回到单元
    if (to === 'vRun' || to === 'vCheck' || to === 'vCard' || to === 'vCardEnd' || to === 'vResult') {
      if (toD > 0) { homing = true; history.go(-toD); return; }
      show('vHome', false); renderHome(); return;
    }
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

  /* ---------------- 选单元 ---------------- */
  function gradesWithData() { return new Set(KW.books.map(b => b.grade)); }
  function currentBook() {
    const list = KW.books.filter(b => b.grade === S.grade);
    return list.find(b => b.term === S.term) || list[0] || null;
  }
  function selOf(b) { return Array.isArray(S.sel[b.id]) ? S.sel[b.id].filter(u => b.units.some(x => x.id === u)) : []; }
  function renderHome() {
    const has = gradesWithData();
    if (!has.has(S.grade)) S.grade = KW.books.length ? KW.books[0].grade : 0;
    $('#grades').innerHTML = GRADES.map(g => `<button class="grade${g === S.grade ? ' on' : ''}${has.has(g) ? '' : ' off'}" data-g="${g}" role="tab" aria-selected="${g === S.grade}">${CN[g]}<span class="g-suffix">年级</span></button>`).join('');
    const b = currentBook();
    if (!b) { $('#units').innerHTML = ''; return; }
    S.term = b.term;
    const terms = new Set(KW.books.filter(x => x.grade === S.grade).map(x => x.term));
    $('#terms').querySelectorAll('button').forEach(x => { x.classList.toggle('on', x.dataset.t === b.term); x.disabled = !terms.has(x.dataset.t); });
    $('#bookName').textContent = `${b.pub} · ${b.ed}`;
    $('#bookUnchecked').hidden = !!b.checked;
    $('#bookOld').hidden = !b.old;
    $('#mustWrap').hidden = !b.mustMarked;
    $('#chkMust').checked = !!S.must;
    $('#bookSrc').textContent = b.src ? '词表来源：' + b.src : '';
    if (!KW.words[b.id]) {
      $('#units').innerHTML = '';
      $('#unitsLoading').hidden = false;
      loadBook(b.id).then(() => { if (currentBook() === b) renderHome(); })
        .catch(err => { $('#unitsLoading').textContent = '词表载入失败：' + err.message; });
      updateBar(b);
      return;
    }
    $('#unitsLoading').hidden = true;
    const sel = new Set(selOf(b));
    const mustOnly = S.must && b.mustMarked;
    $('#units').innerHTML = b.units.map(u => {
      const ws = dedupe(wordsOf(b, [u.id], mustOnly));
      const y = ws.length, x = ws.filter(w => known(w.key)).length;
      const done = ws.filter(w => { const r = rec(w.key); return r && r.rt; });
      const ok = done.filter(w => rec(w.key).r === 1).length;
      // 默写正确率：这个单元里默过的词，各按最近一次的结果算
      const dictTxt = done.length ? `默写 ${Math.round(ok / done.length * 100)}%<small>（最近一次 · 默过 ${done.length}/${y}）</small>` : '<span class="muted">未默写</span>';
      return `<label class="unit${sel.has(u.id) ? ' on' : ''}" data-u="${u.id}">
        <input type="checkbox" ${sel.has(u.id) ? 'checked' : ''}>
        <span class="u-name">${esc(u.name)}<small>${y} 词</small></span>
        <span class="u-prog"><span class="bar"><i style="width:${y ? Math.round(x / y * 100) : 0}%"></i></span><span>会了 ${x}/${y}</span></span>
        <span class="u-dict">${dictTxt}</span>
      </label>`;
    }).join('');
    $('#chkAll').checked = b.units.length > 0 && b.units.every(u => sel.has(u.id));
    updateBar(b);
    updateAllWrong();
  }
  function updateBar(b) {
    const sel = b ? selOf(b) : [];
    const ready = b && KW.words[b.id];
    const mustOnly = S.must && b && b.mustMarked;
    const m = ready ? wordsOf(b, sel, mustOnly).length : 0;      // 同词不同单元按出现次数算
    const nWrong = ready ? dedupe(wordsOf(b, sel, mustOnly)).filter(w => inWrong(w.key)).length : 0;
    $('#selInfo').textContent = sel.length ? `已选 ${sel.length} 个单元共 ${m} 词` : '先勾选要背的单元';
    $('#btnStudy').disabled = $('#btnDict').disabled = !sel.length || !m;
    $('#btnWrong').disabled = !sel.length;
    $('#btnWrong').textContent = `错词（${nWrong}）`;
  }
  // 全部错词数：要把所有册都载入才算得出，后台慢慢载
  function updateAllWrong() {
    const n = KW.books.every(b => KW.words[b.id]) ? allWrongWords().length : null;
    $('#btnAllWrong').textContent = n === null ? '全部错词' : `全部错词（${n}）`;
    if (n === null) loadAll().then(() => { if (current === 'vHome') updateAllWrong(); }).catch(() => {});
  }
  function allWrongWords() {
    const out = [], seen = new Set();
    KW.books.forEach(b => (KW.words[b.id] || []).forEach(w => {
      const k = keyOf(w.en);
      if (seen.has(k) || !inWrong(k)) return;
      seen.add(k); out.push(Object.assign({ key: k, book: b.id }, w));
    }));
    return out;
  }
  $('#grades').addEventListener('click', e => {
    const btn = e.target.closest('button[data-g]'); if (!btn) return;
    const g = +btn.dataset.g;
    if (!gradesWithData().has(g)) { toast(CN[g] + '年级的词表还在整理'); return; }
    S.grade = g; saveSet(); renderHome();
  });
  $('#terms').addEventListener('click', e => {
    const btn = e.target.closest('button[data-t]'); if (!btn || btn.disabled) return;
    S.term = btn.dataset.t; saveSet(); renderHome();
  });
  $('#units').addEventListener('change', e => {
    const row = e.target.closest('.unit'); if (!row) return;
    const b = currentBook();
    const sel = new Set(selOf(b));
    if (e.target.checked) sel.add(row.dataset.u); else sel.delete(row.dataset.u);
    S.sel[b.id] = b.units.map(u => u.id).filter(id => sel.has(id));
    saveSet();
    row.classList.toggle('on', e.target.checked);
    $('#chkAll').checked = b.units.every(u => sel.has(u.id));
    updateBar(b);
  });
  $('#chkAll').onchange = e => {
    const b = currentBook(); if (!b) return;
    S.sel[b.id] = e.target.checked ? b.units.map(u => u.id) : [];
    saveSet(); renderHome();
  };
  $('#chkMust').onchange = e => { S.must = e.target.checked; saveSet(); renderHome(); };
  function selName(b, sel) {
    if (sel.length === b.units.length) return shortName(b) + ' 全册';
    const names = sel.map(u => unitShort(b, u));
    return shortName(b) + ' ' + (names.length > 4 ? names.slice(0, 4).join('、') + ' 等 ' + names.length + ' 个单元' : names.join('、'));
  }
  function selWords() {
    const b = currentBook(); if (!b || !KW.words[b.id]) return null;
    const sel = selOf(b);
    return { b, sel, name: selName(b, sel), words: dedupe(wordsOf(b, sel, S.must && b.mustMarked)) };
  }
  $('#btnStudy').onclick = () => { const s = selWords(); if (s && s.words.length) startRound(s.words, S.range, s.name); };
  $('#btnDict').onclick = () => { const s = selWords(); if (s && s.words.length) runner.openSetup({ name: s.name + '（' + s.words.length + ' 词）', words: s.words }); };
  $('#btnWrong').onclick = () => { wrongCtx = 'sel'; renderWrong(); show('vWrong'); };
  $('#btnAllWrong').onclick = () => {
    loadAll().then(() => { wrongCtx = 'all'; renderWrong(); show('vWrong'); }).catch(err => toast(err.message));
  };

  /* ---------------- 背诵卡片 ---------------- */
  let round = null;
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // words：已去重的词；range：todo 只背还不会的 / all 全部
  function buildItems(words, range) {
    let items = words.slice();
    if (range === 'todo') items = items.filter(w => !known(w.key));
    if (S.order === 'shuffle') shuffle(items);
    return items;
  }
  function startRound(words, range, name) {
    const items = buildItems(words, range);
    if (!items.length) {
      if (range === 'todo' && confirm('选中的词都标过「会了」。要全部再背一遍吗？')) { S.range = 'all'; saveSet(); return startRound(words, 'all', name); }
      if (range !== 'todo') alert('没有可以背的单词。');
      return;
    }
    round = { words, name, items, idx: 0, flipped: false, again: new Set(), result: new Map(), marked: 0 };
    syncCardOpts();
    // 从背诵结果页「再背不会的」：在同一条历史记录上换成卡片，不多压一层
    if (current === 'vCard') show('vCard', false);
    else if (current === 'vCardEnd') { history.replaceState({ v: 'vCard', d: depth() }, '', '#card'); show('vCard', false); }
    else show('vCard');
    renderCard(true);
  }
  function syncCardOpts() {
    document.querySelectorAll('#vCard .seg[data-opt]').forEach(seg => {
      const v = String(S[seg.dataset.opt]);
      seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    });
  }
  document.querySelectorAll('#vCard .seg[data-opt]').forEach(seg => seg.addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn) return;
    const opt = seg.dataset.opt;
    if (S[opt] === btn.dataset.v) return;
    S[opt] = btn.dataset.v; saveSet(); syncCardOpts();
    if (!round) return;
    if (opt === 'face') { round.flipped = false; renderCard(true); return; }
    // 换顺序 / 范围：从头重新排这一轮（已标记的已经保存）
    const items = buildItems(round.words, S.range);
    if (!items.length) { toast(S.range === 'todo' ? '这些词都标过「会了」' : '没有可以背的单词'); return; }
    Object.assign(round, { items, idx: 0, flipped: false, again: new Set() });
    renderCard(true);
  }));
  function sayWord(w) { DictRun.say([{ text: w.en, lang: 'en-US' }]); }
  function renderCard(enter) {
    const w = round.items[round.idx];
    $('#cardProg').textContent = `${round.idx + 1} / ${round.items.length}`;
    const face = S.face;
    let front;
    if (face === 'zh') front = `<div class="f-zh">${esc(w.zh)}</div>${w.pos ? `<div class="f-pos">${esc(w.pos)}</div>` : ''}`;
    else if (face === 'audio') front = '<div class="f-audio">🔊</div><div class="f-pos">听发音，想想是哪个词</div>';
    else front = `<div class="f-en">${esc(w.en)}</div>`;
    $('#flashFront').innerHTML = front;
    $('#flashBack').innerHTML = `<div class="f-en">${esc(w.en)}</div><div class="f-pos">${esc(w.pos || '')}</div><div class="f-zh">${esc(w.zh)}</div>`;
    $('#flashFront').hidden = round.flipped;
    $('#flashBack').hidden = !round.flipped;
    $('#flashTip').textContent = round.flipped ? '点卡片翻回正面' : '点卡片翻面';
    const r = rec(w.key);
    $('#flash').classList.toggle('was-known', !!(r && r.k === 1));
    // 进卡读一遍英文（「看中文」时先不读，免得直接听到答案；翻面再读）
    if (enter && face !== 'zh') sayWord(w);
  }
  function flip() {
    if (!round) return;
    round.flipped = !round.flipped;
    renderCard(false);
    if (round.flipped) sayWord(round.items[round.idx]);
  }
  $('#flash').onclick = flip;
  $('#flash').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
  $('#btnSay').onclick = () => { if (round) sayWord(round.items[round.idx]); };
  function mark(k) {
    if (!round) return;
    const w = round.items[round.idx];
    const now = Date.now();
    updateRecs(all => { const e = isObj(all[w.key]) ? all[w.key] : {}; e.k = k; e.kt = now; all[w.key] = e; });
    round.result.set(w.key, k);
    round.marked++;
    // 「不会」的词本轮结束前再出现一次：插到后面第 3 张之后
    if (!k && !round.again.has(w.key)) {
      round.again.add(w.key);
      round.items.splice(Math.min(round.idx + 4, round.items.length), 0, w);
    }
    round.idx++;
    round.flipped = false;
    if (round.idx >= round.items.length) { finishRound(); return; }
    renderCard(true);
  }
  $('#btnYes').onclick = () => mark(1);
  $('#btnNo').onclick = () => mark(0);
  let endWords = [];
  function finishRound() {
    DictRun.stopSay();
    const r = round;
    const keys = Array.from(r.result.keys());
    const byKey = new Map(r.items.map(w => [w.key, w]));
    const yes = keys.filter(k => r.result.get(k) === 1).length;
    endWords = keys.filter(k => r.result.get(k) === 0).map(k => byKey.get(k));
    $('#endScore').textContent = `会了 ${yes} / ${keys.length}`;
    $('#endScore').classList.toggle('low', endWords.length > 0);
    $('#endSub').textContent = endWords.length ? `还有 ${endWords.length} 个不会：` : '这一轮全都会了！';
    $('#endList').innerHTML = endWords.length
      ? '<div class="wrong-list">' + endWords.map(w => `<div><b>${esc(w.en)}</b>${esc(w.zh)}</div>`).join('') + '</div>' : '';
    $('#btnEndAgain').hidden = $('#btnEndDict').hidden = !endWords.length;
    history.replaceState({ v: 'vCardEnd', d: depth() }, '', '#cardend');
    show('vCardEnd', false);
  }
  function endRound() { DictRun.stopSay(); round = null; }
  $('#btnEndHome').onclick = goHome;
  $('#btnEndAgain').onclick = () => { const ws = endWords.slice(), name = round ? round.name : ''; startRound(ws, 'all', name); };
  $('#btnEndDict').onclick = () => {
    const ws = endWords.slice();
    if (ws.length) runner.openSetup({ name: '刚才不会的词（' + ws.length + ' 个）', words: ws }, true);
  };

  /* ---------------- 错词本 ---------------- */
  let wrongCtx = 'sel', wrongList = [];
  function renderWrong() {
    const groups = [];
    if (wrongCtx === 'all') {
      $('#wrongTitle').textContent = '全部错词';
      KW.books.forEach(b => {
        const seen = new Set();
        b.units.forEach(u => {
          const ws = dedupe(wordsOf(b, [u.id], false)).filter(w => inWrong(w.key) && !seen.has(w.key));
          ws.forEach(w => seen.add(w.key));
          if (ws.length) groups.push({ title: shortName(b) + ' · ' + u.name, words: ws });
        });
      });
    } else {
      const s = selWords();
      $('#wrongTitle').textContent = s ? '错词本 · ' + s.name : '错词本';
      if (s) s.sel.forEach(uid => {
        const ws = dedupe(wordsOf(s.b, [uid], S.must && s.b.mustMarked)).filter(w => inWrong(w.key));
        if (ws.length) groups.push({ title: unitName(s.b, uid), words: ws });
      });
    }
    // 同一个词在多个单元里：只列一次（第一次出现的单元）
    const seen = new Set();
    groups.forEach(g => { g.words = g.words.filter(w => !seen.has(w.key) && seen.add(w.key)); });
    wrongList = [];
    $('#wrongRows').innerHTML = groups.filter(g => g.words.length).map(g => {
      wrongList.push(...g.words);
      return `<h3 class="w-group">${esc(g.title)}</h3>` + g.words.map(w => `<div class="w-row">
        <b>${esc(w.en)}</b><span class="w-zh">${esc(w.pos ? w.pos + ' ' : '')}${esc(w.zh)}</span><span class="w-n">错过 ${wrongTimes(w.key)} 次</span>
        <button class="btn icon" data-say="${esc(w.en)}" aria-label="读">🔊</button></div>`).join('');
    }).join('');
    $('#wrongEmpty').hidden = wrongList.length > 0;
    $('#btnWrongStudy').disabled = $('#btnWrongDict').disabled = !wrongList.length;
  }
  $('#wrongRows').addEventListener('click', e => {
    const b = e.target.closest('button[data-say]'); if (b) DictRun.say([{ text: b.dataset.say, lang: 'en-US' }]);
  });
  $('#btnWrongStudy').onclick = () => { if (wrongList.length) startRound(wrongList.slice(), 'all', '错词'); };
  $('#btnWrongDict').onclick = () => { if (wrongList.length) runner.openSetup({ name: '错词（' + wrongList.length + ' 个）', words: wrongList.slice() }); };

  /* ---------------- 默写（共用 dict-run.js） ---------------- */
  const runner = DictRun.create({
    settings: S.dict,
    save: saveSet,
    show: (v, push) => show(v, push),
    current: () => current,
    text: { act: '默写', listWord: '组词' },
    wrongCount: src => src.words.filter(w => inWrong(keyOf(w.en))).length,
    isWrong: (src, k) => inWrong(k),
    record(src, rows) {
      const now = Date.now(), me = devId();
      updateRecs(all => rows.forEach(({ w, wrong }) => {
        const k = keyOf(w.en);
        const e = isObj(all[k]) ? all[k] : {};
        e.r = wrong ? 0 : 1; e.rt = now;           // r=0 在错词本；写对一次就移出
        e.n = isObj(e.n) ? e.n : {}; e.n[me] = (+e.n[me] || 0) + 1;
        e.w = isObj(e.w) ? e.w : {}; if (wrong) e.w[me] = (+e.w[me] || 0) + 1;
        all[k] = e;
      }));
    },
    onBack: goHome
  });

  /* ---------------- 启动 ---------------- */
  if (!KW.books.length) { $('#units').innerHTML = '<p class="empty">词表还在整理。</p>'; }
  renderHome();
  show('vHome', false);
  // 调试 / 测试用
  window.__words = { S, recs: () => (recCache = null, recs()), loadAll, currentBook };
})();
