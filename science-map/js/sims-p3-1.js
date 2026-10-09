// 第三阶段 物理组 1 互动演示（写法见 js/sims.js，清单见 docs/phase3-spec.md）
//   p3_1_tone     声音的三个特性：频率（音调）、振幅（响度）、波形（音色），可以播放听一听
//   p3_1_echo     回声与回声测距：声波去而复返，算距离、判断能否听到回声
//   p3_1_spectrum 电磁波谱：拖动频率，看波长 λ = c / f 和所属波段
(function () {
  'use strict';
  const SIMS = window.SIMS, F = window.FIG;

  // 动画循环：每帧调用 tick(dt 秒)，tick 返回 false 时停止
  function animator(box, tick, onStop) {
    let gen = 0, running = false;
    return {
      get running() { return running; },
      start() {
        running = true;
        const my = ++gen;
        let last = 0;
        const step = ts => {
          if (my !== gen || !running) return;
          if (!box.isConnected) { running = false; return; }
          const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
          last = ts;
          if (tick(dt) === false) { running = false; onStop && onStop(); return; }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      stop() { running = false; gen++; }
    };
  }

  // 科学计数法文字：3.0×10⁸
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function sci(x, d) {
    if (x === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(x)));
    if (e >= -2 && e <= 3) return String(+x.toPrecision(3));
    const m = x / Math.pow(10, e);
    return (+m.toFixed(d == null ? 2 : d)) + '×10' + String(e).split('').map(c => SUP[c]).join('');
  }

  /* ---------- 声音的三个特性 ---------- */
  SIMS.p3_1_tone = function (box) {
    const ui = SIMS.ui(box, '声音的特性：音调、响度、音色');
    // 各种“乐器”的谐波振幅：只有基音的音叉是正弦波，乐器含有泛音，波形不同 → 音色不同
    const TIMBRE = [
      { name: '音叉', h: [1] },
      { name: '钢琴', h: [1, 0.55, 0.3, 0.18, 0.08] },
      { name: '小提琴', h: [1, 0.5, 0.36, 0.26, 0.2, 0.15, 0.12] }
    ];
    const tim = ui.buttons(TIMBRE.map(t => t.name), draw, 0);
    const fig = ui.fig();
    const fS = ui.slider({ label: '频率 f（音调）', min: 100, max: 1000, step: 10, value: 300, unit: 'Hz' }, draw);
    const aS = ui.slider({ label: '振幅 A（响度）', min: 1, max: 10, step: 1, value: 6, fmt: v => v + ' 格' }, draw);
    ui.action('▶ 听一听', play);
    const out = ui.out();
    ui.note('图中横轴是同样长的一段时间（10 ms）。<b>波形越密</b>，说明每秒振动次数越多，<b>频率越高，音调越高</b>；<b>波形越高</b>，振幅越大，<b>响度越大</b>；不同发声体的<b>波形形状</b>不同，<b>音色</b>不同。注意：音调和响度是两回事——把振幅调大，波形变高但疏密不变，音调不变。人耳能听到 20～20000 Hz 的声音（播放时请把设备音量调小）。');

    // 一个周期内的波形，归一化到最大值 1
    function shape(h) {
      const f = u => h.reduce((s, a, k) => s + a * Math.sin(2 * Math.PI * (k + 1) * u + k * 0.6), 0);
      let m = 0;
      for (let i = 0; i < 400; i++) m = Math.max(m, Math.abs(f(i / 400)));
      return u => f(u) / m;
    }

    function draw() {
      const t = TIMBRE[tim.get()], f = fS.get(), A = aS.get();
      const g = shape(t.h);
      const x0 = 50, x1 = 530, yc = 120, unit = 9;    // 振幅 1 格 = 9 px
      let s = '';
      for (let k = -10; k <= 10; k += 2) s += F.line(x0, yc - k * unit, x1, yc - k * unit, 'thin dash');
      s += F.arrow(x0, yc, x1 + 14, yc, { size: 7 }) + F.arrow(x0, yc + 100, x0, yc - 104, { size: 7 }) +
        F.text(x1 + 12, yc + 14, '时间', { size: 12, a: 'end' }) + F.text(x0 + 6, 10, '振动的位置', { size: 12, a: 'start' });
      for (let ms = 0; ms <= 10; ms += 2) {
        const x = x0 + (x1 - x0) * ms / 10;
        s += F.line(x, yc, x, yc + 4, 'thin') + F.text(x, yc + 106, ms + ' ms', { size: 11 });
      }
      const pts = [];
      const N = 1200;
      for (let i = 0; i <= N; i++) {
        const tt = i / N * 0.01;                       // 秒
        pts.push([x0 + (x1 - x0) * i / N, yc - A * unit * g((f * tt) % 1)]);
      }
      s += F.poly(pts, 'hi');
      fig.innerHTML = F.svg(560, 240, s);
      const n = f / 100;
      out.innerHTML = `频率 <b>${f}</b> Hz：每秒振动 ${f} 次，图中 10 ms 内振动 <b>${SIMS.fmt(n, 1)}</b> 次 → 音调${f >= 600 ? '较高' : f <= 250 ? '较低' : '适中'}<br>` +
        `振幅 <b>${A}</b> 格 → 响度${A >= 8 ? '较大' : A <= 3 ? '较小' : '适中'}　|　发声体：${t.name}（${t.h.length === 1 ? '正弦波，声音单纯' : '含有泛音，波形不是正弦波'}）`;
    }

    let ctx = null;
    function play() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { out.innerHTML += '<br>（这个浏览器不支持播放声音）'; return; }
        ctx = ctx || new AC();
        const t = TIMBRE[tim.get()];
        const real = new Float32Array(t.h.length + 1), imag = new Float32Array(t.h.length + 1);
        t.h.forEach((a, k) => { imag[k + 1] = a; });
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.setPeriodicWave(ctx.createPeriodicWave(real, imag));
        osc.frequency.value = fS.get();
        const now = ctx.currentTime, vol = 0.02 + 0.016 * aS.get();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.03);
        gain.gain.setValueAtTime(vol, now + 0.8);
        gain.gain.linearRampToValueAtTime(0, now + 1);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 1.05);
      } catch (e) { /* 播放失败时只看波形 */ }
    }
    draw();
  };

  /* ---------- 回声测距 ---------- */
  SIMS.p3_1_echo = function (box) {
    const ui = SIMS.ui(box, '回声与回声测距');
    const MED = [
      { name: '对着山崖喊（空气，15 ℃）', v: 340, src: '人', wall: '山崖' },
      { name: '声呐测海深（海水）', v: 1500, src: '船', wall: '海底' }
    ];
    const med = ui.buttons(MED.map(m => m.name), reset, 0);
    const fig = ui.fig();
    const dS = ui.slider({ label: '距离 s', min: 5, max: 1500, step: 5, value: 170, unit: 'm' }, reset);
    const btn = ui.action('▶ 发出声音', start);
    const out = ui.out();
    ui.note('声音碰到障碍物会被反射回来，形成<b>回声</b>。声音走了<b>一个来回</b>，所以 <i>s</i> = <i>vt</i> / 2。在空气中，回声和原声相隔<b>不到 0.1 s</b> 时人耳分不开，回声和原声混在一起使原声加强——所以离障碍物要大于 17 m 才能听到回声。动画为了看得清，速度放慢了。');

    let p = 0, phase = 'ready';     // p：0→1 去程，1→2 回程
    const anim = animator(box, dt => {
      p += dt / 1.2;
      if (p >= 2) { p = 2; phase = 'done'; draw(); return false; }
      draw();
    }, () => { btn.textContent = '▶ 再来一次'; });

    function start() { anim.stop(); p = 0; phase = 'run'; btn.textContent = '……'; anim.start(); }
    function reset() { anim.stop(); p = 0; phase = 'ready'; btn.textContent = '▶ 发出声音'; draw(); }

    function draw() {
      const m = MED[med.get()], s = dS.get(), v = m.v, t = 2 * s / v;
      const sea = med.get() === 1;
      const xa = 80, xb = 470;
      let g = '';
      if (sea) {
        // 船在左，海底在右（横着画，方便和山崖对照）
        g += F.rect(20, 40, 60, 140, 'water') + F.text(50, 194, '海面', { size: 12 }) +
          F.polygon([[30, 90], [72, 90], [64, 120], [38, 120]], 'soft') + F.text(52, 76, '船', { size: 13 }) +
          F.rect(80, 40, xb - 80, 140, 'water');
      } else {
        g += F.circle(50, 90, 9, 'ink') + F.line(50, 99, 50, 135) + F.line(50, 108, 36, 122) + F.line(50, 108, 66, 112) +
          F.line(50, 135, 40, 160) + F.line(50, 135, 60, 160) + F.text(50, 178, '人', { size: 13 });
      }
      g += F.wall(xb, 30, xb, 190, 'right') + F.text(xb + 22, 20, m.wall, { size: 13 });
      g += F.arrow(xa, 214, xb, 214, { cls: 'thin', size: 7 }) + F.arrow(xb, 214, xa, 214, { cls: 'thin', size: 7 }) +
        F.text((xa + xb) / 2, 228, 's = ' + s + ' m', { size: 13 });
      if (phase !== 'ready') {
        const x = p <= 1 ? xa + (xb - xa) * p : xb - (xb - xa) * (p - 1);
        const dir = p <= 1 ? 1 : -1;
        [0, 10, 20].forEach(k => {
          const xx = x - dir * k;
          if (xx >= xa - 2 && xx <= xb + 2) g += F.path(`M${xx - dir * 8},${80} Q${xx + dir * 10},${110} ${xx - dir * 8},${140}`, k ? 'thin' : 'ray');
        });
        g += F.text((xa + xb) / 2, 52, p <= 1 ? '去程：声音传向' + m.wall : '回程：回声传回' + m.src, { size: 13 });
      }
      fig.innerHTML = F.svg(540, 240, g);
      const tNow = Math.min(p, 2) / 2 * t;
      let txt = `声速 <b>${v}</b> m/s，距离 <b>${s}</b> m<br>声音走过的路程 2<i>s</i> = ${2 * s} m，回声时间 <i>t</i> = 2<i>s</i> / <i>v</i> = <b>${SIMS.fmt(t, 3)}</b> s`;
      if (phase !== 'ready') txt += `　（计时：${SIMS.fmt(tNow, 3)} s）`;
      if (!sea) txt += t >= 0.1 ? '<br>回声与原声相隔 ≥ 0.1 s：<b>能听到回声</b>' : '<br>回声与原声相隔 &lt; 0.1 s：<b>分不出回声</b>，回声使原声加强（听起来更响亮）';
      else txt += '<br>反过来，测出时间 <i>t</i> 就能算出海深 <i>s</i> = <i>vt</i> / 2';
      out.innerHTML = txt;
    }
    draw();
  };

  /* ---------- 电磁波谱 ---------- */
  SIMS.p3_1_spectrum = function (box) {
    const ui = SIMS.ui(box, '电磁波谱：频率越高，波长越短');
    const C = 3e8;
    // 波段（频率边界大致值）
    const BANDS = [
      { name: '无线电波', f0: 1e3, f1: 3e11, use: '广播、电视、手机通信（其中 3×10⁸～3×10¹¹ Hz 是微波：手机、Wi-Fi、微波炉、雷达、卫星通信）' },
      { name: '红外线', f0: 3e11, f1: 4e14, use: '遥控器、红外测温、夜视仪、红外加热' },
      { name: '可见光', f0: 4e14, f1: 7.5e14, use: '红橙黄绿蓝靛紫，眼睛能看见的光；光纤通信用激光' },
      { name: '紫外线', f0: 7.5e14, f1: 3e16, use: '杀菌消毒、验钞（荧光效应）、促进维生素 D 合成' },
      { name: 'X 射线', f0: 3e16, f1: 3e19, use: '医院拍片、CT、安检' },
      { name: 'γ 射线', f0: 3e19, f1: 1e22, use: '放射治疗、工业探伤' }
    ];
    const PRESET = [['FM 收音机', 1e8], ['手机 5G', 3.5e9], ['微波炉', 2.45e9], ['红外遥控', 3.2e14], ['绿光', 5.5e14], ['紫外灯', 1.2e15], ['X 光', 3e18]];
    const fig = ui.fig();
    let exact = null;   // 点预设按钮时用准确的频率
    const eS = ui.slider({ label: '频率 f', min: 4, max: 21, step: 0.01, value: 8, fmt: e => sci(exact || Math.pow(10, e)) + ' Hz' }, v => { exact = null; eS.set(v); draw(); });
    ui.buttons(PRESET.map(p => p[0]), i => { exact = PRESET[i][1]; eS.set(Math.log10(exact)); draw(); }, -1);
    const out = ui.out();
    ui.note('所有电磁波在真空中的传播速度都相同：<i>c</i> = 3×10⁸ m/s（光也是电磁波）。由 <i>c</i> = <i>λf</i> 可知，<b>频率越高，波长越短</b>。电磁波能在真空中传播，声波不能。');

    function draw() {
      const f = exact || Math.pow(10, eS.get()), e = Math.log10(f), lam = C / f;
      const b = BANDS.find(x => f >= x.f0 && f < x.f1) || BANDS[BANDS.length - 1];
      const x0 = 30, x1 = 530, ex0 = 4, ex1 = 21;
      const px = ee => x0 + (ee - ex0) / (ex1 - ex0) * (x1 - x0);
      let s = '';
      BANDS.forEach((bd, i) => {
        const a = px(Math.max(ex0, Math.log10(bd.f0))), z = px(Math.min(ex1, Math.log10(bd.f1)));
        s += F.rect(a, 40, z - a, 34, i % 2 ? 'soft' : 'mask') + F.line(a, 40, a, 74, 'thin');
        if (z - a < 30) s += F.line((a + z) / 2, 74, (a + z) / 2, 82, 'thin') + F.text((a + z) / 2, 90, bd.name, { size: 11 });
        else s += F.text((a + z) / 2, 57, bd.name, { size: z - a < 60 ? 10 : 12 });
      });
      s += F.rect(x0, 40, x1 - x0, 34, 'ink');
      s += F.line(px(Math.log10(3e8)), 74, px(Math.log10(3e8)), 84, 'thin') + F.line(px(Math.log10(3e11)), 74, px(Math.log10(3e11)), 84, 'thin') +
        F.text((px(Math.log10(3e8)) + px(Math.log10(3e11))) / 2, 92, '微波', { size: 11 });
      [4, 8, 12, 16, 20].forEach(k => { s += F.text(px(k), 28, '10' + String(k).split('').map(c => SUP[c]).join('') + ' Hz', { size: 11 }); });
      s += F.arrow(x0, 112, x1, 112, { cls: 'thin', size: 7 }) + F.text((x0 + x1) / 2, 126, '频率越来越高　波长越来越短', { size: 12 });
      const mx = px(e);
      s += F.line(mx, 34, mx, 80, 'ray') + F.polygon([[mx - 6, 30], [mx + 6, 30], [mx, 38]], 'ray-head');
      // 示意波形：周期数随频率增大（只是示意，不按比例）
      const cyc = 1.2 + (e - 4) * 0.55, y0 = 170, w = x1 - x0;
      const pts = [];
      for (let i = 0; i <= 600; i++) pts.push([x0 + w * i / 600, y0 - 22 * Math.sin(2 * Math.PI * cyc * i / 600)]);
      s += F.poly(pts, 'hi') + F.text(x1, 204, '（波形只是示意，没按比例画）', { size: 11, a: 'end' });
      fig.innerHTML = F.svg(560, 212, s);
      out.innerHTML = `<i>f</i> = <b>${sci(f)}</b> Hz　→　<i>λ</i> = <i>c</i> / <i>f</i> = 3×10⁸ m/s ÷ ${sci(f)} Hz = <b>${sci(lam)}</b> m<br>` +
        `所属波段：<b>${b.name}${b.name === '无线电波' && f >= 3e8 ? '（微波）' : ''}</b>　应用：${b.use}`;
    }
    draw();
  };
})();
