# mj5a 闽教版英语五年级上册 词表核对记录

## 来源

- 主来源：国家中小学智慧教育平台官方电子课本，闽教版（福建教育出版社）英语五年级上册（根据 2022 年版课程标准修订的新版，四单元结构），2026 年度印次，内容 ID `f27b9831-dcc0-49ed-be3b-622f67c63054`。教材页 https://basic.smartedu.cn/tchMaterial/detail?contentType=assets_document&contentId=f27b9831-dcc0-49ed-be3b-622f67c63054 ；图片地址 `https://r1-ndr.ykt.cbern.com.cn/edu_product/esp/assets/f27b9831-dcc0-49ed-be3b-622f67c63054.t/zh-CN/1786694225412/transcode/image/<n>.jpg`。
- 图片页码 ↔ 书页页码（正文部分：图号 = 书页 + 7）：
  - 目录：图 5–7 ↔ 书页 ii–iv（图 5 是 Unit 1–2 和 Review 1，图 6 是 Unit 3–4 和 Review 2，图 7 是 Story Time、Culture Corner、Words and Expressions、Word List、Additional Words、The Ordinal Numbers 及人物介绍）
  - Words and Expressions：图 98–100 ↔ 书页 91–93
  - Word List（按字母排序，用来交叉核对黑体和释义）：图 101–104 ↔ 书页 94–97
  - Additional Words（书页 98 起）和 The Ordinal Numbers（书页 100）不是单元词表，不录入。
- 词表页注：「本单词表为主课文中出现的生词和词组，其中黑体词为《义务教育英语课程标准（2022年版）》中的二级词汇。」黑体记 must=1，细体记 must=0。课本不标词性，pos 一律为 ""。

## 目录

| 编号 | 标题 | 课本页 |
|---|---|---|
| u1 | Unit 1 Weather in Different Seasons | 2 |
| u2 | Unit 2 Months of the Year | 20 |
| — | Review 1（词表里没有词条，不放入 units） | 37 |
| u3 | Unit 3 Plans and Dates | 46 |
| u4 | Unit 4 Our Dream Jobs | 64 |
| — | Review 2（词表里没有词条，不放入 units） | 81 |
| — | Story Time / Culture Corner（词表里没有词条，不放入 units） | 88 / 90 |

单元标题与词表页「Unit 1–4」分段一致，A、B 录入的单元名与目录逐字相同。目录各课 Key words 里的旧词（summer、morning、cool、tomorrow、card、chore、pet、nurse、cousin、China 等）不在 Words and Expressions 里，按约定只录词表，不补。

## 双人独立录入比对

- A：135 词；B：135 词。
- 每单元词数（A / B）：u1 39/39，u2 42/42，u3 23/23，u4 31/31。
- 单元名、mustMarked、printing、pages 以及每个词条的 u、en、pos、zh、must，A 和 B 逐字段完全相同（用 Python 逐条比较 135 个词条，0 处差异；两份文件只有 JSON 缩进排版不同）。
- unit_diff 报告不一致 0 处。
- 两人都已按统一写法录入：撇号统一为直撇号（`New Year's Day`、`Children's Day`、`Teachers' Day`、`Mother's Day`，课本印弯撇号 ’）；括号和标点全角；英文和中文之间不留空格（`（child的复数）儿童；小孩`、`（复数men）男人；人类`、`（复数women）成年女子；妇女`）；本册没有缩写词条（无 it's 一类）。

## 裁定记录

| 编号 | A | B | 裁定 | 依据：图 n 原文 |
|---|---|---|---|---|
| （无） | — | — | A、B 无任何不一致，最终数据与两份录入逐字段相同，无需裁定 | — |

录入员存疑点的处理（都维持录入，不算不一致）：

- `month` 释义「月，月份」用逗号而非分号：图 98 右栏末「month　月，月份」、Word List 图 102 右栏同样是逗号。照原文保留全角逗号（第 1 期 mj3b 的 see「看见，看到」也是照原文保留逗号）。
- `flag-raising`：图 99 右栏和 Word List 图 102 左栏的连字符都印得偏长，像短破折号；这是字体排版，词本身是连字符复合词，按 ASCII 连字符 `-` 录入。
- `skate` 细体：图 98 左栏 skate 字色比周围偏浅灰（量了像素：深色像素数 448，旁边细体 snowy 665、黑体 snow 738），但笔画粗细与细体相同；Word List 图 103 右栏 skate 是正常黑色细体，与上下黑体 sight、snow 对比明显。定为细体，must 0。

## 通读全表另外发现的问题

无。把图 98–100 每栏用 PIL 裁剪放大 2 倍（`work-R-mj5a/p98_cL1.png` 等，每页左右栏各分上下两段），逐条核对了 135 条的英文拼写和大小写、中文释义与全角标点、单元归属和顺序、跨行拼接（inside「在……内；/在……里」、grandparent「（外）祖父；/（外）祖母」、take off「脱下；脱掉（衣物）；/起飞」、children「（child的复数）/儿童；小孩」、woman「（复数women）/成年女子；妇女」），全部与最终数据一致。

黑体与 Word List（图 101–104，共 135 条，与词表一一对应）逐词对照：词表黑体 69 个，Word List 黑体也是这 69 个，完全一致。比较容易看错的：`more`、`stay`、`plan`、`start`、`date`、`change`、`grow` 都是常见词但两处都印细体；`or`、`its`、`tea`、`Mrs.` 是黑体；`astronaut` 黑体；`different` 是 Unit 1 标题词但细体。

## 拼写校验

`python -X utf8 docs/wordlists/unit_check.py docs/unit-words/mj5a.json` 输出：

```
# mj5a：共 135 个词条，词表外 3 个
- `Wuyi` 专有名词？（u2 Mount Wuyi 武夷山）
- `motherland` （u2 motherland 祖国）
- `Beijing` 专有名词？（u4 Beijing roast duck 北京烤鸭）
```

- `Wuyi`：专有名词（武夷山的拼音），`Mount Wuyi` 课本原文如此（图 98 右栏末、Word List 图 102），拼写正确。
- `motherland`：常见英语词（祖国），课标词表和 COCA 前 2 万词里恰好没收，课本原文如此（图 99 右栏），拼写正确。
- `Beijing`：专有名词（北京），`Beijing roast duck` 课本原文如此（图 100 右栏、Word List 图 101），拼写正确。

## 与对照来源比对

未找到可用的对照来源。尝试过的网址（2026-10-22）：

- 英语朗读宝 https://yyld.51jiaoxi.com/wushang/mjb_danci.html ：能打开，页面写「同步2026新闽教版」，但实际是旧版 8 单元结构（Unit 1 Meeting New Friends … Unit 8 My Friends，Unit 1 词为 tall、beside、pupil 等），与新版四单元教材不对应，不能用来比对。
- 英语朗读宝 https://yy.suyang123.com/xiaoxue/wunianji/mjb_shangce_words1.html – words4.html（从站点 sitemap 找到）：能打开，同样是旧版 8 单元（Unit 1 为 tall、beside、pupil…），不能用。
- yy.suyang123.com 其它猜测路径（/wushang/mjb_shangce_words1.html、/wushang/mjb_danci.html）：404。
- 网页搜索「闽教版 五年级上册 Weather in Different Seasons 单词表」「Plans and Dates celebrate calendar」：没有找到新版词表。

## 与其它印次比对

无。国家中小学智慧教育平台上这册新版只有一个印次（2026 年度版），没有其它印次可比。

## 大小写冲突

把本册和第 1 期 mj3a、mj3b、mj4a、mj4b 以及同期 mj6a 的全部词条转成小写后比较：

- **整条词条**：没有「小写相同、大小写不同」的冲突。本册的 `May`（五月）在其它各册里没有小写 may 词条；`the USA` 小写后是 the usa，词内单词是 USA 而不是 US，与 mj3a u2 的 `us`（我们）小写后也不相同；本册没有 China/china（mj4a u3 有 `China`，各册无小写 china）。
- **短语内单词**（只记录，供拆词功能参考）：
  - `Day`（Children's Day、Labor Day、National Day、New Year's Day、Teachers' Day、Tree Planting Day、Mother's Day）↔ mj3a u1 `day`
  - `Great`（the Great Wall）↔ mj3a u2 `great`
  - `Yellow`（the Yellow River）↔ mj3a u3 `yellow`
  - `River`（the Yellow River）↔ 本册 u2 `river`
  - `New`（New Year's Day）↔ mj4a u1 `new`（mj3b 的 New York 也是大写）
  - `Tree`（Tree Planting Day）↔ mj4a u3 `tree`
  - `Lake`（the West Lake）↔ mj4a u3 `lake`
  - `spring`（本册 u1）↔ mj4a u4 `Spring Festival`
  - `National`（National Day）↔ mj6a u1 `national`
- 数据不改。

## 结论

- 最终词表 `docs/unit-words/mj5a.json`（2026 年度印次）：u1 39，u2 42，u3 23，u4 31；**共 135 个词条**。
- 必背（黑体，must=1）69 个：u1 23、u2 22、u3 10、u4 14；认读（细体，must=0）66 个。
- 裁定 0 处：A、B 录入完全一致，回到课本通读也没有发现错误，最终数据与两份录入逐字段相同。
