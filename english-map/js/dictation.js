/* 单词听写：拍照识别课本单词表 → 确认增删 → 随机听写 → 批改 → 错词本
 * 识别用离线的 Tesseract.js（英文 + 简体中文），文件在 vendor/tesseract。
 * 在平板 App 里，这一页走 https://appassets.androidplatform.net/ 虚拟地址（Worker 和 fetch 在 file:// 下用不了），
 * 所以词单存在这个地址自己的 localStorage 里，和图谱进度分开。 */
(function () {
  'use strict';
  const STORE = 'fjzk-en-dictation-v1';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const inApp = !!(window.KMBridge && KMBridge.goBack);

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
  const TITLES = { vList: '单词听写', vEdit: '确认单词', vSetup: '听写设置', vRun: '听写中', vCheck: '批改', vResult: '听写结果' };
  let current = 'vList';
  function show(v, push = true) {
    current = v;
    VIEWS.forEach(id => { document.getElementById(id).hidden = id !== v; });
    $('#title').textContent = TITLES[v];
    $('#subtitle').hidden = v !== 'vList';
    if (push) history.pushState({ v }, '', '#' + v.slice(1).toLowerCase());
    window.scrollTo(0, 0);
    keepAwake(v === 'vRun');
  }
  history.replaceState({ v: 'vList' }, '', location.pathname + location.search);
  window.addEventListener('popstate', e => {
    const to = (e.state && e.state.v) || 'vList';
    if (current === 'vRun' && run) {
      if (!confirm('要结束这次听写吗？')) { history.pushState({ v: 'vRun' }, '', '#run'); return; }
      stopRun();
    }
    if (current === 'vEdit' && editDirty && to !== 'vEdit' && !confirm('识别和修改的内容还没保存，确定离开吗？')) {
      history.pushState({ v: 'vEdit' }, '', '#edit'); return;
    }
    // 听写/批改中途不能靠返回键回去重来，统一回到词单
    if (to === 'vRun' || to === 'vCheck') { show('vList', false); renderLists(); return; }
    show(to, false);
    if (to === 'vList') renderLists();
  });
  $('#btnBack').onclick = () => {
    if (current !== 'vList') { history.back(); return; }
    if (inApp) KMBridge.goBack();
    else if (history.length > 1) history.back();
    else location.href = 'index.html';
  };

  // 听写时保持屏幕常亮
  let wakeLock = null;
  function keepAwake(on) {
    if (inApp && KMBridge.keepScreenOn) { KMBridge.keepScreenOn(!!on); return; }
    if (!('wakeLock' in navigator)) return;
    if (on && !wakeLock) navigator.wakeLock.request('screen').then(l => { wakeLock = l; }).catch(() => {});
    if (!on && wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }

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
  $('#btnNewPhoto').onclick = () => { openEdit(null); $('#fileCam').click(); };
  $('#btnNewManual').onclick = () => { openEdit(null); addRow({ en: '', zh: '', on: true }, true); };

  /* ---------------- 编辑词单 ---------------- */
  let editing = null, rows = [], editDirty = false;
  function openEdit(list) {
    editing = list;
    rows = list ? list.words.map(w => ({ en: w.en, zh: w.zh || '', on: true })) : [];
    editDirty = false;
    $('#listName').value = list ? list.name : defaultName();
    $('#ocrStatus').hidden = true;
    renderRows();
    show('vEdit');
  }
  function defaultName() {
    const d = new Date();
    return `词单 ${d.getMonth() + 1}月${d.getDate()}日`;
  }
  function renderRows() {
    $('#wordRows').innerHTML = rows.map((r, i) => `<div class="wrow${r.doubt ? ' doubt' : ''}${r.on ? '' : ' off'}" data-i="${i}">
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
    if (e.target.classList.contains('en')) { r.en = e.target.value; r.doubt = false; row.classList.remove('doubt'); }
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
    else if (b.dataset.act === 'say') say([{ text: rows[i].en, lang: 'en-US' }]);
  });
  $('#btnAddRow').onclick = () => addRow({ en: '', zh: '', on: true }, true);
  $('#btnCheckAll').onclick = () => { rows.forEach(r => { r.on = true; }); renderRows(); };
  $('#btnCheckNone').onclick = () => { rows.forEach(r => { r.on = false; }); renderRows(); };
  $('#btnTakePhoto').onclick = () => $('#fileCam').click();
  $('#btnPickPhoto').onclick = () => $('#filePick').click();
  $('#fileCam').onchange = e => { recognizeFiles([...e.target.files]); e.target.value = ''; };
  $('#filePick').onchange = e => { recognizeFiles([...e.target.files]); e.target.value = ''; };
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

  /* ---------------- 拍照识别 ---------------- */
  let worker = null, workerLoading = null, ocrBusy = false;
  const ocrQueue = [];
  function ocrProgress(text, frac) {
    $('#ocrStatus').hidden = false;
    $('#ocrText').textContent = text;
    $('#ocrBar').style.width = Math.round((frac || 0) * 100) + '%';
  }
  function getWorker() {
    if (worker) return Promise.resolve(worker);
    if (workerLoading) return workerLoading;
    const base = new URL('vendor/tesseract/', location.href).href;
    workerLoading = Tesseract.createWorker(['eng', 'chi_sim'], 1, {
      workerPath: base + 'worker.min.js',
      corePath: base + 'core',
      langPath: base + 'lang',
      workerBlobURL: false,
      cacheMethod: 'none',
      logger: m => {
        if (m.status === 'recognizing text') ocrProgress(`正在识别第 ${ocrIndex} 张…`, m.progress);
        else if (/load|initializ/.test(m.status)) ocrProgress('正在准备识别引擎（第一次稍慢）…', m.progress);
      }
    }).then(w => w.setParameters({ preserve_interword_spaces: '1' }).then(() => { worker = w; return w; }));
    workerLoading.catch(() => { workerLoading = null; });
    return workerLoading;
  }
  let ocrIndex = 0;
  async function recognizeFiles(files) {
    files = files.filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic)$/i.test(f.name));
    if (!files.length) return;
    ocrQueue.push(...files);
    if (ocrBusy) return;
    ocrBusy = true;
    let added = 0, total = 0;
    try {
      ocrProgress('正在准备识别引擎（第一次稍慢）…', 0);
      const w = await getWorker();
      while (ocrQueue.length) {
        const f = ocrQueue.shift();
        ocrIndex++;
        ocrProgress(`正在识别第 ${ocrIndex} 张…`, 0);
        const canvas = await loadImage(f);
        const { data } = await w.recognize(canvas, {}, { text: true, blocks: true });
        const found = extractWords(data);
        total += found.length;
        const have = new Set(rows.map(r => keyOf(r.en)));
        found.forEach(r => { if (!have.has(keyOf(r.en))) { have.add(keyOf(r.en)); rows.push(r); added++; } });
        editDirty = true;
        renderRows();
      }
      ocrProgress(added ? `识别完成，新增 ${added} 个词，请核对。` : (total ? '识别完成，没有新的单词（都已在列表里）。' : '没有识别到单词。请把单词表拍得正一点、清楚一点，或者手动添加。'), 1);
    } catch (err) {
      console.error(err);
      ocrProgress('识别失败：' + (err && err.message || err) + '。可以手动添加单词。', 0);
    } finally {
      ocrBusy = false;
    }
  }
  // 读图并缩放到适合识别的大小，转灰度、拉伸对比度
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const long = Math.max(img.naturalWidth, img.naturalHeight);
        const scale = long > 2400 ? 2400 / long : long < 1200 ? 1200 / long : 1;
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * scale);
        c.height = Math.round(img.naturalHeight * scale);
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0, c.width, c.height);
        const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
        let lo = 255, hi = 0;
        const gray = new Uint8Array(p.length / 4);
        for (let i = 0, j = 0; i < p.length; i += 4, j++) {
          const v = (p[i] * 299 + p[i + 1] * 587 + p[i + 2] * 114) / 1000;
          gray[j] = v; if (v < lo) lo = v; if (v > hi) hi = v;
        }
        const span = Math.max(1, hi - lo);
        for (let i = 0, j = 0; i < p.length; i += 4, j++) {
          const v = (gray[j] - lo) * 255 / span;
          p[i] = p[i + 1] = p[i + 2] = v;
        }
        g.putImageData(d, 0, 0);
        resolve(c);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片打不开')); };
      img.src = url;
    });
  }

  /* 从识别结果里挑出“英文单词/短语 + 中文释义”。课本单词表一行通常是：
   *   apple /ˈæpl/ n. 苹果      look after 照顾      Tom 汤姆（男名）
   * 音标、词性、页码、标题都丢掉；可信度低的标黄让用户核对。 */
  // 词性（含常见误识别：adj. 常被认成 adi. / ad].）
  const POS = /^(n|v|vt|vi|adj|adi|adl|ad\]|adv|prep|pron|conj|num|art|interj|aux|modal|pl|phr|abbr)\.?$/i;
  const TITLE_WORD = /^(unit|module|lesson|starter|section|part|page|period)$/i;
  const TITLE = /^((unit|module|lesson|starter|section|part|page|period)\s*\d+|words and expressions|vocabulary|word list|new words)$/i;
  const KEEP_DOT = /^(sb|sth|Mr|Mrs|Ms|Dr|a\.m|p\.m|etc)\.$/i;
  function extractWords(data) {
    const out = [];
    const lines = [];
    (data.blocks || []).forEach(b => (b.paragraphs || []).forEach(p => (p.lines || []).forEach(l => lines.push(l))));
    if (!lines.length && data.text) data.text.split('\n').forEach(t => lines.push({ text: t, words: [] }));
    lines.forEach(line => {
      const words = (line.words && line.words.length) ? line.words : line.text.split(/\s+/).map(t => ({ text: t, confidence: line.confidence || 80 }));
      splitEntries(words).forEach(ent => out.push(ent));
    });
    return out;
  }
  // 一行里可能有两栏（左右各一个词），按“英文段 + 后面的中文段”切成多个词条
  function splitEntries(words) {
    const ents = [];
    let en = [], zh = [], conf = [], inPhonetic = false, stage = 0; // 0 收英文 1 跳过音标词性 2 收中文
    const flush = () => {
      if (en.length) {
        let phrase = en.join(' ').replace(/[’‘`]/g, "'").replace(/\s+/g, ' ').trim();
        phrase = phrase.replace(/[,;:，；：]+$/, '');
        if (/\.$/.test(phrase) && !KEEP_DOT.test(phrase.split(' ').pop())) phrase = phrase.replace(/\.+$/, '');
        const meaning = zh.join('').replace(/\s+/g, '').replace(/^[^㐀-鿿（(]+/, '').replace(/[,，;；]+$/g, '');
        const okLen = phrase.replace(/[^A-Za-z]/g, '').length >= 2 || /^(a|I)$/.test(phrase);
        if (okLen && phrase.split(' ').length <= 6 && !TITLE.test(phrase) && !/^(sb|sth|etc)\.?$/i.test(phrase)) {
          const c = conf.length ? conf.reduce((s, x) => s + x, 0) / conf.length : 0;
          ents.push({ en: phrase, zh: meaning, on: true, doubt: c < 78 || /[^A-Za-z' .\-]/.test(phrase) });
        }
      }
      en = []; zh = []; conf = []; stage = 0; inPhonetic = false;
    };
    words.forEach(w => {
      const t = (w.text || '').trim();
      if (!t) return;
      const hasZh = /[㐀-鿿]/.test(t);
      const isPos = POS.test(t.replace(/[,;]$/, ''));
      // 音标的结尾斜杠常常认不出来：碰到中文或词性就当音标结束
      if (inPhonetic) {
        if (hasZh || isPos) inPhonetic = false;
        else { if (/[\/\]］]/.test(t)) inPhonetic = false; return; }
      }
      if (/^[\/\[［]/.test(t)) { if (!/^[\/\[［].*[\/\]］].?$/.test(t) || t.length === 1) inPhonetic = true; if (stage === 0 && en.length) stage = 1; return; }
      const isEn = /^[A-Za-z][A-Za-z'’\-.]*[,;]?$/.test(t) && !hasZh;
      if (hasZh) { if (en.length) { stage = 2; zh.push(t); } return; }
      if (stage === 2 && /^[；;，,、（）()…]+$/.test(t)) { zh.push(t.replace(/;/g, '；').replace(/,/g, '，')); return; }
      if (isPos && en.length) { if (stage === 0) stage = 1; return; }
      if (stage === 1 && /^[a-z]{1,4}\.$/i.test(t)) return;       // 音标后面的短词带点，多半是认错的词性
      if (/^\d+$/.test(t) && en.length === 1 && TITLE_WORD.test(en[0])) { en = []; conf = []; return; }  // Unit 3 这类标题
      if (isEn) {
        if (stage === 0) { en.push(t); conf.push(w.confidence); return; }
        flush(); en.push(t); conf.push(w.confidence); return;   // 新的词条开始
      }
      if (/^[（(（].*[)）]?$/.test(t) && stage === 2) { zh.push(t); return; }
      if (/^\d+$/.test(t)) { flush(); return; }                 // 页码、序号
      if (stage === 0 && en.length) stage = 1;                   // 音标残片等，跳过
    });
    flush();
    return ents;
  }

  /* ---------------- 朗读 ---------------- */
  let sayToken = 0;
  // items: [{text, lang, rate}]，全部读完调用 done；读不出来时按估计时长兜底
  function say(items, done) {
    const token = ++sayToken;
    const finish = () => { if (token === sayToken && done) { const d = done; done = null; d(); } };
    if (!('speechSynthesis' in window)) { setTimeout(finish, 1500); return; }
    speechSynthesis.cancel();
    let est = 600;
    items.forEach((it, i) => {
      const u = new SpeechSynthesisUtterance(it.text);
      u.lang = it.lang; u.rate = it.rate || (it.lang === 'en-US' ? 0.8 : 0.9);
      est += 700 + it.text.length * (it.lang === 'en-US' ? 110 : 260);
      if (i === items.length - 1) { u.onend = finish; u.onerror = finish; }
      speechSynthesis.speak(u);
    });
    setTimeout(finish, est + 4000);
  }
  function stopSay() { sayToken++; if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  /* ---------------- 听写设置 ---------------- */
  let setupList = null;
  function openSetup(list, replace) {
    setupList = list;
    $('#setupName').textContent = list.name;
    const nWrong = Object.keys(list.wrong || {}).length;
    $('#nAll').textContent = list.words.length;
    $('#nWrong').textContent = nWrong;
    document.querySelector('[data-opt=scope] [data-v=wrong]').disabled = !nWrong;
    if (db.settings.scope === 'wrong' && !nWrong) db.settings.scope = 'all';
    $('#someN').value = Math.min(db.settings.someN || 10, list.words.length);
    $('#someN').max = list.words.length;
    syncSetup();
    if (replace) { history.replaceState({ v: 'vSetup' }, '', '#setup'); show('vSetup', false); }
    else show('vSetup');
  }
  function syncSetup() {
    document.querySelectorAll('.seg[data-opt]').forEach(seg => {
      const v = String(db.settings[seg.dataset.opt]);
      seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    });
    $('#someWrap').hidden = db.settings.scope !== 'some';
    document.querySelector('.paper-only').hidden = db.settings.mode !== 'paper';
    const hasZh = setupList && setupList.words.some(w => w.zh);
    const tips = [];
    if (db.settings.read !== 'en' && !hasZh) tips.push('这个词单没有中文释义，会只读英文。');
    if (db.settings.mode === 'paper') tips.push('准备好纸和笔，每个词写在对应的序号后面。听写完再对照批改。');
    else tips.push('听到后用键盘输入，按回车进入下一个，结束后自动判分。');
    $('#setupHint').textContent = tips.join(' ');
  }
  document.querySelectorAll('.seg[data-opt]').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    db.settings[seg.dataset.opt] = b.dataset.v; save(); syncSetup();
  }));
  $('#someN').oninput = () => { db.settings.someN = Math.max(1, +$('#someN').value || 1); save(); };
  $('#btnSetupBack').onclick = () => history.back();
  $('#btnStart').onclick = () => startRun(setupList, db.settings.scope);

  /* ---------------- 听写进行 ---------------- */
  const PACE = { fast: [3000, 250], normal: [4500, 380], slow: [6500, 520] };
  let run = null, timer = null, tickStart = 0, tickLen = 0, tickLeft = 0;
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function startRun(list, scope, onlyKeys) {
    let words = list.words.slice();
    if (onlyKeys) words = words.filter(w => onlyKeys.has(keyOf(w.en)));
    else if (scope === 'wrong') words = words.filter(w => (list.wrong || {})[keyOf(w.en)]);
    if (db.settings.order === 'random' || scope === 'some') shuffle(words);
    if (scope === 'some' && !onlyKeys) words = words.slice(0, Math.max(1, Math.min(+db.settings.someN || 10, words.length)));
    if (!words.length) { alert('没有可以听写的单词。'); return; }
    const s = db.settings;
    run = {
      list, scope, words, idx: 0, answers: words.map(() => ''), paused: false,
      mode: s.mode, read: s.read, reps: +s.reps || 2, pace: PACE[s.pace] || PACE.normal
    };
    $('#runTotal').textContent = words.length;
    $('#runInput').hidden = run.mode !== 'type';
    $('#btnPause').hidden = run.mode !== 'paper';
    if (current === 'vSetup') history.replaceState({ v: 'vRun' }, '', '#run'), show('vRun', false);
    else show('vRun');
    playCurrent();
  }
  function stopRun() { clearTimer(); stopSay(); run = null; keepAwake(false); }
  function clearTimer() { if (timer) { cancelAnimationFrame(timer); timer = null; } }
  function speechFor(w) {
    const readZh = w.zh && run.read !== 'en';
    const items = [];
    if (run.read === 'zh' && w.zh) {
      for (let r = 0; r < run.reps; r++) items.push({ text: w.zh, lang: 'zh-CN' });
    } else {
      for (let r = 0; r < run.reps; r++) items.push({ text: w.en, lang: 'en-US' });
      if (readZh) items.push({ text: w.zh, lang: 'zh-CN' });
    }
    return items;
  }
  function playCurrent() {
    if (!run) return;
    clearTimer();
    const w = run.words[run.idx];
    tickLen = 0; run.speaking = true;
    $('#runIdx').textContent = run.idx + 1;
    $('#runZh').textContent = run.read === 'zh' && w.zh ? w.zh : '';
    $('#runBar').style.width = '0%';
    $('#runState').textContent = '请听…';
    $('#btnPrev').disabled = run.idx === 0;
    $('#btnNext').textContent = run.idx === run.words.length - 1 ? '完成 ✓' : '下一个 ⏭';
    if (run.mode === 'type') { const inp = $('#runInput'); inp.value = run.answers[run.idx] || ''; inp.focus(); }
    say(speechFor(w), () => {
      if (!run || run.words[run.idx] !== w) return;
      run.speaking = false;
      if (run.mode === 'type') { $('#runState').textContent = '输入后按回车'; return; }
      const letters = w.en.replace(/[^A-Za-z]/g, '').length;
      startCountdown(Math.min(25000, run.pace[0] + run.pace[1] * letters));
    });
  }
  function startCountdown(ms) {
    tickLen = ms; tickLeft = ms; tickStart = performance.now();
    if (!run.paused) loop();
    else $('#runState').textContent = '已暂停';
  }
  function loop() {
    clearTimer();
    tickStart = performance.now() - (tickLen - tickLeft);
    const step = () => {
      if (!run || run.paused) return;
      const used = performance.now() - tickStart;
      tickLeft = Math.max(0, tickLen - used);
      $('#runBar').style.width = (used / tickLen * 100).toFixed(1) + '%';
      $('#runState').textContent = `写下来… 还有 ${Math.ceil(tickLeft / 1000)} 秒`;
      if (tickLeft <= 0) { timer = null; next(); return; }
      timer = requestAnimationFrame(step);
    };
    timer = requestAnimationFrame(step);
  }
  function next() {
    if (!run) return;
    if (run.mode === 'type') run.answers[run.idx] = $('#runInput').value.trim();
    if (run.idx >= run.words.length - 1) { finishRun(); return; }
    run.idx++; playCurrent();
  }
  $('#btnNext').onclick = () => { stopSay(); next(); };
  $('#btnPrev').onclick = () => {
    if (!run || run.idx === 0) return;
    if (run.mode === 'type') run.answers[run.idx] = $('#runInput').value.trim();
    stopSay(); run.idx--; playCurrent();
  };
  $('#btnRepeat').onclick = () => { if (run) { stopSay(); run.paused = false; $('#btnPause').textContent = '⏸ 暂停'; playCurrent(); } };
  $('#btnPause').onclick = () => {
    if (!run) return;
    run.paused = !run.paused;
    $('#btnPause').textContent = run.paused ? '▶ 继续' : '⏸ 暂停';
    if (run.paused) { clearTimer(); $('#runState').textContent = '已暂停'; }
    else if (run.speaking) $('#runState').textContent = '请听…';   // 还在读，读完会自动开始倒计时
    else if (tickLen && tickLeft > 0) loop();
    else playCurrent();
  };
  $('#btnStop').onclick = () => {
    if (!run) return;
    const done = run.idx + (run.mode === 'type' && $('#runInput').value.trim() ? 1 : 0);
    if (done > 0 && confirm(`已经听写了 ${run.idx + 1} 个，要批改已听写的部分吗？\n（选“取消”直接放弃这次听写）`)) {
      if (run.mode === 'type') run.answers[run.idx] = $('#runInput').value.trim();
      run.words = run.words.slice(0, run.idx + 1);
      run.answers = run.answers.slice(0, run.idx + 1);
      finishRun();
    } else { stopRun(); history.back(); }
  };
  $('#runInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); stopSay(); next(); } });

  /* ---------------- 批改 ---------------- */
  const tidy = s => s.replace(/[’‘`]/g, "'").replace(/\s+/g, ' ').replace(/[.。]+$/, '').trim();
  // 一般不分大小写（平板键盘会自动把首字母变大写）；但答案本身有大写（人名、月份、星期）时必须一致
  function sameAnswer(ans, en) {
    const a = tidy(ans), b = tidy(en);
    return /[A-Z]/.test(b) ? a === b : a.toLowerCase() === b.toLowerCase();
  }
  let checking = null;
  function finishRun() {
    clearTimer(); stopSay(); keepAwake(false);
    const r = run; run = null;
    checking = {
      list: r.list, scope: r.scope, mode: r.mode, words: r.words, answers: r.answers,
      wrong: r.words.map((w, i) => r.mode === 'type' ? !sameAnswer(r.answers[i] || '', w.en) : false)
    };
    $('#checkHint').textContent = r.mode === 'paper'
      ? '对照纸上写的，点一下写错的词标成 ✗（再点一下取消）。'
      : '已经自动判分。拼写其实没错（比如大小写、缩写写法不同）的话，点一下改成 ✓。';
    renderCheck();
    history.replaceState({ v: 'vCheck' }, '', '#check');
    show('vCheck', false);
  }
  function renderCheck() {
    const c = checking;
    $('#checkRows').innerHTML = c.words.map((w, i) => `<div class="crow${c.wrong[i] ? ' wrong' : ''}" data-i="${i}">
      <div class="no">${i + 1}.</div>
      <div><div class="en">${esc(w.en)}</div>
        ${w.zh ? `<div class="zh">${esc(w.zh)}</div>` : ''}
        ${c.mode === 'type' ? `<div class="ans">你写的：${esc(c.answers[i] || '（没写）')}</div>` : ''}</div>
      <div class="mark">${c.wrong[i] ? '✗' : '✓'}</div>
    </div>`).join('');
  }
  $('#checkRows').addEventListener('click', e => {
    const row = e.target.closest('.crow'); if (!row) return;
    const i = +row.dataset.i;
    checking.wrong[i] = !checking.wrong[i];
    row.classList.toggle('wrong', checking.wrong[i]);
    row.querySelector('.mark').textContent = checking.wrong[i] ? '✗' : '✓';
  });
  $('#btnCheckDone').onclick = () => {
    const c = checking, l = c.list;
    l.wrong = l.wrong || {};
    l.history = l.history || [];
    let correct = 0;
    const wrongWords = [];
    c.words.forEach((w, i) => {
      const k = keyOf(w.en);
      if (c.wrong[i]) { l.wrong[k] = (l.wrong[k] || 0) + 1; wrongWords.push(w); }
      else { correct++; delete l.wrong[k]; }       // 这次写对了就移出错词本
    });
    l.history.push({ at: Date.now(), total: c.words.length, correct, scope: c.scope });
    if (l.history.length > 50) l.history.splice(0, l.history.length - 50);
    save();
    showResult(c, correct, wrongWords);
  };

  /* ---------------- 结果 ---------------- */
  let lastWrong = [];
  function showResult(c, correct, wrongWords) {
    lastWrong = wrongWords;
    const total = c.words.length, pct = Math.round(correct / total * 100);
    $('#resScore').textContent = `${correct} / ${total}`;
    $('#resScore').classList.toggle('low', pct < 80);
    $('#resSub').textContent = pct === 100 ? '全对，太棒了！' : `正确率 ${pct}%` + (wrongWords.length ? `，错了 ${wrongWords.length} 个，已记进错词本` : '');
    $('#resWrong').innerHTML = wrongWords.length
      ? '<div class="wrong-list">' + wrongWords.map(w => `<div><b>${esc(w.en)}</b>${esc(w.zh || '')}</div>`).join('') + '</div>' : '';
    $('#btnResWrong').hidden = !wrongWords.length;
    history.replaceState({ v: 'vResult' }, '', '#result');
    show('vResult', false);
  }
  $('#btnResList').onclick = () => { show('vList'); renderLists(); };
  $('#btnResAgain').onclick = () => { if (checking) startRun(checking.list, 'all'); };
  $('#btnResWrong').onclick = () => {
    if (checking && lastWrong.length) startRun(checking.list, 'wrong', new Set(lastWrong.map(w => keyOf(w.en))));
  };

  /* ---------------- 启动 ---------------- */
  renderLists();
  show('vList', false);
  // 调试用：在控制台里测试解析规则
  window.__dictExtract = extractWords;
})();
