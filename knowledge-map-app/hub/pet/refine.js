// 把 Quaternius 的低多边形狗在加载时“精修”一遍，不增加安装包体积：
// 1. 各材质的网格合并、焊接重合顶点（原模型是平面着色，每个三角形都有自己的顶点）
// 2. Loop 细分两次（约 2 千 → 3 万个三角形），蒙皮权重跟着插值，动作照常
// 3. 重新算平滑法线，面与面之间不再有棱角
(function () {
  // 合并两个顶点的蒙皮权重（各取一半），只保留最大的 4 个骨骼
  function mixWeights(J, W, a, b, out, o) {
    const m = new Map();
    for (let k = 0; k < 4; k++) {
      if (W[4 * a + k]) m.set(J[4 * a + k], (m.get(J[4 * a + k]) || 0) + W[4 * a + k] * 0.5);
      if (W[4 * b + k]) m.set(J[4 * b + k], (m.get(J[4 * b + k]) || 0) + W[4 * b + k] * 0.5);
    }
    const top = [...m.entries()].sort((x, y) => y[1] - x[1]).slice(0, 4);
    const sum = top.reduce((s, x) => s + x[1], 0) || 1;
    for (let k = 0; k < 4; k++) {
      out.J[4 * o + k] = top[k] ? top[k][0] : 0;
      out.W[4 * o + k] = top[k] ? top[k][1] / sum : 0;
    }
  }

  // 一次 Loop 细分。P 顶点坐标，J/W 蒙皮，F 三角形，M 每个三角形的材质
  function subdivide(P, J, W, F, M) {
    const n = P.length / 3, m = F.length / 3;
    const edgeOf = new Map(), EA = [], EB = [], EO1 = [], EO2 = [], EC = [];
    const faceEdge = new Uint32Array(3 * m);
    for (let f = 0; f < m; f++) {
      for (let k = 0; k < 3; k++) {
        const a = F[3 * f + k], b = F[3 * f + (k + 1) % 3], c = F[3 * f + (k + 2) % 3];
        const key = a < b ? a * n + b : b * n + a;
        let e = edgeOf.get(key);
        if (e === undefined) {
          e = EA.length;
          edgeOf.set(key, e);
          EA.push(a); EB.push(b); EO1.push(c); EO2.push(-1); EC.push(1);
        } else if (++EC[e] === 2) EO2[e] = c;
        faceEdge[3 * f + k] = e;
      }
    }
    const ne = EA.length;
    const nb = new Float64Array(3 * n), nbN = new Uint32Array(n), bd = new Float64Array(3 * n), bdN = new Uint32Array(n);
    for (let e = 0; e < ne; e++) {
      const a = EA[e], b = EB[e], open = EC[e] !== 2;    // 边界边或多于两个面共享的边，按折痕处理
      for (let d = 0; d < 3; d++) {
        nb[3 * a + d] += P[3 * b + d]; nb[3 * b + d] += P[3 * a + d];
        if (open) { bd[3 * a + d] += P[3 * b + d]; bd[3 * b + d] += P[3 * a + d]; }
      }
      nbN[a]++; nbN[b]++;
      if (open) { bdN[a]++; bdN[b]++; }
    }
    const N = n + ne;
    const out = { P: new Float64Array(3 * N), J: new Uint16Array(4 * N), W: new Float32Array(4 * N) };
    for (let v = 0; v < n; v++) {
      for (let d = 0; d < 3; d++) {
        const p = P[3 * v + d];
        let q;
        if (bdN[v] === 2) q = 0.75 * p + 0.125 * bd[3 * v + d];
        else if (bdN[v] > 0) q = p;                                           // 折痕交汇的尖角保持不动
        else { const k = nbN[v], beta = k === 3 ? 3 / 16 : 3 / (8 * k); q = (1 - k * beta) * p + beta * nb[3 * v + d]; }
        out.P[3 * v + d] = q;
      }
      for (let k = 0; k < 4; k++) { out.J[4 * v + k] = J[4 * v + k]; out.W[4 * v + k] = W[4 * v + k]; }
    }
    for (let e = 0; e < ne; e++) {
      const a = EA[e], b = EB[e], o = n + e;
      for (let d = 0; d < 3; d++) {
        out.P[3 * o + d] = EC[e] === 2
          ? 0.375 * (P[3 * a + d] + P[3 * b + d]) + 0.125 * (P[3 * EO1[e] + d] + P[3 * EO2[e] + d])
          : 0.5 * (P[3 * a + d] + P[3 * b + d]);
      }
      mixWeights(J, W, a, b, out, o);
    }
    out.F = new Uint32Array(12 * m);
    out.M = new Uint8Array(4 * m);
    for (let f = 0; f < m; f++) {
      const a = F[3 * f], b = F[3 * f + 1], c = F[3 * f + 2];
      const ab = n + faceEdge[3 * f], bc = n + faceEdge[3 * f + 1], ca = n + faceEdge[3 * f + 2];
      out.F.set([a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca], 12 * f);
      out.M.fill(M[f], 4 * f, 4 * f + 4);
    }
    return out;
  }

  // 把一个 glTF 网格（多个材质各一个 SkinnedMesh）换成细分后的单个 SkinnedMesh
  function refine(root, levels) {
    const parts = [];
    root.traverse(o => { if (o.isSkinnedMesh) parts.push(o); });
    if (!parts.length) return null;
    const first = parts[0];

    // 焊接：同一位置的顶点只留一个（坐标取到 1e-4）
    const id = new Map(), P = [], J = [], W = [], F = [], M = [];
    parts.forEach((mesh, mi) => {
      const g = mesh.geometry, pos = g.attributes.position, si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
      const remap = new Uint32Array(pos.count);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const key = Math.round(x * 1e4) + ',' + Math.round(y * 1e4) + ',' + Math.round(z * 1e4);
        let v = id.get(key);
        if (v === undefined) {
          v = P.length / 3;
          id.set(key, v);
          P.push(x, y, z);
          J.push(si.getX(i), si.getY(i), si.getZ(i), si.getW(i));
          W.push(sw.getX(i), sw.getY(i), sw.getZ(i), sw.getW(i));
        }
        remap[i] = v;
      }
      const idx = g.index;
      const cnt = idx ? idx.count : pos.count;
      for (let t = 0; t < cnt; t += 3) {
        const a = remap[idx ? idx.getX(t) : t], b = remap[idx ? idx.getX(t + 1) : t + 1], c = remap[idx ? idx.getX(t + 2) : t + 2];
        if (a === b || b === c || a === c) continue;
        F.push(a, b, c);
        M.push(mi);
      }
    });
    let d = { P: Float64Array.from(P), J: Uint16Array.from(J), W: Float32Array.from(W), F: Uint32Array.from(F), M: Uint8Array.from(M) };
    for (let l = 0; l < levels; l++) d = subdivide(d.P, d.J, d.W, d.F, d.M);

    // 按材质排序三角形，分组
    const nf = d.F.length / 3, order = Array.from({ length: nf }, (_, i) => i).sort((a, b) => d.M[a] - d.M[b]);
    const index = new Uint32Array(3 * nf);
    const geo = new THREE.BufferGeometry();
    let start = 0;
    order.forEach((f, i) => {
      index[3 * i] = d.F[3 * f]; index[3 * i + 1] = d.F[3 * f + 1]; index[3 * i + 2] = d.F[3 * f + 2];
      if (i === nf - 1 || d.M[order[i + 1]] !== d.M[f]) { geo.addGroup(start * 3, (i + 1 - start) * 3, d.M[f]); start = i + 1; }
    });
    geo.setIndex(new THREE.BufferAttribute(index, 1));
    geo.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(d.P), 3));
    geo.setAttribute('skinIndex', new THREE.BufferAttribute(d.J, 4));
    geo.setAttribute('skinWeight', new THREE.BufferAttribute(d.W, 4));
    geo.computeVertexNormals();

    const mesh = new THREE.SkinnedMesh(geo, parts.map(p => p.material));
    mesh.name = first.name;
    mesh.position.copy(first.position); mesh.quaternion.copy(first.quaternion); mesh.scale.copy(first.scale);
    first.parent.add(mesh);
    mesh.bind(first.skeleton, first.bindMatrix);
    parts.forEach(p => p.parent.remove(p));
    return mesh;
  }

  // 毛发：把身体往法线方向一层层“吹胀”（壳层法），每层按噪声挖掉一部分，外层越稀，看起来就是一簇簇的毛
  // furMats 是长毛的材质序号（Quaternius 的狗：0 主色、2 浅色，1 鼻子、3 以后是眼睛）
  function addFur(mesh, opt) {
    const layers = opt.layers, furMats = opt.mats;
    const geo = mesh.geometry, src = geo.index.array, keep = [];
    const groups = [];
    geo.groups.forEach(g => {
      const i = furMats.indexOf(g.materialIndex);
      if (i < 0) return;
      groups.push({ start: keep.length, count: g.count, materialIndex: i });
      for (let k = g.start; k < g.start + g.count; k++) keep.push(src[k]);
    });
    const shellGeo = new THREE.BufferGeometry();
    ['position', 'normal', 'skinIndex', 'skinWeight'].forEach(n => shellGeo.setAttribute(n, geo.attributes[n]));
    shellGeo.setIndex(new THREE.BufferAttribute(Uint32Array.from(keep), 1));
    groups.forEach(g => shellGeo.addGroup(g.start, g.count, g.materialIndex));

    const shells = [];
    for (let s = 1; s <= layers; s++) {
      const h = s / layers;
      const mats = furMats.map(mi => {
        const m = mesh.material[mi].clone();
        m.onBeforeCompile = sh => {
          sh.uniforms.uFurH = { value: h };
          sh.uniforms.uFurLen = { value: opt.length };
          sh.uniforms.uFurFreq = { value: opt.freq };
          sh.vertexShader = 'uniform float uFurH, uFurLen;\nvarying vec3 vFurPos;\n' + sh.vertexShader
            .replace('#include <skinning_vertex>', [
              '#include <skinning_vertex>',
              '  vFurPos = position;',
              // 按原始模型坐标（狗朝 +Z，身高约 3.1）调毛长：脸上短，小腿稍短
              '  float furK = mix(1.0, 0.35, smoothstep(1.75, 2.05, position.z)) * mix(0.55, 1.0, smoothstep(0.6, 1.3, position.y));',
              '  transformed += normalize(objectNormal) * uFurH * uFurLen * furK;',
              '  transformed.y -= uFurH * uFurH * uFurLen * furK * 0.6;'          // 毛稍往下垂
            ].join('\n'));
          sh.fragmentShader = 'uniform float uFurH, uFurFreq;\nvarying vec3 vFurPos;\n' +
            'float furHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }\n' +
            sh.fragmentShader.replace('#include <color_fragment>', [
              '#include <color_fragment>',
              '  vec3 furP = vFurPos * uFurFreq;',
              '  vec3 furC = floor(furP);',
              '  float furN = furHash(furC);',                                     // 每根毛的长短
              '  float furR = length(fract(furP) - 0.5);',                         // 离毛中心的距离
              '  if (furN < uFurH || furR > 0.62 * (1.0 - uFurH * 0.7)) discard;',  // 越往外越细、越少
              '  diffuseColor.rgb *= mix(0.55, 1.05, uFurH);'                       // 毛根暗、毛尖亮，假装自阴影
            ].join('\n'));
        };
        m.customProgramCacheKey = () => 'kmfur';
        return m;
      });
      const shell = new THREE.SkinnedMesh(shellGeo, mats);
      shell.name = 'fur' + s;
      shell.frustumCulled = false;
      shell.castShadow = false;
      shell.raycast = () => {};
      mesh.parent.add(shell);
      shell.bind(mesh.skeleton, mesh.bindMatrix);
      shells.push(shell);
    }
    return shells;
  }

  window.KMRefine = { refine, addFur };
})();
