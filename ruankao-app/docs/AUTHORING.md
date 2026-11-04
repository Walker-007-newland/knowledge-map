# 软考架构师：内容编写规范

给一个在职成人自学用，备考**系统架构设计师 2027 年上半年（5 月）**考试，**手机竖屏**上看。讲解用口语化的“你”，短段落、多用表格，手机上不要用很宽的表格（最多 3 列）。

## 版权

仓库是公开的。**不抄**官方教程原文、**不放**真题原卷。讲解按考试大纲自己写，题目原创或“仿真题”，不标某年真题。

## 文件

- `www/data/config.js`：考试信息、模块列表
- 知识点：`www/data/*.js`，`RK.nodes.push({...}, {...})`，新文件要加进 `index.html`（在 `js/app.js` 之前）
- 案例：`www/data/cases.js`，`RK.cases.push({...})`
- 论文：`www/data/essays.js`，`RK.essays.push({...})`

## 知识点字段

| 字段 | 说明 |
|---|---|
| `id` | 模块前缀 + 短横线，如 `a-style`、`q-atam`、`d-normal`、`o-pv` |
| `module` | 见 config.js |
| `title` / `short` | 完整名 / 短名（答题页标题用） |
| `freq` | 考频 1–3 |
| `keywords` | 搜索用别名 |
| `prereqs` | 前置知识点 id |
| `tip` | 一句话：怎么考、占几分、易错点 |
| `learn` | `[{h, html}]`；样式：`<div class="key">` 重点、`<p class="warn">` 易错、`<table class="tbl">` 表格（宽表外面包 `<div class="scroll">`） |
| `examples` | 例题，解析写完整思路 |
| `tests` | 测试题，≥ 80% 算掌握；也是刷题、模拟卷的题库 |

题型：

```js
{ type: 'choice', q: '题干 html', options: ['…','…','…','…'], answer: 正确下标, explain: '…' }
{ type: 'fill', q: '…', answer: ['可接受答案1', '答案2'], explain: '…' }
{ type: 'num', q: '…', answer: 10, unit: '台', tol: 0.01, explain: '…' }
```

- **选项每次都会打乱**（例题的选项显示顺序也打乱）。解析里不能写“选 A”“第二项”，要说内容；不要“以上都对”。
- 模拟卷只抽 `choice` 题（机考综合知识全是单选）。fill / num 只在知识点测试和随机练里出现。
- 题量按要点覆盖：讲解里每个考点至少 1 道例题、2 道测试题，高频易错点 3 道。

## 案例

```js
{ id, title, topic, required: true/false, nodes: [相关知识点],
  scenario: '材料 html',
  questions: [{ q, rows, ref: '参考答案 html', points: [{ s: 分值, p: '得分要点' }], explain }] }
```
每道案例题的 points 合计 **25 分**。要点写成能逐条判断“答到 / 没答到”的样子。

## 论文

```js
{ id, title, topic, nodes, prompt: '题目 html（背景 + 三问）', guide: '写法 html', rubric: [...], checklist: [...] }
```
rubric 共用 essays.js 顶部的 RUBRIC（切合题意 / 应用深度 / 实践性 / 表达 / 综合分析，合计 75）。

## 预览和打包

- 浏览器：launch 配置 `ruankao`（端口 8805），用手机尺寸看
- 打包：`powershell -ExecutionPolicy Bypass -File ruankao-app\build.ps1` → `out\ruankao.apk`
- 发布：`ruankao-app\publish.ps1 -Notes "…"`（Notes 不要用中文弯引号）
