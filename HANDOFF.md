# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (post Loop 4). Stages 1-5 complete.
  MORNING_ASSESSMENT report is CURRENT (refreshed 2026-07-11 with the
  winnability evidence).
- **Active hypothesis:** humans can learn and enjoy the painting verb.
  Scripted play now proves depth exists AND that generated maps are winnable
  by principled play; human feel remains THE open question.
- **⚠ Branch:** this session (morning-20260711) worked on
  `claude/ecstatic-ride-9oqbd4`, NOT main, per harness policy. Loop 4 lives
  on that branch. `main` is at `2e9f4ce` (end of overnight-1). Integrate by
  merging/rebasing the branch onto main.
- **What changed (Loop 4):** added a map-derived `general` bot
  (game/js/auto.js) — `planField()` runs a per-cycle Dijkstra from the nest
  that penalizes cells inside live hunter territories (LURE roads bend
  around hunters), plus FEAR walls over non-threat hunters so the ants'
  spider-blind RETURN trip also routes safely. New harness
  `tools/sweep_winnable.mjs`. Docs (PLAYTEST/DECISION/STATE/BACKLOG/report)
  updated. Single-file dist rebuilt.
- **Current build status:** GREEN. Verified headless this session:
  * seed-7 `commander` WINS (t≈175) — checked from the file:// single-file
    dist (food 1200, died 679).
  * `general` wins 42/48 generated seeds (2-49) = 87.5%; 6 losses (12, 18,
    27, 31, 46, 48) — 5 are winter-clock time-outs on a far/blocked pile,
    seed 31 is a hard opening failure (274/1200).
  * `idle` loses seed 7 (food 0) — goal still discriminates competence.
- **Last known good commit:** `f3f2b76` on `claude/ecstatic-ride-9oqbd4`.
- **Known blockers:** none technical. Human playtesting impossible from this
  environment — founder action or future integration needed.
- **Next three actions (highest value first):**
  1. Difficulty NORMALIZATION: gate `makeWorld` generation so no unwinnable
     seed ships (6/48 currently unwon). Root cause (BACKLOG Now #1): a
     lesser pile placed very far (>~900px) whose route is also spider-
     blocked → winter clock runs out. Cheapest lever: cap max pile→nest
     path length + require a lesser-pile route with clearance, then RE-SWEEP
     (changing accept criteria remaps seeds). Investigate seed 31 (274/1200)
     separately — a distinct opening-stall failure.
  2. Brood throttle verb (paint the nest: feed vs bank) — removes the
     automatic-growth limitation found in Loop 1 economics.
  3. Juice pass: delivery pulse at nest, spider death burst, procedural
     WebAudio (all licence-clean) + re-capture GIF.
- **Exact build/run/verify commands:** see CLAUDE.md "Build & test commands".
  Quick regression after any sim/bot change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=12" --max 200; done`
  (commander WIN, idle lose). Cross-seed winnability:
  `node tools/sweep_winnable.mjs --seeds 2-25 --fast 16`
  (NB: `npm install` first to restore Playwright — it is not committed).
