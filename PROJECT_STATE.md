# PROJECT_STATE

Canonical current state. Update before ending every session. Keep it a
snapshot — detail belongs in the logs and in git history.

- **Current stage:** WINNER_DEVELOPMENT (loops 1-5 done: goal structure,
  onboarding, generated territories, winnability certification, juice).
  Stages 1-5 complete. MORNING_REPORT.md refreshed this session.
- **Current concept:** C01 HIVEMIND — paint scent fields (LURE/FEAR/RALLY);
  thousands of autonomous ants respond; persuasion, never orders.
- **Fallback concept:** C02 STORMWARDEN (runnable at
  prototypes/stormwarden/; skill-gradient assumption VERIFIED on held-out
  seeds — see PLAYTEST_LOG).
- **Current implementation:** `game/` — winnable/losable "First Season"
  scenario + onboarding + economy + escalation + delivery/death juice;
  `game/js/seeds.js` sim-certified New-Territory pool (56 seeds);
  `game/dist/HIVEMIND.html` single-file distributable; two frozen
  prototypes; `tools/` verification harness (headless runner, bot matrix,
  UI click tests, single-file builder, gameplay recorder, `win_sweep.mjs`
  cross-seed winnability sweep).
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth AND winnability exist; human feel is the
  top remaining unknown (externally blocked).
- **Last known good commit:** HEAD of `claude/ecstatic-ride-acanj0`
  (Loop 5). Verified this session: commander oracle wins 56/60 seeds (1-60);
  seed-7 regression WON t=305 (generalized bot, not hand-tuned); juice is
  balance-neutral (seed-7 win identical pre/post); dist verified from
  file://; click test green.
- **Current build status:** GREEN — verified headless; see CLAUDE.md for the
  one-line re-verification command and `tools/win_sweep.mjs` for balance.
- **Highest-value next action:** difficulty normalization across the
  certified pool (oracle win-times span 148-466s); then the brood-throttle
  verb (grow-vs-bank) — but re-run `win_sweep.mjs` and re-certify seeds.js
  after ANY generator/bot/economy change. If in the final morning run:
  execute the Stage 7 checklist instead.
- **Blockers:** human playtesting cannot be done from this environment
  (founder action needed — see BACKLOG "Now").
- **Morning report ready:** true (refreshed this session with winnability
  evidence; the final morning run should re-verify + capture live media).

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
