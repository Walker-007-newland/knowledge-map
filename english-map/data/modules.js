// 模块定义。各内容文件用 KG.nodes.push(...) 追加知识点。
// 知识点字段：
//   id, title(完整名), short(图上显示名), module, grade(首次学习年级 4-9), freq(中考考频 1-3)
//   prereqs: [前置知识点 id]
//   tip: 中考提示（一句话）
//   learn: [{h: 小标题, html: 内容}]   例句写成 <p class="ex">English<span class="zh">中文</span></p>，可点击朗读
//   examples / tests: [{type:'choice', q, options:[...], answer: 正确选项下标, explain}
//                      | {type:'fill', q, answer:[可接受答案...], explain}]
//   解析里不要写 A/B/C 字母，测试时选项顺序会打乱。
//   题目可加 say: '英文'，显示“🔊 听一听”按钮朗读（文字不显示），用于听音选词、听句子选答语。
//   选项可以写 HTML（如 <u>划线</u>）。讲解里 <span class="w">word</span> 点击朗读单个词。
//   say 也可以是对话：[{who:'W', text:'...'}, {who:'M', text:'...'}]（男女用不同音高朗读）。
//   多题共用材料：节点上写 passages: { p1: {title, html, say?, hidden?} }，题目加 passage: 'p1'。
//     hidden: true 表示听力材料，交卷前不显示原文。完形的空格写 <span class="blank">(1)</span>。
//     有 passage 的节点，测试题按书写顺序出现（只打乱选项）。
//   写作练习：practice: [{title, prompt(html), words:[最少,最多], checklist:[...], sample(html), notes?(html)}]
window.KG = {
  modules: [
    { id: 'phonics', name: '语音',     color: '#0e9f8e' },
    { id: 'vocab',   name: '词汇',     color: '#16a34a' },
    { id: 'morph',   name: '词法',     color: '#2f6fde' },
    { id: 'tense',   name: '时态语态', color: '#e0761f' },
    { id: 'syntax',  name: '句法',     color: '#8b5cf6' },
    { id: 'talk',    name: '交际用语', color: '#db2777' },
    { id: 'skill',   name: '题型技能', color: '#64748b' }
  ],
  nodes: []
};
