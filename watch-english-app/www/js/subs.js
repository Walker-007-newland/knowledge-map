// 字幕：解码（UTF-8/UTF-16/GBK/Big5）→ 解析 SRT/VTT/ASS → 每条拆成英文、中文 → 合并中文字幕文件
// 时间一律换成毫秒；tools/pack.py 里有同样的算法（精讲包靠开始时间对上台词，两边要一致）
const Subs = (() => {
  const COMMON = '的一是不了在人有我他这个们中来上大为和国地到以说时要就出会可也你对生能而子那得于着下自之年过发后作里用道行所然家种事成方多经么去法学如都同现当没动面起看定天分还进好小部其些主样理心她本前开但因只从想实日吗吧呢啊們個來為國時說會對後這裡麼經現當沒動還進開從實學種發過樣點嗎聽見讓間';
  const CJK = /[㐀-鿿豈-﫿]/;

  function score(s) {
    let n = 0;
    for (let i = 0; i < s.length && i < 20000; i++) if (COMMON.indexOf(s[i]) >= 0) n++;
    return n - (s.match(/�/g) || []).length * 5;
  }

  function decode(buf) {
    const b = new Uint8Array(buf);
    if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) return new TextDecoder('utf-8').decode(b.subarray(3));
    if (b[0] === 0xff && b[1] === 0xfe) return new TextDecoder('utf-16le').decode(b.subarray(2));
    if (b[0] === 0xfe && b[1] === 0xff) return new TextDecoder('utf-16be').decode(b.subarray(2));
    let zeros = 0;
    for (let i = 0; i < b.length && i < 4000; i++) if (!b[i]) zeros++;
    if (zeros > Math.min(b.length, 4000) / 5) return new TextDecoder(b[0] === 0 ? 'utf-16be' : 'utf-16le').decode(b);
    try { return new TextDecoder('utf-8', { fatal: true }).decode(b); } catch (e) { /* 不是 UTF-8 */ }
    const gb = new TextDecoder('gb18030').decode(b), big5 = new TextDecoder('big5').decode(b);
    return score(big5) > score(gb) ? big5 : gb;
  }

  function ms(h, m, s, f) {
    return ((+(h || '0').replace(':', '')) * 3600 + +m * 60 + +s) * 1000 + +((f || '') + '000').slice(0, 3);
  }

  const TIME = /(\d{1,2}:)?(\d{1,2}):(\d{1,2})[,.](\d{1,3})\s*-->\s*(\d{1,2}:)?(\d{1,2}):(\d{1,2})[,.](\d{1,3})/;

  function parseSrt(text) {
    const out = [];
    let cur = null;
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      const m = line.match(TIME);
      if (m) {
        if (cur && cur.lines.length && /^\d+$/.test(cur.lines[cur.lines.length - 1])) cur.lines.pop();   // 下一条的序号
        cur = { s: ms(m[1], m[2], m[3], m[4]), e: ms(m[5], m[6], m[7], m[8]), lines: [] };
        out.push(cur);
      } else if (cur && line && !/^(WEBVTT|NOTE\b|STYLE\b)/.test(line)) {
        cur.lines.push(line);
      }
    }
    return out;
  }

  function parseAss(text) {
    const out = [];
    let fmt = null, inEvents = false;
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (/^\[.*\]$/.test(line)) { inEvents = /^\[events\]$/i.test(line); continue; }
      if (!inEvents) continue;
      if (/^format\s*:/i.test(line)) { fmt = line.replace(/^format\s*:/i, '').split(',').map(x => x.trim().toLowerCase()); continue; }
      if (!/^dialogue\s*:/i.test(line) || !fmt) continue;
      const parts = line.replace(/^dialogue\s*:/i, '').split(',');
      const f = parts.slice(0, fmt.length - 1).map(x => x.trim());
      f.push(parts.slice(fmt.length - 1).join(','));
      const get = k => f[fmt.indexOf(k)] || '';
      const t1 = get('start').match(/(\d+):(\d+):(\d+)[.:](\d+)/), t2 = get('end').match(/(\d+):(\d+):(\d+)[.:](\d+)/);
      if (!t1 || !t2) continue;
      const body = get('text').replace(/\{[^}]*\}/g, '').replace(/\\h/g, ' ');
      out.push({ s: ms(t1[1], t1[2], t1[3], t1[4]), e: ms(t2[1], t2[2], t2[3], t2[4]), lines: body.split(/\\N|\\n/i).map(x => x.trim()).filter(Boolean) });
    }
    return out;
  }

  // 一行英文去掉标签、听障字幕的 [音效] (笑)、说话人名「JOHN:」、音符
  function cleanEn(s) {
    return s.replace(/<[^>]*>/g, '').replace(/\{[^}]*\}/g, '').replace(/&nbsp;/g, ' ')
      .replace(/\[[^\]]*\]/g, '').replace(/\([^)]*\)/g, m => /[a-z]{3}/.test(m) && !/^\([A-Z\s]+\)$/.test(m) && m.split(' ').length > 3 ? m : '')
      .replace(/^[A-Z][A-Z .'\-]{1,20}:\s*/, '').replace(/[♪♫#]/g, '').replace(/\s+/g, ' ').trim();
  }
  function cleanZh(s) {
    return s.replace(/<[^>]*>/g, '').replace(/\{[^}]*\}/g, '').replace(/&nbsp;/g, ' ').replace(/[♪♫]/g, '').replace(/\s+/g, ' ').trim();
  }

  // 解析出 [{s, e, en, zh}]，同一时间的几行（ASS 双语常见）合成一条
  function parse(text) {
    text = text.replace(/\r\n?/g, '\n').replace(/^﻿/, '');
    const raw = /^\s*\[script info\]/i.test(text) || /\n\[events\]/i.test(text) ? parseAss(text) : parseSrt(text);
    const byTime = new Map();
    for (const c of raw) {
      const k = c.s + '-' + c.e;
      let cue = byTime.get(k);
      if (!cue) byTime.set(k, cue = { s: c.s, e: c.e, en: [], zh: [] });
      for (const l of c.lines) {
        if (CJK.test(l)) { const z = cleanZh(l); if (z) cue.zh.push(z); }
        else { const e = cleanEn(l); if (/[A-Za-z]/.test(e)) cue.en.push(e); }
      }
    }
    return [...byTime.values()].map(c => ({ s: c.s, e: c.e, en: c.en.join('\n'), zh: c.zh.join(' ') }))
      .filter(c => c.en || c.zh).sort((a, b) => a.s - b.s);
  }

  // 另一个中文字幕文件按时间重叠并入英文台词（只在英文字幕里没带中文时用）
  function mergeZh(cues, zhCues) {
    let j = 0;
    for (const c of cues) {
      if (c.zh) continue;
      while (j < zhCues.length && zhCues[j].e <= c.s) j++;
      const hit = [];
      for (let k = j; k < zhCues.length && zhCues[k].s < c.e; k++) {
        const z = zhCues[k], ov = Math.min(c.e, z.e) - Math.max(c.s, z.s);
        if (z.zh && ov > 0.3 * Math.min(c.e - c.s, z.e - z.s)) hit.push(z.zh);
      }
      c.zh = hit.join(' ');
    }
    return cues;
  }

  function stats(cues) {
    return { total: cues.length, en: cues.filter(c => c.en).length, zh: cues.filter(c => c.en && c.zh).length };
  }

  function fmt(t, withMs) {
    t = Math.max(0, t | 0);
    const h = Math.floor(t / 3600000), m = Math.floor(t / 60000) % 60, s = Math.floor(t / 1000) % 60;
    const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
    return (h ? h + ':' + mm : m) + ':' + ss + (withMs ? '.' + String(t % 1000).padStart(3, '0').slice(0, 1) : '');
  }

  return { decode, parse, mergeZh, stats, fmt };
})();
