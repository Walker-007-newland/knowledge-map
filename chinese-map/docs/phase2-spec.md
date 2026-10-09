# 第 2 阶段：积累与运用 知识点清单

格式：id | 完整标题 | 图上短名 | 模块 | 年级 | 考频 | 前置

第 1 阶段已有（不重写）：z-duoyin 多音字、z-chengyu 成语使用、y-xiuci 修辞（比喻拟人夸张排比）、y-bingju 病句（残缺与搭配）、c-biaoyu 拟写标语。
本阶段新增 40 个点，同时把 z-chengyu 的前置改为 z-chengyu-ji，y-bingju 的前置改为 y-chengfen。

## A 组 字词（一）→ data/zici-a.js
- z-pinyin | 拼音规则：声调标注与音节拼写 | 拼音规则 | zici | 4 | 1 | —
- z-bushou | 查字典：音序、部首与选择字义 | 查字典 | zici | 4 | 1 | z-pinyin
- z-xingsheng | 形声字：形旁表义、声旁表音 | 形声字 | zici | 4 | 2 | —
- z-xingjin | 形近字辨析 | 形近字 | zici | 4 | 3 | z-xingsheng
- z-tongyin | 同音字与常见错别字 | 同音易错字 | zici | 5 | 3 | z-xingjin
- z-yidu | 常见易读错的字 | 易读错字 | zici | 6 | 3 | z-duoyin
- z-shufa | 汉字演变与书法常识 | 书法常识 | zici | 6 | 1 | —

## B 组 字词（二）→ data/zici-b.js
- z-fanyi | 反义词与词语搭配 | 反义词与搭配 | zici | 4 | 2 | —
- z-jinyi | 近义词辨析 | 近义词辨析 | zici | 5 | 3 | —
- z-chengyu-ji | 成语积累：意思、出处与分类 | 成语积累 | zici | 5 | 2 | —
- z-xiehouyu | 歇后语、谚语与俗语 | 歇后语谚语 | zici | 5 | 1 | —
- z-ganqing | 词语的感情色彩 | 感情色彩 | zici | 6 | 2 | z-jinyi
- z-ciyi | 联系语境理解词语含义 | 语境理解词义 | zici | 6 | 3 | z-jinyi

## C 组 语法（一）→ data/yufa-a.js
- y-jushi | 句式变换：反问句、双重否定句、把字句与被字句 | 句式变换 | yufa | 4 | 2 | —
- y-zhuanshu | 直接引语改间接引语（转述句） | 转述句 | yufa | 4 | 2 | y-jushi
- y-kuoju | 扩句与缩句 | 扩句缩句 | yufa | 5 | 1 | —
- y-cixing | 词性（一）：实词 | 实词 | yufa | 7 | 2 | —
- y-xuci | 词性（二）：虚词 | 虚词 | yufa | 7 | 2 | y-cixing
- y-duanyu | 短语的结构类型 | 短语结构 | yufa | 7 | 2 | y-xuci
- y-chengfen | 句子成分：主谓宾定状补 | 句子成分 | yufa | 7 | 3 | y-duanyu

## D 组 语法（二）→ data/yufa-b.js
- y-fuju | 复句与关联词语 | 复句关联词 | yufa | 5 | 3 | —
- y-xiuci2 | 修辞（二）：对偶、反问、设问、引用 | 修辞·对偶设问 | yufa | 5 | 3 | y-xiuci
- y-biaodian1 | 标点符号（一）：逗号、顿号、分号、冒号 | 标点·逗顿分冒 | yufa | 5 | 3 | —
- y-biaodian2 | 标点符号（二）：引号、书名号、破折号、省略号 | 标点·引书破省 | yufa | 6 | 3 | y-biaodian1
- y-xiuci3 | 修辞（三）：借代、反复与修辞综合辨析 | 修辞·借代反复 | yufa | 8 | 2 | y-xiuci2
- y-bingju2 | 病句（二）：语序不当与成分赘余 | 病句·语序赘余 | yufa | 8 | 3 | y-bingju
- y-bingju3 | 病句（三）：表意不明与不合逻辑 | 病句·歧义逻辑 | yufa | 9 | 3 | y-bingju2

## E 组 语言运用 → data/zonghe-a.js
- c-xiexin | 应用文格式：书信、通知、启事 | 应用文格式 | zonghe | 5 | 2 | —
- c-fangxie | 仿写句子 | 仿写句子 | zonghe | 5 | 3 | y-xiuci2
- c-duilian | 对联：特点与拟写 | 对联 | zonghe | 6 | 2 | y-xiuci2
- c-paixu | 语句衔接与排序 | 语句衔接 | zonghe | 6 | 3 | —
- c-xinxi | 提取信息与概括材料要点 | 提取信息 | zonghe | 7 | 3 | —
- c-tubiao | 图表、漫画的信息转述 | 图表漫画 | zonghe | 8 | 2 | c-xinxi
- c-yuduan | 语段综合题：一段话里考字词与病句 | 语段综合 | zonghe | 8 | 3 | z-tongyin, z-ciyi, y-bingju

## F 组 综合性学习与口语交际 → data/zonghe-b.js
- c-chuantong | 传统文化常识：节日、称谓与谦敬词 | 文化常识 | zonghe | 6 | 2 | —
- c-dedi | 得体表达与劝说 | 得体与劝说 | zonghe | 7 | 3 | —
- c-wenxue | 文学常识：重要作家与作品 | 文学常识 | zonghe | 7 | 1 | —
- c-jianyi | 提建议与写倡议 | 提建议 | zonghe | 7 | 2 | c-dedi
- c-yanjiang | 口语交际：演讲与发言 | 演讲发言 | zonghe | 8 | 1 | c-dedi
- c-qingjing | 情境应答：采访、主持与介绍 | 情境应答 | zonghe | 8 | 2 | c-dedi
