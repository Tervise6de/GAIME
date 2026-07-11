# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6, post Loop 3). Stage 7
  MORNING_ASSESSMENT deliverables are DONE and re-verified as of the
  2026-07-11 morning run.
- **Active hypothesis:** humans can learn and enjoy the painting verb
  (scripted play proves depth exists; human feel is THE open question).
- **What this session did (morning-run-20260711):** the final morning run.
  Re-ran the full verification against a fresh checkout — served game and the
  single-file `game/dist/HIVEMIND.html` both WIN seed 7 (commander doctrine,
  stockpile full); `idle` and `naive` lose in distinct ways; 60fps,
  ~0.5 ms/tick; both prototypes serve (HTTP 200); rebuilt the single-file
  (byte-identical to committed); confirmed all five PNGs + GIF89a + WebM are
  intact and the core-hook shot renders correctly. Stamped MORNING_REPORT.md
  and PROJECT_STATE.md with the re-verification. No code changes were made —
  a GREEN build was deliberately left untouched before founder review.
- **Current build status:** GREEN (re-verified this morning).
- **Last known good commit:** this session's HEAD (see `git log`; every
  commit states what was verified). The prior known-good was end-of-overnight-1.
- **Known blockers:** none technical. Human playtesting is impossible from
  this environment — it is the single gating experiment and needs founder
  action or a future integration.
- **Next three actions (highest value first), for a post-morning session:**
  1. Run 5-10 human playtests of `game/dist/HIVEMIND.html` (zero install).
     Measure: season completed within 3 attempts; all three verbs used
     unprompted; voluntary restart. Kill-signal: majority quit citing "ants
     won't obey" after onboarding.
  2. Generalize commander bot to BFS-derived paths; verify generated maps are
     bot-WINNABLE across >=20 seeds and normalize difficulty (fairness
     guarantees shipped; balance guarantees are the gap).
  3. Brood-throttle verb (paint the nest: feed vs bank ratio) to remove the
     automatic-growth limitation found in Loop 1 economics; then art-direction
     spike (current look is programmer-glow — striking in motion, thin in stills).
- **Exact build and run commands:** see CLAUDE.md "Build & test commands".
  Quick verify after any sim change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=12" --max 200; done`
  -> commander must WIN, idle must lose.
