/* 手写田字格（古诗词默写 moxie.html 用；生字词听写 tingxie-run.js 里有一份同样做法的代码）
 * 写的时候不判断、不提示；判分用 js/hand-judge.js，笔画数据 data/tingxie/strokes/sNN.js 按需载入，批改页用 Hanzi Writer 演示笔顺。
 *
 *   HandPad.load(text)                      载入这些字的笔画数据 → Promise
 *   const pad = HandPad.create(el, text, ink, onInk)   在 el 里画 text 个字的田字格；ink 是之前写过的笔迹（可省）
 *       pad.undo() / pad.clear()            撤销一笔 / 全部重写
 *       onInk(ink)                          每写完一笔回调，ink = [每个字的笔画 [[{x,y}…]…]]（字形坐标）
 *   HandPad.hasInk(ink)                     写过没有
 *   HandPad.judge(text, ink, strict)        → { ok, bad: [写错的字的序号], none: 一笔没写 }；没有笔画数据的字不算错
 *   HandPad.inkHTML(text, ink, res, attrs)  批改页显示笔迹：每字一个小格，判错的字红框（按钮，带 attrs 里的 data-*）
 *   HandPad.toggleDemo(btn, char, inkOfChar)  点红框：演示正确笔顺 / 回到自己写的 */
(function () {
  'use strict';
  window.KT = window.KT || {};
  KT.strokes = KT.strokes || {};
  KT.addStrokes = KT.addStrokes || function (m) { Object.assign(this.strokes, m); };
  const isHan = c => c >= '㐀' && c <= '鿿';
  const charsOf = text => [...String(text)].filter(isHan);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const loaded = new Set(), loading = {};
  function load(text) {
    const ns = [...new Set(charsOf(text).map(c => c.codePointAt(0) % 16))].filter(n => !loaded.has(n));
    return Promise.all(ns.map(n => loading[n] || (loading[n] = new Promise((ok, bad) => {
      const s = document.createElement('script');
      s.src = 'data/tingxie/strokes/s' + String(n).padStart(2, '0') + '.js';
      s.onload = () => { loaded.add(n); ok(); };
      s.onerror = () => { delete loading[n]; bad(new Error('笔画数据加载失败')); };
      document.head.appendChild(s);
    }))));
  }

  function create(el, text, ink, onInk) {
    const chars = charsOf(text);
    const avail = Math.min(el.clientWidth || 600, 760);
    const gap = avail < 420 ? 6 : 10;
    // 一行最多放 7 个格子，字多就换行
    const perRow = Math.min(chars.length, 7);
    const size = Math.max(60, Math.min(150, Math.floor((avail - gap * (perRow - 1)) / perRow)));
    const pad = { chars, size, ink: Array.isArray(ink) && ink.length === chars.length ? ink : chars.map(() => []), order: [], alive: true };
    el.style.gap = gap + 'px';
    el.innerHTML = chars.map(() => `<canvas class="hbox" style="width:${size}px;height:${size}px"></canvas>`).join('');
    const boxes = [...el.children];
    boxes.forEach((cv, k) => initBox(pad, cv, k, onInk));
    pad.undo = () => {
      let k = pad.order.pop();
      if (k === undefined) for (k = pad.ink.length - 1; k >= 0 && !pad.ink[k].length; k--);
      if (k < 0 || !pad.ink[k].length) return;
      pad.ink[k].pop();
      boxes[k].redraw();
      if (onInk) onInk(pad.ink);
    };
    pad.clear = () => {
      pad.ink.forEach(c => { c.length = 0; }); pad.order = [];
      boxes.forEach(cv => cv.redraw());
      if (onInk) onInk(pad.ink);
    };
    pad.destroy = () => { pad.alive = false; el.innerHTML = ''; };
    return pad;
  }
  function initBox(pad, cv, k, onInk) {
    const size = pad.size, dpr = window.devicePixelRatio || 1;
    cv.width = cv.height = Math.round(size * dpr);
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = '#222'; ctx.lineWidth = Math.max(3, size / 26);
    const px = p => HandJudge.fromChar(p, size);
    const drawStroke = st => { ctx.beginPath(); st.forEach((p, n) => { const q = px(p); if (n) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke(); };
    cv.redraw = () => { ctx.clearRect(0, 0, size, size); pad.ink[k].forEach(drawStroke); };
    cv.redraw();
    let cur = null;
    const at = e => { const r = cv.getBoundingClientRect(); return HandJudge.toChar(e.clientX - r.left - cv.clientLeft, e.clientY - r.top - cv.clientTop, size); };
    cv.addEventListener('pointerdown', e => {
      if (!pad.alive) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* 模拟事件没有真实指针 */ }
      cur = [at(e)];
    });
    cv.addEventListener('pointermove', e => {
      if (!cur) return;
      const p = at(e), last = cur[cur.length - 1];
      if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) < 6) return;
      cur.push(p);
      const a = px(last), b = px(p);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    const end = () => {
      if (!cur) return;
      // 只点了一下：当作一个向右下的短点
      if (cur.length === 1) cur.push({ x: cur[0].x + 25, y: cur[0].y - 25 });
      pad.ink[k].push(cur); pad.order.push(k); cur = null;
      cv.redraw();
      if (pad.alive && onInk) onInk(pad.ink);
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
  }

  const hasInk = ink => Array.isArray(ink) && ink.some(c => c.length);
  function judge(text, ink, strict) {
    if (!hasInk(ink)) return { ok: false, bad: [], none: true };
    const bad = [];
    charsOf(text).forEach((c, k) => {
      if (KT.strokes[c] && !HandJudge.judge(ink[k] || [], KT.strokes[c].medians, strict)) bad.push(k);
    });
    return { ok: !bad.length, bad };
  }
  function inkHTML(text, ink, res, attrs) {
    if (res.none) return '<div class="ans">（没写）</div>';
    const data = Object.keys(attrs || {}).map(k => ` data-${k}="${esc(attrs[k])}"`).join('');
    return '<div class="ink">' + charsOf(text).map((c, k) => res.bad.includes(k)
      ? `<button class="ink-c bad"${data} data-k="${k}" aria-label="看“${esc(c)}”的正确笔顺">${HandJudge.svg(ink[k] || [], 54)}</button>`
      : `<span class="ink-c">${HandJudge.svg(ink[k] || [], 54)}</span>`).join('') + '</div>';
  }
  function toggleDemo(btn, c, inkOfChar) {
    if (btn.dataset.demo) { delete btn.dataset.demo; btn.innerHTML = HandJudge.svg(inkOfChar || [], 54); return; }
    if (!window.HanziWriter || !KT.strokes[c]) return;
    btn.dataset.demo = 1; btn.innerHTML = '';
    HanziWriter.create(btn, c, { width: 54, height: 54, padding: 4, showOutline: true, strokeColor: '#d33',
      strokeAnimationSpeed: 1.5, delayBetweenStrokes: 150, charDataLoader: (ch, ok) => ok(KT.strokes[ch]) }).animateCharacter();
  }

  window.HandPad = { load, create, hasInk, judge, inkHTML, toggleDemo, charsOf };
})();
