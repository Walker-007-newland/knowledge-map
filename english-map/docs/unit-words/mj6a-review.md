# mj6a 闽教版英语六年级上册 词表核对记录

## 来源

- 主来源：国家中小学智慧教育平台官方电子课本，闽教版（福建教育出版社）英语六年级上册（根据 2022 年版课程标准修订的新版，四单元结构），2026 年度印次，内容 ID `5c3e8e27-7815-4b0b-afba-03f3560d3c19`。教材页 https://basic.smartedu.cn/tchMaterial/detail?contentType=assets_document&contentId=5c3e8e27-7815-4b0b-afba-03f3560d3c19 ；图片地址 `https://r1-ndr.ykt.cbern.com.cn/edu_product/esp/assets/5c3e8e27-7815-4b0b-afba-03f3560d3c19.t/zh-CN/1786694039659/transcode/image/<n>.jpg`。
- 图片页码 ↔ 书页页码（正文部分：图号 = 书页 + 7）：
  - 目录：图 5–7 ↔ 书页 ii–iv（图 5 是 Unit 1–2 和 Review 1，图 6 是 Unit 3–4 和 Review 2，图 7 是 Story Time、Culture Corner、Words and Expressions、Word List、Additional Words 及人物介绍）
  - Words and Expressions：图 100–102 ↔ 书页 93–95（图 102 只有左右栏上半部分有词，下半为空白）
  - Word List（按字母排序，用来交叉核对黑体和释义）：图 103–105 ↔ 书页 96–98
  - Additional Words（书页 99 起）不是单元词表，不录入。
- 词表页注：「本单词表为主课文中出现的生词和词组，其中黑体词为《义务教育英语课程标准（2022年版）》中的二级词汇。」黑体记 must=1，细体记 must=0。课本不标词性，pos 一律为 ""。

## 目录

| 编号 | 标题 | 课本页 |
|---|---|---|
| u1 | Unit 1 Wonderful Sports Events | 2 |
| u2 | Unit 2 Healthy Life | 20 |
| — | Review 1（词表里没有词条，不放入 units） | 37 |
| u3 | Unit 3 Good Manners | 46 |
| u4 | Unit 4 Great People | 64 |
| — | Review 2（词表里没有词条，不放入 units） | 81 |
| — | Story Time / Culture Corner（词表里没有词条，不放入 units） | 88 / 92 |

单元标题与词表页「Unit 1–4」分段一致，A、B 录入的单元名与目录逐字相同。目录各课 Key words 多为旧词（football、game、begin、healthy、feel、drink、home、please、great、woman 等），不在 Words and Expressions 里（Key words 中只有 always、fan、hour、tidy、off、middle、free 在本册词表里），按约定只录词表，不补。

## 双人独立录入比对

- A：101 词；B：101 词。
- 每单元词数（A / B）：u1 24/24，u2 18/18，u3 30/30，u4 29/29。
- 单元名、mustMarked、printing、pages 以及每个词条的 u、en、pos、zh、must，A 和 B 逐字段完全相同（用 Python 逐条比较 101 个词条，0 处差异；两份文件只有 JSON 缩进排版不同）。
- unit_diff 报告不一致 0 处。
- 两人都已按统一写法录入：括号和标点全角；英文和中文之间不留空格（`（begin的过去式）开始`、`（is的过去式）是`、`（are的过去式）是`、`（win的过去式）获胜；赢`、`（do的过去式）做；干`）；本册没有撇号词和缩写词条。

## 裁定记录

| 编号 | A | B | 裁定 | 依据：图 n 原文 |
|---|---|---|---|---|
| （无） | — | — | A、B 无任何不一致，最终数据与两份录入逐字段相同，无需裁定 | — |

录入员备注里提到的点都已核对，维持录入：跨行释义 off「从……去掉；从……/离开」、hardworking「努力的；/勤劳的」、develop「（使）发展；/（使）成长」、American「美国的；/美国人」（图 101）拼成一行正确；`dining table` 是一个词组词条（图 101 左栏、Word List 图 103 右栏都是一条），细体；`country` 两处都是细体（图 101 右栏、Word List 图 103 左栏）。

## 通读全表另外发现的问题

无。把图 100–102 每栏用 PIL 裁剪放大 2 倍（`work-R-mj6a/p100_cL1.png` 等，每页左右栏各分上下两段），逐条核对了 101 条的英文拼写和大小写（Olympic、Olympics、American 首字母大写）、中文释义与全角标点、单元归属和顺序、跨行拼接，全部与最终数据一致。`won` 一条在图 100 左栏行末「获胜；赢」的「赢」紧贴栏边，与 Word List 图 105「（win的过去式）获胜；赢」对照确认无后续文字。

黑体与 Word List（图 103–105，共 101 条，与词表一一对应）逐词对照：词表黑体 23 个（began、answer、was、were、won、second、ill、bad、well、always、fan、hour、tidy、fourth、cup、sure、off、did、easily、middle、free、bring、think），Word List 黑体也是这 23 个，完全一致。比较容易看错的：`country`、`most`、`popular`、`future`、`smart` 是细体；`fan`、`cup`、`off`、`free` 是黑体；Unit 4 只有 3 个黑体。

## 拼写校验

`python -X utf8 docs/wordlists/unit_check.py docs/unit-words/mj6a.json` 输出：

```
# mj6a：共 101 个词条，词表外 1 个
- `chopstick` （u3 chopstick 筷子）
```

- `chopstick`：筷子的单数形式，课标词表收的是复数 chopsticks，工具的变形还原只做「复数→单数」方向，没有反向，所以报出。课本原文如此（图 101 右栏、Word List 图 103 左栏），拼写正确。

## 与对照来源比对

未找到可用的对照来源。尝试过的网址（2026-10-22）：

- 英语朗读宝 https://yyld.51jiaoxi.com/liushang/mjb_danci.html ：能打开，页面写「同步2026新闽教版」，但实际是旧版 8 单元结构（Unit 1 The Olympic Games、Unit 2 Physical Exercises … Unit 8 The Universe，Unit 1 词为 game、Olympic Games、take place 等），与新版四单元教材不对应，不能用来比对。
- 英语朗读宝 https://yy.suyang123.com/xiaoxue/liunianji/mjb_shangce_words1.html – words4.html（从站点 sitemap 找到）：能打开，内容同为旧版，不能用。
- 网页搜索新版单元标题加单词：没有找到新版词表。

## 与其它印次比对

无。国家中小学智慧教育平台上这册新版只有一个印次（2026 年度版），没有其它印次可比。

## 大小写冲突

把本册和第 1 期 mj3a、mj3b、mj4a、mj4b 以及同期 mj5a 的全部词条转成小写后比较：

- **整条词条**：没有「小写相同、大小写不同」的冲突。本册 `Olympic`、`Olympics`、`American` 在其它各册里都没有小写形式的词条。
- **短语内单词**（只记录）：本册 `national`（国家的）↔ mj5a u2 `National Day` 里的 `National`。
- 数据不改。

## 结论

- 最终词表 `docs/unit-words/mj6a.json`（2026 年度印次）：u1 24，u2 18，u3 30，u4 29；**共 101 个词条**。
- 必背（黑体，must=1）23 个：u1 6、u2 8、u3 6、u4 3；认读（细体，must=0）78 个。
- 裁定 0 处：A、B 录入完全一致，回到课本通读也没有发现错误，最终数据与两份录入逐字段相同。
