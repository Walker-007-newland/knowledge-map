// 播放器：App 里用原生播放器（系统解码，MP4/MKV 都行），画面在网页下面、对准网页里的视频框；浏览器调试时用 <video>
const Player = (() => {
  let src = null, ready = false, dur = 0, vw = 0, vh = 0, playing = false, err = '';
  let video = null, box = null;
  let clipEnd = -1, clipDone = null;
  const subs = new Set();
  const emit = (type, d) => subs.forEach(f => { try { f(type, d); } catch (e) { console.error(e); } });

  // 原生播放器的事件：prepared {dur,w,h} / size {w,h} / completed / paused / error {msg}
  window.__vEvent = (type, json) => {
    const d = json ? JSON.parse(json) : {};
    if (type === 'prepared') { ready = true; err = ''; dur = d.dur; vw = d.w; vh = d.h; }
    if (type === 'size') { vw = d.w; vh = d.h; }
    if (type === 'completed' || type === 'paused') { playing = false; keep(false); }
    if (type === 'error') { err = d.msg || '播放失败'; ready = false; playing = false; keep(false); }
    if (type === 'warn') toast(d.msg, 6000);
    emit(type, d);
  };
  const ev = (type, d) => window.__vEvent(type, d ? JSON.stringify(d) : '');

  function keep(on) { if (N) N.keepOn(on); }

  // s: {uri: content://… 或 asset:demo/demo.mp4}（App）/ {url}（浏览器）
  function open(s) {
    close();
    src = s;
    if (N) { N.vOpen(s.uri); return; }
    video = document.createElement('video');
    video.playsInline = true;
    video.preload = 'auto';
    video.addEventListener('loadedmetadata', () => ev('prepared', { dur: video.duration * 1000 | 0, w: video.videoWidth, h: video.videoHeight }));
    video.addEventListener('ended', () => ev('completed'));
    video.addEventListener('error', () => ev('error', { msg: '这个视频播放不了（格式不支持或文件已移走）' }));
    video.src = s.url;
    sync();
  }

  function close() {
    if (N) N.vClose();
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); video = null; }
    src = null; ready = false; playing = false; err = ''; dur = 0; clipEnd = -1; clipDone = null;
    keep(false);
  }

  function play() {
    if (!ready) return;
    playing = true;
    keep(true);
    if (N) N.vPlay();
    else video.play().catch(() => ev('paused'));
    emit('play');
  }

  function pause() {
    clipEnd = -1; clipDone = null;
    if (!src) return;
    playing = false;
    keep(false);
    if (N) N.vPause(); else if (video) video.pause();
    emit('pause');
  }

  function seek(t) {
    t = Math.max(0, Math.min(t | 0, dur ? dur - 200 : t | 0));
    if (N) N.vSeek(t); else if (video) video.currentTime = t / 1000;
    emit('time', t);
  }

  function pos() {
    if (!src || !ready) return 0;
    return N ? N.vPos() : video ? video.currentTime * 1000 | 0 : 0;
  }

  function rate(r) { if (N) N.vRate(r); else if (video) video.playbackRate = r; }

  // 画面放进哪个框（null = 只出声音不出画面，学习页、测验页听原声用）
  function show(el) { box = el; sync(); }
  function sync() {
    if (N) {
      if (!box || !box.isConnected) { N.vRect(0, 0, 0, 0); return; }
      const r = box.getBoundingClientRect();
      N.vRect(r.left, r.top, r.width, r.height);
    } else if (video) {
      if (box && box.isConnected) { if (video.parentNode !== box) box.prepend(video); }
      else video.remove();
    }
  }

  // 播一句：从开始前 0.1 秒播到结束后 0.25 秒自动停
  function playClip(s, e, done) {
    if (!ready) return false;
    seek(Math.max(0, s - 100));
    clipEnd = e + 250;
    clipDone = done || null;
    play();
    return true;
  }

  setInterval(() => {
    if (!src || !ready) return;
    const t = pos();
    if (clipEnd >= 0 && t >= clipEnd) { const f = clipDone; pause(); if (f) f(); }
    if (playing) emit('time', t);
  }, 100);

  return {
    open, close, play, pause, seek, pos, rate, show, sync, playClip,
    on(f) { subs.add(f); return () => subs.delete(f); },
    get src() { return src; }, get ready() { return ready; }, get playing() { return playing; },
    get dur() { return dur; }, get err() { return err; }, get size() { return [vw, vh]; },
  };
})();

function speak(text, r) {
  if (!text) return;
  if (N) { N.speak(text, r || 1); return; }
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = r || 1;
  speechSynthesis.speak(u);
}
