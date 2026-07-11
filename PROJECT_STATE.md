# PROJECT_STATE

Canonical current state. Update before ending every session. Keep it a
snapshot — detail belongs in the logs and in git history.

- **Current stage:** WINNER_DEVELOPMENT (loops 1-5 done: goal structure,
  onboarding, generated territories, cross-seed winnability + curated seed
  whitelist, juice pass). Stages 1-5 complete. MORNING_REPORT.md predates
  loops 4-5 — refresh in the morning run.
- **Current concept:** C01 HIVEMIND — paint scent fields (LURE/FEAR/RALLY);
  thousands of autonomous ants respond; persuasion, never orders.
- **Fallback concept:** C02 STORMWARDEN (runnable at
  prototypes/stormwarden/; skill-gradient assumption VERIFIED on held-out
  seeds — see PLAYTEST_LOG).
- **Current implementation:** `game/` — winnable/losable "First Season"
  scenario + onboarding + economy + escalation + cosmetic juice layer
  (`game/js/fx.js`: delivery pulses, death bursts, procedural WebAudio);
  map-agnostic ceiling bot; curated seed whitelist (`game/js/seeds.js`) for
  the [N] key; `game/dist/HIVEMIND.html` single-file distributable; two
  frozen prototypes; `tools/` harness (headless runner, node-native sweep,
  whitelist builder, bot matrix, UI click tests, single-file builder,
  gameplay recorder).
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth exists AND that a competent player can win
  fairly-generated maps; human feel is the top unknown.
- **Key evidence (this session):** the ceiling bot (commander) wins 50/64
  generated seeds (78%); 22% are unwinnable even by perfect play and
  win-times span 143-470s — structural fairness does NOT imply balance, and
  no cheap geometric proxy predicts winnability (simulation is required).
  The [N] key therefore draws from a simulation-verified whitelist banded to
  ~210-360s. Seed 7 commander regression still WON t=175 (byte-identical).
- **Last known good commit:** current HEAD of claude/ecstatic-ride-vekd19
  (every commit this session verified before push). Full suite green: bot
  discrimination intact, both click tests pass, both prototypes run, dist
  runs from file://.
- **Current build status:** GREEN — verified headless; commander WINS seed 7
  (t=175) and all vetted whitelist seeds; idle/naive/warband/smart lose.
- **Highest-value next action:** brood-throttle verb (re-validate whitelist
  after) OR a second scenario; if in the final morning run: execute the
  Stage 7 checklist in AUTONOMOUS_STUDIO_PROTOCOL.md instead.
- **Blockers:** human playtesting cannot be done from this environment
  (founder action needed — see BACKLOG "Now" #5).
- **Morning report ready:** stale — MORNING_REPORT.md predates loops 4-5
  (winnability evidence + whitelist + juice). Refresh in the morning run.

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
