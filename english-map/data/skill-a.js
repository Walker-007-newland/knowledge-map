// 第 4 阶段 · 题型技能 A 组：听力、补全对话、看图写话
KG.nodes.push(

/* ================= 听力基础 ================= */
{
  id: 's-listening-basic', title: '听力：听句子选图与听对话选答', short: '听力基础', module: 'skill', grade: 7, freq: 3,
  prereqs: ['p-stress-intonation', 't-request'],
  tip: '听力基础题考你能不能听懂一句话或两三句的小对话并抓住关键信息，最大的陷阱是“听到哪个词就选哪个”——干扰项最爱用原文里出现过的词。（具体题量分值以当年《考试说明》为准）',
  learn: [
    { h: '题型说明', html: `
      <p>听力的前几大题都是“短”材料，一般每段读两遍，常见三种：</p>
      <table class="tbl">
        <tr><th>小题型</th><th>听到什么</th><th>要你做什么</th></tr>
        <tr><td>听句子选图</td><td>一个句子</td><td>从三幅图里选出和句子意思相符的</td></tr>
        <tr><td>听句子选答语</td><td>一句问话或一句话</td><td>选出最恰当的回答</td></tr>
        <tr><td>听短对话选答案</td><td>两人一问一答（2–4 句）</td><td>回答试卷上印的问题</td></tr>
      </table>
      <p>在这个网站里我们看不到图片，所以“选图”题会用中文写出每幅图画了什么，例如“图：男孩在河边钓鱼”。</p>
      <div class="rhyme">先看图和题，猜猜要听啥；<br>抓住关键词，别被原词骗；<br>转折后面是重点，数字时间算一算。</div>` },
    { h: '解题步骤', html: `<ol>
      <li><b>预读</b>：放音前快速看选项。三幅图有什么不同？是人物不同、动作不同，还是地点、天气不同？不同之处就是要听的地方。</li>
      <li><b>预测</b>：选答语题先猜问句类型。选项是 By bus / On foot，那问的多半是 How；选项是 Twice a week，问的多半是 How often。</li>
      <li><b>第一遍抓关键词</b>：疑问词（what / where / when / how often）、动词、地点、数字。</li>
      <li><b>第二遍核对</b>：特别留意 but、however、actually 后面的内容，和 not、never 这样的否定词。</li>
      <li><b>排除</b>：答语不搭配的、时态不对的、只是“原词复现”的选项先划掉。</li>
    </ol>` },
    { h: '常见陷阱', html: `
      <table class="tbl">
        <tr><th>陷阱</th><th>例子</th><th>怎么破</th></tr>
        <tr><td>原词复现</td><td>听到 kite，图里有“画风筝”也有“放风筝”</td><td>听动词：flying 是“放”</td></tr>
        <tr><td>转折改变主意</td><td>I planned to go swimming, <b>but</b> it rained.</td><td>but 后面才是真正发生的事</td></tr>
        <tr><td>数字要计算</td><td>电影 7:30 开始，“还有 20 分钟”</td><td>问“现在几点”要算：7:10</td></tr>
        <tr><td>答非所问</td><td>How often…? — For two hours.</td><td>How often 问频率，How long 问时长</td></tr>
        <tr><td>交际用语搭配</td><td>Sorry I broke your cup. — You're welcome.</td><td>道歉用 That's all right. / Never mind.</td></tr>
      </table>
      <p class="warn">近音词也要小心：thirteen / thirty，walk / work，ship / sheep。重读音节能帮你分辨：thir<b>TEEN</b> 重音在后，<b>THIR</b>ty 重音在前。</p>` },
    { h: '实战演示', html: `
      <p>题目：听对话，回答问题 What did Tom do last weekend?<br>选项：He went to the beach. / He read books at home. / He went swimming.</p>
      <p>听力原文：</p>
      <p class="ex">W: Did you go to the beach last weekend, Tom?<span class="zh">女：汤姆，你上周末去海边了吗？</span></p>
      <p class="ex">M: I planned to, but it rained heavily, so I stayed at home and read books.<span class="zh">男：我本来打算去，但是下大雨，所以我待在家里看书。</span></p>
      <p><b>思路</b>：</p>
      <ol>
        <li>预读：三个选项都是“做了什么”，而且都是过去时，要听 Tom 上周末实际做的事。</li>
        <li>第一遍听到 beach——别急！“去海边”正是原词复现的陷阱。</li>
        <li>第二遍抓住 <b>but</b>：but it rained heavily, so I stayed at home and read books。</li>
        <li>结论：他在家看书。“去游泳”原文根本没提，“去海边”只是计划。</li>
      </ol>` }
  ],
  examples: [
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: 'Look! The children are flying kites in the park.',
      options: ['图：孩子们在公园里放风筝', '图：孩子们在公园里划船', '图：孩子们在教室里画风筝'], answer: 0,
      explain: '关键是动词 flying kites（放风筝）和地点 in the park（在公园）。“画风筝”用了原词 kite，但动作和地点都不对。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'How often do you exercise?',
      options: ['For two hours.', 'Twice a week.', 'In the gym.'], answer: 1,
      explain: 'How often 问“多久一次”（频率），要用 twice a week 这类回答。For two hours 回答 How long，In the gym 回答 Where。' },
    { type: 'choice', q: '听对话，回答问题：What time is it now?',
      say: [{ who: 'M', text: 'When does the film start?' }, { who: 'W', text: 'At seven thirty. We still have twenty minutes.' }],
      options: ['7:10', '7:30', '7:50'], answer: 0,
      explain: '电影七点半开始，还有二十分钟，所以现在是 7:10。7:30 是直接听到的数字，是陷阱；问题问的是“现在”。' },
    { type: 'choice', q: '【预读】放音前看到三幅图：图一 女孩在弹钢琴；图二 女孩在拉小提琴；图三 男孩在弹钢琴。听的时候最需要抓住什么？',
      options: ['人物是男孩还是女孩，以及乐器是钢琴还是小提琴', '天气和地点', '时间和数字'], answer: 0,
      explain: '预读就是找三幅图的不同之处：三幅图的区别只在“谁”（男孩/女孩）和“什么乐器”（钢琴/小提琴），所以听的时候盯住人物和 piano / violin。图里没有天气、时间的差别，不用分心。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'Where did you go last summer vacation?',
      options: ['I went to Wuyi Mountain.', "I'm going to Wuyi Mountain.", 'I often go to Wuyi Mountain.'], answer: 0,
      explain: '问句用 did 和 last summer vacation，问的是过去，答语也要用过去时 went。另外两项地点虽然一样，但一个是将来计划、一个是经常性动作，时态不对，用“排除法”先划掉。' },
    { type: 'choice', q: '听对话，回答问题：How will the boy go to the zoo?',
      say: [{ who: 'W', text: 'Are you going to take the bus to the zoo tomorrow?' }, { who: 'M', text: 'I was going to, but actually my dad will drive me there.' }],
      options: ['By bus.', 'By car.', 'On foot.'], answer: 1,
      explain: '先听到 take the bus，但男孩说 I was going to（原本打算），but actually 后面才是真话：my dad will drive me there，爸爸开车送，所以是坐小汽车。but、actually 后面要竖起耳朵。' },
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: 'I never drink coffee in the evening. I usually have a glass of milk before bed.',
      options: ['图：男孩晚上在喝咖啡', '图：男孩睡前在喝牛奶', '图：男孩早上在喝果汁'], answer: 1,
      explain: 'never（从不）是否定词：晚上从不喝咖啡。后半句 have a glass of milk before bed 才是他做的事——睡前喝牛奶。只听到 coffee 就选第一幅图，正好掉进陷阱。' },
    { type: 'choice', q: '听对话，回答问题：How many students are there in the art club?',
      say: [{ who: 'M', text: 'How many students are there in your art club?' }, { who: 'W', text: 'There are thirteen. Most of them are girls.' }],
      options: ['3.', '13.', '30.'], answer: 1,
      explain: 'thirteen 和 thirty 听起来很像，要听重音：thir-TEEN 重音在后，而且 -teen 的音拉得长；THIR-ty 重音在前。这里重音在后，是 13。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'Thank you for helping me with my English.',
      options: ['My pleasure.', 'Never mind.', 'Yes, I do.'], answer: 0,
      explain: '对方道谢，回应用 My pleasure.（乐意效劳）/ You\'re welcome.。Never mind 是回应道歉的“没关系”，交际场合不对；Yes, I do 回答的是 Do you...? 问句。' },
    { type: 'choice', q: '【预测】放音前看到三个选项：Every day. / Once a month. / Three times a week. 你预测会听到的问句是：',
      options: ['How often do you...?', 'How long do you...?', 'What time do you...?'], answer: 0,
      explain: '三个选项都表示“多久一次”（频率），所以问句多半以 How often 开头。放音前先猜好问句类型，听的时候只要确认是哪个频率就行。How long 要回答一段时间，What time 要回答钟点。' },
    { type: 'choice', q: '【抓关键词】听对话，回答问题：Where will the girl meet her friend?',
      say: [{ who: 'M', text: 'Are you going shopping with Mary this afternoon?' }, { who: 'W', text: 'Yes. We will meet at the bookstore at two and then go to the mall together.' }],
      options: ['At the bookstore.', 'At the mall.', 'At the school gate.'], answer: 0,
      explain: '题干的疑问词是 Where，动词是 meet，所以第一遍就盯住 meet 后面的地点：meet at the bookstore。mall 是她们见面以后才去的地方，不是见面地点。先圈出疑问词和动词，就知道该抓哪个信息。' },
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: 'Tom is washing his dog in the yard.',
      options: ['图：男孩在院子里给狗洗澡', '图：男孩在院子里遛狗', '图：男孩在院子里洗衣服'], answer: 0,
      explain: '另外两幅图分别借用了原句里的 dog 和 washing，这正是“原词复现”陷阱：遛狗的图有 dog，洗衣服的图有 wash。只有把动作和对象连起来听——washing his dog（给狗洗澡）——才能选对。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'How long does it take you to get to school?',
      options: ['About twenty minutes.', 'By bike.', 'Every day.'], answer: 0,
      explain: 'How long does it take...? 问“花多长时间”，回答一段时间 About twenty minutes。By bike 回答 How，Every day 回答 How often，都是听到 school 就乱选的答非所问。' },
    { type: 'choice', q: '听对话，回答问题：How much should the girl pay for the ice creams?',
      say: [{ who: 'W', text: 'I want two ice creams, please. How much are they?' }, { who: 'M', text: 'Six yuan each.' }, { who: 'W', text: "Here's twenty yuan." }],
      options: ['6 yuan.', '12 yuan.', '20 yuan.'], answer: 1,
      explain: '买两个冰淇淋，每个 6 元，6 × 2 = 12 元，这是她该付的钱。20 元是她递过去的钱，要找回 8 元；6 元是单价。数字题要听清问的是单价、总价还是给出的钱。' }
  ],
  tests: [
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: 'My father goes to work by subway every day.',
      options: ['图：爸爸骑自行车上班', '图：爸爸坐地铁上班', '图：爸爸开车上班'], answer: 1,
      explain: '原文说 by subway，乘地铁。' },
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: "It's rainy today, so don't forget to take your umbrella.",
      options: ['图：晴天，一个人戴着太阳镜', '图：下雪天，孩子们在堆雪人', '图：下雨天，一个人打着伞'], answer: 2,
      explain: 'rainy（下雨的）和 umbrella（雨伞）两个关键词都指向下雨天打伞。' },
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: 'Lucy is cleaning her room, and her brother is watering the flowers.',
      options: ['图：女孩在打扫房间，男孩在给花浇水', '图：女孩在给花浇水，男孩在打扫房间', '图：女孩和男孩一起在打扫房间'], answer: 0,
      explain: 'Lucy（女孩）在 cleaning her room，her brother（男孩）在 watering the flowers。这种题要把“谁”和“做什么”对上号，不能只听动作。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'Would you like to go hiking with us this Sunday?',
      options: ["I'd love to, but I have to visit my grandma.", 'Yes, I went hiking last week.', 'By bus.'], answer: 0,
      explain: 'Would you like to...? 是邀请，要表示接受或婉拒。I\'d love to, but... 是礼貌的婉拒。另外两项一个时态不对，一个答非所问。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: "I'm sorry I broke your cup.",
      options: ["That's all right.", "You're welcome.", 'Yes, please.'], answer: 0,
      explain: '对方道歉，回答“没关系”That\'s all right.；You\'re welcome 是回应感谢的，Yes, please 是接受别人提供的东西。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'Could you please turn down the music? The baby is sleeping.',
      options: ['Sorry, I will.', 'Yes, I can play the piano.', "No, she isn't."], answer: 0,
      explain: 'Could you please...? 是请求对方把音乐调小，合适的回答是道歉并照做：Sorry, I will.' },
    { type: 'choice', q: '听对话，回答问题：Where is the library?',
      say: [{ who: 'W', text: 'Excuse me, how can I get to the library?' }, { who: 'M', text: "Go along this street and turn left at the second crossing. It's next to the bank." }],
      options: ['Next to the bank.', 'Across from the bank.', 'At the first crossing.'], answer: 0,
      explain: '男士最后说 It\'s next to the bank（在银行旁边）。是在第二个路口左转，不是第一个。' },
    { type: 'choice', q: '听对话，回答问题：What will Jim do after school?',
      say: [{ who: 'W', text: 'Shall we play basketball after school, Jim?' }, { who: 'M', text: "I'd like to, but I have to finish my science report first. Maybe tomorrow." }],
      options: ['Play basketball.', 'Finish his science report.', 'Go to the science museum.'], answer: 1,
      explain: 'but 后面才是事实：I have to finish my science report first，打篮球改到明天了。“科学博物馆”只是借用了 science 这个原词。' },
    { type: 'choice', q: '听对话，回答问题：Where are the speakers probably?',
      say: [{ who: 'M', text: 'Good morning. What can I do for you?' }, { who: 'W', text: "I'd like to buy a T-shirt for my son. He's about ten." }, { who: 'M', text: "How about this blue one? It's on sale." }],
      options: ['In a shop.', 'In a hospital.', 'In a library.'], answer: 0,
      explain: 'What can I do for you?、buy a T-shirt、on sale（打折）都是商店里的话，所以是在商店。' },
    { type: 'choice', q: '听对话，回答问题：How much will the boy pay?',
      say: [{ who: 'M', text: 'How much is this notebook?' }, { who: 'W', text: "Five yuan. If you buy two, it's only eight yuan." }, { who: 'M', text: "OK, I'll take two." }],
      options: ['Five yuan.', 'Eight yuan.', 'Ten yuan.'], answer: 1,
      explain: '一本 5 元，买两本只要 8 元，男孩说 I\'ll take two（要两本），所以付 8 元。10 元是没听到优惠时算出来的陷阱。' },
    { type: 'choice', q: '【预读】放音前看到三幅图：图一 爸爸在洗车；图二 爸爸在修车；图三 妈妈在洗车。听句子时最关键要听清：',
      options: ['是爸爸还是妈妈，以及是洗车还是修车', '车是什么颜色', '当天是什么天气'], answer: 0,
      explain: '三幅图的不同之处是人物（爸爸/妈妈）和动作（wash / repair），这就是要听的地方。颜色和天气三幅图里没有区别，不需要特别去听。' },
    { type: 'choice', q: '【预读】放音前看到三幅图：图一 晴天，一家人在公园野餐；图二 雨天，一家人在家看电视；图三 雨天，一家人在公园散步。听的时候要重点抓：',
      options: ['天气和地点', '人数和年龄', '具体的时间点'], answer: 0,
      explain: '三幅图在天气（晴/雨）和地点（公园/家里）上有差别，所以要听 sunny / rainy 和 in the park / at home。人数、时间三幅图都一样，不是考点。' },
    { type: 'choice', q: '【预测】放音前看到选项：By bus. / On foot. / By bike. 问句最可能是：',
      options: ['How do you go to school?', 'How often do you go to school?', 'When do you go to school?'], answer: 0,
      explain: '三个选项都是交通方式，所以问句应该是 How do you go...?。How often 要回答频率，When 要回答时间。' },
    { type: 'choice', q: '【预测】放音前看到选项：For two hours. / For three days. / For a week. 问句最可能用哪个疑问词开头？',
      options: ['How long', 'How often', 'How far'], answer: 0,
      explain: 'for + 一段时间回答的是“多长时间”，对应 How long。How often 问频率（twice a week），How far 问距离（two kilometers）。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'What are you doing now, Amy?',
      options: ["I'm doing my homework.", 'I did my homework.', "I'll do my homework tomorrow."], answer: 0,
      explain: '问句是现在进行时 are you doing now，答语也要用进行时 I\'m doing。另外两项一个是过去、一个是将来，时态不对。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'Have you ever been to Beijing?',
      options: ['Yes, I have. I went there last year.', 'Yes, I do. I like it.', "No, I won't."], answer: 0,
      explain: 'Have you ever...? 用现在完成时问经历，要用 Yes, I have. / No, I haven\'t. 回答，后面可以用过去时补充具体时间。I do、I won\'t 和问句的助动词对不上。' },
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: 'Lily is writing a letter to her pen pal.',
      options: ['图：女孩在书桌前写信', '图：女孩坐在沙发上读信', '图：女孩在邮局寄信'], answer: 0,
      explain: '三幅图都和 letter（信）有关，这是原词复现的陷阱。关键是动词 writing（写），不是读，也不是寄。' },
    { type: 'choice', q: '听对话，回答问题：What is Ben\'s favorite subject?',
      say: [{ who: 'W', text: 'Is math your favorite subject, Ben? You always get good grades in it.' }, { who: 'M', text: 'Math is OK, but actually I like history best.' }],
      options: ['Math.', 'History.', 'Science.'], answer: 1,
      explain: '对话先提到 math，还说他数学成绩好，但 Ben 说 but actually I like history best，转折后面才是他真正最喜欢的：历史。' },
    { type: 'choice', q: '听句子，回答问题：Where will they go on Sunday?',
      say: 'We wanted to have a picnic in the park on Sunday. However, the weather report says it will rain, so we will go to the museum instead.',
      options: ['To the park.', 'To the museum.', 'To the beach.'], answer: 1,
      explain: '本来打算去公园野餐，However 后面改了计划：会下雨，所以 go to the museum instead（改去博物馆）。instead 意思是“代替”，也是改主意的信号。' },
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: "Mike didn't ride his bike to school today. He walked there with his sister.",
      options: ['图：Mike 骑自行车上学', '图：Mike 和姐姐步行上学', '图：Mike 和姐姐坐公交车上学'], answer: 1,
      explain: '第一句有否定词 didn\'t：今天没有骑车。第二句 walked there with his sister 说明他和姐姐步行去的。只听到 bike 就会选错。' },
    { type: 'choice', q: '听对话，回答问题：What does the man think of the film?',
      say: [{ who: 'W', text: 'Did you enjoy the new film last night?' }, { who: 'M', text: "Not really. The story wasn't interesting at all." }],
      options: ['Interesting.', 'Boring.', 'Exciting.'], answer: 1,
      explain: 'Not really 表示“不怎么样”，后面 wasn\'t interesting at all（一点也不有趣）是否定，所以他觉得电影无聊。选项 Interesting 是原文的词，但前面有 not，意思正好相反。' },
    { type: 'choice', q: '听句子，回答问题：How much is the shirt?', say: 'This shirt is thirty yuan. It is very cheap.',
      options: ['13 yuan.', '30 yuan.', '33 yuan.'], answer: 1,
      explain: 'thirty 重音在前：THIR-ty，是 30；thirteen 重音在后，是 13。' },
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: 'Look! There are many sheep on the hill.',
      options: ['图：山坡上有很多羊', '图：海上有很多船', '图：山坡上有很多牛'], answer: 0,
      explain: 'sheep（羊）的元音是长音 /iː/，ship（船）是短音 /ɪ/。句子还说 on the hill（在山坡上），船不会在山坡上。' },
    { type: 'choice', q: '听句子，选出与句子内容相符的图片。', say: 'My mother works in a hospital. She is a nurse.',
      options: ['图：妈妈在医院当护士', '图：妈妈在医院门口散步', '图：妈妈在学校当老师'], answer: 0,
      explain: 'works 是“工作”，不是 walks（散步）。work 的元音 /ɜː/ 像拖长的“额”，walk 的元音 /ɔː/ 像拖长的“哦”，而且 l 不发音。后一句 She is a nurse 也帮你确认是在医院工作。' },
    { type: 'choice', q: '听对话，回答问题：What time is it now?',
      say: [{ who: 'W', text: 'Hurry up! The train leaves at nine o\'clock.' }, { who: 'M', text: "Don't worry. We still have fifteen minutes." }],
      options: ['8:45.', '9:00.', '9:15.'], answer: 0,
      explain: '火车九点开，还有十五分钟，所以现在是 9:00 减 15 分钟 = 8:45。9:00 是原文直接说的数字，9:15 是把减法算成了加法。' },
    { type: 'choice', q: '听对话，回答问题：How much will the man pay?',
      say: [{ who: 'M', text: 'How much are the apples?' }, { who: 'W', text: 'Four yuan a kilo.' }, { who: 'M', text: "They look fresh. I'll take three kilos." }],
      options: ['4 yuan.', '7 yuan.', '12 yuan.'], answer: 2,
      explain: '苹果每公斤 4 元，他要 3 公斤，4 × 3 = 12 元。4 是单价，7 是把两个数加起来了，都是陷阱。' },
    { type: 'choice', q: '听对话，回答问题：How old is the boy\'s brother?',
      say: [{ who: 'W', text: 'How old is your brother?' }, { who: 'M', text: "I'm twelve, and he is three years older than me." }],
      options: ['12.', '15.', '9.'], answer: 1,
      explain: '男孩 12 岁，哥哥比他大三岁（three years older），12 + 3 = 15。12 是男孩自己的年龄；9 是把 older 当成 younger 算出来的。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'How long have you studied English?',
      options: ['For six years.', 'Twice a week.', 'In the classroom.'], answer: 0,
      explain: 'How long 问“多长时间”，用 for + 一段时间回答。Twice a week 回答 How often，In the classroom 回答 Where。' },
    { type: 'choice', q: '听句子，选出最恰当的答语。', say: 'How far is your home from the school?',
      options: ['About two kilometers.', 'Three times a day.', 'Since last year.'], answer: 0,
      explain: 'How far 问距离，用 about two kilometers 这类回答。Three times a day 是频率，Since last year 是时间，都答非所问。' },
    { type: 'choice', q: '听对话，回答问题：What is the relationship between the two speakers?',
      say: [{ who: 'W', text: "Open your mouth and say 'ah'. Hmm, you have a bad cold." }, { who: 'M', text: 'Do I need to take any medicine?' }, { who: 'W', text: 'Yes. Take this medicine three times a day and drink more water.' }],
      options: ['Doctor and patient.', 'Teacher and student.', 'Mother and son.'], answer: 0,
      explain: 'Open your mouth、you have a bad cold、take this medicine 都是医生看病时说的话，所以是医生和病人。' }
  ]
},

/* ================= 长对话与独白 ================= */
{
  id: 's-listening-long', title: '听力：长对话、独白与信息记录', short: '长对话与独白', module: 'skill', grade: 8, freq: 3,
  prereqs: ['s-listening-basic', 'v-numbers-time'],
  tip: '长对话和独白考你在较长材料里抓时间、地点、数字、人名和说话人的态度，信息记录还要求拼写正确，最大陷阱是“先说的数字被后面改掉了”。（具体题量分值以当年《考试说明》为准）',
  learn: [
    { h: '题型说明', html: `
      <p>听力后半部分材料变长了：</p>
      <ul>
        <li><b>长对话</b>：两个人说 8–12 句，后面跟 3–5 道选择题。</li>
        <li><b>独白</b>：一个人讲一段话，比如通知、广播、介绍、小故事。</li>
        <li><b>信息记录</b>：边听边填表格，一般每空填一个词或数字，常考日期、时间、价格、房间号、人名（人名常会拼读出来，如 C-H-E-N）。</li>
      </ul>
      <p>材料一般读两遍。题目的顺序和原文顺序基本一致，这是你最好的“导航”。</p>
      <div class="rhyme">放音之前读题干，圈出 when、where、how much；<br>数字时间先别急，后面可能会改口；<br>but、however 要竖耳，态度就听形容词。</div>` },
    { h: '解题步骤', html: `<ol>
      <li><b>预读题干</b>：利用放音前的时间，把这一段的所有题目快速读一遍，圈出疑问词和关键名词（time、place、price…）。</li>
      <li><b>预测内容</b>：从题目推测话题，例如题目里有 camp、cost、sign up，就知道是一则夏令营通知。</li>
      <li><b>第一遍：边听边记</b>：数字用阿拉伯数字快速记在旁边（8:15、300、206），人名先记首字母。</li>
      <li><b>第二遍：核对 + 补空</b>：重点听转折词和改口的地方，把拼写不确定的词核对清楚。</li>
      <li><b>检查信息记录</b>：首字母大写的专有名词（Museum、Chen）、序数词（15th）、单复数都要看一眼。</li>
    </ol>` },
    { h: '常见陷阱', html: `
      <table class="tbl">
        <tr><th>陷阱</th><th>原文怎么说</th><th>正确理解</th></tr>
        <tr><td>改口</td><td>At first we planned to go by bus, but we'll ride our bikes.</td><td>最后是骑车去</td></tr>
        <tr><td>数字干扰</td><td>The home is two kilometers away... We'll stay about three hours.</td><td>问“待多久”答三小时，“二”是距离</td></tr>
        <tr><td>否定转移</td><td>It will be held at the museum, not at our school.</td><td>地点是博物馆</td></tr>
        <tr><td>态度隐藏</td><td>I'm sure it will be a meaningful day.</td><td>态度是“有意义的”，积极</td></tr>
        <tr><td>拼写人名</td><td>His name is Chen, C-H-E-N.</td><td>填 Chen，首字母大写</td></tr>
      </table>
      <p class="warn">信息记录拼错一个字母就不得分！数字题注意 fifteen（15）和 fifty（50）听起来很像，听重音：fif<b>TEEN</b>，<b>FIF</b>ty。</p>` },
    { h: '说话人态度怎么听', html: `
      <p>态度题常问 What does Peter think of...? / How does the woman feel?</p>
      <ul>
        <li>听形容词：<span class="w">meaningful</span>、<span class="w">boring</span>、<span class="w">exciting</span>、<span class="w">tiring</span>。</li>
        <li>听语气：Great! / Good idea! 是赞成；Well... I'm not sure. 是犹豫；Oh no! 是失望。</li>
        <li>听转折：It's interesting, but it's too expensive. 重点在 but 后面——觉得太贵。</li>
      </ul>` },
    { h: '实战演示', html: `
      <p>题目（放音前先读）：When is the party? / What time will Jack arrive?</p>
      <p class="ex">W: Jack, my birthday party is on Saturday afternoon. Can you come?<span class="zh">女：杰克，我的生日聚会在周六下午，你能来吗？</span></p>
      <p class="ex">M: Sorry, I have a piano lesson on Saturday.<span class="zh">男：抱歉，我周六有钢琴课。</span></p>
      <p class="ex">W: Then I'll change it to Sunday. My cousin can't come on Saturday, either.<span class="zh">女：那我改到周日吧，我表姐周六也来不了。</span></p>
      <p class="ex">M: Great! What time?<span class="zh">男：太好了！几点？</span></p>
      <p class="ex">W: Three o'clock. Please come half an hour early to help me.<span class="zh">女：三点。请提前半小时来帮我。</span></p>
      <p><b>思路</b>：</p>
      <ol>
        <li>预读：两题一问日期、一问时间，所以要盯住星期和钟点。</li>
        <li>第一次听到 Saturday——别急着选，后面 I'll <b>change</b> it to Sunday 改口了，聚会在周日下午。</li>
        <li>时间：聚会三点，但 come half an hour early（提前半小时），所以 Jack 2:30 到。</li>
      </ol>` }
  ],
  passages: {
    e1: { title: '例：听对话，回答问题', hidden: true, html: '',
      say: [
        { who: 'W', text: 'Jack, my birthday party is on Saturday afternoon. Can you come?' },
        { who: 'M', text: 'Sorry, I have a piano lesson on Saturday.' },
        { who: 'W', text: "Then I'll change it to Sunday. My cousin can't come on Saturday, either." },
        { who: 'M', text: 'Great! What time?' },
        { who: 'W', text: "Three o'clock. Please come half an hour early to help me." },
        { who: 'M', text: 'No problem.' }
      ] },
    p1: { title: '长对话：周末志愿活动（听对话，回答第 1–5 题）', hidden: true, html: '',
      say: [
        { who: 'W', text: 'Hi, Peter. Are you free this Saturday?' },
        { who: 'M', text: 'I think so. Why?' },
        { who: 'W', text: "Our class is going to visit the Sunshine Old People's Home. Would you like to join us?" },
        { who: 'M', text: 'Sure. What are we going to do there?' },
        { who: 'W', text: "We'll clean the rooms, sing songs and chat with the old people. Some of them like playing Chinese chess, too." },
        { who: 'M', text: "Great! I'm good at chess. When shall we meet?" },
        { who: 'W', text: "At eight fifteen at the school gate. At first we planned to go by bus, but the home is only two kilometers away, so we'll ride our bikes." },
        { who: 'M', text: "Good idea. It's good exercise. How long will we stay there?" },
        { who: 'W', text: "About three hours. We'll be back before lunch." },
        { who: 'M', text: 'Should I bring anything?' },
        { who: 'W', text: "Bring some fruit for the old people if you can. And don't forget your water bottle." },
        { who: 'M', text: "OK. I'm sure it will be a meaningful day." }
      ] },
    p2: { title: '独白：夏令营通知（听独白，完成信息记录 6–10 题）', hidden: true,
      html: '<p class="muted">信息记录：每空填一个单词或数字。</p>',
      say: "Good morning, everyone. I have some news about this year's Summer Science Camp. The camp will start on July fifteenth and last for five days. It will be held at Fuzhou Science Museum, not at our school. Every morning, students will do experiments with real scientists, and in the afternoon they will visit factories and farms. The camp costs three hundred yuan, including lunch. If you want to join, please write your name on the list in Room two oh six before Friday. If you have any questions, please ask Mr. Chen. That's C-H-E-N, Chen. Remember, only forty students can join, so hurry up!" },
    e2: { title: '例：听独白（校园广播），回答问题', hidden: true, html: '',
      say: "Hello, everyone. This is your headteacher speaking. Our school sports meeting will be held next Wednesday and Thursday. It will take place at the city stadium, not on our school playground, because our playground is being repaired. The buses will leave the school gate at seven forty in the morning, so please don't be late. Remember to wear your school uniform and bring enough water. I'm sure all of you will do your best. Good luck!" },
    p3: { title: '长对话：买运动鞋（听对话，回答第 11–16 题）', hidden: true, html: '',
      say: [
        { who: 'W', text: 'Tom, your sports shoes are too small now. Let\'s buy a new pair this afternoon.' },
        { who: 'M', text: 'Great! Can we go to the shoe shop on Center Street?' },
        { who: 'W', text: "That shop is closed on Mondays. We'll go to the shopping mall near the park instead." },
        { who: 'M', text: 'OK. Shall we take a taxi?' },
        { who: 'W', text: "No need. It's not far. We can walk there in about fifteen minutes." },
        { who: 'M', text: "Look at these blue ones, Mom. They're so cool!" },
        { who: 'W', text: "They look nice, but they cost five hundred yuan. That's too expensive." },
        { who: 'M', text: "What about these white ones? They're only two hundred and fifty yuan." },
        { who: 'W', text: "Let me see. They're comfortable and not expensive. Let's take them." },
        { who: 'M', text: 'Can I buy a pair of sports socks, too? They are twenty yuan.' },
        { who: 'W', text: "Sure. You'll need them when you play football." },
        { who: 'M', text: 'Thanks, Mom! I really love my new shoes.' }
      ] },
    p4: { title: '独白：图书馆介绍（听独白，完成信息记录 17–23 题）', hidden: true,
      html: '<p class="muted">信息记录：每空填一个单词或数字。</p>',
      say: "Hello, boys and girls. Welcome to Sunshine Library. Let me tell you something about our library. It opens at nine in the morning and closes at six thirty in the evening, from Tuesday to Sunday. It is closed on Mondays. You can borrow three books at a time, and you must return them within two weeks. Our reading room is on the second floor, not the first floor. Please keep quiet there, and don't eat or drink. If you want to join our reading club, please call Miss White. That's W-H-I-T-E, White. Her phone number is eight three six two, five oh nine one. Every Saturday afternoon, we have story time for little children. Enjoy your reading!" },
    e3: { title: '例：听独白（活动通知），完成信息记录', hidden: true,
      html: '<p class="muted">信息记录：每空填一个单词或数字。</p>',
      say: "Attention, please. Our school art show will open on May the third. You can see more than two hundred paintings by our students. The show will be in the Art Building, Room three oh two. It is open from eight a.m. to five p.m. Everyone is welcome!" }
  },
  examples: [
    { type: 'choice', passage: 'e1', q: 'When is the party?',
      options: ['On Saturday afternoon.', 'On Sunday afternoon.', 'On Sunday morning.'], answer: 1,
      explain: '女孩先说周六下午，但 Jack 周六有钢琴课，她接着说 I\'ll change it to Sunday，时间是三点，所以是周日下午。' },
    { type: 'choice', passage: 'e1', q: 'What time will Jack arrive?',
      options: ['At 2:30.', 'At 3:00.', 'At 3:30.'], answer: 0,
      explain: '聚会三点开始，女孩请他 come half an hour early（提前半小时），3:00 减 30 分钟是 2:30。' },
    { type: 'fill', q: '听句子，记录这个人名（注意大小写）：', say: 'My English teacher is Miss Brown. Her name is spelled B-R-O-W-N.', answer: ['Brown'],
      explain: '原文拼读了 B-R-O-W-N。人名是专有名词，首字母要大写。' },
    { type: 'choice', q: '【预读与预测】放音前读到这一段的三道题：How much does the trip cost? / When should students sign up? / What should students bring? 这段材料最可能是：',
      options: ['一则学校组织出游的通知', '一段在医院看病的对话', '一个关于动物的童话故事'], answer: 0,
      explain: '预读时圈出关键词：cost（费用）、sign up（报名）、bring（带什么），这些都是活动通知里常说的内容，所以可以预测是一则出游通知。听之前心里有数，听的时候就知道该记价格、日期和物品。' },
    { type: 'choice', q: '【题目顺序】一段长对话后面有 3 道题，第 1 题问见面时间，第 2 题问交通方式，第 3 题问要带什么。听的时候最好的做法是：',
      options: ['按题号顺序边听边找答案，听到时间就先答第 1 题', '先听完全文，最后再一起看题', '从第 3 题开始倒着找答案'], answer: 0,
      explain: '听力题目的顺序和原文顺序基本一致，题号就是你的“导航”：先等第 1 题的信息，答完马上盯第 2 题。听完再看题，前面的细节很可能已经忘了。' },
    { type: 'choice', passage: 'e2', q: 'Where will the sports meeting be held?',
      options: ['On the school playground.', 'At the city stadium.', 'In the school gym.'], answer: 1,
      explain: '原文：at the city stadium, not on our school playground。not 后面是被否定的地点，学校操场正在维修，所以运动会在市体育场举行。只听到 school playground 就会掉进“否定转移”的陷阱。' },
    { type: 'fill', passage: 'e2', q: 'The buses will leave at ___ in the morning.（填时间，如 8:15）', answer: ['7:40', '7.40', 'seven forty'],
      explain: '原文：at seven forty in the morning。边听边用阿拉伯数字记下 7:40，比写英文单词快得多。注意 forty 是 40，不是 fourteen。' },
    { type: 'choice', q: '听对话，回答问题：How does the woman feel about the plan?',
      say: [{ who: 'M', text: 'Shall we go to the new science museum this weekend?' }, { who: 'W', text: "Well... I'm not sure. I went there last month, and it was too crowded." }],
      options: ['She is excited about it.', 'She is not very interested.', 'She is angry about it.'], answer: 1,
      explain: 'Well... I\'m not sure 是犹豫的语气，后面又说上个月去过、人太多，说明她对这个计划不太感兴趣。并没有生气，也不是兴奋。态度题要听语气和形容词。' },
    { type: 'fill', q: '听句子，完成信息记录：Ticket price: ___ yuan each.（填数字）', say: 'The concert tickets are fifty yuan each, and children under six can go in for free.', answer: ['50', 'fifty'],
      explain: 'fifty 重音在前：FIF-ty，是 50；fifteen 重音在后：fif-TEEN，是 15。six 是“六岁以下”，不是价格。' },
    { type: 'fill', q: '听句子，完成信息记录：Bring two ___ and an eraser.（填一个词，注意单复数）', say: 'For the drawing test, please bring two pencils and an eraser.', answer: ['pencils'],
      explain: 'two 后面的名词要用复数 pencils。信息记录写完要检查单复数，少一个 s 就不得分。' },
    { type: 'choice', q: '【预读题干】放音前读到题目：What time does the museum close on weekends? 下面哪一组是你应该圈出的关键词？',
      options: ['What time、close、weekends', 'the、does、museum', 'on、the、does'], answer: 0,
      explain: '预读时圈疑问词（What time）和关键名词、动词（close 关门、weekends 周末）。这样听的时候就知道要找“周末关门的钟点”，平时的开门时间、工作日的时间都是干扰。the、does、on 这类词没有信息量。' },
    { type: 'fill', passage: 'e3', q: '【信息记录】Date: May ___（填日期）', answer: ['3rd', '3', 'third'],
      explain: '原文：will open on May the third。日期用序数词读，记录时写 3rd 或 3。信息记录题要一边听一边按表格的顺序往下填。' },
    { type: 'fill', passage: 'e3', q: '【信息记录】Place: the Art Building, Room ___（填数字）', answer: ['302'],
      explain: '原文：Room three oh two。房间号里的 oh 是 0，所以是 302。two hundred 是画的数量，不是房间号，别记混了。' },
    { type: 'choice', q: '听对话，回答问题：How long will the boy stay in Beijing?',
      say: [{ who: 'W', text: 'When are you leaving for Beijing?' }, { who: 'M', text: 'On July the tenth. The train ride takes about five hours.' }, { who: 'W', text: 'How long will you stay there?' }, { who: 'M', text: 'For two weeks. My uncle will show me around.' }],
      options: ['Five hours.', 'Ten days.', 'Two weeks.'], answer: 2,
      explain: '对话里有三个数字：10 号出发，坐火车五小时，在北京待两周。题目问 stay there 多久，对应 For two weeks。“五小时”是路上的时间，“十”是日期，都是数字干扰。' },
    { type: 'choice', q: '听对话，回答问题：What does the girl think of the dress?',
      say: [{ who: 'M', text: 'Do you like this dress? It looks great on you.' }, { who: 'W', text: "It's really pretty, but it's too expensive for me. I'll look for another one." }],
      options: ['It is cheap.', 'It is too expensive.', 'It is too big.'], answer: 1,
      explain: '她先夸 It\'s really pretty，but 后面才是重点：it\'s too expensive for me，而且她要去找别的，说明她嫌太贵。态度题遇到 but，要以转折后的内容为准。' }
  ],
  tests: [
    { type: 'choice', passage: 'p1', q: '1. Where are they going this Saturday?',
      options: ['To a hospital.', "To an old people's home.", 'To a chess club.'], answer: 1,
      explain: '女孩说 Our class is going to visit the Sunshine Old People\'s Home。下棋只是在敬老院做的事之一。' },
    { type: 'choice', passage: 'p1', q: '2. How will they get there?',
      options: ['By bus.', 'By bike.', 'On foot.'], answer: 1,
      explain: 'At first we planned to go by bus, but... we\'ll ride our bikes。but 后面改口了，骑自行车去。' },
    { type: 'choice', passage: 'p1', q: '3. What time will they meet?',
      options: ['At 8:00.', 'At 8:15.', 'At 8:50.'], answer: 1,
      explain: '原文说 At eight fifteen at the school gate，即 8:15。注意 fifteen 和 fifty 的区别。' },
    { type: 'choice', passage: 'p1', q: '4. How long will they stay there?',
      options: ['About two hours.', 'About three hours.', 'About four hours.'], answer: 1,
      explain: 'Peter 问 How long will we stay there?，回答是 About three hours。two 是“两公里”的距离，是干扰。' },
    { type: 'choice', passage: 'p1', q: '5. What does Peter think of the activity?',
      options: ['Boring.', 'Tiring.', 'Meaningful.'], answer: 2,
      explain: '对话最后 Peter 说 I\'m sure it will be a meaningful day，他觉得这次活动有意义。' },
    { type: 'fill', passage: 'p2', q: '6. Date: The camp starts on July ___.（填数字）', answer: ['15', '15th', 'fifteenth', 'fifteen'],
      explain: '原文：The camp will start on July fifteenth，7 月 15 日。' },
    { type: 'fill', passage: 'p2', q: '7. Time: It lasts for ___ days.（填数字或英文单词）', answer: ['5', 'five'],
      explain: '原文：last for five days，持续五天。' },
    { type: 'fill', passage: 'p2', q: '8. Cost: ___ yuan, including lunch.（填数字）', answer: ['300', 'three hundred'],
      explain: '原文：The camp costs three hundred yuan, including lunch，300 元含午餐。' },
    { type: 'fill', passage: 'p2', q: '9. How to join: Write your name on the list in Room ___ before Friday.（填数字）', answer: ['206'],
      explain: '原文：in Room two oh six before Friday。房间号里的 oh 就是数字 0，所以是 206。' },
    { type: 'fill', passage: 'p2', q: '10. Questions? Ask Mr. ___.（填人名）', answer: ['Chen'],
      explain: '原文拼读了 C-H-E-N，Chen。人名首字母大写。' },
    { type: 'choice', passage: 'p3', q: '11. Where will they buy the shoes?',
      options: ['At the shoe shop on Center Street.', 'At the shopping mall near the park.', 'On the Internet.'], answer: 1,
      explain: 'Tom 想去 Center Street 的鞋店，但妈妈说那家店周一关门，We\'ll go to the shopping mall near the park instead，改去公园附近的商场。' },
    { type: 'choice', passage: 'p3', q: '12. How will they get there?',
      options: ['By taxi.', 'By bus.', 'On foot.'], answer: 2,
      explain: 'Tom 问要不要打车，妈妈说 No need… We can walk there，所以是步行。原文说 walk，选项换成 On foot，这是同义替换。taxi 是被否定的原词。' },
    { type: 'choice', passage: 'p3', q: '13. How long will it take them to walk there?',
      options: ['About 5 minutes.', 'About 15 minutes.', 'About 50 minutes.'], answer: 1,
      explain: '原文 in about fifteen minutes，重音在后 fif-TEEN，是 15 分钟。' },
    { type: 'choice', passage: 'p3', q: '14. What does Mom think of the blue shoes?',
      options: ['They are too expensive.', 'They are too small.', 'They are not cool.'], answer: 0,
      explain: '妈妈说 They look nice, but they cost five hundred yuan. That\'s too expensive. but 后面才是她真正的态度：太贵了。too small 说的是 Tom 的旧鞋。' },
    { type: 'choice', passage: 'p3', q: '15. How much will they pay in all?',
      options: ['250 yuan.', '270 yuan.', '520 yuan.'], answer: 1,
      explain: '他们买了白鞋 250 元，又买了一双袜子 20 元，in all（一共）250 + 20 = 270 元。500 元的蓝鞋没有买，520 是干扰。' },
    { type: 'choice', passage: 'p3', q: '16. How does Tom feel at the end?',
      options: ['Happy.', 'Disappointed.', 'Worried.'], answer: 0,
      explain: '最后 Tom 说 Thanks, Mom! I really love my new shoes，语气很开心。他没买成蓝鞋，但并没有表现出失望。' },
    { type: 'fill', passage: 'p4', q: '17. Opening hours: 9:00 a.m. – ___ p.m.（填时间）', answer: ['6:30', '6.30', 'six thirty', 'half past six'],
      explain: '原文：closes at six thirty in the evening，晚上 6:30 关门。' },
    { type: 'fill', passage: 'p4', q: '18. The library is closed on ___.（填星期，首字母大写）', answer: ['Mondays', 'Monday'],
      explain: '原文：It is closed on Mondays。星期名称首字母要大写。' },
    { type: 'fill', passage: 'p4', q: '19. You can borrow ___ books at a time.（填数字）', answer: ['3', 'three'],
      explain: '原文：You can borrow three books at a time。two 是归还期限 two weeks，不要混。' },
    { type: 'fill', passage: 'p4', q: '20. Return books within ___ weeks.（填数字）', answer: ['2', 'two'],
      explain: '原文：you must return them within two weeks，两周之内归还。' },
    { type: 'fill', passage: 'p4', q: '21. The reading room is on the ___ floor.（填一个序数词）', answer: ['second', '2nd'],
      explain: '原文：on the second floor, not the first floor。not 后面的 first 被否定了。楼层要用序数词 second，不能写 two。' },
    { type: 'fill', passage: 'p4', q: '22. Reading club: call Miss ___.（填人名）', answer: ['White'],
      explain: '原文拼读了 W-H-I-T-E。人名首字母大写。' },
    { type: 'fill', passage: 'p4', q: '23. Phone number: ___（填 8 位数字）', answer: ['83625091', '8362 5091', '8362-5091'],
      explain: '原文：eight three six two, five oh nine one。电话号码里的 oh 就是 0，所以是 8362 5091。' },
    { type: 'choice', q: '【预读】放音前读到题目 How much does the ticket cost?，听的时候你最该注意记下：',
      options: ['价格数字', '人名的拼写', '星期几'], answer: 0,
      explain: '预读时圈出疑问词 How much 和名词 ticket，这题问票价，所以要盯住 yuan 前面的数字。' },
    { type: 'choice', q: '【预测】放音前读到题目：Where will the class go? / What should they bring? / When will they come back? 这段材料的话题最可能是：',
      options: ['一次班级外出活动的安排', '一次在商店里讨价还价', '一次看病的经过'], answer: 0,
      explain: '三道题问去哪里、带什么、什么时候回来，都是外出活动安排的内容，所以可以预测话题是班级出游。' },
    { type: 'choice', q: '【题目顺序】你正在等第 2 题（问时间）的答案，却发现说话人已经在讲第 3 题问的价格了。最好的做法是：',
      options: ['马上转去听第 3 题，第 2 题留到第二遍再补', '停下来一直回想第 2 题，直到想起来', '放弃后面所有题'], answer: 0,
      explain: '题目顺序和原文顺序基本一致，原文已经讲到第 3 题的内容，说明第 2 题的信息漏掉了。不要卡住，先跟上第 3 题，材料会读两遍，第二遍再补第 2 题。' },
    { type: 'choice', q: '听对话，回答问题：What time will they meet?',
      say: [{ who: 'M', text: "Let's meet at the cinema at six." }, { who: 'W', text: "Six is too early. I have a dance class until six. Let's make it seven." }, { who: 'M', text: 'OK. See you at seven, then.' }],
      options: ['At 6:00.', 'At 7:00.', 'At 6:30.'], answer: 1,
      explain: '男孩先说六点，女孩说六点太早（舞蹈课六点才结束），改成 Let\'s make it seven，男孩也同意了。先说的数字被改口了，以最后确定的为准。' },
    { type: 'choice', q: '听句子，回答问题：When will the meeting start?', say: 'The class meeting will start at three, not at two, because Mr. Wang has a lesson at two.',
      options: ['At 2:00.', 'At 3:00.', 'At 2:30.'], answer: 1,
      explain: 'at three, not at two：not 否定的是两点，会议在三点开。后面 at two 是王老师上课的时间，是干扰。' },
    { type: 'choice', q: '听对话，回答问题：What does the woman think of the idea?',
      say: [{ who: 'M', text: "Let's plant some flowers in the school garden this Friday." }, { who: 'W', text: "Good idea! I'll bring some seeds." }],
      options: ['She agrees with it.', 'She disagrees with it.', "She isn't sure about it."], answer: 0,
      explain: 'Good idea! 表示赞成，她还主动说要带种子，所以她同意这个主意。' },
    { type: 'choice', q: '听句子，回答问题：How does the speaker feel?', say: "Oh no! I can't find my new bike anywhere. I only bought it last week.",
      options: ['Upset.', 'Excited.', 'Relaxed.'], answer: 0,
      explain: 'Oh no! 是失望、着急的语气，新自行车找不到了，所以心情很糟（upset）。' },
    { type: 'choice', q: '听句子，回答问题：How many classes are there in the school?', say: 'Our school is not very big. There are fifteen classes in it.',
      options: ['5.', '15.', '50.'], answer: 1,
      explain: 'fifteen 重音在后 fif-TEEN，是 15；fifty 重音在前，是 50。' },
    { type: 'fill', q: '听句子，完成信息记录：The next bus comes in ___ minutes.（填数字）', say: 'Sorry, you just missed the bus. The next one comes in fifty minutes.', answer: ['50', 'fifty'],
      explain: 'fifty 重音在前：FIF-ty，是 50。刚错过一班车，下一班要等 50 分钟。' },
    { type: 'fill', q: '听句子，记录街道名称（注意大小写）：I live on ___ Street.', say: 'I live on Baker Street. That is B-A-K-E-R, Baker.', answer: ['Baker'],
      explain: '原文拼读了 B-A-K-E-R。街道名是专有名词，首字母大写。' },
    { type: 'fill', q: '听句子，完成信息记录：Date: August ___（填日期）', say: 'Our summer camp will begin on August the twenty-first.', answer: ['21st', '21', 'twenty-first', 'twenty first'],
      explain: '日期用序数词读：the twenty-first 是 21 日，记录时写 21st 或 21。记日期时要留意 -st、-nd、-rd、-th 这些序数词词尾。' }
  ]
},

/* ================= 补全对话 ================= */
{
  id: 's-dialogue', title: '补全对话（七选五口语表达）', short: '补全对话', module: 'skill', grade: 8, freq: 3,
  prereqs: ['t-feelings', 't-request'],
  tip: '补全对话（七选五）考你根据上下文选出合适的口语句子，最大陷阱是只看空格前面一句，不看后面的回答——空格后面那句往往才是最大的线索。（具体题量分值以当年《考试说明》为准）',
  learn: [
    { h: '题型说明', html: `
      <p>给一段对话，中间挖掉 5 个句子，下面给出 7 个句子（A–G），选 5 个填回去，有 2 个是多余的干扰项。近年福建的模拟卷常用这种形式代替过去的“情景交际”单选（以当年《考试说明》为准），考的还是日常交际用语：问候、邀请、请求、问路、看病、购物、安慰鼓励等。</p>
      <p>这个网站里，每个空单独出一道选择题，选项是选项库里的完整句子，你直接选句子就行。</p>
      <div class="rhyme">一看问答配不配，二看前后连不连；<br>代词时态找线索，排除干扰选得全。</div>` },
    { h: '解题步骤', html: `<ol>
      <li><b>通读对话</b>：先不看选项，弄清楚谁和谁、在什么场合、聊什么话题。</li>
      <li><b>看问答关系</b>：空格后是答句（Yes / No / In the library / Twice a week），空格里就是问句；空格前是问句，空格里就是答句。</li>
      <li><b>看前后句</b>：空格后面的回答是什么类型？In the school library 是地点，所以空格是 Where... 问句。</li>
      <li><b>找代词和时态线索</b>：选项里的 it / there / that 指的是前面哪个东西？问句用过去时，答句也该是过去时。</li>
      <li><b>排除法</b>：先填最有把握的空，用掉的句子划掉；剩下两个空再从余下的句子里比较。</li>
      <li><b>回读检查</b>：五个空都填好后把整段对话读一遍，是否自然通顺。</li>
    </ol>` },
    { h: '常见陷阱', html: `
      <table class="tbl">
        <tr><th>陷阱</th><th>例子</th><th>怎么破</th></tr>
        <tr><td>疑问词不对</td><td>后面答 In the library，却选了 When will you go?</td><td>答地点用 Where，答时间用 When</td></tr>
        <tr><td>时态不对</td><td>考试是明天的事，却选 How was your test?</td><td>was 问过去，和“明天考试”矛盾</td></tr>
        <tr><td>一般疑问句的回答</td><td>空格后是 Yes, but...</td><td>空格里应是 Is / Can / Do 开头的问句</td></tr>
        <tr><td>交际用语错配</td><td>别人道谢，你选 Never mind.</td><td>Never mind 回应道歉；回应感谢用 You're welcome. / My pleasure.</td></tr>
      </table>
      <p class="warn">干扰项常常和话题有关，看起来“也说得通”。一定要把它放回空格，和前后两句连起来读一读。</p>` },
    { h: '实战演示', html: `
      <p>对话片段：</p>
      <p class="ex">A: You look tired, Mike. ___<span class="zh">A：迈克，你看起来很累。___</span></p>
      <p class="ex">B: I stayed up late last night to finish my report.<span class="zh">B：我昨晚熬夜写完了报告。</span></p>
      <p>备选：What happened? / What will you do tomorrow? / Where shall we meet?</p>
      <p><b>思路</b>：</p>
      <ol>
        <li>前一句 You look tired（你看起来很累），接下来自然要问“怎么了”。</li>
        <li>后一句 B 用过去时 stayed up 说明原因，正是在回答“发生什么事了”。</li>
        <li>What will you do tomorrow? 问明天的打算，和 B 说的昨晚的事时态矛盾，排除；Where shall we meet? 问地点，和后面的回答完全不搭。</li>
        <li>答案：What happened?</li>
      </ol>` }
  ],
  passages: {
    e1: { title: '例：补全对话（从 A–E 中选出能填入空白处的句子）',
      html: `<p>A: Excuse me. <span class="blank">(1)</span></p>
        <p>B: Sure. It's on Green Street, next to the post office.</p>
        <p>A: <span class="blank">(2)</span></p>
        <p>B: About ten minutes on foot.</p>
        <p>A: Thank you very much.</p>
        <p>B: <span class="blank">(3)</span></p>
        <p class="small">A. Could you tell me where the bookstore is?<br>B. When does it open?<br>C. How long does it take to walk there?<br>D. You're welcome.<br>E. What's the matter?</p>` },
    d1: { title: '补全对话（一）：从 A–G 中选出能填入空白处的句子，有两项多余',
      html: `<p>A: Hi, Kate. You look worried. <span class="blank">(1)</span></p>
        <p>B: I have a math test tomorrow, but I'm not ready.</p>
        <p>A: Don't worry. <span class="blank">(2)</span></p>
        <p>B: Really? That would be great. Are you free this evening?</p>
        <p>A: <span class="blank">(3)</span> I have to go to my piano lesson at six.</p>
        <p>B: How about this afternoon after school, then?</p>
        <p>A: OK. <span class="blank">(4)</span></p>
        <p>B: In the school library. It's quiet there.</p>
        <p>A: Good idea. See you then.</p>
        <p>B: <span class="blank">(5)</span> You're always so helpful.</p>
        <p class="small">A. What's wrong with you?<br>B. I'm afraid not.<br>C. Where shall we meet?<br>D. I can help you with it.<br>E. Thanks a lot.<br>F. How was your test?<br>G. When will you go?</p>` },
    d2: { title: '补全对话（二）：从 A–G 中选出能填入空白处的句子，有两项多余',
      html: `<p>A: Lin Tao, I'm going to Xiamen this weekend. <span class="blank">(1)</span></p>
        <p>B: Gulangyu, of course. It's a beautiful island with lots of old buildings.</p>
        <p>A: Sounds wonderful. <span class="blank">(2)</span></p>
        <p>B: You can take a ferry. It only takes about twenty minutes.</p>
        <p>A: <span class="blank">(3)</span></p>
        <p>B: Yes, but there are no cars on the island, so you'll have to walk.</p>
        <p>A: That's fine. I like walking. <span class="blank">(4)</span></p>
        <p>B: You should try the seafood. The fish balls there are delicious.</p>
        <p>A: Thanks for your advice. <span class="blank">(5)</span></p>
        <p>B: Have a good time!</p>
        <p class="small">A. Which place should I visit?<br>B. How can I get there?<br>C. Is it easy to get around there?<br>D. What food would you suggest?<br>E. I can't wait to go there.<br>F. How long have you lived there?<br>G. Who will you go with?</p>` },
    e2: { title: '例：补全对话（从 A–E 中选出能填入空白处的句子）',
      html: `<p>A: What's the matter, Jenny? You don't look well.</p>
        <p>B: <span class="blank">(1)</span></p>
        <p>A: Oh, dear. When did it start?</p>
        <p>B: <span class="blank">(2)</span> I didn't sleep well last night.</p>
        <p>A: You'd better see a doctor. <span class="blank">(3)</span></p>
        <p>B: Yes, please. That's very kind of you.</p>
        <p class="small">A. I have a bad headache.<br>B. It started yesterday afternoon.<br>C. Shall I take you to the hospital?<br>D. How was your trip?<br>E. I'll go there tomorrow.</p>` },
    d3: { title: '补全对话（三）：从 A–G 中选出能填入空白处的句子，有两项多余',
      html: `<p>A: Good morning. <span class="blank">(1)</span></p>
        <p>B: I have a sore throat and I keep coughing.</p>
        <p>A: How long have you been like this?</p>
        <p>B: <span class="blank">(2)</span></p>
        <p>A: Let me have a look. Open your mouth, please. Hmm, you have a bad cold. <span class="blank">(3)</span></p>
        <p>B: No, I don't. I just feel a little tired.</p>
        <p>A: Take this medicine three times a day and drink more hot water.</p>
        <p>B: <span class="blank">(4)</span></p>
        <p>A: Yes, but don't play football for a few days.</p>
        <p>B: OK, I won't.</p>
        <p>A: <span class="blank">(5)</span></p>
        <p>B: Thank you, doctor.</p>
        <p class="small">A. What's wrong with you?<br>B. For two days.<br>C. Do you have a fever?<br>D. Can I go to school tomorrow?<br>E. I hope you'll get well soon.<br>F. Twice a day.<br>G. Did you go to school today?</p>` },
    d4: { title: '补全对话（四）：从 A–G 中选出能填入空白处的句子，有两项多余',
      html: `<p>A: Good afternoon. Can I help you?</p>
        <p>B: Yes. <span class="blank">(1)</span></p>
        <p>A: What color would you like?</p>
        <p>B: Red. It's her favorite color.</p>
        <p>A: <span class="blank">(2)</span></p>
        <p>B: It looks nice. How much is it?</p>
        <p>A: <span class="blank">(3)</span></p>
        <p>B: Hmm, that's a bit expensive. <span class="blank">(4)</span></p>
        <p>A: Sure. This one is only 60 yuan. It's on sale.</p>
        <p>B: Great. <span class="blank">(5)</span></p>
        <p>A: Here's your change. Thank you.</p>
        <p class="small">A. I'm looking for a sweater for my sister.<br>B. How about this one?<br>C. It's 120 yuan.<br>D. Do you have a cheaper one?<br>E. I'll take it. Here's 100 yuan.<br>F. What size do you wear?<br>G. They are 50 yuan.</p>` },
    d5: { title: '补全对话（五）：从 A–G 中选出能填入空白处的句子，有两项多余',
      html: `<p>A: Hi, Sam. Why do you look so sad?</p>
        <p>B: <span class="blank">(1)</span> We lost the basketball match this morning.</p>
        <p>A: I'm sorry to hear that. <span class="blank">(2)</span></p>
        <p>B: Thanks. But I missed two easy shots.</p>
        <p>A: Everyone makes mistakes. <span class="blank">(3)</span></p>
        <p>B: You're right. I'll practice harder.</p>
        <p>A: By the way, I'm having a party at my home on Saturday evening. <span class="blank">(4)</span></p>
        <p>B: I'd love to. What time does it start?</p>
        <p>A: <span class="blank">(5)</span></p>
        <p>B: OK. See you then.</p>
        <p class="small">A. Our team didn't do well.<br>B. You tried your best.<br>C. Just learn from them and keep trying.<br>D. Would you like to come?<br>E. At seven o'clock.<br>F. Where is your home?<br>G. We won the match.</p>` },
    e3: { title: '例：补全对话（从 A–E 中选出能填入空白处的句子）',
      html: `<p>A: Hi, Linda. <span class="blank">(1)</span></p>
        <p>B: Nothing much. Why?</p>
        <p>A: There's a new cinema near the bus station. Would you like to see a film with me?</p>
        <p>B: Sounds great. <span class="blank">(2)</span></p>
        <p>A: It's next to the bus station. We can take the No. 5 bus there.</p>
        <p>B: OK. <span class="blank">(3)</span></p>
        <p>A: At four. Let's meet at the bus stop at half past three.</p>
        <p class="small">A. What are you going to do this afternoon?<br>B. Where is it exactly?<br>C. When does the film start?<br>D. Did you see the film last week?<br>E. How did you like it?</p>` }
  },
  examples: [
    { type: 'choice', passage: 'e1', q: '第 (1) 空：',
      options: ['Could you tell me where the bookstore is?', "What's the matter?", 'When does it open?'], answer: 0,
      explain: 'B 回答 It\'s on Green Street, next to the post office，是在说地点，所以 A 是在问路。Sure 也说明 A 提出的是一个请求。' },
    { type: 'choice', passage: 'e1', q: '第 (2) 空：',
      options: ['When does it open?', 'How long does it take to walk there?', "What's the matter?"], answer: 1,
      explain: '后面回答 About ten minutes on foot（步行大约十分钟），说的是花多长时间，所以问 How long does it take...?。问开门时间应回答几点。' },
    { type: 'choice', passage: 'e1', q: '第 (3) 空：',
      options: ["What's the matter?", "You're welcome.", 'When does it open?'], answer: 1,
      explain: 'A 说 Thank you very much 道谢，B 回应 You\'re welcome（不客气）。' },
    { type: 'choice', passage: 'e2', q: '【通读】先不看选项，通读对话全文。这段对话的话题是：',
      options: ['Jenny 身体不舒服', 'Jenny 的旅行计划', 'Jenny 去商店买东西'], answer: 0,
      explain: 'You don\'t look well、see a doctor 这些线索说明在谈身体不舒服。先弄清话题，选项里像 How was your trip? 这种和话题无关的句子就能直接排除。' },
    { type: 'choice', passage: 'e2', q: '第 (1) 空：',
      options: ['I have a bad headache.', 'How was your trip?', "I'll go there tomorrow."], answer: 0,
      explain: '空格前 A 问 What\'s the matter?（怎么了），空格前是问句，空格里就该是答句，说出哪里不舒服：I have a bad headache。How was your trip? 是问句，不能用来回答问题。' },
    { type: 'choice', passage: 'e2', q: '第 (2) 空：',
      options: ['It started yesterday afternoon.', "I'll go there tomorrow.", 'How was your trip?'], answer: 0,
      explain: '问句 When did it start? 用过去时，答句也用过去时 started；it 指的正是前面说的头痛。I\'ll go there tomorrow 是将来时，there 在前文也找不到指的地方——它和“看病”话题有关，是典型的干扰项。' },
    { type: 'choice', passage: 'e2', q: '第 (3) 空：',
      options: ['Shall I take you to the hospital?', "I'll go there tomorrow.", 'How was your trip?'], answer: 0,
      explain: '空格后 B 说 Yes, please. That\'s very kind of you.（好的，谢谢你），这是回答别人主动提供帮助的话，所以空格是以 Shall I 开头的一般疑问句：要我带你去医院吗？' },
    { type: 'choice', q: '选出最恰当的句子补全对话：<br>A: Sorry, I\'m late. The bus broke down on the way.<br>B: ___ Come in and sit down, please.',
      options: ["That's OK.", "You're welcome.", 'Me too.'], answer: 0,
      explain: 'A 在道歉，回应道歉用 That\'s OK. / That\'s all right. / Never mind.。You\'re welcome 是回应感谢的，Me too 意思是“我也是”，都搭不上。' },
    { type: 'choice', q: '【回读检查】某同学填好的对话是：<br>A: How often do you go swimming?<br>B: In the swimming pool near my home.<br>回读时发现答句不对，应该改成：',
      options: ['Twice a week.', 'For an hour.', 'With my father.'], answer: 0,
      explain: '回读时把问答连起来读：How often 问频率，回答地点就答非所问了，应改为 Twice a week。For an hour 回答 How long，With my father 回答 Who... with。' },
    { type: 'choice', q: '【题型】关于“七选五”补全对话，下面说法正确的是：',
      options: ['给出 7 个句子，选 5 个填回对话，有 2 个是多余的干扰项', '7 个句子都要用上，有的空可以填两句', '同一个句子可以重复填在两个空里'], answer: 0,
      explain: '七选五：对话挖去 5 句，下面给 7 句，每句最多用一次，有 2 句用不上。知道“有 2 句多余”，就不会硬把每个句子都塞进去；知道“每句只用一次”，用过的句子就可以划掉。' },
    { type: 'choice', passage: 'e3', q: '第 (1) 空：',
      options: ['What are you going to do this afternoon?', 'Did you see the film last week?', 'How did you like it?'], answer: 0,
      explain: '空格后 Linda 说 Nothing much（没什么事），还问 Why?，说明 A 问的是她接下来的安排，要用将来时 are you going to do。Did you see...? 是过去时，应该用 Yes / No 回答，时态和问答都对不上。' },
    { type: 'choice', passage: 'e3', q: '第 (2) 空：',
      options: ['Where is it exactly?', 'How did you like it?', 'Did you see the film last week?'], answer: 0,
      explain: '空格后回答 It\'s next to the bus station，这个 it 指的就是前面提到的 new cinema，回答的是位置，所以问 Where is it exactly?。How did you like it? 里的 it 只能指看过的电影，可他们还没看，代词对不上。' },
    { type: 'choice', passage: 'e3', q: '第 (3) 空：',
      options: ['When does the film start?', 'Did you see the film last week?', 'How did you like it?'], answer: 0,
      explain: '用排除法：第 (1)(2) 空已经用掉两句，划掉后只剩三句。空格后回答 At four 是时间，三句里只有 When does the film start? 问时间。' },
    { type: 'choice', q: '选出最恰当的句子补全对话：<br>A: I\'d like to borrow this book. How long can I keep it?<br>B: ___',
      options: ['For two weeks.', "It's a very interesting book.", 'You can find it on the second shelf.'], answer: 0,
      explain: '三个选项都和“图书馆借书”这个话题有关，这就是话题干扰。但 A 问的是 How long（能借多久），只有 For two weeks 回答了一段时间。另外两句一个评价书、一个说位置，放回对话就接不上。' }
  ],
  tests: [
    { type: 'choice', passage: 'd1', q: '第 (1) 空：',
      options: ["What's wrong with you?", 'How was your test?', 'Where shall we meet?', 'Thanks a lot.'], answer: 0,
      explain: '前面说 You look worried，后面 Kate 说出自己的烦恼，所以中间问“你怎么了”。How was your test? 是过去时，而考试在明天，排除。' },
    { type: 'choice', passage: 'd1', q: '第 (2) 空：',
      options: ['I can help you with it.', "I'm afraid not.", 'When will you go?', 'Thanks a lot.'], answer: 0,
      explain: '后面 Kate 说 Really? That would be great，还问对方今晚有没有空，说明 A 提出要帮她，所以选 I can help you with it.' },
    { type: 'choice', passage: 'd1', q: '第 (3) 空：',
      options: ['Thanks a lot.', "I'm afraid not.", 'Where shall we meet?'], answer: 1,
      explain: 'Kate 问 Are you free this evening?，A 后面说要去上钢琴课，所以回答“恐怕没空”I\'m afraid not.' },
    { type: 'choice', passage: 'd1', q: '第 (4) 空：',
      options: ['When will you go?', 'Where shall we meet?', 'How was your test?'], answer: 1,
      explain: '后面回答 In the school library，是地点，所以问 Where shall we meet?。When will you go? 问时间，与回答不符，而且时间已经定在今天下午了。' },
    { type: 'choice', passage: 'd1', q: '第 (5) 空：',
      options: ['Thanks a lot.', "What's wrong with you?", "I'm afraid not."], answer: 0,
      explain: '后面 Kate 说 You\'re always so helpful（你总是这么乐于助人），说明她是在道谢。' },
    { type: 'choice', passage: 'd2', q: '第 (1) 空：',
      options: ['Which place should I visit?', 'Who will you go with?', 'How can I get there?', 'How long have you lived there?'], answer: 0,
      explain: '后面回答 Gulangyu, of course，是一个地方的名字，说明前面问的是“我该去哪儿玩”。Who will you go with? 应回答人。' },
    { type: 'choice', passage: 'd2', q: '第 (2) 空：',
      options: ['How can I get there?', 'Is it easy to get around there?', 'Who will you go with?'], answer: 0,
      explain: '后面回答 You can take a ferry（坐轮渡），说的是交通方式，所以问 How can I get there?' },
    { type: 'choice', passage: 'd2', q: '第 (3) 空：',
      options: ['How long have you lived there?', 'Is it easy to get around there?', 'What food would you suggest?'], answer: 1,
      explain: '后面以 Yes, but... 开头，说明空格是一般疑问句；内容讲岛上没车、要步行，正好回答“在那儿四处走走方便吗”。' },
    { type: 'choice', passage: 'd2', q: '第 (4) 空：',
      options: ['What food would you suggest?', 'Which place should I visit?', 'Who will you go with?'], answer: 0,
      explain: '后面建议 You should try the seafood，说的是吃什么，所以问 What food would you suggest?。Which place 已经在第 (1) 空用过了。' },
    { type: 'choice', passage: 'd2', q: '第 (5) 空：',
      options: ["I can't wait to go there.", 'How long have you lived there?', 'How can I get there?'], answer: 0,
      explain: '后面 Lin Tao 说 Have a good time!（玩得开心），说明 A 在表达期待，I can\'t wait to go there 最合适；另外两个是问句，与“玩得开心”接不上。' },
    { type: 'choice', passage: 'd3', q: '【通读】这段对话最可能发生在什么地方？',
      options: ['In a hospital.', 'In a classroom.', 'In a shop.'], answer: 0,
      explain: 'sore throat（嗓子疼）、Open your mouth、take this medicine、Thank you, doctor 都说明这是医生在给病人看病，地点是医院。' },
    { type: 'choice', passage: 'd3', q: '第 (1) 空：',
      options: ["What's wrong with you?", 'Can I go to school tomorrow?', 'Did you go to school today?'], answer: 0,
      explain: '空格后 B 说自己嗓子疼、一直咳嗽，是在说病情，所以医生问的是“你怎么了”What\'s wrong with you?。' },
    { type: 'choice', passage: 'd3', q: '第 (2) 空：',
      options: ['For two days.', 'Twice a day.', 'Do you have a fever?'], answer: 0,
      explain: '空格前 A 问 How long have you been like this?（这样多久了），要回答一段时间 For two days。Twice a day 回答 How often，是疑问词不对的干扰项。' },
    { type: 'choice', passage: 'd3', q: '第 (3) 空：',
      options: ['Do you have a fever?', 'Did you go to school today?', "What's wrong with you?"], answer: 0,
      explain: '空格后 B 答 No, I don\'t，说明空格是 Do 开头的一般疑问句：你发烧吗？Did you...? 是过去时，应该用 No, I didn\'t 回答，时态对不上。' },
    { type: 'choice', passage: 'd3', q: '第 (4) 空：',
      options: ['Can I go to school tomorrow?', 'Did you go to school today?', 'Twice a day.'], answer: 0,
      explain: '空格后医生答 Yes, but don\'t play football for a few days（可以，但这几天别踢球），说明病人问的是“明天能去上学吗”。Did you go to school today? 是医生问病人的话，而且和“别踢球”接不上。' },
    { type: 'choice', passage: 'd3', q: '第 (5) 空：',
      options: ["I hope you'll get well soon.", "What's wrong with you?", 'Twice a day.'], answer: 0,
      explain: '空格后病人说 Thank you, doctor，说明医生说了一句祝福的话：希望你早日康复。' },
    { type: 'choice', passage: 'd4', q: '【通读】对话中 A 和 B 的关系最可能是：',
      options: ['Shop assistant and customer.', 'Doctor and patient.', 'Teacher and student.'], answer: 0,
      explain: 'Can I help you?、How much is it?、on sale、Here\'s your change（找您的零钱）都是买东西时说的话，A 是售货员，B 是顾客。' },
    { type: 'choice', passage: 'd4', q: '第 (1) 空：',
      options: ["I'm looking for a sweater for my sister.", 'Do you have a cheaper one?', 'What size do you wear?'], answer: 0,
      explain: '后面 B 说 It\'s her favorite color，her 必须指前面提到的一个女性，正好是 my sister，代词线索锁定答案。Do you have a cheaper one? 里的 one 前面还没出现任何东西；What size do you wear? 是售货员的话。' },
    { type: 'choice', passage: 'd4', q: '第 (2) 空：',
      options: ['How about this one?', "It's 120 yuan.", 'What size do you wear?'], answer: 0,
      explain: '空格后 B 说 It looks nice，说明售货员拿了一件给她看：How about this one?。如果这里已经报价 120 元，B 就不会紧接着问 How much is it?。' },
    { type: 'choice', passage: 'd4', q: '第 (3) 空：',
      options: ["It's 120 yuan.", 'They are 50 yuan.', 'How about this one?'], answer: 0,
      explain: 'B 问 How much is it?，it 是单数，答句也要用 It\'s。They are 是复数，指的东西对不上；而且后面那件 60 元的被说成“更便宜的”，如果这件只要 50 元，就前后矛盾了。' },
    { type: 'choice', passage: 'd4', q: '第 (4) 空：',
      options: ['Do you have a cheaper one?', 'What size do you wear?', 'They are 50 yuan.'], answer: 0,
      explain: 'B 嫌贵（a bit expensive），售货员回答 Sure. This one is only 60 yuan，说明 B 问的是“有便宜点的吗”。one 指的就是 sweater。' },
    { type: 'choice', passage: 'd4', q: '第 (5) 空：',
      options: ["I'll take it. Here's 100 yuan.", 'What size do you wear?', 'They are 50 yuan.'], answer: 0,
      explain: '空格后售货员说 Here\'s your change（找您零钱），说明 B 决定买并付了钱：I\'ll take it. Here\'s 100 yuan.，100 − 60 正好要找零。' },
    { type: 'choice', passage: 'd5', q: '第 (1) 空：',
      options: ["Our team didn't do well.", 'We won the match.', 'Where is your home?'], answer: 0,
      explain: '前面 A 问 Why do you look so sad?，空格后又说 We lost the basketball match，所以空格说的是“我们队表现不好”。We won the match 和 lost 正好矛盾，是话题相关的干扰项。' },
    { type: 'choice', passage: 'd5', q: '第 (2) 空：',
      options: ['You tried your best.', 'Just learn from them and keep trying.', 'Where is your home?'], answer: 0,
      explain: 'A 在安慰 Sam，空格后 Sam 说 Thanks，说明 A 说了一句安慰的话：你已经尽力了。Just learn from them 里的 them 要指“错误”，而 mistakes 要到下一句才出现，放在这里代词没有着落。' },
    { type: 'choice', passage: 'd5', q: '第 (3) 空：',
      options: ['Just learn from them and keep trying.', 'Would you like to come?', 'We won the match.'], answer: 0,
      explain: '空格前说 Everyone makes mistakes，them 正好指 mistakes：从错误中学习，继续努力。空格后 Sam 说 I\'ll practice harder，和“继续努力”对得上。' },
    { type: 'choice', passage: 'd5', q: '第 (4) 空：',
      options: ['Would you like to come?', 'Where is your home?', "Our team didn't do well."], answer: 0,
      explain: 'A 说周六晚上要开派对，空格后 Sam 回答 I\'d love to（我很乐意），这是接受邀请的话，所以空格是邀请 Would you like to come?。' },
    { type: 'choice', passage: 'd5', q: '第 (5) 空：',
      options: ["At seven o'clock.", 'Where is your home?', 'You tried your best.'], answer: 0,
      explain: 'Sam 问 What time does it start?，空格前是问句，空格里应是回答时间的答句。Where is your home? 是问句，不能回答问题。' },
    { type: 'choice', q: '选出最恰当的句子补全对话：<br>A: I\'m sorry I stepped on your foot.<br>B: ___',
      options: ["That's all right.", "You're welcome.", 'With pleasure.'], answer: 0,
      explain: 'A 道歉，用 That\'s all right.（没关系）回应。You\'re welcome 回应感谢，With pleasure 是答应别人请求时说的“乐意效劳”。' },
    { type: 'choice', q: '选出最恰当的句子补全对话：<br>A: Sorry, I forgot to bring your dictionary.<br>B: ___ You can give it back to me tomorrow.',
      options: ['Never mind.', 'My pleasure.', 'Good idea.'], answer: 0,
      explain: '对方因为忘带词典道歉，回应“没关系”Never mind，后面再说明天还就行。My pleasure 回应感谢，Good idea 回应建议。' },
    { type: 'choice', q: '【回读检查】某同学填好的对话是：<br>A: Would you like to come to my birthday party?<br>B: You\'re welcome.<br>回读时发现答句不对，应该改成：',
      options: ["I'd love to.", 'Never mind.', "No, I don't."], answer: 0,
      explain: 'Would you like to...? 是邀请，接受邀请说 I\'d love to.（我很乐意）。原句 You\'re welcome 回应感谢，Never mind 回应道歉，都是交际用语错配；No, I don\'t 的助动词和 Would 对不上。' },
    { type: 'choice', q: '【回读检查】某同学填好的对话是：<br>A: What did you do last weekend?<br>B: I\'m going to visit my aunt.<br>回读时发现时态不对，应该改成：',
      options: ['I visited my aunt.', 'I visit my aunt every day.', "I'll visit my aunt."], answer: 0,
      explain: '问句 What did you do last weekend? 用过去时问上周末的事，答句也要用过去时 visited。另外两项一个是习惯、一个是将来，时态仍然对不上。' }
  ]
},

/* ================= 看图写话 ================= */
{
  id: 's-picture', title: '看图写话', short: '看图写话', module: 'skill', grade: 8, freq: 3,
  prereqs: ['g-sentence-elements', 'g-present-cont', 'g-past-simple'],
  tip: '看图写话考你把图上的人物、时间、地点、动作用正确的英语句子写出来，最大的失分点是时态不统一和漏写图中要点。（具体题量分值以当年《考试说明》为准）',
  learn: [
    { h: '题型说明', html: `
      <p>看图写话一般给一幅或几幅连续的图，有时还给出提示词，要求写几个句子或一小段话。评分主要看三点：<b>要点全不全、句子对不对、语言连不连贯</b>。</p>
      <p>这个网站里看不到真实图片，我们用中文描述图片内容，例如：</p>
      <p class="small">图：上周末，李华和爸爸在公园里种树。</p>
      <div class="rhyme">谁、何时、在哪里，正在干啥、感觉如何；<br>先定时态再下笔，主谓一致别忘记；<br>开头大写末尾点，连词串句更流利。</div>` },
    { h: '解题步骤', html: `<ol>
      <li><b>看图找要素</b>：用“五个 W”问自己——Who（谁）、When（什么时候）、Where（在哪儿）、What（在做什么）、How（感觉怎样）。</li>
      <li><b>定时态</b>：图上或提示里有 yesterday、last Sunday → 一般过去时；有 now、Look! 或者是“正在发生的场景” → 现在进行时；有 tomorrow、next week → 一般将来时。全文时态保持一致。</li>
      <li><b>写主干句</b>：主语 + 谓语 + 宾语，先保证每一句都对：Li Hua and his father planted trees.</li>
      <li><b>加细节</b>：补上时间、地点、方式：last weekend、in the park、with a shovel。</li>
      <li><b>连成段</b>：用 first、then、after that、finally、and、so 等把句子串起来，最后加一句感受。</li>
      <li><b>检查</b>：时态、主谓一致、拼写、大小写、标点。</li>
    </ol>
    <table class="tbl">
      <tr><th>要素</th><th>常用表达</th></tr>
      <tr><td>时间</td><td>last Sunday, yesterday afternoon, on Tree Planting Day, now</td></tr>
      <tr><td>地点</td><td>in the park, on the playground, at the beach, in the kitchen</td></tr>
      <tr><td>顺序</td><td>First, ... Then, ... After that, ... Finally, ...</td></tr>
      <tr><td>感受</td><td>We felt tired but happy. / What a meaningful day!</td></tr>
    </table>` },
    { h: '常见陷阱', html: `
      <table class="tbl">
        <tr><th>错误</th><th>错句</th><th>改正</th></tr>
        <tr><td>时态混乱</td><td>Last Sunday we go to the park.</td><td>Last Sunday we <b>went</b> to the park.</td></tr>
        <tr><td>进行时漏 be</td><td>The boy playing basketball.</td><td>The boy <b>is</b> playing basketball.</td></tr>
        <tr><td>主谓不一致</td><td>Some students is cleaning.</td><td>Some students <b>are</b> cleaning.</td></tr>
        <tr><td>中式英语</td><td>I very like it.</td><td>I like it very much.</td></tr>
        <tr><td>大小写标点</td><td>li hua lives in fuzhou</td><td><b>L</b>i <b>H</b>ua lives in <b>F</b>uzhou.</td></tr>
      </table>
      <p class="warn">不要只写“图上有什么”（There is a tree.），要写“人物在做什么”，还要把图里每个要点都写到，漏一个要点就会扣分。</p>` },
    { h: '实战演示', html: `
      <p class="small">图：上周末，李华和爸爸在公园里种树。他们一个挖坑，一个浇水，最后两人满头大汗却很开心。</p>
      <p><b>第一步 找要素</b>：Who = Li Hua and his father；When = last weekend；Where = in the park；What = 种树、挖坑、浇水；How = 累但开心。</p>
      <p><b>第二步 定时态</b>：“上周末”→ 一般过去时，plant → planted，dig → dug，feel → felt。</p>
      <p><b>第三步 写出来</b>：</p>
      <p class="ex">Last weekend, Li Hua and his father went to the park to plant trees.<span class="zh">上周末，李华和爸爸去公园种树。</span></p>
      <p class="ex">First, his father dug a hole. Then Li Hua put a young tree into it.<span class="zh">首先，爸爸挖了一个坑。然后李华把一棵小树放进去。</span></p>
      <p class="ex">After that, Li Hua watered the tree carefully.<span class="zh">之后，李华仔细地给树浇了水。</span></p>
      <p class="ex">They felt tired but happy.<span class="zh">他们感到又累又开心。</span></p>
      <p><b>第四步 检查</b>：四句都是过去时；主语 Li Hua and his father 是复数；dug、put 是不规则变化，拼写正确；人名首字母大写，句末有句号。</p>` }
  ],
  examples: [
    { type: 'choice', q: '图：上周日，Lucy 在家帮妈妈做饭。选出最能描述这幅图的句子。',
      options: ['Lucy helps her mother cook at home last Sunday.', 'Lucy helped her mother cook at home last Sunday.', 'Lucy is helping her mother cook at home last Sunday.'], answer: 1,
      explain: '“上周日”last Sunday 是过去的时间，要用一般过去时 helped。另外两句用了现在时和进行时，与 last Sunday 矛盾。' },
    { type: 'fill', q: '图：（现在）妈妈正在厨房里做饭。<br>Mom ___ cooking in the kitchen now.（填 be 动词）', answer: ['is'],
      explain: '正在做 → 现在进行时 be + doing，Mom 是单数，用 is。' },
    { type: 'choice', q: '图：几个学生正在操场上跑步，老师在旁边看着。下面哪一句是正确的？',
      options: ['Some students are running on the playground.', 'Some students running on the playground.', 'Some students is running on the playground.'], answer: 0,
      explain: '现在进行时要有 be；students 是复数，用 are。第二句漏了 be，第三句主谓不一致。' },
    { type: 'choice', q: '图：昨天晚上，Mike 在书房里帮弟弟做数学作业。下面哪一句把 Who、When、Where、What 都写到了？',
      options: ['Yesterday evening, Mike helped his little brother with his math homework in the study.', 'Mike helped his little brother.', "There is a study in Mike's home."], answer: 0,
      explain: '用“五个 W”检查：Who = Mike and his little brother，When = yesterday evening，Where = in the study，What = helped... with his math homework，第一句全都有。第二句缺时间、地点和具体做什么；第三句只写了“图上有什么”，没写人物在做什么。' },
    { type: 'fill', q: '图：下周六，我们打算去鼓山爬山。<br>We ___ going to climb Gushan Mountain next Saturday.（填 be 动词）', answer: ['are'],
      explain: 'next Saturday 是将来的时间，用一般将来时 be going to do；主语 We 是复数，be 动词用 are。' },
    { type: 'choice', q: '下面这两句描述的都是“昨天”的事，哪一组时态前后一致？',
      options: ['Yesterday we went to the zoo. We saw many animals there.', 'Yesterday we went to the zoo. We see many animals there.', 'Yesterday we go to the zoo. We saw many animals there.'], answer: 0,
      explain: '一段话写的是同一时间的事，时态要统一。yesterday 用一般过去时，went 和 saw 都是过去式。另外两组各有一句用了一般现在时。' },
    { type: 'fill', q: '图：李华每天都给阳台上的花浇水。<br>Li Hua ___ the flowers on the balcony every day.（water）', answer: ['waters'],
      explain: '先写主干：主语 Li Hua + 谓语 waters + 宾语 the flowers。every day 表示经常做，用一般现在时；Li Hua 是第三人称单数，动词加 -s。' },
    { type: 'fill', q: '图：上周日下午，李华和朋友们在河边钓鱼。<br>Li Hua and his friends went fishing ___ the river last Sunday afternoon.（填一个介词，首字母 b）', answer: ['by', 'beside'],
      explain: '主干句 Li Hua and his friends went fishing 写好后，再加地点 by the river（在河边）和时间 last Sunday afternoon，句子就具体了。' },
    { type: 'choice', q: '图一：Amy 洗了几个苹果；图二：她把苹果切成小块；图三：她和妈妈一起吃水果沙拉。哪一段的顺序和连接最好？',
      options: ['First, Amy washed some apples. Then she cut them into small pieces. Finally, she and her mother enjoyed the fruit salad.', 'Finally, Amy washed some apples. First, she cut them into small pieces. Then she and her mother enjoyed the fruit salad.', 'Amy washed some apples, she cut them into small pieces, she and her mother enjoyed the fruit salad.'], answer: 0,
      explain: 'First、Then、Finally 按图的先后顺序把句子串起来，读起来清楚连贯。第二段连接词用乱了；第三段用逗号把三个完整句子硬连在一起，没有连接词，是错误的写法。' },
    { type: 'choice', q: '图：学校运动会结束了，我们班得了第一名，同学们高兴地跳起来。最适合作结尾的一句是：',
      options: ['What an exciting day!', 'There is a big playground in our school.', 'We have a sports meeting every year.'], answer: 0,
      explain: '结尾要写感受，What an exciting day! 用感叹句表达激动的心情。另外两句只是介绍情况，没有写感受。' },
    { type: 'fill', q: '改正中式英语：I very like playing football.<br>→ I like playing football very ___.（填一个词）', answer: ['much'],
      explain: 'very 不能直接修饰动词 like，“非常喜欢”要说 like ... very much，very much 放在句末。' },
    { type: 'choice', q: '下面哪一句的大小写和标点都正确？',
      options: ['Li Hua lives in Fuzhou.', 'li hua lives in fuzhou.', 'Li hua lives in Fuzhou'], answer: 0,
      explain: '人名 Li Hua 的姓和名首字母都要大写，地名 Fuzhou 首字母大写，句首大写，句末加句号。第三句 hua 没大写，也漏了句号。' },
    { type: 'choice', q: '图：（现在）公园里，一位老人在打太极，旁边两个孩子在放风筝。哪一组句子最好？',
      options: ['An old man is doing tai chi in the park. Two children are flying kites next to him.', 'There is an old man and there are two children in the park.', 'An old man is doing tai chi in the park.'], answer: 0,
      explain: '看图写话要写人物在做什么，并且把每个要点都写到。第二组只写了“有什么人”，没写动作；第三组漏了放风筝的两个孩子。' },
    { type: 'choice', q: '【时态混乱】图：昨天，Ben 和爷爷在河边散步。下面哪一句是正确的？',
      options: ['Yesterday Ben walked by the river with his grandpa.', 'Yesterday Ben walks by the river with his grandpa.', 'Yesterday Ben is walking by the river with his grandpa.'], answer: 0,
      explain: '看到 yesterday 就要用一般过去时 walked。很多同学写着写着就用回了原形或现在时，这就是“时态混乱”。下笔前先定时态，写完每个动词都再看一眼。' },
    { type: 'fill', q: '【主谓一致】图：（现在）李华和爸爸正在洗车。<br>Li Hua and his father ___ washing the car.（填 be 动词）', answer: ['are'],
      explain: 'Li Hua and his father 是两个人，and 连接的主语是复数，be 动词用 are。不要因为离动词最近的 his father 是单数就写 is。' },
    { type: 'choice', q: '【检查】图：上周六，Lily 在家里帮妈妈打扫房间。某同学写的是（句末没有标点）：“last Saturday, Lily help her mother clean the house” 检查后，正确的改法是：',
      options: ['Last Saturday, Lily helped her mother clean the house.', 'last Saturday, Lily helped her mother clean the house', 'Last Saturday, Lily helps her mother clean the house.'], answer: 0,
      explain: '写完按“时态、主谓一致、拼写、大小写、标点”逐项检查：句首 last 要大写成 Last；上周六的事要用过去式 helped；句末要有句号。三处都改对的只有第一句。' }
  ],
  tests: [
    { type: 'choice', q: '图：（现在）几个学生正在教室里打扫卫生。选出最能描述这幅图的句子。',
      options: ['Some students are cleaning the classroom.', 'Some students is cleaning the classroom.', 'Some students are clean the classroom.'], answer: 0,
      explain: '正在做 → be + doing；students 是复数，用 are，动词要用 cleaning。' },
    { type: 'choice', q: '图：Tom 发烧了，躺在床上，看起来很不舒服。选出最能描述这幅图的句子。',
      options: ['Tom has a fever. He is lying in bed and looks ill.', 'Tom has a fever. He is lying in bed and looks well.', 'Tom have a fever. He lying in bed and look ill.'], answer: 0,
      explain: 'have a fever 发烧，Tom 是第三人称单数用 has；looks ill 看起来生病了。looks well 意思是看起来很健康，与图意相反；第三句多处语法错误。' },
    { type: 'choice', q: '图：明天，全班同学将去博物馆参观。选出最能描述这幅图的句子。',
      options: ['Our class visited the museum tomorrow.', 'Our class is going to visit the museum tomorrow.', 'Our class visit the museum tomorrow.'], answer: 1,
      explain: 'tomorrow 是将来的时间，用 be going to do 表示计划。visited 是过去时，与 tomorrow 矛盾；第三句用的是一般现在时原形，没有表示将来，也不是正确的谓语形式。' },
    { type: 'choice', q: '图：上周末，李华和同学们去敬老院做志愿者，大家都很开心。最适合作为结尾的句子是：',
      options: ['We feel tired but happy.', 'We felt tired but happy.', 'We felt tiredly but happily.'], answer: 1,
      explain: '写的是上周末的事，全文用一般过去时，feel 的过去式是 felt；feel 是系动词，后面接形容词 tired / happy，不能用副词。' },
    { type: 'choice', q: '图：一个女孩站在海边，说她非常喜欢家乡厦门。下面哪一句是正确的？',
      options: ['I very like my hometown Xiamen.', 'I like my hometown Xiamen very much.', 'I like very much my hometown Xiamen.'], answer: 1,
      explain: '“非常喜欢”英语说 like ... very much，very much 放在句末；very 不能直接修饰动词 like。' },
    { type: 'fill', q: '图：昨天下午，同学们在操场上踢足球。<br>The students ___ football on the playground yesterday afternoon.（play）', answer: ['played'],
      explain: 'yesterday afternoon 是过去时间，用一般过去时 played。' },
    { type: 'fill', q: '图：每天早上，李华骑自行车上学。<br>Li Hua goes to school ___ bike every morning.（填一个介词）', answer: ['by'],
      explain: '“骑自行车”表示交通方式用 by bike，by 后面直接接交通工具，不加冠词。' },
    { type: 'fill', q: '图：大雨过后，志愿者们在街上捡垃圾。<br>After the heavy rain, the volunteers picked ___ the rubbish in the street.（填一个词）', answer: ['up'],
      explain: '“捡起”是 pick up，这里 picked up the rubbish 表示捡起垃圾。' },
    { type: 'fill', q: '图：（现在）奶奶正坐在沙发上看报纸。<br>Grandma is sitting on the sofa and ___ a newspaper.（read）', answer: ['reading'],
      explain: 'and 连接两个并列的进行时动作：is sitting and (is) reading，所以用 reading。' },
    { type: 'fill', q: '图：去年春节，我和家人一起包饺子。<br>Last Spring Festival, my family and I ___ dumplings together.（make）', answer: ['made'],
      explain: 'Last Spring Festival 是过去的时间，make 的过去式是不规则的 made。' },
    { type: 'choice', q: '图：今天早上，王老师在教室里给学生们讲故事。某同学写了：This morning, Mr. Wang told his students a story. 按“五个 W”检查，还缺哪个要素？',
      options: ['Where：in the classroom', 'Who：Mr. Wang', 'When：this morning'], answer: 0,
      explain: '句子里已经有 Who（Mr. Wang）、When（this morning）、What（told... a story），只缺地点 Where，加上 in the classroom 就完整了。' },
    { type: 'fill', q: '图：上周五晚上，Jim 在家给奶奶过生日。<br>Last Friday evening, Jim celebrated his grandma\'s birthday ___ home.（填一个介词）', answer: ['at'],
      explain: '“在家”是 at home，补上 Where 这个要素。home 前不加 the。' },
    { type: 'fill', q: '图：上周日，Jack 在公园里放风筝。<br>Last Sunday, Jack ___ a kite in the park.（fly）', answer: ['flew'],
      explain: 'Last Sunday 是过去的时间，用一般过去时。fly 的过去式是不规则的 flew，不是 flied。' },
    { type: 'fill', q: '图：明天，李华要去看望爷爷奶奶。<br>Tomorrow Li Hua ___ visit his grandparents.（填一个表示将来的助动词）', answer: ['will'],
      explain: 'tomorrow 是将来的时间，“will + 动词原形”表示一般将来时。只能填一个词，所以不用 is going to。' },
    { type: 'choice', q: '图：下个暑假，Tom 打算去北京旅游。选出最能描述这幅图的句子。',
      options: ['Tom is going to travel to Beijing next summer vacation.', 'Tom travelled to Beijing next summer vacation.', 'Tom is going to travelled to Beijing next summer vacation.'], answer: 0,
      explain: 'next summer vacation 是将来，用 be going to + 动词原形 travel。第二句用了过去式，与 next 矛盾；第三句 going to 后面不能接过去式。' },
    { type: 'fill', q: '图：（Look!）宝宝正在床上睡觉。<br>Look! The baby ___ in bed.（sleep）', answer: ['is sleeping', "'s sleeping"],
      explain: 'Look! 提示动作正在发生，用现在进行时 is + sleeping；The baby 是单数，用 is。' },
    { type: 'choice', q: '下面这段写的是“昨天”的事：Yesterday we had a class party. We sang songs. Then we eat some cakes. 哪一处时态需要改？',
      options: ['we eat some cakes 要改成 we ate some cakes', 'we had a class party 要改成 we have a class party', 'We sang songs 要改成 We sing songs'], answer: 0,
      explain: '全文写昨天的事，要统一用一般过去时。had、sang 都对，只有 eat 还是原形，要改成过去式 ate。' },
    { type: 'fill', q: '图：上周末，我去了海边，还在海里游泳。<br>Last weekend I went to the beach and ___ in the sea.（swim）', answer: ['swam'],
      explain: 'and 连接的两个动作都发生在上周末，时态要一致：went 和 swam 都是过去式。swim 的过去式是 swam。' },
    { type: 'fill', q: '图：（每天）爸爸开车送我上学。<br>My father ___ me to school every day.（drive）', answer: ['drives'],
      explain: '主干是 My father + drives + me。every day 用一般现在时，主语第三人称单数，动词加 -s。' },
    { type: 'choice', q: '图：妈妈每天晚上给我们做晚饭。下面哪一句是完整正确的句子？',
      options: ['My mother cooks dinner for us every evening.', 'My mother dinner for us every evening.', 'Cooks dinner my mother every evening.'], answer: 0,
      explain: '英语句子的主干是“主语 + 谓语 + 宾语”：My mother（主语）cooks（谓语）dinner（宾语）。第二句缺谓语动词，第三句语序错误。' },
    { type: 'fill', q: '图：上周六，爸爸用铲子挖了一个坑。<br>Last Saturday, my father dug a hole ___ a shovel.（填一个介词）', answer: ['with'],
      explain: '“用某工具”是 with + 工具，补上方式细节，句子更具体。' },
    { type: 'choice', q: '图：上周日上午，Lily 在图书馆看书。哪一句细节最完整？',
      options: ['Lily read books in the library last Sunday morning.', 'Lily read books.', 'Lily read books last Sunday.'], answer: 0,
      explain: '在主干句 Lily read books 后面加上地点 in the library 和时间 last Sunday morning，图上的要素都写到了。' },
    { type: 'fill', q: '图一：我们先搭帐篷；图二：然后生火做饭。<br>First, we put up the tent. ___, we made a fire and cooked dinner.（填一个连接词，首字母 T）', answer: ['Then', 'then'],
      explain: 'First 之后表示“然后”用 Then，按图的顺序把句子串起来。' },
    { type: 'fill', q: '图三：最后，我们一起躺着看星星。<br>___, we lay down and watched the stars together.（填一个连接词，首字母 F）', answer: ['Finally', 'finally'],
      explain: '最后一幅图用 Finally（最后）收尾，和前面的 First、Then 连成完整的顺序。' },
    { type: 'choice', q: '图：突然下起了大雨，我们只好回家了。<br>It started to rain heavily, ___ we went back home.',
      options: ['so', 'but', 'or'], answer: 0,
      explain: '下大雨是原因，回家是结果，用 so（所以）连接。but 表示转折，or 表示选择，都不合逻辑。' },
    { type: 'choice', q: '图：小明第一次自己做饭，菜有点咸，但家人都吃得很开心。最适合的结尾句是：',
      options: ['Although the dishes were a little salty, I felt very proud of myself.', 'There were some dishes on the table.', 'I feel very proud of myself tomorrow.'], answer: 0,
      explain: '结尾写感受，并且和全文的过去时保持一致。第二句只描述了“有什么”，没有感受；第三句时态混乱，feel 和 tomorrow 都与过去的事不符。' },
    { type: 'fill', q: '图：（现在）两个女孩正在树下唱歌。<br>Two girls ___ singing under the tree.（填 be 动词）', answer: ['are'],
      explain: '现在进行时 be + doing 不能漏 be；Two girls 是复数，用 are。' },
    { type: 'choice', q: '找出句子中的错误：Look! My brother swimming in the river.',
      options: ['swimming 前面漏了 is', 'Look 应改为 Looks', 'river 应改为 rivers'], answer: 0,
      explain: 'Look! 提示正在发生，用现在进行时 is swimming，只写 swimming 就漏了 be 动词。Look! 是祈使句，不加 -s。' },
    { type: 'fill', q: '图：（现在）每个学生都在认真写作业。<br>Every student ___ doing homework carefully.（填 be 动词）', answer: ['is'],
      explain: 'every + 单数名词作主语，看作单数，be 动词用 is。虽然意思上是“所有学生”，语法上却是单数，这是主谓一致的易错点。' },
    { type: 'choice', q: '“我们玩得很开心”，下面哪一句最地道？',
      options: ['We had a great time.', 'We played very happy.', 'We very enjoyed.'], answer: 0,
      explain: '“玩得开心”英语常说 have a great time / have fun。played very happy 是逐字翻译，happy 应改为副词；very 不能直接修饰动词 enjoy，而且 enjoy 后面要有宾语。' },
    { type: 'choice', q: '“今天天气很好”，下面哪一句是正确的英语？',
      options: ['The weather is very nice today.', 'Today weather very nice.', 'Today is very nice weather.'], answer: 0,
      explain: '英语句子必须有谓语动词：The weather is very nice today.。第二句照搬中文语序，漏了 is；第三句说“今天是很好的天气”，主语和表语搭配不当。' },
    { type: 'choice', q: '下面哪一句的大小写和标点都正确？',
      options: ['We visited the Great Wall on National Day.', 'we visited the great wall on national day.', 'We visited the Great Wall on national day'], answer: 0,
      explain: '句首字母大写，专有名词 the Great Wall、节日 National Day 每个实词首字母大写，句末加句号。' },
    { type: 'choice', q: '句子 my friend and I went to Xiamen last summer. 哪里需要改？',
      options: ['句首 my 的 m 要大写', 'Xiamen 要改成小写', 'summer 要大写'], answer: 0,
      explain: '句子开头第一个字母必须大写：My friend and I...。地名 Xiamen 本来就该大写，季节 summer 不用大写。' },
    { type: 'choice', q: '图：（现在）厨房里，妈妈在洗碗，爸爸在切菜。哪一组句子最好？',
      options: ['Mom is washing the dishes in the kitchen. Dad is cutting vegetables.', 'There are Mom and Dad in the kitchen.', 'Mom is washing the dishes in the kitchen.'], answer: 0,
      explain: '要写出每个人在做什么，图里两个要点都要写到。第二组只写了“有谁”，没写动作；第三组漏了爸爸切菜。' },
    { type: 'choice', q: '图：上周六，同学们在社区里种花、扫街道，还帮老人买东西。某同学写了：Last Saturday we planted flowers and cleaned the street. 他漏写了哪个要点？',
      options: ['帮老人买东西', '种花', '扫街道'], answer: 0,
      explain: '图里有三件事，句子只写了种花和扫街道，漏了 helped the old people buy things。漏一个要点就会扣分，写完要对照图逐一检查。' }
  ],
  practice: [
    { title: '海滩清洁日（三幅图）',
      prompt: `<p>根据下面三幅图的内容，写一段 4–6 句的短文。</p>
        <p class="small">图一：上周六，李华和同学们来到海边，看到沙滩上有很多塑料瓶和垃圾。<br>
        图二：他们戴上手套，把垃圾捡起来放进大袋子里。<br>
        图三：沙滩变干净了，大家虽然很累但很开心。</p>
        <p class="small">提示词：beach, plastic bottles, gloves, pick up, bag</p>`,
      words: [40, 70],
      checklist: ['时态对不对：上周六的事，全部用一般过去时', '主谓一致：Li Hua and his classmates 是复数', '要点齐全：时间地点、看到垃圾、捡垃圾、海滩变干净、感受', '拼写、大小写、标点：人名首字母大写，句末有句号'],
      sample: `<p>Last Saturday, Li Hua and his classmates went to the beach. They found many plastic bottles and a lot of rubbish on the sand. They put on their gloves and picked up the rubbish. Then they put it into big bags. After two hours, the beach became clean again. They felt tired but very happy.</p>`,
      notes: `<p>好句子：<b>put on their gloves</b>（戴上手套）、<b>picked up the rubbish</b>（捡起垃圾）、<b>became clean again</b>（又变干净了）、<b>felt tired but very happy</b>（又累又开心）。用 Then、After two hours 让顺序更清楚。</p>` },
    { title: '课间十分钟（一幅图）',
      prompt: `<p>根据图画内容，用现在进行时写 4–5 句话，描述同学们正在做什么。</p>
        <p class="small">图：课间，教室里很热闹。两个男生在擦黑板，Lily 在给窗台上的花浇水，Tom 坐在座位上看书，几个女生在聊天、哈哈大笑。</p>`,
      words: [30, 60],
      checklist: ['时态对不对：正在发生的场景，用 be + doing', '主谓一致：两个男生用 are，Lily / Tom 用 is', '要点齐全：擦黑板、浇花、看书、聊天大笑', '拼写、大小写、标点：-ing 形式拼写（sit → sitting，chat → chatting）'],
      sample: `<p>It is break time now. The classroom is very lively. Two boys are cleaning the blackboard. Lily is watering the flowers by the window. Tom is sitting at his desk and reading a book. Some girls are chatting and laughing happily.</p>`,
      notes: `<p>注意双写辅音字母：sit → <b>sitting</b>，chat → <b>chatting</b>。开头一句 It is break time now. 交代了时间，结尾用 happily 让画面更生动。</p>` },
    { title: '和奶奶过春节（两幅图）',
      prompt: `<p>根据图画内容，写一段 4–6 句的短文，最后写一句你的感受。</p>
        <p class="small">图一：去年春节前一天，“我”和奶奶在家里贴春联。<br>
        图二：晚上，全家人围坐在一起包饺子、看春晚。</p>
        <p class="small">提示词：Spring Festival, put up, couplets, make dumplings, Spring Festival Gala</p>`,
      words: [40, 70],
      checklist: ['时态对不对：去年的事，用一般过去时（put 的过去式还是 put）', '主谓一致：Grandma and I 是复数', '要点齐全：贴春联、包饺子、看春晚、感受', '拼写、大小写、标点：节日名称 Spring Festival 首字母大写'],
      sample: `<p>The day before last Spring Festival, my grandma and I put up couplets on the door. They were red and looked beautiful. In the evening, my whole family sat together. We made dumplings and watched the Spring Festival Gala. Everyone laughed and talked happily. It was the happiest night of the year for me.</p>`,
      notes: `<p>好句子：<b>put up couplets</b>（贴春联）、<b>my whole family sat together</b>（全家坐在一起）、<b>It was the happiest night of the year</b>（最高级表达感受）。</p>` },
    { title: '周末计划（两幅图）',
      prompt: `<p>根据图画内容，用一般将来时写一段 4–6 句的短文，说说你和家人这个周末的计划，最后写一句你的期待。</p>
        <p class="small">图一：这个周六上午，“我”和爸爸妈妈打算骑车去西湖公园看花。<br>
        图二：周日下午，“我”打算在家帮妈妈做蛋糕，给奶奶过生日。</p>
        <p class="small">提示词：this weekend, ride bikes, West Lake Park, make a cake, birthday</p>`,
      words: [40, 70],
      checklist: ['时态对不对：还没发生的事，用 be going to do 或 will do', '主谓一致：My parents and I 用 are going to，I 用 am going to', '要点齐全：周六骑车去公园看花、周日做蛋糕、给奶奶过生日、期待', '拼写、大小写、标点：地名 West Lake Park 每个词首字母大写'],
      sample: `<p>This weekend is going to be busy and fun. On Saturday morning, my parents and I are going to ride our bikes to West Lake Park. We will enjoy the beautiful flowers there. On Sunday afternoon, I am going to help my mother make a cake at home, because it will be my grandma's birthday. I hope Grandma will like it. I can't wait for the weekend!</p>`,
      notes: `<p>好句子：<b>is going to be busy and fun</b>（开头点题）、<b>ride our bikes to</b>（骑车去）、<b>help my mother make a cake</b>（help sb. do sth.）、<b>I can't wait for...</b>（表达期待）。全文时态统一用将来时，不要写成 went、made。</p>` }
  ]
}

);
