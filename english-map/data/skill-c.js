// 第 4 阶段 · 题型技能 C 组：阅读进阶与应试策略
KG.nodes.push(

/* ================= 阅读理解：推理判断与词义猜测 ================= */
{
  id: 's-reading-infer', title: '阅读理解：推理判断与词义猜测', short: '阅读·推理猜词', module: 'skill', grade: 8, freq: 3,
  prereqs: ['s-reading-detail', 'g-word-form'],
  tip: '推理判断和词义猜测考的是读出文字背后的意思，最大陷阱是选了“原文照搬”或“凭自己常识想出来”的选项，而不是根据文中线索往前推一小步得出的结论（具体题量分值以当年《考试说明》为准）。',
  learn: [
    { h: '题型说明', html: `
      <p>阅读理解里，除了“文中直接写了”的细节题，还有一类题要你<b>动脑推一推</b>。常见的有五种：</p>
      <table class="tbl">
        <tr><th>题型</th><th>题干长什么样</th><th>考什么</th></tr>
        <tr><td>推理判断</td><td>We can infer / learn from the passage that...<br>What can we know about...?</td><td>文中没直接说，但能推出来的结论</td></tr>
        <tr><td>作者态度</td><td>What is the writer's attitude towards...?<br>How does the writer feel about...?</td><td>支持、反对、中立、担心、怀疑……</td></tr>
        <tr><td>可能出处</td><td>Where can you probably read this passage?</td><td>故事书、报纸、杂志、网站、广告……</td></tr>
        <tr><td>下文推测</td><td>What will the writer probably talk about next?</td><td>看最后一句往下接什么</td></tr>
        <tr><td>词义猜测</td><td>The underlined word "..." probably means...</td><td>用上下文和构词法猜生词</td></tr>
      </table>
      <div class="rhyme">推理不是瞎猜，句句要有依据；<br>原文照搬是细节，推过头了是陷阱。</div>` },
    { h: '解题步骤', html: `
      <p><b>推理判断题</b>：</p>
      <ol>
        <li><b>读题干，找关键词</b>（人名、事情、段落提示）。</li>
        <li><b>回原文定位</b>，把相关的 2–3 句都读完，不要只看一句。</li>
        <li><b>往前推一小步</b>：问自己“这几句话说明了什么？”</li>
        <li><b>排除三类错项</b>：和原文意思相反的；原文一字不差照搬的（那是细节，不是推理）；说得太绝对的（all, never, must, only 要小心）。</li>
        <li><b>代回检查</b>：正确答案在原文中能找到支撑它的句子。</li>
      </ol>
      <p><b>作者态度题</b>：找作者的“情感词”，如 wonderful, I hope, sadly, I'm afraid, should, it's a pity。常见答案：positive / supportive（支持）、negative / against（反对）、worried（担心）、doubtful（怀疑）、objective（客观）。</p>
      <p><b>出处题</b>：看文体。讲故事 → story book / magazine；介绍新闻 → newspaper；介绍科学知识 → science magazine；招人、卖东西 → notice / advertisement / website。</p>
      <p><b>下文推测题</b>：重点看<b>最后一段的最后一句</b>，下文一般顺着它往下讲。</p>
      <p><b>词义猜测题</b>：</p>
      <ol>
        <li>找到划线词，读它<b>前后各一两句</b>。</li>
        <li>按下面的线索猜出大概意思（是好是坏？是动作还是性质？）。</li>
        <li>把每个选项<b>代回原句</b>读一遍，意思最通顺、和上下文不矛盾的就是答案。</li>
      </ol>
      <table class="tbl">
        <tr><th>线索</th><th>信号词</th><th>例子</th></tr>
        <tr><td>定义解释</td><td>that is, or, which means, 破折号</td><td>He is a <u>vet</u>, a doctor for animals.</td></tr>
        <tr><td>举例</td><td>such as, for example, like</td><td><u>insects</u> such as bees and ants → 昆虫</td></tr>
        <tr><td>同义 / 并列</td><td>and, also, too, 同样的句式</td><td>She was tired and <u>exhausted</u>. → 很累</td></tr>
        <tr><td>反义 / 对比</td><td>but, however, while, instead, at first... later</td><td>Tom is outgoing, but his brother is <u>shy</u>. → 害羞</td></tr>
        <tr><td>因果</td><td>because, so, as a result</td><td>It was so <u>noisy</u> that I couldn't hear him. → 吵</td></tr>
        <tr><td>构词法</td><td>前缀 un-/dis-/in-/im-（不）、re-（再）；后缀 -less（无）、-ful（有）、-able（能被……的）、-er（人）</td><td>un + friend + ly；re + use + able（能再用的）</td></tr>
      </table>` },
    { h: '常见陷阱', html: `
      <p class="warn">原文原句照搬：选项和原文一模一样，往往是细节信息，不是“推理”出来的结论，推理题里要多想一下。</p>
      <p class="warn">推过头：原文说“他有点紧张”，选项说“他再也不敢说话了”——推得太远，错。</p>
      <p class="warn">用常识代替原文：选项本身是“对的道理”，但文章根本没讲，也不能选。</p>
      <p class="warn">猜词只看单词本身：很多词有好几个意思（如 <span class="w">fine</span> 可以是“好的”也可以是“罚款”），一定要按这一句的意思选。</p>
      <p class="warn">猜词选了“字面意思”：如 <span class="w">a piece of cake</span> 在 “The test was a piece of cake.” 里是“很容易的事”，不是“一块蛋糕”。</p>` },
    { h: '示范：一步一步推出来', html: `
      <div class="passage"><p>Amy's grandma lives alone in a small village. Every Sunday evening, Amy calls her. Last Sunday, Amy was busy with a science project and forgot. The next morning, Grandma called her first. "I just wanted to hear your voice," she said. Amy felt <u>guilty</u>. She put a note on her desk: "Sunday 7 p.m. — Grandma!"</p></div>
      <p><b>题 1</b>：What can we infer from the story?</p>
      <p>① 定位：Grandma 打电话、Amy 的反应、写便条。② 推一步：奶奶主动打来只为“听听声音”，说明奶奶很期待每周的电话；Amy 写便条，说明她<b>以后不想再忘记</b>。③ 所以“Amy will remember to call Grandma in the future.”是合理推理；而“Grandma was angry with Amy.”文中没有依据（奶奶只是想听声音），“Amy never calls Grandma.”太绝对、和 Every Sunday 矛盾。</p>
      <p><b>题 2</b>：The underlined word “guilty” probably means ___.</p>
      <p>① 前因：Amy 忘了打电话，奶奶反而先打来。② 后果：她马上写便条提醒自己。③ 什么心情会让人这样做？——<b>内疚的</b>。把“高兴的”“自豪的”代回去都说不通。</p>
      <div class="rhyme">推理三步走：定位、推一步、找依据；<br>猜词三步走：看前后、找信号、代回去。</div>` }
  ],
  passages: {
    e1: { title: '例题短文：Grandpa and the Birds', html: `
      <p>Every Saturday morning, Grandpa Chen walks to the small park near our home with a bag of bread. He sits on the same seat and waits. Soon dozens of birds fly down and land around his feet. Some even sit on his arms.</p>
      <p>Last month, Grandpa caught a bad cold and had to stay in bed for a week. On the first Saturday he couldn't go, I saw him standing at the window, looking towards the park for a long time. "Could you do me a favour?" he asked me quietly. I picked up the bag of bread and smiled.</p>
      <p>That afternoon, the birds were not <u>disappointed</u>. But they kept looking around, as if they were searching for a familiar face.</p>` },
    e2: { title: '例题短文：Paper Books Still Matter', html: `
      <p>I am a <u>bookworm</u>—someone who can hardly stop reading. These days, more and more of my classmates read e-books on their phones. E-books are light and cheap, and you can carry hundreds of them in your pocket. I use them sometimes, too.</p>
      <p>But I still believe paper books are worth keeping. When I read a paper book, I am not <u>distracted</u> by messages popping up on the screen, so I can focus on the story for a long time. My eyes also feel less tired. Besides, I love writing notes beside my favourite lines and lending my books to friends.</p>
      <p>I am not saying we should stop using e-books. But it would be a real pity if paper books disappeared from our lives. In my next article, I will share three ideas for building a daily reading habit.</p>` },
    p1: { title: 'Passage 1: My Summer at the Museum', html: `
      <p>Last summer, I became a volunteer guide at the Fujian Museum. Before my first day, I practised my talk about the bronze ware (青铜器) for hours, and I even recorded myself to check my pronunciation. Still, my hands were shaking when the first group of visitors arrived.</p>
      <p>Things did not go as planned. In the middle of my talk, a little boy asked, "Why is this old pot green?" I had no idea. My face turned red, and I could hear some adults laughing. I wanted to run away. Then an old volunteer, Mr. Zheng, walked over. "That's a great question," he said to the boy. "Shall we find the answer together?" He told the group that bronze (青铜) slowly turns green after it stays in air and water for a long time. Everyone listened with interest, and the boy cheered happily.</p>
      <p>After the visitors left, Mr. Zheng put his hand on my shoulder. "Nobody knows everything," he said. "A good guide is not someone with all the answers. It's someone who is not afraid to keep learning."</p>
      <p>From then on, I carried a small notebook with me. Whenever a visitor asked something I couldn't answer, I wrote it down and looked it up that evening. By the end of the summer, my notebook was full, and so was my confidence. Next week, a group of new volunteers will join us, and the museum has asked me to help them prepare for their first day.</p>` },
    p2: { title: 'Passage 2: Our Beach, Our Job', html: `
      <p>Every month, our class goes to a beach in Xiamen to pick up <u>litter</u>. We often find plastic bottles, food bags and even old shoes on the sand. Our teacher, Ms. Wu, says that a lot of this rubbish ends up in the sea and hurts fish and birds.</p>
      <p>At first, my friend Hao was <u>unwilling</u> to join us. He said the work was dirty and boring, and he would rather stay at home and play computer games. But after he saw a whale caught in a fishing net on the news, he changed his mind. Now he is always the first one to arrive at the beach.</p>
      <p>We also learned that cleaning up is not enough. We need to produce less rubbish in the first place. So our class started a "No Plastic Week". Everyone brought <u>reusable</u> bottles and lunch boxes to school instead of buying drinks in plastic bottles. Some students even made shopping bags out of old T-shirts.</p>
      <p>Small actions may seem <u>unimportant</u>, but they add up. If each of the 2,000 students in our school throws away one bottle fewer every day, we will save about 60,000 bottles a month. That is not a small number at all!</p>` },
    p3: { title: 'Passage 3: Please Don\'t Close Our Library', html: `
      <p>Dear Editor,</p>
      <p>Last week I read in your newspaper that the city plans to close Riverside Library next year and turn it into a car park. As a student who has used this library for six years, I feel I must speak up.</p>
      <p>The library is small, but it is bright, quiet and <u>comfortable</u>. On cold winter afternoons, it is the warmest place for the kids in our neighbourhood. It also has lots of magazines and newspapers, and new ones arrive every week, so there is always something new to read. You can even <u>book</u> a study room online for free.</p>
      <p>Most of all, there is Mrs. Lin, the librarian. She always <u>goes the extra mile</u> for us. She stays late to help us find books for our school projects, and she even orders new books that we ask for. Many families in our area can't <u>afford</u> to buy many books. Without this library, their children would have nowhere else to read after school.</p>
      <p>The city says the building is too old and costs too much to <u>maintain</u>, that is, to keep in good condition. However, a car park will only bring more cars and more noise to our quiet street. I believe the money would be better spent on repairing the library.</p>
      <p>Next Saturday, some students and parents will meet at the library to discuss what we can do. In my next letter, I will tell your readers about our plan.</p>
      <p>Yours,<br>Wang Xin, Grade 8</p>` }
  },
  examples: [
    { type: 'choice', passage: 'e1', q: 'What did the writer probably do that afternoon?',
      options: ['Fed the birds in the park for Grandpa.', 'Took Grandpa to see a doctor.', 'Bought a new seat for the park.', 'Stayed at home and played with Grandpa.'], answer: 0,
      explain: '文中没直接说，要推：爷爷生病去不了，望着公园，请“我”帮个忙（Could you do me a favour?）；“我”拿起那袋面包笑了；下午鸟儿们 were not disappointed（没有失望）。连起来就是“我”替爷爷去喂鸟了。去看医生、买座椅文中都没提；待在家里和“鸟儿没失望”矛盾。' },
    { type: 'choice', passage: 'e1', q: 'The underlined word "disappointed" probably means ___.',
      options: ['失望的', '吃惊的', '聪明的', '满意的'], answer: 0,
      explain: '鸟儿有面包吃，所以“没有 disappointed”；但它们还在四处找那张熟悉的脸（爷爷）。“没有失望”最通顺。如果代入“满意的”，变成“鸟儿不满意”，就和吃到面包矛盾了。另外 dis- 是表示否定的前缀，也是个提示。' },
    { type: 'choice', passage: 'e1', q: 'How does Grandpa feel about the birds?',
      options: ['He cares about them a lot.', 'He thinks they are too noisy.', 'He is afraid of them.'], answer: 0,
      explain: '推理依据：他每周六都去喂（Every Saturday），生病时还站在窗前长时间望着公园，并请“我”帮忙。说明他非常在乎这些鸟儿。另外两项文中没有任何依据。' },
    { type: 'choice', passage: 'e2', q: 'What is the writer\'s attitude towards paper books?',
      options: ['Supportive.', 'Against.', 'Doubtful.', 'Uninterested.'], answer: 0,
      explain: '作者态度题找“情感词”：I still believe paper books are worth keeping（我仍然相信纸质书值得保留）、I love writing notes...（我喜欢……）、it would be a real pity if paper books disappeared（纸质书消失会很可惜）。全是正面的评价，所以是“支持的”。作者虽然也用电子书，但并没有反对纸质书；“怀疑的”“不感兴趣的”都和这些情感词矛盾。' },
    { type: 'choice', passage: 'e2', q: 'Where can you most probably read this passage?',
      options: ['In a school magazine.', 'In a user guide for a phone.', 'In a dictionary.', 'In a science textbook.'], answer: 0,
      explain: '出处题看文体：作者是学生（my classmates），用第一人称发表个人看法，最后还说 In my next article（在我的下一篇文章里），说明这是会连续刊登文章的刊物，最可能是校刊。手机说明书讲怎么用手机，词典解释词义，科学课本讲知识，都不会写“我认为纸质书值得保留”这样的观点。' },
    { type: 'choice', passage: 'e2', q: 'What will the writer probably write about in the next article?',
      options: ['Ways to make reading a part of everyday life.', 'The history of e-books.', 'How to write notes on a phone.', 'Why paper books cost too much.'], answer: 0,
      explain: '下文推测看最后一句：I will share three ideas for building a daily reading habit（分享三个养成每天阅读习惯的好办法）。“让阅读成为日常生活的一部分”就是它的同义说法。其他选项最后一句都没有提到。' },
    { type: 'choice', passage: 'e2', q: 'The underlined word "bookworm" in Paragraph 1 probably means ___.',
      options: ['爱读书的人', '书里的小虫子', '卖书的人', '写书的人'], answer: 0,
      explain: '定义解释线索：破折号后面的 someone who can hardly stop reading（一读起书来就停不下来的人）就是对 bookworm 的解释。这也是“字面意思”陷阱：book + worm 看起来像“书虫子”，但在这句话里指的是人。' },
    { type: 'choice', passage: 'e2', q: 'The underlined word "distracted" in Paragraph 2 probably means ___.',
      options: ['分心的', '放松的', '兴奋的', '满意的'], answer: 0,
      explain: '因果线索 so：“不被屏幕上弹出的消息 distracted，所以能长时间专注于故事”。能让人“不能专注”的状态就是“分心”。把“放松的”“满意的”代回去，“不被消息放松”“不被消息满意”都说不通。' },
    { type: 'choice', q: 'In summer you can see lots of <u>insects</u> in the garden, such as butterflies, bees and ants. 划线词 insects 的意思是 ___。',
      options: ['昆虫', '鸟类', '鱼类', '花草'], answer: 0,
      explain: '举例线索 such as：后面举的蝴蝶、蜜蜂、蚂蚁有什么共同点？都是昆虫。用例子的“共同类别”来猜上位词，是举例线索的典型用法。' },
    { type: 'choice', q: 'After climbing the mountain for six hours, we were hungry, thirsty and <u>exhausted</u>. 划线词 exhausted 的意思是 ___。',
      options: ['筋疲力尽的', '兴高采烈的', '十分好奇的', '非常勇敢的'], answer: 0,
      explain: '同义 / 并列线索：and 把 hungry（饿）、thirsty（渴）和 exhausted 并列，三个词应该是同一类感受——爬了六小时山后的身体不适。所以是“筋疲力尽的”。“兴高采烈”和前两个词不是一类。' },
    { type: 'choice', q: 'Most of my classmates like to talk a lot, but Jim is rather <u>quiet</u>. He seldom speaks in class. 划线词 quiet 的意思是 ___。',
      options: ['寡言少语的', '爱说话的', '爱运动的', '粗心的'], answer: 0,
      explain: '反义 / 对比线索：but 前面说同学们都 like to talk a lot（爱说话），but 后面的 Jim 正好相反；下一句 He seldom speaks in class（他很少在课上发言）也印证了。所以是“寡言少语的”。“爱说话的”正是被对比的那一面。' },
    { type: 'choice', q: 'This cup is <u>unbreakable</u>, so you can drop it on the floor without worrying. 划线词 unbreakable 的意思是 ___。',
      options: ['摔不坏的', '很容易碎的', '很昂贵的', '刚买的'], answer: 0,
      explain: '构词法：un-（不）+ break（打碎）+ -able（能被……的）= 不能被打碎的。上下文也印证：so you can drop it ... without worrying（所以掉在地上也不用担心）。“很容易碎的”正好相反。' },
    { type: 'choice', q: 'The driver had to pay a <u>fine</u> of 200 yuan because he parked his car in the wrong place. 这里 fine 的意思是 ___。',
      options: ['罚款', '好的', '晴朗的', '细小的'], answer: 0,
      explain: '多义词要按这一句的意思选：pay a fine of 200 yuan（付 200 元的 fine），原因是“把车停错了地方”。和付钱、违规连在一起的只能是“罚款”。fine 的“好的”“晴朗的”是常见意思，但放在这里说不通。' },
    { type: 'choice', q: 'At the party nobody said a word at first. Then Mike told a funny joke to <u>break the ice</u>, and soon everyone was chatting happily. 划线短语 break the ice 的意思是 ___。',
      options: ['打破沉默，让气氛轻松起来', '把冰块打碎', '弄坏了东西', '提前离开聚会'], answer: 0,
      explain: '不要选字面意思“打碎冰块”。看前后：一开始没人说话 → Mike 讲笑话 break the ice → 很快大家都开心地聊起来。前后对比说明这个短语是“打破冷场、活跃气氛”。' },
    { type: 'choice', q: 'Lucy was a little nervous before her first piano show. She took a deep breath, smiled at the people in the hall and began to play. When she finished, everyone stood up and cheered. 根据短文，可以推出 ___。',
      options: ['People in the hall enjoyed her playing.', 'Lucy will never feel nervous on stage again.', 'Learning the piano is good for children\'s brains.', 'Lucy was too nervous to finish her show.'], answer: 0,
      explain: '依据 everyone stood up and cheered（大家起立欢呼）往前推一步：观众喜欢她的演奏。其余三项正好是三类错项：“再也不会紧张”用了 never，推过头了；“学钢琴对大脑好”可能是常识，但文中根本没讲；“紧张得没弹完”和 When she finished 矛盾。' },
    { type: 'choice', q: 'Tom\'s alarm clock didn\'t ring this morning. He woke up at 7:40, jumped out of bed and ran out of the house without breakfast. He got to school just as the bell rang. 下面哪一项是“推理”出来的，而不是原文直接写了的？',
      options: ['Tom was in a hurry this morning.', 'Tom woke up at 7:40.', 'Tom didn\'t have breakfast.', 'Tom is always late for school.'], answer: 0,
      explain: '“原文照搬”陷阱：“7:40 起床”“没吃早饭”原文直接写了，是细节，不是推理。把“闹钟没响、跳下床、没吃早饭就跑出门、铃响时刚到”连起来，才能推出“他今天早上很匆忙”。“总是迟到”用了 always，推过头了，而且他今天也没迟到。' },
    { type: 'choice', q: 'Mia\'s grandpa is 80 years old. Every morning he walks in the park for an hour, and then he reads the newspaper over a cup of tea. What can we learn about Mia\'s grandpa?',
      options: ['He is healthy enough to walk for an hour every day.', 'Walking is the best exercise for old people.', 'All old people should read newspapers.', 'He was a teacher before he retired.'], answer: 0,
      explain: '“用常识代替原文”陷阱：“散步是老人最好的运动”“老人都应该看报”听起来像道理，但文章根本没讲这些，而且说的是“所有老人”，不是 Mia 的爷爷。“以前是老师”没有任何依据。由“80 岁、每天早上散步一小时”能推出的是：他身体不错，能坚持每天走一小时。' },
    { type: 'choice', q: 'Every year, millions of plastic bags are thrown away in our city. They take hundreds of years to break down, and many end up in rivers and the sea. Next time you go shopping, why not take a cloth bag with you? Why did the writer write this passage?',
      options: ['To ask people to use cloth bags instead of plastic bags.', 'To tell people where to buy plastic bags.', 'To explain how plastic bags are made.', 'To describe a shopping trip.'], answer: 0,
      explain: '写作意图题看作者“想让读者怎么做”：前面讲塑料袋的害处（几百年才能分解、流进河里海里），最后一句 why not take a cloth bag with you?（为什么不带个布袋呢？）是在提建议。所以目的是劝大家用布袋代替塑料袋。文中没讲在哪买塑料袋、怎么制造，也不是在记一次购物经历。' }
  ],
  tests: [
    { type: 'choice', passage: 'p1', q: 'Why were the writer\'s hands shaking when the first visitors arrived?',
      options: ['He was nervous about his first talk.', 'He felt very cold in the museum.', 'He was angry with the little boy.', 'He was tired after recording himself.'], answer: 0,
      explain: '第一段：他练习了好几个小时，还录音检查发音，Still（尽管如此）手还在发抖。认真准备之后还发抖，说明是第一次讲解很紧张。冷、累文中没提；生气男孩的事发生在后面，而且他当时是脸红想逃走，不是生气。' },
    { type: 'choice', passage: 'p1', q: 'What can we infer about Mr. Zheng?',
      options: ['He knew how to help others out of trouble kindly.', 'He was the little boy\'s grandfather.', 'He thought the writer should stop being a guide.', 'He didn\'t know why bronze turns green.'], answer: 0,
      explain: '第二、三段：作者答不上来、很尴尬时，老志愿者郑先生走过来先夸男孩问得好，再带大家一起找答案，事后还把手放在作者肩上表示鼓励。可以推出他善于友好地帮人解围。他解释了青铜变绿的原因，所以“他不知道”是错的；另外两项文中没有依据。' },
    { type: 'choice', passage: 'p1', q: 'At the end of the story, how does the writer see questions that can\'t be answered right away?',
      options: ['As a chance to learn something new.', 'As something that makes him look stupid.', 'As questions that guides should avoid.', 'As things that are not important at all.'], answer: 0,
      explain: '最后一段：从那以后他带着小本子，答不上的问题记下来、晚上查清楚，到暑假结束本子写满了、信心也满了。说明他把答不上的问题当成学习的机会。“让他显得很傻、很丢脸”是他第一天的感受，后来已经变了。' },
    { type: 'choice', passage: 'p1', q: 'What will the writer probably do next week?',
      options: ['Help the new volunteers get ready.', 'Leave the museum and go back to school.', 'Ask Mr. Zheng to give all the talks.', 'Write a book about bronze ware.'], answer: 0,
      explain: '下文推测看最后一句：下周有新志愿者加入，博物馆请他帮助他们为第一天做准备（help them prepare）。所以他下周很可能帮新志愿者做准备。' },
    { type: 'choice', passage: 'p1', q: 'Where can you most probably read this passage?',
      options: ['In a collection of students\' stories about growing up.', 'In a price list of museum tickets.', 'In a science book about metals.', 'In a guide to restaurants in Fuzhou.'], answer: 0,
      explain: '全文用第一人称讲一个学生做志愿者、从紧张到自信的成长故事，最可能出现在学生成长故事集里。虽然提到青铜变绿，但只是一个小细节，不是科普书；也不是票价表或美食指南。' },
    { type: 'choice', passage: 'p2', q: 'The underlined word "litter" in Paragraph 1 means ___.',
      options: ['垃圾', '贝壳', '沙子', '海鱼'], answer: 0,
      explain: '举例线索：后面一句列出他们捡到的东西——塑料瓶、食品袋、旧鞋子；再后面又用 this rubbish（这些垃圾）指代它们。所以 litter 是“垃圾”。' },
    { type: 'choice', passage: 'p2', q: 'The underlined word "unwilling" in Paragraph 2 probably means ___.',
      options: ['不情愿的', '兴奋的', '准备好的', '骄傲的'], answer: 0,
      explain: '构词法：un-（不）+ willing（愿意的）。对比线索 At first... But... changed his mind：一开始他嫌活儿又脏又无聊，宁愿在家玩游戏，后来才改变主意。说明一开始他是“不情愿的”。“兴奋的”“准备好的”都和他嫌脏嫌无聊、后来才改变主意矛盾。' },
    { type: 'choice', passage: 'p2', q: 'What does the underlined word "reusable" mean?',
      options: ['可以多次使用的', '一次性的', '用塑料做的', '价格很贵的'], answer: 0,
      explain: '构词法：re-（再）+ use（使用）+ -able（能……的）= 能再次使用的。上下文也印证：大家带它来学校，“代替”买塑料瓶装饮料（instead of），所以不可能是“一次性的”或“塑料做的”。' },
    { type: 'choice', passage: 'p2', q: 'The underlined word "unimportant" in the last paragraph probably means ___.',
      options: ['不重要的', '很有趣的', '很危险的', '很困难的'], answer: 0,
      explain: '构词法：un-（不）+ important（重要的）。上下文：but they add up（但积少成多），最后又说 not a small number at all。前后是对比：小行动“看起来不重要”，但加起来很可观。' },
    { type: 'choice', passage: 'p2', q: 'Why does the writer give the number "60,000"?',
      options: ['To show that small actions can make a big difference.', 'To tell us how many students are in the school.', 'To show the price of plastic bottles.', 'To prove that cleaning beaches is boring.'], answer: 0,
      explain: '写作意图属于推理题。最后一段先说 Small actions may seem unimportant, but they add up，再用“每人每天少扔一瓶，一个月省六万瓶”来证明。所以数字是为了说明小行动也能带来大改变。学生人数是 2,000，不是 60,000。' },
    { type: 'choice', passage: 'p3', q: 'What is the writer\'s attitude towards the plan to close the library?',
      options: ['Against it.', 'In favour of it.', 'Not interested in it.', 'Unsure about it.'], answer: 0,
      explain: '作者态度题：开头说 I feel I must speak up（我觉得必须站出来说话），后面列举图书馆的好处，又用 However 反驳市里的理由，最后说 the money would be better spent on repairing the library（钱最好用来修图书馆）。明确是反对的。“不确定”和这些坚定的表态不符。' },
    { type: 'choice', passage: 'p3', q: 'How does the writer feel about Mrs. Lin?',
      options: ['Thankful.', 'Worried.', 'Angry.', 'Disappointed.'], answer: 0,
      explain: '看对 Mrs. Lin 的描写：Most of all（最重要的是）有她；她总是格外尽心，留下来帮学生找书，还按学生的要求订新书。作者举这些例子，表达的是感激。文中没有任何担心、生气或失望的词。' },
    { type: 'choice', passage: 'p3', q: 'What can we infer from Paragraph 3?',
      options: ['Some children in the area depend on the library for books.', 'All the families in the city are too poor to buy books.', 'Mrs. Lin will lose her job and leave the city.', 'Reading paper books is better than reading e-books.'], answer: 0,
      explain: '依据：Many families in our area can\'t afford to buy many books. Without this library, their children would have nowhere else to read（没有图书馆，孩子们放学后就没地方看书了）。推一步：一些孩子靠这个图书馆读书。“全市所有家庭”用了 all，范围又从 our area 扩大到 city，太绝对；“林老师会失业离开”推过头了；纸质书和电子书的比较文中根本没讲，是用常识代替原文。' },
    { type: 'choice', passage: 'p3', q: 'Why did the writer write this letter?',
      options: ['To ask the city to keep the library open.', 'To tell readers how to book a study room.', 'To tell people about a new car park.', 'To thank the newspaper for its report.'], answer: 0,
      explain: '写作意图题：整封信都在说图书馆有多好、关掉有什么坏处，并建议把钱用来修图书馆。目的是希望保留图书馆。预订自习室只是一个小细节；作者反对建停车场；信里也没有感谢报纸。' },
    { type: 'choice', passage: 'p3', q: 'Where can you most probably read this passage?',
      options: ['In the readers\' letters part of a newspaper.', 'In a library\'s list of opening hours.', 'In a book of stories for little children.', 'In a travel guide to the city.'], answer: 0,
      explain: '出处题看格式：开头 Dear Editor（编辑您好），第一句又说 I read in your newspaper（我在贵报上读到），结尾有署名。这是读者写给报纸的信，最可能刊登在报纸的读者来信栏目里。' },
    { type: 'choice', passage: 'p3', q: 'What will the writer probably write about in the next letter?',
      options: ['The plan to save the library.', 'The history of car parks in the city.', 'How to become a librarian.', 'The best books for Grade 8 students.'], answer: 0,
      explain: '下文推测看最后两句：下周六学生和家长要在图书馆商量能做什么，In my next letter, I will tell your readers about our plan（下一封信我会告诉读者我们的计划）。这个计划就是保住图书馆的计划。' },
    { type: 'choice', passage: 'p3', q: 'The underlined word "comfortable" in Paragraph 2 probably means ___.',
      options: ['舒适的', '拥挤吵闹的', '又旧又脏的', '昂贵豪华的'], answer: 0,
      explain: '同义 / 并列线索：comfortable 和 bright（明亮的）、quiet（安静的）并列，应该也是一个好的特点；下一句又说冬天下午这里是孩子们最温暖的地方。所以是“舒适的”。“拥挤吵闹的”和 quiet 矛盾；“又旧又脏”“昂贵豪华”都不是作者想夸的特点。' },
    { type: 'choice', passage: 'p3', q: 'The underlined word "afford" in Paragraph 3 probably means ___.',
      options: ['负担得起', '记得', '拒绝', '等待'], answer: 0,
      explain: '因果线索：很多家庭 can\'t afford to buy many books，所以“没有这个图书馆，孩子们放学后就没地方看书了”。家里没书、只能靠免费图书馆，说明这些家庭是“买不起”书，afford 就是“负担得起”。“记不得买书”“不拒绝买书”“不等待买书”都和后一句的结果连不上。' },
    { type: 'choice', passage: 'p3', q: 'The underlined word "book" in Paragraph 2 means ___.',
      options: ['预订', '书本', '阅读', '归还'], answer: 0,
      explain: '多义词：book 在这里放在 You can even 后面，是动词；宾语是 a study room（自习室），还说 online for free（在网上免费）。“在网上预订自习室”最通顺。“书本”是名词意思，这里用不上；“阅读自习室”“归还自习室”都说不通。' },
    { type: 'choice', passage: 'p3', q: 'The underlined phrase "goes the extra mile" in Paragraph 3 probably means ___.',
      options: ['格外尽心尽力', '每天走很远的路上班', '经常迟到早退', '只做自己分内的事'], answer: 0,
      explain: '不能按字面理解成“多走一英里”。看后面的例子：她留下来很晚帮学生找书，还按学生的要求订新书——这些都超出了一般工作的要求。所以是“格外尽心尽力”。“只做分内的事”正好相反。' },
    { type: 'choice', passage: 'p3', q: 'The underlined word "maintain" in Paragraph 4 probably means ___.',
      options: ['维护保养', '建造', '出售', '参观'], answer: 0,
      explain: '定义解释线索 that is：后面 to keep in good condition（使保持良好状态）就是 maintain 的解释，即“维护保养”。下文作者建议把钱用来 repairing（修理）图书馆，也和“维护”呼应。' },
    { type: 'choice', q: 'Read and answer: "Some people say robots will soon do our homework for us. I\'m afraid that students who depend on robots too much may forget how to think for themselves." What is the speaker\'s attitude towards robots doing homework?',
      options: ['Worried.', 'Excited.', 'Satisfied.', 'Uninterested.'], answer: 0,
      explain: '找情感词：I\'m afraid that...（恐怕……），后面说学生太依赖机器人可能会忘记独立思考。这是在担心可能的坏结果，所以态度是“担心的”。' },
    { type: 'choice', q: 'My uncle is a <u>pilot</u>, which means his job is to fly planes. 划线词 pilot 的意思是 ___。',
      options: ['飞行员', '司机', '工程师', '警察'], answer: 0,
      explain: '定义解释线索 which means：后面解释“他的工作是开飞机”，这正是飞行员的工作。司机开车，不开飞机。' },
    { type: 'choice', q: 'The soup was so <u>tasteless</u> that I had to add some salt to it. 划线词 tasteless 的意思是 ___。',
      options: ['没有味道的', '太咸的', '太烫的', '很贵的'], answer: 0,
      explain: '构词法：taste（味道）+ -less（无）= 没有味道的。因果线索 so...that... 也印证：因为汤太 tasteless，所以“我”不得不加盐。“太咸的”正好相反，太咸就不会再加盐了；“太烫”“很贵”和加盐没有因果关系。' },
    { type: 'choice', q: 'Because the old bridge was <u>weak</u>, only one person was allowed to walk on it at a time. 划线词 weak 的意思是 ___。',
      options: ['不结实的', '很宽的', '刚修好的', '很漂亮的'], answer: 0,
      explain: '因果线索 because：因为桥 weak，所以一次只允许一个人走。限制人数是怕桥承受不住，说明桥“不结实”。“很宽的”“刚修好的”反而不需要限制人数；“很漂亮”和限制人数没有因果关系。' },
    { type: 'choice', q: 'Our new neighbour is friendly and <u>pleasant</u>. She always smiles and says hello to everyone. 划线词 pleasant 的意思是 ___。',
      options: ['和蔼可亲的', '冷淡的', '害羞的', '严厉的'], answer: 0,
      explain: '同义 / 并列线索：pleasant 和 friendly（友好的）用 and 并列，意思相近；下一句“她总是微笑着跟每个人打招呼”也印证了。“冷淡的”“害羞的”“严厉的”都和“见人就打招呼”矛盾。' },
    { type: 'choice', q: 'Unlike his brother, who spends all his pocket money as soon as he gets it, Peter is very <u>careful with money</u>. 划线部分的意思是 ___。',
      options: ['节俭的', '大方的', '懒惰的', '聪明的'], answer: 0,
      explain: '反义 / 对比线索 Unlike（和……不同）：哥哥一拿到零花钱就全花光，Peter 和他不一样，所以 Peter 是“节俭的”。“大方的”更接近哥哥那一面；“懒惰”“聪明”和花钱无关。' },
    { type: 'fill', q: 'He told a lie to his teacher. That was a <u>dishonest</u> thing to do. 根据构词法，dishonest = not ___。（填一个词）',
      answer: ['honest'],
      explain: '构词法：前缀 dis- 表示“不”，dishonest = dis + honest = not honest（不诚实的）。上下文“对老师撒谎”也印证了这一点。' },
    { type: 'choice', q: 'We had a picnic on the <u>bank</u> of the river and watched the boats go by. 这里 bank 的意思是 ___。',
      options: ['岸边', '银行', '长凳', '桥'], answer: 0,
      explain: '多义词：bank 最常见的意思是“银行”，但这里是 the bank of the river（河的 bank），还在上面野餐、看船经过，只能是“河岸”。按这一句的意思选，不按最熟悉的意思选。' },
    { type: 'choice', q: '"Tell me everything about your trip to Wuyi Mountain. I\'m <u>all ears</u>!" said Grandma. 划线部分的意思是 ___。',
      options: ['我在认真听', '我耳朵很疼', '我全都知道了', '我听不清楚'], answer: 0,
      explain: '习语不能按字面理解成“我全是耳朵”。奶奶前一句说“把你武夷山之行的事全告诉我”，接着说 I\'m all ears，意思是“我洗耳恭听、认真听着呢”。“全都知道了”就不用再让你讲了，前后矛盾。' },
    { type: 'choice', q: 'Mark usually gets to school at 7:30. Today he arrived at 8:10, out of breath, with his shirt wet from the rain. What can we infer?',
      options: ['Something made Mark late this morning.', 'Mark is always late for school.', 'Mark hates going to school.', 'Running in the rain is bad for your health.'], answer: 0,
      explain: '依据：平时 7:30 到，今天 8:10 才到，气喘吁吁、衬衫被雨淋湿。推一步：今天早上有什么事耽误了他。“总是迟到”用了 always，还和 usually gets to school at 7:30 矛盾；“讨厌上学”推过头了，文中没有依据；“淋雨跑步对身体不好”是常识，但文中没讲。' }
  ]
},

/* ================= 阅读还原：六选五 / 七选五 ================= */
{
  id: 's-reading-gap', title: '阅读还原（六选五 / 七选五补全短文）', short: '阅读还原', module: 'skill', grade: 9, freq: 3,
  prereqs: ['s-reading-main', 'g-conj'],
  tip: '阅读还原考的是理清上下文逻辑、把句子放回原位，最大陷阱是只凭一个相同的词“撞词”就选，而不检查空前空后的代词、关联词和意思是否都通顺（具体题量分值以当年《考试说明》为准）。',
  learn: [
    { h: '题型说明', html: `
      <p>一篇短文挖掉 5 个句子，给你一个句子库：</p>
      <ul>
        <li><b>六选五</b>：6 个句子填 5 个空，多出 <b>1 个</b>干扰项。</li>
        <li><b>七选五</b>：7 个句子填 5 个空，多出 <b>2 个</b>干扰项。</li>
      </ul>
      <p>以前的“阅读还原”也有把句子放回文中、或者给句子排序的形式，思路完全一样：<b>看位置、找线索、读通顺</b>。</p>
      <p>本站测试时，每个空给出 3–4 个候选句子让你选，方法和真实考试一样。</p>` },
    { h: '解题步骤', html: `
      <ol>
        <li><b>先读标题和每段第一句</b>，弄清文章在讲什么、分几个部分（很多文章是“总—分—总”或“问题—原因—办法”）。</li>
        <li><b>浏览句子库</b>，在每个句子里圈出代词（it, they, this, these）、关联词（but, so, also, for example）和关键名词。</li>
        <li><b>判断空格位置</b>：
          <ul>
            <li><b>段首</b>：常是主旨句，概括这一段，后面的句子都在解释它。</li>
            <li><b>段中</b>：承上启下，要和前一句、后一句<b>都</b>接得上。</li>
            <li><b>段尾</b>：常是总结、结果，或者引出下一段。</li>
          </ul></li>
        <li><b>用线索锁定答案</b>（见下表），先做有把握的空。</li>
        <li><b>全部填完代回通读</b>，检查多出来的句子是不是真的放不进任何一个空。</li>
      </ol>
      <div class="rhyme">先看首句定主线，再圈线索找关联；<br>段首主旨段尾结，段中前后两头连。</div>` },
    { h: '五大线索', html: `
      <table class="tbl">
        <tr><th>线索</th><th>怎么用</th><th>例子</th></tr>
        <tr><td>代词</td><td>选项里的 it / they / this / such 必须能在空前找到它指的东西；空后句子里的代词也要能指回空里的内容</td><td>空后是 “<b>They</b> may also catch colds.” → 空里要有复数的人</td></tr>
        <tr><td>关联词</td><td>but / however 转折；so / as a result 结果；also / besides 递进；for example 举例；first / second / finally 顺序</td><td>空前是 First...，空后是 Finally... → 空里很可能是 Second...</td></tr>
        <tr><td>复现词</td><td>同一个词、同义词、上下义词（fruit → apples）在空前后再次出现</td><td>空后讲 screens（屏幕），选项里有 phone</td></tr>
        <tr><td>问句</td><td>段中的问句后面，常跟着回答它的句子</td><td>Why is sleep important? → One reason is that...</td></tr>
        <tr><td>句式平行</td><td>小标题或段首句常常结构一样</td><td>Smile... / Join... / Be... → 都是祈使句</td></tr>
      </table>` },
    { h: '常见陷阱', html: `
      <p class="warn">撞词陷阱：选项里有和空前一样的词，看起来很像，但意思接不上。比如前文讲喝茶睡不着，干扰项“Tea is popular in Fujian.”也有 tea，却和“睡眠”无关。</p>
      <p class="warn">只看前不看后：段中的空，往往<b>空后那一句</b>才是关键。一定要“左顾右盼”。</p>
      <p class="warn">代词无所指：选项以 They / This / There 开头，但空前根本没有它能指的东西，这个选项就不能放在这里。</p>
      <p class="warn">把例子当主旨：段首空要选“概括性”的句子，而不是一个具体例子。</p>` },
    { h: '示范：两个空的思考过程', html: `
      <div class="passage"><p>Many people think pandas only eat bamboo. <span class="blank">(1)</span>______ In fact, they sometimes eat small animals and fruit. Pandas spend about 12 hours a day eating. <span class="blank">(2)</span>______ That's why they have to eat so much.</p>
      <p>A. But this is not completely true.<br>B. This is because bamboo gives them very little energy.<br>C. Pandas live in the mountains of China.</p></div>
      <p><b>第 (1) 空</b>：空后是 In fact（事实上），用来纠正前面的说法。所以空里应该是“这并不完全对”——选 A。A 里的 this 指前一句“熊猫只吃竹子”，代词也对上了。</p>
      <p><b>第 (2) 空</b>：空前说熊猫每天吃 12 小时，空后说 That's why they have to eat so much（这就是它们必须吃这么多的原因）。空里要给出“原因”——选 B（This is because...）。</p>
      <p><b>C 为什么多余</b>：C 讲熊猫住在哪儿，和“吃”这条主线无关，放进哪个空都接不上。</p>` }
  ],
  passages: {
    e1: { title: '例题短文：How to Keep a Pet Fish', html: `
      <p>Do you want to keep a pet fish? <span class="blank">(1)</span>______ First, choose a large bowl. A small bowl gets dirty very quickly. <span class="blank">(2)</span>______ Fresh water keeps your fish healthy. Third, don't give your fish too much food. Pet fish only need a little food once or twice a day. <span class="blank">(3)</span>______ If you follow these steps, your fish can live for many years.</p>
      <p><b>句子库：</b><br>
      A. It is easier than you might think.<br>
      B. Second, change part of the water every week.<br>
      C. Too much food will make the water dirty and the fish sick.<br>
      D. Pet fish come in many different colours.</p>` },
    e2: { title: '例题短文（六选四）：Be a Better Learner', html: `
      <p>Why do some students learn faster than others? <span class="blank">(1)</span>______ The good news is that anyone can build these habits.</p>
      <p><span class="blank">(2)</span>______ Before each class, spend ten minutes reading the new lesson. Mark the parts you don't understand, and pay special attention to them in class.</p>
      <p><b>Ask questions.</b> Many students are afraid to ask questions because they worry that others will laugh at them. <span class="blank">(3)</span>______ Most teachers are happy to help, and your classmates may have the same question.</p>
      <p><b>Review often.</b> Scientists have found that we forget about half of what we learn within a day. <span class="blank">(4)</span>______ Even ten minutes of review each evening can make a big difference.</p>
      <p><b>句子库：</b><br>
      A. Prepare for new lessons.<br>
      B. Usually it is not because they are cleverer, but because they have good learning habits.<br>
      C. But asking is the fastest way to clear up a problem.<br>
      D. That is why going over your notes often is so important.<br>
      E. Last night, Tom read Lesson 5 for ten minutes before bed.<br>
      F. Many scientists work in big labs.</p>` },
    p1: { title: 'Passage 1（六选五）: How to Make Friends at a New School', html: `
      <p>Starting at a new school can be scary. You walk into a classroom full of strangers, and everyone else seems to have friends already. <span class="blank">(1)</span>______ Here are some simple ways to help you.</p>
      <p><b>Smile and say hello.</b> A smile tells people that you are friendly and easy to talk to. <span class="blank">(2)</span>______ Even a simple "Hi, I'm Lily. Nice to meet you!" can start a conversation.</p>
      <p><b>Join a club or a team.</b> If you like drawing, join the art club. If you love sports, try out for the basketball team. <span class="blank">(3)</span>______ Because you already share a hobby, it will be easier to find something to talk about.</p>
      <p><b>Be a good listener.</b> Many people think they need to say something funny or clever to be liked. <span class="blank">(4)</span>______ When you ask about others and listen carefully to their answers, they will feel that you really care.</p>
      <p><b>Be patient.</b> Real friendship does not happen in one day. <span class="blank">(5)</span>______ Keep being yourself, and sooner or later you will find people who enjoy spending time with you.</p>
      <p><b>句子库：</b><br>
      A. However, most people actually prefer someone who listens.<br>
      B. Don't worry—making new friends is easier than you think.<br>
      C. There you will meet students who have the same interests as you.<br>
      D. It may take weeks or even months to get close to someone.<br>
      E. Don't wait for others to talk to you first; be brave and introduce yourself.<br>
      F. Homework is the most important thing at a new school.</p>` },
    p2: { title: 'Passage 2（七选五）: Sleep Well, Learn Well', html: `
      <p>Many middle school students don't get enough sleep. They stay up late to finish homework, play on their phones or watch videos. <span class="blank">(1)</span>______ Scientists say that teenagers need about 8 to 10 hours of sleep every night.</p>
      <p>Why is sleep so important? <span class="blank">(2)</span>______ While you are asleep, your brain sorts out what you learned during the day and stores it in your memory. That is why a good night's sleep before an exam is more useful than staying up all night.</p>
      <p>Too little sleep is also bad for your health and feelings. <span class="blank">(3)</span>______ They may also catch colds more easily because their bodies have less energy to fight illness.</p>
      <p>So how can you sleep better? First, try to go to bed and get up at the same time every day, even at weekends. <span class="blank">(4)</span>______ The blue light from screens tells your brain that it is still daytime, so it becomes harder to fall asleep. Finally, don't drink tea or coffee in the evening.</p>
      <p><span class="blank">(5)</span>______ Treat it as seriously as your homework, and you will find yourself healthier, happier and more energetic every day.</p>
      <p><b>句子库：</b><br>
      A. Second, put away your phone at least half an hour before bed.<br>
      B. Sleep is not a waste of time—it is an important part of learning.<br>
      C. As a result, they often feel sleepy in class the next morning.<br>
      D. Students who sleep too little are easily angry or upset.<br>
      E. One reason is that it helps you remember things.<br>
      F. Tea is one of the most popular drinks in Fujian.<br>
      G. Some students go to bed early and get up early.</p>` },
    p3: { title: 'Passage 3（七选五）: Save Water at Home', html: `
      <p>Fresh water makes up less than 3% of all the water on the earth, and much of it is frozen as ice. <span class="blank">(1)</span>______ Luckily, there are many simple ways to save water at home.</p>
      <p><span class="blank">(2)</span>______ A running tap wastes about 6 litres of water a minute. Turn it off while you brush your teeth or wash your hands, and turn it on only when you really need it.</p>
      <p><b>Repair broken taps quickly.</b> <span class="blank">(3)</span>______ A tap that loses one drop every second, for example, can waste thousands of litres a year. If you find a broken tap, tell your parents and get it repaired as soon as possible.</p>
      <p><b>Reuse water.</b> Don't pour away the water after washing vegetables or rice. <span class="blank">(4)</span>______ You can also use it to clean the floor or the toilet.</p>
      <p><span class="blank">(5)</span>______ If every family makes these small changes, together we can save lots of water for the future.</p>
      <p><b>句子库：</b><br>
      A. Turn off the tap.<br>
      B. So there is not much water that we can actually use.<br>
      C. It is perfect for watering flowers and plants.<br>
      D. Even a small problem with a tap can waste a lot of water.<br>
      E. Every drop of water counts.<br>
      F. My sister once left the tap running while she was on the phone.<br>
      G. Ice skating is a popular winter sport.</p>` }
  },
  examples: [
    { type: 'choice', passage: 'e1', q: '第 (1) 空应填入哪一句？',
      options: ['It is easier than you might think.', 'Second, change part of the water every week.', 'Pet fish come in many different colours.'], answer: 0,
      explain: '空前是问句“你想养宠物鱼吗？”，空后马上开始讲步骤 First...。中间需要一句承上启下的话：“这比你想的要容易”，引出下面的方法。Second 不能出现在 First 之前；颜色和养鱼方法无关。' },
    { type: 'choice', passage: 'e1', q: '第 (2) 空应填入哪一句？',
      options: ['Second, change part of the water every week.', 'Too much food will make the water dirty and the fish sick.', 'Pet fish come in many different colours.'], answer: 0,
      explain: '顺序线索：前面有 First，所以这里接 Second。复现线索：空后 Fresh water（干净的水）正好对应“每周换一部分水”。讲“喂太多食物”的句子要等后文提到喂食时才出现。' },
    { type: 'choice', passage: 'e1', q: '第 (3) 空应填入哪一句？',
      options: ['Too much food will make the water dirty and the fish sick.', 'It is easier than you might think.', 'Pet fish come in many different colours.'], answer: 0,
      explain: '空前讲“别喂太多，一天一两次就够”，空里应该解释原因：食物太多会弄脏水、让鱼生病。复现词 food 前后呼应，而且意思也真的接得上，不是单纯撞词。' },
    { type: 'choice', passage: 'e2', q: '第 (1) 空应填入哪一句？',
      options: ['Usually it is not because they are cleverer, but because they have good learning habits.', 'But asking is the fastest way to clear up a problem.', 'Last night, Tom read Lesson 5 for ten minutes before bed.'], answer: 0,
      explain: '问句线索：空前问“为什么有些学生学得更快？”，空里应该回答原因。代词线索：空后 anyone can build these habits 里的 these habits 必须在空里找到所指——只有“因为他们有好的学习习惯”提到了 habits。讲“提问”的句子以 But 开头，前面没有可转折的内容；Tom 的句子是一个具体例子，Tom 前文也没出现过。' },
    { type: 'choice', passage: 'e2', q: '第 (2) 空应填入哪一句？',
      options: ['Prepare for new lessons.', 'Last night, Tom read Lesson 5 for ten minutes before bed.', 'That is why going over your notes often is so important.'], answer: 0,
      explain: '句式平行线索：后两段的开头是 Ask questions. 和 Review often.，都是简短的祈使句小标题，所以这一段开头也应该是同样结构的小标题。段首主旨：空后讲“课前花十分钟读新课、标出不懂的地方”，概括起来就是“为新课做好准备”（预习）。Tom 的句子是“把例子当主旨”的陷阱：它只是一个具体例子，不能概括全段；而且这里是给读者的建议，不是讲 Tom 的故事。' },
    { type: 'choice', passage: 'e2', q: '第 (3) 空应填入哪一句？',
      options: ['But asking is the fastest way to clear up a problem.', 'Many scientists work in big labs.', 'Usually it is not because they are cleverer, but because they have good learning habits.'], answer: 0,
      explain: '要“左顾右盼”：空前说很多学生怕被笑话而不敢提问，空后说老师很乐意帮忙、同学也可能有同样的问题——都是在劝人去问。空里用 But 转折：“但提问是解决问题最快的办法”，前后都接得上。科学家的句子和提问无关。' },
    { type: 'choice', passage: 'e2', q: '第 (4) 空应填入哪一句？',
      options: ['That is why going over your notes often is so important.', 'Many scientists work in big labs.', 'Prepare for new lessons.'], answer: 0,
      explain: '撞词陷阱：空前有 Scientists，“很多科学家在大实验室工作”也有 scientists，但意思接不上。正确的思路：空前说“一天之内会忘掉一半”，空里用 That is why（这就是为什么）引出结论“经常复习笔记很重要”；空后 Even ten minutes of review 里的 review 正好和 going over your notes 复现。' },
    { type: 'fill', q: '七选五：7 个句子填 5 个空，会多出 ___ 个干扰项。（填阿拉伯数字）',
      answer: ['2', 'two'],
      explain: '7 − 5 = 2。七选五有 2 个用不上的干扰项，六选五只有 1 个。知道有几个干扰项，最后检查时就能核对：多出来的句子是不是真的放不进任何空。' },
    { type: 'choice', q: '拿到一篇阅读还原，第一步最好先做什么？',
      options: ['先读标题和每段第一句，弄清文章讲什么、分几部分', '直接从第 (1) 空开始，逐个试选项', '先把句子库里的生词全部查清楚'], answer: 0,
      explain: '先读标题和段首句，能很快知道全文主线和结构（如“总—分—总”或“问题—原因—办法”），之后判断每个空该放什么就有方向了。一上来逐个试选项容易被撞词迷惑；考场上也没法查生词。' },
    { type: 'choice', q: '短文：Eating healthy snacks between classes gives you energy. ______ Apples, bananas and oranges are all easy to carry. 空里最适合填哪一句？',
      options: ['Fruit is one of the best choices.', 'Bananas grow well in hot places.', 'Many students don\'t like getting up early.'], answer: 0,
      explain: '复现线索里的“上下义词”：空后的 apples, bananas, oranges 都属于 fruit（水果），空里用上位词 fruit 先概括，后面再举具体的水果，衔接自然。香蕉那句是撞词陷阱，虽然有 bananas，但讲的是香蕉生长的地方，和“课间吃什么零食”无关。' },
    { type: 'choice', q: '短文：Last month our class planted 30 trees on the hill behind our school. Everyone worked hard, digging holes and carrying water. ______（段尾）下一段开头：The next week, we went back to water the trees. 空里最适合填哪一句？',
      options: ['By the end of the day, all the trees were standing in neat lines.', 'Trees give us fresh air and shade.', 'They were too heavy to carry up the hill.'], answer: 0,
      explain: '段尾空常是总结或结果：前面讲大家挖坑、浇水，空里交代“到傍晚，所有树都整整齐齐地种好了”，下一段再讲一周后回去浇水，顺理成章。“树能给我们新鲜空气”是常识，和这段叙事接不上；They 指树的话，“树太重搬不上山”和“已经种好了 30 棵树”矛盾。' },
    { type: 'choice', q: '短文：______（段首）For example, you can turn off the lights when you leave a room. You can also walk or ride a bike instead of going by car. Even small changes like these can help. 空里最适合填哪一句？',
      options: ['There are many easy ways to protect the environment in daily life.', 'My father drives to work every day.', 'Bikes are cheaper than cars.'], answer: 0,
      explain: '段首空要选能概括全段的主旨句：后面用 For example 举了“随手关灯”“步行或骑车代替开车”两个例子，都是日常生活中保护环境的办法，所以段首应该说“日常生活中有很多简单的环保办法”。“爸爸每天开车上班”只是一个具体情况，不能概括全段，而且和后文的建议正好相反；“自行车比汽车便宜”只和其中一个例子有关，也概括不了全段。' },
    { type: 'choice', q: '短文：My uncle has a small farm in the countryside. ______ They give us fresh eggs every morning. 空里最适合填哪一句？',
      options: ['He keeps about fifty hens there.', 'It is far away from the city.', 'They are very kind to everyone.'], answer: 0,
      explain: '代词线索要两头看。空后 They give us fresh eggs（它们每天给我们新鲜鸡蛋）里的 They 必须指空里的复数事物——只有 fifty hens（五十只母鸡）能下蛋。“离城市很远”里的 It 指农场没问题，但填进去后，后面的 They 就找不到所指了。“They are very kind”的 They 在空前也找不到所指：前面只有 my uncle 一个人，是单数。' },
    { type: 'choice', q: '短文：Riding a bike to school has many advantages. First, it is good for your health. ______ Besides, you don\'t need to wait for the bus in the morning. 空里最适合填哪一句？',
      options: ['It is also cheap and doesn\'t pollute the air.', 'However, riding a bike is bad for your health.', 'For example, my bike is red.'], answer: 0,
      explain: '关联词线索：本段讲骑车上学的好处，空前 First 说有益健康，空后 Besides（此外）再补充一个好处。中间也应该是递进关系，also（也）正好继续列好处：便宜、不污染空气。However 表转折，而且和前一句意思矛盾；For example 后面应该举例说明好处，“我的车是红色的”算不上好处。' },
    { type: 'choice', q: '一篇七选五里，第 (2) 空前后线索不多；第 (4) 空前面有 First 和 Second，空后是 Finally。你最好先做哪个空？',
      options: ['先做第 (4) 空，因为 First / Second / Finally 这条顺序线索很明显', '必须从第 (1) 空开始，一个一个按顺序做', '先做线索最少、最难的第 (2) 空'], answer: 0,
      explain: '解题步骤：先做有把握的空。第 (4) 空有明显的顺序线索，很快就能锁定 Third... 之类的句子。先把容易的空做完，句子库里剩下的选项就少了，难的空也更容易判断。死守顺序或者先啃最难的空，都容易浪费时间。' },
    { type: 'choice', q: '小明做完一篇六选五，代回通读时发现：第 (3) 空填的句子以 They 开头，可空前只提到 my grandfather 一个人。他应该怎么做？',
      options: ['重新考虑这一空，换一个和前后都接得上的句子，并检查被换下的句子放在哪里', '不用管，选好了就不改', '把 They 当成 grandfather 的意思，不影响'], answer: 0,
      explain: '“全部填完代回通读”就是为了发现这类问题：They 是复数，不能指 my grandfather 一个人，说明这一空选错了。要换一个前后都通顺的句子，同时看看换下来的句子是不是该放到别的空，或者是干扰项。' }
  ],
  tests: [
    { type: 'choice', passage: 'p1', q: '第 (1) 空应填入哪一句？',
      options: ['Don\'t worry—making new friends is easier than you think.', 'Homework is the most important thing at a new school.', 'However, most people actually prefer someone who listens.', 'There you will meet students who have the same interests as you.'], answer: 0,
      explain: '空前讲新学校让人害怕，空后说 Here are some simple ways to help you（下面是一些简单方法）。空里要安慰读者并引出方法：“别担心，交朋友比你想的容易”。作业与主题无关；However 句讲“倾听”，接不上；There 在这里没有可指的地方。' },
    { type: 'choice', passage: 'p1', q: '第 (2) 空应填入哪一句？',
      options: ['Don\'t wait for others to talk to you first; be brave and introduce yourself.', 'There you will meet students who have the same interests as you.', 'It may take weeks or even months to get close to someone.', 'Homework is the most important thing at a new school.'], answer: 0,
      explain: '本段小标题是 Smile and say hello。空后的例子 "Hi, I\'m Lily. Nice to meet you!" 正是“主动介绍自己”，所以选“别等别人先开口，勇敢地介绍自己”。Even a simple “Hi...” 中的 Even 表示“哪怕只是一句简单的问候”，与“勇敢介绍自己”前后衔接。' },
    { type: 'choice', passage: 'p1', q: '第 (3) 空应填入哪一句？',
      options: ['There you will meet students who have the same interests as you.', 'However, most people actually prefer someone who listens.', 'It may take weeks or even months to get close to someone.'], answer: 0,
      explain: '代词线索：There 指前面说的 art club 和 basketball team。复现线索：空后 Because you already share a hobby（你们已经有共同爱好）对应 the same interests（相同的兴趣）。“需要几周几个月”和空后“更容易找到话题”意思相反。' },
    { type: 'choice', passage: 'p1', q: '第 (4) 空应填入哪一句？',
      options: ['However, most people actually prefer someone who listens.', 'Don\'t wait for others to talk to you first; be brave and introduce yourself.', 'Homework is the most important thing at a new school.'], answer: 0,
      explain: '本段小标题是 Be a good listener。空前说“很多人以为要说些有趣、聪明的话才受欢迎”，空里用 However 转折：其实大多数人更喜欢会倾听的人。空后讲“问别人的事、认真听”，意思接得上。' },
    { type: 'choice', passage: 'p1', q: '第 (5) 空应填入哪一句？',
      options: ['It may take weeks or even months to get close to someone.', 'Homework is the most important thing at a new school.', 'There you will meet students who have the same interests as you.'], answer: 0,
      explain: '本段小标题是 Be patient（要有耐心），空前说“真正的友谊不是一天形成的”。空里接着说“和别人变亲近可能要几周甚至几个月”，意思一致。There 在这一段没有可指的地方；作业句是全文多余的干扰项。' },
    { type: 'choice', passage: 'p2', q: '第 (1) 空应填入哪一句？',
      options: ['As a result, they often feel sleepy in class the next morning.', 'One reason is that it helps you remember things.', 'Second, put away your phone at least half an hour before bed.', 'Tea is one of the most popular drinks in Fujian.'], answer: 0,
      explain: '空前说学生熬夜写作业、玩手机、看视频，空里用 As a result 说结果：第二天上课犯困。they 指前面的 students。One reason 前面需要有问“为什么”；Second 前面需要有 First；茶的句子和这里无关。' },
    { type: 'choice', passage: 'p2', q: '第 (2) 空应填入哪一句？',
      options: ['One reason is that it helps you remember things.', 'Some students go to bed early and get up early.', 'Second, put away your phone at least half an hour before bed.', 'Tea is one of the most popular drinks in Fujian.'], answer: 0,
      explain: '问句线索：空前问 Why is sleep so important?，空里应给出原因 One reason is that...。空后又讲大脑在睡眠中整理、储存记忆，正好解释 remember things。' },
    { type: 'choice', passage: 'p2', q: '第 (3) 空应填入哪一句？',
      options: ['Students who sleep too little are easily angry or upset.', 'Some students go to bed early and get up early.', 'Sleep is not a waste of time—it is an important part of learning.'], answer: 0,
      explain: '段首句说睡得太少对健康和情绪（feelings）都不好。空里讲情绪：睡得少的学生容易生气、烦躁。空后 They may also catch colds 中的 They 要指“睡得少的学生”，also 表示再补充一个健康问题。早睡早起的学生不会因缺觉而感冒，接不上。' },
    { type: 'choice', passage: 'p2', q: '第 (4) 空应填入哪一句？',
      options: ['Second, put away your phone at least half an hour before bed.', 'As a result, they often feel sleepy in class the next morning.', 'Tea is one of the most popular drinks in Fujian.'], answer: 0,
      explain: '顺序线索：空前 First，空后 Finally，中间是 Second。复现线索：空后讲 The blue light from screens（屏幕的蓝光），对应 phone。茶的句子是撞词陷阱：后面 Finally 句虽然提到 tea，但讲的是“晚上别喝茶”，不是“茶很受欢迎”。' },
    { type: 'choice', passage: 'p2', q: '第 (5) 空应填入哪一句？',
      options: ['Sleep is not a waste of time—it is an important part of learning.', 'Students who sleep too little are easily angry or upset.', 'Some students go to bed early and get up early.'], answer: 0,
      explain: '段尾总结：最后一段是全文结论。空后 Treat it as seriously as your homework 里的 it 指“睡眠”，所以空里要以 sleep 为话题并作总结：睡眠不是浪费时间，而是学习的重要部分。其他两句的 it 都对不上。' },
    { type: 'choice', passage: 'p3', q: '第 (1) 空应填入哪一句？',
      options: ['So there is not much water that we can actually use.', 'Ice skating is a popular winter sport.', 'My sister once left the tap running while she was on the phone.', 'It is perfect for watering flowers and plants.'], answer: 0,
      explain: '空前说淡水不到 3%，而且很多还冻成了冰；空里用 So 得出结果：我们真正能用的水并不多。空后 Luckily（幸运的是）引出节水办法，也顺。滑冰那句是撞词陷阱（ice），意思完全无关；姐姐忘关水龙头是一个具体例子，前文还没讲到用水习惯，接不上；It is perfect for watering flowers 里的 It 在这里找不到所指。' },
    { type: 'choice', passage: 'p3', q: '第 (2) 空应填入哪一句？',
      options: ['Turn off the tap.', 'My sister once left the tap running while she was on the phone.', 'Even a small problem with a tap can waste a lot of water.'], answer: 0,
      explain: '句式平行：后面两段的小标题是 Repair broken taps quickly. 和 Reuse water.，都是祈使句，所以这里也要一个祈使句小标题。段首主旨：本段讲水龙头开着浪费水、刷牙洗手时要关掉，概括就是“关掉水龙头”；空后 Turn it off 里的 it 也指 the tap。“姐姐打电话时没关水龙头”只是一个具体例子，不能当段首主旨句。' },
    { type: 'choice', passage: 'p3', q: '第 (3) 空应填入哪一句？',
      options: ['Even a small problem with a tap can waste a lot of water.', 'It is perfect for watering flowers and plants.', 'My sister once left the tap running while she was on the phone.'], answer: 0,
      explain: '本段小标题是 Repair broken taps quickly（及时修理坏了的水龙头）。空后 A tap that loses one drop every second, for example（比如一个每秒滴一滴水的水龙头）是举例，说明空里应该是被举例说明的概括句：“水龙头哪怕有一点小毛病，也会浪费很多水”。a small problem with a tap（水龙头的小毛病）和“每秒滴一滴的龙头”是概括与具体的复现。浇花那句的 It 在这一段指不到东西；姐姐那句讲的是忘关水龙头，不是龙头坏了。' },
    { type: 'choice', passage: 'p3', q: '第 (4) 空应填入哪一句？',
      options: ['It is perfect for watering flowers and plants.', 'Ice skating is a popular winter sport.', 'Turn off the tap.'], answer: 0,
      explain: '代词 + 递进线索：空前说“洗菜洗米的水别倒掉”，空里 It 指这些水，“用来浇花很合适”；空后 You can also use it to... 中的 also 表示“还可以”，说明空里已经讲过一种用法。“关掉水龙头”是另一段的小标题，接不上。' },
    { type: 'choice', passage: 'p3', q: '第 (5) 空应填入哪一句？',
      options: ['Every drop of water counts.', 'My sister once left the tap running while she was on the phone.', 'So there is not much water that we can actually use.'], answer: 0,
      explain: '最后一段是全文总结。空后说“如果每个家庭都做出这些小改变，我们就能省下大量的水”，空里用“每一滴水都很重要”作为结论句最合适。姐姐那句是具体例子，放在结尾不能总结全文；So 那句是第一段讲“淡水少”的结果，放在这里前面没有原因。' },
    { type: 'fill', q: '六选五：6 个句子填 5 个空，会多出 ___ 个干扰项。（填阿拉伯数字）',
      answer: ['1', 'one'],
      explain: '6 − 5 = 1。六选五只有 1 个干扰项，七选五有 2 个。' },
    { type: 'choice', q: '阅读还原中，先读标题和每段第一句，主要是为了 ___。',
      options: ['弄清文章的主题和结构，判断每个空大概该放什么', '把文章里的生词都找出来', '数一数文章有多少段'], answer: 0,
      explain: '标题和段首句往往能告诉你全文讲什么、按什么顺序讲（总—分—总、问题—原因—办法等），有了主线，判断空里该放主旨句、例子还是结论就容易多了。' },
    { type: 'choice', q: '做阅读还原时，有一个空看了两遍还拿不准，最好怎么做？',
      options: ['先做有把握的空，最后用剩下的选项代入这个空检查', '随便选一个，不再回头看', '把每个选项都填进这个空，选读起来最长的那个'], answer: 0,
      explain: '先做有把握的空，能排除掉一些选项，剩下的选择就少了；最后再代回通读，看是否前后都接得上。随便选、不检查容易错；“选最长的”没有任何依据。' },
    { type: 'choice', q: '五个空都填完以后，最好做什么？',
      options: ['把选好的句子放回原文通读一遍，确认多出来的句子确实放不进任何空', '马上做下一大题，不再看了', '数一数每个选项被选了几次就行'], answer: 0,
      explain: '“全部填完代回通读”是最后一步：读一遍检查前后衔接（代词、关联词、意思），再确认干扰项真的放不进任何空。只数选项次数，发现不了意思上的错误。' },
    { type: 'choice', q: '一篇文章给出三条建议，小标题是：Eat breakfast every day. / ______ / Go to bed early. 哪一句最适合做中间的小标题？',
      options: ['Exercise for 30 minutes a day.', 'Exercising is what my friend loves most.', 'My cousin runs in the park every morning.'], answer: 0,
      explain: '句式平行：另外两个小标题都是“动词原形开头的祈使句”，中间的也应该一样，选 Exercise for 30 minutes a day.。“我朋友最爱运动”不是建议；“表哥每天早上跑步”只是一个具体例子，不能当小标题（把例子当主旨的陷阱）。' },
    { type: 'choice', q: '短文：Our school library has a lot of interesting books. ______ Detective stories, funny stories and fairy tales are the most popular. 空里最适合填哪一句？',
      options: ['Story books are the students\' favourite.', 'Fairy tales are often told to small children before bed.', 'The library opens at 8 a.m.'], answer: 0,
      explain: '上下义复现：空后的侦探故事、趣味故事、童话都属于 story books（故事书）这一类，空里先说“故事书最受学生欢迎”，空后再具体说哪几种最受欢迎，衔接自然。童话那句是撞词陷阱，虽然有 fairy tales，但讲的是“睡前给小孩讲童话”，和图书馆借书无关；开馆时间也接不上。' }
  ]
},

/* ================= 任务型阅读 ================= */
{
  id: 's-task-reading', title: '任务型阅读（回答问题、信息转换）', short: '任务型阅读', module: 'skill', grade: 9, freq: 3,
  prereqs: ['s-reading-infer', 'g-sentence-elements'],
  tip: '任务型阅读考的是按要求从文中找信息并用简短正确的英语写出来，最大陷阱是照抄原文却没改人称、时态、词形，或者超出字数、答非所问（具体题量分值以当年《考试说明》为准）。',
  learn: [
    { h: '题型说明', html: `
      <p>任务型阅读不给选项，要你<b>自己写答案</b>。常见任务有：</p>
      <table class="tbl">
        <tr><th>任务</th><th>样子</th><th>答案形式</th></tr>
        <tr><td>回答问题</td><td>Why does...? How long...?</td><td>关键词或完整句</td></tr>
        <tr><td>填表 / 信息转换</td><td>表格、思维导图里挖空</td><td>1–3 个词，常要变词形</td></tr>
        <tr><td>找主题句 / 概括</td><td>“第二段的主题句是哪句？”“给文章加标题”</td><td>抄原句或写短语</td></tr>
        <tr><td>同义句转换</td><td>用另一种说法改写原文句子</td><td>填词</td></tr>
        <tr><td>判断正误 / 翻译</td><td>T / F；划线句译成中文</td><td>T 或 F；中文句子</td></tr>
      </table>
      <p>题目一般会规定字数，比如“每空不超过 3 个词”“用不超过 5 个词回答”，<b>一定要看清</b>。</p>` },
    { h: '解题步骤', html: `
      <ol>
        <li><b>先看任务，再读文章</b>：带着问题读，效率最高。</li>
        <li><b>圈问题关键词</b>，判断要找哪类信息：When → 时间，Where → 地点，Why → 原因，How many → 数字，How long → 时长，What... think of → 看法。</li>
        <li><b>回原文定位</b>：答案大多藏在和问题“长得像”的句子里，但要注意同义替换（quickly ↔ fast）。</li>
        <li><b>截取并改造</b>：
          <ul>
            <li>人称：原文 I / my → 答案里换成 he / his（或 she / her）。</li>
            <li>时态：问题用什么时态，答案就用什么时态。</li>
            <li>词形：填表的空常要名词或和同列其他格子一致的形式（different → difference，-ing 对 -ing）。</li>
          </ul></li>
        <li><b>检查</b>：字数、拼写、大小写、单复数。</li>
      </ol>
      <div class="rhyme">先看题再看文，关键词里藏原文；<br>人称时态词形变，字数拼写最后看。</div>` },
    { h: '完整句还是关键词？', html: `
      <p>真实考试里，<b>按题目要求作答</b>：</p>
      <ul>
        <li>题目说“用完整句回答”：一定要写主语 + 谓语的完整句子，开头大写、结尾加句号。</li>
        <li>题目只限字数（如“不超过 5 个词”）：写<b>关键词/短语</b>即可，写完整句反而可能超字数。</li>
        <li>没有特别说明时，写<b>简洁的完整句</b>最稳妥。</li>
      </ul>
      <table class="tbl">
        <tr><th>问题</th><th>关键词答法</th><th>完整句答法</th></tr>
        <tr><td>How does Tom go to school?</td><td>By bike.</td><td>He goes to school by bike.</td></tr>
        <tr><td>Why did she get up early?</td><td>To catch the first bus.</td><td>Because she wanted to catch the first bus.</td></tr>
        <tr><td>How many people came?</td><td>About 300.</td><td>About 300 people came.</td></tr>
      </table>
      <p class="warn">本站测试是自动判分，只检查关键词，所以测试里你只需要填关键词（不用写完整句）。但到了真实考试，记得按题目要求写。</p>` },
    { h: '常见陷阱', html: `
      <p class="warn">超字数：限 3 个词就不要写 4 个，a / the 也算一个词。</p>
      <p class="warn">照抄不改人称：原文 “I love my hometown.” 问 What does the writer love? 要答 His / Her hometown，不能答 my hometown。</p>
      <p class="warn">时态不一致：问 What did he do?，答案动词要用过去式。</p>
      <p class="warn">答非所问：问 Why 却写了一个时间；问 How long 却写了 at 5 o'clock。</p>
      <p class="warn">填表形式不统一：同一列别人都是名词，你填了形容词或动词。</p>` },
    { h: '示范：信息转换', html: `
      <div class="passage"><p>Li Hua's school held a sports meeting last Friday. More than 500 students took part in it. Li Hua won first place in the 800-metre race. He was very happy because he had practised for three months.</p></div>
      <table class="tbl">
        <tr><th>Event</th><td>A sports meeting</td></tr>
        <tr><th>Time</th><td>Last (1) ______</td></tr>
        <tr><th>Number of students</th><td>(2) ______ 500</td></tr>
        <tr><th>Li Hua's result</th><td>(3) ______ in the 800-metre race</td></tr>
        <tr><th>Reason for his success</th><td>Three months of (4) ______</td></tr>
      </table>
      <p>(1) 找时间：last Friday → <b>Friday</b>（表格已给 Last，只填 Friday）。</p>
      <p>(2) 原文 More than 500 → 填 <b>More than</b>（也可写 Over）。</p>
      <p>(3) 原文 won first place → 表格要的是“结果”，填 <b>First place</b>。</p>
      <p>(4) 原文 he had practised for three months → 前面有 of，后面要名词或动名词：<b>practice</b>（名词）或 <b>practising</b>。这就是“词形转换”。</p>` }
  ],
  passages: {
    e1: { title: '例题短文：Tom in Xiamen', html: `
      <p>My name is Tom. I come from Canada, but now I live in Xiamen with my parents. My father teaches at a university there. I study at No. 1 Middle School. I go to school by bike every day because it is only ten minutes away. My favourite subject is Chinese. I think it is difficult but interesting.</p>` },
    e2: { title: '例题短文：Lucy\'s Summer Job', html: `
      <p>Hi, I'm Lucy. Last summer, I worked at a pet shop near my home for six weeks. Every morning, I fed the dogs and cleaned their cages. At first, I found the work tiring, and I often wanted to stay in bed. But soon I began to enjoy it. The happiest moment came when a little girl took home a little dog that I had looked after for a month. <u>This experience taught me that hard work can bring real happiness.</u></p>
      <table class="tbl">
        <tr><th colspan="2">Lucy's Summer Job</th></tr>
        <tr><td>Place</td><td>A pet shop near her home</td></tr>
        <tr><td>Length of time</td><td>Six (1) ______</td></tr>
        <tr><td>Daily work</td><td>Feeding the dogs and (2) ______ their cages</td></tr>
      </table>` },
    p1: { title: 'Passage 1: The Girl from the Tea Hills', html: `
      <p>Chen Mei is a 15-year-old girl from Anxi, a county in Fujian famous for its tea. Her grandparents have grown tea on the hills for more than forty years.</p>
      <p>Every spring, Chen Mei goes to the tea garden with her grandmother. They get up at five o'clock in the morning, because they want to finish picking before the sun gets too hot. Her grandmother can pick tea leaves twice as fast as Chen Mei. "You need quick hands and a patient heart," she always says.</p>
      <p>After picking, the leaves are not ready to drink yet. There are several steps: they have to be dried, pressed and heated again and again. All the steps take almost two days. Chen Mei's grandfather looks after this part, and he never lets anyone else touch the fire.</p>
      <p>Last year, Chen Mei started a short-video account to introduce her family's tea. In her videos, she shows how tea is made and teaches people how to make a good cup of tea. To her surprise, more than 10,000 people have followed her account. Some of them have even come to Anxi to visit the tea garden.</p>
      <p>"Tea is not only a drink," Chen Mei says. "It is a part of our hometown's culture. I hope more young people will learn about it."</p>` },
    p2: { title: 'Passage 2: Volunteers Wanted!', html: `
      <p>Do you want to make your summer holiday meaningful? Sunshine Community Center in Fuzhou is looking for student volunteers.</p>
      <p><b>What will you do?</b> You will help the old people who live alone in our community. You can read newspapers to them, teach them how to use smartphones, or simply chat with them.</p>
      <p><b>When?</b> Every Saturday morning from 9:00 to 11:30, from July 12th to August 23rd.</p>
      <p><b>Who can join?</b> Students aged 13 to 18. You should be friendly and patient. If you can speak the local language of Fuzhou, that will be a plus, because many old people here don't speak Mandarin well.</p>
      <p><b>How to join?</b> Fill in a form at the center's office on Wuyi Road before July 5th.</p>
      <p>Every volunteer will get a gift at the end of the activity. Come and join us—your smile can light up someone's day!</p>
      <table class="tbl">
        <tr><th colspan="2">Sunshine Community Center: Summer Volunteers</th></tr>
        <tr><td>Job</td><td>Helping old people who live (6) ______</td></tr>
        <tr><td>Time</td><td>Every (7) ______ morning, 9:00–11:30</td></tr>
        <tr><td>Age</td><td>From 13 to (8) ______</td></tr>
        <tr><td>A plus</td><td>Being able to speak the local (9) ______ of Fuzhou</td></tr>
        <tr><td>Reward</td><td>A (10) ______ at the end of the activity</td></tr>
      </table>` },
    p3: { title: 'Passage 3: My First Time Cooking for My Family', html: `
      <p>Last Sunday was my mother's birthday. I decided to cook dinner for my family for the first time. I had watched my grandmother cook many times, but I had never done it myself.</p>
      <p>In the morning, I went to the market with my dad and bought some fish, tomatoes and eggs. Then I spent two hours in the kitchen. Things did not go smoothly. I burned the first fish because I forgot to turn down the fire. I was so upset that I nearly gave up. My dad said, "Everyone makes mistakes. Try again." So I cooked another one, and this time it was perfect.</p>
      <p>At six o'clock, dinner was ready. My mother was very surprised. She said it was the best birthday present she had ever received. <u>Seeing her happy smile, I felt that all my hard work was worth it.</u></p>
      <p>Now I cook for my family once a week. Cooking has taught me to be patient and careful.</p>
      <p style="text-align:right">— Lin Tao (a boy in Grade 9)</p>` }
  },
  examples: [
    { type: 'fill', passage: 'e1', q: 'How does Tom go to school?（用 1–3 个词回答关键词）',
      answer: ['by bike', 'by bicycle', 'on a bike', 'on his bike', 'rides a bike', 'rides his bike', 'rides a bicycle', 'by bike daily'],
      explain: '定位 I go to school by bike every day。关键词是 by bike。真实考试若要求完整句，要把人称 I 改成 He、动词加 -es：He goes to school by bike.' },
    { type: 'fill', passage: 'e1', q: 'Why does Tom go to school by bike? — Because it is only ten minutes ___.（填一个词）',
      answer: ['away'],
      explain: 'Why 问原因，原文 because 后面就是答案：because it is only ten minutes away。注意“离这里十分钟路程”是 ten minutes away。' },
    { type: 'fill', passage: 'e1', q: 'What does Tom think of Chinese? — It is difficult ___ interesting.（填一个连词）',
      answer: ['but'],
      explain: '原文 I think it is difficult but interesting。“难”和“有趣”一个偏负面一个偏正面，用表示转折的 but 连接。完整句：He thinks it is difficult but interesting.（人称 I → He，think → thinks）' },
    { type: 'fill', passage: 'e2', q: '完成表格第 (1) 空：Length of time — Six ___（填一个词）',
      answer: ['weeks'],
      explain: '信息转换：表格问时长，原文 I worked at a pet shop ... for six weeks。表格已经给了 Six，只填 weeks。注意 six 后面要用复数 weeks。' },
    { type: 'fill', passage: 'e2', q: '完成表格第 (2) 空：Daily work — Feeding the dogs and ___ their cages（填一个词）',
      answer: ['cleaning'],
      explain: '原文是 I fed the dogs and cleaned their cages。表格同一格里前面用的是 Feeding（-ing 形式），and 连接的两部分形式要统一，所以 cleaned 要改成 cleaning。这就是“填表形式统一”和“词形转换”。' },
    { type: 'fill', passage: 'e2', q: 'What did Lucy do every morning? — She ___ the dogs and cleaned their cages.（填一个词）',
      answer: ['fed'],
      explain: '时态一致：问题用 did，问的是过去的事，答案动词要用过去式。原文 I fed the dogs，feed 的过去式是不规则的 fed。人称也要改：I → She。' },
    { type: 'fill', passage: 'e2', q: 'What did the experience teach Lucy? — It taught ___ that hard work can bring real happiness.（填一个词）',
      answer: ['her'],
      explain: '人称转换：原文 This experience taught me...，问题是关于 Lucy 的，答案里 me 要换成 her（taught 后面作宾语，用宾格 her）。照抄 me 就错了。' },
    { type: 'fill', passage: 'e2', q: '同义句转换：At first, Lucy found the work tiring. = At the ___, Lucy found the work tiring.（填一个词）',
      answer: ['beginning', 'start'],
      explain: 'at first（起初）= at the beginning / at the start。同义句转换要先弄懂原句意思，再换一种说法表达同样的意思。' },
    { type: 'choice', passage: 'e2', q: '判断正误：Lucy enjoyed the job from the very first day.',
      options: ['F（错误）', 'T（正确）'], answer: 0,
      explain: '原文 At first, I found the work tiring, and I often wanted to stay in bed. But soon I began to enjoy it.——一开始她觉得累，后来才开始喜欢。题目说“从第一天就喜欢”，和原文不符，判 F。判断题常在“时间、程度”上做手脚，要逐字核对。' },
    { type: 'choice', passage: 'e2', q: '将文中划线句译成中文，最恰当的是 ___。',
      options: ['这次经历让我明白，努力工作能带来真正的快乐。', '这次实验教会我如何努力工作。', '这次经历告诉我，快乐的人工作更努力。', '这份工作很辛苦，但是很快乐。'], answer: 0,
      explain: 'experience 在这里是“经历”，不是 experiment（实验）；taught me that... 是“让我明白……”；hard work can bring real happiness 是“努力工作能带来真正的快乐”，主语是 hard work，不能把因果说反成“快乐的人工作更努力”。翻译要每个部分都对上。' },
    { type: 'choice', passage: 'e2', q: 'Which is the best title for the passage?',
      options: ['My Summer Job at a Pet Shop', 'How to Choose a Pet Dog', 'A Little Girl\'s New Home', 'Why Dogs Are Good Pets'], answer: 0,
      explain: '概括标题要覆盖全文：全文讲 Lucy 暑假在宠物店打工的经历和收获。“小女孩的新家”只是其中一个细节；“怎么选小狗”“为什么狗是好宠物”文中都没讲。' },
    { type: 'choice', q: '原文：Mike went to the library because he wanted to borrow a book about space. 题目：Why did Mike go to the library?（用不超过 6 个词回答）下面哪个答案最好？',
      options: ['To borrow a book about space.', 'Because he wanted to borrow a book about space.', 'In the afternoon.', 'Because I wanted to borrow a book.'], answer: 0,
      explain: 'To borrow a book about space. 正好 6 个词，回答了原因。because 那句意思对，但有 9 个词，超字数；In the afternoon 是时间，答非所问；最后一项没把 I 改成 he，人称错了。' },
    { type: 'choice', q: '原文：The concert started at 7 p.m. and lasted for two hours. 题目：How long did the concert last? 下面哪个答案正确？',
      options: ['Two hours.', 'At 7 p.m.', 'In the evening.', 'Very well.'], answer: 0,
      explain: '先看疑问词：How long 问“多长时间”（时长），要答一段时间：two hours。At 7 p.m. 和 In the evening 是时间点，回答的是 When；Very well 回答的是 How。原文里几个信息挨在一起，最容易抄错，这就是“答非所问”。' },
    { type: 'fill', q: '原文：Buses to the airport leave from the station every twenty minutes. 题目：How often does the airport bus go?（用不超过 3 个词回答）',
      answer: ['every twenty minutes', 'every 20 minutes'],
      explain: '同义替换定位：题目的 go 对应原文的 leave（出发），the airport bus 对应 Buses to the airport。题目很少和原文一字不差，要认出换了说法的句子。How often 问频率，答 every twenty minutes（每二十分钟一班）。' },
    { type: 'choice', q: '题目要求“用完整句回答”。原文：Lily\'s father is a doctor in a city hospital. 题目：What does Lily\'s father do? 下面哪个答案最好？',
      options: ['He is a doctor.', 'A doctor.', 'he is a doctor', 'My father is a doctor.'], answer: 0,
      explain: '题目明确要“完整句”，就要写出主语 + 谓语：He is a doctor.，句首大写、句末句号。A doctor 是关键词答法，只在题目限字数时用；全小写的那句没大写、没句号；My father 没有把人称换成 he。没有特别说明时，写简洁的完整句最稳妥。' },
    { type: 'fill', q: '原文：There are three libraries and a big park in our town. 表格：Number of ___ in the town: 3（填一个词）',
      answer: ['libraries'],
      explain: '检查单复数和拼写：数量是 3，名词要用复数；library 以“辅音字母 + y”结尾，复数要变 y 为 i 再加 -es：libraries。写成 library 或 librarys 都会被扣分。最后检查时要看字数、拼写、大小写和单复数。' }
  ],
  tests: [
    { type: 'fill', passage: 'p1', q: 'Where is Chen Mei from?（用 1 个词回答）',
      answer: ['Anxi', 'from Anxi', 'Anxi County'],
      explain: '第一段第一句：Chen Mei is a 15-year-old girl from Anxi, a county in Fujian...。限 1 个词，答 Anxi（安溪县）；Fujian 是省，范围太大。' },
    { type: 'fill', passage: 'p1', q: 'Why do they get up at five o\'clock in the morning? — Because they want to finish picking before the sun gets too ___.（填一个词）',
      answer: ['hot'],
      explain: '第二段：They get up at five o\'clock in the morning, because they want to finish picking before the sun gets too hot. because 后面就是原因。' },
    { type: 'fill', passage: 'p1', q: '同义句：Her grandmother can pick tea leaves much ___ than Chen Mei.（填一个词）',
      answer: ['faster', 'quicker', 'more quickly'],
      explain: '原文 twice as fast as Chen Mei（是她速度的两倍），意思就是“比她快得多”。比较级用 faster（也可以说 more quickly / quicker）。' },
    { type: 'fill', passage: 'p1', q: '第三段主要讲制茶要经过哪些步骤。请用文中一个词填空，概括第三段：the ___ of making tea',
      answer: ['steps'],
      explain: '第三段讲采完叶子后 There are several steps（有好几个步骤）：晾干、压、反复加热，并说 All the steps take almost two days。steps（步骤）就是这一段的中心词，注意用复数。' },
    { type: 'fill', passage: 'p1', q: 'How many people have followed Chen Mei\'s account?（用 1–3 个词回答，可用阿拉伯数字）',
      answer: ['more than 10,000', 'more than 10000', 'over 10,000', 'over 10000', 'more than ten thousand', 'over ten thousand', 'more than 10,000 people', 'over 10,000 people', 'more than 10000 people', 'over 10000 people', 'more than ten thousand people', 'over ten thousand people'],
      explain: '第四段：more than 10,000 people have followed her account。注意要保留 more than（或写 over），只写 10,000 不准确。' },
    { type: 'fill', passage: 'p1', q: 'What does Chen Mei think of tea? — She thinks it is a part of ___ hometown\'s culture.（填一个词）',
      answer: ['her'],
      explain: '“What ... think of” 问看法，定位最后一段：It is a part of our hometown\'s culture. 原文是 Chen Mei 自己说的 our，答案主语是 She，要换成 her。照抄 our 是人称错误。' },
    { type: 'choice', passage: 'p1', q: '判断正误：Chen Mei can pick tea leaves faster than her grandmother.',
      options: ['F（错误）', 'T（正确）'], answer: 0,
      explain: '第二段：Her grandmother can pick tea leaves twice as fast as Chen Mei.——是奶奶比陈梅快一倍，题目把两个人说反了，判 F。判断题常把比较的双方对调，要看清谁比谁。' },
    { type: 'fill', passage: 'p2', q: '根据通知完成表格。第 (6) 空：Helping old people who live ___（填一个词）',
      answer: ['alone'],
      explain: '“What will you do?”部分：You will help the old people who live alone in our community. 填 alone（独自）。' },
    { type: 'fill', passage: 'p2', q: '第 (7) 空：Every ___ morning（填一个词）',
      answer: ['Saturday'],
      explain: '“When?”部分：Every Saturday morning from 9:00 to 11:30。星期名称首字母要大写：Saturday。' },
    { type: 'fill', passage: 'p2', q: '第 (8) 空：From 13 to ___（填数字或英文单词）',
      answer: ['18', 'eighteen'],
      explain: '“Who can join?”部分：Students aged 13 to 18. 表格里前面用的是阿拉伯数字 13，填 18 最统一。' },
    { type: 'fill', passage: 'p2', q: '第 (9) 空：Being able to speak the local ___ of Fuzhou（填一个词）',
      answer: ['language'],
      explain: '“Who can join?”部分：If you can speak the local language of Fuzhou, that will be a plus. the local language of Fuzhou 就是“福州本地话”，表格中的 A plus 就对应原文的 a plus（加分项）。' },
    { type: 'fill', passage: 'p2', q: '第 (10) 空：A ___ at the end of the activity（填一个词）',
      answer: ['gift'],
      explain: '倒数第一段：Every volunteer will get a gift at the end of the activity. 表格的 Reward（奖励）就是 gift（礼物）。注意 A 后面填单数 gift。' },
    { type: 'fill', passage: 'p3', q: 'When did Lin Tao cook dinner for his family for the first time?（用 1–2 个词回答）',
      answer: ['last Sunday', 'Sunday', 'on Sunday'],
      explain: 'When 问时间。第一段：Last Sunday was my mother\'s birthday. I decided to cook dinner ... for the first time. 答 Last Sunday。' },
    { type: 'fill', passage: 'p3', q: 'How long did Lin Tao spend in the kitchen?（用不超过 3 个词回答）',
      answer: ['two hours', '2 hours', 'for two hours', 'for 2 hours'],
      explain: 'How long 问时长，不是问时间点。第二段：Then I spent two hours in the kitchen. 答 Two hours。如果答 In the morning 或 At six o\'clock，就是答非所问。' },
    { type: 'fill', passage: 'p3', q: 'Who did Lin Tao go to the market with? — With ___ dad.（填一个词）',
      answer: ['his'],
      explain: '人称转换：原文 I went to the market with my dad。问题问的是 Lin Tao（男孩），my 要换成 his。' },
    { type: 'fill', passage: 'p3', q: 'What did Lin Tao buy at the market? — He ___ some fish, tomatoes and eggs.（填一个词）',
      answer: ['bought'],
      explain: '时态一致：问题用 did，是过去的事，答案用过去式。buy 的过去式是不规则的 bought，注意拼写 b-o-u-g-h-t。' },
    { type: 'fill', passage: 'p3', q: 'Why did Lin Tao burn the first fish? — Because he forgot to turn ___ the fire.（填一个词）',
      answer: ['down'],
      explain: 'Why 问原因，定位 because：I burned the first fish because I forgot to turn down the fire（忘了把火调小）。' },
    { type: 'fill', passage: 'p3', q: '同义句转换：Lin Tao nearly gave up. = Lin Tao ___ gave up.（填一个词）',
      answer: ['almost'],
      explain: 'nearly 和 almost 都是“几乎、差点儿”，可以互换。原文 I was so upset that I nearly gave up。' },
    { type: 'fill', passage: 'p3', q: 'To Lin Tao\'s mother, the dinner was a big ___.（填 surprised 的名词形式）',
      answer: ['surprise'],
      explain: '原文 My mother was very surprised（形容词）。这里 a big 后面要名词，surprised → surprise（惊喜）。这就是任务型阅读里常见的词形转换。' },
    { type: 'fill', passage: 'p3', q: 'Cooking has taught Lin Tao to be patient and ___.（填 care 的形容词形式）',
      answer: ['careful'],
      explain: '原文 Cooking has taught me to be patient and careful。be 后面要形容词，并且和 patient（形容词）并列，所以 care（名词）→ careful（细心的）。后缀 -ful 把名词变成形容词，注意只有一个 l。' },
    { type: 'choice', passage: 'p3', q: '判断正误：Lin Tao had cooked dinner by himself many times before last Sunday.',
      options: ['F（错误）', 'T（正确）'], answer: 0,
      explain: '第一段：I decided to cook dinner ... for the first time ... but I had never done it myself. 他以前只是看奶奶做，从没自己做过，判 F。' },
    { type: 'choice', passage: 'p3', q: '判断正误：Now Lin Tao cooks for his family once a week.',
      options: ['T（正确）', 'F（错误）'], answer: 0,
      explain: '最后一段：Now I cook for my family once a week. 和题目一致，判 T。注意把 I / my 换成 Lin Tao / his 后意思完全相同。' },
    { type: 'choice', passage: 'p3', q: '将文中划线句译成中文，最恰当的是 ___。',
      options: ['看到她开心的笑容，我觉得所有的辛苦都是值得的。', '看到她的笑容，我觉得工作太辛苦了。', '她笑着看我努力工作，觉得很值得。', '我看到她很开心，就不想再努力了。'], answer: 0,
      explain: 'Seeing her happy smile 是“看到她开心的笑容”，主语是“我”；was worth it 是“是值得的”。第二项把“值得”译成了“太辛苦”；第三项主语错成了“她”；第四项意思完全相反。' },
    { type: 'choice', passage: 'p3', q: 'Which is the best title for the passage?',
      options: ['My First Birthday Dinner for Mum', 'How to Buy Fresh Fish', 'My Grandmother\'s Kitchen', 'Shopping with Dad'], answer: 0,
      explain: '全文讲林涛第一次为妈妈生日做晚饭的经过和收获。“怎么买鲜鱼”“和爸爸购物”只是第二段的一部分；奶奶只在第一段提了一句。标题要概括全文，不能只抓一个细节。' },
    { type: 'choice', q: '原文：Amy lives in Quanzhou with her grandparents. 题目要求“用完整句回答”：Where does Amy live? 下面哪个答案最好？',
      options: ['She lives in Quanzhou.', 'In Quanzhou.', 'she lives in quanzhou', 'I live in Quanzhou.'], answer: 0,
      explain: '题目要求完整句，就要有主语和谓语，开头大写、结尾句号：She lives in Quanzhou.。In Quanzhou 只是关键词，不是完整句；全小写的那句句首和地名没有大写，也没有句号；I live... 人称没改。' },
    { type: 'choice', q: '原文：I usually walk to school with my sister. 题目：How does the writer go to school?（用不超过 3 个词回答）下面哪个答案最好？',
      options: ['On foot.', 'The writer walks to school with his sister.', 'At seven o\'clock.', 'With my sister.'], answer: 0,
      explain: 'How 问方式，walk to school = go to school on foot，2 个词，不超字数。第二项意思对但远远超过 3 个词；At seven o\'clock 是时间，答非所问；With my sister 回答的是“和谁一起”，而且没改人称。' },
    { type: 'choice', q: '题目要求“每空不超过 3 个词”。下面哪个答案超出了字数？',
      options: ['By the school bus.', 'By bus.', 'On foot.', 'By bike.'], answer: 0,
      explain: 'By the school bus 是 By / the / school / bus 共 4 个词——a、the 这样的小词也算一个词。其他三个都是 2 个词。' },
    { type: 'fill', q: '原文：Every day I read English, play basketball and help my mum with housework. 表格：Activities — reading English / ___ basketball / helping Mum（填一个词）',
      answer: ['playing'],
      explain: '填表形式要统一：同一栏别的格子都是 -ing 形式（reading, helping），所以 play 要变成 playing。' },
    { type: 'fill', q: '原文：Jack is honest and kind. He is also very brave. 表格（每格填名词）：Jack\'s strengths — honesty / kindness / ___（填一个词）',
      answer: ['bravery', 'courage'],
      explain: '表格里 honesty、kindness 都是名词（honest → honesty，kind → kindness），第三格也要用名词：brave → bravery（也可以用同义词 courage）。如果照抄形容词 brave，就和同栏形式不统一了。' },
    { type: 'fill', q: '原文：The city museum is closed on Mondays. 题目：On which day of the week can\'t visitors go into the museum?（用 1–2 个词回答）',
      answer: ['Monday', 'Mondays', 'on Monday', 'on Mondays'],
      explain: '同义替换定位：题目里的 can\'t go into（不能进去）就是原文的 is closed（关门）。找到这句，答案就是 Monday(s)。题目和原文很少一字不差，要会认同义说法。' }
  ]
},

/* ================= 应试策略 ================= */
{
  id: 's-exam-strategy', title: '中考英语应试策略与时间分配', short: '应试策略', module: 'skill', grade: 9, freq: 2,
  prereqs: ['s-cloze', 's-reading-gap', 's-writing-structure'],
  tip: '应试策略不单独出题，却决定你能不能把会做的分都拿到，最大陷阱是在一道难题上耗太久，导致作文写不完或来不及涂卡（具体题量分值以当年《考试说明》为准）。',
  learn: [
    { h: '试卷结构概览', html: `
      <p>近年福建中考英语题型有调整。下面是根据模拟卷整理的<b>大致结构</b>，可能还会变化，<b>一切以当年《考试说明》为准</b>。</p>
      <table class="tbl">
        <tr><th>部分</th><th>主要内容</th><th>对应知识点</th></tr>
        <tr><td>听力</td><td>听句子选图、听对话选答、长对话与独白、信息记录</td><td>听力基础、长对话与独白</td></tr>
        <tr><td>阅读理解</td><td>几篇短文，考细节、主旨、推理、猜词</td><td>阅读·细节题 / 主旨题 / 推理猜词</td></tr>
        <tr><td>完形填空</td><td>一篇短文，根据上下文选词</td><td>完形填空</td></tr>
        <tr><td>阅读还原</td><td>六选五或七选五补全短文</td><td>阅读还原</td></tr>
        <tr><td>任务型阅读</td><td>回答问题、填表、信息转换</td><td>任务型阅读</td></tr>
        <tr><td>补全对话</td><td>从所给句子中选择，补全对话</td><td>补全对话</td></tr>
        <tr><td>短文填空</td><td>根据所给词或首字母填空，每空 1–2 词</td><td>短文填空</td></tr>
        <tr><td>看图写话</td><td>根据图片写句子</td><td>看图写话</td></tr>
        <tr><td>书面表达</td><td>按要求写一篇短文，分值较高</td><td>书面表达各节点</td></tr>
      </table>
      <p class="warn">即使试卷里没有单独的语法单项选择题，语法知识也仍然藏在完形、短文填空和写作里，不能放松。</p>` },
    { h: '做题顺序与时间分配', html: `
      <p>全卷考试时间一般是 <b>120 分钟</b>（以当年考试安排为准）。听力一般在开考后统一播放，之后的时间由你自己安排。建议<b>基本按顺序做</b>，但要给书面表达<b>留足约 20 分钟</b>。</p>
      <table class="tbl">
        <tr><th>部分</th><th>建议用时</th><th>说明</th></tr>
        <tr><td>听力（含读题）</td><td>约 25 分钟</td><td>跟着录音走，不能自己控制</td></tr>
        <tr><td>阅读理解</td><td>约 25 分钟</td><td>分值大，认真但别磨蹭</td></tr>
        <tr><td>完形填空</td><td>约 10 分钟</td><td>先通读全文再动笔</td></tr>
        <tr><td>阅读还原</td><td>约 7 分钟</td><td>先做有把握的空</td></tr>
        <tr><td>任务型阅读</td><td>约 8 分钟</td><td>注意字数和词形</td></tr>
        <tr><td>补全对话</td><td>约 5 分钟</td><td>看问答是否对得上</td></tr>
        <tr><td>短文填空</td><td>约 8 分钟</td><td>时态、单复数、词性</td></tr>
        <tr><td>看图写话</td><td>约 8 分钟</td><td>句子完整、语法正确</td></tr>
        <tr><td>书面表达</td><td>约 20 分钟</td><td>审题 3 分钟、列提纲、再誊写</td></tr>
        <tr><td>检查、核对涂卡</td><td>约 4 分钟</td><td>重点查题号和漏题</td></tr>
        <tr><th>合计</th><th>120 分钟</th><th></th></tr>
      </table>
      <p><b>示范：开考后的“时间路标”</b>——听力结束后看一眼表：做完阅读理解时，最好还剩一个多小时；做完完形和阅读还原时，最好还剩约 50 分钟；开始写书面表达时，最好还剩约 24 分钟（20 分钟写作 + 4 分钟检查）。哪个路标落后了，后面的题就要加快。</p>
      <div class="rhyme">会做的题先拿稳，难题标记往后挪；<br>作文时间要留足，最后几分查涂卡。</div>
      <p class="warn">卡壳规则：一道题想了 1–2 分钟还没把握，先选一个最可能的答案，在题号旁做个记号，继续往下做，最后有时间再回来。</p>` },
    { h: '听力前准备', html: `
      <ol>
        <li><b>利用读题时间</b>：录音播放前和每段之间的空档，快速浏览题目和选项，圈出关键词（人名、时间、数字、地点）。</li>
        <li><b>预测内容</b>：看选项猜一猜会听到什么，例如选项都是时间，就重点听数字。</li>
        <li><b>边听边记</b>：数字、时间、价格随手写在题目旁边，别全靠脑子记。</li>
        <li><b>没听清就放下</b>：凭印象选一个，马上看下一题，千万不要因为一道题错过后面好几道。</li>
        <li><b>注意转折</b>：but, actually, I'm afraid 后面常常才是真正的答案。</li>
      </ol>` },
    { h: '涂卡、检查与书写规范', html: `
      <ul>
        <li><b>涂卡</b>：用 2B 铅笔，做完一个大题就及时涂这部分，并核对题号；不要留到最后几分钟一起涂，容易涂错位或来不及。</li>
        <li><b>检查重点</b>：有没有漏题；短文填空和写作里的动词时态、名词单复数、词性、拼写；句首大写、句末标点。</li>
        <li><b>书写</b>：字迹工整，单词之间留空，不连笔乱写；写在答题卡规定的框内，超出部分可能扫描不到。</li>
        <li><b>修改</b>：按考场要求的方法改，改动要清楚，不要涂成一团。</li>
        <li><b>不会写的词</b>：换成自己会写的简单说法，不要用拼音，也不要空着。</li>
      </ul>
      <p class="warn">书面表达先在草稿纸上列提纲（要点 + 关键词），再写到答题卡上，避免大面积涂改。</p>` },
    { h: '考前一周复习计划', html: `
      <table class="tbl">
        <tr><th>时间</th><th>重点</th><th>怎么做</th></tr>
        <tr><td>第 1 天</td><td>听力</td><td>做 1–2 套听力，记下没听出的词，跟读原文</td></tr>
        <tr><td>第 2 天</td><td>阅读理解 + 阅读还原</td><td>限时做题，复习推理、猜词、找线索的方法</td></tr>
        <tr><td>第 3 天</td><td>完形 + 短文填空</td><td>整理错题本里的时态、词形错误</td></tr>
        <tr><td>第 4 天</td><td>任务型阅读 + 补全对话</td><td>练习人称和词形转换，熟悉常用交际用语</td></tr>
        <tr><td>第 5 天</td><td>写作</td><td>背熟开头结尾和连接词，限时写一篇、对照范文改</td></tr>
        <tr><td>第 6 天</td><td>整卷模拟</td><td>严格按 120 分钟做一套，练时间分配和涂卡</td></tr>
        <tr><td>第 7 天（考前一天）</td><td>回顾</td><td>只看错题本和常用句型，不做新难题，按平时时间睡觉</td></tr>
      </table>
      <p class="warn">考前准备好 2B 铅笔、黑色签字笔、橡皮、准考证，前一晚放进文具袋。</p>` }
  ],
  examples: [
    { type: 'choice', q: '开考后做到完形填空，发现第 5 空怎么也想不出来。下列做法哪个最好？',
      options: ['先根据上下文选一个最可能的答案，做个记号，继续往下做，最后再回来看', '一直想到想出来为止，后面的题等会儿再说', '整篇完形都先空着，直接跳去写作文'], answer: 0,
      explain: '完形后面的内容往往能提示前面的空，所以先选、做记号、往下读，最后再回来，既不浪费时间，也可能在后文找到线索。死磕一道题会挤占后面的时间；整篇空着太冒险。' },
    { type: 'fill', q: '按照本节的时间分配表，书面表达建议留约 ___ 分钟。（填阿拉伯数字）',
      answer: ['20'],
      explain: '书面表达分值较高，需要审题、列提纲、誊写，建议留约 20 分钟。' },
    { type: 'choice', q: '按本节整理的大致试卷结构，“任务型阅读”主要要你做什么？',
      options: ['按要求从文中找信息，自己写出简短的答案', '从句子库里选句子补全短文', '根据图片写句子'], answer: 0,
      explain: '任务型阅读不给选项，要自己写答案（回答问题、填表、信息转换）。选句子补全短文是阅读还原；根据图片写句子是看图写话。了解每部分考什么，才能对应复习（具体题型以当年《考试说明》为准）。' },
    { type: 'choice', q: '有同学说：“如果试卷里没有单独的语法选择题，语法就不用复习了。”这种说法 ___。',
      options: ['不对，语法仍然藏在完形、短文填空和写作里', '对，没有语法题就不会考语法', '对，只要多背单词就够了'], answer: 0,
      explain: '完形要靠语法判断词性、搭配；短文填空要改时态、单复数、词形；写作句子语法错了会扣分。所以语法虽然不单独出题，却处处都在考。' },
    { type: 'choice', q: '按本节建议，听力结束后做题的顺序最好是 ___。',
      options: ['基本按顺序往下做，同时给书面表达留足约 20 分钟', '从最后一道题倒着往前做', '先挑分值最小的题做'], answer: 0,
      explain: '按顺序做不容易漏题，思路也连贯；关键是控制好时间，保证最后有足够时间写书面表达。倒着做、挑小分值题先做都没有道理，还容易漏题。' },
    { type: 'choice', q: '你开始写书面表达时，发现只剩 12 分钟了。最好怎么做？',
      options: ['快速列出要点，用简单、有把握的句子把要点写全', '先把作文空着，回去检查前面的选择题', '只写一个精彩的开头，后面不写了'], answer: 0,
      explain: '书面表达分值高，要点写全是第一位的。时间紧时，简单列个要点、用有把握的简单句写完，比追求漂亮句子更稳。空着作文去查选择题，丢的分更多。这也说明平时要看好“时间路标”，别让作文时间被挤掉。' },
    { type: 'choice', q: '听力每段录音之间有几秒空档，最好用来做什么？',
      options: ['看下一段的题目和选项，圈出关键词', '回头修改上一段的答案', '闭上眼睛休息一下'], answer: 0,
      explain: '空档就是读题时间：先看下一段要问什么、圈出人名时间地点等关键词，听的时候就知道抓什么。回头改上一段会让你错过下一段的准备。' },
    { type: 'choice', q: '某道听力题的选项是：7:30 / 8:00 / 8:30。听的时候你应该重点听什么？',
      options: ['时间', '地点', '人名'], answer: 0,
      explain: '预测内容：三个选项都是时间，问题一定和时间有关，所以要重点听数字和时间。看选项预测要听什么，是读题时间最重要的工作。' },
    { type: 'choice', q: '听力中会听到电话号码和价格，最好怎么做？',
      options: ['随手把数字简单记在题目旁边', '全靠脑子记，听完再选', '等整段录音结束后再慢慢回想'], answer: 0,
      explain: '数字多、容易混，边听边记最可靠。全靠脑子记，听到后面的数字就会把前面的忘掉或记混。' },
    { type: 'choice', q: '长对话听到一半，发现前面有一个小题没抓住答案，但录音还在继续。最好怎么做？',
      options: ['先凭印象选一个，马上跟上正在播放的内容', '停下来专心回想那个小题', '放弃这段对话剩下的题'], answer: 0,
      explain: '录音不会停下来等你。停下来回想会连着错过后面的题；凭印象先选一个、立刻跟上，损失最小。' },
    { type: 'choice', say: [{ who: 'W', text: 'Shall we meet at the school gate at three this afternoon?' }, { who: 'M', text: 'Sorry, I have a piano lesson at three. How about four?' }, { who: 'W', text: 'OK. See you then.' }],
      q: '听对话，回答问题：When will they meet?',
      options: ['At four.', 'At three.', 'At five.'], answer: 0,
      explain: '注意转折：女孩先提议三点，男孩说 Sorry, I have a piano lesson at three. How about four?（三点有钢琴课，四点怎么样？），女孩同意了。Sorry、but、actually 后面常常才是真正的答案。三点是被否定掉的时间，最容易误选。' },
    { type: 'choice', q: '全卷做完还剩 4 分钟，最应该先查什么？',
      options: ['有没有漏题，答题卡题号有没有涂错位', '把作文全部重抄一遍', '把所有选择题重新做一遍'], answer: 0,
      explain: '最后几分钟最值得查的是“会造成大面积丢分”的问题：漏题、涂错位。4 分钟不够重抄作文或重做全部选择题，而且仓促改动容易把对的改错。' },
    { type: 'choice', q: '书面表达写到答题卡上时，下面哪种做法正确？',
      options: ['字迹工整，单词之间留空，写在规定的框内', '字越小越好，可以写到框外去', '为了写得快，单词可以连笔连在一起'], answer: 0,
      explain: '答题卡是扫描后阅卷的：字迹清楚、单词分开，老师才看得清；写到框外的部分可能扫描不到。' },
    { type: 'choice', q: '写作文时写错了一个单词，最好怎么改？',
      options: ['按考场要求的方法清楚地改正，不要涂成一团', '用笔把它涂成一个大黑块', '整篇作文擦掉重新写'], answer: 0,
      explain: '按考场规定的方法改，改动清楚、卷面整洁。涂成黑块影响卷面；为一个词重写整篇浪费时间。' },
    { type: 'choice', q: '书面表达中想写“我暑假当了志愿者”，但不会拼 volunteer。最好写 ___。',
      options: ['I helped others in my free time this summer.', 'I was a zhiyuanzhe this summer.', '这一点干脆不写'], answer: 0,
      explain: '不会写的词要“绕着说”：用自己会写、拼得对的简单句表达同样的意思。拼音不是英语；不写会漏掉要点。' },
    { type: 'choice', q: '书面表达列提纲之前要先审题，审题时最需要看清什么？',
      options: ['文体、人称、时态、要写的要点和字数要求', '题目一共有多少个汉字', '答题卡上有几行'], answer: 0,
      explain: '审题决定方向：写信还是写演讲稿（文体）、用第几人称、主要用什么时态、必须写哪几个要点、字数多少。这些看清了再列提纲，才不会跑题、漏点。' },
    { type: 'choice', q: '考前一周安排一次整卷模拟，最主要的目的是 ___。',
      options: ['按正式考试的时长练习时间分配和涂卡', '多见一些新的难题', '看看自己能不能一个小时做完'], answer: 0,
      explain: '整卷模拟就是“彩排”：严格按考试时长做，练习每部分用多少时间、什么时候涂卡，发现时间上的问题。追难题、比速度都不是目的。' },
    { type: 'choice', q: '考前一天晚上，下面哪件事最该做？',
      options: ['把 2B 铅笔、黑色签字笔、橡皮和准考证放进文具袋', '把新买的难题集全部做完', '和同学打游戏到半夜放松一下'], answer: 0,
      explain: '考前一晚准备好文具和证件，第二天就不会手忙脚乱；做新难题、熬夜都会影响第二天的状态。' },
    { type: 'choice', q: '全卷考试一般是 120 分钟（以当年考试安排为准），听力在开考后统一播放。下面哪种理解是对的？',
      options: ['听力的时间由录音决定，听力结束后剩下的时间才由自己安排', '120 分钟全部由自己安排，听力想什么时候听都可以', '听力不占考试时间，考完笔试才放录音'], answer: 0,
      explain: '听力是开考后统一播放的，你只能跟着录音走；录音放完后，剩下的时间才能自己分配给阅读、完形、写作等部分。所以本节的时间表里听力约 25 分钟是“固定”的，真正要你管理的是后面的时间。' },
    { type: 'choice', q: '选择题的答题卡应该用什么笔涂、什么时候涂？',
      options: ['用 2B 铅笔，做完一个大题就涂好这部分，并核对题号', '用黑色签字笔涂选择题，涂得更清楚', '全部做完后，最后两分钟一起涂'], answer: 0,
      explain: '选择题要用 2B 铅笔涂，机器才能识别；签字笔是写非选择题用的。做完一个大题就及时涂、核对题号，能避免最后来不及或整排涂错位。' },
    { type: 'choice', q: '审完题后，在草稿纸上列提纲，下面哪一份提纲最好？',
      options: ['第一段：开头点题；第二段：要点 1、2、3 + 关键词；第三段：结尾表态', '把整篇作文先用中文写一遍', '只写一句“好好写”就开始誊写'], answer: 0,
      explain: '提纲只需要“要点 + 关键词”，按段落排好顺序：保证要点一个不漏、结构清楚，誊写时也不容易大面积涂改。整篇写中文太花时间；什么都不列，写着写着容易漏点、跑题。' },
    { type: 'choice', q: '按本节的考前一周计划，考前一天（第 7 天）的复习重点是 ___。',
      options: ['只看错题本和常用句型，不做新的难题，按平时时间睡觉', '再做两套新的整卷模拟', '开始学习一个新的语法专题'], answer: 0,
      explain: '考前一天以“回顾”为主：翻错题本、看常用句型，让自己心里有底，并保证睡眠。做新整卷、学新知识既累，又可能因为遇到难题而打击信心。' }
  ],
  tests: [
    { type: 'fill', q: '按本节的时间分配表，各部分建议用时加起来合计 ___ 分钟。（填阿拉伯数字）',
      answer: ['120'],
      explain: '本节的时间分配表是按全卷 120 分钟（包括开考后统一播放的听力）来安排的，各部分合计 120 分钟。实际考试时长以当年考试安排为准，考前要看清楚。' },
    { type: 'choice', q: '听力录音播放前，通常有一小段读题时间。这段时间最好用来做什么？',
      options: ['快速浏览题目和选项，圈出关键词，预测要听的内容', '翻到最后先给作文打草稿', '趴在桌上休息，等录音开始'], answer: 0,
      explain: '读题时间是听力的“预习”：先知道要听什么（时间？地点？原因？），听的时候才能抓重点。听力放的时候不能做别的题，提前写作文会分心。' },
    { type: 'choice', q: '听力中有一题没听清，下一段录音马上要开始了。应该怎么做？',
      options: ['凭印象选一个答案，立刻把注意力转到下一题', '继续回想这一题，下一题没听也没关系', '举手请监考老师再放一遍'], answer: 0,
      explain: '听力录音不会重放，也不会等你。纠结一道题会连锁错过后面几道，最好的办法是凭印象选一个，马上准备下一题。' },
    { type: 'choice', q: '做阅读理解时，一道题想了 3 分钟还拿不准。最好怎么做？',
      options: ['先选一个最可能的答案并做标记，继续往下做，有时间再回来', '一直想到想出来为止', '空着不选，也不做任何标记'], answer: 0,
      explain: '按“卡壳规则”：想了 1–2 分钟还没把握就先选、做记号、往下做。空着不做标记，最后很可能忘记回来，白白丢分。' },
    { type: 'choice', q: '关于涂答题卡，下面哪种做法最稳妥？',
      options: ['做完一个大题就及时涂好这部分，并核对题号', '全部做完后，在最后两分钟一起涂', '只在试卷上写答案，答题卡不用涂'], answer: 0,
      explain: '及时涂卡、核对题号，能避免最后时间不够或涂错位。阅卷看的是答题卡，试卷上写得再对也不算分。' },
    { type: 'fill', q: '答题卡上的选择题一般用 ___B 铅笔填涂。（填一个数字）',
      answer: ['2'],
      explain: '答题卡选择题用 2B 铅笔填涂，机器才能识别。考前要准备好并削好或备好笔芯。' },
    { type: 'choice', q: '写书面表达时，想表达“非物质文化遗产”但不会拼这个英文词。最好怎么办？',
      options: ['换成自己会写的简单说法，如 traditional culture', '直接写拼音 feiyi', '把这句话空着不写'], answer: 0,
      explain: '写作中遇到不会的词，要“绕着说”：用会写、拼得对的简单表达代替。拼音不算英语，空着会让要点缺失。' },
    { type: 'choice', q: '短文填空写完后检查，最应该重点看什么？',
      options: ['动词时态、名词单复数、词性和拼写', '字写得够不够大', '用了多少个难单词'], answer: 0,
      explain: '短文填空最常见的失分点就是时态、单复数、词性（如 careful / carefully）和拼写错误，检查时要逐空对照上下文。' },
    { type: 'choice', q: '书面表达在誊写到答题卡之前，最好先做哪一步？',
      options: ['在草稿纸上列提纲：要点和关键词', '先数一数题目有多少个字', '先把整篇作文背下来'], answer: 0,
      explain: '先列提纲能保证要点不遗漏、结构清楚，誊写时也不容易大面积涂改。' },
    { type: 'choice', q: '中考前一天晚上，下面哪种安排最合理？',
      options: ['看看错题本和常用句型，准备好文具，按平时的时间睡觉', '熬夜再做两套新的模拟卷', '什么都不准备，玩到很晚彻底放松'], answer: 0,
      explain: '考前一天以回顾为主：错题本、常用句型、检查文具和准考证，保证睡眠。熬夜做新题既累又容易打击信心；完全不准备则可能第二天忘带东西。' },
    { type: 'choice', q: '按本节整理的大致试卷结构，“阅读还原”这部分要你做什么？',
      options: ['从句子库里选句子，补全短文', '根据所给词或首字母填空', '根据图片写句子'], answer: 0,
      explain: '阅读还原是六选五或七选五：从句子库里选句子放回短文的空格。根据所给词或首字母填空是短文填空；根据图片写句子是看图写话。' },
    { type: 'choice', q: '做“补全对话”时，最需要注意什么？',
      options: ['问句和答句是否对得上', '作文字数够不够', '听力录音的语速'], answer: 0,
      explain: '补全对话是从所给句子中选句子补全对话，关键是上下句能不能对上：问什么答什么，对方的反应和前一句是否接得上。' },
    { type: 'choice', q: '复习短文填空时，最需要用到下面哪类知识？',
      options: ['时态、单复数、词性等语法知识', '世界地理知识', '数学计算方法'], answer: 0,
      explain: '短文填空要根据上下文给词的正确形式，靠的就是时态、名词单复数、词性转换等语法知识。这说明语法虽然不单独出题，但一直在考。' },
    { type: 'choice', q: '关于语法，下面哪句话说得对？',
      options: ['语法知识会在完形、短文填空和写作中考到', '试卷没有语法选择题，所以语法不考', '写作只看字数，不看语法'], answer: 0,
      explain: '完形、短文填空、看图写话和书面表达都离不开语法；写作里语法错误多会扣分。' },
    { type: 'choice', q: '中考英语的听力部分一般在什么时候进行？',
      options: ['开考后统一播放录音', '笔试做完后自己找时间听', '想什么时候听就什么时候听'], answer: 0,
      explain: '听力一般在开考后统一播放（以当年考试安排为准），你不能自己控制。听力之后的时间才由你自己分配。' },
    { type: 'fill', q: '按本节的时间分配表，书面表达约 20 分钟中，审题大约用 ___ 分钟。（填阿拉伯数字）',
      answer: ['3', 'three'],
      explain: '本节建议：书面表达约 20 分钟，其中审题约 3 分钟，再列提纲、誊写。审题这几分钟不能省，跑题、漏点损失更大。' },
    { type: 'choice', q: '为什么要给书面表达留足时间？',
      options: ['分值较高，而且要审题、列提纲、再誊写', '书面表达最简单，可以慢慢写', '书面表达不算分，写不写都行'], answer: 0,
      explain: '书面表达分值较高，又要经过审题、列提纲、誊写几步，时间不够就容易漏要点或写不完。' },
    { type: 'choice', q: '小明听力结束后，在阅读理解的一篇难文章上花了 40 分钟，结果作文只剩 5 分钟。他的主要问题是 ___。',
      options: ['在难题上耗时太久，没有按时间分配做题', '他是按顺序做题的', '听力听得太认真了'], answer: 0,
      explain: '按顺序做本身没错，错在没有控制时间：本节建议阅读理解约 25 分钟，他一篇就用了 40 分钟，挤掉了作文时间。遇到难题要按“卡壳规则”先放一放。' },
    { type: 'fill', q: '按本节的“时间路标”，做完完形和阅读还原时，最好还剩约 ___ 分钟。（填阿拉伯数字）',
      answer: ['50', 'fifty'],
      explain: '本节的时间路标：做完阅读理解时最好还剩一个多小时；做完完形和阅读还原时最好还剩约 50 分钟；开始写书面表达时最好还剩约 24 分钟。' },
    { type: 'choice', q: '做完阅读理解时，你发现比“时间路标”落后了大约 10 分钟。最好怎么做？',
      options: ['后面的题适当加快，仍然保证给书面表达留足时间', '干脆放弃书面表达', '回头把阅读理解再仔细检查一遍'], answer: 0,
      explain: '时间路标的作用就是及时发现落后、及时调整：后面加快一点，把写作时间保住。放弃作文丢分太多；回头检查会落后得更多。' },
    { type: 'choice', q: '短文填空有一个空怎么也想不出来，最好怎么做？',
      options: ['先填一个最可能的词并做记号，往下做，最后有时间再回来', '一直想，直到想出来为止', '把整篇短文填空都空着，先去写作文'], answer: 0,
      explain: '卡壳规则同样适用于短文填空：先填一个最可能的、做记号、往下做。后面的句子还可能给你提示。' },
    { type: 'choice', q: '按本节的“卡壳规则”，一道题想了多久还没把握，就应该先选一个、做记号、往下做？',
      options: ['1–2 分钟', '10 分钟', '一直想到会为止'], answer: 0,
      explain: '本节建议：想了 1–2 分钟还没把握就先放下。10 分钟够做好几道题了，一道题耗太久会挤掉后面的时间。' },
    { type: 'choice', q: '下面哪件事适合在听力读题时间里做？',
      options: ['圈出题目里的关键词，如人名、时间、地点', '给作文列提纲', '做阅读理解'], answer: 0,
      explain: '读题时间是为听力准备的：圈关键词、预测内容。听力进行时去做别的题，会分散注意力。' },
    { type: 'choice', q: '某道听力题问 "Where will they have dinner?"，读题时你应该提醒自己重点听 ___。',
      options: ['地点', '时间', '原因'], answer: 0,
      explain: 'Where 问地点，所以要重点听餐馆、家、学校之类的地点词。看疑问词就能预测要听的信息类型。' },
    { type: 'choice', q: '某道听力题的选项是：A doctor. / A teacher. / A driver. 你应该重点听什么？',
      options: ['说话人的职业', '说话人的年龄', '当天的天气'], answer: 0,
      explain: '三个选项都是职业，问题一定和职业有关，听的时候抓工作地点、工作内容等相关信息。' },
    { type: 'choice', q: '听力信息记录题要写下电影开始的时间和票价。最好怎么做？',
      options: ['边听边把时间和价格简单记下来', '听完整段再一起回忆', '只记票价，时间等最后再想'], answer: 0,
      explain: '时间、价格这类数字信息最容易听完就忘或记混，边听边记最可靠，记的时候用数字、缩写就行。' },
    { type: 'fill', say: 'The tickets are 35 yuan each, and the show begins at 7:15 this evening.',
      q: '听一听，边听边记：演出几点开始？（用数字写，如 6:30）',
      answer: ['7:15', '7.15', 'seven fifteen', 'a quarter past seven', 'quarter past seven'],
      explain: '录音里先说票价 35 元，再说演出 7:15 开始。两个数字挨在一起，不记下来很容易混。答案是 7:15。' },
    { type: 'choice', q: '听力中如果一直纠结一道没听清的题，最可能造成什么后果？',
      options: ['错过后面几道题的录音', '这道题的分数一定会更高', '录音会自动暂停等你'], answer: 0,
      explain: '录音不会等人，纠结一道题就会漏听后面的内容，一错错一串。没听清就凭印象选一个，马上看下一题。' },
    { type: 'choice', say: [{ who: 'M', text: 'Let\'s take a taxi to the museum.' }, { who: 'W', text: 'Actually, the museum is very close. We can walk there in ten minutes.' }, { who: 'M', text: 'Great. Let\'s go.' }],
      q: '听对话，回答问题：How will they go to the museum?',
      options: ['On foot.', 'By taxi.', 'By bus.'], answer: 0,
      explain: '男生先提议打车，女生用 Actually 转折：博物馆很近，走十分钟就到；男生同意了。所以他们步行去。taxi 是先听到的词，最容易误选。' },
    { type: 'choice', say: [{ who: 'W', text: 'Excuse me, is this T-shirt fifty yuan?' }, { who: 'M', text: 'It was fifty yuan last week, but today it\'s only forty.' }],
      q: '听对话，回答问题：How much is the T-shirt today?',
      options: ['40 yuan.', '50 yuan.', '90 yuan.'], answer: 0,
      explain: '转折词 but 后面是答案：上周 50 元，但今天只要 40 元。问的是 today，所以是 40 元。' },
    { type: 'fill', q: '检查时发现句子 "Last weekend I visit my grandparents." 有错，应把 visit 改为 ___。（填一个词）',
      answer: ['visited'],
      explain: 'Last weekend 是过去的时间，动词要用一般过去时：visit → visited。动词时态是检查时的重点之一。' },
    { type: 'choice', q: '检查作文时发现这句话：i like english very much 需要怎么改？',
      options: ['句首的 I 和 English 首字母大写，句末加句号', '把 like 改成 likes', '什么都不用改'], answer: 0,
      explain: '检查重点里包括“句首大写、句末标点”：I 永远大写，English 是语言名称也要大写，句末加句号：I like English very much. 主语是 I，like 不加 s。' },
    { type: 'choice', q: '为什么作文不能写到答题卡规定的框外？',
      options: ['框外的部分可能扫描不到，不能得分', '框外的字会被加分', '框外写字显得更整洁'], answer: 0,
      explain: '答题卡扫描后网上阅卷，一般只扫描规定区域，框外的字老师可能根本看不到。' },
    { type: 'choice', q: '下面哪种卷面最好？',
      options: ['字迹工整、单词之间留空、修改处清楚', '字很潦草，但写得很多', '改了很多地方，涂成好几个黑团'], answer: 0,
      explain: '卷面清楚，阅卷老师才能准确看到你的答案。潦草、乱涂都可能让本来对的内容被看错。' },
    { type: 'choice', q: '想写“他很有耐心”，但拿不准 patient 怎么拼。比较稳妥的办法是 ___。',
      options: ['换成有把握的说法，如 He doesn\'t get angry easily.', '写拼音 naixin', '这一句空着不写'], answer: 0,
      explain: '用自己会写、拼得对的简单说法表达同样的意思。拼音不算英语；空着会漏掉内容。' },
    { type: 'choice', q: '书面表达列提纲时，草稿纸上主要写什么？',
      options: ['每段的要点和准备用的关键词、句型', '整篇作文的中文翻译', '和题目无关的漂亮句子'], answer: 0,
      explain: '提纲只需要“要点 + 关键词”：保证要点不漏、结构清楚，又不花太多时间。写整篇中文翻译太费时间；和题目无关的句子用不上。' },
    { type: 'choice', q: '按本节的考前一周计划，复习“任务型阅读 + 补全对话”的那一天，重点练什么？',
      options: ['人称和词形转换，以及常用交际用语', '严格按考试时长做一整套卷子', '背作文的开头结尾和连接词'], answer: 0,
      explain: '任务型阅读常考人称、时态、词形的转换，补全对话要熟悉常用交际用语，所以这一天重点练这两样。整卷模拟和写作练习在计划里另有安排。' },
    { type: 'choice', q: '考前复习写作时，下面哪种做法最有效？',
      options: ['背熟开头结尾和连接词，限时写一篇，再对照范文修改', '只看范文，自己不动笔', '只背单词表，不练写作'], answer: 0,
      explain: '写作要动手练：积累开头结尾和连接词，限时写、对照范文改，才能真正提高，也能练习写作的时间控制。' }
  ]
}

);
