/* 背诵比对：把语音识别出来的字和原文按拼音对齐（同音、近音字都算对，识别出错的字大多是同音字）
 *   BeiMatch.prepare(poem)   → { chars: [原文的字], clauses: [{ start, end, t, p }] }（只要汉字，标点不比）
 *   BeiMatch.align(P, heard) → { pos: 背到原文第几个字, st: [每个原文字 'ok'|'sub'|'del'|''], got: [每个原文字听到的字] }
 *       半全局对齐：听到的字全部要对上，原文只对到背到的地方（后面还没背的不算漏）
 *   BeiMatch.judge(P, A, final) → 每句 { st: 'ok'|'wrong'|'skip'|'cur'|'todo', heard, errs }
 *       背过去的句子（final 或已经背到下一句第 2 个字）才下结论；容错：3 字以内 0 个，4–7 字 1 个，8 字以上 2 个
 * 拼音表 window.KBP（data/beisong/pinyin.js）；模糊音：zh/z、ch/c、sh/s、n/l、in/ing、en/eng 不分。 */
(function () {
  'use strict';
  const isHan = c => c >= '㐀' && c <= '鿿';
  const FUZZY = [[/^zh/, 'z'], [/^ch/, 'c'], [/^sh/, 's'], [/^n(?!g)/, 'l'], [/ing$/, 'in'], [/eng$/, 'en']];
  const norm = p => FUZZY.reduce((s, [re, to]) => s.replace(re, to), p);
  const cache = new Map();
  function readings(c) {
    let r = cache.get(c);
    if (!r) { r = new Set(((window.KBP || {})[c] || c).split('|').map(norm)); cache.set(c, r); }
    return r;
  }
  function same(a, b) {
    if (a === b) return true;
    const ra = readings(a), rb = readings(b);
    for (const x of ra) if (rb.has(x)) return true;
    return false;
  }

  function prepare(poem) {
    const chars = [], clauses = [];
    poem.c.forEach(c => {
      const start = chars.length;
      for (const ch of c.t) if (isHan(ch)) chars.push(ch);
      clauses.push({ start, end: chars.length, t: c.t, p: c.p });
    });
    return { chars, clauses };
  }

  function align(P, heard) {
    const E = P.chars, R = [...String(heard)].filter(isHan), n = R.length, m = E.length, W = m + 1;
    const D = new Int32Array((n + 1) * W);
    for (let j = 0; j <= m; j++) D[j] = j;
    for (let i = 1; i <= n; i++) {
      D[i * W] = i;
      for (let j = 1; j <= m; j++) {
        const sub = D[(i - 1) * W + j - 1] + (same(R[i - 1], E[j - 1]) ? 0 : 1);
        const ins = D[(i - 1) * W + j] + 1;      // 多读了一个字
        const del = D[i * W + j - 1] + 1;        // 漏了原文一个字
        D[i * W + j] = Math.min(sub, ins, del);
      }
    }
    // 原文背到哪里：最后一行代价最小的位置（相同取靠后的）
    let pos = 0;
    for (let j = 1; j <= m; j++) if (D[n * W + j] <= D[n * W + pos]) pos = j;
    const st = E.map(() => ''), got = E.map(() => '');
    let i = n, j = pos;
    while (i > 0 || j > 0) {
      const here = D[i * W + j];
      if (i > 0 && j > 0 && here === D[(i - 1) * W + j - 1] + (same(R[i - 1], E[j - 1]) ? 0 : 1)) {
        st[j - 1] = same(R[i - 1], E[j - 1]) ? 'ok' : 'sub'; got[j - 1] = R[i - 1] + got[j - 1]; i--; j--;
      } else if (j > 0 && here === D[i * W + j - 1] + 1) {
        st[j - 1] = 'del'; j--;
      } else {
        // 多读的字记在前一个原文字上（只用来显示“你背的是”，不算错）
        if (j > 0) got[j - 1] += R[i - 1]; else if (m) got[0] = R[i - 1] + got[0];
        i--;
      }
    }
    return { pos, st, got, n };
  }

  const tolOf = len => (len <= 3 ? 0 : len <= 7 ? 1 : 2);
  function judge(P, A, final) {
    return P.clauses.map(c => {
      const len = c.end - c.start;
      let errs = 0, dels = 0, heard = '';
      for (let k = c.start; k < c.end; k++) {
        // 结束时这句只背了一半：后面没背的字算漏
        const s = A.st[k] || (final && k >= A.pos ? 'del' : '');
        if (s === 'sub' || s === 'del') errs++;
        if (s === 'del') dels++;
        heard += A.got[k];
      }
      let st;
      const passed = final || A.pos >= c.end + 2 || (A.pos >= c.end && c.end === P.chars.length);
      if (A.pos <= c.start) st = 'todo';     // 还没背到（结束时就是没背）
      else if (!passed) st = 'cur';
      else if (len && dels === len) st = 'skip';
      else st = errs > tolOf(len) ? 'wrong' : 'ok';
      return { st, heard, errs };
    });
  }

  window.BeiMatch = { prepare, align, judge, same };
})();
