# km-sync 的 Docker 版：可以搬家的同步 / 账号服务（1.4.0，#12）

现在节点跑在腾讯云（`deploy.ps1` 部署，systemd）。为了以后能搬到家里的电脑或 NAS、不再续费云服务器，
节点也可以用 Docker 跑：**程序在镜像里，数据全在一个目录（卷）里**，搬家就是「停掉 → 拷走这个目录 → 在新机器上启动」。

| 文件 | 内容 |
|---|---|
| `Dockerfile` | 镜像：python:3.12-slim + cryptography + qrcode，程序 `km_sync_node.py`、网页后台文件 |
| `docker-compose.yml` | 一条命令启动；数据目录 `./km-sync-data` 挂到容器 `/data`（已 gitignore，绝不能提交） |
| `docker-entrypoint.py` | 第一次启动生成配置、管理密钥（在日志里显示管理码二维码）；`backup`、`admin-qr`、`new-admin-key` 等命令 |

卷里的内容：`config.json`（配置）、`db/node.db`（密文）、`db/admin.db`（账号、组、注册码、管理密钥、日志）、
`tls/`（https 证书，家里一般没有）、`backups/`、`first-run.txt`（第一次生成的管理码）。

## 一、在家里电脑 / NAS 上装（Linux）

1. 装 Docker（Ubuntu / Debian：`curl -fsSL https://get.docker.com | sh`；群晖 / 威联通 NAS：套件中心装「Container Manager」/「Container Station」）。
2. 路由器里给这台机器**绑定固定的局域网 IP**（例如 192.168.1.20），平板以后都连这个地址。
3. 取代码：`git clone https://github.com/Walker-007-newland/knowledge-map.git`（或把仓库拷过去），进到仓库根目录。
4. 改 `knowledge-map-app/sync-node/docker-compose.yml` 里的 `KM_PUBLIC_HOST` 为上面的 IP。
5. 启动：`docker compose -f knowledge-map-app/sync-node/docker-compose.yml up -d --build`
6. 第一次启动会在日志里画出**管理码**二维码：`docker logs km-sync`，用团队审批 App「节点」页扫码。
   （以后要再看：`docker compose -f … run --rm km-sync admin-qr`）
7. 检查：浏览器或手机打开 `http://192.168.1.20:8787/v1/hello`，能看到 `"node":"km-sync"`。

Windows / Mac 的 Docker Desktop：`network_mode: host` 不可用，按 compose 文件里的注释改成 `ports: ["8787:8787"]`；
这时「局域网自动发现」用不了，平板登录页「服务器」里手动填 `192.168.1.20:8787`。电脑要设成不睡眠、开机自动启动 Docker。

## 二、从腾讯云搬到家里（账号、组、密钥都不丢）

1. **在家里先按第一节装好、但先不要启动**（或启动后 `docker compose down` 并删掉 `km-sync-data/db/` 里新生成的两个库）。
2. 在腾讯云上在线备份（不用停服务；`--backup` 只读打开数据库，不改表结构）：
   ```
   ssh -i ~/.ssh/km_tencent ubuntu@43.142.41.27
   sudo install -d -o kmsync -g kmsync -m 700 /tmp/kmbak
   sudo -u kmsync python3 /opt/km-sync/km_sync_node.py --config /etc/km-sync/config.json --backup /tmp/kmbak
   ```
   服务器上还是 1.3.0（没有 `--backup`）时，先把仓库里新的 `km_sync_node.py` 传到 `/tmp/`，用它跑同一条命令（只读备份，不会升级正在用的库）。
   输出里的目录（`/tmp/kmbak/km-sync-backup-<时间>/`）有 `node.db`、`admin.db`。为了不丢最后几分钟的同步，
   备份前可以先 `sudo systemctl stop km-sync`，备份完再决定是否 `start`。
3. 拷回本机再拷到家里机器：`sudo cp -r /tmp/kmbak /tmp/kmbak2 && sudo chown -R ubuntu /tmp/kmbak2` 后
   `scp -i ~/.ssh/km_tencent "ubuntu@43.142.41.27:/tmp/kmbak2/km-sync-backup-*/*.db" .`，放进家里的 `km-sync-data/db/`；
   拷完删掉服务器上的 `/tmp/kmbak*`（里面是全部数据）。
4. 启动家里的容器。日志里不会出新管理码（管理密钥还是原来那把，在 admin.db 里）。
5. **审批 App**：「节点 → 设置 → 节点地址」改成 `192.168.1.20:8787`（管理密钥不变，不用重新扫码）。
   如果手机上的管理码丢了，`run --rm km-sync new-admin-key` 换一把新的、重新扫。
6. **平板**：已登录的平板在「账号与同步 → 服务器」里改成新地址（同一个 Wi-Fi 下点「自动查找」能找到）；
   新平板在登录页「服务器」里改地址或自动查找。账号、密码、学习记录都不变。
7. 确认平板都同步正常后，腾讯云上 `sudo systemctl stop km-sync && sudo systemctl disable km-sync`，到期不再续费。

搬回云上或换一台机器同理：`backup` 出两个库 → 放进新机器的数据目录 → 启动 → App 里改地址。

## 三、局域网部署的限制和替代

- **没有正式 https 证书**：Let's Encrypt 只给公网能访问到的地址签证书，家里的 192.168.x.x 签不了。所以家里部署时
  **网页后台的 https 版（`https://地址`）不可用**，默认关闭（`KM_HTTPS_PORT=0`）。替代：
  - **审批 App 的「节点」页照常能用**（它走 8787 上的加密管理信封，不需要证书）——账号列表、注册码、重设密码都在这里做。
  - 在跑 Docker 的那台电脑上用浏览器开 `http://localhost:8788`（只监听本机，localhost 是浏览器的安全上下文，网页后台能用）。
  - 别的电脑要用网页后台：`ssh -N -L 8788:127.0.0.1:8788 用户@192.168.1.20`，再开 `http://localhost:8788`。
  - 不要把 8788 暴露到局域网（明文 + 浏览器不认为安全，登录会失败）。
- **8787 是明文 HTTP**（和云上一样）：同步内容和账号包都是端到端加密的，密码不上网；但在同一个 Wi-Fi 里偷听的人能拿到登录挑战，
  可以离线猜密码。所以学生密码要按规则设（8 位以上、字母加数字、不用常见密码）。
- **局域网自动发现**要 `network_mode: host`（Linux）；路由器开了「AP 隔离 / 访客网络」时平板之间、平板和节点之间广播不通，只能手动填地址。
- 改用桥接网络（Docker Desktop、`ports:` 映射）时，节点看到的来源 IP 都是 Docker 网关（如 172.18.0.1）：每 IP 限速、管理接口失败封 IP
  对家里所有设备是一起算的（有人连续输错管理密钥会让全家的管理接口 1 小时不能用，同步不受影响）。能用 host 网络就用 host 网络。
- 第一次启动的日志（`docker logs km-sync`）和卷里的 `first-run.txt` 里有管理码（含管理密钥）：只在这台机器上，别把日志发给别人。
- 国内网络拉镜像、装 pip 包慢：Docker 设镜像加速（腾讯云服务器上是 `/etc/docker/daemon.json` 写 `{"registry-mirrors": ["https://mirror.ccs.tencentyun.com"]}`，
  家里可以用各云厂商公开的加速地址），构建时加 `--build-arg PIP_INDEX_URL=https://mirrors.cloud.tencent.com/pypi/simple`。
- **家里断电 / 机器关机**：已登录的平板照常离线学习，联网后自动补同步；新平板这段时间不能登录。
- 在外面（不在家里 Wi-Fi）时连不到家里的节点，只能回家后同步。要在外面也能同步，得在路由器上做端口转发（有公网 IP 时）或用组网工具，暂不在本期范围。

## 四、日常运维（Docker 版）

| 做什么 | 命令（在仓库根目录，`-f knowledge-map-app/sync-node/docker-compose.yml` 省略为 `-f …`） |
|---|---|
| 看日志 | `docker logs --tail 100 km-sync` |
| 备份 | `docker compose -f … run --rm km-sync backup`（输出在 `km-sync-data/backups/`，可定时任务每天跑一次） |
| 升级程序 | `git pull` 后 `docker compose -f … up -d --build`（数据库表结构自动升级，升级前自动备份 `admin.db.v<旧版本>.bak`） |
| 管理码丢了 | `docker compose -f … run --rm km-sync new-admin-key`，审批 App 重新扫 |
| 把自己锁在外面 | `docker compose -f … run --rm km-sync reset-access` |
| 网页后台密码忘了 | `docker compose -f … run --rm km-sync reset-web-login`，再在审批 App 里设 |
| 停 / 启 | `docker compose -f … stop` / `start` |

## 五、验证记录（2026-10-23，开发）

本机（公司云桌面虚拟机）跑不了 Docker，在腾讯云服务器上验证（Ubuntu 22.04 自带源装 docker.io 29.1 + docker-compose-v2 2.40，
腾讯云镜像加速），用桥接网络、只监听 127.0.0.1 的测试端口，不影响正在跑的 km-sync：

- `docker compose build`、`up -d`：第一次启动生成配置、管理密钥，日志里画出管理码二维码；`/data` 交给 uid 10001，节点进程以 10001 运行；健康检查 healthy
- 经 SSH 隧道跑 `test_node.py --remote`：设备协议、邀请码、换钥、封禁、彻底删除、日志、账号（注册、登录、通行证、停用、清理）全部通过
  （唯一不同：桥接网络下节点看到的来源 IP 是 Docker 网关，不是 127.0.0.1，见第三节）
- `run --rm … backup`、`version`、`admin-qr` 命令可用
- **搬家演练**：用新程序的 `--backup` 只读备份正在跑的 1.3.0 节点 → 两个库放进新卷 → 启动 1.4.0 容器：表结构 4 → 5 自动升级（留 `admin.db.v4.bak`），
  组登记、邀请码和真实节点完全一致，原来的管理密钥照常能用，组数上限 30 自动变 300；真实节点不受影响（仍是 1.3.0、没有多出备份文件）
- 验证完删掉了容器、镜像、测试目录和备份副本；docker 留在服务器上但已停用（`systemctl disable --now docker docker.socket`），要用时 `sudo systemctl enable --now docker`

入口脚本的配置生成、初始化、备份也在电脑上用 `KM_DATA` / `KM_APP` 环境变量跑过。
