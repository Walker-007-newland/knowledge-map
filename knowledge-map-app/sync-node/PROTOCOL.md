# km-sync 节点协议 v1

本文是 #1 产品方案 v2 第七节 + #6 产品方案第三节补充的实现说明，`km_sync_node.py` 按它实现，
#1 第二期的 Java 客户端也按它写。参考客户端是 `test_node.py` 里的 `DevClient`（设备）和 `AdminClient`（管理）。

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
| 403 | `{"err":"blocked"}` | 组已被管理员封禁。平板提示「同步节点拒绝了这个同步组」，停止使用节点 |
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
