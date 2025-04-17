---
title: "Cross-environment Cooperation Enables Zero-shot Multi-agent Coordination"
collection: publications
permalink: /publication/cross-env-coop
excerpt: 'How can AI develop the ability to cooperate with novel people on novel problems? We show AI learning to cooperate in "self-play" with one partner on many environments helps agents meta-learn to cooperate with humans and other AI on problems they have never seen before.'
date: 2025-04-16
venue: 'CogSci'
# paperurl: 'http://academicpages.github.io/files/paper2.pdf'
# citation: 'Your Name, You. (2010). &quot;Paper Title Number 2.&quot; <i>Journal 1</i>. 1(2).'
---

From an early age, humans have the ability of robust cooperation with new people in unfamiliar environments. How can AI develop a similar ability to cooperate with novel people on novel problems? We propose Cross-Environment Cooperation (CEC), a framework for training just one policy to learn environment generalization as a means of improving its partner generalization.

<div style="text-align:center">
  <img src="/images/cecImages/intro_fig.png">
  <p><em>Cross-Environment Cooperation Framework</em></p>
</div>

# Cross-environment Cooperation Enables Zero-shot Multi-agent Coordination

[Kunal Jha](https://kjha02.github.io/), [Wilka Carvalho](https://cogscikid.com/), [Yancheng Liang](http://liangyancheng.com/), [Simon S. Du](https://simonshaoleidu.com/), [Max Kleiman-Weiner](http://faculty.washington.edu/maxkw/), [Natasha Jaques](https://natashajaques.ai)


### [Paper](https://google.com/), [Code (CEC)](https://github.com/KJha02/crossEnvCooperation), [Code (NiceWebRL)](https://github.com/wcarvalho/nicewebrl)

## Abstract

Zero-shot coordination (ZSC), the ability to adapt to a new partner in a cooperative task, is a critical component of human-compatible AI. While prior work has focused on training agents to cooperate on a single task, these specialized models do not generalize to new tasks, even if they are highly similar. Here, we study how reinforcement learning on a **distribution of environments with a single partner** enables learning general cooperative skills that support ZSC with **many new partners on many new problems**. We introduce *two* Jax-based, procedural generators that create billions of solvable coordination challenges. We develop a new paradigm called **Cross-Environment Cooperation (CEC)**, and show that it outperforms competitive baselines quantitatively and qualitatively when collaborating with real people. Our findings suggest that learning to collaborate across many unique scenarios encourages agents to develop general norms, which prove effective for collaboration with different partners. Together, our results suggest a new route toward designing generalist cooperative agents capable of interacting with humans without requiring human data.


## Method

How can AI agents learn to generalize cooperative strategies to new partners or environments? While population-based training (PBT) improves adaptability to novel partners on a single task, it fails when faced with even slight task variations, requiring retraining for each new environment. PBT focuses on partner diversity in a fixed environment, that lead to brittle representations of a task. For instance, in a simple toy experiment below, where agents are rewarded for going to opposing green squares, PBT methods may learn a strategy that works for a single level, such as "move up if your partner moves down, and down if they move up." However, this strategy fails when the green square is moved to the left or right by even a small amount.

<div style="text-align:center">
  <img src="/images/cecImages/toy_env_overview.png">
  <p><em>Dual Destination Overview</em></p>
</div>

In contrast, we propose **Cross-Environment Cooperation (CEC)**, a framework for training an agent to cooperate in self-play on procedurally generated environments. By exposing agents to diverse coordination challenges, they learn general norms (e.g., role allocation, collision avoidance) instead of memorizing fixed strategies. In our "Dual Destination" example above, this leads to learning a better representation of the true task of moving to separate green squares that can transfer to new environments and partners, instead of memorizing a strategy that works for a single level.

<div style="text-align:center">
  <img src="/images/cecImages/bar_plot_toy.png">
  <p><em>Cross-Play ZSC Results from the Dual Destination Problem</em></p>
</div>

## Experiments

<div style="text-align:center">
  <img src="/images/cecImages/ogToProcOvercooked.png">
  <p><em>Overcooked: Human-Designed vs Procedurally Generated Environments</em></p>
</div>

We evaluate CEC on Overcooked, a collaborative cooking simulator where humans and AIs work together to deliver cooked items to a goal. Agents are tested on both held-out human-designed layouts and entirely novel procedural environments, paired with AI and human partners. Unlike previous work on Overcooked which studied only 5 layouts, our procedural generator creates billions of solvable environments, allowing us to study how general cooperative skills transfer to new environments and partners at an unprecedented scale.

## Results

We find that CEC outperforms competitive baselines quantitatively and qualitatively when collaborating with real people and other AIs. In the Zero-shot Coordination (ZSC) evaluation paradigm, *CEC agents achieve significantly higher reward with novel partners on novel environments than PBT methods which have seen the same environment during training.* These same PBT agents are unable to generalize cooperation to novel environments. Moreover, CEC proves to be an effective pretraining step, with CEC agents finetuned in self-play on a single enviroment achieving the highest cross-play performance of any method.

<div style="text-align:center">
  <img src="/images/cecImages/partner_env_diverse.png">
  <p><em>ZSC Results from Overcooked. CEC agents achieve significantly higher reward with novel partners on novel environments than PBT methods which have seen the same environment during training.</em></p>
</div>

In the Ad-hoc Teamplay setting, which is where we have cooperator agents trained with different algorithms collaborate with each other, we use **empirical game theory analysis** to show that CEC agents are selected for as a dominant strategy across a population of agents. 

<div style="text-align:center">
  <img src="/images/cecImages/stackedEvo.png">
  <p><em>Evolutionary Game Theory Analysis on Handcrafted vs Procedurally Generated Environments. CEC agents are selected for as a dominant strategy across a population of agents.</em></p>
</div>

When paired with humans, we again find that CEC agents outperform population-based methods, and are rated qualitatively the best by human participants to collaborate with. We took a closer look and found that CEC agent collide with humans less than other methods, and this **increased adaptability reflects a general norm for cooperation** learned to facillitate better coordination across a vast number of environments.

<div style="display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 20px;">
  <div style="flex: 1; margin-right: 10px;">
    <img src="/images/cecImages/combined_metrics_avg.png">
    <p style="text-align: center; font-size: 0.9em;"><strong>Figure:</strong> Human-AI collaboration results. (Top) Rewards received by different methods collaborating with humans. (Bottom) Average human qualitative ratings of different methods.</p>
  </div>
  <div style="flex: 1; margin-left: 10px;">
    <img src="/images/cecImages/hAI_collision_avg.png">
    <p style="text-align: center; font-size: 0.9em;"><strong>Figure:</strong> Average number of collisions between humans and AIs for different methods. Humans rated CEC agents as more adaptive, and the lower collision results reflect that.</p>
  </div>
</div>

## Big Takeaway

**Environment diversity > Partner diversity:** Training across diverse tasks teaches agents how to cooperate, not just whom to cooperate with. This enables zero-shot coordination with novel partners in novel environments, a critical step toward human-compatible AI.
