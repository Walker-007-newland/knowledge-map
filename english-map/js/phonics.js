/* 自然拼读卡片：把单词按“字母组合 → 音”分块显示，每块可以点着听，再连读整个词。
 * 数据：data/phonics-words.js（window.KW_PHONICS，docs/audio/build_phonics.py 生成）
 * 录音：audio/ph-index.js + audio/ph/*.mp3（单个音，英式）、audio/index.js + audio/en/*.mp3（课本单词整词）
 * 用法：KWPhonics.has(英文) 有没有拼读数据（短语要每个词都有）；KWPhonics.open(英文, 中文, { autoplay }) 弹出拼读卡片
 *       （autoplay：打开时先读一遍整个词），没有数据返回 false；
 *       KWPhonics.button(英文) 返回一个「拼读」小按钮的 HTML（没有数据时返回空串），点它会打开卡片。 */
(function () {
  'use strict';
  const BASE = new URL('../audio/', document.currentScript.src).href;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UNITS = ['tʃ', 'dʒ', 'aɪ', 'eɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə', 'iː', 'ɑː', 'ɔː', 'uː', 'ɜː'];
  function units(p) {
    const out = [];
    for (let i = 0; i < p.length;) {
      const u = UNITS.find(x => p.startsWith(x, i)) || p[i];
      out.push(u); i += u.length;
    }
    return out;
  }
  const words = text => String(text).trim().split(/[\s-]+/).filter(Boolean);
  // 一个词 → { word, ipa, chunks: [{ g, ph: [音素], silent, magic }] }
  // 没有数据的复数 / 第三人称单数：原形有数据就补上词尾 -s/-es（清辅音后读 /s/，s、x、sh、ch 后读 /ɪz/，其它读 /z/）
  function plural(low) {
    const P = window.KW_PHONICS || {};
    let m = /^(.+(?:s|x|z|sh|ch))es$/.exec(low);
    if (m && P[m[1]]) return P[m[1]].replace(/\/(.*)\/\|/, '/$1ɪz/|') + ' es=ɪz';
    m = /^(.+[^s])s$/.exec(low);
    if (!m || !P[m[1]]) return null;
    const last = units(P[m[1]].split('|')[0].replace(/[\/ˈ]/g, '')).pop();
    const s = /^(p|t|k|f|θ)$/.test(last) ? 's' : /^(s|z|ʃ|ʒ|tʃ|dʒ)$/.test(last) ? 'ɪz' : 'z';
    return P[m[1]].replace(/\/(.*)\/\|/, `/$1${s}/|`) + ' s=' + s;
  }
  function parse(w) {
    const low = w.toLowerCase().replace(/[^a-z]/g, '');
    const d = (window.KW_PHONICS && KW_PHONICS[low]) || plural(low);
    if (!d) return null;
    const [ipa, body] = d.split('|');
    const chunks = body.split(' ').map(t => {
      const i = t.indexOf('='), g = t.slice(0, i), p = t.slice(i + 1);
      return { g: g.replace('~', ''), ph: p ? units(p) : [], silent: !p, magic: g.endsWith('~') };
    });
    // 保留原来的大小写（Monday、English）
    let k = 0;
    chunks.forEach(c => { c.g = w.slice(k, k + c.g.length) || c.g; k += c.g.length; });
    const magic = chunks.find(c => c.magic);
    if (magic) chunks[chunks.length - 1].magicOf = magic;
    return { word: w, ipa, chunks };
  }
  function has(text) {
    const ws = words(text);
    return ws.length > 0 && ws.length <= 6 && ws.every(w => parse(w));
  }

  /* ---------------- 播放 ---------------- */
  let audio = null, playToken = 0;
  function playFile(url, token) {
    return new Promise(resolve => {
      if (token !== playToken) { resolve(false); return; }
      audio = audio || new Audio();
      let done = false;
      const fin = ok => { if (done) return; done = true; audio.onended = audio.onerror = null; clearTimeout(t); resolve(ok); };
      audio.onended = () => fin(true);
      audio.onerror = () => fin(false);
      audio.src = url;
      const t = setTimeout(() => fin(false), 5000);
      const p = audio.play();
      if (p && p.catch) p.catch(() => fin(false));
    });
  }
  function speakTts(text, token) {
    return new Promise(resolve => {
      if (token !== playToken || !('speechSynthesis' in window)) { resolve(); return; }
      try { speechSynthesis.cancel(); } catch (e) { /* 忽略 */ }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.85;
      const t = setTimeout(resolve, 600 + text.length * 150);
      u.onend = u.onerror = () => { clearTimeout(t); resolve(); };
      speechSynthesis.speak(u);
    });
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function stop() {
    playToken++;
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); }
    if ('speechSynthesis' in window) try { speechSynthesis.cancel(); } catch (e) { /* 忽略 */ }
  }
  async function playSounds(ph, token) {
    for (let i = 0; i < ph.length; i++) {
      const name = window.KW_PH_AUDIO && KW_PH_AUDIO[ph[i]];
      if (name) await playFile(BASE + 'ph/' + name + '.mp3', token);
      if (i < ph.length - 1) await sleep(60);
    }
  }
  // 整个词：课本单词放录音，其它用语音引擎
  async function playWord(text, token) {
    const t = String(text).trim();
    const rec = window.KW_AUDIO && (KW_AUDIO[t] || KW_AUDIO[t.toLowerCase()]);
    if (rec && await playFile(BASE + 'en/' + rec + '.mp3', token)) return;
    await speakTts(t, token);
  }

  /* ---------------- 卡片 ---------------- */
  function injectCss() {
    if (document.getElementById('kwPhonicsCss')) return;
    const st = document.createElement('style');
    st.id = 'kwPhonicsCss';
    st.textContent = `
.kwp-mask { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 9000; display: flex; align-items: flex-end; justify-content: center; }
.kwp-sheet { background: var(--surface, #fff); color: var(--text, #222); width: min(640px, 100%); max-height: 88vh; overflow: auto;
  border-radius: 16px 16px 0 0; padding: 16px 16px calc(16px + env(safe-area-inset-bottom)); box-shadow: var(--shadow, 0 6px 24px rgba(0,0,0,.2)); }
@media (min-width: 700px) { .kwp-mask { align-items: center; } .kwp-sheet { border-radius: 16px; } }
.kwp-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.kwp-head h3 { margin: 0; flex: 1; font-size: 18px; }
.kwp-zh { color: var(--muted, #666); margin: 0 0 10px; }
.kwp-word { margin: 12px 0 4px; }
.kwp-ipa { font-family: "Lucida Sans Unicode", "Segoe UI", "Arial Unicode MS", sans-serif; color: var(--muted, #666); font-size: 15px; margin-bottom: 8px; }
.kwp-tiles { display: flex; flex-wrap: wrap; gap: 6px; }
.kwp-tile { border: 1px solid var(--line, #ddd); background: var(--surface-2, #f4f4f4); border-radius: 10px; padding: 6px 10px 4px; min-width: 44px;
  text-align: center; cursor: pointer; font: inherit; color: inherit; line-height: 1.2; }
.kwp-tile b { display: block; font-family: Georgia, "Times New Roman", serif; font-size: 28px; font-weight: 600; letter-spacing: .02em; }
.kwp-tile i { display: block; font-style: normal; font-size: 14px; color: var(--accent, #2f6fde); min-height: 18px;
  font-family: "Lucida Sans Unicode", "Segoe UI", "Arial Unicode MS", sans-serif; }
.kwp-tile.vowel b { color: #d0442f; }
.kwp-tile.silent { opacity: .45; cursor: default; }
.kwp-tile.silent i { color: var(--muted, #888); }
.kwp-tile.magic { box-shadow: inset 0 -3px 0 #e3a008; }
.kwp-tile.on { background: var(--accent, #2f6fde); border-color: var(--accent, #2f6fde); }
.kwp-tile.on b, .kwp-tile.on i { color: var(--accent-ink, #fff); }
.kwp-note { font-size: 13px; color: var(--muted, #666); margin: 6px 0 0; }
.kwp-acts { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.kwp-acts .btn { flex: 1; min-width: 120px; }
.kwp-legend { font-size: 12px; color: var(--muted, #666); margin-top: 12px; line-height: 1.6; }
.kwp-btn { font-size: 13px; padding: 2px 8px; }
`;
    document.head.appendChild(st);
  }
  const isVowelSound = ph => ph.some(u => /[æeɪɒʌʊəiɑɔuɜ]/.test(u[0]) && !/^[ʃʒθð]$/.test(u));
  function tilesHtml(p, wi) {
    return p.chunks.map((c, ci) => {
      const cls = ['kwp-tile'];
      if (c.silent) cls.push('silent');
      else if (isVowelSound(c.ph)) cls.push('vowel');
      if (c.magic || c.magicOf) cls.push('magic');
      const sound = c.silent ? '不发音' : '/' + c.ph.join('') + '/';
      return `<button type="button" class="${cls.join(' ')}" data-w="${wi}" data-c="${ci}" ${c.silent ? 'tabindex="-1"' : ''}
        aria-label="${esc(c.g)} ${esc(sound)}"><b>${esc(c.g)}</b><i>${esc(sound)}</i></button>`;
    }).join('');
  }
  function notes(p) {
    const out = [];
    const m = p.chunks.find(c => c.magic);
    if (m) out.push(`<b>${esc(m.g)}…e</b>：词尾的 e 不发音，让前面的 ${esc(m.g)} 读长音 /${esc(m.ph.join(''))}/（magic e）。`);
    const s = p.chunks.filter(c => c.silent && !c.magicOf && !(c === p.chunks[p.chunks.length - 1] && c.g.toLowerCase() === 'e'));
    if (s.length) out.push('灰色的字母不发音：' + s.map(c => `<b>${esc(c.g)}</b>`).join('、') + '。');
    const multi = p.chunks.filter(c => c.g.length > 1 && !c.silent);
    if (multi.length) out.push('几个字母合起来读一个音：' + multi.map(c => `<b>${esc(c.g)}</b> /${esc(c.ph.join(''))}/`).join('，') + '。');
    return out.map(t => `<p class="kwp-note">${t}</p>`).join('');
  }
  let mask = null, cur = null, curText = '';
  // 连读：整个短语有录音就放整句，否则一个词一个词读
  async function playAll(token) {
    const rec = window.KW_AUDIO && (KW_AUDIO[curText] || KW_AUDIO[curText.toLowerCase()]);
    if (cur.length > 1 && rec && await playFile(BASE + 'en/' + rec + '.mp3', token)) return;
    for (const p of cur) { await playWord(p.word, token); await sleep(300); }
  }
  function close() {
    stop();
    if (mask) { mask.remove(); mask = null; }
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  function highlight(wi, ci) {
    if (!mask) return;
    mask.querySelectorAll('.kwp-tile.on').forEach(el => el.classList.remove('on'));
    if (wi != null) { const el = mask.querySelector(`.kwp-tile[data-w="${wi}"][data-c="${ci}"]`); if (el) el.classList.add('on'); }
  }
  // 拼读：一块一块读（高亮当前块），停一下，再连读整个词
  async function spellOut() {
    stop();
    const token = playToken;
    for (let wi = 0; wi < cur.length; wi++) {
      const p = cur[wi];
      for (let ci = 0; ci < p.chunks.length; ci++) {
        const c = p.chunks[ci];
        if (c.silent) continue;
        highlight(wi, ci);
        await playSounds(c.ph, token);
        if (token !== playToken) return;
        await sleep(280);
      }
      highlight(null);
      await sleep(250);
      if (token !== playToken) return;
      await playWord(p.word, token);
      await sleep(350);
    }
  }
  function open(text, zh, opt) {
    if (!has(text)) return false;
    injectCss();
    close();
    cur = words(text).map(parse);
    curText = String(text).trim();
    mask = document.createElement('div');
    mask.className = 'kwp-mask';
    mask.innerHTML = `<div class="kwp-sheet" role="dialog" aria-modal="true" aria-label="自然拼读">
      <div class="kwp-head"><h3>自然拼读</h3><button type="button" class="btn icon" data-act="close" aria-label="关闭">✕</button></div>
      ${zh ? `<p class="kwp-zh">${esc(text)}　${esc(zh)}</p>` : ''}
      ${cur.map((p, wi) => `<div class="kwp-word"><div class="kwp-ipa">${esc(p.word)}　${esc(p.ipa)}</div>
        <div class="kwp-tiles">${tilesHtml(p, wi)}</div>${notes(p)}</div>`).join('')}
      <div class="kwp-acts">
        <button type="button" class="btn primary big" data-act="spell">▶ 拼读</button>
        <button type="button" class="btn big" data-act="word">🔊 连读</button>
      </div>
      <p class="kwp-legend">点一块听这一块的音；「拼读」会一块一块读，再连起来读整个词。红色是元音，灰色不发音，黄色下划线是 magic e。</p>
    </div>`;
    mask.addEventListener('click', e => {
      if (e.target === mask) { close(); return; }
      const a = e.target.closest('[data-act]');
      if (a) {
        if (a.dataset.act === 'close') close();
        else if (a.dataset.act === 'spell') spellOut();
        else if (a.dataset.act === 'word') { stop(); playAll(playToken); }
        return;
      }
      const t = e.target.closest('.kwp-tile');
      if (t && !t.classList.contains('silent')) {
        stop();
        const tk = playToken, c = cur[+t.dataset.w].chunks[+t.dataset.c];
        highlight(+t.dataset.w, +t.dataset.c);
        playSounds(c.ph, tk).then(() => { if (tk === playToken) highlight(null); });
      }
    });
    document.body.appendChild(mask);
    document.addEventListener('keydown', onKey);
    const first = mask.querySelector('[data-act=spell]');
    if (first) first.focus();
    if (opt && opt.autoplay) playAll(playToken);
    return true;
  }
  function button(text, zh) {
    if (!has(text)) return '';
    return `<button type="button" class="btn small kwp-btn" data-phonics="${esc(text)}"${zh ? ` data-phonics-zh="${esc(zh)}"` : ''} aria-label="自然拼读">🔤 拼读</button>`;
  }
  // 页面里任何 data-phonics 按钮都能打开卡片
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-phonics]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    open(b.dataset.phonics, b.dataset.phonicsZh || '');
  }, true);

  window.KWPhonics = { has, open, close, button, parse };
})();
