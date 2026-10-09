# 第 4 阶段：题型技能（module: skill）

依据：2025 年起福建中考英语题型有调整。网上依据一检、模拟卷整理的信息是：取消单项选择，情景交际改为补全对话（七选五），新增任务型阅读，阅读还原改为六选五或七选五，短文填空每空 1–2 词，看图写话约 12 分，书面表达约 20 分。这些尚无官方最终说明，所以每个题型节点的 tip 都要提醒“以当年《考试说明》为准”，题型覆盖新旧两种形式。

所有阅读、完形、听力材料必须原创，不得照抄真题或网上文章。

格式：id | 完整标题 | 图上短名 | 年级 | 考频 | 前置

## A 组 → data/skill-a.js（听力、补全对话、看图写话）
- s-listening-basic | 听力：听句子选图与听对话选答 | 听力基础 | 7 | 3 | p-stress-intonation, t-request
- s-listening-long | 听力：长对话、独白与信息记录 | 长对话与独白 | 8 | 3 | s-listening-basic, v-numbers-time
- s-dialogue | 补全对话（七选五口语表达） | 补全对话 | 8 | 3 | t-feelings, t-request
- s-picture | 看图写话 | 看图写话 | 8 | 3 | g-sentence-elements, g-present-cont, g-past-simple

## B 组 → data/skill-b.js（完形、短文填空、阅读基础）
- s-cloze | 完形填空 | 完形填空 | 8 | 3 | g-conj, v-high-freq-verbs
- s-passage-fill | 短文填空（所给词/首字母，每空 1–2 词） | 短文填空 | 9 | 3 | g-word-form, g-tense-review
- s-reading-detail | 阅读理解：细节理解与数字计算 | 阅读·细节题 | 7 | 3 | g-wh-q
- s-reading-main | 阅读理解：主旨大意、标题与写作目的 | 阅读·主旨题 | 8 | 3 | s-reading-detail

## C 组 → data/skill-c.js（阅读进阶、应试策略）
- s-reading-infer | 阅读理解：推理判断与词义猜测 | 阅读·推理猜词 | 8 | 3 | s-reading-detail, g-word-form
- s-reading-gap | 阅读还原（六选五 / 七选五补全短文） | 阅读还原 | 9 | 3 | s-reading-main, g-conj
- s-task-reading | 任务型阅读（回答问题、信息转换） | 任务型阅读 | 9 | 3 | s-reading-infer, g-sentence-elements
- s-exam-strategy | 中考英语应试策略与时间分配 | 应试策略 | 9 | 2 | s-cloze, s-reading-gap, s-writing-structure

## D 组 → data/skill-d.js（书面表达）
- s-writing-structure | 书面表达：审题、要点与三段式结构 | 写作·审题结构 | 8 | 3 | g-compound-sentence, g-adv-reason
- s-writing-polish | 书面表达：高分句型与连接词 | 写作·高分句型 | 9 | 3 | s-writing-structure, g-attributive, g-it-pattern
- s-writing-letter | 书面表达：书信、邮件、倡议书与通知 | 写作·应用文 | 9 | 3 | s-writing-structure
- s-writing-topics | 书面表达：常考话题与范文（家乡、校园、成长、环保等） | 写作·常考话题 | 9 | 3 | s-writing-polish, v-festivals-culture, v-life-growth
