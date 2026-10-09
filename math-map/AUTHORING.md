# 知识点编写规范

本项目是一个本地网页（双击 `index.html` 打开）：福建中考数学知识地图，人教版教材顺序，**给学生自学用**。
每个知识点 = 一份讲解（含互动动画）+ 分步例题 + 自动判分测试题。例题和测试题**数量不设上限，以覆盖讲解里的每个要点为准**（每个要点至少 1 道例题、2 道测试题，易错/高频 3 道），见 `docs-coverage-brief.md`。

先读这两个样板文件，它们就是标准：
- `js/lessons.js`（7 个已完成知识点的内容，例如 `g_pyth`、`n_frac0`）
- `js/anims.js`（对应的动画，例如 `A.pythSquares`、`A.frogLine`）

知识点清单（id、名称、年级、前置关系、一句话说明）在 `js/nodes.js`，不要改它。

## 你要创建的文件

每组只写自己的两个新文件，**不要修改任何已有文件**：

- `js/lessons-<组名>.js`
- `js/anims-<组名>.js`

### lessons 文件模板

```js
(function () {
  const fr = window.fr; // 分数：fr(3, 8) 输出竖式分数的 HTML
  window.LESSONS = Object.assign(window.LESSONS || {}, {
    n_xxx: { goal: '...', fj: '...', sections: [...], pitfalls: [...], examples: [...], quiz: [...] },
  });
})();
```

### anims 文件模板

```js
(function () {
  const { S, H, T, tween, lerp, fmt, stage, ctrl, btn, slider, svgPoint, grid, RM } = window.AH;
  const PI = Math.PI;
  const A = {};
  A.n_xxx_pizza = function (el) { /* 在 el 里画 SVG 和按钮 */ };
  window.ANIMS = Object.assign(window.ANIMS || {}, A);
})();
```

动画名称**必须以知识点 id 开头**（例如 `n_mul_grid`），避免和别的组重名。

## 内容字段

| 字段 | 说明 |
|---|---|
| `goal` | 中考要求（课标要求），1～2 句。小学知识点写“小学要求”的内容即可 |
| `fj` | 福建卷怎么考。小学知识点写“小学基础，中考不单独考，但……是……的基础”。初中写常见题型（选择/填空/解答）和在卷中的作用。**不要编造具体年份、题号、分值**，用“常考”“多以……形式出现”这类说法 |
| `sections` | 3～4 节，每节 `{ h: '小标题', html: '...', anim: '动画名' }`，`anim` 可省略。**每个知识点至少 1 个动画，最好 2 个** |
| `pitfalls` | 3 条“容易错的地方”（HTML 字符串） |
| `examples` | 例题：`{ q, steps: [...], ans }`，steps 是一步一步揭示的解题过程，2～4 步；每个要点至少 1 道 |
| `quiz` | 测试题，选择和填空混合（见下）；每个要点至少 2 道，易错/高频 3 道 |

### 测试题格式

```js
{ type: 'choice', q: '题干', opts: ['A', 'B', 'C', 'D'], ans: 1, why: '解析' }   // ans 是选项下标（0 起）
{ type: 'fill', q: '题干______', ans: ['-4'], why: '解析' }                      // ans 是可接受答案列表
```

- 填空答案只用**整数、小数、分数（写成 3/8）、负数（写成 -4）**，系统会按数值比较，3/9 和 1/3 都算对；不要让学生填 √、π、字母式、单位、汉字。要填这些内容的题目改成选择题。
- 选择题正确答案的位置要分散，不要总是 A。
- 每题的 `why` 要说清楚为什么，学生做错后看的就是它。

### HTML 写法

- 字母变量用 `<i>x</i>`，指数用 `<sup>2</sup>`，分数用 `${fr(1, 2)}`，减号和负号用 `−`（U+2212），乘号用 `×`，除号用 `÷`。
- 可用的样式：`<p class="try">动手试试……</p>`（橙色提示）、`<p class="formula">公式</p>`（居中公式框）、`<table class="mini">`（小表格）、`<b>` 加粗。
- 语言：**学生自学**，要能自己看懂。小学知识点按三年级学生能读懂的口语写，句子短，多用生活例子；初中知识点用清楚、直接的话，先讲“为什么”，再讲“怎么做”。
- 讲解中引导学生去操作动画，比如“拖动滑块看看……”。

## 动画要求

动画是这个项目的重点：**形象、可以动手操作**，不是静态插图。每个动画要有按钮或滑块让学生操作，画面会动起来（比如切开、移动、翻折、生长、描点、累加），并在下方用 `anim-read` 段落实时说明“现在看到的是什么”。

### 公共工具（`window.AH`）

| 函数 | 作用 |
|---|---|
| `stage(el, w, h)` | 在 el 里创建 SVG，viewBox 为 w×h，宽度自适应。**w 用 360～480** |
| `S(tag, attrs, parent)` | 创建 SVG 元素 |
| `H(tag, attrs, parent, innerHTML)` | 创建 HTML 元素 |
| `T(parent, x, y, text, cls, anchor)` | SVG 文字，anchor 默认 middle |
| `ctrl(el)` | 按钮行容器 |
| `btn(parent, label, onclick, cls)` | 按钮，cls 为 `'alt'` 时是描边样式 |
| `slider(parent, name, label, min, max, step, value, oninput)` | 滑块，返回 `{ set(v) }` |
| `tween(ms, fn(t), done)` | 缓动动画，t 从 0 到 1，已处理“减少动画”设置 |
| `lerp(a, b, t)`、`fmt(n)` | 插值；格式化数字（保留两位、负号用 −） |
| `grid(svg, size, min, max)` | 画方形坐标系，返回 `{ X(x), Y(y), u, clip }`；`clip` 用于 `'clip-path'` 属性 |
| `svgPoint(svg, evt)` | 指针事件坐标转换为 SVG 坐标（拖拽用） |

读数说明：`const read = H('p', { class: 'anim-read' }, el);` 然后 `read.innerHTML = ...`。其他段落样式：`anim-tip`（灰色小提示）、`anim-cap`（橙色步骤标题）。读数里可用 `<span class="k1">`（蓝）、`k2`（橙）、`k3`（绿）给数字着色。
`H('div', { class: 'anim-row' }, el)` 是一行控件容器；输入框用 class `anim-input`；也可以用 `<select>`。

### 颜色：只能用 class，不能写颜色值

页面有浅色、深色两种主题，**禁止写死颜色**（不要写 `fill="#..."`、`fill="red"`）。SVG 用这些 class：

- 填充：`f1` 蓝、`f2` 橙、`f3` 绿；`f1s` `f2s` `f3s` 对应浅色；`fsurf` 背景色、`fsurf2` 浅灰、`fnone` 无填充、`fstrong` 深色、`fmuted` 灰
- 描边：`s1` `s2` `s3`（彩色 2px）、`sstrong`（深色 2px）、`sline`（浅线 1px）、`smuted`；修饰：`dash` 虚线、`thin`、`thick`、`round`
- 文字：`t1` `t2` `t3` 彩色、`tm` 灰、`tb` 粗、`ts` 小号 12px、`tl` 大号 18px、`txl` 特大 28px 粗；默认文字 14px
- 已有的专用 class（见 `page.html` 的“动画”部分）也可以用，如 `gridl`、`axis`、`fline`、`dot`、`mark-x`、`mark-y`、`guide`、`handle`（可拖动圆点）、`tri`、`sq sa/sb/sc`、`stroke-strong`、`fill-strong`、`note`、`tick`、`big`
- 实在需要别的效果，用 `style` 写 CSS 变量：`style: 'fill: var(--a2s); opacity: .6'`

一个元素要同时填充和描边就写多个 class：`class: 'f1s s1'`。

### 其他要求

- 手机宽度约 330px 也要能看清：viewBox 宽 360～480，文字不小于 12px，可点区域不小于 24px。
- 可拖动的元素用 `pointerdown` + `setPointerCapture`，参考 `A.triTear`。
- 不依赖外部库、图片、字体、网络请求。不用 `alert/confirm/prompt`。
- 每个函数可能被多次调用（切换知识点会重新创建），不要用全局变量保存状态，不要写固定的 DOM id（如需 id，加随机后缀）。
- 动画运行中重复点击按钮不能出错（用 `busy` 标记，参考样板）。
- 打开时就要有完整画面（初始状态有图有说明），不能一片空白等学生点。

## 质量要求

- **数学必须正确。** 每道例题、每道测试题都要自己再算一遍，核对答案和解析一致、选项里只有一个正确答案。
- 内容按人教版教材范围，不超纲。
- 写完后通读自己的 JS，检查语法：括号配对、模板字符串里的反引号、对象逗号、`${}` 只出现在模板字符串里。项目里没有 Node，没法帮你运行，语法错误会导致整个文件失效。
