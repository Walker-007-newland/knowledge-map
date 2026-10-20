# mj4b 闽教版英语四年级下册 词表核对记录

## 来源

- 主来源：国家中小学智慧教育平台官方电子课本，闽教版（福建教育出版社）英语四年级下册，2026 春版，内容 ID `83e1a7f0-a0bf-4663-9cb0-ca5de49a2409`。
- 印次：2026 春版（目前只有这一个印次）。
- 图片页码 ↔ 书页页码：
  - 目录：图 5–7 ↔ 书页 ii–iv（图 5 是 Unit 1–2 和 Review 1，图 6 是 Unit 3–4 和 Review 2，图 7 是 Story Time、Words and Expressions、Word List、Additional Words）
  - Words and Expressions：图 79–81 ↔ 书页 72–74
  - Word List（按字母排序，用来交叉核对黑体）：图 82–84 ↔ 书页 75–77
- 词表页注：「本单词表为主课文中出现的生词和词组，其中黑体词为《义务教育英语课程标准（2022年版）》中的二级词汇。」黑体记 must=1，细体记 must=0。课本不标词性，pos 一律为 ""。

## 目录

| 编号 | 标题 | 课本页 |
|---|---|---|
| u1 | Unit 1 Weekly Activities | 2 |
| u2 | Unit 2 My Favorite Subject | 16 |
| — | Review 1（词表里没有词条，不放入 units） | 29 |
| u3 | Unit 3 Our Feelings | 36 |
| u4 | Unit 4 Getting Around | 50 |
| — | Review 2（词表里没有词条，不放入 units） | 63 |
| — | Story Time（词表里没有词条，不放入 units） | 70 |

## 双人独立录入比对

- A：99 词；B：99 词。
- 每单元词数（A / B）：u1 27/27，u2 22/22，u3 24/24，u4 26/26。
- 单元名、mustMarked、各词的 zh、must、pos，A 和 B 全部一致（unit_diff 比对时会把弯撇号和直撇号当成同一个字符）。
- 不一致 2 处，都是 Unit 4 同一个词条 `I’ll=I will 我将会` 的录法不同。

## 裁定记录

| 编号 | A | B | 裁定 | 依据：图 n 原文 |
|---|---|---|---|---|
| `u4/i'll/missing` | en `I’ll`，zh `（I will）我将会`，must 0 | 无（B 录成 `I’ll=I will`） | 保留这一条，写成 en `I'll`（直撇号），zh `（I will）我将会`，must 0。**B 错** | 图 81（书页 74）右栏第 2 行原文是「I’ll=I will　我将会」，细体。按「X=Y 中文」的统一写法，en 写 X，zh 写「（Y）中文」。Word List 图 83（书页 76）Ii 栏也是同样写法，细体 |
| `u4/i'll=i will/missing` | 无 | en `I’ll=I will`，zh `我将会`，must 0 | 不要这条，用上一行的写法代替。**B 错**（把等号后的补充也写进了 en，违反录入规则 3） | 同上，图 81 |

另外：A 的 en 照课本用了弯撇号 `’`。按最终统一写法改成直撇号 `'`，这不算 A 录错。

**统计：裁定 2 处，都出在同一个词条上。A 错 0 处，B 错 2 处（实际是 1 个词条），两人都错 0 处。**

## 你通读全表另外发现并改正的问题

无。我对照图 79–81 逐条把 99 个词条通读了一遍（拼写、大小写、中文释义、全角标点、跨行词条拼接、黑体/细体、单元归属），又用 Word List 图 82–84 逐个核对了黑体，A、B 两人一致的地方都没有发现错误。核对过的要点：
- 逗号照课本保留为全角「，」：`week` 写「星期，周」，`parent` 写「父，母；家长」。
- 括号里的英文和中文之间不留空格：`foot` 写「（复数feet）脚」，`does` 写「（do的第三人称单数形式）做」。
- 跨行词条已拼成一行：helpful、hooray、take、does。
- 图 80 右栏顶部的 poor…swan 7 个词没有单元标题，紧接左栏 Unit 3 的 farm，归 u3（Unit 3 Lesson 4 的课题是 I'm not a poor duckling）。图 80 左栏顶部的 information…zero 归 u2。
- `fifty` 在词表里列在 Unit 1（目录里它是 Unit 3 Lesson 3 的 Key word），按词表照录在 u1。
- 细体 37 个：weekly, activity, weekday, chess, weekend, hooray, picnic, useful, poem, fox, enjoy, search, information, slide show, zero, feeling, nervous, winner, proud, better, high, count, poor, duckling, bored, ugly, lonely, thirsty, swan, subway, away, office, cheap, surprise, I'll, the UK, Hong Kong。在 Word List 里逐个看过，粗细都一致。

## 拼写校验

unit_check 输出：

```
# mj4b：共 99 个词条，词表外 6 个
- `hooray` （u1 hooray （表示高兴、赞许等）好哇）
- `duckling` （u3 duckling 小鸭）
- `I'll` 专有名词？（u4 I'll （I will）我将会）
- `UK` 专有名词？（u4 the UK 英国）
- `Hong` 专有名词？（u4 Hong Kong 香港）
- `Kong` 专有名词？（u4 Hong Kong 香港）
```

逐个说明：
- `hooray`：课本原文就是这样（图 79 右栏，细体，认读词），拼写正确，只是不在几个参考词表里。
- `duckling`：课本原文就是这样（图 80 右栏，细体，认读词，来自课文「丑小鸭」），拼写正确。
- `I'll`：缩写形式（I will），课本原文是「I’ll=I will」（图 81），按统一写法改成了直撇号。不是拼写错误。
- `UK`：专有名词，the UK（英国），课本原文如此（图 81）。
- `Hong`：专有名词 Hong Kong（香港）的一部分，课本原文如此（图 81）。
- `Kong`：同上。

## 与对照来源比对

第三方：yy.suyang123.com 的 mjb_xiace_words1–4.html（闽教版四年级下册 Unit 1–4），四个页面都打开了。

| 单元 | 第三方 | 最终 | 差异 |
|---|---|---|---|
| u1 | 28 | 27 | +1 |
| u2 | 22 | 22 | 0 |
| u3 | 24 | 24 | 0 |
| u4 | 27 | 26 | +1 |
| 合计 | 101 | 99 | +2 |

差异说明（以课本为准，第三方只作参考）：
- u1 多 1 个：第三方把 foot 拆成「foot 脚」和「feet 脚（foot的复数）」两条。课本（图 79）只有一条「foot（复数 feet）脚」，所以 feet 是第三方多出来的。另外第三方的 must 释义是「必须做（或看、买等）的事」，课本是「必须」；foot 的释义也和课本不同。这两处只是释义不同，不影响词数。
- u2 词数一样。第三方写的是 `Internet`（大写），课本是 `internet`（小写，图 79）；water、kind 的释义比课本多了义项（「喂水」「友善的」）。都以课本为准。
- u3 词数一样，词条也一样。feeling、tired 的释义比课本多了义项，以课本为准。
- u4 多 1 个：第三方把课本的一条「I’ll=I will 我将会」拆成「I'll」和「I will」两条，所以 I will 是第三方多出来的。另外 by 的释义里第三方用逗号（课本是分号），far 多了「较远的」，以课本为准。
- 第三方没有漏词，也没有把词放错单元。

## 与其它印次比对

无（目前只有 2026 春版这一个印次）。

## 结论

- 最终各单元词数：u1 27，u2 22，u3 24，u4 26。
- 总词数 99，其中必背（黑体，must=1）62 个，认读（细体，must=0）37 个。
- A、B 共 2 处不一致，都出在 Unit 4 的 `I’ll=I will` 这一条上，按 A 的拆分写法裁定。我通读全表没有发现其它问题。
