// 第 2 阶段：C 组
KG.nodes.push(

/* ================= 八年级（上） ================= */
{
  id: 'g-other', title: 'other / another / the other / others', short: 'other 辨析', module: 'morph', grade: 8, freq: 2,
  prereqs: ['g-pronoun', 'g-plural'],
  tip: '常在完形和语法选择里考：关键看是“两者中的另一个”还是“三者以上中的又一个”，是“剩下的全部”还是“其他一些”。',
  learn: [
    { h: '一张表分清', html: `<table class="tbl"><tr><th>词</th><th>意思</th><th>用法</th></tr>
      <tr><td>another</td><td>（三者以上中）又一个、另一个</td><td>+ 单数名词，或单独用；another + 数字 + 复数名词 = 再……</td></tr>
      <tr><td>other</td><td>其他的</td><td>后面必须接名词（多为复数）：other students</td></tr>
      <tr><td>others</td><td>其他人 / 物（一部分）</td><td>代词，后面不接名词 = other + 复数名词</td></tr>
      <tr><td>the other</td><td>（两者中）另一个</td><td>one ... the other ...；the other + 复数名词 = 剩下的全部</td></tr>
      <tr><td>the others</td><td>剩下的全部人 / 物</td><td>代词，后面不接名词 = the other + 复数名词</td></tr></table>` },
    { h: '口诀', html: `<div class="rhyme">有 the 是特指，剩下全包括；<br>没 the 是泛指，只是一部分；<br>带 s 是代词，后面不带名词。</div>` },
    { h: '常用搭配', html: `<p><b>one ... the other ...</b>：两个中，一个……另一个……</p>
      <p class="ex">I have two brothers. One is a doctor, and the other is a teacher.<span class="zh">我有两个哥哥，一个是医生，另一个是老师。</span></p>
      <p><b>some ... others ...</b>：一些……另一些……（不是全部）</p>
      <p class="ex">Some students are reading, and others are playing games.<span class="zh">一些学生在看书，另一些在玩游戏。</span></p>
      <p><b>another + 数字 + 复数名词</b>：再……、又……</p>
      <p class="ex">I need another two days to finish the work.<span class="zh">我还需要两天才能完成这项工作。</span></p>
      <p><b>each other</b>：互相</p>
      <p class="ex">We should help each other.<span class="zh">我们应该互相帮助。</span></p>` },
    { h: '易错点', html: `<ul>
      <li><b>other</b> 后面必须有名词；<b>others</b> 后面不能再加名词（others students ✗）。</li>
      <li>比较级里“比其他任何一个都……”：<span class="en">Tom is taller than any other student in his class.</span>（any other + 单数名词）</li>
      <li>题目里先数一数一共几个：两个用 the other，三个以上又一个用 another。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'Lily has two pets. One is a cat, and ___ is a dog.', options: ['the other', 'another', 'other'], answer: 0,
      explain: '一共两个宠物，one ... the other ...，“另一个”用 the other。' },
    { type: 'choice', q: 'There are 50 students in our class. 20 of them are boys, and ___ are girls.', options: ['the others', 'others', 'other'], answer: 0,
      explain: '除去男生，剩下的全部是女生，用 the others；后面没有名词，所以要带 s。' },
    { type: 'choice', q: 'This T-shirt is too small for me. You have so many here. Could you show me ___ one?', options: ['another', 'the other', 'other'], answer: 0,
      explain: '店里有很多件（三者以上），想要“再换一件”，用 another + 单数名词（one）。the other 只用于两者中的另一个；other 不和 one 这样直接连用表示“另一件”。' },
    { type: 'fill', q: 'The bus is full. We have to wait ___ ten minutes for the next one.（用 other 或 another 填空）', answer: ['another'],
      explain: 'another + 数字 + 复数名词，表示“再……、又……”。another ten minutes = 再等十分钟。虽然 minutes 是复数，前面有数字 ten，仍然用 another。' },
    { type: 'choice', q: 'Mr. Li teaches English, and he often helps ___ teachers with their computers.', options: ['other', 'others', 'another'], answer: 0,
      explain: '空后有名词 teachers，要用形容词性的 other（其他的）；others 是代词，后面不能再接名词；another 后接单数名词，不能接 teachers。' },
    { type: 'choice', q: 'Be kind to ___, and they will be kind to you.', options: ['others', 'other', 'the other'], answer: 0,
      explain: '空后没有名词，要用代词 others（= other people，别人）；other 后面必须接名词；the other 指两者中的另一个，和后面的 they 不符。' },
    { type: 'choice', q: 'Only three of the ten students took the bus. ___ seven students rode bikes there.', options: ['The other', 'Others', 'Other'], answer: 0,
      explain: '十个人去掉三个，剩下的七个“全部”骑车，用 the other + 复数名词（= the others）。Others 后面不能接名词；Other 表泛指，不能和具体的“剩下七个”连用。' },
    { type: 'choice', q: 'Some of the visitors are from Beijing, and ___ are from Shanghai.', options: ['others', 'the other', 'another'], answer: 0,
      explain: 'some ... others ... 表示“一些……另一些……”，不是全部；the other 和 another 都指一个，和复数 are 不符。' },
    { type: 'fill', q: 'Tom and Jerry are good friends. They often help ___ ___.（互相，填两个词）', answer: ['each other', 'one another'],
      explain: 'each other 表示“互相”，是固定说法。' },
    { type: 'choice', q: 'I think Mount Wuyi is more beautiful than any other ___ in Fujian.', options: ['mountain', 'mountains', 'mountain\'s'], answer: 0,
      explain: '比较级 + than any other + 单数名词，表示“比其他任何一个都……”，所以用单数 mountain。' },
    { type: 'fill', q: '改错：Some students like football, and <u>others</u> students like basketball.（把划线词改正，填一个词）', answer: ['other'],
      explain: '划线词后面还有名词 students，要用 other；others 是代词，后面不能再接名词（others students ✗）。也可以去掉 students，写成 and others like basketball。' }
  ],
  tests: [
    { type: 'choice', q: 'I have two good friends. One is from Fuzhou, and ___ is from Xiamen.', options: ['the other', 'another', 'other'], answer: 0, explain: '两个中的另一个，用 the other。' },
    { type: 'choice', q: 'There are many apples in the basket. May I have ___ one?', options: ['another', 'other', 'others'], answer: 0, explain: '很多苹果中“再要一个”，用 another；other 不和 one 这样单用，others 后面不能接名词。' },
    { type: 'choice', q: 'There are twelve players on our team. Ten of them are on the field, and ___ are resting.', options: ['the others', 'others', 'other'], answer: 0, explain: '十二人去掉场上的十人，剩下的两人全部在休息，用 the others；others 只指其中一部分；other 后面必须接名词。' },
    { type: 'choice', q: 'In the park, some people are dancing, and ___ are walking.', options: ['others', 'another', 'the other'], answer: 0, explain: 'some ... others ... 表示“一些……另一些……”；another 和 the other 指一个，与 are 不符。' },
    { type: 'choice', q: 'Tom runs faster than any ___ student in his class.', options: ['other', 'others', 'another'], answer: 0, explain: 'any other + 单数名词，表示“其他任何一个”。' },
    { type: 'fill', q: 'Classmates should help each ___.（填一个词）', answer: ['other'], explain: 'each other 表示“互相”。' },
    { type: 'fill', q: 'I need ___ two days to finish the job.（用 other 或 another 填空）', answer: ['another'], explain: 'another + 数字 + 复数名词，表示“再……、又……”。' },
    { type: 'choice', q: '—This cake is delicious!<br>—Would you like ___ piece? There are lots left.', options: ['another', 'other', 'the other'], answer: 0, explain: '蛋糕还剩很多块，“再来一块”用 another + 单数名词；other 不接单数可数名词表示“另一块”；the other 只用于两者中的另一个。' },
    { type: 'choice', q: 'Five chairs are not enough for ten guests. We need ___ five chairs.', options: ['another', 'other', 'others'], answer: 0, explain: '“再要五把椅子”，another + 数字 + 复数名词；others 后面不能接名词；other 不能放在数字前面这样用。' },
    { type: 'choice', q: 'Are there any ___ questions? If not, let\'s stop here.', options: ['other', 'others', 'another'], answer: 0, explain: '空后有名词 questions，用 other；others 后面不接名词；another 后接单数名词，且 any 后不用 another。' },
    { type: 'fill', q: 'Besides Chinese, Tom can speak two ___ languages.（填 other / others / another 中的一个）', answer: ['other'], explain: '空后有复数名词 languages，前面有数字 two，用 other（其他的）。others 后不能接名词；another 要放在数字前面（another two languages）。' },
    { type: 'choice', q: 'We should always think of ___ and not only ourselves.', options: ['others', 'other', 'another'], answer: 0, explain: 'think of others 为别人着想，空后无名词，用代词 others；other 后必须接名词；another 指“又一个”，不合句意。' },
    { type: 'fill', q: 'Some people like summer, while ___ like winter.（用 other 的适当形式填空）', answer: ['others'], explain: 'some ... others ... 表示“一些……另一些……”；空后没有名词，用代词 others。' },
    { type: 'choice', q: 'Some of my classmates walk to school, and ___ go by bus.', options: ['others', 'other', 'another'], answer: 0, explain: 'some ... others ...，“一些……另一些……”；other 后面要接名词，another 后接单数，和 go 不符。' },
    { type: 'choice', q: 'She has a cup in one hand and a book in ___.', options: ['the other', 'another', 'other'], answer: 0, explain: '人只有两只手，one ... the other ...，“另一只手”用 the other。' },
    { type: 'choice', q: '听一听，说话人有几支笔？', say: 'I have two pens. One is red, and the other is blue.', options: ['两支', '三支', '很多支'], answer: 0, explain: '听到 I have two pens，再加上 one ... the other ... 的结构，正说明一共两支：一支红的，另一支蓝的。' },
    { type: 'fill', q: '改错：I have two sisters. One is a nurse, and <u>another</u> is a teacher.（把划线词改正，填两个词）', answer: ['the other'], explain: '一共两个姐妹，“另一个”是两者中的另一个，用 the other；another 用于三者以上。' },
    { type: 'choice', q: 'Jim is still in the classroom. All ___ boys in his class are on the playground.', options: ['the other', 'others', 'another'], answer: 0, explain: '除了吉姆，班里剩下的男生全部在操场，用 the other + 复数名词；others 后面不能接名词；another 后接单数名词。' },
    { type: 'fill', q: 'There are 30 students in our class. Five of them are absent today. ___ ___ 25 students are all here.（填两个词，首字母大写）', answer: ['The other'], explain: '去掉缺席的五人，剩下的 25 人全部到了，用 the other + 数字 + 复数名词，表示“剩下的全部”。' },
    { type: 'choice', q: 'There were six people in the room. One of them left, and ___ stayed.', options: ['the others', 'another', 'the other'], answer: 0, explain: '六个人走了一个，剩下五个人全部留下，用 the others；another 和 the other 都只指一个人。' },
    { type: 'choice', q: 'The two old friends haven\'t seen ___ for ten years.', options: ['each other', 'the other', 'others'], answer: 0, explain: '“两个老朋友十年没见到彼此”，用 each other（互相）。' },
    { type: 'fill', q: 'Shanghai is bigger than any other ___ in China.（city）', answer: ['city'], explain: 'than any other + 单数名词，所以 city 用单数原形。' },
    { type: 'choice', q: '下列句子正确的是哪一句？', options: ['Other students are reading in the library.', 'Others students are reading in the library.', 'Other are reading in the library.'], answer: 0, explain: 'other 后面必须接名词，others 后面不能接名词。Other students 正确；Others students 多了 s；Other 单独作主语缺名词。' }
  ]
},

{
  id: 'g-both-either', title: 'both / all / either / neither / none', short: 'both/either 等', module: 'morph', grade: 8, freq: 2,
  prereqs: ['g-pronoun'],
  tip: '先数“两个”还是“三个以上”，再看是“都”还是“都不”；回答 How many 用 none，回答 Who 用 nobody，是最常见的陷阱。',
  learn: [
    { h: '两者和三者', html: `<table class="tbl"><tr><th></th><th>两者</th><th>三者及以上</th></tr>
      <tr><td>都</td><td>both</td><td>all</td></tr>
      <tr><td>任何一个</td><td>either</td><td>any</td></tr>
      <tr><td>都不</td><td>neither</td><td>none</td></tr></table>
      <div class="rhyme">两个用 both，三个用 all；<br>两个都不 neither，三个都不 none。</div>` },
    { h: '各自的用法', html: `<p><b>both</b>：两者都，谓语用复数</p>
      <p class="ex">My parents are both teachers.<span class="zh">我父母都是老师。</span></p>
      <p><b>either</b>：两者中任何一个，后接单数名词</p>
      <p class="ex">You can take either bus. Both of them go to the park.<span class="zh">两辆公交车你坐哪辆都行，都到公园。</span></p>
      <p class="ex">There are trees on either side of the road.<span class="zh">路的两边都有树。（either side = both sides）</span></p>
      <p><b>neither</b>：两者都不</p>
      <p class="ex">Which do you like, tea or coffee? — Neither. I like milk.<span class="zh">茶和咖啡你喜欢哪个？——都不喜欢，我喜欢牛奶。</span></p>
      <p><b>all / none</b>：三者以上“都 / 都不”</p>
      <p class="ex">All of my classmates like the new teacher.<span class="zh">我所有同学都喜欢新老师。</span></p>` },
    { h: '必考：none 和 nobody', html: `<ul>
      <li><b>none</b> 回答 <b>How many / How much</b>（多少），可指人也可指物</li>
      <li><b>nobody / no one</b> 回答 <b>Who</b>（谁），只指人</li></ul>
      <p class="ex">How many apples are there in the box? — None.<span class="zh">盒子里有几个苹果？——一个也没有。</span></p>
      <p class="ex">Who is in the classroom? — Nobody.<span class="zh">谁在教室里？——没人。</span></p>
      <p class="warn">no one 后面不能接 of，要说 none of them，不能说 no one of them。</p>` },
    { h: '成对连词', html: `<ul>
      <li><b>both A and B</b>：A 和 B 都，谓语用复数</li>
      <li><b>either A or B</b>：要么 A 要么 B</li>
      <li><b>neither A nor B</b>：既不 A 也不 B</li></ul>
      <p class="ex">Neither Tom nor Jim likes football.<span class="zh">汤姆和吉姆都不喜欢足球。</span></p>
      <p class="small">either ... or 和 neither ... nor 连接主语时，谓语和离它最近的主语一致（就近原则）。</p>` }
  ],
  examples: [
    { type: 'choice', q: '—Which do you like better, apples or bananas?<br>—___. I like oranges.', options: ['Neither', 'Both', 'Either'], answer: 0,
      explain: '两者中都不喜欢（我喜欢橙子），用 Neither。' },
    { type: 'choice', q: '—How many students are there in the classroom?<br>—___. They are all on the playground.', options: ['None', 'Nobody', 'No one'], answer: 0,
      explain: 'How many 提问的数量，回答“一个也没有”用 None。' },
    { type: 'choice', q: 'Lucy and Lily are twins. ___ of them like dancing.', options: ['Both', 'All', 'Either'], answer: 0,
      explain: '双胞胎是两个人，“两者都”用 Both，谓语用复数 like。All 用于三者以上；Either 表示“两者中任何一个”，谓语要用单数。' },
    { type: 'choice', q: 'There are four people in my family, and ___ of us love tea.', options: ['all', 'both', 'either'], answer: 0,
      explain: '四个人（三者以上）“都”，用 all；both 只用于两者；either 是两者中任何一个。' },
    { type: 'choice', q: 'There are two pens on the desk. You can take ___ pen.', options: ['either', 'both', 'all'], answer: 0,
      explain: '两支笔中“任何一支”用 either，后接单数名词 pen；both 和 all 后面要接复数名词。' },
    { type: 'fill', q: 'There are shops on both sides of the street.<br>= There are shops on ___ side of the street.（填一个词）', answer: ['either'],
      explain: 'either side（单数）= both sides（复数），都表示“两边”。注意 either 后面的 side 用单数。' },
    { type: 'choice', q: 'There are many books on the shelf. You can borrow ___ of them.', options: ['any', 'either', 'both'], answer: 0,
      explain: '很多本书（三者以上）中“任何一本”用 any；either 和 both 只用于两者。' },
    { type: 'choice', q: '—Who is in the teachers\' office?<br>—___. The teachers are having a meeting.', options: ['Nobody', 'None', 'Neither'], answer: 0,
      explain: 'Who 问的是“谁”，回答“没人”用 Nobody（或 No one）；None 回答 How many / How much；Neither 用于两者。' },
    { type: 'choice', q: '___ of my friends knows the answer.', options: ['None', 'No one', 'Nobody'], answer: 0,
      explain: '后面有 of 短语，只能用 None of ...；no one 和 nobody 后面不能接 of（no one of my friends ✗）。' },
    { type: 'fill', q: 'Both Tom and Jim ___ good at maths.（be，用一般现在时）', answer: ['are'],
      explain: 'both A and B 表示“A 和 B 都”，是两个人，谓语用复数 are。' },
    { type: 'choice', q: 'You can ___ stay here or go with us. It\'s up to you.', options: ['either', 'neither', 'both'], answer: 0,
      explain: 'either ... or ... 表示“要么……要么……”，二选一，由你决定；neither 要和 nor 搭配；both 要和 and 搭配。' },
    { type: 'choice', q: 'Neither my mother ___ my father is at home now.', options: ['nor', 'or', 'and'], answer: 0,
      explain: 'neither ... nor ... 表示“既不……也不……”，是固定搭配；or 和 either 搭配，and 和 both 搭配。' },
    { type: 'choice', q: 'Either you or he ___ going to clean the room today.', options: ['is', 'are', 'am'], answer: 0,
      explain: 'either ... or ... 连接主语时用就近原则：离谓语最近的主语是 he，所以用 is。' }
  ],
  tests: [
    { type: 'choice', q: 'My parents are doctors. ___ of them work in the same hospital.', options: ['Both', 'All', 'Either'], answer: 0, explain: '父母是两个人，“两者都”用 Both；谓语 work 是复数，也排除 Either。' },
    { type: 'choice', q: '—Would you like tea or juice?<br>—___. Just a glass of water, please.', options: ['Neither', 'Both', 'Either'], answer: 0, explain: '只要一杯水，说明两样都不要，用 Neither。' },
    { type: 'choice', q: '—How many eggs are there in the fridge?<br>—___. Let\'s go and buy some.', options: ['None', 'Nobody', 'No one'], answer: 0, explain: 'How many 问数量，回答“一个也没有”用 None。' },
    { type: 'choice', q: '—Who is in the music room?<br>—___. Everyone has gone home.', options: ['Nobody', 'None', 'Neither'], answer: 0, explain: 'Who 问人，回答“没人”用 Nobody。' },
    { type: 'choice', q: 'There are many tall trees on ___ side of the street.', options: ['either', 'both', 'all'], answer: 0, explain: 'side 是单数，either side 表示“两边”；both 和 all 后面要接复数名词。' },
    { type: 'fill', q: 'I have three sisters. ___ of them are students.（填一个词，表示“都”，首字母大写）', answer: ['All'], explain: '三个人“都”，用 All。' },
    { type: 'fill', q: 'Neither Tom ___ Jim likes playing chess.（填一个词）', answer: ['nor'], explain: 'neither ... nor ... 表示“既不……也不……”。' },
    { type: 'choice', q: 'I bought two books yesterday, and ___ of them are about animals.', options: ['both', 'all', 'either'], answer: 0, explain: '两本书“都”用 both，谓语 are 是复数；all 用于三者以上；either 指其中任何一本，谓语应用单数。' },
    { type: 'choice', q: '听一听，喜欢早起的有几个人？', say: 'My grandparents both like getting up early.', options: ['两个人', '三个人', '没有人'], answer: 0, explain: 'grandparents 指爷爷奶奶（或外公外婆）两个人，both 表示“两者都”，所以是两个人都喜欢早起。' },
    { type: 'choice', q: 'There are 45 students in our class. ___ of them have joined the reading club.', options: ['All', 'Both', 'Either'], answer: 0, explain: '45 个人（三者以上）“都”，用 All；Both 和 Either 只用于两者。' },
    { type: 'choice', q: '—Which T-shirt do you want, the red one or the blue one?<br>—___ is OK. I like both colours.', options: ['Either', 'Neither', 'All'], answer: 0, explain: '两种颜色都喜欢，说明两件中“哪一件都行”，用 Either；Neither 是“都不”，与 I like both colours 矛盾；All 用于三者以上。' },
    { type: 'fill', q: 'You can sit at ___ end of the long table. Both ends are free.（填一个词，表示“两端中任何一端”）', answer: ['either'], explain: '两端中任何一端，用 either + 单数名词 end。' },
    { type: 'choice', q: 'People are standing on ___ sides of the road to watch the race.', options: ['both', 'either', 'each'], answer: 0, explain: '空后是复数 sides，用 both；either side 和 each side 后面都接单数名词。' },
    { type: 'choice', q: 'I have three pens. You can use ___ of them.', options: ['any', 'either', 'both'], answer: 0, explain: '三支笔中“任何一支”，用 any；either 和 both 用于两者。' },
    { type: 'fill', q: '—Which of these five books can I borrow?<br>—___ one you like.（填一个词，首字母大写，表示“任何一本”）', answer: ['Any'], explain: '五本书（三者以上）中的任何一本，用 any。' },
    { type: 'choice', q: 'I asked two classmates for help, but ___ of them knew the answer.', options: ['neither', 'none', 'both'], answer: 0, explain: '两个同学“都不”知道，用 neither；none 用于三者以上；both 意思是“都知道”，和 but 的转折不符。' },
    { type: 'fill', q: '—Do you want to go to the park or the zoo?<br>—___. I want to stay at home.（填一个词，首字母大写）', answer: ['Neither'], explain: '公园和动物园两个地方都不想去，用 Neither。' },
    { type: 'choice', q: '—How much milk is there in the bottle?<br>—___. I drank it all.', options: ['None', 'Nobody', 'No one'], answer: 0, explain: 'How much 问数量，回答“一点也没有”用 None；Nobody 和 No one 只指人，回答 Who。' },
    { type: 'choice', q: 'There are five people in the room, but ___ of them is talking.', options: ['none', 'neither', 'nobody'], answer: 0, explain: '五个人（三者以上）“都不”，用 none；neither 用于两者；nobody 后面不能接 of。' },
    { type: 'choice', q: '—Who can answer this question?<br>—___. It\'s too hard for us.', options: ['No one', 'None', 'Neither'], answer: 0, explain: 'Who 问人，回答“没人”用 No one（= Nobody）；None 回答 How many / How much。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Who is at the door?', options: ['Nobody. It\'s just the wind.', 'None. It\'s just the wind.', 'Neither. It\'s just the wind.'], answer: 0, explain: '问句是 Who（谁在门口），回答“没人”用 Nobody。' },
    { type: 'fill', q: '改错：<u>No one</u> of the students was late this morning.（把划线部分改正，填一个词）', answer: ['None'], explain: 'no one 后面不能接 of，要说 none of the students。' },
    { type: 'choice', q: 'We asked many people, but ___ of them could speak French.', options: ['none', 'no one', 'nobody'], answer: 0, explain: '后面有 of them，只能用 none；no one 和 nobody 不能和 of 连用。' },
    { type: 'choice', q: 'Both my father and my mother ___ doctors.', options: ['are', 'is', 'am'], answer: 0, explain: 'both A and B 作主语，谓语用复数 are。' },
    { type: 'fill', q: 'Tom likes swimming. Jim likes swimming, too.<br>→ ___ Tom and Jim like swimming.（填一个词，首字母大写）', answer: ['Both'], explain: '两个人都喜欢游泳，用 both ... and ...；谓语 like 是复数，也说明用 Both。' },
    { type: 'choice', q: 'You can come to see me ___ on Saturday or on Sunday.', options: ['either', 'neither', 'both'], answer: 0, explain: '“要么周六要么周日”，用 either ... or ...；neither 和 nor 搭配，both 和 and 搭配。' },
    { type: 'fill', q: 'You can go there by bus. Or you can go there by bike.<br>→ You can go there ___ by bus or by bike.（填一个词）', answer: ['either'], explain: '两种方式任选其一，合并为 either ... or ...（要么……要么……）。' },
    { type: 'fill', q: 'Tom doesn\'t like coffee. Lucy doesn\'t like coffee, either.<br>→ ___ Tom nor Lucy likes coffee.（填一个词，首字母大写）', answer: ['Neither'], explain: '两个人都不喜欢，用 neither ... nor ...（既不……也不……）。' },
    { type: 'choice', q: 'She can speak ___ English nor Japanese, but she speaks Chinese very well.', options: ['neither', 'either', 'both'], answer: 0, explain: '后面有 nor，固定搭配 neither ... nor ...。' },
    { type: 'choice', q: 'Neither you nor I ___ a teacher.', options: ['am', 'are', 'is'], answer: 0, explain: 'neither ... nor ... 连接主语时用就近原则，离谓语最近的是 I，所以用 am。' },
    { type: 'choice', q: 'Either Tom or his parents ___ going to the parents\' meeting.', options: ['are', 'is', 'am'], answer: 0, explain: '就近原则：离谓语最近的主语是 his parents（复数），所以用 are。' },
    { type: 'choice', q: 'Neither the students nor the teacher ___ in the classroom now.', options: ['is', 'are', 'am'], answer: 0, explain: '就近原则：离谓语最近的主语是 the teacher（单数），所以用 is。' }
  ]
},

{
  id: 'g-adj-ed-ing', title: '-ed 形容词与 -ing 形容词', short: '-ed/-ing 形容词', module: 'morph', grade: 8, freq: 3,
  prereqs: ['g-linking-verb'],
  tip: '短文填空高频：-ed 说“人的感受”，-ing 说“事物让人怎么样”；最常见的错是写成 I am boring（我是个无聊的人）。',
  learn: [
    { h: '核心规则', html: `<div class="rhyme">ed 说人感受，ing 说物特点。</div>
      <ul><li><b>-ed</b>：某人<b>感到</b>……，主语多是人</li>
      <li><b>-ing</b>：某事物<b>令人</b>……，主语多是物</li></ul>
      <p class="ex">The film is interesting. We are interested in it.<span class="zh">这部电影很有趣，我们对它很感兴趣。</span></p>
      <p class="ex">The match was exciting. Everyone was excited.<span class="zh">比赛很激动人心，大家都很激动。</span></p>` },
    { h: '常见的一组组', html: `<table class="tbl"><tr><th>-ed（人感到）</th><th>-ing（令人……的）</th></tr>
      <tr><td>interested 感兴趣的</td><td>interesting 有趣的</td></tr>
      <tr><td>excited 激动的</td><td>exciting 令人激动的</td></tr>
      <tr><td>bored 无聊的、厌倦的</td><td>boring 无聊的、乏味的</td></tr>
      <tr><td>surprised 惊讶的</td><td>surprising 令人惊讶的</td></tr>
      <tr><td>tired 疲倦的</td><td>tiring 令人疲倦的</td></tr>
      <tr><td>relaxed 放松的</td><td>relaxing 令人放松的</td></tr>
      <tr><td>amazed 惊奇的</td><td>amazing 令人惊奇的</td></tr>
      <tr><td>moved 感动的</td><td>moving 感人的</td></tr>
      <tr><td>frightened 害怕的</td><td>frightening 吓人的</td></tr>
      <tr><td>disappointed 失望的</td><td>disappointing 令人失望的</td></tr></table>` },
    { h: '固定搭配', html: `<ul>
      <li>be interested <b>in</b> 对……感兴趣</li>
      <li>be surprised <b>at</b> 对……感到惊讶</li>
      <li>be excited <b>about</b> 对……感到兴奋</li>
      <li>be tired <b>of</b> 厌倦…… / be bored <b>with</b> 对……厌烦</li>
      <li>be worried <b>about</b> 担心……</li></ul>
      <p class="ex">I was surprised at the news.<span class="zh">听到这个消息我很惊讶。</span></p>` },
    { h: '易错点', html: `<p class="warn">I am boring. 意思是“我这个人很无聊（让别人觉得乏味）”；想说“我觉得无聊”要说 I am bored.</p>
      <p>修饰表情、声音时，表示人的感受，也用 -ed：<span class="en">with a surprised look</span>（带着惊讶的表情），<span class="en">in an excited voice</span>（用激动的声音）。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'The story is so ___ that all of us want to read it again.', options: ['interesting', 'interested', 'interest'], answer: 0,
      explain: '主语是 the story（物），说它“有趣”，用 interesting。' },
    { type: 'fill', q: 'We were all ___ at the news.（surprise）', answer: ['surprised'],
      explain: '主语是人，表示“感到惊讶”，用 surprised；be surprised at 是固定搭配。' },
    { type: 'choice', q: 'Listening to soft music is very ___. It helps me fall asleep.', options: ['relaxing', 'relaxed', 'relax'], answer: 0,
      explain: '主语是“听轻音乐”这件事，说它“令人放松的”，用 -ing 形式 relaxing；relaxed 是人“感到放松的”。' },
    { type: 'fill', q: 'My brother is very interested ___ space. He reads books about it every day.（填一个介词）', answer: ['in'],
      explain: 'be interested in 对……感兴趣，是固定搭配。' },
    { type: 'choice', q: 'The children are excited ___ the coming school trip.', options: ['about', 'with', 'of'], answer: 0,
      explain: 'be excited about 对……感到兴奋，是固定搭配。' },
    { type: 'choice', q: 'I\'m tired ___ eating noodles every day. Let\'s have rice today.', options: ['of', 'at', 'about'], answer: 0,
      explain: 'be tired of 厌倦……（= be bored with），后面接名词或 doing。注意 be tired 单独用是“累”，加 of 才是“厌倦”。' },
    { type: 'fill', q: 'Don\'t be worried ___ the exam. You have prepared well.（填一个介词）', answer: ['about'],
      explain: 'be worried about 担心……，是固定搭配。' },
    { type: 'choice', q: '—How was the party?<br>—Terrible. Nobody talked to me, so I was ___.', options: ['bored', 'boring', 'bore'], answer: 0,
      explain: '“我感到无聊”要用 bored。如果说 I was boring，意思就变成“我这个人很乏味、让人觉得无聊”，这是最常见的错误。' },
    { type: 'choice', q: 'When she opened the box, she looked at it with a ___ look.', options: ['surprised', 'surprising', 'surprise'], answer: 0,
      explain: '表情（look）、声音（voice）表现的是人的感受，用 -ed 形式：with a surprised look 带着惊讶的表情。' }
  ],
  tests: [
    { type: 'choice', q: 'The film is very ___. I want to see it again.', options: ['interesting', 'interested', 'interest'], answer: 0, explain: '电影（物）“有趣的”，用 interesting。' },
    { type: 'choice', q: 'Tom is ___ in collecting stamps.', options: ['interested', 'interesting', 'interest'], answer: 0, explain: '人“感兴趣”，be interested in 是固定搭配。' },
    { type: 'fill', q: 'After walking for three hours, I felt very ___.（tire）', answer: ['tired'], explain: '人感到疲倦，用 tired。' },
    { type: 'fill', q: 'The football match was so ___ that everyone shouted loudly.（excite）', answer: ['exciting'], explain: '比赛（物）令人激动，用 exciting。' },
    { type: 'choice', q: 'The story is so ___ that many people cried.', options: ['moving', 'moved', 'move'], answer: 0, explain: '故事（物）“感人的”，用 moving。' },
    { type: 'choice', q: 'I was ___ to hear that our team won the first prize.', options: ['excited', 'exciting', 'excite'], answer: 0, explain: '主语是 I，表示“我感到激动”，用 excited。' },
    { type: 'choice', q: 'The class was so ___ that some students fell asleep.', options: ['boring', 'bored', 'bore'], answer: 0, explain: '主语是这节课（物），“乏味的”用 boring。' },
    { type: 'choice', q: 'The little girl was ___ when she saw a big snake in the grass.', options: ['frightened', 'frightening', 'fright'], answer: 0, explain: '主语是人（女孩），“感到害怕”用 frightened。' },
    { type: 'fill', q: 'We were ___ at the beautiful view of Gulangyu.（amaze）', answer: ['amazed'], explain: '主语是 we（人），“感到惊奇”用 amazed。' },
    { type: 'fill', q: 'The news was really ___. Nobody expected it.（surprise）', answer: ['surprising'], explain: '主语是 the news（物），“令人惊讶的”用 surprising。' },
    { type: 'fill', q: 'It was a ___ day. We walked for over ten kilometers.（tire）', answer: ['tiring'], explain: '修饰 day（物），“令人疲倦的一天”用 tiring。' },
    { type: 'choice', q: 'Our team lost the game. The result was very ___.', options: ['disappointing', 'disappointed', 'disappoint'], answer: 0, explain: '主语是 the result（物），“令人失望的”用 disappointing。' },
    { type: 'fill', q: 'Mom was ___ with my bad grades this term.（disappoint）', answer: ['disappointed'], explain: '主语是 Mom（人），“感到失望”用 disappointed。' },
    { type: 'fill', q: 'Many people were ___ to tears by the film.（move）', answer: ['moved'], explain: '主语是人，“被感动”用 moved；film 本身才是 moving（感人的）。' },
    { type: 'fill', q: 'After a hot bath, I felt ___.（relax）', answer: ['relaxed'], explain: '主语是 I，“感到放松”用 relaxed。' },
    { type: 'choice', q: '听一听，说话人现在感觉怎么样？', say: 'I am so bored. There is nothing to do at home.', options: ['觉得无聊', '觉得兴奋', '觉得惊讶'], answer: 0, explain: '听到 I am so bored，bored 是“感到无聊的”。' },
    { type: 'choice', q: 'The boy is interested ___ making model planes.', options: ['in', 'at', 'about'], answer: 0, explain: 'be interested in 对……感兴趣，in 后面接名词或 doing。' },
    { type: 'choice', q: 'Everyone was surprised ___ his great progress in English.', options: ['at', 'in', 'of'], answer: 0, explain: 'be surprised at 对……感到惊讶，是固定搭配。' },
    { type: 'choice', q: 'The students are very ___ about the school trip to Wuyi Mountain.', options: ['excited', 'exciting', 'excite'], answer: 0, explain: '主语是学生（人），be excited about 对……感到兴奋。' },
    { type: 'fill', q: 'We\'re all excited ___ the coming Spring Festival.（填一个介词）', answer: ['about'], explain: 'be excited about 对……感到兴奋。' },
    { type: 'choice', q: 'Tom is bored ___ playing the same games every day.', options: ['with', 'in', 'at'], answer: 0, explain: 'be bored with 对……感到厌烦，是固定搭配。' },
    { type: 'fill', q: 'I\'m tired ___ hearing the same story again and again.（填一个介词）', answer: ['of'], explain: 'be tired of 厌倦……，后接 doing。' },
    { type: 'choice', q: 'Mom is ___ about my health because I often stay up late.', options: ['worried', 'worrying', 'worry'], answer: 0, explain: '主语是人，be worried about 担心……。' },
    { type: 'fill', q: 'Grandpa is worried ___ the weather. He wants to go fishing tomorrow.（填一个介词）', answer: ['about'], explain: 'be worried about 担心……。' },
    { type: 'fill', q: '改错：The film was so long that I was <u>boring</u>.（把划线词改正）', answer: ['bored'], explain: '说“我感到无聊”要用 bored；I was boring 意思是“我这个人很乏味”。' },
    { type: 'choice', q: '—What\'s wrong with Jack?<br>—He has nothing to do at home, so he feels ___.', options: ['bored', 'boring', 'bore'], answer: 0, explain: 'feel 后面说人的感受，用 bored（感到无聊）；he feels boring 是错误说法。' },
    { type: 'choice', q: 'He told us the good news in an ___ voice.', options: ['excited', 'exciting', 'excite'], answer: 0, explain: '声音表现的是说话人的感受，in an excited voice 用激动的声音。' },
    { type: 'fill', q: 'She watched the magic show with an ___ look on her face.（amaze）', answer: ['amazed'], explain: '脸上的表情表现人的感受，用 -ed 形式：with an amazed look。' }
  ]
},

{
  id: 'g-word-form', title: '构词法与词性转换', short: '构词法', module: 'morph', grade: 8, freq: 3,
  prereqs: ['g-adj-adv', 'g-plural'],
  tip: '短文填空的核心技能：先看空格位置判断需要什么词性，再用前缀、后缀变形；注意 un-、-less 会让意思变成反义。',
  learn: [
    { h: '第一步：看位置定词性', html: `<table class="tbl"><tr><th>空格位置</th><th>需要</th><th>例子</th></tr>
      <tr><td>冠词、物主代词、形容词后</td><td>名词</td><td>your <b>kindness</b>, a great <b>invention</b></td></tr>
      <tr><td>be 动词、系动词后；名词前</td><td>形容词</td><td>It's <b>rainy</b>. a <b>helpful</b> boy</td></tr>
      <tr><td>修饰动词、形容词、整句</td><td>副词</td><td>answer <b>carefully</b></td></tr></table>
      <div class="rhyme">名前形，动后副，冠词后面找名词。</div>` },
    { h: '常用后缀', html: `<p><b>变名词</b></p>
      <p class="small">表示人：teach → teacher, sing → singer, visit → visitor, invent → inventor, act → actor, science → scientist, piano → pianist<br>
      动词变名词：invent → invention, discuss → discussion, decide → decision, develop → development, agree → agreement, educate → education<br>
      形容词变名词：kind → kindness, happy → happiness, ill → illness, difficult → difficulty, important → importance, true → truth, strong → strength, long → length, healthy → health</p>
      <p><b>变形容词</b></p>
      <p class="small">-y：rain → rainy, sun → sunny, wind → windy, health → healthy, luck → lucky<br>
      -ful / -less：help → helpful / helpless, care → careful / careless, use → useful / useless<br>
      -ly：friend → friendly, love → lovely<br>
      其他：danger → dangerous, music → musical, tradition → traditional, comfort → comfortable, China → Chinese, America → American</p>
      <p><b>变副词</b>：形容词 + ly</p>
      <p class="small">quick → quickly, careful → carefully, happy → happily, easy → easily, true → truly, gentle → gently；特殊：good → well</p>` },
    { h: '常用前缀（变反义）', html: `<ul>
      <li><b>un-</b>：happy → unhappy, lucky → unlucky, usual → unusual</li>
      <li><b>dis-</b>：like → dislike, agree → disagree</li>
      <li><b>im- / in-</b>：possible → impossible, polite → impolite, correct → incorrect</li>
      <li><b>re-</b>（再）：use → reuse, build → rebuild</li></ul>
      <p class="ex">It is impossible to finish the work in an hour.<span class="zh">一小时内完成这项工作是不可能的。</span></p>` },
    { h: '易错点', html: `<ul>
      <li><b>friendly, lovely, lonely</b> 是形容词，不是副词：<span class="en">She is friendly to us.</span></li>
      <li>注意句意是褒是贬：总忘带钥匙是 <b>careless</b>，不是 careful。</li>
      <li>名词填空还要想单复数：<span class="en">two great inventions</span>。</li></ul>` }
  ],
  examples: [
    { type: 'fill', q: 'Please listen ___. This is very important.（careful）', answer: ['carefully'],
      explain: '修饰动词 listen，要用副词 carefully。' },
    { type: 'fill', q: 'Lily failed the exam and felt very ___.（happy，用反义词）', answer: ['unhappy'],
      explain: '考试没过，心情不好；be/系动词后用形容词，加前缀 un- 变成反义 unhappy。' },
    { type: 'choice', q: 'Thank you for your ___.', options: ['kindness', 'kind', 'kindly'], answer: 0,
      explain: '物主代词 your 后面要用名词，kind 变名词是 kindness。' },
    { type: 'fill', q: 'My cousin loves science. He wants to be a ___ when he grows up.（science）', answer: ['scientist'],
      explain: '冠词 a 后面要用名词，而且这里说的是“人”（长大想当……）。science 加后缀 -ist 变成 scientist（科学家），类似的还有 piano → pianist。' },
    { type: 'fill', q: 'We had a long ___ about the school trip in class.（discuss）', answer: ['discussion'],
      explain: '形容词 long 后面要用名词。discuss 是动词，加 -ion 变名词 discussion；类似的有 invent → invention, decide → decision。' },
    { type: 'fill', q: 'It\'s ___ today. Let\'s go and fly kites!（wind）', answer: ['windy'],
      explain: 'be 动词后用形容词。表示天气的名词加 -y 变形容词：wind → windy，rain → rainy，sun → sunny（双写 n）。' },
    { type: 'fill', q: 'This book is very ___. I learned a lot from it.（use）', answer: ['useful'],
      explain: 'be 动词后用形容词。“学到很多”说明书“有用的”，use + -ful = useful；反义 useless（没用的）。' },
    { type: 'fill', q: 'Dumplings are a ___ food for the Spring Festival.（tradition）', answer: ['traditional'],
      explain: '名词 food 前面要用形容词。tradition 加 -al 变形容词 traditional（传统的）；类似的有 music → musical。' },
    { type: 'fill', q: 'Lily is a good singer. She sings very ___.（good）', answer: ['well'],
      explain: '修饰动词 sings 要用副词。good 的副词是特殊的 well，不能写成 goodly。' },
    { type: 'fill', q: 'I don\'t think the plan is good. I ___ with you.（agree，用反义词）', answer: ['disagree'],
      explain: '句意是“我不同意你的看法”，agree 加前缀 dis- 变成反义词 disagree；类似的有 like → dislike。' },
    { type: 'fill', q: 'It\'s ___ to finish so much work in ten minutes.（possible，用反义词）', answer: ['impossible'],
      explain: '十分钟完成这么多工作是“不可能的”。possible 的反义词加 im-：impossible；polite → impolite 也加 im-，correct → incorrect 加 in-。' },
    { type: 'fill', q: 'Don\'t throw away these plastic bottles. We can ___ them.（use，表示“再次使用”）', answer: ['reuse'],
      explain: '前缀 re- 表示“再、又”：use → reuse（再利用），build → rebuild（重建）。' },
    { type: 'choice', q: 'The old man smiled at us in a ___ way.', options: ['friendly', 'friend', 'friendily'], answer: 0,
      explain: 'friendly 以 -ly 结尾，但它是形容词（友好的），不是副词，也没有 friendlily 这类形式。要表达“友好地”，常说 in a friendly way，名词 way 前用形容词 friendly。' },
    { type: 'fill', q: 'Tom often makes small mistakes in his homework because he is ___.（care）', answer: ['careless'],
      explain: '经常犯小错误，说明他“粗心的”，是贬义，用 careless；careful 是“细心的”，意思正好相反。填空前一定要看清句意是褒是贬。' },
    { type: 'fill', q: 'Paper and the compass are two great ___ of ancient China.（invent）', answer: ['inventions'],
      explain: 'great 后面要用名词。invent 变名词有两种：invention（发明物）和 inventor（发明家）。纸和指南针是“发明物”，前面有 two，要用复数 inventions。' }
  ],
  tests: [
    { type: 'fill', q: 'The boy answered the teacher\'s question ___.（careful）', answer: ['carefully'], explain: '修饰动词 answered，用副词 carefully。' },
    { type: 'fill', q: 'It\'s ___ today. Don\'t forget to take an umbrella.（rain）', answer: ['rainy'], explain: 'be 动词后用形容词，rain 变形容词是 rainy。' },
    { type: 'fill', q: 'Edison was one of the greatest ___ in the world.（invent）', answer: ['inventors'], explain: 'one of the + 最高级 + 复数名词；“发明家”是 inventor，要用复数 inventors。' },
    { type: 'choice', q: 'It\'s ___ to cross the road when the light is red.', options: ['dangerous', 'danger', 'dangerously'], answer: 0, explain: 'It\'s 后面需要形容词，danger 变形容词是 dangerous。' },
    { type: 'fill', q: 'Don\'t be so ___! You left your keys at home again.（care）', answer: ['careless'], explain: '总把钥匙落在家里，是“粗心的”，用 careless。' },
    { type: 'choice', q: 'Eating too much junk food is bad for our ___.', options: ['health', 'healthy', 'healthily'], answer: 0, explain: '物主代词 our 后面要用名词 health。' },
    { type: 'choice', q: 'Miss Wang is very ___. All the students like her.', options: ['friendly', 'friend', 'friendship'], answer: 0, explain: 'be 动词后用形容词，friendly 是形容词“友好的”。' },
    { type: 'fill', q: 'I\'m sorry to hear about your grandpa\'s ___. I hope he gets better soon.（ill）', answer: ['illness'], explain: '名词所有格 grandpa\'s 后面要用名词，ill 加 -ness 变 illness（疾病）。' },
    { type: 'fill', q: 'Money can\'t buy ___.（happy）', answer: ['happiness'], explain: 'buy 后面作宾语要用名词，happy 变名词时 y 变 i 再加 -ness：happiness。' },
    { type: 'fill', q: 'I had some ___ in learning maths, but my teacher helped me.（difficult）', answer: ['difficulty', 'difficulties'], explain: 'some 后面要用名词，difficult 的名词是 difficulty；have difficulty (in) doing sth 表示“做某事有困难”，用复数 difficulties 也可以。' },
    { type: 'fill', q: 'The children are playing ___ in the park.（happy）', answer: ['happily'], explain: '修饰动词 are playing 要用副词，happy 变副词时 y 变 i 再加 -ly：happily。' },
    { type: 'fill', q: 'The baby is sleeping. Please close the door ___.（gentle）', answer: ['gently'], explain: '修饰动词 close 要用副词。gentle 以 -le 结尾，去 e 加 y：gently。' },
    { type: 'fill', q: 'Lang Lang plays the piano very well. He is a famous ___.（piano）', answer: ['pianist'], explain: '冠词 a 和形容词 famous 后面要用名词，表示“人”：piano → pianist（钢琴家）。' },
    { type: 'fill', q: 'Many ___ come to the museum every weekend.（visit）', answer: ['visitors'], explain: 'Many 后面要用复数名词，“参观者”是 visitor，用复数 visitors。' },
    { type: 'fill', q: 'We must make a ___ quickly. There isn\'t much time left.（decide）', answer: ['decision'], explain: '冠词 a 后面要用名词，decide 的名词是 decision（make a decision 做决定），注意拼写：去 de 加 sion。' },
    { type: 'fill', q: 'The ___ of our city has been very fast in recent years.（develop）', answer: ['development'], explain: 'the 后面要用名词，develop 加 -ment 变名词 development（发展）。' },
    { type: 'fill', q: 'Please tell me the ___. Did you break the window?（true）', answer: ['truth'], explain: 'the 后面要用名词，true 的名词是特殊形式 truth（真相）。' },
    { type: 'fill', q: 'It\'s ___ today, so we can play football outside.（sun）', answer: ['sunny'], explain: 'be 动词后用形容词，sun 变形容词要双写 n 再加 -y：sunny。' },
    { type: 'fill', q: 'You are so ___ to win the first prize!（luck）', answer: ['lucky'], explain: 'be 动词后用形容词，luck 加 -y 变 lucky（幸运的）。' },
    { type: 'fill', q: 'This map is very ___ for travellers. It shows every street.（help）', answer: ['helpful'], explain: 'be 动词后用形容词，地图“有帮助的”是褒义，用 helpful。' },
    { type: 'fill', q: 'My old phone is ___ now. It doesn\'t work at all.（use）', answer: ['useless'], explain: '手机完全不能用了，是“没用的”，use 加 -less 变 useless。' },
    { type: 'fill', q: 'What a ___ little dog! I like it very much.（love）', answer: ['lovely'], explain: '名词 dog 前用形容词，love 加 -ly 变形容词 lovely（可爱的）。' },
    { type: 'fill', q: 'Our new neighbours are very ___ to us.（friend）', answer: ['friendly'], explain: 'be 动词后用形容词，be friendly to sb 对某人友好。friendly 虽然以 -ly 结尾，却是形容词。' },
    { type: 'choice', q: 'Which of the following words is an adjective, NOT an adverb?', options: ['lovely', 'quickly', 'happily'], answer: 0, explain: 'lovely 是名词 love 加 -ly 变成的形容词（可爱的）；quickly 和 happily 是形容词加 -ly 变成的副词。' },
    { type: 'fill', q: 'This sofa is soft and very ___.（comfort）', answer: ['comfortable'], explain: 'be 动词后用形容词，comfort 加 -able 变 comfortable（舒适的）。' },
    { type: 'fill', q: 'Mike was born in New York. He is ___.（America）', answer: ['American'], explain: 'be 动词后用形容词，表示国籍：America → American（美国的；美国人）。' },
    { type: 'fill', q: 'Tom can play three instruments. He is very ___.（music）', answer: ['musical'], explain: 'be 动词后用形容词，music 加 -al 变 musical（有音乐天赋的）。' },
    { type: 'fill', q: 'Tom plays football very ___. He is the best player in our class.（good）', answer: ['well'], explain: '修饰动词 plays 要用副词，good 的副词是 well。' },
    { type: 'fill', q: 'The question is simple. I can answer it ___.（easy）', answer: ['easily'], explain: '修饰动词 answer 要用副词，easy 变副词时 y 变 i 再加 -ly：easily。' },
    { type: 'fill', q: 'It\'s ___ for Tom to be late. He is always on time.（usual，用反义词）', answer: ['unusual'], explain: '汤姆总是准时，迟到是“不寻常的”，usual 加 un- 变 unusual。' },
    { type: 'fill', q: 'The ___ boy lost his wallet again on the bus.（lucky，用反义词）', answer: ['unlucky'], explain: '又丢了钱包，是“不幸的”，lucky 加 un- 变 unlucky。' },
    { type: 'choice', q: 'Tom thinks the film is boring, but I ___ with him. I think it\'s great.', options: ['disagree', 'unagree', 'imagree'], answer: 0, explain: 'agree 的反义词加前缀 dis-：disagree。没有 unagree 和 imagree 这样的词。' },
    { type: 'fill', q: 'Many kids ___ doing housework, but it\'s good for them.（like，用反义词）', answer: ['dislike'], explain: '“不喜欢做家务”，like 加 dis- 变 dislike；主语 kids 是复数，用原形。' },
    { type: 'fill', q: 'It\'s ___ to talk loudly in the library.（polite，用反义词）', answer: ['impolite'], explain: '在图书馆大声说话是“不礼貌的”，polite 加 im- 变 impolite。' },
    { type: 'fill', q: 'Your answer is ___. Please check it and try again.（correct，用反义词）', answer: ['incorrect'], explain: '要重新检查，说明答案“不正确”，correct 加 in- 变 incorrect。' },
    { type: 'fill', q: 'The old bridge was broken by the flood, so the workers had to ___ it.（build，表示“重新建造”）', answer: ['rebuild'], explain: '前缀 re- 表示“再、重新”，build → rebuild；had to 后面用动词原形。' },
    { type: 'choice', q: 'We should ___ plastic bags to protect the environment.', options: ['reuse', 'unuse', 'disuse'], answer: 0, explain: '“再利用”塑料袋，use 加前缀 re- 变 reuse；unuse 不是英语单词，disuse 意思是“废弃、不用”，和保护环境的句意不符。' },
    { type: 'fill', q: 'Jack is very ___. He checks his homework twice and never makes mistakes.（care）', answer: ['careful'], explain: '从不犯错是褒义，“细心的”用 careful；careless 是“粗心的”。' },
    { type: 'fill', q: 'The little bird hurt its wing and was ___. It couldn\'t fly at all.（help）', answer: ['helpless'], explain: '受了伤、飞不起来，是“无助的”，help 加 -less 变 helpless；-less 表示“没有……的”。' },
    { type: 'fill', q: 'Many ___ are working hard on the new medicine.（science）', answer: ['scientists'], explain: 'Many 后面用复数名词，“科学家”是 scientist，复数 scientists。' }
  ]
},

{
  id: 'g-bare-inf', title: '省略 to 的不定式：let / make / see / hear', short: '省 to 不定式', module: 'morph', grade: 8, freq: 3,
  prereqs: ['g-infinitive'],
  tip: '中考高频：let / make / have 和感官动词后接 do；但变成被动语态时，to 要“还原”回来，这是最大的陷阱。',
  learn: [
    { h: '口诀', html: `<div class="rhyme">一感二听三让四看，<br>后面不定式不带 to；<br>help 后面 to 可有可无。</div>
      <ul><li>一感：<b>feel</b></li>
      <li>二听：<b>hear, listen to</b></li>
      <li>三让：<b>let, make, have</b></li>
      <li>四看：<b>see, watch, notice, look at</b></li></ul>` },
    { h: '使役动词 let / make / have', html: `<p>结构：let / make / have + 宾语 + <b>动词原形</b></p>
      <p class="ex">My mother makes me clean my room every day.<span class="zh">妈妈每天让我打扫房间。</span></p>
      <p class="ex">Let me help you.<span class="zh">让我来帮你。</span></p>
      <p class="small">make 后面也可以接形容词：The news made us happy.（这消息让我们很开心。）</p>` },
    { h: '感官动词 see / hear / watch', html: `<p>感官动词 + 宾语 + <b>do</b>：看到 / 听到<b>动作全过程</b>（或经常发生）</p>
      <p>感官动词 + 宾语 + <b>doing</b>：看到 / 听到<b>正在进行</b>的动作</p>
      <p class="ex">I saw him cross the road.<span class="zh">我看见他过了马路。（全过程）</span></p>
      <p class="ex">Listen! Can you hear someone singing?<span class="zh">听！你能听到有人在唱歌吗？（正在唱）</span></p>` },
    { h: '其他不带 to 的结构', html: `<ul>
      <li><b>had better (not) do</b>：最好（不）做 —— You'd better go to bed early.</li>
      <li><b>Why not do ...? / Why don't you do ...?</b>：为什么不……</li>
      <li><b>would rather do</b>：宁愿做</li>
      <li><b>help sb (to) do</b>：to 可要可不要</li></ul>` },
    { h: '易错点：被动语态要还原 to', html: `<p>主动句里省掉的 to，变成被动后要<b>加回来</b>：</p>
      <p class="ex">The teacher made him stand up. He was made to stand up.<span class="zh">老师让他站起来。他被要求站起来。</span></p>
      <p class="ex">Someone saw the boy enter the room. The boy was seen to enter the room.<span class="zh">有人看见那男孩进了房间。</span></p>
      <p class="warn">let 一般不用于被动；“had better”后面直接接动词原形，不能写 had better to do。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'The funny story made all of us ___.', options: ['laugh', 'to laugh', 'laughed'], answer: 0,
      explain: 'make + 宾语 + 动词原形，用 laugh。' },
    { type: 'choice', q: 'The boy was made ___ the windows after school.', options: ['to clean', 'clean', 'cleaned'], answer: 0,
      explain: '被动语态 be made 后面要还原 to，用 to clean。' },
    { type: 'choice', q: 'Suddenly I felt something ___ my leg. It was a cat!', options: ['touch', 'to touch', 'touched'], answer: 0,
      explain: '“一感”：feel + 宾语 + 动词原形，表示感觉到某事发生。不能带 to，也不能用过去式。（若强调“正在碰”，也可以用 touching。）' },
    { type: 'choice', q: 'I often hear her ___ in the next room.', options: ['sing', 'to sing', 'sang'], answer: 0,
      explain: '“二听”：hear + 宾语 + 动词原形，表示听到经常发生的或完整的动作；不带 to。' },
    { type: 'choice', q: 'Please let me ___ your new bike.', options: ['try', 'to try', 'trying'], answer: 0,
      explain: '“三让”：let + 宾语 + 动词原形，let me try 让我试试。' },
    { type: 'choice', q: 'Our teacher had us ___ a short story about our summer holiday.', options: ['write', 'to write', 'wrote'], answer: 0,
      explain: '“三让”之一 have：have sb do sth 让某人做某事，用动词原形 write。' },
    { type: 'choice', q: 'I saw the old man ___ the street just now.', options: ['cross', 'to cross', 'crossed'], answer: 0,
      explain: '“四看”：see + 宾语 + 动词原形，表示看到动作的全过程（他过了马路）。' },
    { type: 'choice', q: 'The good news made everyone ___.', options: ['happy', 'happily', 'happiness'], answer: 0,
      explain: 'make 后面除了接“宾语 + 动词原形”，也可以接“宾语 + 形容词”，表示“使某人处于某种状态”：make everyone happy。' },
    { type: 'choice', q: 'Look! I can see some kids ___ kites in the park.', options: ['flying', 'to fly', 'flew'], answer: 0,
      explain: 'Look! 说明动作此刻正在进行，see sb doing 表示看到某人正在做某事；see sb do 才表示看到全过程。' },
    { type: 'choice', q: 'You\'d better ___ too much sugar. It\'s bad for your teeth.', options: ['not eat', 'not to eat', 'don\'t eat'], answer: 0,
      explain: 'had better (not) do：否定直接在 had better 后面加 not，再接动词原形；不能带 to，也不能用 don\'t。' },
    { type: 'choice', q: 'You have a bad cold. Why don\'t you ___ a doctor?', options: ['see', 'to see', 'seeing'], answer: 0,
      explain: 'Why don\'t you do ...? = Why not do ...?，都接动词原形，表示建议。' },
    { type: 'choice', q: 'It\'s raining. I would rather ___ at home than go out.', options: ['stay', 'to stay', 'staying'], answer: 0,
      explain: 'would rather do ... than do ... 宁愿做……而不愿做……，前后都用动词原形。' },
    { type: 'fill', q: 'My sister often helps me ___ my homework.（do，写出一种正确形式即可）', answer: ['do', 'to do'],
      explain: 'help sb (to) do sth，to 可要可不要，所以填 do 或 to do 都对。' },
    { type: 'choice', q: 'The boy was seen ___ the building at ten last night.', options: ['to enter', 'enter', 'entered'], answer: 0,
      explain: '主动句 Someone saw the boy enter ... 中省掉的 to，变成被动 was seen 后要还原：was seen to enter。' },
    { type: 'choice', q: '下列句子正确的是哪一句？', options: ['You\'d better go now.', 'You\'d better to go now.', 'You\'d better going now.'], answer: 0,
      explain: 'had better 后面直接接动词原形，不能写成 had better to do，也不能接 doing。' }
  ],
  tests: [
    { type: 'choice', q: 'My mother often makes me ___ my bedroom.', options: ['clean', 'to clean', 'cleaning'], answer: 0, explain: 'make sb do sth，用动词原形 clean。' },
    { type: 'choice', q: 'Let\'s ___ for a walk after dinner.', options: ['go', 'to go', 'going'], answer: 0, explain: 'let 后面接动词原形 go。' },
    { type: 'choice', q: 'Listen! Can you hear someone ___ in the next room?', options: ['singing', 'to sing', 'sings'], answer: 0, explain: 'Listen! 表示正在发生，hear sb doing 表示听到某人正在做某事。' },
    { type: 'choice', q: 'The students were made ___ the classroom by the teacher.', options: ['to clean', 'clean', 'cleaning'], answer: 0, explain: '被动语态 be made to do，to 要还原。' },
    { type: 'fill', q: 'You look tired. You\'d better ___ to bed early.（go）', answer: ['go'], explain: 'had better 后面接动词原形。' },
    { type: 'fill', q: 'Why not ___ a bike to school? It\'s good exercise.（ride）', answer: ['ride'], explain: 'Why not 后面接动词原形。' },
    { type: 'choice', q: 'Could you help me ___ this heavy box?', options: ['carry', 'carried', 'carrying'], answer: 0, explain: 'help sb (to) do sth，用动词原形 carry。' },
    { type: 'choice', q: 'Did you feel the house ___ just now? I think it was an earthquake.', options: ['shake', 'to shake', 'shook'], answer: 0, explain: 'feel + 宾语 + 动词原形，感觉到某事发生；不能带 to，也不能用过去式。' },
    { type: 'fill', q: 'Before the race, I could feel my heart ___ fast.（beat，填一个词）', answer: ['beat', 'beating'], explain: 'feel sb/sth do（感到发生了）或 feel sb/sth doing（感到正在发生），所以 beat 和 beating 都可以；不能带 to。' },
    { type: 'choice', q: 'I heard him ___ the door and go out.', options: ['open', 'to open', 'opened'], answer: 0, explain: 'hear + 宾语 + 动词原形，听到完整的动作；后面并列的 go 也是原形，可以帮助判断。' },
    { type: 'fill', q: 'We often listen to the birds ___ in the morning.（sing，填一个词）', answer: ['sing', 'singing'], explain: 'listen to sb do 表示经常听到，listen to sb doing 表示听到正在进行，这里两种都说得通；不能带 to。' },
    { type: 'choice', q: 'My parents won\'t let me ___ out alone at night.', options: ['go', 'to go', 'going'], answer: 0, explain: 'let + 宾语 + 动词原形。' },
    { type: 'choice', q: '听一听，说话人想做什么？', say: 'That box looks heavy. Let me help you carry it.', options: ['帮对方搬箱子', '让对方帮自己搬箱子', '去买一个箱子'], answer: 0, explain: 'Let me help you carry it. 意思是“让我帮你搬吧”，let me 后接动词原形 help，help you 后接原形 carry。' },
    { type: 'fill', q: 'The heavy rain made us ___ at home all day.（stay）', answer: ['stay'], explain: 'make sb do sth，用动词原形 stay。' },
    { type: 'choice', q: 'Mr. Wang had the students ___ the windows after the class meeting.', options: ['clean', 'to clean', 'cleaned'], answer: 0, explain: 'have sb do sth 让某人做某事，学生是动作的执行者，用动词原形 clean。' },
    { type: 'fill', q: 'Tom isn\'t in now. I\'ll have him ___ you back later.（call）', answer: ['call'], explain: 'have sb do sth，用动词原形 call；call sb back 给某人回电话。' },
    { type: 'choice', q: 'We watched the boys ___ basketball for a while and then went home.', options: ['play', 'to play', 'played'], answer: 0, explain: 'watch + 宾语 + 动词原形，不带 to，不用过去式。' },
    { type: 'choice', q: 'Did you notice anyone ___ into the room?', options: ['come', 'to come', 'came'], answer: 0, explain: 'notice 也属于“四看”，notice sb do sth 注意到某人做某事，用动词原形。' },
    { type: 'choice', q: 'The long walk made me very ___.', options: ['tired', 'tiredly', 'tire'], answer: 0, explain: 'make + 宾语 + 形容词，表示“使某人……”，用形容词 tired。' },
    { type: 'fill', q: 'Soft music always makes me ___.（relax，填形容词）', answer: ['relaxed'], explain: 'make sb + 形容词；说人“感到放松”用 relaxed。' },
    { type: 'choice', q: '“我看见他过了马路。”（看到全过程）正确的英文是哪一句？', options: ['I saw him cross the road.', 'I saw him to cross the road.', 'I saw him crossed the road.'], answer: 0, explain: '看到动作的全过程用 see sb do，动词原形 cross。' },
    { type: 'choice', q: '“听！我听到有人正在敲门。”正确的英文是哪一句？', options: ['Listen! I can hear someone knocking at the door.', 'Listen! I can hear someone to knock at the door.', 'Listen! I can hear someone knocked at the door.'], answer: 0, explain: '“正在敲”表示动作正在进行，用 hear sb doing：knocking。' },
    { type: 'choice', q: 'When I walked past the classroom, I heard someone ___ an English song.', options: ['singing', 'to sing', 'sang'], answer: 0, explain: '我经过时那首歌正在唱着，hear sb doing 表示听到正在进行的动作；不能带 to，也不能用过去式。' },
    { type: 'choice', q: 'You\'d better not ___ in the river. It\'s dangerous.', options: ['swim', 'to swim', 'swimming'], answer: 0, explain: 'had better not + 动词原形。' },
    { type: 'fill', q: '改错：It looks like rain. You had better <u>to take</u> an umbrella.（把划线部分改正）', answer: ['take'], explain: 'had better 后面直接接动词原形，to 要去掉。' },
    { type: 'choice', q: 'Why don\'t you ___ a walk after dinner? It\'s good for your health.', options: ['take', 'to take', 'taking'], answer: 0, explain: 'Why don\'t you + 动词原形，表示建议。' },
    { type: 'choice', q: 'I would rather ___ a book than watch TV.', options: ['read', 'to read', 'reading'], answer: 0, explain: 'would rather do ... than do ...，用动词原形 read。' },
    { type: 'fill', q: 'It\'s too cold. She\'d rather ___ ___ out today.（not go，填两个词）', answer: ['not go'], explain: 'would rather 的否定是 would rather not do，not 直接放在动词原形前。' },
    { type: 'fill', q: 'The volunteers helped the old man ___ the busy street.（cross，填一个词）', answer: ['cross'], explain: 'help sb (to) do sth；题目要求填一个词，填动词原形 cross。' },
    { type: 'choice', q: 'The thief was seen ___ the shop with a big bag.', options: ['to leave', 'leave', 'left'], answer: 0, explain: '感官动词 see 用于被动时要还原 to：be seen to do。' },
    { type: 'fill', q: 'The boss made the workers work ten hours a day.<br>→ The workers were made ___ ___ ten hours a day.（填两个词）', answer: ['to work'], explain: '主动句 make sb do，变成被动 be made to do，to 要还原。' },
    { type: 'choice', q: '“老师让我们提早回家。”正确的英文是哪一句？', options: ['The teacher let us go home early.', 'We were let to go home early by the teacher.', 'The teacher let us to go home early.'], answer: 0, explain: 'let 一般不用于被动语态，直接用主动句 let sb do；let 后面也不能带 to。（想用被动可以说 We were allowed to go home early.）' }
  ]
},

{
  id: 'g-to-vs-ing', title: 'to do 与 doing 的区别', short: 'to do 与 doing', module: 'morph', grade: 8, freq: 3,
  prereqs: ['g-infinitive', 'g-gerund'],
  tip: '中考高频：要背哪些动词接 to do、哪些接 doing；stop / forget / remember 接两种意思不同，是语法选择的常客。',
  learn: [
    { h: '只接 to do 的动词', html: `<p>大多表示“打算、愿望、决定”——事情<b>还没做</b>：</p>
      <p class="small">want, would like, hope, wish, decide, plan, agree, refuse, learn, expect, choose, offer, manage, fail, prepare</p>
      <div class="rhyme">想要希望和打算，决定同意或拒绝，<br>事情还没做，后面跟 to do。</div>
      <p class="ex">I hope to see you again soon.<span class="zh">我希望很快再见到你。</span></p>` },
    { h: '只接 doing 的动词', html: `<p class="small">enjoy, finish, mind, practice, keep, avoid, miss, consider, suggest, give up, feel like, can't help, be busy</p>
      <div class="rhyme">喜欢完成不介意，练习坚持别错过；<br>建议考虑和放弃，忙着做事接 doing。</div>
      <p class="ex">Would you mind opening the window?<span class="zh">你介意打开窗户吗？</span></p>
      <p class="ex">We practice speaking English every day.<span class="zh">我们每天练习说英语。</span></p>
      <p class="warn">介词后面一律用 doing：look forward to hearing from you（这里的 to 是介词）、be good at swimming、thanks for helping me。</p>` },
    { h: '两种都能接，意思不同', html: `<table class="tbl"><tr><th>结构</th><th>意思</th></tr>
      <tr><td>stop to do</td><td>停下来<b>去做另一件事</b></td></tr>
      <tr><td>stop doing</td><td>停止<b>正在做的事</b></td></tr>
      <tr><td>remember / forget to do</td><td>记得 / 忘记<b>要去做</b>（还没做）</td></tr>
      <tr><td>remember / forget doing</td><td>记得 / 忘记<b>做过</b>（已经做了）</td></tr>
      <tr><td>try to do</td><td>努力、设法做</td></tr>
      <tr><td>try doing</td><td>试着做（看看效果）</td></tr></table>
      <p class="ex">He was tired, so he stopped to have a rest.<span class="zh">他累了，就停下来休息。</span></p>
      <p class="ex">Stop talking. The class has begun.<span class="zh">别说话了，上课了。</span></p>
      <p class="ex">Don't forget to turn off the lights.<span class="zh">别忘了关灯。（还没关）</span></p>` },
    { h: '意思差别不大的', html: `<p>like, love, hate, begin, start 接 to do 和 doing 都可以，意思差别不大：</p>
      <p class="ex">It began to rain. It began raining.<span class="zh">开始下雨了。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: 'We have decided ___ the science museum this weekend.', options: ['to visit', 'visiting', 'visit'], answer: 0,
      explain: 'decide to do sth，决定做某事。' },
    { type: 'choice', q: '—The music is too loud.<br>—Sorry. I\'ll stop ___ it at once.', options: ['playing', 'to play', 'play'], answer: 0,
      explain: '停止正在放的音乐，用 stop doing。' },
    { type: 'choice', q: 'My grandpa enjoys ___ tea with his friends in the park.', options: ['drinking', 'to drink', 'drink'], answer: 0,
      explain: 'enjoy 属于只接 doing 的动词（喜欢完成不介意……），enjoy doing sth 喜欢做某事。' },
    { type: 'fill', q: 'Thanks for ___ me with my English.（help）', answer: ['helping'],
      explain: 'for 是介词，介词后面一律用 doing：thanks for helping me。同样还有 be good at swimming、look forward to hearing（这里的 to 也是介词）。' },
    { type: 'choice', q: 'He was very tired, so he stopped ___ a rest under a tree.', options: ['to have', 'having', 'have'], answer: 0,
      explain: '累了停下来“去休息”，是停下手上的事去做另一件事，用 stop to do；stop having a rest 意思变成“停止休息”。' },
    { type: 'choice', q: '—Have you seen my keys?<br>—Yes. I remember ___ them on the table this morning.', options: ['seeing', 'to see', 'see'], answer: 0,
      explain: '“今天早上看到过”，事情已经发生了，用 remember doing（记得做过）；remember to do 是“记得要去做”。' },
    { type: 'choice', q: 'The box is very heavy, but I\'ll try ___ it.', options: ['to move', 'moving', 'move'], answer: 0,
      explain: '箱子很重，我会“尽力、设法”搬动它，用 try to do；try doing 是“试着做做看（看效果）”。' },
    { type: 'fill', q: 'We were on our way home when it began ___ heavily.（rain，写出一种正确形式即可）', answer: ['to rain', 'raining'],
      explain: 'begin 后接 to do 和 doing 都可以，意思差别不大，所以 to rain 和 raining 都对。like, love, hate, start 也是这样。' }
  ],
  tests: [
    { type: 'choice', q: 'I hope ___ you again soon.', options: ['to see', 'seeing', 'see'], answer: 0, explain: 'hope to do sth。' },
    { type: 'choice', q: 'Would you mind ___ the door?', options: ['closing', 'to close', 'close'], answer: 0, explain: 'mind doing sth。' },
    { type: 'choice', q: '—We\'ve been walking for two hours.<br>—Let\'s stop ___ some water. I\'m thirsty.', options: ['to drink', 'drinking', 'drink'], answer: 0, explain: '走累了、口渴了，停下来“去喝水”，是停下手上的事去做另一件事，用 stop to do。' },
    { type: 'choice', q: 'Don\'t forget ___ the lights when you leave the room.', options: ['to turn off', 'turning off', 'turn off'], answer: 0, explain: '离开时要去关灯，事情还没做，用 forget to do。' },
    { type: 'fill', q: 'I remember ___ the door, but now it\'s open! Who opened it?（lock）', answer: ['locking'], explain: '记得自己“锁过”门（已经做了），用 remember doing。' },
    { type: 'fill', q: 'He finished ___ the book late last night.（read）', answer: ['reading'], explain: 'finish doing sth。' },
    { type: 'fill', q: 'I\'m looking forward to ___ from you.（hear）', answer: ['hearing'], explain: 'look forward to 中的 to 是介词，后面接 doing。' },
    { type: 'choice', q: 'The little boy refused ___ his toys with his sister.', options: ['to share', 'sharing', 'share'], answer: 0, explain: 'refuse 属于只接 to do 的动词，refuse to do sth 拒绝做某事。' },
    { type: 'fill', q: 'After three hours, we finally managed ___ the top of the mountain.（reach）', answer: ['to reach'], explain: 'manage to do sth 设法做成某事，只接 to do。' },
    { type: 'fill', q: 'We plan ___ Wuyi Mountain during the summer holiday.（visit）', answer: ['to visit'], explain: 'plan to do sth 计划做某事，事情还没做，接 to do。' },
    { type: 'choice', q: 'Keep ___, and you will make progress.', options: ['trying', 'to try', 'try'], answer: 0, explain: 'keep doing sth 坚持做某事，keep 只接 doing。' },
    { type: 'fill', q: 'Lucy enjoys ___ to music after school.（listen）', answer: ['listening'], explain: 'enjoy doing sth 喜欢做某事。' },
    { type: 'choice', q: 'My mother is busy ___ dinner in the kitchen.', options: ['cooking', 'to cook', 'cook'], answer: 0, explain: 'be busy doing sth 忙着做某事。' },
    { type: 'fill', q: 'It\'s a sunny day. I feel like ___ a walk.（take）', answer: ['taking'], explain: 'feel like doing sth 想要做某事，like 在这里是介词，后接 doing。' },
    { type: 'choice', q: 'Tom is good at ___, and he won first place in the race.', options: ['swimming', 'to swim', 'swim'], answer: 0, explain: 'at 是介词，介词后面用 doing：be good at swimming。' },
    { type: 'fill', q: 'Thank you for ___ me the way to the station.（show）', answer: ['showing'], explain: 'for 是介词，后面接 doing。' },
    { type: 'choice', q: 'When the teacher came in, the students stopped ___ at once.', options: ['talking', 'to talk', 'talk'], answer: 0, explain: '老师进来，学生停止“正在说的话”，用 stop doing。' },
    { type: 'fill', q: 'On the way home, Lily stopped ___ some bread at a shop.（buy）', answer: ['to buy'], explain: '回家路上停下来“去买”面包，是停下去做另一件事，用 stop to do。' },
    { type: 'fill', q: 'I remember ___ him at a party last year, but I forget his name.（meet）', answer: ['meeting'], explain: '“去年见过他”，事情已经做过，用 remember doing。' },
    { type: 'choice', q: 'Remember ___ your dictionary tomorrow. We\'ll need it in class.', options: ['to bring', 'bringing', 'bring'], answer: 0, explain: '明天要带，事情还没做，用 remember to do（记得要去做）。' },
    { type: 'choice', q: '听一听，打电话这件事现在是什么情况？', say: 'Don\'t forget to call your grandma tonight.', options: ['还没做，要记得去做', '已经做过了', '不用再做了'], answer: 0, explain: 'forget to do 表示“忘记要去做”，事情还没做；句子里的 tonight 也说明是今晚要做的事。' },
    { type: 'fill', q: 'The exam is next week. I\'ll try my best ___ it.（pass）', answer: ['to pass'], explain: '“尽最大努力去通过考试”，try (one\'s best) to do 表示努力、设法做。' },
    { type: 'choice', q: '—I can\'t sleep well at night.<br>—Why not try ___ some warm milk before bed? See if it helps.', options: ['drinking', 'to drink', 'drink'], answer: 0, explain: '“试着喝点热牛奶，看看有没有效果”，是试一试某种办法，用 try doing。' },
    { type: 'fill', q: 'Lily likes ___ storybooks in her free time.（read，写出一种正确形式即可）', answer: ['reading', 'to read'], explain: 'like 后接 doing 和 to do 都可以，意思差别不大。' },
    { type: 'choice', q: 'The baby started ___ as soon as his mother left.', options: ['crying', 'cried', 'cry'], answer: 0, explain: 'start 后接 doing 或 to do 都可以；选项中只有 crying 正确。' }
  ]
},

{
  id: 'g-used-to', title: 'used to do / be used to doing', short: 'used to', module: 'morph', grade: 8, freq: 2,
  prereqs: ['g-to-vs-ing', 'g-past-simple'],
  tip: '三个长得很像的结构：used to do（过去常常）、be used to doing（习惯于）、be used to do（被用来做），看清有没有 be、后面是 do 还是 doing。',
  learn: [
    { h: '三兄弟对比', html: `<table class="tbl"><tr><th>结构</th><th>意思</th><th>例句</th></tr>
      <tr><td>used to do</td><td>过去常常做（现在不了）</td><td>I used to walk to school.</td></tr>
      <tr><td>be used to doing</td><td>习惯于做</td><td>I am used to getting up early.</td></tr>
      <tr><td>be used to do</td><td>被用来做</td><td>Wood is used to make paper.</td></tr></table>
      <div class="rhyme">没有 be，过去常常；<br>有 be 加 doing，已经习惯；<br>被用来做，be used to do。</div>` },
    { h: 'used to do：过去常常', html: `<p>表示过去经常做、现在已经不做了，<b>只用于过去</b>，没有人称变化。</p>
      <p class="ex">My father used to smoke, but now he doesn't.<span class="zh">我爸爸过去抽烟，现在不抽了。</span></p>
      <p class="ex">There used to be a river here.<span class="zh">这里过去有一条河。</span></p>
      <p><b>否定和疑问</b>：用 did，后面变回 use to</p>
      <p class="ex">I didn't use to like vegetables.<span class="zh">我以前不喜欢吃蔬菜。</span></p>
      <p class="ex">Did you use to play the violin?<span class="zh">你以前拉小提琴吗？</span></p>` },
    { h: 'be used to doing：习惯于', html: `<p>这里的 <b>to 是介词</b>，后面接名词或 doing。be 可以换成 get（表示“变得习惯”）。</p>
      <p class="ex">She is used to living in the city now.<span class="zh">她现在已经习惯住在城市里了。</span></p>
      <p class="ex">I am used to the hot weather here.<span class="zh">我已经习惯这里的炎热天气了。</span></p>` },
    { h: '易错点', html: `<ul>
      <li>used to do 的否定是 <b>didn't use to</b>，不是 didn't used to。</li>
      <li>“被用来做”还可以说 <b>be used for doing</b>：Wood is used for making paper.</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'My grandfather ___ swim in the river when he was young.', options: ['used to', 'is used to', 'was used to'], answer: 0,
      explain: '年轻时常常游泳，表示“过去常常”，用 used to do。' },
    { type: 'choice', q: 'After a year in Fuzhou, Tom is used to ___ Chinese food.', options: ['eating', 'eat', 'ate'], answer: 0,
      explain: '“已经习惯于吃”，be used to doing。' },
    { type: 'fill', q: 'There ___ ___ be a small shop here, but now it\'s a big supermarket.（填两个词）', answer: ['used to'],
      explain: '过去有、现在没有了，用 There used to be ...（这里过去有……）。used to 只表示过去，没有人称和时态变化。' },
    { type: 'choice', q: 'I ___ like vegetables, but now I eat them every day.', options: ['didn\'t use to', 'didn\'t used to', 'wasn\'t used to'], answer: 0,
      explain: 'used to do 的否定句借助 did：didn\'t use to do，did 后面要变回原形 use，不能写 didn\'t used to；wasn\'t used to 是“不习惯于”，后面要接 doing。' },
    { type: 'choice', q: '—___ you use to play the violin?<br>—Yes, I did. But I stopped two years ago.', options: ['Did', 'Were', 'Do'], answer: 0,
      explain: 'used to do 的疑问句借助 Did 提前，后面变回 use to；回答也用 did。' },
    { type: 'choice', q: 'After living in Fuzhou for two years, Mike is used to ___ hot weather here.', options: ['the', 'eat', 'be'], answer: 0,
      explain: 'be used to 中的 to 是介词，后面可以接名词（the hot weather）或 doing，不能接动词原形。' },
    { type: 'fill', q: 'Don\'t worry. You\'ll soon get used to ___ in your new school.（study）', answer: ['studying'],
      explain: 'get used to doing 表示“（逐渐）变得习惯于”，get 换掉 be，to 仍然是介词，后面接 doing。' },
    { type: 'choice', q: 'Bamboo can be used ___ chopsticks.', options: ['to make', 'to making', 'make'], answer: 0,
      explain: '竹子“被用来做筷子”，be used to do（被动语态 + 不定式表示目的），用 to make。' },
    { type: 'fill', q: 'Bamboo can also be used for ___ baskets.（make）', answer: ['making'],
      explain: '“被用来做”还可以说 be used for doing，for 是介词，后接 doing。' }
  ],
  tests: [
    { type: 'choice', q: 'My uncle used to ___, but now he has given it up.', options: ['smoke', 'smoking', 'smoked'], answer: 0, explain: 'used to + 动词原形，表示过去常常。' },
    { type: 'choice', q: 'Lucy is used to ___ up early now.', options: ['getting', 'get', 'got'], answer: 0, explain: 'be used to doing 表示“习惯于”。' },
    { type: 'choice', q: 'Wood can be used ___ paper.', options: ['to make', 'to making', 'making'], answer: 0, explain: '“被用来造纸”，be used to do。' },
    { type: 'fill', q: 'My grandpa ___ get up at five every morning when he was a farmer.（填两个词）', answer: ['used to'], explain: '当农民时“过去常常”五点起床，used to + 动词原形，没有人称和时态变化。' },
    { type: 'choice', q: '—Did you ___ play the piano?<br>—Yes, but I don\'t play it now.', options: ['use to', 'used to', 'using to'], answer: 0, explain: '疑问句用 did，后面变回原形 use to。' },
    { type: 'fill', q: 'I\'m used to ___ in the city now.（live）', answer: ['living'], explain: 'be used to doing，to 是介词。' },
    { type: 'choice', q: 'He ___ go to school by bike, but now he takes the bus.', options: ['used to', 'is used to', 'was used to'], answer: 0, explain: '过去常常骑车、现在坐公交，用 used to do。' },
    { type: 'choice', q: '听一听，爷爷现在每个星期天还去钓鱼吗？', say: 'My grandpa used to go fishing every Sunday, but now he doesn\'t.', options: ['不去了', '还去', '从来没去过'], answer: 0, explain: 'used to go fishing 表示“过去常常去钓鱼”，后面 but now he doesn\'t 说明现在不去了。' },
    { type: 'choice', q: '___ used to be a cinema near my school.', options: ['There', 'It', 'That'], answer: 0, explain: '“过去有一家电影院”，是 there be 句型和 used to 的结合：There used to be。' },
    { type: 'choice', q: 'My brother ___ eat fish, but now it\'s his favourite food.', options: ['didn\'t use to', 'didn\'t used to', 'wasn\'t used to'], answer: 0, explain: 'used to do 的否定是 didn\'t use to do，did 后面用原形 use。' },
    { type: 'fill', q: '改错：My sister <u>didn\'t used to</u> wear glasses.（把划线部分改正）', answer: ['didn\'t use to', 'did not use to'], explain: '有了助动词 did，后面要变回原形 use：didn\'t use to。' },
    { type: 'fill', q: 'He used to play computer games.（改为否定句）<br>→ He ___ ___ to play computer games.（填两个词）', answer: ['didn\'t use', 'did not use'], explain: 'used to 的否定借助 didn\'t，used 变回原形 use。' },
    { type: 'fill', q: 'He used to live in Xiamen.（改为一般疑问句）<br>→ ___ he use to live in Xiamen?（填一个词，首字母大写）', answer: ['Did'], explain: 'used to 的疑问句把 Did 提到句首，后面变回 use to。' },
    { type: 'choice', q: '—Did your father use to smoke?<br>—Yes, he ___. But he gave it up last year.', options: ['did', 'used', 'was'], answer: 0, explain: '用 Did 提问的 used to 疑问句，简略回答也用 did。' },
    { type: 'fill', q: 'My grandma is used to ___ to bed early.（go）', answer: ['going'], explain: 'be used to doing 习惯于做某事，to 是介词。' },
    { type: 'choice', q: 'At first, Tom wasn\'t used to the food here. Now he is used to ___.', options: ['it', 'eat', 'be'], answer: 0, explain: 'be used to 的 to 是介词，后面接名词或代词（it 指 the food），不能接动词原形。' },
    { type: 'choice', q: 'It took me a month to get used ___ the new school.', options: ['to', 'for', 'with'], answer: 0, explain: 'get used to sth 逐渐习惯于某事。' },
    { type: 'fill', q: 'At first I didn\'t like the school uniform, but I soon got used to ___ it.（wear）', answer: ['wearing'], explain: 'get used to doing，to 是介词，后接 doing。' },
    { type: 'choice', q: 'Knives are used ___ things.', options: ['to cut', 'to cutting', 'cut'], answer: 0, explain: '“刀被用来切东西”，be used to do，用 to cut。' },
    { type: 'fill', q: 'Knives are used for ___ things.（cut）', answer: ['cutting'], explain: 'be used for doing 被用来做……，for 是介词，后接 doing；cut 要双写 t。' },
    { type: 'choice', q: 'This big room is used ___ meetings.', options: ['for', 'to', 'by'], answer: 0, explain: '“这个房间被用来开会”，后面是名词 meetings，用 be used for + 名词；be used to do 后面要接动词原形。' }
  ]
},

{
  id: 'g-past-cont', title: '过去进行时', short: '过去进行时', module: 'tense', grade: 8, freq: 3,
  prereqs: ['g-past-simple', 'g-present-cont'],
  tip: '中考高频：看到“过去某一时刻”（at eight last night, at this time yesterday）就用 was / were doing；when 和 while 引导的句子里谁用进行时是常考陷阱。',
  learn: [
    { h: '什么时候用', html: `<p>表示<b>过去某一时刻或某段时间正在做</b>的事。结构：<b>was / were + 动词-ing</b></p>
      <p>标志词：at eight last night, at this time yesterday, from 7 to 9 yesterday evening, then, at that time</p>
      <p class="ex">I was reading a book at eight last night.<span class="zh">昨晚八点我正在看书。</span></p>
      <p class="ex">What were you doing at this time yesterday?<span class="zh">昨天这个时候你在做什么？</span></p>` },
    { h: 'when 和 while', html: `<p>一个<b>长动作</b>（进行时）正在进行，另一个<b>短动作</b>（一般过去时）突然发生：</p>
      <p class="ex">I was having dinner when the phone rang.<span class="zh">我正在吃晚饭，这时电话响了。</span></p>
      <p class="ex">While I was walking home, I met an old friend.<span class="zh">我在走路回家的时候，遇到了一个老朋友。</span></p>
      <p>两个长动作同时进行，常用 <b>while</b>：</p>
      <p class="ex">While Mom was cooking, Dad was watching TV.<span class="zh">妈妈在做饭，爸爸在看电视。</span></p>
      <div class="rhyme">while 后面接长动作，用进行时；<br>when 后面可长可短，短动作用过去时。</div>` },
    { h: '否定和疑问', html: `<p class="ex">They weren't playing football at that time.<span class="zh">那时他们没在踢足球。</span></p>
      <p class="ex">Was she sleeping when you got home? — Yes, she was.<span class="zh">你回家时她在睡觉吗？——是的。</span></p>` },
    { h: '和一般过去时对比', html: `<ul>
      <li>一般过去时：过去<b>做了</b>某事（动作完成）——I read a book last night.</li>
      <li>过去进行时：过去某时<b>正在做</b>（强调当时的过程）——I was reading a book at eight last night.</li></ul>
      <p class="warn">主语是 I / he / she / it / 单数名词用 was；you / we / they / 复数名词用 were。</p>` }
  ],
  examples: [
    { type: 'fill', q: 'They ___ basketball when it began to rain.（play）', answer: ['were playing'],
      explain: '下雨（短动作）发生时，他们正在打球（长动作），用过去进行时；they 用 were。' },
    { type: 'choice', q: '—I called you at nine last night, but nobody answered.<br>—Sorry, I ___ a shower.', options: ['was taking', 'take', 'am taking'], answer: 0,
      explain: '昨晚九点那一刻正在洗澡，用过去进行时。' },
    { type: 'fill', q: 'While I ___ (walk) to school, it started to rain.', answer: ['was walking'],
      explain: 'while 后面接持续的长动作，用过去进行时 was walking；“开始下雨”是突然发生的短动作，用一般过去时 started。' },
    { type: 'fill', q: 'While Mom ___ (cook) dinner, Dad was reading a newspaper.', answer: ['was cooking'],
      explain: '妈妈做饭和爸爸看报是两个同时进行的长动作，用 while 连接，两边都用过去进行时。' },
    { type: 'fill', q: 'They were watching TV at that time.（改为否定句）<br>→ They ___ watching TV at that time.（填一个词，可用缩写）', answer: ['weren\'t', 'were not'],
      explain: '过去进行时的否定在 was / were 后加 not：weren\'t = were not。' },
    { type: 'choice', q: '—___ she sleeping when you got home?<br>—Yes, she was.', options: ['Was', 'Did', 'Is'], answer: 0,
      explain: '过去进行时的一般疑问句把 was / were 提到句首；主语 she 用 Was，回答也用 was。' },
    { type: 'choice', q: '—What did you do last Sunday?<br>—I ___ my grandparents in the countryside.', options: ['visited', 'was visiting', 'visit'], answer: 0,
      explain: '问的是上周日“做了什么”，强调动作完成，用一般过去时 visited；过去进行时强调过去某一时刻“正在做”，要有 at ten o\'clock 这类时刻。' },
    { type: 'choice', q: 'At this time yesterday, my classmates ___ a basketball match.', options: ['were watching', 'was watching', 'watched'], answer: 0,
      explain: 'at this time yesterday 是过去某一时刻，用过去进行时；主语 my classmates 是复数，用 were。' }
  ],
  tests: [
    { type: 'choice', q: '—What were you doing at eight last night?<br>—I ___ a book.', options: ['was reading', 'read', 'am reading'], answer: 0, explain: '用过去进行时提问，也用过去进行时回答。' },
    { type: 'fill', q: 'At this time yesterday, we ___ Mount Wuyi.（climb）', answer: ['were climbing'], explain: 'at this time yesterday 是过去某一时刻，用过去进行时；we 用 were。' },
    { type: 'choice', q: 'I was having dinner ___ the phone rang.', options: ['when', 'while', 'because'], answer: 0, explain: '电话响是短动作，用 when；while 后面通常接长动作。' },
    { type: 'choice', q: '___ Dad was washing the car, Mom was watering the flowers.', options: ['While', 'Because', 'Until'], answer: 0, explain: '两个长动作同时进行，用 While。' },
    { type: 'fill', q: 'Lily ___ when her mother came back home.（sleep）', answer: ['was sleeping'], explain: '妈妈回家（短动作）时，莉莉正在睡觉（长动作），用 was sleeping。' },
    { type: 'choice', q: 'When I got home, my sister ___ the piano.', options: ['was playing', 'is playing', 'plays'], answer: 0, explain: '我到家那一刻姐姐正在弹钢琴，用过去进行时。' },
    { type: 'choice', q: 'While I ___ home, I met my English teacher.', options: ['was walking', 'walk', 'am walking'], answer: 0, explain: 'while 后面接长动作，用过去进行时 was walking。' },
    { type: 'fill', q: 'From 7 to 9 yesterday evening, Tom ___ his homework.（do）', answer: ['was doing'], explain: 'from 7 to 9 yesterday evening 是过去的一段时间，表示那段时间正在做，用过去进行时；Tom 用 was。' },
    { type: 'choice', q: '听一听，开始下雨时说话人在做什么？', say: 'When the rain started, I was walking in the park with my dog.', options: ['在公园遛狗散步', '在家里看书', '在公交车上'], answer: 0, explain: '听到 I was walking in the park with my dog，下雨（短动作）时说话人正在公园里遛狗散步（长动作）。' },
    { type: 'choice', q: 'The lights went out ___ we were having dinner.', options: ['while', 'until', 'because'], answer: 0, explain: '“我们正在吃饭”是长动作，用过去进行时，前面用 while；灯灭了是短动作。' },
    { type: 'fill', q: 'While she ___ a book, the lights went out.（read）', answer: ['was reading'], explain: 'while 后接长动作，用过去进行时 was reading。' },
    { type: 'fill', q: 'While I was doing my homework, my brother ___ computer games.（play）', answer: ['was playing'], explain: '两个长动作同时进行，用 while 连接，后半句也用过去进行时 was playing。' },
    { type: 'choice', q: '___ the students were cleaning the classroom, the teacher was writing on the blackboard.', options: ['While', 'Until', 'So'], answer: 0, explain: '学生打扫和老师写字是同时进行的两个长动作，用 While。' },
    { type: 'fill', q: 'They ___ football at that time. They were having a meeting.（not play）', answer: ['weren\'t playing', 'were not playing'], explain: 'at that time 表示过去那个时刻，否定用 were not / weren\'t + doing。' },
    { type: 'fill', q: 'She was singing in her room then.（改为否定句）<br>→ She ___ singing in her room then.（填一个词，可用缩写）', answer: ['wasn\'t', 'was not'], explain: '过去进行时的否定在 was 后加 not：wasn\'t = was not。' },
    { type: 'fill', q: '—___ you sleeping when I called you last night?<br>—Yes, I was.（填一个词，首字母大写）', answer: ['Were'], explain: '主语 you 用 were，过去进行时的一般疑问句把 Were 提到句首。' },
    { type: 'choice', q: '—Was Tom doing his homework at eight yesterday evening?<br>—No, he ___. He was watching TV.', options: ['wasn\'t', 'didn\'t', 'isn\'t'], answer: 0, explain: '用 Was 提问，否定回答用 wasn\'t。' },
    { type: 'choice', q: '—I ___ a letter at nine last night.<br>—Who was it to?', options: ['was writing', 'write', 'am writing'], answer: 0, explain: 'at nine last night 是过去某一时刻，那时正在写信，用过去进行时。' },
    { type: 'choice', q: 'I ___ my homework an hour ago, so I can play now.', options: ['finished', 'was finishing', 'finish'], answer: 0, explain: 'an hour ago 表示过去“做完了”，强调动作完成，用一般过去时 finished；过去进行时只说当时正在做，不能说明已完成。' },
    { type: 'choice', q: 'My parents ___ watching TV when I got home.', options: ['were', 'was', 'are'], answer: 0, explain: '主语 my parents 是复数，用 were；when I got home 是过去，用过去进行时。' },
    { type: 'choice', q: 'Everyone ___ laughing at that moment.', options: ['was', 'were', 'is'], answer: 0, explain: 'everyone 作主语看作单数，用 was；at that moment 指过去那一刻，用过去进行时。' }
  ]
},

{
  id: 'g-it-pattern', title: 'it 的用法（形式主语等）', short: 'it 的用法', module: 'syntax', grade: 8, freq: 3,
  prereqs: ['g-infinitive'],
  tip: '中考高频：It is + 形容词 + for / of sb + to do，It takes sb time to do，find it + 形容词 + to do；for 和 of 的选择是常见陷阱。',
  learn: [
    { h: 'it 的基本用法', html: `<ul>
      <li>指代前面提到的<b>那个</b>东西：I have a new bike. It is blue.</li>
      <li>指不清楚身份的人：<span class="en">Who is it? — It's me.</span></li>
      <li>表示<b>时间、天气、距离</b>：</li></ul>
      <p class="ex">It's eight o'clock. It's raining outside.<span class="zh">八点了。外面在下雨。</span></p>
      <p class="ex">It is about ten kilometers from my home to the school.<span class="zh">从我家到学校大约十公里。</span></p>` },
    { h: '形式主语：It is + 形容词 + to do', html: `<p>真正的主语（to do 那部分）太长，就用 it 放在前面“占位”：</p>
      <p class="ex">It is important to learn English well.<span class="zh">学好英语很重要。</span></p>
      <p><b>for 还是 of？</b></p>
      <ul><li>形容词说<b>事情</b>（难、易、重要）用 <b>for</b>：<span class="en">It's difficult for me to swim.</span></li>
      <li>形容词说<b>人的品质</b>（kind, nice, clever, careless, polite）用 <b>of</b>：<span class="en">It's very kind of you to help me.</span></li></ul>
      <div class="rhyme">说人品质用 of，说事难易用 for。</div>` },
    { h: '其他常考句型', html: `<p><b>It takes sb + 时间 + to do</b>：做某事花某人多少时间</p>
      <p class="ex">It takes me half an hour to get to school.<span class="zh">我到学校要花半小时。</span></p>
      <p><b>It's time to do / It's time for sth</b>：该做某事了</p>
      <p class="ex">It's time for lunch. It's time to have lunch.<span class="zh">该吃午饭了。</span></p>
      <p><b>形式宾语：find / think / make + it + 形容词 + to do</b></p>
      <p class="ex">I find it hard to get up early in winter.<span class="zh">我发现冬天早起很难。</span></p>` },
    { h: '易错点：it 和 one', html: `<ul>
      <li><b>it</b>：就是前面说的<b>那一个</b>（同一个东西）</li>
      <li><b>one</b>：同一类中的<b>任意一个</b>（不是同一个）</li></ul>
      <p class="ex">I lost my pen. I have to buy a new one.<span class="zh">我的笔丢了，得买一支新的。（one = 一支笔）</span></p>
      <p class="ex">I can't find my pen. Have you seen it?<span class="zh">我找不到我的笔了，你看见它了吗？（it = 我那支笔）</span></p>
      <p class="warn">形式宾语的 it 不能省：I find it hard to ...（不能说 I find hard to ...）。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'It\'s very nice ___ you to give me a hand.', options: ['of', 'for', 'to'], answer: 0,
      explain: 'nice 是说人的品质，用 of。' },
    { type: 'choice', q: 'I think ___ important to keep healthy.', options: ['it', 'this', 'that'], answer: 0,
      explain: 'think it + 形容词 + to do，it 作形式宾语。' },
    { type: 'choice', q: 'I have a new bike. ___ is blue and white.', options: ['It', 'One', 'They'], answer: 0,
      explain: 'it 指代前面提到的“那一个”东西（我的新自行车），用 It；one 指同类中的任意一个；They 是复数，和单数的 bike、is 不符。' },
    { type: 'choice', q: '(Someone is knocking at the door.)<br>—Who is ___?<br>—It\'s me, Tom.', options: ['it', 'he', 'she'], answer: 0,
      explain: '不知道门外是谁，问身份不明的人用 it：Who is it? 回答也用 It\'s ...。' },
    { type: 'fill', q: '—What time is it?<br>—___ half past seven. We must go now.（填一个词，用缩写形式，首字母大写）', answer: ['It\'s'],
      explain: '表示时间用 it：It\'s half past seven.（七点半了。）' },
    { type: 'choice', q: 'Take your umbrella. ___ is raining outside.', options: ['It', 'This', 'There'], answer: 0,
      explain: '表示天气用 it：It is raining.（在下雨。）' },
    { type: 'choice', q: '___ is about two kilometers from my home to the library.', options: ['It', 'There', 'This'], answer: 0,
      explain: '表示距离用 it：It is + 距离 + from A to B。' },
    { type: 'choice', q: '___ is not easy to learn a language well.', options: ['It', 'That', 'This'], answer: 0,
      explain: '真正的主语是 to learn a language well，太长了，用 it 作形式主语放在句首“占位”。' },
    { type: 'choice', q: 'It\'s hard ___ Tom to get up early on winter mornings.', options: ['for', 'of', 'with'], answer: 0,
      explain: 'hard 说的是“事情难不难”，不是说汤姆的品质，所以用 for。可以检验：Tom is hard 说不通，因此不用 of。' },
    { type: 'fill', q: 'It ___ (take) me twenty minutes to ride to school every day.', answer: ['takes'],
      explain: 'It takes sb + 时间 + to do sth 做某事花某人多少时间；every day 用一般现在时，it 是第三人称单数，用 takes。' },
    { type: 'fill', q: 'It\'s time ___ lunch. = It\'s time to have lunch.（填一个词）', answer: ['for'],
      explain: 'It\'s time for + 名词 = It\'s time to do，都表示“该做某事了”。' },
    { type: 'choice', q: 'I lost my schoolbag yesterday. I have to buy a new ___.', options: ['one', 'it', 'that'], answer: 0,
      explain: '要买的是“一个新书包”，不是丢的那个，用 one（同类中的任意一个）；it 指丢的那个书包本身。' },
    { type: 'choice', q: '下列句子正确的是哪一句？', options: ['I find it interesting to read English stories.', 'I find interesting to read English stories.', 'I find that interesting to read English stories.'], answer: 0,
      explain: 'find + it + 形容词 + to do，it 作形式宾语，不能省略，也不能换成 that。' }
  ],
  tests: [
    { type: 'choice', q: '___ is important for us to protect the environment.', options: ['It', 'This', 'That'], answer: 0, explain: '真正的主语是 to protect the environment，用 It 作形式主语。' },
    { type: 'choice', q: 'It\'s very kind ___ you to help me with my English.', options: ['of', 'for', 'to'], answer: 0, explain: 'kind 说人的品质，用 of。' },
    { type: 'choice', q: 'It\'s difficult ___ me to swim across the river.', options: ['for', 'of', 'with'], answer: 0, explain: 'difficult 说事情难不难，用 for。' },
    { type: 'fill', q: 'It usually ___ Lucy two hours to finish her homework.（take）', answer: ['takes'], explain: 'It takes sb time to do；usually 表示经常性，用一般现在时，it 是第三人称单数。' },
    { type: 'choice', q: 'I find ___ hard to get up early in winter.', options: ['it', 'that', 'this'], answer: 0, explain: 'find it + 形容词 + to do，it 是形式宾语。' },
    { type: 'choice', q: '—I lost my pen. Can you lend me ___?<br>—Sure. Here you are.', options: ['one', 'it', 'that'], answer: 0, explain: '借的是“一支笔”而不是丢的那支，用 one；it 指丢的那支笔。' },
    { type: 'fill', q: '___ is getting dark. Let\'s go home.（填一个词，首字母大写）', answer: ['It'], explain: '表示天色、时间用 it：It is getting dark.（天黑了。）' },
    { type: 'choice', q: '—Where is my phone?<br>—I saw ___ on the sofa just now.', options: ['it', 'one', 'them'], answer: 0, explain: '指的就是“你那部手机”，同一个东西用 it；one 是同类中任意一个；them 是复数。' },
    { type: 'fill', q: 'My uncle gave me a watch for my birthday. I like ___ very much.（填一个代词）', answer: ['it'], explain: '指代前面提到的那块手表，作宾语用 it。' },
    { type: 'choice', q: '(The phone is ringing.)<br>—Hello! Who is ___, please?<br>—This is Mary speaking.', options: ['it', 'he', 'she'], answer: 0, explain: '不知道对方是谁，询问身份不明的人用 it；he 和 she 要先知道是男是女。' },
    { type: 'fill', q: '—Who\'s knocking at the door?<br>—___ is me, your neighbour.（填一个词，首字母大写）', answer: ['It'], explain: '回答“是谁”时用 It is ... / It\'s ...。' },
    { type: 'fill', q: '___ is eight o\'clock. Class begins now.（填一个词，首字母大写）', answer: ['It'], explain: '表示时间用 it。' },
    { type: 'choice', q: '—What\'s the date today?<br>—___ October 1st, National Day.', options: ['It\'s', 'This is', 'There is'], answer: 0, explain: '表示日期也用 it：It\'s October 1st。' },
    { type: 'choice', q: '听一听，今天天气怎么样？', say: 'It is cold and windy today. Put on your coat.', options: ['冷，有风', '热，晴天', '在下雨'], answer: 0, explain: '听到 It is cold and windy，表示天气用 it：冷而且有风。' },
    { type: 'choice', q: '___ is snowing heavily in Harbin now.', options: ['It', 'That', 'There'], answer: 0, explain: '表示天气用 it：It is snowing.' },
    { type: 'choice', q: '—How far is it from here to the station?<br>—___ is about two kilometers.', options: ['It', 'That', 'There'], answer: 0, explain: '回答距离也用 it。' },
    { type: 'fill', q: 'To read every day is good for us.<br>→ It is good for us ___ read every day.（填一个词）', answer: ['to'], explain: 'it 作形式主语，真正的主语 to read every day 放到后面，to 不能丢。' },
    { type: 'choice', q: '___ is our duty to keep the classroom clean.', options: ['It', 'This', 'There'], answer: 0, explain: '真正的主语是 to keep the classroom clean，用 It 作形式主语。' },
    { type: 'choice', q: 'It\'s easy ___ us to answer this question.', options: ['for', 'of', 'to'], answer: 0, explain: 'easy 说的是事情难易，用 for。' },
    { type: 'fill', q: 'It is necessary ___ students to do sports every day.（填一个介词）', answer: ['for'], explain: 'necessary（必要的）说的是事情，不是人的品质，用 for。' },
    { type: 'fill', q: 'It was careless ___ him to lose the key again.（填一个介词）', answer: ['of'], explain: 'careless（粗心的）说的是人的品质（他很粗心），用 of。' },
    { type: 'choice', q: 'It\'s polite ___ you to say "thank you" to the waiter.', options: ['of', 'for', 'with'], answer: 0, explain: 'polite（有礼貌的）说的是人的品质，用 of。可以检验：you are polite 说得通，所以用 of。' },
    { type: 'choice', q: 'How long does it ___ you to get to school by bike?', options: ['take', 'spend', 'cost'], answer: 0, explain: '主语是 it，It takes sb time to do sth；spend 的主语是人，cost 的主语是物且多指花钱。' },
    { type: 'fill', q: 'It ___ me two hours to finish the work yesterday.（take）', answer: ['took'], explain: 'yesterday 表示过去，用一般过去时 took。' },
    { type: 'choice', q: 'It\'s ten o\'clock. It\'s time ___ bed.', options: ['for', 'to', 'of'], answer: 0, explain: 'It\'s time for + 名词：It\'s time for bed. 该睡觉了。' },
    { type: 'fill', q: 'Hurry up! It\'s time ___ ___ to school.（go，填两个词）', answer: ['to go'], explain: 'It\'s time to do sth 该做某事了。' },
    { type: 'choice', q: 'The Internet makes ___ easy for us to get information.', options: ['it', 'this', 'that'], answer: 0, explain: 'make it + 形容词 + to do，it 作形式宾语，真正的宾语是 to get information。' },
    { type: 'choice', q: '—Do you have a ruler?<br>—Yes, I have ___. Here you are.', options: ['one', 'it', 'that'], answer: 0, explain: '问的是“有没有一把尺子”，泛指同类中的一个，用 one。' },
    { type: 'choice', q: 'I bought a new dictionary yesterday. Do you want to see ___?', options: ['it', 'one', 'them'], answer: 0, explain: '想看的是“我买的那本”词典，同一个东西用 it。' },
    { type: 'fill', q: '改错：I think hard to learn maths well.（句子缺少一个词，应在 think 后面补上，填这个词）', answer: ['it'], explain: 'think it + 形容词 + to do，形式宾语 it 不能省略：I think it hard to learn maths well.' },
    { type: 'choice', q: '下列句子正确的是哪一句？', options: ['We think it necessary to have a rest.', 'We think necessary to have a rest.', 'We think that necessary to have a rest.'], answer: 0, explain: 'think it + 形容词 + to do，it 作形式宾语，不能省略，也不能换成 that。' }
  ]
},

{
  id: 'g-so-neither', title: 'So do I / Neither do I', short: 'So/Neither 倒装', module: 'syntax', grade: 8, freq: 2,
  prereqs: ['g-yes-no-q', 'g-past-simple'],
  tip: '情景交际常考：助动词要和前一句的时态、动词类型一致；So do I（我也是）和 So I do（我确实是）意思完全不同。',
  learn: [
    { h: '三个句型', html: `<table class="tbl"><tr><th>句型</th><th>意思</th><th>例句</th></tr>
      <tr><td>So + 助动词 + 主语</td><td>……也是这样（肯定）</td><td>I like music. — So do I.</td></tr>
      <tr><td>Neither / Nor + 助动词 + 主语</td><td>……也不（否定）</td><td>I don't like fish. — Neither do I.</td></tr>
      <tr><td>So + 主语 + 助动词</td><td>的确如此（同一个人）</td><td>You worked hard. — So I did.</td></tr></table>
      <div class="rhyme">So 后先助再主语，“也一样”；<br>So 后先主再助，“确实是”。</div>` },
    { h: '助动词怎么选', html: `<p>看前一句用的是什么，就“照抄”什么（时态也要一致）：</p>
      <ul><li>前句有 <b>be</b>（am / is / are / was / were）→ 用 be</li>
      <li>前句有<b>情态动词</b>（can / will / should ...）→ 用情态动词</li>
      <li>前句有 <b>have / has</b>（完成时）→ 用 have / has</li>
      <li>前句是<b>实义动词</b> → 用 do / does / did</li></ul>
      <p class="ex">Tom can swim. — So can I.<span class="zh">汤姆会游泳。——我也会。</span></p>
      <p class="ex">Lucy went to the cinema yesterday. — So did Lily.<span class="zh">露西昨天去看电影了。——莉莉也去了。</span></p>
      <p class="ex">I have never been to Beijing. — Neither have I.<span class="zh">我从没去过北京。——我也没去过。</span></p>` },
    { h: '易错点', html: `<ul>
      <li>助动词和<b>后面的主语</b>一致：<span class="en">I am a student. — So is my brother.</span></li>
      <li>前句是否定（含 not, never 等）就用 Neither / Nor，不能用 So ... not。</li>
      <li>前句有 <b>be good at</b> 这类 be 动词短语，用 be，不用 does。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: '—I don\'t like eating fast food.<br>—___. It\'s bad for our health.', options: ['Neither do I', 'So do I', 'Neither am I'], answer: 0,
      explain: '前句是否定，用 Neither；前句是实义动词 like 的一般现在时，用 do。' },
    { type: 'choice', q: '—You\'ve made great progress in English.<br>—___, and so have you.', options: ['So I have', 'So have I', 'Neither have I'], answer: 0,
      explain: '对方说的是“你”，回答“我确实如此”，用 So + 主语 + 助动词：So I have。' },
    { type: 'choice', q: '—I like watching football matches.<br>—___. Let\'s watch one together tonight.', options: ['So do I', 'So I do', 'So am I'], answer: 0,
      explain: '“我也喜欢”，说的是另一个人也一样，用 So + 助动词 + 主语；前句是实义动词 like 的一般现在时，助动词用 do。So I do 意思是“我的确如此”，用于同一个人。' },
    { type: 'choice', q: '—I\'m a little tired after the long walk.<br>—___. Let\'s have a rest.', options: ['So am I', 'So do I', 'So I am'], answer: 0,
      explain: '前句用的是 be 动词 am，照抄 be 动词；主语 I 用 am：So am I（我也是）。' },
    { type: 'choice', q: '—Tom can play the guitar.<br>—___. They often play together.', options: ['So can his brother', 'So does his brother', 'So his brother can'], answer: 0,
      explain: '前句有情态动词 can，照用 can；“他哥哥也会”是另一个人，用 So + 助动词 + 主语。' },
    { type: 'fill', q: '—I visited the science museum last weekend.<br>—So ___ I. Maybe we were there at the same time!（填一个词）', answer: ['did'],
      explain: '前句是实义动词 visited 的一般过去时，助动词用 did，时态也要和前句一致。' },
    { type: 'fill', q: '—I am a student.<br>—So ___ my brother.（填一个词）', answer: ['is'],
      explain: '前句是 be 动词；助动词要和后面的主语 my brother（单数第三人称）一致，用 is，而不是照抄 am。' },
    { type: 'choice', q: '—I have never been to Beijing.<br>—___. I hope to go there one day.', options: ['Neither have I', 'So have I', 'Neither do I'], answer: 0,
      explain: '前句含 never，是否定意思，要用 Neither / Nor，不能用 So；前句是现在完成时 have been，助动词用 have。' },
    { type: 'choice', q: '—Jenny is good at drawing.<br>—___ her sister. They both won prizes.', options: ['So is', 'So does', 'So has'], answer: 0,
      explain: '前句是 be good at，里面的动词是 be 动词 is，不是实义动词，所以用 So is，不能用 does。' }
  ],
  tests: [
    { type: 'choice', q: '—I enjoy listening to music in my free time.<br>—___. Music helps me relax.', options: ['So do I', 'So I do', 'Neither do I'], answer: 0, explain: '“我也喜欢”，So + 助动词 + 主语。' },
    { type: 'choice', q: '—Tom can\'t swim.<br>—___. We should learn it this summer.', options: ['Neither can I', 'So can I', 'Neither do I'], answer: 0, explain: '前句是否定，用 Neither；前句有情态动词 can，照用 can。' },
    { type: 'choice', q: '—Lucy went to the cinema yesterday.<br>—___. They went together.', options: ['So did Lily', 'So Lily did', 'So does Lily'], answer: 0, explain: '“莉莉也去了”，So + 助动词 + 主语；yesterday 是过去，用 did。' },
    { type: 'choice', q: '—You worked very hard last term.<br>—___, and I\'ll keep working hard.', options: ['So I did', 'So did I', 'Neither did I'], answer: 0, explain: '对方说的是“你”，回答“我的确如此”，用 So I did。' },
    { type: 'fill', q: '—I was at home last night.<br>—___ my cousin. She stayed in to study.（填两个词，首字母大写）', answer: ['So was'], explain: '前句用 be 动词的过去式 was，my cousin 是单数，用 So was。' },
    { type: 'fill', q: '—I haven\'t finished my homework yet.<br>—___ have I.（填一个词，首字母大写）', answer: ['Neither', 'Nor'], explain: '前句是否定，用 Neither 或 Nor。' },
    { type: 'choice', q: '—Mr. Li is from Fujian.<br>—___ his wife. They were both born in Quanzhou.', options: ['So is', 'So does', 'So has'], answer: 0, explain: '前句是 be from，用 be 动词；his wife 单数，用 So is。' },
    { type: 'choice', q: '听一听，选出表示“我也是”的答语。', say: 'I love Chinese food.', options: ['So do I.', 'So I do.', 'Neither do I.'], answer: 0, explain: '对方说喜欢中国菜，“我也喜欢”用 So do I；So I do 是“我的确如此”；Neither do I 用于否定句。' },
    { type: 'fill', q: '—Lucy likes reading.<br>—So ___ her sister.（填一个词）', answer: ['does'], explain: '前句是实义动词 likes（一般现在时），后面主语 her sister 是单数第三人称，用 does。' },
    { type: 'choice', q: '—I never drink cola.<br>—___. I only drink water and milk.', options: ['Neither do I', 'So do I', 'Neither am I'], answer: 0, explain: 'never 表示否定，用 Neither；前句是实义动词 drink 的一般现在时，用 do。' },
    { type: 'fill', q: '—I don\'t like rainy days.<br>—___ does my mother.（填一个词，首字母大写，表示“也不”）', answer: ['Neither', 'Nor'], explain: '前句是否定，“也不”用 Neither 或 Nor；mother 是单数第三人称，用 does。' },
    { type: 'choice', q: '—Look! It\'s raining heavily.<br>—___. Let\'s stay inside.', options: ['So it is', 'So is it', 'Neither is it'], answer: 0, explain: '对同一件事表示“的确如此”，用 So + 主语 + 助动词：So it is（确实在下大雨）。' },
    { type: 'choice', q: '—Your English has improved a lot, Tom.<br>—___. I practise every day.', options: ['So it has', 'So has it', 'So does it'], answer: 0, explain: '说的是同一件事（汤姆的英语），“的确是这样”用 So + 主语 + 助动词；前句是现在完成时 has improved，用 has。' },
    { type: 'fill', q: '—Tom was late for school yesterday.<br>—So ___ I. The traffic was terrible.（填一个词）', answer: ['was'], explain: '前句用 be 动词的过去式 was，主语 I 也用 was。' },
    { type: 'choice', q: '—I will go to Lily\'s birthday party.<br>—___ Jim. He told me yesterday.', options: ['So will', 'So does', 'So is'], answer: 0, explain: '前句有情态动词 will，照用 will。' },
    { type: 'choice', q: '—I should help my parents with the housework.<br>—___. We are old enough now.', options: ['So should I', 'So do I', 'So I should'], answer: 0, explain: '前句有情态动词 should，“我也应该”用 So should I；So I should 是“我确实应该”，指同一个人。' },
    { type: 'choice', q: '—I have been to Xiamen.<br>—___ I. I went there last year.', options: ['So have', 'So do', 'So am'], answer: 0, explain: '前句是现在完成时，有助动词 have，照用 have。' },
    { type: 'fill', q: '—My father has visited the Great Wall.<br>—So ___ my uncle.（填一个词）', answer: ['has'], explain: '前句是现在完成时 has visited，主语 my uncle 是单数，用 has。' },
    { type: 'fill', q: '—My brother watched the film last night.<br>—So ___ I.（填一个词）', answer: ['did'], explain: 'last night 是过去，实义动词 watched 用 did。' },
    { type: 'fill', q: '—Lucy doesn\'t drink milk.<br>—Neither ___ Tom.（填一个词）', answer: ['does'], explain: '前句是一般现在时的否定，Tom 是单数第三人称，用 does。' },
    { type: 'choice', q: '—I\'m interested in art.<br>—So ___ my parents.', options: ['are', 'am', 'is'], answer: 0, explain: '助动词和后面的主语一致：my parents 是复数，用 are。' },
    { type: 'choice', q: '—Tom didn\'t pass the test.<br>—___ Jack. They both have to take it again.', options: ['Neither did', 'So didn\'t', 'So did'], answer: 0, explain: '前句是否定，用 Neither，不能用 So ... not；过去时用 did。' },
    { type: 'fill', q: '改错：—I can\'t dance. —<u>So can\'t I</u>.（把划线部分改正，填三个词，首字母大写）', answer: ['Neither can I', 'Nor can I'], explain: '前句是否定，“我也不会”要用 Neither / Nor + 助动词 + 主语，不能说 So can\'t I。' },
    { type: 'fill', q: '—Lily was good at singing when she was young.<br>—So ___ her mother.（填一个词）', answer: ['was'], explain: 'be good at 中是 be 动词，前句是过去式 was，her mother 单数，用 was，不能用 did。' }
  ]
}

);
