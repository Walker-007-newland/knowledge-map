// 题型技能 B 组：完形填空、短文填空、阅读基础（细节题、主旨题）
// 所有短文均为原创。
KG.nodes.push(

/* ================= 完形填空 ================= */
{
  id: 's-cloze', title: '完形填空', short: '完形填空', module: 'skill', grade: 8, freq: 3,
  prereqs: ['g-conj', 'v-high-freq-verbs'],
  tip: '完形填空考的是“读懂上下文再选词”，最大的陷阱是只看空格前后几个词就选，不管全文的意思和逻辑（具体题量分值以当年《考试说明》为准）。',
  learn: [
    { h: '题型说明', html: `
      <p>完形填空是一篇 200 词左右的短文，挖掉十几个空（本应用每篇练 10 个），每空给三个选项（福建卷一般是<b>三选一</b>），选出最合适的一个。</p>
      <p>它不是单纯的词汇题，而是“<b>阅读理解 + 词汇 + 语法</b>”的综合题。常考的有这几类：</p>
      <table class="tbl"><tr><th>考点</th><th>怎么考</th><th>例子</th></tr>
      <tr><td>词汇辨析</td><td>三个同类词（动词/名词/形容词），根据上下文选意思对的</td><td>happy / angry / tired</td></tr>
      <tr><td>连词与逻辑</td><td>前后是转折、因果还是并列</td><td>but / so / because</td></tr>
      <tr><td>固定搭配</td><td>动词短语、介词搭配</td><td>share ... with, turn ... into</td></tr>
      <tr><td>语法</td><td>句型、从句引导词、时态</td><td>too ... to, where / when</td></tr></table>
      <p class="warn">完形的文章多是<b>记叙文</b>：讲一件小事，最后点出一个道理。抓住“人物的心情变化”和“故事的道理”，很多空就有方向了。</p>` },
    { h: '解题步骤', html: `<ol>
      <li><b>先跳过空格读全文</b>（1–2 分钟）：弄清谁、什么事、结果怎样、作者想说什么。首句一般不挖空，是全文的“钥匙”。</li>
      <li><b>逐空分析</b>：先看三个选项是什么类型（同类词？连词？），再回到句子里找<b>线索</b>——线索可能在空格前，也可能在后面几句。</li>
      <li><b>用线索定答案</b>：词汇题看语境和感情色彩；连词题看前后关系；搭配题看空格后的介词或结构。</li>
      <li><b>拿不准先跳过</b>，做完后面的再回来，后文常常会“泄露”答案。</li>
      <li><b>回读全文</b>：把答案放回去从头读一遍，意思通顺、前后一致才算完成。</li></ol>
      <div class="rhyme">首句不空是钥匙，跳过空格读全文；<br>选项先看什么类，线索前后都要寻；<br>转折因果看逻辑，搭配介词要记清；<br>做完回读再检查，前后通顺才放心。</div>` },
    { h: '常见陷阱', html: `<ul>
      <li><b>只看空格附近</b>：例如 “He felt ____.” 单看这一句 happy、sad 都对，必须看前文发生了什么事。</li>
      <li><b>凭感觉选“熟词”</b>：三个选项里认识哪个就选哪个，结果意思不合。要把每个选项代进去读。</li>
      <li><b>忽略搭配</b>：share ... <b>with</b>、borrow ... <b>from</b>、lend ... <b>to</b>，介词能直接排除选项。</li>
      <li><b>连词只凭语感</b>：先用中文说出前后两句的关系（但是？所以？因为？），再选词。</li></ul>
      <p class="warn">“原词复现”是好帮手：答案常在文章其他地方出现过原词或近义词，比如前面说 “It was raining”，后面就会有 umbrella、wet 这类词呼应。</p>` },
    { h: '完整示范', html: `
      <div class="passage"><p>Mike's grandma lives in a small village. Last weekend Mike went to <span class="blank">(1)</span>____ her. She was very <span class="blank">(2)</span>____ to see him. They made dumplings together, <span class="blank">(3)</span>____ Mike's dumplings were too big. Grandma laughed and said, “It doesn't matter. Practice makes perfect.” Mike <span class="blank">(4)</span>____ a wonderful day there.</p></div>
      <p>(1) visit / leave / call &nbsp; (2) angry / happy / tired &nbsp; (3) and / but / so &nbsp; (4) had / took / made</p>
      <p><b>第一步 读全文</b>：Mike 周末去村里看奶奶，一起包饺子，饺子包大了奶奶笑着鼓励他，很开心的一天。</p>
      <p><b>(1)</b> 三个都是动词。首句说奶奶住在村子里，Mike “去”是为了<b>看望</b>她 → <b>visit</b>。leave（离开）、call（打电话）和 went to 不配。</p>
      <p><b>(2)</b> 形容词，表心情。奶奶见到孙子，后面又 laughed（笑了），感情是正面的 → <b>happy</b>。</p>
      <p><b>(3)</b> 连词。“一起包饺子”和“Mike 包得太大”之间是转折，后面奶奶说 It doesn't matter（没关系）也说明出了点小问题 → <b>but</b>。</p>
      <p><b>(4)</b> 固定搭配 <b>have a wonderful day</b>（过了美好的一天），过去时用 had。take、make 不和 day 这样搭配。</p>
      <p class="ex">Mike had a wonderful day there.<span class="zh">Mike 在那里度过了美好的一天。</span></p>` }
  ],
  passages: {
    e1: { title: '例题短文', html: `<p>Amy is a new student in our class. On her first day, she sat alone and didn't <span class="blank">(1)</span>____ to anyone. I knew how she felt, <span class="blank">(2)</span>____ I had been a new student once too. At lunch, I asked her to sit with my friends and me. Soon we <span class="blank">(3)</span>____ good friends.</p>` },
    p1: { title: '完形填空：阅读短文，从三个选项中选出最佳答案', html: `
      <p>Last Saturday, Lin Tao planned to play basketball with his friends. But when he woke up, it was raining <span class="blank">(1)</span>____. He felt a little <span class="blank">(2)</span>____. Later, he went downstairs to buy some bread.</p>
      <p>On the way, he saw an old man standing at the bus stop without an umbrella. The man looked cold and <span class="blank">(3)</span>____. “Can I help you, sir?” Lin Tao asked. The old man said he wanted to visit his grandson in the hospital, <span class="blank">(4)</span>____ he didn't know which bus to take.</p>
      <p>Lin Tao checked the map on his phone and found the right bus. He also <span class="blank">(5)</span>____ his umbrella with the man. When the bus came, he helped the man get on and even rode with him <span class="blank">(6)</span>____ the old man didn't know where to get off.</p>
      <p>At the hospital, the old man's grandson thanked Lin Tao again and again. “You are a kind boy,” he said. “Many people are too <span class="blank">(7)</span>____ to notice someone like my grandpa.”</p>
      <p>Lin Tao got home at noon, wet but happy. His mother asked <span class="blank">(8)</span>____ he had been. After hearing the story, she smiled and said, “You didn't play basketball today, but you did something more <span class="blank">(9)</span>____.”</p>
      <p>That night, Lin Tao wrote in his diary: “Rainy days are not always bad. Helping others can <span class="blank">(10)</span>____ a grey day into a sunny one.”</p>` },
    e2: { title: '例题短文二', html: `<p>Tom wanted to join the school band, but he didn't have a guitar. So he <span class="blank">(1)</span>____ one from his uncle and practiced every evening. On the day of the school show, Tom felt very <span class="blank">(2)</span>____. His hands were shaking and his heart was beating fast. “What if I make a mistake?” he thought. But <span class="blank">(3)</span>____ he began to play, he forgot all his worries. After the show, everyone clapped. The next day, Tom gave the <span class="blank">(4)</span>____ back to his uncle and said, “Thank you! Practice really made me <span class="blank">(5)</span>____.”</p>` },
    p2: { title: '完形填空 B：阅读短文，从三个选项中选出最佳答案', html: `
      <p>Every spring, there is a kite festival in a big park in Lily's city. This year, Lily and her grandpa decided to <span class="blank">(1)</span>____ a kite by themselves. They spent a whole week making it. Grandpa cut the bamboo, and Lily painted a big red fish on the paper. It was the most <span class="blank">(2)</span>____ kite she had ever seen.</p>
      <p>On the day of the festival, Lily ran across the grass and the red fish rose high into the sky. Many people stopped to look at it and took photos. Lily felt very <span class="blank">(3)</span>____.</p>
      <p><span class="blank">(4)</span>____ a few minutes later, a strong wind came and the string broke. The kite fell into a tall tree. Lily tried to get it down, but the tree was too <span class="blank">(5)</span>____ for her to climb. When Grandpa finally got the kite down, one of its wings was broken. Lily wanted to <span class="blank">(6)</span>____. “I'll never make a kite again,” she cried.</p>
      <p>Grandpa smiled. “A broken kite can be <span class="blank">(7)</span>____,” he said. “So can a broken heart.” That evening, they fixed the wing together. Grandpa also showed her how to tie a stronger string <span class="blank">(8)</span>____ it wouldn't break again.</p>
      <p>The next weekend, they went back to the park, <span class="blank">(9)</span>____ the red fish flew even higher than before. Lily learned an important <span class="blank">(10)</span>____ from her grandpa: when something goes wrong, don't give up — try to fix it.</p>` },
    p3: { title: '完形填空 C：阅读短文，从三个选项中选出最佳答案', html: `
      <p>Wang Hao sits behind me in class. He is good at maths, but he is quiet and seldom talks <span class="blank">(1)</span>____ others.</p>
      <p>Last month, I was ill and missed a week of school. When I came back, I found the maths lessons very <span class="blank">(2)</span>____. I couldn't understand anything the teacher said.</p>
      <p>Then Wang Hao came to my desk. “You can <span class="blank">(3)</span>____ my notes,” he said. “I'll <span class="blank">(4)</span>____ them to you until Friday.” His notes were very clear, and he even drew pictures to explain the hard problems. With his help, I <span class="blank">(5)</span>____ up with the class in two weeks.</p>
      <p>I wanted to thank him, <span class="blank">(6)</span>____ I didn't know how. Later I noticed that Wang Hao was not good at English. His test results were always <span class="blank">(7)</span>____. English is my best subject, <span class="blank">(8)</span>____ I offered to help him.</p>
      <p>Now we often study together in the school library, <span class="blank">(9)</span>____ we help each other with maths and English. I've learned that “a friend in <span class="blank">(10)</span>____ is a friend indeed”. Helping each other has made us both better.</p>` },
    e3: { title: '例题短文三', html: `<p>Last Sunday, Lucy cooked dinner for her family for the first time. At first she was <span class="blank">(1)</span>____, because she had never cooked before and she was afraid to <span class="blank">(2)</span>____ mistakes. She followed the recipe step by step. When her parents tasted the fish, they smiled and said it was <span class="blank">(3)</span>____. Lucy's worry soon turned into joy. Everyone ate a lot. After dinner, they were all too <span class="blank">(4)</span>____ to eat any fruit.</p>` }
  },
  examples: [
    { type: 'choice', passage: 'e1', q: '(1)', options: ['talk', 'laugh', 'write'], answer: 0,
      explain: '线索是 sat alone（一个人坐着）和后面的 to anyone。新同学害羞，不和任何人<b>说话</b>：talk to sb。laugh 要用 laugh at，write to anyone 和“坐着”的场景不合。' },
    { type: 'choice', passage: 'e1', q: '(2)', options: ['because', 'but', 'or'], answer: 0,
      explain: '连词题不要凭语感，<b>先用中文说出前后两句的关系</b>：“我理解她的感受”——“我以前也当过新生”，后一句说的是原因，所以是因果关系：<b>因为</b>我也当过新生，所以懂她。but 表转折，or 表选择，都说不通。' },
    { type: 'choice', passage: 'e1', q: '(3)', options: ['became', 'missed', 'forgot'], answer: 0,
      explain: '前面“我”邀请她和朋友们一起吃午饭，结果自然是 Soon we <b>became</b> good friends（很快成了好朋友）。' },
    { type: 'choice', passage: 'e2', q: '(1)', options: ['borrowed', 'lent', 'gave'], answer: 0,
      explain: '首句是钥匙：Tom 没有吉他。空格后有 <b>from</b> his uncle，固定搭配 <b>borrow sth from sb</b>（向某人借）。lend 要搭配 to（借给别人），gave 也不和 from 连用。介词一出现，另外两个就能直接排除。' },
    { type: 'choice', passage: 'e2', q: '(2)', options: ['nervous', 'excited', 'bored'], answer: 0,
      explain: '只看本句，nervous、excited 好像都行。<b>拿不准就往后读</b>：手在发抖、心跳很快，还在想“要是出错怎么办？”——这是担心害怕，所以是<b>紧张的</b>。excited 是兴奋，不会担心出错；bored（无聊）更不合。后文“泄露”了答案。' },
    { type: 'choice', passage: 'e2', q: '(3)', options: ['when', 'although', 'unless'], answer: 0,
      explain: '考语法（从句引导词）。“<b>当</b>他开始弹奏时，他忘掉了所有担心”，表示时间用 <b>when</b>。前面已经有 But 表转折，再用 although 就重复了；unless（除非）意思不通。' },
    { type: 'choice', passage: 'e2', q: '(4)', options: ['guitar', 'ticket', 'money'], answer: 0,
      explain: '<b>原词复现</b>：第一、二句说吉他是向叔叔借的，第二天把<b>吉他</b>还给叔叔，前后呼应。文中从没提过票和钱。' },
    { type: 'choice', passage: 'e2', q: '(5)', options: ['confident', 'lazy', 'careless'], answer: 0,
      explain: '记叙文结尾点出道理：Tom 从紧张到忘掉担心，是练习让他变得<b>自信</b>。lazy（懒惰）、careless（粗心）都是负面词，和“谢谢你”的感情色彩不符。' },
    { type: 'choice', passage: 'e3', q: '(1)', options: ['worried', 'proud', 'bored'], answer: 0,
      explain: '抓<b>人物心情的变化</b>：她第一次做饭、怕出错，所以一开始是<b>担心的</b>；后文 Lucy\'s worry soon turned into joy（担心变成了喜悦）把这条心情线说得很清楚：担心 → 开心。proud 要等成功以后才有，bored 和“怕出错”不合。' },
    { type: 'choice', passage: 'e3', q: '(2)', options: ['make', 'do', 'take'], answer: 0,
      explain: '逐空分析<b>先看选项是什么类</b>：make、do、take 都是常用动词，意思都很宽，说明这一空考的不是词义而是<b>搭配</b>。和 mistakes 固定搭配的是 <b>make mistakes</b>（犯错误），do、take 都不和 mistake 连用。' },
    { type: 'choice', passage: 'e3', q: '(3)', options: ['delicious', 'terrible', 'salty'], answer: 0,
      explain: '<b>用线索定答案，看感情色彩</b>：父母尝了鱼以后 smiled（笑了），后面又说她的担心变成了喜悦，评价一定是正面的 → <b>delicious</b>（美味的）。terrible（糟糕的）、salty（太咸的）都是负面评价，和“笑着说”矛盾。' },
    { type: 'choice', passage: 'e3', q: '(4)', options: ['full', 'fine', 'free'], answer: 0,
      explain: '小心<b>凭感觉选熟词</b>：fine 最眼熟，但要把每个选项代进去读——“大家都吃了很多，饭后太<b>饱</b>了，吃不下水果”（too ... to ...），只有 <b>full</b> 说得通。too fine to eat、too free to eat 都没有意义。' },
    { type: 'choice', q: '拿到一篇完形填空，下面哪种做法最合理？', options: ['先跳过空格把全文读一遍，首句不挖空，是理解全文的钥匙', '从第 1 空开始逐个做，不用管后面的内容', '只看空格前后两三个词，就能选出答案'], answer: 0,
      explain: '解题第一步是<b>跳过空格读全文</b>，弄清谁、什么事、结果怎样。只看空格附近是最常见的陷阱，比如 He felt ____. 单看这句，happy 和 sad 都说得通。' },
    { type: 'choice', q: '做完 10 个空以后，最后一步应该做什么？', options: ['把答案放回原文从头读一遍，看意思是否通顺、前后是否一致', '马上交卷，回读只是浪费时间', '把拿不准的空都改成自己最熟悉的词'], answer: 0,
      explain: '最后一步是<b>回读全文</b>。比如前面填了 happy，后面却写“他哭了一整晚”，回读就能发现矛盾。凭“熟词”改答案恰好是常见陷阱。' }
  ],
  tests: [
    { type: 'choice', passage: 'p1', q: '(1)', options: ['heavily', 'luckily', 'clearly'], answer: 0,
      explain: '固定说法 rain heavily（雨下得很大）。上文说他本来要去打篮球，雨大才会打不成，后面又有 umbrella、wet 呼应。' },
    { type: 'choice', passage: 'p1', q: '(2)', options: ['disappointed', 'excited', 'proud'], answer: 0,
      explain: '计划好的篮球因为大雨泡汤了，心情是<b>失望的</b>。excited（兴奋）和 proud（骄傲）都不合这个情景。' },
    { type: 'choice', passage: 'p1', q: '(3)', options: ['worried', 'relaxed', 'proud'], answer: 0,
      explain: '老人没带伞站在雨里，又要去医院看孙子、不知道坐哪路车，所以看上去又冷又<b>着急</b>。relaxed（放松的）正好相反。' },
    { type: 'choice', passage: 'p1', q: '(4)', options: ['but', 'so', 'or'], answer: 0,
      explain: '“他想去医院看孙子”和“他不知道坐哪路车”是转折关系，用 <b>but</b>。' },
    { type: 'choice', passage: 'p1', q: '(5)', options: ['shared', 'borrowed', 'sold'], answer: 0,
      explain: '固定搭配 <b>share sth with sb</b>（和某人共用某物）。空格后的 with 是关键：borrow 要搭配 from，sold（卖）也不合情理。' },
    { type: 'choice', passage: 'p1', q: '(6)', options: ['because', 'although', 'until'], answer: 0,
      explain: '他陪老人一起坐车的原因是“老人不知道在哪一站下车”，前后是因果关系，用 <b>because</b>。although（虽然）表转折，until（直到）表时间，放进去都说不通。' },
    { type: 'choice', passage: 'p1', q: '(7)', options: ['busy', 'free', 'kind'], answer: 0,
      explain: '<b>too ... to ...</b> 表示“太……而不能……”。很多人太<b>忙</b>了，注意不到像爷爷这样的人。free（有空的）、kind（善良的）放进去意思都反了。' },
    { type: 'choice', passage: 'p1', q: '(8)', options: ['where', 'when', 'which'], answer: 0,
      explain: '他淋湿了中午才回家，妈妈问他“去了<b>哪里</b>”：asked where he had been（宾语从句）。后面 After hearing the story 说明他讲了自己去的地方和经历。' },
    { type: 'choice', passage: 'p1', q: '(9)', options: ['meaningful', 'boring', 'dangerous'], answer: 0,
      explain: '妈妈听完故事笑了，是在表扬他：你今天没打球，但做了一件更<b>有意义</b>的事。boring（无聊）、dangerous（危险）都是负面的。' },
    { type: 'choice', passage: 'p1', q: '(10)', options: ['turn', 'keep', 'leave'], answer: 0,
      explain: '固定搭配 <b>turn ... into ...</b>（把……变成……）。空格后的 into 是线索：帮助别人能把阴天“变成”晴天，呼应前一句 Rainy days are not always bad。' },
    { type: 'choice', passage: 'p2', q: '(1)', options: ['make', 'borrow', 'sell'], answer: 0,
      explain: '空格后有 by themselves（自己动手），下一句 They spent a whole week <b>making</b> it 原词复现，说明是自己<b>做</b>风筝。borrow、sell 都和“自己花一周做”对不上。' },
    { type: 'choice', passage: 'p2', q: '(2)', options: ['beautiful', 'boring', 'terrible'], answer: 0,
      explain: '爷爷削竹子、Lily 画大红鱼，花了一周精心制作；后文还说很多人停下来看、拍照。这是她见过的最<b>漂亮的</b>风筝。boring、terrible 感情色彩不对。' },
    { type: 'choice', passage: 'p2', q: '(3)', options: ['proud', 'sad', 'afraid'], answer: 0,
      explain: '心情变化：风筝飞得很高，很多人围观拍照，Lily 感到很<b>自豪</b>。sad、afraid 要到后面风筝断线才可能出现，这里还是高兴的时候。' },
    { type: 'choice', passage: 'p2', q: '(4)', options: ['But', 'So', 'Or'], answer: 0,
      explain: '先用中文说关系：“大家都在看，她很自豪”——<b>但是</b>几分钟后线断了。好事变坏事，是转折，用 <b>But</b>。' },
    { type: 'choice', passage: 'p2', q: '(5)', options: ['tall', 'low', 'safe'], answer: 0,
      explain: '<b>too ... to ...</b>（太……而不能……）。树太<b>高</b>了，她爬不上去。前一句 a tall tree 原词复现。low、safe 放进去意思都反了。' },
    { type: 'choice', passage: 'p2', q: '(6)', options: ['give up', 'look up', 'get up'], answer: 0,
      explain: '后一句她哭着说“我再也不做风筝了”，说明她想<b>放弃</b>：give up。最后一句 don\'t give up 也原词复现。look up（抬头看/查阅）、get up（起床）不合语境。' },
    { type: 'choice', passage: 'p2', q: '(7)', options: ['fixed', 'sold', 'lost'], answer: 0,
      explain: '后文 That evening, they <b>fixed</b> the wing together 泄露了答案：坏了的风筝可以<b>修好</b>，伤心也可以“修好”。这一空先跳过，读到后文就清楚了。' },
    { type: 'choice', passage: 'p2', q: '(8)', options: ['so that', 'because', 'although'], answer: 0,
      explain: '绑一根更结实的线，<b>目的</b>是让它不再断，用 <b>so that</b>（以便）引导目的状语从句。because 表原因，although 表让步，都说不通。' },
    { type: 'choice', passage: 'p2', q: '(9)', options: ['and', 'but', 'or'], answer: 0,
      explain: '“他们回到公园”和“红鱼飞得比以前更高”是顺接，前后没有转折也没有选择，用 <b>and</b>。' },
    { type: 'choice', passage: 'p2', q: '(10)', options: ['lesson', 'game', 'problem'], answer: 0,
      explain: '记叙文结尾点出道理：learn a <b>lesson</b>（学到一个道理/教训），冒号后面就是道理的内容。game、problem 都接不上冒号后的话。' },
    { type: 'choice', passage: 'p3', q: '(1)', options: ['with', 'on', 'for'], answer: 0,
      explain: '同一句里的 quiet（安静）是线索：他很少<b>和</b>别人说话，<b>talk with sb</b>。talk on、talk for 都不能表示“和某人交谈”。' },
    { type: 'choice', passage: 'p3', q: '(2)', options: ['difficult', 'easy', 'funny'], answer: 0,
      explain: '只看本句选不出来，要往后看：I couldn\'t understand anything（什么都听不懂）。缺了一周课，数学课变得很<b>难</b>。' },
    { type: 'choice', passage: 'p3', q: '(3)', options: ['borrow', 'lend', 'sell'], answer: 0,
      explain: '笔记是王浩的，“你可以<b>借</b>我的笔记”，主语是 you，用 <b>borrow</b>（借入）。lend 是“借出”，要说 I can lend you my notes；sell（卖）不合情理。' },
    { type: 'choice', passage: 'p3', q: '(4)', options: ['lend', 'return', 'borrow'], answer: 0,
      explain: '空格后有 <b>to</b> you，固定搭配 <b>lend sth to sb</b>（把东西借给某人）。笔记是王浩自己的，谈不上 return（归还）给“我”；borrow 要搭配 from。' },
    { type: 'choice', passage: 'p3', q: '(5)', options: ['caught', 'gave', 'looked'], answer: 0,
      explain: '固定搭配 <b>catch up with</b>（赶上）。有他帮忙，“我”两周就赶上了全班；讲的是过去的事，用过去式 caught。give up with、look up with 都不成立。' },
    { type: 'choice', passage: 'p3', q: '(6)', options: ['but', 'so', 'because'], answer: 0,
      explain: '“我想感谢他”和“不知道怎么谢”是转折关系，用 <b>but</b>。' },
    { type: 'choice', passage: 'p3', q: '(7)', options: ['low', 'high', 'perfect'], answer: 0,
      explain: '前一句说王浩英语不好（not good at English），所以考试成绩总是很<b>低</b>。high、perfect 和前文矛盾。' },
    { type: 'choice', passage: 'p3', q: '(8)', options: ['so', 'but', 'or'], answer: 0,
      explain: '“英语是我最好的科目”是原因，“我主动提出帮他”是结果，因果关系用 <b>so</b>。' },
    { type: 'choice', passage: 'p3', q: '(9)', options: ['where', 'when', 'which'], answer: 0,
      explain: '考语法：先行词 the school library 是<b>地点</b>，从句 we help each other ... 句子成分完整，缺地点状语，用 <b>where</b>。which 后面要缺主语或宾语，when 指时间。' },
    { type: 'choice', passage: 'p3', q: '(10)', options: ['need', 'time', 'class'], answer: 0,
      explain: '谚语 <b>A friend in need is a friend indeed.</b>（患难见真情）。“我”生病落下功课时王浩帮了“我”，正是“需要时出手的朋友”，这是全文的道理。' },
    { type: 'choice', q: '完形填空的文章多是记叙文。先读全文时，最应该抓住什么？', options: ['人物心情的变化和故事最后讲出的道理', '文章里一共有多少个生词', '每段第一个单词怎么拼写'], answer: 0,
      explain: '记叙文讲一件小事，最后点出一个道理。抓住<b>心情变化</b>和<b>道理</b>，形容词题和结尾题就有了方向。' },
    { type: 'choice', q: '某空的三个选项是 because / although / so，这一空主要考什么？做题时先做什么？', options: ['考前后两句的逻辑关系，先用中文说出是因果还是转折', '考固定搭配，先看空格后的介词', '考名词单复数，先看前面有没有 many'], answer: 0,
      explain: '逐空分析先看<b>选项是什么类</b>：三个都是连词，就是考逻辑关系。不要凭语感，先用中文说出“因为？但是？所以？”再选。' },
    { type: 'choice', q: '做到某一空实在拿不准，最好的做法是什么？', options: ['先跳过，做完后面再回来，后文常常有线索', '随便选一个，再也不回头看', '选三个选项里自己最熟悉的那个词'], answer: 0,
      explain: '<b>拿不准先跳过</b>：后文常常“泄露”答案，比如后面出现原词或说明了人物的心情。凭熟词选是常见陷阱。' },
    { type: 'choice', q: '某同学做完后回读，读到：“Tom was very <u>happy</u> that day. He <u>cried</u> all night.” 他应该怎么做？', options: ['发现前后矛盾，回到这两空结合上下文重新判断', '意思差不多就行，不用管', '把两空都改成最简单的词'], answer: 0,
      explain: '回读的目的就是检查<b>前后是否一致</b>：一整天很开心，晚上却哭了一整夜，说明至少有一空选错了，要回到原文找线索重新判断。' }
  ]
},

/* ================= 短文填空 ================= */
{
  id: 's-passage-fill', title: '短文填空（所给词/首字母，每空 1–2 词）', short: '短文填空', module: 'skill', grade: 9, freq: 3,
  prereqs: ['g-word-form', 'g-tense-review'],
  tip: '短文填空考的是“在语境里写出正确的词形”，最大的陷阱是意思对了却忘了变形（时态、复数、比较级、词性），还有拼写错误（具体题量分值以当年《考试说明》为准）。',
  learn: [
    { h: '题型说明', html: `
      <p>短文填空给一篇短文，挖掉若干空，每空填 <b>1–2 个词</b>。常见两种形式：</p>
      <table class="tbl"><tr><th>形式</th><th>样子</th><th>考什么</th></tr>
      <tr><td>用所给词的适当形式</td><td>Yesterday I ____ (go) to the park.</td><td>词形变化：went</td></tr>
      <tr><td>根据首字母提示</td><td>Please b____ your bag with you.</td><td>根据意思想出单词，再变形：bring</td></tr></table>
      <p>有的卷子两种混在一篇里，也可能出现“不给提示、根据上下文填词”的空。不管哪种，都是<b>先懂意思，再定形式，最后拼对</b>。</p>
      <p class="warn">要求 1–2 个词，所以 “more famous”“are playing”“to draw” 这样两个词的答案是可以的，但不要写三个词以上。</p>` },
    { h: '四步法', html: `<ol>
      <li><b>通读全文</b>：先不填，读懂大意，特别注意<b>时间词</b>（last year, now, every day），它决定时态。</li>
      <li><b>判断词性</b>：看空格在句子里做什么——缺谓语就填动词，冠词/形容词后填名词，名词前填形容词，修饰动词填副词。</li>
      <li><b>判断形式</b>：
        <table class="tbl"><tr><th>词性</th><th>要想的问题</th><th>例子</th></tr>
        <tr><td>名词</td><td>单数还是复数？前面有 two / many / some 吗？</td><td>leaf → leaves</td></tr>
        <tr><td>动词</td><td>什么时态？主动还是被动？三单？非谓语（to do / doing）？</td><td>make → is made</td></tr>
        <tr><td>形容词/副词</td><td>有 than、the、even、much 吗？要比较级还是最高级？</td><td>good → the best</td></tr>
        <tr><td>词性转换</td><td>给的是形容词但空格要副词？给的是动词但要名词？</td><td>careful → carefully</td></tr></table></li>
      <li><b>回读检查</b>：把答案放回句子读一遍，查时态是否和上下文一致、拼写是否正确、首字母是否对得上。</li></ol>
      <div class="rhyme">一读全文找时间，二看空格缺哪类；<br>三想形式变不变，单复时态比较级；<br>四把答案放回去，拼写首字母都核对。</div>` },
    { h: '常见陷阱', html: `<ul>
      <li><b>原形照抄</b>：所给词大多数都要变形，写原形之前先问自己“真的不用变吗？”。</li>
      <li><b>不规则变化</b>：leaf → leaves，child → children，spend → spent，good → better → best，要背熟。</li>
      <li><b>被动语态</b>：主语是“东西”时，常常要用 be + 过去分词：Tea is <b>made</b> by hand.</li>
      <li><b>首字母题想到了中文想不到英文</b>：先用中文说出空格意思，再找以那个字母开头、词性合适的词。</li>
      <li><b>时间单位的复数</b>：three hours、two weeks，数字大于一就要加 s。</li></ul>
      <p class="warn">拼写错一个字母就不得分！写完一定检查 -ly、双写（stopped、running）、去 e（making）这些细节。</p>` },
    { h: '完整示范', html: `
      <div class="passage"><p>My cousin Lily loves <span class="blank">(1)</span>____ (draw). Last month she <span class="blank">(2)</span>____ (win) first prize in a painting competition. Her painting shows two <span class="blank">(3)</span>____ (child) flying kites by the sea. Everyone says it is <span class="blank">(4)</span>____ (real) beautiful.</p></div>
      <p><b>(1)</b> loves 后面接动作 → love doing / love to do → <b>drawing</b>（写 to draw 也对）。</p>
      <p><b>(2)</b> 缺谓语动词；时间词 Last month → 一般过去时；win 是不规则动词 → <b>won</b>。</p>
      <p><b>(3)</b> two 后面的名词要用复数；child 是不规则变化 → <b>children</b>。</p>
      <p><b>(4)</b> 空格修饰形容词 beautiful，要用副词；real → <b>really</b>。</p>
      <p><b>回读</b>：My cousin Lily loves drawing. Last month she won first prize ... two children ... really beautiful. 时态一致，拼写正确。</p>
      <p class="ex">Everyone says it is really beautiful.<span class="zh">大家都说这幅画真的很美。</span></p>` }
  ],
  passages: {
    p1: { title: '短文填空 A：用括号内所给词的适当形式填空（每空 1–2 词）', html: `
      <p>My hometown, Anxi, is famous for its tea. Every spring, my grandparents get up early and go up the hills to pick tea <span class="blank">(1)</span>______ (leaf). Picking tea looks easy, but it is really hard work. My grandma says good tea is always <span class="blank">(2)</span>______ (make) by hand, not by machines.</p>
      <p>Last summer, I <span class="blank">(3)</span>______ (spend) two weeks with them and learned how to make tea. First, we put the fresh leaves in the sun. Then we turned them over again and again <span class="blank">(4)</span>______ (careful). It took us a whole day! In the evening, Grandpa made a cup of tea for me. I think it is the <span class="blank">(5)</span>______ (good) tea in the world.</p>
      <p>Now many young people are selling Anxi tea online. I hope my hometown will become even <span class="blank">(6)</span>______ (famous) in the future.</p>` },
    p2: { title: '短文填空 B：根据首字母提示填空（每空一词）', html: `
      <p><b>Clean-up Day</b></p>
      <p>Dear students,</p>
      <p>Our school will hold a Clean-up Day next Saturday. We will go to Sunshine Beach and pick up rubbish there. We will meet at the school <span class="blank">(7)</span> g______ at 8:00 a.m. and come back at 11:00 a.m., so the activity will last for three <span class="blank">(8)</span> h______. Please <span class="blank">(9)</span> b______ your own gloves and a bottle of water with you. Don't <span class="blank">(10)</span> f______ to wear a hat, because it may be sunny and hot.</p>
      <p>Let's work together to make our beach clean and beautiful!</p>
      <p>The Students' Union</p>` },
    p3: { title: '短文填空 C：用括号内所给词的适当形式填空（每空 1–2 词）', html: `
      <p>My name is Chen Hui and I live in Quanzhou. Every Sunday, my cousin <span class="blank">(1)</span>______ (go) to an old people's home near our school to help out. Last month, I started <span class="blank">(2)</span>______ (join) him.</p>
      <p>The old people there are very <span class="blank">(3)</span>______ (friend) and always smile at us. Many of them enjoy <span class="blank">(4)</span>______ (chat) with us about their past. Mr. Lin, an old man with white hair, used to be a <span class="blank">(5)</span>______ (teach). He is <span class="blank">(6)</span>______ (good) at Chinese chess than anyone else there.</p>
      <p>Last Sunday, he taught me how <span class="blank">(7)</span>______ (play) it, but I lost three <span class="blank">(8)</span>______ (game) in a row. We also had great fun <span class="blank">(9)</span>______ (make) dumplings with them that afternoon.</p>
      <p>Next Sunday, I <span class="blank">(10)</span>______ (visit) Mr. Lin again. Maybe I can win a game this time!</p>` },
    p4: { title: '短文填空 D：根据首字母提示或上下文填空（每空一词）', html: `
      <p><b>New Rules for the School Library</b></p>
      <p>From next Monday, the library will be open from 7:30 a.m. to 5:30 p.m. <span class="blank">(1)</span> e______ weekday. Students can borrow three books at a time and keep them for two <span class="blank">(2)</span> w______. Please <span class="blank">(3)</span> r______ the books on time.</p>
      <p>Please keep <span class="blank">(4)</span> q______ in the library. Don't eat or drink <span class="blank">(5)</span> ______ the reading room. Each student may use the computers for 30 <span class="blank">(6)</span> m______ at a time. If you lose a book, you <span class="blank">(7)</span> s______ pay for it.</p>
      <p>We hope the library will be a good place <span class="blank">(8)</span> ______ read and study.</p>` },
    e1: { title: '例题短文：用括号内所给词的适当形式填空', html: `<p>Last weekend my family went to Mount Wuyi. On the first day, we <span class="blank">(1)</span>______ (climb) the mountain for three hours. The view from the top was <span class="blank">(2)</span>______ (amaze). The next morning, we <span class="blank">(3)</span>______ (take) a bamboo raft down the Nine-Bend Stream.</p>` }
  },
  examples: [
    { type: 'fill', q: 'There are many tall ______ (build) in our city.（用所给词的适当形式）', answer: ['buildings'],
      explain: '判断词性：tall 是形容词，后面要名词 → building；判断形式：many 后面用复数 → <b>buildings</b>。' },
    { type: 'fill', q: 'Look! The kids ______ (play) football on the playground.（用所给词的适当形式，可填两个词）', answer: ['are playing'],
      explain: '句子缺谓语；Look! 提示动作正在发生 → 现在进行时；主语 the kids 是复数 → <b>are playing</b>（两个词）。' },
    { type: 'fill', q: 'I can\'t find my key. Can you help me l______ for it?（根据首字母提示）', answer: ['look'],
      explain: '意思是“帮我找钥匙”，后面有 for，固定搭配 look for（寻找）；help sb do 后用动词原形 → <b>look</b>。' },
    { type: 'fill', passage: 'e1', q: '(1) ______ (climb)', answer: ['climbed'],
      explain: '第一步<b>通读全文找时间词</b>：这一句本身没有时间词，但首句 Last weekend 已经定下全文讲的是过去的事，所以用一般过去时 → <b>climbed</b>。只看本句很容易写成原形 climb。' },
    { type: 'fill', passage: 'e1', q: '(2) ______ (amaze)', answer: ['amazing'],
      explain: '<b>判断词性</b>：was 后面作表语，要填形容词，给的却是动词 amaze（词性转换）。主语 the view 是“让人惊叹的”事物，用 -ing 形容词 → <b>amazing</b>；amazed 用来说人“感到惊叹”。' },
    { type: 'fill', passage: 'e1', q: '(3) ______ (take)', answer: ['took'],
      explain: 'The next morning 仍然是那次旅行中的过去时间，用过去式；take 是<b>不规则动词</b>：take → <b>took</b> → taken，不能写成 taked。' },
    { type: 'fill', q: 'It\'s raining outside. Don\'t forget to take your u______.（根据首字母提示填一个词）', answer: ['umbrella'],
      explain: '首字母题<b>先用中文说出空格的意思</b>：“外面在下雨，别忘了带你的____”——中文很快想到“伞”，再找 u 开头的英文 → <b>umbrella</b>（注意两个 l）。' },
    { type: 'fill', q: 'The children played ______ (happy) in the park.（用所给词的适当形式）', answer: ['happily'],
      explain: '空格修饰动词 played，要把形容词转成<b>副词</b>；happy 以“辅音 + y”结尾，变 y 为 i 再加 ly → <b>happily</b>。拼写陷阱：不要写成 happyly。' },
    { type: 'fill', q: 'My sister ______ (watch) TV for half an hour every evening.（用所给词的适当形式）', answer: ['watches'],
      explain: '第一步找时间词：every evening → 一般现在时；主语 my sister 是三单，watch 以 ch 结尾加 es → <b>watches</b>。' },
    { type: 'fill', q: 'This bridge ______ (build) in 2015.（用所给词的适当形式，可填两个词）', answer: ['was built'],
      explain: '主语 this bridge 是“被建造的”，要用被动语态 be + 过去分词；in 2015 是过去 → was；build 的过去分词是不规则的 built → <b>was built</b>（两个词）。' },
    { type: 'fill', q: 'Walking to school is ______ (healthy) than going by car.（用所给词的适当形式）', answer: ['healthier'],
      explain: '看到 than 就用比较级；healthy 以“辅音 + y”结尾，变 y 为 i 加 er → <b>healthier</b>。' },
    { type: 'fill', q: 'That was the ______ (bad) day of my life.（用所给词的适当形式）', answer: ['worst'],
      explain: '前面有 the，后面有 of my life（一生中），用最高级；bad 是不规则变化：bad → worse → <b>worst</b>。' },
    { type: 'fill', q: 'He gave a wonderful ______ (speak) at the meeting.（用所给词的适当形式）', answer: ['speech'],
      explain: '词性转换：a wonderful 后面要名词，给的却是动词 speak。“演讲”的名词是 <b>speech</b>，不要写成 speaking。' },
    { type: 'fill', q: 'Please stop ______ (run) in the hallway.（用所给词的适当形式）', answer: ['running'],
      explain: 'stop doing 表示“停止正在做的事”；run 是“辅音 + 元音 + 辅音”结尾的重读闭音节，要<b>双写 n</b> 再加 ing → <b>running</b>。' },
    { type: 'fill', q: 'Thank you for ______ (give) me a ride.（用所给词的适当形式）', answer: ['giving'],
      explain: '介词 for 后面接动名词；give 以不发音的 e 结尾，<b>去 e</b> 加 ing → <b>giving</b>。' },
    { type: 'fill', q: 'My parents want me ______ (learn) to swim this summer.（用所给词的适当形式，可填两个词）', answer: ['to learn'],
      explain: '非谓语：want sb <b>to do</b> sth（想让某人做某事）→ <b>to learn</b>，两个词。' },
    { type: 'fill', q: 'You should ______ (drink) more water every day.（用所给词的适当形式）', answer: ['drink'],
      explain: '不是所有空都要变形！情态动词 should 后面跟<b>动词原形</b> → <b>drink</b>。写之前先问自己“真的要变吗？”，判断后才写原形。' },
    { type: 'fill', q: 'The school trip lasted two ______ (day).（用所给词的适当形式）', answer: ['days'],
      explain: '时间单位前面的数字大于一，要用复数：two <b>days</b>。这种空最容易漏掉 s。' },
    { type: 'fill', q: 'I\'m hungry. Is there ______ to eat in the fridge?（不给提示，根据上下文填一个词）', answer: ['anything', 'something'],
      explain: '没有提示的空，先用中文说意思：“冰箱里有<b>什么</b>吃的吗？”疑问句里一般用 <b>anything</b>（期待肯定回答时也可用 something）。' },
    { type: 'choice', q: '某同学填完一句：Last Sunday my father <u>buy</u> a new bike for me.（所给词 buy）回读时应发现什么问题？', options: ['时间词 Last Sunday 要求过去时，应改为 bought', '句子没有问题，原形就对', '主语是三单，应改为 buys'], answer: 0,
      explain: '第四步<b>回读检查</b>：把答案放回去读，时间词 Last Sunday 说明是过去的事，buy 要变成不规则过去式 <b>bought</b>。只看主语改成 buys 也是错的。' }
  ],
  tests: [
    { type: 'fill', passage: 'p1', q: '(1) ______ (leaf)', answer: ['leaves'],
      explain: '采茶采的是很多片“茶叶”，用复数；leaf 的复数是不规则变化 f → v + es：<b>leaves</b>。后文 the fresh leaves 也出现了原词。' },
    { type: 'fill', passage: 'p1', q: '(2) ______ (make)', answer: ['made'],
      explain: '主语 good tea 是“被做出来的”，is ____ by hand 是被动语态 be + 过去分词：<b>made</b>。' },
    { type: 'fill', passage: 'p1', q: '(3) ______ (spend)', answer: ['spent'],
      explain: '时间词 Last summer → 一般过去时；spend 的过去式是不规则的 <b>spent</b>。' },
    { type: 'fill', passage: 'p1', q: '(4) ______ (careful)', answer: ['carefully'],
      explain: '空格修饰动词 turned（翻动），要用副词：careful → <b>carefully</b>（注意两个 l）。' },
    { type: 'fill', passage: 'p1', q: '(5) ______ (good)', answer: ['best'],
      explain: '前面有 the，后面有 in the world（在全世界范围内），用最高级：good → better → <b>best</b>。' },
    { type: 'fill', passage: 'p1', q: '(6) ______ (famous)（可填两个词）', answer: ['more famous'],
      explain: 'even 修饰比较级（更加……）；famous 是多音节词，比较级是 <b>more famous</b>，两个词。' },
    { type: 'fill', passage: 'p2', q: '(7) g______', answer: ['gate'],
      explain: '“在学校门口集合”：at the school <b>gate</b>。' },
    { type: 'fill', passage: 'p2', q: '(8) h______', answer: ['hours'],
      explain: '8:00 到 11:00 是三个小时；three 后面用复数 <b>hours</b>，千万别漏了 s。' },
    { type: 'fill', passage: 'p2', q: '(9) b______', answer: ['bring'],
      explain: '“请随身带上手套和水”，后面有 with you，用 <b>bring</b> ... with you；Please 开头的祈使句用动词原形。' },
    { type: 'fill', passage: 'p2', q: '(10) f______', answer: ['forget'],
      explain: '固定句型 Don\'t <b>forget</b> to do sth（别忘了做某事），后面说天气可能很热，提醒大家戴帽子。' },
    { type: 'fill', passage: 'p3', q: '(1) ______ (go)', answer: ['goes'],
      explain: '时间词 Every Sunday → 一般现在时；主语 my cousin 是三单，go 以 o 结尾加 es → <b>goes</b>。' },
    { type: 'fill', passage: 'p3', q: '(2) ______ (join)（可填两个词）', answer: ['to join', 'joining'],
      explain: 'started 后面接非谓语：start <b>to do</b> / start <b>doing</b> 都可以 → to join 或 joining。' },
    { type: 'fill', passage: 'p3', q: '(3) ______ (friend)', answer: ['friendly'],
      explain: '词性转换：are very 后面要形容词，给的是名词 friend → 加 ly 变形容词 <b>friendly</b>（友好的）。注意 friendly 是形容词，不是副词。' },
    { type: 'fill', passage: 'p3', q: '(4) ______ (chat)', answer: ['chatting'],
      explain: 'enjoy doing sth（喜欢做某事），enjoy 后面只能接动名词；chat 是重读闭音节，<b>双写 t</b> → <b>chatting</b>。' },
    { type: 'fill', passage: 'p3', q: '(5) ______ (teach)', answer: ['teacher'],
      explain: '词性转换：冠词 a 后面要名词，“以前是一名<b>老师</b>”，动词 teach 加 er → <b>teacher</b>。' },
    { type: 'fill', passage: 'p3', q: '(6) ______ (good)', answer: ['better'],
      explain: '后面有 than anyone else，用比较级；good 是不规则变化：good → <b>better</b> → best。' },
    { type: 'fill', passage: 'p3', q: '(7) ______ (play)（可填两个词）', answer: ['to play'],
      explain: '固定结构 how <b>to do</b> sth（怎样做某事）→ <b>to play</b>，两个词。' },
    { type: 'fill', passage: 'p3', q: '(8) ______ (game)', answer: ['games'],
      explain: 'three 后面的名词用复数 → <b>games</b>。' },
    { type: 'fill', passage: 'p3', q: '(9) ______ (make)', answer: ['making'],
      explain: '固定句型 have fun <b>doing</b> sth（做某事很开心）；make 以不发音的 e 结尾，<b>去 e</b> 加 ing → <b>making</b>。' },
    { type: 'fill', passage: 'p3', q: '(10) ______ (visit)（可填两个词）', answer: ['will visit', 'am visiting'],
      explain: '时间词 Next Sunday → 将来的事，用一般将来时 <b>will visit</b>（两个词）。也可以用现在进行时表示计划好的安排 am visiting。' },
    { type: 'fill', passage: 'p4', q: '(1) e______', answer: ['every', 'each'],
      explain: '“<b>每个</b>工作日”开放：every weekday（each weekday 也对）。' },
    { type: 'fill', passage: 'p4', q: '(2) w______', answer: ['weeks'],
      explain: '借书可以保留两<b>周</b>；two 后面的时间单位用复数 <b>weeks</b>，别漏 s。' },
    { type: 'fill', passage: 'p4', q: '(3) r______', answer: ['return'],
      explain: '先用中文想意思：“请按时<b>归还</b>书”→ <b>return</b>；Please 开头的祈使句用动词原形。' },
    { type: 'fill', passage: 'p4', q: '(4) q______', answer: ['quiet'],
      explain: '图书馆里要保持<b>安静</b>：keep + 形容词 → <b>quiet</b>。注意别拼成 quite（相当）。' },
    { type: 'fill', passage: 'p4', q: '(5) ______（无提示）', answer: ['in', 'inside'],
      explain: '没有提示，根据上下文判断词性：空格后是地点 the reading room，缺介词，“在阅览室<b>里</b>”→ <b>in</b>（inside 也可）。' },
    { type: 'fill', passage: 'p4', q: '(6) m______', answer: ['minutes'],
      explain: '每次用电脑 30 <b>分钟</b>；30 后面用复数 <b>minutes</b>。' },
    { type: 'fill', passage: 'p4', q: '(7) s______', answer: ['should', 'shall'],
      explain: '“如果把书弄丢了，你<b>应该</b>赔偿”，空格后是动词原形 pay，缺情态动词 → <b>should</b>。' },
    { type: 'fill', passage: 'p4', q: '(8) ______（无提示）', answer: ['to'],
      explain: '没有提示：a good place 后面接 read and study，“一个适合读书学习的好地方”，用不定式作定语 a place <b>to</b> do → 填 <b>to</b>。' },
    { type: 'fill', q: 'My mother ______ (teach) English at a middle school.（用所给词的适当形式）', answer: ['teaches'],
      explain: '说的是经常性的职业，用一般现在时；主语 my mother 是三单，teach 以 ch 结尾加 es → <b>teaches</b>。' },
    { type: 'fill', q: 'Listen! Someone ______ (knock) at the door.（用所给词的适当形式，可填两个词）', answer: ['is knocking'],
      explain: 'Listen! 提示动作正在发生 → 现在进行时；someone 作主语看作单数 → <b>is knocking</b>。' },
    { type: 'fill', q: 'English ______ (speak) in many countries.（用所给词的适当形式，可填两个词）', answer: ['is spoken'],
      explain: '主语 English 是“被说的”，用被动语态；讲的是普遍事实，一般现在时 → <b>is spoken</b>（speak 的过去分词是不规则的 spoken）。' },
    { type: 'fill', q: 'This is the ______ (interesting) film I have ever seen.（用所给词的适当形式，可填两个词）', answer: ['most interesting'],
      explain: '前有 the，后有 I have ever seen（我看过的……中），用最高级；interesting 是多音节词 → <b>most interesting</b>。' },
    { type: 'fill', q: 'She sang ______ (beautiful) at the concert last night.（用所给词的适当形式）', answer: ['beautifully'],
      explain: '空格修饰动词 sang，要用副词：beautiful → <b>beautifully</b>（ful 加 ly，两个 l）。' },
    { type: 'fill', q: 'Thank you for your ______ (invite) to the party.（用所给词的适当形式）', answer: ['invitation'],
      explain: '词性转换：your 后面要名词，invite 的名词是 <b>invitation</b>（去 e 加 ation）。' },
    { type: 'fill', q: 'The dentist checked all the children\'s ______ (tooth).（用所给词的适当形式）', answer: ['teeth'],
      explain: '所有孩子的牙齿，用复数；tooth 是不规则变化 → <b>teeth</b>，不能写 tooths。' },
    { type: 'fill', q: 'Could you please ______ (open) the window?（用所给词的适当形式）', answer: ['open'],
      explain: 'Could you please 后接<b>动词原形</b>，所以这里不用变形 → <b>open</b>。' },
    { type: 'fill', q: 'Let\'s ______ (go) swimming this afternoon.（用所给词的适当形式）', answer: ['go'],
      explain: 'Let\'s = let us，let sb do 后面用<b>动词原形</b> → <b>go</b>。不要因为有 this afternoon 就写成 will go 或 going。' },
    { type: 'fill', q: 'Look! She is ______ (write) a letter to her pen pal.（用所给词的适当形式）', answer: ['writing'],
      explain: '现在进行时 is + doing；write 以不发音的 e 结尾，<b>去 e</b> 加 ing → <b>writing</b>（只有一个 t）。' },
    { type: 'fill', q: 'My grandpa is 80 years old, but he is still in good h______.（根据首字母提示填一个词）', answer: ['health'],
      explain: '先用中文说意思：“爷爷 80 岁了，但身体还很好”。固定说法 in good <b>health</b>（身体健康）；介词短语里要名词，不能填形容词 healthy。' },
    { type: 'fill', q: 'We hear with our e______.（根据首字母提示填一个词）', answer: ['ears'],
      explain: '“我们用<b>耳朵</b>听”→ ear；our 指每个人的两只耳朵，用复数 <b>ears</b>。' },
    { type: 'fill', q: '回读改错：句中有一个词形式错误，写出它的正确形式。<br>Yesterday we visit the museum and saw many old things.', answer: ['visited'],
      explain: '回读时看时间词 Yesterday 和后面的 saw，都是过去时，visit 也要改成 <b>visited</b>，前后时态一致。' },
    { type: 'fill', q: '回读改错：句中有一个词形式错误，写出它的正确形式。<br>There are many beautiful flower in our garden.', answer: ['flowers'],
      explain: 'There are many 后面的名词要用复数 → <b>flowers</b>。回读时专门检查数词、many、some 后面的名词。' },
    { type: 'fill', q: '回读改错：句中有一个单词拼写错误，写出它的正确拼写。<br>Look! The boy is runing after the bus.', answer: ['running'],
      explain: 'run 加 ing 要<b>双写 n</b> → <b>running</b>。拼写错一个字母就不得分，回读时专门查双写、去 e、-ly。' }
  ]
},

/* ================= 阅读：细节理解 ================= */
{
  id: 's-reading-detail', title: '阅读理解：细节理解与数字计算', short: '阅读·细节题', module: 'skill', grade: 7, freq: 3,
  prereqs: ['g-wh-q'],
  tip: '细节题考的是“在原文里找到依据”，最大的陷阱是选项换了说法（同义替换）认不出来，或者被“原文出现过的词”拼成的错误选项骗到（具体题量分值以当年《考试说明》为准）。',
  learn: [
    { h: '题型说明', html: `
      <p>细节理解题是阅读理解里<b>数量最多、最容易拿分</b>的题。答案就写在文章里，只是常常换了一种说法。常见问法：</p>
      <ul>
        <li>Who / When / Where / Why / How many ...?（特殊疑问句）</li>
        <li>Which of the following is TRUE / NOT true?（判断正误）</li>
        <li>How much should they pay?（数字计算，常见于广告、通知、时间表）</li></ul>
      <p>材料除了故事和说明文，还经常有<b>应用文</b>：广告、通知、海报、时间表、菜单。应用文不用从头到尾细读，带着问题去找就行。</p>` },
    { h: '解题步骤', html: `<ol>
      <li><b>先读题干，圈关键词</b>：人名、地名、数字、时间、大写词最好找。</li>
      <li><b>回原文定位</b>：用关键词扫读（scanning），找到相关的那一两句。</li>
      <li><b>精读那几句</b>：仔细看前后文，弄清楚意思。</li>
      <li><b>比对选项</b>：找和原文意思一样的那个，注意<b>同义替换</b>。</li>
      <li><b>数字题动笔算</b>：把价格、人数、时间写在草稿上，看清“学生半价”“每人”“一共”这些条件。</li></ol>
      <div class="rhyme">题干先圈关键词，回到原文去定位；<br>前后几句细细读，换个说法要认得；<br>数字题目动笔算，半价折扣别漏掉。</div>` },
    { h: '同义替换与常见陷阱', html: `
      <p>正确选项很少照抄原文，常常是换了说法。认识这些替换，就能一眼找到答案：</p>
      <table class="tbl"><tr><th>原文</th><th>选项里可能写成</th></tr>
      <tr><td>10:00–11:30</td><td>an hour and a half</td></tr>
      <tr><td>give away books</td><td>donate books / give books to others</td></tr>
      <tr><td>only 20 people each time</td><td>no more than 20 people at a time</td></tr>
      <tr><td>book at least one day before</td><td>must be booked in advance</td></tr>
      <tr><td>spend hours playing with phones</td><td>spend too much time on phones</td></tr></table>
      <p><b>错误选项的几种“骗术”</b>：</p>
      <ul>
        <li><b>张冠李戴</b>：信息是真的，但说的是另一个人、另一个活动。</li>
        <li><b>偷换数字/范围</b>：原文 more than 300，选项写 about 300；原文 some，选项写 all。</li>
        <li><b>原文没说</b>：选项符合常识，但文章里根本找不到。</li>
        <li><b>原词陷阱</b>：照搬原文的几个词，拼起来意思却不对。</li></ul>
      <p class="warn">原则：<b>只信原文，不信常识</b>。每个选项都要能在文中找到依据。</p>` },
    { h: '完整示范', html: `
      <div class="passage"><p><b>Lost and Found</b></p>
      <p>I lost my school bag on Bus No. 12 on Tuesday afternoon. It is blue and has a small panda on it. There are two English books and a red pencil box in it. If you find it, please call Wang Fang at 135 0000 1234. Thank you!</p></div>
      <p><b>题目</b>：What is in Wang Fang's bag? &nbsp; 选项：Two English books and a pencil box. / A small panda and two pencils. / A red bag and some books.</p>
      <p><b>第一步</b>：题干关键词 in ... bag。</p>
      <p><b>第二步</b>：定位到 There are two English books and a red pencil box in it.</p>
      <p><b>第三步</b>：比对。“小熊猫”是包<b>上面</b>的图案，不在包里；包是蓝色的，红色的是铅笔盒——这两个都是<b>张冠李戴</b>。</p>
      <p><b>答案</b>：Two English books and a pencil box.</p>
      <p class="ex">There are two English books and a red pencil box in it.<span class="zh">包里有两本英语书和一个红色铅笔盒。</span></p>` }
  ],
  passages: {
    e1: { title: '例题材料', html: `
      <p><b>School Sports Day</b></p>
      <p>Date: Friday, November 14th &nbsp; Place: School Playground</p>
      <p>8:00 a.m. Opening Ceremony<br>8:30 a.m. Running Races (100 m, 400 m)<br>10:00 a.m. Long Jump and High Jump<br>2:00 p.m. Relay Race (4 students from each class)<br>4:00 p.m. Prize-giving</p>
      <p>There are 12 classes in Grade 8. Every student should wear the school uniform and sports shoes.</p>` },
    p1: { title: '阅读理解 A', html: `
      <p><b>Fuzhou Science Museum — Summer Activities</b></p>
      <table class="tbl"><tr><th>Activity</th><th>Time</th><th>Place</th><th>Price</th></tr>
      <tr><td>Robot Show</td><td>9:30–10:30 a.m., Tuesday to Friday</td><td>Hall A</td><td>Free</td></tr>
      <tr><td>Space Movie (3D)</td><td>2:00–2:40 p.m., every open day</td><td>Cinema Room</td><td>¥20 (students half price)</td></tr>
      <tr><td>Make a Rocket</td><td>10:00–11:30 a.m., Saturday and Sunday</td><td>Room 105</td><td>¥30</td></tr>
      <tr><td>Night Stars Watching</td><td>7:30–9:00 p.m., Saturday only</td><td>Roof Garden</td><td>¥40</td></tr></table>
      <p><b>Notes:</b></p>
      <p>1. The museum is open from 9:00 a.m. to 5:00 p.m., Tuesday to Sunday. It is closed on Mondays. Night Stars Watching is the only evening activity.</p>
      <p>2. Only 20 people can join Make a Rocket each time. Please book it on our website at least one day before.</p>
      <p>3. Students must show their student cards to get the half price.</p>` },
    p2: { title: '阅读理解 B', html: `
      <p>Chen Yu is a Grade 8 student in Xiamen. Two years ago, she noticed that many children in her neighborhood spent hours playing with phones after school. “They didn't have many books at home,” she said. So she decided to do something.</p>
      <p>With the help of her parents, Chen Yu turned a small empty room near the community center into a book corner. At first, she put in only 50 of her own books. Then she wrote a letter to her neighbors and asked them to give away the books they no longer read. To her surprise, in just one month the number of books grew to 320.</p>
      <p>The book corner is open from 4:00 p.m. to 6:00 p.m. on weekdays and all day on Saturdays. Children can borrow two books at a time and keep them for a week. Every Saturday afternoon, Chen Yu reads stories to the younger kids. Some high school students also come to help.</p>
      <p>Now the book corner has become the most popular place in the neighborhood. “I used to be shy,” Chen Yu said, “but talking with the kids has made me more confident. I've learned that one small idea can make a big difference.”</p>` },
    e2: { title: '例题材料二', html: `
      <p><b>Second-hand Book Sale</b></p>
      <p>Want to give your old books a new home? Come to our Second-hand Book Sale!</p>
      <p>Time: 9:00 a.m.–3:00 p.m., Saturday, May 20th<br>Place: Hall B, Sunshine Middle School</p>
      <p>• All books are ¥2 each. Buy five, and you get one more for free.<br>
      • All the money will be used to buy new books for a village school in Ningde.<br>
      • Students who bring three old books to the sale will get a free bookmark.</p>` },
    p3: { title: '阅读理解 C', html: `
      <p><b>Happy Swimming Club — Summer Classes</b></p>
      <table class="tbl"><tr><th>Class</th><th>Age</th><th>Time</th><th>Price</th></tr>
      <tr><td>Beginner</td><td>6–9</td><td>Mon, Wed, Fri 8:00–9:00 a.m.</td><td>¥600 for 12 lessons</td></tr>
      <tr><td>Middle</td><td>10–14</td><td>Tue, Thu 3:00–4:30 p.m.</td><td>¥800 for 10 lessons</td></tr>
      <tr><td>Advanced</td><td>12–16</td><td>Sat, Sun 9:00–11:00 a.m.</td><td>¥1,000 for 10 lessons</td></tr></table>
      <p><b>Notes:</b></p>
      <p>1. Classes begin on July 10th and end on August 20th.</p>
      <p>2. There are no more than 8 students in each class.</p>
      <p>3. Please bring your own swimming cap and goggles. We provide towels.</p>
      <p>4. If two people sign up together, each of them gets ¥100 off.</p>` },
    p4: { title: '阅读理解 D', html: `
      <p>Last October, Ms. Huang took her Grade 7 students to visit Tianluokeng Tulou in Zhangzhou. The trip took about three hours by bus.</p>
      <p>Tulou are big round or square buildings made of earth, wood and stone. Some of them are more than 300 years old. In the past, many families lived together in one tulou, and a big one can have over a hundred rooms.</p>
      <p>The students interviewed an old man, Mr. Jiang, who was born in a tulou. He told them that the thick walls kept people safe. The walls also kept the rooms cool in summer and warm in winter.</p>
      <p>Xu Ming, one of the students, took lots of photos. Back at school, he and his group made a model of a tulou with paper boxes. Lin Na wrote a report about Mr. Jiang's life. In December, their works were shown at the school art festival.</p>` },
    e3: { title: '例题材料三', html: `
      <p>Last Friday, Li Hua found a black wallet under a seat in the school library. There was some money and a student card in it. The name on the card was Zhou Lan, a Grade 9 student. Li Hua didn't know Zhou Lan, so she took the wallet to the teachers' office.</p>
      <p>Mr. Wu, the head teacher of Grade 9, called Zhou Lan at once. Zhou Lan was very worried, because she was going to use the money to buy a birthday present for her mother. When she got the wallet back, she thanked Li Hua again and again.</p>` }
  },
  examples: [
    { type: 'choice', passage: 'e1', q: 'When will the Relay Race begin?', options: ['At 8:30 a.m.', 'At 10:00 a.m.', 'At 2:00 p.m.', 'At 4:00 p.m.'], answer: 2,
      explain: '关键词 Relay Race，定位到 2:00 p.m. Relay Race。8:30 是跑步比赛，10:00 是跳远跳高，4:00 是颁奖，都是张冠李戴。' },
    { type: 'choice', passage: 'e1', q: 'How many students in Grade 8 will run in the Relay Race?', options: ['12.', '24.', '36.', '48.'], answer: 3,
      explain: '数字计算：每班 4 人（4 students from each class），八年级有 12 个班，4 × 12 = 48。' },
    { type: 'choice', passage: 'e1', q: 'What should students wear on Sports Day?', options: ['Their school uniforms and sports shoes.', 'Red T-shirts and caps.', 'Anything they like.', 'Running shoes only.'], answer: 0,
      explain: '<b>应用文不用从头细读，带着问题去找</b>：问题问“穿什么”，直接跳过时间表，到最后一句找 wear → Every student should wear the school uniform and sports shoes。红 T 恤、帽子原文没提；“只穿跑鞋”漏掉了校服。' },
    { type: 'choice', passage: 'e3', q: 'Where did Li Hua find the wallet?', options: ['Under a seat in the school library.', 'In the teachers\' office.', 'In a Grade 9 classroom.', 'At Zhou Lan\'s home.'], answer: 0,
      explain: '第一步<b>圈关键词</b>：Where、find、wallet。第二步<b>回原文扫读定位</b>：带着 found ... wallet 去找，第一句就是 found a black wallet under a seat in the school library。teachers\' office 是她后来<b>送去</b>的地方，张冠李戴。' },
    { type: 'choice', passage: 'e3', q: 'Why did Li Hua take the wallet to the teachers\' office?', options: ['Because she didn\'t know Zhou Lan.', 'Because Mr. Wu asked her to.', 'Because she wanted to buy a present.', 'Because the wallet was black.'], answer: 0,
      explain: '定位到 so she took the wallet to the teachers\' office 以后，要<b>精读前后</b>：so（所以）前面的半句 Li Hua didn\'t know Zhou Lan 才是原因。Mr. Wu 是之后才出场的；买礼物是 Zhou Lan 的打算，不是 Li Hua 的。' },
    { type: 'choice', passage: 'e3', q: 'Which of the following is TRUE?', options: ['Zhou Lan planned to use the money for her mother\'s present.', 'Li Hua and Zhou Lan were good friends.', 'Mr. Wu found the wallet in the library.', 'There was no money in the wallet.'], answer: 0,
      explain: 'TRUE 题逐项核对，找和原文意思一致的：原文 she was going to use the money to buy a birthday present for her mother，选项把 was going to 换成 planned to，是<b>同义替换</b>。Li Hua 不认识 Zhou Lan（和原文相反）；钱包是 Li Hua 找到的；钱包里有钱。' },
    { type: 'choice', passage: 'e2', q: 'Which of the following is NOT true?', options: ['The sale lasts for six hours.', 'Each book costs ¥2.', 'The money will help a village school.', 'The sale is held on Sunday.'], answer: 3,
      explain: 'NOT true 题要<b>逐个选项回原文核对</b>，找出和原文不符的那个。9:00–3:00 正好六小时（同义替换）；¥2 each 对；钱用来给村校买书对；原文是 Saturday，不是周日，所以这一项不符合原文。' },
    { type: 'choice', passage: 'e2', q: 'Wang Lei takes six books home from the sale. How much does he pay?', options: ['¥10.', '¥12.', '¥2.', '¥8.'], answer: 0,
      explain: '数字题动笔算，看清条件：买五本送一本（Buy five, and you get one more for free）。拿六本只需付五本的钱：5 × ¥2 = ¥10。¥12 是忘了“送一本”这个条件。' },
    { type: 'choice', passage: 'e2', q: 'How will the money from the sale be used?', options: ['All of it will buy books for a village school.', 'Some of it will buy books for a village school.', 'All of it will go to Sunshine Middle School.', 'Half of it will buy bookmarks.'], answer: 0,
      explain: '定位 All the money will be used to buy new books for a village school。原文是 all，选项写 some 就是<b>偷换范围</b>；Sunshine Middle School 是举办地点，张冠李戴；bookmark 是送给带旧书的学生的，也是张冠李戴。' },
    { type: 'choice', passage: 'e2', q: 'What can we learn from the notice?', options: ['Students who bring three old books will get a bookmark.', 'The sale is held at a village school in Ningde.', 'Teachers can buy books at half price.', 'Students get a free book for every three old books.'], answer: 0,
      explain: '第一项是原文最后一条的同义说法。第二项用了原文的 village school、Ningde，但拼起来意思不对（<b>原词陷阱</b>：地点是 Sunshine Middle School）；老师半价<b>原文没说</b>；带三本旧书换的是书签不是书，也是原词拼凑。' },
    { type: 'choice', q: '原文：More than 300 students took part in the activity. 下面哪个选项和原文意思一致？', options: ['Over 300 students joined the activity.', 'About 300 students joined the activity.', 'Fewer than 300 students joined the activity.', 'All the students in the school joined the activity.'], answer: 0,
      explain: 'more than = over，took part in = joined，这是<b>同义替换</b>。about 300、fewer than 300 是<b>偷换数字</b>，all the students 是<b>扩大范围</b>，原文没说全校都参加。' }
  ],
  tests: [
    { type: 'choice', passage: 'p1', q: 'Which activity can you take part in on a Tuesday morning?', options: ['Robot Show.', 'Make a Rocket.', 'Space Movie.', 'Night Stars Watching.'], answer: 0,
      explain: '表格中只有 Robot Show 是 Tuesday to Friday 的上午（9:30–10:30 a.m.）。Make a Rocket 只在周末，Space Movie 在下午，Night Stars Watching 在周六晚上。' },
    { type: 'choice', passage: 'p1', q: 'Li Ming, a student, wants to see the Space Movie with his father. How much should they pay in all?', options: ['¥20.', '¥30.', '¥40.', '¥10.'], answer: 1,
      explain: '数字计算：Space Movie 每人 ¥20，学生半价（students half price）。爸爸 ¥20 + 李明 ¥10 = ¥30。' },
    { type: 'choice', passage: 'p1', q: 'How long does Make a Rocket last?', options: ['Forty minutes.', 'An hour.', 'An hour and a half.', 'Two hours.'], answer: 2,
      explain: 'Make a Rocket 的时间是 10:00–11:30 a.m.，一共一个半小时。注意“40 分钟”是 Space Movie 的时长。' },
    { type: 'choice', passage: 'p1', q: 'Which of the following is TRUE?', options: ['Make a Rocket must be booked in advance.', 'The museum is open every day.', 'The Robot Show costs ¥30.', 'Night Stars Watching takes place every evening.'], answer: 0,
      explain: 'Notes 第 2 条：book it ... at least one day before，就是 booked in advance（提前预订），属于同义替换。博物馆周一闭馆；Robot Show 免费；观星只在周六晚上。' },
    { type: 'choice', passage: 'p2', q: 'Why did Chen Yu start the book corner?', options: ['Because children nearby spent too much time on phones.', 'Because her parents asked her to sell old books.', 'Because the school library was closed.', 'Because she wanted to become a teacher.'], answer: 0,
      explain: '第一段：many children ... spent hours playing with phones after school，而且家里书不多，所以她决定做点什么。spent hours playing with phones 被替换成 spent too much time on phones。其他三项原文都没说。' },
    { type: 'choice', passage: 'p2', q: 'How many books did the neighbors give in the first month?', options: ['50.', '270.', '320.', '370.'], answer: 1,
      explain: '数字计算：一开始是 Chen Yu 自己的 50 本，一个月后总数变成 320 本（grew to 320），所以邻居们捐了 320 − 50 = 270 本。50 是她自己的书，320 是总数，370 是把两个数加起来，都不对。' },
    { type: 'choice', passage: 'p2', q: 'What can a child do at the book corner?', options: ['Keep two books for seven days.', 'Borrow three books at a time.', 'Keep books for two weeks.', 'Read books only on Saturdays.'], answer: 0,
      explain: '第三段：borrow two books at a time and keep them for a week。a week 被替换成 seven days。three books、two weeks 都偷换了数字；工作日下午也开放，不只周六。' },
    { type: 'choice', passage: 'p2', q: 'When is the book corner open all day?', options: ['On Mondays.', 'On Fridays.', 'On Saturdays.', 'On Sundays.'], answer: 2,
      explain: '第三段：open ... all day on Saturdays。工作日只开 4:00–6:00 p.m.，周日原文没有提到。' },
    { type: 'choice', passage: 'p2', q: 'What has Chen Yu learned?', options: ['A small idea can bring big changes.', 'Shy people can never make friends.', 'High school students are busy.', 'Reading stories is easy.'], answer: 0,
      explain: '最后一段原话：one small idea can make a big difference。make a big difference 被替换成 bring big changes。' },
    { type: 'choice', passage: 'p3', q: 'Which class can a 13-year-old boy take if he is only free at weekends?', options: ['The Advanced class.', 'The Middle class.', 'The Beginner class.', 'None of the classes.'], answer: 0,
      explain: '图表题要把两个条件都对上：13 岁、只有周末有空。Middle 虽然适合 10–14 岁，但在周二、周四；Advanced 适合 12–16 岁，时间是 Sat, Sun，两个条件都满足。' },
    { type: 'choice', passage: 'p3', q: 'Twin brothers aged 11 sign up for the Middle class together. How much should they pay in all?', options: ['¥1,400.', '¥1,600.', '¥1,500.', '¥700.'], answer: 0,
      explain: '动笔算：Middle 每人 ¥800；Notes 第 4 条两人一起报名<b>每人</b>减 ¥100。(800 − 100) × 2 = ¥1,400。¥1,600 漏了优惠，¥1,500 只减了一次，¥700 只算了一个人。' },
    { type: 'choice', passage: 'p3', q: 'How long is each lesson of the Middle class?', options: ['Ninety minutes.', 'Sixty minutes.', 'Two hours.', 'Thirty minutes.'], answer: 0,
      explain: 'Middle 的时间是 3:00–4:30 p.m.，一个半小时 = <b>ninety minutes</b>，这是数字的同义替换。一小时是 Beginner，两小时是 Advanced。' },
    { type: 'choice', passage: 'p3', q: 'Which of the following is NOT true?', options: ['Students must bring their own towels.', 'Each class has at most eight students.', 'The summer classes last about six weeks.', 'The Beginner class meets three times a week.'], answer: 0,
      explain: '逐项核对：原文 We provide towels（毛巾由俱乐部提供），要自己带的是泳帽和泳镜——这一项张冠李戴，不符合原文。no more than 8 = at most eight；7 月 10 日到 8 月 20 日约六周；Mon, Wed, Fri 正好每周三次。' },
    { type: 'choice', passage: 'p3', q: 'What do we know from the ad?', options: ['Each Beginner lesson costs ¥50.', 'All the classes are in the morning.', 'The club has an indoor pool.', 'The Advanced class has 12 lessons.'], answer: 0,
      explain: 'Beginner ¥600 共 12 节，600 ÷ 12 = ¥50。Middle 在下午，all 是扩大范围；室内泳池<b>原文没说</b>；12 节课是 Beginner 的，张冠李戴。' },
    { type: 'choice', passage: 'p4', q: 'Where did the students go last October?', options: ['To a tulou in Zhangzhou.', 'To an art festival in Xiamen.', 'To a paper box factory.', 'To Mr. Jiang\'s school.'], answer: 0,
      explain: '关键词 last October 定位第一段：visit Tianluokeng Tulou in Zhangzhou。艺术节是 12 月在学校办的；纸盒是做模型用的，都是原词陷阱。' },
    { type: 'choice', passage: 'p4', q: 'Which of the following is TRUE about tulou?', options: ['Some of them are over 300 years old.', 'All of them are over 300 years old.', 'They are made only of stone.', 'They are all square.'], answer: 0,
      explain: '第二段：Some of them are more than 300 years old。把 some 换成 all 是<b>偷换范围</b>；原文是 earth, wood and stone，不只是石头；形状是 round or square，不全是方的。' },
    { type: 'choice', passage: 'p4', q: 'Who made a model of a tulou?', options: ['Xu Ming and his group.', 'Lin Na.', 'Mr. Jiang.', 'Ms. Huang.'], answer: 0,
      explain: '关键词 model 定位最后一段：he and his group made a model，he 指前一句的 Xu Ming。Lin Na 写的是报告，张冠李戴。' },
    { type: 'choice', passage: 'p4', q: 'Why were the rooms in a tulou comfortable in the past?', options: ['Because the thick walls kept them cool in summer and warm in winter.', 'Because many families lived together.', 'Because they were made of paper boxes.', 'Because Mr. Jiang was born there.'], answer: 0,
      explain: '定位第三段并<b>精读前后句</b>：The walls also kept the rooms cool in summer and warm in winter。“很多家庭住在一起”原文有，但不是房间舒适的原因；paper boxes 是做模型的材料——都是原词陷阱。' },
    { type: 'choice', passage: 'p4', q: 'What do we know about Mr. Jiang?', options: ['He was born in a tulou.', 'He still lives in a tulou today.', 'He was the students\' teacher.', 'He wrote a report about his life.'], answer: 0,
      explain: '第三段 who was born in a tulou。他现在是否还住在土楼里<b>原文没说</b>；老师是 Ms. Huang；写报告的是 Lin Na，都张冠李戴。' },
    { type: 'choice', passage: 'p4', q: 'When were the students\' works shown at the art festival?', options: ['In December.', 'In October.', 'In July.', 'In November.'], answer: 0,
      explain: '关键词 art festival 定位最后一句：In December。October 是去参观的时间，偷换了时间。' },
    { type: 'choice', q: '做细节理解题，第一步应该做什么？', options: ['先读题干，圈出人名、数字、时间等关键词', '把全文从头到尾精读两遍再看题', '先看哪个选项最符合常识', '选原文里出现次数最多的词'], answer: 0,
      explain: '第一步<b>读题干圈关键词</b>，再用关键词回原文扫读定位。细节题只信原文，不信常识。' },
    { type: 'choice', q: '遇到 “Which of the following is NOT true?” 这类题，最好的做法是什么？', options: ['逐个选项回原文核对，选出与原文不符的那一项', '选出最符合常识的那一项', '选出用了原文原词最多的那一项', '只看第一段就作答'], answer: 0,
      explain: '判断正误题要<b>每个选项都在原文里找依据</b>。NOT true 选和原文不符的；用了原词不等于正确，可能是原词陷阱。' },
    { type: 'choice', q: '原文：The shop is open from 9:00 a.m. to 9:00 p.m. every day. 下面哪个选项是正确的同义替换？', options: ['It is open for twelve hours a day.', 'It opens at 9:00 p.m.', 'It is open for nine hours a day.', 'It is closed at weekends.'], answer: 0,
      explain: '早 9 点到晚 9 点是 <b>12 小时</b>，用数字计算换了说法。9:00 p.m. 是关门时间；nine hours 算错；every day 说明周末也开门。' }
  ]
},

/* ================= 阅读：主旨大意 ================= */
{
  id: 's-reading-main', title: '阅读理解：主旨大意、标题与写作目的', short: '阅读·主旨题', module: 'skill', grade: 8, freq: 3,
  prereqs: ['s-reading-detail'],
  tip: '主旨题考的是“概括全文或段落讲了什么”，最大的陷阱是选了只讲文中某个细节的选项（太窄），或者选了大而空的选项（太宽）（具体题量分值以当年《考试说明》为准）。',
  learn: [
    { h: '题型说明', html: `
      <p>主旨类题目要你站在“高处”看文章，常见问法：</p>
      <table class="tbl"><tr><th>题型</th><th>常见问法</th></tr>
      <tr><td>全文主旨</td><td>What is the passage mainly about? / What's the main idea of the passage?</td></tr>
      <tr><td>段落大意</td><td>What is Paragraph 2 mainly about?</td></tr>
      <tr><td>最佳标题</td><td>What's the best title for the passage?</td></tr>
      <tr><td>写作目的</td><td>Why did the writer write the passage? / The writer wants to tell us that ...</td></tr>
      <tr><td>文章结构</td><td>How is the passage organized?</td></tr></table>
      <p>这类题一般放在每篇阅读的<b>最后一题</b>。先做完细节题，对全文已经很熟了，再做主旨题更有把握。</p>` },
    { h: '解题步骤：找主题句', html: `<ol>
      <li><b>重点读首段和尾段</b>：说明文、议论文的主题常在第一段（尤其是第一段最后一句）；记叙文的道理常在最后一段。</li>
      <li><b>找每段的主题句</b>：一般是段落第一句；看到 First, Second, However, So, In a word 这些词要特别留意。</li>
      <li><b>找反复出现的词</b>：全文多次出现的词（如 sleep、book corner）就是话题。</li>
      <li><b>用一句话概括</b>：“这篇文章讲了 <b>谁/什么</b> + <b>怎么样</b>”，再去选项里找最接近的。</li>
      <li><b>排除“三种坏选项”</b>：太窄（只讲某一段/某个细节）、太宽（说得太大太空）、偏离（文中没讲或讲反）。</li></ol>
      <div class="rhyme">首尾两段是重点，段首句子多是纲；<br>反复出现是话题，一句概括心里亮；<br>太窄太宽都不要，不偏不倚选恰当。</div>` },
    { h: '标题题与写作目的', html: `
      <p><b>好标题的三个标准</b>：</p>
      <ul><li><b>覆盖全文</b>：不能只说某一段。</li>
      <li><b>简洁具体</b>：抓住话题，不说空话。</li>
      <li><b>常有点“吸引力”</b>：可能是一句名言、一个问句，或者一句双关，如 “Falling Down Is Not the End”。</li></ul>
      <p><b>写作目的看文体</b>：</p>
      <table class="tbl"><tr><th>文体</th><th>常见写作目的</th></tr>
      <tr><td>记叙文（讲故事）</td><td>告诉我们一个道理 / 分享一段经历</td></tr>
      <tr><td>说明文（介绍事物）</td><td>介绍、说明某事物（to introduce / to explain）</td></tr>
      <tr><td>议论文、建议类</td><td>劝说读者去做某事（to advise / to encourage）</td></tr>
      <tr><td>广告、通知</td><td>吸引人参加、购买（to attract / to invite）</td></tr></table>
      <p class="warn">选项里出现文中某个具体细节（人名、数字、地名）而且只出现在一段里的，基本都是“太窄”的错误项。</p>` },
    { h: '完整示范', html: `
      <div class="passage"><p>Do you know that trees are good friends of people? Trees give us fresh air to breathe. Their leaves can keep the air clean. In summer, they give us cool shade. Trees also stop wind and sand. Without trees, our cities would be hot and dirty. Let's plant more trees and take good care of them.</p></div>
      <p><b>题目</b>：What's the best title for the passage? &nbsp; 选项：Trees Are Our Friends / Cool Shade in Summer / How to Stop Sand / Dirty Cities</p>
      <p><b>第一步 找主题句</b>：首句 trees are good friends of people 就是主题；最后一句号召大家种树、爱护树。</p>
      <p><b>第二步 看反复出现的词</b>：trees 出现了很多次 → 话题是“树”。</p>
      <p><b>第三步 排除</b>：Cool Shade in Summer、How to Stop Sand 只讲了一个细节（太窄）；Dirty Cities 偏离主题。</p>
      <p><b>答案</b>：Trees Are Our Friends。</p>
      <p class="ex">Trees are good friends of people.<span class="zh">树是人类的好朋友。</span></p>` }
  ],
  passages: {
    e1: { title: '例题短文', html: `<p>Many people think that pandas only eat bamboo. That's almost true. More than 99% of a panda's food is bamboo, and a panda may eat 12 to 38 kilograms of it every day. But pandas sometimes eat other things, too, such as other plants and, once in a while, small animals. In zoos, they also eat apples, carrots and special panda cakes. So, pandas are not as “picky” as we think!</p>` },
    p1: { title: '阅读理解 A', html: `
      <p>Many middle school students in China don't get enough sleep. Homework, after-school classes and mobile phones keep them up late at night. But sleep is not a waste of time. In fact, it is one of the most important things for teenagers.</p>
      <p>First, sleep helps our brains work better. While we are sleeping, the brain sorts out what we learned during the day and stores it. Students who sleep well often remember things more easily and do better in exams.</p>
      <p>Second, sleep is good for our bodies. Teenagers are still growing, and the body does much of its growing while we sleep. Good sleep also makes us stronger against illness, so we catch colds less often.</p>
      <p>So how can we sleep better? Try to go to bed at the same time every night. Put your phone away at least half an hour before bed, and don't drink coffee or strong tea in the evening. Doctors say students of your age need 8 to 10 hours of sleep. Start tonight — your body and brain will thank you!</p>` },
    p2: { title: '阅读理解 B', html: `
      <p>When I was in Grade 7, I joined the school English speech contest. I practiced my speech only twice because I thought it was easy. But when I stood on the stage and saw hundreds of faces, my mind went blank. I forgot half of my speech and ran off the stage in tears.</p>
      <p>For weeks, I didn't want to talk about it. Then my English teacher, Ms. Zheng, said something I will never forget: “Falling down is not the end. Staying down is.”</p>
      <p>So I made a plan. Every morning I got up half an hour earlier and practiced speaking at the beach near my home. I recorded myself on my phone and listened for mistakes. I also asked my little brother to be my audience, even though he often fell asleep!</p>
      <p>One year later, I entered the contest again. My hands were still shaking a little, but I remembered every word. I didn't win first prize — I came third. But as I walked off the stage, I was smiling. I had won something more important: I had beaten my fear.</p>` },
    e2: { title: '例题短文二', html: `
      <p>In many Chinese cities, you can now see four bins of different colours on the street. They are for different kinds of rubbish. Sorting rubbish has become part of our daily life.</p>
      <p>The blue bin is for things that can be recycled, like paper, plastic bottles and cans. The red bin is for harmful waste, such as old batteries and medicine. The green bin is for kitchen waste, like vegetable leaves and leftover food. Everything else goes into the grey bin.</p>
      <p>Why do we sort rubbish? Recycled things can be made into new products, so we use fewer natural resources. Harmful waste can be dealt with safely. Kitchen waste can even be turned into food for plants. Sorting rubbish takes only a few seconds, but it makes our cities cleaner.</p>` },
    p3: { title: '阅读理解 C', html: `
      <p>Do you love stories? Do you want to meet a real writer? Come to the Spring Reading Festival at Haixi Library!</p>
      <p>On April 23rd, World Book Day, the library will hold a reading festival for teenagers. The children's writer Ye Lan will talk about how she writes her stories, and you can ask her questions. There will also be a book swap: bring a book you have finished and take home one you haven't read.</p>
      <p>Students who read ten books during April will get a special “Reading Star” badge.</p>
      <p>The festival is free, but seats are limited. Sign up at the front desk before April 20th. Don't miss it!</p>` },
    p4: { title: '阅读理解 D', html: `
      <p>In many Chinese cities, you can see rows of colourful bikes on the streets. They are shared bikes. You don't need to buy one — you can just find one nearby and ride it.</p>
      <p>Using a shared bike is easy. First, open the app on your phone and scan the QR code on the bike. Then the lock opens and you can ride away. When you finish, park the bike in a proper place and lock it. The app will tell you how much to pay. A short ride usually costs only a few yuan. Riders must be at least 12 years old.</p>
      <p>Shared bikes bring many good things. They are cheap and convenient. Riding instead of driving also makes the air cleaner and helps people keep fit.</p>
      <p>However, there are some problems. Some people leave the bikes everywhere, even in the middle of the road. Some bikes are broken, but nobody repairs them. To make shared bikes work better, every rider should follow the rules.</p>` },
    e3: { title: '例题短文三', html: `<p>Last summer I went camping with my dad for the first time. I wanted to put up the tent by myself, so I didn't read the instructions. An hour later, the tent was still lying on the ground. Dad didn't help me. He just said, “Read first, then do.” I read the instructions carefully, and twenty minutes later the tent was standing.</p>
      <p>That night, lying in the tent, I understood something important: doing things in a hurry often wastes more time.</p>` },
    e4: { title: '例题短文四', html: `
      <p>Many students feel stressed before exams. Here are some ways to relax.</p>
      <p>First, take short breaks. After studying for 40 minutes, stand up and walk around for a few minutes.</p>
      <p>Second, do some exercise. Running or playing ball for half an hour can make you feel much better.</p>
      <p>However, some students try to relax by playing computer games late into the night. This is not a good idea, because it makes them tired the next day.</p>
      <p>In a word, relax in healthy ways, and you will do better in your exams.</p>` },
    e5: { title: '例题短文五', html: `
      <p><b>Want to Draw Like an Artist?</b></p>
      <p>Join our Summer Drawing Class at the Youth Center! Classes are every Saturday morning in July. There are only 10 students in each class, so the teacher can help everyone. Your first lesson is free!</p>
      <p>Sign up in Room 201 before June 30th. Come and draw your summer!</p>` }
  },
  examples: [
    { type: 'choice', passage: 'e1', q: 'What is the passage mainly about?', options: ['What pandas eat.', 'Where pandas live.', 'How much bamboo costs.', 'Why zoos make panda cakes.'], answer: 0,
      explain: '首句提出“熊猫只吃竹子吗？”，接下来讲竹子、其他植物、小动物、苹果、胡萝卜——全文都在讲熊猫<b>吃什么</b>。panda cakes 只是一个细节（太窄），住哪里文中没讲。' },
    { type: 'choice', passage: 'e1', q: 'What\'s the best title for the passage?', options: ['Are Pandas Picky Eaters?', 'Pandas in the Zoo', 'How to Grow Bamboo', 'Small Animals'], answer: 0,
      explain: '最后一句 pandas are not as “picky” as we think 是全文结论，用问句做标题既覆盖全文又有吸引力。Pandas in the Zoo、Small Animals 只讲细节，How to Grow Bamboo 偏离主题。' },
    { type: 'choice', passage: 'e2', q: 'What is the passage mainly about?', options: ['Sorting rubbish into four kinds and why we do it.', 'How to protect the environment of the whole world.', 'How to use old batteries.', 'What kitchen waste is.'], answer: 0,
      explain: '反复出现的词是 bin、rubbish，首段末句点题：Sorting rubbish has become part of our daily life。第二段讲四种垃圾桶，第三段讲为什么分类。“保护全世界的环境”说得太大太空（<b>太宽</b>）；电池、厨余垃圾只是第二段的细节（<b>太窄</b>）。' },
    { type: 'choice', passage: 'e2', q: 'What is Paragraph 2 mainly about?', options: ['What each coloured bin is for.', 'Why we should sort rubbish.', 'How to recycle plastic bottles.', 'Where to buy new bins.'], answer: 0,
      explain: '第二段每句都是“某种颜色的桶装什么”，概括起来就是<b>每种颜色的桶分别装什么</b>。“为什么要分类”是第三段的内容（首句 Why do we sort rubbish? 就是第三段的主题句）。' },
    { type: 'choice', passage: 'e2', q: 'Why did the writer write the passage?', options: ['To introduce rubbish sorting and its good points.', 'To tell a story about a family.', 'To sell new rubbish bins.', 'To invite readers to a party.'], answer: 0,
      explain: '这是<b>说明文</b>：介绍垃圾分类是什么、为什么要做，写作目的是 to introduce / to explain。文中没有讲故事（记叙文），也没有卖东西、发邀请（广告、通知）。' },
    { type: 'choice', passage: 'e2', q: 'How is the passage organized?', options: ['It introduces the topic, then gives details, then gives reasons.', 'It tells a story in time order.', 'It gives reasons first, then introduces the topic.', 'It compares two cities.'], answer: 0,
      explain: '第一段引出话题（四种颜色的垃圾桶），第二段讲具体分类（细节），第三段用 Why do we sort rubbish? 讲原因。没有按时间讲故事，也没有比较两个城市。' },
    { type: 'choice', passage: 'e3', q: 'What is the story mainly about?', options: ['How the writer learned to read instructions before doing something.', 'Camping is fun for every family.', 'How to put up a tent in twenty minutes.', 'Why Dad didn\'t like camping.'], answer: 0,
      explain: '先<b>用一句话概括</b>：“谁 + 怎么样”——“我”搭帐篷不看说明书，失败了；听爸爸的话先读再做，成功了。对照选项，第一项最接近。“露营对每个家庭都有趣”太宽；“二十分钟搭好帐篷”只是一个细节（太窄）；爸爸不喜欢露营原文没说（偏离）。' },
    { type: 'choice', passage: 'e3', q: 'What does the writer want to tell us?', options: ['Doing things in a hurry may waste more time.', 'Dads should always help their children.', 'Camping is dangerous for kids.', 'Tents are hard to put up.'], answer: 0,
      explain: '<b>重点读尾段</b>：记叙文的道理常在最后一段，这里最后一句直接点明 doing things in a hurry often wastes more time。记叙文的<b>写作目的</b>就是通过一段经历告诉我们一个道理。爸爸恰恰没帮忙；露营危险、帐篷难搭都不是作者想说的。' },
    { type: 'choice', passage: 'e4', q: 'What is Paragraph 4 mainly about?', options: ['A bad way to relax.', 'Doing exercise.', 'Taking short breaks.', 'Why exams are difficult.'], answer: 0,
      explain: '找段落主题句，<b>留意信号词</b>：前两段用 First、Second 给出好方法，第四段以 <b>However</b> 开头，意思一转，讲的是“熬夜打游戏”这种<b>不好的放松方法</b>。做运动、短暂休息是第三、二段的内容。' },
    { type: 'choice', passage: 'e4', q: 'What\'s the best title for the passage?', options: ['Healthy Ways to Relax Before Exams', 'Something About School Life', 'Walk Around for a Few Minutes', 'Computer Games Are Fun'], answer: 0,
      explain: '用好标题的标准逐个检查：第一项<b>覆盖全文</b>（各段都在讲考前怎样健康地放松），而且<b>简洁具体</b>。Something About School Life 空洞，说了等于没说；Walk Around for a Few Minutes 只是第二段的一个方法；Computer Games Are Fun 和作者的观点正好相反。' },
    { type: 'choice', passage: 'e4', q: 'Why did the writer write the passage?', options: ['To advise students to relax in healthy ways.', 'To tell a story about an exam.', 'To sell a new computer game.', 'To introduce a famous school.'], answer: 0,
      explain: '这是<b>建议类</b>文章：首段提出“考前紧张”，中间给方法，末段用 In a word 总结：relax in healthy ways。写作目的是<b>劝说、建议</b>读者（to advise）。文中没有讲故事，也不是卖游戏的广告。' },
    { type: 'choice', passage: 'e5', q: 'What is the purpose of the passage?', options: ['To get students to join a drawing class.', 'To introduce a famous artist.', 'To tell a story about a summer holiday.', 'To explain how to draw a picture.'], answer: 0,
      explain: '这是<b>广告</b>：问句标题吸引注意，“小班教学”“第一节免费”都是在说好处，结尾 Sign up ... Come and draw your summer! 号召报名。广告的目的是<b>吸引人参加</b>（to attract）。文中没有介绍画家、讲故事，也没教怎样画画。' },
    { type: 'choice', q: '一篇阅读有五道题，最后一题是 What\'s the best title for the passage? 一般建议怎样安排做题顺序？', options: ['先做前面的细节题，熟悉全文后再做主旨题', '先做主旨题，再做细节题', '主旨题直接猜，不用读文章', '只读第一句就做主旨题'], answer: 0,
      explain: '主旨类题一般放在<b>最后一题</b>。先做完细节题，对全文已经很熟悉，再来概括主旨更有把握。' }
  ],
  tests: [
    { type: 'choice', passage: 'p1', q: 'What is the passage mainly about?', options: ['Why sleep is important for teenagers and how to sleep better.', 'Why students have too much homework.', 'How mobile phones hurt our eyes.', 'What doctors do at night.'], answer: 0,
      explain: '第一段末句点题：sleep is one of the most important things for teenagers；第二、三段讲原因，第四段讲怎样睡得更好。homework、phones 只在第一段作为背景出现，太窄或偏离。' },
    { type: 'choice', passage: 'p1', q: 'What is Paragraph 2 mainly about?', options: ['Sleep helps us learn and remember.', 'Sleep helps our bodies grow.', 'Exams are very difficult.', 'Students should study at night.'], answer: 0,
      explain: '第二段主题句是首句 sleep helps our brains work better，后面讲大脑整理、储存白天学的内容，记得更牢。“帮助身体生长”是第三段的内容。' },
    { type: 'choice', passage: 'p1', q: 'What\'s the best title for the passage?', options: ['Sleep Well, Grow Well', 'Too Much Homework', 'How to Pass Exams', 'Coffee or Tea?'], answer: 0,
      explain: '全文围绕“睡眠对青少年的好处和怎样睡好”，Sleep Well, Grow Well 覆盖全文又简洁。作业、考试、咖啡都只是文中的小细节。' },
    { type: 'choice', passage: 'p1', q: 'Why did the writer write the passage?', options: ['To encourage students to get enough sleep.', 'To tell a story about a student.', 'To sell a new kind of tea.', 'To introduce a famous doctor.'], answer: 0,
      explain: '这是建议类文章，最后一段给出建议并号召 Start tonight，目的是<b>鼓励</b>学生睡够觉。文中没有讲故事，也没有卖东西或介绍某位医生。' },
    { type: 'choice', passage: 'p1', q: 'How is the passage organized?', options: ['It gives a problem, then reasons, then advice.', 'It tells a story in time order.', 'It compares two kinds of students.', 'It gives advice first, then a story.'], answer: 0,
      explain: '第一段提出问题（学生睡眠不足），第二、三段用 First、Second 讲睡眠重要的原因，第四段用 So how can we sleep better? 给建议。' },
    { type: 'choice', passage: 'p2', q: 'What is the story mainly about?', options: ['How the writer got over a failure by practicing hard.', 'How the writer won first prize in a contest.', 'Why the writer liked the beach.', 'Why the writer\'s brother often fell asleep.'], answer: 0,
      explain: '故事从第一次比赛失败写起，到坚持练习，最后战胜恐惧。作者得的是第三名，不是第一名；海边和弟弟睡着都只是细节。' },
    { type: 'choice', passage: 'p2', q: 'What is Paragraph 3 mainly about?', options: ['The writer practiced hard in different ways.', 'The writer was afraid of the stage.', 'Ms. Zheng gave the writer a gift.', 'The writer\'s brother joined the contest.'], answer: 0,
      explain: '第三段首句 So I made a plan，接着讲早起去海边练、录音找错误、请弟弟当观众——用不同方法努力练习。' },
    { type: 'choice', passage: 'p2', q: 'What\'s the best title for the story?', options: ['Falling Down Is Not the End', 'My Little Brother', 'A Morning at the Beach', 'How to Win First Prize'], answer: 0,
      explain: '标题取自老师的话，正是全文的转折点和主题：失败了不要一蹶不振。My Little Brother、A Morning at the Beach 太窄；作者没有得第一名，How to Win First Prize 不符合原文。' },
    { type: 'choice', passage: 'p2', q: 'What does the writer want to tell us?', options: ['We should face failure and keep trying.', 'Speech contests are not important.', 'Practicing twice is enough.', 'Winning first prize is everything.'], answer: 0,
      explain: '记叙文的道理常在结尾：I had won something more important: I had beaten my fear，加上老师的话，说明要正视失败、坚持努力。作者第一次只练两次就失败了，所以“练两次就够”是错的。' },
    { type: 'choice', passage: 'p3', q: 'Why was this passage written?', options: ['To invite teenagers to a reading festival.', 'To introduce the life of the writer Ye Lan.', 'To tell a story about a library.', 'To ask students to buy new books.'], answer: 0,
      explain: '这是<b>通知/广告</b>：开头用问句吸引读者，结尾 Sign up ... Don\'t miss it! 号召报名，目的是吸引、邀请青少年参加读书节（to invite / to attract）。叶兰只是活动的一部分（太窄），文中也没讲故事、没卖书。' },
    { type: 'choice', passage: 'p3', q: 'What\'s the best title for the passage?', options: ['Come and Enjoy the Reading Festival!', 'Books', 'Ye Lan\'s New Book', 'How to Make a Badge'], answer: 0,
      explain: '好标题要覆盖全文、简洁具体、有吸引力：Come and Enjoy the Reading Festival! 正合适。Books 范围太大（<b>太宽</b>）；叶兰只是其中一项活动（<b>太窄</b>），文中也没说她出新书；做徽章原文没讲（偏离）。' },
    { type: 'choice', passage: 'p3', q: 'What does the writer hope readers will do?', options: ['Sign up and come to the festival.', 'Write a story for the library.', 'Give all their books to the library.', 'Visit Ye Lan at her home.'], answer: 0,
      explain: '广告、通知的目的看结尾的号召：Sign up at the front desk ... Don\'t miss it! 作者希望读者<b>报名参加</b>。书是拿来交换的，不是全部捐出；其他两项原文没说。' },
    { type: 'choice', passage: 'p4', q: 'What is the passage mainly about?', options: ['Shared bikes: how to use them, their good points and problems.', 'Ways of travelling around the world.', 'How to scan a QR code.', 'Why people should buy cars.'], answer: 0,
      explain: 'shared bikes 在每段都反复出现，是全文话题；四段分别讲是什么、怎么用、好处、问题。“世界各地的出行方式”<b>太宽</b>；扫二维码只是第二段的一步（<b>太窄</b>）；买汽车<b>偏离</b>原文。' },
    { type: 'choice', passage: 'p4', q: 'What is Paragraph 2 mainly about?', options: ['How to use a shared bike.', 'How much a new bike costs.', 'Why shared bikes are good.', 'Who can repair the bikes.'], answer: 0,
      explain: '第二段首句 Using a shared bike is easy 是主题句，后面用 First、Then、When you finish 讲步骤。好处是第三段，修车的问题在第四段。' },
    { type: 'choice', passage: 'p4', q: 'What is Paragraph 4 mainly about?', options: ['Some problems with shared bikes.', 'The good points of shared bikes.', 'How to park a bike.', 'The price of shared bikes.'], answer: 0,
      explain: '看信号词：第四段以 <b>However</b> 开头，紧接着 there are some problems，这就是主题句。乱停车、车坏没人修都是“问题”的例子。' },
    { type: 'choice', passage: 'p4', q: 'How is the passage organized?', options: ['What shared bikes are → how to use them → good points → problems.', 'Problems → good points → how to use them.', 'It tells a story in time order.', 'It compares shared bikes with buses.'], answer: 0,
      explain: '按段落主题句排一排：第一段介绍是什么，第二段怎么用，第三段 bring many good things，第四段 However ... problems。没有讲故事，也没有和公交车比较。' },
    { type: 'choice', passage: 'p4', q: 'What\'s the best title for the passage?', options: ['Shared Bikes: Helpful but Not Perfect', 'Transport', 'Scan the QR Code', 'Cars Are Better'], answer: 0,
      explain: '“有用但不完美”同时覆盖了好处和问题，简洁又有吸引力。Transport 太宽；Scan the QR Code 太窄；Cars Are Better 偏离原文。' },
    { type: 'choice', passage: 'p4', q: 'Why did the writer write the passage?', options: ['To introduce shared bikes to readers.', 'To tell a story about a bike rider.', 'To sell a new kind of bike.', 'To report a road accident.'], answer: 0,
      explain: '这是<b>说明文</b>，介绍共享单车的使用方法和优缺点，目的是 to introduce。文中没有具体人物的故事，也不是卖车的广告或事故新闻。' },
    { type: 'choice', q: '说明文、议论文的主题句最常出现在哪里？', options: ['第一段，尤其是第一段的最后一句', '文章中间某个数字旁边', '倒数第二段的中间', '每段的最后一个单词'], answer: 0,
      explain: '说明文、议论文的主题常在<b>第一段</b>（尤其是第一段末句）；记叙文的道理则常在<b>最后一段</b>。' },
    { type: 'choice', q: '一篇记叙文讲了“我”学骑自行车摔倒又爬起来的经历，它的道理最可能出现在哪里？', options: ['文章最后一段', '文章第一句', '描写天气的句子里', '人物的名字里'], answer: 0,
      explain: '记叙文先讲经过，<b>最后一段</b>才点出“我”学到了什么，所以找道理要重点读结尾。' },
    { type: 'choice', q: '一篇短文讲“用手机时怎样保护眼睛”，最好的标题是哪个？', options: ['Take Care of Your Eyes When Using Phones', 'Our Health', 'Turn Off the Light', 'How to Buy a Good Phone'], answer: 0,
      explain: '第一个覆盖全文、具体明确。Our Health 范围太大（太宽）；Turn Off the Light 只是一个小建议（太窄）；买手机偏离主题。' },
    { type: 'choice', q: '一篇介绍熊猫生活习性的短文，写作目的最可能是什么？', options: ['To introduce pandas to readers.', 'To tell a funny story about a boy.', 'To sell panda toys.', 'To invite people to a party.'], answer: 0,
      explain: '介绍事物的是<b>说明文</b>，目的一般是 to introduce / to explain。讲故事是记叙文，卖东西、邀请参加是广告、通知。' }
  ]
}

);
