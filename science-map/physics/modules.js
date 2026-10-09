// 物理：学科配置与模块。各内容文件用 KG.nodes.push(...) 追加知识点。字段说明见 docs/AUTHORING.md。
window.KG = {
  config: {
    key: 'fjzk-physics',
    subject: '物理',
    title: '中考物理知识图谱',
    sub: '福建 · 人教版 · 八年级到九年级',
    caseSensitive: false,
    terms: [
      { id: '8a', name: '八年级上' },
      { id: '8b', name: '八年级下' },
      { id: '9',  name: '九年级' },
      { id: 'review', name: '中考复习' }
    ]
  },
  modules: [
    { id: 'motion', name: '运动与测量', color: '#0e9f8e' },
    { id: 'sound',  name: '声',         color: '#8b5cf6' },
    { id: 'heat',   name: '热学',       color: '#e0761f' },
    { id: 'light',  name: '光学',       color: '#d9a400' },
    { id: 'matter', name: '质量与密度', color: '#16a34a' },
    { id: 'force',  name: '力与运动',   color: '#2f6fde' },
    { id: 'press',  name: '压强与浮力', color: '#0891b2' },
    { id: 'work',   name: '功和机械',   color: '#b45309' },
    { id: 'elec',   name: '电学',       color: '#db2777' },
    { id: 'mag',    name: '电与磁',     color: '#7c3aed' },
    { id: 'energy', name: '信息与能源', color: '#64748b' },
    { id: 'skill',  name: '题型技能',   color: '#475569' }
  ],
  nodes: []
};
