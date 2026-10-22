// 单元单词（需求 #9）的册目录：页面一打开就加载；每册的词在 <册id>.js 里，选中该册时动态加载
// 册 id：mj 闽教版 / ra 仁爱版 + 年级 + a 上册 / b 下册。没录入的册不要写进来（年级标签会灰掉）
// checked：管理员已对照纸质课本抽查确认（false 时页面显示「待核对」）
// mustMarked：课本词表区分了必背（四会）和认读词；false 时全部按必背，页面不显示「只看必背」
// units、mustMarked 由 docs/wordlists/unit_build.py 根据 docs/unit-words/<册id>.json 更新，其余手工维护
window.KW = window.KW || {
  books: [],
  words: {},
  add(id, list) { this.words[id] = list; }
};
KW.books = [
  { id: 'mj3a', grade: 3, term: '上', pub: '闽教版', ed: '2024 秋新版', checked: true, mustMarked: true,
    src: '闽教版三年级上册（2025 年度印次），书末 Words and Expressions 第 74–77 页；国家中小学智慧教育平台电子课本',
    units: [
      { id: "u1", name: "Unit 1 Meeting Friends" },
      { id: "u2", name: "Unit 2 Fun Numbers" },
      { id: "u3", name: "Unit 3 Colors Around Us" },
      { id: "u4", name: "Unit 4 Loving My Family" }
    ] },
  { id: 'mj3b', grade: 3, term: '下', pub: '闽教版', ed: '2025 春新版', checked: true, mustMarked: true,
    src: '闽教版三年级下册（2026 年度印次），书末 Words and Expressions 第 72–74 页；国家中小学智慧教育平台电子课本',
    units: [
      { id: "u1", name: "Unit 1 Our Animal Friends" },
      { id: "u2", name: "Unit 2 My Clothes" },
      { id: "u3", name: "Unit 3 Time" },
      { id: "u4", name: "Unit 4 Healthy Eating" }
    ] },
  { id: 'mj4a', grade: 4, term: '上', pub: '闽教版', ed: '2025 秋新版', checked: true, mustMarked: true,
    src: '闽教版四年级上册（2026 年度印次），书末 Words and Expressions 第 72–74 页；国家中小学智慧教育平台电子课本',
    units: [
      { id: "u1", name: "Unit 1 Our School" },
      { id: "u2", name: "Unit 2 Daily Life" },
      { id: "u3", name: "Unit 3 Our Hobbies" },
      { id: "u4", name: "Unit 4 Chinese Festivals" }
    ] },
  { id: 'mj4b', grade: 4, term: '下', pub: '闽教版', ed: '2026 春新版', checked: true, mustMarked: true,
    src: '闽教版四年级下册（2026 春版），书末 Words and Expressions 第 72–74 页；国家中小学智慧教育平台电子课本',
    units: [
      { id: "u1", name: "Unit 1 Weekly Activities" },
      { id: "u2", name: "Unit 2 My Favorite Subject" },
      { id: "u3", name: "Unit 3 Our Feelings" },
      { id: "u4", name: "Unit 4 Getting Around" }
    ] },
  { id: 'mj5a', grade: 5, term: '上', pub: '闽教版', ed: '2026 秋新版', checked: false, mustMarked: true,
    src: '闽教版五年级上册（2026 年度印次），书末 Words and Expressions 第 91–93 页；国家中小学智慧教育平台电子课本',
    units: [
      { id: "u1", name: "Unit 1 Weather in Different Seasons" },
      { id: "u2", name: "Unit 2 Months of the Year" },
      { id: "u3", name: "Unit 3 Plans and Dates" },
      { id: "u4", name: "Unit 4 Our Dream Jobs" }
    ] },
  { id: 'mj6a', grade: 6, term: '上', pub: '闽教版', ed: '2026 秋新版', checked: false, mustMarked: true,
    src: '闽教版六年级上册（2026 年度印次），书末 Words and Expressions 第 93–95 页；国家中小学智慧教育平台电子课本',
    units: [
      { id: "u1", name: "Unit 1 Wonderful Sports Events" },
      { id: "u2", name: "Unit 2 Healthy Life" },
      { id: "u3", name: "Unit 3 Good Manners" },
      { id: "u4", name: "Unit 4 Great People" }
    ] }
];
