# AI 团队工作手册

产品：`teach/` 下的知识图谱网页和安卓平板 App（`knowledge-map-app/`）。用户是准备福建中考的学生（平板离线使用）。
团队四个角色 + 管理员（真人）。看板是私有仓库 **Walker-007-newland/knowledge-map-team** 的 Issue，一张 Issue = 一个需求单。
所有读写都用 `python team/gh.py`（见文件头的用法）。正文先写进临时 .md 文件再传路径，避免中文编码问题。

## 流程与状态

```
需求员 ──new──▶ 待评审 ──产品评审──▶ 待审批 ──管理员(App)──▶ 已批准 ──开发──▶ 开发中 ─▶ 待测试 ──测试──▶ 已上线(关闭)
                    │                  │  ▲                  │                          ▲          │
                    ▼                  │  └──── 需修改 ◀──────┤                          └── 返工 ◀─┘
                产品否决(关闭)          │                       ▼
                                       └───────────────▶  已驳回（产品下次运行时关闭）
任何一步卡住需要人工 ──▶ 阻塞（写清原因，等管理员）
```

| 状态 | 谁处理 | 动作 |
|---|---|---|
| 待评审 | 产品 | 评审：不做→评论理由并 `close <n> 产品否决`；做→评论「产品方案」→ `state <n> 待审批` |
| 待审批 | 管理员 | 在管理员 App 里批准 / 要求修改 / 驳回（App 会附评论） |
| 需修改 | 产品 | 读管理员评论，发「产品方案 v2」评论 → `待审批` |
| 已驳回 | 产品 | 关闭即可（`close <n> 已驳回`） |
| 已批准 | 开发 | 建工作区 → `开发中` → 开发、自测、提交 → 评论「开发说明」→ `待测试` |
| 返工 | 开发 | 读测试报告修复 → 评论「修复说明」→ `待测试` |
| 待测试 | 测试 | 测试 → 评论「测试报告」→ 通过：运行 release.ps1 → `close <n> 已上线`；不通过：`返工` |

**同一需求返工满 3 次**仍不通过 → 测试改为 `阻塞`，等管理员。

## 上报状态

每个角色开始、关键步骤、结束、卡住时都要 `python team/gh.py status <角色> <工作中|空闲|阻塞> "<在做什么>" [编号]`，管理员在审批 App 的「办公室」页实时看到（像素小人在工位打字 / 沙发喝咖啡 / 头顶红色感叹号）。状态存在看板里带「团队状态」标签的那张单，`list` 会自动排除它。工作中超过 3 小时没更新，App 显示「可能已中断」。

## 每个角色的产出格式（评论第一行固定标题，管理员 App 靠它识别）

- 需求单正文（需求员）：`## 背景` / `## 问题或机会`（附证据：哪个页面、哪个文件、什么现象）/ `## 期望效果` / `## 优先级`（高/中/低 + 理由）
- `## 产品方案`（产品）：一句话结论 / 用户故事 / 具体改动（页面、文件、交互、数据）/ 验收标准（可逐条测试的清单）/ 工作量（小/中/大）/ 风险与不做的部分
- `## 开发说明`（开发）：分支、改了哪些文件、怎么实现、自测结果
- `## 测试报告`（测试）：逐条对照验收标准 ✅/❌、回归检查、截图或命令输出摘要、结论（通过 / 返工 + 必须修复的问题清单）
- 上线后测试再评论 `## 已上线`：版本号和镜像下载地址

## 开发约定

- 每个需求单独一个 git 工作区，**不要在主目录 `teach/` 里改代码**（管理员自己也在主目录工作，可能有未提交的改动）：
  ```
  git -C C:/Users/newland/Documents/teach worktree add ../teach-team-wt/issue-<n> -b team/issue-<n> main
  ```
  已存在就直接用。所有修改、提交都在 `C:/Users/newland/Documents/teach-team-wt/issue-<n>` 里做。
- 提交信息用中文，结尾加 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- 遵守各图谱目录里的 docs（AUTHORING.md、*-brief.md 等）和以下记忆里的约定：
  `C:/Users/newland/.claude/projects/C--Users-newland-Documents-teach/memory/` 下的 MEMORY.md 及其链接文件（打包坑、英语用词分级、题目覆盖要点、file:// 约束等）。动手前先读相关条目。
- 新增图谱目录要同步改 `knowledge-map-app/build.ps1` 的 `$maps` 和 `hub/index.html` 卡片
- 只做方案里批准的范围；发现方案有问题，评论说明并改 `阻塞`，不要自作主张扩大范围
- 绝不提交 `knowledge-map-app/signing/`，绝不打印 token

## 测试约定

- 在工作区里测试。网页用浏览器预览：`.claude/launch.json` 里的 `team-wt`（端口 8781）以 `teach-team-wt` 为根目录，打开 `http://localhost:8781/issue-<n>/<图谱目录>/index.html`
- 必做回归：改动涉及的页面无控制台报错；各图谱首页能打开；打包能通过：
  ```
  $env:KM_SIGNING_DIR='C:\Users\newland\Documents\teach\knowledge-map-app\signing'; powershell -ExecutionPolicy Bypass -File <工作区>\knowledge-map-app\build.ps1
  ```
  （build.ps1 末尾有 APK 自检）
- 通过后上线：
  ```
  powershell -ExecutionPolicy Bypass -File C:\Users\newland\Documents\teach\team\release.ps1 -Issue <n> -Notes "<给平板用户看的一句话更新说明>"
  ```
  Notes 不能有中文弯引号“”，用「」。退出码 2/3 → 改 `阻塞` 并写明原因（3 = 管理员主目录有未提交改动和本次撞文件）

## 需求员选题来源

- 体验产品：用浏览器逐个打开图谱、总入口、宠物页，找报错、空内容、难用的交互、平板上不合适的布局
- 内容质量：知识点缺漏、题目覆盖不全、超纲用词、过时教材版本
- 记忆里标注“待做/待补”的事项（如语音讲解稿 B 方案）
- 福建中考最新考纲、教材版本变化（可联网搜索）
- 先 `python team/gh.py history 90` 查重，不提重复需求；每天最多提 2 个，宁缺毋滥
