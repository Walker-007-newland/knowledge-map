# km-sync 同步节点的 Docker 镜像（1.4.0，#12「服务器可搬家」）
# 构建上下文是仓库根目录（网页后台要用审批 App 的 node.js / node.css），所以用 docker-compose.yml 里的写法构建：
#   docker compose -f knowledge-map-app/sync-node/docker-compose.yml up -d --build
# 数据（数据库、证书、配置）全在卷 /data 里，搬家时拷走这个卷即可。详见 DOCKER.md。
FROM python:3.12-slim

# 国内网络装 pip 包慢时：docker compose build --build-arg PIP_INDEX_URL=https://mirrors.cloud.tencent.com/pypi/simple
ARG PIP_INDEX_URL=
# cryptography：管理接口和账号接口的 AES-GCM；qrcode：第一次启动时在日志里画管理码（纯文字二维码，不需要图片库）
RUN pip install --no-cache-dir ${PIP_INDEX_URL:+--index-url "$PIP_INDEX_URL"} "cryptography>=41,<46" "qrcode>=7.4,<9" \
 && useradd --system --uid 10001 --home-dir /data --shell /usr/sbin/nologin kmsync \
 && mkdir -p /app/web/vendor /data && chown kmsync:kmsync /data

WORKDIR /app
COPY knowledge-map-app/sync-node/km_sync_node.py knowledge-map-app/sync-node/docker-entrypoint.py /app/
COPY knowledge-map-app/sync-node/web/index.html knowledge-map-app/sync-node/web/web.js knowledge-map-app/sync-node/web/web.css /app/web/
COPY team-admin-app/www/node.js team-admin-app/www/node.css /app/web/
COPY team-admin-app/www/vendor/qrcode.js team-admin-app/www/vendor/jsQR.js /app/web/vendor/

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
# 以 root 启动只是为了把挂进来的 /data 交给 kmsync；入口脚本随即降成 kmsync（uid 10001）运行节点
VOLUME ["/data"]
# 8787/tcp 设备同步 + 审批 App；8787/udp 局域网发现；8443 网页后台 https（有证书时）；8788 网页后台明文（只给本机浏览器）
EXPOSE 8787/tcp 8787/udp 8443/tcp 8788/tcp
HEALTHCHECK --interval=60s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8787/v1/hello', timeout=4).status == 200 else 1)"
ENTRYPOINT ["python", "/app/docker-entrypoint.py"]
