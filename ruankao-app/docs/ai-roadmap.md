# AI 时代学习路线（App 第 6 个菜单「AI 路线」）

## 给谁、学成什么样
- 读者：有软件开发经验、正在备考系统架构设计师的在职成人，手机上学，电脑上动手。
- 目标：半年左右，从“会用 AI 写代码”走到“能设计、上线、治理一个大模型应用”，并能用架构师的语言（质量属性、取舍、风险）讲清楚。
- 节奏：每周约 5 小时，8 个阶段约 28 周（2026-11-06 加了「Python 编程」阶段，见 python-track.md；App 内置离线 Python 运行器 Brython，可以在手机上做代码练习）。与备考并行：考前两个月以备考为主，路线可以暂停。
- 思路：**基础不丢 → 先把 AI 当工具用好 → 懂原理 → 会做应用 → 能上线 → 架构师视角**。每阶段有一个实战项目，后面的项目在前面的基础上加功能，最后一个项目直接用软考的方法写架构说明。

## 阶段与学习节点（id 前缀 `ai-`）

| 阶段 | 周数 | 节点 id | 标题 | 要点 |
|---|---|---|---|---|
| ai0 认知 | 1 | ai-why | AI 时代程序员要学什么 | AI 改变了什么（写代码变便宜，判断、设计、验证更值钱）；T 型能力；哪些基础更重要了；人在回路中 |
| py Python 编程 | 4 | py-* | 12 个节点 | 见 python-track.md |
| ai1 基础工具 | 3 | ai-python | Python 与工程化基础 | 虚拟环境与依赖、类型提示、常用库（json、requests/httpx、pathlib）、异步基础、写测试（pytest） |
| | | ai-git | Git 与命令行 | 常用命令、分支与合并、提交粒度、PR 与代码审查；Shell 基础、环境变量 |
| | | ai-http | HTTP、JSON 与 API 调用 | 请求响应、状态码、鉴权（API Key、Bearer）、限流与重试（指数退避）、流式响应（SSE）、密钥不进代码 |
| ai2 AI 辅助编程 | 2 | ai-copilot | AI 编程助手怎么工作 | 补全型 / 对话型 / 智能体型（能读文件、跑命令）；上下文从哪来；能力边界 |
| | | ai-workflow | 与 AI 协作的开发流程 | 先说清需求和约束 → 让它先出计划 → 小步实现 → 跑测试 → 自己审查；写好项目说明文件；何时自己写 |
| | | ai-review | 验证 AI 产出与风险 | 幻觉（编造 API / 参数）、安全漏洞、过时写法、许可证、敏感数据外泄；审查清单；测试兜底 |
| ai3 机器学习与大模型原理 | 5 | ai-ml | 机器学习基本概念 | 监督 / 无监督 / 强化学习；训练 / 验证 / 测试集；特征与标签；过拟合与欠拟合、正则化；典型算法一句话 |
| | | ai-metrics | 模型评估指标 | 混淆矩阵、准确率、精确率、召回率、F1、ROC/AUC；回归的 MAE、MSE；类别不平衡时看什么（含计算题） |
| | | ai-nn | 神经网络与训练 | 神经元、激活函数、损失函数、梯度下降、反向传播、学习率、batch / epoch；GPU 为什么重要 |
| | | ai-transformer | Transformer 与注意力 | token 与分词、词向量（embedding）、自注意力直觉、多头、位置信息、只有解码器的大模型如何逐词生成 |
| | | ai-llm | 大模型是怎么来的 | 预训练、指令微调、基于人类反馈 / 偏好的对齐；上下文窗口；采样（温度）；幻觉从何而来；规模与能力 |
| ai4 大模型应用开发 | 6 | ai-api | 调用大模型 API | 消息结构（system / user / assistant）、参数（温度、最大输出）、token 与计费、流式输出、多轮对话的上下文管理、错误与重试 |
| | | ai-prompt | 提示工程 | 清楚具体的指令、给背景和目的、示例（few-shot）、让模型先分析再回答、用标签分隔材料、指定输出格式、迭代改提示 |
| | | ai-tools | 工具调用与结构化输出 | 工具调用的完整往返流程、用 JSON Schema 描述工具、校验模型输出、失败重试；结构化抽取 |
| | | ai-rag | 检索增强生成 RAG | 为什么需要 RAG；切分、向量化、向量库、检索（向量 + 关键词混合）、重排、拼提示、给出处；常见失败原因 |
| | | ai-agent | 智能体 Agent | 工作流与智能体的区别；“思考 → 调工具 → 看结果”的循环；规划、记忆、多智能体；什么时候不该用 Agent；人工确认 |
| | | ai-mcp | MCP 与工具生态 | MCP 解决什么问题；客户端与服务器；工具、资源、提示三类能力；本地与远程服务器；安全注意 |
| | | ai-multimodal | 多模态与语音 | 图像理解、文档 / 表格识别、语音识别与合成；多模态应用的典型流程 |
| ai5 AI 工程化 | 4 | ai-eval | 评测 | 为什么“看几个例子”不够；评测集怎么建；规则判分、模型判分（LLM-as-judge）、人工抽检；回归评测；线上指标 |
| | | ai-ops | 上线与运维（LLMOps） | 延迟与成本优化（缓存、小模型路由、精简上下文、批处理）、可观测（日志、链路追踪、token 统计）、限流降级与备用模型、提示和模型的版本管理 |
| | | ai-security | AI 应用安全 | 提示注入（直接、间接）、越权调用工具、敏感信息泄露、输出不可信（再加工前要校验）；最小权限、人工确认、输入输出过滤；OWASP LLM 应用十大风险 |
| | | ai-finetune | 微调与本地部署 | 先提示、再 RAG、最后微调的选择顺序；LoRA 等参数高效微调；量化；开源模型本地推理；数据准备 |
| ai6 架构师视角 | 3 | ai-arch | 大模型应用参考架构 | 接入层、编排层、检索 / 知识层、模型层（网关、多模型路由）、评测与观测、数据与安全；和传统分层 / 微服务的关系 |
| | | ai-quality | AI 系统的质量属性与取舍 | 非确定性、延迟、成本、准确性、可用性（降级、备用模型）、可解释性；用质量属性场景描述 AI 需求；常见权衡点 |
| | | ai-governance | 治理与合规 | 数据与隐私（个人信息保护法等）、生成式 AI 服务的管理要求（只写确定、通识的要点）、内容标识、模型与数据的使用许可；企业内部 AI 使用规范 |

## 实战项目（我写在 ai-config.js 里）
1. ai1/ai2 后：用 AI 助手完成一个命令行小工具（带测试、Git 提交）
2. ai3 后：用 scikit-learn 做一个文本分类，报告各项指标
3. ai4 前半：做一个“软考笔记问答助手”（RAG，带出处）
4. ai4 后半：给问答助手加工具调用，做成会查资料、会出题的小 Agent（写操作要人工确认）
5. ai5/ai6：给项目加评测集、成本与延迟统计、提示注入防护，并按软考方法写一页架构说明（4+1 视图 + 质量属性场景 + 风险点）

## 资源链接白名单（节点里的 `links` 只能用这些；国外站点注明“国外站点”）
- Python 官方教程（中文）：https://docs.python.org/zh-cn/3/tutorial/
- Pro Git（中文）：https://git-scm.com/book/zh/v2
- 动手学深度学习（中文）：https://zh.d2l.ai/
- scikit-learn 文档：https://scikit-learn.org/stable/
- PyTorch 教程：https://pytorch.org/tutorials/
- Hugging Face 课程（国外站点）：https://huggingface.co/learn
- Model Context Protocol 文档（国外站点）：https://modelcontextprotocol.io/
- Anthropic Claude 文档（国外站点）：https://docs.anthropic.com/
- OpenAI 平台文档（国外站点）：https://platform.openai.com/docs
- Google 机器学习速成课程（国外站点）：https://developers.google.com/machine-learning/crash-course
- OWASP LLM 应用十大风险（国外站点）：https://owasp.org/www-project-top-10-for-large-language-model-applications/
- 3Blue1Brown 神经网络系列（国外站点）：https://www.3blue1brown.com/topics/neural-networks
