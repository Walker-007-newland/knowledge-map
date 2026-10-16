// 题型技能 D 组：书面表达（第 4 阶段）
KG.nodes.push(

/* ================= 审题、要点与三段式 ================= */
{
  id: 's-writing-structure', title: '书面表达：审题、要点与三段式结构', short: '写作·审题结构', module: 'skill', grade: 8, freq: 3,
  prereqs: ['g-compound-sentence', 'g-adv-reason'],
  tip: '书面表达考的是能否按提示把每个要点用正确的英语连成一篇短文，头号陷阱是漏写要点或人称、时态用错，一个要点没写就直接掉档。（具体题量分值以当年《考试说明》为准）',
  learn: [
    { h: '题型说明', html: `
      <p>福建中考书面表达一般给出<b>中文情境 + 几条要点</b>，让你写一篇 <b>80–100 词左右</b>的短文。常见两大类：</p>
      <ul>
        <li><b>话题作文</b>：如“难忘的一天”“我的家乡”“我的梦想”。</li>
        <li><b>应用文</b>：书信、邮件、倡议书、通知、演讲稿等。</li>
      </ul>
      <p>分值大约 15 分，也有消息说今后可能提高到 20 分左右，<b>以当年考试说明为准</b>。阅卷老师大致按下面的顺序看：</p>
      <table class="tbl">
        <tr><th>看什么</th><th>说明</th></tr>
        <tr><td>① 要点</td><td>提示里的每一条都写到了吗？<b>最重要</b>，漏一条就很难进高档。</td></tr>
        <tr><td>② 语言</td><td>人称、时态、主谓一致、拼写有没有错？有没有一两个好句子？</td></tr>
        <tr><td>③ 结构</td><td>有没有开头、中间、结尾？句子之间有没有连接词？</td></tr>
        <tr><td>④ 卷面</td><td>字迹清楚、少涂改、标点大小写正确。</td></tr>
      </table>` },
    { h: '审题四看（人称、时态、文体、要点）', html: `
      <ol>
        <li><b>看人称</b>：写自己的经历用第一人称 I / we；介绍别人用第三人称 he / she / they；书信里称对方用 you。</li>
        <li><b>看时态</b>：找时间词。“上周、去年、一次经历”→ 一般过去时；“你的习惯、你的家乡”→ 一般现在时；“计划、梦想、打算”→ 一般将来时（will / be going to）。一篇文章可以有不同时态，但每一句要和它说的时间一致。</li>
        <li><b>看文体</b>：是记叙（讲一件事）、说明（介绍一个地方）、议论（谈看法），还是书信、通知？文体决定开头结尾怎么写。</li>
        <li><b>看要点</b>：把提示里的要点<b>编上号</b>，写草稿时在旁边打勾。提示里有“等”“自拟一点”的，还要自己补充一点。</li>
      </ol>
      <div class="rhyme">审题四看别马虎：人称、时态、文体、要点数；<br>要点编号逐条勾，漏掉一条分难有。</div>` },
    { h: '三段式：开头点题—中间要点—结尾升华', html: `
      <table class="tbl">
        <tr><th>段落</th><th>写什么</th><th>参考句子</th></tr>
        <tr><td>开头（1–2 句）</td><td>直接点出话题，不绕弯</td><td>As we all know, health is very important.<br>Last Sunday, I had an unforgettable experience.</td></tr>
        <tr><td>中间（4–6 句）</td><td>按要点顺序展开，用连接词串起来</td><td>First, … Second, … Besides, … What's more, …</td></tr>
        <tr><td>结尾（1–2 句）</td><td>总结、表达感受或发出号召</td><td>In a word, … / I learned that … / Let's …!</td></tr>
      </table>
      <p class="ex">Last Saturday, I visited a farm with my classmates.<span class="zh">上周六，我和同学们参观了一个农场。（开头点题）</span></p>
      <p class="ex">From this trip, I learned that food doesn't come easily.<span class="zh">通过这次参观，我明白了粮食来之不易。（结尾升华）</span></p>
      <p class="small">字数小窍门：开头约 15 词，中间约 60 词，结尾约 15 词，加起来正好 90 词左右。</p>` },
    { h: '常见陷阱', html: `
      <ul>
        <li><b>漏要点</b>：只顾写自己熟悉的内容，把“感受”“建议”之类的要点忘了。</li>
        <li><b>时态乱跳</b>：写过去的事，写着写着就变成 I go / we have。</li>
        <li><b>中式英语</b>：如 <span class="en">I very like it.</span> 应为 <span class="en">I like it very much.</span></li>
        <li><b>字数不对</b>：太少显得内容不够，太多容易出错。按要求写就好。</li>
        <li><b>泄露信息</b>：不能写自己的真实姓名、学校名，需要署名时用题目给的名字（通常是 Li Hua）。</li>
        <li><b>卷面乱</b>：大段涂改。写错一个词，用一条横线划掉即可。</li>
      </ul>
      <p class="warn">写完一定留 2 分钟检查：要点、时态、单复数、拼写、句首大写、句末标点。</p>` },
    { h: '完整示范：从审题到成文', html: `
      <p><b>题目</b>：上周你参加了学校组织的植树活动。请以“Planting Trees”为题写一篇短文。要点：1. 活动时间、地点；2. 你们做了什么；3. 你的感受。（80–100 词）</p>
      <p><b>审题</b>：人称——第一人称 I / we；时态——“上周”，用一般过去时；文体——记叙文；要点——3 条，编号打勾。</p>
      <p><b>列提纲</b>：开头：时间地点（last Saturday, the hill near our school）→ 中间：dig holes, plant trees, water them, put up signs → 结尾：tired but happy, protect the environment。</p>
      <p><b>成文</b>：</p>
      <p class="ex">Last Saturday, our class went to the hill near our school to plant trees.<span class="zh">要点 1：时间地点。一般过去时 went。</span></p>
      <p class="ex">First, we dug holes. Then we put the young trees in and watered them carefully. Finally, we made some signs to remind people to take care of the trees.<span class="zh">要点 2：做了什么，用 First / Then / Finally 串起来。</span></p>
      <p class="ex">Although we were tired, we felt very happy. I hope the trees will grow tall and make our hometown greener.<span class="zh">要点 3：感受 + 升华。Although 让句子更连贯。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '题目：“请介绍你上个寒假的一次旅行。”这篇文章的主要时态应该是：', options: ['一般过去时', '一般现在时', '一般将来时'], answer: 0,
      explain: '题目里有“上个寒假”，说的是已经发生的事，主体用一般过去时，如 I went to … / We visited …。' },
    { type: 'fill', q: '找出并改正句中的错误，只填改正后的词：<br>Last week I visit the museum with my classmates.', answer: ['visited'],
      explain: '有 last week，动作发生在过去，visit 要改成过去式 visited。写作中这类时态错误最常见。' },
    { type: 'choice', q: '题目：“How to Keep Healthy”。下面哪一句最适合做开头？', options: ['As we all know, health is very important. Here are some ways to keep healthy.', 'Yesterday I went shopping with my mother and bought a new coat.', 'My cat is white and it likes eating fish.'], answer: 0,
      explain: '开头要直接点题：先说健康很重要，再引出“下面是一些方法”。另外两句都和“如何保持健康”无关。' },
    { type: 'choice', q: '下面哪个题目属于“应用文”？', options: ['给笔友 Tom 写一封邮件，介绍你的学校', '以“My Hometown”为题写一篇短文', '以“A Day I Will Never Forget”为题写一篇短文'], answer: 0,
      explain: '书面表达分两大类：话题作文（按题目写一篇短文，如我的家乡、难忘的一天）和应用文（书信、邮件、倡议书、通知、演讲稿等）。“给笔友写邮件”有称呼、落款等固定格式，属于应用文。' },
    { type: 'choice', q: '阅卷老师看书面表达，最先、也最看重的是：', options: ['提示中的要点是否都写到了', '有没有用很难的单词', '字数是不是越多越好'], answer: 0,
      explain: '评分大致按“要点 → 语言 → 结构 → 卷面”的顺序看，要点最重要，漏一条就很难进高档。难词和字数多都不是关键。' },
    { type: 'choice', q: '题目：“请给外国笔友写信，介绍你的好朋友李明。”下面哪组句子人称用得对？', options: ['Li Ming is my best friend. He is tall and kind. I think you will like him.', 'Li Ming is my best friend. I am tall and kind. I think he will like you.', 'Li Ming is my best friend. You are tall and kind. I think he will like him.'], answer: 0,
      explain: '介绍别人用第三人称 he / she，说自己用 I，书信里称对方用 you。第二组把李明的特点写成了 I am，第三组写成了 You are，人称都错了。' },
    { type: 'choice', q: '题目：“介绍你的好朋友，并讲一件他帮助你的事。”下面说法正确的是：', options: ['介绍朋友用一般现在时，讲那件事用一般过去时', '全文都必须用一般现在时', '全文都必须用一般过去时'], answer: 0,
      explain: '一篇文章可以有不同时态，关键是每一句和它说的时间一致：朋友现在的样子、性格用一般现在时（He is …），已经发生的那件事用一般过去时（Last week he helped me …）。' },
    { type: 'choice', q: '题目：“请介绍你家乡的位置、气候和特产。”这篇文章属于哪种文体？', options: ['说明文（介绍一个地方）', '记叙文（讲一件事）', '议论文（谈看法）'], answer: 0,
      explain: '介绍一个地方的位置、气候、特产，是在“说明”这个地方，属于说明文。讲一次经历才是记叙文，谈对某事的看法才是议论文。文体决定开头结尾怎么写。' },
    { type: 'choice', q: '题目要点：1. 你喜欢的运动；2. 喜欢的原因；3. ……（自拟一点）。“自拟一点”应该怎样处理？', options: ['自己补充一个相关的内容，如这项运动给你带来的变化', '这一点可以不写', '把前两点再重复写一遍'], answer: 0,
      explain: '“自拟一点”或省略号也是要点，必须自己补充一条和话题相关的新内容，不写就算漏要点。重复前面的内容不算新要点。' },
    { type: 'fill', q: '用顺序连接词把动作串起来（填一个词）：<br>F___, we dug holes. Then we planted the trees. Finally, we watered them.', answer: ['First', 'first'],
      explain: '中间段按要点顺序展开，常用 First … Then … Finally 串起几个动作，首字母 F 且排在最前，填 First。' },
    { type: 'choice', q: '题目：“My Hometown”。下面哪一句最适合做结尾？', options: ["Welcome to my hometown, and I'm sure you will love it!", 'My hometown is a small city in Fujian.', 'First, the food here is delicious.'], answer: 0,
      explain: '结尾要总结、表达感受或发出号召，“欢迎来我的家乡，相信你会爱上它”既抒情又呼应主题。第二句适合做开头点题，第三句用 First 开头，是中间段的要点。' },
    { type: 'choice', q: '一篇 90 词左右的三段式作文，各段词数怎样安排比较合理？', options: ['开头约 15 词，中间约 60 词，结尾约 15 词', '开头约 60 词，中间约 15 词，结尾约 15 词', '开头约 15 词，中间约 15 词，结尾约 60 词'], answer: 0,
      explain: '开头、结尾各 1–2 句（约 15 词），中间 4–6 句（约 60 词）展开要点，合起来约 90 词。要点都在中间，所以中间段要写得最多。' },
    { type: 'choice', q: '题目要求以“李华”的名义给笔友写信。信末署名应该写：', options: ['Li Hua', '你自己的真实姓名', '你的学校名和你的姓名'], answer: 0,
      explain: '书面表达不能泄露真实信息，不能写自己的真实姓名、校名；需要署名时用题目给的名字，这里是 Li Hua。' },
    { type: 'choice', q: '写作时发现写错了一个单词，最好的处理方法是：', options: ['用一条横线划掉，在旁边写上正确的词', '用笔涂成一个大黑块', '把整段划掉重新写'], answer: 0,
      explain: '卷面要清楚、少涂改。写错一个词，用一条横线划掉即可；涂黑块或大段划掉会让卷面很乱，影响印象分。' },
    { type: 'choice', q: '下面哪句不是中式英语、表达正确？', options: ['I like playing football very much.', 'I very like playing football.', 'I like very much playing football.'], answer: 0,
      explain: '“我非常喜欢……”要说 I like … very much，very much 放在宾语后面。very 不能直接修饰动词 like，very much 也不能插在 like 和宾语中间。' },
    { type: 'choice', q: '检查下面这句，它唯一的错误在哪里？<br>last Sunday, we went to the park with our teacher.', options: ['句首单词没有大写', '时态用错了', '句末标点用错了'], answer: 0,
      explain: '写完要检查“句首大写”：句子开头的 last 要大写成 Last。其余部分时态（went）、标点都正确。' },
    { type: 'choice', q: '完成一篇书面表达，下面哪个步骤顺序最合理？', options: ['审题 → 列提纲 → 成文 → 检查', '成文 → 审题 → 检查 → 列提纲', '列提纲 → 成文 → 审题'], answer: 0,
      explain: '先审题（人称、时态、文体、要点），再按三段式列提纲，然后成文，最后留 2 分钟检查。先写后审题容易跑题、漏要点。' }
  ],
  tests: [
    { type: 'choice', q: '题目：“上周六你参加了社区清洁活动，请写一篇短文记述这次活动。”你应主要使用：', options: ['一般过去时', '一般现在时', '现在进行时', '一般将来时'], answer: 0,
      explain: '“上周六”说明活动已经发生，记述过去的经历用一般过去时。' },
    { type: 'choice', q: '题目：“你的学校下个月将举办艺术节，请介绍你的参加计划。”最合适的句子是：', options: ['I am going to sing an English song at the art festival.', 'I sang an English song at the art festival.', 'I sing an English song at the art festival last month.'], answer: 0,
      explain: '“下个月”“计划”指将来，用 be going to。另外两句一个用了过去时，一个现在时配 last month，都不对。' },
    { type: 'choice', q: '题目：“请以‘My Best Friend’为题介绍你的好朋友。”介绍朋友的外貌和性格时，主要用：', options: ['第三人称 he / she，一般现在时', '第一人称 I，一般过去时', '第二人称 you，一般将来时'], answer: 0,
      explain: '介绍别人用第三人称 he / she；外貌、性格是现在的状态，用一般现在时，并注意动词加 -s，如 She likes …。' },
    { type: 'choice', q: '题目要点：1. 活动时间和地点；2. 活动内容；3. 你的感受。<br>某同学写道：“Last Sunday, our class visited the old people\'s home near our school. We cleaned the rooms, sang songs for the old people and talked with them.”<br>他还缺少哪个要点？', options: ['你的感受', '活动时间和地点', '活动内容'], answer: 0,
      explain: 'Last Sunday 和 the old people\'s home 是时间地点；cleaned / sang / talked 是活动内容；全文没有说自己的感受，应补充如 I felt very happy because …。' },
    { type: 'choice', q: '题目：“Protect Our Environment”。下面哪一句最适合做结尾？', options: ["Let's act now and make our hometown cleaner and more beautiful!", "That's all. I don't know what to write.", 'Yesterday it rained heavily.'], answer: 0,
      explain: '结尾要升华或号召，Let\'s act now … 既总结又呼吁行动。另外两句一个不像作文结尾，一个与话题无关。' },
    { type: 'fill', q: '找出并改正句中的错误，只填改正后的词：<br>My hometown are Quanzhou, a city with a long history.', answer: ['is'],
      explain: '主语 my hometown 是单数，be 动词用 is。主谓一致是写作中的常见扣分点。' },
    { type: 'fill', q: '改正中式英语：<br>I very like reading books in my free time.<br>→ I like reading books very ___ in my free time.（填一个词）', answer: ['much'],
      explain: '中文“我非常喜欢”不能直译成 I very like，very 不能直接修饰动词 like，正确说法是 I like … very much，所以空里填 much。' },
    { type: 'choice', q: '把下面三句排成一段通顺的短文：<br>① First, it can open our eyes to the world.<br>② In a word, we should read more good books.<br>③ Reading is good for us in many ways.', options: ['③①②', '①②③', '②③①', '③②①'], answer: 0,
      explain: '③ 点题（开头），① 用 First 展开好处（中间），② 用 In a word 总结（结尾），符合三段式。' },
    { type: 'choice', q: '要求 80–100 词的书面表达，下面哪种做法最好？', options: ['按要点列提纲，写 90 词左右，留时间检查', '只写 50 词，越短越不容易出错', '写 200 词，越长分数越高'], answer: 0,
      explain: '字数太少说明内容不充分，太多又容易出错、浪费时间。按要求写 90 词左右并留时间检查最稳妥。' },
    { type: 'choice', q: '下面哪个题目属于“话题作文”？', options: ['以“My Dream”为题写一篇短文', '给外教写一封邀请邮件', '以学生会名义写一则英语角通知'], answer: 0,
      explain: '“My Dream”是按话题写短文，属于话题作文。邀请邮件和通知都有固定格式，属于应用文。' },
    { type: 'choice', q: '题目：“请以学生会的名义，号召全校同学节约用水。”这篇书面表达属于：', options: ['应用文中的倡议书', '话题作文中的记叙文', '应用文中的书信'], answer: 0,
      explain: '“以学生会名义”“号召大家”是倡议书的典型情境，属于应用文；它不是讲一件事，也不是写给某一个人的信。' },
    { type: 'choice', q: '书面表达的要点有 4 条，某同学语言很漂亮，但漏写了 1 条。他的作文最可能：', options: ['很难进入高档', '一定得满分', '不受影响，因为语言好'], answer: 0,
      explain: '要点是阅卷最先看、最看重的。漏一条要点就很难进高档，语言再好也补不回来。' },
    { type: 'choice', q: '阅卷的四个方面里，“卷面”主要看什么？', options: ['字迹清楚、少涂改、标点和大小写正确', '用了多少个难词', '有没有写到每一个要点'], answer: 0,
      explain: '卷面看的是字迹、涂改和标点大小写。难词属于“语言”，要点是否写全属于“要点”。' },
    { type: 'choice', q: '题目：“假如你是李华，给笔友 Tom 回信，回答他的问题。”信中称呼 Tom 时应该用：', options: ['you', 'he', 'they'], answer: 0,
      explain: '书信是写给对方看的，称对方用第二人称 you，如 You asked me about …。' },
    { type: 'fill', q: '题目：介绍你的妹妹。补全句子（填一个词）：<br>My sister is eight years old. ___ likes drawing pictures very much.', answer: ['She', 'she'],
      explain: '介绍别人用第三人称，妹妹是女性，用 She，所以动词也用第三人称单数 likes。' },
    { type: 'choice', q: '题目：“记述你们班上周开展的一次班会活动。”叙述全班一起做的事，主语多用：', options: ['we', 'you', 'they'], answer: 0,
      explain: '写自己参与的经历用第一人称，全班一起做的事用 we，如 We sang songs and shared our stories.' },
    { type: 'fill', q: '题目：“介绍你暑假的打算。”用所给词的适当形式填空（用 will 结构，填两个词）：<br>Next summer, my family ___ ___ (travel) to Beijing.', answer: ['will travel'],
      explain: '“打算、计划”谈的是将来，用一般将来时 will + 动词原形：will travel。' },
    { type: 'fill', q: '题目：“介绍你的家乡。”用所给词的适当形式填空：<br>My hometown ___ (have) a lot of delicious food.', answer: ['has'],
      explain: '介绍家乡现在的情况用一般现在时；主语 my hometown 是第三人称单数，have 变成 has。' },
    { type: 'choice', q: '题目：“说说你现在的爱好，以及你是怎样喜欢上它的。”下面哪组句子时态正确？', options: ['I like painting very much. I fell in love with it when I was seven.', 'I liked painting very much now. I fall in love with it when I was seven.', 'I like painting very much. I fall in love with it when I am seven.'], answer: 0,
      explain: '现在的爱好用一般现在时 like；七岁时的事已经过去，用一般过去时 fell / was。第二组 liked 和 now 矛盾，第三组把过去的事写成了现在时。' },
    { type: 'choice', q: '题目：“你认为中学生应该带手机进校园吗？请谈谈你的看法和理由。”这篇文章属于：', options: ['议论文（谈看法）', '记叙文（讲一件事）', '说明文（介绍一个地方）'], answer: 0,
      explain: '“谈看法和理由”是议论文，开头亮明观点，中间列理由，结尾总结或提建议。' },
    { type: 'choice', q: '题目：“请讲述你第一次自己做饭的经历。”这篇文章属于：', options: ['记叙文', '说明文', '倡议书'], answer: 0,
      explain: '“讲述一次经历”就是讲一件事，属于记叙文，一般按时间顺序写，主要用一般过去时。' },
    { type: 'choice', q: '题目要点：1. 你最喜欢的书；2. 书的主要内容；3. 推荐理由；4. ……<br>第 4 点只有省略号，应该怎么办？', options: ['自己补充一个相关要点，如读这本书的收获', '不用管它', '写一个和书无关的内容凑字数'], answer: 0,
      explain: '省略号表示需要自己补充一条要点，内容必须和话题相关，比如读书的收获或感受。不写就算漏要点，写无关内容就是跑题。' },
    { type: 'choice', q: '审题时“看要点”，下面哪种做法最好？', options: ['把要点编上号，写完一点就在旁边打勾', '只记住第一个要点就开始写', '把不好写的要点删掉一两个'], answer: 0,
      explain: '要点编号、逐条打勾，可以保证一条都不漏。删掉或忘记要点都会直接掉档。' },
    { type: 'choice', q: '题目：“My Favorite Season”。下面哪一句最适合做开头？', options: ['There are four seasons in a year, and autumn is my favorite.', 'In a word, autumn is the best season.', 'Then we went home happily.'], answer: 0,
      explain: '开头 1–2 句直接点题：一年四季中我最喜欢秋天。In a word 是总结用语，放在结尾；Then … 是叙事中间的句子。' },
    { type: 'choice', q: '题目：“An Unforgettable Experience”。下面哪一句最适合做开头？', options: ['Last summer, I had an unforgettable experience in the countryside.', 'I think everyone should work hard.', "Let's act now!"], answer: 0,
      explain: '记叙文开头直接交代时间并点出“难忘的经历”。第二句和题目无关，Let\'s act now! 是号召性结尾。' },
    { type: 'choice', q: 'First, we cleaned the classroom. ___, we put some pictures on the wall. Finally, we went home happily.', options: ['Then', 'In a word', 'However'], answer: 0,
      explain: '三个动作按顺序发生，First … Then … Finally 串起来。In a word 表总结，However 表转折，都不合句意。' },
    { type: 'fill', q: '用顺序连接词补全（填一个词）：<br>First, we washed the vegetables. Then we cooked them. F___, we enjoyed a big dinner together.', answer: ['Finally', 'finally'],
      explain: '最后一个动作，用 Finally（最后）。First → Then → Finally 是中间段最常用的顺序连接词。' },
    { type: 'choice', q: '题目：“My Plan for the Summer Holiday”。下面哪一句最适合做结尾？', options: ['I believe it will be a meaningful holiday.', 'First, I will read some books.', 'Last summer I went to Xiamen.'], answer: 0,
      explain: '结尾表达期待或信心最合适。First … 是中间段的第一个要点；Last summer … 讲的是去年的事，和“计划”无关。' },
    { type: 'choice', q: '某同学 90 词的作文，开头用了 50 词介绍背景，中间写要点只用了 25 词，结尾 15 词。最大的问题是：', options: ['开头太长，要点展开得太少', '总字数不够', '没有结尾'], answer: 0,
      explain: '总数 90 词符合要求，也有结尾。问题在于分配：开头应约 15 词，中间约 60 词，要点都在中间，只写 25 词肯定展开不够。' },
    { type: 'choice', q: '按“开头 15 词 + 中间 60 词 + 结尾 15 词”来安排，中间部分写几句比较合适？', options: ['4–6 句', '1 句', '15 句以上'], answer: 0,
      explain: '中间段约 60 词，一句话十来个词，大约 4–6 句，正好把几个要点展开。' },
    { type: 'choice', q: '题目要点：1. 你的爱好；2. 爱好带来的好处；3. 给同学的建议。<br>某同学写道：“I like playing table tennis. It makes me strong and helps me relax. I often play it with my father after school.”<br>他漏写了哪个要点？', options: ['给同学的建议', '你的爱好', '爱好带来的好处'], answer: 0,
      explain: 'I like playing table tennis 是爱好；makes me strong and helps me relax 是好处；全文没有给同学提建议，应补上如 I suggest you … / You\'d better …。' },
    { type: 'fill', q: '短文中有一处时态错误，找出并只填改正后的词：<br>Last Sunday, we went to the beach. We collected rubbish and some of us talk with the visitors about protecting the sea.', answer: ['talked'],
      explain: '写的是上周日的事，前面都用了过去式 went / collected，写着写着变成 talk 就是“时态乱跳”，应改为 talked。' },
    { type: 'choice', q: '记述过去的经历，下面哪组句子没有时态错误？', options: ['We got up early and climbed the hill. We were tired but happy.', 'We got up early and climb the hill. We were tired but happy.', 'We get up early and climbed the hill. We are tired but happy.'], answer: 0,
      explain: '讲过去的经历，每个动词都要用过去式：got / climbed / were。另外两组中途跳回了现在时。' },
    { type: 'choice', q: '下面哪句表达正确？', options: ['My father likes reading newspapers very much.', 'My father very likes reading newspapers.', 'My father likes very reading newspapers.'], answer: 0,
      explain: 'very 不能直接修饰动词 like，要说 like … very much，very much 放在宾语后面。' },
    { type: 'choice', q: '要求 80–100 词的书面表达，下面哪个字数最合适？', options: ['92 词', '45 词', '180 词'], answer: 0,
      explain: '按要求写，90 词左右最稳妥。45 词内容不够，180 词太长，容易出错又浪费时间。' },
    { type: 'choice', q: '题目要求以“李华”的名义写信，某同学在信末写上了自己的真实姓名。这样做：', options: ['不行，不能泄露真实信息，应署名 Li Hua', '可以，这样显得更真实', '可以，只要名字拼写正确就行'], answer: 0,
      explain: '书面表达中不能出现真实的姓名、校名，需要署名时一律用题目给的名字 Li Hua。' },
    { type: 'choice', q: '写“我的学校”这篇短文，提到学校名称时应该：', options: ['不写真实校名，用 my school / our school 代替', '写出自己学校的全称', '写出学校全称和自己的班级'], answer: 0,
      explain: '为了不泄露信息，文中不能出现真实校名，用 my school / our school 即可。' },
    { type: 'choice', q: '考场上，下面哪种做法最有利于卷面分？', options: ['先列提纲再动笔，减少大段涂改', '想到哪写到哪，写错了整段涂黑', '字写得越小越好，可以多写几句'], answer: 0,
      explain: '先列提纲，思路清楚就不会大段涂改，卷面自然干净。整段涂黑和字太小都会让卷面难以辨认。' },
    { type: 'fill', q: '检查单复数：下面句子有一处错误，只填改正后的词：<br>There are many beautiful flower in my hometown.', answer: ['flowers'],
      explain: 'There are many 后面接可数名词复数，flower 要改为 flowers。单复数是写完必查的项目。' },
    { type: 'choice', q: '检查大小写：下面哪一句没有错误？', options: ['My best friend is Lucy, and she comes from Xiamen.', 'My best friend is lucy, and she comes from Xiamen.', 'My best friend is Lucy, and she comes from xiamen.'], answer: 0,
      explain: '人名、地名都是专有名词，首字母要大写：Lucy、Xiamen。' },
    { type: 'choice', q: '把“Planting Trees”的提纲排成正确顺序：<br>① tired but happy, protect the environment<br>② last Saturday, the hill near our school<br>③ dig holes, plant trees, water them', options: ['②③①', '①②③', '③②①', '②①③'], answer: 0,
      explain: '提纲按三段式：开头交代时间地点 ②，中间写做了什么 ③，结尾写感受和升华 ①。' },
    { type: 'choice', q: '审题后先列提纲，主要好处是：', options: ['按要点安排好每段写什么，防止漏点和跑题', '让作文的字数自动变多', '写完就不用再检查了'], answer: 0,
      explain: '提纲把每个要点放进开头、中间、结尾，写的时候照着写就不容易漏点跑题。列了提纲，写完仍要检查。' },
    { type: 'choice', say: 'In a word, we should all do something to protect our environment.', q: '听句子，判断它最适合放在作文的哪个位置。', options: ['结尾', '开头', '中间第一个要点'], answer: 0,
      explain: '句子以 In a word（总之）开头，并号召大家保护环境，是典型的结尾句：总结 + 号召。' }
  ],
  practice: [
    { title: 'A Day I Will Never Forget',
      prompt: `<p>生活中总有一些日子让我们难以忘怀。请以“A Day I Will Never Forget”为题，写一篇英语短文。要点如下：</p>
        <ol><li>那一天的时间和地点；</li><li>发生了什么事（至少写两件具体的事）；</li><li>你的感受或收获。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '三个要点（时间地点、发生的事、感受收获）都写到了',
        '人称用第一人称 I / we，叙述过去的事用一般过去时，动词过去式没写错',
        '开头一两句点题，结尾有感受或升华',
        '用了 First / Then / In the afternoon 等连接词串起事情',
        '至少用了一个高级句型（如 although、not only…but also、so…that）',
        '拼写、句首大写、句末标点正确',
        '字数在 80–100 词之间，没有出现真实姓名和校名'
      ],
      sample: `<p><b>A Day I Will Never Forget</b></p>
        <p>Last October, our class went to Gulangyu in Xiamen for a school trip. It was a day I will never forget.</p>
        <p>In the morning, we walked along the quiet streets and visited the Piano Museum. Our guide told us many stories about the island. In the afternoon, we were divided into groups to collect rubbish on the beach. Although we were tired, we felt proud when the beach became clean again.</p>
        <p>This trip not only showed me how beautiful Xiamen is but also taught me that everyone can do something for the environment. I hope to visit Gulangyu again.</p>`,
      notes: `<ul>
        <li>开头 It was a day I will never forget. 直接扣题，后面省略了 that 的定语从句很自然。</li>
        <li>In the morning / In the afternoon 按时间顺序展开，层次清楚。</li>
        <li>Although we were tired, we felt proud … 用让步状语从句写感受，注意没有再加 but。</li>
        <li>not only … but also … 一句同时写了“看到美景”和“学到道理”，自然升华主题。</li>
      </ul>` },
    { title: 'My Plan for the Summer Holiday',
      prompt: `<p>暑假就要到了，你有什么打算？请以“My Plan for the Summer Holiday”为题写一篇短文。要点如下：</p>
        <ol><li>你打算做哪些事（至少两件）；</li><li>为什么要做这些事；</li><li>你对这个假期的期待。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '写了至少两件计划，并说明了原因，最后有期待',
        '谈计划用 be going to / will / plan to，没有错用过去时',
        '开头点题，结尾表达期待',
        '用了 First / Second / Besides 等连接词',
        '至少用了一个高级句型（如 so that、because 引导的从句）',
        '拼写、大小写、标点正确',
        '字数在 80–100 词之间'
      ],
      sample: `<p><b>My Plan for the Summer Holiday</b></p>
        <p>The summer holiday is coming. I have made a plan to make it meaningful.</p>
        <p>First, I am going to read at least five books, because reading can open my eyes to the world. Second, I will learn to swim with my father, so that I can keep fit and stay safe in the water. Besides, I plan to visit my grandparents in the countryside and help them with some farm work. I miss them very much.</p>
        <p>I believe it will be a busy but happy holiday. I am really looking forward to it!</p>`,
      notes: `<ul>
        <li>be going to、will、plan to 交替使用，表达将来又不显得重复。</li>
        <li>so that I can keep fit … 用目的状语从句说明原因，比只写 because 更丰富。</li>
        <li>a busy but happy holiday 用 but 连接两个形容词，结尾简洁有力。</li>
      </ul>` }
  ]
},

/* ================= 高分句型与连接词 ================= */
{
  id: 's-writing-polish', title: '书面表达：高分句型与连接词', short: '写作·高分句型', module: 'skill', grade: 9, freq: 3,
  prereqs: ['s-writing-structure', 'g-attributive', 'g-it-pattern'],
  tip: '要点写全之后，决定作文能否进高档的是语言：恰当的连接词和一两个用对的高级句型，头号陷阱是生搬硬套、句型用错反而扣分。（具体题量分值以当年《考试说明》为准）',
  learn: [
    { h: '题型说明：为什么要“润色”', html: `
      <p>同样写全了要点，有的作文只拿中档，有的拿高档，差别主要在<b>语言</b>：</p>
      <ul>
        <li>句子之间有没有<b>连接词</b>，读起来是否连贯；</li>
        <li>有没有<b>简单句 + 复合句</b>的搭配，而不是一连串 I like … I like …；</li>
        <li>高级句型有没有<b>用对</b>。</li>
      </ul>
      <p>目标不需要很高：一篇 90 词的作文里，<b>4–5 个连接词 + 2–3 个用对的好句型</b>就足够出彩。</p>` },
    { h: '连接词按功能分类', html: `
      <table class="tbl">
        <tr><th>功能</th><th>常用词</th><th>例句</th></tr>
        <tr><td>顺序</td><td>First / Second / Then / Finally；First of all / At last</td><td>First, we cleaned the room. Then we cooked dinner.</td></tr>
        <tr><td>递进</td><td>Besides / What's more / Also / not only … but also</td><td>Sports keep us healthy. Besides, they help us make friends.</td></tr>
        <tr><td>转折</td><td>but / However / although / though</td><td>The work was hard. However, we didn't give up.</td></tr>
        <tr><td>因果</td><td>because / so / because of / as a result</td><td>It rained heavily, so the game was put off.</td></tr>
        <tr><td>举例</td><td>for example / such as</td><td>We can do many things, such as planting trees.</td></tr>
        <tr><td>总结</td><td>In a word / In short / All in all</td><td>In a word, reading makes our life better.</td></tr>
      </table>
      <p class="warn">because 和 so 不能同时用；although 和 but 不能同时用。</p>` },
    { h: '八个高分句型', html: `
      <table class="tbl">
        <tr><th>句型</th><th>例句</th></tr>
        <tr><td>定语从句</td><td>Ms. Lin is a teacher <b>who</b> always encourages us.</td></tr>
        <tr><td>宾语从句（陈述语序）</td><td>I hope <b>that</b> my dream will come true.<br>I don't know <b>where he lives</b>.</td></tr>
        <tr><td>It is + adj. + (for sb.) to do</td><td><b>It is</b> important <b>for us to</b> protect the environment.</td></tr>
        <tr><td>not only … but also …</td><td>Reading is <b>not only</b> fun <b>but also</b> useful.</td></tr>
        <tr><td>so … that …</td><td>The film was <b>so</b> moving <b>that</b> many of us cried.</td></tr>
        <tr><td>感叹句</td><td><b>What a</b> beautiful city Fuzhou is! / <b>How</b> beautiful Fuzhou is!</td></tr>
        <tr><td>as … as possible</td><td>We should help others <b>as</b> much <b>as possible</b>.</td></tr>
        <tr><td>the + 比较级 …, the + 比较级 …</td><td><b>The harder</b> you work, <b>the better</b> you will do.</td></tr>
      </table>
      <div class="rhyme">句型不在多，用对才算数；<br>开头一个感叹句，中间从句来帮助，结尾比较显功夫。</div>` },
    { h: '常见陷阱', html: `
      <ul>
        <li><b>宾语从句用了疑问语序</b>：<span class="en">I don't know where does he live.</span> ✗ → <span class="en">where he lives</span> ✓</li>
        <li><b>关系词用错</b>：先行词是物，不能用 who：<span class="en">the book which / that I bought</span>。</li>
        <li><b>It is … to do 漏 to</b>：<span class="en">It is important for us to protect …</span></li>
        <li><b>not only … but also 连接主语</b>：谓语跟最近的主语一致：<span class="en">Not only Tom but also his parents <b>are</b> …</span></li>
        <li><b>as … as possible 中间词性</b>：修饰动词用副词：<span class="en">run as fast as possible, come back as quickly as possible</span>。</li>
        <li><b>堆砌</b>：一句话里硬塞三四个句型，意思不清反而失分。</li>
      </ul>` },
    { h: '完整示范：把普通句升级', html: `
      <p><b>原文</b>（意思对，但很平）：</p>
      <p class="ex">My English teacher is Ms. Wang. She is kind. She helps us. Her class is interesting. We all like her.<span class="zh">全是简单句，没有连接词。</span></p>
      <p><b>升级思路</b>：① 用定语从句合并前两句；② 用 not only … but also 合并“善良”和“帮助我们”；③ 用 so … that 写“课有趣→大家喜欢”。</p>
      <p class="ex">Ms. Wang, who teaches us English, is not only kind but also always ready to help us. Her classes are so interesting that we all love them.<span class="zh">王老师教我们英语，她不仅和蔼，而且总是乐于帮助我们。她的课非常有趣，我们都很喜欢。</span></p>
      <p class="small">同样的意思，两句话就把三个好句型都用上了，而且每个都用对，这就是“润色”。</p>` }
  ],
  examples: [
    { type: 'choice', q: '选出最好地合并以下两句的一项：<br>The book was very interesting. I read it twice.', options: ['The book was so interesting that I read it twice.', 'The book was such interesting that I read it twice.', 'The book was so interesting but I read it twice.'], answer: 0,
      explain: '“太……以至于……”修饰形容词 interesting 用 so … that；such 后面接名词，不能直接接形容词；but 表转折，意思不对。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>The more we practice, the ___ we will speak English.（good）', answer: ['better'],
      explain: 'the + 比较级, the + 比较级 句型；good / well 的比较级是 better。' },
    { type: 'choice', q: '下面哪一种写法最好？', options: ['Ms. Wang, who teaches us English, is kind and always ready to help us.', 'Ms. Wang is a teacher who she is so kind that not only helps us but also what a good teacher.', 'Ms. Wang. She is kind. She helps us. We like her.'], answer: 0,
      explain: '第一句用一个定语从句把“是谁、性格、帮助我们”自然合并，简单句和复合句搭配，读起来连贯。第二句一句话硬塞好几个句型，语法也错了（who 后多了 she），这就是“堆砌”；第三句全是短的简单句，读起来很平。' },
    { type: 'choice', q: '一篇 90 词左右的作文，在语言“润色”上，下面哪种目标最合适？', options: ['用 4–5 个连接词，加上 2–3 个用对的高分句型', '每一句都必须用一个高级句型', '只用简单句，一个连接词也不用'], answer: 0,
      explain: '目标不需要很高：4–5 个连接词让文章连贯，2–3 个用对的好句型就足够出彩。句句用高级句型容易出错、堆砌；完全不用连接词则显得很平。' },
    { type: 'choice', q: 'We got to the farm at 8 a.m. ___, we picked apples. At last, we had lunch under the trees.', options: ['First', 'In a word', 'However'], answer: 0,
      explain: '几个动作按先后顺序展开，用 First … At last 这一组顺序连接词。In a word 用于总结，However 表转折，都不合句意。' },
    { type: 'fill', q: '用递进连接词补全（填一个词，首字母 W）：<br>Sports keep us healthy. ___ more, they help us make friends.', answer: ["What's", 'What’s'],
      explain: '后一句在“使我们健康”之外再加一个好处，是递进关系，用 What\'s more（而且、此外），和 Besides 意思相近。' },
    { type: 'choice', q: 'Tom is not very tall. ___, he plays basketball very well.', options: ['However', 'Besides', 'So'], answer: 0,
      explain: '“个子不高”和“篮球打得好”意思相反，是转折关系，用 However（然而），后面加逗号。Besides 表递进，So 表结果。' },
    { type: 'choice', q: 'It rained heavily, ___ the sports meeting was put off.', options: ['so', 'because', 'but'], answer: 0,
      explain: '“下大雨”是原因，“运动会推迟”是结果，前因后果用 so 连接。because 后面接原因，but 表转折，都不对。' },
    { type: 'choice', q: 'We can do many things to protect the earth, ___ saving water and planting trees.', options: ['such as', 'as a result', 'however'], answer: 0,
      explain: 'saving water and planting trees 是在列举“很多事情”的例子，用 such as（例如），后面直接接名词或动名词。' },
    { type: 'choice', q: '下面哪个连接词用来做“总结”？', options: ['All in all', 'Besides', 'Then'], answer: 0,
      explain: 'In a word / In short / All in all 都表示“总之”，用于结尾总结。Besides 表递进，Then 表顺序。' },
    { type: 'fill', q: '下面句子多了一个词。保留 Because，填出应该删去的词：<br>Because he was ill, so he didn\'t go to school yesterday.', answer: ['so'],
      explain: '英语中 because 和 so 不能同时用，保留 Because 就要删去 so。同理，although 和 but 也不能同时用。' },
    { type: 'choice', q: 'Ms. Lin is a teacher ___ always encourages us to speak English.', options: ['who', 'which', 'what'], answer: 0,
      explain: '先行词 a teacher 是人，关系代词用 who（也可用 that）。which 指物，what 不能引导定语从句。' },
    { type: 'choice', q: 'Can you tell me ___?', options: ['where the library is', 'where is the library', 'where does the library be'], answer: 0,
      explain: '宾语从句要用陈述语序：疑问词 + 主语 + 谓语，所以是 where the library is。where is the library 是疑问语序，只能单独成句。' },
    { type: 'choice', q: '___ is important for us to learn how to save water.', options: ['It', 'This', 'That'], answer: 0,
      explain: 'It is + 形容词 + for sb. + to do sth. 句型中，It 是形式主语，真正的主语是后面的 to learn …，这里只能用 It。' },
    { type: 'fill', q: '用 not only … but also 合并句子（填两个词）：<br>Reading is fun. Reading is useful.<br>→ Reading is not only fun ___ ___ useful.', answer: ['but also'],
      explain: 'not only … but also … 表示“不仅……而且……”，前后连接的成分要对称（fun 和 useful 都是形容词）。' },
    { type: 'choice', q: '___ fast he runs!', options: ['How', 'What', 'What a'], answer: 0,
      explain: '感叹的中心是副词 fast，后面没有名词，用 How + 形容词/副词 + 主语 + 谓语。What 后面要接名词。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>Please check your answers as ___ as possible before you hand in the paper.（careful）', answer: ['carefully'],
      explain: 'as … as possible 修饰动词 check，中间要用副词：careful → carefully。' }
  ],
  tests: [
    { type: 'choice', q: 'Doing sports is good for our health. ___, it can help us make new friends.', options: ['Besides', 'However', 'Instead', 'Finally'], answer: 0,
      explain: '后一句在前一句“对健康有好处”的基础上再加一个好处，是递进关系，用 Besides（此外）。' },
    { type: 'choice', q: 'The math problem was very difficult. ___, I didn\'t give up and finally worked it out.', options: ['However', 'Because', 'For example'], answer: 0,
      explain: '“很难”和“没有放弃”意思相反，是转折关系，用 However。' },
    { type: 'choice', q: '下面哪一句是正确的？', options: ['Although it rained heavily, we still went on with the activity.', 'Although it rained heavily, but we went on with the activity.', 'Because it rained heavily, so we stopped the activity.'], answer: 0,
      explain: 'although 和 but 不能同时用，because 和 so 也不能同时用。只有第一句正确，still 可以和 although 搭配。' },
    { type: 'fill', q: '找出并改正句中的错误，只填改正后的词：<br>This is the book who I bought in Fuzhou yesterday.<br>（错误在关系代词上）', answer: ['which', 'that'],
      explain: '先行词 the book 是物，关系代词不能用 who，应改为 which 或 that。' },
    { type: 'fill', q: '把句子改成正确的宾语从句：<br>I don\'t know where does he live.<br>→ I don\'t know where ___.（填两个词）', answer: ['he lives'],
      explain: '宾语从句要用陈述语序：where + 主语 + 谓语，去掉助动词 does，live 随主语 he 变成 lives。' },
    { type: 'fill', q: '补全句子（填一个词）：<br>It is important for us ___ protect the environment.', answer: ['to'],
      explain: 'It is + 形容词 + for sb. + to do sth. 句型，to 不能漏。' },
    { type: 'choice', q: '___ beautiful city Fuzhou is!', options: ['What a', 'How', 'What', 'How a'], answer: 0,
      explain: '感叹的中心是名词短语 beautiful city（可数名词单数），用 What a + 形容词 + 名词 + 主语 + 谓语。' },
    { type: 'choice', q: 'Not only Tom but also his parents ___ volunteers at the city museum.', options: ['are', 'is', 'am'], answer: 0,
      explain: 'not only … but also 连接主语时，谓语和最近的主语 his parents 保持一致，用 are。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>The doctor told me to come back as ___ as possible.（quick）', answer: ['quickly'],
      explain: 'as … as possible 修饰动词 come back，中间要用副词 quickly。' },
    { type: 'choice', q: '一篇谈“读书好处”的作文，结尾段最适合用哪个连接词开头？', options: ['In a word', 'For example', 'However', 'First of all'], answer: 0,
      explain: '结尾段是总结，用 In a word（总之）。For example 用于举例，However 表转折，First of all 用于开头列举。' },
    { type: 'choice', q: '一篇 90 词的作文，下面关于“润色”的说法正确的是：', options: ['几个连接词加两三个用对的好句型就足够出彩', '高级句型越多越好，最好一句话里用上三四个', '只要要点写全，语言好坏不影响档次'], answer: 0,
      explain: '要点写全后，档次主要看语言：4–5 个连接词 + 2–3 个用对的好句型就够了。一句话堆三四个句型意思不清反而失分。' },
    { type: 'choice', q: '原句：I have a friend. She is from Xiamen. She likes singing.<br>下面哪一种“升级”最好？', options: ['I have a friend who is from Xiamen and likes singing.', 'I have a friend who she is from Xiamen, so that she likes singing.', 'I have a friend. Who is from Xiamen. Who likes singing.'], answer: 0,
      explain: '用 who 引导的定语从句把三个简单句合成一句，自然又正确。第二句 who 后多了 she，so that 表目的也不合逻辑；第三句把定语从句拆成了单独的句子，是错的。' },
    { type: 'fill', q: '用顺序连接词补全（填一个词）：<br>First, put the rice into the pot. Then add some water. F___, cook it for twenty minutes.', answer: ['Finally', 'finally'],
      explain: '介绍步骤用 First → Then → Finally，最后一步用 Finally。' },
    { type: 'choice', q: '介绍做一件事的步骤时，下面哪组连接词的顺序正确？', options: ['First … Then … Finally', 'Finally … First … Then', 'In a word … First … Then'], answer: 0,
      explain: '顺序连接词要按先后排列：First（首先）→ Then（然后）→ Finally（最后）。In a word 是总结，不能放在最前面。' },
    { type: 'choice', q: 'The museum is free for students. ___, it is open every day except Monday.', options: ["What's more", 'However', 'In a word'], answer: 0,
      explain: '“对学生免费”之外再补充一个优点“每天开放”，是递进关系，用 What\'s more。' },
    { type: 'fill', q: '用转折连接词补全（填一个词，首字母 H）：<br>I wanted to play football after school. ___, it was raining heavily outside.', answer: ['However', 'however'],
      explain: '“想去踢球”和“外面下大雨”形成转折，用 However，后面加逗号。' },
    { type: 'choice', q: 'The football match was put off ___ the heavy rain.', options: ['because of', 'because', 'so'], answer: 0,
      explain: '空后 the heavy rain 是名词短语，表原因用介词短语 because of；because 后面要接句子，so 表结果。' },
    { type: 'fill', q: '用因果连接词补全（填一个词）：<br>He studied very hard every day. A___ a result, he passed the exam easily.', answer: ['As', 'as'],
      explain: 'as a result 意为“结果”，引出前面原因带来的结果。' },
    { type: 'choice', q: 'I was ill yesterday, ___ I didn\'t go to school.', options: ['so', 'because', 'although'], answer: 0,
      explain: '“生病”是原因，“没去上学”是结果，前因后果用 so。because 后面要接原因，although 表让步。' },
    { type: 'choice', q: 'I like many kinds of fruit, ___ apples, bananas and oranges.', options: ['such as', 'as a result', 'in a word'], answer: 0,
      explain: '后面列举了几种水果作例子，用 such as。as a result 表结果，in a word 表总结。' },
    { type: 'fill', q: '用举例连接词补全（填一个词）：<br>There are many ways to stay healthy. F___ example, we can run every morning.', answer: ['For', 'for'],
      explain: 'for example 意为“例如”，常放在句首，后面加逗号，再接一个完整的句子。' },
    { type: 'fill', q: '用总结连接词补全（填一个词）：<br>___ short, we should all do our part to protect the earth.（首字母 I）', answer: ['In', 'in'],
      explain: 'in short 意为“总之、简而言之”，和 In a word / All in all 一样用于结尾总结。' },
    { type: 'fill', q: '下面句子多了一个词。保留 Although，填出应该删去的词：<br>Although he is only ten, but he knows a lot about science.', answer: ['but'],
      explain: 'although 和 but 不能同时用。保留 Although 就要删去 but。' },
    { type: 'choice', q: '下面哪一句是正确的？', options: ['He was very tired, so he went to bed early.', 'Because he was very tired, so he went to bed early.', 'Although he was very tired, but he went to bed late.'], answer: 0,
      explain: 'because 和 so 不能同时用，although 和 but 也不能同时用，只有第一句只用了一个 so，是正确的。' },
    { type: 'choice', q: 'The girl ___ is singing under the tree is my sister.', options: ['who', 'which', 'whose'], answer: 0,
      explain: '先行词 the girl 是人，在从句中作主语，用 who。which 指物；whose 表“……的”，后面要接名词。' },
    { type: 'fill', q: '填一个关系代词：<br>Fuzhou is a city ___ has a history of more than 2,200 years.', answer: ['which', 'that'],
      explain: '先行词 a city 是物，关系代词用 which 或 that，不能用 who。' },
    { type: 'choice', q: 'I don\'t know ___ yesterday.', options: ['what he did', 'what did he do', 'what does he do'], answer: 0,
      explain: '宾语从句用陈述语序，不用助动词 did 提前；yesterday 表过去，所以是 what he did。' },
    { type: 'fill', q: '把两句合成宾语从句（填一个词）：<br>Where is the post office? I want to know.<br>→ I want to know where the post office ___.', answer: ['is'],
      explain: '宾语从句要用陈述语序，把 is 放到主语 the post office 后面：where the post office is。' },
    { type: 'fill', q: '补全句子（填一个词）：<br>I hope ___ my dream of becoming a doctor will come true.', answer: ['that'],
      explain: 'hope 后面接 that 引导的宾语从句，that 可以省略，但这里要求填一个词，填 that。' },
    { type: 'choice', q: 'It is not easy ___ us to learn to swim well.', options: ['for', 'of', 'to'], answer: 0,
      explain: 'It is + 形容词 + for sb. + to do sth.，easy 描述事情，用 for us。' },
    { type: 'fill', q: '用所给词的适当形式填空（填两个词）：<br>It is necessary for students ___ ___ (get) enough sleep.', answer: ['to get'],
      explain: 'It is + 形容词 + for sb. + to do 句型，to 不能漏，填 to get。' },
    { type: 'choice', q: 'He can not only sing ___ dance.', options: ['but also', 'and also', 'or'], answer: 0,
      explain: 'not only 后面固定搭配 but also，表示“不仅……而且……”。' },
    { type: 'choice', q: 'Not only my sister but also I ___ fond of music.', options: ['am', 'is', 'are'], answer: 0,
      explain: 'not only … but also 连接主语，谓语和最近的主语 I 一致，用 am。' },
    { type: 'choice', q: 'He was ___ tired that he fell asleep as soon as he got home.', options: ['so', 'such', 'too'], answer: 0,
      explain: 'so + 形容词 + that 表示“太……以至于……”。such 后面要接名词，too 不和 that 搭配。' },
    { type: 'fill', q: '用 so … that 合并句子（每空一词）：<br>The film was very moving. Many of us cried.<br>→ The film was ___ moving ___ many of us cried.', answer: ['so that', 'so, that'],
      explain: '“太感人以至于很多人哭了”：so + 形容词 moving + that + 结果从句。' },
    { type: 'fill', q: '用感叹句补全（填一个词，首字母 H）：<br>___ beautiful the West Lake in Fuzhou is!', answer: ['How', 'how'],
      explain: '感叹的中心是形容词 beautiful，后面紧跟主语和谓语，没有名词，用 How。' },
    { type: 'choice', q: '___ interesting books they are!', options: ['What', 'What a', 'How'], answer: 0,
      explain: '中心词 books 是可数名词复数，用 What + 形容词 + 复数名词，不能加 a。How 后面要直接接形容词，不能接名词。' },
    { type: 'choice', q: 'We should save water as much as ___.', options: ['possible', 'possibly', 'we possible'], answer: 0,
      explain: '固定结构 as … as possible，“尽可能……”，最后一个词是 possible。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>The ___ (hard) you work, the better grades you will get.', answer: ['harder'],
      explain: 'the + 比较级, the + 比较级 句型，hard 的比较级是 harder。' },
    { type: 'choice', q: 'The more books you read, ___ you will know.', options: ['the more', 'more', 'the most'], answer: 0,
      explain: '“越……越……”要用 the + 比较级, the + 比较级，后半句的 the 也不能漏。' },
    { type: 'choice', say: 'Besides, playing sports can help us make new friends.', q: '听句子，判断开头的连接词表示什么关系。', options: ['递进', '转折', '因果'], answer: 0,
      explain: '句子以 Besides（此外）开头，在前文基础上再补充一个好处，表示递进。' }
  ],
  practice: [
    { title: 'My Favorite Teacher',
      prompt: `<p>学校英语报正在开展“感恩老师”征文活动。请以“My Favorite Teacher”为题写一篇短文。要点如下：</p>
        <ol><li>这位老师是谁、教什么；</li><li>他 / 她的性格特点，并用一件小事说明；</li><li>你想对他 / 她说的话。</li></ol>
        <p class="small">要求：80–100 词；<b>至少使用三种本节学过的高分句型</b>；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '三个要点（是谁教什么、性格加一件小事、想说的话）都写到了',
        '介绍老师用一般现在时，讲小事用一般过去时，时态切换正确',
        '开头点题，结尾表达感谢或决心',
        '用了至少 3 个连接词，如 not only…but also / However / From then on',
        '至少用对了三种高分句型（定语从句、so…that、as…as possible、感叹句等）',
        '没有出现 although…but、because…so 这类错误搭配',
        '拼写、大小写、标点正确',
        '字数在 80–100 词之间'
      ],
      sample: `<p><b>My Favorite Teacher</b></p>
        <p>Of all my teachers, Ms. Chen, who teaches us English, is my favorite.</p>
        <p>She is not only kind but also patient. Whenever we have problems, she explains them to us as clearly as possible. Last term I was so nervous that I couldn't say a word in class. She smiled at me and said, "Take it easy. Mistakes help you learn." From then on, I became more and more confident.</p>
        <p>What a wonderful teacher she is! I want to say to her, "Thank you, Ms. Chen. I will study harder and never let you down."</p>`,
      notes: `<ul>
        <li>开头 who teaches us English 是非限制性定语从句，一句话交代了“是谁、教什么”。</li>
        <li>not only kind but also patient、as clearly as possible、so nervous that … 三个句型都放在要点里，自然不生硬。</li>
        <li>引用老师原话 "Take it easy. Mistakes help you learn." 让小事更生动。</li>
        <li>结尾先用感叹句 What a wonderful teacher she is! 抒发感情，再直接写出想对老师说的话，扣住要点 3。</li>
      </ul>` },
    { title: 'Reading Makes Life Better',
      prompt: `<p>学校正在开展“书香校园”活动。请以“Reading Makes Life Better”为题写一篇短文。要点如下：</p>
        <ol><li>读书的好处（至少两点）；</li><li>你的读书习惯；</li><li>对同学们的建议。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '写了至少两点好处、自己的读书习惯和给同学的建议',
        '谈看法和习惯用一般现在时，第三人称单数动词加 -s',
        '开头点题，结尾有总结或号召',
        '用了顺序、递进、总结三类连接词（如 First of all / Besides / In a word）',
        '至少用对一个高分句型（如 the more…the more…、It is…to do）',
        '拼写、大小写、标点正确',
        '字数在 80–100 词之间'
      ],
      sample: `<p><b>Reading Makes Life Better</b></p>
        <p>As we all know, reading plays an important role in our life. In my opinion, it brings us a lot of benefits.</p>
        <p>First of all, books are like windows that help us see a bigger world. Besides, reading helps us improve our writing, because we can learn many good words and sentences from books. As for me, I read for half an hour before going to bed every day. It makes me relaxed and happy.</p>
        <p>In a word, the more we read, the more we learn. Let's pick up a good book and enjoy reading together!</p>`,
      notes: `<ul>
        <li>books are like windows that help us … 把比喻和定语从句结合，是很亮眼的句子。</li>
        <li>First of all → Besides → As for me → In a word，连接词清楚地标出了每个要点。</li>
        <li>the more we read, the more we learn 用比较级句型做总结，再用 Let's … 发出号召，结尾有力。</li>
      </ul>` }
  ]
},

/* ================= 应用文：书信、邮件、倡议书、通知 ================= */
{
  id: 's-writing-letter', title: '书面表达：书信、邮件、倡议书与通知', short: '写作·应用文', module: 'skill', grade: 9, freq: 3,
  prereqs: ['s-writing-structure'],
  tip: '应用文考的是在正确格式里把要点写清楚、语气得体，头号陷阱是格式错（称呼、落款位置）或写了自己的真实姓名。（具体题量分值以当年《考试说明》为准）',
  learn: [
    { h: '题型说明', html: `
      <p>应用文是中考书面表达的常客，常见的有：</p>
      <table class="tbl">
        <tr><th>类型</th><th>典型情境</th></tr>
        <tr><td>书信 / 邮件</td><td>给笔友介绍学校、家乡；回复外国朋友的来信；邀请外教参加活动</td></tr>
        <tr><td>倡议书</td><td>学生会号召大家节约粮食、保护环境、文明出行</td></tr>
        <tr><td>通知</td><td>学校举办英语角、运动会、讲座，告知时间地点和注意事项</td></tr>
        <tr><td>演讲稿</td><td>在班会上就某个话题发言</td></tr>
      </table>
      <p>题目常常<b>已经给出称呼和落款</b>（如 Dear Tom, … Yours, Li Hua），这部分<b>不计入词数</b>。署名一律用题目给的名字，通常是 <b>Li Hua</b>。</p>` },
    { h: '书信 / 邮件格式', html: `
      <table class="tbl">
        <tr><th>部分</th><th>写法</th><th>例子</th></tr>
        <tr><td>称呼</td><td>顶格写，后面用<b>逗号</b></td><td>Dear Tom, / Dear Mr. Smith,</td></tr>
        <tr><td>开头</td><td>问候 + 说明写信目的</td><td>How is everything going? I'm glad to receive your email. I'm writing to tell you about …</td></tr>
        <tr><td>正文</td><td>按要点逐条写</td><td>First, … Besides, …</td></tr>
        <tr><td>结尾</td><td>希望、邀请、期待回信</td><td>I hope to hear from you soon. / Looking forward to your reply.</td></tr>
        <tr><td>落款</td><td>结束语一行，署名另起一行</td><td>Yours,<br>Li Hua</td></tr>
      </table>
      <p class="ex">I'm looking forward to hearing from you.<span class="zh">期待你的回信。（look forward to 后接 doing）</span></p>
      <p class="ex">Would you like to join us?<span class="zh">你愿意加入我们吗？（邀请别人要礼貌）</span></p>` },
    { h: '倡议书与通知格式', html: `
      <p><b>倡议书</b>：标题 → 称呼 Dear fellow students, → 现象 / 问题 → 几条具体做法 → 号召 → 落款（如 The Students' Union）。</p>
      <p class="ex">Let's take action and make our school a better place!<span class="zh">让我们行动起来，把学校变得更美好！（倡议书常用结尾）</span></p>
      <p><b>书面通知</b>：标题 Notice → 什么活动、目的 → <b>时间、地点</b> → 内容与注意事项 → 欢迎参加 → 落款和日期。</p>
      <p><b>口头通知</b>（广播、班会上说）：</p>
      <p class="ex">Boys and girls, may I have your attention, please? I have something important to tell you.<span class="zh">同学们，请注意，我有重要的事情要告诉大家。</span></p>
      <p class="ex">That's all. Thank you.<span class="zh">就这些，谢谢。（口头通知结尾）</span></p>
      <div class="rhyme">通知要素别丢掉：何事何时和何地，<br>要求说清欢迎到，落款日期写到底。</div>` },
    { h: '常见陷阱', html: `
      <ul>
        <li>称呼后用句号 <span class="en">Dear Tom.</span> ✗ → 用逗号 <span class="en">Dear Tom,</span> ✓</li>
        <li>落款写成一行 <span class="en">Yours Li Hua</span>，或把署名放在 Yours 前面。正确：Yours, 一行，Li Hua 另起一行。</li>
        <li>通知漏写时间或地点——这是最关键的信息。</li>
        <li>给老师、长辈写信语气太生硬，如 <span class="en">You must come.</span> 改为 <span class="en">We would be glad if you could come.</span></li>
        <li>回信时忘了回应对方的问题，只顾写自己想写的。</li>
      </ul>
      <p class="warn">题目给出的开头和结尾照抄即可，不要重复写，也不算在词数里。</p>` },
    { h: '完整示范：邀请外教的邮件', html: `
      <p><b>题目</b>：假如你是李华，你班下周五下午要举办英语晚会。请给外教 Mr. Smith 写邮件邀请他参加。要点：1. 时间地点；2. 晚会活动；3. 希望他做什么。</p>
      <p><b>审题</b>：文体是邀请邮件；人称 I / we + you；时态以一般将来时为主；语气要礼貌。</p>
      <p class="ex">Dear Mr. Smith,<span class="zh">称呼顶格，后面用逗号。</span></p>
      <p class="ex">I'm writing to invite you to our English party. It will be held in our classroom at 3 p.m. next Friday.<span class="zh">开门见山说目的 + 要点 1。</span></p>
      <p class="ex">We are going to sing English songs, act out short plays and play games.<span class="zh">要点 2：活动。</span></p>
      <p class="ex">We would be very glad if you could come and give us a short talk about Christmas in your country.<span class="zh">要点 3：礼貌提出请求，if you could 比 you must 得体得多。</span></p>
      <p class="ex">Looking forward to your reply.<br>Yours,<br>Li Hua<span class="zh">结尾期待回信，落款分两行。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '给笔友写信，下面哪种落款格式正确？', options: ['Yours,<br>Li Hua', 'Li Hua,<br>Yours', 'Yours Li Hua.'], answer: 0,
      explain: '英文书信落款：先写结束语 Yours, （后面有逗号），再另起一行写署名 Li Hua。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>I\'m looking forward to ___ from you soon.（hear）', answer: ['hearing'],
      explain: 'look forward to 中的 to 是介词，后面接动名词 hearing。这是书信结尾的高频句。' },
    { type: 'choice', q: '题目：“学校下周三下午在报告厅举办英语讲座，请写一则告示告知全体同学时间地点和注意事项。”应写成哪种应用文？', options: ['通知', '倡议书', '书信'], answer: 0,
      explain: '告知大家某个活动的时间、地点和注意事项，是通知。倡议书是号召大家去做某件事，书信是写给某个人的。' },
    { type: 'choice', q: '题目已给出“Dear Tom, … Yours, Li Hua”，要求写 80–100 词。下面做法正确的是：', options: ['称呼和落款照题目写，直接写正文，词数只算正文', '把称呼和落款各再写一遍，凑够词数', '落款改写成自己的真实姓名'], answer: 0,
      explain: '题目给出的称呼和落款照抄即可，不要重复写，也不计入词数；署名用题目给的 Li Hua，不能写真实姓名。' },
    { type: 'choice', q: '给外教 Mr. Smith 写信，称呼应该写：', options: ['Dear Mr. Smith,', 'Dear Mr. Smith.', 'Dear Smith Mr.,'], answer: 0,
      explain: '称呼顶格写，Mr. 放在姓前面，称呼后面用逗号，不用句号。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>I\'m ___ to invite you to our English party next Friday.（write）', answer: ['writing'],
      explain: '书信开头说明目的的常用句：I\'m writing to …（我写信是为了……），这里是现在进行时 am writing。' },
    { type: 'fill', q: '补全礼貌邀请的句子（填一个词）：<br>We would be very glad ___ you could come and give us a short talk.', answer: ['if'],
      explain: 'We would be glad if you could … 是很礼貌的请求方式，比 You must … 得体得多，给老师、长辈写信常用。' },
    { type: 'choice', q: '倡议书的一般结构顺序是：', options: ['称呼 → 现象或问题 → 具体做法 → 号召 → 落款', '落款 → 号召 → 具体做法 → 称呼', '具体做法 → 称呼 → 落款 → 现象或问题'], answer: 0,
      explain: '倡议书：标题、称呼（如 Dear fellow students,）→ 指出现象或问题 → 列几条具体做法 → 号召行动 → 落款（如 The Students\' Union）。' },
    { type: 'fill', q: '补全倡议书的称呼（填一个词）：<br>Dear f___ students,', answer: ['fellow'],
      explain: 'Dear fellow students 意为“亲爱的同学们”，是倡议书最常用的称呼。' },
    { type: 'choice', q: '一则书面通知，最关键、绝对不能漏的信息是：', options: ['活动的时间和地点', '写通知的人有什么爱好', '去年同一活动的情况'], answer: 0,
      explain: '通知要素：何事、何时、何地、要求。时间地点是最关键的信息，漏了大家就不知道什么时候去哪里。' },
    { type: 'fill', q: '补全口头通知的结尾（填一个词）：<br>That\'s ___. Thank you.', answer: ['all'],
      explain: '口头通知开头用 May I have your attention, please? 引起注意，结尾常说 That\'s all. Thank you.（就这些，谢谢。）' },
    { type: 'choice', q: '笔友 Tom 来信问：“What do you usually do on weekends?”你的回信里必须有下面哪类句子？', options: ['On weekends, I usually …', 'My favorite color is blue.', 'I was born in a small village.'], answer: 0,
      explain: '回信一定要回应对方的问题。Tom 问你周末通常做什么，回信就要写 On weekends, I usually …，其他内容与问题无关。' },
    { type: 'choice', q: '在班会上就“如何缓解压力”发言，下面哪句最适合做演讲稿的开头？', options: ["Good morning, everyone! I'm glad to have a chance to talk about how to deal with stress.", 'Dear Tom, how is everything going?', 'Yours,<br>Li Hua'], answer: 0,
      explain: '演讲稿开头先向听众问好，再点出要讲的话题；结尾常用 Thank you for listening.。Dear Tom 是书信称呼，Yours, Li Hua 是书信落款。' }
  ],
  tests: [
    { type: 'choice', q: '书信开头的称呼，哪一种写法正确？', options: ['Dear Tom,', 'Dear Tom.', 'Dear, Tom', 'dear Tom,'], answer: 0,
      explain: '称呼顶格写，Dear 首字母大写，名字后面用逗号：Dear Tom,。' },
    { type: 'choice', q: '你的笔友 Peter 来信问你学校生活。回信时，下面哪句最适合做正文开头？', options: ["I'm glad to receive your email. You asked me about my school life. Now let me tell you something about it.", 'My name is Li Hua. I am a boy. I am fifteen years old.', 'Goodbye, Peter. See you next time.'], answer: 0,
      explain: '回信开头要先回应来信、说明写信目的，然后引出正文。第二项与问题无关，第三项是告别语，不能放开头。' },
    { type: 'choice', q: '给外教 Mr. Brown 写邮件邀请他参加班级活动，哪一句最礼貌得体？', options: ['Would you like to join us? We would be very glad if you could come.', 'You must come to our class activity.', 'Come here on Friday. Don\'t be late.'], answer: 0,
      explain: '给老师写信要礼貌，用 Would you like …? / We would be glad if you could … 表达邀请；must 和祈使句语气太生硬。' },
    { type: 'choice', q: '一则书面通知写道：“Our school will hold a book sale in the school hall. All the money will go to children in poor areas. Please bring your old books.”它缺少哪个关键信息？', options: ['时间', '地点', '目的'], answer: 0,
      explain: 'in the school hall 是地点，All the money will go to children … 是目的，全文没有写活动在哪天几点，通知最关键的时间漏掉了。' },
    { type: 'choice', q: '在广播里发布口头通知，最合适的开头是：', options: ['Boys and girls, may I have your attention, please?', 'Dear Tom, how are you?', 'In a word, we should work hard.'], answer: 0,
      explain: '口头通知开头先引起注意：May I have your attention, please? Dear Tom 是书信称呼，In a word 是总结用语。' },
    { type: 'choice', q: '一份“节约用水”倡议书，最适合的结尾是：', options: ["Let's take action now and save every drop of water!", 'Yours,<br>Peter', 'I went swimming last weekend.'], answer: 0,
      explain: '倡议书结尾要号召大家行动，Let\'s take action … 最合适。Yours, Peter 是私人书信落款，第三项与话题无关。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>Thank you for ___ me such a nice birthday gift.（send）', answer: ['sending'],
      explain: 'Thank you for 中的 for 是介词，后接动名词 sending。' },
    { type: 'fill', q: '补全书信常用句（填一个词）：<br>I\'m writing ___ tell you about my trip to Wuyi Mountain.', answer: ['to'],
      explain: 'I\'m writing to do … 表示“我写信是为了……”，to 后接动词原形 tell。' },
    { type: 'choice', q: '把一封邮件的正文部分排成正确顺序：<br>① Looking forward to your reply.<br>② I\'m glad to hear that you will visit Fujian this summer.<br>③ You can try fish balls, and you should visit Gulangyu.', options: ['②③①', '①②③', '③①②', '②①③'], answer: 0,
      explain: '② 回应来信做开头，③ 给出具体建议是正文，① 期待回信做结尾。' },
    { type: 'choice', q: '学生会想号召全校同学“绿色出行，少坐私家车”，应该写哪种应用文？', options: ['倡议书', '通知', '书信'], answer: 0,
      explain: '号召大家一起去做某件事，是倡议书。通知是告知活动安排，书信是写给某个人的。' },
    { type: 'choice', q: '你要在班会上用英语就“如何合理使用手机”发言，应该写：', options: ['演讲稿', '通知', '倡议书'], answer: 0,
      explain: '在班会上当众发言，写的是演讲稿，开头向大家问好，结尾感谢倾听。' },
    { type: 'choice', q: '题目要求 80–100 词，称呼 Dear Peter, 和落款 Yours, Li Hua 已经给出。计算词数时：', options: ['只算正文，不算称呼和落款', '称呼和落款都要算进去', '只算称呼，不算落款'], answer: 0,
      explain: '题目已给出的称呼和落款不计入词数，80–100 词指的是你写的正文。' },
    { type: 'choice', q: '你的同桌写完一封信，在落款处写了自己的真名。你应该提醒他改成：', options: ['题目给的名字 Li Hua', '真名加上学校名', '什么都不写'], answer: 0,
      explain: '书面表达中不能出现真实姓名，署名一律用题目给的名字，通常是 Li Hua。' },
    { type: 'choice', q: '给外教 Mr. Brown 写信，下面的称呼有什么问题？<br>dear Mr. Brown,', options: ['Dear 的首字母没有大写', '后面应该用句号', 'Mr. 应该放在 Brown 后面'], answer: 0,
      explain: '称呼顶格写，Dear 首字母要大写，Mr. 放在姓前面，后面的逗号是对的。' },
    { type: 'choice', q: '写信邀请朋友参加你的生日聚会，下面哪句最适合放在正文开头说明写信目的？', options: ["I'm writing to invite you to my birthday party.", 'Looking forward to your reply.', 'Yours,<br>Li Hua'], answer: 0,
      explain: '正文开头要开门见山说明目的：I\'m writing to invite you to …。Looking forward to your reply. 用于结尾，Yours, Li Hua 是落款。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>We are all looking forward to ___ (see) you in Fuzhou.', answer: ['seeing'],
      explain: 'look forward to 的 to 是介词，后接动名词：seeing。' },
    { type: 'choice', q: '下面哪一句适合放在书信结尾？', options: ['I hope to hear from you soon.', "I'm glad to receive your email.", 'First, let me tell you about my school.'], answer: 0,
      explain: '书信结尾表达希望、期待回信：I hope to hear from you soon.。另外两句一个是开头回应来信，一个是正文第一个要点。' },
    { type: 'choice', q: '关于书信的落款，下面说法正确的是：', options: ['结束语 Yours 后加逗号，署名另起一行', '署名写在结束语前面', '结束语和署名写在同一行，中间不用标点'], answer: 0,
      explain: '落款分两行：第一行 Yours,（带逗号），第二行写署名 Li Hua。' },
    { type: 'choice', q: '下面哪一项是正确的书信落款？', options: ['Best wishes,<br>Li Hua', 'Li Hua<br>Best wishes,', 'Best wishes Li Hua.'], answer: 0,
      explain: '和 Yours, 一样，Best wishes, 也是结束语：先写结束语加逗号，署名另起一行。' },
    { type: 'choice', q: '你想请外教帮你们修改英语短剧的剧本，下面哪句最得体？', options: ['Could you please help us check our play?', 'Check our play for us right now.', 'You must check our play.'], answer: 0,
      explain: '向老师、长辈提请求要礼貌，用 Could you please …?。祈使句和 You must … 语气太生硬。' },
    { type: 'choice', q: '以学生会的名义写倡议书，落款应该写：', options: ["The Students' Union", 'Dear fellow students,', 'Best wishes,'], answer: 0,
      explain: '倡议书的落款写发起者，如 The Students\' Union（学生会）。Dear fellow students, 是称呼，Best wishes, 是私人书信的结束语。' },
    { type: 'choice', q: '把倡议书的几个部分排成正确顺序：<br>① Let\'s act now and save every drop of water!<br>② Dear fellow students,<br>③ These days many students forget to turn off the taps.<br>④ First, turn off the tap after washing your hands.', options: ['②③④①', '②④①③', '①②③④', '③②④①'], answer: 0,
      explain: '先称呼 ②，再指出现象 ③，然后提具体做法 ④，最后号召 ①。' },
    { type: 'fill', q: '补全倡议书结尾（填一个词，首字母 L）：<br>___ take action and make our school greener!', answer: ["Let's", 'Let’s'],
      explain: '倡议书结尾用 Let\'s … 号召大家一起行动。' },
    { type: 'choice', q: '书面通知的标题通常写：', options: ['Notice', 'Dear students,', 'Yours,'], answer: 0,
      explain: '书面通知的标题是 Notice，写在最上面正中。Dear students, 是称呼，Yours, 是书信结束语。' },
    { type: 'choice', q: '书面通知的最后应该写：', options: ['落款和日期', '期待回信', 'Dear fellow students,'], answer: 0,
      explain: '通知的结构：标题 → 何事、目的 → 时间地点 → 内容和注意事项 → 欢迎参加 → 落款和日期。“期待回信”是书信的结尾。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>The English speech competition will be ___ in the school hall next Monday.（hold）', answer: ['held'],
      explain: 'will be held 是被动语态，“将被举行”，通知里说明时间地点的典型句式。hold 的过去分词是 held。' },
    { type: 'choice', say: 'May I have your attention, please? There will be a talk on safety in the school hall this Friday afternoon. Please be there on time. That\'s all. Thank you.', q: '听录音，判断这是哪种应用文。', options: ['口头通知', '书信', '倡议书'], answer: 0,
      explain: '以 May I have your attention, please? 开头、以 That\'s all. Thank you. 结尾，告知讲座的时间地点，是口头通知。' },
    { type: 'choice', q: '口头通知的结尾通常说：', options: ["That's all. Thank you.", 'Yours,<br>Li Hua', 'Dear fellow students,'], answer: 0,
      explain: '口头通知是说给大家听的，没有落款，结尾常用 That\'s all. Thank you.。' },
    { type: 'choice', q: '笔友 Peter 来信问你“How do you learn English?”，还想了解你的家乡。回信时应该：', options: ['两个问题都要回答', '只回答第一个问题', '只写自己最近的爱好'], answer: 0,
      explain: '回信要回应对方的每一个问题，漏答就等于漏要点。' },
    { type: 'choice', q: '笔友来信问：“What\'s your favorite festival?”下面哪句回应最切题？', options: ['My favorite festival is the Spring Festival, because my family can get together.', 'I have a cat named Mimi.', 'I went to the zoo yesterday.'], answer: 0,
      explain: '对方问最喜欢的节日，回信就要直接说出节日并给出理由，另外两句答非所问。' },
    { type: 'choice', q: '题目给出：“Dear Mike, I\'m glad to hear from you. … Yours, Li Hua”。你写正文时应该：', options: ['接着写正文，不再重复已给出的句子', '把 I\'m glad to hear from you. 再抄一遍', '再写一个 Dear Mike,'], answer: 0,
      explain: '题目给出的开头和结尾照题目即可，不要重复写，也不计入词数。' },
    { type: 'choice', q: '演讲稿最常用的结尾是：', options: ['Thank you for listening.', 'Yours,<br>Li Hua', 'Looking forward to your reply.'], answer: 0,
      explain: '演讲是讲给大家听的，结尾感谢听众：Thank you for listening.。另外两项是书信的落款和结尾。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>That\'s all for my speech. Thank you for ___ (listen).', answer: ['listening'],
      explain: 'Thank you for 中的 for 是介词，后接动名词 listening。' }
  ],
  practice: [
    { title: '回信：介绍我的初三生活',
      prompt: `<p>你的英国笔友 Peter 来信，想了解你初三的学校生活。请你以李华的名义给他回一封邮件。要点如下：</p>
        <ol><li>你每天的作息和课程；</li><li>你最喜欢的课外活动；</li><li>学习压力大时你怎么放松。</li></ol>
        <p class="small">要求：80–100 词；开头和结尾已给出，不计入总词数。</p>
        <p class="small">Dear Peter,<br>…<br>Yours,<br>Li Hua</p>`,
      words: [80, 100],
      checklist: [
        '作息课程、课外活动、放松方法三个要点都写到了',
        '介绍日常生活用一般现在时，主谓一致正确',
        '开头回应来信、说明目的；结尾询问对方情况或期待回信',
        '称呼后用逗号，落款 Yours, 和 Li Hua 分两行',
        '用了 After school / Sometimes / When … 等连接词',
        '至少用了一个高级句型（如 when 从句、It is … to do）',
        '拼写、大小写、标点正确，字数在 80–100 词之间'
      ],
      sample: `<p>Dear Peter,</p>
        <p>I'm glad to receive your email. Now let me tell you something about my school life in Grade 9.</p>
        <p>I get up at 6:30 every morning and get to school before 7:30. We have eight classes a day, and English is my favorite subject. After school, I often play basketball with my classmates. It is the happiest time of my day. Sometimes I feel stressed because the exam is coming. When I feel this way, I listen to music or talk with my parents. It really helps.</p>
        <p>What about your school life? Please write back soon.</p>
        <p>Yours,<br>Li Hua</p>`,
      notes: `<ul>
        <li>开头 I'm glad to receive your email. Now let me tell you … 先回应来信再转入正题，是回信的标准写法。</li>
        <li>It is the happiest time of my day. 用最高级表达喜爱，比 I like it very much 生动。</li>
        <li>When I feel this way, … 用时间状语从句写放松方法，句子更有层次。</li>
        <li>结尾 What about your school life? 反问对方，让书信有来有往。</li>
      </ul>` },
    { title: '倡议书：光盘行动',
      prompt: `<p>你校学生会发现学校食堂浪费粮食的现象比较严重，决定发起“光盘行动”（Clean Plate Campaign）。请你以学生会的名义写一份英文倡议书。要点如下：</p>
        <ol><li>食堂浪费粮食的现象；</li><li>倡议的具体做法（至少三条）；</li><li>号召大家行动起来。</li></ol>
        <p class="small">要求：80–100 词；称呼和落款已给出，不计入总词数。</p>
        <p class="small">Dear fellow students,<br>…<br>The Students' Union</p>`,
      words: [80, 100],
      checklist: [
        '写了浪费现象、至少三条做法和最后的号召',
        '描述现象和提建议用一般现在时，建议多用 should / 祈使句',
        '开头点出问题，结尾用 Let\'s … 号召',
        '三条做法用 First / Second / Third 等列出',
        '至少用了一个高级句型（如 as much as you can、It is a pity that …）',
        '称呼、落款格式正确',
        '拼写、大小写、标点正确，字数在 80–100 词之间'
      ],
      sample: `<p><b>Say No to Food Waste</b></p>
        <p>Dear fellow students,</p>
        <p>These days we have found that a lot of food is wasted in our dining hall. Some students only eat half of their meals and throw the rest away. It is a pity, because all the rice we eat comes from the hard work of farmers.</p>
        <p>Here are some suggestions. First, take only as much food as you can eat. Second, if you don't like a dish, ask for less of it. Third, remind your friends not to waste food.</p>
        <p>Let's join the Clean Plate Campaign and save food together!</p>
        <p>The Students' Union</p>`,
      notes: `<ul>
        <li>开头 we have found that … 用宾语从句指出现象，is wasted 用被动语态，表达客观。</li>
        <li>as much food as you can eat 是 as … as 结构，简洁又地道。</li>
        <li>First / Second / Third 三条建议都用祈使句，倡议书语气鲜明。</li>
        <li>结尾 Let's join … 呼应倡议主题，号召有力。</li>
      </ul>` },
    { title: '通知：英语角开放',
      prompt: `<p>为了帮助同学们练习英语口语，学校将开设英语角。请你以学生会的名义写一则英文书面通知。要点如下：</p>
        <ol><li>时间：每周五下午 4:30–5:30；地点：学校图书馆前的草坪；</li><li>活动内容：自由交谈、唱英文歌、做游戏；</li><li>其他：外教 Mr. Brown 也会参加；欢迎所有同学，不用担心说错。</li></ol>
        <p class="small">要求：80–100 词；标题、落款和日期不计入总词数。</p>`,
      words: [80, 100],
      checklist: [
        '时间、地点、活动内容、外教参加、欢迎所有人等信息都写到了',
        '介绍安排用一般将来时或一般现在时，没有时态混乱',
        '有标题 Notice，开头说明活动目的，结尾欢迎大家参加',
        '用了 Besides / too / so 等连接词',
        '至少用了一个高级句型（如 To help us …、It will be held …）',
        '落款 The Students\' Union 和日期写在最后',
        '拼写、大小写、标点正确，字数在 80–100 词之间'
      ],
      sample: `<p><b>Notice</b></p>
        <p>To help students practice spoken English, our school is going to start an English Corner. Everyone is welcome!</p>
        <p>It will be held in the small garden in front of the school library from 4:30 to 5:30 every Friday afternoon. At the English Corner, you can talk freely with others, sing English songs and play interesting games. Our foreign teacher Mr. Brown will join us, too. Don't worry about making mistakes. The more you speak, the better your English will be.</p>
        <p>Just bring your smile and courage. Come and join us!</p>
        <p>The Students' Union<br>October 10th</p>`,
      notes: `<ul>
        <li>To help students practice spoken English, … 开头用不定式说明目的，一句话交代“为什么办”。</li>
        <li>It will be held … 用被动语态说明时间地点，是通知的典型句式。</li>
        <li>The more you speak, the better your English will be. 用比较级句型鼓励大家，既是亮点又扣“不用担心说错”的要点。</li>
      </ul>` },
    { title: '邀请邮件：一起过端午节',
      prompt: `<p>假如你是李华，你的英国朋友 Tom 正在福州学习中文。端午节快到了，请你给他写一封邮件，邀请他到你家过节。要点如下：</p>
        <ol><li>邀请他端午节当天上午 9 点来你家；</li><li>介绍当天的活动（至少两项，如包粽子、看龙舟赛）；</li><li>请他回复能否参加。</li></ol>
        <p class="small">要求：80–100 词；开头和结尾已给出，不计入总词数。</p>
        <p class="small">Dear Tom,<br>…<br>Yours,<br>Li Hua</p>`,
      words: [80, 100],
      checklist: [
        '时间、活动安排（至少两项）、请他回复三个要点都写到了',
        '介绍安排用一般将来时（will / be going to），介绍节日用一般现在时',
        '开头用 I\'m writing to invite you … 说明目的，结尾期待回信',
        '邀请语气礼貌，用了 Would you like … / Could you … 等表达',
        '用了 In the morning / In the afternoon / Besides 等连接词',
        '称呼后用逗号，落款 Yours, 和 Li Hua 分两行',
        '拼写、大小写、标点正确，字数在 80–100 词之间'
      ],
      sample: `<p>Dear Tom,</p>
        <p>I'm writing to invite you to spend the Dragon Boat Festival with my family. It is a traditional Chinese festival with a history of over 2,000 years. Could you come to my home at 9 a.m. that day?</p>
        <p>In the morning, my grandma will teach us how to make zongzi. They are made of sticky rice and covered with leaves. In the afternoon, we are going to watch the dragon boat races by the Minjiang River.</p>
        <p>Would you like to join us? Please let me know as soon as possible.</p>
        <p>Looking forward to your reply.</p>
        <p>Yours,<br>Li Hua</p>`,
      notes: `<ul>
        <li>开头 I'm writing to invite you to … 一句话说明写信目的，再补一句节日背景，方便外国朋友理解。</li>
        <li>zongzi 用拼音，再用 They are made of … and covered with leaves. 简单解释，是写中国特色事物的好办法。</li>
        <li>will teach / are going to watch 交替使用，表达将来的安排不显得重复。</li>
        <li>Would you like to join us? Please let me know as soon as possible. 礼貌地请对方回复，扣住要点 3。</li>
      </ul>` },
    { title: '口头通知：参观科技馆',
      prompt: `<p>假如你是学生会主席李华，学校本周五下午要组织初二学生参观科技馆。请你在学校广播里用英语发布一则口头通知。要点如下：</p>
        <ol><li>时间安排：周五下午 1:30 在校门口集合，乘校车前往；</li><li>活动内容：参观展品、听一场关于太空的讲座；</li><li>注意事项：穿校服、带笔记本、馆内保持安静；不能参加的同学周四前告诉班主任。</li></ol>
        <p class="small">要求：80–100 词；用口头通知的开头和结尾。</p>`,
      words: [80, 100],
      checklist: [
        '时间、集合地点、活动内容、注意事项都写到了，一个不漏',
        '说明安排用一般将来时，提要求用祈使句（Please … / Don\'t …）',
        '开头用 May I have your attention, please? 引起注意',
        '结尾用 That\'s all. Thank you.，没有写书信的落款',
        '用了 To help us … / At the museum / If … 等连接表达',
        '拼写、大小写、标点正确，字数在 80–100 词之间'
      ],
      sample: `<p>Boys and girls, may I have your attention, please?</p>
        <p>To help us learn more about science, our school is going to take Grade 8 students to the Science Museum this Friday afternoon. We will meet at the school gate at 1:30 and go there by school bus. At the museum, we will see a lot of interesting things and listen to a talk about space.</p>
        <p>Please wear your school uniform and bring a notebook. Don't make any noise in the museum. If you can't go, please tell your head teacher before Thursday.</p>
        <p>That's all. Thank you.</p>`,
      notes: `<ul>
        <li>口头通知没有标题和落款，开头 may I have your attention, please? 引起注意，结尾 That's all. Thank you. 收尾。</li>
        <li>To help us learn more about science, … 用不定式说明活动目的。</li>
        <li>注意事项用 Please … / Don't … 祈使句，简洁明确，听的人一下就能记住。</li>
        <li>If you can't go, … 用条件句交代特殊情况，通知更周到。</li>
      </ul>` },
    { title: '演讲稿：如何缓解学习压力',
      prompt: `<p>你班将召开以“How to Deal with Stress”为主题的英语班会。请你写一篇发言稿。要点如下：</p>
        <ol><li>初三学生压力大的表现或原因；</li><li>你的建议（至少两条）；</li><li>鼓励大家积极面对。</li></ol>
        <p class="small">要求：80–100 词；开头 Good morning, everyone! 和结尾 Thank you for listening. 已给出，不计入总词数。</p>`,
      words: [80, 100],
      checklist: [
        '压力的表现或原因、至少两条建议、鼓励大家三个要点都写到了',
        '谈现象和建议用一般现在时，建议多用 should / 祈使句',
        '开头点出演讲话题，结尾用 Let\'s … 鼓励大家',
        '建议用 First / Second / Besides 等连接词列出',
        '至少用了一个高级句型（如 when 从句、定语从句）',
        '拼写、大小写、标点正确，字数在 80–100 词之间'
      ],
      sample: `<p>Good morning, everyone!</p>
        <p>I'm glad to have the chance to talk about how to deal with stress. In Grade 9, many of us feel stressed because we have lots of homework and exams. Some students can't sleep well, and some even lose interest in their studies.</p>
        <p>Here are my suggestions. First, make a study plan and do things one by one. Second, take some exercise every day, because it can help us relax. Besides, when you feel worried, talk with your parents, teachers or friends who are always ready to help.</p>
        <p>Stress is part of life. Let's face it bravely together!</p>
        <p>Thank you for listening.</p>`,
      notes: `<ul>
        <li>演讲稿开头先问好，再用 I'm glad to have the chance to talk about … 点出话题。</li>
        <li>Here are my suggestions. 一句过渡，后面用 First / Second / Besides 列出建议，层次分明。</li>
        <li>when you feel worried 和 who are always ready to help 一个状语从句、一个定语从句，让句子更丰富。</li>
        <li>结尾 Let's face it bravely together! 鼓励大家，再用 Thank you for listening. 感谢听众。</li>
      </ul>` }
  ]
},

/* ================= 常考话题与范文 ================= */
{
  id: 's-writing-topics', title: '书面表达：常考话题与范文（家乡、校园、成长、环保等）', short: '写作·常考话题', module: 'skill', grade: 9, freq: 3,
  prereqs: ['s-writing-polish', 'v-festivals-culture', 'v-life-growth'],
  tip: '中考作文话题离不开家乡文化、校园生活、成长感悟、环保健康、志愿服务和未来梦想，头号陷阱是背了范文硬套、写着写着跑题。（具体题量分值以当年《考试说明》为准）',
  learn: [
    { h: '题型说明：六大常考话题', html: `
      <table class="tbl">
        <tr><th>话题</th><th>常见题目</th><th>常用时态</th></tr>
        <tr><td>家乡福建 / 传统文化</td><td>Welcome to My Hometown；我最喜欢的传统节日</td><td>一般现在时</td></tr>
        <tr><td>校园生活与活动</td><td>我的学校生活；一次难忘的校园活动</td><td>现在时 / 过去时</td></tr>
        <tr><td>成长经历与感悟</td><td>我学会了……；一次失败让我成长</td><td>一般过去时 + 现在时谈感悟</td></tr>
        <tr><td>环保与健康</td><td>如何保护环境；健康的生活方式</td><td>一般现在时 + should</td></tr>
        <tr><td>志愿服务</td><td>一次志愿经历；帮助他人的意义</td><td>一般过去时</td></tr>
        <tr><td>未来梦想</td><td>My Dream；十年后的我</td><td>一般将来时</td></tr>
      </table>
      <p>备考方法：每个话题<b>积累 5–8 个短语 + 2 个好句子 + 1 篇范文</b>，考场上根据要点灵活组合，而不是整篇照搬。</p>` },
    { h: '家乡文化与校园生活：词句积累', html: `
      <p><b>家乡福建 / 传统文化</b></p>
      <p class="small">lie in the southeast of China 位于中国东南部；be famous for 因……而闻名；Wuyi Mountain 武夷山；Gulangyu 鼓浪屿；Fujian Tulou 福建土楼；fish balls 鱼丸；Shaxian snacks 沙县小吃；tea culture 茶文化；Mazu Culture 妈祖文化；the Lantern Festival 元宵节；the Dragon Boat Festival 端午节</p>
      <p class="ex">Fujian is famous for its beautiful scenery and tasty food.<span class="zh">福建以风景优美、美食可口而闻名。</span></p>
      <p class="ex">If you come to Fujian, you will never forget the friendly people here.<span class="zh">如果你来福建，你一定不会忘记这里友善的人们。</span></p>
      <p><b>校园生活与活动</b></p>
      <p class="small">take part in 参加；sports meeting 运动会；art festival 艺术节；get along well with 与……相处融洽；make progress 取得进步；be proud of 为……自豪；school clubs 社团</p>
      <p class="ex">Our school holds a sports meeting every autumn, and it is the most exciting time of the year.<span class="zh">我们学校每年秋天举办运动会，这是一年中最激动人心的时候。</span></p>` },
    { h: '成长、环保健康、志愿、梦想：词句积累', html: `
      <table class="tbl">
        <tr><th>话题</th><th>短语</th><th>好句子</th></tr>
        <tr><td>成长感悟</td><td>give up 放弃；learn from mistakes 从错误中学习；be confident 自信</td><td>Failure is the mother of success.<br>Since then, I have become more confident.</td></tr>
        <tr><td>环保</td><td>sort the rubbish 垃圾分类；save water 节约用水；plant trees 植树；take public transport 乘公共交通</td><td>It is our duty to protect the earth, because it is our only home.</td></tr>
        <tr><td>健康</td><td>keep healthy 保持健康；have a balanced diet 均衡饮食；get enough sleep 睡眠充足</td><td>It's good for our health to get enough sleep.</td></tr>
        <tr><td>志愿服务</td><td>volunteer at … 在……做志愿者；help people in need 帮助有需要的人；old people's home 养老院</td><td>Helping others is helping ourselves.</td></tr>
        <tr><td>未来梦想</td><td>dream of being / dream of becoming 梦想成为；come true 实现；work hard 努力</td><td>To make my dream come true, I will study harder.</td></tr>
      </table>` },
    { h: '常见陷阱', html: `
      <ul>
        <li><b>硬套范文跑题</b>：题目问“一次志愿经历”，却大段写“志愿服务的意义”，具体经历只一句带过。</li>
        <li><b>只罗列不展开</b>：写家乡只列 Wuyi Mountain, Tulou, fish balls，不说“好在哪里”。每一点最好加一句细节或理由。</li>
        <li><b>中文直译专有名词</b>：土楼写作 Tulou 或 Fujian Tulou，鱼丸写 fish balls；拿不准的专有名词可以用拼音并加简单解释。</li>
        <li><b>梦想话题忘了“怎么做”</b>：要点里常有“你打算怎样实现”，一定要写具体行动。</li>
      </ul>
      <p class="warn">积累的好句子要“对号入座”：只有和要点相关时才用，否则宁可写简单而正确的句子。</p>` },
    { h: '完整示范：用积累的词句写一段', html: `
      <p><b>题目片段</b>：外国朋友要来福建，请你推荐一个地方并说明理由。</p>
      <p><b>思路</b>：选一个地方（Fujian Tulou）→ 它在哪里、像什么 → 为什么值得去（历史 + 有趣）→ 一句建议。</p>
      <p class="ex">I'd like to recommend Fujian Tulou to you.<span class="zh">直接点题。</span></p>
      <p class="ex">Many of them are big round buildings in western Fujian, and some of them are hundreds of years old.<span class="zh">说位置和特点，加数字更具体。</span></p>
      <p class="ex">Many families live together in one Tulou, so you can learn a lot about Hakka culture there.<span class="zh">用 so 说明值得去的理由。</span></p>
      <p class="ex">If you go there, don't forget to take some photos!<span class="zh">用 if 条件句给建议，自然收尾。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: 'Fujian is famous ___ its tea and beautiful scenery.', options: ['for', 'as', 'with'], answer: 0,
      explain: 'be famous for + 原因 / 特点，表示“因……而闻名”；be famous as 后面接身份。' },
    { type: 'choice', q: '题目“My Dream”中，下面哪句和话题无关，应该删掉？', options: ['My cousin bought a new phone last week.', 'I want to be a doctor to help sick people.', 'I will study biology hard to make my dream come true.'], answer: 0,
      explain: '“表哥上周买了新手机”与“我的梦想”没有关系，属于跑题句。另外两句分别写了梦想和怎样实现。' },
    { type: 'choice', q: '题目“Ten Years Later”（十年后的我），文章的主要时态应该是：', options: ['一般将来时', '一般过去时', '现在进行时'], answer: 0,
      explain: '“十年后”属于未来梦想话题，主要用一般将来时，如 I will be a … / I will live in …。' },
    { type: 'choice', q: '备考话题作文，下面哪种方法最好？', options: ['每个话题积累一些短语、好句子和一篇范文，考场上按要点灵活组合', '背一篇“万能范文”，什么题目都整篇照抄', '只背单词，不练句子和文章'], answer: 0,
      explain: '每个话题积累 5–8 个短语 + 2 个好句子 + 1 篇范文，考场上根据要点灵活组合，而不是整篇照搬，否则很容易跑题。' },
    { type: 'fill', q: '根据中文提示，用 lie 的适当形式填空：<br>福建位于中国东南部。Fujian ___ in the southeast of China.', answer: ['lies'],
      explain: 'lie in 表示“位于”，主语 Fujian 是第三人称单数，一般现在时用 lies。注意 lie 的这个意思不是“说谎”。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>If you ___ (come) to Fujian, you will never forget the friendly people here.', answer: ['come'],
      explain: 'if 条件句“主将从现”：主句用 will，if 从句用一般现在时，主语 you 后用原形 come。这是介绍家乡的常用好句。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>我和同学们相处得很融洽。I get along well ___ my classmates.', answer: ['with'],
      explain: 'get along well with sb. 意为“与某人相处融洽”，是校园生活话题的常用短语。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>从那以后，我变得更加自信了。Since then, I ___ become more confident.', answer: ['have'],
      explain: 'since then（从那以后）常和现在完成时连用，主语 I 用 have + 过去分词 become。这是成长话题的经典句。' },
    { type: 'choice', q: 'It is our duty ___ the earth, because it is our only home.', options: ['to protect', 'protect', 'protecting'], answer: 0,
      explain: 'It is one\'s duty to do sth. 意为“做某事是某人的责任”，It 是形式主语，后面用 to protect。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>我们应该均衡饮食。We should have a b___ diet.', answer: ['balanced'],
      explain: 'have a balanced diet 意为“均衡饮食”，健康话题的高频短语。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>上周末我在养老院做志愿者。I volunteered ___ an old people\'s home last weekend.', answer: ['at', 'in'],
      explain: 'volunteer at + 地点，表示“在……做志愿者”，也可以说 in。old people\'s home 意为“养老院”。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>我相信我的梦想总有一天会实现。I believe my dream will come ___ one day.', answer: ['true'],
      explain: 'come true 意为“（梦想）实现”，主语是梦想、愿望，不能说 I come true。' },
    { type: 'choice', q: '写家乡美食，下面哪种写法最符合“不只罗列，还要展开”的要求？', options: ['Fish balls are a famous food in Fuzhou. They are round, soft and very delicious.', 'Fish balls, Shaxian snacks, tea.', 'There are fish balls.'], answer: 0,
      explain: '每一点最好加一句细节或理由。第一项先点出美食，再说它“圆、软、好吃”，有内容；另外两项只罗列名称，没有展开。' },
    { type: 'choice', q: '“福建土楼”写成英文，下面哪一项正确？', options: ['Fujian Tulou', 'fujian tulou', 'tulou of fujian'], answer: 0,
      explain: '专有名词用拼音写时，每个词首字母大写：Fujian Tulou。拿不准的可以用拼音再加一句简单解释。' },
    { type: 'choice', q: '题目“My Dream”的要点：梦想是什么、为什么、怎样实现。下面哪一句写的是“怎样实现”？', options: ['I will practice drawing every day and take art classes.', 'I want to be an artist in the future.', 'My mother is an artist, so I love art.'], answer: 0,
      explain: '“怎样实现”要写具体行动：每天练画、上美术课。第二句是梦想是什么，第三句是为什么，梦想话题最容易漏的就是“怎样实现”。' },
    { type: 'choice', q: '写“我的家乡厦门”，下面哪个积累的好句子用得最恰当？', options: ['Xiamen is famous for its beautiful beaches and friendly people.', 'Failure is the mother of success.', 'Helping others is helping ourselves.'], answer: 0,
      explain: '好句子要“对号入座”：介绍家乡用 be famous for。“失败是成功之母”属于成长话题，“帮助别人就是帮助自己”属于志愿话题，放在这里就跑题了。' },
    { type: 'choice', q: '向外国朋友推荐一个地方，下面哪个写作思路最合理？', options: ['点出地方 → 位置和特点 → 值得去的理由 → 一句建议', '一句建议 → 结束 → 再说地方名字', '只写自己去过的时间，不说地方的特点'], answer: 0,
      explain: '推荐的思路：先直接点题，再说位置特点，然后用 so / because 说明值得去的理由，最后用 if 条件句给建议，自然收尾。' }
  ],
  tests: [
    { type: 'fill', q: '根据中文提示填空（每空一词）：<br>我们应该把垃圾分类。We should s___ the rubbish.', answer: ['sort'],
      explain: '“垃圾分类”是 sort the rubbish，sort 意为“分类、整理”。' },
    { type: 'fill', q: '根据中文提示填空（每空一词）：<br>作为志愿者，我很乐意帮助有需要的人。<br>As a volunteer, I\'m happy to help people ___ need.', answer: ['in'],
      explain: 'people in need 意为“有需要的人、困难中的人”，固定搭配用介词 in。' },
    { type: 'choice', q: '写“一次难忘的校园活动”，下面哪一句在语法和表达上都正确？', options: ['Our school held an art festival last month, and I took part in it.', 'I take part in the school art festival last month.', 'Our school was held an art festival last month.'], answer: 0,
      explain: '有 last month，用一般过去时 held / took part in。第二句时态错误；第三句 school 是举办者，不能用被动语态。' },
    { type: 'choice', q: '题目“A Volunteer Experience”要求写具体经历。下面哪个提纲最切题？', options: ['时间地点 → 具体做了什么 → 感受收获', '志愿服务的定义 → 世界上的志愿组织 → 号召大家', '我的爱好 → 我的家人 → 我的梦想'], answer: 0,
      explain: '题目要的是“一次经历”，必须写清时间地点和具体做的事，再谈感受。第二个提纲变成了议论文，第三个完全跑题。' },
    { type: 'choice', q: '“保护环境”话题的作文，最适合的结尾句是：', options: ["Let's protect the earth, because it is our only home.", 'I like eating fish balls very much.', 'Last year I went to Beijing by plane.'], answer: 0,
      explain: '结尾要回扣环保话题并发出号召。另外两句和环保无关。' },
    { type: 'choice', q: "It's good for our health ___ enough sleep every night.", options: ['to get', 'get', 'got'], answer: 0,
      explain: 'It is + 形容词 + for sb. + to do sth. 句型，真正的主语是 to get enough sleep。' },
    { type: 'fill', q: '根据中文提示填空（每空一词）：<br>中秋节我们吃月饼、赏月。<br>At the Mid-Autumn Festival, we eat mooncakes and e___ the full moon.', answer: ['enjoy'],
      explain: '“赏月”可以说 enjoy the full moon，enjoy 意为“欣赏、享受”。' },
    { type: 'choice', q: '写“成长中的一次失败”，下面哪句最适合用来升华主题？', options: ['From this experience, I learned that failure is the mother of success.', 'My schoolbag is blue and very big.', 'There are forty students in my class.'], answer: 0,
      explain: '成长话题结尾要写从经历中得到的道理，failure is the mother of success（失败是成功之母）最贴切。另外两句只是无关的描述。' },
    { type: 'choice', q: 'I want to be a doctor ___ I can help sick people in the future.', options: ['so that', 'because of', 'although'], answer: 0,
      explain: '“为了能帮助病人”表示目的，用 so that 引导目的状语从句。because of 后接名词，although 表让步，都不合适。' },
    { type: 'choice', q: '题目“My Favorite Traditional Festival”，介绍节日的习俗，主要用：', options: ['一般现在时', '一般将来时', '过去进行时'], answer: 0,
      explain: '节日习俗是经常发生、一直如此的事，用一般现在时，如 We eat zongzi and watch dragon boat races.' },
    { type: 'choice', q: '题目“我学会了骑自行车”，讲述学骑车的经历，主要用：', options: ['一般过去时', '一般将来时', '一般现在时'], answer: 0,
      explain: '成长经历是过去发生的事，叙述用一般过去时；最后谈感悟可以用一般现在时。' },
    { type: 'choice', q: '考场上发现题目和你背过的范文话题相近，但要点不同。最好的做法是：', options: ['按题目要点重新组织，只借用合适的短语和句子', '把背过的范文整篇默写上去', '只写范文的第一段，然后结束'], answer: 0,
      explain: '范文是用来积累词句的，不能整篇照搬。要点不同还硬套范文，就会漏要点、跑题。' },
    { type: 'choice', q: '每个常考话题，建议积累：', options: ['5–8 个短语、2 个好句子和 1 篇范文', '只记 1 个单词', '只记话题的中文名称'], answer: 0,
      explain: '短语 + 好句子 + 范文三样都积累，考场上才有“材料”可以灵活组合。' },
    { type: 'choice', q: 'Quanzhou is famous ___ a city with a long history.', options: ['as', 'for', 'with'], answer: 0,
      explain: 'be famous as + 身份（作为……而出名）：泉州作为一座历史名城而闻名。be famous for 后面接原因或特点，如 be famous for its food。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>元宵节 the L___ Festival', answer: ['Lantern'],
      explain: '元宵节是 the Lantern Festival，lantern 意为“灯笼”。节日名称是专有名词，首字母大写。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>端午节 the D___ Boat Festival', answer: ['Dragon'],
      explain: '端午节是 the Dragon Boat Festival，因为有赛龙舟的习俗。' },
    { type: 'fill', q: '补全句子（填一个词）：<br>If you come to Xiamen, you ___ love its beautiful beaches.', answer: ['will'],
      explain: 'if 条件句“主将从现”：从句 come 用一般现在时，主句用 will + 动词原形。' },
    { type: 'choice', q: 'We are all proud ___ our school.', options: ['of', 'for', 'with'], answer: 0,
      explain: 'be proud of 意为“为……感到自豪”，介词固定用 of。' },
    { type: 'fill', q: '用 hold 的适当形式填空：<br>Our school ___ a sports meeting every autumn.', answer: ['holds'],
      explain: 'every autumn 表示经常性的事，用一般现在时；主语 our school 是第三人称单数，用 holds。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>这学期我的英语取得了很大的进步。I have made great p___ in English this term.', answer: ['progress'],
      explain: 'make progress 意为“取得进步”，progress 是不可数名词，不加 -s，也不加 a。' },
    { type: 'choice', q: 'Don\'t ___ when you meet difficulties. Keep trying!', options: ['give up', 'take up', 'put up'], answer: 0,
      explain: 'give up 意为“放弃”。take up 是“开始从事”，put up 是“张贴、举起”，都不合句意。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>我们可以从错误中学习。We can learn ___ our mistakes.', answer: ['from'],
      explain: 'learn from mistakes 意为“从错误中学习”，成长话题常用。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>我们应该乘坐公共交通出行。We should take p___ transport.', answer: ['public'],
      explain: 'take public transport 意为“乘坐公共交通”，环保话题常用短语。' },
    { type: 'choice', q: 'Water is very important to us. We should ___ every drop of it.', options: ['save', 'waste', 'spend'], answer: 0,
      explain: 'save water 意为“节约用水”。waste 是浪费，与“水很重要”矛盾；spend 用于时间和钱。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>运动能帮助我们保持健康。Doing sports can help us keep h___.', answer: ['healthy'],
      explain: 'keep healthy 意为“保持健康”，keep 后面接形容词 healthy，不用名词 health。' },
    { type: 'choice', q: 'To keep healthy, we should ___.', options: ['get enough sleep and eat more vegetables', 'stay up late and play computer games every night', 'eat a lot of fast food and never exercise'], answer: 0,
      explain: '保持健康要睡眠充足、均衡饮食。另外两项都是不健康的生活方式。' },
    { type: 'choice', q: '志愿服务话题的作文，最常用的升华句是：', options: ['Helping others is helping ourselves.', 'Fujian is famous for its tea.', 'The weather was fine that day.'], answer: 0,
      explain: '“帮助别人就是帮助自己”是志愿服务话题的经典升华句；另外两句一个属于家乡话题，一个只是普通描述。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>每周六我都在市图书馆做志愿者。I volunteer ___ the city library every Saturday.', answer: ['at', 'in'],
      explain: 'volunteer at / in + 地点，表示“在……做志愿者”。' },
    { type: 'fill', q: '用所给词的适当形式填空：<br>I dream of ___ (become) a scientist in the future.', answer: ['becoming'],
      explain: 'dream of 中的 of 是介词，后接动名词：dream of becoming …（梦想成为……）。' },
    { type: 'choice', q: '___ make my dream come true, I will study harder from now on.', options: ['To', 'For', 'So'], answer: 0,
      explain: '“为了实现梦想”表目的，用不定式 To do 放句首，这是梦想话题的经典句。' },
    { type: 'choice', q: '题目“My Favorite Festival”，下面哪一句跑题了？', options: ['My uncle works in a big company in Shanghai.', 'During the Spring Festival, my family gets together and has a big dinner.', 'I love it because children can get lucky money.'], answer: 0,
      explain: '“叔叔在上海一家大公司工作”和“我最喜欢的节日”没有关系，属于跑题句。另外两句分别写了习俗和喜欢的原因。' },
    { type: 'choice', q: '向外国朋友介绍武夷山，下面哪一句在点出景点后补充了理由，最符合要求？', options: ['Wuyi Mountain is a must, because its scenery is beautiful and its tea is famous.', 'Wuyi Mountain, Tulou, Gulangyu.', 'There is Wuyi Mountain.'], answer: 0,
      explain: '写家乡不能只罗列名称，每一点最好加一句细节或理由。第一句用 because 说明值得去的原因。' },
    { type: 'choice', q: '某同学写“我的学校”：“There is a library. There is a playground. There is a lab.”最好的改进方法是：', options: ['给每个地方加一句细节或理由，如在图书馆可以做什么', '再多列几个地方的名字', '把这几句全部删掉'], answer: 0,
      explain: '只罗列不展开，内容就很单薄。给每一处加细节，如 We can read many books in the library.，文章才充实。' },
    { type: 'choice', q: '下面哪一项节日名称的大小写是正确的？', options: ['the Mid-Autumn Festival', 'the mid-autumn festival', 'the Mid-autumn festival'], answer: 0,
      explain: '节日名称是专有名词，每个实词首字母都要大写：the Mid-Autumn Festival。' },
    { type: 'choice', q: '下面句子有一处错误，它错在哪里？<br>We often eat fish balls when we visit fuzhou.', options: ['地名 fuzhou 首字母没有大写', 'fish balls 应该用单数', 'eat 应该改成 ate'], answer: 0,
      explain: '地名是专有名词，首字母要大写：Fuzhou。often 说的是经常性的事，用一般现在时 eat；鱼丸用复数 fish balls 正确。' },
    { type: 'choice', q: '某同学写“My Dream”，只写了“我想当宇航员”和“因为太空很神秘”。他还应该补充：', options: ['打算怎样实现梦想', '他家的详细地址', '昨天的天气'], answer: 0,
      explain: '梦想话题常有“你打算怎样实现”这一要点，要写具体行动，如 I will study physics hard and keep fit.。' },
    { type: 'choice', q: '题目：“My Dream”，要点包括“怎样实现梦想”。下面哪句最能扣住这个要点？', options: ['I will read more books about space and take exercise every day to keep fit.', 'Space is very big and beautiful.', 'Many people have dreams.'], answer: 0,
      explain: '“怎样实现”要写出具体的行动计划：多读太空的书、每天锻炼。另外两句没有写行动。' },
    { type: 'choice', q: '写“My Dream”，下面哪个句子最适合放在结尾表达信心？', options: ['I believe my dream will come true one day.', 'Helping others is helping ourselves.', 'Fujian is famous for its tea.'], answer: 0,
      explain: '好句子要和话题对号入座：梦想话题结尾表达信心，用 I believe my dream will come true one day.。另外两句分别属于志愿话题和家乡话题。' },
    { type: 'choice', q: '写“How to Keep Healthy”，下面哪句用得最恰当？', options: ["It's good for our health to get enough sleep.", 'Failure is the mother of success.', 'If you come to Fujian, you will love it.'], answer: 0,
      explain: '健康话题用 It\'s good for our health to … 最合适；另外两句分别属于成长话题和家乡话题，用在这里就跑题了。' },
    { type: 'fill', q: '根据中文提示填空（填一个词）：<br>我想向你推荐福建土楼。I\'d like to r___ Fujian Tulou to you.', answer: ['recommend'],
      explain: 'recommend sth. to sb. 意为“向某人推荐某物”，推荐地方时开头直接点题。' },
    { type: 'choice', q: 'Many families live together in one Tulou, ___ you can learn a lot about Hakka culture there.', options: ['so', 'but', 'although'], answer: 0,
      explain: '“很多家庭住在一起”是原因，“能了解客家文化”是结果，用 so 说明值得去的理由。' },
    { type: 'choice', say: 'Since then, I have become more confident, and I am no longer afraid of speaking in public.', q: '听句子，判断它最可能出自哪个话题的作文。', options: ['成长经历与感悟', '介绍家乡', '保护环境'], answer: 0,
      explain: 'Since then, I have become more confident 写的是经历之后自己的变化，是成长话题的典型句子。' }
  ],
  practice: [
    { title: 'Welcome to Fujian',
      prompt: `<p>下个月有一批外国学生要来你校交流。校英文报以“Welcome to Fujian”为题征文，向他们介绍福建。要点如下：</p>
        <ol><li>福建简介（位置、气候等）；</li><li>福建的特色（美食、景点、文化等，至少两项，并简单说明）；</li><li>表达欢迎或给出建议。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '位置气候、至少两项特色（带说明）、欢迎或建议三个要点都写到了',
        '介绍家乡用一般现在时，主谓一致正确',
        '开头点题，结尾表达欢迎',
        '用了 If you like … / Besides / such as 等连接词',
        '至少用了一个高级句型（如定语从句、be famous for、感叹句）',
        '专有名词首字母大写（Wuyi Mountain, Fujian Tulou）',
        '拼写、标点正确，字数在 80–100 词之间'
      ],
      sample: `<p><b>Welcome to Fujian</b></p>
        <p>Fujian lies in the southeast of China, near the sea. It is warm and wet here, so it is green all year round.</p>
        <p>There are many things to enjoy in Fujian. If you like nature, Wuyi Mountain is a must. It is famous for its beautiful scenery and tea. If you are interested in culture, you can visit Fujian Tulou, the big round houses where many families live together. Besides, don't forget to taste local food such as fish balls and Shaxian snacks.</p>
        <p>Fujian is a beautiful place with kind people. Welcome to Fujian, and I'm sure you will love it here!</p>`,
      notes: `<ul>
        <li>If you like nature, … If you are interested in culture, … 两个 if 句针对不同兴趣推荐，结构整齐。</li>
        <li>the big round houses where many families live together 用同位语加定语从句解释土楼，让外国读者一下子有画面感。</li>
        <li>a must 意为“必去之地”，地道又简洁。</li>
        <li>结尾 a beautiful place with kind people 概括全文，再表达欢迎，首尾呼应。</li>
      </ul>` },
    { title: 'A Volunteer Experience',
      prompt: `<p>校英语报“Helping Others”栏目正在征稿。请以“A Volunteer Experience”为题，写一次你做志愿者的经历。要点如下：</p>
        <ol><li>时间、地点；</li><li>你做了哪些事（可写一件印象最深的小事）；</li><li>你的感受和收获。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '时间地点、具体做的事、感受收获三个要点都写到了',
        '叙述经历用一般过去时，不规则动词过去式写对（went, felt, kept）',
        '开头交代背景，结尾写收获或决心',
        '用了 so / Once / When / From this experience 等连接词',
        '至少用了一个高级句型（如 when 从句、宾语从句、helping others is helping ourselves）',
        '拼写、大小写、标点正确',
        '字数在 80–100 词之间'
      ],
      sample: `<p><b>A Volunteer Experience</b></p>
        <p>Last winter holiday, I worked as a volunteer at the train station in our city.</p>
        <p>Many people were going home for the Spring Festival, so the station was very crowded. My job was to help passengers find the right waiting rooms and carry heavy bags for the old. Once a little girl got lost and kept crying. I comforted her and helped her find her mother. When her mother thanked me with a big smile, I felt very happy.</p>
        <p>From this experience, I learned that helping others is helping ourselves. I will keep doing volunteer work in the future.</p>`,
      notes: `<ul>
        <li>Many people were going home for the Spring Festival 交代背景，用过去进行时描述当时的场景。</li>
        <li>Once a little girl got lost … 用一件具体的小事展开，比泛泛地说“我帮了很多人”更打动人。</li>
        <li>When her mother thanked me with a big smile, I felt very happy. 时间状语从句把动作和感受连在一起。</li>
        <li>helping others is helping ourselves 是志愿话题的万能升华句。</li>
      </ul>` },
    { title: 'My Dream',
      prompt: `<p>每个人都有自己的梦想。请以“My Dream”为题写一篇短文。要点如下：</p>
        <ol><li>你的梦想是什么；</li><li>你为什么有这个梦想；</li><li>你打算怎样实现它（至少两点）。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '梦想是什么、为什么、怎样实现（至少两点）都写到了',
        '说原因可用过去时讲经历，打算用 will / be going to，时态各就各位',
        '开头直接点出梦想，结尾表达信心',
        '用了 Since then / so that / also 等连接词',
        '至少用了一个高级句型（如 so that、To make my dream come true、宾语从句）',
        '拼写、大小写、标点正确',
        '字数在 80–100 词之间'
      ],
      sample: `<p><b>My Dream</b></p>
        <p>Everyone has a dream. My dream is to become a science teacher in the future.</p>
        <p>When I was in Grade 7, my science teacher showed us many interesting experiments. Since then, I have been interested in science. I want to be a teacher like him, so that I can help children discover the wonders of nature.</p>
        <p>To make my dream come true, I am going to study hard, especially in physics and chemistry. I will also read more science books and join the science club.</p>
        <p>I believe that if I work hard, my dream will come true one day.</p>`,
      notes: `<ul>
        <li>用 When I was in Grade 7 … 讲一段小经历来说明“为什么”，比空说“因为我喜欢”更有说服力。</li>
        <li>so that I can help children discover the wonders of nature 用目的状语从句点明梦想的意义。</li>
        <li>To make my dream come true, … 不定式放句首做目的状语，是梦想话题的经典句。</li>
        <li>结尾 I believe that if I work hard, … 宾语从句里套条件句，表达信心。</li>
      </ul>` },
    { title: 'My Favorite Traditional Festival',
      prompt: `<p>学校英语报开设“中国传统节日”专栏。请以“My Favorite Traditional Festival”为题写一篇短文。要点如下：</p>
        <ol><li>你最喜欢的节日及其大致时间；</li><li>节日的主要习俗（至少两项）；</li><li>你喜欢它的原因。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '节日名称和时间、至少两项习俗、喜欢的原因三个要点都写到了',
        '介绍习俗用一般现在时，主语是第三人称单数时动词加 -s',
        '开头点出节日，结尾写喜欢的原因或感受',
        '用了 Before / On the eve of / After / also 等连接词',
        '至少用了一个高级句型（如 What I love most is that …、not only…but also）',
        '节日名称等专有名词首字母大写（the Spring Festival）',
        '拼写、标点正确，字数在 80–100 词之间'
      ],
      sample: `<p><b>My Favorite Traditional Festival</b></p>
        <p>Of all the traditional Chinese festivals, I like the Spring Festival best. It usually comes in January or February.</p>
        <p>Before the festival, my family cleans the house and puts up red couplets on the door. On the eve of the festival, we get together and have a big dinner. After dinner, we watch the Spring Festival Gala and chat happily. Children also get lucky money from their parents.</p>
        <p>What I love most is that the whole family can stay together. To me, the Spring Festival is not only a holiday but also a time of love and hope.</p>`,
      notes: `<ul>
        <li>Of all the traditional Chinese festivals, I like … best. 开头直接点题，是介绍“最喜欢”的好句式。</li>
        <li>Before … / On the eve of … / After dinner … 按时间顺序介绍习俗，条理清楚。</li>
        <li>What I love most is that … 用主语从句说原因，比 I like it because … 更出彩。</li>
        <li>not only a holiday but also a time of love and hope 结尾升华节日意义。</li>
      </ul>` },
    { title: 'An Unforgettable School Activity',
      prompt: `<p>校园生活丰富多彩。请以“An Unforgettable School Activity”为题，写一次令你难忘的校园活动。要点如下：</p>
        <ol><li>活动的名称和时间；</li><li>你在活动中做了什么、发生了什么；</li><li>你的感受或收获。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '活动名称和时间、经过、感受收获三个要点都写到了',
        '叙述经历用一般过去时，介绍学校惯例（every autumn）用一般现在时',
        '开头点题，结尾写收获',
        '用了 When / Just then / finally / In the end 等连接词',
        '至少用了一个高级句型（如 so…that、as…as I could、when 从句）',
        '拼写、大小写、标点正确',
        '字数在 80–100 词之间'
      ],
      sample: `<p><b>An Unforgettable School Activity</b></p>
        <p>Our school holds a sports meeting every autumn. Last October's sports meeting was the most unforgettable one for me.</p>
        <p>I took part in the 800-meter race. When the race began, I ran as fast as I could. Near the end, I was so tired that I almost wanted to give up. Just then, I heard my classmates cheering for me. I kept running and finally came in third.</p>
        <p>In the end, our class won first prize. From this activity, I learned that teamwork makes us stronger. I am proud of my class.</p>`,
      notes: `<ul>
        <li>开头 Our school holds … every autumn 用一般现在时说惯例，下一句转入过去时讲那一次，时态各就各位。</li>
        <li>as fast as I could、so tired that … 两个句型写出了比赛的紧张过程。</li>
        <li>Just then, I heard my classmates cheering for me. 是故事的转折点，让文章有起伏。</li>
        <li>结尾 I learned that teamwork makes us stronger 和 be proud of 写出收获和感情。</li>
      </ul>` },
    { title: 'A Failure That Helped Me Grow',
      prompt: `<p>成长路上难免有失败。请以“A Failure That Helped Me Grow”为题写一篇短文。要点如下：</p>
        <ol><li>你经历的一次失败（时间、事情）；</li><li>失败后你是怎样做的；</li><li>你从中得到的收获。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '失败的经历、之后的做法、收获三个要点都写到了',
        '讲经历用一般过去时，Since then 后用现在完成时，谈道理用一般现在时',
        '开头交代经历，结尾写道理',
        '用了 but / Since then / From this experience 等连接词',
        '至少用了一个高级句型（如 so…that、宾语从句 I learned that …）',
        '拼写、大小写、标点正确',
        '字数在 80–100 词之间'
      ],
      sample: `<p><b>A Failure That Helped Me Grow</b></p>
        <p>Last term, I took part in an English speech competition. I prepared for it for weeks, but on the day of the competition I was so nervous that I forgot my words. I didn't win any prize, and I felt very sad.</p>
        <p>My teacher told me that failure is the mother of success. She helped me find out my problems. Since then, I have practiced speaking in front of my classmates every week.</p>
        <p>This term I won second prize in the same competition. From this experience, I learned that we should never give up.</p>`,
      notes: `<ul>
        <li>I was so nervous that I forgot my words. 用 so…that 把失败的原因和结果写在一句话里。</li>
        <li>My teacher told me that failure is the mother of success. 把成长话题的好句子放进宾语从句，自然不生硬。</li>
        <li>Since then, I have practiced … 现在完成时写“从那以后一直在做的事”，扣住要点 2。</li>
        <li>结尾前后对比（失败 → 获奖），再用 I learned that … 点明道理。</li>
      </ul>` },
    { title: "Let's Go Green",
      prompt: `<p>为了让家乡更美丽，校英语报以“Let's Go Green”为题征文。要点如下：</p>
        <ol><li>目前存在的环境问题（至少一项）；</li><li>作为中学生，我们能做些什么（至少三条）；</li><li>发出号召。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '环境问题、至少三条做法、号召三个要点都写到了',
        '谈现象和做法用一般现在时，建议用 should / can',
        '开头点出问题，结尾用 Let\'s … 号召',
        '做法用 First / Second / Besides 等连接词列出，举例用 such as',
        '至少用了一个高级句型（如 It is our duty to …、instead of doing）',
        '拼写、大小写、标点正确',
        '字数在 80–100 词之间'
      ],
      sample: `<p><b>Let's Go Green</b></p>
        <p>The earth is our only home, but now it faces many problems, such as air pollution and too much rubbish.</p>
        <p>As students, we can do a lot to protect it. First, we should sort the rubbish at school and at home. Second, we can take public transport or ride bikes instead of going by car. Besides, we should save water and turn off the lights when we leave a room. We can also plant trees every spring.</p>
        <p>It is our duty to protect the earth. Let's act now and make our hometown greener!</p>`,
      notes: `<ul>
        <li>开头用 such as 举出两个具体问题，比只说“环境不好”更清楚。</li>
        <li>sort the rubbish、take public transport、save water、plant trees 都是环保话题积累的短语，这里全部派上了用场。</li>
        <li>instead of going by car 中 of 是介词，后接动名词。</li>
        <li>It is our duty to … 再加 Let's act now … 结尾，既总结又号召。</li>
      </ul>` },
    { title: 'How to Keep Healthy',
      prompt: `<p>健康是一切的基础。请以“How to Keep Healthy”为题写一篇短文，给同学们一些建议。要点如下：</p>
        <ol><li>健康的重要性；</li><li>保持健康的方法（饮食、睡眠、运动等，至少三条）；</li><li>总结。</li></ol>
        <p class="small">要求：80–100 词；文中不得出现真实的姓名和校名。</p>`,
      words: [80, 100],
      checklist: [
        '健康的重要性、至少三条方法、总结三个要点都写到了',
        '谈方法用一般现在时，多用 should / 祈使句提建议',
        '开头点题，结尾用 In a word 等总结',
        '用了 First / Second / What\'s more / Finally 等连接词',
        '至少用了一个高级句型（如 It\'s good for … to do、the more…the …）',
        '拼写、大小写、标点正确',
        '字数在 80–100 词之间'
      ],
      sample: `<p><b>How to Keep Healthy</b></p>
        <p>As we all know, health is very important. Without it, we can't study or live happily. Here are some ways to keep healthy.</p>
        <p>First, we should have a balanced diet. Eat more fruit and vegetables and less fast food. Second, it's good for our health to get enough sleep, so don't stay up late. What's more, we need to do some exercise every day, such as running or playing ball games. Finally, when we feel stressed, we can talk with our parents or friends.</p>
        <p>In a word, the more we care about our health, the happier we will be.</p>`,
      notes: `<ul>
        <li>开头 As we all know, … Here are some ways … 两句话点题并引出下文。</li>
        <li>First / Second / What's more / Finally 把饮食、睡眠、运动、心情四个方面串起来。</li>
        <li>it's good for our health to get enough sleep 用 It is … to do 句型，并用 so 说明结论。</li>
        <li>the more we care …, the happier we will be 用比较级句型总结，结尾有力。</li>
      </ul>` }
  ]
}

);
