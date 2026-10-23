// 升级前后「我的数据」导出文件对照（#12 验收 A1：升级、注册 / 登录前后学习记录只增不减）。不打包进 App。
//
// 用法一（浏览器，推荐；本机没装 Node.js 也能用）：打开 knowledge-map-app/tools/compare-export.html，选「前」「后」两个导出文件。
// 用法二（Node.js）：node knowledge-map-app/tools/compare-export.js 前.json 后.json     全部通过退出码 0，否则 1
//
// 检查三件事，逐键列表：
//   1. merge(前, 后) == 后：用 App 自己的合并规则（hub/km-data.js 的 KMData.merge）把「前」并进「后」，结果和「后」一样，说明「后」已经包含「前」的全部记录
//   2. 逐键、逐条没有丢：「前」里每个键、每一条（知识点、错题、草稿、单词、词单……）在「后」里都还在；有删除记录的单独标出来
//   3. 小狗骨头等于公式值：bones == 3×已领知识点数 − 花费 − 旧花费 − 装扮总价（KMData.petBones）
(function (root) {
  function compare(K, beforeText, afterText) {
    const out = { ok: true, rows: [], notes: [] };
    const pb = K.parseFile(beforeText), pa = K.parseFile(afterText);
    if (!pb.ok) return { ok: false, rows: [], notes: ['「前」文件：' + pb.error] };
    if (!pa.ok) return { ok: false, rows: [], notes: ['「后」文件：' + pa.error] };
    const B = pb.pkg, A = pa.pkg;
    const canon = K._canon;
    const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
    // 1. 只增不减
    const merged = K.merge(A, B).result, self = K.merge(A, A).result;
    const same = canon(merged) === canon(self);
    if (!same) out.ok = false;
    const diffKeys = same ? [] : Object.keys(Object.assign({}, merged.keys, self.keys, merged.meta, self.meta))
      .filter(k => canon(merged.keys[k]) !== canon(self.keys[k]) || canon(merged.meta[k]) !== canon(self.meta[k]))
      .map(k => canon(merged.keys[k]) !== canon(self.keys[k]) ? k : k + '（修改记录）');
    out.merge = { same, diffKeys };
    // 2. 逐键、逐条
    const spec = {};
    K.KEYS.forEach(s => { spec[s.key] = s; });
    const names = Array.from(new Set(Object.keys(B.keys).concat(Object.keys(A.keys)))).sort((x, y) => {
      const i = K.KEYS.findIndex(s => s.key === x), j = K.KEYS.findIndex(s => s.key === y);
      return (i < 0 ? 999 : i) - (j < 0 ? 999 : j) || (x < y ? -1 : 1);
    });
    const itemsOf = (s, v) => {
      if (v === undefined) return null;
      if (s && s.items === 'obj') return isObj(v) ? Object.keys(v) : [];
      if (s && s.items === 'dict') return isObj(v) && Array.isArray(v.lists) ? v.lists.map(l => String(l && l.id)) : [];
      return ['*'];
    };
    names.forEach(k => {
      const s = spec[k];
      const ib = itemsOf(s, B.keys[k]), ia = itemsOf(s, A.keys[k]);
      const row = { key: k, name: s ? s.name : k, before: ib ? ib.length : 0, after: ia ? ia.length : 0, lost: [], deleted: [], status: 'ok' };
      if (ib && !ia) { row.lost = ib.slice(); }
      else if (ib && ia) {
        const set = new Set(ia), meta = isObj(A.meta[k]) ? A.meta[k] : {};
        ib.forEach(id => {
          if (set.has(id)) return;
          const e = meta[id];
          if (isObj(e) && e.x && e.x >= (e.t || 0)) row.deleted.push(id); else row.lost.push(id);
        });
      }
      // 整键（设置、诊断、学习时长、小狗）：「后」并上「前」不变就算没丢
      if (!row.lost.length && ib && ia && (!s || !s.items)) {
        const one = (p, key) => ({ device: p.device, keys: p.keys[key] === undefined ? {} : { [key]: p.keys[key] }, meta: p.meta[key] ? { [key]: p.meta[key] } : {} });
        const m1 = K.merge(one(A, k), one(B, k)).result.keys[k], m0 = K.merge(one(A, k), one(A, k)).result.keys[k];
        if (canon(m1) !== canon(m0)) row.lost = ['（整键：前的内容没有被后包含）'];
      }
      if (row.lost.length) { row.status = 'lost'; out.ok = false; }
      else if (row.deleted.length) row.status = 'deleted';
      out.rows.push(row);
    });
    // 3. 骨头
    const pets = [['前', B], ['后', A]].map(([label, p]) => {
      const st = p.keys['km-pet-v1'];
      if (!isObj(st) || typeof st.bones !== 'number') return { label, has: false };
      const n = K.normPet(st, p.device && p.device.id);
      const want = K.petBones(n);
      return { label, has: true, bones: st.bones, formula: want, ok: st.bones === want, name: st.name };
    });
    out.pets = pets;
    pets.forEach(p => { if (p.has && !p.ok) out.ok = false; });
    if (pets[0].has && !pets[1].has) { out.ok = false; out.notes.push('「前」有小狗，「后」没有'); }
    return out;
  }

  function text(r) {
    const L = [];
    L.push(r.ok ? '结论：全部通过（只增不减、逐条没有丢、骨头等于公式值）' : '结论：没通过，见下面标 ✗ 的行');
    (r.notes || []).forEach(n => L.push('  ' + n));
    if (r.merge) L.push((r.merge.same ? '✓' : '✗') + ' merge(前, 后) == 后' + (r.merge.same ? '' : '：这些键不一样 ' + r.merge.diffKeys.join('、')));
    (r.pets || []).forEach(p => { if (p.has) L.push((p.ok ? '✓' : '✗') + ' 小狗（' + p.label + '）「' + p.name + '」骨头 ' + p.bones + '，公式值 ' + p.formula); });
    L.push('');
    L.push('键 | 前 | 后 | 结果');
    (r.rows || []).forEach(x => L.push([x.name + '（' + x.key + '）', x.before, x.after,
      x.status === 'ok' ? '✓' : x.status === 'deleted' ? '⚠ 有删除记录：' + x.deleted.join(',') : '✗ 少了：' + x.lost.slice(0, 20).join(',')].join(' | ')));
    return L.join('\n');
  }

  const api = { compare, text };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KMCompare = api;

  // ---------------- Node.js 命令行：在沙箱里加载 App 的 km-study.js、pet-core.js、km-data.js ----------------
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    const fs = require('fs'), path = require('path'), vm = require('vm');
    const [, , fb, fa] = process.argv;
    if (!fb || !fa) { console.log('用法：node compare-export.js 前.json 后.json'); process.exit(2); }
    const hub = path.join(__dirname, '..', 'hub');
    const store = new Map();
    function Storage() { }
    Storage.prototype.getItem = function (k) { return store.has(k) ? store.get(k) : null; };
    Storage.prototype.setItem = function (k, v) { store.set(k, String(v)); };
    Storage.prototype.removeItem = function (k) { store.delete(k); };
    const sandbox = { console, Storage, setTimeout, clearTimeout, Date, Math, JSON, Promise, Set, Map, Array, Object, Number, String, Uint8Array, isFinite };
    sandbox.window = sandbox;
    sandbox.localStorage = new Storage();
    sandbox.addEventListener = () => {};
    sandbox.document = { addEventListener: () => {}, visibilityState: 'visible' };
    sandbox.location = { protocol: 'file:', pathname: '/tools/compare.html', hostname: '' };
    sandbox.CustomEvent = function () {};
    sandbox.dispatchEvent = () => {};
    sandbox.crypto = { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a; } };
    vm.createContext(sandbox);
    ['km-study.js', 'pet/pet-core.js', 'km-data.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(hub, f), 'utf8'), sandbox, { filename: f }));
    const r = compare(sandbox.KMData, fs.readFileSync(fb, 'utf8'), fs.readFileSync(fa, 'utf8'));
    console.log(text(r));
    process.exit(r.ok ? 0 : 1);
  }
})(typeof window !== 'undefined' ? window : this);
