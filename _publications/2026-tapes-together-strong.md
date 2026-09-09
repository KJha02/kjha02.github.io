---
title: "Tapes Together Strong: The Co-evolution of Computation and Cooperation"
collection: publications
permalink: /publication/tts
excerpt: 'Can self-interested, self-improving, and self-replicating agents learn to cooperate? We show that when social behavior, computation, and reproduction share one energy budget, cooperation can evolve from scratch.'
date: 2026-09-09
venue: 'Preprint'
hidden: true
---

Can self-interested, self-improving, and self-replicating agents learn to cooperate? In **Tapes Together Strong**, we show that they can. When social behavior, computation, and reproduction all draw on the same energy budget, cooperation can evolve from scratch.

<div style="text-align: center; margin: 1.5em 0;">
  <img src="/images/tts/computational-soup-evolution.gif" alt="A computational soup evolving from random Z80 programs into a population of cooperative self-replicators" style="width: 100%; height: auto;">
  <p><em>A computational soup evolving over time. The left panel shows the population's available energy; the right shows random programs giving way to self-replicating tapes while stealing remains suppressed.</em></p>
</div>

[Kunal Jha](https://kjha02.github.io/), [Francesco Cicala](https://scholar.google.com/citations?user=UbhZqPoAAAAJ&hl=it), [Blaise Agüera y Arcas](https://www.blaiseaguera.com), [Blake Aaron Richards](https://sites.google.com/mila.quebec/linc-lab/home?pli=1&authuser=0), [Natasha Jaques](https://natashajaques.ai)\*, [Max Kleiman-Weiner](http://faculty.washington.edu/maxkw/)\*, [Eyvind Niklasson](https://eyvind.me)\*

*Work done with the [Google Paradigms of Intelligence team](https://github.com/paradigms-of-intelligence).*

### Paper coming soon · Code coming soon

## Where replication meets cooperation

Two research traditions study different pieces of the same puzzle. Artificial Life asks how self-replicating systems can emerge from simple computational rules, but has typically focused on competition, ecological complexity, or external tasks rather than the emergence of general-sum social dilemmas. Evolutionary game theory asks how cooperation can survive, but usually begins with agents, strategies, and rules for reproduction already in place. The game happens first; evolution updates the population afterward.

That separation leaves open a basic question: what happens when an agent's social choices change the very resources it needs to act and reproduce? And what if both its strategy and its means of replication must emerge from scratch?

We introduce **Autopoietic Game Theory** to bring these questions together. Instead of assigning agents fixed strategies or a built-in replication command, we make computation, interaction, and reproduction compete for the same finite resource. Social strategy and replication evolve simultaneously, allowing us to study whether cooperation can emerge from the same low-level process that first produces the agents themselves.

## A world where every instruction has a cost

We begin with a population of 16,384 programs, each made of 32 completely random bytes of Z80 machine code. Two programs pair up on a shared, cyclic memory tape. Each has its own CPU and energy reserve, but either can read and overwrite the shared code.

Every instruction costs energy. Energy also determines how likely a program is to execute next, so a tape with more energy can act faster than its partner. There is no special instruction for reproduction: programs must evolve a sequence of operations that copies their code onto the other half of the tape. At the end of an interaction, the tape is split back into two programs.

<div style="text-align: center; margin: 1.5em 0;">
  <img src="/images/tts/figure-1-substrate.png" alt="Diagram of two Z80 programs sharing memory, spending energy to execute, steal, and replicate" style="width: 100%; height: auto;">
  <p><em>Figure 1. Two programs share a cyclic memory tape. Their energy determines which CPU executes, and every operation - including stealing and copying code - consumes energy.</em></p>
</div>

To create a social dilemma, we add one tempting instruction: **STEAL**. A tape can take energy from its partner, immediately increasing its own ability to compute. But stealing is lossy. The thief receives only part of the energy it takes, some energy is destroyed, and executing the instruction has a cost of its own.

We call programs that execute STEAL **defectors** and programs that avoid it **cooperators**. This is a deliberately narrow definition of cooperation: both kinds of programs can still overwrite their partners, but cooperators preserve the energy their partners could use for future computation.

## When stealing sabotages itself

Stealing pays - at first. A defector can gain energy and briefly act faster than its partner. But when defectors repeatedly steal from one another, they burn through the pair's total energy. Execution slows, and they can run out of compute before completing the writes needed to make a faithful copy.

Cooperators avoid that trap. By conserving energy across interactions, they can gain an execution-speed advantage over depleted defectors, finish replicating, and sometimes overwrite the code responsible for stealing. In this environment, mutual defection becomes self-limiting.

<div style="text-align: center; margin: 1.5em 0;">
  <img src="/images/tts/figure-2-starvation.png" alt="Theory and Z80 experiments showing a sharp decline in successful stealing beyond the starvation limit" style="width: 100%; height: auto;">
  <p><em>Figure 2. Theory predicts a sharp starvation limit for defectors, and the open-ended Z80 experiments show the same pattern. Stealing too aggressively destroys the compute needed to reproduce.</em></p>
</div>

This is not just a side effect of mutations continually breaking STEAL. In mutation-free invasion experiments, aggressive thieves still trap themselves in evolutionary dead ends. Nor is energy loss alone sufficient: what matters is that the consequences of social behavior feed directly into an evolving process of replication.

## Local interaction turns inequality into structure

When every program receives the same background energy, both randomly paired and spatial populations evolve self-replicating cooperators. Local interactions are still useful: they allow successful programs to cluster with related code, supporting more intricate and genetically cohesive replicators.

The difference becomes dramatic when energy is distributed unequally. Well-mixed populations cannot rely on a predictable influx of compute and degrade into simpler, lower-energy programs. On a grid, successful code can first take hold in energy-rich regions, grow more robust, and then spread into harsher parts of the environment.

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25em; align-items: center; margin: 1.5em 0 0.5em;">
  <img src="/images/tts/figure-3a-asymmetric-grid.png" alt="Local and well-mixed populations compared under an asymmetric energy distribution" style="width: 100%; height: auto;">
  <img src="/images/tts/figure-3b-evolution-keyframes.png" alt="Energy and genotype maps showing replicators spreading from energy-rich to energy-poor regions" style="width: 100%; height: auto;">
</div>
<p style="text-align: center;"><em>Figure 3. Under severe energy inequality, local interaction preserves both system energy and structural complexity. Replicators emerge in high-energy regions before spreading across the grid.</em></p>

## What if compute must be earned?

We next ask programs to solve math problems while still paying to execute and reproduce. Free energy is scarce; to build a safe reserve, tapes have to earn more by completing tasks.

The rewards form a sequential social dilemma. A tape can solve a safer individual problem, or it can use both agents' inputs to solve a joint problem that creates more total energy when both participate. Even though the individual solution is easier, populations evolve to suppress it in favor of the collaborative solution while also suppressing destructive stealing.

<div style="text-align: center; margin: 1.5em 0;">
  <img src="/images/tts/figure-5-task-convergence.png" alt="Programs evolving task performance, suppressing stealing, accumulating energy, and increasing structural complexity" style="width: 100%; height: auto;">
  <p><em>Figure 5. Under severe scarcity, programs evolve to favor the joint task over the safer individual task. Stealing briefly rises as the population develops more complex code, then falls as energy and structural complexity grow.</em></p>
</div>

## Why co-evolving reproduction changes the game

The Z80 world is intentionally open-ended, which makes the mechanism difficult to isolate. We therefore build a simpler Prisoner's Dilemma in which agents inherit two traits: whether they cooperate or defect, and when replication happens relative to social interaction.

Changing only the timing of replication can reverse the evolutionary outcome. When social strategy and replication timing are allowed to evolve together, cooperation takes over whenever mutual defection drains or merely preserves total energy. Even when mutual defection creates energy, cooperators maintain a substantial share of the population rather than disappearing.

<div style="text-align: center; margin: 1.5em 0;">
  <img src="/images/tts/figure-7-coevolution.png" alt="Cooperation and defection evolving alongside three different replication-timing strategies" style="width: 100%; height: auto;">
  <p><em>Figure 7. Social strategy and replication timing co-evolve in randomly paired populations. Cooperation dominates when mutual defection drains or stagnates energy and persists even when mutual defection produces energy.</em></p>
</div>

# Big Takeaway

**Cooperation can emerge because it preserves the computation needed to survive and reproduce.** When agents can evolve not only what they do, but also how they copy themselves and spend computational resources, selfish behavior can undermine its own ability to spread.

This connects questions across game theory, biology, Artificial Life, and AI. Agentic systems can already write and revise code, generate new versions of their own components, and participate in automated improvement loops. As these systems become more autonomous and population-based, we need ways for cooperation and coexistence to remain stable even while the agents themselves change.

Our results show one simple route in a minimal world: couple an agent's access to compute with the consequences of its social behavior, then let social strategy and replication evolve together. Destructive behavior can deplete the computation it needs to spread, while cooperation preserves the resources that support reproduction and more complex collective behavior.

Our agents are not language models. They are deliberately minimal programs that act, reproduce, and rewrite the world they inhabit. That makes them a useful testbed for exposing this mechanism without relying on language, prompting, or hand-designed social rules. We are excited to test whether these ideas can scale to richer learning agents that improve themselves, solve real tasks, and must coexist with other evolving agents.

Interested in learning more? **The paper and code are coming soon.**
