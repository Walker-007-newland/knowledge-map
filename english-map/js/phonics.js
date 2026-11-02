/* 音节拼读卡片：多音节词按音节分块（com · pu · ter），一节一节读再连读整个词；单音节词不拆，直接读。
 * 数据：data/phonics-words.js（window.KW_PHONICS，docs/audio/build_phonics.py 生成）
 * 录音：audio/syl-index.js + audio/syl/*.mp3（每个音节，英式）、audio/index.js + audio/en/*.mp3（课本单词整词）
 * 用法：KWPhonics.has(英文) 有没有拼读数据（短语要每个词都有）；KWPhonics.open(英文, 中文, { autoplay }) 弹出拼读卡片
 *       （autoplay：打开时先读一遍整个词），没有数据返回 false；
 *       KWPhonics.button(英文) 返回一个「拼读」小按钮的 HTML（没有数据时返回空串），点它会打开卡片。 */
(function () {
  'use strict';
  const BASE = new URL('../audio/', document.currentScript.src).href;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const words = text => String(text).trim().split(/[\s-]+/).filter(Boolean);
  function fromData(d) {
    const [ipa, body] = d.split('|');
    const syls = body.split(' ').map(t => {
      const [g, p] = t.split('=');
      return { g, ipa: p.replace('ˈ', ''), stress: p.startsWith('ˈ') };
    });
    return { ipa, syls };
  }
  // 没有数据的复数 / 第三人称单数：原形有数据就补上词尾
  // -es（boxes）读 /ɪz/ 自成一节；-s 在 s、z、ʃ、ʒ 音后读 /ɪz/ 也自成一节，清辅音后读 /s/、其它读 /z/，接在最后一节
  function plural(low) {
    const P = window.KW_PHONICS || {};
    let m = /^(.+(?:s|x|z|sh|ch))es$/.exec(low), r;
    if (m && P[m[1]]) {
      r = fromData(P[m[1]]); r.key = m[1]; r.syls.push({ g: 'es', ipa: 'ɪz', stress: false, extra: true });
      r.ipa = r.ipa.replace(/\/$/, 'ɪz/');
      return r;
    }
    m = /^(.+[^s])s$/.exec(low);
    if (!m || !P[m[1]]) return null;
    r = fromData(P[m[1]]); r.key = m[1];
    const last = r.syls[r.syls.length - 1];
    const end = /(p|t|k|f|θ)$/.test(last.ipa) ? 's' : /(s|z|ʃ|ʒ|tʃ|dʒ)$/.test(last.ipa) ? 'ɪz' : 'z';
    if (end === 'ɪz') r.syls.push({ g: 's', ipa: 'ɪz', stress: false, extra: true });
    else { last.g += 's'; last.ipa += end; }
    r.ipa = r.ipa.replace(/\/$/, end + '/');
    return r;
  }
  // 一个词 → { word, ipa, syls: [{ g, ipa, stress }] }
  function parse(w) {
    const low = w.toLowerCase().replace(/[^a-z]/g, '');
    const P = window.KW_PHONICS || {};
    const r = P[low] ? Object.assign(fromData(P[low]), { key: low }) : plural(low);
    if (!r) return null;
    const { ipa, syls, key } = r;
    // 保留原来的大小写（Monday、English）
    let k = 0;
    syls.forEach(s => { s.g = w.slice(k, k + s.g.length) || s.g; k += s.g.length; });
    return { word: w, key, ipa, syls };
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
  // 整个词：课本单词放录音，其它用语音引擎
  async function playWord(text, token) {
    const t = String(text).trim();
    const rec = window.KW_AUDIO && (KW_AUDIO[t] || KW_AUDIO[t.toLowerCase()]);
    if (rec && await playFile(BASE + 'en/' + rec + '.mp3', token)) return;
    await speakTts(t, token);
  }
  // 一个音节：放从整词里切出来的录音（audio/syl/<词>-<第几节>.mp3）；
  // 复数自动补的 -es /ɪz/ 没有录音，用语音引擎读 is（同音）；其它没录音的读这几个字母
  async function playSyl(p, s, token) {
    if (p.syls.length === 1) { await playWord(p.word, token); return; }
    if (s.extra) { await speakTts('is', token); return; }
    const stem = window.KW_SYL_AUDIO && KW_SYL_AUDIO[p.key];
    const si = p.syls.indexOf(s);
    if (stem && await playFile(BASE + 'syl/' + stem + '-' + si + '.mp3', token)) return;
    await speakTts(s.g, token);
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
.kwp-tiles { display: flex; flex-wrap: wrap; align-items: stretch; gap: 4px; }
.kwp-dot { align-self: center; color: var(--muted, #888); font-size: 22px; padding: 0 2px; }
.kwp-tile { border: 1px solid var(--line, #ddd); background: var(--surface-2, #f4f4f4); border-radius: 12px; padding: 8px 14px 6px; min-width: 56px;
  text-align: center; cursor: pointer; font: inherit; color: inherit; line-height: 1.2; }
.kwp-tile b { display: block; font-family: Georgia, "Times New Roman", serif; font-size: 30px; font-weight: 600; letter-spacing: .02em; }
.kwp-tile i { display: block; font-style: normal; font-size: 15px; color: var(--accent, #2f6fde); min-height: 18px; margin-top: 2px;
  font-family: "Lucida Sans Unicode", "Segoe UI", "Arial Unicode MS", sans-serif; }
.kwp-tile.stress { border-color: #d0442f; border-width: 2px; }
.kwp-tile.stress b { color: #d0442f; }
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
  function tilesHtml(p, wi) {
    return p.syls.map((s, si) => (si ? '<span class="kwp-dot">·</span>' : '') +
      `<button type="button" class="kwp-tile${s.stress && p.syls.length > 1 ? ' stress' : ''}" data-w="${wi}" data-s="${si}"
        aria-label="${esc(s.g)} /${esc(s.ipa)}/"><b>${esc(s.g)}</b><i>/${esc(s.ipa)}/</i></button>`).join('');
  }
  function notes(p) {
    if (p.syls.length === 1) return '<p class="kwp-note">一个音节，直接读。</p>';
    const st = p.syls.find(s => s.stress);
    return `<p class="kwp-note">${p.syls.length} 个音节：${p.syls.map(s => esc(s.g)).join(' · ')}${st ? `；重读 <b>${esc(st.g)}</b>（红框）` : ''}。</p>`;
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
  function highlight(wi, si) {
    if (!mask) return;
    mask.querySelectorAll('.kwp-tile.on').forEach(el => el.classList.remove('on'));
    if (wi != null) { const el = mask.querySelector(`.kwp-tile[data-w="${wi}"][data-s="${si}"]`); if (el) el.classList.add('on'); }
  }
  // 拼读：一节一节读（高亮当前这节），停一下，再连读整个词；单音节词直接读
  async function spellOut() {
    stop();
    const token = playToken;
    for (let wi = 0; wi < cur.length; wi++) {
      const p = cur[wi];
      if (p.syls.length > 1) {
        for (let si = 0; si < p.syls.length; si++) {
          highlight(wi, si);
          await playSyl(p, p.syls[si], token);
          if (token !== playToken) return;
          await sleep(350);
        }
        highlight(null);
        await sleep(200);
      } else highlight(wi, 0);
      if (token !== playToken) return;
      await playWord(p.word, token);
      highlight(null);
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
    mask.innerHTML = `<div class="kwp-sheet" role="dialog" aria-modal="true" aria-label="音节拼读">
      <div class="kwp-head"><h3>音节拼读</h3><button type="button" class="btn icon" data-act="close" aria-label="关闭">✕</button></div>
      ${zh ? `<p class="kwp-zh">${esc(text)}　${esc(zh)}</p>` : ''}
      ${cur.map((p, wi) => `<div class="kwp-word"><div class="kwp-ipa">${esc(p.word)}　${esc(p.ipa)}</div>
        <div class="kwp-tiles">${tilesHtml(p, wi)}</div>${notes(p)}</div>`).join('')}
      <div class="kwp-acts">
        <button type="button" class="btn primary big" data-act="spell">▶ 拼读</button>
        <button type="button" class="btn big" data-act="word">🔊 连读</button>
      </div>
      <p class="kwp-legend">点一个音节听这一节；「拼读」会一节一节读，再连起来读整个词。红框是重读音节。</p>
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
      if (t) {
        stop();
        const tk = playToken, p = cur[+t.dataset.w];
        highlight(+t.dataset.w, +t.dataset.s);
        playSyl(p, p.syls[+t.dataset.s], tk).then(() => { if (tk === playToken) highlight(null); });
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
    return `<button type="button" class="btn small kwp-btn" data-phonics="${esc(text)}"${zh ? ` data-phonics-zh="${esc(zh)}"` : ''} aria-label="音节拼读">🔤 拼读</button>`;
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
