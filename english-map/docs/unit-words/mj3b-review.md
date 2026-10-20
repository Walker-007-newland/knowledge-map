# mj3b 闽教版英语三年级下册 词表核对记录

## 来源

- 主来源：国家中小学智慧教育平台官方电子课本，闽教版（福建教育出版社）英语三年级下册，2026 年度印次，内容 ID `e0574c1e-8df4-bc8e-7f77-ed160b407ad5`。
- 图片页码 ↔ 书页页码：图 n = 书页 n−7（正文部分）。
  - 目录（Contents）：图 5–7（书页 ii–iv）。图 7 列出 Story Time 70、Words and Expressions 72、Word List 75、Additional Words 79、Classroom English 80。
  - Words and Expressions：图 79–81（书页 72–74）。
  - Word List（按字母排序）：从图 82（书页 75）开始，用来交叉核对黑体。
- 词表页注：「本单词表为主课文中出现的生词和词组，其中黑体词为《义务教育英语课程标准（2022年版）》中的二级词汇。」所以 mustMarked = true，黑体 must=1，细体 must=0。词表不标词性，pos 一律为 ""。

## 目录

| 单元 | 标题（照目录） | 起始书页 |
|---|---|---|
| u1 | Unit 1 Our Animal Friends | 2 |
| u2 | Unit 2 My Clothes | 16 |
| u3 | Unit 3 Time | 36 |
| u4 | Unit 4 Healthy Eating | 50 |

Review 1（书页 29）、Review 2（书页 63）、Story Time（书页 70）在词表里没有词条，不放进 units。

说明：目录 Key words 中的 draw（U1 L4）、play（U3 L4）、fish（U4 L4）不在 Words and Expressions 里（这几个词应该是之前的册次学过，不算本册生词），按规则只录词表，不补。

## 双人独立录入比对

- A：135 词；B：135 词。
- 每单元词数（A / B）：u1 42/42，u2 32/32，u3 34/34，u4 27/27。
- unit_diff 比对 A、B：**不一致 0 处**（包括 en、zh、must、顺序、单元归属）。
- 两人都用了课本原样的弯撇号 `’` 和整体词头 `isn’t=is not` 等写法，最终词表按统一写法改了，见下表。

## 裁定记录

A、B 之间没有不一致。下表是最终词表按「统一写法」（直撇号；`X=Y 中文` 改为 en 写 `X`、zh 写 `（Y）中文`）对 A、B 共同写法的改动，unit_diff `--final` 列出的每个编号逐条裁定如下：

| 编号 | A | B | 裁定 | 依据 |
|---|---|---|---|---|
| `u1/isn't=is not/missing` | isn’t=is not / 不是 | 同 A | 删掉这个写法，改为下一条 | 图 79 右栏原文「isn’t=is not 不是」（细体），按统一写法拆分 |
| `u1/isn't/missing` | （无） | （无） | en `isn't`，zh `（is not）不是`，must 0 | 同上，图 79 |
| `u2/you're=you are/missing` | you’re=you are / 你是 | 同 A | 删掉这个写法，改为下一条 | 图 80 左栏原文「you’re=you are 你是」（细体） |
| `u2/you're/missing` | （无） | （无） | en `you're`，zh `（you are）你是`，must 0 | 同上，图 80 |
| `u2/can't=cannot/missing` | can’t=cannot / 不能；不会 | 同 A | 删掉这个写法，改为下一条 | 图 80 右栏原文「can’t=cannot 不能；不会」（细体） |
| `u2/can't/missing` | （无） | （无） | en `can't`，zh `（cannot）不能；不会`，must 0 | 同上，图 80 |

另外 `o’clock`（图 80 右栏，黑体）的撇号也统一成直撇号，写成 `o'clock`，zh `（几）点钟`（unit_diff 把撇号归一以后不算差异，所以不单列编号）。

裁定共 6 个编号（3 个词条）：都是 A、B 照课本原样录入，而最终词表的统一写法不同；不算录入错误。A 错 0 处，B 错 0 处，两人都错 0 处。

## 你通读全表另外发现并改正的问题

无。我把图 79–81 三页全部 135 条逐条对照了一遍（en 拼写、zh 释义和标点、黑体/细体、单元归属、顺序），A、B 都没有错。重点核对过的几处：

- 细体（must=0）共 27 条：hat、guess、carrot、isn't、mouse、together（u1）；size、put on、team、sports ground、you're、put away、forest、can't（u2）；hotel、Tokyo、Moscow、Paris、London、push、New York、a.m.、p.m.、homework（u3）；hamburger、salad、sweet（u4）。图片里的粗细对比很明显，和 A、B 的判断以及他们在 Word List 里做的核对一致。
- 跨行词条：do「（构成否定句、疑问句 / 的助动词，无词义）；做」、put away「把某物收拾起来 /（放好）」、of「（表示所属、数量、其 / 中）……的」，都已拼成一行。
- 跨页：u3 从图 80 右栏 kid 接到图 81 左栏 with、toy……picture，仍属 u3；u4 从图 81 左栏 healthy 开始。
- 课本 zh 里的空格已去掉：mouse「（复数 mice）老鼠」→`（复数mice）老鼠`；T-shirt「T 恤衫」→`T恤衫`。
- 逗号和分号照课本：beautiful「美丽的，漂亮的」、bag「包，手提包；袋子」、see「看见，看到」、no「不，不是；没有」、much「非常，很；许多」、read「读，阅读」、idea「想法，主意」。

## 拼写校验

`python -X utf8 docs/wordlists/unit_check.py docs/unit-words/mj3b.json` 输出：

```
# mj3b：共 135 个词条，词表外 4 个
- `you're` （u2 you're （you are）你是）
- `can't` （u2 can't （cannot）不能；不会）
- `Moscow` 专有名词？（u3 Moscow 莫斯科）
- `York` 专有名词？（u3 New York 纽约）
```

逐个说明：

- `you're`：you are 的缩写，课本原文就是 you’re=you are（图 80），按统一写法保留缩写作为词头。拼写没有问题。
- `can't`：cannot 的缩写，课本原文就是 can’t=cannot（图 80），同上。
- `Moscow`：专有名词（莫斯科），课本原文如此（图 80，细体）。
- `York`：专有名词 New York（纽约）的一部分，课本原文如此（图 80，细体）。

## 与对照来源比对

第三方：英语朗读宝 https://yyld.51jiaoxi.com/sanxia/mjb_danci.html（使用本地另存的 yy_sanxia.html，能正常读出 4 个单元的词表）。只用来比对词数。

| 单元 | 最终 | 第三方 | 差 |
|---|---|---|---|
| u1 | 42 | 40 | −2 |
| u2 | 32 | 34 | +2 |
| u3 | 34 | 33 | −1 |
| u4 | 27 | 28 | +1 |
| 合计 | 135 | 135 | 0 |

差异说明：

1. **not、isn't=is not 放错单元**：第三方把这两个词放在 Unit 2（sports ground 后面），和 2025 春首版一致；2026 印次已移到 Unit 1（no 后面、tiger 前面，图 79）。以 2026 印次为准，属第三方没跟上新印次。
2. **picture 放错单元**：第三方放在 Unit 4 第一个；课本图 81 左栏 picture 在 Unit 3 末尾（use 之后、「Unit 4」标题之前），是第三方放错单元。
3. **eighteen 顺序**：第三方把 eighteen 排在 seventeen 和 nineteen 之间；课本里排在 toy 后面、watch 前面（图 81）。只是顺序不同，不影响词数。
4. 释义文字差异（不影响词数，最终照课本）：see 第三方写「看；看望」（2025 首版的释义），2026 印次是「看见，看到」；mouse 第三方「老鼠（复数 mice）」，课本「（复数 mice）老鼠」；do 第三方把两个义项顺序调换了；much 第三方「非常；很；许多」，课本「非常，很；许多」；read 第三方「读；阅读」，课本「读，阅读」。
5. 没有第三方多出或漏掉的词：两边词的集合完全相同。

## 与其它印次比对

其它印次：2025 春首版（`734487e6`，词表在图 78–80，书页 72–74）。逐条和最终词表（2026 印次）比较，有 2 处差异：

1. **see 释义**：2025 首版图 78「see 看；看望」；2026 印次图 79「see 看见，看到」。最终按 2026 写 `看见，看到`。
2. **not、isn't=is not 的单元归属**：2025 首版这两个词在 Unit 2（图 79 左栏 sports ground 之后、bike 之前）；2026 印次移到 Unit 1（图 79 右栏 no 之后、tiger 之前）。因此 2025 首版每单元词数是 u1 40、u2 34、u3 34、u4 27（共 135），2026 印次是 u1 42、u2 32、u3 34、u4 27。最终按 2026 印次。

其余词条（拼写、释义、黑体/细体、顺序）两个印次都一样。

## 结论

- 最终词表 `docs/unit-words/mj3b.json`（按 2026 年度印次）：u1 42、u2 32、u3 34、u4 27，**共 135 词**。
- 必背（黑体 must=1）108 个，认读（细体 must=0）27 个。
- A、B 完全一致（0 处不一致）；最终只按统一写法改了 3 个缩写词条（isn't、you're、can't）和 o'clock 的撇号。
- 跟 2025 首版相比有 2 处差异（see 释义；not、isn't 的单元归属），第三方词表沿用了 2025 首版的写法。

## 管理员抽查

- 抽查单元：三下 Unit 1（单词、释义、黑体，见 #9 开发说明「抽查请求」）。
- 结果：管理员 2026-10-20 08:03 评论「管理员处理阻塞：交回开发」，正文「批准」，按抽查请求的约定理解为抽查单元全部确认无误，books.js 中本册 checked 改为 true（页面不再显示「待核对」）。
- 三下 not 在哪个单元：管理员未另行说明，保持 2026 年度印次（not、isn't 在 Unit 1）。
