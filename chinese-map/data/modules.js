// 模块定义。各内容文件用 KG.nodes.push(...) 追加知识点。
// 知识点字段：
//   id, title(完整名), short(图上显示名，8 字以内), module, grade(首次学习年级 4-9), freq(中考考频 1-3)
//   prereqs: [前置知识点 id]
//   tip: 中考提示（一句话）
//   learn: [{h: 小标题, html: 内容}]
//     古诗文写成 <div class="poem ex">…</div> 或 <p class="ex">原文<span class="zh">译文</span></p>，点击朗读（不读 .zh）
//     注音用 <ruby>字<rt>pīn</rt></ruby>；加点字用 <span class="dot-em">字</span>
//   passages: {key: {title, html}}   阅读材料，题目里写 passage: key 共用一篇（这样的题不打乱顺序）
//   examples / tests: 三种题型
//     {type:'choice', q, options:[...], answer: 正确选项下标, explain}
//     {type:'fill', q, answer:[可接受答案...], explain}        比对时忽略空格和标点，默写只看字
//     {type:'open', q, ref: 参考答案html, points:[{s: 分值, p: 得分要点}], explain?, rows?}
//                                                             主观题：交卷后学生对照要点自评
//   practice: [{title, prompt, words:[下限,上限], checklist:[...], sample, notes}]   写作练习（不计分）
//   解析里不要写 A/B/C 字母，测试时选项顺序会打乱。不要把题目标成某年真题。
//   现代文阅读材料一律原创，不整篇搬课文；古诗文可用原文。
window.KG = {
  modules: [
    { id: 'zici',    name: '字词',         color: '#0e9f8e' },
    { id: 'yufa',    name: '语法修辞',     color: '#2f6fde' },
    { id: 'gushi',   name: '古诗词',       color: '#c2410c' },
    { id: 'wenyan',  name: '文言文',       color: '#a16207' },
    { id: 'xiandai', name: '现代文阅读',   color: '#8b5cf6' },
    { id: 'mingzhu', name: '名著阅读',     color: '#db2777' },
    { id: 'zonghe',  name: '综合性学习',   color: '#16a34a' },
    { id: 'xiezuo',  name: '写作',         color: '#64748b' }
  ],
  nodes: []
};
