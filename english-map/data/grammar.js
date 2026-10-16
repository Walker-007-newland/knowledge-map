// 语法主干（第 1 阶段样板）
KG.nodes.push(

/* ================= 四年级 ================= */
{
  id: 'g-be', title: 'be 动词 am / is / are', short: 'be动词', module: 'morph', grade: 4, freq: 2,
  prereqs: [],
  tip: '中考不会单独考 be 动词，但主谓一致是所有填空和写作的基础，写作中一错就扣分。',
  learn: [
    { h: '口诀', html: `<div class="rhyme">我（I）用 am，你（you）用 are，<br>is 跟着他（he）、她（she）、它（it）；<br>单数名词用 is，复数名词全用 are。</div>` },
    { h: '三种句子', html: `
      <p><b>肯定句</b>：主语 + be + 其他</p>
      <p class="ex">I am a student.<span class="zh">我是一名学生。</span></p>
      <p><b>否定句</b>：be 后面加 not</p>
      <p class="ex">She is not at home.<span class="zh">她不在家。</span></p>
      <p><b>一般疑问句</b>：把 be 提到句首</p>
      <p class="ex">Are you ready? — Yes, I am. / No, I'm not.<span class="zh">你准备好了吗？——是的。/ 不。</span></p>` },
    { h: '缩写', html: `<p>I'm, you're, he's, she's, it's, we're, they're, isn't, aren't</p>
      <p class="warn">am not 不能缩写成 amn't；肯定的简短回答不能缩写：Yes, it is.（不能写 Yes, it's.）</p>` },
    { h: '易错点', html: `<ul>
      <li>we / you（你们）/ they 都用 <b>are</b>。</li>
      <li>两个人做主语是复数：<span class="en">Tom and I <b>are</b> friends.</span></li>
      <li>this / that 用 is，these / those 用 are。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'My sister ___ a nurse.', options: ['am', 'is', 'are'], answer: 1,
      explain: 'my sister 是单数第三人称，用 is。' },
    { type: 'fill', q: 'Tom and I ___ good friends.（填 be 动词）', answer: ['are'],
      explain: 'Tom and I 是两个人，复数，用 are。' },
    { type: 'choice', q: '—Is this your book?<br>—Yes, ___.', options: ['it is', "it's", 'this is'], answer: 0,
      explain: '用 this 提问，回答用 it 代替；肯定简短回答不能缩写，所以是 Yes, it is.' },
    { type: 'choice', q: 'I ___ in Grade 4.', options: ['am', 'is', 'are'], answer: 0,
      explain: '口诀“我（I）用 am”：主语是 I，be 动词只能用 am。' },
    { type: 'fill', q: 'We ___ in the same class.（填 be 动词）', answer: ['are'],
      explain: 'we（我们）、you（你/你们）、they（他们）都用 are。' },
    { type: 'fill', q: 'The books ___ on the desk.（填 be 动词）', answer: ['are'],
      explain: 'books 是复数名词，复数名词全用 are；如果是 The book 就用 is。' },
    { type: 'fill', q: '改为否定句：He is a farmer.<br>→ He ___ a farmer.（填一个词或两个词）', answer: ["isn't", 'is not'],
      explain: '否定句在 be 动词后面加 not：is not，可缩写为 isn\'t。' },
    { type: 'fill', q: '改为一般疑问句：They are at school.<br>→ ___ they at school?（首字母大写）', answer: ['Are'],
      explain: '一般疑问句把 be 动词提到句首，句首字母大写：Are they at school?' },
    { type: 'choice', q: '下面哪句是正确的？', options: ["I'm not hungry.", "I amn't hungry.", "I'mn't hungry."], answer: 0,
      explain: 'am not 没有缩写形式，只能把 I am 缩写成 I\'m，再加 not：I\'m not。' },
    { type: 'choice', q: 'These ___ my pencils.', options: ['is', 'am', 'are'], answer: 2,
      explain: 'this / that 用 is，these / those 用 are。these 表示“这些”，是复数。' },
    { type: 'fill', q: '写出 she is 的缩写形式：___', answer: ["she's", "She's"],
      explain: '缩写时用撇号（\'）代替省掉的字母：she is → she\'s；同理 he\'s, it\'s, we\'re, you\'re, isn\'t, aren\'t。' }
  ],
  tests: [
    { type: 'choice', q: 'I ___ eleven years old.', options: ['am', 'is', 'are'], answer: 0, explain: 'I 后面用 am。' },
    { type: 'choice', q: 'These apples ___ red.', options: ['is', 'am', 'are'], answer: 2, explain: 'these apples 是复数，用 are。' },
    { type: 'fill', q: '—___ your parents at home?<br>—Yes, they are.（填 be 动词，注意首字母大写）', answer: ['Are'], explain: 'your parents 是复数，一般疑问句把 are 提前。' },
    { type: 'choice', q: '—Is your brother a doctor?<br>—No, he ___.', options: ['is', "isn't", "aren't"], answer: 1, explain: '否定回答：No, he isn\'t.' },
    { type: 'fill', q: 'The cat ___ under the chair.（填 be 动词）', answer: ['is'], explain: 'the cat 是单数，用 is。' },
    { type: 'choice', q: 'we are 的正确缩写是哪个？', options: ["we're", "w'are", "we'r"], answer: 0, explain: 'we are 缩写为 we\'re，撇号代替 are 中的 a。' },
    { type: 'choice', q: 'My friend and I ___ in Class 3.', options: ['am', 'is', 'are'], answer: 2, explain: '“我的朋友和我”是两个人，用 are。' },
    { type: 'choice', q: 'You ___ my best friend.', options: ['am', 'is', 'are'], answer: 2, explain: 'you 不论指“你”还是“你们”，都用 are。' },
    { type: 'fill', q: 'They ___ in the library now.（填 be 动词）', answer: ['are'], explain: 'they 用 are。' },
    { type: 'choice', q: '听一听，句子里用的是哪个 be 动词？', say: 'We are good students.', options: ['am', 'is', 'are'], answer: 2, explain: '听到的是 We are good students. 主语 we 用 are。' },
    { type: 'choice', q: 'Miss Lin ___ our English teacher.', options: ['am', 'is', 'are'], answer: 1, explain: 'Miss Lin 是一个人，单数第三人称，用 is。' },
    { type: 'fill', q: 'Look at my dog. It ___ very cute.（填 be 动词）', answer: ['is'], explain: 'it 用 is。' },
    { type: 'fill', q: '改为否定句：They are in the park.<br>→ They ___ in the park.（填一个词或两个词）', answer: ["aren't", 'are not'], explain: '否定句在 are 后加 not：are not，缩写为 aren\'t。' },
    { type: 'choice', q: '下面哪个否定句是正确的？', options: ['She not is at home.', "She isn't at home.", 'She is no at home.'], answer: 1, explain: '否定句 not 放在 be 动词后面：She is not / isn\'t at home。' },
    { type: 'fill', q: '写出 they are 的缩写形式：___', answer: ["they're", "They're"], explain: 'they are 缩写为 they\'re，撇号代替 a。' },
    { type: 'choice', q: '“isn\'t” 是哪两个词的缩写？', options: ['is not', 'it is', 'is it'], answer: 0, explain: 'isn\'t = is not；it is 的缩写是 it\'s。' },
    { type: 'choice', q: '—Are you a teacher?<br>—No, ___.', options: ["I'm not", "I amn't", "I aren't"], answer: 0, explain: 'am not 不能缩写，否定回答是 No, I\'m not.' },
    { type: 'fill', q: '把 I am not ready. 缩写：___ not ready.（填一个缩写词）', answer: ["I'm"], explain: 'am not 不能缩写成 amn\'t，只能把 I am 缩写成 I\'m。' },
    { type: 'choice', q: '—Are you Amy?<br>—Yes, ___.', options: ['I am', "I'm", 'you are'], answer: 0, explain: '问 you，答 I；肯定简短回答不能缩写，所以是 Yes, I am.' },
    { type: 'fill', q: '—Is he your brother?<br>—Yes, ___ ___.（填两个词）', answer: ['he is'], explain: '肯定简短回答不能缩写成 he\'s，要写 Yes, he is.' },
    { type: 'choice', q: '—Are they your friends?<br>—Yes, ___.', options: ["they're", 'they are', 'we are'], answer: 1, explain: '问 they，答 they；肯定简短回答不能缩写：Yes, they are.' },
    { type: 'fill', q: 'Lily and Lucy ___ twins.（填 be 动词）', answer: ['are'], explain: 'Lily and Lucy 是两个人，复数，用 are。' },
    { type: 'choice', q: 'You and I ___ in the same team.', options: ['am', 'is', 'are'], answer: 2, explain: '虽然离 be 最近的是 I，但 You and I 是两个人，复数，用 are。' },
    { type: 'fill', q: 'This ___ my mother.（填 be 动词）', answer: ['is'], explain: 'this 用 is。' },
    { type: 'choice', q: 'Those ___ my shoes.', options: ['is', 'am', 'are'], answer: 2, explain: 'those（那些）是复数，用 are。' },
    { type: 'choice', q: '___ that your bike?', options: ['Is', 'Are', 'Am'], answer: 0, explain: 'that 用 is，一般疑问句把 is 提到句首。' }
  ]
},

{
  id: 'g-pronoun', title: '人称代词与物主代词', short: '人称代词', module: 'morph', grade: 4, freq: 3,
  prereqs: [],
  tip: '中考高频：主格/宾格/物主代词的选择，常在完形填空和短文填空里考。',
  learn: [
    { h: '一张表记住', html: `
      <table class="tbl"><tr><th>主格<br><small>做主语</small></th><th>宾格<br><small>动词/介词后</small></th><th>形容词性物主<br><small>后接名词</small></th><th>名词性物主<br><small>后不接名词</small></th></tr>
      <tr><td>I</td><td>me</td><td>my</td><td>mine</td></tr>
      <tr><td>you</td><td>you</td><td>your</td><td>yours</td></tr>
      <tr><td>he</td><td>him</td><td>his</td><td>his</td></tr>
      <tr><td>she</td><td>her</td><td>her</td><td>hers</td></tr>
      <tr><td>it</td><td>it</td><td>its</td><td>its</td></tr>
      <tr><td>we</td><td>us</td><td>our</td><td>ours</td></tr>
      <tr><td>they</td><td>them</td><td>their</td><td>theirs</td></tr></table>` },
    { h: '口诀', html: `<div class="rhyme">主格放句首，宾格跟在动词、介词后；<br>形物后面带名词，名物自己就是名词。</div>
      <p>名词性物主代词 = 形容词性物主代词 + 名词：mine = my pen</p>
      <p class="ex">This is not my pen. Mine is on the desk.<span class="zh">这不是我的笔。我的在桌子上。</span></p>` },
    { h: '易错点', html: `<ul>
      <li><b>its</b> 是“它的”，<b>it's</b> 是 it is。</li>
      <li>Let's = Let us，let 后面用宾格：Let <b>us</b> go.</li>
      <li>介词后用宾格：between you and <b>me</b>，with <b>him</b>。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'Please help ___.', options: ['I', 'me', 'my'], answer: 1, explain: 'help 是动词，后面用宾格 me。' },
    { type: 'choice', q: 'This is not my pen. ___ is on the desk.', options: ['My', 'Mine', 'Me'], answer: 1, explain: '后面没有名词，用名词性物主代词 Mine（= My pen）。' },
    { type: 'fill', q: 'This is my friend Tom. ___ is ten.（用 he 的适当形式）', answer: ['He'], explain: '空格在句首做主语，用主格 He；句首字母大写。' },
    { type: 'choice', q: 'The story is between you and ___.', options: ['I', 'me', 'my'], answer: 1, explain: 'between 是介词，介词后面用宾格 me。' },
    { type: 'choice', q: 'I like ___ new schoolbag.', options: ['I', 'me', 'my'], answer: 2, explain: '后面有名词 schoolbag，用形容词性物主代词 my。' },
    { type: 'choice', q: 'The bird is building ___ nest.', options: ["it's", 'its', 'it'], answer: 1, explain: '“它的窝”用 its；it\'s = it is，“它是窝”说不通。' },
    { type: 'fill', q: "Let's go! 里的 Let's = Let ___.（填一个词）", answer: ['us'], explain: 'Let\'s 是 Let us 的缩写，let 后面用宾格 us，不能写 Let we。' },
    { type: 'choice', q: 'they 的宾格、形容词性物主代词、名词性物主代词依次是：', options: ['them, their, theirs', 'their, them, theirs', 'them, theirs, their'], answer: 0, explain: '按表格记：they（主格）→ them（宾格）→ their（后接名词）→ theirs（后不接名词）。' }
  ],
  tests: [
    { type: 'choice', q: '___ am a student.', options: ['I', 'Me', 'My'], answer: 0, explain: '做主语用主格 I。' },
    { type: 'choice', q: 'Mr. Lin teaches ___ English.', options: ['we', 'us', 'our'], answer: 1, explain: 'teach 是动词，后面用宾格 us。' },
    { type: 'choice', q: 'This is Lucy. ___ mother is a teacher.', options: ['She', 'Her', 'Hers'], answer: 1, explain: '后面有名词 mother，用形容词性物主代词 Her。' },
    { type: 'fill', q: '—Whose bag is this?<br>—It\'s ___.（用 she 的适当形式）', answer: ['hers'], explain: '后面没有名词，用名词性物主代词 hers。' },
    { type: 'choice', q: 'The cat is playing with ___ ball.', options: ["it's", 'its', 'it'], answer: 1, explain: '“它的球”用 its；it\'s 是 it is。' },
    { type: 'fill', q: 'Let ___ go to the park.（用 we 的适当形式）', answer: ['us'], explain: 'let 是动词，后面用宾格 us。' },
    { type: 'choice', q: 'The red bike is mine and the blue one is ___.', options: ['your', 'yours', 'you'], answer: 1, explain: '后面没有名词，用 yours（= your bike）。' },
    { type: 'fill', q: 'Look at the girl in red. ___ is my sister.（用 she 的适当形式）', answer: ['She'], explain: '句首做主语，用主格 She。' },
    { type: 'choice', q: '—Where are Tom and Jim?<br>—___ are in the gym.', options: ['They', 'Them', 'Their'], answer: 0, explain: '做主语用主格 They。' },
    { type: 'choice', q: 'Where are my keys? I can\'t find ___.', options: ['they', 'them', 'their'], answer: 1, explain: 'find 是动词，后面用宾格 them。' },
    { type: 'choice', q: 'Please sit between Lucy and ___.', options: ['I', 'me', 'mine'], answer: 1, explain: 'between 是介词，后面用宾格 me。' },
    { type: 'fill', q: 'Please come with ___.（用 we 的适当形式）', answer: ['us'], explain: 'with 是介词，后面用宾格 us。' },
    { type: 'choice', q: 'Our teacher is very kind to ___.', options: ['they', 'them', 'their'], answer: 1, explain: 'to 是介词，后面用宾格 them。' },
    { type: 'choice', q: 'The students love ___ school.', options: ['they', 'them', 'their'], answer: 2, explain: '后面有名词 school，用形容词性物主代词 their。' },
    { type: 'choice', q: '听一听，选出你听到的词。', say: 'This is my friend. Her name is Kate.', options: ['she', 'her', 'hers'], answer: 1, explain: '听到的是 Her name is Kate.，name 前用形容词性物主代词 her。' },
    { type: 'choice', q: '—Is this your ruler?<br>—No. ___ is in my bag.', options: ['My', 'Mine', 'Me'], answer: 1, explain: '空格后没有名词，用名词性物主代词 Mine（= My ruler）。' },
    { type: 'fill', q: '—Whose shoes are these?<br>—They are ___.（用 they 的适当形式）', answer: ['theirs'], explain: '后面没有名词，用名词性物主代词 theirs。' },
    { type: 'fill', q: 'I have a cat. ___ name is Mimi.（用 it 的适当形式，首字母大写）', answer: ['Its'], explain: '“它的名字”用 Its，不能写 It\'s（= It is）。' },
    { type: 'choice', q: '___ a nice day today.', options: ['Its', "It's", 'It'], answer: 1, explain: '这里需要“它是”：It\'s = It is。' },
    { type: 'choice', q: 'Let ___ help you with your bag.', options: ['I', 'me', 'my'], answer: 1, explain: 'let 是动词，后面用宾格 me。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ["Let's go to the zoo.", 'Let we go to the zoo.', 'Let our go to the zoo.'], answer: 0, explain: 'let 后面用宾格：Let us = Let\'s。' }
  ]
},

{
  id: 'g-plural', title: '名词的单复数', short: '名词复数', module: 'morph', grade: 4, freq: 3,
  prereqs: [],
  tip: '中考高频：短文填空、书面表达里名词要不要加 s、怎么加，是最常见的失分点。',
  learn: [
    { h: '规则变化', html: `<table class="tbl">
      <tr><th>情况</th><th>变法</th><th>例子</th></tr>
      <tr><td>一般情况</td><td>+s</td><td>book → books</td></tr>
      <tr><td>以 s, x, ch, sh 结尾</td><td>+es</td><td>bus → buses, box → boxes, watch → watches</td></tr>
      <tr><td>辅音字母 + y</td><td>变 y 为 i，+es</td><td>baby → babies, city → cities</td></tr>
      <tr><td>元音字母 + y</td><td>+s</td><td>boy → boys, day → days</td></tr>
      <tr><td>以 f / fe 结尾</td><td>变 f/fe 为 v，+es</td><td>leaf → leaves, knife → knives</td></tr></table>` },
    { h: '以 o 结尾', html: `<div class="rhyme">英雄（hero）爱吃土豆（potato）和西红柿（tomato）——加 es；<br>其余大多加 s：photos, pianos, zoos, radios。</div>` },
    { h: '不规则变化', html: `<ul>
      <li>man → men, woman → women, child → children</li>
      <li>foot → feet, tooth → teeth, mouse → mice</li>
      <li>单复数同形：sheep, deer, Chinese, Japanese；fish 表示“几条鱼”时复数还是 fish</li>
      <li>国籍：Englishman → Englishmen，但 German → Germans</li></ul>` },
    { h: '不可数名词', html: `<p>water, milk, bread, rice, juice, information, advice, news, homework 等<b>不能加 s</b>，也不能直接用 a。</p>
      <p>要表达数量，用“量词 + of”，<b>变量词</b>：</p>
      <p class="ex">two glasses of water<span class="zh">两杯水</span></p>
      <p class="ex">three pieces of bread<span class="zh">三片面包</span></p>` }
  ],
  examples: [
    { type: 'fill', q: 'There are three ___ on the table.（box）', answer: ['boxes'], explain: 'box 以 x 结尾，加 es。' },
    { type: 'choice', q: 'I want two ___.', options: ['bread', 'breads', 'pieces of bread'], answer: 2, explain: 'bread 不可数，不能加 s，要用 pieces of bread。' },
    { type: 'fill', q: 'There are two ___ in my pencil box.（pen）', answer: ['pens'], explain: '一般情况直接加 s：pen → pens。' },
    { type: 'fill', q: 'Beijing and Shanghai are big ___.（city）', answer: ['cities'], explain: 'city 是“辅音字母 t + y”结尾，变 y 为 i 再加 es。' },
    { type: 'choice', q: 'There are seven ___ in a week.', options: ['days', 'daies', 'dayes'], answer: 0, explain: 'day 是“元音字母 a + y”结尾，直接加 s，不变 y。' },
    { type: 'fill', q: 'Be careful with those sharp ___.（knife）', answer: ['knives'], explain: 'knife 以 fe 结尾，变 fe 为 v 再加 es。' },
    { type: 'fill', q: 'My grandpa grows ___ in the garden.（potato）', answer: ['potatoes'], explain: '口诀“英雄爱吃土豆和西红柿”：potato 加 es。' },
    { type: 'choice', q: 'There are two ___ in my room.', options: ['radios', 'radioes', 'radio'], answer: 0, explain: '以 o 结尾的词，除了 hero、potato、tomato 等，大多直接加 s：radios。' },
    { type: 'fill', q: 'Those two ___ are nurses.（woman）', answer: ['women'], explain: 'woman 是不规则变化，复数是 women（man → men 同理）。' },
    { type: 'fill', q: 'I have two ___.（foot）', answer: ['feet'], explain: 'foot 的复数是不规则的 feet，不能加 s。' },
    { type: 'choice', q: 'There are many ___ on the hill.', options: ['sheep', 'sheeps', 'sheepes'], answer: 0, explain: 'sheep 单复数同形，复数还是 sheep。' },
    { type: 'fill', q: 'two ___（Englishman）', answer: ['Englishmen'], explain: 'Englishman 是 man 结尾的合成词，跟 man → men 一样变成 Englishmen。' },
    { type: 'choice', q: 'We have too much ___ today.', options: ['homeworks', 'homework', 'a homework'], answer: 1, explain: 'homework 不可数，不能加 s，也不能用 a。' }
  ],
  tests: [
    { type: 'fill', q: 'two ___（baby）', answer: ['babies'], explain: '辅音字母 + y，变 y 为 i 加 es。' },
    { type: 'fill', q: 'some ___（tomato）', answer: ['tomatoes'], explain: 'tomato 属于“英雄土豆西红柿”，加 es。' },
    { type: 'choice', q: 'The ___ are playing games in the park.', options: ['child', 'childs', 'children'], answer: 2, explain: 'child 的复数是不规则的 children。' },
    { type: 'choice', q: 'There are some ___ in the river.', options: ['fish', 'fishs', 'fishies'], answer: 0, explain: '表示“几条鱼”时，fish 单复数同形。' },
    { type: 'fill', q: 'In autumn, the ___ turn yellow.（leaf）', answer: ['leaves'], explain: 'leaf 以 f 结尾，变 f 为 v 加 es。' },
    { type: 'choice', q: 'Can I have some ___?', options: ['water', 'waters', 'a water'], answer: 0, explain: 'water 不可数，不能加 s，也不能用 a。' },
    { type: 'fill', q: 'two ___（German）', answer: ['Germans'], explain: 'German 不是 man 结尾的合成词，直接加 s。' },
    { type: 'fill', q: 'There are many ___ in the library.（book）', answer: ['books'], explain: '一般情况直接加 s。' },
    { type: 'fill', q: 'Three ___ are singing in the tree.（bird）', answer: ['birds'], explain: 'three 后面要用复数，bird 直接加 s。' },
    { type: 'fill', q: 'My mother bought two ___ for me.（watch）', answer: ['watches'], explain: 'watch 以 ch 结尾，加 es。' },
    { type: 'choice', q: 'There are two ___ at the bus stop.', options: ['bus', 'buses', 'buss'], answer: 1, explain: 'bus 以 s 结尾，加 es。' },
    { type: 'fill', q: 'Please help me wash all the ___.（dish）', answer: ['dishes'], explain: 'dish 以 sh 结尾，加 es。' },
    { type: 'fill', q: 'There are two ___ in our town.（library）', answer: ['libraries'], explain: 'library 是“辅音字母 r + y”结尾，变 y 为 i 加 es。' },
    { type: 'choice', q: 'The ___ are playing football.', options: ['boys', 'boies', 'boyes'], answer: 0, explain: 'boy 是“元音字母 o + y”结尾，直接加 s。' },
    { type: 'fill', q: "I can't find my ___. Where are they?（key）", answer: ['keys'], explain: 'key 是“元音字母 e + y”结尾，直接加 s，不能写 keies。' },
    { type: 'choice', q: 'Three ___ are running in the forest.', options: ['wolfs', 'wolves', 'wolfes'], answer: 1, explain: 'wolf 以 f 结尾，变 f 为 v 加 es。' },
    { type: 'fill', q: 'There are four ___ in the drawer.（knife）', answer: ['knives'], explain: 'knife 以 fe 结尾，变 fe 为 v 加 es。' },
    { type: 'choice', q: 'The firemen are real ___.', options: ['heros', 'heroes', 'heroies'], answer: 1, explain: '“英雄（hero）爱吃土豆和西红柿”：hero 加 es。' },
    { type: 'fill', q: 'We need some ___ to make soup.（potato）', answer: ['potatoes'], explain: 'potato 属于加 es 的那几个词。' },
    { type: 'fill', q: 'I took many ___ in Xiamen.（photo）', answer: ['photos'], explain: 'photo 不属于“英雄土豆西红柿”，直接加 s。' },
    { type: 'choice', q: 'There are two ___ in the music room.', options: ['pianoes', 'pianos', 'piano'], answer: 1, explain: 'piano 直接加 s：pianos。' },
    { type: 'fill', q: 'There are some big ___ in China.（zoo）', answer: ['zoos'], explain: 'zoo 以 o 结尾，但直接加 s。' },
    { type: 'choice', q: 'Two ___ are standing at the door.', options: ['mans', 'men', 'mens'], answer: 1, explain: 'man 的复数是不规则的 men，不能再加 s。' },
    { type: 'fill', q: 'There are three ___ in the office.（woman）', answer: ['women'], explain: 'woman → women，不规则变化。' },
    { type: 'fill', q: 'Brush your ___ twice a day.（tooth）', answer: ['teeth'], explain: 'tooth 的复数是 teeth。' },
    { type: 'choice', q: 'The cat caught three ___.', options: ['mouses', 'mice', 'mices'], answer: 1, explain: 'mouse 的复数是 mice。' },
    { type: 'fill', q: 'I saw two ___ in the zoo.（deer）', answer: ['deer'], explain: 'deer 单复数同形。' },
    { type: 'choice', q: 'Many ___ like dumplings.', options: ['Chinese', 'Chineses', 'Chinesees'], answer: 0, explain: 'Chinese（中国人）单复数同形，Japanese 也一样。' },
    { type: 'choice', q: 'Hans and Anna are ___. They come from Germany.', options: ['German', 'Germen', 'Germans'], answer: 2, explain: 'German 不是 man 合成的词，复数直接加 s，不能写 Germen。' },
    { type: 'fill', q: 'Five ___ are visiting our school.（Englishman）', answer: ['Englishmen'], explain: 'Englishman 和 man 一样变：Englishmen。' },
    { type: 'choice', q: 'Here is ___ for you.', options: ['a good news', 'some good news', 'some good newses'], answer: 1, explain: 'news 不可数（虽然以 s 结尾），不能用 a，也不能再加 es。' },
    { type: 'choice', q: 'Can you give me some ___?', options: ['advices', 'advice', 'an advice'], answer: 1, explain: 'advice 不可数，不能加 s，也不能用 an。' },
    { type: 'fill', q: 'two ___ of milk（glass）', answer: ['glasses'], explain: '表达数量要变量词：glass 以 s 结尾加 es，milk 不变。' },
    { type: 'choice', q: 'He drank three ___.', options: ['cups of tea', 'cup of teas', 'cups of teas'], answer: 0, explain: '量词变复数，不可数名词 tea 不变：cups of tea。' },
    { type: 'fill', q: 'four ___ of paper（piece）', answer: ['pieces'], explain: 'paper 不可数，变量词 piece 为 pieces。' }
  ]
},

{
  id: 'g-there-be', title: 'There be 句型', short: 'There be 句型', module: 'syntax', grade: 4, freq: 2,
  prereqs: ['g-be', 'g-plural'],
  tip: '注意“就近原则”和它与 have 的区别，写作描述地点、学校时很常用。',
  learn: [
    { h: '什么意思', html: `<p>There be 表示“<b>某地有某物</b>”：There is / are + 某物 + 地点</p>
      <p class="ex">There is a cat under the tree.<span class="zh">树下有一只猫。</span></p>
      <p class="ex">There are forty students in our class.<span class="zh">我们班有四十个学生。</span></p>
      <p class="ex">There is some milk in the glass.<span class="zh">杯子里有一些牛奶。（不可数名词用 is）</span></p>` },
    { h: '就近原则', html: `<p>be 动词跟<b>离它最近</b>的那个名词保持一致：</p>
      <p class="ex">There is a pen and two books on the desk.<span class="zh">离 is 最近的是 a pen</span></p>
      <p class="ex">There are two books and a pen on the desk.<span class="zh">离 are 最近的是 two books</span></p>` },
    { h: '否定和疑问', html: `<p class="ex">There isn't any water in the bottle.<span class="zh">瓶子里没有水。</span></p>
      <p class="ex">Are there any birds in the tree? — Yes, there are. / No, there aren't.<span class="zh">树上有鸟吗？</span></p>
      <p class="warn">回答要用 there，不能用 they。</p>` },
    { h: 'There be 和 have', html: `<ul><li><b>have / has</b>：某人<b>拥有</b>某物 —— My uncle has a big house.</li>
      <li><b>There be</b>：某地<b>存在</b>某物 —— There is a big house near the river.</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'There ___ a bird in the tree.', options: ['is', 'are', 'has'], answer: 0, explain: 'There be 表示“某地有某物”：a bird 是单数，用 There is；There be 句型里不能用 has。' },
    { type: 'choice', q: 'There ___ some milk in the glass.', options: ['is', 'are', 'have'], answer: 0, explain: 'milk 不可数，用 is。' },
    { type: 'choice', q: 'There ___ a pen and two books on the desk.', options: ['is', 'are', 'has'], answer: 0, explain: '就近原则：离 be 最近的是 a pen，用 is。' },
    { type: 'fill', q: 'There ___ forty students in our class.（填 be 动词）', answer: ['are'], explain: 'There be 表示“某地有某物”；forty students 是复数，用 are。' },
    { type: 'fill', q: '改为否定句：There is some water in the bottle.<br>→ There isn\'t ___ water in the bottle.', answer: ['any'], explain: '否定句 is 后加 not，同时 some 要改成 any。' },
    { type: 'choice', q: '—Is there a park near your home?<br>—Yes, ___.', options: ['there is', 'it is', 'they are'], answer: 0, explain: 'There be 的一般疑问句，回答也要用 there：Yes, there is.' },
    { type: 'choice', q: '下面哪句表示“某人拥有”？', options: ['My uncle has a big house.', 'There is a big house near the river.', 'There are two big houses.'], answer: 0, explain: '“某人拥有”用 have / has；There be 表示“某地存在”。' }
  ],
  tests: [
    { type: 'choice', q: 'There ___ a cat under the tree.', options: ['is', 'are', 'have'], answer: 0, explain: 'a cat 单数，用 is。' },
    { type: 'choice', q: 'There ___ two pens and a ruler in the pencil box.', options: ['is', 'are', 'has'], answer: 1, explain: '就近原则：离 be 最近的是 two pens，用 are。' },
    { type: 'choice', q: 'There ___ a teacher and forty students in the classroom.', options: ['is', 'are', 'has'], answer: 0, explain: '就近原则：离 be 最近的是 a teacher，用 is。' },
    { type: 'fill', q: '___ there any water in the bottle?（首字母大写）', answer: ['Is'], explain: 'water 不可数，用 is，疑问句提前。' },
    { type: 'choice', q: '—Are there any birds in the tree?<br>—No, ___.', options: ["there isn't", "there aren't", "they aren't"], answer: 1, explain: '用 there 回答，birds 复数，所以是 there aren\'t。' },
    { type: 'choice', q: 'My uncle ___ a big house.', options: ['there is', 'has', 'have'], answer: 1, explain: '表示某人拥有，用 have/has；my uncle 是第三人称单数，用 has。' },
    { type: 'fill', q: 'There ___ some bread on the plate.（填 be 动词）', answer: ['is'], explain: 'bread 不可数，用 is。' },
    { type: 'fill', q: 'There ___ a big tree in front of my house.（填 be 动词）', answer: ['is'], explain: 'a big tree 是单数，用 is。' },
    { type: 'fill', q: 'There ___ many tall buildings in Fuzhou.（填 be 动词）', answer: ['are'], explain: 'buildings 是复数，用 are。' },
    { type: 'choice', q: 'There ___ some pictures on the wall.', options: ['is', 'are', 'has'], answer: 1, explain: 'pictures 是复数，用 are；There be 句型里不用 has。' },
    { type: 'fill', q: 'There ___ some milk and two eggs in the fridge.（填 be 动词）', answer: ['is'], explain: '就近原则：离 be 最近的是不可数名词 milk，用 is。' },
    { type: 'fill', q: "There isn't ___ juice in the cup.（填一个词）", answer: ['any'], explain: '否定句里用 any，不用 some。' },
    { type: 'choice', q: 'There ___ any trees on this street.', options: ["isn't", "aren't", "don't"], answer: 1, explain: 'trees 是复数，否定用 aren\'t；There be 的否定不用 don\'t。' },
    { type: 'choice', q: '听问题，选择正确的答语。', say: 'Is there a library in your school?', options: ['Yes, there is.', 'Yes, it is.', 'Yes, I do.'], answer: 0, explain: '问句是 Is there...?，回答用 there：Yes, there is.' },
    { type: 'choice', q: '我们学校有一个大操场。', options: ['There is a big playground in our school.', 'There has a big playground in our school.', 'There have a big playground in our school.'], answer: 0, explain: '“某地有”用 There be，There be 句型里不能用 has / have。' },
    { type: 'fill', q: 'I ___ two sisters.（填 have 或 there are 中正确的一项）', answer: ['have'], explain: '“我有两个姐妹”是某人拥有，用 have。' }
  ]
},

/* ================= 五年级 ================= */
{
  id: 'g-present-simple', title: '一般现在时', short: '一般现在时', module: 'tense', grade: 5, freq: 3,
  prereqs: ['g-be', 'g-pronoun'],
  tip: '中考高频：第三人称单数加 s/es、does/doesn\'t 后动词还原。写作中最容易丢分的就是忘加 s。',
  learn: [
    { h: '什么时候用', html: `<ul>
      <li>经常、习惯性的动作：always, usually, often, sometimes, every day, on Sundays</li>
      <li>客观事实、真理</li></ul>
      <p class="ex">I usually get up at six.<span class="zh">我通常六点起床。</span></p>
      <p class="ex">The sun rises in the east.<span class="zh">太阳从东方升起。</span></p>` },
    { h: '第三人称单数', html: `<p>主语是 he / she / it / 单数名词时，动词要变：</p>
      <table class="tbl"><tr><th>情况</th><th>变法</th><th>例子</th></tr>
      <tr><td>一般情况</td><td>+s</td><td>work → works</td></tr>
      <tr><td>以 s, x, ch, sh, o 结尾</td><td>+es</td><td>watch → watches, go → goes, do → does</td></tr>
      <tr><td>辅音字母 + y</td><td>变 y 为 i，+es</td><td>study → studies, fly → flies</td></tr>
      <tr><td>元音字母 + y</td><td>+s</td><td>play → plays</td></tr>
      <tr><td>特殊</td><td colspan="2">have → has</td></tr></table>` },
    { h: '否定和疑问', html: `<div class="rhyme">三单现在时，动词要加 s；<br>doesn't 一出现，动词要还原。</div>
      <p class="ex">He doesn't like milk.<span class="zh">他不喜欢牛奶。（like 不加 s）</span></p>
      <p class="ex">Does she play the piano? — Yes, she does.<span class="zh">她弹钢琴吗？——是的。</span></p>
      <p class="ex">Do you go to school by bus? — No, I don't.<span class="zh">你坐公交上学吗？——不。</span></p>` }
  ],
  examples: [
    { type: 'fill', q: 'My father often ___ newspapers after dinner.（read）', answer: ['reads'], explain: 'often 表示习惯，主语 my father 是三单，read 加 s。' },
    { type: 'choice', q: '___ your sister like music?', options: ['Do', 'Does', 'Is'], answer: 1, explain: '句中有实义动词 like，主语三单，用 Does 提问。' },
    { type: 'fill', q: 'The sun ___ in the east.（rise）', answer: ['rises'], explain: '客观事实、真理用一般现在时；the sun 是三单，rise 加 s。' },
    { type: 'fill', q: 'My brother ___ to school at seven.（go）', answer: ['goes'], explain: 'go 以 o 结尾，三单加 es：goes（do → does 同理）。' },
    { type: 'fill', q: 'My uncle ___ to Beijing on business every month.（fly）', answer: ['flies'], explain: 'every month 表示习惯，主语三单；fly 是“辅音字母 l + y”结尾，变 y 为 i 加 es。' },
    { type: 'fill', q: 'Jack ___ football every Saturday.（play）', answer: ['plays'], explain: 'play 是“元音字母 a + y”结尾，直接加 s，不变 y。' },
    { type: 'fill', q: 'She ___ a nice cat.（have）', answer: ['has'], explain: 'have 的三单是特殊形式 has。' },
    { type: 'choice', q: '—Do you go to school by bus?<br>—No, I ___.', options: ["don't", "doesn't", "am not"], answer: 0, explain: '主语是 I / you / we / they 时，用 do 提问，否定回答用 don\'t。' },
    { type: 'choice', q: 'My sister ___ like carrots.', options: ["doesn't", "don't", "isn't"], answer: 0, explain: '主语 my sister 是三单，否定用 doesn\'t，后面的 like 用原形（不加 s）。口诀：doesn\'t 一出现，动词要还原。' },
    { type: 'choice', q: 'My grandparents ___ a walk after dinner every day.', options: ['take', 'takes', 'taking'], answer: 0, explain: '只有三单主语才加 s；my grandparents 是复数，动词用原形 take。' }
  ],
  tests: [
    { type: 'fill', q: 'She ___ TV every evening.（watch）', answer: ['watches'], explain: 'watch 以 ch 结尾，三单加 es。' },
    { type: 'fill', q: 'Tom ___ English very hard.（study）', answer: ['studies'], explain: 'study 辅音字母 + y，变 y 为 i 加 es。' },
    { type: 'choice', q: 'My parents ___ to work by bus every day.', options: ['go', 'goes', 'going'], answer: 0, explain: 'my parents 是复数，动词用原形 go。' },
    { type: 'choice', q: "He doesn't ___ basketball.", options: ['plays', 'play', 'playing'], answer: 1, explain: "doesn't 后面动词用原形。" },
    { type: 'choice', q: '—Does Lily have a brother?<br>—Yes, she ___.', options: ['is', 'has', 'does'], answer: 2, explain: '用 does 提问，用 does 回答。' },
    { type: 'fill', q: 'The earth ___ around the sun.（move）', answer: ['moves'], explain: '客观事实用一般现在时，the earth 是三单，加 s。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ["She don't like fish.", "She doesn't likes fish.", "She doesn't like fish."], answer: 2, explain: "三单否定用 doesn't，后面动词还原为 like。" },
    { type: 'choice', q: 'I usually ___ up at six.', options: ['get', 'gets', 'getting'], answer: 0, explain: 'usually 表示习惯，用一般现在时；主语 I 用动词原形。' },
    { type: 'choice', q: '听句子，选出句子表达的意思。', say: 'My mother often goes shopping on Sundays.', options: ['妈妈周日经常去购物。', '妈妈这个周日去购物了。', '妈妈正在购物。'], answer: 0, explain: 'often 和 on Sundays（每逢周日）表示习惯，用一般现在时 goes。' },
    { type: 'fill', q: 'A week ___ seven days.（have）', answer: ['has'], explain: '客观事实用一般现在时，a week 是三单，have 要变成 has。' },
    { type: 'fill', q: 'Kate ___ a glass of milk every morning.（drink）', answer: ['drinks'], explain: 'every morning 表习惯，Kate 是三单，一般情况加 s。' },
    { type: 'fill', q: 'The bus ___ at 7:30 every day.（leave）', answer: ['leaves'], explain: '主语 the bus 是三单，leave 加 s。' },
    { type: 'fill', q: 'He ___ his homework after school.（do）', answer: ['does'], explain: 'do 以 o 结尾，三单加 es：does。' },
    { type: 'fill', q: 'Grandma ___ the dishes after dinner.（wash）', answer: ['washes'], explain: 'wash 以 sh 结尾，三单加 es。' },
    { type: 'fill', q: 'Mr. Wang often ___ fishing on weekends.（go）', answer: ['goes'], explain: 'go 以 o 结尾，三单加 es。' },
    { type: 'choice', q: 'She ___ her bag to school every day.', options: ['carrys', 'carries', 'carryes'], answer: 1, explain: 'carry 是“辅音字母 r + y”结尾，变 y 为 i 加 es。' },
    { type: 'fill', q: 'A bird ___ with its wings.（fly）', answer: ['flies'], explain: 'fly 变 y 为 i 加 es：flies。' },
    { type: 'fill', q: 'He often ___ games with me.（play）', answer: ['plays'], explain: 'play 是“元音字母 + y”结尾，直接加 s。' },
    { type: 'fill', q: 'Lily ___ reading books in her free time.（enjoy）', answer: ['enjoys'], explain: 'enjoy 是“元音字母 o + y”结尾，直接加 s，不能写 enjoies。' },
    { type: 'fill', q: 'Our school ___ a big library.（have）', answer: ['has'], explain: '主语 our school 是三单，have 变成 has。' },
    { type: 'choice', q: 'Tom ___ breakfast at seven every day.', options: ['have', 'has', 'haves'], answer: 1, explain: 'have 的三单是 has，没有 haves。' },
    { type: 'fill', q: '改错：Amy have two brothers. 把错误的词改正后写出：___', answer: ['has'], explain: '主语 Amy 是三单，have 要改成 has。' },
    { type: 'fill', q: '改为否定句：He likes apples.<br>→ He ___ ___ apples.（填两个词）', answer: ["doesn't like", 'does not like'], explain: '三单否定加 doesn\'t，后面的动词还原：likes → like。' },
    { type: 'fill', q: '___ he play football on Sundays?（首字母大写）', answer: ['Does'], explain: '主语 he 是三单，用 Does 提问，后面动词用原形 play。' },
    { type: 'choice', q: '听问题，选择正确的答语。', say: 'Does your father work in a hospital?', options: ['Yes, he does.', 'Yes, he is.', 'Yes, I do.'], answer: 0, explain: '用 Does 提问，用 does 回答；问 your father，答语用 he。' },
    { type: 'choice', q: '—Do you like English?<br>—___', options: ['Yes, I do.', 'Yes, I am.', 'Yes, I does.'], answer: 0, explain: '用 Do 提问，用 do 回答；主语 I 不用 does。' },
    { type: 'fill', q: 'They ___ watch TV on school days.（填 don\'t 或 doesn\'t）', answer: ["don't"], explain: '主语 they 不是三单，否定用 don\'t。' },
    { type: 'choice', q: 'We ___ to the library on Saturdays.', options: ['go', 'goes', 'going'], answer: 0, explain: '主语 we 不是三单，用动词原形。' },
    { type: 'choice', q: 'The twins ___ swimming very much.', options: ['like', 'likes', 'liking'], answer: 0, explain: 'the twins（双胞胎）是复数，动词用原形。' }
  ]
},

{
  id: 'g-present-cont', title: '现在进行时', short: '现在进行时', module: 'tense', grade: 5, freq: 2,
  prereqs: ['g-be'],
  tip: '看到 Look! Listen! now 等标志词就要想到进行时；注意 -ing 的双写规则。',
  learn: [
    { h: '什么时候用', html: `<p>表示<b>现在（说话这一刻）正在做</b>的事。标志词：now, Look!, Listen!, at the moment, It's 8 o'clock now.</p>
      <p>结构：<b>am / is / are + 动词-ing</b></p>
      <p class="ex">Look! The boys are swimming in the river.<span class="zh">看！男孩们正在河里游泳。</span></p>` },
    { h: '-ing 怎么加', html: `<table class="tbl"><tr><th>情况</th><th>变法</th><th>例子</th></tr>
      <tr><td>一般情况</td><td>+ing</td><td>read → reading</td></tr>
      <tr><td>不发音的 e 结尾</td><td>去 e，+ing</td><td>make → making, write → writing</td></tr>
      <tr><td>重读闭音节，末尾一个辅音字母</td><td>双写，+ing</td><td>run → running, swim → swimming, sit → sitting, get → getting, stop → stopping, begin → beginning</td></tr>
      <tr><td>ie 结尾</td><td>变 ie 为 y，+ing</td><td>lie → lying, die → dying</td></tr></table>` },
    { h: '和一般现在时对比', html: `<p class="ex">I usually walk to school, but today I am taking a bus.<span class="zh">我通常走路上学，但今天我在坐公交。</span></p>
      <p>usually 是习惯 → 一般现在时；today 正在发生 → 现在进行时。</p>` }
  ],
  examples: [
    { type: 'fill', q: 'Look! The boys ___ in the river.（swim，填两个词）', answer: ['are swimming'], explain: 'Look! 表示正在发生；boys 复数用 are；swim 要双写 m。' },
    { type: 'choice', q: '—What are you doing?<br>—I ___ my homework.', options: ['do', 'am doing', 'does'], answer: 1, explain: '问“正在做什么”，用现在进行时回答。' },
    { type: 'choice', q: 'Look! The girls ___ in the hall.', options: ['dancing', 'are dancing', 'is dancing'], answer: 1, explain: '结构是 am / is / are + 动词-ing，be 动词不能少；girls 复数用 are。' },
    { type: 'fill', q: '写出 read 的 -ing 形式：___', answer: ['reading'], explain: '一般情况直接加 ing。' },
    { type: 'fill', q: '写出 make 的 -ing 形式：___', answer: ['making'], explain: 'make 以不发音的 e 结尾，去 e 加 ing。' },
    { type: 'fill', q: '写出 run 的 -ing 形式：___', answer: ['running'], explain: 'run 是重读闭音节，末尾只有一个辅音字母 n，要双写 n 再加 ing。' },
    { type: 'fill', q: '写出 lie 的 -ing 形式：___', answer: ['lying'], explain: 'lie 以 ie 结尾，变 ie 为 y 再加 ing。' },
    { type: 'choice', q: 'I usually ___ to school, but today I ___ a bus.', options: ['walk; am taking', 'am walking; take', 'walk; take'], answer: 0, explain: 'usually 是习惯，用一般现在时 walk；today 此刻正在发生，用现在进行时 am taking。' }
  ],
  tests: [
    { type: 'fill', q: 'Listen! Someone ___ in the next room.（sing，填两个词）', answer: ['is singing'], explain: 'Listen! 表示正在发生；someone 看作单数，用 is singing。' },
    { type: 'fill', q: '写出 write 的 -ing 形式：___', answer: ['writing'], explain: '以不发音的 e 结尾，去 e 加 ing。' },
    { type: 'fill', q: '写出 sit 的 -ing 形式：___', answer: ['sitting'], explain: '重读闭音节，双写 t 再加 ing。' },
    { type: 'choice', q: '—Where is Mom?<br>—She ___ dinner in the kitchen.', options: ['cooks', 'is cooking', 'cooking'], answer: 1, explain: '此刻正在做饭，用 is cooking；只写 cooking 缺少 be 动词。' },
    { type: 'choice', q: "It's 9 o'clock now. The students ___ an English class.", options: ['have', 'are having', 'has'], answer: 1, explain: '有 now，表示正在上课，用 are having。' },
    { type: 'choice', q: 'Look! The cat ___ on the sofa.', options: ['is lieing', 'is lying', 'lying'], answer: 1, explain: 'lie 以 ie 结尾，变 ie 为 y 加 ing：lying。' },
    { type: 'choice', q: 'Be quiet! The baby ___.', options: ['sleeps', 'is sleeping', 'slept'], answer: 1, explain: 'Be quiet! 说明婴儿此刻正在睡觉，用现在进行时 is sleeping。' },
    { type: 'choice', q: '听句子，孩子们正在做什么？', say: 'Look! The children are flying kites in the park.', options: ['放风筝', '踢足球', '划船'], answer: 0, explain: 'are flying kites 表示“正在放风筝”。' },
    { type: 'choice', q: 'They ___ basketball now.', options: ['playing', 'are playing', 'is playing'], answer: 1, explain: '有 now 用现在进行时；they 用 are，be 动词不能省。' },
    { type: 'fill', q: 'I ___ a book at the moment.（read，填两个词）', answer: ['am reading', "'m reading"], explain: 'at the moment 表示“此刻”，用 am reading。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['She watching TV now.', 'She is watching TV now.', 'She is watch TV now.'], answer: 1, explain: '进行时结构是 be + 动词-ing，两部分都不能少。' },
    { type: 'fill', q: 'Look! Grandpa ___ the flowers.（water，填两个词）', answer: ['is watering'], explain: 'Look! 表示正在发生；water 一般情况直接加 ing。' },
    { type: 'fill', q: 'Look! Some girls ___ under the tree.（dance，填两个词）', answer: ['are dancing'], explain: 'dance 以不发音的 e 结尾，去 e 加 ing。' },
    { type: 'choice', q: 'He is ___ a kite.', options: ['makeing', 'making', 'makking'], answer: 1, explain: 'make 去 e 加 ing：making。' },
    { type: 'choice', q: 'Look! Tom is ___ on the playground.', options: ['runing', 'running', 'runnning'], answer: 1, explain: 'run 是重读闭音节，末尾一个辅音字母，双写 n 加 ing。' },
    { type: 'fill', q: 'It ___ dark. Let\'s go home.（get，用现在进行时，填两个词）', answer: ['is getting', "'s getting"], explain: '“天正在变黑”用进行时；get 双写 t：getting。' },
    { type: 'fill', q: 'Hurry up! The class ___.（begin，用现在进行时，填两个词）', answer: ['is beginning'], explain: 'begin 重音在后一个音节，末尾一个辅音字母 n，双写 n 加 ing。' },
    { type: 'fill', q: '写出 die 的 -ing 形式：___', answer: ['dying'], explain: 'die 以 ie 结尾，变 ie 为 y 加 ing。' },
    { type: 'choice', q: 'The flowers are ___ because there is no water.', options: ['dieing', 'dying', 'diing'], answer: 1, explain: 'die 的 -ing 形式是 dying。' },
    { type: 'choice', q: 'My father often ___ newspapers in the evening, but now he ___ TV.', options: ['reads; is watching', 'is reading; watches', 'reads; watches'], answer: 0, explain: 'often 表习惯，用一般现在时；now 表正在，用现在进行时。' },
    { type: 'fill', q: 'We often play football after school. Look! We ___ football now.（play，填两个词）', answer: ['are playing', "'re playing"], explain: '后一句有 Look! 和 now，用现在进行时。' }
  ]
},

/* ================= 六年级 ================= */
{
  id: 'g-past-simple', title: '一般过去时', short: '一般过去时', module: 'tense', grade: 6, freq: 3,
  prereqs: ['g-present-simple'],
  tip: '中考高频：不规则动词过去式要背熟；看到 yesterday、ago、last 就用过去时。',
  learn: [
    { h: '什么时候用', html: `<p>表示<b>过去某个时间</b>发生的动作或状态。标志词：yesterday, last week / year, ... ago, in 2020, just now, the other day</p>
      <p class="ex">I visited my grandparents last weekend.<span class="zh">我上周末去看望了祖父母。</span></p>
      <p>be 的过去式：am / is → <b>was</b>，are → <b>were</b></p>` },
    { h: '规则动词加 ed', html: `<table class="tbl"><tr><th>情况</th><th>变法</th><th>例子</th></tr>
      <tr><td>一般情况</td><td>+ed</td><td>play → played</td></tr>
      <tr><td>e 结尾</td><td>+d</td><td>live → lived</td></tr>
      <tr><td>辅音字母 + y</td><td>变 y 为 i，+ed</td><td>study → studied, carry → carried</td></tr>
      <tr><td>重读闭音节</td><td>双写，+ed</td><td>stop → stopped, plan → planned</td></tr></table>` },
    { h: '常见不规则动词', html: `<p class="small">go → went, do → did, have → had, see → saw, buy → bought, eat → ate, come → came, get → got, take → took, make → made, say → said, tell → told, think → thought, teach → taught, catch → caught, read → read, put → put, write → wrote, run → ran, swim → swam, sing → sang, give → gave, find → found, feel → felt, leave → left, meet → met, sleep → slept, lose → lost, spend → spent, fly → flew, know → knew, begin → began, sit → sat, stand → stood, win → won, forget → forgot, bring → brought</p>` },
    { h: '否定和疑问', html: `<div class="rhyme">did 一出现，动词变原形。</div>
      <p class="ex">I didn't go to the park yesterday.<span class="zh">我昨天没去公园。</span></p>
      <p class="ex">Did you watch the match? — Yes, I did.<span class="zh">你看比赛了吗？——看了。</span></p>` }
  ],
  examples: [
    { type: 'fill', q: 'I ___ my grandparents last weekend.（visit）', answer: ['visited'], explain: 'last weekend 是过去时间，visit 加 ed。' },
    { type: 'choice', q: 'Did he ___ to the zoo yesterday?', options: ['go', 'went', 'goes'], answer: 0, explain: 'did 后面动词用原形。' },
    { type: 'choice', q: 'I ___ at home last night.', options: ['am', 'was', 'were'], answer: 1, explain: 'last night 是过去；am / is 的过去式是 was。' },
    { type: 'fill', q: 'They ___ in Fuzhou in 2020.（live）', answer: ['lived'], explain: 'in 2020 是过去时间；live 以 e 结尾，只加 d。' },
    { type: 'fill', q: 'He ___ the heavy box for me yesterday.（carry）', answer: ['carried'], explain: 'carry 是“辅音字母 r + y”结尾，变 y 为 i 加 ed。' },
    { type: 'fill', q: 'We ___ a trip to Wuyi Mountain last month.（plan）', answer: ['planned'], explain: 'plan 是重读闭音节，末尾一个辅音字母 n，双写 n 加 ed。' },
    { type: 'fill', q: 'I ___ to the park with my friends last Sunday.（go）', answer: ['went'], explain: 'go 是不规则动词，过去式是 went，不能写 goed。' },
    { type: 'fill', q: '改为否定句：I watched TV last night.<br>→ I ___ ___ TV last night.（填两个词）', answer: ["didn't watch", 'did not watch'], explain: '否定句加 didn\'t，后面的动词还原：watched → watch。' },
    { type: 'choice', q: '—Did you visit the museum last Sunday?<br>—Yes, ___.', options: ['I did', 'I visited', 'I do'], answer: 0, explain: '用 Did 提问，简短回答也用 did：Yes, I did. / No, I didn\'t.' }
  ],
  tests: [
    { type: 'fill', q: 'We ___ a great time yesterday.（have）', answer: ['had'], explain: 'have 的过去式是 had。' },
    { type: 'fill', q: '写出 study 的过去式：___', answer: ['studied'], explain: '辅音字母 + y，变 y 为 i 加 ed。' },
    { type: 'fill', q: '写出 stop 的过去式：___', answer: ['stopped'], explain: '重读闭音节，双写 p 加 ed。' },
    { type: 'choice', q: 'There ___ a lot of people in the park last Sunday.', options: ['is', 'was', 'were'], answer: 2, explain: 'last Sunday 是过去；people 复数，用 were。' },
    { type: 'choice', q: '—Did you watch the football match last night?<br>—No, I ___.', options: ["don't", "didn't", "wasn't"], answer: 1, explain: '用 did 提问，用 didn\'t 否定回答。' },
    { type: 'choice', q: 'She ___ a new dress two days ago.', options: ['buys', 'buyed', 'bought'], answer: 2, explain: 'buy 是不规则动词，过去式是 bought。' },
    { type: 'choice', q: 'Where ___ you ___ your summer holiday?', options: ['did; spend', 'do; spent', 'did; spent'], answer: 0, explain: '问过去的事用 did，did 后面动词用原形 spend。' },
    { type: 'choice', q: 'He ___ to Beijing two years ago.', options: ['goes', 'went', 'will go'], answer: 1, explain: 'two years ago 是过去时间，用过去式 went。' },
    { type: 'choice', q: '听句子，说话人是什么时候看的电影？', say: 'I watched a film with my friends just now.', options: ['刚才', '明天', '每天'], answer: 0, explain: 'just now 意思是“刚才”，是一般过去时的标志词。' },
    { type: 'fill', q: 'I met an old friend the other day.<br>句中表示过去时间的短语是 the ___ day.（填一个词）', answer: ['other'], explain: 'the other day 意为“前几天”，是一般过去时的标志词。' },
    { type: 'fill', q: 'We ___ basketball after school yesterday.（play）', answer: ['played'], explain: 'yesterday 是过去；play 是“元音字母 + y”，直接加 ed。' },
    { type: 'choice', q: 'She ___ her room last night.', options: ['cleans', 'cleaned', 'cleanned'], answer: 1, explain: 'last night 用过去式；clean 一般情况加 ed，不双写。' },
    { type: 'fill', q: '写出 dance 的过去式：___', answer: ['danced'], explain: '以 e 结尾，只加 d。' },
    { type: 'fill', q: 'We ___ the sports meeting last week very much.（like）', answer: ['liked'], explain: '以 e 结尾的 like 只加 d。' },
    { type: 'fill', q: 'The baby ___ for a long time last night.（cry）', answer: ['cried'], explain: 'cry 是“辅音字母 r + y”，变 y 为 i 加 ed。' },
    { type: 'choice', q: 'They ___ chess yesterday afternoon.', options: ['plaied', 'played', 'playyed'], answer: 1, explain: 'play 是“元音字母 a + y”，不变 y，直接加 ed。' },
    { type: 'fill', q: 'They ___ to help the old man yesterday.（try）', answer: ['tried'], explain: 'try 变 y 为 i 加 ed：tried。' },
    { type: 'choice', q: 'The car ___ at the school gate.', options: ['stoped', 'stopped', 'stopd'], answer: 1, explain: 'stop 是重读闭音节，双写 p 加 ed。' },
    { type: 'fill', q: 'We ___ a party for Mom\'s birthday last week.（plan）', answer: ['planned'], explain: 'plan 双写 n 加 ed。' },
    { type: 'fill', q: 'I ___ an interesting book last night.（read）', answer: ['read'], explain: 'read 的过去式还是 read，拼写不变，但读音变成 /red/。' },
    { type: 'fill', q: 'We ___ a lot of photos in Xiamen.（take）', answer: ['took'], explain: 'take 的过去式是 took。' },
    { type: 'choice', q: 'Grandma ___ me a story last night.', options: ['telled', 'told', 'tells'], answer: 1, explain: 'tell 是不规则动词，过去式是 told。' },
    { type: 'fill', q: 'He ___ his key on the way home yesterday.（lose）', answer: ['lost'], explain: 'lose 的过去式是 lost。' },
    { type: 'fill', q: 'Where ___ you yesterday afternoon?（填 be 动词）', answer: ['were'], explain: 'yesterday 是过去；you 用 were。' },
    { type: 'choice', q: 'My mother ___ ill last week.', options: ['is', 'was', 'were'], answer: 1, explain: 'last week 是过去，单数主语用 was。' },
    { type: 'choice', q: "He didn't ___ his homework yesterday.", options: ['finish', 'finished', 'finishes'], answer: 0, explain: 'did 一出现，动词变原形。' },
    { type: 'fill', q: '改错：She didn\'t went to school yesterday. 把错误的词改正后写出：___', answer: ['go'], explain: 'didn\'t 后面要用动词原形，went 改为 go。' },
    { type: 'fill', q: '___ she come to school yesterday?（首字母大写）', answer: ['Did'], explain: '问过去的事，用 Did 提问，后面动词用原形 come。' },
    { type: 'choice', q: '—Did you see the film?<br>—Yes, ___.', options: ['I did', 'I do', 'I saw'], answer: 0, explain: '用 did 提问，用 did 回答：Yes, I did.' }
  ]
},

{
  id: 'g-future', title: '一般将来时', short: '一般将来时', module: 'tense', grade: 6, freq: 3,
  prereqs: ['g-be', 'g-present-simple'],
  tip: '中考高频：“主将从现”几乎每年都考；There will be 不能写成 There will have。',
  learn: [
    { h: '什么时候用', html: `<p>表示将来要发生的事。标志词：tomorrow, next week, this weekend, soon, in the future, in + 一段时间（in two days）</p>` },
    { h: '两种结构', html: `<p><b>will + 动词原形</b>：单纯将来、预测、临时决定</p>
      <p class="ex">It will rain tomorrow.<span class="zh">明天会下雨。</span></p>
      <p class="ex">It's hot here. — I'll open the window for you.<span class="zh">这里好热。——我来帮你开窗。（临时决定）</span></p>
      <p><b>be going to + 动词原形</b>：计划、打算；有迹象表明要发生</p>
      <p class="ex">I am going to visit my aunt this weekend.<span class="zh">我打算这周末去看姑姑。</span></p>
      <p class="ex">Look at the dark clouds! It's going to rain.<span class="zh">看那些乌云！要下雨了。</span></p>
      <p class="warn">will 的否定是 won't = will not。</p>` },
    { h: 'There be 的将来时', html: `<p class="ex">There will be a sports meeting next week.<span class="zh">下周将有一场运动会。</span></p>
      <p class="warn">There will have ✗ —— There be 句型里不能出现 have。</p>` },
    { h: '主将从现（重点）', html: `<p>在 <b>if</b>（如果）、<b>when</b>（当……时）、<b>as soon as</b>（一……就）引导的从句里：<b>主句用将来时，从句用一般现在时</b>。</p>
      <p class="ex">If it rains tomorrow, we will stay at home.<span class="zh">如果明天下雨，我们就待在家。</span></p>
      <p class="ex">I'll call you as soon as I arrive in Beijing.<span class="zh">我一到北京就给你打电话。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: 'Look at the dark clouds. It ___ rain.', options: ['is going to', 'is', 'was'], answer: 0, explain: '有迹象（乌云）表明要发生，用 be going to。' },
    { type: 'fill', q: 'There ___ a sports meeting next week.（be，用将来时，两个词）', answer: ['will be', 'is going to be'], explain: 'next week 表将来，There be 的将来时是 There will be。' },
    { type: 'choice', q: 'My father will come back ___.', options: ['in two days', 'two days ago', 'last week'], answer: 0, explain: 'will 表将来；in + 一段时间（in two days，两天后）是将来时的标志词，ago 和 last 用于过去。' },
    { type: 'choice', q: 'I think it ___ sunny tomorrow.', options: ['is', 'was', 'will be'], answer: 2, explain: 'tomorrow 表将来，对天气的预测用 will + 动词原形。' },
    { type: 'choice', q: "—I'm thirsty.<br>—Wait a moment. I ___ you some water.", options: ['will get', 'got', 'get'], answer: 0, explain: '说话时临时决定要做的事，用 will。' },
    { type: 'fill', q: 'We ___ ___ ___ visit the museum next Sunday. We have bought the tickets.（填三个词，用 be going to）', answer: ['are going to'], explain: '已经买好票，是事先的计划，用 be going to；主语 we 用 are。' },
    { type: 'fill', q: '改为否定句：They will come to the party.<br>→ They ___ come to the party.（填一个缩写词）', answer: ["won't"], explain: 'will not 缩写为 won\'t，后面接动词原形。' },
    { type: 'choice', q: 'If it ___ tomorrow, we will stay at home.', options: ['rains', 'will rain', 'rained'], answer: 0, explain: '主将从现：if 从句用一般现在时，主句用将来时。' },
    { type: 'choice', q: 'When my mother ___ home, we will have dinner.', options: ['gets', 'will get', 'got'], answer: 0, explain: '主将从现：when 引导的从句用一般现在时。' },
    { type: 'fill', q: 'I will send you a message as soon as I ___ home.（get）', answer: ['get'], explain: 'as soon as（一……就）引导的从句也遵守“主将从现”：主句 will send，从句用一般现在时 get。' }
  ],
  tests: [
    { type: 'choice', q: 'My brother ___ 14 next year.', options: ['is', 'will be', 'was'], answer: 1, explain: 'next year 表示将来，用 will be。' },
    { type: 'choice', q: '—What are you going to do this weekend?<br>—I ___ visit my aunt.', options: ['am going to', 'will to', 'going to'], answer: 0, explain: '回答计划用 be going to；will 后面不加 to；going to 前缺 be。' },
    { type: 'choice', q: 'There ___ a concert in our school tomorrow.', options: ['will have', 'is going to have', 'will be'], answer: 2, explain: 'There be 句型的将来时是 There will be，不能用 have。' },
    { type: 'choice', q: 'If it ___ fine tomorrow, we will go hiking.', options: ['is', 'will be', 'was'], answer: 0, explain: '主将从现：if 从句用一般现在时。' },
    { type: 'fill', q: "—It's hot here.<br>—I ___ the window for you.（open，用 will，填两个词）", answer: ['will open', "'ll open"], explain: '临时决定用 will + 动词原形。' },
    { type: 'choice', q: "I'll call you as soon as I ___ Beijing.", options: ['arrive in', 'will arrive in', 'arrived in'], answer: 0, explain: '主将从现：as soon as 从句用一般现在时。' },
    { type: 'fill', q: 'She ___ to the party tomorrow.（not go，用 will 的否定）', answer: ["won't go", 'will not go'], explain: 'will 的否定：won\'t / will not + 动词原形。' },
    { type: 'choice', q: 'We will finish the project ___.', options: ['in a week', 'a week ago', 'last week'], answer: 0, explain: 'in + 一段时间表示“……之后”，用于将来时。' },
    { type: 'fill', q: 'We ___ a class meeting next Friday.（have，用 will，填两个词）', answer: ['will have', "'ll have"], explain: 'next Friday 表将来，will + 动词原形。' },
    { type: 'choice', q: 'People ___ live on the moon in the future.', options: ['will', 'are', 'did'], answer: 0, explain: 'in the future 表将来，对未来的预测用 will + 动词原形。' },
    { type: 'choice', q: '—The phone is ringing.<br>—OK. I ___ answer it.', options: ['will', 'did', 'was'], answer: 0, explain: '说话时临时决定去接电话，用 will。' },
    { type: 'fill', q: '—Here are the books.<br>—Thanks. I ___ them right away.（read，用 will，填两个词）', answer: ["'ll read", 'will read'], explain: '拿到书后临时决定，用 will + 动词原形。' },
    { type: 'fill', q: 'What ___ you going to do tomorrow?（填 be 动词）', answer: ['are'], explain: 'be going to 的疑问句，主语 you 用 are。' },
    { type: 'choice', q: 'Tom ___ his grandparents this summer holiday. He has planned it for a long time.', options: ['is going to visit', 'visits', 'visited'], answer: 0, explain: '早就计划好的打算，用 be going to。' },
    { type: 'choice', q: 'Look! The boy is running too fast. He ___ fall.', options: ['is going to', 'goes to', 'went to'], answer: 0, explain: '从眼前的迹象判断马上要发生，用 be going to。' },
    { type: 'fill', q: 'Be careful! The glass ___ ___ ___ fall off the table.（填三个词，用 be going to）', answer: ['is going to'], explain: '杯子快掉了，有迹象表明要发生，用 be going to；the glass 用 is。' },
    { type: 'choice', q: '下面哪个是 will not 的缩写？', options: ["won't", "willn't", "wo'nt"], answer: 0, explain: 'will not 的缩写是特殊的 won\'t。' },
    { type: 'choice', q: '听句子，选出句子的意思。', say: "Don't worry. I won't tell anyone.", options: ['别担心，我不会告诉任何人。', '别担心，我已经告诉大家了。', '别担心，我会告诉每个人。'], answer: 0, explain: 'won\'t = will not，“将不会”。' },
    { type: 'fill', q: 'There ___ a football match on TV tonight.（填两个词，用将来时）', answer: ['will be'], explain: 'There be 的将来时是 There will be。' },
    { type: 'choice', q: '___ there be a party tomorrow?', options: ['Will', 'Is', 'Does'], answer: 0, explain: 'There will be 的疑问句把 will 提前：Will there be...?' },
    { type: 'fill', q: 'If you ___ hard, you will pass the exam.（study）', answer: ['study'], explain: '主将从现：if 从句用一般现在时，主语 you 用原形 study。' },
    { type: 'choice', q: 'If he ___ tomorrow, I will tell him the news.', options: ['comes', 'will come', 'came'], answer: 0, explain: 'if 引导的条件从句用一般现在时表示将来。' },
    { type: 'choice', q: "If it doesn't rain tomorrow, we ___ a picnic.", options: ['have', 'will have', 'had'], answer: 1, explain: '主将从现：从句用一般现在时，主句用将来时 will have。' },
    { type: 'fill', q: 'I will tell her the news when she ___ back.（come）', answer: ['comes'], explain: 'when 从句用一般现在时；she 是三单，用 comes。' },
    { type: 'choice', q: 'I will write to you when I ___ in London.', options: ['arrive', 'will arrive', 'arrived'], answer: 0, explain: '主将从现：when 从句用一般现在时。' },
    { type: 'fill', q: 'I will call you as soon as I ___ to London.（get）', answer: ['get'], explain: 'as soon as 从句用一般现在时，主语 I 用原形 get。' },
    { type: 'choice', q: 'She will go out to play as soon as she ___.', options: ['will finish her homework', 'finishes her homework', 'finished her homework'], answer: 1, explain: '主将从现：as soon as 从句用一般现在时。' }
  ]
},

{
  id: 'g-comparative', title: '形容词和副词的比较级、最高级', short: '比较级与最高级', module: 'morph', grade: 6, freq: 3,
  prereqs: ['g-be', 'g-adj-adv'],
  tip: '中考高频：比较级前用 much 修饰、“越来越……”、“the + 比较级, the + 比较级”。',
  learn: [
    { h: '三个等级', html: `<ul>
      <li><b>原级</b>：as + 原级 + as（和……一样）；not as/so + 原级 + as（不如……）</li>
      <li><b>比较级</b>：两者比较，常和 than 连用</li>
      <li><b>最高级</b>：三者及以上，the + 最高级 + in/of 范围</li></ul>
      <p class="ex">Tom is taller than Jim.<span class="zh">汤姆比吉姆高。</span></p>
      <p class="ex">Summer is the hottest season of the year.<span class="zh">夏天是一年中最热的季节。</span></p>` },
    { h: '怎么变', html: `<table class="tbl"><tr><th>情况</th><th>变法</th><th>例子</th></tr>
      <tr><td>一般情况</td><td>+er / +est</td><td>tall → taller → tallest</td></tr>
      <tr><td>e 结尾</td><td>+r / +st</td><td>nice → nicer → nicest</td></tr>
      <tr><td>辅音字母 + y</td><td>变 y 为 i</td><td>happy → happier → happiest</td></tr>
      <tr><td>重读闭音节</td><td>双写</td><td>big → bigger, hot → hotter, thin, fat, sad</td></tr>
      <tr><td>多音节词</td><td>more / most</td><td>beautiful → more beautiful → most beautiful</td></tr></table>
      <p><b>不规则</b>：good/well → better → best；bad/badly → worse → worst；many/much → more → most；little → less → least；far → farther/further → farthest/furthest</p>` },
    { h: '常考句型', html: `<ul>
      <li>修饰比较级用 <b>much, a little, even, far, a lot</b>，<b>不能用 very</b></li>
      <li>越来越……：比较级 and 比较级 —— <span class="en">bigger and bigger, more and more beautiful</span></li>
      <li>越……就越……：the + 比较级, the + 比较级</li>
      <li>最……之一：one of the + 最高级 + 复数名词</li></ul>
      <p class="ex">The more you read, the better you write.<span class="zh">读得越多，写得越好。</span></p>
      <p class="ex">This is one of the most interesting films this year.<span class="zh">这是今年最有趣的电影之一。</span></p>` }
  ],
  examples: [
    { type: 'fill', q: 'Tom is ___ than Jim.（tall）', answer: ['taller'], explain: '有 than，用比较级 taller。' },
    { type: 'choice', q: 'This is one of ___ films this year.', options: ['the most interesting', 'more interesting', 'most interesting'], answer: 0, explain: 'one of the + 最高级 + 复数名词。' },
    { type: 'fill', q: 'Lily is as ___ as her mother.（tall）', answer: ['tall'], explain: 'as + 原级 + as 表示“和……一样”，中间用原级，不能用 taller。' },
    { type: 'choice', q: 'Lucy is the tallest girl ___ our class.', options: ['in', 'of', 'than'], answer: 0, explain: '最高级后面接范围：班级、城市等“地点、集体”用 in；“几个人、几样东西”用 of。' },
    { type: 'choice', q: 'This bag is not as ___ as that one.', options: ['cheap', 'cheaper', 'cheapest'], answer: 0, explain: 'not as / so + 原级 + as 表示“不如……”，中间仍用原级。' },
    { type: 'fill', q: 'Today is ___ than yesterday.（hot）', answer: ['hotter'], explain: 'hot 是重读闭音节，末尾一个辅音字母 t，双写 t 再加 er。' },
    { type: 'fill', q: 'This dress is ___ than that one.（nice）', answer: ['nicer'], explain: '有 than 用比较级；nice 以 e 结尾，只加 r。' },
    { type: 'fill', q: 'She is ___ than before.（happy）', answer: ['happier'], explain: 'happy 是“辅音字母 + y”结尾，变 y 为 i 加 er。' },
    { type: 'fill', q: 'This picture is ___ than that one.（beautiful，填两个词）', answer: ['more beautiful'], explain: 'beautiful 是多音节词，比较级在前面加 more。' },
    { type: 'choice', q: 'Your cold is getting ___. You should see a doctor.', options: ['bad', 'worse', 'worst'], answer: 1, explain: 'bad 的比较级是不规则的 worse，“越来越重了”用比较级。' },
    { type: 'choice', q: 'My room is ___ bigger than yours.', options: ['very', 'a lot', 'too'], answer: 1, explain: '修饰比较级可以用 much, a little, even, far, a lot，不能用 very 和 too。' },
    { type: 'fill', q: 'Our city is becoming ___ ___ ___ beautiful.（越来越美丽，填三个词）', answer: ['more and more'], explain: '多音节词“越来越……”用 more and more + 原级，不能写 beautifuler and beautifuler。' },
    { type: 'choice', q: '___ you read, ___ you will write.', options: ['The more; the better', 'More; better', 'The most; the best'], answer: 0, explain: '“越……就越……”：the + 比较级, the + 比较级。' }
  ],
  tests: [
    { type: 'fill', q: '写出 big 的比较级：___', answer: ['bigger'], explain: '重读闭音节，双写 g 加 er。' },
    { type: 'fill', q: 'Summer is the ___ season of the year.（hot）', answer: ['hottest'], explain: '有 the 和范围 of the year，用最高级；hot 双写 t。' },
    { type: 'choice', q: 'My English is not as ___ as yours.', options: ['good', 'better', 'best'], answer: 0, explain: 'not as + 原级 + as。' },
    { type: 'choice', q: 'This problem is ___ easier than that one.', options: ['very', 'much', 'more'], answer: 1, explain: '修饰比较级用 much，不能用 very；easier 本身就是比较级，前面不能再加 more。' },
    { type: 'choice', q: 'The weather is getting ___.', options: ['hot and hot', 'hotter and hotter', 'more and more hot'], answer: 1, explain: '“越来越热”：比较级 and 比较级 —— hotter and hotter。' },
    { type: 'choice', q: 'Of all the students in our class, Lucy runs ___.', options: ['fast', 'faster', 'fastest'], answer: 2, explain: '“所有学生中”是三者以上，用最高级（副词最高级前的 the 可省）。' },
    { type: 'fill', q: 'The more you practice, the ___ you will speak English.（good）', answer: ['better'], explain: 'the + 比较级, the + 比较级；good 的比较级是 better。' },
    { type: 'fill', q: 'Tom is as ___ as his brother.（old）', answer: ['old'], explain: 'as...as 中间用原级。' },
    { type: 'choice', q: 'This box is as ___ as that one.', options: ['heavy', 'heavier', 'heaviest'], answer: 0, explain: 'as + 原级 + as。' },
    { type: 'choice', q: "Tom doesn't run as ___ as Mike.", options: ['fast', 'faster', 'fastest'], answer: 0, explain: 'not as + 原级 + as 表示“不如……”。' },
    { type: 'fill', q: '同义句转换：My bag is smaller than yours.<br>= My bag is not as ___ as yours.', answer: ['big', 'large'], explain: '“我的包比你的小”=“我的包不如你的大”，not as + 原级 + as，用 small 的反义词 big。' },
    { type: 'choice', q: 'Who is ___, Tom or Jim?', options: ['tall', 'taller', 'tallest'], answer: 1, explain: '两者比较（Tom 和 Jim）用比较级。' },
    { type: 'fill', q: 'An elephant is much ___ than a monkey.（heavy）', answer: ['heavier'], explain: '有 than 用比较级；heavy 变 y 为 i 加 er。' },
    { type: 'fill', q: 'The Yangtze River is the ___ river in China.（long）', answer: ['longest'], explain: '有 the 和范围 in China，用最高级；一般情况加 est。' },
    { type: 'choice', q: 'Mike is the youngest ___ the three boys.', options: ['in', 'of', 'than'], answer: 1, explain: '范围是“三个男孩”这一组人，用 of。' },
    { type: 'fill', q: '写出 short 的最高级：___', answer: ['shortest'], explain: '一般情况加 est。' },
    { type: 'fill', q: '写出 large 的最高级：___', answer: ['largest'], explain: 'large 以 e 结尾，只加 st。' },
    { type: 'choice', q: 'Which is ___, the sun, the earth or the moon?', options: ['larger', 'the largest', 'the larger'], answer: 1, explain: '三者比较用最高级；large 以 e 结尾加 st：the largest。' },
    { type: 'fill', q: 'She is the ___ girl in the world today.（happy）', answer: ['happiest'], explain: '最高级；happy 变 y 为 i 加 est。' },
    { type: 'fill', q: 'I get up ___ than my brother.（early）', answer: ['earlier'], explain: '有 than 用比较级；early 变 y 为 i 加 er。' },
    { type: 'fill', q: 'You look ___ than before.（thin）', answer: ['thinner'], explain: 'thin 是重读闭音节，双写 n 加 er。' },
    { type: 'choice', q: 'The pig is ___ than the dog.', options: ['fater', 'fatter', 'more fat'], answer: 1, explain: 'fat 双写 t 加 er：fatter。' },
    { type: 'choice', q: 'Science is ___ than art for me.', options: ['more interesting', 'interestinger', 'most interesting'], answer: 0, explain: 'interesting 是多音节词，比较级用 more；有 than 不用最高级。' },
    { type: 'fill', q: 'Health is the ___ ___ thing in our life.（important，填两个词）', answer: ['most important'], explain: '多音节词的最高级在前面加 most。' },
    { type: 'fill', q: 'He played ___ than me in the game yesterday.（well）', answer: ['better'], explain: 'well 的比较级是 better。' },
    { type: 'fill', q: 'I have ___ money than you.（little）', answer: ['less'], explain: 'little 的比较级是 less。' },
    { type: 'choice', q: 'Who has ___ books, Tom, Jim or Ann?', options: ['more', 'most', 'the most'], answer: 2, explain: '三者比较用最高级；many 的最高级是 most，前面加 the。' },
    { type: 'choice', q: 'This is the ___ film I have ever seen.', options: ['bad', 'worse', 'worst'], answer: 2, explain: '有 the 和“我看过的”，用最高级；bad 的最高级是 worst。' },
    { type: 'choice', q: 'He is ___ taller than his father.', options: ['even', 'very', 'so'], answer: 0, explain: 'even 可以修饰比较级（甚至更高），very 和 so 不行。' },
    { type: 'fill', q: 'My new house is ___ bigger than the old one.（填一个词，不能填 very）', answer: ['much', 'far', 'even', 'still'], explain: '修饰比较级用 much / far / even 等。' },
    { type: 'choice', q: 'As winter comes, the days get ___.', options: ['short and short', 'shorter and shorter', 'more and more short'], answer: 1, explain: '单音节词“越来越……”：比较级 and 比较级。' },
    { type: 'fill', q: 'In autumn it is getting ___.（越来越冷，用 cold，填三个词）', answer: ['colder and colder'], explain: '单音节词“越来越……”：比较级 and 比较级 —— colder and colder。' },
    { type: 'fill', q: '___ harder you work, the more you will get.（填一个词，首字母大写）', answer: ['The'], explain: '“越……越……”：the + 比较级, the + 比较级。' },
    { type: 'choice', q: '___ you eat, ___ you will be.', options: ['The more; the fatter', 'More; fatter', 'The most; the fattest'], answer: 0, explain: 'the + 比较级, the + 比较级，表示“吃得越多，就会越胖”。' },
    { type: 'fill', q: 'Tom is one of the ___ students in our class.（clever）', answer: ['cleverest', 'most clever'], explain: 'one of the + 最高级 + 复数名词。' },
    { type: 'choice', q: 'Quanzhou is one of the oldest ___ in China.', options: ['city', 'cities', 'citys'], answer: 1, explain: 'one of the + 最高级 + 复数名词：cities。' },
    { type: 'choice', q: 'Beijing is one of ___ cities in China.', options: ['the biggest', 'bigger', 'big'], answer: 0, explain: 'one of 后面用 the + 最高级。' }
  ]
},

/* ================= 七年级 ================= */
{
  id: 'g-modal', title: '情态动词 can / may / must / should', short: '情态动词', module: 'morph', grade: 7, freq: 3,
  prereqs: ['g-present-simple'],
  tip: '中考必考：Must I...? 的否定回答用 needn\'t / don\'t have to；must / can\'t 表推测。',
  learn: [
    { h: '共同规则', html: `<ul>
      <li>情态动词 + <b>动词原形</b></li>
      <li>没有人称变化：He can swim.（不能写 cans）</li>
      <li>否定直接加 not，疑问把情态动词提前</li></ul>` },
    { h: '各自的意思', html: `<table class="tbl"><tr><th>词</th><th>意思</th><th>例句</th></tr>
      <tr><td>can / could</td><td>能、会；请求许可；could 更委婉，也是 can 的过去式</td><td>Can I use your pen?</td></tr>
      <tr><td>may</td><td>可以（请求许可）；可能</td><td>May I come in?</td></tr>
      <tr><td>must</td><td>必须（主观）</td><td>I must finish my homework.</td></tr>
      <tr><td>mustn't</td><td><b>禁止</b>、不许</td><td>You mustn't smoke here.</td></tr>
      <tr><td>have to</td><td>不得不（客观）</td><td>It's raining. I have to stay at home.</td></tr>
      <tr><td>should</td><td>应该（建议）</td><td>You should drink more water.</td></tr></table>` },
    { h: '必考：Must I ...? 的回答', html: `<p class="ex">Must I finish it today? — Yes, you must.<span class="zh">肯定回答用 must</span></p>
      <p class="ex">Must I finish it today? — No, you needn't.<span class="zh">否定回答用 needn't 或 don't have to</span></p>
      <p class="warn">否定回答不能用 mustn't，因为 mustn't 是“禁止”，不是“不必”。</p>` },
    { h: '表示推测', html: `<p>把握从大到小：<b>must</b>（一定是）&gt; <b>may / might</b>（可能是）&gt; <b>can't</b>（不可能是）</p>
      <p class="ex">The man can't be Mr. Wang. He has gone to Beijing.<span class="zh">那人不可能是王老师，他去北京了。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '—Must I finish the work today?<br>—No, you ___.', options: ["mustn't", "needn't", "can't"], answer: 1, explain: 'Must 提问的否定回答用 needn\'t（不必）。' },
    { type: 'choice', q: 'The man ___ be Mr. Wang. Mr. Wang has gone to Beijing.', options: ['must', "can't", 'may'], answer: 1, explain: '王老师去北京了，所以那人“不可能是”王老师，用 can\'t。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['He can swim.', 'He cans swim.', 'He can swims.'], answer: 0, explain: '情态动词没有人称变化（不加 s），后面接动词原形。' },
    { type: 'fill', q: '改为一般疑问句：She can play the piano.<br>→ ___ she play the piano?（首字母大写）', answer: ['Can'], explain: '情态动词的疑问句直接把情态动词提到句首，不用 does。' },
    { type: 'choice', q: '___ you please tell me the way to the station?', options: ['Could', 'Must', 'Need'], answer: 0, explain: '有礼貌地请求别人用 Could you...?，比 Can you...? 更委婉。' },
    { type: 'choice', q: "—Where is Tom?<br>—I'm not sure. He ___ be in the library.", options: ['may', 'must', "can't"], answer: 0, explain: '“不确定”说明把握不大，用 may（可能）。' },
    { type: 'choice', q: 'It is raining hard. I ___ stay at home today.', options: ['have to', 'has to', 'must to'], answer: 0, explain: '因为下大雨“不得不”待在家，是客观原因，用 have to；must 后面不加 to。' },
    { type: 'choice', q: '—Must I clean the room now?<br>—Yes, you ___.', options: ['must', 'may', 'need'], answer: 0, explain: 'Must I...? 的肯定回答用 must。' },
    { type: 'choice', q: '—Can your brother ride a bike?<br>—Yes, he ___. He rides to school every day.', options: ['can', 'does', 'is'], answer: 0, explain: 'can 表示“能、会”；用 can 提问，就用 can 回答。' },
    { type: 'fill', q: 'My grandma ___ dance well when she was young.（can 的过去式）', answer: ['could'], explain: 'when she was young 是过去，表示过去“能、会”用 can 的过去式 could。' },
    { type: 'choice', q: '—___ I use your eraser?<br>—Sure. Here you are.', options: ['May', 'Must', 'Should'], answer: 0, explain: '请求对方允许“我可以……吗”用 May I...?（也可以说 Can I...?）。' },
    { type: 'choice', q: 'I ___ finish my homework first. I want to go out to play later.', options: ['must', "mustn't", "needn't"], answer: 0, explain: '说话人自己觉得“必须”先完成作业，是主观上的要求，用 must。' },
    { type: 'choice', q: "You ___ swim in the river alone. It's dangerous.", options: ["mustn't", "needn't", 'must'], answer: 0, explain: 'mustn\'t 表示“禁止、不许”；危险的事禁止做。' },
    { type: 'choice', q: '—I often feel tired in class.<br>—You ___ go to bed earlier.', options: ['should', "mustn't", "can't"], answer: 0, explain: '给别人提建议“应该……”用 should。' },
    { type: 'choice', q: 'The lights are on. Mr. Li ___ be in his office.', options: ['must', "can't", "needn't"], answer: 0, explain: '灯亮着，有把握推测“一定在”，用 must；把握从大到小：must > may > can\'t。' }
  ],
  tests: [
    { type: 'choice', q: 'My little sister can ___ the piano.', options: ['play', 'plays', 'playing'], answer: 0, explain: '情态动词 can 后面用动词原形。' },
    { type: 'choice', q: '—___ I watch TV now, Mom?<br>—No, you must finish your homework first.', options: ['Must', 'May', 'Need'], answer: 1, explain: '请求许可用 May I...?' },
    { type: 'choice', q: "You ___ smoke here. It's dangerous.", options: ["mustn't", "needn't", "don't have to"], answer: 0, explain: '危险，所以是“禁止”，用 mustn\'t。' },
    { type: 'choice', q: '—Must we hand in the report today?<br>—No, you ___. You can hand it in tomorrow.', options: ["mustn't", "can't", "don't have to"], answer: 2, explain: '“明天交也行”，所以是“不必”，用 don\'t have to。' },
    { type: 'choice', q: 'Someone is knocking at the door. It ___ be Tom. He said he would come.', options: ['must', "can't", "needn't"], answer: 0, explain: '汤姆说过要来，推测“一定是”他，用 must。' },
    { type: 'choice', q: 'You look tired. You ___ go to bed early.', options: ['should', "shouldn't", "mustn't"], answer: 0, explain: '给建议：你应该早点睡，用 should。' },
    { type: 'fill', q: 'He ___ swim when he was five.（can 的过去式）', answer: ['could'], explain: 'when he was five 是过去，can 的过去式是 could。' },
    { type: 'fill', q: 'You should ___ more vegetables.（eat）', answer: ['eat'], explain: '情态动词 should 后面用动词原形。' },
    { type: 'choice', q: 'We must ___ quiet in the library.', options: ['be', 'are', 'being'], answer: 0, explain: '情态动词后面用动词原形，be 动词的原形是 be。' },
    { type: 'choice', q: 'Lucy ___ dance very well.', options: ['can', 'cans', 'can to'], answer: 0, explain: '情态动词没有人称变化，也不加 to。' },
    { type: 'fill', q: '改错：She cans speak French. 把错误的词改正后写出：___', answer: ['can'], explain: '情态动词没有三单形式，不能加 s。' },
    { type: 'fill', q: '改为否定句：I can swim.<br>→ I ___ swim.（填一个词）', answer: ["can't", 'cannot'], explain: '情态动词的否定直接加 not：cannot / can\'t。' },
    { type: 'choice', q: '把 He can ride a bike. 改为一般疑问句：', options: ['Can he ride a bike?', 'Does he can ride a bike?', 'Is he can ride a bike?'], answer: 0, explain: '疑问句把情态动词 can 提前，不需要 does / is。' },
    { type: 'choice', q: '—Can you speak English?<br>—Yes, I ___.', options: ['can', 'do', 'am'], answer: 0, explain: '用 can 提问，用 can 回答。' },
    { type: 'choice', q: '听句子，说话人的哥哥不会做什么？', say: "My brother can play the violin, but he can't swim.", options: ['游泳', '拉小提琴', '弹钢琴'], answer: 0, explain: 'can\'t swim 意思是“不会游泳”。' },
    { type: 'choice', q: '—Could I use your phone?<br>—Yes, you ___.', options: ['can', 'could', 'must'], answer: 0, explain: 'Could I...? 只是语气委婉，肯定回答用 can，不用 could。' },
    { type: 'fill', q: 'I ___ read when I was three.（用 can 的过去式的否定，填一个词）', answer: ["couldn't"], explain: 'when I was three 是过去，用 could 的否定 couldn\'t。' },
    { type: 'choice', q: '—May I borrow your bike?<br>—___', options: ['Sure. Here you are.', 'No, you may.', "Yes, you mustn't."], answer: 0, explain: 'May I...? 请求许可，同意时说 Sure. / Yes, you can.' },
    { type: 'fill', q: '—___ I come in?<br>—Yes, please.（填一个情态动词，首字母大写）', answer: ['May', 'Can', 'Could'], explain: '请求许可用 May / Can / Could I...?' },
    { type: 'choice', q: 'Take an umbrella with you. It ___ rain later.', options: ['may', "mustn't", "needn't"], answer: 0, explain: '“可能会下雨”，表示可能性用 may。' },
    { type: 'choice', q: 'We ___ obey the traffic rules.', options: ['must', "mustn't", "needn't"], answer: 0, explain: '遵守交通规则是“必须”的，用 must。' },
    { type: 'fill', q: 'I ___ finish my homework before nine. I want to watch the match.（必须，填一个词）', answer: ['must'], explain: '自己觉得必须做（主观），用 must。' },
    { type: 'fill', q: "You ___ play football on the road. It's dangerous.（填 must 的否定缩写）", answer: ["mustn't"], explain: '危险的事“禁止”做，用 mustn\'t。' },
    { type: 'choice', q: 'Look at the sign! You ___ park your car here.', options: ["mustn't", "needn't", "don't have to"], answer: 0, explain: '标志表示“禁止”，用 mustn\'t；needn\'t / don\'t have to 是“不必”。' },
    { type: 'choice', q: 'My father ___ get up early because his work starts at seven.', options: ['has to', 'have to', 'must to'], answer: 0, explain: '因为工作七点开始，“不得不”早起，用 have to；主语三单用 has to。' },
    { type: 'fill', q: 'We ___ ___ wear school uniforms on Mondays. It\'s the school rule.（不得不，填两个词）', answer: ['have to'], explain: '学校规定的是客观要求，用 have to。' },
    { type: 'fill', q: 'You ___ say sorry to her.（应该，填一个词）', answer: ['should'], explain: '给建议“应该”用 should。' },
    { type: 'choice', q: '—I have a headache.<br>—You ___ go to see a doctor.', options: ['should', "mustn't", "can't"], answer: 0, explain: '给对方建议，用 should。' },
    { type: 'fill', q: '—Must I hand in the homework now?<br>—Yes, you ___.（填一个词）', answer: ['must'], explain: 'Must 提问的肯定回答用 must。' },
    { type: 'choice', q: '听问题，选择正确的否定回答。', say: 'Must I clean my room now?', options: ["No, you needn't.", "No, you mustn't.", "No, you can't."], answer: 0, explain: 'Must I...? 的否定回答用 needn\'t（不必），mustn\'t 是“禁止”。' },
    { type: 'fill', q: '—Must I go now?<br>—No, you ___.（填一个词）', answer: ["needn't"], explain: 'Must 提问的否定回答用 needn\'t。' },
    { type: 'choice', q: 'She has so many books. She ___ love reading.', options: ['must', "can't", "needn't"], answer: 0, explain: '有那么多书，推测“一定”喜欢读书，用 must。' },
    { type: 'choice', q: "That ___ be Lily. She is in the classroom with me now.", options: ["can't", 'must', 'may'], answer: 0, explain: '莉莉正和我在教室里，所以那人“不可能”是她，用 can\'t。' }
  ]
},

/* ================= 八年级 ================= */
{
  id: 'g-present-perfect', title: '现在完成时', short: '现在完成时', module: 'tense', grade: 8, freq: 3,
  prereqs: ['g-past-simple'],
  tip: '中考必考：have been to / have gone to、for / since、短暂性动词不能接一段时间。',
  learn: [
    { h: '两种用法', html: `<p>结构：<b>have / has + 过去分词</b></p>
      <p>① 过去的动作<b>对现在有影响</b>：</p>
      <p class="ex">I have lost my key.<span class="zh">我把钥匙丢了。（现在没钥匙，进不了门）</span></p>
      <p>② 从过去<b>一直持续到现在</b>：</p>
      <p class="ex">I have lived here for five years.<span class="zh">我在这里住了五年了。（现在还住）</span></p>` },
    { h: '标志词', html: `<ul>
      <li><b>already</b>（已经，肯定句）、<b>yet</b>（否定句、疑问句末尾）</li>
      <li><b>ever</b>（曾经）、<b>never</b>（从未）、<b>just</b>（刚刚）、before、so far、recently</li>
      <li><b>for</b> + 一段时间：for three years</li>
      <li><b>since</b> + 过去的时间点：since 2015, since three years ago, since I came here</li></ul>
      <p class="warn">有具体过去时间（yesterday, ago, in 2020）时用一般过去时，不能用现在完成时。</p>` },
    { h: '常见过去分词', html: `<p class="small">go – went – gone, do – did – done, see – saw – seen, eat – ate – eaten, write – wrote – written, take – took – taken, be – was/were – been, buy – bought – bought, have – had – had, come – came – come, run – ran – run, give – gave – given, know – knew – known, speak – spoke – spoken, break – broke – broken, forget – forgot – forgotten</p>` },
    { h: 'been to / gone to / been in', html: `<ul>
      <li><b>have been to</b>：去过（已经回来了）</li>
      <li><b>have gone to</b>：去了（人还没回来）</li>
      <li><b>have been in</b>：在某地待了多久</li></ul>
      <p class="ex">Where is Jim? — He has gone to the library.<span class="zh">吉姆去图书馆了。（不在这里）</span></p>` },
    { h: '短暂性动词要转换', html: `<p>buy, borrow, die, leave, join 等动作一下就完成，不能和 for / since 连用，要换成表示状态的说法：</p>
      <p class="small">buy → have　borrow → keep　die → be dead　leave → be away　join → be in / be a member of　begin → be on　open → be open</p>
      <p class="ex">I have had this bike for three years.<span class="zh">这辆自行车我买了三年了。（不能用 have bought）</span></p>` }
  ],
  examples: [
    { type: 'choice', q: "—Where is Jim?<br>—He ___ to the library. He'll be back soon.", options: ['has been', 'has gone', 'goes'], answer: 1, explain: '人不在这里、还没回来，用 has gone to。' },
    { type: 'choice', q: 'I ___ this bike for three years.', options: ['have bought', 'have had', 'bought'], answer: 1, explain: 'buy 是短暂性动词，不能接 for three years，要换成 have had。' },
    { type: 'choice', q: "I can't open the door. I ___ my key.", options: ['have lost', 'lose', 'will lose'], answer: 0, explain: '“丢了钥匙”是过去的动作，对现在有影响（现在进不了门），用现在完成时 have + 过去分词。' },
    { type: 'fill', q: 'I ___ here for five years.（live，填两个词）', answer: ['have lived', "'ve lived"], explain: '从五年前一直住到现在，用现在完成时；for + 一段时间。' },
    { type: 'choice', q: '—Have you seen the film ___?<br>—Yes, I have ___ seen it.', options: ['yet; already', 'already; yet', 'yet; yet'], answer: 0, explain: 'yet 用在疑问句、否定句末尾；already 用在肯定句中。' },
    { type: 'choice', q: 'I have ___ been to Beijing. I really want to go there.', options: ['never', 'ever', 'already'], answer: 0, explain: '“很想去”说明从没去过，用 never（从未）。' },
    { type: 'choice', q: 'They have lived here ___ three years ago.', options: ['for', 'since', 'in'], answer: 1, explain: 'three years ago 是过去的时间点，用 since；也可以说 for three years。' },
    { type: 'fill', q: '写出 write 的过去分词：___', answer: ['written'], explain: 'write – wrote – written，属于不规则变化，要背熟。' },
    { type: 'choice', q: 'I have ___ Fuzhou for three years.', options: ['been to', 'gone to', 'been in'], answer: 2, explain: '在某地待了多久，用 have been in + 地点。' },
    { type: 'fill', q: 'She ___ ___ her homework.（finish，用现在完成时，填两个词）', answer: ['has finished'], explain: '现在完成时的结构是 have / has + 过去分词；主语 she 是三单，用 has；finish 的过去分词是 finished。' },
    { type: 'choice', q: 'I ___ the film with my parents last night.', options: ['saw', 'have seen', 'see'], answer: 0, explain: 'last night 是具体的过去时间，要用一般过去时 saw，不能用现在完成时。' },
    { type: 'choice', q: 'My parents have ___ to Wuyi Mountain twice. They came back last week.', options: ['been', 'gone', 'been in'], answer: 0, explain: '“去过”而且已经回来了，用 have been to；been in 后面不能再接 to。' }
  ],
  tests: [
    { type: 'fill', q: 'She ___ the Great Wall twice.（visit，用现在完成时，填两个词）', answer: ['has visited'], explain: '“去过两次”是到现在为止的经历，用现在完成时；she 用 has。' },
    { type: 'choice', q: '—Have you ever ___ to Xiamen?<br>—Yes, I went there last year.', options: ['gone', 'been', 'go'], answer: 1, explain: '“去过”而且已经回来了，用 have been to。' },
    { type: 'choice', q: 'My uncle has worked in this factory ___ 2015.', options: ['for', 'since', 'in'], answer: 1, explain: '2015 是过去时间点，用 since。' },
    { type: 'choice', q: 'I have known her ___ ten years.', options: ['since', 'for', 'ago'], answer: 1, explain: 'ten years 是一段时间，用 for。' },
    { type: 'choice', q: 'I ___ him last week.', options: ['have seen', 'saw', 'see'], answer: 1, explain: 'last week 是具体的过去时间，用一般过去时。' },
    { type: 'choice', q: 'The old man ___ for two years.', options: ['has died', 'has been dead', 'died'], answer: 1, explain: 'die 是短暂性动词，接 for two years 要换成 has been dead。' },
    { type: 'choice', q: '—Have you finished your homework ___?<br>—Not ___.', options: ['already; yet', 'yet; yet', 'yet; already'], answer: 1, explain: '疑问句和否定回答都用 yet：Not yet.' },
    { type: 'choice', q: 'He ___ already finished the work.', options: ['have', 'has', 'is'], answer: 1, explain: '现在完成时 have / has + 过去分词；主语 he 用 has。' },
    { type: 'fill', q: 'The students have just ___ the classroom.（clean）', answer: ['cleaned'], explain: '现在完成时：have + 过去分词；规则动词的过去分词和过去式一样，加 ed。' },
    { type: 'fill', q: 'Tom ___ his leg, so he can\'t play football now.（break，填两个词）', answer: ['has broken', "'s broken"], explain: '过去摔断了腿，对现在有影响（不能踢球），用现在完成时；break 的过去分词是 broken。' },
    { type: 'choice', q: '—Where is your bike?<br>—Sorry, I ___ it to Mike. He will give it back tomorrow.', options: ['have lent', 'lend', 'will lend'], answer: 0, explain: '自行车已经借出去，现在不在这里，用现在完成时 have lent。' },
    { type: 'fill', q: 'We ___ here since 2018.（live，填两个词）', answer: ['have lived', "'ve lived"], explain: 'since + 过去的时间点，动作一直持续到现在，用现在完成时。' },
    { type: 'choice', q: 'They ___ good friends for ten years.', options: ['are', 'have been', 'were'], answer: 1, explain: 'for ten years 表示持续到现在，用 have been。' },
    { type: 'fill', q: 'I have ___ cleaned my room.（已经，填一个词）', answer: ['already'], explain: '肯定句中“已经”用 already。' },
    { type: 'choice', q: "He hasn't come back ___.", options: ['already', 'yet', 'ever'], answer: 1, explain: '否定句末尾用 yet（还）。' },
    { type: 'choice', q: '—Have you ___ been to Beijing?<br>—Yes, twice.', options: ['ever', 'never', 'yet'], answer: 0, explain: '疑问句中“曾经”用 ever。' },
    { type: 'fill', q: "I have ___ eaten durian, so I don't know its taste.（从未，填一个词）", answer: ['never'], explain: '“从未吃过”用 never。' },
    { type: 'choice', q: 'Sit down, please. The class has ___ begun.', options: ['just', 'yet', 'ever'], answer: 0, explain: '“刚刚开始”用 just，放在 has 和过去分词之间。' },
    { type: 'choice', q: 'He has studied English ___ six years.', options: ['for', 'since', 'ago'], answer: 0, explain: 'six years 是一段时间，用 for。' },
    { type: 'fill', q: '用 for 或 since 填空：I have waited here ___ two hours.', answer: ['for'], explain: 'two hours 是一段时间，用 for。' },
    { type: 'fill', q: '用 for 或 since 填空：She has taught here ___ she came to Fuzhou.', answer: ['since'], explain: 'since 后面可以接一个过去时的句子，表示从那时起。' },
    { type: 'choice', q: 'They have been married ___ ten years ago.', options: ['for', 'since', 'in'], answer: 1, explain: 'ten years ago 是时间点，用 since。' },
    { type: 'choice', q: 'She ___ to Shanghai in 2020.', options: ['has gone', 'went', 'has been'], answer: 1, explain: 'in 2020 是具体的过去时间，用一般过去时。' },
    { type: 'fill', q: 'I ___ my homework an hour ago.（finish）', answer: ['finished'], explain: 'an hour ago 是具体的过去时间，用一般过去时，不能用现在完成时。' },
    { type: 'choice', q: '—When ___ you ___ your new phone?<br>—Last Monday.', options: ['did; buy', 'have; bought', 'do; buy'], answer: 0, explain: '问具体什么时候、答语是 Last Monday，用一般过去时；when 问句一般不用现在完成时。' },
    { type: 'fill', q: '写出 eat 的过去分词：___', answer: ['eaten'], explain: 'eat – ate – eaten。' },
    { type: 'choice', q: '下面哪个是 speak 的过去分词？', options: ['spoke', 'spoken', 'speaked'], answer: 1, explain: 'speak – spoke – spoken；spoke 是过去式。' },
    { type: 'fill', q: 'I have ___ my homework.（do）', answer: ['done'], explain: 'do – did – done，have 后面用过去分词 done。' },
    { type: 'fill', q: 'I have ___ to Hangzhou twice.（been / gone）', answer: ['been'], explain: '“去过两次”，人已经回来，用 have been to。' },
    { type: 'choice', q: '听句子，选出正确的理解。', say: 'My parents have been to Japan.', options: ['我父母去过日本（现在已回来）。', '我父母去日本了（还没回来）。', '我父母在日本待了很久。'], answer: 0, explain: 'have been to 表示“去过”，人已经回来了。' },
    { type: 'choice', q: '—Where is your father?<br>—He has ___ to Shanghai on business.', options: ['been', 'gone', 'been in'], answer: 1, explain: '父亲不在这里，去了上海还没回来，用 has gone to。' },
    { type: 'fill', q: "Mr. Li isn't in the office. He has ___ to the meeting room.（been / gone）", answer: ['gone'], explain: '人不在这里，用 has gone to。' },
    { type: 'fill', q: 'How long have you ___ in this city?（been / gone）', answer: ['been'], explain: '在某地待了多久用 have been in，不能用 gone。' },
    { type: 'choice', q: 'My aunt ___ Xiamen since 2019.', options: ['has been in', 'has gone to', 'has been to'], answer: 0, explain: 'since 2019 表示“待了多久”，用 has been in。' },
    { type: 'fill', q: 'He has ___ ___ the club for two years.（join，换成表示状态的说法，填两个词）', answer: ['been in'], explain: 'join 是短暂性动词，不能和 for 连用，换成 be in：has been in the club。' },
    { type: 'choice', q: 'I ___ the book for two weeks. I must return it today.', options: ['have borrowed', 'have kept', 'borrowed'], answer: 1, explain: 'borrow 是短暂性动词，接 for two weeks 要换成 keep：have kept。' },
    { type: 'choice', q: 'Tom ___ for an hour.', options: ['has left', 'has been away', 'left'], answer: 1, explain: 'leave 是短暂性动词，接 for an hour 要换成 be away：has been away。' }
  ]
},

/* ================= 九年级 ================= */
{
  id: 'g-passive', title: '被动语态', short: '被动语态', module: 'tense', grade: 9, freq: 3,
  prereqs: ['g-past-simple', 'g-future', 'g-modal'],
  tip: '中考必考：判断主语是不是“动作的承受者”，再选对时态；happen / take place 没有被动。',
  learn: [
    { h: '什么时候用', html: `<p>主语是动作的<b>承受者</b>时用被动语态。结构：<b>be + 过去分词</b>（+ by + 动作执行者）</p>
      <p class="ex">English is spoken in many countries.<span class="zh">许多国家说英语。（英语是“被说”）</span></p>` },
    { h: '各种时态的被动', html: `<table class="tbl"><tr><th>时态</th><th>结构</th><th>例句</th></tr>
      <tr><td>一般现在时</td><td>am/is/are + done</td><td>The classroom is cleaned every day.</td></tr>
      <tr><td>一般过去时</td><td>was/were + done</td><td>The bridge was built in 2010.</td></tr>
      <tr><td>一般将来时</td><td>will be + done</td><td>A new library will be built next year.</td></tr>
      <tr><td>含情态动词</td><td>can/must/should be + done</td><td>Rubbish should be put into the bin.</td></tr>
      <tr><td>现在完成时</td><td>have/has been + done</td><td>The work has been finished.</td></tr></table>` },
    { h: '主动变被动三步走', html: `<ol><li>把主动句的<b>宾语</b>变成主语</li><li>谓语变成 <b>be + 过去分词</b>，时态不变</li><li>原来的主语放到 by 后面（不重要可以省略）</li></ol>
      <p class="ex">They clean the classroom every day. → The classroom is cleaned every day.<span class="zh">他们每天打扫教室。→ 教室每天被打扫。</span></p>` },
    { h: '易错点', html: `<ul>
      <li><b>happen, take place, belong to</b> 没有被动语态：The accident happened last night.</li>
      <li><b>be made of</b>：看得出原材料（The desk is made of wood.）<br><b>be made from</b>：看不出原材料（Paper is made from wood.）<br><b>be made in</b>：在某地制造</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'The Great Wall ___ by many people every year.', options: ['visits', 'is visited', 'visited'], answer: 1, explain: '长城是“被参观”，every year 用一般现在时的被动：is visited。' },
    { type: 'choice', q: 'A lot of trees ___ in our city last year.', options: ['planted', 'were planted', 'are planted'], answer: 1, explain: '树是“被种”，last year 用过去时的被动：were planted。' },
    { type: 'choice', q: 'A new road ___ in our village next year.', options: ['will build', 'will be built', 'built'], answer: 1, explain: '路是“被修建”，next year 用将来时的被动：will be + 过去分词。' },
    { type: 'choice', q: 'Rubbish should ___ into the bin.', options: ['put', 'be put', 'is put'], answer: 1, explain: '垃圾是“被放”，含情态动词的被动：should be + 过去分词。' },
    { type: 'fill', q: 'The work has already ___ ___.（finish，填两个词）', answer: ['been finished'], explain: '现在完成时的被动：has been + 过去分词。' },
    { type: 'fill', q: '改为被动：Tom wrote this letter.<br>→ This letter ___ ___ by Tom.（填两个词）', answer: ['was written'], explain: '三步走：宾语 this letter 做主语；wrote 是过去时，变成 was + 过去分词 written；Tom 放到 by 后面。' },
    { type: 'choice', q: 'The meeting ___ in the hall tomorrow afternoon.', options: ['will take place', 'will be taken place', 'is taken place'], answer: 0, explain: 'take place（发生、举行）没有被动语态。' },
    { type: 'choice', q: 'The desk is made ___ wood.', options: ['of', 'from', 'in'], answer: 0, explain: '从桌子上看得出木头，用 be made of。' },
    { type: 'choice', q: 'This toy car is made ___ China.', options: ['of', 'from', 'in'], answer: 2, explain: '在某地制造用 be made in。' },
    { type: 'choice', q: 'Paper is made ___ wood.', options: ['of', 'from', 'in'], answer: 1, explain: '从纸上看不出木头的样子，用 be made from。' },
    { type: 'choice', q: 'The song was written ___ a 15-year-old girl.', options: ['by', 'with', 'from'], answer: 0, explain: '歌是“被写”的，主语 the song 是动作的承受者，用被动；动作的执行者放在 by 后面。' }
  ],
  tests: [
    { type: 'choice', q: 'English ___ in many countries.', options: ['speaks', 'is spoken', 'spoke'], answer: 1, explain: '英语是“被说”，用一般现在时的被动。' },
    { type: 'fill', q: 'The window ___ by Tom yesterday.（break，填两个词）', answer: ['was broken'], explain: '窗户“被打破”，yesterday 用过去时的被动：was broken。' },
    { type: 'choice', q: 'The homework must ___ on time.', options: ['hand in', 'be handed in', 'handed in'], answer: 1, explain: '作业“被上交”，情态动词的被动：must be + 过去分词。' },
    { type: 'choice', q: 'The football match ___ on TV tonight.', options: ['will show', 'will be shown', 'was shown'], answer: 1, explain: '比赛是“被播放”，tonight 表将来，用将来时的被动：will be shown。' },
    { type: 'choice', q: 'The car accident ___ last night.', options: ['happened', 'was happened', 'is happened'], answer: 0, explain: 'happen 没有被动语态。' },
    { type: 'choice', q: 'This kind of paper ___ wood.', options: ['is made of', 'is made from', 'makes from'], answer: 1, explain: '从纸上看不出木头，用 be made from。' },
    { type: 'fill', q: '改为被动：They clean the classroom every day.<br>→ The classroom ___ every day.（填两个词）', answer: ['is cleaned'], explain: '一般现在时的被动：is + 过去分词。' },
    { type: 'choice', q: 'This picture was drawn ___ my little sister.', options: ['by', 'with', 'for'], answer: 0, explain: '被动语态里动作的执行者放在 by 后面。' },
    { type: 'choice', q: '下面哪句的主语是动作的承受者，要用被动语态？', options: ['The cake ___ (eat) by the children.', 'The children ___ (eat) the cake.', 'The children ___ (like) cakes.'], answer: 0, explain: '蛋糕是“被吃”的，主语是动作的承受者，要用被动语态。' },
    { type: 'fill', q: 'Rice ___ ___ in the south of China.（grow，一般现在时，填两个词）', answer: ['is grown'], explain: '水稻是“被种植”，一般现在时的被动 is + 过去分词 grown。' },
    { type: 'choice', q: 'These books ___ by many students.', options: ['are read', 'is read', 'read'], answer: 0, explain: '书是“被读”，主语 these books 是复数，用 are read。' },
    { type: 'fill', q: 'This bridge ___ ___ in 2010.（build，填两个词）', answer: ['was built'], explain: '桥是“被建”，in 2010 是过去，用 was built。' },
    { type: 'choice', q: 'The photos ___ by my father last week.', options: ['were taken', 'are taken', 'took'], answer: 0, explain: '照片是“被拍”，last week 是过去，主语复数，用 were taken。' },
    { type: 'fill', q: 'The sports meeting ___ ___ ___ next week.（hold，填三个词）', answer: ['will be held'], explain: '运动会是“被举办”，next week 用将来时的被动：will be held。' },
    { type: 'choice', q: 'More trees ___ next spring.', options: ['will plant', 'will be planted', 'were planted'], answer: 1, explain: '树是“被种”，next spring 用将来时的被动。' },
    { type: 'fill', q: 'Library books should ___ ___ on time.（return，填两个词）', answer: ['be returned'], explain: '书是“被归还”，情态动词的被动：should be + 过去分词 returned。' },
    { type: 'choice', q: "Young children can't ___ alone at home.", options: ['be left', 'leave', 'left'], answer: 0, explain: '小孩是“被留下”，can\'t be + 过去分词。' },
    { type: 'choice', q: 'Many trees ___ in our school since last year.', options: ['have been planted', 'were planted', 'are planted'], answer: 0, explain: 'since last year 用现在完成时；树是“被种”，用 have been + 过去分词。' },
    { type: 'fill', q: 'The letter has ___ ___ already.（send，填两个词）', answer: ['been sent'], explain: '现在完成时的被动：has been + 过去分词 sent。' },
    { type: 'fill', q: '改为被动：Tom cleaned the room.<br>→ The room ___ ___ by Tom.（填两个词）', answer: ['was cleaned'], explain: '原句是过去时，被动用 was + 过去分词 cleaned。' },
    { type: 'choice', q: '改为被动：They will build a new hospital.<br>→ A new hospital ___.', options: ['will be built', 'will built', 'is built'], answer: 0, explain: '时态不变，将来时的被动是 will be + 过去分词。' },
    { type: 'choice', q: 'The book ___ to me.', options: ['belongs', 'is belonged', 'was belonged'], answer: 0, explain: 'belong to 没有被动语态。' },
    { type: 'fill', q: 'The 2008 Olympic Games ___ ___ in Beijing.（take place，填两个词）', answer: ['took place'], explain: 'take place 没有被动语态，2008 年是过去，用 took place。' },
    { type: 'choice', q: 'The bag ___ leather.', options: ['is made of', 'is made from', 'is made in'], answer: 0, explain: '从皮包上看得出皮革，用 be made of。' },
    { type: 'fill', q: 'This kite is made ___ paper.（填 of 或 from）', answer: ['of'], explain: '风筝上看得出纸，用 of。' },
    { type: 'fill', q: 'Wine is made ___ grapes.（填 of 或 from）', answer: ['from'], explain: '从酒里看不出葡萄的样子，用 from。' },
    { type: 'choice', q: 'Cheese ___ milk.', options: ['is made of', 'is made from', 'is made in'], answer: 1, explain: '奶酪里看不出牛奶的样子，用 be made from。' },
    { type: 'fill', q: 'My watch was made ___ Switzerland.（填一个介词）', answer: ['in'], explain: '在某地制造用 be made in。' },
    { type: 'choice', q: '—Where was your phone made?<br>—It was made ___ Shenzhen.', options: ['in', 'of', 'from'], answer: 0, explain: '问产地，回答用 be made in + 地点。' }
  ]
},

{
  id: 'g-object-clause', title: '宾语从句', short: '宾语从句', module: 'syntax', grade: 9, freq: 3,
  prereqs: ['g-past-simple', 'g-future', 'g-wh-q', 'g-yes-no-q'],
  tip: '中考必考：Could you tell me ...? 题型。记住三要素：引导词、陈述语序、时态。',
  learn: [
    { h: '什么是宾语从句', html: `<p>一个句子放在动词后面当宾语，就是宾语从句。</p>
      <p class="ex">I know that he is a doctor.<span class="zh">我知道他是一名医生。</span></p>` },
    { h: '要素一：引导词', html: `<table class="tbl"><tr><th>从句原来是</th><th>引导词</th><th>例句</th></tr>
      <tr><td>陈述句</td><td>that（可省略）</td><td>I think (that) he is right.</td></tr>
      <tr><td>一般疑问句</td><td>if / whether（是否）</td><td>I don't know if he will come.</td></tr>
      <tr><td>特殊疑问句</td><td>原来的疑问词</td><td>Do you know where she lives?</td></tr></table>` },
    { h: '要素二：陈述语序（最常考）', html: `<p>从句一律用 <b>主语 + 谓语</b> 的顺序，不能用疑问句语序。</p>
      <p class="ex">Can you tell me where the station is?<span class="zh">你能告诉我车站在哪儿吗？</span></p>
      <p class="warn">where is the station ✗ —— 在宾语从句里要写成 where the station is</p>` },
    { h: '要素三：时态', html: `<ul>
      <li>主句是现在时或将来时 → 从句按实际需要用任何时态</li>
      <li>主句是过去时 → 从句用相应的过去时态（will → would）</li>
      <li>客观真理 → 永远用一般现在时</li></ul>
      <p class="ex">He said that he would go to Beijing the next day.<span class="zh">他说他第二天要去北京。</span></p>
      <p class="ex">Our teacher told us that light travels faster than sound.<span class="zh">老师告诉我们光比声音传播得快。</span></p>
      <p class="warn">Could you tell me ...? 里的 could 只是表示委婉，不是过去时，不影响从句时态。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'Excuse me. Could you tell me ___? I want to send a letter.', options: ['where is the post office', 'where the post office is', 'where was the post office'], answer: 1, explain: '宾语从句用陈述语序；could 表委婉，不影响时态。' },
    { type: 'choice', q: "I don't know ___ he will come tomorrow. If he comes, I'll tell you.", options: ['that', 'if', 'what'], answer: 1, explain: '“是否会来”，用 if。' },
    { type: 'choice', q: 'I believe he will win the game. 句中的宾语从句是：', options: ['he will win the game', 'I believe', 'believe he'], answer: 0, explain: '整个句子 he will win the game 放在动词 believe 后面当宾语，就是宾语从句（前面省略了 that）。' },
    { type: 'choice', q: 'I think ___ English is very useful.', options: ['that', 'if', 'what'], answer: 0, explain: '从句原来是陈述句“英语很有用”，用 that 引导（that 可以省略）。' },
    { type: 'choice', q: '—Do you know ___ she likes?<br>—Chinese food.', options: ['what', 'who', 'where'], answer: 0, explain: '从句原来是特殊疑问句 What does she like?，用原来的疑问词 what 引导，并改成陈述语序。' },
    { type: 'choice', q: "I don't know ___ next week.", options: ['what he will do', 'what will he do', 'what he did'], answer: 0, explain: '主句是现在时，从句按实际需要用时态：next week 用将来时；语序用陈述语序。' },
    { type: 'choice', q: 'She asked me ___.', options: ['where I lived', 'where do I live', 'where I will live'], answer: 0, explain: '主句 asked 是过去时，从句用相应的过去时态，并用陈述语序。' },
    { type: 'choice', q: 'The teacher told us that the earth ___ around the sun.', options: ['goes', 'went', 'would go'], answer: 0, explain: '地球绕太阳转是客观真理，不管主句是什么时态，从句都用一般现在时。' },
    { type: 'choice', q: 'Tom said he ___ visit his aunt the next week.', options: ['would', 'will', 'can'], answer: 0, explain: '主句 said 是过去时，从句里的 will 要变成 would。' },
    { type: 'choice', q: 'Could you tell me when the train ___?', options: ['leaves', 'left', 'would leave'], answer: 0, explain: 'Could you tell me...? 里的 could 只是表示委婉，不是过去时；问的是火车（按时刻表）几点开，从句用一般现在时。' },
    { type: 'fill', q: '合并句子：Where is the bookstore? Can you tell me?<br>→ Can you tell me where ___ ___ ___?（填三个词）', answer: ['the bookstore is'], explain: '宾语从句用陈述语序：主语 the bookstore + 谓语 is。' }
  ],
  tests: [
    { type: 'choice', q: '—Do you know ___ the meeting will begin?<br>—At 3 p.m.', options: ['when', 'what', 'who'], answer: 0, explain: '回答是时间，用 when。' },
    { type: 'choice', q: 'Can you tell me ___?', options: ['how I can get to the museum', 'how can I get to the museum', 'how could I get to the museum'], answer: 0, explain: '宾语从句用陈述语序：how I can get to...' },
    { type: 'choice', q: 'He said that he ___ to Beijing the next day.', options: ['will go', 'would go', 'goes'], answer: 1, explain: '主句 said 是过去时，从句的 will 变成 would。' },
    { type: 'choice', q: 'Our teacher told us that light ___ faster than sound.', options: ['travels', 'traveled', 'would travel'], answer: 0, explain: '客观真理永远用一般现在时。' },
    { type: 'choice', q: "—I wonder ___ the museum is open on Mondays.<br>—Let's check online.", options: ['that', 'if', 'what'], answer: 1, explain: '“是否开放”，用 if。' },
    { type: 'choice', q: '—Do you know ___?<br>—She is a teacher.', options: ['what does she do', 'what she does', 'what she did'], answer: 1, explain: '陈述语序 what she does；回答用现在时，所以从句也用现在时。' },
    { type: 'choice', q: 'Could you tell me ___ yesterday?', options: ['why you were late', 'why were you late', 'why are you late'], answer: 0, explain: '陈述语序；yesterday 是过去，用 were。' },
    { type: 'choice', q: '下面哪句含有宾语从句？', options: ['I know that he is a doctor.', 'He is a doctor.', 'Is he a doctor?'], answer: 0, explain: 'that he is a doctor 放在动词 know 后面当宾语，是宾语从句。' },
    { type: 'choice', q: 'Tom said he was hungry. 句中的宾语从句是：', options: ['he was hungry', 'Tom said', 'said he'], answer: 0, explain: 'he was hungry 是一个完整的句子，放在动词 said 后面当宾语（省略了 that）。' },
    { type: 'fill', q: 'I hope ___ you can come to my party.（填一个引导词）', answer: ['that'], explain: '从句原来是陈述句，用 that 引导。' },
    { type: 'choice', q: 'She says ___ she likes music very much.', options: ['that', 'if', 'what'], answer: 0, explain: '从句是陈述句“她很喜欢音乐”，用 that。' },
    { type: 'fill', q: 'I wonder ___ he likes the gift.（是否，填一个词）', answer: ['if', 'whether'], explain: '从句原来是一般疑问句 Does he like the gift?，用 if / whether 引导。' },
    { type: 'choice', q: 'Please ask him ___ he can go with us.', options: ['if', 'that', 'what'], answer: 0, explain: '“他是否能和我们去”，用 if。' },
    { type: 'choice', q: 'Do you know ___ is singing in the room?', options: ['who', 'what', 'where'], answer: 0, explain: '问“谁”在唱歌，用疑问词 who（who 本身做从句的主语）。' },
    { type: 'fill', q: '—Can you tell me ___ you were born?<br>—In 2012.（填一个疑问词）', answer: ['when'], explain: '回答是时间，用 when。' },
    { type: 'choice', q: '—I wonder ___ he is waiting for.<br>—Maybe his sister.', options: ['who', 'where', 'when'], answer: 0, explain: '回答是人（他姐姐），用 who。' },
    { type: 'fill', q: '合并句子：Where does he live? I want to know.<br>→ I want to know where ___ ___.（填两个词）', answer: ['he lives'], explain: '宾语从句用陈述语序，去掉 does，动词变成三单 lives。' },
    { type: 'choice', q: 'Could you tell me ___?', options: ['what time it is now', 'what time is it now', 'what time was it now'], answer: 0, explain: '陈述语序；could 表委婉，不影响从句时态，now 用现在时。' },
    { type: 'choice', q: '听问题，选出与问句意思相同的一项。', say: 'Can you tell me where the nearest bank is?', options: ['你能告诉我最近的银行在哪儿吗？', '你能告诉我银行什么时候开门吗？', '你能告诉我银行是否很近吗？'], answer: 0, explain: 'where the nearest bank is 意思是“最近的银行在哪儿”，宾语从句用陈述语序。' },
    { type: 'choice', q: "I don't know if he ___ tomorrow.", options: ['comes', 'will come', 'came'], answer: 1, explain: '这里 if 意思是“是否”，引导宾语从句，不是条件状语从句，不用“主将从现”；tomorrow 用将来时。' },
    { type: 'choice', q: 'Do you know when he ___ back last night?', options: ['comes', 'came', 'will come'], answer: 1, explain: '主句是现在时，从句按实际需要：last night 用一般过去时。' },
    { type: 'fill', q: 'She said she ___ busy then.（be）', answer: ['was'], explain: '主句 said 是过去时，从句用相应的过去时态：was。' },
    { type: 'choice', q: 'He asked me what I ___ for breakfast.', options: ['have', 'had', 'will have'], answer: 1, explain: '主句 asked 是过去时，从句用相应的过去时态 had。' },
    { type: 'fill', q: 'My father told me that practice ___ perfect.（make）', answer: ['makes'], explain: '“熟能生巧”是真理，从句用一般现在时；practice 看作三单，加 s。' },
    { type: 'choice', q: 'Could you tell me where the bank ___?', options: ['is', 'was', 'were'], answer: 0, explain: 'could 只是表示委婉，不是过去时，银行现在在哪里，用 is。' },
    { type: 'choice', q: 'Could you tell me what he ___ now?', options: ['is doing', 'was doing', 'did'], answer: 0, explain: 'could 不影响从句时态；now 用现在进行时。' }
  ]
}

);
