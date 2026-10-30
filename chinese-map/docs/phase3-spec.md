# 第 3 阶段：古诗文 知识点清单

格式：id | 完整标题 | 图上短名 | 模块 | 年级 | 考频 | 前置

第 1 阶段已有（不重写）：s-jianshang 意象与情感、s-moxie-7a 默写《观沧海》等四首、w-intro 小古文入门、w-fanyi 文言翻译五字法。
本阶段调整：s-jianshang 前置加 s-rumen；w-fanyi 前置改为 w-intro, w-shici1, w-tongjia。

## G 组 古诗鉴赏方法 → data/gushi-skill.js
- s-rumen | 读诗入门：标题、作者、注释与节奏 | 读诗入门 | gushi | 4 | 2 | —
- s-ticai | 诗歌题材：送别、思乡、边塞、山水田园、咏史怀古、咏物 | 诗歌题材 | gushi | 6 | 2 | s-jianshang
- s-lianzi | 炼字与诗眼 | 炼字 | gushi | 7 | 3 | s-jianshang
- s-yijing | 描绘画面与体会意境 | 画面与意境 | gushi | 7 | 3 | s-jianshang
- s-shoufa1 | 表现手法（一）：借景抒情、情景交融、托物言志 | 借景抒情·托物 | gushi | 7 | 3 | s-ticai
- s-lijie | 理解性默写的方法 | 理解性默写 | gushi | 7 | 3 | s-moxie-7a
- s-shoufa2 | 表现手法（二）：对比、衬托、用典、虚实结合 | 对比衬托用典 | gushi | 8 | 3 | s-shoufa1
- s-gelv | 格律常识：绝句与律诗、四联与对仗 | 律诗常识 | gushi | 8 | 2 | y-xiuci2
- s-ciqu | 词与曲常识：词牌、上下阕、曲牌 | 词曲常识 | gushi | 8 | 1 | s-gelv
- s-zonghe | 古诗阅读综合：情感、手法、比较阅读 | 古诗综合 | gushi | 9 | 3 | s-shoufa2, s-yijing, s-lianzi

## H 组 文言基础 → data/wenyan-skill.js
- w-gujin | 实词（一）：古今异义 | 古今异义 | wenyan | 7 | 3 | w-intro
- w-tongjia | 通假字 | 通假字 | wenyan | 7 | 2 | w-intro
- w-duoyi | 实词（二）：一词多义 | 一词多义 | wenyan | 7 | 3 | w-gujin
- w-zhi | 虚词“之” | 虚词·之 | wenyan | 7 | 3 | w-intro
- w-er | 虚词“而” | 虚词·而 | wenyan | 7 | 3 | w-zhi
- w-huoyong | 词类活用 | 词类活用 | wenyan | 8 | 2 | w-duoyi, y-cixing
- w-yiyu | 虚词“以”“于”“为” | 虚词·以于为 | wenyan | 8 | 2 | w-er
- w-qi | 虚词“其”与常见句末语气词 | 虚词·其 | wenyan | 8 | 2 | w-zhi
- w-jushi1 | 文言句式（一）：判断句与省略句 | 判断·省略句 | wenyan | 8 | 2 | w-intro, y-chengfen
- w-jushi2 | 文言句式（二）：倒装句与被动句 | 倒装·被动句 | wenyan | 8 | 3 | w-jushi1
- w-duanju | 文言断句 | 文言断句 | wenyan | 8 | 2 | w-jushi1
- w-neirong | 文言内容理解与人物分析 | 内容理解 | wenyan | 8 | 3 | w-fanyi
- w-kewai | 课外文言文阅读与比较阅读 | 课外文言 | wenyan | 9 | 3 | w-neirong, w-yiyu, w-jushi2

（注：w-fanyi 前置改为 w-intro, w-gujin, w-tongjia）

## 默写与课内篇目

依据：docs/guwen-list.md（课标 2022 附录 1 原文清单 + 统编教材位置调研）。福建中考默写只考初中课内篇目；小学篇目教材位置多处待核实，所以按主题分组，不标册别。
默写只收课标推荐背诵篇目（1～6 年级 75 篇、7～9 年级 60 篇/段）。“课标序号”指 guwen-list.md 里的序号。

## I 组 小学古诗默写（一）→ data/gushi-xx-a.js　（每个点列出所含篇目的课标序号）
- s-xx-tongqu | 小学古诗·童趣：江南、咏鹅、古朗月行等 | 古诗·童趣 | gushi | 4 | 1 | s-rumen | 1 江南、4 咏鹅、18 古朗月行、38 池上、40 小儿垂钓、73 所见、75 村居
- s-xx-chun1 | 小学古诗·春景（一）：春晓、咏柳、绝句等 | 古诗·春景一 | gushi | 4 | 1 | s-rumen | 6 咏柳、10 春晓、25 绝句（两个黄鹂）、26 春夜喜雨、27 绝句（迟日江山丽）、28 江畔独步寻花
- s-xx-chun2 | 小学古诗·春景（二）：惠崇春江晚景、江南春等 | 古诗·春景二 | gushi | 5 | 1 | s-xx-chun1 | 34 早春呈水部张十八员外、39 忆江南、47 江南春、55 惠崇春江晚景、65 春日、68 游园不值
- s-xx-jieri | 小学古诗·夏秋与节日：小池、山行、元日等 | 古诗·夏秋节日 | gushi | 4 | 1 | s-rumen | 45 山行、46 清明、50 元日、53 六月二十七日望湖楼醉书、58 三衢道中、63 小池
- s-xx-songbie | 小学古诗·送别：赠汪伦、送元二使安西等 | 古诗·送别 | gushi | 4 | 2 | s-rumen | 13 芙蓉楼送辛渐、15 送元二使安西、20 赠汪伦、21 黄鹤楼送孟浩然之广陵、24 别董大、37 赋得古原草送别、64 晓出净慈寺送林子方
- s-xx-sixiang | 小学古诗·思乡亲情：静夜思、游子吟等 | 古诗·思乡 | gushi | 4 | 2 | s-rumen | 7 回乡偶书、16 九月九日忆山东兄弟、17 静夜思、29 枫桥夜泊、33 游子吟、51 泊船瓜洲

## J 组 小学古诗默写（二）→ data/gushi-xx-b.js
- s-xx-tianyuan | 小学古诗·田园农家：悯农、四时田园杂兴等 | 古诗·田园 | gushi | 5 | 1 | s-rumen | 41 悯农（锄禾）、42 悯农（春种）、49 江上渔者、52 书湖阴先生壁、61 四时田园杂兴（昼出耘田）、62 四时田园杂兴（梅子金黄）、69 乡村四月
- s-xx-shanshui | 小学古诗·名山大川：望庐山瀑布、望天门山等 | 古诗·山水 | gushi | 5 | 1 | s-rumen | 3 敕勒歌、19 望庐山瀑布、22 早发白帝城、23 望天门山、35 望洞庭、36 浪淘沙（九曲黄河）、54 饮湖上初晴后雨
- s-xx-youjing | 小学古诗·幽静山水：鹿柴、江雪、寻隐者不遇等 | 古诗·幽静 | gushi | 5 | 1 | s-xx-shanshui | 14 鹿柴、30 滁州西涧、31 渔歌子、43 江雪、44 寻隐者不遇
- s-xx-aiguo | 小学古诗·边塞爱国：出塞、凉州词、示儿等 | 古诗·边塞爱国 | gushi | 6 | 2 | s-jianshang | 8 凉州词（黄河远上）、11 凉州词（葡萄美酒）、12 出塞、32 塞下曲、57 夏日绝句、59 示儿、60 秋夜将晓出篱门迎凉有感、67 题临安邸、74 己亥杂诗（九州生气）
- s-xx-zheli | 小学古诗·咏物与哲理：墨梅、石灰吟、题西林壁等 | 古诗·咏物哲理 | gushi | 6 | 2 | s-jianshang | 2 长歌行、5 风、9 登鹳雀楼、48 蜂、56 题西林壁、66 观书有感、70 墨梅、71 石灰吟、72 竹石

## K 组 初中诗词默写（一）→ data/gushi-cz-a.js
已有 s-moxie-7a：4 观沧海、9 次北固山下、11 闻王昌龄左迁、37 天净沙·秋思。
- s-cz-7b | 默写：《望岳》《登幽州台歌》等五首 | 默写·望岳等 | gushi | 7 | 3 | s-moxie-7a | 8 登幽州台歌、14 望岳、29 登飞来峰、33 游山西村、39 己亥杂诗（浩荡离愁）
- s-cz-mulan | 默写：《木兰诗》 | 默写·木兰诗 | gushi | 7 | 3 | s-moxie-7a | 6 木兰辞（教材题《木兰诗》）
- s-cz-kewai | 默写：《夜雨寄北》《泊秦淮》等课外诵读五首 | 默写·课外五首 | gushi | 7 | 2 | s-lijie | 7 送杜少府之任蜀州、23 泊秦淮、24 夜雨寄北、26 相见欢（无言独上西楼）、28 浣溪沙（一曲新词）
- s-cz-8a1 | 默写：《使至塞上》《黄鹤楼》《钱塘湖春行》 | 默写·使至塞上等 | gushi | 8 | 3 | s-lijie | 10 使至塞上、13 黄鹤楼、20 钱塘湖春行
- s-cz-8a2 | 默写：《春望》《饮酒》《赤壁》等五首 | 默写·春望等 | gushi | 8 | 3 | s-cz-8a1 | 5 饮酒（结庐在人境）、15 春望、21 雁门太守行、22 赤壁、32 渔家傲（天接云涛）

## L 组 初中诗词默写（二）→ data/gushi-cz-b.js
- s-cz-shijing | 默写：《关雎》《蒹葭》 | 默写·诗经二首 | gushi | 8 | 2 | s-lijie | 1 关雎、2 蒹葭
- s-cz-tangshi | 默写：《茅屋为秋风所破歌》《卖炭翁》 | 默写·茅屋卖炭 | gushi | 8 | 3 | s-lijie | 16 茅屋为秋风所破歌、19 卖炭翁
- s-cz-9a | 默写：《行路难》《水调歌头》等四首 | 默写·行路难等 | gushi | 9 | 3 | s-cz-8a2 | 12 行路难（其一）、18 酬乐天扬州初逢席上见赠、25 无题（相见时难）、31 水调歌头（明月几时有）
- s-cz-9b | 默写：《过零丁洋》《白雪歌》等五首 | 默写·过零丁洋等 | gushi | 9 | 3 | s-cz-8a2 | 3 十五从军征、17 白雪歌送武判官归京、34 南乡子·登京口北固亭有怀、36 过零丁洋、38 山坡羊·潼关怀古
- s-cz-ci | 默写：《江城子》《破阵子》等词四首 | 默写·词四首 | gushi | 9 | 3 | s-ciqu | 27 渔家傲（塞下秋来）、30 江城子·密州出猎、35 破阵子·为陈同甫赋壮词以寄之、40 满江红（小住京华）

## M 组 文言篇目（一）→ data/wenyan-pian-a.js
- w-p-boya | 《伯牙鼓琴》 | 伯牙鼓琴 | wenyan | 6 | 1 | w-intro | 46
- w-p-lunyu | 《论语》十二章 | 论语十二章 | wenyan | 7 | 3 | w-intro | 41
- w-p-loushi | 《陋室铭》《爱莲说》 | 陋室铭·爱莲说 | wenyan | 7 | 3 | w-zhi | 53、57
- w-p-sanxia | 《三峡》 | 三峡 | wenyan | 8 | 3 | w-gujin | 51
- w-p-duanwen | 《答谢中书书》《记承天寺夜游》 | 答谢中书书等 | wenyan | 8 | 3 | w-gujin | 50、58
- w-p-mengzi | 《孟子》三章：富贵不能淫；生于忧患，死于安乐；得道多助，失道寡助 | 孟子三章 | wenyan | 8 | 3 | w-jushi1 | 43（后两则）

## N 组 文言篇目（二）→ data/wenyan-pian-b.js
- w-p-taohua | 《桃花源记》 | 桃花源记 | wenyan | 8 | 3 | w-fanyi | 49
- w-p-xiaoshi | 《小石潭记》 | 小石潭记 | wenyan | 8 | 3 | w-fanyi | 54
- w-p-zhuangzi | 《北冥有鱼》《虽有嘉肴》 | 北冥有鱼等 | wenyan | 8 | 2 | w-fanyi | 44、45
- w-p-mashuo | 《马说》 | 马说 | wenyan | 8 | 3 | w-fanyi | 52
- w-p-yueyang | 《岳阳楼记》 | 岳阳楼记 | wenyan | 9 | 3 | w-p-xiaoshi | 55
- w-p-zuiweng | 《醉翁亭记》 | 醉翁亭记 | wenyan | 9 | 3 | w-p-xiaoshi | 56

## O 组 文言篇目（三）→ data/wenyan-pian-c.js
- w-p-huxin | 《湖心亭看雪》 | 湖心亭看雪 | wenyan | 9 | 3 | w-fanyi | 60
- w-p-caogui | 《曹刿论战》 | 曹刿论战 | wenyan | 9 | 3 | w-jushi2 | 42
- w-p-zouji | 《邹忌讽齐王纳谏》 | 邹忌讽齐王纳谏 | wenyan | 9 | 3 | w-jushi2 | 47
- w-p-chushi | 《出师表》 | 出师表 | wenyan | 9 | 3 | w-fanyi | 48
- w-p-yuwo | 《鱼我所欲也》 | 鱼我所欲也 | wenyan | 9 | 3 | w-p-mengzi | 43（第一则）
- w-p-songma | 《送东阳马生序》（节选） | 送东阳马生序 | wenyan | 9 | 3 | w-fanyi | 59

合计：本阶段新增 G 10 + H 13 + I 6 + J 5 + K 5 + L 5 + M 6 + N 6 + O 6 = 62 个点；加上已有 4 个，古诗文共 66 个点。
