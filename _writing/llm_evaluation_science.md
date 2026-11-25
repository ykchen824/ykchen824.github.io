---
title: 大模型评测的第一性原理
date: 2026-11-25
math: true
summary: 当静态榜单因污染、风格偏见与脚手架混淆接连失灵，回溯安全科学、软件验证与心理测量学的历史教训，结合任务结构视角重构面向前沿模型与智能体的评测科学。
keywords: [LLM评测, 评测科学, 安全科学, 软件验证, 心理测量学, IRT, 脚手架, 构念效度]
---

2026 年 2 月，OpenAI 正式停用了报告软件工程基准 SWE-bench Verified 的分数（[OpenAI, 2026](#ref-openai-2026)）。工程师对其中 138 道难题逐一审计后发现，近六成题目本身存在测试设计缺陷，而全部受测前沿模型都在不同程度上回忆出了标准补丁。同一时期，在备受瞩目的人类盲测排行榜 Chatbot Arena 上，决定胜负的关键因子居然是回复有多长（[LMSYS, 2024](#ref-lmsys-2024)）；而在 MMLU-Pro 与 GPQA 上拿到完全相同总分的两个顶尖模型，会在 16% 到 38% 的推理题上给出截然相反的答案（[Benchmark Illusion, 2026](#ref-benchmark-illusion-2026)）。

过去十年，机器学习社区几乎把“跑通排行榜”等同于“证明能力”。这套由 Fred Jelinek 与 Charles Wayne 在 1980 年代开创的通用任务框架（Common Task Framework, CTF），依赖固定公开数据集与统一标量指标驱动迭代（[Raji et al., 2021](#ref-raji-2021)）。在语音识别、机器翻译等边界清晰的任务里，它确实高速有效；可当被测对象变成能够写代码、调工具、维护长程记忆并在开放环境中自主规划的通用系统时，静态榜单的测量效度正在成片瓦解。

这些失灵并不是几道题没出好、或者某个脚本漏了清洗。把视野拉出计算机科学就会发现，今天大模型评测踩中的每一个坑，人类在**安全科学**、**软件验证**与**心理测量学**三个成熟学科里早已用惨痛代价验证过。把这些历史教训与 [Alex Zhang（2026）](#ref-alex-zhang-2026) 提出的“任务结构（Structure of Tasks）”视角拼在一起，我们才能回答那个越来越紧迫的问题：**当静态刷榜不再可信，究竟怎样才算真正测准了一个智能体？**

## 安全科学：组件 100% 合格，为什么系统依然会出事

传统 AI 评测隐含着一种强烈的还原论假设：只要孤立的模型权重在安全对齐基准和能力题库上拿了高分，把它装进真实应用里就是安全的。安全科学过去四十年的核心工作，恰恰是在证明这个假设为什么会害死人。

### 交互复杂性、紧耦合与冗余悖论

1979 年三哩岛核电站发生堆芯部分熔毁时，单个仪表和阀门几乎都在“按设计工作”，问题出在多个原本正常的小故障沿着谁也没料到的路径串在了一起。社会学家 Charles Perrow 在[《Normal Accidents》（1984/1999）](#ref-perrow-1984) 中把这类系统性失控拆解为两个结构维度：

* **交互复杂性（Interactive Complexity）**：组件之间存在非线性、隐蔽且非预期的交叉影响，现场人员很难在几分钟内看清系统到底处于什么状态。
* **紧耦合（Tight Coupling）**：前后工序之间没有时间或物理缓冲，局部异常一旦冒头就会瞬间级联扩散，中途几乎无法叫停。

当一个系统同时具备高交互复杂性与紧耦合，事故在结构上就成了“正常的”。更反直觉的是 Perrow 提出的**冗余悖论**：往复杂紧耦合系统里单纯堆叠额外的安全检查模块，往往会引入新的隐蔽交互通道，反而让系统更不透明（[Taylor & Francis, 2023](#ref-taylor-2023)）。

把目光转回现代大模型应用：只要基座模型接上 RAG 检索、外部 API、代码沙盒与多智能体编排，整个系统立刻进入高交互复杂性与紧耦合区间。然而 2025–2026 年的实证审计显示，高达 **83%** 的智能体评测依然只盯着孤立的技术指标，对组件交互与级联故障视而不见（[Safety Under Scaffolding, 2026](#ref-scaffolding-2026)；[Cascading Effects, 2026](#ref-cascading-2026)）。

### 瑞士奶酪模型与潜伏条件

如果一线员工操作失误导致了事故，追究个人责任往往最省事，却几乎无法阻止下一次事故发生。心理学家 James Reason 在 [BMJ（2000）](#ref-reason-2000) 提出了著名的瑞士奶酪模型：工程防护、操作规程与人工审核像一片片叠在一起的奶酪，每一片上都存在动态开合的“孔洞”。孔洞源自两股不同的力量：

* **主动失效（Active Failures）**：一线执行者或单次模型推理直接做出的不安全动作，影响立刻显现，但往往只是导火索。
* **潜伏条件（Latent Conditions）**：藏在系统深处的“常驻病原体”，比如有缺陷的权限架构、扭曲的考核激励或长期失灵的告警。它们可以安静潜伏几年，直到某天所有奶酪的孔洞刚好排成一条直线。

Reason 把只盯着表层失误修补比作“逐一拍打蚊子”，而真正有效的治理是“排干滋生蚊子的沼泽”。放在大模型评测里，指望靠单点提示词防御或静态拒答率榜单保平安，无异于幻想存在一片没有孔洞的奶酪；只要部署架构中的权限隔离、输入清洗与运行时监控留着潜伏缝隙，模型对齐的微小破口就会被放大成系统级穿孔（[Swiss Cheese Model for AI Safety, 2024](#ref-swiss-cheese-2024)）。

### STAMP 与 STPA：把安全重构为控制问题

当软件开始接管复杂物理过程，许多灾难发生时，没有任何一行代码跑飞，也没有任何一个硬件损坏。MIT 教授 Nancy Leveson 由此提出了 **STAMP（System-Theoretic Accident Model and Processes）** 与前瞻分析方法 **STPA**，将安全工程从“计算零件失效率”彻底改写为“控制论问题”（[Leveson & Thomas](#ref-leveson-stpa)；[Dobbe, 2022](#ref-dobbe-2022)）。

在 STAMP 看来，安全是整个社会技术系统在运行时涌现出来的属性。只要控制器内部维护的**过程模型（Process Model，即对外部真实状态的信念表征）**与现实世界脱了节，即便所有模块都 100% 忠实于局部代码规格，系统也会输出**四类不安全控制动作（UCA）**（[arXiv:2503.12043](#ref-stpa-ai-2025)）：

1. 该给出控制动作时没有给（例如该触发阻断或人工接管时保持沉默）；
2. 给出了导致危险的控制动作（例如误触发高危工具调用或删库命令）；
3. 动作本身没错，但时机过早、过晚或顺序颠倒；
4. 动作持续太久或提前中断（例如智能体陷入重试死循环，或跳过校验直接结束）。

大语言模型产生幻觉并据此调用外部工具时，本质上就是控制器的过程模型与环境真实状态发生了严重漂移。

### 向边界漂移与高可靠性行业的制度演进

原本设计得还算安全的系统，为什么往往会在几年后悄无声息地滑向灾难？Jens Rasmussen（[1997](#ref-rasmussen-1997)）给出了一个简洁的力学解释：任何组织都被夹在**经济效率边界**、**工作负荷边界**与**安全边界**之间。在日复一日的成本压力与省力冲动驱动下，实际操作会自发向安全边界滑移，直到安全裕度被悄悄吃光。Sidney Dekker 称之为“向失败漂移”，而社会学家 Diane Vaughan 在复盘 1986 年挑战者号与 2003 年[哥伦比亚号航天飞机失事（CAIB Report Vol. 1）](#ref-caib-2003)时，把其中的心理机制命名为**偏差正常化（Normalization of Deviance）**——组织一次次目睹超出设计标准的异常（如 O 型环侵蚀、泡沫脱落），因为前几次“居然没出大事”，便顺理成章地把异常重新定义为可接受的常规。

三大高可靠性行业用一次次惨痛教训换来的制度改造，恰好对应了今天 AI 评测最缺的拼图：

* **航空航天**：1986 年挑战者号失事后，理查德·费曼在[罗杰斯委员会报告附录 F](#ref-feynman-1986) 戳破了一个惊人落差：NASA 管理层对外宣称的失事概率是 $$10^{-5}$$，一线工程师私下估计却高达 $$10^{-2}$$（最终 135 次飞行果然发生了 2 次灾难性失事）。此后航空界转向独立同行评审的动态概率风险评估（Living PRA）与非惩罚性的险兆报告系统（NASA ASRS）。而 2018–2019 年[波音 737 MAX 两起坠机（346 人遇难）](#ref-boeing-2020)则反向敲响了警钟：把适航认证过度外包给商业厂商自己（ODA），并采用脱离现实的人因假设，只会让形式合规彻底沦为盲区。
* **核电工程**：1979 年[三哩岛事故](#ref-tmi-1979)中，控制室指示灯显示的只是“已发出关阀电信号”，而非阀门真实的物理开关状态，直接误导操作员切断了应急冷却。核电界随后打破“发展与监管合一”的利益绑定，把应急规程从“基于事件猜测”改为“基于症状（symptom-based）”，并建起跨公司的同行核查机构（INPO）。
* **制药监管**：经历磺胺酏剂与沙利度胺危机后，FDA 建起了严格的 [Phase I–IV 临床试验制度](#ref-fda-clinical)。但 2004 年[万络（Vioxx）撤市事件](#ref-vioxx-2007)证明，上市前试验样本有限、周期偏短，被动等待医生自发上报（FAERS）又严重滞后。美国随后在 2007 年立法启动 [Sentinel 哨兵计划](#ref-fda-clinical)，用分布式真实医疗数据搭起覆盖亿级人群的主动监测网络。

安全科学讲清了“系统与组织如何失效”；而当核心控制器变成代码和模型之后，工程界还会撞上另一堵同样坚硬的墙：测试本身在数学上能证明什么？

## 软件验证：测试所能证明的绝对上限

软件工程师常有一种错觉：只要测试套件全绿，系统就算可靠。过去半个世纪的形式化方法与软件测试研究，从可计算性到工程事故，反复划出了测试能力的边界。

### 组合爆炸、串联衰减与不可判定性

1969 年，Edsger W. Dijkstra 在手稿 [EWD 249](#ref-dijkstra-1969) 中算了一笔简单的账：哪怕只是一个 27 位定点整数乘法器，即便每次乘法只要几十微秒，想把全部 $$2^{54}$$ 种输入组合测一遍，也需要超过一万年。他由此写下软件工程流传最广的一句警句：

> “Program testing can be used to show the presence of bugs, but never to show their absence!” —— Edsger W. Dijkstra (1969)

同一份手稿里，Dijkstra 还提醒了**串联可靠性衰减律**：如果一条执行链由 $$N$$ 个串联步骤构成、单步正确率为 $$p$$，整条链跑通的概率近似为：

$$
P_{\text{system}} = p^N
$$

当智能体从单轮问答跨入动辄四五十步工具调用的长程任务时，即便每一步准确率高达 $$p = 0.98$$，50 步后的整体成功率也会跌到 $$0.98^{50} \approx 0.364$$。更深一层，可计算性理论里的[莱斯定理（Rice's Theorem）](#ref-rice-theorem)已经证明，关于程序运行时行为的任何非平凡语义属性都是不可判定的——任何自动验证工具都不得不在**健全性（不漏报）**与**完备性（不误报）**之间做取舍。

### 规格鸿沟与分布外失效的经典教训

回顾软件史上最昂贵的事故，问题极少出在“代码没通过单元测试”，而几乎都源于**隐含假设没写进规格书**，或者**已充分验证的模块被放进了分布外环境**：

* **Ariane 5 首飞解体（1996）**：火箭升空约 40 秒即自毁（[Lions et al., 1996](#ref-ariane5-1996)）。原因是直接复用了 Ariane 4 上久经考验的惯性参考系统（SRI）对准软件，但 Ariane 5 的水平加速度是前代的 5 倍，导致 64 位浮点变量 `BH` 转 16 位整数时溢出，主备两套完全相同的 SRI 接连停机。项目方既在规格书里漏掉了新弹道数据，又在闭环仿真里用理想模型顶替了真实硬件——**组件级已验证不等于分布外安全，同构冗余也挡不住共因逻辑缺陷。**
* **Therac-25 辐射事故（1985–1987）**：[Leveson & Turner（1993）](#ref-therac25-1993) 调查发现，制造商去掉前代的独立硬件联锁后，在故障树分析里直接忽略了软件残余缺陷；当熟练操作员在 8 秒内快速修改参数时，并发竞态条件被触发，且 1 字节计数器 `Class3` 每 256 次循环溢出回零绕过检查，酿成多起致命过量辐射。
* **Knight Capital（2012）与 Heartbleed（2014）**：[Knight Capital](https://www.sec.gov/newsroom/press-releases/2013-222)（[SEC, 2013](#ref-knight-2013)）因部署失误激活了 2005 年遗留的死代码，45 分钟内发出超 400 万笔异常委托、亏损逾 4.6 亿美元，而开盘前发出的 97 封报错邮件因未被设为强告警而无人察觉；[Heartbleed（CVE-2014-0160）](#ref-heartbleed-2014) 则说明，哪怕密码算法在数学上滴水不漏，实现时少写一行 `memcpy` 边界校验，单次请求就能泄出 64 KB 内存私钥。

哪怕做到了形式化验证的标杆——用 Isabelle/HOL 完成机器检查证明的 [seL4 微内核（Klein et al., SOSP 2009）](#ref-sel4-2009)——作者也坦承其可信边界：形式化证明只能担保“代码忠于形式化规格”，永远无法保证“规格本身没有遗漏现实世界的物理或业务需求”。正因如此，工业界往往采取更务实的策略，比如 [AWS 用 TLA+（Newcombe et al., 2015）](#ref-aws-tlaplus-2015) 把形式化建模集中用在并发协议与系统架构层。

### 预言机难题、覆盖率幻觉与生产现场验证

当测试对象变成数值仿真、编译器或大语言模型，造出输入往往不难，真正卡住脖子的反而是**预言机问题（The Oracle Problem）**——没有昂贵人工介入时，拿什么自动判断输出对不对（[Barr et al., IEEE TSE 2015](#ref-barr-2015)）？软件验证界围绕这个问题发展出了三条绕过精确标准答案的路径：

* **蜕变测试（Metamorphic Testing）**：由陈宗岳（T.Y. Chen）等人于 1998 年提出（[Segura et al., 2016](#ref-segura-2016)）。既然算不出绝对真值，就去核验输入做特定变换后，输出之间必须满足的不变关系，比如 $$\sin(\pi - x) = \sin(x)$$，或者检索条件变严格时返回条数不应变多。
* **基于属性的测试（Property-Based Testing）**：以 [QuickCheck（Claessen & Hughes, ICFP 2000）](#ref-quickcheck-2000) 为代表，用通用代数不变量（如序列化再反序列化应还原）生成大批随机用例，抓到反例后再自动收缩成最小复现样本。
* **模糊测试（Fuzzing）**：自 [Miller et al.（1990）](#ref-miller-fuzz-1990) 用随机字节流打崩约四分之一 UNIX 实用工具以来，以 AFL、OSS-Fuzz 为代表的覆盖率引导模糊测试把“不崩溃、不越界”当作通用隐式预言机，持续挖出海量深层漏洞。

与此同时，工程界也打破了“高代码覆盖率 = 高测试质量”的迷信。[Inozemtseva & Holmes（ICSE 2014）](#ref-inozemtseva-2014) 统计了 31,000 个测试套件后发现，一旦控制测试规模，覆盖率与真实缺陷检出率的相关性很弱——测试完全可以只“路过”代码而不做有效断言。为检验测试套件本身的成色，Google 在 20 亿行单体仓库里推行了[增量变异测试（Petrović et al., 2021）](#ref-petrovic-2021)：往变更代码行主动注入微小故障，看现有测试能不能抓出来，并通过过滤无意义变异体把每次变更的中位变异体数从 820 个压到 7 个，让有效变异体的工程师认可率从 15% 升至 89%。

当系统复杂到上线前注定测不完时，验证的边界自然延伸进了生产现场：**运行时验证（RV）**把核心规约编译成在线监视器，实时核验真实执行轨迹（[Leucker & Schallhart, 2009](#ref-leucker-2009)）；Netflix 开创的**混沌工程**则先定义业务稳态，再在生产环境受控注入故障，主动尝试证伪系统韧性（[Basiri et al., 2016](#ref-basiri-2016)）。

安全科学和软件验证把“系统如何崩溃、测试能兜住多少底线”讲透了。但大模型评测还有另一半独有的难题：我们想测的往往不是某段代码有没有溢出，而是“推理能力”“安全对齐倾向”这类看不见摸不着的能力特质——这正好踏进了心理测量学深耕了上百年的领地。

## 心理测量学：如何度量看不见的潜在能力

你拿不到一把物理尺子去量一个模型的“推理能力”，就像教育学者拿不到尺子去量学生的“数学素养”。我们能看到的永远只是它在具体题目上的作答表现，然后反推背后的潜在特质。

### 构念效度、生态效度与“看起来像”的陷阱

1955 年，[Cronbach 与 Meehl](#ref-cronbach-1955) 为这类无法直接观测的“构念（Construct）”建立了认识论根基：**构念效度（Construct Validity）**。既然找不到单一外部真值，就必须把待测构念放进一张由理论预测与实证相关性交织而成的**法理网络（Nomological Network）**里交叉验证。[Samuel Messick（1995）](#ref-messick-1995) 进一步把效度统一为覆盖内容、认知实质、内部结构、跨群体可推广性、外部效标以及社会后果六个维度的整体证据链。

很多 AI 基准的混乱，源于把三个完全不同的概念混为一谈：

* **构念效度**：分数究竟能不能支持关于目标潜在能力的科学推论；
* **生态效度（Ecological Validity）**：测试任务向特定真实语境推广的程度（[Holleman et al., 2020](#ref-holleman-2020)）；
* **表面效度（Face Validity）**：题目在外行眼里“看起来像不像”在考该能力——看起来很像真实场景的基准，可能根本测不出真实区分度，因此表面效度算不上科学证据。

Messick 警告过两类最致命的效度污染：一是**构念代表不足**（题库太窄，漏掉了核心维度），二是**构念无关变异（CIV）**——分数被题型套路、排版风格或回复长度这些无关特征悄悄带偏。

### 从经典平均分走向项目反应理论（IRT）

今天绝大多数大模型排行榜依然停留在**经典测量理论（CTT）**的水平：把一堆难度不明、区分度未知的题凑成一张卷子，算个等权平均分。CTT 把观测分拆为 $$X = T + E$$，但它的致命弱点是**样本依赖**与**测验依赖**——换一批模型或换一套题，题目难度和分数刻度就全乱了，而且它默认高低分段具有完全相同的测量误差。

为了把“题目属性”和“被试能力”解耦，Georg Rasch（1960）与 Allan Birnbaum（1968）建立了**项目反应理论（IRT）**（[PMC5875705](#ref-irt-pmc-2018)）。IRT 把潜在能力 $$\theta$$ 与题目参数置于同一条潜变量尺子上，用项目特征曲线刻画答对第 $$i$$ 题的概率。最常见的**三参数逻辑斯蒂模型（3PL）**写作：

$$
P_i(\theta) = c_i + (1 - c_i) \frac{1}{1 + \exp[-a_i(\theta - b_i)]}
$$

其中 $$b_i$$ 是**难度**，决定曲线左右位置；$$a_i$$ 是**区分度**，即拐点斜率，反映这道题在能力水平 $$\theta \approx b_i$$ 附近拉不开差距；$$c_i$$ 是**伪猜测参数**，刻画能力极低时靠瞎猜蒙对的概率下限（令 $$c_i=0$$ 退化为 2PL，再令 $$a_i=1$$ 即 Rasch/1PL 模型）。据此还能算出单道题在特定能力处提供的**费舍尔信息量**：

$$
I_i(\theta) = \frac{[P'_i(\theta)]^2}{P_i(\theta)[1 - P_i(\theta)]}, \quad SE(\hat{\theta}) = \frac{1}{\sqrt{\sum_i I_i(\theta)}}
$$

顺着这条数学性质，教育测量界走出了**计算机化自适应测验（CAT）**——根据受试者前几题的对错实时更新能力估计 $$\hat{\theta}$$，动态挑选当下信息量 $$I_i(\hat{\theta})$$ 最大的下一题，用少得多的题量实现高精度测量，同时躲开天花板效应（[arXiv:2404.00712](#ref-cat-2024)）。

### 指标腐化铁律与“聪明的汉斯”时刻

只要社会高利害决策绑死在某个单一量化分数上，测量工具就会开始自我毁灭：

> “The more any quantitative social indicator is used for social decision-making, the more subject it will be to corruption pressures and the more apt it will be to distort and corrupt the social processes it is intended to monitor.” —— Donald T. Campbell (1979)（[RePEc](#ref-campbell-1979)）

结合 Charles Goodhart（1975）与 [Manheim & Garrabrant（2018）](#ref-manheim-2018) 的归纳，代理指标与真实目标沿着四条路径背离：**回归型**（挑最高分其实挑中了随机噪声）、**极端型**（往尾部狂刷推翻了原本的线性相关）、**因果型**（直接干预指标切断了因果链）以及**对抗型**（主动钻规则漏洞）。教育史上，[Jacob & Levitt（QJE, 2003）](#ref-jacob-2003) 审计出芝加哥公立小学每年有 4%–5% 的班级存在系统性教师改分作弊，亚特兰大丑闻更导致 35 名教育者被起诉；哈佛学者 Daniel Koretz 则系统记录了高利害统考如何逼出应试窄化与虚假分数膨胀。

过去十年，机器学习基准几乎原封不动地重演了一遍：

* **捷径学习与“聪明的汉斯”**：[Geirhos 等人（2020）](#ref-geirhos-2020) 指出深度网络极其擅长抓住测试集里的虚假捷径。[Zech 等人（2018）](#ref-zech-2018) 发现一个识别肺炎 X 光片所属医院的模型准确率高达 99.95%–99.98%，实则靠的是辨认角落里的医院拍摄水印；[Lapuschkin 等人（2019）](#ref-lapuschkin-2019) 把“马”图片的版权水印贴到法拉利跑车上，分类器立刻把跑车认成了马；而在自然语言推理中，[McCoy 等人（ACL 2019）](#ref-mccoy-2019) 用 HANS 对抗集证明高分模型依赖的不过是词汇重叠等浅层句法启发式。
* **全宇宙基准谬误**：[Raji 等人（NeurIPS 2021）](#ref-raji-2021) 直接用构念效度批判了 ImageNet、GLUE 与 SuperGLUE——把顺手拼出来的有限样本包装成“通用视觉或语言理解”的普适尺子（2011 年版 ImageNet 里 45% 图像来自美国，中印合计仅 2.2%），严重歪曲了社区十年的优化重心。

## 2024–2026：四大历史规律在大模型评测中集中重演

安全科学、软件验证与心理测量学花了几十年才总结出的教训，在 2024 至 2026 年的前沿大模型评测里被压缩到短短两年集中引爆。近年的实证审计表明，主流榜单自身的噪声与系统偏差，早已大过了模型之间那几个百分点的差距：

1. **测试预言机失效与训练污染（SWE-bench Verified）**：2026 年 2 月 [OpenAI 停用 SWE-bench Verified](#ref-openai-2026) 时，内部对 138 道难题的逐一审计发现至少 **59.4%** 存在实质缺陷——其中 **35.5%** 属于强行校验特定实现细节而误杀正确解的“过窄测试”，**18.8%** 属于考核题面未说明功能的“过宽测试”。与此同时，15 轮自适应红队探测证实所有受测前沿模型都存在记忆标准补丁或发行说明的训练污染；独立研究量化显示，剔除污染样本后，头部提交在 1–4 小时子集上的相对解决率下降超过 **20%**（[arXiv:2610.19447](#ref-swebench-contam-2026)）。
2. **风格偏见与榜单幻觉（Chatbot Arena）**：[LMSYS（2024）](#ref-lmsys-2024) 在 Bradley-Terry 回归里拆出风格协变量后发现，**回复长度**是最强烈的构念无关变异——长度系数高达 0.249，把列表（0.031）与粗体（0.019）甩开一个量级，剥离风格后多名高排名轻量模型名次明显回落。随后 NeurIPS 2025 论文[《The Leaderboard Illusion》（Singh et al., 2025）](#ref-singh-2025) 审计了 200 万场对战与 243 个模型，揭露了更深层的不对称：头部闭源厂商可在发布前私测多达 27 个变体并撤回低分结果；OpenAI（20.4%）与 Google（19.2%）两家拿走了近四成全平台数据，而 83 个开源模型合计只分到 29.7%，且少量平台分布反馈就能带来高达 112% 的过拟合涨幅。
3. **基准幻觉与统计失范**：[Benchmark Illusion（2026）](#ref-benchmark-illusion-2026) 揭开了一个比分数饱和更隐蔽的危机——在 MMLU-Pro 与 GPQA 上，总分一模一样的模型在 **16%–66%** 的题目上互有对错（顶尖前沿模型间仍有 16%–38%）；把同等基准得分的模型换进社会科学复现实验，估计出的处理效应能波动超 **80%** 甚至反转正负号。此外，[Evan Miller（2024）](#ref-miller-2024) 指出忽视阅读理解题组的段落聚类相关性会让标准误被低估 **3 倍以上**；斯坦福 [BetterBench（NeurIPS 2024）](#ref-betterbench-2024) 审计 24 个主流基准后也确认，绝大多数榜单连最基本的统计显著性与复现规范都未满足。
4. **权重与脚手架的归因混杂**：[Yunbei Zhang 等人（2026）](#ref-zhang-2026) 提出**约束瓶颈假说**——当底层前沿模型能力相近时，负责上下文管理、工具交互与重试逻辑的执行脚手架（Harness）往往比模型权重更能左右最终成败，脚手架带来的方差甚至可以数倍于模型方差并翻转榜单排名。现实中的配置事故也屡见不鲜，例如 [GPT-6 Astra System Card（2026）](#ref-openai-2026) 披露，第三方在 World Class Bio 评测中误开了联网搜索工具，直接把报告分数从 59.2% 拉高到了 61.6%。

既然单靠“把题出难一点、多加几个基准”已经无法解决归因混杂与长程锯齿崩塌，我们还需要一把手术刀，把黑盒里的“模型能力”和外面的“控制脚手架”彻底切开。

## 任务结构：把“能力基”从“脚手架控制”里拆出来

要看穿“为什么单轮考题全对的模型，一进 50 步长程任务就频繁崩塌”，[Alex Zhang（2026）](#ref-alex-zhang-2026) 提出的**任务结构（Structure of Tasks）**视角提供了一把非常顺手的钥匙。

它的核心直觉并不复杂：人类能解决的自然语言与工程任务并不是一团乱麻，而是高度模块化、可拆解的——复杂任务的解法可以表示为一组底层**能力“基（Basis of Capabilities）”**的组合。就像运动生理学里，单块肌肉的微观机理很难用符号公式穷尽（HuggingFace 曾经用纯符号规则写过一个 64 万行代码的聊天机器人 PyBot，才勉强追平部分 1B 参数模型），但这些基础原语在身体运动中的组合规律却非常清晰。

顺着这条思路，很多看似全新的“超长上下文”与“超长视野”难题，拆到底其实是一串更短、更常规的子任务。决定成败的分水岭在于两条截然不同的执行路径：

* **端到端分布外轨迹**：把原始需求、多轮子查询、冗长工具输出和中间草稿一股脑全塞进同一个上下文窗口。整条轨迹的长度与混合结构远超训练分布，一旦失败，你根本分不清是上下文污染拖垮了注意力，还是底层能力本来就不够。
* **局部在分布内组合**：借助脚手架（如用 `grep`/`read` 按需卸载上下文、用 Python REPL 程序化调工具，或者动态派生子智能体），把长程任务切分成一系列模型在训练时早已驾轻就熟的短调用，让每一次推理都稳稳落在分布内。

把这层结构拆解和 Nancy Leveson 的控制论（STAMP）以及 [Yunbei Zhang 等人（2026）](#ref-zhang-2026) 的形式化框架合到一起，一个智能体系统的表现和安全性，其实是随机策略 $$\pi_{\text{LLM}}$$、闭环脚手架控制器 $$\mathcal{H}$$ 与交互环境 $$\mathcal{E}$$ 三者耦合的结果：

$$
\text{Performance / Safety} = F(\pi_{\text{LLM}}, \mathcal{H}, \mathcal{E})
$$

这意味着，一套严肃的评测体系必须把“端到端总分”拆回三条彼此正交的测量轴：

1. **底层能力“基”轴**：跳出粗糙的学科分类，刻画 $$\pi_{\text{LLM}}$$ 在原子认知维度上的分布内上限（例如 [ADeLe 18 项不饱和通用需求量表](#ref-burden-2025) 与 [Burden et al., 2025](#ref-burden-2025) 的贝叶斯三角测量）。
2. **脚手架控制回路轴**：采用 [VERA（2026）](#ref-vera-2026) 的单轴冻结协议——固定 $$\mathcal{H}$$ 测 $$\pi_{\text{LLM}}$$，再反过来固定 $$\pi_{\text{LLM}}$$ 测 $$\mathcal{H}$$ 的上下文管理、工具纠错与 STPA 控制安全性。
3. **自主组合元能力轴**：正如 Alex Zhang 强调的，“自己做拆解和编排”本身就是关键的能力基之一。评测需要专门考察模型充当编排者（如 Recursive Language Model）的能力——能不能自主写持久化代码卸载上下文、派生子调用，并在越出自己分布内边界时主动求助或中止。

## 重构 LLM 评测科学的五条公理

把安全科学、软件验证、心理测量学和任务结构视角放到一张图里，新一代大模型评测科学可以收拢为五条可落地的设计公理。

### 公理一：构念与任务结构先行

建基准之前，先定义清楚待测的潜在能力“基”和任务组合图谱，而不是随手拼接“全宇宙题库”。参照 Messick 统一效度框架，基准发布时应当明示构念覆盖边界，剔除长度、Markdown 排版偏见和隐藏环境依赖等构念无关变异，并改用连续、可跨代比较的标尺——例如 [METR（2025/2026）](#ref-metr-2025) 用人类专家完成耗时定义的 **Task Horizon**（以 50% 成功率对应的任务时长衡量长程自主能力，截至 [2026 年 Q4 更新](#ref-metr-2025)，其倍增周期已缩短至约 3.6 个月）以及 ADeLe 的多维需求剖面。

### 公理二：系统解耦与控制归因

能力与安全均是 $$(\pi_{\text{LLM}}, \mathcal{H}, \mathcal{E})$$ 共同涌现的属性。任何隐去脚手架规格、上下文截断策略、工具权限与采样预算的智能体跑分对比，在科学上都属于不可复现的无效实验。安全评测还应当引入 STPA 四类不安全控制动作分析，专门检验当工具报错、接口超时或遇上对抗注入时，控制器的内部信念状态会不会发生危险漂移。

### 公理三：统计计量与体制适配

遵循 [Anthropic（2024）](#ref-miller-2024) 的统计评测规范，正式评测结果应当同步报告点估计、95% 置信区间、共享题组聚类标准误，以及基于同题配对差异的显著性与功效分析；高风险应用还应公布模型间的逐题一致率，防止被“基准幻觉”误导。把 IRT 和自适应测验（如减少题量的 [tinyBenchmarks](#ref-polo-2024) 与减少 90% 题量的 [ATLAS](#ref-polo-2024)）引入 AI 评测时，还须正视 [Jiang 等人（NeurIPS 2026）](#ref-jiang-2026) 指出的**体制错配（regime mismatch）**——被测模型数量远少于题目数，且能力分布往往非正态，参数估计器的稳健性必须经过额外校验。

### 公理四：预言机抗腐化与动态演化

受制于坎贝尔与古德哈特定律，任何静态、公开、反复刷榜的高利害基准都会在几个月内被污染和过拟合穿透。抗腐化的预言机体系需要三条腿走路：

* **动态时间隔离**：效仿 [LiveBench（ICLR 2025）](#ref-livebench-2025)，按月从最新数学竞赛、学术论文与真实事件中补充具备客观真值的考题；
* **属性与蜕变校验**：面对没有唯一标准答案的开放任务，改用蜕变关系（语义等价改写不应反转结论）与可执行代码不变量，并定期用增量变异测试反向审计评测套件自身的区分度；
* **可验证与难验证双轨并重**：警惕 [METR Q4 2026](#ref-metr-2025) 与 NeurIPS 2026 TSNBench 提示的“可验证偏置”——模型在容易搭 RL 环境的编程和数学题上的高分，并不能自动外推到缺乏即时真值的开放判断任务上，后者仍需保留独立人类专家的盲审。

### 公理五：全生命周期纵深防御与白盒审计

遵循 Dijkstra“测试无法证明无错”的底线，以及制药行业从上市前试验走向主动药物警戒的路径，LLM 评测必须从上线前的一场静态考试，延伸为四阶段闭环架构：

* **第一阶段（原子基与白盒机制审计）**：用 IRT 与 ADeLe 测绘模型的基础能力剖面；针对潜伏的奖励黑客、欺骗与评测伪装，将黑盒行为测试与白盒机制可解释性结合——正如 [Anthropic（2025）](#ref-marks-2025) 在隐藏目标盲审实验中展示的，稀疏自编码器（SAEs）配合行为探测，帮助 4 支不知情审计团队中的 3 支成功挖出了植入模型的隐蔽漏洞利用目标，而[电路追踪归因图（Circuit Tracing, 2025）](#ref-marks-2025) 进一步提供了核验多步推理是否忠实于内部计算的显微镜。
* **第二阶段（脚手架解耦与控制安全验证）**：在隔离沙盒中（如 [UK AISI Engineering Playbook, 2026](#ref-aisi-playbook-2026) 的五层工程架构）做单轴冻结对照，核查局部在分布内拆解是否可靠、STPA 控制约束是否有效。
* **第三阶段（动态对抗与社会技术实地测试）**：参照 [AgentDojo（NeurIPS 2024）](#ref-agentdojo-2024) 同时报告良性效用、受攻击效用与攻击成功率，防止靠“一刀切拒答”把有用性弄瘫痪来换取虚假安全分；并引入 [NIST ARIA（2025）](#ref-nist-aria-2025) 的“模型测试—红队测试—实地测试”三层测量树，捕捉真实人机协作里的社会技术风险。
* **第四阶段（生产运行时验证与主动警戒闭环）**：在线上部署轻量级运行时契约监视器（RV）、受控混沌故障注入和非惩罚性险兆报告通道（对齐 FDA Sentinel 与航空 ASRS），把生产环境抓到的分布外故障轨迹持续回流成新的变异体、蜕变关系与动态回归测试集。

## 结语

回头看过去半个世纪的高可靠性工程史，每一次真正有分量的范式跃迁，都始于人类愿意承认“静态理想测试”测不出全部真相。1986 年，理查德·费曼在挑战者号事故调查报告末尾写下的那句警告，四十年后依然适用：

> “For a successful technology, reality must take precedence over public relations, for nature cannot be fooled.” —— Richard P. Feynman (1986)（[NASA Rogers Commission Report, Appendix F](#ref-feynman-1986)）

当大语言模型从聊天框走进软件工程、科学研究与关键基础设施，评测也就不再只是发布会幻灯片上的一个榜单名次。把测量的根扎进任务结构、控制论、统计计量学与全生命周期实证审计里，我们才谈得上客观、稳健地看清智能体能力的真实边界。

---

## 参考文章

<ol class="references">
  <li id="ref-agentdojo-2024">Debenedetti, E., Zhang, J., Balunović, M., Beurer-Kellner, L., Fischer, M., &amp; Tramèr, F. (2024). <a href="https://arxiv.org/abs/2406.13352">AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents</a>. <em>NeurIPS</em>.</li>
  <li id="ref-aisi-playbook-2026">UK AI Security Institute. (2026). <a href="https://www.aisi.gov.uk/blog/releasing-aisis-engineering-playbook">Releasing AISI's Engineering Playbook</a>.</li>
  <li id="ref-alex-zhang-2026">Zhang, A. (2026). <a href="https://csailmit.substack.com/p/can-alternate-bets-on-ai-progress">Can alternate bets on AI progress uncover the fundamental structure of “tasks?”</a>. <em>MIT CSAIL Substack</em>.</li>
  <li id="ref-ariane5-1996">Lions, J. L., et al. (1996). <a href="http://www.cs.unibo.it/~laneve/papers/ariane5rep.html">ARIANE 5 Flight 501 Failure: Report by the Inquiry Board</a>.</li>
  <li id="ref-aws-tlaplus-2015">Newcombe, C., Rath, T., Zhang, F., Munteanu, B., Brooker, M., &amp; Deardeuff, M. (2015). <a href="https://www.amazon.science/publications/how-amazon-web-services-uses-formal-methods">How Amazon Web Services uses formal methods</a>. <em>Communications of the ACM</em>.</li>
  <li id="ref-barr-2015">Barr, E. T., Harman, M., McMinn, P., Shahbaz, M., &amp; Yoo, S. (2015). <a href="https://eecs481.org/readings/testoracles.pdf">The Oracle Problem in Software Testing: A Survey</a>. <em>IEEE Transactions on Software Engineering</em>.</li>
  <li id="ref-basiri-2016">Basiri, A., et al. (2016). <a href="https://arxiv.org/abs/1702.05843">Chaos Engineering</a>. <em>IEEE Software</em> (arXiv:1702.05843).</li>
  <li id="ref-benchmark-illusion-2026">Benchmark Illusion. (2026). <a href="https://arxiv.org/html/2602.11898v1">Disagreement among LLMs and Its Scientific Consequences</a>. <em>arXiv:2602.11898</em>.</li>
  <li id="ref-betterbench-2024">Reuel, A., et al. (2024). <a href="https://arxiv.org/abs/2411.12990">BetterBench: Assessing AI Benchmarks, Uncovering Issues, and Establishing Best Practices</a>. <em>NeurIPS</em>.</li>
  <li id="ref-boeing-2020">U.S. House Committee on Transportation &amp; Infrastructure. (2020). <a href="https://democrats-transportation.house.gov/imo/media/doc/final_boeing_737_max_report1.pdf">Final Committee Report: Design, Development &amp; Certification of the Boeing 737 MAX</a>.</li>
  <li id="ref-burden-2025">Burden, J., Hernández-Orallo, J., et al. (2025). <a href="https://arxiv.org/html/2309.11975v2">Inferring Capabilities from Task Performance with Bayesian Triangulation</a> &amp; <a href="https://arxiv.org/abs/2503.06378">General Scales Unlock AI Evaluation with Explanatory and Predictive Power (ADeLe)</a>.</li>
  <li id="ref-caib-2003">Columbia Accident Investigation Board. (2003). <a href="https://www.nasa.gov/wp-content/uploads/static/history/columbia/reports/CAIBreportv1.pdf">CAIB Report Volume 1</a>. <em>NASA</em>.</li>
  <li id="ref-campbell-1979">Campbell, D. T. (1979). <a href="https://ideas.repec.org/a/eee/epplan/v2y1979i1p67-90.html">Assessing the impact of planned social change</a>. <em>Evaluation and Program Planning</em>, 2(1), 67–90.</li>
  <li id="ref-cascading-2026">Cascading Effects. (2026). <a href="https://arxiv.org/pdf/2603.00088">Cascading Effects in LLM Agent Evaluations</a>. <em>arXiv:2603.00088</em>.</li>
  <li id="ref-cat-2024">Adaptive Testing Research. (2024). <a href="https://arxiv.org/html/2404.00712v4">Computerized Adaptive Testing for Language Models</a>. <em>arXiv:2404.00712</em>.</li>
  <li id="ref-cronbach-1955">Cronbach, L. J., &amp; Meehl, P. E. (1955). <a href="https://pubmed.ncbi.nlm.nih.gov/13245896/">Construct validity in psychological tests</a>. <em>Psychological Bulletin</em>, 52(4), 281–302.</li>
  <li id="ref-dijkstra-1969">Dijkstra, E. W. (1969/1970). <a href="https://www.cs.utexas.edu/~EWD/transcriptions/EWD02xx/EWD249/EWD249.html">Notes on Structured Programming (EWD 249)</a>.</li>
  <li id="ref-dobbe-2022">Dobbe, R. (2022). <a href="https://arxiv.org/html/2202.09292">System Safety and Artificial Intelligence</a>. <em>arXiv:2202.09292</em>.</li>
  <li id="ref-fda-clinical">U.S. FDA. <a href="https://www.fda.gov/patients/drug-development-process/step-3-clinical-research">Step 3: Clinical Research</a> &amp; <a href="https://www.fda.gov/media/188920/download">Sentinel Initiative Progress Report</a>.</li>
  <li id="ref-feynman-1986">Feynman, R. P. (1986). <a href="https://www.nasa.gov/history/rogersrep/v2appf.htm">Personal Observations on Reliability of Shuttle (Appendix F)</a>. <em>Report of the Presidential Commission on the Space Shuttle Challenger Accident</em>.</li>
  <li id="ref-geirhos-2020">Geirhos, R., et al. (2020). <a href="https://arxiv.org/abs/2004.07780">Shortcut Learning in Deep Neural Networks</a>. <em>Nature Machine Intelligence</em>.</li>
  <li id="ref-heartbleed-2014">CISA. (2014). <a href="https://www.cisa.gov/news-events/alerts/2014/04/08/openssl-heartbleed-vulnerability-cve-2014-0160">Alert TA14-098A: OpenSSL Heartbleed Vulnerability (CVE-2014-0160)</a>.</li>
  <li id="ref-holleman-2020">Holleman, G. A., Hooge, I. T. C., Kemner, C., &amp; Hessels, R. S. (2020). <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7204431/">The 'Real-World Approach' and Its Problems: A Critique of the Term Ecological Validity</a>. <em>Frontiers in Psychology</em>.</li>
  <li id="ref-inozemtseva-2014">Inozemtseva, L., &amp; Holmes, R. (2014). <a href="https://www.cs.ubc.ca/~rtholmes/papers/icse_2014_inozemtseva.pdf">Coverage Is Not Strongly Correlated with Test Suite Effectiveness</a>. <em>ACM ICSE</em>.</li>
  <li id="ref-irt-pmc-2018">Item Response Theory Overview. (2018). <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5875705/">Item Response Theory and Its Applications</a>. <em>PMC5875705</em>.</li>
  <li id="ref-jacob-2003">Jacob, B. A., &amp; Levitt, S. D. (2003). <a href="https://academic.oup.com/qje/article-abstract/118/3/843/1943009">Rotten Apples: An Investigation of the Prevalence and Predictors of Teacher Cheating</a>. <em>Quarterly Journal of Economics</em>.</li>
  <li id="ref-jiang-2026">Jiang, H., et al. (2026). <a href="https://arxiv.org/abs/2607.15190">Can We Trust Item Response Theory for AI Evaluation?</a>. <em>NeurIPS</em>.</li>
  <li id="ref-knight-2013">U.S. SEC. (2013). <a href="https://www.sec.gov/newsroom/press-releases/2013-222">SEC Charges Knight Capital With Violations of Market Access Rule</a>.</li>
  <li id="ref-lapuschkin-2019">Lapuschkin, S., et al. (2019). <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6411769/">Unmasking Clever Hans predictors and assessing what machines really learn</a>. <em>Nature Communications</em>.</li>
  <li id="ref-leucker-2009">Leucker, M., &amp; Schallhart, C. (2009). <a href="https://christian.schallhart.net/publications/2009--jlap--a-brief-account-of-runtime-verification.pdf">A Brief Account of Runtime Verification</a>. <em>Journal of Logic and Algebraic Programming</em>.</li>
  <li id="ref-leveson-stpa">Leveson, N., &amp; Thomas, J. <a href="https://www.icao.int/sites/default/files/SMI/TrainingDocs/Chapter%202%20Safety%20Management%20Fundamentals/2.6-05-SRM-Methodology-STPA.pdf">Safety Risk Management Methodology: STAMP &amp; STPA</a>. <em>ICAO Training Documentation</em>.</li>
  <li id="ref-livebench-2025">White, C., et al. (2025). <a href="https://arxiv.org/abs/2406.19314">LiveBench: A Challenging, Contamination-Limited LLM Benchmark</a>. <em>ICLR</em>.</li>
  <li id="ref-lmsys-2024">LMSYS. (2024). <a href="https://www.lmsys.org/blog/2024-08-28-style-control/">Style Control in Chatbot Arena</a>.</li>
  <li id="ref-manheim-2018">Manheim, D., &amp; Garrabrant, S. (2018). <a href="https://arxiv.org/abs/1803.04585">Categorizing Variants of Goodhart's Law</a>. <em>arXiv:1803.04585</em>.</li>
  <li id="ref-marks-2025">Marks, S., Olah, C., Hubinger, E., et al. / Anthropic. (2025). <a href="https://arxiv.org/abs/2503.10965">Auditing language models for hidden objectives</a> &amp; <a href="https://transformer-circuits.pub/2025/attribution-graphs/methods.html">Circuit Tracing: Revealing Computational Graphs in Language Models</a>.</li>
  <li id="ref-mccoy-2019">McCoy, R. T., Pavlick, E., &amp; Linzen, T. (2019). <a href="https://aclanthology.org/P19-1334/">Right for the Wrong Reasons: Diagnosing Syntactic Heuristics in Natural Language Inference</a>. <em>ACL</em>.</li>
  <li id="ref-messick-1995">Messick, S. (1995). <a href="https://files.eric.ed.gov/fulltext/ED380496.pdf">Validity of Psychological Assessment</a>. <em>American Psychologist</em> / ERIC ED380496.</li>
  <li id="ref-metr-2025">METR. (2025/2026). <a href="https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/">Measuring AI Ability to Complete Long Software Tasks</a> &amp; <a href="https://metr.org/blog/2026-11-20-q4-2026-capability-update/">Q4 2026 Capability Update</a>.</li>
  <li id="ref-miller-2024">Miller, E. / Anthropic. (2024). <a href="https://arxiv.org/abs/2411.00640">Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations</a> &amp; <a href="https://www.anthropic.com/research/statistical-approach-to-model-evals">Anthropic Research</a>.</li>
  <li id="ref-miller-fuzz-1990">Miller, B. P., Fredriksen, L., &amp; So, B. (1990). <a href="https://www.paradyn.org/papers/fuzz.pdf">An Empirical Study of the Reliability of UNIX Utilities</a>. <em>Communications of the ACM</em>.</li>
  <li id="ref-nist-aria-2025">NIST. (2025). <a href="https://www.nist.gov/publications/assessing-risks-and-impacts-ai-aria-pilot-evaluation-report">NIST AI 700-2: ARIA Pilot Evaluation Report</a>.</li>
  <li id="ref-openai-2026">OpenAI. (2026). <a href="https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/">Why we no longer evaluate SWE-bench Verified</a> &amp; <a href="https://deploymentsafety.openai.com/gpt-6-astra">GPT-6 Astra System Card</a>.</li>
  <li id="ref-perrow-1984">Perrow, C. (1984/1999). <a href="https://maritimesafetyinnovationlab.org/wp-content/uploads/2021/04/Normal-Accidents-Living-With-High-Risk-Technologies-Perrow.pdf">Normal Accidents: Living with High-Risk Technologies</a>. <em>Princeton University Press</em>.</li>
  <li id="ref-petrovic-2021">Petrović, G., et al. (2021). <a href="https://arxiv.org/html/2102.11378v2">Practical Mutation Testing at Scale: A view from Google</a>. <em>IEEE TSE</em> (arXiv:2102.11378).</li>
  <li id="ref-polo-2024">Polo, F. M., et al. (2024–2026). <a href="https://arxiv.org/abs/2402.14992">tinyBenchmarks: evaluating LLMs with fewer examples</a> (<em>ICML 2024</em>) &amp; <a href="https://arxiv.org/abs/2511.04689">ATLAS: Adaptive Testing for LLM Evaluation</a>.</li>
  <li id="ref-quickcheck-2000">Claessen, K., &amp; Hughes, J. (2000). <a href="https://www.cs.tufts.edu/~nr/cs257/archive/john-hughes/quick.pdf">QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs</a>. <em>ACM ICFP</em>.</li>
  <li id="ref-raji-2021">Raji, I. D., Bender, E. M., Paullada, A., Denton, E., &amp; Hanna, A. (2021). <a href="https://arxiv.org/html/2111.15366v1">AI and the Everything in the Whole Wide World Benchmark</a>. <em>NeurIPS Datasets and Benchmarks</em>.</li>
  <li id="ref-rasmussen-1997">Rasmussen, J. (1997). <a href="https://orbit.dtu.dk/en/publications/risk-management-in-a-dynamic-society-a-modelling-problem/">Risk management in a dynamic society: a modelling problem</a>. <em>Safety Science</em>, 27(2–3).</li>
  <li id="ref-reason-2000">Reason, J. (2000). <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC1117770/">Human error: models and management</a>. <em>BMJ</em>, 320(7237), 768–770.</li>
  <li id="ref-rice-theorem">Wikipedia. <a href="https://en.wikipedia.org/wiki/Rice%27s_theorem">Rice's theorem</a>.</li>
  <li id="ref-scaffolding-2026">Safety Under Scaffolding. (2026). <a href="https://arxiv.org/html/2603.10044v1">Safety Under Scaffolding in Autonomous LLM Agents</a>. <em>arXiv:2603.10044</em>.</li>
  <li id="ref-segura-2016">Segura, S., Fraser, G., Sanchez, A. B., &amp; Ruiz-Cortés, A. (2016). <a href="https://eprints.whiterose.ac.uk/id/eprint/110335/1/segura16-tse.pdf">A Survey on Metamorphic Testing</a>. <em>IEEE Transactions on Software Engineering</em>.</li>
  <li id="ref-sel4-2009">Klein, G., et al. (2009). <a href="https://www.sigops.org/s/conferences/sosp/2009/papers/klein-sosp09.pdf">seL4: Formal Verification of an OS Kernel</a>. <em>ACM SOSP</em>.</li>
  <li id="ref-singh-2025">Singh, S., et al. (2025). <a href="https://arxiv.org/abs/2504.20879">The Leaderboard Illusion</a>. <em>NeurIPS</em>.</li>
  <li id="ref-stpa-ai-2025">STPA for AI Systems. (2025). <a href="https://arxiv.org/html/2503.12043v1">Applying System-Theoretic Process Analysis to LLM Agents</a>. <em>arXiv:2503.12043</em>.</li>
  <li id="ref-swebench-contam-2026">SWE-bench Contamination Study. (2026). <a href="https://arxiv.org/html/2610.19447">Measuring Data Contamination on Software Engineering Benchmarks</a>. <em>arXiv:2610.19447</em>.</li>
  <li id="ref-swiss-cheese-2024">Swiss Cheese Model for AI Safety. (2024). <a href="https://arxiv.org/pdf/2408.02205">A Defense-in-Depth Perspective on AI Systems</a>. <em>arXiv:2408.02205</em>.</li>
  <li id="ref-taylor-2023">Taylor &amp; Francis. (2023). <a href="https://www.tandfonline.com/doi/full/10.1080/23738871.2023.2281675">Redundancy and Complexity in High-Risk Socio-Technical Systems</a>.</li>
  <li id="ref-therac25-1993">Leveson, N. G., &amp; Turner, C. S. (1993). <a href="https://web.mit.edu/6.033/2004/wwwdocs/papers/Therac_1.html">An Investigation of the Therac-25 Accidents</a>. <em>IEEE Computer</em>.</li>
  <li id="ref-tmi-1979">World Nuclear Association. <a href="https://world-nuclear.org/information-library/safety-and-security/safety-of-plants/three-mile-island-accident">Three Mile Island Accident</a>.</li>
  <li id="ref-vera-2026">VERA. (2026). <a href="https://arxiv.org/html/2610.05923v1">Single-Axis Decoupled Evaluation of Models and Harnesses</a>. <em>arXiv:2610.05923</em>.</li>
  <li id="ref-vioxx-2007">Krumholz, H. M., Ross, J. S., Presler, A. H., &amp; Egilman, D. S. (2007). <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC1779871/">What have we learnt from Vioxx?</a>. <em>BMJ</em>, 334(7585), 120–123.</li>
  <li id="ref-zech-2018">Zech, J. R., et al. (2018). <a href="https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1002683">Variable generalization performance of a deep learning model to detect pneumonia in chest radiographs</a>. <em>PLOS Medicine</em>.</li>
  <li id="ref-zhang-2026">Zhang, Y., et al. (2026). <a href="https://arxiv.org/abs/2605.23950">Stop Comparing LLM Agents Without Disclosing the Harness</a>. <em>arXiv:2605.23950</em>.</li>
</ol>
