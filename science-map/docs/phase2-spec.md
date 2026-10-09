# 第二阶段：物理力学 + 热学（35 个新知识点）

教材：**新版人教版**。已有样板：p-speed、p-plane-mirror、p-density、p-buoyancy、p-ohm、p-power（不要重写，可以作为前置引用）。
规范见 docs/AUTHORING.md，质量标准参照已有样板（physics/samples-a.js、physics/samples-b.js）。

每组一个数据文件 + 一个演示文件（已在 physics.html 里登记好）：

| 组 | 数据文件 | 演示文件 |
|---|---|---|
| 1 测量与运动、质量 | physics/p2-1.js | js/sims-p2-1.js |
| 2 物态变化 | physics/p2-2.js | js/sims-p2-2.js |
| 3 力与运动 | physics/p2-3.js | js/sims-p2-3.js |
| 4 压强与浮力 | physics/p2-4.js | js/sims-p2-4.js |
| 5 功和机械 | physics/p2-5.js | js/sims-p2-5.js |
| 6 内能与热机 | physics/p2-6.js | js/sims-p2-6.js |

## 知识点清单（id、名称、term、module、前置）

### 组 1（8a）
| id | 名称 | module | prereqs |
|---|---|---|---|
| p-length-time | 长度和时间的测量（刻度尺读数估读、误差与错误） | motion | — |
| p-motion-reference | 运动的描述（机械运动、参照物、相对静止） | motion | — |
| p-avg-speed-measure | 测量平均速度（斜面小车实验） | motion | p-speed |
| p-mass | 质量与天平的使用 | matter | — |
| p-density-apps | 密度与社会生活（温度对密度的影响、鉴别物质、空心问题、混合密度） | matter | p-density |

### 组 2（8a，module heat）
| id | 名称 | prereqs |
|---|---|---|
| p-temperature | 温度与温度计（摄氏温度、使用读数、体温计） | — |
| p-melting | 熔化和凝固（晶体与非晶体、熔点、图像） | p-temperature |
| p-vaporization | 汽化和液化（蒸发、沸腾、沸点、液化方法、白气） | p-temperature |
| p-sublimation | 升华和凝华 | p-melting, p-vaporization |
| p-phase-apps | 物态变化综合（判断物态变化与吸放热、生活现象、水循环） | p-melting, p-vaporization, p-sublimation |

### 组 3（8b，module force）
| id | 名称 | prereqs |
|---|---|---|
| p-force | 力（概念、作用效果、三要素、力的示意图、相互作用） | — |
| p-elastic | 弹力与弹簧测力计 | p-force |
| p-gravity | 重力（G=mg、方向、重心） | p-force |
| p-newton1 | 牛顿第一定律与惯性 | p-force |
| p-balance | 二力平衡（条件、与相互作用力区别、平衡状态求力） | p-newton1, p-gravity |
| p-friction | 摩擦力（影响因素实验、增大减小、静摩擦方向） | p-balance |
| p-force-motion | 力与运动综合（受力分析、运动和力的关系） | p-balance, p-friction, p-elastic |

### 组 4（8b，module press）
| id | 名称 | prereqs |
|---|---|---|
| p-pressure | 压强（p=F/S、增大减小压强、固体压强计算） | p-force, p-gravity |
| p-liquid-pressure | 液体的压强（特点、p=ρgh、连通器） | p-pressure, p-density |
| p-atm | 大气压强（托里拆利实验、应用、与高度沸点的关系） | p-liquid-pressure |
| p-fluid-pressure | 流体压强与流速的关系 | p-atm |
| p-float-sink | 物体的浮沉条件及应用（轮船、潜水艇、密度计、气球） | p-buoyancy, p-balance |
| p-buoyancy-calc | 压强与浮力综合计算（液面变化、容器底压强、漂浮问题） | p-float-sink, p-liquid-pressure |

### 组 5（8b，module work）
| id | 名称 | prereqs |
|---|---|---|
| p-work | 功（做功的两个因素、W=Fs） | p-force |
| p-power-mech | 功率（P=W/t=Fv） | p-work, p-speed |
| p-kinetic-potential | 动能和势能（影响因素、探究实验） | p-work |
| p-mech-energy-conv | 机械能及其转化（守恒条件、卫星、滚摆） | p-kinetic-potential |
| p-lever | 杠杆（五要素、力臂作图、平衡条件实验、分类） | p-force, p-gravity |
| p-pulley | 滑轮与滑轮组（定/动滑轮、绕线、F=(G+G动)/n、s=nh） | p-lever |
| p-efficiency | 机械效率（有用功额外功、滑轮组/斜面效率、测量实验） | p-pulley, p-work |

### 组 6（9，module heat）
| id | 名称 | prereqs |
|---|---|---|
| p-molecular | 分子热运动（扩散、分子间作用力） | — |
| p-internal-energy | 内能（与温度关系、做功和热传递改变内能、热量） | p-molecular, p-temperature |
| p-specific-heat | 比热容（探究实验、Q=cmΔt、水的比热容大的应用） | p-internal-energy |
| p-heat-engine | 热机（四冲程汽油机、能量转化、冲程判断） | p-internal-energy, p-mech-energy-conv |
| p-heat-value | 热值与热机效率（Q=mq、Q=Vq、效率计算） | p-heat-engine, p-specific-heat |
| p-energy-conservation | 能量的转化和守恒 | p-heat-value |

## 共同要求

- `chapter` 写新版人教版章名（如 '第三章 物态变化'）。拿不准新版章名或内容（新版有没有删改某个实验/概念）时，用 WebSearch 查证；查不到就按通行内容写，并在汇报里说明。
- 每点：tip、learn 3–5 节、examples 2–3、tests 8–10（至少 2 道 num，除非该点确实没有计算，如参照物、升华——则用图像/情境选择题代替）、practice 0–2（有作图或实验探究的点必须有）。
- 每组至少 2 个互动演示，挑最能帮助理解的点（例如：晶体熔化曲线、液体压强随深度、杠杆平衡、滑轮组、比热容加热对比、汽油机四冲程）。演示代码只写在本组的 sims 文件里，函数名加本组前缀避免冲突（如 SIMS.p2_5_lever）。
- 画图辅助函数写在本组数据文件自己的 IIFE 里（参考 samples-a.js / samples-b.js 的做法）；不要改 js/figs.js、js/app.js、css 及其他组的文件。
- 组内知识点之间、对已有样板的前置可以直接引用；对其他组的 id 按上表写，自检时报“前置不存在”属于其他组还没写完，可以忽略。
