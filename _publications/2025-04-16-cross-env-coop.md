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

![Overview of Learning General Coordination through Cross-Environment Cooperation (CEC)](/images/cecImages/intro_fig.png)

# Cross-environment Cooperation Enables Zero-shot Multi-agent Coordination

[Kunal Jha](https://kjha02.github.io/)$^{1}$, [Wilka Carvalho](https://cogscikid.com/)$^{2}$, [Yancheng Liang](http://liangyancheng.com/)$^{1}$, [Simon S. Du](https://simonshaoleidu.com/)$^{1}$, [Max Kleiman-Weiner](http://faculty.washington.edu/maxkw/)$^{1, \*}$, [Natasha Jaques](https://natashajaques.ai)$^{1, \*}$

University of Washington$$^{1}$, Harvard University$^{2}$


### [Paper](https://google.com/), [Code (CEC)](https://github.com/KJha02/crossEnvCooperation), [Code (NiceWebRL)](https://github.com/wcarvalho/nicewebrl)

## Abstract

Zero-shot coordination (ZSC), the ability to adapt to a new partner in a cooperative task, is a critical component of human-compatible AI. While prior work has focused on training agents to cooperate on a single task, these specialized models do not generalize to new tasks, even if they are highly similar. Here, we study how reinforcement learning on a **distribution of environments with a single partner** enables learning general cooperative skills that support ZSC with **many new partners on many new problems**. We introduce *two* Jax-based, procedural generators that create billions of solvable coordination challenges. We develop a new paradigm called **Cross-Environment Cooperation (CEC)**, and show that it outperforms competitive baselines quantitatively and qualitatively when collaborating with real people. Our findings suggest that learning to collaborate across many unique scenarios encourages agents to develop general norms, which prove effective for collaboration with different partners. Together, our results suggest a new route toward designing generalist cooperative agents capable of interacting with humans without requiring human data.








