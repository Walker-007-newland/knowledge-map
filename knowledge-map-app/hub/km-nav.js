// 返回规则（全 App 统一）——平板的返回键和页面左上角「← 返回」按钮走同一套逻辑：
//   1. 页面上开着弹层（测试 / 弹窗 / 知识点面板 / 下拉菜单）→ 先关最上面那一层，不离开页面
//   2. 页面里分了几步的（听写、默写、背诵、单元单词、音标课、我的词单）→ 退回上一步（这些页面自己用 history 记步骤）
//   3. 都没有 → 回到进来之前的页面（从总入口进来回总入口，从「今天该复习」进来回复习页）
//   4. 没有上一页（直接打开的）→ 回上级页面：各科图谱和工具页的上级是总入口
//   5. 在总入口：再按一次返回键才退出 App（原生 MainActivity 处理）
// 「去上级页面」的链接一律不新开一页（不然返回键会在两页之间来回跳）：返回按钮调 KMNav.up()，切换物理/化学这类同级页面用 location.replace
// 原生返回键先调 KMNav.closeLayer()，返回 true 表示关掉了一层，不再后退
(function () {
  if (window.KMNav) return;
  // 各图谱引擎的弹层：开着时按 Esc 会关最上面一层（引擎里已有的逻辑），这里只负责判断有没有开着的
  var LAYERS = [
    '#overlay:not([hidden])',              // 语文 / 英语：测试、诊断
    '#modal:not([hidden])',                // 物理 / 化学：测试、诊断
    '#popNext:not([hidden])', '#popBackup:not([hidden])',   // 「接下来学什么」「备份」下拉
    '#panel.open',                         // 语文 / 英语 / 理科 / 生物历史 / 笔记：知识点面板
    '.app.panel-open #panel:not([hidden])',// 数学：知识点面板、错题本
    '[data-km-layer]:not([hidden])'        // 以后新加的弹层：加上 data-km-layer 属性并支持 Esc 关闭即可
  ].join(',');

  function openLayers() {
    return Array.prototype.filter.call(document.querySelectorAll(LAYERS), function (el) {
      return el.getClientRects().length > 0;
    }).length;
  }

  function closeLayer() {
    var before = openLayers();
    if (!before) return false;
    var ev;
    try { ev = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true, cancelable: true }); }
    catch (e) { ev = document.createEvent('Event'); ev.initEvent('keydown', true, true); ev.key = 'Escape'; }
    (document.activeElement || document.body).dispatchEvent(ev);
    return openLayers() < before;
  }

  // 上级页面（只在电脑浏览器里、又没有上一页时用到；App 里交给原生 goBack）：总入口在 knowledge-map-app/hub/
  function hubUrl() {
    var p = location.pathname;
    if (/\/knowledge-map-app\/hub\/pet\//.test(p)) return '../index.html';
    if (/\/knowledge-map-app\/hub\//.test(p)) return 'index.html';
    return '../knowledge-map-app/hub/index.html';
  }

  // 「← 返回」按钮：关弹层 → 上一页 → 上级页面
  function up(parent) {
    if (closeLayer()) return;
    if (window.KMApp && KMApp.goBack) { KMApp.goBack(); return; }   // 原生：有上一页就后退，没有就回总入口
    if (history.length > 1) history.back();
    else location.href = parent || hubUrl();
  }

  window.KMNav = { closeLayer: closeLayer, up: up };

  // 页面里写 <button class="km-back">← 返回</button> 或 <a class="km-back" href="上级">，点了都走 up()
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.km-back');
    if (!b) return;
    e.preventDefault();
    up(b.getAttribute('href') || b.getAttribute('data-parent') || '');
  });
  // 同级切换（物理 ⇄ 化学、生物 ⇄ 历史）：替换当前页，返回键直接回总入口
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.subject-link');
    if (!a || e.defaultPrevented) return;
    e.preventDefault();
    location.replace(a.href);
  });
})();
