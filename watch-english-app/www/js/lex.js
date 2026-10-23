// 离线词典：分词、词形还原、查词、找短语、判断难词。词典数据 dict/dict.js 第一次用到时才加载（约 4 MB）
const Lex = (() => {
  let W = null, L = null, P = null, maxP = 2;
  const cache = new Map();
  const NT = { "can't": 'can', "won't": 'will', "don't": 'do', "doesn't": 'do', "didn't": 'do', "isn't": 'be', "aren't": 'be',
    "wasn't": 'be', "weren't": 'be', "haven't": 'have', "hasn't": 'have', "hadn't": 'have', "shouldn't": 'shall', "wouldn't": 'will',
    "couldn't": 'can', "mustn't": 'must', "needn't": 'need', "shan't": 'shall', "mightn't": 'may' };
  const OBJ = new Set(['it', 'them', 'him', 'her', 'me', 'us', 'you', 'this', 'that', 'something', 'someone', 'everything', 'things']);
  const WORD = /[A-Za-z]+(?:['’][A-Za-z]+)*/g;

  function load() {
    if (W) return Promise.resolve();
    if (load.p) return load.p;
    return load.p = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'dict/dict.js';
      s.onload = () => { build(); res(); };
      s.onerror = () => { load.p = null; rej(new Error('词典加载失败')); };
      document.head.appendChild(s);
    });
  }

  function build() {
    const D = window.WE_DICT;
    W = new Map(); L = new Map(); P = new Map();
    for (const line of D.words.split('\n')) W.set(line.slice(0, line.indexOf('\t')), line);
    for (const line of D.lemma.split('\n')) { const i = line.indexOf('\t'); L.set(line.slice(0, i), line.slice(i + 1)); }
    for (const line of D.phrases.split('\n')) {
      const [p, zh, kind, lv] = line.split('\t');
      P.set(p, { w: p, zh, kind, lv: +lv });
      maxP = Math.max(maxP, p.split(' ').length);
    }
    window.WE_DICT = null;
  }

  function entry(w) {
    if (!w || !W) return null;
    if (cache.has(w)) return cache.get(w);
    const raw = W.get(w);
    let e = null;
    if (raw) {
      const f = raw.split('\t');
      e = { w: f[0], ph: f[1], lv: +f[2], rank: +f[3], tr: f[4] ? f[4].split('|') : [] };
    }
    cache.set(w, e);
    return e;
  }

  // 词典里都找不到时的简单还原：-s -es -ies -ed -ied -ing 双写辅音 -er -est -ly
  function guessBase(w) {
    const tries = [];
    if (w.endsWith('ies')) tries.push(w.slice(0, -3) + 'y');
    if (w.endsWith('es')) tries.push(w.slice(0, -2));
    if (w.endsWith('s')) tries.push(w.slice(0, -1));
    if (w.endsWith('ied')) tries.push(w.slice(0, -3) + 'y');
    if (w.endsWith('ed')) tries.push(w.slice(0, -2), w.slice(0, -1), w.slice(0, -3));
    if (w.endsWith('ing')) tries.push(w.slice(0, -3), w.slice(0, -3) + 'e', w.slice(0, -4));
    if (w.endsWith('er')) tries.push(w.slice(0, -2), w.slice(0, -1));
    if (w.endsWith('est')) tries.push(w.slice(0, -3), w.slice(0, -2));
    if (w.endsWith('ly')) tries.push(w.slice(0, -2), w.slice(0, -2) + 'le');
    return tries.find(t => t.length > 1 && W.has(t)) || null;
  }

  function rankOf(e) { return e && e.rank > 0 ? e.rank : 99999; }

  // 一个词形 → {key 词条, lv 最低考试级别, rank 最高词频, own 本身的词条（和 key 不同时）}
  function resolve(lo) {
    lo = lo.toLowerCase().replace(/’/g, "'");
    if (cache.has('#' + lo)) return cache.get('#' + lo);
    // 缩写按原词算（词典里虽有 doesn't、they're 这类词条，但没有词频，会被当成难词）
    let base = lo;
    const m = lo.match(/^(.+?)(n't|'s|'re|'ve|'ll|'d|'m|')$/);
    if (m) {
      const b = m[2] === "n't" ? (NT[lo] || m[1]) : m[1];
      if (W.has(b) || L.has(b) || !W.has(lo)) base = b;
    }
    const own = W.has(base) ? base : null;
    let lem = L.get(base) || null;
    if (lem && !W.has(lem)) lem = null;
    if (!own && !lem) lem = guessBase(base);
    let r = null;
    if (own || lem) {
      const eo = entry(own), el = entry(lem);
      const key = lem && (!own || rankOf(el) < rankOf(eo)) ? lem : own;
      r = { key, lv: Math.min(eo ? eo.lv : 9, el ? el.lv : 9), rank: Math.min(rankOf(eo), rankOf(el)), own: own && own !== key ? own : null };
    }
    cache.set('#' + lo, r);
    return r;
  }

  // 分词：[{t 原文, a 开始位置, b 结束位置, lo 小写, init 句首}]
  function tokenize(text) {
    const out = [];
    let m;
    WORD.lastIndex = 0;
    while ((m = WORD.exec(text))) {
      const before = text.slice(0, m.index).replace(/["'“‘\s]+$/, '');
      out.push({ t: m[0], a: m.index, b: m.index + m[0].length, lo: m[0].toLowerCase().replace(/’/g, "'"),
        init: !before || /[.!?…:\-—\n]$/.test(before) });
    }
    return out;
  }

  // 一句里的短语（不重叠，优先最长）：首词按词形还原；「figure it out」这种中间夹代词的也算
  function phrasesIn(toks, keys) {
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      let best = null;
      for (let n = Math.min(maxP, toks.length - i); n >= 2 && !best; n--) {
        const tail = toks.slice(i + 1, i + n).map(t => t.lo).join(' ');
        for (const head of [toks[i].lo, keys[i]]) {
          if (head && P.has(head + ' ' + tail)) { best = { i, j: i + n - 1, key: head + ' ' + tail }; break; }
        }
      }
      if (!best && i + 2 < toks.length && OBJ.has(toks[i + 1].lo) && keys[i] && P.has(keys[i] + ' ' + toks[i + 2].lo)) {
        best = { i, j: i + 2, key: keys[i] + ' ' + toks[i + 2].lo, gap: true };
      }
      if (best) { out.push(best); i = best.j; }
    }
    return out;
  }

  function phrase(p) { return P ? P.get(p) || null : null; }

  // 对当前水平来说难不难：考试级别高于水平、且词频排在水平范围外
  function hardFor(lv, rank, level) {
    const L = LEVELS.find(x => x.lv === level) || LEVELS[2];
    return lv > level && rank > L.rank;
  }

  // 测验选项用的短释义：第一行去掉词性，最多两个义项
  function short(e) {
    if (!e || !e.tr.length) return '';
    const line = e.tr.find(t => !t.startsWith('口语')) || e.tr[0];
    const body = line.replace(/^口语[^：]*：/, '').replace(/^[a-z]+\.\s*/, '');
    return body.split(/[,，;；]\s*/).filter(Boolean).slice(0, 2).join('；');
  }

  function pos(e) { const m = e && e.tr[0] && e.tr[0].match(/^([a-z]+)\./); return m ? m[1] : ''; }

  // 随机取若干同水平附近的词（测验干扰项不够时用）
  function randomWords(n, avoid) {
    const keys = [...W.keys()], out = [];
    for (let k = 0; k < 400 && out.length < n; k++) {
      const e = entry(keys[Math.floor(Math.random() * keys.length)]);
      if (e && e.rank > 0 && e.rank < 15000 && !avoid.has(e.w) && short(e)) out.push(e);
    }
    return out;
  }

  return { load, loaded: () => !!W, entry, resolve, tokenize, phrasesIn, phrase, hardFor, short, pos, randomWords };
})();
