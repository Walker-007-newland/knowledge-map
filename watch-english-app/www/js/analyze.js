// 一部电影的分析：每句分词、难词（含短语）、难句；精讲包按开始时间并到台词上
function analyzeMovie(body) {
  const cues = body.cues;
  const lines = [];            // 每句：{toks, phr}
  const stat = new Map();      // 词条 → {key, kind: 'w' 单词 | 'p' 短语, n 出现次数, cues 出现在哪几句, lv, rank}
  const caps = new Map();      // 小写词形 → {cap 句中大写次数, low 小写次数}，用来认人名地名

  cues.forEach((c, ci) => {
    const toks = c.en ? Lex.tokenize(c.en) : [];
    for (const t of toks) {
      t.r = Lex.resolve(t.lo);
      if (t.init) continue;
      const base = t.lo.replace(/'s$/, '');
      const k = caps.get(base) || { cap: 0, low: 0 };
      /^[A-Z]/.test(t.t) ? k.cap++ : k.low++;
      caps.set(base, k);
    }
    lines.push({ toks });
  });

  function add(key, kind, ci, lv, rank) {
    let s = stat.get(key);
    if (!s) stat.set(key, s = { key, kind, n: 0, cues: [], lv, rank });
    s.n++;
    if (s.cues[s.cues.length - 1] !== ci) s.cues.push(ci);
  }

  // 口语短语（自编表里的）里的词不再单独算词：freaking out 只列 freak out，不列 freak
  lines.forEach((ln, ci) => {
    for (const t of ln.toks) {
      const base = t.lo.replace(/'s$/, ''), k = caps.get(base);
      t.name = base !== 'i' && /^[A-Z]/.test(t.t) && (!t.r || (k && k.cap > 0 && k.low === 0));
    }
    ln.phr = Lex.phrasesIn(ln.toks, ln.toks.map(t => t.r && !t.name ? t.r.key : null));
    const inIdiom = new Set();
    for (const p of ln.phr) {
      add(p.key, 'p', ci, 9, 99999);
      if (Lex.phrase(p.key).kind === 'i') for (let k = p.i; k <= p.j; k++) inIdiom.add(k);
    }
    ln.toks.forEach((t, k) => { if (t.r && !t.name && !inIdiom.has(k)) add(t.r.key, 'w', ci, t.r.lv, t.r.rank); });
  });

  // 精讲包
  const packLine = new Map(), packWord = new Map();
  const pack = body.pack;
  if (pack) {
    let j = 0;
    const sorted = (pack.lines || []).slice().sort((a, b) => a.t - b.t);
    for (const pl of sorted) {
      while (j + 1 < cues.length && Math.abs(cues[j + 1].s - pl.t) <= Math.abs(cues[j].s - pl.t)) j++;
      if (cues[j] && Math.abs(cues[j].s - pl.t) <= 800) packLine.set(j, pl);
    }
    for (const pw of pack.words || []) {
      const key = String(pw.w || '').toLowerCase().trim();
      if (!key) continue;
      packWord.set(key, pw);
      if (!stat.has(key)) {
        const s = { key, kind: key.includes(' ') ? 'p' : 'w', n: 0, cues: [], lv: 9, rank: 99999 };
        for (const t of pw.t || []) {
          const ci = cues.findIndex(c => Math.abs(c.s - t) <= 800);
          if (ci >= 0 && !s.cues.includes(ci)) { s.cues.push(ci); s.n++; }
        }
        s.cues.sort((a, b) => a - b);
        stat.set(key, s);
      }
    }
  }

  // all = 不管认不认识（算掌握进度用）
  function isHard(s, all) {
    if (!s || (!all && isKnown(s.key))) return false;
    if (packWord.has(s.key)) return true;
    if (s.kind === 'p') { const p = Lex.phrase(s.key); return !!(p && p.kind === 'i' && p.lv > Settings.level); }
    return s.key.length > 1 && Lex.hardFor(s.lv, s.rank, Settings.level);
  }

  // 难词表：按第一次出现的先后
  function hardWords(all) {
    return [...stat.values()].filter(s => s.cues.length && isHard(s, all)).sort((a, b) => a.cues[0] - b.cues[0]);
  }

  // 每句的难度：难词、难短语各记 2 分，12 个词以上加 1 分；精讲包讲到的句子一定算难句
  function lineInfo(ci) {
    const ln = lines[ci];
    const hw = [], hp = [];
    const inIdiom = new Set();
    for (const p of ln.phr) {
      if (Lex.phrase(p.key).kind === 'i') for (let k = p.i; k <= p.j; k++) inIdiom.add(k);
      if (isHard(stat.get(p.key))) hp.push(p.key);
    }
    ln.toks.forEach((t, k) => {
      if (t.r && !t.name && !inIdiom.has(k) && isHard(stat.get(t.r.key)) && !hw.includes(t.r.key)) hw.push(t.r.key);
    });
    for (const [key, pw] of packWord) if (stat.get(key) && stat.get(key).cues.includes(ci) && !hw.includes(key) && !hp.includes(key) && isHard(stat.get(key))) hw.push(key);
    const score = 2 * (hw.length + hp.length) + (ln.toks.length >= 12 ? 1 : 0);
    return { hw, hp, score, pack: packLine.get(ci) || null };
  }

  function hardLines() {
    const out = [];
    cues.forEach((c, ci) => {
      if (!c.en) return;
      const info = lineInfo(ci);
      if (info.score >= 2 || (info.pack && info.pack.note)) out.push(ci);
    });
    return out;
  }

  // 显示用的释义：精讲包本片释义 > 自编口语短语 > 词典
  function meaning(key) {
    const pw = packWord.get(key);
    if (pw && pw.zh) return pw.zh;
    const p = Lex.phrase(key);
    if (p) return p.zh.split('|')[0].replace(/^[a-z]+\.\s*/, '');
    return Lex.short(Lex.entry(key));
  }

  function zhOf(ci) { const pl = packLine.get(ci); return (pl && pl.zh) || cues[ci].zh || ''; }

  return { cues, lines, stat, packLine, packWord, isHard, hardWords, lineInfo, hardLines, meaning, zhOf };
}
