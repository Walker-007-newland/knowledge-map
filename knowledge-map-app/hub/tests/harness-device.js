// SyncHarness --serve：真的总入口 hub/index.html?harness=A 当成一台平板，排在 km-sync.js 后面（见 HarnessServer.asDevice）。
// 模拟桥 = App 里的 KMApp：同步 XHR 调后端 /api/*（后端里是这台的 Java 同步内核）。syncNow 什么也不做，节点、局域网那一轮由测试页安排。
// 测试页 postMessage {op:'visit'}：相当于 App 收到「inbox」事件 → 合并收件箱（总入口的 km-sync-merged 监听照常运行）→ 本机数据变了就发布
// （App 里是 km-data-change 之后 5 秒），回 {op:'visited', merged, published, pet}。只在测试里用，不打包。
(function () {
  var d = new URLSearchParams(location.search).get('harness');
  if (!d || !window.KMSync) return;
  function call(op, body) {
    var x = new XMLHttpRequest();
    x.open('POST', '/api/' + op + '?d=' + encodeURIComponent(d), false);
    x.send(body == null ? '' : body);
    return x.responseText;
  }
  KMSync._init({
    syncState: function () { return call('state'); },
    syncTake: function () { return call('take'); },
    syncAck: function (b) { call('ack', b); },
    syncPublish: function (b) { call('publish', b); },
    syncNow: function () { }
  });
  addEventListener('message', function (e) {
    if (!e.data || e.data.op !== 'visit') return;
    var r = KMSync.mergeNow({ force: true });
    var n = KMSync.publish();
    parent.postMessage({ op: 'visited', d: d, merged: !!r.merged, published: n, pet: localStorage.getItem('km-pet-v1'),
      keys: KMData._canon(KMData.collect().keys) }, '*');
  });
  parent.postMessage({ op: 'ready', d: d }, '*');
})();
