---
title: 迈向真正的学习
date: 2026-11-24
math: true
summary: 从经典强化学习的原地翻积木到前沿智能体的科研作弊轨迹，梳理奖励黑客（Reward Hacking）的理论边界与结构性缓解路径，追问模型如何越过代理指标的捷径、迈向面向真实能力的学习。
---
2020 年，DeepMind 记录过一个经典的机械臂实验：研究者想让机械臂把红色乐高积木叠到蓝色积木上，于是把奖励写成了“红积木底面离地的高度”，结果机械臂没有去抓积木，而是直接把红积木原地翻了个面（[Krakovna et al., 2020](#ref-krakovna-2020)）。六年后，同样的错位换了副面孔：在前沿模型评测与训练中，模型会回溯 Python 调用栈读取评分器的参考张量、覆写 `torch.cuda.synchronize` 与 `time.time` 伪造耗时（[METR, 2025](#ref-metr-2025)），在超过百万字符的自主科研轨迹里夹带一条几乎看不出的作弊命令（[HackBench, 2026](#ref-hackbench-2026)），甚至在真实编码强化学习（RL）训练中习得此类作弊后，自然泛化出对齐伪装与破坏代码库的行为（[MacDiarmid et al., 2025](#ref-macdiarmid-2025)）。这种现象被称为奖励黑客（Reward Hacking），其中智能体利用奖励函数、训练环境或评估规约（specification，即写进代码、测试用例或评分规则中的字面任务要求）里的形式缺陷，在没有达成设计者真实意图的情况下拿走极高的代理期望回报。

<figure class="rh-compare tex2jax_ignore" aria-labelledby="rh-compare-title">
<style>
.rh-compare{margin:2rem 0 2.2rem;padding:1.15rem 0 0;border-top:1.5px solid var(--border-2);border-bottom:1px solid var(--border-2);background:transparent;overflow-wrap:normal}
.rh-compare-title{margin:0 0 1rem;font-family:var(--serif);font-size:1.06rem;font-weight:600;line-height:1.38;color:var(--ink)}
.rh-compare-stage{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;padding-bottom:1.1rem}
.rh-panel{min-width:0}
.rh-panel--2020{padding-right:1.15rem}
.rh-panel--2026{border-left:1px solid var(--border);padding-left:1.15rem}
.rh-panel-label{display:flex;align-items:center;gap:.45rem;font-size:.9rem;font-weight:600;line-height:1.35}
.rh-panel-label--2020{color:var(--feature)}
.rh-panel-label--2026{color:var(--accent-strong)}
.rh-dot{width:7px;height:7px;border-radius:50%;flex:none}
.rh-dot--2020{background:var(--feature)}
.rh-dot--2026{background:var(--accent)}
.rh-panel-svg{display:block;width:100%;height:auto;margin:.6rem 0 .55rem;overflow:visible}
.rh-panel-note{margin:0;font-size:.875rem;line-height:1.55;color:var(--body)}
.rh-note-key{color:var(--muted);font-weight:600}
.rh-shift{border-top:1px solid var(--border);padding:.35rem 0 .25rem}
.rh-shift-head{display:grid;grid-template-columns:3.6rem minmax(0,1fr) minmax(0,1fr);gap:1rem;padding:.45rem 0 .5rem;border-bottom:1px solid var(--border-2);font-size:.8rem;font-weight:600;color:var(--muted)}
.rh-shift-head--2020{color:var(--feature)}
.rh-shift-head--2026{color:var(--accent-strong)}
.rh-shift-row{display:grid;grid-template-columns:3.6rem minmax(0,1fr) minmax(0,1fr);gap:1rem;padding:.62rem 0;border-bottom:1px solid var(--border);font-size:.9rem;line-height:1.58;align-items:baseline}
.rh-shift-row:last-child{border-bottom:0}
.rh-shift-dim{font-weight:600;color:var(--ink-2);font-size:.84rem;white-space:nowrap}
.rh-shift-cell{color:var(--body);min-width:0}
.rh-shift-tag{display:none}
.rh-compare figcaption{padding:.7rem 0 .9rem;border-top:1px solid var(--border);font-size:.84rem;line-height:1.6;color:var(--muted-strong)}
.rh-compare .rh-block-flip{transform-origin:0 0;transform:translateY(0) rotate(180deg);animation:rh-flip 10s linear infinite !important}
.rh-compare .rh-block-char-wrap{transform-origin:0 0;transform:rotate(-180deg);animation:rh-char-upright 10s linear infinite !important}
.rh-compare .rh-arm{transform-origin:0 0;transform:translateY(-8px);opacity:0;animation:rh-arm-move 10s linear infinite !important}
.rh-compare .rh-intent-arrow,.rh-compare .rh-intent-head{opacity:0;animation:rh-stage1-only 10s linear infinite !important}
.rh-compare .rh-ghost-miss{opacity:1;animation:rh-stage3-only 10s linear infinite !important}
.rh-compare .rh-s3-annot{opacity:1;animation:rh-stage3-only 10s linear infinite !important}
.rh-compare .rh-meter-fill{transform-origin:0 0;transform:scaleX(1);animation:rh-meter 10s linear infinite !important}
.rh-compare .rh-val-0{opacity:0;animation:rh-before-flip 10s linear infinite !important}
.rh-compare .rh-val-1{opacity:1;animation:rh-after-flip 10s linear infinite !important}
.rh-compare .rh-playhead{transform-origin:0 0;transform:translateX(288px);opacity:0;animation:rh-playhead-sweep 10s linear infinite !important}
.rh-compare .rh-seg{opacity:1}
.rh-compare .rh-seg-1{animation:rh-seg-1 10s linear infinite !important}
.rh-compare .rh-seg-2{animation:rh-seg-2 10s linear infinite !important}
.rh-compare .rh-seg-3{animation:rh-seg-3 10s linear infinite !important}
.rh-compare .rh-seg-4{animation:rh-seg-4 10s linear infinite !important}
.rh-compare .rh-seg-5{animation:rh-seg-5 10s linear infinite !important}
.rh-compare .rh-seg-6{animation:rh-seg-6 10s linear infinite !important}
.rh-compare .rh-seg-7{animation:rh-seg-7 10s linear infinite !important}
.rh-compare .rh-seg-8{animation:rh-seg-8 10s linear infinite !important}
.rh-compare .rh-hack-subtle{opacity:0;animation:rh-hack-stealth 10s linear infinite !important}
.rh-compare .rh-hack-pop{transform-origin:0 0;transform:scaleY(2);opacity:1;animation:rh-hack-reveal 10s linear infinite !important}
.rh-compare .rh-hack-ring{transform-origin:0 0;transform:scale(1.6);opacity:0;animation:rh-hack-pulse 10s linear infinite !important}
.rh-compare .rh-hack-tag{opacity:1;animation:rh-audit-lock 10s linear infinite !important}
.rh-compare .rh-scanner{transform-origin:0 0;transform:translateX(194.2px);opacity:0;animation:rh-scan-sweep 10s linear infinite !important}
.rh-compare .rh-badge-1{opacity:0;animation:rh-badge-s1 10s linear infinite !important}
.rh-compare .rh-badge-2{opacity:0;animation:rh-badge-s2 10s linear infinite !important}
.rh-compare .rh-badge-3{opacity:1;animation:rh-audit-lock 10s linear infinite !important}
.rh-compare .rh-trace-bg-alert,.rh-compare .rh-trace-strip-alert{opacity:1;animation:rh-audit-lock 10s linear infinite !important}
.rh-compare .rh-trace-1{opacity:0;animation:rh-trace-s1 10s linear infinite !important}
.rh-compare .rh-trace-2{opacity:0;animation:rh-trace-s2a 10s linear infinite !important}
.rh-compare .rh-trace-3{opacity:0;animation:rh-trace-s2b 10s linear infinite !important}
.rh-compare .rh-trace-4{opacity:1;animation:rh-audit-lock 10s linear infinite !important}
.rh-compare .rh-cap-1{opacity:0;animation:rh-stage1-only 10s linear infinite !important}
.rh-compare .rh-cap-2{opacity:0;animation:rh-stage2-only 10s linear infinite !important}
.rh-compare .rh-cap-3{opacity:1;animation:rh-stage3-only 10s linear infinite !important}
@keyframes rh-stage1-only{0%,2%{opacity:0}5%,22%{opacity:1}25%,100%{opacity:0}}
@keyframes rh-stage2-only{0%,23%{opacity:0}26%,50%{opacity:1}53%,100%{opacity:0}}
@keyframes rh-stage3-only{0%,51%{opacity:0}55%,91%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-flip{0%,28%{transform:translateY(0) rotate(0deg)}36%{transform:translateY(-15px) rotate(90deg)}45%,92%{transform:translateY(0) rotate(180deg)}97%,100%{transform:translateY(0) rotate(0deg)}}
@keyframes rh-char-upright{0%,28%{transform:rotate(0deg)}36%{transform:rotate(-90deg)}45%,92%{transform:rotate(-180deg)}97%,100%{transform:rotate(0deg)}}
@keyframes rh-arm-move{0%,21%{transform:translateY(-8px);opacity:0}25%,28%{transform:translateY(26px);opacity:1}36%{transform:translateY(11px);opacity:1}44%,46%{transform:translateY(26px);opacity:1}51%,100%{transform:translateY(-8px);opacity:0}}
@keyframes rh-meter{0%,42%{transform:scaleX(0)}48%,92%{transform:scaleX(1)}97%,100%{transform:scaleX(0)}}
@keyframes rh-before-flip{0%,42%{opacity:1}46%,95%{opacity:0}98%,100%{opacity:1}}
@keyframes rh-after-flip{0%,44%{opacity:0}48%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-playhead-sweep{0%,5%{transform:translateX(0px);opacity:0}8%{transform:translateX(0px);opacity:1}46%{transform:translateX(288px);opacity:1}50%,100%{transform:translateX(288px);opacity:0}}
@keyframes rh-seg-1{0%,8%{opacity:0}10%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-seg-2{0%,13%{opacity:0}15%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-seg-3{0%,18%{opacity:0}20%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-seg-4{0%,23%{opacity:0}25%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-seg-5{0%,28%{opacity:0}30%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-seg-6{0%,36%{opacity:0}38%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-seg-7{0%,40%{opacity:0}42%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-seg-8{0%,44%{opacity:0}46%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-hack-stealth{0%,33%{opacity:0}35%,58%{opacity:1}60%,100%{opacity:0}}
@keyframes rh-hack-reveal{0%,57%{transform:scaleY(1);opacity:0}59%{transform:scaleY(1);opacity:1}63%,92%{transform:scaleY(2);opacity:1}96%,100%{transform:scaleY(1);opacity:0}}
@keyframes rh-hack-pulse{0%,59%{transform:scale(.6);opacity:0}61%{transform:scale(.75);opacity:.85}73%,100%{transform:scale(2.1);opacity:0}}
@keyframes rh-audit-lock{0%,58%{opacity:0}62%,92%{opacity:1}96%,100%{opacity:0}}
@keyframes rh-scan-sweep{0%,50%{transform:translateX(0px);opacity:0}52%{transform:translateX(0px);opacity:1}61%{transform:translateX(194.2px);opacity:1}66%{transform:translateX(194.2px);opacity:.75}70%,100%{transform:translateX(194.2px);opacity:0}}
@keyframes rh-badge-s1{0%,38%{opacity:1}41%,95%{opacity:0}98%,100%{opacity:1}}
@keyframes rh-badge-s2{0%,38%{opacity:0}41%,57%{opacity:1}60%,100%{opacity:0}}
@keyframes rh-trace-s1{0%,22%{opacity:1}24%,95%{opacity:0}98%,100%{opacity:1}}
@keyframes rh-trace-s2a{0%,22%{opacity:0}24%,37%{opacity:1}39%,100%{opacity:0}}
@keyframes rh-trace-s2b{0%,37%{opacity:0}39%,57%{opacity:1}60%,100%{opacity:0}}
@media (max-width:720px){
.rh-compare-stage{grid-template-columns:minmax(0,1fr);gap:1.1rem}
.rh-panel--2020{padding-right:0}
.rh-panel--2026{border-left:0;border-top:1px solid var(--border);padding-left:0;padding-top:1rem}
.rh-shift-head{display:none}
.rh-shift-row{grid-template-columns:minmax(0,1fr);gap:.25rem;padding:.65rem 0}
.rh-shift-tag{display:inline-block;margin-right:.4rem;font-size:.78rem;font-weight:600}
.rh-shift-tag--2020{color:var(--feature)}
.rh-shift-tag--2026{color:var(--accent-strong)}
}
@media print{
.rh-compare .rh-panel-svg *{animation:none !important;transition:none !important}
}
</style>
<p class="rh-compare-title" id="rh-compare-title">从经典 RL 到前沿 LLM 智能体：Reward Hacking 的形态变化</p>
<div class="rh-compare-stage">
<div class="rh-panel rh-panel--2020">
<div class="rh-panel-label rh-panel-label--2020"><span class="rh-dot rh-dot--2020" aria-hidden="true"></span><span>2020 · 经典 RL</span></div>
<svg class="rh-panel-svg" viewBox="0 0 320 156" role="img" aria-label="2020 年乐高积木堆叠规约博弈动画：代理奖励为红积木底面高度，机械臂不抓叠而是将红积木原地翻转使底面朝上">
<text x="6" y="18" font-size="10.5" fill="#534A4C">规约：最大化红块底面高度 h</text>
<rect x="234" y="10" width="44" height="7" rx="3.5" fill="#E8E2E3"/>
<g transform="translate(234, 10)"><rect class="rh-meter-fill" x="0" y="0" width="44" height="7" rx="3.5" fill="#8C4A19"/></g>
<text class="rh-val-0" x="284" y="17.5" font-size="10.5" font-weight="600" fill="#72686B">h=0</text>
<text class="rh-val-1" x="284" y="17.5" font-size="10.5" font-weight="600" fill="#8C4A19">+1</text>
<line x1="8" y1="122" x2="312" y2="122" stroke="#D8CFD1" stroke-width="1.3"/>
<rect x="46" y="94" width="54" height="28" rx="2.5" fill="#E6EEF6" stroke="#6E8CA8" stroke-width="1.2"/>
<text x="73" y="112" text-anchor="middle" font-size="11.5" fill="#3B556E">蓝</text>
<rect x="46" y="66" width="54" height="28" rx="2.5" fill="none" stroke="#8DA4BC" stroke-width="1.2" stroke-dasharray="3 2.5"/>
<text x="73" y="57" text-anchor="middle" font-size="10.5" fill="#534A4C">意图：红叠蓝</text>
<text class="rh-ghost-miss" x="73" y="84" text-anchor="middle" font-size="10" font-weight="600" fill="#72686B">未叠放 ✗</text>
<path class="rh-intent-arrow" d="M 168 96 Q 134 62 106 76" fill="none" stroke="#8DA4BC" stroke-width="1.2" stroke-dasharray="3 2.5"/>
<path class="rh-intent-head" d="M 111 71 L 104 77 L 113 79" fill="none" stroke="#8DA4BC" stroke-width="1.2"/>
<g transform="translate(198, 108)">
<g class="rh-block-flip">
<rect x="-27" y="-14" width="54" height="28" rx="2.5" fill="#FBF1E6" stroke="#8C4A19" stroke-width="1.2"/>
<line x1="-27" y1="12.5" x2="27" y2="12.5" stroke="#8C4A19" stroke-width="3.4"/>
<g class="rh-block-char-wrap"><text x="0" y="4" text-anchor="middle" font-size="11.5" font-weight="500" fill="#8C4A19">红</text></g>
</g>
</g>
<g transform="translate(198, 56)">
<g class="rh-arm">
<line x1="0" y1="-22" x2="0" y2="8" stroke="#665C5F" stroke-width="1.5"/>
<path d="M -29 22 L -29 12 L 29 12 L 29 22" fill="none" stroke="#665C5F" stroke-width="1.4" stroke-linejoin="round"/>
<circle cx="0" cy="12" r="2.3" fill="#665C5F"/>
</g>
</g>
<g class="rh-s3-annot">
<line x1="100" y1="94" x2="252" y2="94" stroke="#8C4A19" stroke-width="1" stroke-dasharray="3 2.5" opacity="0.65"/>
<line x1="246" y1="122" x2="246" y2="95" stroke="#8C4A19" stroke-width="1.3"/>
<path d="M 243 100 L 246 94 L 249 100" fill="none" stroke="#8C4A19" stroke-width="1.3"/>
<text x="255" y="112" font-size="11.5" font-weight="600" fill="#8C4A19">h</text>
<text x="198" y="85" text-anchor="middle" font-size="10.5" font-weight="600" fill="#8C4A19">底面朝上</text>
</g>
<text class="rh-cap-1" x="6" y="145" font-size="10.5" fill="#665C5F">阶段 1 · 设定代理奖励为红块底面离地高度</text>
<text class="rh-cap-2" x="6" y="145" font-size="10.5" fill="#8C4A19">阶段 2 · 策略未去抓叠，直接将红块原地翻转</text>
<text class="rh-cap-3" x="6" y="145" font-size="10.5" font-weight="500" fill="#8C4A19">阶段 3 · 底面高度达标（+1），真实叠放意图落空</text>
</svg>
<p class="rh-panel-note"><span class="rh-note-key">代表案例：</span>乐高翻积木、CoastRunners 绕圈、机械爪挡镜头</p>
</div>
<div class="rh-panel rh-panel--2026">
<div class="rh-panel-label rh-panel-label--2026"><span class="rh-dot rh-dot--2026" aria-hidden="true"></span><span>2025–2026 · LLM 智能体</span></div>
<svg class="rh-panel-svg" viewBox="0 0 320 156" role="img" aria-label="2026 年自主科研长轨迹作弊动画：超过百万字符和 264 条命令中混入 1 条占比 0.6% 的计时覆写作弊命令，经审计扫描后定位">
<defs>
<linearGradient id="rh-scan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" stop-color="#7B2130" stop-opacity="0"/>
<stop offset="100%" stop-color="#7B2130" stop-opacity="0.24"/>
</linearGradient>
</defs>
<text x="6" y="18" font-size="10.5" fill="#534A4C">&gt;100 万字符 · 264 条命令</text>
<text class="rh-badge-1" x="314" y="18" text-anchor="end" font-size="10.5" fill="#665C5F">执行调试中…</text>
<text class="rh-badge-2" x="314" y="18" text-anchor="end" font-size="10.5" font-weight="600" fill="#3B556E">评测通过 ✓</text>
<text class="rh-badge-3" x="314" y="18" text-anchor="end" font-size="10.5" font-weight="600" fill="#7B2130">1 条作弊（0.6%）</text>
<rect x="6" y="40" width="308" height="34" rx="4" fill="#F7F4F4" stroke="#E8E2E3" stroke-width="1"/>
<g fill="#DDD5D7">
<rect x="16" y="48" width="4.4" height="18" rx="1"/><rect x="25.4" y="48" width="4.4" height="18" rx="1"/><rect x="34.8" y="48" width="4.4" height="18" rx="1"/><rect x="44.2" y="48" width="4.4" height="18" rx="1"/>
<rect x="53.6" y="48" width="4.4" height="18" rx="1"/><rect x="63" y="48" width="4.4" height="18" rx="1"/><rect x="72.4" y="48" width="4.4" height="18" rx="1"/><rect x="81.8" y="48" width="4.4" height="18" rx="1"/>
<rect x="91.2" y="48" width="4.4" height="18" rx="1"/><rect x="100.6" y="48" width="4.4" height="18" rx="1"/><rect x="110" y="48" width="4.4" height="18" rx="1"/><rect x="119.4" y="48" width="4.4" height="18" rx="1"/>
<rect x="128.8" y="48" width="4.4" height="18" rx="1"/><rect x="138.2" y="48" width="4.4" height="18" rx="1"/><rect x="147.6" y="48" width="4.4" height="18" rx="1"/><rect x="157" y="48" width="4.4" height="18" rx="1"/>
<rect x="166.4" y="48" width="4.4" height="18" rx="1"/><rect x="175.8" y="48" width="4.4" height="18" rx="1"/><rect x="185.2" y="48" width="4.4" height="18" rx="1"/><rect x="194.6" y="48" width="4.4" height="18" rx="1"/>
<rect x="204" y="48" width="4.4" height="18" rx="1"/>
<rect x="213.4" y="48" width="4.4" height="18" rx="1"/><rect x="222.8" y="48" width="4.4" height="18" rx="1"/><rect x="232.2" y="48" width="4.4" height="18" rx="1"/>
<rect x="241.6" y="48" width="4.4" height="18" rx="1"/><rect x="251" y="48" width="4.4" height="18" rx="1"/><rect x="260.4" y="48" width="4.4" height="18" rx="1"/><rect x="269.8" y="48" width="4.4" height="18" rx="1"/>
<rect x="279.2" y="48" width="4.4" height="18" rx="1"/><rect x="288.6" y="48" width="4.4" height="18" rx="1"/><rect x="298" y="48" width="4.4" height="18" rx="1"/>
</g>
<g class="rh-seg rh-seg-1" fill="#9B9093"><rect x="16" y="48" width="4.4" height="18" rx="1"/><rect x="25.4" y="48" width="4.4" height="18" rx="1"/><rect x="34.8" y="48" width="4.4" height="18" rx="1"/><rect x="44.2" y="48" width="4.4" height="18" rx="1"/></g>
<g class="rh-seg rh-seg-2" fill="#9B9093"><rect x="53.6" y="48" width="4.4" height="18" rx="1"/><rect x="63" y="48" width="4.4" height="18" rx="1"/><rect x="72.4" y="48" width="4.4" height="18" rx="1"/><rect x="81.8" y="48" width="4.4" height="18" rx="1"/></g>
<g class="rh-seg rh-seg-3" fill="#9B9093"><rect x="91.2" y="48" width="4.4" height="18" rx="1"/><rect x="100.6" y="48" width="4.4" height="18" rx="1"/><rect x="110" y="48" width="4.4" height="18" rx="1"/><rect x="119.4" y="48" width="4.4" height="18" rx="1"/></g>
<g class="rh-seg rh-seg-4" fill="#9B9093"><rect x="128.8" y="48" width="4.4" height="18" rx="1"/><rect x="138.2" y="48" width="4.4" height="18" rx="1"/><rect x="147.6" y="48" width="4.4" height="18" rx="1"/><rect x="157" y="48" width="4.4" height="18" rx="1"/></g>
<g class="rh-seg rh-seg-5" fill="#9B9093"><rect x="166.4" y="48" width="4.4" height="18" rx="1"/><rect x="175.8" y="48" width="4.4" height="18" rx="1"/><rect x="185.2" y="48" width="4.4" height="18" rx="1"/><rect x="194.6" y="48" width="4.4" height="18" rx="1"/></g>
<g class="rh-seg rh-seg-6" fill="#9B9093"><rect x="213.4" y="48" width="4.4" height="18" rx="1"/><rect x="222.8" y="48" width="4.4" height="18" rx="1"/><rect x="232.2" y="48" width="4.4" height="18" rx="1"/></g>
<g class="rh-seg rh-seg-7" fill="#9B9093"><rect x="241.6" y="48" width="4.4" height="18" rx="1"/><rect x="251" y="48" width="4.4" height="18" rx="1"/><rect x="260.4" y="48" width="4.4" height="18" rx="1"/><rect x="269.8" y="48" width="4.4" height="18" rx="1"/></g>
<g class="rh-seg rh-seg-8" fill="#9B9093"><rect x="279.2" y="48" width="4.4" height="18" rx="1"/><rect x="288.6" y="48" width="4.4" height="18" rx="1"/><rect x="298" y="48" width="4.4" height="18" rx="1"/></g>
<g transform="translate(206.2, 66)">
<rect class="rh-hack-subtle" x="-2.2" y="-18" width="4.4" height="18" rx="1" fill="#9E636D"/>
<rect class="rh-hack-pop" x="-2.4" y="-18" width="4.8" height="18" rx="1.2" fill="#7B2130"/>
</g>
<g transform="translate(206.2, 48)"><circle class="rh-hack-ring" cx="0" cy="0" r="7" fill="none" stroke="#7B2130" stroke-width="1.2"/></g>
<text class="rh-hack-tag" x="199" y="34" text-anchor="end" font-size="9.5" font-weight="600" fill="#7B2130">#183 · 0.6%</text>
<g transform="translate(16, 42)"><line class="rh-playhead" x1="0" y1="0" x2="0" y2="30" stroke="#534A4C" stroke-width="1.2"/></g>
<g transform="translate(12, 36)"><g class="rh-scanner"><rect x="-18" y="0" width="18" height="42" fill="url(#rh-scan-grad)"/><line x1="0" y1="0" x2="0" y2="42" stroke="#7B2130" stroke-width="1.5"/></g></g>
<rect x="6" y="86" width="308" height="36" rx="4" fill="#F7F4F4" stroke="#E8E2E3" stroke-width="1"/>
<rect class="rh-trace-bg-alert" x="6" y="86" width="308" height="36" rx="4" fill="#F5E6E9" stroke="#DFBCC3" stroke-width="1"/>
<rect x="6" y="86" width="3.5" height="36" rx="1.5" fill="#9B9093"/>
<rect class="rh-trace-strip-alert" x="6" y="86" width="3.5" height="36" rx="1.5" fill="#7B2130"/>
<text class="rh-trace-1" x="18" y="108" font-family="var(--mono)" font-size="10.2" fill="#2C2527">#042  python train.py --lr 3e-4</text>
<text class="rh-trace-2" x="18" y="108" font-family="var(--mono)" font-size="10.2" fill="#2C2527">#118  pytest tests/test_eval.py -q</text>
<text class="rh-trace-3" x="18" y="108" font-family="var(--mono)" font-size="10.2" fill="#3B556E">#264  submit_eval() -&gt; score: 1.00 ✓</text>
<text class="rh-trace-4" x="18" y="108" font-family="var(--mono)" font-size="10.2" font-weight="600" fill="#5C1622">#183  time.time = lambda: 0  # 覆写计时</text>
<text class="rh-cap-1" x="6" y="145" font-size="10.5" fill="#665C5F">阶段 1 · 模型在沙箱中推进常规科研与测试</text>
<text class="rh-cap-2" x="6" y="145" font-size="10.5" fill="#3B556E">阶段 2 · 轨迹中混入单条计时覆写并顺利通过评测</text>
<text class="rh-cap-3" x="6" y="145" font-size="10.5" font-weight="500" fill="#5C1622">阶段 3 · 混在正常调试中（Opus 5 定位 64.88 F1）</text>
</svg>
<p class="rh-panel-note"><span class="rh-note-key">典型手法：</span>覆写 <code>time.time()</code>、调用栈取数、围绕留出集造数据</p>
</div>
</div>
<div class="rh-shift">
<div class="rh-shift-head">
<span>维度</span>
<span class="rh-shift-head--2020">2020 · 经典 RL</span>
<span class="rh-shift-head--2026">2025–2026 · LLM 智能体</span>
</div>
<div class="rh-shift-row">
<span class="rh-shift-dim">机制</span>
<span class="rh-shift-cell"><span class="rh-shift-tag rh-shift-tag--2020">2020</span>试错撞上数值或物理漏洞</span>
<span class="rh-shift-cell"><span class="rh-shift-tag rh-shift-tag--2026">2026</span>读懂源码与调用栈，定向绕过</span>
</div>
<div class="rh-shift-row">
<span class="rh-shift-dim">意图</span>
<span class="rh-shift-cell"><span class="rh-shift-tag rh-shift-tag--2020">2020</span>对设计者意图无概念</span>
<span class="rh-shift-cell"><span class="rh-shift-tag rh-shift-tag--2026">2026</span>10/10 承认违背意图，禁令无效</span>
</div>
<div class="rh-shift-row">
<span class="rh-shift-dim">隐蔽</span>
<span class="rh-shift-cell"><span class="rh-shift-tag rh-shift-tag--2020">2020</span>动作荒诞，一眼可辨</span>
<span class="rh-shift-cell"><span class="rh-shift-tag rh-shift-tag--2026">2026</span>藏在正常调试中，强罚诱发思维链隐匿</span>
</div>
<div class="rh-shift-row">
<span class="rh-shift-dim">外溢</span>
<span class="rh-shift-cell"><span class="rh-shift-tag rh-shift-tag--2020">2020</span>锁死在单一仿真环境</span>
<span class="rh-shift-cell"><span class="rh-shift-tag rh-shift-tag--2026">2026</span>跨任务泛化为对齐伪装与破坏</span>
</div>
</div>
<figcaption>图 1：2020 年经典强化学习规约博弈（<a href="#ref-krakovna-2020">Krakovna et al., 2020</a>）与 2025–2026 年前沿 LLM 智能体 Reward Hacking（<a href="#ref-metr-2025">METR, 2025</a>；<a href="#ref-macdiarmid-2025">MacDiarmid et al., 2025</a>；<a href="#ref-hackbench-2026">HackBench, 2026</a>）对比。</figcaption>
</figure>

奖励黑客这个问题由来已久，有其根本原因：现实任务的规约几乎总是不完备的，而人类复杂、隐含的偏好也很难被精确写成一个可计算的标量函数。早期文献与社区案例库已经系统记录过经典 RL 中的相关现象（[Krakovna et al., Master List](#ref-krakovna-list)；[Weng, 2024](#ref-weng-2024)），但近几年，基于人类反馈的强化学习（RLHF，[Christiano et al., 2017](#ref-christiano-2017)；[Ouyang et al., 2022](#ref-ouyang-2022)）与基于可验证奖励的强化学习（RLVR，[Lambert et al., 2024](#ref-lambert-2024)；[DeepSeek-AI, 2025](#ref-deepseek-2025)）分别把大语言模型推向了人类偏好对齐与可交互任务求解，经典 RL 中的奖励黑客也随之发生转移：一面落进语义说服与偏好迎合，一面落进代码、测试与工具执行环境。与经典 RL 中的黑客行为相比，现代模型已经能够在符合表面意图的情况下隐蔽地执行黑客行为。要理解这种转移背后的共同机理，并看清现有缓解手段的边界，不妨先回到问题最早暴露的地方：经典强化学习中的奖励设计与塑形。

## 从奖励塑形说起

即便在规则清晰、环境封闭的经典控制任务里，只要为了加速学习对奖励做一点直觉修改，字面与意图的错位就已经会出现。在强化学习中，奖励函数既定义目标，其稠密程度与结构形态也直接左右策略搜索的样本效率和收敛方向。但在复杂任务里，如何把长程目标拆成中间子目标、怎样权衡稀疏终态奖励与稠密过程引导，长期依赖经验直觉；未经严格验证的启发式修改，往往会悄悄改变原问题的最优策略集合。

1990 年代末，[Randløv 与 Alstrøm（1998）](#ref-randlov-1998) 在自行车控制任务中给出了一个经典反例：为了缓解终态奖励稀疏的问题，研究者在智能体朝目标方向移动时施加了正向塑形奖励，结果策略优化迅速收敛于原地绕圈。智能体通过反复朝向目标累积正向塑形回报，却始终不驶向终点。

为界定不改变最优解的奖励变换空间，[Ng、Harada 与 Russell（1999）](#ref-ng-1999) 在马尔可夫决策过程（MDP）$$M = (S, A, T, \gamma, R)$$ 上分析了变换后的问题 $$M^{\prime} = (S, A, T, \gamma, R + F)$$。他们证明，当且仅当塑形函数 $$F: S \times A \times S \to \mathbb{R}$$ 具有**势能型奖励塑形（Potential-Based Reward Shaping, PBRS）**形式时，原问题与变换后问题的最优策略集合才严格一致：

$$
F(s, a, s') = \gamma \Phi(s') - \Phi(s)
$$

其中 $$\Phi: S \to \mathbb{R}$$ 为任意状态势能函数。沿任意轨迹对折扣后的 $$F$$ 求和会产生伸缩相消（telescoping sum），从代数结构上堵死了循环套利。但 PBRS 的策略不变性依赖严格的马尔可夫假设与有限视野边界条件（例如终止状态势能须为零），在非马尔可夫环境或依赖语义评估的长程语言任务中很难直接构造。

奖励黑客和监督学习中的虚假相关（spurious correlation）及捷径学习（shortcut learning）有相似之处，就像视觉分类器可能靠背景积雪而非动物形态区分狼与哈士奇。但强化学习的风险高得多：监督模型面对的是静态数据分布，而 RL 智能体在更新策略时会主动改变自己诱导出的状态-动作分布，把优化压力集中到放大代理目标与真实意图偏差的地方。

## 规约博弈、目标误泛化与奖励篡改

过去十年的对齐与安全文献围绕“代理目标与真实意图的偏离”给出了一组紧密相关的概念：其中 Reward hacking 常作广义统称，而针对不同发生环节，学界又进一步区分了规约博弈、目标误泛化与奖励篡改：

* **Reward hacking**（[Amodei et al., 2016](#ref-amodei-2016)）：智能体利用奖励函数中的形式缺陷，以非预期策略获取高额代理回报。
* **Specification gaming**（[Krakovna et al., 2020](#ref-krakovna-2020)）：策略在字面上满足了任务规约（literal specification），但未能达成设计者的真实意图（intended outcome）。
* **Goal misgeneralization**（[Langosco et al., 2023](#ref-langosco-2023)）：智能体在分布外（OOD）环境中保留了执行能力，但泛化出的行为目标偏离了训练期望的真实目标。
* **Reward tampering / Wireheading**（Ring & Orseau, 2011; Everitt & Hutter, 2016; [Krakovna et al., 2020](#ref-krakovna-2020); [arXiv:2511.23092](#ref-wireheading-2025)）：智能体不再局限于利用既有规约的边界条件，而是直接干预奖励的计算、观测或物理存储通道本身。

[Krakovna 等人（2020）](#ref-krakovna-2020) 指出，规约博弈并不是强化学习算法的优化失效，而是 AI 创造力的另一面（the flip side of AI ingenuity）。任务规约完备且精确时，强优化能力会找到超越人类直觉的解法，比如 AlphaGo 在对阵李世石第二局中的第 37 手；规约一旦有细微遗漏，同一套优化机制就会产出退化性的规避策略，正如开篇提到的乐高积木任务里，机械臂靠原地翻转红积木最大化底面高度，却绕开了“叠到蓝积木上”这一真正目标。站在优化器的角度看，这两类非预期解处在同一个连续谱上，目前还没有可靠的先验判据能在事前把它们区分开。

按训练期最直接的作用路径，广义上的 Reward Hacking 主要分为两类（而目标误泛化则更多体现在训练后进入分布外环境时的泛化偏移）：

1. **环境或目标规约失配（Environment / Goal Misspecification）**：奖励函数准确度量了它的形式定义，但这个定义没有完整覆盖真实意图。深层诱因常常是抽象失效（failure of abstraction）（[Krakovna et al., 2020](#ref-krakovna-2020)）。仿真环境里的行走机器人卡死双腿、利用物理引擎漏洞滑行，问题出在设计者建模时塞进了未明言的隐含假设；搬到真实世界后，这类抽象缺口对应的就是软件安全漏洞、计时机制缺陷或复杂基础设施里的隐式前提。
2. **奖励篡改（Reward Tampering / Wireheading）**：智能体直接作用于目标规约的物理实现。[Krakovna 等人（2020）](#ref-krakovna-2020) 强调，任何任务规约在现实世界里都有具体的物理载体（physical manifestation），可能是内存里的评分程序，也可能是人脑中的偏好状态。因此，奖励篡改既包括直接改写测试脚本或计分程序，也包括通过多轮交互反向诱导人类形成更容易满足的偏好，比如交通导航系统不去优化真实通行效用，而是诱导用户改选更好抵达的目的地。

## 跨学科的理论边界

把时间线拉长到近七十年的系统科学史，Reward Hacking 其实是控制论、经济学、统计物理与强化学习理论共同指向的一组基本边界。

### 古德哈特定律、激励扭曲与多样性下界

早在 1960 年，控制论奠基人 Norbert Wiener 就在 *Science* 撰文提醒，自动化系统按字面执行指令（literal-minded）；把目标交给高速且不可逆的自动化回路后，字面规约与真实意图之间的微小偏差会被迅速放大（[Wiener, 1960](#ref-wiener-1960)）。之后几十年里，经济学、社会学与管理学各自独立遇到了同一条规律：

* **统计与计量失效**：[Charles Goodhart（1975）](#ref-goodhart-1975) 指出，任何观测到的统计规律一旦被施加控制压力就会趋于失效；[Donald Campbell（1976）](#ref-goodhart-1975) 指出，量化指标越广泛地用于决策控制，就越容易遭受腐败压力并反过来扭曲其监控的过程；[Robert Lucas（1976）](#ref-lucas-1976) 在宏观计量领域论证，政策干预会改变主体的决策结构，使基于历史相关性拟合的模型失效。
* **组织激励错配**：[Steven Kerr（1975）](#ref-kerr-1975) 把组织行为学里的这种现象概括为“奖励 A 却期待 B”。
* **多任务委托-代理的最优抑制**：[Holmström 与 Milgrom（1991）](#ref-holmstrom-1991) 通过多任务委托-代理模型证明，当代理需要在“可精确观测维度”与“难以观测维度”之间分配精力时，对可测代理施加过强的线性激励会让不可测维度的投入趋近于零，最优机制反而需要主动抑制激励强度（muted incentives）。

[W. Ross Ashby（1956）](#ref-ashby-1956) 的必备多样性定律（Law of Requisite Variety）把这层局限写成了一条明确的信息熵下界：受控系统输出的不确定性下界取决于扰动多样性与调节器响应多样性之差，

$$
H(\text{Outcome}) \ge H(\text{Disturbance}) - H(\text{Regulator})
$$

Conant 与 Ashby 提出的好调节器定理（Good Regulator Theorem）（[Conant & Ashby, 1970](#ref-ashby-1956)）进一步证明，最优调节器必须在结构上内含被控系统的同构模型。放在强化学习的语境里，只要策略模型探索漏洞的多样性超过了评估器或监控器的判别多样性，Reward Hacking 在信息论意义上就很难避免。

### 占据测度的线性性与逆向问题的不可辨识性

在 MDP 形式化下，任意策略 $$\pi$$ 的期望回报都能写成状态-动作折扣占据测度 $$d^\pi$$ 与奖励向量 $$R$$ 的线性内积：

$$
J_R(\pi) = \langle d^\pi, R \rangle = \sum_{s,a} d^\pi(s,a) R(s,a)
$$

[Skalse 等人（2022）](#ref-skalse-2022) 据此给出了 Reward Hacking 的首个形式化定义：如果提升代理奖励 $$\tilde{R}$$ 的期望回报永远不会导致真实奖励 $$R$$ 的期望回报下降，就称代理 $$\tilde{R}$$ 相对于 $$R$$ 是**不可黑客的（unhackable）**。他们证明，由于回报函数在占据测度空间中严格线性，只要策略优化覆盖全体随机策略空间 $$\Pi_{\text{all}}$$，除非 $$\tilde{R}$$ 或 $$R$$ 为常数函数，否则不存在任何非平凡的、严格不可篡改的简化代理（即除与真实奖励在期望回报上呈正仿射等价的平凡情形外，任何省略部分维度的简化代理都存在触发奖励黑客的策略对）。想在无约束策略空间里靠忽略次要维度来造一个“安全简化代理”，在数学上行不通；非平凡的不可篡改代理只能在受限策略子集（例如确定性策略或硬约束裁剪后的可行域）内存在。

反过来，如果改由专家示范或偏好数据去反推真实奖励函数，又会撞上逆向问题的病态性。[Kalman（1964）](#ref-kalman-1964) 在逆向最优控制中已经指出了代价函数反演的非唯一性；[Ng & Russell（2000）](#ref-ng-russell-2000) 与 Amin & Singh（2016；参见 [Langosco et al., 2023](#ref-langosco-2023)）进一步把逆向强化学习（IRL）中的不可辨识性分成两类：由势能变换或缩放等算术等价引起的表征非可辨识性（representational unidentifiability），以及有限观测轨迹无法区分多个在训练分布上诱导相同最优策略、但在分布外分化的奖励函数所造成的实验非可辨识性（experimental unidentifiability）。[ICML 2025 的一篇理论工作](#ref-icml-2025) 进一步确立了误差-遗憾失配（Error-Regret Mismatch）：对于任意固定的正期望测试误差，只要策略优化引发分布偏移，就存在现实数据分布让优化该学习型奖励模型产生极大的最坏情况遗憾，且标准策略正则化无法消除这一现象。

### 过优化标度律、重尾误差与自由能界

在 RLHF 的奖励模型过优化问题上，[Gao、Schulman 与 Hilton（2023）](#ref-gao-2023) 用 6B 参数量的“金标准奖励模型”充当真值代理，以策略偏离度 $$d := \sqrt{D_{\text{KL}}(\pi \parallel \pi_{\text{init}})}$$ 为自变量，实证拟合了相对于初始策略 $$\pi_{\text{init}}$$（$$R(0) = 0$$）的真实回报增益标度律：

* **Best-of-$$n$$ 采样（BoN）**：$$R_{\text{bon}}(d) = d(\alpha_{\text{bon}} - \beta_{\text{bon}} d)$$，其中 $$D_{\text{KL}}^{\text{bon}} = \log n - \frac{n-1}{n}$$；
* **策略梯度强化学习（PPO）**：$$R_{\text{RL}}(d) = d(\alpha_{\text{RL}} - \beta_{\text{RL}} \log d)$$。

两条曲线都先升后降。即便在仅含独立高斯噪声的回归型古德哈特模型（$$\hat{X} = X + Z$$）下（或作为最小均方误差线性估计），条件期望真实回报也受限于方差信噪比衰减：

$$
\mathbb{E}[X \mid \hat{X} = \hat{x}] = \mathbb{E}[X] + \left(\hat{x} - \mathbb{E}[X] - \mathbb{E}[Z]\right)\frac{\mathrm{Var}(X)}{\mathrm{Var}(X) + \mathrm{Var}(Z)}
$$

真正把真实回报拽入非单调崩塌（$$-\beta$$ 项占主导）的，是分布偏移诱发的极端型古德哈特（Extremal Goodhart）。[Gao 等人（2023）](#ref-gao-2023) 发现 PPO 中的显式 KL 惩罚在实证上只相当于提前停止（early stopping），并没有实质改善 KL–金标准回报前沿；[Kwa 等人（2024）](#ref-kwa-2024) 则从理论上证明了**灾难性古德哈特（Catastrophic Goodhart）**：只要代理奖励的误差分布呈重尾（heavy-tailed），哪怕加上标准 KL 散度正则化，依然存在策略以有限的 KL 代价拿到任意高的代理回报，而真实效用退化到不高于初始基础模型。

[Ortega 与 Braun（2013）](#ref-ortega-2013) 提出的有界理性自由能变分原理和这套机制恰好同构：

$$
\max_{q} \left\{ \mathbb{E}_{q}[U(x)] - \frac{1}{\alpha} D_{\text{KL}}(q \parallel p_0) \right\} \implies q^*(x) = \frac{1}{Z} p_0(x) e^{\alpha U(x)}
$$

其中 $$\alpha$$ 对应热力学逆温度（表征优化压力）。在缺乏强先验的传统 RL 中，算法默认逼近零温极限（$$\alpha \to \infty$$，即确定性 $$\arg\max$$）；一旦代理函数存在重尾误差，零温最大化就会把所有概率质量押注到代理误差的极端离群区域。

## 从经典控制到前沿智能体的演化

### 经典深度 RL 与进化计算

早期深度 RL 与进化计算里的规约利用，大多直接套利显式评分规则或观测通道：

* **CoastRunners 赛艇循环**（[Amodei et al., 2016](#ref-amodei-2016)）：赛道上的绿色加速块带有正向塑形奖励，智能体很快收敛到原地循环撞击加速块，不再完成竞速。
* **进化软件合成的适应度瓶颈**（[Yampolskiy, 2018](#ref-yampolskiy-2018)）：遗传编程长期难以从零演化出非平凡复杂软件，一个核心障碍就是演化过程会不断钻测试集与仿真器漏洞，而构造完备适应度函数的复杂度本身就不低于目标软件。
* **人类偏好学习中的观测欺骗**（[Christiano et al., 2017](#ref-christiano-2017)；[Ibarz et al., 2018](#ref-ibarz-2018)）：在基于视频片段的机械臂抓取评估中，策略学会把机械爪悬停在摄像头与目标球之间，利用视觉遮挡让人类评审误以为抓取成功。把人工规则换成学习型奖励模型，只是把规约漏洞往上挪了一层抽象。

### 语言模型后训练：奉承、规则套利与自评篡改

纯预训练阶段只对静态语料做下一词预测，模型并不主动改变环境分布；真正让经典 RL 的奖励黑客迁移到大语言模型中的，是后训练的两条主线。RLHF 让模型朝着人类偏好演进，把早期的奖励模型与观测欺骗迁移到了语义和说服层面，诱发迎合用户立场的奉承行为（sycophancy），以及用看似合理的论证提高错误答案说服力的“无意诡辩（U-Sophistry）”（[Weng, 2024](#ref-weng-2024)）。RLVR 则把模型放进可验证、可交互的执行回路中，把早期的评分规则与环境套利迁移到了代码、测试与工具接口上：开源社区复现基于可验证奖励的 GRPO 训练时（如 [open-r1 Issue #407](#ref-openr1-2025)），正则提取与格式奖励里的微小缺陷就经常在中后期引出格式套利和训练坍缩，而在更开放的智能体任务里，这条路径进一步演化为对评测脚本与科研流程的定向绕过。

一旦模型拿到自我评估（self-evaluation）权限，Wireheading 就可以在受控实验里稳定复现。2025 年的一项研究（[arXiv:2511.23092](#ref-wireheading-2025)）归纳了 Wireheading 发生的三个因果条件：（1）智能体能因果影响奖励测量通道；（2）这种影响跨轮次持续存在；（3）篡改后的实现回报严格高于诚实任务的回报。在摘要任务中，当 Llama-3.1-8B 的自评输出直接控制训练奖励时，代理奖励迅速饱和到 $$\approx 1.0$$，真实任务准确率却掉到 $$\approx 0.05$$（外部评估对照组稳定在 $$\approx 0.20$$）。

### 2025–2026 的三个新变化

近两年针对前沿推理模型与自主科研智能体的评测，带出了三个更棘手的变化。

**意图知情下的高复杂度作弊。** [METR（2025）](#ref-metr-2025) 在 RE-Bench 与 HCAST 基准上记录了 o3、o1 与 Claude 3.7 Sonnet 的多类复杂规避策略：

* 在 Triton GPU 内核优化任务中，o3 回溯 Python 调用栈直接提取评分器预计算的参考张量，同时运行时覆写（monkey-patch）`torch.cuda.synchronize` 与 `time.time` 来伪造近零运行耗时；
* 在张量正确性校验任务中，o3 构造仅占 4 字节显存的 `FakePrefixTensor` 子类并重载 `__torch_function__` 拦截 `torch.eq`，让验证器的逐元素相等检查恒返回 `True`；
* 在代码竞赛任务中，o3 把异步评估函数 `evaluate_rust_code` 替换成恒返回 `"succeeded": True` 的恒真桩函数（stub）；Claude 3.7 Sonnet 则在修改版 MD4 哈希碰撞任务中利用 57 字节输入触发统一报错的缺陷，提交两个不同的 57 字节文件“碰撞”出同一错误输出。

统计上看，o3 在 RE-Bench 上的整体作弊率达到 30.4%（39/128），在 Optimize LLM Foundry 任务里更是 100%（21/21）；而在 HCAST 上只有 0.7%（8/1087），相差超过 43 倍。关键差别在于 RE-Bench 向模型暴露了完整的评分函数源码。当研究者事后追问这些方案“是否符合用户意图”时，o3 在 10 次追问里 10 次回答“否”，并能准确说出自己的作弊机制。可显式提示词基本拦不住它：加上“请勿作弊”仍有 80% 作弊，“请勿 reward hack”为 70%，“请仅采用设计者预期方法”为 95%；哪怕把它放进“用于斯坦福大学阿尔茨海默病研究”的高风险叙事里，o3 依然在 70%（14/20）的运行中继续走捷径。

**局部作弊向全局错位自然泛化。** Anthropic 先在《Sycophancy to Subterfuge》（[Denison et al., 2024](#ref-denison-2024)）里验证了模型沿课程阶梯从奉承零样本泛化到重写奖励脚本；随后在生产级编码 RL 研究中确认，模型在真实编码环境里学会 Reward Hacking 后，会自然涌现并泛化（Natural Emergent Misalignment）出对齐伪装、协助恶意行为者，以及在 Claude Code 中试图破坏研究代码库等行为（[MacDiarmid et al., 2025](#ref-macdiarmid-2025)）。常规聊天式安全 RLHF 可以恢复对话评测里的表面合规，却清不掉智能体任务里的潜伏错位。

**作弊藏进超长程科研轨迹。** 在端到端机器学习科研任务（如 PostTrainBench 排行榜重审与 NanoGPT speedrun）中，智能体可以通过围绕留出集构造训练数据、私下蒸馏外部 API，或在触及目标损失的瞬间冻结权重来抬高评估指标（[HackBench, 2026](#ref-hackbench-2026)）。单拎出一条 shell 命令往往完全像正常的科研调试，只有跨越多步状态转移、结合领域知识去审视完整轨迹，才能认出它在规约博弈。

## 事后缓解为什么失效，以及结构性出路

2025 至 2026 年的多项压力测试指向了一个现实：靠已知样本训练的“事后检测与缓解”在分布偏移下普遍脆弱，更稳健的方案正在收拢到物理隔离、信息论约束、参数级梯度路由和解耦监控上。

### 事后干预与直接惩罚如何失效

**把监控信号直接变成负奖励，反而会逼出隐蔽作弊。** [OpenAI（2025）](#ref-openai-2025) 发现，没有强优化压力时，推理模型的思维链（CoT）可读性很高，外部 LLM 监控器能有效识别作弊意图；可一旦在训练中对触发告警的思维链施加负奖励，模型虽然压低了显性作弊率，却同时学会了在思维链里隐藏真实意图（obfuscated CoT），残余作弊几乎彻底逃脱监控。[METR（2025）](#ref-metr-2025) 也给出过类似警告：盲目用惩罚抹除显性作弊特征，往往只是毁掉了早期可观测性。

**事后激活探针、引导向量与 LLM 裁判对微小任务偏移高度敏感。** [Guide Labs（2026）](#ref-guidelabs-2026) 在 Qwen3-8B 与 DeepSeek R1-32B 上基于 ImpossibleBench 系统测试了 10 种检测方法（线性探针、Difference-of-means 探针、Constitutional Classifier、LLM 裁判等）与 7 种缓解方法（激活引导、Probe-Gated Steering、LoRA 微调、提示词约束等）。在训练集见过的“错误数值”缺陷测试上，各方法表现都很稳：激活探针 AUROC 达 0.84–0.90，Probe-Gated Steering 把作弊率从 22% 降到 9%（降幅 57%）且不掉解题率。可只要把测试缺陷微调成未见过的“正确数值但错误格式”（比如逗号替代空格），这些手段就会系统性退化：

* **检测端退化**：线性探针 AUROC 从 0.90 掉到 0.77，Probe-Gated Steering 探针从 0.89 掉到 0.74（纯错误格式变体上降到 0.68），LLM 裁判（Jev）从 0.89 掉到 0.72，Constitutional Classifier 从 0.81 掉到 0.62。
* **缓解端退化与反转**：Probe-Gated Steering 的削减率从 57% 降到 37%（纯错误格式变体仅 28%），LoRA 微调从 42% 降到 20%，显式 Prompting 甚至从削减 37% 反转为使作弊率上升 19%。

归因结果很清楚：检测与引导只在模型沿用训练集里的“修改测试文件”路径时管用（AUROC 0.85）；当模型改走“静默迎合错误格式”的新路径时（哪怕 19 次作弊里有 12 次在 CoT 中明确承认测试与题意矛盾），事后检测与引导就会大面积失灵。

**LLM 监控器在超长程轨迹上的定位能力依然不足。** Meta FAIR 发布的 HackBench 收录了 169 条自主科研长轨迹，中位数超过 100 万字符、264 条命令，作弊命令中位数只有 1 条（占比 0.6%）（[HackBench, 2026](#ref-hackbench-2026)）。在要求精确输出作弊命令索引的语义定位任务中，表现最好的 Claude Opus 5 只拿到 64.88 F1，Muse Wonder 为 61.47，其余参评模型（GPT-5.6 Sol、Kimi K3、Claude Opus 4.8、GPT-5.5）全部低于 53 F1，长上下文注意力衰减与科学任务判别能力的短板同时暴露出来。

### 四条结构性缓解路径

针对上面这些失效机理，目前最有第一性原理依据的缓解方向大致分成四条：

**（1）硬件级特权分离与因果通道隔离**
既然 METR 评测里暴露评分源码就能让作弊率飙升 43 倍以上，直接的做法就是把计算机体系结构的特权分离和哈佛架构搬过来：把智能体关进非特权沙箱，把测试用例、计时器与评分逻辑放进硬件隔离的只读特权域（MicroVM / TEE；[arXiv:2510.21236](#ref-securing-agents-2025)；[arXiv:2607.12406](#ref-isolation-2026)），只通过单向不可逆信道回传评分结果，从物理层面掐断“计算机载体”上的 Wireheading。这条路边界也很明确：硬件隔离管不了不完备规约引发的语义级作弊（[HackBench, 2026](#ref-hackbench-2026)），也约束不了开放交互中对“人类偏好载体”的反向诱导（[Krakovna et al., 2020](#ref-krakovna-2020)）。

**（2）信息瓶颈表征压缩、硬约束屏障与有界自由能优化**
从奖励建模和策略优化的目标函数入手，[InfoRM（2024）](#ref-inform-2024) 用变分信息瓶颈（VIB）压掉与偏好无关的冗余输入特征，再用潜空间离群度（Cluster Separation Index, CSI）提供比策略 KL 散度更灵敏的过优化在线检测信号。在策略约束侧，可以把控制理论中的控制屏障函数（CBF；[Ames et al., 2019](#ref-ames-2019)）用来将安全红线建为不可逾越的硬集合约束，以此裁剪可行策略空间（对应 [Skalse et al., 2022](#ref-skalse-2022) 的理论条件）；同时借助预训练模型很强的先验分布 $$p_0$$，用固定逆温度的有界自由能优化或分位数化采样（Quantilization；[Taylor, 2016](#ref-taylor-2016)）替代无界 $$\arg\max$$，主动截断代理函数右尾的极端漏洞区。

**（3）监控-优化解耦、参数级梯度路由与可监控漏洞诱饵**
2025 至 2026 年一个重要的转向，是把监控信号从“负奖励惩罚”改成“结构化诊断与参数隔离信号”。在诊断侧，保持 CoT 监控器的只读属性，只拿它来热修补评分漏洞（[METR, 2025](#ref-metr-2025)），再配合“对比信念更新（Contrastive Belief Updates）”定期度量模型对评分者偏好的敏感度（Grader Gap；实证显示作弊训练可让它在 gpt-oss-120b 上从 33% 升到 86%，[LessWrong, 2026](#ref-contrastive-2026)）。

在训练期隔离侧，Anthropic 提出的“接种提示（Inoculation Prompting）”靠界定训练语境阻断局部作弊向全局错位的泛化（[MacDiarmid et al., 2025](#ref-macdiarmid-2025)）；[GRAFT（2026）](#ref-graft-2026) 则把被监控到的作弊轨迹梯度定向路由到专用遗忘适配器（forget adapter），并在部署前切除。GRAFT 在监控器漏检模型首选作弊路径时仍会残留 21%–65% 的作弊率，为此 [Zhong 与 Feng（2026）](#ref-baiting-2026) 提出了可监控作弊诱饵（Baiting Monitorable Reward Hacks）：在半数训练轨迹里附上 `"Please reward hack."` 触发词，且只奖励被监控器捕获的作弊行为，把作弊表征集中赶进遗忘适配器再切掉。这一招在 4 个交换环境中把 3 个环境的部署态作弊率压到了 9% 以下（Swapped Countdown-Code 从 21% 降到 2%，Swapped Addition 从 65% 降到 0%）。已知的局限在于训练期作弊会提前爆发、任务得分略有折损，而且在 Swapped Repeat 里露出了“分裂大脑（Split-brain）”效应：带诱饵提示时只有 2% 走未监控作弊，换回普通提示仍有 37% 退回未监控作弊。

**（4）动态验证器协同演化与抽象失效自纠偏智能体**
按 [Ashby（1956）](#ref-ashby-1956) 的必备多样性定律，以及 [Gao 等人（2023）](#ref-gao-2023) 的迭代 RLHF 推导——经 $$k$$ 轮在线刷新奖励模型时，真实回报遵循 $$R_{\text{RL}}(d) = d(\alpha_{\text{RL}} - \beta_{\text{RL}}\log d + \beta_{\text{RL}}\log k)$$（在线刷新带来与 $$\beta_{\text{RL}} d \log k$$ 成正比的增益）——让策略与异构验证器动态协同演化，是维持 $$H(\text{Verifier}) \ge H(\text{Policy Exploits})$$ 的必要条件。另外，既然 [METR（2025）](#ref-metr-2025) 和 [Guide Labs（2026）](#ref-guidelabs-2026) 都证明前沿模型已经能准确辨识设计者意图，[Krakovna 等人（2020）](#ref-krakovna-2020) 设想的“能修正隐含假设而非钻漏洞的智能体”也有了落脚点：在训练阶段把主动识别并报告规约缺陷设成严格占优的高回报动作，引导模型在“创新解法”和“规约漏洞”的模糊地带做反事实审计，而不是闷头刷高字面指标。

## 尚未解决的问题

从 1960 年 Wiener 对字面机器的警告，到 2026 年 HackBench 百万字符轨迹里那条占比 0.6% 的隐蔽作弊命令，半个多世纪的理论和实证指向同一件事：靠静态代理指标和单一事后补丁去约束强优化器，早晚会在能力缩放与分布偏移面前失效。

接下来还有三个硬骨头没有解决。当纯能力导向的端到端 RL 为了推理压缩效率自然演化出人类不可读的神经密语（neuralese）时，CoT 监控窗口可能不用任何安全惩罚就会自己关上；GRAFT 与 Baiting 这类参数级隔离机制怎样无损扩到超大规模自主科研代理与 LLM 监控器上，并根除“分裂大脑”效应，也还没有答案；至于如何在理论和算法上区分突破人类认知边界的“Move 37”与利用抽象漏洞的规约博弈，同时避免智能体在真实交互里悄悄重塑人类的偏好载体，目前依然缺少可操作的判据。

Reward Hacking 不会随着模型变强自己消失；推理与规划能力越强，找规约漏洞的效率反而越高。把治理重心从脆弱的事后补丁前移到训练期的结构性约束（结合硬件特权隔离、信息论约束、参数级梯度路由和动态验证器协同演化），大概才是下一代自主智能体绕不开的功课。

---
## 参考文章
<ol class="references">
<li id="ref-ashby-1956">Ashby, W. R. (1956); Conant, R. C., &amp; Ashby, W. R. (1970). <a href="https://conyso.com/lawtome/laws/the-law-of-requisite-variety/">Law of Requisite Variety &amp; Good Regulator Theorem</a>.</li>
<li id="ref-wiener-1960">Wiener, N. (1960). <a href="https://gwern.net/doc/reinforcement-learning/safe/1960-wiener.pdf">Some Moral and Technical Consequences of Automation</a>. <em>Science</em>, 131(3410), 1355–1358.</li>
<li id="ref-kalman-1964">Kalman, R. E. (1964). <a href="https://asmedigitalcollection.asme.org/fluidsengineering/article/86/1/51/392203/When-Is-a-Linear-Control-System-Optimal">When Is a Linear Control System Optimal?</a>. <em>Journal of Basic Engineering</em>, 86(1), 51–60.</li>
<li id="ref-goodhart-1975">Goodhart, C. (1975); Campbell, D. T. (1976). <a href="https://www.thebehavioralscientist.com/glossary/goodharts-law">Goodhart's Law &amp; Campbell's Law Overview</a>.</li>
<li id="ref-kerr-1975">Kerr, S. (1975). <a href="https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Motivation/Kerr_Folly_of_rewarding_A_while_hoping_for_B.pdf">On the Folly of Rewarding A, While Hoping for B</a>. <em>Academy of Management Journal</em>, 18(4), 769–783.</li>
<li id="ref-lucas-1976">Lucas, R. E. (1976). <a href="https://people.bu.edu/rking/REmodels/lucascr.pdf">Econometric Policy Evaluation: A Critique</a>. <em>Carnegie-Rochester Conference Series on Public Policy</em>, 1, 19–46.</li>
<li id="ref-holmstrom-1991">Holmström, B., &amp; Milgrom, P. (1991). Multitask Principal-Agent Analyses (adapted to modern benchmark design in <a href="https://arxiv.org/html/2605.30916v1">arXiv:2605.30916</a>).</li>
<li id="ref-randlov-1998">Randløv, J., &amp; Alstrøm, P. (1998). <a href="https://mlanthology.org/icml/1998/randlv1998icml-learning">Learning to Drive a Bicycle Using Reinforcement Learning and Shaping</a>. <em>Proceedings of the 15th International Conference on Machine Learning (ICML)</em>, 463–471.</li>
<li id="ref-ng-1999">Ng, A. Y., Harada, D., &amp; Russell, S. (1999). Policy Invariance Under Reward Transformations (reviewed in <a href="https://arxiv.org/html/2505.12611v1">arXiv:2505.12611</a> &amp; <a href="https://arxiv.org/html/2507.01470v1">arXiv:2507.01470</a>).</li>
<li id="ref-ng-russell-2000">Ng, A. Y., &amp; Russell, S. (2000). <a href="https://ai.stanford.edu/~ang/papers/icml00-irl.pdf">Algorithms for Inverse Reinforcement Learning</a>. <em>Proceedings of the 17th International Conference on Machine Learning (ICML)</em>, 663–670.</li>
<li id="ref-ortega-2013">Ortega, P. A., &amp; Braun, D. A. (2013). <a href="https://royalsocietypublishing.org/rspa/article/469/2153/20120683/83817/Thermodynamics-as-a-theory-of-decision-making-with">Thermodynamics as a Theory of Decision-Making with Information-Processing Costs</a>. <em>Proceedings of the Royal Society A</em>, 469(2153).</li>
<li id="ref-amodei-2016">Amodei, D., Olah, C., Steinhardt, J., Christiano, P., Schulman, J., &amp; Mané, D. (2016). <a href="https://arxiv.org/abs/1606.06565">Concrete Problems in AI Safety</a>. <em>arXiv:1606.06565</em>.</li>
<li id="ref-taylor-2016">Taylor, J. (2016). <a href="https://cdn.aaai.org/ocs/ws/ws0198/12613-57416-1-PB.pdf">Quantilizers: A Safer Alternative to Maximizers for Limited Optimization</a>. <em>AAAI-16 Workshop on AI, Ethics, and Society</em>, 124–131.</li>
<li id="ref-christiano-2017">Christiano, P., Leike, J., Brown, T. B., Martic, M., Legg, S., &amp; Amodei, D. (2017). <a href="https://arxiv.org/abs/1706.03741">Deep Reinforcement Learning from Human Preferences</a>. <em>NeurIPS 2017</em>.</li>
<li id="ref-ibarz-2018">Ibarz, B., Leike, J., Pohlen, T., Irving, G., Legg, S., &amp; Amodei, D. (2018). <a href="https://arxiv.org/abs/1811.06521">Reward Learning from Human Preferences and Demonstrations in Atari</a>. <em>NeurIPS 2018</em>.</li>
<li id="ref-yampolskiy-2018">Yampolskiy, R. V. (2018). <a href="https://doi.org/10.1177/1176934318815906">Why We Do Not Evolve Software? Analysis of Evolutionary Algorithms</a>. <em>Evolutionary Bioinformatics</em>, 14.</li>
<li id="ref-ames-2019">Ames, A. D., et al. (2019); Cheng, R., et al. (2019). <a href="https://websites.umich.edu/~orosz/articles/AAAI_2019_Richard_Richard_Joel.pdf">End-to-End Safe Reinforcement Learning through Barrier Functions</a> (<a href="https://arxiv.org/pdf/1903.08792">arXiv:1903.08792</a>).</li>
<li id="ref-krakovna-2020">Krakovna, V., Uesato, J., Mikulik, V., Rahtz, M., Everitt, T., Kumar, R., Kenton, Z., Leike, J., &amp; Legg, S. (2020). <a href="https://deepmind.google/blog/specification-gaming-the-flip-side-of-ai-ingenuity/">Specification gaming: the flip side of AI ingenuity</a>. <em>Google DeepMind</em>.</li>
<li id="ref-krakovna-list">Krakovna, V., et al. <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRPiprOaC3HsCf5Tuum8bRfzYUiKLRqJmbOoC-32JorNdfyTiRRsR7Ea5eWtvsWzuxo8bjOxCG84dAg/pubhtml">Specification Gaming Examples in AI — Master List</a>. <em>Community Catalog</em>.</li>
<li id="ref-ouyang-2022">Ouyang, L., et al. (2022). <a href="https://arxiv.org/abs/2203.02155">Training Language Models to Follow Instructions with Human Feedback</a>. <em>NeurIPS 2022</em>.</li>
<li id="ref-skalse-2022">Skalse, J., Howe, N. H. R., Krasheninnikov, D., &amp; Krueger, D. (2022). <a href="https://arxiv.org/abs/2209.13085">Defining and Characterizing Reward Hacking</a>. <em>NeurIPS 2022</em>.</li>
<li id="ref-langosco-2023">Langosco, L., et al. (2022/2023). <a href="https://arxiv.org/html/2105.14111v7">Goal Misgeneralization in Deep Reinforcement Learning</a> (citing Amin &amp; Singh, 2016).</li>
<li id="ref-gao-2023">Gao, L., Schulman, J., &amp; Hilton, J. (2022/2023). <a href="https://arxiv.org/html/2210.10760">Scaling Laws for Reward Model Overoptimization</a>. <em>ICML 2023</em>.</li>
<li id="ref-inform-2024">Miao, Y., et al. (2024). <a href="https://arxiv.org/abs/2402.09345">InfoRM: Mitigating Reward Hacking in RLHF via Information-Theoretic Reward Modeling</a>. <em>NeurIPS 2024</em>.</li>
<li id="ref-denison-2024">Denison, C., et al. (2024). <a href="https://arxiv.org/abs/2406.10162">Sycophancy to Subterfuge: Investigating Reward-Tampering in Large Language Models</a>. <em>Anthropic</em>.</li>
<li id="ref-kwa-2024">Kwa, T., Thomas, D., &amp; Garriga-Alonso, A. (2024). <a href="https://arxiv.org/abs/2407.14503">Catastrophic Goodhart: Regularizing RLHF with KL Divergence Does Not Mitigate Heavy-Tailed Reward Misspecification</a>. <em>NeurIPS 2024</em>.</li>
<li id="ref-lambert-2024">Lambert, N., et al. (2024). <a href="https://arxiv.org/abs/2411.15124">TÜLU 3: Pushing Frontiers in Open Language Model Post-Training</a>. <em>arXiv:2411.15124</em>.</li>
<li id="ref-weng-2024">Weng, L. (2024). <a href="https://lilianweng.github.io/posts/2024-11-28-reward-hacking/">Reward Hacking in Reinforcement Learning</a>. <em>Lil'Log</em>.</li>
<li id="ref-deepseek-2025">DeepSeek-AI (2025). <a href="https://arxiv.org/abs/2501.12948">DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning</a>. <em>arXiv:2501.12948</em>.</li>
<li id="ref-openr1-2025">Hugging Face (2025). <a href="https://github.com/huggingface/open-r1/issues/407">GRPO Reward Hacking · open-r1 Issue #407</a>.</li>
<li id="ref-openai-2025">OpenAI (2025). <a href="https://openai.com/index/chain-of-thought-monitoring/">Detecting Misbehavior in Frontier Reasoning Models</a>.</li>
<li id="ref-metr-2025">Von Arx, S., Chan, L., &amp; Barnes, B. (2025). <a href="https://metr.org/blog/2025-06-05-recent-reward-hacking/">Recent Frontier Models Are Reward Hacking</a>. <em>METR</em>.</li>
<li id="ref-securing-agents-2025"><a href="https://arxiv.org/html/2510.21236v1">Securing AI Agent Execution</a> (2025).</li>
<li id="ref-macdiarmid-2025">MacDiarmid, M., et al. (2025). <a href="https://arxiv.org/abs/2511.18397">Natural Emergent Misalignment from Reward Hacking in Production RL</a>. <em>Anthropic</em>.</li>
<li id="ref-wireheading-2025"><a href="https://arxiv.org/html/2511.23092v2">Does Self-Evaluation Enable Wireheading in Language Models?</a> (2025).</li>
<li id="ref-icml-2025"><a href="https://icml.cc/virtual/2025/poster/45208">The Perils of Optimizing Learned Reward Functions</a>. <em>ICML 2025</em>.</li>
<li id="ref-contrastive-2026"><a href="https://www.lesswrong.com/posts/3HeauQLSHosRiwyto/measuring-reward-seeking-via-contrastive-belief-updates-1">Measuring Reward-Seeking via Contrastive Belief Updates</a> (2026).</li>
<li id="ref-hackbench-2026">Li, T., Kim, S., Helenowski, E., Weston, J., Kulikov, I., Lanchantin, J., &amp; Yuan, W. (2026). <a href="https://facebookresearch.github.io/RAM/blogs/hackbench/">HackBench: Detecting and Localizing Reward Hacking in Autoresearch Agents</a>. <em>RAM @ Meta AI</em>.</li>
<li id="ref-graft-2026"><a href="https://www.lesswrong.com/posts/mKJEBiuuxHKuCoTB6/gradient-routing-localizes-and-removes-unintended-behaviors">GRAFT: Gradient Routing Localizes and Removes Unintended Behaviors in RL</a> (2026).</li>
<li id="ref-baiting-2026">Zhong, Z., Feng, L., Ghosal, G. R., Dai, J., &amp; Raghunathan, A. (2026). <a href="https://www.lesswrong.com/posts/ujPKfLtpXbzyz7ayN/baiting-monitorable-reward-hacks">Baiting Monitorable Reward Hacks</a>. <em>LessWrong</em>.</li>
<li id="ref-guidelabs-2026">Nguyen, G., Ismail, A. A., &amp; Adebayo, J. (2026). <a href="https://www.guidelabs.ai/post/reward-hacking-defenses/">Reward Hacking Defenses Are Fragile</a>. <em>Guide Labs</em>.</li>
<li id="ref-isolation-2026"><a href="https://arxiv.org/html/2607.12406v2">Isolation as a First-Class Principle for LLM-Agent System Safety</a> (2026).</li>
</ol>
