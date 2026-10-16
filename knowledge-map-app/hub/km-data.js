// 学习数据中枢：把这台设备上所有学习数据导出成一个文件、导入时按规则合并（不覆盖）
// 打包时注入每个页面（排在 km-study.js 前面，file:// 和 https 虚拟地址两边都有）；hub/data.html「我的数据」直接引用
// 以后的账号同步（需求 #1）直接复用这里的 collect / merge / apply、修改记录 km-meta-v1 和设备编号 km-device-v1
//
// 做的事：
// 1. 修改记录：包一层 localStorage.setItem，清单里的键被写入时，1 秒内比对一次差异，把每一条（知识点、错题、草稿、词单……）的
//    修改记录写进 km-meta-v1：{ 键: { 条目id: { t: 修改时间, by: 设备, x: 删除时间, v: 删除前的内容, vers: 草稿各设备版本 } } }
//    写完发 window 事件 'km-data-change'，detail = { keys: [...] }
// 2. 设备编号：km-device-v1 = { id, name, created }（App 里同时存一份到原生共享存储，听写页和图谱页用同一个编号）
// 3. 听写词单在 https 虚拟地址的另一份 localStorage 里：经 KMBridge.sharedGet / sharedPut 和图谱页互通
// 4. merge(a, b) 是纯函数：不读写存储、不读当前时间；幂等、对称、满足结合律（三台设备按任意顺序合并结果都一样），
//    输出的对象属性排好序，同样的输入在任何设备上得到一字不差的结果。
//    做法：每种数据的合并都是“取上界”——数取大/取小、集合取并集、“取较新”按 (时间, 设备编号, JSON 文本) 的全序取最大
(function () {
  if (window.KMData) return;

  const SCHEMA = 1;
  const META = 'km-meta-v1', DEVICE = 'km-device-v1', EXTRA = 'km-data-extra-v1';
  const TOMB_KEEP = 180 * 86400000;     // 删除记录保留 180 天
  const DICT = 'fjzk-en-dictation-v1';
  const HOUR = 3600000;

  /* ---------------- 数据清单 ----------------
     merge：合并方式；items：怎么拆成条目记修改时间（obj = 每个属性一条，dict = 每个词单一条 + '@settings'，缺省 = 整键一条 '*'）
     store：'shared' 表示在 App 里存在原生共享存储（听写页那份），其余都在图谱页的 localStorage */
  const SUBJ = [['zh', '语文'], ['en', '英语'], ['physics', '物理'], ['chemistry', '化学'], ['biology', '生物'], ['history', '历史'], ['notes', '学做笔记']];
  const KEYS = [
    { key: 'mathmap-progress-v1', name: '数学', cat: 'progress', merge: 'mathProgress', items: 'obj' },
    { key: 'mathmap-wrong-v1', name: '数学错题本', cat: 'wrong', merge: 'mathWrong', items: 'obj' }
  ].concat(
    SUBJ.map(s => ({ key: 'fjzk-' + s[0] + '-progress-v1', name: s[1], cat: 'progress', merge: 'progress', items: 'obj' })),
    SUBJ.map(s => ({ key: 'fjzk-' + s[0] + '-drafts-v1', name: s[1] + '草稿', cat: 'drafts', merge: 'drafts', items: 'obj' })),
    [
      { key: 'fjzk-zh-diag-v1', name: '语文入门诊断', cat: 'diag', merge: 'whole' },
      { key: 'fjzk-en-diag-v1', name: '英语入门诊断', cat: 'diag', merge: 'whole' },
      { key: 'km-study-v1', name: '学习时长', cat: 'study', merge: 'study' },
      { key: 'km-pet-v1', name: '小狗', cat: 'pet', merge: 'pet' },
      { key: 'km-narrate-rate', name: '朗读语速', cat: 'pref', merge: 'whole', raw: true },
      { key: DICT, name: '单词听写', cat: 'dictation', merge: 'dictation', items: 'dict', store: 'shared' }
    ]);
  const byKey = {};
  KEYS.forEach(s => { byKey[s.key] = s; });
  const INTERNAL = new Set([META, DEVICE, EXTRA]);

  // 各科旧的单科备份文件（app 字段）→ 进度键前缀
  const LEGACY = {
    'fjzk-chinese-map': 'fjzk-zh', 'fjzk-english-map': 'fjzk-en', 'fjzk-physics': 'fjzk-physics', 'fjzk-chemistry': 'fjzk-chemistry',
    'fjzk-biology': 'fjzk-biology', 'fjzk-history': 'fjzk-history', 'fjzk-notes': 'fjzk-notes'
  };

  /* ---------------- 小工具 ---------------- */
  const hasOwn = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const num = v => typeof v === 'number' && isFinite(v);
  const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  // 稳定的 JSON：属性按名字排序
  function canon(v) {
    if (v === undefined) return '';
    if (Array.isArray(v)) return '[' + v.map(x => x === undefined ? 'null' : canon(x)).join(',') + ']';
    if (isObj(v)) return '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
    return JSON.stringify(v);
  }
  const same = (a, b) => canon(a) === canon(b);
  function sortDeep(v) {
    if (Array.isArray(v)) return v.map(sortDeep);
    if (isObj(v)) { const o = {}; Object.keys(v).sort().forEach(k => { if (v[k] !== undefined) o[k] = sortDeep(v[k]); }); return o; }
    return v;
  }
  const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  function cmpTuple(x, y) { for (let i = 0; i < x.length; i++) { const c = cmp(x[i], y[i]); if (c) return c; } return 0; }
  // 两者取“大”的那个（key 给出比较用的元组）；undefined 表示没有信息
  function pick(a, b, key) {
    if (a === undefined) return b;
    if (b === undefined) return a;
    return cmpTuple(key(a), key(b)) >= 0 ? a : b;
  }
  const jCanon = (a, b) => pick(a, b, v => [canon(v)]);                     // 没有规则的字段：取 JSON 文本较大的
  const jMax = (a, b) => num(a) && num(b) ? Math.max(a, b) : num(a) ? a : num(b) ? b : jCanon(a, b);
  const jMin = (a, b) => num(a) && num(b) ? Math.min(a, b) : num(a) ? a : num(b) ? b : jCanon(a, b);
  const jMinStr = (a, b) => typeof a === 'string' && typeof b === 'string' ? (a < b ? a : b) : jCanon(a, b);
  const pad = n => (n < 10 ? '0' : '') + n;
  function fmtTime(t) {
    if (!t) return '更早';
    const d = new Date(t);
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function sub(o, fields) { const r = {}; fields.forEach(f => { if (hasOwn(o, f) && o[f] !== undefined) r[f] = o[f]; }); return r; }

  // 按字段合并两个对象：rules[字段] 是该字段的合并函数（缺省取 JSON 文本较大的）；
  // groups 里的几个字段必须一起取（如 last 和 updated），按 key 取较大的那一组
  function joinObj(a, b, rules, groups) {
    if (a === undefined) return clone(b);
    if (b === undefined) return clone(a);
    if (!isObj(a) || !isObj(b)) return clone(jCanon(a, b));
    groups = groups || [];
    const inGroup = new Set();
    groups.forEach(g => g.fields.forEach(f => inGroup.add(f)));
    const r = {};
    Object.keys(a).concat(Object.keys(b)).forEach(f => {
      if (inGroup.has(f) || hasOwn(r, f)) return;
      const v = (rules[f] || jCanon)(a[f], b[f]);
      if (v !== undefined) r[f] = clone(v);
    });
    groups.forEach(g => Object.assign(r, clone(pick(sub(a, g.fields), sub(b, g.fields), g.key))));
    return r;
  }

  /* ---------------- 本机存储 ---------------- */
  let ls = null;
  try { ls = window.localStorage; } catch (e) { ls = null; }
  const B = window.KMBridge;
  const hasShared = !!(B && B.sharedGet && B.sharedPut);
  const nativeSet = Storage.prototype.setItem, nativeRemove = Storage.prototype.removeItem;
  function rawSet(k, v) { try { nativeSet.call(ls, k, v); } catch (e) { /* 存不了就算了 */ } }
  function parse(raw) { try { return JSON.parse(raw); } catch (e) { return raw; } }
  function readLocal(key) {
    if (!ls) return undefined;
    let raw = null;
    try { raw = ls.getItem(key); } catch (e) { raw = null; }
    if (raw == null) return undefined;
    return byKey[key] && byKey[key].raw ? raw : parse(raw);
  }
  // 写回时：字符串原样写（语速这类），其余转 JSON
  const toRaw = v => typeof v === 'string' ? v : JSON.stringify(v);
  function loadMeta() { const m = readLocal(META); return isObj(m) ? m : {}; }
  function saveMeta(m) { rawSet(META, JSON.stringify(m)); }
  // 清理 180 天前的删除记录（条目已删除且删除早于 180 天）
  function prune(meta, now) {
    Object.keys(meta).forEach(k => {
      const m = meta[k];
      if (!isObj(m)) { delete meta[k]; return; }
      Object.keys(m).forEach(id => {
        const e = m[id];
        if (!isObj(e)) { delete m[id]; return; }
        if (e.x && e.x >= (e.t || 0) && now - e.x > TOMB_KEEP) delete m[id];
      });
      if (!Object.keys(m).length) delete meta[k];
    });
    return meta;
  }

  // 原生共享存储（只在 App 里有）：值存成 { value, meta }，meta 是这个键的修改记录
  function sharedRead(key) {
    if (!hasShared) return null;
    try {
      const s = B.sharedGet(key);
      if (!s) return null;
      const o = JSON.parse(s);
      const v = o && o.v ? JSON.parse(o.v) : null;
      return isObj(v) ? v : null;
    } catch (e) { return null; }
  }
  function sharedWrite(key, value, meta) {
    if (!hasShared) return;
    try { B.sharedPut(key, JSON.stringify({ value, meta: meta || {} }), Date.now()); } catch (e) { /* 忽略 */ }
  }

  /* ---------------- 设备编号 ---------------- */
  let dev = null;
  function newId() {
    const a = new Uint8Array(8);
    try { crypto.getRandomValues(a); } catch (e) { for (let i = 0; i < 8; i++) a[i] = Math.random() * 256; }
    return Array.prototype.map.call(a, x => (x < 16 ? '0' : '') + x.toString(16)).join('');
  }
  function deviceName() {
    try { if (B && B.deviceName) return String(B.deviceName() || '平板'); } catch (e) { /* 忽略 */ }
    return '浏览器';
  }
  /** 本机设备编号 { id: 16 位十六进制, name, created } */
  function device() {
    if (dev) { const cur = readLocal(DEVICE); if (!isObj(cur) || cur.id !== dev.id) rawSet(DEVICE, JSON.stringify(dev)); return dev; }
    let d = readLocal(DEVICE);
    if (!isObj(d) || !d.id) d = null;
    if (hasShared) {
      const s = sharedRead(DEVICE);
      if (s && isObj(s.value) && s.value.id) d = s.value;     // 共享存储里的为准：图谱页和听写页同一个编号
    }
    if (!d) d = { id: newId(), created: Date.now() };
    d = Object.assign({}, d, { name: deviceName() });
    if (!same(readLocal(DEVICE), d)) rawSet(DEVICE, JSON.stringify(d));
    if (hasShared) { const s = sharedRead(DEVICE); if (!s || !same(s.value, d)) sharedWrite(DEVICE, d); }
    dev = d;
    return d;
  }

  /* ---------------- 修改记录（km-meta-v1） ---------------- */
  // 把一个键的值拆成条目：Map(条目id → 内容 JSON)
  function itemsOf(spec, v) {
    const m = new Map();
    if (v === undefined) return m;
    if (spec && spec.items === 'obj') {
      if (isObj(v)) Object.keys(v).forEach(id => m.set(id, JSON.stringify(v[id])));
    } else if (spec && spec.items === 'dict') {
      if (isObj(v)) {
        (Array.isArray(v.lists) ? v.lists : []).forEach(l => { if (l && l.id) m.set(String(l.id), JSON.stringify(l)); });
        if (v.settings !== undefined) m.set('@settings', JSON.stringify(v.settings));
      }
    } else m.set('*', typeof v === 'string' ? v : JSON.stringify(v));
    return m;
  }
  const textChecks = q => isObj(q) ? canon({ text: q.text, checks: q.checks }) : '';
  // 草稿：本机改了某题，就更新本机那一份版本，并把其它设备的版本都记成“看过”
  function updateVers(e, oldNode, newNode, me, now) {
    if (!isObj(newNode)) return;
    const vers = e.vers = isObj(e.vers) ? e.vers : {};
    Object.keys(newNode).forEach(q => {
      const nq = newNode[q];
      if (!isObj(nq) || textChecks(nq) === textChecks(isObj(oldNode) ? oldNode[q] : undefined)) return;
      const list = vers[q] = isObj(vers[q]) ? vers[q] : {};
      const seen = {};
      Object.keys(list).forEach(d => { if (d !== me && isObj(list[d])) seen[d] = +list[d].t || 0; });
      const v = { t: now, text: String(nq.text || ''), seen };
      if (nq.checks !== undefined) v.checks = clone(nq.checks);
      list[me] = v;
    });
  }

  const snap = {};
  const dirty = new Set();
  let timer = 0, muted = 0;
  function takeSnap(key) { snap[key] = itemsOf(byKey[key], readLocal(key)); }
  function mark(key) {
    dirty.add(key);
    if (!timer) timer = setTimeout(flush, 1000);     // 1 秒内的多次写入（打字）合并成一次比对
  }
  function flush() {
    clearTimeout(timer); timer = 0;
    if (!dirty.size || !ls) return;
    const meta = loadMeta(), now = Date.now(), me = device().id;
    const keys = Array.from(dirty);
    dirty.clear();
    keys.forEach(key => {
      const spec = byKey[key];
      const cur = itemsOf(spec, readLocal(key)), old = snap[key] || new Map();
      const m = isObj(meta[key]) ? meta[key] : {};
      cur.forEach((s, id) => {
        if (old.get(id) === s) return;
        const e = isObj(m[id]) ? m[id] : {};
        e.t = now; e.by = me; delete e.v;
        if (spec.merge === 'drafts') updateVers(e, old.has(id) ? parse(old.get(id)) : undefined, parse(s), me, now);
        m[id] = e;
      });
      old.forEach((s, id) => {
        if (cur.has(id)) return;
        const e = isObj(m[id]) ? m[id] : {};
        e.x = now; e.v = parse(s);        // 删除时记下内容，三方合并时才不会因先后顺序不同而结果不同
        m[id] = e;
      });
      snap[key] = cur;
      if (Object.keys(m).length) meta[key] = m;
    });
    saveMeta(prune(meta, now));
    // 听写页写了词单：同步到原生共享存储，图谱页那边的「我的数据」才能导出它
    if (hasShared && location.protocol !== 'file:') keys.forEach(key => { if (byKey[key].store === 'shared') sharedWrite(key, readLocal(key), meta[key]); });
    try { window.dispatchEvent(new CustomEvent('km-data-change', { detail: { keys } })); } catch (e) { /* 忽略 */ }
  }

  if (ls) {
    KEYS.forEach(s => takeSnap(s.key));
    Storage.prototype.setItem = function (k, v) {
      nativeSet.call(this, k, v);
      if (!muted && this === ls && byKey[k]) mark(k);
    };
    Storage.prototype.removeItem = function (k) {
      nativeRemove.call(this, k);
      if (!muted && this === ls && byKey[k]) mark(k);
    };
    addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  }

  /* ---------------- 合并规则（每条都是“取上界”，保证对称、幂等、结合律） ---------------- */
  const rankLast = s => s.last == null ? -1 : +s.last || 0;
  const LU = { fields: ['last', 'updated'], key: s => [+s.updated || 0, rankLast(s), canon(s)] };
  const DG = { fields: ['diag', 'diagInferred', 'diagAt'], key: s => [+s.diagAt || 0, canon(s)] };
  const MATH_LA = { fields: ['last', 'at'], key: s => [+s.at || 0, +s.last || 0, canon(s)] };
  // 进度（非数学）：viewed 取早；best、attempts 取大；last+updated 一起取 updated 新的；diag 三项一起取 diagAt 新的
  const joinProg = (a, b) => joinObj(a, b, { viewed: jMin, best: jMax, attempts: jMax }, [LU, DG]);
  // 数学进度：best 取大；last+at 一起取 at 新的
  const joinMath = (a, b) => joinObj(a, b, { best: jMax }, [MATH_LA]);
  // 数学错题：n 取大、at 取新
  const joinWrong = (a, b) => joinObj(a, b, { n: jMax, at: jMax });

  // 听写词单：名称、单词表等取修改记录较新的；错词取并集、次数取大；history 按 at 去重、保留最近 50 条；created 取早
  function joinList(a, b, ea, eb) {
    if (a === undefined && b === undefined) return undefined;
    if (a === undefined) return joinList(b, b, eb, eb);     // 只一边有：和自己合并一次，同样去重排序，输出和两边都有时一样规范
    if (b === undefined) return joinList(a, a, ea, ea);
    if (!isObj(a) || !isObj(b)) return clone(jCanon(a, b));
    const SPECIAL = ['wrong', 'history', 'created'];
    const rest = o => { const r = Object.assign({}, o); SPECIAL.forEach(f => delete r[f]); return r; };
    const w = pick({ g: rest(a), e: ea }, { g: rest(b), e: eb }, o => [o.e.t, o.e.by, canon(o.g)]);
    const r = clone(w.g);
    const wrong = {};
    [a.wrong, b.wrong].forEach(src => Object.keys(isObj(src) ? src : {}).forEach(k => { wrong[k] = jMax(wrong[k], src[k]); }));
    r.wrong = wrong;
    const hist = new Map();
    (Array.isArray(a.history) ? a.history : []).concat(Array.isArray(b.history) ? b.history : []).forEach(h => {
      if (!isObj(h)) return;
      const k = String(h.at);
      hist.set(k, jCanon(hist.get(k), h));
    });
    r.history = clone(Array.from(hist.values()).sort((x, y) => (+x.at || 0) - (+y.at || 0) || cmp(canon(x), canon(y))).slice(-50));
    const c = jMin(a.created, b.created);
    if (c !== undefined) r.created = c;
    return r;
  }
  const listHint = l => isObj(l) && Array.isArray(l.history) ? l.history.reduce((m, h) => Math.max(m, (h && +h.at) || 0), 0) : 0;

  // 草稿：每题按设备各存一份最新版本 vers[题号][设备] = { t, text, checks, seen: { 别的设备: 它的 t } }（存在 km-meta 里）
  // 正文由这几份算出：去掉已被别的版本看过的、或是别的版本开头部分的，剩下里最新的当正文，其余接在后面
  function computeDraft(list) {
    const vs = Object.keys(list).sort().filter(d => isObj(list[d])).map(d => ({ dev: d, t: +list[d].t || 0, text: String(list[d].text || ''), checks: list[d].checks, seen: isObj(list[d].seen) ? list[d].seen : {} }));
    const key = v => [v.t, v.dev];
    const covered = (v, w) => w !== v && ((hasOwn(w.seen, v.dev) && +w.seen[v.dev] >= v.t) ||
      (w.text.indexOf(v.text) === 0 && (w.text !== v.text || cmpTuple(key(w), key(v)) > 0)));
    let alive = vs.filter(v => !vs.some(w => covered(v, w)));
    if (!alive.length && vs.length) alive = [vs.reduce((m, v) => cmpTuple(key(v), key(m)) > 0 ? v : m)];
    alive.sort((x, y) => cmpTuple(key(y), key(x)));
    if (!alive.length) return { text: '', n: 0 };
    const body = alive[0];
    const text = body.text + alive.slice(1).map(v => '\n\n【另一台设备 ' + fmtTime(v.t) + ' 保存的版本】\n' + v.text).join('');
    return { text, checks: body.checks, n: alive.length };
  }
  function joinDraftNode(va, vb, ea, eb, devA, devB) {
    const vers = {};
    const addSide = (v, e, dv) => {
      const ev = isObj(e.vers) ? e.vers : {};
      Object.keys(ev).concat(isObj(v) ? Object.keys(v) : []).forEach(q => {
        let list = isObj(ev[q]) ? ev[q] : null;
        if (!list) {          // 老数据没有版本记录：把这份文字当作这台设备的一个版本（时间记为 0 = 更早）
          const d = isObj(v) && isObj(v[q]) ? v[q] : null;
          if (!d) return;
          const one = { t: 0, text: String(d.text || ''), seen: {} };
          if (d.checks !== undefined) one.checks = d.checks;
          list = {}; list[dv || 'unknown'] = one;
        }
        const o = vers[q] = vers[q] || {};
        Object.keys(list).forEach(d => { if (isObj(list[d])) o[d] = clone(pick(o[d], list[d], x => [+x.t || 0, canon(x)])); });
      });
    };
    addSide(va, ea, devA);
    addSide(vb, eb, devB);
    const val = {};
    const qs = Object.keys(vers).concat(isObj(va) ? Object.keys(va) : [], isObj(vb) ? Object.keys(vb) : []);
    qs.forEach(q => {
      if (hasOwn(val, q)) return;
      const qa = isObj(va) && isObj(va[q]) ? va[q] : undefined, qb = isObj(vb) && isObj(vb[q]) ? vb[q] : undefined;
      if (!vers[q]) { const x = jCanon(isObj(va) ? va[q] : undefined, isObj(vb) ? vb[q] : undefined); if (x !== undefined) val[q] = clone(x); return; }
      const r = joinObj(qa && sub(qa, Object.keys(qa).filter(f => f !== 'text' && f !== 'checks')), qb && sub(qb, Object.keys(qb).filter(f => f !== 'text' && f !== 'checks')), {}) || {};
      const c = computeDraft(vers[q]);
      r.text = c.text;
      if (c.checks !== undefined) r.checks = clone(c.checks); else delete r.checks;
      val[q] = r;
    });
    return { val, vers };
  }

  // 修改记录的一条
  function entryOf(m, id) {
    const e = isObj(m) && isObj(m[id]) ? m[id] : {};
    const out = { t: +e.t || 0, by: String(e.by || ''), x: +e.x || 0 };
    if (e.v !== undefined) out.v = e.v;
    if (isObj(e.vers)) out.vers = e.vers;
    return out;
  }
  const entryKey = e => [e.t, e.by];

  /* 按条目合并（进度、错题、草稿、词单）：
     内容 = 两边内容（含删除时记下的内容）取上界；修改时间、设备取较新的；删除时间取较晚的。
     某一边还有这一条，且（没有删除记录，或最近一次修改 / 条目自带时间晚于删除）→ 保留；否则算删除（另一台设备后来删掉了它） */
  function mergeItems(kind, A, B2) {
    const ia = isObj(A.items) ? A.items : {}, ib = isObj(B2.items) ? B2.items : {};
    const ma = isObj(A.meta) ? A.meta : {}, mb = isObj(B2.meta) ? B2.meta : {};
    const ids = Array.from(new Set(Object.keys(ia).concat(Object.keys(ib), Object.keys(ma), Object.keys(mb)))).filter(id => id !== '@settings' && id !== '*').sort();
    const items = {}, meta = {};
    ids.forEach(id => {
      const ea = entryOf(ma, id), eb = entryOf(mb, id);
      const ha = hasOwn(ia, id), hb = hasOwn(ib, id);
      const va = ha ? ia[id] : ea.v, vb = hb ? ib[id] : eb.v;
      const w = pick(ea, eb, entryKey), x = Math.max(ea.x, eb.x);
      let val, vers, hint = 0;
      if (kind === 'drafts') ({ val, vers } = joinDraftNode(va, vb, ea, eb, A.dev, B2.dev));
      else if (kind === 'list') { val = joinList(va, vb, ea, eb); hint = listHint(val); }
      else if (kind === 'mathWrong') { val = joinWrong(va, vb); hint = isObj(val) ? +val.at || 0 : 0; }
      else if (kind === 'mathProgress') val = joinMath(va, vb);
      else val = joinProg(va, vb);
      const live = (ha || hb) && val !== undefined && (!x || Math.max(w.t, hint) > x);
      const e = {};
      if (w.t || w.by) { e.t = w.t; if (w.by) e.by = w.by; }
      if (x) e.x = x;
      if (vers && Object.keys(vers).length) e.vers = vers;
      if (live) items[id] = val;
      else if (val !== undefined && x) e.v = val;
      if (Object.keys(e).length) meta[id] = e;
    });
    return { items, meta };
  }

  // 学习时长：按设备分开记 byDev[设备][日期][科目] 两边取大，days 由 byDev 求和；first 取早；totals 取大
  function normStudy(st, devId) {
    if (!isObj(st)) return st;
    st = clone(st);
    if (!isObj(st.days)) st.days = {};
    if (!isObj(st.byDev)) {
      st.byDev = {};
      if (Object.keys(st.days).length) st.byDev[devId || 'unknown'] = clone(st.days);
    }
    return st;
  }
  function sumDays(byDev) {
    const days = {};
    Object.keys(byDev).sort().forEach(d => {
      const dd = isObj(byDev[d]) ? byDev[d] : {};
      Object.keys(dd).sort().forEach(day => {
        const o = days[day] = days[day] || {};
        Object.keys(isObj(dd[day]) ? dd[day] : {}).forEach(k => { o[k] = Math.round(((o[k] || 0) + (+dd[day][k] || 0)) * 10) / 10; });
      });
    });
    return days;
  }
  function joinStudy(a, b) {
    if (a === undefined && isObj(b)) return joinStudy(b, b);    // 只一边有：同样按 byDev 重算 days，输出规范
    if (b === undefined && isObj(a)) return joinStudy(a, a);
    if (!isObj(a) || !isObj(b)) return clone(a === undefined ? b : b === undefined ? a : jCanon(a, b));
    const SPECIAL = ['byDev', 'days', 'first', 'totals', 'migrated'];
    const strip = o => { const r = Object.assign({}, o); SPECIAL.forEach(f => delete r[f]); return r; };
    const r = joinObj(strip(a), strip(b), {});
    const byDev = {};
    [a.byDev, b.byDev].forEach(src => Object.keys(isObj(src) ? src : {}).forEach(d => Object.keys(isObj(src[d]) ? src[d] : {}).forEach(day =>
      Object.keys(isObj(src[d][day]) ? src[d][day] : {}).forEach(k => {
        const o = ((byDev[d] = byDev[d] || {})[day] = byDev[d][day] || {});
        o[k] = jMax(o[k], +src[d][day][k] || 0);
      }))));
    r.byDev = byDev;
    r.days = sumDays(byDev);
    const first = {};
    [a.first, b.first].forEach(src => Object.keys(isObj(src) ? src : {}).forEach(k => Object.keys(isObj(src[k]) ? src[k] : {}).forEach(id => {
      const o = first[k] = first[k] || {};
      o[id] = jMinStr(o[id], src[k][id]);
    })));
    r.first = first;
    const totals = {};
    [a.totals, b.totals].forEach(src => Object.keys(isObj(src) ? src : {}).forEach(k => { totals[k] = jMax(totals[k], src[k]); }));
    r.totals = totals;
    r.migrated = 1;
    return r;
  }

  // 小狗：骨头 = 3×已领知识点数 − Σ喂食花掉 − Σ迁移前差额 − 已购装扮总价（每台设备的花费分开记，合并取大，不会重复发也不会重复扣）
  function petApi() { return window.KMPet || { ITEMS: [], BONES_PER_NODE: 3, DECAY_PER_HOUR: 1 }; }
  function uniqClaimed(st) {
    let n = 0;
    Object.keys(isObj(st.claimed) ? st.claimed : {}).forEach(k => { n += new Set(Array.isArray(st.claimed[k]) ? st.claimed[k] : []).size; });
    return n;
  }
  function ownedPrice(st) {
    const items = petApi().ITEMS || [];
    return Array.from(new Set(Array.isArray(st.owned) ? st.owned : [])).reduce((a, id) => { const it = items.find(x => x.id === id); return a + (it ? it.price : 0); }, 0);
  }
  const sumVals = o => Object.keys(isObj(o) ? o : {}).sort().reduce((a, k) => a + (+o[k] || 0), 0);
  /** 按公式算骨头：max(0, 3×已领知识点数 − Σspent − Σlegacy − 已购装扮总价) */
  function petBones(st) {
    return Math.max(0, (petApi().BONES_PER_NODE || 3) * uniqClaimed(st) - sumVals(st.spent) - sumVals(st.legacy) - ownedPrice(st));
  }
  /** 迁移：以前的喂食花费折算成该设备的 legacy，使恒等式成立、骨头数不变（返回新对象） */
  function normPet(st, devId) {
    if (!isObj(st)) return st;
    st = clone(st);
    if (!isObj(st.spent)) st.spent = {};
    if (!isObj(st.legacy)) {
      st.legacy = {};
      st.legacy[devId || 'unknown'] = (petApi().BONES_PER_NODE || 3) * uniqClaimed(st) - (+st.bones || 0) - ownedPrice(st);
    }
    return st;
  }
  function parseDay(s) {     // 'YYYY-M-D' → 可比较的数
    const m = /^(\d+)-(\d+)-(\d+)$/.exec(s || '');
    return m ? +m[1] * 10000 + +m[2] * 100 + +m[3] : 0;
  }
  const isPet = v => isObj(v) && !!v.breed;
  function finishPet(r) {
    r.xp = uniqClaimed(r);
    r.bones = petBones(r);
    return r;
  }
  function joinPet(a, b) {
    if (!isPet(a) || !isPet(b)) {
      // 只一边有小狗：和自己合并一次，claimed 每科、owned 同样去重排序（pet-core 平时是 push 进去的，顺序不定）
      if (isPet(a)) return joinPet(a, a);
      if (isPet(b)) return joinPet(b, b);
      return clone(a === undefined ? b : b === undefined ? a : jCanon(a, b));
    }
    const SPECIAL = ['claimed', 'owned', 'spent', 'legacy', 'fullness', 'tick', 'equip', 'equipT', 'name', 'nameT', 'breed', 'born', 'petDay', 'petCount', 'lastStudy', 'xp', 'bones'];
    const strip = o => { const r = Object.assign({}, o); SPECIAL.forEach(f => delete r[f]); return r; };
    const r = joinObj(strip(a), strip(b), {});
    const claimed = {};
    [a.claimed, b.claimed].forEach(src => Object.keys(isObj(src) ? src : {}).forEach(k => {
      const set = claimed[k] = claimed[k] || new Set();
      (Array.isArray(src[k]) ? src[k] : []).forEach(id => set.add(id));
    }));
    r.claimed = {};
    Object.keys(claimed).forEach(k => { r.claimed[k] = Array.from(claimed[k]).sort(); });
    r.owned = Array.from(new Set((Array.isArray(a.owned) ? a.owned : []).concat(Array.isArray(b.owned) ? b.owned : []))).sort();
    ['spent', 'legacy'].forEach(f => {
      r[f] = {};
      [a[f], b[f]].forEach(src => Object.keys(isObj(src) ? src : {}).forEach(d => { r[f][d] = jMax(r[f][d], +src[d] || 0); }));
    });
    // 饱食度：按同一时刻折算后更饱的那份（饱食度和 tick 原样保留，等价于“衰减到较晚的 tick 再取大”，又不引入小数误差）
    const decay = petApi().DECAY_PER_HOUR || 1;
    const food = pick(a, b, p => [(+p.fullness || 0) + (+p.tick || 0) / HOUR * decay, +p.tick || 0, canon([p.fullness, p.tick])]);
    r.fullness = food.fullness; r.tick = food.tick;
    // 穿戴：equipT（换装时间）较新的
    const eq = pick(a, b, p => [+p.equipT || 0, canon(p.equip || {})]);
    r.equip = clone(eq.equip || {});
    if (eq.equipT) r.equipT = eq.equipT;
    // 名字、品种：最早领养的那只（born 最小）；同一只狗按 nameT（改名时间）取较新
    const nm = pick(a, b, p => [-(+p.born || 0), +p.nameT || 0, canon(p.name)]);
    r.name = nm.name;
    if (nm.nameT) r.nameT = nm.nameT;
    r.breed = pick(a, b, p => [-(+p.born || 0), canon(p.breed)]).breed;
    r.born = jMin(a.born, b.born);
    const pd = pick(a, b, p => [parseDay(p.petDay), +p.petCount || 0, canon([p.petDay, p.petCount])]);
    r.petDay = pd.petDay; r.petCount = pd.petCount || 0;
    const ls2 = jMax(a.lastStudy, b.lastStudy);
    if (ls2 !== undefined) r.lastStudy = ls2;
    return finishPet(r);
  }

  // 听写数据：词单按 id 合并（见 mergeItems），设置取修改记录较新的，其余字段取上界
  function joinDict(A, B2) {
    const a = A.val, b = B2.val;
    if ((a !== undefined && !isObj(a)) || (b !== undefined && !isObj(b))) return wholeLww(A, B2, '*');
    const byId = v => { const o = {}; (isObj(v) && Array.isArray(v.lists) ? v.lists : []).forEach(l => { if (isObj(l) && l.id) o[l.id] = l; }); return o; };
    const r = joinObj(a && sub(a, Object.keys(a).filter(f => f !== 'lists' && f !== 'settings')), b && sub(b, Object.keys(b).filter(f => f !== 'lists' && f !== 'settings')), {}) || {};
    const res = mergeItems('list', { items: byId(a), meta: A.meta }, { items: byId(b), meta: B2.meta });
    r.lists = Object.keys(res.items).map(id => res.items[id]).sort((x, y) => (+y.created || 0) - (+x.created || 0) || cmp(String(x.id), String(y.id)));
    const meta = res.meta;
    const sa = isObj(a) && a.settings !== undefined ? { val: a.settings, e: entryOf(A.meta, '@settings') } : undefined;
    const sb = isObj(b) && b.settings !== undefined ? { val: b.settings, e: entryOf(B2.meta, '@settings') } : undefined;
    const ws = pick(sa, sb, o => [o.e.t, o.e.by, canon(o.val)]);
    if (ws) {
      r.settings = clone(ws.val);
      if (ws.e.t || ws.e.by) meta['@settings'] = ws.e.by ? { t: ws.e.t, by: ws.e.by } : { t: ws.e.t };
    }
    return { val: r, meta };
  }

  // 整键数据（诊断、语速、不认识的键）：取修改记录较新的；时间相同（或都没有记录）先比设备，再取 JSON 文本较大的
  function wholeLww(A, B2, id) {
    const ca = A.val !== undefined ? { val: A.val, e: entryOf(A.meta, id) } : undefined;
    const cb = B2.val !== undefined ? { val: B2.val, e: entryOf(B2.meta, id) } : undefined;
    const w = pick(ca, cb, o => [o.e.t, o.e.by, canon(o.val)]);
    if (!w) return { val: undefined, meta: {} };
    const meta = {};
    if (w.e.t || w.e.by) meta[id] = w.e.by ? { t: w.e.t, by: w.e.by } : { t: w.e.t };
    return { val: clone(w.val), meta };
  }
  function maxEntryMeta(A, B2) {
    const w = pick(entryOf(A.meta, '*'), entryOf(B2.meta, '*'), entryKey);
    return w.t || w.by ? { '*': w.by ? { t: w.t, by: w.by } : { t: w.t } } : {};
  }

  // 一个键的两份（side = { val, meta: km-meta 里这个键的部分, dev }）合并
  function mergeKey(spec, A, B2) {
    const kind = spec ? spec.merge : 'whole';
    const objOk = v => v === undefined || isObj(v);
    if ((kind === 'progress' || kind === 'mathProgress' || kind === 'mathWrong' || kind === 'drafts') && objOk(A.val) && objOk(B2.val)) {
      const r = mergeItems(kind, { items: A.val, meta: A.meta, dev: A.dev }, { items: B2.val, meta: B2.meta, dev: B2.dev });
      return { val: A.val === undefined && B2.val === undefined ? undefined : r.items, meta: r.meta };
    }
    if (kind === 'study' && objOk(A.val) && objOk(B2.val)) return { val: joinStudy(A.val, B2.val), meta: maxEntryMeta(A, B2) };
    if (kind === 'pet' && objOk(A.val) && objOk(B2.val)) return { val: joinPet(A.val, B2.val), meta: maxEntryMeta(A, B2) };
    if (kind === 'dictation') return joinDict(A, B2);
    return wholeLww(A, B2, '*');
  }

  // 整理数据包：补齐结构，老数据（学习时长没有 byDev、小狗没有花费记录）先按它自己的设备迁移
  function normalize(pkg) {
    const p = { device: isObj(pkg && pkg.device) ? pkg.device : {}, keys: {}, meta: {} };
    if (pkg && isObj(pkg.keys)) Object.keys(pkg.keys).forEach(k => { if (pkg.keys[k] !== undefined && !INTERNAL.has(k)) p.keys[k] = pkg.keys[k]; });
    if (pkg && isObj(pkg.meta)) Object.keys(pkg.meta).forEach(k => { if (isObj(pkg.meta[k])) p.meta[k] = pkg.meta[k]; });
    const id = p.device.id;
    if (isObj(p.keys['km-study-v1'])) p.keys['km-study-v1'] = normStudy(p.keys['km-study-v1'], id);
    if (isPet(p.keys['km-pet-v1'])) p.keys['km-pet-v1'] = normPet(p.keys['km-pet-v1'], id);
    return p;
  }

  /**
   * 合并两份数据包（collect() 的结果、导入文件、或上一次 merge 的 result），纯函数：不读写存储、不读当前时间。
   * 对称：merge(a,b) 与 merge(b,a) 的 result 相同；幂等；结合律：merge(merge(a,b),c) 与 merge(a,merge(b,c)) 相同。
   * 某个键只在一边有 = 另一边没有信息（不是删除）。
   * @return { result: { keys, meta }, report: { changed, items: [{ key, cat, name, text }], conflicts } }（report 以 a 为“本机”）
   */
  function merge(local, incoming) {
    const L = normalize(local), I = normalize(incoming);
    const all = Array.from(new Set(Object.keys(L.keys).concat(Object.keys(I.keys), Object.keys(L.meta), Object.keys(I.meta)))).filter(k => !INTERNAL.has(k)).sort();
    const keys = {}, meta = {}, before = {};
    all.forEach(k => {
      const sa = { val: L.keys[k], meta: L.meta[k] || {}, dev: L.device.id };
      const r = mergeKey(byKey[k], sa, { val: I.keys[k], meta: I.meta[k] || {}, dev: I.device.id });
      if (r.val !== undefined) keys[k] = r.val;
      if (r.meta && Object.keys(r.meta).length) meta[k] = r.meta;
      // 报告拿“本机自己合并一次”的规范形式比较：只是顺序、重复、由别的字段算出的值不同，不算变化
      if (L.keys[k] !== undefined) { const c = mergeKey(byKey[k], sa, sa).val; if (c !== undefined) before[k] = sortDeep(c); }
    });
    const result = sortDeep({ keys, meta });
    return { result, report: makeReport(before, I, result) };
  }

  /* ---------------- 合并报告（给学生看的变化清单） ---------------- */
  function petCore(st) { const c = Object.assign({}, st); delete c.fullness; delete c.tick; return c; }
  function sameKey(spec, a, b) {
    if (spec && spec.merge === 'pet' && isObj(a) && isObj(b)) return same(petCore(a), petCore(b));
    return same(a, b);
  }
  function okFn(key) {
    const s = window.KMStudy && KMStudy.SOURCES.find(x => x.key === key);
    return s ? s.ok : null;
  }
  const countIf = (o, f) => Object.keys(isObj(o) ? o : {}).filter(id => o[id] && f(o[id])).length;
  function studyMinutes(st) {
    const days = isObj(st) ? (isObj(st.byDev) ? sumDays(st.byDev) : st.days || {}) : {};
    let s = 0;
    Object.keys(days).forEach(d => Object.keys(days[d] || {}).forEach(k => { s += +days[d][k] || 0; }));
    return Math.round(s / 60);
  }
  function draftCount(d) {
    let n = 0;
    Object.keys(isObj(d) ? d : {}).forEach(id => Object.keys(isObj(d[id]) ? d[id] : {}).forEach(q => { if (d[id][q] && String(d[id][q].text || '').trim()) n++; }));
    return n;
  }
  function petLevel(xp) { return window.KMPet ? KMPet.level(xp || 0) : 1; }
  function makeReport(LK, I, result) {
    const items = [];
    let conflicts = 0;
    const order = k => { const i = KEYS.findIndex(s => s.key === k); return i < 0 ? KEYS.length : i; };
    Object.keys(result.keys).sort((x, y) => order(x) - order(y) || cmp(x, y)).forEach(k => {
      const spec = byKey[k], before = LK[k], after = result.keys[k];
      if (sameKey(spec, before, after)) return;
      const name = spec ? spec.name : k;
      const parts = [];
      const kind = spec ? spec.merge : 'other';
      const b = isObj(before) ? before : {}, a = isObj(after) ? after : {};
      if (kind === 'progress' || kind === 'mathProgress') {
        const added = Object.keys(a).filter(id => !hasOwn(b, id)).length;
        const better = Object.keys(a).filter(id => isObj(b[id]) && isObj(a[id]) && (+a[id].best || 0) > (+b[id].best || 0)).length;
        const gone = Object.keys(b).filter(id => !hasOwn(a, id)).length;
        const upd = Object.keys(a).filter(id => hasOwn(b, id) && !same(a[id], b[id])).length;
        if (added) parts.push('新增 ' + added + ' 个知识点记录');
        if (better) parts.push(better + ' 个最好成绩提高');
        const ok = okFn(k);
        if (ok) { const m0 = countIf(b, ok), m1 = countIf(a, ok); if (m0 !== m1) parts.push('已掌握 ' + m0 + ' → ' + m1); }
        if (gone) parts.push('去掉 ' + gone + ' 个知识点记录（另一台设备上重置过）');
        if (upd > better) parts.push((upd - better) + ' 个知识点的最近成绩、浏览时间等有更新');
      } else if (kind === 'mathWrong') {
        const plus = Object.keys(a).filter(id => !hasOwn(b, id)).length, minus = Object.keys(b).filter(id => !hasOwn(a, id)).length;
        if (plus || minus) parts.push('+' + plus + '、−' + minus + '（现在共 ' + Object.keys(a).length + ' 道）');
        const upd = Object.keys(a).filter(id => hasOwn(b, id) && !same(a[id], b[id])).length;
        if (upd) parts.push(upd + ' 道错题的做错次数或时间有更新');
      } else if (kind === 'drafts') {
        let c = 0;
        const m = (result.meta[k]) || {};
        Object.keys(a).forEach(id => Object.keys(isObj(a[id]) ? a[id] : {}).forEach(q => {
          const vers = m[id] && m[id].vers && m[id].vers[q];
          const old = isObj(b[id]) && isObj(b[id][q]) ? b[id][q].text : undefined;
          if (vers && computeDraft(vers).n > 1 && old !== a[id][q].text) c++;
        }));
        conflicts += c;
        const d0 = draftCount(before), d1 = draftCount(after);
        if (d1 > d0) parts.push('新增 ' + (d1 - d0) + ' 篇');
        if (c) parts.push(c + ' 篇两台设备写的不一样，两份都保留了');
        let edited = 0;
        Object.keys(a).forEach(id => Object.keys(isObj(a[id]) ? a[id] : {}).forEach(q => {
          const o = isObj(b[id]) && isObj(b[id][q]) ? b[id][q] : undefined;
          if (o && !same(o, a[id][q])) edited++;
        }));
        if (edited > c) parts.push((edited - c) + ' 篇换成了另一台设备上较新的版本');
      } else if (kind === 'study') {
        const m0 = studyMinutes(before), m1 = studyMinutes(after);
        if (m0 !== m1) parts.push('总时长 ' + m0 + ' → ' + m1 + ' 分钟');
        else parts.push('补上了另一台设备的学习记录（总时长仍约 ' + m1 + ' 分钟）');
      } else if (kind === 'pet' && isPet(after)) {
        if (!isPet(before)) parts.push('恢复小狗「' + after.name + '」：Lv.' + petLevel(after.xp) + '，' + after.bones + ' 根骨头');
        else {
          const other = I.keys[k];
          if (isPet(other) && (other.born !== before.born)) parts.push('两只小狗合并为「' + after.name + '」');
          else if (before.name !== after.name) parts.push('名字改为「' + after.name + '」');
          if (before.bones !== after.bones) parts.push('骨头 ' + before.bones + ' → ' + after.bones);
          const x0 = uniqClaimed(before), x1 = uniqClaimed(after);
          if (x1 !== x0) parts.push('已领知识点 ' + (x1 > x0 ? '+' : '−') + Math.abs(x1 - x0) + '（共 ' + x1 + ' 个）');
          const own0 = new Set(before.owned || []).size, own1 = new Set(after.owned || []).size;
          if (own1 !== own0) parts.push('装扮 ' + own0 + ' → ' + own1 + ' 件');
          if (!same(before.equip || {}, after.equip || {})) parts.push('换上了另一台设备的穿戴');
          if (before.breed !== after.breed && !(isPet(other) && other.born !== before.born)) parts.push('品种改为另一台设备上的');
          if (before.petDay !== after.petDay || (+before.petCount || 0) !== (+after.petCount || 0)) parts.push('今天摸摸的次数有更新');
          if (!parts.length) parts.push('补上了另一台设备的喂食、学习记录（骨头、等级不变）');
        }
      } else if (kind === 'dictation') {
        const bl = Array.isArray(b.lists) ? b.lists : [], al = Array.isArray(a.lists) ? a.lists : [];
        const ids = new Set(bl.map(l => l.id));
        const plus = al.filter(l => !ids.has(l.id)).length;
        const minus = bl.filter(l => !al.some(x => x.id === l.id)).length;
        const upd = al.filter(l => ids.has(l.id) && !same(l, bl.find(x => x.id === l.id))).length;
        if (plus) parts.push('新增 ' + plus + ' 个词单');
        if (minus) parts.push('删除 ' + minus + ' 个词单');
        if (upd) parts.push(upd + ' 个词单有更新');
        if (!same(b.settings, a.settings)) parts.push('听写设置换成较新的');
      }
      if (!parts.length) {
        if (before === undefined) parts.push('新增');
        else if (kind === 'whole') parts.push(typeof after === 'string' || typeof after === 'number' ? '改为 ' + after + '（另一台设备上较新的设置）' : '换成另一台设备上较新的结果');
        else parts.push('有细节更新');
      }
      items.push({ key: k, cat: spec ? spec.cat : 'other', name, text: parts.join('，') });
    });
    return { changed: items.length > 0, items, conflicts, total: Object.keys(result.keys).length };
  }

  /* ---------------- 导出、导入、应用 ---------------- */
  /** 读出本机所有学习数据，返回导出包 { app:'km-all', schema, exported, appVersion, device:{id,name}, keys, meta } */
  function collect() {
    flush();
    const d = device(), keys = {}, meta = loadMeta();
    KEYS.forEach(s => {
      let v;
      if (s.store === 'shared' && hasShared) {
        const sh = sharedRead(s.key);
        v = sh ? sh.value : undefined;
        if (sh && isObj(sh.meta) && Object.keys(sh.meta).length) meta[s.key] = sh.meta; else delete meta[s.key];
      } else v = readLocal(s.key);
      if (v !== undefined) keys[s.key] = v;
    });
    extras().forEach(k => { const v = readLocal(k); if (v !== undefined) keys[k] = v; });
    INTERNAL.forEach(k => delete meta[k]);
    let appVersion = '';
    try { if (B && B.appVersion) appVersion = String(B.appVersion()); } catch (e) { /* 忽略 */ }
    return { app: 'km-all', schema: SCHEMA, exported: new Date().toISOString(), appVersion, device: { id: d.id, name: d.name }, keys, meta };
  }
  // 导入文件里带来的、本版本不认识的键（以后的新科目），记下来下次导出时一起带上
  function extras() { const e = readLocal(EXTRA); return Array.isArray(e) ? e.filter(k => typeof k === 'string' && !byKey[k] && !INTERNAL.has(k)) : []; }

  /** 把 merge 的 result 写回本机：localStorage + 听写词单写到原生共享存储；写入不会产生新的修改时间；最后同步桌面小狗 */
  function apply(result) {
    flush();
    if (!ls) throw new Error('no storage');
    muted++;
    try {
      const ex = new Set(extras());
      const meta = clone(result.meta || {});
      Object.keys(result.keys).forEach(k => {
        const spec = byKey[k], v = result.keys[k];
        if (INTERNAL.has(k)) return;
        if (spec && spec.store === 'shared' && hasShared) {
          sharedWrite(k, v, meta[k]);
          delete meta[k];                // 这份修改记录跟着共享存储走
          return;
        }
        rawSet(k, toRaw(v));
        if (!spec) ex.add(k);
      });
      INTERNAL.forEach(k => delete meta[k]);
      saveMeta(prune(meta, Date.now()));
      rawSet(EXTRA, JSON.stringify(Array.from(ex).sort()));
      KEYS.forEach(s => takeSnap(s.key));
    } finally { muted--; }
    try { if (window.KMPet) KMPet.syncWidget(); } catch (e) { /* 忽略 */ }
  }

  /** 识别导入文件：全量文件，或各科旧的单科导出文件。返回 { ok, pkg, error, legacy } */
  function parseFile(text) {
    const bad = { ok: false, error: '这个文件不是知识图谱的备份文件' };
    let data;
    try { data = JSON.parse(String(text).replace(/^﻿/, '')); } catch (e) { return bad; }
    if (!isObj(data)) return bad;
    if (data.app === 'km-all') {
      if (!(+data.schema >= 1)) return bad;
      if (+data.schema > SCHEMA) return { ok: false, error: '这个文件来自更新版本的 App，请先升级' };
      if (!isObj(data.keys)) return bad;
      return { ok: true, pkg: { device: isObj(data.device) ? data.device : {}, keys: data.keys, meta: isObj(data.meta) ? data.meta : {}, exported: data.exported } };
    }
    const prefix = LEGACY[data.app];
    if (prefix && isObj(data.progress)) {
      const keys = {};
      keys[prefix + '-progress-v1'] = data.progress;
      if (isObj(data.drafts)) keys[prefix + '-drafts-v1'] = data.drafts;
      return { ok: true, legacy: byKey[prefix + '-progress-v1'].name, pkg: { device: { id: 'legacy-' + data.app, name: '旧的单科备份' }, keys, meta: {}, exported: data.exported } };
    }
    return bad;
  }

  /** 听写页（https 虚拟地址）打开时：本地词单和原生共享存储里的那份合并，两边都更新成合并结果 */
  function syncShared() {
    if (!hasShared || !ls || location.protocol === 'file:') return;
    const me = device().id;
    KEYS.filter(s => s.store === 'shared').forEach(s => {
      const sh = sharedRead(s.key), local = readLocal(s.key), meta = loadMeta();
      if (!sh && local === undefined) return;
      const pk = (v, m) => { const p = { device: { id: me }, keys: {}, meta: {} }; if (v !== undefined) p.keys[s.key] = v; if (isObj(m)) p.meta[s.key] = m; return p; };
      const r = merge(pk(local, meta[s.key]), pk(sh ? sh.value : undefined, sh && sh.meta)).result;
      const v = r.keys[s.key], m = r.meta[s.key];
      if (!same(v, local) || !same(m, meta[s.key])) {
        muted++;
        try {
          if (v !== undefined) rawSet(s.key, toRaw(v));
          if (m) meta[s.key] = m; else delete meta[s.key];
          saveMeta(meta);
          takeSnap(s.key);
        } finally { muted--; }
      }
      if (!sh || !same(v, sh.value) || !same(m || {}, sh.meta || {})) sharedWrite(s.key, v, m);
    });
  }

  /** 本机数据概览（「我的数据」页用） */
  function summary(pkg) {
    const k = pkg.keys, S = window.KMStudy, out = { subjects: [], wrong: 0, drafts: 0, minutes: 0, pet: null, lists: 0 };
    if (S) S.SOURCES.forEach(s => {
      const p = isObj(k[s.key]) ? k[s.key] : {};
      out.subjects.push({ key: s.key, name: s.name, mastered: countIf(p, s.ok), records: Object.keys(p).length });
    });
    out.wrong = Object.keys(isObj(k['mathmap-wrong-v1']) ? k['mathmap-wrong-v1'] : {}).length;
    KEYS.filter(s => s.merge === 'drafts').forEach(s => { out.drafts += draftCount(k[s.key]); });
    out.minutes = studyMinutes(k['km-study-v1']);
    const pet = k['km-pet-v1'];
    if (isPet(pet)) out.pet = { name: pet.name, level: petLevel(pet.xp), bones: pet.bones };
    const dict = k[DICT];
    out.lists = isObj(dict) && Array.isArray(dict.lists) ? dict.lists.length : 0;
    return out;
  }

  function stamp(withTime) {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + (withTime ? '-' + pad(d.getHours()) + pad(d.getMinutes()) : '');
  }
  const fileName = () => '知识图谱-全部学习数据-' + stamp() + '.json';
  const backupName = () => '知识图谱-导入前备份-' + stamp(true) + '.json';

  window.KMData = {
    SCHEMA, KEYS, META, DEVICE,
    device, collect, merge, apply, parseFile, summary, fileName, backupName,
    // 小狗和学习时长用：骨头公式、迁移
    petBones, normPet, normStudy, ownedPrice, uniqClaimed,
    // 草稿正文的算法（同步层显示用）
    computeDraft,
    // 测试和调试用
    _flush: flush, _canon: canon, _resetDevice: () => { dev = null; }, _itemsOf: (key, v) => itemsOf(byKey[key], v), _sharedRead: sharedRead
  };

  syncShared();
})();
