// A 组 语音（第 3 阶段）
KG.nodes.push(

/* ================= 26 个字母 ================= */
{
  id: 'p-alphabet', title: '26 个字母与常见缩写', short: '26 个字母', module: 'phonics', grade: 4, freq: 1,
  prereqs: [],
  tip: '字母顺序是查词典的基本功；字母名称的读音在听力里拼写人名、地名时常会用到。',
  learn: [
    { h: '大小写与顺序', html: `
      <p>英语一共 26 个字母，每个都有大写和小写：</p>
      <p><b>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</b></p>
      <div class="rhyme">五个元音要记牢：A、E、I、O、U；<br>剩下二十一个都是辅音字母（Y 有时也当元音用）。</div>
      <p class="warn">句子开头、人名、地名、星期、月份、I（我）的首字母都要大写：<span class="w">Monday</span> <span class="w">China</span>。</p>` },
    { h: '按读音给字母分组', html: `
      <p>字母的“名字”里藏着元音，按元音分组，背起来就快多了：</p>
      <table class="tbl"><tr><th>共同的音</th><th>字母</th></tr>
      <tr><td>/eɪ/（像“诶”）</td><td>A H J K</td></tr>
      <tr><td>/iː/（像“衣”拉长）</td><td>B C D E G P T V</td></tr>
      <tr><td>/e/ 开头</td><td>F L M N S X Z（英式 /zed/）</td></tr>
      <tr><td>/aɪ/（像“爱”）</td><td>I Y</td></tr>
      <tr><td>/əʊ/（像“欧”）</td><td>O</td></tr>
      <tr><td>/juː/（像“优”）</td><td>Q U W</td></tr>
      <tr><td>/ɑː/（像“啊”）</td><td>R</td></tr></table>
      <p>Z 英式读 /zed/，美式读 /ziː/，两种都对。</p>
      <p class="warn">G 和 J 最容易混：G 读 /dʒiː/（“记”），J 读 /dʒeɪ/（“接诶”）。</p>` },
    { h: '字母前用 a 还是 an', html: `
      <p>看字母<b>读出来</b>第一个音是不是元音，而不是看写法：</p>
      <ul>
        <li>读音以元音开头的字母：A E F H I L M N O R S X，前面用 <b>an</b>。</li>
        <li>其余字母前用 <b>a</b>，比如 U 读 /juː/，开头是辅音 /j/，所以用 a。</li></ul>
      <p class="ex">There is an "s" in the word "bus".<span class="zh">单词 bus 里有一个 s。</span></p>
      <p class="ex">There is a "u" in the word "sun".<span class="zh">单词 sun 里有一个 u。</span></p>` },
    { h: '常见缩写', html: `
      <table class="tbl"><tr><th>缩写</th><th>意思</th><th>缩写</th><th>意思</th></tr>
      <tr><td>PE</td><td>体育（课）</td><td>UN</td><td>联合国</td></tr>
      <tr><td>WHO</td><td>世界卫生组织</td><td>UK</td><td>英国</td></tr>
      <tr><td>USA</td><td>美国</td><td>PRC</td><td>中华人民共和国</td></tr>
      <tr><td>kg</td><td>千克</td><td>cm</td><td>厘米</td></tr>
      <tr><td>a.m.</td><td>上午</td><td>p.m.</td><td>下午</td></tr></table>
      <p>缩写一般按字母一个一个读，比如 PE 读成“P-E”。</p>` }
  ],
  examples: [
    { type: 'choice', q: '下面哪个字母和 A 含有相同的音？', options: ['H', 'E', 'I'], answer: 0,
      explain: 'A 和 H 都含 /eɪ/；E 读 /iː/，I 读 /aɪ/。' },
    { type: 'choice', q: 'There is ___ "f" in the word "fish".', options: ['a', 'an', 'the'], answer: 1,
      explain: 'F 读 /ef/，以元音 /e/ 开头，所以用 an。' },
    { type: 'fill', q: '按字母表顺序填空：J, K, ___, M', answer: ['L', 'l'],
      explain: '字母表顺序是 …J K L M N…，空格是 L。' },
    { type: 'choice', q: '下面哪一组全是元音字母？', options: ['A E I O U', 'A E I K U', 'B E I O U'], answer: 0,
      explain: '元音字母只有 A、E、I、O、U 五个，其余 21 个都是辅音字母；K 和 B 是辅音字母。' },
    { type: 'choice', q: '下面哪个句子的大小写完全正确？', options: ['Lily was born in May.', 'lily was born in may.', 'Lily was born in may.'], answer: 0,
      explain: '句子开头要大写，人名 Lily 和月份 May 的首字母也要大写，三处都写对的只有 Lily was born in May.' },
    { type: 'choice', q: '听一听，选出你听到的字母。', say: 'The letter J.', options: ['J', 'G', 'K'], answer: 0,
      explain: '听到的是 /dʒeɪ/，含 /eɪ/，这是 J；G 读 /dʒiː/（含 /iː/），K 读 /keɪ/（开头是 /k/）。G 和 J 最容易混，要听清后半个音。' },
    { type: 'choice', q: 'UK 的意思是', options: ['英国', '美国', '世界卫生组织'], answer: 0,
      explain: 'UK 是英国；美国是 USA，世界卫生组织是 WHO。缩写一般按字母一个一个读，UK 读成“U-K”。' },
    { type: 'choice', q: '缩写 PE（体育课）一般怎么读？', options: ['P-E，两个字母分别读', '像单词 pen 去掉 n 那样拼读', '读成“体育”的英文全称'], answer: 0,
      explain: '常见缩写一般按字母一个一个读，PE 读成“P-E”，WHO 读成“W-H-O”，不当成一个单词来拼读。' }
  ],
  tests: [
    { type: 'choice', q: '听一听，选出你听到的字母。', say: 'The letter G.', options: ['G', 'J', 'K'], answer: 0,
      explain: '听到的是 /dʒiː/，这是字母 G；J 读 /dʒeɪ/，K 读 /keɪ/。' },
    { type: 'choice', q: '下面哪个字母和 B 含有相同的音？', options: ['T', 'F', 'Y'], answer: 0,
      explain: 'B 和 T 都含 /iː/；F 读 /ef/，Y 读 /waɪ/。' },
    { type: 'choice', q: 'There is ___ "u" in the word "cup".', options: ['a', 'an', 'the'], answer: 0,
      explain: 'U 读 /juː/，第一个音是辅音 /j/，所以用 a。' },
    { type: 'choice', q: 'PE 的意思是', options: ['体育', '英国', '联合国'], answer: 0,
      explain: 'PE 是体育（课）；英国是 UK，联合国是 UN。' },
    { type: 'fill', q: '按字母表顺序填空：S, T, ___, V', answer: ['U', 'u'],
      explain: '字母表顺序是 …S T U V W…，空格是 U。' },
    { type: 'fill', q: '五个元音字母是 A, E, I, O 和 ___。', answer: ['U', 'u'],
      explain: '五个元音字母是 A E I O U。' },
    { type: 'choice', q: '查词典时，下面哪个单词排在最前面？', options: ['bag', 'apple', 'cat'], answer: 1,
      explain: '词典按首字母顺序排列，a 在 b、c 前面，所以 apple 最先出现。' },
    { type: 'choice', q: '把 dog、cat、egg 按字母顺序（词典顺序）排列，排在最后的是', options: ['egg', 'dog', 'cat'], answer: 0,
      explain: '看首字母：c 在 d 前，d 在 e 前，顺序是 cat、dog、egg，egg 排最后。' },
    { type: 'choice', q: '下面哪个是辅音字母？', options: ['K', 'O', 'E'], answer: 0,
      explain: 'O 和 E 都是五个元音字母（A E I O U）之一，K 是辅音字母。' },
    { type: 'fill', q: '英语 26 个字母中，辅音字母有___个。（填数字）', answer: ['21', 'twenty-one', 'twenty one'],
      explain: '26 个字母减去 5 个元音字母 A E I O U，剩下 21 个辅音字母。' },
    { type: 'choice', q: '下面哪个词无论在句子的什么位置，首字母都要大写？', options: ['sunday', 'teacher', 'water'], answer: 0,
      explain: '星期名称首字母一定大写，要写成 Sunday；teacher 和 water 只有在句子开头才大写。' },
    { type: 'choice', q: '下面哪个句子的大小写有错误？', options: ['My friend and i like English.', 'We are from China.', 'Today is Friday.'], answer: 0,
      explain: '表示“我”的 I 在任何位置都要大写，应写成 My friend and I like English.' },
    { type: 'choice', q: '下面哪个句子的大小写完全正确？', options: ['We have PE on Monday.', 'we have PE on Monday.', 'We have PE on monday.'], answer: 0,
      explain: '句子开头的 We 要大写，星期 Monday 首字母也要大写，两处都对的只有 We have PE on Monday.' },
    { type: 'choice', q: '下面哪个字母和 F 含有相同的音？', options: ['M', 'E', 'R'], answer: 0,
      explain: 'F 读 /ef/，M 读 /em/，都以 /e/ 开头；E 读 /iː/，R 读 /ɑː/。' },
    { type: 'choice', q: '下面哪一组字母含有相同的音？', options: ['Q U W', 'A E I', 'B F O'], answer: 0,
      explain: 'Q、U、W 的读音里都有 /juː/；A、E、I 分别读 /eɪ/ /iː/ /aɪ/，B、F、O 也各不相同。' },
    { type: 'choice', q: '下面哪个字母和 I 含有相同的音？', options: ['Y', 'E', 'A'], answer: 0,
      explain: 'I 读 /aɪ/，Y 读 /waɪ/，都含 /aɪ/；E 读 /iː/，A 读 /eɪ/。' },
    { type: 'choice', q: '下面哪个字母和 G 含有相同的音？', options: ['P', 'J', 'K'], answer: 0,
      explain: 'G 读 /dʒiː/，和 P /piː/ 一样含 /iː/；J /dʒeɪ/ 和 K /keɪ/ 含 /eɪ/。别把 G 和 J 弄混。' },
    { type: 'choice', q: 'There is ___ "h" in the word "hat".', options: ['a', 'an', 'the'], answer: 1,
      explain: '字母 H 读 /eɪtʃ/，以元音 /eɪ/ 开头，所以用 an。看的是字母的读音，不是写法。' },
    { type: 'choice', q: 'There is ___ "y" in the word "yes".', options: ['a', 'an', 'the'], answer: 0,
      explain: '字母 Y 读 /waɪ/，第一个音 /w/ 是辅音，所以用 a。' },
    { type: 'fill', q: 'There is ___ "o" in the word "dog".（填 a 或 an）', answer: ['an'],
      explain: '字母 O 读 /əʊ/，以元音开头，所以用 an。' },
    { type: 'choice', q: '“世界卫生组织”的英文缩写是', options: ['WHO', 'UN', 'PRC'], answer: 0,
      explain: '世界卫生组织是 WHO；UN 是联合国，PRC 是中华人民共和国。' },
    { type: 'choice', q: '下午三点可以写成', options: ['3 p.m.', '3 a.m.', '3 cm'], answer: 0,
      explain: 'p.m. 表示下午，a.m. 表示上午，cm 是厘米。' },
    { type: 'choice', q: '缩写 UN 一般怎么读？', options: ['把字母一个一个读出来：U-N', '像一个单词那样拼读成 /ʌn/', '只读第一个字母 U'], answer: 0,
      explain: '这类缩写一般按字母一个一个读，UN 读成“U-N”，PE 读成“P-E”。' },
    { type: 'choice', q: '缩写 USA 一般怎么读？', options: ['U-S-A，三个字母分别读', '像一个单词那样读成 /ˈjuːsə/', '只读 U 和 A'], answer: 0,
      explain: 'USA（美国）按字母一个一个读，读成“U-S-A”。' }
  ]
},

/* ================= 辅音字母 ================= */
{
  id: 'p-letter-sounds', title: '自然拼读：辅音字母的发音', short: '辅音发音', module: 'phonics', grade: 4, freq: 1,
  prereqs: ['p-alphabet'],
  tip: '掌握辅音字母的发音，听到生词也能大致拼出来，听力填词和单词拼写都更稳。',
  learn: [
    { h: '字母名 ≠ 字母音', html: `
      <p>字母有“名字”（比如 B 叫 /biː/），也有在单词里的“发音”（B 在单词里只发 /b/）。拼读单词时用的是<b>发音</b>。</p>
      <div class="rhyme">字母名字是“叫它”，字母发音是“用它”；<br>拼单词时别叫名字，一个字母一个音。</div>
      <p>比如 <span class="w">bag</span> 不是“毕-诶-机”，而是 /b/ + /æ/ + /g/。</p>` },
    { h: '辅音字母发音表', html: `
      <table class="tbl"><tr><th>字母</th><th>音标</th><th>例词</th></tr>
      <tr><td>b</td><td>/b/</td><td><span class="w">bag</span> <span class="w">bus</span></td></tr>
      <tr><td>d</td><td>/d/</td><td><span class="w">dog</span> <span class="w">desk</span></td></tr>
      <tr><td>f</td><td>/f/</td><td><span class="w">fish</span> <span class="w">fan</span></td></tr>
      <tr><td>h</td><td>/h/</td><td><span class="w">hat</span> <span class="w">hot</span></td></tr>
      <tr><td>j</td><td>/dʒ/</td><td><span class="w">jam</span> <span class="w">jump</span></td></tr>
      <tr><td>k</td><td>/k/</td><td><span class="w">kid</span> <span class="w">milk</span></td></tr>
      <tr><td>l</td><td>/l/</td><td><span class="w">leg</span> <span class="w">lip</span></td></tr>
      <tr><td>m</td><td>/m/</td><td><span class="w">map</span> <span class="w">mum</span></td></tr>
      <tr><td>n</td><td>/n/</td><td><span class="w">net</span> <span class="w">nut</span></td></tr>
      <tr><td>p</td><td>/p/</td><td><span class="w">pig</span> <span class="w">pen</span></td></tr>
      <tr><td>r</td><td>/r/</td><td><span class="w">red</span> <span class="w">run</span></td></tr>
      <tr><td>t</td><td>/t/</td><td><span class="w">ten</span> <span class="w">top</span></td></tr>
      <tr><td>v</td><td>/v/</td><td><span class="w">van</span> <span class="w">vet</span></td></tr>
      <tr><td>w</td><td>/w/</td><td><span class="w">wet</span> <span class="w">win</span></td></tr>
      <tr><td>x</td><td>/ks/</td><td><span class="w">box</span> <span class="w">six</span></td></tr>
      <tr><td>y（词首）</td><td>/j/</td><td><span class="w">yes</span> <span class="w">yellow</span></td></tr>
      <tr><td>z</td><td>/z/</td><td><span class="w">zoo</span> <span class="w">zip</span></td></tr>
      <tr><td>qu</td><td>/kw/</td><td><span class="w">queen</span> <span class="w">quick</span></td></tr></table>
      <p class="warn">y 在词首读 /j/，像“耶”的开头，不是 j 的 /dʒ/。q 后面几乎总跟着 u。</p>` },
    { h: '一个字母两种音：c、g、s', html: `
      <ul>
        <li><b>c</b> 一般读 /k/：<span class="w">cat</span> <span class="w">cup</span>；在 e、i、y 前常读 /s/：<span class="w">city</span> <span class="w">face</span> <span class="w">nice</span>。</li>
        <li><b>g</b> 一般读 /g/：<span class="w">go</span> <span class="w">bag</span>；在 e、i、y 前有时读 /dʒ/：<span class="w">gym</span> <span class="w">orange</span> <span class="w">page</span>。</li>
        <li><b>s</b> 一般读 /s/：<span class="w">sit</span> <span class="w">bus</span>；在两个元音之间或词尾常读 /z/：<span class="w">nose</span> <span class="w">is</span>。</li></ul>
      <div class="rhyme">c 和 g 遇到 e、i、y，常常“变软”换声音。</div>` },
    { h: '清辅音与浊辅音', html: `
      <p>摸着喉咙读：喉咙<b>不振动</b>的是清辅音，<b>振动</b>的是浊辅音。它们常常成对出现：</p>
      <table class="tbl"><tr><th>清辅音</th><th>/p/</th><th>/t/</th><th>/k/</th><th>/f/</th><th>/s/</th></tr>
      <tr><th>浊辅音</th><td>/b/</td><td>/d/</td><td>/g/</td><td>/v/</td><td>/z/</td></tr></table>
      <p>听力里 <span class="w">pig</span> 和 <span class="w">big</span>、<span class="w">fan</span> 和 <span class="w">van</span> 就差在清浊上，要听仔细。</p>` }
  ],
  examples: [
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>c</u>at', '<u>c</u>up', '<u>c</u>ity'], answer: 2,
      explain: 'c 在 i 前读 /s/，city 的 c 读 /s/；cat、cup 的 c 读 /k/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'van', options: ['van', 'fan', 'man'], answer: 0,
      explain: '听到的是 van，开头是浊辅音 /v/，读时上齿碰下唇、喉咙振动。' },
    { type: 'choice', q: '拼读单词 bag 时，开头的 b 应该读', options: ['/b/，短短一个音', '/biː/，也就是字母 B 的名字', '不发音'], answer: 0,
      explain: '拼读时用的是字母的“发音”而不是“名字”。b 在单词里只发 /b/，bag 读 /b/ + /æ/ + /g/，不是“毕-诶-机”。' },
    { type: 'fill', q: '补全单词（只填一个字母）：___et（兽医），开头读 /v/。', answer: ['v'],
      explain: '对照辅音发音表，/v/ 对应字母 v，兽医是 vet。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>y</u>es', '<u>y</u>ellow', '<u>j</u>am'], answer: 2,
      explain: 'y 在词首读 /j/，像“耶”的开头，yes、yellow 都是这样；jam 的 j 读 /dʒ/，像“基”的开头。' },
    { type: 'choice', q: '单词 queen 开头的 qu 读', options: ['/kw/，像“夸”的开头', '/k/，只读 k 的音', '/tʃ/，像“吃”的开头'], answer: 0,
      explain: 'q 后面几乎总跟着 u，qu 合起来读 /kw/，queen、quick 都是这样。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['ba<u>g</u>', '<u>g</u>ood', 'pa<u>g</u>e'], answer: 2,
      explain: 'page 的 g 在 e 前，读 /dʒ/；bag、good 的 g 读 /g/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>s</u>it', 'bu<u>s</u>', 'no<u>s</u>e'], answer: 2,
      explain: 'nose 的 s 夹在两个元音字母之间，读 /z/；sit、bus 的 s 读 /s/。' },
    { type: 'choice', q: '单词 six 结尾的 x 读', options: ['/ks/，两个音', '/z/，和 z 一样', '/eks/，字母 X 的名字'], answer: 0,
      explain: 'x 在单词里读 /ks/，一个字母两个音，six 读 /sɪks/，box、fox 也是这样；/eks/ 是字母 X 的名字，不是它在单词里的发音。' }
  ],
  tests: [
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'big', options: ['big', 'pig', 'bag'], answer: 0,
      explain: '听到的是 big，开头是浊辅音 /b/，喉咙振动；pig 的 /p/ 是清辅音；bag 中间的元音是 /æ/，不是 /ɪ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>g</u>o', '<u>g</u>ame', '<u>g</u>ym'], answer: 2,
      explain: 'gym 的 g 在 y 前读 /dʒ/；go、game 的 g 读 /g/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>c</u>ake', '<u>c</u>at', 'fa<u>c</u>e'], answer: 2,
      explain: 'face 的 c 在 e 前读 /s/；cake、cat 的 c 读 /k/。' },
    { type: 'choice', q: '单词 yes 开头的 y 读', options: ['/j/，像“耶”的开头', '/dʒ/，像“基”的开头', '/aɪ/，像“爱”'], answer: 0,
      explain: 'y 在词首读 /j/，yes 读起来像“耶斯”。' },
    { type: 'choice', q: '下面哪个单词的划线字母读 /ks/？', options: ['bo<u>x</u>', '<u>s</u>it', 'du<u>ck</u>'], answer: 0,
      explain: 'x 在词尾读 /ks/，box 读 /bɒks/；sit 的 s 读 /s/，duck 的 ck 读 /k/。' },
    { type: 'fill', q: '补全单词（只填一个字母）：___ox（狐狸），开头读 /f/。', answer: ['f'],
      explain: '/f/ 对应字母 f，狐狸是 fox。' },
    { type: 'fill', q: '补全单词（只填一个字母）：___am（果酱），开头读 /dʒ/。', answer: ['j'],
      explain: '/dʒ/ 在词首、后面是 a 时用字母 j，果酱是 jam。' },
    { type: 'choice', q: '拼读单词 pen，正确的读法是', options: ['/p/ + /e/ + /n/', '/piː/ + /iː/ + /en/', '/p/ + /iː/ + /n/'], answer: 0,
      explain: '拼读用字母的发音：p 发 /p/，闭音节里的 e 发 /e/，n 发 /n/；/piː/、/en/ 是字母的名字。' },
    { type: 'fill', q: '字母 M 的名字读 /em/，但在单词 map 里它只发___这个音。（照样子填音标，如 /b/）', answer: ['/m/', 'm'],
      explain: '字母名 ≠ 字母音：M 叫 /em/，在单词里只发 /m/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'wet', options: ['wet', 'vet', 'net'], answer: 0,
      explain: '听到的是 wet，w 读 /w/，嘴唇撅圆；vet 的 v 要上齿碰下唇。' },
    { type: 'fill', q: '补全单词（只填一个字母）：___ip（拉链），开头读 /z/。', answer: ['z'],
      explain: '/z/ 对应字母 z，拉链是 zip。' },
    { type: 'choice', q: '下面哪个单词的开头和 yes 的开头读音相同？', options: ['you', 'jump', 'gym'], answer: 0,
      explain: 'you 和 yes 都以 y 开头，读 /j/；jump 的 j 和 gym 的 g 都读 /dʒ/。' },
    { type: 'fill', q: '补全单词（只填一个字母）：___ou（你），开头读 /j/。', answer: ['y'],
      explain: '词首的 /j/ 一般写作 y，不是 j。“你”是 you。' },
    { type: 'fill', q: '补全单词（填两个字母）：___ick（快的），开头读 /kw/。', answer: ['qu'],
      explain: '/kw/ 写作 qu，快的是 quick。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /kw/？', options: ['<u>qu</u>een', '<u>c</u>ake', '<u>k</u>ite'], answer: 0,
      explain: 'queen 的 qu 读 /kw/；cake 的 c 和 kite 的 k 都只读 /k/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['si<u>x</u>', 'bo<u>x</u>', '<u>z</u>oo'], answer: 2,
      explain: 'six、box 的 x 读 /ks/；zoo 的 z 读 /z/。' },
    { type: 'fill', q: '补全单词（只填一个字母）：___ity（城市），开头读 /s/。', answer: ['c'],
      explain: 'c 在 i 前常读 /s/，城市是 city。读 /s/ 不一定写 s。' },
    { type: 'choice', q: '下面哪个单词的划线字母读 /dʒ/？', options: ['oran<u>g</u>e', '<u>g</u>o', 'do<u>g</u>'], answer: 0,
      explain: 'orange 的 g 在 e 前读 /dʒ/；go、dog 的 g 读 /g/。' },
    { type: 'choice', q: 'c 和 g 遇到哪些字母时，常常“变软”换声音？', options: ['e、i、y', 'a、o、u', 'b、d、t'], answer: 0,
      explain: 'c 和 g 在 e、i、y 前常变软：c 读 /s/（city、face），g 读 /dʒ/（gym、page）；在 a、o、u 前读 /k/、/g/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['ro<u>s</u>e', 'i<u>s</u>', 'ye<u>s</u>'], answer: 2,
      explain: 'yes 的 s 读 /s/；rose 的 s 在两个元音字母之间、is 的 s 在词尾，都读 /z/。' },
    { type: 'choice', q: '下面哪个单词的划线字母读 /z/？', options: ['mu<u>s</u>ic', '<u>s</u>ix', 'de<u>s</u>k'], answer: 0,
      explain: 'music 的 s 夹在元音字母 u、i 之间，读 /z/；six、desk 的 s 读 /s/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'fan', options: ['fan', 'van', 'man'], answer: 0,
      explain: '听到的是 fan，/f/ 是清辅音，喉咙不振动；van 的 /v/ 是浊辅音，喉咙振动；man 开头是鼻音 /m/，要闭上嘴唇。' },
    { type: 'choice', q: '下面哪一组是“清辅音—浊辅音”的配对？', options: ['/t/ — /d/', '/m/ — /n/', '/l/ — /r/'], answer: 0,
      explain: '/t/ 不振动、/d/ 振动，口型一样，是一对清浊辅音；/m/ /n/ /l/ /r/ 都是浊辅音。' }
  ]
},

/* ================= 短元音 ================= */
{
  id: 'p-short-vowels', title: '短元音与闭音节', short: '短元音', module: 'phonics', grade: 4, freq: 1,
  prereqs: ['p-letter-sounds'],
  tip: '短元音是拼读的第一步，听力中 bed / bad、cap / cup 这类单词要靠它区分。',
  learn: [
    { h: '什么是闭音节', html: `
      <p>“辅音 + 元音 + 辅音”，元音被两边的辅音“关”起来，这样的音节叫<b>闭音节</b>。闭音节里的元音字母读<b>短音</b>。</p>
      <div class="rhyme">辅元辅，关上门，元音短短读一声。</div>
      <p>例如 <span class="w">cat</span> = c + a + t，a 被关在中间，读短音 /æ/。</p>` },
    { h: '五个短元音', html: `
      <table class="tbl"><tr><th>字母</th><th>音标</th><th>怎么读</th><th>例词</th></tr>
      <tr><td>a</td><td>/æ/</td><td>嘴巴张大，像“哎”和“啊”之间</td><td><span class="w">cat</span> <span class="w">bag</span> <span class="w">map</span></td></tr>
      <tr><td>e</td><td>/e/</td><td>嘴巴半开，像“哎”</td><td><span class="w">bed</span> <span class="w">pen</span> <span class="w">red</span></td></tr>
      <tr><td>i</td><td>/ɪ/</td><td>短促的“衣”，嘴巴放松</td><td><span class="w">sit</span> <span class="w">big</span> <span class="w">six</span></td></tr>
      <tr><td>o</td><td>/ɒ/</td><td>嘴巴圆、短促，像“奥”</td><td><span class="w">dog</span> <span class="w">hot</span> <span class="w">box</span></td></tr>
      <tr><td>u</td><td>/ʌ/</td><td>嘴巴微开，短促的“阿”</td><td><span class="w">cup</span> <span class="w">bus</span> <span class="w">run</span></td></tr></table>
      <p class="warn">o 的短音美式英语读得更开，像“啊”，听到两种读法都是对的。</p>` },
    { h: '一组一组对比着读', html: `
      <ul>
        <li><span class="w">bad</span> — <span class="w">bed</span> — <span class="w">bid</span></li>
        <li><span class="w">cap</span> — <span class="w">cup</span></li>
        <li><span class="w">pen</span> — <span class="w">pin</span></li>
        <li><span class="w">hat</span> — <span class="w">hot</span> — <span class="w">hut</span></li></ul>
      <p class="ex">The red pen is in the big bag.<span class="zh">红色的钢笔在那个大包里。</span></p>
      <p class="ex">A black cat sat on the mat.<span class="zh">一只黑猫坐在垫子上。</span></p>` },
    { h: '小提醒', html: `
      <p>以 ck、ll、ss、ff 结尾的短单词，前面的元音也读短音：<span class="w">duck</span> <span class="w">bell</span> <span class="w">kiss</span> <span class="w">off</span>。</p>
      <p class="warn">也有少数例外，比如 <span class="w">put</span> 的 u 读 /ʊ/，不读 /ʌ/。遇到例外就单独记。</p>` }
  ],
  examples: [
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['c<u>a</u>t', 'b<u>a</u>g', 'c<u>a</u>ke'], answer: 2,
      explain: 'cake 的 a 后面有不发音的 e，读长音 /eɪ/；cat、bag 是闭音节，a 读 /æ/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'bed', options: ['bed', 'bad', 'bid'], answer: 0,
      explain: '听到的是 bed，元音 /e/ 嘴巴只半开；bad 的 /æ/ 嘴巴张得更大。' },
    { type: 'choice', q: '单词 sun 里的 u 为什么读短音 /ʌ/？', options: ['u 被 s 和 n 两个辅音夹在中间，是闭音节', 'u 在单词结尾', 'u 后面有不发音的 e'], answer: 0,
      explain: 'sun = s + u + n，“辅元辅”，元音被关在中间，是闭音节，读短音。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'sit', options: ['sit', 'set', 'sat'], answer: 0,
      explain: '听到的是 sit，i 读短促、放松的 /ɪ/；set 的 /e/ 嘴巴开得更大，sat 的 /æ/ 开得最大。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['h<u>o</u>t', 'b<u>o</u>x', 'g<u>o</u>'], answer: 2,
      explain: 'go 的 o 在词尾，是开音节，读长音 /əʊ/；hot、box 是闭音节，o 读短音。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'nut', options: ['nut', 'net', 'not'], answer: 0,
      explain: '听到的是 nut，u 读短促的 /ʌ/，嘴巴微开；net 的 /e/ 嘴巴半开，not 的 /ɒ/ 嘴巴圆。' },
    { type: 'choice', q: '单词 kiss 以 ss 结尾，其中的 i 读', options: ['短音 /ɪ/', '长音 /aɪ/', '不发音'], answer: 0,
      explain: '以 ck、ll、ss、ff 结尾的短单词，前面的元音读短音，kiss 的 i 读 /ɪ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['c<u>u</u>t', 'b<u>u</u>t', 'p<u>u</u>t'], answer: 2,
      explain: 'put 是例外，u 读 /ʊ/；cut、but 是规则的闭音节，u 读 /ʌ/。例外要单独记。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'sang', options: ['sang', 'sing', 'song'], answer: 0,
      explain: '这三个词只差中间的短元音：sang 的 a 读 /æ/，嘴巴张得最大；sing 的 i 读 /ɪ/，短促放松；song 的 o 读 /ɒ/，嘴巴圆。听到的是 sang。' }
  ],
  tests: [
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'cup', options: ['cup', 'cap', 'keep'], answer: 0,
      explain: '听到的是 cup，元音是短促的 /ʌ/；cap 的 a 读 /æ/，嘴巴张得更大，keep 的 ee 读长音 /iː/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['p<u>e</u>n', 'r<u>e</u>d', 'h<u>e</u>'], answer: 2,
      explain: 'he 的 e 在词尾，是开音节，读 /iː/；pen、red 是闭音节，e 读 /e/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['s<u>i</u>t', 'b<u>i</u>g', 'f<u>i</u>ve'], answer: 2,
      explain: 'five 的 i 读长音 /aɪ/；sit、big 的 i 读短音 /ɪ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['c<u>u</u>p', 'b<u>u</u>s', 'c<u>u</u>te'], answer: 2,
      explain: 'cute 词尾有不发音的 e，u 读 /juː/；cup、bus 的 u 读 /ʌ/。' },
    { type: 'choice', q: '下面哪个单词是“辅音 + 元音 + 辅音”的闭音节？', options: ['map', 'me', 'go'], answer: 0,
      explain: 'map = m + a + p，元音被两个辅音夹住，是闭音节；me、go 以元音结尾。' },
    { type: 'fill', q: '按读音拼写单词：/bɪg/（大的）', answer: ['big'],
      explain: '/b/ 是 b，/ɪ/ 是闭音节里的 i，/g/ 是 g，拼成 big。' },
    { type: 'fill', q: '按读音拼写单词：/ten/（十）', answer: ['ten'],
      explain: '/t/ 是 t，/e/ 是闭音节里的 e，/n/ 是 n，拼成 ten。' },
    { type: 'choice', q: '下面哪个单词不是闭音节？', options: ['she', 'bed', 'sit'], answer: 0,
      explain: 'she 以元音字母 e 结尾，元音没有被关住，不是闭音节；bed、sit 都是“辅元辅”。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'hat', options: ['hat', 'hot', 'hut'], answer: 0,
      explain: '听到的是 hat，a 读 /æ/，嘴巴张大，像“哎”和“啊”之间。' },
    { type: 'fill', q: '按读音拼写单词：/mæp/（地图）', answer: ['map'],
      explain: '/m/ 是 m，/æ/ 是闭音节里的 a，/p/ 是 p，拼成 map。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['b<u>a</u>d', 'm<u>a</u>p', 'n<u>a</u>me'], answer: 2,
      explain: 'name 是 a-e 结构，a 读 /eɪ/；bad、map 是闭音节，a 读 /æ/。' },
    { type: 'fill', q: '按读音拼写单词：/red/（红色的）', answer: ['red'],
      explain: '/r/ 是 r，/e/ 是闭音节里的 e，/d/ 是 d，拼成 red。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['s<u>i</u>x', 'p<u>i</u>g', 'h<u>i</u>'], answer: 2,
      explain: 'hi 的 i 在词尾，读 /aɪ/；six、pig 是闭音节，i 读 /ɪ/。' },
    { type: 'fill', q: '按读音拼写单词：/bɒks/（盒子）', answer: ['box'],
      explain: '/b/ 是 b，/ɒ/ 是闭音节里的 o，/ks/ 写成一个字母 x，拼成 box。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'lot', options: ['lot', 'let', 'lit'], answer: 0,
      explain: '听到的是 lot，o 读短音，嘴巴圆、短促（美式读得更开，像“啊”）；let 的 e 读 /e/，lit 的 i 读 /ɪ/。' },
    { type: 'fill', q: '按读音拼写单词：/rʌn/（跑）', answer: ['run'],
      explain: '/r/ 是 r，/ʌ/ 是闭音节里的 u，/n/ 是 n，拼成 run。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /ʌ/？', options: ['s<u>u</u>n', 'c<u>u</u>te', 'p<u>u</u>t'], answer: 0,
      explain: 'sun 是闭音节，u 读 /ʌ/；cute 的 u 读 /juː/，put 是例外，u 读 /ʊ/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'pen', options: ['pen', 'pin', 'pan'], answer: 0,
      explain: '听到的是 pen，e 读 /e/，嘴巴半开；pin 的 /ɪ/ 更扁更短，pan 的 /æ/ 嘴巴张得最大。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'cap', options: ['cap', 'cup', 'cake'], answer: 0,
      explain: '听到的是 cap，a 读 /æ/；cup 的 u 读 /ʌ/，cake 的 a 读长音 /eɪ/，结尾是 /k/。' },
    { type: 'choice', q: '下面哪个单词的元音读短音？', options: ['bell', 'bike', 'tree'], answer: 0,
      explain: 'bell 以 ll 结尾，e 读短音 /e/；bike 的 i 读 /aɪ/，tree 的 ee 读 /iː/。' },
    { type: 'fill', q: '补全单词（填两个字母）：o___（离开；关掉），结尾读 /f/。', answer: ['ff'],
      explain: '短单词结尾的 /f/ 常写成 ff，o 读短音，单词是 off。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['f<u>u</u>n', 's<u>u</u>n', 'f<u>u</u>ll'], answer: 2,
      explain: 'full 和 put 一样是例外，u 读 /ʊ/；fun、sun 的 u 读 /ʌ/。' }
  ]
},

/* ================= 长元音 ================= */
{
  id: 'p-long-vowels', title: '长元音与“不发音的 e”', short: '长元音', module: 'phonics', grade: 5, freq: 1,
  prereqs: ['p-short-vowels'],
  tip: '懂了“不发音的 e”，kit / kite、hop / hope 这类词听得准、拼得对，单词拼写少丢分。',
  learn: [
    { h: '魔法 e', html: `
      <p>单词结尾是“元音 + 辅音 + e”时，结尾的 e <b>自己不发音</b>，却让前面的元音读<b>字母本身的名字</b>，这就是长音。</p>
      <div class="rhyme">词尾 e 不出声，帮前元音念大名；<br>a 读 A，i 读 I，o 读 O，u 读 U。</div>
      <p><span class="w">kit</span> + e → <span class="w">kite</span>，<span class="w">cap</span> + e → <span class="w">cape</span></p>` },
    { h: '长音对照表', html: `
      <table class="tbl"><tr><th>组合</th><th>音标</th><th>例词</th></tr>
      <tr><td>a-e</td><td>/eɪ/</td><td><span class="w">cake</span> <span class="w">name</span> <span class="w">late</span></td></tr>
      <tr><td>i-e</td><td>/aɪ/</td><td><span class="w">bike</span> <span class="w">five</span> <span class="w">nice</span></td></tr>
      <tr><td>o-e</td><td>/əʊ/</td><td><span class="w">home</span> <span class="w">nose</span> <span class="w">note</span></td></tr>
      <tr><td>u-e</td><td>/juː/</td><td><span class="w">cute</span> <span class="w">use</span> <span class="w">huge</span></td></tr>
      <tr><td>e-e</td><td>/iː/</td><td><span class="w">these</span> <span class="w">Chinese</span></td></tr></table>
      <p class="warn">u-e 有时读 /uː/（没有前面的 /j/）：<span class="w">rule</span> <span class="w">June</span>。</p>` },
    { h: '开音节：元音在词尾', html: `
      <p>单词以元音字母结尾，元音没有被“关住”，也读长音：</p>
      <p><span class="w">he</span> <span class="w">me</span> <span class="w">we</span>（e 读 /iː/）　<span class="w">go</span> <span class="w">no</span> <span class="w">so</span>（o 读 /əʊ/）　<span class="w">hi</span>（i 读 /aɪ/）</p>
      <p class="ex">We go home at five.<span class="zh">我们五点回家。</span></p>` },
    { h: '短音长音对比', html: `
      <table class="tbl"><tr><th>短音（闭音节）</th><th>长音（加 e）</th></tr>
      <tr><td><span class="w">cap</span></td><td><span class="w">cape</span></td></tr>
      <tr><td><span class="w">kit</span></td><td><span class="w">kite</span></td></tr>
      <tr><td><span class="w">hop</span></td><td><span class="w">hope</span></td></tr>
      <tr><td><span class="w">not</span></td><td><span class="w">note</span></td></tr>
      <tr><td><span class="w">cut</span></td><td><span class="w">cute</span></td></tr></table>
      <p class="warn">也有例外：<span class="w">have</span> <span class="w">give</span> <span class="w">come</span> <span class="w">some</span> 虽然以 e 结尾，元音却不读长音，要单独记。</p>` }
  ],
  examples: [
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['n<u>a</u>me', 'l<u>a</u>te', 'h<u>a</u>t'], answer: 2,
      explain: 'hat 是闭音节，a 读 /æ/；name、late 是 a-e 结构，a 读 /eɪ/。' },
    { type: 'fill', q: 'kit 后面加上不发音的 e，变成 ___（风筝）。', answer: ['kite'],
      explain: '加 e 后 i 读字母名 /aɪ/，kit 变成 kite。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'note', options: ['note', 'not', 'nut'], answer: 0,
      explain: '听到的是 note，o-e 结构，o 读字母名 /əʊ/；not 是闭音节，o 读短音。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['c<u>u</u>te', '<u>u</u>se', 'J<u>u</u>ne'], answer: 2,
      explain: 'u-e 一般读 /juː/，如 cute、use；但有时读 /uː/，前面没有 /j/，如 June、rule。' },
    { type: 'choice', q: '单词 these 里的第一个 e 读', options: ['/iː/', '/e/', '不发音'], answer: 0,
      explain: 'these 是 e-e 结构，前面的 e 读字母名 /iː/，结尾的 e 不发音。' },
    { type: 'choice', q: '为什么 hi 里的 i 读 /aɪ/？', options: ['i 在单词结尾，是开音节', 'i 被两个辅音夹住', 'i 后面有不发音的 e'], answer: 0,
      explain: '元音字母在词尾，没有被辅音“关住”，是开音节，读长音（字母名）。he、go、hi 都是这样。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['h<u>o</u>pe', 'n<u>o</u>te', 'c<u>o</u>me'], answer: 2,
      explain: 'come 虽然以 e 结尾，o 却读 /ʌ/，是例外；hope、note 是规则的 o-e 结构，o 读 /əʊ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['b<u>i</u>ke', 'f<u>i</u>ve', 's<u>i</u>t'], answer: 2,
      explain: 'bike、five 是 i-e 结构，i 读字母名 /aɪ/；sit 是闭音节，i 读短音 /ɪ/。' },
    { type: 'choice', q: 'hop 后面加上 e 变成 hope，o 的读音怎样变化？', options: ['从短音变成长音 /əʊ/', '从长音变成短音', '不变'], answer: 0,
      explain: 'hop 是闭音节，o 读短音；加上不发音的 e 后，o 读字母名 /əʊ/。cap→cape、cut→cute 也是这样由短变长。' }
  ],
  tests: [
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'kite', options: ['kite', 'kit', 'cat'], answer: 0,
      explain: '听到的是 kite，i 读长音 /aɪ/，像“爱”。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'hope', options: ['hop', 'hope', 'hot'], answer: 1,
      explain: '听到的是 hope，o 读长音 /əʊ/；hop 的 o 是短音。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['h<u>o</u>me', 'n<u>o</u>se', 'd<u>o</u>g'], answer: 2,
      explain: 'dog 是闭音节，o 读短音；home、nose 是 o-e 结构，o 读 /əʊ/。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /aɪ/？', options: ['f<u>i</u>sh', 'l<u>i</u>ke', 's<u>i</u>x'], answer: 1,
      explain: 'like 是 i-e 结构，i 读 /aɪ/；fish、six 的 i 读 /ɪ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['m<u>e</u>', 'w<u>e</u>', 'l<u>e</u>g'], answer: 2,
      explain: 'leg 是闭音节，e 读 /e/；me、we 以 e 结尾，e 读 /iː/。' },
    { type: 'fill', q: 'cut 后面加上不发音的 e，变成 ___（可爱的）。', answer: ['cute'],
      explain: '加 e 后 u 读字母名 /juː/，cut 变成 cute。' },
    { type: 'fill', q: '按读音拼写单词（a-e 结构）：/keɪk/（蛋糕）', answer: ['cake'],
      explain: '/k/ 写作 c，/eɪ/ 用 a-e 结构，/k/ 写作 k，拼成 cake。' },
    { type: 'choice', q: '单词 cape 结尾的 e 读什么音？', options: ['不发音', '读 /iː/', '读 /e/'], answer: 0,
      explain: '“元音 + 辅音 + e”结尾时，e 自己不发音，只让前面的 a 读字母名 /eɪ/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'late', options: ['late', 'let', 'lot'], answer: 0,
      explain: '听到的是 late，a-e 结构，a 读 /eɪ/。' },
    { type: 'fill', q: 'cap 后面加上不发音的 e，变成 ___（披风）。', answer: ['cape'],
      explain: '加 e 后 a 读字母名 /eɪ/，cap 变成 cape。' },
    { type: 'fill', q: '按读音拼写单词（i-e 结构）：/faɪv/（五）', answer: ['five'],
      explain: '/f/ 是 f，/aɪ/ 用 i-e 结构，/v/ 是 v，拼成 five。' },
    { type: 'fill', q: 'not 后面加上不发音的 e，变成 ___（便条；笔记）。', answer: ['note'],
      explain: '加 e 后 o 读字母名 /əʊ/，not 变成 note。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /uː/，前面没有 /j/ 音？', options: ['r<u>u</u>le', 'c<u>u</u>te', 'h<u>u</u>ge'], answer: 0,
      explain: 'rule 的 u-e 读 /uː/；cute、huge 的 u-e 读 /juː/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'cute', options: ['cute', 'cut', 'cat'], answer: 0,
      explain: '听到的是 cute，u-e 结构，u 读 /juː/，像“优”；cut 的 u 是短音 /ʌ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['th<u>e</u>se', 'Chin<u>e</u>se', 'b<u>e</u>d'], answer: 2,
      explain: 'these、Chinese 的划线 e 在 e-e 结构里，读 /iː/；bed 是闭音节，e 读 /e/。' },
    { type: 'fill', q: '按读音拼写单词（e-e 结构）：/ðiːz/（这些）', answer: ['these'],
      explain: '/ð/ 写 th，/iː/ 用 e-e 结构，/z/ 写 s，拼成 these。' },
    { type: 'choice', q: '下面哪个单词以元音字母结尾、元音读长音？', options: ['so', 'sit', 'sun'], answer: 0,
      explain: 'so 以 o 结尾，是开音节，o 读 /əʊ/；sit、sun 是闭音节，读短音。' },
    { type: 'fill', q: '按读音拼写单词（开音节）：/gəʊ/（去）', answer: ['go'],
      explain: '/g/ 是 g，/əʊ/ 在词尾直接写 o，拼成 go。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'hop', options: ['hop', 'hope', 'hot'], answer: 0,
      explain: '听到的是 hop，o 读短音，短促；hope 的 o 读长音 /əʊ/。' },
    { type: 'choice', q: '下面哪一组是“短音—长音”的对比？', options: ['kit — kite', 'kit — cat', 'kite — like'], answer: 0,
      explain: 'kit 是闭音节，i 读短音 /ɪ/；加上 e 变成 kite，i 读长音 /aɪ/。另外两组不是加 e 前后的对比。' },
    { type: 'choice', q: '下面哪个单词虽然以 e 结尾，元音却不读长音？', options: ['give', 'five', 'nice'], answer: 0,
      explain: 'give 是例外，i 读短音 /ɪ/；five、nice 是规则的 i-e 结构，i 读 /aɪ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['h<u>a</u>ve', 'c<u>a</u>ke', 'n<u>a</u>me'], answer: 0,
      explain: 'have 是例外，a 读 /æ/；cake、name 是规则的 a-e 结构，a 读 /eɪ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['s<u>o</u>me', 'c<u>o</u>me', 'h<u>o</u>me'], answer: 2,
      explain: 'home 是规则的 o-e 结构，o 读 /əʊ/；some、come 是例外，o 读 /ʌ/。' }
  ]
},

/* ================= 元音组合 ================= */
{
  id: 'p-vowel-teams', title: '元音字母组合 ee/ea/ai/oa/oo/ar/er...', short: '元音组合', module: 'phonics', grade: 5, freq: 1,
  prereqs: ['p-long-vowels'],
  tip: '元音组合规律能帮你听音写词，听力中 ship / sheep 这类长短音对比也常出现。',
  learn: [
    { h: '两个元音一起走', html: `
      <div class="rhyme">两个元音并排走，前面那个开口说，<br>说的是它自己的名字，后面那个不出声。</div>
      <table class="tbl"><tr><th>组合</th><th>音标</th><th>例词</th></tr>
      <tr><td>ee / ea</td><td>/iː/</td><td><span class="w">see</span> <span class="w">tree</span> <span class="w">tea</span> <span class="w">eat</span></td></tr>
      <tr><td>ai / ay</td><td>/eɪ/</td><td><span class="w">rain</span> <span class="w">train</span> <span class="w">day</span> <span class="w">play</span></td></tr>
      <tr><td>oa / ow</td><td>/əʊ/</td><td><span class="w">boat</span> <span class="w">coat</span> <span class="w">snow</span> <span class="w">slow</span></td></tr>
      <tr><td>ie / igh</td><td>/aɪ/</td><td><span class="w">pie</span> <span class="w">tie</span> <span class="w">high</span> <span class="w">night</span></td></tr></table>
      <p class="warn">ea 有时读短音 /e/：<span class="w">head</span> <span class="w">bread</span>；ow 有时读 /aʊ/：<span class="w">cow</span> <span class="w">now</span>。</p>` },
    { h: 'oo、ou、oi', html: `
      <table class="tbl"><tr><th>组合</th><th>音标</th><th>例词</th></tr>
      <tr><td>oo（长）</td><td>/uː/</td><td><span class="w">food</span> <span class="w">moon</span> <span class="w">room</span></td></tr>
      <tr><td>oo（短，多在 k 前）</td><td>/ʊ/</td><td><span class="w">book</span> <span class="w">look</span> <span class="w">good</span></td></tr>
      <tr><td>ou / ow</td><td>/aʊ/</td><td><span class="w">house</span> <span class="w">mouth</span> <span class="w">cow</span> <span class="w">down</span></td></tr>
      <tr><td>oi / oy</td><td>/ɔɪ/</td><td><span class="w">coin</span> <span class="w">boy</span> <span class="w">toy</span></td></tr></table>` },
    { h: '元音 + r', html: `
      <table class="tbl"><tr><th>组合</th><th>音标</th><th>例词</th></tr>
      <tr><td>ar</td><td>/ɑː/</td><td><span class="w">car</span> <span class="w">park</span> <span class="w">farm</span></td></tr>
      <tr><td>or</td><td>/ɔː/</td><td><span class="w">fork</span> <span class="w">horse</span> <span class="w">short</span></td></tr>
      <tr><td>ir / ur</td><td>/ɜː/</td><td><span class="w">bird</span> <span class="w">girl</span> <span class="w">nurse</span> <span class="w">turn</span></td></tr>
      <tr><td>er（词尾）</td><td>/ə/</td><td><span class="w">teacher</span> <span class="w">sister</span> <span class="w">water</span></td></tr></table>
      <p>ir、ur 读音相同，听起来像拉长的“额”。写的时候要靠记单词决定用哪个。</p>` },
    { h: '读一读', html: `
      <p class="ex">I see a boat on the sea.<span class="zh">我看见海上有一条船。</span></p>
      <p class="ex">The girl reads a good book in her room.<span class="zh">那个女孩在她房间里读一本好书。</span></p>
      <p class="ex">My teacher has a car and a farm.<span class="zh">我的老师有一辆车和一个农场。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'sheep', options: ['sheep', 'ship', 'shop'], answer: 0,
      explain: '听到的是 sheep，ee 读长音 /iː/，要拉长；ship 的 i 是短音 /ɪ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['b<u>oo</u>k', 'l<u>oo</u>k', 'f<u>oo</u>d'], answer: 2,
      explain: 'food 的 oo 读长音 /uː/；book、look 的 oo 读短音 /ʊ/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'rain', options: ['rain', 'ran', 'run'], answer: 0,
      explain: '听到的是 rain，ai 读 /eɪ/，“两个元音并排走，前面那个读名字”，a 读字母名，i 不出声。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['b<u>oa</u>t', 'c<u>oa</u>t', 'c<u>ow</u>'], answer: 2,
      explain: 'boat、coat 的 oa 读 /əʊ/；cow 的 ow 读 /aʊ/。ow 有两种读音，要分开记。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /aɪ/？', options: ['n<u>igh</u>t', 's<u>ea</u>', 'r<u>ai</u>n'], answer: 0,
      explain: 'night 的 igh 读 /aɪ/（gh 不发音）；sea 的 ea 读 /iː/，rain 的 ai 读 /eɪ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['m<u>ea</u>t', 't<u>ea</u>ch', 'br<u>ea</u>d'], answer: 2,
      explain: 'ea 一般读 /iː/（meat、teach），但 bread、head 里的 ea 读短音 /e/，要单独记。' },
    { type: 'fill', q: '用 oi 补全单词：c___n（硬币）', answer: ['oi'],
      explain: '硬币是 coin，oi 读 /ɔɪ/，和 boy 的 oy 同音。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /ɑː/？', options: ['f<u>ar</u>m', 'b<u>ir</u>d', 'sh<u>or</u>t'], answer: 0,
      explain: 'farm 的 ar 读 /ɑː/，嘴巴张大像“啊”；bird 的 ir 读 /ɜː/，short 的 or 读 /ɔː/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'fork', options: ['fork', 'fox', 'farm'], answer: 0,
      explain: '听到的是 fork，or 读 /ɔː/，嘴巴圆、声音拉长；fox 的 o 是短音，farm 的 ar 读 /ɑː/，嘴巴张大像“啊”。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['g<u>ir</u>l', 't<u>ur</u>n', 'p<u>ar</u>k'], answer: 2,
      explain: 'girl 的 ir 和 turn 的 ur 读音相同，都是 /ɜː/；park 的 ar 读 /ɑː/。' },
    { type: 'choice', q: '单词 sister 结尾的 er 读', options: ['/ə/，轻轻带过', '/ɜː/，拉长', '/ɑː/，嘴巴张大'], answer: 0,
      explain: 'er 在词尾、不重读时读轻声 /ə/，teacher、water 也是这样。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'snow', options: ['snow', 'now', 'new'], answer: 0,
      explain: '听到的是 snow，这里的 ow 和 oa 一样读 /əʊ/，像“欧”。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /aʊ/？', options: ['m<u>ou</u>th', 'b<u>oa</u>t', 'f<u>oo</u>d'], answer: 0,
      explain: 'mouth 的 ou 读 /aʊ/，从“啊”滑到“乌”，和 cow、down 里的 ow 同音；boat 的 oa 读 /əʊ/，food 的 oo 读 /uː/。' }
  ],
  tests: [
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'park', options: ['park', 'pork', 'pick'], answer: 0,
      explain: '听到的是 park，ar 读 /ɑː/，嘴巴张大像“啊”。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['b<u>ir</u>d', 'n<u>ur</u>se', 'c<u>ar</u>'], answer: 2,
      explain: 'car 的 ar 读 /ɑː/；bird 的 ir 和 nurse 的 ur 都读 /ɜː/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['tr<u>ai</u>n', 'pl<u>ay</u>', 's<u>ee</u>'], answer: 2,
      explain: 'see 的 ee 读 /iː/；train 的 ai 和 play 的 ay 都读 /eɪ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['h<u>ou</u>se', 'c<u>ow</u>', 'sn<u>ow</u>'], answer: 2,
      explain: 'snow 的 ow 读 /əʊ/；house 的 ou 和 cow 的 ow 都读 /aʊ/。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /ɔɪ/？', options: ['b<u>oy</u>', 'b<u>oa</u>t', 'b<u>oo</u>k'], answer: 0,
      explain: 'oy 读 /ɔɪ/；boat 的 oa 读 /əʊ/，book 的 oo 读 /ʊ/。' },
    { type: 'fill', q: '用 oo 补全单词：m___n（月亮）', answer: ['oo'],
      explain: '月亮是 moon，oo 读长音 /uː/。' },
    { type: 'fill', q: '用 ai 补全单词：r___n（雨）', answer: ['ai'],
      explain: '雨是 rain，ai 读 /eɪ/。' },
    { type: 'fill', q: '用 ee 补全单词：tr___（树）', answer: ['ee'],
      explain: '树是 tree，ee 读 /iː/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'eat', options: ['eat', 'it', 'at'], answer: 0,
      explain: '听到的是 eat，ea 读长音 /iː/，要拉长；it 的 i 是短音 /ɪ/。' },
    { type: 'fill', q: '用 ay 补全单词：pl___（玩）', answer: ['ay'],
      explain: '玩是 play，ay 读 /eɪ/，和 ai 同音。' },
    { type: 'fill', q: '用 oa 补全单词：b___t（小船）', answer: ['oa'],
      explain: '小船是 boat，oa 读 /əʊ/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'coat', options: ['coat', 'cat', 'cut'], answer: 0,
      explain: '听到的是 coat，oa 读 /əʊ/，像“欧”。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['h<u>igh</u>', 'p<u>ie</u>', 's<u>ee</u>'], answer: 2,
      explain: 'high 的 igh 和 pie 的 ie 都读 /aɪ/；see 的 ee 读 /iː/。' },
    { type: 'fill', q: '用 igh 补全单词：n___t（夜晚）', answer: ['igh'],
      explain: '夜晚是 night，igh 读 /aɪ/，gh 不发音。' },
    { type: 'choice', q: '下面哪个单词的划线部分读短音 /e/？', options: ['h<u>ea</u>d', 't<u>ea</u>', '<u>ea</u>t'], answer: 0,
      explain: 'head 的 ea 是特殊读法，读短音 /e/；tea、eat 的 ea 读 /iː/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['br<u>ea</u>d', 'h<u>ea</u>d', 's<u>ea</u>'], answer: 2,
      explain: 'sea 的 ea 读 /iː/；bread、head 的 ea 读短音 /e/。' },
    { type: 'fill', q: '单词 bread 中的 ea 读长音 /iː/ 还是短音 /e/？（填“长”或“短”）', answer: ['短', '短音'],
      explain: 'bread 的 ea 读短音 /e/，是 ea 的特殊读法，和 head 一样。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /aʊ/？', options: ['d<u>ow</u>n', 'sl<u>ow</u>', 'b<u>oa</u>t'], answer: 0,
      explain: 'down 的 ow 读 /aʊ/；slow 的 ow 和 boat 的 oa 读 /əʊ/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'now', options: ['now', 'no', 'new'], answer: 0,
      explain: '听到的是 now，ow 读 /aʊ/，从“啊”滑到“乌”；no 的 o 读 /əʊ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['g<u>oo</u>d', 'b<u>oo</u>k', 'm<u>oo</u>n'], answer: 2,
      explain: 'moon 的 oo 读长音 /uː/；good、book 的 oo 读短音 /ʊ/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'look', options: ['look', 'like', 'lake'], answer: 0,
      explain: '听到的是 look，oo 在 k 前读短音 /ʊ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['c<u>oi</u>n', 't<u>oy</u>', 'c<u>oa</u>t'], answer: 2,
      explain: 'coin 的 oi 和 toy 的 oy 都读 /ɔɪ/；coat 的 oa 读 /əʊ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['p<u>ar</u>k', 'f<u>ar</u>m', 'h<u>or</u>se'], answer: 2,
      explain: 'horse 的 or 读 /ɔː/；park、farm 的 ar 读 /ɑː/。' },
    { type: 'fill', q: '用 ar 补全单词：c___（小汽车）', answer: ['ar'],
      explain: '小汽车是 car，ar 读 /ɑː/。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /ɔː/？', options: ['sh<u>or</u>t', 'c<u>ar</u>', 'g<u>ir</u>l'], answer: 0,
      explain: 'short 的 or 读 /ɔː/；car 的 ar 读 /ɑː/，girl 的 ir 读 /ɜː/。' },
    { type: 'fill', q: '用 or 补全单词：h___se（马）', answer: ['or'],
      explain: '马是 horse，or 读 /ɔː/。' },
    { type: 'fill', q: '用 ir 或 ur 补全单词：n___se（护士）', answer: ['ur'],
      explain: '护士是 nurse。ir、ur 都读 /ɜː/，写哪一个要靠记单词。' },
    { type: 'fill', q: '用 ir 或 ur 补全单词：g___l（女孩）', answer: ['ir'],
      explain: '女孩是 girl。ir、ur 读音相同，拼写要单独记。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['teach<u>er</u>', 'wat<u>er</u>', 'n<u>ur</u>se'], answer: 2,
      explain: 'nurse 的 ur 是重读的长音 /ɜː/；teacher、water 词尾的 er 读轻声 /ə/。' },
    { type: 'fill', q: '用 er 补全单词：sist___（姐妹）', answer: ['er'],
      explain: '姐妹是 sister，词尾 er 读 /ə/。' }
  ]
},

/* ================= 辅音组合 ================= */
{
  id: 'p-consonant-blends', title: '辅音字母组合 sh/ch/th/ph/ck/ng...', short: '辅音组合', module: 'phonics', grade: 5, freq: 1,
  prereqs: ['p-letter-sounds'],
  tip: '辅音组合决定单词开头和结尾的音，th、sh、ch 是听力辨音和拼写的高频难点。',
  learn: [
    { h: '两个字母读一个新音', html: `
      <table class="tbl"><tr><th>组合</th><th>音标</th><th>怎么读</th><th>例词</th></tr>
      <tr><td>sh</td><td>/ʃ/</td><td>像让人安静的“嘘”</td><td><span class="w">ship</span> <span class="w">fish</span> <span class="w">shop</span></td></tr>
      <tr><td>ch / tch</td><td>/tʃ/</td><td>像“吃”的开头，嘴唇往前噘</td><td><span class="w">chair</span> <span class="w">lunch</span> <span class="w">watch</span></td></tr>
      <tr><td>th</td><td>/θ/</td><td>舌尖轻咬，送气不振动</td><td><span class="w">think</span> <span class="w">three</span> <span class="w">bath</span></td></tr>
      <tr><td>th</td><td>/ð/</td><td>舌尖轻咬，喉咙振动</td><td><span class="w">this</span> <span class="w">that</span> <span class="w">mother</span></td></tr>
      <tr><td>ph</td><td>/f/</td><td>和 f 一样</td><td><span class="w">phone</span> <span class="w">photo</span></td></tr>
      <tr><td>ck</td><td>/k/</td><td>和 k 一样，常在短元音后</td><td><span class="w">duck</span> <span class="w">clock</span> <span class="w">back</span></td></tr>
      <tr><td>ng</td><td>/ŋ/</td><td>鼻子出声，像“嗯”的尾巴</td><td><span class="w">sing</span> <span class="w">long</span> <span class="w">king</span></td></tr>
      <tr><td>wh</td><td>/w/</td><td>和 w 一样</td><td><span class="w">what</span> <span class="w">when</span> <span class="w">white</span></td></tr></table>
      <p class="warn">th 千万别读成 /s/ 或 /z/：<span class="w">think</span> 不是 <span class="w">sink</span>。舌尖一定要伸到上下牙之间。</p>` },
    { h: '不发音的字母', html: `
      <ul>
        <li><b>kn</b> 里 k 不发音：<span class="w">know</span> <span class="w">knife</span> <span class="w">knee</span></li>
        <li><b>wr</b> 里 w 不发音：<span class="w">write</span> <span class="w">wrong</span></li>
        <li><b>wh</b> 在 o 前读 /h/：<span class="w">who</span> <span class="w">whose</span></li></ul>
      <div class="rhyme">k 遇 n 不出声，w 遇 r 也闭嘴。</div>` },
    { h: '辅音连缀：两个音都读', html: `
      <p>bl、cl、fl、gr、tr、st、sp、sw 这些组合，两个字母<b>各发各的音</b>，但要连得很紧，中间不能加元音：</p>
      <p><span class="w">black</span> <span class="w">clock</span> <span class="w">flag</span> <span class="w">green</span> <span class="w">tree</span> <span class="w">stop</span> <span class="w">swim</span></p>
      <p class="warn">不要把 <span class="w">stop</span> 读成“斯-陶-普”，s 和 t 之间没有元音。</p>` },
    { h: '读一读', html: `
      <p class="ex">She sells fish in the shop.<span class="zh">她在店里卖鱼。</span></p>
      <p class="ex">I think these three things are mine.<span class="zh">我觉得这三样东西是我的。</span></p>
      <p class="ex">The king can sing a long song.<span class="zh">国王会唱一首长长的歌。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>th</u>ink', '<u>th</u>ree', '<u>th</u>is'], answer: 2,
      explain: 'this 的 th 读浊音 /ð/；think、three 的 th 读清音 /θ/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'watch', options: ['watch', 'wash', 'was'], answer: 0,
      explain: '听到的是 watch，结尾的 tch 读 /tʃ/，有一个“t”的爆破感；wash 结尾的 sh 是持续的“嘘”，was 结尾是 /z/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'shop', options: ['shop', 'stop', 'top'], answer: 0,
      explain: '听到的是 shop，sh 读 /ʃ/，像让人安静的“嘘”，声音可以一直拉长；stop 开头是 /s/ + /t/ 两个音，top 开头只有 /t/。' },
    { type: 'choice', q: '单词 photo 开头的 ph 读', options: ['/f/，和 f 一样', '/p/，和 p 一样', '/p/ 和 /h/ 两个音'], answer: 0,
      explain: 'ph 两个字母合起来读一个新音 /f/，phone、photo 都是这样。' },
    { type: 'fill', q: '用 ck 补全单词：clo___（钟）', answer: ['ck'],
      explain: '钟是 clock，ck 读 /k/，常出现在短元音后面。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'thing', options: ['thing', 'thin', 'think'], answer: 0,
      explain: '听到的是 thing，ng 读鼻音 /ŋ/，像“嗯”的尾巴，后面不读出 /g/；thin 结尾是 /n/，think 结尾还有 /k/。' },
    { type: 'choice', q: '单词 white 开头的 wh 读', options: ['/w/，和 w 一样', '/h/，和 h 一样', '不发音'], answer: 0,
      explain: 'wh 一般读 /w/，what、when、white 都是这样。' },
    { type: 'choice', q: '单词 write 里哪个字母不发音？', options: ['w', 'r', 't'], answer: 0,
      explain: 'wr 里的 w 不发音，write 读 /raɪt/。口诀：k 遇 n 不出声，w 遇 r 也闭嘴。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>wh</u>at', '<u>wh</u>en', '<u>wh</u>o'], answer: 2,
      explain: 'wh 在 o 前读 /h/，who 读 /huː/；what、when 的 wh 读 /w/。' },
    { type: 'choice', q: '单词 stop 应该怎么读？', options: ['s 和 t 紧紧连在一起，中间没有元音', '读成“斯-陶-普”三个音节', 's 不发音，只读 top'], answer: 0,
      explain: 'st 是辅音连缀，两个音都要读，但要连得很紧，中间不能加元音，stop 只有一个音节。' },
    { type: 'choice', q: '单词 knee 里哪个字母不发音？', options: ['k', 'n', 'e'], answer: 0,
      explain: 'kn 里的 k 不发音，knee 读 /niː/，know、knife 也是这样。' }
  ],
  tests: [
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'think', options: ['think', 'sink', 'pink'], answer: 0,
      explain: '听到的是 think，th 读 /θ/，舌尖在上下牙之间。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>ch</u>air', 'lun<u>ch</u>', '<u>sh</u>ip'], answer: 2,
      explain: 'ship 的 sh 读 /ʃ/；chair、lunch 的 ch 读 /tʃ/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>ph</u>one', '<u>f</u>ish', '<u>v</u>an'], answer: 2,
      explain: 'van 的 v 读 /v/；phone 的 ph 和 fish 的 f 都读 /f/。' },
    { type: 'choice', q: '下面哪个单词里有一个不发音的字母？', options: ['know', 'now', 'net'], answer: 0,
      explain: 'know 的 k 不发音，know 和 no 读音相同。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['du<u>ck</u>', '<u>k</u>ite', '<u>ch</u>air'], answer: 2,
      explain: 'chair 的 ch 读 /tʃ/；duck 的 ck 和 kite 的 k 都读 /k/。' },
    { type: 'fill', q: '用一个辅音组合补全单词：___one（电话），开头读 /f/。', answer: ['ph'],
      explain: '电话是 phone，ph 读 /f/。' },
    { type: 'fill', q: '用一个辅音组合补全单词：fi___（鱼），结尾读 /ʃ/。', answer: ['sh'],
      explain: '鱼是 fish，sh 读 /ʃ/。' },
    { type: 'choice', q: '下面哪个单词的划线部分读 /ʃ/？', options: ['<u>sh</u>e', '<u>ch</u>air', '<u>s</u>ee'], answer: 0,
      explain: 'she 的 sh 读 /ʃ/；chair 的 ch 读 /tʃ/，see 的 s 读 /s/。' },
    { type: 'fill', q: '用 tch 补全单词：wa___（手表）', answer: ['tch'],
      explain: '手表是 watch，tch 和 ch 一样读 /tʃ/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'cheap', options: ['cheap', 'sheep', 'keep'], answer: 0,
      explain: '听到的是 cheap，ch 读 /tʃ/，有爆破感、嘴唇往前噘；sheep 的 sh 是持续的“嘘”，keep 的 k 只读 /k/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>th</u>at', 'mo<u>th</u>er', 'ba<u>th</u>'], answer: 2,
      explain: 'bath 的 th 读清音 /θ/；that、mother 的 th 读浊音 /ð/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'three', options: ['three', 'tree', 'free'], answer: 0,
      explain: '听到的是 three，th 读 /θ/，舌尖轻咬；tree 开头是 /t/，free 开头是 /f/。' },
    { type: 'choice', q: '读 th 时，舌头应该放在哪里？', options: ['舌尖轻轻伸到上下牙之间', '舌尖抵住上齿后面', '舌头缩在后面不动'], answer: 0,
      explain: 'th 的两个音 /θ/ /ð/ 都要咬舌：舌尖伸到上下牙之间，否则会读成 /s/ /z/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>ph</u>oto', '<u>ph</u>one', '<u>p</u>en'], answer: 2,
      explain: 'pen 的 p 读 /p/；photo、phone 的 ph 读 /f/。' },
    { type: 'fill', q: '用 ck 补全单词：ba___（后面；回来）', answer: ['ck'],
      explain: 'back 的 ck 读 /k/，跟在短元音 /æ/ 后面。' },
    { type: 'choice', q: '下面哪个单词以 /ŋ/ 结尾？', options: ['long', 'lot', 'line'], answer: 0,
      explain: 'long 以 ng 结尾，读鼻音 /ŋ/；lot 以 /t/ 结尾，line 以 /n/ 结尾。' },
    { type: 'fill', q: '用一个辅音组合补全单词：ki___（国王），结尾读 /ŋ/。', answer: ['ng'],
      explain: '/ŋ/ 写作 ng，国王是 king。' },
    { type: 'fill', q: '用 wh 补全单词：___en（什么时候）', answer: ['wh'],
      explain: '什么时候是 when，wh 读 /w/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['<u>wh</u>ite', '<u>w</u>et', '<u>h</u>at'], answer: 2,
      explain: 'white 的 wh 和 wet 的 w 都读 /w/；hat 的 h 读 /h/。' },
    { type: 'choice', q: '下面哪个单词的 k 不发音？', options: ['knife', 'kite', 'milk'], answer: 0,
      explain: 'kn 里的 k 不发音，knife 读 /naɪf/；kite、milk 的 k 都读 /k/。' },
    { type: 'choice', q: '下面哪个单词里的 w 不发音？', options: ['wrong', 'window', 'swim'], answer: 0,
      explain: 'wr 里的 w 不发音，wrong 开头读 /r/；window、swim 的 w 都读 /w/。' },
    { type: 'fill', q: '补全单词（填两个字母）：___ite（写），开头读 /r/。', answer: ['wr'],
      explain: '写是 write，wr 里的 w 不发音，只读 /r/。' },
    { type: 'choice', q: '单词 whose 开头的 wh 读', options: ['/h/', '/w/', '不发音'], answer: 0,
      explain: 'wh 在 o 前读 /h/，whose 和 who 都是这样。' },
    { type: 'choice', q: 'who 和下面哪个单词开头的读音相同？', options: ['how', 'what', 'where'], answer: 0,
      explain: 'who 的 wh 在 o 前读 /h/，和 how 的 h 相同；what、where 的 wh 读 /w/。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'black', options: ['black', 'back', 'bag'], answer: 0,
      explain: '听到的是 black，bl 是辅音连缀，/b/ 和 /l/ 两个音都要读出来，连得很紧；back 少了 /l/，bag 也没有 /l/，结尾还是 /g/。' },
    { type: 'choice', q: '下面哪个单词开头是“两个辅音各发各的音”的辅音连缀？', options: ['green', 'ship', 'phone'], answer: 0,
      explain: 'green 的 gr 读 /g/ + /r/，两个音都读；ship 的 sh、phone 的 ph 是两个字母合成一个新音。' }
  ]
},

/* ================= -s / -ed 读音 ================= */
{
  id: 'p-s-ed-sounds', title: '-s/-es 与 -ed 的读音', short: '-s/-ed 读音', module: 'phonics', grade: 6, freq: 1,
  prereqs: ['p-consonant-blends', 'g-plural', 'g-past-simple'],
  tip: '听力中靠 -s、-ed 的读音分辨单复数和时态；朗读时读准它们，口语也更地道。',
  learn: [
    { h: '先分清清浊', html: `
      <p>-s 和 -ed 怎么读，要看单词<b>最后一个音</b>（不是最后一个字母）是清辅音还是浊音：</p>
      <ul>
        <li>常见清辅音：/p/ /t/ /k/ /f/ /θ/ /s/ /ʃ/ /tʃ/ —— 读时喉咙不振动。</li>
        <li>浊音：/b/ /d/ /g/ /v/ /m/ /n/ /l/ 等浊辅音，以及<b>所有元音</b> —— 读时喉咙振动。</li></ul>` },
    { h: '-s / -es 的三种读音', html: `
      <table class="tbl"><tr><th>单词结尾的音</th><th>读作</th><th>例词</th></tr>
      <tr><td>清辅音 /p/ /t/ /k/ /f/</td><td>/s/</td><td><span class="w">maps</span> <span class="w">cats</span> <span class="w">books</span></td></tr>
      <tr><td>浊辅音、元音</td><td>/z/</td><td><span class="w">bags</span> <span class="w">pens</span> <span class="w">days</span> <span class="w">trees</span></td></tr>
      <tr><td>/s/ /z/ /ʃ/ /tʃ/ /dʒ/</td><td>/ɪz/</td><td><span class="w">buses</span> <span class="w">boxes</span> <span class="w">watches</span> <span class="w">oranges</span></td></tr></table>
      <div class="rhyme">清后读清 /s/，浊后读浊 /z/；<br>嘶嘶声后多一节，读作 /ɪz/ 不用愁。</div>
      <p class="warn">ts 读 /ts/（<span class="w">cats</span>），ds 读 /dz/（<span class="w">beds</span>），都要连在一起读。</p>` },
    { h: '-ed 的三种读音', html: `
      <table class="tbl"><tr><th>单词结尾的音</th><th>读作</th><th>例词</th></tr>
      <tr><td>清辅音（/t/ 除外）</td><td>/t/</td><td><span class="w">helped</span> <span class="w">looked</span> <span class="w">washed</span> <span class="w">watched</span></td></tr>
      <tr><td>浊辅音（/d/ 除外）、元音</td><td>/d/</td><td><span class="w">played</span> <span class="w">cleaned</span> <span class="w">lived</span> <span class="w">called</span></td></tr>
      <tr><td>/t/ 或 /d/</td><td>/ɪd/</td><td><span class="w">wanted</span> <span class="w">needed</span> <span class="w">visited</span></td></tr></table>
      <div class="rhyme">清清浊浊，t、d 后面加一节读 /ɪd/。</div>
      <p class="warn">只有 t、d 结尾时 -ed 才多读一个音节。<span class="w">looked</span> 是一个音节，不要读成“露克的”。</p>` },
    { h: '听一听，读一读', html: `
      <p class="ex">She washed the cups and cleaned the desks.<span class="zh">她洗了杯子，擦了课桌。</span></p>
      <p class="ex">He wanted two boxes of oranges.<span class="zh">他想要两箱橙子。</span></p>` }
  ],
  examples: [
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['book<u>s</u>', 'map<u>s</u>', 'bag<u>s</u>'], answer: 2,
      explain: 'bag 以浊辅音 /g/ 结尾，-s 读 /z/；book、map 以清辅音结尾，-s 读 /s/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['want<u>ed</u>', 'need<u>ed</u>', 'play<u>ed</u>'], answer: 2,
      explain: 'played 以元音结尾，-ed 读 /d/；wanted、needed 以 t、d 结尾，-ed 读 /ɪd/。' },
    { type: 'choice', q: '单词 cake 的最后一个字母是 e，加 -s 后 cakes 的 -s 读', options: ['/s/', '/z/', '/ɪz/'], answer: 0,
      explain: '要看最后一个“音”而不是最后一个字母。cake 的 e 不发音，最后一个音是清辅音 /k/，所以 -s 读 /s/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['box<u>es</u>', 'orang<u>es</u>', 'dog<u>s</u>'], answer: 2,
      explain: 'box 以 /s/ 音结尾、orange 以 /dʒ/ 结尾，都是“嘶嘶声”，-es 读 /ɪz/；dog 以浊辅音 /g/ 结尾，-s 读 /z/。' },
    { type: 'choice', q: '单词 beds 结尾的 ds 应该怎么读？', options: ['/dz/，两个音连在一起读', '/d/ 和 /s/ 分开读', '只读 /s/'], answer: 0,
      explain: 'bed 以浊辅音 /d/ 结尾，-s 读 /z/，和 d 连成 /dz/；同样 cats 的 ts 连成 /ts/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['wash<u>ed</u>', 'watch<u>ed</u>', 'liv<u>ed</u>'], answer: 2,
      explain: 'live 以浊辅音 /v/ 结尾，-ed 读 /d/；wash、watch 以清辅音 /ʃ/ /tʃ/ 结尾，-ed 读 /t/。' },
    { type: 'choice', q: 'looked 有几个音节？', options: ['一个', '两个', '三个'], answer: 0,
      explain: 'look 以 /k/ 结尾，-ed 只读一个 /t/，不多出音节，looked 读 /lʊkt/，只有一个音节。只有 t、d 结尾时 -ed 才多读一个音节。' },
    { type: 'choice', q: '单词 days 的 -s 读', options: ['/z/', '/s/', '/ɪz/'], answer: 0,
      explain: 'day 以元音 /eɪ/ 结尾，元音都是浊音，所以 -s 读浊音 /z/。规律：清后读 /s/，浊后读 /z/。' },
    { type: 'choice', q: '单词 cleaned 的 -ed 读', options: ['/d/', '/t/', '/ɪd/'], answer: 0,
      explain: 'clean 以浊辅音 /n/ 结尾，-ed 读 /d/，不多出音节；只有以 /t/ /d/ 结尾才读 /ɪd/。' }
  ],
  tests: [
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'played', options: ['played', 'plays', 'play'], answer: 0,
      explain: '听到的是 played，结尾有一个 /d/ 音。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['help<u>ed</u>', 'look<u>ed</u>', 'clean<u>ed</u>'], answer: 2,
      explain: 'clean 以浊辅音 /n/ 结尾，-ed 读 /d/；help、look 以清辅音结尾，-ed 读 /t/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['bus<u>es</u>', 'watch<u>es</u>', 'pen<u>s</u>'], answer: 2,
      explain: 'pens 的 -s 读 /z/；buses、watches 的 -es 读 /ɪz/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['cat<u>s</u>', 'desk<u>s</u>', 'day<u>s</u>'], answer: 2,
      explain: 'day 以元音结尾，-s 读 /z/；cat、desk 以清辅音结尾，-s 读 /s/。' },
    { type: 'choice', q: '下面哪个单词加 -ed 后多出一个音节？', options: ['visit', 'wash', 'stay'], answer: 0,
      explain: 'visit 以 /t/ 结尾，visited 的 -ed 读 /ɪd/，多一个音节；washed、stayed 不多音节。' },
    { type: 'fill', q: 'watched 的 -ed 读作 /t/、/d/ 还是 /ɪd/？（照样子填音标，如 /d/）', answer: ['/t/', 't'],
      explain: 'watch 以清辅音 /tʃ/ 结尾，-ed 读 /t/。' },
    { type: 'fill', q: 'boxes 的 -es 读作 /s/、/z/ 还是 /ɪz/？（照样子填音标，如 /s/）', answer: ['/ɪz/', 'ɪz', '/iz/', 'iz'],
      explain: 'box 以 /ks/ 结尾，最后是 /s/ 音，-es 读 /ɪz/。' },
    { type: 'choice', q: '单词 nose 以字母 e 结尾，但最后一个音是 /z/。noses 的 -s 读', options: ['/ɪz/', '/z/', '/s/'], answer: 0,
      explain: 'nose 的 e 不发音，最后一个音是 /z/，属于“嘶嘶声”，所以 -s 读 /ɪz/，noses 比 nose 多一个音节。' },
    { type: 'choice', q: '单词 laugh 以字母 h 结尾，但最后一个音是 /f/。laughs 的 -s 读', options: ['/s/', '/z/', '/ɪz/'], answer: 0,
      explain: 'gh 在这里读 /f/，最后一个音是清辅音，所以 -s 读 /s/。判断时看音，不看字母。' },
    { type: 'fill', q: 'maps 的 -s 读作 /s/、/z/ 还是 /ɪz/？（照样子填音标，如 /z/）', answer: ['/s/', 's'],
      explain: 'map 以清辅音 /p/ 结尾，-s 读 /s/。' },
    { type: 'choice', q: '下面哪个单词的 -s 读 /z/？', options: ['trees', 'books', 'cups'], answer: 0,
      explain: 'tree 以元音 /iː/ 结尾，-s 读 /z/；book、cup 以清辅音结尾，-s 读 /s/。' },
    { type: 'fill', q: 'bags 的 -s 读作 /s/、/z/ 还是 /ɪz/？（照样子填音标，如 /s/）', answer: ['/z/', 'z'],
      explain: 'bag 以浊辅音 /g/ 结尾，-s 读 /z/。' },
    { type: 'choice', q: '下面哪个单词加 -s 或 -es 后多出一个音节？', options: ['watch', 'book', 'pen'], answer: 0,
      explain: 'watch 以 /tʃ/ 结尾，watches 的 -es 读 /ɪz/，多一个音节；books、pens 不多音节。' },
    { type: 'choice', q: '下面哪个单词结尾读 /ts/？', options: ['cats', 'cards', 'cars'], answer: 0,
      explain: 'cat 以 /t/ 结尾，加 -s 读 /ts/；cards 结尾读 /dz/，cars 结尾读 /z/。' },
    { type: 'choice', q: 'friends 结尾的 ds 读', options: ['/dz/', '/ts/', '/dɪz/'], answer: 0,
      explain: 'friend 以浊辅音 /d/ 结尾，-s 读 /z/，和 d 连读成 /dz/，不多出音节。' },
    { type: 'choice', q: '下面哪个单词的 -ed 读 /t/？', options: ['jumped', 'played', 'wanted'], answer: 0,
      explain: 'jump 以清辅音 /p/ 结尾，-ed 读 /t/；played 读 /d/，wanted 读 /ɪd/。' },
    { type: 'fill', q: 'lived 的 -ed 读作 /t/、/d/ 还是 /ɪd/？（照样子填音标，如 /t/）', answer: ['/d/', 'd'],
      explain: 'live 的 e 不发音，最后一个音是浊辅音 /v/，-ed 读 /d/。' },
    { type: 'choice', q: '选出划线部分读音不同的一项。', options: ['call<u>ed</u>', 'stay<u>ed</u>', 'ask<u>ed</u>'], answer: 2,
      explain: 'ask 以清辅音 /k/ 结尾，-ed 读 /t/；call 以浊辅音 /l/ 结尾、stay 以元音结尾，-ed 读 /d/。' },
    { type: 'fill', q: 'needed 的 -ed 读作 /t/、/d/ 还是 /ɪd/？（照样子填音标，如 /t/）', answer: ['/ɪd/', 'ɪd', '/id/', 'id'],
      explain: 'need 以 /d/ 结尾，-ed 读 /ɪd/，多出一个音节。' },
    { type: 'choice', q: '听一听，选出你听到的单词。', say: 'wanted', options: ['wanted', 'wants', 'want'], answer: 0,
      explain: '听到的是 wanted，结尾多了一个音节 /ɪd/。' },
    { type: 'choice', q: '下面哪个单词加 -ed 后仍然只有一个音节？', options: ['jump', 'paint', 'end'], answer: 0,
      explain: 'jumped 的 -ed 读 /t/，不多出音节；paint、end 以 t、d 结尾，painted、ended 的 -ed 读 /ɪd/，多出一个音节。' },
    { type: 'choice', q: '关于 washed 的读法，正确的是', options: ['只有一个音节，结尾读 /t/', '读成两个音节 wash-ed', '结尾读 /ɪd/'], answer: 0,
      explain: 'wash 以清辅音 /ʃ/ 结尾，-ed 读 /t/，washed 读 /wɒʃt/，只有一个音节。' }
  ]
},

/* ================= 国际音标 ================= */
{
  id: 'p-ipa', title: '国际音标', short: '国际音标', module: 'phonics', grade: 7, freq: 2,
  prereqs: ['p-vowel-teams', 'p-consonant-blends'],
  tip: '会认音标就能自己查词典读准生词；听力和单词拼写都离不开它。',
  learn: [
    { h: '48 个音标', html: `
      <p>英语有 <b>48 个音素</b>：20 个元音 + 28 个辅音。课本和词典里的音标写在两条斜线 / / 中间。</p>
      <ul>
        <li><b>ː</b> 表示长音：/iː/ 比 /ɪ/ 长。</li>
        <li><b>ˈ</b> 表示重音，标在重读音节的左上方：/ˈteɪbl/ 重音在第一个音节。</li></ul>
      <p class="warn">课本用的是英式音标，美式词典有些写法不同（比如 /əʊ/ 写成 /oʊ/），不用慌。</p>` },
    { h: '元音（20 个）', html: `
      <table class="tbl"><tr><th>类型</th><th>音标</th><th>例词</th></tr>
      <tr><td>长元音</td><td>/iː/ /ɑː/ /ɔː/ /uː/ /ɜː/</td><td><span class="w">see</span> <span class="w">car</span> <span class="w">fork</span> <span class="w">food</span> <span class="w">bird</span></td></tr>
      <tr><td>短元音</td><td>/ɪ/ /e/ /æ/ /ʌ/ /ɒ/ /ʊ/ /ə/</td><td><span class="w">sit</span> <span class="w">bed</span> <span class="w">cat</span> <span class="w">cup</span> <span class="w">dog</span> <span class="w">book</span> <span class="w">teacher</span></td></tr>
      <tr><td>双元音</td><td>/eɪ/ /aɪ/ /ɔɪ/ /əʊ/ /aʊ/</td><td><span class="w">cake</span> <span class="w">bike</span> <span class="w">boy</span> <span class="w">home</span> <span class="w">house</span></td></tr>
      <tr><td>双元音</td><td>/ɪə/ /eə/ /ʊə/</td><td><span class="w">ear</span> <span class="w">hair</span> <span class="w">tour</span></td></tr></table>
      <p>双元音是从一个音<b>滑</b>到另一个音，比如 /aɪ/ 从“啊”滑到“衣”。</p>` },
    { h: '最容易认错的辅音', html: `
      <table class="tbl"><tr><th>音标</th><th>别看错</th><th>例词</th></tr>
      <tr><td>/j/</td><td>读“耶”的开头，不是字母 j</td><td><span class="w">yes</span> <span class="w">you</span></td></tr>
      <tr><td>/dʒ/</td><td>才是字母 j 的音</td><td><span class="w">jam</span> <span class="w">orange</span></td></tr>
      <tr><td>/ʃ/ /ʒ/</td><td>/ʃ/ 像“嘘”；/ʒ/ 是它的浊音</td><td><span class="w">she</span> <span class="w">usually</span></td></tr>
      <tr><td>/tʃ/</td><td>像“吃”的开头</td><td><span class="w">chair</span> <span class="w">watch</span></td></tr>
      <tr><td>/θ/ /ð/</td><td>都要咬舌</td><td><span class="w">thank</span> <span class="w">mother</span></td></tr>
      <tr><td>/ŋ/</td><td>鼻音，不是 n 加 g</td><td><span class="w">sing</span> <span class="w">long</span></td></tr></table>` },
    { h: '音标和拼读规则对上号', html: `
      <p>学过的拼读规则，其实就是“字母 → 音标”的对应：</p>
      <ul>
        <li><span class="w">cake</span> /keɪk/：a-e 读 /eɪ/</li>
        <li><span class="w">sheep</span> /ʃiːp/：sh 读 /ʃ/，ee 读 /iː/</li>
        <li><span class="w">thank</span> /θæŋk/：th 读 /θ/，n 在 k 前读 /ŋ/</li></ul>
      <div class="rhyme">见到音标先拆开，一个符号一个音；<br>拼读规则来帮忙，生词也能拼出来。</div>` }
  ],
  examples: [
    { type: 'choice', q: '根据音标 /ʃiːp/ 选出单词。', options: ['ship', 'sheep', 'cheap'], answer: 1,
      explain: '/ʃ/ 是 sh，/iː/ 是长音 ee，所以是 sheep；ship 是 /ʃɪp/，cheap 是 /tʃiːp/。' },
    { type: 'fill', q: '根据音标写单词：/neɪm/（名字）', answer: ['name'],
      explain: '/n/ 写 n，/eɪ/ 用 a-e 结构，/m/ 写 m，拼成 name。' },
    { type: 'choice', q: '英语的 48 个音素由哪两部分组成？', options: ['20 个元音 + 28 个辅音', '26 个元音 + 22 个辅音', '5 个元音 + 21 个辅音'], answer: 0,
      explain: '48 个音素 = 20 个元音 + 28 个辅音。“5 个元音 + 21 个辅音”说的是 26 个字母，别把字母和音素弄混。' },
    { type: 'choice', q: '音标 /ˈteɪbl/ 中的符号 ˈ 表示', options: ['它后面的音节要重读', '它前面是长音', '这里要停顿'], answer: 0,
      explain: 'ˈ 是重音符号，标在重读音节的左上方，table 重读第一个音节；长音符号是 ː。' },
    { type: 'choice', q: '在美式词典里看到 /hoʊm/，它和课本上的哪个音标是同一个词？', options: ['/həʊm/', '/hɒm/', '/huːm/'], answer: 0,
      explain: '课本用英式音标 /əʊ/，美式词典写成 /oʊ/，/hoʊm/ 和 /həʊm/ 都是 home。' },
    { type: 'choice', q: '下面哪个音标是短元音？', options: ['/ʊ/', '/uː/', '/ɔː/'], answer: 0,
      explain: '/ʊ/ 没有长音符号 ː，是短元音，如 book；/uː/、/ɔː/ 带 ː，是长元音。' },
    { type: 'choice', q: '根据音标 /heə/ 选出单词。', options: ['hair', 'her', 'here'], answer: 0,
      explain: '/eə/ 是双元音，从 /e/ 滑向 /ə/，对应 hair；her 是 /hɜː/，here 是 /hɪə/。' },
    { type: 'choice', q: '根据音标 /tʃeə/ 选出单词。', options: ['chair', 'share', 'cheer'], answer: 0,
      explain: '/tʃ/ 像“吃”的开头，对应 ch，元音 /eə/，所以是 chair；share 开头是 /ʃ/，cheer 的元音是 /ɪə/。' },
    { type: 'choice', q: '音标 /sɪŋ/ 对应的单词是', options: ['sing', 'sink', 'sign'], answer: 0,
      explain: '/ŋ/ 是鼻音，对应 ng，不是 n 加 g，所以是 sing；sink 是 /sɪŋk/，结尾还有 /k/，sign 是 /saɪn/。' },
    { type: 'choice', q: '根据音标 /nəʊz/ 选出单词。', options: ['nose', 'noise', 'news'], answer: 0,
      explain: '/əʊ/ 是双元音，对应 o-e 结构，所以是 nose（美式词典写 /noʊz/）；noise 是 /nɔɪz/，news 是 /njuːz/（美式 /nuːz/）。' },
    { type: 'choice', q: '下面哪个单词含有长元音 /ɜː/？', options: ['girl', 'car', 'cup'], answer: 0,
      explain: '/ɜː/ 是长元音，对应 ir、ur，girl 的 ir 读 /ɜː/；car 的 ar 读另一个长元音 /ɑː/，cup 的 u 读短元音 /ʌ/。' },
    { type: 'choice', q: '根据音标 /juː/ 选出单词。', options: ['you', 'juice', 'zoo'], answer: 0,
      explain: '音标 /j/ 读“耶”的开头，对应字母 y，所以是 you；juice 开头是 /dʒ/，那才是字母 j 的音。' },
    { type: 'choice', q: '根据音标 /ˈmʌðə/ 选出单词。', options: ['mother', 'mouse', 'Monday'], answer: 0,
      explain: '/ð/ 要咬舌、喉咙振动，对应 th，所以是 mother；/θ/ 是它的清音，如 thank。' }
  ],
  tests: [
    { type: 'choice', q: '听一听，选出这个单词的音标。', say: 'thank', options: ['/θæŋk/', '/sæŋk/', '/θɪŋk/'], answer: 0,
      explain: '听到的是 thank，开头咬舌 /θ/，元音是 /æ/；/θɪŋk/ 是 think。' },
    { type: 'choice', q: '根据音标 /bɜːd/ 选出单词。', options: ['bird', 'bed', 'bad'], answer: 0,
      explain: '/ɜː/ 是长元音，对应 ir，所以是 bird；bed 是 /bed/，bad 是 /bæd/。' },
    { type: 'choice', q: '根据音标 /jes/ 选出单词。', options: ['yes', 'yet', 'guess'], answer: 0,
      explain: '音标 /j/ 读“耶”的开头，对应字母 y，结尾 /s/ 是 s，所以是 yes；yet 是 /jet/，guess 是 /ges/。' },
    { type: 'choice', q: '音标中的符号 ː 表示什么？', options: ['长音', '重音', '不发音'], answer: 0,
      explain: 'ː 是长音符号，如 /iː/；重音符号是 ˈ。' },
    { type: 'choice', q: '下面哪个是双元音？', options: ['/aɪ/', '/ɪ/', '/iː/'], answer: 0,
      explain: '/aɪ/ 从“啊”滑到“衣”，是双元音；/ɪ/ 是短元音，/iː/ 是长元音。' },
    { type: 'fill', q: '根据音标写单词：/θæŋk/（谢谢）', answer: ['thank'],
      explain: '/θ/ 写 th，/æ/ 写 a，/ŋk/ 写 nk，拼成 thank。' },
    { type: 'choice', q: 'book 的音标是', options: ['/bʊk/', '/buːk/', '/bɔːk/'], answer: 0,
      explain: 'book 的 oo 读短音 /ʊ/，音标是 /bʊk/。' },
    { type: 'fill', q: '英语一共有___个音素。（填数字）', answer: ['48', 'forty-eight', 'forty eight'],
      explain: '英语有 48 个音素：20 个元音 + 28 个辅音。' },
    { type: 'fill', q: '英语的 48 个音素中，元音有___个。（填数字）', answer: ['20', 'twenty'],
      explain: '48 个音素里有 20 个元音、28 个辅音；元音字母才是 5 个。' },
    { type: 'choice', q: '下面哪一对音标主要是长短不同？', options: ['/iː/ — /ɪ/', '/iː/ — /aɪ/', '/ɪ/ — /e/'], answer: 0,
      explain: '/iː/ 带长音符号 ː，是长音；/ɪ/ 是对应的短音。/aɪ/ 是双元音，/e/ 是另一个短元音。' },
    { type: 'choice', q: '音标 /ˈæpl/ 的重音在', options: ['第一个音节', '第二个音节', '没有重音'], answer: 0,
      explain: 'ˈ 标在 æ 前面，重音在第一个音节，apple 读 AP-ple。' },
    { type: 'choice', q: '下面哪个音标的重音在第二个音节？', options: ['/bɪˈgɪn/', '/ˈhæpi/', '/ˈtiːtʃə/'], answer: 0,
      explain: 'ˈ 标在哪个音节前，哪个音节就重读。/bɪˈgɪn/（begin）的 ˈ 在第二个音节前；另外两个在第一个音节前。' },
    { type: 'choice', q: '课本上的 /əʊ/，在美式词典里常写成', options: ['/oʊ/', '/aʊ/', '/ɔɪ/'], answer: 0,
      explain: '英式 /əʊ/ 和美式 /oʊ/ 是同一个音的两种写法，如 go、home。' },
    { type: 'choice', q: '同一个单词在英式、美式词典里音标写法不同，说明', options: ['只是两种口音的写法不同，两个都对', '一定有一本词典印错了', '美式写法不能用'], answer: 0,
      explain: '英式、美式音标有些写法不同（比如 /əʊ/ 和 /oʊ/），两种都是正确的，不用慌。' },
    { type: 'choice', q: '根据音标 /fuːd/ 选出单词。', options: ['food', 'foot', 'feed'], answer: 0,
      explain: '/uː/ 是长元音，对应 oo，结尾 /d/，所以是 food；foot 是 /fʊt/，feed 是 /fiːd/。' },
    { type: 'choice', q: '根据音标 /kɑː/ 选出单词。', options: ['car', 'cow', 'cup'], answer: 0,
      explain: '/ɑː/ 是长元音，对应 ar，所以是 car；cow 是 /kaʊ/，cup 是 /kʌp/。' },
    { type: 'choice', q: '根据音标 /kʌp/ 选出单词。', options: ['cup', 'cap', 'keep'], answer: 0,
      explain: '/ʌ/ 是短元音，对应闭音节里的 u，所以是 cup；cap 是 /kæp/，keep 是 /kiːp/。' },
    { type: 'fill', q: '根据音标写单词：/bed/（床）', answer: ['bed'],
      explain: '/b/ 写 b，短元音 /e/ 写 e，/d/ 写 d，拼成 bed。' },
    { type: 'choice', q: '根据音标 /bɔɪ/ 选出单词。', options: ['boy', 'buy', 'bear'], answer: 0,
      explain: '/ɔɪ/ 是双元音，对应 oy，所以是 boy；buy 是 /baɪ/，bear 是 /beə/。' },
    { type: 'choice', q: '下面哪个单词含有双元音 /aʊ/？', options: ['house', 'horse', 'hot'], answer: 0,
      explain: 'house 的 ou 读 /aʊ/，从“啊”滑到“乌”；horse 的 or 读长元音 /ɔː/，hot 的 o 读短元音。' },
    { type: 'choice', q: '根据音标 /dʒæm/ 选出单词。', options: ['jam', 'gym', 'jump'], answer: 0,
      explain: '/dʒ/ 是字母 j 的音（音标 /j/ 对应的是字母 y），/æ/ 是 a，所以是 jam；gym 是 /dʒɪm/，jump 是 /dʒʌmp/。' },
    { type: 'choice', q: '音标 /j/ 对应的字母通常是', options: ['y', 'j', 'g'], answer: 0,
      explain: '音标 /j/ 读“耶”的开头，对应字母 y，如 yes、you；字母 j 的音标是 /dʒ/。' },
    { type: 'choice', q: '根据音标 /wɒtʃ/ 选出单词。', options: ['watch', 'wash', 'what'], answer: 0,
      explain: '结尾 /tʃ/ 像“吃”的开头，对应 tch，所以是 watch；wash 结尾是 /ʃ/，what 结尾是 /t/。' },
    { type: 'choice', q: '/ʒ/ 是哪个音的浊音？', options: ['/ʃ/', '/s/', '/tʃ/'], answer: 0,
      explain: '/ʃ/ 像“嘘”，喉咙振动就成了 /ʒ/，如 usually 里的 s。' },
    { type: 'choice', q: '根据音标 /ðɪs/ 选出单词。', options: ['this', 'these', 'thing'], answer: 0,
      explain: '/ð/ 是咬舌的浊音，/ɪ/ 是短元音，结尾 /s/，所以是 this；these 是 /ðiːz/，thing 是 /θɪŋ/。' },
    { type: 'choice', q: '根据音标 /θriː/ 选出单词。', options: ['three', 'tree', 'free'], answer: 0,
      explain: '/θ/ 是咬舌的清音，对应 th，所以是 three；tree 是 /triː/，free 是 /friː/。' },
    { type: 'choice', q: '下面哪个单词含有 /ŋ/？', options: ['long', 'line', 'nine'], answer: 0,
      explain: 'long 的 ng 读鼻音 /ŋ/；line、nine 里只有 /n/。' },
    { type: 'fill', q: '根据音标写单词：/sɒŋ/（歌曲）', answer: ['song'],
      explain: '/s/ 写 s，/ɒ/ 写 o，/ŋ/ 写 ng，拼成 song。' },
    { type: 'fill', q: '根据音标写单词：/ʃɪp/（船）', answer: ['ship'],
      explain: '/ʃ/ 写 sh，短元音 /ɪ/ 写 i，/p/ 写 p，拼成 ship。' }
  ]
},

/* ================= 重音与语调 ================= */
{
  id: 'p-stress-intonation', title: '重音、语调、连读与失去爆破', short: '重音与语调', module: 'phonics', grade: 7, freq: 2,
  prereqs: ['p-ipa'],
  tip: '语调能帮你在听力中听出说话人是在提问还是陈述；朗读和口语考试也看重音、语调是否自然。',
  learn: [
    { h: '单词重音', html: `
      <p>两个及以上音节的单词，有一个音节读得<b>更响、更长</b>，这就是重音，音标里用 ˈ 标出。</p>
      <table class="tbl"><tr><th>常见规律</th><th>例词（大写为重读音节）</th></tr>
      <tr><td>双音节名词、形容词多重读第一个音节</td><td><span class="w">teacher</span> TEA-cher，<span class="w">apple</span> AP-ple，<span class="w">happy</span> HAP-py</td></tr>
      <tr><td>以 a-、be- 开头的词多重读第二个音节</td><td><span class="w">ago</span> a-GO，<span class="w">begin</span> be-GIN，<span class="w">before</span> be-FORE</td></tr>
      <tr><td>-tion 结尾，重读它前面的音节</td><td><span class="w">information</span> in-for-MA-tion</td></tr>
      <tr><td>多音节词要单独记</td><td><span class="w">computer</span> com-PU-ter，<span class="w">banana</span> ba-NA-na</td></tr></table>
      <p class="warn">这些只是大致规律，拿不准就查词典看 ˈ 的位置。</p>` },
    { h: '句子语调', html: `
      <table class="tbl"><tr><th>句子类型</th><th>语调</th><th>例句</th></tr>
      <tr><td>一般疑问句</td><td>升调 ↗</td><td>Are you a student? ↗</td></tr>
      <tr><td>特殊疑问句</td><td>降调 ↘</td><td>What's your name? ↘</td></tr>
      <tr><td>陈述句、祈使句、感叹句</td><td>降调 ↘</td><td>I like music. ↘</td></tr>
      <tr><td>选择疑问句</td><td>前升后降</td><td>Tea ↗ or coffee? ↘</td></tr>
      <tr><td>反意疑问句</td><td>有把握用降调，没把握用升调</td><td>It's cold today, isn't it? ↘ / ↗</td></tr></table>
      <div class="rhyme">一般疑问往上扬，特殊疑问往下降；<br>陈述祈使感叹句，统统都用降调唱。</div>` },
    { h: '连读', html: `
      <p>前一个词以<b>辅音</b>结尾，后一个词以<b>元音</b>开头，两个词要连起来读：</p>
      <p class="ex">Get up!<span class="zh">起床！（读成 ge-tup）</span></p>
      <p class="ex">Have a look.<span class="zh">看一看。（读成 ha-va-look）</span></p>
      <p class="ex">Not at all.<span class="zh">一点也不。（读成 no-ta-tall）</span></p>` },
    { h: '失去爆破', html: `
      <p>/p/ /b/ /t/ /d/ /k/ /g/ 叫<b>爆破音</b>。一个爆破音后面紧跟另一个爆破音时，前一个只做出口型、不发出声，叫“失去爆破”。</p>
      <p class="ex">Sit down, please.<span class="zh">请坐。（sit 的 t 不爆破）</span></p>
      <p class="ex">This is a blackboard.<span class="zh">这是一块黑板。（black 的 k 不爆破）</span></p>
      <p class="ex">Good morning.<span class="zh">早上好。（爆破音 /d/ 后接 /m/，也只做口型）</span></p>
      <p class="warn">听力中失去爆破的音几乎听不见，要靠上下文判断，比如 <span class="w">sit</span> down 听起来像“si down”。</p>` }
  ],
  examples: [
    { type: 'choice', q: '下列单词中，重音在第二个音节的是', options: ['begin', 'apple', 'teacher'], answer: 0,
      explain: 'begin 读 be-GIN，重音在第二个音节；apple、teacher 重音在第一个音节。' },
    { type: 'choice', q: '“Do you like tea or coffee?” 应该怎么读？', options: ['前升后降', '全句升调', '全句降调'], answer: 0,
      explain: '选择疑问句在 or 前用升调，最后一个选项用降调。' },
    { type: 'choice', q: '单词里的重读音节，读起来应该', options: ['更响、更长', '更轻、更短', '和其他音节一样'], answer: 0,
      explain: '两个及以上音节的单词，有一个音节读得更响、更长，这就是重音，音标里用 ˈ 标出。' },
    { type: 'choice', q: '单词 information 的重音在哪个音节？', options: ['in-for-MA-tion', 'IN-for-ma-tion', 'in-for-ma-TION'], answer: 0,
      explain: '以 -tion 结尾的词，重音在 -tion 前面的那个音节，information 重读 ma。' },
    { type: 'choice', q: '“Is this your bag?” 一般用什么语调？', options: ['升调', '降调', '前升后降'], answer: 0,
      explain: '这是用 is 开头、可以用 yes / no 回答的一般疑问句，句末用升调。' },
    { type: 'choice', q: "“You are Tom's brother, aren't you?” 如果说话人很有把握，只是想让对方确认，句末用", options: ['降调', '升调', '前升后降'], answer: 0,
      explain: '反意疑问句：有把握、只求确认用降调；没把握、真想听对方回答用升调。' },
    { type: 'choice', q: '“Have a look.” 读的时候应该', options: ['连读，听起来像 ha-va-look', '每个词分开读，中间停顿', '把 a 省掉不读'], answer: 0,
      explain: 'have 结尾的 e 不发音，最后一个音是辅音 /v/，后面的 a 以元音开头，要连读成 ha-va，再接 look。' },
    { type: 'choice', q: '“I have a big bag.” 中 big 的 g 怎么读？', options: ['只做出口型，不爆破出声', '用力把 /g/ 读出来', '读成 /k/'], answer: 0,
      explain: '/g/ 后面紧跟爆破音 /b/，前一个 /g/ 失去爆破，只做口型不出声，听起来像“bi bag”。' },
    { type: 'choice', q: '听一听，这个单词的重音在哪个音节？', say: 'happy', options: ['HAP-py', 'hap-PY'], answer: 0,
      explain: 'happy 是双音节形容词，多数双音节名词、形容词重读第一个音节，所以读 HAP-py。' },
    { type: 'choice', q: '单词 September 的重音在哪个音节？', options: ['sep-TEM-ber', 'SEP-tem-ber', 'sep-tem-BER'], answer: 0,
      explain: 'September 这类多音节词没有简单规律，要单独记：重读第二个音节 TEM。拿不准就查词典看 ˈ 的位置。' },
    { type: 'choice', q: '“What day is it today?” 一般用什么语调？', options: ['降调', '升调', '前升后降'], answer: 0,
      explain: '用 what 等疑问词开头的特殊疑问句，句末用降调；不能用 yes / no 回答。' },
    { type: 'choice', q: '“My name is Lily.” 一般用什么语调？', options: ['降调', '升调', '前升后降'], answer: 0,
      explain: '这是陈述句。陈述句、祈使句、感叹句都用降调。' }
  ],
  tests: [
    { type: 'choice', q: '听一听，这个单词的重音在哪个音节？', say: 'computer', options: ['COM-pu-ter', 'com-PU-ter', 'com-pu-TER'], answer: 1,
      explain: 'computer 的重音在第二个音节 pu 上。' },
    { type: 'choice', q: '“Are you from Fujian?” 一般用什么语调？', options: ['升调', '降调', '前升后降'], answer: 0,
      explain: '这是一般疑问句，用升调。' },
    { type: 'choice', q: '“Where do you live?” 一般用什么语调？', options: ['升调', '降调', '前升后降'], answer: 1,
      explain: '这是用 where 提问的特殊疑问句，用降调。' },
    { type: 'choice', q: '下列单词中，重音在第一个音节的是', options: ['happy', 'ago', 'before'], answer: 0,
      explain: 'happy 读 HAP-py；ago、before 以 a-、be- 开头，重音在第二个音节。' },
    { type: 'choice', q: '下列短语中，哪一个需要连读（辅音接元音）？', options: ['get up', 'sit down', 'good boy'], answer: 0,
      explain: 'get 以辅音 /t/ 结尾，up 以元音开头，要连读；sit down 和 good boy 都是爆破音接爆破音，属于失去爆破。' },
    { type: 'fill', q: '一般疑问句通常读___调。（填“升”或“降”）', answer: ['升', '升调'],
      explain: '一般疑问句用升调，比如 Is this your book? ↗' },
    { type: 'fill', q: '“What a nice day!” 是感叹句，通常读___调。（填“升”或“降”）', answer: ['降', '降调'],
      explain: '陈述句、祈使句、感叹句都用降调。' },
    { type: 'choice', q: '听一听，这个单词的重音在哪个音节？', say: 'teacher', options: ['TEA-cher', 'tea-CHER'], answer: 0,
      explain: 'teacher 是双音节名词，重读第一个音节 TEA，读得更响更长。' },
    { type: 'choice', q: '音标中用哪个符号标出重音？', options: ['ˈ', 'ː', '/ /'], answer: 0,
      explain: 'ˈ 是重音符号，标在重读音节的左上方；ː 表示长音，/ / 用来把音标括起来。' },
    { type: 'choice', q: '下列单词中，重音在第一个音节的是', options: ['student', 'away', 'begin'], answer: 0,
      explain: 'student 是双音节名词，读 STU-dent；away、begin 以 a-、be- 开头，重音在第二个音节。' },
    { type: 'choice', q: '听一听，这个单词的重音在哪个音节？', say: 'before', options: ['BE-fore', 'be-FORE'], answer: 1,
      explain: 'before 以 be- 开头，重音在第二个音节 FORE。' },
    { type: 'choice', q: '下列单词中，重音在第二个音节的是', options: ['about', 'happy', 'apple'], answer: 0,
      explain: 'about 以 a- 开头，读 a-BOUT；happy、apple 重音在第一个音节。' },
    { type: 'choice', q: '单词 station 的重音在哪个音节？', options: ['STA-tion', 'sta-TION'], answer: 0,
      explain: '-tion 结尾的词重读 -tion 前面的音节，station 重读 STA。' },
    { type: 'choice', q: '听一听，这个单词的重音在哪个音节？', say: 'invitation', options: ['in-vi-TA-tion', 'IN-vi-ta-tion', 'in-VI-ta-tion'], answer: 0,
      explain: 'invitation 以 -tion 结尾，重音在它前面的音节 TA。' },
    { type: 'choice', q: '单词 banana 的重音在哪个音节？', options: ['ba-NA-na', 'BA-na-na', 'ba-na-NA'], answer: 0,
      explain: '多音节词的重音要单独记，banana 重读中间的 NA；拿不准就查词典看 ˈ 的位置。' },
    { type: 'choice', q: '下面哪个句子句末通常用升调？', options: ['Can you swim?', 'What can you do?', 'I can swim.'], answer: 0,
      explain: 'Can you swim? 是一般疑问句，用升调；What can you do? 是特殊疑问句，I can swim. 是陈述句，都用降调。' },
    { type: 'choice', q: '下面哪个句子句末通常用降调？', options: ['How old are you?', 'Are you twelve?', 'Do you like apples?'], answer: 0,
      explain: 'How old are you? 是用 how 提问的特殊疑问句，用降调；另外两句是一般疑问句，用升调。' },
    { type: 'choice', q: '“Please open the door.” 一般用什么语调？', options: ['降调', '升调', '前升后降'], answer: 0,
      explain: '这是祈使句，和陈述句、感叹句一样用降调。' },
    { type: 'choice', q: '“Is it red or blue?” 应该怎么读？', options: ['red 用升调，blue 用降调', 'red 用降调，blue 用升调', '全句都用升调'], answer: 0,
      explain: '选择疑问句前升后降：or 前面的选项用升调，最后一个选项用降调。' },
    { type: 'choice', q: '下面哪个句子要读成“前升后降”？', options: ['Would you like rice or noodles?', 'Would you like some rice?', 'What would you like?'], answer: 0,
      explain: '有 or 连接两个选项的选择疑问句前升后降；Would you like some rice? 是一般疑问句用升调，What would you like? 是特殊疑问句用降调。' },
    { type: 'choice', q: "“It's a fine day, isn't it?” 如果说话人没有把握，真想听对方的回答，句末用", options: ['升调', '降调', '前升后降'], answer: 0,
      explain: '反意疑问句没把握时用升调，有把握时用降调。' },
    { type: 'choice', q: '反意疑问句句末用升调还是降调，主要看', options: ['说话人有没有把握', '句子的长短', '句子里有没有 not'], answer: 0,
      explain: '反意疑问句：有把握、只求确认用降调；没把握、真想知道答案用升调。' },
    { type: 'choice', q: '下列短语中，哪一个需要连读（辅音接元音）？', options: ['an apple', 'big bag', 'red car'], answer: 0,
      explain: 'an 以辅音 /n/ 结尾，apple 以元音开头，要连读成 a-napple；另外两个是辅音接辅音。' },
    { type: 'choice', q: '下面哪一处要连读？', options: ['pick it up', 'good night', 'blackboard'], answer: 0,
      explain: 'pick 以辅音结尾接元音开头的 it，it 又接 up，都要连读；good night、blackboard 是爆破音后接辅音，属于失去爆破。' },
    { type: 'choice', q: '下列短语中，哪一个有失去爆破？', options: ['sit down', 'get up', 'look at'], answer: 0,
      explain: 'sit 的 /t/ 后面紧跟爆破音 /d/，/t/ 失去爆破；get up、look at 是辅音接元音，要连读。' },
    { type: 'choice', q: '单词 blackboard 中哪个音失去爆破？', options: ['black 的 /k/', 'board 的 /b/', 'board 的 /d/'], answer: 0,
      explain: '/k/ 后面紧跟爆破音 /b/，/k/ 只做口型不出声；board 的 /b/ 照常爆破。' },
    { type: 'choice', q: '/p/ /b/ /t/ /d/ /k/ /g/ 这六个音叫', options: ['爆破音', '鼻音', '元音'], answer: 0,
      explain: '这六个音叫爆破音。一个爆破音后紧跟另一个爆破音时，前一个只做口型，叫失去爆破。' }
  ]
}

);
