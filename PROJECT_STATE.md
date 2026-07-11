# PROJECT_STATE

Canonical current state. Update before ending every session. Keep it a
snapshot — detail belongs in the logs and in git history.

- **Current stage:** WINNER_DEVELOPMENT (loops 1-3 done: goal structure,
  onboarding, generated territories with fairness guarantees). Stages 1-5 complete. MORNING_REPORT.md is current.
- **Current concept:** C01 HIVEMIND — paint scent fields (LURE/FEAR/RALLY);
  thousands of autonomous ants respond; persuasion, never orders.
- **Fallback concept:** C02 STORMWARDEN (runnable at
  prototypes/stormwarden/; skill-gradient assumption VERIFIED on held-out
  seeds — see PLAYTEST_LOG).
- **Current implementation:** `game/` — TWO scenarios over the same systems:
  "The First Season" (gather race, default) and "The Long Drought"
  (endurance inversion: evaporating piles, per-ant upkeep, reserve at the
  rains; `?scn=drought` or [S] on the title) + onboarding (scenario-aware
  hint tracks) + economy + escalation + brood-throttle verb (FEAR on nest =
  hold brood/bank; holding PAUSES the growth clock — no catch-up burst on
  release); `game/dist/HIVEMIND.html` single-file distributable; two frozen
  prototypes; `tools/` verification harness (headless runner, bot matrix,
  UI click tests with real assertions, single-file builder, gameplay
  recorder, `win_sweep.mjs --scn=`, `difficulty_probe.mjs`, GIF pipeline
  `make_gif.mjs`/`make_gif.py`, `art_closeup.mjs`). Bots: hand-tuned
  `commander` (seed-7 First Season baseline) + generic map-driven
  `gcommander` (shepherd assault, brood banking, drought doctrine with
  pop-cap hysteresis; wins all 16 reference territories in BOTH scenarios).
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth exists; human feel is the top unknown.
- **Last known good commit:** HEAD of main at end of overnight-1 (Loop 3;
  40/40 generated maps pass fairness checks; seed-7 commander regression
  WON t=175; dist verified from file://).
- **Current build status:** GREEN — re-verified 2026-07-11 late pm after
  the drought/art session: commander seed-7 First Season byte-identical
  (WON 1200 @175s, 679 died) across the growth-clock sim change; First
  Season sweep 16/16 re-verified; drought sweep 16/16; click test PASS
  (incl. new drought leg); dist (73.0KB) rebuilt and reproduces the drought
  win deterministically. See CLAUDE.md for commands.
- **Highest-value next action:** human playtests (founder-blocked) — the
  build now offers TWO scenarios for them. From the studio side next:
  fauna variety (start-of-session task — it invalidates balance baselines),
  difficulty-band review, palette identity. DONE today: The Long Drought
  (built+validated), growth-clock sim fix, GIF refresh, pile/spider art,
  drought heat-haze identity.
- **Winnability (UPDATED 2026-07-11 late pm):** `gcommander` wins **16/16**
  generated seeds in BOTH scenarios (First Season: stores full quota, win
  times 161-307s; Drought: stores 340-944 vs reserve 200 at t=420) and
  seed 7 in both. In the drought, ALL non-throttle strategies starve —
  including `commander`, the First Season champion (t=221, 2462 ants):
  the goal structures demand opposite play. STRONG-PROXY LOWER BOUND —
  says nothing about human players. Static difficulty normalization
  remains REJECTED on measurement (DECISION_LOG). Data:
  `data/winnability_sweep_20260711.md`, `data/drought_sweep_20260711.md`.
- **Blockers:** human playtesting cannot be done from this environment
  (founder action needed — see BACKLOG "Now" #5).
- **Morning report ready:** true — re-verified and stamped on the final
  morning run (2026-07-11); MORNING_REPORT.md opens with a live
  re-verification block and the observed seed-7 bot matrix.

## Stages

SETUP_COMPLETE precedes stage 1. Definitions are in
`AUTONOMOUS_STUDIO_PROTOCOL.md`; VERTICAL_SLICE is the maturation of
WINNER_DEVELOPMENT (Protocol Stage 6).

1. RESEARCH ✓
2. CONCEPTS ✓
3. TWO_FINALISTS ✓
4. DUAL_PROTOTYPES ✓
5. PROTOTYPE_COMPARISON ✓
6. WINNER_DEVELOPMENT ← current
7. VERTICAL_SLICE
8. MORNING_ASSESSMENT (report current; final morning run pending)
