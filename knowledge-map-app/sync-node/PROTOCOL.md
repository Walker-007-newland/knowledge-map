# km-sync 节点协议 v1

本文是 #1 产品方案 v2 第七节 + #6 产品方案第三节补充的实现说明，`km_sync_node.py` 按它实现，
#1 第二期的 Java 客户端也按它写。参考客户端是 `test_node.py` 里的 `DevClient`（设备）和 `AdminClient`（管理）。
第 7 节是 1.4.0 的账号（#12），参考客户端是 `test_node.py` 的 `AcctClient`。

节点只是一个「永远在线、只会保管不会合并」的组员：每台设备一个**槽**，槽里是这台设备各分区最新的**密文**。
节点看不懂内容，也不知道分区名（分区编号是设备算的 HMAC）。

## 1. 传输与编码

- HTTP/1.1，明文，端口 8787（网页后台另有 443 / 80 / 127.0.0.1:8788，见第 6 节）。请求和响应都是 JSON（UTF-8），POST 必须带 `Content-Length`。
- 所有二进制字段用 **base64url、不带 `=` 填充**（下文写作 `b64(x)`）。
- `‖` 表示字节串直接拼接；字符串按 UTF-8 / ASCII 取字节。`HMAC` 都是 HMAC-SHA256。
- 组号 `gid`：32 个小写十六进制字符（设备从组密钥 HKDF 派生的 16 字节，写成 hex）。节点只当它是不透明的字符串。
- 设备号 `dev`：`[A-Za-z0-9_-]{1,64}`。分区编号 `sec`、内容编号 `cid`：`[A-Za-z0-9_-]{1,64}` / `{0,64}`。

## 2. 错误码

| 状态 | 正文 | 含义，设备该怎么做 |
|---|---|---|
| 400 | `{"err":"bad"}` | 请求格式不对（程序错误） |
| 401 | `{"err":"auth"}` | 签名错、计数重复或变小 |
| 403 | `{"err":"blocked"}` | 组已被管理员封禁（1.3.0 起也包括管理员「彻底删除登记」的组号，永久）。平板提示「同步节点拒绝了这个同步组」，停止使用节点 |
| 403 | `{"err":"invite"}` | 邀请码无效 / 过期 / 用完 / 作废 / 没带。提示「邀请码已失效，请向管理员要新的」 |
| 403 | `{"err":"replaced"}` | （1.2.0 起）`create` 的组号已经换钥（有过 `successor`），旧组被删后不许用邀请码重建。设备提示「这台设备的同步组已经换了钥匙……可能已被移出」，不再重试 |
| 404 | `{"err":"nogroup"}` | 组不存在（节点数据丢了）→ 用保存的邀请码 `create` 重建，然后 `since=0` 重新拉、全部重推 |
| 404 | `{"err":"path"}` | 没有这个接口 |
| 409 | `{"err":"exists"}` | gid 已被别的 nodeKey 占用（几乎不可能，换 gid） |
| 411 | `{"err":"length"}` | 缺 Content-Length |
| 413 | `{"err":"size"}` | 单个分区 / 单个请求 / 信件 / 转交点超过上限 |
| 413 | `{"err":"quota"}` | 组空间超限（整次请求都没写入） |
| 413 | `{"err":"groups"}` | 节点组数已满 |
| 429 | `{"err":"rate"}` | 同一 IP 请求太频繁（默认每 10 分钟 600 次），稍后再试 |

默认限额（管理员可改）：最多 30 个组，每组 50MB，单分区 4MB，单请求 8MB，每 IP 每 10 分钟 600 次。
信件单封 64KB、每组最多 200 封；转交点合计 16KB、最多 8 条、10 分钟过期。

## 3. 不签名的接口

### `GET /v1/hello`
```
→ 200 {"node":"km-sync","proto":1,"ver":"1.2.0","time":1792138965531}
```
`proto` 是协议主版本，不同就提示升级。

### 邀请码
管理员在审批 App 生成，二维码内容：
```
kmnode:1?h=43.142.41.27&p=8787&i=<邀请号 8 位>&s=<邀请密钥 20 字节的 base32，大写、无填充，32 个字符>
```

### `POST /v1/create` 建组 / 重建
设备生成（或已有）`gid` 和 32 字节 `nodeKey`，用邀请密钥 `secret` 包好 nodeKey，nodeKey 不在网上明传：
```
ik  = HMAC(secret, "km-invite")
n   = 16 字节随机数
w   = nodeKey XOR HMAC(ik, "km-wrap" ‖ gid ‖ n)          （32 字节）
mac = HMAC(ik, "km-create" ‖ gid ‖ n ‖ w)
```
```
POST /v1/create
{"gid":"9f3c…(32 hex)","inv":"h4k7m2qa","n":b64(n),"w":b64(w),"mac":b64(mac)}
→ 200 {"ok":true,"rebuilt":false,"gen":"a1b2c3d4"}        新建（邀请码已用次数 +1）
→ 200 {"ok":true,"rebuilt":true,"gen":"…"}                重建：这个 gid 以前用这张邀请码建过（邀请码过期、用完也行，不占次数）
→ 200 {"ok":true,"existed":true,"gen":"…"}                组本来就在、nodeKey 相同（幂等）
→ 403 {"err":"invite"} / 403 {"err":"blocked"} / 413 {"err":"groups"} / 409 {"err":"exists"}
```
新建要求邀请码存在、没作废、没过期、已用 < 上限。邀请码被作废后不能再重建。

### `POST /v1/rdv/<id>` 转交点（扫码加入时临时交换，#1 第二期用）
`id` 是二维码里带的随机串（`[A-Za-z0-9_-]{16,64}`，建议 16 字节随机数的 b64）。两边约定一边是 `a`、一边是 `b`。
内容由设备自己加密，节点只转交。
```
{"op":"put","side":"a","data":b64(…)}   → 200 {"ok":true,"n":1,"exp":<过期毫秒时间>}
{"op":"get","side":"b"}                 → 200 {"ok":true,"items":[{"n":1,"data":b64(…)}]}   （只返回对方那一边放的）
```
第一次 put 起 10 分钟过期；合计超过 16KB 或 8 条 → 413。

## 4. 签名的接口：`/v1/g/<gid>/<动作>`

请求头：
```
X-KM-Auth: <dev>.<ctr>.<b64(HMAC(nodeKey, METHOD "\n" PATH "\n" dev "\n" ctr "\n" hex(SHA256(正文))))>
```
- `PATH` 是不带查询串的路径，如 `/v1/g/9f3c…/push`；`hex(...)` 是 64 个小写十六进制字符。
- `ctr` 是十进制整数，每台设备在每个组里必须**严格递增**：取 `max(上次 + 1, 当前毫秒数)`。不依赖时钟也能防重放。
- 检查顺序：组被封禁 → 403 blocked；组不存在 → 404 nogroup；签名或计数不对 → 401。

示例（`test_node.py` 的 `DevClient.auth`）：
```python
msg = f'POST\n/v1/g/{gid}/push\n{dev}\n{ctr}\n{hashlib.sha256(body).hexdigest()}'.encode()
auth = f'{dev}.{ctr}.{b64(hmac_sha256(nodeKey, msg))}'
```

### `push` 上传本机分区到自己的槽
```
{"items":[{"sec":"k3f…","rev":12,"cid":"c9a…","data":b64(密文)}]}
→ 200 {"ok":true,"seq":57,"gen":"a1b2c3d4","stale":["…"]}
```
- 每个分区的 `rev` 必须比节点上已有的大，否则不覆盖，写进 `stale`。
- 每写入一个分区，组内序号 `seq` +1，分区记下这个序号。
- 整次请求超过组空间 → 413 quota，**全部不写入**。

### `pull` 取别人的槽
```
{"since":42}
→ 200 {"ok":true,"gen":"a1b2c3d4","seq":57,"items":[{"dev":"devB","sec":"…","rev":3,"cid":"…","seq":43,"data":b64(…)}],
       "more":false,"mail":0}
```
- 只返回 `seq > since` 且不是自己上传的分区，按 `seq` 排序。`more:true` 表示一次装不下，用最后一项的 `seq` 接着拉。
- `mail` 是给本设备的待取信件数。
- **`gen` 变了**（管理员清空了这个组的数据，或组被重建）：把 `since` 归零，并把本机所有分区重推一遍。

### `forget` 删掉某台设备的槽（移除设备时用）
`{"dev":"devX"}` → `{"ok":true,"removed":5}`

### `drop` 删掉整个组（换钥后旧组用完）
`{}` → `{"ok":true}`。节点上的组和它的登记都删掉（被封禁的登记保留）。

### `successor` 换钥后的新组
由旧组的 nodeKey 签名授权，不需要邀请码。正文格式同 create，包裹用的 `ik` 换成**旧组的 nodeKey**：
```
POST /v1/g/<旧gid>/successor   （X-KM-Auth 用旧 nodeKey 签名）
{"gid":"<新gid>","n":…,"w":…,"mac":…}      w = 新nodeKey XOR HMAC(旧nodeKey, "km-wrap" ‖ 新gid ‖ n)
→ 200 {"ok":true,"gen":"…"}
```
新组继承旧组的邀请号（以后可以凭它重建）、记下上一代组号。旧组被封禁 → 403 blocked；包裹校验错 → 401。
有了新组 60 天后，节点自动删掉旧组。旧组号记进墓碑（admin.db，保留 90 天）：期间任何设备用邀请码 `create` 这个组号都回 403 `replaced`，被移除的设备不能凭旧组身份把它重建出来（1.2.0）。
换钥的设备不主动 `drop` 旧组：留给被移除的设备看到「已被移出」的名单，由节点 60 天后自动删。

### 信箱 `mail/put`、`mail/get`、`mail/del`（换钥时交钥匙包）
```
mail/put {"to":"devB" 或 "*","data":b64(…),"ttl":86400}   ttl 600 秒 – 60 天  → {"ok":true,"id":"…"}
mail/get {}                                                → {"ok":true,"items":[{"id","from","to","data","t","exp"}]}
mail/del {"ids":["…"]}                                     → {"ok":true,"removed":1}
```
信件计入组空间。

## 5. 管理接口 `/admin/v1`（只给审批 App，设备不涉及）

- 管理密钥 K：32 字节随机数，部署时在服务器上生成。管理码：`kmadmin:1?h=<地址>&p=<端口>&k=<b64(K)>`。
- `kid = hex(SHA256(K))` 前 8 位；加密钥 `encKey = HMAC(K, "km-admin-enc-v1")`（服务器只存 encKey）。
- 请求：`POST /admin/v1`，正文
  ```
  {"v":1,"kid":"c0ffee42","ctr":<递增整数>,"iv":b64(12 字节),"ct":b64(AES-256-GCM(encKey, iv, 明文, 附加数据))}
  明文 = {"op":"status","args":{}}      附加数据 = "km-admin-req|" kid "|" ctr
  ```
- 响应 200：`{"iv":…,"ct":…}`，附加数据 `"km-admin-resp|" kid "|" ctr`，解开是 `{"ok":true,"data":…}` 或 `{"ok":false,"err":"…","msg":"中文原因"}`。
- 所有认证失败一律 `403 {}`。唯一的例外信息：如果请求**解得开**、只是 `ctr` 不比上次大，响应头带
  `X-KM-Retry: b64(iv).b64(AES-GCM(encKey, iv, {"last":<上次计数>}, "km-admin-retry|" kid "|" ctr))`，
  只有持有管理密钥的人看得懂，客户端据此用 `last + 1` 重试一次（手机和电脑时钟差几分钟时会用到）。
- 每个 kid 每分钟最多 120 次（超过回 429 {}）；同一 IP 10 分钟失败 5 次封 1 小时；所有外网来源 1 小时失败 30 次熔断 1 小时；
  可关外网管理、可设 IP 名单；来自 127.0.0.1（SSH 隧道）的请求不受这些限制。
- 操作（`op`）：`status`、`groups.list`、`groups.clear`、`groups.remove`、`groups.unblock`、`groups.setQuota`、`groups.setNote`、
  `invites.create`、`invites.list`、`invites.revoke`、`limits.set`、`expiry.set`、`access.set`、`log.list`。参数和返回见
  `km_sync_node.py` 里 `op_*` 函数。所有返回都只有元数据，没有任何密文。

### 1.3.0 新增（#6 第三期）

| op | 谁能调 | 参数 → 返回 |
|---|---|---|
| `groups.purge` | 管理密钥和网页会话 | `{gid}` → `{}`。彻底删除「已移除并封禁、节点上没有数据」的组登记：从 `groups.list` 消失；组号记进**永久**墓碑（`tombstones.purged`，清理任务不删），之后设备 `create`（新建或重建）、`successor` 用它当新组号、`/v1/g/<gid>/…` 一律 `403 {"err":"blocked"}`，也不能再 `groups.unblock`。不满足条件回 `{"ok":false}` 和中文原因 |
| `admin.rotateKey` | 只有管理密钥（审批 App） | `{key: b64(新的 32 字节管理密钥)}` → `{kid: 新 kid}`。新密钥装在用旧密钥加密的请求里；换上后旧密钥立即失效（这次的响应仍用旧密钥加密），节点只保留这一把。电脑上 `signing/sync-node.json`、`sync-node-admin.png` 里的旧管理码随之失效（`deploy.ps1` 照常能部署，会提示；需要时 `-NewAdminKey`） |
| `log.list` | 都可以 | `limit` 上限从 100 提到 500（导出日志时按 `before` 一页一页取完） |

审批 App 换钥时先把新密钥存成「待确认」再发请求；没拿到明确结果（断网、超时）时，下次调节点前用新密钥试一次 `status`，能用就转正，
被拒而旧密钥能用就丢掉新的。

健康提醒（审批 App 后台约每 30 分钟取一次 `status`，不改协议）：连续两次连不上或被拒、`disk_free/disk_total < 10%`、`days_left ≤ 7`、
`tls.enabled 且 tls.hours_left < 48` 时发系统通知，每类每天最多一次（`team-admin-app/.../NodeHealth.java`）。

admin.db 表结构 4：`tombstones` 加一列 `purged`（升级前备份 `admin.db.v3.bak`；回滚到 1.2.0 时这些组号按普通墓碑拒绝重建，90 天后才会被 1.2.0 清掉）。

## 6. 网页后台（1.1.0 起，#6 第二期）

设备协议不变；网页后台复用第 5 节的管理信封，只多了「登录换会话密钥」这一步。

### 端口

| 端口 | 内容 |
|---|---|
| 443（TLS） | 静态页面（白名单：`/`、`/index.html`、`/web.js`、`/web.css`、`/node.js`、`/node.css`、`/vendor/qrcode.js`、`/vendor/jsQR.js`）、`POST /admin/web/login`、`POST /admin/v1` |
| 127.0.0.1:8788 | 同 443，明文，只给 SSH 隧道用（`http://localhost` 是浏览器的安全上下文） |
| 80 | 只有 `/.well-known/acme-challenge/<token>`（Let's Encrypt 验证文件）；`/v1/*`、`/admin*` 是 404；其它一律 301 到 `https://<地址>/…` |
| 8787 | 第 1–5 节，不变。`/admin/web/login` 在这里是 404，网页会话的 kid 在这里一律 403 |

443 和 8788 的所有响应都带 `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`、
`X-Content-Type-Options: nosniff`、`Referrer-Policy: no-referrer`；443 另带 `Strict-Transport-Security: max-age=604800`。

证书：`/etc/km-sync/tls/fullchain.pem`、`privkey.pem`（certbot 签发的 Let's Encrypt IP 证书，约 160 小时，`deploy-hook` 复制过来），
节点每 60 秒看一次文件修改时间，变了就换新证书（新连接生效，不重启）。新证书加载失败继续用旧的；没有证书时 443 不接受连接。都不影响 8787。

### 登录 `POST /admin/web/login`

```
{"user":"boss","pw":"<密码>","code":"<6 位验证码，没开二次验证可不填>"}
→ 200 {"ok":true,"kid":"5e1f0a2b","key":b64(32 字节会话密钥 S),"user":"boss","idle":1800,"expires":<毫秒>}
→ 403 {"err":"login","msg":"用户名、密码或验证码不对"}     用户名错 / 密码错 / 验证码错或用过 / 没设密码 / 网页登录关闭，一律这一句
→ 403 {"err":"denied","msg":"…"}                         IP 被封、熔断、不在 IP 名单、关了外网管理（127.0.0.1 不受限）
→ 403 {"err":"paused","msg":"…"}                         账号 1 小时内失败 10 次，网页登录暂停 1 小时（审批 App 的管理密钥不受影响）
```

- 失败和第 5 节的认证失败进**同一套计数**（同 IP 10 分钟 5 次封 1 小时；全部外网来源 1 小时 30 次熔断 1 小时），原因只写进管理日志（安全事件）。
- 密码：`scrypt$15$8$1$<盐 b64>$<哈希 b64>`（N=2^15、r=8、p=1、16 字节盐、32 字节输出），同一时间只算一个。
  密码 12–128 个字符；不能太常见/太好猜（内置常见弱密码词和规则：全是数字符号、重复、键盘序列）；不能包含用户名、`admin`、`kmsync`、服务器地址。
- 二次验证：RFC 6238 TOTP（SHA-1、30 秒、6 位），前后各容一个时间步；同一个时间步的码只能用一次。

### 会话 = 一把临时的管理密钥

- 拿到 `kid` 和 `S` 后，`encKey = HMAC(S, "km-admin-enc-v1")`，之后和第 5 节**完全一样**地调 `POST /admin/v1`（信封、计数、`X-KM-Retry`、响应加密）。
  节点在管理密钥表里找不到这个 kid 时再查网页会话（只在 443 / 8788 上查）。
- 网页里用 WebCrypto 把 encKey 导入成不可导出的 AES-GCM 密钥，`S` 用完清零，不存任何存储。
- 空闲 30 分钟、或登录满 12 小时过期（过期的会话回 `403 {}`，但不计入失败次数）；最多同时 5 个，多了踢掉最早的。
  改密码、关闭网页登录、重置网页登录、「全部踢下线」时所有会话立即失效；退出（`web.logout`）立即删除。
- 日志「谁」：管理密钥写 `管理员 <kid>`，网页写 `网页 <用户名>（会话 <kid 前 4 位>）`。

### 新增的管理操作

| op | 谁能调 | 参数 → 返回 |
|---|---|---|
| `web.status` | 只有管理密钥 | → `{enabled, user, has_password, totp, sessions, pw_changed, url, paused}` |
| `web.setPassword` | 只有管理密钥 | `{user, pw}` → 同上。设好后网页登录打开，已有会话全部失效 |
| `web.setEnabled` | 只有管理密钥 | `{enabled}`；关闭时踢掉所有会话 |
| `web.totpReset` | 只有管理密钥 | 关掉二次验证（手机丢了用） |
| `web.reset` | 只有管理密钥 | 清空用户名、密码、二次验证和全部会话，网页登录关闭 |
| `web.sessions` | 都可以 | → `[{kid, user, created, last_used, expires, ip, ua, alive, current}]` |
| `web.revoke` | 都可以 | `{kid}` 或 `{all:true}` |
| `web.whoami` | 只有网页会话 | → `{user, kid, created, expires, idle, ip, totp}` |
| `web.logout` | 只有网页会话 | 删除这个会话 |
| `web.changePassword` | 只有网页会话 | `{old, new}`；成功后全部会话失效 |
| `web.totpBegin` | 只有网页会话 | `{pw}` → `{secret（base32）, uri（otpauth://…）}`，还没生效 |
| `web.totpConfirm` | 只有网页会话 | `{code}`：码对了才生效 |
| `web.totpDisable` | 只有网页会话 | `{pw, code}` |

权限不对回 `{"ok":false,"err":"perm"}`。网页会话调 `access.set` 时不能改「外网管理」开关（`remote` 必须和现在一样）。
`status` 多了 `tls:{enabled, not_after, hours_left, issuer, err}` 和 `web:{…同 web.status}`。

### 数据

admin.db 表结构 2（只新增，不动旧表；升级前自动备份成 `admin.db.v1.bak`；回滚到 1.0.0 不受影响）：
`web_user(id=1, user, pw_hash, totp_secret, totp_pending, totp_last_step, enabled, pw_changed, fail_times)`、
`web_sessions(kid, enc_key, last_ctr, user, created, last_used, expires, ip, ua)`（存的是 `HMAC(S, …)`，不存 S）。

## 7. 账号（1.4.0，#12）

「账号 = 同步组的钥匙」：一个账号绑定一个组（gid）。节点保存用户名、口令派生的验证钥和两份包着组密钥的「账号包」，
自己解不开任何一份；同步本身还是第 4 节，只是账号组的请求多带一张设备通行证。没有绑定账号的组和 1.3.0 完全一样。

### 7.1 派生（设备上算，密码和下面这些钥都不上网）

```
salt    = 16 字节随机数（注册时生成；重设密码时换新的）
iters   = PBKDF2 次数，100000–2000000（App 默认 200000）
mk      = PBKDF2-HMAC-SHA256(密码 UTF-8, salt, iters, 32)
authKey = HKDF(mk, salt="km-acct-v1", info="km-acct-auth", 32)       证明「知道密码」，节点保存
wrapKey = HKDF(mk, salt="km-acct-v1", info="km-acct-wrap", 32)       包账号包，节点拿不到
HKDF 即 HKDF-SHA256（RFC 5869）；AES-GCM 盒子 = iv(12) ‖ 密文 ‖ 标签(16)，附加数据见各处
账号包 bundle = {"v":1,"user","gk":b64(组密钥),"epoch","gkT","invite":"组的邀请码 / 注册码原文（节点数据丢了时重建用）"}（UTF-8 JSON）
wrap_pw    = AES-GCM(wrapKey, bundle, 附加数据 "km-acct-pw|" user)
wrap_admin = UTF-8 JSON {"v":1,"kid":恢复公钥编号,"epk":b64(临时 P-256 公钥 X.509),"box":b64(AES-GCM(k, bundle, "km-acct-admin|" user))}
             k = HKDF(ECDH(临时私钥, 恢复公钥), salt="km-acct-v1", info="km-acct-admin", 32)
             恢复公钥打包在 App 里（signing/km-recovery.json，make_recovery_key.py 生成），私钥只在审批 App
```
用户名：3–20 位小写字母、数字、下划线（`^[a-z0-9_]{3,20}$`），大写一律先转小写。

### 7.2 注册码

管理员用 `invites.create {kind:"acct"}` 生成：12 位 Crockford base32（`0-9A-Z` 去掉 `I L O U`），显示成 `XXXX-XXXX-XXXX`；
二维码 `kmreg:1?c=XXXX-XXXX-XXXX&h=<节点地址>&p=<端口>`。前 4 位是邀请号（列表、日志里显示），后 8 位是秘密。
输入时忽略大小写、空格和连字符，`I`/`L` 当 `1`、`O` 当 `0`。
```
ik  = HMAC(后 8 位秘密的 ASCII, "km-invite")                        （和 #1 邀请码的 ik 同一个算法）
abox = AES-GCM(HKDF(ik, salt="km-acct-v1", info="km-acct-abox"), authKey, 附加数据 "km-acct-abox|" user "|" gid)
```
注册码只能用来注册（拿它当 `inv` 调 `/v1/create` 建新组 → 403 invite）；但已绑定账号的组在节点数据丢失后，可以照第 3 节
用组登记的那个注册码（`inv` = 前 4 位，包裹用上面的 ik）`create` 重建，即使注册码已过期、用完、作废（账号说了算）。

### 7.3 接口（不签名，计入每 IP 限速）

| 接口 | 正文 → 返回 |
|---|---|
| `POST /v1/acct/pre` | `{user}` → `{ok, salt, iters, nonce}`。nonce 16 字节、2 分钟有效、只能用一次。用户名不存在时 salt 由节点秘密假造（同一用户名每次一样）、iters 是默认值，格式完全一样 |
| `POST /v1/acct/login` | `{user, nonce, dev, devName, appVer, proof}`，`proof = b64(HMAC(authKey, "km-login|" user "|" nonce "|" dev))`（nonce 用 pre 返回的 b64 原文）→ `{ok, user, gid, wrap_pw, pw_ver, tok}` |
| `POST /v1/acct/register` 新建组 | `{user, code, gid, n, w, mac, salt, iters, abox, wrap_pw, wrap_admin, dev, devName, appVer}`。n/w/mac 同第 3 节 create 的包裹，ik 用注册码的。建组和建账号一起完成 → `{ok, user, gen, pw_ver:1, tok, legacy:0}` |
| `POST /v1/acct/register` 把已有的组升级成账号 | 正文同上但**不带 n/w/mac**，请求头带 `X-KM-Auth`（用这个组的 nodeKey 签名，`PATH` = `/v1/acct/register`，计数和组请求共用）。组里另有的设备记为「老设备」→ `{ok, …, legacy:<老设备数>}` |

`tok = b64(AES-GCM(HKDF(authKey, salt="km-acct-v1", info="km-devtok"), devToken, 附加数据 "km-devtok|" user "|" dev))`：
devToken 是这台设备在这个账号下的 32 字节通行证（每次登录 / 注册发新的，旧的作废）。节点只存 `SHA256(devToken)`。

| 错误 | 含义 |
|---|---|
| 400 bad | 格式不对（用户名不合规则、iters 不在范围、字段长度） |
| 403 `{"err":"login"}` | 用户名或密码不对、nonce 过期 / 用过（用户名不存在时也是这句） |
| 403 `{"err":"disabled"}` | 账号已停用（只有密码对了才这样回） |
| 429 `{"err":"paused"}` | 这个账号 15 分钟内密码错 5 次，暂停 15 分钟 |
| 403 `{"err":"code"}` | 注册码不存在、不对、过期、用完、作废 |
| 409 `{"err":"user"}` | 用户名已被占用 |
| 409 `{"err":"bound","user":…}` | 这个组已经绑定了别的账号 |
| 403 blocked / 404 nogroup / 409 exists / 401 auth | 同第 2 节（升级已有组时组不在节点上 → 404 nogroup，先 create 重建） |
| 503 `{"err":"crypto"}` | 节点没有 cryptography（不应出现） |

### 7.4 账号组的同步请求：设备通行证

已绑定账号的组，所有 `/v1/g/<gid>/…` 请求除 `X-KM-Auth` 外还要带
```
X-KM-Dev: b64(HMAC(SHA256(devToken), 与 X-KM-Auth 相同的签名串))
```
检查顺序（在 blocked / nogroup / 401 之后）：账号停用 → `403 {"err":"disabled"}`；这台设备没有有效通行证 → `403 {"err":"relogin"}`
（设备回登录页，**不删本机任何数据**）；`successor`、`drop` → `403 {"err":"acct"}`（账号组不换钥）。
**老设备**：组绑定账号那一刻已在组里（有计数或槽）的设备，绑定后 60 天内不带通行证也放行（还没升级的旧版 App 照常同步）；
它用新版登录后有了通行证，老设备标记消失。管理员停用账号、重设密码时老设备标记一起清掉。
`pull` / `push` 的响应多一个 `acct`：组绑定的用户名（同组还没登录的新版 App 据此在登录页填好用户名；旧版 App 忽略）。

### 7.5 管理操作（第 5 节的信封）

| op | 谁能调 | 参数 → 返回 |
|---|---|---|
| `accounts.list` | 都可以 | `{q?}` → `[{user, gid, created, last_login, last_dev, devices, state: ok/disabled/relogin, disabled_at, bytes, note, code, pw_ver, paused}]` |
| `accounts.get` | 都可以；`wrap:true` 只有管理密钥 | `{user, wrap?}` → 同上 + `list:[{dev, short, name, first, last_seen, last_sync, app_ver, legacy, token, state}]`；`wrap` 时加 `wrap_admin`、`iters` |
| `accounts.setDisabled` | 都可以 | `{user, disabled}`；停用时作废所有通行证、清老设备标记 |
| `accounts.removeDevice` | 都可以 | `{user, dev}`：作废它的通行证、删掉它在节点上的槽（它下次联网回登录页） |
| `accounts.resetPassword` | 只有管理密钥 | `{user, salt, iters, auth_key, wrap_pw}`（审批 App 用恢复私钥解开 wrap_admin 后，用新密码在本机算好）→ pw_ver+1，作废所有通行证 |
| `accounts.setNote` | 都可以 | `{user, note}`（≤40 字） |
| `accounts.delete` | 只有管理密钥 | `{user, confirm:user}`：删账号和组数据，组号记进永久墓碑 |
| `invites.create` | 都可以 | 多了 `kind:"acct"` → `{id, kind, code, qr, expires}` |
| `invites.list` | 都可以 | `{kind?}` 筛选；每项多 `kind`，注册码多 `code`、`users`（用它注册的用户名） |

`groups.list` 每个组多 `acct`（绑定的用户名或 null）；`status` 多 `accounts`（账号数）。账号操作都写管理日志；
设备侧的注册、登录写日志（`acct.register`、`acct.login`），暂停、重放、注册码错是安全事件。

### 7.6 数据、限额、搬家

admin.db 表结构 5（只新增，升级前自动备份 `admin.db.v4.bak`，回滚到 1.3.0 时账号组按普通组同步）：
`accounts(user, gid, salt, iters, auth_key, wrap_pw, wrap_admin, pw_ver, disabled_at, created, code_id, note, last_login, last_dev, fail_n, fail_since, paused_until, bound_at)`、
`acct_devices(user, dev, name, tok_hash, legacy, first, last_seen, app_ver)`、`invites.kind`（空 = 同步邀请码）。
默认组数上限 30 → 300（升级时管理员没改过、还是 30 的自动改成 300）。

局域网发现：`config.json` 里 `discovery_port`（Docker 默认 8787，公网服务器上不开）。设备向 UDP 该端口广播 `km-sync?`，
节点回一行 JSON：`/v1/hello` 的内容加 `host`、`port`（对外地址）。`--backup DIR` 在线备份 node.db、admin.db（搬家用，见 DOCKER.md）。
