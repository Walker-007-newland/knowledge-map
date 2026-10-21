/* 单词听写：拍照识别课本单词表 → 确认增删 → 随机听写 → 批改 → 错词本
 * 识别用离线的 Tesseract.js（英文 + 简体中文），文件在 vendor/tesseract。
 * 在平板 App 里，这一页走 https://appassets.androidplatform.net/ 虚拟地址（Worker 和 fetch 在 file:// 下用不了），
 * 所以词单存在这个地址自己的 localStorage 里，和图谱进度分开。 */
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
  const TITLES = { vList: '单词听写', vEdit: '确认单词', vSetup: '听写设置', vRun: '听写中', vCheck: '批改', vResult: '听写结果' };
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
    else if (b.dataset.act === 'say') DictRun.say([{ text: rows[i].en, lang: 'en-US' }]);
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
  // 调试用：在控制台里测试解析规则
  window.__dictExtract = extractWords;
})();
