// 通用：转义、提示、页面栈、弹出卡片、选文件；首页、导入、设置、生词本
const $ = (s, el) => (el || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg, t) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, t || 2200);
}

// ---------- 页面栈：views[名字] = {render(el, params), act(name, target, ev), leave(), back()}
const views = {};
const stack = [];
function curView() { return stack[stack.length - 1]; }
// leave(popped)：popped = 这一页被关掉（不是被新页面盖住）
function go(name, params) {
  const c = curView();
  if (c && views[c.name].leave) views[c.name].leave(false);
  stack.push({ name, params: params || {} });
  show();
}
function replaceView(name, params) {
  const c = stack.pop();
  if (c && views[c.name].leave) views[c.name].leave(true);
  stack.push({ name, params: params || {} });
  show();
}
function show() {
  const c = curView();
  document.body.classList.remove('see-through');
  $('#app').innerHTML = '';
  views[c.name].render($('#app'), c.params);
}
function back() {
  if (sheet.length) { popSheet(); return true; }
  const c = curView();
  if (c && views[c.name].back && views[c.name].back()) return true;
  if (stack.length <= 1) return false;
  if (views[c.name].leave) views[c.name].leave(true);
  stack.pop();
  show();
  return true;
}
window.goBack = back;
function refreshView() { const c = curView(); if (c && views[c.name].refresh) views[c.name].refresh(); }

// ---------- 弹出卡片（可以一层层点进去，‹ 返回上一层）：页 = {html(), act(name, el)}
const sheet = [];
function openSheet(page) { sheet.length = 0; pushSheet(page); }
function pushSheet(page) { sheet.push(page); drawSheet(); }
function popSheet() { sheet.pop(); drawSheet(); }
function closeSheet() { sheet.length = 0; drawSheet(); }
function drawSheet() {
  const box = $('#sheet');
  if (!sheet.length) { box.hidden = true; $('#sheetBody').innerHTML = ''; return; }
  box.hidden = false;
  $('#sheetBack').hidden = sheet.length < 2;
  $('#sheetBody').innerHTML = sheet[sheet.length - 1].html();
  $('#sheetBody').scrollTop = 0;
}
function redrawSheet() { if (sheet.length) { const y = $('#sheetBody').scrollTop; drawSheet(); $('#sheetBody').scrollTop = y; } }

document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-act]');
  if (!t) return;
  const act = t.dataset.act;
  if (act === 'sheet-close') return closeSheet();
  if (act === 'sheet-back') return popSheet();
  if (act === 'back') return back();
  if (t.closest('#sheet')) { const p = sheet[sheet.length - 1]; if (p && p.act) p.act(act, t, ev); return; }
  const c = curView();
  if (c && views[c.name].act) views[c.name].act(act, t, ev);
});

// ---------- 选文件
function pickFile(accept) {
  return new Promise(res => {
    const inp = $('#filePick');
    inp.value = '';
    inp.accept = accept || '';
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return res(null);
      f.arrayBuffer().then(buf => res({ name: f.name, buf, file: f }), () => res(null));
    };
    inp.click();
  });
}
// 选视频：App 里走系统文件选择（拿长期读取权限，下次打开不用再选）；浏览器里只是临时地址
function pickVideo() {
  return new Promise(res => {
    if (N) { window.__picked = j => res(j ? JSON.parse(j) : null); N.pickVideo(); return; }
    pickFile('video/*,.mkv').then(f => res(f ? { name: f.name, url: URL.createObjectURL(f.file) } : null));
  });
}
function hasVideo(m) { const v = m && m.video; return !!(v && (v.uri || v.url || v.demo)); }
function videoSrc(v) {
  if (!v) return null;
  if (N) return { uri: v.uri };
  return { url: v.demo ? 'demo/demo.mp4' : v.url };
}

// ---------- 链接下载：原生下载服务在后台下（App 退出、锁屏也接着下），这里查进度。浏览器调试时用不了
const DL = {
  list() { if (!N || !N.dlList) return []; try { return JSON.parse(N.dlList()); } catch (e) { return []; } },
  job(id) { return this.list().find(j => j.id === id) || null; },
  active(j) { return !!j && /^(queued|running|remuxing)$/.test(j.status); },
  pct(j) { return j.kind === 'hls' ? (j.segTotal ? Math.floor(100 * j.segDone / j.segTotal) : 0) : (j.total ? Math.floor(100 * j.bytes / j.total) : 0); },
  size(b) { return b >= 1073741824 ? (b / 1073741824).toFixed(1) + ' GB' : Math.round(b / 1048576) + ' MB'; },
  label(j) {
    if (!j) return '下载任务不见了';
    const p = this.pct(j);
    if (j.status === 'queued') return '排队等下载…';
    if (j.status === 'running') {
      if (j.kind === 'hls') return j.segTotal ? `下载中 ${p}%（${j.segDone} / ${j.segTotal} 段，${this.size(j.bytes)}）` : '正在读取播放列表…';
      return j.total ? `下载中 ${p}%（${this.size(j.bytes)} / ${this.size(j.total)}）` : `已下载 ${this.size(j.bytes)}`;
    }
    if (j.status === 'remuxing') return '下载完了，正在合并成 MP4…';
    if (j.status === 'paused') return '已暂停' + (p ? ` ${p}%` : '');
    if (j.status === 'error') return '下载失败：' + j.err;
    if (j.status === 'done') return '下载完成';
    return j.status;
  },
  // 下载任务的操作按钮（暂停 / 继续 / 删除）
  buttons(j) {
    if (!j || j.status === 'done') return '';
    return (this.active(j) ? `<button class="btn small" data-act="dl-pause" data-id="${j.id}">暂停</button>` : `<button class="btn small" data-act="dl-resume" data-id="${j.id}">${j.status === 'error' ? '重试' : '继续'}</button>`)
      + `<button class="btn small" data-act="dl-remove" data-id="${j.id}">删除</button>`;
  },
};
// 页面上 data-dl="任务号" 的元素每秒更新进度；有任务下完、失败或暂停就刷新当前页
const dlSeen = {};
setInterval(() => {
  if (!N || !N.dlList) return;
  const jobs = DL.list();
  let changed = false;
  for (const j of jobs) {
    if (dlSeen[j.id] && dlSeen[j.id] !== j.status && /^(done|error|paused)$/.test(j.status)) changed = true;
    dlSeen[j.id] = j.status;
  }
  document.querySelectorAll('[data-dl]').forEach(el => { el.textContent = DL.label(jobs.find(x => x.id === el.dataset.dl)); });
  if (changed) refreshView();
}, 1000);
// 下载任务按钮，哪个页面都一样处理；不是下载按钮返回 false
function dlAct(a, t) {
  const id = t.dataset.id;
  if (a === 'dl-pause') N.dlPause(id);
  else if (a === 'dl-resume') N.dlResume(id);
  else if (a === 'dl-remove') {
    if (!confirm('删除这个下载？已经下了的部分也会删掉。')) return true;
    N.dlRemove(id, true);
    for (const m of Movies.list()) if (m.video && m.video.dl === id && !m.video.uri) Movies.update(m.id, { video: null });
  } else return false;
  setTimeout(refreshView, 300);
  return true;
}

// 下载的视频下完了：把文件地址记进电影，以后直接播
function resolveVideo(id) {
  const m = Movies.get(id);
  if (!m || !m.video || !m.video.dl || m.video.uri) return m;
  const j = DL.job(m.video.dl);
  if (j && j.status === 'done' && j.uri) return Movies.update(id, { video: Object.assign({}, m.video, { uri: j.uri, name: j.name }) });
  return m;
}

// 下载字幕这类小文件（原生去下，网页自己跨域下不了）
const fetchCbs = {};
function fetchFile(url) {
  return new Promise((res, rej) => {
    if (!N || !N.fetchText) return rej(new Error('链接下载只在平板 App 里能用'));
    const id = 'f' + Date.now() + Math.random().toString(36).slice(2, 6);
    fetchCbs[id] = { res, rej };
    N.fetchText(id, url);
  });
}
window.__fetched = (id, ok, data) => {
  const cb = fetchCbs[id];
  delete fetchCbs[id];
  if (!cb) return;
  if (!ok) return cb.rej(new Error(data));
  const bin = atob(data), b = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
  cb.res(b.buffer);
};
function isLink(u) { return /^https?:\/\/\S+$/i.test(u); }
function nameFromUrl(u) {
  let last = '';
  try { last = decodeURIComponent(new URL(u).pathname.split('/').pop() || ''); } catch (e) { /* 不是网址 */ }
  return /^(index|playlist|master|video|prog_index)?\.?(m3u8?)?$/i.test(last) ? '' : last;
}
function saveText(name, text) {
  if (N) { N.saveFile(name, text); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
}
window.__fileSaved = (ok, msg) => toast(msg);

function titleFromFile(name) {
  let t = name.replace(/\.[^.]+$/, '').replace(/[._]+/g, ' ').trim();
  const y = t.match(/^(.+?)\s(19|20)\d{2}\b/);
  if (y) t = y[1];
  return t.replace(/\s(1080p|720p|2160p|4k|bluray|web-?dl|hdrip|x26[45]).*$/i, '').trim() || name;
}

// ---------- 电影数据
const Movies = {
  list() { return Store.get('movies', []); },
  save(list) { Store.set('movies', list); },
  get(id) { return this.list().find(m => m.id === id) || null; },
  update(id, patch) { const l = this.list(); const m = l.find(x => x.id === id); if (m) { Object.assign(m, patch); this.save(l); } return m; },
  body(id) { return Store.get('m.' + id, null); },
  saveBody(id, body) { Store.set('m.' + id, body); },
  prog(id) { return Store.get('p.' + id, { lines: {} }); },
  saveProg(id, p) { Store.set('p.' + id, p); },
  remove(id) { this.save(this.list().filter(m => m.id !== id)); Store.remove('m.' + id); Store.remove('p.' + id); },
  create(title, cues, extra) {
    const id = 'mv' + Date.now().toString(36);
    this.saveBody(id, { cues, pack: extra.pack || null });
    const l = this.list();
    l.unshift(Object.assign({ id, title, created: Date.now(), n: cues.length }, extra.meta));
    this.save(l);
    return id;
  },
};

function checkPack(data) {
  if (!data || data.type !== 'watch-english-pack' || !Array.isArray(data.lines)) throw new Error('这不是精讲包文件');
  return data;
}

// ---------- 首页
views.home = {
  render(el) {
    const list = Movies.list().map(m => resolveVideo(m.id) || m);
    const nb = Object.values(Words).filter(r => r.w && !r.k).length;
    const jobs = DL.list().filter(j => j.status !== 'done');
    el.innerHTML = `
      <div class="top"><h1>🎬 看剧学英文</h1>
        <button class="btn small" data-act="wordbook">★ 生词本 ${nb || ''}</button>
        <button class="btn-icon" data-act="settings" title="设置">⚙</button></div>
      <div class="page">
        <div class="btns"><button class="btn primary" data-act="import">＋ 导入电影</button></div>
        ${jobs.length ? `<h3>下载</h3><div class="list">${jobs.map(j => `<div class="row"><div class="head"><span class="grow">${esc(j.name)}</span>${DL.buttons(j)}</div>
          <div class="small ${j.status === 'error' ? '' : 'mute'}" data-dl="${j.id}">${esc(DL.label(j))}</div></div>`).join('')}</div>` : ''}
        ${list.length ? list.map(m => `
          <div class="card movie" data-act="open" data-id="${m.id}">
            <div class="poster">${esc((m.title.match(/[A-Za-z0-9一-鿿]/) || ['?'])[0].toUpperCase())}</div>
            <div class="grow">
              <div class="title">${esc(m.title)}${m.pack ? '<span class="badge">精讲包</span>' : ''}${hasVideo(m) ? '' : m.video && m.video.dl ? '<span class="badge gray">视频下载中</span>' : '<span class="badge gray">无视频</span>'}</div>
              ${m.video && m.video.dl && !m.video.uri ? `<div class="small" data-dl="${m.video.dl}">${esc(DL.label(DL.job(m.video.dl)))}</div>` : ''}
              <div class="mute small">台词 ${m.n} 句${m.hw != null ? ` · 难词 ${m.hw} · 难句 ${m.hl}` : ''}${m.last && m.last.t ? ` · 看到 ${Subs.fmt(m.last.t)}` : ''}</div>
              ${m.hw ? `<div class="bar"><i style="width:${Math.round(100 * (m.mastered || 0) / m.hw)}%"></i></div><div class="mute small">已掌握难词 ${m.mastered || 0} / ${m.hw}</div>` : ''}
            </div>
          </div>`).join('') : `
          <div class="empty">还没有电影。<br>把电影视频和字幕文件（.srt / .ass）拷到平板上，点「导入电影」。<br><br>
            <button class="btn" data-act="demo">先试试示例短片</button></div>`}
        <div class="card small mute">
          <b>怎么用：</b>① 导入：视频 + 英文或中英双语字幕（另有中文字幕也可以一起导入）；
          ② 学习：App 用离线词典按你的水平（设置里改，现在是「${LEVELS.find(x => x.lv === Settings.level).name}」）挑出难词、难句，逐个讲解；
          ③ 测试：单词、句子选意思，错的进生词本，按间隔复习；
          ④ 观看：英文字幕 / 中英字幕 / 无字幕，点字幕里的词直接查。<br>
          想要逐句精讲：把字幕文件交给电脑上的 Claude 做成「精讲包」（.json），在电影页右上角 ⋯ 导入。
        </div>
      </div>`;
  },
  act(a, t) {
    if (dlAct(a, t)) return;
    if (a === 'import') go('import');
    else if (a === 'open') go('movie', { id: t.dataset.id });
    else if (a === 'settings') go('settings');
    else if (a === 'wordbook') go('wordbook');
    else if (a === 'demo') addDemo();
  },
  refresh() { show(); },
};

function addDemo() {
  const done = () => {
    const D = window.WE_DEMO;
    const id = Movies.create(D.title, Subs.parse(D.srt), { pack: D.pack, meta: { video: { uri: 'asset:demo/demo.mp4', name: 'demo.mp4', demo: true }, sub: 'demo.srt', pack: { made: D.pack.made } } });
    go('movie', { id });
  };
  if (window.WE_DEMO) return done();
  const s = document.createElement('script');
  s.src = 'demo/demo.js';
  s.onload = done;
  s.onerror = () => toast('示例加载失败');
  document.head.appendChild(s);
}

// ---------- 导入
views.import = {
  render(el, p) {
    this.p = p;
    p.st = p.st || { title: '' };
    const st = p.st;
    const en = st.en, zh = st.zh;
    const merged = en ? (zh ? Subs.mergeZh(en.cues.map(c => Object.assign({}, c)), zh.cues) : en.cues) : null;
    const s = merged && Subs.stats(merged);
    el.innerHTML = `
      <div class="top"><button class="btn-icon" data-act="back">‹</button><h1>导入电影</h1></div>
      <div class="page">
        <div class="field"><label>片名</label><input type="text" id="title" value="${esc(st.title)}" placeholder="选了文件会自动填"></div>
        <div class="card step"><div class="n ${st.video ? 'done' : ''}">1</div><div class="grow">
          <b>视频</b> <span class="mute small">（可选，MP4 / MKV；能在平板自带播放器里放的都行）</span>
          <div class="file-name">${st.video ? esc(st.video.dl ? '链接下载：' + st.video.name : st.video.name) : ''}</div>
          ${st.video && st.video.dl ? `<div class="small" data-dl="${st.video.dl}">${esc(DL.label(DL.job(st.video.dl)))}</div>` : ''}
          <div class="btns"><button class="btn" data-act="pick-video">选择视频文件</button><button class="btn" data-act="link" data-v="video">从链接下载</button></div>
          ${st.link === 'video' ? linkBox('video', '粘贴视频链接：https://… .mp4 / .mkv / .m3u8', '开始下载') : ''}</div></div>
        <div class="card step"><div class="n ${en ? 'done' : ''}">2</div><div class="grow">
          <b>英文字幕或中英双语字幕</b> <span class="mute small">（必选，.srt / .ass / .vtt）</span>
          <div class="file-name">${en ? esc(en.name) : ''}</div>
          ${s ? `<div class="small">识别到英文台词 ${s.en} 句，其中带中文翻译 ${s.zh} 句</div>` : ''}
          <div class="btns"><button class="btn" data-act="pick-en">${en ? '换一个' : '选择字幕文件'}</button><button class="btn" data-act="link" data-v="en">粘贴字幕链接</button></div>
          ${st.link === 'en' ? linkBox('en', '粘贴字幕链接：https://… .srt / .ass / .vtt', '下载字幕') : ''}</div></div>
        <div class="card step"><div class="n ${zh ? 'done' : ''}">3</div><div class="grow">
          <b>中文字幕</b> <span class="mute small">（可选：上一步的字幕里没有中文时，再选一个中文字幕，按时间自动对上）</span>
          <div class="file-name">${zh ? esc(zh.name) : ''}</div>
          <div class="btns"><button class="btn" data-act="pick-zh">${zh ? '换一个' : '选择中文字幕'}</button><button class="btn" data-act="link" data-v="zh">粘贴字幕链接</button>${zh ? '<button class="btn" data-act="no-zh">不要了</button>' : ''}</div>
          ${st.link === 'zh' ? linkBox('zh', '粘贴中文字幕链接：https://… .srt / .ass', '下载字幕') : ''}</div></div>
        <div class="card step"><div class="n ${st.pack ? 'done' : ''}">4</div><div class="grow">
          <b>精讲包</b> <span class="mute small">（可选，以后也能在电影页导入）</span>
          <div class="file-name">${st.pack ? esc(st.pack.name) + `（讲解 ${st.pack.data.lines.length} 句）` : ''}</div>
          <div class="btns"><button class="btn" data-act="pick-pack">${st.pack ? '换一个' : '选择精讲包'}</button></div></div></div>
        <div class="btns"><button class="btn primary" data-act="finish" ${en && s.en ? '' : 'disabled'}>开始学习</button></div>
      </div>`;
    $('#title').oninput = e => { st.title = e.target.value; };
    const li = $('#linkInput');
    if (li) li.focus();
  },
  async act(a, t) {
    const st = this.p.st;
    const redraw = () => show();
    if (dlAct(a, t)) return;
    if (a === 'pick-video') {
      const v = await pickVideo();
      if (!v) return;
      if (st.video && st.video.dl) N.dlRemove(st.video.dl, true);
      st.video = v;
      if (!st.title) st.title = titleFromFile(v.name);
      redraw();
    } else if (a === 'link') {
      if (!N) return toast('链接下载只在平板 App 里能用');
      st.link = st.link === t.dataset.v ? null : t.dataset.v;
      redraw();
    } else if (a === 'link-go') {
      const url = $('#linkInput').value.trim();
      if (!isLink(url)) return toast('请粘贴以 http:// 或 https:// 开头的完整链接');
      const kind = t.dataset.v;
      if (kind === 'video') {
        if (!st.title && nameFromUrl(url)) st.title = titleFromFile(nameFromUrl(url));
        if (st.video && st.video.dl) N.dlRemove(st.video.dl, true);
        const id = N.dlStart(url, st.title || '');
        st.video = { dl: id, name: DL.job(id).name, src: url };
        st.link = null;
        toast('开始下载，可以接着导入字幕；下载在后台进行');
        return redraw();
      }
      t.disabled = true;
      t.textContent = '下载中…';
      try {
        const buf = await fetchFile(url);
        this.useSub(kind === 'en' ? 'pick-en' : 'pick-zh', { name: nameFromUrl(url) || '字幕', buf });
        st.link = null;
      } catch (e) { toast('字幕没下下来：' + e.message, 4000); }
      redraw();
    } else if (a === 'pick-en' || a === 'pick-zh') {
      const f = await pickFile('.srt,.ass,.ssa,.vtt,.txt');
      if (!f) return;
      this.useSub(a, f);
      redraw();
    } else if (a === 'no-zh') { st.zh = null; redraw(); }
    else if (a === 'pick-pack') {
      const f = await pickFile('.json');
      if (!f) return;
      try { st.pack = { name: f.name, data: checkPack(JSON.parse(Subs.decode(f.buf))) }; } catch (e) { return toast(e.message.includes('精讲包') ? e.message : '读不了这个文件'); }
      redraw();
    } else if (a === 'finish') {
      const cues = st.zh ? Subs.mergeZh(st.en.cues.map(c => Object.assign({}, c)), st.zh.cues) : st.en.cues;
      const title = (st.title || '').trim() || titleFromFile(st.en.name);
      try {
        const id = Movies.create(title, cues, { pack: st.pack && st.pack.data, meta: {
          video: st.video && !N ? null : st.video, sub: st.en.name, subZh: st.zh && st.zh.name, pack: st.pack && { made: st.pack.data.made } } });
        if (st.video && !N) Movies.update(id, { video: st.video });   // 浏览器调试：临时地址
        stack.pop();
        go('movie', { id });
      } catch (e) { toast(e.message); }
    }
  },
  // 读字幕（文件或链接下来的）：a = pick-en / pick-zh
  useSub(a, f) {
    const st = this.p.st;
    let cues;
    try { cues = Subs.parse(Subs.decode(f.buf)); } catch (e) { cues = []; }
    if (a === 'pick-en') {
      if (!cues.some(c => c.en)) return toast('这个文件里没认出英文台词');
      st.en = { name: f.name, cues };
      if (!st.title) st.title = titleFromFile(f.name);
    } else {
      if (!cues.some(c => c.zh)) return toast('这个文件里没认出中文');
      st.zh = { name: f.name, cues };
    }
  },
  refresh() { if (!$('#linkInput')) show(); },
};

function linkBox(kind, ph, label) {
  return `<div class="choice" style="flex-wrap:nowrap"><input type="url" id="linkInput" class="grow" placeholder="${esc(ph)}" style="min-width:0;padding:9px 12px;border:1px solid var(--line);border-radius:10px;font:inherit;background:var(--card);color:var(--ink)">
    <button class="btn primary" data-act="link-go" data-v="${kind}">${label}</button></div>
    ${kind === 'video' ? '<div class="small mute">只下你有权使用的视频，比如自己网盘、NAS 里的直链，或允许下载的课程。有版权保护（DRM）的视频和直播下不了。下载在后台进行，退出 App 也会接着下。</div>' : ''}`;
}

// ---------- 设置
views.settings = {
  render(el) {
    const ver = N && N.version ? N.version() : '浏览器调试';
    const fonts = [[0.85, '小'], [1, '中'], [1.2, '大'], [1.45, '特大']];
    el.innerHTML = `
      <div class="top"><button class="btn-icon" data-act="back">‹</button><h1>设置</h1></div>
      <div class="page">
        <h2>我的英语水平</h2>
        <div class="mute small">比这个水平难的词才算「难词」。考试词表来自离线词典的标签，再加词频兜底。</div>
        <div class="seg" style="margin-top:8px;flex-wrap:wrap">${LEVELS.map(l => `<button class="${l.lv === Settings.level ? 'on' : ''}" data-act="level" data-v="${l.lv}">${l.name}</button>`).join('')}</div>
        <h2>字幕字号</h2>
        <div class="seg">${fonts.map(([v, n]) => `<button class="${v === Settings.font ? 'on' : ''}" data-act="font" data-v="${v}">${n}</button>`).join('')}</div>
        <h2>每次测试题量</h2>
        <div class="seg">${[10, 20, 30, 50].map(v => `<button class="${v === Settings.quizCount ? 'on' : ''}" data-act="qc" data-v="${v}">${v} 题</button>`).join('')}</div>
        <h2>学习记录</h2>
        <div class="mute small">单词掌握情况、生词本、句子复习进度。换平板或重装前先导出。</div>
        <div class="btns"><button class="btn" data-act="export">导出学习记录</button><button class="btn" data-act="importp">导入学习记录</button></div>
        <h2>其它</h2>
        <div class="btns"><button class="btn" data-act="update">检查更新</button><button class="btn" data-act="demo">添加示例短片</button></div>
        <div class="card small mute">版本 ${esc(ver)}<br>离线词典数据来自 ECDICT（MIT 许可，skywind3000/ECDICT），口语短语释义为自编。<br>App 不带任何电影内容；视频和字幕都是你自己导入的文件或自己粘贴的链接。联网只用来下载你粘贴的链接和检查更新。</div>
      </div>`;
  },
  async act(a, t) {
    if (a === 'level') { Settings.level = +t.dataset.v; saveSettings(); show(); }
    else if (a === 'font') { Settings.font = +t.dataset.v; saveSettings(); show(); }
    else if (a === 'qc') { Settings.quizCount = +t.dataset.v; saveSettings(); show(); }
    else if (a === 'demo') { stack.pop(); addDemo(); }
    else if (a === 'update') { if (N && N.checkUpdate) N.checkUpdate(); else toast('只有在平板 App 里才能检查更新'); }
    else if (a === 'export') {
      const prog = {};
      for (const m of Movies.list()) prog[m.id] = { title: m.title, sub: m.sub, lines: Movies.prog(m.id).lines };
      const d = new Date();
      saveText(`看剧学英文-学习记录-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`,
        JSON.stringify({ type: 'watch-english-progress', version: 1, at: Date.now(), settings: Settings, words: Words, movies: prog }));
    } else if (a === 'importp') {
      const f = await pickFile('.json');
      if (!f) return;
      let d;
      try { d = JSON.parse(Subs.decode(f.buf)); } catch (e) { d = null; }
      if (!d || d.type !== 'watch-english-progress') return toast('这不是学习记录文件');
      let n = 0;
      for (const [k, r] of Object.entries(d.words || {})) {
        const cur = Words[k];
        if (!cur || (r.n || 0) > (cur.n || 0) || (r.k && !cur.k) || (r.w && !cur.w)) { Words[k] = Object.assign({}, cur, r); n++; }
      }
      saveWords();
      let m = 0;
      for (const mv of Movies.list()) {
        const src = Object.values(d.movies || {}).find(x => x.title === mv.title || (x.sub && x.sub === mv.sub));
        if (src) { const p = Movies.prog(mv.id); Object.assign(p.lines, src.lines); Movies.saveProg(mv.id, p); m++; }
      }
      toast(`导入了 ${n} 个单词记录，${m} 部电影的句子进度`);
    }
  },
};

// ---------- 生词本（所有电影）
views.wordbook = {
  render(el) {
    this.el = el;
    el.innerHTML = `<div class="top"><button class="btn-icon" data-act="back">‹</button><h1>生词本</h1></div><div class="page" id="wbPage"><div class="empty">加载词典…</div></div>`;
    Lex.load().then(() => this.draw(), e => toast(e.message));
  },
  draw() {
    const page = $('#wbPage');
    if (!page) return;
    const titles = Object.fromEntries(Movies.list().map(m => [m.id, m.title]));
    const items = Object.entries(Words).filter(([, r]) => r.w && !r.k).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
    page.innerHTML = items.length ? `
      <div class="toolbar"><span class="mute">共 ${items.length} 个</span><span class="grow"></span>
        <button class="btn primary" data-act="quiz" ${items.length >= 2 ? '' : 'disabled'}>测试生词本</button></div>
      <div class="list">${items.map(([k, r]) => {
        const e = Lex.entry(k);
        return `<div class="row" data-act="word" data-k="${esc(k)}"><div class="head"><span class="w">${esc(k)}</span>
          <span class="ph">${e && e.ph ? '/' + esc(e.ph) + '/' : ''}</span><span class="grow"></span>
          ${(r.b || 0) > 0 ? `<span class="badge ok">复习 ${r.b} 级</span>` : ''}</div>
          <div class="zh">${esc(r.zh || globalMeaning(k))}</div>
          ${r.ex ? `<div class="small mute">${esc(r.ex)}${titles[r.m] ? ' —《' + esc(titles[r.m]) + '》' : ''}</div>` : ''}</div>`;
      }).join('')}</div>` : '<div class="empty">生词本是空的。<br>学习时点「加入生词本」，测试答错的词也会自动放进来。</div>';
  },
  act(a, t) {
    if (a === 'word') openSheet(wordPage(t.dataset.k, null));
    else if (a === 'quiz') startQuiz({ kind: 'wb' });
  },
  refresh() { this.draw(); },
};

function globalMeaning(key) {
  const p = Lex.phrase(key);
  if (p) return p.zh.split('|')[0];
  return Lex.short(Lex.entry(key));
}
