/* 生字词听写流程：设置 → 听写中 → 批改 → 结果（tingxie.html 用；照英语 english-map/js/dict-run.js 改成中文版）
 *
 * 用法：
 *   TingxieRun.mount(容器)             把四个视图（vSetup / vRun / vCheck / vResult）的 HTML 放进容器
 *   const R = TingxieRun.create(opts)  绑定按钮，返回 { openSetup, startRun, isRunning, stopRun }
 *     opts.settings   设置对象（会被直接修改：scope, mode(paper/hand/type), handJudge, reps, speed, pace, order, someN）
 *     opts.save()     设置改了以后保存
 *     opts.show(v, push) / opts.current()   页面切换（配合返回键，由页面自己管理 history）
 *     opts.wrongCount(src) / opts.isWrong(key)   这份词里有几个错词、某个词是不是错词
 *     opts.record(src, rows)   批改完成：rows = [{ w, wrong }]，页面自己写进存储；可返回一句说明（如复习过关几个），显示在结果页
 *     opts.onBack()   结果页「返回单元」
 *   src = { name, words: [{ key, w, say?, k }] }
 *
 * 手写：自由书写，js/hand-judge.js 判分；笔画数据 data/tingxie/strokes/sNN.js 按需载入；批改页用 js/vendor/hanzi-writer.min.js（MIT）演示笔顺。
 * 朗读用 speechSynthesis（zh-CN）：浏览器里是浏览器自带的，平板 App 里由 km-shim.js 转给安卓系统 TTS（离线）。 */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // 记录的键：词语本身（去掉空白）
  const keyOf = w => String(w).replace(/\s+/g, '').trim();
  const inApp = !!(window.KMApp && KMApp.goBack);

  /* ---------------- 朗读 ---------------- */
  let sayToken = 0;
  // 语速：系统 TTS 的 rate（1 是正常说话速度，听写要放慢）
  const RATE = { normal: 0.8, slow: 0.6, slower: 0.45 };
  let rate = RATE.slow;
  const GAP = 1200;   // 同一个词读几遍时，每遍之间停一下（毫秒）
  // texts: 要读的几段文字，一段一段读，中间停一下；全部读完调用 done；读不出来时按估计时长兜底
  function say(texts, done) {
    const token = ++sayToken;
    const finish = () => { if (token === sayToken && done) { const d = done; done = null; d(); } };
    if (!('speechSynthesis' in window)) { setTimeout(finish, 1500); return; }
    speechSynthesis.cancel();
    let i = 0, guard = 0;
    const one = () => {
      if (token !== sayToken) return;
      if (i >= texts.length) { clearTimeout(guard); finish(); return; }
      const t = texts[i++], u = new SpeechSynthesisUtterance(t);
      u.lang = 'zh-CN'; u.rate = rate;
      let moved = false;
      const nextOne = () => { if (moved) return; moved = true; clearTimeout(guard); setTimeout(one, i < texts.length ? GAP : 0); };
      u.onend = nextOne; u.onerror = nextOne;
      // 引擎没回调时按估计时长兜底
      guard = setTimeout(nextOne, 3000 + t.length * 450 / rate);
      speechSynthesis.speak(u);
    };
    one();
  }
  function stopSay() { sayToken++; if ('speechSynthesis' in window) speechSynthesis.cancel(); }

  // 听写时保持屏幕常亮
  let wakeLock = null;
  function keepAwake(on) {
    if (inApp && KMApp.keepScreenOn) { KMApp.keepScreenOn(!!on); return; }
    if (!('wakeLock' in navigator)) return;
    if (on && !wakeLock) navigator.wakeLock.request('screen').then(l => { wakeLock = l; }).catch(() => {});
    if (!on && wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }

  /* ---------------- 视图 HTML ---------------- */
  function mount(el) {
    el.innerHTML = `
  <!-- 听写设置 -->
  <section class="view" id="vSetup" hidden>
    <div class="card">
      <h2 id="setupName"></h2>
      <div class="dopt"><span class="dopt-label">听写范围</span><div class="seg" data-opt="scope">
        <button data-v="all">全部 <i id="nAll"></i></button>
        <button data-v="wrong">只听错词 <i id="nWrong"></i></button>
        <button data-v="some">随机抽</button>
      </div><label class="some-n" id="someWrap">抽 <input type="number" id="someN" min="1" value="10"> 个</label></div>
      <div class="dopt"><span class="dopt-label">作答方式</span><div class="seg" data-opt="mode">
        <button data-v="paper">纸上写</button><button data-v="hand">手写</button><button data-v="type">键盘输入</button>
      </div></div>
      <div class="dopt hand-only"><span class="dopt-label">手写判分</span><div class="seg" data-opt="handJudge">
        <button data-v="loose">宽松</button><button data-v="strict">严格</button>
      </div></div>
      <div class="dopt"><span class="dopt-label">每个词读</span><div class="seg" data-opt="reps">
        <button data-v="1">1 遍</button><button data-v="2">2 遍</button><button data-v="3">3 遍</button>
      </div></div>
      <div class="dopt"><span class="dopt-label">语速</span><div class="seg" data-opt="speed">
        <button data-v="normal">正常</button><button data-v="slow">慢</button><button data-v="slower">很慢</button>
      </div></div>
      <div class="dopt paper-only"><span class="dopt-label">书写时间</span><div class="seg" data-opt="pace">
        <button data-v="fast">快</button><button data-v="normal">中</button><button data-v="slow">慢</button>
      </div></div>
      <div class="dopt"><span class="dopt-label">顺序</span><div class="seg" data-opt="order">
        <button data-v="list">按课本</button><button data-v="random">打乱</button>
      </div></div>
      <p class="hint" id="setupHint"></p>
    </div>
    <div class="row-actions sticky">
      <button class="btn" id="btnSetupBack">返回</button>
      <button class="btn primary big" id="btnStart">开始听写</button>
    </div>
  </section>

  <!-- 听写中：只显示序号和进度，不显示词语 -->
  <section class="view" id="vRun" hidden>
    <div class="run-card">
      <div class="run-no"><span id="runIdx">1</span><small> / <span id="runTotal">10</span></small></div>
      <div class="run-state" id="runState">请听…</div>
      <div class="bar run-bar"><i id="runBar"></i></div>
      <input id="runInput" class="run-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="听到后在这里输入，按回车" hidden>
      <div class="run-hand" id="runHand" hidden>
        <div class="hand-boxes" id="handBoxes"></div>
        <div class="hand-tools"><button class="btn" id="btnHandUndo">↶ 撤销一笔</button><button class="btn" id="btnHandClear">重写这个词</button></div>
      </div>
    </div>
    <div class="run-ctrl">
      <button class="btn big" id="btnPrev">⏮ 上一个</button>
      <button class="btn big" id="btnRepeat">🔁 再读一遍</button>
      <button class="btn big" id="btnPause">⏸ 暂停</button>
      <button class="btn big primary" id="btnNext">下一个 ⏭</button>
    </div>
    <div class="row-actions center"><button class="btn" id="btnStop">结束听写</button></div>
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
      <button class="btn" id="btnResList">返回单元</button>
      <button class="btn" id="btnResAgain">全部再听一遍</button>
      <button class="btn primary big" id="btnResWrong">错词再听写</button>
    </div>
  </section>`;
  }

  /* ---------------- 流程 ---------------- */
  // 书写时间：基础毫秒 + 每个字的毫秒
  const PACE = { fast: [3000, 1300], normal: [4500, 2000], slow: [6500, 2800] };
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  // 键盘输入的比对：去掉空格和标点符号后完全一致才算对
  const bare = s => String(s).replace(/[\s\p{P}\p{S}]/gu, '');
  const sameAnswer = (ans, w) => !!bare(ans) && bare(ans) === bare(w);

  function create(o) {
    const S = o.settings;

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
      $('#someN').value = Math.min(S.someN || 10, list.words.length);
      $('#someN').max = list.words.length;
      syncSetup();
      if (replace) { history.replaceState({ v: 'vSetup' }, '', '#setup'); o.show('vSetup', false); }
      else o.show('vSetup');
    }
    function syncSetup() {
      if (!RATE[S.speed]) S.speed = 'slow';
      rate = RATE[S.speed];
      document.querySelectorAll('#vSetup .seg[data-opt]').forEach(seg => {
        const v = String(S[seg.dataset.opt]);
        seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
      });
      $('#someWrap').hidden = S.scope !== 'some';
      document.querySelector('#vSetup .paper-only').hidden = S.mode !== 'paper';
      document.querySelector('#vSetup .hand-only').hidden = S.mode !== 'hand';
      $('#setupHint').textContent = S.mode === 'paper'
        ? '准备好纸和笔，每个词写在对应的序号后面。听写完再对照批改。'
        : S.mode === 'hand'
          ? '在屏幕的田字格里写，写的时候不提示对错，写好点“下一个”；全部听写完再一起判分。'
            + (S.handJudge === 'strict' ? '严格：字形和笔顺都要对。' : '宽松：只看字形，笔顺不对也算对。')
          : '听到后用键盘（拼音或手写输入法）输入，按回车进入下一个，结束后自动判分。';
    }
    document.querySelectorAll('#vSetup .seg[data-opt]').forEach(seg => seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      S[seg.dataset.opt] = b.dataset.v; o.save(); syncSetup();
      if (seg.dataset.opt === 'speed') say(['听写']);   // 试听
    }));
    $('#someN').oninput = () => { S.someN = Math.max(1, +$('#someN').value || 1); o.save(); };
    $('#btnSetupBack').onclick = () => history.back();
    $('#btnStart').onclick = () => startRun(setupList, S.scope);

    /* 进行中 */
    let run = null, timer = null, tickStart = 0, tickLen = 0, tickLeft = 0;
    function startRun(list, scope, onlyKeys) {
      let words = list.words.slice();
      if (onlyKeys) words = words.filter(w => onlyKeys.has(w.key));
      else if (scope === 'wrong') words = words.filter(w => o.isWrong(w.key));
      if (S.order === 'random' || scope === 'some') shuffle(words);
      if (scope === 'some' && !onlyKeys) {
        words = words.slice(0, Math.max(1, Math.min(+S.someN || 10, words.length)));
        if (S.order !== 'random') { const pos = new Map(list.words.map((w, i) => [w.key, i])); words.sort((a, b) => pos.get(a.key) - pos.get(b.key)); }
      }
      if (!words.length) { alert('没有可以听写的词语。'); return; }
      if (S.mode === 'hand' && !hasStrokes(words)) {
        $('#btnStart').disabled = true;
        loadStrokes(words).then(() => startRun(list, scope, onlyKeys), err => alert(err.message))
          .then(() => { $('#btnStart').disabled = false; });
        return;
      }
      run = { list, scope, words, idx: 0, answers: words.map(() => ''), paused: false, mode: S.mode, reps: +S.reps || 2, pace: PACE[S.pace] || PACE.normal };
      if (run.mode === 'hand') { run.strict = S.handJudge === 'strict'; run.res = words.map(() => null); }
      $('#runTotal').textContent = words.length;
      $('#runInput').hidden = run.mode !== 'type';
      $('#runHand').hidden = run.mode !== 'hand';
      $('#runState').hidden = run.mode === 'hand';
      $('#btnPause').hidden = run.mode !== 'paper';
      $('#btnPause').textContent = '⏸ 暂停';
      if (o.current() === 'vSetup') history.replaceState({ v: 'vRun' }, '', '#run'), o.show('vRun', false);
      else o.show('vRun');
      playCurrent();
    }
    function stopRun() { clearTimer(); stopSay(); clearHand(); run = null; keepAwake(false); }
    function clearTimer() { if (timer) { cancelAnimationFrame(timer); timer = null; } }
    function speechFor(w) {
      const t = w.say || w.w, out = [];
      for (let r = 0; r < run.reps; r++) out.push(t);
      return out;
    }
    function playCurrent() {
      if (!run) return;
      clearTimer();
      const w = run.words[run.idx];
      tickLen = 0; run.speaking = true;
      $('#runIdx').textContent = run.idx + 1;
      $('#runBar').style.width = '0%';
      $('#runState').textContent = '请听…';
      $('#btnPrev').disabled = run.idx === 0;
      $('#btnNext').textContent = run.idx === run.words.length - 1 ? '完成 ✓' : '下一个 ⏭';
      if (run.mode === 'type') { const inp = $('#runInput'); inp.value = run.answers[run.idx] || ''; inp.focus(); }
      if (run.mode === 'hand') startHand(w);
      say(speechFor(w), () => {
        if (!run || run.words[run.idx] !== w) return;
        run.speaking = false;
        if (run.mode === 'type') { $('#runState').textContent = '输入后按回车'; return; }
        if (run.mode === 'hand') return;
        const chars = bare(w.w).length;
        startCountdown(Math.min(30000, run.pace[0] + run.pace[1] * chars));
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
      if (run.mode === 'hand') judgeCurrent();
      if (run.idx >= run.words.length - 1) { finishRun(); return; }
      run.idx++; playCurrent();
    }
    $('#btnNext').onclick = () => { stopSay(); next(); };
    $('#btnPrev').onclick = () => {
      if (!run || run.idx === 0) return;
      if (run.mode === 'type') run.answers[run.idx] = $('#runInput').value.trim();
      if (run.mode === 'hand') judgeCurrent();
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
      // 手写时当前这个词一笔没写就不算进去
      const keep = run.mode === 'hand' && !hasInk(run.answers[run.idx]) ? run.idx : run.idx + 1;
      const done = run.idx + ((run.mode === 'type' && $('#runInput').value.trim()) || (run.mode === 'hand' && keep > run.idx) ? 1 : 0);
      if (done > 0 && confirm(`已经听写了 ${keep} 个，要批改已听写的部分吗？\n（选“取消”直接放弃这次听写）`)) {
        if (run.mode === 'type') run.answers[run.idx] = $('#runInput').value.trim();
        if (run.mode === 'hand') { judgeCurrent(); run.res = run.res.slice(0, keep); }
        run.words = run.words.slice(0, keep);
        run.answers = run.answers.slice(0, keep);
        finishRun();
      } else { stopRun(); history.back(); }
    };
    /* 手写：田字格里自由书写，写的时候不判断、不提示；离开这个词时用 js/hand-judge.js 判分，批改页统一显示 */
    const hanChars = words => [...new Set(words.map(w => bare(w.w)).join(''))].filter(c => c >= '㐀' && c <= '鿿');
    const bucketsOf = words => [...new Set(hanChars(words).map(c => c.codePointAt(0) % 16))];
    const strokeLoaded = new Set(), strokeLoading = {};
    const hasStrokes = words => bucketsOf(words).every(n => strokeLoaded.has(n));
    function loadStrokes(words) {
      return Promise.all(bucketsOf(words).map(n => strokeLoading[n] || (strokeLoading[n] = new Promise((ok, bad) => {
        const s = document.createElement('script');
        s.src = 'data/tingxie/strokes/s' + String(n).padStart(2, '0') + '.js';
        s.onload = () => { strokeLoaded.add(n); ok(); };
        s.onerror = () => { delete strokeLoading[n]; bad(new Error('笔画数据加载失败')); };
        document.head.appendChild(s);
      }))));
    }
    // 每个词的笔迹：answers[i] = [每个字的笔画 [[{x,y}…]…]]（字形坐标），一笔没写是 ''
    const hasInk = a => Array.isArray(a) && a.some(c => c.length);
    let hand = null;   // 当前词：{ chars, size, ink（同 answers[i]）, order: 依次写在第几个格子（撤销用） }
    function clearHand() { hand = null; $('#handBoxes').innerHTML = ''; }
    function startHand(w) {
      const chars = [...bare(w.w)], box = $('#handBoxes');
      const avail = Math.min(box.clientWidth || 600, 760);
      const gap = avail < 420 ? 6 : 12;
      const size = Math.max(60, Math.min(170, Math.floor((avail - gap * (chars.length - 1)) / chars.length)));
      const saved = run.answers[run.idx];
      hand = { chars, size, ink: Array.isArray(saved) ? saved : chars.map(() => []), order: [] };
      box.style.gap = gap + 'px';
      box.innerHTML = chars.map(() => `<canvas class="hbox" style="width:${size}px;height:${size}px"></canvas>`).join('');
      [...box.children].forEach((cv, k) => initBox(cv, k));
    }
    function initBox(cv, k) {
      const h = hand, dpr = window.devicePixelRatio || 1;
      cv.width = cv.height = Math.round(h.size * dpr);
      const ctx = cv.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = '#222'; ctx.lineWidth = Math.max(3, h.size / 26);
      const px = p => HandJudge.fromChar(p, h.size);
      const drawStroke = st => { ctx.beginPath(); st.forEach((p, n) => { const q = px(p); if (n) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke(); };
      cv.redraw = () => { ctx.clearRect(0, 0, h.size, h.size); h.ink[k].forEach(drawStroke); };
      cv.redraw();
      let cur = null;
      const at = e => { const r = cv.getBoundingClientRect(); return HandJudge.toChar(e.clientX - r.left - cv.clientLeft, e.clientY - r.top - cv.clientTop, h.size); };
      cv.addEventListener('pointerdown', e => {
        if (hand !== h) return;
        e.preventDefault();
        try { cv.setPointerCapture(e.pointerId); } catch (err) { /* 模拟事件没有真实指针 */ }
        cur = [at(e)];
      });
      cv.addEventListener('pointermove', e => {
        if (!cur) return;
        const p = at(e), last = cur[cur.length - 1];
        if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) < 6) return;
        cur.push(p);
        const a = px(last), b = px(p);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      const end = () => {
        if (!cur) return;
        // 只点了一下：当作一个向右下的短点
        if (cur.length === 1) cur.push({ x: cur[0].x + 25, y: cur[0].y - 25 });
        h.ink[k].push(cur); h.order.push(k); cur = null;
        if (hand === h && run) run.answers[run.idx] = h.ink;
        cv.redraw();
      };
      cv.addEventListener('pointerup', end);
      cv.addEventListener('pointercancel', end);
    }
    $('#btnHandUndo').onclick = () => {
      const h = hand; if (!h) return;
      // 优先撤销这次写的最后一笔；回到前面的词再写时，从最后一个有笔画的格子撤销
      let k = h.order.pop();
      if (k === undefined) for (k = h.ink.length - 1; k >= 0 && !h.ink[k].length; k--);
      if (k < 0 || !h.ink[k].length) return;
      h.ink[k].pop();
      $('#handBoxes').children[k].redraw();
    };
    $('#btnHandClear').onclick = () => {
      const h = hand; if (!h) return;
      h.ink.forEach(c => { c.length = 0; }); h.order = [];
      [...$('#handBoxes').children].forEach(cv => cv.redraw());
    };
    // 给一个词判分：{ ok, bad: [写错的字的序号], none: 一笔没写 }；没有笔画数据的字没法判，不算错
    function judgeWord(w, ink, strict) {
      if (!hasInk(ink)) return { ok: false, bad: [], none: true };
      const bad = [];
      [...bare(w.w)].forEach((c, k) => {
        if (KT.strokes[c] && !HandJudge.judge(ink[k] || [], KT.strokes[c].medians, strict)) bad.push(k);
      });
      return { ok: !bad.length, bad };
    }
    function judgeCurrent() { if (run && run.mode === 'hand') run.res[run.idx] = judgeWord(run.words[run.idx], run.answers[run.idx], run.strict); }

    // 中文输入法选字时按回车不算（isComposing / keyCode 229）
    $('#runInput').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); stopSay(); next(); }
    });

    /* 批改 */
    let checking = null;
    function finishRun() {
      clearTimer(); stopSay(); clearHand(); keepAwake(false);
      const r = run; run = null;
      checking = {
        list: r.list, scope: r.scope, mode: r.mode, words: r.words, answers: r.answers,
        hand: r.mode === 'hand' ? r.words.map((w, i) => r.res[i] || judgeWord(w, r.answers[i], r.strict)) : null
      };
      checking.wrong = r.words.map((w, i) => r.mode === 'type' ? !sameAnswer(r.answers[i] || '', w.w)
        : r.mode === 'hand' ? !checking.hand[i].ok : false);
      $('#checkHint').textContent = r.mode === 'paper'
        ? '对照纸上写的，点一下写错的词标成 ✗（再点一下取消）。错一个字也算错。'
        : r.mode === 'hand'
          ? '已经按手写自动判分，红框是判错的字，点一下红框看正确笔顺。判得不对的话，点这一行改判。'
          : '已经自动判分（去掉空格、标点后完全一致才算对）。判得不对的话，点一下改判。';
      renderCheck();
      history.replaceState({ v: 'vCheck' }, '', '#check');
      o.show('vCheck', false);
    }
    function renderCheck() {
      const c = checking;
      $('#checkRows').innerHTML = c.words.map((w, i) => `<div class="crow${c.wrong[i] ? ' wrong' : ''}" data-i="${i}">
        <div class="no">${i + 1}.</div>
        <div><div class="cw">${esc(w.w)}</div>
          ${c.mode === 'type' ? `<div class="ans">你写的：${esc(c.answers[i] || '（没写）')}</div>` : ''}
          ${c.mode === 'hand' ? inkRow(w, c.answers[i], c.hand[i], i) : ''}</div>
        <div class="mark">${c.wrong[i] ? '✗' : '✓'}</div>
      </div>`).join('');
    }
    // 手写的笔迹：每个字一个小格子，判错的字红框
    function inkRow(w, ink, res, i) {
      if (res.none) return '<div class="ans">（没写）</div>';
      return '<div class="ink">' + [...bare(w.w)].map((c, k) => res.bad.includes(k)
        ? `<button class="ink-c bad" data-i="${i}" data-k="${k}" aria-label="看“${esc(c)}”的正确笔顺">${HandJudge.svg(ink[k] || [], 54)}</button>`
        : `<span class="ink-c">${HandJudge.svg(ink[k] || [], 54)}</span>`).join('') + '</div>';
    }
    // 点红框：在格子里用红色演示正确笔顺，再点一下回到自己写的
    function toggleDemo(btn) {
      const i = +btn.dataset.i, k = +btn.dataset.k, c = [...bare(checking.words[i].w)][k];
      if (btn.dataset.demo) { delete btn.dataset.demo; btn.innerHTML = HandJudge.svg((checking.answers[i] || [])[k] || [], 54); return; }
      if (!window.HanziWriter || !KT.strokes[c]) return;
      btn.dataset.demo = 1; btn.innerHTML = '';
      HanziWriter.create(btn, c, { width: 54, height: 54, padding: 4, showOutline: true, strokeColor: '#d33',
        strokeAnimationSpeed: 1.5, delayBetweenStrokes: 150, charDataLoader: (ch, ok) => ok(KT.strokes[ch]) }).animateCharacter();
    }
    $('#checkRows').addEventListener('click', e => {
      const demo = e.target.closest('.ink-c.bad'); if (demo) { toggleDemo(demo); return; }
      const row = e.target.closest('.crow'); if (!row) return;
      const i = +row.dataset.i;
      checking.wrong[i] = !checking.wrong[i];
      row.classList.toggle('wrong', checking.wrong[i]);
      row.querySelector('.mark').textContent = checking.wrong[i] ? '✗' : '✓';
    });
    $('#btnCheckDone').onclick = () => {
      const c = checking; if (!c) return;
      const rows = c.words.map((w, i) => ({ w, wrong: !!c.wrong[i] }));
      const note = o.record(c.list, rows);
      const wrongWords = rows.filter(x => x.wrong).map(x => x.w);
      showResult(c, rows.length - wrongWords.length, wrongWords, typeof note === 'string' ? note : '');
    };

    /* 结果 */
    let lastWrong = [];
    function showResult(c, correct, wrongWords, note) {
      lastWrong = wrongWords;
      const total = c.words.length, pct = Math.round(correct / total * 100);
      $('#resScore').textContent = `${correct} / ${total}`;
      $('#resScore').classList.toggle('low', pct < 80);
      $('#resSub').textContent = (pct === 100 ? '全对，太棒了！' : `正确率 ${pct}%` + (wrongWords.length ? `，错了 ${wrongWords.length} 个，已记进错词本（明天复习）` : '')) + (note ? ' ' + note : '');
      $('#resWrong').innerHTML = wrongWords.length
        ? '<div class="wrong-list">' + wrongWords.map(w => `<div><b>${esc(w.w)}</b></div>`).join('') + '</div>' : '';
      $('#btnResWrong').hidden = !wrongWords.length;
      history.replaceState({ v: 'vResult' }, '', '#result');
      o.show('vResult', false);
    }
    $('#btnResList').onclick = () => o.onBack();
    $('#btnResAgain').onclick = () => { if (checking) startRun(checking.list, 'all'); };
    $('#btnResWrong').onclick = () => {
      if (checking && lastWrong.length) startRun(checking.list, 'wrong', new Set(lastWrong.map(w => w.key)));
    };

    return { openSetup, startRun, stopRun, isRunning: () => !!run };
  }

  window.TingxieRun = { mount, create, say, stopSay, keepAwake, keyOf, esc, sameAnswer };
})();
