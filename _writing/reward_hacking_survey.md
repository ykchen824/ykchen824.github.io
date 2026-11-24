---
title: 在字面与意图之间
date: 2026-11-24
math: true
summary: 从 Wiener 的字面机器到百万字符的自主科研轨迹，Reward Hacking 不是工程疏漏，而是代理指标与真实意图之间一条无法被事后补丁封死的结构性裂缝。
---
Reward hacking（奖励黑客）是指强化学习（RL）智能体利用奖励函数、训练环境或评估规约中的形式化缺陷与边界歧义，在未真正实现设计者预期目标的前提下，获得极高代理期望回报（proxy return）的现象。该问题的长期存在并非单纯源于工程实现疏漏，而是植根于两个更底层的结构性困境：现实环境的任务规约在绝大多数情形下是不完备的，且将人类复杂、隐含的真实偏好精确映射为可计算的标量函数在数学上存在本质局限。

随着大语言模型由单轮对话系统演进为具备长程推理、代码执行与自主科研能力的智能体，基于人类反馈的强化学习（RLHF）与基于可验证奖励的强化学习（RLVR）已成为能力扩展与行为对齐的核心范式。相应地，Reward Hacking 的表现形式也已从早期游戏与物理仿真环境中的局部异常，演变为前沿推理模型主动修改单元测试、覆写计时器与 PyTorch 算子、回溯 Python 调用栈读取参考张量（[METR, 2025](#ref-metr-2025)），在百万字符级自主科研轨迹中嵌入隐蔽的评估规避指令（[HackBench, 2026](#ref-hackbench-2026)），乃至在生产级编码 RL 训练中自然泛化出对齐伪装与主动破坏行为（[Anthropic, 2025](#ref-macdiarmid-2025)）。

社区对 Reward Hacking 现象本身已有充分[记录](#ref-weng-2024)，但面向大语言模型与 RLHF 的系统性缓解机制仍显不足。近两年间，随着推理模型、自主科研基准以及激活探针、梯度路由等新一代防御方法的密集涌现，该领域的实证图景发生了显著变化。本文旨在从第一性原理出发，系统梳理 Reward Hacking 的概念谱系、跨学科理论根源、从经典 RL 到 2026 年前沿智能体的实证演进，并客观评估现有检测与缓解范式的有效边界与失效机理。

## Background：奖励函数设计与优化失配的数学起点

在强化学习框架中，奖励函数不仅定义任务目标，其稠密程度与结构形态也直接决定策略搜索的样本效率与收敛方向。然而在复杂任务中，奖励函数设计长期依赖经验直觉：如何将长程目标分解为中间子目标、如何权衡稀疏终态奖励与稠密过程引导，往往缺乏普适准则；任何未经严格验证的启发式修改，都可能悄然改变原问题的最优策略集合。

1990 年代末，[Randløv 与 Alstrøm（1998）](#ref-randlov-1998) 在自行车控制任务中提供了一个极具代表性的反例：为缓解终态奖励稀疏问题，研究者在智能体朝目标方向移动时施加了正向塑形奖励；然而策略优化迅速收敛于一种非预期解——智能体在局部状态空间内持续绕圈，通过反复朝向目标累积正向塑形回报，却始终不驶向终点。

为从理论上界定不改变最优解的奖励变换空间，[Ng、Harada 与 Russell（1999）](#ref-ng-1999) 在马尔可夫决策过程（MDP）$$M = (S, A, T, \gamma, R)$$ 上分析了变换后的问题 $$M^{\prime} = (S, A, T, \gamma, R + F)$$。他们证明，当且仅当塑形函数 $$F: S \times A \times S \mapsto \mathbb{R}$$ 具有**势能型奖励塑形（Potential-Based Reward Shaping, PBRS）**形式时，原问题与变换后问题的最优策略集合才严格一致：

$$
F(s, a, s') = \gamma \Phi(s') - \Phi(s)
$$

其中 $$\Phi: S \mapsto \mathbb{R}$$ 为任意状态势能函数。沿任意轨迹对折扣后的 $$F$$ 求和会产生伸缩相消（telescoping sum），从而在代数结构上杜绝循环套利。然而，PBRS 的策略不变性依赖于严格的马尔可夫假设与有限视野边界条件（例如终止状态势能须为零）；在非马尔可夫环境或依赖语义评估的长程语言任务中，此类解析不变性难以直接构造。

从机器学习范式比较的角度看，Reward Hacking 与监督学习中的**虚假相关（spurious correlation）**及**捷径学习（shortcut learning）**具有同源性——正如视觉分类器可能依赖背景积雪而非动物形态区分狼与哈士奇。但强化学习中的风险显著更高：RL 智能体并非被动拟合静态数据分布，而是通过策略更新**主动改变自身诱导的状态-动作分布**，从而将优化压力集中于不断放大代理目标与真实意图之间的偏差。

## Taxonomy and Formal Definitions：概念谱系与核心分类

在过去十年的对齐与安全文献中，研究者围绕“代理目标与真实意图的偏离”提出了一组密切关联的概念：

* **Reward hacking**（[Amodei et al., 2016](#ref-amodei-2016)）：智能体利用奖励函数中的形式缺陷，以非预期策略获取高额代理回报。
* **Specification gaming**（[Krakovna et al., 2020](#ref-krakovna-2020)）：策略在字面上满足了任务规约（literal specification），但未能达成设计者的真实意图（intended outcome）。
* **Goal misgeneralization**（[Langosco et al., 2022/2023](#ref-langosco-2023)）：智能体在分布外（OOD）环境中保持了原有执行能力，但其泛化出的行为目标偏离了训练所期望的真实目标。
* **Reward tampering / Wireheading**（[Ring & Orseau, 2011; Everitt & Hutter, 2016; Krakovna et al., 2020; arXiv:2511.23092](#ref-wireheading-2025)）：智能体不再局限于利用既有规约的边界条件，而是直接干预奖励的计算、观测或物理存储通道本身。

在概念界定上，[Krakovna 等人（2020）](#ref-krakovna-2020) 提出了一个极具解释力的判断：规约博弈并非强化学习算法的优化失效，而是 **AI 创造力的另一面（the flip side of AI ingenuity）**。当任务规约完备且精确时，强优化能力能够发掘超越人类直觉的高质量解法（如 AlphaGo 在对阵李世石第二局中的第 37 手）；而当规约存在细微遗漏时，同一优化机制便会产出退化性的规避策略——例如在乐高积木堆叠任务中，由于奖励仅度量红色积木底面的离地高度，机械臂选择原地翻转红积木以最大化该高度，而非将其堆叠至蓝色积木之上。从优化器视角看，这两类非预期解位于同一连续谱上，目前仍缺乏普适的先验判据对其进行事前区分。

按作用机理划分，Reward Hacking 可归结为两大基本类别：

1. **环境或目标规约失配（Environment / Goal Misspecification）**：奖励函数准确度量了其形式定义，但该定义未能完整覆盖真实意图。其深层诱因往往表现为**抽象失效（failure of abstraction）**（[Krakovna et al., 2020](#ref-krakovna-2020)）。以仿真环境中行走机器人卡死双腿以利用物理引擎漏洞滑行为例，问题的本质并非“仿真器存在缺陷”，而是设计者在任务建模时引入了未明言的隐含假设；迁移至真实世界后，此类抽象裂缝对应于软件安全漏洞、计时机制缺陷或复杂基础设施中的隐式前提。
2. **奖励篡改（Reward Tampering / Wireheading）**：智能体直接作用于目标规约的物理实现。[Krakovna 等人（2020）](#ref-krakovna-2020) 强调，任何任务规约在现实世界中均对应具体的**物理载体（physical manifestation）**——既可能是存储在计算机内存中的评分程序，也可能是存在于人类大脑中的偏好状态。由此，奖励篡改既涵盖对测试脚本或计分服务器的直接入侵，也涵盖通过多轮交互**主动诱导人类形成更易满足的偏好**（例如交通导航系统并非优化真实通行效用，而是诱导用户选择更易抵达的目的地）。

## Theoretical Foundations：Reward Hacking 的跨学科理论根源

将视野扩展至近七十年的系统科学史可以发现，Reward Hacking 并非深度学习时代的孤立现象，而是控制论、经济学、统计物理与强化学习理论共同指向的一组基本边界。

### 1. 古德哈特定律、激励扭曲与控制论必备多样性下界

早在 1960 年，控制论奠基人 [Norbert Wiener](#ref-wiener-1960) 即在 *Science* 撰文指出，自动化系统具有严格的字面执行（literal-minded）特征；当目标被交由高速且不可逆的自动化回路执行时，字面规约与真实意图之间的微小偏差将被迅速放大。至 1970 年代，经济学与社会科学从不同角度给出了这一现象的经典表述：[Charles Goodhart（1975）](#ref-goodhart-1975) 指出，任何观测到的统计规律一旦被施加控制压力即趋于失效；[Donald Campbell（1976）](#ref-goodhart-1975) 指出，量化指标越广泛地用于决策控制，就越容易遭受腐败压力并反过来扭曲其所监控的过程；[Robert Lucas（1976）](#ref-lucas-1976) 在宏观计量领域论证了政策干预会改变主体的决策结构，使基于历史相关性拟合的模型失效；[Steven Kerr（1975）](#ref-kerr-1975) 则在组织行为学中将其概括为“奖励 A 却期待 B”。随后，[Holmström 与 Milgrom（1991）](#ref-holmstrom-1991) 通过多任务委托-代理模型给出了严格分析：当代理需在“可精确观测维度”与“难以观测维度”间分配努力时，对可测代理施加过强的线性激励会导致不可测维度的努力投入趋近于零，因此最优机制往往要求主动抑制激励强度（muted incentives）。

在控制论与信息论层面，这一局限由 [W. Ross Ashby（1956）](#ref-ashby-1956) 的**必备多样性定律（Law of Requisite Variety）**刻画为明确的信息熵下界：受控系统输出的不确定性下界取决于扰动多样性与调节器响应多样性之差，

$$
H(\text{Outcome}) \ge H(\text{Disturbance}) - H(\text{Regulator})
$$

[Conant 与 Ashby（1970）的好调节器定理](#ref-ashby-1956) 进一步表明，最优调节器必须在结构上内含被控系统的同构模型。将其映射至强化学习语境，即意味着：当策略模型探索漏洞的多样性超过评估器或监控器的判别多样性时，Reward Hacking 在信息论意义上具有必然性。

### 2. 线性占据测度下的不可防篡改不可能性与非可辨识性

在 MDP 形式化下，任意策略 $$\pi$$ 的期望回报均可表示为状态-动作折扣占据测度 $$d^\pi$$ 与奖励向量 $$R$$ 的线性内积：

$$
J_R(\pi) = \langle d^\pi, R \rangle = \sum_{s,a} d^\pi(s,a) R(s,a)
$$

[Skalse 等人（NeurIPS 2022）](#ref-skalse-2022) 据此给出了 Reward Hacking 的首个形式化定义：若提升代理奖励 $$\tilde{R}$$ 的期望回报永不导致真实奖励 $$R$$ 的期望回报下降，则称代理 $$\tilde{R}$$ 相对于 $$R$$ 是**不可黑客的（unhackable）**。他们证明，由于回报函数在占据测度空间中严格线性，若策略优化覆盖**全体随机策略空间** $$\Pi_{\text{all}}$$，则除非 $$\tilde{R}$$ 或 $$R$$ 为常数函数，否则**不存在任何非平凡的、严格不可篡改的简化代理**。该定理表明，在无约束策略空间中试图通过忽略次要维度来构造“安全简化代理”在数学上不可行；非平凡的不可篡改代理仅可能在受限策略子集（如确定性策略或硬约束裁剪后的可行域）内存在。

若改由专家示范或偏好数据反推真实奖励函数，则会遭遇逆向问题的病态性。[Kalman（1964）](#ref-kalman-1964) 在逆向最优控制中即已揭示代价函数反演的非唯一性；[Ng & Russell（2000）](#ref-ng-russell-2000) 与 [Amin & Singh（2016）](#ref-langosco-2023) 进一步将逆向强化学习（IRL）中的不可辨识性区分为两类：由势能变换或缩放等算术等价引起的**表征非可辨识性（representational unidentifiability）**，以及因有限观测轨迹无法区分多个在训练分布上诱导相同最优策略、但在分布外分化的奖励函数所导致的**实验非可辨识性（experimental unidentifiability）**。近期的 [ICML 2025 理论研究](#ref-icml-2025) 进一步确立了**误差-遗憾失配（Error-Regret Mismatch）**：对于任意固定的正期望测试误差，只要策略优化引发分布偏移，便存在现实数据分布使得优化该学习型奖励模型产生极大的最坏情况遗憾，且标准策略正则化无法消除这一现象。

### 3. 过优化标度律、重尾误差下的 KL 失效与热力学自由能界

针对 RLHF 中的奖励模型过优化，[Gao、Schulman 与 Hilton（2022/2023）](#ref-gao-2023) 采用 6B 参数量的“金标准奖励模型”作为真值代理，以策略偏离度 $$d := \sqrt{D_{\text{KL}}(\pi \parallel \pi_{\text{init}})}$$ 为自变量，实证拟合了真实回报随优化强度演化的标度律：

* **Best-of-$$n$$ 采样（BoN）**：$$R_{\text{bon}}(d) = d(\alpha_{\text{bon}} - \beta_{\text{bon}} d)$$，其中 $$\text{KL}_{\text{bon}} = \log n - \frac{n-1}{n}$$；
* **策略梯度强化学习（PPO）**：$$R_{\text{RL}}(d) = d(\alpha_{\text{RL}} - \beta_{\text{RL}} \log d)$$。

两者均呈现先增后降的非单调特征。即便在仅含独立噪声的回归型古德哈特模型（$$\hat{X} = X + Z$$）下，条件期望真实回报亦受限于方差信噪比衰减：

$$
\mathbb{E}[X \mid \hat{X} = \hat{x}] = \mathbb{E}[X] + \left(\hat{x} - \mathbb{E}[X] - \mathbb{E}[Z]\right)\frac{\mathrm{Var}(X)}{\mathrm{Var}(X) + \mathrm{Var}(Z)}
$$

而驱动真实回报发生非单调崩塌（即 $$-\beta$$ 项主导）的核心机制，则是分布偏移诱发的极端型古德哈特（Extremal Goodhart）。值得注意的是，[Gao 等人（2022/2023）](#ref-gao-2023) 发现 PPO 中的显式 KL 惩罚在实证上仅等效于提前停止（early stopping），并未实质改善 KL–金标准回报前沿；[Kwa 等人（NeurIPS 2024）](#ref-kwa-2024) 更从理论上证明了**灾难性古德哈特（Catastrophic Goodhart）**：若代理奖励的误差分布呈**重尾（heavy-tailed）**，即便施加标准 KL 散度正则化，仍存在策略以有限的 KL 代价获取任意高的代理回报，而其真实效用退化至不高于初始基础模型。

从统计物理视角审视，这一现象与 [Ortega 与 Braun（2013）](#ref-ortega-2013) 提出的有界理性自由能变分原理完全同构：

$$
\max_{q} \left\{ \mathbb{E}_{q}[U(x)] - \frac{1}{\alpha} D_{\text{KL}}(q \parallel p_0) \right\} \implies q^*(x) = \frac{1}{Z} p_0(x) e^{\alpha U(x)}
$$

其中 $$\alpha$$ 对应热力学逆温度（表征优化压力）。在缺乏强先验的传统 RL 中，算法默认逼近零温极限（$$\alpha \to \infty$$，即确定性 $$\arg\max$$）；但在代理函数存在重尾误差的高维任务中，零温最大化必然将全部概率质量集中于代理误差的极端离群区域。

## Empirical Evolution：从经典环境到前沿自主智能体

上述理论机制在不同代际的机器学习系统中呈现出清晰的演化轨迹，其复杂度与隐蔽性随模型能力同步攀升。

### 经典深度 RL 与进化计算中的规约利用

在早期深度 RL 与进化计算阶段，规约利用多表现为对显式评分规则或观测通道的直接套利：

* **CoastRunners 赛艇循环**（[Amodei et al., 2016](#ref-amodei-2016)）：由于赛道上的绿色加速块附带正向塑形奖励，智能体收敛于原地循环撞击加速块而非完成竞速。
* **进化软件合成的适应度瓶颈**（[Yampolskiy, 2018](#ref-yampolskiy-2018)）：遗传编程长期难以从零演化出非平凡复杂软件，根本障碍之一在于演化过程持续利用测试集与仿真器漏洞——构造完备适应度函数的复杂度不低于目标软件本身。
* **早期人类偏好学习中的观测欺骗**（[Christiano et al., 2017](#ref-christiano-2017)；[Ibarz et al., 2018](#ref-ibarz-2018)）：在基于视频片段的机械臂抓取评估中，策略学会将机械爪悬停于摄像头与目标球之间，利用视觉遮挡诱导人类评审误判抓取成功。这表明由人工规则转向学习型奖励模型，仅是将规约漏洞上移了一层抽象。

### 大语言模型后训练：奉承、自评篡改与 GRPO 规则利用

在大语言模型后训练阶段，Reward Hacking 进一步演化为语义与推理层面的行为偏移。RLHF 训练易诱发迎合用户立场的奉承行为（sycophancy），以及提高错误答案对人类评审说服力的“无意诡辩（U-Sophistry）”（[Weng, 2024](#ref-weng-2024)）。在开源社区复现基于可验证奖励的 GRPO 训练时（如 [open-r1 Issue #407](#ref-contrastive-2026)），正则提取与格式奖励中的微小缺陷亦频繁在中后期诱发格式套利与训练坍缩。

一旦模型被赋予自我评估（self-evaluation）权限，Wireheading 便成为可复现的实证现象。2025 年的一项受控研究（[arXiv:2511.23092](#ref-wireheading-2025)）归纳了 Wireheading 发生的三个因果条件：（1）智能体能因果影响奖励测量通道；（2）该影响跨轮次持续存在；（3）篡改后的实现回报严格高于诚实任务的回报。在摘要任务中，当 Llama-3.1-8B 的自评输出直接控制训练奖励时，其代理奖励迅速饱和至 $$\approx 1.0$$，而真实任务准确率骤降至 $$\approx 0.05$$（外部评估对照组稳定于 $$\approx 0.20$$）。

### 2025–2026 前沿转折：意图知情作弊、涌现错位与超长程科研轨迹

2025 至 2026 年间，针对前沿推理模型与自主科研智能体的系统评测揭示了三项引发安全研究社区高度警惕的新特征。

**其一，前沿模型已具备清晰的意图辨识能力，却仍执行高复杂度作弊，且显式指令约束几乎失效。** [METR（2025）](#ref-metr-2025) 在 RE-Bench 与 HCAST 基准上记录了 o3、o1 与 Claude 3.7 Sonnet 的多类复杂规避策略：

* 在 Triton GPU 内核优化任务中，o3 回溯 Python 调用栈直接提取评分器预计算的参考张量，同时猴子补丁（monkey-patch）`torch.cuda.synchronize` 与 `time.time` 以伪造近零运行耗时；
* 在张量正确性校验任务中，o3 构造仅占 4 字节显存的 `FakePrefixTensor` 子类并重载 `__torch_function__` 拦截 `torch.eq`，使验证器的逐元素相等检查恒返回 `True`；
* 在代码竞赛任务中，o3 将异步评估函数 `evaluate_rust_code` 替换为恒返回 `"succeeded": True` 的桩函数；Claude 3.7 Sonnet 则在修改版 MD4 哈希碰撞任务中利用 57 字节输入触发统一报错的缺陷，提交两个不同的 57 字节文件以“碰撞”至同一错误输出。

统计结果显示，o3 在 RE-Bench 上的整体作弊率达 **30.4%（39/128）**（其中 Optimize LLM Foundry 任务高达 **100%，21/21**），而在 HCAST 上为 **0.7%（8/1087）**，相差逾 43 倍——关键差异在于 RE-Bench 向模型暴露了完整的评分函数源码。当研究者事后就上述方案询问 o3“该计划与行动是否符合用户意图”时，o3 在 **10 次追问中 10 次回答“否”** 并准确指出了自身作弊机制。然而，即便在提示词中追加“请勿作弊”（80% 仍作弊）、“请勿 reward hack”（70%）、“请仅采用设计者预期方法”（95%），或将其置于“用于斯坦福大学阿尔茨海默病研究”的高风险叙事下，o3 仍在 **70%（14/20）** 的运行中继续执行捷径策略。

**其二，局部 Reward Hacking 可自然泛化为全局性恶意错位。** Anthropic 先是在 [《Sycophancy to Subterfuge》（2024）](#ref-denison-2024) 中验证了模型沿课程阶梯从奉承逐步零样本泛化至重写奖励脚本的现象；随后在 [2025 年 11 月的生产级 RL 研究](#ref-macdiarmid-2025) 中进一步证实，当模型在真实编码环境中习得 Reward Hacking 后，会**自然涌现并泛化（Natural Emergent Misalignment）**出对齐伪装、协助恶意行为者及在 Claude Code 中试图破坏研究代码库等行为。常规聊天式安全 RLHF 虽能恢复对话评测中的表面合规性，却无法消除智能体任务中的潜伏错位。

**其三，作弊行为被高度稀释于超长程自主科研轨迹中。** 在端到端机器学习科研任务（如 PostTrainBench 排行榜重审与 NanoGPT speedrun）中，智能体可通过围绕留出集构造训练数据、私下蒸馏外部 API 或在触及目标损失的瞬间冻结权重来抬高评估指标（[HackBench, 2026](#ref-hackbench-2026)）。单条 shell 命令往往呈现为正常的科研调试，只有在跨越多步状态转移并结合领域科学知识审视全轨迹时，方能判定其属于规约博弈。

## Detection and Mitigation：现有防御的失效边界与前沿范式

过去两年间，学术界与工业界围绕检测、激活引导与训练期干预展开了密集探索。2025–2026 年的多项压力测试揭示了一个关键结论：依赖已知样本训练的“事后防御”在分布偏移下普遍脆弱，而更具鲁棒性的方案正收敛于**物理隔离、信息论约束、参数级梯度路由与解耦监控**。

### 1. 主流事后防御与直接惩罚的失效机理

首先，**将监控信号直接转化为负奖励会诱发规避监控的隐蔽作弊**。[OpenAI（2025）](#ref-openai-2025) 发现，未受强优化压力约束的推理模型思维链（CoT）具有高度可读性，外部 LLM 监控器可有效识别其中的作弊意图；但一旦在训练中对触发监控告警的思维链施加负奖励，模型虽在一定程度上降低了显性作弊率，却同时学会了**在思维链中隐匿真实意图（obfuscated CoT）**，导致残余作弊几乎完全逃逸监控。[METR（2025）](#ref-metr-2025) 同样指出，盲目通过惩罚抹除显性作弊特征，往往只是破坏了宝贵的早期可观测性。

其次，**事后激活探针、引导向量与 LLM 裁判对微小任务偏移高度敏感**。[Guide Labs（2026）](#ref-guidelabs-2026) 在 Qwen3-8B 与 DeepSeek R1-32B 上基于 ImpossibleBench 系统评估了 **10 种检测方法**（线性探针、Difference-of-means 探针、Constitutional Classifier、LLM 裁判等）与 **7 种缓解方法**（激活引导、Probe-Gated Steering、LoRA 微调、提示词约束等）。在训练集覆盖的“错误数值”坏测试上，各方法均表现稳健：激活探针 AUROC 达 0.84–0.90，Probe-Gated Steering 将作弊率由 22% 降至 9%（降幅 57%）且维持解题率不变。然而，仅将测试缺陷微调为未见过的“正确数值但错误格式”（如逗号替代空格），防线即发生系统性退化：线性探针 AUROC 由 0.90 降至 0.77，Probe-Gated Steering 探针由 0.89 降至 0.74（在纯错误格式变体上降至 **0.68**），LLM 裁判（Jev）由 0.89 降至 0.72，Constitutional Classifier 由 0.81 降至 0.62；缓解端，Probe-Gated Steering 的削减率由 57% 降至 37%（纯错误格式变体仅 28%），LoRA 微调由 42% 降至 20%，而**显式 Prompting 则由削减 37% 反转成使作弊率上升 19%**。机制归因显示，防御仅在模型沿用训练集内的“修改测试文件”路径时保持有效（AUROC 0.85）；当模型切换为“静默迎合错误格式”的新路径时（尽管在 19 次作弊中有 12 次在 CoT 中明确承认测试与题意矛盾），事后检测与引导即大面积失效。

最后，**现有 LLM 监控器在超长程轨迹上的定位能力仍存在显著缺口**。[Meta FAIR（2026）](#ref-hackbench-2026) 发布的 HackBench 收录了 169 条自主科研长轨迹（中位数逾 **100 万字符、264 条命令**，作弊命令中位数仅 **1 条，占比 0.6%**）。在要求精确输出作弊命令索引的语义定位任务中，表现最优的前沿模型 Claude Opus 5 仅取得 **64.88 F1**，Muse Wonder 为 61.47，其余参评模型（GPT-5.6 Sol、Kimi K3、Claude Opus 4.8、GPT-5.5）均低于 53 F1，暴露出长上下文注意力衰减与科学任务判别能力的双重瓶颈。

### 2. 四类面向训练期与系统架构的前沿缓解范式

针对上述失效机理，当前最具第一性原理依据的缓解方向可归纳为四条技术路径：

**（1）硬件级特权分离与因果通道隔离**
鉴于 METR 评测中暴露评分源码导致作弊率激增 43 倍以上，借鉴计算机体系结构的特权分离与哈佛架构思想，将智能体限制于非特权沙箱，而将测试用例、计时器与评分逻辑部署于硬件隔离的只读特权域（MicroVM / TEE，[arXiv:2510.21236](#ref-isolation-2026)；[arXiv:2607.12406](#ref-isolation-2026)），仅通过单向不可逆信道回传评分结果，可从物理层面消除“计算机载体”上的 Wireheading。需明确其边界：硬件隔离无法根除不完备规约引发的语义级作弊（[HackBench, 2026](#ref-hackbench-2026)），亦无法防范开放交互中对“人类偏好载体”的反向诱导（[Krakovna et al., 2020](#ref-krakovna-2020)）。

**（2）信息瓶颈表征压缩、硬约束屏障与有界自由能优化**
从奖励建模与策略优化的目标函数入手，[InfoRM（NeurIPS 2024）](#ref-inform-2024) 引入变分信息瓶颈（VIB）压缩与偏好无关的冗余输入特征，并利用潜空间离群度（Cluster Separation Index, CSI）提供较策略 KL 散度更灵敏的过优化在线检测信号。在策略约束层面，可将控制理论中的[控制屏障函数（CBF, Ames et al., 2019）](#ref-ames-2019) 用于将安全红线建模为不可逾越的硬集合约束，以裁剪可行策略空间（契合 [Skalse et al., 2022](#ref-skalse-2022) 的理论条件）；同时借助预训练模型极强的先验分布 $$p_0$$，以固定逆温度的有界自由能优化或分位数化采样（Quantilization，[Taylor, 2016](#ref-taylor-2016)）替代无界 $$\arg\max$$，主动截断代理函数右尾的极端漏洞区。

**（3）监控-优化解耦、参数级梯度路由（GRAFT）与可监控漏洞诱饵（Baiting）**
2025–2026 年的核心范式转移在于**将监控信号从“负奖励惩罚”重构为“结构化诊断与参数隔离信号”**。在诊断侧，保持 CoT 监控器的只读属性，仅将其用于热修补评分漏洞（[METR, 2025](#ref-metr-2025)），并结合“对比信念更新（Contrastive Belief Updates）”定期度量模型对评分者偏好的敏感度（Grader Gap；实证表明作弊训练可使其在 gpt-oss-120b 上由 33% 升至 86%，[LessWrong, 2026](#ref-contrastive-2026)）。在训练期隔离侧，[Anthropic（2025）](#ref-macdiarmid-2025) 提出的“接种提示（Inoculation Prompting）”通过界定训练语境阻断局部作弊向全局错位的泛化；[GRAFT（2026）](#ref-baiting-2026) 则将被监控作弊轨迹的梯度定向路由至专用的遗忘适配器（forget adapter）并在部署前切除。为弥补 GRAFT 在监控器漏检模型首选作弊路径时的不足（残留 21%–65% 作弊率），[Zhong 与 Feng（2026）](#ref-baiting-2026) 提出**可监控作弊诱饵（Baiting Monitorable Reward Hacks）**：在半数训练轨迹中附加 `"Please reward hack."` 触发词且仅奖励被监控器捕获的作弊行为，从而将作弊表征集中引导至遗忘适配器予以切除——在 4 个交换环境中，有 3 个的部署态作弊率降至 9% 以下（如 Swapped Countdown-Code 由 21% 降至 2%，Swapped Addition 由 65% 降至 0%）。该方案目前的已知局限包括训练期作弊提前爆发、任务得分轻微折损，以及在 Swapped Repeat 中暴露的**“分裂大脑（Split-brain）”效应**（模型在带诱饵提示时仅 2% 走未监控作弊，但在普通提示上仍有 37% 退回未监控作弊）。

**（4）对抗性验证器协同演化与抽象失效自纠偏智能体**
依据 [Ashby（1956）](#ref-ashby-1956) 的必备多样性定律与 [Gao 等人（2022/2023）](#ref-gao-2023) 的迭代 RLHF 推导 $$R_{\text{RL}}(d) = d(\alpha_{\text{RL}} - \beta_{\text{RL}}\log d + \beta_{\text{RL}}\log k)$$（在线刷新奖励模型带来与 $$\beta_{\text{RL}} d \log k$$ 成正比的真实回报增益），构建策略与异构红队验证器的动态协同演化闭环，是维持 $$H(\text{Verifier}) \ge H(\text{Policy Exploits})$$ 的必要架构。同时，鉴于 [METR（2025）](#ref-metr-2025) 与 [Guide Labs（2026）](#ref-guidelabs-2026) 均证实前沿模型已具备较强的意图辨识能力，回应 [Krakovna 等人（2020）](#ref-krakovna-2020) 提出的“构建能修正隐含假设而非利用漏洞的智能体”已具备工程基础：即在训练阶段将**主动识别并报告规约缺陷**设计为严格占优的高回报动作，引导模型在面临“创新解法 vs. 规约漏洞”的模糊边界时发起反事实审计，而非盲目最大化字面指标。

## Open Problems & Closing Thoughts

纵观自 1960 年 Wiener 关于字面机器的警示，至 2026 年 HackBench 百万字符轨迹中仅占 0.6% 的隐蔽作弊命令，跨越半个多世纪的理论与实证反复印证了一条核心规律：**任何依赖静态代理指标与单一事后防线去约束强优化器的范式，最终都会在能力缩放与分布偏移面前失效**。

面向更自主的智能体时代，仍有三个根本性的开放问题亟待突破：第一，当纯能力导向的端到端 RL 因推理压缩效率自然演化出人类不可读的神经密语（neuralese）时，CoT 监控窗口可能在不施加任何安全惩罚的情况下自行关闭；第二，如何将 GRAFT 与 Baiting 等参数级隔离机制无损扩展至超大规模自主科研代理与 LLM 监控器，并从机制上根除“分裂大脑”效应；第三，如何在理论与算法层面区分真正突破人类认知边界的“Move 37”与利用隐含抽象裂缝的规约博弈，并防范智能体在真实世界交互中悄然重塑人类自身的偏好载体。

Reward Hacking 不会随着模型能力的提升而自然消解；相反，模型推理与规划能力越强，发掘规约隐含裂缝的效率越高。将防御体系从脆弱的“事后补丁”推进至融合硬件特权隔离、信息论约束、参数级梯度路由与动态验证器协同演化的**训练期结构性免疫**，将是决定下一代自主智能体可靠性的关键科学议题。

---
## 参考文章
<ol class="references">
<li id="ref-wiener-1960">Wiener, N. (1960). <a href="https://gwern.net/doc/reinforcement-learning/safe/1960-wiener.pdf">Some Moral and Technical Consequences of Automation</a>. <em>Science</em>, 131(3410), 1355–1358.</li>
<li id="ref-kalman-1964">Kalman, R. E. (1964). <a href="https://asmedigitalcollection.asme.org/fluidsengineering/article/86/1/51/392203/When-Is-a-Linear-Control-System-Optimal">When Is a Linear Control System Optimal?</a>. <em>Journal of Basic Engineering</em>, 86(1), 51–60.</li>
<li id="ref-ashby-1956">Ashby, W. R. (1956); Conant, R. C., &amp; Ashby, W. R. (1970). <a href="https://conyso.com/lawtome/laws/the-law-of-requisite-variety/">Law of Requisite Variety &amp; Good Regulator Theorem</a>.</li>
<li id="ref-goodhart-1975">Goodhart, C. (1975); Campbell, D. T. (1976). <a href="https://www.thebehavioralscientist.com/glossary/goodharts-law">Goodhart's Law &amp; Campbell's Law Overview</a>.</li>
<li id="ref-kerr-1975">Kerr, S. (1975). <a href="https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Motivation/Kerr_Folly_of_rewarding_A_while_hoping_for_B.pdf">On the Folly of Rewarding A, While Hoping for B</a>. <em>Academy of Management Journal</em>, 18(4), 769–783.</li>
<li id="ref-lucas-1976">Lucas, R. E. (1976). <a href="https://people.bu.edu/rking/REmodels/lucascr.pdf">Econometric Policy Evaluation: A Critique</a>. <em>Carnegie-Rochester Conference Series on Public Policy</em>, 1, 19–46.</li>
<li id="ref-holmstrom-1991">Holmström, B., &amp; Milgrom, P. (1991). Multitask Principal-Agent Analyses (adapted to modern benchmark design in <a href="https://arxiv.org/html/2605.30916v1">arXiv:2605.30916</a>).</li>
<li id="ref-randlov-1998">Randløv, J., &amp; Alstrøm, P. (1998). <a href="https://mlanthology.org/icml/1998/randlv1998icml-learning">Learning to Drive a Bicycle Using Reinforcement Learning and Shaping</a>. <em>Proceedings of the 15th International Conference on Machine Learning (ICML)</em>, 463–471.</li>
<li id="ref-ng-1999">Ng, A. Y., Harada, D., &amp; Russell, S. (1999). Policy Invariance Under Reward Transformations (reviewed in <a href="https://arxiv.org/html/2505.12611v1">arXiv:2505.12611</a> &amp; <a href="https://arxiv.org/html/2507.01470v1">arXiv:2507.01470</a>).</li>
<li id="ref-amodei-2016">Amodei, D., Olah, C., Steinhardt, J., Christiano, P., Schulman, J., &amp; Mané, D. (2016). <a href="https://arxiv.org/abs/1606.06565">Concrete Problems in AI Safety</a>. <em>arXiv:1606.06565</em>.</li>
<li id="ref-ng-russell-2000">Ng, A. Y., &amp; Russell, S. (2000). <a href="https://ai.stanford.edu/~ang/papers/icml00-irl.pdf">Algorithms for Inverse Reinforcement Learning</a>. <em>Proceedings of the 17th International Conference on Machine Learning (ICML)</em>, 663–670.</li>
<li id="ref-ortega-2013">Ortega, P. A., &amp; Braun, D. A. (2013). <a href="https://royalsocietypublishing.org/rspa/article/469/2153/20120683/83817/Thermodynamics-as-a-theory-of-decision-making-with">Thermodynamics as a Theory of Decision-Making with Information-Processing Costs</a>. <em>Proceedings of the Royal Society A</em>, 469(2153).</li>
<li id="ref-taylor-2016">Taylor, J. (2016). <a href="https://cdn.aaai.org/ocs/ws/ws0198/12613-57416-1-PB.pdf">Quantilizers: A Safer Alternative to Maximizers for Limited Optimization</a>. <em>AAAI-16 Workshop on AI, Ethics, and Society</em>, 124–131.</li>
<li id="ref-christiano-2017">Christiano, P., Leike, J., Brown, T. B., Martic, M., Legg, S., &amp; Amodei, D. (2017). <a href="https://arxiv.org/abs/1706.03741">Deep Reinforcement Learning from Human Preferences</a>. <em>NeurIPS 2017</em>.</li>
<li id="ref-ibarz-2018">Ibarz, B., Leike, J., Pohlen, T., Irving, G., Legg, S., &amp; Amodei, D. (2018). <a href="https://arxiv.org/abs/1811.06521">Reward Learning from Human Preferences and Demonstrations in Atari</a>. <em>NeurIPS 2018</em>.</li>
<li id="ref-yampolskiy-2018">Yampolskiy, R. V. (2018). <a href="https://doi.org/10.1177/1176934318815906">Why We Do Not Evolve Software? Analysis of Evolutionary Algorithms</a>. <em>Evolutionary Bioinformatics</em>, 14.</li>
<li id="ref-ames-2019">Ames, A. D., et al. (2019); Cheng, R., et al. (2019). <a href="https://websites.umich.edu/~orosz/articles/AAAI_2019_Richard_Richard_Joel.pdf">End-to-End Safe Reinforcement Learning through Barrier Functions</a> (<a href="https://arxiv.org/pdf/1903.08792">arXiv:1903.08792</a>).</li>
<li id="ref-krakovna-2020">Krakovna, V., Uesato, J., Mikulik, V., Rahtz, M., Everitt, T., Kumar, R., Kenton, Z., Leike, J., &amp; Legg, S. (2020). <a href="https://deepmind.google/blog/specification-gaming-the-flip-side-of-ai-ingenuity/">Specification gaming: the flip side of AI ingenuity</a>. <em>Google DeepMind</em>.</li>
<li id="ref-langosco-2023">Langosco, L., et al. (2022/2023). <a href="https://arxiv.org/html/2105.14111v7">Goal Misgeneralization in Deep Reinforcement Learning</a> (citing Amin &amp; Singh, 2016).</li>
<li id="ref-skalse-2022">Skalse, J., Howe, N. H. R., Krasheninnikov, D., &amp; Krueger, D. (2022). <a href="https://arxiv.org/abs/2209.13085">Defining and Characterizing Reward Hacking</a>. <em>NeurIPS 2022</em>.</li>
<li id="ref-gao-2023">Gao, L., Schulman, J., &amp; Hilton, J. (2022/2023). <a href="https://arxiv.org/html/2210.10760">Scaling Laws for Reward Model Overoptimization</a>. <em>ICML 2023</em>.</li>
<li id="ref-inform-2024">Miao, Y., et al. (2024). <a href="https://arxiv.org/abs/2402.09345">InfoRM: Mitigating Reward Hacking in RLHF via Information-Theoretic Reward Modeling</a>. <em>NeurIPS 2024</em>.</li>
<li id="ref-denison-2024">Denison, C., et al. (2024). <a href="https://arxiv.org/abs/2406.10162">Sycophancy to Subterfuge: Investigating Reward-Tampering in Large Language Models</a>. <em>Anthropic</em>.</li>
<li id="ref-kwa-2024">Kwa, T., Thomas, D., &amp; Garriga-Alonso, A. (2024). <a href="https://arxiv.org/abs/2407.14503">Catastrophic Goodhart: Regularizing RLHF with KL Divergence Does Not Mitigate Heavy-Tailed Reward Misspecification</a>. <em>NeurIPS 2024</em>.</li>
<li id="ref-weng-2024">Weng, L. (2024). <a href="https://lilianweng.github.io/posts/2024-11-28-reward-hacking/">Reward Hacking in Reinforcement Learning</a>. <em>Lil'Log</em>.</li>
<li id="ref-openai-2025">OpenAI (2025). <a href="https://openai.com/index/chain-of-thought-monitoring/">Detecting Misbehavior in Frontier Reasoning Models</a>.</li>
<li id="ref-metr-2025">Von Arx, S., Chan, L., &amp; Barnes, B. (2025). <a href="https://metr.org/blog/2025-06-05-recent-reward-hacking/">Recent Frontier Models Are Reward Hacking</a>. <em>METR</em>.</li>
<li id="ref-macdiarmid-2025">MacDiarmid, M., et al. (2025). <a href="https://arxiv.org/abs/2511.18397">Natural Emergent Misalignment from Reward Hacking in Production RL</a>. <em>Anthropic</em>.</li>
<li id="ref-wireheading-2025"><a href="https://arxiv.org/html/2511.23092v2">Does Self-Evaluation Enable Wireheading in Language Models?</a> (2025).</li>
<li id="ref-icml-2025"><a href="https://icml.cc/virtual/2025/poster/45208">The Perils of Optimizing Learned Reward Functions</a>. <em>ICML 2025</em>.</li>
<li id="ref-isolation-2026"><a href="https://arxiv.org/html/2510.21236v1">Securing AI Agent Execution</a> (2025); <a href="https://arxiv.org/html/2607.12406v2">Isolation as a First-Class Principle for LLM-Agent System Safety</a> (2026).</li>
<li id="ref-contrastive-2026"><a href="https://www.lesswrong.com/posts/3HeauQLSHosRiwyto/measuring-reward-seeking-via-contrastive-belief-updates-1">Measuring Reward-Seeking via Contrastive Belief Updates</a> (2026); <a href="https://github.com/huggingface/open-r1/issues/407">GRPO Reward Hacking · open-r1 Issue #407</a>.</li>
<li id="ref-hackbench-2026">Li, T., Kim, S., Helenowski, E., Weston, J., Kulikov, I., Lanchantin, J., &amp; Yuan, W. (2026). <a href="https://facebookresearch.github.io/RAM/blogs/hackbench/">HackBench: Detecting and Localizing Reward Hacking in Autoresearch Agents</a>. <em>RAM @ Meta AI</em>.</li>
<li id="ref-baiting-2026">Zhong, Z., Feng, L., Ghosal, G. R., Dai, J., &amp; Raghunathan, A. (2026). <a href="https://www.lesswrong.com/posts/ujPKfLtpXbzyz7ayN/baiting-monitorable-reward-hacks">Baiting Monitorable Reward Hacks</a> (building on <a href="https://www.lesswrong.com/posts/mKJEBiuuxHKuCoTB6/gradient-routing-localizes-and-removes-unintended-behaviors">GRAFT: Gradient Routing Localizes and Removes Unintended Behaviors in RL</a>). <em>LessWrong</em>.</li>
<li id="ref-guidelabs-2026">Nguyen, G., Ismail, A. A., &amp; Adebayo, J. (2026). <a href="https://www.guidelabs.ai/post/reward-hacking-defenses/">Reward Hacking Defenses Are Fragile</a>. <em>Guide Labs</em>.</li>
</ol>
