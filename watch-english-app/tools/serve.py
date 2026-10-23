"""浏览器调试用的本地服务：www 目录，不缓存（改完代码刷新就是新的）。用法：python tools/serve.py [端口]"""
import functools
import http.server
import os
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'www')
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8785
    http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(NoCache, directory=root)).serve_forever()
