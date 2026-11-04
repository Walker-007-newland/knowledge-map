/* 古诗词默写（moxie.html）：选 年级 → 册 → 课 / 首，上下句默写或整首默写；手写（田字格）、纸上写、键盘输入；错句本
 * 诗文：data/moxie/poems.js（window.KMX，docs/moxie/build_poems.py 从 data/gushi-kb-*.js 生成），每首按标点切成小句 c[i] = { t, p }
 * 题目：{ key, poem, hide: 要默写的小句序号（整首纸上写为 'all'）, show: 题面显示的小句序号, kind: 'pair' | 'whole' }
 * 存储（纳入「我的数据」导出导入与设备同步，合并规则同语文听写，见 hub/km-data.js）：
 *   fjzk-zh-moxie-v1      逐句记录 { "<诗id>#<小句序号|all>": { r, rt, w: {设备: 写错次数}, n: {设备: 默写次数} } }，r=0 即在错句本
 *   fjzk-zh-moxie-set-v1  年级、册、勾选的诗、默写设置 */
(function () {
  'use strict';
  const STORE = 'fjzk-zh-moxie-v1', SETS = 'fjzk-zh-moxie-set-v1';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const inApp = !!(window.KMApp && KMApp.goBack);
  const GRADES = [4, 5, 6, 7, 8, 9];
  const CN = { 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' };
  const BOOKS = window.KMX.books;
  const POEMS = {};
  BOOKS.forEach(b => b.groups.forEach(g => g.poems.forEach(p => { p.book = b; p.group = g; POEMS[p.id] = p; })));
  const bare = s => String(s).replace(/[\s\p{P}\p{S}]/gu, '');

  /* ---------------- 存储 ---------------- */
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  function readJSON(k) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return isObj(v) ? v : null; } catch (e) { return null; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 存储不可用时只在本次有效 */ } }
  const SET_DEFAULTS = { kind: 'pair', mode: 'hand', handJudge: 'loose', order: 'list', scope: 'all', someN: 10 };
  let S = readJSON(SETS) || {};
  S = Object.assign({ grade: 4, term: '上', sel: [] }, S);
  S.set = Object.assign({}, SET_DEFAULTS, isObj(S.set) ? S.set : {});
  if (!Array.isArray(S.sel)) S.sel = [];
  function saveSet() { writeJSON(SETS, S); }
  let recCache = null;
  function recs() { if (!recCache) recCache = readJSON(STORE) || {}; return recCache; }
  function updateRecs(fn) { recCache = null; const all = recs(); fn(all); writeJSON(STORE, all); }
  function devId() { try { return window.KMData ? KMData.device().id : 'web'; } catch (e) { return 'web'; } }
  const inWrong = key => { const r = recs()[key]; return !!(isObj(r) && r.r === 0); };
  const wrongKeysOf = p => Object.keys(recs()).filter(k => k.startsWith(p.id + '#') && inWrong(k));
  window.addEventListener('pageshow', () => { recCache = null; if (current === 'vHome') renderHome(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { recCache = null; if (current === 'vHome') renderHome(); } });

  /* ---------------- 页面切换（配合返回键） ---------------- */
  const VIEWS = ['vHome', 'vWrong', 'vSetup', 'vRun', 'vCheck', 'vResult'];
  const TITLES = { vHome: '古诗词默写', vWrong: '错句本', vSetup: '默写设置', vRun: '默写中', vCheck: '批改', vResult: '默写结果' };
  let current = 'vHome';
  function show(v, push = true) {
    current = v;
    VIEWS.forEach(id => { document.getElementById(id).hidden = id !== v; });
    $('#title').textContent = TITLES[v];
    $('#subtitle').hidden = v !== 'vHome';
    document.body.classList.toggle('on-home', v === 'vHome');
    if (push) history.pushState({ v }, '', '#' + v.slice(1).toLowerCase());
    window.scrollTo(0, 0);
  }
  history.replaceState({ v: 'vHome' }, '', location.pathname + location.search);
  window.addEventListener('popstate', e => {
    const to = (e.state && e.state.v) || 'vHome';
    if (current === 'vRun' && run) {
      if (!confirm('要结束这次默写吗？')) { history.pushState({ v: 'vRun' }, '', '#run'); return; }
      stopRun();
    }
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

  /* ---------------- 选诗 ---------------- */
  const opened = new Set();
  const currentBook = () => BOOKS.find(b => b.grade === S.grade && b.term === S.term) || BOOKS.find(b => b.grade === S.grade) || BOOKS[0];
  const bookPoems = b => b.groups.reduce((a, g) => a.concat(g.poems), []);
  const selSet = () => new Set(S.sel.filter(id => POEMS[id]));
  const poemLabel = p => p.title + (p.author ? '　' + p.author.replace(/^［(.*)］/, '$1·') : '');
  function renderHome() {
    const b = currentBook();
    S.grade = b.grade; S.term = b.term;
    $('#grades').innerHTML = GRADES.map(g => `<button class="grade${g === S.grade ? ' on' : ''}" data-g="${g}" role="tab" aria-selected="${g === S.grade}">${CN[g]}<span class="g-suffix">年级</span></button>`).join('');
    const terms = new Set(BOOKS.filter(x => x.grade === S.grade).map(x => x.term));
    $('#terms').querySelectorAll('button').forEach(x => { x.classList.toggle('on', x.dataset.t === b.term); x.disabled = !terms.has(x.dataset.t); });
    const sel = selSet();
    $('#groups').innerHTML = b.groups.map(g => {
      const nSel = g.poems.filter(p => sel.has(p.id)).length;
      const nWrong = g.poems.reduce((s, p) => s + wrongKeysOf(p).length, 0);
      const open = opened.has(g.id);
      return `<div class="unit${nSel ? ' on' : ''}" data-g="${esc(g.id)}">
        <div class="u-head">
          <input type="checkbox" class="u-chk" aria-label="选中${esc(g.name)}全部" ${nSel && nSel === g.poems.length ? 'checked' : ''} data-half="${nSel > 0 && nSel < g.poems.length ? 1 : 0}">
          <button class="u-tog" aria-expanded="${open}"><span class="u-name">${esc(g.name)}<small>${g.poems.length} 首${nSel ? ` · 已选 ${nSel}` : ''}</small></span>
            <span class="u-wrong${nWrong ? ' bad' : ''}">${nWrong ? '错句 ' + nWrong : ''}</span><span class="u-arrow">${open ? '▾' : '▸'}</span></button>
        </div>
        <div class="lessons"${open ? '' : ' hidden'}>${g.poems.map(p => {
          const nw = wrongKeysOf(p).length;
          return `<label class="lesson mx-poem-row${sel.has(p.id) ? ' on' : ''}" data-p="${esc(p.id)}">
            <input type="checkbox" ${sel.has(p.id) ? 'checked' : ''}>
            <span class="l-name">${esc(poemLabel(p))}</span>
            <span class="l-wrong${nw ? ' bad' : ''}">${nw ? '错 ' + nw : ''}</span>
          </label>`;
        }).join('')}</div>
      </div>`;
    }).join('');
    $('#groups').querySelectorAll('.u-chk').forEach(c => { c.indeterminate = c.dataset.half === '1'; });
    const all = bookPoems(b), nIn = all.filter(p => sel.has(p.id)).length;
    $('#chkAll').checked = all.length > 0 && nIn === all.length;
    $('#chkAll').indeterminate = nIn > 0 && nIn < all.length;
    // 勾选可以跨册：底栏显示全部已选
    const picked = [...sel];
    $('#selInfo').textContent = picked.length ? `已选 ${picked.length} 首` + (picked.length > nIn ? `（其中别的册 ${picked.length - nIn} 首）` : '') : '先勾选要默写的诗';
    $('#btnGo').disabled = !picked.length;
    const nWrong = Object.keys(recs()).filter(k => inWrong(k) && POEMS[k.split('#')[0]]).length;
    $('#btnWrong').textContent = nWrong ? `错句本（${nWrong}）` : '错句本';
  }
  function setSel(ids, on) {
    const sel = selSet();
    ids.forEach(id => { if (on) sel.add(id); else sel.delete(id); });
    // 按课本顺序保存
    S.sel = Object.keys(POEMS).filter(id => sel.has(id));
    saveSet(); renderHome();
  }
  $('#grades').addEventListener('click', e => {
    const btn = e.target.closest('button[data-g]'); if (!btn) return;
    S.grade = +btn.dataset.g;
    if (!BOOKS.some(b => b.grade === S.grade && b.term === S.term)) S.term = '上';
    saveSet(); renderHome();
  });
  $('#terms').addEventListener('click', e => {
    const btn = e.target.closest('button[data-t]'); if (!btn || btn.disabled) return;
    S.term = btn.dataset.t; saveSet(); renderHome();
  });
  $('#groups').addEventListener('click', e => {
    const tog = e.target.closest('.u-tog'); if (!tog) return;
    const id = tog.closest('.unit').dataset.g;
    if (opened.has(id)) opened.delete(id); else opened.add(id);
    renderHome();
  });
  $('#groups').addEventListener('change', e => {
    const unit = e.target.closest('.unit'), g = currentBook().groups.find(x => x.id === unit.dataset.g);
    if (e.target.classList.contains('u-chk')) setSel(g.poems.map(p => p.id), e.target.checked);
    else { const row = e.target.closest('.lesson'); if (row) setSel([row.dataset.p], e.target.checked); }
  });
  $('#chkAll').onchange = e => setSel(bookPoems(currentBook()).map(p => p.id), e.target.checked);
  $('#btnGo').onclick = () => {
    const ps = [...selSet()].map(id => POEMS[id]);
    if (!ps.length) return;
    const names = ps.length <= 3 ? ps.map(p => '《' + p.title + '》').join('') : `《${ps[0].title}》等 ${ps.length} 首`;
    openSetup({ name: names, poems: ps });
  };
  $('#btnWrong').onclick = () => { renderWrong(); show('vWrong'); };

  /* ---------------- 错句本 ---------------- */
  let wrongTargets = [];
  const clauseText = (p, i) => i === 'all' ? '（整首）' : p.c[i].t;
  function renderWrong() {
    wrongTargets = [];
    const html = BOOKS.map(b => {
      const rows = bookPoems(b).map(p => {
        const ks = wrongKeysOf(p);
        if (!ks.length) return '';
        const hides = ks.map(k => k.split('#')[1]).map(h => h === 'all' ? 'all' : +h).filter(h => h === 'all' || p.c[h]);
        hides.sort((x, y) => (x === 'all' ? -1 : x) - (y === 'all' ? -1 : y));
        hides.forEach(h => wrongTargets.push({ poem: p, hide: h }));
        return `<h4 class="w-lesson">${esc(p.group.name)} · 《${esc(p.title)}》</h4>` + hides.map(h =>
          `<div class="w-row"><b>${esc(clauseText(p, h))}</b><span class="w-n">错过 ${wrongTimes(p.id + '#' + h)} 次</span><span></span></div>`).join('');
      }).join('');
      return rows ? `<div class="w-book"><div class="w-book-head"><h3>${esc(b.name)}册</h3></div>${rows}</div>` : '';
    }).join('');
    $('#wrongRows').innerHTML = html;
    $('#wrongEmpty').hidden = wrongTargets.length > 0;
    $('#btnWrongGo').disabled = !wrongTargets.length;
  }
  function wrongTimes(key) { const r = recs()[key]; return isObj(r) && isObj(r.w) ? Object.keys(r.w).reduce((s, d) => s + (+r.w[d] || 0), 0) : 0; }
  $('#btnWrongGo').onclick = () => { if (wrongTargets.length) openSetup({ name: '错句（' + wrongTargets.length + ' 句）', targets: wrongTargets.slice() }); };

  /* ---------------- 出题 ---------------- */
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // 上下句：每两个小句一题，随机挡住其中一句；hide 给定时就挡那一句（错句再练）
  function pairItem(p, hide) {
    const a = hide % 2 === 0 ? (hide + 1 < p.c.length ? hide : hide - 1) : hide - 1;
    return { key: p.id + '#' + hide, poem: p, hide, show: a < 0 ? [hide] : [a, a + 1], kind: 'pair' };
  }
  function pairItems(p) {
    const out = [];
    for (let i = 0; i < p.c.length; i += 2) {
      if (i + 1 >= p.c.length) { if (i > 0) out.push(pairItem(p, i)); else out.push(pairItem(p, 0)); break; }
      out.push(pairItem(p, Math.random() < 0.5 ? i : i + 1));
    }
    return out;
  }
  // 整首：手写 / 键盘一句一题；纸上写整首一题
  function wholeItems(p, mode) {
    if (mode === 'paper') return [{ key: p.id + '#all', poem: p, hide: 'all', show: [], kind: 'whole' }];
    return p.c.map((x, i) => ({ key: p.id + '#' + i, poem: p, hide: i, show: [], kind: 'whole' }));
  }
  function buildItems(src) {
    const T = S.set;
    let items;
    if (src.targets) {
      items = [].concat(...src.targets.map(t => t.hide === 'all' ? wholeItems(t.poem, T.mode) : [pairItem(t.poem, t.hide)]));
    } else if (T.kind === 'whole') {
      const ps = src.poems.slice();
      if (T.order === 'random') shuffle(ps);
      return [].concat(...ps.map(p => wholeItems(p, T.mode)));   // 整首默写按诗的顺序写，不打乱句子
    } else {
      items = [].concat(...src.poems.map(pairItems));
    }
    if (T.order === 'random' || (T.scope === 'some' && !src.targets)) shuffle(items);
    if (T.scope === 'some' && !src.targets) {
      items = items.slice(0, Math.max(1, Math.min(+T.someN || 10, items.length)));
      if (T.order !== 'random') { const pos = new Map(Object.keys(POEMS).map((id, i) => [id, i])); items.sort((x, y) => pos.get(x.poem.id) - pos.get(y.poem.id) || x.hide - y.hide); }
    }
    return items;
  }
  const answerOf = it => it.hide === 'all' ? it.poem.c.map(x => x.t).join('') : it.poem.c[it.hide].t;

  /* ---------------- 设置 ---------------- */
  let setupSrc = null;
  function openSetup(src, replace) {
    setupSrc = src;
    $('#setupName').textContent = src.name;
    const nPair = src.poems ? src.poems.reduce((s, p) => s + Math.ceil(p.c.length / 2), 0) : src.targets.length;
    $('#nAll').textContent = nPair;
    $('#someN').value = Math.min(S.set.someN || 10, nPair);
    $('#someN').max = nPair;
    syncSetup();
    if (replace) { history.replaceState({ v: 'vSetup' }, '', '#setup'); show('vSetup', false); } else show('vSetup');
  }
  function syncSetup() {
    const T = S.set, fixed = !!(setupSrc && setupSrc.targets);
    document.querySelectorAll('#vSetup .seg[data-opt]').forEach(seg => {
      const v = String(T[seg.dataset.opt]);
      seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    });
    document.querySelector('[data-opt=kind]').closest('.dopt').hidden = fixed;
    document.querySelector('#vSetup .hand-only').hidden = T.mode !== 'hand';
    document.querySelector('#vSetup .pair-only').hidden = fixed || T.kind !== 'pair';
    $('#someWrap').hidden = T.scope !== 'some';
    const how = T.mode === 'hand' ? '在田字格里写，写的时候不提示对错，全部写完再一起判分（' + (T.handJudge === 'strict' ? '严格：字形和笔顺都要对' : '宽松：只看字形，笔顺不对也算对') + '）。'
      : T.mode === 'paper' ? '准备好纸和笔，写在纸上，写完对照答案自己批改。' : '用键盘（拼音或手写输入法）输入，按回车进入下一题，结束后自动判分（标点不用写）。';
    $('#setupHint').textContent = (fixed ? '' : T.kind === 'pair' ? '上下句：给出上句写下句，或给出下句写上句。' : '整首默写：看题目和作者，按顺序默写全诗' + (T.mode === 'paper' ? '。' : '，一句一句写。')) + how;
  }
  document.querySelectorAll('#vSetup .seg[data-opt]').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    S.set[seg.dataset.opt] = b.dataset.v; saveSet(); syncSetup();
  }));
  $('#someN').oninput = () => { S.set.someN = Math.max(1, +$('#someN').value || 1); saveSet(); };
  $('#btnSetupBack').onclick = () => history.back();
  $('#btnStart').onclick = () => startRun(setupSrc);

  /* ---------------- 默写中 ---------------- */
  let run = null, pad = null;
  function startRun(src, items) {
    items = items || buildItems(src);
    if (!items.length) { alert('没有可以默写的句子。'); return; }
    const mode = S.set.mode;
    if (mode === 'hand') {
      $('#btnStart').disabled = true;
      HandPad.load(items.map(answerOf).join('')).then(() => begin(src, items, mode), err => alert(err.message))
        .then(() => { $('#btnStart').disabled = false; });
      return;
    }
    begin(src, items, mode);
  }
  function begin(src, items, mode) {
    run = { src, items, idx: 0, mode, strict: S.set.handJudge === 'strict', answers: items.map(() => ''), res: items.map(() => null) };
    $('#runTotal').textContent = items.length;
    $('#runInput').hidden = mode !== 'type';
    $('#runHand').hidden = mode !== 'hand';
    $('#runHint').textContent = mode === 'paper' ? '写在纸上，写好点“下一题”。' : mode === 'type' ? '输入后按回车。' : '';
    if (current === 'vSetup') { history.replaceState({ v: 'vRun' }, '', '#run'); show('vRun', false); } else show('vRun');
    if (inApp && KMApp.keepScreenOn) KMApp.keepScreenOn(true);
    showItem();
  }
  function stopRun() { if (pad) pad.destroy(); pad = null; run = null; if (inApp && KMApp.keepScreenOn) KMApp.keepScreenOn(false); }
  // 题面：小句按原文排，要写的那句画成空格（几个字几个格）
  function blank(n, cur) { return `<span class="mx-blank${cur ? ' cur' : ''}">${'<i></i>'.repeat(n)}</span>`; }
  function promptHTML(it, reveal) {
    const p = it.poem;
    if (it.kind === 'pair') {
      return it.show.map(i => (i === it.hide ? (reveal ? `<b class="mx-ans">${esc(p.c[i].t)}</b>` : blank(p.c[i].t.length, true)) : esc(p.c[i].t)) + esc(p.c[i].p)).join('');
    }
    // 整首：显示全诗的格子，当前这句高亮；纸上写整首时全部是空格
    return p.c.map((x, i) => {
      const cur = it.hide === 'all' || i === it.hide;
      const body = reveal && cur ? `<b class="mx-ans">${esc(x.t)}</b>` : blank(x.t.length, it.hide !== 'all' && i === it.hide);
      return body + esc(x.p) + (/[。？！；]/.test(x.p) ? '<br>' : '');
    }).join('');
  }
  function showItem() {
    const it = run.items[run.idx];
    $('#runIdx').textContent = run.idx + 1;
    $('#runPoem').innerHTML = `《${esc(it.poem.title)}》<small>${esc(it.poem.author)}</small>`;
    $('#runPrompt').innerHTML = promptHTML(it, false);
    $('#runPrompt').classList.toggle('whole', it.kind === 'whole');
    $('#btnPrev').disabled = run.idx === 0;
    $('#btnNext').textContent = run.idx === run.items.length - 1 ? '完成 ✓' : '下一题 ⏭';
    if (run.mode === 'type') { const inp = $('#runInput'); inp.value = run.answers[run.idx] || ''; inp.focus(); }
    if (run.mode === 'hand') {
      if (pad) pad.destroy();
      const r = run, i = run.idx;
      pad = HandPad.create($('#handBoxes'), answerOf(it), run.answers[i], ink => { if (run === r) r.answers[i] = ink; });
    }
  }
  function saveCurrent() {
    if (run.mode === 'type') run.answers[run.idx] = $('#runInput').value.trim();
    if (run.mode === 'hand') run.res[run.idx] = HandPad.judge(answerOf(run.items[run.idx]), run.answers[run.idx], run.strict);
  }
  function next() {
    if (!run) return;
    saveCurrent();
    if (run.idx >= run.items.length - 1) { finishRun(); return; }
    run.idx++; showItem();
  }
  $('#btnNext').onclick = next;
  $('#btnPrev').onclick = () => { if (!run || run.idx === 0) return; saveCurrent(); run.idx--; showItem(); };
  $('#btnHandUndo').onclick = () => { if (pad) pad.undo(); };
  $('#btnHandClear').onclick = () => { if (pad) pad.clear(); };
  $('#runInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); next(); }
  });
  $('#btnStop').onclick = () => {
    if (!run) return;
    saveCurrent();
    const started = run.mode === 'type' ? !!run.answers[run.idx] : run.mode === 'hand' ? HandPad.hasInk(run.answers[run.idx]) : false;
    const keep = run.idx + (started ? 1 : 0);
    if (keep > 0 && confirm(`已经默写了 ${keep} 题，要批改已写的部分吗？\n（选“取消”直接放弃这次默写）`)) {
      ['items', 'answers', 'res'].forEach(k => { run[k] = run[k].slice(0, keep); });
      finishRun();
    } else { stopRun(); history.back(); }
  };

  /* ---------------- 批改 ---------------- */
  let checking = null;
  function finishRun() {
    const r = run; stopRun();
    checking = { src: r.src, mode: r.mode, items: r.items, answers: r.answers, res: r.res };
    checking.wrong = r.items.map((it, i) => r.mode === 'type' ? !(bare(r.answers[i]) && bare(r.answers[i]) === bare(answerOf(it)))
      : r.mode === 'hand' ? !(r.res[i] || HandPad.judge(answerOf(it), r.answers[i], r.strict)).ok : false);
    if (r.mode === 'hand') checking.res = r.items.map((it, i) => r.res[i] || HandPad.judge(answerOf(it), r.answers[i], r.strict));
    $('#checkHint').textContent = r.mode === 'paper'
      ? '对照答案（加粗的字）批改纸上写的，点一下写错的题标成 ✗（再点一下取消）。错一个字也算错。'
      : r.mode === 'hand'
        ? '已经按手写自动判分，红框是判错的字，点一下红框看正确笔顺。判得不对的话，点这一题改判。'
        : '已经自动判分（不比较标点）。判得不对的话，点一下改判。';
    renderCheck();
    history.replaceState({ v: 'vCheck' }, '', '#check');
    show('vCheck', false);
  }
  function renderCheck() {
    const c = checking;
    $('#checkRows').innerHTML = c.items.map((it, i) => `<div class="crow${c.wrong[i] ? ' wrong' : ''}" data-i="${i}">
      <div class="no">${i + 1}.</div>
      <div><div class="mx-ctitle">《${esc(it.poem.title)}》${esc(it.poem.author)}</div>
        <div class="mx-cprompt">${it.kind === 'whole' && it.hide !== 'all' ? esc(it.poem.c[it.hide].t) : promptHTML(it, true)}</div>
        ${c.mode === 'type' ? `<div class="ans">你写的：${esc(c.answers[i] || '（没写）')}</div>` : ''}
        ${c.mode === 'hand' ? HandPad.inkHTML(answerOf(it), c.answers[i], c.res[i], { i }) : ''}</div>
      <div class="mark">${c.wrong[i] ? '✗' : '✓'}</div>
    </div>`).join('');
  }
  $('#checkRows').addEventListener('click', e => {
    const demo = e.target.closest('.ink-c.bad');
    if (demo) {
      const i = +demo.dataset.i, k = +demo.dataset.k;
      HandPad.toggleDemo(demo, HandPad.charsOf(answerOf(checking.items[i]))[k], (checking.answers[i] || [])[k]);
      return;
    }
    const row = e.target.closest('.crow'); if (!row) return;
    const i = +row.dataset.i;
    checking.wrong[i] = !checking.wrong[i];
    row.classList.toggle('wrong', checking.wrong[i]);
    row.querySelector('.mark').textContent = checking.wrong[i] ? '✗' : '✓';
  });
  $('#btnCheckDone').onclick = () => {
    const c = checking; if (!c) return;
    const now = Date.now(), me = devId();
    updateRecs(all => c.items.forEach((it, i) => {
      const e = isObj(all[it.key]) ? all[it.key] : {};
      e.r = c.wrong[i] ? 0 : 1; e.rt = now;
      e.n = isObj(e.n) ? e.n : {}; e.n[me] = (+e.n[me] || 0) + 1;
      e.w = isObj(e.w) ? e.w : {}; if (c.wrong[i]) e.w[me] = (+e.w[me] || 0) + 1;
      all[it.key] = e;
    }));
    showResult(c);
  };

  /* ---------------- 结果 ---------------- */
  let lastWrong = [];
  function showResult(c) {
    lastWrong = c.items.filter((it, i) => c.wrong[i]);
    const total = c.items.length, correct = total - lastWrong.length, pct = Math.round(correct / total * 100);
    $('#resScore').textContent = `${correct} / ${total}`;
    $('#resScore').classList.toggle('low', pct < 80);
    $('#resSub').textContent = pct === 100 ? '全对，太棒了！' : `正确率 ${pct}%` + (lastWrong.length ? `，错了 ${lastWrong.length} 题，已记进错句本` : '');
    $('#resWrong').innerHTML = lastWrong.length
      ? '<div class="mx-wrong-list">' + lastWrong.map(it => `<div>《${esc(it.poem.title)}》<b>${esc(it.hide === 'all' ? '整首' : it.poem.c[it.hide].t)}</b></div>`).join('') + '</div>' : '';
    $('#btnResWrong').hidden = !lastWrong.length;
    history.replaceState({ v: 'vResult' }, '', '#result');
    show('vResult', false);
  }
  $('#btnResList').onclick = () => { show('vHome'); renderHome(); };
  $('#btnResAgain').onclick = () => { if (checking) startRun(checking.src, checking.items.map(it => Object.assign({}, it))); };
  $('#btnResWrong').onclick = () => {
    if (!lastWrong.length) return;
    startRun({ name: '错句', targets: lastWrong.map(it => ({ poem: it.poem, hide: it.hide })) }, lastWrong.map(it => Object.assign({}, it)));
  };

  /* ---------------- 启动 ---------------- */
  renderHome();
  show('vHome', false);
  window.__moxie = { S, recs: () => (recCache = null, recs()), POEMS, run: () => run, answerOf };
})();
