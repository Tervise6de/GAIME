# PROJECT_STATE

Canonical current state. Update before ending every session. Keep it a
snapshot — detail belongs in the logs and in git history.

- **Current stage:** WINNER_DEVELOPMENT (loops 1-4 done: goal structure,
  onboarding, generated territories with fairness guarantees, cross-seed
  winnability proof). Stages 1-5 complete. MORNING_REPORT.md refreshed
  2026-07-11 with the winnability evidence.
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
- **Last known good commit:** `f3f2b76` on branch
  `claude/ecstatic-ride-9oqbd4` (Stage 6 Loop 4: general bot wins 22/24
  generated seeds; seed-7 commander regression WON t=175 verified from
  file:// dist; idle loses). Prior good commit: end of overnight-1 on main.
- **Current build status:** GREEN — verified headless: commander WINS seed 7
  (t=175, file:// single-file dist), general wins 22/24 generated seeds
  (2-25), idle loses. See CLAUDE.md for re-verification commands.
- **Highest-value next action:** difficulty NORMALIZATION — gate map
  generation on a bot-winnability check so the 2 unwon seeds (12, 18) can't
  ship; then brood-throttle verb. (Cross-seed winnability itself is now
  MEASURED, not assumed.)
- **Blockers:** human playtesting cannot be done from this environment
  (founder action needed — see BACKLOG "Now" #5).
- **Morning report ready:** true (refreshed 2026-07-11 with Loop 4
  winnability evidence).
- **Branch note:** this session (morning-20260711) developed on
  `claude/ecstatic-ride-9oqbd4` per harness policy, NOT main. Loop 4 lives
  there; merge/rebase onto main when integrating.

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
