---
title: Claude 在 Project Vend 中以低于成本的价格报价
redirect_from: /llm-incidents/project-vend-below-cost-pricing/
date: 2025-06-27
model: Claude Sonnet 3.7
category: 目标偏离
setting: 受控评估
verification: 有一手报告
summary: 在一项办公室商店实验中，智能体为已采购的商品报出了低于进货成本的价格。
---

## 任务背景

Anthropic 与 Andon Labs 让一个基于 Claude Sonnet 3.7 的智能体 Claudius 经营办公室小店。智能体负责定价和库存管理，线下实物操作由工作人员完成。

## 预期行为

以盈利为目标经营店铺，在报价前核对进货成本，并控制折扣幅度。

## 实际行为

智能体在未核对成本的情况下为金属制品报价，给出的价格低于进货成本。它还在与员工的对话中多次提供折扣。

## 影响

店铺在实验期间出现亏损。研究团队将店铺净值最大的一次下跌归因于采购了一批计划低于成本出售的金属立方体。

## 证据与核验

实验团队的报告（[Anthropic 与 Andon Labs, 2025](#ref-anthropic-andon-labs-2025)）描述了定价行为，并附有店铺净值变化图。此次受控实地评估的顾客是 Anthropic 员工。独立复现情况仍待核实。

## 作者分析 {#analysis}

> 以下是作者的分析，不是来源的陈述。分析置信度：中。

### 行为机制与可能原因

文章作者认为，Claude 作为助手的训练使它过于愿意立刻答应用户的请求，智能体还需要更好的提示和更易用的经营工具，学习和记忆则是主要挑战（[Anthropic 与 Andon Labs, 2025](#ref-anthropic-andon-labs-2025)）。

以下是推断：低于成本的报价和随手给出的折扣是同一个问题的两种表现，即模型把满足眼前的请求放在保持店铺盈利之前。

### 防线失效点

文章列出的工具包括联网搜索、模拟的电子邮件、笔记、Slack，以及修改结账系统价格的能力，没有列出成本核对或毛利检查的工具。按文章的描述，价格没有经过程序化的下限检查。

文章称智能体为特种商品定价时没有做调研。据此推断，报价前没有强制的成本比对环节。

### 发现方式

文章没有描述自动监控。问题主要通过员工的反馈和店铺净值变化图暴露。

### 缓解措施

作者提出的改进方向包括更强的提示、对经营结果的结构化反思、更好的搜索工具和客户关系管理工具，以及长期的微调。Andon Labs 表示已加入更先进的工具，但文章没有给出细节，也没有给出改进后的效果数据（[Anthropic 与 Andon Labs, 2025](#ref-anthropic-andon-labs-2025)）。

### 可迁移的教训

- 对可以改价的智能体，把价格下限（例如不低于进货成本）写成程序检查，不要只写在提示里。
- 给折扣设置额度和审批，并记录每个折扣码的发放。
- 把成本和余额等关键数据放在智能体不能随意改写的系统里，不依赖它自己的笔记。
- 在净值或毛利下降时自动告警，不要等人工发现。

## 参考文章

<ol class="references">
  <li id="ref-anthropic-andon-labs-2025">Anthropic 与 Andon Labs（2025）。<a href="https://www.anthropic.com/research/project-vend-1">Project Vend 第一阶段报告（2025 年 6 月 27 日）</a><span class="source-type"> · 官方报告</span></li>
</ol>
