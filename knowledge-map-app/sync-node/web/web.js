// 网页后台外壳（#6 第二期）：登录、会话、「账号安全」页，以及给 node.js 用的小函数和 Native 垫片。
// 节点页本身（状态、同步组、邀请码、限额与访问、操作日志）直接用审批 App 的 node.js，页面只维护一份。
//
// 安全要点：
// - 只能在安全上下文里用（https:// 或 http://localhost / 127.0.0.1 经 SSH 隧道），否则 crypto.subtle 不可用，直接拒绝。
// - 登录成功后节点发一把 32 字节会话密钥 S（只经 TLS / 本机回环传输）。这里马上派生出 AES-GCM 密钥并导入成「不可导出」，
//   S 和派生字节随即清零；不进 localStorage / sessionStorage / cookie。刷新或关掉页面就要重新登录。
// - 之后每个管理操作走第一期的 /admin/v1 整包加密信封（{v,kid,ctr,iv,ct}），计数递增防重放，响应也加密。
// - 请求排队一个一个发（同审批 App 的 Node.java），避免并发请求到达顺序乱了被当成重放。
'use strict';

window.KM_WEB = true;
const MOCK = false;
let current = null, tab = 'node';

// ---------- node.js 需要的小函数（和审批 App index.html 里同名同义） ----------
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const when = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
function ago(t) {
  if (!t) return '';
  const m = Math.round((Date.now() - new Date(t)) / 60000);
  return m < 1 ? '刚刚' : m < 60 ? `${m} 分钟前` : m < 1440 ? `${Math.round(m / 60)} 小时前` : `${Math.round(m / 1440)} 天前`;
}
function toast(msg, ms = 2200) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), ms);
}
/** node.js 会调它更新「节点」标签的红点；网页没有标签，就把红点放在标题上。 */
function renderTabs() {
  const h = $('title');
  if (h) h.innerHTML = '节点后台' + (window.nodeAlert ? '<span class="dot" title="节点需要注意"></span>' : '');
}
/** 从组详情返回。 */
function renderList() {
  current = null; $('back').hidden = true; renderTabs();
  if (sess.kid) renderNode();
}

// ---------- 会话与加密 ----------
const sess = { kid: null, aes: null, last: 0, user: '' };
const te = new TextEncoder(), td = new TextDecoder();
const b64e = u8 => { let s = ''; u8.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
function b64d(s) {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
  const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u;
}
const secureOk = () => window.isSecureContext && window.crypto && crypto.subtle;

async function startSession(kid, keyB64, user) {
  const raw = b64d(keyB64);
  const hk = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  raw.fill(0);
  const enc = new Uint8Array(await crypto.subtle.sign('HMAC', hk, te.encode('km-admin-enc-v1')));
  sess.aes = await crypto.subtle.importKey('raw', enc, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  enc.fill(0);
  Object.assign(sess, { kid, user, last: 0 });
}
function endSession() { Object.assign(sess, { kid: null, aes: null, last: 0, user: '' }); }

/** 发一个管理操作，返回 [状态码, 解开的响应文字]。计数落后时凭只有自己看得懂的 X-KM-Retry 提示重试一次。 */
async function adminCall(op, args, retry = true) {
  if (!sess.aes) return [403, ''];
  const kid = sess.kid, ctr = sess.last = Math.max(sess.last + 1, Date.now());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: te.encode(`km-admin-req|${kid}|${ctr}`) },
    sess.aes, te.encode(JSON.stringify({ op, args: args || {} }))));
  let r;
  try {
    r = await fetch('/admin/v1', { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', credentials: 'omit',
      body: JSON.stringify({ v: 1, kid, ctr, iv: b64e(iv), ct: b64e(ct) }) });
  } catch (e) { return [0, '连不上节点（网络断了，或服务器停了）']; }
  const hint = r.headers.get('X-KM-Retry');
  if (r.status === 403 && retry && hint && sess.aes) {
    try {
      const [hiv, hct] = hint.split('.');
      const p = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(hiv), additionalData: te.encode(`km-admin-retry|${kid}|${ctr}`) }, sess.aes, b64d(hct));
      sess.last = Math.max(sess.last, JSON.parse(td.decode(p)).last);
      return adminCall(op, args, false);
    } catch (e) { /* 解不开就当普通 403 */ }
  }
  if (r.status !== 200) return [r.status, ''];
  try {
    const j = await r.json();
    const p = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(j.iv), additionalData: te.encode(`km-admin-resp|${kid}|${ctr}`) }, sess.aes, b64d(j.ct));
    return [200, td.decode(p)];
  } catch (e) { return [0, '节点的响应解不开']; }
}

// 和审批 App 原生桥同名的垫片：node.js 不知道自己在 App 里还是网页里
let queue = Promise.resolve();
window.Native = {
  nodeInfo: () => JSON.stringify({ configured: !!sess.kid, host: location.hostname, port: +location.port || (location.protocol === 'https:' ? 443 : 80), kid: sess.kid || '' }),
  nodeCall: (id, op, argsJson) => {
    let args = {}; try { args = JSON.parse(argsJson || '{}'); } catch (e) { /* 空参数 */ }
    queue = queue.then(() => adminCall(op, args)).then(([s, t]) => window.__nodeDone(id, s, t), e => window.__nodeDone(id, 0, '出错：' + e.message));
  },
  nodeSetup: () => JSON.stringify({ err: '网页后台不用管理码' }),
  nodeClear: () => {},
};

// ---------- 登录 / 退出 ----------
function showLogin(msg) {
  endSession();
  current = null;
  for (const id of ['back', 'who', 'logout']) $(id).hidden = true;
  renderTabs();
  if (!secureOk()) { $('main').innerHTML = $('insecureTpl').innerHTML; return; }
  $('main').innerHTML = $('loginTpl').innerHTML;
  if (msg) $('lmsg').textContent = msg;
  $('luser').focus();
  $('lform').onsubmit = async ev => {
    ev.preventDefault();
    const user = $('luser').value.trim(), pw = $('lpw').value, code = $('lcode').value.trim();
    if (!user || !pw) { $('lmsg').textContent = '请输入用户名和密码'; return; }
    $('lgo').disabled = true; $('lmsg').textContent = '';
    let r, j = {};
    try {
      r = await fetch('/admin/web/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', credentials: 'omit',
        body: JSON.stringify({ user, pw, code }) });
      try { j = await r.json(); } catch (e) { j = {}; }
    } catch (e) { $('lmsg').textContent = '连不上节点：网络断了，或服务器停了'; $('lgo').disabled = false; return; }
    $('lpw').value = ''; $('lcode').value = '';
    if (r.status !== 200 || !j.ok) { $('lmsg').textContent = j.msg || `登录失败（${r.status}）`; $('lgo').disabled = false; return; }
    try { await startSession(j.kid, j.key, j.user); } catch (e) { $('lmsg').textContent = '浏览器加密功能出错：' + e.message; $('lgo').disabled = false; return; }
    j.key = null;
    showShell();
  };
}

function showShell() {
  $('who').textContent = sess.user + ' · 会话 ' + sess.kid.slice(0, 4);
  $('who').hidden = false; $('logout').hidden = false;
  nodeState.sub = 'status';
  renderList();
}

/** node.js 收到 403（会话过期、被踢下线、密码被改）时调。 */
window.webLoggedOut = msg => { if (sess.kid) showLogin(msg); };

async function logout() {
  if (sess.kid) { try { await nodeCall('web.logout'); } catch (e) { /* 已经失效也一样 */ } }
  showLogin('已退出');
}

// ---------- 「账号安全」页（node.js 的子页，只在网页里有） ----------
window.webAccountView = async function () {
  let me, list;
  try { me = await nodeCall('web.whoami'); list = await nodeCall('web.sessions'); } catch (e) { nbody(downCard(e)); return bindRetry(renderNode); }
  if (nodeState.sub !== 'account') return;
  const live = list.filter(x => x.alive);
  nbody(`
    <div class="card"><div class="kv">
      <span>用户名</span><b>${esc(me.user)}</b>
      <span>本次登录</span><b>会话 ${esc(me.kid.slice(0, 4))} · ${when(me.created)} 登录 · 最晚 ${when(me.expires)} 自动退出</b>
      <span>二次验证</span><b class="${me.totp ? 'nok' : 'nwarn'}">${me.totp ? '已开' : '没开（建议开）'}</b>
    </div><div class="hint">空闲 30 分钟、或登录满 12 小时自动退出；刷新或关掉页面要重新登录。</div></div>
    <div class="card form"><div style="font-weight:700">改密码</div>
      <label for="pold">当前密码</label><input id="pold" type="password" autocomplete="current-password" maxlength="128">
      <label for="pnew">新密码（至少 12 个字符）</label><input id="pnew" type="password" autocomplete="new-password" maxlength="128">
      <label for="pnew2">再输一次</label><input id="pnew2" type="password" autocomplete="new-password" maxlength="128">
      <div class="hint" id="phint">改完后所有网页会话（包括这个）都会退出，要用新密码重新登录。</div>
      <div class="row"><button class="primary" id="psave">改密码</button></div></div>
    <div class="card form totpbox" id="tbox"><div style="font-weight:700">二次验证</div>
      ${me.totp ? `<div class="hint">登录时要输手机验证器上的 6 位码。要关掉：输当前密码和现在的验证码。手机丢了：在审批 App 里关。</div>
        <label for="tpw">当前密码</label><input id="tpw" type="password" autocomplete="current-password" maxlength="128">
        <label for="tcode">验证码</label><input id="tcode" inputmode="numeric" autocomplete="one-time-code" maxlength="6">
        <div class="row"><button class="danger" id="toff">关闭二次验证</button></div>`
      : `<div class="hint">开了以后，登录除了密码还要输手机验证器 App（腾讯身份验证器、Microsoft Authenticator、Google 身份验证器都行）上的 6 位码，密码泄露了别人也登不进来。</div>
        <label for="tpw">当前密码</label><input id="tpw" type="password" autocomplete="current-password" maxlength="128">
        <div class="row"><button class="primary" id="tbegin">开启二次验证</button></div>
        <div id="tstep2" hidden>
          <div class="hint">用验证器 App 扫下面的二维码（或手动输入文字密钥），再输入它显示的 6 位码。</div>
          <canvas id="tqr"></canvas>
          <div>文字密钥：<span class="secret" id="tsec"></span></div>
          <label for="tcode">验证码</label><input id="tcode" inputmode="numeric" autocomplete="one-time-code" maxlength="6">
          <div class="row"><button class="primary" id="tok">确认开启</button></div>
        </div>`}
    </div>
    <div class="card"><div style="font-weight:700;margin-bottom:4px">我的会话（${live.length}）</div>
      ${live.map(x => `<div class="feed">会话 <b>${esc(x.kid.slice(0, 4))}</b>${x.current ? ' <span class="chip nok">这个</span>' : ''} · ${esc(x.ip)} · 登录 ${when(x.created)} · 最后使用 ${ago(x.last_used)}
          <div class="hint" style="word-break:break-all">${esc(x.ua || '')}</div>
          ${x.current ? '' : `<div class="row"><button class="danger" data-k="${esc(x.kid)}">踢下线</button></div>`}</div>`).join('')}
      <div class="row"><button id="aout">退出这次登录</button></div></div>`);
  const ph = () => {
    const pw = $('pnew').value, h = pw && pwHint(pw, me.user, location.hostname);
    $('phint').textContent = !pw ? '改完后所有网页会话（包括这个）都会退出，要用新密码重新登录。' : h ? '✗ ' + h : $('pnew2').value && $('pnew2').value !== pw ? '✗ 两次输入不一样' : '✓ 可以用';
  };
  $('pnew').oninput = $('pnew2').oninput = ph;
  $('psave').onclick = async () => {
    const old = $('pold').value, nw = $('pnew').value;
    if (!old) return toast('请输入当前密码');
    const h = pwHint(nw, me.user, location.hostname); if (h) return toast('新密码' + h);
    if (nw !== $('pnew2').value) return toast('两次输入的新密码不一样');
    try { await nodeCall('web.changePassword', { old, new: nw }); showLogin('密码已改，请用新密码重新登录'); }
    catch (e) { toast(e.message, 4000); }
  };
  if ($('tbegin')) $('tbegin').onclick = async () => {
    try {
      const r = await nodeCall('web.totpBegin', { pw: $('tpw').value });
      $('tpw').value = '';
      await loadScript('vendor/qrcode.js');
      const q = qrcode(0, 'M'); q.addData(r.uri); q.make();
      const n = q.getModuleCount(), quiet = 4, cell = 6, c = $('tqr');
      c.width = c.height = (n + quiet * 2) * cell;
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000';
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) g.fillRect((x + quiet) * cell, (y + quiet) * cell, cell, cell);
      $('tsec').textContent = r.secret.replace(/(.{4})/g, '$1 ').trim();
      $('tstep2').hidden = false; $('tbegin').disabled = true; $('tcode').focus();
    } catch (e) { toast(e.message, 4000); }
  };
  if ($('tok')) $('tok').onclick = async () => {
    try { await nodeCall('web.totpConfirm', { code: $('tcode').value.trim() }); toast('二次验证已开启，下次登录要输验证码', 3500); renderNode(); }
    catch (e) { toast(e.message, 4000); }
  };
  if ($('toff')) $('toff').onclick = async () => {
    if (!confirm('关闭二次验证后，登录只要用户名和密码。确定？')) return;
    try { await nodeCall('web.totpDisable', { pw: $('tpw').value, code: $('tcode').value.trim() }); toast('已关闭二次验证'); renderNode(); }
    catch (e) { toast(e.message, 4000); }
  };
  $('nbody').querySelectorAll('[data-k]').forEach(b => b.onclick = async () => {
    if (!confirm(`把会话 ${b.dataset.k.slice(0, 4)} 踢下线？`)) return;
    try { await nodeCall('web.revoke', { kid: b.dataset.k }); toast('已踢下线'); renderNode(); } catch (e) { toast(e.message, 4000); }
  });
  $('aout').onclick = logout;
};

// ---------- 启动（node.js 加载完以后） ----------
document.addEventListener('DOMContentLoaded', () => {
  $('back').onclick = renderList;
  $('logout').onclick = logout;
  showLogin('');
});
