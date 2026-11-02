/* 音标课：课程列表 → 每课「学 / 练 / 测」。数据 data/yinbiao.js，录音索引 audio/ipa-index.js。
 * 测试成绩记在英语图谱的进度里（fjzk-en-progress-v1，键是课的 id，如 yb-03），80 分以上算掌握，小狗奖励照常发。 */
(function () {
  'use strict';
  const YB = window.YB, AU = window.YB_AUDIO || { sym: [], words: {} };
  const STORE = 'fjzk-en-progress-v1', PASS = 80;
  const inApp = !!(window.KMApp && KMApp.goBack);
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const uniq = a => a.filter((x, i) => a.indexOf(x) === i);

  /* ---------------- 进度 ---------------- */
  function loadProg() { try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; } }
  function saveProg(id, fn) {
    const all = loadProg();
    all[id] = all[id] || { viewed: Date.now(), last: null, best: null, attempts: 0 };
    fn(all[id]);
    try { localStorage.setItem(STORE, JSON.stringify(all)); } catch (e) { /* 存不了只在本次有效 */ }
  }
  function status(id) {
    const p = loadProg()[id];
    if (!p) return 'new';
    if (p.last != null) return p.last >= PASS ? 'mastered' : 'weak';
    return 'learning';
  }
  const STATUS_NAME = { new: '未学', learning: '学习中', weak: '需加强', mastered: '已学会' };

  /* ---------------- 播放 ---------------- */
  const audio = new Audio();
  const code = sym => Array.from(sym).map(c => c.codePointAt(0).toString(16)).join('-');
  const plain = g => g.replace(/[[\]]/g, '');
  function play(src) { audio.pause(); audio.src = src; const p = audio.play(); if (p && p.catch) p.catch(() => {}); }
  function playWord(g) {
    const w = plain(g);
    if (AU.words[w]) play('audio/ipa/w-' + AU.words[w] + '.mp3');
  }
  // 有真人录音的放录音，没有的（双元音、tr dr ts dz）放第一个例词；不在 48 个音标里的（/juː/、/kw/）放所在那一行的例词 fw
  function playSym(sym, fw) {
    if (AU.sym.indexOf(sym) >= 0) play('audio/ipa/s-' + code(sym) + '.mp3');
    else if (YB.sounds[sym]) playWord(YB.sounds[sym].words[0][0]);
    else if (fw) playWord(fw);
  }
  const playLetter = L => play('audio/ipa/l-' + L.toLowerCase() + '.mp3');

  /* ---------------- 小部件 ---------------- */
  const hl = g => esc(g).replace(/\[(.+?)\]/g, '<b class="hl">$1</b>');
  const symBtn = (sym, big, fw) => `<button class="yb-sym${big ? ' big' : ''}" data-sym="${esc(sym)}"${fw ? ` data-fw="${esc(fw)}"` : ''} title="听这个音">/${esc(sym)}/${AU.sym.indexOf(sym) < 0 ? '<small>听例词</small>' : ''}</button>`;
  const wordChip = ([g, ipa, zh]) => `<button class="yb-word" data-word="${esc(g)}"><span class="w">${hl(g)}</span><span class="ipa">/${esc(ipa)}/</span><span class="zh">${esc(zh)}</span></button>`;
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-sym]'); if (s) { playSym(s.dataset.sym, s.dataset.fw); return; }
    const w = e.target.closest('[data-word]'); if (w) { playWord(w.dataset.word); return; }
    const l = e.target.closest('[data-letter]'); if (l) { playLetter(l.dataset.letter); return; }
    const p = e.target.closest('[data-ph]'); if (p && window.KWPhonics) KWPhonics.open(p.dataset.ph, '', { autoplay: true });
  });

  /* ---------------- 课程列表 ---------------- */
  const SECTIONS = [['字母', ['yb-01', 'yb-02']], ['元音', ['yb-03', 'yb-04', 'yb-05', 'yb-06', 'yb-07', 'yb-08']],
    ['辅音', ['yb-09', 'yb-10', 'yb-11', 'yb-12', 'yb-13']], ['拼读', ['yb-14', 'yb-15', 'yb-16']]];
  const byId = {}; YB.lessons.forEach((l, i) => { l.n = i + 1; byId[l.id] = l; });
  function preview(l) {
    if (l.kind === 'sounds') return l.syms.map(s => '/' + s + '/').join(' ');
    if (l.kind === 'letters') return 'Aa Bb Cc … Zz';
    if (l.kind === 'vowelLetters') return 'a e i o u';
    if (l.kind === 'combos') return l.combos.slice(0, 6).map(c => c[0]).join(' · ') + ' …';
    return 'com·ˈpu·ter';
  }
  function renderHome() {
    const prog = loadProg();
    $('#lessons').innerHTML = SECTIONS.map(([name, ids]) => `<h3 class="yb-sec">${name}</h3><div class="card yb-list">` +
      ids.map(id => {
        const l = byId[id], st = status(id), p = prog[id];
        const score = p && p.best != null ? ` · 最好 ${p.best} 分` : '';
        return `<button class="yb-lesson" data-open="${id}"><span class="num">${l.n}</span>
          <span class="t"><b>${esc(l.title)}</b><small>${esc(preview(l))}</small></span>
          <span class="st st-${st}">${STATUS_NAME[st]}${score}</span></button>`;
      }).join('') + '</div>').join('');
  }
  $('#lessons').addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) openLesson(b.dataset.open); });

  /* ---------------- 学 ---------------- */
  function learnHtml(l) {
    let h = `<div class="card yb-intro"><p>${esc(l.intro)}</p></div>`;
    if (l.kind === 'letters') {
      h += '<div class="card"><p class="muted">点字母听它的名字。</p><div class="yb-letters">' + YB.letters.map(([L, ipa]) =>
        `<button class="yb-letter" data-letter="${L}"><b>${L}${L.toLowerCase()}</b><span class="ipa">/${esc(ipa)}/</span></button>`).join('') + '</div>' +
        '<p class="warn">容易混的：<b>G</b> /dʒiː/ 和 <b>J</b> /dʒeɪ/；<b>E</b> /iː/ 和 <b>I</b> /aɪ/；<b>A</b> /eɪ/ 和 <b>R</b> /ɑː/。<b>Z</b> 英式读 /zed/，美式读 /ziː/。</p></div>';
    } else if (l.kind === 'vowelLetters') {
      h += l.rules.map(([v, a, aw, b, bw]) => `<div class="card yb-vl"><div class="yb-vl-letter">${v}</div>
        <div class="yb-vl-col"><h4>读名字 ${symBtn(a, false, aw[0][0])}</h4><div class="yb-words">${aw.map(wordChip).join('')}</div></div>
        <div class="yb-vl-col"><h4>读短音 ${symBtn(b, false, bw[0][0])}</h4><div class="yb-words">${bw.map(wordChip).join('')}</div></div></div>`).join('');
      h += `<p class="warn">${esc(l.note)}</p>`;
    } else if (l.kind === 'sounds') {
      h += l.syms.map(s => { const d = YB.sounds[s]; return `<div class="card yb-sound">${symBtn(s, true)}
        <div class="yb-sound-body"><p>${esc(d.tip)}</p><div class="yb-words">${d.words.map(wordChip).join('')}</div></div></div>`; }).join('');
      h += '<p class="hint">点音标听发音，点单词听例词；红色的字母就发这个音。</p>';
    } else if (l.kind === 'combos') {
      h += '<div class="card">' + l.combos.map(c => {
        const reads = [];
        for (let i = 1; i < c.length; i += 2) reads.push(`<div class="yb-read">${symBtn(c[i], false, c[i + 1][0][0])}<div class="yb-words">${c[i + 1].map(wordChip).join('')}</div></div>`);
        return `<div class="yb-combo"><div class="yb-combo-g">${esc(c[0])}</div><div>${reads.join('')}</div></div>`;
      }).join('') + '</div>';
    } else if (l.kind === 'syllable') {
      h += '<div class="card"><p class="muted">点单词打开拼读卡片：一节一节读，红框是重读音节。</p><div class="yb-syls">' +
        sylWords(l).map(w => { const p = KWPhonics.parse(w);
          return `<button class="yb-sylw" data-ph="${esc(w)}"><span>${p.syls.map(s => `<i class="${s.stress ? 'stress' : ''}">${esc(s.g)}</i>`).join('·')}</span><span class="ipa">${esc(p.ipa)}</span></button>`; }).join('') +
        '</div></div>';
    }
    return h;
  }
  const sylWords = l => l.words.filter(w => window.KWPhonics && KWPhonics.parse(w) && KWPhonics.parse(w).syls.length > 1);

  /* ---------------- 出题 ----------------
   * 题目：{ q: 题干 HTML, audio: 自动播放的函数, opts: [选项 HTML], ans: 正确选项下标, why: 讲解 HTML }
   * 每种课都按“覆盖每个要点”出：每个音标 / 字母组合至少一题 */
  function mk(q, right, wrongs, why, audioFn) {
    const opts = shuffle([right].concat(shuffle(uniq(wrongs.filter(w => w !== right))).slice(0, 3)));
    return { q, opts, ans: opts.indexOf(right), why, audio: audioFn };
  }
  const symOpt = s => '/' + s + '/';
  const ALL_SYMS = Object.keys(YB.sounds);
  // 容易混的音：选项里优先放它们
  const CONFUSE = { 'iː': ['ɪ', 'e'], 'ɪ': ['iː', 'e'], 'uː': ['ʊ', 'ɔː'], 'ʊ': ['uː', 'ʌ'], 'ɔː': ['ɒ', 'əʊ'], 'ɒ': ['ɔː', 'ʌ'], 'ɑː': ['ʌ', 'æ'], 'ʌ': ['ɑː', 'æ'],
    'ɜː': ['ə', 'ɑː'], 'ə': ['ɜː', 'ʌ'], 'e': ['æ', 'ɪ'], 'æ': ['e', 'ʌ'], 'eɪ': ['e', 'aɪ'], 'aɪ': ['eɪ', 'ɔɪ'], 'ɔɪ': ['aɪ', 'əʊ'],
    'əʊ': ['aʊ', 'ɔː'], 'aʊ': ['əʊ', 'ɔː'], 'ɪə': ['eə', 'ʊə'], 'eə': ['ɪə', 'e'], 'ʊə': ['ɪə', 'uː'],
    'p': ['b', 't'], 'b': ['p', 'd'], 't': ['d', 'k'], 'd': ['t', 'ɡ'], 'k': ['ɡ', 't'], 'ɡ': ['k', 'd'], 'f': ['v', 'θ'], 'v': ['f', 'w'],
    'θ': ['s', 'ð'], 'ð': ['z', 'θ'], 's': ['θ', 'z'], 'z': ['ð', 's'], 'ʃ': ['s', 'ʒ'], 'ʒ': ['ʃ', 'dʒ'], 'h': ['f', 'w'], 'r': ['l', 'w'],
    'tʃ': ['tr', 'ʃ'], 'dʒ': ['dr', 'ʒ'], 'tr': ['tʃ', 'ts'], 'dr': ['dʒ', 'dz'], 'ts': ['tʃ', 's'], 'dz': ['dʒ', 'z'],
    'm': ['n', 'ŋ'], 'n': ['ŋ', 'l'], 'ŋ': ['n', 'm'], 'l': ['r', 'n'], 'w': ['v', 'j'], 'j': ['w', 'dʒ'] };
  const wrongSyms = (s, pool) => shuffle(uniq((CONFUSE[s] || []).concat(shuffle(pool)))).filter(x => x !== s);

  function soundQuestion(l, s, type) {
    const d = YB.sounds[s], others = l.syms.filter(x => x !== s);
    const word = pick(d.words), wrongs = wrongSyms(s, others.length >= 3 ? others : others.concat(ALL_SYMS));
    const why = `${symBtn(s)} ${esc(d.tip)}<div class="yb-words">${d.words.map(wordChip).join('')}</div>`;
    if (type === 0 && AU.sym.indexOf(s) >= 0)
      return mk('🔊 听音，选出你听到的音标', symOpt(s), wrongs.map(symOpt), why, () => playSym(s));
    if (type <= 1)
      return mk(`单词 <span class="yb-qword">${hl(word[0])}</span>（${esc(word[2])}）里红色的字母读哪个音？`, symOpt(s), wrongs.map(symOpt), why, () => playWord(word[0]));
    if (type === 2) {    // 听单词选音标：错的选项是把这个音换成容易混的音
      const fake = wrongs.slice(0, 6).map(x => '/' + word[1].split(s).join(x) + '/').filter(x => x !== '/' + word[1] + '/');
      if (fake.length >= 2) return mk('🔊 听单词，选出它的音标', '/' + word[1] + '/', fake, why, () => playWord(word[0]));
    }
    // 看音标选单词：错的选项是同一课里别的音的例词
    // 错的选项里不能也有这个音（问 /n/ 时 window 不能当错的选项）
    const pool = (others.length ? others : wrongs.slice(0, 6)).map(x => YB.sounds[x].words).flat().filter(w => w[1].indexOf(s) < 0);
    const wrongW = shuffle(pool).map(w => plain(w[0]));
    return mk(`哪个单词里有 /${esc(s)}/ 这个音？`, plain(word[0]), wrongW, why);
  }
  function questions(l, n) {
    const qs = [];
    if (l.kind === 'sounds') {
      const order = [];
      while (order.length < n) order.push(...shuffle(l.syms));       // 每个音都轮到
      order.slice(0, n).forEach((s, i) => qs.push(soundQuestion(l, s, i % 4)));
    } else if (l.kind === 'letters') {
      const ls = shuffle(YB.letters);
      for (let i = 0; i < n; i++) {
        const [L, ipa] = ls[i % 26], wrong = shuffle(YB.letters.filter(x => x[0] !== L));
        const why = `<button class="yb-letter" data-letter="${L}"><b>${L}${L.toLowerCase()}</b><span class="ipa">/${esc(ipa)}/</span></button>`;
        const t = i % 3;
        if (t === 0) qs.push(mk('🔊 听字母的名字，选出这个字母', L, wrong.map(x => x[0]), why, () => playLetter(L)));
        else if (t === 1) qs.push(mk(`字母 <span class="yb-qword">${L}</span> 的名字怎么读？`, '/' + ipa + '/', wrong.map(x => '/' + x[1] + '/'), why));
        else qs.push(mk(`大写 <span class="yb-qword">${L}</span> 的小写是哪个？`, L.toLowerCase(), wrong.map(x => x[0].toLowerCase()), why));
      }
    } else if (l.kind === 'vowelLetters') {
      const items = [];
      l.rules.forEach(([v, a, aw, b, bw]) => { aw.forEach(w => items.push([v, w, a, b])); bw.forEach(w => items.push([v, w, b, a])); });
      shuffle(items).slice(0, n).forEach(([v, w, right, other]) => {
        const all = l.rules.map(r => r[1]).concat(l.rules.map(r => r[3]));
        qs.push(mk(`单词 <span class="yb-qword">${hl(w[0])}</span>（${esc(w[2])}）里的 ${v} 读什么？`, symOpt(right), [symOpt(other)].concat(shuffle(all).map(symOpt)),
          `${wordChip(w)}<p>${esc(l.note)}</p>`, () => playWord(w[0])));
      });
    } else if (l.kind === 'combos') {
      const items = [];
      l.combos.forEach(c => { for (let i = 1; i < c.length; i += 2) items.push([c, c[i], c[i + 1]]); });
      const allIpa = uniq(items.map(x => x[1]));
      let list = shuffle(items);
      while (list.length < n) list = list.concat(shuffle(items));
      list.slice(0, n).forEach(([c, ipa, ws]) => {
        const w = pick(ws), alt = [];
        for (let i = 1; i < c.length; i += 2) if (c[i] !== ipa) alt.push(symOpt(c[i]));
        qs.push(mk(`单词 <span class="yb-qword">${hl(w[0])}</span>（${esc(w[2])}）里红色的字母读什么？`, symOpt(ipa), alt.concat(shuffle(allIpa).map(symOpt)),
          `<b>${esc(c[0])}</b> ${symBtn(ipa, false, ws[0][0])}<div class="yb-words">${ws.map(wordChip).join('')}</div>`, () => playWord(w[0])));
      });
    } else if (l.kind === 'syllable') {
      const ws = shuffle(sylWords(l));
      for (let i = 0; i < n; i++) {
        const w = ws[i % ws.length], p = KWPhonics.parse(w), t = i % 3;
        const why = `<button class="yb-sylw" data-ph="${esc(w)}"><span>${p.syls.map(s => `<i class="${s.stress ? 'stress' : ''}">${esc(s.g)}</i>`).join('·')}</span><span class="ipa">${esc(p.ipa)}</span></button>`;
        if (t === 0) {
          const stressed = p.syls.find(s => s.stress) || p.syls[0];
          const right = stressed.g, opts = p.syls.map(s => s.g).filter(g => g !== right);
          const q = mk(`<span class="yb-qword">${p.syls.map(s => esc(s.g)).join('·')}</span> 重读哪一节？（可以看音标 ${esc(p.ipa)} 里的 ˈ）`, right, opts, why);
          q.opts = p.syls.map((s, k) => `第 ${k + 1} 节 ${s.g}`); q.ans = p.syls.indexOf(stressed);   // 选项按单词里的顺序排（ba·na·na 有两个 na）
          qs.push(q);
        } else if (t === 1) {
          qs.push(mk(`<span class="yb-qword">${esc(w)}</span> 有几个音节？`, String(p.syls.length), ['1', '2', '3', '4', '5'], why));
        } else {
          qs.push(mk(`看音标 <span class="yb-qword">${esc(p.ipa)}</span>，这是哪个单词？`, w, shuffle(ws.filter(x => x !== w)), why));
        }
      }
    }
    return qs;
  }
  const testSize = l => l.kind === 'sounds' ? Math.min(12, Math.max(8, l.syms.length * 2))
    : l.kind === 'combos' ? Math.max(10, l.combos.length) : l.kind === 'letters' ? 12 : 10;

  /* ---------------- 练 / 测 ---------------- */
  let quiz = null;
  function startQuiz(l, mode) {
    const n = mode === 'test' ? testSize(l) : 10;
    quiz = { l, mode, qs: questions(l, n), i: 0, right: 0, answered: false };
    renderQ();
  }
  function renderQ() {
    const { mode, qs, i } = quiz, q = qs[i];
    quiz.answered = false;
    $('#pane').innerHTML = `<div class="card yb-q">
      <div class="yb-q-top"><span>${mode === 'test' ? '测试' : '练习'} 第 ${i + 1} / ${qs.length} 题</span><span>答对 ${quiz.right}</span></div>
      <div class="yb-q-text">${q.q}</div>
      ${q.audio ? '<button class="btn" id="btnReplay">🔊 再听一遍</button>' : ''}
      <div class="yb-opts">${q.opts.map((o, k) => `<button class="yb-opt" data-k="${k}">${esc(o)}</button>`).join('')}</div>
      <div class="yb-why" id="why" hidden></div>
      <div class="row-actions center"><button class="btn big primary" id="btnNext" hidden>${i + 1 < qs.length ? '下一题' : '看结果'}</button></div></div>`;
    if (q.audio) { q.audio(); $('#btnReplay').onclick = q.audio; }
    $('#pane .yb-opts').onclick = e => {
      const b = e.target.closest('.yb-opt'); if (!b || quiz.answered) return;
      quiz.answered = true;
      const k = +b.dataset.k, ok = k === q.ans;
      if (ok) quiz.right++;
      document.querySelectorAll('.yb-opt').forEach((x, j) => x.classList.add(j === q.ans ? 'right' : j === k ? 'wrong' : 'dim'));
      const why = $('#why'); why.hidden = false;
      why.innerHTML = `<p class="${ok ? 'ok' : 'bad'}">${ok ? '✔ 答对了' : '✘ 正确答案是 ' + esc(q.opts[q.ans])}</p>${q.why}`;
      $('#btnNext').hidden = false;
    };
    $('#btnNext').onclick = () => { if (++quiz.i < qs.length) renderQ(); else finishQuiz(); };
  }
  function finishQuiz() {
    const { l, mode, qs, right } = quiz, score = Math.round(right / qs.length * 100);
    if (mode === 'test') saveProg(l.id, p => { p.last = score; p.best = Math.max(p.best || 0, score); p.attempts = (p.attempts || 0) + 1; p.at = Date.now(); });
    const pass = score >= PASS;
    $('#pane').innerHTML = `<div class="card yb-result"><div class="big-score ${pass ? 'ok' : 'bad'}">${score} 分</div>
      <p>答对 ${right} / ${qs.length} 题。${mode === 'test' ? (pass ? '这一课学会了！' : '还差一点，回到「学」再看看，然后再测一次。') : '练得差不多了就去「测」吧。'}</p>
      <div class="row-actions center"><button class="btn big" id="again">再来一次</button>${mode === 'test' && pass && next(l) ? '<button class="btn big primary" id="goNext">下一课</button>' : ''}</div></div>`;
    $('#again').onclick = () => startQuiz(l, mode);
    if ($('#goNext')) $('#goNext').onclick = () => openLesson(next(l).id, false);
  }
  const next = l => YB.lessons[l.n];

  /* ---------------- 页面切换 ---------------- */
  let current = 'vHome', lesson = null;
  function show(v) {
    current = v;
    ['vHome', 'vLesson'].forEach(id => { document.getElementById(id).hidden = id !== v; });
    $('#title').textContent = v === 'vHome' ? '音标课' : `第 ${lesson.n} 课 · ${lesson.title}`;
    $('#subtitle').hidden = v !== 'vHome';
    window.scrollTo(0, 0);
  }
  function setTab(t) {
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    if (t === 'learn') { quiz = null; $('#pane').innerHTML = learnHtml(lesson) + '<div class="row-actions center"><button class="btn big primary" id="toPractice">学完了，去练习</button></div>'; $('#toPractice').onclick = () => setTab('practice'); }
    else startQuiz(lesson, t);
    window.scrollTo(0, 0);
  }
  $('#tabs').onclick = e => { const b = e.target.closest('button'); if (b) setTab(b.dataset.t); };
  function openLesson(id, push = true) {
    lesson = byId[id];
    if (!loadProg()[id]) saveProg(id, () => {});
    if (push) history.pushState({ v: 'vLesson', id }, '', '#' + id);
    else history.replaceState({ v: 'vLesson', id }, '', '#' + id);
    show('vLesson');
    setTab('learn');
  }
  history.replaceState({ v: 'vHome' }, '', location.pathname + location.search);
  window.addEventListener('popstate', e => {
    const st = e.state || {};
    if (st.v === 'vLesson' && byId[st.id]) { lesson = byId[st.id]; show('vLesson'); setTab('learn'); }
    else { show('vHome'); renderHome(); }
  });
  $('#btnBack').onclick = () => {
    if (current !== 'vHome') { history.back(); return; }
    if (inApp) KMApp.goBack();
    else if (history.length > 1) history.back();
    else location.href = 'index.html';
  };

  renderHome();
})();
