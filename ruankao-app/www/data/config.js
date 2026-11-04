// 软考·系统架构设计师：考试信息与模块。知识点文件用 RK.nodes.push(...) 追加，案例 RK.cases.push，论文 RK.essays.push。
// 字段说明见 docs/AUTHORING.md
window.RK = {
  config: {
    examDate: '2027-05-22',          // 默认目标考试日（官方公布后在「首页 → 设置」里改）
    pass: 45,                        // 各科满分 75，合格线通常 45（以当次公告为准）
    mock: { count: 75, minutes: 150 }
  },
  // 考试形式（2023 年下半年起机考）。细节以中国计算机技术职业资格网当次公告和考试大纲为准
  exam: [
    { name: '综合知识', time: '150 分钟', desc: '75 道单选题，每题 1 分，含约 5 分专业英语' },
    { name: '案例分析', time: '90 分钟', desc: '第 1 题必答（多为质量属性 / 架构评估），其余题选答，每题 25 分' },
    { name: '论文', time: '120 分钟', desc: '几个题目中选 1 个，写摘要 + 正文，结合自己做过的项目论述' }
  ],
  modules: [
    { id: 'base',    name: '计算机系统基础',       color: '#64748b' },
    { id: 'os',      name: '操作系统',             color: '#0e7490' },
    { id: 'db',      name: '数据库',               color: '#0891b2' },
    { id: 'net',     name: '计算机网络',           color: '#0284c7' },
    { id: 'sec',     name: '信息安全',             color: '#dc2626' },
    { id: 'se',      name: '软件工程',             color: '#16a34a' },
    { id: 'req',     name: '需求工程与系统分析',   color: '#65a30d' },
    { id: 'design',  name: '系统设计与设计模式',   color: '#ca8a04' },
    { id: 'arch',    name: '软件架构',             color: '#1d4ed8' },
    { id: 'quality', name: '质量属性与架构评估',   color: '#7c3aed' },
    { id: 'dist',    name: '分布式与云原生',       color: '#db2777' },
    { id: 'emb',     name: '嵌入式与实时系统',     color: '#b45309' },
    { id: 'info',    name: '信息系统与新技术',     color: '#0d9488' },
    { id: 'pm',      name: '项目管理与法律标准',   color: '#9333ea' },
    { id: 'math',    name: '数学与经济管理',       color: '#475569' },
    { id: 'eng',     name: '专业英语',             color: '#e11d48' }
  ],
  nodes: [],
  cases: [],
  essays: []
};
