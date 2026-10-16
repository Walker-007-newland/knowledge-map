// 「节点」页：管理腾讯云上的同步节点 km-sync（#6）。审批 App 和网页后台（sync-node/web，#6 第二期）共用这一份。
// 审批 App：网络请求走原生 Native.nodeCall（Node.java：Socket + 整包 AES-GCM），管理密钥只在原生侧，网页拿不到。
// 网页后台：sync-node/web/web.js 提供同名的 Native 垫片（WebCrypto + fetch，会话密钥只在内存里），并设 window.KM_WEB = true。
// 浏览器 ?mock 时用 mockNode 假数据；?mock&node=none 预览「未配置」，?mock&node=down 预览「连不上」，?mock&node=cert 预览证书快过期。
// 依赖页面里的 $、esc、toast、when、ago、MOCK、current、tab、renderList、renderTabs。

const NODE_MOCK = (location.search.match(/[?&]node=(\w+)/) || [])[1] || '';
const KM_WEB = !!window.KM_WEB;
const NODE_SUBS = [['status', '状态'], ['groups', '同步组'], ['invites', '邀请码'], ['access', '限额与访问'], ['log', '操作日志']]
  .concat(KM_WEB ? [['account', '账号安全']] : []);
const nodeState = { sub: 'status', status: null, err: null, groups: null, invites: null, log: null, logSec: false, busy: false };
window.nodeAlert = false;

// ---------- 原生桥 ----------
let nodeSeq = 0; const nodeWaiting = {};
window.__nodeDone = (id, status, text) => { const w = nodeWaiting[id]; delete nodeWaiting[id]; if (w) w(status, text); };

function nodeInfo() {
  if (MOCK) return mockNodeInfo();
  try { return window.Native && Native.nodeInfo ? JSON.parse(Native.nodeInfo()) : { configured: false }; } catch (e) { return { configured: false }; }
}
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* 存不了就算了 */ } }

/** 调管理操作：成功 resolve data；失败 reject Error，e.kind = down（连不上）| denied（403）| rate（429）| op（节点拒绝，e.message 是中文原因）。 */
function nodeCall(op, args) {
  const settle = (status, text) => {
    if (status === 200) {
      let r; try { r = JSON.parse(text); } catch (e) { return Promise.reject(Object.assign(new Error('节点响应解不开'), { kind: 'down' })); }
      if (r.ok) return Promise.resolve(r.data);
      return Promise.reject(Object.assign(new Error(r.msg || r.err || '失败'), { kind: 'op', code: r.err }));
    }
    if (status === 0) return Promise.reject(Object.assign(new Error(text || '连不上'), { kind: 'down' }));
    if (status === 429) return Promise.reject(Object.assign(new Error('请求太频繁，过一分钟再试'), { kind: 'rate' }));
    if (KM_WEB) {
      if (window.webLoggedOut) setTimeout(() => window.webLoggedOut('登录已过期或被踢下线，请重新登录'), 0);
      return Promise.reject(Object.assign(new Error('登录已过期或被踢下线，请重新登录'), { kind: 'denied' }));
    }
    const off = lsGet('km-node-remote-off') === '1';
    return Promise.reject(Object.assign(new Error(off ? '已关闭外网管理：只能经电脑 SSH 隧道管理。要恢复，在电脑上运行 deploy.ps1 -ResetAdminAccess'
      : `节点拒绝了请求（${status}）：管理码可能已失效（换过管理密钥），或这个网络的 IP 被限速/封禁了`), { kind: 'denied' }));
  };
  if (MOCK) return new Promise(r => setTimeout(r, 120)).then(() => { const [s, t] = mockNode(op, args || {}); return settle(s, t); });
  return new Promise((resolve, reject) => {
    const id = 'n' + (++nodeSeq);
    nodeWaiting[id] = (s, t) => settle(s, t).then(resolve, reject);
    Native.nodeCall(id, op, JSON.stringify(args || {}));
  });
}

// ---------- 小工具 ----------
const fmtBytes = n => n == null ? '—' : n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : n < 1073741824 ? `${(n / 1048576).toFixed(1)} MB` : `${(n / 1073741824).toFixed(1)} GB`;
const fmtDays = s => s < 3600 ? `${Math.max(1, Math.round(s / 60))} 分钟` : s < 86400 ? `${Math.round(s / 3600)} 小时` : `${Math.floor(s / 86400)} 天`;
const agoMs = t => t ? ago(t) : '从未';
const short = g => String(g || '').slice(0, 6);
const day = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

/** 管理码格式检查（和 Node.java 的 parse 同样的规则和提示）；返回错误说明或 null。 */
function adminCodeError(text) {
  const t = String(text || '').trim();
  if (!t.startsWith('kmadmin:1?')) return '这不是管理码（应该以 kmadmin:1? 开头）';
  const q = {}; t.slice(10).split('&').forEach(p => { const i = p.indexOf('='); if (i > 0) q[p.slice(0, i)] = p.slice(i + 1); });
  if (!q.h || !/^[0-9A-Za-z.\-]{1,253}$/.test(q.h)) return '管理码里缺少节点地址（h）或格式不对';
  const port = +q.p; if (!(port >= 1 && port <= 65535) || !/^\d+$/.test(q.p || '')) return '管理码里的端口（p）不对';
  if (!q.k) return '管理码里缺少管理密钥（k）';
  if (q.k.length !== 43 || !/^[A-Za-z0-9_-]+$/.test(q.k)) return '管理密钥（k）长度不对，应该是 43 个字符';
  return null;
}

function nodeSetup(text) {
  const err = adminCodeError(text);
  if (err) return { err };
  if (MOCK) { window.__mockNodeInfo = { configured: true, host: '43.142.41.27', port: 8787, kid: 'c0ffee42' }; return { ok: true, kid: 'c0ffee42' }; }
  try { return JSON.parse(Native.nodeSetup(String(text).trim())); } catch (e) { return { err: '保存失败：' + e.message }; }
}

function loadScript(src) {
  return new Promise((ok, bad) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error('加载 ' + src + ' 失败'));
    document.head.appendChild(s);
  });
}

/** 从图片文件里读二维码（jsQR）：先缩到 1600 像素以内试，不行再缩小试。 */
async function decodeQrFile(file) {
  await loadScript('vendor/jsQR.js');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad(new Error('图片打不开')); i.src = url; });
    for (const max of [1600, 1000, 640, 2400]) {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
      const r = jsQR(g.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
      if (r && r.data) return r.data;
    }
    return null;
  } finally { URL.revokeObjectURL(url); }
}

/** 扫码 / 选图 / 粘贴 三种方式拿到管理码文字后保存。onDone(kid) */
function bindAdminCodeInputs(root, onDone) {
  const save = text => {
    const r = nodeSetup(text);
    const msg = root.querySelector('.ncode-msg');
    if (r.err) { msg.textContent = r.err; msg.className = 'ncode-msg nbad'; return; }
    lsSet('km-node-remote-off', null);
    msg.textContent = ''; toast('已保存管理码（kid ' + r.kid + '）'); onDone(r.kid);
  };
  root.querySelectorAll('input[type=file]').forEach(inp => inp.onchange = async () => {
    const f = inp.files && inp.files[0]; inp.value = '';
    if (!f) return;
    const msg = root.querySelector('.ncode-msg'); msg.textContent = '正在识别…'; msg.className = 'ncode-msg hint';
    try {
      const text = await decodeQrFile(f);
      if (!text) { msg.textContent = '没认出二维码：请对准管理码，让它占画面一半以上，光线充足再拍一次'; msg.className = 'ncode-msg nbad'; return; }
      save(text);
    } catch (e) { msg.textContent = e.message; msg.className = 'ncode-msg nbad'; }
  });
  root.querySelector('.ncode-paste').onclick = () => { const b = root.querySelector('.ncode-box'); b.hidden = !b.hidden; if (!b.hidden) b.querySelector('textarea').focus(); };
  root.querySelector('.ncode-save').onclick = () => save(root.querySelector('.ncode-box textarea').value);
}

const adminCodeInputsHtml = () => `
  <div class="row">
    <label class="btn primary">扫描管理码<input type="file" accept="image/*" capture="environment" hidden></label>
    <label class="btn">从相册选图<input type="file" accept="image/*" hidden></label>
    <button class="ncode-paste">粘贴文字</button>
  </div>
  <div class="ncode-box form" hidden><textarea placeholder="kmadmin:1?h=…&amp;p=8787&amp;k=…" style="min-height:70px"></textarea>
    <div class="row"><button class="primary ncode-save">保存</button></div></div>
  <div class="ncode-msg"></div>`;

// ---------- 打开 App 时取一次状态，算标签红点 ----------
function nodeAlertOf(s, err) {
  if (err) return err.kind === 'down' || err.kind === 'denied';
  if (!s) return false;
  return s.days_left <= 14 || (s.disk_total && s.disk_free / s.disk_total < 0.1) || certBad(s);
}
/** 网页后台证书剩 < 48 小时（正常每 3–4 天自动续一次，始终剩 3 天以上；剩不到 2 天说明续期失败了）。1.0.0 的节点没有这一项。 */
const certBad = s => !!(s && s.tls && s.tls.not_after && s.tls.hours_left < 48);
function certText(t) {
  if (!t) return ['—（节点是 1.0.0，没有网页后台）', ''];
  if (!t.enabled) return [esc(t.err || '没有证书'), 'nwarn'];
  const h = t.hours_left;
  const left = h < 0 ? `已过期 ${fmtDays(-h * 3600)}` : `还剩 ${fmtDays(h * 3600)}`;
  return [`Let's Encrypt，${left}${h < 48 ? '（自动续期可能失败了，网页后台快打不开了；审批 App 和同步不受影响）' : '，自动续期'}`, h < 48 ? 'nbad' : ''];
}
async function nodeCheck() {
  const info = nodeInfo();
  if (!info.configured) { window.nodeAlert = false; return; }
  try { nodeState.status = await nodeCall('status'); nodeState.err = null; }
  catch (e) { nodeState.err = e; }
  window.nodeAlert = nodeAlertOf(nodeState.status, nodeState.err);
  if (!current && $('tabs') && !$('tabs').hidden) renderTabs();
}

// ---------- 页面 ----------
function renderNode() {
  const info = nodeInfo();
  if (!info.configured) {
    $('main').innerHTML = `<div class="card">
      <div style="font-weight:700;margin-bottom:6px">还没有设置同步节点</div>
      <div class="hint">节点是腾讯云服务器上的 km-sync 服务，给平板之间的同步做中转，上面只有看不懂的密文。<br>
        第一次使用：在电脑上打开 <code>knowledge-map-app/signing/sync-node-admin.png</code>，点下面「扫描管理码」用相机扫它（只需要一次）。</div>
      <div id="ncode">${adminCodeInputsHtml()}</div></div>`;
    bindAdminCodeInputs($('ncode'), () => { renderTabs(); renderNode(); nodeCheck(); });
    return;
  }
  $('main').innerHTML = `<div class="seg" id="nseg">${NODE_SUBS.map(([k, n]) => `<button data-s="${k}" class="${k === nodeState.sub ? 'on' : ''}">${n}</button>`).join('')}</div><div id="nbody"><div class="empty">加载中…</div></div>`;
  $('nseg').querySelectorAll('button').forEach(b => b.onclick = () => { nodeState.sub = b.dataset.s; renderNode(); });
  ({ status: nodeStatusView, groups: nodeGroupsView, invites: nodeInvitesView, access: nodeAccessView, log: nodeLogView, account: () => window.webAccountView() })[nodeState.sub]();
}
const nbody = html => { if ($('nbody')) $('nbody').innerHTML = html; return $('nbody'); };
const downCard = e => `<div class="card"><div class="nbad" style="font-weight:700">● 连不上同步节点</div><div style="margin-top:4px">${esc(e.message)}</div>
  ${e.kind === 'down' ? (KM_WEB ? '<div class="hint">网络断了，或服务器停了/到期了。</div>' : '<div class="hint">超时一般是腾讯云防火墙还没放行 TCP 8787，或服务器停了/到期了。</div>') : ''}
  <div class="row"><button id="nretry">重试</button></div></div>`;
function bindRetry(fn) { const b = $('nretry'); if (b) b.onclick = fn; }

async function nodeStatusView() {
  const info = nodeInfo();
  let s;
  try { s = nodeState.status = await nodeCall('status'); nodeState.err = null; }
  catch (e) { nodeState.err = e; window.nodeAlert = nodeAlertOf(null, e); renderTabs(); nbody(downCard(e)); return bindRetry(renderNode); }
  window.nodeAlert = nodeAlertOf(s, null); renderTabs();
  if (nodeState.sub !== 'status') return;
  const dl = s.days_left, dcls = dl <= 3 ? 'nbad' : dl <= 14 ? 'nwarn' : '';
  const dtext = dl < 0 ? `已过期 ${-dl} 天` : `还剩 ${dl} 天`;
  const lowDisk = s.disk_free / s.disk_total < 0.1;
  const [ctext, ccls] = certText(s.tls);
  const w = s.web;
  const wtext = !w ? '—' : !w.has_password ? '还没设置（在审批 App「限额与访问」里设密码）' : !w.enabled ? '已关闭'
    : `已打开 · 用户 ${esc(w.user)} · ${w.totp ? '已开二次验证' : '没开二次验证'} · ${w.sessions} 个会话${w.paused ? ' · <span class="nbad">失败过多，暂停中</span>' : ''}`;
  nbody(`
    <div class="card">
      <div class="nok" style="font-weight:700">● 在线</div>
      <div class="kv">
        <span>节点</span><b>${esc(info.host)}:${info.port}</b>
        <span>版本</span><b>km-sync ${esc(s.version)} · 已运行 ${fmtDays(s.uptime)}</b>
        <span>磁盘</span><b class="${lowDisk ? 'nbad' : ''}">剩 ${fmtBytes(s.disk_free)} / ${fmtBytes(s.disk_total)}</b>
        <span>同步组</span><b>${s.groups} / ${s.limits.max_groups} · 总占用 ${fmtBytes(s.bytes)}</b>
        <span>近 24 小时</span><b>${s.requests_24h.toLocaleString()} 次请求、${s.errors_24h.toLocaleString()} 次错误</b>
        <span>服务器到期</span><b class="${dcls}">${esc(s.expiry)}，${dtext}</b>
        <span>证书</span><b class="${ccls}">${ctext}</b>
        <span>网页后台</span><b>${s.tls && s.tls.enabled ? `<a href="https://${esc(s.host)}/" target="_blank" rel="noopener">https://${esc(s.host)}</a> · ` : ''}${wtext}</b>
        <span>外网管理</span><b>${s.remote_admin ? '允许' : '已关闭'}${s.allow_ips.length ? ` · 只允许 ${s.allow_ips.length} 个 IP/网段` : ''}</b>
        <span>${KM_WEB ? '本次登录' : '管理码'}</span><b>${KM_WEB ? '会话' : 'kid'} ${esc(KM_WEB ? String(info.kid).slice(0, 4) : info.kid)} · 你现在的 IP ${esc(s.your_ip)}</b>
      </div>
      ${s.breaker_until > Date.now() ? `<div class="nbad" style="margin-top:6px">外网管理因失败次数过多暂停到 ${when(s.breaker_until)}</div>` : ''}
      <div class="row"><button id="nexp">改到期日</button><button id="nrefresh">刷新</button></div>
      <div id="nexpbox" class="form" hidden><label for="nexpd">新的到期日（续费后改）</label><input id="nexpd" type="date" value="${esc(s.expiry)}">
        <div class="row"><button class="primary" id="nexps">保存到期日</button></div></div>
    </div>
    <div class="card hint">管理员在这里<b>能看到</b>：有几个同步组、每组几台设备、什么时候同步过、占多少空间、用哪张邀请码加入。
      <b>看不到</b>：任何学习内容、设备名字、哪一科有数据——节点上只有看不懂的密文和编号。</div>`);
  $('nrefresh').onclick = renderNode;
  $('nexp').onclick = () => { $('nexpbox').hidden = !$('nexpbox').hidden; };
  $('nexps').onclick = async () => {
    const d = $('nexpd').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return toast('请选一个日期');
    try { await nodeCall('expiry.set', { date: d }); toast('到期日已改为 ' + d); renderNode(); } catch (e) { toast(e.message, 4000); }
  };
}

async function nodeGroupsView() {
  let gs;
  try { gs = nodeState.groups = await nodeCall('groups.list'); }
  catch (e) { nbody(downCard(e)); return bindRetry(renderNode); }
  if (nodeState.sub !== 'groups') return;
  const live = gs.filter(g => !g.blocked_at).length;
  nbody(`<div class="hint" style="margin:4px 2px 8px">${live} 个在用${gs.length > live ? `，${gs.length - live} 个已封禁` : ''}。点一行看详情。</div>` +
    (gs.length ? gs.map(g => `<div class="card item ${g.blocked_at ? 'ngray' : ''}" data-g="${esc(g.gid)}">
      <div class="t">组 ${short(g.gid)}${g.note ? ` · ${esc(g.note)}` : g.invite_label ? ` · ${esc(g.invite_label)}` : ''}${g.blocked_at ? ' <span class="chip">已封禁</span>' : ''}</div>
      <div class="meta"><span>${g.devices.length} 台设备</span><span>${fmtBytes(g.bytes)} / ${fmtBytes(g.quota)}</span><span>${g.blocked_at ? '封禁于 ' + when(g.blocked_at) : agoMs(g.last_seen)}</span></div>
    </div>`).join('') : '<div class="empty">还没有同步组。平板扫邀请码加入后会出现在这里。</div>'));
  $('nbody').querySelectorAll('.item').forEach(el => el.onclick = () => renderGroup(el.dataset.g));
}

function renderGroup(gid) {
  const g = (nodeState.groups || []).find(x => x.gid === gid);
  if (!g) return renderNode();
  current = { number: -3 }; $('back').hidden = false; $('tabs').hidden = true; $('newReq').hidden = true;
  $('title').textContent = '组 ' + short(gid);
  const inv = g.invite ? `${esc(g.invite)}${g.invite_label ? `（${esc(g.invite_label)}）` : ''}` : '—';
  $('main').innerHTML = `
    <div class="card"><div class="kv">
      <span>组号</span><b style="word-break:break-all">${esc(g.gid)}</b>
      <span>状态</span><b class="${g.blocked_at ? 'nbad' : 'nok'}">${g.blocked_at ? '已封禁（' + when(g.blocked_at) + '）' : g.live ? '正常' : '正常（节点上暂时没有数据）'}</b>
      <span>创建</span><b>${g.created ? when(g.created) : '—'}</b>
      <span>最后访问</span><b>${agoMs(g.last_seen)}</b>
      <span>来源邀请码</span><b>${inv}</b>
      <span>上一代组号</span><b>${g.parent ? short(g.parent) : '—'}</b>
      <span>占用</span><b>${fmtBytes(g.bytes)} / ${fmtBytes(g.quota)}${g.quota_mb ? '' : '（默认）'}</b>
    </div></div>
    <div class="card"><div style="font-weight:700;margin-bottom:4px">设备（${g.devices.length}）</div>
      ${g.devices.length ? g.devices.map(d => `<div class="feed">设备 <b>${esc(d.dev)}</b> · 最后同步 ${agoMs(d.last_seen)} · 最后上传 ${agoMs(d.last_upload)} · ${d.sections} 个分区 · ${fmtBytes(d.bytes)}</div>`).join('')
        : '<div class="hint">没有设备记录</div>'}</div>
    <div class="card form">
      <label for="gnote">备注（最多 40 字）</label><input id="gnote" maxlength="40" value="${esc(g.note)}" placeholder="如：小明家">
      <label for="gquota">空间上限（MB，1–500，空着 = 默认）</label><input id="gquota" type="number" min="1" max="500" value="${g.quota_mb || ''}">
      <div class="row"><button class="primary" id="gsave">保存备注和上限</button></div></div>
    <div class="card"><div class="row">
      ${g.blocked_at ? '<button class="primary" id="gunblock">解除封禁</button>' : `<button id="gclear" ${g.live ? '' : 'disabled'}>清空数据</button><button class="danger" id="gremove">移除并封禁</button>`}
    </div></div>`;
  const done = async (p, okMsg) => { try { await p; toast(okMsg); nodeState.groups = await nodeCall('groups.list'); renderGroup(gid); } catch (e) { toast(e.message, 4000); } };
  $('gsave').onclick = () => {
    const note = $('gnote').value.trim(), q = $('gquota').value.trim();
    const mb = q === '' ? null : +q;
    if (mb !== null && !(Number.isInteger(mb) && mb >= 1 && mb <= 500)) return toast('空间上限要在 1–500 MB 之间');
    done(nodeCall('groups.setNote', { gid, note }).then(() => nodeCall('groups.setQuota', { gid, mb })), '已保存');
  };
  if ($('gclear')) $('gclear').onclick = () => confirm('清空后这个组的设备下次同步会自动重新上传，学习数据在设备上，不会丢。\n\n确定清空组 ' + short(gid) + ' 的数据？') && done(nodeCall('groups.clear', { gid }), '已清空');
  if ($('gremove')) $('gremove').onclick = () => confirm('移除后这个组的设备不能再用同步节点（家里局域网同步不受影响）。' +
    (g.invite ? `如果是陌生组，建议同时作废它用的邀请码 ${g.invite}。` : '') + '\n\n确定移除并封禁组 ' + short(gid) + '？') && done(nodeCall('groups.remove', { gid }), '已移除并封禁');
  if ($('gunblock')) $('gunblock').onclick = () => confirm('解除封禁后，这个组的设备下一轮会自动重建并重新上传。确定？') && done(nodeCall('groups.unblock', { gid }), '已解除封禁');
  window.scrollTo(0, 0);
}

const INV_STATE = { ok: ['有效', 'nok'], expired: ['已过期', 'nwarn'], used: ['已用完', 'nwarn'], revoked: ['已作废', 'nbad'] };
async function nodeInvitesView() {
  let list;
  try { list = nodeState.invites = await nodeCall('invites.list'); }
  catch (e) { nbody(downCard(e)); return bindRetry(renderNode); }
  if (nodeState.sub !== 'invites') return;
  const opt = (vals, sel, unit) => vals.map(v => `<option value="${v}" ${v === sel ? 'selected' : ''}>${v} ${unit}</option>`).join('');
  nbody(`<div class="card form">
      <div style="font-weight:700">生成邀请码</div>
      <div class="hint">平板在「设备同步」里扫邀请码加入同步节点（知识图谱 App 的同步功能上线后可用）。</div>
      <label for="ilabel">备注（最多 20 字，如孩子的名字）</label><input id="ilabel" maxlength="20" placeholder="小明">
      <div class="nform2">
        <div><label for="idays">有效期</label><select id="idays">${opt([1, 7, 30], 7, '天')}</select></div>
        <div><label for="iuses">可用次数</label><select id="iuses">${opt([1, 3, 10], 1, '次')}</select></div>
      </div>
      <div class="row"><button class="primary" id="icreate">生成</button></div></div>` +
    (list.length ? list.map(i => `<div class="card">
      <div class="t">${esc(i.label || '（无备注）')} <span class="chip ${INV_STATE[i.state][1]}">${INV_STATE[i.state][0]}</span></div>
      <div class="meta"><span>邀请号 ${esc(i.id)}</span><span>已用 ${i.used}/${i.max_uses}</span><span>建了 ${i.groups} 个组</span>
        <span>${i.state === 'revoked' ? '作废于 ' + when(i.revoked_at) : '到期 ' + when(i.expires)}</span></div>
      <div class="row"><button data-qr="${esc(i.id)}">显示二维码</button>${i.state !== 'revoked' ? `<button class="danger" data-rv="${esc(i.id)}">作废</button>` : ''}</div>
    </div>`).join('') : '<div class="empty">还没有邀请码</div>'));
  $('icreate').onclick = async () => {
    const label = $('ilabel').value.trim();
    if (label.length > 20) return toast('备注最多 20 个字');
    $('icreate').disabled = true;
    try {
      const r = await nodeCall('invites.create', { label, days: +$('idays').value, uses: +$('iuses').value });
      await showQr(r.qr, `邀请码 ${r.id}${label ? ' · ' + label : ''}`, `到期 ${when(r.expires)}，可用 ${$('iuses').value} 次`);
      renderNode();
    } catch (e) { toast(e.message, 4000); if ($('icreate')) $('icreate').disabled = false; }
  };
  $('nbody').querySelectorAll('[data-qr]').forEach(b => b.onclick = () => {
    const i = list.find(x => x.id === b.dataset.qr);
    showQr(i.qr, `邀请码 ${i.id}${i.label ? ' · ' + i.label : ''}`, `${INV_STATE[i.state][0]} · 已用 ${i.used}/${i.max_uses} · 到期 ${when(i.expires)}`);
  });
  $('nbody').querySelectorAll('[data-rv]').forEach(b => b.onclick = async () => {
    const i = list.find(x => x.id === b.dataset.rv);
    if (!confirm(`作废邀请码 ${i.id}${i.label ? '（' + i.label + '）' : ''}？\n作废后不能再用它建新组，也不能再凭它重建（已在用的组不受影响；要停掉就再移除组）。`)) return;
    try { await nodeCall('invites.revoke', { id: i.id }); toast('已作废'); renderNode(); } catch (e) { toast(e.message, 4000); }
  });
}

/** 全屏显示二维码（画在 canvas#qrCanvas 上，jsQR 能解回原文）。 */
async function showQr(text, title, sub) {
  await loadScript('vendor/qrcode.js');
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount(), quiet = 4, cell = Math.max(4, Math.floor(480 / (n + quiet * 2)));
  const ov = document.createElement('div'); ov.className = 'nmodal';
  ov.innerHTML = `<div class="nmodal-in"><div style="font-weight:700">${esc(title)}</div><div class="hint">${esc(sub || '')}</div>
    <canvas id="qrCanvas" width="${(n + quiet * 2) * cell}" height="${(n + quiet * 2) * cell}"></canvas>
    <textarea readonly id="qrText">${esc(text)}</textarea>
    <div class="row"><button id="qrCopy">复制文字</button><button class="primary" id="qrClose">关闭</button></div></div>`;
  document.body.appendChild(ov);
  const g = $('qrCanvas').getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, $('qrCanvas').width, $('qrCanvas').height); g.fillStyle = '#000';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
  $('qrClose').onclick = () => ov.remove();
  $('qrCopy').onclick = async () => {
    try { await navigator.clipboard.writeText(text); toast('已复制'); }
    catch (e) { const t = $('qrText'); t.select(); try { document.execCommand('copy'); toast('已复制'); } catch (e2) { toast('请长按文字手动复制'); } }
  };
}

async function nodeAccessView() {
  let s;
  try { s = nodeState.status = await nodeCall('status'); }
  catch (e) { nbody(downCard(e)); return bindRetry(renderNode); }
  if (nodeState.sub !== 'access') return;
  const L = s.limits;
  const f = (id, label, v, lo, hi) => `<div><label for="${id}">${label}（${lo}–${hi}）</label><input id="${id}" type="number" min="${lo}" max="${hi}" value="${v}"></div>`;
  nbody(`<div class="card form"><div style="font-weight:700">限额</div>
      <div class="nform2">
        ${f('lmg', '最多组数', L.max_groups, 1, 200)}${f('lgm', '每组默认空间 MB', L.group_mb, 1, 500)}
        ${f('lsm', '单分区 MB', L.sec_mb, 1, 16)}${f('lrm', '单请求 MB', L.req_mb, 1, 32)}
        ${f('lir', '每 IP 每 10 分钟次数', L.ip_rate, 60, 10000)}
      </div>
      <div class="row"><button class="primary" id="lsave">保存限额</button></div></div>
    <div class="card form"><div style="font-weight:700">管理访问</div>
      <label class="ncheck"><input type="checkbox" id="aremote" ${s.remote_admin ? 'checked' : ''} ${KM_WEB ? 'disabled' : ''}> 允许外网管理（关掉后只能在电脑上经 SSH 隧道管理，手机就管不了了）</label>
      ${KM_WEB ? '<div class="hint">这个开关只能在审批 App 里改（网页上关掉会把自己和 App 一起关在外面）。</div>' : ''}
      <label for="aips">只允许这些 IP / 网段（每行一个，如 117.30.0.0/16；空着 = 不限）</label>
      <textarea id="aips" style="min-height:90px" placeholder="空着 = 不限（手机网络 IP 经常变，一般不用填）">${esc(s.allow_ips.join('\n'))}</textarea>
      <div class="hint">你现在的 IP：<b>${esc(s.your_ip)}</b>。名单里不包含它时不能保存，免得把自己锁在外面。</div>
      <div class="row"><button class="primary" id="asave">保存访问设置</button></div></div>
    ${KM_WEB ? '' : '<div id="webbox"></div>'}`);
  if (!KM_WEB) renderWebLogin($('webbox'), s);
  $('lsave').onclick = async () => {
    const v = { max_groups: +$('lmg').value, group_mb: +$('lgm').value, sec_mb: +$('lsm').value, req_mb: +$('lrm').value, ip_rate: +$('lir').value };
    const R = { max_groups: [1, 200, '最多组数'], group_mb: [1, 500, '每组默认空间'], sec_mb: [1, 16, '单分区'], req_mb: [1, 32, '单请求'], ip_rate: [60, 10000, '每 IP 次数'] };
    for (const k in R) if (!(Number.isInteger(v[k]) && v[k] >= R[k][0] && v[k] <= R[k][1])) return toast(`${R[k][2]}要在 ${R[k][0]}–${R[k][1]} 之间`);
    if (v.sec_mb > v.req_mb) return toast('单分区不能大于单请求');
    try { await nodeCall('limits.set', v); toast('限额已保存'); } catch (e) { toast(e.message, 4000); }
  };
  $('asave').onclick = async () => {
    const remote = $('aremote').checked, ips = $('aips').value.split(/\s*\n\s*/).map(x => x.trim()).filter(Boolean);
    if (!remote && !confirm('关闭外网管理后，手机上的「节点」页就用不了了，只能在电脑上经 SSH 隧道管理；\n要恢复，在电脑上运行 deploy.ps1 -ResetAdminAccess。\n\n确定关闭？')) return;
    try {
      await nodeCall('access.set', { remote, ips });
      lsSet('km-node-remote-off', remote || s.your_ip === '127.0.0.1' ? null : '1');
      toast('访问设置已保存'); renderNode();
    } catch (e) { toast(e.message, 5000); }
  };
}

async function nodeLogView(more) {
  const sec = nodeState.logSec;
  let page;
  try { page = await nodeCall('log.list', { limit: 50, sec, before: more ? nodeState.log.items[nodeState.log.items.length - 1].id : undefined }); }
  catch (e) { nbody(downCard(e)); return bindRetry(renderNode); }
  if (nodeState.sub !== 'log') return;
  nodeState.log = more ? { items: nodeState.log.items.concat(page.items), more: page.more } : page;
  const L = nodeState.log;
  nbody(`<div class="card">
      <label class="ncheck"><input type="checkbox" id="lsec" ${sec ? 'checked' : ''}> 只看安全事件（认证失败、封 IP、熔断）</label>
      <div id="loglist">${L.items.length ? L.items.map(i => `<div class="feed ${i.sec ? 'nsec' : ''}">
        <span class="hint">${when(i.t)}</span> <b>${esc(i.who)}</b> ${esc(i.op)}${i.obj ? ' · ' + esc(i.obj) : ''}
        <span class="${i.result === '成功' ? 'nok' : 'nbad'}">${esc(i.result)}</span>${i.note ? ` <span class="hint">${esc(i.note)}</span>` : ''}${i.ip ? ` <span class="hint">IP ${esc(i.ip)}</span>` : ''}
      </div>`).join('') : '<div class="hint">没有记录</div>'}</div>
      ${L.more ? '<div class="row"><button id="lmore">更多</button></div>' : ''}</div>`);
  $('lsec').onchange = () => { nodeState.logSec = $('lsec').checked; nodeLogView(); };
  if ($('lmore')) $('lmore').onclick = () => nodeLogView(true);
}

// ---------- 网页登录（只在审批 App 里：管理密钥是总钥匙，网页密码在这里设） ----------
/** 前端的密码强度提示（和节点 pw_problem 同样的规则；最终以节点检查为准）。返回问题说明或 null。 */
function pwHint(pw, user, host) {
  if (pw.length < 12) return `还差 ${12 - pw.length} 个字符（至少 12 个）`;
  if (pw.length > 128) return '最多 128 个字符';
  const low = pw.toLowerCase();
  for (const [bad, name] of [[user, '用户名'], ['admin', '「admin」'], ['kmsync', '「kmsync」'], [host, '服务器地址']]) {
    if (bad && low.includes(String(bad).toLowerCase())) return `不能包含${name}`;
  }
  if (new Set(low).size <= 3 || /^(.{1,6})\1+$/.test(low) || /^[0-9!-\/:-@\[-`{-~\s]*$/.test(low)) return '太简单了';
  return null;
}

async function renderWebLogin(box, s) {
  if (!box) return;
  const w = s.web;
  if (!w) { box.innerHTML = '<div class="card hint">网页后台要节点 1.1.0 以上（现在是 ' + esc(s.version) + '）。</div>'; return; }
  let sess = [];
  try { sess = await nodeCall('web.sessions'); } catch (e) { /* 列表拿不到就空着 */ }
  if (!$('webbox')) return;
  const url = `https://${s.host}`;
  const live = sess.filter(x => x.alive);
  box.innerHTML = `<div class="card form"><div style="font-weight:700">网页登录</div>
      <div class="hint">电脑浏览器打开 <b>${esc(url)}</b>，用这里设的用户名和密码登录，能做的事和这个「节点」页一样（同样看不到学习内容）。
        网页不能改外网管理开关、不能改这里的设置；网页密码泄露了，在这里「全部踢下线」再重新设密码。</div>
      <div class="kv">
        <span>状态</span><b class="${w.enabled ? 'nok' : ''}">${!w.has_password ? '还没设置（设好密码后自动打开）' : w.enabled ? '已打开' : '已关闭'}${w.paused ? ' · <span class="nbad">失败过多，网页登录暂停 1 小时</span>' : ''}</b>
        <span>用户名</span><b>${w.has_password ? esc(w.user) : '—'}</b>
        <span>二次验证</span><b>${w.totp ? '已开（登录要输手机验证器上的 6 位码）' : '没开（建议在网页「账号安全」里开）'}</b>
        <span>密码设置于</span><b>${w.pw_changed ? when(w.pw_changed) : '—'}</b>
      </div>
      ${w.has_password ? `<label class="ncheck"><input type="checkbox" id="wen" ${w.enabled ? 'checked' : ''}> 允许网页登录</label>` : ''}
      <label for="wuser">用户名（3–32 位字母或数字）</label><input id="wuser" maxlength="32" value="${esc(w.user || 'admin')}" autocomplete="off">
      <label for="wpw">${w.has_password ? '新密码' : '密码'}（至少 12 个字符；不要和别的网站共用）</label><input id="wpw" type="password" maxlength="128" autocomplete="new-password">
      <label for="wpw2">再输一次</label><input id="wpw2" type="password" maxlength="128" autocomplete="new-password">
      <div class="hint" id="wpwhint">长一点比复杂更安全，比如几个不相关的词加数字。</div>
      <div class="row"><button class="primary" id="wset">${w.has_password ? '重新设置密码' : '设置密码并打开网页登录'}</button>
        ${w.totp ? '<button id="wtotp">关闭二次验证</button>' : ''}</div>
    </div>
    <div class="card"><div style="font-weight:700;margin-bottom:4px">网页会话（${live.length}）</div>
      ${live.length ? live.map(x => `<div class="feed">会话 <b>${esc(x.kid.slice(0, 4))}</b> · ${esc(x.ip)} · 登录 ${when(x.created)} · 最后使用 ${ago(x.last_used)}
          <div class="hint" style="word-break:break-all">${esc(x.ua || '')}</div>
          <div class="row"><button class="danger" data-wk="${esc(x.kid)}">踢下线</button></div></div>`).join('')
        : '<div class="hint">没有人登录着</div>'}
      <div class="row">${live.length ? '<button class="danger" id="wall">全部踢下线</button>' : ''}${w.has_password ? '<button class="danger" id="wreset">重置网页登录</button>' : ''}</div>
    </div>`;
  const hint = () => {
    const pw = $('wpw').value, h = pwHint(pw, $('wuser').value.trim(), s.host);
    $('wpwhint').textContent = !pw ? '长一点比复杂更安全，比如几个不相关的词加数字。' : h ? '✗ ' + h : $('wpw2').value && $('wpw2').value !== pw ? '✗ 两次输入不一样' : '✓ 可以用';
    $('wpwhint').className = 'hint ' + (!pw ? '' : h || ($('wpw2').value && $('wpw2').value !== pw) ? 'nbad' : 'nok');
  };
  $('wpw').oninput = $('wpw2').oninput = $('wuser').oninput = hint;
  const reload = () => renderNode();
  $('wset').onclick = async () => {
    const user = $('wuser').value.trim(), pw = $('wpw').value;
    if (!/^[A-Za-z0-9]{3,32}$/.test(user)) return toast('用户名要 3–32 位字母或数字');
    const h = pwHint(pw, user, s.host); if (h) return toast('密码' + h);
    if (pw !== $('wpw2').value) return toast('两次输入的密码不一样');
    if (w.has_password && !confirm('重新设置密码后，所有网页上登录着的会话都会被踢下线。确定？')) return;
    try { await nodeCall('web.setPassword', { user, pw }); $('wpw').value = $('wpw2').value = ''; toast(`已设置，电脑上打开 ${url} 登录`, 4000); reload(); }
    catch (e) { toast(e.message, 5000); }
  };
  if ($('wen')) $('wen').onchange = async () => {
    const on = $('wen').checked;
    if (!on && !confirm('关闭后网页后台不能登录，已登录的网页会被踢下线。确定？')) { $('wen').checked = true; return; }
    try { await nodeCall('web.setEnabled', { enabled: on }); toast(on ? '已打开网页登录' : '已关闭网页登录'); reload(); } catch (e) { toast(e.message, 4000); reload(); }
  };
  if ($('wtotp')) $('wtotp').onclick = async () => {
    if (!confirm('关闭二次验证后，网页登录只要用户名和密码。手机丢了、验证器没了时用。确定？')) return;
    try { await nodeCall('web.totpReset'); toast('已关闭二次验证'); reload(); } catch (e) { toast(e.message, 4000); }
  };
  box.querySelectorAll('[data-wk]').forEach(b => b.onclick = async () => {
    if (!confirm(`把会话 ${b.dataset.wk.slice(0, 4)} 踢下线？那台电脑上的网页会回到登录页。`)) return;
    try { await nodeCall('web.revoke', { kid: b.dataset.wk }); toast('已踢下线'); reload(); } catch (e) { toast(e.message, 4000); }
  });
  if ($('wall')) $('wall').onclick = async () => {
    if (!confirm('把所有网页会话都踢下线？')) return;
    try { await nodeCall('web.revoke', { all: true }); toast('已全部踢下线'); reload(); } catch (e) { toast(e.message, 4000); }
  };
  if ($('wreset')) $('wreset').onclick = async () => {
    if (!confirm('清空网页的用户名、密码和二次验证，踢掉所有会话，网页登录关闭。之后要在这里重新设密码才能登录。确定？')) return;
    try { await nodeCall('web.reset'); toast('已重置网页登录'); reload(); } catch (e) { toast(e.message, 4000); }
  };
}

// ---------- 设置页里的「同步节点」一块 ----------
function renderNodeSettings(box) {
  const info = nodeInfo();
  box.innerHTML = `<div class="card"><div style="font-weight:700;margin-bottom:4px">同步节点</div>
    ${info.configured ? `<div>地址 <b>${esc(info.host)}:${info.port}</b> · 管理码 kid <b>${esc(info.kid)}</b></div>
      <div class="hint">管理密钥用系统密钥库加密存在本机，网页拿不到。换过管理密钥（deploy.ps1 -NewAdminKey）后请重新扫码。</div>
      <div class="row"><button id="nrescan">重新扫码</button><button class="danger" id="nclear">清除</button></div><div id="ncode2" hidden>${adminCodeInputsHtml()}</div>`
      : `<div class="hint">还没设置。在电脑上打开 <code>knowledge-map-app/signing/sync-node-admin.png</code>，用下面的按钮扫一次。</div><div id="ncode2">${adminCodeInputsHtml()}</div>`}
  </div>`;
  bindAdminCodeInputs($('ncode2'), () => { renderNodeSettings(box); nodeCheck(); });
  if ($('nrescan')) $('nrescan').onclick = () => { $('ncode2').hidden = !$('ncode2').hidden; };
  if ($('nclear')) $('nclear').onclick = () => {
    if (!confirm('清除本机保存的管理码？清除后要重新扫码才能管理节点（节点本身不受影响）。')) return;
    if (MOCK) window.__mockNodeInfo = { configured: false }; else Native.nodeClear();
    lsSet('km-node-remote-off', null); window.nodeAlert = false; renderNodeSettings(box);
  };
}

// ---------- 浏览器预览用假数据 ----------
function mockNodeInfo() {
  if (!window.__mockNodeInfo) window.__mockNodeInfo = NODE_MOCK === 'none' ? { configured: false } : { configured: true, host: '43.142.41.27', port: 8787, kid: 'c0ffee42' };
  return window.__mockNodeInfo;
}
function mockNode(op, a) {
  if (NODE_MOCK === 'down') return [0, '超时（可能 8787 端口没开放，或服务器停了）'];
  const now = Date.now(), H = 3600e3, D = 86400e3;
  const m = window.__mockNodeData = window.__mockNodeData || {
    expiry: '2026-11-16', remote: true, ips: [], limits: { max_groups: 30, group_mb: 50, sec_mb: 4, req_mb: 8, ip_rate: 600 },
    groups: [
      { gid: 'a1b2c3d4e5f60718293a4b5c6d7e8f90', live: true, bytes: 1258291, created: now - 20 * D, last_seen: now - 10 * 60e3, invite: 'k7m2p9qa', invite_label: '小明', parent: null, blocked_at: null, note: '', quota_mb: null,
        devices: [{ dev: 'Xa91fe', last_seen: now - 10 * 60e3, last_upload: now - 12 * 60e3, sections: 22, bytes: 640000 }, { dev: 'b03c7d', last_seen: now - 2 * H, last_upload: now - 3 * H, sections: 22, bytes: 610000 }, { dev: 'f4e1aa', last_seen: now - 3 * D, last_upload: now - 3 * D, sections: 21, bytes: 8291 }] },
      { gid: '77c0ffee1234567890abcdef12345678', live: true, bytes: 41943040, created: now - 2 * D, last_seen: now - 5 * H, invite: 'x3vq8n2b', invite_label: '初始', parent: null, blocked_at: null, note: '', quota_mb: 60,
        devices: [{ dev: 'zz0912', last_seen: now - 5 * H, last_upload: now - 5 * H, sections: 3, bytes: 41943040 }] },
      { gid: '0badbad0aaaa5555bbbb6666cccc7777', live: false, bytes: 0, created: now - 9 * D, last_seen: null, invite: 'x3vq8n2b', invite_label: '初始', parent: null, blocked_at: now - 8 * D, note: '陌生组', quota_mb: null, devices: [] },
    ],
    invites: [
      { id: 'k7m2p9qa', label: '小明', created: now - 20 * D, expires: now + 10 * D, max_uses: 3, used: 1, revoked_at: null, groups: 1 },
      { id: 'x3vq8n2b', label: '初始', created: now - 40 * D, expires: now - 10 * D, max_uses: 10, used: 2, revoked_at: null, groups: 2 },
      { id: 'q9w8e7r6', label: '发错了', created: now - 5 * D, expires: now + 2 * D, max_uses: 1, used: 0, revoked_at: now - 4 * D, groups: 0 },
    ],
    log: [],
    tlsLeft: NODE_MOCK === 'cert' ? 30 : null,     // ?mock&node=cert：预览证书快过期（续期失败）
    web: { user: 'boss', has_password: true, enabled: true, totp: false, pw_changed: now - 3 * D, paused: false },
    sessions: [
      { kid: '5e1f0a2b', user: 'boss', created: now - 2 * H, last_used: now - 4 * 60e3, expires: now + 26 * 60e3, ip: '117.30.12.8', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/141.0 Safari/537.36', alive: true, current: false },
      { kid: '9a7b3c4d', user: 'boss', created: now - 5 * D, last_used: now - 5 * D, expires: now - 5 * D + 30 * 60e3, ip: '117.30.12.8', ua: 'Edge', alive: false, current: false },
    ],
  };
  if (!m.log.length) {
    const L = (t, who, ip, op, obj, result, note, sec) => m.log.push({ id: m.log.length + 1, t, who, ip, op, obj, result, note, sec: sec ? 1 : 0 });
    L(now - 40 * D, '系统', '', 'start', '1.0.0', '成功', '服务启动');
    L(now - 40 * D, '系统', '', 'invites.create', 'x3vq8n2b', '成功', '部署时生成初始邀请码（30 天 10 次）');
    L(now - 20 * D, '管理员 c0ffee42', '117.30.12.8', 'invites.create', 'k7m2p9qa', '成功', '生成邀请码「小明」30 天 3 次');
    L(now - 20 * D, '设备', '', 'invite.use', 'k7m2p9qa / a1b2c3', '成功', '新建组');
    L(now - 9 * D, '设备', '', 'invite.use', 'x3vq8n2b / 0badba', '成功', '新建组');
    L(now - 8 * D, '管理员 c0ffee42', '117.30.12.8', 'groups.remove', '0badba', '成功', '移除并封禁');
    for (let i = 0; i < 6; i++) L(now - 3 * D + i * 60e3, '?', '45.155.205.' + (10 + i), 'auth', '', '拒绝', 'kid 不对', true);
    L(now - 3 * D + 6 * 60e3, '系统', '45.155.205.12', 'ban', '45.155.205.12', '成功', '10 分钟内认证失败 5 次，封禁这个 IP 1 小时', true);
    L(now - 3 * D + 7 * 60e3, '系统', '45.155.205.15', 'breaker', '管理接口', '成功', '1 小时内认证失败合计 30 次，外网管理暂停 1 小时', true);
    for (let i = 0; i < 60; i++) L(now - 2 * D + i * H / 2, '管理员 c0ffee42', '117.30.12.8', 'groups.setNote', 'a1b2c3', '成功', `备注改为「测试 ${i}」`);
    L(now - 5 * 60e3, '设备', '', 'invite.use', 'x3vq8n2b / 0badba', '拒绝', '组已封禁');
  }
  const ok = data => [200, JSON.stringify({ ok: true, data })];
  const fail = msg => [200, JSON.stringify({ ok: false, err: 'bad', msg })];
  const log = (op, obj, result, note) => m.log.push({ id: m.log.length + 1, t: Date.now(), who: '管理员 c0ffee42', ip: '192.168.1.5', op, obj, result, note, sec: 0 });
  const g = a.gid && m.groups.find(x => x.gid === a.gid);
  const stateOfInv = i => i.revoked_at ? 'revoked' : i.expires < now ? 'expired' : i.used >= i.max_uses ? 'used' : 'ok';
  const qrOf = i => `kmnode:1?h=43.142.41.27&p=8787&i=${i.id}&s=MOCKMOCKMOCKMOCKMOCKMOCKMOCKMOCK`;
  switch (op) {
    case 'status': {
      const exp = new Date(m.expiry + 'T00:00:00+08:00'), today = new Date(new Date(now + 8 * H).toISOString().slice(0, 10) + 'T00:00:00+08:00');
      const tlsLeft = m.tlsLeft != null ? m.tlsLeft : 101.5;
      return ok({ version: '1.1.0', proto: 1, started: now - 31 * D, uptime: 31 * 86400 + 3600, now, disk_total: 42140479488, disk_free: 35540000000,
        node_db: 45000000, admin_db: 81920, groups: m.groups.filter(x => x.live).length, bytes: m.groups.reduce((s, x) => s + x.bytes, 0),
        requests_24h: 1204, errors_24h: 0, expiry: m.expiry, days_left: Math.round((exp - today) / D), limits: m.limits,
        remote_admin: m.remote, allow_ips: m.ips, breaker_until: 0, your_ip: '192.168.1.5', host: '43.142.41.27', port: 8787,
        tls: { enabled: true, not_after: now + tlsLeft * H, hours_left: tlsLeft, issuer: "C=US, O=Let's Encrypt, CN=YE1", err: null },
        web: { ...m.web, user: m.web.has_password ? m.web.user : '', sessions: m.sessions.filter(x => x.alive).length, url: 'https://43.142.41.27' } });
    }
    case 'web.status': return ok({ ...m.web, sessions: m.sessions.filter(x => x.alive).length });
    case 'web.sessions': return ok(m.sessions);
    case 'web.setPassword': {
      if (!/^[A-Za-z0-9]{3,32}$/.test(a.user || '')) return fail('用户名要 3–32 位字母或数字');
      const h = pwHint(a.pw || '', a.user, '43.142.41.27'); if (h) { log(op, a.user, '失败', '密码' + h); return fail('密码' + h); }
      Object.assign(m.web, { user: a.user, has_password: true, enabled: true, pw_changed: Date.now(), paused: false });
      const n = m.sessions.length; m.sessions = []; log(op, a.user, '成功', `设置网页用户名和密码（用户名 ${a.user}），网页登录打开` + (n ? `，${n} 个网页会话已失效` : ''));
      return ok(m.web);
    }
    case 'web.setEnabled': m.web.enabled = a.enabled; if (!a.enabled) m.sessions = []; log(op, '网页登录', '成功', a.enabled ? '打开网页登录' : '关闭网页登录'); return ok(m.web);
    case 'web.totpReset': if (!m.web.totp) return fail('二次验证本来就没开'); m.web.totp = false; log(op, '二次验证', '成功', '在审批 App 里关闭网页二次验证'); return ok(m.web);
    case 'web.reset': Object.assign(m.web, { user: '', has_password: false, enabled: false, totp: false, pw_changed: null }); m.sessions = []; log(op, '网页登录', '成功', '清空网页用户名、密码和二次验证'); return ok(m.web);
    case 'web.revoke': {
      if (a.all) { const n = m.sessions.length; m.sessions = []; log(op, '全部会话', '成功', `踢掉全部网页会话（${n} 个）`); return ok({ removed: n }); }
      const i = m.sessions.findIndex(x => x.kid === a.kid); if (i < 0) return fail('没有这个会话（可能已经过期或退出）');
      m.sessions.splice(i, 1); log(op, a.kid.slice(0, 4), '成功', '踢下线'); return ok({ removed: 1 });
    }
    case 'groups.list': return ok(m.groups.map(x => ({ ...x, quota: (x.quota_mb || m.limits.group_mb) * 1048576 })));
    case 'groups.clear': if (!g || !g.live) return fail('这个组在节点上没有数据'); g.bytes = 0; g.devices.forEach(d => { d.sections = 0; d.bytes = 0; }); log(op, short(g.gid), '成功', '清空数据'); return ok({});
    case 'groups.remove': if (!g || g.blocked_at) return fail('这个组已经被移除了'); g.blocked_at = Date.now(); g.live = false; g.bytes = 0; g.devices = []; log(op, short(g.gid), '成功', '移除并封禁'); return ok({});
    case 'groups.unblock': if (!g || !g.blocked_at) return fail('这个组没有被封禁'); g.blocked_at = null; log(op, short(g.gid), '成功', '解除封禁'); return ok({});
    case 'groups.setNote': if (!g) return fail('没有这个组'); if ((a.note || '').length > 40) return fail('备注最多 40 个字'); g.note = a.note; log(op, short(g.gid), '成功', `备注改为「${a.note}」`); return ok({});
    case 'groups.setQuota': if (!g) return fail('没有这个组'); g.quota_mb = a.mb; log(op, short(g.gid), '成功', a.mb ? `空间上限改为 ${a.mb} MB` : '空间上限改为默认'); return ok({});
    case 'invites.create': {
      if ((a.label || '').length > 20) return fail('备注最多 20 个字');
      const id = Array.from({ length: 8 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('');
      const i = { id, label: a.label || '', created: Date.now(), expires: Date.now() + a.days * D, max_uses: a.uses, used: 0, revoked_at: null, groups: 0 };
      m.invites.unshift(i); log(op, id, '成功', `生成邀请码「${i.label}」${a.days} 天 ${a.uses} 次`);
      return ok({ id, qr: qrOf(i), expires: i.expires });
    }
    case 'invites.list': return ok(m.invites.map(i => ({ ...i, state: stateOfInv(i), qr: qrOf(i) })));
    case 'invites.revoke': { const i = m.invites.find(x => x.id === a.id); if (!i || i.revoked_at) { log(op, a.id, '失败', '这张邀请码已经作废了'); return fail('这张邀请码已经作废了'); } i.revoked_at = Date.now(); log(op, i.id, '成功', '作废邀请码'); return ok({}); }
    case 'limits.set': Object.assign(m.limits, a); log(op, '限额', '成功', JSON.stringify(a)); return ok(m.limits);
    case 'expiry.set': m.expiry = a.date; log(op, '到期日', '成功', '改为 ' + a.date); return ok({});
    case 'access.set': {
      const badIp = a.ips.find(n => !/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(n) || n.split('/')[0].split('.').some(x => +x > 255) || (n.includes('/') && +n.split('/')[1] > 32));
      if (badIp) { log(op, '访问', '失败', `「${badIp}」不是 IP 或网段`); return fail(`「${badIp}」不是 IP 或网段`); }
      const inList = a.ips.some(n => n === '192.168.1.5' || (n.endsWith('/16') && '192.168.1.5'.startsWith(n.split('.').slice(0, 2).join('.') + '.')) || (n.endsWith('/24') && '192.168.1.5'.startsWith(n.split('.').slice(0, 3).join('.') + '.')));
      if (a.ips.length && !inList) { log(op, '访问', '失败', '名单里没有当前 IP'); return [200, JSON.stringify({ ok: false, err: 'self', msg: '名单里没有你现在的 IP 192.168.1.5，保存后你会被锁在外面' })]; }
      m.remote = a.remote; m.ips = a.ips; log(op, '访问', '成功', a.remote ? '外网管理开' : '外网管理关'); return ok({ remote: a.remote, ips: a.ips });
    }
    case 'log.list': {
      let items = m.log.slice().reverse();
      if (a.sec) items = items.filter(i => i.sec);
      if (a.before) items = items.filter(i => i.id < a.before);
      return ok({ items: items.slice(0, a.limit || 50), more: items.length > (a.limit || 50) });
    }
  }
  return fail('没有这个操作');
}


