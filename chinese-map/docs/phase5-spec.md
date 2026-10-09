# 第 5 阶段：名著阅读与写作 知识点清单

格式：id | 完整标题 | 图上短名 | 模块 | 年级 | 考频 | 前置

依据：docs/mingzhu-list.md（统编修订版“整本书阅读”书目调研 + 福建中考名著题考法）。
- 修订版每册 2 部：七上《朝花夕拾》《西游记》、七下《骆驼祥子》《钢铁是怎样炼成的》、八上《红星照耀中国》《红岩》、八下《经典常谈》《昆虫记》、九上《简·爱》《唐诗三百首》；九下新版待核实。
- 旧版必读、修订版调出但仍常读的：《海底两万里》《艾青诗选》《水浒传》——作为“拓展阅读”收入。
- 福建中考名著题近年不点名考某一部书，而是一道 80 字左右的小写作：结合自选名著谈阅读方法（如“由博返约”、圈点批注够不够）、写人物简评（先反驳常见看法再立论）。所以方法类和答题类知识点很重要，每部书的点都要能为这类题提供“可用的情节和人物素材”。

第 1 阶段已有：m-xiyou《西游记》（7）、xz-xijie 细节描写（5）、xz-shenti 审题立意（7）。

## S 组 名著方法与小学读书 → data/mingzhu-a.js
- m-xx-shenhua | 快乐读书吧：中国古代神话 | 中国神话 | mingzhu | 4 | 1 | —
- m-xx-sida | 快乐读书吧：走进中国古典名著 | 古典名著入门 | mingzhu | 5 | 1 | m-xx-shenhua
- m-xx-chengzhang | 快乐读书吧：成长小说（《童年》等） | 成长小说 | mingzhu | 6 | 1 | —
- m-xx-maoxian | 快乐读书吧：外国名著（《鲁滨逊漂流记》等） | 外国名著入门 | mingzhu | 6 | 1 | —
- m-fangfa1 | 整本书阅读方法（一）：精读、略读、浏览、跳读 | 阅读方法一 | mingzhu | 7 | 3 | —
- m-fangfa2 | 整本书阅读方法（二）：圈点批注、做笔记、专题探究、由博返约 | 阅读方法二 | mingzhu | 7 | 3 | m-fangfa1
- m-dati | 名著题怎么答：人物简评、阅读方法、推荐与评价 | 名著答题 | mingzhu | 8 | 3 | m-fangfa2

## T 组 名著（一）→ data/mingzhu-b.js
- m-zhaohua | 名著《朝花夕拾》 | 《朝花夕拾》 | mingzhu | 7 | 3 | m-fangfa1
- m-luotuo | 名著《骆驼祥子》 | 《骆驼祥子》 | mingzhu | 7 | 3 | m-fangfa1
- m-gangtie | 名著《钢铁是怎样炼成的》 | 《钢铁是怎样炼成的》 | mingzhu | 7 | 3 | m-fangfa1
- m-hongxing | 名著《红星照耀中国》 | 《红星照耀中国》 | mingzhu | 8 | 3 | m-fangfa2
- m-hongyan | 名著《红岩》 | 《红岩》 | mingzhu | 8 | 3 | m-fangfa2

## U 组 名著（二）→ data/mingzhu-c.js
- m-jingdian | 名著《经典常谈》 | 《经典常谈》 | mingzhu | 8 | 2 | m-fangfa2
- m-kunchong | 名著《昆虫记》 | 《昆虫记》 | mingzhu | 8 | 3 | m-fangfa2
- m-jianai | 名著《简·爱》 | 《简·爱》 | mingzhu | 9 | 3 | m-dati
- m-tangshi | 整本书阅读《唐诗三百首》 | 《唐诗三百首》 | mingzhu | 9 | 2 | m-dati, s-zonghe
- m-shuihu | 拓展阅读：《水浒传》 | 《水浒传》 | mingzhu | 9 | 2 | m-dati
- m-haidi | 拓展阅读：《海底两万里》 | 《海底两万里》 | mingzhu | 7 | 1 | m-fangfa1
- m-aiqing | 拓展阅读：《艾青诗选》 | 《艾青诗选》 | mingzhu | 9 | 1 | m-dati

## V 组 写作基础 → data/xiezuo-a.js
- xz-xieren | 写人：抓住特点，用事例说话 | 写人 | xiezuo | 4 | 2 | —
- xz-xieshi | 写事：把过程写清楚、写具体 | 写事 | xiezuo | 4 | 2 | —
- xz-xiangxiang | 想象作文 | 想象作文 | xiezuo | 4 | 1 | —
- xz-zhuangwu | 状物：写好一样东西 | 状物 | xiezuo | 5 | 1 | xz-xieshi
- xz-xuancai | 选材：真实、典型、新颖 | 选材 | xiezuo | 6 | 3 | xz-xijie
- xz-kaitou | 开头与结尾 | 开头结尾 | xiezuo | 6 | 3 | xz-xuancai
- xz-shuqing | 抒情：写出真情实感 | 抒情表达 | xiezuo | 7 | 2 | xz-xijie
- xz-xiejing | 写景与借景抒情 | 写景抒情 | xiezuo | 7 | 2 | xz-xijie

## W 组 写作进阶 → data/xiezuo-b.js
- xz-jiegou | 结构安排：总分总、小标题、片段组合 | 结构安排 | xiezuo | 7 | 3 | xz-shenti
- xz-bolan | 让情节有波澜：欲扬先抑、悬念、误会 | 情节波澜 | xiezuo | 8 | 2 | xz-jiegou
- xz-yuyan | 语言升格：修辞、句式与引用 | 语言升格 | xiezuo | 8 | 3 | y-xiuci2
- xz-mingti | 命题与半命题作文实战 | 命题作文 | xiezuo | 8 | 3 | xz-shenti, xz-jiegou
- xz-cailiao | 材料作文审题立意 | 材料作文 | xiezuo | 9 | 3 | xz-shenti
- xz-yilun | 议论性文章的写作 | 议论文写作 | xiezuo | 9 | 2 | x-yl-silu
- xz-xiugai | 作文修改与自评 | 作文修改 | xiezuo | 9 | 2 | xz-mingti

合计 34 个新点（名著 19、写作 15）。加上已有 3 个，名著 20 个点、写作 17 个点。

## 本阶段特别要求
- 名著：人物、情节、章节、书中原话必须与原著（通行译本）一致；拿不准的细节不写。每部书至少给：作者与背景、主要人物（性格 + 典型情节）、必知情节/篇目、主题、阅读方法专题、可用于“人物简评/阅读方法”小写作的素材。题目以 choice（情节人物判断）+ open（80 字左右小写作，按福建考法：结合情节、观点鲜明、反驳常见看法等）为主。
- 写作：每个点都要有 practice（写作练习：题目、要求、字数、自查清单、范文、点评），范文原创；tests 以 choice（审题、选材、结构判断）+ open（片段写作，给评分要点）为主。
- 题量：按 writer-rules.md 现行标准（每个讲解要点至少 1 道例题、2 道测试）。
