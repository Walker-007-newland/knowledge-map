# AI 路线新增阶段「Python 编程」（stage `py`）

放在「认知」之后、「基础工具」之前，约 4 周。读者有软件开发经验但不一定会 Python：从零讲起，但节奏快，重点放在 Python 和别的语言不一样的地方、常见坑、地道写法，以及后面 AI 阶段要用到的东西。

App 里能**直接运行 Python 代码**（离线，Brython 3.13：Python 3 语法编译成 JS 在手机浏览器里跑）。每个节点除了讲解、例题、测试，还有 `exercises` 代码练习：用户改代码 → 运行 → 和期望输出比对。

## 节点（id 前缀 `py-`，stage: 'py'）

| 组 | id | 标题 | 要点 |
|---|---|---|---|
| A `py-1.js` | py-start | 起步：变量、类型与输出 | 运行方式（交互式、脚本）、动态类型、int / float / str / bool / None、print 与 f-string、整除和取余、浮点误差、注释与缩进 |
| A | py-control | 条件与循环 | if / elif / else、真值判断、for 与 range、while、break / continue、循环的 else、match（简单提一句） |
| A | py-str | 字符串 | 索引与切片、不可变、常用方法（split / join / strip / replace / find / startswith）、格式化、in 判断、str 与 bytes / 编码 |
| A | py-list | 列表与元组 | 增删改查、切片、排序（sort 与 sorted、key）、元组与拆包、可变与不可变、引用与拷贝的坑（浅拷贝、[[]]*3） |
| B `py-2.js` | py-dict | 字典与集合 | 增删改查、get / setdefault、遍历 items、字典推导、集合运算、collections 的 Counter / defaultdict |
| B | py-func | 函数 | 定义与返回、位置 / 关键字 / 默认参数、*args / **kwargs、默认参数用可变对象的坑、作用域（LEGB、global / nonlocal）、lambda、函数是对象 |
| B | py-comp | 推导式、迭代器与生成器 | 列表 / 字典 / 集合推导、enumerate / zip、可迭代对象与迭代器、yield 生成器、惰性求值、生成器表达式 |
| B | py-oop | 面向对象 | class、__init__、实例属性与类属性、方法与 self、继承与 super、特殊方法（__str__ / __repr__ / __eq__ / __len__）、@property、dataclass |
| C `py-3.js` | py-error | 异常与文件、JSON | try / except / else / finally、raise、自定义异常、with 语句、读写文件（编码）、pathlib、json 的 dumps / loads |
| C | py-module | 模块、包与标准库 | import 的几种写法、`if __name__ == "__main__"`、包与 __init__.py、常用标准库（math、random、datetime、collections、itertools、re 简介） |
| C | py-advanced | 进阶：闭包、装饰器、上下文管理器 | 闭包、装饰器（含带参数、functools.wraps）、上下文管理器（__enter__ / __exit__、contextlib.contextmanager）、类型提示简介 |
| C | py-data | 数据处理入门：NumPy 与 pandas | 为什么用 NumPy（向量化）、数组与形状、广播；pandas 的 Series / DataFrame、读 CSV、筛选、分组聚合；为后面机器学习做准备 |

已有节点 `ai-python`（Python 与工程化基础：虚拟环境、依赖、类型提示、pytest、httpx、异步）保留在「基础工具」阶段，不要重复它的内容；新节点讲语言本身。

## 代码练习 `exercises`
```js
exercises: [{
  q: '题目 html：要做什么，输出什么样',
  starter: '给用户的起始代码（可以是半成品，留 TODO）',
  answer: '参考答案（完整可运行）',
  expect: '参考答案运行后的标准输出（逐字）'
}]
```
- 每个节点 3～5 道，由浅入深；都要**只靠标准输出判对错**，不用 input()，不读写真实文件（文件题用 io.StringIO 或只处理字符串），不联网，不用第三方库，不用随机数（或固定 random.seed 且不依赖具体随机值）、不依赖当前时间。
- `expect` 必须用本机 python 实际运行 `answer` 得到（逐字，包括换行），不要手写。
- 代码里不要用制表符缩进，用 4 个空格；避免死循环。
- py-data 节点的 NumPy / pandas 在手机上跑不了：它的 exercises 只练纯 Python 的数据处理（列表、字典、统计），NumPy / pandas 放进 handson（电脑上做）。
