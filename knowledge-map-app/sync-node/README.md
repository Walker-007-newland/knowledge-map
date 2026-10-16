# km-sync 同步节点

腾讯云服务器 43.142.41.27 上的同步节点（#1 方案 v2 第七节、#6）。它是一台「永远在线、只会保管不会合并」的组员，
只存设备加密好的密文；管理员用「团队审批」App 的「节点」页管理，或在电脑浏览器打开 **https://43.142.41.27** 登录网页后台
（1.1.0 起，#6 第二期；两边能做的事一样，都只看得到元数据）。

| 文件 | 内容 |
|---|---|
| `km_sync_node.py` | 节点服务：设备协议 `/v1/*` + 管理接口 `/admin/v1` + 网页后台（443 / 80 / 127.0.0.1:8788），单文件，Python 3.10 标准库 + 系统自带 python3-cryptography |
| `PROTOCOL.md` | 协议说明（设备客户端按它实现；第 6 节是网页后台） |
| `km-sync.service` | systemd 单元（kmsync 用户、只多给 CAP_NET_BIND_SERVICE 听 80/443、Restart=always、ProtectSystem=strict、MemoryMax=200M） |
| `web/` | 网页后台外壳：`index.html`（登录页）、`web.js`（登录、会话、WebCrypto 垫片、「账号安全」）、`web.css`。节点页本身用审批 App 的 `team-admin-app/www/node.js`、`node.css`，部署时一起传 |
| `tls-deploy-hook.sh` | certbot 签发/续期成功后把证书复制到 `/etc/km-sync/tls/`（节点 60 秒内自动换上） |
| `deploy.ps1` | 部署 / `-Check` 体检 / `-Rollback` / `-NewAdminKey` / `-ResetAdminAccess` / `-SetupTls` / `-TlsCheck` / `-ResetWebLogin` |
| `remote.sh` | deploy.ps1 传到服务器上用 sudo 执行的安装脚本 |
| `make_codes.py` | 生成管理码、邀请码二维码图片（deploy.ps1 调用） |
| `test_node.py` | 本地测试、Java 互通测试、经 SSH 隧道测真实服务器 |

build.ps1 只复制图谱目录和 hub 文件，这个目录不会被打进知识图谱 App。

## 服务器上的布局

- 程序 `/opt/km-sync/km_sync_node.py`（上一版 `km_sync_node.py.bak`，systemd 单元的上一版 `km-sync.service.bak`）、网页文件 `/opt/km-sync/web/`
- 证书 `/etc/km-sync/tls/`（kmsync 所有，600）；certbot（snap 版）的正式证书在 `/etc/letsencrypt/live/43.142.41.27/`，
  Let's Encrypt 验证文件目录 `/var/lib/km-sync-acme/`（节点的 80 端口只发这里的文件）；`snap.certbot.renew.timer` 每天检查两次，剩 3 天就续
- 配置 `/etc/km-sync/config.json`（kmsync 所有，600）：监听地址、端口、数据目录、对外地址
- 数据 `/var/lib/km-sync/`（700）：`node.db`（组、槽、密文；丢了设备会自动重建重传）、`admin.db`（邀请码、组登记/封禁/备注、管理密钥派生值、日志、设置）
- 日志：`journalctl -u km-sync`（只记时间、IP、gid 前 6 位、接口、状态码、字节数）

## 部署

签名目录：`$env:KM_SIGNING_DIR`，没设就用主目录 `knowledge-map-app\signing`（已 gitignore）。

```powershell
powershell -ExecutionPolicy Bypass -File knowledge-map-app\sync-node\deploy.ps1          # 部署或更新
powershell -ExecutionPolicy Bypass -File knowledge-map-app\sync-node\deploy.ps1 -Check   # 只读体检
```

- 第一次部署：建系统用户 kmsync 和目录，装 systemd 单元并启动，在服务器上生成**管理密钥**和一张**初始邀请码**（30 天 10 次），
  写回本机 `signing/sync-node.json`，生成 `signing/sync-node-admin.png`（管理码）和 `signing/sync-node-invite.png`（初始邀请码）。
- 再次部署：只换程序；数据库、管理密钥、邀请码不变。程序没变化时不重启。
- 服务器上导入不了 python3-cryptography 时，部署会停下报错（不自动安装，请管理员决定）。
- 手机丢了：`deploy.ps1 -NewAdminKey`，旧管理码立即失效，用审批 App 重新扫新的 `sync-node-admin.png`。
- 把自己锁在外面（IP 名单填错、关了外网管理、被封 IP）：`deploy.ps1 -ResetAdminAccess`。

### 网页后台（1.1.0）

- 证书：`deploy.ps1 -SetupTls`（snap 装 certbot ≥ 5.4；先 staging 再正式签发 Let's Encrypt **IP 证书**，`shortlived` 档约 160 小时，
  webroot 模式经 80 端口验证；不留邮箱、不开账号，管理员已同意服务条款）。`-SetupTls -StagingOnly` 只签测试证书。
  Let's Encrypt 从多个境外地点同时验证，偶尔有一个地点超时，脚本会隔 30 秒重试，最多 3 次。
- 查看：`deploy.ps1 -TlsCheck`（签发者、有效期、剩余、续期定时器、`certbot renew --dry-run`）。
- 网页密码在审批 App「节点 → 限额与访问 → 网页登录」里设；默认没设、不能登录。网页上可以改密码、开/关二次验证、看/踢自己的会话。
- 忘了密码 / 手机丢了：App 里重新设密码、关二次验证；App 也用不了时 `deploy.ps1 -ResetWebLogin`（清空网页账号和会话，网页登录关闭）。
- SSH 隧道兜底（证书出问题、不想开 443 时）：`ssh -i ~/.ssh/km_tencent -N -L 8788:127.0.0.1:8788 ubuntu@43.142.41.27`，浏览器开 `http://localhost:8788`。
- 证书续期失败最多只影响网页后台：8787 上的审批 App 和学生同步完全不受影响（测试里有覆盖）；证书剩不到 48 小时，App 和网页的「节点」标签出红点。

## 测试

```powershell
python knowledge-map-app\sync-node\test_node.py            # 本地：临时目录、随机端口，跑完即删；含 Java 互通（需要 JDK）、网页后台、表结构迁移
python knowledge-map-app\sync-node\test_node.py --serve 28790   # 在 http://127.0.0.1:28790 起一个带假数据的本地网页后台，浏览器里手动试（临时密码打印在窗口里）
# 远程：先开 SSH 隧道（8787 端口没开放时也能测）
ssh -i ~/.ssh/km_tencent -N -L 8787:127.0.0.1:8787 ubuntu@43.142.41.27
python knowledge-map-app\sync-node\test_node.py --remote 127.0.0.1:8787
```

本机没装 cryptography 时，本地测试的节点和客户端用 `km_sync_node.py` 里内置的纯 Python AES-GCM（只给测试用，已用 GCM 标准
测试向量核对）；它和 Java javax.crypto 的互通由本地测试验证，和服务器 cryptography 的互通由远程测试验证。

远程测试只用备注「自动测试」的临时邀请码和组，结束时设备删组、作废邀请码。网页部分走公网 https（校验证书）：
网页登录还没设置时用一个只在内存里的临时密码登录一次，结束时 `web.reset` 恢复成没设置；管理员已经设过密码时只测「错误密码被拒」。
本地 443 用 Git for Windows 自带的 openssl 临时生成自签证书。

## 排障

| 现象 | 看什么 |
|---|---|
| 审批 App 显示「超时」 | 腾讯云防火墙没放行 TCP 8787，或服务停了：`deploy.ps1 -Check` |
| 审批 App 显示「403」 | 管理码失效（换过钥）、IP 被封、熔断、关了外网管理：看 `journalctl -u km-sync`，必要时 `-ResetAdminAccess` |
| 服务起不来 | `ssh … sudo journalctl -u km-sync -n 50` |
| 网页后台打不开 | `deploy.ps1 -TlsCheck` 看证书；`-Check` 看 80/443；临时用 SSH 隧道 `http://localhost:8788` |
| 网页登录总说密码不对 | 失败太多会封 IP / 暂停网页登录 1 小时：看审批 App「操作日志 → 只看安全事件」；App 里重新设密码 |
