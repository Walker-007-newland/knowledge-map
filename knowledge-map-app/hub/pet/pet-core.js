// 宠物狗的数据与规则：总入口卡片和宠物页共用
// 不改各图谱的代码，只读它们存在 localStorage 里的进度，按“已掌握”的知识点发骨头
(function () {
  // 各图谱的进度键和“已掌握”的判定统一放在 km-study.js（要先加载它）
  const SOURCES = window.KMStudy.SOURCES;
  const STORE = 'km-pet-v1';
  const BONES_PER_NODE = 3;     // 每掌握一个知识点得 3 根骨头
  const FEED_COST = 1;          // 喂一次 1 根骨头
  const FEED_GAIN = 20;         // 喂一次饱食度 +20
  const DECAY_PER_HOUR = 1;     // 饱食度每小时 -1，一天大约 -24
  const HUNGRY = 30;

  const BREEDS = {
    shiba: { name: '柴犬', desc: '活泼机灵，爱笑' },
    husky: { name: '哈士奇', desc: '精力旺盛，爱玩' }
  };

  // 成长阶段：scale 是模型大小
  const STAGES = [
    { from: 1, name: '幼犬', scale: 0.6 },
    { from: 4, name: '少年犬', scale: 0.78 },
    { from: 8, name: '成年犬', scale: 0.94 },
    { from: 13, name: '学霸犬', scale: 1.04 }
  ];

  // 装扮：slot 同一部位只能戴一件；lv 是解锁等级；price 是骨头
  const ITEMS = [
    { id: 'collar', slot: 'neck', name: '红项圈', price: 5, lv: 1 },
    { id: 'bow', slot: 'neck', name: '蝴蝶结', price: 12, lv: 2 },
    { id: 'scarf', slot: 'neck', name: '针织围巾', price: 18, lv: 3 },
    { id: 'bell', slot: 'neck', name: '金铃铛项圈', price: 25, lv: 5 },
    { id: 'party', slot: 'head', name: '生日帽', price: 8, lv: 1 },
    { id: 'gradcap', slot: 'head', name: '学士帽', price: 20, lv: 3 },
    { id: 'wizard', slot: 'head', name: '魔法帽', price: 40, lv: 7 },
    { id: 'crown', slot: 'head', name: '皇冠', price: 80, lv: 12 },
    { id: 'glasses', slot: 'face', name: '圆框眼镜', price: 10, lv: 2 },
    { id: 'shades', slot: 'face', name: '墨镜', price: 18, lv: 4 },
    { id: 'backpack', slot: 'back', name: '小书包', price: 25, lv: 5 },
    { id: 'cape', slot: 'back', name: '超人披风', price: 50, lv: 9 }
  ];
  const SLOTS = { head: '头部', face: '脸部', neck: '脖子', back: '背部' };

  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }

  // 当前所有已掌握的知识点：{ key: [id, ...] }
  function mastered() {
    const out = {};
    SOURCES.forEach(s => {
      const prog = readJSON(s.key) || {};
      out[s.key] = Object.keys(prog).filter(id => prog[id] && s.ok(prog[id]));
    });
    return out;
  }

  function load() {
    const st = readJSON(STORE);
    return st && st.breed ? st : null;
  }
  function save(st) {
    try { localStorage.setItem(STORE, JSON.stringify(st)); } catch (e) { /* 存不了就只在本次有效 */ }
  }

  function adopt(breed, name) {
    const now = Date.now();
    const st = {
      breed, name: (name || '').trim().slice(0, 8) || BREEDS[breed].name,
      born: now, tick: now, fullness: 70, bones: 0, xp: 0,
      claimed: {}, owned: [], equip: {}, petDay: '', petCount: 0, lastStudy: 0
    };
    save(st);
    return st;
  }

  // 按离开的时间扣饱食度
  function tick(st) {
    const now = Date.now();
    const hours = (now - (st.tick || now)) / 3600000;
    if (hours > 0) {
      st.fullness = Math.max(0, st.fullness - hours * DECAY_PER_HOUR);
      st.tick = now;
    }
    return st;
  }

  // 还没领骨头的新掌握知识点
  function pending(st) {
    const m = mastered();
    const list = [];
    SOURCES.forEach(s => {
      const got = new Set((st.claimed || {})[s.key] || []);
      m[s.key].forEach(id => { if (!got.has(id)) list.push({ key: s.key, id, subject: s.name }); });
    });
    return list;
  }

  // 领取：知识点记为已领，加骨头和经验；返回领到的个数和是否升级
  function claim(st) {
    const list = pending(st);
    if (!list.length) return { n: 0, bones: 0, levelUp: false };
    const before = level(st.xp);
    st.claimed = st.claimed || {};
    list.forEach(x => (st.claimed[x.key] = st.claimed[x.key] || []).push(x.id));
    st.xp += list.length;
    st.bones += list.length * BONES_PER_NODE;
    st.lastStudy = Date.now();
    save(st);
    return { n: list.length, bones: list.length * BONES_PER_NODE, levelUp: level(st.xp) > before };
  }

  // 等级：第 L 级需要累计掌握 2.5·L·(L-1) 个知识点（2 级 5 个，5 级 50 个，10 级 225 个，15 级 525 个）
  const need = L => Math.ceil(2.5 * L * (L - 1));
  function level(xp) {
    let L = 1;
    while (xp >= need(L + 1)) L++;
    return L;
  }
  function levelInfo(xp) {
    const L = level(xp), a = need(L), b = need(L + 1);
    return { level: L, cur: xp - a, span: b - a, next: b - xp };
  }
  function stage(L) {
    let s = STAGES[0];
    STAGES.forEach(x => { if (L >= x.from) s = x; });
    return s;
  }

  function feed(st) {
    if (st.bones < FEED_COST) return 'nobone';
    if (st.fullness >= 98) return 'full';
    st.bones -= FEED_COST;
    st.fullness = Math.min(100, st.fullness + FEED_GAIN);
    save(st);
    return 'ok';
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function petOnce(st) {
    const d = today();
    if (st.petDay !== d) { st.petDay = d; st.petCount = 0; }
    st.petCount++;
    save(st);
  }

  // 心情 0~100：吃饱、最近学习（今天学满 30 分钟最开心）、今天摸过都会让它开心
  function mood(st) {
    const daysSinceStudy = st.lastStudy ? (Date.now() - st.lastStudy) / 86400000 : 99;
    const S = window.KMStudy, todayMin = S.secondsOn(S.load(), S.dayKey()) / 60;
    const study = todayMin >= 30 ? 30 : todayMin >= 10 || daysSinceStudy < 1 ? 20 : daysSinceStudy < 3 ? 10 : 0;
    const pets = st.petDay === today() ? Math.min(st.petCount, 5) * 4 : 0;
    return Math.round(Math.min(100, st.fullness * 0.5 + study + pets));
  }

  function buy(st, id) {
    const it = ITEMS.find(x => x.id === id);
    if (!it || st.owned.includes(id)) return 'bad';
    if (level(st.xp) < it.lv) return 'locked';
    if (st.bones < it.price) return 'nobone';
    st.bones -= it.price;
    st.owned.push(id);
    st.equip[it.slot] = id;
    save(st);
    return 'ok';
  }
  function toggleEquip(st, id) {
    const it = ITEMS.find(x => x.id === id);
    if (!it || !st.owned.includes(id)) return;
    st.equip[it.slot] = st.equip[it.slot] === id ? null : id;
    save(st);
  }

  // 各科已领取（喂进成长里）的知识点个数
  function bySubject(st) {
    return SOURCES.map(s => ({ name: s.name, n: ((st.claimed || {})[s.key] || []).length }));
  }

  window.KMPet = {
    BREEDS, ITEMS, SLOTS, STAGES, HUNGRY, FEED_COST, BONES_PER_NODE,
    load, save, adopt, tick, pending, claim, level, levelInfo, stage, feed, petOnce, mood, buy, toggleEquip, bySubject
  };
})();
