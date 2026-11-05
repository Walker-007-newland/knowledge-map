// 间隔复习（艾宾浩斯遗忘曲线）：错题 / 错词 / 错句按 1、2、4、7、15、30 天安排复习
// 各模块页面按需引用（图谱页 <script src="../knowledge-map-app/hub/km-review.js">，打包时 build.ps1 改成 ../km-review.js），
// 总入口 index.html、汇总页 review.html 直接引用；纯函数，不读写存储（只有 summary 用的 today() 默认读当前时间）。
//
// 复习状态 sr = { s: 轮次 0–5（6 = 已掌握）, d: 下次复习日 'YYYY-MM-DD'（本地日期；'' = 马上该复习）, t: 这条复习记录的时间（毫秒） }
// 规则：
//   做错 → s=0，d=明天（按本地日期，不按 24 小时）
//   到期（d ≤ 今天）做对 → s+1，d=今天+间隔[s]（2、4、7、15、30 天）；第 6 轮（30 天那轮）做对 → s=6 已掌握，移出
//   没到期做对 → 不变（可以随时手动练，但不推进；做错照样从头来）
//   升级前就在错题本 / 错词本里的（没有 sr）→ 看作 s=0、今天到期，学生马上能看到；不写存储，任何一条都不会丢
// 合并（hub/km-data.js joinSr）：同一条取 t 较新的那份，t 相同取 JSON 文本较大的 —— 顺序无关、幂等、满足结合律
(function () {
  if (window.KMReview) return;

  const INTERVALS = [1, 2, 4, 7, 15, 30];
  const DONE = INTERVALS.length;                 // 6：已掌握
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const pad = n => (n < 10 ? '0' : '') + n;
  const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

  /** 本地日期 'YYYY-MM-DD' */
  function dayOf(ms) { const d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today(now) { return dayOf(now == null ? Date.now() : now); }
  /** 日期加 n 天（按日历，取中午算，不受夏令时影响） */
  function addDays(day, n) {
    const m = DAY_RE.exec(day || '');
    if (!m) return day;
    return dayOf(new Date(+m[1], +m[2] - 1, +m[3] + n, 12).getTime());
  }
  /** 两个日期相差几天（b − a） */
  function daysBetween(a, b) {
    const x = DAY_RE.exec(a || ''), y = DAY_RE.exec(b || '');
    if (!x || !y) return 0;
    return Math.round((Date.UTC(+y[1], +y[2] - 1, +y[3]) - Date.UTC(+x[1], +x[2] - 1, +x[3])) / 86400000);
  }

  /** 整理成 { s, d, t }；不是复习状态返回 null */
  function norm(sr) {
    if (!isObj(sr)) return null;
    const s = Math.max(0, Math.min(DONE, Math.floor(+sr.s) || 0));
    return { s, d: typeof sr.d === 'string' && DAY_RE.test(sr.d) ? sr.d : '', t: +sr.t || 0 };
  }
  const clean = st => ({ s: st.s, d: st.d, t: st.t });
  const active = st => !!st && st.s < DONE;
  /** 今天（day）该复习了：还没掌握，且下次复习日 ≤ 今天（'' = 马上） */
  const isDue = (st, day) => active(st) && (!st.d || st.d <= (day || today()));
  /** 做错：从第 1 轮重新开始，明天复习 */
  const fresh = now => ({ s: 0, d: addDays(today(now), INTERVALS[0]), t: now });
  /**
   * 复习一次的结果。st：复习前的状态（null = 不在复习里）；ok：做对了吗；now：时间。
   * 返回新状态；没变化时返回 st 本身（不在复习里又做对了 → null）
   */
  function advance(st, ok, now) {
    if (!ok) return fresh(now);
    if (!active(st)) return st;
    const day = today(now);
    if (!isDue(st, day)) return st;                // 没到期：手动练对不推进
    const s = st.s + 1;
    if (s >= DONE) return { s: DONE, d: day, t: now };
    return { s, d: addDays(day, INTERVALS[s]), t: now };
  }
  // 升级前就在错题本里、还没有复习记录的：今天到期（old 只用于显示，不存）
  const legacy = () => ({ s: 0, d: '', t: 0, old: 1 });
  // 旧版本 App 在这条有复习记录之后又记了一次「做错」（at / rt 比 sr.t 晚）：按那次做错算，第二天复习
  const wrongAt = t => ({ s: 0, d: addDays(dayOf(t), INTERVALS[0]), t });

  /* ---------- 各种存储格式 → 复习状态（不在复习里返回 null） ---------- */
  /** 逐词 / 逐句记录 { r, rt, sr }（英语单元单词、语文听写、默写、背诵）：r=0 最近一次做错 */
  function fromWord(rec) {
    if (!isObj(rec)) return null;
    const sr = norm(rec.sr), rt = +rec.rt || 0;
    if (rec.r === 0 && (!sr || rt > sr.t)) return sr ? wrongAt(rt) : legacy();
    return active(sr) ? sr : null;
  }
  /** 数学错题 { n, at, sr }：在错题本里就在复习里（掌握后条目删除） */
  function fromMath(item) {
    if (!isObj(item)) return null;
    const sr = norm(item.sr), at = +item.at || 0;
    if (!sr || at > sr.t) return sr ? wrongAt(at) : legacy();
    return active(sr) ? sr : null;
  }
  /** 英语听写词单 { wrong: { 词: 次数 }, sr: { 词: 状态 } } 里的一个词 */
  function fromDict(list, key) {
    if (!isObj(list)) return null;
    const sr = norm(isObj(list.sr) ? list.sr[key] : undefined);
    if (sr) return active(sr) ? sr : null;
    return isObj(list.wrong) && list.wrong[key] ? legacy() : null;
  }

  /* ---------- 记一次结果（直接改传入的对象） ---------- */
  /** 逐词记录：写 r、rt，按规则更新 sr。返回 { before, after }（after.s === 6 表示刚掌握） */
  function markWord(e, wrong, now) {
    const st = fromWord(e);
    e.r = wrong ? 0 : 1; e.rt = now;
    const nx = advance(st, !wrong, now);
    if (nx) e.sr = clean(nx);                      // 没到期时也写一次：把「旧版本做错」算出来的状态固定下来（同值不算修改）
    return { before: st, after: nx };
  }
  /** 数学错题本 book = { "id#题号": { n, at, sr } }：做错加进来；做对按规则推进，掌握了就删掉 */
  function markMath(book, k, wrong, now) {
    const cur = isObj(book[k]) ? book[k] : null;
    if (wrong) { book[k] = { n: ((cur && +cur.n) || 0) + 1, at: now, sr: fresh(now) }; return { before: cur && fromMath(cur), after: book[k].sr }; }
    if (!cur) return { before: null, after: null };
    const st = fromMath(cur), nx = advance(st, true, now);
    if (!active(nx)) { delete book[k]; return { before: st, after: nx || { s: DONE, d: today(now), t: now } }; }
    cur.sr = clean(nx);
    return { before: st, after: nx };
  }
  /** 听写词单里的一个词：wrong 计数照旧累加（不再因为写对删掉），sr 按规则更新 */
  function markDict(list, key, wrong, now) {
    const st = fromDict(list, key);
    if (!isObj(list.wrong)) list.wrong = {};
    if (!isObj(list.sr)) list.sr = {};
    if (wrong) list.wrong[key] = (+list.wrong[key] || 0) + 1;
    const nx = advance(st, !wrong, now);
    if (nx) list.sr[key] = clean(nx);
    return { before: st, after: nx };
  }

  /* ---------- 显示、排序 ---------- */
  function mdOf(day) { const m = DAY_RE.exec(day || ''); return m ? (+m[2]) + ' 月 ' + (+m[3]) + ' 日' : ''; }
  /** 「第 2 轮 · 下次 11 月 8 日」/「第 1 轮 · 今天到期」/「已掌握」 */
  function label(st, day) {
    if (!st) return '';
    if (st.s >= DONE) return '已掌握';
    day = day || today();
    const round = '第 ' + (st.s + 1) + ' 轮 · ';
    if (!isDue(st, day)) return round + '下次 ' + mdOf(st.d);
    const late = st.d ? daysBetween(st.d, day) : 0;
    return round + '今天到期' + (late > 0 ? '（拖了 ' + late + ' 天）' : '');
  }
  /** 刚复习完的说明：「做对了，进入第 3 轮，下次 11 月 9 日」等 */
  function resultText(r, day) {
    if (!r || !r.after) return '';
    const a = r.after;
    if (a.s >= DONE) return '已掌握，移出复习';
    if (r.before === r.after) return '还没到复习日，这次不算（下次 ' + mdOf(a.d) + '）';
    if (a.s === 0) return '明天再复习';
    return '进入第 ' + (a.s + 1) + ' 轮，下次 ' + mdOf(a.d);
  }
  /** 排序：到期早的在前（'' 最前），同一天按轮次 */
  function cmp(a, b) {
    const da = a ? a.d || '' : '￿', db = b ? b.d || '' : '￿';
    return da < db ? -1 : da > db ? 1 : (a ? a.s : 9) - (b ? b.s : 9);
  }
  /** 按状态排序（get(x) 取出 x 的状态），返回新数组 */
  const sortByDue = (arr, get) => arr.slice().sort((x, y) => cmp(get(x), get(y)));
  const countDue = (states, day) => states.filter(st => isDue(st, day)).length;

  /* ---------- 各模块汇总（总入口、汇总页用） ---------- */
  // href 相对 App 的网页根目录（assets/www）；听写词单在 App 里走 https 虚拟地址（见 english-map/index.html）
  const MODULES = [
    { id: 'math', key: 'mathmap-wrong-v1', subject: '数学', name: '数学错题本', unit: '道', href: 'math-map/index.html#review',
      states: v => isObj(v) ? Object.keys(v).map(k => fromMath(v[k])) : [] },
    { id: 'en-dict', key: 'fjzk-en-dictation-v1', subject: '英语', name: '单词听写错词', unit: '个', href: 'english-map/dictation.html?review=1', app: 'https://appassets.androidplatform.net/english-map/dictation.html?review=1',
      states: v => {
        const out = [], seen = new Set();
        (isObj(v) && Array.isArray(v.lists) ? v.lists : []).forEach(l => {
          if (!isObj(l) || !Array.isArray(l.words)) return;
          l.words.forEach(w => {
            const k = String(w && w.en || '').toLowerCase().replace(/\s+/g, ' ').trim();
            if (!k || seen.has(k)) return;
            const st = fromDict(l, k);
            if (st) { seen.add(k); out.push(st); }
          });
        });
        return out;
      } },
    { id: 'en-words', key: 'fjzk-en-words-v1', subject: '英语', name: '单元单词错词', unit: '个', href: 'english-map/words.html?review=1',
      states: v => isObj(v) ? Object.keys(v).map(k => fromWord(v[k])) : [] },
    { id: 'zh-tingxie', key: 'fjzk-zh-tingxie-v1', subject: '语文', name: '生字词听写错词', unit: '个', href: 'chinese-map/tingxie.html?review=1',
      states: v => isObj(v) ? Object.keys(v).map(k => fromWord(v[k])) : [] },
    { id: 'zh-moxie', key: 'fjzk-zh-moxie-v1', subject: '语文', name: '古诗词默写错句', unit: '句', href: 'chinese-map/moxie.html?review=1',
      states: v => isObj(v) ? Object.keys(v).map(k => fromWord(v[k])) : [] },
    { id: 'zh-beisong', key: 'fjzk-zh-beisong-v1', subject: '语文', name: '课文背诵错句', unit: '句', href: 'chinese-map/beisong.html?review=1',
      states: v => isObj(v) ? Object.keys(v).map(k => fromWord(v[k])) : [] }
  ];
  /** keys = { 存储键: 值 }（KMData.collect().keys）→ [{ id, subject, name, unit, href, app, total: 在复习里的, due: 今天到期的, next: 最近的下次复习日 }] */
  function summary(keys, day) {
    day = day || today();
    return MODULES.map(m => {
      const sts = m.states(keys ? keys[m.key] : undefined).filter(active);
      const later = sts.filter(st => !isDue(st, day)).map(st => st.d).sort();
      return { id: m.id, subject: m.subject, name: m.name, unit: m.unit, href: m.href, app: m.app, total: sts.length, due: countDue(sts, day), next: later[0] || '' };
    });
  }

  window.KMReview = {
    INTERVALS, DONE,
    today, dayOf, addDays, daysBetween, mdOf,
    norm, active, isDue, fresh, advance,
    fromWord, fromMath, fromDict, markWord, markMath, markDict,
    label, resultText, cmp, sortByDue, countDue,
    MODULES, summary
  };
})();
