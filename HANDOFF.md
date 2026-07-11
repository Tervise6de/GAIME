# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (post Loop 4). MORNING_ASSESSMENT
  report exists from overnight-1; refresh it on the final morning run.
- **Branch note:** overnight-2 developed on `claude/ecstatic-ride-2ijakk`
  (task-scoped requirement), NOT `main`. The heartbeat/lock lives on main;
  this branch's work must be merged to main to become the studio's memory.
- **Active hypothesis:** humans can learn and enjoy the painting verb
  (scripted play proves depth; human feel is THE open question).
- **What changed (overnight-2, Loop 4):**
  - The commander bot was hardcoded to seed-7 lanes → could not play
    generated maps (seed 23 gathered 0 food). Split it: `commanderTuned`
    (hand-authored seed-7 solution, WINS t=175 unchanged — the anchor) and
    `commanderGeneral` (Dijkstra-derived roads via a min-heap; two WAR
    fronts — defend nest + clear rich guard; kill by concentration).
  - Fixed a first-tick crash (off-grid hunter coord → empty truthy path →
    war-march fallback never fired). Clamp target cell + guard empty case.
  - Added a difficulty-normalization gate to the generator: reject layouts
    whose guard sits >1010px from the nest (objective must be projectable).
    Validated false-positive-free on 30 seeds; fairness still 40/40.
  - New headless oracles: `tools/sweep_seeds.mjs` (serial) and
    `tools/sweep_parallel.mjs` + `tools/sweep_worker.mjs` (all-core). They
    run the FULL game loop in Node — no browser — for fast winnability sweeps.
- **What changed (Loop 5):** render-only juice pass — nest hearth flares as
  food banks; expanding ring + embers where each hunter falls. Driven by sim
  counters (foodBanked / spider.alive deltas), so balance is untouched.
- **Current build status:** GREEN. Full-game sweep: commander WINS seed 7
  (t=175, died 679) + ~75% of generated seeds (23/30 tuning set, 45/60
  out-of-sample 2000-2059, avg win-time ~315s). Negative control HOLDS on
  generated maps: idle & naive LOSE (naive marches into the guard, colony
  collapses). gen_check 40/40. Single-file build + UI click test clean; juice
  verified error-free in realtime + headless.
- **Known blockers:** none technical. Human playtesting still impossible from
  this environment. ~23% of generated maps remain NOT bot-winnable (a real
  balance/AI tail — see RISKS + BACKLOG Now #1).
- **Next three actions (highest value first):**
  1. Close the winnability tail. Residual losers are death-bleed near-misses
     (fully harvest, <60 food short) + mid-hunter pincers. Try FIRST: is the
     generated economy ~50 food tighter than seed 7? Nudge quota/pile-rate a
     touch and RE-CHECK idle/naive still lose. Only then try a soldier-budget-
     aware pincer bot (naive extra-fronts collapsed seed 1007 — don't repeat).
     Measure with `node tools/sweep_parallel.mjs auto=commander count=30`.
  2. Brood throttle verb (paint the nest: grow vs bank) — removes the
     automatic-growth limitation from Loop 1.
  3. Juice pass: delivery pulse, spider death burst, procedural WebAudio
     (licence-clean) + re-capture GIF.
- **Exact build/run/verify commands:** see CLAUDE.md "Build & test commands".
  Quick anchor check after any sim/bot change:
  `node tools/sweep_parallel.mjs auto=commander count=8 start=1000` →
  seed 7 must WIN t≈175; most generated seeds WIN; then confirm
  `auto=idle`/`auto=naive` LOSE.
