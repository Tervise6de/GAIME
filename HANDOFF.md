# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** MORNING_ASSESSMENT complete (final morning run,
  2026-07-11). Prior: WINNER_DEVELOPMENT loops 1-3. Next real work is
  VERTICAL_SLICE maturation, gated on human playtests.
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth exists; human feel is THE open unknown.
- **What changed (morning-run-20260711):** re-verified the whole build from
  a clean checkout (all green — see PLAYTEST_LOG 2026-07-11); fixed a
  harness bug in tools/click_test_hivemind.mjs (it never actually painted
  because the title-dismiss click ate its only mousedown — game unaffected);
  added two fresh verified stills (media/shot_verified_action.png = the
  mid-season core hook, media/shot_verified_win.png = win end-card);
  stamped MORNING_REPORT.md with the re-verification note. No build or
  launch failures found; nothing about the game itself changed.
- **Current build status:** GREEN. commander bot WINS seed 7 (1200/1200,
  season 175s), idle LOSES; single-file `game/dist/HIVEMIND.html` rebuilds
  byte-identical; 40/40 generated maps fair; both prototypes run; 56–60fps
  at 3,200 agents.
- **Last known good commit:** the final commit of morning-run-20260711 on
  branch `claude/gaime-steam-autonomous-studio-ar65z4` (this run's HEAD;
  every commit was verified before push).
- **Known blockers:** none technical. Human playtesting is impossible from
  this environment — founder action or a future integration is required.
- **Next three actions (highest value first):**
  1. Founder-gated: 5–10 human playtests of `game/dist/HIVEMIND.html`.
     Measure: complete the season within 3 attempts; all three verbs used
     unprompted; voluntary restart. Kill-signal: "ants won't obey" after
     onboarding.
  2. Generalize the commander bot to BFS-derived paths so generated maps
     can be proven bot-WINNABLE across ≥20 seeds; normalize difficulty
     (fairness is guaranteed, balance is not).
  3. Brood-throttle verb (paint the nest: feed vs bank ratio) to remove the
     automatic-growth limitation from Loop 1 economics.
- **Exact build and run commands:** see CLAUDE.md "Build & test commands".
  Quick re-verify after any sim change (server must be up on :8123):
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=12" --max 200; done`
  → commander must WIN, idle must lose. Then `node tools/build_single.mjs`
  and `node tools/gen_check.mjs` (expect 40/40).
