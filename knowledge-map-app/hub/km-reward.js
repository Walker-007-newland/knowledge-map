// 掌握一个知识点就当场发奖励：打包时注入每个页面（排在 km-study.js、pet/pet-core.js 后面），只在图谱页里起作用
// 各图谱把进度写进 localStorage 时，顺手看看有没有新掌握的知识点；有就立刻把骨头记到小狗身上，并弹出提示
// 没领养小狗时先不领（留到领养后在宠物页一起领），只提示一下
(function () {
  const S = window.KMStudy, P = window.KMPet;
  // https 虚拟地址上的页面（单词听写）用的是另一份 localStorage，读不到进度和小狗，不在那里发奖励
  if (window.__kmReward || !S || !P || location.hostname === 'appassets.androidplatform.net') return;
  const path = decodeURIComponent(location.pathname);
  const src = S.SOURCES.find(s => path.indexOf(s.path) >= 0);
  if (!src) return;
  window.__kmReward = 1;

  /* ---------------- 提示框 ---------------- */
  const css = document.createElement('style');
  css.textContent = `
  .km-reward { position: fixed; left: 50%; bottom: 24px; z-index: 9999; display: flex; align-items: center; gap: 12px; max-width: min(92vw, 460px);
    padding: 12px 18px 12px 14px; border-radius: 18px; background: #fff8ec; color: #4a3210; border: 1px solid #f0d3a4;
    box-shadow: 0 10px 30px rgba(60, 40, 10, .25); font: 15px/1.45 "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
    transform: translate(-50%, 140%); transition: transform .35s cubic-bezier(.2, 1.3, .4, 1); pointer-events: auto; cursor: pointer; }
  .km-reward.show { transform: translate(-50%, 0); }
  .km-reward .dog { font-size: 36px; line-height: 1; animation: kmHop .6s ease-in-out 2; }
  .km-reward b { color: #b55d12; }
  .km-reward small { display: block; color: #8a6a3a; font-size: 13px; }
  @keyframes kmHop { 50% { transform: translateY(-8px) rotate(-8deg); } }`;
  document.head.appendChild(css);

  let box = null, hideTimer = 0;
  function show(html, sub) {
    if (!box) {
      box = document.createElement('div');
      box.className = 'km-reward';
      box.setAttribute('role', 'status');
      box.onclick = () => box.classList.remove('show');
      document.body.appendChild(box);
    }
    box.innerHTML = '<span class="dog">🐕</span><span>' + html + (sub ? '<small>' + sub + '</small>' : '') + '</span>';
    requestAnimationFrame(() => box.classList.add('show'));
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => box.classList.remove('show'), 4500);
  }

  // 知识点名称：数学 MAP.nodes 是 [id, 名称, ...]，其他科 KG.nodes 是 {id, title}
  function titleOf(id) {
    const list = (window.KG && KG.nodes) || (window.MAP && MAP.nodes) || [];
    for (const n of list) {
      if (Array.isArray(n) ? n[0] === id : n && n.id === id) return Array.isArray(n) ? n[1] : (n.title || n.name || '');
    }
    return '';
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- 发现新掌握的知识点 ---------------- */
  // 没领养时只提示“这次打开页面后新掌握的”：先记下打开时已经掌握的，同一个知识点也只提示一次
  const told = new Set(P.pending({ claimed: {} }).filter(x => x.key === src.key).map(x => x.id));
  function check() {
    const st = P.load();
    if (!st) {
      const fresh = P.pending({ claimed: {} }).filter(x => x.key === src.key && !told.has(x.id));
      if (!fresh.length) return;
      fresh.forEach(x => told.add(x.id));
      const t = titleOf(fresh[0].id);
      show('掌握了' + (t ? '「' + esc(t) + '」' : '新知识点') + '！', '去总入口领养一只小狗，就能把奖励的骨头喂给它');
      return;
    }
    P.tick(st);
    const list = P.pending(st);
    if (!list.length) return;
    const before = P.stage(P.level(st.xp)).name;
    const r = P.claim(st);
    if (!r.n) return;
    const L = P.level(st.xp), now = P.stage(L).name;
    const mine = list.filter(x => x.key === src.key);
    const t = mine.length === 1 ? titleOf(mine[0].id) : '';
    const what = t ? '掌握了「' + esc(t) + '」' : '掌握了 ' + r.n + ' 个知识点';
    let sub = esc(st.name) + '的骨头：' + st.bones + ' 根';
    if (r.levelUp) sub = before !== now ? esc(st.name) + '长大了，变成' + now + '（Lv.' + L + '）！' : esc(st.name) + '升到 Lv.' + L + ' 了！';
    else if (st.fullness < P.HUNGRY) sub += '　它饿了，记得去喂它';
    show(what + '！奖励 <b>' + r.bones + ' 根骨头</b>', sub);
  }

  // 各图谱存进度用的是 localStorage.setItem，包一层：写的是本科进度就检查一次
  const setItem = Storage.prototype.setItem;
  let pending = 0;
  Storage.prototype.setItem = function (k, v) {
    setItem.call(this, k, v);
    if (k === src.key && this === window.localStorage && !pending) pending = setTimeout(() => { pending = 0; try { check(); } catch (e) { /* 忽略 */ } }, 300);
  };
  // 打开页面时：之前在别处掌握、还没领的也一起发
  addEventListener('load', () => { setTimeout(() => { try { check(); } catch (e) { /* 忽略 */ } }, 800); });
  // 离开图谱时同步一次小部件（今天学了多少分钟）
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') P.syncWidget(); });
})();
