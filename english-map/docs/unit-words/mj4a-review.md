# mj4a 闽教版英语四年级上册 词表核对记录

## 来源

- 主来源：国家中小学智慧教育平台官方电子课本，闽教版（福建教育出版社）英语四年级上册（根据 2022 年版课程标准修订），2026 年度印次，内容 ID `6f504e72-3849-bd36-3e21-c9c853e3b977`。
- 图片页码 ↔ 书页页码：
  - 目录：图 5–7 ↔ 书页 ii–iv（图 5 是 Unit 1–2 和 Review 1，图 6 是 Unit 3–4 和 Review 2，图 7 是 Story Time、Words and Expressions、Word List、Additional Words 及人物介绍）
  - Words and Expressions：图 79–81 ↔ 书页 72–74
  - Word List（按字母排序，用来交叉核对黑体）：图 82–85 ↔ 书页 75–78
- 词表页注：「本单词表为主课文中出现的生词和词组，其中黑体词为《义务教育英语课程标准（2022年版）》中的二级词汇。」黑体记 must=1，细体记 must=0。课本不标词性，pos 一律为 ""。

## 目录

| 编号 | 标题 | 课本页 |
|---|---|---|
| u1 | Unit 1 Our School | 2 |
| u2 | Unit 2 Daily Life | 16 |
| — | Review 1（词表里没有词条，不放入 units） | 29 |
| u3 | Unit 3 Our Hobbies | 36 |
| u4 | Unit 4 Chinese Festivals | 50 |
| — | Review 2（词表里没有词条，不放入 units） | 63 |
| — | Story Time（词表里没有词条，不放入 units） | 70 |

## 双人独立录入比对

- A：111 词；B：111 词。
- 每单元词数（A / B）：u1 25/25，u2 27/27，u3 24/24，u4 35/35。
- 单元名、mustMarked、各词的 en、must、pos，A 和 B 完全一致。
- unit_diff 报告不一致 0 处（它比对时会忽略空格、把弯撇号和直撇号当成同一字符）。逐字比对两份 JSON，实际只有 1 处文字差异：`has` 的 zh 里 A 在「have」和「的」之间留了空格，B 没留。
- 两人都把 `they’re=they are`、`he’s=he is` 整条录进 en（弯撇号），不符合最终统一写法，由裁定改正，见下表。

## 裁定记录

| 编号 | A | B | 裁定 | 依据：图 n 原文 |
|---|---|---|---|---|
| `u3/they're/missing` | 无（录成 `they’re=they are`） | 无（录成 `they’re=they are`） | 新写法：en `they're`（直撇号），zh `（they are）他们是；她们是；它们是`，must 0。**两人都错**（按统一写法） | 图 80（书页 73）左栏 Unit 3 第 7 条原文「they’re=they are　他们是；她们是；它们是」（释义跨行），细体；Word List 图 85（书页 78）同样写法，细体 |
| `u3/they're=they are/missing` | en `they’re=they are`，zh `他们是；她们是；它们是`，must 0 | 同 A | 删除这一写法，用上一行代替。**两人都错** | 同上，图 80 |
| `u3/he's/missing` | 无（录成 `he’s=he is`） | 无（录成 `he’s=he is`） | 新写法：en `he's`（直撇号），zh `（he is）他是`，must 0。**两人都错**（按统一写法） | 图 80（书页 73）右栏第 4 条原文「he’s=he is　他是」，细体；Word List 图 83（书页 76）Hh 栏同样，细体 |
| `u3/he's=he is/missing` | en `he’s=he is`，zh `他是`，must 0 | 同 A | 删除这一写法，用上一行代替。**两人都错** | 同上，图 80 |
| `u2/has/zh`（unit_diff 忽略空格，未单独报出） | `（have 的第三人称单数形式）有；吃`（have 后有空格） | `（have的第三人称单数形式）有；吃` | `（have的第三人称单数形式）有；吃`。**A 错**（统一写法：英文和中文之间不留空格） | 图 79（书页 72）右栏「has （have 的第三人称单数形式）有；吃」，课本排版有间距；按统一写法去掉 |

说明：A、B 的 en 照课本印刷用了弯撇号 `’`，最终统一改成直撇号 `'`，不算录错。IT 一条两人都已按统一写法录成 en `IT`、zh `（Information Technology）信息技术`，正确。

## 你通读全表另外发现并改正的问题

无。把图 79–81 每栏放大 2 倍逐条核对了 111 条的拼写、中文、标点、跨行拼接（IT、has、Ms.、their、interesting、they're、them、yours）和黑体/细体，又和 Word List（图 82–85）逐词对照黑体，全部与最终数据一致。比较容易看错的：`full`（细体，放大后和上一行黑体 bus 对比明显偏细，Word List 里也和黑体 from 对比为细体）、`hobby`（单元标题词但为细体）、`chore`（黑体）、`ping-pong`（黑体）。

## 拼写校验

`python -X utf8 docs/wordlists/unit_check.py docs/unit-words/mj4a.json` 输出：

```
# mj4a：共 111 个词条，词表外 4 个
- `they're` （u3 they're （they are）他们是；她们是；它们是）
- `kung` （u3 kung fu 功夫）
- `fu` （u3 kung fu 功夫）
- `Peking` 专有名词？（u3 Peking opera 中国京剧）
```

- `they're`：they are 的缩写，课本原文如此（图 80）；工具的变形还原只处理 's 和 n't，没处理 're，所以报出。
- `kung`、`fu`：`kung fu`（功夫）是汉语音译词组，课本原文如此（图 80），拼写正确。
- `Peking`：专有名词（北京的旧式拼写），`Peking opera` 课本原文如此（图 80），拼写正确。

## 与对照来源比对

对照来源：英语朗读宝 yy.suyang123.com 闽教版四年级上册 Unit 1–4 单词页（mjb_shangce_words1.html–words4.html），均可打开。

| 单元 | 第三方 | 最终 | 差异 |
|---|---|---|---|
| u1 | 24 | 25 | 第三方漏了 IT（信息技术）；另外第三方把 cousin 排在 which 之后，课本是 student 之后（顺序不同，不影响词数） |
| u2 | 27 | 27 | 无 |
| u3 | 24 | 24 | 无（第三方 they're、he's 的写法与课本格式不同，内容一致） |
| u4 | 35 | 35 | 词数一致；第三方 best 释义写「最」，课本是「最好的」（图 81），以课本为准 |
| 合计 | 110 | 111 | |

## 与其它印次比对

- 2025 秋首版（内容 ID `03f15d9f-6ad1-4c83-a523-de5584b9ee77`，86 张图）：目录图 5–6 和词表、Word List 图 79–85 与 2026 年度印次的图片文件逐字节相同（MD5 一致），词表无任何差异。
- （两印次不同的图为 1、3、15、25、38、58、61、63、67、87，都不在目录和词表页。）

## 结论

- 最终各单元词数：u1 25，u2 27，u3 24，u4 35；共 111 个词条。
- 必背（黑体，must=1）68 个：u1 20、u2 20、u3 15、u4 13；认读（细体，must=0）43 个。
- 裁定 5 处：A 错 1 处（has 释义空格），B 错 0 处，两人都错 4 处（they're、he's 两个缩写词条的写法，各对应 2 个编号）。
