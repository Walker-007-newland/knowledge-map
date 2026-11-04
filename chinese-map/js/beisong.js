/* 课文背诵（beisong.html）：古诗词 / 文言文，选一篇 → 对着平板背（App 里离线语音识别，见 knowledge-map-app Asr.java）或家长核对 → 结果
 * 古诗词：data/moxie/poems.js（window.KMX，按册、按课）；文言文：data/beisong/wenyan.js（window.KWY，按年级，小句带 br 段落结束）。
 * 文言文较长，可以选“全文”或某一段背（记录仍按全文的小句序号记）。比对：js/beisong-match.js（按拼音对齐）。
 * 背的时候：原文先遮住，背对的句子显示出来；背错 / 漏背的句子马上标出并给出原句；停顿 5 秒提示下一句开头两个字，再停 5 秒整句提示。
 * 语音模型和识别程序（共约 34 MB）不在安装包里：第一次点“开始背诵”时问一下再下载（KMApp.asrDownload），之后离线用。
 * 32 位平板、浏览器里（没有 KMApp）只能家长核对；调试用 window.__beisong.feed(text) 模拟识别结果。
 * 存储（纳入「我的数据」导出导入与设备同步，合并规则同语文听写，见 hub/km-data.js）：
 *   fjzk-zh-beisong-v1      逐句记录 { "<诗id>#<小句序号>": { r, rt, w: {设备: 背错次数}, n: {设备: 背诵次数} } }
 *   fjzk-zh-beisong-set-v1  古诗词 / 文言文、年级、册、是否显示原文 */
(function () {
  'use strict';
  const STORE = 'fjzk-zh-beisong-v1', SETS = 'fjzk-zh-beisong-set-v1';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const inApp = !!(window.KMApp && KMApp.goBack);
  const GRADES = [4, 5, 6, 7, 8, 9];
  const CN = { 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' };
  const BOOKS = window.KMX.books;
  const POEMS = {};
  BOOKS.forEach(b => b.groups.forEach(g => g.poems.forEach(p => { p.book = b; p.group = g; POEMS[p.id] = p; })));
  // 文言文：每个年级一组，没有作者，段落按 br 分
  const WEN = (window.KWY ? KWY.groups : []).map(g => ({ grade: g.grade, id: 'wen-' + g.grade, name: g.name + '文言文', poems: g.texts }));
  WEN.forEach(g => g.poems.forEach(p => { p.author = p.author || ''; p.wen = true; p.group = g; POEMS[p.id] = p; }));
  const STUCK_MS = 5000;

  /* ---------------- 存储 ---------------- */
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  function readJSON(k) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return isObj(v) ? v : null; } catch (e) { return null; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 存储不可用时只在本次有效 */ } }
  let S = Object.assign({ kind: 'shi', grade: 4, term: '上', show: false }, readJSON(SETS) || {});
  function saveSet() { writeJSON(SETS, S); }
  let recCache = null;
  function recs() { if (!recCache) recCache = readJSON(STORE) || {}; return recCache; }
  function updateRecs(fn) { recCache = null; const all = recs(); fn(all); writeJSON(STORE, all); }
  function devId() { try { return window.KMData ? KMData.device().id : 'web'; } catch (e) { return 'web'; } }
  // 一首诗的状态：没背过 / 全对 / 有几句没背好
  function poemState(p) {
    let seen = 0, bad = 0;
    p.c.forEach((x, i) => { const r = recs()[p.id + '#' + i]; if (isObj(r)) { seen++; if (r.r === 0) bad++; } });
    return seen ? (bad ? { cls: 'bad', txt: bad + ' 句没背好' } : { cls: 'ok', txt: '背过 ✓' }) : { cls: '', txt: '' };
  }
  window.addEventListener('pageshow', () => { recCache = null; if (current === 'vHome') renderHome(); });

  /* ---------------- 页面切换 ---------------- */
  const VIEWS = ['vHome', 'vRun', 'vResult'];
  const TITLES = { vHome: '课文背诵', vRun: '背诵', vResult: '背诵结果' };
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
    stopListen();
    if (to === 'vRun') { show('vHome', false); renderHome(); return; }
    show(to, false);
    if (to === 'vHome') renderHome();
  });
  $('#btnBack').onclick = () => {
    if (current !== 'vHome') { history.back(); return; }
    if (inApp) KMApp.goBack();
    else if (history.length > 1) history.back();
    else location.href = 'index.html';
  };
  window.addEventListener('pagehide', () => stopListen());
  let toastTimer = 0;
  function toast(t) {
    const el = $('#toast');
    el.textContent = t; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ---------------- 选诗 ---------------- */
  const opened = new Set();
  const currentBook = () => BOOKS.find(b => b.grade === S.grade && b.term === S.term) || BOOKS.find(b => b.grade === S.grade) || BOOKS[0];
  const author = p => p.author.replace(/^［(.*)］/, '$1·');
  function renderHome() {
    const wen = S.kind === 'wen';
    $('#kinds').querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.k === S.kind));
    let groups;
    if (wen) {
      if (!WEN.some(g => g.grade === S.grade)) S.grade = WEN[0].grade;
      groups = WEN.filter(g => g.grade === S.grade);
    } else {
      const b = currentBook();
      S.grade = b.grade; S.term = b.term;
      groups = b.groups;
      $('#terms').querySelectorAll('button').forEach(x => {
        x.classList.toggle('on', x.dataset.t === b.term);
        x.disabled = !BOOKS.some(y => y.grade === S.grade && y.term === x.dataset.t);
      });
    }
    $('#terms').hidden = wen;
    $('#bookName').textContent = wen ? '统编版 · 课标篇目 · 点一篇开始背，长文章可以分段背' : '统编版 · 按课本 · 点一首开始背';
    const has = new Set((wen ? WEN : BOOKS).map(x => x.grade));
    $('#grades').innerHTML = GRADES.map(g => `<button class="grade${g === S.grade ? ' on' : ''}${has.has(g) ? '' : ' off'}" data-g="${g}" role="tab" aria-selected="${g === S.grade}">${CN[g]}<span class="g-suffix">年级</span></button>`).join('');
    $('#groups').innerHTML = groups.map(g => {
      const open = opened.has(g.id) || groups.length <= 3;
      return `<div class="unit" data-g="${esc(g.id)}">
        <div class="u-head"><button class="u-tog" aria-expanded="${open}"><span class="u-name">${esc(g.name)}<small>${g.poems.length} ${wen ? '篇' : '首'}</small></span><span class="u-arrow">${open ? '▾' : '▸'}</span></button></div>
        <div class="lessons"${open ? '' : ' hidden'}>${g.poems.map(p => {
          const s = poemState(p);
          return `<button class="lesson bs-row" data-p="${esc(p.id)}"><span class="l-name">${esc(p.title)}<small>　${esc(wen ? p.c.reduce((n, c) => n + c.t.length, 0) + ' 字' : author(p))}</small></span><span class="l-wrong ${s.cls === 'bad' ? 'bad' : ''}${s.cls === 'ok' ? ' bs-ok' : ''}">${esc(s.txt)}</span><span class="u-arrow">›</span></button>`;
        }).join('')}</div>
      </div>`;
    }).join('');
  }
  $('#kinds').addEventListener('click', e => {
    const btn = e.target.closest('button[data-k]'); if (!btn) return;
    S.kind = btn.dataset.k; saveSet(); renderHome();
  });
  $('#grades').addEventListener('click', e => {
    const btn = e.target.closest('button[data-g]'); if (!btn) return;
    const g = +btn.dataset.g;
    if (S.kind === 'wen' && !WEN.some(x => x.grade === g)) { toast(CN[g] + '年级没有要背的文言文'); return; }
    S.grade = g;
    if (!BOOKS.some(b => b.grade === S.grade && b.term === S.term)) S.term = '上';
    saveSet(); renderHome();
  });
  $('#terms').addEventListener('click', e => {
    const btn = e.target.closest('button[data-t]'); if (!btn || btn.disabled) return;
    S.term = btn.dataset.t; saveSet(); renderHome();
  });
  $('#groups').addEventListener('click', e => {
    const row = e.target.closest('.bs-row');
    if (row) { openPoem(POEMS[row.dataset.p]); return; }
    const tog = e.target.closest('.u-tog'); if (!tog) return;
    const id = tog.closest('.unit').dataset.g;
    if (opened.has(id)) opened.delete(id); else opened.add(id);
    renderHome();
  });

  /* ---------------- 背诵 ---------------- */
  let asrOk = false;      // 这台设备能语音背诵（App 里、64 位）
  let modelReady = false, dlBusy = false;
  function readModel() { try { const m = JSON.parse(KMApp.asrModel() || '{}'); modelReady = !!m.ready; dlBusy = !!m.downloading; } catch (e) { modelReady = false; } }
  if (inApp && KMApp.ready) KMApp.ready().then(() => { asrOk = !!KMApp.asrAvailable(); if (asrOk) readModel(); if (current === 'vRun') syncButtons(); });
  const MB = n => (n / 1048576).toFixed(1);
  let run = null;   // { poem, part, off, P, mode: 'voice'|'parent', heard, A, cls: 每句状态, hint: {句号: 1 开头两字 / 2 整句}, told: 已经提示过错的句子, last: 上次有进展的时间 }
  // 段落：[{ from, to }]（小句序号，to 不含）；古诗词不分段
  function partsOf(p) {
    if (!p.wen) return [];
    const out = [];
    let from = 0;
    p.c.forEach((c, i) => { if (c.br) { out.push({ from, to: i + 1 }); from = i + 1; } });
    return out.length > 1 ? out : [];
  }
  const LEN = p => p.c.reduce((n, c) => n + c.t.length, 0);
  function openPoem(p, part) {
    stopListen();
    const parts = partsOf(p);
    // 400 字以上的长文默认从第一段开始背
    if (part === undefined) part = parts.length && LEN(p) > 400 ? 0 : -1;
    const rg = part >= 0 && parts[part] ? parts[part] : { from: 0, to: p.c.length };
    run = { poem: p, part, off: rg.from, P: BeiMatch.prepare({ c: p.c.slice(rg.from, rg.to) }), mode: '', heard: '', A: null, cls: null, hint: {}, told: {}, mark: {}, last: 0, listening: false };
    run.A = BeiMatch.align(run.P, '');
    run.cls = BeiMatch.judge(run.P, run.A, false);
    $('#runPoem').innerHTML = `《${esc(p.title)}》<small>${esc(p.author || '')}${part >= 0 ? `第 ${part + 1} 段` : ''}</small>`;
    $('#runText').classList.toggle('wen', !!p.wen);
    $('#runParts').hidden = !parts.length;
    $('#runParts').innerHTML = parts.length ? `<span>分段背：</span><button class="btn${part < 0 ? ' on' : ''}" data-part="-1">全文</button>` +
      parts.map((x, i) => `<button class="btn${part === i ? ' on' : ''}" data-part="${i}">第 ${i + 1} 段</button>`).join('') : '';
    $('#chkShow').checked = !!S.show;
    $('#runHint').hidden = true;
    $('#runState').textContent = '';
    $('#runMic').style.setProperty('--lv', 0);
    syncButtons();
    renderText();
    if (current === 'vRun') history.replaceState({ v: 'vRun' }, '', '#run'), show('vRun', false); else show('vRun');
  }
  function syncButtons() {
    const started = run && run.mode;
    $('#btnVoice').hidden = !!started || !asrOk;
    $('#btnVoice').disabled = dlBusy;
    $('#btnVoice').textContent = modelReady ? '🎤 开始背诵' : dlBusy ? '正在下载语音模型…' : '🎤 开始背诵（先下载语音模型）';
    $('#btnParent').hidden = !!started;
    $('#runParts').querySelectorAll('button').forEach(b => { b.disabled = !!started; });
    $('#btnFinish').hidden = !started;
    $('#runStatus').hidden = !(run && run.mode === 'voice');
    $('#runTip').textContent = started
      ? (run.mode === 'voice' ? '大声、一句一句背；背完点“背完了”。' : '孩子背，家长看着原文：点一下句子标成背错（再点一下是提示过，再点回到正确）。')
      : asrOk ? (modelReady ? '点“开始背诵”后对着平板背，第一次会请求使用麦克风。' : '第一次语音背诵要先下载语音模型（约 34 MB，建议连 Wi-Fi），下载后不联网也能用。')
        : (inApp ? '这台平板（32 位）用不了语音背诵，可以请家长核对。' : '在浏览器里没有语音识别，可以请家长核对；平板 App 里能语音背诵。');
  }
  // 原文：每句一段；没背到的句子遮住（显示原文时灰色），背对的绿色，背错 / 漏背的标出来并给原句
  function renderText() {
    const P = run.P, showAll = $('#chkShow').checked || run.mode === 'parent';
    $('#runText').innerHTML = P.clauses.map((c, i) => {
      const st = run.mode === 'parent' ? (run.mark[i] || 'ok') : run.cls[i].st, h = run.hint[i] || 0;
      let body;
      if (run.mode !== 'parent' && (st === 'todo' || st === 'cur') && !showAll) {
        // 遮住：提示过的露出开头两个字或整句
        const shown = h >= 2 ? c.t.length : h === 1 ? Math.min(2, c.t.length) : 0;
        body = [...c.t].map((ch, k) => k < shown ? `<b class="bs-peek">${esc(ch)}</b>` : '<i class="bs-mask"></i>').join('');
      } else body = esc(c.t);
      return `<span class="bs-c st-${st}${h && run.mode !== 'parent' ? ' hinted' : ''}" data-i="${i}">${body}</span>${esc(c.p)}${lineEnd(run.poem, c)}`;
    }).join('');
  }
  // 换行：古诗词每句（。？！；）一行，文言文按原文分段
  const lineEnd = (p, c) => (p.wen ? (c.br ? '<br>' : '') : (/[。？！；]/.test(c.p) ? '<br>' : ''));
  $('#runParts').addEventListener('click', e => {
    const b = e.target.closest('button[data-part]'); if (!b || b.disabled || !run || run.mode) return;
    openPoem(run.poem, +b.dataset.part);
  });
  $('#chkShow').onchange = () => { S.show = $('#chkShow').checked; saveSet(); renderText(); };

  /* 语音背诵 */
  $('#btnVoice').onclick = () => {
    if (!run || !asrOk || dlBusy) return;
    readModel();
    if (!modelReady) {
      if (!confirm('语音背诵要先下载语音模型（约 34 MB，只下载一次，建议连 Wi-Fi）。现在下载吗？')) return;
      dlBusy = true; syncButtons();
      $('#runTip').textContent = '正在下载语音模型…';
      KMApp.asrDownload();
      return;
    }
    run.mode = 'voice'; run.heard = ''; run.last = Date.now();
    syncButtons(); renderText();
    $('#runState').textContent = '正在准备语音识别…';
    KMApp.asrStart(run.P.clauses.map(c => c.t).join('/'));
    if (KMApp.keepScreenOn) KMApp.keepScreenOn(true);
    startStuckTimer();
  };
  function stopListen() {
    if (run && run.listening && inApp) KMApp.asrStop();
    if (run) run.listening = false;
    clearInterval(stuckTimer);
    if (inApp && KMApp.keepScreenOn) KMApp.keepScreenOn(false);
  }
  // 原生识别的事件（Asr.java）：state / text / level / error
  window.__kmAsrEvent = json => {
    let e; try { e = JSON.parse(json); } catch (err) { return; }
    // 模型下载：不管在不在背
    if (e.type === 'dl') { dlBusy = true; if (run && !run.mode) $('#runTip').textContent = `正在下载语音模型… ${MB(e.got)} / ${MB(e.total)} MB`; return; }
    if (e.type === 'dl-done') { dlBusy = false; modelReady = true; if (run && !run.mode) syncButtons(); toast('语音模型下载好了，点“开始背诵”吧'); return; }
    if (e.type === 'error' && e.code === 'dl') { dlBusy = false; if (run && !run.mode) syncButtons(); toast('语音模型下载失败，检查一下网络再试：' + (e.msg || '')); return; }
    if (!run || run.mode !== 'voice') return;
    if (e.type === 'state') {
      run.listening = e.state === 'listening';
      $('#runState').textContent = e.state === 'loading' ? '正在准备语音识别（第一次要几秒钟）…' : e.state === 'listening' ? '正在听，开始背吧' : '';
      if (e.state === 'listening') run.last = Date.now();
    } else if (e.type === 'level') {
      $('#runMic').style.setProperty('--lv', e.v);
    } else if (e.type === 'text') {
      onHeard(e.text);
    } else if (e.type === 'error') {
      run.listening = false;
      $('#runState').textContent = '';
      toast(e.code === 'perm' ? '没有麦克风权限：可以在系统设置里给“知识图谱”打开麦克风，或者请家长核对' : '语音识别出错了：' + (e.msg || e.code));
      run.mode = ''; syncButtons(); renderText();
    }
  };
  function onHeard(text) {
    if (text === run.heard) return;
    const before = run.A.pos;
    run.heard = text;
    run.A = BeiMatch.align(run.P, text);
    run.cls = BeiMatch.judge(run.P, run.A, false);
    if (run.A.pos > before) { run.last = Date.now(); hideHint(); }
    // 刚背过去的句子背错了 / 漏了：马上提示原句
    run.cls.forEach((c, i) => {
      if ((c.st === 'wrong' || c.st === 'skip') && !run.told[i]) {
        run.told[i] = 1;
        showHint((c.st === 'skip' ? '漏了一句：' : '这句背错了，应该是：') + '「' + run.P.clauses[i].t + '」', 'bad');
      }
    });
    renderText();
    if (run.A.pos >= run.P.chars.length && run.cls.every(c => c.st !== 'cur' && c.st !== 'todo')) finish();
  }
  // 卡住了：5 秒没进展，提示下一句开头两个字；再 5 秒，整句
  let stuckTimer = 0;
  function startStuckTimer() {
    clearInterval(stuckTimer);
    stuckTimer = setInterval(() => {
      if (!run || run.mode !== 'voice' || !run.listening) return;
      if (Date.now() - run.last < STUCK_MS) return;
      // 要提示的是还没背完的第一句（刚背完一整句停下来，提示的是下一句）
      const i = run.P.clauses.findIndex(c => c.end > run.A.pos);
      if (i < 0) return;
      const lvl = (run.hint[i] || 0) + 1;
      if (lvl > 2) return;
      run.hint[i] = lvl;
      run.last = Date.now();
      const t = run.P.clauses[i].t;
      showHint(lvl === 1 ? `想不起来了？下一句开头是「${t.slice(0, 2)}……」` : `下一句是「${t}」`, 'tip');
      renderText();
    }, 500);
  }
  function showHint(t, kind) { const el = $('#runHint'); el.textContent = t; el.className = 'bs-hint ' + kind; el.hidden = false; }
  function hideHint() { const el = $('#runHint'); if (el.classList.contains('tip')) el.hidden = true; }

  /* 家长核对 */
  $('#btnParent').onclick = () => {
    if (!run) return;
    run.mode = 'parent'; run.mark = {};
    syncButtons(); renderText();
  };
  $('#runText').addEventListener('click', e => {
    if (!run || run.mode !== 'parent') return;
    const c = e.target.closest('.bs-c'); if (!c) return;
    const i = +c.dataset.i, order = ['ok', 'wrong', 'hint'];
    run.mark[i] = order[(order.indexOf(run.mark[i] || 'ok') + 1) % 3];
    renderText();
  });
  $('#btnFinish').onclick = () => finish();

  /* ---------------- 结果 ---------------- */
  let lastPoem = null, lastPart = -1;
  function finish() {
    if (!run || !run.mode) return;
    stopListen();
    const r = run, P = r.P;
    let res;
    if (r.mode === 'voice') {
      r.A = BeiMatch.align(P, r.heard);
      res = BeiMatch.judge(P, r.A, true).map((c, i) => ({ st: c.st === 'ok' && r.hint[i] ? 'hint' : c.st, heard: c.heard }));
    } else {
      res = P.clauses.map((c, i) => ({ st: r.mark[i] || 'ok', heard: '' }));
    }
    // todo（结束时还没背到）算漏背
    res.forEach(x => { if (x.st === 'todo' || x.st === 'cur') x.st = 'skip'; });
    const now = Date.now(), me = devId();
    updateRecs(all => res.forEach((x, i) => {
      const key = r.poem.id + '#' + (r.off + i), bad = x.st !== 'ok';
      const e = isObj(all[key]) ? all[key] : {};
      e.r = bad ? 0 : 1; e.rt = now;
      e.n = isObj(e.n) ? e.n : {}; e.n[me] = (+e.n[me] || 0) + 1;
      e.w = isObj(e.w) ? e.w : {}; if (bad) e.w[me] = (+e.w[me] || 0) + 1;
      all[key] = e;
    }));
    lastPoem = r.poem; lastPart = r.part;
    const total = res.length, ok = res.filter(x => x.st === 'ok').length;
    const cnt = st => res.filter(x => x.st === st).length;
    $('#resScore').textContent = `${ok} / ${total}`;
    $('#resScore').classList.toggle('low', ok < total);
    $('#resSub').textContent = ok === total ? '一句不差，背得真熟！'
      : [cnt('wrong') && `背错 ${cnt('wrong')} 句`, cnt('skip') && `漏背 ${cnt('skip')} 句`, cnt('hint') && `提示后背出 ${cnt('hint')} 句`].filter(Boolean).join('，');
    $('#resText').innerHTML = `<div class="bs-poem">《${esc(r.poem.title)}》<small>${esc(r.poem.author || '')}${r.part >= 0 ? `第 ${r.part + 1} 段` : ''}</small></div>` + P.clauses.map((c, i) =>
      `<span class="bs-c st-${res[i].st}">${esc(c.t)}</span>${esc(c.p)}${lineEnd(r.poem, c)}`).join('');
    $('#resText').classList.toggle('wen', !!r.poem.wen);
    const LABEL = { wrong: '背错', skip: '漏背', hint: '提示后背出' };
    const issues = res.map((x, i) => x.st === 'ok' ? '' : `<div class="bs-issue st-${x.st}"><b>${LABEL[x.st]}</b>「${esc(P.clauses[i].t)}」${x.heard && x.st === 'wrong' ? `<small>听到的是：${esc(x.heard)}</small>` : ''}</div>`).join('');
    $('#resIssues').innerHTML = issues ? '<h3 class="bs-h">要再练的句子</h3>' + issues : '';
    run = null;
    history.replaceState({ v: 'vResult' }, '', '#result');
    show('vResult', false);
  }
  $('#btnResList').onclick = () => { show('vHome'); renderHome(); };
  $('#btnResAgain').onclick = () => { if (lastPoem) openPoem(lastPoem, lastPart); };

  /* ---------------- 启动 ---------------- */
  renderHome();
  show('vHome', false);
  // 调试 / 测试：模拟语音识别（浏览器里没有 KMApp）
  window.__beisong = {
    S, POEMS, recs: () => (recCache = null, recs()),
    open: (id, part) => openPoem(POEMS[id], part),
    voice: () => { if (!run) return; asrOk = true; run.mode = 'voice'; run.heard = ''; run.listening = true; run.last = Date.now(); syncButtons(); renderText(); startStuckTimer(); },
    feed: text => window.__kmAsrEvent(JSON.stringify({ type: 'text', text })),
    run: () => run
  };
})();
