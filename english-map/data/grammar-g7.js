// 第 2 阶段：B 组（七年级语法）
KG.nodes.push(

{
  id: 'g-linking-verb', title: '系动词 + 形容词', short: '系动词', module: 'morph', grade: 7, freq: 3,
  prereqs: ['g-adj-adv'],
  tip: '中考常考 look / sound / smell / taste / feel 后面接形容词，最常见的陷阱是误选副词（如 tastes well、smells nicely）。',
  learn: [
    { h: '什么是系动词', html: `<p>系动词本身意思不完整，后面要跟一个<b>形容词</b>（叫“表语”），用来说明主语<b>怎么样</b>。最常见的系动词就是 be。</p>
      <p class="ex">The soup is hot.<span class="zh">汤很烫。</span></p>
      <p class="ex">The soup smells good.<span class="zh">汤闻起来很香。</span></p>
      <p>记住：系动词后面接<b>形容词</b>，不接副词，因为它描述的是主语本身，而不是动作。</p>` },
    { h: '三类常见系动词', html: `<table class="tbl"><tr><th>类别</th><th>词</th><th>例句</th></tr>
      <tr><td>感官类</td><td>look 看起来，sound 听起来，smell 闻起来，taste 尝起来，feel 摸起来 / 感觉</td><td>You look tired.</td></tr>
      <tr><td>变化类</td><td>get, become, turn, grow 变得</td><td>It is getting cold.</td></tr>
      <tr><td>保持类</td><td>keep, stay 保持；seem 似乎</td><td>Please keep quiet.</td></tr></table>
      <div class="rhyme">看听闻尝摸，变成保持似乎；<br>后面跟着形容词，副词千万别来凑。</div>` },
    { h: '对比：系动词和普通动词', html: `<p>同一个词，当“做动作”讲时是普通动词，后面可以接副词或宾语：</p>
      <p class="ex">She looks happy.<span class="zh">她看起来很开心。（系动词 + 形容词）</span></p>
      <p class="ex">She looked at me happily.<span class="zh">她开心地看着我。（look at 是动作，用副词修饰）</span></p>
      <p class="ex">He tasted the soup carefully.<span class="zh">他仔细地尝了尝汤。（taste 是动作）</span></p>` },
    { h: '易错点', html: `<ul>
      <li><span class="en">The cake tastes <b>delicious</b>.</span> 不能写 deliciously。</li>
      <li>感官系动词<b>没有被动语态</b>：不能写 The cake is tasted good。</li>
      <li><b>well</b> 作形容词只表示“身体好”：<span class="en">I don't feel well.</span>（我不舒服）；说东西“好”要用 good：<span class="en">It sounds good.</span></li>
      <li>系动词后也可以接名词：<span class="en">He became a doctor.</span>；look like / sound like + 名词：<span class="en">It looks like rain.</span></li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'The flowers smell ___.', options: ['nicely', 'nice', 'well'], answer: 1, explain: 'smell 在这里是系动词“闻起来”，后面接形容词 nice；well 作形容词只表示身体好。' },
    { type: 'choice', q: 'She looked at the photo ___.', options: ['sad', 'sadly', 'sadness'], answer: 1, explain: 'look at 是“看”这个动作，修饰动作用副词 sadly。对比：She looks sad.（系动词 + 形容词）' },
    { type: 'fill', q: 'In autumn, the leaves ___ yellow.（填一个表示“变”的系动词，用一般现在时）', answer: ['turn', 'become', 'get', 'go', 'grow'], explain: 'turn / become 等变化类系动词后接形容词 yellow；leaves 是复数，用原形。' },
    { type: 'choice', q: 'Please keep ___. The baby is sleeping.', options: ['quiet', 'quietly', 'quietness'], answer: 0, explain: 'keep 在这里是保持类系动词“保持”，后接形容词 quiet，说明主语保持的状态；quietly 是副词，不能做表语。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['The flowers are smelt sweet.', 'The flowers smell sweet.', 'The flowers smell sweetly.'], answer: 1, explain: '感官系动词没有被动语态，不能说 are smelt；系动词后接形容词 sweet，不接副词 sweetly。' },
    { type: 'choice', q: '—Look at the dark clouds!<br>—Yes. It ___ rain.', options: ['looks', 'looks like', 'is looked like'], answer: 1, explain: 'rain 在这里是名词“雨”。系动词后面接名词表示“看起来像……”时用 look like + 名词：It looks like rain.（看样子要下雨了。）' },
    { type: 'choice', q: '—Mmm! Your cake ___ delicious. Can I have another piece?', options: ['tastes', 'sounds', 'hears'], answer: 0, explain: '吃了蛋糕说“尝起来”很好吃，用感官系动词 taste，后接形容词 delicious；sound 指听起来，hear 不是系动词。' },
    { type: 'choice', q: 'The plan sounds ___, and I feel ___ today, so let\'s go.', options: ['good; well', 'well; good', 'well; well'], answer: 0, explain: '说计划“好”用 good；well 作形容词只表示“身体好”，所以 sounds 后不能用 well，feel well 表示身体舒服。' },
    { type: 'fill', q: 'He wants to ___ a doctor when he grows up.（填一个表示“成为”的系动词）', answer: ['become', 'be'], explain: '系动词后面也可以接名词做表语：become a doctor 成为医生。' }
  ],
  tests: [
    { type: 'choice', q: 'You look ___ today. Did something good happen?', options: ['happy', 'happily', 'happiness'], answer: 0, explain: 'look 是系动词“看起来”，后接形容词 happy。' },
    { type: 'choice', q: '—How does the cake taste?<br>—It tastes ___.', options: ['well', 'delicious', 'deliciously'], answer: 1, explain: 'taste 是系动词，后接形容词 delicious；well 作形容词只表示“身体好”。' },
    { type: 'fill', q: 'The music sounds ___.（beauty，用适当形式）', answer: ['beautiful'], explain: 'sound 是系动词，后接形容词 beautiful。' },
    { type: 'choice', q: 'In spring, the weather gets ___.', options: ['warm', 'warmly', 'warmth'], answer: 0, explain: 'get 表示“变得”，是系动词，后接形容词 warm。' },
    { type: 'fill', q: 'This kind of cloth feels ___.（soft，用适当形式）', answer: ['soft'], explain: 'feel 在这里是系动词“摸起来”，后接形容词 soft，不能用副词 softly。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['The dish tastes well.', 'The dish is tasted good.', 'The dish tastes good.'], answer: 2, explain: '系动词 taste 后接形容词 good；感官系动词没有被动语态。' },
    { type: 'choice', q: '—I will take you to the science museum this Sunday.<br>—That sounds ___!', options: ['great', 'greatly', 'well'], answer: 0, explain: 'sound 是系动词“听起来”，后接形容词 great。' },
    { type: 'choice', q: '听对话，回答问题：How does the soup taste?', say: [{ who: 'W', text: 'How does the soup taste, Dad?' }, { who: 'M', text: 'It tastes a little salty, but it smells great.' }], options: ['有点咸', '有点甜', '有点辣'], answer: 0, explain: '对话里说 It tastes a little salty（尝起来有点咸）；taste 是系动词，后面接形容词 salty。' },
    { type: 'choice', q: 'Your idea seems ___. Let\'s try it.', options: ['useful', 'usefully', 'use'], answer: 0, explain: 'seem“似乎”是系动词，后接形容词 useful。' },
    { type: 'fill', q: 'We should eat more vegetables to keep ___.（health，用适当形式）', answer: ['healthy'], explain: 'keep 是保持类系动词，后接形容词 healthy（健康的）。' },
    { type: 'choice', q: 'When he heard the bad news, his face turned ___.', options: ['pale', 'palely', 'paleness'], answer: 0, explain: 'turn 表示“变得”，是变化类系动词，后接形容词 pale（苍白的）。' },
    { type: 'choice', q: 'Ten years later, the little boy ___ a famous scientist.', options: ['became', 'looked', 'sounded'], answer: 0, explain: '“变成了”一位科学家，用变化类系动词 become 的过去式 became；系动词后也可以接名词。' },
    { type: 'choice', q: 'The cook smelled the fish ___ to see if it was fresh.', options: ['carefully', 'careful', 'care'], answer: 0, explain: '这里的 smell 是“闻”这个动作，后面有宾语 the fish，修饰动作用副词 carefully。' },
    { type: 'fill', q: 'He looked ___ at the map before he started the trip.（careful，用适当形式）', answer: ['carefully'], explain: 'look at 是“看”这个动作，修饰动作要用副词 carefully。对比：He looks careful.（系动词 + 形容词）' },
    { type: 'choice', q: 'Grandma ___ the cloth gently and said, "It\'s very soft."', options: ['felt', 'was felt', 'feels like'], answer: 0, explain: '这里 feel 是“摸”这个动作，有宾语 the cloth，用副词 gently 修饰；过去时用 felt。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['This song sounds sweet.', 'This song is sounded sweet.', 'This song sounds sweetly.'], answer: 0, explain: '感官系动词没有被动语态，后接形容词 sweet。' },
    { type: 'fill', q: '改错：The bread is smelt good. 句中谓语有错，写出正确的谓语动词（填一个词）', answer: ['smells'], explain: '感官系动词没有被动语态，应改为 The bread smells good.；主语是单数，用 smells。' },
    { type: 'choice', q: '—You look pale. Are you OK?<br>—I don\'t feel ___. I have a headache.', options: ['well', 'nice', 'healthily'], answer: 0, explain: 'well 作形容词表示“身体好”，I don\'t feel well 意思是“我不舒服”。' },
    { type: 'choice', q: '—Let\'s have a picnic this weekend.<br>—Sounds ___!', options: ['good', 'well', 'nicely'], answer: 0, explain: '说一件事“好”用 good；well 作形容词只表示身体好，nicely 是副词。' },
    { type: 'choice', q: 'The little girl ___ her mother. They both have big eyes.', options: ['looks like', 'looks', 'is looked like'], answer: 0, explain: '看起来像某人，用 look like + 名词；主语单数用 looks like。' },
    { type: 'fill', q: '—What\'s that noise?<br>—It sounds ___ a train.（填一个词）', answer: ['like'], explain: 'sound like + 名词，“听起来像……”。' }
  ]
},

{
  id: 'g-reflexive', title: '反身代词', short: '反身代词', module: 'morph', grade: 7, freq: 2,
  prereqs: ['g-pronoun'],
  tip: '常考固定搭配 enjoy oneself、help oneself to、by oneself，以及根据主语选对 yourself / yourselves。',
  learn: [
    { h: '一张表', html: `<table class="tbl"><tr><th>人称</th><th>单数</th><th>复数</th></tr>
      <tr><td>第一人称</td><td>myself</td><td>ourselves</td></tr>
      <tr><td>第二人称</td><td>yourself</td><td>yourselves</td></tr>
      <tr><td>第三人称</td><td>himself / herself / itself</td><td>themselves</td></tr></table>
      <div class="rhyme">一二人称用“形物”（my, your, our），<br>三人称用“宾格”（him, her, it, them）；<br>单数加 self，复数加 selves。</div>` },
    { h: '什么时候用', html: `<p>动作的承受者就是主语<b>自己</b>时，用反身代词：</p>
      <p class="ex">Be careful! Don't hurt yourself.<span class="zh">小心！别伤着自己。</span></p>
      <p>表示“亲自、本人”，起强调作用：</p>
      <p class="ex">I made the cake myself.<span class="zh">这个蛋糕是我自己做的。</span></p>` },
    { h: '常用搭配', html: `<table class="tbl"><tr><th>短语</th><th>意思</th></tr>
      <tr><td>enjoy oneself</td><td>玩得开心（= have a good time）</td></tr>
      <tr><td>help oneself (to sth)</td><td>随便吃 / 用（某物）</td></tr>
      <tr><td>teach oneself</td><td>自学（= learn by oneself）</td></tr>
      <tr><td>by oneself</td><td>独自、靠自己</td></tr>
      <tr><td>hurt oneself</td><td>伤到自己</td></tr>
      <tr><td>say to oneself</td><td>自言自语</td></tr>
      <tr><td>dress oneself</td><td>自己穿衣服</td></tr></table>
      <p class="ex">Help yourselves to some fruit, children.<span class="zh">孩子们，随便吃点水果吧。</span></p>
      <p class="ex">He taught himself French.<span class="zh">他自学法语。</span></p>` },
    { h: '易错点', html: `<ul>
      <li>看清主语是一个人还是几个人：对 Tom 说用 <b>yourself</b>，对 boys and girls 说用 <b>yourselves</b>。</li>
      <li>反身代词不能单独做主语：不能说 Myself am a student。</li>
      <li>不要写成 hisself、theirselves，正确的是 <b>himself、themselves</b>。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: '—Did you enjoy ___ at the party, Lucy?<br>—Yes, I had a great time.', options: ['you', 'yourself', 'yourselves'], answer: 1, explain: 'enjoy oneself 玩得开心；只问 Lucy 一个人，用 yourself。' },
    { type: 'fill', q: 'Tom is only five, but he can dress ___.（he 的反身代词）', answer: ['himself'], explain: 'dress oneself 自己穿衣服；主语是 Tom，用 himself。' },
    { type: 'choice', q: 'Look! The cat is washing ___ in the sun.', options: ['itself', 'its', 'itselves'], answer: 0, explain: '第三人称用宾格加 self：it → itself；its 是物主代词，没有 itselves 这个词。' },
    { type: 'fill', q: 'We cleaned the classroom ___. Nobody helped us.（we 的反身代词）', answer: ['ourselves'], explain: '强调“我们自己”做的，用反身代词；第一人称复数用形容词性物主代词 our + selves。' },
    { type: 'choice', q: '—Can I have some juice, Aunt Li?<br>—Sure. Help ___.', options: ['yourself', 'yourselves', 'you'], answer: 0, explain: 'help oneself (to sth) 随便吃 / 喝；说话的只有“我”一个人，用 yourself。' },
    { type: 'choice', q: 'Mr. Li learned to play the guitar by ___.', options: ['himself', 'him', 'his'], answer: 0, explain: 'by oneself 独自、靠自己；learn by oneself = teach oneself 自学。主语是 Mr. Li，用 himself。' },
    { type: 'fill', q: '"I can do it," Lily said to ___ quietly.（she 的反身代词）', answer: ['herself'], explain: 'say to oneself 自言自语；主语是 Lily，用 herself。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['Myself cleaned the room.', 'I cleaned the room myself.', 'I cleaned the room me.'], answer: 1, explain: '反身代词不能单独做主语，主语要用 I；放在句末的 myself 表示强调“我自己”。' },
    { type: 'fill', q: 'The children made the cards by ___.（they 的反身代词，注意拼写）', answer: ['themselves'], explain: '第三人称用宾格 them + selves = themselves，不能写成 theirselves。' },
    { type: 'choice', q: 'Be careful with the scissors! Don\'t hurt ___, Lily.', options: ['yourself', 'yourselves', 'you'], answer: 0, explain: '“伤到”的是 Lily 自己，动作的承受者就是主语本人，用反身代词；hurt oneself 伤到自己，对一个人说用 yourself。' },
    { type: 'fill', q: 'Nobody taught her to draw. She taught ___.（she 的反身代词）', answer: ['herself'], explain: 'teach oneself 自学；主语是 she，用 herself。' },
    { type: 'choice', q: 'Boys and girls, please look after ___ during the trip.', options: ['yourselves', 'yourself', 'themselves'], answer: 0, explain: '对 boys and girls 说话，是“你们”，复数，用 yourselves；themselves 是“他们自己”。' }
  ],
  tests: [
    { type: 'choice', q: 'Nobody taught me. I taught ___ English.', options: ['me', 'my', 'myself'], answer: 2, explain: '主语是 I，动作作用在自己身上，用 myself。' },
    { type: 'fill', q: '—Did you enjoy ___ at the picnic, boys?<br>—Yes, we did.（you 的反身代词）', answer: ['yourselves'], explain: '问的是 boys，是复数，用 yourselves。' },
    { type: 'choice', q: '—Help ___ to some fish, children.<br>—Thank you.', options: ['yourself', 'yourselves', 'you'], answer: 1, explain: 'help oneself to sth 随便吃；对 children 说是复数，用 yourselves。' },
    { type: 'choice', q: 'The little girl is only six, but she can go to school by ___.', options: ['her', 'hers', 'herself'], answer: 2, explain: 'by oneself 独自；主语是 she，用 herself。' },
    { type: 'fill', q: 'She often says to ___, "Never give up."（she 的反身代词）', answer: ['herself'], explain: 'say to oneself 自言自语；主语是 she，用 herself。' },
    { type: 'choice', q: 'Lucy and Lily made the kite ___. Nobody helped them.', options: ['themselves', 'them', 'their'], answer: 0, explain: '强调“她们自己”做的，用反身代词 themselves。' },
    { type: 'choice', q: 'Be careful with the knife, Tom. Don\'t cut ___.', options: ['you', 'yourself', 'yourselves'], answer: 1, explain: '对 Tom 一个人说，动作作用在自己身上，用 yourself。' },
    { type: 'fill', q: '—Who taught you two to cook?<br>—Nobody. We taught ___.（we 的反身代词）', answer: ['ourselves'], explain: '主语是 we，复数，用 ourselves；teach oneself 自学。' },
    { type: 'choice', q: 'You and your sister should look after ___ when Mom is away.', options: ['yourself', 'yourselves', 'themselves'], answer: 1, explain: '主语 you and your sister 是两个人，用复数 yourselves。' },
    { type: 'fill', q: 'Tom fell off his bike and hurt ___.（he 的反身代词）', answer: ['himself'], explain: 'hurt oneself 伤到自己；主语是 Tom，用 himself。' },
    { type: 'choice', q: 'I made this birthday card ___. Do you like it?', options: ['myself', 'me', 'mine'], answer: 0, explain: '强调“我亲自”做的，用反身代词 myself。' },
    { type: 'fill', q: 'We enjoyed ___ very much at the beach last Sunday.（we 的反身代词）', answer: ['ourselves'], explain: 'enjoy oneself 玩得开心；主语是 we，用 ourselves。' },
    { type: 'fill', q: 'The kids had a good time at the zoo.<br>= The kids enjoyed ___ at the zoo.（填一个词）', answer: ['themselves'], explain: 'have a good time = enjoy oneself；主语 the kids 是复数第三人称，用 themselves。' },
    { type: 'choice', q: 'Here are some apples, Mr. Green. Help yourself ___ them.', options: ['to', 'with', 'for'], answer: 0, explain: 'help oneself to sth 随便吃 / 用某物，介词用 to。' },
    { type: 'fill', q: 'My uncle learned French by himself.<br>= My uncle taught ___ French.（填一个词）', answer: ['himself'], explain: 'learn by oneself = teach oneself 自学；主语是 my uncle，用 himself。' },
    { type: 'choice', q: 'The old man has no children. He lives by ___.', options: ['himself', 'his', 'he'], answer: 0, explain: 'by oneself 独自；主语是 the old man，用 himself。' },
    { type: 'choice', q: '听一听，选出句中用到的反身代词。', say: 'She said to herself, "Don\'t be afraid."', options: ['herself', 'himself', 'yourself'], answer: 0, explain: '听到的句子是 She said to herself...，say to oneself 自言自语，主语 she 对应 herself。' },
    { type: 'choice', q: 'My little brother is only three. He can\'t dress ___ yet.', options: ['himself', 'him', 'his'], answer: 0, explain: 'dress oneself 自己穿衣服；主语是 he，用 himself。' },
    { type: 'fill', q: 'Get up and dress ___, children! It\'s time for school.（you 的反身代词）', answer: ['yourselves'], explain: '对 children 说，是复数，用 yourselves；dress oneself 自己穿衣服。' },
    { type: 'choice', q: '—Who cleaned the blackboard?<br>—___ did.', options: ['I', 'Myself', 'Mine'], answer: 0, explain: '反身代词不能单独做主语，回答“谁做的”要用主格 I。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['Himself is a good student.', 'He is a good student.', 'Him is a good student.'], answer: 1, explain: '反身代词不能单独做主语，宾格也不能做主语，要用主格 he。' },
    { type: 'choice', q: 'They built the snowman by ___.', options: ['themselves', 'theirselves', 'themself'], answer: 0, explain: '正确拼写是 themselves（宾格 them + selves），没有 theirselves 和 themself。' },
    { type: 'fill', q: '改错：He made the kite by hisself. 写出改正后的词（填一个词）', answer: ['himself'], explain: '第三人称反身代词用宾格加 self：him + self = himself，不能写成 hisself。' }
  ]
},

{
  id: 'g-compound-pronoun', title: '复合不定代词 something / anything / nothing...', short: '复合不定代词', module: 'morph', grade: 7, freq: 3,
  prereqs: ['g-countable'],
  tip: '中考高频：形容词要放在复合不定代词后面（something important），做主语时谓语用单数，以及 some- / any- / no- 的选择。',
  learn: [
    { h: '家族成员', html: `<table class="tbl"><tr><th></th><th>-thing（东西）</th><th>-body / -one（人）</th></tr>
      <tr><td>some-</td><td>something 某事 / 某物</td><td>somebody / someone 某人</td></tr>
      <tr><td>any-</td><td>anything 任何事物</td><td>anybody / anyone 任何人</td></tr>
      <tr><td>no-</td><td>nothing 没有东西</td><td>nobody / no one 没有人</td></tr>
      <tr><td>every-</td><td>everything 一切</td><td>everybody / everyone 每个人</td></tr></table>
      <p class="warn">no one 要分开写两个词，其他都写成一个词。</p>` },
    { h: 'some- 还是 any-', html: `<ul>
      <li>肯定句用 <b>some-</b>：<span class="en">There is something in the box.</span></li>
      <li>否定句和一般疑问句用 <b>any-</b>：<span class="en">I didn't see anyone.</span> / <span class="en">Is there anything in the box?</span></li>
      <li>表示请求、提供东西，希望对方说“好”时，疑问句也用 <b>some-</b>：</li></ul>
      <p class="ex">Would you like something to drink?<span class="zh">你想喝点什么吗？</span></p>
      <p><b>nothing = not anything</b>，<b>nobody = not anybody</b>：</p>
      <p class="ex">I have nothing to do. = I don't have anything to do.<span class="zh">我没事可做。</span></p>` },
    { h: '两条铁规则', html: `<div class="rhyme">复合代词是单数，形容词往后站；<br>想加 else 也一样，后面跟着不能忘。</div>
      <p>① 做主语时，谓语动词用<b>单数</b>：</p>
      <p class="ex">Everyone is here.<span class="zh">大家都到了。</span></p>
      <p class="ex">Nothing is impossible.<span class="zh">一切皆有可能。</span></p>
      <p>② 形容词、else、to do 都放在它<b>后面</b>：</p>
      <p class="ex">I have something important to tell you.<span class="zh">我有重要的事要告诉你。</span></p>
      <p class="ex">Is there anything else?<span class="zh">还有别的吗？</span></p>` },
    { h: '易错点', html: `<ul>
      <li>不能说 important something，要说 <b>something important</b>。</li>
      <li>不能双重否定：<span class="en">I didn't see anybody.</span>（不能说 didn't see nobody）</li>
      <li>回答 Who 的问题用 Nobody / No one；回答 What 的问题用 Nothing。</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'I have ___ to tell you. Please listen carefully.', options: ['important something', 'something important', 'anything important'], answer: 1, explain: '形容词放在复合不定代词后面；肯定句用 something，所以是 something important。' },
    { type: 'choice', q: '—Would you like ___ to drink?<br>—Yes, a cup of tea, please.', options: ['something', 'nothing', 'everything'], answer: 0, explain: '表示主动提供东西、希望对方接受的疑问句，用 something。' },
    { type: 'choice', q: 'Listen! ___ is knocking at the door.', options: ['Somebody', 'Something', 'Anything'], answer: 0, explain: '敲门的是“人”，用 -body / -one 结尾的词；肯定句用 some-，所以是 Somebody。' },
    { type: 'fill', q: '___ ___ knows the answer. The question is too hard.（没有人，填两个词，注意首字母大写）', answer: ['No one'], explain: '“没有人”可以说 nobody 或 no one；这里要填两个词，是 No one，必须分开写。' },
    { type: 'choice', q: "It's too dark. I can't see ___ in the room.", options: ['anything', 'something', 'nothing'], answer: 0, explain: '否定句用 any-；can\'t 已经是否定，再用 nothing 就成了双重否定。' },
    { type: 'fill', q: "I don't have anything to eat.<br>= I have ___ to eat.（填一个词）", answer: ['nothing'], explain: 'not anything = nothing。去掉 don\'t 以后，用 nothing 表示“什么也没有”。' },
    { type: 'choice', q: 'Everything ___ ready for the party. Let\'s begin.', options: ['is', 'are', 'be'], answer: 0, explain: '复合不定代词做主语，谓语用单数，everything 虽然意思是“一切”，也用 is。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ["I didn't say nothing.", "I didn't say anything.", 'I said anything.'], answer: 1, explain: '否定句中用 anything；didn\'t 和 nothing 连用是双重否定，错误；肯定句不用 anything 表示“某事”。' },
    { type: 'choice', q: '—What did you buy at the shop?<br>—___. It was closed.', options: ['Nothing', 'Nobody', 'No one'], answer: 0, explain: '问 What（什么东西），否定回答用 Nothing；Nobody / No one 回答 Who 的问题。' },
    { type: 'choice', q: "I'm hungry. I want to eat ___.", options: ['something', 'anything', 'nothing'], answer: 0, explain: '这是肯定句，表示“某物、一些东西”用 something；anything 用于否定句和疑问句。' },
    { type: 'choice', q: '—Anything ___?<br>—No, thanks. That\'s all.', options: ['else', 'other', 'others'], answer: 0, explain: 'else 修饰复合不定代词，放在它后面：anything else 还有别的吗。' }
  ],
  tests: [
    { type: 'choice', q: "There is ___ wrong with my bike. Can you help me fix it?", options: ['something', 'anything', 'nothing'], answer: 0, explain: '后面请人帮忙修，说明车有毛病；肯定句用 something。' },
    { type: 'choice', q: 'Everyone in our class ___ here today.', options: ['is', 'are', 'am'], answer: 0, explain: 'everyone 做主语，谓语动词用单数 is。' },
    { type: 'choice', q: '—Who is in the classroom?<br>—___. All the students have gone home.', options: ['Nobody', 'Somebody', 'Everybody'], answer: 0, explain: '学生都回家了，所以“没有人”，用 Nobody。' },
    { type: 'choice', q: "We didn't see ___ in the park because it was raining heavily.", options: ['anyone', 'no one', 'nothing'], answer: 0, explain: '否定句用 any-，didn\'t 后面再用 no one / nothing 就成了双重否定。' },
    { type: 'fill', q: 'I looked everywhere, but I found ___.（什么也没找到，填一个复合不定代词）', answer: ['nothing'], explain: '句中没有 not，表示“什么也没有”要用 nothing。' },
    { type: 'fill', q: 'Is there ___ in today\'s newspaper?（新鲜事，用 anything 和 new 组成，填两个词）', answer: ['anything new'], explain: '一般疑问句用 anything，形容词 new 放在后面。' },
    { type: 'choice', q: 'I have ___ to do this afternoon. Let\'s go to the cinema together.', options: ['something', 'nothing', 'everything'], answer: 1, explain: '下午约人去看电影，说明“没事可做”，用 nothing。' },
    { type: 'choice', q: 'There is ___ at the door. It\'s your friend Tom.', options: ['somebody', 'something', 'anything'], answer: 0, explain: '门口的是汤姆，是“人”，用 somebody；肯定句用 some-。' },
    { type: 'choice', q: '下面哪个词的写法是正确的？', options: ['noone', 'no one', 'no-body'], answer: 1, explain: '“没有人”写作 no one（分开写两个词）或 nobody（一个词，中间没有连字符）。' },
    { type: 'fill', q: 'There was ___ ___ in the room, so it was very quiet.（一个人也没有，填两个词）', answer: ['no one'], explain: '“没有人”填两个词时是 no one，分开写。' },
    { type: 'choice', q: 'Listen! I can hear ___ singing next door.', options: ['someone', 'anyone', 'no one'], answer: 0, explain: '“听！”说明确实听到有人在唱歌，是肯定句，用 someone。' },
    { type: 'choice', q: '—Could I have ___ to eat, Mom? I\'m hungry.<br>—Sure. There are some cakes in the fridge.', options: ['something', 'nothing', 'everything'], answer: 0, explain: '表示请求、希望对方答应的疑问句，用 something。' },
    { type: 'choice', q: 'The trip is long. Shall I bring you ___ to read?', options: ['something', 'nothing', 'everything'], answer: 0, explain: '主动给别人提供东西，疑问句也用 something。' },
    { type: 'choice', q: 'He has nothing to say.<br>= He doesn\'t have ___ to say.', options: ['anything', 'nothing', 'something'], answer: 0, explain: 'nothing = not anything；句中已有 doesn\'t，用 anything。' },
    { type: 'fill', q: 'Nobody ___ the answer to this question.（know，一般现在时）', answer: ['knows'], explain: 'nobody 做主语，谓语用第三人称单数 knows。' },
    { type: 'choice', q: 'Something ___ wrong with my computer. It can\'t start.', options: ['is', 'are', 'be'], answer: 0, explain: 'something 做主语，谓语用单数 is。' },
    { type: 'fill', q: '___ in our class likes the new teacher.（每个人，填一个词，注意首字母大写）', answer: ['Everyone', 'Everybody'], explain: '“每个人”是 everyone / everybody，做主语谓语用单数，所以后面是 likes。' },
    { type: 'fill', q: 'I have nothing ___ to tell you. That\'s all.（别的，填一个词）', answer: ['else'], explain: 'else 要放在复合不定代词后面：nothing else 没有别的。' },
    { type: 'choice', q: 'Tom isn\'t here. Can ___ help me move the desk?', options: ['anybody else', 'else anybody', 'anybody other'], answer: 0, explain: 'else 修饰复合不定代词时放在后面：anybody else 别的人。' },
    { type: 'choice', q: '—Is there ___ in the box?<br>—No, it\'s empty.', options: ['anything', 'nothing', 'everything'], answer: 0, explain: '一般疑问句用 anything；回答说盒子是空的，说明是在问“有没有东西”。' },
    { type: 'choice', q: "There isn't ___ in the fridge. Let's go shopping.", options: ['anything', 'nothing', 'something'], answer: 0, explain: '否定句用 anything；isn\'t 后面再用 nothing 就成了双重否定。' },
    { type: 'fill', q: "改错：I didn't tell nobody about it. 写出改正后的词（填一个词）", answer: ['anybody', 'anyone'], explain: 'didn\'t 已经表示否定，不能再用 nobody（双重否定），要改成 anybody / anyone。' },
    { type: 'choice', q: '—Who can help me carry the box?<br>—___. We are all busy now.', options: ['Nobody', 'Nothing', 'Anybody'], answer: 0, explain: '问 Who（谁），大家都很忙，回答“没有人”用 Nobody；Nothing 回答 What 的问题。' }
  ]
},

{
  id: 'g-prep-common', title: '常用介词辨析', short: '介词辨析', module: 'morph', grade: 7, freq: 3,
  prereqs: ['g-prep-time', 'g-prep-place'],
  tip: '完形填空和短文填空常考 across / through、between / among、by / with / in 以及介词固定搭配，要靠语境和搭配判断。',
  learn: [
    { h: 'across / through / over / along', html: `<table class="tbl"><tr><th>词</th><th>意思</th><th>例子</th></tr>
      <tr><td>across</td><td>从<b>表面</b>横穿过去</td><td>walk across the street, swim across the river</td></tr>
      <tr><td>through</td><td>从<b>内部、中间</b>穿过</td><td>walk through the forest, through the window</td></tr>
      <tr><td>over</td><td>从<b>上方</b>越过</td><td>jump over the wall, fly over the city</td></tr>
      <tr><td>along</td><td>沿着</td><td>walk along the river</td></tr></table>
      <div class="rhyme">表面横过 across，内部穿过 through；<br>上方越过用 over，沿着走就用 along。</div>` },
    { h: 'between / among', html: `<p><b>between</b>：在两者之间（between A and B）；<b>among</b>：在三者或以上之间。</p>
      <p class="ex">Lily sits between Lucy and Kate.<span class="zh">莉莉坐在露西和凯特中间。</span></p>
      <p class="ex">The teacher is popular among the students.<span class="zh">这位老师在学生中很受欢迎。</span></p>` },
    { h: '表示方式：by / with / in / on', html: `<table class="tbl"><tr><th>介词</th><th>用法</th><th>例子</th></tr>
      <tr><td>by</td><td>交通方式（后面不加冠词）</td><td>by bus, by bike, by plane</td></tr>
      <tr><td>on / in</td><td>交通工具前有 a / the / my 等词时</td><td>on the bus, on my bike, in his car</td></tr>
      <tr><td>with</td><td>用工具、身体部位</td><td>cut it with a knife, see with our eyes</td></tr>
      <tr><td>in</td><td>用语言、颜色</td><td>in English, in red</td></tr></table>
      <p class="ex">I go to school by bike. = I go to school on my bike.<span class="zh">我骑自行车上学。</span></p>
      <p class="warn">走路是 on foot，不是 by foot。</p>` },
    { h: 'except / besides', html: `<p><b>except</b>：除……之外（<b>不包括</b>在内）；<b>besides</b>：除……之外还有（<b>包括</b>在内）。</p>
      <p class="ex">Everyone went to the park except Tom.<span class="zh">除了汤姆，大家都去了公园。（汤姆没去）</span></p>
      <p class="ex">Besides English, I also study French.<span class="zh">除了英语，我还学法语。（两门都学）</span></p>` },
    { h: '常用固定搭配', html: `<p class="small">be good at 擅长, be interested in 对……感兴趣, be famous for 因……而出名, be different from 与……不同, be afraid of 害怕, be proud of 为……骄傲, be full of 充满, be late for 迟到, be strict with sb 对某人严格, be friendly to sb 对某人友好, thanks for 因……而感谢, arrive at（小地方）/ arrive in（大地方）, listen to, wait for, look after, laugh at</p>` }
  ],
  examples: [
    { type: 'choice', q: 'Lily sits ___ Lucy and Kate.', options: ['among', 'between', 'through'], answer: 1, explain: '在两个人之间，用 between ... and ...。' },
    { type: 'choice', q: 'My father goes to work ___ every day.', options: ['by car', 'by a car', 'in car'], answer: 0, explain: 'by 后面直接接交通工具，不加冠词；用 in 时要说 in his car。' },
    { type: 'choice', q: 'The boy swam ___ the river in ten minutes.', options: ['across', 'through', 'among'], answer: 0, explain: '从河的这一边游到对岸，是在水面上“横穿”，用 across；through 指从内部穿过（如森林、窗户、隧道）。' },
    { type: 'choice', q: 'The children walked ___ the forest and found a small house.', options: ['through', 'over', 'between'], answer: 0, explain: '森林里到处是树，是从“内部、中间”穿过，用 through。' },
    { type: 'choice', q: 'The cat jumped ___ the wall and ran away.', options: ['over', 'through', 'along'], answer: 0, explain: '从墙的上方越过，用 over。' },
    { type: 'choice', q: 'We walked ___ the river and talked happily.', options: ['along', 'among', 'between'], answer: 0, explain: '沿着河边走，用 along。' },
    { type: 'choice', q: 'She shared the cakes ___ her five friends.', options: ['among', 'between', 'through'], answer: 0, explain: '五个朋友是三者以上，“在……之间分”用 among；between 用于两者之间。' },
    { type: 'choice', q: 'I usually go to school ___ my bike.', options: ['on', 'by', 'with'], answer: 0, explain: '交通工具前有 my 等限定词时，不能用 by，要用 on：on my bike = by bike。' },
    { type: 'fill', q: 'Tom lives near the school, so he goes to school ___ foot.（填一个介词）', answer: ['on'], explain: '步行是 on foot，不能说 by foot。' },
    { type: 'choice', q: 'Please cut the apple ___ a knife.', options: ['with', 'by', 'in'], answer: 0, explain: '用工具做事，介词用 with。' },
    { type: 'choice', q: 'The girl ___ red is my sister.', options: ['in', 'with', 'on'], answer: 0, explain: '表示穿着某种颜色的衣服，用 in：the girl in red 穿红衣服的女孩。' },
    { type: 'choice', q: '___ Chinese, we also learn English and math.', options: ['Besides', 'Except', 'Between'], answer: 0, explain: '后面有 also，说明语文也在学的范围之内，“除……之外还有”用 besides。' },
    { type: 'fill', q: 'Our English teacher is strict ___ us, but she is very kind.（填一个介词）', answer: ['with'], explain: 'be strict with sb 对某人严格。' },
    { type: 'fill', q: 'We arrived ___ Beijing at nine last night.（填一个介词）', answer: ['in'], explain: '到达大地方（城市、国家）用 arrive in；到达小地方（车站、学校）用 arrive at。' },
    { type: 'fill', q: 'Please wait ___ me at the school gate.（填一个介词）', answer: ['for'], explain: 'wait for sb 等某人，是固定的“动词 + 介词”搭配。' },
    { type: 'choice', q: 'Everyone in my family likes fish ___ me. I don\'t like it at all.', options: ['except', 'besides', 'with'], answer: 0, explain: '“我”不喜欢鱼，不包括在“喜欢”的人里，用 except；besides 表示“除……之外还有”，包括在内。' }
  ],
  tests: [
    { type: 'choice', q: 'The sunlight comes into the room ___ the window.', options: ['across', 'through', 'over'], answer: 1, explain: '阳光从窗户中间穿过，用 through。' },
    { type: 'choice', q: 'Look left and right before you go ___ the road.', options: ['across', 'through', 'among'], answer: 0, explain: '从马路表面横穿过去，用 across。' },
    { type: 'choice', q: 'Mr. Wang is very popular ___ the students in our school.', options: ['between', 'among', 'through'], answer: 1, explain: '全校学生是三者以上，“在……之中”用 among。' },
    { type: 'fill', q: 'My cousin often goes to the library ___ bike.（填一个介词）', answer: ['by'], explain: '表示交通方式，by + 交通工具，中间不加冠词。' },
    { type: 'choice', q: 'Can you say it ___ English?', options: ['with', 'by', 'in'], answer: 2, explain: '用某种语言，介词用 in。' },
    { type: 'fill', q: 'Hangzhou is famous ___ the West Lake.（填一个介词）', answer: ['for'], explain: 'be famous for 因……而出名。' },
    { type: 'choice', q: 'All the students went to the museum ___ Tom. He was ill at home.', options: ['except', 'besides', 'with'], answer: 0, explain: '汤姆生病没去，不包括在内，用 except。' },
    { type: 'choice', q: 'There is a long bridge ___ the river.', options: ['across', 'through', 'along'], answer: 0, explain: '桥横跨在河面上，从这岸到对岸，用 across。' },
    { type: 'fill', q: 'Can you swim ___ the lake? It\'s about 500 metres wide.（从表面横穿，填一个介词）', answer: ['across'], explain: '从湖面横穿过去，用 across。' },
    { type: 'choice', q: 'The sunlight came in ___ the window.', options: ['through', 'across', 'over'], answer: 0, explain: '阳光从窗户里面穿过来，用 through。' },
    { type: 'choice', q: 'The thief got into the house ___ the window.', options: ['through', 'across', 'along'], answer: 0, explain: '从窗户中间穿过进入房子，用 through。' },
    { type: 'choice', q: 'A bird flew ___ our heads.', options: ['over', 'through', 'along'], answer: 0, explain: '从头顶上方飞过，用 over。' },
    { type: 'fill', q: 'The horse jumped ___ the fence easily.（从上方越过，填一个介词）', answer: ['over'], explain: '从上方越过，用 over。' },
    { type: 'choice', q: 'There are many trees ___ the street.', options: ['along', 'over', 'through'], answer: 0, explain: '树沿着街道种着，用 along。' },
    { type: 'fill', q: 'Go ___ this road and you\'ll see the bank on your left.（沿着，填一个介词）', answer: ['along'], explain: '沿着这条路走，用 along。' },
    { type: 'choice', q: 'The bank is ___ the post office and the hospital.', options: ['between', 'among', 'across'], answer: 0, explain: '在邮局和医院两者之间，用 between ... and ...。' },
    { type: 'choice', q: 'The little boy sat ___ his parents at dinner.', options: ['between', 'among', 'along'], answer: 0, explain: 'parents 是父母两个人，在两者之间用 between。' },
    { type: 'fill', q: 'Let\'s meet ___ 3:00 and 4:00 this afternoon.（填一个介词）', answer: ['between'], explain: '在两个时间点之间，between ... and ...。' },
    { type: 'fill', q: 'The singer is very popular ___ young people.（在……之中，填一个介词）', answer: ['among'], explain: 'young people 是一群人（三者以上），用 among。' },
    { type: 'choice', q: 'Can you find your brother ___ these boys in the photo?', options: ['among', 'between', 'along'], answer: 0, explain: '在一群男孩（三者以上）中找人，用 among。' },
    { type: 'choice', q: 'They went to Xiamen ___ last summer.', options: ['by train', 'by a train', 'on train'], answer: 0, explain: 'by + 交通工具，中间不加冠词；on 后面要加冠词：on the train。' },
    { type: 'choice', q: 'My dad goes to work ___ his car.', options: ['in', 'by', 'on'], answer: 0, explain: '有 his 修饰，不能用 by；小汽车要“坐在里面”，用 in his car。' },
    { type: 'fill', q: 'We went to the park ___ the No. 5 bus.（填一个介词）', answer: ['on'], explain: '有 the 修饰的公交车，用 on the bus。' },
    { type: 'fill', q: 'We see ___ our eyes and hear ___ our ears.（两空填同一个介词）', answer: ['with'], explain: '用身体部位做事，介词用 with。' },
    { type: 'choice', q: 'He opened the door ___ a key.', options: ['with', 'in', 'by'], answer: 0, explain: '用钥匙这个工具开门，用 with。' },
    { type: 'choice', q: 'The woman ___ a red coat is our new teacher.', options: ['in', 'on', 'by'], answer: 0, explain: '“穿着……衣服”用 in。' },
    { type: 'fill', q: 'What\'s this ___ English? —It\'s a ruler.（填一个介词）', answer: ['in'], explain: '用某种语言说，介词用 in。' },
    { type: 'choice', q: 'I usually walk to school.<br>= I usually go to school ___.', options: ['on foot', 'by foot', 'with foot'], answer: 0, explain: '步行是 on foot，不能说 by foot。' },
    { type: 'fill', q: 'It\'s not far. Let\'s go there ___ ___.（步行，填两个词）', answer: ['on foot'], explain: '“步行”是固定说法 on foot。' },
    { type: 'choice', q: 'We go to school every day ___ Saturday and Sunday.', options: ['except', 'besides', 'with'], answer: 0, explain: '周六周日不上学，不包括在内，用 except。' },
    { type: 'fill', q: 'All the windows are closed ___ that one. Please close it.（除了，不包括在内，填一个介词）', answer: ['except'], explain: '那扇窗户没关，不包括在“关着”的范围内，用 except。' },
    { type: 'choice', q: '___ swimming, he also likes running and skating.', options: ['Besides', 'Except', 'Among'], answer: 0, explain: '有 also，说明游泳也喜欢，包括在内，用 besides。' },
    { type: 'fill', q: 'I have two cats ___ this dog. I love all of them.（除……之外还有，填一个介词）', answer: ['besides'], explain: '狗和两只猫都养，包括在内，用 besides。' },
    { type: 'fill', q: 'I\'m very interested ___ Chinese history.（填一个介词）', answer: ['in'], explain: 'be interested in 对……感兴趣。' },
    { type: 'choice', q: 'Your idea is different ___ mine.', options: ['from', 'with', 'for'], answer: 0, explain: 'be different from 与……不同。' },
    { type: 'fill', q: 'The bottle is full ___ water.（填一个介词）', answer: ['of'], explain: 'be full of 充满。' },
    { type: 'choice', q: 'They arrived ___ the station at eight.', options: ['at', 'in', 'to'], answer: 0, explain: '车站是小地方，用 arrive at；arrive 后面不能直接用 to。' },
    { type: 'fill', q: 'When did your uncle arrive ___ Shanghai?（填一个介词）', answer: ['in'], explain: '上海是大城市，用 arrive in。' },
    { type: 'choice', q: 'Don\'t laugh ___ others when they make mistakes.', options: ['at', 'to', 'for'], answer: 0, explain: 'laugh at sb 嘲笑某人。' },
    { type: 'fill', q: 'Thanks ___ your help, Mr. Li.（填一个介词）', answer: ['for'], explain: 'thanks for sth 因……而感谢。' }
  ]
},

{
  id: 'g-conj', title: '连词 and / but / or / so 与成对连词', short: '并列连词', module: 'morph', grade: 7, freq: 3,
  prereqs: ['g-present-simple'],
  tip: '完形填空每年都考连词：看前后句是顺接、转折、选择还是因果；成对连词注意“就近原则”，because 和 so 不能同时用。',
  learn: [
    { h: '四个基本连词', html: `<table class="tbl"><tr><th>连词</th><th>关系</th><th>例句</th></tr>
      <tr><td>and</td><td>并列、顺接</td><td>I like reading and he likes singing.</td></tr>
      <tr><td>but</td><td>转折（但是）</td><td>He is old, but he is still strong.</td></tr>
      <tr><td>or</td><td>选择（或者）；否定句中的“和”</td><td>Do you like tea or coffee?</td></tr>
      <tr><td>so</td><td>结果（所以）</td><td>It was late, so we went home.</td></tr></table>
      <p class="ex">I don't like tea or coffee.<span class="zh">我既不喜欢茶也不喜欢咖啡。（否定句里并列常用 or）</span></p>` },
    { h: '因果和转折的“不能同时用”', html: `<div class="rhyme">because 和 so，二者只能选一个；<br>although 和 but，也不能同时出现。</div>
      <p class="ex">Because it rained, we stayed at home.<span class="zh">因为下雨，我们待在家里。</span></p>
      <p class="ex">It rained, so we stayed at home.<span class="zh">下雨了，所以我们待在家里。</span></p>
      <p class="warn">Because it rained, so we stayed at home. —— 这样写是错的。</p>` },
    { h: '成对连词', html: `<table class="tbl"><tr><th>连词</th><th>意思</th><th>做主语时谓语</th></tr>
      <tr><td>both ... and ...</td><td>两者都</td><td>用<b>复数</b></td></tr>
      <tr><td>either ... or ...</td><td>要么……要么……</td><td rowspan="3"><b>就近原则</b>：跟离谓语最近的主语一致</td></tr>
      <tr><td>neither ... nor ...</td><td>既不……也不……</td></tr>
      <tr><td>not only ... but also ...</td><td>不但……而且……</td></tr></table>
      <p class="ex">Both Tom and Jim are good at English.<span class="zh">汤姆和吉姆英语都很好。</span></p>
      <p class="ex">Either you or he is going to clean the room.<span class="zh">要么你、要么他去打扫房间。（离 is 最近的是 he）</span></p>
      <p class="ex">Neither my parents nor I like this film.<span class="zh">我父母和我都不喜欢这部电影。（离 like 最近的是 I）</span></p>` },
    { h: '怎么判断用哪个', html: `<ul>
      <li>前后意思一致、顺着说 → <b>and</b></li>
      <li>前后意思相反 → <b>but</b></li>
      <li>二选一 → <b>or</b></li>
      <li>前面是原因，后面是结果 → <b>so</b></li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'He was ill, ___ he didn\'t go to school yesterday.', options: ['but', 'so', 'or'], answer: 1, explain: '生病是原因，没去上学是结果，用 so。' },
    { type: 'fill', q: 'Neither my parents nor I ___ this film.（like，一般现在时）', answer: ['like'], explain: 'neither ... nor ... 就近原则，离谓语最近的是 I，用 like。' },
    { type: 'choice', q: 'I washed my face ___ brushed my teeth.', options: ['and', 'but', 'or'], answer: 0, explain: '洗脸和刷牙是两个先后顺着发生的动作，并列、顺接用 and。' },
    { type: 'choice', q: 'The bag is very nice, ___ it is too expensive.', options: ['but', 'and', 'so'], answer: 0, explain: '“很好看”和“太贵了”意思相反，表示转折用 but。' },
    { type: 'choice', q: '—Would you like rice ___ noodles for lunch?<br>—Noodles, please.', options: ['or', 'and', 'but'], answer: 0, explain: '回答只选了一样，说明是二选一，用 or。' },
    { type: 'choice', q: "I don't like dogs ___ cats. I'm afraid of them.", options: ['or', 'and', 'but'], answer: 0, explain: '否定句里表示“和”，并列一般用 or：我既不喜欢狗也不喜欢猫。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['Because I was tired, so I went to bed early.', 'I was tired, so I went to bed early.', 'Because I was tired, but I went to bed early.'], answer: 1, explain: 'because 和 so 不能同时用，只能二选一；because 和 but 连用既重复又说不通。' },
    { type: 'choice', q: '___ he is over seventy, he still works hard every day.', options: ['Although', 'But', 'So'], answer: 0, explain: '前后是转折关系，后半句没有连词，前面用 Although；although 和 but 不能同时出现。' },
    { type: 'choice', q: 'Both my brother and I ___ basketball.', options: ['like', 'likes', 'liking'], answer: 0, explain: 'both ... and ... 连接两个主语，谓语用复数 like。' },
    { type: 'choice', q: 'Either Lily or her parents ___ at home now.', options: ['are', 'is', 'am'], answer: 0, explain: 'either ... or ... 就近原则，离谓语最近的是 her parents（复数），用 are。' },
    { type: 'fill', q: 'Not only I but also my sister ___ good at math.（be，一般现在时）', answer: ['is'], explain: 'not only ... but also ... 就近原则，离谓语最近的是 my sister（单数），用 is。' }
  ],
  tests: [
    { type: 'choice', q: 'I like apples, ___ my sister doesn\'t like them.', options: ['and', 'but', 'so'], answer: 1, explain: '前后意思相反（我喜欢、她不喜欢），用 but。' },
    { type: 'choice', q: '—Which do you like better, tea ___ coffee?<br>—Coffee, please.', options: ['and', 'or', 'but'], answer: 1, explain: '二选一，用 or。' },
    { type: 'choice', q: 'It was raining hard, ___ we had to stay at home.', options: ['so', 'or', 'but'], answer: 0, explain: '下大雨是原因，待在家是结果，用 so。' },
    { type: 'choice', q: '___ Tom ___ Jim are good at English. They often get high marks.', options: ['Both; and', 'Either; or', 'Neither; nor'], answer: 0, explain: '谓语是 are，且两人都得高分，用 both ... and ...；either/neither 遵循就近原则，离谓语最近的是 Jim，应用 is。' },
    { type: 'choice', q: '___ it rained heavily, the sports meeting was put off.', options: ['Because', 'So', 'But'], answer: 0, explain: '后半句没有连词，前面要用 Because 引出原因；because 和 so 不能同时用。' },
    { type: 'fill', q: 'Either you or he ___ going to clean the room.（be，一般现在时）', answer: ['is'], explain: 'either ... or ... 就近原则，离谓语最近的是 he，用 is。' },
    { type: 'fill', q: 'Not only the students but also their teacher ___ the film.（like，一般现在时）', answer: ['likes'], explain: 'not only ... but also ... 就近原则，离谓语最近的是 their teacher（单数），用 likes。' },
    { type: 'choice', q: 'Tom ___ Jim are good friends. They often play together.', options: ['and', 'or', 'but'], answer: 0, explain: '谓语是复数 are，且两人一起玩，表示并列用 and。' },
    { type: 'fill', q: 'My sister can sing ___ dance well. She is good at both.（填一个连词）', answer: ['and'], explain: '唱歌和跳舞两样都擅长，表示并列用 and。' },
    { type: 'fill', q: 'The question was very difficult, ___ he worked it out at last.（填一个连词）', answer: ['but'], explain: '“题很难”和“他最后做出来了”是转折关系，用 but。' },
    { type: 'choice', q: '—Is your new English teacher a man ___ a woman?<br>—A woman. She is from Canada.', options: ['or', 'and', 'so'], answer: 0, explain: '选择疑问句，二选一用 or。' },
    { type: 'choice', q: "There isn't any milk ___ bread in the fridge.", options: ['or', 'and', 'so'], answer: 0, explain: '否定句里的“和”用 or：冰箱里既没有牛奶也没有面包。' },
    { type: 'fill', q: "He is only two. He can't read ___ write.（填一个连词）", answer: ['or'], explain: '否定句中并列两个动作，用 or 表示“也不”。' },
    { type: 'fill', q: 'The bus was late, ___ I took a taxi to school.（填一个连词）', answer: ['so'], explain: '公交晚点是原因，打车是结果，用 so。' },
    { type: 'fill', q: 'He was tired, so he went to bed early.<br>= ___ he was tired, he went to bed early.（填一个词，注意首字母大写）', answer: ['Because', 'As', 'Since'], explain: '用 because 引出原因时，后半句就不能再用 so，二者只用一个。' },
    { type: 'choice', q: 'Because the film was boring, ___.', options: ['we left early', 'so we left early', 'but we left early'], answer: 0, explain: '前面已经用了 because，后面不能再用 so；用 but 意思也不通。' },
    { type: 'choice', q: '___ it was raining, they still played football outside.', options: ['Although', 'But', 'So'], answer: 0, explain: '下雨和还在踢球是转折关系，后半句没有连词，前面用 Although。' },
    { type: 'choice', q: 'Although the boy is young, ___.', options: ['he knows a lot', 'but he knows a lot', 'so he knows a lot'], answer: 0, explain: 'although 和 but 不能同时出现；so 表因果，意思不通。' },
    { type: 'fill', q: 'The bike is old, but it runs well.<br>= ___ the bike is old, it runs well.（填一个词，注意首字母大写）', answer: ['Although', 'Though'], explain: '把 but 去掉，前面改用 although / though 引出让步，二者不能同时用。' },
    { type: 'fill', q: '___ Lucy and Lily are from England. They are twins.（两者都，填一个词，注意首字母大写）', answer: ['Both'], explain: 'both ... and ... “两者都”，做主语时谓语用复数 are。' },
    { type: 'choice', q: "It's too late to walk there. You can ___ go by bus ___ take a taxi.", options: ['either; or', 'both; and', 'neither; nor'], answer: 0, explain: '两种方式选一种，用 either ... or ...“要么……要么……”；太晚不能走路，所以不能用 neither ... nor ...。' },
    { type: 'choice', q: 'Either my sister or I ___ going to the meeting.', options: ['am', 'is', 'are'], answer: 0, explain: 'either ... or ... 就近原则，离谓语最近的是 I，用 am。' },
    { type: 'choice', q: 'Neither he nor his parents ___ English.', options: ['speak', 'speaks', 'speaking'], answer: 0, explain: 'neither ... nor ... 就近原则，离谓语最近的是 his parents（复数），用 speak。' },
    { type: 'choice', q: '“Neither Lucy nor Lily likes math.” 的意思是：', options: ['露西和莉莉都不喜欢数学。', '露西和莉莉都喜欢数学。', '露西或莉莉喜欢数学。'], answer: 0, explain: 'neither ... nor ... 表示“既不……也不……”，两个人都不喜欢。' },
    { type: 'fill', q: 'Neither you nor she ___ wrong.（be，一般现在时）', answer: ['is'], explain: 'neither ... nor ... 就近原则，离谓语最近的是 she，用 is。' },
    { type: 'choice', q: 'Not only my parents but also my brother ___ tennis.', options: ['plays', 'play', 'playing'], answer: 0, explain: 'not only ... but also ... 就近原则，离谓语最近的是 my brother（单数），用 plays。' },
    { type: 'choice', q: 'Not only Tom but also his classmates ___ excited about the trip.', options: ['are', 'is', 'am'], answer: 0, explain: '就近原则，离谓语最近的是 his classmates（复数），用 are。' }
  ]
},

{
  id: 'g-phrasal', title: '常用动词短语', short: '动词短语', module: 'morph', grade: 7, freq: 3,
  prereqs: ['g-pronoun', 'g-prep-place'],
  tip: '完形填空高频：同一个动词搭配不同小词意思完全不同（look for / look after / look up）；代词做宾语时要放在 put on、take off 等短语的中间。',
  learn: [
    { h: '按动词分组记', html: `<table class="tbl"><tr><th>动词</th><th>短语</th></tr>
      <tr><td>look</td><td>look at 看, look for 寻找, look after 照顾, look up 查阅, look like 看起来像, look forward to 盼望</td></tr>
      <tr><td>put</td><td>put on 穿上, put away 收起来, put up 张贴 / 举起, put off 推迟</td></tr>
      <tr><td>take</td><td>take off 脱下 / 起飞, take care of 照顾, take part in 参加（活动）, take photos 拍照</td></tr>
      <tr><td>turn</td><td>turn on 打开, turn off 关掉, turn up 调大, turn down 调小</td></tr>
      <tr><td>give</td><td>give up 放弃, give out 分发</td></tr>
      <tr><td>get</td><td>get up 起床, get on 上车, get off 下车</td></tr>
      <tr><td>其他</td><td>pick up 捡起 / 接人, wake up 醒来 / 叫醒, hand in 上交, try on 试穿, find out 查明, come back 回来</td></tr></table>` },
    { h: '代词放中间（重点）', html: `<p>“动词 + 副词”的短语（put on, take off, turn on, give up, pick up, wake up, look up, hand in...），如果宾语是代词 it / them / him 等，<b>代词要放在中间</b>：</p>
      <div class="rhyme">动副短语夹代词，it 和 them 放中间。</div>
      <p class="ex">Put on your coat. Put it on.<span class="zh">穿上外套。把它穿上。</span></p>
      <p class="ex">Turn off the TV. Turn it off.<span class="zh">关掉电视。把它关掉。</span></p>
      <p>“动词 + 介词”的短语（look at, look for, look after, listen to, wait for）不能拆开：</p>
      <p class="ex">Look at it.<span class="zh">看着它。</span></p>` },
    { h: '易混辨析', html: `<ul>
      <li><b>look for</b> 是“找”的过程，<b>find</b> 是“找到”的结果：<span class="en">I looked for my key, but I couldn't find it.</span></li>
      <li><b>put on</b> 是“穿上”的动作，<b>wear</b> 是“穿着”的状态。</li>
      <li><b>look forward to</b> 中的 to 是介词，后接名词或动名词：<span class="en">I'm looking forward to seeing you.</span></li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'These shoes are dirty. Please take ___.', options: ['them off', 'off them', 'off it'], answer: 0, explain: 'take off 是动副短语，代词宾语要放中间；shoes 是复数，用 them。' },
    { type: 'choice', q: "I'm looking forward to ___ you again.", options: ['see', 'seeing', 'saw'], answer: 1, explain: 'look forward to 里的 to 是介词，后面接动名词 seeing。' },
    { type: 'choice', q: 'Your toys are everywhere. Please ___ them ___.', options: ['put; away', 'put; on', 'put; off'], answer: 0, explain: '玩具到处都是，要“收起来”，用 put away；代词 them 放中间。' },
    { type: 'fill', q: 'The teacher ___ ___ the test papers to the students just now.（分发，用过去式，填两个词）', answer: ['gave out', 'handed out'], explain: 'give out / hand out 分发；just now 用过去时，give 的过去式是 gave。' },
    { type: 'choice', q: 'The bus is coming. Let\'s ___.', options: ['get on', 'get off', 'get up'], answer: 0, explain: '车来了，要“上车”，用 get on；get off 是下车，get up 是起床。' },
    { type: 'choice', q: 'Please ___ your homework before eight tomorrow morning.', options: ['hand in', 'try on', 'find out'], answer: 0, explain: '作业要“上交”，用 hand in；try on 试穿，find out 查明。' },
    { type: 'choice', q: 'What a nice song! Let\'s listen ___.', options: ['to it', 'it to', 'it'], answer: 0, explain: 'listen to 是“动词 + 介词”，不能拆开，代词放在 to 后面：listen to it。' },
    { type: 'choice', q: 'I ___ my watch everywhere, but I couldn\'t ___ it.', options: ['looked for; find', 'found; look for', 'looked for; look for'], answer: 0, explain: 'look for 是“找”的过程，find 是“找到”的结果：找了到处，但没找到。' },
    { type: 'choice', q: 'Lily ___ glasses. She can\'t see clearly without them.', options: ['wears', 'puts on', 'takes off'], answer: 0, explain: '表示平时一直戴着眼镜的状态，用 wear；put on 是“戴上”这个动作。' },
    { type: 'choice', q: 'My grandma is ill. I have to stay at home and ___ her.', options: ['look after', 'look for', 'look up'], answer: 0, explain: '奶奶生病，要“照顾”她，用 look after；look for 寻找，look up 查阅。' },
    { type: 'choice', q: 'It\'s too dark in here. Please ___ the light.', options: ['turn on', 'turn off', 'turn down'], answer: 0, explain: '太暗了，要“打开”灯，用 turn on；turn off 关掉，turn down 调小。' },
    { type: 'fill', q: 'It\'s hot in here. Is that your coat? Take ___ ___.（把它脱下，填两个词）', answer: ['it off'], explain: 'take off 是“动词 + 副词”短语，宾语是代词 it 时要放在中间：take it off，不能说 take off it。' }
  ],
  tests: [
    { type: 'choice', q: "It's cold outside. ___ your coat.", options: ['Put on', 'Take off', 'Turn on'], answer: 0, explain: '外面冷，要“穿上”外套，用 Put on。' },
    { type: 'choice', q: 'Please ___ the lights when you leave the classroom.', options: ['turn on', 'turn off', 'turn up'], answer: 1, explain: '离开教室要“关掉”灯，用 turn off。' },
    { type: 'choice', q: "—What are you doing?<br>—I'm ___ my keys. Have you seen them?", options: ['looking for', 'finding', 'looking after'], answer: 0, explain: '还在找、没找到，是“寻找”的过程，用 looking for。' },
    { type: 'choice', q: 'My grandma ___ my little brother when my parents are at work.', options: ['looks after', 'looks at', 'looks like'], answer: 0, explain: '父母上班时奶奶“照顾”弟弟，用 looks after。' },
    { type: 'fill', q: "Don't ___ ___! Try again and you will make it.（放弃，填两个词）", answer: ['give up'], explain: 'give up 放弃。' },
    { type: 'fill', q: "If you don't know the word, you can look it ___ in a dictionary.（填一个副词）", answer: ['up'], explain: 'look up 查阅；代词 it 放在中间：look it up。' },
    { type: 'choice', q: 'The music is too loud. Could you turn ___, please?', options: ['it down', 'down it', 'it up'], answer: 0, explain: '音乐太吵要“调小”，用 turn down；代词 it 放中间。' },
    { type: 'choice', q: 'The sports meeting was ___ because of the heavy rain.', options: ['put off', 'put on', 'put away'], answer: 0, explain: '因为下大雨，运动会被“推迟”了，用 put off。' },
    { type: 'fill', q: 'Please ___ ___ your hand if you know the answer.（举起，填两个词）', answer: ['put up'], explain: 'put up 举起 / 张贴；put up your hand 举手。' },
    { type: 'choice', q: 'Fasten your seat belt. The plane will ___ in ten minutes.', options: ['take off', 'take care', 'take part'], answer: 0, explain: 'take off 除了“脱下”，还可以表示飞机“起飞”。' },
    { type: 'fill', q: 'Will you take ___ ___ the school talent show?（参加，填两个词）', answer: ['part in'], explain: 'take part in 参加（活动）。' },
    { type: 'fill', q: 'Please look after my cat when I\'m away.<br>= Please take ___ ___ my cat when I\'m away.（填两个词）', answer: ['care of'], explain: 'look after = take care of 照顾。' },
    { type: 'choice', q: 'Smoking is bad for health. My dad has decided to ___.', options: ['give it up', 'give up it', 'give out it'], answer: 0, explain: 'give up 放弃（戒掉）；代词 it 指 smoking，要放在中间：give it up。' },
    { type: 'choice', q: 'I usually ___ at 6:30 and have breakfast at 7:00.', options: ['get up', 'get on', 'get off'], answer: 0, explain: '早上 6:30 “起床”，用 get up。' },
    { type: 'fill', q: 'Excuse me, where should I ___ ___ the bus for the museum?（下车，填两个词）', answer: ['get off'], explain: 'get off 下车；get on 上车。' },
    { type: 'choice', q: 'Mom will ___ me ___ at the school gate at five.', options: ['pick; up', 'try; on', 'hand; in'], answer: 0, explain: 'pick sb up 接某人；代词 me 放中间。' },
    { type: 'choice', q: 'These shoes look nice. Can I ___?', options: ['try them on', 'try on them', 'try it on'], answer: 0, explain: 'try on 试穿，是动副短语；shoes 是复数，用 them，代词放中间。' },
    { type: 'fill', q: 'Let\'s ___ ___ who broke the window.（查明，填两个词）', answer: ['find out'], explain: 'find out 查明、弄清楚。' },
    { type: 'fill', q: 'Please wake ___ ___ at six tomorrow morning.（叫醒我，填两个词）', answer: ['me up'], explain: 'wake sb up 叫醒某人；代词 me 放在中间。' },
    { type: 'choice', q: 'There is some paper on the floor. Please pick ___.', options: ['it up', 'up it', 'them up'], answer: 0, explain: 'pick up 是动副短语，代词放中间；paper 表示“纸”是不可数名词，用 it。' },
    { type: 'fill', q: 'Have you finished the report? Please hand ___ ___ before Friday.（填两个词：代词 + 副词）', answer: ['it in'], explain: 'hand in 上交；宾语是代词 it 时要放中间：hand it in。' },
    { type: 'choice', q: 'Where is my cat? Can you help me look ___?', options: ['for it', 'it for', 'it after'], answer: 0, explain: 'look for 是“动词 + 介词”，不能拆开，代词放在介词后面：look for it。' },
    { type: 'fill', q: 'This story is very interesting. Please listen ___ ___ carefully.（填两个词）', answer: ['to it'], explain: 'listen to 不能拆开，代词放在 to 的后面：listen to it。' },
    { type: 'fill', q: '—Have you ___ your pen?<br>—Yes. It was under my desk.（find，用适当形式）', answer: ['found'], explain: '已经“找到”了，是结果，用 find 的过去分词 found，不用 look for。' },
    { type: 'choice', q: 'She is ___ her glasses. She can\'t read without them.', options: ['looking for', 'finding', 'looking at'], answer: 0, explain: '正在找、还没找到，是过程，用 look for；find 表示结果，一般不用进行时。' },
    { type: 'choice', q: 'He got up late and quickly ___ his clothes.', options: ['put on', 'wore', 'took off'], answer: 0, explain: '起床后“穿上”衣服，是一个动作，用 put on；wear 表示“穿着”的状态。' },
    { type: 'fill', q: 'The boy who ___ a white shirt every day is my cousin.（wear，一般现在时）', answer: ['wears'], explain: '每天都穿着白衬衫，表示状态，用 wear；主语是单数，用 wears。' },
    { type: 'choice', q: 'We are looking forward to ___ from you.', options: ['hearing', 'hear', 'heard'], answer: 0, explain: 'look forward to 里的 to 是介词，后接动名词 hearing。' },
    { type: 'fill', q: 'The children are looking forward ___ the summer holiday.（填一个词）', answer: ['to'], explain: 'look forward to + 名词 / 动名词，盼望……。' },
    { type: 'fill', q: 'I look forward to ___ the Great Wall one day.（visit）', answer: ['visiting'], explain: 'to 是介词，后面用动名词 visiting。' }
  ]
},

{
  id: 'g-infinitive', title: '动词不定式 to do', short: '动词不定式', module: 'morph', grade: 7, freq: 3,
  prereqs: ['g-present-simple'],
  tip: '中考高频：want / decide / hope 等后接 to do；tell / ask sb (not) to do 的否定把 not 放在 to 前面；“疑问词 + to do”。',
  learn: [
    { h: '后面接 to do 的动词', html: `<p class="small">want 想要, would like 想要, hope 希望, decide 决定, plan 计划, agree 同意, learn 学会, try 努力, need 需要, forget 忘记（去做）, remember 记得（去做）, begin / start 开始, choose 选择, fail 未能</p>
      <div class="rhyme">想要希望和决定，计划同意学努力；<br>这些动词往后看，后面要跟 to do。</div>
      <p class="ex">I want to be a doctor.<span class="zh">我想当医生。</span></p>
      <p class="ex">We decided to go camping.<span class="zh">我们决定去露营。</span></p>` },
    { h: '让某人做某事：sb to do', html: `<p>ask / tell / want / would like / invite / teach / help + sb + <b>to do</b></p>
      <p class="ex">Mom asked me to clean my room.<span class="zh">妈妈让我打扫房间。</span></p>
      <p>否定：<b>not</b> 放在 to 前面</p>
      <p class="ex">The teacher told us not to be late.<span class="zh">老师告诉我们不要迟到。</span></p>
      <p class="warn">hope 不能接 sb to do：不能说 I hope you to come，要说 I hope (that) you can come。</p>` },
    { h: '疑问词 + to do', html: `<p>what / how / where / when / which + to do</p>
      <p class="ex">I don't know what to do.<span class="zh">我不知道该做什么。</span></p>
      <p class="ex">Can you tell me how to get to the station?<span class="zh">你能告诉我怎么去车站吗？</span></p>
      <p class="warn">what to do 后面不能再加 it，因为 what 就是 do 的宾语。</p>` },
    { h: '其他常见用法', html: `<ul>
      <li><b>表目的</b>（为了）：<span class="en">She went to the shop to buy some milk.</span></li>
      <li><b>放名词后</b>（要做的）：<span class="en">I have a lot of homework to do.</span> <span class="en">Would you like something to drink?</span></li>
      <li><b>It's + 形容词 + for sb + to do</b>：<span class="en">It's important for us to learn English well.</span></li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'The teacher told us ___ late for class.', options: ['not to be', 'to not be', "don't be"], answer: 0, explain: 'tell sb not to do，not 放在 to 前面。' },
    { type: 'fill', q: 'She went to the supermarket ___ some fruit.（buy，填两个词）', answer: ['to buy'], explain: '去超市的目的是买水果，用不定式表目的。' },
    { type: 'choice', q: 'We plan ___ the Great Wall this summer.', options: ['to visit', 'visit', 'visiting'], answer: 0, explain: 'plan 计划，后面接 to do：plan to do sth。' },
    { type: 'fill', q: 'Lucy invited me ___ to her birthday party.（go，填两个词）', answer: ['to go'], explain: 'invite sb to do sth 邀请某人做某事。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['I hope you to come.', 'I hope you can come.', 'I hope you coming.'], answer: 1, explain: 'hope 不能接 sb to do，要说 hope (that) + 句子：I hope you can come.' },
    { type: 'choice', q: 'Could you tell me ___ get to the library?', options: ['how to', 'what to', 'how do'], answer: 0, explain: '“怎样去”用“疑问词 + to do”：how to get to...；what to 后面缺宾语，意思不通。' },
    { type: 'fill', q: 'It\'s hot. Would you like something ___?（drink，填两个词）', answer: ['to drink'], explain: '不定式放在名词 / 代词后面，表示“要喝的东西”：something to drink。' },
    { type: 'choice', q: 'It\'s not easy ___ a child to carry such a heavy box.', options: ['for', 'of', 'to'], answer: 0, explain: "It's + 形容词 + for sb + to do sth，对某人来说做某事……。" },
    { type: 'fill', q: '改错：I don\'t know what to do it. 句中多了一个词，写出这个多余的词。', answer: ['it'], explain: 'what 本身就是 do 的宾语，what to do 后面不能再加 it。' }
  ],
  tests: [
    { type: 'choice', q: 'I want ___ a doctor when I grow up.', options: ['to be', 'be', 'being'], answer: 0, explain: 'want to do 想要做某事。' },
    { type: 'fill', q: 'He decided ___ hard for the exam.（study，填两个词）', answer: ['to study'], explain: 'decide to do 决定做某事。' },
    { type: 'choice', q: 'Mom asked me ___ my room.', options: ['clean', 'to clean', 'cleaning'], answer: 1, explain: 'ask sb to do 让某人做某事。' },
    { type: 'choice', q: "I'm not sure ___. Can you give me some advice?", options: ['what to do', 'what do', 'what to do it'], answer: 0, explain: '“疑问词 + to do”：what to do；what 已经是宾语，后面不能再加 it。' },
    { type: 'choice', q: "It's important ___ us ___ English well.", options: ['for; to learn', 'of; to learn', 'for; learning'], answer: 0, explain: "It's + 形容词 + for sb + to do。" },
    { type: 'fill', q: 'My parents told me ___ ___ play computer games too much.（不要，填两个词）', answer: ['not to'], explain: 'tell sb not to do，否定词 not 放在 to 前面。' },
    { type: 'choice', q: 'I have a lot of homework ___ tonight.', options: ['do', 'to do', 'doing'], answer: 1, explain: '“要做的作业”，不定式放在名词后面：homework to do。' },
    { type: 'choice', q: 'My sister hopes ___ a teacher in the future.', options: ['to become', 'become', 'becoming'], answer: 0, explain: 'hope to do sth 希望做某事。' },
    { type: 'fill', q: 'Remember ___ the windows before you leave.（close，填两个词）', answer: ['to close'], explain: 'remember to do 记得去做（还没做的事）。' },
    { type: 'choice', q: 'Mr. Wang teaches us ___ English songs every Friday.', options: ['to sing', 'sing', 'singing'], answer: 0, explain: 'teach sb to do sth 教某人做某事。' },
    { type: 'fill', q: 'The teacher wants us ___ more books in the holiday.（read，填两个词）', answer: ['to read'], explain: 'want sb to do sth 想让某人做某事。' },
    { type: 'choice', q: 'The doctor told him ___ too much meat.', options: ['not to eat', 'to not eat', 'not eat'], answer: 0, explain: 'tell sb not to do，not 放在 to 的前面。' },
    { type: 'fill', q: '"Don\'t play in the street," Mom said to me.<br>= Mom told me ___ ___ ___ in the street.（填三个词）', answer: ['not to play'], explain: '祈使句的否定 Don\'t do 转成 tell sb not to do，not 放在 to 前面。' },
    { type: 'choice', q: '—I hope ___ to my party this Saturday.<br>—Sure. I\'d love to.', options: ['you can come', 'you to come', 'you coming'], answer: 0, explain: 'hope 不能接 sb to do，要接句子：I hope you can come.' },
    { type: 'choice', q: '下面哪个动词不能用于“动词 + sb + to do”结构？', options: ['hope', 'ask', 'tell'], answer: 0, explain: 'ask / tell sb to do 都可以；hope 只能 hope to do 或 hope + 句子，不能 hope sb to do。' },
    { type: 'choice', q: '—I don\'t know ___ to buy for Mom\'s birthday.<br>—How about some flowers?', options: ['what', 'how', 'where'], answer: 0, explain: '回答说买花，问的是“买什么”，用 what to buy。' },
    { type: 'fill', q: 'Let me show you how ___ the new computer.（use，填两个词）', answer: ['to use'], explain: '“疑问词 + to do”：how to use 怎样使用。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ["I don't know what to do.", "I don't know what to do it.", "I don't know what do."], answer: 0, explain: 'what 已经是 do 的宾语，后面不能再加 it；疑问词后要用 to do。' },
    { type: 'choice', q: 'He got up very early ___ the first bus.', options: ['to catch', 'catching', 'catch'], answer: 0, explain: '早起的目的是赶头班车，用不定式表目的。' },
    { type: 'fill', q: 'We study hard ___ our dreams come true.（make，填两个词）', answer: ['to make'], explain: '努力学习是为了让梦想成真，用不定式 to make 表目的。' },
    { type: 'choice', q: 'There is nothing ___ in the fridge. Let\'s go shopping.', options: ['to eat', 'eat', 'eats'], answer: 0, explain: '不定式放在 nothing 后面，表示“可吃的东西”。' },
    { type: 'fill', q: 'It\'s important for us ___ the environment.（protect，填两个词）', answer: ['to protect'], explain: "It's + 形容词 + for sb + to do sth。" }
  ]
},

{
  id: 'g-gerund', title: '动名词 doing', short: '动名词', module: 'morph', grade: 7, freq: 3,
  prereqs: ['g-present-cont'],
  tip: '中考高频：enjoy / finish / mind / practice / keep 后接 doing；介词后面的动词一律用 doing。',
  learn: [
    { h: '什么是动名词', html: `<p>动词加 -ing，当<b>名词</b>用，就是动名词（加 -ing 的规则和现在进行时一样）。</p>
      <p>可以做<b>主语</b>：</p>
      <p class="ex">Swimming is good exercise.<span class="zh">游泳是很好的运动。</span></p>
      <p class="warn">动名词做主语，谓语用单数：Reading books is fun.</p>` },
    { h: '后面接 doing 的动词', html: `<p class="small">enjoy 喜欢, finish 完成, mind 介意, practice 练习, keep 一直, miss 错过, suggest 建议, consider 考虑, give up 放弃, can't help 忍不住, feel like 想要</p>
      <div class="rhyme">喜欢完成别介意，练习坚持别错过；<br>建议考虑别放弃，后面都用 doing。</div>
      <p class="ex">I enjoy listening to music.<span class="zh">我喜欢听音乐。</span></p>
      <p class="ex">Have you finished reading the book?<span class="zh">你读完这本书了吗？</span></p>
      <p class="ex">Would you mind opening the window?<span class="zh">你介意打开窗户吗？</span></p>` },
    { h: '介词后面用 doing', html: `<p>介词（at, in, of, for, about, without...）后面如果是动词，要用 <b>doing</b>：</p>
      <ul><li>be good at drawing 擅长画画</li>
      <li>be interested in reading 对读书感兴趣</li>
      <li>Thanks for helping me. 谢谢你帮我。</li>
      <li>How about / What about going to the zoo? 去动物园怎么样？</li>
      <li>He left without saying goodbye. 他没说再见就走了。</li></ul>` },
    { h: '常用句型', html: `<ul>
      <li>be busy doing sth 忙于做某事：<span class="en">She is busy cleaning the house.</span></li>
      <li>have fun doing sth 做某事很开心</li>
      <li>look forward to doing sth 盼望做某事（to 是介词）</li></ul>
      <p class="ex">We had fun playing in the snow.<span class="zh">我们在雪地里玩得很开心。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: 'Have you finished ___ your homework?', options: ['do', 'to do', 'doing'], answer: 2, explain: 'finish doing 完成做某事。' },
    { type: 'fill', q: 'My mother is busy ___ dinner in the kitchen.（cook）', answer: ['cooking'], explain: 'be busy doing sth 忙于做某事。' },
    { type: 'fill', q: '___ in the morning is good for your health.（run，注意首字母大写）', answer: ['Running'], explain: '动名词做主语；run 是重读闭音节、末尾一个辅音字母，双写 n 再加 ing。' },
    { type: 'choice', q: 'Reading books ___ a lot of fun.', options: ['is', 'are', 'be'], answer: 0, explain: '动名词短语做主语，谓语用单数 is，不要被 books 干扰。' },
    { type: 'fill', q: 'He left without ___ goodbye.（say）', answer: ['saying'], explain: 'without 是介词，后面的动词用 doing。' },
    { type: 'choice', q: 'We had fun ___ games at the party.', options: ['playing', 'to play', 'play'], answer: 0, explain: 'have fun doing sth 做某事很开心。' },
    { type: 'fill', q: 'I\'m looking forward to ___ my pen friend this summer.（meet）', answer: ['meeting'], explain: 'look forward to doing，to 是介词，后接动名词 meeting。' },
    { type: 'choice', q: '下面动名词拼写全部正确的一组是：', options: ['swimming, making, playing', 'swiming, makeing, playing', 'swimming, makeing, plaing'], answer: 0, explain: '加 -ing 的规则和现在进行时一样：swim 双写 m；make 去不发音的 e；play 直接加 ing。' }
  ],
  tests: [
    { type: 'choice', q: 'I enjoy ___ to music in my free time.', options: ['listening', 'to listen', 'listen'], answer: 0, explain: 'enjoy doing 喜欢做某事。' },
    { type: 'choice', q: "—Would you mind ___ the window? It's hot.<br>—Of course not.", options: ['opening', 'to open', 'open'], answer: 0, explain: 'mind doing 介意做某事。' },
    { type: 'fill', q: '___ is good exercise for us.（swim，注意首字母大写）', answer: ['Swimming'], explain: '动名词做主语；swim 双写 m 再加 ing。' },
    { type: 'choice', q: '—How about ___ to the zoo this Sunday?<br>—Good idea!', options: ['going', 'to go', 'go'], answer: 0, explain: 'about 是介词，后面用 going。' },
    { type: 'fill', q: 'Thanks for ___ me with my English.（help）', answer: ['helping'], explain: 'for 是介词，后面接动名词 helping。' },
    { type: 'choice', q: 'My sister is good at ___. She wants to be an artist.', options: ['draw', 'drawing', 'to draw'], answer: 1, explain: 'be good at doing，at 是介词，后面用动名词。' },
    { type: 'choice', q: "Keep ___ English every day, and you'll make progress.", options: ['practice', 'practicing', 'to practice'], answer: 1, explain: 'keep doing 一直做某事。' },
    { type: 'choice', q: '___ too much candy is bad for your teeth.', options: ['Eating', 'Eat', 'Eats'], answer: 0, explain: '动词做主语要变成动名词 Eating。' },
    { type: 'fill', q: 'Playing computer games too much ___ bad for your eyes.（be，一般现在时）', answer: ['is'], explain: '动名词短语做主语，谓语用单数 is。' },
    { type: 'choice', q: 'Collecting stamps ___ my favourite hobby.', options: ['is', 'are', 'am'], answer: 0, explain: '动名词短语 collecting stamps 做主语，谓语用单数 is。' },
    { type: 'fill', q: 'She practices ___ for two hours every day.（dance）', answer: ['dancing'], explain: 'practice doing；dance 以不发音的 e 结尾，去 e 加 ing。' },
    { type: 'fill', q: 'I feel like ___ some noodles for lunch.（have）', answer: ['having'], explain: 'feel like doing 想要做某事；have 去 e 加 ing。' },
    { type: 'fill', q: 'Do you mind ___ next to the window?（sit）', answer: ['sitting'], explain: 'mind doing；sit 双写 t 再加 ing。' },
    { type: 'choice', q: '听对话，回答问题：What does Tom enjoy doing on weekends?', say: [{ who: 'W', text: 'What do you enjoy doing on weekends, Tom?' }, { who: 'M', text: 'I enjoy playing basketball with my friends.' }], options: ['打篮球', '踢足球', '看电影'], answer: 0, explain: '汤姆说 I enjoy playing basketball，enjoy 后接动名词 playing。' },
    { type: 'choice', q: "Don't miss ___ the football match on TV tonight.", options: ['watching', 'to watch', 'watch'], answer: 0, explain: 'miss doing 错过做某事。' },
    { type: 'fill', q: 'My friend suggested ___ a picnic this Sunday.（have）', answer: ['having'], explain: 'suggest doing 建议做某事。' },
    { type: 'choice', q: 'When I heard the joke, I couldn\'t help ___.', options: ['laughing', 'to laugh', 'laugh'], answer: 0, explain: "can't help doing 忍不住做某事。" },
    { type: 'fill', q: 'Smoking is bad for health, so Grandpa gave up ___ last year.（smoke）', answer: ['smoking'], explain: 'give up doing 放弃做某事；smoke 去 e 加 ing。' },
    { type: 'fill', q: 'Have you finished ___ the letter?（write）', answer: ['writing'], explain: 'finish doing 完成做某事；write 去 e 加 ing。' },
    { type: 'choice', q: 'I\'m interested in ___ stories. I want to be a writer.', options: ['writing', 'write', 'to write'], answer: 0, explain: 'in 是介词，后面接动名词 writing。' },
    { type: 'choice', q: '—What about ___ a walk after dinner?<br>—Good idea.', options: ['taking', 'take', 'to take'], answer: 0, explain: 'What about 中的 about 是介词，后面用 doing。' },
    { type: 'choice', q: 'The little girl is afraid of ___ out alone at night.', options: ['going', 'go', 'goes'], answer: 0, explain: 'of 是介词，后面接动名词 going。' },
    { type: 'choice', q: 'The students are busy ___ for the final exam.', options: ['preparing', 'to prepare', 'prepare'], answer: 0, explain: 'be busy doing sth 忙于做某事。' },
    { type: 'fill', q: 'Dad was busy ___ the car when I got home.（wash）', answer: ['washing'], explain: 'be busy doing sth 忙于做某事。' },
    { type: 'fill', q: 'The kids had fun ___ kites in the park.（fly）', answer: ['flying'], explain: 'have fun doing sth 做某事很开心。' },
    { type: 'choice', q: 'We had a great time ___ in the snow yesterday.', options: ['playing', 'to play', 'played'], answer: 0, explain: 'have a great time doing 和 have fun doing 一样，后面接动名词。' },
    { type: 'choice', q: 'We look forward to ___ you again soon.', options: ['seeing', 'see', 'saw'], answer: 0, explain: 'look forward to doing，to 是介词。' },
    { type: 'fill', q: 'The students are looking forward to ___ to the farm next week.（go）', answer: ['going'], explain: 'look forward to 中的 to 是介词，后面用动名词 going。' }
  ]
},

{
  id: 'g-too-enough', title: 'too / enough / so / such', short: 'too/enough/so/such', module: 'morph', grade: 7, freq: 2,
  prereqs: ['g-adj-adv', 'g-infinitive'],
  tip: '常考 enough 的位置（形容词后、名词前）、so 和 such 的选择，以及 too...to / so...that / not...enough to 的同义句转换。',
  learn: [
    { h: 'too ... to ...', html: `<p><b>too + 形容词/副词 + to do</b>：太……而不能……（本身带<b>否定</b>意思）</p>
      <p class="ex">He is too young to go to school.<span class="zh">他太小了，还不能上学。</span></p>` },
    { h: 'enough 的位置', html: `<div class="rhyme">形容副词 enough 后，名词 enough 站前头。</div>
      <ul><li>形容词 / 副词 + enough：<span class="en">old enough, fast enough</span></li>
      <li>enough + 名词：<span class="en">enough money, enough time</span></li></ul>
      <p class="ex">She is old enough to look after herself.<span class="zh">她够大了，能照顾自己了。</span></p>
      <p class="ex">I don't have enough money to buy the bike.<span class="zh">我没有足够的钱买这辆自行车。</span></p>` },
    { h: 'so ... that / such ... that', html: `<p>都表示“如此……以至于……”，区别看后面跟什么：</p>
      <table class="tbl"><tr><th>结构</th><th>例子</th></tr>
      <tr><td>so + 形容词 / 副词</td><td>so heavy, so fast</td></tr>
      <tr><td>so + many / much / few / little + 名词</td><td>so many people, so much water</td></tr>
      <tr><td>such + a / an + 形容词 + 单数名词</td><td>such a fine day</td></tr>
      <tr><td>such + 形容词 + 复数名词 / 不可数名词</td><td>such nice people, such bad weather</td></tr></table>
      <p class="ex">The box is so heavy that I can't carry it.<span class="zh">箱子太重了，我搬不动。</span></p>
      <p class="ex">It was such a fine day that we went for a picnic.<span class="zh">天气这么好，我们就去野餐了。</span></p>` },
    { h: '同义句转换', html: `<p class="ex">He is too young to dress himself.<span class="zh">他太小了，不会自己穿衣服。</span></p>
      <p class="ex">He is not old enough to dress himself.<span class="zh">他还不够大，不会自己穿衣服。</span></p>
      <p class="ex">He is so young that he can't dress himself.<span class="zh">他那么小，不会自己穿衣服。</span></p>
      <p class="warn">too 换成 not ... enough 时，形容词要换成反义词（young → old）。</p>` }
  ],
  examples: [
    { type: 'choice', q: 'The room is ___ for ten people.', options: ['enough big', 'big enough', 'enough bigger'], answer: 1, explain: 'enough 修饰形容词要放在后面：big enough。' },
    { type: 'choice', q: 'It was ___ bad weather that we had to stay at home.', options: ['so', 'such', 'such a'], answer: 1, explain: 'weather 是不可数名词，用 such + 形容词 + 不可数名词，不能加 a。' },
    { type: 'choice', q: 'The box is ___ heavy for me ___ carry.', options: ['too; to', 'so; that', 'enough; to'], answer: 0, explain: 'too + 形容词 + (for sb) + to do，太……而不能……；so ... that 后面要接完整的句子，enough 要放在形容词后面。' },
    { type: 'choice', q: 'Hurry up! We don\'t have ___ to finish the work.', options: ['enough time', 'enough of time', 'time enoughly'], answer: 0, explain: 'enough 修饰名词，放在名词前面：enough time。' },
    { type: 'choice', q: 'He ran ___ fast that nobody could catch him.', options: ['so', 'such', 'too'], answer: 0, explain: 'fast 是副词，后面有 that 从句，用 so + 副词 + that。' },
    { type: 'fill', q: 'There is so ___ time left that we must hurry.（表示“很少”，填一个词）', answer: ['little'], explain: 'time 是不可数名词，“很少”用 little；so + little + 不可数名词 + that。' },
    { type: 'choice', q: 'He is ___ clever boy that everyone likes him.', options: ['such a', 'so a', 'such'], answer: 0, explain: 'boy 是单数可数名词，用 such a + 形容词 + 单数名词。' },
    { type: 'fill', q: 'The boy is too short to reach the shelf.<br>= The boy is not ___ enough to reach the shelf.（填一个形容词）', answer: ['tall'], explain: 'too ... to 换成 not ... enough to 时，形容词要换成反义词：short → tall。' },
    { type: 'fill', q: 'The water is too cold to swim in.<br>= The water is so cold that we ___ swim in it.（填一个词）', answer: ["can't", 'cannot'], explain: 'too ... to 本身带否定意思，改成 so ... that 时从句要用否定 can\'t。' }
  ],
  tests: [
    { type: 'choice', q: 'The boy is ___ young to go to school.', options: ['too', 'enough', 'so'], answer: 0, explain: 'too ... to ... 太……而不能……。' },
    { type: 'choice', q: 'My sister is old ___ to look after herself now.', options: ['enough', 'too', 'so'], answer: 0, explain: '形容词 + enough to do：足够……能做某事。' },
    { type: 'choice', q: 'It was ___ fine day that we went for a picnic.', options: ['such a', 'so a', 'such'], answer: 0, explain: 'day 是单数可数名词，用 such a + 形容词 + 单数名词。' },
    { type: 'choice', q: "The box is ___ heavy that I can't carry it.", options: ['so', 'such', 'too'], answer: 0, explain: '后面只有形容词 heavy，又有 that，用 so ... that ...。' },
    { type: 'fill', q: "There are ___ many people in the park that we can't find a seat.（填一个词）", answer: ['so'], explain: 'many 前面用 so：so many + 名词。' },
    { type: 'fill', q: "He didn't have ___ money to buy the new bike.（足够的，填一个词）", answer: ['enough'], explain: 'enough 修饰名词放在名词前面：enough money。' },
    { type: 'choice', q: 'The boy is too young to dress himself.<br>= The boy is ___ young that he ___ dress himself.', options: ['so; can', 'so; can\'t', 'such; can\'t'], answer: 1, explain: 'too ... to 本身有否定意思，换成 so ... that 时从句要用否定 can\'t；young 是形容词，用 so。' },
    { type: 'choice', q: 'He was ___ tired to walk any farther.', options: ['too', 'enough', 'such'], answer: 0, explain: 'too + 形容词 + to do，太累而走不动了。' },
    { type: 'fill', q: 'The question is ___ hard for me to answer.（太，填一个词）', answer: ['too'], explain: 'too ... for sb to do，题太难，我答不出来。' },
    { type: 'choice', q: 'He didn\'t run ___ to catch the bus.', options: ['fast enough', 'enough fast', 'too fast'], answer: 0, explain: 'enough 修饰副词要放在后面：fast enough。' },
    { type: 'fill', q: 'Is the water warm ___ for swimming?（足够，填一个词）', answer: ['enough'], explain: '形容词 + enough：warm enough。' },
    { type: 'choice', q: 'We don\'t have ___ chairs for all the guests.', options: ['enough', 'too', 'so'], answer: 0, explain: 'enough + 名词：enough chairs 足够的椅子。' },
    { type: 'fill', q: 'She sang ___ well that everyone cheered.（填一个词）', answer: ['so'], explain: 'well 是副词，so + 副词 + that。' },
    { type: 'choice', q: 'There was ___ little food that they all felt hungry.', options: ['so', 'such', 'too'], answer: 0, explain: 'little 前面用 so：so little + 不可数名词 + that。' },
    { type: 'choice', q: 'There were ___ few people in the street that it was very quiet.', options: ['so', 'such', 'very'], answer: 0, explain: 'few 前面用 so：so few + 可数名词复数 + that。' },
    { type: 'fill', q: 'It was ___ ___ interesting film that I watched it twice.（填两个词）', answer: ['such an'], explain: 'film 是单数可数名词，interesting 以元音音素开头，用 such an。' },
    { type: 'choice', q: 'They are ___ nice people that we all like them.', options: ['such', 'so', 'such a'], answer: 0, explain: 'people 是复数名词，用 such + 形容词 + 复数名词，不加 a。' },
    { type: 'fill', q: 'It was ___ useful advice that I thanked him again and again.（填一个词）', answer: ['such'], explain: 'advice 是不可数名词，用 such + 形容词 + 不可数名词，不加 a。' },
    { type: 'choice', q: 'The bag is too heavy for me to carry.<br>= The bag is not ___ enough for me to carry.', options: ['light', 'heavy', 'big'], answer: 0, explain: 'too 换成 not ... enough 时要用反义词：heavy → light。' },
    { type: 'fill', q: 'Tom is too young to join the club.<br>= Tom is not ___ ___ to join the club.（填两个词）', answer: ['old enough'], explain: 'young 的反义词是 old，enough 放在形容词后面：not old enough。' },
    { type: 'choice', q: 'He is not tall enough to touch the ceiling.<br>= He is ___ short ___ touch the ceiling.', options: ['too; to', 'so; to', 'enough; to'], answer: 0, explain: 'not tall enough to = too short to。' },
    { type: 'choice', q: 'The question is so difficult that nobody can answer it.<br>= The question is ___ difficult for anybody to answer.', options: ['too', 'so', 'enough'], answer: 0, explain: 'so ... that ... can\'t / nobody can 可以改成 too ... for sb to do。' },
    { type: 'fill', q: 'It was too dark for us to see anything.<br>= It was so dark that we ___ see anything.（填一个词）', answer: ["couldn't", 'could not'], explain: 'too ... to 有否定意思，改成 so ... that 时从句要用否定；时态是过去时，用 couldn\'t。' }
  ]
},

{
  id: 'g-spend-cost', title: '花费：spend / cost / take / pay', short: '花费的表达', module: 'morph', grade: 7, freq: 3,
  prereqs: ['g-infinitive', 'g-gerund'],
  tip: '中考高频：看主语选词——人做主语用 spend / pay，物做主语用 cost，It 做形式主语用 take；还要搭配对 on / for / doing / to do。',
  learn: [
    { h: '四个词的句型', html: `<table class="tbl"><tr><th>词</th><th>主语</th><th>句型</th></tr>
      <tr><td>spend</td><td>人</td><td>sb spend 时间/钱 <b>on</b> sth<br>sb spend 时间/钱 (in) <b>doing</b> sth</td></tr>
      <tr><td>cost</td><td>物</td><td>sth cost sb 钱</td></tr>
      <tr><td>take</td><td>It</td><td>It takes sb 时间 <b>to do</b> sth</td></tr>
      <tr><td>pay</td><td>人</td><td>sb pay 钱 <b>for</b> sth</td></tr></table>
      <div class="rhyme">人花 spend 和 pay，物花用 cost；<br>it 开头花时间，take 后面 to do。</div>` },
    { h: '例句', html: `<p class="ex">I spent two hours on my homework.<span class="zh">我花了两个小时做作业。</span></p>
      <p class="ex">She spends an hour reading every day.<span class="zh">她每天花一小时读书。</span></p>
      <p class="ex">The dictionary cost me fifty yuan.<span class="zh">这本词典花了我五十元。</span></p>
      <p class="ex">It takes me twenty minutes to walk to school.<span class="zh">我走路上学要花二十分钟。</span></p>
      <p class="ex">He paid one hundred yuan for the shoes.<span class="zh">他花一百元买了这双鞋。</span></p>` },
    { h: '一句话四种说法', html: `<p class="ex">I spent 30 yuan on the book.<span class="zh">我花 30 元买了这本书。</span></p>
      <p class="ex">I spent 30 yuan buying the book.<span class="zh">同上（spend + doing）</span></p>
      <p class="ex">The book cost me 30 yuan.<span class="zh">同上（物做主语）</span></p>
      <p class="ex">I paid 30 yuan for the book.<span class="zh">同上（pay ... for）</span></p>` },
    { h: '易错点', html: `<ul>
      <li>过去式：spend → <b>spent</b>，cost → <b>cost</b>（三种形式一样），take → <b>took</b>，pay → <b>paid</b>。</li>
      <li>spend 后接 <b>doing</b>，不能接 to do；take 句型里接 <b>to do</b>。</li>
      <li>问价钱：<span class="en">How much does it cost?</span> = <span class="en">How much is it?</span></li></ul>` }
  ],
  examples: [
    { type: 'choice', q: 'It ___ me two hours to finish the work yesterday.', options: ['spent', 'took', 'cost'], answer: 1, explain: 'It 做主语、后面有 to do，用 take，yesterday 用过去式 took。' },
    { type: 'fill', q: 'She spends an hour ___ English every day.（practice）', answer: ['practicing', 'practising'], explain: 'spend 时间 (in) doing sth，用动名词。' },
    { type: 'choice', q: 'Lily spends a lot of time ___ her homework every evening.', options: ['on', 'for', 'to'], answer: 0, explain: '人做主语，sb spend 时间 / 钱 on sth；pay 才搭配 for。' },
    { type: 'fill', q: 'The coat ___ me 200 yuan last week.（cost，用适当形式）', answer: ['cost'], explain: '物做主语用 cost；cost 的过去式还是 cost，三种形式一样。' },
    { type: 'choice', q: 'How much did you ___ for the concert ticket?', options: ['pay', 'spend', 'cost'], answer: 0, explain: '人做主语（you），后面有 for，用 pay ... for；did 后用原形。' },
    { type: 'fill', q: 'I paid 30 yuan for the book.<br>= The book ___ me 30 yuan.（填一个词）', answer: ['cost'], explain: '把物 the book 放到主语位置，要用 cost；过去时仍是 cost。' },
    { type: 'choice', q: 'How much does the T-shirt cost?<br>= How much ___ the T-shirt?', options: ['is', 'does', 'costs'], answer: 0, explain: '问价钱：How much does it cost? = How much is it?' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['It takes me ten minutes to walk to school.', 'It takes me ten minutes walking to school.', 'I spend ten minutes to walk to school.'], answer: 0, explain: 'take 句型后面用 to do：It takes sb 时间 to do sth；spend 后面用 doing，不能接 to do。' },
    { type: 'fill', q: 'Last Sunday I ___ three hours reading in the library.（spend，用适当形式）', answer: ['spent'], explain: 'last Sunday 用过去时，spend 的过去式是 spent。' }
  ],
  tests: [
    { type: 'choice', q: 'I ___ two hours on my homework yesterday.', options: ['spent', 'took', 'cost'], answer: 0, explain: '人做主语，后面有 on，用 spend，过去式 spent。' },
    { type: 'choice', q: 'The dictionary ___ me 50 yuan.', options: ['spent', 'paid', 'cost'], answer: 2, explain: '物做主语，用 cost。' },
    { type: 'choice', q: 'It ___ me half an hour to walk to school every day.', options: ['takes', 'spends', 'costs'], answer: 0, explain: 'It takes sb 时间 to do sth。' },
    { type: 'choice', q: 'He ___ 100 yuan for the shoes.', options: ['spent', 'paid', 'cost'], answer: 1, explain: '人做主语，后面有 for，用 pay ... for，过去式 paid。' },
    { type: 'fill', q: 'My sister spends too much time ___ TV.（watch）', answer: ['watching'], explain: 'spend 时间 (in) doing sth，用动名词 watching。' },
    { type: 'fill', q: '—How much did the bike ___ you?<br>—Three hundred yuan.（填一个词）', answer: ['cost'], explain: '物（the bike）做主语，用 cost；did 后用原形。' },
    { type: 'choice', q: 'She spent a lot of money ___ clothes last month.', options: ['on', 'for', 'with'], answer: 0, explain: 'spend 钱 on sth；pay 才搭配 for。' },
    { type: 'fill', q: 'He spent 50 yuan ___ a birthday gift for his mother.（填一个介词）', answer: ['on'], explain: 'spend 钱 on sth 在某物上花钱。' },
    { type: 'choice', q: 'They spent the whole afternoon ___ football.', options: ['playing', 'to play', 'play'], answer: 0, explain: 'spend 时间 (in) doing sth，用动名词，不能用 to do。' },
    { type: 'choice', q: 'The trip to Beijing ___ them a lot of money last year.', options: ['cost', 'spent', 'took'], answer: 0, explain: '物（the trip）做主语、花的是钱，用 cost；过去式仍是 cost。' },
    { type: 'fill', q: 'It ___ the workers three years to build the bridge.（take，用过去式）', answer: ['took'], explain: 'It takes sb 时间 to do sth；过去式是 took。' },
    { type: 'choice', q: 'How long does it ___ you to get to school by bike?', options: ['take', 'spend', 'cost'], answer: 0, explain: 'It 做形式主语，后面有 to do，用 take；does 后用原形。' },
    { type: 'fill', q: 'I paid 20 yuan ___ the dictionary.（填一个介词）', answer: ['for'], explain: 'pay 钱 for sth 为某物付钱。' },
    { type: 'choice', q: 'She spent 100 yuan on the dress.<br>= She ___ 100 yuan for the dress.', options: ['paid', 'cost', 'took'], answer: 0, explain: '人做主语、后面用 for，换成 pay ... for，过去式 paid。' },
    { type: 'choice', q: 'It took me an hour to do my homework.<br>= I ___ an hour doing my homework.', options: ['spent', 'took', 'cost'], answer: 0, explain: '人做主语、后面用 doing，用 spend 时间 doing sth，过去式 spent。' },
    { type: 'choice', q: 'Last year the bike ___ me 500 yuan.', options: ['cost', 'costed', 'costs'], answer: 0, explain: 'cost 的过去式还是 cost，没有 costed；last year 用过去时。' },
    { type: 'fill', q: 'Yesterday I ___ 10 yuan for lunch.（pay，用过去式）', answer: ['paid'], explain: 'pay 的过去式是 paid，不是 payed。' },
    { type: 'fill', q: 'I don\'t want to spend time ___ for the bus.（wait）', answer: ['waiting'], explain: 'spend 时间 (in) doing sth，用动名词 waiting。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['He spends an hour reading every day.', 'He spends an hour to read every day.', 'It spends him an hour to read every day.'], answer: 0, explain: 'spend 后接 doing，不接 to do；It 做形式主语要用 take，不能用 spend。' },
    { type: 'fill', q: '—How much ___ the shoes?<br>—Ninety yuan.（be，一般现在时）', answer: ['are'], explain: '问价钱 How much + be + 物？shoes 是复数，用 are。' },
    { type: 'choice', q: '听对话，回答问题：How much does the cap cost?', say: [{ who: 'W', text: 'Excuse me, how much does this cap cost?' }, { who: 'M', text: 'It costs thirty-five yuan.' }], options: ['35 元', '45 元', '25 元'], answer: 0, explain: '店员说 It costs thirty-five yuan，帽子 35 元；物做主语用 cost。' }
  ]
},

{
  id: 'g-sentence-elements', title: '句子成分与五种基本句型', short: '句子成分', module: 'syntax', grade: 7, freq: 2,
  prereqs: ['g-present-simple', 'g-adj-adv'],
  tip: '中考不会直接考名称，但双宾语转换（give sth to sb / buy sth for sb）和“宾语 + 形容词”（make us happy）常考；学会分析成分，长句和从句才看得懂。',
  learn: [
    { h: '六种句子成分', html: `<table class="tbl"><tr><th>成分</th><th>作用</th><th>例子（加粗部分）</th></tr>
      <tr><td>主语</td><td>谁 / 什么</td><td><b>Tom</b> plays football.</td></tr>
      <tr><td>谓语</td><td>做什么（动词）</td><td>Tom <b>plays</b> football.</td></tr>
      <tr><td>宾语</td><td>动作的对象</td><td>Tom plays <b>football</b>.</td></tr>
      <tr><td>表语</td><td>跟在系动词后，说明主语怎样</td><td>She looks <b>happy</b>.</td></tr>
      <tr><td>定语</td><td>修饰名词</td><td>a <b>red</b> car</td></tr>
      <tr><td>状语</td><td>修饰动词，说明时间、地点、方式等</td><td>She sings <b>beautifully</b>.</td></tr></table>` },
    { h: '五种基本句型', html: `<table class="tbl"><tr><th>句型</th><th>例句</th></tr>
      <tr><td>① 主 + 谓</td><td>Birds fly.</td></tr>
      <tr><td>② 主 + 系 + 表</td><td>The soup tastes good.</td></tr>
      <tr><td>③ 主 + 谓 + 宾</td><td>I like English.</td></tr>
      <tr><td>④ 主 + 谓 + 间宾 + 直宾</td><td>He gave me a book.</td></tr>
      <tr><td>⑤ 主 + 谓 + 宾 + 宾补</td><td>The news made us happy.</td></tr></table>
      <div class="rhyme">主谓、主系表，主谓宾最常见；<br>双宾给人又给物，宾补补充宾语状态。</div>` },
    { h: '双宾语的转换（常考）', html: `<p>“给某人某物”可以把“物”提前，“人”前面加介词：</p>
      <ul><li><b>to</b>：give, pass, lend, send, show, tell, bring 等（动作要“传到”对方手里）</li>
      <li><b>for</b>：buy, make, cook, get 等（为对方做事）</li></ul>
      <p class="ex">He gave me a book. He gave a book to me.<span class="zh">他给了我一本书。</span></p>
      <p class="ex">Mom bought me a new bike. Mom bought a new bike for me.<span class="zh">妈妈给我买了一辆新自行车。</span></p>` },
    { h: '宾语 + 宾补', html: `<p>make / keep / find / call + 宾语 + 形容词或名词，宾补用<b>形容词</b>，不用副词：</p>
      <p class="ex">We must keep our classroom clean.<span class="zh">我们必须保持教室干净。</span></p>
      <p class="ex">We call him Tom.<span class="zh">我们叫他汤姆。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: 'My father bought me a new bike.<br>= My father bought a new bike ___ me.', options: ['to', 'for', 'with'], answer: 1, explain: 'buy 是“为某人买”，转换后用 for。' },
    { type: 'choice', q: 'The good news made us ___.', options: ['happy', 'happily', 'happiness'], answer: 0, explain: 'make + 宾语 + 形容词（宾补），用 happy。' },
    { type: 'choice', q: '在句子 My little brother cries every night. 中，主语是哪部分？', options: ['My little brother', 'cries', 'every night'], answer: 0, explain: '主语回答“谁”：my little brother；cries 是谓语（做什么），every night 是状语（说明时间）。' },
    { type: 'choice', q: '在句子 I like English very much. 中，English 是什么成分？', options: ['宾语', '表语', '主语'], answer: 0, explain: 'like 是普通动词（谓语），English 是“喜欢”的对象，是宾语。' },
    { type: 'choice', q: '在句子 She has a red bag. 中，red 是什么成分？', options: ['定语', '表语', '状语'], answer: 0, explain: 'red 放在名词 bag 前面修饰它，是定语。对比：The bag is red. 中 red 在系动词后，是表语。' },
    { type: 'choice', q: '下面哪个句子是“主 + 谓”结构（没有宾语和表语）？', options: ['The baby is crying.', 'The baby is cute.', 'The baby likes milk.'], answer: 0, explain: 'is crying 是谓语动词（现在进行时），后面没有宾语；is cute 是主系表，likes milk 是主谓宾。' },
    { type: 'choice', q: '下面哪个句子是“主 + 系 + 表”结构？', options: ['The milk turned sour.', 'He turned off the light.', 'He turned the page.'], answer: 0, explain: 'turn 表示“变得”时是系动词，sour 是表语；另外两句的 turn 是动作，后面跟宾语。' },
    { type: 'fill', q: 'Please show me your photos.<br>= Please show your photos ___ me.（填一个介词）', answer: ['to'], explain: 'show 是把东西“给对方看”，物提前后，人前面用 to。' },
    { type: 'choice', q: 'We named the little cat ___.', options: ['Mimi', 'to Mimi', 'for Mimi'], answer: 0, explain: 'name / call + 宾语 + 名词，名词直接做宾补，不加介词。' },
    { type: 'choice', q: '在句子 My mother cooks dinner every day. 中，谓语是哪个词？', options: ['cooks', 'dinner', 'every day'], answer: 0, explain: '谓语说明主语“做什么”，是动词 cooks；dinner 是宾语，every day 是状语。' },
    { type: 'choice', q: '在句子 The weather is fine today. 中，fine 是什么成分？', options: ['表语', '定语', '宾语'], answer: 0, explain: 'fine 跟在系动词 is 后面，说明主语 the weather 怎么样，是表语。对比：a fine day 中 fine 在名词前，是定语。' },
    { type: 'choice', q: '在句子 He runs very fast. 中，very fast 是什么成分？', options: ['状语', '表语', '定语'], answer: 0, explain: 'very fast 修饰动词 runs，说明跑得怎么样，是状语。' },
    { type: 'choice', q: '下面哪个句子是“主 + 谓 + 宾”结构？', options: ['Tom reads books.', 'Tom is a student.', 'Tom runs.'], answer: 0, explain: 'reads 是普通动词，books 是它的对象（宾语）；Tom is a student 是主系表，Tom runs 是主谓。' },
    { type: 'choice', q: '下面哪个句子是“主 + 谓 + 间宾 + 直宾”结构？', options: ['Mom made me a cake.', 'Mom made me happy.', 'Mom made a cake.'], answer: 0, explain: 'me 是间接宾语（人），a cake 是直接宾语（物）：给我做了蛋糕。made me happy 中 happy 是宾补；made a cake 只有一个宾语。' }
  ],
  tests: [
    { type: 'choice', q: 'Please pass ___. I want to put some on my food.', options: ['me the salt', 'the salt me', 'to me the salt'], answer: 0, explain: '双宾语顺序：pass sb sth，或 pass sth to sb。' },
    { type: 'fill', q: 'Lend me your bike, please.<br>= Lend your bike ___ me, please.（填一个介词）', answer: ['to'], explain: 'lend 是把东西“借给”对方，转换后用 to。' },
    { type: 'choice', q: 'Mom cooked a big dinner ___ us last night.', options: ['to', 'for', 'with'], answer: 1, explain: 'cook 是“为某人做”，用 for。' },
    { type: 'fill', q: 'We should keep our room ___.（tidy，用适当形式）', answer: ['tidy'], explain: 'keep + 宾语 + 形容词，宾补用形容词 tidy，不用副词。' },
    { type: 'choice', q: '在句子 The girl sings beautifully. 中，beautifully 是什么成分？', options: ['状语', '定语', '表语'], answer: 0, explain: 'beautifully 修饰动词 sings，说明唱得怎样，是状语。' },
    { type: 'choice', q: '在句子 She looks happy. 中，happy 是什么成分？', options: ['宾语', '表语', '状语'], answer: 1, explain: 'looks 是系动词，后面的形容词 happy 是表语。' },
    { type: 'choice', q: '下面哪个句子是“主 + 谓 + 间宾 + 直宾”结构？', options: ['He gave me a book.', 'He made me happy.', 'He became a teacher.'], answer: 0, explain: 'me 是间接宾语（人），a book 是直接宾语（物）；made me happy 是宾语 + 宾补；became a teacher 是主系表。' },
    { type: 'choice', q: '在句子 Our English teacher comes from Canada. 中，主语是哪部分？', options: ['Our English teacher', 'comes', 'Canada'], answer: 0, explain: '主语回答“谁”来自加拿大：our English teacher；comes 是谓语。' },
    { type: 'choice', q: '在句子 Running every day keeps him healthy. 中，主语是哪部分？', options: ['Running every day', 'keeps', 'him'], answer: 0, explain: '“每天跑步”让他保持健康，主语是动名词短语 running every day；keeps 是谓语，him 是宾语，healthy 是宾补。' },
    { type: 'choice', q: '在句子 The students often play games after class. 中，谓语是哪个词？', options: ['play', 'games', 'after class'], answer: 0, explain: '谓语说明“做什么”，是动词 play；games 是宾语，after class 是状语。' },
    { type: 'choice', q: '在句子 Tom and I went to the zoo yesterday. 中，谓语是哪个词？', options: ['went', 'the zoo', 'yesterday'], answer: 0, explain: '谓语是动词 went；the zoo 是介词 to 的宾语，yesterday 是时间状语。' },
    { type: 'choice', q: '在句子 Tom broke the window. 中，the window 是什么成分？', options: ['宾语', '主语', '表语'], answer: 0, explain: 'the window 是动作 broke 的对象，是宾语。' },
    { type: 'choice', q: '在句子 He gave me a book. 中，直接宾语是哪部分？', options: ['a book', 'me', 'He'], answer: 0, explain: '双宾语中，物（a book）是直接宾语，人（me）是间接宾语。' },
    { type: 'choice', q: '在句子 My father is a doctor. 中，a doctor 是什么成分？', options: ['表语', '宾语', '定语'], answer: 0, explain: 'is 是系动词，后面的 a doctor 说明主语是什么，是表语。' },
    { type: 'choice', q: '在句子 I have an interesting book. 中，interesting 是什么成分？', options: ['定语', '表语', '状语'], answer: 0, explain: 'interesting 修饰名词 book，是定语。' },
    { type: 'choice', q: '在句子 The boy in red is my brother. 中，in red 是什么成分？', options: ['定语', '状语', '宾语'], answer: 0, explain: 'in red 放在名词 the boy 后面，说明是哪个男孩，修饰名词，是定语。' },
    { type: 'choice', q: '在句子 We have English classes in the morning. 中，in the morning 是什么成分？', options: ['状语', '定语', '宾语'], answer: 0, explain: 'in the morning 说明动作发生的时间，修饰动词 have，是状语。' },
    { type: 'choice', q: 'The sun rises. 是哪种句型？', options: ['主 + 谓', '主 + 系 + 表', '主 + 谓 + 宾'], answer: 0, explain: 'the sun 是主语，rises 是谓语，后面什么也没有，是“主 + 谓”。' },
    { type: 'choice', q: 'The flowers smell sweet. 是哪种句型？', options: ['主 + 系 + 表', '主 + 谓 + 宾', '主 + 谓'], answer: 0, explain: 'smell 在这里是系动词，sweet 是表语。' },
    { type: 'choice', q: 'I like English. 是哪种句型？', options: ['主 + 谓 + 宾', '主 + 系 + 表', '主 + 谓 + 宾 + 宾补'], answer: 0, explain: 'like 是普通动词，English 是宾语，是“主 + 谓 + 宾”。' },
    { type: 'choice', q: '下面哪个句子是“主 + 谓 + 宾 + 宾补”结构？', options: ['We keep the room clean.', 'We clean the room.', 'The room is clean.'], answer: 0, explain: 'the room 是宾语，clean 补充说明宾语的状态，是宾补；第二句是主谓宾，第三句是主系表。' },
    { type: 'choice', q: 'Could you please get a glass of water ___ me?', options: ['for', 'to', 'with'], answer: 0, explain: 'get 是“为某人去拿”，转换后人前面用 for。' },
    { type: 'fill', q: 'He sent an e-mail ___ his friend in Canada.（填一个介词）', answer: ['to'], explain: 'send 是把东西“传到”对方那里，用 to。' },
    { type: 'choice', q: 'Grandma told ___ an interesting story last night.', options: ['us', 'to us', 'for us'], answer: 0, explain: 'tell sb sth：人在前、物在后时，人前面不加介词；物提前时才说 tell sth to sb。' },
    { type: 'choice', q: 'The long walk made us very ___.', options: ['tired', 'tiredly', 'tire'], answer: 0, explain: 'make + 宾语 + 形容词，宾补用形容词 tired，不用副词。' },
    { type: 'choice', q: 'I find this book very ___.', options: ['interesting', 'interestingly', 'interest'], answer: 0, explain: 'find + 宾语 + 形容词，宾补用形容词 interesting，不用副词。' },
    { type: 'fill', q: 'Open the window and keep the air ___.（fresh，用适当形式）', answer: ['fresh'], explain: 'keep + 宾语 + 形容词，宾补用形容词 fresh。' },
    { type: 'choice', q: 'The boy\'s friends call him ___.', options: ['Little Tom', 'to Little Tom', 'for Little Tom'], answer: 0, explain: 'call sb + 名词，名词直接做宾补，不加介词。' },
    { type: 'choice', q: 'We made Tom ___ of our football team.', options: ['captain', 'to captain', 'for captain'], answer: 0, explain: 'make sb + 名词（宾补），表示让某人当……，名词直接放在宾语后面，不加介词。' }
  ]
},

{
  id: 'g-exclamation', title: '感叹句 What / How', short: '感叹句', module: 'syntax', grade: 7, freq: 2,
  prereqs: ['g-article', 'g-adj-adv'],
  tip: '常考 What 和 How 的选择，以及要不要加 a / an；陷阱是 weather、news、advice、fun 等不可数名词前不能加 a。',
  learn: [
    { h: '两种句型', html: `<p><b>What</b> 修饰<b>名词</b>：</p>
      <ul><li>What + a / an + 形容词 + 单数可数名词 (+ 主语 + 谓语)!</li>
      <li>What + 形容词 + 复数名词 / 不可数名词 (+ 主语 + 谓语)!</li></ul>
      <p class="ex">What a beautiful flower it is!<span class="zh">多么漂亮的一朵花啊！</span></p>
      <p class="ex">What beautiful flowers they are!<span class="zh">多么漂亮的花啊！</span></p>
      <p class="ex">What fine weather it is today!<span class="zh">今天天气真好啊！</span></p>
      <p><b>How</b> 修饰<b>形容词或副词</b>：How + 形容词 / 副词 (+ 主语 + 谓语)!</p>
      <p class="ex">How beautiful the flower is!<span class="zh">这朵花多漂亮啊！</span></p>
      <p class="ex">How fast the boy runs!<span class="zh">这个男孩跑得多快啊！</span></p>` },
    { h: '判断方法', html: `<div class="rhyme">去掉主谓看后面，有名词就用 What；<br>只剩形容和副词，How 来把感叹发。</div>
      <p>例：___ interesting story it is! → 去掉 it is，剩下 interesting story，有名词 story，单数可数，用 <b>What an</b>。</p>` },
    { h: '易错点', html: `<ul>
      <li>不可数名词前不加 a：<span class="en">What good news! What fun! What useful advice!</span></li>
      <li>注意 a 和 an：<span class="en">What an interesting book!</span>（interesting 以元音音素开头）</li>
      <li>感叹句里主语和谓语<b>不倒装</b>：How beautiful the flower is!（不能写 How beautiful is the flower!）</li>
      <li>How 也可以直接加句子：<span class="en">How time flies!</span>（时间过得真快！）</li></ul>` }
  ],
  examples: [
    { type: 'choice', q: '___ interesting story it is!', options: ['What', 'What an', 'How'], answer: 1, explain: '去掉 it is 后有单数可数名词 story，用 What an（interesting 以元音音素开头）。' },
    { type: 'choice', q: '___ good news it is!', options: ['What', 'What a', 'How'], answer: 0, explain: 'news 是不可数名词，用 What + 形容词 + 不可数名词，不加 a。' },
    { type: 'choice', q: '___ delicious apples they are!', options: ['What', 'What a', 'How'], answer: 0, explain: '去掉 they are，剩下 delicious apples，有复数名词，用 What，不加 a。' },
    { type: 'choice', q: '___ well he plays the piano!', options: ['How', 'What', 'What a'], answer: 0, explain: '去掉 he plays the piano，只剩副词 well，用 How。' },
    { type: 'choice', q: '下面哪句是正确的？', options: ['How tall the tree is!', 'How tall is the tree!', 'What tall the tree is!'], answer: 0, explain: '感叹句的主语和谓语不倒装，是 the tree is；只修饰形容词 tall 要用 How。' },
    { type: 'choice', q: '___ time flies! It\'s the end of the term again.', options: ['How', 'What', 'What a'], answer: 0, explain: 'How 可以直接加句子：How time flies! 时间过得真快！' },
    { type: 'choice', q: '___ hard the work is!', options: ['How', 'What', 'What a'], answer: 0, explain: '用判断方法：去掉主谓 the work is，只剩形容词 hard，没有名词，所以用 How。不要看到 work 就选 What。' },
    { type: 'choice', q: 'What ___ old house it is!', options: ['an', 'a', 'the'], answer: 0, explain: 'house 是单数可数名词，要加不定冠词；紧跟的 old 以元音音素开头，用 an。' },
    { type: 'choice', q: '___ wonderful music it is!', options: ['What', 'What a', 'How'], answer: 0, explain: 'music 是不可数名词，用 What + 形容词 + 不可数名词，不能加 a。' }
  ],
  tests: [
    { type: 'choice', q: '___ beautiful flowers they are!', options: ['What', 'What a', 'How'], answer: 0, explain: 'flowers 是复数名词，用 What，不加 a。' },
    { type: 'choice', q: '___ fine weather it is today! Let\'s go for a walk.', options: ['What', 'What a', 'How'], answer: 0, explain: 'weather 是不可数名词，用 What，不加 a。' },
    { type: 'choice', q: '___ interesting the story is!', options: ['How', 'What', 'What an'], answer: 0, explain: '去掉 the story is，只剩形容词 interesting，用 How。' },
    { type: 'choice', q: '___ exciting game it was!', options: ['What an', 'What', 'How'], answer: 0, explain: 'game 是单数可数名词，用 What an（exciting 以元音音素开头）。' },
    { type: 'fill', q: '___ fast the boy runs!（填一个词，注意首字母大写）', answer: ['How'], explain: '去掉 the boy runs，只剩副词 fast，用 How。' },
    { type: 'fill', q: '___ ___ useful book it is!（填两个词，注意首字母大写）', answer: ['What a'], explain: 'book 是单数可数名词，用 What a；useful 读音以辅音 /j/ 开头，用 a 不用 an。' },
    { type: 'choice', q: 'You have done a great job. ___ hard work it is!', options: ['What', 'What a', 'How'], answer: 0, explain: 'work 表示“工作”时是不可数名词，用 What + 形容词 + 不可数名词。' },
    { type: 'choice', q: '___ nice pictures you have drawn!', options: ['What', 'What a', 'How'], answer: 0, explain: 'pictures 是复数名词，用 What，不加 a。' },
    { type: 'fill', q: '___ lovely children they are!（填一个词，注意首字母大写）', answer: ['What'], explain: 'children 是复数名词，用 What + 形容词 + 复数名词。' },
    { type: 'choice', q: 'How ___ the girl dances!', options: ['beautifully', 'beautiful', 'beauty'], answer: 0, explain: 'How 后面修饰动词 dances 要用副词 beautifully：她跳得多美啊！' },
    { type: 'choice', q: '___ cold it is today! Put on your coat.', options: ['How', 'What', 'What a'], answer: 0, explain: '去掉 it is，只剩形容词 cold，用 How。' },
    { type: 'choice', q: 'How cold ___ today!', options: ['it is', 'is it', 'it'], answer: 0, explain: '感叹句用陈述语序，主语在前、谓语在后：it is。' },
    { type: 'fill', q: 'The weather is very hot today.<br>→ How hot ___ ___ ___ today!（填三个词）', answer: ['the weather is'], explain: 'How + 形容词 + 主语 + 谓语，不倒装：How hot the weather is today!' },
    { type: 'choice', q: '“How time flies!” 的意思是：', options: ['时间过得真快！', '时间是怎么飞的？', '飞行要多长时间？'], answer: 0, explain: 'How 直接加句子表示感叹：How time flies! 时间过得真快！它不是问句。' },
    { type: 'fill', q: '___ I miss my grandparents! I haven\'t seen them for a year.（填一个词，注意首字母大写）', answer: ['How'], explain: 'How 后面可以直接加一个句子，表示“多么……啊”：我多么想念我的爷爷奶奶啊！' },
    { type: 'choice', q: '___ heavily it rained last night!', options: ['How', 'What', 'What a'], answer: 0, explain: '去掉主谓 it rained 和时间 last night，只剩副词 heavily，没有名词，用 How。' },
    { type: 'choice', q: '___ heavy rain it was last night!', options: ['What', 'What a', 'How'], answer: 0, explain: '去掉 it was，剩下 heavy rain，有名词 rain（不可数），用 What，不加 a。' },
    { type: 'choice', q: '___ fun we had at the party!', options: ['What', 'What a', 'How'], answer: 0, explain: 'fun 是不可数名词，用 What，不能加 a。' },
    { type: 'fill', q: '___ useful advice you gave me!（填一个词，注意首字母大写）', answer: ['What'], explain: 'advice 是不可数名词，用 What + 形容词 + 不可数名词，不加 a。' },
    { type: 'fill', q: '___ ___ honest boy he is!（填两个词，注意首字母大写）', answer: ['What an'], explain: 'boy 是单数可数名词；honest 中的 h 不发音，以元音音素开头，用 What an。' }
  ]
},

{
  id: 'g-compound-sentence', title: '并列句与“祈使句 + and / or”', short: '并列句', module: 'syntax', grade: 7, freq: 2,
  prereqs: ['g-conj', 'g-imperative'],
  tip: '中考常考“祈使句 + and / or + 一般将来时”：and 表示“那么就会”，or 表示“否则”；注意可以改写成 if 引导的句子。',
  learn: [
    { h: '什么是并列句', html: `<p>两个（或更多）简单句用 <b>and / but / or / so</b> 连在一起，两边地位平等，就是并列句。</p>
      <p class="ex">I like math, but my brother likes English.<span class="zh">我喜欢数学，但是我弟弟喜欢英语。</span></p>
      <p class="ex">It was late, so we went home.<span class="zh">天晚了，所以我们回家了。</span></p>
      <p class="warn">两个完整的句子之间不能只用逗号，要加连词。</p>` },
    { h: '祈使句 + and / or（重点）', html: `<table class="tbl"><tr><th>句型</th><th>意思</th><th>例句</th></tr>
      <tr><td>祈使句 + <b>and</b> + 将来时</td><td>这样做，就会……</td><td>Work hard, and you will succeed.</td></tr>
      <tr><td>祈使句 + <b>or</b> + 将来时</td><td>这样做，否则会……</td><td>Hurry up, or you will be late.</td></tr></table>
      <div class="rhyme">做了有好结果用 and，<br>不做有坏结果用 or；<br>后半句子要记牢，一般将来少不了。</div>` },
    { h: '改写成 if 句', html: `<p class="ex">Work hard, and you will succeed.<span class="zh">努力学习，你就会成功。</span></p>
      <p class="ex">If you work hard, you will succeed.<span class="zh">如果你努力，你就会成功。</span></p>
      <p class="ex">Hurry up, or you will be late.<span class="zh">快点，否则你会迟到。</span></p>
      <p class="ex">If you don't hurry up, you will be late.<span class="zh">如果你不快点，你会迟到。</span></p>
      <p class="warn">and 改 if：意思不变；or 改 if：要加上否定 don't。if 从句用一般现在时（主将从现）。</p>` }
  ],
  examples: [
    { type: 'choice', q: "Hurry up, ___ you'll miss the early bus.", options: ['and', 'or', 'but'], answer: 1, explain: '“快点，否则会错过公交”，不做有坏结果，用 or。' },
    { type: 'fill', q: 'Study hard, and you will get good grades.<br>= ___ you study hard, you will get good grades.（填一个词，注意首字母大写）', answer: ['If'], explain: '“祈使句 + and”可改写成 if 引导的条件句，意思不变。' },
    { type: 'choice', q: 'It was very cold outside, ___ we stayed at home.', options: ['so', 'but', 'or'], answer: 0, explain: '两个简单句用连词连成并列句；“很冷”是原因，“待在家”是结果，用 so。' },
    { type: 'choice', q: '下面哪句写法是正确的？', options: ['I was tired, I went to bed early.', 'I was tired, so I went to bed early.', 'I was tired so, I went to bed early.'], answer: 1, explain: '两个完整的句子之间不能只用逗号，要用连词 so 连接，so 放在第二个句子开头。' },
    { type: 'choice', q: "Use your head, ___ you'll find a way.", options: ['and', 'or', 'but'], answer: 0, explain: '动脑筋就会想到办法，做了有好结果，用 and；后半句用一般将来时。' },
    { type: 'fill', q: "Hurry up, or you'll miss the train.<br>= If you ___ hurry up, you'll miss the train.（填一个词）", answer: ["don't", 'do not'], explain: '“祈使句 + or”改成 if 句时，要加否定：If you don\'t hurry up...' },
    { type: 'choice', q: 'If it ___ tomorrow, we will stay at home.', options: ['rains', 'will rain', 'rained'], answer: 0, explain: '主将从现：主句用一般将来时，if 从句用一般现在时 rains。' },
    { type: 'choice', q: "Take a map with you, and you ___ get lost.", options: ["won't", "don't", "didn't"], answer: 0, explain: '“祈使句 + and / or”后半句说的是将来的结果，要用一般将来时：you won\'t get lost。' }
  ],
  tests: [
    { type: 'choice', q: "Get up now, ___ you'll be late for school.", options: ['or', 'and', 'but'], answer: 0, explain: '不马上起床就会迟到，表示“否则”，用 or。' },
    { type: 'choice', q: "Study hard, ___ you'll make great progress.", options: ['and', 'or', 'so'], answer: 0, explain: '努力学习会带来好结果，用 and。' },
    { type: 'fill', q: "Put on your coat, ___ you'll catch a cold.（填一个连词）", answer: ['or'], explain: '不穿外套会感冒，表示“否则”，用 or。' },
    { type: 'fill', q: "Give me a chance, ___ I'll show you my best.（填一个连词）", answer: ['and'], explain: '给我机会，我就会展示最好的自己，好结果用 and。' },
    { type: 'choice', q: 'Take an umbrella with you, or you ___ wet.', options: ['will get', 'got', 'getting'], answer: 0, explain: '“祈使句 + or”后面的句子用一般将来时。' },
    { type: 'choice', q: 'Work hard, and you will pass the exam.<br>= ___ you work hard, you will pass the exam.', options: ['If', 'Because', 'But'], answer: 0, explain: '“祈使句 + and”可改写为 if 引导的条件句。' },
    { type: 'choice', q: 'I wanted to buy the coat, ___ I didn\'t have enough money.', options: ['and', 'but', 'or'], answer: 1, explain: '想买但钱不够，前后意思转折，用 but。' },
    { type: 'choice', q: "He is very clever, ___ he doesn't work hard.", options: ['but', 'so', 'or'], answer: 0, explain: '“很聪明”和“不努力”意思相反，用 but 连成并列句。' },
    { type: 'choice', q: '下面哪句写法是正确的？', options: ['She was hungry, she ate two bowls of rice.', 'She was hungry, so she ate two bowls of rice.', 'She was hungry, but she ate two bowls of rice.'], answer: 1, explain: '两个完整的句子之间不能只用逗号；饿了所以吃了两碗饭，是因果关系，用 so，用 but 意思不通。' },
    { type: 'fill', q: "改错：Tom was ill, he didn't go to school. 在逗号后面加一个表示结果的连词：___", answer: ['so'], explain: '两个完整句子不能只用逗号连接；生病是原因，没上学是结果，加 so。' },
    { type: 'choice', q: 'Practise more, ___ your English will get better.', options: ['and', 'or', 'but'], answer: 0, explain: '多练习会带来好结果，用 and。' },
    { type: 'fill', q: 'If you take this medicine, you will feel better.<br>= Take this medicine, ___ you will feel better.（填一个连词）', answer: ['and'], explain: '吃药会好起来，是好结果，“祈使句 + and + 将来时”。' },
    { type: 'choice', q: "If you don't get up early, you will miss the bus.<br>= Get up early, ___ you will miss the bus.", options: ['or', 'and', 'so'], answer: 0, explain: '不早起就会错过公交，表示“否则”，用 or。' },
    { type: 'choice', q: '听句子，选出它的意思。', say: 'Turn off the lights, or you will waste electricity.', options: ['把灯关掉，否则会浪费电。', '把灯关掉，你就能省很多电。', '开着灯，否则会浪费电。'], answer: 0, explain: '“祈使句 + or + 将来时”表示“这样做，否则会……”。' },
    { type: 'fill', q: 'Be careful, or you ___ ___ down.（fall，填两个词）', answer: ['will fall'], explain: '“祈使句 + or”后面的句子用一般将来时 will fall。' },
    { type: 'fill', q: 'Read more, and you will learn more.<br>= If you ___ more, you will learn more.（填一个词）', answer: ['read'], explain: '“祈使句 + and”改成 if 句，意思不变；if 从句用一般现在时。' },
    { type: 'choice', q: 'Be quiet, or the baby will wake up. 的同义句是：', options: ["If you aren't quiet, the baby will wake up.", 'If you are quiet, the baby will wake up.', 'Because you are quiet, the baby will wake up.'], answer: 0, explain: '“祈使句 + or”改成 if 句时要加否定：If you aren\'t quiet...' },
    { type: 'fill', q: "Wear a coat, or you'll catch a cold.<br>= If you ___ wear a coat, you'll catch a cold.（填一个词）", answer: ["don't", 'do not'], explain: 'or 表示“否则”，改成 if 句要加否定 don\'t。' },
    { type: 'choice', q: 'If you ___ hard, you will pass the exam.', options: ['work', 'will work', 'worked'], answer: 0, explain: '主将从现：主句是 will pass，if 从句用一般现在时 work。' },
    { type: 'fill', q: 'If it ___ tomorrow, we will go hiking.（not rain，用适当形式，缩写形式填两个词）', answer: ["doesn't rain", 'does not rain'], explain: '主将从现：if 从句用一般现在时，it 是第三人称单数，否定用 doesn\'t rain。' }
  ]
}

);
