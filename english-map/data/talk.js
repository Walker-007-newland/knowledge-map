// 交际用语（第 3 阶段 D 组）
KG.nodes.push(

/* ================= 问候、介绍与告别 ================= */
{
  id: 't-greetings', title: '问候、介绍与告别', short: '问候与介绍', module: 'talk', grade: 4, freq: 2,
  prereqs: ['g-be'],
  tip: '中考情景交际常考“怎么接话”：How do you do? 要原样回答，介绍别人要说 This is...。',
  learn: [
    { h: '见面打招呼', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Hello! / Hi!</td><td>你好！</td><td>Hello! / Hi!</td></tr>
      <tr><td>Good morning / afternoon / evening.</td><td>早上 / 下午 / 晚上好。</td><td>原样回答：Good morning.</td></tr>
      <tr><td>How are you?</td><td>你好吗？</td><td>Fine, thank you. And you? / I'm OK, thanks.</td></tr>
      <tr><td>Nice to meet you.</td><td>很高兴认识你。</td><td>Nice to meet you, <b>too</b>.</td></tr>
      <tr><td>How do you do?</td><td>你好。（初次见面，比较正式）</td><td><b>How do you do?</b>（原样回答）</td></tr></table>
      <p class="ex">—Good morning, Miss Lin. —Good morning, boys and girls.<span class="zh">——林老师早上好。——同学们早上好。</span></p>
      <p class="ex">—How are you, Tom? —Fine, thank you. And you?<span class="zh">——汤姆，你好吗？——很好，谢谢。你呢？</span></p>` },
    { h: '自我介绍与介绍别人', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>What's your name?</td><td>你叫什么名字？</td><td>My name is Li Ming. / I'm Li Ming.</td></tr>
      <tr><td>This is my friend, Kate.</td><td>这是我的朋友凯特。</td><td>Nice to meet you, Kate.</td></tr>
      <tr><td>Where are you from?</td><td>你来自哪里？</td><td>I'm from Fuzhou.</td></tr>
      <tr><td>How old are you?</td><td>你几岁？</td><td>I'm ten (years old).</td></tr></table>
      <p class="ex">—Mum, this is my classmate, Lucy. —Nice to meet you, Lucy.<span class="zh">——妈妈，这是我的同学露西。——很高兴认识你，露西。</span></p>
      <p class="warn">介绍别人要说 <b>This is ...</b>，不说 He is ... / She is ...（当面指着人说“他是”很不礼貌）。</p>` },
    { h: '告别', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Goodbye. / Bye.</td><td>再见。</td><td>Bye. / See you.</td></tr>
      <tr><td>See you later / tomorrow.</td><td>回头见 / 明天见。</td><td>See you.</td></tr>
      <tr><td>Good night.</td><td>晚安。（晚上告别、睡前）</td><td>Good night.</td></tr>
      <tr><td>Have a nice day!</td><td>祝你今天愉快！</td><td>Thanks. You too.</td></tr></table>` },
    { h: '易错点', html: `<ul>
      <li><b>Good evening</b> 是晚上见面的问候；<b>Good night</b> 是晚上告别或睡前说的，别搞反。</li>
      <li><b>How do you do?</b> 不是问“你过得怎么样”，回答也是 How do you do?，不能答 I'm fine.</li>
      <li><b>How are you?</b> 是打招呼，一般回答 Fine, thanks. 不用真的讲病情。</li>
      <li>Nice to meet you. 的回答要加 <b>too</b>。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: "—How do you do?<br>—___", options: ['How do you do?', "I'm fine, thank you.", "I'm doing my homework."], answer: 0,
      explain: 'How do you do? 是初次见面的正式问候，回答也用 How do you do?' },
    { type: 'choice', q: "—Dad, ___ my friend, Mike.<br>—Nice to meet you, Mike.", options: ['this is', 'he is', 'it is'], answer: 0,
      explain: '介绍别人用 This is ...，不说 He is ...。' },
    { type: 'choice', q: "—Hi, I'm Amy.<br>—___ I'm Tom.", options: ["Hi!", "Thank you.", "Goodbye."], answer: 0,
      explain: "对方用 Hi 打招呼，我们也用 Hi! / Hello! 回应，再介绍自己。Thank you 是道谢，Goodbye 是告别。" },
    { type: 'choice', q: "下午三点，你在校门口遇到王老师：<br>—___, Mr. Wang.<br>—Good afternoon.", options: ["Good afternoon", "Good morning", "Good night"], answer: 0,
      explain: "下午见面说 Good afternoon，对方也原样回答 Good afternoon。早上才说 Good morning，Good night 是晚上告别用的。" },
    { type: 'choice', q: "—How are you, Mrs. Green?<br>—___", options: ["I'm OK, thanks.", "I'm Mrs. Green.", "I'm forty."], answer: 0,
      explain: "How are you? 是打招呼问“你好吗”，答 I'm OK, thanks. / Fine, thank you. 不是问名字，也不是问年龄。" },
    { type: 'choice', q: "—Hello, I'm Tom. Nice to meet you.<br>—___", options: ["Nice to meet you, too.", "Yes, I'm nice.", "Fine, thank you."], answer: 0,
      explain: "回答 Nice to meet you. 要在后面加 too：Nice to meet you, too.（我也很高兴认识你）。" },
    { type: 'choice', q: "—What's your name?<br>—___", options: ["My name is Li Ming.", "I'm fine.", "I'm from Fuzhou."], answer: 0,
      explain: "What's your name? 问名字，答 My name is ... 或 I'm ...。I'm fine 回答“你好吗”，I'm from ... 回答“你从哪里来”。" },
    { type: 'choice', q: "—Where are you from?<br>—___", options: ["I'm from Quanzhou.", "I'm eleven.", "I'm a student."], answer: 0,
      explain: "Where are you from? 问来自哪里，答 I'm from + 地点。" },
    { type: 'choice', q: "—How old are you?<br>—___", options: ["I'm ten years old.", "I'm from Xiamen.", "I'm fine, thanks."], answer: 0,
      explain: "How old 问年龄，答 I'm ten (years old)。" },
    { type: 'choice', q: "—Goodbye, Grandma.<br>—___", options: ["Bye. See you.", "Hello!", "Good morning."], answer: 0,
      explain: "别人说再见，回答 Bye. / See you.；Hello 和 Good morning 是见面时说的。" },
    { type: 'choice', q: "—It's time to go home. See you tomorrow, Lily.<br>—___", options: ["See you.", "Nice to meet you.", "How do you do?"], answer: 0,
      explain: "See you tomorrow.（明天见）的回答是 See you.；另外两句是初次见面时说的。" },
    { type: 'choice', q: "晚上七点，你去李叔叔家做客，一进门你说：<br>—___, Uncle Li.", options: ["Good evening", "Good night", "Goodbye"], answer: 0,
      explain: "晚上<b>见面</b>问候用 Good evening；Good night 是晚上<b>告别</b>或睡前说的，Goodbye 是再见。" },
    { type: 'choice', q: "—Have a nice day!<br>—___", options: ["Thanks. You too.", "Yes, I have.", "Good morning."], answer: 0,
      explain: "别人祝你今天愉快，回答 Thanks. You too.（谢谢，你也是）。" }
  ],
  tests: [
    { type: 'choice', q: "—Hello, I'm Wang Hai. How do you do?<br>—___", options: ["How do you do? I'm Jack.", "I'm fine. And you?", "I'm a student."], answer: 0,
      explain: 'How do you do? 要原样回答 How do you do?，不能答 I\'m fine。' },
    { type: 'choice', q: "—Mum, ___ my teacher, Mr. Chen.<br>—Nice to meet you, Mr. Chen.", options: ['this is', 'he is', 'that is me'], answer: 0,
      explain: '当面介绍别人用 This is ...。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Nice to meet you.', options: ['Nice to meet you, too.', "Yes, I'm nice.", 'Thank you very much.'], answer: 0,
      explain: '听到 Nice to meet you. 回答 Nice to meet you, too.' },
    { type: 'fill', q: "—How are you, Kate?<br>—I'm f___, thank you. And you?", answer: ['fine'],
      explain: 'How are you? 的常见回答是 I\'m fine, thank you.' },
    { type: 'choice', q: "晚上十点，你要去睡觉了：<br>—___, Mum.<br>—Good night, dear.", options: ['Good night', 'Good evening', 'Good afternoon'], answer: 0,
      explain: '睡前或晚上告别说 Good night；Good evening 是晚上见面时的问候。' },
    { type: 'fill', q: "—Where are you ___?<br>—I'm from Xiamen.（填一个介词）", answer: ['from'],
      explain: '问“你来自哪里”说 Where are you from?' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'How are you?', options: ["Fine, thanks. And you?", "I'm twelve.", "I'm a student."], answer: 0,
      explain: 'How are you? 是问候“你好吗”，答 Fine, thanks. And you?；问年龄才答 I\'m twelve.' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Hello! I'm Lucy.", options: ["Hello, Lucy! I'm Peter.", "Goodbye, Lucy.", "Thank you, Lucy."], answer: 0,
      explain: "对方打招呼并介绍自己，回应 Hello 并介绍自己。Goodbye 是告别，Thank you 是道谢。" },
    { type: 'fill', q: "—Hi, Bob!<br>—H___, Jim!（填一个词）", answer: ['hi', 'hello'],
      explain: "别人说 Hi，回答 Hi! 或 Hello! 都可以。" },
    { type: 'choice', q: "早上上学，你在校门口见到李老师，你应该说：", options: ["Good morning, Miss Li.", "Good night, Miss Li.", "Good evening, Miss Li."], answer: 0,
      explain: "早上见面问候用 Good morning。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Good afternoon, Tom.", options: ["Good afternoon, Mr. Black.", "Good morning, Mr. Black.", "Thank you, Mr. Black."], answer: 0,
      explain: "Good afternoon 原样回答 Good afternoon。对方说的是下午好，就不能答早上好。" },
    { type: 'fill', q: "—How are you?<br>—Fine, t___. And you?", answer: ['thanks', 'thank you'],
      explain: "How are you? 的常见回答：Fine, thanks. / Fine, thank you. And you?" },
    { type: 'choice', q: "—Lily, this is my cousin, Ben.<br>—___", options: ["Nice to meet you, Ben.", "Yes, he is.", "Goodbye, Ben."], answer: 0,
      explain: "别人给你介绍新朋友，说 Nice to meet you, Ben.（很高兴认识你）。" },
    { type: 'choice', q: "—Hi, I'm Jenny. Nice to meet you.<br>—Hi, Jenny. I'm Ann. ___", options: ["Nice to meet you, too.", "Thank you very much.", "Goodbye."], answer: 0,
      explain: "对方先说了 Nice to meet you，回答时要加 too。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "How do you do?", options: ["How do you do?", "I'm fine, thanks.", "I'm doing well."], answer: 0,
      explain: "How do you do? 是初次见面的正式问候，不是问近况，所以原样回答 How do you do?" },
    { type: 'fill', q: "—How do you do?<br>—H___ do you do?", answer: ['how'],
      explain: "How do you do? 的回答还是 How do you do?" },
    { type: 'choice', q: "（指着身边的女孩向妈妈介绍）Mum, ___ is my friend, Ann.", options: ['this', 'she', 'her'], answer: 0,
      explain: "当面介绍别人用 This is ...，不说 She is ...。" },
    { type: 'fill', q: "—Miss Zhang, t___ is my father.<br>—Nice to meet you, Mr. Wu.", answer: ['this'],
      explain: "介绍别人用 This is ...。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "What's your name?", options: ["My name is Chen Hui.", "I'm fine, thank you.", "It's a cat."], answer: 0,
      explain: "问名字，答 My name is ... / I'm ...。" },
    { type: 'fill', q: "—What's your n___?<br>—I'm Li Hua.", answer: ['name'],
      explain: "What's your name? 你叫什么名字？" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Where are you from?", options: ["I'm from Putian.", "I'm eleven.", "I'm OK."], answer: 0,
      explain: "问来自哪里，答 I'm from + 地点。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "How old are you?", options: ["I'm ten.", "I'm from Fuzhou.", "Fine, thanks."], answer: 0,
      explain: "How old 问年龄，答 I'm ten." },
    { type: 'fill', q: "—How o___ are you?<br>—I'm eleven years old.", answer: ['old'],
      explain: "问年龄用 How old are you?" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Goodbye, Lucy.", options: ["Bye. See you.", "Hello, nice to meet you.", "Good morning."], answer: 0,
      explain: "对方说再见，回答 Bye. / See you." },
    { type: 'fill', q: "—Bye, Mike!<br>—B___! See you.", answer: ['bye'],
      explain: "告别时说 Bye! / Goodbye!" },
    { type: 'fill', q: "放学了，你对同桌说“明天见”：See you t___.", answer: ['tomorrow'],
      explain: "See you tomorrow. 明天见。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "See you later.", options: ["See you.", "How do you do?", "I'm fine, thank you."], answer: 0,
      explain: "See you later.（回头见）的回答是 See you." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Good night, Dad.", options: ["Good night, dear. Sleep well.", "Good evening, dear.", "Good afternoon, dear."], answer: 0,
      explain: "睡前说 Good night，回答也是 Good night；Good evening 是晚上见面时说的。" },
    { type: 'fill', q: "晚上八点，你刚到朋友家门口，见面问候：Good e___!", answer: ['evening'],
      explain: "晚上见面说 Good evening；Good night 是告别或睡前说的。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Have a nice day!", options: ["Thanks. You too.", "Yes, I have a day.", "Nice to meet you."], answer: 0,
      explain: "Have a nice day! 的回答是 Thanks. You too." },
    { type: 'fill', q: "—Have a nice day!<br>—Thanks. You t___.", answer: ['too'],
      explain: "Thanks. You too. 谢谢，你也是。" }
  ]
},

/* ================= 感谢、道歉与回应 ================= */
{
  id: 't-thanks-sorry', title: '感谢、道歉与回应', short: '感谢与道歉', module: 'talk', grade: 4, freq: 3,
  prereqs: ['t-greetings'],
  tip: '中考情景交际最爱考：感谢要回 You\'re welcome，道歉要回 That\'s all right / Never mind，别说成中式英语。',
  learn: [
    { h: '感谢与回答', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Thank you. / Thanks (a lot).</td><td>谢谢。/ 多谢。</td><td rowspan="3">You're welcome.<br>It's my pleasure. / My pleasure.<br>Not at all.<br>That's OK.</td></tr>
      <tr><td>Thank you very much.</td><td>非常感谢。</td></tr>
      <tr><td>Thank you for your help. / Thanks for helping me.</td><td>谢谢你的帮助。</td></tr></table>
      <p class="ex">—Thank you for your help. —You're welcome.<span class="zh">——谢谢你的帮助。——不客气。</span></p>
      <p class="ex">—Thanks a lot for the nice gift. —It's my pleasure.<span class="zh">——非常感谢你的好礼物。——这是我的荣幸。</span></p>
      <p class="warn">不要回答 Don't thank me.（“别谢我”是中式英语）。Thank you for 后面接名词或 doing。</p>` },
    { h: '道歉与回答', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>I'm sorry. / Sorry.</td><td>对不起。</td><td rowspan="3">That's all right. / That's OK.<br>It doesn't matter.（没关系）<br>Never mind.（别在意）<br>No problem.</td></tr>
      <tr><td>Sorry, I'm late.</td><td>对不起，我迟到了。</td></tr>
      <tr><td>I'm sorry for breaking your cup.</td><td>对不起，打破了你的杯子。</td></tr></table>
      <p class="ex">—Sorry, I'm late. —That's all right. Come in, please.<span class="zh">——对不起，我迟到了。——没关系，请进。</span></p>
      <p class="ex">—I'm sorry I lost your pen. —Never mind.<span class="zh">——对不起，我把你的钢笔弄丢了。——别在意。</span></p>
      <p class="warn">道歉不能回答 You're welcome.（那是回答“谢谢”的）。</p>` },
    { h: 'Excuse me 和 Sorry 的区别', html: `<ul>
      <li><b>Excuse me</b>：<b>事前</b>打扰别人时说，比如问路、借过、提问。</li>
      <li><b>Sorry</b>：<b>事后</b>做错了事表示歉意。</li></ul>
      <p class="ex">Excuse me, can you tell me the time?<span class="zh">打扰一下，你能告诉我几点了吗？</span></p>
      <p class="ex">Sorry, I stepped on your foot.<span class="zh">对不起，我踩到你的脚了。</span></p>` },
    { h: '别人夸你怎么办', html: `<p>中国人习惯谦虚地说“哪里哪里”，但英语里被夸奖要大方地说 <b>Thank you.</b></p>
      <p class="ex">—Your English is very good! —Thank you.<span class="zh">——你的英语真好！——谢谢。</span></p>
      <p class="warn">不要回答 No, no, my English is poor. 这会让对方觉得你在否定他的判断。</p>` }
  ],
  examples: [
    { type: 'choice', q: "—Thank you for helping me with my English.<br>—___", options: ["It's my pleasure.", "Don't thank me.", "That's right."], answer: 0,
      explain: '回答感谢用 It\'s my pleasure. / You\'re welcome.；Don\'t thank me. 是中式英语。' },
    { type: 'choice', q: "—Sorry, I broke your ruler.<br>—___", options: ["It doesn't matter.", "You're welcome.", "Not at all, thanks."], answer: 0,
      explain: '回答道歉用 It doesn\'t matter.（没关系）；You\'re welcome 是回答感谢的。' },
    { type: 'choice', q: "—Thanks a lot, Mike.<br>—___", options: ["You're welcome.", "Never mind.", "Excuse me."], answer: 0,
      explain: "别人道谢，最常用的回答是 You're welcome.（不客气）。Never mind 回答道歉，Excuse me 是打扰别人时说的。" },
    { type: 'choice', q: "—Thank you very much for the flowers.<br>—___", options: ["Not at all.", "Never mind.", "It doesn't matter."], answer: 0,
      explain: "Not at all. 也可以回答感谢（不用谢）。Never mind 和 It doesn't matter 是回答道歉的“没关系”。" },
    { type: 'fill', q: "Thank you for ___ (help) me with my homework.", answer: ['helping'],
      explain: "Thank you for 后面接名词或动词 -ing 形式：Thank you for helping me." },
    { type: 'choice', q: "—Sorry, Mum. I didn't clean my room.<br>—___ But please do it now.", options: ["That's OK.", "You're welcome.", "My pleasure."], answer: 0,
      explain: "孩子道歉，妈妈回答 That's OK.（没关系）。You're welcome 和 My pleasure 是回答感谢的。" },
    { type: 'choice', q: "—Sorry, I lost your eraser.<br>—___ I have another one.", options: ["Never mind.", "My pleasure.", "Thank you."], answer: 0,
      explain: "Never mind.（别在意）用来回答道歉，后面说“我还有一块”也说明不介意。" },
    { type: 'fill', q: "—Sorry, I'm a bit late.<br>—No p___. The film hasn't started yet.", answer: ['problem'],
      explain: "No problem. 在这里表示“没关系”，回答道歉。" },
    { type: 'choice', q: "—I'm sorry ___ your cup.<br>—It doesn't matter.", options: ['for breaking', 'for break', 'with breaking'], answer: 0,
      explain: "I'm sorry for doing ... 为做了某事道歉，for 后面接动词 -ing。" },
    { type: 'choice', q: "（上课时你想向老师提问）___, Miss Lin. May I ask a question?", options: ["Excuse me", "Sorry", "You're welcome"], answer: 0,
      explain: "提问前先打扰对方，用 Excuse me（事前）；Sorry 是做错事以后道歉（事后）。" },
    { type: 'choice', q: "—What a nice drawing! You draw very well.<br>—___", options: ["Thank you.", "No, no. It's very bad.", "You're welcome."], answer: 0,
      explain: "被人夸奖，英语里大方地说 Thank you.；中国式的“哪里哪里”会让对方觉得你在否定他。" }
  ],
  tests: [
    { type: 'choice', q: "—Thanks a lot for helping me with my maths.<br>—___", options: ["You're welcome.", "Don't thank me.", "That's right."], answer: 0,
      explain: '回答感谢用 You\'re welcome.；Don\'t thank me. 是中式英语，That\'s right 是“对的”。' },
    { type: 'choice', q: "—Sorry, I broke your pencil.<br>—___", options: ["It doesn't matter.", "You're welcome.", "Yes, I'm sorry."], answer: 0,
      explain: '回答道歉用 It doesn\'t matter.（没关系）。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Your dress is really beautiful!', options: ['Thank you.', "No, no, it's not beautiful.", "You're welcome."], answer: 0,
      explain: '被人夸奖时大方地说 Thank you.，不要用中国式的谦虚否定。' },
    { type: 'fill', q: "—Thank you for your help.<br>—It's my p___.", answer: ['pleasure'],
      explain: 'It\'s my pleasure. 意思是“这是我的荣幸 / 不客气”。' },
    { type: 'choice', q: "___, can you tell me the way to the library?", options: ['Excuse me', 'Sorry', 'Thank you'], answer: 0,
      explain: '事前打扰别人、向人问路用 Excuse me；Sorry 是做错事以后道歉。' },
    { type: 'fill', q: "—I'm sorry I'm late.<br>—Never m___. Come in and sit down.", answer: ['mind'],
      explain: 'Never mind. 意思是“别在意、没关系”，用来回答道歉。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I'm sorry. I forgot to bring your book.", options: ["That's all right. Bring it tomorrow.", "Not at all. You're welcome.", 'Thank you very much.'], answer: 0,
      explain: '对方道歉，回答 That\'s all right.（没关系）；Not at all / You\'re welcome 是回答感谢的。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Thank you for the nice dinner.", options: ["You're welcome.", "Never mind.", "Excuse me."], answer: 0,
      explain: "回答感谢用 You're welcome.；Never mind 是回答道歉的。" },
    { type: 'fill', q: "—Thanks a lot!<br>—You're w___.", answer: ['welcome'],
      explain: "You're welcome. 不客气。" },
    { type: 'choice', q: "—Thank you for showing me around your school.<br>—___", options: ["My pleasure.", "It doesn't matter.", "Don't thank me."], answer: 0,
      explain: "My pleasure. 回答感谢；It doesn't matter 回答道歉；Don't thank me 是中式英语。" },
    { type: 'choice', q: "—Thanks for helping me with my homework.<br>—___", options: ["Not at all.", "Never mind.", "Sorry, I can't."], answer: 0,
      explain: "Not at all. 可以回答感谢（不用谢）。忙已经帮过了，不能说“对不起我不能”；Never mind. 是回答道歉的。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Thank you so much for your help.", options: ["Not at all.", "It doesn't matter.", "Excuse me."], answer: 0,
      explain: "对方感谢你，回答 Not at all.（不用谢）；It doesn't matter 是回答道歉的。" },
    { type: 'choice', q: "Thank you for ___ me the way to the station.", options: ['showing', 'show', 'to show'], answer: 0,
      explain: "Thank you for 后面接动词 -ing。" },
    { type: 'fill', q: "Thank you for ___ (help) me with my English.", answer: ['helping'],
      explain: "for 是介词，后面用动词 -ing 形式 helping。" },
    { type: 'choice', q: "—Thank you for carrying the bag for me, Tom.<br>—___", options: ["That's OK.", "Don't thank me.", "Yes, it's heavy."], answer: 0,
      explain: "That's OK. 可以回答感谢；Don't thank me. 是中式英语，不能用。" },
    { type: 'choice', q: "下面哪一句可以用来回答别人的感谢？", options: ["It's my pleasure.", "Don't thank me.", "Never mind."], answer: 0,
      explain: "It's my pleasure. 回答感谢。Don't thank me 是中式英语；Never mind 回答道歉。" },
    { type: 'fill', q: "—Sorry, I'm late.<br>—That's all r___. Come in, please.", answer: ['right'],
      explain: "That's all right. 没关系，用来回答道歉。" },
    { type: 'choice', q: "—Sorry, I made your book dirty.<br>—___ I can clean it.", options: ["That's OK.", "You're welcome.", "My pleasure."], answer: 0,
      explain: "对方道歉，回答 That's OK.（没关系）。" },
    { type: 'fill', q: "—I'm sorry I can't come to your party.<br>—It doesn't m___.", answer: ['matter'],
      explain: "It doesn't matter. 没关系。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Sorry, I spilt some water on your desk.", options: ["Never mind.", "My pleasure.", "Not at all."], answer: 0,
      explain: "回答道歉用 Never mind.（别在意）；My pleasure 和 Not at all 回答感谢。" },
    { type: 'choice', q: "—Sorry, I forgot to call you last night.<br>—___", options: ["No problem.", "You're welcome.", "Thank you."], answer: 0,
      explain: "No problem. 可以回答道歉，意思是“没关系”。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Sorry, I took your ruler by mistake.", options: ["No problem. Just give it back to me.", "With pleasure.", "Yes, it's my pleasure."], answer: 0,
      explain: "对方道歉，回答 No problem.（没关系）。With pleasure / It's my pleasure 是答应请求或回答感谢的。" },
    { type: 'fill', q: "I'm sorry for ___ (be) late.", answer: ['being'],
      explain: "sorry for 后面接动词 -ing：being late。" },
    { type: 'choice', q: "—___, I'm late, Mr. Li.<br>—That's all right. Sit down, please.", options: ["Sorry", "Excuse me", "Thank you"], answer: 0,
      explain: "迟到已经发生了，是事后道歉，用 Sorry；Excuse me 是事前打扰别人时说的。" },
    { type: 'choice', q: "—I'm sorry, I stepped on your foot.<br>—___", options: ["It doesn't matter.", "You're welcome.", "It's my pleasure."], answer: 0,
      explain: "回答道歉不能用 You're welcome / It's my pleasure（那是回答感谢的），要说 It doesn't matter." },
    { type: 'fill', q: "E___ me. May I come in?", answer: ['excuse'],
      explain: "进门前先打扰对方，说 Excuse me." },
    { type: 'choice', q: "—___, is this seat free?<br>—Yes. Please sit down.", options: ["Excuse me", "Sorry", "Thanks"], answer: 0,
      explain: "向陌生人询问，事前打扰用 Excuse me。" },
    { type: 'choice', q: "—Your English is very good!<br>—___", options: ["Thank you.", "No, my English is poor.", "Not at all. You're welcome."], answer: 0,
      explain: "被夸奖时说 Thank you.，不要用中国式的谦虚否定。" },
    { type: 'fill', q: "—You did a great job today!<br>—T___ you.", answer: ['thank'],
      explain: "被表扬时大方地说 Thank you." }
  ]
},

/* ================= 问路与指路 ================= */
{
  id: 't-ask-way', title: '问路与指路', short: '问路指路', module: 'talk', grade: 5, freq: 2,
  prereqs: ['g-imperative', 'g-prep-place'],
  tip: '问路先说 Excuse me；听力和情景交际常考 How far 问距离、指路的方位词 left / right / next to。',
  learn: [
    { h: '怎么问路', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th></tr>
      <tr><td>Excuse me, where is the post office?</td><td>打扰一下，邮局在哪里？</td></tr>
      <tr><td>Excuse me, how can I get to the zoo?</td><td>请问去动物园怎么走？</td></tr>
      <tr><td>Which is the way to the station?</td><td>哪条路通往车站？</td></tr>
      <tr><td>Is there a bank near here?</td><td>这附近有银行吗？</td></tr>
      <tr><td>Could you tell me the way to the hospital?</td><td>你能告诉我去医院的路吗？</td></tr></table>
      <p class="warn">问路开头说 <b>Excuse me</b>（打扰一下），不说 Sorry。</p>` },
    { h: '怎么指路', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th></tr>
      <tr><td>Go along / down this street.</td><td>沿着这条街走。</td></tr>
      <tr><td>Turn left / right at the second crossing.</td><td>在第二个路口向左 / 右转。</td></tr>
      <tr><td>It's on your left / right.</td><td>它在你的左边 / 右边。</td></tr>
      <tr><td>It's next to / across from / between ...</td><td>它在……旁边 / 对面 / 之间。</td></tr>
      <tr><td>You can take bus No. 5.</td><td>你可以坐 5 路公交车。</td></tr></table>
      <p class="ex">—Excuse me, how can I get to the library? —Go along this street and turn right at the first crossing. It's on your left.<span class="zh">——请问去图书馆怎么走？——沿这条街走，在第一个路口右转，它就在你的左边。</span></p>` },
    { h: '问距离和道谢', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>How far is it (from here)?</td><td>（离这里）有多远？</td><td>It's about two kilometers. / It's about ten minutes' walk.</td></tr>
      <tr><td>Thank you very much.</td><td>非常感谢。</td><td>You're welcome.</td></tr></table>
      <p>如果对方也不知道：</p>
      <p class="ex">—Sorry, I don't know. I'm new here. —Thank you all the same.<span class="zh">——对不起，我不知道，我是新来的。——还是谢谢你。</span></p>` },
    { h: '易错点', html: `<ul>
      <li><b>How far</b> 问距离，答“几公里 / 走几分钟”；不要答成地点。</li>
      <li>ten minutes' walk（步行十分钟），注意 minutes 后面的撇号。</li>
      <li>对方帮不上忙也要礼貌地说 Thank you all the same. / Thanks anyway.</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: "—___, where's the nearest bookstore?<br>—It's across from the park.", options: ['Excuse me', 'Sorry', "You're welcome"], answer: 0,
      explain: '问路开头用 Excuse me（打扰一下）。' },
    { type: 'choice', q: "—How far is your school from here?<br>—___", options: ["It's about fifteen minutes' walk.", "It's next to the bank.", 'Go along this road.'], answer: 0,
      explain: 'How far 问距离，用“步行十五分钟”来回答；另外两个说的是位置和路线。' },
    { type: 'choice', q: "—Excuse me, ___ can I get to the zoo?<br>—You can take bus No. 8.", options: ['how', 'what', 'where'], answer: 0,
      explain: "问“怎样去某地”用 How can I get to ...?" },
    { type: 'choice', q: "—Excuse me, ___ is the way to the train station?<br>—It's over there.", options: ['which', 'who', 'how'], answer: 0,
      explain: "Which is the way to ...? 哪条路通往……？" },
    { type: 'choice', q: "—Is there a supermarket near here?<br>—___ It's across from the school.", options: ["Yes, there is.", "Yes, it is.", "No, there isn't."], answer: 0,
      explain: "Is there ...? 用 there is / there isn't 回答；后面说了位置，说明“有”。" },
    { type: 'choice', q: "—Could you tell me the way ___ the hospital?<br>—Sure.", options: ['to', 'for', 'at'], answer: 0,
      explain: "the way to + 地点：去……的路。" },
    { type: 'fill', q: "Go a___ this street and you'll see the bank.（沿着）", answer: ['along'],
      explain: "Go along this street. 沿着这条街走。" },
    { type: 'choice', q: "Turn right ___ the second crossing.", options: ['at', 'in', 'on'], answer: 0,
      explain: "在某个路口转弯用 at：turn right at the second crossing." },
    { type: 'choice', q: "—Where's the post office?<br>—Turn left, and it's ___ your right.", options: ['on', 'in', 'at'], answer: 0,
      explain: "在你的右边 / 左边：on your right / left." },
    { type: 'choice', q: "The bank is ___ the school and the park.", options: ['between', 'next to', 'across from'], answer: 0,
      explain: "后面有 ... and ...，表示“在两者之间”，用 between ... and ...。" },
    { type: 'choice', q: "—How can I get to the airport?<br>—You can ___ the No. 5 bus.", options: ['take', 'by', 'go'], answer: 0,
      explain: "乘坐公交车用 take the bus / take bus No. 5.；by 是介词（by bus），go 后面不能直接接 the bus。" },
    { type: 'fill', q: "It's about twenty minutes' w___ from here.", answer: ['walk'],
      explain: "twenty minutes' walk 步行二十分钟，minutes 后面有撇号。" },
    { type: 'choice', q: "—Excuse me, where's the cinema?<br>—Sorry, I don't know.<br>—___", options: ["Thanks anyway.", "You're welcome.", "Not at all."], answer: 0,
      explain: "对方没帮上忙，问路的人也要礼貌地说 Thanks anyway. / Thank you all the same." }
  ],
  tests: [
    { type: 'choice', q: "—___, where's the post office?<br>—It's next to the bank.", options: ['Excuse me', 'Thank you', "You're welcome"], answer: 0,
      explain: '向陌生人问路，开头用 Excuse me。' },
    { type: 'choice', q: "—How far is the library from here?<br>—___", options: ["It's about ten minutes' walk.", "It's next to the hospital.", 'Turn left at the first crossing.'], answer: 0,
      explain: 'How far 问距离，要回答路程或时间。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Excuse me, is there a bookstore near here?', options: ["Yes. Go along this street and it's on your right.", 'Yes, I like reading books.', "You're welcome."], answer: 0,
      explain: '对方问附近有没有书店，要告诉他怎么走。' },
    { type: 'fill', q: "—How can I get to the zoo?<br>—Go down this road and turn l___ at the second crossing.", answer: ['left'],
      explain: 'turn left 向左转。' },
    { type: 'fill', q: "—Excuse me, which is the ___ to the station?（路）<br>—Go straight and you'll see it.", answer: ['way'],
      explain: 'the way to ... 去……的路。' },
    { type: 'choice', q: "—Excuse me, where's the nearest hospital?<br>—___ I'm new here.", options: ["Sorry, I don't know.", "Yes, it's very near.", 'Thank you all the same.'], answer: 0,
      explain: '后面说“我是新来的”，所以前面是“对不起，我不知道”。Thank you all the same 是问路的人说的。' },
    { type: 'choice', q: '你在问路，对方这样回答你。听一听，选出你应该怎么说。', say: "Sorry, I don't know. I'm new here.", options: ['Thanks all the same.', "You're welcome.", 'Turn left, please.'], answer: 0,
      explain: '对方没帮上忙，也要礼貌地说 Thanks all the same.（还是谢谢你）。' },
    { type: 'choice', q: "你想向路人打听公园在哪里，开口应该说：", options: ["Excuse me, where's the park?", "Sorry, where's the park?", "Thank you, where's the park?"], answer: 0,
      explain: "问路前先打扰对方，用 Excuse me；Sorry 是做错事后道歉。" },
    { type: 'fill', q: "E___ me, is there a hospital near here?", answer: ['excuse'],
      explain: "问路开头说 Excuse me." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Excuse me, how can I get to the museum?", options: ["You can take bus No. 3.", "It's two kilometers.", "Yes, I can."], answer: 0,
      explain: "How can I get to ...? 问怎么去，回答交通方式或路线；It's two kilometers 回答 How far。" },
    { type: 'fill', q: "—Excuse me, how can I g___ to Gulangyu?<br>—You can take a boat.", answer: ['get'],
      explain: "get to + 地点：到达某地。" },
    { type: 'choice', q: "—Excuse me, which is the way to the bus station?<br>—___", options: ["Go straight and turn left at the first crossing.", "It's very big.", "By bus."], answer: 0,
      explain: "问哪条路去车站，要告诉对方怎么走。" },
    { type: 'fill', q: "—Is t___ a bank near here?<br>—Yes, there is.", answer: ['there'],
      explain: "Is there a ... near here? 这附近有……吗？" },
    { type: 'choice', q: "—Could you tell me the way to the hospital?<br>—___", options: ["Sure. Go along this street and it's on your left.", "Yes, I could.", "No, I'm not."], answer: 0,
      explain: "Could you ...? 是客气的请求，答应时说 Sure.，再指路；不说 Yes, I could." },
    { type: 'fill', q: "Could you t___ me the way to the library?", answer: ['tell'],
      explain: "Could you tell me the way to ...? 你能告诉我去……的路吗？" },
    { type: 'choice', q: "___ down this road and you'll find the station.", options: ['Go', 'Going', 'Goes'], answer: 0,
      explain: "指路用祈使句，动词原形开头：Go down this road." },
    { type: 'fill', q: "沿着这条街走：Go ___ this street.（填一个介词）", answer: ['along', 'down'],
      explain: "Go along / down this street. 都表示“沿着这条街走”。" },
    { type: 'choice', q: "在第三个路口向右转：Turn right at the ___ crossing.", options: ['third', 'three', 'thirdth'], answer: 0,
      explain: "“第几个路口”用序数词：the third crossing." },
    { type: 'fill', q: "Turn left and the cinema is on your r___.", answer: ['right'],
      explain: "on your right 在你的右边。" },
    { type: 'choice', q: '听对话，书店在哪一边？', say: [{who:'M', text:"Excuse me, where's the bookstore?"}, {who:'W', text:"Go along this street. It's on your left."}], options: ['在左边', '在右边', '在对面'], answer: 0,
      explain: "女士说 It's on your left.（在你的左边）。" },
    { type: 'choice', q: "（医院在邮局对面）The hospital is ___ the post office.", options: ['across from', 'next to', 'between'], answer: 0,
      explain: "across from 在……对面；next to 在……旁边；between 在两者之间。" },
    { type: 'fill', q: "（书店在银行旁边）The bookstore is n___ to the bank.", answer: ['next'],
      explain: "next to 在……旁边。" },
    { type: 'fill', q: "You can t___ the No. 15 bus to get there.", answer: ['take'],
      explain: "乘坐公交车用 take." },
    { type: 'choice', q: '听对话，女士建议怎样去三坊七巷？', say: [{who:'M', text:"Excuse me, how can I get to Sanfang Qixiang?"}, {who:'W', text:"It's far from here. You can take bus No. 11."}], options: ['坐 11 路公交车', '步行', '坐地铁'], answer: 0,
      explain: "女士说 You can take bus No. 11." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "How far is it from here?", options: ["It's about two kilometers.", "It's next to the bank.", "Go along this road."], answer: 0,
      explain: "How far 问距离，回答多少公里或走多久。" },
    { type: 'fill', q: "—How f___ is the park from here?<br>—About five minutes by bike.", answer: ['far'],
      explain: "回答是路程用时，所以问 How far." },
    { type: 'choice', q: "It's about ten ___ walk from my home to school.", options: ["minutes'", "minute's", "minutes"], answer: 0,
      explain: "十分钟的路程：ten minutes' walk，复数名词所有格在 s 后面加撇号。" },
    { type: 'fill', q: "—How far is the bus stop?<br>—It's only five m___' walk.", answer: ['minutes'],
      explain: "five minutes' walk 步行五分钟。" },
    { type: 'fill', q: "—Sorry, I don't know.<br>—Thank you all the s___.", answer: ['same'],
      explain: "Thank you all the same. 还是谢谢你。" }
  ]
},

/* ================= 购物 ================= */
{
  id: 't-shopping', title: '购物', short: '购物', module: 'talk', grade: 6, freq: 2,
  prereqs: ['g-how-q'],
  tip: '购物对话常出现在听力和补全对话里，Can I help you? / How much / try it on / I\'ll take it 一定要熟。',
  learn: [
    { h: '店员招呼与回答', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Can I help you? / May I help you?</td><td>需要帮忙吗？</td><td>Yes, please. I want a T-shirt.<br>No, thanks. I'm just looking.</td></tr>
      <tr><td>What can I do for you?</td><td>我能为你做什么？</td><td>I'd like a pair of shoes.<br>I'm looking for a jacket.</td></tr></table>
      <p class="ex">—Can I help you? —Yes, please. I'd like a sweater.<span class="zh">——需要帮忙吗？——是的，我想要一件毛衣。</span></p>` },
    { h: '问价钱、颜色和尺码', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>How much is it / the skirt?</td><td>（它）多少钱？</td><td><b>It's</b> 50 yuan.</td></tr>
      <tr><td>How much are they / the shoes?</td><td>（它们）多少钱？</td><td><b>They're</b> 120 yuan.</td></tr>
      <tr><td>What color do you want?</td><td>你要什么颜色？</td><td>Blue, please.</td></tr>
      <tr><td>What size do you want?</td><td>你要多大号？</td><td>Size M. / Medium.</td></tr></table>
      <p class="warn">鞋子 shoes、裤子 pants、袜子 socks 是复数，问价用 How much <b>are</b> ...?，答 They're ...。</p>` },
    { h: '试穿与决定', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Can I try it on?</td><td>我能试穿一下吗？</td><td>Sure. / Of course.</td></tr>
      <tr><td>It's too expensive. Do you have a cheaper one?</td><td>太贵了，有便宜点的吗？</td><td>Yes. How about this one?</td></tr>
      <tr><td>I'll take it / them.</td><td>我买了。</td><td>Here you are.</td></tr></table>
      <p class="ex">—This one is 30 yuan. —OK, I'll take it. Here's the money.<span class="zh">——这个 30 元。——好的，我买了。给你钱。</span></p>` },
    { h: '易错点', html: `<ul>
      <li>回答 Can I help you? 用 <b>Yes, please.</b> 或 No, thanks.，不说 Yes, you can.</li>
      <li>try it on / try them on：代词放中间。</li>
      <li>How much 问价钱，How many 问数量。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: "—What can I do for you?<br>—___", options: ["I'd like a schoolbag.", "You're welcome.", 'Yes, you can.'], answer: 0,
      explain: 'What can I do for you? 是店员问“要买什么”，直接说想要什么。' },
    { type: 'choice', q: "—How much are the socks?<br>—___", options: ["They're ten yuan.", "It's ten yuan.", 'I want two pairs.'], answer: 0,
      explain: 'socks 是复数，回答用 They\'re ...。' },
    { type: 'choice', q: "—May I help you?<br>—___ I'm looking for a cap.", options: ["Yes, please.", "Yes, you may.", "No, thanks."], answer: 0,
      explain: "店员问 May I help you?，需要帮忙就答 Yes, please.，不说 Yes, you may.；后面说要找帽子，所以不是 No, thanks." },
    { type: 'choice', q: "—Can I help you?<br>—No, thanks. I'm just ___.", options: ['looking', 'seeing', 'watching'], answer: 0,
      explain: "I'm just looking. 我只是随便看看，是不需要帮忙时的固定说法。" },
    { type: 'choice', q: "—How much is the schoolbag?<br>—___", options: ["It's 89 yuan.", "They're 89 yuan.", "It's blue."], answer: 0,
      explain: "schoolbag 是单数，问价用 How much is ...?，答 It's ...；It's blue 回答颜色。" },
    { type: 'fill', q: "—What c___ do you like?<br>—Yellow.", answer: ['color', 'colour'],
      explain: "回答是颜色，问 What color ...?（英式拼写 colour）。" },
    { type: 'choice', q: "—What ___ do you want?<br>—Size L.", options: ['size', 'color', 'price'], answer: 0,
      explain: "回答是尺码 Size L，所以问 What size ...?" },
    { type: 'choice', q: "—Can I try it on?<br>—___ The fitting room is over there.", options: ["Sure.", "No, thanks.", "You're welcome."], answer: 0,
      explain: "顾客想试穿，店员答应：Sure. / Of course." },
    { type: 'choice', q: "These pants look nice. Can I ___?", options: ['try them on', 'try on them', 'try it on'], answer: 0,
      explain: "pants 是复数，用 them；代词要放在 try 和 on 中间：try them on。" },
    { type: 'choice', q: "—It's too expensive. Do you have a cheaper one?<br>—Yes. ___ this one? It's only 60 yuan.", options: ['How about', 'How much', 'What size'], answer: 0,
      explain: "How about this one? 这个怎么样？店员推荐更便宜的一件。" },
    { type: 'choice', q: "—These shoes are 150 yuan.<br>—Good. I'll ___.", options: ['take them', 'take it', 'buy it'], answer: 0,
      explain: "I'll take it / them. 我买了。shoes 是复数，用 them。" },
    { type: 'choice', q: "—How ___ is this cap?<br>—It's 25 yuan.", options: ['much', 'many', 'long'], answer: 0,
      explain: "回答是价钱，问 How much；How many 问数量。" }
  ],
  tests: [
    { type: 'choice', q: "—Can I help you?<br>—___ I want a T-shirt.", options: ['Yes, please.', "No, you can't.", 'Yes, I can.'], answer: 0,
      explain: '回答店员的 Can I help you? 用 Yes, please.' },
    { type: 'choice', q: "—How much are these shoes?<br>—___", options: ["They're 120 yuan.", "It's 120 yuan.", "They're size 38."], answer: 0,
      explain: 'How much 问价钱，shoes 是复数，用 They\'re 120 yuan.' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'What color do you want?', options: ['Blue, please.', 'Size M, please.', 'Thirty yuan.'], answer: 0,
      explain: 'What color 问颜色，答 Blue。' },
    { type: 'fill', q: "—This coat looks nice. Can I try it ___?<br>—Sure.（填一个词）", answer: ['on'],
      explain: 'try it on 试穿。' },
    { type: 'fill', q: "—It's 50 yuan.<br>—OK, I'll t___ it.", answer: ['take'],
      explain: 'I\'ll take it. 是购物时“我买了”的固定说法。' },
    { type: 'choice', q: "—The skirt is 800 yuan.<br>—Oh, it's too ___. Do you have a cheaper one?", options: ['expensive', 'cheap', 'small'], answer: 0,
      explain: '后面要“便宜一点的”，说明嫌太贵，用 expensive。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Can I help you?', options: ["No, thanks. I'm just looking.", "You're welcome.", "I'm fine, thank you."], answer: 0,
      explain: '不需要帮忙时说 No, thanks. I\'m just looking.（我只是随便看看）。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "May I help you?", options: ["Yes, please. I want a pair of shoes.", "Yes, you may.", "I'm fine, thanks."], answer: 0,
      explain: "回答店员的 May I help you? 用 Yes, please.，不说 Yes, you may." },
    { type: 'fill', q: "—Can I help you?<br>—Yes, p___. I'd like a sweater.", answer: ['please'],
      explain: "Yes, please. 是的，麻烦你了。" },
    { type: 'choice', q: "—Can I help you?<br>—No, thanks. ___", options: ["I'm just looking.", "I'll take it.", "Here you are."], answer: 0,
      explain: "不需要帮忙时说 I'm just looking.（只是看看）；I'll take it 是决定买。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "What can I do for you?", options: ["I'd like a pair of sports shoes.", "Yes, you can.", "I'm doing my homework."], answer: 0,
      explain: "What can I do for you? 是店员问你要什么，直接说 I'd like ...。" },
    { type: 'fill', q: "—What can I do for you?<br>—I'm l___ for a jacket.", answer: ['looking'],
      explain: "I'm looking for ... 我在找……" },
    { type: 'choice', q: "—How much is this hat?<br>—___", options: ["It's 30 yuan.", "They're 30 yuan.", "It's red."], answer: 0,
      explain: "hat 是单数，答 It's 30 yuan." },
    { type: 'fill', q: "—How much ___ the dictionary?<br>—It's 40 yuan.（填 is 或 are）", answer: ['is'],
      explain: "dictionary 是单数，用 How much is ...?" },
    { type: 'fill', q: "—How much ___ the socks?<br>—They're 12 yuan.（填 is 或 are）", answer: ['are'],
      explain: "socks 是复数，用 How much are ...?" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "How much are the pants?", options: ["They're 99 yuan.", "It's 99 yuan.", "They're black."], answer: 0,
      explain: "pants 是复数，答 They're ...；They're black 回答颜色。" },
    { type: 'choice', q: '听对话，男士想要什么颜色的毛衣？', say: [{who:'W', text:"Can I help you?"}, {who:'M', text:"Yes, I want a sweater for my son."}, {who:'W', text:"What color does he like?"}, {who:'M', text:"Green."}], options: ['绿色', '蓝色', '红色'], answer: 0,
      explain: "男士最后说 Green.（绿色）。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "What size do you want?", options: ["Size M, please.", "Blue, please.", "Forty yuan."], answer: 0,
      explain: "What size 问尺码，答 Size M." },
    { type: 'fill', q: "—What s___ do you wear?<br>—Medium.", answer: ['size'],
      explain: "回答是中号，所以问 What size ...?" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Can I try it on?", options: ["Sure. Here you are.", "Yes, it's 50 yuan.", "No, thanks. I'm just looking."], answer: 0,
      explain: "顾客要试穿，店员说 Sure.；I'm just looking 是顾客说的。" },
    { type: 'choice', q: "I like this skirt. Can I ___?", options: ['try it on', 'try on it', 'try them on'], answer: 0,
      explain: "skirt 是单数用 it，代词放中间：try it on。" },
    { type: 'fill', q: "（这双鞋）Can I try ___ on?（填一个代词）", answer: ['them'],
      explain: "shoes 是复数，用 them，放在 try 和 on 中间。" },
    { type: 'choice', q: "—This bag is 300 yuan.<br>—That's too expensive. Do you have a ___ one?", options: ['cheaper', 'more expensive', 'nicer'], answer: 0,
      explain: "嫌太贵，所以要便宜一点的：a cheaper one." },
    { type: 'choice', q: '听对话，男士觉得第一顶帽子怎么样？', say: [{who:'M', text:"How much is the cap?"}, {who:'W', text:"It's 80 yuan."}, {who:'M', text:"It's too expensive. Do you have a cheaper one?"}, {who:'W', text:"Yes. How about this one? It's 35 yuan."}], options: ['太贵了', '太小了', '颜色不好看'], answer: 0,
      explain: "男士说 It's too expensive.（太贵了）。" },
    { type: 'choice', q: "—It's 20 yuan.<br>—OK, ___ Here's the money.", options: ["I'll take it.", "I'm just looking.", "Can I help you?"], answer: 0,
      explain: "后面付钱了，说明决定买：I'll take it." },
    { type: 'choice', q: "—How ___ is the watch?<br>—It's 200 yuan.", options: ['much', 'many', 'old'], answer: 0,
      explain: "问价钱用 How much." },
    { type: 'choice', q: "—How ___ T-shirts do you want?<br>—Two, please.", options: ['many', 'much', 'long'], answer: 0,
      explain: "T-shirts 是可数名词复数，问数量用 How many." },
    { type: 'fill', q: "—How m___ pens do you want?<br>—Three.", answer: ['many'],
      explain: "回答是数量，问 How many + 可数名词复数。" }
  ]
},

/* ================= 打电话 ================= */
{
  id: 't-phone', title: '打电话', short: '打电话', module: 'talk', grade: 6, freq: 2,
  prereqs: ['t-greetings'],
  tip: '打电话用语很特别：介绍自己用 This is ...，问对方用 Who\'s that? / Is that ...?，不说 I\'m ... / Who are you?',
  learn: [
    { h: '电话里的“我”和“你”', html: `<table class="tbl">
      <tr><th>要表达</th><th>✔ 电话用语</th><th>✘ 不说</th></tr>
      <tr><td>我是汤姆</td><td>This is Tom (speaking).</td><td>I'm Tom.</td></tr>
      <tr><td>你是玛丽吗？</td><td>Is that Mary (speaking)?</td><td>Are you Mary?</td></tr>
      <tr><td>你是谁？</td><td>Who's that (speaking)? / Who's calling, please?</td><td>Who are you?</td></tr></table>
      <div class="rhyme">电话里，this 说自己，that 问对方。</div>` },
    { h: '找人和回答', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td rowspan="3">May I speak to Lily?<br>Can I speak to Lily?</td><td rowspan="3">我能和莉莉通话吗？</td><td>（本人接）Speaking. / This is Lily speaking.</td></tr>
      <tr><td>（帮忙去叫）Hold on, please. / Wait a moment.</td></tr>
      <tr><td>（不在）Sorry, she isn't in. Can I take a message?</td></tr></table>
      <p class="ex">—Hello! May I speak to Lily? —Speaking. Who's that? —This is Wang Fang.<span class="zh">——喂，我能和莉莉通话吗？——我就是。你是谁？——我是王芳。</span></p>` },
    { h: '留言与其他', html: `<ul>
      <li>Can I take a message? 要我帮你捎个口信吗？（接电话的人说）</li>
      <li>Can I leave a message? / Would you like to leave a message? 留个口信。</li>
      <li>Please ask him to call me back. 请让他给我回电话。</li>
      <li>Sorry, you've got the wrong number. 对不起，你打错了。</li></ul>
      <p class="ex">—Sorry, he's out. Can I take a message? —Yes. Please ask him to call me back.<span class="zh">——对不起，他出去了。要我捎个口信吗？——好的，请让他给我回电话。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: "—Hello! Is that Jim speaking?<br>—Yes, ___.", options: ['this is Jim', "I'm Jim", 'that is Jim'], answer: 0,
      explain: '电话里介绍自己用 This is ...。' },
    { type: 'choice', q: "—Hello, may I speak to Mr. Li?<br>—___ I'll get him for you.", options: ['Hold on, please.', 'Who are you?', 'Sorry, he is out.'], answer: 0,
      explain: '后面说“我去叫他”，所以先请对方稍等：Hold on, please.' },
    { type: 'choice', q: "—Hello! ___ Mary?<br>—Yes, this is Mary speaking.", options: ['Is that', 'Are you', 'You are'], answer: 0,
      explain: "电话里问“你是……吗？”用 Is that ...?，不说 Are you ...?" },
    { type: 'choice', q: "—Hello, may I speak to Mr. Brown?<br>—Sure. ___", options: ["Who's calling, please?", "Who are you?", "Are you Mr. Brown?"], answer: 0,
      explain: "电话里问对方是谁用 Who's calling, please? / Who's that?；Who are you? 不礼貌。" },
    { type: 'choice', q: "—Hello! May I speak ___ Jack?<br>—Speaking.", options: ['to', 'at', 'for'], answer: 0,
      explain: "电话里找人说 May I speak to ...?" },
    { type: 'choice', q: "—Hello! Can I speak to Ann?<br>—___ Who's that?", options: ["This is Ann speaking.", "I'm Ann.", "Ann is me."], answer: 0,
      explain: "本人接电话说 Speaking. 或 This is Ann speaking.；电话里不说 I'm Ann." },
    { type: 'choice', q: "—Can I speak to Tom?<br>—Sorry, he ___. He went to the library.", options: ["isn't in", "is in", "doesn't in"], answer: 0,
      explain: "要找的人不在：Sorry, he isn't in.（in 在家）。后面说他去图书馆了，所以不在。" },
    { type: 'choice', q: "—Sorry, Lucy is out. Can I ___ a message?<br>—Yes, please.", options: ['take', 'leave', 'get'], answer: 0,
      explain: "接电话的人说 Can I take a message?（帮你捎口信）；打电话的人才说 leave a message（留口信）。" },
    { type: 'choice', q: "—Sorry, Mr. Li isn't in now.<br>—Can I ___ a message?<br>—Sure.", options: ['leave', 'take', 'give'], answer: 0,
      explain: "打电话的人想留言，说 Can I leave a message?" },
    { type: 'fill', q: "Please ask her to c___ me back.", answer: ['call'],
      explain: "call sb. back 给某人回电话。" },
    { type: 'choice', q: "—Hello, is that Wang Ping?<br>—Sorry, there's no Wang Ping here. You've got the wrong ___.", options: ['number', 'name', 'way'], answer: 0,
      explain: "打错电话：You've got the wrong number." }
  ],
  tests: [
    { type: 'choice', q: "—Hello! May I speak to Lily?<br>—___", options: ['Speaking.', "I'm Lily.", 'Yes, you can speak.'], answer: 0,
      explain: '接电话的人就是要找的人时，回答 Speaking.（我就是）。电话里不说 I\'m Lily.' },
    { type: 'choice', q: "—Hello, ___ is Jim. Is that Tom?<br>—Yes, it is.", options: ['this', 'I', 'he'], answer: 0,
      explain: '电话里介绍自己用 This is ...。' },
    { type: 'fill', q: "—Hello! May I s___ to Mr. Wang?<br>—Sorry, he isn't in.", answer: ['speak'],
      explain: '电话里找人说 May I speak to ...?' },
    { type: 'fill', q: "—Can I speak to Kate?<br>—Hold ___, please. I'll get her.", answer: ['on'],
      explain: 'Hold on, please. 请稍等（别挂电话）。' },
    { type: 'choice', q: "—Can I speak to your father?<br>—Sorry, he isn't in. ___", options: ['Can I take a message?', 'Who are you?', 'Hold on, please.'], answer: 0,
      explain: '要找的人不在，可以问要不要捎口信。他不在，就不能说“请稍等”；Who are you? 在电话里不礼貌。' },
    { type: 'choice', q: '打电话时，想问对方“你是谁？”，应该说：', options: ["Who's that, please?", 'Who are you?', 'What are you?'], answer: 0,
      explain: '电话里问对方是谁用 Who\'s that? 或 Who\'s calling?，不说 Who are you?' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Hello. May I speak to Mr. Wang?', options: ["Sorry, he's out. Would you like to leave a message?", "Sorry, you are wrong.", "Yes, you're welcome."], answer: 0,
      explain: '王先生不在，礼貌地问对方要不要留言。' },
    { type: 'choice', q: "打电话时，你想说“我是李华”，应该说：", options: ["This is Li Hua speaking.", "I'm Li Hua speaking.", "Li Hua is me."], answer: 0,
      explain: "电话里介绍自己用 This is ... (speaking)." },
    { type: 'fill', q: "—Hello! T___ is Peter. Is that Bob?<br>—Yes, speaking.", answer: ['this'],
      explain: "电话里说自己用 this。" },
    { type: 'fill', q: "—Hello! Is t___ Kate?<br>—Yes, speaking.", answer: ['that'],
      explain: "电话里问对方用 that：Is that Kate?" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Hello, is that Jack?", options: ["Yes, this is Jack speaking.", "Yes, I'm Jack.", "Yes, you are."], answer: 0,
      explain: "电话里说自己用 This is ... speaking.，不说 I'm Jack." },
    { type: 'choice', q: "打电话问对方“你是凯特吗？”，应该说：", options: ["Is that Kate?", "Are you Kate?", "You are Kate?"], answer: 0,
      explain: "电话里 this 说自己，that 问对方：Is that Kate?" },
    { type: 'fill', q: "—May I speak to Mr. Zhao?<br>—Who's c___, please?", answer: ['calling'],
      explain: "Who's calling, please? 请问您是哪位？" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Who's that speaking?", options: ["This is Wu Lei.", "I'm Wu Lei.", "That's Wu Lei."], answer: 0,
      explain: "电话里回答自己是谁用 This is ...。" },
    { type: 'choice', q: "—Hello, ___ I speak to Miss Gao?<br>—Speaking.", options: ['may', 'must', 'need'], answer: 0,
      explain: "礼貌地请求通话：May I speak to ...?" },
    { type: 'choice', q: '你就是露西。听一听，选出恰当的答语。', say: "Hello. Can I speak to Lucy?", options: ["Speaking.", "I'm Lucy.", "Lucy isn't in."], answer: 0,
      explain: "要找的人就是自己，回答 Speaking.（我就是）。" },
    { type: 'fill', q: "—May I speak to Linda?<br>—S___. Who's that?", answer: ['speaking'],
      explain: "Speaking. 我就是。" },
    { type: 'choice', q: "—Can I speak to your mother?<br>—___ She's coming.", options: ["Wait a moment, please.", "Sorry, she isn't in.", "Who are you?"], answer: 0,
      explain: "妈妈马上来接，所以请对方稍等：Wait a moment, please." },
    { type: 'choice', q: '听对话，Jenny 去哪里了？', say: [{who:'M', text:"Hello. May I speak to Jenny?"}, {who:'W', text:"Sorry, she isn't in. She went to the library."}], options: ['图书馆', '学校', '公园'], answer: 0,
      explain: "女士说 She went to the library." },
    { type: 'fill', q: "—Is your father at home?<br>—Sorry, he isn't i___.", answer: ['in'],
      explain: "be in 在家；isn't in 不在家。" },
    { type: 'fill', q: "—Sorry, she's out. Can I t___ a message?<br>—Yes, please.", answer: ['take'],
      explain: "接电话的人说 take a message（帮你捎口信）。" },
    { type: 'choice', q: "—Sorry, Mr. Smith is out.<br>—Oh. Can I ___ a message for him?", options: ['leave', 'take', 'bring'], answer: 0,
      explain: "打电话的人留口信用 leave a message." },
    { type: 'choice', q: "—Can I take a message?<br>—Yes. Please ask him to ___ me back.", options: ['call', 'calling', 'calls'], answer: 0,
      explain: "ask sb. to do，to 后接动词原形：call me back." },
    { type: 'choice', q: '听对话，男士想让汤姆做什么？', say: [{who:'W', text:"Sorry, Tom isn't in. Can I take a message?"}, {who:'M', text:"Yes. Please ask him to call me back. My number is 8765 4321."}], options: ['给他回电话', '去他家', '发电子邮件'], answer: 0,
      explain: "男士说 Please ask him to call me back." },
    { type: 'choice', q: '你家没有姓王的人。听一听，选出恰当的答语。', say: "Hello, is that Mr. Wang's home?", options: ["Sorry, you've got the wrong number.", "Yes, I'm Mr. Wang.", "You're welcome."], answer: 0,
      explain: "对方打错了，说 Sorry, you've got the wrong number." },
    { type: 'fill', q: "Sorry, you've got the w___ number.", answer: ['wrong'],
      explain: "the wrong number 错的号码。" }
  ]
},

/* ================= 看病与健康建议 ================= */
{
  id: 't-doctor', title: '看病与健康建议', short: '看病', module: 'talk', grade: 7, freq: 2,
  prereqs: ['g-modal', 'v-body-health'],
  tip: '看病对话常考 What\'s the matter? 的回答、You should / You\'d better 给建议，以及 I\'m sorry to hear that 表示同情。',
  learn: [
    { h: '医生问、病人答', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>What's the matter (with you)?<br>What's wrong with you?<br>What's the trouble?</td><td>你怎么了？</td><td>I have a cold / a fever / a headache / a toothache / a sore throat.<br>I don't feel well.</td></tr>
      <tr><td>How long have you been like this?</td><td>你这样多久了？</td><td>For two days. / Since yesterday.</td></tr>
      <tr><td>How do you feel now?</td><td>你现在感觉怎么样？</td><td>Much better, thanks.</td></tr></table>
      <p class="ex">—What's the matter with you? —I have a bad cold.<span class="zh">——你怎么了？——我得了重感冒。</span></p>` },
    { h: '医生给建议', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th></tr>
      <tr><td>You should drink more water.</td><td>你应该多喝水。</td></tr>
      <tr><td>You shouldn't eat too many sweets.</td><td>你不应该吃太多甜食。</td></tr>
      <tr><td>You'd better stay in bed. / You'd better not go out.</td><td>你最好卧床休息。/ 你最好别出去。</td></tr>
      <tr><td>Take this medicine three times a day.</td><td>这药一天吃三次。</td></tr>
      <tr><td>Don't worry. It's nothing serious.</td><td>别担心，不严重。</td></tr></table>
      <p class="warn">You'd better（= You had better）后面接<b>动词原形</b>，否定是 had better <b>not</b> do。</p>` },
    { h: '朋友生病了怎么说', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>I'm sorry to hear that.</td><td>听到这个消息我很难过。</td><td>Thank you.</td></tr>
      <tr><td>I hope you'll get well soon. / Take care.</td><td>希望你早日康复。/ 保重。</td><td>Thanks.</td></tr></table>
      <p class="ex">—I have a fever. —I'm sorry to hear that. You should see a doctor.<span class="zh">——我发烧了。——真遗憾。你应该去看医生。</span></p>` },
    { h: '易错点', html: `<ul>
      <li>What's wrong <b>with</b> you? 里的 with 不能丢。</li>
      <li>have <b>a</b> cold / <b>a</b> fever / <b>a</b> headache，记得加 a。</li>
      <li>听到别人生病、遇到坏事，回答 I'm sorry to hear that.，不说 That's all right.</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: "—What's wrong with you, Tom?<br>—___", options: ['I have a sore throat.', "I'm Tom's brother.", "Yes, I'm Tom."], answer: 0,
      explain: 'What\'s wrong with you? 问“你怎么了”，回答自己哪里不舒服。' },
    { type: 'choice', q: "—I have a fever.<br>—You'd better ___ to see a doctor.", options: ['go', 'to go', 'going'], answer: 0,
      explain: 'had better 后接动词原形。' },
    { type: 'choice', q: "—What's the matter?<br>—I have ___ headache.", options: ['a', 'an', '/'], answer: 0,
      explain: "have a headache / a cold / a fever，前面要加 a；headache 以辅音音素开头，用 a。" },
    { type: 'fill', q: "—You look pale. What's wrong?<br>—I don't feel w___.", answer: ['well'],
      explain: "I don't feel well. 我感觉不舒服。" },
    { type: 'choice', q: "—How long have you been like this?<br>—___", options: ["Since last night.", "Three times a day.", "Much better."], answer: 0,
      explain: "How long 问持续多久，答 Since last night. / For two days.；Three times a day 是频率。" },
    { type: 'choice', q: "—How do you feel now?<br>—___ Thank you, doctor.", options: ["Much better.", "For two days.", "I feel a cold."], answer: 0,
      explain: "How do you feel now? 问现在感觉如何，答 Much better.（好多了）。" },
    { type: 'choice', q: "—I have a cough.<br>—You ___ drink more warm water.", options: ['should', "shouldn't", "mustn't"], answer: 0,
      explain: "咳嗽了，建议多喝温水，用 should（应该）。" },
    { type: 'fill', q: "Take this medicine three t___ a day.", answer: ['times'],
      explain: "three times a day 一天三次。" },
    { type: 'choice', q: "—Is it serious, doctor?<br>—___ It's nothing serious. Just have a good rest.", options: ["Don't worry.", "Good idea.", "You're welcome."], answer: 0,
      explain: "病人担心，医生安慰：Don't worry. It's nothing serious." },
    { type: 'choice', q: "—I hurt my leg yesterday.<br>—___ Does it hurt now?", options: ["I'm sorry to hear that.", "That's all right.", "Good idea."], answer: 0,
      explain: "听到别人受伤，表示同情：I'm sorry to hear that.；That's all right 是回答道歉的。" },
    { type: 'choice', q: "—I've got a cold and I can't go to school today.<br>—Take care. I hope you'll get ___ soon.", options: ['well', 'good', 'nice'], answer: 0,
      explain: "get well 康复，固定说法：I hope you'll get well soon." },
    { type: 'choice', q: "What's wrong ___ you?", options: ['with', 'for', 'to'], answer: 0,
      explain: "What's wrong with sb.? 某人怎么了？with 不能丢。" }
  ],
  tests: [
    { type: 'choice', q: "—What's the matter with you?<br>—___", options: ['I have a bad cold.', "I'm a doctor.", "I'd like some water."], answer: 0,
      explain: 'What\'s the matter? 问你哪里不舒服，回答病情。' },
    { type: 'choice', q: "—I have a toothache.<br>—You ___ eat too many sweets.", options: ["shouldn't", 'should', 'must'], answer: 0,
      explain: '牙疼了，建议“不应该”吃太多糖，用 shouldn\'t。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'I have a bad cold.', options: ["I'm sorry to hear that.", "That's all right.", 'Congratulations!'], answer: 0,
      explain: '听到别人生病，用 I\'m sorry to hear that. 表示同情。' },
    { type: 'fill', q: "—How long have you been like this?<br>—F___ two days.", answer: ['for'],
      explain: '回答持续多久，用 for + 一段时间。' },
    { type: 'fill', q: "—I feel very tired.<br>—You'd better ___ to bed early.（go）", answer: ['go'],
      explain: 'had better 后接动词原形 go。' },
    { type: 'choice', q: "—Thank you, doctor.<br>—___ Drink more water and have a good rest.", options: ["You're welcome.", 'Never mind.', 'Me too.'], answer: 0,
      explain: '病人道谢，医生回答 You\'re welcome.；Never mind 是回答道歉的。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "What's wrong with you?", options: ['I have a headache.', 'Yes, something is wrong.', "I'm fifteen years old."], answer: 0,
      explain: '特殊疑问句不用 Yes 回答，要直接说哪里不舒服。' },
    { type: 'fill', q: "—What's the t___?<br>—I have a bad cough.", answer: ['trouble'],
      explain: "What's the trouble? 也是问“你怎么了”。" },
    { type: 'choice', q: "—What's the matter with Tom?<br>—He has ___ fever.", options: ['a', 'an', '/'], answer: 0,
      explain: "have a fever 发烧，要加 a。" },
    { type: 'fill', q: "I have ___ toothache.（填冠词）", answer: ['a'],
      explain: "have a toothache 牙疼，要加 a。" },
    { type: 'choice', q: "我嗓子疼，用英语说：", options: ["I have a sore throat.", "I have sore a throat.", "I am a sore throat."], answer: 0,
      explain: "have a sore throat 嗓子疼，a 放在 sore 前面。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "You don't look well. What's wrong?", options: ["I don't feel well. I have a headache.", "That's all right.", "You're welcome."], answer: 0,
      explain: "别人问你怎么了，说出不舒服：I don't feel well." },
    { type: 'fill', q: "—What's wrong, Lily?<br>—I don't f___ well.", answer: ['feel'],
      explain: "I don't feel well. 我感觉不舒服。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "How long have you been like this?", options: ["For three days.", "Three times a day.", "Much better now."], answer: 0,
      explain: "How long 问持续多久，答 For three days." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "How do you feel now?", options: ["Much better, thanks.", "For two days.", "Twice a day."], answer: 0,
      explain: "问现在的感觉，答 Much better, thanks." },
    { type: 'fill', q: "—How do you feel today?<br>—M___ better, thank you.", answer: ['much'],
      explain: "Much better. 好多了。" },
    { type: 'fill', q: "You have a fever. You s___ drink more water.", answer: ['should'],
      explain: "给建议用 should（应该）。" },
    { type: 'choice', q: "You'd better ___ out. It's raining hard.", options: ['not go', 'not to go', "don't go"], answer: 0,
      explain: "had better 的否定是 had better not + 动词原形。" },
    { type: 'choice', q: "—I have a bad cough.<br>—You'd better ___ cold drinks.", options: ['not have', 'not having', 'no have'], answer: 0,
      explain: "had better not do 最好不要做某事。" },
    { type: 'choice', q: "Take this medicine ___ a day.", options: ['three times', 'three time', 'third times'], answer: 0,
      explain: "一天三次：three times a day，times 用复数。" },
    { type: 'choice', q: '听对话，这药一天吃几次？', say: [{who:'M', text:"How often should I take the medicine, doctor?"}, {who:'W', text:"Twice a day, after meals."}], options: ['两次', '三次', '一次'], answer: 0,
      explain: "医生说 Twice a day.（一天两次）。" },
    { type: 'fill', q: "Don't w___. It's nothing serious.", answer: ['worry'],
      explain: "Don't worry. 别担心。" },
    { type: 'choice', q: "—Doctor, is it serious?<br>—___ You'll be fine in two days.", options: ["No, it's nothing serious.", "Yes, it's very serious.", "That's all right."], answer: 0,
      explain: "后面说两天就好，说明不严重：It's nothing serious." },
    { type: 'fill', q: "—My brother broke his arm.<br>—I'm sorry to h___ that.", answer: ['hear'],
      explain: "I'm sorry to hear that. 听到这个我很难过。" },
    { type: 'choice', q: "—I couldn't sleep well last night. I had a bad toothache.<br>—___ You'd better see a dentist.", options: ["I'm sorry to hear that.", "That's all right.", "Well done!"], answer: 0,
      explain: "听到别人生病，表示同情：I'm sorry to hear that." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I hope you'll get well soon.", options: ["Thanks.", "The same to you.", "You're welcome."], answer: 0,
      explain: "别人祝你早日康复，回答 Thanks." },
    { type: 'fill', q: "—I have a cold.<br>—Take c___ and get well soon.", answer: ['care'],
      explain: "Take care. 保重。" },
    { type: 'fill', q: "—What's wrong w___ your leg?<br>—I hurt it when I played football.", answer: ['with'],
      explain: "What's wrong with ...? with 不能丢。" },
    { type: 'choice', q: "—What's the matter ___ Linda?<br>—She has a stomachache.", options: ['with', 'for', 'about'], answer: 0,
      explain: "What's the matter with sb.? 某人怎么了？" },
    { type: 'choice', q: "下面哪句话是正确的？", options: ["What's wrong with you?", "What's wrong you?", "What's wrong for you?"], answer: 0,
      explain: "What's wrong with you? 中的 with 不能丢，也不能换成 for。" }
  ]
},

/* ================= 邀请、建议与回应 ================= */
{
  id: 't-invite-suggest', title: '邀请、建议与回应', short: '邀请与建议', module: 'talk', grade: 6, freq: 3,
  prereqs: ['g-would-like'],
  tip: '中考高频：拒绝邀请要说 I\'d love to, but ...；回答建议常用 Good idea / Sounds great。',
  learn: [
    { h: '邀请与回答', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Would you like to go to the movies?</td><td>你想去看电影吗？</td><td>接受：Yes, I'd love to. / Sure.<br>拒绝：I'd love to, but I have to study for a test.</td></tr>
      <tr><td>Can you come to my party?</td><td>你能来参加我的聚会吗？</td><td>Sure, I'd love to.<br>Sorry, I can't. I have to ...</td></tr>
      <tr><td>Would you like some tea?</td><td>来点茶吗？</td><td>Yes, please. / No, thanks.</td></tr></table>
      <p class="ex">—Would you like to play tennis with me? —I'd love to, but I have to help my mom.<span class="zh">——你想和我一起打网球吗？——我很想去，但是我得帮妈妈干活。</span></p>
      <p class="warn">拒绝邀请先说 I'd love to, but ... 再说理由，不要直接说 No, I don't want.</p>` },
    { h: '提建议的说法', html: `<table class="tbl">
      <tr><th>说法</th><th>后面接</th><th>例子</th></tr>
      <tr><td>Let's ...</td><td>动词原形</td><td>Let's go swimming.</td></tr>
      <tr><td>Shall we ...?</td><td>动词原形</td><td>Shall we have a picnic?</td></tr>
      <tr><td>Why not ...? / Why don't you ...?</td><td>动词原形</td><td>Why not take a bus?</td></tr>
      <tr><td>What about ...? / How about ...?</td><td>名词 / doing</td><td>How about playing football?</td></tr></table>` },
    { h: '怎么回答建议', html: `<table class="tbl">
      <tr><th>同意</th><th>不同意</th></tr>
      <tr><td>Good idea! / That's a good idea.<br>Sounds great / good!<br>OK. / All right. / Sure.</td><td>Sorry, I ...<br>I'm afraid not.<br>I don't think it's a good idea.</td></tr></table>
      <p class="ex">—How about going hiking this weekend? —Sounds great!<span class="zh">——这周末去远足怎么样？——听起来很棒！</span></p>
      <p class="ex">—Shall we go to the zoo or the park? —It's up to you.<span class="zh">——我们去动物园还是公园？——你来定吧。</span></p>` },
    { h: '易错点', html: `<ul>
      <li>Would you like some ...? 答 <b>Yes, please. / No, thanks.</b>，不说 Yes, I would like.</li>
      <li>Would you like to ...? 同意说 Yes, I'd love <b>to</b>.，to 不能丢。</li>
      <li>How about / What about 后面接 doing。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: "—Would you like to go fishing with us?<br>—___, but I have a piano lesson.", options: ["I'd love to", 'Yes, I would', "No, I don't"], answer: 0,
      explain: '后面有 but 说明要拒绝，委婉拒绝用 I\'d love to, but ...。' },
    { type: 'choice', q: "—Let's play ping-pong after school.<br>—___", options: ['Good idea!', "You're welcome.", "That's all right."], answer: 0,
      explain: '回答 Let\'s ... 的建议，同意就说 Good idea!' },
    { type: 'choice', q: "—Would you like to visit the museum with us?<br>—Yes, I'd love ___.", options: ['to', 'it', '/'], answer: 0,
      explain: "接受 Would you like to ...? 的邀请说 Yes, I'd love to.，to 不能丢（代替后面的动作）。" },
    { type: 'choice', q: "—Can you come to my party on Saturday?<br>—___ I have to visit my grandparents.", options: ["Sorry, I can't.", "Sure, I'd love to.", "Yes, I can."], answer: 0,
      explain: "后面说要去看望祖父母，是拒绝：Sorry, I can't. I have to ..." },
    { type: 'choice', q: "—Would you like some juice?<br>—___ I'm thirsty.", options: ["Yes, please.", "No, thanks.", "Yes, I would like."], answer: 0,
      explain: "Would you like some ...? 接受说 Yes, please.；口渴了当然要。不说 Yes, I would like." },
    { type: 'choice', q: "Shall we ___ a picnic this weekend?", options: ['have', 'having', 'to have'], answer: 0,
      explain: "Shall we 后面接动词原形。" },
    { type: 'choice', q: "Why not ___ a taxi? It's faster.", options: ['take', 'taking', 'to take'], answer: 0,
      explain: "Why not 后面接动词原形：Why not take a taxi?" },
    { type: 'choice', q: "What about ___ to the park this afternoon?", options: ['going', 'go', 'to go'], answer: 0,
      explain: "What about / How about 后面接名词或 doing。" },
    { type: 'choice', q: "—Let's play football this afternoon.<br>—___ I have to look after my little sister.", options: ["Sorry, I can't.", "Good idea!", "Sounds great!"], answer: 0,
      explain: "后面说要照顾妹妹，是不同意：Sorry, I can't." },
    { type: 'choice', q: "—Shall we go by bus or by bike?<br>—___ I'm OK with both.", options: ["It's up to you.", "Have a good time.", "You're welcome."], answer: 0,
      explain: "两个都可以，让对方决定：It's up to you." }
  ],
  tests: [
    { type: 'choice', q: "—Would you like to go to the movies with me tonight?<br>—___, but I have to finish my homework.", options: ["I'd love to", "No, I wouldn't", 'Yes, I do'], answer: 0,
      explain: '后面有 but 和理由，是委婉拒绝：I\'d love to, but ...。' },
    { type: 'choice', q: "—Would you like some more rice?<br>—___ I'm full.", options: ['No, thanks.', 'Yes, please.', 'Yes, I would.'], answer: 0,
      explain: '后面说“我饱了”，所以谢绝：No, thanks.' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Let's go swimming this afternoon.", options: ['Sounds great!', "You're welcome.", 'Never mind.'], answer: 0,
      explain: '回答建议，同意可以说 Sounds great!' },
    { type: 'fill', q: "—How a___ playing basketball after school?<br>—Good idea!", answer: ['about'],
      explain: 'How about doing ...? 提建议“……怎么样？”' },
    { type: 'fill', q: "—Why ___ you join the music club? You sing so well.<br>—That's a good idea.（填一个词，用缩写）", answer: ["don't"],
      explain: 'Why don\'t you do ...? 为什么不……呢？用来提建议。' },
    { type: 'choice', q: "—Shall we have a picnic this Sunday?<br>—___ The weather report says it will rain.", options: ["I'm afraid not.", "Sure, let's go.", 'With pleasure.'], answer: 0,
      explain: '后面说天气预报有雨，说明不同意：I\'m afraid not.' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Would you like to come to my birthday party?', options: ["Yes, I'd love to.", 'Yes, I like.', "No, I don't want."], answer: 0,
      explain: '接受邀请说 Yes, I\'d love to.；Yes, I like 不完整，No, I don\'t want 不礼貌。' },
    { type: 'fill', q: "—Would you like to come to the concert?<br>—Yes, I'd love t___.", answer: ['to'],
      explain: "Yes, I'd love to. 的 to 不能丢。" },
    { type: 'choice', q: "—Would you like to join us for dinner?<br>—___", options: ["Yes, I'd love to.", "Yes, I'd love.", "Yes, I like."], answer: 0,
      explain: "接受邀请说 Yes, I'd love to.，love 后面的 to 不能丢。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Would you like to play basketball with us after school?", options: ["I'd love to, but I have to go to my piano lesson.", "No, I don't want.", "Yes, I like basketball."], answer: 0,
      explain: "委婉拒绝先说 I'd love to, but ...，再说理由；No, I don't want 不礼貌。" },
    { type: 'fill', q: "—Can you come to the zoo with us?<br>—I'd love to, b___ I'm busy this weekend.", answer: ['but'],
      explain: "I'd love to, but ... 委婉拒绝。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Can you come to my birthday party on Sunday?", options: ["Sure, I'd love to.", "Yes, it's Sunday.", "You're welcome."], answer: 0,
      explain: "接受邀请：Sure, I'd love to." },
    { type: 'fill', q: "—Can you go hiking with us?<br>—Sorry, I can't. I h___ to study for a test.", answer: ['have'],
      explain: "拒绝时说理由：I have to ...（我得……）。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Would you like some tea?", options: ["Yes, please.", "Yes, I'd like.", "Yes, I like tea."], answer: 0,
      explain: "Would you like some ...? 接受说 Yes, please." },
    { type: 'fill', q: "—Would you like some cake?<br>—No, t___. I'm full.", answer: ['thanks'],
      explain: "谢绝食物说 No, thanks." },
    { type: 'choice', q: "Let's ___ a kite in the park.", options: ['fly', 'flying', 'to fly'], answer: 0,
      explain: "Let's 后面接动词原形。" },
    { type: 'fill', q: "—___ go to the library together.<br>—OK.（填一个词，用缩写）", answer: ["let's"],
      explain: "Let's + 动词原形：我们……吧。" },
    { type: 'fill', q: "—S___ we meet at the school gate at eight?<br>—OK. See you then.", answer: ['shall'],
      explain: "Shall we ...? 我们……好吗？" },
    { type: 'choice', q: "Why don't you ___ your teacher for help?", options: ['ask', 'asking', 'to ask'], answer: 0,
      explain: "Why don't you 后面接动词原形。" },
    { type: 'choice', q: "How about ___ a walk after dinner?", options: ['taking', 'take', 'to take'], answer: 0,
      explain: "How about 后面接 doing。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "What about going to the cinema tonight?", options: ["Good idea.", "You're welcome.", "Not at all."], answer: 0,
      explain: "回答建议，同意说 Good idea." },
    { type: 'fill', q: "—Let's have a picnic this weekend.<br>—S___ great!", answer: ['sounds'],
      explain: "Sounds great! 听起来很棒！" },
    { type: 'choice', q: "—Shall we play basketball after school?<br>—___ I hurt my foot yesterday.", options: ["I'm afraid not.", "Good idea.", "Sure."], answer: 0,
      explain: "脚受伤了不能打球，所以不同意：I'm afraid not." },
    { type: 'fill', q: "—Pizza or noodles?<br>—It's up to y___.", answer: ['you'],
      explain: "It's up to you. 你来决定。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Shall we go to the beach or the mountains?", options: ["It's up to you.", "Yes, we shall.", "No, we shan't."], answer: 0,
      explain: "选择疑问句不用 Yes / No 回答；让对方决定说 It's up to you." }
  ]
},

/* ================= 请求、许可与回应 ================= */
{
  id: 't-request', title: '请求、许可与回应', short: '请求与许可', module: 'talk', grade: 7, freq: 3,
  prereqs: ['g-modal'],
  tip: '中考必考陷阱：Would you mind ...? 同意要答 Of course not / Not at all（意思是“不介意”）。',
  learn: [
    { h: '请求别人帮忙', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Can / Could you help me?<br>Would you please open the door?</td><td>你能帮我吗？<br>请你开一下门好吗？</td><td>答应：Sure. / Of course. / Certainly. / No problem. / With pleasure.<br>拒绝：Sorry, I ...</td></tr>
      <tr><td>Could you please not play loud music?<br>Would you please not ...?</td><td>请你别……好吗？</td><td>Sorry, I won't do it again.<br>Sorry, I'll turn it down right away.</td></tr></table>
      <p class="ex">—Could you help me carry the box? —With pleasure.<span class="zh">——你能帮我搬这个箱子吗？——很乐意。</span></p>
      <p class="warn">Could you ...? 里的 could 表示客气，回答时不用 could：说 Sure.，不说 Yes, I could.</p>` },
    { h: 'Would you mind ...? 要反着答', html: `<p>mind 的意思是“介意”。所以：</p>
      <table class="tbl">
      <tr><th>说法</th><th>同意（= 不介意）</th><th>不同意</th></tr>
      <tr><td>Would you mind opening the window?<br>Would you mind if I sit here?</td><td><b>Of course not.</b><br><b>Not at all.</b><br>No, go ahead.</td><td>Sorry, ...<br>I'm afraid ...<br>You'd better not.</td></tr></table>
      <p class="ex">—Would you mind closing the door? —Not at all.<span class="zh">——你介意关一下门吗？——一点也不介意。（马上关）</span></p>
      <div class="rhyme">mind 问“介不介意”，不介意才答 not；<br>答 Yes 就是“我介意”，千万别说 Yes, please。</div>
      <p>Would you mind 后面接 <b>doing</b>，或者 if 从句。</p>` },
    { h: '请求许可', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>May I / Can I use your pen?</td><td>我可以用你的笔吗？</td><td>允许：Sure. / Yes, you can. / Go ahead.<br>不允许：No, you can't. / Sorry, ...</td></tr>
      <tr><td>Must I finish it today?</td><td>我必须今天完成吗？</td><td>肯定：Yes, you must.<br>否定：No, you <b>needn't</b>. / No, you don't have to.</td></tr></table>
      <p class="warn">Must I ...? 的否定回答不用 mustn't（禁止），用 needn't / don't have to（不必）。</p>` },
    { h: '主动帮忙', html: `<p class="ex">—Let me help you. —Thanks. That's very kind of you.<span class="zh">——我来帮你吧。——谢谢，你真好。</span></p>
      <p class="ex">—Do you need any help? —No, thanks. I can do it myself.<span class="zh">——需要帮忙吗？——不用了，谢谢，我自己能行。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: "—Would you mind turning off the TV?<br>—___ I'll do it right away.", options: ['Not at all.', 'Yes, I do.', 'Yes, please.'], answer: 0,
      explain: '后面说“我马上关”，表示不介意，回答 Not at all.' },
    { type: 'choice', q: "—Must I clean the room now, Mum?<br>—No, you ___. You can do it after lunch.", options: ["needn't", "mustn't", "can't"], answer: 0,
      explain: 'Must I ...? 的否定回答用 needn\'t（不必）。' },
    { type: 'choice', q: "—Could you lend me your dictionary?<br>—___ Here you are.", options: ["Sure.", "Not at all.", "You're welcome."], answer: 0,
      explain: "答应别人的请求说 Sure. / Of course. / No problem.；Not at all 用来回答 Would you mind ...? 或感谢。" },
    { type: 'choice', q: "Could you please ___ talk in class?", options: ['not', "don't", 'not to'], answer: 0,
      explain: "Could you please not do ...? 请你别……好吗？否定直接在动词前加 not。" },
    { type: 'choice', q: "—Could you tell me the way to the station?<br>—___", options: ["Of course.", "Yes, I could.", "No, I couldn't."], answer: 0,
      explain: "Could you ...? 里的 could 只表示客气，回答不用 could，答应说 Of course. / Sure." },
    { type: 'choice', q: "—Would you mind if I open the window?<br>—___ I have a cold.", options: ["Sorry, you'd better not.", "Of course not.", "Not at all."], answer: 0,
      explain: "我感冒了，所以不希望开窗：Sorry, you'd better not.；Of course not / Not at all 表示“不介意”，是同意。" },
    { type: 'choice', q: "Would you mind ___ the door?", options: ['closing', 'close', 'to close'], answer: 0,
      explain: "Would you mind 后面接 doing，或者 if 从句。" },
    { type: 'choice', q: "—May I use your computer?<br>—___ I'm using it now.", options: ["Sorry, you can't.", "Sure, go ahead.", "Yes, you may."], answer: 0,
      explain: "电脑正在用，不允许：Sorry, you can't." },
    { type: 'choice', q: "—Let me help you with the heavy box.<br>—___", options: ["Thanks. That's very kind of you.", "Yes, you may.", "You're welcome."], answer: 0,
      explain: "别人主动帮忙，感谢说 Thanks. That's very kind of you." },
    { type: 'choice', q: "—Do you need any help?<br>—___ I can do it myself.", options: ["No, thanks.", "Yes, please.", "Of course not."], answer: 0,
      explain: "后面说自己能行，所以谢绝：No, thanks." }
  ],
  tests: [
    { type: 'choice', q: "—Would you mind opening the window?<br>—___ It's hot in here.", options: ['Of course not.', "Yes, I'd love to.", 'Yes, I do.'], answer: 0,
      explain: 'Would you mind ...? 表示同意要答 Of course not.（不介意）。' },
    { type: 'choice', q: "—Could you help me carry the box?<br>—___", options: ['With pleasure.', "You're welcome.", "That's all right."], answer: 0,
      explain: '答应别人的请求可以说 With pleasure.（乐意效劳）。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Would you mind if I sit here?', options: ['Not at all. Please sit down.', 'Yes, please sit down.', 'Never mind.'], answer: 0,
      explain: '同意对方坐下就是“不介意”，答 Not at all.；Yes 表示“介意”，和后面的 please sit down 矛盾。' },
    { type: 'fill', q: "—Must I finish the work today?<br>—No, you n___. You can finish it tomorrow.", answer: ["needn't", 'need not'],
      explain: 'Must I ...? 否定回答用 needn\'t（不必）。' },
    { type: 'fill', q: "—May I use your pen?<br>—Sure. Go a___.", answer: ['ahead'],
      explain: 'Go ahead. 用吧 / 请便。' },
    { type: 'choice', q: "—May I watch TV now, Mum?<br>—___ You must do your homework first.", options: ["No, you can't.", 'Yes, you may.', 'Of course.'], answer: 0,
      explain: '后面说“你必须先写作业”，所以是不允许：No, you can\'t.' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Could you please turn down the music?', options: ["Sorry. I'll turn it down right away.", 'Yes, I could.', 'Not at all.'], answer: 0,
      explain: '别人请你把音乐关小，道歉并马上照做。Not at all 是回答 Would you mind 的；Could you 不用 could 回答。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Can you help me with my maths?", options: ["No problem.", "Yes, you can.", "Never mind."], answer: 0,
      explain: "答应别人的请求说 No problem.；Yes, you can 是答应“我能……吗”的。" },
    { type: 'fill', q: "—Could you carry this bag for me?<br>—C___.（当然）", answer: ['certainly'],
      explain: "Certainly. 当然可以。" },
    { type: 'choice', q: "—Could you please not play the piano so late?<br>—___", options: ["Sorry, I won't do it again.", "Yes, I could.", "Not at all."], answer: 0,
      explain: "别人请你别做某事，道歉并保证：Sorry, I won't do it again." },
    { type: 'fill', q: "Would you please n___ eat in the library?", answer: ['not'],
      explain: "Would you please not do ...? 请你别……好吗？" },
    { type: 'choice', q: "—Could you open the door for me?<br>—___", options: ["Sure.", "Yes, I could.", "Yes, I can't."], answer: 0,
      explain: "Could you ...? 表示客气，答应说 Sure.，不说 Yes, I could." },
    { type: 'choice', q: "—Could I borrow your bike?<br>—Yes, you ___.", options: ['can', 'could', 'must'], answer: 0,
      explain: "Could I ...? 里的 could 表示客气，回答用 can：Yes, you can." },
    { type: 'fill', q: "—Would you mind turning down the TV?<br>—Of course n___. I'll do it now.", answer: ['not'],
      explain: "同意 Would you mind ...? 要说 Of course not.（当然不介意）。" },
    { type: 'choice', q: '你在图书馆，有人想放音乐。听一听，选出恰当的答语。', say: "Would you mind if I play some music here?", options: ["Sorry, you'd better not. Keep quiet, please.", "Not at all. Keep quiet, please.", "Yes, please. Play it."], answer: 0,
      explain: "图书馆要安静，所以不同意：Sorry, you'd better not." },
    { type: 'choice', q: "—Would you mind if I sit here?<br>—___ My friend will sit here.", options: ["Sorry, I'm afraid you can't.", "Not at all.", "No, go ahead."], answer: 0,
      explain: "座位留给朋友了，所以不同意：Sorry, I'm afraid ...；另外两个是“不介意，请坐”。" },
    { type: 'choice', q: "Would you mind ___ your bike a little? It's in the way.", options: ['moving', 'move', 'to move'], answer: 0,
      explain: "Would you mind 后接 doing。" },
    { type: 'fill', q: "Would you mind ___ I use your phone?（填一个词）", answer: ['if'],
      explain: "Would you mind if + 从句：我……你介意吗？" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "May I borrow your pen?", options: ["Sure. Here you are.", "Yes, you must.", "Not at all."], answer: 0,
      explain: "允许别人用你的东西：Sure. Here you are." },
    { type: 'choice', q: "—Must I hand in my homework today?<br>—No, you ___. You can hand it in tomorrow.", options: ["don't have to", "mustn't", "can't"], answer: 0,
      explain: "Must I ...? 否定回答用 needn't / don't have to（不必）；mustn't 是“禁止”。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Must I clean the classroom now?", options: ["Yes, you must.", "No, you mustn't.", "Yes, you need."], answer: 0,
      explain: "Must I ...? 肯定回答 Yes, you must.；否定回答不用 mustn't。" },
    { type: 'fill', q: "—Let me help you.<br>—Thanks. That's very k___ of you.", answer: ['kind'],
      explain: "That's very kind of you. 你真好。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Let me carry the box for you.", options: ["Thanks. That's very kind of you.", "Yes, you can.", "It doesn't matter."], answer: 0,
      explain: "别人主动帮忙，感谢对方：Thanks. That's very kind of you.；Yes, you can 是答应别人请求许可的，It doesn't matter 是回答道歉的。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Do you need any help?", options: ["No, thanks. I can do it myself.", "Yes, you need.", "Never mind."], answer: 0,
      explain: "不需要帮忙，礼貌谢绝：No, thanks." },
    { type: 'fill', q: "—Do you need any help?<br>—No, thanks. I can do it m___.", answer: ['myself'],
      explain: "do it myself 我自己做。" }
  ]
},

/* ================= 询问看法、同意与反对 ================= */
{
  id: 't-opinions', title: '询问看法、同意与反对', short: '观点与看法', module: 'talk', grade: 7, freq: 2,
  prereqs: ['g-wh-q'],
  tip: '注意 What do you think of ...? 和 How do you like ...? 的搭配，以及 I think so / I\'m afraid not 等简略回答。',
  learn: [
    { h: '问对方的看法', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>What do you think of the movie?</td><td rowspan="3">你觉得这部电影怎么样？</td><td rowspan="3">I think it's great.<br>It's boring.<br>I like it very much.</td></tr>
      <tr><td>How do you like the movie?</td></tr>
      <tr><td>How do you feel about the movie?</td></tr></table>
      <p class="warn">固定搭配：<b>What</b> do you think of ...? / <b>How</b> do you like ...?，不说 How do you think of ...?</p>` },
    { h: '同意与反对', html: `<table class="tbl">
      <tr><th>同意</th><th>反对 / 不确定</th></tr>
      <tr><td>I agree (with you).<br>You're right.<br>I think so.<br>Me too.（我也是）<br>Me neither.（我也不）</td><td>I don't agree.<br>I don't think so.<br>I'm afraid not.<br>I'm not sure.</td></tr></table>
      <p class="ex">—I think English is very useful. —I agree with you.<span class="zh">——我认为英语很有用。——我同意你的看法。</span></p>
      <p class="ex">—I don't like rainy days. —Me neither.<span class="zh">——我不喜欢下雨天。——我也不喜欢。</span></p>` },
    { h: '简略回答“是不是”', html: `<table class="tbl">
      <tr><th>回答</th><th>意思</th></tr>
      <tr><td>I think so. / I don't think so.</td><td>我认为是。/ 我认为不是。</td></tr>
      <tr><td>I hope so. / I hope not.</td><td>希望如此。/ 希望不会。（好事 / 坏事）</td></tr>
      <tr><td>I'm afraid so. / I'm afraid not.</td><td>恐怕是这样。/ 恐怕不是（不会、不行）。</td></tr></table>
      <p class="ex">—Will it rain tomorrow? —I hope not. We're going to have a picnic.<span class="zh">——明天会下雨吗？——希望不会，我们要去野餐。</span></p>
      <p class="warn">不说 Yes, I think. 要说 I think so.（so 不能丢）。</p>` },
    { h: '让对方决定', html: `<p class="ex">—Shall we eat noodles or rice? —It's up to you.<span class="zh">——我们吃面还是吃饭？——你来决定。</span></p>
      <p class="ex">—Which is better? —It depends.<span class="zh">——哪个更好？——看情况。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: "—___ do you like your new school?<br>—It's very beautiful.", options: ['How', 'What', 'Which'], answer: 0,
      explain: '固定搭配 How do you like ...?（你觉得……怎么样？）' },
    { type: 'choice', q: "—Do you think it will be sunny tomorrow?<br>—___ We're going to climb the mountain.", options: ['I hope so.', "I'm afraid so.", "I don't hope so."], answer: 0,
      explain: '要去爬山，当然希望是晴天：I hope so.' },
    { type: 'choice', q: "下面哪句话是正确的？", options: ["What do you think of the movie?", "How do you think of the movie?", "What do you like the movie?"], answer: 0,
      explain: "固定搭配：What do you think of ...? / How do you like ...?，不能混用成 How do you think of ...?" },
    { type: 'choice', q: "How do you feel ___ the new rules?", options: ['about', 'of', 'with'], answer: 0,
      explain: "How do you feel about ...? 你觉得……怎么样？用 about。" },
    { type: 'choice', q: "—What do you think of the TV show?<br>—___", options: ["I think it's boring.", "It starts at seven.", "On TV."], answer: 0,
      explain: "问看法，回答评价：I think it's boring. / It's great." },
    { type: 'choice', q: "—I think we should save water.<br>—I ___ with you.", options: ['agree', 'think', 'like'], answer: 0,
      explain: "I agree with you. 我同意你的看法。" },
    { type: 'choice', q: "—Is Tom coming to the party?<br>—I think ___. He told me yesterday.", options: ['so', 'it', 'that'], answer: 0,
      explain: "简略回答“我认为是”：I think so.，so 不能丢。" },
    { type: 'choice', q: "—I like ice cream.<br>—___ It's my favorite.", options: ["Me too.", "Me neither.", "I don't."], answer: 0,
      explain: "对方说喜欢，我也喜欢：Me too.；Me neither 用在否定句后面。" },
    { type: 'choice', q: "—I think maths is the most interesting subject.<br>—___ I like English better.", options: ["I don't agree.", "I agree.", "Me too."], answer: 0,
      explain: "后面说更喜欢英语，说明不同意：I don't agree." },
    { type: 'choice', q: "—Is the museum open today?<br>—___ It's closed on Mondays.", options: ["I'm afraid not.", "I hope so.", "I think so."], answer: 0,
      explain: "后面说周一闭馆，所以“恐怕不开”：I'm afraid not." },
    { type: 'choice', q: "—Shall we go by bus or by subway?<br>—___ Either is OK for me.", options: ["It's up to you.", "Thanks a lot.", "I'm afraid so."], answer: 0,
      explain: "两个都行，让对方决定：It's up to you." },
    { type: 'choice', q: "—Is it better to live in a big city or a small town?<br>—It ___. Both have good and bad sides.", options: ['depends', 'matters', 'helps'], answer: 0,
      explain: "It depends. 看情况。" }
  ],
  tests: [
    { type: 'choice', q: "—___ do you think of the film?<br>—It's really exciting.", options: ['What', 'How', 'Which'], answer: 0,
      explain: '固定搭配 What do you think of ...?' },
    { type: 'choice', q: "—How do you like Fuzhou?<br>—___", options: ["It's a beautiful city.", 'By train.', "I'm from Fuzhou."], answer: 0,
      explain: 'How do you like ...? 问看法，回答对福州的评价。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'I think English is very useful.', options: ['I agree with you.', "You're welcome.", 'Here you are.'], answer: 0,
      explain: '对方表达观点，同意就说 I agree with you.' },
    { type: 'fill', q: "—Shall we eat out or cook at home tonight?<br>—It's up ___ you.（填一个词）", answer: ['to'],
      explain: 'It\'s up to you. 由你决定。' },
    { type: 'fill', q: "—I don't like rainy days.<br>—Me n___. They make me feel sad.", answer: ['neither'],
      explain: '对方说“不喜欢”，表示“我也不”用 Me neither.' },
    { type: 'choice', q: "—Will it be sunny tomorrow? I want to go hiking.<br>—___ The radio says it will rain.", options: ["I'm afraid not.", 'I hope so.', 'I think so.'], answer: 0,
      explain: '广播说会下雨，所以“恐怕不会晴”：I\'m afraid not.' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Do you think we should have a sports meeting next week?', options: ['Yes, I think so.', 'Yes, I think.', "No, I don't think."], answer: 0,
      explain: '简略回答要说 I think so.，so 不能省。' },
    { type: 'fill', q: "—W___ do you think of Xiamen?<br>—It's a beautiful city.", answer: ['what'],
      explain: "What do you think of ...? 你觉得……怎么样？" },
    { type: 'choice', q: "How do you like the film? = ___ do you think of the film?", options: ['What', 'How', 'Which'], answer: 0,
      explain: "How do you like ...? = What do you think of ...?" },
    { type: 'fill', q: "—H___ do you like your new bike?<br>—I like it very much.", answer: ['how'],
      explain: "How do you like ...? 你觉得……怎么样？" },
    { type: 'choice', q: "—How do you feel ___ the school trip?<br>—I think it's great.", options: ['about', 'of', 'at'], answer: 0,
      explain: "How do you feel about ...? 用 about。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "How do you feel about the new school uniform?", options: ["I think it's nice.", "I feel tired.", "It's 100 yuan."], answer: 0,
      explain: "问对校服的看法，回答评价：I think it's nice." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "What do you think of the soccer game?", options: ["It was exciting.", "I played soccer.", "At three o'clock."], answer: 0,
      explain: "问看法，回答评价：It was exciting." },
    { type: 'fill', q: "—How do you like the song?<br>—I l___ it very much.", answer: ['like', 'love'],
      explain: "回答看法：I like / love it very much." },
    { type: 'fill', q: "—I think we should plant more trees.<br>—You're r___. Trees make the air clean.", answer: ['right'],
      explain: "You're right. 你说得对，表示同意。" },
    { type: 'fill', q: "—Will Jim win the race?<br>—I think s___. He runs fastest.", answer: ['so'],
      explain: "I think so. 我认为会的。" },
    { type: 'choice', q: "—Is this answer right?<br>—I don't think ___. Let's check it again.", options: ['so', 'it', 'that'], answer: 0,
      explain: "I don't think so. 我认为不对。so 不能丢。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I don't like cold weather.", options: ["Me neither.", "Me too.", "Yes, I do."], answer: 0,
      explain: "对方说“不喜欢”，我也不喜欢用 Me neither.；Me too 用在肯定句后。" },
    { type: 'choice', q: "—I love sports.<br>—___ Let's play basketball together.", options: ["Me too.", "Me neither.", "I don't think so."], answer: 0,
      explain: "我也喜欢运动：Me too." },
    { type: 'choice', q: "—Do you think the test will be easy?<br>—I'm not ___. Let's wait and see.", options: ['sure', 'agree', 'think'], answer: 0,
      explain: "I'm not sure. 我不确定。" },
    { type: 'fill', q: "—I think homework is useless.<br>—I don't a___. It helps us learn.", answer: ['agree'],
      explain: "I don't agree. 我不同意。" },
    { type: 'choice', q: "—Will it rain on our sports day?<br>—I hope ___.", options: ['not', 'no', "don't"], answer: 0,
      explain: "希望坏事不发生：I hope not." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Do you think you'll pass the exam?", options: ["I hope so.", "I hope not.", "Yes, I hope."], answer: 0,
      explain: "通过考试是好事，希望如此：I hope so." },
    { type: 'fill', q: "—Is the bus late again?<br>—I'm a___ so. We'll have to wait.", answer: ['afraid'],
      explain: "I'm afraid so. 恐怕是这样（不好的事）。" },
    { type: 'choice', q: "—Can you come to my party tonight?<br>—I'm afraid ___. I have to visit my aunt.", options: ['not', 'so', 'no'], answer: 0,
      explain: "要去看阿姨，来不了：I'm afraid not." },
    { type: 'choice', q: "—Shall we have Chinese food or Western food?<br>—___ I like both.", options: ["It's up to you.", "I don't agree.", "Me neither."], answer: 0,
      explain: "两样都喜欢，让对方决定：It's up to you." },
    { type: 'fill', q: "—Do you like summer or winter better?<br>—It d___. I like swimming in summer and skating in winter.", answer: ['depends'],
      explain: "It depends. 看情况。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Which is better, walking or taking a bus?", options: ["It depends. How far is it?", "Yes, it's better.", "You're welcome."], answer: 0,
      explain: "要看路程远近才能决定：It depends." }
  ]
},

/* ================= 祝愿、祝贺与节日问候 ================= */
{
  id: 't-wishes', title: '祝愿、祝贺与节日问候', short: '祝愿与祝贺', module: 'talk', grade: 7, freq: 3,
  prereqs: ['t-thanks-sorry'],
  tip: '高频陷阱：Have a good time 答 Thanks, I will；Happy New Year 答 The same to you；Happy birthday 只答 Thank you。',
  learn: [
    { h: '祝愿与回答', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Have a good time! / Enjoy yourself!</td><td>玩得开心！</td><td><b>Thanks, I will.</b></td></tr>
      <tr><td>Have a nice trip! / Have a good journey!</td><td>旅途愉快！</td><td>Thank you.</td></tr>
      <tr><td>Good luck (with your exam)!</td><td>（考试）好运！</td><td>Thank you.</td></tr>
      <tr><td>Best wishes to you!</td><td>祝你一切顺利！</td><td>Thank you.</td></tr></table>
      <p class="ex">—Have a good time at the party! —Thanks, I will.<span class="zh">——聚会玩得开心！——谢谢，我会的。</span></p>` },
    { h: '节日问候', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Happy New Year!</td><td>新年快乐！</td><td><b>The same to you.</b> / Happy New Year!</td></tr>
      <tr><td>Merry Christmas!</td><td>圣诞快乐！</td><td>The same to you. / Merry Christmas!</td></tr>
      <tr><td>Happy Spring Festival!</td><td>春节快乐！</td><td>The same to you.</td></tr>
      <tr><td>Happy birthday!</td><td>生日快乐！</td><td><b>Thank you.</b></td></tr></table>
      <p class="warn">生日是对方一个人的，不能回答 The same to you.；节日是大家共同的，才能说 The same to you.（你也一样）。</p>` },
    { h: '祝贺与表扬', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>怎么回答</th></tr>
      <tr><td>Congratulations (on winning)!</td><td>祝贺你（获胜）！</td><td>Thank you.</td></tr>
      <tr><td>Well done! / Good job!</td><td>干得好！</td><td>Thanks.</td></tr></table>
      <p class="ex">—I won first prize in the singing competition. —Congratulations!<span class="zh">——我在歌唱比赛中得了一等奖。——祝贺你！</span></p>
      <p class="warn">Congratulations 一定带 <b>s</b>；后面用 on：Congratulations on your success!</p>` }
  ],
  examples: [
    { type: 'choice', q: "—Have a good weekend!<br>—___", options: ['Thanks, I will.', 'Yes, I have.', "You're welcome."], answer: 0,
      explain: '回答 Have a good ... 的祝愿用 Thanks, I will.' },
    { type: 'choice', q: "—Merry Christmas, Bob!<br>—___", options: ['The same to you.', "That's right.", 'Congratulations!'], answer: 0,
      explain: '节日问候可以回答 The same to you.（你也一样）。' },
    { type: 'choice', q: "—I'm leaving for Hangzhou tomorrow.<br>—___", options: ["Have a good journey!", "Good idea!", "Congratulations!"], answer: 0,
      explain: "别人要出远门，祝他旅途愉快：Have a good journey! / Have a nice trip!" },
    { type: 'choice', q: "—Good luck with your exam!<br>—___", options: ["Thank you.", "You're welcome.", "Congratulations!"], answer: 0,
      explain: "别人祝你好运，回答 Thank you." },
    { type: 'choice', q: "—Best wishes to you!<br>—___", options: ["Thank you.", "You're welcome.", "Never mind."], answer: 0,
      explain: "收到祝福，回答 Thank you." },
    { type: 'choice', q: "—Happy New Year, Mr. Wang!<br>—___", options: ["Happy New Year!", "Thank you. I will.", "Congratulations!"], answer: 0,
      explain: "节日问候可以原样回答 Happy New Year!，也可以说 The same to you." },
    { type: 'fill', q: "—Happy Spring Festival!<br>—The s___ to you.", answer: ['same'],
      explain: "春节是大家共同的节日，回答 The same to you.（你也一样）。" },
    { type: 'choice', q: "—Happy birthday, Jack! This is a gift for you.<br>—___", options: ["Thank you very much.", "The same to you.", "Happy birthday to you, too."], answer: 0,
      explain: "生日只属于 Jack 一个人，只能回答 Thank you.，不能说 The same to you." },
    { type: 'choice', q: "—I passed the test!<br>—Congratulations ___ passing the test!", options: ['on', 'to', 'at'], answer: 0,
      explain: "Congratulations on ...! 祝贺你……，后面用 on，congratulations 带 s。" },
    { type: 'choice', q: "—I finished the job all by myself.<br>—___ You're great!", options: ["Well done!", "What a pity!", "Never mind."], answer: 0,
      explain: "别人做得好，表扬：Well done! / Good job!" }
  ],
  tests: [
    { type: 'choice', q: "—Happy New Year!<br>—___", options: ['The same to you.', 'Thanks, I will.', "You're welcome."], answer: 0,
      explain: '节日问候回答 The same to you.' },
    { type: 'choice', q: "—Happy birthday to you, Lucy!<br>—___", options: ['Thank you.', 'The same to you.', 'Happy birthday, too.'], answer: 0,
      explain: '生日只是 Lucy 一个人的，回答 Thank you.，不能说 The same to you.' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Have a good time at the party!', options: ['Thanks, I will.', 'Yes, I have.', "You're welcome."], answer: 0,
      explain: '回答 Have a good time! 用 Thanks, I will.' },
    { type: 'fill', q: "—I won first prize in the speech competition.<br>—C___!", answer: ['congratulations', 'congrats'],
      explain: '祝贺别人用 Congratulations!（一定带 s）' },
    { type: 'fill', q: "—I'm going to take the exam tomorrow.<br>—Good ___!（运气）", answer: ['luck'],
      explain: 'Good luck! 祝你好运！' },
    { type: 'choice', q: "—I'm going to Beijing for a holiday tomorrow.<br>—___", options: ['Have a nice trip!', 'Congratulations!', 'The same to you.'], answer: 0,
      explain: '别人要去旅行，祝他旅途愉快：Have a nice trip!' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'Merry Christmas!', options: ['Merry Christmas!', 'Thank you. I will.', 'Congratulations!'], answer: 0,
      explain: '节日问候可以原样回答 Merry Christmas! 或 The same to you.' },
    { type: 'fill', q: "—Enjoy yourself at the party!<br>—Thanks, I w___.", answer: ['will'],
      explain: "回答 Enjoy yourself! / Have a good time! 用 Thanks, I will." },
    { type: 'choice', q: "—Have fun at the beach!<br>—___", options: ["Thanks, I will.", "Yes, I have.", "Here you are."], answer: 0,
      explain: "Have fun! 和 Have a good time! 一样，回答 Thanks, I will." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Have a nice trip!", options: ["Thank you.", "Congratulations!", "Yes, I have."], answer: 0,
      explain: "别人祝你旅途愉快，回答 Thank you." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Good luck with your exam!", options: ["Thank you.", "Congratulations!", "Never mind."], answer: 0,
      explain: "别人祝你好运，回答 Thank you." },
    { type: 'fill', q: "B___ wishes to you and your family!", answer: ['best'],
      explain: "Best wishes to you! 祝你一切顺利！" },
    { type: 'choice', q: "在贺卡上写“祝你一切顺利”，可以写：", options: ["Best wishes to you!", "Good job!", "Congratulations!"], answer: 0,
      explain: "Best wishes 是祝愿；Good job 是表扬；Congratulations 是祝贺已经取得的成功。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Happy Mid-Autumn Festival!", options: ["The same to you.", "Thank you. I will.", "Well done!"], answer: 0,
      explain: "中秋节是大家共同的节日，回答 The same to you." },
    { type: 'fill', q: "—Happy New Year!<br>—H___ New Year!", answer: ['happy'],
      explain: "节日问候可以原样回答。" },
    { type: 'fill', q: "—M___ Christmas!<br>—The same to you.", answer: ['merry'],
      explain: "Merry Christmas! 圣诞快乐！" },
    { type: 'choice', q: "—Happy Spring Festival, Grandpa!<br>—___", options: ["The same to you.", "Thanks, I will.", "Good luck."], answer: 0,
      explain: "节日问候回答 The same to you." },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Happy Spring Festival!", options: ["Happy Spring Festival!", "Happy birthday!", "Congratulations!"], answer: 0,
      explain: "节日问候可以原样回答。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "Happy birthday, Lily! Here's a card for you.", options: ["Thank you. What a beautiful card!", "The same to you.", "Thanks, I will."], answer: 0,
      explain: "生日是 Lily 一个人的，收到祝福和礼物只答 Thank you.，不能说 The same to you.；Thanks, I will 回答 Have a good time 一类的祝愿。" },
    { type: 'fill', q: "—Happy birthday, Mike!<br>—T___ you.", answer: ['thank'],
      explain: "回答生日祝福：Thank you." },
    { type: 'choice', q: "Congratulations ___ winning the game!", options: ['on', 'in', 'at'], answer: 0,
      explain: "Congratulations on ...! 用 on。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I got first place in the long jump.", options: ["Congratulations!", "What a pity!", "The same to you."], answer: 0,
      explain: "别人取得好成绩，祝贺：Congratulations!" },
    { type: 'fill', q: "—I got full marks in maths!<br>—Good j___!", answer: ['job'],
      explain: "Good job! 干得好！" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I cleaned the whole house by myself.", options: ["Well done!", "Never mind.", "The same to you."], answer: 0,
      explain: "别人做得好，表扬：Well done!" }
  ]
},

/* ================= 表达情感与安慰鼓励 ================= */
{
  id: 't-feelings', title: '表达情感与安慰鼓励', short: '情感回应', module: 'talk', grade: 8, freq: 3,
  prereqs: ['t-wishes', 'g-exclamation'],
  tip: '情景交际常考“听到坏消息 / 好消息怎么接”：坏事说 I\'m sorry to hear that / What a pity，好事说 Sounds great / Well done。',
  learn: [
    { h: '听到坏消息：表示同情', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>用在</th></tr>
      <tr><td>I'm sorry to hear that.</td><td>听到这事我很难过。</td><td>别人生病、遇到不幸</td></tr>
      <tr><td>That's too bad.</td><td>太糟了。</td><td>遇到倒霉事</td></tr>
      <tr><td>What a pity! / What a shame!</td><td>真遗憾！真可惜！</td><td>错过机会、计划泡汤</td></tr></table>
      <p class="ex">—I missed the school trip because I was ill. —What a pity!<span class="zh">——我生病了，错过了学校旅行。——真可惜！</span></p>` },
    { h: '安慰和鼓励', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th></tr>
      <tr><td>Don't worry.</td><td>别担心。</td></tr>
      <tr><td>Take it easy.</td><td>放轻松，别紧张。</td></tr>
      <tr><td>Cheer up!</td><td>振作起来！</td></tr>
      <tr><td>Come on! You can do it!</td><td>加油！你能行！</td></tr>
      <tr><td>Never give up!</td><td>永不放弃！</td></tr>
      <tr><td>Everything will be OK.</td><td>一切都会好的。</td></tr></table>
      <p class="ex">—I'm so nervous about the exam. —Take it easy. You've worked hard.<span class="zh">——我对考试很紧张。——放轻松，你已经很努力了。</span></p>` },
    { h: '听到好消息：表示高兴和赞美', html: `<table class="tbl">
      <tr><th>说法</th><th>意思</th><th>用在</th></tr>
      <tr><td>Sounds great! / That's great!</td><td>听起来很棒！</td><td>好计划、好主意</td></tr>
      <tr><td>Well done! / Good job!</td><td>干得好！</td><td>别人取得好成绩</td></tr>
      <tr><td>How nice! / How wonderful!</td><td>多好啊！</td><td>好消息</td></tr>
      <tr><td>Really? / Is that true?</td><td>真的吗？</td><td>惊讶</td></tr></table>
      <p class="ex">—We're going to Wuyi Mountain this weekend. —Sounds great!<span class="zh">——我们这周末去武夷山。——听起来太棒了！</span></p>` },
    { h: '易错点', html: `<ul>
      <li>听到坏消息不能说 That's all right.（那是回答道歉的）。</li>
      <li>What a pity! 是“真可惜”，用于坏事；不要和 Sounds great! 弄反。</li>
      <li>Take it easy 是“别紧张”，不是“拿得轻松”。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: "—I lost my new bike yesterday.<br>—___", options: ["That's too bad.", 'Sounds great!', 'Well done!'], answer: 0,
      explain: '丢了自行车是坏消息，表示同情：That\'s too bad.' },
    { type: 'choice', q: "—I'm worried about my English test.<br>—___ You've prepared well.", options: ["Don't worry.", 'What a pity!', 'Have a good time.'], answer: 0,
      explain: '对方担心，安慰他“别担心”。' },
    { type: 'choice', q: "—My dog is ill.<br>—___ I hope it gets better soon.", options: ["I'm sorry to hear that.", "That's all right.", "Sounds great!"], answer: 0,
      explain: "听到坏消息表示同情：I'm sorry to hear that.；That's all right 是回答道歉的，不能用来回应坏消息。" },
    { type: 'choice', q: "—It rained, so we couldn't have our picnic.<br>—What a ___!", options: ['pity', 'great', 'nice'], answer: 0,
      explain: "计划泡汤，真可惜：What a pity!（也可以说 What a shame!）" },
    { type: 'choice', q: "—I'm going to sing in front of the whole school. I'm so nervous.<br>—___ You'll be great.", options: ["Take it easy.", "What a pity!", "Good idea."], answer: 0,
      explain: "对方紧张，让他放轻松：Take it easy.（不是“拿得轻松”）。" },
    { type: 'choice', q: "—I lost the game again. I feel so sad.<br>—___ You can win next time.", options: ["Cheer up!", "Sounds great!", "Congratulations!"], answer: 0,
      explain: "对方难过，鼓励他振作：Cheer up!" },
    { type: 'choice', q: "（运动会上，同学在跑最后一圈）___ You can do it!", options: ["Come on!", "Take care!", "Never mind!"], answer: 0,
      explain: "给人加油：Come on! You can do it!" },
    { type: 'choice', q: "—This maths problem is too hard. I want to stop.<br>—Never give ___! Try again.", options: ['up', 'in', 'out'], answer: 0,
      explain: "Never give up! 永不放弃！" },
    { type: 'fill', q: "Don't worry. Everything will be O___.", answer: ['ok', 'okay'],
      explain: "Everything will be OK. 一切都会好的。" },
    { type: 'choice', q: "—Let's have a party for Mum's birthday.<br>—___", options: ["That's great!", "What a pity!", "Take it easy."], answer: 0,
      explain: "好主意、好计划，回答 That's great! / Sounds great!" },
    { type: 'choice', q: "—Mum, I cleaned my room by myself.<br>—Good ___!", options: ['job', 'luck', 'night'], answer: 0,
      explain: "表扬别人做得好：Good job! / Well done!" },
    { type: 'choice', q: "—My uncle will take me to Beijing this summer.<br>—How ___!", options: ['wonderful', 'pity', 'bad'], answer: 0,
      explain: "听到好消息说 How wonderful! / How nice!" },
    { type: 'choice', q: "—Our teacher is going to give us a day off tomorrow!<br>—___ I can't believe it!", options: ["Really?", "Never mind.", "Take care."], answer: 0,
      explain: "表示惊讶：Really? / Is that true?" }
  ],
  tests: [
    { type: 'choice', q: "—I failed the maths exam.<br>—___ Work harder and you'll do better next time.", options: ["Don't worry.", 'Well done!', 'Have a good time.'], answer: 0,
      explain: '对方没考好，先安慰“别担心”，再鼓励他。' },
    { type: 'choice', q: "—My grandma is ill in hospital.<br>—___", options: ["I'm sorry to hear that.", "That's all right.", 'Congratulations!'], answer: 0,
      explain: '听到别人家人生病，表示同情：I\'m sorry to hear that.' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: 'I missed the last bus.', options: ['What a pity!', 'Sounds great!', 'Good idea!'], answer: 0,
      explain: '错过末班车是遗憾的事，说 What a pity!' },
    { type: 'fill', q: "—I'm so nervous about the speech.<br>—Take it e___. You'll do well.", answer: ['easy'],
      explain: 'Take it easy. 放轻松，别紧张。' },
    { type: 'fill', q: "—I got an A in the English exam!<br>—W___ done!", answer: ['well'],
      explain: 'Well done! 干得好！' },
    { type: 'choice', q: "—We'll have a trip to Wuyi Mountain next week.<br>—___", options: ['Sounds great!', 'What a pity!', 'Take it easy.'], answer: 0,
      explain: '去旅行是好消息，回答 Sounds great!' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I can't find my favourite book.", options: ["That's too bad. Let me help you look for it.", "That's a good idea.", "You're welcome."], answer: 0,
      explain: '对方遇到麻烦，先表示同情，再主动帮忙。' },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "My grandpa broke his leg.", options: ["I'm sorry to hear that.", "That's all right.", "Well done!"], answer: 0,
      explain: "听到坏消息表示同情；That's all right 是回答道歉的。" },
    { type: 'fill', q: "—I have a bad cold.<br>—I'm s___ to hear that.", answer: ['sorry'],
      explain: "I'm sorry to hear that. 听到这事我很难过。" },
    { type: 'fill', q: "—I lost my wallet on the bus.<br>—That's too b___.", answer: ['bad'],
      explain: "That's too bad. 太糟了。" },
    { type: 'fill', q: "—I can't go to the concert. I have to stay at home.<br>—What a p___!", answer: ['pity'],
      explain: "What a pity! 真可惜！" },
    { type: 'choice', q: "—The football match was cancelled because of the rain.<br>—___", options: ["What a shame!", "How wonderful!", "Good job!"], answer: 0,
      explain: "比赛取消了，真可惜：What a shame!" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I'm worried about my sick cat.", options: ["Don't worry. It will be fine.", "Sounds great!", "Good job!"], answer: 0,
      explain: "对方担心，安慰他：Don't worry." },
    { type: 'choice', q: "“Take it easy.” 的意思是：", options: ['放轻松，别紧张', '拿得轻松一点', '慢慢拿走'], answer: 0,
      explain: "Take it easy. 是“放轻松，别紧张”，不能按字面理解。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I'm so nervous. The exam starts in ten minutes.", options: ["Take it easy. You'll do well.", "Sounds great!", "What a pity!"], answer: 0,
      explain: "对方紧张，让他放轻松：Take it easy." },
    { type: 'fill', q: "—I didn't make the school team.<br>—C___ up! You can try again next year.", answer: ['cheer'],
      explain: "Cheer up! 振作起来！" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I feel so sad. I lost the game.", options: ["Cheer up! You played well.", "Congratulations!", "Sounds great!"], answer: 0,
      explain: "对方输了比赛很难过，鼓励他：Cheer up!" },
    { type: 'fill', q: "—I can't run any more!<br>—Come o___! You can do it!", answer: ['on'],
      explain: "Come on! 加油！" },
    { type: 'choice', q: "朋友在跳绳比赛中快要坚持不住了，你应该喊：", options: ["Come on! You can do it!", "Take care!", "What a pity!"], answer: 0,
      explain: "给人加油：Come on! You can do it!" },
    { type: 'fill', q: "Never give u___! Keep trying and you'll succeed.", answer: ['up'],
      explain: "Never give up! 永不放弃！" },
    { type: 'choice', q: "—I failed again. Maybe I should stop learning to swim.<br>—___ Practice makes perfect.", options: ["Never give up!", "Good idea!", "Sounds great!"], answer: 0,
      explain: "对方想放弃，鼓励他：Never give up!" },
    { type: 'choice', q: "—My mum is in hospital. I'm so worried.<br>—Don't worry. ___", options: ["Everything will be OK.", "Well done.", "Sounds great."], answer: 0,
      explain: "安慰对方：Everything will be OK." },
    { type: 'fill', q: "—I'm afraid I can't finish my project in time.<br>—Take it easy. E___ will be fine.", answer: ['everything'],
      explain: "Everything will be fine / OK. 一切都会好的。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "We're going to have a picnic this Sunday.", options: ["Sounds great!", "What a pity!", "I'm sorry to hear that."], answer: 0,
      explain: "好计划，回答 Sounds great!；What a pity 用于坏事。" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I won first prize in the drawing competition!", options: ["Well done!", "That's too bad.", "Never mind."], answer: 0,
      explain: "别人取得好成绩：Well done!" },
    { type: 'fill', q: "—We're going to Gulangyu this weekend.<br>—How w___!", answer: ['wonderful'],
      explain: "How wonderful! 多好啊！" },
    { type: 'choice', q: "—My aunt gave me a new bike for my birthday.<br>—How ___!", options: ['nice', 'pity', 'bad'], answer: 0,
      explain: "好消息：How nice!" },
    { type: 'choice', q: '听一听，选出恰当的答语。', say: "I saw a famous singer in the street today!", options: ["Really? Who was it?", "Never mind.", "Take care."], answer: 0,
      explain: "表示惊讶：Really?" },
    { type: 'fill', q: "—Our school will have a five-day holiday!<br>—R___? That's great!", answer: ['really'],
      explain: "Really? 真的吗？" }
  ]
}

);
