// 语音讲解：在各图谱知识点的“讲解”页顶部加一条播放条，按段朗读讲解内容，正在读的段落高亮并滚到中间
// 打包时由 build.ps1 注入每个页面；不改各图谱的代码，只认它们渲染出来的 DOM：
//   数学：#pBody 里的 .learn（中考要求、各小节、容易错的地方）
//   其他科：“讲解”标签页的 #pBody（中考提示 .tipbox、各小节 .sec）
// 朗读走 speechSynthesis；在平板 App 里 km-shim.js 会把它转给安卓系统 TTS
// 公式、单位、符号先转成口语（分数读“几分之几”、cm³ 读“立方厘米”……），英语图谱里的英文用英文语音读
(function () {
  if (window.__kmNarrate || !('speechSynthesis' in window)) return;
  window.__kmNarrate = 1;

  const isEnglish = /english-map/.test(location.pathname);
  const isHistory = /history/.test(location.pathname);
  const RATES = [0.8, 1, 1.25];
  let rateIdx = 1;
  try { const k = RATES.indexOf(+localStorage.getItem('km-narrate-rate')); if (k >= 0) rateIdx = k; } catch (e) { /* 忽略 */ }

  /* ---------------- 样式 ---------------- */
  const css = document.createElement('style');
  css.textContent = `
  .km-narr { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    margin: 0 0 14px; padding: 8px 10px; border-radius: 12px; border: 1px solid rgba(127,127,127,.28);
    box-shadow: 0 4px 14px rgba(0,0,0,.08); font-size: 14px; }
  .km-narr button { font: inherit; color: inherit; background: transparent; border: 1px solid rgba(127,127,127,.35);
    border-radius: 999px; padding: 6px 12px; cursor: pointer; line-height: 1.2; }
  .km-narr button:active { transform: scale(.96); }
  .km-narr .km-play { font-weight: 600; border-color: #3f9d5d; color: #3f9d5d; padding: 6px 16px; }
  .km-narr .km-play.on { background: #3f9d5d; color: #fff; }
  .km-narr .km-pos { opacity: .7; margin-left: auto; font-variant-numeric: tabular-nums; }
  .km-narr button:disabled { opacity: .35; }
  .km-reading { background: rgba(63,157,93,.13) !important; box-shadow: 0 0 0 4px rgba(63,157,93,.13); border-radius: 6px; transition: background .2s; }`;
  document.head.appendChild(css);

  /* ---------------- 找出要读的段落 ---------------- */
  const SKIP = 'svg, canvas, button, input, select, textarea, script, style, rt, .sim, .anim, .km-narr, .next-row, .quiz-foot, [hidden], [aria-hidden="true"]';
  const BLOCK_TAGS = /^(P|LI|H1|H2|H3|H4|TR|DT|DD|FIGCAPTION|BLOCKQUOTE|PRE)$/;

  // 段落 = 有文字、且里面没有别的“段落”的块级元素（表格按行读）
  function blocksOf(root) {
    const out = [];
    (function walk(el) {
      for (const c of el.children) {
        if (c.matches(SKIP)) continue;
        if (!c.textContent.trim()) continue;
        if (c.tagName === 'TR' || BLOCK_TAGS.test(c.tagName) && !c.querySelector('p, li, tr, h3, div.formula, .steps')) { out.push(c); continue; }
        const disp = getComputedStyle(c).display;
        if (/^inline/.test(disp) && c.tagName !== 'TABLE') { out.push(c); continue; }   // 和子块并列的行内文字（如“中考要求”标签）单独成段
        const hasBlockChild = [...c.children].some(k => !k.matches(SKIP) && k.textContent.trim() && !/^inline/.test(getComputedStyle(k).display));
        const ownText = [...c.childNodes].some(k => k.nodeType === 3 && k.nodeValue.trim());
        if (hasBlockChild && !ownText) walk(c);
        else out.push(c);                              // 没有子块，或文字和子块混排：整块一起读
      }
    })(root);
    return out;
  }

  /* ---------------- DOM → 口语文字 ---------------- */
  const SUPN = { '2': '平方', '3': '立方' };
  function domText(node, ctx) {
    if (node.nodeType === 3) return node.nodeValue;
    if (node.nodeType !== 1) return '';
    const el = node;
    if (el.matches(SKIP)) return '';
    const tag = el.tagName;
    if (tag === 'BR') return '，';
    if (el.classList.contains('fr') && el.children.length === 2) {      // 数学分数
      return ' ' + domText(el.children[1], ctx).trim() + '分之' + domText(el.children[0], ctx).trim() + ' ';
    }
    const st = el.getAttribute('style') || '';
    if (/flex-direction:\s*column/.test(st) && el.querySelector('[style*="double"]')) {   // 化学方程式的反应条件和等号
      const parts = [...el.children].map(k => domText(k, ctx).trim()).filter(Boolean);
      return parts.length ? '，' + parts.join('、').replace(/△/g, '加热') + '，生成 ' : ' 生成 ';
    }
    const inChem = ctx.chem || el.classList.contains('chem') || el.classList.contains('formula') && /[A-Z][a-z]?\d/.test(el.textContent);
    const sub = { chem: inChem };
    let s = '';
    for (const c of el.childNodes) s += domText(c, sub);
    if (tag === 'SUP') {
      const t = s.trim();
      if (inChem && /^\d*[+\-−]$/.test(t)) {                            // 离子电荷
        const n = t.slice(0, -1) || '1';
        return '（带' + n + '个单位' + (t.endsWith('+') ? '正' : '负') + '电荷）';
      }
      return '^' + t.replace(/^[−-]/, '-') + ' ';
    }
    if (tag === 'SUB') return inChem ? s : s;                           // H₂O 读成 H2O，v₁ 读成 v1
    if (tag === 'TD' || tag === 'TH') return s + '，';
    if (BLOCK_TAGS.test(tag) || tag === 'DIV') return s;
    // 并排的小方块（inline-block 之类）之间停顿一下，免得连成一串
    if (/^inline-(block|flex|grid)$/.test(getComputedStyle(el).display)) return s + '，';
    return s;
  }

  // 单位：带 / ^ · 的复合单位到处都换；单个单位只在数字后面才换，免得把变量（V、m、s）和英文单词当成单位
  const UNITS = [
    ['J/(kg·℃)', '焦每千克摄氏度'], ['kg·m^-3', '千克每立方米'], ['g·cm^-3', '克每立方厘米'], ['m·s^-1', '米每秒'], ['km·h^-1', '千米每小时'],
    ['g/cm^3', '克每立方厘米'], ['kg/m^3', '千克每立方米'], ['km/h', '千米每小时'], ['m/s', '米每秒'], ['N/kg', '牛每千克'], ['J/kg', '焦每千克'], ['J/m^3', '焦每立方米'],
    ['kW·h', '千瓦时'], ['km^2', '平方千米'], ['dm^2', '平方分米'], ['cm^2', '平方厘米'], ['mm^2', '平方毫米'], ['m^2', '平方米'],
    ['dm^3', '立方分米'], ['cm^3', '立方厘米'], ['mm^3', '立方毫米'], ['m^3', '立方米'],
    ['kWh', '千瓦时'], ['km', '千米'], ['dm', '分米'], ['cm', '厘米'], ['mm', '毫米'], ['μm', '微米'], ['nm', '纳米'], ['kg', '千克'], ['mg', '毫克'], ['mL', '毫升'], ['ml', '毫升'],
    ['kPa', '千帕'], ['Pa', '帕'], ['kW', '千瓦'], ['kJ', '千焦'], ['mA', '毫安'], ['kV', '千伏'], ['Hz', '赫兹'], ['dB', '分贝'], ['mol', '摩尔'], ['min', '分钟'],
    ['m', '米'], ['g', '克'], ['t', '吨'], ['L', '升'], ['s', '秒'], ['h', '小时'], ['N', '牛'], ['J', '焦'], ['W', '瓦'], ['V', '伏'], ['A', '安'], ['Ω', '欧']
  ];
  const esc = s => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  const isCompound = u => /[/^·]/.test(u);
  const UNIT_MAP = Object.fromEntries(UNITS);
  const COMPOUND_RE = new RegExp('(?<![A-Za-z])(' + UNITS.filter(u => isCompound(u[0])).map(u => esc(u[0])).join('|') + ')(?![A-Za-z0-9^])', 'g');
  const UNIT_RE = new RegExp('(\\d)\\s*(' + UNITS.filter(u => !isCompound(u[0])).map(u => esc(u[0])).join('|') + ')(?![A-Za-z0-9^])', 'g');
  // Unicode 上下标（10³、m⁻³、v₁）统一成 ^ 写法和普通数字
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹⁻', SUB = '₀₁₂₃₄₅₆₇₈₉';
  const normScripts = s => s
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, m => '^' + [...m].map(c => '0123456789-'[SUP.indexOf(c)]).join('') + ' ')
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => String(SUB.indexOf(c)));

  const SYMS = [
    [/℃/g, '摄氏度'], [/(\d)\s*°\s*(\d+)\s*′/g, '$1度$2分'], [/°/g, '度'], [/′/g, '分'], [/″/g, '秒'],
    [/×/g, '乘'], [/÷/g, '除以'], [/≈/g, '约等于'], [/≠/g, '不等于'], [/≥/g, '大于等于'], [/≤/g, '小于等于'],
    [/±/g, '正负'], [/√/g, '根号'], [/π/g, '派'], [/∠/g, '角'], [/△/g, '三角形'], [/⊥/g, '垂直于'], [/∥/g, '平行于'],
    [/≌/g, '全等于'], [/∽/g, '相似于'], [/⊙/g, '圆'], [/∵/g, '因为'], [/∴/g, '所以'], [/∶/g, '比'],
    [/ρ/g, '肉'], [/Ω/g, '欧'], [/Δ/g, '德尔塔'], [/α/g, '阿尔法'], [/β/g, '贝塔'], [/θ/g, '西塔'], [/λ/g, '兰姆达'], [/μ/g, '缪'],
    [/→/g, '，变为，'], [/⇌/g, '，可逆生成，'], [/[①②③④⑤⑥⑦⑧⑨]/g, c => '第' + ('①②③④⑤⑥⑦⑧⑨'.indexOf(c) + 1) + '，'],
    [/(\d)\s*[～~]\s*(\d)/g, '$1到$2'], [/[～~]/g, '到'], [/…+/g, '，'], [/—+/g, '，'], [/[📌⭐★☆✓✗✔✘]/gu, '']
  ];

  function speakable(raw, chem) {
    let s = normScripts(raw).replace(/　+/g, '，').replace(/\s+/g, ' ');     // 全角空格常用来分隔并列的几组
    s = s.replace(/\^\s+/g, '^').replace(/(\^-?\d+)\s+(?=[\/·)])/g, '$1');   // “cm^3 /” 之类去掉多余空格，好匹配单位
    s = s.replace(COMPOUND_RE, u => UNIT_MAP[u]).replace(UNIT_RE, (m, d, u) => d + UNIT_MAP[u]);
    // 表头“V/cm³”“密度/(kg·m⁻³)”：斜杠后面是单位，读成“，单位……”
    s = s.replace(/\s*\/\s*(?=\(?\s*(?:千克|克|立方|平方|千米|厘米|毫米|分米|米|秒|小时|分钟|牛|焦|千瓦|瓦|伏|安|欧|帕|千帕|摄氏度|毫升|升|摩尔|赫兹|分贝|吨))/g, '，单位');
    if (chem) s = s.replace(/↑/g, '').replace(/↓/g, '');
    s = s.replace(/([A-Za-z0-9)])\s*[↑↓]/g, '$1');                    // 紧跟化学式的 ↑↓ 是气体、沉淀符号，不读
    s = s.replace(/(?<![A-Za-z0-9)\]]\s*)\+\s*(?=\d)/g, '正');            // 前面不是数或式子的 +，如“+2 价”
    s = s.replace(/↑/g, '升高').replace(/↓/g, '降低');
    s = s.replace(/(\d+(?:\.\d+)?)\s*%/g, '百分之$1');
    // 日期 1911.10.10 → 1911年10月10日；历史图谱里 1912.1 这样的年月也换
    s = s.replace(/\b(1\d{3}|20\d{2})\.(1[0-2]|0?[1-9])\.(3[01]|[12]\d|0?[1-9])\b/g, '$1年$2月$3日');
    if (isHistory) s = s.replace(/\b(1\d{3}|20\d{2})\.(1[0-2]|0?[1-9])\b(?!\.\d)/g, '$1年$2月');
    // 乘方：x^2 → x的平方
    s = s.replace(/\^(-?)(\d+|[a-zA-Z])\s?/g, (m, neg, n) => '的' + (neg ? '负' + n + '次方' : (SUPN[n] || n + '次方')));
    s = s.replace(/\^\s?/g, '');
    // 数字分数 3/8 → 8分之3；字母相除 s/t → s除以t
    s = s.replace(/(\d+)\s*\/\s*(\d+)/g, '$2分之$1');
    s = s.replace(/([A-Za-z0-9)])\s*\/\s*([A-Za-z0-9(])/g, '$1除以$2');
    s = s.replace(/\//g, '或');
    SYMS.forEach(([re, to]) => { s = s.replace(re, to); });
    // 加减乘等
    s = s.replace(/(?<![A-Za-z0-9)\]]\s*)[−-]\s*(?=\d)/g, '负');      // 前面不是数或式子的减号是负号
    s = s.replace(/\s*[−–]\s*/g, '减').replace(/(\S)\s+-\s+(\S)/g, '$1减$2');
    s = s.replace(/\s*\+\s*/g, '加').replace(/\s*=\s*/g, '等于').replace(/\s*<\s*/g, '小于').replace(/\s*>\s*/g, '大于');
    s = s.replace(/([A-Za-z0-9])·([A-Za-z0-9])/g, '$1乘$2').replace(/·/g, '');
    return s.replace(/\s+/g, ' ').trim();
  }

  // 一个段落 → 朗读片段 [{text, lang}]；英语图谱里英文和中文分开读
  function partsOf(el) {
    let raw = domText(el, { chem: !!el.closest('.chem') });
    if (el.querySelector('.secno')) raw = raw.replace(/^\s*(\d+)\s*/, '第$1部分，');   // 数学小节编号
    if (!isEnglish) {
      const t = speakable(raw, false);
      return t ? splitLong(t).map(text => ({ text, lang: 'zh-CN' })) : [];
    }
    const out = [];
    const re = /[A-Za-z][A-Za-z'’\-]*(?:[\s,.!?;:"“”]+[A-Za-z][A-Za-z'’\-]*)*[.!?]?/g;
    let last = 0, m;
    const push = (text, lang) => { text = text.trim(); if (text && /[\p{L}\p{N}]/u.test(text)) splitLong(text).forEach(t => out.push({ text: t, lang })); };
    while ((m = re.exec(raw))) {
      if (m[0].replace(/[^A-Za-z]/g, '').length < 2) continue;          // 单个字母（如选项 A）跟着中文读
      push(speakable(raw.slice(last, m.index), false), 'zh-CN');
      push(m[0], 'en-US');
      last = m.index + m[0].length;
    }
    push(speakable(raw.slice(last), false), 'zh-CN');
    return out;
  }
  // 太长的段落按句子拆开（部分浏览器长句会读到一半中断）
  function splitLong(t) {
    if (t.length <= 120) return [t];
    const out = [];
    let cur = '';
    t.split(/(?<=[。！？；!?;])/).forEach(p => {
      if ((cur + p).length > 120 && cur) { out.push(cur); cur = ''; }
      cur += p;
    });
    if (cur) out.push(cur);
    return out;
  }

  /* ---------------- 播放 ---------------- */
  let state = null;   // { root, bar, blocks, i, part, gen, playing }
  let zhVoice = null, enVoice = null;
  function pickVoices() {
    const vs = speechSynthesis.getVoices() || [];
    zhVoice = vs.find(v => /^zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
    enVoice = vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  }
  pickVoices();
  try { speechSynthesis.addEventListener('voiceschanged', pickVoices); } catch (e) { /* App 里没有 */ }

  function mark(i) {
    state.blocks.forEach((b, k) => b.classList.toggle('km-reading', k === i));
    const b = state.blocks[i];
    if (b) b.scrollIntoView({ block: 'center', behavior: 'smooth' });
    updateBar();
  }

  function speakNext() {
    const s = state;
    if (!s || !s.playing) return;
    for (;;) {
      if (s.i >= s.blocks.length) { stop(true); return; }
      if (!s.parts) { s.parts = partsOf(s.blocks[s.i]); s.part = 0; mark(s.i); }
      if (s.part < s.parts.length) break;
      s.i++; s.parts = null;
    }
    const p = s.parts[s.part++];
    const u = new SpeechSynthesisUtterance(p.text);
    u.lang = p.lang;
    u.rate = RATES[rateIdx] * (p.lang === 'en-US' ? 0.9 : 1);
    const v = p.lang === 'en-US' ? enVoice : zhVoice;
    if (v) u.voice = v;
    const gen = s.gen;
    u.onend = () => { if (state === s && s.gen === gen) speakNext(); };
    u.onerror = () => { if (state === s && s.gen === gen) pause(); };      // 被别的朗读打断（如点了例句）就暂停
    speechSynthesis.speak(u);
  }

  function play() {
    if (!state) return;
    state.playing = true;
    state.gen++;
    state.parts = null;                      // 从当前段开头读
    speechSynthesis.cancel();
    speakNext();
    updateBar();
  }
  function pause() {
    if (!state) return;
    state.playing = false;
    state.gen++;
    speechSynthesis.cancel();
    updateBar();
  }
  function stop(finished) {
    if (!state) return;
    state.playing = false;
    state.gen++;
    if (!finished) speechSynthesis.cancel();
    state.blocks.forEach(b => b.classList.remove('km-reading'));
    if (finished) state.i = 0;
    updateBar();
  }
  function jump(d) {
    if (!state) return;
    state.i = Math.max(0, Math.min(state.blocks.length - 1, state.i + d));
    state.parts = null;
    if (state.playing) play();
    else mark(state.i);
  }

  function updateBar() {
    if (!state || !state.bar) return;
    const b = state.bar, n = state.blocks.length;
    const playBtn = b.querySelector('.km-play');
    playBtn.textContent = state.playing ? '⏸ 暂停' : (state.i > 0 ? '▶ 继续听' : '🔊 听讲解');
    playBtn.classList.toggle('on', state.playing);
    b.querySelector('.km-prev').disabled = state.i <= 0;
    b.querySelector('.km-next').disabled = state.i >= n - 1;
    b.querySelector('.km-rate').textContent = RATES[rateIdx] + '×';
    b.querySelector('.km-pos').textContent = (state.playing || state.i > 0 ? (state.i + 1) + ' / ' : '共 ') + n + ' 段';
  }

  function solidBg(el) {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const c = getComputedStyle(e).backgroundColor;
      if (c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c)) return c;
    }
    return getComputedStyle(document.body).backgroundColor || '#fff';
  }

  function attach(root) {
    const blocks = blocksOf(root);
    if (!blocks.length) return;
    const bar = document.createElement('div');
    bar.className = 'km-narr';
    bar.innerHTML = '<button type="button" class="km-play">🔊 听讲解</button><button type="button" class="km-prev" aria-label="上一段">⏮</button>' +
      '<button type="button" class="km-next" aria-label="下一段">⏭</button><button type="button" class="km-rate" aria-label="语速"></button><span class="km-pos"></span>';
    bar.style.background = solidBg(root);
    root.insertBefore(bar, root.firstChild);
    if (state && state.playing) stop();
    state = { root, bar, blocks, i: 0, part: 0, parts: null, gen: 0, playing: false };
    bar.querySelector('.km-play').onclick = () => (state.playing ? pause() : play());
    bar.querySelector('.km-prev').onclick = () => jump(-1);
    bar.querySelector('.km-next').onclick = () => jump(1);
    bar.querySelector('.km-rate').onclick = () => {
      rateIdx = (rateIdx + 1) % RATES.length;
      try { localStorage.setItem('km-narrate-rate', RATES[rateIdx]); } catch (e) { /* 忽略 */ }
      if (state.playing) play(); else updateBar();
    };
    // 正在听的时候点某一段，就从那一段开始读
    root.addEventListener('click', e => {
      if (!state || state.root !== root || !state.playing || e.target.closest('button, a, input, .km-narr')) return;
      const k = state.blocks.findIndex(b => b.contains(e.target));
      if (k >= 0 && k !== state.i) { state.i = k; play(); }
    });
    updateBar();
  }

  /* ---------------- 盯住页面：讲解页出现就加播放条，离开就停 ---------------- */
  function learnRoot() {
    const m = document.querySelector('#pBody > .learn');                                  // 数学
    if (m) return m;
    const tab = document.querySelector('.tabs .tab.on[data-tab="learn"]');
    const body = document.querySelector('#pBody');
    if (tab && body && body.querySelector('.sec, .tipbox')) return body;                  // 其他科
    return null;
  }
  let pending = 0;
  function check() {
    pending = 0;
    if (state && !state.root.isConnected) { stop(); state = null; }
    const root = learnRoot();
    if (root && !root.querySelector(':scope > .km-narr')) attach(root);
    if (state && state.root.isConnected && !learnRoot()) { stop(); state = null; }
  }
  const start = () => {
    new MutationObserver(() => { if (!pending) pending = setTimeout(check, 60); }).observe(document.body, { childList: true, subtree: true });
    check();
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  window.addEventListener('pagehide', () => { try { speechSynthesis.cancel(); } catch (e) { /* 忽略 */ } });
  window.__kmNarrateText = el => partsOf(el);   // 调试用：看某段会读成什么
})();
