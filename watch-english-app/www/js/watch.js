// 观看：视频 + 字幕（英 / 中英 / 中 / 无）+ 台词列表；点字幕里的词暂停并查词，单句循环、上一句下一句、变速、全屏
const SPEEDS = [0.6, 0.75, 1, 1.25];
const Watch = {
  on: false, full: false, ci: -1, active: false, loopCi: -1, follow: 0, unsub: null, hideTimer: 0, lastSave: 0, dragging: false, pending: null,

  draw(body, p) {
    this.on = true;
    this.p = p;
    const mode = Settings.subMode;
    body.innerHTML = `<div class="watch" id="watch">
      <div class="vcol">
        <div class="vbox" id="vbox"><div class="vtap" data-act="vtap"></div><div class="vmsg" id="vmsg" hidden></div><div class="ovsub" id="ovsub"></div></div>
        <div class="ctrl" id="ctrl">
          <div class="rowc"><input type="range" id="seek" min="0" max="1000" value="0" class="grow"><span class="time" id="time">0:00</span></div>
          <div class="rowc">
            <button class="btn-icon" data-act="prev" title="上一句">⏮</button>
            <button class="btn-icon" data-act="play" id="playBtn">▶</button>
            <button class="btn-icon" data-act="next" title="下一句">⏭</button>
            <button class="btn-icon ${this.loopCi >= 0 ? 'on' : ''}" data-act="loop" id="loopBtn" title="单句循环">🔁</button>
            <span class="grow"></span>
            <div class="seg" id="subSeg">${[['en', '英'], ['both', '中英'], ['zh', '中'], ['none', '无']].map(([k, n]) => `<button class="${mode === k ? 'on' : ''}" data-act="mode" data-v="${k}">${n}</button>`).join('')}</div>
            <button class="btn small" data-act="speed" id="speedBtn">${Settings.speed}x</button>
            <button class="btn-icon" data-act="full" title="全屏">⛶</button>
          </div>
        </div>
      </div>
      <div class="tlist" id="tlist"></div>
    </div>`;
    document.documentElement.style.setProperty('--sub-scale', Settings.font);
    if (N) document.body.classList.add('see-through');
    this.drawList();
    this.layout();
    if (this.unsub) this.unsub();
    this.unsub = Player.on((type, d) => this.onEvent(type, d));
    const start = p.startAt != null ? p.startAt : (MV.meta.last && MV.meta.last.t) || 0;
    this.pending = { t: start, play: p.startAt != null };
    p.startAt = null;
    if (Player.ready) this.applyPending();
    this.updateMsg();
    this.ci = -1;
    this.tick(Player.ready ? Player.pos() : start);
    const seek = $('#seek');
    seek.oninput = () => { this.dragging = true; $('#time').textContent = Subs.fmt(Player.dur * seek.value / 1000) + ' / ' + Subs.fmt(Player.dur); };
    seek.onchange = () => { this.dragging = false; Player.seek(Player.dur * seek.value / 1000); };
    const tl = $('#tlist');
    const hold = () => { this.follow = Date.now() + 5000; };
    tl.addEventListener('touchstart', hold, { passive: true });
    tl.addEventListener('wheel', hold, { passive: true });
  },

  drawList() {
    const A = MV.A, tl = $('#tlist');
    tl.className = 'tlist' + (/^(zh|none)$/.test(Settings.subMode) ? ' hide-en' : '') + (/^(en|none)$/.test(Settings.subMode) ? ' hide-zh' : '');
    tl.innerHTML = A.cues.map((c, ci) => `<div class="row" data-act="seekline" data-ci="${ci}" id="r${ci}">
      <div class="head"><span class="t">${Subs.fmt(c.s)}</span><span class="grow"></span>${A.packLine.get(ci) && A.packLine.get(ci).note ? '<span class="badge">精讲</span>' : ''}
      ${c.en ? `<button class="btn small" data-act="line" data-ci="${ci}">详解</button>` : ''}</div>
      ${c.en ? `<div class="en">${lineHtml(ci)}</div>` : ''}<div class="zh">${esc(A.zhOf(ci))}</div></div>`).join('');
    if (this.ci >= 0) { const r = $('#r' + this.ci); if (r) r.classList.add('cur'); }
  },

  layout() {
    const w = $('#watch');
    if (!w) return;
    w.classList.toggle('land', innerWidth > innerHeight && innerWidth >= 700 && !this.full);
    requestAnimationFrame(() => { if (this.on) Player.show($('#vbox')); });
  },

  updateMsg() {
    const m = $('#vmsg');
    if (!m) return;
    let html = '';
    const v = MV.meta.video;
    if (v && v.dl && !v.uri) {
      const j = DL.job(v.dl);
      html = `<div>视频正在下载</div><div class="small" data-dl="${v.dl}">${esc(DL.label(j))}</div><div class="btns" style="justify-content:center">${DL.buttons(j)}</div>
        <div class="small">下完自动能看；现在可以先看字幕、点「详解」学习</div>`;
    } else if (!v) html = '<div>这部电影还没有视频</div><div class="btns" style="justify-content:center"><button class="btn" data-act="pickvideo">选择视频文件</button><button class="btn" data-act="linkdl">从链接下载</button></div><div class="small">没有视频也能看字幕、点「详解」学习</div>';
    else if (Player.err) html = `<div>${esc(Player.err)}</div><div class="small">${esc(MV.meta.video.name)}</div><button class="btn" data-act="pickvideo">重新选择视频</button>`;
    else if (!Player.ready) html = '<div>正在打开视频…</div>';
    m.hidden = !html;
    m.innerHTML = html;
    const pb = $('#playBtn');
    if (pb) pb.textContent = Player.playing ? '⏸' : '▶';
  },

  applyPending() {
    const pd = this.pending;
    this.pending = null;
    Player.rate(Settings.speed);
    if (!pd) return;
    if (pd.t) Player.seek(pd.t);
    if (pd.play) Player.play();
  },

  onEvent(type, d) {
    if (!this.on) return;
    if (type === 'prepared') { this.applyPending(); this.layout(); }
    if (type === 'time') this.tick(d);
    if (type === 'play' && this.full) this.autoHide();
    if (type === 'completed' || type === 'paused' || type === 'pause') this.showCtrl();
    if (type !== 'time') this.updateMsg();
  },

  // 当前时间 → 哪一句（最后一句开始时间 ≤ t 的）
  cueAt(t) {
    const cues = MV.A.cues;
    let lo = 0, hi = cues.length - 1, ans = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (cues[m].s <= t) { ans = m; lo = m + 1; } else hi = m - 1; }
    return ans;
  },

  tick(t) {
    const A = MV.A;
    if (this.loopCi >= 0 && Player.playing && t > A.cues[this.loopCi].e + 150) { Player.seek(A.cues[this.loopCi].s); return; }
    if (!this.dragging && $('#seek')) {
      $('#seek').value = Player.dur ? Math.round(1000 * t / Player.dur) : 0;
      $('#time').textContent = Subs.fmt(t) + ' / ' + Subs.fmt(Player.dur);
    }
    const ci = this.cueAt(t);
    const active = ci >= 0 && t <= A.cues[ci].e;
    if (ci !== this.ci || active !== this.active) {
      if (ci !== this.ci) {
        const old = $('#r' + this.ci);
        if (old) old.classList.remove('cur');
        const row = $('#r' + ci), tl = $('#tlist');
        if (row) {
          row.classList.add('cur');
          if (Date.now() > this.follow && tl && !this.full) tl.scrollTo({ top: row.offsetTop - tl.clientHeight / 3, behavior: Math.abs(ci - this.ci) > 3 ? 'auto' : 'smooth' });
        }
      }
      this.ci = ci;
      this.active = active;
      this.drawSub();
    }
    if (Player.playing && Date.now() - this.lastSave > 5000) this.savePos(t);
  },

  drawSub() {
    const ov = $('#ovsub');
    if (!ov) return;
    const ci = this.ci, m = Settings.subMode;
    if (ci < 0 || !this.active || m === 'none' || !Player.ready) { ov.innerHTML = ''; return; }
    const c = MV.A.cues[ci], zh = MV.A.zhOf(ci);
    let html = '';
    if (m !== 'zh' && c.en) html += `<div><span class="l oen">${lineHtml(ci, { tap: true })}</span></div>`;
    if (m !== 'en' && zh) html += `<div><span class="l ozh">${esc(zh)}</span></div>`;
    ov.innerHTML = html;
  },

  savePos(t) {
    this.lastSave = Date.now();
    MV.meta.last = { t, at: Date.now() };
    Movies.update(MV.id, { last: MV.meta.last });
  },

  showCtrl() { const c = $('#ctrl'); if (c) c.classList.remove('hide'); clearTimeout(this.hideTimer); },
  autoHide() {
    this.showCtrl();
    this.hideTimer = setTimeout(() => { if (this.full && Player.playing) { const c = $('#ctrl'); if (c) c.classList.add('hide'); } }, 3500);
  },

  setFull(on) {
    this.full = on;
    const w = $('#watch');
    if (w) w.classList.toggle('full', on);
    $('#app').classList.toggle('fullmode', on);
    if (N) N.fullscreen(on);
    if (on && Player.playing) this.autoHide(); else this.showCtrl();
    this.layout();
    setTimeout(() => this.layout(), 400);
  },

  act(a, t) {
    const A = MV.A;
    if (a === 'play') { Player.playing ? Player.pause() : Player.play(); }
    else if (a === 'vtap') {
      if (this.full && $('#ctrl').classList.contains('hide')) { this.autoHide(); return; }
      Player.playing ? Player.pause() : Player.play();
    } else if (a === 'prev' || a === 'next') {
      const t0 = Player.pos(), ci = this.cueAt(t0);
      let k = a === 'next' ? ci + 1 : (ci >= 0 && t0 - A.cues[ci].s > 1500 ? ci : ci - 1);
      k = Math.max(0, Math.min(A.cues.length - 1, k));
      if (this.loopCi >= 0) this.loopCi = k;
      Player.seek(A.cues[k].s);
      if (!Player.playing) Player.play();
    } else if (a === 'loop') {
      this.loopCi = this.loopCi >= 0 ? -1 : Math.max(0, this.cueAt(Player.pos()));
      t.classList.toggle('on', this.loopCi >= 0);
      toast(this.loopCi >= 0 ? '单句循环：开' : '单句循环：关', 1200);
    } else if (a === 'mode') {
      Settings.subMode = t.dataset.v; saveSettings();
      $('#subSeg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === Settings.subMode));
      this.drawList(); this.drawSub();
    } else if (a === 'speed') {
      Settings.speed = SPEEDS[(SPEEDS.indexOf(Settings.speed) + 1) % SPEEDS.length]; saveSettings();
      t.textContent = Settings.speed + 'x';
      Player.rate(Settings.speed);
    } else if (a === 'full') this.setFull(!this.full);
    else if (a === 'seekline') {
      const ci = +t.dataset.ci;
      if (!Player.ready) { if (A.cues[ci].en) openSheet(linePage(ci)); return; }
      if (this.loopCi >= 0) this.loopCi = ci;
      Player.seek(A.cues[ci].s);
      Player.play();
    } else if (a === 'tok') {
      Player.pause();
      t.classList.add('sel');
      openSheet(tokenPage(+t.dataset.ci, +t.dataset.ti));
    } else if (a === 'pickvideo') {
      pickVideo().then(v => {
        if (!v) return;
        if (MV.meta.video && MV.meta.video.dl && N) N.dlRemove(MV.meta.video.dl, true);
        MV.meta = Movies.update(MV.id, { video: v });
        Player.open(videoSrc(v));
        this.updateMsg();
      });
    }
  },

  leave() {
    if (!this.on) return;
    this.on = false;
    if (this.unsub) { this.unsub(); this.unsub = null; }
    if (Player.ready) this.savePos(Player.pos());
    if (this.full) { this.full = false; $('#app').classList.remove('fullmode'); if (N) N.fullscreen(false); }
    clearTimeout(this.hideTimer);
    Player.pause();
    Player.show(null);
    document.body.classList.remove('see-through');
  },
};

addEventListener('resize', () => { if (Watch.on) Watch.layout(); });
