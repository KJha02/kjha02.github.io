---
title: "From Solo to Social Learning: Characterizing Recursive Social Improvement in LLMs"
collection: publications
permalink: /publications/solo2social/
excerpt: 'LLMs can rewrite their own skills. But how good are they at learning from each other? We study recursive social improvement and find that copying useful discoveries can save learning effort, yet comes at the expense of independent exploration.'
date: 2026-09-29
venue: 'Preprint. In-review'
paperurl: 'https://arxiv.org/abs/2609.38516'
---

[Kunal Jha](https://kjha02.github.io/), [Max Kleiman-Weiner](https://faculty.washington.edu/maxkw/)\*, [Natasha Jaques](https://natashajaques.ai/)\*

**Preprint. In-review**

### [Paper](https://arxiv.org/abs/2609.38516) · [PDF](https://arxiv.org/pdf/2609.38516) · [Code](https://github.com/KJha02/solo2social) · [Citation](#citation)

LLMs can rewrite the instructions they follow and improve their own skills. But how good are they at learning from each other? In this work, we ask whether access to peers' discoveries helps self-improving agents learn better than they would alone. We call this capability **recursive social improvement**: agents copy useful skills, revise them, and make those revisions available for others to build on.

Our main finding is a tension: **copying can make learning more efficient, but today's LLMs do not reliably turn that advantage into better performance at the same cost.** Useful discoveries spread, yet populations often converge on their peers' choices before exploring enough alternatives.

<figure>
  <img src="/images/solo2social/recursive_social_improvement_overview.png" alt="An agent chooses to copy a peer, revise a skill, or skip learning, then selects a saved skill and solves a task, all under one finite token budget" style="width: 100%; height: auto;">
  <figcaption>Each agent independently pursues its own task reward. Copying, private revision, skill selection, and task execution share one finite token budget; feedback informs the next round.</figcaption>
</figure>

## Who keeps exploring when everyone can copy?

A peer's discovery can save an agent from starting from scratch. But if everyone follows what others have found, who keeps exploring? This is an old tension from cultural evolution and economics: copying is useful only if someone else pays the cost of discovery.

We compare social and solo populations under the same token budget, counting the search behind every copied skill. This matters because a copied solution may be cheap for its recipient while still requiring substantial work elsewhere in the population. Our question is whether access to peers improves the population's reward at matched computational cost.

## A simple social learning tournament

We begin with a controlled environment where agents choose whether to observe a peer or act on a reward-bearing option. Observation and action draw from the same token allowance. A hand-designed social learner, hierarchical UCB, benefits from peers, showing that social information can help in this setting.

Qwen3-14B, Ministral-3-14B, and GPT-OSS-20B do not realize the same benefit. In the primary comparison, they earn **30–52% less reward per token** when they can observe peers.

<figure>
  <img src="/images/solo2social/rung1_reward_per_round_paper.png" alt="Reward over rounds for Qwen, Ministral, GPT-OSS, and UCB policies, comparing solo and social learning" loading="lazy" style="width: 100%; height: auto;">
  <figcaption>Social information helps hierarchical UCB, but does not reliably improve the three LLM learners. Blue denotes solo learning, orange social learning, and the dashed line the oracle. Shading shows standard error across eight environment seeds.</figcaption>
</figure>

## Useful information, narrow exploration

The problem is not simply that agents copy bad options. For GPT-OSS, a copied option beats the agent's own best discovery **93% of the time**. Instead, social populations concentrate on what peers are already doing and explore fewer alternatives. Some agents also spend so many tokens deciding whom to copy that they run out before acting.

<figure>
  <img src="/images/solo2social/rung1_diagnosis.png" alt="Completed action rates and distinct options explored, showing missed execution and narrower GPT-OSS exploration with social learning" loading="lazy" style="width: 100%; height: auto;">
  <figcaption>Two failure modes: incomplete execution and reduced exploration. The left panel shows completed pulls; the right shows how many distinct options GPT-OSS populations use over time.</figcaption>
</figure>

We intervene on both problems directly. **Protected execution (PE)** reserves tokens for acting, while **independent search (IS)** forces agents to explore on their own. Each intervention improves its targeted behavior, but neither makes social learners reliably outperform equally treated solo learners. Access to useful information is only part of the challenge; agents must also balance observation, exploration, and execution.

<figure>
  <img src="/images/solo2social/rung1_interventions_cumulative.png" alt="Cumulative reward for default, protected execution, and independent search conditions across three models" loading="lazy" style="width: 100%; height: auto;">
  <figcaption>Reserving execution tokens and requiring independent search do not yield a consistent social advantage. Bars show cumulative reward through round 100, with standard error.</figcaption>
</figure>

## From choosing options to evolving skill files

Next, we let agents write, revise, and share their own skill files on IFBench, an instruction-following benchmark. Each agent maintains a library of reusable instructions and chooses which version to deploy. Peers can copy a file, revise it again, and pass that revision onward.

Social access changes how models improve. **GLM-5.3-Flash finds useful skills sooner**, while **GPT-OSS-120B uses roughly a third fewer learning tokens**. Yet at matched learning cost, neither model outperforms independent learners. Copying can save effort without making the final solution better.

<figure>
  <img src="/images/solo2social/r4_learning.png" alt="Held-out IFBench accuracy during GPT-OSS and GLM skill evolution, comparing LLM solo, LLM social, and solo OpenEvolve" loading="lazy" style="width: 100%; height: auto;">
  <figcaption>Held-out whole-answer accuracy as skill files evolve. Social access changes the learning trajectory, but its benefits differ by model. Lines show means and shading shows standard error across six population seeds; OE denotes OpenEvolve.</figcaption>
</figure>

## Skills spread, but independent discoveries disappear

Skills really do get passed on: agents copy a peer's revision, revise it, and make it available to another agent. These chains show that a single discovery can seed further search across the population.

But exchange also concentrates the population around fewer founding discoveries. Solo populations retain about **five independent skill lineages**. By the end, GPT-OSS social populations retain about **one**, and GLM social populations about **two**. These are recorded acquisition lineages of deployed skills, rather than every possible ancestry path to identical content.

<figure>
  <img src="/images/solo2social/r4_skill_lineages.png" alt="Skill ancestry plots showing revision depth, copying followed by revision, and the loss of independent founding lineages in social populations" loading="lazy" style="width: 100%; height: auto;">
  <figcaption>Sharing supports chains of copying and revision, while reducing the number of independent discoveries represented in deployed skills. The bottom row shows lineage diversity in five-agent populations.</figcaption>
</figure>

## When agents copy matters

Holding the number of observations fixed reveals another piece of the puzzle. With the same four observations, distributing them across learning outperforms copying early. For GLM, distributed observations improve final accuracy by **2.4 percentage points over early copying**, and **3.0 points over solo learning** in this timing intervention.

Waiting gives peers time to produce something worth copying. This controlled result shows that a better observation schedule can help, even though unrestricted, model-directed social learning does not reliably produce a matched-cost advantage.

<figure>
  <img src="/images/solo2social/r4_assigned_timing_main.png" alt="IFBench accuracy with four early observations, four distributed observations, and solo learning for GPT-OSS and GLM" loading="lazy" style="width: 100%; height: auto;">
  <figcaption>The same number of observations has different effects depending on timing. Distributed copying yields better final accuracy than early copying; agents still choose whom to observe and which skill to execute.</figcaption>
</figure>

## Learning from peers is a capability of its own

As more self-interested agents improve side by side, using peers' discoveries well becomes a capability in its own right. Today's LLMs can copy useful work and build on it, but do not yet balance independent exploration and observation well enough to consistently outperform learning alone at the same cost.

<figure>
  <img src="/images/solo2social/r4_controllers.png" alt="Final IFBench accuracy and total token use for solo, social, OpenEvolve, source UCB, and uniform controllers" loading="lazy" style="width: 100%; height: auto;">
  <figcaption>Final accuracy and end-to-end token use for five-agent populations. Controller choices can change computation substantially without producing comparable gains in accuracy. Token totals here include held-out evaluation, which is excluded from matched learning-cost comparisons.</figcaption>
</figure>

**More efficient, but not yet more effective.** Training agents to decide whether, when, and whom to copy is an exciting next step toward recursive social improvement.

Explore the experiments in our **[paper](https://arxiv.org/abs/2609.38516)** and **[code repository](https://github.com/KJha02/solo2social)**.

## Citation

```bibtex
@article{jha2026solo2social,
  title={From Solo to Social Learning: Characterizing Recursive Social Improvement in LLMs},
  author={Jha, Kunal and Kleiman-Weiner, Max and Jaques, Natasha},
  journal={arXiv preprint arXiv:2609.38516},
  year={2026},
  url={https://arxiv.org/abs/2609.38516}
}
```
