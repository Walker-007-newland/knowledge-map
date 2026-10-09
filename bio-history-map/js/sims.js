// 互动演示。讲解里写 <div class="sim" data-sim="名字"></div>，这里用 SIMS.名字 = function (box) {...} 注册。
// 各学科的演示放在 js/sims-physics.js、js/sims-chem.js，用下面的 UI 小工具搭界面，图用 FIG 画（重画时整体替换 innerHTML）。
//   const ui = SIMS.ui(box, '标题');
//   const fig = ui.fig();                                   // 放图的容器
//   ui.slider({label:'电压 U', min:0, max:6, step:0.5, value:3, unit:'V'}, v => draw());
//   ui.buttons(['串联','并联'], i => draw(), 0);           // 一组切换按钮，返回 {get()}
//   const out = ui.out();                                   // 结果文字区，out.innerHTML = ...
//   ui.note('说明文字');
(function () {
  'use strict';
  const SIMS = window.SIMS = window.SIMS || {};

  SIMS.ui = function (box, title) {
    box.innerHTML = title ? `<div class="sim-title">${title}</div>` : '';
    const add = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; box.appendChild(e); return e; };
    return {
      fig() { return add('div'); },
      slider(o, onChange) {
        const row = add('div', 'sim-ctrl');
        const dp = String(o.step).includes('.') ? String(o.step).split('.')[1].length : 0;
        const fmt = o.fmt || (v => v.toFixed(dp) + (o.unit ? ' ' + o.unit : ''));
        row.innerHTML = `<label>${o.label}</label><input type="range" min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}"><output></output>`;
        const inp = row.querySelector('input'), outp = row.querySelector('output');
        const get = () => +inp.value;
        const upd = () => { outp.textContent = fmt(get()); };
        inp.addEventListener('input', () => { upd(); onChange && onChange(get()); });
        upd();
        return { get, set(v) { inp.value = v; upd(); } };
      },
      buttons(labels, onPick, initial) {
        const row = add('div', 'sim-btns');
        let cur = initial || 0;
        labels.forEach((l, i) => {
          const b = document.createElement('button');
          b.className = 'btn' + (i === cur ? ' on' : '');
          b.textContent = l;
          b.onclick = () => { cur = i; row.querySelectorAll('.btn').forEach((x, j) => x.classList.toggle('on', j === cur)); onPick && onPick(i); };
          row.appendChild(b);
        });
        return { get: () => cur };
      },
      // 单个动作按钮（如“放手”“重置”）
      action(label, onClick) {
        const row = box.querySelector('.sim-btns.actions') || add('div', 'sim-btns actions');
        const b = document.createElement('button');
        b.className = 'btn'; b.textContent = label; b.onclick = onClick;
        row.appendChild(b);
        return b;
      },
      out() { return add('div', 'sim-out'); },
      note(html) { add('div', 'sim-note').innerHTML = html; }
    };
  };

  // 数字格式：最多保留 d 位小数，去掉末尾 0
  SIMS.fmt = (v, d) => String(+v.toFixed(d == null ? 2 : d));

  // 简单坐标图：返回 SVG 字符串。o: {x, y, w, h, xmax, ymax, xlabel, ylabel, xticks, yticks}
  // 用 o.px(x)、o.py(y) 把数据坐标换成画布坐标（调用后挂在 o 上）
  SIMS.axes = function (o) {
    const F = window.FIG;
    o.px = v => o.x + v / o.xmax * o.w;
    o.py = v => o.y + o.h - v / o.ymax * o.h;
    let s = F.arrow(o.x, o.y + o.h, o.x + o.w + 14, o.y + o.h, { size: 7 }) + F.arrow(o.x, o.y + o.h, o.x, o.y - 14, { size: 7 });
    (o.xticks || []).forEach(t => { s += F.line(o.px(t), o.y + o.h, o.px(t), o.y + o.h + 4, 'thin') + F.text(o.px(t), o.y + o.h + 14, t, { size: 11 }); });
    (o.yticks || []).forEach(t => { s += F.line(o.x - 4, o.py(t), o.x, o.py(t), 'thin') + F.text(o.x - 8, o.py(t), t, { size: 11, a: 'end' }); });
    if (o.xlabel) s += F.text(o.x + o.w + 14, o.y + o.h - 12, o.xlabel, { cls: 'it', size: 14, a: 'end' });   // 标在箭头上方，避免压住刻度
    if (o.ylabel) s += F.text(o.x + 4, o.y - 20, o.ylabel, { cls: 'it', size: 14, a: 'start' });
    s += F.text(o.x - 8, o.y + o.h + 12, 'O', { cls: 'it', size: 13 });
    return s;
  };
})();
