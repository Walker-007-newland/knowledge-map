// 第 3～6 阶段·组 G（专业英语）：架构常用英文术语、专业英语完形填空（短文均为原创）
(function () {

// 完形填空短文：(n) 处为空
var P1 = 'Every software system has an architecture, whether it is designed on purpose or not. The architecture describes how a system is ____(1)____ into components and how these components interact. Good architects make important decisions early, because such decisions are expensive to ____(2)____ later. For example, a layered style makes it easier to replace one layer without ____(3)____ the others, but too many layers may reduce performance. Architects therefore need to ____(4)____ between competing quality attributes such as performance, security and modifiability.';

var P2 = 'Microservice architecture structures an application as a set of small services, each running in its own ____(1)____ and communicating through lightweight mechanisms such as HTTP APIs or messages. Each service is built around a business capability and can be deployed ____(2)____ of the others. However, this style also brings new ____(3)____. Calls that used to happen inside one process now travel over the network, so developers must handle latency and partial failure. Patterns such as the circuit breaker help prevent one failing service from causing a ____(4)____ failure across the whole system. In addition, keeping data ____(5)____ across several services usually relies on eventual consistency rather than distributed transactions.';

var P3 = 'Cloud computing delivers computing resources such as servers, storage and networks as services over the Internet. Users can obtain resources on ____(1)____ and pay only for what they use. In the IaaS model, the provider manages the physical ____(2)____, while the user is responsible for the operating system and applications. SaaS goes further: users simply access complete applications through a web ____(3)____. A key feature of the cloud is elasticity, which means resources can be added automatically when the load increases and ____(4)____ when the load drops. Cloud-native applications are usually packaged in ____(5)____ and managed by orchestration platforms such as Kubernetes.';

var P4 = 'Information security aims to protect the confidentiality, ____(1)____ and availability of data. Confidentiality ensures that information is not disclosed to unauthorized users, while integrity ensures that data is not ____(2)____ without permission. Symmetric algorithms use the same key for encryption and decryption, whereas asymmetric algorithms use a pair of keys: a public key and a ____(3)____ key. To prove who sent a message, the sender can create a digital ____(4)____ with the private key, and anyone can verify it with the matching public key. Besides technical measures, a defense-in-depth strategy combines firewalls, intrusion detection, access control and security ____(5)____, so that the failure of a single measure does not expose the entire system.';

function cz(p, n) {
  var mark = '____(' + n + ')____';
  return '阅读下面的短文，选择最合适的词或短语填入第 (' + n + ') 空。<div class="scroll"><p lang="en">' + p.replace(mark, '<b>' + mark + '</b>') + '</p></div>';
}

RK.nodes.push(

/* ======================= 架构常用英文术语 ======================= */
{
  id: 'en-terms', module: 'eng', title: '架构常用英文术语', short: '英文术语', freq: 2,
  keywords: 'English 专业英语 词汇 术语 architecture availability scalability cloud security',
  tip: '综合知识最后约 5 道是专业英语，读懂关键术语就能拿分；常考质量属性、云计算、安全相关的词，要分清意思相近的词。',
  learn: [
    { h: '架构与质量属性', html: `
<table class="tbl"><tr><th>英文</th><th>中文</th></tr>
<tr><td>architecture style / pattern</td><td>架构风格 / 模式</td></tr>
<tr><td>component / connector</td><td>构件 / 连接件</td></tr>
<tr><td>view / viewpoint</td><td>视图 / 视点</td></tr>
<tr><td>stakeholder</td><td>利益相关者（干系人）</td></tr>
<tr><td>quality attribute</td><td>质量属性</td></tr>
<tr><td>availability</td><td>可用性</td></tr>
<tr><td>reliability</td><td>可靠性</td></tr>
<tr><td>scalability</td><td>可伸缩性（可扩展性）</td></tr>
<tr><td>modifiability / maintainability</td><td>可修改性 / 可维护性</td></tr>
<tr><td>interoperability</td><td>互操作性</td></tr>
<tr><td>usability</td><td>易用性</td></tr>
<tr><td>testability / portability</td><td>可测试性 / 可移植性</td></tr>
<tr><td>throughput / latency</td><td>吞吐量 / 延迟</td></tr>
<tr><td>trade-off / sensitivity point</td><td>权衡 / 敏感点</td></tr>
<tr><td>coupling / cohesion</td><td>耦合 / 内聚</td></tr>
<tr><td>encapsulation / inheritance / polymorphism</td><td>封装 / 继承 / 多态</td></tr></table>
<p class="warn">availability（可用性：系统能不能正常提供服务）和 usability（易用性：好不好用）最容易混；scalability 指负载增长时能通过加资源来应对，不是“可修改性”。</p>` },
    { h: '云计算与分布式', html: `
<table class="tbl"><tr><th>英文</th><th>中文</th></tr>
<tr><td>virtualization</td><td>虚拟化</td></tr>
<tr><td>container / orchestration</td><td>容器 / 编排</td></tr>
<tr><td>microservice / service mesh</td><td>微服务 / 服务网格</td></tr>
<tr><td>serverless</td><td>无服务器</td></tr>
<tr><td>elasticity / on-demand</td><td>弹性 / 按需</td></tr>
<tr><td>load balancing</td><td>负载均衡</td></tr>
<tr><td>fault tolerance / failover</td><td>容错 / 故障切换</td></tr>
<tr><td>redundancy / replication</td><td>冗余 / 复制（副本）</td></tr>
<tr><td>consistency / eventual consistency</td><td>一致性 / 最终一致性</td></tr>
<tr><td>partition tolerance</td><td>分区容忍性</td></tr>
<tr><td>message queue / publish-subscribe</td><td>消息队列 / 发布-订阅</td></tr>
<tr><td>cache / cache hit ratio</td><td>缓存 / 缓存命中率</td></tr>
<tr><td>continuous integration / continuous delivery</td><td>持续集成 / 持续交付</td></tr></table>` },
    { h: '安全与软件工程', html: `
<table class="tbl"><tr><th>英文</th><th>中文</th></tr>
<tr><td>confidentiality / integrity</td><td>机密性 / 完整性</td></tr>
<tr><td>authentication / authorization</td><td>身份认证 / 授权</td></tr>
<tr><td>encryption / decryption</td><td>加密 / 解密</td></tr>
<tr><td>digital signature / certificate</td><td>数字签名 / 数字证书</td></tr>
<tr><td>firewall / intrusion detection</td><td>防火墙 / 入侵检测</td></tr>
<tr><td>vulnerability / malware</td><td>漏洞 / 恶意软件</td></tr>
<tr><td>requirement / use case</td><td>需求 / 用例</td></tr>
<tr><td>prototype / iteration</td><td>原型 / 迭代</td></tr>
<tr><td>refactoring</td><td>重构</td></tr>
<tr><td>regression testing</td><td>回归测试</td></tr>
<tr><td>baseline / configuration management</td><td>基线 / 配置管理</td></tr>
<tr><td>legacy system</td><td>遗留系统</td></tr></table>
<div class="key">authentication 回答“你是谁”（验证身份）；authorization 回答“你能做什么”（授予权限）。先认证，再授权。</div>` }
  ],
  examples: [
    { type: 'choice', q: '“Scalability” 的含义是（　）。',
      options: ['可伸缩性：负载增长时通过增加资源保持服务能力', '易用性：用户容易学会和使用', '可移植性：容易迁移到其他环境', '可用性：系统处于可正常服务状态的比例'], answer: 0,
      explain: 'scalability 是可伸缩性 / 可扩展性；易用性是 usability，可移植性是 portability，可用性是 availability。' },
    { type: 'choice', q: '<span lang="en">The process of verifying the identity of a user before granting access is called ______.</span>',
      options: ['authentication', 'authorization', 'encryption', 'auditing'], answer: 0,
      explain: '句意：在允许访问之前验证用户身份的过程叫身份认证（authentication）。authorization 是授权（确定能做什么），encryption 是加密，auditing 是审计。' },
    { type: 'choice', q: '<span lang="en">______ is the ability of a system to continue operating properly when some of its components fail.</span>',
      options: ['Fault tolerance', 'Usability', 'Portability', 'Latency'], answer: 0,
      explain: '句意：部分构件失效时系统仍能正常运行的能力——容错（fault tolerance）。usability 是易用性，portability 是可移植性，latency 是延迟。' }
  ],
  tests: [
    { type: 'choice', q: '“Interoperability” 的含义是（　）。',
      options: ['互操作性', '可移植性', '可伸缩性', '可测试性'], answer: 0,
      explain: 'interoperability 指系统与其他系统交换信息、协同工作的能力，即互操作性。可移植性是 portability。' },
    { type: 'choice', q: '在质量属性中，“usability”指的是（　）。',
      options: ['易用性', '可用性', '可靠性', '可维护性'], answer: 0,
      explain: 'usability 是易用性（好不好用）；可用性是 availability，可靠性是 reliability，可维护性是 maintainability。' },
    { type: 'choice', q: '<span lang="en">In a software architecture, the elements that mediate interactions among components, such as procedure calls, pipes and event broadcasts, are called ______.</span>',
      options: ['connectors', 'stakeholders', 'viewpoints', 'baselines'], answer: 0,
      explain: '句意：架构中负责构件之间交互的元素（过程调用、管道、事件广播等）叫连接件（connectors）。stakeholders 是利益相关者，viewpoints 是视点，baselines 是基线。' },
    { type: 'choice', q: '<span lang="en">______ refers to the time delay between sending a request and receiving the response.</span>',
      options: ['Latency', 'Throughput', 'Availability', 'Redundancy'], answer: 0,
      explain: '句意：从发出请求到收到响应之间的时间延迟——延迟（latency）。throughput 是吞吐量（单位时间处理的数量）。' },
    { type: 'choice', q: '<span lang="en">Restructuring existing code to improve its internal structure without changing its external behavior is known as ______.</span>',
      options: ['refactoring', 'reverse engineering', 'regression testing', 'prototyping'], answer: 0,
      explain: '句意：在不改变外部行为的前提下改进代码内部结构，叫重构（refactoring）。reverse engineering 是逆向工程，regression testing 是回归测试，prototyping 是原型开发。' },
    { type: 'choice', q: '<span lang="en">After a defect is fixed, ______ is performed to make sure that the change has not broken any existing functions.</span>',
      options: ['regression testing', 'unit testing', 'acceptance testing', 'load testing'], answer: 0,
      explain: '句意：缺陷修复后，为确认修改没有破坏已有功能而进行的测试——回归测试（regression testing）。' },
    { type: 'choice', q: '“Eventual consistency” 的含义是（　）。',
      options: ['最终一致性', '强一致性', '分区容忍性', '事务隔离性'], answer: 0,
      explain: 'eventual consistency 是最终一致性：允许短时间不一致，但经过一段时间后数据会达到一致。强一致性是 strong consistency。' },
    { type: 'choice', q: '<span lang="en">An old system that is still in use but is built with outdated technology and is difficult to change is often called a ______ system.</span>',
      options: ['legacy', 'distributed', 'real-time', 'embedded'], answer: 0,
      explain: '句意：仍在使用、但技术陈旧且难以修改的旧系统叫遗留系统（legacy system）。' },
    { type: 'choice', q: '<span lang="en">A ______ is a weakness in a system that can be exploited by an attacker.</span>',
      options: ['vulnerability', 'firewall', 'certificate', 'signature'], answer: 0,
      explain: '句意：系统中可被攻击者利用的弱点——漏洞（vulnerability）。firewall 是防火墙，certificate 是证书，signature 是签名。' },
    { type: 'choice', q: '“Continuous integration” 的含义是（　）。',
      options: ['持续集成：开发人员频繁把代码合并到主干并自动构建测试', '持续交付：软件随时处于可发布状态', '持续部署：通过测试的代码自动部署到生产环境', '集成测试：把模块组装起来进行测试'], answer: 0,
      explain: 'continuous integration（CI）是持续集成；持续交付是 continuous delivery，持续部署是 continuous deployment，集成测试是 integration testing。' }
  ]
},

/* ======================= 专业英语完形填空 ======================= */
{
  id: 'en-cloze', module: 'eng', title: '专业英语完形填空', short: '完形填空', freq: 3,
  prereqs: ['en-terms'],
  keywords: 'English cloze 完形填空 阅读理解 软件架构 微服务 云计算 安全',
  tip: '综合知识第 71～75 题通常是一篇短文的 5 个空，每空 1 分；内容多是架构、云计算、安全等主题，读懂上下文、看搭配和逻辑关系就能做对大部分。',
  learn: [
    { h: '解题步骤', html: `
<ol><li><b>先通读全文</b>，弄清主题（讲架构？微服务？安全？），不要一上来就逐空选。</li>
<li><b>看空格所在的整句</b>：前后有没有 but / however（转折）、because（因果）、such as（举例）、while / whereas（对比）等逻辑词。</li>
<li><b>看语法和搭配</b>：空格要的是名词、动词还是副词？介词搭配是否成立（如 on demand、independently of、trade off between）。</li>
<li><b>代回检查</b>：把选项放回句子读一遍，意思通顺、和上下文不矛盾。</li></ol>
<div class="key">四个选项往往都是专业词，词义本身都“对”，区别在于放进<b>这句话</b>是否合适。抓住句中的逻辑词，常常能直接排除两个。</div>` },
    { h: '常见搭配和逻辑词', html: `
<table class="tbl"><tr><th>表达</th><th>意思</th></tr>
<tr><td>be decomposed into</td><td>被分解成</td></tr>
<tr><td>independently of</td><td>独立于……</td></tr>
<tr><td>trade off (between A and B)</td><td>在 A 与 B 之间权衡</td></tr>
<tr><td>on demand</td><td>按需</td></tr>
<tr><td>rely on / depend on</td><td>依赖于</td></tr>
<tr><td>prevent ... from doing</td><td>阻止……做</td></tr>
<tr><td>however / whereas / while</td><td>然而 / 而（对比）</td></tr>
<tr><td>therefore / thus</td><td>因此</td></tr>
<tr><td>such as / for example</td><td>例如</td></tr>
<tr><td>rather than</td><td>而不是</td></tr></table>
<p class="warn">考场上遇到生词不要慌：完形填空不考生僻词，往往是常见专业词的搭配和逻辑。先排除明显不合语法或与上下文矛盾的选项。</p>` }
  ],
  examples: [
    { type: 'choice', q: cz(P1, 1),
      options: ['decomposed', 'deployed', 'compiled', 'translated'], answer: 0,
      explain: '“how a system is decomposed into components”：系统如何被分解为构件。be decomposed into 是固定搭配；deployed（部署）、compiled（编译）、translated（翻译）都不能和 into components 构成这个意思。' },
    { type: 'choice', q: cz(P1, 2),
      options: ['change', 'ignore', 'document', 'sell'], answer: 0,
      explain: '句意：好的架构师会尽早做出重要决策，因为这些决策以后再<b>改</b>代价很高。架构决策的特点就是“后期修改成本高”。ignore（忽略）、document（记录）、sell（出售）都不符合“代价高”的逻辑。' },
    { type: 'choice', q: cz(P1, 3),
      options: ['affecting', 'improving', 'calling', 'adding'], answer: 0,
      explain: '句意：分层风格使替换某一层时不<b>影响</b>其他层更容易。这是分层的优点“可替换、修改局部化”。improving（改进）、calling（调用）、adding（增加）都不是替换一层时需要避免的事。' },
    { type: 'choice', q: cz(P1, 4),
      options: ['trade off', 'set up', 'give in', 'look up'], answer: 0,
      explain: '句意：因此架构师需要在性能、安全性、可修改性等相互竞争的质量属性之间<b>权衡</b>。trade off between 是“在……之间权衡”；set up（建立）、give in（让步）、look up（查找）不与 between 搭配表达这个意思。' }
  ],
  tests: [
    { type: 'choice', q: cz(P2, 1),
      options: ['process', 'function', 'class', 'variable'], answer: 0,
      explain: '句意：每个服务运行在自己的<b>进程</b>中，通过 HTTP API 或消息等轻量机制通信。微服务各自独立运行，进程是独立运行和部署的单位；function、class、variable 都只是程序内部的概念。' },
    { type: 'choice', q: cz(P2, 2),
      options: ['independently', 'together', 'dependently', 'manually'], answer: 0,
      explain: '“can be deployed independently of the others”：可以独立于其他服务进行部署，这是微服务的核心特点之一。independently of 是固定搭配；together 与 of the others 不搭配且意思相反。' },
    { type: 'choice', q: cz(P2, 3),
      options: ['challenges', 'benefits', 'customers', 'languages'], answer: 0,
      explain: '句首 However 表示转折，后文讲网络延迟、部分失败等问题，所以是带来新的<b>挑战</b>。benefits（好处）与转折和后文矛盾。' },
    { type: 'choice', q: cz(P2, 4),
      options: ['cascading', 'partial', 'local', 'minor'], answer: 0,
      explain: '句意：熔断器等模式可以防止一个出故障的服务在整个系统中引发<b>级联</b>故障（cascading failure，雪崩）。“across the whole system”说明是扩散到全系统的故障，partial、local、minor 都与之矛盾。' },
    { type: 'choice', q: cz(P2, 5),
      options: ['consistent', 'private', 'encrypted', 'compressed'], answer: 0,
      explain: '句意：在多个服务之间保持数据<b>一致</b>，通常依靠最终一致性而不是分布式事务。后半句的 eventual consistency 和 distributed transactions 都是讲一致性的。' },
    { type: 'choice', q: cz(P3, 1),
      options: ['demand', 'purpose', 'behalf', 'average'], answer: 0,
      explain: '“obtain resources on demand and pay only for what they use”：按需获取资源、按使用量付费。on demand 是云计算的基本特征；on purpose（故意）、on behalf（代表，后面要接 of）、on average（平均）都不合句意。' },
    { type: 'choice', q: cz(P3, 2),
      options: ['infrastructure', 'interface', 'application', 'database'], answer: 0,
      explain: '句意：在 IaaS 模式下，云服务商管理物理<b>基础设施</b>，用户负责操作系统和应用。IaaS 就是 Infrastructure as a Service。application 由用户负责，与 while 后的对比矛盾。' },
    { type: 'choice', q: cz(P3, 3),
      options: ['browser', 'compiler', 'kernel', 'cable'], answer: 0,
      explain: '句意：SaaS 更进一步，用户只需通过 Web <b>浏览器</b>访问完整的应用。compiler（编译器）、kernel（内核）、cable（电缆）都不是用户访问 SaaS 的方式。' },
    { type: 'choice', q: cz(P3, 4),
      options: ['released', 'duplicated', 'increased', 'rebooted'], answer: 0,
      explain: '句意：弹性指负载增加时自动增加资源、负载下降时<b>释放</b>资源。与前面的 added 相对，应填 released；increased 与“负载下降”矛盾。' },
    { type: 'choice', q: cz(P3, 5),
      options: ['containers', 'threads', 'packets', 'registers'], answer: 0,
      explain: '句意：云原生应用通常打包在<b>容器</b>中，由 Kubernetes 等编排平台管理。Kubernetes 是容器编排平台；threads（线程）、packets（数据包）、registers（寄存器）都不对。' },
    { type: 'choice', q: cz(P4, 1),
      options: ['integrity', 'scalability', 'usability', 'portability'], answer: 0,
      explain: '信息安全的三要素是机密性、<b>完整性</b>、可用性（CIA）。下一句也解释了 integrity，可以对照。' },
    { type: 'choice', q: cz(P4, 2),
      options: ['modified', 'read', 'displayed', 'stored'], answer: 0,
      explain: '句意：完整性保证数据未经许可不被<b>修改</b>。“不被未授权的人读取”是机密性，前半句已经讲了；这里讲的是完整性，所以是 modified。' },
    { type: 'choice', q: cz(P4, 3),
      options: ['private', 'shared', 'session', 'master'], answer: 0,
      explain: '句意：非对称算法使用一对密钥——公钥和<b>私钥</b>。shared key（共享密钥）、session key（会话密钥）属于对称加密场景，不是密钥对中的另一把。' },
    { type: 'choice', q: cz(P4, 4),
      options: ['signature', 'certificate', 'envelope', 'firewall'], answer: 0,
      explain: '句意：发送方用私钥生成数字<b>签名</b>来证明消息是谁发的，任何人都可以用对应的公钥验证。数字证书由 CA 签发；数字信封用接收方公钥加密对称密钥，都不是“用自己私钥证明身份”。' },
    { type: 'choice', q: cz(P4, 5),
      options: ['auditing', 'advertising', 'compiling', 'booting'], answer: 0,
      explain: '句意：除技术措施外，纵深防御策略把防火墙、入侵检测、访问控制和安全<b>审计</b>结合起来，单个措施失效也不会让整个系统暴露。其他三个词与安全措施无关。' }
  ]
}

);

})();
