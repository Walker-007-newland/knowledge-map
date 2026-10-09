// 生物：学科配置与模块。各内容文件用 KG.nodes.push(...) 追加知识点。字段说明见 docs/AUTHORING.md。
window.KG = {
  config: {
    key: 'fjzk-biology',
    subject: '生物',
    title: '中考生物知识图谱',
    sub: '福建 · 新版人教版 · 七年级到八年级',
    caseSensitive: false,
    practiceName: '识图·简答',
    terms: [
      { id: '7a', name: '七年级上' },
      { id: '7b', name: '七年级下' },
      { id: '8a', name: '八年级上' },
      { id: '8b', name: '八年级下' }
    ]
  },
  modules: [
    { id: 'cell',    name: '细胞与结构层次', color: '#0e9f8e' },
    { id: 'diverse', name: '生物的多样性',   color: '#16a34a' },
    { id: 'plant',   name: '植物的生活',     color: '#65a30d' },
    { id: 'human',   name: '人体生理与健康', color: '#db2777' },
    { id: 'gene',    name: '遗传与进化',     color: '#7c3aed' },
    { id: 'eco',     name: '生物与环境',     color: '#0891b2' },
    { id: 'tech',    name: '生物技术',       color: '#b45309' },
    { id: 'skill',   name: '探究与题型',     color: '#475569' }
  ],
  nodes: []
};
