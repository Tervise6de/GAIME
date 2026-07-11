# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Working branch:** `claude/ecstatic-ride-ecyivz` (this task develops and
  pushes here, NOT directly to main). Latest verified work is its HEAD.
- **Current stage:** WINNER_DEVELOPMENT (post Loop 4). MORNING_ASSESSMENT
  report from overnight-1 is still current for gameplay; refresh only if the
  morning run wants the new bot/winnability evidence in it.
- **Active hypothesis:** humans can learn and enjoy the painting verb
  (scripted play proves depth exists; human feel is THE open question).
- **What changed (overnight-2):** generalized the commander bot off its
  seed-7 hardcoded lanes to fully world-derived routing (Dijkstra hunter-aware
  cost field `safeField`, path extraction `routeDown`, route-blocker
  detection, bystander-avoiding assault march, FEAR walls). Added
  `tools/sweep_winnability.mjs` and ran a 24-seed cross-seed winnability sweep.
- **Key evidence (VERIFIED FACT, scripted bot):** seeds 100-123 → 21/24
  (87.5%) bot-winnable; idle 0/24; win-time median 314s (range 187-479s).
  Seed 7 regression preserved: commander WIN t=269.6 net 1202, idle LOSES.
  Single-file dist verified identical from file://. Artifact:
  `tools/sweep_results_seed100-123.json`.
- **Current build status:** GREEN. Gameplay balance unchanged from
  overnight-1; only the bot + tooling changed. `game/dist/HIVEMIND.html`
  rebuilt and verified.
- **Known blockers:** none technical. The 3 sweep losses (103/106/110) are
  tight-margin timeouts, not bot failures — a GENERATION-margin gap. Human
  playtesting still impossible from this environment.
- **Next three actions (highest value first):**
  1. Difficulty normalization on the GENERATION side (BACKLOG Now #1): gate
     generated layouts on a cheap winnable-margin heuristic OR use
     `sweep_winnability.mjs` as an offline acceptance test. VERIFY with a full
     re-sweep; must not regress seed 7 (do NOT add a bot-side harvest-first
     toggle — it was tried and reverted, see DECISION_LOG 2026-07-11).
  2. Brood throttle verb (paint the nest: grow vs bank).
  3. Juice pass (nest delivery pulse, spider death burst, procedural WebAudio)
     + re-capture GIF.
- **Exact build/run/verify commands:** see CLAUDE.md "Build & test commands".
  Quick bot check after any sim/bot change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=20" --max 55; done`
  → commander must WIN (t≈270), idle must LOSE. Full sweep:
  `node tools/sweep_winnability.mjs --start 100 --count 24 --fast 20 --cap 42`.
