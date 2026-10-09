// 平板 App 专用补丁：打包时注入到每个页面 <head> 里，只在 App 内（有 KMBridge）生效，普通浏览器里什么也不做
(function () {
  var B = window.KMBridge;
  if (!B || window.__kmShim) return;
  window.__kmShim = 1;

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
    b.text().then(function (t) { B.saveFile(name, t); });
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
      B.speak(id, String(u.text), u.lang || '', +u.rate || 1, +u.pitch || 1);
    },
    cancel: function () {
      B.stopSpeak();
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
