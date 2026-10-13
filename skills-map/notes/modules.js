// 其它技能 · 学做笔记：配置与模块。内容在 lessons.js，字段说明同 bio-history-map/docs/AUTHORING.md
window.KG = {
  config: {
    key: 'fjzk-notes',
    subject: '做笔记',
    title: '学做笔记',
    sub: '其它技能 · 课堂笔记、康奈尔、思维导图、错题本、复习',
    caseSensitive: false,
    practiceName: '动手练',
    tipName: '小提示',
    freqName: '重要度',
    terms: [
      { id: 'l1', name: '第一步 · 入门' },
      { id: 'l2', name: '第二步 · 方法' },
      { id: 'l3', name: '第三步 · 用起来' }
    ]
  },
  modules: [
    { id: 'class',  name: '课堂笔记',   color: '#2f6fde' },
    { id: 'method', name: '笔记方法',   color: '#7c3aed' },
    { id: 'review', name: '错题与复习', color: '#d97706' }
  ],
  nodes: []
};
