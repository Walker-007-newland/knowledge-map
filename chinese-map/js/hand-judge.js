/* 手写字判分：整字写完后，把孩子写的笔画和标准字的笔画中线（hanzi-writer-data 的 medians）比对
 * 单笔是否吻合照搬 Hanzi Writer（MIT，js/vendor/hanzi-writer.LICENSE.txt）的 strokeMatches：平均距离、起止点、方向、形状（Fréchet 距离）、长度。
 * 不同的是：先把写的整个字按外框对齐到标准字（写偏、写大写小都不要紧），再给笔画配对——
 *   宽松：笔画数相同，且每一笔都能和标准字里不同的一笔对上（不管笔顺、不管起笔方向）
 *   严格：笔画数相同，且第 i 笔对第 i 笔（笔顺、方向都要对）
 * 坐标用字形坐标：x 0–1024，y -124–900，y 向上（同 hanzi-writer-data）。
 *
 * HandJudge.judge(strokes, medians, strict) → true / false     strokes: [[{x,y},…],…]，medians: [[[x,y],…],…]
 * HandJudge.toChar(px, py, size) / fromChar(p, size)   田字格像素坐标 ↔ 字形坐标（和 Hanzi Writer 同样的留白和缩放）
 * HandJudge.svg(strokes, size)     把写的笔画画成 SVG（批改页显示笔迹） */
(function () {
  'use strict';
  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const mag = v => Math.hypot(v.x, v.y);
  const dist = (a, b) => mag(sub(a, b));
  const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
  const lenOf = pts => pts.slice(1).reduce((s, p, i) => s + dist(p, pts[i]), 0);
  // 从 from 到 to 的方向，再从 to 往前延长 d（d 为负就是往回退）
  const extend = (from, to, d) => { const v = sub(to, from), k = d / (mag(v) || 1); return { x: to.x + k * v.x, y: to.y + k * v.y }; };
  const dedupe = pts => pts.filter((p, i) => i === 0 || p.x !== pts[i - 1].x || p.y !== pts[i - 1].y);

  /* ---- 形状比较（Hanzi Writer geometry.ts） ---- */
  function resample(pts, n) {
    const seg = lenOf(pts) / (n - 1), out = [pts[0]], rest = pts.slice(1), last = pts[pts.length - 1];
    for (let i = 0; i < n - 2; i++) {
      let cur = out[out.length - 1], left = seg;
      while (rest.length) {
        const d = dist(cur, rest[0]);
        if (d < left) { left -= d; cur = rest.shift(); } else { out.push(extend(cur, rest[0], left - d)); break; }
      }
      if (!rest.length) break;
    }
    out.push(last);
    return out;
  }
  function normCurve(pts) {
    const r = resample(pts, 30), c = { x: avg(r.map(p => p.x)), y: avg(r.map(p => p.y)) };
    const cs = r.map(p => sub(p, c)), a = cs[0], b = cs[cs.length - 1];
    const sc = Math.sqrt(avg([a.x * a.x + a.y * a.y, b.x * b.x + b.y * b.y])) || 1;
    const ns = cs.map(p => ({ x: p.x / sc, y: p.y / sc })), out = [ns[0]];
    for (const p of ns.slice(1)) {
      const q = out[out.length - 1], d = dist(p, q);
      if (d > 0.05) { const k = Math.ceil(d / 0.05), step = d / k; for (let j = 0; j < k; j++) out.push(extend(p, q, -step * (j + 1))); }
      else out.push(p);
    }
    return out;
  }
  function frechet(c1, c2) {
    const L = c1.length >= c2.length ? c1 : c2, S = c1.length >= c2.length ? c2 : c1;
    let prev = [];
    for (let i = 0; i < L.length; i++) {
      const row = [];
      for (let j = 0; j < S.length; j++) {
        const d = dist(L[i], S[j]);
        if (i === 0 && j === 0) row.push(d);
        else if (j === 0) row.push(Math.max(prev[0], d));
        else if (i === 0) row.push(Math.max(row[j - 1], d));
        else row.push(Math.max(Math.min(prev[j], prev[j - 1], row[j - 1]), d));
      }
      prev = row;
    }
    return prev[S.length - 1];
  }
  const ROTS = [Math.PI / 16, Math.PI / 32, 0, -Math.PI / 32, -Math.PI / 16];
  const rotate = (pts, t) => pts.map(p => ({ x: Math.cos(t) * p.x - Math.sin(t) * p.y, y: Math.sin(t) * p.x + Math.cos(t) * p.y }));
  function shapeFit(user, med, len) {
    const a = normCurve(user), b = normCurve(med);
    return Math.min(...ROTS.map(t => frechet(a, rotate(b, t)))) <= 0.4 * len;
  }
  const vectors = pts => pts.slice(1).map((p, i) => sub(p, pts[i]));
  function directionOk(user, med) {
    const mv = vectors(med);
    return avg(vectors(user).map(v => Math.max(...mv.map(m => (m.x * v.x + m.y * v.y) / (mag(m) * mag(v) || 1))))) > 0;
  }

  /* ---- 单笔是否吻合（Hanzi Writer strokeMatches.ts，阈值同原版去掉轮廓时的设置） ---- */
  const avgDist = (user, med) => avg(user.map(p => Math.min(...med.map(m => dist(p, m)))));
  function strokeMatch(user, med, len, allowBackwards) {
    const ok = avgDist(user, med) <= 350 * 0.5 * len
      && dist(med[0], user[0]) <= 250 * len && dist(med[med.length - 1], user[user.length - 1]) <= 250 * len
      && directionOk(user, med) && shapeFit(user, med, len)
      && len * (lenOf(user) + 25) / (lenOf(med) + 25) >= 0.35;
    return ok || (allowBackwards && strokeMatch(user.slice().reverse(), med, len, false));
  }

  // 手指写的笔画有抖动：5 点滑动平均（保留起止点），免得抖动把笔画长度算长
  function smooth(s) {
    if (s.length < 5) return s;
    return s.map((p, i) => {
      if (i === 0 || i === s.length - 1) return p;
      const w = s.slice(Math.max(0, i - 2), i + 3);
      return { x: avg(w.map(q => q.x)), y: avg(w.map(q => q.y)) };
    });
  }
  // 最小代价完全匹配（匈牙利算法，方阵）：返回 owner[列 j] = 行 i
  function assign(cost) {
    const n = cost.length, u = Array(n + 1).fill(0), v = Array(n + 1).fill(0), p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
      p[0] = i;
      let j0 = 0;
      const minv = Array(n + 1).fill(Infinity), used = Array(n + 1).fill(false);
      do {
        used[j0] = true;
        const i0 = p[j0];
        let delta = Infinity, j1 = 0;
        for (let j = 1; j <= n; j++) {
          if (used[j]) continue;
          const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
          if (minv[j] < delta) { delta = minv[j]; j1 = j; }
        }
        for (let j = 0; j <= n; j++) {
          if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
        }
        j0 = j1;
      } while (p[j0] !== 0);
      do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
    }
    const owner = Array(n).fill(-1);
    for (let j = 1; j <= n; j++) if (p[j]) owner[j - 1] = p[j] - 1;
    return owner;
  }

  /* ---- 整字：外框对齐后配对 ---- */
  function box(strokes) {
    const all = [].concat(...strokes), xs = all.map(p => p.x), ys = all.map(p => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
  }
  // 把写的字缩放平移到标准字的外框；很扁或很窄的一边（如“一”的高）不单独缩放
  function align(user, target) {
    const u = box(user), t = box(target), THIN = 120;
    let sx = u.w > THIN && t.w > THIN ? t.w / u.w : null, sy = u.h > THIN && t.h > THIN ? t.h / u.h : null;
    if (sx === null && sy === null) sx = sy = Math.max(t.w, t.h, 1) / Math.max(u.w, u.h, 1);
    else if (sx === null) sx = sy; else if (sy === null) sy = sx;
    return user.map(s => s.map(p => ({ x: t.cx + (p.x - u.cx) * sx, y: t.cy + (p.y - u.cy) * sy })));
  }
  function judge(strokes, medians, strict, leniency) {
    const target = medians.map(m => m.map(([x, y]) => ({ x, y })));
    const user = strokes.map(dedupe).filter(s => s.length >= 2).map(smooth);
    if (user.length !== target.length) return false;
    if (!aspectOk(user, target)) return false;
    const u = align(user, target), len = leniency || (strict ? 1.2 : 1.5);
    if (strict) return u.every((s, i) => strokeMatch(s, target[i], len, false)) && structureOk(u, target);
    // 宽松：每笔配一个不同的标准笔画，在单笔吻合的配对里取平均距离总和最小的一种（匈牙利算法）
    const INF = 1e9, cost = u.map(s => target.map(m => strokeMatch(s, m, len, true) ? avgDist(s, m) : INF));
    const owner = assign(cost);
    if (owner.some((i, j) => i < 0 || cost[i][j] >= INF)) return false;
    // 按标准笔画的顺序排好；反方向写的笔画倒过来，方便比较起止点
    const paired = owner.map((i, j) => {
      const s = u[i], t = target[j];
      const fwd = dist(s[0], t[0]) + dist(s[s.length - 1], t[t.length - 1]);
      const back = dist(s[s.length - 1], t[0]) + dist(s[0], t[t.length - 1]);
      return back < fwd ? s.slice().reverse() : s;
    });
    return structureOk(paired, target);
  }

  /* ---- 整体结构：单笔都对上以后，再看笔画之间的长短和相对位置（区分 土/士、未/末、己/已、人/入 这类字） ---- */
  // 整字的宽高比不能差太多（日/曰）；很扁或很窄的字不比
  function aspectOk(user, target) {
    const u = box(user), t = box(target);
    if (u.w < 120 || u.h < 120 || t.w < 120 || t.h < 120) return true;
    const r = (u.w / u.h) / (t.w / t.h);
    return r < 1.45 && r > 1 / 1.45;
  }
  function structureOk(u, t) {
    const n = t.length;
    // 长短：标准字里明显长的一笔（长 35% 以上），写的也要比另一笔长
    const lu = u.map(lenOf), lt = t.map(lenOf);
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
      if (lt[a] > 1.35 * lt[b] && !(lu[a] > lu[b])) return false;
    }
    // 起止点的相对位置：一边两个点上下或左右明显错开（200 以上，约字宽的 1/5），另一边也要同向错开，且至少错开它的 1/4
    //（两个方向都查，写的一边阈值 170：标准字里撇起笔略低于横，写成高出横很多也不行，如 天/夫）
    const key = s => [s[0], s[s.length - 1]];
    const pu = [].concat(...u.map(key)), pt = [].concat(...t.map(key));
    for (let a = 0; a < pt.length; a++) for (let b = a + 1; b < pt.length; b++) {
      for (const k of ['x', 'y']) {
        const dt = pt[b][k] - pt[a][k], du = pu[b][k] - pu[a][k];
        if (Math.abs(dt) > 200 && !(du * Math.sign(dt) >= 0.25 * Math.abs(dt))) return false;
        if (Math.abs(du) > 170 && !(dt * Math.sign(du) >= 0.25 * Math.abs(du))) return false;
      }
    }
    return true;
  }

  /* ---- 坐标换算和笔迹显示（同 Hanzi Writer Positioner：字形框 1024×1024，按格子大小留白） ---- */
  const padOf = size => Math.round(size * 0.08);
  function toChar(px, py, size) {
    const pad = padOf(size), k = (size - 2 * pad) / 1024;
    return { x: Math.round((px - pad) / k), y: Math.round((size - pad - py) / k - 124) };
  }
  function fromChar(p, size) {
    const pad = padOf(size), k = (size - 2 * pad) / 1024;
    return { x: pad + p.x * k, y: size - pad - (p.y + 124) * k };
  }
  function svg(strokes, size) {
    const lines = strokes.map(s => `<polyline points="${s.map(p => p.x + ',' + p.y).join(' ')}"/>`).join('');
    return `<svg viewBox="-90 -90 1204 1204" width="${size}" height="${size}" aria-hidden="true"><g transform="translate(0,900) scale(1,-1)" fill="none" stroke="currentColor" stroke-width="48" stroke-linecap="round" stroke-linejoin="round">${lines}</g></svg>`;
  }

  window.HandJudge = { judge, toChar, fromChar, svg };
})();
