# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (post Loop 3). The final
  MORNING_ASSESSMENT (Stage 7) was executed and re-verified on 2026-07-11.
- **Active hypothesis:** humans can learn and enjoy the painting verb
  (scripted play proves depth exists; human feel is THE open question).
- **What this morning run did (2026-07-11):** re-restored deps, rebuilt the
  build from checkout, re-ran the headless verification live. Confirmed
  GREEN: seed-7 bot matrix reproduced with five distinct outcomes
  (commander WON 1200/1200 @175s; smart 949; warband 0; naive collapse;
  idle 0). Confirmed the single-file `game/dist/HIVEMIND.html` reaches the
  identical win card. Stamped MORNING_REPORT.md with a live re-verification
  block + observed matrix; refreshed PROJECT_STATE. No code changed — the
  overnight-1 build needed no repair.
- **Current build status:** GREEN (re-verified this morning, not just
  asserted). Both prototypes still present under `prototypes/`.
- **Last known good commit:** tip of branch
  `claude/gaime-steam-autonomous-studio-6op37p` (this run's final commit).
  Every commit was verified before push.
- **Known blockers:** none technical. Human playtesting is impossible from
  this environment — founder action or a future integration is required.
  This is the single most important open validation.
- **Next three actions (highest value first):**
  1. Human playtests of `game/dist/HIVEMIND.html` (zero-install) — retire
     the only unretired core risk: does the painting verb feel good?
  2. Generalize commander bot to BFS-derived paths; verify generated maps
     are bot-WINNABLE across ≥20 seeds and normalize difficulty (fairness
     guarantees shipped; balance guarantees are the gap).
  3. Brood throttle verb (paint the nest: feed vs bank) — remove the
     automatic-growth limitation found in Loop 1 economics.
- **Exact build and run commands:** see CLAUDE.md "Build & test commands".
  Quick verify after any sim change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=20" --max 260; done`
  → commander must WIN, idle must lose.
