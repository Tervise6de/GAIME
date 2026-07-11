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
- **Current implementation:** `game/` — winnable/losable "First Season"
  scenario + onboarding + economy + escalation; `game/dist/HIVEMIND.html`
  single-file distributable; two frozen prototypes; `tools/` verification
  harness (headless runner, bot matrix, UI click tests, single-file
  builder, gameplay recorder, `win_sweep.mjs` cross-seed winnability).
  Bots: hand-tuned `commander` (seed-7 baseline) + generic map-driven
  `gcommander` (plays any generated territory).
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth exists; human feel is the top unknown.
- **Last known good commit:** HEAD of main at end of overnight-1 (Loop 3;
  40/40 generated maps pass fairness checks; seed-7 commander regression
  WON t=175; dist verified from file://).
- **Current build status:** GREEN — verified this session (2026-07-11,
  fok54l): seed-7 commander WON 1200/1200 @175s (4 slain), idle lost; gcommander
  seed-7 unchanged at 1062; full 16-seed sweep re-run clean (14/16); single-file
  HIVEMIND.html rebuilt (48.0KB); UI click test exit 0. See CLAUDE.md for the
  one-line re-verification command.
- **Highest-value next action:** human play (still the top unknown), then
  difficulty normalization on the generator (win-times and death spread are
  wide) and closing the one residual guard-mass stall (seed 2164). Winnability
  is MEASURED, not assumed — see below.
- **Winnability (UPDATED 2026-07-11, session fok54l):** `gcommander` gained a
  staged, safe-routed guard assault and now wins **14/16 generated seeds
  (88%)**, up from 9/16 (56%), with ZERO regressions. Five former losses
  converted; the guarded rich pile is now engaged on 13/16. Two residuals,
  both understood: seed 2164 (real geometry stall, rich untouched) and seed
  1291 (map fully harvested, missed quota by 22 net on overhead — effectively
  winnable). STRONG-PROXY LOWER BOUND by a generic bot, not a human claim.
  Full data: `data/winnability_sweep_20260711_guardassault.md` (before:
  `data/winnability_sweep_20260711.md`).
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
