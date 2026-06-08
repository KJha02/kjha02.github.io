(function () {
  "use strict";

  const ACTIONS = [
    { name: "up", dx: 0, dy: -1, glyph: "^" },
    { name: "right", dx: 1, dy: 0, glyph: ">" },
    { name: "down", dx: 0, dy: 1, glyph: "v" },
    { name: "left", dx: -1, dy: 0, glyph: "<" },
  ];

  const ACTION_COUNT = ACTIONS.length;
  const ALGORITHMS = [
    { key: "q", label: "Q-learning", color: "#246bfe" },
    { key: "dyna", label: "Dyna-Q", color: "#148a4a" },
    { key: "her", label: "HER Q-learning", color: "#c47a00" },
  ];

  const SNIPPETS = {
    q: {
      label: "Q-learning update",
      starter: [
        "// TODO: compute the TD target and update values[action].",
        "// Available: agent, transition, goal, state, action, reward,",
        "// nextState, done, values, nextValues, max().",
        "agent.warnOnce(\"TODO: qLearningUpdate is still a no-op.\");",
      ].join("\n"),
      answer: [
        "const target = done ? reward : reward + agent.gamma * max(nextValues);",
        "values[action] += agent.alpha * (target - values[action]);",
      ].join("\n"),
    },
    dyna: {
      label: "Dyna-Q planning update",
      starter: [
        "// TODO: build a fake transition from this model prediction,",
        "// then call qLearningUpdate(agent, fakeTransition).",
        "// Available: agent, state, action, prediction, currentGoal,",
        "// qLearningUpdate().",
        "agent.warnOnce(\"TODO: Dyna-Q planning updates are still missing.\");",
      ].join("\n"),
      answer: [
        "const reachedGoal = currentGoal !== null && prediction.nextState === currentGoal;",
        "const fakeTransition = {",
        "  state,",
        "  action,",
        "  reward: reachedGoal ? 1 : -0.01,",
        "  nextState: prediction.nextState,",
        "  done: reachedGoal,",
        "};",
        "qLearningUpdate(agent, fakeTransition);",
      ].join("\n"),
    },
    her: {
      label: "HER relabeling update",
      starter: [
        "// TODO: relabel every transition as if finalAchievedGoal",
        "// had been the intended goal, then call qLearningUpdate().",
        "// Available: agent, episode, finalAchievedGoal, qLearningUpdate().",
        "agent.warnOnce(\"TODO: HER relabeling updates are still missing.\");",
      ].join("\n"),
      answer: [
        "for (const oldTransition of episode) {",
        "  const success = oldTransition.nextState === finalAchievedGoal;",
        "  const relabeledTransition = {",
        "    ...oldTransition,",
        "    reward: success ? 1 : -0.01,",
        "    done: success,",
        "  };",
        "  qLearningUpdate(agent, relabeledTransition, finalAchievedGoal);",
        "}",
      ].join("\n"),
    },
  };

  const API_GUIDES = {
    q: {
      title: "What your Q-learning code receives",
      lines: [
        "<code>transition</code>: <code>{ state: string, action: number, reward: number, nextState: string, done: boolean }</code>.",
        "<code>values</code> is the mutable Q array for <code>state</code>; <code>nextValues</code> is the Q array for <code>nextState</code>.",
        "Expected answer: compute a TD target, then update <code>values[action]</code> in place using <code>agent.alpha</code> and <code>agent.gamma</code>.",
      ],
    },
    dyna: {
      title: "What your Dyna-Q planning code receives",
      lines: [
        "<code>state</code> and <code>action</code> identify a previously observed transition; <code>prediction.nextState</code> is the learned model's next state.",
        "<code>currentGoal</code> is a state key like <code>\"9,9\"</code>. Use it to recompute reward and terminal status for imagined transitions.",
        "Expected answer: build <code>fakeTransition</code>, then call <code>qLearningUpdate(agent, fakeTransition)</code>.",
      ],
    },
    her: {
      title: "What your HER code receives",
      lines: [
        "<code>episode</code> is an array of transitions from one rollout. Each transition has <code>state</code>, <code>action</code>, <code>nextState</code>, <code>achieved</code>, <code>reward</code>, and <code>done</code>.",
        "<code>finalAchievedGoal</code> is the state the agent actually reached at the end of the rollout.",
        "Expected answer: loop over <code>episode</code>, recompute reward/done as if <code>finalAchievedGoal</code> were the goal, then call <code>qLearningUpdate(agent, relabeledTransition, finalAchievedGoal)</code>.",
      ],
    },
  };

  function zeros() {
    return Array(ACTION_COUNT).fill(0);
  }

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function argmax(values) {
    let best = 0;
    for (let i = 1; i < values.length; i += 1) {
      if (values[i] > values[best]) best = i;
    }
    return best;
  }

  function max(values) {
    return Math.max(...values);
  }

  function stateGoalKey(state, goal) {
    return state + "|" + goal;
  }

  class GridWorld {
    constructor(width = 11, height = 11) {
      this.width = width;
      this.height = height;
      this.resetDefault();
    }

    makeFourRoomsWalls() {
      const walls = new Set();
      const mid = Math.floor(this.width / 2);
      const verticalDoors = new Set([2, 8]);
      const horizontalDoors = new Set([2, 8]);

      for (let y = 0; y < this.height; y += 1) {
        if (!verticalDoors.has(y)) walls.add(mid + "," + y);
      }

      for (let x = 0; x < this.width; x += 1) {
        if (!horizontalDoors.has(x)) walls.add(x + "," + mid);
      }

      return walls;
    }

    reset() {
      this.agent = { ...this.start };
      return this.stateKey(this.agent);
    }

    resetDefault() {
      this.start = { x: 1, y: 1 };
      this.goal = { x: 9, y: 9 };
      this.walls = this.makeFourRoomsWalls();
      this.reset();
    }

    stateKey(pos = this.agent) {
      return pos.x + "," + pos.y;
    }

    goalKey() {
      return this.stateKey(this.goal);
    }

    parseKey(key) {
      const parts = key.split(",").map(Number);
      return { x: parts[0], y: parts[1] };
    }

    inBounds(pos) {
      return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
    }

    isWall(pos) {
      return this.walls.has(this.stateKey(pos));
    }

    isFree(pos) {
      return this.inBounds(pos) && !this.isWall(pos);
    }

    step(actionIndex) {
      const action = ACTIONS[actionIndex];
      const candidate = { x: this.agent.x + action.dx, y: this.agent.y + action.dy };
      const next = this.isFree(candidate) ? candidate : this.agent;
      this.agent = { ...next };
      const done = this.stateKey(next) === this.goalKey();
      return {
        state: this.stateKey(next),
        achieved: this.stateKey(next),
        reward: done ? 1 : -0.01,
        done,
      };
    }

    setWall(x, y) {
      const key = x + "," + y;
      if (key === this.stateKey(this.start) || key === this.goalKey()) return;
      if (this.walls.has(key)) this.walls.delete(key);
      else this.walls.add(key);
    }

    setStart(x, y) {
      const pos = { x, y };
      if (!this.isFree(pos) || this.stateKey(pos) === this.goalKey()) return;
      this.start = pos;
      this.agent = { ...pos };
    }

    setGoal(x, y) {
      const pos = { x, y };
      if (!this.isFree(pos) || this.stateKey(pos) === this.stateKey(this.start)) return;
      this.goal = pos;
    }

    freeStates() {
      const states = [];
      for (let y = 0; y < this.height; y += 1) {
        for (let x = 0; x < this.width; x += 1) {
          const key = x + "," + y;
          if (!this.walls.has(key)) states.push(key);
        }
      }
      return states;
    }
  }

  class CodeProfile {
    constructor(defaults = {}) {
      this.qBody = defaults.qBody || SNIPPETS.q.starter;
      this.dynaBody = defaults.dynaBody || SNIPPETS.dyna.starter;
      this.herBody = defaults.herBody || SNIPPETS.her.starter;
      this.compileAll();
    }

    compileAll() {
      this.qUpdate = compileQ(this.qBody);
      this.dynaPlanning = compileDyna(this.dynaBody, this);
      this.herRelabel = compileHER(this.herBody, this);
    }

    setSnippet(kind, body) {
      this[kind + "Body"] = body;
      if (kind === "q") this.qUpdate = compileQ(body);
      if (kind === "dyna") this.dynaPlanning = compileDyna(body, this);
      if (kind === "her") this.herRelabel = compileHER(body, this);
    }
  }

  function compileQ(body) {
    const fn = new Function(
      "agent",
      "transition",
      "goal",
      "api",
      [
        "\"use strict\";",
        "const { state, action, reward, nextState, done } = transition;",
        "const values = agent.values(state, goal);",
        "const nextValues = agent.values(nextState, goal);",
        "const { max } = api;",
        body,
      ].join("\n")
    );
    return function qUpdate(agent, transition, goal = null) {
      return fn(agent, transition, goal, { max });
    };
  }

  function compileDyna(body, profile) {
    const fn = new Function(
      "agent",
      "state",
      "action",
      "prediction",
      "api",
      [
        "\"use strict\";",
        "const currentGoal = agent.currentGoal;",
        "const { qLearningUpdate, max } = api;",
        body,
      ].join("\n")
    );
    return function dynaPlanning(agent, state, action, prediction) {
      return fn(agent, state, action, prediction, {
        max,
        qLearningUpdate: function (targetAgent, transition, goal = null) {
          return profile.qUpdate(targetAgent, transition, goal);
        },
      });
    };
  }

  function compileHER(body, profile) {
    const fn = new Function(
      "agent",
      "episode",
      "finalAchievedGoal",
      "api",
      [
        "\"use strict\";",
        "const { qLearningUpdate, max } = api;",
        body,
      ].join("\n")
    );
    return function herRelabel(agent, episode, finalAchievedGoal) {
      return fn(agent, episode, finalAchievedGoal, {
        max,
        qLearningUpdate: function (targetAgent, transition, goal = null) {
          return profile.qUpdate(targetAgent, transition, goal);
        },
      });
    };
  }

  class TabularAgent {
    constructor(params = {}, profile) {
      this.alpha = params.alpha ?? 0.25;
      this.gamma = params.gamma ?? 0.95;
      this.epsilon = params.epsilon ?? 0.2;
      this.planningSteps = params.planningSteps ?? 12;
      this.profile = profile;
      this.q = new Map();
      this.visits = new Map();
      this.learningWarnings = new Set();
    }

    qKey(state, goal = null) {
      return goal ? stateGoalKey(state, goal) : state;
    }

    values(state, goal = null) {
      const key = this.qKey(state, goal);
      if (!this.q.has(key)) this.q.set(key, zeros());
      return this.q.get(key);
    }

    chooseAction(state, goal = null, exploring = true) {
      if (exploring && Math.random() < this.epsilon) return randomInt(ACTION_COUNT);
      return argmax(this.values(state, goal));
    }

    noteVisit(state) {
      this.visits.set(state, (this.visits.get(state) ?? 0) + 1);
    }

    warnOnce(message) {
      if (this.learningWarnings.has(message)) return;
      this.learningWarnings.add(message);
    }

    warnings() {
      return Array.from(this.learningWarnings);
    }

    bestValue(state, goal = null) {
      return max(this.values(state, goal));
    }

    bestAction(state, goal = null) {
      return argmax(this.values(state, goal));
    }
  }

  class QLearningAgent extends TabularAgent {
    learn(transition) {
      this.noteVisit(transition.state);
      this.profile.qUpdate(this, transition);
    }
  }

  class DynaQAgent extends TabularAgent {
    constructor(params = {}, profile) {
      super(params, profile);
      this.model = new Map();
      this.currentGoal = null;
    }

    modelKey(state, action) {
      return state + "|" + action;
    }

    learn(transition) {
      this.noteVisit(transition.state);
      if (transition.goal) this.currentGoal = transition.goal;
      this.profile.qUpdate(this, transition);
      this.model.set(this.modelKey(transition.state, transition.action), {
        nextState: transition.nextState,
        achieved: transition.achieved,
      });
      this.planFromModel();
    }

    planFromModel() {
      const entries = Array.from(this.model.entries());
      if (entries.length === 0) return;

      for (let i = 0; i < this.planningSteps; i += 1) {
        const entry = entries[randomInt(entries.length)];
        const parts = entry[0].split("|");
        this.profile.dynaPlanning(this, parts[0], Number(parts[1]), entry[1]);
      }
    }

    replan(goalKey, extraPlanningSteps = this.planningSteps * 20) {
      this.currentGoal = goalKey;
      const originalPlanningSteps = this.planningSteps;
      this.planningSteps = extraPlanningSteps;
      this.planFromModel();
      this.planningSteps = originalPlanningSteps;
    }
  }

  class HERAgent extends TabularAgent {
    constructor(params = {}, profile) {
      super(params, profile);
      this.episode = [];
    }

    learn(transition, envGoalKey) {
      this.noteVisit(transition.state);
      this.episode.push(transition);
      this.profile.qUpdate(this, transition, envGoalKey);
      if (transition.done) {
        this.profile.herRelabel(this, this.episode.slice(), this.episode[this.episode.length - 1].achieved);
        this.episode = [];
      }
    }
  }

  function makeAgent(kind, params, profile) {
    if (kind === "dyna") return new DynaQAgent(params, profile);
    if (kind === "her") return new HERAgent(params, profile);
    return new QLearningAgent(params, profile);
  }

  class Workbench {
    constructor(root) {
      this.root = root;
      this.mode = root.dataset.mode;
      this.title = root.dataset.title || "RL workbook";
      this.env = new GridWorld();
      this.training = false;
      this.greedyPath = [];
      this.drag = null;
      this.tool = "wall";
      this.adaptationEvents = [];
      this.selectedEditorKind = this.mode === "compare" ? "q" : this.mode;
      this.fixedKind = this.mode === "compare" ? "q" : this.mode;
      this.profile = this.makeInitialProfile();
      this.returns = [];
      this.compareReturns = { q: [], dyna: [], her: [] };
      this.compareAgents = null;

      this.render();
      this.bind();
      this.resetAgents();
      this.updateReadouts();
      this.log("Ready. Run your code or use the ground truth, then train.");
      this.drawGrid();
      this.drawChart();
    }

    makeInitialProfile() {
      if (this.mode === "q") {
        return new CodeProfile({
          qBody: SNIPPETS.q.starter,
          dynaBody: SNIPPETS.dyna.answer,
          herBody: SNIPPETS.her.answer,
        });
      }
      if (this.mode === "dyna") {
        return new CodeProfile({
          qBody: SNIPPETS.q.answer,
          dynaBody: SNIPPETS.dyna.starter,
          herBody: SNIPPETS.her.answer,
        });
      }
      if (this.mode === "her") {
        return new CodeProfile({
          qBody: SNIPPETS.q.answer,
          dynaBody: SNIPPETS.dyna.answer,
          herBody: SNIPPETS.her.starter,
        });
      }
      return new CodeProfile({
        qBody: SNIPPETS.q.answer,
        dynaBody: SNIPPETS.dyna.answer,
        herBody: SNIPPETS.her.answer,
      });
    }

    render() {
      const compare = this.mode === "compare";
      const editorOptions = ALGORITHMS.map((algo) => {
        const kind = algo.key === "q" ? "q" : algo.key;
        return "<option value=\"" + kind + "\">" + SNIPPETS[kind].label + "</option>";
      }).join("");

      this.root.innerHTML = [
        "<div class=\"rl-workbench-shell\">",
        "  <div class=\"rl-workbench-top\">",
        "    <h3>" + this.title + "</h3>",
        "    <div class=\"rl-status\" data-role=\"status\">Ready</div>",
        "  </div>",
        "  <section class=\"rl-editor-panel\">",
        "    <div class=\"rl-editor-head\">",
        compare
          ? "      <div class=\"rl-field\"><label for=\"editor-kind-" + this.mode + "\">Editable snippet</label><select class=\"rl-select rl-editor-select\" data-role=\"editor-kind\" id=\"editor-kind-" + this.mode + "\">" + editorOptions + "</select></div>"
          : "      <label>" + SNIPPETS[this.mode].label + "</label>",
        "      <div class=\"rl-button-row\">",
        "        <button class=\"rl-button\" data-action=\"run-code\">Run code</button>",
        "        <button class=\"rl-button\" data-action=\"ground-truth\">Use ground truth</button>",
        "        <button class=\"rl-button\" data-action=\"starter\">Reset starter</button>",
        "      </div>",
        "    </div>",
        "    <div class=\"rl-api-guide\" data-role=\"api-guide\"></div>",
        "    <textarea class=\"rl-editor\" spellcheck=\"false\" data-role=\"editor\"></textarea>",
        "  </section>",
        "  <div class=\"rl-workbench-layout\">",
        "    <section class=\"rl-grid-panel\">",
        "      <div class=\"rl-toolbar\" aria-label=\"Grid editing tools\">",
        "        <button class=\"rl-button rl-tool is-active\" data-tool=\"wall\">Wall</button>",
        "        <button class=\"rl-button rl-tool\" data-tool=\"start\">Start</button>",
        "        <button class=\"rl-button rl-tool\" data-tool=\"goal\">Goal</button>",
        "        <button class=\"rl-button\" data-action=\"reset-world\">Reset world</button>",
        "      </div>",
        "      <canvas class=\"rl-canvas\" data-role=\"grid\" width=\"660\" height=\"660\" aria-label=\"Four rooms gridworld\"></canvas>",
        "      <div class=\"rl-legend\" aria-label=\"Grid legend\">",
        "        <span><i class=\"rl-swatch rl-swatch-start\"></i>Start</span>",
        "        <span><i class=\"rl-swatch rl-swatch-agent\"></i>Agent</span>",
        "        <span><i class=\"rl-swatch rl-swatch-goal\"></i>Goal</span>",
        "        <span><i class=\"rl-swatch rl-swatch-path\"></i>Last path</span>",
        "      </div>",
        "    </section>",
        "    <section class=\"rl-control-panel\">",
        compare
          ? "      <div class=\"rl-field\"><label>Algorithm</label><select class=\"rl-select\" data-role=\"algorithm\">" + ALGORITHMS.map((algo) => "<option value=\"" + algo.key + "\">" + algo.label + "</option>").join("") + "</select></div>"
          : "",
        "      <div class=\"rl-slider-grid\">",
        "        <label>Alpha <input data-role=\"alpha\" type=\"range\" min=\"0.01\" max=\"1\" step=\"0.01\" value=\"0.25\"></label>",
        "        <label>Gamma <input data-role=\"gamma\" type=\"range\" min=\"0\" max=\"0.99\" step=\"0.01\" value=\"0.95\"></label>",
        "        <label>Epsilon <input data-role=\"epsilon\" type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" value=\"0.2\"></label>",
        "        <label>Planning <input data-role=\"planning\" type=\"range\" min=\"0\" max=\"60\" step=\"1\" value=\"12\"></label>",
        "        <label>Speed <input data-role=\"speed\" type=\"range\" min=\"1\" max=\"10\" step=\"1\" value=\"4\"></label>",
        "      </div>",
        "      <div class=\"rl-readouts\" data-role=\"readouts\"></div>",
        "      <div class=\"rl-button-row\">",
        "        <button class=\"rl-button\" data-action=\"train\">Train</button>",
        "        <button class=\"rl-button\" data-action=\"step\">Step episode</button>",
        "        <button class=\"rl-button\" data-action=\"greedy\">Run greedy</button>",
        "        <button class=\"rl-button\" data-action=\"reset-agent\">" + (compare ? "Reset selected" : "Reset agent") + "</button>",
        compare ? "        <button class=\"rl-button\" data-action=\"reset-all\">Reset all</button>" : "",
        "      </div>",
        "      <div class=\"rl-button-row\">",
        "        <button class=\"rl-button\" data-action=\"shift-goal\">Shift goal</button>",
        "        <button class=\"rl-button\" data-action=\"toggle-barrier\">Toggle barrier</button>",
        "      </div>",
        "      <label><input data-role=\"reset-on-edit\" type=\"checkbox\"> Reset agents after world edits</label>",
        "      <div class=\"rl-field\"><label>Heatmap</label><select class=\"rl-select\" data-role=\"heatmap\"><option value=\"value\">Max Q value</option><option value=\"policy\">Greedy action</option><option value=\"visits\">Visit count</option></select></div>",
        "      <canvas class=\"rl-chart\" data-role=\"chart\" width=\"520\" height=\"180\" aria-label=\"Episode return chart\"></canvas>",
        "      <pre class=\"rl-log\" data-role=\"log\" aria-live=\"polite\"></pre>",
        "    </section>",
        "  </div>",
        "</div>",
      ].join("\n");

      this.gridCanvas = this.root.querySelector("[data-role='grid']");
      this.gridCtx = this.gridCanvas.getContext("2d");
      this.chartCanvas = this.root.querySelector("[data-role='chart']");
      this.chartCtx = this.chartCanvas.getContext("2d");
      this.statusEl = this.root.querySelector("[data-role='status']");
      this.logEl = this.root.querySelector("[data-role='log']");
      this.apiGuide = this.root.querySelector("[data-role='api-guide']");
      this.editor = this.root.querySelector("[data-role='editor']");
      this.editorKind = this.root.querySelector("[data-role='editor-kind']");
      this.algorithm = this.root.querySelector("[data-role='algorithm']");
      this.alpha = this.root.querySelector("[data-role='alpha']");
      this.gamma = this.root.querySelector("[data-role='gamma']");
      this.epsilon = this.root.querySelector("[data-role='epsilon']");
      this.planning = this.root.querySelector("[data-role='planning']");
      this.speed = this.root.querySelector("[data-role='speed']");
      this.heatmap = this.root.querySelector("[data-role='heatmap']");
      this.resetOnEdit = this.root.querySelector("[data-role='reset-on-edit']");
      this.readouts = this.root.querySelector("[data-role='readouts']");
      this.updateApiGuide();
      this.editor.value = this.currentBody();
    }

    bind() {
      this.root.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => this.handleAction(button.dataset.action));
      });

      this.root.querySelectorAll("[data-tool]").forEach((button) => {
        button.addEventListener("click", () => {
          this.root.querySelectorAll("[data-tool]").forEach((item) => item.classList.remove("is-active"));
          button.classList.add("is-active");
          this.tool = button.dataset.tool;
        });
      });

      [this.alpha, this.gamma, this.epsilon, this.planning, this.speed].forEach((input) => {
        input.addEventListener("input", () => {
          this.updateReadouts();
          this.syncParams();
        });
      });

      if (this.algorithm) {
        this.algorithm.addEventListener("change", () => {
          this.fixedKind = this.algorithm.value;
          this.greedyPath = [];
          this.env.reset();
          this.drawGrid();
          this.drawChart();
        });
      }

      if (this.editorKind) {
        this.editorKind.addEventListener("change", () => {
          try {
            this.profile.setSnippet(this.selectedEditorKind, this.editor.value);
          } catch (error) {
            this.log("Keeping last valid " + SNIPPETS[this.selectedEditorKind].label + ": " + error.message);
          }
          this.selectedEditorKind = this.editorKind.value;
          this.updateApiGuide();
          this.editor.value = this.currentBody();
        });
      }

      this.heatmap.addEventListener("change", () => this.drawGrid());
      this.bindCanvas();
    }

    bindCanvas() {
      this.gridCanvas.addEventListener("pointerdown", (event) => {
        const cell = this.canvasCell(event);
        const key = cell.x + "," + cell.y;
        const mode = key === this.env.goalKey() ? "goal" : key === this.env.stateKey(this.env.start) ? "start" : this.tool;
        this.drag = {
          mode,
          before: this.worldSignature(),
          startCell: cell,
          lastCell: null,
        };
        this.gridCanvas.setPointerCapture(event.pointerId);
        this.applyMode(mode, cell.x, cell.y);
        this.drag.lastCell = cell;
        this.drawGrid();
      });

      this.gridCanvas.addEventListener("pointermove", (event) => {
        if (!this.drag) return;
        const cell = this.canvasCell(event);
        if (this.sameCell(this.drag.lastCell, cell)) return;
        if (this.drag.mode === "wall" && this.sameCell(this.drag.startCell, cell)) return;
        this.applyMode(this.drag.mode, cell.x, cell.y);
        this.drag.lastCell = cell;
        this.drawGrid();
      });

      this.gridCanvas.addEventListener("pointerup", (event) => {
        if (!this.drag) return;
        const before = this.drag.before;
        const mode = this.drag.mode;
        this.drag = null;
        this.gridCanvas.releasePointerCapture(event.pointerId);
        if (this.worldSignature() !== before) this.noteWorldChange(mode + " edit");
      });

      this.gridCanvas.addEventListener("pointercancel", () => {
        this.drag = null;
      });
    }

    handleAction(action) {
      if (action === "run-code") return this.runCode();
      if (action === "ground-truth") return this.useSnippet("answer");
      if (action === "starter") return this.useSnippet("starter");
      if (action === "reset-world") {
        this.env.resetDefault();
        this.resetAgents();
        this.log("World reset to the four-rooms default.");
        this.drawGrid();
        this.drawChart();
      }
      if (action === "train") return this.trainLoop();
      if (action === "step") return this.stepEpisode();
      if (action === "greedy") return this.runGreedy();
      if (action === "reset-agent") return this.resetSelected();
      if (action === "reset-all") return this.resetAgents();
      if (action === "shift-goal") return this.shiftGoal();
      if (action === "toggle-barrier") return this.toggleBarrier();
      return undefined;
    }

    currentBody() {
      return this.profile[this.selectedEditorKind + "Body"];
    }

    updateApiGuide() {
      const guide = API_GUIDES[this.selectedEditorKind];
      this.apiGuide.innerHTML = [
        "<h4>" + guide.title + "</h4>",
        guide.lines.map((line) => "<p>" + line + "</p>").join(""),
      ].join("");
    }

    useSnippet(which) {
      const body = SNIPPETS[this.selectedEditorKind][which];
      this.editor.value = body;
      this.applyEditorBody(body);
    }

    runCode() {
      this.applyEditorBody(this.editor.value);
    }

    applyEditorBody(body) {
      try {
        this.profile.setSnippet(this.selectedEditorKind, body);
        this.resetAgents();
        this.log(SNIPPETS[this.selectedEditorKind].label + " compiled.");
      } catch (error) {
        this.log("Compile error: " + error.message);
      }
    }

    params() {
      return {
        alpha: Number(this.alpha.value),
        gamma: Number(this.gamma.value),
        epsilon: Number(this.epsilon.value),
        planningSteps: Number(this.planning.value),
      };
    }

    currentKind() {
      return this.mode === "compare" ? this.fixedKind : this.mode;
    }

    currentAgent() {
      if (this.mode === "compare") return this.compareAgents[this.currentKind()];
      return this.agent;
    }

    currentReturns() {
      if (this.mode === "compare") return this.compareReturns[this.currentKind()];
      return this.returns;
    }

    resetAgents() {
      this.training = false;
      const trainButton = this.root.querySelector("[data-action='train']");
      if (trainButton) trainButton.textContent = "Train";
      this.greedyPath = [];
      this.adaptationEvents = [];
      this.env.reset();

      if (this.mode === "compare") {
        this.compareAgents = {
          q: makeAgent("q", this.params(), this.profile),
          dyna: makeAgent("dyna", this.params(), this.profile),
          her: makeAgent("her", this.params(), this.profile),
        };
        this.compareReturns = { q: [], dyna: [], her: [] };
      } else {
        this.agent = makeAgent(this.mode, this.params(), this.profile);
        this.returns = [];
      }

      this.drawGrid();
      this.drawChart();
    }

    resetSelected() {
      this.training = false;
      const trainButton = this.root.querySelector("[data-action='train']");
      if (trainButton) trainButton.textContent = "Train";
      this.greedyPath = [];
      this.env.reset();
      if (this.mode === "compare") {
        this.compareAgents[this.currentKind()] = makeAgent(this.currentKind(), this.params(), this.profile);
        this.compareReturns[this.currentKind()] = [];
      } else {
        this.agent = makeAgent(this.mode, this.params(), this.profile);
        this.returns = [];
      }
      this.log("Reset " + this.currentLabel() + ".");
      this.drawGrid();
      this.drawChart();
    }

    currentLabel() {
      return ALGORITHMS.find((algo) => algo.key === this.currentKind()).label;
    }

    syncParams() {
      if (this.mode === "compare") {
        Object.values(this.compareAgents || {}).forEach((agent) => Object.assign(agent, this.params()));
      } else if (this.agent) {
        Object.assign(this.agent, this.params());
      }
    }

    updateReadouts() {
      this.readouts.innerHTML = [
        "alpha " + Number(this.alpha.value).toFixed(2),
        "gamma " + Number(this.gamma.value).toFixed(2),
        "epsilon " + Number(this.epsilon.value).toFixed(2),
        "planning " + this.planning.value,
        "speed " + this.speed.value,
      ].map((text) => "<span>" + text + "</span>").join("");
    }

    trainingCadence() {
      const speed = Number(this.speed.value);
      return {
        episodesPerRefresh: speed <= 3 ? 1 : Math.ceil((speed - 2) * 1.6),
        delayMs: Math.max(25, 850 - speed * 80),
      };
    }

    async trainLoop() {
      this.training = !this.training;
      const button = this.root.querySelector("[data-action='train']");
      button.textContent = this.training ? "Pause" : "Train";
      while (this.training) {
        this.syncParams();
        const cadence = this.trainingCadence();
        const data = this.currentReturns();
        for (let i = 0; i < cadence.episodesPerRefresh; i += 1) {
          data.push(this.episode());
        }
        this.statusEl.textContent = this.currentLabel() + ": episodes " + data.length;
        this.reportWarnings();
        this.drawGrid();
        this.drawChart();
        await new Promise((resolve) => window.setTimeout(resolve, cadence.delayMs));
      }
    }

    stepEpisode() {
      this.syncParams();
      this.currentReturns().push(this.episode());
      this.statusEl.textContent = this.currentLabel() + ": episodes " + this.currentReturns().length;
      this.reportWarnings();
      this.drawGrid();
      this.drawChart();
    }

    runGreedy() {
      const total = this.episode(180, false, false);
      this.log("Greedy return " + total.toFixed(2) + ".");
      this.drawGrid();
    }

    episode(maxSteps = 220, exploring = true, learn = true) {
      let state = this.env.reset();
      let total = 0;
      this.greedyPath = [];
      const agent = this.currentAgent();
      const kind = this.currentKind();

      for (let t = 0; t < maxSteps; t += 1) {
        const goal = kind === "her" ? this.env.goalKey() : null;
        const action = agent.chooseAction(state, goal, exploring);
        const result = this.env.step(action);
        const transition = {
          state,
          action,
          reward: result.reward,
          nextState: result.state,
          achieved: result.achieved,
          done: result.done,
          goal: this.env.goalKey(),
        };
        total += result.reward;

        if (learn) {
          try {
            if (kind === "her") agent.learn(transition, this.env.goalKey());
            else agent.learn(transition);
          } catch (error) {
            agent.warnOnce("Runtime error: " + error.message);
            this.training = false;
            const button = this.root.querySelector("[data-action='train']");
            if (button) button.textContent = "Train";
            break;
          }
        }

        state = result.state;
        this.greedyPath.push(this.env.parseKey(state));
        if (result.done) break;
      }

      if (learn && kind === "her" && agent.episode.length > 0) {
        const finalAchievedGoal = agent.episode[agent.episode.length - 1].achieved;
        try {
          agent.profile.herRelabel(agent, agent.episode.slice(), finalAchievedGoal);
          agent.episode = [];
        } catch (error) {
          agent.warnOnce("Runtime error: " + error.message);
          this.training = false;
          const button = this.root.querySelector("[data-action='train']");
          if (button) button.textContent = "Train";
        }
      }

      return total;
    }

    reportWarnings() {
      this.currentAgent().warnings().forEach((warning) => this.log(warning));
    }

    log(message) {
      const lines = this.logEl.textContent.split("\n").filter(Boolean).slice(-8);
      lines.push(message);
      this.logEl.textContent = lines.join("\n");
    }

    noteWorldChange(message) {
      if (this.resetOnEdit.checked) {
        this.resetAgents();
        this.log(message + "; agents reset.");
      } else {
        this.adaptationEvents.push({ episode: this.currentReturns().length, label: message });
        Object.values(this.compareAgents || {}).forEach((agent) => {
          if (agent instanceof DynaQAgent) agent.replan(this.env.goalKey());
        });
        if (this.agent instanceof DynaQAgent) this.agent.replan(this.env.goalKey());
        this.env.reset();
        this.greedyPath = [];
        this.log(message + "; learned tables preserved.");
      }
      this.drawGrid();
      this.drawChart();
    }

    shiftGoal() {
      const current = this.env.goalKey();
      const start = this.env.stateKey(this.env.start);
      const candidates = this.env.freeStates().filter((state) => state !== current && state !== start);
      const next = this.env.parseKey(candidates[randomInt(candidates.length)]);
      this.env.setGoal(next.x, next.y);
      this.noteWorldChange("goal shifted to " + next.x + "," + next.y);
    }

    toggleBarrier() {
      const x = Math.floor(this.env.width / 2);
      const gap = Math.floor(this.env.height / 2);
      let added = 0;
      for (let y = 1; y < this.env.height - 1; y += 1) {
        if (y === gap || y === 2 || y === 8) continue;
        const key = x + "," + y;
        if (key === this.env.stateKey(this.env.start) || key === this.env.goalKey()) continue;
        if (this.env.walls.has(key)) this.env.walls.delete(key);
        else {
          this.env.walls.add(key);
          added += 1;
        }
      }
      this.noteWorldChange(added > 0 ? "barrier added" : "barrier removed");
    }

    drawGrid() {
      const size = this.gridCanvas.width;
      const cell = size / this.env.width;
      const agent = this.currentAgent();
      const kind = this.currentKind();
      this.gridCtx.clearRect(0, 0, size, size);

      const values = this.env.freeStates().map((state) => {
        if (this.heatmap.value === "visits") return agent.visits.get(state) ?? 0;
        return agent.bestValue(state, kind === "her" ? this.env.goalKey() : null);
      });
      const minValue = Math.min(0, ...values);
      const maxValue = Math.max(0.001, ...values);

      for (let y = 0; y < this.env.height; y += 1) {
        for (let x = 0; x < this.env.width; x += 1) {
          const key = x + "," + y;
          const px = x * cell;
          const py = y * cell;

          if (this.env.walls.has(key)) {
            this.gridCtx.fillStyle = "#1f2937";
          } else {
            const raw = this.heatmap.value === "visits"
              ? agent.visits.get(key) ?? 0
              : agent.bestValue(key, kind === "her" ? this.env.goalKey() : null);
            const t = (raw - minValue) / (maxValue - minValue || 1);
            this.gridCtx.fillStyle = "rgb(" + Math.round(246 - 92 * t) + ", " + Math.round(248 - 48 * t) + ", " + Math.round(252 - 158 * t) + ")";
          }

          this.gridCtx.fillRect(px, py, cell, cell);
          this.gridCtx.strokeStyle = "#cbd5e1";
          this.gridCtx.strokeRect(px, py, cell, cell);

          if (!this.env.walls.has(key) && this.heatmap.value === "policy") {
            const goal = kind === "her" ? this.env.goalKey() : null;
            const a = agent.bestAction(key, goal);
            this.gridCtx.fillStyle = "#475569";
            this.gridCtx.font = cell * 0.28 + "px sans-serif";
            this.gridCtx.textAlign = "center";
            this.gridCtx.textBaseline = "middle";
            this.gridCtx.fillText(ACTIONS[a].glyph, px + cell / 2, py + cell / 2);
          }
        }
      }

      this.drawPath(cell);
      this.drawMarker(this.env.goal, "#148a4a", "G", cell, 0.33);
      this.drawMarker(this.env.start, "#246bfe", "S", cell, 0.28);
      this.drawMarker(this.env.agent, "#c83232", "A", cell, 0.22);
    }

    drawPath(cell) {
      if (this.greedyPath.length === 0) return;
      const points = [this.env.start].concat(this.greedyPath);
      this.gridCtx.save();
      this.gridCtx.lineWidth = Math.max(4, cell * 0.08);
      this.gridCtx.lineCap = "round";
      this.gridCtx.lineJoin = "round";
      this.gridCtx.strokeStyle = "rgba(196, 122, 0, 0.82)";
      this.gridCtx.beginPath();
      points.forEach((point, index) => {
        const x = (point.x + 0.5) * cell;
        const y = (point.y + 0.5) * cell;
        if (index === 0) this.gridCtx.moveTo(x, y);
        else this.gridCtx.lineTo(x, y);
      });
      this.gridCtx.stroke();
      this.gridCtx.restore();
    }

    drawMarker(pos, color, label, cell, radius) {
      const cx = (pos.x + 0.5) * cell;
      const cy = (pos.y + 0.5) * cell;
      this.gridCtx.save();
      this.gridCtx.shadowColor = "rgba(15, 23, 42, 0.28)";
      this.gridCtx.shadowBlur = 8;
      this.gridCtx.shadowOffsetY = 2;
      this.gridCtx.fillStyle = color;
      this.gridCtx.beginPath();
      this.gridCtx.arc(cx, cy, cell * radius, 0, Math.PI * 2);
      this.gridCtx.fill();
      this.gridCtx.restore();
      this.gridCtx.strokeStyle = "#fff";
      this.gridCtx.lineWidth = Math.max(2, cell * 0.035);
      this.gridCtx.beginPath();
      this.gridCtx.arc(cx, cy, cell * radius, 0, Math.PI * 2);
      this.gridCtx.stroke();
      this.gridCtx.fillStyle = "#fff";
      this.gridCtx.font = "700 " + cell * 0.22 + "px sans-serif";
      this.gridCtx.textAlign = "center";
      this.gridCtx.textBaseline = "middle";
      this.gridCtx.fillText(label, cx, cy);
    }

    drawChart() {
      const w = this.chartCanvas.width;
      const h = this.chartCanvas.height;
      this.chartCtx.clearRect(0, 0, w, h);
      this.chartCtx.fillStyle = "#fff";
      this.chartCtx.fillRect(0, 0, w, h);
      this.chartCtx.strokeStyle = "#dbe3ee";
      this.chartCtx.beginPath();
      this.chartCtx.moveTo(36, 10);
      this.chartCtx.lineTo(36, h - 24);
      this.chartCtx.lineTo(w - 10, h - 24);
      this.chartCtx.stroke();

      if (this.mode === "compare") {
        const allValues = ALGORITHMS.flatMap((algo) => this.compareReturns[algo.key]);
        const lo = Math.min(...allValues, -1);
        const hi = Math.max(...allValues, 1);
        const maxEpisodes = Math.max(2, ...ALGORITHMS.map((algo) => this.compareReturns[algo.key].length));
        ALGORITHMS.forEach((algo) => this.drawSeries(this.compareReturns[algo.key], algo.color, lo, hi, maxEpisodes));
      } else {
        this.drawSeries(this.returns, "#246bfe");
      }
    }

    drawSeries(series, color, sharedLo = null, sharedHi = null, sharedMaxEpisodes = null) {
      if (!series || series.length < 2) return;
      const w = this.chartCanvas.width;
      const h = this.chartCanvas.height;
      const data = series;
      const lo = sharedLo ?? Math.min(...data, -1);
      const hi = sharedHi ?? Math.max(...data, 1);
      const maxEpisodes = sharedMaxEpisodes ?? Math.max(2, data.length);
      this.chartCtx.strokeStyle = color;
      this.chartCtx.lineWidth = 2;
      this.chartCtx.beginPath();
      data.forEach((value, i) => {
        const x = 36 + (i / Math.max(1, maxEpisodes - 1)) * (w - 50);
        const y = 10 + ((hi - value) / (hi - lo || 1)) * (h - 34);
        if (i === 0) this.chartCtx.moveTo(x, y);
        else this.chartCtx.lineTo(x, y);
      });
      this.chartCtx.stroke();
    }

    canvasCell(event) {
      const rect = this.gridCanvas.getBoundingClientRect();
      const x = Math.floor(((event.clientX - rect.left) / rect.width) * this.env.width);
      const y = Math.floor(((event.clientY - rect.top) / rect.height) * this.env.height);
      return {
        x: Math.max(0, Math.min(this.env.width - 1, x)),
        y: Math.max(0, Math.min(this.env.height - 1, y)),
      };
    }

    worldSignature() {
      return [
        this.env.stateKey(this.env.start),
        this.env.goalKey(),
        Array.from(this.env.walls).sort().join(";"),
      ].join("|");
    }

    sameCell(a, b) {
      return a && b && a.x === b.x && a.y === b.y;
    }

    applyMode(mode, x, y) {
      if (mode === "wall") this.env.setWall(x, y);
      if (mode === "start") this.env.setStart(x, y);
      if (mode === "goal") this.env.setGoal(x, y);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".rl-workbench").forEach((root) => {
      new Workbench(root);
    });
  });
})();
