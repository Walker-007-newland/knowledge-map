// AI 路线 阶段 py（组 B）：字典与集合、函数、推导式迭代器与生成器、面向对象
RK.ai.nodes.push(

/* ======================= py 字典与集合 ======================= */
{
  id: 'py-dict', stage: 'py', title: '字典与集合', short: '字典与集合',
  keywords: 'dict 字典 set 集合 键值对 get setdefault items keys values 字典推导 交集 并集 差集 Counter defaultdict collections 哈希 hashable',
  prereqs: ['py-list'],
  tip: '字典按键查值、集合去重和判断成员，都是平均 O(1)；取不存在的键用 get，计数和分组用 Counter / defaultdict。',
  learn: [
    { h: '字典：增删改查', html: `
<p><b>字典</b>（dict）存“键 → 值”的映射，按键查找平均是 O(1)，相当于 Java 的 HashMap、JS 的对象 / Map。Python 3.7 起字典<b>保持插入顺序</b>。</p>
<pre><code>user = {"name": "小明", "age": 12}
user["city"] = "上海"     # 新增或修改
print(user["name"])       # 键不存在会抛 KeyError
print(user.get("email"))  # 不存在返回 None
print(user.get("email", "无"))  # 指定默认值
del user["age"]           # 删除，键不存在抛 KeyError
user.pop("city", None)    # 删除并返回值，可给默认值
print("name" in user)     # 判断的是键</code></pre>
<table class="tbl"><tr><th>写法</th><th>键不存在时</th></tr>
<tr><td><code>d[k]</code></td><td>抛 KeyError</td></tr>
<tr><td><code>d.get(k, 默认)</code></td><td>返回默认值（默认 None），不改字典</td></tr>
<tr><td><code>d.setdefault(k, 默认)</code></td><td>先把 k 设成默认值，再返回它</td></tr></table>
<p class="warn">键必须是<b>可哈希</b>的（不可变）：str、int、tuple 可以，list、dict 不行，<code>{[1, 2]: "x"}</code> 会抛 TypeError。</p>` },
    { h: '遍历与字典推导', html: `
<pre><code>scores = {"张三": 85, "李四": 52}
for name in scores:              # 默认遍历键
    print(name)
for name, s in scores.items():   # 同时要键和值
    print(name, s)
passed = {k: v for k, v in scores.items() if v &gt;= 60}
merged = {**scores, "王五": 70}  # 合并成新字典
scores.update({"李四": 60})      # 原地更新</code></pre>
<ul><li><code>keys()</code> / <code>values()</code> / <code>items()</code> 返回的是“视图”，会随字典变化。</li>
<li>遍历时<b>不能增删键</b>（会抛 RuntimeError），要改就遍历 <code>list(d)</code> 或另建一个新字典。</li>
<li>Python 3.9 起可以用 <code>a | b</code> 合并字典，右边的同名键覆盖左边。</li></ul>
<div class="key">想要“按值排序”：<code>sorted(d.items(), key=lambda kv: kv[1])</code>，得到的是 (键, 值) 元组的列表。</div>` },
    { h: '集合与集合运算', html: `
<p><b>集合</b>（set）是无序、不重复的元素集合，常用来<b>去重</b>和<b>快速判断成员</b>（<code>x in s</code> 平均 O(1)，而列表是 O(n)）。</p>
<pre><code>a = {1, 2, 3}
b = {2, 3, 4}
print(a &amp; b)   # 交集 {2, 3}
print(a | b)   # 并集 {1, 2, 3, 4}
print(a - b)   # 差集 {1}
print(a ^ b)   # 对称差 {1, 4}
empty = set()  # 注意：{} 是空字典
a.add(5); a.discard(9)   # discard 不存在也不报错</code></pre>
<p class="warn">集合<b>没有顺序</b>，不能按下标取；要稳定输出就先 <code>sorted(s)</code>。<code>list(set(x))</code> 去重会丢掉原来的顺序，要保序可用 <code>list(dict.fromkeys(x))</code>。</p>` },
    { h: 'Counter 与 defaultdict', html: `
<p>标准库 <code>collections</code> 里有两个计数、分组利器：</p>
<pre><code>from collections import Counter, defaultdict
c = Counter("banana")
print(c["a"], c["z"])     # 3 0（不存在算 0）
print(c.most_common(1))   # [('a', 3)]

groups = defaultdict(list)
for w in ["apple", "bob", "avocado"]:
    groups[w[0]].append(w)  # 第一次访问自动建空列表
print(dict(groups))</code></pre>
<table class="tbl"><tr><th>需求</th><th>推荐写法</th></tr>
<tr><td>数每个东西出现几次</td><td><code>Counter(可迭代对象)</code></td></tr>
<tr><td>按某个键分组成列表</td><td><code>defaultdict(list)</code></td></tr>
<tr><td>普通字典里给缺失键一个初值</td><td><code>d.get(k, 0) + 1</code> 或 <code>setdefault</code></td></tr></table>
<p class="warn">defaultdict 只要用 <code>d[k]</code> <b>读</b>一下不存在的键，就会把它加进去；只想查看不想新增时用 <code>k in d</code> 或 <code>d.get(k)</code>。</p>` }
  ],
  examples: [
    { type: 'choice', q: '字典 <code>cfg = {"debug": True}</code>，读取可能不存在的键 <code>"port"</code>，不存在时用 8080。最合适的写法是（　）。',
      options: ['<code>cfg.get("port", 8080)</code>', '<code>cfg["port"] or 8080</code>', '<code>cfg.port</code>', '<code>cfg.get(8080, "port")</code>'], answer: 0,
      explain: 'get 的第二个参数是缺省值，键不存在时返回它，不会抛错也不改字典。<code>cfg["port"]</code> 在键不存在时直接抛 KeyError；字典不能用点号取键；get 的参数顺序是先键后默认值。' },
    { type: 'choice', q: '要从 10 万个用户 id 里反复判断某个 id 是否在“黑名单”中，黑名单该用什么存（　）。',
      options: ['集合 set，成员判断平均 O(1)', '列表 list，按顺序查找', '字符串，把 id 拼接后用 in 查', '元组 tuple，因为不可变所以更快'], answer: 0,
      explain: '集合基于哈希表，<code>x in s</code> 平均常数时间；列表和元组的 in 要逐个比较，是 O(n)。拼成字符串查找既慢又可能误匹配（如 12 匹配到 123）。' },
    { type: 'choice', q: `下面代码的输出是（　）。<pre><code>from collections import defaultdict
d = defaultdict(int)
if d["x"] == 0:
    pass
print(len(d))</code></pre>`,
      options: ['1', '0', '抛出 KeyError', 'None'], answer: 0,
      explain: 'defaultdict 在用 <code>d[k]</code> 读取不存在的键时，会调用 int() 生成 0 并<b>写入</b>字典，所以只是“看一眼”也会新增键，长度变成 1。只想判断是否存在应写 <code>"x" in d</code>。' },
    { type: 'choice', q: '成绩字典 <code>scores = {"张三": 85, "李四": 92}</code>，要按分数从高到低输出“姓名 分数”，最合适的写法是（　）。',
      options: ['<code>for name, s in sorted(scores.items(), key=lambda kv: kv[1], reverse=True):</code>', '<code>for name, s in sorted(scores, reverse=True):</code>', '<code>for name, s in scores.sort(reverse=True):</code>', '<code>for name, s in sorted(scores.values(), reverse=True):</code>'], answer: 0,
      explain: 'items() 给出 (键, 值) 元组，按 kv[1] 排序就是按分数排。直接 sorted(scores) 排的是键（姓名），而且拆不出两个值；字典没有 sort 方法；values() 只剩分数，丢了姓名。' }
  ],
  tests: [
    { type: 'choice', q: '下列哪个不能作为字典的键（　）。',
      options: ['<code>[1, 2]</code>', '<code>(1, 2)</code>', '<code>"name"</code>', '<code>42</code>'], answer: 0,
      explain: '字典的键必须可哈希。列表可变、不可哈希，用作键会抛 TypeError；元组（元素都不可变时）、字符串、整数都可以。' },
    { type: 'choice', q: '<code>s = {}</code> 之后 <code>type(s)</code> 是（　）。',
      options: ['dict', 'set', 'list', 'tuple'], answer: 0,
      explain: '空花括号表示空字典；空集合必须写 <code>set()</code>。这是新手常见的坑。' },
    { type: 'choice', q: '在 <code>for k in d:</code> 循环里执行 <code>del d[k]</code> 删除不需要的键，会发生什么（　）。',
      options: ['抛出 RuntimeError（字典在迭代中改变了大小）', '正常删除，没有问题', '只删除第一个键，然后静默退出', '字典被清空'], answer: 0,
      explain: '遍历字典时不能增删键。正确做法是遍历一份拷贝 <code>for k in list(d):</code>，或用字典推导式生成一个新字典。' },
    { type: 'choice', q: '<code>a = {1, 2, 3}</code>，<code>b = {3, 4}</code>，<code>a - b</code> 的结果是（　）。',
      options: ['<code>{1, 2}</code>', '<code>{4}</code>', '<code>{3}</code>', '<code>{1, 2, 4}</code>'], answer: 0,
      explain: '差集是“在 a 里但不在 b 里”的元素。<code>{3}</code> 是交集，<code>{1, 2, 4}</code> 是对称差 <code>a ^ b</code>。' },
    { type: 'choice', q: '要统计一篇文章里出现次数最多的 5 个词，最简洁可靠的做法是（　）。',
      options: ['<code>Counter(words).most_common(5)</code>', '对每个词调用 <code>words.count(w)</code> 再排序', '把词放进集合后取前 5 个', '用 <code>max(words)</code> 调用 5 次'], answer: 0,
      explain: 'Counter 一次遍历完成计数，most_common 直接给出前 N 名。对每个词 count 是 O(n²)；集合只能去重、没有次数也没有顺序；max 按字典序比较，和次数无关。' },
    { type: 'choice', q: '想把一个列表去重<b>并保持原来的先后顺序</b>，下列写法正确的是（　）。',
      options: ['<code>list(dict.fromkeys(items))</code>', '<code>list(set(items))</code>', '<code>sorted(set(items))</code>', '<code>set(items)</code>'], answer: 0,
      explain: '字典保持插入顺序且键不重复，fromkeys 正好实现保序去重。set 无序，转回列表后顺序不保证；sorted 是按值排序，不是原顺序。' },
    { type: 'choice', q: '执行 <code>d = {"a": 1}</code>，<code>v = d.setdefault("b", [])</code>，<code>v.append(5)</code> 后，<code>d</code> 是（　）。',
      options: ['<code>{"a": 1, "b": [5]}</code>', '<code>{"a": 1}</code>', '<code>{"a": 1, "b": []}</code>', '抛出 KeyError'], answer: 0,
      explain: 'setdefault 在键不存在时把默认值放进字典并返回<b>同一个对象</b>，所以对 v 的 append 会反映到字典里。' },
    { type: 'choice', q: '要把字典 <code>prices</code> 中所有值打九折，生成一个新字典，地道的写法是（　）。',
      options: ['<code>{k: v * 0.9 for k, v in prices.items()}</code>', '<code>[v * 0.9 for v in prices]</code>', '<code>{v * 0.9 for v in prices.values()}</code>', '<code>prices * 0.9</code>'], answer: 0,
      explain: '字典推导式用 <code>键: 值</code> 的形式。直接遍历 prices 得到的是键，而且方括号生成的是列表；只遍历 values() 的花括号写法是集合推导式，丢了键还会去重；字典不支持乘法。' },
    { type: 'fill', q: '<code>Counter("hello")["l"]</code> 的值是______。', answer: ['2'],
      explain: '"hello" 中字母 l 出现 2 次；Counter 对字符串按字符计数。' }
  ],
  exercises: [
    {
      "q": "<p>统计一句话里每个单词出现的次数，按单词字母顺序每行输出“单词 次数”。用 <code>dict.get</code> 计数。</p>",
      "starter": "text = \"the cat and the dog and the bird\"\ncounts = {}\nfor w in text.split():\n    pass  # TODO: 用 counts.get(w, 0) 累加\nfor w in sorted(counts):\n    print(w, counts[w])\nprint(\"共\", len(counts), \"个不同的单词\")\n",
      "answer": "text = \"the cat and the dog and the bird\"\ncounts = {}\nfor w in text.split():\n    counts[w] = counts.get(w, 0) + 1\nfor w in sorted(counts):\n    print(w, counts[w])\nprint(\"共\", len(counts), \"个不同的单词\")\n",
      "expect": "and 2\nbird 1\ncat 1\ndog 1\nthe 3\n共 5 个不同的单词\n"
    },
    {
      "q": "<p>用 <code>defaultdict(list)</code> 把名字按首字母分组，按字母顺序输出“字母: 名字列表”。</p>",
      "starter": "from collections import defaultdict\n\nnames = [\"alice\", \"bob\", \"anna\", \"carl\", \"ben\", \"cathy\", \"amy\"]\ngroups = defaultdict(list)\n# TODO: 把每个名字放进 groups[首字母]\nfor k in sorted(groups):\n    print(k + \":\", groups[k])\nprint(len(groups), \"组\")\n",
      "answer": "from collections import defaultdict\n\nnames = [\"alice\", \"bob\", \"anna\", \"carl\", \"ben\", \"cathy\", \"amy\"]\ngroups = defaultdict(list)\nfor name in names:\n    groups[name[0]].append(name)\nfor k in sorted(groups):\n    print(k + \":\", groups[k])\nprint(len(groups), \"组\")\n",
      "expect": "a: ['alice', 'anna', 'amy']\nb: ['bob', 'ben']\nc: ['carl', 'cathy']\n3 组\n"
    },
    {
      "q": "<p>两个兴趣班的名单，用集合运算求：两个班都报的、只报了 A 班的、一共多少人（去重）。集合是无序的，输出前先 <code>sorted</code>。</p>",
      "starter": "a = {\"张三\", \"李四\", \"王五\", \"赵六\"}\nb = {\"李四\", \"赵六\", \"孙七\"}\nboth = set()      # TODO: 交集\nonly_a = set()    # TODO: 差集\ntotal = 0         # TODO: 并集的人数\nprint(\"都报了:\", sorted(both))\nprint(\"只报 A:\", sorted(only_a))\nprint(\"总人数:\", total)\n",
      "answer": "a = {\"张三\", \"李四\", \"王五\", \"赵六\"}\nb = {\"李四\", \"赵六\", \"孙七\"}\nboth = a & b\nonly_a = a - b\ntotal = len(a | b)\nprint(\"都报了:\", sorted(both))\nprint(\"只报 A:\", sorted(only_a))\nprint(\"总人数:\", total)\n",
      "expect": "都报了: ['李四', '赵六']\n只报 A: ['张三', '王五']\n总人数: 5\n"
    },
    {
      "q": "<p>用字典推导式从成绩表里筛出及格（≥ 60）的同学；再用 <code>Counter</code> 统计一串投票，输出票数最多的两项。</p>",
      "starter": "from collections import Counter\n\nscores = {\"张三\": 85, \"李四\": 52, \"王五\": 60, \"赵六\": 47}\npassed = {}  # TODO: 字典推导式\nprint(passed)\n\nvotes = [\"红\", \"蓝\", \"红\", \"绿\", \"红\", \"蓝\"]\nc = Counter()  # TODO: 统计 votes\nprint(c.most_common(2))\n",
      "answer": "from collections import Counter\n\nscores = {\"张三\": 85, \"李四\": 52, \"王五\": 60, \"赵六\": 47}\npassed = {name: s for name, s in scores.items() if s >= 60}\nprint(passed)\n\nvotes = [\"红\", \"蓝\", \"红\", \"绿\", \"红\", \"蓝\"]\nc = Counter(votes)\nprint(c.most_common(2))\n",
      "expect": "{'张三': 85, '王五': 60}\n[('红', 3), ('蓝', 2)]\n"
    }
  ],
  handson: [
    '在电脑上用一段英文文章（几百词）做词频统计：转小写、去掉标点、用 Counter 输出前 10 个高频词。再用普通字典 + get 写一遍，确认两种结果一致。',
    '准备一个“学生, 班级, 分数”的多行字符串，用 defaultdict(list) 按班级分组，输出每个班的人数和平均分；再用字典推导式筛出平均分 ≥ 80 的班级。',
    '写一段小实验：分别用列表和集合存 10 万个整数，用 time.perf_counter 比较判断 1000 次 “x in 容器” 的耗时，记录差距。'
  ],
  links: [{ t: 'Python 官方教程（中文）：数据结构一章讲了字典和集合', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
},

/* ======================= py 函数 ======================= */
{
  id: 'py-func', stage: 'py', title: '函数', short: '函数',
  keywords: 'def return 函数 参数 位置参数 关键字参数 默认参数 *args **kwargs 可变默认参数 作用域 LEGB global nonlocal lambda 一等公民 高阶函数 闭包',
  prereqs: ['py-dict'],
  tip: '参数顺序“位置 → 默认 → *args → 仅关键字 → **kwargs”；默认参数不要用 [] 或 {}，用 None 再在函数里新建。',
  learn: [
    { h: '定义、返回与参数', html: `
<pre><code>def area(w, h=1):
    """返回矩形面积。"""   # 文档字符串
    return w * h

area(3, 4)        # 位置参数
area(h=4, w=3)    # 关键字参数，顺序随意
area(3)           # h 用默认值 1

def min_max(nums):
    return min(nums), max(nums)  # 实际返回一个元组
lo, hi = min_max([3, 1, 5])      # 拆包</code></pre>
<ul><li>没有 return（或只写 return）的函数返回 <b>None</b>。</li>
<li>调用时位置参数必须在关键字参数前面：<code>area(w=3, 4)</code> 是语法错误。</li>
<li>Python 没有函数重载，同名函数后定义的会覆盖前面的；靠默认参数、关键字参数实现“多种调用方式”。</li></ul>` },
    { h: '*args、**kwargs 与默认参数的坑', html: `
<pre><code>def log(msg, *args, level="INFO", **extra):
    print(level, msg, args, extra)

log("hi", 1, 2, level="WARN", user="tom")
# WARN hi (1, 2) {'user': 'tom'}
nums = [1, 2]; opts = {"level": "ERR"}
log("x", *nums, **opts)   # 调用时 * / ** 是“展开”</code></pre>
<p><code>*args</code> 把多余的位置参数收成<b>元组</b>，<code>**kwargs</code> 把多余的关键字参数收成<b>字典</b>；写在 <code>*args</code> 后面的参数只能用关键字传（仅关键字参数）。</p>
<p class="warn">默认值只在<b>定义函数时求值一次</b>。写 <code>def f(x, bag=[])</code>，每次不传 bag 用的都是同一个列表，会越积越多。正确写法：</p>
<pre><code>def add(x, bag=None):
    if bag is None:
        bag = []
    bag.append(x)
    return bag</code></pre>` },
    { h: '作用域：LEGB、global 与 nonlocal', html: `
<p>查找变量名的顺序是 <b>LEGB</b>：Local（函数内）→ Enclosing（外层函数）→ Global（模块）→ Built-in（内置，如 len）。</p>
<pre><code>count = 0
def bump():
    global count     # 要给全局变量赋值必须声明
    count += 1

def outer():
    n = 0
    def inner():
        nonlocal n   # 要给外层函数的变量赋值
        n += 1
        return n
    return inner</code></pre>
<p class="warn">只要函数里<b>给某个名字赋值</b>，这个名字在整个函数里就被当成局部变量。没声明 global 就写 <code>count += 1</code>，会抛 UnboundLocalError。只读外层变量则不用声明。</p>
<div class="key">尽量少用 global：靠参数传入、return 返回，函数才好测试、好复用。</div>` },
    { h: 'lambda 与“函数是对象”', html: `
<p>Python 里函数是<b>一等对象</b>：可以赋值给变量、放进列表、作为参数传入、作为返回值返回。</p>
<pre><code>def twice(f, x):
    return f(f(x))
print(twice(lambda v: v * 3, 2))   # 18

people = [("bob", 30), ("amy", 25)]
people.sort(key=lambda p: p[1])     # 按年龄排序
ops = {"+": lambda a, b: a + b, "-": lambda a, b: a - b}
print(ops["-"](5, 2))               # 3</code></pre>
<ul><li><b>lambda</b> 是只有一个表达式的匿名函数，适合当 key、回调这类“一次性小函数”。</li>
<li>逻辑超过一行、需要名字或文档时，就用 def。</li>
<li>传函数时<b>不要加括号</b>：<code>key=len</code> 是传函数，<code>key=len()</code> 是先调用它（会报错）。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: `下面代码连续调用两次的输出是（　）。<pre><code>def add(x, bag=[]):
    bag.append(x)
    return bag
print(add(1))
print(add(2))</code></pre>`,
      options: ['[1] 和 [1, 2]', '[1] 和 [2]', '[1, 2] 和 [1, 2]', '第二次调用抛出异常'], answer: 0,
      explain: '默认值 [] 在定义函数时只创建一次，两次调用共用同一个列表，所以第二次输出 [1, 2]。应改为 <code>bag=None</code>，在函数体内新建列表。' },
    { type: 'choice', q: '函数 <code>def f(a, *args, sep="-", **kw)</code>，调用 <code>f(1, 2, 3, sep="+", x=9)</code> 时，<code>args</code> 和 <code>kw</code> 分别是（　）。',
      options: ['<code>(2, 3)</code> 和 <code>{"x": 9}</code>', '<code>[2, 3]</code> 和 <code>{"sep": "+", "x": 9}</code>', '<code>(1, 2, 3)</code> 和 <code>{"x": 9}</code>', '<code>(2, 3)</code> 和 <code>{"sep": "+", "x": 9}</code>'], answer: 0,
      explain: '1 给了 a；多余的位置参数 2、3 收成元组 args；sep 是有名字的仅关键字参数，不进 kw；剩下的 x=9 进入字典 kw。' },
    { type: 'choice', q: `下面代码运行时报 UnboundLocalError，原因是（　）。<pre><code>total = 0
def add(n):
    total += n
add(5)</code></pre>`,
      options: ['函数内对 total 赋值，使它被当成局部变量，而赋值前又要读取它', '全局变量在函数里根本不能读取', 'n 没有默认值', '+= 不能用于整数'], answer: 0,
      explain: '在函数里给某名字赋值，它在整个函数中就是局部变量；<code>total += n</code> 先读后写，读的时候局部 total 还没值。要改全局变量需声明 <code>global total</code>，更好的是把结果 return 出去。' },
    { type: 'choice', q: '函数 <code>def area(w, h=1)</code>，下列调用中<b>不合法</b>的是（　）。',
      options: ['<code>area(w=3, 4)</code>', '<code>area(3)</code>', '<code>area(h=4, w=3)</code>', '<code>area(3, h=4)</code>'], answer: 0,
      explain: '调用时位置参数不能出现在关键字参数之后，<code>area(w=3, 4)</code> 是语法错误。只传 w 时 h 用默认值；关键字参数之间顺序随意；位置在前、关键字在后是合法的。' },
    { type: 'choice', q: '有一个处理函数字典 <code>handlers = {"csv": parse_csv, "json": parse_json}</code>，要按文件类型调用对应的函数，正确的写法是（　）。',
      options: ['<code>handlers[kind](text)</code>', '<code>handlers[kind()](text)</code>', '<code>handlers(kind)(text)</code>', '<code>handlers[kind]</code>（取出来就会自动执行）'], answer: 0,
      explain: '函数是对象，可以作为字典的值存起来，取出后加括号传参调用。kind 是字符串，不能被调用；字典要用方括号取值；只取出函数而不加括号不会执行它。' }
  ],
  tests: [
    { type: 'choice', q: '一个函数没有写 return 语句，调用它得到的值是（　）。',
      options: ['None', '0', '空字符串', '抛出异常'], answer: 0,
      explain: '没有 return 或 return 后不带值，函数都返回 None。常见 bug：<code>lst = lst.sort()</code>，sort 原地排序返回 None，lst 就变成了 None。' },
    { type: 'choice', q: '函数 <code>def f(): return 1, 2</code>，<code>type(f())</code> 是（　）。',
      options: ['tuple', 'list', 'int', '语法错误，函数只能返回一个值'], answer: 0,
      explain: '<code>return 1, 2</code> 返回的是一个元组 (1, 2)，所以“返回多个值”本质上是返回一个元组，调用处可以用 <code>a, b = f()</code> 拆包。' },
    { type: 'choice', q: '要写一个“合并任意多个字典”的函数，参数最适合写成（　）。',
      options: ['<code>def merge(*dicts)</code>，在函数里依次 update', '<code>def merge(**dicts)</code>', '<code>def merge(dicts=[])</code>', '<code>def merge(d1, d2)</code>'], answer: 0,
      explain: '个数不定的位置参数用 *args 收集成元组，然后遍历合并。**kwargs 收的是“名字=值”形式的参数；用可变默认值有共享状态的坑；固定两个参数满足不了“任意多个”。' },
    { type: 'choice', q: '内层函数要修改外层（非全局）函数里的变量 n，应使用的声明是（　）。',
      options: ['<code>nonlocal n</code>', '<code>global n</code>', '<code>local n</code>', '不需要任何声明'], answer: 0,
      explain: 'nonlocal 指向最近一层外层函数的变量；global 指向模块级变量；Python 没有 local 关键字。不声明的话赋值会新建一个局部变量。' },
    { type: 'choice', q: '按字符串长度给列表排序，下列写法正确的是（　）。',
      options: ['<code>words.sort(key=len)</code>', '<code>words.sort(key=len())</code>', '<code>words.sort(len)</code>', '<code>words = words.sort(key=len)</code>'], answer: 0,
      explain: 'key 要传函数本身，不能加括号调用；sort 的 key 只能以关键字方式传；sort 原地排序返回 None，赋值回去会把列表变成 None。' },
    { type: 'choice', q: '关于 lambda，下列说法正确的是（　）。',
      options: ['只能包含一个表达式，表达式的值就是返回值', '可以包含多条语句和 return', '比 def 定义的函数运行更快', '不能作为参数传给其他函数'], answer: 0,
      explain: 'lambda 是单表达式的匿名函数，不能写多条语句或 return。它和 def 生成的都是普通函数对象，性能没有本质差别，也可以作为参数传递。' },
    { type: 'choice', q: '变量名 <code>len</code> 在函数里查找的顺序，正确的是（　）。',
      options: ['局部 → 外层函数 → 全局 → 内置', '内置 → 全局 → 外层函数 → 局部', '全局 → 局部 → 内置', '只在局部和内置两处查找'], answer: 0,
      explain: 'LEGB 规则：Local、Enclosing、Global、Built-in。所以如果你在全局写了 <code>len = 5</code>，后面调用 len() 就会出错——它遮住了内置函数。' },
    { type: 'choice', q: '<code>def f(*, a, b)</code> 中的单独 <code>*</code> 表示（　）。',
      options: ['a 和 b 只能用关键字传，如 <code>f(a=1, b=2)</code>', 'a 和 b 都会被收集成元组', 'f 可以接收任意多个位置参数', '语法错误'], answer: 0,
      explain: '单独的 * 后面的参数是“仅关键字参数”，调用时必须写名字，常用来让调用处更清楚，比如 <code>connect(host, *, timeout)</code>。' },
    { type: 'fill', q: `<pre><code>def f(x, y=2):
    return x ** y
print(f(y=3, x=2))</code></pre>输出是______。`, answer: ['8'],
      explain: '关键字参数 x=2、y=3，2 的 3 次方等于 8。' }
  ],
  exercises: [
    {
      "q": "<p>写函数 <code>stats(nums)</code>，一次返回最小值、最大值和平均值（保留 1 位小数），调用处用拆包接收后输出，格式为“3 10 6.5”（空格分隔）。</p>",
      "starter": "def stats(nums):\n    # TODO: 返回 最小值, 最大值, 平均值（round 到 1 位）\n    pass\n\nresult = stats([3, 8, 5, 10])\nprint(result)\n",
      "answer": "def stats(nums):\n    return min(nums), max(nums), round(sum(nums) / len(nums), 1)\n\nlo, hi, avg = stats([3, 8, 5, 10])\nprint(lo, hi, avg)\n",
      "expect": "3 10 6.5\n"
    },
    {
      "q": "<p>写 <code>total(*nums)</code> 返回任意个数之和；写 <code>describe(name, **info)</code> 先输出名字，再按传入顺序逐行输出“键=值”。</p>",
      "starter": "def total(*nums):\n    return 0  # TODO\n\ndef describe(name, **info):\n    print(name)\n    # TODO: 逐行输出 键=值\n\nprint(total(1, 2, 3))\nprint(total())\ndescribe(\"小明\", age=12, city=\"上海\")\n",
      "answer": "def total(*nums):\n    return sum(nums)\n\ndef describe(name, **info):\n    print(name)\n    for k, v in info.items():\n        print(f\"{k}={v}\")\n\nprint(total(1, 2, 3))\nprint(total())\ndescribe(\"小明\", age=12, city=\"上海\")\n",
      "expect": "6\n0\n小明\nage=12\ncity=上海\n"
    },
    {
      "q": "<p>下面的 <code>add_item</code> 本意是“不传 bag 时每次新建一个空列表”，但运行结果不对。改掉“默认参数用可变对象”的坑，让前两行输出分别是 <code>['a']</code> 和 <code>['b']</code>。</p>",
      "starter": "def add_item(item, bag=[]):\n    bag.append(item)\n    return bag\n\nprint(add_item(\"a\"))\nprint(add_item(\"b\"))\nprint(add_item(\"c\", [\"x\"]))\n",
      "answer": "def add_item(item, bag=None):\n    if bag is None:\n        bag = []\n    bag.append(item)\n    return bag\n\nprint(add_item(\"a\"))\nprint(add_item(\"b\"))\nprint(add_item(\"c\", [\"x\"]))\n",
      "expect": "['a']\n['b']\n['x', 'c']\n"
    },
    {
      "q": "<p>用 <code>sorted</code> + <code>lambda</code> 把学生按分数从高到低排序，分数相同按名字升序；再体会“函数是对象”：把 <code>len</code> 当参数传给 <code>apply</code>。</p>",
      "starter": "students = [(\"bob\", 90), (\"amy\", 85), (\"cat\", 90), (\"dan\", 70)]\nranked = students  # TODO: sorted(..., key=lambda ...)\nfor name, score in ranked:\n    print(name, score)\n\ndef apply(func, values):\n    return [func(v) for v in values]\n\nprint(apply(str, [\"a\", \"bb\", \"ccc\"]))  # TODO: 改成传 len\n",
      "answer": "students = [(\"bob\", 90), (\"amy\", 85), (\"cat\", 90), (\"dan\", 70)]\nranked = sorted(students, key=lambda s: (-s[1], s[0]))\nfor name, score in ranked:\n    print(name, score)\n\ndef apply(func, values):\n    return [func(v) for v in values]\n\nprint(apply(len, [\"a\", \"bb\", \"ccc\"]))\n",
      "expect": "bob 90\ncat 90\namy 85\ndan 70\n[1, 2, 3]\n"
    },
    {
      "q": "<p>写 <code>make_multiplier(n)</code>，返回一个“乘以 n”的函数（内层函数记住外层的 n，这就是闭包）。用它做出 double、triple，再用推导式生成乘以 1、2、3 的三个函数，分别作用于 10，输出 <code>[10, 20, 30]</code>。</p>",
      "starter": "def make_multiplier(n):\n    def multiply(x):\n        return x  # TODO: 乘以外层的 n\n    return multiply\n\ndouble = make_multiplier(2)\ntriple = make_multiplier(3)\nprint(double(5), triple(5))\nfuncs = [make_multiplier(k) for k in range(1, 4)]\nprint([f(10) for f in funcs])\n",
      "answer": "def make_multiplier(n):\n    def multiply(x):\n        return x * n\n    return multiply\n\ndouble = make_multiplier(2)\ntriple = make_multiplier(3)\nprint(double(5), triple(5))\nfuncs = [make_multiplier(k) for k in range(1, 4)]\nprint([f(10) for f in funcs])\n",
      "expect": "10 15\n[10, 20, 30]\n"
    }
  ],
  handson: [
    '写一个 <code>parse_kv(text, sep="=", *, strip=True)</code>：把 "a=1;b=2" 这样的字符串解析成字典。分别用位置参数、关键字参数调用，并故意用位置方式传 strip，看报什么错。',
    '找一段自己以前写的、用了全局变量的脚本，改成“参数传入、return 返回”的纯函数，再给它写 3 个断言（assert）验证结果。',
    '做一个计算器分发表：用字典把 "+ - * /" 映射到 lambda，循环处理一组 (a, 运算符, b)，除零时输出提示而不是崩溃。'
  ],
  links: [{ t: 'Python 官方教程（中文）：“深入函数定义”一节', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
},

/* ======================= py 推导式、迭代器与生成器 ======================= */
{
  id: 'py-comp', stage: 'py', title: '推导式、迭代器与生成器', short: '推导式与生成器',
  keywords: '列表推导式 字典推导式 集合推导式 enumerate zip 可迭代对象 迭代器 iter next StopIteration yield 生成器 惰性求值 生成器表达式 itertools',
  prereqs: ['py-func'],
  tip: '推导式写短小的“过滤 + 变换”；数据大或只遍历一遍时用生成器，惰性、省内存，但只能用一次。',
  learn: [
    { h: '推导式', html: `
<p>推导式把“循环 + 条件 + 收集”写成一行，读作“对每个 x，如果满足条件，就取表达式的值”。</p>
<pre><code>nums = [1, 2, 3, 4, 5, 6]
evens = [n * n for n in nums if n % 2 == 0]  # 列表
uniq  = {n % 3 for n in nums}                # 集合
index = {w: len(w) for w in ["a", "bb"]}     # 字典
labels = ["偶" if n % 2 == 0 else "奇" for n in nums]
pairs = [(x, y) for x in range(2) for y in range(2)]</code></pre>
<ul><li>过滤的 <code>if</code> 写在<b>后面</b>；“二选一”的 <code>a if 条件 else b</code> 写在<b>前面</b>（它是表达式的一部分）。</li>
<li>多个 for 的顺序和嵌套循环的书写顺序一致：外层在前。</li></ul>
<p class="warn">别为了“一行”而写超过两层 for、带复杂条件的推导式，难读又难调试，改回普通循环。也不要用推导式只为了副作用（如 <code>[print(x) for x in xs]</code>）。</p>` },
    { h: 'enumerate 与 zip', html: `
<pre><code>names = ["张三", "李四"]
scores = [90, 78]
for i, name in enumerate(names, start=1):
    print(i, name)          # 要下标时别写 range(len(...))
for name, s in zip(names, scores):
    print(name, s)          # 并行遍历多个序列
table = dict(zip(names, scores))</code></pre>
<p class="warn">zip 按<b>最短</b>的序列停止，多出来的元素会被悄悄丢掉。要求长度必须一致时，Python 3.10 起可以写 <code>zip(a, b, strict=True)</code>，长度不同会抛 ValueError。</p>` },
    { h: '可迭代对象与迭代器', html: `
<table class="tbl"><tr><th>概念</th><th>说明</th></tr>
<tr><td>可迭代对象</td><td>能被 for 遍历的东西：list、str、dict、文件、range……可以反复遍历</td></tr>
<tr><td>迭代器</td><td>记着“走到哪了”的对象，<code>next()</code> 取下一个，取完抛 StopIteration；<b>只能走一遍</b></td></tr></table>
<pre><code>it = iter([1, 2, 3])   # 从可迭代对象拿迭代器
print(next(it))        # 1
print(list(it))        # [2, 3]
print(list(it))        # []，已经耗尽</code></pre>
<p>for 循环本质上就是：先 <code>iter()</code>，再不停 <code>next()</code>，遇到 StopIteration 结束。zip、map、filter、enumerate 返回的都是迭代器。</p>
<p class="warn">把 <code>z = zip(a, b)</code> 遍历过一次后再遍历，就什么也没有了；需要多次使用就先 <code>list(z)</code>。</p>` },
    { h: 'yield 生成器与惰性求值', html: `
<p>函数里出现 <code>yield</code>，它就成了<b>生成器函数</b>：调用时<b>不执行</b>函数体，只返回一个生成器；每次取值才运行到下一个 yield 并暂停。</p>
<pre><code>def read_numbers(lines):
    for line in lines:
        line = line.strip()
        if line:
            yield int(line)

total = sum(read_numbers(["1", "", "2"]))   # 3
squares = (n * n for n in range(10**9))     # 生成器表达式
print(next(squares), next(squares))          # 0 1，不会撑爆内存</code></pre>
<div class="key">惰性求值的好处：数据一个一个产生、一个一个处理，内存只占一个元素；可以表示无限序列；可以把“读取 → 过滤 → 转换”串成流水线。代价是只能遍历一次、不能用下标、没有 len。</div>
<p>把列表推导式的方括号换成圆括号就是生成器表达式；直接作为唯一参数时可省略括号：<code>sum(x * x for x in nums)</code>。处理大模型语料、日志这类大文件时，逐行生成是标准做法。</p>` }
  ],
  examples: [
    { type: 'choice', q: '要把 <code>nums</code> 中的负数换成 0、其余不变，下列推导式正确的是（　）。',
      options: ['<code>[n if n &gt;= 0 else 0 for n in nums]</code>', '<code>[n for n in nums if n &gt;= 0 else 0]</code>', '<code>[n for n in nums if n &gt;= 0]</code>', '<code>[0 for n in nums if n &lt; 0]</code>'], answer: 0,
      explain: '“二选一”的条件表达式要写在 for 前面，作为每个元素的取值。if 写在后面是过滤，只能保留或丢弃元素，不能接 else；只写过滤条件的写法会丢掉一部分元素，而不是替换成 0。' },
    { type: 'choice', q: `下面代码的输出是（　）。<pre><code>pairs = zip([1, 2, 3], "ab")
print(list(pairs))
print(list(pairs))</code></pre>`,
      options: ['<code>[(1, \'a\'), (2, \'b\')]</code> 和 <code>[]</code>', '<code>[(1, \'a\'), (2, \'b\'), (3, None)]</code> 两次', '<code>[(1, \'a\'), (2, \'b\')]</code> 两次', '抛出 ValueError，因为长度不同'], answer: 0,
      explain: 'zip 按最短序列停止，3 被丢掉；zip 返回迭代器，第一次 list 已经把它耗尽，第二次得到空列表。' },
    { type: 'choice', q: '要统计一个 20 GB 日志文件里包含 "ERROR" 的行数，最合适的写法是（　）。',
      options: ['<code>sum(1 for line in f if "ERROR" in line)</code>', '<code>len([line for line in f.readlines() if "ERROR" in line])</code>', '<code>f.read().count("ERROR")</code>', '先 <code>list(f)</code> 再循环计数'], answer: 0,
      explain: '生成器表达式逐行读取、逐行判断，内存只占一行。readlines、read、list(f) 都会把整个文件读进内存；而且 count("ERROR") 统计的是出现次数，一行出现两次会被算两次。' }
  ],
  tests: [
    { type: 'choice', q: '<code>[x * 2 for x in range(5) if x % 2]</code> 的结果是（　）。',
      options: ['<code>[2, 6]</code>', '<code>[0, 4, 8]</code>', '<code>[0, 2, 4, 6, 8]</code>', '<code>[1, 3]</code>'], answer: 0,
      explain: '<code>x % 2</code> 为真（非 0）的是奇数 1、3，乘 2 得 [2, 6]。' },
    { type: 'choice', q: '遍历列表时同时需要下标和元素，最地道的写法是（　）。',
      options: ['<code>for i, x in enumerate(items):</code>', '<code>for i in range(len(items)): x = items[i]</code>', '<code>for x in items: i = items.index(x)</code>', '<code>i = 0</code> 然后在循环里手动 <code>i += 1</code>'], answer: 0,
      explain: 'enumerate 直接给出 (下标, 元素)。range(len()) 能用但啰嗦；index 每次从头查找，既慢又在有重复元素时出错；手动计数容易漏加。' },
    { type: 'choice', q: '调用一个含 yield 的函数 <code>g = gen()</code> 时，会发生什么（　）。',
      options: ['返回一个生成器对象，函数体此时还没有开始执行', '函数体执行到第一个 yield 并返回该值', '函数体完整执行，返回所有 yield 值组成的列表', '抛出异常，因为必须用 next 调用'], answer: 0,
      explain: '生成器是惰性的：调用只创建生成器，第一次 next（或 for 取值）时才开始执行，运行到 yield 暂停并产出值。' },
    { type: 'choice', q: '关于生成器表达式 <code>(x * x for x in data)</code> 和列表推导式 <code>[x * x for x in data]</code>，下列说法正确的是（　）。',
      options: ['生成器按需产生元素，内存占用小，但只能遍历一次', '两者完全相同，只是括号不同', '生成器可以用下标访问，如 <code>g[0]</code>', '列表推导式是惰性的'], answer: 0,
      explain: '列表推导式立即算出所有元素并保存；生成器表达式只在取值时计算，不支持下标和 len，遍历一次后就耗尽。' },
    { type: 'choice', q: '对一个已经取完所有元素的迭代器再调用 <code>next(it)</code>，会（　）。',
      options: ['抛出 StopIteration', '返回 None', '从头重新开始', '返回最后一个元素'], answer: 0,
      explain: '迭代器耗尽后 next 抛 StopIteration，for 循环正是靠捕获它来结束的。可以用 <code>next(it, 默认值)</code> 避免抛出。' },
    { type: 'choice', q: '<code>{w[0]: w for w in ["apple", "avocado", "bean"]}</code> 的结果是（　）。',
      options: ['<code>{"a": "avocado", "b": "bean"}</code>', '<code>{"a": "apple", "b": "bean"}</code>', '<code>{"a": ["apple", "avocado"], "b": ["bean"]}</code>', '抛出异常，因为键重复'], answer: 0,
      explain: '字典推导式中同一个键被多次赋值时，后面的覆盖前面的，所以 "a" 对应 "avocado"。要分组请用 defaultdict(list)。' },
    { type: 'choice', q: '下列哪种情况<b>更适合</b>用列表而不是生成器（　）。',
      options: ['结果要遍历多次，还要按下标访问和取长度', '逐行处理一个很大的文件', '表示一个无限的序列', '只需要对结果求一次和'], answer: 0,
      explain: '需要多次遍历、随机访问、len 时，列表更合适。大文件、无限序列、一次性聚合正是生成器的长处。' },
    { type: 'fill', q: '<code>list(zip("abc", [1, 2]))</code> 的长度是______。', answer: ['2'],
      explain: 'zip 以最短的序列为准，[1, 2] 只有 2 个元素，所以结果是 [("a", 1), ("b", 2)]。' }
  ],
  exercises: [
    {
      "q": "<p>用一行列表推导式求 1～10 里偶数的平方；再用集合推导式求一组单词有哪几种长度（排序后输出）。</p>",
      "starter": "squares = []  # TODO: 列表推导式\nprint(squares)\n\nwords = [\"hi\", \"cat\", \"dog\", \"hello\", \"ok\"]\nlengths = set()  # TODO: 集合推导式\nprint(sorted(lengths))\n",
      "answer": "squares = [n * n for n in range(1, 11) if n % 2 == 0]\nprint(squares)\n\nwords = [\"hi\", \"cat\", \"dog\", \"hello\", \"ok\"]\nlengths = {len(w) for w in words}\nprint(sorted(lengths))\n",
      "expect": "[4, 16, 36, 64, 100]\n[2, 3, 5]\n"
    },
    {
      "q": "<p>用 <code>enumerate</code>（从 1 开始编号）和 <code>zip</code> 把名字和分数配对，按“1. 张三 90”的格式输出；再用 <code>dict(zip(...))</code> 建成字典。</p>",
      "starter": "names = [\"张三\", \"李四\", \"王五\"]\nscores = [90, 78, 85]\nfor i in range(len(names)):  # TODO: 改成 enumerate + zip\n    print(names[i], scores[i])\ntable = {}  # TODO: dict(zip(...))\nprint(table)\n",
      "answer": "names = [\"张三\", \"李四\", \"王五\"]\nscores = [90, 78, 85]\nfor i, (name, score) in enumerate(zip(names, scores), start=1):\n    print(f\"{i}. {name} {score}\")\ntable = dict(zip(names, scores))\nprint(table)\n",
      "expect": "1. 张三 90\n2. 李四 78\n3. 王五 85\n{'张三': 90, '李四': 78, '王五': 85}\n"
    },
    {
      "q": "<p>写生成器函数 <code>fib()</code>，用 <code>yield</code> 无限产出斐波那契数 0, 1, 1, 2, …；用 <code>itertools.islice</code> 只取前 10 个输出。</p>",
      "starter": "from itertools import islice\n\ndef fib():\n    a, b = 0, 1\n    # TODO: 无限循环里 yield a，再更新 a, b\n    yield a\n\nprint(list(islice(fib(), 10)))\n",
      "answer": "from itertools import islice\n\ndef fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\nprint(list(islice(fib(), 10)))\n",
      "expect": "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n"
    },
    {
      "q": "<p>手动用 <code>iter</code> / <code>next</code> 走一遍迭代器，体会“迭代器只能用一遍”；再用生成器表达式求一段文本里所有数字行的和（跳过空行和非数字行）。</p>",
      "starter": "nums = [10, 20, 30]\nit = iter(nums)\nprint(next(it))\n# TODO: 再用 next 取两次，输出在同一行\nprint(list(it))\nprint(list(it))\n\ndata = \"\"\"12\nabc\n\n30\n8\n\"\"\"\ntotal = 0  # TODO: sum(生成器表达式)\nprint(total)\n",
      "answer": "nums = [10, 20, 30]\nit = iter(nums)\nprint(next(it))\nprint(next(it), next(it))\nprint(list(it))\nprint(list(it))\n\ndata = \"\"\"12\nabc\n\n30\n8\n\"\"\"\ntotal = sum(int(line) for line in data.splitlines() if line.strip().isdigit())\nprint(total)\n",
      "expect": "10\n20 30\n[]\n[]\n50\n"
    },
    {
      "q": "<p>写生成器 <code>chunks(items, n)</code>，把列表每 n 个切成一块依次产出（最后一块可以不满）。函数开头的 <code>print(\"开始\")</code> 用来观察惰性：生成器在第一次取值时才执行函数体，所以“已创建”会先输出。</p>",
      "starter": "def chunks(items, n):\n    print(\"开始\")\n    # TODO: 每次 yield items[i:i + n]\n    return []\n\ng = chunks([1, 2, 3, 4, 5, 6, 7], 3)\nprint(\"已创建\")\nfor c in g:\n    print(c)\n",
      "answer": "def chunks(items, n):\n    print(\"开始\")\n    for i in range(0, len(items), n):\n        yield items[i:i + n]\n\ng = chunks([1, 2, 3, 4, 5, 6, 7], 3)\nprint(\"已创建\")\nfor c in g:\n    print(c)\n",
      "expect": "已创建\n开始\n[1, 2, 3]\n[4, 5, 6]\n[7]\n"
    }
  ],
  handson: [
    '写一个生成器流水线：<code>read_lines(text)</code> 逐行产出 → <code>parse(lines)</code> 把 "名字,分数" 拆成元组并跳过格式错误的行 → 用 max 找出最高分。每个函数都用 yield，最后只遍历一遍。',
    '用 <code>sys.getsizeof</code> 比较 <code>[x for x in range(10**6)]</code> 和 <code>(x for x in range(10**6))</code> 的大小，并说明为什么差这么多。',
    '把自己代码里 3 处“建空列表 + for + append”的写法改成推导式；再找一处嵌套超过两层的，判断是否该保持普通循环。'
  ],
  links: [{ t: 'Python 官方教程（中文）：“迭代器”“生成器”两节', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
},

/* ======================= py 面向对象 ======================= */
{
  id: 'py-oop', stage: 'py', title: '面向对象', short: '面向对象',
  keywords: 'class 类 对象 __init__ self 实例属性 类属性 方法 继承 super 多态 特殊方法 魔术方法 __str__ __repr__ __eq__ __len__ property dataclass 鸭子类型',
  prereqs: ['py-comp'],
  tip: 'self 要显式写；可变的东西放实例属性、别放类属性；只存数据的类用 dataclass，要校验的属性用 @property。',
  learn: [
    { h: 'class、__init__ 与 self', html: `
<pre><code>class Account:
    rate = 0.01                 # 类属性：所有实例共享
    def __init__(self, owner, balance=0):
        self.owner = owner      # 实例属性：每个对象一份
        self.balance = balance
    def deposit(self, amount):
        self.balance += amount

a = Account("小明")
a.deposit(100)        # 等价于 Account.deposit(a, 100)</code></pre>
<ul><li><code>__init__</code> 是初始化方法（不是严格意义的构造器），创建对象后自动调用。</li>
<li>方法的第一个参数就是对象本身，约定叫 <b>self</b>，必须<b>显式写出</b>；访问属性也必须写 <code>self.x</code>，不写就成了局部变量。</li>
<li>Python 没有 private：单下划线 <code>_x</code> 表示“内部使用，请别碰”，只是约定。</li></ul>` },
    { h: '实例属性与类属性的坑', html: `
<pre><code>class Team:
    members = []          # 错：类属性，所有队伍共用一个列表
    def add(self, name):
        self.members.append(name)

class Team2:
    def __init__(self):
        self.members = [] # 对：每个实例各一份</code></pre>
<p>读 <code>obj.x</code> 时先找实例，找不到再找类。<b>给</b> <code>self.x</code> 赋值会在实例上新建属性，遮住类属性；但对类属性里的列表 <code>append</code> 是原地修改，所有实例都受影响。</p>
<div class="key">类属性只放常量和“所有实例共享”的东西（如计数器、配置默认值）；可变容器一律在 __init__ 里创建。</div>` },
    { h: '继承与 super', html: `
<pre><code>class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "..."

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)   # 先让父类完成初始化
        self.breed = breed
    def speak(self):             # 重写
        return "汪"

for a in [Animal("x"), Dog("旺财", "柴犬")]:
    print(a.name, a.speak())     # 多态</code></pre>
<p class="warn">子类写了 __init__ 却忘了调 <code>super().__init__</code>，父类设置的属性（如 name）就不存在，用到时抛 AttributeError。</p>
<p>Python 推崇<b>鸭子类型</b>：不看对象是什么类，只看它有没有需要的方法。所以继承用得比 Java 少，很多时候组合（把对象当属性）更简单。<code>isinstance(obj, 类)</code> 可判断类型，包括子类。</p>` },
    { h: '特殊方法、@property 与 dataclass', html: `
<table class="tbl"><tr><th>特殊方法</th><th>何时被调用</th></tr>
<tr><td><code>__str__</code></td><td><code>print(obj)</code>、<code>str(obj)</code>，给用户看</td></tr>
<tr><td><code>__repr__</code></td><td>交互环境回显、容器里显示、<code>repr()</code>，给开发者看</td></tr>
<tr><td><code>__eq__</code></td><td><code>a == b</code>（默认比较是否同一个对象）</td></tr>
<tr><td><code>__len__</code></td><td><code>len(obj)</code></td></tr></table>
<p>只写 __repr__ 时 print 也会用它；只写 __str__ 时，对象放在列表里打印仍显示默认的 <code>&lt;… object at 0x…&gt;</code>。</p>
<pre><code>from dataclasses import dataclass, field

@dataclass
class Item:
    name: str
    price: float = 0.0
    tags: list = field(default_factory=list)

    @property
    def label(self):          # 像属性一样读：item.label
        return f"{self.name} ¥{self.price}"</code></pre>
<p><b>@property</b> 让方法像属性一样访问，再配 <code>@x.setter</code> 可以在赋值时校验，调用方代码不用改。<b>@dataclass</b> 自动生成 __init__、__repr__、__eq__，适合“主要存数据”的类；可变默认值要用 <code>field(default_factory=list)</code>。</p>` }
  ],
  examples: [
    { type: 'choice', q: `下面代码的输出是（　）。<pre><code>class Cart:
    items = []
    def add(self, x):
        self.items.append(x)
a = Cart(); b = Cart()
a.add("书")
print(b.items)</code></pre>`,
      options: ['<code>[\'书\']</code>', '<code>[]</code>', '抛出 AttributeError', '<code>None</code>'], answer: 0,
      explain: 'items 是类属性，所有实例共享同一个列表；<code>self.items.append</code> 原地修改的是这个共享列表，所以 b 也能看到。应在 __init__ 里写 <code>self.items = []</code>。' },
    { type: 'choice', q: '子类 <code>Dog(Animal)</code> 定义了自己的 <code>__init__</code>，但没调用 <code>super().__init__(name)</code>。之后访问 <code>dog.name</code>（name 由父类 __init__ 设置）会（　）。',
      options: ['抛出 AttributeError', '自动调用父类 __init__，正常得到 name', '得到 None', '得到空字符串'], answer: 0,
      explain: '子类重写 __init__ 后，父类的 __init__ 不会自动执行，父类设置的属性就不存在。需要在子类 __init__ 里显式调用 <code>super().__init__(...)</code>。' },
    { type: 'choice', q: '一个 <code>User</code> 类已经被很多地方用 <code>user.age = 数字</code> 直接赋值。现在要求 age 不能为负数，又不想改调用方代码，最合适的做法是（　）。',
      options: ['把 age 改成 @property，在 setter 里校验', '要求所有调用方改成调用 <code>set_age()</code>', '在每个赋值的地方前面加 if 判断', '把 age 改成类属性'], answer: 0,
      explain: '@property 可以在保持 <code>obj.age = x</code> 语法不变的情况下加入校验逻辑，这是 Python 不需要预先写 getter / setter 的原因。另外两种改法要改大量调用方；类属性会让所有用户共享年龄。' },
    { type: 'choice', q: `下面代码运行到最后一行时会（　）。<pre><code>class Counter:
    def __init__(self):
        self.n = 0
    def inc(self):
        n = self.n + 1
c = Counter(); c.inc()
print(c.n)</code></pre>`,
      options: ['输出 0，因为 inc 里的 n 是局部变量，没有改到实例属性', '输出 1', '抛出 NameError', '抛出 TypeError，因为 inc 没有返回值'], answer: 0,
      explain: '方法里给不带 self. 的名字赋值，只是新建了局部变量 n，方法结束就丢弃。要改实例属性必须写 <code>self.n += 1</code>。' }
  ],
  tests: [
    { type: 'choice', q: '关于方法中的 <code>self</code>，下列说法正确的是（　）。',
      options: ['它是调用该方法的实例本身，定义方法时必须显式写出', '它是关键字，名字不能改', '调用方法时需要手动传入，如 <code>a.deposit(a, 100)</code>', '它指向类本身'], answer: 0,
      explain: '<code>a.deposit(100)</code> 会自动把 a 作为第一个参数传入。self 只是约定的名字，不是关键字；它指向实例，指向类的是类方法的 cls。' },
    { type: 'choice', q: '在方法里写 <code>balance = balance + amount</code>（没写 <code>self.</code>），结果是（　）。',
      options: ['操作的是局部变量，通常会抛 UnboundLocalError 或 NameError，实例属性不变', '自动修改实例属性 balance', '自动修改类属性 balance', '语法错误'], answer: 0,
      explain: 'Python 不会隐式把名字解析成实例属性（不像 Java 的 this 可省略）。访问实例属性必须写 self.balance。' },
    { type: 'choice', q: '没有定义 <code>__eq__</code> 的两个对象 <code>p1 = P(1)</code>、<code>p2 = P(1)</code>，<code>p1 == p2</code> 的结果是（　）。',
      options: ['False，默认按是否同一个对象比较', 'True，因为属性值相同', '抛出 TypeError', '取决于 __str__ 的返回值'], answer: 0,
      explain: '默认的 == 和 is 一样比较身份。要按内容比较，需要自己实现 __eq__，或者用 @dataclass 自动生成。' },
    { type: 'choice', q: '想让 <code>print(order)</code> 显示“订单 #12，3 件”，同时在调试时列表里的订单也显示得清楚，最合适的是（　）。',
      options: ['实现 __str__ 给用户看，再实现 __repr__ 给开发者看', '只实现 __len__', '重写 print 函数', '在类里加一个 show() 方法，每次手动调用'], answer: 0,
      explain: 'print 和 str 优先用 __str__；列表等容器显示元素时用 __repr__。只写 __str__ 的话，放进列表里打印仍是默认的内存地址样式。' },
    { type: 'choice', q: '要让 <code>len(playlist)</code> 返回歌曲数，需要在类中实现（　）。',
      options: ['<code>__len__</code>', '<code>length</code> 属性', '<code>size()</code> 方法', '<code>__count__</code>'], answer: 0,
      explain: '内置函数 len() 会调用对象的 __len__ 方法。这就是 Python 的“协议”：实现约定的特殊方法，对象就能配合内置函数和语法使用。' },
    { type: 'choice', q: '下列 dataclass 定义中，正确给每个实例一个独立空列表的是（　）。',
      options: ['<code>tags: list = field(default_factory=list)</code>', '<code>tags: list = []</code>', '<code>tags: list = list</code>', '<code>tags = []</code>，写在 __init__ 外面就行'], answer: 0,
      explain: 'dataclass 不允许直接用 [] 这种可变对象作默认值（会抛 ValueError），要用 default_factory 每次新建。<code>= list</code> 默认值是 list 这个类型本身；不带类型注解的 <code>tags = []</code> 不算字段，是所有实例共享的类属性。' },
    { type: 'choice', q: '关于“鸭子类型”，下列描述正确的是（　）。',
      options: ['只要对象有需要的方法就能用，不要求它继承某个特定父类', '所有类都必须继承 object 以外的一个基类', '必须先用 isinstance 检查类型才能调用方法', 'Python 不支持多态'], answer: 0,
      explain: '例如一个函数只调用 obj.read()，那么文件、io.StringIO 或你自己写的带 read 方法的类都可以传进去。这让 Python 中的多态不依赖继承。' },
    { type: 'choice', q: '<code>@property</code> 修饰的 <code>fahrenheit</code> 方法，如果没有写对应的 setter，执行 <code>t.fahrenheit = 100</code> 会（　）。',
      options: ['抛出 AttributeError（只读属性不能赋值）', '把方法覆盖成 100', '静默忽略', '自动换算并修改摄氏度'], answer: 0,
      explain: '只定义 getter 的 property 是只读的，赋值会抛 AttributeError。需要可写时用 <code>@fahrenheit.setter</code> 定义赋值逻辑。' },
    { type: 'fill', q: `<pre><code>class A:
    n = 0
    def __init__(self):
        A.n += 1
A(); A(); A()
print(A.n)</code></pre>输出是______。`, answer: ['3'],
      explain: '每创建一个实例，__init__ 就把类属性 A.n 加 1，创建了 3 个实例，所以是 3。' }
  ],
  exercises: [
    {
      "q": "<p>写 <code>Account</code> 类：<code>deposit</code> 存钱；<code>withdraw</code> 余额不足时输出“余额不足”且不扣款；<code>__str__</code> 返回“户名: 余额”。</p>",
      "starter": "class Account:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        pass  # TODO\n\n    def withdraw(self, amount):\n        pass  # TODO\n\n    # TODO: __str__\n\nacc = Account(\"小明\")\nacc.deposit(100)\nacc.withdraw(30)\nacc.withdraw(500)\nprint(acc.owner, acc.balance)\nprint(acc)\n",
      "answer": "class Account:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            print(\"余额不足\")\n            return\n        self.balance -= amount\n\n    def __str__(self):\n        return f\"{self.owner}: {self.balance}\"\n\nacc = Account(\"小明\")\nacc.deposit(100)\nacc.withdraw(30)\nacc.withdraw(500)\nprint(acc.owner, acc.balance)\nprint(acc)\n",
      "expect": "余额不足\n小明 70\n小明: 70\n"
    },
    {
      "q": "<p><code>Rect</code> 有宽高和 <code>area()</code>；<code>Square</code> 继承 <code>Rect</code>，在 <code>__init__</code> 里用 <code>super()</code> 复用父类初始化。另用类属性 <code>count</code> 统计一共创建了几个图形。</p>",
      "starter": "class Rect:\n    count = 0\n\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n        # TODO: 类属性 count 加 1\n\n    def area(self):\n        return self.w * self.h\n\nclass Square(Rect):\n    def __init__(self, side):\n        self.w = side  # TODO: 改成用 super() 调父类\n        self.h = side\n\nshapes = [Rect(2, 3), Square(4)]\nfor s in shapes:\n    print(type(s).__name__, s.area())\nprint(\"共\", Rect.count, \"个\")\n",
      "answer": "class Rect:\n    count = 0\n\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n        Rect.count += 1\n\n    def area(self):\n        return self.w * self.h\n\nclass Square(Rect):\n    def __init__(self, side):\n        super().__init__(side, side)\n\nshapes = [Rect(2, 3), Square(4)]\nfor s in shapes:\n    print(type(s).__name__, s.area())\nprint(\"共\", Rect.count, \"个\")\n",
      "expect": "Rect 6\nSquare 16\n共 2 个\n"
    },
    {
      "q": "<p>给 <code>Playlist</code> 补特殊方法：<code>__len__</code> 返回歌曲数，<code>__repr__</code> 返回 <code>Playlist([...])</code>，<code>__eq__</code> 在两个歌单的歌曲列表相同时相等。最后一行打印 <code>repr(p1)</code>，应输出 <code>Playlist([&#39;晴天&#39;, &#39;稻香&#39;])</code>。</p>",
      "starter": "class Playlist:\n    def __init__(self, songs):\n        self.songs = list(songs)\n\n    def __len__(self):\n        return 0  # TODO\n\n    # TODO: __repr__、__eq__\n\np1 = Playlist([\"晴天\", \"稻香\"])\np2 = Playlist([\"晴天\", \"稻香\"])\nprint(len(p1))\nprint(p1 == p2)\nprint(repr(p1))\n",
      "answer": "class Playlist:\n    def __init__(self, songs):\n        self.songs = list(songs)\n\n    def __len__(self):\n        return len(self.songs)\n\n    def __repr__(self):\n        return f\"Playlist({self.songs!r})\"\n\n    def __eq__(self, other):\n        if not isinstance(other, Playlist):\n            return NotImplemented\n        return self.songs == other.songs\n\np1 = Playlist([\"晴天\", \"稻香\"])\np2 = Playlist([\"晴天\", \"稻香\"])\nprint(len(p1))\nprint(p1 == p2)\nprint(repr(p1))\n",
      "expect": "2\nTrue\nPlaylist(['晴天', '稻香'])\n"
    },
    {
      "q": "<p>用 <code>@property</code> 让 <code>Temperature</code> 的 <code>celsius</code> 可读可写，但设成低于 -273.15 时抛 <code>ValueError</code>；再把 <code>fahrenheit</code>（= 摄氏 × 9 / 5 + 32）写成只读属性。</p>",
      "starter": "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    # TODO: 把 celsius 改成 property + setter（低于 -273.15 抛 ValueError）\n\n    @property\n    def fahrenheit(self):\n        return 0  # TODO\n\nt = Temperature(25)\nprint(t.celsius, t.fahrenheit)\nt.celsius = 100\nprint(t.fahrenheit)\ntry:\n    t.celsius = -300\nexcept ValueError as e:\n    print(\"错误:\", e)\n",
      "answer": "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    @property\n    def celsius(self):\n        return self._celsius\n\n    @celsius.setter\n    def celsius(self, value):\n        if value < -273.15:\n            raise ValueError(\"低于绝对零度\")\n        self._celsius = value\n\n    @property\n    def fahrenheit(self):\n        return self._celsius * 9 / 5 + 32\n\nt = Temperature(25)\nprint(t.celsius, t.fahrenheit)\nt.celsius = 100\nprint(t.fahrenheit)\ntry:\n    t.celsius = -300\nexcept ValueError as e:\n    print(\"错误:\", e)\n",
      "expect": "25 77.0\n212.0\n错误: 低于绝对零度\n"
    },
    {
      "q": "<p>用 <code>@dataclass</code> 改写 <code>Point(x, y)</code>，自动得到 <code>__init__</code>、<code>__repr__</code>、<code>__eq__</code>；再加方法 <code>dist2()</code> 返回 x² + y²，按它从小到大给点排序并打印排好序的列表（dataclass 自动生成的 repr 形如 <code>Point(x=1, y=1)</code>）。</p>",
      "starter": "from dataclasses import dataclass\n\nclass Point:  # TODO: 改成 @dataclass，声明 x: int、y: int，加 dist2\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\npts = [Point(3, 4), Point(1, 1), Point(0, 2)]\nprint(Point(1, 1) == Point(1, 1))\nprint(pts)  # TODO: 改成 print(sorted(pts, key=...))，按 dist2 从小到大\n",
      "answer": "from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int\n\n    def dist2(self):\n        return self.x ** 2 + self.y ** 2\n\npts = [Point(3, 4), Point(1, 1), Point(0, 2)]\nprint(Point(1, 1) == Point(1, 1))\nprint(sorted(pts, key=Point.dist2))\n",
      "expect": "True\n[Point(x=1, y=1), Point(x=0, y=2), Point(x=3, y=4)]\n"
    }
  ],
  handson: [
    '设计一个简易“待办清单”：<code>Task</code> 用 dataclass（标题、是否完成、标签列表），<code>TodoList</code> 实现 add、done、__len__、__iter__（遍历未完成任务），打印时显示“3 项未完成”。',
    '写 <code>Shape</code> 基类和 <code>Circle</code>、<code>Rect</code> 两个子类，各自实现 area()；用一个列表混放不同图形求总面积。再写一个与 Shape 无关、但也有 area() 的类放进去，体会鸭子类型。',
    '给一个已有的类加 @property 校验（如年龄 0～150、邮箱必须含 @），写几个断言覆盖合法值、边界值和非法值。'
  ],
  links: [{ t: 'Python 官方教程（中文）：“类”一章', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
}

);
