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
  builder, gameplay recorder).
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth exists; human feel is the top unknown.
- **Last known good commit:** HEAD of main at end of overnight-1 (Loop 3;
  40/40 generated maps pass fairness checks; seed-7 commander regression
  WON t=175; dist verified from file://).
- **Current build status:** GREEN — re-verified from a clean checkout on
  the final morning run (2026-07-11): commander WINS seed 7 (1200/1200,
  175s), idle LOSES, single-file build byte-identical, 40/40 maps fair,
  56–60fps at 3,200 agents, rendering confirmed by screenshot. One harness
  bug fixed (UI click test now actually paints). See CLAUDE.md for the
  one-line re-verification command.
- **Highest-value next action:** (human-gated) 5–10 human playtests of
  `game/dist/HIVEMIND.html`; then generalized commander bot + cross-seed
  winnability/difficulty sweep, and the brood-throttle verb.
- **Blockers:** human playtesting cannot be done from this environment
  (founder action needed — see BACKLOG "Now" #5).
- **Morning report ready:** true — MORNING_REPORT.md carries a 2026-07-11
  final-run re-verification stamp; recommendation CONTINUE WITH CONDITIONS.

## Stages

SETUP_COMPLETE precedes stage 1. Definitions are in
`AUTONOMOUS_STUDIO_PROTOCOL.md`; VERTICAL_SLICE is the maturation of
WINNER_DEVELOPMENT (Protocol Stage 6).

1. RESEARCH ✓
2. CONCEPTS ✓
3. TWO_FINALISTS ✓
4. DUAL_PROTOTYPES ✓
5. PROTOTYPE_COMPARISON ✓
6. WINNER_DEVELOPMENT ✓ (loops 1-3)
7. VERTICAL_SLICE (maturation of stage 6 — ongoing when development resumes)
8. MORNING_ASSESSMENT ✓ — final morning run executed 2026-07-11; build
   re-verified GREEN, media refreshed, report finalized (CONTINUE WITH
   CONDITIONS)
