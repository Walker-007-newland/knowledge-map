// 电影页：学习（难词 / 难句 / 全部台词）、测试入口、观看；单词卡片和句子卡片
let MV = null;   // 当前电影：{id, meta, body, A 分析结果, prog 句子复习进度}

function loadMovie(id) {
  if (MV && MV.id === id) return Promise.resolve(MV);
  return Lex.load().then(() => {
    const meta = resolveVideo(id), body = Movies.body(id);
    if (!meta || !body) throw new Error('这部电影的数据找不到了');
    MV = { id, meta, body, A: analyzeMovie(body), prog: Movies.prog(id) };
    return MV;
  });
}

function saveMovieStats() {
  if (!MV) return;
  const all = MV.A.hardWords(true);
  MV.meta = Movies.update(MV.id, { hw: all.length, mastered: all.filter(s => isKnown(s.key)).length, hl: MV.A.hardLines().length, last: MV.meta.last }) || MV.meta;
}

function lineRec(ci) { const s = MV.A.cues[ci].s; return MV.prog.lines[s] || (MV.prog.lines[s] = {}); }
function lineMastered(ci) { const r = MV.prog.lines[MV.A.cues[ci].s]; return !!(r && (r.b || 0) >= MASTER_BOX); }
function saveProg() { Movies.saveProg(MV.id, MV.prog); }

// 一句英文的 HTML：难词标色、难短语加下划线；tap = 每个词都能点；mark = 要突出的词条
function lineHtml(ci, opt) {
  opt = opt || {};
  const A = MV.A, c = A.cues[ci], ln = A.lines[ci], info = A.lineInfo(ci);
  const phOf = new Map();
  for (const p of ln.phr) for (let k = p.i; k <= p.j; k++) phOf.set(k, p);
  let out = '', last = 0;
  ln.toks.forEach((t, k) => {
    out += esc(c.en.slice(last, t.a));
    const key = t.r && !t.name ? t.r.key : null, p = phOf.get(k);
    const cls = [];
    if (opt.mark) { if (key === opt.mark || (p && p.key === opt.mark)) cls.push('hw'); }
    else {
      if (key && info.hw.includes(key)) cls.push('hw');
      if (p && info.hp.includes(p.key)) cls.push('ph-u');
    }
    if (opt.tap) out += `<span class="tok ${cls.join(' ')}" data-act="tok" data-ci="${ci}" data-ti="${k}">${esc(t.t)}</span>`;
    else out += cls.length ? `<span class="${cls.join(' ')}">${esc(t.t)}</span>` : esc(t.t);
    last = t.b;
  });
  out += esc(c.en.slice(last));
  return out.replace(/\n/g, '<br>');
}

// 点了句子里的一个词：在难短语里就先看短语，否则看这个词
function tokenPage(ci, ti) {
  const ln = MV.A.lines[ci], t = ln.toks[ti];
  const p = ln.phr.find(x => x.i <= ti && ti <= x.j);
  const key = t.r && !t.name ? t.r.key : null;
  if (p && (MV.A.isHard(MV.A.stat.get(p.key)) || !key)) return wordPage(p.key, { ci, alt: key });
  if (key) return wordPage(key, { ci, own: t.r.own, phrase: p && p.key });
  return { html: () => `<p class="big">${esc(t.t)}</p><p class="mute">${t.name ? '看起来是人名或地名。' : '离线词典里没有这个词（可能是俚语、缩写或专有名词）。'}</p>
    <div class="btns"><button class="btn" data-act="say">🔊 读一下</button></div>`, act: a => { if (a === 'say') speak(t.t); } };
}

function playLine(ci) {
  const c = MV.A.cues[ci];
  if (Player.ready) { Player.playClip(c.s, c.e); return; }
  speak(c.en.replace(/\n/g, ' '), 0.9);
  if (MV.meta.video && Player.err) toast('视频打不开，先用语音朗读');
}

function wordPage(key, opt) {
  opt = opt || {};
  return {
    html() {
      const e = Lex.entry(key), ph = Lex.phrase(key), rec = Words[key] || {};
      const A = MV && MV.A, s = A && A.stat.get(key), pw = A && A.packWord.get(key);
      const own = opt.own && opt.own !== key ? Lex.entry(opt.own) : null;
      const lv = e ? e.lv : ph ? (ph.kind === 'i' ? ph.lv : 9) : 9;
      let ex = '';
      if (s && s.cues.length) {
        const cis = s.cues.slice();
        if (opt.ci != null && cis.includes(opt.ci)) { cis.splice(cis.indexOf(opt.ci), 1); cis.unshift(opt.ci); }
        ex = `<h3>本片例句（${s.cues.length} 处）</h3>` + cis.slice(0, 4).map(ci => `<div class="ex">
          <div class="en">${lineHtml(ci, { mark: key })}</div><div class="zh mute">${esc(A.zhOf(ci))}</div>
          <div class="btns"><button class="btn small" data-act="clip" data-ci="${ci}">▶ 原声</button><button class="btn small" data-act="goto" data-ci="${ci}">去看这句</button>
          <span class="t" style="align-self:center">${Subs.fmt(A.cues[ci].s)}</span></div></div>`).join('');
      } else if (rec.ex) {
        ex = `<h3>例句</h3><div class="ex"><div class="en">${esc(rec.ex)}</div><div class="zh mute">${esc(rec.exZh || '')}</div></div>`;
      }
      const due = rec.d != null ? rec.d - today() : null;
      return `
        <p class="big">${esc(key)} ${key.includes(' ') ? `<span class="badge gray">${ph && ph.kind === 'i' ? '口语' : ''}短语</span>` : `<span class="badge ${lv <= Settings.level ? 'ok' : ''}">${LEVEL_TAG[lv] || '超纲'}</span>`}</p>
        <div class="choice">${e && e.ph ? `<span class="mute">/${esc(e.ph)}/</span>` : ''}<button class="btn small" data-act="say">🔊 发音</button></div>
        ${pw ? `<div class="note"><b>本片：</b>${esc(pw.zh || '')}${pw.note ? '\n' + esc(pw.note) : ''}</div>` : ''}
        ${ph ? ph.zh.split('|').map(l => `<p class="tr">${esc(l)}</p>`).join('') : ''}
        ${e ? e.tr.map(l => `<p class="tr">${esc(l)}</p>`).join('') : ''}
        ${!e && !ph && !pw ? '<p class="mute">离线词典里没有这个词。</p>' : ''}
        ${own ? `<p class="small mute">「${esc(own.w)}」本身也是一个词：${esc(own.tr.join('；'))}</p>` : ''}
        ${opt.phrase ? `<p class="small">所在短语 <a href="#" data-act="sub" data-k="${esc(opt.phrase)}">${esc(opt.phrase)}</a>：${esc(globalMeaning(opt.phrase))}</p>` : ''}
        ${opt.alt ? `<p class="small">单词 <a href="#" data-act="sub" data-k="${esc(opt.alt)}">${esc(opt.alt)}</a>：${esc(globalMeaning(opt.alt))}</p>` : ''}
        ${ex}
        <div class="mute small" style="margin-top:10px">${rec.n ? `测过 ${rec.n} 次，错 ${rec.x || 0} 次；` : ''}${rec.k ? '已标为认识' : (rec.b || 0) >= MASTER_BOX ? '已掌握' : due != null ? (due <= 0 ? '今天该复习' : `${due} 天后复习`) : ''}</div>
        <div class="btns">
          <button class="btn ${rec.k ? '' : 'ok'}" data-act="known">${rec.k ? '撤销「认识」' : '✓ 认识，不再列为难词'}</button>
          <button class="btn" data-act="wb">${rec.w ? '移出生词本' : '★ 加入生词本'}</button>
        </div>`;
    },
    act(a, t, ev) {
      if (a === 'say') speak(key);
      else if (a === 'known') {
        const r = wordRec(key);
        r.k = r.k ? 0 : 1;
        if (r.k) r.w = 0;
        saveWords(); redrawSheet(); refreshView();
        toast(r.k ? '好的，以后不再列为难词' : '已撤销');
      } else if (a === 'wb') {
        const r = wordRec(key);
        r.w = r.w ? 0 : 1;
        if (r.w) addWordContext(key, r, opt.ci);
        saveWords(); redrawSheet(); refreshView();
        toast(r.w ? '已加入生词本' : '已移出生词本');
      } else if (a === 'clip') playLine(+t.dataset.ci);
      else if (a === 'goto') gotoWatch(+t.dataset.ci);
      else if (a === 'sub') { ev.preventDefault(); pushSheet(wordPage(t.dataset.k, { ci: opt.ci })); }
    },
  };
}

// 加入生词本时记下出处和例句（生词本页、换电影以后还能看）
function addWordContext(key, r, ci) {
  r.t = Date.now();
  if (!MV) return;
  const s = MV.A.stat.get(key);
  const c = ci != null ? ci : s && s.cues[0];
  r.m = MV.id;
  r.zh = MV.A.meaning(key);
  if (c != null) { r.ex = MV.A.cues[c].en.replace(/\n/g, ' '); r.exZh = MV.A.zhOf(c); }
}

function linePage(ci) {
  return {
    html() {
      const A = MV.A, c = A.cues[ci], info = A.lineInfo(ci), rec = MV.prog.lines[c.s] || {};
      const items = info.hp.concat(info.hw);
      return `
        <div class="choice"><span class="t">${Subs.fmt(c.s)}</span><span class="grow"></span>
          <button class="btn small" data-act="clip">▶ 原声</button><button class="btn small" data-act="say">🔊 朗读</button><button class="btn small" data-act="goto">去看这句</button></div>
        <p class="en" style="font-size:21px;line-height:1.7;margin:6px 0">${lineHtml(ci, { tap: true })}</p>
        <p class="zh" style="font-size:17px;margin:4px 0">${esc(A.zhOf(ci)) || '<span class="mute">（没有中文翻译）</span>'}</p>
        ${info.pack && info.pack.zh && c.zh && info.pack.zh !== c.zh ? `<p class="small mute">字幕原译：${esc(c.zh)}</p>` : ''}
        ${info.pack && info.pack.note ? `<div class="note"><b>精讲：</b>${esc(info.pack.note)}</div>` : ''}
        ${items.length ? `<h3>难词和短语</h3><div class="list">${items.map(k => `<div class="row" data-act="word" data-k="${esc(k)}"><div class="head"><span class="w">${esc(k)}</span><span class="zh">${esc(A.meaning(k))}</span></div></div>`).join('')}</div>` : ''}
        <p class="small mute">点句子里的任何一个词都能查。${rec.n ? `这句测过 ${rec.n} 次${(rec.b || 0) >= MASTER_BOX ? '，已掌握' : ''}。` : ''}</p>`;
    },
    act(a, t) {
      const c = MV.A.cues[ci];
      if (a === 'clip') playLine(ci);
      else if (a === 'say') speak(c.en.replace(/\n/g, ' '), 0.9);
      else if (a === 'goto') gotoWatch(ci);
      else if (a === 'word') pushSheet(wordPage(t.dataset.k, { ci }));
      else if (a === 'tok') pushSheet(tokenPage(ci, +t.dataset.ti));
    },
  };
}

function gotoWatch(ci) {
  closeSheet();
  const c = curView();
  if (!c || c.name !== 'movie') return;
  c.params.tab = 'watch';
  c.params.startAt = MV.A.cues[ci].s;
  views.movie.draw();
}

// ---------- 电影页
views.movie = {
  render(el, p) {
    this.el = el; this.p = p;
    p.tab = p.tab || 'learn'; p.sub = p.sub || 'words'; p.filter = p.filter || 'todo'; p.sort = p.sort || 'time';
    el.innerHTML = `<div class="top"><button class="btn-icon" data-act="back">‹</button><h1 id="mvTitle"></h1><button class="btn-icon" data-act="menu">⋯</button></div>
      <div class="tabs" id="mvTabs"></div><div id="mvBody" style="flex:1;display:flex;flex-direction:column;min-height:0"><div class="page"><div class="empty">正在加载词典和分析字幕…</div></div></div>`;
    loadMovie(p.id).then(() => {
      if (curView().params !== p) return;
      if (hasVideo(MV.meta) && !Player.src) Player.open(videoSrc(MV.meta.video));
      this.draw();
    }, e => { $('#mvBody').innerHTML = `<div class="page"><div class="empty">${esc(e.message)}</div></div>`; });
  },
  draw() {
    const p = this.p;
    if (!MV || !$('#mvTitle')) return;
    this.leaveWatch();
    $('#mvTitle').textContent = MV.meta.title;
    $('#mvTabs').innerHTML = [['learn', '学习'], ['test', '测试'], ['watch', '观看']].map(([k, n]) => `<button class="${p.tab === k ? 'on' : ''}" data-act="tab" data-v="${k}">${n}</button>`).join('');
    const body = $('#mvBody');
    if (p.tab === 'learn') this.drawLearn(body);
    else if (p.tab === 'test') this.drawTest(body);
    else Watch.draw(body, p);
  },
  refresh() {
    if (!MV) return;
    // 视频下载完了：记下文件地址，打开播放器
    if (MV.meta.video && MV.meta.video.dl && !MV.meta.video.uri) {
      MV.meta = resolveVideo(MV.id) || MV.meta;
      if (hasVideo(MV.meta) && !Player.src) { Player.open(videoSrc(MV.meta.video)); toast('视频下载完成，可以看了'); }
    }
    if (this.p.tab === 'watch') { Watch.updateMsg(); return; }
    const pg = $('#mvBody .page'), y = pg && pg.scrollTop;
    this.draw();
    const pg2 = $('#mvBody .page');
    if (pg2) pg2.scrollTop = y;
  },

  drawLearn(body) {
    const p = this.p, A = MV.A;
    const hard = A.hardWords(), lines = A.hardLines();
    let html = `<div class="page" id="learnPage"><div class="toolbar"><div class="seg">
      <button class="${p.sub === 'words' ? 'on' : ''}" data-act="sub" data-v="words">难词 ${hard.length}</button>
      <button class="${p.sub === 'lines' ? 'on' : ''}" data-act="sub" data-v="lines">难句 ${lines.length}</button>
      <button class="${p.sub === 'all' ? 'on' : ''}" data-act="sub" data-v="all">全部台词</button></div></div>`;
    if (p.sub === 'words') {
      let items;
      if (p.filter === 'todo') items = hard;
      else if (p.filter === 'wb') items = [...A.stat.values()].filter(s => s.cues.length && Words[s.key] && Words[s.key].w);
      else items = A.hardWords(true).filter(s => isKnown(s.key));
      if (p.sort === 'count') items = items.slice().sort((a, b) => b.cues.length - a.cues.length);
      else items = items.slice().sort((a, b) => a.cues[0] - b.cues[0]);
      html += `<div class="toolbar"><div class="seg">
          <button class="${p.filter === 'todo' ? 'on' : ''}" data-act="filter" data-v="todo">没掌握</button>
          <button class="${p.filter === 'wb' ? 'on' : ''}" data-act="filter" data-v="wb">生词本</button>
          <button class="${p.filter === 'done' ? 'on' : ''}" data-act="filter" data-v="done">已掌握</button></div>
        <div class="seg" style="flex:none;min-width:0"><button class="${p.sort === 'time' ? 'on' : ''}" data-act="sort" data-v="time">按出场</button><button class="${p.sort === 'count' ? 'on' : ''}" data-act="sort" data-v="count">按次数</button></div></div>`;
      html += items.length ? `<div class="list">${items.map(s => {
        const e = Lex.entry(s.key), r = Words[s.key] || {};
        return `<div class="row" data-act="word" data-k="${esc(s.key)}"><div class="head"><span class="w">${esc(s.key)}</span>
          <span class="ph">${e && e.ph ? '/' + esc(e.ph) + '/' : s.kind === 'p' ? '短语' : ''}</span><span class="grow"></span>
          ${r.w ? '<span class="badge">★</span>' : ''}${A.packWord.has(s.key) ? '<span class="badge">精讲</span>' : ''}<span class="t">×${s.cues.length}</span></div>
          <div class="zh">${esc(A.meaning(s.key))}</div></div>`;
      }).join('')}</div>` : `<div class="empty">${p.filter === 'todo' ? '这部电影的难词都掌握了 🎉' : p.filter === 'wb' ? '这部电影里还没有词加入生词本' : '还没有掌握的难词，去「测试」里练练吧'}</div>`;
      if (p.filter === 'todo' && items.length) html += `<p class="small mute">难词按「${LEVELS.find(x => x.lv === Settings.level).name}」水平挑选，可在首页 ⚙ 设置里改。认识的词点开后标「认识」，就不再出现。</p>`;
    } else {
      const cis = p.sub === 'lines' ? lines : A.cues.map((c, i) => i).filter(i => A.cues[i].en);
      html += cis.length ? `<div class="list">${cis.map(ci => `<div class="row" data-act="line" data-ci="${ci}">
          <div class="head"><span class="t">${Subs.fmt(A.cues[ci].s)}</span><span class="grow"></span>${A.packLine.get(ci) && A.packLine.get(ci).note ? '<span class="badge">精讲</span>' : ''}${lineMastered(ci) ? '<span class="badge ok">已掌握</span>' : ''}</div>
          <div class="en">${lineHtml(ci)}</div><div class="zh">${esc(A.zhOf(ci))}</div></div>`).join('')}</div>` : '<div class="empty">没有难句</div>';
    }
    body.innerHTML = html + '</div>';
  },

  drawTest(body) {
    const A = MV.A, d = today();
    const all = A.hardWords(true);
    const known = all.filter(s => isKnown(s.key)).length;
    const dueW = A.hardWords().filter(s => Words[s.key] && Words[s.key].d != null && Words[s.key].d <= d).length;
    const lines = A.hardLines();
    const lm = lines.filter(lineMastered).length;
    const dueL = lines.filter(ci => { const r = MV.prog.lines[A.cues[ci].s]; return r && r.d != null && r.d <= d && (r.b || 0) < MASTER_BOX; }).length;
    const hasZh = lines.some(ci => A.zhOf(ci));
    const mode = this.p.qmode || 'choice';
    body.innerHTML = `<div class="page">
      <div class="stats">
        <div class="stat"><span class="mute small">难词</span><b>${known} / ${all.length}</b><span class="small mute">已掌握</span></div>
        <div class="stat"><span class="mute small">单词今天要复习</span><b>${dueW}</b></div>
        <div class="stat"><span class="mute small">难句</span><b>${lm} / ${lines.length}</b><span class="small mute">已掌握</span></div>
        <div class="stat"><span class="mute small">句子今天要复习</span><b>${dueL}</b></div>
      </div>
      <h2>题型</h2>
      <div class="seg"><button class="${mode === 'choice' ? 'on' : ''}" data-act="qmode" data-v="choice">四选一</button><button class="${mode === 'self' ? 'on' : ''}" data-act="qmode" data-v="self">自己判断（认识 / 不认识）</button></div>
      <p class="small mute">每次 ${Settings.quizCount} 题（设置里改）。先出今天该复习的，再出没测过的。答对一次隔几天再考（1、2、4、7…天），连对 ${MASTER_BOX} 次算掌握；答错的词自动进生词本。</p>
      <div class="btns">
        <button class="btn primary" data-act="quiz" data-v="w">单词测试</button>
        <button class="btn primary" data-act="quiz" data-v="l" ${hasZh || mode === 'self' ? '' : 'disabled'}>句子测试</button>
        <button class="btn" data-act="quiz" data-v="mix">混合</button>
        <button class="btn" data-act="quiz" data-v="wbm">只测本片生词本</button>
      </div>
      ${!hasZh && mode === 'choice' ? '<p class="small mute">这部电影没有中文翻译，句子测试只能用「自己判断」；导入中文字幕或精讲包后就能四选一。</p>' : ''}
      ${MV.meta.lastQuiz ? `<p class="small mute">上次测试：${new Date(MV.meta.lastQuiz.at).toLocaleString()}，${MV.meta.lastQuiz.right} / ${MV.meta.lastQuiz.total} 正确</p>` : ''}
    </div>`;
  },

  act(a, t, ev) {
    const p = this.p;
    if (!MV) return;
    if (dlAct(a, t)) return;
    if (a === 'tab') { p.tab = t.dataset.v; this.draw(); }
    else if (a === 'sub') { p.sub = t.dataset.v; this.draw(); }
    else if (a === 'filter') { p.filter = t.dataset.v; this.draw(); }
    else if (a === 'sort') { p.sort = t.dataset.v; this.draw(); }
    else if (a === 'word') openSheet(wordPage(t.dataset.k));
    else if (a === 'line') openSheet(linePage(+t.dataset.ci));
    else if (a === 'qmode') { p.qmode = t.dataset.v; this.draw(); }
    else if (a === 'quiz') startQuiz({ kind: t.dataset.v, mode: p.qmode || 'choice' });
    else if (a === 'menu') openSheet(menuPage());
    else if (a === 'linkdl') { if (!N) return toast('链接下载只在平板 App 里能用'); openSheet(linkPage()); }
    else if (p.tab === 'watch') Watch.act(a, t, ev);
  },
  leaveWatch() { Watch.leave(); },
  leave(popped) {
    Watch.leave();
    if (!MV) return;
    saveMovieStats();
    if (popped) { Player.close(); MV = null; }
    else Player.pause();
  },
  back() {
    if (this.p.tab === 'watch' && Watch.full) { Watch.setFull(false); return true; }
    return false;
  },
};

function menuPage() {
  return {
    html: () => `<p class="big" style="font-size:20px">${esc(MV.meta.title)}</p>
      <div class="list" style="margin-top:12px">
        <div class="row" data-act="video">🎞 ${MV.meta.video ? '换一个视频文件' : '选择视频文件'}<div class="small mute">${MV.meta.video ? esc(MV.meta.video.name) : '现在只有字幕'}</div></div>
        <div class="row" data-act="link">🌐 从链接下载视频<div class="small mute">粘贴视频直链或 m3u8 链接，后台下载${MV.meta.video && MV.meta.video.dl ? '；会替换掉现在下载的视频' : ''}</div></div>
        <div class="row" data-act="pack">📘 导入精讲包<div class="small mute">${MV.body.pack ? `已有（${esc(MV.body.pack.made || '')}，讲解 ${MV.body.pack.lines.length} 句），再导入会替换` : '电脑上的 Claude 按这部电影的字幕做的 .json 文件'}</div></div>
        <div class="row" data-act="zh">🀄 导入中文字幕<div class="small mute">英文台词里还没中文的，按时间对上</div></div>
        <div class="row" data-act="rename">✏️ 改片名</div>
        <div class="row" data-act="del" style="color:var(--bad)">🗑 删除这部电影<div class="small mute">删掉 App 里的字幕和进度${MV.meta.video && MV.meta.video.dl ? '，连下载的视频一起删' : '，不动平板上的视频文件'}；单词掌握情况保留</div></div>
      </div>`,
    async act(a) {
      if (a === 'link') {
        if (!N) return toast('链接下载只在平板 App 里能用');
        pushSheet(linkPage());
      } else if (a === 'video') {
        const v = await pickVideo();
        if (!v) return;
        if (MV.meta.video && MV.meta.video.dl) N.dlRemove(MV.meta.video.dl, true);
        MV.meta = Movies.update(MV.id, { video: v });
        Player.open(videoSrc(v));
        closeSheet(); views.movie.draw(); toast('视频已换好');
      } else if (a === 'pack') {
        const f = await pickFile('.json');
        if (!f) return;
        let d;
        try { d = checkPack(JSON.parse(Subs.decode(f.buf))); } catch (e) { return toast(e.message.includes('精讲包') ? e.message : '读不了这个文件'); }
        MV.body.pack = d;
        Movies.saveBody(MV.id, MV.body);
        MV.meta = Movies.update(MV.id, { pack: { made: d.made } });
        MV.A = analyzeMovie(MV.body);
        closeSheet(); views.movie.draw();
        toast(`精讲包已导入：对上 ${MV.A.packLine.size} / ${d.lines.length} 句`);
      } else if (a === 'zh') {
        const f = await pickFile('.srt,.ass,.ssa,.vtt,.txt');
        if (!f) return;
        const zc = Subs.parse(Subs.decode(f.buf));
        if (!zc.some(c => c.zh)) return toast('这个文件里没认出中文');
        const before = MV.body.cues.filter(c => c.zh).length;
        Subs.mergeZh(MV.body.cues, zc);
        Movies.saveBody(MV.id, MV.body);
        MV.A = analyzeMovie(MV.body);
        closeSheet(); views.movie.draw();
        toast(`新对上中文 ${MV.body.cues.filter(c => c.zh).length - before} 句`);
      } else if (a === 'rename') {
        const t = prompt('片名', MV.meta.title);
        if (t && t.trim()) { MV.meta = Movies.update(MV.id, { title: t.trim() }); closeSheet(); views.movie.draw(); }
      } else if (a === 'del') {
        if (!confirm(`删除「${MV.meta.title}」？`)) return;
        const id = MV.id;
        closeSheet();
        Player.close();
        if (MV.meta.video && MV.meta.video.dl && N) N.dlRemove(MV.meta.video.dl, true);
        MV = null;
        Movies.remove(id);
        stack.pop(); show();
      }
    },
  };
}

// 电影页「从链接下载视频」：下完前电影照常能学（只是没有原声），下完自动换上
function linkPage() {
  return {
    html: () => `<p class="big" style="font-size:20px">从链接下载视频</p>
      ${linkBox('video', '粘贴视频链接：https://… .mp4 / .mkv / .m3u8', '开始下载')}`,
    act(a) {
      if (a !== 'link-go') return;
      const url = $('#linkInput').value.trim();
      if (!isLink(url)) return toast('请粘贴以 http:// 或 https:// 开头的完整链接');
      const old = MV.meta.video;
      if (old && old.dl) N.dlRemove(old.dl, true);
      const id = N.dlStart(url, MV.meta.title);
      Player.close();
      MV.meta = Movies.update(MV.id, { video: { dl: id, name: DL.job(id).name, src: url } });
      closeSheet();
      views.movie.draw();
      toast('开始下载，下载在后台进行，可以先学字幕');
    },
  };
}
