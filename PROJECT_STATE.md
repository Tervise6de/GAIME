# PROJECT_STATE

Canonical current state. Update before ending every session. Keep it a
snapshot — detail belongs in the logs and in git history.

- **Current stage:** WINNER_DEVELOPMENT (loops 1-4 done: goal structure,
  onboarding, generated territories with fairness guarantees, generalized
  commander oracle proving winnability). Stages 1-5 complete. MORNING_REPORT.md
  refreshed for Loop 4 (2026-07-11); a final morning run should still play the
  build and re-capture any media it wants before finalizing.
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
- **Last known good commit:** HEAD of branch claude/ecstatic-ride-h0dy5s
  (Loop 4f, commit e2a23be+: commander wins ~84% of generated seeds + seed 7;
  dist plays to a win from file://; final verification green). Every commit
  verified before push. NOTE: Loop-4 work lives on this feature branch, not
  yet merged to main.
- **Current build status:** GREEN. Commander oracle wins ~84.5% of generated
  seeds (71/84 swept, 1000..9051 step 97) and seed 7; naive/idle lose on all
  tested seeds. "New territory" [N] serves only the 62 oracle-comfortable
  seeds (win-time ≤430s), so players never get a map the oracle itself can't
  beat. NOTE: the first-24 "100%" was a fortunate sample — see PLAYTEST_LOG
  correction 2026-07-11. Cross-seed sweep via `node tools/bot_sweep.mjs`.
- **Highest-value next action:** brood-throttle verb (player control over the
  growth economy — the dominant outcome lever, currently automatic). NOTE the
  guard-assault win rate (84.5%) resisted two fix attempts this session — both
  reverted because a stronger assault costs more colony than it gains; a real
  fix needs a soldier caste that promotes at the nest (see PLAYTEST_LOG). If in
  the final morning run: execute the Stage 7 checklist in
  AUTONOMOUS_STUDIO_PROTOCOL.md instead.
- **Blockers:** human playtesting cannot be done from this environment
  (founder action needed — see BACKLOG "Now" #4).
- **Morning report ready:** true — refreshed 2026-07-11 for Loop 4 (reflects
  map-generalization, 84.5% winnability, curated pool, juice/audio). A final
  morning run should still play the build and re-capture media if desired.

## Stages

SETUP_COMPLETE precedes stage 1. Definitions are in
`AUTONOMOUS_STUDIO_PROTOCOL.md`; VERTICAL_SLICE is the maturation of
WINNER_DEVELOPMENT (Protocol Stage 6).

1. RESEARCH ✓
2. CONCEPTS ✓
3. TWO_FINALISTS ✓
4. DUAL_PROTOTYPES ✓
5. PROTOTYPE_COMPARISON ✓
6. WINNER_DEVELOPMENT ← current (loops 1-4 complete)
7. VERTICAL_SLICE
8. MORNING_ASSESSMENT ✓ (final morning run executed 2026-07-11 ~09:00 UTC:
   build re-verified fresh, media re-captured from generated maps, report
   finalized — recommendation CONTINUE WITH CONDITIONS)
