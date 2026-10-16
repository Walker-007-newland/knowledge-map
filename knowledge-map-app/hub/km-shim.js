// 平板 App 专用补丁：打包时注入到每个页面 <head> 里，只在 App 内（有 KMBridge）生效，普通浏览器里什么也不做
//
// 0. 门面 window.KMApp（需求 #5）：KMBridge 对页面里所有 frame（包括 B 站播放器 iframe）都可见，所以敏感方法要带「每页令牌」。
//    这里调 KMBridge.hello()，Java 用 evaluateJavascript 把令牌只送进主页面的 __kmTok；页面只用 KMApp，不再直接碰 KMBridge。
//    KMApp.xxx(...) 和原来 KMBridge 方法同名同参数，自动在前面补令牌：
//    - 没有返回值的方法：令牌没到就排队，到了按顺序发出
//    - 有返回值的方法（pinWidget、deviceName、sharedGet；#1 的 syncState、syncTake、joinState）：令牌没到时返回空值，需要结果的写在 KMApp.ready().then(...) 里
//    - 不需要令牌的（appVersion、widgetCount、widgetInfo）直接转发
//    普通浏览器里没有 KMBridge，不定义 KMApp；只在主页面（window.top === window）建门面
(function () {
  var B = window.KMBridge;
  if (!B || window.__kmShim) return;
  if (window.top !== window && !window.__kmShimTest) return;     // __kmShimTest：测试页在同源 iframe 里模拟主页面用
  window.__kmShim = 1;

  var token = '', queue = [], retry = 0, readyFn, ready = new Promise(function (ok) { readyFn = ok; });
  function call(m, args) {
    try { return B[m].apply(B, [token].concat(args)); } catch (e) { return undefined; }
  }
  function gotToken(t) {
    if (typeof t !== 'string' || !/^[0-9a-f]{32}$/.test(t)) return;
    var first = !token;
    token = t;
    clearTimeout(retry);
    if (!first) return;
    var q = queue; queue = [];
    q.forEach(function (c) { call(c[0], c[1]); });
    readyFn();
  }
  try { Object.defineProperty(window, '__kmTok', { value: gotToken, writable: false, configurable: false }); }
  catch (e) { return; }
  function hello() {
    try { B.hello(); } catch (e) { /* 忽略 */ }
    retry = setTimeout(function () { if (!token) hello(); }, 3000);   // 3 秒还没拿到就再要一次
  }

  var A = {
    ready: function () { return ready; },
    isReady: function () { return !!token; }
  };
  ['speak', 'stopSpeak', 'saveFile', 'updatePet', 'savePetImage', 'keepScreenOn', 'goBack', 'checkUpdate', 'openAppSettings', 'sharedPut',
    // #1 设备同步：没有返回值，结果经 window.__kmSyncEvent 事件回来
    'syncNow', 'syncPublish', 'syncAck', 'nodeJoin', 'nodeRemove', 'joinOpen', 'joinClose', 'joinScan', 'joinConfirm',
    'syncRename', 'syncRemove', 'syncLeave'].forEach(function (m) {
    if (B[m]) A[m] = function () {
      var args = Array.prototype.slice.call(arguments);
      if (token) call(m, args); else queue.push([m, args]);
    };
  });
  var empty = { pinWidget: false, deviceName: '', sharedGet: '', syncState: '', syncTake: '', joinState: '' };
  Object.keys(empty).forEach(function (m) {
    if (B[m]) A[m] = function () { return token ? call(m, Array.prototype.slice.call(arguments)) : empty[m]; };
  });
  ['appVersion', 'widgetCount', 'widgetInfo'].forEach(function (m) {
    if (B[m]) A[m] = function () { return B[m].apply(B, arguments); };
  });
  // 真机自检包才有 KMSelfTest：只问门卫当前令牌能不能调某方法，不执行
  if (window.KMSelfTest) A.selfCheck = function (m) { try { return KMSelfTest.check(token, m); } catch (e) { return false; } };
  Object.freeze(A);
  try { Object.defineProperty(window, 'KMApp', { value: A, writable: false, configurable: false }); }
  catch (e) { return; }
  hello();
  // 从往返缓存里恢复的页面（返回键回来，没有重新加载）：手里的令牌可能早已作废，重新要一张，期间的调用照样排队
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    token = '';
    clearTimeout(retry);
    hello();
  });

  // 1. “备份进度”用 blob 链接下载，WebView 不支持，改由原生保存到“下载”目录
  var blobs = {}, createURL = URL.createObjectURL;
  URL.createObjectURL = function (b) {
    var u = createURL.call(URL, b);
    if (b instanceof Blob) blobs[u] = b;
    return u;
  };
  var click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    var b = this.download && blobs[this.href];
    if (!b) return click.apply(this, arguments);
    var name = this.download;
    b.text().then(function (t) { A.saveFile(name, t); });
  };

  // 2. 朗读：WebView 没有可用的 speechSynthesis，转给安卓系统的语音朗读（TTS），离线可用
  var seq = 0, pending = {};
  function Utterance(text) {
    this.text = text || ''; this.lang = ''; this.rate = 1; this.pitch = 1; this.volume = 1; this.voice = null;
    this.onstart = this.onend = this.onerror = null;
  }
  function finish(id, ok) {
    var u = pending[id];
    if (!u) return;
    delete pending[id];
    var f = ok ? u.onend : u.onerror;
    if (f) { try { f.call(u, { type: ok ? 'end' : 'error', utterance: u }); } catch (e) { /* 忽略 */ } }
  }
  var synth = {
    speaking: false, pending: false, paused: false, onvoiceschanged: null,
    getVoices: function () { return []; },
    speak: function (u) {
      var id = String(++seq);
      pending[id] = u;
      A.speak(id, String(u.text), u.lang || '', +u.rate || 1, +u.pitch || 1);
    },
    cancel: function () {
      A.stopSpeak();
      Object.keys(pending).forEach(function (id) { finish(id, false); });
    },
    pause: function () {}, resume: function () {},
    addEventListener: function () {}, removeEventListener: function () {}
  };
  window.SpeechSynthesisUtterance = Utterance;
  try { Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true }); }
  catch (e) { window.speechSynthesis = synth; }
  window.__kmTtsDone = finish;
})();
