// 学习时长与进度记录：打包时注入到每个页面，在图谱页里计时；总入口、宠物页、学习统计页也用它读数据
// 计时规则：页面在前台、且最近 3 分钟内有点击/滑动/按键才算在学习，发呆或切到后台不计
(function () {
  if (window.KMStudy) return;

  // 各图谱的进度键、页面路径和“已掌握”的判定，要和各自 app.js 里的 status() 保持一致
  const passed = p => p.last != null ? p.last >= 80 : p.diag === 'pass';
  const SOURCES = [
    { key: 'mathmap-progress-v1', name: '数学', path: '/math-map/', ok: p => p.best >= 0.8 },
    { key: 'fjzk-zh-progress-v1', name: '语文', path: '/chinese-map/', ok: passed },
    { key: 'fjzk-en-progress-v1', name: '英语', path: '/english-map/', ok: passed },
    { key: 'fjzk-physics-progress-v1', name: '物理', path: '/science-map/physics', ok: passed },
    { key: 'fjzk-chemistry-progress-v1', name: '化学', path: '/science-map/chemistry', ok: passed },
    { key: 'fjzk-biology-progress-v1', name: '生物', path: '/bio-history-map/biology', ok: passed },
    { key: 'fjzk-history-progress-v1', name: '历史', path: '/bio-history-map/history', ok: passed }
  ];
  const STORE = 'km-study-v1';
  const IDLE = 3 * 60 * 1000;   // 超过 3 分钟没操作就当作没在学
  const TICK = 10 * 1000;

  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }
  // { days: { 'YYYY-MM-DD': { 进度键: 秒 } }, first: { 进度键: { 知识点 id: 'YYYY-MM-DD' } }, totals: { 进度键: 知识点总数 } }
  function load() {
    const st = readJSON(STORE) || {};
    st.days = st.days || {}; st.first = st.first || {}; st.totals = st.totals || {};
    return st;
  }
  function save(st) {
    try { localStorage.setItem(STORE, JSON.stringify(st)); } catch (e) { /* 存不了就算了 */ }
  }

  const pad = n => (n < 10 ? '0' : '') + n;
  function dayKey(t) {
    const d = t == null ? new Date() : new Date(t);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  // 给新掌握的知识点记下掌握日期：第一次发现时用进度里最近一次测试/诊断的时间，以后不再变
  function scan(st) {
    let changed = false;
    SOURCES.forEach(s => {
      const prog = readJSON(s.key) || {};
      const first = st.first[s.key] = st.first[s.key] || {};
      Object.keys(prog).forEach(id => {
        const p = prog[id];
        if (!p || first[id] || !s.ok(p)) return;
        const t = Math.max(p.at || 0, p.updated || 0, p.diagAt || 0) || p.viewed || Date.now();
        first[id] = dayKey(Math.min(t, Date.now()));
        changed = true;
      });
    });
    return changed;
  }

  // 当前已掌握个数（以各图谱进度为准，测试退步了会减少）
  function masteredCount(key) {
    const s = SOURCES.find(x => x.key === key);
    const prog = readJSON(key) || {};
    return Object.keys(prog).filter(id => prog[id] && s.ok(prog[id])).length;
  }

  function secondsOn(st, day) {
    const d = st.days[day] || {};
    return Object.keys(d).reduce((a, k) => a + d[k], 0);
  }
  // 连续学习天数：今天没学就从昨天往前数
  function streak(st) {
    let n = 0, t = Date.now();
    if (!secondsOn(st, dayKey(t))) t -= 86400000;
    while (secondsOn(st, dayKey(t)) >= 60) { n++; t -= 86400000; }
    return n;
  }

  /* ---------------- 图谱页里计时 ---------------- */
  function startTimer() {
    const path = decodeURIComponent(location.pathname);
    const src = SOURCES.find(s => path.indexOf(s.path) >= 0);
    if (!src) return;
    let lastInput = Date.now(), lastTick = Date.now();
    const poke = () => { lastInput = Date.now(); };
    ['pointerdown', 'touchstart', 'keydown', 'wheel', 'input'].forEach(ev => addEventListener(ev, poke, { capture: true, passive: true }));

    function flush(rescan) {
      const now = Date.now();
      const dt = Math.min(now - lastTick, TICK * 2);
      lastTick = now;
      const active = document.visibilityState === 'visible' && now - lastInput < IDLE;
      if (!active && !rescan) return;
      const st = load();
      if (active && dt > 0) {
        const d = st.days[dayKey(now)] = st.days[dayKey(now)] || {};
        d[src.key] = Math.round(((d[src.key] || 0) + dt / 1000) * 10) / 10;
      }
      if (rescan) scan(st);
      save(st);
    }
    let n = 0;
    setInterval(() => flush(++n % 6 === 0), TICK);           // 每分钟顺带记一次新掌握的知识点
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') { lastTick = Date.now(); lastInput = Date.now(); }
      else flush(true);
    });
    addEventListener('pagehide', () => flush(true));
    addEventListener('load', () => {
      const st = load();
      const total = window.KG && KG.nodes ? KG.nodes.length : window.MAP && MAP.nodes ? MAP.nodes.length : 0;
      if (total) st.totals[src.key] = total;
      scan(st);
      save(st);
    });
  }

  window.KMStudy = { SOURCES, load, save, scan, dayKey, secondsOn, streak, masteredCount };
  startTimer();
})();
