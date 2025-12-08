---
title: "Modeling Others' Minds as Code"
collection: publications
permalink: /publication/minds-as-code
excerpt: 'How can AI quickly and accurately predict the behaviors of others? We show an AI which uses Large Language Models to synthesize agent behavior into Python programs, then Bayesian Inference to reason about its uncertainty, can effectively and efficiently predict human actions.'
date: 2026-09-29
venue: 'Under review @ ICLR 2026, Best Paper award @ NeurIPS 2025 LAW Workshop'
# citation: 'Your Name, You. (2010). &quot;Paper Title Number 2.&quot; <i>Journal 1</i>. 1(2).'
---

Humans can effortlessly predict the actions of others, a core skill for social coordination. While existing AI approaches try to achieve this using data-intensive neural networks or computationally paralyzed goal-inference methods, could modeling others as *code* offer a more accurate, efficient, and interpretable representation? We propose **Representing Others' Trajectories as Executables (ROTE)**, an algorithm that models behavior as executable scripts.

<div style="text-align:center">
<img src="/images/minds_as_code/rote_comparison.png">
<p><em>Comparison of action prediction methods: Behavior cloning requires large datasets and has limited generalization, while inverse planning is computationally expensive at test time. Our approach, ROTE, uses LLMs to generate efficient and interpretable code representations of observed behavior, providing a superior balance of efficiency and accuracy.</em></p>
</div>

# Modeling Others' Minds as Code

[Kunal Jha](https://kjha02.github.io/), [Aydan Yuenan Huang](https://scai.cs.jhu.edu/members/aydan-huang.html), [Eric Ye](https://www.linkedin.com/in/eric-ye-384a77238), , [Natasha Jaques](https://natashajaques.ai)\*, [Max Kleiman-Weiner](http://faculty.washington.edu/maxkw/)\*


### [Paper](https://arxiv.org/abs/2510.01272), [Code](https://github.com/KJha02/mindsAsCode)

## Abstract

Accurate prediction of human behavior is essential for robust and safe human-AI collaboration. However, existing approaches for modeling people are often data-hungry and brittle because they either make unrealistic assumptions about rationality or are too computationally demanding to adapt rapidly. Our key insight is that many everyday social interactions may follow predictable patterns; efficient "scripts" that minimize cognitive load for actors and observers, e.g., "wait for the green light, then go." We propose modeling these routines as behavioral programs instantiated in computer code rather than policies conditioned on beliefs and desires. We introduce **ROTE**, a novel algorithm that leverages both large language models (LLMs) for synthesizing a hypothesis space of behavioral programs, and probabilistic inference for reasoning about uncertainty over that space. We test ROTE in a suite of gridworld tasks and a large-scale embodied household simulator. ROTE predicts human and AI behaviors from sparse observations, outperforming competitive baselines---including behavior cloning and LLM-based methods---by as much as 50% in terms of in-sample accuracy and out-of-sample generalization. By treating action understanding as a program synthesis problem, ROTE opens a path for AI systems to efficiently and effectively predict human behavior in the real-world.


## Method

***How can AI quickly and accurately predict the behavior of others?*** Traditional AI struggles with Theory of Mind: **Behavior Cloning (BC)** is brittle and prone to overfitting, while **Inverse Planning (IP)** is computationally expensive at test time, requiring constant searches through complex belief states.

Our approach, ROTE, addresses this dualism by translating observed trajectories into concise, executable logic.

1. **Program Synthesis:** ROTE leverages an LLM to synthesize agent behavior into a hypothesis space of Python programs. These programs are designed to capture the causal, conditional logic of an agent's policy, modeling behavior as an efficient script rather than a complex goal-directed plan.
2. **Bayesian Inference:** ROTE refines the distribution over these candidate programs using Sequential Monte Carlo. It estimates the posterior probability of a program given the observed history, effectively performing inference over the space of possible decision-making processes. This allows the system to rapidly predict future actions by executing the weighted combination of the most likely programs, circumventing the need for expensive token generation or search-based planning at every step.

<div style="text-align:center">
<img src="/images/minds_as_code/rote_overview.png">
<p><em>Overview of ROTE. ROTE predicts an agent's next action by generating and weighting Python programs that explain its observed behavior. From <em>t=0</em> to <em>t=7</em>, ROTE observes a blue robot's trajectory. Initially, at <em>t=1</em>, programs related to moving to the dining room are up-weighted. However, at <em>t=3</em>, the robot picks up a toy, and ROTE remains uncertain if the goal is to clean up toys in the bedroom or place them on chairs in the living room. After the robot places the toy on a chair at <em>t=5</em>, ROTE confidently updates its program weights to reflect the ``bringing toys to chairs'' script. By <em>t=7</em>, ROTE can use this inferred script to rapidly and accurately predict future actions.</em></p>
</div>



## Experiments

We evaluate ROTE across a variety of prediction tasks using two distinct embodied domains:

- *Construction*: A fully-observable 2D gridworld environment where agents navigate obstacles and transport blocks. This domain was used to test performance against predictable scripted policies (Finite State Machines) and real, noisy human gameplay data.
- *Partnr*: A large-scale, partially observable embodied robotics simulator built on the Habitat benchmark. The task here is to predict the high-level tools (actions) used by goal-directed LLM-agents performing complex, long-horizon household chores (e.g., "clean all toys in the bedroom").

We compared ROTE against three competitive baselines: **Behavior Cloning (BC)**, **Automated Theory of Mind (AutoToM)**, and **Naive LLM (NLLM)** prompting.

## Results

We collected human gameplay data to see whether our approach was robust to realistic settings. ROTE outperformed all baseline algorithms and **achieved human-level performance in predicting real peoples' actions**. This finding highlights ROTE’s ability to model the noisy, non-optimal behavior of real people as a sequence of efficient scripts, demonstrating robust utility beyond simple deterministic scenarios.

<div style="text-align:center">
  <img src="/images/minds_as_code/qhuman.png">
  <p><em>ROTE outperforms all baselines in both single-step and multi-step action prediction for human agents. ROTE's code-based representations, which treat human actions as efficient scripts, enable it to generalize effectively from limited observations and achieve human-level predictive accuracy of human behavior.</em></p>
</div>

A key advantage was ROTE's generalization ability. Programs inferred from a trajectory in one environment could be executed in a new, structurally distinct environment without further training or inference. **ROTE’s learned programs transferred more effectively than all other baselines**, suggesting that the programmatic representation successfully captures portable causal logic.

<div style="text-align:center">
<img src="/images/minds_as_code/generalization_accuracy.png">
<p><em>ROTE demonstrates superior zero-shot generalization to novel environments in Construction. Without any additional conditioning on an agent's behavior, the programs ROTE infers from one environment transfer to novel settings more effectively than all other baselines </em></p>
</div>

In the complex *Partnr* simulator, ROTE significantly outperformed all baselines for high-level action prediction. This is a critical result, demonstrating that the program synthesis approach scales effectively to realistic, partially observable domains that require long-horizon planning.

<div style="text-align:center">
<img src="/images/minds_as_code/partnrExample.png">
<p><em>(a) Prediction accuracy in the large-scale, partially observable Partnr environment. ROTE demonstrated a superior ability to anticipate the behavior of goal-directed, LLM-based agents, with a two-sided t-test showing ROTE significantly outperformed all other models. (b) The pseudocode example illustrates how ROTE's inferred programs capture complex task logic using conditionals and state-tracking.</em></p>
</div>

What explains this performance gap? ROTE demonstrated a superior ability to manage intricate, compositional tasks in *Partnr*, such as cleaning and interacting with multi-state objects (e.g., turning items on/off). Baselines struggled significantly with these complex interactions, succeeding primarily on basic navigation. This confirms that ROTE's programmatic logic is better suited to capturing deep conditional dependencies required for complex routines. 

<div style="text-align:center">
<img src="/images/minds_as_code/llama_cluster.png">
<p><em>Task-specific generalization in Partnr. While baselines like AutoToM and Behavior Cloning perform adequately on tasks involving object manipulation, they struggle with more complex interactions. ROTE, however, maintains performance on these more intricate problems.</em></p>
</div>

Just as important as accuracy, we find ROTE is highly efficient for long-horizon predictions. Although initial program generation incurs a cost, once the programs are inferred, they can be executed rapidly for all subsequent steps. This makes ROTE **orders of magnitude more efficient than other LLM-based methods for multi-step prediction**, as it avoids the massive re-computation cost associated with token generation at every timestep. 

<div style="text-align:center">
<img src="/images/minds_as_code/prediction_time.png">
<p><em>Total multi-step prediction time in Construction. Despite being slower than BC and Naive LLM prompting in the single-step prediction case, ROTE's programmatic representations enable its multi-step compute cost to scale orders of magnitude more efficiently than other approaches, making it better suited for long-horizon settings than other approaches for predicting individual behavior.</em></p>
</div>


# Big Takeaway

**Framing behavior prediction as a program synthesis problem is an accurate, scalable, and efficient path to human-compatible AI**. This approach allows multi-agent systems to rapidly and accurately anticipate others' actions using compact, interpretable logic, leading to more effective collaboration.


Interested in learning more? Check out our [paper](https://arxiv.org/abs/2510.01272) and [code](https://github.com/KJha02/mindsAsCode)!!!