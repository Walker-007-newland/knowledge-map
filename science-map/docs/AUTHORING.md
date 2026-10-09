# 理科知识图谱：内容编写规范

面向一个福建初中生自学用。教材：**人教版**（物理八上、八下、九年级全一册；化学九上、九下）。讲解口语化、面向学生，用“你”。

## 文件

- 物理内容：`physics/*.js`；化学内容：`chemistry/*.js`。每个文件形如
  ```js
  KG.nodes.push({ ...知识点1 }, { ...知识点2 });
  ```
  新文件要在 `physics.html` / `chemistry.html` 里加 `<script>`。
- 画图函数：`js/figs.js`（全局 `FIG`），在数据文件里直接调用拼 HTML。需要新的通用图形时可以加进去。
- 互动演示：`js/sims-physics.js` / `js/sims-chem.js`，UI 小工具见 `js/sims.js` 顶部注释，参考 `SIMS.ohm`。

## 知识点字段

| 字段 | 说明 |
|---|---|
| `id` | 物理 `p-xxx`，化学 `c-xxx`，小写短横线 |
| `title` / `short` | 完整名 / 图上显示名（≤ 8 个字，SVG 里不能用 `<sub>`，化学式用 `H₂O` 这类 Unicode 下标） |
| `module` | 见各科 `modules.js` |
| `term` | 物理 `8a` `8b` `9`；化学 `9a` `9b` |
| `chapter` | 人教版章名，如 `'第六章 质量与密度'` |
| `freq` | 中考考频 1–3 |
| `keywords` | 可选，搜索用的别名 |
| `prereqs` | 前置知识点 id 数组（只能指向同学期或更早学期） |
| `tip` | 中考提示，一句话：常考形式、易错点 |
| `learn` | `[{h: 小标题, html}]` |
| `examples` | 例题，题型同 tests，解析要写完整过程；**数量不设上限，讲解里每个要点至少 1 道** |
| `tests` | 测试，答对 80% 算掌握；**数量不设上限，每个要点至少 2 道（易错/高频点 3 道）**，见 `docs/coverage-brief.md` |
| `practice` | 可选：作图题、简答题、实验设计（自评，不计分），见下 |
| `passages` | 可选：多题共用的实验/情境材料 `{ p1: {title, html} }`，题目写 `passage: 'p1'`。共用同一材料的题在测试中保持相邻、按书写顺序出现，其他题照常打乱 |

## 讲解里可用的样式

- `<div class="formula">ρ = <span class="v">m</span> / <span class="v">V</span><span class="zh">（密度 = 质量 ÷ 体积）</span></div>` 公式块
- `<span class="v">F</span>` 物理量斜体；`<span class="chem">H<sub>2</sub>O</span>` 化学式
- `<div class="key">…</div>` 重点结论；`<p class="warn">…</p>` 易错提醒
- `<div class="steps"><p>已知：…</p><p>求：…</p><p>解：…</p><p>答：…</p></div>` 计算题规范步骤
- `<table class="tbl">` 表格
- `FIG.svg(w, h, …)` 示意图；`<div class="sim" data-sim="名字"></div>` 互动演示

## 题型

```js
{ type: 'choice', q: '题干 html', options: ['…','…','…','…'], answer: 正确下标, explain: '…' }
{ type: 'num', q: '…', answer: 2.5, unit: 'm/s', tol: 0.01, explain: '…' }   // tol 相对误差，默认 1%
{ type: 'fill', q: '…', answer: ['可接受答案1', '答案2'], explain: '…' }
```

- **选项会被打乱**：解析里不要写“选 A / B 正确”，要说内容。选项里不要出现“以上都对”“A 和 B”。若选项必须按顺序（如图像 ①②③④ 组合），加 `fixed: true`。
- **`num`**：学生只填数字，单位由 `unit` 显示在输入框后；题干里说清楚要求的单位和精度（“结果保留一位小数”）。答案要经得起验算。g 取 10 N/kg（题干注明），水的密度 1.0×10³ kg/m³。
- **`fill`**：只用于答案很短且确定的题（一个词、一个化学式、一个数字+固定说法）。比对时会忽略空格、全角半角、Unicode 下标（H₂O = H2O）；物理不区分大小写，化学区分大小写。把常见等价写法都列进 `answer`（如 `['汽化','蒸发']` 只有在两者都对时才列）。**不要让学生输入完整化学方程式**，改成选择题，或填某个化学式/配平系数。
- 每道题必须**只有一个正确答案**，干扰项要来自学生常见错误。
- 题目一律原创或“仿中考”，不要标某年真题。
- 中考情境：福建卷爱考生活/传统文化/科技情境（如福建土楼、茶、舰船、高铁、福州地铁），可以适当使用，但数据要合理。

## 作图·简答（practice）

```js
practice: [{ title: '作图', prompt: '题目 html（可含 FIG 图）', write: false,
             sample: '参考答案 html（可含 FIG 图）', checklist: ['评分要点1', '…'], notes: '可选补充' }]
```
`write: true` 时给一个文本框（简答题用）。

## 质量要求

- 物理数值、单位、有效数字要对；化学式、化合价、方程式配平、反应条件要对。
- 人教版用语：如“质量守恒定律”“化合价”“溶质质量分数”“二力平衡”“阿基米德原理”。
- 图里的文字和题干一致（图 1、L₁、R₂……）。

## 自检

启动本地服务后打开 `docs/check.html?s=physics` 或 `?s=chemistry`，会列出格式问题（缺字段、答案下标越界、解析写了选项字母、演示未注册、FIG 写错产生 undefined 等）。

另外：更新内容后运行 `python docs/bump.py` 给页面里的脚本加新版本号，避免浏览器用缓存的旧文件。
