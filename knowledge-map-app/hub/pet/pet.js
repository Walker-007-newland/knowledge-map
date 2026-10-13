// 宠物页：three.js 渲染 Quaternius 的狗模型（CC0），喂食、摸摸、扔球、装扮、成长
// 模型和 three.js 都用普通 <script> 引入：App 从 file:// 打开页面，不能用 ES 模块，也不能 XHR 读本地文件
(function () {
  const P = window.KMPet;
  const $ = id => document.getElementById(id);
  let st = P.load();
  if (st) P.tick(st);

  /* ---------------- 场景 ---------------- */
  THREE.ColorManagement.legacyMode = false;   // 配件颜色按 sRGB 填写
  const stageEl = $('stage');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stageEl.insertBefore(renderer.domElement, stageEl.firstChild);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
  const LOOK = new THREE.Vector3(0, 0.42, 0);

  // 电影感色调 + 室内环境光照（给眼睛、鼻子柔和的反光）
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new THREE.RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x8a7a5a, 0.55));
  const rim = new THREE.DirectionalLight(0xdfe9ff, 0.7);   // 背后的轮廓光，勾出毛边
  rim.position.set(-2.2, 2.5, -3);
  scene.add(rim);
  const sun = new THREE.DirectionalLight(0xfff1dc, 1.1);
  sun.position.set(1.8, 4, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 10 });
  sun.shadow.radius = 4;
  scene.add(sun);

  // 地面：边缘渐隐的草地圆盘 + 接收阴影的透明层
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  const groundTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 30, 128, 128, 128);
    const col = cssVar('--ground') || '#cfe0b5';
    grd.addColorStop(0, col); grd.addColorStop(0.7, col); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  })();
  const ground = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), new THREE.MeshBasicMaterial({ map: groundTex, transparent: true, depthWrite: false, toneMapped: false }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const shadowCatcher = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48), new THREE.ShadowMaterial({ opacity: 0.22 }));
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = 0.002;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  function resize() {
    const w = stageEl.clientWidth, h = stageEl.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // 竖屏时往后退一点，保证整只狗都在画面里
    const dist = 3.2 * Math.max(1, 1.15 / camera.aspect);
    camera.position.set(0, 1.1 * dist / 3.2 + 0.25, dist);
    camera.lookAt(LOOK);
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------------- 小狗 ---------------- */
  // 层级：pet（位置、朝向）→ grow（成长大小）→ body（把模型缩放到身高 1）→ 模型
  const pet = new THREE.Group();
  const grow = new THREE.Group();
  const body = new THREE.Group();
  pet.add(grow); grow.add(body); scene.add(pet);
  const HOME_YAW = 0.55;           // 平时侧身朝向镜头
  pet.rotation.y = HOME_YAW;

  let model = null, mixer = null, actions = {}, restInv = {}, accObjs = [];
  let curAction = null, busy = false, current = '';
  const cache = {};

  // 材质：毛发哑光，鼻子微亮，眼睛像玻璃一样有高光
  const FUR_LAYERS = 12;
  const COAT = { shiba: ['#c56a2c', '#f4ecdf'], husky: ['#55585e', '#eef0f2'] };   // 主色、浅色（原色经过色调映射会发白）
  function tuneMaterials(mats, breed) {
    mats.forEach((m, i) => {
      if (i === 0 || i === 2) { m.roughness = 0.9; m.metalness = 0; m.color.setStyle(COAT[breed][i ? 1 : 0]); }
      else if (i === 1) { m.roughness = 0.35; m.metalness = 0; }
      else { m.roughness = 0.08; m.metalness = 0; m.envMapIntensity = 1.6; }
    });
  }

  function loadBreed(breed, cb) {
    if (cache[breed]) return cb(cache[breed]);
    // 模型是 base64 编码的 GLB，解码成二进制交给 GLTFLoader，不经过任何网络请求
    const go = () => {
      const bin = atob(window.PET_MODELS[breed]), buf = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      new THREE.GLTFLoader().parse(buf.buffer, '', g => {
        if (!/[?&]raw\b/.test(location.search)) {   // 加 ?raw 可以看原始低多边形模型
          const skin = KMRefine.refine(g.scene, 2);
          if (skin) {
            tuneMaterials(skin.material, breed);
            g.userData.fur = KMRefine.addFur(skin, { layers: FUR_LAYERS, length: 0.05, freq: 60, mats: [0, 2] });
          }
        }
        cache[breed] = g;
        cb(g);
      },
        e => { $('loading').textContent = '模型加载失败：' + (e && e.message || e); });
    };
    if (window.PET_MODELS && window.PET_MODELS[breed]) return go();
    const s = document.createElement('script');
    s.src = 'models/' + breed + '.js';
    s.onload = go;
    s.onerror = () => { $('loading').textContent = '模型文件缺失'; };
    document.head.appendChild(s);
  }

  function showBreed(breed, cb) {
    if (current === breed) return cb && cb();
    $('loading').hidden = false;
    loadBreed(breed, g => {
      $('loading').hidden = true;
      if (model) body.remove(model);
      model = g.scene;
      current = breed;
      model.position.set(0, 0, 0);
      model.updateMatrixWorld(true);
      // 原始模型身高约 3.1，统一缩放到 1
      body.scale.setScalar(1 / 3.1);
      model.traverse(o => {
        if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; }
        if (o.isBone && !restInv[breed + o.name]) restInv[breed + o.name] = o.matrixWorld.clone().invert();
      });
      body.add(model);
      mixer = new THREE.AnimationMixer(model);
      actions = {};
      g.animations.forEach(c => { actions[c.name] = mixer.clipAction(c); });
      mixer.addEventListener('finished', e => { const f = e.action._onDone; e.action._onDone = null; if (f) f(); });
      curAction = null;
      busy = false;
      idle(true);
      applyEquip();
      applyPerf();
      cb && cb();
    });
  }

  // 播放动作：loop=false 时播一遍后回调
  function play(name, opt) {
    opt = opt || {};
    const a = actions[name];
    if (!a) return;
    if (curAction === a && opt.loop !== false) return;
    a.reset();
    a.timeScale = opt.speed || 1;
    if (opt.loop === false) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a._onDone = opt.done; }
    else { a.setLoop(THREE.LoopRepeat, Infinity); a.clampWhenFinished = false; a._onDone = null; }
    a.play();
    if (curAction && curAction !== a) curAction.crossFadeTo(a, opt.fade || 0.25, false);
    curAction = a;
  }

  const hungry = () => st && st.fullness < P.HUNGRY;
  function idle(force) {
    if (busy && !force) return;
    play(hungry() ? 'Idle_2_HeadLow' : 'Idle');
  }

  /* ---------------- 动画小工具 ---------------- */
  const tweens = [];
  function tween(dur, fn, done) { tweens.push({ t: 0, dur, fn, done }); }
  const ease = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  function angleTo(cur, target) { return cur + ((((target - cur) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); }
  function turnTo(yaw, dur, done) {
    const a = pet.rotation.y, b = angleTo(a, yaw);
    if (Math.abs(b - a) < 0.05) return done && done();
    tween(dur, k => { pet.rotation.y = a + (b - a) * ease(k); }, done);
  }
  // 走/跑到地面上某点（单位：成年狗身高）
  function moveTo(x, z, anim, speed, done) {
    const sx = pet.position.x, sz = pet.position.z;
    const d = Math.hypot(x - sx, z - sz);
    if (d < 0.02) return done && done();
    turnTo(Math.atan2(x - sx, z - sz), 0.35, () => {
      play(anim);
      tween(d / (speed * grow.scale.x), k => { pet.position.x = sx + (x - sx) * k; pet.position.z = sz + (z - sz) * k; }, done);
    });
  }

  /* ---------------- 装扮 ---------------- */
  // 配件按“原始模型静止姿势”的坐标来摆（狗朝 +Z，身高约 3.1），再换算到对应骨骼下，跟着动作一起动
  function mat(color, o) {
    return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0 }, o || {}));
  }
  const GOLD = () => mat(0xe6b43c, { metalness: 0.7, roughness: 0.3 });
  function mesh(geo, m, x, y, z, rx, ry, rz) {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x || 0, y || 0, z || 0);
    o.rotation.set(rx || 0, ry || 0, rz || 0);
    return o;
  }
  const NECK = { y: 2.2, z: 1.5, tilt: -0.99 };      // 脖子中心和倾斜角（绕 X 轴）
  function neckRing(R, tube, m) {
    const g = new THREE.Group();
    g.position.set(0, NECK.y, NECK.z);
    g.rotation.x = NECK.tilt;
    g.add(mesh(new THREE.TorusGeometry(R, tube, 10, 36), m));
    return g;
  }
  // 脖子正前方（垂直于脖子、朝下前方）的位置
  const NECK_FRONT = [0, NECK.y - 0.26, NECK.z + 0.38];

  const ACC = {
    collar() {
      const g = new THREE.Group();
      g.add(neckRing(0.4, 0.045, mat(0xd23b3b)));
      g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 20), GOLD(), NECK_FRONT[0], NECK_FRONT[1] - 0.06, NECK_FRONT[2] + 0.02, 1.0));
      return { bone: 'Neck2', obj: g };
    },
    bow() {
      const g = new THREE.Group();
      g.add(neckRing(0.4, 0.028, mat(0xe0457b)));
      const m = mat(0xe0457b);
      const c = new THREE.Group();
      c.position.set(NECK_FRONT[0], NECK_FRONT[1], NECK_FRONT[2]);
      c.rotation.x = NECK.tilt + Math.PI / 2;
      c.add(mesh(new THREE.SphereGeometry(0.055, 12, 10), m));
      c.add(mesh(new THREE.ConeGeometry(0.1, 0.2, 12), m, 0.12, 0, 0, 0, 0, Math.PI / 2));
      c.add(mesh(new THREE.ConeGeometry(0.1, 0.2, 12), m, -0.12, 0, 0, 0, 0, -Math.PI / 2));
      g.add(c);
      return { bone: 'Neck2', obj: g };
    },
    scarf() {
      const g = new THREE.Group();
      const m = mat(0x2f7fd8, { roughness: 0.9 });
      g.add(neckRing(0.4, 0.085, m));
      g.add(mesh(new THREE.BoxGeometry(0.17, 0.42, 0.06), m, 0.2, NECK_FRONT[1] - 0.12, NECK_FRONT[2] - 0.02, 0.35, 0, 0.1));
      g.add(mesh(new THREE.BoxGeometry(0.17, 0.06, 0.065), mat(0xffffff, { roughness: 0.9 }), 0.21, NECK_FRONT[1] - 0.28, NECK_FRONT[2] - 0.08, 0.35, 0, 0.1));
      return { bone: 'Neck2', obj: g };
    },
    bell() {
      const g = new THREE.Group();
      g.add(neckRing(0.4, 0.04, mat(0x7a4a26)));
      g.add(mesh(new THREE.SphereGeometry(0.09, 18, 14), GOLD(), NECK_FRONT[0], NECK_FRONT[1] - 0.09, NECK_FRONT[2] + 0.04));
      g.add(mesh(new THREE.TorusGeometry(0.03, 0.012, 8, 16), GOLD(), NECK_FRONT[0], NECK_FRONT[1] - 0.0, NECK_FRONT[2] + 0.02));
      return { bone: 'Neck2', obj: g };
    },
    party() {
      const g = new THREE.Group();
      g.position.set(0.02, 2.86, 1.86);
      g.rotation.set(-0.15, 0, -0.18);
      g.add(mesh(new THREE.ConeGeometry(0.19, 0.5, 24), mat(0xff6f91), 0, 0.25, 0));
      g.add(mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 24), mat(0xffd34e), 0, 0.02, 0, Math.PI / 2));
      g.add(mesh(new THREE.SphereGeometry(0.07, 14, 10), mat(0xffffff), 0, 0.52, 0));
      return { bone: 'Head', obj: g };
    },
    gradcap() {
      const g = new THREE.Group();
      g.position.set(0, 2.88, 1.84);
      g.rotation.x = -0.12;
      const black = mat(0x222428);
      g.add(mesh(new THREE.CylinderGeometry(0.25, 0.27, 0.16, 24), black, 0, 0.06, 0));
      g.add(mesh(new THREE.BoxGeometry(0.66, 0.04, 0.66), black, 0, 0.16, 0, 0, Math.PI / 4));
      g.add(mesh(new THREE.SphereGeometry(0.035, 10, 8), GOLD(), 0, 0.19, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6), GOLD(), 0.2, 0.17, 0.2, 0, 0, Math.PI / 2 - 0.3));
      g.add(mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.14, 8), GOLD(), 0.41, 0.02, 0.2));
      return { bone: 'Head', obj: g };
    },
    wizard() {
      const g = new THREE.Group();
      g.position.set(0, 2.86, 1.82);
      g.rotation.x = -0.18;
      const m = mat(0x3d3b8e);
      g.add(mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.03, 32), m, 0, 0.01, 0));
      g.add(mesh(new THREE.ConeGeometry(0.25, 0.72, 24), m, 0, 0.37, -0.02, -0.12));
      g.add(mesh(new THREE.TorusGeometry(0.235, 0.03, 8, 28), GOLD(), 0, 0.05, 0, Math.PI / 2));
      g.add(mesh(new THREE.OctahedronGeometry(0.07), GOLD(), 0.1, 0.4, 0.17, 0, 0.4, 0.3));
      g.add(mesh(new THREE.OctahedronGeometry(0.05), GOLD(), -0.11, 0.25, 0.2, 0, 0.2, -0.3));
      return { bone: 'Head', obj: g };
    },
    crown() {
      const g = new THREE.Group();
      g.position.set(0, 2.88, 1.84);
      g.rotation.x = -0.12;
      const gold = GOLD();
      g.add(mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.14, 28, 1, true), gold, 0, 0.07, 0));
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        g.add(mesh(new THREE.ConeGeometry(0.055, 0.15, 10), gold, Math.sin(a) * 0.23, 0.21, Math.cos(a) * 0.23));
        g.add(mesh(new THREE.SphereGeometry(0.03, 10, 8), mat(i % 2 ? 0x2f6fde : 0xd83a4a, { roughness: 0.2 }), Math.sin(a) * 0.245, 0.07, Math.cos(a) * 0.245));
      }
      return { bone: 'Head', obj: g };
    },
    glasses() { return { bone: 'Head', obj: specs(false) }; },
    shades() { return { bone: 'Head', obj: specs(true) }; },
    backpack() {
      const g = new THREE.Group();
      g.position.set(0, 2.22, 0.2);
      const m = mat(0xf2b632);
      g.add(mesh(new THREE.BoxGeometry(0.5, 0.26, 0.56), m, 0, 0.1, 0));
      g.add(mesh(new THREE.BoxGeometry(0.52, 0.06, 0.4), mat(0xd9881f), 0, 0.24, 0.1, 0.15));
      g.add(mesh(new THREE.BoxGeometry(0.1, 0.1, 0.03), mat(0x8a5a1a), 0, 0.17, 0.3));
      g.add(mesh(new THREE.BoxGeometry(0.2, 0.22, 0.34), m, 0.33, -0.12, 0));
      g.add(mesh(new THREE.BoxGeometry(0.2, 0.22, 0.34), m, -0.33, -0.12, 0));
      return { bone: 'Torso2', obj: g };
    },
    cape() {
      const g = new THREE.Group();
      const geo = new THREE.CylinderGeometry(0.49, 0.56, 1.3, 28, 1, true, Math.PI / 2, Math.PI);
      const red = mat(0xd8323c, { side: THREE.DoubleSide, roughness: 0.8 });
      g.add(mesh(geo, red, 0, 1.82, 0.25, Math.PI / 2 - 0.08));
      g.add(mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 30), GOLD(), 0, NECK.y - 0.2, NECK.z - 0.42, NECK.tilt + 0.2));
      return { bone: 'Torso2', obj: g };
    }
  };
  function specs(dark) {
    const g = new THREE.Group();
    const frame = mat(dark ? 0x111111 : 0x6b3e1f, { roughness: 0.4 });
    [1, -1].forEach(s => {
      const lens = new THREE.Group();
      lens.position.set(0.24 * s, 2.72, 2.17);
      lens.rotation.y = 0.32 * s;
      lens.add(mesh(new THREE.TorusGeometry(0.11, 0.016, 8, 28), frame));
      if (dark) lens.add(mesh(new THREE.CircleGeometry(0.105, 24), mat(0x1b2230, { metalness: 0.6, roughness: 0.15, side: THREE.DoubleSide })));
      else lens.add(mesh(new THREE.CircleGeometry(0.105, 24), mat(0xbfe3ff, { transparent: true, opacity: 0.25, side: THREE.DoubleSide })));
      g.add(lens);
      g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), frame, 0.35 * s, 2.74, 2.0, Math.PI / 2, 0, 0));
    });
    g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 6), frame, 0, 2.76, 2.24, 0, 0, Math.PI / 2));
    return g;
  }

  function applyEquip() {
    accObjs.forEach(o => o.parent && o.parent.remove(o));
    accObjs = [];
    if (!model || !st) return;
    Object.keys(st.equip || {}).forEach(slot => {
      const id = st.equip[slot];
      if (!id || !ACC[id]) return;
      const { bone, obj } = ACC[id]();
      const b = model.getObjectByName(bone);
      const inv = restInv[current + bone];
      if (!b || !inv) return;
      obj.updateMatrix();
      obj.matrix.premultiply(inv);
      obj.matrix.decompose(obj.position, obj.quaternion, obj.scale);
      obj.traverse(o => { if (o.isMesh) o.castShadow = true; });
      b.add(obj);
      accObjs.push(obj);
    });
    requestSnap();      // 换了装扮（或刚加载好）就给桌面小部件重拍一张
  }

  /* ---------------- 道具：骨头、球 ---------------- */
  function boneMesh() {
    const g = new THREE.Group();
    const m = mat(0xf3ead6, { roughness: 0.7 });
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 10), m, 0, 0, 0, 0, 0, Math.PI / 2));
    [[0.1, 0.025], [0.1, -0.025], [-0.1, 0.025], [-0.1, -0.025]].forEach(p => g.add(mesh(new THREE.SphereGeometry(0.035, 12, 10), m, p[0], 0, p[1])));
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 16), mat(0xc8e04a, { roughness: 0.8 }));
  ball.castShadow = true;
  ball.visible = false;
  scene.add(ball);

  /* ---------------- 交互 ---------------- */
  const bubbleEl = $('bubble');
  let bubbleTimer = 0;
  function say(text, ms) {
    bubbleEl.textContent = text;
    bubbleEl.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubbleEl.classList.remove('show'), ms || 2200);
  }
  const headPos = new THREE.Vector3();
  function headScreen() {
    const h = model && model.getObjectByName('Head');
    if (!h) return { x: stageEl.clientWidth / 2, y: stageEl.clientHeight / 2 };
    h.getWorldPosition(headPos);
    headPos.y += 0.22 * grow.scale.y;
    headPos.project(camera);
    return { x: (headPos.x + 1) / 2 * stageEl.clientWidth, y: (1 - headPos.y) / 2 * stageEl.clientHeight };
  }
  function fx(emoji, n) {
    const p = headScreen();
    for (let i = 0; i < (n || 1); i++) {
      const e = document.createElement('div');
      e.className = 'fx';
      e.textContent = emoji;
      e.style.left = (p.x + (Math.random() - 0.5) * 70) + 'px';
      e.style.top = (p.y + (Math.random() - 0.5) * 30) + 'px';
      e.style.animationDelay = (i * 0.12) + 's';
      stageEl.appendChild(e);
      setTimeout(() => e.remove(), 1500 + i * 120);
    }
  }
  let toastTimer = 0;
  function toast(t) {
    const el = $('toast');
    el.textContent = t;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function doPet() {
    if (!st || !model) return;
    P.petOnce(st);
    fx('❤️', 3);
    if (busy) return refresh();
    busy = true;
    play(Math.random() < 0.5 ? 'Idle_HitReact1' : 'Idle_HitReact2', { loop: false, fade: 0.1, done: () => { busy = false; idle(); } });
    const lines = hungry() ? ['好饿呀…', '想吃骨头'] : ['汪！', '好舒服～', '再摸摸！', '最喜欢你了'];
    say(lines[Math.floor(Math.random() * lines.length)]);
    refresh();
  }

  function doFeed() {
    if (!st || !model || busy) return;
    const r = P.feed(st);
    if (r === 'nobone') { say('没有骨头了…'); toast('去图谱里掌握新知识点，就能领到骨头'); return; }
    if (r === 'full') { say('吃饱啦，不吃了'); return; }
    busy = true;
    goHome(() => {
      const b = boneMesh();
      const s = grow.scale.x;
      const fwd = new THREE.Vector3(Math.sin(pet.rotation.y), 0, Math.cos(pet.rotation.y));
      b.position.copy(pet.position).addScaledVector(fwd, 0.68 * s);
      b.position.y = 0.035;
      b.rotation.y = pet.rotation.y + 0.3;
      b.scale.setScalar(Math.max(0.8, s));
      scene.add(b);
      play('Eating', { loop: false, done: () => {
        scene.remove(b);
        busy = false;
        fx('💛', 2);
        say(hungry() ? '还想吃！' : '真好吃！');
        idle();
      } });
      refresh();
    });
  }

  function goHome(done) {
    moveTo(0, 0, 'Walk', 0.55, () => turnTo(HOME_YAW, 0.4, done));
  }

  function doBall() {
    if (!st || !model || busy) return;
    if (hungry()) { say('饿得跑不动了…'); return; }
    busy = true;
    // 球从镜头这边抛出，落在随机位置
    const tx = (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 0.7);
    const tz = -0.9 + Math.random() * 1.2;
    const from = new THREE.Vector3(0.3, 0.9, 2.2), to = new THREE.Vector3(tx, 0.06, tz);
    ball.visible = true;
    play('Idle_2');
    tween(0.9, k => {
      ball.position.lerpVectors(from, to, k);
      ball.position.y = from.y + (to.y - from.y) * k + Math.sin(k * Math.PI) * 0.9;
    }, () => {
      const fwdToPet = Math.atan2(tx - pet.position.x, tz - pet.position.z);
      const stop = 0.55 * grow.scale.x;
      moveTo(tx - Math.sin(fwdToPet) * stop, tz - Math.cos(fwdToPet) * stop, 'Gallop', 1.9, () => {
        play('Jump_ToIdle', { loop: false, done: () => {
          ball.userData.carry = true;
          goHome(() => {
            ball.userData.carry = false;
            ball.visible = false;
            busy = false;
            fx('🎾', 1); fx('❤️', 2);
            P.petOnce(st);
            say('再扔一次！');
            idle();
            refresh();
          });
        } });
      });
    });
  }

  // 拖动转身、点狗摸摸
  let down = null;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitBox = new THREE.Box3();
  stageEl.addEventListener('pointerdown', e => {
    if (e.target.closest('a,button')) return;
    down = { x: e.clientX, y: e.clientY, t: Date.now(), yaw: pet.rotation.y, moved: false };
  });
  stageEl.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - down.x;
    if (Math.abs(dx) > 8) down.moved = true;
    if (down.moved && !busy) pet.rotation.y = down.yaw + dx * 0.012;
  });
  window.addEventListener('pointerup', e => {
    if (!down) return;
    const d = down;
    down = null;
    if (d.moved || !model) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ndc, camera);
    hitBox.setFromObject(model);
    if (ray.ray.intersectsBox(hitBox)) doPet();
  });

  $('btnFeed').onclick = doFeed;
  $('btnPet').onclick = doPet;
  $('btnBall').onclick = doBall;

  /* ---------------- 闲时小动作 ---------------- */
  let idleTimer = 6;
  function idleTick(dt) {
    if (busy || !model || !st) return;
    idleTimer -= dt;
    if (idleTimer > 0) return;
    idleTimer = 7 + Math.random() * 8;
    if (hungry()) { say(['肚子咕咕叫…', '想吃骨头', '饿了…'][Math.floor(Math.random() * 3)]); return; }
    const r = Math.random();
    if (r < 0.4) {
      busy = true;
      play('Idle_2', { loop: false, done: () => { busy = false; idle(); } });
    } else {
      // 随便溜达一下再回来
      busy = true;
      const a = Math.random() * Math.PI * 2, d = 0.4 + Math.random() * 0.4;
      moveTo(Math.sin(a) * d, Math.cos(a) * d * 0.6, 'Walk', 0.55, () => {
        play('Idle');
        setTimeout(() => goHome(() => { busy = false; idle(); }), 1500);
      });
    }
  }

  /* ---------------- 循环 ---------------- */
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  // 自动降画质：平板跑不动时，先降分辨率，再减一半毛发层，最后关掉毛发（加 ?hq 不降）
  let perfT = -1, perfN = 0, perfLevel = 0, perfDone = /[?&]hq\b/.test(location.search);
  function applyPerf() {
    const fur = (cache[current] && cache[current].userData.fur) || [];
    fur.forEach((sh, i) => { sh.visible = perfLevel < 2 || (perfLevel === 2 && i % 2 === 1); });
  }
  function perfTick(dt) {
    if (perfDone || !model) return;
    perfT += dt;
    if (perfT < 0) return;           // 前 1 秒在编译着色器，不计入
    perfN++;
    if (perfT < 2) return;
    const avg = perfT / perfN;
    perfT = 0; perfN = 0;
    if (avg < 1 / 28) { perfDone = true; return; }
    perfLevel++;
    if (perfLevel === 1) { renderer.setPixelRatio(1); resize(); }
    applyPerf();
    if (perfLevel >= 3) perfDone = true;
  }

  // 桌面小部件用的小狗照片：等它站好（没在做动作）时，用固定的四分之三侧面机位拍一张透明背景的方图交给 App
  let snapAt = 0;
  const snapCam = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  function requestSnap(delay) {
    if (window.KMBridge && KMBridge.savePetImage) snapAt = performance.now() + (delay || 1500);
  }
  function takeSnap() {
    const W = renderer.domElement.width, H = renderer.domElement.height, aspect = W / H;
    if (!W || !H) { requestSnap(3000); return; }     // 页面正在离开或还没排版好，过会儿再拍
    // 对准身体中段（脚下原点再往头那边挪一点，头是往前伸的）
    const s = grow.scale.x, yaw = pet.rotation.y;
    const c = new THREE.Vector3(pet.position.x + Math.sin(yaw) * 0.2 * s, 0.52 * s, pet.position.z + Math.cos(yaw) * 0.2 * s);
    const a = yaw - 0.75, d = (2.45 * s + 0.2) / Math.min(1, aspect);   // 竖屏时方图只占画面中间一段，要退远些
    snapCam.position.set(c.x + Math.sin(a) * d, c.y + 0.5 * s, c.z + Math.cos(a) * d);
    snapCam.lookAt(c);
    snapCam.aspect = aspect;
    snapCam.updateProjectionMatrix();
    const vis = [ground.visible, shadowCatcher.visible, ball.visible];
    ground.visible = shadowCatcher.visible = ball.visible = false;
    renderer.render(scene, snapCam);
    const side = Math.min(W, H), out = document.createElement('canvas');
    out.width = out.height = 320;
    out.getContext('2d').drawImage(renderer.domElement, (W - side) / 2, (H - side) / 2, side, side, 0, 0, 320, 320);
    [ground.visible, shadowCatcher.visible, ball.visible] = vis;
    try { KMBridge.savePetImage(out.toDataURL('image/png').split(',')[1]); } catch (e) { /* 忽略 */ }
  }

  function loop() {
    requestAnimationFrame(loop);
    if (snapAt && performance.now() > snapAt && !busy && model) { snapAt = 0; takeSnap(); }   // 拍完马上照常渲染，画面不会闪
    const dt = Math.min(clock.getDelta(), 0.1);
    for (let i = tweens.length - 1; i >= 0; i--) {
      const t = tweens[i];
      t.t += dt;
      const k = Math.min(1, t.t / t.dur);
      t.fn(k);
      if (k >= 1) { tweens.splice(i, 1); if (t.done) t.done(); }
    }
    if (mixer) mixer.update(dt);
    if (ball.visible && ball.userData.carry && model) {
      const h = model.getObjectByName('Head');
      h.getWorldPosition(tmp);
      const s = grow.scale.x;
      ball.position.set(tmp.x + Math.sin(pet.rotation.y) * 0.24 * s, tmp.y - 0.08 * s, tmp.z + Math.cos(pet.rotation.y) * 0.24 * s);
    }
    idleTick(dt);
    perfTick(dt);
    if (bubbleEl.classList.contains('show')) {
      const p = headScreen();
      bubbleEl.style.left = p.x + 'px';
      bubbleEl.style.top = (p.y - 6) + 'px';
    }
    renderer.render(scene, camera);
  }
  loop();

  /* ---------------- 面板 ---------------- */
  const ICONS = { collar: '⭕', bow: '🎀', scarf: '🧣', bell: '🔔', party: '🥳', gradcap: '🎓', wizard: '🧙', crown: '👑',
    glasses: '👓', shades: '🕶️', backpack: '🎒', cape: '🦸' };
  let shownLevel = 0;

  function setGrowth(animate) {
    const L = P.level(st.xp), s = P.stage(L).scale;
    if (!animate) { grow.scale.setScalar(s); return; }
    const a = grow.scale.x;
    tween(1.2, k => grow.scale.setScalar(a + (s - a) * ease(k)));
    requestSnap(2500);
  }

  function refresh() {
    if (!st) return;
    P.tick(st);
    P.save(st);
    const L = P.level(st.xp), info = P.levelInfo(st.xp), stg = P.stage(L);
    $('petTitle').textContent = st.name;
    $('petStage').textContent = P.BREEDS[st.breed].name + ' · ' + stg.name;
    $('bones').hidden = false;
    $('bones').textContent = '🦴 ' + st.bones;
    const f = Math.round(st.fullness), m = P.mood(st);
    $('barFood').style.width = f + '%';
    $('barFood').style.background = f < P.HUNGRY ? 'var(--bad)' : 'var(--warm)';
    $('valFood').textContent = f;
    $('barMood').style.width = m + '%';
    $('valMood').textContent = m;
    $('lvLabel').textContent = 'Lv.' + L;
    $('barLv').style.width = (info.cur / info.span * 100) + '%';
    $('valLv').textContent = info.cur + '/' + info.span;
    $('lvHint').textContent = '再掌握 ' + info.next + ' 个知识点升到 Lv.' + (L + 1) + (f < P.HUNGRY ? '　· 它饿了，快喂喂它' : '');
    const pend = P.pending(st).length;
    $('claim').hidden = !pend;
    $('claimText').textContent = '新掌握了 ' + pend + ' 个知识点！';
    $('btnClaim').textContent = '领取 ' + pend * P.BONES_PER_NODE + ' 🦴';
    $('btnFeed').disabled = st.bones < P.FEED_COST;
    const S = window.KMStudy, sst = S.load(), min = Math.round(S.secondsOn(sst, S.dayKey()) / 60), days = S.streak(sst);
    $('studyToday').textContent = '今天学习 ' + min + ' 分钟' + (min >= 30 ? ' ✓' : '');
    $('studySub').textContent = (days ? '已连续学习 ' + days + ' 天 · ' : '') + (min >= 30 ? '今天的目标完成啦' : '学满 30 分钟它会更开心') + ' · 查看统计';
    renderShop(L);
    renderGrow(L);
    if (!shownLevel) shownLevel = L;
  }

  function renderShop(L) {
    const box = $('tabShop');
    box.innerHTML = '';
    Object.keys(P.SLOTS).forEach(slot => {
      const h = document.createElement('div');
      h.className = 'slot';
      h.textContent = P.SLOTS[slot];
      box.appendChild(h);
      const grid = document.createElement('div');
      grid.className = 'items';
      P.ITEMS.filter(it => it.slot === slot).forEach(it => {
        const owned = st.owned.includes(it.id), on = st.equip[slot] === it.id, locked = !owned && L < it.lv;
        const b = document.createElement('button');
        b.className = 'item' + (on ? ' on' : '') + (locked ? ' locked' : '');
        const sub = on ? '穿戴中 · 点击取下' : owned ? '已拥有 · 点击穿戴' : locked ? 'Lv.' + it.lv + ' 解锁' : '🦴 ' + it.price;
        b.innerHTML = '<span class="ic">' + ICONS[it.id] + '</span><span><b>' + it.name + '</b><small>' + sub + '</small></span>';
        b.onclick = () => onItem(it);
        grid.appendChild(b);
      });
      box.appendChild(grid);
    });
  }
  function onItem(it) {
    if (st.owned.includes(it.id)) {
      P.toggleEquip(st, it.id);
    } else {
      const r = P.buy(st, it.id);
      if (r === 'locked') return toast('升到 Lv.' + it.lv + ' 才能买');
      if (r === 'nobone') return toast('骨头不够，还差 ' + (it.price - st.bones) + ' 根');
      if (r !== 'ok') return;
      toast('买到了：' + it.name);
      fx('✨', 3);
    }
    applyEquip();
    refresh();
  }

  function renderGrow(L) {
    const subj = P.bySubject(st);
    const days = Math.max(1, Math.ceil((Date.now() - st.born) / 86400000));
    let html = '<div class="stats" style="margin-top:12px">';
    html += '<div><b>' + st.xp + '</b>知识点</div><div><b>' + days + '</b>天</div><div><b>' + st.owned.length + '</b>件装扮</div><div><b>Lv.' + L + '</b>等级</div></div>';
    html += '<div class="stages">' + P.STAGES.map(s => '<div class="' + (P.stage(L) === s ? 'on' : '') + '">' + s.name + '<br><small>Lv.' + s.from + '</small></div>').join('') + '</div>';
    html += '<div class="stats" style="margin-top:10px">' + subj.map(s => '<div><b>' + s.n + '</b>' + s.name + '</div>').join('') + '</div>';
    html += '<ul class="rules"><li>在各科图谱里通过测试（或入门诊断）掌握一个知识点，就能领 ' + P.BONES_PER_NODE + ' 根骨头，同一个知识点只能领一次。</li>' +
      '<li>掌握的知识点越多，等级越高，小狗会慢慢长大，还能解锁更多装扮。</li>' +
      '<li>小狗每天会饿，喂一根骨头饱食度 +20。饿了它会没精神，但不会生病。</li>' +
      '<li>每天摸摸它、陪它玩球，它会更开心。</li></ul>';
    $('tabGrow').innerHTML = html;
  }

  document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    $('tabShop').hidden = b.dataset.tab !== 'shop';
    $('tabGrow').hidden = b.dataset.tab !== 'grow';
  });

  $('btnClaim').onclick = () => {
    const r = P.claim(st);
    if (!r.n) return;
    fx('🦴', Math.min(8, r.n + 2));
    toast('领到 ' + r.bones + ' 根骨头');
    say('汪汪！你真棒！');
    if (r.levelUp) {
      const L = P.level(st.xp), before = P.stage(shownLevel).name, now = P.stage(L).name;
      setTimeout(() => {
        toast(before !== now ? '长大了！变成' + now + '（Lv.' + L + '）' : '升级到 Lv.' + L + '！');
        fx('🎉', 5);
        if (!busy && model) { busy = true; play('Gallop_Jump', { loop: false, done: () => { busy = false; idle(); } }); }
      }, 700);
      shownLevel = L;
      setGrowth(true);
    }
    refresh();
  };

  // 桌面小部件：只在平板 App 里有；系统支持就弹出“添加到桌面”，不支持就教怎么手动加
  if (window.KMBridge && KMBridge.pinWidget) {
    $('btnPin').hidden = false;
    $('btnPin').onclick = () => {
      requestSnap(0);
      if (KMBridge.pinWidget()) toast('在弹出的窗口里点“添加”，小狗就会出现在桌面上');
      else toast('长按桌面空白处 → 小部件 → 知识图谱，把小狗拖到桌面');
    };
  }

  $('btnRename').onclick = () => {
    const n = prompt('给小狗改个名字（最多 8 个字）', st.name);
    if (n && n.trim()) { st.name = n.trim().slice(0, 8); P.save(st); refresh(); }
  };

  /* ---------------- 领养 ---------------- */
  function startAdopt() {
    document.body.classList.add('adopting');
    let pick = 'shiba';
    const box = $('breeds');
    box.innerHTML = '';
    Object.keys(P.BREEDS).forEach(k => {
      const b = document.createElement('button');
      b.innerHTML = '<b>' + P.BREEDS[k].name + '</b><small>' + P.BREEDS[k].desc + '</small>';
      b.onclick = () => {
        pick = k;
        box.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
        showBreed(k);
      };
      if (k === pick) b.classList.add('on');
      box.appendChild(b);
    });
    grow.scale.setScalar(P.STAGES[0].scale);
    showBreed(pick);
    $('btnAdopt').onclick = () => {
      st = P.adopt(pick, $('petName').value);
      document.body.classList.remove('adopting');
      showBreed(pick, () => { fx('❤️', 4); say('你好呀，我是' + st.name + '！', 3000); });
      setGrowth(false);
      refresh();
    };
  }

  if (!st) startAdopt();
  else {
    setGrowth(false);
    showBreed(st.breed, () => {
      if (P.pending(st).length) say('有新骨头可以领！', 3000);
      else if (hungry()) say('好饿呀…', 3000);
    });
    refresh();
  }
  // 从图谱回来时刷新待领骨头
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  window.__pet = { scene, camera, pet, grow, get model() { return model; }, play, ACC, applyEquip, get st() { return st; } };
})();
