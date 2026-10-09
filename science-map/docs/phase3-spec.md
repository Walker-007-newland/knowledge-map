# 第三阶段：物理剩余部分 + 化学主体（新版人教版）

规范：docs/AUTHORING.md（字段、题型、样式）+ docs/coverage-brief.md（题量：讲解里每个要点至少 1 道例题、2 道测试，易错/高频点 3 道，不设上限）。
质量参照已审核的 physics/p2-*.js、chemistry/samples.js。化学单元目录与新版实验调整见 docs/chem-new-edition.md（已由用户对照课本核实）。

**禁止**：题干出现“上题/上一题/前一题”（测试每次随机抽约 10 题，题与题之间不能有依赖；需要共用材料就用 passages）；解析写选项字母；“以上都对”类选项。

## 物理（31 个新知识点）

每组：数据 physics/p3-N.js，演示 js/sims-p3-N.js（演示函数名前缀 `p3_N_`）。module：声 sound，光/透镜 light，电学 elec，电与磁 mag，信息与能源 energy。

| 组 | id | 名称 | term | module | prereqs |
|---|---|---|---|---|---|
| 1 | p-sound-production | 声音的产生与传播（振动、介质、声速、回声） | 8a | sound | — |
| 1 | p-sound-character | 声音的特性（音调与频率、响度与振幅、音色；超声次声） | 8a | sound | p-sound-production |
| 1 | p-sound-use | 声的利用与噪声的控制 | 8a | sound | p-sound-character |
| 1 | p-em-wave | 电磁波与信息的传递 | 9 | energy | — |
| 1 | p-energy-sources | 能源与可持续发展（能源分类、核能、太阳能、能量转移转化的方向性） | 9 | energy | p-energy-conservation |
| 2 | p-light-propagation | 光的直线传播（光源、光速、影子、小孔成像、日月食） | 8a | light | — |
| 2 | p-reflection | 光的反射（反射定律、光路可逆、镜面反射与漫反射、作图） | 8a | light | p-light-propagation |
| 2 | p-refraction | 光的折射（规律、现象、作图、池底变浅） | 8a | light | p-reflection |
| 2 | p-dispersion | 光的色散（三原色、物体的颜色、红外线紫外线） | 8a | light | p-refraction |
| 3 | p-lens | 透镜（凸透镜/凹透镜、焦点焦距、三条特殊光线作图） | 8a | light | p-refraction |
| 3 | p-convex-imaging | 凸透镜成像的规律（探究实验、成像表、动态变化） | 8a | light | p-lens |
| 3 | p-lens-apps | 生活中的透镜（照相机、投影仪、放大镜、显微镜望远镜） | 8a | light | p-convex-imaging |
| 3 | p-eye | 眼睛和眼镜（近视远视成因与矫正） | 8a | light | p-convex-imaging |
| 4 | p-charge | 两种电荷（摩擦起电、相互作用、验电器、导体绝缘体） | 9 | elec | — |
| 4 | p-circuit | 电路的组成与串联、并联（电路图、实物连接、开关作用、短路） | 9 | elec | p-charge |
| 4 | p-current | 电流与电流表（使用读数、串并联电路电流规律） | 9 | elec | p-circuit |
| 5 | p-voltage | 电压与电压表（使用读数、串并联电路电压规律） | 9 | elec | p-current |
| 5 | p-resistance | 电阻（影响因素探究、半导体超导） | 9 | elec | p-voltage |
| 5 | p-rheostat | 滑动变阻器（原理、接法“一上一下”、作用） | 9 | elec | p-resistance |
| 5 | p-circuit-fault | 电路故障分析（断路短路、借电表判断） | 9 | elec | p-voltage |
| 6 | p-measure-resistance | 电阻的测量（伏安法、灯丝电阻、特殊方法测电阻） | 9 | elec | p-ohm |
| 6 | p-dynamic-circuit | 动态电路分析（滑片移动、开关通断、敏感电阻） | 9 | elec | p-ohm, p-rheostat |
| 6 | p-electric-energy | 电能 电功（电能表、W=UIt） | 9 | elec | p-ohm |
| 7 | p-measure-power | 测量小灯泡的电功率 | 9 | elec | p-power, p-measure-resistance |
| 7 | p-joule | 焦耳定律（探究、Q=I²Rt、电热利用与防止、多挡位电热器） | 9 | elec | p-power |
| 7 | p-household | 家庭电路与安全用电（组成、试电笔、三孔插座、电流过大原因、触电） | 9 | elec | p-joule |
| 8 | p-magnet | 磁现象与磁场（磁极、磁感线、地磁场） | 9 | mag | — |
| 8 | p-electromagnetism | 电生磁（奥斯特实验、通电螺线管、安培定则） | 9 | mag | p-magnet, p-current |
| 8 | p-electromagnet | 电磁铁与电磁继电器 | 9 | mag | p-electromagnetism |
| 8 | p-motor | 磁场对通电导线的作用 电动机 | 9 | mag | p-electromagnetism |
| 8 | p-induction | 电磁感应 发电机 | 9 | mag | p-motor |

已有节点之后会补前置：p-plane-mirror←p-reflection，p-ohm←p-rheostat，p-power←p-electric-energy（由协调者改，写手不要动已有文件）。

## 化学（32 个新知识点）

每组：数据 chemistry/c3-N.js，演示 js/sims-c3-N.js（前缀 `c3_N_`）。`chapter` 写单元名；第一～七单元 term 9a，第八～十一单元 9b。

| 组 | id | 名称 | module | prereqs |
|---|---|---|---|---|
| 1 | c-change-property | 物质的变化和性质（物理变化化学变化、性质与用途） | basic | — |
| 1 | c-lab-basics | 化学实验基本操作（常用仪器、药品取用、加热、洗涤、陶土网） | basic | — |
| 1 | c-inquiry | 化学实验与科学探究（蜡烛燃烧、人体吸入呼出气体） | basic | c-lab-basics |
| 1 | c-air | 空气（成分、测定空气中氧气含量、纯净物混合物、空气保护） | air | c-change-property |
| 1 | c-oxygen | 氧气的性质（与木炭、硫、铁丝等反应、化合反应、氧化反应） | air | c-air |
| 2 | c-molecule-atom | 分子和原子（微观解释、化学变化的实质） | struct | c-change-property |
| 2 | c-atom-structure | 原子结构（构成、核外电子排布、离子、相对原子质量） | struct | c-molecule-atom |
| 2 | c-element | 元素（元素符号、元素周期表单元格信息） | struct | c-atom-structure |
| 2 | c-water-resource | 水资源及其利用（净水方法、过滤、硬水软水、爱护水资源） | water | c-molecule-atom |
| 2 | c-water-composition | 水的组成（电解水、氢气、单质化合物氧化物） | water | c-element |
| 3 | c-equation | 化学方程式（意义、书写、配平） | eq | c-mass-conservation |
| 3 | c-equation-calc | 根据化学方程式的计算 | eq | c-equation |
| 3 | c-carbon-element | 碳单质的多样性（金刚石石墨 C₆₀、碳的化学性质） | carbon | c-element |
| 4 | c-co2-co | 碳的氧化物（CO₂ 与 CO 的性质用途、温室效应） | carbon | c-carbon-element, c-equation |
| 4 | c-co2-prep | 二氧化碳的实验室制取（药品、装置、检验验满） | carbon | c-co2-co, c-oxygen-prep |
| 4 | c-combustion | 燃料的燃烧（燃烧条件、灭火原理、易燃易爆安全） | carbon | c-oxygen |
| 4 | c-fuels | 化石能源的合理利用（煤石油天然气、新能源、环境） | carbon | c-combustion |
| 5 | c-metal-material | 金属材料（物理性质、合金） | metal | — （9b） |
| 5 | c-metal-chem | 金属的化学性质（与氧气、酸、盐溶液反应，置换反应） | metal | c-metal-material, c-equation |
| 5 | c-activity-series | 金属活动性顺序（判断、实验设计、滤液滤渣） | metal | c-metal-chem |
| 5 | c-iron-smelting | 金属资源的利用和保护（炼铁、含杂质计算、锈蚀与防护） | metal | c-activity-series, c-co2-co, c-equation-calc |
| 6 | c-solution | 溶液及其应用（溶液特征、溶解吸放热、乳化） | water | — （9b） |
| 6 | c-solubility | 溶解度（饱和不饱和、溶解度曲线、结晶） | water | c-solution |
| 6 | c-mass-fraction | 溶质的质量分数（计算、稀释、配制溶液及误差） | water | c-solubility, c-equation-calc |
| 6 | c-crude-salt | 粗盐中难溶性杂质的去除（溶解过滤蒸发、产率误差） | water | c-solubility |
| 7 | c-acids | 常见的酸（盐酸硫酸、酸的化学性质） | acid | c-activity-series |
| 7 | c-bases | 常见的碱（NaOH、Ca(OH)₂、碱的化学性质、变质） | acid | c-acids |
| 7 | c-salts | 常见的盐（NaCl、Na₂CO₃、NaHCO₃、CaCO₃，碳酸根检验） | acid | c-neutralization |
| 8 | c-double-decomp | 复分解反应（条件、离子共存、物质鉴别除杂） | acid | c-salts |
| 8 | c-fertilizer | 化肥（种类、铵态氮肥检验、合理施用） | acid | c-double-decomp |
| 8 | c-health | 化学与人体健康（营养素、化学元素与健康） | life | c-element （9b） |
| 8 | c-sustainable | 化学与可持续发展（材料、环境保护、绿色化学） | life | c-fuels, c-metal-material |

已有节点之后会补前置：c-oxygen-prep←c-oxygen, c-lab-basics；c-formula-valence←c-element；c-neutralization←c-bases（由协调者改）。

## 共同要求

- `chapter`：物理写新版章名（如 '第二章 声现象'、'第十五章 电流和电路'——九年级新版章节可能调整，拿不准用 WebSearch 查证）；化学写单元名（见 chem-new-edition.md）。
- 每点：tip、learn 3–5 节、例题/测试按 coverage-brief 覆盖每个要点、practice（作图/实验/简答，有就写）。
- 每组至少 1–2 个互动演示，挑最有帮助的（如凸透镜成像、反射折射光路、串并联电流、滑动变阻器、电磁感应、溶解度曲线、金属活动性、电解水）。
- 画图辅助函数写在本组数据文件自己的 IIFE 里，或从本组 sims 文件导出 `SIMS._p3_N` 复用（sims 文件先加载）。不要改 js/figs.js、js/app.js、css、html、其他组和已有文件，不要运行 bump.py。
- 前置指向其他组还没写完的 id 时，自检报“前置不存在”可以忽略。
