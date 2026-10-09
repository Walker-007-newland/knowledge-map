// 化学：学科配置与模块。各内容文件用 KG.nodes.push(...) 追加知识点。字段说明见 docs/AUTHORING.md。
window.KG = {
  config: {
    key: 'fjzk-chemistry',
    subject: '化学',
    title: '中考化学知识图谱',
    sub: '福建 · 人教版 · 九年级',
    caseSensitive: true,          // 化学式区分大小写：Co ≠ CO
    terms: [
      { id: '9a', name: '九年级上' },
      { id: '9b', name: '九年级下' },
      { id: 'review', name: '中考复习' }
    ]
  },
  modules: [
    { id: 'basic',  name: '实验基础',     color: '#64748b' },
    { id: 'air',    name: '空气与氧气',   color: '#0e9f8e' },
    { id: 'struct', name: '物质构成',     color: '#8b5cf6' },
    { id: 'water',  name: '水与溶液',     color: '#0891b2' },
    { id: 'eq',     name: '化学方程式',   color: '#2f6fde' },
    { id: 'carbon', name: '碳与燃料',     color: '#475569' },
    { id: 'metal',  name: '金属',         color: '#b45309' },
    { id: 'acid',   name: '酸碱盐',       color: '#db2777' },
    { id: 'life',   name: '化学与社会',   color: '#16a34a' },
    { id: 'skill',  name: '题型技能',     color: '#e0761f' }
  ],
  nodes: []
};
