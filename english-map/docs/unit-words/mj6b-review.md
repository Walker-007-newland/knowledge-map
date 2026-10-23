# mj6b 闽教版英语六年级下册（旧版） 词表核对记录

## 为什么用旧版

新版（根据 2022 年版课程标准修订）六年级下册要 2027 春季才使用，国家中小学智慧教育平台目前只有旧版（三年级起点）。管理员 2026-10-22 决定：新书没出的册先用现行旧版词表，页面标「旧版教材」（books.js `old: true`），新版出版后整册替换。

## 来源

- 主来源：国家中小学智慧教育平台官方电子课本，《义务教育教科书·英语（三年级起点）六年级下册》，福建教育出版社，2014 年 12 月第 1 版、2025 年 12 月第 19 次印刷（图 3 版权页），内容 ID `4037fd57-e8f0-4bfc-a873-898ed20f6266`。教材页 https://basic.smartedu.cn/tchMaterial/detail?contentType=assets_document&contentId=4037fd57-e8f0-4bfc-a873-898ed20f6266 ；图片地址 `https://r1-ndr.ykt.cbern.com.cn/edu_product/esp/assets/4037fd57-e8f0-4bfc-a873-898ed20f6266.t/zh-CN/1772437790040/transcode/image/<n>.jpg`（共 48 张，第 5 张起为跨页双页图）。
- 图号 ↔ 书页：目录 图 5；Picture Dictionary 图 42（书页 74–75）；**Words and Expressions 图 43（书页 76–77）**；Word List 图 44–45（书页 78–81，用来交叉核对颜色和拼写）。
- 词表页注：「红色的词语要求能听说、认读并正确书写；打“*”的为课后阅读中出现的词语」。红色记 must=1，黑色和带 * 的记 must=0；en 去掉 *。课本不标词性，pos 一律 ""。

## 目录

| 编号 | 标题 | 课本页 |
|---|---|---|
| u1 | Unit 1 Winter Activities | 2 |
| u2 | Unit 2 Helping Each Other | 9 |
| u3 | Unit 3 Seeing a Doctor | 16 |
| u4 | Unit 4 Mother's Day | 23 |
| u5 | Unit 5 Occupation | 36 |
| u6 | Unit 6 Dream Job | 43 |
| u7 | Unit 7 A Visit to a Middle School | 50 |
| u8 | Unit 8 Farewell | 57 |
| — | Review 1、Review 2、Story Time（词表里没有词条，不放入 units） | 30 / 64 / 70 |

## 双人独立录入比对

- A：71 词；B：71 词（`entries/mj6b-A.json`、`entries/mj6b-B.json`，两个代理各自看课本图片录入，互不可见）。
- 每单元词数（A / B）：u1 11/11，u2 9/9，u3 14/14，u4 6/6，u5 9/9，u6 4/4，u7 12/12，u8 6/6。
- `unit_diff.py mj6b A B`：不一致 0 处；另用 Python 逐字段比较原始 JSON，units 与 words 完全相同。录入员 B 另把颜色和 Word List（图 44–45）逐条比对，一致。
- 红色（must=1）51 个：u1 6，u2 8，u3 10，u4 4，u5 9，u6 4，u7 6，u8 4。

## 裁定记录

| 编号 | A | B | 裁定 | 依据 |
|---|---|---|---|---|
| （无） | — | — | A、B 无任何不一致，最终数据 = 两份录入 | — |

第三人（开发）回到图 43 逐栏通读，71 条的拼写、颜色、释义、单元归属都与最终数据一致。统一写法：

- `mustn't = must not 不允许`（黑色）按缩写词条约定录为 en `mustn't`、zh「（must not）不允许」。
- `break（过去式 broke）摔断` 录为 en `break`、zh「（过去式broke）摔断」。
- `teachers' office` 课本印弯撇号，录直撇号。
- 跨栏续接：右页右栏顶部 physics … geography 接右页左栏的 Unit 7。

## 拼写校验

`python -X utf8 docs/wordlists/unit_check.py docs/unit-words/mj6b.json` 输出：

```
# mj6b：共 71 个词条，词表外 2 个
- `Yangtze` 专有名词？（u1 the Yangtze River 长江）
- `Edison` 专有名词？（u7 Edison 爱迪生）
```

- `Yangtze`：长江的英文专名，课本原文 the Yangtze River，拼写正确。
- `Edison`：人名爱迪生，课本原文如此，拼写正确。

## 与对照来源比对

本期只核了官方电子课本（两份独立录入完全一致，且与 Word List 交叉核对过），没有再找第三方词表逐词比对。

## 与其它印次比对

平台上本册只有一个印次（2025 年 12 月第 19 次印刷）。

## 大小写冲突

全部已录各册转小写比较，本册新增 1 处：u8 `miss`（想念）↔ mj3a `Miss`（小姐）。逐词记录按小写英文做 id（方案定的），两者会共用一条背默记录：标会一个，另一个也显示会了。与第 1 期测试报告提到的 `it`/`IT` 同类，数据不改，后续如改为区分大小写的 id 一并解决。

## 结论

- 最终词表 `docs/unit-words/mj6b.json`：8 个单元，**共 71 个词条**，必背（红色）51 个，认读 20 个。
- 裁定 0 处。页面显示「旧版教材」。

## 管理员抽查

- 抽查单元：六下（旧版）Unit 3 Seeing a Doctor（单词、释义、红色，见 #9「抽查清单（第 2 期补充：五下、六下旧版）」）。
- 结果：管理员 2026-10-23 回复「#9 抽查批准」，第 2 期四册（五上、六上、五下、六下）按全部确认无误处理，books.js 中本册 checked 改为 true（页面不再显示「待核对」）。
