// 设备同步（需求 #1；第一期经同步节点，第二期加局域网直连）：网页这一侧。打包时注入每个页面（排在 km-reward.js 后面）；sync.html、测试页直接引用。
// 局域网只是 Java 里的第二条传输路：分区、收件箱、合并和节点完全一样，这个文件不用分是从哪条路来的。
//
// 分工：Java 同步内核负责密钥、加密、组名单、和同步节点收发；网页只交「明文分区」、取「明文分区」，拿不到任何密钥。
// 1. 分区：#2 的每个键一个分区，内容是规范化 JSON { k: 键名, data: 键值, meta: km-meta-v1[键名], s: schema }（KMData._canon，键名排序、无空格）
// 2. 发布：本机数据变了（km-data-change 之后 5 秒）、切后台或离开页面、合并完以后、刚进组（建组 / 加入 / 配对成功）时，collect() → 分区 → KMApp.syncPublish
//    任何 file:// 页面都能发布（只读不写）；Java 只给内容变了的分区换新版本
// 3. 合并：只在安全页面（总入口、设备同步、我的数据、学习统计）写本机：syncTake() 取出收件箱 → 按来源设备逐个 KMData.merge →
//    有变化就 apply → 重新发布 → syncAck；其它页面（图谱页、宠物页）的 app.js 把数据放在内存里，在它们底下改 localStorage
//    会被覆盖，所以收到的数据先留在原生收件箱，回到总入口再合并
// 4. Java 用 window.__kmSyncEvent(type, json) 通知（只发主页面）：state / inbox / join-code / join-request / join-result / action-result，
//    第二期加 pair-open / peers / pair-request / pair-result / pair-close（局域网配对，只有设备同步页用），
//    这里转成 window 事件 'km-sync'（detail = { type, data }）
// 普通浏览器里没有 KMApp.syncState：只定义 KMSync 的纯函数（测试页用），什么也不做。
(function () {
  if (window.KMSync) return;

  const SAFE = ['index.html', 'sync.html', 'data.html', 'pet/study.html'];
  const PUBLISH_DELAY = 5000;
  let B = null;                // 桥：KMApp（App 里）或测试页注入的模拟桥
  let pubTimer = 0, merging = false, lastPub = '';

  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const canon = v => (window.KMData && KMData._canon) ? KMData._canon(v) : JSON.stringify(v);

  /* ---------------- 纯函数（测试页直接测） ---------------- */

  /** 导出包 → 分区 [{ name, content }]，按名字排序 */
  function sections(pkg) {
    const keys = isObj(pkg && pkg.keys) ? pkg.keys : {}, meta = isObj(pkg && pkg.meta) ? pkg.meta : {};
    const schema = window.KMData ? KMData.SCHEMA : 1;
    const internal = new Set(window.KMData ? [KMData.META, KMData.DEVICE, 'km-data-extra-v1'] : []);
    const names = Array.from(new Set(Object.keys(keys).concat(Object.keys(meta)))).filter(k => !internal.has(k) && k !== 'group').sort();
    return names.map(k => {
      const o = { k, s: schema };
      if (keys[k] !== undefined) o.data = keys[k];
      if (isObj(meta[k]) && Object.keys(meta[k]).length) o.meta = meta[k];
      return { name: k, content: canon(o) };
    });
  }

  /** 解析收件箱里的一个分区；不认识、schema 比本机新的返回 null（留在收件箱，等升级） */
  function parseSection(t) {
    let o;
    try { o = JSON.parse(t.content); } catch (e) { return null; }
    if (!isObj(o) || typeof o.k !== 'string' || o.k !== t.name) return null;
    const schema = window.KMData ? KMData.SCHEMA : 1;
    if (+o.s > schema) return { newer: true };
    return o;
  }

  /**
   * 把收件箱并进本机数据包。taken = syncTake() 的结果 [{ id, rev, dev, devName, name, content }]。
   * 按来源设备分组，每台拼成一个 incoming 包，依次 KMData.merge（merge 满足结合律，先后顺序不影响结果）。
   * @return { result: 合并后的包, changed, reports: [{ dev, devName, report }], acks: [{ id, rev }], newer: 因版本太新没合并的分区数 }
   */
  function mergeTaken(local, taken) {
    const byDev = {}, acks = [];
    let newer = 0;
    (taken || []).forEach(t => {
      const o = parseSection(t);
      if (!o) { acks.push({ id: t.id, rev: t.rev }); return; }        // 坏的分区：丢掉
      if (o.newer) { newer++; return; }                                   // 来自更新版本的 App：留着
      const d = byDev[t.dev] || (byDev[t.dev] = { device: { id: t.dev, name: t.devName || '' }, keys: {}, meta: {} });
      if (o.data !== undefined) d.keys[o.k] = o.data;
      if (isObj(o.meta)) d.meta[o.k] = o.meta;
      acks.push({ id: t.id, rev: t.rev });
    });
    let cur = { device: local.device, keys: local.keys || {}, meta: local.meta || {} };
    const reports = [];
    let changed = false;
    Object.keys(byDev).sort().forEach(dev => {
      const r = KMData.merge(cur, byDev[dev]);
      if (r.report.changed) { changed = true; reports.push({ dev, devName: byDev[dev].device.name, report: r.report }); }
      cur = { device: local.device, keys: r.result.keys, meta: r.result.meta };
    });
    if (!changed) changed = canon(cur.keys) !== canon(local.keys || {}) || canon(cur.meta) !== canon(local.meta || {});
    return { result: cur, changed, reports, acks, newer };
  }

  /** 合并报告 → 一句提示 */
  function reportText(reports) {
    if (!reports || !reports.length) return '';
    return reports.map(r => {
      const items = (r.report.items || []).slice(0, 4).map(i => i.name + ' ' + i.text);
      const more = (r.report.items || []).length > 4 ? ' 等' : '';
      return '从「' + (r.devName || '另一台设备') + '」同步：' + items.join('；') + more;
    }).join('\n');
  }

  /** 状态 → 总入口右上角标签文字（没加入组时为空，不显示） */
  function tagText(st) {
    if (!st || !st.inGroup) return '';
    if (st.status === 'syncing') return '⟳ 同步中';
    if (st.status === 'error' || st.status === 'offline') return '⚠ 同步出错';
    if (st.status === 'ok') return '✓ 已同步';
    return '待同步';
  }

  /** 状态 → 同步页顶部的一句话 */
  function statusText(st) {
    if (!st) return '';
    if (!st.inGroup) return st.notice || '还没开始同步';
    if (st.status === 'syncing') return '正在同步…';
    if (st.status === 'offline') return '同步节点连不上，本机照常学习，连上网后会自动补齐';
    if (st.status === 'error') return st.error || '同步出错';
    const others = (st.members || []).filter(m => !m.me && m.last).sort((a, b) => b.last - a.last);
    if (st.status === 'ok') {
      const t = st.lastOk ? fmtTime(st.lastOk) : '';
      // 节点连不上、局域网照常（第二期）：照样是已同步，后面说清楚
      return '已同步' + (t ? ' · ' + t : '') + (st.error ? ' · ' + st.error : others.length ? ' · 最近收到「' + others[0].name + '」的改动' : '');
    }
    // 只在局域网同步的组（没有同步节点）：附近没有组员时说清楚为什么还没同步
    if (!st.node && st.lan) {
      if (!st.lan.on) return '有改动等待同步：没连 Wi-Fi。连上和其它设备同一个 Wi-Fi 后会自动同步';
      if (!(st.lan.online || []).length) return '附近没有找到你的设备（要连同一个 Wi-Fi，两台都打开 App），找到后会自动同步';
    }
    return '有改动等待同步';
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtTime(t) {
    const d = new Date(t), now = new Date();
    const hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
    if (d.toDateString() === now.toDateString()) return '今天 ' + hm;
    return (d.getMonth() + 1) + '-' + d.getDate() + ' ' + hm;
  }

  function isSafePage(loc) {
    loc = loc || location;
    if (loc.protocol !== 'file:') return false;
    const p = decodeURIComponent(loc.pathname).replace(/\\/g, '/');
    const i = p.indexOf('/android_asset/www/');
    if (i < 0) return false;
    return SAFE.indexOf(p.substring(i + '/android_asset/www/'.length)) >= 0;
  }

  /* ---------------- 有桥时：发布、合并、事件 ---------------- */

  function state() {
    if (!B || !B.syncState) return null;
    try { const s = B.syncState(); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }

  /** 读出本机数据、按分区发布（只读，不改本机） */
  function publish() {
    clearTimeout(pubTimer);
    pubTimer = 0;
    if (!B || !window.KMData) return 0;
    const st = state();
    if (!st || !st.inGroup) return 0;
    const pkg = KMData.collect();
    const secs = sections(pkg);
    const body = JSON.stringify({ device: pkg.device, sections: secs });
    if (body === lastPub) return 0;
    lastPub = body;
    B.syncPublish(body);
    return secs.length;
  }

  function schedulePublish(ms) {
    if (!B) return;
    clearTimeout(pubTimer);
    pubTimer = setTimeout(publish, ms == null ? PUBLISH_DELAY : ms);
  }

  /**
   * 安全页面上合并收件箱。opts.force：测试页在非安全页面上也合并。
   * 返回 { merged, text }；合并完发 window 事件 'km-sync-merged'（总入口据此刷新小狗卡片、各科状态）
   */
  function mergeNow(opts) {
    if (!B || !window.KMData || merging) return { merged: false };
    if (!(opts && opts.force) && !isSafePage()) return { merged: false };
    let taken;
    try { taken = JSON.parse(B.syncTake() || '[]'); } catch (e) { taken = []; }
    if (!Array.isArray(taken) || !taken.length) return { merged: false };
    merging = true;
    try {
      const local = KMData.collect();
      const m = mergeTaken(local, taken);
      if (m.changed) KMData.apply(m.result);
      publish();
      if (m.acks.length) B.syncAck(JSON.stringify(m.acks));
      const text = reportText(m.reports);
      if (m.changed) {
        try { window.dispatchEvent(new CustomEvent('km-sync-merged', { detail: { text, reports: m.reports } })); } catch (e) { /* 忽略 */ }
        if (text) toast(text);
      }
      if (m.newer) toast('有 ' + m.newer + ' 项数据来自更新版本的 App，请把这台设备也升级到最新版');
      return { merged: m.changed, text };
    } finally { merging = false; }
  }

  // 提示框只是看的：任何时候都不接收点击（pointer-events:none），淡出后从页面上移除，不会挡住下面的按钮
  function toast(text, ms) {
    if (!document.body) return;
    let el = document.getElementById('km-sync-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'km-sync-toast';
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);max-width:min(92vw,560px);z-index:99999;' +
        'background:rgba(30,32,36,.94);color:#fff;padding:12px 16px;border-radius:12px;font:15px/1.5 system-ui,"Microsoft YaHei",sans-serif;' +
        'white-space:pre-line;box-shadow:0 6px 24px rgba(0,0,0,.25);transition:opacity .3s;pointer-events:none;';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    clearTimeout(el._t);
    clearTimeout(el._r);
    el._t = setTimeout(() => {
      el.style.opacity = '0';
      el._r = setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
    }, ms || 6000);
  }

  function onEvent(type, json) {
    let data = {};
    try { data = json ? JSON.parse(json) : {}; } catch (e) { data = {}; }
    if (type === 'inbox') mergeNow();
    // 刚进组（扫邀请码建组 / 扫加入码加入 / 局域网配对，两边都算）：本机数据马上发布进组，再同步一轮。
    // 设备同步页打开时还没在组里，publish() 那时什么也没发；不在这里补发，本机分区要等到离开页面或数据变了才进组，
    // 第一次同步就停在一半（#1 第二期真机验收第 1 条）
    if ((type === 'state' && data && data.joined !== undefined) || ((type === 'join-result' || type === 'pair-result') && data && data.ok)) {
      lastPub = '';
      publish();
      const s = state();
      if (s && s.inGroup && B && B.syncNow) B.syncNow();
    }
    try { window.dispatchEvent(new CustomEvent('km-sync', { detail: { type, data } })); } catch (e) { /* 忽略 */ }
  }

  function init(bridge) {
    B = bridge;
    try { Object.defineProperty(window, '__kmSyncEvent', { value: onEvent, writable: false, configurable: !!window.__kmSyncTest }); }
    catch (e) { window.__kmSyncEvent = onEvent; }
    window.addEventListener('km-data-change', () => schedulePublish());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') publish(); });
    window.addEventListener('pagehide', () => publish());
    const start = () => { publish(); mergeNow(); };
    if (B.ready) B.ready().then(start); else start();
  }

  window.KMSync = {
    sections, mergeTaken, reportText, tagText, statusText, isSafePage, fmtTime,
    publish, mergeNow, state, toast,
    // 测试页：注入模拟桥（App 里自动用 KMApp）
    _init: init, _reset: () => { lastPub = ''; }
  };

  const A = window.KMApp;
  if (A && A.syncState && location.protocol === 'file:') init(A);
})();
