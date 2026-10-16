// 第 2 阶段：A 组
KG.nodes.push(

/* ================= 四年级 ================= */
{
  id: 'g-article', title: '冠词 a / an / the', short: '冠词', module: 'morph', grade: 4, freq: 3,
  prereqs: ['g-plural'],
  tip: 'a / an 看读音不看字母（an hour, a useful book）；乐器前用 the，球类、三餐、学科前不用冠词，是完形和短文填空的常见陷阱。',
  learn: [
    { h: 'a 还是 an', html: `<p>a / an 都表示“一个”，后面接<b>可数名词单数</b>。选哪个，要看后面那个词的<b>第一个音</b>，不是看第一个字母！</p>
      <ul><li>元音开头用 <b>an</b>：an apple, an egg, an orange, an old man, an interesting story</li>
      <li>辅音开头用 <b>a</b>：a book, a big apple, a cat</li></ul>
      <div class="rhyme">a / an 看读音，元音前面用 an；<br>hour、honest 用 an（h 不发音），<br>useful、uniform 用 a（u 读 /ju:/）。</div>
      <p class="ex">It takes me an hour to finish my homework.<span class="zh">我写完作业要花一个小时。</span></p>
      <p class="ex">This is a useful book.<span class="zh">这是一本有用的书。</span></p>
      <p class="warn">a / an 后面有形容词时，看形容词的读音：an apple，但 a big apple；a man，但 an old man。</p>` },
    { h: 'the 什么时候用', html: `<ul>
      <li><b>特指</b>，或者<b>第二次提到</b>同一个东西</li>
      <li>世界上<b>独一无二</b>的东西：the sun, the moon, the earth, the sky</li>
      <li><b>乐器</b>前：play the piano, play the violin</li>
      <li>序数词、最高级前：the first, the tallest</li>
      <li>方位：in the east, on the left</li></ul>
      <p class="ex">I have a dog. The dog is very cute.<span class="zh">我有一只狗。这只狗很可爱。</span></p>
      <p class="ex">The sun rises in the east.<span class="zh">太阳从东方升起。</span></p>` },
    { h: '不用冠词的情况', html: `<ul>
      <li><b>球类、棋类</b>：play football, play basketball, play chess</li>
      <li><b>三餐</b>：have breakfast / lunch / dinner</li>
      <li><b>学科</b>：I like English and math.</li>
      <li><b>星期、月份、季节</b>：on Monday, in May, in spring</li>
      <li><b>by + 交通工具</b>：by bus, by bike</li>
      <li>固定搭配：at home, go to school, go to bed, at night</li></ul>
      <div class="rhyme">乐器要加 the，球类不用加；<br>三餐学科和星期，统统不要冠词它。</div>
      <p class="ex">I play football after school, and my sister plays the piano.<span class="zh">我放学后踢足球，我妹妹弹钢琴。</span></p>
      <p class="warn">三餐前有形容词修饰时可以用 a：We had a big dinner.（我们吃了一顿丰盛的晚餐。）</p>` }
  ],
  examples: [
    { type: 'choice', q: 'He is ___ honest boy.', options: ['a', 'an', 'the'], answer: 1, explain: 'honest 的 h 不发音，第一个音是元音，用 an。' },
    { type: 'choice', q: 'My sister likes playing ___ piano, and I like playing ___ football.', options: ['the; /', '/; the', 'the; the'], answer: 0, explain: '乐器前用 the，球类前不用冠词（/ 表示不填）。' },
    { type: 'choice', q: 'I saw ___ elephant in the zoo. ___ elephant was very big.', options: ['an; The', 'a; The', 'an; An'], answer: 0, explain: 'elephant 元音开头，第一次提到用 an；第二次提到同一头大象用 The。' },
    { type: 'choice', q: 'I want to eat ___ apple, but there is only ___ big apple on the plate.', options: ['an; a', 'a; an', 'an; an'], answer: 0, explain: 'apple 以元音开头，用 an；但 big apple 要看形容词 big 的读音，b 是辅音，所以用 a。a / an 只看紧跟在后面的那个词。' },
    { type: 'choice', q: 'My cousin is ___ university student.', options: ['a', 'an', '/'], answer: 0, explain: 'university 虽然以字母 u 开头，但 u 读 /ju:/，第一个音是辅音 /j/，所以用 a。“一名大学生”是可数名词单数，不能不加冠词。' },
    { type: 'choice', q: '___ moon goes round ___ earth.', options: ['The; the', 'A; the', 'The; an'], answer: 0, explain: '月亮和地球都是世界上独一无二的东西，前面都用 the。' },
    { type: 'choice', q: 'Tom is ___ tallest boy in our class, and he is always ___ first to come to school.', options: ['the; the', 'a; the', '/; the'], answer: 0, explain: '最高级 tallest 前用 the；序数词 first 前也用 the。' },
    { type: 'choice', q: 'Beijing is in ___ north of China. Go along the road, and you can see the bank on ___ left.', options: ['the; the', '/; the', 'a; the'], answer: 0, explain: '表示方位：in the north（在北部）、on the left（在左边），前面都要用 the。' },
    { type: 'choice', q: 'My favourite subject is ___ math.', options: ['a', 'the', '/'], answer: 2, explain: '学科名称前不用冠词：English, math, science 都直接用。' },
    { type: 'choice', q: 'We often go to the park ___ bus in ___ spring.', options: ['by; /', 'by a; the', 'by the; /'], answer: 0, explain: 'by + 交通工具中间不加冠词：by bus；季节前一般也不用冠词：in spring。' },
    { type: 'choice', q: "It's ten o'clock. Mum tells me to go to ___ bed.", options: ['a', 'the', '/'], answer: 2, explain: 'go to bed（上床睡觉）是固定搭配，不用冠词。同类的还有 go to school, at home, at night。' },
    { type: 'choice', q: 'We usually have ___ dinner at six. Last Sunday we had ___ big dinner at Grandma\'s.', options: ['/; a', 'a; a', 'the; /'], answer: 0, explain: '三餐前一般不用冠词：have dinner；但前面有形容词 big 修饰，表示“一顿丰盛的晚餐”时，可以用 a：a big dinner。' },
    { type: 'choice', q: 'There is ___ orange on the table.', options: ['a', 'an', '/'], answer: 1, explain: 'orange 的第一个音是元音，用 an；orange 在这里是可数名词单数（一个橙子），不能不加冠词。' },
    { type: 'choice', q: 'Lily, can you pass me ___ salt on the table, please?', options: ['a', 'the', '/'], answer: 1, explain: '说的是桌上那瓶盐，说话双方都知道是哪一个，是特指，用 the。' },
    { type: 'choice', q: 'Lily can play ___ guitar very well.', options: ['a', 'the', '/'], answer: 1, explain: 'guitar 是乐器，“弹吉他”要说 play the guitar。' },
    { type: 'choice', q: 'The girls are playing ___ volleyball on the playground.', options: ['a', 'the', '/'], answer: 2, explain: 'volleyball 是球类运动，“打排球”是 play volleyball，不加冠词。' },
    { type: 'choice', q: 'We have no classes on ___ Saturday.', options: ['a', 'the', '/'], answer: 2, explain: '星期前不用冠词：on Saturday；月份、季节前也一样（in May, in spring）。' }
  ],
  tests: [
    { type: 'choice', q: 'It takes me ___ hour to get to school.', options: ['a', 'an', 'the'], answer: 1, explain: 'hour 的 h 不发音，以元音开头，用 an。' },
    { type: 'choice', q: 'This is ___ useful book.', options: ['a', 'an', '/'], answer: 0, explain: 'useful 的 u 读 /ju:/，是辅音开头，用 a；book 是可数名词单数，不能不加冠词。' },
    { type: 'fill', q: '___ sun rises in the east.（填冠词，首字母大写）', answer: ['The'], explain: '太阳是世界上独一无二的，前面用 the。' },
    { type: 'choice', q: 'We have ___ breakfast at seven every day.', options: ['a', 'the', '/'], answer: 2, explain: '三餐前一般不用冠词：have breakfast。' },
    { type: 'choice', q: '—What can you play?<br>—I can play ___ violin.', options: ['the', '/', 'an'], answer: 0, explain: '乐器前要用 the：play the violin。' },
    { type: 'fill', q: 'There is ___ old man under the tree.（填 a 或 an）', answer: ['an'], explain: 'old 以元音开头，用 an。' },
    { type: 'choice', q: 'I bought a dictionary yesterday. ___ dictionary cost me fifty yuan.', options: ['A', 'The', 'An'], answer: 1, explain: '第二次提到同一本词典，用 the 特指。' },
    { type: 'choice', q: 'I have ___ egg and ___ banana for breakfast.', options: ['an; a', 'a; an', 'an; an'], answer: 0, explain: 'egg 以元音开头用 an；banana 以辅音开头用 a。' },
    { type: 'fill', q: '改错：She is a English teacher. 句中冠词用错了，写出正确的冠词。', answer: ['an'], explain: 'English 以元音 /ɪ/ 开头，前面要用 an：an English teacher。' },
    { type: 'choice', q: 'We waited for half ___ hour at the bus stop.', options: ['a', 'an', 'the'], answer: 1, explain: 'hour 的 h 不发音，第一个音是元音，用 an：half an hour（半小时）。' },
    { type: 'fill', q: 'My father works eight hours a day. He has ___ hour for lunch.（填 a 或 an）', answer: ['an'], explain: 'hour 的 h 不发音，以元音开头，用 an。' },
    { type: 'choice', q: 'Every student in our school has ___ uniform.', options: ['a', 'an', '/'], answer: 0, explain: 'uniform 的 u 读 /ju:/，是辅音开头，用 a。' },
    { type: 'choice', q: 'He is ___ university student, and his sister is ___ English teacher.', options: ['a; an', 'an; a', 'an; an'], answer: 0, explain: 'university 的 u 读 /ju:/，用 a；English 以元音开头，用 an。不能只看字母 u。' },
    { type: 'choice', q: 'Mum bought ___ new umbrella for me.', options: ['a', 'an', '/'], answer: 0, explain: '冠词看紧跟着的词：new 以辅音 /n/ 开头，所以用 a，虽然后面的 umbrella 是元音开头。' },
    { type: 'fill', q: 'He ate ___ big apple after lunch.（填 a 或 an）', answer: ['a'], explain: 'big 以辅音开头，用 a；只有 apple 直接跟在后面时才用 an。' },
    { type: 'fill', q: 'There is a cat under the tree. ___ cat is black and white.（填冠词，首字母大写）', answer: ['The'], explain: '第二次提到同一只猫，用 the 特指。' },
    { type: 'choice', q: "Please close ___ door. It's cold in here.", options: ['a', 'the', '/'], answer: 1, explain: '说的是这个房间的那扇门，双方都知道是哪一扇，是特指，用 the。' },
    { type: 'choice', q: 'There are many stars in ___ sky tonight.', options: ['a', 'the', '/'], answer: 1, explain: '天空是独一无二的，用 the sky。' },
    { type: 'fill', q: '改错：My brother plays piano very well. 句中缺了一个词，写出这个词。', answer: ['the'], explain: '乐器前要加 the：play the piano。' },
    { type: 'choice', q: '—Can your sister play ___ erhu?<br>—Yes, she can. She plays it very well.', options: ['the', 'an', '/'], answer: 0, explain: '二胡是乐器，乐器前用 the：play the erhu。' },
    { type: 'choice', q: 'Lily is ___ youngest in her family.', options: ['a', 'the', '/'], answer: 1, explain: '最高级前要用 the：the youngest。' },
    { type: 'fill', q: 'Today is ___ first day of the new term.（填冠词）', answer: ['the'], explain: '序数词 first 前一般用 the。' },
    { type: 'choice', q: 'The sun sets in ___ west.', options: ['a', 'the', '/'], answer: 1, explain: '表示方位“在西方”：in the west，要用 the。' },
    { type: 'fill', q: 'Walk along this road, and the library is on ___ left.（填冠词）', answer: ['the'], explain: '“在左边”是 on the left，方位前用 the。' },
    { type: 'choice', q: 'The boys are playing ___ basketball on the playground.', options: ['a', 'the', '/'], answer: 2, explain: '球类运动前不用冠词：play basketball。' },
    { type: 'choice', q: "—Let's play ___ chess.<br>—Good idea!", options: ['a', 'the', '/'], answer: 2, explain: '棋类和球类一样，前面不用冠词：play chess。' },
    { type: 'fill', q: "改错：Let's play the football after school. 句中多了一个词，写出这个多余的词。", answer: ['the'], explain: '球类前不用冠词，应该是 play football，去掉 the。' },
    { type: 'choice', q: 'What time do you have ___ lunch?', options: ['a', 'the', '/'], answer: 2, explain: '三餐前一般不用冠词：have lunch。' },
    { type: 'choice', q: '听句子，选出你听到的句子。', say: 'We have breakfast at seven.', options: ['We have breakfast at seven.', 'We have a breakfast at seven.', 'We have the breakfast at seven.'], answer: 0, explain: '听到的是 We have breakfast at seven.，三餐前一般不加冠词。' },
    { type: 'choice', q: 'Which do you like better, ___ math or ___ English?', options: ['/; /', 'the; the', 'a; an'], answer: 0, explain: '学科前不用冠词。' },
    { type: 'choice', q: 'We have ___ art on Friday afternoon.', options: ['an', 'the', '/'], answer: 2, explain: 'art（美术）在这里是学科名称，前面不用冠词。' },
    { type: 'choice', q: 'My birthday is in ___ May.', options: ['a', 'the', '/'], answer: 2, explain: '月份前不用冠词：in May。' },
    { type: 'choice', q: 'We often fly kites in ___ spring.', options: ['a', 'an', '/'], answer: 2, explain: '季节前一般不用冠词：in spring。' },
    { type: 'choice', q: 'My father goes to work by ___ car.', options: ['a', 'the', '/'], answer: 2, explain: 'by + 交通工具，中间不加冠词：by car。' },
    { type: 'fill', q: '改错：I go to school by a bike. 句中多了一个词，写出这个多余的词。', answer: ['a'], explain: 'by + 交通工具中间不用冠词，应该是 by bike。' },
    { type: 'choice', q: "Mum isn't at work. She is at ___ home now.", options: ['a', 'the', '/'], answer: 2, explain: 'at home（在家）是固定搭配，不用冠词。' },
    { type: 'choice', q: "Don't play computer games at ___ night.", options: ['a', 'the', '/'], answer: 2, explain: 'at night（在夜里）是固定搭配，不用冠词。' },
    { type: 'choice', q: 'We had ___ nice lunch in the park yesterday.', options: ['a', 'the', '/'], answer: 0, explain: '三餐前有形容词 nice 修饰时，可以用 a：a nice lunch（一顿美味的午餐）。' },
    { type: 'choice', q: 'Mum cooked ___ big dinner for us on my birthday.', options: ['a', 'an', '/'], answer: 0, explain: 'dinner 前有形容词 big 修饰，用 a；big 是辅音开头，不能用 an。' }
  ]
},

{
  id: 'g-numeral', title: '数词：基数词、序数词与时间日期', short: '数词', module: 'morph', grade: 4, freq: 2,
  prereqs: [],
  tip: '常考序数词拼写（fifth, ninth, twelfth, twentieth）、“具体数字 + hundred”不加 s、hundreds of 表示“成百上千”。',
  learn: [
    { h: '基数词（表示“几个”）', html: `<ul>
      <li>1–12 要单独记：one, two, three ... eleven, twelve</li>
      <li>13–19 加 teen：thirteen, fourteen, <b>fifteen</b>, sixteen, <b>eighteen</b></li>
      <li>整十加 ty：twenty, thirty, <b>forty</b>（没有 u！）, <b>fifty</b>, sixty, <b>eighty</b>, ninety</li>
      <li>几十几用连字符：twenty-one, forty-five</li>
      <li>百位后用 and：one hundred and five（105）</li></ul>
      <p class="warn">hundred / thousand 前面有具体数字时不加 s：two hundred, three thousand；表示“成百上千”时才用 hundreds of / thousands of。</p>` },
    { h: '序数词（表示“第几”）', html: `<div class="rhyme">基变序，有规律，词尾加上 th；<br>一二三，特殊记，first、second、third；<br>八去 t，九去 e，ve 要用 f 替；<br>ty 将 y 变成 i，th 前面有个 e；<br>若是碰到几十几，只变个位就可以。</div>
      <table class="tbl"><tr><th>基数词</th><th>序数词</th></tr>
      <tr><td>one, two, three</td><td>first, second, third</td></tr>
      <tr><td>five, twelve</td><td>fifth, twelfth</td></tr>
      <tr><td>eight, nine</td><td>eighth, ninth</td></tr>
      <tr><td>twenty, forty</td><td>twentieth, fortieth</td></tr>
      <tr><td>twenty-one</td><td>twenty-first</td></tr></table>
      <p>序数词前一般加 the：<span class="en">the third floor, the first day</span></p>
      <p class="ex">Our classroom is on the fifth floor.<span class="zh">我们的教室在五楼。</span></p>` },
    { h: '时间的读法', html: `<ul>
      <li>直接读：7:30 → seven thirty；8:15 → eight fifteen</li>
      <li>用 past（过）：30 分钟以内。8:10 → ten past eight；7:30 → half past seven</li>
      <li>用 to（差）：超过 30 分钟，说“差几分到下一个钟点”。8:50 → ten to nine</li>
      <li>15 分钟 = a quarter：8:15 → a quarter past eight；8:45 → a quarter to nine</li></ul>
      <p class="ex">I get up at half past six every day.<span class="zh">我每天六点半起床。</span></p>` },
    { h: '日期和年龄', html: `<p>日期用<b>序数词</b>：May 1st 读作 May the first；October 2nd 读作 October the second。</p>
      <p>年份两位两位读：1998 → nineteen ninety-eight；2025 → twenty twenty-five 或 two thousand and twenty-five。</p>
      <p>“几岁的”用连字符，中间名词用单数：</p>
      <p class="ex">She has a five-year-old brother.<span class="zh">她有一个五岁的弟弟。</span></p>
      <p class="warn">比较：He is five years old.（分开写，years 加 s）；a five-year-old boy（连字符，year 不加 s）。</p>` }
  ],
  examples: [
    { type: 'fill', q: 'December is the ___ month of the year.（twelve）', answer: ['twelfth'], explain: '“第十二”用序数词，ve 变 f 再加 th：twelfth。' },
    { type: 'choice', q: 'There are ___ students in our school.', options: ['three hundred', 'three hundreds', 'hundreds of three'], answer: 0, explain: 'hundred 前面有具体数字 three，不加 s。' },
    { type: 'choice', q: '“十一”和“十二”的正确拼写是哪一组？', options: ['eleven; twelve', 'elevn; twelf', 'eleven; twelfe'], answer: 0, explain: '1–12 要单独记：eleven（11）、twelve（12）。注意 twelve 结尾是 ve，变序数词时才变成 twelfth。' },
    { type: 'choice', q: '“十五”和“八十”的正确拼写是哪一组？', options: ['fifteen; eighty', 'fiveteen; eighty', 'fifteen; eightty'], answer: 0, explain: '15 是 fifteen（five 变 fif）；80 是 eighty（eight 后面只加 y，不要写两个 t）。' },
    { type: 'fill', q: '写出 45 的英文：___', answer: ['forty-five'], explain: '几十几用连字符连接：forty-five。注意 forty 没有 u。' },
    { type: 'choice', q: '105 用英语怎么说？', options: ['one hundred and five', 'one hundreds and five', 'one hundred and fifty'], answer: 0, explain: '百位后面用 and 连接：one hundred and five；有具体数字 one，hundred 不加 s；fifty 是 50。' },
    { type: 'choice', q: '___ birds fly to the lake every winter.', options: ['Hundred of', 'Hundreds of', 'Two hundreds of'], answer: 1, explain: '表示“成百上千、好几百”用 hundreds of；有具体数字时 hundred 不加 s，也不加 of。' },
    { type: 'fill', q: 'Monday is the ___ school day of the week.（one）', answer: ['first'], explain: '“第一”要特殊记：one → first，前面有 the。' },
    { type: 'fill', q: 'September is the ___ month of the year.（nine）', answer: ['ninth'], explain: '“九去 e”：nine 去掉 e 再加 th，是 ninth。同样 eight 去 t 加 h，是 eighth。' },
    { type: 'fill', q: "This year is our school's ___ birthday.（twenty）", answer: ['twentieth'], explain: '“ty 将 y 变成 i，th 前面有个 e”：twenty → twentieth。' },
    { type: 'fill', q: 'We live in the ___ century.（twenty-one）', answer: ['twenty-first'], explain: '几十几变序数词，只变个位：twenty-one → twenty-first。' },
    { type: 'choice', q: '6:30 直接读作：', options: ['six thirty', 'thirty six', 'six three'], answer: 0, explain: '直接读法：先读钟点，再读分钟：six thirty。' },
    { type: 'choice', q: '9:15 用 past 的说法是：', options: ['a quarter past nine', 'a quarter to nine', 'fifteen to nine'], answer: 0, explain: '15 分钟 = a quarter；30 分钟以内用 past（过）：a quarter past nine（九点过一刻）。' },
    { type: 'choice', q: '7:50 用 to 的说法是：', options: ['ten to eight', 'ten past seven', 'fifty to seven'], answer: 0, explain: '超过 30 分钟，说“差几分到下一个钟点”：差 10 分 8 点，ten to eight。' },
    { type: 'choice', q: 'October 1st 读作：', options: ['October the first', 'October one', 'October the oneth'], answer: 0, explain: '日期用序数词：1st 读 the first。' },
    { type: 'choice', q: '2008 年可以读作：', options: ['two thousand and eight', 'twenty eight', 'two hundred and eight'], answer: 0, explain: '2008 读作 two thousand and eight；twenty eight 是 28，two hundred and eight 是 208。' },
    { type: 'choice', q: 'He is ten ___ old. He is a ten-___-old boy.', options: ['years; year', 'year; years', 'years; years'], answer: 0, explain: '分开写时 years 加 s：ten years old；用连字符放在名词前时，year 用单数：a ten-year-old boy。' },
    { type: 'choice', q: '“四十”的正确拼写是：', options: ['forty', 'fourty', 'fourteen'], answer: 0, explain: '整十加 ty，但 four 变 forty 时要去掉 u；fourteen 是 14，保留 u。' },
    { type: 'choice', q: 'January is ___ first month of the year.', options: ['the', 'a', '/'], answer: 0, explain: '表示“第几”的序数词前一般加 the：the first month。' },
    { type: 'fill', q: '8:45 = a ___ to nine（填一个词）', answer: ['quarter'], explain: '15 分钟叫 a quarter（一刻钟）；8:45 离 9 点差 15 分钟，所以是 a quarter to nine。' }
  ],
  tests: [
    { type: 'fill', q: 'Today is my ___ birthday.（twelve）', answer: ['twelfth'], explain: '“第十二个生日”用序数词 twelfth。' },
    { type: 'fill', q: 'Our classroom is on the ___ floor.（five）', answer: ['fifth'], explain: 'the 后表示“第五层”，用序数词；ve 要变成 f 再加 th：fifth。' },
    { type: 'fill', q: '写出 40 的英文单词：___', answer: ['forty'], explain: 'four 变成整十时要去掉 u：forty。' },
    { type: 'choice', q: '___ people visit the Great Wall every year.', options: ['Thousand of', 'Thousands of', 'Three thousands'], answer: 1, explain: '表示“成千上万”用 thousands of；有具体数字时 thousand 不加 s。' },
    { type: 'choice', q: '8:45 用英语怎么说？', options: ['a quarter past eight', 'a quarter to nine', 'forty-five past eight'], answer: 1, explain: '超过 30 分钟用 to，8:45 是“差一刻九点”：a quarter to nine。' },
    { type: 'choice', q: 'She has a ___ brother.', options: ['five-year-old', 'five-years-old', 'five year old'], answer: 0, explain: '放在名词前用连字符，year 用单数：five-year-old。' },
    { type: 'choice', q: "—When is your birthday?<br>—It's on ___.", options: ['May 2nd', 'May 2th', 'May 2rd'], answer: 0, explain: '日期用序数词，second 的缩写是 2nd。' },
    { type: 'fill', q: '写出 12 的英文：___', answer: ['twelve'], explain: '12 是 twelve，要单独记，不要和序数词 twelfth 弄混。' },
    { type: 'choice', q: '听句子，选出你听到的数字。', say: 'I have eleven pencils in my pencil box.', options: ['11', '7', '17'], answer: 0, explain: '听到的是 eleven（11）；7 是 seven，17 是 seventeen。' },
    { type: 'fill', q: '写出 15 的英文：___', answer: ['fifteen'], explain: '15 是 fifteen，five 变成 fif 再加 teen，不能写 fiveteen。' },
    { type: 'choice', q: '听句子，选出你听到的数字。', say: 'There are eighteen boys in my class.', options: ['18', '80', '8'], answer: 0, explain: 'eighteen（18）的重音在后面 teen 上，尾音长；eighty（80）的重音在前面，结尾是短的 ty。' },
    { type: 'fill', q: '写出 50 的英文：___', answer: ['fifty'], explain: '50 是 fifty，five 变成 fif 再加 ty。' },
    { type: 'choice', q: '80 的正确拼写是：', options: ['eighty', 'eightty', 'eighteen'], answer: 0, explain: '80 是 eighty，只有一个 t；eighteen 是 18。' },
    { type: 'fill', q: '写出 99 的英文：___', answer: ['ninety-nine'], explain: '几十几中间用连字符：ninety-nine。' },
    { type: 'fill', q: '写出 21 的英文：___', answer: ['twenty-one'], explain: '几十几中间用连字符：twenty-one。' },
    { type: 'fill', q: '306 = three hundred ___ six（填一个词）', answer: ['and'], explain: '百位后面用 and 连接：three hundred and six。' },
    { type: 'choice', q: '520 用英语怎么说？', options: ['five hundred and twenty', 'five hundreds and twenty', 'five hundred twenty and'], answer: 0, explain: 'hundred 前有具体数字不加 s；百位后用 and 再接后面的数。' },
    { type: 'fill', q: 'Our school has two ___ students.（thousand）', answer: ['thousand'], explain: 'thousand 前面有具体数字 two，不加 s。' },
    { type: 'fill', q: '改错：There are five hundreds books in the library. 句中有一个词错了，写出改正后的词。', answer: ['hundred'], explain: 'hundred 前有具体数字 five，不能加 s：five hundred books。' },
    { type: 'choice', q: 'There are ___ books in the new library.', options: ['hundreds of', 'hundred of', 'five hundreds'], answer: 0, explain: '表示“好几百”用 hundreds of；hundred of 少了 s；five hundreds 不能加 s。' },
    { type: 'fill', q: '___ of people watched the football match.（thousand，首字母大写）', answer: ['Thousands'], explain: '后面有 of，表示“成千上万”，用 thousands of。' },
    { type: 'fill', q: 'Jim ran fastest. He came ___ in the race.（one）', answer: ['first'], explain: '跑得最快就是“第一名”：one → first，要特殊记。' },
    { type: 'fill', q: 'My family lives on the ___ floor.（three）', answer: ['third'], explain: '“第三”特殊记：three → third。' },
    { type: 'fill', q: '改错：Today is my fiveth birthday. 句中有一个词错了，写出改正后的词。', answer: ['fifth'], explain: '“ve 要用 f 替”：five → fifth，不能写 fiveth。' },
    { type: 'fill', q: 'We are going to learn the ___ lesson tomorrow.（nine）', answer: ['ninth'], explain: 'nine 去 e 加 th：ninth，不能写 nineth。' },
    { type: 'fill', q: 'Mary is in the ___ grade.（eight）', answer: ['eighth'], explain: 'eight 本身以 t 结尾，只加 h：eighth。' },
    { type: 'fill', q: '改错：He was born on May eightth. 句中有一个词错了，写出改正后的词。', answer: ['eighth'], explain: '“八去 t”：eight 去掉 t 再加 th，是 eighth，只有一个 t。' },
    { type: 'fill', q: 'Today is the ___ day of the month.（thirty）', answer: ['thirtieth'], explain: 'thirty 变序数词：y 变 i，再加 eth，是 thirtieth。' },
    { type: 'choice', q: '“第四十”的正确拼写是：', options: ['fortieth', 'fourtieth', 'fortyth'], answer: 0, explain: 'forty 没有 u；ty 结尾要把 y 变成 i 再加 eth：fortieth。' },
    { type: 'fill', q: 'December 31st is the ___ day of December.（thirty-one）', answer: ['thirty-first'], explain: '几十几变序数词只变个位：thirty-one → thirty-first。' },
    { type: 'choice', q: 'My uncle works on the ___ floor of that tall building.（23）', options: ['twenty-third', 'twentieth-third', 'twenty-three'], answer: 0, explain: '“第二十三”只变个位：twenty-third；表示“第几层”要用序数词。' },
    { type: 'choice', q: 'Our music room is on ___ third floor.', options: ['the', 'a', '/'], answer: 0, explain: '序数词前一般加 the：the third floor。' },
    { type: 'choice', q: '听句子，选出你听到的时间。', say: 'It is seven forty now.', options: ['7:40', '7:14', '4:07'], answer: 0, explain: 'seven forty 是直接读法：7 点 40 分。' },
    { type: 'fill', q: '9:25 直接读作：nine ___', answer: ['twenty-five'], explain: '直接读法先读钟点再读分钟：nine twenty-five。' },
    { type: 'fill', q: '6:30 = half ___ six（填一个词）', answer: ['past'], explain: '30 分钟以内用 past：half past six（六点半）。' },
    { type: 'choice', q: '10:20 用 past 或 to 怎么说？', options: ['twenty past ten', 'twenty to ten', 'ten past twenty'], answer: 0, explain: '20 分钟在 30 分钟以内，用 past：twenty past ten（十点过二十分）。' },
    { type: 'choice', q: '9:55 用 past 或 to 怎么说？', options: ['five to ten', 'five past nine', 'five to nine'], answer: 0, explain: '超过 30 分钟用 to，说差几分到下一个钟点：差 5 分十点，five to ten。' },
    { type: 'fill', q: '11:40 = twenty ___ twelve（填一个词）', answer: ['to'], explain: '11:40 离 12 点还差 20 分钟，用 to：twenty to twelve。' },
    { type: 'fill', q: '3:15 = a ___ past three（填一个词）', answer: ['quarter'], explain: '15 分钟 = a quarter：a quarter past three。' },
    { type: 'choice', q: '“9 月 3 日”写作：', options: ['September 3rd', 'September 3th', 'September 3nd'], answer: 0, explain: '日期用序数词，third 的缩写是 3rd。' },
    { type: 'choice', q: '听句子，选出正确的日期。', say: 'My birthday is on June the twenty-first.', options: ['June 21st', 'June 20th', 'July 21st'], answer: 0, explain: '听到 June the twenty-first，是 6 月 21 日，写作 June 21st。' },
    { type: 'choice', q: '1998 年读作：', options: ['nineteen ninety-eight', 'one nine nine eight', 'nineteen and ninety-eight'], answer: 0, explain: '年份两位两位读：19 / 98 → nineteen ninety-eight，中间不加 and。' },
    { type: 'choice', q: '听句子，选出他出生的年份。', say: 'He was born in two thousand and twelve.', options: ['2012', '2020', '1912'], answer: 0, explain: 'two thousand and twelve 是 2012 年。' },
    { type: 'choice', q: 'My little brother is ___.', options: ['six years old', 'six-years-old', 'six year old'], answer: 0, explain: '放在句末单独说年龄时分开写，years 加 s：six years old。' },
    { type: 'fill', q: '一个八岁的女孩：an ___ girl（填带连字符的词）', answer: ['eight-year-old'], explain: '放在名词前用连字符，year 用单数：an eight-year-old girl（eight 是元音开头，所以用 an）。' }
  ]
},

{
  id: 'g-possessive', title: "名词所有格 's 与 of", short: '名词所有格', module: 'morph', grade: 4, freq: 2,
  prereqs: ['g-plural'],
  tip: "常考 Teachers' Day / Children's Day 的写法，以及“共有”只在最后加 's、“各自”每个都加 's。",
  learn: [
    { h: "'s 怎么加", html: `<p>表示“<b>……的</b>”，有生命的名词（人、动物）一般用 <b>'s</b>。</p>
      <table class="tbl"><tr><th>情况</th><th>加法</th><th>例子</th></tr>
      <tr><td>单数名词</td><td>+'s</td><td>Tom's book, my mother's car</td></tr>
      <tr><td>以 s 结尾的复数</td><td>只加 '</td><td>Teachers' Day, the students' books</td></tr>
      <tr><td>不以 s 结尾的复数</td><td>+'s</td><td>Children's Day, Women's Day</td></tr></table>
      <p class="ex">Tom's bike is new.<span class="zh">汤姆的自行车是新的。</span></p>` },
    { h: '共有还是各自', html: `<ul>
      <li><b>共有</b>（两人共同拥有一个）：只在最后一个名词加 's</li>
      <li><b>各自</b>（各有各的）：每个名词都加 's，后面的名词常用复数</li></ul>
      <p class="ex">This is Lucy and Lily's room.<span class="zh">这是露西和莉莉（共同）的房间。</span></p>
      <p class="ex">These are Tom's and Jack's bikes.<span class="zh">这些是汤姆的和杰克的自行车（各一辆）。</span></p>
      <div class="rhyme">有生命用 's，无生命用 of；<br>复数有 s 只加撇，共有最后加，各自都要加。</div>` },
    { h: 'of 所有格', html: `<p>没有生命的东西，一般用 <b>of</b>，顺序和中文相反：</p>
      <p class="ex">the door of the classroom<span class="zh">教室的门</span></p>
      <p class="ex">a map of China<span class="zh">一张中国地图</span></p>
      <p class="ex">the name of the song<span class="zh">这首歌的名字</span></p>` },
    { h: "'s 的特殊用法", html: `<ul>
      <li>表示时间、距离：<span class="en">today's newspaper</span>（今天的报纸），<span class="en">ten minutes' walk</span>（步行十分钟的路程）</li>
      <li>表示某人家、店铺：<span class="en">at my aunt's</span>（在我姑姑家），<span class="en">at the doctor's</span>（在诊所）</li>
      <li>回答 Whose 时，后面的名词可以省略：Whose bag is this? — It's Mary's.</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'September 10th is ___ Day.', options: ["Teacher's", "Teachers'", "Teachers's"], answer: 1, explain: "教师节是全体老师的节日，teachers 以 s 结尾，只加 '：Teachers' Day。" },
    { type: 'choice', q: 'Jim and Kate are twins. They share a room. This is ___ room.', options: ["Jim and Kate's", "Jim's and Kate's", 'Jim and Kate'], answer: 0, explain: "两人共用一个房间，是“共有”，只在最后加 's。" },
    { type: 'fill', q: 'This is my ___ car.（mother）', answer: ["mother's"], explain: "表示“妈妈的”，mother 是单数名词，直接加 's：my mother's car。" },
    { type: 'choice', q: 'March 8th is ___ Day.', options: ["Women's", "Womens'", "Woman's"], answer: 0, explain: "妇女节是所有妇女的节日，用复数 women；women 不以 s 结尾，加 's：Women's Day。" },
    { type: 'choice', q: 'Lucy has a ruler, and Lily has a ruler, too. These are ___ rulers.', options: ["Lucy's and Lily's", "Lucy and Lily's", "Lucy's and Lily"], answer: 0, explain: "两人各有一把尺子，是“各自”拥有，每个名字后都要加 's，后面的名词用复数 rulers。" },
    { type: 'choice', q: 'Do you know the name ___ the song?', options: ['of', 'at', 'on'], answer: 0, explain: '歌是没有生命的东西，“……的名字”用 of 所有格：the name of the song，顺序和中文相反。' },
    { type: 'fill', q: 'Have you read ___ newspaper?（today）', answer: ["today's"], explain: "表示时间“今天的”，也可以用 's：today's newspaper。" },
    { type: 'choice', q: "Lucy isn't at home. She is at her ___.", options: ["grandma's", 'grandma', "grandmas'"], answer: 0, explain: "at her grandma's 表示“在她奶奶家”，后面省略了 home。" },
    { type: 'choice', q: "—Whose pen is this?<br>—It's ___.", options: ["Lucy's", 'Lucy', 'Lucy is'], answer: 0, explain: "回答 Whose 时用名词所有格，后面的 pen 可以省略：It's Lucy's." }
  ],
  tests: [
    { type: 'fill', q: 'This is ___ bike.（Tom）', answer: ["Tom's"], explain: "表示“汤姆的”，在 Tom 后加 's。" },
    { type: 'fill', q: 'June 1st is ___ Day.（child 的适当形式）', answer: ["Children's"], explain: "儿童节是所有孩子的节日，child 的复数 children 不以 s 结尾，加 's。" },
    { type: 'choice', q: 'Tom has a bike, and Jack has a bike too. These are ___ bikes.', options: ["Tom's and Jack's", "Tom and Jack's", 'Tom and Jack'], answer: 0, explain: "两人各有一辆，是“各自”拥有，每个名词都要加 's。" },
    { type: 'choice', q: 'This shop sells ___ clothes. My little brother likes them.', options: ["children's", "childrens'", 'children'], answer: 0, explain: "children 不以 s 结尾，所有格加 's：children's。" },
    { type: 'choice', q: "It's about ten ___ walk from my home to school.", options: ["minutes'", "minute's", 'minutes'], answer: 0, explain: "表示距离“十分钟的路程”，minutes 以 s 结尾，只加 '。" },
    { type: 'choice', q: "—Whose schoolbag is this?<br>—It's ___.", options: ["Mary's", 'Mary', "Marys'"], answer: 0, explain: "回答“谁的”用所有格 Mary's，后面省略了 schoolbag。" },
    { type: 'choice', q: "I'm going to stay at my ___ this weekend.", options: ["aunt's", 'aunts', 'aunt'], answer: 0, explain: "at my aunt's 表示“在我姑姑家”，后面省略了 home。" },
    { type: 'fill', q: 'My ___ name is Wang Hong.（father）', answer: ["father's"], explain: "单数名词表示“……的”，加 's：my father's name。" },
    { type: 'fill', q: 'We give flowers to our teachers on ___ Day.（teacher 的适当形式）', answer: ["Teachers'"], explain: "教师节是全体老师的节日，用复数 teachers；以 s 结尾的复数只加 '：Teachers' Day。" },
    { type: 'fill', q: 'The two ___ bags are on the desk.（girl）', answer: ["girls'"], explain: "two 说明是两个女孩，用复数 girls；以 s 结尾的复数只加 '：girls'。" },
    { type: 'fill', q: "改错：The girls's room is very big. 句中有一个词错了，写出改正后的词。", answer: ["girls'"], explain: "girls 以 s 结尾，所有格只加 '，不能再加 's：the girls' room。" },
    { type: 'fill', q: 'This is a ___ hospital.（child 的适当形式）', answer: ["children's"], explain: "儿童医院是给孩子们看病的，用复数 children；不以 s 结尾，加 's：children's hospital。" },
    { type: 'fill', q: "Tom and Jim are brothers. They share a bedroom. It's Tom and ___ bedroom.（Jim）", answer: ["Jim's"], explain: "两人共用一间卧室，是“共有”，只在最后一个名字加 's：Tom and Jim's bedroom。" },
    { type: 'choice', q: 'Lily and Lucy are sisters. ___ mother is a doctor.', options: ["Lily and Lucy's", "Lily's and Lucy's", 'Lily and Lucy'], answer: 0, explain: "姐妹俩是同一个妈妈，是“共有”，只在最后加 's。" },
    { type: 'fill', q: "Mr. Li and Mrs. Li live together. 改错：This is Mr. Li's and Mrs. Li's house.<br>正确写法：This is Mr. Li and Mrs. ___ house.", answer: ["Li's"], explain: "夫妻俩住同一所房子，是“共有”，只在最后加 's。" },
    { type: 'choice', q: 'Lucy has a dictionary, and Lily has one, too. They are ___.', options: ["Lucy's and Lily's dictionaries", "Lucy and Lily's dictionary", "Lucy's and Lily's dictionary"], answer: 0, explain: "两人各有一本，是“各自”拥有：每个名字都加 's，名词用复数 dictionaries。" },
    { type: 'fill', q: '“我爸爸的和我叔叔的车（各一辆）”：my father\'s and my ___ cars（uncle）', answer: ["uncle's"], explain: "各自拥有，每个名词都要加 's：my father's and my uncle's cars。" },
    { type: 'choice', q: '“一张中国地图”用英语怎么说？', options: ['a map of China', "a China's map", 'a map China'], answer: 0, explain: '没有生命的东西用 of 表示所属：a map of China。' },
    { type: 'fill', q: '桌子的腿：the legs ___ the desk（填一个词）', answer: ['of'], explain: '桌子没有生命，用 of 所有格，顺序和中文相反：the legs of the desk。' },
    { type: 'fill', q: "It's about twenty ___ ride by bus.（minute）", answer: ["minutes'"], explain: "表示距离“二十分钟的车程”，minutes 以 s 结尾，只加 '。" },
    { type: 'choice', q: 'Have you finished ___ homework?', options: ["today's", "todays'", 'today'], answer: 0, explain: "表示时间“今天的作业”，用 today's。" },
    { type: 'choice', q: 'We had dinner at ___ last Sunday.', options: ["my uncle's", 'my uncle', 'my uncles'], answer: 0, explain: "at my uncle's 表示“在我叔叔家”，省略了 home。" },
    { type: 'fill', q: "—Whose books are these?<br>—They're ___.（Kate）", answer: ["Kate's"], explain: "回答 Whose 用名词所有格，后面的 books 省略。" }
  ]
},

{
  id: 'g-demonstrative', title: '指示代词 this / that / these / those', short: '指示代词', module: 'morph', grade: 4, freq: 1,
  prereqs: ['g-be'],
  tip: '打电话介绍自己用 This is ...，问对方用 Is that ...?；回答时 this / that 换成 it，these / those 换成 they。',
  learn: [
    { h: '一张表记住', html: `<table class="tbl"><tr><th></th><th>单数</th><th>复数</th></tr>
      <tr><td>近（这）</td><td>this</td><td>these</td></tr>
      <tr><td>远（那）</td><td>that</td><td>those</td></tr></table>
      <div class="rhyme">近的 this，远的 that；<br>变成复数，these 和 those。</div>
      <p class="ex">This is my pencil. That is your pencil.<span class="zh">这是我的铅笔。那是你的铅笔。</span></p>
      <p class="ex">Look at those birds over there!<span class="zh">看那边那些鸟！</span></p>` },
    { h: '变复数要整句一起变', html: `<p>this → these，that → those，is → are，名词也要变复数：</p>
      <p class="ex">This is an apple. These are apples.<span class="zh">这是一个苹果。这些是苹果。</span></p>
      <p class="ex">That is my pen. Those are my pens.<span class="zh">那是我的钢笔。那些是我的钢笔。</span></p>
      <p class="warn">a / an 只能跟单数，变复数时要去掉。</p>` },
    { h: '怎么回答', html: `<p>回答时，this / that 用 <b>it</b> 代替，these / those 用 <b>they</b> 代替：</p>
      <p class="ex">Is this your ruler? Yes, it is.<span class="zh">这是你的尺子吗？是的。</span></p>
      <p class="ex">Are those your shoes? No, they aren't.<span class="zh">那些是你的鞋子吗？不是。</span></p>` },
    { h: '特殊用法', html: `<ul>
      <li><b>介绍别人</b>用 this：<span class="en">This is my friend, Lily.</span></li>
      <li><b>打电话</b>：我是……用 this，你是……用 that</li></ul>
      <p class="ex">Hello, this is Mike. Is that Jack speaking?<span class="zh">你好，我是迈克。你是杰克吗？</span></p>
      <p>比较句中，用 that / those 代替前面提到过的名词，避免重复（初中常考）：</p>
      <p class="ex">The weather in Xiamen is warmer than that in Beijing.<span class="zh">厦门的天气比北京的暖和。（that = the weather）</span></p>` }
  ],
  examples: [
    { type: 'choice', q: 'Look at ___ birds over there!', options: ['this', 'these', 'those'], answer: 2, explain: 'over there 表示远处，birds 是复数，用 those。' },
    { type: 'choice', q: '(On the phone)<br>—Hello! ___ is Mary speaking. Who is that?', options: ['This', 'That', 'I'], answer: 0, explain: '打电话介绍自己用 This is ...。' },
    { type: 'choice', q: '___ is my pencil here, and ___ is your pencil over there.', options: ['This; that', 'That; this', 'These; those'], answer: 0, explain: 'here 表示近处，单数用 this；over there 表示远处，单数用 that。is 说明是单数，不能用 these / those。' },
    { type: 'fill', q: '改为复数句：That is a kite.<br>→ Those are ___.（填一个词）', answer: ['kites'], explain: '变复数要整句一起变：that → those，is → are，去掉 a，kite 变成 kites。' },
    { type: 'choice', q: '—Is that your kite?<br>—Yes, ___ is.', options: ['it', 'that', 'this'], answer: 0, explain: '回答 this / that 提问的一般疑问句，用 it 代替。' },
    { type: 'choice', q: "—Are these your socks?<br>—No, ___.", options: ["they aren't", "these aren't", "it isn't"], answer: 0, explain: 'these / those 提问，回答用 they 代替；socks 是复数，用 aren\'t。' },
    { type: 'choice', q: 'Mum, ___ is my friend Lily.', options: ['this', 'these', 'it'], answer: 0, explain: '向别人介绍某人用 This is ...，Lily 是一个人，用单数 this。' },
    { type: 'choice', q: 'The apples in this shop are cheaper than ___ in that shop.', options: ['that', 'those', 'these'], answer: 1, explain: '比较句中用 those 代替前面的复数名词 the apples，避免重复。' }
  ],
  tests: [
    { type: 'choice', q: '___ are my parents.', options: ['This', 'That', 'These'], answer: 2, explain: 'are 和 parents 都是复数，用 these。' },
    { type: 'choice', q: '—Is this your ruler?<br>—Yes, ___ is.', options: ['this', 'it', 'that'], answer: 1, explain: '回答 this 提问时用 it 代替。' },
    { type: 'choice', q: "—Are those your shoes?<br>—No, ___ aren't.", options: ['those', 'they', 'these'], answer: 1, explain: '回答 those 提问时用 they 代替。' },
    { type: 'fill', q: '变成复数：This is an apple. → ___ are apples.（首字母大写）', answer: ['These'], explain: 'this 的复数是 these。' },
    { type: 'fill', q: '变成复数：That is my pen. → ___ are my pens.（首字母大写）', answer: ['Those'], explain: 'that 的复数是 those。' },
    { type: 'choice', q: '(On the phone)<br>—Hello, ___ is Mike. Is that Jack speaking?', options: ['this', 'that', 'I'], answer: 0, explain: '打电话时介绍自己用 this is，不能说 I is。' },
    { type: 'choice', q: 'The weather in Xiamen is warmer than ___ in Beijing.', options: ['this', 'that', 'those'], answer: 1, explain: '用 that 代替前面的不可数名词 the weather，避免重复。' },
    { type: 'choice', q: "—What's ___ over there?<br>—It's a plane.", options: ['this', 'that', 'these'], answer: 1, explain: 'over there 是远处，答语 It\'s 说明是单数，用 that。' },
    { type: 'fill', q: '这是我的书。___ is my book.（首字母大写）', answer: ['This'], explain: '“这”是近处的单数，用 this。' },
    { type: 'choice', q: '___ shoes over there are very nice.', options: ['That', 'Those', 'These'], answer: 1, explain: 'over there 是远处，shoes 是复数，用 those。' },
    { type: 'fill', q: '改为复数：This is a bus.<br>→ These are ___.（填一个词）', answer: ['buses'], explain: 'this → these，is → are，去掉 a，bus 以 s 结尾加 es：buses。' },
    { type: 'choice', q: 'These ___ my friends, Tom and Jack.', options: ['is', 'are', 'am'], answer: 1, explain: 'these 是复数，后面的 be 动词用 are。' },
    { type: 'fill', q: "—Is that a cat?<br>—No, ___ isn't. It's a dog.（填一个词）", answer: ['it'], explain: '回答 that 提问时用 it 代替。' },
    { type: 'choice', q: '—What are these?<br>—___ are oranges.', options: ['They', 'It', 'This'], answer: 0, explain: '回答 these 提问时用 they 代替，are 也说明是复数。' },
    { type: 'choice', q: '—Mike, ___ is my sister, Kate.<br>—Nice to meet you, Kate.', options: ['this', 'she', 'it'], answer: 0, explain: '介绍别人用 This is ...，不说 She is ... 或 It is ...。' },
    { type: 'fill', q: '向同学介绍朋友：___ is my friend, Tom.（填一个词，首字母大写）', answer: ['This'], explain: '介绍别人时用 This is ...。' },
    { type: 'choice', q: '(On the phone)<br>—Hello! Is ___ Lucy?<br>—Yes, speaking.', options: ['you', 'that', 'she'], answer: 1, explain: '打电话问对方“你是……吗”用 Is that ...?，不用 she；Is you 不合语法。' },
    { type: 'choice', q: 'The students in Class 1 are taller than ___ in Class 2.', options: ['that', 'those', 'this'], answer: 1, explain: '比较句中用 those 代替前面的复数名词 the students，避免重复。' }
  ]
},

{
  id: 'g-prep-time', title: '时间介词 in / on / at', short: '时间介词', module: 'morph', grade: 4, freq: 3,
  prereqs: ['g-numeral'],
  tip: '高频陷阱：具体某一天的上午、下午用 on（on Sunday morning）；前面有 this / next / last / every 时不用介词。',
  learn: [
    { h: '一张表分清', html: `<table class="tbl"><tr><th>介词</th><th>用在</th><th>例子</th></tr>
      <tr><td>at</td><td>钟点、时刻</td><td>at 7:00, at noon, at night, at the moment</td></tr>
      <tr><td>on</td><td>具体某一天、某一天的上午下午</td><td>on Monday, on May 1st, on Children's Day, on Sunday morning</td></tr>
      <tr><td>in</td><td>较长的时间：上午下午、月、季节、年</td><td>in the morning, in May, in spring, in 2025</td></tr></table>
      <div class="rhyme">at 点、on 日、in 长段；<br>上午下午 in 来管，<br>具体哪天换成 on。</div>` },
    { h: '最容易错的：in 还是 on', html: `<p>平常的上午、下午、晚上用 in；一旦是<b>具体某一天</b>的，或者前面有形容词修饰，就用 on：</p>
      <p class="ex">I usually read in the morning.<span class="zh">我通常在上午读书。</span></p>
      <p class="ex">We have a match on Saturday afternoon.<span class="zh">我们星期六下午有一场比赛。</span></p>
      <p class="ex">It was very cold on the morning of December 25th.<span class="zh">12 月 25 日早上非常冷。</span></p>
      <p class="ex">They arrived on a cold winter morning.<span class="zh">他们在一个寒冷的冬天早上到达。</span></p>` },
    { h: '不用介词的情况', html: `<p>时间前有 <b>this, that, next, last, every</b>，或者是 <b>today, tomorrow, yesterday</b> 时，前面不加介词：</p>
      <p class="ex">I am going to visit my grandparents next Sunday.<span class="zh">下周日我要去看望祖父母。</span></p>
      <p class="ex">We play basketball every afternoon.<span class="zh">我们每天下午打篮球。</span></p>
      <p class="warn">next Sunday 前面不能加 on，this morning 前面不能加 in。</p>` },
    { h: '节日', html: `<ul>
      <li>节日<b>那一天</b>用 on：on Teachers' Day, on Christmas Day, on National Day</li>
      <li>指整个节日期间，常用 at：at Christmas, at the Spring Festival</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'We have a football match ___ Saturday afternoon.', options: ['in', 'on', 'at'], answer: 1, explain: '具体某一天（星期六）的下午，用 on。' },
    { type: 'choice', q: 'I usually get up ___ 6:30 ___ the morning.', options: ['at; in', 'in; on', 'on; at'], answer: 0, explain: '钟点前用 at；泛指“在上午”用 in the morning。' },
    { type: 'choice', q: 'We have lunch at school ___ noon.', options: ['in', 'on', 'at'], answer: 2, explain: 'noon（中午）是一个时间点，固定搭配 at noon；同样还有 at night, at the moment。' },
    { type: 'choice', q: 'My birthday is ___ May 5th.', options: ['in', 'on', 'at'], answer: 1, explain: '只说月份用 in May；具体到某一天（5 月 5 日）就要用 on。' },
    { type: 'fill', q: 'Many flowers come out ___ spring.（填介词）', answer: ['in'], explain: '季节是较长的一段时间，用 in。月份、年份前也用 in。' },
    { type: 'choice', q: 'I met my old friend ___ a rainy afternoon.', options: ['in', 'on', 'at'], answer: 1, explain: 'afternoon 前有形容词 rainy 修饰，指具体的某个下午，用 on。' },
    { type: 'choice', q: 'What are you going to do ___?', options: ['this evening', 'in this evening', 'on this evening'], answer: 0, explain: '时间前有 this / that / next / last / every 时，前面不加介词。' },
    { type: 'choice', q: 'We are going to have a test ___.', options: ['tomorrow', 'on tomorrow', 'in tomorrow'], answer: 0, explain: 'today, tomorrow, yesterday 前面不加介词。' },
    { type: 'choice', q: "Students give cards to their teachers ___ Teachers' Day.", options: ['in', 'on', 'at'], answer: 1, explain: "节日当天用 on：on Teachers' Day。" },
    { type: 'choice', q: 'Many people go back home ___ the Spring Festival.', options: ['at', 'to', 'of'], answer: 0, explain: '指整个节日期间（不是具体某一天），常用 at：at the Spring Festival, at Christmas。' },
    { type: 'choice', q: 'The train leaves ___ 8:20.', options: ['in', 'on', 'at'], answer: 2, explain: '具体钟点前用 at：at 8:20。' },
    { type: 'choice', q: "Kids get presents ___ Children's Day.", options: ['in', 'on', 'at'], answer: 1, explain: "Children's Day 是具体的某一天（6 月 1 日），用 on。" }
  ],
  tests: [
    { type: 'choice', q: 'My birthday is ___ October.', options: ['in', 'on', 'at'], answer: 0, explain: '月份前用 in。' },
    { type: 'choice', q: "Children's Day is ___ June 1st.", options: ['in', 'on', 'at'], answer: 1, explain: '具体的日期前用 on。' },
    { type: 'choice', q: 'We often go to bed ___ night.', options: ['in', 'on', 'at'], answer: 2, explain: '固定搭配：at night（在夜里）。' },
    { type: 'fill', q: 'He was born ___ 2012.（填介词）', answer: ['in'], explain: '年份前用 in。' },
    { type: 'fill', q: 'It was very cold ___ the morning of December 25th.（填介词）', answer: ['on'], explain: '具体某一天（12 月 25 日）的早上，用 on。' },
    { type: 'choice', q: 'I am going to visit my grandparents ___.', options: ['next Sunday', 'on next Sunday', 'in next Sunday'], answer: 0, explain: '有 next 时前面不加介词。' },
    { type: 'choice', q: 'They arrived ___ a cold winter morning.', options: ['in', 'on', 'at'], answer: 1, explain: 'morning 前有形容词 cold winter 修饰，指具体某个早上，用 on。' },
    { type: 'choice', q: 'The film starts ___ 7:30 this evening.', options: ['in', 'on', 'at'], answer: 2, explain: '具体钟点前用 at：at 7:30。' },
    { type: 'fill', q: "Let's meet ___ half past three at the school gate.（填介词）", answer: ['at'], explain: 'half past three 是钟点，前面用 at。' },
    { type: 'fill', q: "Sorry, he can't answer the phone. He is busy ___ the moment.（填介词）", answer: ['at'], explain: 'at the moment（此刻）是固定搭配。' },
    { type: 'fill', q: 'We have PE ___ Monday and Thursday.（填介词）', answer: ['on'], explain: '星期几是具体某一天，用 on。' },
    { type: 'choice', q: 'My mother often goes shopping ___ the afternoon.', options: ['in', 'on', 'at'], answer: 0, explain: '泛指“在下午”，没有说是哪一天，用 in the afternoon。' },
    { type: 'fill', q: '改错：I usually do my homework on the evening. 句中介词用错了，写出正确的介词。', answer: ['in'], explain: '泛指“在晚上”，没有具体哪一天，用 in the evening。' },
    { type: 'choice', q: 'It is very hot here ___ summer.', options: ['in', 'on', 'at'], answer: 0, explain: '季节前用 in。' },
    { type: 'choice', q: "We'll have a party ___ the evening of June 1st.", options: ['in', 'on', 'at'], answer: 1, explain: '具体某一天（6 月 1 日）的晚上，用 on。' },
    { type: 'fill', q: 'They got to Beijing ___ a sunny morning.（填介词）', answer: ['on'], explain: 'morning 前有形容词 sunny 修饰，指具体某个早上，用 on。' },
    { type: 'fill', q: '改错：We will have a picnic on next Saturday. 句中多了一个词，写出这个多余的词。', answer: ['on'], explain: '有 next 时前面不加介词：next Saturday。' },
    { type: 'choice', q: 'My father reads newspapers ___.', options: ['every morning', 'in every morning', 'on every morning'], answer: 0, explain: '有 every 时前面不加介词。' },
    { type: 'choice', q: 'I went to the cinema with my parents ___.', options: ['yesterday', 'on yesterday', 'at yesterday'], answer: 0, explain: 'yesterday 前面不加介词。' },
    { type: 'fill', q: '改错：I will visit my aunt in tomorrow. 句中多了一个词，写出这个多余的词。', answer: ['in'], explain: 'tomorrow 前面不用介词。' },
    { type: 'choice', q: 'We watched a film on TV ___ National Day.', options: ['in', 'on', 'at'], answer: 1, explain: '节日这一天用 on：on National Day。' },
    { type: 'fill', q: 'What do you usually do ___ Christmas Day?（填介词）', answer: ['on'], explain: 'Christmas Day 指圣诞节这一天，用 on。' },
    { type: 'fill', q: '整个春节期间，我们都去看望爷爷奶奶。We visit our grandpa and grandma ___ the Spring Festival.（填 at 或 on）', answer: ['at'], explain: '指整个节日期间，常用 at：at the Spring Festival。' },
    { type: 'choice', q: '听句子，选出你听到的短语。', say: 'Many families get together at Christmas.', options: ['at Christmas', 'on Christmas Day', 'in Christmas'], answer: 0, explain: '听到的是 at Christmas，指整个圣诞节期间。' }
  ]
},

{
  id: 'g-prep-place', title: '方位介词', short: '方位介词', module: 'morph', grade: 4, freq: 2,
  prereqs: ['g-be'],
  tip: '常考 in front of（在外部的前面）与 in the front of（在内部的前部）、on the tree 与 in the tree 的区别。',
  learn: [
    { h: '常用方位介词', html: `<table class="tbl"><tr><th>介词</th><th>意思</th><th>例子</th></tr>
      <tr><td>in</td><td>在……里面</td><td>in the box</td></tr>
      <tr><td>on</td><td>在……上面（接触）</td><td>on the desk, on the wall</td></tr>
      <tr><td>under</td><td>在……下面</td><td>under the chair</td></tr>
      <tr><td>behind</td><td>在……后面</td><td>behind the door</td></tr>
      <tr><td>in front of</td><td>在……前面</td><td>in front of the house</td></tr>
      <tr><td>next to / beside</td><td>在……旁边</td><td>next to the bank</td></tr>
      <tr><td>near</td><td>在……附近</td><td>near the school</td></tr>
      <tr><td>between ... and ...</td><td>在两者之间</td><td>between Tom and Jim</td></tr></table>
      <p class="ex">The cat is under the chair.<span class="zh">猫在椅子下面。</span></p>
      <p class="ex">The bank is between the school and the hospital.<span class="zh">银行在学校和医院之间。</span></p>` },
    { h: 'in front of 和 in the front of', html: `<ul>
      <li><b>in front of</b>：在某物<b>外部</b>的前面</li>
      <li><b>in the front of</b>：在某物<b>内部</b>的前部</li></ul>
      <p class="ex">There is a big tree in front of our classroom.<span class="zh">教室前面有一棵大树。（树在教室外面）</span></p>
      <p class="ex">The teacher's desk is in the front of the classroom.<span class="zh">讲台在教室的前部。（在教室里面）</span></p>` },
    { h: 'on the tree 和 in the tree', html: `<ul>
      <li>树上<b>自己长出来</b>的（果子、叶子、花）用 <b>on</b> the tree</li>
      <li><b>外来</b>的东西（鸟、人、风筝）用 <b>in</b> the tree</li></ul>
      <p class="ex">There are many apples on the tree.<span class="zh">树上有很多苹果。</span></p>
      <p class="ex">Some birds are singing in the tree.<span class="zh">一些鸟在树上唱歌。</span></p>
      <div class="rhyme">自己长的用 on，外来的客人用 in。</div>` },
    { h: '地点：at 还是 in', html: `<p>比较小的地点、某个具体的点常用 <b>at</b>；城市、国家等大地方用 <b>in</b>：</p>
      <p class="ex">We are waiting for the bus at the bus stop.<span class="zh">我们在公交站等车。</span></p>
      <p class="ex">My cousin lives in Fuzhou.<span class="zh">我表哥住在福州。</span></p>
      <p class="warn">墙上的地图、画用 on the wall；墙里的窗、门用 in the wall。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'There are some apples ___ the tree.', options: ['in', 'on', 'at'], answer: 1, explain: '苹果是树上自己长出来的，用 on the tree。' },
    { type: 'choice', q: "The teacher's desk is ___ the classroom.", options: ['in front of', 'in the front of', 'behind'], answer: 1, explain: '讲台在教室里面的前部，用 in the front of。' },
    { type: 'choice', q: 'My books are ___ the desk, and my pens are ___ the pencil box.', options: ['on; in', 'in; on', 'under; on'], answer: 0, explain: '书放在桌面上（接触表面）用 on；笔装在铅笔盒里面用 in。' },
    { type: 'fill', q: '在椅子下面：___ the chair（填一个词）', answer: ['under'], explain: '“在……下面”用 under。' },
    { type: 'choice', q: 'Tom sits ___ me in class. I can only see the back of his head.', options: ['in front of', 'behind', 'next to'], answer: 0, explain: '我只能看到他的后脑勺，说明他坐在我前面：in front of。反过来，我就坐在他后面（behind）。' },
    { type: 'choice', q: 'The bookshop is ___ the bank. They are side by side.', options: ['next to', 'behind', 'between'], answer: 0, explain: 'side by side 是“并排、挨着”，用 next to（= beside）。' },
    { type: 'fill', q: 'My home is ___ the park, so I often take a walk there.（在……附近，填一个词）', answer: ['near'], explain: '“在……附近”用 near。' },
    { type: 'fill', q: 'The zoo is ___ the park and the shop.（填一个词）', answer: ['between'], explain: '在两者之间用 between ... and ...。' },
    { type: 'choice', q: "Let's meet ___ the school gate. My cousin lives ___ Fuzhou.", options: ['at; in', 'in; at', 'on; in'], answer: 0, explain: '校门口是一个具体的小地点，用 at；福州是城市，用 in。' },
    { type: 'choice', q: 'There are two windows ___ the wall.', options: ['in', 'on', 'at'], answer: 0, explain: '窗户是嵌在墙里的，用 in the wall；挂在墙面上的地图、画才用 on the wall。' },
    { type: 'choice', q: 'My pencils are ___ my schoolbag.', options: ['in', 'on', 'between'], answer: 0, explain: '铅笔装在书包里面，用 in（在……里面）。' },
    { type: 'choice', q: "The garden is ___ the house, so you can't see it from the street.", options: ['behind', 'in front of', 'on'], answer: 0, explain: '从街上看不到花园，说明它在房子后面，用 behind。' },
    { type: 'choice', q: 'My uncle works ___ Shanghai.', options: ['in', 'at', 'on'], answer: 0, explain: '上海是城市，属于大地方，用 in。' }
  ],
  tests: [
    { type: 'choice', q: "The cat is ___ the bed. I can't see it.", options: ['on', 'under', 'above'], answer: 1, explain: '看不见猫，说明它在床底下，用 under。' },
    { type: 'choice', q: 'Some birds are singing ___ the tree.', options: ['in', 'on', 'at'], answer: 0, explain: '鸟是外来的，不是树上长的，用 in the tree。' },
    { type: 'choice', q: 'Lily sits ___ Lucy and Kate.', options: ['between', 'next', 'in front'], answer: 0, explain: '在两人之间：between ... and ...；next 要说 next to，in front 要说 in front of。' },
    { type: 'fill', q: 'There is a big tree ___ our classroom.（在……前面，树在教室外，填三个词）', answer: ['in front of'], explain: '在教室外部的前面，用 in front of，不加 the。' },
    { type: 'fill', q: 'There is a map of China ___ the wall.（填介词）', answer: ['on'], explain: '地图挂在墙面上，用 on the wall。' },
    { type: 'choice', q: 'My home is ___ the school, so I walk there every day.', options: ['near', 'far', 'between'], answer: 0, explain: '家离学校近，所以走路去，用 near；far 要说 far from。' },
    { type: 'choice', q: 'We are waiting for the bus ___ the bus stop.', options: ['at', 'in', 'on'], answer: 0, explain: '公交站是一个小地点，用 at the bus stop。' },
    { type: 'fill', q: 'The milk is ___ the fridge.（填介词）', answer: ['in'], explain: '牛奶放在冰箱里面，用 in。' },
    { type: 'choice', q: 'Put the cup ___ the table, please.', options: ['on', 'in', 'between'], answer: 0, explain: '杯子放在桌面上，接触表面，用 on。' },
    { type: 'choice', q: 'Our ball is ___ the bed. We can\'t see it.', options: ['under', 'on', 'above'], answer: 0, explain: '球在床上或床的上方都能看见；看不见，说明球在床底下，用 under。' },
    { type: 'choice', q: '听句子，狗在哪里？', say: 'The dog is sleeping next to the bed.', options: ['床底下', '床上', '床旁边'], answer: 2, explain: 'next to the bed 是“在床旁边”。' },
    { type: 'choice', q: "Bob is hiding ___ the door. We can't see him.", options: ['behind', 'in front of', 'on'], answer: 0, explain: '躲起来看不见，说明在门后面，用 behind。' },
    { type: 'fill', q: '在门后：___ the door（填一个词）', answer: ['behind'], explain: '“在……后面”用 behind。' },
    { type: 'choice', q: 'The driver sits ___ the bus.', options: ['in the front of', 'in front of', 'behind'], answer: 0, explain: '司机坐在公交车里面的前部，用 in the front of。' },
    { type: 'choice', q: 'A school bus is waiting ___ the school gate.', options: ['in front of', 'in the front of', 'between'], answer: 0, explain: '校车在校门外部的前面，用 in front of。' },
    { type: 'fill', q: 'Lily sits next ___ me.（填一个词）', answer: ['to'], explain: '“在……旁边”是 next to，不能漏掉 to。' },
    { type: 'choice', q: 'My house is ___ to the post office.', options: ['next', 'near', 'beside'], answer: 0, explain: '后面有 to，只能是 next to；near 和 beside 后面直接接名词。' },
    { type: 'fill', q: 'Excuse me, is there a bank ___ here?（在附近，填一个词）', answer: ['near'], explain: '“在这附近”用 near here。' },
    { type: 'fill', q: 'The hospital is between the bank ___ the park.（填一个词）', answer: ['and'], explain: 'between ... and ...：在……和……之间。' },
    { type: 'choice', q: 'There is a kite ___ the tree. Can you get it down?', options: ['in', 'on', 'at'], answer: 0, explain: '风筝是外来的东西，挂在树上用 in the tree。' },
    { type: 'choice', q: 'Look at the red leaves ___ the tree.', options: ['on', 'in', 'at'], answer: 0, explain: '叶子是树上自己长出来的，用 on the tree。' },
    { type: 'choice', q: 'Mum is waiting for me ___ the school gate.', options: ['at', 'in', 'on'], answer: 0, explain: '校门口是一个具体的小地点，用 at。' },
    { type: 'choice', q: 'He was born ___ China.', options: ['in', 'at', 'on'], answer: 0, explain: '国家是大地方，用 in。' },
    { type: 'fill', q: 'My grandpa lives ___ Quanzhou.（填介词）', answer: ['in'], explain: '泉州是城市，用 in。' },
    { type: 'choice', q: 'There is a picture ___ the wall and a window ___ the wall.', options: ['on; in', 'in; on', 'on; on'], answer: 0, explain: '画挂在墙面上用 on the wall；窗户嵌在墙里用 in the wall。' }
  ]
},

{
  id: 'g-yes-no-q', title: '一般疑问句与选择疑问句', short: '一般疑问句', module: 'syntax', grade: 4, freq: 2,
  prereqs: ['g-be'],
  tip: '变一般疑问句先看句中有没有 be 动词或情态动词，没有就借助 do / does / did，动词还原；选择疑问句不能用 Yes / No 回答。',
  learn: [
    { h: '怎么变成一般疑问句', html: `<p>第一步：找句子里有没有 <b>be 动词</b>（am / is / are / was / were）或 <b>can、will</b> 等。</p>
      <ul><li><b>有</b>：把它提到句首</li>
      <li><b>没有</b>：句首加 Do / Does / Did，后面的动词<b>变回原形</b></li></ul>
      <table class="tbl"><tr><th>原句</th><th>一般疑问句</th></tr>
      <tr><td>She is a nurse.</td><td>Is she a nurse?</td></tr>
      <tr><td>He can swim.</td><td>Can he swim?</td></tr>
      <tr><td>They like apples.</td><td>Do they like apples?</td></tr>
      <tr><td>Tom plays football.</td><td>Does Tom play football?</td></tr>
      <tr><td>She went to Beijing.</td><td>Did she go to Beijing?</td></tr></table>
      <p class="warn">变疑问句时，some 一般变成 any，I / my 变成 you / your：I have some friends here. → Do you have any friends here?</p>` },
    { h: '怎么回答', html: `<div class="rhyme">用什么问，就用什么答；<br>主语换成代词它。</div>
      <p class="ex">Does your father like coffee? Yes, he does.<span class="zh">你爸爸喜欢咖啡吗？是的。</span></p>
      <p class="ex">Can you swim? No, I can't.<span class="zh">你会游泳吗？不会。</span></p>
      <p class="ex">Are these your books? Yes, they are.<span class="zh">这些是你的书吗？是的。</span></p>
      <p class="warn">肯定的简短回答不能缩写：Yes, he is.（不能写 Yes, he's.）</p>` },
    { h: '选择疑问句', html: `<p>用 <b>or</b> 给出两个选项让对方选，回答时直接说选哪一个，<b>不能用 Yes / No</b>：</p>
      <p class="ex">Is your bag red or blue? It's blue.<span class="zh">你的包是红色的还是蓝色的？蓝色的。</span></p>
      <p class="ex">Do you like tea or coffee? Coffee, please.<span class="zh">你喜欢茶还是咖啡？咖啡，谢谢。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '—Does your father like coffee?<br>—Yes, ___.', options: ['he is', 'he does', 'he likes'], answer: 1, explain: '用 Does 提问，就用 does 回答。' },
    { type: 'choice', q: '—Is your bag red or blue?<br>—___.', options: ['Yes, it is', "No, it isn't", "It's blue"], answer: 2, explain: '选择疑问句不能用 Yes / No 回答，直接说选哪个。' },
    { type: 'fill', q: '改为一般疑问句：I have some friends here.<br>→ Do you have ___ friends here?（填一个词）', answer: ['any'], explain: '变一般疑问句时 some 一般改成 any。' },
    { type: 'fill', q: '改为一般疑问句：She is a nurse.<br>→ ___ she a nurse?（首字母大写）', answer: ['Is'], explain: '句中有 be 动词 is，直接把 is 提到句首。' },
    { type: 'fill', q: '改为一般疑问句：He can swim.<br>→ ___ he swim?（首字母大写）', answer: ['Can'], explain: '句中有情态动词 can，把 can 提到句首，swim 不变。' },
    { type: 'choice', q: '把 They like apples. 改为一般疑问句：', options: ['Do they like apples?', 'Are they like apples?', 'Do they likes apples?'], answer: 0, explain: '句中没有 be 动词和情态动词，主语是复数，借助 Do，后面动词用原形 like。' },
    { type: 'choice', q: '把 Tom plays football. 改为一般疑问句：', options: ['Does Tom play football?', 'Does Tom plays football?', 'Is Tom play football?'], answer: 0, explain: '主语 Tom 是三单，借助 Does；用了 Does，后面的 plays 要变回原形 play。' },
    { type: 'choice', q: '把 She went to Beijing. 改为一般疑问句：', options: ['Did she go to Beijing?', 'Did she went to Beijing?', 'Does she go to Beijing?'], answer: 0, explain: 'went 是过去式，借助 Did；用了 Did，后面动词还原成 go。' },
    { type: 'fill', q: '改为一般疑问句：I like my new school.<br>→ Do you like ___ new school?（填一个词）', answer: ['your'], explain: '变成问对方的句子时，I 变成 you，my 变成 your。' },
    { type: 'choice', q: '—Is he your brother?<br>—Yes, ___.', options: ['he is', "he's", 'is he'], answer: 0, explain: '肯定的简短回答不能缩写，要说 Yes, he is.' }
  ],
  tests: [
    { type: 'choice', q: '___ you a student?', options: ['Do', 'Are', 'Is'], answer: 1, explain: '句中没有实义动词，主语是 you，用 be 动词 are 提问。' },
    { type: 'choice', q: '___ your brother play basketball after school?', options: ['Do', 'Does', 'Is'], answer: 1, explain: '有实义动词 play，主语 your brother 是三单，用 Does。' },
    { type: 'choice', q: '—Can you swim?<br>—No, I ___.', options: ['can', "can't", "don't"], answer: 1, explain: '用 can 提问，否定回答用 can\'t。' },
    { type: 'fill', q: '改为一般疑问句：He went to school yesterday.<br>→ ___ he go to school yesterday?（首字母大写）', answer: ['Did'], explain: 'went 是过去式，借助 Did 提问，后面 go 用原形。' },
    { type: 'fill', q: '—Do you have ___ brothers?<br>—Yes, I have two.（填 some 或 any）', answer: ['any'], explain: '一般疑问句中一般用 any。' },
    { type: 'choice', q: '—Is your brother a teacher or a doctor?<br>—___.', options: ['Yes, he is', "No, he isn't", "He's a doctor"], answer: 2, explain: '有 or 的选择疑问句，不能用 Yes / No 回答。' },
    { type: 'choice', q: '—Are these your books?<br>—Yes, ___.', options: ['they are', 'these are', 'it is'], answer: 0, explain: 'these 提问，回答用 they 代替；books 是复数，用 are。' },
    { type: 'choice', q: '___ your parents at home now?', options: ['Is', 'Are', 'Do'], answer: 1, explain: '句中没有实义动词，主语 your parents 是复数，用 Are 提问。' },
    { type: 'fill', q: '改为一般疑问句：They were in the park.<br>→ ___ they in the park?（首字母大写）', answer: ['Were'], explain: '句中有 be 动词 were，直接提到句首。' },
    { type: 'fill', q: '改为一般疑问句：She will come tomorrow.<br>→ ___ she come tomorrow?（首字母大写）', answer: ['Will'], explain: '句中有 will，把 will 提到句首。' },
    { type: 'choice', q: '—___ you play the piano?<br>—Yes, I can.', options: ['Can', 'Do', 'Are'], answer: 0, explain: '答语用 can 回答，说明问句用 Can 提问——用什么问，就用什么答。' },
    { type: 'choice', q: '___ they live in Fuzhou?', options: ['Do', 'Does', 'Are'], answer: 0, explain: '有实义动词 live，主语 they 是复数，借助 Do。' },
    { type: 'fill', q: '改错：Do you likes English? 句中有一个词错了，写出改正后的词。', answer: ['like'], explain: '用了 Do / Does / Did 提问，后面的动词要用原形：Do you like English?' },
    { type: 'fill', q: '改为一般疑问句：My mother works in a hospital.<br>→ ___ your mother work in a hospital?（首字母大写）', answer: ['Does'], explain: '主语是三单，借助 Does，works 还原成 work；my 变成 your。' },
    { type: 'choice', q: 'Does she ___ milk every day?', options: ['drink', 'drinks', 'drinking'], answer: 0, explain: 'Does 后面的动词用原形。' },
    { type: 'choice', q: '___ you watch TV last night?', options: ['Did', 'Do', 'Were'], answer: 0, explain: 'last night 是过去时间，有实义动词 watch，借助 Did。' },
    { type: 'choice', q: 'Is there ___ milk in the cup?', options: ['some', 'any', 'many'], answer: 1, explain: '一般疑问句中一般用 any；milk 不可数，不能用 many。' },
    { type: 'fill', q: '改为一般疑问句：This is my book.<br>→ Is this ___ book?（填一个词）', answer: ['your'], explain: '问对方时 my 变成 your。' },
    { type: 'fill', q: '改为一般疑问句：We have some new books.<br>→ Do ___ have any new books?（填一个词）', answer: ['you'], explain: '问对方时 we 变成 you，some 变成 any。' },
    { type: 'choice', q: '—Are you hungry?<br>—Yes, ___.', options: ['I am', "I'm", 'I do'], answer: 0, explain: '用 Are 问，用 am 回答；肯定简短回答不能缩写成 I\'m。' },
    { type: 'fill', q: "改错：—Is she a teacher? —Yes, she's.<br>正确的答语是 Yes, ___.（填两个词）", answer: ['she is'], explain: '肯定的简短回答不能缩写：Yes, she is.' },
    { type: 'choice', q: '听问句，选出正确的答语。', say: 'Does your sister like music?', options: ['Yes, she does.', 'Yes, she is.', 'Yes, she likes.'], answer: 0, explain: '用 Does 问，就用 does 回答：Yes, she does.' },
    { type: 'choice', q: "—Do you go to school by bus or by bike?<br>—___", options: ['By bike.', 'Yes, I do.', "No, I don't."], answer: 0, explain: '有 or 的选择疑问句，直接回答选哪一个，不能用 Yes / No。' },
    { type: 'choice', q: '听问句，选出正确的答语。', say: 'Is your pet a cat or a dog?', options: ["It's a dog.", 'Yes, it is.', "No, it isn't."], answer: 0, explain: '选择疑问句不能用 Yes / No 回答，要说出具体选哪一个。' }
  ]
},

{
  id: 'g-wh-q', title: '特殊疑问句（疑问词）', short: '特殊疑问句', module: 'syntax', grade: 4, freq: 3,
  prereqs: ['g-yes-no-q'],
  tip: '情景对话里常考“根据答语选疑问词”：what / which、who / whose、when / what time 最容易混，一定要看答语回答的是什么。',
  learn: [
    { h: '常用疑问词', html: `<table class="tbl"><tr><th>疑问词</th><th>问什么</th><th>例句</th></tr>
      <tr><td>what</td><td>什么</td><td>What is this? It's a map.</td></tr>
      <tr><td>who</td><td>谁</td><td>Who is that girl? She's my sister.</td></tr>
      <tr><td>whose</td><td>谁的</td><td>Whose bag is this? It's Tom's.</td></tr>
      <tr><td>where</td><td>哪里</td><td>Where is my ruler? It's under the desk.</td></tr>
      <tr><td>when</td><td>什么时候</td><td>When is your birthday? It's on May 4th.</td></tr>
      <tr><td>what time</td><td>几点</td><td>What time is it? It's seven.</td></tr>
      <tr><td>which</td><td>哪一个（有范围）</td><td>Which one do you want, the red one or the blue one?</td></tr>
      <tr><td>why</td><td>为什么</td><td>Why are you late? Because I missed the bus.</td></tr></table>
      <p class="small">how 一家人（how many, how often ...）比较多，单独在“How 系列疑问词”里讲。</p>` },
    { h: '句子结构', html: `<p>特殊疑问句 = <b>疑问词 + 一般疑问句</b>：</p>
      <p class="ex">Where is your father?<span class="zh">你爸爸在哪儿？</span></p>
      <p class="ex">What do you do on weekends?<span class="zh">你周末做什么？</span></p>
      <p class="warn">疑问词本身做主语时，后面直接接动词，不加 do / does：Who teaches you English?（不能写 Who does teach ...）</p>` },
    { h: '易混的疑问词', html: `<ul>
      <li><b>what</b> 没有范围；<b>which</b> 在给定的几个里面选</li>
      <li><b>who</b> 问人是谁；<b>whose</b> 问东西是谁的</li>
      <li><b>when</b> 问日期、时候；<b>what time</b> 只问钟点</li>
      <li><b>What day</b> 问星期几；<b>What's the date</b> 问几月几号</li></ul>
      <p class="ex">What day is it today? It's Monday.<span class="zh">今天星期几？星期一。</span></p>
      <p class="ex">What's the date today? It's May 1st.<span class="zh">今天几月几号？5 月 1 号。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: "—___ is your birthday?<br>—It's on May 4th.", options: ['When', 'Where', 'Who'], answer: 0, explain: '答语是日期，问“什么时候”用 When。' },
    { type: 'choice', q: "—___ bike is this?<br>—It's Tom's.", options: ['Who', 'Whose', 'Where'], answer: 1, explain: "答语 Tom's 是“汤姆的”，问“谁的”用 Whose。" },
    { type: 'choice', q: '—___ do you like better, apples or bananas?<br>—Bananas.', options: ['Whose', 'Which', 'Who'], answer: 1, explain: '在给定的两样里选，用 Which。' },
    { type: 'choice', q: "—___ is that in English?<br>—It's a map.", options: ['What', 'Who', 'Where'], answer: 0, explain: '答语说“是一张地图”，问东西“是什么”用 What。' },
    { type: 'choice', q: "—___ is that girl?<br>—She's my sister.", options: ['Who', 'Whose', 'What'], answer: 0, explain: '问人“是谁”用 Who；Whose 问“谁的”，后面要说某人的东西。' },
    { type: 'choice', q: "—___ are my keys?<br>—They're on the table.", options: ['Where', 'When', 'Which'], answer: 0, explain: '答语 on the table 是地点，用 Where。' },
    { type: 'choice', q: '—___ is the school trip?<br>—Next Friday.', options: ['When', 'What time', 'Where'], answer: 0, explain: '答语是某一天，不是钟点，用 When；What time 只问几点几分。' },
    { type: 'choice', q: "—___ is it now?<br>—It's half past nine.", options: ['What time', 'When', 'How'], answer: 0, explain: '问现在几点：What time is it now?' },
    { type: 'choice', q: '—___ do you like summer?<br>—Because I can swim in the sea.', options: ['Why', 'What', 'When'], answer: 0, explain: '答语用 Because 说原因，问“为什么”用 Why。' },
    { type: 'choice', q: 'What ___ your father do on weekends?', options: ['does', 'do', 'is'], answer: 0, explain: '特殊疑问句 = 疑问词 + 一般疑问句。有实义动词 do，主语 your father 是三单，借助 does。' },
    { type: 'fill', q: '—Who ___ the classroom every day?（clean 的适当形式）<br>—Lucy does.', answer: ['cleans'], explain: 'Who 本身做主语，后面直接接动词，不借助 does；Who 做主语看作三单，clean 加 s。' },
    { type: 'choice', q: '—___ do you usually have for breakfast?<br>—Bread and milk.<br>—___ cake do you want, the big one or the small one?<br>—The small one.', options: ['What; Which', 'Which; What', 'What; What'], answer: 0, explain: '第一问没有给出范围，用 What；第二问在大的和小的两块蛋糕里选，用 Which。' },
    { type: 'choice', q: "—___ is the boy in the photo?<br>—My cousin.<br>—___ camera is this?<br>—It's his.", options: ['Who; Whose', 'Whose; Who', 'Who; Who'], answer: 0, explain: '问人“是谁”用 Who；问东西“是谁的”用 Whose，后面常跟名词。' },
    { type: 'choice', q: "—___ today?<br>—It's October 1st.", options: ["What's the date", 'What day is it', 'What time is it'], answer: 0, explain: '答语是几月几号，问日期用 What\'s the date；What day 问星期几。' }
  ],
  tests: [
    { type: 'choice', q: '—___ is your English teacher?<br>—Miss Chen.', options: ['Who', 'Whose', 'What'], answer: 0, explain: '答语是人名，问“是谁”用 Who。' },
    { type: 'choice', q: '—___ do you go to school?<br>—At 7:30.', options: ['What time', 'Where', 'Why'], answer: 0, explain: '答语是钟点，用 What time。' },
    { type: 'choice', q: "—___ day is it today?<br>—It's Friday.", options: ['What', 'How', 'When'], answer: 0, explain: '问星期几用 What day。' },
    { type: 'choice', q: '—___ are you late?<br>—Because I missed the bus.', options: ['Why', 'Where', 'When'], answer: 0, explain: '答语用 Because 说原因，问“为什么”用 Why。' },
    { type: 'fill', q: "—___ is my ruler?<br>—It's under your desk.（填疑问词，首字母大写）", answer: ['Where'], explain: '答语是地点，用 Where。' },
    { type: 'fill', q: "—___ colour is your new coat?<br>—It's red.（填疑问词，首字母大写）", answer: ['What'], explain: '问颜色用 What colour。' },
    { type: 'choice', q: '—___ teaches you math?<br>—Mr. Wang does.', options: ['Who', 'Whose', 'Where'], answer: 0, explain: '问“谁教你数学”，Who 做主语，后面直接接动词 teaches。' },
    { type: 'fill', q: '—___ do you do on Sundays?<br>—I often play football.（填疑问词，首字母大写）', answer: ['What'], explain: '答语说做什么事情，问“做什么”用 What。' },
    { type: 'choice', q: '—___ do you want to be in the future?<br>—A doctor.', options: ['What', 'Which', 'Whose'], answer: 0, explain: '没有给出范围，问“想当什么”用 What；Which 要在给定的几个里选。' },
    { type: 'choice', q: '—___ is the man in the car?<br>—He is my uncle.', options: ['Who', 'Whose', 'Where'], answer: 0, explain: '答语说他是谁，问人用 Who。' },
    { type: 'fill', q: "—___ shoes are these?<br>—They're Lucy's.（填疑问词，首字母大写）", answer: ['Whose'], explain: "答语 Lucy's 是“露西的”，问“谁的”用 Whose。" },
    { type: 'choice', q: '听问句，选出正确的答语。', say: 'Whose ruler is this?', options: ["It's Jim's.", "It's on the desk.", "It's a ruler."], answer: 0, explain: '问“这是谁的尺子”，要回答谁的：It\'s Jim\'s.' },
    { type: 'choice', q: '听问句，选出正确的答语。', say: 'Where does your aunt work?', options: ['In a hospital.', 'At seven.', 'By bus.'], answer: 0, explain: 'Where 问地点，答 In a hospital.' },
    { type: 'fill', q: "—___ is Teachers' Day?<br>—It's on September 10th.（填疑问词，首字母大写）", answer: ['When'], explain: '答语是日期，问“什么时候”用 When。' },
    { type: 'choice', q: '—___ did you come back from Beijing?<br>—Last week.', options: ['When', 'What time', 'Where'], answer: 0, explain: '答语 Last week 不是钟点，用 When。' },
    { type: 'choice', q: '听问句，选出正确的答语。', say: 'What time do you usually get up?', options: ['At six thirty.', 'On Monday.', 'In the morning.'], answer: 0, explain: 'What time 只问钟点，要回答几点：At six thirty.' },
    { type: 'choice', q: '—___ T-shirt is yours, the red one or the white one?<br>—The white one.', options: ['Which', 'Whose', 'Who'], answer: 0, explain: '在红的和白的两件里选，用 Which。' },
    { type: 'fill', q: '—___ season do you like better, spring or autumn?<br>—Autumn.（你更喜欢哪个季节？填疑问词，首字母大写）', answer: ['Which'], explain: '给出了范围（春天或秋天），在其中选一个，用 Which。' },
    { type: 'fill', q: "—___ didn't you come to school yesterday?<br>—Because I was ill.（填疑问词，首字母大写）", answer: ['Why'], explain: '答语用 Because 说原因，用 Why。' },
    { type: 'fill', q: '改错：Where you live? 句中少了一个词，写出这个词。', answer: ['do'], explain: '疑问词后面要接一般疑问句的语序：Where do you live?' },
    { type: 'choice', q: 'What ___ Lucy like for breakfast?', options: ['does', 'do', 'is'], answer: 0, explain: '疑问词 + 一般疑问句：主语 Lucy 是三单，有实义动词 like，借助 does。' },
    { type: 'fill', q: '—Who ___ a red pen?（have 的适当形式）<br>—I do.', answer: ['has'], explain: 'Who 做主语，后面直接接动词，看作三单，用 has。' },
    { type: 'choice', q: '—___ was it yesterday?<br>—It was Sunday.', options: ['What day', 'What date', 'What time'], answer: 0, explain: '答语是星期几，用 What day。' },
    { type: 'fill', q: "—What's the ___ today?<br>—It's June 1st.（填一个词）", answer: ['date'], explain: '问几月几号用 What\'s the date today?' }
  ]
},

{
  id: 'g-imperative', title: '祈使句', short: '祈使句', module: 'syntax', grade: 4, freq: 2,
  prereqs: [],
  tip: "祈使句用动词原形开头；否定用 Don't + 动词原形（形容词前要有 be：Don't be late）；Let's 后面接动词原形。",
  learn: [
    { h: '什么是祈使句', html: `<p>表示<b>命令、请求、建议</b>的句子，主语 you 通常省略，直接用<b>动词原形</b>开头：</p>
      <p class="ex">Open the door, please.<span class="zh">请开门。</span></p>
      <p class="ex">Please sit down.<span class="zh">请坐。</span></p>
      <p class="ex">Be quiet! The baby is sleeping.<span class="zh">安静！宝宝在睡觉。</span></p>
      <p class="warn">句子里是形容词（quiet, careful, late）时，前面要用动词原形 be：Be careful!</p>` },
    { h: '否定祈使句', html: `<p>在句首加 <b>Don't</b>，后面还是动词原形：</p>
      <p class="ex">Don't run in the library.<span class="zh">不要在图书馆里跑。</span></p>
      <p class="ex">Don't be late for school again.<span class="zh">上学别再迟到了。</span></p>
      <p>公共标志常用 <b>No + 名词 / 动词-ing</b>：No smoking!（禁止吸烟） No parking!（禁止停车）</p>` },
    { h: "Let's 和 Let me", html: `<p><b>Let's = Let us</b>，表示“我们一起……吧”；let 后面用<b>宾格 + 动词原形</b>：</p>
      <p class="ex">Let's go swimming this afternoon.<span class="zh">我们今天下午去游泳吧。</span></p>
      <p class="ex">Let me help you.<span class="zh">让我来帮你。</span></p>
      <div class="rhyme">祈使句，动词打头阵；<br>否定前面加 Don't；<br>let 后宾格接原形。</div>` },
    { h: '怎么回应', html: `<ul>
      <li>建议 Let's ...：<span class="en">Good idea! / That sounds great. / OK.</span></li>
      <li>提醒 Don't ... / Don't forget to ...：<span class="en">OK, I won't. / Sorry, I won't.</span></li>
      <li>提醒 Remember to ...：<span class="en">OK, I will.</span></li></ul>
      <p class="ex">Don't be late again. Sorry, I won't.<span class="zh">别再迟到了。——对不起，我不会了。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '___ late for school again!', options: ["Don't", "Don't be", 'Not be'], answer: 1, explain: 'late 是形容词，前面要有 be；否定祈使句：Don\'t be late。' },
    { type: 'choice', q: "—Don't forget to bring your umbrella.<br>—___.", options: ["OK, I won't", "You're welcome", 'Yes, I do'], answer: 0, explain: "“别忘了带伞”，回答“好的，我不会忘”：OK, I won't." },
    { type: 'choice', q: '___ to the tape and repeat after it.', options: ['Listen', 'Listens', 'Listening'], answer: 0, explain: '祈使句省略主语 you，直接用动词原形开头。' },
    { type: 'choice', q: 'Please ___ down, boys and girls.', options: ['sit', 'sits', 'sitting'], answer: 0, explain: 'please 可以放句首，也可以放句末（前面加逗号），后面的动词都用原形：Please sit down. / Sit down, please.' },
    { type: 'choice', q: '___ careful! The road is very busy.', options: ['Be', 'Is', 'Do'], answer: 0, explain: 'careful 是形容词，祈使句要用 be 的原形 Be 开头。' },
    { type: 'choice', q: '___ touch the paintings, please.', options: ["Don't", 'No', 'Not'], answer: 0, explain: '否定祈使句在动词原形前加 Don\'t。' },
    { type: 'choice', q: '公园门口的牌子：“___ parking!”（禁止停车）', options: ['No', 'Not', "Don't"], answer: 0, explain: '公共标志常用 No + 名词 / 动词-ing：No parking!' },
    { type: 'choice', q: "Let's ___ a kite in the park.", options: ['fly', 'flying', 'to fly'], answer: 0, explain: "Let's 后接动词原形。" },
    { type: 'choice', q: 'Let ___ help you carry the box.', options: ['me', 'I', 'my'], answer: 0, explain: 'let 后面用宾格（me, us, him, her, them），再接动词原形。' },
    { type: 'choice', q: "—Let's play ping-pong after school.<br>—___", options: ['That sounds great.', 'Not at all.', "You're welcome."], answer: 0, explain: "回应 Let's ... 的建议，同意时说 That sounds great. / Good idea! / OK." },
    { type: 'choice', q: '—Remember to close the windows.<br>—___', options: ['OK, I will.', "OK, I won't.", 'Yes, I do.'], answer: 0, explain: '“记得要做”，回答“好的，我会的”：OK, I will.；Don\'t forget ... 才用 I won\'t。' }
  ],
  tests: [
    { type: 'choice', q: '___ the door, please.', options: ['Open', 'Opens', 'Opening'], answer: 0, explain: '祈使句用动词原形开头。' },
    { type: 'choice', q: '___ quiet, please! The baby is sleeping.', options: ['Is', 'Be', 'Are'], answer: 1, explain: '形容词 quiet 前用 be 的原形 Be。' },
    { type: 'choice', q: '___ run in the library.', options: ["Don't", 'Not', 'No'], answer: 0, explain: '否定祈使句用 Don\'t + 动词原形。' },
    { type: 'fill', q: "Let's ___ swimming this afternoon.（go 的适当形式）", answer: ['go'], explain: "Let's 后面接动词原形。" },
    { type: 'fill', q: '改为否定句：Play football in the street.<br>→ ___ play football in the street.（首字母大写）', answer: ["Don't", 'Do not'], explain: '否定祈使句在句首加 Don\'t。' },
    { type: 'choice', q: "—Let's go to the zoo this Sunday.<br>—___", options: ['Good idea!', "You're welcome.", 'Thank you.'], answer: 0, explain: '回应别人的建议用 Good idea!' },
    { type: 'choice', q: "—Don't be late for class again.<br>—___", options: ["Sorry, I won't.", 'Sorry, I will.', 'Yes, I am.'], answer: 0, explain: "回应“别再迟到”，表示“不会了”：Sorry, I won't." },
    { type: 'choice', q: '___ the dishes, please, Tom.', options: ['Wash', 'Washes', 'Washing'], answer: 0, explain: '祈使句用动词原形开头。' },
    { type: 'fill', q: '请坐下：___ sit down.（填一个词，首字母大写）', answer: ['Please'], explain: '礼貌地请求可以在句首加 Please，后面接动词原形。' },
    { type: 'choice', q: 'Close the window, ___.', options: ['please', 'pleases', 'pleased'], answer: 0, explain: 'please 放在句末时，前面用逗号隔开。' },
    { type: 'fill', q: '___ kind to animals.（填一个词，首字母大写）', answer: ['Be'], explain: 'kind 是形容词，祈使句前面要用动词原形 Be。' },
    { type: 'choice', q: "___ afraid. I'm here with you.", options: ["Don't be", "Don't", 'Not be'], answer: 0, explain: 'afraid 是形容词，否定祈使句要说 Don\'t be + 形容词。' },
    { type: 'fill', q: "Don't ___ late for the meeting.（填一个词）", answer: ['be'], explain: 'late 是形容词，Don\'t 后面要有 be：Don\'t be late.' },
    { type: 'choice', q: '听句子，选出你听到的句子。', say: "Don't be sad. You can try again.", options: ["Don't be sad.", "Don't sad.", 'Not be sad.'], answer: 0, explain: 'sad 是形容词，否定祈使句是 Don\'t be sad.' },
    { type: 'choice', q: '医院里的牌子：“___ smoking!”（禁止吸烟）', options: ['No', "Don't", 'Not'], answer: 0, explain: '公共标志用 No + 动词-ing：No smoking!' },
    { type: 'fill', q: '禁止停车：No ___!（park 的适当形式）', answer: ['parking'], explain: 'No 后面接名词或动词-ing：No parking!' },
    { type: 'choice', q: "Let's ___ home now. It's late.", options: ['go', 'goes', 'to go'], answer: 0, explain: "Let's 后接动词原形 go。" },
    { type: 'choice', q: 'Please let ___ go out to play, Mum.', options: ['us', 'we', 'our'], answer: 0, explain: 'let 后面用宾格 us。' },
    { type: 'fill', q: 'He is tired. Let him ___ a rest.（have 的适当形式）', answer: ['have'], explain: 'let + 宾格 + 动词原形：let him have a rest。' },
    { type: 'choice', q: "—Let's go and see a film this evening.<br>—___", options: ["OK. Let's go.", 'Thank you.', 'Yes, I do.'], answer: 0, explain: '同意别人的建议，可以说 OK. / Good idea!' },
    { type: 'fill', q: "—Don't forget your homework.<br>—OK, I ___.（填一个词，用缩写）", answer: ["won't"], explain: "回应 Don't forget ... 表示“不会忘”，用 I won't." },
    { type: 'choice', q: '—Remember to call me when you get home.<br>—___', options: ['OK, I will.', "OK, I won't.", "No, I don't."], answer: 0, explain: '回应 Remember to ...，答应会做：OK, I will.' },
    { type: 'fill', q: '—Remember to turn off the lights.<br>—OK, I ___.（填一个词）', answer: ['will'], explain: '回应 Remember to ...，用 I will。' }
  ]
},

/* ================= 五年级 ================= */
{
  id: 'g-adj-adv', title: '形容词与副词的用法', short: '形容词与副词', module: 'morph', grade: 5, freq: 3,
  prereqs: ['g-be'],
  tip: '短文填空高频：修饰名词、放在 be / look / feel 等后用形容词，修饰动词用副词（careful → carefully）；friendly、lovely 是形容词。',
  learn: [
    { h: '分工不同', html: `<div class="rhyme">形容词，修饰名词跟系动词；<br>副词修饰动词、形容词和副词。</div>
      <p><b>形容词</b>：放在名词前，或放在 be、look、feel、sound、taste 等系动词后</p>
      <p class="ex">Lily is a beautiful girl.<span class="zh">莉莉是个漂亮的女孩。</span></p>
      <p class="ex">The soup tastes good.<span class="zh">汤尝起来很好喝。</span></p>
      <p><b>副词</b>：修饰动词，说明动作“怎么样”</p>
      <p class="ex">She dances beautifully.<span class="zh">她跳舞跳得很美。</span></p>
      <p class="ex">Please listen carefully.<span class="zh">请仔细听。</span></p>` },
    { h: '形容词变副词', html: `<table class="tbl"><tr><th>情况</th><th>变法</th><th>例子</th></tr>
      <tr><td>一般情况</td><td>+ly</td><td>quick → quickly, careful → carefully</td></tr>
      <tr><td>辅音字母 + y</td><td>变 y 为 i，+ly</td><td>happy → happily, easy → easily</td></tr>
      <tr><td>辅音字母 + le</td><td>去 e，+y</td><td>gentle → gently, terrible → terribly</td></tr>
      <tr><td>特殊</td><td colspan="2">good → well；true → truly</td></tr>
      <tr><td>形副同形</td><td colspan="2">fast, hard, early, late, high</td></tr></table>
      <p class="ex">He runs fast and works hard.<span class="zh">他跑得快，工作努力。</span></p>` },
    { h: '易错点', html: `<ul>
      <li><b>friendly, lovely, lonely, lively</b> 虽然以 ly 结尾，但是<b>形容词</b>：She is friendly to us.</li>
      <li><b>hard</b> 努力地 ≠ <b>hardly</b> 几乎不；<b>late</b> 晚 ≠ <b>lately</b> 最近</li>
      <li>good 是形容词，well 是副词：She speaks English well.（well 表示“身体好”时也可以作形容词：I'm well.）</li>
      <li>形容词修饰 something / anything 等要放在后面：<span class="en">something interesting</span></li></ul>` },
    { h: '频度副词的位置', html: `<p>always, usually, often, sometimes, never 放在 <b>be 动词、情态动词之后，实义动词之前</b>：</p>
      <p class="ex">He is always late.<span class="zh">他总是迟到。</span></p>
      <p class="ex">I often get up early.<span class="zh">我经常早起。</span></p>` }
  ],
  examples: [
    { type: 'fill', q: 'Please listen ___.（careful）', answer: ['carefully'], explain: '修饰动词 listen 用副词，careful 加 ly。' },
    { type: 'choice', q: 'The music sounds ___.', options: ['nice', 'nicely', 'well'], answer: 0, explain: 'sound 是系动词，后面接形容词 nice。' },
    { type: 'choice', q: 'Lily dances ___.', options: ['beautifully', 'beautiful', 'nice'], answer: 0, explain: '修饰动词 dances，说明“跳得怎么样”，要用副词 beautifully。' },
    { type: 'choice', q: "It's a ___ day today. Let's go out to play.", options: ['sunny', 'sunnily', 'sun'], answer: 0, explain: '放在名词 day 前面修饰它，用形容词 sunny。' },
    { type: 'fill', q: 'The question is easy. I can answer it ___.（easy）', answer: ['easily'], explain: '修饰动词 answer 用副词；easy 是辅音字母 + y，变 y 为 i 再加 ly：easily。' },
    { type: 'fill', q: 'Please speak ___ to the baby.（gentle）', answer: ['gently'], explain: '修饰动词 speak 用副词；gentle 以辅音字母 + le 结尾，去 e 加 y：gently。' },
    { type: 'choice', q: 'Lucy is a good singer. She sings very ___.', options: ['well', 'good', 'goodly'], answer: 0, explain: '修饰动词 sings 用副词；good 的副词是特殊形式 well，没有 goodly。' },
    { type: 'choice', q: 'He gets up ___ every morning, so he is never late.', options: ['early', 'earlily', 'earliness'], answer: 0, explain: 'early 形容词和副词同形，修饰动词 gets up 直接用 early。同类还有 fast, hard, late, high。' },
    { type: 'choice', q: 'The old man lives alone, but he never feels ___.', options: ['lonely', 'lonelily', 'alonely'], answer: 0, explain: 'feel 是系动词，后接形容词；lonely 虽然以 ly 结尾，但是形容词。' },
    { type: 'choice', q: "It's so dark that I can ___ see anything.", options: ['hardly', 'hard', 'hardest'], answer: 0, explain: 'hardly 意思是“几乎不”：太黑了，几乎看不见。hard 是“努力地”，两个意思完全不同。' },
    { type: 'choice', q: "—How are you?<br>—I'm ___, thank you.", options: ['well', 'badly', 'nicely'], answer: 0, explain: 'well 表示“身体好”时可以作形容词，放在 be 后面：I\'m well.' },
    { type: 'choice', q: 'I have ___ to tell you.', options: ['something important', 'important something', 'anything important'], answer: 0, explain: '形容词修饰 something / anything 等词要放在后面；肯定句用 something。' },
    { type: 'choice', q: 'Tom ___ to school by bike.', options: ['often goes', 'goes often', 'often go'], answer: 0, explain: '频度副词 often 放在实义动词之前；主语 Tom 是三单，用 goes。' }
  ],
  tests: [
    { type: 'fill', q: 'He did his homework ___.（quick）', answer: ['quickly'], explain: '修饰动词 did 用副词 quickly。' },
    { type: 'fill', q: 'The children are playing ___ in the park.（happy）', answer: ['happily'], explain: '修饰动词 playing 用副词；happy 辅音 + y，变 y 为 i 加 ly。' },
    { type: 'choice', q: 'Lily is a ___ girl. She dances ___.', options: ['beautiful; beautiful', 'beautiful; beautifully', 'beautifully; beautiful'], answer: 1, explain: '修饰名词 girl 用形容词，修饰动词 dances 用副词。' },
    { type: 'choice', q: 'Tom studies very ___, so he always gets good grades.', options: ['hard', 'hardly', 'harder'], answer: 0, explain: '“学习很努力”用 hard；hardly 是“几乎不”；very 不能修饰比较级。' },
    { type: 'choice', q: 'She speaks English very ___.', options: ['good', 'well', 'nice'], answer: 1, explain: '修饰动词 speaks 用副词 well。' },
    { type: 'choice', q: 'Our teacher is very ___ to us.', options: ['friend', 'friendly', 'friendlily'], answer: 1, explain: 'be 后用形容词，friendly 是形容词“友好的”。' },
    { type: 'choice', q: 'He ___ late for school.', options: ['always is', 'is always', 'always'], answer: 1, explain: '频度副词放在 be 动词之后：is always。' },
    { type: 'fill', q: 'This is an ___ book. I like it very much.（interest）', answer: ['interesting'], explain: '放在名词 book 前修饰它，用形容词 interesting；前面的 an 也说明这个词以元音开头。' },
    { type: 'choice', q: 'The cake smells ___.', options: ['delicious', 'deliciously', 'well'], answer: 0, explain: 'smell 是系动词，后面接形容词 delicious。' },
    { type: 'fill', q: 'You look ___ today. What happened?（sad）', answer: ['sad'], explain: 'look（看起来）是系动词，后面用形容词，不用副词 sadly。' },
    { type: 'choice', q: 'I feel ___ after the long walk.', options: ['tired', 'tiredly', 'tire'], answer: 0, explain: 'feel 是系动词，后面接形容词 tired。' },
    { type: 'fill', q: 'The old man walked ___ across the street.（slow）', answer: ['slowly'], explain: '修饰动词 walked 用副词，一般情况直接加 ly：slowly。' },
    { type: 'fill', q: 'He passed the test ___.（easy）', answer: ['easily'], explain: '修饰动词 passed 用副词；easy 变 y 为 i 加 ly。' },
    { type: 'fill', q: "I'm ___ sorry. I broke your cup.（terrible）", answer: ['terribly'], explain: '修饰形容词 sorry 用副词；terrible 去 e 加 y：terribly。' },
    { type: 'choice', q: 'The nurse held the baby ___.', options: ['gently', 'gentlely', 'gentle'], answer: 0, explain: '修饰动词 held 用副词；le 结尾去 e 加 y：gently，不能写 gentlely。' },
    { type: 'fill', q: 'He plays the piano very ___.（good）', answer: ['well'], explain: '修饰动词 plays 用副词，good 的副词是 well。' },
    { type: 'choice', q: 'Tom is a ___ swimmer. He swims ___.', options: ['good; well', 'well; good', 'good; good'], answer: 0, explain: '修饰名词 swimmer 用形容词 good；修饰动词 swims 用副词 well。' },
    { type: 'choice', q: 'The bird flies very ___ in the sky.', options: ['high', 'highly', 'tall'], answer: 0, explain: '“飞得高”用 high，它形容词和副词同形；highly 意思是“非常”，不表示具体的高；tall 指人、树、楼“个子高”，不能说飞得 tall。' },
    { type: 'fill', q: '改错：He runs very fastly. 句中有一个词错了，写出改正后的词。', answer: ['fast'], explain: 'fast 形容词和副词同形，没有 fastly 这个词。' },
    { type: 'choice', q: 'The baby panda is very ___.', options: ['lovely', 'love', 'lovelily'], answer: 0, explain: 'be 后用形容词；lovely 以 ly 结尾，但它是形容词“可爱的”。' },
    { type: 'fill', q: 'The street is ___ with music and people.（live 的形容词形式，以 ly 结尾）', answer: ['lively'], explain: 'lively（热闹的、充满活力的）以 ly 结尾，但是形容词，放在 be 后面。' },
    { type: 'choice', q: 'He got up ___ this morning, so he missed the bus.', options: ['late', 'lately', 'lateness'], answer: 0, explain: '起床晚了用 late（晚）；lately 是“最近”。' },
    { type: 'fill', q: 'She was so tired that she could ___ walk.（hard 的适当形式）', answer: ['hardly'], explain: '太累了，几乎走不动：hardly（几乎不）。' },
    { type: 'choice', q: '—Are you ___ today?<br>—Yes, I feel fine. Thank you.', options: ['well', 'badly', 'kindly'], answer: 0, explain: 'well 作形容词表示“身体好”，放在 be 后面。' },
    { type: 'choice', q: '听句子，奶奶怎么了？', say: "My grandma isn't very well these days.", options: ['身体不太好', '心情很好', '工作很忙'], answer: 0, explain: 'not very well 这里的 well 是形容词“身体好”，意思是身体不太好。' },
    { type: 'choice', q: "Is there ___ in today's newspaper?", options: ['anything new', 'new anything', 'new something'], answer: 0, explain: '形容词修饰 anything 要放在后面：anything new；疑问句用 anything。' },
    { type: 'fill', q: '改错：I want to eat delicious something.<br>正确语序：I want to eat something ___.（填一个词）', answer: ['delicious'], explain: '形容词修饰 something 要放在它后面：something delicious。' },
    { type: 'choice', q: 'My grandpa ___ busy on weekends.', options: ['is never', 'never is', 'never'], answer: 0, explain: '频度副词放在 be 动词之后：is never。' },
    { type: 'fill', q: '改错：I go often to the library.<br>正确语序：I ___ to the library.（填两个词）', answer: ['often go'], explain: '频度副词放在实义动词之前：often go。' }
  ]
},

{
  id: 'g-countable', title: '可数/不可数名词与 many / much / a few / a little', short: '数量词', module: 'morph', grade: 5, freq: 3,
  prereqs: ['g-plural'],
  tip: '高频考点：many / a few / few 修饰可数名词复数，much / a little / little 修饰不可数名词；few / little 表示否定“几乎没有”。',
  learn: [
    { h: '可数还是不可数', html: `<p><b>可数名词</b>：能一个一个数，有复数形式：apple → apples, book → books</p>
      <p><b>不可数名词</b>：不能直接数，没有复数，不能直接用 a / an：</p>
      <p class="small">water, milk, juice, tea, rice, bread, meat, food, money, time, homework, work（工作）, news, information, advice, weather, music, paper（纸）</p>
      <p class="warn">news 虽然有 s，但它是不可数名词，做主语时用 is：The news is exciting.</p>` },
    { h: '数量词分两队', html: `<table class="tbl"><tr><th>修饰可数名词复数</th><th>修饰不可数名词</th><th>意思</th></tr>
      <tr><td>many</td><td>much</td><td>许多</td></tr>
      <tr><td>a few</td><td>a little</td><td>一些（肯定）</td></tr>
      <tr><td>few</td><td>little</td><td>几乎没有（否定）</td></tr>
      <tr><td colspan="2">两队都能用：some, any, a lot of, lots of</td><td>一些 / 许多</td></tr></table>` },
    { h: '有 a 没 a 意思大不同', html: `<div class="rhyme">有 a 表示有一些，没 a 就是几乎没；<br>few 跟可数，little 跟不可数。</div>
      <p class="ex">I have a few friends here, so I don't feel lonely.<span class="zh">我在这里有几个朋友，所以不觉得孤独。</span></p>
      <p class="ex">There is little milk in the fridge. Let's buy some.<span class="zh">冰箱里几乎没有牛奶了，我们去买一些吧。</span></p>` },
    { h: 'some 和 any', html: `<ul>
      <li><b>some</b> 一般用于肯定句</li>
      <li><b>any</b> 一般用于否定句、疑问句</li>
      <li>表示<b>请求、建议</b>，希望对方说“好”时，疑问句也用 some</li></ul>
      <p class="ex">Would you like some juice?<span class="zh">你想喝点果汁吗？</span></p>
      <p class="ex">There isn't any water in the bottle.<span class="zh">瓶子里没有水。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: "There is ___ milk in the fridge. Let's go and buy some.", options: ['a little', 'little', 'few'], answer: 1, explain: '要去买，说明“几乎没有”；milk 不可数，用 little。' },
    { type: 'choice', q: "I have ___ friends here, so I don't feel lonely.", options: ['a few', 'few', 'a little'], answer: 0, explain: '不觉得孤独，说明“有一些”；friends 可数，用 a few。' },
    { type: 'choice', q: 'I want to buy two ___ and some ___.', options: ['apples; bread', 'apple; breads', 'apples; breads'], answer: 0, explain: 'apple 是可数名词，two 后面用复数 apples；bread 是不可数名词，没有复数，不能加 s。' },
    { type: 'choice', q: 'There ___ some juice in the bottle.', options: ['is', 'are', 'be'], answer: 0, explain: 'juice 是不可数名词，没有复数，做主语时用 is；不可数名词前也不能直接用 a / an。' },
    { type: 'choice', q: 'Here ___ some good news for you.', options: ['is', 'are', 'be'], answer: 0, explain: 'news 虽然以 s 结尾，但它是不可数名词，用 is。' },
    { type: 'choice', q: "I don't have ___ money with me. I can't buy the toy.", options: ['much', 'many', 'few'], answer: 0, explain: 'money 是不可数名词，“许多”用 much；many 修饰可数名词复数。' },
    { type: 'choice', q: 'We need ___ eggs and ___ milk to make the cake.', options: ['some; some', 'many; many', 'a few; a few'], answer: 0, explain: 'some 既能修饰可数名词复数（eggs），也能修饰不可数名词（milk）；many 和 a few 不能修饰不可数的 milk。a lot of / lots of 也是两队都能用。' },
    { type: 'choice', q: "There aren't ___ students in the classroom now.", options: ['any', 'some', 'a little'], answer: 0, explain: '否定句一般用 any；a little 不能修饰可数名词。' },
    { type: 'choice', q: "Can I have ___ water, please? I'm thirsty.", options: ['some', 'any', 'many'], answer: 0, explain: '表示请求、希望对方同意时，疑问句也用 some。' }
  ],
  tests: [
    { type: 'choice', q: 'There are too ___ cars on the road.', options: ['many', 'much', 'little'], answer: 0, explain: 'cars 是可数名词复数，用 many。' },
    { type: 'choice', q: 'Hurry up! There is ___ time left.', options: ['few', 'little', 'many'], answer: 1, explain: '要快点，说明时间“几乎没有”；time 不可数，用 little。' },
    { type: 'choice', q: 'I have ___ homework to do today.', options: ['many', 'a lot of', 'a few'], answer: 1, explain: 'homework 不可数，不能用 many 和 a few；a lot of 两种都能修饰。' },
    { type: 'fill', q: '—Would you like ___ juice?<br>—Yes, please.（填 some 或 any）', answer: ['some'], explain: 'Would you like ...? 表示提供、邀请，用 some。' },
    { type: 'fill', q: 'He can speak ___ English, so he can talk with the foreign teacher.（填 a little 或 little）', answer: ['a little'], explain: '能和外教交流，说明“会一点”，是肯定意思，用 a little。' },
    { type: 'choice', q: 'Can you give me some ___ about learning English?', options: ['advice', 'advices', 'an advice'], answer: 0, explain: 'advice 是不可数名词，不加 s，不用 an。' },
    { type: 'choice', q: 'The news ___ very exciting.', options: ['is', 'are', 'were'], answer: 0, explain: 'news 是不可数名词，用 is。' },
    { type: 'fill', q: 'There are three ___ on the plate.（tomato）', answer: ['tomatoes'], explain: 'tomato 是可数名词，three 后用复数，tomato 加 es：tomatoes。' },
    { type: 'choice', q: 'I can see many ___ in the sky.', options: ['birds', 'bird', 'a bird'], answer: 0, explain: 'bird 是可数名词，many 后面用复数 birds。' },
    { type: 'choice', q: 'There is ___ rice in the bowl.', options: ['some', 'a', 'many'], answer: 0, explain: 'rice 是不可数名词，不能用 a 和 many 修饰，可以用 some。' },
    { type: 'fill', q: '改错：I want to buy two breads. 应改为：two ___ of bread（填一个词）', answer: ['pieces'], explain: 'bread 不可数，没有复数；要表示数量，用“数词 + 量词 + of”：two pieces of bread。' },
    { type: 'fill', q: 'No news ___ good news.（be 的适当形式）', answer: ['is'], explain: 'news 是不可数名词，用 is。这句话的意思是“没有消息就是好消息”。' },
    { type: 'choice', q: "He didn't eat ___ food this morning, so he is hungry now.", options: ['much', 'many', 'a few'], answer: 0, explain: 'food 是不可数名词，用 much 修饰。' },
    { type: 'fill', q: 'There are too ___ people in the shop.（填 many 或 much）', answer: ['many'], explain: 'people 是可数名词复数，用 many。' },
    { type: 'choice', q: 'There is ___ water in the glass. You can drink it.', options: ['a little', 'little', 'a few'], answer: 0, explain: '你可以喝，说明“有一些”；water 不可数，用 a little。' },
    { type: 'choice', q: 'He is new here and feels lonely, because he has ___ friends.', options: ['few', 'a few', 'little'], answer: 0, explain: '感到孤独，说明“几乎没有”朋友；friends 可数，用 few。' },
    { type: 'fill', q: "There is ___ food in the fridge. Let's go shopping.（填 few 或 little）", answer: ['little'], explain: '要去买东西，说明“几乎没有”；food 不可数，用 little。' },
    { type: 'choice', q: 'There are ___ apples and ___ milk in the fridge.', options: ['a lot of; a lot of', 'many; many', 'much; much'], answer: 0, explain: 'a lot of 既能修饰可数名词复数（apples），也能修饰不可数名词（milk）。' },
    { type: 'fill', q: 'Is there ___ bread on the table?（填 some 或 any）', answer: ['any'], explain: '一般疑问句中一般用 any。' },
    { type: 'choice', q: "I have ___ pens, but I don't have ___ rulers.", options: ['some; any', 'any; some', 'any; any'], answer: 0, explain: '肯定句用 some，否定句用 any。' },
    { type: 'fill', q: 'Could you give me ___ paper, please?（填 some 或 any）', answer: ['some'], explain: '表示请求，希望对方给，疑问句中也用 some。' }
  ]
},

{
  id: 'g-too-also', title: '表示“也”：too / also / either', short: 'too/also/either', module: 'morph', grade: 5, freq: 2,
  prereqs: ['g-present-simple'],
  tip: '肯定句用 too / also，否定句用 either；too 和 either 放句末，also 放句中。',
  learn: [
    { h: '一张表分清', html: `<table class="tbl"><tr><th>词</th><th>用在</th><th>位置</th><th>例子</th></tr>
      <tr><td>too</td><td>肯定句</td><td>句末，前面常有逗号</td><td>I like apples, too.</td></tr>
      <tr><td>also</td><td>肯定句</td><td>句中</td><td>I also like apples.</td></tr>
      <tr><td>either</td><td>否定句</td><td>句末，前面常有逗号</td><td>I don't like apples, either.</td></tr></table>
      <div class="rhyme">too 和 also 肯定用，too 在句末 also 中；<br>either 专门管否定，也在句末逗号隔。</div>` },
    { h: 'also 放哪里', html: `<p>also 和频度副词位置一样：<b>be 动词、情态动词之后，实义动词之前</b>。</p>
      <p class="ex">She is also a student.<span class="zh">她也是一名学生。</span></p>
      <p class="ex">He can also swim.<span class="zh">他也会游泳。</span></p>
      <p class="ex">We also like playing football.<span class="zh">我们也喜欢踢足球。</span></p>` },
    { h: '口语里的“我也是”', html: `<ul>
      <li>别人说的是肯定句：<span class="en">Me too.</span></li>
      <li>句末还可以用 <b>as well</b>，意思和 too 一样：I like it as well.</li></ul>
      <p class="ex">I'm hungry. Me too.<span class="zh">我饿了。——我也是。</span></p>
      <p class="ex">Lucy can't speak Chinese. Lily can't speak Chinese, either.<span class="zh">露西不会说中文，莉莉也不会。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: 'Tom likes swimming. I like swimming, ___.', options: ['too', 'either', 'also'], answer: 0, explain: '肯定句、放在句末，用 too；also 不放句末。' },
    { type: 'choice', q: "Lucy can't speak Chinese. Lily can't speak Chinese, ___.", options: ['too', 'also', 'either'], answer: 2, explain: "can't 是否定句，“也”用 either。" },
    { type: 'choice', q: 'My father likes tea. My mother ___ likes tea.', options: ['also', 'too', 'either'], answer: 0, explain: '肯定句，空格在句中动词 likes 前，用 also；too 放句末，either 用于否定句。' },
    { type: 'choice', q: '下面哪一句是正确的？', options: ['She is also a student.', 'She also is a student.', 'She is a student also.'], answer: 0, explain: 'also 用在肯定句中，放在 be 动词、情态动词之后，实义动词之前，所以放在 is 后面。' },
    { type: 'choice', q: "—I like ice cream.<br>—___ It's my favourite.", options: ['Me too.', 'Me either.', 'I too.'], answer: 0, explain: '对方说的是肯定句，口语中“我也是”用 Me too.' },
    { type: 'fill', q: 'I like reading. My sister likes reading as ___.（填一个词）', answer: ['well'], explain: 'as well 放在句末，意思和 too 一样，用于肯定句。' }
  ],
  tests: [
    { type: 'choice', q: "I don't like hamburgers. My brother doesn't like them, ___.", options: ['too', 'either', 'also'], answer: 1, explain: '否定句句末的“也”用 either。' },
    { type: 'choice', q: 'My father is a teacher. My mother is ___ a teacher.', options: ['also', 'too', 'either'], answer: 0, explain: '放在句中 be 动词后，用 also。' },
    { type: 'choice', q: 'She can sing, and she can dance ___.', options: ['either', 'too', 'also'], answer: 1, explain: '肯定句句末用 too。' },
    { type: 'fill', q: 'I am a student. He is a student, ___.（填 too / also / either）', answer: ['too'], explain: '肯定句、句末，用 too。' },
    { type: 'fill', q: "Jim didn't go to the party. Kate didn't go, ___.（填 too / also / either）", answer: ['either'], explain: "didn't 是否定句，句末用 either。" },
    { type: 'choice', q: 'We ___ like playing football.', options: ['also', 'too', 'either'], answer: 0, explain: '放在实义动词 like 之前，用 also。' },
    { type: 'choice', q: "—I'm hungry.<br>—___ Let's get something to eat.", options: ['Me too.', 'Me either.', 'Me also.'], answer: 0, explain: '对方说的是肯定句，“我也是”用 Me too.' },
    { type: 'choice', q: "Mr. Green isn't at home. His wife isn't at home, ___.", options: ['either', 'too', 'also'], answer: 0, explain: "isn't 是否定句，句末的“也”用 either。" },
    { type: 'fill', q: '改错：I like apples, either. 句中有一个词用错了，写出改正后的词。', answer: ['too'], explain: '这是肯定句，句末的“也”要用 too；either 只用于否定句。' },
    { type: 'fill', q: 'Lucy can sing. She can ___ dance.（填 also / too / either）', answer: ['also'], explain: '放在情态动词 can 之后、动词 dance 之前，用 also。' },
    { type: 'fill', q: '改错：I also am a student.<br>正确语序：I am ___ a student.（填一个词）', answer: ['also'], explain: 'also 要放在 be 动词之后：I am also a student.' },
    { type: 'choice', q: '听句子，选出表示“我也是”的答语。', say: "I'm going to the park this afternoon.", options: ['Me too.', 'Me either.', "I'm not."], answer: 0, explain: '对方说的是肯定句，表示“我也是”用 Me too.' },
    { type: 'choice', q: 'Tom plays basketball, and he plays football ___.', options: ['as well', 'either', 'also'], answer: 0, explain: '肯定句的句末用 as well（= too）；either 用于否定句，also 不放句末。' },
    { type: 'fill', q: '同义句：I can swim, too. = I can swim as ___.（填一个词）', answer: ['well'], explain: 'as well 和 too 一样放在肯定句的句末。' }
  ]
},

{
  id: 'g-would-like', title: 'would like 与 Would you like...?', short: 'would like', module: 'syntax', grade: 5, freq: 2,
  prereqs: ['g-yes-no-q'],
  tip: "would like + 名词 / to do；Would you like some ...? 回答 Yes, please. / No, thanks.；Would you like to ...? 肯定回答常用 Yes, I'd love to.",
  learn: [
    { h: '意思和结构', html: `<p><b>would like</b> = want（想要），但更<b>礼貌</b>。I would like 常缩写成 <b>I'd like</b>。</p>
      <ul><li>would like + <b>名词</b>：I'd like a cup of tea.</li>
      <li>would like + <b>to do</b>：I'd like to go to the zoo.</li>
      <li>would like + 某人 + <b>to do</b>：My mother would like me to eat more vegetables.</li></ul>
      <p class="warn">would 没有人称变化，后面的 like 也不加 s：She would like a new bike.（不能写 She woulds likes）</p>` },
    { h: 'Would you like ...? 怎么回答', html: `<table class="tbl"><tr><th>问句</th><th>接受</th><th>拒绝</th></tr>
      <tr><td>Would you like some tea?</td><td>Yes, please.</td><td>No, thanks.</td></tr>
      <tr><td>Would you like to go with us?</td><td>Yes, I'd love to.</td><td>I'd love to, but I have to ...</td></tr></table>
      <p class="ex">Would you like to go hiking with us? I'd love to, but I have to look after my sister.<span class="zh">你想和我们去远足吗？——我很想去，但我得照顾妹妹。</span></p>` },
    { h: '问对方想要什么', html: `<p class="ex">What would you like? I'd like some noodles.<span class="zh">你想要点什么？——我想要些面条。</span></p>
      <p class="ex">What would you like to drink? Orange juice, please.<span class="zh">你想喝点什么？——请给我橙汁。</span></p>` },
    { h: 'like doing 和 would like to do', html: `<ul>
      <li><b>like doing</b>：喜欢做某事（平时的爱好）</li>
      <li><b>would like to do</b>：想要做某事（这一次的愿望）</li></ul>
      <p class="ex">I like playing basketball, and I'd like to play basketball with you now.<span class="zh">我喜欢打篮球，现在我想和你一起打。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: "—Would you like some milk?<br>—___. I'm thirsty.", options: ['Yes, please', 'No, thanks', 'Yes, I would like'], answer: 0, explain: '口渴了所以接受，用 Yes, please.' },
    { type: 'choice', q: "I'd like ___ a cup of tea.", options: ['to have', 'having', 'have'], answer: 0, explain: 'would like 后面接 to do。' },
    { type: 'fill', q: 'I would like a glass of water. = ___ like a glass of water.（填缩写形式）', answer: ["I'd"], explain: "I would 可以缩写成 I'd，意思不变，都是礼貌地表示“想要”。" },
    { type: 'choice', q: "I'd like ___ for lunch.", options: ['some rice', 'eat rice', 'eating rice'], answer: 0, explain: 'would like 后面可以直接接名词：some rice；如果接动词，要用 to do。' },
    { type: 'choice', q: 'Our teacher would like us ___ more English books.', options: ['to read', 'read', 'reading'], answer: 0, explain: 'would like sb. to do：想让某人做某事。' },
    { type: 'choice', q: 'My sister ___ a new dress for her birthday.', options: ['would like', 'woulds like', 'would likes'], answer: 0, explain: 'would 没有人称变化，后面的 like 也不加 s，主语是三单也一样。' },
    { type: 'choice', q: '—Would you like to come to my party?<br>—___', options: ["Yes, I'd love to.", 'Yes, I like.', 'Yes, I do.'], answer: 0, explain: "回答 Would you like to ...? 的邀请，接受时常说 Yes, I'd love to." },
    { type: 'choice', q: '—What would you like to drink?<br>—___', options: ['Orange juice, please.', "I'd like noodles.", 'Yes, please.'], answer: 0, explain: '问“想喝什么”，要说出一种饮料；noodles 不是喝的，Yes, please 不回答“什么”。' },
    { type: 'choice', q: "I like ___, but today I'd like ___ at home.", options: ['swimming; to stay', 'to swimming; staying', 'swim; stay'], answer: 0, explain: 'like doing 表示平时的爱好；would like to do 表示这一次想做的事。' }
  ],
  tests: [
    { type: 'choice', q: 'She would like ___ a new bike.', options: ['buy', 'to buy', 'buys'], answer: 1, explain: 'would like to do：想要做某事。' },
    { type: 'choice', q: '—Would you like to go hiking with us?<br>—___, but I have to look after my sister.', options: ["I'd love to", 'Yes, please', "No, I don't"], answer: 0, explain: "后面有 but 说明想去但去不了，用 I'd love to, but ...。" },
    { type: 'choice', q: '—What ___ you like to eat?<br>—Some noodles, please.', options: ['would', 'does', 'are'], answer: 0, explain: '“你想吃什么”用 What would you like to eat?；does 和 are 都不能跟 you 这样搭配。' },
    { type: 'fill', q: "I'd like ___ to the zoo this weekend.（go，用适当形式）", answer: ['to go'], explain: 'would like 后面接 to do。' },
    { type: 'fill', q: "—Would you like some cake?<br>—No, ___. I'm full.（填一个词）", answer: ['thanks'], explain: '拒绝别人的食物用 No, thanks.' },
    { type: 'choice', q: 'My mother would like me ___ more vegetables.', options: ['eat', 'to eat', 'eating'], answer: 1, explain: 'would like sb. to do：想让某人做某事。' },
    { type: 'choice', q: "I like ___ basketball, and I'd like ___ basketball with you now.", options: ['playing; to play', 'to playing; play', 'play; playing'], answer: 0, explain: 'like doing 表示爱好；would like to do 表示现在想做。' },
    { type: 'choice', q: '—What can I do for you?<br>—___ like a hamburger, please.', options: ["I'd", "I'm", "I've"], answer: 0, explain: "I'd like = I would like，礼貌地说“我想要”。" },
    { type: 'fill', q: 'She would like some cake. = ___ like some cake.（填缩写形式，首字母大写）', answer: ["She'd"], explain: "she would 缩写成 she'd。" },
    { type: 'choice', q: 'I would like ___.', options: ['a bowl of noodles', 'eat noodles', 'noodle'], answer: 0, explain: 'would like 后面接名词：a bowl of noodles；接动词要用 to eat。' },
    { type: 'fill', q: 'Would you like ___ apple?（填 a 或 an）', answer: ['an'], explain: 'would like 后面接名词；apple 以元音开头，用 an。' },
    { type: 'fill', q: 'My parents would like me ___ a doctor.（be，用适当形式）', answer: ['to be'], explain: 'would like sb. to do：想让某人做某事。' },
    { type: 'choice', q: 'He ___ to go to the zoo this weekend.', options: ['would like', 'would likes', 'woulds like'], answer: 0, explain: 'would like 没有人称变化，三单主语也用 would like。' },
    { type: 'fill', q: '改错：Tom would likes to play football. 句中有一个词错了，写出改正后的词。', answer: ['like'], explain: 'would 后面接动词原形，like 不加 s。' },
    { type: 'choice', q: '听问句，选出正确的答语。', say: 'Would you like some bread?', options: ['Yes, please.', "Yes, I'd love to.", 'Yes, I like.'], answer: 0, explain: 'Would you like some ...? 是问要不要某样东西，接受时说 Yes, please.' },
    { type: 'fill', q: '—Would you like to watch a film with me?<br>—Yes, I\'d love ___.（填一个词）', answer: ['to'], explain: "接受邀请：Yes, I'd love to.，to 不能省略。" },
    { type: 'choice', q: '听问句，选出正确的答语。', say: 'Would you like to play football with us?', options: ["I'd love to, but I have a cold.", 'Here you are.', "No, thanks. I'm full."], answer: 0, explain: "想去但去不了，用 I'd love to, but ...；I'm full 是拒绝食物时说的。" },
    { type: 'fill', q: '—What ___ you like?<br>—Some dumplings, please.（填一个词）', answer: ['would'], explain: '问对方想要什么：What would you like?' },
    { type: 'fill', q: '改错：I would like playing games with you now.<br>playing 应改为：___（填两个词）', answer: ['to play'], explain: 'would like 后面接 to do，表示这一次想做的事。' }
  ]
},

/* ================= 六年级 ================= */
{
  id: 'g-how-q', title: 'How 系列疑问词辨析', short: 'How 疑问词', module: 'syntax', grade: 6, freq: 3,
  prereqs: ['g-wh-q', 'g-countable'],
  tip: '情景对话必考：how often（频率）、how long（多长时间）、how soon（多久以后）、how far（多远）、how many / how much，一定要根据答语来选。',
  learn: [
    { h: 'How 一家人', html: `<table class="tbl"><tr><th>疑问词</th><th>问什么</th><th>答语例子</th></tr>
      <tr><td>how</td><td>怎么样、用什么方式</td><td>Fine, thanks. / By bus.</td></tr>
      <tr><td>how old</td><td>年龄</td><td>I'm twelve.</td></tr>
      <tr><td>how many</td><td>数量（可数名词复数）</td><td>Forty-five.</td></tr>
      <tr><td>how much</td><td>数量（不可数名词）；价钱</td><td>It's 50 yuan.</td></tr>
      <tr><td>how often</td><td>频率，多久一次</td><td>Twice a week. / Every day.</td></tr>
      <tr><td>how long</td><td>多长时间；多长</td><td>For two hours. / About 3 metres.</td></tr>
      <tr><td>how soon</td><td>多久以后（将来）</td><td>In ten minutes.</td></tr>
      <tr><td>how far</td><td>多远（距离）</td><td>About 2 kilometres. / Ten minutes' walk.</td></tr></table>` },
    { h: '最容易混的四兄弟', html: `<div class="rhyme">often 问频率，几次几回答；<br>long 问多长时间，for 加一段；<br>soon 问多久以后，in 加一段；<br>far 问有多远，公里、步行都能答。</div>
      <p class="ex">How often do you play basketball? Twice a week.<span class="zh">你多久打一次篮球？——一周两次。</span></p>
      <p class="ex">How long did you stay in Beijing? For two weeks.<span class="zh">你在北京待了多久？——两周。</span></p>
      <p class="ex">How soon will your father come back? In two days.<span class="zh">你爸爸多久以后回来？——两天后。</span></p>
      <p class="ex">How far is it from your home to school? About two kilometres.<span class="zh">你家离学校多远？——大约两公里。</span></p>` },
    { h: 'how many 和 how much', html: `<ul>
      <li><b>how many</b> + 可数名词复数：How many students are there in your class?</li>
      <li><b>how much</b> + 不可数名词：How much water do you drink every day?</li>
      <li><b>how much</b> 还能问价钱：How much is the T-shirt? How much are the shoes?</li></ul>` },
    { h: '其他常用说法', html: `<p class="ex">How do you go to school? By bike.<span class="zh">你怎么去上学？——骑自行车。</span></p>
      <p class="ex">How about going for a walk?<span class="zh">去散散步怎么样？（How about 后接名词或动词-ing）</span></p>
      <p class="ex">How do you like the film?<span class="zh">你觉得这部电影怎么样？（= What do you think of the film?）</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '—___ do you play basketball?<br>—Twice a week.', options: ['How long', 'How often', 'How soon'], answer: 1, explain: '答语“一周两次”是频率，用 How often。' },
    { type: 'choice', q: '—___ will your father come back?<br>—In two days.', options: ['How long', 'How often', 'How soon'], answer: 2, explain: '答语 in + 一段时间，表示“多久以后”，用 How soon。' },
    { type: 'choice', q: '—___ is it from your home to school?<br>—About 2 kilometres.', options: ['How far', 'How often', 'How soon'], answer: 0, explain: '答语是距离，用 How far。' },
    { type: 'choice', q: "—___ is your grandma?<br>—She's fine, thanks.", options: ['How', 'What', 'Who'], answer: 0, explain: '问身体、情况怎么样用 How；答语 fine 是“很好”。' },
    { type: 'choice', q: "—___ is your sister?<br>—She's eight.", options: ['How old', 'How many', 'How much'], answer: 0, explain: '答语是年龄，用 How old。' },
    { type: 'fill', q: '—How ___ apples do you want?<br>—Three, please.（填一个词）', answer: ['many'], explain: 'apples 是可数名词复数，问数量用 How many。' },
    { type: 'choice', q: '—___ water do you drink every day?<br>—Six glasses.', options: ['How much', 'How many', 'How often'], answer: 0, explain: 'water 是不可数名词，问数量用 How much（虽然答语里有 six glasses，但被问的是 water）。' },
    { type: 'choice', q: "—___ are the shoes?<br>—They're 120 yuan.", options: ['How much', 'How many', 'How long'], answer: 0, explain: '问价钱用 How much；shoes 是复数，所以 be 动词用 are。' },
    { type: 'choice', q: '—___ is the bridge?<br>—About 300 metres long.', options: ['How long', 'How far', 'How soon'], answer: 0, explain: 'How long 还可以问东西“有多长”；答语 300 metres long 说的是桥的长度，不是距离。' },
    { type: 'choice', q: '—___ did the football match last?<br>—For about two hours.', options: ['How long', 'How soon', 'How often'], answer: 0, explain: '答语 for + 一段时间，问“持续多长时间”用 How long。' },
    { type: 'choice', q: "I'm tired of watching TV. How about ___ for a walk?", options: ['going', 'go', 'to go'], answer: 0, explain: 'How about 后面接名词或动词-ing，表示提建议：How about going ...?' },
    { type: 'fill', q: 'How do you like the film? = What do you ___ of the film?（填一个词）', answer: ['think'], explain: 'How do you like ...? 和 What do you think of ...? 都是问“你觉得……怎么样”。' }
  ],
  tests: [
    { type: 'choice', q: "—___ is the T-shirt?<br>—It's 50 yuan.", options: ['How many', 'How much', 'How old'], answer: 1, explain: '问价钱用 How much。' },
    { type: 'choice', q: '—___ did you stay in Beijing?<br>—For two weeks.', options: ['How long', 'How soon', 'How often'], answer: 0, explain: '答语 for + 一段时间，问“多长时间”用 How long。' },
    { type: 'choice', q: '—___ students are there in your class?<br>—Forty-five.', options: ['How much', 'How many', 'How old'], answer: 1, explain: 'students 是可数名词复数，问数量用 How many。' },
    { type: 'choice', q: '—___ do you go to the library?<br>—Once a week.', options: ['How long', 'How often', 'How far'], answer: 1, explain: '答语“一周一次”是频率，用 How often。' },
    { type: 'fill', q: "—___ is your school from here?<br>—It's about ten minutes' walk.（填两个词，首字母大写）", answer: ['How far'], explain: '“步行十分钟的路程”说的是距离，用 How far。' },
    { type: 'fill', q: '—___ will the bus arrive?<br>—In five minutes.（填两个词，首字母大写）', answer: ['How soon'], explain: '答语 in + 一段时间，问“多久以后”用 How soon。' },
    { type: 'choice', q: '—___ do you go to school every day?<br>—By bike.', options: ['How', 'What', 'Why'], answer: 0, explain: '答语是交通方式，用 How 提问。' },
    { type: 'choice', q: '听问句，选出正确的答语。', say: 'How are you today?', options: ["I'm fine, thank you.", "I'm twelve.", 'By bus.'], answer: 0, explain: 'How are you? 问身体情况，回答 I\'m fine, thank you.' },
    { type: 'fill', q: '—How ___ is your grandpa?<br>—He is seventy.（填一个词）', answer: ['old'], explain: '答语是年龄，用 How old。' },
    { type: 'choice', q: '—___ is your brother?<br>—He is 1.6 metres tall.', options: ['How old', 'How tall', 'How many'], answer: 1, explain: '答语 1.6 metres tall 说的是身高，用 How tall。' },
    { type: 'fill', q: '—How ___ people are there in your family?<br>—Five.（填一个词）', answer: ['many'], explain: 'people 是可数名词（复数意义），问数量用 How many。' },
    { type: 'choice', q: '—___ milk do you need?<br>—Two bottles.', options: ['How much', 'How many', 'How long'], answer: 0, explain: 'milk 是不可数名词，问数量用 How much。' },
    { type: 'fill', q: '—How ___ bread is there in the bag?<br>—Only a little.（填一个词）', answer: ['much'], explain: 'bread 是不可数名词，问数量用 How much。' },
    { type: 'choice', q: '听问句，选出正确的答语。', say: 'How much is this skirt?', options: ["It's 80 yuan.", "It's red.", "It's small."], answer: 0, explain: 'How much 问价钱，要回答多少钱。' },
    { type: 'fill', q: '—How ___ do you visit your grandparents?<br>—Every month.（填一个词）', answer: ['often'], explain: '答语 Every month 是频率，用 How often。' },
    { type: 'fill', q: '—How ___ is the river?<br>—About 6,000 kilometres long.（填一个词）', answer: ['long'], explain: '问河流“有多长”用 How long，答语 ... long 说的是长度。' },
    { type: 'choice', q: '—___ does it take you to get to school?<br>—About twenty minutes.', options: ['How long', 'How far', 'How soon'], answer: 0, explain: 'it takes ... 问花费多长时间，用 How long。' },
    { type: 'choice', q: '—___ will you finish the work?<br>—In an hour.', options: ['How soon', 'How long', 'How often'], answer: 0, explain: '答语 in + 一段时间，问“多久以后”用 How soon。' },
    { type: 'choice', q: "—___ is the park from here?<br>—It's about three kilometres away.", options: ['How far', 'How long', 'How much'], answer: 0, explain: '答语是距离（... away），用 How far。' },
    { type: 'fill', q: 'How about ___ basketball after school?（play 的适当形式）', answer: ['playing'], explain: 'How about 后面接动词-ing：How about playing ...?' },
    { type: 'choice', q: "I'm going to the zoo this Sunday. ___ you?", options: ['How about', 'How', 'How often'], answer: 0, explain: 'How about you? 意思是“你呢？”，后面接名词或代词。' },
    { type: 'choice', q: '—How do you like Xiamen?<br>—___', options: ["It's beautiful.", 'By train.', 'For three days.'], answer: 0, explain: 'How do you like ...? 问“觉得……怎么样”，要说出看法。' },
    { type: 'fill', q: 'What do you think of the book? = How do you ___ the book?（填一个词）', answer: ['like'], explain: 'What do you think of ...? = How do you like ...?' }
  ]
}

);
