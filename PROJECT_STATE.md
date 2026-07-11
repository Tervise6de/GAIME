# PROJECT_STATE

Canonical current state. Update before ending every session. Keep it a
snapshot — detail belongs in the logs and in git history.

- **Current stage:** WINNER_DEVELOPMENT (loops 1-4 done: goal structure,
  onboarding, generated territories with fairness guarantees, cross-seed
  bot-winnability). Stages 1-5 complete. MORNING_REPORT.md is current (Loop 4
  strengthened the winnability evidence; refresh report on the final run).
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
- **Last known good commit:** HEAD of branch `claude/ecstatic-ride-2ijakk`
  after Loop 4 (map-general commander; 23/30 generated seeds bot-WON;
  seed-7 commander regression WON t=175 unchanged; 40/40 fairness intact;
  idle/naive lose on generated maps; single-file build + gen_check green).
  NOTE: overnight-2 developed on branch `claude/ecstatic-ride-2ijakk`
  (task-scoped), not `main` — merge to main when integrating.
- **Current build status:** GREEN — headless full-game sweep + gen_check +
  UI click test all pass; seed-7 anchor byte-identical.
- **Highest-value next action:** close the generated-map winnability tail
  (77% → higher) via economy nudge or a soldier-budget-aware pincer bot
  (BACKLOG Now #1); if in the final morning run: execute the Stage 7/8
  MORNING_ASSESSMENT checklist instead.
- **Blockers:** human playtesting cannot be done from this environment
  (founder action needed — see BACKLOG "Now" #5).
- **Morning report ready:** true (written end of overnight-1; refresh if
  later sessions change the build).

## Stages

SETUP_COMPLETE precedes stage 1. Definitions are in
`AUTONOMOUS_STUDIO_PROTOCOL.md`; VERTICAL_SLICE is the maturation of
WINNER_DEVELOPMENT (Protocol Stage 6).

1. RESEARCH ✓
2. CONCEPTS ✓
3. TWO_FINALISTS ✓
4. DUAL_PROTOTYPES ✓
5. PROTOTYPE_COMPARISON ✓
6. WINNER_DEVELOPMENT ← current (loops 1-4 done)
7. VERTICAL_SLICE
8. MORNING_ASSESSMENT (report current; final morning run pending)
