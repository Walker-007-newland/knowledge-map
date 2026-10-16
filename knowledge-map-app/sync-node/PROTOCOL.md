# km-sync 节点协议 v1

本文是 #1 产品方案 v2 第七节 + #6 产品方案第三节补充的实现说明，`km_sync_node.py` 按它实现，
#1 第二期的 Java 客户端也按它写。参考客户端是 `test_node.py` 里的 `DevClient`（设备）和 `AdminClient`（管理）。

节点只是一个「永远在线、只会保管不会合并」的组员：每台设备一个**槽**，槽里是这台设备各分区最新的**密文**。
节点看不懂内容，也不知道分区名（分区编号是设备算的 HMAC）。

## 1. 传输与编码

- HTTP/1.1，明文，端口 8787。请求和响应都是 JSON（UTF-8），POST 必须带 `Content-Length`。
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
→ 200 {"node":"km-sync","proto":1,"ver":"1.0.0","time":1792138965531}
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
{"gid":"9f3c…(32 hex)","inv":"7g83ttm4","n":b64(n),"w":b64(w),"mac":b64(mac)}
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
有了新组 60 天后，节点自动删掉旧组。

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
  {"v":1,"kid":"7dc74850","ctr":<递增整数>,"iv":b64(12 字节),"ct":b64(AES-256-GCM(encKey, iv, 明文, 附加数据))}
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
