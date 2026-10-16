# 超纲词修改说明

用户要求：每个知识点用到的英文单词，不要超出该年级学生的词汇量。

- 四到六年级的知识点：对照小学词表（`docs/wordlists/xiaoxue.txt`）。
- 七到九年级的知识点：对照课标“初中（义务教育）”词表。
- 词汇类知识点讲过的词、讲解里讲到的教学目标词，从所在年级起算作已学。

`docs/vocab-report.json` 列出了每个知识点里超纲的词，包括级别、类别、出现位置和上下文。查一个词能不能用：

```
python -X utf8 docs/wordlists/check_word.py <年级> 词1 词2 …
```

## 处理规则

**级别 A（超出初中词表，必须处理）**

1. 首选：换成同年级词表内的同义词，或者改写句子绕开它。例如：
   - contest → competition
   - stadium → sports centre / playground
   - clapped → cheered（先查表确认）
   - pigeons → birds
   - pen pal → pen friend（先查表）
   - hallway → 改写句子
   改完用 check_word.py 确认新词达标。
2. 以下情况可以保留：
   - 这个词本身就是题目要考的目标，比如猜词义题要猜的词、构词法题给出的词根；
   - 阅读材料里确实绕不开的词。保留时，七到九年级的阅读材料可以按中考惯例在词后加中文注释，如 `bronze ware (青铜器)`。每篇材料最多注 3 个，能换的尽量换。
3. 语音题里拿来练拼读的词（cape、fin、sip、chop、yam、cop、jet 等）：尽量换成学生学过的词，比如 cake/fin→fish/sit/shop。必须保留拼读规律，并保证答案仍然唯一。

**级别 B（四到六年级用了初中词，建议简化）**

只处理“对小学生明显偏难”的词，例如 temperature、experiments、relatives、ceremony、fisherman、century、university、correctly、meanings。能换成小学词表里的词就换，题干说明类的句子可以改用中文提示。

小学课本里常见的话题词可以保留，例如 o'clock、cute、picnic、beach、guitar、pet、basket、bedroom、lemon、rabbit、fun、bamboo、climb。

## 改的时候注意

- 改词后，题目答案必须仍然正确且唯一，解析要同步改。
  - 听力题：`say` 原文、选项、解析一起改。
  - 阅读材料：所有引用该处的题目、`explain`、例题一起改。
- 不要为了换词而让句子变得生硬，可以整句重写。
- 不改讲解（learn）里作为教学目标的词。词汇类知识点的词表也不改，它们本身就是在教这些词。
- JS 语法安全：长文本用反引号模板字符串，内容里不能出现反引号和 `${`；单引号字符串里的撇号写 `\'` 或改用双引号。改完用 Python 检查括号是否配对，并重读改动过的地方。

## 汇报（200 字以内）

每个文件写清楚：改了哪些词（旧→新），保留并加了注释的词，保留不改的词及理由。
