/* 听写 / 默写共用流程：设置 → 听写中 → 批改 → 结果（单词听写页 dictation.html 和单元单词页 words.html 共用）
 *
 * 用法：
 *   DictRun.mount(容器, 文案)          把四个视图（vSetup / vRun / vCheck / vResult）的 HTML 放进容器
 *   const R = DictRun.create(opts)     绑定按钮，返回 { openSetup, startRun, isRunning, stopRun, last }
 *     opts.settings   设置对象（会被直接修改：scope, mode, read, reps, speed, pace, order, someN）
 *     opts.save()     设置改了以后保存
 *     opts.show(v, push) / opts.current()   页面切换（配合返回键，由页面自己管理 history）
 *     opts.wrongCount(src) / opts.isWrong(src, key)   这份词里有几个错词、某个词是不是错词
 *     opts.record(src, rows, scope)   批改完成：rows = [{ w, wrong }]，页面自己写进存储
 *     opts.onBack()   结果页「返回词单 / 返回单元」
 *   src = { name, words: [{ en, zh }] }（单词听写传的就是词单对象本身）
 *
 * 朗读：课本单元单词优先放 audio/ 里的录音；其它用 speechSynthesis（浏览器里是浏览器自带的，平板 App 里由 km-shim.js 转给安卓系统 TTS，离线）。
 * 页面要先加载 audio/index.js（录音索引），没加载也能用，只是全部走语音引擎。 */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const keyOf = en => String(en).toLowerCase().replace(/\s+/g, ' ').trim();
  const inApp = !!(window.KMApp && KMApp.goBack);

  /* ---------------- 朗读 ---------------- */
  // 语音引擎是否可用：有的平板没装任何「文字转语音」引擎，读不出声也不报错（#9 真机确认问题 3）。
  // 读的时候判断：读完收到 end 事件 = 可用；报错（不是我们自己打断的）或到兜底时间还没有任何事件 = 不可用。
  // 结果记在本机（ttsKey，不进「我的数据」同步，因为是这台设备自己的情况），下次打开默写设置就默认「读中文写英文」。
  const TTS_KEY = 'fjzk-tts-ok';
  let ttsOk = null;
  try { const v = localStorage.getItem(TTS_KEY); ttsOk = v === '1' ? true : v === '0' ? false : null; } catch (e) { /* 忽略 */ }
  if (!('speechSynthesis' in window)) ttsOk = false;
  function setTts(ok) {
    if (ttsOk === ok) { if (!ok) showTtsWarn(); return; }
    ttsOk = ok;
    try { localStorage.setItem(TTS_KEY, ok ? '1' : '0'); } catch (e) { /* 忽略 */ }
    if (ok) hideTtsWarn(); else showTtsWarn();
  }
  let warnClosed = false;
  function showTtsWarn() {
    if (warnClosed || document.getElementById('ttsWarn')) return;
    const main = document.querySelector('main'); if (!main) return;
    const el = document.createElement('div');
    el.id = 'ttsWarn'; el.className = 'tts-warn'; el.setAttribute('role', 'alert');
    el.innerHTML = '<div><b>这台平板没有语音朗读功能，课本以外的词和中文读不出来。</b>' +
      '课本单元单词有录音，照常能听。请在系统设置里搜索「文字转语音」，安装或开启语音引擎。没装好之前，自建词单请选「读中文写英文」：中文会显示在屏幕上。</div>' +
      '<button class="btn" type="button">知道了</button>';
    el.querySelector('button').onclick = () => { warnClosed = true; el.remove(); };
    main.insertBefore(el, main.firstChild);
  }
  function hideTtsWarn() { const el = document.getElementById('ttsWarn'); if (el) el.remove(); }
  let sayToken = 0, cancelling = false;
  function cancelSpeech() { cancelling = true; try { speechSynthesis.cancel(); } finally { cancelling = false; } }

  // 课本单元单词有提前生成的英文录音（audio/index.js + audio/en/*.mp3，见 docs/audio/build_audio.py），
  // 比平板自带的语音引擎清楚得多：有录音就放录音，没有（自建词单里课本以外的词、中文）才用语音引擎。
  const AUDIO_BASE = new URL('../audio/en/', document.currentScript.src).href;
  // 语速：录音生成时已经略慢（0.9），「慢」再放慢一些；语音引擎 0.8 以下有的会发糊，所以「正常」用 0.9
  const RATE = { normal: { rec: 1, en: 0.9, zh: 0.95 }, slow: { rec: 0.82, en: 0.75, zh: 0.85 } };
  let speed = 'normal';
  const rates = () => RATE[speed] || RATE.normal;
  function recFor(text, lang) {
    if (lang !== 'en-US' || !window.KW_AUDIO) return null;
    const t = String(text).replace(/\s+/g, ' ').trim();
    return KW_AUDIO[t] || KW_AUDIO[t.toLowerCase()] || null;
  }
  let audioEl = null;
  function stopAudio() { if (audioEl) { audioEl.onended = audioEl.onerror = null; audioEl.pause(); } }
  // 放一条录音；放不了（文件缺失、被系统拦截）就调用 fallback 改用语音引擎
  function playRec(file, token, next, fallback) {
    const a = audioEl || (audioEl = new Audio());
    let settled = false, t = 0;
    const go = ok => {
      if (settled) return;
      settled = true; clearTimeout(t); a.onended = a.onerror = null;
      if (token === sayToken) (ok ? next : fallback)();
    };
    a.onended = () => go(true);
    a.onerror = () => go(false);
    a.src = AUDIO_BASE + file + '.mp3';
    a.playbackRate = rates().rec;
    t = setTimeout(() => go(false), 8000);
    const p = a.play();
    if (p && p.catch) p.catch(() => go(false));
  }
  // 语音引擎读一条；读不出来时按估计时长兜底
  function speakTts(it, token, next) {
    if (!('speechSynthesis' in window)) { showTtsWarn(); setTimeout(() => { if (token === sayToken) next(); }, 1200); return; }
    const en = it.lang === 'en-US';
    const u = new SpeechSynthesisUtterance(it.text);
    u.lang = it.lang; u.rate = it.rate || (en ? rates().en : rates().zh);
    let settled = false, t = 0;
    const go = () => { if (settled) return; settled = true; clearTimeout(t); if (token === sayToken) next(); };
    u.onend = () => { if (token === sayToken) setTts(true); go(); };
    u.onerror = e => {
      // 我们自己 cancel 打断的不算（浏览器给 interrupted / canceled，App 里在 cancel 调用中同步回调）
      const err = e && e.error;
      if (!cancelling && err !== 'interrupted' && err !== 'canceled' && token === sayToken) setTts(false);
      go();
    };
    // 已知没有语音引擎时不用干等，很快进入下一步（读中文写英文时中文显示在屏幕上）
    const wait = ttsOk === false ? 1200 : 4700 + it.text.length * (en ? 110 : 260) / u.rate;
    t = setTimeout(() => {
      if (!settled && token === sayToken && ttsOk !== false) setTts(false);   // 一直没有任何回应：没有语音引擎
      go();
    }, wait);
    speechSynthesis.speak(u);
  }
  // items: [{text, lang, rate}]，一条接一条读（中间停一下），全部读完调用 done
  function say(items, done) {
    const token = ++sayToken;
    stopAudio();
    if ('speechSynthesis' in window) cancelSpeech();
    let i = 0;
    const next = () => {
      if (token !== sayToken) return;
      if (i >= items.length) { if (done) { const d = done; done = null; d(); } return; }
      const it = items[i++];
      setTimeout(() => {
        if (token !== sayToken) return;
        const file = recFor(it.text, it.lang);
        if (file) playRec(file, token, next, () => speakTts(it, token, next));
        else speakTts(it, token, next);
      }, i > 1 ? 450 : 0);
    };
    next();
  }
  function stopSay() { sayToken++; stopAudio(); if ('speechSynthesis' in window) cancelSpeech(); }
  // 这份词里的英文是不是全都有录音（没有语音引擎的平板也能听写英文）
  const allRecorded = words => words.length > 0 && words.every(w => recFor(w.en, 'en-US'));
  if (ttsOk === false) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showTtsWarn);
    else showTtsWarn();
  }

  // 听写时保持屏幕常亮
  let wakeLock = null;
  function keepAwake(on) {
    if (inApp && KMApp.keepScreenOn) { KMApp.keepScreenOn(!!on); return; }
    if (!('wakeLock' in navigator)) return;
    if (on && !wakeLock) navigator.wakeLock.request('screen').then(l => { wakeLock = l; }).catch(() => {});
    if (!on && wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }

  /* ---------------- 视图 HTML ---------------- */
  const DEFAULT_TEXT = {
    act: '听写', listWord: '词单', start: '开始听写', scopeWrong: '只听错词', orderList: '按词单',
    stop: '结束听写', back: '返回词单', again: '全部再听一遍', wrongAgain: '错词再听写'
  };
  function mount(el, text) {
    const T = Object.assign({}, DEFAULT_TEXT, text || {});
    el.innerHTML = `
  <!-- ${T.act}设置 -->
  <section class="view" id="vSetup" hidden>
    <div class="card">
      <h2 id="setupName"></h2>
      <div class="dopt"><span class="dopt-label">${T.act}范围</span><div class="seg" data-opt="scope">
        <button data-v="all">全部 <i id="nAll"></i></button>
        <button data-v="wrong">${T.scopeWrong} <i id="nWrong"></i></button>
        <button data-v="some">随机抽</button>
      </div><label class="some-n" id="someWrap">抽 <input type="number" id="someN" min="1" value="10"> 个</label></div>
      <div class="dopt"><span class="dopt-label">作答方式</span><div class="seg" data-opt="mode">
        <button data-v="paper">纸上写</button><button data-v="type">键盘输入</button>
      </div></div>
      <div class="dopt"><span class="dopt-label">朗读内容</span><div class="seg" data-opt="read">
        <button data-v="en">读英文</button><button data-v="enzh">英文 + 中文</button><button data-v="zh">读中文写英文</button>
      </div></div>
      <div class="dopt"><span class="dopt-label">每个词读</span><div class="seg" data-opt="reps">
        <button data-v="1">1 遍</button><button data-v="2">2 遍</button><button data-v="3">3 遍</button>
      </div></div>
      <div class="dopt"><span class="dopt-label">语速</span><div class="seg" data-opt="speed">
        <button data-v="normal">正常</button><button data-v="slow">慢</button>
      </div></div>
      <div class="dopt paper-only"><span class="dopt-label">书写时间</span><div class="seg" data-opt="pace">
        <button data-v="fast">快</button><button data-v="normal">中</button><button data-v="slow">慢</button>
      </div></div>
      <div class="dopt"><span class="dopt-label">顺序</span><div class="seg" data-opt="order">
        <button data-v="random">随机</button><button data-v="list">${T.orderList}</button>
      </div></div>
      <p class="hint" id="setupHint"></p>
      <p class="hint voice-info" id="voiceInfo" hidden></p>
    </div>
    <div class="row-actions sticky">
      <button class="btn" id="btnSetupBack">返回</button>
      <button class="btn primary big" id="btnStart">${T.start}</button>
    </div>
  </section>

  <!-- ${T.act}中 -->
  <section class="view" id="vRun" hidden>
    <div class="run-card">
      <div class="run-no"><span id="runIdx">1</span><small> / <span id="runTotal">10</span></small></div>
      <div class="run-zh" id="runZh"></div>
      <div class="run-state" id="runState">请听…</div>
      <div class="bar run-bar"><i id="runBar"></i></div>
      <input id="runInput" class="run-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="听到后在这里输入，按回车" hidden>
    </div>
    <div class="run-ctrl">
      <button class="btn big" id="btnPrev">⏮ 上一个</button>
      <button class="btn big" id="btnRepeat">🔁 再读一遍</button>
      <button class="btn big" id="btnPause">⏸ 暂停</button>
      <button class="btn big primary" id="btnNext">下一个 ⏭</button>
    </div>
    <div class="row-actions center"><button class="btn" id="btnStop">${T.stop}</button></div>
  </section>

  <!-- 批改 -->
  <section class="view" id="vCheck" hidden>
    <div class="card">
      <p class="hint" id="checkHint"></p>
      <div id="checkRows"></div>
    </div>
    <div class="row-actions sticky">
      <button class="btn primary big" id="btnCheckDone">批改完成</button>
    </div>
  </section>

  <!-- 结果 -->
  <section class="view" id="vResult" hidden>
    <div class="card result">
      <div class="score" id="resScore"></div>
      <div class="score-sub" id="resSub"></div>
      <div id="resWrong"></div>
    </div>
    <div class="row-actions sticky">
      <button class="btn" id="btnResList">${T.back}</button>
      <button class="btn" id="btnResAgain">${T.again}</button>
      <button class="btn primary big" id="btnResWrong">${T.wrongAgain}</button>
    </div>
  </section>`;
    return T;
  }

  /* ---------------- 流程 ---------------- */
  const PACE = { fast: [3000, 250], normal: [4500, 380], slow: [6500, 520] };
  // 在当前这条历史记录上换页面：保留页面放在 state 里的其它字段（单元单词页用 d 记录离首页几层）
  const keepState = v => Object.assign({}, history.state || {}, { v });
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const tidy = s => s.replace(/[’‘`]/g, "'").replace(/\s+/g, ' ').replace(/[.。]+$/, '').trim();
  // 一般不分大小写（平板键盘会自动把首字母变大写）；但答案本身有大写（人名、月份、星期）时必须一致
  function sameAnswer(ans, en) {
    const a = tidy(ans), b = tidy(en);
    return /[A-Z]/.test(b) ? a === b : a.toLowerCase() === b.toLowerCase();
  }

  function create(o) {
    const S = o.settings;
    if (!RATE[S.speed]) S.speed = 'normal';
    speed = S.speed;
    const T = Object.assign({}, DEFAULT_TEXT, o.text || {});

    /* 设置 */
    let setupList = null;
    function openSetup(list, replace) {
      setupList = list;
      $('#setupName').textContent = list.name;
      const nWrong = o.wrongCount(list);
      $('#nAll').textContent = list.words.length;
      $('#nWrong').textContent = nWrong;
      document.querySelector('[data-opt=scope] [data-v=wrong]').disabled = !nWrong;
      if (S.scope === 'wrong' && !nWrong) S.scope = 'all';
      // 这台设备没有语音引擎、词又不是全有录音：默认改成「读中文写英文」（中文显示在屏幕上，不用听也能默）
      if (ttsOk === false && !allRecorded(list.words) && S.read !== 'zh' && list.words.some(w => w.zh)) S.read = 'zh';
      showVoiceInfo(list);
      $('#someN').value = Math.min(S.someN || 10, list.words.length);
      $('#someN').max = list.words.length;
      syncSetup();
      if (replace) { history.replaceState(keepState('vSetup'), '', '#setup'); o.show('vSetup', false); }
      else o.show('vSetup');
    }
    function syncSetup() {
      document.querySelectorAll('#vSetup .seg[data-opt]').forEach(seg => {
        const v = String(S[seg.dataset.opt]);
        seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
      });
      $('#someWrap').hidden = S.scope !== 'some';
      document.querySelector('#vSetup .paper-only').hidden = S.mode !== 'paper';
      const hasZh = setupList && setupList.words.some(w => w.zh);
      const tips = [];
      const rec = setupList && allRecorded(setupList.words);
      if (ttsOk === false && rec) { if (S.read !== 'en') tips.push('这台平板没有语音引擎：英文用录音照常能听，中文读不出来，建议选「读英文」。'); }
      else if (ttsOk === false) tips.push(S.read === 'zh' ? '这台平板读不出声音，中文会显示在屏幕上，看中文写英文。' : '这台平板读不出声音，建议选「读中文写英文」。');
      if (S.read !== 'en' && !hasZh) tips.push('这个' + T.listWord + '没有中文释义，会只读英文。');
      if (S.mode === 'paper') tips.push('准备好纸和笔，每个词写在对应的序号后面。' + T.act + '完再对照批改。');
      else tips.push('听到后用键盘输入，按回车进入下一个，结束后自动判分。');
      $('#setupHint').textContent = tips.join(' ');
    }
    document.querySelectorAll('#vSetup .seg[data-opt]').forEach(seg => seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      S[seg.dataset.opt] = b.dataset.v; o.save(); syncSetup();
      if (seg.dataset.opt === 'speed') { speed = S.speed; say([{ text: (setupList && setupList.words[0] || { en: 'hello' }).en, lang: 'en-US' }]); }   // 试听一下
    }));
    // 发音来源：几个词有录音；App 里再说明系统语音引擎的情况（没有英文语音时提示去装）
    function showVoiceInfo(list) {
      const el = $('#voiceInfo');
      const n = list.words.filter(w => recFor(w.en, 'en-US')).length;
      const parts = [];
      if (n === list.words.length) parts.push('发音：全部单词都用录音朗读。');
      else if (n) parts.push(`发音：${n} 个课本单词用录音，其余 ${list.words.length - n} 个用平板的语音引擎。`);
      else parts.push('发音：用平板的语音引擎朗读。');
      let info = null;
      try { info = inApp && KMApp.ttsInfo ? JSON.parse(KMApp.ttsInfo() || 'null') : null; } catch (e) { info = null; }
      if (info && n < list.words.length) {
        if (!info.engine) parts.push('这台平板没有语音引擎。');
        else if (!info.en) parts.push(`语音引擎「${info.label || info.engine}」没有英文语音，英文会读不准。建议在应用商店安装「Google 语音服务」（或讯飞语音引擎），再到系统设置「文字转语音」里设为首选引擎。`);
        else parts.push(`语音引擎：${info.label || info.engine}（${info.enLocal ? '离线英文语音' : '英文语音要联网'}）。如果听不清，可以在应用商店安装「Google 语音服务」并设为首选引擎。`);
      }
      el.textContent = parts.join(' ');
      el.hidden = false;
    }
    $('#someN').oninput = () => { S.someN = Math.max(1, +$('#someN').value || 1); o.save(); };
    $('#btnSetupBack').onclick = () => history.back();
    $('#btnStart').onclick = () => startRun(setupList, S.scope);

    /* 进行中 */
    let run = null, timer = null, tickStart = 0, tickLen = 0, tickLeft = 0;
    function startRun(list, scope, onlyKeys) {
      let words = list.words.slice();
      if (onlyKeys) words = words.filter(w => onlyKeys.has(keyOf(w.en)));
      else if (scope === 'wrong') words = words.filter(w => o.isWrong(list, keyOf(w.en)));
      if (S.order === 'random' || scope === 'some') shuffle(words);
      if (scope === 'some' && !onlyKeys) words = words.slice(0, Math.max(1, Math.min(+S.someN || 10, words.length)));
      if (!words.length) { alert('没有可以' + T.act + '的单词。'); return; }
      run = {
        list, scope, words, idx: 0, answers: words.map(() => ''), paused: false,
        mode: S.mode, read: S.read, reps: +S.reps || 2, pace: PACE[S.pace] || PACE.normal
      };
      $('#runTotal').textContent = words.length;
      $('#runInput').hidden = run.mode !== 'type';
      $('#btnPause').hidden = run.mode !== 'paper';
      // 从设置页或结果页（错词再听写 / 全部再听一遍）出发都在当前记录上替换，不再压新记录，
      // 否则「返回词单」的 history.back() 会退回上一轮的结果页（#9 第 2 期测试问题 1）
      const cur = o.current();
      if (cur === 'vSetup' || cur === 'vResult') history.replaceState(keepState('vRun'), '', '#run'), o.show('vRun', false);
      else o.show('vRun');
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
      if (done > 0 && confirm(`已经${T.act}了 ${run.idx + 1} 个，要批改已${T.act}的部分吗？\n（选“取消”直接放弃这次${T.act}）`)) {
        if (run.mode === 'type') run.answers[run.idx] = $('#runInput').value.trim();
        run.words = run.words.slice(0, run.idx + 1);
        run.answers = run.answers.slice(0, run.idx + 1);
        finishRun();
      } else { stopRun(); history.back(); }
    };
    $('#runInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); stopSay(); next(); } });

    /* 批改 */
    let checking = null;
    function finishRun() {
      clearTimer(); stopSay(); keepAwake(false);
      const r = run; run = null;
      checking = {
        done: false, list: r.list, scope: r.scope, mode: r.mode, words: r.words, answers: r.answers,
        wrong: r.words.map((w, i) => r.mode === 'type' ? !sameAnswer(r.answers[i] || '', w.en) : false)
      };
      $('#checkHint').textContent = r.mode === 'paper'
        ? '对照纸上写的，点一下写错的词标成 ✗（再点一下取消）。'
        : '已经自动判分。拼写其实没错（比如大小写、缩写写法不同）的话，点一下改成 ✓。';
      renderCheck();
      history.replaceState(keepState('vCheck'), '', '#check');
      o.show('vCheck', false);
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
      const c = checking;
      if (!c || c.done) return;
      c.done = true;
      const rows = c.words.map((w, i) => ({ w, wrong: !!c.wrong[i] }));
      o.record(c.list, rows, c.scope);
      const wrongWords = rows.filter(x => x.wrong).map(x => x.w);
      showResult(c, rows.length - wrongWords.length, wrongWords);
    };

    /* 结果 */
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
      history.replaceState(keepState('vResult'), '', '#result');
      o.show('vResult', false);
    }
    $('#btnResList').onclick = () => o.onBack();
    $('#btnResAgain').onclick = () => { if (checking) startRun(checking.list, 'all'); };
    $('#btnResWrong').onclick = () => {
      if (checking && lastWrong.length) startRun(checking.list, 'wrong', new Set(lastWrong.map(w => keyOf(w.en))));
    };

    return {
      openSetup, startRun, stopRun,
      isRunning: () => !!run,
      // 默写完在批改页、还没点「批改完成」（这时离开，这次默写不记分）
      isChecking: () => !!(checking && !checking.done),
      // 放弃批改（返回键确认放弃后调用）
      dropCheck: () => { if (checking) checking.done = true; }
    };
  }

  window.DictRun = { mount, create, say, stopSay, keepAwake, keyOf, esc, sameAnswer, ttsOk: () => ttsOk };
})();
