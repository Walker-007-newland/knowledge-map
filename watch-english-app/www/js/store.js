// 存储：App 里存成原生文件（一部电影的字幕和精讲包动辄几百 KB，localStorage 装不下几部），浏览器调试时用 localStorage
const N = window.WENative || null;

const Store = {
  get(key, def) {
    try {
      const s = N ? N.load(key) : localStorage.getItem('we:' + key);
      return s ? JSON.parse(s) : def;
    } catch (e) { return def; }
  },
  set(key, val) {
    const s = JSON.stringify(val);
    if (N) { if (!N.save(key, s)) throw new Error('保存失败（存储空间不够？）'); }
    else localStorage.setItem('we:' + key, s);
  },
  remove(key) { N ? N.remove(key) : localStorage.removeItem('we:' + key); },
};

// 难词水平：考试标签不高于它、或词频排名在它的范围内，就算认识
const LEVELS = [
  { lv: 1, name: '初中', rank: 1500 },
  { lv: 2, name: '高中', rank: 3000 },
  { lv: 3, name: '四级', rank: 5000 },
  { lv: 4, name: '六级', rank: 8000 },
  { lv: 5, name: '考研/雅思/托福', rank: 12000 },
  { lv: 6, name: 'GRE', rank: 20000 },
];
const LEVEL_TAG = { 1: '初中', 2: '高中', 3: '四级', 4: '六级', 5: '考研', 6: 'GRE', 9: '超纲' };

const Settings = Object.assign({ level: 3, subMode: 'both', speed: 1, font: 1, quizCount: 10 }, Store.get('settings', {}));
function saveSettings() { Store.set('settings', Settings); }

// 复习间隔（天）：答对一次升一格，答错回到 0；到第 3 格算「已掌握」
const GAPS = [0, 1, 2, 4, 7, 15, 30];
const MASTER_BOX = 3;
function today() { return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000); }

// 全局单词状态（跨电影共用）：{ key: { b: 格, d: 下次复习日, k: 认识, w: 在生词本, n: 测过几次, x: 错几次, m: 电影, ex: 例句, exZh, t: 加入时间 } }
const Words = Store.get('words', {});
let wordsTimer = 0;
function saveWords() { clearTimeout(wordsTimer); wordsTimer = setTimeout(() => Store.set('words', Words), 300); }
function wordRec(key) { return Words[key] || (Words[key] = {}); }
function isKnown(key) { const r = Words[key]; return !!(r && (r.k || (r.b || 0) >= MASTER_BOX)); }
function grade(rec, ok) {
  rec.b = ok ? Math.min((rec.b || 0) + 1, GAPS.length - 1) : 0;
  rec.d = today() + GAPS[rec.b];
  rec.n = (rec.n || 0) + 1;
  if (!ok) rec.x = (rec.x || 0) + 1;
}
