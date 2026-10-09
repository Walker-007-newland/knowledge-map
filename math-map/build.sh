#!/bin/sh
# 生成可以直接双击打开的 index.html（page.html 是发布用的正文）
cd "$(dirname "$0")"
{ printf '<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n'; cat page.html; printf '\n</body>\n</html>\n'; } > index.html
