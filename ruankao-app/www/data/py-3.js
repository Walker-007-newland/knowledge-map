// AI 路线 阶段 py（Python 编程）组 C：异常与文件 / JSON、模块与标准库、闭包装饰器上下文管理器、NumPy 与 pandas 入门
RK.ai.nodes.push(

/* ======================= py 异常与文件、JSON ======================= */
{
  id: 'py-error', stage: 'py', title: '异常与文件、JSON', short: '异常文件JSON',
  keywords: 'Python 异常 try except else finally raise 自定义异常 with 语句 文件 open 编码 encoding utf-8 pathlib Path json dumps loads dump load ensure_ascii',
  prereqs: ['py-oop'],
  tip: '只捕获你知道怎么处理的异常；打开文件一律用 with 并写明 encoding="utf-8"；JSON 和字典互转用 json.loads / dumps。',
  learn: [
    { h: 'try / except / else / finally', html: `
<p>Python 用<b>异常</b>报告错误：出错时抛出一个异常对象，沿调用栈向上找能处理它的 except；一直没人处理，程序就打印 traceback 退出。</p>
<pre><code>try:
    n = int(text)               # 可能出错的代码尽量少放
except ValueError as e:         # 只捕获预料到的那种异常
    print("不是数字:", e)
except (TypeError, KeyError):   # 多种异常一起处理
    print("类型或键错误")
else:
    print("没出错才执行:", n)
finally:
    print("无论如何都执行")      # 常用于释放资源</code></pre>
<table class="tbl"><tr><th>段</th><th>什么时候执行</th></tr>
<tr><td>except</td><td>try 里抛出了匹配的异常（从上往下匹配第一个）</td></tr>
<tr><td>else</td><td>try 里<b>没有</b>抛异常</td></tr>
<tr><td>finally</td><td>总会执行，哪怕 try 里 return 了或异常没被捕获</td></tr></table>
<p>Python 的习惯是 <b>EAFP</b>（先做，出错再处理），而不是事先检查一大堆条件：比如直接 <code>int(s)</code> 再捕获 ValueError，比先判断 s 是否全是数字更简洁、覆盖更全。</p>
<p class="warn">坑：裸写 <code>except:</code> 或 <code>except Exception: pass</code> 会把拼写错误、程序 bug 也一起吞掉，出了问题毫无线索。至少要记录日志；子类异常要写在父类前面，否则永远匹配不到。</p>` },
    { h: 'raise 与自定义异常', html: `
<p>发现无法继续的情况时主动 <code>raise</code>：参数不合法用 ValueError / TypeError，找不到用 KeyError / LookupError 等内置异常；业务错误可以自定义异常类。</p>
<pre><code>class AppError(Exception):          # 项目自己的异常基类
    pass

class InsufficientFunds(AppError):
    pass

def withdraw(balance, amount):
    if amount &lt;= 0:
        raise ValueError("金额必须为正")
    if amount &gt; balance:
        raise InsufficientFunds(f"余额 {balance} 不足")
    return balance - amount</code></pre>
<ul><li>自定义异常继承 <code>Exception</code>（不要继承 BaseException），建一个项目基类，调用方可以一次捕获全部业务错误</li>
<li>在 except 里写单独的 <code>raise</code>：处理一部分（如记日志）后把<b>原异常</b>继续抛出</li>
<li><code>raise ConfigError("配置坏了") from e</code>：转换成更有意义的异常，同时保留原因链，traceback 里两者都看得到</li></ul>
<div class="key">原则：在<b>知道怎么处理</b>的那一层捕获（如接口入口统一返回错误信息）；底层函数只管抛，不要层层 try 再吞掉。</div>` },
    { h: 'with 语句与读写文件', html: `
<p><code>with</code> 保证代码块结束时自动清理资源（关文件、释放锁），即使中途抛了异常也一样。读写文件都应该这样写：</p>
<pre><code>with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("第一行\\n")

with open("notes.txt", encoding="utf-8") as f:
    for line in f:              # 逐行读，大文件也不占内存
        print(line.rstrip("\\n"))</code></pre>
<table class="tbl"><tr><th>模式</th><th>含义</th></tr>
<tr><td>"r"（默认）</td><td>读；文件不存在抛 FileNotFoundError</td></tr>
<tr><td>"w"</td><td>写；文件已存在会<b>先清空</b></td></tr>
<tr><td>"a"</td><td>追加到末尾</td></tr>
<tr><td>加 "b"（如 "rb"）</td><td>二进制，读写 bytes，不做编码转换</td></tr></table>
<p><b>pathlib</b> 用对象表示路径，比拼字符串更清楚、跨平台：</p>
<pre><code>from pathlib import Path
p = Path("data") / "2026" / "a.csv"   # 用 / 拼路径
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text("x,y\\n1,2\\n", encoding="utf-8")
print(p.name, p.stem, p.suffix, p.exists())  # a.csv a .csv True
for f in Path("data").rglob("*.csv"):  # 递归找文件
    print(f)</code></pre>
<p class="warn">坑：不写 encoding 时按系统默认编码，中文 Windows 上常常不是 UTF-8，同一份代码换台电脑就乱码或报 UnicodeDecodeError。读写文本<b>一律写明 encoding="utf-8"</b>。</p>` },
    { h: 'JSON：dumps / loads', html: `
<p>JSON 是 API 和配置最常用的格式。Python 的 <code>json</code> 模块在 JSON 文本和字典 / 列表之间转换：</p>
<pre><code>import json
s = json.dumps({"name": "小明", "tags": ["a"]}, ensure_ascii=False, indent=2)
obj = json.loads('{"ok": true, "n": null}')   # {'ok': True, 'n': None}

with open("cfg.json", "w", encoding="utf-8") as f:
    json.dump(obj, f, ensure_ascii=False)     # 不带 s 的版本直接读写文件
with open("cfg.json", encoding="utf-8") as f:
    cfg = json.load(f)</code></pre>
<table class="tbl"><tr><th>Python</th><th>JSON</th></tr>
<tr><td>dict / list、tuple</td><td>对象 / 数组（tuple 变成数组）</td></tr>
<tr><td>True / False / None</td><td>true / false / null</td></tr>
<tr><td>字典的 int 键</td><td>变成字符串键，读回来是 "1" 不是 1</td></tr></table>
<ul><li><code>ensure_ascii=False</code>：中文原样输出，否则变成 \\uXXXX 形式的转义</li>
<li>datetime、set、自定义对象默认不能序列化，会抛 TypeError；可以先转成字符串 / 列表，或传 <code>default=str</code></li>
<li>解析不合法的文本抛 <code>json.JSONDecodeError</code>（ValueError 的子类）。处理大模型返回的“JSON”时一定要捕获它</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: `下面代码运行后会打印什么？<pre><code>def f():
    try:
        return "try"
    finally:
        print("finally")
print(f())</code></pre>`,
      options: ['先打印 finally，再打印 try', '只打印 try', '只打印 finally', '先打印 try，再打印 finally'], answer: 0,
      explain: 'finally 一定会执行，即使 try 里已经 return。函数在真正返回前先执行 finally 里的 print，随后 print(f()) 才打印返回值 try。' },
    { type: 'choice', q: '一个接口函数要解析用户上传的配置文本，内容可能不是合法 JSON。下列写法最合适的是（　）。',
      options: ['用 try 包住 json.loads，捕获 json.JSONDecodeError 后返回明确的错误提示', '用 try 包住整个函数，except Exception: pass', '先用正则判断文本是不是合法 JSON，再调用 json.loads', '不处理，让程序崩溃后看日志'], answer: 0,
      explain: '只捕获预期的异常并给出明确提示最合适。except Exception: pass 会吞掉所有 bug；用正则判断 JSON 合法性既复杂又不可靠；直接崩溃对接口调用方不友好。' },
    { type: 'choice', q: '要把一个包含中文的字典写成 UTF-8 编码的 JSON 文件，并让文件里中文直接可读。较好的写法是（　）。',
      options: ['with open(p, "w", encoding="utf-8") as f: json.dump(d, f, ensure_ascii=False)', 'f = open(p, "w"); f.write(str(d))', 'with open(p, "w") as f: json.dump(d, f)', 'json.dumps(d) 后用 print 输出到屏幕'], answer: 0,
      explain: '用 with 自动关闭文件，写明 UTF-8 编码，ensure_ascii=False 让中文原样写出。str(d) 得到的是 Python 字面量（单引号、True/None），不是合法 JSON；不写编码在中文 Windows 上可能不是 UTF-8。' }
  ],
  tests: [
    { type: 'choice', q: 'try / except / else / finally 结构中，else 段在什么时候执行？',
      options: ['try 段没有抛出任何异常时', 'try 段抛出异常且被捕获后', '无论是否出异常都执行', '只有在 finally 执行之后'], answer: 0,
      explain: 'else 只在 try 没有异常时执行，适合放“成功后才做”的代码，避免把它们也放进 try 里被误捕获。无论如何都执行的是 finally，而且 else 在 finally 之前。' },
    { type: 'choice', q: `下面的代码有什么问题？<pre><code>try:
    data = load()
except Exception:
    print("通用错误")
except FileNotFoundError:
    print("文件不存在")</code></pre>`,
      options: ['FileNotFoundError 是 Exception 的子类，永远被第一个 except 截走，第二个分支执行不到', '语法错误，不能写两个 except', 'FileNotFoundError 不能被捕获', '没有问题，两个分支都可能执行'], answer: 0,
      explain: 'except 从上往下匹配第一个符合的。Exception 是几乎所有异常的父类，放在前面会把更具体的异常也截走。应把子类写在前面。' },
    { type: 'choice', q: '在 except 块里只写一个 <code>raise</code>（后面不跟任何东西）的作用是（　）。',
      options: ['把当前正在处理的异常原样重新抛出', '抛出一个空的新异常', '结束整个程序', '忽略这个异常继续执行'], answer: 0,
      explain: '裸 raise 重新抛出正在处理的那个异常，常用于“先记日志或清理，再交给上层处理”。' },
    { type: 'choice', q: '项目需要定义自己的业务异常。下列做法最合适的是（　）。',
      options: ['定义一个继承 Exception 的基类 AppError，各业务异常再继承它', '所有业务错误都用字符串返回，不用异常', '让自定义异常直接继承 BaseException', '每个函数都 raise Exception("...")，用消息文字区分'], answer: 0,
      explain: '项目基类让调用方可以一次捕获所有业务错误，也能按子类分别处理。BaseException 还包括 KeyboardInterrupt、SystemExit，一般代码不应继承它；全用 Exception 加文字区分无法按类型精确捕获。' },
    { type: 'choice', q: '用 <code>open(path, "w", encoding="utf-8")</code> 打开一个已经有内容的文件并写入一行，结果是（　）。',
      options: ['原内容被清空，文件里只剩新写的内容', '新内容追加到原内容末尾', '抛出 FileExistsError', '新内容插入到文件开头，原内容保留'], answer: 0,
      explain: '"w" 模式打开时会先清空文件。要追加用 "a"；要求文件必须不存在用 "x"。' },
    { type: 'choice', q: '用 with 打开文件相比手动 open / close，最主要的好处是（　）。',
      options: ['离开 with 块时自动关闭文件，即使块里抛了异常也会关闭', '读写速度更快', '可以不写文件名', '能自动识别文件编码'], answer: 0,
      explain: 'with 通过上下文管理器保证资源一定被释放。手动 close 在中途出异常时可能执行不到。它不会提速，也不会自动识别编码。' },
    { type: 'choice', q: '执行 <code>json.loads(json.dumps({1: "a", "t": (1, 2)}))</code> 得到的结果是（　）。',
      options: ['{"1": "a", "t": [1, 2]}', '{1: "a", "t": (1, 2)}', '{1: "a", "t": [1, 2]}', '抛出 TypeError'], answer: 0,
      explain: 'JSON 对象的键只能是字符串，int 键 1 被转成 "1"；JSON 没有元组，tuple 被写成数组，读回来变成 list。所以 JSON 往返后数据不一定和原来完全相同。' },
    { type: 'choice', q: '用 json.dumps 序列化一个含 datetime 对象的字典时报 TypeError。下列处理方法<b>不</b>合适的是（　）。',
      options: ['用 str(d) 把整个字典转成字符串存起来，当作 JSON 使用', '先把 datetime 转成 ISO 格式字符串再序列化', '调用 json.dumps(d, default=str)', '写一个函数把对象转换成可序列化的字典'], answer: 0,
      explain: 'str(d) 得到的是 Python 的字面量表示（单引号、datetime.datetime(...)），不是合法 JSON，别的程序无法解析。其他三种都是常见的正确做法。' },
    { type: 'choice', q: '使用 pathlib 时，<code>Path("data") / "2026" / "a.csv"</code> 的作用是（　）。',
      options: ['按当前系统的规则拼接出路径 data/2026/a.csv，不会真的创建文件', '把三个字符串相除，会抛异常', '立即在磁盘上创建这个文件', '读取 a.csv 的内容'], answer: 0,
      explain: 'Path 重载了 / 运算符用来拼路径，只是生成路径对象，不访问磁盘。创建目录要 mkdir，写文件要 write_text 等。' }
  ],
  exercises: [
    {"q": "把列表里的字符串转成整数并求和：能转的累加；转不了的（如 <code>\"abc\"</code>、<code>\"\"</code>）打印 <code>跳过: '原字符串'</code>（用 <code>!r</code>）。最后打印 <code>合计: 数字</code>。只捕获 <code>ValueError</code>。", "starter": "items = [\"10\", \"abc\", \"25\", \"\", \"7\"]\ntotal = 0\nfor s in items:\n    # TODO: 用 try / except ValueError 包住转换，转不了时打印“跳过: 'xxx'”\n    total += 0\nprint(f\"合计: {total}\")\n", "answer": "items = [\"10\", \"abc\", \"25\", \"\", \"7\"]\ntotal = 0\nfor s in items:\n    try:\n        total += int(s)\n    except ValueError:\n        print(f\"跳过: {s!r}\")\nprint(f\"合计: {total}\")\n", "expect": "跳过: 'abc'\n跳过: ''\n合计: 42\n"},
    {"q": "补全 <code>divide</code>：用 try / except / else / finally 四段，分别打印 <code>除零</code>、<code>结果 = 商</code>、<code>结束</code>，体会每段什么时候执行。分别调用 <code>divide(6, 3)</code> 和 <code>divide(1, 0)</code>。", "starter": "def divide(a, b):\n    try:\n        r = a / b\n    except ZeroDivisionError:\n        print(\"除零\")\n    # TODO: else 段打印“结果 = r”，finally 段打印“结束”\n\ndivide(6, 3)\ndivide(1, 0)\n", "answer": "def divide(a, b):\n    try:\n        r = a / b\n    except ZeroDivisionError:\n        print(\"除零\")\n    else:\n        print(f\"结果 = {r}\")\n    finally:\n        print(\"结束\")\n\ndivide(6, 3)\ndivide(1, 0)\n", "expect": "结果 = 2.0\n结束\n除零\n结束\n"},
    {"q": "定义自定义异常 <code>InsufficientFunds</code>（继承 <code>Exception</code>），在 <code>withdraw</code> 里余额不足时 <code>raise</code> 它，消息为 <code>余额 x 不足以支取 y</code>；金额不是正数时 <code>raise ValueError(\"金额必须为正\")</code>。调用处分别捕获两种异常并打印消息。", "starter": "class InsufficientFunds(Exception):\n    pass\n\ndef withdraw(balance, amount):\n    # TODO: amount <= 0 时抛 ValueError；余额不足时抛 InsufficientFunds\n    return balance - amount\n\nfor amt in [30, 200, -5]:\n    try:\n        print(\"剩余\", withdraw(100, amt))\n    except InsufficientFunds as e:\n        print(\"余额不足:\", e)\n    except ValueError as e:\n        print(\"参数错误:\", e)\n", "answer": "class InsufficientFunds(Exception):\n    pass\n\ndef withdraw(balance, amount):\n    if amount <= 0:\n        raise ValueError(\"金额必须为正\")\n    if amount > balance:\n        raise InsufficientFunds(f\"余额 {balance} 不足以支取 {amount}\")\n    return balance - amount\n\nfor amt in [30, 200, -5]:\n    try:\n        print(\"剩余\", withdraw(100, amt))\n    except InsufficientFunds as e:\n        print(\"余额不足:\", e)\n    except ValueError as e:\n        print(\"参数错误:\", e)\n", "expect": "剩余 70\n余额不足: 余额 100 不足以支取 200\n参数错误: 金额必须为正\n"},
    {"q": "用 <code>io.StringIO</code> 模拟一个“每行一条 JSON”的日志文件，在 with 块里逐行用 <code>json.loads</code> 解析，按用户名累加 <code>score</code>。缺少 <code>score</code> 字段的记录会抛 <code>KeyError</code>：捕获它、计入坏记录数并跳过。最后用 <code>json.dumps(结果, ensure_ascii=False)</code> 打印汇总字典，再打印坏记录数。", "starter": "import io, json\n\ndata = io.StringIO('''{\"user\": \"小明\", \"score\": 3}\n{\"user\": \"小红\", \"score\": 5}\n{\"user\": \"小刚\"}\n{\"user\": \"小明\", \"score\": 4}\n''')\n\ntotals = {}\nbad = 0\nwith data as f:\n    for line in f:\n        line = line.strip()\n        if not line:\n            continue\n        rec = json.loads(line)\n        # TODO: 按 rec[\"user\"] 累加 rec[\"score\"]；缺 score（KeyError）时 bad += 1 并跳过\nprint(json.dumps(totals, ensure_ascii=False))\nprint(\"坏记录:\", bad)\n", "answer": "import io, json\n\ndata = io.StringIO('''{\"user\": \"小明\", \"score\": 3}\n{\"user\": \"小红\", \"score\": 5}\n{\"user\": \"小刚\"}\n{\"user\": \"小明\", \"score\": 4}\n''')\n\ntotals = {}\nbad = 0\nwith data as f:\n    for line in f:\n        line = line.strip()\n        if not line:\n            continue\n        rec = json.loads(line)\n        try:\n            score = rec[\"score\"]\n        except KeyError:\n            bad += 1\n            continue\n        totals[rec[\"user\"]] = totals.get(rec[\"user\"], 0) + score\nprint(json.dumps(totals, ensure_ascii=False))\nprint(\"坏记录:\", bad)\n", "expect": "{\"小明\": 7, \"小红\": 5}\n坏记录: 1\n"}
  ] /*EX:py-error*/,
  handson: [
    '写一个脚本：用 pathlib 遍历某个目录下所有 .txt 文件（rglob），统计每个文件的行数，结果用 json.dump(..., ensure_ascii=False, indent=2) 写进 summary.json。故意放一个 GBK 编码的文件进去，观察 UnicodeDecodeError，并用 try / except 让它记录为“读取失败”而不中断整个统计。',
    '给上面的脚本定义 ScanError(Exception)，目录不存在时 raise ScanError("...") from 原异常；在入口处捕获它并打印友好提示，确认 traceback 里能看到原因链（去掉入口的捕获再运行一次看看）。',
    '把一段大模型返回的“JSON”（故意在前后加上 Markdown 代码块标记，或者缺一个括号）交给 json.loads，写一个 parse_json(text) 函数：先去掉包裹，再解析，失败时抛出带原文片段的自定义异常。准备 4 种输入各测一次。'
  ],
  links: [{ t: 'Python 官方教程（中文）：第 7 章输入输出、第 8 章错误和异常', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
},

/* ======================= py 模块、包与标准库 ======================= */
{
  id: 'py-module', stage: 'py', title: '模块、包与标准库', short: '模块与标准库',
  keywords: 'Python import from as 模块 包 __init__.py __name__ __main__ sys.path 相对导入 标准库 math random datetime timedelta collections itertools re 正则',
  prereqs: ['py-error'],
  tip: '一个 .py 文件就是一个模块；入口代码放进 if __name__ == "__main__":；先查标准库，很多事不用装第三方包。',
  learn: [
    { h: 'import 的几种写法', html: `
<p>一个 <code>.py</code> 文件就是一个<b>模块</b>；import 时 Python 执行该文件一次，把里面的函数、类、变量放进模块对象。</p>
<pre><code>import math                   # 用时写 math.sqrt(2)
from math import sqrt, pi     # 直接用 sqrt(2)
import numpy as np            # 起别名，社区约定俗成
from collections import Counter as C
from os import *              # 不推荐：不知道导入了什么，还可能覆盖同名变量</code></pre>
<ul><li>同一个模块只在<b>第一次</b> import 时执行，之后从缓存（<code>sys.modules</code>）直接拿；所以模块顶层不要放耗时或有副作用的代码</li>
<li>查找顺序：当前脚本所在目录 → 环境变量 PYTHONPATH → 标准库 → 已安装的第三方包（都记录在 <code>sys.path</code>）</li></ul>
<p class="warn">经典坑：把自己的文件命名成 <code>random.py</code>、<code>json.py</code>、<code>numpy.py</code>，脚本目录排在前面，于是 <code>import random</code> 导入的是你自己的文件，报出“没有 randint 属性”之类莫名其妙的错。文件名不要和标准库或常用库重名。</p>` },
    { h: '__name__ 与包', html: `
<p>每个模块都有变量 <code>__name__</code>：<b>直接运行</b>时它是 <code>"__main__"</code>，<b>被导入</b>时是模块名。所以入口代码这样写，文件既能当脚本运行，又能被别的文件导入而不执行入口：</p>
<pre><code>def word_count(text):
    return len(text.split())

def main():
    print(word_count("hello world"))

if __name__ == "__main__":
    main()</code></pre>
<p><b>包</b>是包含模块的目录，通常带一个 <code>__init__.py</code>（可以为空，导入包时会执行它）：</p>
<pre><code>myapp/
    __init__.py
    utils.py
    service/
        __init__.py
        order.py      # 里面写 from ..utils import fmt（相对导入）</code></pre>
<ul><li>绝对导入：<code>from myapp.utils import fmt</code>，清楚，推荐</li>
<li>相对导入：<code>from . import utils</code>、<code>from ..utils import fmt</code>，只能用在包内部的模块里</li>
<li>运行包里的模块用 <code>python -m myapp.service.order</code>（在项目根目录执行），直接 <code>python myapp/service/order.py</code> 时相对导入会失败</li></ul>` },
    { h: '常用标准库', html: `
<p>Python 号称“自带电池”。先查标准库，再考虑第三方包：</p>
<table class="tbl"><tr><th>模块</th><th>常用内容</th></tr>
<tr><td>math</td><td>sqrt、ceil / floor、gcd、hypot、pi、isclose（比较浮点数）</td></tr>
<tr><td>random</td><td>randint(a, b)（两端都包含）、choice、shuffle、sample、seed（固定随机序列，便于复现）</td></tr>
<tr><td>datetime</td><td>date、datetime、timedelta；日期相减得 timedelta；strftime 格式化、strptime 解析</td></tr>
<tr><td>collections</td><td>Counter 计数、defaultdict、deque 双端队列、namedtuple</td></tr>
<tr><td>itertools</td><td>chain 连接、combinations / permutations / product、groupby（需先排序）、islice、accumulate</td></tr>
<tr><td>其他</td><td>functools（wraps、lru_cache）、pathlib、json、csv、os、sys、logging</td></tr></table>
<pre><code>from datetime import date, timedelta
d = date(2026, 11, 6) + timedelta(days=30)
print(d.strftime("%Y-%m-%d"))          # 2026-12-06</code></pre>
<p class="warn">random 模块的随机数可预测，不能用于生成密码、令牌；安全用途用 <code>secrets</code> 模块。datetime 分“带时区”和“不带时区”两种，两者不能直接比较，跨时区的系统统一用带时区的时间。</p>` },
    { h: 're 正则表达式简介', html: `
<p><code>re</code> 模块用于按模式查找、提取、替换文本。模式写成<b>原始字符串</b> <code>r"..."</code>，避免反斜杠被转义两次。</p>
<table class="tbl"><tr><th>函数</th><th>作用</th></tr>
<tr><td>re.search</td><td>在任意位置找第一个匹配，返回 Match 或 None</td></tr>
<tr><td>re.match / fullmatch</td><td>只从开头匹配 / 要求整串匹配（做格式校验用 fullmatch）</td></tr>
<tr><td>re.findall</td><td>所有匹配组成的列表（有分组时返回分组内容）</td></tr>
<tr><td>re.sub</td><td>替换，替换串里用 \\1、\\2 引用分组</td></tr></table>
<pre><code>import re
m = re.search(r"(\\d{4})-(\\d{2})", "日期 2026-11")
if m:
    print(m.group(1), m.group(2))   # 2026 11
print(re.findall(r"\\d+", "a1b22c333"))   # ['1', '22', '333']</code></pre>
<ul><li>常用元素：<code>\\d</code> 数字、<code>\\w</code> 字母数字下划线、<code>\\s</code> 空白、<code>.</code> 任意字符、<code>* + ? {m,n}</code> 次数、<code>^</code> 开头、<code>$</code> 结尾</li>
<li><code>.*</code> 默认<b>贪婪</b>（尽量多匹配），<code>.*?</code> 是非贪婪</li>
<li>同一模式反复使用可以 <code>re.compile</code> 一次</li></ul>
<div class="key">正则适合格式规整的小段文本；解析 HTML、JSON 这类有嵌套结构的内容，用专门的解析器。</div>` }
  ],
  examples: [
    { type: 'choice', q: '你在项目里新建了 random.py 做抽奖功能，在另一个文件里 <code>import random</code> 后调用 random.randint 报错“没有 randint 属性”。最可能的原因是（　）。',
      options: ['自己的 random.py 和标准库同名，脚本目录排在搜索路径前面，导入的是你自己的文件', '标准库 random 被卸载了', 'randint 在新版 Python 中被删除了', '必须写 from random import * 才能用'], answer: 0,
      explain: '模块搜索时当前脚本所在目录排在标准库前面，同名文件会“遮住”标准库。改掉文件名（并删除对应的 __pycache__ 缓存）即可。' },
    { type: 'choice', q: '文件 tools.py 末尾直接写了 <code>main()</code> 调用。另一个文件只是想 <code>from tools import parse</code>，结果一导入就把 main 跑了一遍。正确的改法是（　）。',
      options: ['把调用改成 if __name__ == "__main__": main()', '把 import 写在函数里面', '改成 import tools', '删掉 tools.py 里的 main 函数'], answer: 0,
      explain: 'import 时会执行模块顶层代码。把入口调用放进 __name__ 判断后，只有直接运行 tools.py 时才执行 main；被导入时 __name__ 是 "tools"，不会执行。换导入写法不能阻止顶层代码执行。' },
    { type: 'choice', q: '要校验用户输入的整串是否为 6 位数字（如 "123456"），用 re 模块最合适的是（　）。',
      options: ['re.fullmatch(r"\\d{6}", s)', 're.search(r"\\d{6}", s)', 're.match(r"\\d{6}", s)', 're.findall(r"\\d", s)'], answer: 0,
      explain: 'fullmatch 要求整串都匹配。search 在 "abc1234567" 里也能找到 6 位数字；match 只锚定开头，"1234567" 也会通过；findall 只是把数字找出来，不做校验。' }
  ],
  tests: [
    { type: 'choice', q: '在同一个程序里，两个不同的文件都 <code>import config</code>，config.py 顶层有一句 print("加载配置")。这句会打印几次？',
      options: ['1 次，第二次 import 直接用 sys.modules 里缓存的模块', '2 次，每次 import 都重新执行', '0 次，import 不执行模块代码', '取决于导入的先后顺序，可能 1 次也可能 2 次'], answer: 0,
      explain: '模块只在第一次导入时执行，之后从 sys.modules 缓存取。这也是模块可以充当“单例”存放共享配置的原因。' },
    { type: 'choice', q: '关于 <code>from os import *</code>，下列说法正确的是（　）。',
      options: ['会把模块的大量名字导入当前命名空间，可能悄悄覆盖同名变量，一般不推荐', '比 import os 运行更快，推荐使用', '只导入 os 里的类', '会导入 os 的所有子模块'], answer: 0,
      explain: '星号导入让读代码的人不知道某个名字从哪来，还可能覆盖已有的同名变量或函数。明确写出要导入的名字更好。' },
    { type: 'choice', q: '包 shop 里的模块 shop/order.py 写了 <code>from .utils import fmt</code>。在项目根目录下，能正常运行它的方式是（　）。',
      options: ['python -m shop.order', 'python shop/order.py', 'cd shop 后 python order.py', '把 order.py 复制到桌面再运行'], answer: 0,
      explain: '相对导入依赖模块“属于哪个包”。用 -m 按包路径运行，Python 才知道 order 属于 shop 包；直接运行文件时它被当作顶层脚本，相对导入失败。' },
    { type: 'fill', q: '让文件被直接运行时才执行 main()：<code>if __name__ == "______":</code>（填引号里的内容）',
      answer: ['__main__'], explain: '直接运行时 __name__ 是 "__main__"，被导入时是模块名。' },
    { type: 'choice', q: '<code>random.randint(1, 6)</code> 可能返回的值是（　）。',
      options: ['1 到 6 的整数，两端都包含', '1 到 5 的整数', '0 到 6 的整数', '1 到 6 之间的小数'], answer: 0,
      explain: 'randint(a, b) 两端都包含，这和 range(1, 6) 不含右端不同，是常见混淆点。要小数用 random.random() 或 uniform。' },
    { type: 'choice', q: '要为用户生成一个重置密码用的随机令牌，应使用（　）。',
      options: ['secrets 模块，如 secrets.token_urlsafe()', 'random.randint 拼出一串数字', '当前时间戳转字符串', 'random.seed(固定值) 后再生成'], answer: 0,
      explain: 'random 是伪随机，可被预测，适合模拟和测试；安全相关的随机值用 secrets。时间戳更容易猜；固定种子会让每次结果都一样。' },
    { type: 'choice', q: '用 <code>itertools.groupby</code> 按城市对一组订单分组，发现同一个城市被分成了好几组。原因是（　）。',
      options: ['groupby 只把相邻的相同键分到一组，需要先按同一个键排序', 'groupby 有 bug，应改用 Counter', '城市名里有空格', 'groupby 只能处理数字'], answer: 0,
      explain: 'groupby 只合并连续的相同键。先 sorted(data, key=同一个函数) 再分组；或者直接用 defaultdict(list) 收集。' },
    { type: 'choice', q: '<code>re.findall(r"&lt;.*&gt;", "&lt;a&gt;&lt;b&gt;")</code> 的结果是（　）。',
      options: ["['&lt;a&gt;&lt;b&gt;']", "['&lt;a&gt;', '&lt;b&gt;']", "['a', 'b']", '[]'], answer: 0,
      explain: '.* 是贪婪的，会从第一个 &lt; 一直匹配到最后一个 &gt;。想分别得到 &lt;a&gt; 和 &lt;b&gt;，用非贪婪的 .*? 。' },
    { type: 'choice', q: '计算两个日期 <code>date(2027, 1, 10)</code> 和 <code>date(2026, 12, 31)</code> 相差几天，正确的写法是（　）。',
      options: ['(date(2027, 1, 10) - date(2026, 12, 31)).days', 'date(2027, 1, 10).day - date(2026, 12, 31).day', 'int(date(2027, 1, 10)) - int(date(2026, 12, 31))', 'date(2027, 1, 10).days - date(2026, 12, 31).days'], answer: 0,
      explain: '两个 date 相减得到 timedelta，取 .days 得天数（这里是 10）。.day 是“几号”，直接相减会得到 10 - 31 = -21；date 不能转 int，也没有 .days 属性。' }
  ],
  exercises: [
    {"q": "用 <code>math</code> 模块计算并打印：直角边 3 和 4 的斜边（<code>math.hypot</code>）、12 和 18 的最大公约数（<code>math.gcd</code>）、7 / 2 向上取整（<code>math.ceil</code>），以及圆周率保留 4 位小数。", "starter": "import math\n\nprint(0)  # TODO: 斜边\nprint(0)  # TODO: 最大公约数\nprint(0)  # TODO: 向上取整\nprint(f\"{0:.4f}\")  # TODO: 圆周率\n", "answer": "import math\n\nprint(math.hypot(3, 4))\nprint(math.gcd(12, 18))\nprint(math.ceil(7 / 2))\nprint(f\"{math.pi:.4f}\")\n", "expect": "5.0\n6\n4\n3.1416\n"},
    {"q": "用 <code>datetime</code> 算日期（日期写死，不取当前时间）：2026-11-06 距 2027-05-22 还有多少天；2026-11-06 加 100 天是哪天（格式 <code>年-月-日</code>）；那天是星期几（<code>weekday()</code>：0 是星期一）。", "starter": "from datetime import date, timedelta\n\ntoday = date(2026, 11, 6)\nexam = date(2027, 5, 22)\nprint(\"还有\", 0, \"天\")  # TODO: 两个日期相减得到 timedelta，取 .days\nlater = today  # TODO: 加 100 天\nprint(later.strftime(\"%Y-%m-%d\"))\nprint(\"星期\", \"一二三四五六日\"[later.weekday()])\n", "answer": "from datetime import date, timedelta\n\ntoday = date(2026, 11, 6)\nexam = date(2027, 5, 22)\nprint(\"还有\", (exam - today).days, \"天\")\nlater = today + timedelta(days=100)\nprint(later.strftime(\"%Y-%m-%d\"))\nprint(\"星期\", \"一二三四五六日\"[later.weekday()])\n", "expect": "还有 197 天\n2027-02-14\n星期 日\n"},
    {"q": "用 <code>itertools</code>：(1) <code>chain</code> 把三个列表连成一个；(2) <code>combinations</code> 列出从 A、B、C、D 里选 2 个的所有组合，打印个数；(3) <code>accumulate</code> 求每天销量的累计值。", "starter": "from itertools import chain, combinations, accumulate\n\na, b, c = [1, 2], [3], [4, 5]\nprint(a + b + c)  # TODO: 改用 chain，并转成 list\n\npairs = []  # TODO: 用 combinations(\"ABCD\", 2)，拼成 \"AB\" 这样的字符串\nprint(pairs, len(pairs))\n\nsales = [3, 5, 2, 6]\nprint(sales)  # TODO: 用 accumulate 得到 [3, 8, 10, 16]\n", "answer": "from itertools import chain, combinations, accumulate\n\na, b, c = [1, 2], [3], [4, 5]\nprint(list(chain(a, b, c)))\n\npairs = [\"\".join(p) for p in combinations(\"ABCD\", 2)]\nprint(pairs, len(pairs))\n\nsales = [3, 5, 2, 6]\nprint(list(accumulate(sales)))\n", "expect": "[1, 2, 3, 4, 5]\n['AB', 'AC', 'AD', 'BC', 'BD', 'CD'] 6\n[3, 8, 10, 16]\n"},
    {"q": "用 <code>re</code> 处理一段文本：(1) <code>re.findall</code> 找出所有 11 位手机号（1 开头）；(2) <code>re.sub</code> 把手机号中间 4 位换成 <code>****</code>，打印脱敏后的文本。提示：分组 <code>(\\d{3})\\d{4}(\\d{4})</code>，替换串里用 <code>\\1</code>、<code>\\2</code>。", "starter": "import re\n\ntext = \"张三 13812345678，李四 15900001111，工号 20231234\"\nphones = []  # TODO: re.findall(r\"...\", text)\nprint(phones)\nmasked = text  # TODO: re.sub(r\"...\", r\"...\", text)\nprint(masked)\n", "answer": "import re\n\ntext = \"张三 13812345678，李四 15900001111，工号 20231234\"\nphones = re.findall(r\"1\\d{10}\", text)\nprint(phones)\nmasked = re.sub(r\"(1\\d{2})\\d{4}(\\d{4})\", r\"\\1****\\2\", text)\nprint(masked)\n", "expect": "['13812345678', '15900001111']\n张三 138****5678，李四 159****1111，工号 20231234\n"},
    {"q": "把脚本写成“既能被导入、又能直接运行”的样子：逻辑放进函数 <code>word_freq(text)</code>（返回出现次数最多的 2 个词及次数，用 <code>collections.Counter</code>），运行入口放进 <code>main()</code>，并用 <code>if __name__ == \"__main__\":</code> 调用 <code>main()</code>。", "starter": "from collections import Counter\n\ndef word_freq(text):\n    # TODO: 按空格拆词，用 Counter 统计，返回 most_common(2)\n    return []\n\ndef main():\n    print(word_freq(\"to be or not to be that is the question to\"))\n\n# TODO: 只有直接运行时才调用 main()\n", "answer": "from collections import Counter\n\ndef word_freq(text):\n    return Counter(text.split()).most_common(2)\n\ndef main():\n    print(word_freq(\"to be or not to be that is the question to\"))\n\nif __name__ == \"__main__\":\n    main()\n", "expect": "[('to', 3), ('be', 2)]\n"}
  ] /*EX:py-module*/,
  handson: [
    '建一个小包：textkit/__init__.py、textkit/clean.py（去空白、全角转半角）、textkit/stats.py（用 Counter 统计词频）；在项目根目录写 main.py 用绝对导入调用它们。再在 stats.py 里用相对导入引用 clean，分别用 python -m textkit.stats 和 python textkit/stats.py 运行，观察哪个会报错、为什么。',
    '故意在脚本目录建一个 json.py，再 import json 调用 json.dumps，看报错信息；打印 json.__file__ 确认导入的是哪个文件，然后改名修好。',
    '用 re 写一个日志分析脚本：从一段多行日志文本里提取所有 ERROR 行的时间和错误码（如 2026-11-06 10:01:02 ERROR E1001），用 Counter 统计各错误码次数，用 datetime.strptime 把时间解析出来，算出第一条和最后一条错误相隔多少分钟。'
  ],
  links: [{ t: 'Python 官方教程（中文）：第 6 章模块、第 10 章标准库简介', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
},

/* ======================= py 进阶：闭包、装饰器、上下文管理器 ======================= */
{
  id: 'py-advanced', stage: 'py', title: '进阶：闭包、装饰器、上下文管理器', short: '闭包与装饰器',
  keywords: 'Python 闭包 closure nonlocal 延迟绑定 装饰器 decorator functools.wraps 带参数装饰器 lru_cache 上下文管理器 __enter__ __exit__ contextlib contextmanager 类型提示 type hints',
  prereqs: ['py-module'],
  tip: '装饰器就是“接收函数、返回新函数”的函数，@deco 等于 f = deco(f)；上下文管理器把“进入—退出”的成对操作封装起来，保证一定收尾。',
  learn: [
    { h: '闭包', html: `
<p>函数在 Python 里是对象，可以在函数里定义函数并返回。内层函数记住了外层函数的变量，即使外层函数已经返回——这就是<b>闭包</b>。</p>
<pre><code>def make_multiplier(k):
    def mul(x):
        return x * k        # 用到外层的 k
    return mul

double = make_multiplier(2)
print(double(5))            # 10

def make_counter():
    n = 0
    def inc():
        nonlocal n          # 要“修改”外层变量必须声明
        n += 1
        return n
    return inc</code></pre>
<p>闭包常用来生成“带配置的函数”、做简单的状态保存，它也是装饰器的基础。</p>
<p class="warn">延迟绑定坑：闭包记住的是<b>变量</b>，不是当时的值。<code>[lambda x: x * i for i in range(3)]</code> 里三个函数共享同一个 i，调用时 i 已经是 2，结果全是乘 2。解决：<code>lambda x, i=i: x * i</code>，用默认参数在定义时把值固定下来。</p>` },
    { h: '装饰器', html: `
<p><b>装饰器</b>接收一个函数，返回一个包装后的新函数，用来在不改原函数代码的情况下加上计时、日志、重试、权限检查、缓存等功能。</p>
<pre><code>import functools

def log_calls(func):
    @functools.wraps(func)          # 保留原函数的 __name__、文档字符串
    def wrapper(*args, **kwargs):
        print("调用", func.__name__, args)
        return func(*args, **kwargs)
    return wrapper

@log_calls          # 等价于 add = log_calls(add)
def add(a, b):
    return a + b</code></pre>
<p><b>带参数的装饰器</b>多套一层：<code>@retry(3)</code> 先调用 <code>retry(3)</code> 得到真正的装饰器，再用它装饰函数。</p>
<pre><code>def retry(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            ...                     # 循环调用 func，最多 times 次
        return wrapper
    return decorator</code></pre>
<ul><li>多个装饰器叠加时，<b>离函数最近的先套上</b>：<code>@a</code> <code>@b</code> <code>def f</code> 等于 <code>f = a(b(f))</code></li>
<li>标准库现成的：<code>@functools.lru_cache</code>（缓存结果）、<code>@property</code>、<code>@staticmethod</code>、<code>@classmethod</code>、<code>@dataclass</code></li></ul>
<p class="warn">不写 functools.wraps，被装饰函数的名字都变成 wrapper，日志、调试、依赖函数名的框架都会出问题。</p>` },
    { h: '上下文管理器', html: `
<p>with 语句背后是<b>上下文管理器协议</b>：进入时调用 <code>__enter__</code>（返回值赋给 as 后的变量），离开时调用 <code>__exit__</code>，无论块里是否抛异常。</p>
<pre><code>import time

class Timer:
    def __enter__(self):
        self.t0 = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        print("耗时", time.perf_counter() - self.t0)
        return False        # False：异常照常向外抛；True 会把异常吞掉</code></pre>
<p>简单场景用 <code>contextlib.contextmanager</code> 把生成器变成上下文管理器：yield 之前是“进入”，之后是“退出”。</p>
<pre><code>from contextlib import contextmanager

@contextmanager
def opened(path):
    f = open(path, encoding="utf-8")
    try:
        yield f             # with 块在这里执行
    finally:
        f.close()           # 块里出异常也会关闭</code></pre>
<p class="warn">坑：contextmanager 里不用 try / finally，with 块一抛异常，yield 后面的清理代码就不执行了。__exit__ 返回 True 会吞掉异常，除非确实要忽略某类异常（标准库有 <code>contextlib.suppress</code>），否则返回 False 或不返回。</p>` },
    { h: '类型提示简介', html: `
<p>类型提示给参数和返回值标注类型，<b>运行时不检查</b>，作用是让编辑器补全、让 mypy 等工具提前发现错误、让人（和编程助手）更容易读懂代码。</p>
<pre><code>from typing import Callable

def mean(xs: list[float]) -&gt; float:
    return sum(xs) / len(xs)

def find(users: dict[str, int], name: str) -&gt; int | None:
    return users.get(name)

def apply(f: Callable[[int], int], x: int) -&gt; int:
    return f(x)</code></pre>
<ul><li>容器直接写 <code>list[int]</code>、<code>dict[str, int]</code>、<code>tuple[int, str]</code></li>
<li>“可能为 None” 写 <code>X | None</code>（旧写法 <code>Optional[X]</code>）</li>
<li>函数类型用 <code>Callable[[参数类型...], 返回类型]</code></li></ul>
<div class="key">类型提示不改变运行结果：传错类型照样能跑到出错那一行。要让它发挥作用，需要配合编辑器或检查工具（「基础工具」阶段的「Python 与工程化基础」一节会讲工具）。</div>` }
  ],
  examples: [
    { type: 'choice', q: `下面代码的输出是（　）。<pre><code>funcs = []
for i in range(3):
    funcs.append(lambda: i)
print([f() for f in funcs])</code></pre>`,
      options: ['[2, 2, 2]', '[0, 1, 2]', '[0, 0, 0]', '报错：i 未定义'], answer: 0,
      explain: '三个 lambda 引用的是同一个变量 i，调用时循环早已结束，i 的值是 2。要得到 [0, 1, 2]，写成 lambda i=i: i。' },
    { type: 'choice', q: '你写了一个计时装饰器，套上之后，监控系统里所有被装饰的函数名都显示为 wrapper。应该怎么改？',
      options: ['在内层 wrapper 函数上加 @functools.wraps(func)', '把 wrapper 改名为 inner', '去掉 *args 和 **kwargs', '把装饰器改成类'], answer: 0,
      explain: 'functools.wraps 把原函数的 __name__、__doc__ 等信息复制到包装函数上。只改名字仍然是同一个名字；参数写法与函数名无关。' },
    { type: 'choice', q: '要写一个上下文管理器：进入时获取数据库连接，退出时一定归还连接（with 块里可能抛异常）。用 contextmanager 的正确写法是（　）。',
      options: ['conn = 获取连接；try: yield conn；finally: 归还连接', 'conn = 获取连接；yield conn；归还连接', 'try: conn = 获取连接；except: 归还连接', 'return conn；然后归还连接'], answer: 0,
      explain: '块里抛出的异常会在 yield 处重新抛出，只有放在 finally 里的归还代码才一定执行。不加 try / finally，出异常时连接就泄漏了；return 之后的代码根本不会执行。' }
  ],
  tests: [
    { type: 'choice', q: '内层函数想修改外层函数的局部变量 count（执行 count += 1），需要在内层函数里先声明（　）。',
      options: ['nonlocal count', 'global count', 'local count', '不用声明，直接改'], answer: 0,
      explain: 'nonlocal 指向外层（非全局）函数的变量；global 指向模块级变量。不声明时，count += 1 会把 count 当作内层的局部变量，报 UnboundLocalError。' },
    { type: 'choice', q: '<code>@deco</code> 写在 <code>def f(): ...</code> 上面，等价于（　）。',
      options: ['f = deco(f)', 'f = f(deco)', 'deco = f(deco)', 'f() 执行前先执行 deco()，两者无关'], answer: 0,
      explain: '装饰器语法只是语法糖：定义完 f 后，立即用 deco(f) 的返回值替换名字 f。' },
    { type: 'choice', q: `下面两个装饰器叠加，<code>f</code> 等价于（　）。<pre><code>@a
@b
def f(): ...</code></pre>`,
      options: ['a(b(f))', 'b(a(f))', 'a(f) 和 b(f) 各执行一次', 'a(b)(f)'], answer: 0,
      explain: '离函数最近的 b 先套上，外面再套 a。调用时外层 a 的包装逻辑最先执行。' },
    { type: 'choice', q: '<code>@retry(times=3)</code> 这种带参数的装饰器，retry 函数本身应该返回（　）。',
      options: ['一个装饰器（接收 func、返回 wrapper 的函数）', '被装饰函数的执行结果', '包装后的 wrapper 函数', '整数 3'], answer: 0,
      explain: '带参数时先执行 retry(times=3)，它的返回值才是真正的装饰器，再被用来装饰函数。所以一共三层：retry → decorator → wrapper。' },
    { type: 'choice', q: '一个计算斐波那契数的递归函数很慢，同样的参数被反复计算。最省事的优化是（　）。',
      options: ['加上 @functools.lru_cache 缓存结果', '加上 @staticmethod', '加上 @functools.wraps', '把递归改成 lambda'], answer: 0,
      explain: 'lru_cache 按参数缓存返回值，重复调用直接返回缓存，递归斐波那契从指数级变成线性。前提是函数是“纯”的（同样参数总是同样结果），且参数可哈希。' },
    { type: 'choice', q: '上下文管理器的 __exit__ 方法返回 True 会怎样？',
      options: ['with 块里抛出的异常被吞掉，不再向外传播', '异常照常向外抛出', '重新执行一次 with 块', '程序立即退出'], answer: 0,
      explain: '__exit__ 返回真值表示“异常已处理”，异常就此消失。随便返回 True 会掩盖错误，一般返回 False 或 None。' },
    { type: 'choice', q: '关于 <code>with A() as x:</code>，下列说法正确的是（　）。',
      options: ['x 是 A() 的 __enter__ 方法的返回值', 'x 一定就是 A() 对象本身', 'x 是 __exit__ 的返回值', 'with 块结束后 x 自动被删除'], answer: 0,
      explain: 'as 绑定的是 __enter__ 的返回值，很多类返回 self，但不一定（有的对象 __enter__ 返回别的东西）。with 结束后变量 x 仍然存在。' },
    { type: 'choice', q: '函数签名为 <code>def mean(xs: list[float]) -&gt; float</code>，调用 <code>mean("abc")</code> 时会（　）。',
      options: ['类型提示不在运行时检查，照常执行到 sum 那里才报 TypeError', '调用前就报类型不匹配的错误', '自动把 "abc" 转成浮点数列表', '返回 None'], answer: 0,
      explain: '解释器不检查类型提示。错误要在运行到真正出问题的操作时才出现；想提前发现要用 mypy 等静态检查工具或编辑器提示。' }
  ],
  exercises: [
    {"q": "写 <code>make_counter()</code>：返回一个函数，每调用一次计数加 1 并返回当前值。两个计数器互不影响。提示：内层函数要修改外层变量，需要 <code>nonlocal</code>。", "starter": "def make_counter():\n    count = 0\n    def inc():\n        # TODO: 声明 nonlocal，再加 1 并返回\n        return count\n    return inc\n\nc1 = make_counter()\nc2 = make_counter()\nprint(c1(), c1(), c1())\nprint(c2())\n", "answer": "def make_counter():\n    count = 0\n    def inc():\n        nonlocal count\n        count += 1\n        return count\n    return inc\n\nc1 = make_counter()\nc2 = make_counter()\nprint(c1(), c1(), c1())\nprint(c2())\n", "expect": "1 2 3\n1\n"},
    {"q": "闭包的“延迟绑定”坑：下面想得到分别乘 0、1、2 的三个函数，结果却全是乘 2。修改列表推导，让输出变成 <code>[0, 10, 20]</code>。提示：用默认参数在定义时把 <code>i</code> 的值“定”下来。", "starter": "funcs = [lambda x: x * i for i in range(3)]\nprint([f(10) for f in funcs])\n", "answer": "funcs = [lambda x, i=i: x * i for i in range(3)]\nprint([f(10) for f in funcs])\n", "expect": "[0, 10, 20]\n"},
    {"q": "写装饰器 <code>log_calls</code>：调用前打印 <code>调用 函数名(参数)</code>，调用后打印 <code>返回 结果</code>，并把结果原样返回。用 <code>functools.wraps</code> 保留原函数名，最后打印 <code>add.__name__</code> 应是 <code>add</code>。", "starter": "import functools\n\ndef log_calls(func):\n    def wrapper(*args, **kwargs):\n        # TODO: 打印“调用 名字(参数)”，调用 func，打印“返回 结果”，返回结果\n        return func(*args, **kwargs)\n    return wrapper\n\n@log_calls\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3) * 10)\nprint(add.__name__)\n", "answer": "import functools\n\ndef log_calls(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        print(f\"调用 {func.__name__}{args}\")\n        result = func(*args, **kwargs)\n        print(f\"返回 {result}\")\n        return result\n    return wrapper\n\n@log_calls\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3) * 10)\nprint(add.__name__)\n", "expect": "调用 add(2, 3)\n返回 5\n50\nadd\n"},
    {"q": "写带参数的装饰器 <code>retry(times)</code>：被装饰的函数抛异常时重试，最多共调用 <code>times</code> 次；每次失败打印 <code>第 n 次失败: 消息</code>；全部失败就把最后的异常继续抛出。下面的 <code>flaky</code> 前两次会失败、第三次成功。", "starter": "import functools\n\ndef retry(times):\n    def decorator(func):\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            # TODO: 最多调用 times 次；每次失败打印“第 n 次失败: 消息”，最后一次仍失败就 raise\n            try:\n                return func(*args, **kwargs)\n            except Exception as e:\n                print(f\"第 1 次失败: {e}\")\n        return wrapper\n    return decorator\n\ncalls = 0\n\n@retry(3)\ndef flaky():\n    global calls\n    calls += 1\n    if calls < 3:\n        raise ConnectionError(f\"网络抖动 {calls}\")\n    return \"成功\"\n\nprint(flaky())\n", "answer": "import functools\n\ndef retry(times):\n    def decorator(func):\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            for n in range(1, times + 1):\n                try:\n                    return func(*args, **kwargs)\n                except Exception as e:\n                    print(f\"第 {n} 次失败: {e}\")\n                    if n == times:\n                        raise\n        return wrapper\n    return decorator\n\ncalls = 0\n\n@retry(3)\ndef flaky():\n    global calls\n    calls += 1\n    if calls < 3:\n        raise ConnectionError(f\"网络抖动 {calls}\")\n    return \"成功\"\n\nprint(flaky())\n", "expect": "第 1 次失败: 网络抖动 1\n第 2 次失败: 网络抖动 2\n成功\n"},
    {"q": "分别用类（<code>__enter__</code> / <code>__exit__</code>）和 <code>contextlib.contextmanager</code> 写两个上下文管理器：进入时打印 <code>&lt;名字&gt;</code>，退出时打印 <code>&lt;/名字&gt;</code>。注意即使 with 块里抛了异常，结束标签也要打印出来（第二段演示了这种情况）。", "starter": "from contextlib import contextmanager\n\nclass Tag:\n    def __init__(self, name):\n        self.name = name\n    def __enter__(self):\n        # TODO: 打印开始标签\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        # TODO: 打印结束标签\n        return False\n\n@contextmanager\ndef tag(name):\n    print(f\"<{name}>\")\n    yield\n    print(f\"</{name}>\")  # TODO: 改成 try / finally，异常时也会执行\n\nwith Tag(\"p\"):\n    print(\"你好\")\n\ntry:\n    with tag(\"div\"):\n        print(\"出错前\")\n        raise ValueError(\"坏了\")\nexcept ValueError as e:\n    print(\"捕获:\", e)\n", "answer": "from contextlib import contextmanager\n\nclass Tag:\n    def __init__(self, name):\n        self.name = name\n    def __enter__(self):\n        print(f\"<{self.name}>\")\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        print(f\"</{self.name}>\")\n        return False\n\n@contextmanager\ndef tag(name):\n    print(f\"<{name}>\")\n    try:\n        yield\n    finally:\n        print(f\"</{name}>\")\n\nwith Tag(\"p\"):\n    print(\"你好\")\n\ntry:\n    with tag(\"div\"):\n        print(\"出错前\")\n        raise ValueError(\"坏了\")\nexcept ValueError as e:\n    print(\"捕获:\", e)\n", "expect": "<p>\n你好\n</p>\n<div>\n出错前\n</div>\n捕获: 坏了\n"}
  ] /*EX:py-advanced*/,
  handson: [
    '写一个 @timer 装饰器（用 time.perf_counter，带 functools.wraps），装饰一个递归斐波那契函数 fib(30) 看耗时；再叠加 @functools.lru_cache，比较前后耗时，并想清楚两个装饰器的先后顺序对结果有什么影响。',
    '用 contextlib.contextmanager 写一个 cd(path) 上下文管理器：进入时切换到指定目录（os.chdir），退出时切回原目录，即使块里抛异常也切回。写一段代码在块里故意 raise，验证退出后 os.getcwd() 已恢复。',
    '把前面写过的一个小脚本的所有函数加上类型提示，用 pip 装上 mypy 跑一遍，修掉它报出的问题；再故意传错一个参数类型，确认 mypy 能发现而直接运行发现不了。'
  ],
  links: [{ t: 'Python 官方教程（中文）', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
},

/* ======================= py 数据处理入门：NumPy 与 pandas ======================= */
{
  id: 'py-data', stage: 'py', title: '数据处理入门：NumPy 与 pandas', short: 'NumPy与pandas',
  keywords: 'Python 数据处理 NumPy ndarray 向量化 shape dtype axis 广播 broadcasting pandas Series DataFrame read_csv 筛选 loc iloc groupby 聚合 缺失值 fillna 特征矩阵 机器学习',
  prereqs: ['py-advanced'],
  tip: '处理成批的数字用 NumPy 的向量化代替 for 循环；处理表格用 pandas 的 DataFrame：读入 → 筛选 → 分组聚合 → 交给模型。',
  learn: [
    { h: '先用纯 Python 处理数据', html: `
<p>小数据量时，列表 + 字典 + 标准库就够用。表格数据常表示成“字典的列表”，每个字典是一行：</p>
<pre><code>import csv
with open("sales.csv", encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))      # 每行是 {"region": "华东", "amount": "120"}

total = {}
for r in rows:
    total[r["region"]] = total.get(r["region"], 0) + int(r["amount"])</code></pre>
<ul><li>CSV 读出来的<b>全是字符串</b>，计算前要转 int / float</li>
<li><code>zip(*rows)</code> 可以把“按行”的二维列表转成“按列”</li>
<li>求平均、中位数等可以用标准库 <code>statistics</code></li></ul>
<p>数据到几十万行、要做矩阵运算或复杂的分组统计时，纯 Python 循环既慢又啰嗦，这就是 NumPy 和 pandas 的用武之地。它们是第三方库：<code>pip install numpy pandas</code>。</p>` },
    { h: 'NumPy：数组、形状与广播', html: `
<p>NumPy 的核心是 <b>ndarray</b>：同一类型（dtype）元素组成的多维数组，底层是连续内存和 C 实现，整个数组一起运算（<b>向量化</b>），比 Python 循环快很多。</p>
<pre><code>import numpy as np
a = np.array([[1, 2, 3], [4, 5, 6]])
print(a.shape)              # (2, 3)
print(a * 10)               # 每个元素乘 10，不用写循环
print(a.sum(axis=0))        # 沿行方向压缩 → 每列的和 [5 7 9]
print(a.mean(axis=1))       # 每行的平均 [2. 5.]
print(a[a &gt; 2])             # 布尔索引 → [3 4 5 6]
b = a.reshape(3, 2)         # 改变形状，元素总数不变</code></pre>
<p><b>广播</b>：形状不同的数组运算时，NumPy 从<b>最后一维</b>开始逐维比较，每一维要么相等、要么其中一个是 1，是 1 的那一维被“拉伸”。例如 (3, 4) 和 (4,) 可以相加（每行都加同一个向量）；(3, 1) 和 (1, 4) 相加得到 (3, 4)；(3, 4) 和 (3,) 不行，要先变成 (3, 1)。</p>
<p class="warn">坑：切片得到的是原数组的<b>视图</b>，改切片会改到原数组；需要独立副本时用 <code>.copy()</code>。这一点和 Python 列表切片（复制）相反。</p>` },
    { h: 'pandas：Series 与 DataFrame', html: `
<p>pandas 在 NumPy 之上提供带<b>行索引和列名</b>的表格：一列是 <b>Series</b>，整张表是 <b>DataFrame</b>。</p>
<pre><code>import pandas as pd
df = pd.read_csv("sales.csv")        # 自动推断每列类型
df.head(); df.info(); df.describe()  # 先看前几行、类型、统计概况
df["amount"]                         # 取一列（Series）
df[df["amount"] &gt; 100]               # 按条件筛行
df[(df["region"] == "华东") &amp; (df["amount"] &gt; 100)]   # 多条件
df.loc[df["amount"] &gt; 100, ["region", "amount"]]       # 按标签选行和列
df.groupby("region")["amount"].agg(["sum", "count"])  # 分组聚合
df["amount"].fillna(0)                                 # 缺失值填充</code></pre>
<table class="tbl"><tr><th>操作</th><th>要点</th></tr>
<tr><td>loc / iloc</td><td>loc 按标签（切片含右端），iloc 按位置（不含右端）</td></tr>
<tr><td>缺失值</td><td>用 NaN 表示；isna() 查找，fillna() 填充，dropna() 删除；mean 等统计默认跳过 NaN</td></tr>
<tr><td>修改数据</td><td>用 df.loc[条件, "列"] = 值 一步完成，避免 df[条件]["列"] = 值 这种链式赋值（可能改不到原表）</td></tr></table>
<p class="warn">坑：多条件筛选不能用 and / or（会报“真值不明确”），要用 &amp; / | 并给每个条件加括号。另外 pandas 的逐行循环（iterrows）很慢，能用整列运算就别逐行循环。</p>` },
    { h: '为机器学习准备数据', html: `
<p>后面的机器学习阶段，模型的输入一般是：</p>
<ul><li><b>特征矩阵 X</b>：二维，形状 (样本数, 特征数)，每行一个样本</li>
<li><b>标签 y</b>：一维，形状 (样本数,)，每个样本的答案</li></ul>
<pre><code>df = df.dropna(subset=["price"])                  # 标签缺失的行没法用
df["area"] = df["area"].fillna(df["area"].mean()) # 特征缺失用平均值填
X = df[["area", "rooms"]].to_numpy()              # (n, 2)
y = df["price"].to_numpy()                        # (n,)
X = (X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0))  # 广播做归一化</code></pre>
<div class="key">典型流程：读入 → 看概况（info / describe）→ 清洗（缺失值、异常值、类型）→ 构造特征 → 得到 X、y → 交给 scikit-learn 等库训练。数据清洗往往占了大部分工作量。</div>
<p class="warn">归一化用的最小值、最大值（或均值、标准差）只能从<b>训练集</b>算出，再套用到测试集，否则测试集的信息“泄漏”进了训练过程，评估结果会偏乐观。（上面的代码为了演示广播直接用了全部数据。）</p>` }
  ],
  examples: [
    { type: 'choice', q: '要把一个有 100 万个元素的数字列表每个都乘以 2 再加 1，下列做法最快的是（　）。',
      options: ['转成 NumPy 数组后写 arr * 2 + 1', '用 for 循环逐个计算再 append', '用列表推导 [x * 2 + 1 for x in lst]', '转成 pandas DataFrame 后用 iterrows 逐行计算'], answer: 0,
      explain: 'NumPy 向量化运算在底层 C 代码里批量完成，通常比 Python 层面的循环和推导快得多。iterrows 逐行循环是最慢的写法。' },
    { type: 'choice', q: '数组 A 的形状是 (3, 4)，下列数组中<b>不能</b>和 A 直接相加（广播）的是形状为（　）的数组。',
      options: ['(3,)', '(4,)', '(1, 4)', '(3, 1)'], answer: 0,
      explain: '广播从最后一维比较：(3,) 的最后一维 3 与 A 的 4 不等且都不是 1，不兼容。(4,) 和 (1, 4) 会对每行相加；(3, 1) 会对每列相加。' },
    { type: 'choice', q: '要从 DataFrame df 中筛选出“城市为北京且年龄大于 30”的行，正确的写法是（　）。',
      options: ['df[(df["city"] == "北京") &amp; (df["age"] &gt; 30)]', 'df[df["city"] == "北京" and df["age"] &gt; 30]', 'df[df["city"] == "北京" &amp; df["age"] &gt; 30]', 'df.filter(city="北京", age=30)'], answer: 0,
      explain: '逐元素的“与”要用 &amp;，而且 &amp; 优先级高于比较运算符，每个条件必须加括号。用 and 会报“Series 真值不明确”的错误；filter 也不是这样用的。' }
  ],
  tests: [
    { type: 'choice', q: 'NumPy 数组 <code>a = np.zeros((2, 3))</code>，<code>a.sum(axis=0)</code> 的结果形状是（　）。',
      options: ['(3,)', '(2,)', '(2, 3)', '()，即一个数'], answer: 0,
      explain: 'axis=0 表示沿第 0 维（行方向）压缩，把 2 行加在一起，剩下 3 列，形状 (3,)。axis=1 才得到 (2,)。' },
    { type: 'num', q: '形状为 (3, 1) 的数组和形状为 (1, 4) 的数组相加（广播），结果数组一共有多少个元素？',
      answer: 12, unit: '个', tol: 0,
      explain: '逐维取较大者，结果形状为 (3, 4)，共 3 × 4 = 12 个元素。' },
    { type: 'choice', q: '<code>b = a[0:2]</code>（a 是 NumPy 数组）后执行 <code>b[0] = 99</code>，a 会怎样？',
      options: ['a[0] 也变成 99，因为切片是原数组的视图', 'a 不变，因为切片复制了数据', '报错，切片是只读的', 'a 整体变成 99'], answer: 0,
      explain: 'NumPy 切片返回视图，和原数组共享内存。要独立修改用 a[0:2].copy()。注意这和 Python 列表的切片（会复制）不同。' },
    { type: 'choice', q: '关于 NumPy 数组和 Python 列表，下列说法正确的是（　）。',
      options: ['NumPy 数组的元素类型统一（dtype），支持整体的向量化运算', 'NumPy 数组可以随意混放字符串、字典和数字，速度不受影响', '列表 * 2 和数组 * 2 的效果相同，都是每个元素乘 2', 'NumPy 数组创建后不能改变形状'], answer: 0,
      explain: '统一的 dtype 和连续内存是 NumPy 快的原因。列表 * 2 是把列表重复一遍，数组 * 2 才是逐元素乘 2；数组可以用 reshape 改变形状。' },
    { type: 'choice', q: 'pandas 中 <code>df.loc[0:2]</code> 与 <code>df.iloc[0:2]</code>（默认整数索引 0, 1, 2, …）的区别是（　）。',
      options: ['loc 按标签取 0、1、2 三行（含右端），iloc 按位置取前两行（不含右端）', '两者完全相同', 'loc 取前两行，iloc 取三行', 'loc 只能选列，iloc 只能选行'], answer: 0,
      explain: 'loc 按标签，切片包含右端；iloc 按位置，和 Python 切片一样不含右端。默认整数索引时两者容易混淆。' },
    { type: 'choice', q: '要统计每个部门的平均工资，pandas 的写法是（　）。',
      options: ['df.groupby("dept")["salary"].mean()', 'df["salary"].mean("dept")', 'df.mean(groupby="dept")', 'df.sort_values("dept")["salary"].mean()'], answer: 0,
      explain: 'groupby 先按部门分组，再对每组的 salary 列求平均。排序后直接 mean 得到的是全体平均，不是分组结果。' },
    { type: 'choice', q: 'DataFrame 的 age 列有部分缺失值（NaN），<code>df["age"].mean()</code> 的结果是（　）。',
      options: ['非缺失值的平均数（默认跳过 NaN）', 'NaN', '报错', '把 NaN 当 0 计算的平均数'], answer: 0,
      explain: 'pandas 的统计函数默认 skipna=True，跳过缺失值。这与 NumPy 的 np.mean 遇到 NaN 返回 NaN 不同。' },
    { type: 'choice', q: '准备给机器学习模型的数据：特征矩阵 X 和标签 y 通常的形状是（　）。',
      options: ['X 是 (样本数, 特征数) 的二维数组，y 是 (样本数,) 的一维数组', 'X 和 y 都是一维', 'X 是 (特征数, 样本数)，y 是二维', 'X 是字典，y 是字符串'], answer: 0,
      explain: '惯例是每行一个样本、每列一个特征，y 每个元素对应一个样本的标签。scikit-learn 等库都按这个约定。' },
    { type: 'choice', q: '对数据做最小-最大归一化时，测试集应该用（　）计算出的最小值和最大值。',
      options: ['训练集', '测试集自己', '训练集和测试集合并后', '随便哪个都行，结果一样'], answer: 0,
      explain: '预处理参数只能从训练集学，再套用到测试集。用测试集的统计量等于提前“偷看”了测试数据（数据泄漏），评估结果会偏乐观。' }
  ],
  exercises: [
    {"q": "不用第三方库，计算一组成绩的平均数、中位数、最高分、最低分。平均数保留 1 位小数；中位数：个数为偶数时取中间两个的平均。", "starter": "scores = [78, 92, 65, 88, 71, 95, 83, 60]\n\nmean = 0       # TODO\ns = sorted(scores)\nmedian = 0     # TODO: 注意个数为偶数\nprint(f\"平均 {mean:.1f}\")\nprint(f\"中位数 {median}\")\nprint(\"最高\", 0, \"最低\", 0)  # TODO\n", "answer": "scores = [78, 92, 65, 88, 71, 95, 83, 60]\n\nmean = sum(scores) / len(scores)\ns = sorted(scores)\nn = len(s)\nmedian = s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2\nprint(f\"平均 {mean:.1f}\")\nprint(f\"中位数 {median}\")\nprint(\"最高\", max(scores), \"最低\", min(scores))\n", "expect": "平均 79.0\n中位数 80.5\n最高 95 最低 60\n"},
    {"q": "用 <code>csv.DictReader</code> 读一段 CSV 文本（<code>io.StringIO</code> 模拟文件），筛出 <code>dept</code> 为 <code>研发</code> 且工资不低于 15000 的人，按工资从高到低打印 <code>名字 工资</code>。注意 CSV 读出来的都是字符串。", "starter": "import csv, io\n\ntext = \"\"\"name,dept,salary\n张三,研发,18000\n李四,市场,16000\n王五,研发,12000\n赵六,研发,21000\n钱七,财务,15000\n\"\"\"\n\nrows = list(csv.DictReader(io.StringIO(text)))\n# TODO: 筛选（工资转 int）并按工资降序\nresult = rows\nfor r in result:\n    print(r[\"name\"], r[\"salary\"])\n", "answer": "import csv, io\n\ntext = \"\"\"name,dept,salary\n张三,研发,18000\n李四,市场,16000\n王五,研发,12000\n赵六,研发,21000\n钱七,财务,15000\n\"\"\"\n\nrows = list(csv.DictReader(io.StringIO(text)))\nresult = [r for r in rows if r[\"dept\"] == \"研发\" and int(r[\"salary\"]) >= 15000]\nresult.sort(key=lambda r: int(r[\"salary\"]), reverse=True)\nfor r in result:\n    print(r[\"name\"], r[\"salary\"])\n", "expect": "赵六 21000\n张三 18000\n"},
    {"q": "分组聚合（相当于 pandas 的 <code>groupby(\"region\")[\"amount\"].agg([\"sum\", \"count\"])</code>）：按地区统计销售额合计和订单数，按合计从高到低打印 <code>地区 合计 单数</code>。", "starter": "orders = [\n    {\"region\": \"华东\", \"amount\": 120},\n    {\"region\": \"华北\", \"amount\": 80},\n    {\"region\": \"华东\", \"amount\": 200},\n    {\"region\": \"华南\", \"amount\": 150},\n    {\"region\": \"华北\", \"amount\": 90},\n]\n\nstats = {}  # 地区 -> [合计, 单数]\n# TODO: 遍历 orders 累加\nfor region, (total, count) in stats.items():\n    print(region, total, count)\n", "answer": "orders = [\n    {\"region\": \"华东\", \"amount\": 120},\n    {\"region\": \"华北\", \"amount\": 80},\n    {\"region\": \"华东\", \"amount\": 200},\n    {\"region\": \"华南\", \"amount\": 150},\n    {\"region\": \"华北\", \"amount\": 90},\n]\n\nstats = {}  # 地区 -> [合计, 单数]\nfor o in orders:\n    s = stats.setdefault(o[\"region\"], [0, 0])\n    s[0] += o[\"amount\"]\n    s[1] += 1\nfor region, (total, count) in sorted(stats.items(), key=lambda kv: kv[1][0], reverse=True):\n    print(region, total, count)\n", "expect": "华东 320 2\n华北 170 2\n华南 150 1\n"},
    {"q": "缺失值填充：表里 <code>None</code> 表示缺失。把每一列的缺失值填成该列<b>非缺失值的平均数</b>（保留 1 位小数），打印填好的每一行。提示：<code>zip(*rows)</code> 可以按列取数据。", "starter": "rows = [\n    [1.0, 20.0, None],\n    [2.0, None, 3.0],\n    [None, 40.0, 5.0],\n    [4.0, 30.0, 4.0],\n]\n\nmeans = []  # TODO: 每列非 None 值的平均\nfor row in rows:\n    filled = row  # TODO: None 换成该列平均（round 到 1 位）\n    print(filled)\n", "answer": "rows = [\n    [1.0, 20.0, None],\n    [2.0, None, 3.0],\n    [None, 40.0, 5.0],\n    [4.0, 30.0, 4.0],\n]\n\nmeans = []\nfor col in zip(*rows):\n    vals = [v for v in col if v is not None]\n    means.append(round(sum(vals) / len(vals), 1))\nfor row in rows:\n    filled = [means[j] if v is None else v for j, v in enumerate(row)]\n    print(filled)\n", "expect": "[1.0, 20.0, 4.0]\n[2.0, 30.0, 3.0]\n[2.3, 40.0, 5.0]\n[4.0, 30.0, 4.0]\n"},
    {"q": "手写“广播”式的最小-最大归一化：把每一列缩放到 0～1，公式 <code>(x - 列最小) / (列最大 - 列最小)</code>，结果保留 2 位小数打印。NumPy 里这一步就是 <code>(X - X.min(axis=0)) / (X.max(axis=0) - X.min(axis=0))</code>。", "starter": "X = [\n    [170, 60],\n    [180, 80],\n    [160, 50],\n    [175, 70],\n]\n\nlo = [0, 0]  # TODO: 每列最小\nhi = [1, 1]  # TODO: 每列最大\nfor row in X:\n    scaled = [(x - lo[j]) / (hi[j] - lo[j]) for j, x in enumerate(row)]\n    print([round(v, 2) for v in scaled])\n", "answer": "X = [\n    [170, 60],\n    [180, 80],\n    [160, 50],\n    [175, 70],\n]\n\nlo = [min(col) for col in zip(*X)]\nhi = [max(col) for col in zip(*X)]\nfor row in X:\n    scaled = [(x - lo[j]) / (hi[j] - lo[j]) for j, x in enumerate(row)]\n    print([round(v, 2) for v in scaled])\n", "expect": "[0.5, 0.33]\n[1.0, 1.0]\n[0.0, 0.0]\n[0.75, 0.67]\n"}
  ] /*EX:py-data*/,
  handson: [
    '装好 numpy：用 np.random.default_rng(0) 生成 100 万个数，分别用 Python for 循环和 NumPy 向量化计算平方和，用 time.perf_counter 比较耗时；再用 reshape(1000, 1000) 后求每行均值（axis=1），检查结果形状。',
    '广播练习：生成形状 (5, 3) 的随机矩阵 X，用 X.min(axis=0)、X.max(axis=0) 做每列的最小-最大归一化，检查每列的最小值是 0、最大值是 1；再试 X 加一个形状 (5,) 的数组，读懂报错，用 reshape(5, 1) 修好。',
    '装好 pandas：自己写一个 20 行左右的 CSV（日期、地区、商品、数量、单价，故意留几个空值），用 read_csv 读入，依次完成：info / describe 看概况；新增“金额”列；把数量的缺失值填 0；筛出华东地区金额大于 100 的订单；按地区、商品分组求金额合计并排序；结果用 to_csv 保存（encoding="utf-8-sig"，Excel 打开不乱码）。',
    '把上一题的数据整理成 X（数量、单价两列，to_numpy）和 y（金额），打印两者的 shape，确认 X 是二维、y 是一维，为后面的机器学习阶段做准备。'
  ],
  links: [{ t: 'Python 官方教程（中文）', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
}

);
