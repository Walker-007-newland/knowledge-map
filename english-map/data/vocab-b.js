// 词汇话题（下）：交通旅行、高频动词、节日家乡、情感性格、易混词、环保、科技、成长
KG.nodes.push(

/* ================= 六年级 ================= */
{
  id: 'v-travel-transport', title: '交通出行与旅游', short: '交通与旅行', module: 'vocab', grade: 6, freq: 2,
  prereqs: ['v-home-city'],
  tip: '中考常考交通方式的表达（by bus / on foot / take a bus）和 trip、travel 等旅行词，书面表达写“假期旅行”时也离不开它们。',
  learn: [
    { h: '交通工具', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">bus</span></td><td>公共汽车</td><td><span class="w">car</span></td><td>小汽车</td></tr>
      <tr><td><span class="w">taxi</span></td><td>出租车</td><td><span class="w">bike</span> / <span class="w">bicycle</span></td><td>自行车</td></tr>
      <tr><td><span class="w">train</span></td><td>火车</td><td><span class="w">high-speed train</span></td><td>高铁</td></tr>
      <tr><td><span class="w">plane</span></td><td>飞机</td><td><span class="w">ship</span></td><td>（大）船</td></tr>
      <tr><td><span class="w">boat</span></td><td>小船</td><td><span class="w">ferry</span></td><td>渡轮</td></tr>
      <tr><td><span class="w">subway</span> / <span class="w">underground</span> / <span class="w">metro</span></td><td>地铁</td><td><span class="w">motorbike</span></td><td>摩托车</td></tr></table>
      <p class="small">subway 是美式说法，underground 是英式说法，metro 很多城市都用。</p>` },
    { h: '出行与旅游词', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">station</span></td><td>车站</td><td><span class="w">airport</span></td><td>机场</td></tr>
      <tr><td><span class="w">bus stop</span></td><td>公交车站</td><td><span class="w">ticket</span></td><td>票</td></tr>
      <tr><td><span class="w">passenger</span></td><td>乘客</td><td><span class="w">driver</span></td><td>司机</td></tr>
      <tr><td><span class="w">traffic</span></td><td>交通</td><td><span class="w">traffic lights</span></td><td>红绿灯</td></tr>
      <tr><td><span class="w">map</span></td><td>地图</td><td><span class="w">passport</span></td><td>护照</td></tr>
      <tr><td><span class="w">hotel</span></td><td>宾馆</td><td><span class="w">suitcase</span></td><td>手提箱</td></tr>
      <tr><td><span class="w">luggage</span></td><td>行李（不可数）</td><td><span class="w">guide</span></td><td>导游</td></tr>
      <tr><td><span class="w">tourist</span></td><td>游客</td><td><span class="w">visitor</span></td><td>参观者</td></tr>
      <tr><td><span class="w">trip</span></td><td>（一次）旅行</td><td><span class="w">travel</span></td><td>旅行（动词 / 泛指）</td></tr>
      <tr><td><span class="w">journey</span></td><td>（长途）旅程</td><td><span class="w">tour</span></td><td>观光游览</td></tr>
      <tr><td><span class="w">sightseeing</span></td><td>观光</td><td><span class="w">souvenir</span></td><td>纪念品</td></tr></table>` },
    { h: '常用短语与句型', html: `<p class="small">by bus 坐公交, on foot 步行, take a bus / taxi 乘公交 / 出租车, ride a bike 骑车, drive a car 开车, get on / get off 上 / 下车, leave for 动身去, arrive in / at 到达, go on a trip 去旅行, have a good time 玩得开心, book a ticket 订票</p>
      <p class="ex">How do you go to school? — I go to school by bike.<span class="zh">你怎么上学？——我骑自行车上学。</span></p>
      <p class="ex">I walk to school. = I go to school on foot.<span class="zh">我步行上学。</span></p>
      <p class="ex">How long does it take to get there? — About half an hour.<span class="zh">到那里要多长时间？——大约半小时。</span></p>
      <p class="ex">It is about ten minutes' walk from my home to school.<span class="zh">从我家到学校步行大约十分钟。</span></p>
      <p class="ex">We are leaving for Xiamen tomorrow.<span class="zh">我们明天动身去厦门。</span></p>` },
    { h: '易错点', html: `<ul>
      <li><b>trip</b> 是可数名词：a three-day trip；<b>travel</b> 多作动词或泛指“旅行”，一般不说 a travel。</li>
      <li>by 后面直接跟交通工具，不加冠词：by bus；有 my、the 时用 on / in：on the bus, in my car。</li>
      <li>步行是 <b>on foot</b>，不是 by foot。</li>
      <li>骑车用 <b>ride</b>，开车用 <b>drive</b>，乘坐用 <b>take</b>：take the train。</li>
      <li>leave for + 目的地（去某地），leave + 地点（离开某地）。</li></ul>
      <p class="warn">luggage / baggage（行李）不可数：a piece of luggage，不能说 a luggage。</p>` }
  ],
  examples: [
    { type: 'choice', q: "Let's ___ the bus here. The museum is just across the street.", options: ['get off', 'get on', 'get up'], answer: 0,
      explain: '博物馆就在马路对面，说明到站了，要“下车”：get off。' },
    { type: 'fill', q: 'My father goes to work ___ subway.（填一个介词）', answer: ['by'], explain: 'by + 交通工具，表示交通方式，中间不加冠词。' },
    { type: 'choice', q: '—___ is it from your home to the station?<br>—About two kilometres.', options: ['How far', 'How long', 'How often'], answer: 0,
      explain: '回答是距离（两公里），问距离用 How far。' },
    { type: 'choice', q: 'We went to Gulangyu Island by ___. It took us about 20 minutes to cross the sea.', options: ['ferry', 'train', 'motorbike'], answer: 0,
      explain: '鼓浪屿是海岛，要渡海过去，坐的是渡轮 ferry；火车和摩托车都不能过海。' },
    { type: 'fill', q: "Don't forget your p___ when you travel to another country.（护照）", answer: ['passport'], explain: '出国旅行要带护照 passport；your 后面用单数。' },
    { type: 'fill', q: "It's about fifteen ___ walk from my home to the park.（minute，注意词形和撇号）", answer: ["minutes'", 'minutes’'],
      explain: '“……分钟的步行路程”是 X minutes\' walk：fifteen 要求复数 minutes，复数以 s 结尾，所有格只加撇号。' },
    { type: 'choice', q: 'We had a wonderful ___ to Wuyi Mountain last summer.', options: ['trip', 'travel', 'traffic'], answer: 0,
      explain: '前面有 a，又指“一次具体的旅行”，用可数名词 trip；travel 多作动词或泛指旅行，一般不说 a travel；traffic 是“交通”。' },
    { type: 'choice', q: 'My uncle drove us to the airport, so we went there ___ his car.', options: ['in', 'by', 'at'], answer: 0,
      explain: 'by 后面直接跟交通工具，不能有 my、his、the 等修饰；这里有 his，要说 in his car（小汽车用 in，公交、火车等用 on）。' },
    { type: 'fill', q: 'I walk to school every day. = I go to school ___ ___ every day.（每空一词）', answer: ['on foot'], explain: '步行是 on foot，不能说 by foot。walk to school = go to school on foot。' },
    { type: 'choice', q: 'My brother can ___ a bike, but he is too young to ___ a car.', options: ['ride; drive', 'drive; ride', 'take; ride'], answer: 0,
      explain: '骑自行车用 ride，开汽车用 drive。记住：ride 骑，drive 开，take 乘坐。' },
    { type: 'choice', q: 'Mr. Wang ___ home at seven and got to his office at half past seven.', options: ['left', 'left for', 'arrived'], answer: 0,
      explain: 'leave + 地点 是“离开某地”；leave for + 地点 是“动身去某地”。他七点离开家、七点半到办公室，所以用 left home。' },
    { type: 'choice', q: 'How many ___ do you have? You can only take two on the plane.', options: ['pieces of luggage', 'luggages', 'luggage'], answer: 0,
      explain: 'luggage（行李）不可数，不能加 s，也不能直接跟 how many；数行李要说 pieces of luggage。' }
  ],
  tests: [
    { type: 'choice', q: "We'll take a three-day ___ to Beijing this summer.", options: ['trip', 'travel', 'traffic'], answer: 0, explain: '“一次三天的旅行”用可数名词 trip；travel 一般不和 a 连用；traffic 是“交通”。' },
    { type: 'choice', q: 'My dad usually ___ his car to work.', options: ['drives', 'rides', 'flies'], answer: 0, explain: '开车用 drive；ride 用于骑自行车、骑马；fly 是飞。' },
    { type: 'fill', q: 'Tom lives near the school, so he goes to school on f___ every day.（步行）', answer: ['foot'], explain: '步行是 on foot。' },
    { type: 'fill', q: 'You can buy a t___ for the train at the station.（票）', answer: ['ticket'], explain: '前面有 a，用单数 ticket（票）。' },
    { type: 'choice', q: '—___ does it take you to get to school?<br>—About 20 minutes by bus.', options: ['How long', 'How far', 'How often'], answer: 0, explain: '回答是“20 分钟”，问花多长时间用 How long。' },
    { type: 'choice', q: 'They are leaving ___ Shanghai tomorrow morning.', options: ['for', 'to', 'in'], answer: 0, explain: 'leave for + 地点，表示“动身去某地”。' },
    { type: 'fill', q: 'Many ___ visit Gulangyu Island every year.（tourist，注意词形）', answer: ['tourists'], explain: 'many 后面接可数名词复数，tourist 加 s。' },
    { type: 'choice', q: '听一听，说话人每天怎么上班？', say: 'I take the subway to work every day. It is fast and cheap.', options: ['坐地铁', '坐出租车', '坐渡轮'], answer: 0, explain: 'take the subway 乘地铁。subway 是地铁，taxi 是出租车，ferry 是渡轮。' },
    { type: 'fill', q: 'In London, people call the subway the u___.（地铁，英式说法）', answer: ['underground', 'Underground'], explain: '地铁美式叫 subway，英式叫 underground，很多城市也叫 metro。' },
    { type: 'choice', q: 'Beijing is far away from Fuzhou. If you want to get there in about three hours, you should take a ___.', options: ['plane', 'bike', 'boat'], answer: 0, explain: '路程很远又只想花三个小时左右，只能坐飞机 plane；骑车、坐小船都不可能这么快。' },
    { type: 'choice', q: 'The bus was full of ___. There were no seats left.', options: ['passengers', 'drivers', 'guides'], answer: 0, explain: '车上没有空座位，说明坐满了乘客 passengers；一辆公交车只有一个司机。' },
    { type: 'fill', q: 'We took a taxi to the a___ to catch our plane.（机场）', answer: ['airport'], explain: '赶飞机要去机场 airport。' },
    { type: 'fill', q: 'I bought some s___ for my friends on Gulangyu Island.（纪念品，注意词形）', answer: ['souvenirs'], explain: '纪念品是 souvenir，some 后面接可数名词复数，加 s。' },
    { type: 'choice', q: "Hurry up! Let's ___ the bus. It's leaving.", options: ['get on', 'get off', 'get up'], answer: 0, explain: '车要开了，要赶紧“上车”：get on；get off 是下车，get up 是起床。' },
    { type: 'choice', q: 'We arrived ___ Fuzhou at three in the afternoon.', options: ['in', 'at', 'to'], answer: 0, explain: '福州是城市（大地方），arrive in；arrive 后面不能接 to。' },
    { type: 'choice', q: 'We arrived ___ the bus stop just in time.', options: ['at', 'in', 'to'], answer: 0, explain: '公交车站是小地点，用 arrive at；arrive 后面不能接 to。' },
    { type: 'choice', q: '—___ do you usually go to the library?<br>—By bike.', options: ['How', 'How far', 'How long'], answer: 0, explain: '回答是交通方式（骑车），问“怎样去”用 How。' },
    { type: 'choice', q: '听对话，从女孩家到学校有多远？', say: [{ who: 'M', text: 'How far is it from your home to school, Lucy?' }, { who: 'W', text: 'About three kilometres. It takes me ten minutes by bike.' }], options: ['大约三公里', '大约十公里', '大约一公里'], answer: 0, explain: '女孩说 About three kilometres，大约三公里；ten minutes 是骑车所用的时间，不是距离。' },
    { type: 'choice', q: 'It is about ten ___ from the hotel to the beach.', options: ["minutes' walk", "minute's walk", 'minutes walk'], answer: 0, explain: 'ten 后面用复数 minutes，复数名词所有格只加撇号：ten minutes\' walk 十分钟的步行路程。' },
    { type: 'choice', q: 'My grandparents love ___. They have visited more than twenty countries.', options: ['travelling', 'a trip', 'the traffic'], answer: 0, explain: '泛指“旅行”这件事用 travel（love 后接 travelling）；a trip 指某一次旅行，不能这样泛指；traffic 是交通。' },
    { type: 'choice', q: 'Have a good ___! See you next week.', options: ['trip', 'travel', 'traffic'], answer: 0, explain: '祝人“旅途愉快”说 Have a good trip!，trip 是可数名词，可以和 a 连用；一般不说 a travel。' },
    { type: 'choice', q: 'I go to school ___ my bike every day.', options: ['on', 'by', 'in'], answer: 0, explain: '有 my 修饰，不能用 by；“骑我的自行车”用 on my bike。' },
    { type: 'choice', q: 'She got up late, so she came here ___ taxi.', options: ['by', 'on', 'in'], answer: 0, explain: 'taxi 前面没有冠词或物主代词，用 by taxi 表示交通方式。' },
    { type: 'choice', q: 'We sang songs ___ the school bus on our way to the zoo.', options: ['on', 'by', 'at'], answer: 0, explain: '有 the 修饰，不能用 by；在公交车、校车上用 on the bus。' },
    { type: 'choice', q: "The park is near. Let's go there ___.", options: ['on foot', 'by foot', 'on feet'], answer: 0, explain: '步行是固定短语 on foot，foot 用单数，介词用 on。' },
    { type: 'fill', q: '改错：He goes to the park by foot every morning. 句中有一个词用错了，写出改正后的词。', answer: ['on'], explain: '步行是 on foot，不是 by foot，所以 by 改为 on。' },
    { type: 'choice', q: 'We ___ a taxi to the airport. The driver was very friendly.', options: ['took', 'rode', 'drove'], answer: 0, explain: '“乘坐”出租车用 take（过去式 took）；车是司机开的，所以不能用 drove；ride 用于骑车、骑马。' },
    { type: 'fill', q: 'Can you r___ a horse? It looks fun.（骑）', answer: ['ride'], explain: '骑马、骑自行车都用 ride；can 后接原形。' },
    { type: 'choice', q: 'The train will leave ___ Xiamen at 9:00 and arrive in Fuzhou at 11:00.', options: ['不填', 'for', 'to'], answer: 0, explain: '火车从厦门出发开往福州，是“离开厦门”，leave + 地点，不加介词；leave for 是“动身去”，leave 也不跟 to。' },
    { type: 'fill', q: 'Aunt Mary left ___ Beijing last Monday, and now she is in Beijing.（填一个介词）', answer: ['for'], explain: '她现在在北京，说明上周一是“动身去北京”：leave for + 目的地。' },
    { type: 'choice', q: 'There is too much ___ in the car. We need a bigger one.', options: ['luggage', 'luggages', 'suitcase'], answer: 0, explain: 'too much 修饰不可数名词，luggage 不可数，不加 s；suitcase 可数，不能和 much 连用。' },
    { type: 'fill', q: 'She is carrying two p___ of luggage.（件）', answer: ['pieces'], explain: 'luggage 不可数，“两件行李”说 two pieces of luggage。' },
    { type: 'choice', q: 'Excuse me, how much ___ can I take on the plane?', options: ['luggage', 'luggages', 'bags'], answer: 0, explain: 'how much 后面接不可数名词，luggage 不可数且不能加 s；bags 可数，要用 how many。' }
  ]
},

/* ================= 七年级 ================= */
{
  id: 'v-high-freq-verbs', title: '高频动词辨析 say/speak/talk/tell 等', short: '高频动词辨析', module: 'vocab', grade: 7, freq: 3,
  prereqs: [],
  tip: '完形填空和单选最爱考意思相近的动词：说、看、听、借、拿、穿、参加、到达，每组都要分清用法。',
  learn: [
    { h: '“说”：say / speak / talk / tell', html: `<table class="tbl"><tr><th>词</th><th>重点</th><th>例子</th></tr>
      <tr><td><span class="w">say</span></td><td>说出<b>内容</b>（话、句子）</td><td>say hello, say sorry, say "Thank you"</td></tr>
      <tr><td><span class="w">speak</span></td><td>说<b>语言</b>；演讲；打电话</td><td>speak English, speak at the meeting</td></tr>
      <tr><td><span class="w">talk</span></td><td>交谈、聊天（常带 with / about）</td><td>talk with sb, talk about sth</td></tr>
      <tr><td><span class="w">tell</span></td><td>告诉、讲述</td><td>tell sb sth, tell a story, tell a lie, tell the truth</td></tr></table>
      <div class="rhyme">say 说内容，speak 说语言；<br>talk 是聊天，tell 讲故事、告诉人。</div>
      <p class="ex">May I speak to Mr. Lin? — This is Mr. Lin speaking.<span class="zh">（电话中）我可以和林先生说话吗？——我就是。</span></p>` },
    { h: '“看”和“听”', html: `<table class="tbl"><tr><th>词</th><th>重点</th><th>例子</th></tr>
      <tr><td><span class="w">look</span></td><td>看（强调动作），看某物要加 at</td><td>Look! / look at the blackboard</td></tr>
      <tr><td><span class="w">see</span></td><td>看见（强调结果）；看电影、看医生</td><td>see a film, see a doctor</td></tr>
      <tr><td><span class="w">watch</span></td><td>观看（活动的东西）</td><td>watch TV, watch a football match</td></tr>
      <tr><td><span class="w">read</span></td><td>看（文字）、读</td><td>read books, read a newspaper</td></tr>
      <tr><td><span class="w">listen</span></td><td>听（动作），听某物要加 to</td><td>Listen! / listen to music</td></tr>
      <tr><td><span class="w">hear</span></td><td>听见（结果）</td><td>hear a noise, hear from sb 收到某人来信</td></tr></table>
      <p class="ex">I looked, but I didn't see anything.<span class="zh">我看了，但什么也没看见。</span></p>
      <p class="ex">Listen! Can you hear the birds singing?<span class="zh">听！你能听见鸟儿在唱歌吗？</span></p>` },
    { h: '“借”：borrow / lend / keep', html: `<table class="tbl"><tr><th>词</th><th>方向</th><th>句型</th></tr>
      <tr><td><span class="w">borrow</span></td><td>借<b>进</b>（从别人那里拿来）</td><td>borrow sth <b>from</b> sb</td></tr>
      <tr><td><span class="w">lend</span></td><td>借<b>出</b>（给别人）</td><td>lend sb sth = lend sth <b>to</b> sb</td></tr>
      <tr><td><span class="w">keep</span></td><td>借了以后保存多久</td><td>keep sth for + 一段时间</td></tr></table>
      <div class="rhyme">借进 borrow 跟 from，借出 lend 跟 to；<br>借了多久别用 borrow，换成 keep 才算对。</div>
      <p class="ex">Can I borrow your pen? = Can you lend me your pen?<span class="zh">我能借你的笔吗？</span></p>
      <p class="ex">You can keep the book for two weeks.<span class="zh">这本书你可以借两周。</span></p>` },
    { h: '“拿”：bring / take / carry / fetch', html: `<table class="tbl"><tr><th>词</th><th>方向</th><th>例子</th></tr>
      <tr><td><span class="w">bring</span></td><td>带<b>来</b>（到说话人这里）</td><td>Bring your homework here tomorrow.</td></tr>
      <tr><td><span class="w">take</span></td><td>带<b>走</b>（离开说话人）</td><td>Take an umbrella with you.</td></tr>
      <tr><td><span class="w">carry</span></td><td>搬、扛、携带（没有方向）</td><td>carry a heavy box</td></tr>
      <tr><td><span class="w">fetch</span></td><td>去<b>取来</b>（一去一回）</td><td>Please fetch some water for me.</td></tr></table>
      <div class="rhyme">bring 拿来，take 拿走，<br>carry 背着到处走，fetch 一去一回往返走。</div>` },
    { h: '“穿”“参加”“到达”', html: `<table class="tbl"><tr><th>词</th><th>重点</th><th>例子</th></tr>
      <tr><td><span class="w">wear</span></td><td>穿着、戴着（<b>状态</b>）</td><td>She often wears a red coat.</td></tr>
      <tr><td><span class="w">put on</span></td><td>穿上、戴上（<b>动作</b>）</td><td>Put on your coat. It's cold.</td></tr>
      <tr><td><span class="w">dress</span></td><td>给（人）穿衣，宾语是<b>人</b></td><td>dress oneself, be dressed in red</td></tr>
      <tr><td><span class="w">join</span></td><td>加入<b>组织、团体</b>，成为一员</td><td>join the Music Club, join us</td></tr>
      <tr><td><span class="w">take part in</span></td><td>参加<b>活动</b></td><td>take part in the sports meeting</td></tr>
      <tr><td><span class="w">arrive</span></td><td>到达，后接 in（大地方）/ at（小地方）</td><td>arrive in Fuzhou, arrive at the station</td></tr>
      <tr><td><span class="w">get</span></td><td>到达，后接 to</td><td>get to school</td></tr>
      <tr><td><span class="w">reach</span></td><td>到达，直接接地点</td><td>reach Beijing</td></tr></table>
      <p class="warn">后面是 home / here / there 时，不加介词：arrive home, get home, get there。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'Listen! Can you ___ someone singing next door?', options: ['hear', 'listen', 'listen to'], answer: 0, explain: '前面已经有 Listen 表示动作，这里问“能否听见”，强调结果用 hear。' },
    { type: 'choice', q: 'You can ___ the book for two weeks.', options: ['keep', 'borrow', 'lend'], answer: 0, explain: '“借多久”是持续的状态，borrow / lend 是一下就完成的动作，要用 keep。' },
    { type: 'fill', q: 'Can I ___ your ruler? I forgot mine.（借进，b 开头）', answer: ['borrow'], explain: '我从你那里借进来，用 borrow。' },
    { type: 'choice', q: 'Lily often ___ with her mother about her school life.', options: ['talks', 'says', 'tells'], answer: 0,
      explain: '后面有 with 和 about，是“和某人聊某事”：talk with sb about sth。say 后面直接接说的内容；tell 后面接人和事（tell sb sth），都不跟 with。' },
    { type: 'choice', q: '（电话中）—Hello, may I speak to Mr. Lin?<br>—___', options: ['This is Mr. Lin speaking.', 'I am Mr. Lin.', 'Who are you?'], answer: 0,
      explain: '打电话时自报身份用 This is ... (speaking)，不用 I am ...；直接问 Who are you? 不礼貌，电话里要问 Who is that / Who is calling?' },
    { type: 'choice', q: "I ___ at the sky for a long time, but I didn't ___ any birds.", options: ['looked; see', 'saw; look', 'watched; read'], answer: 0,
      explain: 'look at 强调“看”的动作，see 强调“看见”的结果：看了半天，但没看见。' },
    { type: 'choice', q: 'Please ___ these books to the library and ___ some new ones here.', options: ['take; bring', 'bring; take', 'carry; take'], answer: 0,
      explain: '把书送到图书馆是“带走”（离开说话人）：take；把新书拿到这里是“带来”（到说话人这里）：bring。' },
    { type: 'choice', q: "Mike can't see well, so he ___ glasses all day.", options: ['wears', 'puts on', 'dresses'], answer: 0,
      explain: 'all day 表示一直戴着，是状态，用 wear；put on 是“戴上”这个一下子的动作；dress 的宾语是人。' },
    { type: 'choice', q: 'Would you like to ___ us? We are going to ___ the school sports meeting.', options: ['join; take part in', 'take part in; join', 'take part in; take part in'], answer: 0,
      explain: '加入我们（成为我们中的一员）用 join；参加运动会这种活动用 take part in。' },
    { type: 'fill', q: 'We got ___ the station at half past six.（填一个介词）', answer: ['to'], explain: 'get to + 地点 = arrive at / in + 地点 = reach + 地点。' },
    { type: 'choice', q: 'When did you get ___ yesterday?', options: ['home', 'to home', 'at home'], answer: 0,
      explain: 'home 在这里是副词，get / arrive / go 后面直接接 home，不加介词。here、there 也一样。' }
  ],
  tests: [
    { type: 'choice', q: 'Can you ___ English?', options: ['speak', 'say', 'tell'], answer: 0, explain: '“说某种语言”用 speak。' },
    { type: 'choice', q: 'Grandpa often ___ us interesting stories.', options: ['tells', 'says', 'speaks'], answer: 0, explain: 'tell sb a story 给某人讲故事。' },
    { type: 'choice', q: 'Could you ___ me your dictionary? I left mine at home.', options: ['lend', 'borrow', 'keep'], answer: 0, explain: 'lend sb sth 把东西借给某人；“你借给我”是借出，用 lend。' },
    { type: 'choice', q: 'The little boy is only four, but he can ___ himself now.', options: ['dress', 'wear', 'put on'], answer: 0, explain: '宾语是人（himself），“给自己穿衣服”用 dress oneself。' },
    { type: 'choice', q: 'He ___ the Music Club last year and became a member.', options: ['joined', 'took part in', 'reached'], answer: 0, explain: '加入俱乐部、成为其中一员用 join；take part in 用于参加活动。' },
    { type: 'fill', q: "Please b___ your homework here tomorrow morning. I'll check it.（带来）", answer: ['bring'], explain: '把作业带到说话人这里来，用 bring。' },
    { type: 'fill', q: 'What time did you r___ Beijing yesterday?（到达）', answer: ['reach'], explain: 'reach 后面直接接地点；前面有 did，用原形。' },
    { type: 'choice', q: 'Don\'t forget to ___ "Thank you" when someone helps you.', options: ['say', 'tell', 'talk'], answer: 0, explain: '说出具体的话（"Thank you"）用 say；tell 后面要接人，talk 是交谈。' },
    { type: 'choice', q: 'Please ___ me the truth. Who broke the window?', options: ['tell', 'say', 'speak'], answer: 0, explain: '“告诉某人实话”是 tell sb the truth；say 和 speak 后面不能直接接“人 + 事”。' },
    { type: 'fill', q: 'The two old friends t___ about their school days for hours yesterday.（交谈，注意时态）', answer: ['talked'], explain: '“聊某事”是 talk about sth；yesterday 说明是过去，用 talked。' },
    { type: 'choice', q: '听电话录音，接电话的人是谁？', say: [{ who: 'W', text: 'Hello, may I speak to Tom, please?' }, { who: 'M', text: 'This is Tom speaking. Who is that?' }], options: ['Tom 本人', 'Tom 的爸爸', 'Tom 的同学'], answer: 0, explain: 'This is Tom speaking. 是电话用语“我就是 Tom”。' },
    { type: 'fill', q: '—Hello. Could I speak to Mary?<br>—Yes, this is Mary s___.（电话用语）', answer: ['speaking'], explain: '电话中说“我就是……”：This is ... speaking.' },
    { type: 'choice', q: 'Grandpa likes to ___ newspapers after breakfast.', options: ['read', 'watch', 'see'], answer: 0, explain: '看书、看报纸等文字用 read。' },
    { type: 'choice', q: 'We often ___ football matches on TV on weekends.', options: ['watch', 'look', 'read'], answer: 0, explain: '观看比赛、电视等活动的东西用 watch；look 后面要加 at 才能接宾语。' },
    { type: 'choice', q: "You don't look well. You'd better go and ___ a doctor.", options: ['see', 'look', 'watch'], answer: 0, explain: '“看医生”是固定说法 see a doctor。' },
    { type: 'fill', q: 'L___ at the blackboard, please. Can you see the new words?（看）', answer: ['Look', 'look'], explain: '看某物强调动作，用 look at。' },
    { type: 'choice', q: 'My grandma likes ___ Fujian opera on the radio.', options: ['listening to', 'listening', 'hearing'], answer: 0, explain: '听某物强调动作，用 listen to，to 不能丢；hear 是“听见”，表示结果，不用来说“喜欢听”。' },
    { type: 'fill', q: "I'm glad to h___ from you. How is everything?（收到你的来信）", answer: ['hear'], explain: 'hear from sb 收到某人的来信 / 消息。' },
    { type: 'choice', q: 'I ___ two books from the school library yesterday.', options: ['borrowed', 'lent', 'kept'], answer: 0, explain: '从图书馆借进来：borrow sth from ...，过去式 borrowed。' },
    { type: 'fill', q: 'Can I borrow your bike? = Can you ___ me your bike?（填一个词）', answer: ['lend'], explain: '“你借给我”是借出，lend sb sth；can 后面用原形。' },
    { type: 'choice', q: '—How long can I ___ these books?<br>—For two weeks.', options: ['keep', 'borrow', 'lend'], answer: 0, explain: '问“能借多久”，后面接一段时间，要用延续性的 keep；borrow、lend 是短暂动作，不能和一段时间连用。' },
    { type: 'fill', q: 'My friend lent me his comic book, and I have k___ it for a week.（借，保存，注意时态）', answer: ['kept'], explain: 'keep sth for + 一段时间，表示借了以后保存多久；have 后接过去分词 kept。' },
    { type: 'choice', q: 'The box is too heavy. Can you help me ___ it upstairs?', options: ['carry', 'fetch', 'borrow'], answer: 0, explain: '搬、扛重东西用 carry；fetch 是“去取来”，borrow 是借。' },
    { type: 'choice', q: "I'm thirsty. Could you go and ___ me a glass of water from the kitchen?", options: ['fetch', 'take', 'carry'], answer: 0, explain: '去厨房取水再拿回来，一去一回，用 fetch；take 是拿走，carry 只是搬运、没有“取回”的意思。' },
    { type: 'choice', q: 'Wait a minute. I need to ___ my shoes first.', options: ['put on', 'wear', 'dress'], answer: 0, explain: '出门前“穿上”鞋是动作，用 put on；wear 表示穿着的状态；dress 的宾语是人。' },
    { type: 'fill', q: 'Look! The girl is d___ in red today.（穿着）', answer: ['dressed'], explain: 'be dressed in + 颜色 / 衣服，表示“穿着……”。' },
    { type: 'choice', q: 'Are you going to ___ the English speech contest next week?', options: ['take part in', 'take care of', 'take off'], answer: 0, explain: '参加比赛、运动会等活动用 take part in；take care of 是照顾，take off 是脱下。' },
    { type: 'fill', q: 'My brother j___ the Art Club last term. Now he is a member of it.（加入，注意时态）', answer: ['joined'], explain: '加入组织并成为其中一员用 join；last term 是过去，用 joined。' },
    { type: 'choice', q: 'When will they arrive ___ Shanghai?', options: ['in', 'at', 'to'], answer: 0, explain: '上海是大城市，arrive in；arrive 后面不接 to。' },
    { type: 'choice', q: 'Excuse me, how can I get ___ the museum?', options: ['to', 'at', 'in'], answer: 0, explain: 'get 表示“到达”时后面接 to：get to the museum。' },
    { type: 'fill', q: '改错：We reached to Beijing at noon. 句中多了一个词，写出这个多余的词。', answer: ['to'], explain: 'reach 后面直接接地点，不加介词，所以 to 是多余的。' },
    { type: 'choice', q: 'It was very late when we arrived ___.', options: ['home', 'to home', 'in home'], answer: 0, explain: 'home 是副词，arrive home 不加介词。' },
    { type: 'choice', q: 'The museum is far away. How can we get ___?', options: ['there', 'to there', 'at there'], answer: 0, explain: 'there 是副词，get there 中间不加介词。' },
    { type: 'fill', q: 'After school I usually get ___ at about five o\'clock.（填一个词，到家）', answer: ['home'], explain: '“到家”是 get home，home 前面不加 to。' }
  ]
},

{
  id: 'v-festivals-culture', title: '节日、文化与家乡福建', short: '节日与文化', module: 'vocab', grade: 7, freq: 2,
  prereqs: ['v-numbers-time'],
  tip: '中考书面表达常让你介绍一个传统节日或“我的家乡”，节日名称、习俗短语和福建的英文名一定要会写。',
  learn: [
    { h: '中国传统节日', html: `<table class="tbl"><tr><th>节日</th><th>时间</th><th>习俗</th></tr>
      <tr><td><span class="w">Spring Festival</span> 春节</td><td>农历正月初一</td><td>eat <span class="w">dumplings</span>, set off <span class="w">fireworks</span>, get <span class="w">lucky money</span> / <span class="w">red packets</span>, put up <span class="w">spring couplets</span>, visit relatives</td></tr>
      <tr><td><span class="w">Lantern Festival</span> 元宵节</td><td>农历正月十五</td><td>eat <span class="w">yuanxiao</span>, watch <span class="w">lanterns</span>, guess <span class="w">lantern riddles</span></td></tr>
      <tr><td><span class="w">Qingming Festival</span> 清明节</td><td>四月初</td><td>sweep tombs 扫墓, remember the dead, go for an outing 踏青</td></tr>
      <tr><td><span class="w">Dragon Boat Festival</span> 端午节</td><td>农历五月初五</td><td>race <span class="w">dragon boats</span>, eat <span class="w">zongzi</span>, remember Qu Yuan</td></tr>
      <tr><td><span class="w">Mid-Autumn Festival</span> 中秋节</td><td>农历八月十五</td><td>eat <span class="w">mooncakes</span>, enjoy the full moon, get together with family</td></tr>
      <tr><td><span class="w">Double Ninth Festival</span> 重阳节</td><td>农历九月初九</td><td>climb mountains, show respect to old people</td></tr></table>
      <p class="small">清明节也叫 Tomb-sweeping Day；春节前一晚叫除夕 New Year's Eve，全家吃年夜饭 family reunion dinner。</p>` },
    { h: '其他节日', html: `<table class="tbl"><tr><th>英文</th><th>中文 / 日期</th><th>英文</th><th>中文 / 日期</th></tr>
      <tr><td><span class="w">New Year's Day</span></td><td>元旦 1月1日</td><td><span class="w">Women's Day</span></td><td>妇女节 3月8日</td></tr>
      <tr><td><span class="w">Tree Planting Day</span></td><td>植树节 3月12日</td><td><span class="w">Labour Day</span></td><td>劳动节 5月1日</td></tr>
      <tr><td><span class="w">Children's Day</span></td><td>儿童节 6月1日</td><td><span class="w">Teachers' Day</span></td><td>教师节 9月10日</td></tr>
      <tr><td><span class="w">National Day</span></td><td>国庆节 10月1日</td><td><span class="w">Mother's Day</span></td><td>母亲节 5月第二个星期日</td></tr>
      <tr><td><span class="w">Father's Day</span></td><td>父亲节 6月第三个星期日</td><td><span class="w">Halloween</span></td><td>万圣节前夜 10月31日</td></tr>
      <tr><td><span class="w">Thanksgiving Day</span></td><td>感恩节（美国）11月第四个星期四</td><td><span class="w">Christmas Day</span></td><td>圣诞节 12月25日</td></tr></table>
      <p class="small">西方节日习俗：Christmas — Christmas tree, Santa Claus, give presents；Halloween — trick or treat, pumpkin lanterns；Thanksgiving — eat turkey, give thanks。</p>` },
    { h: '家乡福建', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>小知识</th></tr>
      <tr><td><span class="w">Fujian Province</span></td><td>福建省</td><td>在中国东南沿海，与台湾隔海相望</td></tr>
      <tr><td><span class="w">Fuzhou</span></td><td>福州</td><td>福建省会，因榕树多被叫作“榕城”（banyan trees）</td></tr>
      <tr><td><span class="w">Xiamen</span></td><td>厦门</td><td>美丽的海滨城市，常被称为“海上花园”（a garden on the sea）</td></tr>
      <tr><td><span class="w">Gulangyu Island</span></td><td>鼓浪屿</td><td>岛上没有汽车，被称为“钢琴之岛”（piano island），是世界文化遗产</td></tr>
      <tr><td><span class="w">Wuyi Mountain</span></td><td>武夷山</td><td>世界文化与自然双遗产，盛产大红袍茶</td></tr>
      <tr><td><span class="w">Fujian Tulou</span></td><td>福建土楼</td><td>用土建成的大楼（earth buildings），很多是圆形，世界文化遗产</td></tr>
      <tr><td><span class="w">Quanzhou</span></td><td>泉州</td><td>古代“海上丝绸之路”（the Maritime Silk Road）的重要起点</td></tr>
      <tr><td><span class="w">oolong tea</span></td><td>乌龙茶</td><td>安溪铁观音（Tieguanyin）、武夷大红袍都很有名</td></tr>
      <tr><td><span class="w">Buddha Jumps Over the Wall</span></td><td>佛跳墙</td><td>福州名菜</td></tr></table>
      <p class="ex">My hometown is Xiamen. It is a beautiful city in Fujian.<span class="zh">我的家乡是厦门，它是福建一座美丽的城市。</span></p>
      <p class="ex">Fujian is famous for its tea and Tulou.<span class="zh">福建因茶叶和土楼而闻名。</span></p>
      <p class="ex">Welcome to Fujian! I hope you will have a good time here.<span class="zh">欢迎来福建！希望你在这里玩得开心。</span></p>` },
    { h: '易错点', html: `<ul>
      <li>节日名称每个实词首字母都要<b>大写</b>：the Spring Festival, Mid-Autumn Festival。</li>
      <li>注意撇号的位置：Children's Day, Women's Day, Mother's Day，但 <b>Teachers' Day</b>（teachers 是复数，撇号在 s 后面）。</li>
      <li>具体某一天用 <b>on</b>：on Christmas Day, on the night of the Mid-Autumn Festival；“在节日期间”可用 during：during the Spring Festival。</li>
      <li>Christmas Eve 是平安夜（12月24日），Christmas Day 才是圣诞节当天。</li></ul>
      <p class="warn">泛指“吃月饼、吃饺子”时名词用复数：eat mooncakes, eat dumplings。zongzi、yuanxiao 是音译词，写作时可加解释：zongzi, a kind of rice dumpling。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'People in China eat zongzi and race dragon boats during the ___ Festival.', options: ['Dragon Boat', 'Mid-Autumn', 'Lantern'], answer: 0, explain: '吃粽子、赛龙舟是端午节（Dragon Boat Festival）的习俗。' },
    { type: 'fill', q: 'Fujian Tulou are big round ___ buildings.（土，e 开头）', answer: ['earth'], explain: '土楼的英文解释是 earth buildings，用土建造的大楼。' },
    { type: 'choice', q: "Children's Day is on ___ 1st.", options: ['June', 'May', 'October'], answer: 0, explain: '儿童节是 6 月 1 日（June 1st）；5 月 1 日是劳动节，10 月 1 日是国庆节。' },
    { type: 'choice', q: 'On Thanksgiving Day, many American families eat ___ and give thanks.', options: ['turkey', 'zongzi', 'mooncakes'], answer: 0, explain: '感恩节吃火鸡 turkey；粽子是端午节吃的，月饼是中秋节吃的。' },
    { type: 'fill', q: 'Fujian is famous ___ its tea and Tulou.（填一个介词）', answer: ['for'], explain: 'be famous for 因……而出名，介绍家乡特色时很常用。' },
    { type: 'choice', q: '下面哪一个书写正确？', options: ['the Spring Festival', 'the spring Festival', 'the Spring festival'], answer: 0, explain: '节日名称中每个实词的首字母都要大写：Spring 和 Festival 都大写，the 不大写。' },
    { type: 'choice', q: 'Which is right? September 10th is ___ Day.', options: ["Teachers'", "Teacher's", "Teachers's"], answer: 0, explain: '教师节是所有老师的节日，teachers 用复数；以 s 结尾的复数名词，所有格只加撇号：Teachers\' Day。' },
    { type: 'choice', q: 'We often visit our relatives ___ the Spring Festival.', options: ['during', 'on', 'by'], answer: 0, explain: '春节是一段假期，“在春节期间”用 during；on 用于具体某一天，如 on Christmas Day。' },
    { type: 'fill', q: 'December 24th is Christmas ___, and December 25th is Christmas Day.（前夜，E 开头）', answer: ['Eve'], explain: '平安夜是 Christmas Eve（12 月 24 日），圣诞节当天是 Christmas Day。' },
    { type: 'choice', q: 'On the night of the Mid-Autumn Festival, we eat ___ and enjoy the full moon.', options: ['mooncakes', 'a mooncakes', "mooncake's"], answer: 0, explain: '泛指“吃月饼”用复数 mooncakes；复数前不能加 a，也不是所有格。' }
  ],
  tests: [
    { type: 'choice', q: 'Children often get lucky money from their parents at the ___.', options: ['Spring Festival', 'Halloween', "Teachers' Day"], answer: 0, explain: '春节时孩子们会收到压岁钱（lucky money / red packets）。' },
    { type: 'choice', q: 'We usually eat mooncakes and enjoy the full moon ___ the night of the Mid-Autumn Festival.', options: ['on', 'in', 'at'], answer: 0, explain: '具体某一天的晚上用 on：on the night of ...。' },
    { type: 'choice', q: 'Mother\'s Day is on the ___ Sunday in May.', options: ['second', 'first', 'last'], answer: 0, explain: '母亲节是五月的第二个星期日。' },
    { type: 'choice', q: '听一听，选出句子里提到的福建特色。', say: 'Tulou are big round earth buildings in Fujian.', options: ['土楼', '乌龙茶', '鼓浪屿'], answer: 0, explain: '句子说的是 Tulou，福建土楼，用土建成的圆形大楼。' },
    { type: 'fill', q: 'December 25th is ___ Day.（圣诞节）', answer: ['Christmas'], explain: '12 月 25 日是圣诞节 Christmas Day，首字母大写。' },
    { type: 'fill', q: 'Fujian is famous for its ___ tea, such as Tieguanyin.（乌龙）', answer: ['oolong', 'Oolong'], explain: '乌龙茶是 oolong tea，铁观音是有名的乌龙茶。' },
    { type: 'fill', q: 'Every year on ___ Day, our class sings a song for Ms. Chen.（teacher，注意形式和撇号）', answer: ["Teachers'", 'Teachers’'], explain: '教师节是 Teachers\' Day，teachers 是复数，撇号放在 s 后面。' },
    { type: 'choice', q: 'On the ___ Festival, people climb mountains and show respect to old people.', options: ['Double Ninth', 'Lantern', 'Dragon Boat'], answer: 0, explain: '登高、敬老是重阳节（Double Ninth Festival）的习俗。' },
    { type: 'choice', q: '听一听，说的是哪个节日？', say: 'On this day, people eat yuanxiao, watch lanterns and guess lantern riddles.', options: ['元宵节', '端午节', '中秋节'], answer: 0, explain: '吃元宵、看花灯、猜灯谜是元宵节（Lantern Festival）的习俗。' },
    { type: 'fill', q: 'Tomb-sweeping Day is also called ___ Festival. People remember the dead on that day.（清明）', answer: ['Qingming'], explain: '清明节是 Qingming Festival，也叫 Tomb-sweeping Day。' },
    { type: 'choice', q: 'October 1st is ___.', options: ['National Day', 'Labour Day', "New Year's Day"], answer: 0, explain: '10 月 1 日是国庆节 National Day；劳动节是 5 月 1 日，元旦是 1 月 1 日。' },
    { type: 'choice', q: 'Children wear costumes and say "trick or treat" at ___.', options: ['Halloween', 'Christmas', 'Thanksgiving'], answer: 0, explain: '“不给糖就捣蛋”（trick or treat）是万圣节前夜 Halloween 的习俗。' },
    { type: 'fill', q: 'Children hope S___ Claus will bring them presents at Christmas.（圣诞老人）', answer: ['Santa'], explain: '圣诞老人是 Santa Claus。' },
    { type: 'choice', q: 'Fuzhou is called "the city of ___" because there are many big old trees of this kind.', options: ['banyan trees', 'apple trees', 'pine trees'], answer: 0, explain: '福州榕树多，被称为“榕城”，榕树是 banyan tree。' },
    { type: 'choice', q: '___ Fujian! I hope you will have a good time here.', options: ['Welcome to', 'Welcome in', 'Welcome at'], answer: 0, explain: '“欢迎来到某地”是 Welcome to + 地点。' },
    { type: 'fill', q: 'Xiamen is famous ___ its beautiful beaches.（填一个介词）', answer: ['for'], explain: 'be famous for 因……而出名。' },
    { type: 'fill', q: 'Welcome to Quanzhou! I hope you will have a good t___ here.（时光）', answer: ['time'], explain: 'have a good time 玩得开心。' },
    { type: 'choice', q: '下面哪一个书写正确？', options: ['the Lantern Festival', 'the lantern festival', 'the Lantern festival'], answer: 0, explain: '节日名称中实词首字母都要大写：Lantern Festival。' },
    { type: 'choice', q: '下面哪个句子书写正确？', options: ['We race dragon boats at the Dragon Boat Festival.', 'We race dragon boats at the dragon boat Festival.', 'We race dragon boats at the Dragon boat festival.'], answer: 0, explain: '节日名称 Dragon Boat Festival 三个词首字母都大写；句中普通的 dragon boats（龙舟）不是节日名，小写。' },
    { type: 'choice', q: '下面哪一个书写正确？', options: ['Mid-Autumn Festival', 'mid-autumn festival', 'Mid-Autumn festival'], answer: 0, explain: '中秋节 Mid-Autumn Festival 每个实词首字母都要大写，连字符后的 Autumn 也大写。' },
    { type: 'choice', q: 'On ___, we gave flowers and cards to our teachers.', options: ["Teachers' Day", "Teacher's Day", 'Teachers Day'], answer: 0, explain: '教师节 Teachers\' Day：teachers 是复数，撇号在 s 后面。' },
    { type: 'choice', q: 'June 1st is ___.', options: ["Children's Day", "Childrens' Day", 'Children Day'], answer: 0, explain: 'children 本身是复数但不以 s 结尾，所有格加 \'s：Children\'s Day。' },
    { type: 'choice', q: 'My family had a big dinner ___ Christmas Day.', options: ['on', 'in', 'at'], answer: 0, explain: 'Christmas Day 是具体的一天，用 on。' },
    { type: 'choice', q: 'Many people travel ___ the National Day holiday.', options: ['during', 'on', 'at'], answer: 0, explain: '国庆假期是一段时间，“在……期间”用 during。' },
    { type: 'choice', q: 'We decorated the Christmas tree and waited for Santa Claus on ___, the night of December 24th.', options: ['Christmas Eve', 'Christmas Day', "New Year's Eve"], answer: 0, explain: '12 月 24 日是平安夜 Christmas Eve；12 月 25 日才是圣诞节 Christmas Day；New Year\'s Eve 是除夕。' },
    { type: 'fill', q: 'The night before the Spring Festival is New Year\'s ___. Families have a reunion dinner.（前夜）', answer: ['Eve'], explain: '除夕是 New Year\'s Eve，Eve 指节日的前夜。' },
    { type: 'choice', q: 'We ate a lot of ___ at the family reunion dinner.', options: ['dumplings', 'dumpling', 'a dumplings'], answer: 0, explain: 'a lot of 修饰可数名词时用复数，泛指吃饺子也用复数 dumplings。' },
    { type: 'fill', q: 'Zongzi is a kind of rice d___.（音译词的英文解释）', answer: ['dumpling'], explain: '写作时可以给音译词加解释：zongzi, a kind of rice dumpling；a kind of 后面用单数。' }
  ]
},

{
  id: 'v-feelings-personality', title: '情感与性格', short: '情感与性格', module: 'vocab', grade: 7, freq: 3,
  prereqs: ['g-adj-adv'],
  tip: '完形填空经常考描写人物心情和性格的形容词，要根据上下文判断人物是开心、紧张还是失望。',
  learn: [
    { h: '表示心情的词', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">happy</span> / <span class="w">glad</span></td><td>高兴的</td><td><span class="w">sad</span> / <span class="w">unhappy</span></td><td>难过的</td></tr>
      <tr><td><span class="w">excited</span></td><td>兴奋的</td><td><span class="w">surprised</span></td><td>惊讶的</td></tr>
      <tr><td><span class="w">angry</span></td><td>生气的</td><td><span class="w">upset</span></td><td>心烦的</td></tr>
      <tr><td><span class="w">worried</span></td><td>担心的</td><td><span class="w">nervous</span></td><td>紧张的</td></tr>
      <tr><td><span class="w">afraid</span> / <span class="w">scared</span></td><td>害怕的</td><td><span class="w">bored</span></td><td>无聊的</td></tr>
      <tr><td><span class="w">tired</span></td><td>累的</td><td><span class="w">relaxed</span></td><td>放松的</td></tr>
      <tr><td><span class="w">proud</span></td><td>骄傲的、自豪的</td><td><span class="w">disappointed</span></td><td>失望的</td></tr>
      <tr><td><span class="w">lonely</span></td><td>孤独的</td><td><span class="w">satisfied</span></td><td>满意的</td></tr></table>` },
    { h: '表示性格的词', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">kind</span></td><td>善良的</td><td><span class="w">friendly</span></td><td>友好的</td></tr>
      <tr><td><span class="w">helpful</span></td><td>乐于助人的</td><td><span class="w">honest</span></td><td>诚实的</td></tr>
      <tr><td><span class="w">polite</span></td><td>有礼貌的</td><td><span class="w">patient</span></td><td>有耐心的</td></tr>
      <tr><td><span class="w">brave</span></td><td>勇敢的</td><td><span class="w">shy</span></td><td>害羞的</td></tr>
      <tr><td><span class="w">outgoing</span></td><td>外向的</td><td><span class="w">quiet</span></td><td>安静的、文静的</td></tr>
      <tr><td><span class="w">funny</span> / <span class="w">humorous</span></td><td>有趣的、幽默的</td><td><span class="w">clever</span> / <span class="w">smart</span></td><td>聪明的</td></tr>
      <tr><td><span class="w">careful</span></td><td>细心的</td><td><span class="w">careless</span></td><td>粗心的</td></tr>
      <tr><td><span class="w">hard-working</span></td><td>勤奋的</td><td><span class="w">lazy</span></td><td>懒惰的</td></tr>
      <tr><td><span class="w">generous</span></td><td>慷慨的</td><td><span class="w">strict</span></td><td>严格的</td></tr>
      <tr><td><span class="w">confident</span></td><td>自信的</td><td><span class="w">warm-hearted</span></td><td>热心的</td></tr></table>
      <p class="small">反义词常加前缀：happy → unhappy, polite → impolite, patient → impatient, honest → dishonest；名词加 -ness：kind → kindness, happy → happiness。</p>` },
    { h: '常用搭配与句型', html: `<p class="small">be proud of 为……骄傲, be worried about 担心, be afraid of 害怕, be angry with sb 生某人的气, be excited about 对……感到兴奋, be satisfied with 对……满意, be strict with sb 对某人严格, be patient with sb 对某人有耐心, be friendly to sb 对某人友好, cheer up 振作起来, calm down 冷静下来</p>
      <p class="ex">My parents are proud of me.<span class="zh">我的父母为我感到骄傲。</span></p>
      <p class="ex">Don't be nervous. Take a deep breath.<span class="zh">别紧张，深呼吸。</span></p>
      <p class="ex">She is outgoing and always ready to help others.<span class="zh">她性格外向，总是乐于帮助别人。</span></p>
      <p class="ex">What is he like? — He is friendly and kind.<span class="zh">他是个什么样的人？——他很友好，也很善良。</span></p>` },
    { h: '易错点', html: `<ul>
      <li>人“感到……”用 <b>-ed</b>，事物“令人……”用 <b>-ing</b>：I am bored. The film is boring.（详见“-ed 形容词与 -ing 形容词”）</li>
      <li><b>afraid</b> 只作表语（放在 be、feel 等系动词后面），不放在名词前：The boy is afraid.（不说 an afraid boy）</li>
      <li>friendly, lonely, lovely 以 ly 结尾，但都是<b>形容词</b>。</li>
      <li>What is he like? 问性格、为人；What does he look like? 问长相。</li></ul>
      <p class="warn">be angry <b>with</b> 后面接人，be angry <b>about / at</b> 后面接事。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'Tom is very ___. He always tells the truth.', options: ['honest', 'shy', 'lazy'], answer: 0, explain: '“总是说实话”说明他诚实：honest。' },
    { type: 'fill', q: 'Our teacher is ___ with us, but she is kind.（严格的，s 开头）', answer: ['strict'], explain: 'be strict with sb 对某人严格。' },
    { type: 'choice', q: "Kate didn't get a ticket for the concert. She was very ___.", options: ['disappointed', 'proud', 'excited'], answer: 0, explain: '没买到音乐会的票，心里很失望：disappointed。proud 是自豪，excited 是兴奋，都不符合。' },
    { type: 'fill', q: "Don't be ___. Wait for your turn.（patient 加前缀变成反义词）", answer: ['impatient'], explain: 'patient（有耐心的）加前缀 im- 变成 impatient（没耐心的）。' },
    { type: 'fill', q: 'Thank you for your ___. You helped me a lot.（kind，注意词形）', answer: ['kindness'], explain: 'your 后面接名词，kind 加 -ness 变成名词 kindness（善意、好心）。' },
    { type: 'choice', q: 'My little sister is afraid ___ big dogs.', options: ['of', 'with', 'about'], answer: 0, explain: 'be afraid of 害怕……，是固定搭配。' },
    { type: 'choice', q: "Don't shout! ___ and tell me what happened.", options: ['Calm down', 'Cheer up', 'Give up'], answer: 0, explain: '对方在大喊大叫，劝他“冷静下来”：calm down；cheer up 用于劝难过的人振作起来。' },
    { type: 'choice', q: 'The film was so ___ that I felt ___.', options: ['boring; bored', 'bored; boring', 'boring; boring'], answer: 0, explain: '事物“令人无聊”用 -ing：boring；人“感到无聊”用 -ed：bored。' },
    { type: 'choice', q: '下面哪个句子是正确的？', options: ['The little boy feels afraid.', 'He is an afraid boy.', 'An afraid boy is crying.'], answer: 0, explain: 'afraid 只能放在 be、feel 等系动词后面作表语，不能放在名词前面修饰名词。' },
    { type: 'choice', q: 'The people in Fuzhou are very ___ to visitors.', options: ['friendly', 'friend', 'friendship'], answer: 0, explain: 'be 后面要形容词。friendly 虽然以 ly 结尾，但是形容词：be friendly to sb 对某人友好；friend 是名词，friendship 是“友谊”。' },
    { type: 'choice', q: '—What is your new English teacher like?<br>—___', options: ['She is patient and kind.', 'She is tall and thin.', 'She likes reading.'], answer: 0, explain: 'What is she like? 问的是性格、为人，要回答 patient and kind；问长相才用 What does she look like?' },
    { type: 'choice', q: 'Mr. Brown was angry ___ the bad news.', options: ['about', 'with', 'of'], answer: 0, explain: '后面是事（the bad news），用 be angry about；be angry with 后面接人。' }
  ],
  tests: [
    { type: 'choice', q: "Don't be ___. Take it easy. The exam is not hard.", options: ['nervous', 'honest', 'helpful'], answer: 0, explain: '“放轻松，考试不难”，说明对方很紧张：nervous。' },
    { type: 'choice', q: 'My mother was ___ me because I broke her favourite vase.', options: ['angry with', 'proud of', 'interested in'], answer: 0, explain: '打碎了妈妈心爱的花瓶，妈妈生气：be angry with sb。' },
    { type: 'choice', q: '听一听，说话人现在感觉怎么样？', say: "I can't find my dog anywhere. I'm so worried.", options: ['担心的', '兴奋的', '无聊的'], answer: 0, explain: '说话人找不到狗，说 I\'m so worried，意思是很担心。' },
    { type: 'choice', q: 'Lily is ___. She is always the first to help others.', options: ['helpful', 'careless', 'lazy'], answer: 0, explain: '总是第一个帮助别人，说明她乐于助人：helpful。' },
    { type: 'fill', q: "Lucy is s___. She doesn't like to talk to strangers.（害羞的）", answer: ['shy'], explain: '不喜欢和陌生人说话，说明她害羞：shy。' },
    { type: 'fill', q: "It's ___ to talk loudly in the library.（polite，加前缀变成反义词）", answer: ['impolite'], explain: 'polite 的反义词是 impolite（不礼貌的）。' },
    { type: 'fill', q: 'We are all p___ of our team. They won the game!（自豪的）', answer: ['proud'], explain: 'be proud of 为……感到自豪。' },
    { type: 'fill', q: 'I have nothing to do at home. I feel so b___.（无聊的）', answer: ['bored'], explain: '人感到无聊用 bored。' },
    { type: 'choice', q: 'I got a birthday present from my old friend in Canada. I was really ___. I didn\'t expect it at all.', options: ['surprised', 'bored', 'upset'], answer: 0, explain: '完全没想到会收到礼物，感到惊讶：surprised。' },
    { type: 'choice', q: 'Mr. Li is very ___. He often gives money and food to people in need.', options: ['generous', 'strict', 'lazy'], answer: 0, explain: '经常把钱和食物给需要的人，说明他慷慨：generous。' },
    { type: 'choice', q: '听一听，说话人的哥哥是什么性格？', say: 'My brother is very outgoing. He likes making new friends and talking with people.', options: ['外向的', '害羞的', '懒惰的'], answer: 0, explain: 'outgoing 是外向的，喜欢交新朋友、和人聊天。' },
    { type: 'fill', q: "It's ___ to tell lies.（honest 加前缀变成反义词）", answer: ['dishonest'], explain: 'honest（诚实的）的反义词是 dishonest，前缀是 dis-。' },
    { type: 'choice', q: 'The opposite of "happy" is ___.', options: ['unhappy', 'dishappy', 'imhappy'], answer: 0, explain: 'happy 的反义词加前缀 un-：unhappy。' },
    { type: 'fill', q: 'Money cannot buy ___.（happy，注意词形）', answer: ['happiness'], explain: 'buy 后面接名词，happy 变名词要把 y 改 i 再加 -ness：happiness。' },
    { type: 'choice', q: 'We all thanked the old man for his ___.', options: ['kindness', 'kind', 'kindly'], answer: 0, explain: 'his 后面接名词，kind 的名词是 kindness。' },
    { type: 'choice', q: 'My parents are satisfied ___ my progress this term.', options: ['with', 'of', 'about'], answer: 0, explain: 'be satisfied with 对……满意。' },
    { type: 'choice', q: "Don't worry ___ me. I'm fine.", options: ['about', 'with', 'of'], answer: 0, explain: 'worry about / be worried about 担心……。' },
    { type: 'fill', q: 'Be p___ with the little kids. They learn slowly.（有耐心的）', answer: ['patient'], explain: 'be patient with sb 对某人有耐心。' },
    { type: 'choice', q: '—I lost the match today.<br>—___ You can win next time.', options: ['Cheer up!', 'Calm down!', 'Give up!'], answer: 0, explain: '朋友比赛输了很难过，鼓励他“振作起来”：Cheer up!；calm down 用于劝人冷静，give up 是放弃。' },
    { type: 'fill', q: "C___ down! Shouting won't help.（冷静）", answer: ['Calm', 'calm'], explain: 'calm down 冷静下来。' },
    { type: 'choice', q: 'We were all ___ at the news.', options: ['surprised', 'surprising', 'surprise'], answer: 0, explain: '主语是人（we），表示人“感到惊讶”用 -ed：surprised。' },
    { type: 'choice', q: 'Our trip to Wuyi Mountain was really ___.', options: ['exciting', 'excited', 'excite'], answer: 0, explain: '主语是事物（trip），“令人兴奋的”用 -ing：exciting。' },
    { type: 'fill', q: 'This story is very ___. Everyone likes it.（interest，注意词形）', answer: ['interesting'], explain: '主语是事物（story），“令人感兴趣的”用 interesting。' },
    { type: 'choice', q: '下面哪个句子是正确的？', options: ['The girl was afraid of the dark.', 'She is an afraid girl.', 'There are many afraid children.'], answer: 0, explain: 'afraid 只作表语，放在 be 后面；不能放在名词前。' },
    { type: 'choice', q: 'There was a ___ boy crying in the corner.', options: ['scared', 'afraid', 'alone'], answer: 0, explain: '空格在名词 boy 前面，afraid 和 alone 都只能作表语，不能放在名词前；scared 可以：a scared boy。' },
    { type: 'choice', q: 'The old man lives by himself and often feels ___.', options: ['lonely', 'lonelily', 'loneliness'], answer: 0, explain: 'feel 后面接形容词。lonely 以 ly 结尾，但它是形容词，“孤独的”。' },
    { type: 'choice', q: 'The new students are very ___ to us.', options: ['friendly', 'friendlily', 'friend'], answer: 0, explain: 'friendly 是形容词，be friendly to sb；friendlily 是极少用的副词，be 后面不用副词；friend 是名词。' },
    { type: 'choice', q: '—___ is your best friend like?<br>—She is funny and helpful.', options: ['What', 'How', 'Who'], answer: 0, explain: '问性格用 What is ... like?' },
    { type: 'choice', q: '—What does your brother look like?<br>—___', options: ['He is tall with short hair.', 'He is kind and helpful.', 'He likes football.'], answer: 0, explain: 'What does he look like? 问长相，回答外貌 tall with short hair；kind and helpful 是性格。' },
    { type: 'fill', q: '—What is Mr. Wang l___?<br>—He is strict but kind.（问性格）', answer: ['like'], explain: '回答是性格，问句是 What is he like?' },
    { type: 'choice', q: "Don't be angry ___ me. I didn't mean it.", options: ['with', 'about', 'for'], answer: 0, explain: '后面接人（me），用 be angry with sb。' },
    { type: 'choice', q: 'She was angry ___ the loud noise outside.', options: ['about', 'with', 'to'], answer: 0, explain: '后面是事（噪音），用 be angry about。' }
  ]
},

/* ================= 八年级 ================= */
{
  id: 'v-confusables', title: '易混词辨析', short: '易混词辨析', module: 'vocab', grade: 8, freq: 3,
  prereqs: ['v-high-freq-verbs'],
  tip: '单选和短文填空常考长得像、意思近的词：alone / lonely、maybe / may be、rise / raise、sometimes / some time 等，一字之差意思全变。',
  learn: [
    { h: 'alone / lonely，maybe / may be', html: `<table class="tbl"><tr><th>词</th><th>意思</th><th>例子</th></tr>
      <tr><td><span class="w">alone</span></td><td>独自（客观上一个人）</td><td>He lives alone.</td></tr>
      <tr><td><span class="w">lonely</span></td><td>孤独的（心里感觉）；偏僻的</td><td>He feels lonely. a lonely village</td></tr>
      <tr><td><span class="w">maybe</span></td><td>副词“也许”，常放句首</td><td>Maybe he is at home.</td></tr>
      <tr><td><span class="w">may be</span></td><td>情态动词 + be，“可能是”，放主语后</td><td>He may be at home.</td></tr></table>
      <p class="ex">He lives alone, but he never feels lonely.<span class="zh">他独自生活，但从不觉得孤独。</span></p>
      <div class="rhyme">句首 maybe 连着写，主语后面 may be 分开写。</div>` },
    { h: 'quite / quiet / quit，beside / besides', html: `<table class="tbl"><tr><th>词</th><th>意思</th><th>例子</th></tr>
      <tr><td><span class="w">quite</span></td><td>相当、十分（副词）</td><td>It's quite hot today.</td></tr>
      <tr><td><span class="w">quiet</span></td><td>安静的（形容词）</td><td>Keep quiet, please.</td></tr>
      <tr><td><span class="w">quit</span></td><td>停止、放弃（动词）</td><td>He quit smoking.</td></tr>
      <tr><td><span class="w">beside</span></td><td>在……旁边（= next to）</td><td>Sit beside me.</td></tr>
      <tr><td><span class="w">besides</span></td><td>除……之外还有；而且</td><td>Besides English, I like art.</td></tr></table>
      <p class="small">besides 和 except 的区别已在“常用介词辨析”里学过：besides 包括在内，except 不包括在内。hard（努力地）和 hardly（几乎不）在“形容词与副词的用法”里学过。</p>` },
    { h: 'rise / raise，lie / lay', html: `<table class="tbl"><tr><th>词</th><th>意思</th><th>变化</th><th>例子</th></tr>
      <tr><td><span class="w">rise</span></td><td>升起（自己升，后面<b>不带</b>宾语）</td><td>rose, risen</td><td>The sun rises in the east.</td></tr>
      <tr><td><span class="w">raise</span></td><td>举起、提高、筹集（后面<b>要带</b>宾语）</td><td>raised, raised</td><td>Raise your hand. raise money</td></tr>
      <tr><td><span class="w">lie</span></td><td>躺；位于</td><td>lay, lain, lying</td><td>He is lying on the bed.</td></tr>
      <tr><td><span class="w">lie</span></td><td>撒谎</td><td>lied, lied, lying</td><td>Don't lie to me.</td></tr>
      <tr><td><span class="w">lay</span></td><td>放置；下蛋</td><td>laid, laid, laying</td><td>The hen lays an egg every day.</td></tr></table>
      <p class="warn">lay 既是“放、下蛋”的原形，又是 lie（躺）的过去式，看清句子的时态再判断！</p>` },
    { h: 'sometimes 一家，in the end 一家', html: `<table class="tbl"><tr><th>词</th><th>意思</th><th>例子</th></tr>
      <tr><td><span class="w">sometimes</span></td><td>有时（频率）</td><td>I sometimes walk to school.</td></tr>
      <tr><td><span class="w">sometime</span></td><td>某个时候（将来或过去）</td><td>I'll visit you sometime next week.</td></tr>
      <tr><td><span class="w">some time</span></td><td>一段时间</td><td>I'll stay here for some time.</td></tr>
      <tr><td><span class="w">some times</span></td><td>几次、几倍</td><td>I have been there some times.</td></tr>
      <tr><td><span class="w">in the end</span></td><td>最后，终于（单独用）</td><td>In the end, we won.</td></tr>
      <tr><td><span class="w">at the end of</span></td><td>在……的末尾 / 尽头</td><td>at the end of the road / this month</td></tr>
      <tr><td><span class="w">by the end of</span></td><td>到……末为止（常配完成时）</td><td>by the end of last year</td></tr></table>
      <div class="rhyme">有时 sometimes 带个 s，某时 sometime 连一起；<br>一段时间 some time 分开写，几次 some times 分开再加 s。</div>` }
  ],
  examples: [
    { type: 'choice', q: '—Where is Tom?<br>—___ he is in the library.', options: ['Maybe', 'May be', 'Must'], answer: 0, explain: '放在句首、后面已有 he is，用副词 Maybe（也许）。' },
    { type: 'choice', q: 'The hen ___ an egg every day.', options: ['lays', 'lies', 'raises'], answer: 0, explain: '“下蛋”用 lay，主语是三单，用 lays。' },
    { type: 'fill', q: 'We tried again and again. In the ___, we won the game.（e 开头）', answer: ['end'], explain: 'in the end 最后、终于。' },
    { type: 'choice', q: 'He grew up in a ___ village far away from the city.', options: ['lonely', 'alone', 'lonelily'], answer: 0, explain: 'lonely 还有“偏僻的”意思，可以放在名词前：a lonely village；alone 不能放在名词前；lonelily 是极少用的副词，不能修饰名词。' },
    { type: 'choice', q: "It's ___ cold today. Put on your coat.", options: ['quite', 'quiet', 'quit'], answer: 0, explain: '修饰形容词 cold，用副词 quite（相当、十分）；quiet 是“安静的”，quit 是“放弃”。' },
    { type: 'choice', q: '___ English, we also learn Chinese and maths.', options: ['Besides', 'Beside', 'Except'], answer: 0, explain: '“除了英语，还学语文和数学”，包括英语在内，用 besides；beside 是“在……旁边”；except 是“除……之外（不包括）”，和 also 矛盾。' },
    { type: 'choice', q: 'The price of vegetables has ___ a lot this month.', options: ['risen', 'raised', 'rose'], answer: 0, explain: '价格自己“上涨”，后面没有宾语，用 rise；has 后面接过去分词 risen。raise 要带宾语。' },
    { type: 'choice', q: 'Yesterday he ___ on the grass and looked at the clouds for an hour.', options: ['lay', 'laid', 'lied'], answer: 0, explain: '“躺”是 lie，过去式是 lay；laid 是 lay（放置）的过去式；lied 是 lie（撒谎）的过去式。' },
    { type: 'choice', q: "I'll come to see you ___ next month.", options: ['sometime', 'sometimes', 'some times'], answer: 0, explain: '“下个月的某个时候”用 sometime（连写，不加 s）；sometimes 是“有时”，some times 是“几次”。' },
    { type: 'choice', q: 'We had planted more than 100 trees ___ the end of last month.', options: ['by', 'in', 'on'], answer: 0, explain: '句子用过去完成时 had planted，表示“到上个月底为止”，用 by the end of；in the end 单独使用，后面不接 of。' }
  ],
  tests: [
    { type: 'choice', q: 'The old man lives ___, but he never feels ___.', options: ['alone; lonely', 'lonely; alone', 'lonely; lonely'], answer: 0, explain: '“独自生活”用 alone 修饰动词；“感到孤独”是心里的感觉，用 lonely。lonely 不能修饰 lives。' },
    { type: 'choice', q: 'The sun ___ in the east every morning.', options: ['rises', 'raises', 'is raised'], answer: 0, explain: '太阳自己升起，后面没有宾语，用 rise；主语三单，用 rises。' },
    { type: 'choice', q: 'Keep ___, please. The baby is sleeping.', options: ['quiet', 'quite', 'quit'], answer: 0, explain: '“保持安静”用形容词 quiet；quite 是“相当”，quit 是“放弃”。' },
    { type: 'choice', q: "Don't worry. I can wait. I'll stay here for ___.", options: ['some time', 'sometime', 'sometimes'], answer: 0, explain: 'for + 一段时间，“一段时间”是 some time，分开写。' },
    { type: 'choice', q: 'Please ___ your hand if you have any questions.', options: ['raise', 'rise', 'lie'], answer: 0, explain: '“举手”要带宾语 your hand，用 raise。' },
    { type: 'fill', q: 'I s___ go to the cinema with my parents on weekends.（有时）', answer: ['sometimes'], explain: '表示频率“有时”用 sometimes。' },
    { type: 'fill', q: 'We will have a party at the ___ of this month.（末尾，e 开头）', answer: ['end'], explain: 'at the end of this month 在这个月底。' },
    { type: 'choice', q: 'The old lady lives ___ in a small house by the sea.', options: ['alone', 'lonely', 'lonelily'], answer: 0, explain: '修饰动词 lives，表示“独自一人”，用 alone；lonely 是形容词，不能修饰动词。' },
    { type: 'fill', q: 'Being far away from home, Tom often felt l___.（孤独的）', answer: ['lonely'], explain: 'feel 后面接形容词，心里感到孤独用 lonely。' },
    { type: 'choice', q: 'Your bag ___ in the classroom. Go and have a look.', options: ['may be', 'maybe', 'can is'], answer: 0, explain: '主语 your bag 后面缺谓语，用情态动词 + be：may be（可能是 / 可能在），分开写。' },
    { type: 'fill', q: '—Where is Dad?<br>—M___ he is in the garden.（也许）', answer: ['Maybe', 'maybe'], explain: '放在句首、后面已有 he is，用副词 maybe，连着写。' },
    { type: 'fill', q: 'Maybe he is right. = He ___ ___ right.（每空一词）', answer: ['may be'], explain: '句首的副词 maybe 换到主语后，就变成情态动词 may + be，分开写。' },
    { type: 'choice', q: 'The question is ___ easy. Everyone can answer it.', options: ['quite', 'quiet', 'quit'], answer: 0, explain: '修饰形容词 easy，用副词 quite（相当）。' },
    { type: 'choice', q: 'My father ___ smoking last year. Now he is healthier.', options: ['quit', 'quite', 'quiet'], answer: 0, explain: '“戒烟”是 quit smoking，quit 的过去式还是 quit。' },
    { type: 'choice', q: 'Come and sit ___ me. Let\'s read together.', options: ['beside', 'besides', 'except'], answer: 0, explain: '“坐在我旁边”用 beside（= next to）。' },
    { type: 'choice', q: '___ swimming, I also like running and playing basketball.', options: ['Besides', 'Beside', 'Except'], answer: 0, explain: '有 also，说明游泳也包括在内，用 besides（除……之外还有）；except 是排除在外。' },
    { type: 'fill', q: 'The bank is b___ the post office. You can\'t miss it.（在……旁边）', answer: ['beside'], explain: '“在……旁边”是 beside，不加 s；besides 是“除……之外还有”。' },
    { type: 'choice', q: 'They held a concert to ___ money for the poor children.', options: ['raise', 'rise', 'lie'], answer: 0, explain: '“筹钱”是 raise money，raise 后面带宾语。' },
    { type: 'fill', q: 'The sun r___ at six this morning.（升起，注意时态）', answer: ['rose'], explain: '太阳自己升起用 rise；this morning 已经过去，用过去式 rose。' },
    { type: 'choice', q: "Don't ___ to your parents. Tell them the truth.", options: ['lie', 'lay', 'laid'], answer: 0, explain: '“撒谎”是 lie to sb；don\'t 后面用原形。' },
    { type: 'choice', q: 'Look! The cat is ___ under the table.', options: ['lying', 'laying', 'lieing'], answer: 0, explain: '“躺着”是 lie，现在分词要把 ie 变 y 再加 -ing：lying；laying 是 lay（放、下蛋）的现在分词。' },
    { type: 'fill', q: 'The boy ___ to his teacher yesterday. Now he feels sorry.（lie 撒谎，用过去式）', answer: ['lied'], explain: 'lie 表示“撒谎”时是规则变化：lied, lied。' },
    { type: 'choice', q: 'My grandpa built this house ___ in the 1980s.', options: ['sometime', 'sometimes', 'some times'], answer: 0, explain: 'sometime 也可指过去的“某个时候”：sometime in the 1980s 在二十世纪八十年代的某个时候；sometimes 是“有时”，some times 是“几次”。' },
    { type: 'choice', q: '我去过北京好几次了。I have been to Beijing ___.', options: ['some times', 'some time', 'sometime'], answer: 0, explain: '“几次”是 some times，分开写并加 s；some time 是“一段时间”。' },
    { type: 'choice', q: 'There is a supermarket ___ the end of the street.', options: ['at', 'in', 'by'], answer: 0, explain: '“在街道的尽头”用 at the end of。' },
    { type: 'choice', q: '___ the end of last term, we had learned 1,500 English words.', options: ['By', 'In', 'On'], answer: 0, explain: '句子用过去完成时 had learned，表示“到上学期末为止”，用 by the end of；in the end 后面不接 of。' },
    { type: 'fill', q: 'At first Tom didn\'t like his new school, but i___ the end he made lots of friends there.（最后）', answer: ['in'], explain: 'in the end 最后、终于，单独使用，后面不接 of。' }
  ]
},

{
  id: 'v-environment', title: '环境保护与自然灾害', short: '环境保护', module: 'vocab', grade: 8, freq: 3,
  prereqs: ['v-weather-seasons', 'v-animals-nature'],
  tip: '环保是中考阅读和书面表达的热门话题，要会写 protect, pollution, recycle, save energy 等词，还要会用 should 提建议。',
  learn: [
    { h: '环境与污染', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">environment</span></td><td>环境</td><td><span class="w">nature</span></td><td>自然</td></tr>
      <tr><td><span class="w">pollution</span></td><td>污染（名词）</td><td><span class="w">pollute</span></td><td>污染（动词）</td></tr>
      <tr><td><span class="w">air pollution</span></td><td>空气污染</td><td><span class="w">noise</span></td><td>噪音</td></tr>
      <tr><td><span class="w">rubbish</span> / <span class="w">garbage</span></td><td>垃圾</td><td><span class="w">waste</span></td><td>浪费；废物</td></tr>
      <tr><td><span class="w">plastic bag</span></td><td>塑料袋</td><td><span class="w">litter</span></td><td>乱扔垃圾；垃圾</td></tr>
      <tr><td><span class="w">climate</span></td><td>气候</td><td><span class="w">global warming</span></td><td>全球变暖</td></tr>
      <tr><td><span class="w">resource</span></td><td>资源</td><td><span class="w">energy</span></td><td>能源</td></tr>
      <tr><td><span class="w">endangered animals</span></td><td>濒危动物</td><td><span class="w">die out</span></td><td>灭绝</td></tr></table>
      <p class="small">rubbish 是英式，garbage 是美式，都不可数。</p>` },
    { h: '环保行动', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">protect</span></td><td>保护</td><td><span class="w">save</span></td><td>节约；拯救</td></tr>
      <tr><td><span class="w">reduce</span></td><td>减少</td><td><span class="w">reuse</span></td><td>重复使用</td></tr>
      <tr><td><span class="w">recycle</span></td><td>回收再利用</td><td><span class="w">plant trees</span></td><td>植树</td></tr>
      <tr><td><span class="w">sort rubbish</span></td><td>垃圾分类</td><td><span class="w">turn off</span></td><td>关掉</td></tr>
      <tr><td><span class="w">public transport</span></td><td>公共交通</td><td><span class="w">low-carbon life</span></td><td>低碳生活</td></tr>
      <tr><td><span class="w">cut down</span></td><td>砍倒</td><td><span class="w">throw away</span></td><td>扔掉</td></tr></table>
      <p class="ex">We should turn off the lights when we leave the room.<span class="zh">离开房间时我们应该关灯。</span></p>
      <p class="ex">Take a cloth bag instead of a plastic bag.<span class="zh">带布袋代替塑料袋。</span></p>
      <p class="ex">It's our duty to protect the environment.<span class="zh">保护环境是我们的责任。</span></p>
      <p class="ex">If everyone does a little, the world will be more beautiful.<span class="zh">如果每个人都出一点力，世界会更美好。</span></p>` },
    { h: '自然灾害', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">earthquake</span></td><td>地震</td><td><span class="w">flood</span></td><td>洪水</td></tr>
      <tr><td><span class="w">typhoon</span></td><td>台风</td><td><span class="w">storm</span></td><td>暴风雨</td></tr>
      <tr><td><span class="w">drought</span></td><td>干旱</td><td><span class="w">sandstorm</span></td><td>沙尘暴</td></tr>
      <tr><td><span class="w">fire</span></td><td>火灾</td><td><span class="w">tsunami</span></td><td>海啸</td></tr></table>
      <p class="small">福建沿海夏秋季节常有台风（typhoon）。遇到灾害时：keep calm 保持冷静, stay indoors 待在室内, help each other 互相帮助。</p>` },
    { h: '易错点', html: `<ul>
      <li>词性要分清：pollute（动词）→ pollution（名词）；protect → protection；environment → environmental（形容词）。</li>
      <li><b>reduce</b> 减少用量，<b>reuse</b> 同一个东西再用，<b>recycle</b> 回收加工后再利用（旧报纸做新纸）。</li>
      <li>energy, pollution, rubbish 一般不可数，不加 s。</li>
      <li>the environment 前面通常加 the。</li></ul>
      <p class="warn">“砍倒树”用 cut down，不是 cut off（切断）。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'Turn off the lights when you leave the room. We should ___ energy.', options: ['save', 'waste', 'make'], answer: 0, explain: '随手关灯是为了节约能源：save energy。' },
    { type: 'fill', q: 'Air ___ is a serious problem in some big cities.（pollute，注意词形）', answer: ['pollution'], explain: '做主语要用名词，pollute 的名词是 pollution。' },
    { type: 'choice', q: "South China tigers may ___ if we don't protect them.", options: ['die out', 'cut down', 'throw away'], answer: 0, explain: '动物不被保护就可能“灭绝”：die out；cut down 是砍倒，throw away 是扔掉。' },
    { type: 'choice', q: 'Take a cloth bag ___ a plastic bag when you go shopping.', options: ['instead of', 'because of', 'thanks to'], answer: 0, explain: '“带布袋代替塑料袋”，用 instead of（代替、而不是）。' },
    { type: 'choice', q: 'During an ___, the ground shakes and buildings may fall down.', options: ['earthquake', 'flood', 'drought'], answer: 0, explain: '大地震动、房屋倒塌，是地震 earthquake；flood 是洪水，drought 是干旱。' },
    { type: 'choice', q: 'We should ___ the use of plastic bags. Use fewer of them!', options: ['reduce', 'reuse', 'recycle'], answer: 0, explain: '“少用”是减少用量：reduce。reuse 是同一个东西再用，recycle 是回收加工后再利用。' },
    { type: 'choice', q: 'Turn off the TV when nobody is watching. We should save ___.', options: ['energy', 'energies', 'an energy'], answer: 0, explain: 'energy（能源）一般不可数，不加 s，也不加 an。' },
    { type: 'fill', q: 'Everyone should do something to protect ___ environment.（填一个词）', answer: ['the'], explain: 'environment 表示“（自然）环境”时前面通常加 the：protect the environment。' },
    { type: 'choice', q: "Please don't ___ the trees in the park. They give us fresh air.", options: ['cut down', 'cut off', 'cut out'], answer: 0, explain: '“砍倒树”是 cut down；cut off 是“切断”，cut out 是“剪下”。' }
  ],
  tests: [
    { type: 'choice', q: 'We should ___ plastic bags again and again instead of throwing them away.', options: ['reuse', 'refuse', 'return'], answer: 0, explain: '“一次又一次地使用”是重复使用：reuse。' },
    { type: 'choice', q: 'Strong winds and heavy rain hit Xiamen last night. It was a ___.', options: ['typhoon', 'drought', 'earthquake'], answer: 0, explain: '大风加暴雨，是台风；drought 是干旱，earthquake 是地震。' },
    { type: 'choice', q: 'Many trees were ___, so the birds lost their homes.', options: ['cut down', 'cut off', 'cut up'], answer: 0, explain: '树被砍倒了，鸟儿失去家园：cut down。' },
    { type: 'choice', q: "Don't drop ___ in the street. Put it into the bin.", options: ['litter', 'energy', 'climate'], answer: 0, explain: '不要在街上乱扔垃圾，要扔进垃圾桶：litter。' },
    { type: 'fill', q: 'We must p___ the environment. It is our home.（保护）', answer: ['protect'], explain: 'must 后面用动词原形 protect（保护）。' },
    { type: 'fill', q: 'We can r___ old newspapers to make new paper.（回收再利用，共 7 个字母）', answer: ['recycle'], explain: '把旧报纸回收加工成新纸，是 recycle。' },
    { type: 'fill', q: 'Golden monkeys are ___ animals. We must protect them.（danger，濒危的，注意词形）', answer: ['endangered'], explain: '“濒危的”是 endangered，endangered animals 濒危动物。' },
    { type: 'fill', q: "There is too much n___ outside. I can't sleep.（噪音）", answer: ['noise'], explain: '吵得睡不着，是噪音 noise；too much 后面接不可数名词。' },
    { type: 'choice', q: 'Because of ___, the earth is getting hotter and hotter.', options: ['global warming', 'public transport', 'low-carbon life'], answer: 0, explain: '地球越来越热，原因是全球变暖 global warming。' },
    { type: 'choice', q: 'Please ___ the lights when you leave the classroom.', options: ['turn off', 'turn on', 'turn up'], answer: 0, explain: '离开教室要关灯：turn off；turn on 是打开，turn up 是调大。' },
    { type: 'choice', q: 'We should ___ rubbish and put it into different bins.', options: ['sort', 'waste', 'pollute'], answer: 0, explain: '把垃圾分别放进不同的垃圾桶，是垃圾分类：sort rubbish。' },
    { type: 'fill', q: 'Leave your car at home. Try to take p___ transport, like buses and the subway.（公共的）', answer: ['public'], explain: '公共交通是 public transport。' },
    { type: 'choice', q: "It's our ___ to protect the environment.", options: ['duty', 'noise', 'rubbish'], answer: 0, explain: 'It\'s our duty to do sth. 做某事是我们的责任。' },
    { type: 'fill', q: 'We s___ walk or ride bikes instead of driving cars.（应该）', answer: ['should'], explain: '提建议用 should + 动词原形。' },
    { type: 'choice', q: 'If everyone ___ a little, the world will be more beautiful.', options: ['does', 'do', 'will do'], answer: 0, explain: 'if 引导的条件句用一般现在时表示将来，everyone 作主语谓语用单数：does。' },
    { type: 'choice', q: '听一听，说的是哪种自然灾害？', say: 'There has been no rain for months. The fields are dry and the rivers are getting smaller.', options: ['干旱', '洪水', '台风'], answer: 0, explain: '几个月没下雨，田地干裂，是干旱 drought。' },
    { type: 'fill', q: 'Keep c___ when an earthquake happens. Don\'t run around.（冷静的）', answer: ['calm'], explain: '遇到灾害时要 keep calm 保持冷静。' },
    { type: 'fill', q: 'We should do more for the ___ of the environment.（protect，注意词形）', answer: ['protection'], explain: 'the 和 of 之间要用名词，protect 的名词是 protection。' },
    { type: 'choice', q: 'The river was ___ by the factory, and the fish died.', options: ['polluted', 'pollution', 'polluting'], answer: 0, explain: '河流“被污染”，被动语态 was + 过去分词 polluted。' },
    { type: 'fill', q: 'We should pay attention to ___ problems.（environment，注意词形）', answer: ['environmental'], explain: '修饰名词 problems 要用形容词，environment 加 -al：environmental。' },
    { type: 'choice', q: 'Old glass bottles can be collected, melted and made into new bottles. This is called ___.', options: ['recycling', 'reducing', 'reusing'], answer: 0, explain: '回收后加工成新东西是 recycle；reuse 是原样再用，reduce 是少用。' },
    { type: 'choice', q: 'There ___ a lot of rubbish on the beach after the holiday.', options: ['is', 'are', 'be'], answer: 0, explain: 'rubbish 不可数，作主语时谓语用单数 is。' },
    { type: 'choice', q: 'There is less ___ in our city now. The sky is bluer.', options: ['pollution', 'pollutions', 'a pollution'], answer: 0, explain: 'pollution 不可数，less 修饰不可数名词，不加 s 也不加 a。' },
    { type: 'fill', q: '改错：Let\'s pick up the rubbishes on the beach. 写出改正后的那个词。', answer: ['rubbish'], explain: 'rubbish 不可数，不能加 -es。' },
    { type: 'choice', q: 'Planting trees is good for ___ environment.', options: ['the', 'an', '不填'], answer: 0, explain: 'environment 表示自然环境时前面通常加 the。' },
    { type: 'choice', q: 'People ___ too many trees, so there are more sandstorms now.', options: ['cut down', 'cut off', 'cut in'], answer: 0, explain: '树被大量砍倒，沙尘暴变多：cut down 砍倒。' },
    { type: 'fill', q: 'Some people c___ down trees to build houses, and the hills become bare.（砍）', answer: ['cut'], explain: '“砍倒”是 cut down；主语 some people 是复数，谓语用原形 cut。' }
  ]
},

{
  id: 'v-science-tech', title: '科技、发明与网络', short: '科技与发明', module: 'vocab', grade: 8, freq: 2,
  prereqs: ['g-word-form'],
  tip: '阅读理解常出现科技与发明类文章，短文填空常考 science → scientist、invent → invention 这类词形变化。',
  learn: [
    { h: '科学与发明', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">science</span></td><td>科学</td><td><span class="w">scientist</span></td><td>科学家</td></tr>
      <tr><td><span class="w">technology</span></td><td>技术</td><td><span class="w">experiment</span></td><td>实验</td></tr>
      <tr><td><span class="w">invent</span></td><td>发明（动词）</td><td><span class="w">invention</span></td><td>发明（名词）</td></tr>
      <tr><td><span class="w">inventor</span></td><td>发明家</td><td><span class="w">discover</span></td><td>发现</td></tr>
      <tr><td><span class="w">electricity</span></td><td>电</td><td><span class="w">develop</span></td><td>发展</td></tr>
      <tr><td><span class="w">robot</span></td><td>机器人</td><td><span class="w">AI</span></td><td>人工智能</td></tr>
      <tr><td><span class="w">rocket</span></td><td>火箭</td><td><span class="w">spaceship</span></td><td>宇宙飞船</td></tr>
      <tr><td><span class="w">astronaut</span></td><td>宇航员</td><td><span class="w">space station</span></td><td>空间站</td></tr></table>
      <p class="small">中国古代四大发明 the Four Great Inventions：<span class="w">paper</span> 造纸术, <span class="w">printing</span> 印刷术, <span class="w">the compass</span> 指南针, <span class="w">gunpowder</span> 火药。</p>` },
    { h: '电脑与网络', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">computer</span></td><td>电脑</td><td><span class="w">the Internet</span></td><td>互联网</td></tr>
      <tr><td><span class="w">online</span></td><td>在线、网上</td><td><span class="w">website</span></td><td>网站</td></tr>
      <tr><td><span class="w">smartphone</span></td><td>智能手机</td><td><span class="w">app</span></td><td>应用程序</td></tr>
      <tr><td><span class="w">email</span></td><td>电子邮件</td><td><span class="w">message</span></td><td>信息、留言</td></tr>
      <tr><td><span class="w">search</span></td><td>搜索</td><td><span class="w">download</span></td><td>下载</td></tr>
      <tr><td><span class="w">screen</span></td><td>屏幕</td><td><span class="w">keyboard</span></td><td>键盘</td></tr>
      <tr><td><span class="w">password</span></td><td>密码</td><td><span class="w">information</span></td><td>信息（不可数）</td></tr></table>
      <p class="ex">We can search for information on the Internet.<span class="zh">我们可以在网上搜索信息。</span></p>
      <p class="ex">I often chat with my friends online.<span class="zh">我经常和朋友在网上聊天。</span></p>
      <p class="ex">Don't spend too much time playing games on your phone.<span class="zh">不要花太多时间玩手机游戏。</span></p>` },
    { h: '谈论发明的句型', html: `<p class="ex">The telephone was invented by Bell.<span class="zh">电话是贝尔发明的。</span></p>
      <p class="ex">Robots are used to do dangerous work.<span class="zh">机器人被用来做危险的工作。</span></p>
      <p class="ex">Smartphones make our life easier.<span class="zh">智能手机让我们的生活更方便。</span></p>
      <p class="ex">Yuan Longping was a great scientist. He developed hybrid rice.<span class="zh">袁隆平是一位伟大的科学家，他培育出了杂交水稻。</span></p>
      <p class="small">写科技话题时常用被动语态 be invented / be used to do，详见“被动语态”。</p>` },
    { h: '易错点', html: `<ul>
      <li><b>invent</b> 发明（原来没有的东西）；<b>discover</b> 发现（本来就存在的东西）：discover a new island。</li>
      <li><b>information</b> 不可数，不能加 s，也不能说 an information；要说 a piece of information。</li>
      <li>“在网上”是 <b>on</b> the Internet，Internet 前加 the，首字母大写。</li>
      <li>scientist 拼写：scien + tist，不要写成 sciencist。</li></ul>
      <p class="warn">“用电脑”是 use a computer / on the computer，“打字”是 type。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'Columbus ___ America in 1492.', options: ['discovered', 'invented', 'made'], answer: 0, explain: '美洲本来就存在，是“发现”：discover。' },
    { type: 'fill', q: 'Yuan Longping was a great ___.（science，注意词形）', answer: ['scientist'], explain: 'a great 后面接表示人的名词，science 变成 scientist（科学家）。' },
    { type: 'choice', q: 'A ___ is a machine that can do dangerous work for people.', options: ['robot', 'rocket', 'compass'], answer: 0, explain: '能代替人做危险工作的机器是机器人 robot；rocket 是火箭，compass 是指南针。' },
    { type: 'choice', q: 'Which is NOT one of the Four Great Inventions of ancient China?', options: ['the telephone', 'paper', 'gunpowder'], answer: 0, explain: '四大发明是造纸术、印刷术、指南针、火药；电话是贝尔发明的，不在其中。' },
    { type: 'choice', q: "I forgot my ___, so I couldn't open my email.", options: ['password', 'keyboard', 'screen'], answer: 0, explain: '忘了密码 password 才进不了邮箱。' },
    { type: 'choice', q: 'The telephone ___ by Bell.', options: ['was invented', 'invented', 'is inventing'], answer: 0, explain: '电话是“被发明”的，又是过去的事，用一般过去时的被动语态 was invented by ...。' },
    { type: 'choice', q: 'Computers are used ___ information.', options: ['to search for', 'search for', 'searched for'], answer: 0, explain: 'be used to do sth 被用来做某事，to 后面接动词原形。' },
    { type: 'choice', q: 'Smartphones make our life much ___.', options: ['easier', 'easily', 'more easily'], answer: 0, explain: 'make + 宾语 + 形容词，“使……更方便”用形容词比较级 easier，不能用副词。' },
    { type: 'fill', q: 'He told me two ___ of information about the trip.（片、条，注意词形）', answer: ['pieces'], explain: 'information 不可数，“两条信息”是 two pieces of information。' },
    { type: 'fill', q: 'I learned about the space station ___ the Internet.（填一个介词）', answer: ['on'], explain: '“在网上”用 on the Internet。' },
    { type: 'fill', q: 'Can you t___ fast on the keyboard?（打字）', answer: ['type'], explain: '“打字”是 type；can 后面用原形。' }
  ],
  tests: [
    { type: 'choice', q: '—Who ___ the telephone?<br>—Bell did.', options: ['invented', 'discovered', 'found'], answer: 0, explain: '电话原来不存在，是被“发明”出来的：invent。' },
    { type: 'choice', q: 'I often look for ___ on the Internet.', options: ['information', 'informations', 'an information'], answer: 0, explain: 'information 不可数，不能加 s，也不能加 an。' },
    { type: 'choice', q: 'We can search for answers ___ the Internet.', options: ['on', 'in', 'at'], answer: 0, explain: '“在网上”用 on the Internet。' },
    { type: 'choice', q: 'People send ___ to each other by computer or phone.', options: ['emails', 'rockets', 'compasses'], answer: 0, explain: '用电脑或手机互相发送的是电子邮件 emails。' },
    { type: 'fill', q: 'Paper, printing, the compass and gunpowder are the Four Great ___ of ancient China.（invent，注意词形）', answer: ['Inventions', 'inventions'], explain: 'the Four Great 后面接名词复数，invent → invention → inventions。' },
    { type: 'fill', q: 'Robots can help people do many things. They are very ___.（use，注意词形）', answer: ['useful'], explain: 'be 后面用形容词，use 加 -ful 变成 useful（有用的）。' },
    { type: 'fill', q: 'Yang Liwei was the first Chinese a___ to go into space.（宇航员）', answer: ['astronaut'], explain: '宇航员是 astronaut；前面有 the first，用单数。' },
    { type: 'fill', q: 'Students often do e___ in the science lab.（实验，注意词形）', answer: ['experiments'], explain: '实验是 experiment，可数，泛指时用复数；do experiments 做实验。' },
    { type: 'choice', q: "We can't live without ___. It gives us light and makes machines work.", options: ['electricity', 'gunpowder', 'a rocket'], answer: 0, explain: '能照明、让机器工作的是电 electricity。' },
    { type: 'choice', q: '听一听，说的是哪一项发明？', say: 'It helped sailors find their way at sea. Its needle shows north and south.', options: ['指南针', '火药', '印刷术'], answer: 0, explain: '帮水手在海上辨别方向、指针能指示南北的是指南针 the compass。' },
    { type: 'choice', q: 'You can ___ this app for free from the Internet.', options: ['download', 'invent', 'discover'], answer: 0, explain: '从网上“下载”应用用 download。' },
    { type: 'fill', q: 'Please type your name on the k___.（键盘）', answer: ['keyboard'], explain: '打字用键盘 keyboard。' },
    { type: 'choice', q: 'Robots are used ___ some dangerous jobs.', options: ['to do', 'doing', 'do'], answer: 0, explain: 'be used to do sth 被用来做某事。' },
    { type: 'choice', q: 'Paper ___ in ancient China.', options: ['was invented', 'invented', 'invents'], answer: 0, explain: '纸是“被发明”的，又是古代的事，用 was invented。' },
    { type: 'fill', q: 'Hybrid rice was d___ by Yuan Longping.（培育，注意词形）', answer: ['developed'], explain: '被动语态 was + 过去分词，develop → developed。' },
    { type: 'fill', q: 'Online maps make travelling ___.（easy，用比较级）', answer: ['easier'], explain: 'make + 宾语 + 形容词，“使……更容易”用比较级 easier（y 变 i 加 -er）。' },
    { type: 'choice', q: 'The Internet makes it ___ for us to learn new things.', options: ['easier', 'easily', 'more easily'], answer: 0, explain: 'make it + 形容词 + for sb to do，这里用形容词比较级 easier，不用副词。' },
    { type: 'choice', q: 'Scientists ___ a new kind of frog in the forest last year.', options: ['discovered', 'invented', 'made'], answer: 0, explain: '青蛙本来就存在，是“发现”：discover。' },
    { type: 'choice', q: 'There ___ some useful information on this website.', options: ['is', 'are', 'be'], answer: 0, explain: 'information 不可数，作主语谓语用单数 is。' },
    { type: 'fill', q: 'Here is a p___ of information for you.（条）', answer: ['piece'], explain: '“一条信息”是 a piece of information。' },
    { type: 'fill', q: '改错：I found the answer in the Internet. 写出改正后的那个词。', answer: ['on'], explain: '“在网上”用 on the Internet，in 改为 on。' },
    { type: 'choice', q: 'You can find almost anything on ___.', options: ['the Internet', 'internet', 'an Internet'], answer: 0, explain: '互联网是 the Internet，前面加 the，首字母大写。' },
    { type: 'fill', q: 'Her dream is to be a s___ and work in a lab.（科学家）', answer: ['scientist'], explain: '科学家是 scientist：scien + tist。' },
    { type: 'choice', q: '“科学家”的正确拼写是 ___。', options: ['scientist', 'sciencist', 'scientest'], answer: 0, explain: '科学家是 scien + tist，不要写成 sciencist 或 scientest。' },
    { type: 'choice', q: 'Can your grandpa ___ a computer?', options: ['use', 'type', 'invent'], answer: 0, explain: '“用电脑”是 use a computer；type 是打字，不能直接接 computer。' },
    { type: 'fill', q: 'My grandma is learning to t___ on the computer.（打字）', answer: ['type'], explain: '“在电脑上打字”是 type on the computer；to 后接原形。' }
  ]
},

/* ================= 九年级 ================= */
{
  id: 'v-life-growth', title: '成长、梦想、志愿与人际', short: '成长与梦想', module: 'vocab', grade: 9, freq: 3,
  prereqs: ['v-feelings-personality'],
  tip: '“我的梦想”“成长的烦恼”“志愿服务”“初中生活回顾”都是中考书面表达的常见话题，相关词和句型要能直接写出来。',
  learn: [
    { h: '成长与梦想', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">grow up</span></td><td>长大</td><td><span class="w">dream</span></td><td>梦想；做梦</td></tr>
      <tr><td><span class="w">future</span></td><td>未来</td><td><span class="w">goal</span></td><td>目标</td></tr>
      <tr><td><span class="w">come true</span></td><td>实现</td><td><span class="w">achieve</span></td><td>实现、达到</td></tr>
      <tr><td><span class="w">succeed</span></td><td>成功（动词）</td><td><span class="w">success</span></td><td>成功（名词）</td></tr>
      <tr><td><span class="w">successful</span></td><td>成功的</td><td><span class="w">fail</span></td><td>失败</td></tr>
      <tr><td><span class="w">mistake</span></td><td>错误</td><td><span class="w">make progress</span></td><td>取得进步</td></tr>
      <tr><td><span class="w">challenge</span></td><td>挑战</td><td><span class="w">confidence</span></td><td>信心</td></tr>
      <tr><td><span class="w">experience</span></td><td>经历；经验</td><td><span class="w">memory</span></td><td>回忆</td></tr>
      <tr><td><span class="w">graduate</span></td><td>毕业</td><td><span class="w">senior high school</span></td><td>高中</td></tr>
      <tr><td><span class="w">pressure</span></td><td>压力</td><td><span class="w">give up</span></td><td>放弃</td></tr></table>` },
    { h: '志愿与人际', html: `<table class="tbl"><tr><th>英文</th><th>中文</th><th>英文</th><th>中文</th></tr>
      <tr><td><span class="w">volunteer</span></td><td>志愿者；志愿的</td><td><span class="w">help others</span></td><td>帮助他人</td></tr>
      <tr><td><span class="w">community</span></td><td>社区</td><td><span class="w">old people's home</span></td><td>养老院</td></tr>
      <tr><td><span class="w">raise money</span></td><td>筹钱</td><td><span class="w">share</span></td><td>分享</td></tr>
      <tr><td><span class="w">friendship</span></td><td>友谊</td><td><span class="w">communicate</span></td><td>交流</td></tr>
      <tr><td><span class="w">trust</span></td><td>信任</td><td><span class="w">respect</span></td><td>尊重</td></tr>
      <tr><td><span class="w">understand</span></td><td>理解</td><td><span class="w">encourage</span></td><td>鼓励</td></tr>
      <tr><td><span class="w">support</span></td><td>支持</td><td><span class="w">advice</span></td><td>建议（不可数）</td></tr>
      <tr><td><span class="w">get along well with</span></td><td>与……相处得好</td><td><span class="w">deal with</span></td><td>处理、应对</td></tr></table>` },
    { h: '写作好句', html: `<p class="ex">When I grow up, I want to be a doctor.<span class="zh">长大后我想当一名医生。</span></p>
      <p class="ex">I will work hard to make my dream come true.<span class="zh">我会努力学习，让梦想成真。</span></p>
      <p class="ex">I learned that helping others brings happiness.<span class="zh">我懂得了帮助别人会带来快乐。</span></p>
      <p class="ex">Never give up, and you will succeed one day.<span class="zh">永不放弃，总有一天你会成功。</span></p>
      <p class="ex">I will never forget the three years in junior high school.<span class="zh">我永远不会忘记初中三年。</span></p>
      <div class="rhyme">Where there is a will, there is a way.（有志者事竟成）<br>Practice makes perfect.（熟能生巧）</div>` },
    { h: '易错点', html: `<ul>
      <li>“梦想实现”是 dream <b>comes true</b>，不说 dream realizes；“实现梦想”是 achieve / realize my dream。</li>
      <li>succeed（动）→ success（名）→ successful（形）→ successfully（副），<b>succeed in doing</b> 成功做某事。</li>
      <li><b>advice</b> 不可数：some advice, a piece of advice；动词是 advise。</li>
      <li>dream <b>of / about</b> doing 梦想做某事；want to be + 职业。</li></ul>
      <p class="warn">get along well <b>with</b> sb，介词是 with。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'I hope my dream will come ___ one day.', options: ['true', 'real', 'truly'], answer: 0, explain: '梦想成真是固定说法 come true。' },
    { type: 'fill', q: 'He finally achieved ___ after years of hard work.（succeed，注意词形）', answer: ['success'], explain: 'achieve 后面接名词，succeed 的名词是 success。' },
    { type: 'choice', q: "Don't be afraid of making ___. We can learn from them.", options: ['mistakes', 'goals', 'memories'], answer: 0, explain: 'make mistakes 犯错误；“从错误中学习”，mistakes 符合句意。' },
    { type: 'fill', q: "Last Sunday we went to the old people's h___ to help the old people there.（养老院）", answer: ['home'], explain: '养老院是 old people\'s home。' },
    { type: 'fill', q: 'When I grow ___, I want to be a doctor.（填一个词）', answer: ['up'], explain: 'grow up 长大；When I grow up, I want to be ... 是写梦想的常用句。' },
    { type: 'choice', q: 'My teacher gave me a piece of ___ on how to study well.', options: ['advice', 'advices', 'advise'], answer: 0, explain: 'advice（建议）是不可数名词，用 a piece of advice；advise 是动词。' },
    { type: 'choice', q: 'She dreams ___ becoming a pilot.', options: ['of', 'to', 'for'], answer: 0, explain: 'dream of / about doing sth 梦想做某事。' },
    { type: 'fill', q: 'How are you getting a___ with your new classmates?（相处）', answer: ['along'], explain: 'get along (well) with sb 与某人相处（融洽）。' },
    { type: 'choice', q: 'He succeeded in ___ the speech competition.', options: ['winning', 'win', 'to win'], answer: 0, explain: 'succeed in doing sth 成功做某事，in 是介词，后面接动名词 winning。' }
  ],
  tests: [
    { type: 'choice', q: 'He ___ in passing the exam at last.', options: ['succeeded', 'success', 'successful'], answer: 0, explain: 'succeed in doing 成功做某事，这里要用动词过去式 succeeded。' },
    { type: 'choice', q: 'Never ___! Keep trying and you will make it.', options: ['give up', 'give out', 'give away'], answer: 0, explain: '“永不放弃”用 give up；give out 是分发，give away 是赠送。' },
    { type: 'choice', q: 'Can you give me some ___ on how to learn English well?', options: ['advice', 'advices', 'an advice'], answer: 0, explain: 'advice 不可数，不能加 s 或 an。' },
    { type: 'choice', q: 'I get along well ___ my classmates.', options: ['with', 'to', 'for'], answer: 0, explain: 'get along well with sb 与某人相处融洽。' },
    { type: 'choice', q: 'My dream is ___ a teacher like Miss Lin.', options: ['to be', 'be', 'is'], answer: 0, explain: 'My dream is to be ... 我的梦想是成为……，用不定式 to be。' },
    { type: 'fill', q: 'We should r___ older people and help them.（尊重）', answer: ['respect'], explain: 'should 后面接动词原形 respect（尊重）。' },
    { type: 'fill', q: "Lily often does v___ work in the old people's home.（志愿的）", answer: ['volunteer'], explain: 'volunteer work 志愿工作，这里 volunteer 修饰 work。' },
    { type: 'choice', q: 'With hard work, he has made great ___ in English this term.', options: ['progress', 'mistakes', 'pressure'], answer: 0, explain: '努力学习，英语取得了很大进步：make progress。' },
    { type: 'fill', q: 'We will g___ from junior high school next summer.（毕业）', answer: ['graduate'], explain: 'graduate from 从……毕业；will 后用原形。' },
    { type: 'choice', q: 'Good friends should ___ each other and never tell lies.', options: ['trust', 'fail', 'graduate'], answer: 0, explain: '好朋友之间要互相信任：trust。' },
    { type: 'fill', q: "Thanks for your s___. I couldn't do it without you.（支持）", answer: ['support'], explain: '支持是 support，your 后面用名词。' },
    { type: 'choice', q: '听一听，他们上周日做了什么志愿活动？', say: 'Last Sunday, we volunteered to clean the streets in our community.', options: ['打扫社区街道', '去养老院看望老人', '为灾区筹钱'], answer: 0, explain: 'clean the streets in our community 打扫社区的街道。' },
    { type: 'choice', q: 'Exams bring us a lot of ___. How do you ___ it?', options: ['pressure; deal with', 'pressure; give up', 'advice; come true'], answer: 0, explain: '考试带来压力 pressure；“应对、处理”压力用 deal with。' },
    { type: 'choice', q: 'Where there is a ___, there is a way.', options: ['will', 'dream', 'goal'], answer: 0, explain: '谚语“有志者事竟成”：Where there is a will, there is a way.' },
    { type: 'choice', q: 'I will never ___ the three years in junior high school.', options: ['forget', 'remember', 'forgive'], answer: 0, explain: '“永远不会忘记”是 never forget；never remember 意思相反，forgive 是原谅。' },
    { type: 'choice', q: 'Thanks to the volunteers, the sick boy\'s wish to see the sea ___ last summer.', options: ['came true', 'realized', 'achieved'], answer: 0, explain: '愿望自己“实现”用 come true（过去式 came true）；realize、achieve 后面要带宾语（realize / achieve one\'s dream），不能用“愿望”作主语。' },
    { type: 'fill', q: '改错：I hope my dream can realize. 用两个词替换 realize。', answer: ['come true'], explain: '梦想作主语时要说 dream comes true，不说 dream realizes。' },
    { type: 'choice', q: 'Work hard, and you will ___ your dream.', options: ['achieve', 'come true', 'succeed'], answer: 0, explain: '“实现梦想”，后面有宾语 your dream，用 achieve；come true 和 succeed 不能直接带宾语。' },
    { type: 'choice', q: 'Mo Yan is a ___ writer.', options: ['successful', 'success', 'successfully'], answer: 0, explain: '修饰名词 writer 要用形容词 successful。' },
    { type: 'fill', q: 'She finished the hard task ___.（succeed，注意词形）', answer: ['successfully'], explain: '修饰动词 finished 要用副词 successfully。' },
    { type: 'fill', q: 'Failure is the mother of s___.（成功）', answer: ['success'], explain: '“失败是成功之母”，of 后面接名词 success。' },
    { type: 'fill', q: 'Let me give you a p___ of advice.（条）', answer: ['piece'], explain: 'advice 不可数，“一条建议”是 a piece of advice。' },
    { type: 'choice', q: 'Could you ___ me what to do next?', options: ['advise', 'advice', 'advices'], answer: 0, explain: 'could 后面接动词原形，“建议”的动词是 advise；advice 是名词。' },
    { type: 'choice', q: 'I often dream ___ travelling to space.', options: ['of', 'for', 'at'], answer: 0, explain: 'dream of doing sth 梦想做某事。' },
    { type: 'choice', q: 'He wants ___ a pilot when he grows up.', options: ['to be', 'be', 'being'], answer: 0, explain: 'want to be + 职业，want 后面接不定式。' },
    { type: 'fill', q: 'Lucy dreams a___ being a singer.（介词，a 开头）', answer: ['about'], explain: 'dream about / of doing sth 梦想做某事。' },
    { type: 'choice', q: 'My cousin is easy to get ___ with. Everyone likes him.', options: ['along', 'up', 'off'], answer: 0, explain: 'get along with sb 与某人相处；easy to get along with 好相处。' },
    { type: 'fill', q: '改错：I get along well to my deskmate. 写出改正后的那个词。', answer: ['with'], explain: 'get along well with sb，介词是 with。' }
  ]
}

);
