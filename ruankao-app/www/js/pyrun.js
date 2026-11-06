// 离线运行 Python：Brython 3.13（vendor/brython，BSD-3-Clause）把 Python 3 编译成 JS 在本页面里执行。
// 第一次运行时才加载（约 5.6 MB 脚本），之后常驻。PyRun.run(code) → Promise<{ out, err }>，out 是标准输出 + 错误信息。
// 注意：和页面同一线程，死循环会卡住页面；练习题都避免 input() 和读写真实文件。
window.PyRun = (function () {
  'use strict';
  let ready = null, seq = 0;
  const api = { base: '' };

  function addScript(src) {
    return new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = () => fail(new Error('加载失败：' + src));
      document.head.appendChild(s);
    });
  }
  api.load = function () {
    if (!ready) {
      ready = addScript(api.base + 'vendor/brython/brython.min.js')
        .then(() => addScript(api.base + 'vendor/brython/brython_stdlib.js'))
        .then(() => { window.brython({ debug: 1 }); });
      ready.catch(() => { ready = null; });
    }
    return ready;
  };
  api.loaded = () => !!(window.__BRYTHON__ && window.__BRYTHON__.runPythonSource);

  // 把用户代码交给 exec 运行；stdout / stderr 都收集起来，异常打印成 Python 的 traceback
  const HARNESS = [
    'import sys, traceback',
    'from browser import window',
    'class _RkOut:',
    '    def __init__(self, err):',
    '        self.err = err',
    '    def write(self, s):',
    '        window.rkPyOut(str(s), self.err)',
    '    def flush(self):',
    '        pass',
    '_old = (sys.stdout, sys.stderr)',
    'sys.stdout = _RkOut(False)',
    'sys.stderr = _RkOut(True)',
    'try:',
    '    exec(compile(window.rkPyCode, "<练习>", "exec"), {"__name__": "__main__"})',
    'except SystemExit:',
    '    pass',
    'except SyntaxError as e:',
    '    print(f"语法错误（第 {e.lineno} 行）：{e.msg}", file=sys.stderr)',
    'except BaseException as e:',
    '    try:',
    '        _tb = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == "<练习>"]',
    '    except Exception:',
    '        _tb = []',
    '    print("Traceback (most recent call last):", file=sys.stderr)',
    '    for _f in _tb:',
    '        print(f"  第 {_f.lineno} 行" + ("" if _f.name == "<module>" else f"，在 {_f.name} 里"), file=sys.stderr)',
    '    print(f"{type(e).__name__}: {e}", file=sys.stderr)',
    'finally:',
    '    sys.stdout, sys.stderr = _old'
  ].join('\n');

  api.run = function (code) {
    return api.load().then(() => {
      let out = '', err = false;
      window.rkPyOut = (s, e) => { out += s; if (e) err = true; };
      window.rkPyCode = String(code).replace(/\t/g, '    ');
      try {
        window.__BRYTHON__.runPythonSource(HARNESS, 'rkrun' + (++seq));
      } catch (e) {
        out += '\n' + (e && e.message ? e.message : String(e));
        err = true;
      }
      return { out, err };
    });
  };
  // 比对输出：忽略每行行尾空格和末尾空行
  api.same = (a, b) => {
    const n = s => String(s).replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
    return n(a) === n(b);
  };
  return api;
})();
