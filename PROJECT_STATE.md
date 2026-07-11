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
- **Current build status:** GREEN — re-verified on the final morning run
  (2026-07-11): rebuilt-from-checkout, headless bot matrix reproduced on
  seed 7 (commander WON 1200/1200 @175s; smart 949, warband 0, naive
  collapse, idle 0 — five distinct outcomes); single-file HIVEMIND.html
  re-run reaches the identical win card. See CLAUDE.md for the one-line
  re-verification command.
- **Highest-value next action:** a guard-clearing bot (or human play) to
  raise the winnability lower bound above 56%, and a difficulty-normalization
  pass on the generator (win-times 272-390s and deaths 231-1294 are too
  spread). Winnability is now MEASURED, not assumed — see below.
- **Winnability (NEW, 2026-07-11):** generalized `gcommander` bot wins 9/16
  generated seeds (56%); 5 of 7 losses are the guarded rich pile never
  cleared (a fixable strategy gap, not structural unfairness). This is a
  STRONG-PROXY LOWER BOUND, not proof, and says nothing about human players.
  Full data: `data/winnability_sweep_20260711.md`.
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
