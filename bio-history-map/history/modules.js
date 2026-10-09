// 历史：学科配置与模块。各内容文件用 KG.nodes.push(...) 追加知识点。字段说明见 docs/AUTHORING.md。
window.KG = {
  config: {
    key: 'fjzk-history',
    subject: '历史',
    title: '中考历史知识图谱',
    sub: '福建 · 新版统编版 · 七年级到九年级',
    caseSensitive: false,
    practiceName: '材料·论述',
    terms: [
      { id: '7a', name: '七年级上' },
      { id: '7b', name: '七年级下' },
      { id: '8a', name: '八年级上' },
      { id: '8b', name: '八年级下' },
      { id: '9a', name: '九年级上' },
      { id: '9b', name: '九年级下' }
    ]
  },
  modules: [
    { id: 'cn-anc',  name: '中国古代史', color: '#b45309' },
    { id: 'cn-mod',  name: '中国近代史', color: '#dc2626' },
    { id: 'cn-cont', name: '中国现代史', color: '#db2777' },
    { id: 'w-anc',   name: '世界古代史', color: '#0e9f8e' },
    { id: 'w-mod',   name: '世界近代史', color: '#2f6fde' },
    { id: 'w-cont',  name: '世界现代史', color: '#7c3aed' },
    { id: 'skill',   name: '史料与题型', color: '#475569' }
  ],
  nodes: []
};
