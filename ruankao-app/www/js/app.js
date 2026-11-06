// 软考·系统架构设计师：手机竖屏单页应用。六个标签：首页 / 知识 / 刷题 / 案例 / 论文 / AI 路线。
// 数据都在 D 里（一个 JSON），App 里存 files/store/rk-data-v1.json（RKNative），浏览器里存 localStorage。
(function () {
  'use strict';
  const RK = window.RK, CFG = RK.config;
  const NATIVE = window.RKNative || null;
  const KEY = 'rk-data-v1';
  const PASS = 80;                                 // 知识点测试正确率 ≥ 80% 记为掌握
  const DAY = 864e5;
  const REVIEW = [1, 3, 7, 15, 30, 60];            // 掌握后第几天复习（间隔重复）
  const STATUS_NAME = { new: '未学', learning: '学习中', weak: '需加强', mastered: '已掌握' };

  const $ = s => document.querySelector(s);
  const main = $('#main');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- 内容索引 ---------------- */
  const modById = {};
  RK.modules.forEach((m, i) => { m.order = i; modById[m.id] = m; });
  const nodes = RK.nodes, byId = {};
  nodes.forEach((n, i) => {
    n._i = i;
    if (byId[n.id]) console.warn('知识点 id 重复：', n.id);
    if (!modById[n.module]) console.warn('模块不存在：', n.module, '←', n.id);
    byId[n.id] = n;
  });
  // AI 学习路线：独立的阶段和节点，不计入备考统计、刷题、模拟卷和错题本
  const AI = RK.ai || { stages: [], nodes: [], projects: [] };
  const stageById = {}, projById = {};
  AI.stages.forEach((s, i) => { s.order = i; stageById[s.id] = s; });
  AI.projects.forEach(p => { projById[p.id] = p; });
  const stageOrder = n => (stageById[n.stage] ? stageById[n.stage].order : 99);
  const aiNodes = AI.nodes.slice().sort((a, b) => stageOrder(a) - stageOrder(b));
  aiNodes.forEach(n => {
    n.track = 'ai';
    if (byId[n.id]) console.warn('节点 id 重复：', n.id);
    if (!stageById[n.stage]) console.warn('阶段不存在：', n.stage, '←', n.id);
    byId[n.id] = n;
    (n.tests || []).forEach((q, i) => { q.qid = n.id + ':t' + i; q.node = n.id; q.ai = true; });
  });
  nodes.concat(aiNodes).forEach(n => { n.prereqs = (n.prereqs || []).filter(p => byId[p] || console.warn('前置知识点不存在：', p, '←', n.id)); });
  // 每道测试题一个固定 id：知识点id:t序号
  const QS = {};
  nodes.forEach(n => (n.tests || []).forEach((q, i) => { q.qid = n.id + ':t' + i; q.node = n.id; QS[q.qid] = q; }));
  const caseById = {}, essayById = {};
  RK.cases.forEach(c => { caseById[c.id] = c; });
  RK.essays.forEach(e => { essayById[e.id] = e; });

  /* ---------------- 数据 ---------------- */
  let D = {};
  try {
    const raw = NATIVE ? NATIVE.load(KEY) : localStorage.getItem(KEY);
    D = JSON.parse(raw || '{}') || {};
  } catch (e) { D = {}; }
  function fix() {
    for (const k of ['nodes', 'wrong', 'cases', 'essays', 'settings']) if (!D[k] || typeof D[k] !== 'object' || Array.isArray(D[k])) D[k] = {};
    for (const k of ['projects', 'mocks']) if (!Array.isArray(D[k])) D[k] = [];
    if (!D.stats) D.stats = { ans: 0, ok: 0 };
    if (!D.ai || typeof D.ai !== 'object') D.ai = {};
    for (const k of ['proj', 'hands', 'code']) if (!D.ai[k] || typeof D.ai[k] !== 'object') D.ai[k] = {};
  }
  fix();
  function save() {
    const t = JSON.stringify(D);
    try { if (NATIVE) NATIVE.save(KEY, t); else localStorage.setItem(KEY, t); } catch (e) { /* 存不了就只在本次有效 */ }
  }
  let saveTimer = 0;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 600); }
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  function status(id) {
    const p = D.nodes[id];
    if (!p) return 'new';
    if (p.last == null) return 'learning';
    return p.last >= PASS ? 'mastered' : 'weak';
  }
  function isDue(id) {
    const p = D.nodes[id];
    return status(id) === 'mastered' && Date.now() >= p.t + REVIEW[Math.min(p.streak || 0, REVIEW.length - 1)] * DAY;
  }
  function recordNode(id, pct) {
    const p = D.nodes[id] || (D.nodes[id] = {});
    const wasMastered = p.last != null && p.last >= PASS;
    p.last = pct;
    p.best = Math.max(p.best || 0, pct);
    p.t = Date.now();
    p.streak = pct >= PASS ? (wasMastered ? (p.streak || 0) + 1 : 0) : 0;
    p.n = (p.n || 0) + 1;
  }
  function nextNode() {
    for (const st of ['weak', 'learning', 'new']) {
      const n = nodes.find(x => status(x.id) === st && x.prereqs.every(p => status(p) === 'mastered'));
      if (n) return n;
    }
    return null;
  }
  const dueNodes = () => nodes.filter(n => isDue(n.id));
  const wrongIds = () => Object.keys(D.wrong).filter(id => QS[id]);
  const daysLeft = () => Math.ceil((new Date((D.settings.examDate || CFG.examDate) + 'T09:00:00') - Date.now()) / DAY);

  /* ---------------- 导航 ---------------- */
  // 每个标签一个视图栈；视图 = {v: 名字, ...参数}
  let tab = 'home';
  const stacks = { home: [{ v: 'home' }], know: [{ v: 'mods' }], drill: [{ v: 'drill' }], case: [{ v: 'cases' }], essay: [{ v: 'essays' }], ai: [{ v: 'ai' }] };
  const cur = () => stacks[tab][stacks[tab].length - 1];
  function go(view) { stacks[tab].push(view); render(true); }
  function replace(view) { stacks[tab][stacks[tab].length - 1] = view; render(true); }
  function switchTab(t) {
    if (quiz && !quiz.done) { askLeaveQuiz(() => { quiz = null; switchTab(t); }); return; }
    if (t === tab) stacks[t].length = 1;
    tab = t;
    render(true);
  }
  function back() {
    if (!$('#modal').hidden) { closeModal(); return true; }
    if (quiz && !quiz.done && cur().v === 'quiz') { askLeaveQuiz(() => { quiz = null; stacks[tab].pop(); render(true); }); return true; }
    if (stacks[tab].length > 1) { stacks[tab].pop(); render(true); return true; }
    if (tab !== 'home') { tab = 'home'; render(true); return true; }
    return false;
  }
  window.goBack = back;   // 安卓返回键
  function askLeaveQuiz(ok) {
    modal(`<p>${quiz.mode === 'mock' ? '模拟考试还没交卷，退出后这次作答不保存。' : '还没交卷，退出后这次作答不保存。'}</p>`,
      [{ label: '继续答题' }, { label: '退出', cls: 'danger', fn: ok }]);
  }

  /* ---------------- 弹窗、提示 ---------------- */
  function modal(html, buttons) {
    const m = $('#modal');
    m.innerHTML = `<div class="sheet">${html}<div class="row end">${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-mb="${i}">${esc(b.label)}</button>`).join('')}</div></div>`;
    m.hidden = false;
    m.onclick = e => {
      const b = e.target.closest('[data-mb]');
      if (b) { closeModal(); const fn = buttons[+b.dataset.mb].fn; if (fn) fn(); }
      else if (e.target === m) closeModal();
    };
  }
  function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }
  window.__fileSaved = (ok, msg) => toast(ok ? '备份已保存' : msg);

  /* ---------------- 渲染 ---------------- */
  const VIEWS = {};
  let tickTimer = 0;
  function render(top) {
    clearInterval(tickTimer);
    const v = cur();
    document.querySelectorAll('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    document.body.classList.toggle('full', v.v === 'quiz');
    main.innerHTML = VIEWS[v.v](v);
    if (VIEWS[v.v].after) VIEWS[v.v].after(v);
    if (top) window.scrollTo(0, 0);
  }
  const header = (title, sub) => `<header class="hd">${stacks[tab].length > 1 ? '<button class="back" data-act="back" aria-label="返回">‹</button>' : ''}<div><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div></header>`;
  const stars = f => !f ? '' : '<span class="stars" title="考频">' + '★'.repeat(f || 1) + '<s>' + '★'.repeat(3 - (f || 1)) + '</s></span>';
  const dot = st => `<i class="dot st-${st}" title="${STATUS_NAME[st]}"></i>`;
  const bar = (a, b) => `<div class="bar"><i style="width:${b ? Math.round(a / b * 100) : 0}%"></i></div>`;

  /* ---------- 首页 ---------- */
  VIEWS.home = () => {
    const total = nodes.length, mastered = nodes.filter(n => status(n.id) === 'mastered').length;
    const due = dueNodes(), wrong = wrongIds(), next = nextNode(), dl = daysLeft();
    const lastMock = D.mocks[D.mocks.length - 1];
    return `<header class="hd"><div><h1>系统架构设计师</h1><p class="sub">软考高级 · 备考</p></div></header>
    <section class="card hero">
      <div class="count"><b>${dl > 0 ? dl : 0}</b><span>天</span></div>
      <div class="grow"><div>距考试（${esc(D.settings.examDate || CFG.examDate)}）</div>
        <div class="muted">知识点 ${mastered} / ${total} 已掌握</div>${bar(mastered, total)}</div>
    </section>
    <h2 class="sec">今天做什么</h2>
    <section class="list">
      ${due.length ? `<button class="item" data-act="review"><span class="ico">↻</span><span class="grow"><b>到期复习</b><small>${due.length} 个已掌握的知识点该复习了</small></span><span class="go">›</span></button>` : ''}
      ${next ? `<button class="item" data-act="openNode" data-arg="${next.id}"><span class="ico">▶</span><span class="grow"><b>${status(next.id) === 'new' ? '学新知识点' : '接着学'}：${esc(next.title)}</b><small>${esc(modById[next.module].name)} · ${STATUS_NAME[status(next.id)]}</small></span><span class="go">›</span></button>` : `<div class="item"><span class="grow">现有知识点都已掌握 👍</span></div>`}
      ${wrong.length ? `<button class="item" data-act="wrongDrill"><span class="ico">✗</span><span class="grow"><b>错题重做</b><small>错题本里有 ${wrong.length} 道题</small></span><span class="go">›</span></button>` : ''}
      ${aiNodes.length ? `<button class="item" data-act="tab" data-arg="ai"><span class="ico">✦</span><span class="grow"><b>AI 学习路线</b><small>${aiNodes.filter(n => status(n.id) === 'mastered').length} / ${aiNodes.length} 节点 · 实战 ${AI.projects.filter(projDone).length} / ${AI.projects.length}</small></span><span class="go">›</span></button>` : ''}
      <button class="item" data-act="tab" data-arg="drill"><span class="ico">⏱</span><span class="grow"><b>综合知识模拟</b><small>${lastMock ? `上次 ${lastMock.score} / ${lastMock.total} 分` : '还没做过'}</small></span><span class="go">›</span></button>
    </section>
    <h2 class="sec">考试形式</h2>
    <section class="card exam">${RK.exam.map(e => `<div><b>${esc(e.name)}</b><span class="muted">${esc(e.time)}</span><p>${esc(e.desc)}</p></div>`).join('')}
      <p class="muted small">三科满分各 75 分，通常都要 ≥ ${CFG.pass} 分才算通过，一次考完不保留成绩。具体以中国计算机技术职业资格网当次公告为准。</p></section>
    <h2 class="sec">设置</h2>
    <section class="list">
      <label class="item"><span class="grow">考试日期</span><input type="date" id="examDate" value="${esc(D.settings.examDate || CFG.examDate)}"></label>
      <button class="item" data-act="exportData"><span class="grow">备份学习记录</span><span class="go">›</span></button>
      <button class="item" data-act="importData"><span class="grow">从备份恢复</span><span class="go">›</span></button>
      ${NATIVE ? `<button class="item" data-act="checkUpdate"><span class="grow">检查更新</span><span class="muted">${esc(NATIVE.version())}</span></button>` : ''}
    </section>`;
  };
  VIEWS.home.after = () => {
    const d = $('#examDate');
    d.onchange = () => { if (d.value) { D.settings.examDate = d.value; save(); render(); } };
  };

  /* ---------- 知识：模块列表 → 知识点列表 → 知识点 ---------- */
  VIEWS.mods = () => {
    const rows = RK.modules.map(m => {
      const ns = nodes.filter(n => n.module === m.id);
      const ok = ns.filter(n => status(n.id) === 'mastered').length;
      return `<button class="item" data-act="openMod" data-arg="${m.id}" ${ns.length ? '' : 'disabled'}>
        <span class="swatch" style="background:${m.color}"></span>
        <span class="grow"><b>${esc(m.name)}</b><small>${ns.length ? `${ok} / ${ns.length} 已掌握` : '待补充'}</small>${ns.length ? bar(ok, ns.length) : ''}</span><span class="go">›</span></button>`;
    }).join('');
    return header('知识', '综合知识按模块学：讲解 → 例题 → 测试（≥ 80% 算掌握）') +
      `<div class="search"><input type="search" id="q" placeholder="搜索知识点…"></div><div id="sr"></div><section class="list" id="modList">${rows}</section>`;
  };
  VIEWS.mods.after = () => {
    const q = $('#q');
    q.oninput = () => {
      const s = q.value.trim().toLowerCase();
      $('#modList').hidden = !!s;
      $('#sr').innerHTML = s ? `<section class="list">${nodes.filter(n => (n.title + ' ' + (n.keywords || '') + ' ' + n.short).toLowerCase().includes(s)).map(nodeRow).join('') || '<div class="item muted">没有找到</div>'}</section>` : '';
    };
  };
  const nodeRow = n => `<button class="item" data-act="openNode" data-arg="${n.id}">${dot(status(n.id))}<span class="grow"><b>${esc(n.title)}</b><small>${STATUS_NAME[status(n.id)]}${D.nodes[n.id] && D.nodes[n.id].last != null ? ` · 上次 ${D.nodes[n.id].last}%` : ''}${isDue(n.id) ? ' · <em>该复习了</em>' : ''}</small></span>${stars(n.freq)}</button>`;
  VIEWS.mod = v => {
    const m = modById[v.id];
    return header(esc(m.name)) + `<section class="list">${nodes.filter(n => n.module === v.id).map(nodeRow).join('')}</section>`;
  };

  VIEWS.node = v => {
    const n = byId[v.id], t = v.t || 'learn';
    if (!D.nodes[n.id]) { D.nodes[n.id] = {}; save(); }
    const tabs = [['learn', '讲解'], ['ex', `例题 ${(n.examples || []).length}`], ['test', `测试 ${(n.tests || []).length}`]];
    if (n.exercises && n.exercises.length) tabs.splice(2, 0, ['code', `练习 ${n.exercises.length}`]);
    let body = '';
    if (t === 'learn') {
      body = (n.tip ? `<p class="tip"><b>${n.track ? '要点' : '考点'}</b>${n.tip}</p>` : '') + n.learn.map(s => `<h3>${s.h}</h3><div class="rich">${s.html}</div>`).join('') +
        (n.handson && n.handson.length ? `<h3>动手练一练</h3><div class="card">${n.handson.map((h, i) => `<label class="pt"><input type="checkbox" data-hand="${i}" ${(D.ai.hands[n.id] || {})[i] ? 'checked' : ''}><span class="rich">${h}</span></label>`).join('')}</div>` : '') +
        (n.links && n.links.length ? `<h3>延伸阅读</h3><ul class="links">${n.links.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.t)}</a></li>`).join('')}</ul>` : '') +
        (n.prereqs.length ? `<p class="muted small">先学：${n.prereqs.map(p => `<a data-act="openNode" data-arg="${p}">${esc(byId[p].title)}</a>`).join('、')}</p>` : '') +
        `<button class="btn primary wide" data-act="nodeTab" data-arg="ex">看例题 ›</button>`;
    } else if (t === 'ex') {
      body = (n.examples || []).map((q, i) => `<div class="card q"><div class="qno">例 ${i + 1}</div>${qStem(q)}
        ${q.type === 'choice' ? `<ol class="opts static">${shuffle(q.options.slice()).map(o => `<li>${o}</li>`).join('')}</ol>` : ''}
        <details><summary>看答案和解析</summary><p class="ans">答案：${answerText(q)}</p><div class="rich">${q.explain || ''}</div></details></div>`).join('') +
        `<button class="btn primary wide" data-act="nodeTab" data-arg="${n.exercises && n.exercises.length ? 'code' : 'test'}">${n.exercises && n.exercises.length ? '去写代码' : '去测试'} ›</button>`;
    } else if (t === 'code') {
      const st = D.ai.code[n.id] || {};
      body = `<p class="muted small">改代码 → 运行 → 和期望输出比对。第一次运行要加载 Python（约 2 秒）。手机上跑的是浏览器版 Python（Brython），个别细节和电脑上的 Python 不同，以电脑为准；有死循环会卡住，只能退出 App 重开。</p>` +
        n.exercises.map((x, i) => codeBox('ex' + i, x.q, (st[i] && st[i].src != null) ? st[i].src : x.starter, i, st[i] && st[i].pass)).join('') +
        `<button class="btn primary wide" data-act="nodeTab" data-arg="test">去测试 ›</button>`;
    } else {
      const p = D.nodes[n.id];
      body = `<div class="card"><p>共 ${(n.tests || []).length} 题，答完交卷统一看对错，正确率 ≥ ${PASS}% 算掌握。${n.track ? '' : '做错的题会进错题本。'}</p>
        ${p.last != null ? `<p class="muted">上次 ${p.last}%，最好 ${p.best}%，共测过 ${p.n} 次</p>` : ''}
        <button class="btn primary wide" data-act="nodeTest" data-arg="${n.id}">开始测试</button></div>`;
    }
    return header(esc(n.title), `${esc(n.track ? (stageById[n.stage] || {}).name || '' : modById[n.module].name)} · ${STATUS_NAME[status(n.id)]} ${stars(n.freq)}`) +
      `<div class="seg">${tabs.map(([k, l]) => `<button data-act="nodeTab" data-arg="${k}" class="${k === t ? 'on' : ''}">${l}</button>`).join('')}</div><article class="body">${body}</article>`;
  };

  VIEWS.node.after = v => {
    const n = byId[v.id];
    bindCodeBoxes((k, val) => {
      const i = +k.slice(2), st = D.ai.code[n.id] || (D.ai.code[n.id] = {});
      (st[i] || (st[i] = {})).src = val; saveSoon();
    });
    main.querySelectorAll('[data-hand]').forEach(cb => {
      cb.onchange = () => { (D.ai.hands[n.id] || (D.ai.hands[n.id] = {}))[cb.dataset.hand] = cb.checked; save(); };
    });
  };

  /* ---------- 写 Python：代码框（练习、草稿本共用） ---------- */
  const KEYS = ['⇥', ':', '(', ')', '[', ']', '{', '}', '"', "'", '=', '_', '#', '.', ','];
  function codeBox(key, q, src, i, pass) {
    const rows = Math.min(18, Math.max(5, String(src || '').split('\n').length + 1));
    return `<div class="card ex" data-box="${key}">
      ${q != null ? `<div class="qno">练习 ${i + 1}${pass ? ' <span class="okmark">✓ 已通过</span>' : ''}</div><div class="rich">${q}</div>` : ''}
      <div class="kbd">${KEYS.map(k => `<button type="button" data-ins="${esc(k)}">${esc(k)}</button>`).join('')}</div>
      <textarea class="code" rows="${rows}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off">${esc(src || '')}</textarea>
      <div class="row"><button class="btn primary small" data-act="pyRun" data-arg="${key}">▶ 运行</button>
        ${q != null ? `<button class="btn small" data-act="pyReset" data-arg="${i}">重置</button><button class="btn small" data-act="pyAnswer" data-arg="${i}">参考答案</button>` : '<button class="btn small" data-act="pyClear">清空</button>'}</div>
      <div class="pyres" hidden></div></div>`;
  }
  // 符号按钮、回车自动缩进；改动随手存
  function bindCodeBoxes(onInput) {
    main.querySelectorAll('[data-box]').forEach(box => {
      const ta = box.querySelector('textarea');
      const insert = text => {
        const a = ta.selectionStart, b = ta.selectionEnd;
        ta.setRangeText(text, a, b, 'end');
        ta.focus();
        onInput(box.dataset.box, ta.value);
      };
      box.querySelector('.kbd').addEventListener('mousedown', e => e.preventDefault());   // 不让按钮抢走焦点
      box.querySelector('.kbd').onclick = e => {
        const b = e.target.closest('[data-ins]');
        if (b) insert(b.dataset.ins === '⇥' ? '    ' : b.dataset.ins);
      };
      ta.addEventListener('keydown', e => {
        if (e.key === 'Tab') { e.preventDefault(); insert('    '); }
        else if (e.key === 'Enter' && !e.isComposing) {
          const line = ta.value.slice(0, ta.selectionStart).split('\n').pop();
          const ind = (line.match(/^ */) || [''])[0] + (/:\s*$/.test(line) ? '    ' : '');
          e.preventDefault(); insert('\n' + ind);
        }
      });
      ta.oninput = () => onInput(box.dataset.box, ta.value);
    });
  }
  function showResult(box, r, x) {
    const el = box.querySelector('.pyres');
    let html = `<pre class="pyout ${r.err ? 'bad' : ''}">${esc(r.out || '（没有输出）')}</pre>`;
    let pass = null;
    if (x && x.expect != null) {
      pass = !r.err && PyRun.same(r.out, x.expect);
      html = (pass ? '<p class="okmark">✓ 输出正确</p>' : `<p class="nomark">✗ 和期望输出不一致</p>`) + html +
        (pass ? '' : `<details><summary>看期望输出</summary><pre class="pyout">${esc(x.expect)}</pre></details>`);
    }
    el.innerHTML = html; el.hidden = false;
    return pass;
  }
  VIEWS.pyplay = () => header('Python 草稿本', '随手写、随手跑；内容只存在本机') +
    `<article class="body">${codeBox('play', null, D.ai.code._play != null ? D.ai.code._play : '# 在这里写 Python，点「运行」\nnames = ["张三", "李四"]\nfor i, n in enumerate(names, 1):\n    print(i, n)\n', 0)}</article>`;
  VIEWS.pyplay.after = () => bindCodeBoxes((k, v) => { D.ai.code._play = v; saveSoon(); });

  /* ---------- AI 学习路线 ---------- */
  const stageNodes = id => aiNodes.filter(n => n.stage === id);
  const projDone = p => p.checklist.every((_, i) => ((D.ai.proj[p.id] || {}).done || {})[i]);
  function aiNext() {
    for (const st of ['weak', 'learning', 'new']) {
      const n = aiNodes.find(x => status(x.id) === st);
      if (n) return n;
    }
    return null;
  }
  VIEWS.ai = () => {
    const total = aiNodes.length, ok = aiNodes.filter(n => status(n.id) === 'mastered').length;
    const weeks = AI.stages.reduce((a, s) => a + s.weeks, 0), next = aiNext();
    const pd = AI.projects.filter(projDone).length;
    return header('AI 时代学习路线', `${AI.stages.length} 个阶段 · 约 ${weeks} 周 · 每周约 ${AI.hoursPerWeek} 小时`) +
      `<section class="card hero"><div class="count"><b>${ok}</b><span>/ ${total}</span></div>
        <div class="grow"><div>节点已掌握</div><div class="muted">实战项目完成 ${pd} / ${AI.projects.length}</div>${bar(ok, total)}</div></section>
      ${next ? `<section class="list"><button class="item" data-act="openNode" data-arg="${next.id}"><span class="ico">▶</span><span class="grow"><b>${status(next.id) === 'new' ? '下一步' : '接着学'}：${esc(next.title)}</b><small>${esc(stageById[next.stage].name)}</small></span><span class="go">›</span></button></section>` : ''}
      <details class="card intro"><summary>这条路线怎么走</summary><div class="rich">${AI.intro}</div></details>
      <h2 class="sec">路线图</h2>
      <ol class="road">${AI.stages.map((s, i) => {
        const ns = stageNodes(s.id), m = ns.filter(n => status(n.id) === 'mastered').length;
        const ps = AI.projects.filter(p => p.stage === s.id);
        const done = ns.length && m === ns.length && ps.every(projDone);
        return `<li class="${done ? 'done' : ''}" style="--c:${s.color}"><button class="item" data-act="openStage" data-arg="${s.id}">
          <span class="grow"><b>${i}. ${esc(s.name)}</b><small>${s.weeks} 周 · ${ns.length ? `${m} / ${ns.length} 节点` : '内容准备中'}${ps.length ? ` · 实战 ${ps.filter(projDone).length}/${ps.length}` : ''}</small>${ns.length ? bar(m, ns.length) : ''}</span><span class="go">›</span></button></li>`;
      }).join('')}</ol>`;
  };
  VIEWS.aistage = v => {
    const s = stageById[v.id], ns = stageNodes(s.id), ps = AI.projects.filter(p => p.stage === s.id);
    return header(esc(s.name), `第 ${s.order} 阶段 · 约 ${s.weeks} 周`) +
      `<p class="tip"><b>目标</b>${esc(s.goal)}</p>
      ${s.id === 'py' ? `<section class="list" style="margin-bottom:10px"><button class="item" data-act="pyPlay"><span class="ico">▶</span><span class="grow"><b>Python 草稿本</b><small>手机上随手写、随手运行</small></span><span class="go">›</span></button></section>` : ''}
      <section class="list">${ns.map(nodeRow).join('') || '<div class="item muted">内容准备中</div>'}</section>
      ${ps.length ? `<h2 class="sec">实战项目</h2><section class="list">${ps.map(p => `<button class="item" data-act="openProj" data-arg="${p.id}"><span class="ico">${projDone(p) ? '✓' : '⚒'}</span><span class="grow"><b>${esc(p.title)}</b><small>${esc(p.goal)}</small></span><span class="go">›</span></button>`).join('')}</section>` : ''}`;
  };
  VIEWS.aiproj = v => {
    const p = projById[v.id], st = D.ai.proj[p.id] || {}, done = st.done || {};
    return header(esc(p.title), esc(stageById[p.stage].name)) + `<article class="body">
      <p class="tip"><b>目标</b>${esc(p.goal)}</p>
      <h3>步骤</h3><ol class="rich">${p.steps.map(x => `<li>${x}</li>`).join('')}</ol>
      <h3>交付物</h3><p>${esc(p.deliverable)}</p>
      <h3>完成检查</h3><div class="card">${p.checklist.map((c, i) => `<label class="pt"><input type="checkbox" data-pc="${i}" ${done[i] ? 'checked' : ''}><span>${esc(c)}</span></label>`).join('')}</div>
      <h3>我的记录</h3><textarea id="projNote" rows="8" placeholder="做到哪了、遇到什么问题、AI 哪里帮了忙或出了错……（只存在本机）">${esc(st.note || '')}</textarea>
      </article>`;
  };
  VIEWS.aiproj.after = v => {
    const st = D.ai.proj[v.id] || (D.ai.proj[v.id] = {});
    main.querySelectorAll('[data-pc]').forEach(cb => {
      cb.onchange = () => { (st.done || (st.done = {}))[cb.dataset.pc] = cb.checked; save(); if (projDone(projById[v.id])) toast('这个实战项目完成了 🎉'); };
    });
    const t = $('#projNote');
    t.oninput = () => { st.note = t.value; saveSoon(); };
  };

  /* ---------- 题目工具 ---------- */
  const qStem = q => `<div class="stem rich">${q.q}</div>`;
  function answerText(q) {
    if (q.type === 'choice') return q.options[q.answer];
    if (q.type === 'num') return q.answer + (q.unit || '');
    return esc(q.answer[0]);
  }
  const norm = s => String(s).toLowerCase().replace(/[\s"'“”‘’「」『』《》〈〉。．.，,；;：:！!？?、]/g, '');
  function isRight(q, a) {
    if (a == null || a === '') return false;
    if (q.type === 'choice') return a === q.answer;
    if (q.type === 'num') { const x = parseFloat(String(a).replace(/[−－]/g, '-').replace(/[^\d.eE+\-]/g, '')); return isFinite(x) && Math.abs(x - q.answer) <= (q.tol || 1e-9); }
    return q.answer.some(s => norm(s) === norm(a));
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const fmtTime = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };

  /* ---------- 答题（知识点测试 / 随机练 / 错题 / 模拟卷） ---------- */
  // mode: test（交卷看结果，记知识点掌握）、drill / wrong（每题立即反馈）、mock（限时，交卷看结果）
  let quiz = null;
  function startQuiz(opt, qs) {
    if (!qs.length) { toast('没有可做的题'); return; }
    quiz = Object.assign({ i: 0, done: false, start: Date.now() }, opt, {
      items: qs.map(q => ({ q, order: q.type === 'choice' && !q.fixed ? shuffle(q.options.map((_, k) => k)) : (q.options || []).map((_, k) => k), a: null, locked: false }))
    });
    go({ v: 'quiz' });
  }
  const instant = () => quiz.mode === 'drill' || quiz.mode === 'wrong';
  VIEWS.quiz = () => {
    if (!quiz) return header('答题') + '<p class="muted pad">没有进行中的答题</p>';
    if (quiz.done) return quizResult();
    const it = quiz.items[quiz.i], q = it.q, n = quiz.items.length;
    const answered = quiz.items.filter(x => x.a != null && x.a !== '').length;
    let opts;
    if (q.type === 'choice') {
      opts = `<div class="opts">${it.order.map((k, j) => {
        let cls = it.a === k ? 'sel' : '';
        if (it.locked) cls = k === q.answer ? 'right' : (it.a === k ? 'wrong' : '');
        return `<button class="opt ${cls}" data-act="pick" data-arg="${k}" ${it.locked ? 'disabled' : ''}><b>${'ABCD'[j] || j + 1}</b><span>${q.options[k]}</span></button>`;
      }).join('')}</div>`;
    } else {
      opts = `<div class="fill"><input id="fillIn" ${q.type === 'num' ? 'inputmode="decimal"' : ''} value="${esc(it.a || '')}" ${it.locked ? 'disabled' : ''} placeholder="${q.type === 'num' ? '填数字' : '填答案'}">${q.unit ? `<span>${esc(q.unit)}</span>` : ''}${instant() && !it.locked ? '<button class="btn primary" data-act="fillOk">确定</button>' : ''}</div>`;
    }
    const fb = it.locked ? `<div class="fb ${isRight(q, it.a) ? 'ok' : 'no'}"><b>${isRight(q, it.a) ? '✓ 答对了' : '✗ 答错了'}</b>${isRight(q, it.a) ? '' : `<p>正确答案：${answerText(q)}</p>`}<div class="rich">${q.explain || ''}</div>${q.node ? `<p class="small"><a data-act="openNodeFromQuiz" data-arg="${q.node}">相关知识点：${esc(byId[q.node].title)}</a></p>` : ''}</div>` : '';
    const last = quiz.i === n - 1;
    return `<header class="qhd"><button class="back" data-act="back" aria-label="退出">✕</button><span class="grow">${esc(quiz.title)}</span>
      ${quiz.limit ? `<span class="timer" id="timer"></span>` : ''}<button class="btn small" data-act="sheet">${quiz.i + 1} / ${n}</button></header>
      <article class="body"><div class="card q">${qStem(q)}${opts}${fb}</div></article>
      <footer class="qft"><button class="btn" data-act="qPrev" ${quiz.i ? '' : 'disabled'}>上一题</button>
        ${instant() ? (it.locked ? (last ? '<button class="btn primary" data-act="submit">完成</button>' : '<button class="btn primary" data-act="qNext">下一题</button>') : `<span class="muted">${answered} / ${n}</span>`)
          : (last ? `<button class="btn primary" data-act="submit">交卷（${answered}/${n}）</button>` : '<button class="btn primary" data-act="qNext">下一题</button>')}
      </footer>`;
  };
  VIEWS.quiz.after = () => {
    const f = $('#fillIn');
    if (f) f.oninput = () => { quiz.items[quiz.i].a = f.value; };
    if (quiz && !quiz.done && quiz.limit) {
      const tick = () => {
        const left = quiz.limit - (Date.now() - quiz.start) / 1000;
        const t = $('#timer');
        if (t) { t.textContent = fmtTime(left); t.classList.toggle('late', left < 600); }
        if (left <= 0) { clearInterval(tickTimer); toast('时间到，自动交卷'); finishQuiz(); }
      };
      tick(); tickTimer = setInterval(tick, 1000);
    }
  };
  function lockCurrent() {
    const it = quiz.items[quiz.i];
    if (it.a == null || it.a === '') return;
    it.locked = true;
    const ok = isRight(it.q, it.a);
    D.stats.ans++; if (ok) D.stats.ok++;
    if (ok) { if (quiz.mode === 'wrong') delete D.wrong[it.q.qid]; }
    else if (it.q.qid && !it.q.ai) D.wrong[it.q.qid] = { n: ((D.wrong[it.q.qid] || {}).n || 0) + 1, t: Date.now() };
    save();
  }
  function finishQuiz() {
    const items = quiz.items;
    if (!instant()) {
      items.forEach(it => {
        it.locked = true;
        const ok = isRight(it.q, it.a);
        D.stats.ans++; if (ok) D.stats.ok++;
        if (!ok && it.q.qid && !it.q.ai) D.wrong[it.q.qid] = { n: ((D.wrong[it.q.qid] || {}).n || 0) + 1, t: Date.now() };
      });
    }
    const right = items.filter(it => isRight(it.q, it.a)).length;
    quiz.right = right;
    quiz.used = Math.round((Date.now() - quiz.start) / 1000);
    if (quiz.mode === 'test') recordNode(quiz.node, Math.round(right / items.length * 100));
    if (quiz.mode === 'review') quiz.nodes.forEach(id => {
      const its = items.filter(it => it.q.node === id);
      recordNode(id, Math.round(its.filter(it => isRight(it.q, it.a)).length / its.length * 100));
    });
    if (quiz.mode === 'mock') D.mocks.push({ t: Date.now(), score: right, total: items.length, used: quiz.used });
    quiz.done = true;
    save();
    render(true);
  }
  function quizResult() {
    const items = quiz.items, n = items.length, pct = Math.round(quiz.right / n * 100);
    let verdict = '';
    if (quiz.mode === 'test') verdict = pct >= PASS ? '已掌握这个知识点 🎉' : `没到 ${PASS}%，回去再看看讲解和例题`;
    if (quiz.mode === 'mock') verdict = `折合 ${Math.round(quiz.right / n * 75)} / 75 分，${Math.round(quiz.right / n * 75) >= CFG.pass ? '过了合格线' : `离合格线 ${CFG.pass} 分还差一些`}`;
    if (quiz.mode === 'review') verdict = '复习结果已记下：没到 80% 的知识点会标成「需加强」';
    const wrongs = items.filter(it => !isRight(it.q, it.a));
    return `<header class="qhd"><button class="back" data-act="back" aria-label="关闭">✕</button><span class="grow">${esc(quiz.title)} · 结果</span></header>
      <article class="body"><section class="card hero"><div class="count"><b>${pct}</b><span>%</span></div>
      <div class="grow"><div>答对 ${quiz.right} / ${n}</div><div class="muted">用时 ${fmtTime(quiz.used)}</div>${verdict ? `<div>${verdict}</div>` : ''}</div></section>
      ${wrongs.length ? `<h2 class="sec">做错的 ${wrongs.length} 题${wrongs[0].q.ai ? '' : '（已进错题本）'}</h2>` : '<p class="pad">全对！</p>'}
      ${wrongs.map(it => `<div class="card q">${qStem(it.q)}<p class="ans no">你的答案：${it.a == null || it.a === '' ? '（没答）' : esc(it.q.type === 'choice' ? stripTags(it.q.options[it.a]) : it.a)}</p>
        <p class="ans">正确答案：${answerText(it.q)}</p><div class="rich">${it.q.explain || ''}</div></div>`).join('')}
      <button class="btn primary wide" data-act="back">完成</button></article>`;
  }
  const stripTags = s => String(s).replace(/<[^>]+>/g, '');
  function showSheet() {
    const html = `<h3>答题卡</h3><div class="grid">${quiz.items.map((it, i) => {
      let c = it.a != null && it.a !== '' ? 'done' : '';
      if (it.locked) c = isRight(it.q, it.a) ? 'right' : 'wrong';
      return `<button class="${c} ${i === quiz.i ? 'cur' : ''}" data-jump="${i}">${i + 1}</button>`;
    }).join('')}</div>`;
    modal(html, quiz.mode !== 'drill' && quiz.mode !== 'wrong' ? [{ label: '关闭' }, { label: '交卷', cls: 'primary', fn: confirmSubmit }] : [{ label: '关闭' }]);
    $('#modal .grid').onclick = e => { const b = e.target.closest('[data-jump]'); if (b) { e.stopPropagation(); quiz.i = +b.dataset.jump; closeModal(); render(true); } };
  }
  function confirmSubmit() {
    const left = quiz.items.filter(it => it.a == null || it.a === '').length;
    if (left && !instant()) modal(`<p>还有 ${left} 题没答，确定交卷吗？</p>`, [{ label: '再看看' }, { label: '交卷', cls: 'primary', fn: finishQuiz }]);
    else finishQuiz();
  }

  /* ---------- 刷题页 ---------- */
  VIEWS.drill = () => {
    const learned = nodes.filter(n => status(n.id) !== 'new');
    const all = Object.keys(QS).length, acc = D.stats.ans ? Math.round(D.stats.ok / D.stats.ans * 100) : 0;
    return header('刷题', `题库 ${all} 题 · 累计答 ${D.stats.ans} 题，正确率 ${acc}%`) +
      `<section class="list">
        <button class="item" data-act="drillLearned"><span class="ico">✎</span><span class="grow"><b>随机练 10 题</b><small>从学过的 ${learned.length} 个知识点里出，答一题看一题解析</small></span><span class="go">›</span></button>
        <button class="item" data-act="drillAll"><span class="ico">⚄</span><span class="grow"><b>全题库随机 10 题</b><small>包括还没学的，摸底用</small></span><span class="go">›</span></button>
        <button class="item" data-act="wrongDrill" ${wrongIds().length ? '' : 'disabled'}><span class="ico">✗</span><span class="grow"><b>错题本</b><small>${wrongIds().length} 道 · 重做答对就移出</small></span><span class="go">›</span></button>
        <button class="item" data-act="review" ${dueNodes().length ? '' : 'disabled'}><span class="ico">↻</span><span class="grow"><b>到期复习</b><small>${dueNodes().length} 个知识点到了复习时间（第 1、3、7、15、30 天…）</small></span><span class="go">›</span></button>
      </section>
      <h2 class="sec">综合知识模拟考试</h2>
      <section class="card"><p>${CFG.mock.count} 道单选、${CFG.mock.minutes} 分钟，和机考一样限时，交卷后折算成 75 分制。</p>
        ${all < CFG.mock.count ? `<p class="muted small">题库现在只有 ${all} 题，先用全部题目组卷；题库补齐后自动按 ${CFG.mock.count} 题出。</p>` : ''}
        <button class="btn primary wide" data-act="mock">开始模拟</button>
        ${D.mocks.length ? `<h3>历次成绩</h3><table class="tbl"><tr><th>日期</th><th>得分</th><th>用时</th></tr>${D.mocks.slice(-8).reverse().map(m => `<tr><td>${new Date(m.t).toLocaleDateString()}</td><td>${m.score} / ${m.total}</td><td>${fmtTime(m.used)}</td></tr>`).join('')}</table>` : ''}
      </section>`;
  };

  /* ---------- 案例分析 ---------- */
  function caseScore(c) {
    const s = D.cases[c.id];
    let got = 0, total = 0;
    c.questions.forEach((q, i) => q.points.forEach((p, j) => { total += p.s; if (s && s.pts && s.pts[i] && s.pts[i][j]) got += p.s; }));
    return { got, total, graded: !!(s && s.graded) };
  }
  VIEWS.cases = () => header('案例分析', '每题 25 分：先自己写，再对照参考答案按要点给自己打分') +
    `<section class="list">${RK.cases.map(c => {
      const sc = caseScore(c);
      return `<button class="item" data-act="openCase" data-arg="${c.id}"><span class="grow"><b>${esc(c.title)}</b><small>${esc(c.topic || '')}${sc.graded ? ` · 自评 ${sc.got} / ${sc.total}` : (D.cases[c.id] ? ' · 写了一部分' : '')}</small></span>${c.required ? '<span class="tag">必答题型</span>' : ''}<span class="go">›</span></button>`;
    }).join('')}</section><p class="muted small pad">更多案例题在后续批次补充。</p>`;
  VIEWS.case = v => {
    const c = caseById[v.id], s = D.cases[c.id] || (D.cases[c.id] = { a: {}, pts: {}, shown: {} }), sc = caseScore(c);
    return header(esc(c.title), esc(c.topic || '')) + `<article class="body">
      <div class="card rich scen">${c.scenario}</div>
      ${c.questions.map((q, i) => `<div class="card q"><div class="qno">问题 ${i + 1}（${q.points.reduce((a, p) => a + p.s, 0)} 分）</div><div class="stem rich">${q.q}</div>
        <textarea data-case="${i}" rows="${q.rows || 6}" placeholder="先自己写答案，再看参考答案">${esc(s.a[i] || '')}</textarea>
        ${s.shown[i] ? `<div class="ref"><b>参考答案</b><div class="rich">${q.ref}</div><b>评分要点（答到的勾上）</b>
          ${q.points.map((p, j) => `<label class="pt"><input type="checkbox" data-pt="${i}:${j}" ${s.pts[i] && s.pts[i][j] ? 'checked' : ''}><span>${p.p}</span><em>${p.s} 分</em></label>`).join('')}
          ${q.explain ? `<div class="rich muted">${q.explain}</div>` : ''}</div>`
          : `<button class="btn wide" data-act="showRef" data-arg="${i}">看参考答案并自评</button>`}</div>`).join('')}
      <div class="card total" id="caseTotal">自评得分：<b>${sc.got}</b> / ${sc.total}</div></article>`;
  };
  VIEWS.case.after = v => {
    const c = caseById[v.id], s = D.cases[c.id];
    main.querySelectorAll('textarea[data-case]').forEach(t => { t.oninput = () => { s.a[t.dataset.case] = t.value; s.t = Date.now(); saveSoon(); }; });
    main.querySelectorAll('[data-pt]').forEach(cb => {
      cb.onchange = () => {
        const [i, j] = cb.dataset.pt.split(':');
        (s.pts[i] || (s.pts[i] = {}))[j] = cb.checked;
        s.graded = true; save();
        const sc = caseScore(c);
        $('#caseTotal').innerHTML = `自评得分：<b>${sc.got}</b> / ${sc.total}`;
      };
    });
  };

  /* ---------- 论文 ---------- */
  const wordCount = s => (String(s || '').match(/[㐀-鿿]/g) || []).length + (String(s || '').match(/[A-Za-z0-9]+/g) || []).length;
  const LEVELS = [['充分', 1], ['一般', 0.6], ['不足', 0.3]];
  function essayScore(e) {
    const s = D.essays[e.id];
    if (!s || !s.rate) return null;
    let got = 0;
    e.rubric.forEach((r, i) => { const l = s.rate[i]; if (l != null) got += r.score * LEVELS[l][1]; });
    return Math.round(got);
  }
  VIEWS.essays = () => header('论文', '选题 → 选项目素材 → 限时写作 → 按评分标准自评') +
    `<section class="list"><button class="item" data-act="projects"><span class="ico">◧</span><span class="grow"><b>我的项目素材</b><small>${D.projects.length ? `${D.projects.length} 个项目` : '先把自己做过的项目整理好，所有论文都要用'}</small></span><span class="go">›</span></button></section>
    <h2 class="sec">论文题目</h2>
    <section class="list">${RK.essays.map(e => {
      const s = D.essays[e.id], sc = essayScore(e);
      return `<button class="item" data-act="openEssay" data-arg="${e.id}"><span class="grow"><b>${esc(e.title)}</b><small>${esc(e.topic || '')}${s && (s.abs || s.body) ? ` · 已写 ${wordCount(s.abs) + wordCount(s.body)} 字` : ''}${sc != null ? ` · 自评 ${sc} 分` : ''}</small></span><span class="go">›</span></button>`;
    }).join('')}</section><p class="muted small pad">更多论文题在后续批次补充。</p>`;
  VIEWS.essay = v => {
    const e = essayById[v.id], s = D.essays[e.id] || (D.essays[e.id] = {}), t = v.t || 'prompt';
    const tabs = [['prompt', '题目'], ['guide', '写法'], ['write', '写作'], ['rate', '自评']];
    let body = '';
    if (t === 'prompt') body = `<div class="card rich">${e.prompt}</div>`;
    else if (t === 'guide') body = `<div class="rich">${e.guide}</div>`;
    else if (t === 'write') {
      const p = D.projects.find(x => x.id === s.proj);
      body = `<div class="card"><label class="row">用哪个项目：<select id="proj"><option value="">（选择）</option>${D.projects.map(x => `<option value="${x.id}" ${x.id === s.proj ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
        ${p ? `<details><summary>项目要点</summary><div class="small">${projSummary(p)}</div></details>` : (D.projects.length ? '' : '<p class="muted small">还没有项目素材，可以先到「论文 → 我的项目素材」里整理。</p>')}
        <div class="row"><span class="timer" id="etimer">${s.start ? '' : '限时 120 分钟'}</span>
          ${s.start ? '<button class="btn small" data-act="essayStop">停止计时</button>' : '<button class="btn small primary" data-act="essayStart">开始计时</button>'}</div></div>
        <h3>摘要 <small class="muted" id="wcA"></small></h3><textarea id="abs" rows="7" placeholder="300 字左右：项目概况、你的角色、论题怎么做的、效果">${esc(s.abs || '')}</textarea>
        <h3>正文 <small class="muted" id="wcB"></small></h3><textarea id="bodyT" rows="22" placeholder="2000～2500 字：项目背景 → 理论 / 方法 → 结合项目逐条论述 → 效果与不足">${esc(s.body || '')}</textarea>`;
    } else {
      const sc = essayScore(e);
      body = `<p class="muted small">按考试大纲的论文评分维度，对照自己的文章挑一档。合格线 ${CFG.pass} 分。</p>
        ${e.rubric.map((r, i) => `<div class="card"><b>${esc(r.name)}</b>（${r.score} 分）<p class="small">${r.desc}</p>
          <div class="seg small">${LEVELS.map((l, k) => `<button data-act="rate" data-arg="${i}:${k}" class="${s.rate && s.rate[i] === k ? 'on' : ''}">${l[0]}</button>`).join('')}</div></div>`).join('')}
        <div class="card"><b>写完对照检查</b>${e.checklist.map(c => `<p class="small">☐ ${c}</p>`).join('')}</div>
        <div class="card total">自评：<b>${sc == null ? '—' : sc}</b> / 75 · 字数 ${wordCount(s.abs)} + ${wordCount(s.body)}</div>`;
    }
    return header(esc(e.title), esc(e.topic || '')) +
      `<div class="seg">${tabs.map(([k, l]) => `<button data-act="essayTab" data-arg="${k}" class="${k === t ? 'on' : ''}">${l}</button>`).join('')}</div><article class="body">${body}</article>`;
  };
  VIEWS.essay.after = v => {
    const e = essayById[v.id], s = D.essays[e.id];
    const a = $('#abs'), b = $('#bodyT'), pj = $('#proj');
    const wc = () => { $('#wcA').textContent = wordCount(a.value) + ' 字'; $('#wcB').textContent = wordCount(b.value) + ' 字'; };
    if (a) {
      wc();
      a.oninput = () => { s.abs = a.value; s.t = Date.now(); wc(); saveSoon(); };
      b.oninput = () => { s.body = b.value; s.t = Date.now(); wc(); saveSoon(); };
    }
    if (pj) pj.onchange = () => { s.proj = pj.value; save(); render(); };
    if (s.start && $('#etimer')) {
      const tick = () => {
        const left = 120 * 60 - (Date.now() - s.start) / 1000, el = $('#etimer');
        if (el) { el.textContent = left > 0 ? '剩 ' + fmtTime(left) : '已超时 ' + fmtTime(-left); el.classList.toggle('late', left < 900); }
      };
      tick(); tickTimer = setInterval(tick, 1000);
    }
  };

  /* ---------- 项目素材 ---------- */
  const PFIELDS = [
    ['name', '项目名称', 1, '如：某市医保结算平台'],
    ['period', '时间与规模', 2, '起止时间、投资 / 人数、用户量、并发量等关键数字'],
    ['role', '我的角色和工作', 2, '如：系统架构设计师，负责总体架构设计、技术选型和架构评审'],
    ['arch', '架构概况', 4, '分层 / 微服务 / 主要技术栈 / 部署方式'],
    ['problems', '遇到的问题和怎么解决', 6, '性能、可用性、安全、数据一致性……每条写清问题、方案、效果（论文正文的主要素材）'],
    ['results', '效果和不足', 3, '上线后的指标；还有什么没做好、以后怎么改']
  ];
  const projSummary = p => PFIELDS.slice(1).map(([k, l]) => p[k] ? `<p><b>${l}</b>：${esc(p[k]).replace(/\n/g, '<br>')}</p>` : '').join('');
  VIEWS.projects = () => header('我的项目素材', '论文都要结合自己做过的真实项目，这里只存在本机') +
    `<section class="list">${D.projects.map(p => `<button class="item" data-act="editProj" data-arg="${p.id}"><span class="grow"><b>${esc(p.name || '（未命名）')}</b><small>${esc((p.role || '').slice(0, 40))}</small></span><span class="go">›</span></button>`).join('') || '<div class="item muted">还没有项目</div>'}</section>
    <button class="btn primary wide" data-act="newProj">新建项目</button>`;
  VIEWS.proj = v => {
    const p = D.projects.find(x => x.id === v.id);
    if (!p) return header('项目') + '<p class="pad muted">已删除</p>';
    return header('编辑项目') + `<article class="body">${PFIELDS.map(([k, l, r, ph]) => `<h3>${l}</h3>${r === 1 ? `<input data-pf="${k}" value="${esc(p[k] || '')}" placeholder="${esc(ph)}">` : `<textarea data-pf="${k}" rows="${r + 1}" placeholder="${esc(ph)}">${esc(p[k] || '')}</textarea>`}`).join('')}
      <button class="btn danger wide" data-act="delProj" data-arg="${p.id}">删除这个项目</button></article>`;
  };
  VIEWS.proj.after = v => {
    const p = D.projects.find(x => x.id === v.id);
    if (p) main.querySelectorAll('[data-pf]').forEach(el => { el.oninput = () => { p[el.dataset.pf] = el.value; saveSoon(); }; });
  };

  /* ---------------- 操作 ---------------- */
  const A = {
    back,
    tab: t => switchTab(t),
    openMod: id => go({ v: 'mod', id }),
    openStage: id => go({ v: 'aistage', id }),
    pyPlay: () => go({ v: 'pyplay' }),
    pyRun: (key, btn) => {
      const box = btn.closest('[data-box]'), code = box.querySelector('textarea').value;
      const v = cur(), n = v.v === 'node' ? byId[v.id] : null;
      const i = key.startsWith('ex') ? +key.slice(2) : -1, x = n && i >= 0 ? n.exercises[i] : null;
      btn.disabled = true; btn.textContent = PyRun.loaded() ? '运行中…' : '加载 Python…';
      setTimeout(() => PyRun.run(code).then(r => {
        const pass = showResult(box, r, x);
        if (x) {
          const st = D.ai.code[n.id] || (D.ai.code[n.id] = {}), it = st[i] || (st[i] = {});
          it.src = code;
          if (pass) { it.pass = true; const q = box.querySelector('.qno'); if (q && !q.querySelector('.okmark')) q.insertAdjacentHTML('beforeend', ' <span class="okmark">✓ 已通过</span>'); }
          save();
        } else { D.ai.code._play = code; save(); }
      }, e => { box.querySelector('.pyres').hidden = false; box.querySelector('.pyres').innerHTML = `<p class="nomark">Python 加载失败：${esc(e.message)}</p>`; })
        .then(() => { btn.disabled = false; btn.textContent = '▶ 运行'; }), 30);
    },
    pyReset: i => {
      const n = byId[cur().id];
      modal('<p>恢复成起始代码？你改的内容会丢掉。</p>', [{ label: '取消' }, { label: '恢复', cls: 'danger', fn: () => {
        const st = D.ai.code[n.id] || {};
        if (st[i]) delete st[i].src;
        save(); render();
      } }]);
    },
    pyAnswer: i => {
      const x = byId[cur().id].exercises[+i];
      modal(`<h3>参考答案</h3><pre class="pyout">${esc(x.answer)}</pre>${x.expect != null ? `<h4>输出</h4><pre class="pyout">${esc(x.expect)}</pre>` : ''}<p class="muted small">写法不止一种，输出对就算通过。</p>`, [{ label: '关闭' }]);
    },
    pyClear: () => { D.ai.code._play = ''; save(); render(); },
    openProj: id => go({ v: 'aiproj', id }),
    openNode: id => {
      const want = byId[id].track ? 'ai' : 'know';
      if (tab !== want) { tab = want; stacks[want].length = 1; }
      go({ v: 'node', id });
    },
    openNodeFromQuiz: id => modal(`<h3>${esc(byId[id].title)}</h3>${byId[id].learn.map(s => `<h4>${s.h}</h4><div class="rich">${s.html}</div>`).join('')}`, [{ label: '关闭' }]),
    nodeTab: t => replace(Object.assign({}, cur(), { t })),
    nodeTest: id => startQuiz({ mode: 'test', node: id, title: byId[id].short || byId[id].title }, shuffle(byId[id].tests.slice())),
    drillLearned: () => {
      const pool = Object.values(QS).filter(q => status(q.node) !== 'new');
      if (!pool.length) { toast('先去「知识」里学几个知识点'); return; }
      startQuiz({ mode: 'drill', title: '随机练习' }, shuffle(pool).slice(0, 10));
    },
    drillAll: () => startQuiz({ mode: 'drill', title: '全题库随机' }, shuffle(Object.values(QS)).slice(0, 10)),
    wrongDrill: () => startQuiz({ mode: 'wrong', title: '错题本' }, shuffle(wrongIds().map(id => QS[id]))),
    review: () => {
      const due = dueNodes().slice(0, 5);
      const qs = [];
      due.forEach(n => qs.push(...shuffle(n.tests.slice()).slice(0, 4)));
      startQuiz({ mode: 'review', title: '到期复习', nodes: due.map(n => n.id) }, shuffle(qs));
    },
    mock: () => {
      const pool = shuffle(Object.values(QS).filter(q => q.type === 'choice')).slice(0, CFG.mock.count);
      modal(`<p>开始模拟考试：${pool.length} 题，限时 ${CFG.mock.minutes} 分钟。中途退出不保存。</p>`,
        [{ label: '取消' }, { label: '开始', cls: 'primary', fn: () => startQuiz({ mode: 'mock', title: '综合知识模拟', limit: CFG.mock.minutes * 60 }, pool) }]);
    },
    pick: k => {
      const it = quiz.items[quiz.i];
      if (it.locked) return;
      it.a = +k;
      if (instant()) lockCurrent();
      render();
    },
    fillOk: () => { const f = $('#fillIn'); quiz.items[quiz.i].a = f.value.trim(); lockCurrent(); render(); },
    qPrev: () => { quiz.i--; render(true); },
    qNext: () => { quiz.i++; render(true); },
    sheet: showSheet,
    submit: () => { if (instant()) finishQuiz(); else confirmSubmit(); },
    openCase: id => go({ v: 'case', id }),
    showRef: i => {
      const s = D.cases[cur().id];
      s.shown[i] = true; save(); render();
      const el = main.querySelectorAll('textarea[data-case]')[i];
      if (el) el.closest('.card').scrollIntoView({ block: 'start' });
    },
    openEssay: id => go({ v: 'essay', id }),
    essayTab: t => replace(Object.assign({}, cur(), { t })),
    essayStart: () => { D.essays[cur().id].start = Date.now(); save(); if (NATIVE) NATIVE.keepOn(true); render(); },
    essayStop: () => { D.essays[cur().id].start = null; save(); if (NATIVE) NATIVE.keepOn(false); render(); },
    rate: arg => {
      const [i, k] = arg.split(':').map(Number), s = D.essays[cur().id];
      (s.rate || (s.rate = {}))[i] = k; save(); render();
    },
    projects: () => go({ v: 'projects' }),
    newProj: () => { const p = { id: 'p' + Date.now().toString(36) }; D.projects.push(p); save(); go({ v: 'proj', id: p.id }); },
    editProj: id => go({ v: 'proj', id }),
    delProj: id => modal('<p>删除这个项目素材？删除后不能恢复（除非有备份）。</p>', [{ label: '取消' }, {
      label: '删除', cls: 'danger', fn: () => { D.projects = D.projects.filter(p => p.id !== id); save(); back(); }
    }]),
    exportData: () => {
      const name = 'ruankao-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      const text = JSON.stringify({ app: 'ruankao', v: 1, t: Date.now(), data: D });
      if (NATIVE) { NATIVE.saveFile(name, text); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    },
    importData: () => { const f = $('#importFile'); f.value = ''; f.click(); },
    checkUpdate: () => NATIVE.checkUpdate()
  };
  $('#importFile').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      let j;
      try { j = JSON.parse(r.result); } catch (err) { j = null; }
      if (!j || j.app !== 'ruankao' || !j.data) { toast('不是本 App 的备份文件'); return; }
      modal(`<p>用 ${new Date(j.t).toLocaleString()} 的备份替换现在的全部学习记录？</p>`, [{ label: '取消' }, {
        label: '恢复', cls: 'danger', fn: () => { D = j.data; fix(); save(); toast('已恢复'); render(); }
      }]);
    };
    r.readAsText(file);
  };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act]');
    if (t && !t.disabled && main.contains(t) || t && $('#modal').contains(t)) {
      if (A[t.dataset.act]) { e.preventDefault(); if ($('#modal').contains(t)) closeModal(); A[t.dataset.act](t.dataset.arg, t); }
    }
  });
  $('#tabbar').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) switchTab(b.dataset.tab); };
  render(true);
})();
