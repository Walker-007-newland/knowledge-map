// AI 路线 阶段 py（Python 编程）组 A：起步、条件与循环、字符串、列表与元组
RK.ai.nodes.push(

/* ======================= py 起步：变量、类型与输出 ======================= */
{
  id: 'py-start', stage: 'py', title: '起步：变量、类型与输出', short: 'Python起步',
  keywords: 'python 入门 变量 动态类型 int float str bool None print f-string 格式化 整除 取余 浮点误差 注释 缩进 交互式 脚本',
  prereqs: ['ai-why'],
  tip: 'Python 变量没有类型、值才有类型；/ 永远得到浮点数，// 是向下取整；缩进就是语法。',
  learn: [
    { h: '怎么运行 Python', html: `
<p>两种方式：</p>
<table class="tbl"><tr><th>方式</th><th>怎么用</th><th>适合</th></tr>
<tr><td>交互式（REPL）</td><td>终端输入 <code>python</code>，出现 <code>&gt;&gt;&gt;</code> 后逐行输入，回车立刻看结果</td><td>试一个函数、查一个值</td></tr>
<tr><td>脚本</td><td>把代码存成 <code>hello.py</code>，运行 <code>python hello.py</code></td><td>正式写程序</td></tr></table>
<p>交互式里直接写表达式就会显示它的值；脚本里必须 <code>print()</code> 才有输出。本 App 的代码练习相当于运行脚本，只比对 <code>print</code> 的输出。</p>
<p><b>缩进就是语法</b>：别的语言用 <code>{}</code> 划代码块，Python 用冒号加缩进，约定 4 个空格，同一块里缩进必须一致。<code>#</code> 开头是注释。</p>
<pre><code>if 3 &gt; 2:
    print("对")     # 缩进 4 格，属于 if
print("结束")       # 顶格，不属于 if</code></pre>
<p class="warn">易错：空格和制表符混用，或者同一块里缩进格数不一样，会报 <code>IndentationError</code>。编辑器设置成“Tab 转 4 个空格”。</p>` },
    { h: '变量与基本类型', html: `
<p>Python 是<b>动态类型</b>：变量不用声明类型，只是一个名字，指向某个值；同一个名字可以先指向数字、再指向字符串。类型属于值，不属于变量。</p>
<table class="tbl"><tr><th>类型</th><th>例子</th><th>要点</th></tr>
<tr><td>int</td><td><code>42</code>、<code>-7</code>、<code>10**20</code></td><td>整数没有大小上限，不会溢出</td></tr>
<tr><td>float</td><td><code>3.14</code>、<code>1e-9</code></td><td>双精度浮点，有误差</td></tr>
<tr><td>str</td><td><code>"hi"</code>、<code>'hi'</code></td><td>单双引号等价；三引号可跨行</td></tr>
<tr><td>bool</td><td><code>True</code>、<code>False</code></td><td>首字母大写；是 int 的子类，<code>True + True</code> 等于 2</td></tr>
<tr><td>None</td><td><code>None</code></td><td>“没有值”，相当于别的语言的 null</td></tr></table>
<p>用 <code>type(x)</code> 查类型。类型之间<b>不会自动转换</b>：<code>"42" + 1</code> 直接报 <code>TypeError</code>，要写 <code>int("42") + 1</code> 或 <code>"42" + str(1)</code>。<code>int(3.9)</code> 是 3（直接截掉小数，不是四舍五入）。</p>
<div class="key">动态 ≠ 弱类型：Python 不声明类型，但运算时类型很严格，不会像 JavaScript 那样把字符串和数字悄悄拼起来。</div>` },
    { h: '运算：除法、整除、取余和浮点误差', html: `
<table class="tbl"><tr><th>写法</th><th>结果</th><th>说明</th></tr>
<tr><td><code>7 / 2</code></td><td>3.5</td><td><code>/</code> 永远得到 float，<code>6 / 2</code> 也是 3.0</td></tr>
<tr><td><code>7 // 2</code></td><td>3</td><td>整除，<b>向下取整</b></td></tr>
<tr><td><code>-7 // 2</code></td><td>-4</td><td>向下取整，不是向 0 取整（C、Java 得 -3）</td></tr>
<tr><td><code>-7 % 2</code></td><td>1</td><td>余数和除数同号</td></tr>
<tr><td><code>2 ** 10</code></td><td>1024</td><td>乘方</td></tr></table>
<p>浮点数用二进制表示，0.1 存不准：<code>0.1 + 0.2</code> 得到 <code>0.30000000000000004</code>，所以 <code>0.1 + 0.2 == 0.3</code> 是 False。比较浮点数用“差的绝对值小于一个很小的数”（或 <code>math.isclose</code>）；涉及钱的计算用整数“分”或 <code>decimal</code> 模块。</p>
<p class="warn">易错：<code>round(2.5)</code> 是 2，<code>round(3.5)</code> 是 4——Python 的 round 是“四舍六入五成双”（银行家舍入），不是小学的四舍五入。</p>` },
    { h: 'print 与 f-string', html: `
<p><code>print</code> 可以接多个参数，默认用空格隔开、末尾换行；<code>sep</code> 改分隔符，<code>end</code> 改结尾。</p>
<pre><code>print("a", "b", 1)          # a b 1
print("a", "b", sep="-")    # a-b
print("不换行", end="")</code></pre>
<p>拼字符串首选 <b>f-string</b>：字符串前加 <code>f</code>，花括号里直接写变量或表达式，冒号后写格式。</p>
<pre><code>name, score = "Amy", 92.456
print(f"{name} 得了 {score:.1f} 分")   # Amy 得了 92.5 分
print(f"{7:03d}")      # 007，宽 3 位补 0
print(f"{0.256:.1%}")  # 25.6%
print(f"{name=}")      # name='Amy'，调试很方便</code></pre>
<div class="key">f-string 比 <code>"..." + str(x)</code> 和 <code>%</code> 格式化都清楚，新代码一律用它。</div>` }
  ],
  examples: [
    { type: 'choice', q: '一段 Java 代码 <code>int a = -7 / 2;</code> 得到 -3。照搬成 Python 写 <code>a = -7 // 2</code>，结果是（　）。',
      options: ['-4，因为 // 是向下取整', '-3，和 Java 一样向 0 取整', '-3.5，因为 Python 的除法都得到浮点数', '报错，整数不能整除负数'], answer: 0,
      explain: 'Python 的 // 是向下取整（往负无穷方向），-3.5 向下取整是 -4。Java、C 的整数除法是向 0 截断，得 -3。迁移代码处理负数时要特别注意。/ 才得到浮点数 -3.5。' },
    { type: 'choice', q: '程序里写了 <code>total = 0.1 + 0.2</code>，接着 <code>if total == 0.3:</code> 一直不成立。最合适的改法是（　）。',
      options: ['改成判断 <code>abs(total - 0.3) &lt; 1e-9</code>（或用 math.isclose）', '把 0.1 和 0.2 都写成字符串再相加', '改用 <code>int(total) == 0</code> 判断', '这是 Python 的 bug，换个版本就好了'], answer: 0,
      explain: '0.1 和 0.2 在二进制里存不准，相加得 0.30000000000000004，这是所有用 IEEE 754 浮点数的语言共有的现象。比较浮点数要允许一个很小的误差。字符串相加只是拼接；int 截断丢掉了小数，判断没有意义。' },
    { type: 'choice', q: '已知 <code>x = "5"</code>，执行 <code>print(x * 3)</code> 输出（　）。',
      options: ['555', '15', '报 TypeError', '5 5 5'], answer: 0,
      explain: '字符串乘整数表示重复，"5" * 3 得到 "555"。Python 不会把字符串自动转成数字，想得到 15 要写 int(x) * 3。注意 "5" + 3 才会报 TypeError。' }
  ],
  tests: [
    { type: 'choice', q: '下列关于 Python 动态类型的说法，正确的是（　）。',
      options: ['同一个变量名可以先赋值整数、再赋值字符串，类型是跟着值走的', '变量第一次赋值后类型就固定，再赋其他类型会报错', '动态类型意味着 "3" + 4 会自动得到 7', '使用变量前必须先声明它的类型'], answer: 0,
      explain: '变量只是名字，类型属于它当前指向的值，可以重新指向别的类型。但运算时类型严格，"3" + 4 会报 TypeError。Python 不需要声明变量类型。' },
    { type: 'choice', q: '<code>print(7 / 7)</code> 的输出是（　）。',
      options: ['1.0', '1', '7', '报错'], answer: 0,
      explain: 'Python 3 的 / 总是返回浮点数，即使能整除，所以是 1.0。想要整数结果用 7 // 7。' },
    { type: 'choice', q: '<code>print(-7 % 3)</code> 的输出是（　）。',
      options: ['2', '-1', '1', '-2'], answer: 0,
      explain: 'Python 的取余结果和除数同号，并满足 a == (a // b) * b + a % b。-7 // 3 是 -3，(-3) * 3 = -9，-7 - (-9) = 2。C、Java 里结果是 -1。' },
    { type: 'choice', q: '要把一个列表里的价格（float）求和后跟 19.9 比较是否相等，下列做法最可靠的是（　）。',
      options: ['判断两者差的绝对值是否小于一个很小的数', '直接用 ==', '先用 int() 转换再比较', '先用 str() 转换再比较字符串'], answer: 0,
      explain: '浮点数累加会产生微小误差，直接 == 很可能不成立。int 会截掉小数；转字符串比较同样受误差影响。金额最好用整数“分”或 decimal 来算。' },
    { type: 'choice', q: '下面代码运行会怎样？<pre><code>if True:\n    print("a")\n  print("b")</code></pre>',
      options: ['报 IndentationError，同一代码块的缩进不一致', '输出 a 和 b', '只输出 a', '只输出 b'], answer: 0,
      explain: '缩进是 Python 的语法。第三行缩进 2 格，既不属于 if 块（4 格）也不顶格，解释器无法判断它属于哪一层，报缩进错误。' },
    { type: 'choice', q: '变量 <code>rate = 0.256</code>，想输出 <code>通过率 25.6%</code>，正确的写法是（　）。',
      options: ['<code>print(f"通过率 {rate:.1%}")</code>', '<code>print("通过率 " + rate * 100 + "%")</code>', '<code>print("通过率 {rate:.1%}")</code>', '<code>print(f"通过率 {rate}%")</code>'], answer: 0,
      explain: '格式说明 .1% 会乘以 100 并保留 1 位小数再加百分号。字符串和数字直接相加会报错；少了前缀 f 就不会替换花括号；直接写 {rate}% 输出的是 0.256%。' },
    { type: 'choice', q: '<code>print(round(2.5), round(3.5))</code> 的输出是（　）。',
      options: ['2 4', '3 4', '2 3', '3 3'], answer: 0,
      explain: 'Python 的 round 采用“四舍六入五成双”：恰好在中间时取偶数，2.5 → 2，3.5 → 4。需要传统四舍五入时用 decimal 模块指定舍入方式。' },
    { type: 'choice', q: '在 Python 交互式环境（&gt;&gt;&gt;）和脚本文件里分别只写一行 <code>1 + 1</code>，结果是（　）。',
      options: ['交互式会显示 2，脚本运行什么也不输出', '两边都显示 2', '两边都不显示', '脚本会报语法错误'], answer: 0,
      explain: '交互式环境会自动显示表达式的值，方便试验；脚本里表达式的值被计算后直接丢弃，要 print 才有输出。' },
    { type: 'fill', q: '<code>print(type(None).__name__)</code> 输出什么？',
      answer: ['NoneType'],
      explain: 'None 是 NoneType 类型的唯一实例，表示“没有值”。判断是否为 None 习惯写 x is None。' }
  ],
  exercises: [
    {
      "q": "用 f-string 输出一句话：<code>小明今年12岁，身高1.46米</code>。身高要保留 2 位小数（变量里是 1.456）。",
      "starter": "name = \"小明\"\nage = 12\nheight = 1.456\n# TODO: 用 f-string 拼成一句话，身高保留 2 位小数\nprint(name, age, height)\n",
      "answer": "name = \"小明\"\nage = 12\nheight = 1.456\nprint(f\"{name}今年{age}岁，身高{height:.2f}米\")\n",
      "expect": "小明今年12岁，身高1.46米\n"
    },
    {
      "q": "把 3725 秒换算成“时 分 秒”，输出 <code>1小时2分5秒</code>。用整除 <code>//</code> 和取余 <code>%</code>。",
      "starter": "seconds = 3725\nh = seconds / 3600   # TODO: 改成整除\nm = 0                # TODO: 剩下的秒数里有几分钟\ns = 0                # TODO: 最后剩几秒\nprint(f\"{h}小时{m}分{s}秒\")\n",
      "answer": "seconds = 3725\nh = seconds // 3600\nm = seconds % 3600 // 60\ns = seconds % 60\nprint(f\"{h}小时{m}分{s}秒\")\n",
      "expect": "1小时2分5秒\n"
    },
    {
      "q": "字符串和数字不能直接相加。修改代码，第一行输出 <code>43</code>（按数字相加），第二行输出 <code>421</code>（按字符串拼接），第三行输出 <code>3</code>（把 3.9 转成整数）。",
      "starter": "a = \"42\"\nb = 1\nc = 3.9\n# TODO: 用 int() / str() 做类型转换\nprint(a, b)\nprint(a, b)\nprint(c)\n",
      "answer": "a = \"42\"\nb = 1\nc = 3.9\nprint(int(a) + b)\nprint(a + str(b))\nprint(int(c))\n",
      "expect": "43\n421\n3\n"
    },
    {
      "q": "体会浮点误差：依次输出 <code>0.1 + 0.2</code> 的值、它是否 <code>== 0.3</code>、用“差的绝对值小于 1e-9”判断是否相等，以及保留 2 位小数的结果。",
      "starter": "a = 0.1 + 0.2\nprint(a)\n# TODO: 再输出三行：a == 0.3、用误差范围比较、保留 2 位小数\n",
      "answer": "a = 0.1 + 0.2\nprint(a)\nprint(a == 0.3)\nprint(abs(a - 0.3) < 1e-9)\nprint(f\"{a:.2f}\")\n",
      "expect": "0.30000000000000004\nFalse\nTrue\n0.30\n"
    }
  ],
  handson: [
    '在电脑上装好 Python 3，终端输入 <code>python</code> 进入交互式，分别算 <code>2**100</code>、<code>-7//2</code>、<code>0.1+0.2</code>、<code>round(2.5)</code>，再用 <code>type()</code> 看几个值的类型，最后 <code>exit()</code> 退出。约 15 分钟。',
    '写一个 <code>bmi.py</code> 脚本：在文件里写好身高（米）和体重（公斤）两个变量，算出 BMI 并用 f-string 输出“BMI = 21.3”（保留 1 位小数），用 <code>python bmi.py</code> 运行通过算完成。',
    '把你熟悉的语言里一段“整数除法 + 取余”的代码（如把分钟换算成“几小时几分”）改写成 Python，分别用正数和负数测试，写下两种语言结果不同的地方。'
  ],
  links: [{ t: 'Python 官方教程（中文）', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
},

/* ======================= py 条件与循环 ======================= */
{
  id: 'py-control', stage: 'py', title: '条件与循环', short: '条件与循环',
  keywords: 'python if elif else 真值 truthy falsy for range while break continue 循环 else match case 流程控制',
  prereqs: ['py-start'],
  tip: 'for 是“遍历一个序列”，不是计数循环；空容器、0、None、空串都当作假；循环的 else 在“没被 break”时才执行。',
  learn: [
    { h: 'if / elif / else 与真值判断', html: `
<pre><code>if score &gt;= 90:
    grade = "A"
elif score &gt;= 60:
    grade = "及格"
else:
    grade = "不及格"</code></pre>
<p>注意是 <code>elif</code>，没有 <code>else if</code>；条件不用括号，末尾要冒号。逻辑运算用英文单词 <code>and</code> / <code>or</code> / <code>not</code>，比较可以连写：<code>0 &lt;= x &lt; 10</code>。</p>
<p><b>真值判断</b>：任何值都能放进 if。下面这些当作假（falsy），其余都是真：</p>
<table class="tbl"><tr><th>当作假</th><th>容易误判为假、其实是真</th></tr>
<tr><td><code>False</code>、<code>None</code>、<code>0</code>、<code>0.0</code></td><td><code>"0"</code>、<code>"False"</code>（非空字符串）</td></tr>
<tr><td><code>""</code>、<code>[]</code>、<code>{}</code>、<code>()</code>、<code>set()</code></td><td><code>[0]</code>、<code>[None]</code>（非空列表）</td></tr></table>
<p>所以判断列表非空直接写 <code>if items:</code>。但如果 0 是合法值，要写 <code>if x is not None:</code>，不能写 <code>if x:</code>。</p>
<p>条件表达式（三元）：<code>label = "成年" if age &gt;= 18 else "未成年"</code>。</p>` },
    { h: 'for 与 range', html: `
<p>Python 的 <code>for</code> 是<b>遍历</b>：依次取出序列（列表、字符串、range 等）里的每个元素，没有 C 风格的 <code>for (i=0; i&lt;n; i++)</code>。</p>
<pre><code>for ch in "abc":
    print(ch)            # a b c 各一行
for i in range(3):       # 0 1 2
    print(i)</code></pre>
<table class="tbl"><tr><th>写法</th><th>产生</th></tr>
<tr><td><code>range(5)</code></td><td>0,1,2,3,4（不含 5）</td></tr>
<tr><td><code>range(2, 6)</code></td><td>2,3,4,5</td></tr>
<tr><td><code>range(10, 0, -3)</code></td><td>10,7,4,1</td></tr></table>
<p>要同时拿下标和元素，用 <code>for i, x in enumerate(items):</code>，不要写 <code>for i in range(len(items))</code> 再 <code>items[i]</code>。</p>
<p class="warn">易错：遍历列表时在循环里删除它的元素，会跳过元素。要删就遍历一个副本 <code>for x in items[:]:</code>，或者生成一个新列表。</p>` },
    { h: 'while、break、continue 与循环的 else', html: `
<p><code>while 条件:</code> 条件为真就一直循环，适合“不知道要循环几次”的情况；循环体里一定要有让条件最终变假的语句，否则死循环。Python 没有 <code>do-while</code>，常用 <code>while True:</code> 加 <code>break</code> 代替。</p>
<p><code>break</code> 跳出整个循环；<code>continue</code> 跳过本次剩下的语句，进入下一次。它们只影响<b>最内层</b>循环。</p>
<p>Python 特有：<b>循环可以带 else</b>，循环正常结束（没被 break）时执行 else；被 break 打断则不执行。适合“查找，找不到时做点什么”：</p>
<pre><code>for x in nums:
    if x &lt; 0:
        print("有负数", x)
        break
else:
    print("没有负数")</code></pre>
<div class="key">把循环的 else 读成“没有 break 时”。它和 if 的 else 意思不一样，不熟悉的读者容易看错，团队代码里用之前加个注释。</div>` },
    { h: 'match（结构化模式匹配）', html: `
<p>Python 3.10 起有 <code>match / case</code>，可以当 switch 用，还能按结构拆解数据。<code>case _:</code> 是兜底；分支之间<b>不会贯穿</b>，不需要 break。</p>
<pre><code>match command:
    case "start":
        run()
    case "stop" | "quit":
        stop()
    case _:
        print("未知命令")</code></pre>
<p>简单的值判断用 if / elif 或字典查表更普遍；match 适合按数据形状分派（如解析不同结构的消息），入门阶段知道有它即可。</p>` }
  ],
  examples: [
    { type: 'choice', q: '函数返回的 <code>count</code> 可能是 None（表示没查到），也可能是 0（查到了，数量为 0）。要区分“没查到”，应写（　）。',
      options: ['<code>if count is None:</code>', '<code>if not count:</code>', '<code>if count == False:</code>', '<code>if count == "":</code>'], answer: 0,
      explain: 'None 和 0 都是假值，not count 对两者都成立，分不开。用 is None 精确判断“没有值”。和 False、空串比较都不对。' },
    { type: 'choice', q: '下面代码的输出是（　）。<pre><code>for n in [3, 5, 7]:\n    if n % 2 == 0:\n        print("找到偶数")\n        break\nelse:\n    print("全是奇数")</code></pre>',
      options: ['全是奇数', '找到偶数', '什么也不输出', '报语法错误'], answer: 0,
      explain: '列表里没有偶数，循环没被 break，正常结束，于是执行循环的 else。如果中途 break，else 就不执行。for 后面接 else 是合法语法。' },
    { type: 'choice', q: '要从 10 倒数到 1（含 1），正确的写法是（　）。',
      options: ['<code>for i in range(10, 0, -1):</code>', '<code>for i in range(10, 1, -1):</code>', '<code>for i in range(1, 10):</code>', '<code>for i in range(10, 0):</code>'], answer: 0,
      explain: 'range 不含终点，步长为 -1 时终点写 0 才能取到 1。range(10, 1, -1) 只到 2；range(1, 10) 是正序；range(10, 0) 步长默认 1，一个数也不产生。' }
  ],
  tests: [
    { type: 'choice', q: '下列值放在 <code>if</code> 里，会被当作<b>真</b>的是（　）。',
      options: ['<code>"0"</code>', '<code>0</code>', '<code>[]</code>', '<code>None</code>'], answer: 0,
      explain: '非空字符串都是真，即使内容是 "0"。0、空列表、None 都是假值。从文本里读到的 "0" 要先转成数字再判断。' },
    { type: 'choice', q: '<code>list(range(1, 10, 3))</code> 的结果是（　）。',
      options: ['[1, 4, 7]', '[1, 4, 7, 10]', '[1, 3, 6, 9]', '[3, 6, 9]'], answer: 0,
      explain: '从 1 开始，每次加 3，不含终点 10：1、4、7。' },
    { type: 'choice', q: '下面代码输出几行？<pre><code>for i in range(5):\n    if i == 1:\n        continue\n    if i == 3:\n        break\n    print(i)</code></pre>',
      options: ['2 行（0 和 2）', '3 行（0、2、4）', '1 行（0）', '4 行'], answer: 0,
      explain: 'i=0 输出；i=1 被 continue 跳过；i=2 输出；i=3 时 break 结束整个循环，4 不会执行。' },
    { type: 'choice', q: '关于 <code>for ... else</code>，正确的是（　）。',
      options: ['循环没被 break、正常结束时执行 else', '循环一次都没执行时才执行 else', '循环被 break 时执行 else', '只有 while 能带 else，for 不能'], answer: 0,
      explain: 'for 和 while 都可以带 else，含义都是“没有 break 时执行”。循环体一次没执行（如遍历空列表）也算正常结束，同样会执行 else，但这不是唯一条件。' },
    { type: 'choice', q: '需要“先执行一次再判断条件”（类似别的语言的 do-while），Python 的惯用写法是（　）。',
      options: ['<code>while True:</code> 里先执行，满足退出条件时 <code>break</code>', '用 <code>do: ... while 条件</code>', '用 <code>repeat ... until</code>', '用 <code>for</code> 循环加 <code>goto</code>'], answer: 0,
      explain: 'Python 没有 do-while、repeat-until 和 goto。while True 加 break 是标准替代写法，要确保一定有机会走到 break。' },
    { type: 'choice', q: '遍历列表 <code>nums = [1, 2, 2, 3]</code> 并在循环里 <code>nums.remove(x)</code> 删掉所有 2，结果发现还剩一个 2。合适的改法是（　）。',
      options: ['遍历副本 <code>for x in nums[:]:</code>，或者构造一个不含 2 的新列表', '把 for 改成 while True', '在 remove 后加 continue', '在 remove 后加 break'], answer: 0,
      explain: '边遍历边删除会让后面的元素前移，迭代位置跳过了紧跟着的那个 2。遍历副本或者生成新列表是最清楚的做法。加 continue 不改变迭代位置；加 break 删掉第一个 2 就退出了，第二个 2 还在。' },
    { type: 'choice', q: '关于 <code>match / case</code>，下列说法正确的是（　）。',
      options: ['命中一个 case 后不会继续执行下一个 case，不需要 break', '每个 case 末尾必须写 break，否则会贯穿', '<code>case default:</code> 表示兜底', 'match 只能匹配整数'], answer: 0,
      explain: 'match 的分支不会贯穿；兜底写 case _:（写 case default: 会把值绑定到名为 default 的变量上，也能兜底，但不是惯用写法且容易误解）；它能匹配字符串、元组、字典等结构。' },
    { type: 'fill', q: '<code>x = 15</code>，表达式 <code>"大" if x &gt; 10 else "小"</code> 的值是什么？（只写结果）',
      answer: ['大'],
      explain: '条件表达式：条件为真取 if 前面的值，否则取 else 后面的值。15 > 10 成立，结果是“大”。' }
  ],
  exercises: [
    {
      "q": "FizzBuzz：输出 1～15，每个数一行；3 的倍数输出 <code>Fizz</code>，5 的倍数输出 <code>Buzz</code>，既是 3 又是 5 的倍数输出 <code>FizzBuzz</code>。",
      "starter": "for i in range(1, 16):\n    # TODO: 用 if / elif / else 判断\n    print(i)\n",
      "answer": "for i in range(1, 16):\n    if i % 15 == 0:\n        print(\"FizzBuzz\")\n    elif i % 3 == 0:\n        print(\"Fizz\")\n    elif i % 5 == 0:\n        print(\"Buzz\")\n    else:\n        print(i)\n",
      "expect": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n"
    },
    {
      "q": "给成绩定等级：≥ 90 为 A，≥ 80 为 B，≥ 60 为 C，其余为 D。每行输出“分数 等级”，如 <code>95 A</code>。分数为负数的是录入错误，用 <code>continue</code> 跳过不输出。",
      "starter": "scores = [95, 82, -1, 67, 45, 78]\nfor s in scores:\n    grade = \"D\"  # TODO: 跳过负数；用 if / elif 定等级\n    print(s, grade)\n",
      "answer": "scores = [95, 82, -1, 67, 45, 78]\nfor s in scores:\n    if s < 0:\n        continue\n    if s >= 90:\n        grade = \"A\"\n    elif s >= 80:\n        grade = \"B\"\n    elif s >= 60:\n        grade = \"C\"\n    else:\n        grade = \"D\"\n    print(s, grade)\n",
      "expect": "95 A\n82 B\n67 C\n45 D\n78 C\n"
    },
    {
      "q": "用 <code>while</code> 做“3n+1”游戏：n 是偶数就除以 2，是奇数就变成 3n+1，直到 n 等于 1。从 n = 6 开始，第一行输出经过的每个数（空格分隔，含 6 和 1），第二行输出 <code>步数: 8</code>。",
      "starter": "n = 6\nsteps = 0\npath = [n]\n# TODO: 用 while 循环，每一步更新 n、steps，并把新的 n 加进 path\nprint(*path)\nprint(\"步数:\", steps)\n",
      "answer": "n = 6\nsteps = 0\npath = [n]\nwhile n != 1:\n    if n % 2 == 0:\n        n = n // 2\n    else:\n        n = 3 * n + 1\n    steps += 1\n    path.append(n)\nprint(*path)\nprint(\"步数:\", steps)\n",
      "expect": "6 3 10 5 16 8 4 2 1\n步数: 8\n"
    },
    {
      "q": "用 <code>for ... else</code> 找出 2～29 之间的质数，输出成一个列表。提示：内层循环找到因数就 <code>break</code>；没被 break 过才会执行 else。",
      "starter": "primes = []\nfor n in range(2, 30):\n    # TODO: 内层 for 试除 2 到 n-1，配合 break 和 else\n    primes.append(n)\nprint(primes)\n",
      "answer": "primes = []\nfor n in range(2, 30):\n    for d in range(2, n):\n        if n % d == 0:\n            break\n    else:\n        primes.append(n)\nprint(primes)\n",
      "expect": "[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]\n"
    }
  ],
  handson: [
    '写一个“猜数字”脚本：程序里固定目标数 37，用 while 循环和 <code>input()</code> 让你反复猜，提示“大了 / 小了”，猜中输出用了几次。在电脑终端运行能玩通算完成（App 里不支持 input）。',
    '用 for 加 range 打印九九乘法表（下三角，每行用 <code>end</code> 控制不换行），对齐用 f-string 的宽度格式，如 <code>{i*j:2d}</code>。',
    '找一段你写过的含 switch 的代码，分别用 if / elif、字典查表、match 三种方式改写成 Python，比较哪种最清楚。'
  ],
  links: [{ t: 'Python 官方教程（中文）：更多控制流工具', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
},

/* ======================= py 字符串 ======================= */
{
  id: 'py-str', stage: 'py', title: '字符串', short: '字符串',
  keywords: 'python str 字符串 索引 切片 不可变 split join strip replace find index startswith endswith 格式化 in 编码 bytes utf-8 decode encode',
  prereqs: ['py-control'],
  tip: '字符串不可变，所有方法都返回新串；切片左闭右开；文本是 str、网络和文件里的原始数据是 bytes，两者之间靠编码转换。',
  learn: [
    { h: '索引与切片', html: `
<p>字符串是字符序列，下标从 0 开始；<b>负数下标从末尾数</b>，<code>s[-1]</code> 是最后一个字符。</p>
<p>切片 <code>s[start:stop:step]</code>：<b>左闭右开</b>，省略 start 表示从头，省略 stop 表示到尾。</p>
<table class="tbl"><tr><th>s = "Python"</th><th>结果</th></tr>
<tr><td><code>s[0]</code>、<code>s[-1]</code></td><td>"P"、"n"</td></tr>
<tr><td><code>s[1:4]</code></td><td>"yth"（下标 1、2、3）</td></tr>
<tr><td><code>s[:2]</code>、<code>s[-3:]</code></td><td>"Py"、"hon"</td></tr>
<tr><td><code>s[::2]</code></td><td>"Pto"（每隔一个取）</td></tr>
<tr><td><code>s[::-1]</code></td><td>"nohtyP"（倒序）</td></tr></table>
<p>下标越界会报 <code>IndexError</code>，但<b>切片越界不报错</b>：<code>s[2:100]</code> 得到 "thon"，<code>s[10:]</code> 得到空串。</p>` },
    { h: '不可变与常用方法', html: `
<p>字符串<b>不可变</b>：<code>s[0] = "J"</code> 会报 <code>TypeError</code>。所有“修改”方法都返回新字符串，原串不变，所以要接住返回值：<code>s = s.strip()</code>。</p>
<table class="tbl"><tr><th>方法</th><th>作用</th></tr>
<tr><td><code>split(sep)</code></td><td>拆成列表；不传参数时按任意空白拆，并丢掉空项</td></tr>
<tr><td><code>"-".join(lst)</code></td><td>用 "-" 把字符串列表连起来（元素必须都是 str）</td></tr>
<tr><td><code>strip()</code> / <code>lstrip</code> / <code>rstrip</code></td><td>去两端（左、右）空白</td></tr>
<tr><td><code>replace(a, b)</code></td><td>把所有 a 换成 b</td></tr>
<tr><td><code>find(x)</code> / <code>index(x)</code></td><td>找位置；找不到时 find 返回 -1，index 报 ValueError</td></tr>
<tr><td><code>startswith</code> / <code>endswith</code></td><td>判断开头 / 结尾，可传元组：<code>name.endswith((".jpg", ".png"))</code></td></tr>
<tr><td><code>lower</code> / <code>upper</code> / <code>count</code></td><td>大小写转换、计数</td></tr></table>
<p>判断包含用 <code>in</code>：<code>"py" in "python"</code> 为 True，比 <code>find() != -1</code> 清楚。</p>
<p class="warn">易错：<code>"a,b,,c".split(",")</code> 得到 <code>['a', 'b', '', 'c']</code>，有空串；<code>" a  b ".split()</code> 得到 <code>['a', 'b']</code>。另外在循环里反复 <code>s += x</code> 拼很长的串效率差，应先放进列表最后 <code>"".join()</code>。</p>` },
    { h: '格式化与转义', html: `
<p>格式化首选 f-string（见“起步”一节）。f-string 的格式说明在字符串方法 <code>format</code> 里同样适用：<code>"{:&gt;8}".format("右对齐")</code>。常用格式：<code>:.2f</code> 小数位、<code>:,</code> 千分位、<code>:&gt;8</code> / <code>:&lt;8</code> / <code>:^8</code> 右 / 左 / 居中对齐、<code>:08.3f</code> 补零。</p>
<p>转义：<code>\\n</code> 换行、<code>\\t</code> 制表、<code>\\\\</code> 反斜杠。<b>原始字符串</b> <code>r"C:\\new"</code> 里反斜杠不转义，写 Windows 路径和正则表达式时常用。三引号 <code>"""..."""</code> 可以跨多行。</p>
<pre><code>print(f"{1234567.891:,.2f}")   # 1,234,567.89
print(f"[{'ok':^6}]")          # [  ok  ]
print(r"C:\\new\\table")         # C:\\new\\table</code></pre>` },
    { h: 'str 与 bytes、编码', html: `
<p>Python 3 把两种东西分得很清楚：</p>
<table class="tbl"><tr><th>类型</th><th>是什么</th><th>例子</th></tr>
<tr><td>str</td><td>文本，一串 Unicode 字符</td><td><code>"中文"</code>，len 是 2</td></tr>
<tr><td>bytes</td><td>原始字节</td><td><code>b"abc"</code>，网络、文件、加密处理的都是它</td></tr></table>
<p><code>s.encode("utf-8")</code> 把文本变字节，<code>data.decode("utf-8")</code> 把字节变回文本。UTF-8 里英文字母 1 字节、常用汉字 3 字节，所以 <code>len("中文")</code> 是 2，<code>len("中文".encode("utf-8"))</code> 是 6。</p>
<p class="warn">乱码和 <code>UnicodeDecodeError</code> 的根源都是“编码和解码用的不是同一种编码”，比如用 UTF-8 去解 GBK 的字节。读写文件、处理网络数据时<b>显式写明 encoding</b>，不要依赖系统默认值（Windows 上默认可能不是 UTF-8）。</p>
<div class="key">程序内部一律用 str；只在边界（读文件、收发网络数据）做 encode / decode。</div>` }
  ],
  examples: [
    { type: 'choice', q: '<code>s = "hello"</code>，执行 <code>s.upper()</code> 后再 <code>print(s)</code>，输出是（　）。',
      options: ['hello', 'HELLO', 'None', '报错'], answer: 0,
      explain: '字符串不可变，upper() 返回一个新串 "HELLO"，但没有被接住，s 仍是 "hello"。要写 s = s.upper()。' },
    { type: 'choice', q: '读取一行 CSV <code>"张三, 25 ,北京"</code>，想得到干净的 <code>["张三", "25", "北京"]</code>，正确做法是（　）。',
      options: ['先 <code>split(",")</code>，再对每一项 <code>strip()</code>', '直接 <code>split()</code>', '先 <code>strip()</code> 整行，再 <code>split(",")</code>', '用 <code>replace(" ", "")</code> 后 <code>split()</code>'], answer: 0,
      explain: '空格夹在各项两边，要先按逗号拆，再逐项去空格。split() 按空白拆会得到 "张三,"、"25"、",北京"；只 strip 整行去不掉中间的空格；replace 会把字段内部本应保留的空格也删掉，且 split() 不按逗号拆。' },
    { type: 'choice', q: '一个服务收到字节数据，用 <code>data.decode("utf-8")</code> 时报 <code>UnicodeDecodeError</code>。最可能的原因是（　）。',
      options: ['发送方用的不是 UTF-8 编码（如 GBK），解码方式和编码方式不一致', 'Python 不支持中文', '数据太长', '应该用 <code>str(data)</code> 代替 decode'], answer: 0,
      explain: '字节流只有用编码时的同一种方式才能正确解回。应确认发送方的编码，或在协议里约定 UTF-8。str(data) 只会得到形如 "b\'...\'" 的表示文本，不是解码。' }
  ],
  tests: [
    { type: 'choice', q: '<code>s = "abcdef"</code>，<code>s[1:4]</code> 的结果是（　）。',
      options: ['"bcd"', '"bcde"', '"abcd"', '"abc"'], answer: 0,
      explain: '切片左闭右开，取下标 1、2、3，即 b、c、d。' },
    { type: 'choice', q: '<code>s = "abc"</code>，下列表达式会报错的是（　）。',
      options: ['<code>s[5]</code>', '<code>s[1:10]</code>', '<code>s[-1]</code>', '<code>s[10:]</code>'], answer: 0,
      explain: '单个下标越界报 IndexError；切片越界不报错，s[1:10] 得 "bc"，s[10:] 得空串；s[-1] 是 "c"。' },
    { type: 'choice', q: '要把列表 <code>nums = [1, 2, 3]</code> 拼成 <code>"1,2,3"</code>，正确的是（　）。',
      options: ['先把每个数转成字符串，再 <code>",".join(...)</code>', '<code>",".join(nums)</code>', '<code>nums.join(",")</code>', '<code>str(nums)</code>'], answer: 0,
      explain: 'join 是字符串的方法，参数里每个元素都必须是 str，直接传整数列表会报 TypeError。str(nums) 得到 "[1, 2, 3]"。' },
    { type: 'choice', q: '查找子串：要求“找不到时程序立刻报错”，应该用（　）。',
      options: ['<code>index()</code>', '<code>find()</code>', '<code>count()</code>', '<code>in</code>'], answer: 0,
      explain: 'index 找不到时抛出 ValueError；find 返回 -1，如果忘了检查，-1 还可能被当成下标使用，取到最后一个字符。' },
    { type: 'choice', q: '<code>"a,,b".split(",")</code> 的结果是（　）。',
      options: ["['a', '', 'b']", "['a', 'b']", "['a,,b']", "['a', ',', 'b']"], answer: 0,
      explain: '指定分隔符时，连续的分隔符之间会得到空串。只有不传参数的 split() 才会合并空白并丢掉空项。' },
    { type: 'choice', q: '判断文件名是不是图片（.jpg 或 .png），最简洁可靠的写法是（　）。',
      options: ['<code>name.lower().endswith((".jpg", ".png"))</code>', '<code>name[-4:] == ".jpg" or ".png"</code>', '<code>".jpg" in name</code>', '<code>name.find(".png") &gt; 0</code>'], answer: 0,
      explain: 'endswith 可以传元组一次判断多个后缀，先 lower 兼容大写扩展名。or 那种写法右边的 ".png" 恒为真；".jpg" in name 会把 a.jpg.exe 当成图片，find(".png") &gt; 0 会把 a.png.exe 当成图片。' },
    { type: 'choice', q: '在 UTF-8 下，<code>len("AI学习")</code> 和 <code>len("AI学习".encode("utf-8"))</code> 分别是（　）。',
      options: ['4 和 8', '4 和 4', '8 和 8', '6 和 8'], answer: 0,
      explain: 'str 的长度是字符数：A、I、学、习共 4 个。UTF-8 中英文字母各 1 字节、这两个汉字各 3 字节，共 2 + 6 = 8。' },
    { type: 'choice', q: '要在 Windows 路径字符串里避免 <code>\\n</code> 被当作换行，最合适的写法是（　）。',
      options: ['用原始字符串 <code>r"C:\\new\\data"</code>', '把路径写在三引号里', '在字符串前加 <code>b</code>', '在字符串前加 <code>f</code>'], answer: 0,
      explain: '原始字符串前缀 r 让反斜杠不转义。三引号只是允许跨行，仍会转义；b 前缀得到 bytes；f 前缀用于插值。也可以写正斜杠或用 pathlib。' },
    { type: 'fill', q: '<code>print(f"{3.14159:.2f}")</code> 输出什么？',
      answer: ['3.14'],
      explain: '.2f 表示保留 2 位小数的定点格式，结果四舍五入为 3.14。' }
  ],
  exercises: [
    {
      "q": "切片练习：对 <code>s = \"Hello, Python\"</code>，依次输出前 5 个字符、最后 6 个字符、整个字符串倒过来，每个一行。",
      "starter": "s = \"Hello, Python\"\n# TODO: 用切片输出三行\nprint(s)\n",
      "answer": "s = \"Hello, Python\"\nprint(s[:5])\nprint(s[-6:])\nprint(s[::-1])\n",
      "expect": "Hello\nPython\nnohtyP ,olleH\n"
    },
    {
      "q": "清洗一行脏数据：按逗号拆开，去掉每项两边的空格，丢掉空项，统一转小写，最后用 <code> | </code> 连起来，输出 <code>apple | banana | cherry | date</code>。",
      "starter": "raw = \"  apple, Banana ,cherry,  ,DATE  \"\nparts = raw.split(\",\")\n# TODO: strip、去空、lower，然后 join\nprint(parts)\n",
      "answer": "raw = \"  apple, Banana ,cherry,  ,DATE  \"\nitems = []\nfor p in raw.split(\",\"):\n    p = p.strip().lower()\n    if p:\n        items.append(p)\nprint(\" | \".join(items))\n",
      "expect": "apple | banana | cherry | date\n"
    },
    {
      "q": "判断回文：忽略大小写，只看字母和数字（用 <code>isalnum()</code> 过滤）。每行输出“原句 True/False”。",
      "starter": "words = [\"Level\", \"A man, a plan, a canal: Panama\", \"hello\"]\nfor w in words:\n    # TODO: 先只保留字母数字并转小写，再和倒序比较\n    print(w, w == w[::-1])\n",
      "answer": "words = [\"Level\", \"A man, a plan, a canal: Panama\", \"hello\"]\nfor w in words:\n    clean = \"\"\n    for ch in w:\n        if ch.isalnum():\n            clean += ch.lower()\n    print(w, clean == clean[::-1])\n",
      "expect": "Level True\nA man, a plan, a canal: Panama True\nhello False\n"
    },
    {
      "q": "对 <code>text = \"to be or not to be\"</code>，依次输出：<code>\"be\"</code> 出现的次数、<code>\"not\"</code> 的位置、<code>\"xyz\"</code> 的位置、是否以 <code>\"to\"</code> 开头、<code>\"be\"</code> 是否在其中，以及把 <code>\"be\"</code> 全换成 <code>\"see\"</code> 后的句子。",
      "starter": "text = \"to be or not to be\"\n# TODO: 用 count、find、startswith、in、replace，每个结果一行\nprint(text)\n",
      "answer": "text = \"to be or not to be\"\nprint(text.count(\"be\"))\nprint(text.find(\"not\"))\nprint(text.find(\"xyz\"))\nprint(text.startswith(\"to\"))\nprint(\"be\" in text)\nprint(text.replace(\"be\", \"see\"))\n",
      "expect": "2\n9\n-1\nTrue\nTrue\nto see or not to see\n"
    },
    {
      "q": "字符和字节：对 <code>s = \"Python中文\"</code>，依次输出字符数、UTF-8 编码后的字节数、把字节再解码回来是否等于原串。",
      "starter": "s = \"Python中文\"\n# TODO: 用 encode(\"utf-8\") 得到 bytes，再 decode 回来\nprint(len(s))\n",
      "answer": "s = \"Python中文\"\ndata = s.encode(\"utf-8\")\nprint(len(s))\nprint(len(data))\nprint(data.decode(\"utf-8\") == s)\n",
      "expect": "8\n12\nTrue\n"
    }
  ],
  handson: [
    '用 UTF-8 和 GBK 两种编码分别把“你好，AI”编码成 bytes，打印长度和内容；再故意用 UTF-8 去 decode GBK 的结果，看报什么错，最后加 <code>errors="replace"</code> 看效果。',
    '写一个函数，把一段英文按空白拆词、去掉标点、全转小写后统计每个词出现的次数，用一段你自己的文字（几百词）跑一下，打印出现最多的前 5 个词。',
    '在交互式环境里用 <code>dir(str)</code> 看字符串的全部方法，挑 5 个本节没讲的（如 <code>title</code>、<code>zfill</code>、<code>partition</code>）用 <code>help(str.xxx)</code> 看说明并各试一次。'
  ],
  links: [{ t: 'Python 官方教程（中文）：文本（字符串）', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
},

/* ======================= py 列表与元组 ======================= */
{
  id: 'py-list', stage: 'py', title: '列表与元组', short: '列表与元组',
  keywords: 'python list tuple 列表 元组 append extend insert remove pop del 切片 sort sorted key reverse 拆包 可变 不可变 引用 浅拷贝 深拷贝 copy deepcopy',
  prereqs: ['py-str'],
  tip: '变量是引用，b = a 不复制列表；list.sort() 原地排序返回 None；[[]] * 3 是同一个列表重复 3 次。',
  learn: [
    { h: '列表的增删改查', html: `
<p>列表 <code>[1, "a", 3.0]</code> 是有序、可变的序列，元素类型可以混合。索引和切片规则同字符串。</p>
<table class="tbl"><tr><th>操作</th><th>写法</th></tr>
<tr><td>末尾加一个 / 加一批</td><td><code>a.append(x)</code> / <code>a.extend([x, y])</code></td></tr>
<tr><td>在下标 i 插入</td><td><code>a.insert(i, x)</code></td></tr>
<tr><td>按值删（第一个）</td><td><code>a.remove(x)</code>，没有就报 ValueError</td></tr>
<tr><td>按下标删并返回</td><td><code>a.pop()</code> 删末尾，<code>a.pop(0)</code> 删开头</td></tr>
<tr><td>删下标 / 切片</td><td><code>del a[0]</code>、<code>del a[1:3]</code></td></tr>
<tr><td>改</td><td><code>a[0] = 9</code>，<code>a[1:3] = [7, 8]</code></td></tr>
<tr><td>查</td><td><code>x in a</code>、<code>a.index(x)</code>、<code>a.count(x)</code>、<code>len(a)</code></td></tr></table>
<p class="warn">易错：<code>a.append([4, 5])</code> 是把整个列表当一个元素加进去（a 多了 1 个元素）；<code>a.extend([4, 5])</code> 才是逐个加入（多 2 个）。</p>
<p><code>pop(0)</code>、<code>insert(0, x)</code> 要移动后面所有元素，是 O(n)；频繁在头部进出用 <code>collections.deque</code>。</p>` },
    { h: '排序：sort 与 sorted、key', html: `
<table class="tbl"><tr><th></th><th><code>a.sort()</code></th><th><code>sorted(a)</code></th></tr>
<tr><td>原列表</td><td>原地修改</td><td>不变</td></tr>
<tr><td>返回值</td><td><b>None</b></td><td>新列表</td></tr>
<tr><td>适用</td><td>只有列表</td><td>任何可迭代对象（元组、字符串、字典……）</td></tr></table>
<p class="warn">经典坑：<code>a = a.sort()</code> 之后 a 变成了 None。</p>
<p>两者都接受 <code>key</code>（一个函数，按它的返回值排序）和 <code>reverse=True</code>（降序）：</p>
<pre><code>words.sort(key=len)                  # 按长度
sorted(names, key=str.lower)         # 忽略大小写
sorted(rows, key=lambda r: r[1], reverse=True)  # 按第 2 列降序
sorted(rows, key=lambda r: (-r[1], r[0]))       # 分数降序、同分按名字升序</code></pre>
<p><code>lambda r: r[1]</code> 是一个临时的小函数（函数一节细讲）。Python 的排序是<b>稳定</b>的：key 相同的元素保持原来的先后顺序，所以也可以先按次要条件排、再按主要条件排。</p>` },
    { h: '元组与拆包', html: `
<p>元组 <code>(1, 2)</code> 和列表很像，但<b>不可变</b>：创建后不能增删改元素。适合表示“一条记录”（坐标、数据库的一行），也可以当字典的键（列表不行）。</p>
<p class="warn">只有一个元素的元组要写逗号：<code>(5,)</code>；<code>(5)</code> 只是带括号的整数 5。真正构成元组的是逗号：<code>t = 1, 2</code> 也是元组。</p>
<p><b>拆包</b>：把序列里的元素一次赋给多个变量，个数要对上，否则报 ValueError。</p>
<pre><code>x, y = (3, 4)
a, b = b, a                 # 交换，不需要临时变量
first, *rest = [1, 2, 3, 4] # first=1, rest=[2, 3, 4]
for name, score in [("Amy", 92), ("Bob", 85)]:
    print(name, score)</code></pre>
<p>函数“返回多个值”其实就是返回一个元组，调用方再拆包。</p>` },
    { h: '可变、引用与拷贝的坑', html: `
<p>Python 的变量是<b>引用</b>（名字贴在对象上）。<code>b = a</code> 不复制列表，只是让 b 也指向同一个列表，通过 b 修改，a 也跟着变。</p>
<table class="tbl"><tr><th>写法</th><th>效果</th></tr>
<tr><td><code>b = a</code></td><td>同一个对象，没有复制</td></tr>
<tr><td><code>b = a[:]</code>、<code>a.copy()</code>、<code>list(a)</code></td><td><b>浅拷贝</b>：新外层列表，但里面的子列表仍是共享的</td></tr>
<tr><td><code>copy.deepcopy(a)</code></td><td><b>深拷贝</b>：连嵌套的子对象也全部复制</td></tr></table>
<p><code>[[]] * 3</code> 和 <code>[[0] * 3] * 3</code> 是把<b>同一个内层列表</b>放了 3 次，改一行三行都变。正确做法是循环逐行创建（或用后面学的列表推导 <code>[[0] * 3 for _ in range(3)]</code>）。<code>[0] * 3</code> 没问题，因为整数不可变。</p>
<p>用 <code>a is b</code> 判断是否同一个对象，<code>a == b</code> 判断内容是否相等。</p>
<div class="key">函数参数也是传引用：在函数里 <code>lst.append(x)</code> 会改到调用方的列表；不想影响调用方，就在函数里先拷贝一份。</div>` }
  ],
  examples: [
    { type: 'choice', q: '下面代码运行后 <code>print(result)</code> 输出（　）。<pre><code>nums = [3, 1, 2]\nresult = nums.sort()</code></pre>',
      options: ['None', '[1, 2, 3]', '[3, 1, 2]', '报错'], answer: 0,
      explain: 'list.sort() 原地排序，返回 None，nums 本身变成了 [1, 2, 3]。想要得到排好序的新列表应写 result = sorted(nums)。' },
    { type: 'choice', q: '初始化 3 个空分组 <code>groups = [[]] * 3</code>，然后 <code>groups[0].append("A")</code>，结果是（　）。',
      options: ["[['A'], ['A'], ['A']]", "[['A'], [], []]", "['A', [], []]", '报错'], answer: 0,
      explain: '[[]] * 3 是同一个空列表的 3 个引用，往任何一个里加元素，三个位置都看得到。应改为循环逐个创建，或 [[] for _ in range(3)]。' },
    { type: 'choice', q: '<code>a = [1, [2, 3]]</code>，<code>b = a.copy()</code>，再执行 <code>b[1].append(4)</code>，此时 <code>a</code> 是（　）。',
      options: ['[1, [2, 3, 4]]', '[1, [2, 3]]', '[1, [2, 3], 4]', '[1, 4]'], answer: 0,
      explain: 'copy() 是浅拷贝：外层是新列表，但下标 1 的子列表仍是同一个对象，b[1].append 改的就是 a[1]。要完全独立用 copy.deepcopy。如果改的是 b[0] = 100，则不影响 a。' }
  ],
  tests: [
    { type: 'choice', q: '<code>a = [1, 2]</code>，执行 <code>a.append([3, 4])</code> 后 <code>len(a)</code> 是（　）。',
      options: ['3', '4', '2', '报错'], answer: 0,
      explain: 'append 把参数整体作为一个元素加入，a 变成 [1, 2, [3, 4]]，长度 3。用 extend 才会变成 4 个元素。' },
    { type: 'choice', q: '要按字符串长度从长到短排序，且保留原列表不变，正确的是（　）。',
      options: ['<code>sorted(words, key=len, reverse=True)</code>', '<code>words.sort(key=len, reverse=True)</code>', '<code>sorted(words, len)</code>', '<code>words = words.sort(key=len)</code>'], answer: 0,
      explain: 'sorted 返回新列表、不改原列表；sort 会修改原列表。key 必须用关键字参数传；words = words.sort(...) 会让 words 变成 None。' },
    { type: 'choice', q: '下列哪个是只含一个元素的元组（　）。',
      options: ['<code>(5,)</code>', '<code>(5)</code>', '<code>[5]</code>', '<code>tuple(5)</code>'], answer: 0,
      explain: '构成元组的是逗号，(5) 只是整数 5；[5] 是列表；tuple(5) 会报错，因为 5 不可迭代。' },
    { type: 'choice', q: '<code>first, *rest = "abc"</code> 之后，<code>rest</code> 是（　）。',
      options: ["['b', 'c']", '"bc"', "('b', 'c')", "'b'"], answer: 0,
      explain: '带星号的变量总是收集成列表，即使拆的是字符串或元组。first 是 "a"。' },
    { type: 'choice', q: '为什么列表不能当字典的键，而元组（元素都不可变时）可以？（　）',
      options: ['字典的键要求可哈希，列表可变所以不可哈希', '列表比元组占内存多', '元组的访问速度更快', 'Python 规定只有元组能当键'], answer: 0,
      explain: '键的哈希值必须在存放期间不变，可变对象内容一改哈希就变了，所以列表不可哈希。字符串、数字、元素都不可变的元组都可以当键。' },
    { type: 'choice', q: '一个函数里写了 <code>def add(items, x): items.append(x)</code>，调用 <code>add(my_list, 1)</code> 后（　）。',
      options: ['调用方的 my_list 也多了一个 1', 'my_list 不变，函数里改的是副本', '报错，参数不能修改', 'my_list 变成 None'], answer: 0,
      explain: '参数传的是对象的引用，函数里对可变对象的原地修改调用方能看到。不想影响调用方，就在函数里先 items = list(items) 拷贝一份。' },
    { type: 'choice', q: '<code>a = [1, 2]</code>，<code>b = a</code>，<code>a = a + [3]</code>。此时 <code>b</code> 是（　）。',
      options: ['[1, 2]', '[1, 2, 3]', '[3]', 'None'], answer: 0,
      explain: 'a + [3] 创建了一个新列表，再让 a 指向它；b 仍指向原来的 [1, 2]。如果写 a += [3] 或 a.append(3)，是原地修改，b 会看到 [1, 2, 3]。' },
    { type: 'choice', q: '需要一个频繁“从头部取出、从尾部加入”的任务队列，最合适的是（　）。',
      options: ['<code>collections.deque</code>', '列表配合 <code>pop(0)</code>', '元组', '字符串'], answer: 0,
      explain: '列表的 pop(0) 要把后面所有元素前移，是 O(n)；deque 两端进出都是 O(1)。元组和字符串不可变，不能当队列。' },
    { type: 'fill', q: '<code>sorted([("b", 2), ("a", 2), ("c", 1)], key=lambda t: t[1])</code> 结果里排第一的元素的字母是什么？',
      answer: ['c'],
      explain: '按第 2 个元素升序，("c", 1) 最小排第一；("b", 2) 和 ("a", 2) key 相同，稳定排序保持原顺序，b 在 a 前。' }
  ],
  exercises: [
    {
      "q": "列表增删改查：在末尾加 <code>\"cherry\"</code>，在开头插入 <code>\"mango\"</code>，删掉 <code>\"banana\"</code>，再弹出最后一个元素。依次输出：弹出的元素、最后的列表、<code>\"apple\"</code> 的下标、列表长度。",
      "starter": "fruits = [\"apple\", \"banana\"]\n# TODO: append、insert、remove、pop\nlast = None\nprint(last)\nprint(fruits)\n",
      "answer": "fruits = [\"apple\", \"banana\"]\nfruits.append(\"cherry\")\nfruits.insert(0, \"mango\")\nfruits.remove(\"banana\")\nlast = fruits.pop()\nprint(last)\nprint(fruits)\nprint(fruits.index(\"apple\"))\nprint(len(fruits))\n",
      "expect": "cherry\n['mango', 'apple']\n1\n2\n"
    },
    {
      "q": "排序：按分数从高到低排，分数相同按名字字母顺序。每行输出“名字 分数”。提示：<code>key=lambda x: (-x[1], x[0])</code>，lambda 是一个临时的小函数，参数 x 是一个元组。",
      "starter": "students = [(\"Tom\", 85), (\"Amy\", 92), (\"Bob\", 85), (\"Cat\", 78)]\n# TODO: 用 sorted 加 key 排序\nfor name, score in students:\n    print(name, score)\n",
      "answer": "students = [(\"Tom\", 85), (\"Amy\", 92), (\"Bob\", 85), (\"Cat\", 78)]\nranked = sorted(students, key=lambda x: (-x[1], x[0]))\nfor name, score in ranked:\n    print(name, score)\n",
      "expect": "Amy 92\nBob 85\nTom 85\nCat 78\n"
    },
    {
      "q": "修好这个“3×3 棋盘”：只想把左上角改成 1，结果三行全变了。改成用循环逐行创建，让输出变成 <code>[[1, 0, 0], [0, 0, 0], [0, 0, 0]]</code>。",
      "starter": "grid = [[0] * 3] * 3   # TODO: 三行其实是同一个列表\ngrid[0][0] = 1\nprint(grid)\n",
      "answer": "grid = []\nfor _ in range(3):\n    grid.append([0] * 3)\ngrid[0][0] = 1\nprint(grid)\n",
      "expect": "[[1, 0, 0], [0, 0, 0], [0, 0, 0]]\n"
    },
    {
      "q": "元组拆包：对 <code>points</code> 里的每个点用 <code>x, y</code> 拆开，求所有 x 之和与所有 y 之和，输出 <code>9 12</code>；再用 <code>first, *rest</code> 拆出第一个点和其余点，分两行输出；最后不用临时变量交换 a、b 并输出。",
      "starter": "points = [(1, 2), (3, 4), (5, 6)]\nsx = sy = 0\n# TODO: for x, y in points: ...\nprint(sx, sy)\na, b = 1, 2\nprint(a, b)\n",
      "answer": "points = [(1, 2), (3, 4), (5, 6)]\nsx = sy = 0\nfor x, y in points:\n    sx += x\n    sy += y\nprint(sx, sy)\nfirst, *rest = points\nprint(first)\nprint(rest)\na, b = 1, 2\na, b = b, a\nprint(a, b)\n",
      "expect": "9 12\n(1, 2)\n[(3, 4), (5, 6)]\n2 1\n"
    },
    {
      "q": "浅拷贝和深拷贝：<code>b = a[:]</code> 只复制了外层。改用 <code>copy.deepcopy</code>，让修改 b 不再影响 a，输出 <code>[1, [2, 3]]</code> 和 <code>[100, [2, 3, 4]]</code>。",
      "starter": "import copy\na = [1, [2, 3]]\nb = a[:]   # TODO: 改成深拷贝\nb[0] = 100\nb[1].append(4)\nprint(a)\nprint(b)\n",
      "answer": "import copy\na = [1, [2, 3]]\nb = copy.deepcopy(a)\nb[0] = 100\nb[1].append(4)\nprint(a)\nprint(b)\n",
      "expect": "[1, [2, 3]]\n[100, [2, 3, 4]]\n"
    }
  ],
  handson: [
    '在交互式环境里做实验：<code>a = [[0] * 3] * 3</code> 后用 <code>id(a[0]), id(a[1])</code> 看三行是不是同一个对象；再用循环创建的版本对比。然后对 <code>b = a.copy()</code> 和 <code>copy.deepcopy(a)</code> 分别检查 <code>a[0] is b[0]</code>。',
    '写一个“成绩单”脚本：用元组列表存 8 个学生的（姓名，语文，数学），分别按总分降序、按数学降序同分按姓名升序输出排名表，用 f-string 对齐成表格。',
    '写一个函数 <code>dedupe(items)</code>：去掉列表里的重复元素但保留第一次出现的顺序，且不修改传入的列表。用含重复的列表测试，并确认调用后原列表没变。'
  ],
  links: [{ t: 'Python 官方教程（中文）：数据结构', url: 'https://docs.python.org/zh-cn/3/tutorial/' }]
}

);
