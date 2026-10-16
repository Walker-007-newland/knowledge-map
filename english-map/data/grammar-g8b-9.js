// 第 2 阶段：D 组
KG.nodes.push(

/* ================= 八年级 ================= */
{
  id: 'g-tag-q', title: '反意疑问句', short: '反意疑问句', module: 'syntax', grade: 8, freq: 1,
  prereqs: ['g-yes-no-q', 'g-present-simple'],
  tip: '考点是“前肯后否、前否后肯”和助动词的选择；最容易错的是否定式回答——要按事实回答，和中文的“是/不是”正好相反。',
  learn: [
    { h: '什么是反意疑问句', html: `<p>陈述句后面加一个小尾巴问句，意思是“……，对吧？”。</p>
      <div class="rhyme">前肯后否，前否后肯；<br>助动词要一致，主语换代词。</div>
      <p class="ex">He is a doctor, isn't he?<span class="zh">他是医生，对吧？</span></p>
      <p class="ex">You don't like fish, do you?<span class="zh">你不喜欢鱼，是吧？</span></p>
      <p class="ex">She went to Beijing last week, didn't she?<span class="zh">她上周去北京了，是吧？</span></p>
      <p>小尾巴用什么，看前面的谓语：be 动词就用 be，情态动词就用情态动词，实义动词就用 do / does / did，完成时就用 have / has。</p>` },
    { h: '特殊情况', html: `<table class="tbl"><tr><th>前半句</th><th>小尾巴</th><th>例句</th></tr>
      <tr><td>I am ...</td><td>aren't I</td><td>I'm late, aren't I?</td></tr>
      <tr><td>Let's ...</td><td>shall we</td><td>Let's go, shall we?</td></tr>
      <tr><td>祈使句</td><td>will you</td><td>Open the door, will you?</td></tr>
      <tr><td>There be ...</td><td>be + there</td><td>There is a book, isn't there?</td></tr>
      <tr><td>this / that / everything / nothing</td><td>it</td><td>That is your bag, isn't it?</td></tr>
      <tr><td>these / those / everyone / somebody</td><td>they</td><td>Everyone is here, aren't they?</td></tr></table>` },
    { h: '“隐藏的否定词”', html: `<p>前半句有 <b>never, seldom, hardly, few, little, no, nothing, nobody</b> 时，前半句算<b>否定</b>，小尾巴用<b>肯定</b>。</p>
      <p class="ex">He never eats meat, does he?<span class="zh">他从不吃肉，是吧？</span></p>
      <p class="ex">There is little milk in the fridge, is there?<span class="zh">冰箱里几乎没有牛奶了，是吧？</span></p>
      <p class="warn">unhappy, dislike 这种带否定前缀的词不算否定：He dislikes cats, doesn't he?</p>` },
    { h: '易错点：怎么回答', html: `<p>回答只看<b>事实</b>：事实是肯定的就用 Yes，事实是否定的就用 No。翻译成中文时 Yes 常译成“不”，No 常译成“是的”。</p>
      <p class="ex">He isn't a teacher, is he? — Yes, he is.<span class="zh">他不是老师，对吧？——不，他是。</span></p>
      <p class="ex">He isn't a teacher, is he? — No, he isn't.<span class="zh">他不是老师，对吧？——是的，他不是。</span></p>
      <div class="rhyme">Yes 后面跟肯定，No 后面跟否定，<br>前后一致不打架。</div>` }
  ],
  examples: [
    { type: 'choice', q: 'Your sister is good at drawing, ___?', options: ["isn't she", "isn't your sister", "doesn't she"], answer: 0, explain: '前半句是肯定的 is，按“前肯后否”尾巴用 isn\'t；尾巴的主语要换成代词，your sister 换成 she，不能照抄名词；前面是 be 动词，所以不能用 doesn\'t。' },
    { type: 'choice', q: "Your parents don't like fish, ___?", options: ['do they', "don't they", 'are they'], answer: 0, explain: '前半句有 don\'t，是否定句，按“前否后肯”尾巴用肯定；谓语 like 是实义动词，助动词用 do；your parents 换成代词 they。' },
    { type: 'choice', q: 'She went to Beijing last week, ___?', options: ["didn't she", "wasn't she", "doesn't she"], answer: 0, explain: 'went 是实义动词的一般过去时，尾巴用助动词 did；前肯后否，用 didn\'t she。尾巴的时态要和前半句一致，不能用 doesn\'t；went 不是 be 动词，也不能用 wasn\'t。' },
    { type: 'choice', q: "I'm in Class 2, ___?", options: ["aren't I", "am not I", "isn't I"], answer: 0, explain: 'I am 的反意疑问句尾巴是固定的 aren\'t I。' },
    { type: 'choice', q: "Let's have a picnic this Sunday, ___?", options: ['shall we', 'will you', "don't we"], answer: 0, explain: 'Let\'s 包括说话人自己，是提建议“我们一起……好吗”，尾巴固定用 shall we。' },
    { type: 'choice', q: 'Please open the window, ___?', options: ['will you', 'shall we', "don't you"], answer: 0, explain: '祈使句是请对方做事，尾巴用 will you（“好吗”）。shall we 是 Let\'s 开头的句子才用的。' },
    { type: 'choice', q: 'There will be a sports meeting next week, ___?', options: ["won't there", "won't it", "isn't there"], answer: 0, explain: 'There be 句型的尾巴主语仍然用 there；前半句是 there will be，助动词是 will，前肯后否就是 won\'t there。' },
    { type: 'choice', q: 'Everything is ready, ___?', options: ["isn't it", "aren't they", "isn't everything"], answer: 0, explain: 'everything 指事物，尾巴的代词用 it；前肯后否，用 isn\'t it。this / that / nothing 做主语时尾巴也用 it。' },
    { type: 'choice', q: 'Everyone is here, ___?', options: ["aren't they", "isn't it", "aren't you"], answer: 0, explain: 'everyone 指人，尾巴的代词用 they；they 后面的 be 动词是 are，所以是 aren\'t they（虽然前半句用的是 is）。' },
    { type: 'fill', q: 'There are few apples on the tree, ___ there?（填一个词）', answer: ['are'], explain: 'few 表示“几乎没有”，前半句算否定，尾巴用肯定 are there。' },
    { type: 'choice', q: 'He dislikes cats, ___?', options: ["doesn't he", 'does he', "isn't he"], answer: 0, explain: 'dislike 虽然带否定前缀 dis-，但它不是否定词，前半句仍算肯定，尾巴用否定；dislikes 是实义动词三单，用 doesn\'t he。' },
    { type: 'choice', q: "—You didn't go to the party, did you?<br>—___. I was at home all evening.", options: ['Yes, I did', "No, I didn't", "Yes, I didn't"], answer: 1, explain: '事实是“没去”，按事实回答用 No, I didn\'t.（中文意思是“是的，我没去”）。' }
  ],
  tests: [
    { type: 'choice', q: 'Your father is a doctor, ___?', options: ["isn't he", 'is he', "doesn't he"], answer: 0, explain: '前半句是肯定的 be 动词 is，尾巴用否定 isn\'t he。' },
    { type: 'choice', q: 'Tom never eats meat, ___?', options: ['does he', "doesn't he", 'is he'], answer: 0, explain: 'never 是否定词，前否后肯；eats 是实义动词，用 does he。' },
    { type: 'fill', q: 'You have finished your homework, ___ you?（填一个词）', answer: ["haven't"], explain: '前半句是现在完成时，助动词是 have，前肯后否用 haven\'t。' },
    { type: 'choice', q: "Let's go swimming this afternoon, ___?", options: ['shall we', "don't we", "aren't we"], answer: 0, explain: "Let's 开头的句子，尾巴用 shall we。" },
    { type: 'choice', q: 'There is a lot of water in the bottle, ___?', options: ["isn't there", "isn't it", 'is there'], answer: 0, explain: 'There be 句型的尾巴用 there；前肯后否，所以是 isn\'t there。' },
    { type: 'choice', q: "—Lily can't swim, can she?<br>—___. She swims very well.", options: ['Yes, she can', "No, she can't", "Yes, she can't"], answer: 0, explain: '事实是她会游泳，按事实用 Yes, she can.（中文是“不，她会”）。' },
    { type: 'fill', q: 'She can speak French, ___ she?（填一个词）', answer: ["can't"], explain: '前半句用情态动词 can，前肯后否，尾巴用 can\'t。' },
    { type: 'fill', q: 'Tom and Jim are good friends, ___ they?（填一个词）', answer: ["aren't"], explain: '前半句是肯定的 are，前肯后否用 aren\'t；Tom and Jim 换成代词 they。' },
    { type: 'choice', q: "Your mother isn't at home now, ___?", options: ['is she', "isn't she", 'does she'], answer: 0, explain: '前半句有 isn\'t，是否定，前否后肯用 is；your mother 换成 she。' },
    { type: 'fill', q: "You don't like fish, ___ you?（填一个词）", answer: ['do'], explain: '前半句是否定的 don\'t like，前否后肯，尾巴用肯定的 do。' },
    { type: 'fill', q: 'Mary likes music very much, ___ she?（填一个词）', answer: ["doesn't"], explain: 'likes 是实义动词的三单形式，助动词用 does；前肯后否，用 doesn\'t。' },
    { type: 'choice', q: 'Your parents went to Xiamen last summer, ___?', options: ["didn't they", "weren't they", "don't they"], answer: 0, explain: 'went 是实义动词一般过去时，尾巴用 did 的否定 didn\'t；your parents 换成 they。' },
    { type: 'choice', q: "I'm your best friend, ___?", options: ["aren't I", 'am I', "isn't I"], answer: 0, explain: 'I am 开头的肯定句，尾巴是固定的 aren\'t I；am I 是肯定，不符合“前肯后否”。' },
    { type: 'fill', q: 'I am late again, ___ I?（填一个词）', answer: ["aren't"], explain: 'I am 的反意疑问句尾巴固定用 aren\'t I。' },
    { type: 'fill', q: "Let's clean the classroom together, ___ we?（填一个词）", answer: ['shall'], explain: 'Let\'s 开头的句子，尾巴用 shall we。' },
    { type: 'choice', q: 'Close the door, ___?', options: ['will you', 'shall we', "don't you"], answer: 0, explain: '祈使句请对方做事，尾巴用 will you。' },
    { type: 'fill', q: "Don't be late for school again, ___ you?（填一个词）", answer: ['will'], explain: '否定的祈使句（Don\'t ...）尾巴也用 will you。' },
    { type: 'choice', q: "There weren't any students in the classroom, ___?", options: ['were there', "weren't there", 'were they'], answer: 0, explain: 'There be 句型尾巴用 there；前半句 weren\'t 是否定，前否后肯，用 were there。' },
    { type: 'choice', q: 'That is your new bike, ___?', options: ["isn't it", "isn't that", 'is it'], answer: 0, explain: 'that 做主语，尾巴的代词用 it；前肯后否，用 isn\'t it。' },
    { type: 'choice', q: 'Nothing is impossible, ___?', options: ['is it', "isn't it", 'are they'], answer: 0, explain: 'nothing 做主语，尾巴代词用 it；nothing 本身是否定词，前半句算否定，尾巴用肯定 is it。' },
    { type: 'choice', q: 'These are your books, ___?', options: ["aren't they", "aren't these", "isn't it"], answer: 0, explain: 'these / those 做主语，尾巴的代词用 they；前肯后否，用 aren\'t they。' },
    { type: 'choice', q: 'Everyone enjoyed the party, ___?', options: ["didn't they", 'did they', "weren't they"], answer: 0, explain: 'everyone 在尾巴里用 they；enjoyed 是实义动词过去式，前肯后否用 didn\'t they。' },
    { type: 'choice', q: 'There is little milk in the fridge, ___?', options: ['is there', "isn't there", 'is it'], answer: 0, explain: 'little 表示“几乎没有”，前半句算否定，尾巴用肯定；There be 句型尾巴用 there，所以是 is there。' },
    { type: 'fill', q: 'She seldom goes to the cinema, ___ she?（填一个词）', answer: ['does'], explain: 'seldom（很少）是隐藏的否定词，前半句算否定，尾巴用肯定；goes 是三单，用 does。' },
    { type: 'choice', q: 'Lucy is unhappy today, ___?', options: ["isn't she", 'is she', "doesn't she"], answer: 0, explain: 'unhappy 只是带否定前缀的形容词，不算否定词，前半句是肯定，尾巴用 isn\'t she。' },
    { type: 'fill', q: 'Jack dislikes swimming, ___ he?（填一个词）', answer: ["doesn't"], explain: 'dislike 不算否定词，前半句是肯定；dislikes 是三单实义动词，尾巴用 doesn\'t he。' },
    { type: 'choice', q: "—Your brother isn't a student, is he?<br>—___. He works in a hospital now.", options: ["No, he isn't", 'Yes, he is', 'No, he is'], answer: 0, explain: '事实是他不是学生（在医院工作），按事实回答用 No, he isn\'t.（中文是“是的，他不是”）。No 后面必须跟否定。' },
    { type: 'choice', say: "You didn't watch the football match last night, did you?", q: '听问句。事实是你昨晚看了那场比赛，应该怎样回答？', options: ['Yes, I did.', "No, I didn't.", "Yes, I didn't."], answer: 0, explain: '事实是看了，按事实用 Yes, I did.（中文是“不，我看了”）。Yes 后面必须跟肯定。' }
  ]
},

{
  id: 'g-sva', title: '主谓一致', short: '主谓一致', module: 'syntax', grade: 8, freq: 2,
  prereqs: ['g-conj', 'g-present-simple'],
  tip: '常在语法选择、短文填空中考 is / are、has / have 的选择；陷阱是 with、as well as 连接的主语，以及 either...or 的就近原则。',
  learn: [
    { h: '三大原则', html: `<ul>
      <li><b>语法一致</b>：主语是单数，谓语用单数；主语是复数，谓语用复数。</li>
      <li><b>就近原则</b>：谓语跟离它<b>最近</b>的主语一致。</li>
      <li><b>就远原则</b>：谓语跟<b>前面</b>的主语一致，后面那部分只是“附带的”。</li></ul>` },
    { h: '就近还是就远', html: `<table class="tbl"><tr><th>原则</th><th>连接词</th><th>例句</th></tr>
      <tr><td>就近</td><td>either...or, neither...nor, not only...but also, not...but, There be</td><td>Neither you nor he is right.</td></tr>
      <tr><td>就远（看前者）</td><td>with, together with, along with, as well as, like, except, besides</td><td>The teacher with his students is planting trees.</td></tr>
      <tr><td>一律复数</td><td>both...and, A and B（两个人/物）</td><td>Both Tom and Jim are from Fujian.</td></tr></table>
      <div class="rhyme">either、neither 看近处，<br>with、as well as 看前头，<br>both 和 and 永远是复数。</div>` },
    { h: '看作单数', html: `<ul>
      <li>each, every, everyone, everything, nothing, nobody 等做主语：<span class="en">Everyone is here.</span></li>
      <li><b>each of / either of / one of</b> + 复数名词：<span class="en">Each of us has a dictionary.</span></li>
      <li>动名词、不定式做主语：<span class="en">Reading is good for you.</span></li>
      <li>表示时间、金钱、距离的整体：<span class="en">Ten years is a long time.</span></li>
      <li><b>the number of</b>（……的数量）：<span class="en">The number of students is 500.</span></li>
      <li>news, maths, physics 等以 s 结尾的不可数名词或学科。</li></ul>` },
    { h: '看作复数', html: `<ul>
      <li><b>a number of</b>（许多）+ 复数名词：<span class="en">A number of students are playing.</span></li>
      <li>people, police 永远是复数：<span class="en">The police are looking for him.</span></li>
      <li>the + 形容词表示一类人：<span class="en">The old need our help.</span></li>
      <li>trousers, glasses, shoes 等成对的东西；但 a pair of 做主语时看 pair，用单数。</li></ul>
      <p class="ex">My family is a big one. My family are all watching TV now.<span class="zh">我家是个大家庭（整体，单数）。我的家人都在看电视（成员，复数）。</span></p>
      <p class="warn">most of / some of / half of / 百分数 of + 名词：看 of 后面的名词。Most of the water is ... / Most of the students are ...</p>` }
  ],
  examples: [
    { type: 'choice', q: 'My brother ___ to school by bike every day.', options: ['goes', 'go', 'going'], answer: 0, explain: '语法一致：主语 my brother 是单数第三人称，一般现在时的谓语要加 -es，用 goes。' },
    { type: 'choice', q: 'Either you or he ___ going to clean the classroom.', options: ['is', 'are', 'am'], answer: 0, explain: 'either...or 用就近原则，离谓语最近的是 he，用 is。' },
    { type: 'choice', q: 'Mr. Wang, as well as his students, ___ visiting the museum now.', options: ['is', 'are', 'am'], answer: 0, explain: 'as well as 用“就远原则”：谓语看前面的主语 Mr. Wang，单数，用 is。as well as his students 只是附带说明。' },
    { type: 'choice', q: 'Both Tom and Jim ___ from Fujian.', options: ['are', 'is', 'am'], answer: 0, explain: 'both...and 连接两个人，主语一律看作复数，用 are。' },
    { type: 'choice', q: 'Everyone in our class ___ ready for the exam.', options: ['is', 'are', 'be'], answer: 0, explain: 'everyone 虽然意思是“大家”，但语法上看作单数，用 is。every-, some-, any-, no- 开头的不定代词都一样。' },
    { type: 'choice', q: 'One of my friends ___ in Xiamen.', options: ['lives', 'live', 'living'], answer: 0, explain: 'one of + 复数名词做主语，真正的主语是 one，看作单数，用 lives。不要被 friends 迷惑。' },
    { type: 'choice', q: 'To learn a foreign language well ___ a lot of practice.', options: ['needs', 'need', 'needing'], answer: 0, explain: '不定式短语 to learn ... well 做主语，看作单数，谓语用 needs。动名词做主语也一样。' },
    { type: 'choice', q: 'Fifty yuan ___ too much for this T-shirt.', options: ['is', 'are', 'were'], answer: 0, explain: '表示金钱的数量当作一个整体，看作单数，用 is。时间、距离也一样，如 Ten years is a long time.' },
    { type: 'choice', q: '___ number of students in our class is 45.', options: ['The', 'A', 'An'], answer: 0, explain: '谓语是单数 is，表示“……的数量”，用 the number of。' },
    { type: 'choice', q: 'A number of students ___ playing football on the playground.', options: ['are', 'is', 'has'], answer: 0, explain: 'a number of 意思是“许多”，相当于 many，后接复数名词，谓语用复数 are。和 the number of（……的数量，单数）正好相反。' },
    { type: 'choice', q: 'No news ___ good news.', options: ['is', 'are', 'were'], answer: 0, explain: 'news 虽然以 s 结尾，却是不可数名词，看作单数，用 is。maths, physics 等学科也看作单数。' },
    { type: 'choice', q: 'People in Fuzhou ___ very friendly.', options: ['are', 'is', 'was'], answer: 0, explain: 'people（人们）本身就是复数，谓语用 are，不能加 s。police 也永远是复数。' },
    { type: 'choice', q: 'The old ___ our help and care.', options: ['need', 'needs', 'needing'], answer: 0, explain: 'the + 形容词表示一类人，the old 意思是“老年人”，看作复数，谓语用 need。' },
    { type: 'choice', q: 'This pair of shoes ___ too small for me.', options: ['is', 'are', 'were'], answer: 0, explain: 'shoes 单独做主语用复数，但 a / this pair of shoes 做主语时，谓语看 pair，单数，用 is。' },
    { type: 'fill', q: 'My family ___ all watching TV now.（填 be 动词）', answer: ['are'], explain: 'family 指“家人们”（成员），且句中有 all，看作复数，用 are；如果指“家庭”这个整体，如 My family is a big one，就用单数。' },
    { type: 'fill', q: 'Most of the water in the river ___ polluted.（填 be 动词，用一般现在时）', answer: ['is'], explain: 'most of 后面看名词，water 不可数，用 is。' }
  ],
  tests: [
    { type: 'choice', q: 'Neither he nor I ___ good at maths.', options: ['am', 'is', 'are'], answer: 0, explain: 'neither...nor 用就近原则，离谓语最近的是 I，用 am。' },
    { type: 'choice', q: 'The teacher, together with his students, ___ planting trees now.', options: ['is', 'are', 'am'], answer: 0, explain: 'together with 看前面的主语 the teacher，单数，用 is。' },
    { type: 'choice', q: 'The number of the students in our school ___ about 2,000.', options: ['is', 'are', 'have'], answer: 0, explain: 'the number of 表示“……的数量”，看作单数，用 is。' },
    { type: 'fill', q: 'Reading English stories every day ___ us a lot.（help，用一般现在时）', answer: ['helps'], explain: '动名词短语做主语，看作单数，help 加 s。' },
    { type: 'choice', q: 'Each of the students ___ a new dictionary.', options: ['has', 'have', 'having'], answer: 0, explain: 'each of + 复数名词做主语，谓语用单数 has。' },
    { type: 'choice', q: 'Twenty minutes ___ enough for me to finish the work.', options: ['is', 'are', 'were'], answer: 0, explain: '表示时间的整体，看作单数，用 is。' },
    { type: 'fill', q: 'The police ___ looking for the lost boy now.（填 be 动词）', answer: ['are'], explain: 'police 永远看作复数，用 are。' },
    { type: 'fill', q: 'The boys in the next room ___ talking loudly now.（填 be 动词）', answer: ['are'], explain: '主语是 the boys（复数），in the next room 只是修饰语，谓语用 are。' },
    { type: 'fill', q: 'The bag on the desk ___ (belong) to me.（用一般现在时）', answer: ['belongs'], explain: '主语是 the bag（单数），on the desk 是修饰语，一般现在时用 belongs。' },
    { type: 'choice', q: 'Not only the students but also their teacher ___ excited about the trip.', options: ['is', 'are', 'be'], answer: 0, explain: 'not only...but also 用就近原则，离谓语最近的是 their teacher，单数，用 is。' },
    { type: 'choice', q: 'There ___ a pen and two books on the desk.', options: ['is', 'are', 'be'], answer: 0, explain: 'There be 句型用就近原则，紧跟在后面的是 a pen，单数，用 is。' },
    { type: 'fill', q: 'Either my parents or my brother ___ going to meet you at the station.（填 be 动词）', answer: ['is'], explain: 'either...or 就近原则，离谓语最近的是 my brother，用 is。' },
    { type: 'choice', q: 'The old man with his grandchildren ___ walking in the park.', options: ['is', 'are', 'were'], answer: 0, explain: 'with 用就远原则，谓语看前面的 the old man，单数，用 is。' },
    { type: 'fill', q: 'Nobody except Tom and Jim ___ (know) the answer.（用一般现在时）', answer: ['knows'], explain: 'except 连接时谓语看前面的主语 nobody，单数，用 knows。' },
    { type: 'choice', q: 'Both Lucy and Lily ___ good at singing.', options: ['are', 'is', 'am'], answer: 0, explain: 'both...and 连接的主语一律用复数，用 are。' },
    { type: 'fill', q: 'Tom and his brother ___ in the same school.（填 be 动词，用一般现在时）', answer: ['are'], explain: '用 and 连接的两个人做主语，看作复数，用 are。' },
    { type: 'choice', q: 'Everything in the shop ___ cheap today.', options: ['is', 'are', 'be'], answer: 0, explain: 'everything 做主语看作单数，用 is。' },
    { type: 'fill', q: 'Nobody ___ (want) to be left alone.', answer: ['wants'], explain: 'nobody 做主语看作单数，一般现在时用 wants。' },
    { type: 'choice', q: 'Either of the two answers ___ right.', options: ['is', 'are', 'be'], answer: 0, explain: 'either of + 复数名词做主语，看作单数，用 is。' },
    { type: 'fill', q: 'One of the boys ___ (have) a pet dog.（用一般现在时）', answer: ['has'], explain: 'one of + 复数名词做主语，真正的主语是 one，单数，用 has。' },
    { type: 'choice', q: 'Playing computer games too much ___ bad for your eyes.', options: ['is', 'are', 'be'], answer: 0, explain: '动名词短语做主语看作单数，用 is，不要被 games 迷惑。' },
    { type: 'fill', q: 'Three kilometers ___ not far for me. I can walk there.（填 be 动词）', answer: ['is'], explain: '表示距离的整体看作单数，用 is。' },
    { type: 'choice', q: 'The number of cars in our city ___ growing fast.', options: ['is', 'are', 'have'], answer: 0, explain: 'the number of 表示“……的数量”，主语是 number，单数，用 is。' },
    { type: 'fill', q: '___ number of visitors to Gulangyu is very large every summer.（填一个词，首字母大写）', answer: ['The'], explain: '谓语是单数 is，意思是“游客的数量很大”，用 The number of。' },
    { type: 'choice', q: 'Maths ___ my favourite subject.', options: ['is', 'are', 'be'], answer: 0, explain: 'maths 是学科名称，虽以 s 结尾，看作单数，用 is。' },
    { type: 'fill', q: 'The news ___ very exciting.（填 be 动词，用一般现在时）', answer: ['is'], explain: 'news 是不可数名词，看作单数，用 is。' },
    { type: 'choice', q: '___ number of people ___ waiting for the bus.', options: ['A; are', 'The; are', 'A; is'], answer: 0, explain: 'a number of 表示“许多”，后面的谓语用复数 are；the number of 后面要用单数。' },
    { type: 'fill', q: 'A number of students in our school ___ from the countryside.（填 be 动词，用一般现在时）', answer: ['are'], explain: 'a number of（许多）+ 复数名词，谓语用复数 are。' },
    { type: 'choice', q: 'A number of trees ___ planted every year, so the number of trees in our town ___ growing.', options: ['are; is', 'is; are', 'is; is'], answer: 0, explain: 'a number of（许多）后谓语用复数 are；the number of（……的数量）后谓语用单数 is。' },
    { type: 'choice', q: 'The people in this village ___ very kind.', options: ['are', 'is', 'was'], answer: 0, explain: 'people 永远是复数，用 are。' },
    { type: 'choice', q: 'The young ___ full of energy.', options: ['are', 'is', 'be'], answer: 0, explain: 'the + 形容词表示一类人，the young（年轻人）看作复数，用 are。' },
    { type: 'fill', q: 'The poor in that area ___ (need) more help.（用一般现在时）', answer: ['need'], explain: 'the poor 表示“穷人”这一类人，看作复数，谓语用 need，不加 s。' },
    { type: 'choice', q: "My glasses ___ broken. I can't see clearly.", options: ['are', 'is', 'be'], answer: 0, explain: 'glasses（眼镜）是成对的东西，单独做主语看作复数，用 are。' },
    { type: 'choice', q: 'A pair of trousers ___ on the bed.', options: ['is', 'are', 'be'], answer: 0, explain: 'a pair of + 成对的名词做主语，谓语看 pair，单数，用 is。' },
    { type: 'choice', q: 'My family ___ a big one. There are six people in it.', options: ['is', 'are', 'have'], answer: 0, explain: '这里 family 指“家庭”这个整体，看作单数，用 is。' },
    { type: 'choice', q: 'His family ___ all doctors.', options: ['are', 'is', 'has'], answer: 0, explain: '“他的家人都是医生”，family 指家庭成员，看作复数，用 are。' },
    { type: 'choice', q: 'Half of the students in our class ___ glasses.', options: ['wear', 'wears', 'wearing'], answer: 0, explain: 'half of + 名词，谓语看 of 后面的名词；students 是复数，用 wear。' },
    { type: 'fill', q: 'Most of the cake ___ eaten by the children yesterday.（填 be 动词）', answer: ['was'], explain: 'most of 后面看名词，cake 在这里指“蛋糕的大部分”，看作单数；yesterday 用过去时，所以是 was。' },
    { type: 'choice', q: 'Most of the students in our school ___ to school by bus.', options: ['go', 'goes', 'going'], answer: 0, explain: 'most of 后面看名词，students 是复数，用 go。' }
  ]
},

{
  id: 'g-adv-time', title: '时间状语从句', short: '时间状语从句', module: 'syntax', grade: 8, freq: 3,
  prereqs: ['g-future', 'g-past-cont'],
  tip: '高频考点：连词 when / while / until / since / as soon as 的选择，以及“主将从现”；not...until 是经典陷阱。',
  learn: [
    { h: '常用连词', html: `<table class="tbl"><tr><th>连词</th><th>意思</th><th>例句</th></tr>
      <tr><td>when</td><td>当……时</td><td>When I got home, my mother was cooking.</td></tr>
      <tr><td>while</td><td>在……期间（接延续性动作）</td><td>While I was reading, the phone rang.</td></tr>
      <tr><td>before / after</td><td>在……之前 / 之后</td><td>Wash your hands before you eat.</td></tr>
      <tr><td>as soon as</td><td>一……就……</td><td>I'll call you as soon as I arrive.</td></tr>
      <tr><td>until / till</td><td>直到……</td><td>I waited until he came.</td></tr>
      <tr><td>since</td><td>自从……</td><td>I have lived here since I was five.</td></tr></table>` },
    { h: '主将从现', html: `<p>主句是一般将来时（或祈使句、含情态动词），时间状语从句用<b>一般现在时</b>表示将来。</p>
      <p class="ex">I will call you when I get to Fuzhou.<span class="zh">我到福州时会给你打电话。（不能写 when I will get）</span></p>
      <p class="ex">Please wait here until I come back.<span class="zh">请在这里等，直到我回来。</span></p>` },
    { h: 'when 和 while', html: `<ul>
      <li><b>while</b> 后面必须是<b>延续性</b>动作，常用进行时。</li>
      <li><b>when</b> 后面延续性、短暂性动作都可以。</li></ul>
      <p class="ex">We were watching TV when the lights went out.<span class="zh">我们正在看电视，这时灯灭了。（went out 是一瞬间，只能用 when）</span></p>
      <p class="ex">While my mother was cooking, I was doing my homework.<span class="zh">妈妈做饭的时候，我在写作业。</span></p>` },
    { h: 'until 和 not...until', html: `<ul>
      <li>肯定句：主句动词是<b>延续性</b>的 —— <span class="en">I waited until he came.</span>（一直等到他来）</li>
      <li>否定句 not...until：主句动词常是<b>短暂性</b>的，意思是“直到……才……”</li></ul>
      <p class="ex">He didn't go to bed until his mother came back.<span class="zh">直到妈妈回来，他才去睡觉。</span></p>
      <div class="rhyme">肯定 until 一直做，<br>否定 until 才开始。</div>` },
    { h: 'since 的时态', html: `<p><b>主句用现在完成时，since 从句用一般过去时。</b></p>
      <p class="ex">She has taught here since she left college.<span class="zh">她大学毕业后就一直在这里教书。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: 'When I got home yesterday, my mother ___ dinner.', options: ['was cooking', 'cooks', 'will cook'], answer: 0, explain: 'when 意思是“当……时”。从句 got home 是过去的一个时间点，那时妈妈“正在做饭”，主句用过去进行时 was cooking。' },
    { type: 'choice', q: 'My father was watching TV ___ I was doing my homework.', options: ['while', 'until', 'since'], answer: 0, explain: 'while 表示“在……期间”，后面接延续性动作，常用进行时；两个动作同时在进行，用 while。' },
    { type: 'choice', q: 'I was having a shower ___ the phone rang.', options: ['when', 'while', 'until'], answer: 0, explain: '辨析 when 和 while：空格后的 rang（电话响）是一瞬间的短暂动作，while 后面必须接延续性动作，所以只能用 when。如果换成 ___ I was having a shower, the phone rang，空格接的是延续动作，when 和 while 都可以。' },
    { type: 'choice', q: 'Please brush your teeth ___ you go to bed.', options: ['before', 'after', 'since'], answer: 0, explain: '“睡觉之前刷牙”，用 before（在……之前）；after 是“在……之后”，不合常理。' },
    { type: 'choice', q: "I'll tell him the good news as soon as he ___ back.", options: ['comes', 'will come', 'came'], answer: 0, explain: '主将从现：主句是将来时，as soon as 从句用一般现在时 comes。' },
    { type: 'choice', q: 'Please wait here until I ___ back.', options: ['come', 'will come', 'came'], answer: 0, explain: '主句是祈使句，时间状语从句同样用一般现在时表示将来，用 come。“主将从现”的“主将”也包括祈使句和含情态动词的句子。' },
    { type: 'choice', q: 'I waited at the school gate ___ my friend came.', options: ['until', 'since', 'while'], answer: 0, explain: '肯定句中 until 表示“一直到……”，主句动词 waited 是延续性的：一直等到朋友来。' },
    { type: 'choice', q: "He didn't go to bed ___ he finished his homework.", options: ['until', 'while', 'since'], answer: 0, explain: 'not...until 表示“直到……才”：直到写完作业才睡觉。' },
    { type: 'choice', q: 'My cousin has studied in Xiamen ___ she was twelve.', options: ['since', 'until', 'before'], answer: 0, explain: 'since 意思是“自从……以来”，从过去某一时刻一直持续到现在。主句 has studied 是现在完成时，从句 was twelve 是过去的起点，用 since。' },
    { type: 'fill', q: 'I ___ (live) here since I was five.', answer: ['have lived', "'ve lived", 'have been living'], explain: 'since 引导的从句用一般过去时（was five），主句用现在完成时 have lived，表示从那时一直持续到现在。' }
  ],
  tests: [
    { type: 'choice', q: "I'll call you when I ___ in Fuzhou.", options: ['arrive', 'will arrive', 'arrived'], answer: 0, explain: '主将从现：主句是将来时，when 从句用一般现在时 arrive。' },
    { type: 'choice', q: 'While my mother ___ dinner, the phone rang.', options: ['was cooking', 'is cooking', 'cooks'], answer: 0, explain: 'while 后接延续性动作，电话响时（过去）妈妈正在做饭，用过去进行时。' },
    { type: 'choice', q: "Tom didn't go to bed ___ his father came back home last night.", options: ['until', 'while', 'since'], answer: 0, explain: 'not...until 表示“直到……才”。while 需要延续性动作，came back 是一瞬间；since 不合句意。' },
    { type: 'fill', q: 'My grandpa has lived in this village since he ___ a child.（be）', answer: ['was'], explain: '主句是现在完成时，since 从句用一般过去时，he 用 was。' },
    { type: 'choice', q: 'Please turn off the lights ___ you leave the classroom.', options: ['before', 'since', 'until'], answer: 0, explain: '“离开教室之前关灯”，用 before。' },
    { type: 'fill', q: 'My mother will cook dinner as soon as she ___ home from work.（get）', answer: ['gets'], explain: '主将从现：as soon as 从句用一般现在时，she 是三单，用 gets。' },
    { type: 'choice', q: 'We were watching TV ___ the lights went out.', options: ['when', 'while', 'since'], answer: 0, explain: 'went out 是一瞬间的动作，while 后面要接延续性动作，所以用 when。' },
    { type: 'choice', q: 'It was raining hard ___ we left school yesterday.', options: ['when', 'while', 'since'], answer: 0, explain: 'left 是短暂动作，不能跟在 while 后面；“我们离校时正下大雨”，用 when。' },
    { type: 'fill', q: 'I was reading a book ___ my friend knocked at the door.（填一个词）', answer: ['when'], explain: 'knocked 是短暂动作，表示“正在看书时，朋友敲门了”，用 when。' },
    { type: 'choice', q: "Don't talk ___ you are eating.", options: ['while', 'until', 'since'], answer: 0, explain: '“吃饭的时候不要说话”，are eating 是延续性动作，用 while。' },
    { type: 'choice', q: 'While I ___ along the street, I met an old friend.', options: ['was walking', 'walk', 'am walking'], answer: 0, explain: 'while 后接延续性动作，常用进行时；met 是过去时，所以用过去进行时 was walking。' },
    { type: 'choice', q: 'He went to bed ___ he had finished all his homework, so he slept well.', options: ['after', 'before', 'since'], answer: 0, explain: '“做完所有作业之后才去睡觉，所以睡得很好”，用 after（在……之后）。' },
    { type: 'fill', q: "We'll have dinner ___ Dad comes back. Let's wait for him.（填一个词）", answer: ['after', 'when'], explain: '“等爸爸回来后再吃饭”，用 after（也可以用 when）；从句用一般现在时 comes，是主将从现。' },
    { type: 'choice', q: 'Please give her the message ___ she arrives.', options: ['as soon as', 'unless', 'although'], answer: 0, explain: '“她一到就把消息告诉她”，用 as soon as（一……就……）。' },
    { type: 'choice', q: 'We waited in the hall ___ the rain stopped.', options: ['until', 'since', 'while'], answer: 0, explain: '肯定句中 until 表示“一直到……”：在大厅里一直等到雨停，waited 是延续性动作。' },
    { type: 'fill', q: 'Please stay in the classroom ___ the bell rings.（填一个词，意思是“直到”）', answer: ['until', 'till'], explain: '“直到铃响”用 until 或 till；主句是祈使句，从句用一般现在时 rings。' },
    { type: 'fill', q: "Don't cross the road until the light ___ (turn) green.", answer: ['turns'], explain: '主句是祈使句，until 从句用一般现在时表示将来，the light 是三单，用 turns。' },
    { type: 'fill', q: "The boy didn't stop crying ___ his mother came back.（填一个词）", answer: ['until', 'till'], explain: 'not...until 表示“直到……才”：直到妈妈回来，男孩才停止哭泣。' },
    { type: 'fill', q: '直到他回来，我才去睡觉。<br>I ___ go to bed until he came back.（填一个词）', answer: ["didn't"], explain: '“直到……才……”用 not...until，主句用否定 didn\'t go to bed，go to bed 是短暂动作。' },
    { type: 'choice', q: 'Great changes ___ in my hometown since I left it ten years ago.', options: ['have taken place', 'took place', 'take place'], answer: 0, explain: 'since 从句用一般过去时（left），主句用现在完成时 have taken place。' },
    { type: 'fill', q: 'My aunt has worked as a volunteer since she ___ (retire) in 2015.', answer: ['retired'], explain: '主句是现在完成时，since 从句用一般过去时 retired。' }
  ]
},

{
  id: 'g-adv-cond', title: '条件状语从句 if / unless', short: '条件状语从句', module: 'syntax', grade: 8, freq: 3,
  prereqs: ['g-future'],
  tip: '必考“主将从现”：if / unless 从句用一般现在时；陷阱是表示“是否”的 if（宾语从句）可以用将来时，两者要分清。',
  learn: [
    { h: 'if：如果', html: `<p>if 引导条件状语从句，意思是“如果”。</p>
      <p class="ex">If it rains tomorrow, we will stay at home.<span class="zh">如果明天下雨，我们就待在家里。</span></p>
      <p>主句除了用将来时，也可以是<b>祈使句</b>或<b>含情态动词</b>的句子：</p>
      <p class="ex">If you are free, come and join us.<span class="zh">如果你有空，就来和我们一起吧。</span></p>
      <p class="ex">If you want to be healthy, you should exercise more.<span class="zh">如果你想健康，就应该多锻炼。</span></p>` },
    { h: '主将从现', html: `<div class="rhyme">主句将来时，从句用现在；<br>if 说的“如果”，将来不用 will。</div>
      <p class="warn">If it will rain tomorrow ✗ —— 条件状语从句里用 If it rains tomorrow</p>` },
    { h: 'unless = if ... not', html: `<p>unless 意思是“除非、如果不”，本身就带否定意思，从句里<b>不再加 not</b>。</p>
      <p class="ex">You will be late unless you hurry.<span class="zh">除非你快点，否则你会迟到。</span></p>
      <p class="ex">You will be late if you don't hurry.<span class="zh">如果你不快点，你会迟到。（意思相同）</span></p>
      <p>另一个常用连词：<b>as long as</b>（只要）</p>
      <p class="ex">As long as you work hard, you will make progress.<span class="zh">只要你努力，就会进步。</span></p>` },
    { h: '易错点：两种 if', html: `<table class="tbl"><tr><th></th><th>意思</th><th>时态</th></tr>
      <tr><td>条件状语从句</td><td>如果</td><td>主将从现</td></tr>
      <tr><td>宾语从句（跟在 know, ask 等后面）</td><td>是否</td><td>按实际需要，将来就用将来时</td></tr></table>
      <p class="ex">I don't know if he will come. If he comes, I will tell you.<span class="zh">我不知道他是否会来。如果他来，我会告诉你。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: 'If it ___ fine tomorrow, we will go for a picnic.', options: ['is', 'will be', 'was'], answer: 0, explain: 'if 表示“如果”，引导条件状语从句。主句 we will go 是将来时，从句要用一般现在时 is 表示将来，这就是“主将从现”，不能写 will be。' },
    { type: 'fill', q: '改错：If it will rain tomorrow, we will stay at home.<br>→ If it ___ tomorrow, we will stay at home.（改正错误，填一个词）', answer: ['rains'], explain: '主将从现：if 表示“如果”时，主句 we will stay 是将来时，从句不能用 will，要用一般现在时代替将来，it 是三单，所以 will rain 改成 rains。' },
    { type: 'choice', q: 'If you are free this weekend, ___ and play football with us.', options: ['come', 'coming', 'to come'], answer: 0, explain: '条件状语从句的主句也可以是祈使句，祈使句用动词原形开头，用 come。' },
    { type: 'choice', q: 'If you want to keep healthy, you ___ eat more vegetables.', options: ['should', "shouldn't", "mustn't"], answer: 0, explain: '主句可以含情态动词。“想保持健康，就应该多吃蔬菜”，用 should；另外两个意思相反。' },
    { type: 'choice', q: "I don't know if he ___ tomorrow. If he ___, I'll tell you.", options: ['will come; comes', 'comes; will come', 'will come; will come'], answer: 0, explain: '第一个 if 是“是否”，宾语从句按实际用将来时 will come；第二个 if 是“如果”，主将从现用 comes。' },
    { type: 'fill', q: '同义句：If you don\'t take a taxi, you will miss the train.<br>→ You will miss the train ___ you take a taxi.（填一个词）', answer: ['unless'], explain: 'if ... not = unless（除非）。' },
    { type: 'choice', q: '___ you keep practising, you will speak English well.', options: ['As long as', 'Unless', 'Until'], answer: 0, explain: 'as long as 意思是“只要”，也引导条件状语从句，同样主将从现：“只要坚持练习，你就能说好英语”。' }
  ],
  tests: [
    { type: 'choice', q: "If it ___ tomorrow, we won't go to the park.", options: ['rains', 'will rain', 'rained'], answer: 0, explain: '主将从现：if 从句用一般现在时 rains。' },
    { type: 'choice', q: 'You will miss the early bus ___ you hurry up.', options: ['unless', 'if', 'because'], answer: 0, explain: '“除非你快点，否则会错过早班车”，用 unless。' },
    { type: 'fill', q: 'If you ___ (not hurry), you will be late for school.', answer: ["don't hurry", 'do not hurry'], explain: '主将从现：if 从句用一般现在时，否定用 don\'t + 动词原形。' },
    { type: 'choice', q: "—Do you know if Mr. Li ___ to the meeting tomorrow?<br>—I'm not sure. If he ___, I'll let you know.", options: ['will come; comes', 'comes; comes', 'will come; will come'], answer: 0, explain: '第一个 if 是“是否”，用将来时；第二个 if 是“如果”，主将从现用 comes。' },
    { type: 'choice', q: '___ you work hard, you will make great progress.', options: ['As long as', 'Unless', 'Although'], answer: 0, explain: '“只要努力，就会进步”，用 as long as。' },
    { type: 'fill', q: 'If my sister ___ (have) time this weekend, she will visit our grandma.', answer: ['has'], explain: '主将从现：if 从句用一般现在时，my sister 是三单，用 has。' },
    { type: 'choice', q: "—Will you go to the concert tonight?<br>—Yes, I will, ___ I have too much homework.", options: ['unless', 'if', 'so'], answer: 0, explain: '“我会去，除非作业太多”，用 unless。' },
    { type: 'fill', q: 'If we ___ (leave) now, we will catch the train.', answer: ['leave'], explain: 'if 意思是“如果”，主句是将来时，从句用一般现在时，we 后面用原形 leave。' },
    { type: 'choice', q: 'If you have any questions, please ___ your hand.', options: ['put up', 'to put up', 'putting up'], answer: 0, explain: '主句是祈使句，用动词原形开头，please put up your hand。' },
    { type: 'fill', q: 'If you feel tired, ___ (have) a rest.', answer: ['have'], explain: '主句是祈使句，用动词原形 have。' },
    { type: 'choice', q: 'If you want to pass the exam, you ___ work harder.', options: ['must', "mustn't", "needn't"], answer: 0, explain: '主句含情态动词：“想通过考试，就必须更努力”，用 must。' },
    { type: 'fill', q: 'If it rains this afternoon, we ___ go out to play.（用 can 的否定形式）', answer: ["can't", 'cannot'], explain: '主句可以含情态动词：“如果下雨，我们就不能出去玩”，用 can\'t。从句 rains 仍用一般现在时。' },
    { type: 'choice', q: '下面哪一句能表达“如果你不努力，就会失败”？', options: ['You will fail unless you work hard.', "You will fail unless you don't work hard.", 'You will fail if you work hard.'], answer: 0, explain: 'unless 本身就是“如果不”，后面不能再加 don\'t；第三句意思是“如果努力就会失败”，意思反了。' },
    { type: 'fill', q: 'As ___ as you try your best, we will be proud of you.（填一个词）', answer: ['long'], explain: 'as long as 意思是“只要”。' },
    { type: 'choice', q: 'I wonder if it ___ tomorrow.', options: ['will snow', 'snows', 'snowed'], answer: 0, explain: '这里 if 跟在 wonder 后面，意思是“是否”，是宾语从句，说的是明天的事，就用将来时 will snow。' },
    { type: 'fill', q: 'Could you tell me if you ___ (join) us next Sunday?', answer: ['will join', "'ll join", 'are going to join'], explain: 'if 跟在 tell me 后面，意思是“是否”，引导宾语从句，next Sunday 是将来，用 will join，不受主将从现限制。' }
  ]
},

{
  id: 'g-adv-reason', title: '原因、结果、目的状语从句', short: '原因结果目的从句', module: 'syntax', grade: 8, freq: 3,
  prereqs: ['g-conj', 'g-too-enough'],
  tip: '高频考点：because 与 because of、so...that 与 such...that、so that（为了）；because 和 so 不能在同一句里同时出现。',
  learn: [
    { h: '原因：because / since / as', html: `<p class="ex">I didn't go to school because I was ill.<span class="zh">我没去上学，因为我病了。</span></p>
      <p class="ex">Since everyone is here, let's start.<span class="zh">既然大家都到了，我们开始吧。</span></p>
      <ul><li><b>because</b> 语气最强，回答 Why 只能用 because。</li>
      <li><b>because</b> 后面接句子；<b>because of</b> 后面接名词、代词或 doing。</li></ul>
      <p class="ex">We stayed at home because of the heavy rain.<span class="zh">因为大雨我们待在家里。</span></p>
      <p class="warn">because 和 so 不能同时用：Because he was ill, so he didn't come. ✗ 二选一即可。</p>` },
    { h: '结果：so ... that / such ... that', html: `<p>意思是“如此……以至于……”。关键看后面<b>有没有名词</b>：</p>
      <table class="tbl"><tr><th>结构</th><th>例子</th></tr>
      <tr><td>so + 形容词 / 副词 + that</td><td>He was so tired that he fell asleep at once.</td></tr>
      <tr><td>such + a/an + 形容词 + 单数名词 + that</td><td>It was such a good film that I saw it twice.</td></tr>
      <tr><td>such + 形容词 + 复数名词 / 不可数名词 + that</td><td>It was such fine weather that we went out.</td></tr>
      <tr><td>so + many / much / few / little + 名词 + that</td><td>There were so many people that we couldn't get in.</td></tr></table>
      <div class="rhyme">so 后跟形副，such 后跟名词；<br>many、much、few、little 前面还用 so。</div>` },
    { h: '目的：so that（为了）', html: `<p><b>so that</b> 引导目的状语从句，从句里常有 can / could。</p>
      <p class="ex">He got up early so that he could catch the first bus.<span class="zh">他早起是为了赶上头班车。</span></p>
      <p>同义转换：so that + 从句 = <b>in order to / to</b> + 动词原形（主语相同时）</p>
      <p class="ex">He got up early in order to catch the first bus.<span class="zh">他早起是为了赶上头班车。</span></p>` },
    { h: '同义转换：so...that 与 too...to / enough to', html: `<p class="ex">The box is so heavy that I can't carry it.<span class="zh">箱子太重了，我搬不动。</span></p>
      <p class="ex">The box is too heavy for me to carry.<span class="zh">（同义）</span></p>
      <p class="ex">She is so tall that she can reach the top shelf.<span class="zh">她个子很高，能够到最上面的书架。</span></p>
      <p class="ex">She is tall enough to reach the top shelf.<span class="zh">（同义）</span></p>
      <p class="warn">so...that 从句是否定的，转成 too...to；从句是肯定的，转成 enough to。</p>` }
  ],
  examples: [
    { type: 'choice', q: '—Why were you late for school?<br>—___ I missed the bus.', options: ['Because', 'Since', 'So'], answer: 0, explain: '回答 Why 的问句只能用 because，它表示原因的语气最强；since / as 也表示原因，但不能用来回答 Why；so 表示结果。' },
    { type: 'choice', q: 'We stayed at home ___ the heavy rain.', options: ['because of', 'because', 'so'], answer: 0, explain: 'the heavy rain 是名词短语，不是句子，用 because of。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['Because it rained, so we stayed at home.', 'Because it rained, we stayed at home.', 'Because of it rained, we stayed at home.'], answer: 1, explain: 'because 和 so 不能在同一句里同时用，二选一；because of 后面不能接句子 it rained。' },
    { type: 'choice', q: 'He ran ___ fast that nobody could catch him.', options: ['so', 'such', 'too'], answer: 0, explain: 'fast 是副词，后面没有名词，用 so + 副词 + that。too 不能和 that 搭配。' },
    { type: 'choice', q: 'It was ___ good film that I saw it twice.', options: ['such a', 'so a', 'such'], answer: 0, explain: 'film 是可数名词单数，结构是 such + a + 形容词 + 单数名词 + that。' },
    { type: 'choice', q: 'It was ___ fine weather that we all went to the beach.', options: ['such', 'so', 'such a'], answer: 0, explain: 'weather 是不可数名词，前面用 such，不能加 a。' },
    { type: 'choice', q: 'There was ___ little water that the plants all died.', options: ['so', 'such', 'too'], answer: 0, explain: 'little 后面虽然有名词 water，但 many / much / few / little 前面要用 so，不用 such。' },
    { type: 'choice', q: 'Mum left the light on ___ I could see my way.', options: ['so that', 'because', 'although'], answer: 0, explain: 'so that 表示目的“为了、以便”，从句里常有 can / could：妈妈开着灯，是为了让我看得见路。' },
    { type: 'fill', q: 'He studies hard so that he can go to a good high school.<br>→ He studies hard in order ___ go to a good high school.（填一个词）', answer: ['to'], explain: '主语相同时，so that + 从句 可以换成 in order to + 动词原形（或只用 to），去掉 he can。' },
    { type: 'fill', q: "The question is so difficult that I can't answer it.<br>→ The question is ___ difficult for me to answer.（填一个词）", answer: ['too'], explain: 'so...that 后面是否定从句（can\'t），转换成 too...to（太……而不能）；注意 to answer 后面不再加 it。' },
    { type: 'fill', q: 'She is so tall that she can reach the top shelf.<br>→ She is tall ___ to reach the top shelf.（填一个词）', answer: ['enough'], explain: 'so...that 后面是肯定从句（can reach），转换成 形容词 + enough to；enough 要放在形容词后面。' }
  ],
  tests: [
    { type: 'choice', q: 'The football match was put off ___ the bad weather.', options: ['because of', 'because', 'so'], answer: 0, explain: 'the bad weather 是名词短语，用 because of。' },
    { type: 'choice', q: 'He was ___ tired that he fell asleep at once.', options: ['so', 'such', 'too'], answer: 0, explain: 'tired 是形容词，后面没有名词，用 so...that。' },
    { type: 'choice', q: 'It was ___ interesting book that I read it twice.', options: ['such an', 'so an', 'such'], answer: 0, explain: 'book 是可数名词单数，用 such + an + 形容词 + 名词。' },
    { type: 'fill', q: 'Please speak louder ___ ___ everyone can hear you.（填两个词，表示“为了”）', answer: ['so that'], explain: 'so that 引导目的状语从句，“为了让大家都能听见”。' },
    { type: 'fill', q: 'The box is too heavy for me to carry.<br>→ The box is ___ heavy that I can\'t carry it.（填一个词）', answer: ['so'], explain: 'too...to 可以转换成 so...that + 否定从句。' },
    { type: 'choice', q: "There were ___ many people in the hall that we couldn't find a seat.", options: ['so', 'such', 'too'], answer: 0, explain: 'many 前面用 so，不用 such。' },
    { type: 'choice', q: 'He got up very early ___ he could catch the first bus.', options: ['so that', 'because', 'although'], answer: 0, explain: '“早起是为了赶头班车”，表示目的，用 so that。' },
    { type: 'choice', q: "___ you are free now, let's go swimming.", options: ['Since', 'Unless', 'Although'], answer: 0, explain: 'since 放句首表示“既然”，说明大家都知道的原因：“既然你现在有空，我们去游泳吧”。' },
    { type: 'choice', say: "Why didn't you come to the party yesterday?", q: '听问句，选择恰当的答语。', options: ['Because I had a bad cold.', 'So I had a bad cold.', 'Because of I was ill.'], answer: 0, explain: '回答 Why 用 because + 句子；so 表示结果，不能回答原因；because of 后面不能接句子。' },
    { type: 'choice', q: "He didn't come to school ___ he was ill.", options: ['because', 'because of', 'so'], answer: 0, explain: 'he was ill 是一个句子，用 because；because of 后面只能接名词、代词或 doing。' },
    { type: 'fill', q: 'We had to stop the game because ___ the rain.（填一个词）', answer: ['of'], explain: 'the rain 是名词，前面用 because of。' },
    { type: 'fill', q: '改错：Because he was tired, so he went to bed early.<br>（这句话多了一个词，写出可以删去的那个词）', answer: ['so', 'because', 'Because'], explain: 'because 和 so 不能同时出现，删去其中一个即可：Because he was tired, he went to bed early. 或 He was tired, so he went to bed early.' },
    { type: 'choice', q: '下面哪句是正确的？', options: ["He was ill, so he didn't come.", "Because he was ill, so he didn't come.", "He didn't come because of he was ill."], answer: 0, explain: '只用 so 表示结果是对的；because 和 so 不能同句出现；because of 后面不能接句子。' },
    { type: 'choice', q: 'She sang ___ well that everyone cheered.', options: ['so', 'such', 'very'], answer: 0, explain: 'well 是副词，后面没有名词，用 so...that。' },
    { type: 'fill', q: 'It was ___ exciting match that we all shouted loudly.（填两个词）', answer: ['such an'], explain: 'match 是可数名词单数，exciting 以元音音素开头，用 such an + 形容词 + 名词。' },
    { type: 'choice', q: 'They are ___ lovely children that everyone likes them.', options: ['such', 'so', 'such a'], answer: 0, explain: 'children 是复数名词，用 such + 形容词 + 复数名词，不加 a。' },
    { type: 'fill', q: 'We had ___ bad weather that the trip was put off.（填 so 或 such）', answer: ['such'], explain: 'weather 是不可数名词，名词前用 such。' },
    { type: 'choice', q: "He has ___ little money that he can't buy the book.", options: ['so', 'such', 'too'], answer: 0, explain: 'little 前面用 so，不用 such。' },
    { type: 'fill', q: 'There were ___ few people in the street that it was very quiet.（填 so 或 such）', answer: ['so'], explain: 'few + 名词前面用 so，不用 such。' },
    { type: 'choice', q: 'He saved money ___ buy a birthday gift for his mother.', options: ['in order to', 'so that', 'because'], answer: 0, explain: '空后是动词原形 buy，用 in order to；so that 和 because 后面都要接句子。' },
    { type: 'fill', q: 'We got up early so that we could watch the sunrise.<br>→ We got up early ___ watch the sunrise.（填一个词）', answer: ['to'], explain: '主语相同时，so that 从句可以换成不定式 to + 动词原形，表示目的。' },
    { type: 'choice', q: "The boy is so young that he can't go to school.<br>→ The boy is ___ young ___ go to school.", options: ['too; to', 'so; that', 'enough; to'], answer: 0, explain: 'so...that 后是否定从句，转换成 too...to（太……而不能）。' },
    { type: 'choice', q: 'He is strong enough to carry the box.<br>→ He is ___ strong ___ he can carry the box.', options: ['so; that', 'too; to', 'such; that'], answer: 0, explain: 'enough to 可以换成 so...that + 肯定从句；strong 是形容词，用 so 不用 such。' },
    { type: 'choice', q: 'The boy is old ___ to go to school now.', options: ['enough', 'too', 'so'], answer: 0, explain: '“年龄足够大，可以上学了”，用 形容词 + enough to。' }
  ]
},

/* ================= 九年级 ================= */
{
  id: 'g-adv-concession', title: '让步状语从句 although / though / even if', short: '让步状语从句', module: 'syntax', grade: 9, freq: 2,
  prereqs: ['g-adv-reason'],
  tip: '常考连词辨析：although / though 表示“虽然”，even if / even though 表示“即使”；陷阱是 although 和 but 不能在同一句里同时出现。',
  learn: [
    { h: 'although / though：虽然', html: `<p class="ex">Although he is very old, he still works hard.<span class="zh">虽然他年纪很大了，但他仍然努力工作。</span></p>
      <p class="ex">Though it was raining, we went on playing.<span class="zh">虽然在下雨，我们还是继续玩。</span></p>
      <p class="warn">中文说“虽然……但是……”，英语里 although / though 和 but <b>只能用一个</b>。</p>
      <p class="ex">He is young, but he knows a lot.<span class="zh">他年纪小，但懂得很多。（只用 but 也对）</span></p>
      <p>不过 although 可以和 <b>still</b>、<b>yet</b> 搭配：<span class="en">Although he is old, he still works hard.</span></p>
      <div class="rhyme">although 和 but，<br>见了面就要分开走。</div>` },
    { h: 'even if / even though：即使', html: `<p>语气更强，表示“即使、纵然”。even if 从句表示将来时，也遵循<b>主将从现</b>。</p>
      <p class="ex">Even if it rains tomorrow, we will still go.<span class="zh">即使明天下雨，我们也照样去。</span></p>
      <p class="ex">I will never give up even if I fail many times.<span class="zh">即使失败很多次，我也绝不放弃。</span></p>` },
    { h: 'though 的小用法', html: `<p>though 还可以放在句末当副词，意思是“不过、可是”，前面加逗号：</p>
      <p class="ex">The film was long. It was very interesting, though.<span class="zh">电影很长，不过很有趣。</span></p>` },
    { h: 'although 和 however', html: `<ul>
      <li><b>although</b> 是连词，后面接一个句子，和主句连成一句。</li>
      <li><b>however</b> 是副词，意思是“然而”，常放句首并用<b>逗号</b>隔开，前面通常是另一个完整的句子。</li></ul>
      <p class="ex">The question was very hard. However, Tom worked it out.<span class="zh">这道题很难。然而汤姆把它做出来了。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '___ it was raining, we went on playing football.', options: ['Though', 'Because', 'If'], answer: 0, explain: '“虽然在下雨，我们还是继续踢球”，前后意思相反，是让步关系，用 though（= although，虽然）。because 表原因，if 表条件，都不合句意。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['Although it was late, but he kept working.', 'Although it was late, he kept working.', 'Because it was late, but he kept working.'], answer: 1, explain: 'although 不能和 but 同时使用；because 也不能和 but 搭配。' },
    { type: 'choice', q: 'Although he is over seventy, he ___ goes jogging every morning.', options: ['still', 'but', 'so'], answer: 0, explain: 'although 不能和 but 连用，但可以和 still（仍然）、yet 搭配：“虽然七十多岁了，他仍然每天早上慢跑”。' },
    { type: 'choice', q: 'She went on working ___ she was very tired.', options: ['even though', 'so that', 'because'], answer: 0, explain: 'even though 意思是“即使、尽管”，语气比 although 更强：“尽管很累，她还是继续工作”。' },
    { type: 'fill', q: 'Even if it ___ (rain) tomorrow, we will still have the sports meeting.', answer: ['rains'], explain: 'even if 从句遵循主将从现，用一般现在时 rains。' },
    { type: 'fill', q: 'The trip was long. It was very interesting, ___.（填一个词，意思是“不过”）', answer: ['though'], explain: 'though 可以放在句末当副词，前面加逗号，意思是“不过、可是”。although 没有这种用法。' },
    { type: 'choice', q: 'It was very cold outside. ___, the children were still playing in the snow.', options: ['However', 'Although', 'Because'], answer: 0, explain: '前面是一个完整的句子，空格后有逗号，要用副词 however（然而）。although 是连词，要和另一个分句连在同一句里，不能单独用逗号隔开。' }
  ],
  tests: [
    { type: 'choice', q: '___ he is very old, he still works hard every day.', options: ['Although', 'Because', 'Unless'], answer: 0, explain: '“虽然年纪大，仍然努力工作”，表示让步，用 although。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['Though the bag is heavy, but she carries it.', 'Though the bag is heavy, she carries it.', 'Though the bag is heavy, so she carries it.'], answer: 1, explain: 'though 不能和 but 或 so 在同一句里同时使用。' },
    { type: 'choice', q: 'I will never give up ___ I fail ten times.', options: ['even if', 'because', 'so that'], answer: 0, explain: '“即使失败十次也不放弃”，用 even if。' },
    { type: 'fill', q: '同义句：He is young, but he knows a lot.<br>→ ___ he is young, he knows a lot.（填一个词，首字母大写）', answer: ['Although', 'Though'], explain: 'but 表转折，换成 although / though 引导让步状语从句，去掉 but。' },
    { type: 'choice', q: 'The maths problem was very hard. ___, Tom worked it out by himself.', options: ['However', 'Although', 'Because'], answer: 0, explain: '前面是一个完整的句子，后面用逗号隔开，要用副词 however（然而）。' },
    { type: 'fill', q: 'Even if it ___ (snow) tomorrow, we will go to school on time.', answer: ['snows'], explain: 'even if 从句遵循主将从现，用一般现在时 snows。' },
    { type: 'choice', q: 'He still went to school ___ he had a bad cold.', options: ['though', 'because', 'so'], answer: 0, explain: '“虽然感冒得厉害，他仍然去上学”，表示让步，用 though。' },
    { type: 'fill', q: '改错：Although he is rich, but he is not happy.<br>（这句话多了一个词，写出可以删去的那个词）', answer: ['but', 'although', 'Although'], explain: 'although 和 but 不能同时用，删去其中一个：Although he is rich, he is not happy. 或 He is rich, but he is not happy.' },
    { type: 'choice', q: 'Although it was very late, he ___ kept working.', options: ['still', 'but', 'so'], answer: 0, explain: 'although 可以和 still 搭配，不能和 but、so 搭配。' },
    { type: 'fill', q: 'Though the girl is only ten, she ___ speaks three languages.（从 still / but 中选一个填空）', answer: ['still'], explain: 'though 不能和 but 同时用，但可以和 still 搭配，表示“仍然”。' },
    { type: 'choice', q: 'You should be kind to others ___ they are not kind to you.', options: ['even if', 'because', 'so that'], answer: 0, explain: '“即使别人对你不友好，你也应该友善待人”，用 even if（即使）。' },
    { type: 'choice', q: "Even if he ___ me, I won't go with him.", options: ['asks', 'will ask', 'asked'], answer: 0, explain: '主句是将来时（won\'t go），even if 从句用一般现在时表示将来，用 asks。' },
    { type: 'choice', q: 'I liked the film. It was a bit long, ___.', options: ['though', 'although', 'because'], answer: 0, explain: 'though 可以放在句末当副词，意思是“不过”；although 只能做连词，不能放句末。' },
    { type: 'fill', q: 'The food was a little expensive. It was delicious, ___.（填一个词）', answer: ['though'], explain: '句末的 though 意思是“不过”：饭菜有点贵，不过很好吃。' },
    { type: 'choice', q: 'He tried his best. ___, he failed the exam.', options: ['However', 'Although', 'Because'], answer: 0, explain: '前面是一个完整的句子，后面用逗号隔开，用副词 however（然而）。' },
    { type: 'fill', q: 'Although it rained heavily, we went out.<br>→ It rained heavily. ___, we went out.（填一个词，首字母大写）', answer: ['However'], explain: '拆成两个句子后，连词 although 要换成副词 however，后面加逗号。' }
  ]
},

{
  id: 'g-attributive', title: '定语从句 who / which / that', short: '定语从句', module: 'syntax', grade: 9, freq: 3,
  prereqs: ['g-sentence-elements', 'g-pronoun'],
  tip: '高频考点：根据先行词是人还是物选 who / which / that；“只能用 that”的几种情况和从句谓语与先行词的一致最容易出错。',
  learn: [
    { h: '什么是定语从句', html: `<p>用一个句子来修饰前面的名词，这个句子就是定语从句。被修饰的名词叫<b>先行词</b>，连接的词叫<b>关系代词</b>。</p>
      <p class="ex">The girl who is singing is my sister.<span class="zh">正在唱歌的那个女孩是我妹妹。</span></p>
      <p>先行词是 the girl，定语从句是 who is singing，翻译时放在名词前面：“正在唱歌的女孩”。</p>` },
    { h: '怎么选关系代词', html: `<table class="tbl"><tr><th>先行词</th><th>关系代词</th><th>例句</th></tr>
      <tr><td>人</td><td>who / that</td><td>I like teachers who are kind.</td></tr>
      <tr><td>物</td><td>which / that</td><td>This is the book which I bought yesterday.</td></tr></table>
      <div class="rhyme">人用 who，物用 which，<br>that 人物都能用。</div>
      <p>关系代词在从句里做<b>宾语</b>时可以省略：</p>
      <p class="ex">This is the book I bought yesterday.<span class="zh">这是我昨天买的书。（省略了 which / that）</span></p>` },
    { h: '只能用 that 的情况', html: `<ul>
      <li>先行词被<b>最高级</b>、<b>序数词</b>修饰：<span class="en">This is the best film that I have ever seen.</span></li>
      <li>先行词被 <b>the only, the very, all, every, no</b> 修饰</li>
      <li>先行词是 <b>all, everything, anything, nothing, something</b> 等不定代词：<span class="en">Is there anything that I can do for you?</span></li>
      <li>先行词<b>既有人又有物</b>：<span class="en">I know the man and his dog that are walking in the park.</span></li></ul>` },
    { h: '易错点', html: `<ul>
      <li>从句的谓语要和<b>先行词</b>保持一致：<span class="en">I have a friend who <b>likes</b> football.</span>（friend 是单数）</li>
      <li>关系代词本身就是从句的一部分，不要再重复代词：<span class="en">This is the book which I bought it.</span> ✗（多了 it）</li>
      <li>不能用 what 引导定语从句：<span class="en">the book what I bought</span> ✗</li></ul>` }
  ],
  examples: [
    { type: 'fill', q: 'The girl who is singing is my sister.<br>这句话中被定语从句修饰的先行词是 the ___。（填一个词）', answer: ['girl'], explain: 'who is singing 是定语从句，修饰前面的名词 the girl，所以先行词是 girl。翻译时把从句放在名词前面：“正在唱歌的女孩”。' },
    { type: 'choice', q: 'I like teachers ___ are kind to students.', options: ['who', 'which', 'what'], answer: 0, explain: '先行词 teachers 是人，关系代词用 who（也可以用 that）；which 只指物；what 不能引导定语从句。' },
    { type: 'choice', q: 'This is the book ___ I bought yesterday.', options: ['which', 'who', 'what'], answer: 0, explain: '先行词 the book 是物，关系代词用 which（也可以用 that）。' },
    { type: 'choice', q: '下面哪句中括号里的关系代词可以省略？', options: ['This is the pen (that) I lost yesterday.', 'The girl (who) is singing is my sister.', 'The dog (which) runs fast is mine.'], answer: 0, explain: '关系代词在从句中做宾语时可以省略。第一句 I lost the pen，that 做 lost 的宾语，可以省；后两句的 who、which 在从句里做主语，不能省。' },
    { type: 'choice', q: 'This is the best film ___ I have ever seen.', options: ['that', 'which', 'who'], answer: 0, explain: '先行词被最高级 best 修饰，只能用 that。' },
    { type: 'choice', q: 'He is the only person ___ knows the secret.', options: ['that', 'which', 'what'], answer: 0, explain: '先行词被 the only 修饰，只能用 that；which 不能指人，what 不能引导定语从句。' },
    { type: 'choice', q: 'All ___ you need to do is to listen carefully.', options: ['that', 'which', 'what'], answer: 0, explain: '先行词是不定代词 all（指事情），关系代词只能用 that。' },
    { type: 'choice', q: 'They talked about the people and places ___ they had visited.', options: ['that', 'who', 'which'], answer: 0, explain: '先行词既有人（the people）又有物（places），只能用 that。' },
    { type: 'fill', q: 'I have a friend who ___ playing football.（like，用一般现在时）', answer: ['likes'], explain: '从句谓语和先行词 a friend 一致，单数，用 likes。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['This is the book which I bought it.', 'This is the book which I bought.', 'This is the book what I bought.'], answer: 1, explain: 'which 已经代替了 the book，在从句里做 bought 的宾语，后面不能再加 it；what 不能引导定语从句。' },
    { type: 'choice', q: 'The cake ___ my mother made for me was delicious.', options: ['that', 'what', 'who'], answer: 0, explain: '前面有先行词 the cake（物），关系代词用 that 或 which。what 本身就含有“……的东西”的意思，前面不能再有先行词，所以不能引导定语从句；who 只指人。' }
  ],
  tests: [
    { type: 'choice', q: 'The girl ___ is singing under the tree is my sister.', options: ['who', 'which', 'whose'], answer: 0, explain: '先行词 the girl 是人，在从句中做主语，用 who。' },
    { type: 'choice', q: 'This is the new bike ___ my father bought for me yesterday.', options: ['which', 'who', 'what'], answer: 0, explain: '先行词 bike 是物，用 which；what 不能引导定语从句。' },
    { type: 'choice', q: 'This is the first English film ___ I have seen.', options: ['that', 'which', 'who'], answer: 0, explain: '先行词被序数词 first 修饰，只能用 that。' },
    { type: 'fill', q: 'Mr. Li is a teacher ___ is always kind and patient.（填 who 或 which）', answer: ['who', 'that'], explain: '先行词 a teacher 是人，用 who（也可以用 that）。' },
    { type: 'choice', q: 'Is there anything ___ I can do for you?', options: ['that', 'which', 'what'], answer: 0, explain: '先行词是不定代词 anything，只能用 that。' },
    { type: 'choice', q: 'Look at the boy and his dog ___ are running on the grass.', options: ['that', 'who', 'which'], answer: 0, explain: '先行词既有人（the boy）又有物（his dog），只能用 that。' },
    { type: 'fill', q: 'The man who ___ next to us is a famous writer.（live，用一般现在时）', answer: ['lives'], explain: '从句谓语和先行词 the man 一致，单数，用 lives。' },
    { type: 'choice', q: 'The man who lives next door is a doctor.<br>句中的先行词是：', options: ['the man', 'next door', 'a doctor'], answer: 0, explain: '定语从句 who lives next door 修饰前面的 the man，the man 就是先行词。' },
    { type: 'choice', q: 'I have read the book that you lent me.<br>句中的定语从句是：', options: ['that you lent me', 'I have read', 'the book'], answer: 0, explain: '由关系代词 that 引出、修饰 the book 的部分 that you lent me 是定语从句。' },
    { type: 'choice', q: 'The boy ___ won the race is my classmate.', options: ['who', 'which', 'what'], answer: 0, explain: '先行词 the boy 是人，在从句中做主语，用 who。' },
    { type: 'fill', q: 'The bike ___ is under the tree is mine.（填 who 或 which）', answer: ['which', 'that'], explain: '先行词 the bike 是物，用 which（也可以用 that）。' },
    { type: 'fill', q: 'The film we saw last night was very moving.<br>补全省略的关系代词：The film ___ we saw last night ...（填 which 或 who）', answer: ['which', 'that'], explain: 'the film 是物，在从句中做 saw 的宾语，用 which / that，做宾语时可以省略。' },
    { type: 'choice', q: '下面哪句中的关系代词不能省略？', options: ['The boy who helped me is Tom.', 'The boy who I helped is Tom.', 'The book that I read is good.'], answer: 0, explain: '第一句 who 在从句里做主语（who helped me），不能省略；后两句的关系代词做宾语，可以省略。' },
    { type: 'fill', q: 'This is the most interesting story ___ I have ever heard.（填一个词）', answer: ['that'], explain: '先行词被最高级 the most interesting 修饰，只能用 that。' },
    { type: 'choice', q: 'This is the very book ___ I am looking for.', options: ['that', 'which', 'who'], answer: 0, explain: '先行词被 the very（正是那个）修饰，只能用 that。' },
    { type: 'fill', q: 'Every word ___ he said was true.（填 that 或 which）', answer: ['that'], explain: '先行词被 every 修饰，只能用 that。' },
    { type: 'choice', q: "I'll tell you everything ___ I know.", options: ['that', 'which', 'what'], answer: 0, explain: '先行词是不定代词 everything，只能用 that。' },
    { type: 'fill', q: 'He wrote a story about a girl and her cat ___ lived in an old house.（填一个词）', answer: ['that'], explain: '先行词既有人（a girl）又有物（her cat），只能用 that。' },
    { type: 'choice', q: 'The students who ___ in Class 3 are good at sports.', options: ['are', 'is', 'am'], answer: 0, explain: '从句谓语和先行词 the students 一致，复数，用 are。' },
    { type: 'fill', q: 'My cousin is a girl who ___ (enjoy) reading.', answer: ['enjoys'], explain: '从句谓语和先行词 a girl 一致，单数，一般现在时用 enjoys。' },
    { type: 'fill', q: '改错：The shoes which I bought them yesterday are too small.<br>（写出多余的一个词）', answer: ['them'], explain: 'which 已经代替 the shoes 做 bought 的宾语，从句里不能再重复代词 them。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['The girl who she is talking to Tom is my sister.', 'The girl who is talking to Tom is my sister.', 'The girl is talking to Tom is my sister.'], answer: 1, explain: 'who 已经在从句中做主语，不能再加 she；第三句缺少关系代词，一句话出现两个谓语。' },
    { type: 'choice', q: 'This is the house ___ my grandfather built.', options: ['that', 'what', 'who'], answer: 0, explain: '先行词 the house 是物，用 that（或 which）；what 不能引导定语从句，who 只指人。' }
  ]
},

{
  id: 'g-past-future', title: '过去将来时', short: '过去将来时', module: 'tense', grade: 9, freq: 1,
  prereqs: ['g-future', 'g-past-simple'],
  tip: '主要出现在宾语从句里：主句是过去时，从句的将来要变成 would / was going to；单独考的不多，但写作转述别人的话时常用。',
  learn: [
    { h: '什么是过去将来时', html: `<p>站在<b>过去某个时间</b>看“将要发生”的事。</p>
      <table class="tbl"><tr><th>一般将来时</th><th>过去将来时</th></tr>
      <tr><td>will + 动词原形</td><td><b>would</b> + 动词原形</td></tr>
      <tr><td>am / is / are going to + 动词原形</td><td><b>was / were going to</b> + 动词原形</td></tr>
      <tr><td>There will be</td><td>There <b>would</b> be</td></tr></table>` },
    { h: '最常用：宾语从句里', html: `<p>主句是 said, told, thought, knew, asked 等过去时，从句说的是“将来”，就用过去将来时。</p>
      <p class="ex">He said he would visit his grandparents the next day.<span class="zh">他说他第二天要去看望祖父母。</span></p>
      <p class="ex">I thought it was going to rain.<span class="zh">我以为要下雨了。</span></p>
      <p class="ex">She didn't know if there would be a test the next week.<span class="zh">她不知道下周是否会有考试。</span></p>` },
    { h: '时间词也要变', html: `<p>转述别人的话时，时间状语常跟着变：</p>
      <p class="small">tomorrow → the next day / the following day　next week → the next week / the following week　tonight → that night</p>
      <p class="ex">Tom said he would help me.<span class="zh">汤姆说他会帮我。（原话：I will help you.）</span></p>
      <div class="rhyme">主句一过去，will 变 would，<br>is going to 变成 was going to。</div>` }
  ],
  examples: [
    { type: 'choice', q: 'He said he ___ visit the museum the next day.', options: ['would', 'will', 'is going to'], answer: 0, explain: '主句 said 是过去时，从句的将来用过去将来时 would。' },
    { type: 'choice', q: 'I knew my best friend ___ to another city soon, so I felt sad.', options: ['would move', 'will move', 'moves'], answer: 0, explain: '过去将来时最常用在宾语从句里：主句 knew 是过去时，从句说的是站在当时看“将要”发生的事，要用 would + 动词原形，不能用 will。said, told, thought, asked 后面也一样。' },
    { type: 'fill', q: 'The students told me they ___ going to have a picnic that weekend.（填 be 动词）', answer: ['were'], explain: '主句 told 是过去时，从句的“将要”用过去将来时 was / were going to；主语 they 是复数，用 were。' },
    { type: 'choice', q: 'The radio said there ___ heavy rain the next day.', options: ['would be', 'will be', 'would have'], answer: 0, explain: '主句 said 是过去时，从句说的是从过去看的“将来”；There will be 的过去将来时是 There would be。There be 句型不能用 have。' },
    { type: 'fill', q: 'Tom said, "I will help you."<br>→ Tom said that he ___ help me.（填一个词）', answer: ['would'], explain: '转述后主句是过去时，will 变成 would。' },
    { type: 'fill', q: 'He said, "I will go fishing tomorrow."<br>→ He said he would go fishing the ___ day.（填一个词）', answer: ['next', 'following'], explain: '转述别人的话时，时间词也要变：tomorrow 变成 the next day（或 the following day）。' }
  ],
  tests: [
    { type: 'choice', q: 'My sister told me she ___ to Shanghai the following week.', options: ['would go', 'will go', 'goes'], answer: 0, explain: '主句 told 是过去时，从过去看将来，用 would go。' },
    { type: 'fill', q: 'Lucy said she ___ (visit) her aunt the next day.（用 would）', answer: ['would visit', "'d visit"], explain: '主句 said 是过去时，用过去将来时 would + 动词原形。' },
    { type: 'choice', q: "I didn't know if it ___ rain the next day.", options: ['would', 'will', 'is going to'], answer: 0, explain: '主句 didn\'t know 是过去时，the next day 是从过去看的将来，用 would。' },
    { type: 'choice', q: 'They were sure that there ___ a football match the next week.', options: ['would be', 'would have', 'will have'], answer: 0, explain: 'There be 的过去将来时是 there would be，不能用 have。' },
    { type: 'fill', q: 'Tom said, "I am going to play basketball."<br>→ Tom said that he ___ going to play basketball.（填一个词）', answer: ['was'], explain: '主句是过去时，am going to 变成 was going to。' },
    { type: 'choice', q: 'Last night my father promised that he ___ me a new bike.', options: ['would buy', 'will buy', 'buys'], answer: 0, explain: 'promised 是过去时，“将要买”是从过去看的将来，用 would buy。' },
    { type: 'choice', q: '—Why did you take an umbrella this morning?<br>—I thought it ___ rain.', options: ['was going to', 'is going to', 'will'], answer: 0, explain: 'thought 是过去时，从过去看将来，用 was going to。' },
    { type: 'fill', q: 'Nobody knew there ___ a test the next morning.（填两个词）', answer: ['would be'], explain: '主句 knew 是过去时，There be 的过去将来时是 there would be。' },
    { type: 'choice', q: 'She said, "I will call you tonight."<br>→（几天后转述）She said she would call me ___.', options: ['that night', 'tonight', 'last night'], answer: 0, explain: '转述时 tonight 要变成 that night；last night 表示过去，和 would call 矛盾。' },
    { type: 'fill', q: 'Mike said, "I will visit you next week."<br>→ Mike said he would visit us the following ___.（填一个词）', answer: ['week'], explain: '转述时 next week 变成 the next week / the following week。' },
    { type: 'fill', q: 'Mary said, "I will be there on time."<br>→ Mary said she ___ be there on time.（填一个词）', answer: ['would'], explain: '转述后主句 said 是过去时，will 变成 would。' },
    { type: 'choice', q: 'My teacher asked me whether I ___ take part in the speech competition.', options: ['would', 'will', 'am going to'], answer: 0, explain: '主句 asked 是过去时，从句说的是当时的将来，用过去将来时 would。' },
    { type: 'choice', q: 'We were sure that they ___ going to win the game.', options: ['were', 'are', 'will'], answer: 0, explain: '主句 were sure 是过去时，are going to 变成 were going to；主语 they 是复数，用 were。' }
  ]
},

{
  id: 'g-past-perfect', title: '过去完成时', short: '过去完成时', module: 'tense', grade: 9, freq: 1,
  prereqs: ['g-present-perfect'],
  tip: '考点集中在 by the end of last year / by then 和“过去的过去”；记住结构 had + 过去分词，看到两个过去动作先后发生时要想到它。',
  learn: [
    { h: '什么是过去完成时', html: `<p>结构：<b>had + 过去分词</b>（所有人称都用 had）</p>
      <p>表示在<b>过去某个时间或动作之前</b>已经完成的动作，也就是“过去的过去”。</p>
      <p class="ex">When I got to the station, the train had left.<span class="zh">我到车站时，火车已经开走了。</span></p>
      <p>先发生的“火车开走”用过去完成时，后发生的“我到车站”用一般过去时。</p>` },
    { h: '标志词', html: `<ul>
      <li><b>by the end of last year / term</b>（到去年/上学期末为止）</li>
      <li><b>by + 过去时间</b>：by then, by 8 o'clock yesterday</li>
      <li><b>by the time / when / before + 一般过去时的从句</b></li>
      <li>宾语从句：主句是 said, told 等，从句说的是更早的事</li></ul>
      <p class="ex">By the end of last term, we had learned 1,500 English words.<span class="zh">到上学期末，我们已经学了 1500 个英语单词。</span></p>
      <p class="ex">She said she had finished her homework.<span class="zh">她说她已经写完作业了。</span></p>` },
    { h: '和现在完成时对比', html: `<table class="tbl"><tr><th></th><th>现在完成时</th><th>过去完成时</th></tr>
      <tr><td>结构</td><td>have / has + 过去分词</td><td>had + 过去分词</td></tr>
      <tr><td>参照点</td><td>现在</td><td>过去某个时间</td></tr>
      <tr><td>例子</td><td>I have finished it.</td><td>I had finished it by then.</td></tr></table>
      <div class="rhyme">两个动作都在过去，<br>先发生的用 had done。</div>` },
    { h: '对比：when 的两种情况', html: `<p class="ex">When I got there, the film had begun.<span class="zh">我到的时候电影已经开始了。（先开始，我后到）</span></p>
      <p class="ex">When I got there, the film began.<span class="zh">我一到电影就开始了。（几乎同时）</span></p>` }
  ],
  examples: [
    { type: 'fill', q: 'When Dad got to the airport, the plane ___ already ___ (take) off. He had to take a later flight.（两空合填，中间用空格隔开）', answer: ['had taken'], explain: '“飞机起飞”发生在“爸爸到达”（过去）之前，句中有 already，强调到达时飞机已经起飞了，是过去的过去，用过去完成时 had + 过去分词；所有人称都用 had，take 的过去分词是 taken。' },
    { type: 'choice', q: 'When I got to the cinema, the film ___. I missed the beginning.', options: ['had begun', 'has begun', 'begins'], answer: 0, explain: '电影开始在“我到”之前，是过去的过去，用 had begun。' },
    { type: 'choice', q: 'By the end of last term, we ___ 2,000 English words.', options: ['had learned', 'have learned', 'learn'], answer: 0, explain: 'by the end of last term 是“到过去某时为止”，用过去完成时。' },
    { type: 'choice', q: 'By then, the children ___ asleep.', options: ['had fallen', 'have fallen', 'fall'], answer: 0, explain: 'by then（到那时为止）指过去某个时间，在那之前已经完成的动作用过去完成时 had fallen。' },
    { type: 'choice', q: 'By the time we got to the cinema, the film ___.', options: ['had started', 'has started', 'starts'], answer: 0, explain: 'by the time + 一般过去时的从句（got），主句用过去完成时：我们到的时候电影已经开始了。' },
    { type: 'fill', q: 'He told me he ___ (be) to Xiamen twice.', answer: ['had been', "'d been"], explain: '主句 told 是过去时，“去过厦门两次”发生在他说话之前，宾语从句用过去完成时 had been。' },
    { type: 'choice', q: 'I ___ my homework now, so I can watch TV.', options: ['have finished', 'had finished', 'finish'], answer: 0, explain: '参照点是“现在”（now, can watch），用现在完成时 have finished；过去完成时的参照点是过去某个时间。' },
    { type: 'choice', q: '下面哪句表示“我到的时候，电影已经开始了”？', options: ['When I got there, the film had begun.', 'When I got there, the film began.', 'When I get there, the film begins.'], answer: 0, explain: '电影先开始、我后到，先发生的用 had begun。第二句表示“我一到电影就开始”，两个动作几乎同时；第三句是现在时。' }
  ],
  tests: [
    { type: 'choice', q: 'By the end of last year, they ___ more than 500 trees.', options: ['had planted', 'have planted', 'plant'], answer: 0, explain: 'by the end of last year 是过去完成时的标志。' },
    { type: 'choice', q: "When we got to the station, the train ___. We had to wait for the next one.", options: ['had left', 'has left', 'leaves'], answer: 0, explain: '火车开走在我们到达之前，是过去的过去，用 had left。' },
    { type: 'fill', q: 'She said she ___ her homework before dinner.（finish，用过去完成时）', answer: ['had finished', "'d finished"], explain: '主句 said 是过去时，写完作业发生在说话之前，用 had finished。' },
    { type: 'choice', q: "I ___ the film before, so I didn't want to see it again last night.", options: ['had seen', 'have seen', 'see'], answer: 0, explain: '“看过”发生在昨晚之前，是过去的过去，用 had seen。' },
    { type: 'fill', q: 'Before I came to Fuzhou, I had never ___ to a big city.（be）', answer: ['been'], explain: '过去完成时 had + 过去分词，be 的过去分词是 been。' },
    { type: 'choice', q: '—Did you see Tom at the party?<br>—No. When I arrived, he ___ home.', options: ['had gone', 'has gone', 'goes'], answer: 0, explain: '他回家发生在我到达之前，是过去的过去，用 had gone。' },
    { type: 'choice', q: "By 8 o'clock yesterday evening, I ___ my homework.", options: ['had finished', 'have finished', 'will finish'], answer: 0, explain: 'by + 过去时间点，用过去完成时。' },
    { type: 'choice', q: 'My parents ___ already ___ breakfast when I got up.', options: ['had; had', 'have; had', 'has; had'], answer: 0, explain: '过去完成时所有人称都用 had + 过去分词；吃早饭发生在我起床之前，用 had already had。' },
    { type: 'fill', q: 'By the end of last month, we ___ (read) three English stories.', answer: ['had read', "'d read"], explain: 'by the end of last month 是过去完成时的标志，read 的过去分词还是 read。' },
    { type: 'choice', q: 'By 2020, my uncle ___ in Beijing for ten years.', options: ['had worked', 'has worked', 'works'], answer: 0, explain: 'by + 过去的时间（2020 年），表示到那时为止，用过去完成时。' },
    { type: 'fill', q: 'Before she came to China, she ___ (learn) Chinese for two years.', answer: ['had learned', 'had learnt', "'d learned", "'d learnt"], explain: 'before + 一般过去时的从句，学中文发生在来中国之前，用过去完成时。' },
    { type: 'choice', q: 'By the time I woke up, my mother ___ to work.', options: ['had gone', 'has gone', 'goes'], answer: 0, explain: 'by the time + 一般过去时（woke up），主句用过去完成时 had gone。' },
    { type: 'choice', q: 'She told me that she ___ the book twice.', options: ['had read', 'has read', 'reads'], answer: 0, explain: '主句 told 是过去时，读书发生在说话之前，宾语从句用过去完成时。' },
    { type: 'choice', q: 'So far, we ___ 1,000 English words this term.', options: ['have learned', 'had learned', 'learn'], answer: 0, explain: 'so far（到目前为止）参照点是现在，用现在完成时。' },
    { type: 'fill', q: 'Look! I ___ (finish) the picture. Do you like it?', answer: ['have finished', "'ve finished"], explain: '参照点是现在（Look! Do you like it?），用现在完成时 have finished，不用 had finished。' },
    { type: 'choice', q: "When I arrived at the party, Lucy ___. So I didn't see her.", options: ['had left', 'left', 'leaves'], answer: 0, explain: '我没见到她，说明她在我到之前就离开了，先发生的用 had left。' },
    { type: 'choice', q: 'When the bell rang, the students ___ into the classroom at once.', options: ['ran', 'had run', 'run'], answer: 0, explain: '铃一响学生马上跑进教室，两个动作几乎同时，按先后顺序都用一般过去时，不用过去完成时。' }
  ]
},

{
  id: 'g-tense-review', title: '时态综合辨析（动词填空思路）', short: '时态综合', module: 'tense', grade: 9, freq: 3,
  prereqs: ['g-present-perfect', 'g-past-cont', 'g-future', 'g-passive'],
  tip: '短文填空、动词填空每年必有：先找时间标志词定时态，再看主语定单复数，最后看主动还是被动；漏掉三单 s 和被动语态是最常见的失分点。',
  learn: [
    { h: '动词填空四步法', html: `<ol>
      <li><b>找标志词</b>：yesterday, now, since, tomorrow…… 先定时态。</li>
      <li><b>看主语</b>：三单还是复数？决定 is/are、has/have、加不加 s。</li>
      <li><b>判语态</b>：主语是动作的承受者吗？是就用被动 be + 过去分词。</li>
      <li><b>查从句</b>：if / when 从句主将从现？宾语从句主句是过去时吗？</li></ol>
      <div class="rhyme">一找标志二看主，<br>三判主被四查从。</div>` },
    { h: '八种时态一张表', html: `<table class="tbl"><tr><th>时态</th><th>结构</th><th>常见标志词</th></tr>
      <tr><td>一般现在时</td><td>do / does</td><td>always, usually, often, every day</td></tr>
      <tr><td>现在进行时</td><td>am / is / are doing</td><td>now, Look!, Listen!</td></tr>
      <tr><td>一般过去时</td><td>did</td><td>yesterday, last week, ... ago, just now</td></tr>
      <tr><td>过去进行时</td><td>was / were doing</td><td>at this time yesterday, at 8 last night, when / while</td></tr>
      <tr><td>一般将来时</td><td>will do / be going to do</td><td>tomorrow, next week, soon, in two days</td></tr>
      <tr><td>现在完成时</td><td>have / has done</td><td>already, yet, ever, never, for, since, so far</td></tr>
      <tr><td>过去完成时</td><td>had done</td><td>by the end of last year, by then</td></tr>
      <tr><td>过去将来时</td><td>would do</td><td>宾语从句，主句是过去时</td></tr></table>` },
    { h: '最容易混的几组', html: `<ul>
      <li><b>一般过去时 vs 现在完成时</b>：有具体过去时间（last week, in 2020）用过去时；强调对现在的影响或持续到现在用完成时。</li>
      <li><b>一般过去时 vs 过去进行时</b>：一个动作正在进行时，另一个短暂动作发生 —— 长的用进行，短的用过去。</li>
      <li><b>主将从现</b>：if / when / as soon as / until 从句里用现在时代替将来时。</li></ul>
      <p class="ex">I was having dinner when he called me.<span class="zh">他给我打电话时我正在吃饭。</span></p>
      <p class="ex">I saw the film last week. I have seen it twice.<span class="zh">我上周看了这部电影。我已经看过两遍了。</span></p>` },
    { h: '常见失分点', html: `<ul>
      <li>三单忘加 s：<span class="en">My father often <b>reads</b> newspapers.</span></li>
      <li>被动忘加 be：<span class="en">The bridge <b>was built</b> in 2010.</span></li>
      <li>did / didn't 后动词没还原：<span class="en">He didn't <b>go</b>.</span></li>
      <li>不规则动词过去式、过去分词拼错：bought, taught, written, chosen</li></ul>
      <p class="warn">做完一定把整句读一遍：时间对吗？主语对得上吗？是“被”做的吗？</p>` }
  ],
  examples: [
    { type: 'choice', q: 'Mr. Chen ___ in this school for twenty years so far.<br>第一步：先找出决定时态的标志词，再选答案。', options: ['has taught', 'taught', 'teaches'], answer: 0, explain: '第一步找标志词：句中的 so far（到目前为止）和 for twenty years 是现在完成时的标志，所以用 has taught。不先找标志词，很容易凭感觉选成一般过去时。' },
    { type: 'fill', q: 'My parents ___ (have) lunch at home every day.', answer: ['have'], explain: '第二步看主语：every day 定为一般现在时后，再看主语 my parents 是复数，动词用原形 have，不能用 has。主语决定 is / are、has / have、加不加 s。' },
    { type: 'fill', q: 'My father often ___ (read) newspapers after dinner.', answer: ['reads'], explain: '第一步找标志词：often 表示经常性动作，用一般现在时；第二步看主语：my father 是三单，动词加 s，用 reads。三单忘加 s 是最常见的失分点。' },
    { type: 'fill', q: "Be quiet! The baby ___ (sleep) now.", answer: ['is sleeping'], explain: 'now 和 Be quiet! 表示此刻正在发生，用现在进行时 am / is / are + doing；the baby 是单数，用 is sleeping。' },
    { type: 'fill', q: 'I ___ (meet) an old friend in the street just now.', answer: ['met'], explain: 'just now（刚才）是一般过去时的标志；meet 的过去式是不规则的 met。注意 just now 不能和现在完成时连用。' },
    { type: 'fill', q: "He didn't ___ (go) to school yesterday because he was ill.", answer: ['go'], explain: 'yesterday 是一般过去时的标志，但前面已经有 didn\'t，过去的意思由 did 表示，后面的动词要还原成原形 go。' },
    { type: 'fill', q: 'I ___ (have) dinner when he called me last night.', answer: ['was having'], explain: '一个动作正在进行时，另一个短暂动作发生：“打电话”是短动作，用一般过去时；“吃饭”是正在进行的长动作，用过去进行时 was having。' },
    { type: 'choice', q: 'I ___ the film last week. I ___ it twice so far.', options: ['saw; have seen', 'have seen; saw', 'saw; saw'], answer: 0, explain: 'last week 是具体的过去时间，用一般过去时 saw；so far（到目前为止）强调到现在的次数，用现在完成时 have seen。' },
    { type: 'fill', q: 'My uncle ___ (work) in this hospital since 2015.', answer: ['has worked', 'has been working'], explain: 'since 2015 表示从过去持续到现在，用现在完成时；my uncle 是三单，用 has worked。' },
    { type: 'fill', q: 'By the end of last year, we ___ (plant) 300 trees in our school.', answer: ['had planted', "'d planted"], explain: 'by the end of last year 是过去完成时的标志，用 had + 过去分词。' },
    { type: 'fill', q: 'She said she ___ (visit) us the next day.', answer: ['would visit', "'d visit", 'was going to visit'], explain: '第四步查从句：这是宾语从句，主句 said 是过去时，从句说的是从过去看的将来，用过去将来时 would visit。' },
    { type: 'fill', q: 'The new library ___ (build) next year.', answer: ['will be built', 'is going to be built'], explain: 'next year 表将来；图书馆是“被建”，用将来时的被动 will be built。' },
    { type: 'fill', q: 'This bridge ___ (build) in 2010.', answer: ['was built'], explain: '第三步判语态：桥是“被建造”的，用被动语态；in 2010 是过去时间，用 was built。被动语态不能漏掉 be。' },
    { type: 'fill', q: 'I will call you as soon as I ___ (get) home.', answer: ['get'], explain: '第四步查从句：as soon as 引导时间状语从句，主句是将来时，从句用一般现在时表示将来（主将从现），用 get。' },
    { type: 'fill', q: 'Mr. Wang ___ (teach) us English last year.', answer: ['taught'], explain: 'last year 用一般过去时；teach 是不规则动词，过去式是 taught，不能写成 teached。' }
  ],
  tests: [
    { type: 'fill', q: 'Look! The children ___ (dance) under the tree.', answer: ['are dancing'], explain: 'Look! 表示正在发生，children 是复数，用 are dancing。' },
    { type: 'fill', q: 'My father ___ (live) in Fuzhou since 2010.', answer: ['has lived', 'has been living'], explain: 'since 2010 是现在完成时的标志，my father 是三单，用 has lived。' },
    { type: 'choice', q: "—Where's your mother?<br>—She ___ to the supermarket. She'll be back soon.", options: ['has gone', 'has been', 'goes'], answer: 0, explain: '人不在这里、还没回来，用 has gone to。' },
    { type: 'choice', q: 'I ___ a shower when the phone rang last night.', options: ['was taking', 'am taking', 'take'], answer: 0, explain: '电话响时（过去）我正在洗澡，长动作用过去进行时 was taking。' },
    { type: 'choice', q: 'The school sports meeting ___ next Friday.', options: ['will be held', 'will hold', 'was held'], answer: 0, explain: 'next Friday 表将来；运动会是“被举行”，用将来时的被动 will be held。' },
    { type: 'fill', q: 'If it ___ (not rain) tomorrow, we will go fishing.', answer: ["doesn't rain", 'does not rain'], explain: '主将从现：if 从句用一般现在时，it 是三单，否定用 doesn\'t rain。' },
    { type: 'choice', q: '—Have you seen the new film?<br>—Yes, I ___ it with my friends last week.', options: ['saw', 'have seen', 'see'], answer: 0, explain: 'last week 是具体的过去时间，用一般过去时 saw。' },
    { type: 'fill', q: 'Lucy usually ___ (go) to school by bus.', answer: ['goes'], explain: 'usually 表示习惯，用一般现在时；Lucy 是三单，go 加 es，用 goes。' },
    { type: 'choice', q: 'The sun ___ in the east every morning.', options: ['rises', 'rose', 'is rising'], answer: 0, explain: '客观事实和每天发生的事用一般现在时，the sun 是三单，用 rises。' },
    { type: 'choice', q: 'Listen! Someone ___ in the next room.', options: ['is singing', 'sings', 'sang'], answer: 0, explain: 'Listen! 表示此刻正在发生，用现在进行时 is singing。' },
    { type: 'fill', q: 'We ___ (visit) the Great Wall two years ago.', answer: ['visited'], explain: 'two years ago 是一般过去时的标志，用 visited。' },
    { type: 'fill', q: "At 8 o'clock last night, I ___ (watch) TV with my family.", answer: ['was watching'], explain: 'at 8 o\'clock last night 是过去某一时刻，表示当时正在做的事，用过去进行时 was watching。' },
    { type: 'fill', q: 'We ___ (have) a sports meeting next week.', answer: ['will have', "'ll have", 'shall have', 'are going to have', 'are having'], explain: 'next week 是一般将来时的标志，用 will have 或 are going to have。' },
    { type: 'choice', q: 'Look at the clouds. It ___ rain soon.', options: ['is going to', 'was going to', 'rained'], answer: 0, explain: 'soon 表示将来，看到乌云判断马上要下雨，用 be going to；从现在看将来，不用 was。' },
    { type: 'fill', q: 'By the time I got home, my parents ___ (eat) dinner.', answer: ['had eaten', "'d eaten"], explain: 'by the time + 一般过去时的从句，主句用过去完成时 had eaten。' },
    { type: 'choice', q: 'By the end of last term, Tom ___ two English novels.', options: ['had read', 'has read', 'reads'], answer: 0, explain: 'by the end of last term 是过去完成时的标志。' },
    { type: 'fill', q: 'He told me he ___ (go) to Beijing the next week.', answer: ['would go', "'d go", 'was going to go', 'was going'], explain: '宾语从句，主句 told 是过去时，the next week 是从过去看的将来，用过去将来时 would go。' },
    { type: 'choice', q: 'We all thought it ___ a fine day the next day.', options: ['would be', 'will be', 'is'], answer: 0, explain: '主句 thought 是过去时，the next day 是从过去看的将来，用 would be。' },
    { type: 'fill', q: 'English ___ (speak) in many countries.', answer: ['is spoken'], explain: '英语是“被说”的，用被动语态；说的是现在的事实，用一般现在时被动 is spoken。' },
    { type: 'choice', q: 'The window ___ by Tom yesterday.', options: ['was broken', 'broke', 'is broken'], answer: 0, explain: '有 by Tom，窗户是“被打破”的，用被动；yesterday 用过去时，所以是 was broken。' },
    { type: 'fill', q: 'Did your sister ___ (buy) a new dress last Sunday?', answer: ['buy'], explain: '一般疑问句由 did 提问，后面的动词还原成原形 buy。' },
    { type: 'choice', q: "She didn't ___ her homework last night.", options: ['do', 'did', 'does'], answer: 0, explain: "didn't 后面动词用原形 do。" },
    { type: 'choice', q: 'I will wait here until he ___ back.', options: ['comes', 'will come', 'came'], answer: 0, explain: '主将从现：until 从句用一般现在时 comes。' },
    { type: 'fill', q: 'When she ___ (grow) up, she will be a doctor.', answer: ['grows'], explain: '主将从现：when 引导时间状语从句，用一般现在时，she 是三单，用 grows。' },
    { type: 'fill', q: 'I ___ (be) to Shanghai three times so far.', answer: ['have been', "'ve been"], explain: 'so far 和次数是现在完成时的标志，“去过”用 have been to。' },
    { type: 'choice', q: 'He ___ to Japan in 2019.', options: ['went', 'has gone', 'has been'], answer: 0, explain: 'in 2019 是具体的过去时间，用一般过去时 went；现在完成时不能和具体过去时间连用。' },
    { type: 'fill', q: 'While I was walking in the park, it suddenly ___ (begin) to rain.', answer: ['began'], explain: '长动作“散步”用过去进行时，短动作“突然下雨”用一般过去时；begin 的过去式是 began。' },
    { type: 'fill', q: 'Have you ___ (write) to your pen friend yet?', answer: ['written'], explain: 'have + 过去分词构成现在完成时；write 的过去分词是 written，注意双写 t。' },
    { type: 'fill', q: 'Which present have you ___ (choose) for your mother?', answer: ['chosen'], explain: '现在完成时用过去分词，choose 的过去分词是 chosen（过去式是 chose）。' },
    { type: 'choice', q: 'We ___ a school trip to Wuyi Mountain in two days.<br>（先找标志词）', options: ['will have', 'had', 'have had'], answer: 0, explain: '标志词 in two days（两天后）表示将来，用一般将来时 will have。' },
    { type: 'choice', q: 'The students in our class ___ English every morning.', options: ['read', 'reads', 'is reading'], answer: 0, explain: '看主语：真正的主语是 the students（复数），in our class 只是修饰语；every morning 用一般现在时，所以用原形 read。' },
    { type: 'fill', q: 'Each of us ___ (have) a new English dictionary now.', answer: ['has'], explain: '看主语：each of us 做主语看作单数，一般现在时用 has。' }
  ]
}

);
