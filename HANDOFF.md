# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6), loops 1-4 complete.
- **Branch:** work is on `claude/ecstatic-ride-h0dy5s` (NOT yet merged to
  main). Every commit was verified before push.
- **Active hypothesis:** humans can learn and enjoy the painting verb.
  Winnability by *skilled* play is now VERIFIED (bot oracle); human feel and
  pacing remain THE open question (untestable from this environment).
- **What changed this session (Loop 4):** the commander bot was generalized
  from hardcoded seed-7 waypoints to a map-agnostic hunter-avoiding Dijkstra
  pathfinder (LURE harvest roads + a hybrid LURE-approach / WAR-conversion
  assault that drives soldiers into the guard's den). RESULT: commander WINS
  24/24 generated seeds (1000..3231, step 97) + seed 7; naive/idle LOSE on
  all tested seeds (discrimination intact). New tools: `tools/bot_sweep.mjs`
  (cross-seed winnability/difficulty sweep), `tools/gen_stats.mjs` (static
  geometry features). Finding: difficulty is EMERGENT — no cheap geometry
  feature predicts win-time (see PLAYTEST_LOG / DECISION_LOG 2026-07-11).
- **Current build status:** GREEN. Re-verify:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=12" --max 150; done`
  → commander WINS, idle loses. Full sweep: `node tools/bot_sweep.mjs 24 commander 30`.
  (Run `npm install` first — Playwright is a dev dep; the harness needs it.)
- **Known blockers:** none technical. Human playtesting impossible here.
- **Next three actions (highest value first):**
  1. Difficulty band via offline oracle: bake a commander-vetted seed pool
     into the [N] "new territory" flow (static geometry does NOT predict
     difficulty), and give the hard tail more margin (seed 2067 wins with
     only ~7s to spare). Low risk — no sim change.
  2. Brood-throttle verb (paint the nest: feed vs bank) — the last big
     gameplay lever; growth is currently automatic. Higher game value but
     touches the sim: checkpoint first and re-run the full bot matrix after,
     since the commander does not know about the new verb.
  3. Juice pass (nest delivery pulse, spider death burst, procedural
     WebAudio) + re-capture media (current media predates Loop 4).
- **Exact build/run commands:** see CLAUDE.md "Build & test commands".
