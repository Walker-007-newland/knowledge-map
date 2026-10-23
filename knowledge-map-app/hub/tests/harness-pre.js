// SyncHarness --serve 把真的总入口 hub/index.html?harness=A 当成一台平板时，排在 km-data.js 前面加载（见 HarnessServer.asDevice）：
// 清空本来源（端口）的 localStorage，按测试页存好的数据（/api/pageSeed）写成这台平板的本机数据。只在测试里用，不打包。
(function () {
  var d = new URLSearchParams(location.search).get('harness');
  if (!d) return;
  var x = new XMLHttpRequest();
  x.open('POST', '/api/pageSeed?d=' + encodeURIComponent(d), false);
  x.send('');
  var seed = JSON.parse(x.responseText || '{}');
  localStorage.clear();
  if (seed.device) localStorage.setItem('km-device-v1', JSON.stringify({ id: seed.device.id, name: seed.device.name, created: 1 }));
  var keys = seed.keys || {};
  Object.keys(keys).forEach(function (k) { localStorage.setItem(k, typeof keys[k] === 'string' ? keys[k] : JSON.stringify(keys[k])); });
  localStorage.setItem('km-meta-v1', JSON.stringify(seed.meta || {}));
})();
