// 测试：单词 / 句子，四选一或自己判断；答完按间隔复习排期，错的词进生词本
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// 先出到期该复习的，再出没测过的，最后是还没到期的（按到期先后）
function reviewOrder(ids, recOf) {
  const d = today(), due = [], fresh = [], rest = [];
  for (const id of ids) {
    const r = recOf(id);
    if (!r || !r.n) fresh.push(id);
    else if (r.d <= d) due.push(id);
    else rest.push(id);
  }
  const byDue = (a, b) => recOf(a).d - recOf(b).d;
  return due.sort(byDue).concat(fresh, rest.sort(byDue));
}

function wordMeaning(key) { return MV ? MV.A.meaning(key) : (Words[key] && Words[key].zh) || globalMeaning(key); }

function startQuiz(opt) {
  const n = Settings.quizCount, d = today();
  let items = [];
  const wordItems = keys => reviewOrder(keys, k => Words[k]).map(key => ({ t: 'w', key }));
  if (opt.kind === 'wb') {
    items = wordItems(Object.keys(Words).filter(k => Words[k].w && !Words[k].k)).slice(0, n);
  } else {
    const A = MV.A;
    const words = opt.kind === 'wbm'
      ? [...A.stat.values()].filter(s => s.cues.length && Words[s.key] && Words[s.key].w && !Words[s.key].k).map(s => s.key)
      : A.hardWords().map(s => s.key);
    const lineIds = A.hardLines().filter(ci => !lineMastered(ci) && (opt.mode === 'self' || A.zhOf(ci)));
    const lines = reviewOrder(lineIds, ci => MV.prog.lines[A.cues[ci].s]).map(ci => ({ t: 'l', ci }));
    if (opt.kind === 'w' || opt.kind === 'wbm') items = wordItems(words).slice(0, n);
    else if (opt.kind === 'l') items = lines.slice(0, n);
    else {
      const w = wordItems(words).slice(0, Math.ceil(n / 2)), l = lines.slice(0, n - w.length);
      while (w.length || l.length) { if (w.length) items.push(w.shift()); if (l.length) items.push(l.shift()); }
    }
  }
  if (!items.length) return toast(opt.kind === 'l' ? '没有可以测的难句了' : opt.kind === 'wbm' || opt.kind === 'wb' ? '生词本里没有词' : '难词都掌握了');
  go('quiz', { opt, items, i: 0, right: 0, wrong: [], d });
}

function wordOptions(key) {
  const right = wordMeaning(key);
  const pool = MV ? MV.A.hardWords(true).map(s => s.key) : Object.keys(Words).filter(k => Words[k].w);
  const seen = new Set([right]), opts = [];
  for (const k of shuffle(pool.filter(k => k !== key))) {
    const m = wordMeaning(k);
    if (m && !seen.has(m)) { seen.add(m); opts.push(m); }
    if (opts.length >= 3) break;
  }
  if (opts.length < 3) for (const e of Lex.randomWords(10, new Set([key]))) { const m = Lex.short(e); if (!seen.has(m) && opts.length < 3) { seen.add(m); opts.push(m); } }
  return { right, opts: shuffle(opts.concat([right])) };
}

function lineOptions(ci) {
  const A = MV.A, right = A.zhOf(ci);
  const cand = [];
  A.cues.forEach((c, k) => { const z = A.zhOf(k); if (k !== ci && z && z !== right) cand.push(z); });
  const pick = shuffle(cand).slice(0, 40).sort((a, b) => Math.abs(a.length - right.length) - Math.abs(b.length - right.length)).slice(0, 6);
  return { right, opts: shuffle(shuffle(pick).slice(0, 3).concat([right])) };
}

views.quiz = {
  render(el, p) {
    this.el = el; this.p = p;
    const total = p.items.length;
    const titles = { w: '单词测试', l: '句子测试', mix: '混合测试', wbm: '生词本测试', wb: '生词本测试' };
    el.innerHTML = `<div class="top"><button class="btn-icon" data-act="back">‹</button><h1>${titles[p.opt.kind] || '测试'}</h1></div><div class="page" id="qPage"></div>`;
    if (p.i >= total) return this.drawResult();
    this.drawItem();
  },

  drawItem() {
    const p = this.p, it = p.items[p.i], self = p.opt.mode === 'self';
    if (!it.o && !self) it.o = it.t === 'w' ? wordOptions(it.key) : lineOptions(it.ci);
    const ans = it.ans;   // {ok, pick}
    let q;
    if (it.t === 'w') {
      const e = Lex.entry(it.key), s = MV && MV.A.stat.get(it.key);
      const exCi = s && s.cues[0];
      q = `<div class="qw">${esc(it.key)}</div>
        <div class="choice" style="justify-content:center">${e && e.ph ? `<span class="mute">/${esc(e.ph)}/</span>` : ''}<button class="btn small" data-act="say">🔊</button>
        ${exCi != null || (Words[it.key] && Words[it.key].ex) ? `<button class="btn small" data-act="showex">看例句</button>` : ''}</div>
        <div id="qex" ${it.showEx || ans ? '' : 'hidden'} class="en mute" style="margin-top:8px">${exCi != null ? lineHtml(exCi, { mark: it.key }) : esc((Words[it.key] || {}).ex || '')}</div>`;
    } else {
      const c = MV.A.cues[it.ci];
      q = `<div class="qs">${esc(c.en).replace(/\n/g, '<br>')}</div>
        <div class="choice" style="justify-content:center"><button class="btn small" data-act="clip">▶ 原声</button><button class="btn small" data-act="say">🔊 朗读</button></div>`;
    }
    let body = '';
    if (!self) {
      body = `<div class="opts">${it.o.opts.map((o, k) => {
        let cls = '';
        if (ans) { if (o === it.o.right) cls = 'right'; else if (k === ans.pick) cls = 'wrong'; }
        return `<button class="opt ${cls}" data-act="opt" data-k="${k}" ${ans ? 'disabled' : ''}>${esc(o)}</button>`;
      }).join('')}</div>${ans ? '' : '<div class="btns" style="justify-content:center"><button class="btn" data-act="opt" data-k="-1">不知道</button></div>'}`;
    } else if (!it.reveal) {
      body = `<div class="btns" style="justify-content:center;margin-top:20px"><button class="btn ok" data-act="self" data-v="1">${it.t === 'w' ? '认识' : '能听懂 / 看懂'}</button><button class="btn" data-act="self" data-v="0">${it.t === 'w' ? '不认识' : '不懂'}</button></div>`;
    } else {
      body = `<div class="card">${this.answerHtml(it)}</div>` + (ans ? '' : `<div class="btns" style="justify-content:center"><button class="btn ok" data-act="judge" data-v="1">✓ 我想的对</button><button class="btn" data-act="judge" data-v="0">✗ 其实没对</button></div>`);
    }
    if (ans && !self) body += `<div class="card">${this.answerHtml(it)}</div>`;
    if (ans) body += `<div class="btns" style="justify-content:center"><button class="btn primary" data-act="nextq">${p.i + 1 < p.items.length ? '下一题' : '看结果'}</button>
      <button class="btn" data-act="detail">详细</button></div>`;
    $('#qPage').innerHTML = `<div class="progress"><span>${p.i + 1} / ${p.items.length}</span><div class="bar"><i style="width:${100 * p.i / p.items.length}%;background:var(--accent)"></i></div><span>✓ ${p.right}</span></div>
      <div class="card qcard">${q}</div>${body}
      ${ans ? `<p class="small mute" style="text-align:center">${ans.ok ? '答对了，' : '答错了，'}${it.t === 'w' && !ans.ok ? '已加入生词本，' : ''}${GAPS[ans.box] ? `${GAPS[ans.box]} 天后再考` : '今天还会再考'}</p>` : ''}`;
  },

  answerHtml(it) {
    if (it.t === 'w') {
      const e = Lex.entry(it.key), ph = Lex.phrase(it.key), pw = MV && MV.A.packWord.get(it.key);
      return `<b>${esc(wordMeaning(it.key))}</b>${pw && pw.note ? `<div class="note">${esc(pw.note)}</div>` : ''}
        ${(ph ? ph.zh.split('|') : []).concat(e ? e.tr : []).slice(0, 4).map(l => `<div class="small mute">${esc(l)}</div>`).join('')}`;
    }
    const info = MV.A.lineInfo(it.ci), items = info.hp.concat(info.hw);
    return `<div><b>${esc(MV.A.zhOf(it.ci)) || '（没有中文翻译）'}</b></div>
      ${info.pack && info.pack.note ? `<div class="note">${esc(info.pack.note)}</div>` : ''}
      ${items.map(k => `<div class="small"><span class="hw">${esc(k)}</span> ${esc(MV.A.meaning(k))}</div>`).join('')}`;
  },

  answer(ok, pick) {
    const p = this.p, it = p.items[p.i];
    if (it.ans) return;
    let rec;
    if (it.t === 'w') {
      rec = wordRec(it.key);
      grade(rec, ok);
      if (!ok && !rec.w) { rec.w = 1; addWordContext(it.key, rec, MV && MV.A.stat.get(it.key) ? MV.A.stat.get(it.key).cues[0] : null); }
      saveWords();
    } else {
      rec = lineRec(it.ci);
      grade(rec, ok);
      saveProg();
    }
    it.ans = { ok, pick, box: rec.b };
    if (ok) p.right++; else p.wrong.push(it);
    if (it.t === 'w' && !ok) speak(it.key);
    this.drawItem();
  },

  drawResult() {
    const p = this.p, total = p.items.length;
    if (MV && !p.saved) { p.saved = true; MV.meta = Movies.update(MV.id, { lastQuiz: { at: Date.now(), right: p.right, total } }) || MV.meta; saveMovieStats(); }
    $('#qPage').innerHTML = `<div class="result-big">${p.right} / ${total}</div>
      <p style="text-align:center" class="mute">${p.right === total ? '全对，太棒了！' : p.right >= total * 0.7 ? '不错，错的再看看' : '多看几遍原片，再测一次'}</p>
      ${p.wrong.length ? `<h2>答错的</h2><div class="list">${p.wrong.map(it => it.t === 'w'
        ? `<div class="row" data-act="word" data-k="${esc(it.key)}"><div class="head"><span class="w">${esc(it.key)}</span><span class="zh">${esc(wordMeaning(it.key))}</span></div></div>`
        : `<div class="row" data-act="line" data-ci="${it.ci}"><div class="en">${esc(MV.A.cues[it.ci].en)}</div><div class="zh">${esc(MV.A.zhOf(it.ci))}</div></div>`).join('')}</div>` : ''}
      <div class="btns" style="justify-content:center;margin-top:18px">
        ${p.wrong.length ? '<button class="btn primary" data-act="retry">错的再测一遍</button>' : ''}
        <button class="btn" data-act="again">再来一组</button><button class="btn" data-act="back">返回</button></div>`;
  },

  act(a, t) {
    const p = this.p, it = p.items[p.i];
    if (a === 'say') speak(it.t === 'w' ? it.key : MV.A.cues[it.ci].en.replace(/\n/g, ' '), it.t === 'w' ? 1 : 0.9);
    else if (a === 'clip') playLine(it.ci);
    else if (a === 'showex') { it.showEx = true; const ex = $('#qex'); if (ex) ex.hidden = false; }
    else if (a === 'opt') { const k = +t.dataset.k; this.answer(k >= 0 && it.o.opts[k] === it.o.right, k); }
    else if (a === 'self') { it.reveal = true; it.claim = t.dataset.v === '1'; if (!it.claim) this.answer(false, -1); else this.drawItem(); }
    else if (a === 'judge') this.answer(t.dataset.v === '1', -1);
    else if (a === 'nextq') { p.i++; Player.pause(); p.i >= p.items.length ? this.drawResult() : this.drawItem(); $('#qPage').scrollTop = 0; }
    else if (a === 'detail') openSheet(it.t === 'w' ? wordPage(it.key) : linePage(it.ci));
    else if (a === 'word') openSheet(wordPage(t.dataset.k));
    else if (a === 'line') openSheet(linePage(+t.dataset.ci));
    else if (a === 'retry') replaceView('quiz', { opt: p.opt, items: shuffle(p.wrong.map(x => ({ t: x.t, key: x.key, ci: x.ci }))), i: 0, right: 0, wrong: [] });
    else if (a === 'again') { stack.pop(); startQuiz(p.opt); }
  },
  leave() { Player.pause(); },
};
