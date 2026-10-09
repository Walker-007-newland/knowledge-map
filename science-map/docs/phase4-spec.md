# 第四阶段：题型技能与综合专题（两科，19 个知识点）

规范同前：docs/AUTHORING.md、docs/coverage-brief.md。全部放在新学期列 `term: 'review'`（“中考复习”），`module: 'skill'`，`chapter: '中考复习'`。

## 这类知识点怎么写

- **learn**：讲“方法/模板/步骤”，每种方法配一道完整示范（审题→思路→规范作答），并列出常见失分点。可用 `.steps`、`.key`、`.warn`、`.tbl`。
- **examples / tests**：**跨章节综合题**，仿福建中考题型和难度（选择、num、fill、passages 成套实验题）。按 coverage-brief：讲解里每种方法/题型至少 1 道例题、2 道测试题。
- **practice**：综合大题的规范书写（简答、作图、计算书写），给评分要点。
- 可以复用各科已有文件里通过 `SIMS._xxx` 导出的画图函数（如 `SIMS._p3_4` 电路、`SIMS._p3_3` 光学、`SIMS._c3_6` 溶解度曲线、`SIMS._c3_5` 金属图像），用前确认存在；也可以在本文件自己的 IIFE 里写。
- 演示可选（有真正帮助才做）。
- **禁止**：“上题/上一题”；解析写选项字母；“以上都对”类选项；让学生输入完整化学方程式。

## 物理（10 点）

| 组 | id | 名称 | prereqs |
|---|---|---|---|
| 1 | p-skill-experiment | 实验探究通法（控制变量法、转换法、等效替代、理想实验推理、多次测量的目的、数据处理与误差分析、实验评估） | p-friction, p-liquid-pressure, p-joule, p-convex-imaging |
| 1 | p-skill-graph | 图像题分析（读坐标含义、斜率与面积意义、交点拐点；s-t、v-t、m-V、熔化沸腾、F-h、I-U 等） | p-speed, p-density, p-melting, p-ohm |
| 1 | p-skill-estimate | 估测题（长度、质量、时间、速度、温度、电流电功率、压强等常见值） | p-length-time, p-mass, p-pressure, p-power |
| 1 | p-skill-short-answer | 简答题答题模板（现象→原理/规律→结论，物态变化、惯性、压强、流体、电热等） | p-newton1, p-vaporization, p-fluid-pressure |
| 2 | p-skill-calc | 计算题规范（已知/求/解/答、单位统一与换算、公式选择、多过程分步） | p-speed, p-pressure, p-ohm |
| 2 | p-skill-ratio | 比例与比值计算（串并联比例、压强浮力比例、热学比例） | p-ohm, p-power, p-pressure |
| 2 | p-skill-mech-combo | 力学综合计算（压强+浮力、简单机械+功率+效率、交通工具情境） | p-buoyancy-calc, p-efficiency, p-power-mech |
| 3 | p-skill-elec-combo | 电学综合计算（动态范围与极值、多挡位电热器、图像信息、电热综合） | p-dynamic-circuit, p-joule, p-measure-power |
| 3 | p-skill-drawing | 作图题规范（力的示意图与力臂、光路、电路连接、磁感线与螺线管、家庭电路——通则与扣分点） | p-reflection, p-lens, p-lever, p-electromagnetism, p-household |
| 3 | p-skill-context | 情境与跨学科题（福建科技/传统文化情境：福建舰、土楼、茶、高铁、新能源；信息提取与建模） | p-energy-sources, p-em-wave, p-heat-value |

## 化学（9 点）

| 组 | id | 名称 | prereqs |
|---|---|---|---|
| 4 | c-skill-inquiry | 实验探究题通法（提出猜想、设计方案、现象与结论对应、对照实验、反思评价；变质、反应后成分、燃烧条件等经典模型） | c-bases, c-combustion, c-iron-smelting |
| 4 | c-skill-gas | 常见气体的制取、净化、干燥与检验综合（装置选择与连接顺序、多功能瓶、尾气处理） | c-oxygen-prep, c-co2-prep, c-water-composition |
| 4 | c-skill-identification | 物质的检验、鉴别与除杂综合（离子检验方法表、一次鉴别、除杂试剂与顺序） | c-double-decomp, c-salts |
| 5 | c-skill-inference | 物质推断题（突破口：颜色、特征反应、组成元素、用途；框图推断步骤） | c-double-decomp, c-co2-co, c-metal-chem |
| 5 | c-skill-process | 工艺流程题（原料预处理、核心反应、分离操作、循环利用、产品获得） | c-double-decomp, c-crude-salt, c-activity-series |
| 5 | c-skill-micro | 微观示意图与化学用语综合（读图写化学式、判断反应类型、分子个数比、质量比） | c-molecule-atom, c-equation |
| 6 | c-skill-calc | 综合计算题规范（方程式+溶质质量分数、表格数据、图像拐点、样品纯度） | c-equation-calc, c-mass-fraction |
| 6 | c-skill-graph | 坐标图像题（pH 变化、反应物生成物质量-时间、溶解度、金属与酸、气体体积） | c-solubility, c-neutralization, c-activity-series |
| 6 | c-skill-context | 化学情境与跨学科题（福建情境：茶、海洋资源、德化瓷、宁德新能源；传统文化与化学史；新科技材料） | c-sustainable, c-health |

## 文件

物理组 1–3：physics/p4-1.js ~ p4-3.js，演示 js/sims-p4-1.js ~ p4-3.js（前缀 `p4_N_`）。
化学组 4–6：chemistry/c4-1.js ~ c4-3.js（组 4→c4-1，5→c4-2，6→c4-3），演示 js/sims-c4-1.js ~ c4-3.js（前缀 `c4_N_`）。
写手只改自己的两个文件；辅助脚本放 scratchpad 下自己的子目录。
