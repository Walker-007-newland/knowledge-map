# km-sync 同步节点

腾讯云服务器 43.142.41.27 上的同步节点（#1 方案 v2 第七节、#6）。它是一台「永远在线、只会保管不会合并」的组员，
只存设备加密好的密文；管理员用「团队审批」App 的「节点」页管理（只看得到元数据）。

| 文件 | 内容 |
|---|---|
| `km_sync_node.py` | 节点服务：设备协议 `/v1/*` + 管理接口 `/admin/v1`，单文件，Python 3.10 标准库 + 系统自带 python3-cryptography |
| `PROTOCOL.md` | 协议说明（设备客户端按它实现） |
| `km-sync.service` | systemd 单元（kmsync 用户、Restart=always、ProtectSystem=strict、MemoryMax=200M） |
| `deploy.ps1` | 部署 / `-Check` 体检 / `-Rollback` / `-NewAdminKey` / `-ResetAdminAccess` |
| `remote.sh` | deploy.ps1 传到服务器上用 sudo 执行的安装脚本 |
| `make_codes.py` | 生成管理码、邀请码二维码图片（deploy.ps1 调用） |
| `test_node.py` | 本地测试、Java 互通测试、经 SSH 隧道测真实服务器 |

build.ps1 只复制图谱目录和 hub 文件，这个目录不会被打进知识图谱 App。

## 服务器上的布局

- 程序 `/opt/km-sync/km_sync_node.py`（上一版 `km_sync_node.py.bak`）
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

## 测试

```powershell
python knowledge-map-app\sync-node\test_node.py            # 本地：临时目录、随机端口，跑完即删；含 Java 互通（需要 JDK）
# 远程：先开 SSH 隧道（8787 端口没开放时也能测）
ssh -i ~/.ssh/km_tencent -N -L 8787:127.0.0.1:8787 ubuntu@43.142.41.27
python knowledge-map-app\sync-node\test_node.py --remote 127.0.0.1:8787
```

本机没装 cryptography 时，本地测试的节点和客户端用 `km_sync_node.py` 里内置的纯 Python AES-GCM（只给测试用，已用 GCM 标准
测试向量核对）；它和 Java javax.crypto 的互通由本地测试验证，和服务器 cryptography 的互通由远程测试验证。

远程测试只用备注「自动测试」的临时邀请码和组，结束时设备删组、作废邀请码。

## 排障

| 现象 | 看什么 |
|---|---|
| 审批 App 显示「超时」 | 腾讯云防火墙没放行 TCP 8787，或服务停了：`deploy.ps1 -Check` |
| 审批 App 显示「403」 | 管理码失效（换过钥）、IP 被封、熔断、关了外网管理：看 `journalctl -u km-sync`，必要时 `-ResetAdminAccess` |
| 服务起不来 | `ssh … sudo journalctl -u km-sync -n 50` |
