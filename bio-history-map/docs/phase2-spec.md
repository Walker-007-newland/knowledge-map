# 第二阶段：生物全册（58 个新知识点）

教材：**新版人教版生物学**，目录见 `docs/bio-new-edition.md`。规范见 `docs/AUTHORING.md`，质量标准参照已审核的样板 `biology/samples.js`。
已有样板（不要重写，可以作为前置引用）：b-cell-structure、b-photosynthesis、b-blood-circulation、b-gene-inheritance、b-food-chain。

做完后全图生物共 63 个知识点，覆盖七上到八下全部章节。

## 分组与文件

每组一个数据文件（写之前在 `biology.html` 里 `samples.js` 之后、`app.js` 之前登记）：

| 组 | 范围 | 学期 | 数据文件 | 新点数 |
|---|---|---|---|---|
| 1 | 第一单元 生物和细胞 | 7a | biology/b2-1.js | 8 |
| 2 | 第二单元 多种多样的生物 | 7a | biology/b2-2.js | 10 |
| 3 | 第三单元 植物的生活 | 7b | biology/b2-3.js | 7 |
| 4 | 第四单元 人体生理与健康（一） | 7b | biology/b2-4.js | 10 |
| 5 | 第四单元（二）+ 第五单元 生物与环境 | 8a | biology/b2-5.js | 12 |
| 6 | 第六单元 生命的延续和发展 | 8b | biology/b2-6.js | 11 |

## 知识点清单（id、名称、module、前置）

chapter 按目录写到“节”，如 `'第一单元 第二章 第一节 学习使用显微镜'`；一个点跨两节时用顿号连写。

### 组 1（7a）第一单元 生物和细胞
| id | 名称 | module | prereqs |
|---|---|---|---|
| b-living-features | 生物的特征（观察与调查方法、生物的基本特征、判断是不是生物） | cell | — |
| b-microscope | 学习使用显微镜（结构、取镜到收镜、放大倍数、倒像与移动装片、视野明暗、污点判断） | skill | — |
| b-slide-making | 制作临时装片（洋葱表皮/口腔上皮步骤、清水与生理盐水、染色、避免气泡） | skill | b-microscope, b-cell-structure |
| b-cell-life | 细胞的生活（细胞膜控制物质进出、能量转换器、细胞核是控制中心、DNA—染色体—基因初步） | cell | b-cell-structure |
| b-cell-division | 细胞分裂与分化（分裂过程、染色体复制与均分、分化形成组织） | cell | b-cell-life |
| b-animal-levels | 动物体的结构层次（四种基本组织、器官、系统；细胞→组织→器官→系统→个体） | cell | b-cell-division |
| b-plant-levels | 植物体的结构层次（主要组织、六大器官；没有系统） | cell | b-cell-division |
| b-unicellular | 单细胞生物（草履虫结构与生活、与人类的关系） | cell | b-cell-structure |

### 组 2（7a）第二单元 多种多样的生物
| id | 名称 | module | prereqs |
|---|---|---|---|
| b-algae-moss-fern | 藻类、苔藓植物和蕨类植物（结构特点、孢子生殖、监测空气污染、与人类关系） | diverse | b-plant-levels |
| b-seed-plants | 种子植物（菜豆/玉米种子结构、裸子植物与被子植物区别） | diverse | b-algae-moss-fern |
| b-invertebrates | 无脊椎动物（刺胞、扁形、线虫、环节、软体、节肢动物主要特征与代表） | diverse | b-animal-levels |
| b-fish | 脊椎动物：鱼（适应水中生活的特征、鳃呼吸、鳍） | diverse | b-invertebrates |
| b-amphibian-reptile | 两栖动物和爬行动物（特征区别、真正陆生的原因） | diverse | b-fish |
| b-bird-mammal | 鸟和哺乳动物（飞行适应、双重呼吸、恒温；胎生哺乳、牙齿分化） | diverse | b-amphibian-reptile |
| b-bacteria | 细菌（微生物分布与菌落、细菌结构、分裂生殖、芽孢、培养实验步骤） | diverse | b-cell-structure |
| b-fungi | 真菌（酵母菌与霉菌、蘑菇、孢子生殖；发酵食品制作） | diverse | b-bacteria |
| b-virus | 病毒（结构、寄生、分类、与人类关系） | diverse | b-bacteria |
| b-classification | 生物分类（分类依据、界门纲目科属种、单位越小共同特征越多、双名法、检索表） | diverse | b-seed-plants, b-bird-mammal |

### 组 3（7b）第三单元 植物的生活
| id | 名称 | module | prereqs |
|---|---|---|---|
| b-seed-germination | 种子的萌发（环境条件与自身条件、萌发过程、探究实验、发芽率） | plant | b-seed-plants |
| b-plant-growth | 植株的生长（根尖结构与根的生长、芽发育成枝条、氮磷钾无机盐） | plant | b-seed-germination |
| b-flower-fruit | 开花和结果（花的结构、传粉与受精、子房发育成果实、人工辅助授粉） | plant | b-seed-plants |
| b-transpiration | 水的利用与散失（根吸水、导管运输、叶片结构与气孔、蒸腾作用及意义） | plant | b-plant-levels |
| b-respiration | 呼吸作用（概念与实质、实验现象、在生产生活中的应用） | plant | b-photosynthesis |
| b-photo-resp | 光合作用与呼吸作用综合（比较、大棚增产措施、一昼夜曲线） | plant | b-respiration |
| b-plant-role | 植物在自然界中的作用（碳—氧平衡、参与水循环、提供食物与栖息地、绿化） | plant | b-photo-resp, b-transpiration |

### 组 4（7b）第四单元 人体生理与健康（一）
| id | 名称 | module | prereqs |
|---|---|---|---|
| b-reproduction | 人的生殖（生殖系统、受精部位、胚胎发育与胎盘） | human | b-cell-division |
| b-puberty | 青春期（身体与心理变化、卫生） | human | b-reproduction |
| b-nutrients | 食物中的营养物质（六大类及作用、维生素与无机盐缺乏症、测定食物中的能量） | human | — |
| b-digestion | 消化和吸收（消化系统、三大物质消化过程与产物、小肠的适应特点、唾液淀粉酶探究） | human | b-nutrients |
| b-diet-safety | 合理营养与食品安全（平衡膳食宝塔、食谱评价、食品安全） | human | b-digestion |
| b-respiratory-tract | 呼吸道对空气的处理（组成、清洁湿润温暖、会厌软骨） | human | — |
| b-lung-exchange | 肺内的气体交换（呼吸运动与膈肌、肺泡适应特点、气体交换原理） | human | b-respiratory-tract |
| b-blood | 流动的组织——血液（血浆与血细胞功能、血常规化验单、输血与血型） | human | b-cell-structure |
| b-vessels | 血流的管道——血管（动脉、静脉、毛细血管比较，观察小鱼尾鳍血液流动） | human | b-blood |
| b-excretion | 人体内废物的排出（排泄途径、泌尿系统、肾单位、尿液形成） | human | b-blood-circulation |

**同时把样板 b-blood-circulation 的 prereqs 改为 ['b-blood', 'b-vessels']**（由组 4 写手在全部完成后改，见下“注意”）。

### 组 5（8a）人体生理与健康（二）+ 生物与环境
| id | 名称 | module | prereqs |
|---|---|---|---|
| b-senses | 人体对外界环境的感知（眼球结构与视觉形成、近视；耳与听觉） | human | — |
| b-nervous | 神经调节（神经系统组成、神经元、反射弧、简单反射与复杂反射） | human | b-senses |
| b-movement | 神经系统支配下的运动（骨、关节、骨骼肌，屈肘伸肘） | human | b-nervous |
| b-hormones | 激素调节（主要内分泌腺与激素、分泌异常症） | human | b-nervous |
| b-infectious | 传染病及其预防（病原体、传染源/传播途径/易感人群、预防措施判断） | human | b-virus |
| b-immunity | 免疫与计划免疫（三道防线、非特异性与特异性免疫、抗原抗体、疫苗） | human | b-infectious |
| b-medicine-aid | 用药与急救（处方药与非处方药、急救电话、心肺复苏、止血判断动静脉出血） | human | b-vessels |
| b-healthy-life | 选择健康的生活方式（吸烟酗酒毒品危害、心血管健康、心理健康） | human | — |
| b-bio-env | 生物与环境的相互作用（非生物因素、生物间关系、适应与影响、探究光对鼠妇的影响） | eco | — |
| b-ecosystem | 生态系统的组成与自我调节（生物部分与非生物部分、生产者消费者分解者、自我调节能力有限） | eco | b-bio-env |
| b-biosphere | 生物圈（范围、生态系统类型及特点、生物圈是最大的生态系统） | eco | b-ecosystem |
| b-eco-security | 生态安全（人类活动对生态环境的影响、外来物种入侵、保护措施；福建红树林、木兰溪等情境） | eco | b-biosphere |

**同时把样板 b-food-chain 的 prereqs 加上 'b-ecosystem'**。

### 组 6（8b）第六单元 生命的延续和发展
| id | 名称 | module | prereqs |
|---|---|---|---|
| b-asexual | 无性生殖（概念、扦插、嫁接成活关键、组织培养；与有性生殖比较） | gene | b-flower-fruit |
| b-animal-development | 动物的有性生殖与发育（完全/不完全变态、青蛙变态发育、鸟卵结构与繁殖行为） | gene | b-bird-mammal |
| b-gene-trait | 基因与生物性状的关系（性状、相对性状、基因控制性状、转基因技术） | gene | b-cell-life |
| b-gene-transfer | 基因在亲子代间的传递（染色体、DNA、基因关系，生殖细胞染色体减半、成对与成单） | gene | b-gene-trait |
| b-sex-determination | 人的性别决定（性染色体、生男生女机会均等、X/Y 来源） | gene | b-gene-transfer |
| b-variation | 生物的变异（可遗传与不可遗传变异、育种应用） | gene | b-gene-inheritance |
| b-life-origin | 地球上生命的起源（原始大气、米勒实验、生命起源于原始海洋） | gene | — |
| b-evolution-history | 生物进化的历程（化石等证据、进化树、简单到复杂等趋势） | gene | b-life-origin, b-classification |
| b-natural-selection | 生物进化的原因（达尔文自然选择学说：过度繁殖、生存斗争、遗传变异、适者生存） | gene | b-evolution-history, b-variation |
| b-human-origin | 人类的起源（森林古猿、直立行走、人类发展） | gene | b-evolution-history |
| b-biodiversity | 生物多样性及其保护（三个层次、价值、保护措施：自然保护区、武夷山国家公园等） | eco | b-natural-selection |

**同时把样板 b-gene-inheritance 的 prereqs 加上 'b-gene-transfer'**。

## 写手规则（在 AUTHORING.md 基础上）

- 题量：每个要点至少 1 道例题、至少 2 道测试题，易错/高频点 3 道，不设上限，不凑数。每个点至少 1 道 open 题（简答或实验探究），每个点 1 个 practice（识图或简答，write:true）。
- 实验类知识点（显微镜、装片、种子萌发、唾液淀粉酶、鼠妇、细菌培养等）必须有 passages 实验材料题组，考变量、对照、步骤目的、结论。
- 结构类知识点（显微镜、花、根尖、心脏外的血管、肾单位、眼球、耳、关节、鸟卵等）讲解里画内联 SVG 示意图并配识图题；图里的编号与题干一致。
- 解析不能用“选 A/第几项/最后一项”指代选项；组合选项 fixed:true。
- 用新版人教版用语；新旧版表述不同或不确定的说法不出唯一答案题（如“自我调节/自动调节”，统一用新版说法；不确定就两种都接受或不考）。
- 不标某年真题；事实不确定不写。
- 不要修改 `biology/samples.js`（英语图谱会话可能正在给它补题）。样板 prereqs 的三处调整留到全部完成后由我统一改。

## 审核规则

每组写完派一个独立审核代理，直接改文件，逐题查：答案唯一、answer 下标、干扰项有没有也对的、科学事实与新版教材口径、遗传/概率验算、SVG 标注与题干一致、题量达标。最后列出改动清单和仍需对照课本确认的点。

## 完成后检查

1. `docs/check.html?s=biology` 显示检查通过（前置存在、学期不倒挂、answer 下标、passage 键）。
2. 浏览器里逐点打开、渲染讲解、交卷并完成一次主观题自评，确认不报错。

## 之后的阶段

- 第 3 阶段：历史 中国古代史 + 中国近代史（七上～八上）
- 第 4 阶段：历史 中国现代史 + 世界史（八下～九下；九下等新版出版后按新目录调整）
- 第 5 阶段：两科题型技能（生物实验探究/识图/资料分析；历史材料题/时间轴/评价题）
- 第 6 阶段：入门诊断与学习路线
