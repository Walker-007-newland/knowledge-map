/* 语文生字词听写（tingxie.html）的册目录
 * 每册一项：
 *   { id:'tb4a', grade:4, term:'上', pub:'统编版', ed:'2026 秋版', checked:false, src:'来源说明',
 *     units:[ { id:'u1', name:'第一单元', lessons:[
 *       { id:'k1', no:1, name:'观潮' },                    // 课文（type 缺省为 'lesson'）
 *       { id:'g1', type:'garden', name:'语文园地' },        // 语文园地：不显示课次
 *     … ] }, … ] }
 *   checked:false 时页面显示「待核对」（还没对照纸质课本抽查确认）
 * 每册的词在 data/tingxie/<册id>.js，按课本顺序排列：
 *   KT.add('tb4a', [ { k:'k1', w:'词语', say:'可选：朗读用的文字（同音词加组词或短句区分，如“权利，享有权利的权利”）' }, … ]);
 * 页面选中某册时才用 <script> 动态加载那一册的词（file:// 下可用）。 */
window.KT = window.KT || { books: [], words: {}, add(id, list) { this.words[id] = list; } };
KT.books = [
  {"id": "tb4a", "grade": 4, "term": "上", "pub": "统编版", "ed": "根据2022年版课标修订版", "src": "国家中小学智慧教育平台电子课本《义务教育教科书·语文四年级上册》（根据2022年版课程标准修订，人民教育出版社），书末“词语表”第127–129页；内容 ID 5cd7e623-5c38-4602-871a-3fba8a551db2", "checked": false, "units": [{"id": "u1", "name": "第一单元", "lessons": [{"id": "k1", "no": 1, "name": "观潮"}, {"id": "k2", "no": 2, "name": "繁星"}, {"id": "k3", "no": 3, "name": "现代诗二首"}]}, {"id": "u2", "name": "第二单元", "lessons": [{"id": "k4", "no": 4, "name": "一个豆荚里的五粒豆"}, {"id": "k5", "no": 5, "name": "夜间飞行的秘密"}, {"id": "k6", "no": 6, "name": "方帽子店"}, {"id": "k7", "no": 7, "name": "田忌赛马"}, {"id": "g2", "type": "garden", "name": "语文园地"}]}, {"id": "u3", "name": "第三单元", "lessons": [{"id": "k8", "no": 8, "name": "古诗三首"}, {"id": "k9", "no": 9, "name": "爬山虎的脚"}, {"id": "k10", "no": 10, "name": "蟋蟀的住宅"}]}, {"id": "u4", "name": "第四单元", "lessons": [{"id": "k11", "no": 11, "name": "盘古开天地"}, {"id": "k12", "no": 12, "name": "精卫填海"}, {"id": "k13", "no": 13, "name": "普罗米修斯"}, {"id": "k14", "no": 14, "name": "女娲补天"}, {"id": "g4", "type": "garden", "name": "语文园地"}]}, {"id": "u5", "name": "第五单元", "lessons": [{"id": "k15", "no": 15, "name": "麻雀"}, {"id": "k16", "no": 16, "name": "爬天都峰"}]}, {"id": "u6", "name": "第六单元", "lessons": [{"id": "k17", "no": 17, "name": "长城"}, {"id": "k18", "no": 18, "name": "颐和园"}, {"id": "k19", "no": 19, "name": "秦兵马俑"}, {"id": "g6", "type": "garden", "name": "语文园地"}]}, {"id": "u7", "name": "第七单元", "lessons": [{"id": "k20", "no": 20, "name": "牛和鹅"}, {"id": "k21", "no": 21, "name": "一只窝囊的大老虎"}, {"id": "k22", "no": 22, "name": "陀螺"}, {"id": "k23", "no": 23, "name": "王戎不取道旁李"}, {"id": "g7", "type": "garden", "name": "语文园地"}]}, {"id": "u8", "name": "第八单元", "lessons": [{"id": "k24", "no": 24, "name": "我将无我，不负人民"}, {"id": "k25", "no": 25, "name": "为中华之崛起而读书"}, {"id": "k26", "no": 26, "name": "延安，我把你追寻"}, {"id": "k27", "no": 27, "name": "古诗三首"}]}]},
];
