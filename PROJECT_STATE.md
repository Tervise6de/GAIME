# PROJECT_STATE

Canonical current state. Update before ending every session. Keep it a
snapshot — detail belongs in the logs and in git history.

- **Current stage:** WINNER_DEVELOPMENT (loops 1-4 done: goal structure,
  onboarding, generated territories with fairness guarantees, generalized
  commander bot + cross-seed winnability sweep). Stages 1-5 complete.
  MORNING_REPORT.md current as of overnight-1 (build unchanged in gameplay;
  bot + tooling improved — refresh report if the morning run wants it).
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
- **Last known good commit:** HEAD of branch claude/ecstatic-ride-ecyivz
  (overnight-2): generalized commander (world-derived routes) WINS seed 7
  t=269.6 net 1202; idle LOSES; cross-seed sweep seeds 100-123 = 21/24
  (87.5%) bot-winnable, idle 0/24; single-file dist verified identical from
  file://.
- **Current build status:** GREEN — verified headless at 60fps; gameplay
  balance unchanged from overnight-1; bot + sweep tooling added. See
  CLAUDE.md for re-verification commands.
- **Winnability evidence:** VERIFIED FACT (scripted bot) — 87.5% of fair
  generated maps are bot-winnable; the ~12% losses are timeouts (net
  1000-1180) with the "contested rich pile + tight lesser-pile margin"
  signature = a generation-margin gap, not a bot gap. STRONG PROXY only for
  human-winnable; not proof of fun.
- **Highest-value next action:** difficulty normalization on the GENERATION
  side (gate layouts on a cheap winnable-margin heuristic, or use the sweep
  as an offline acceptance test) — needs a full re-sweep budget to verify
  without regressing seed 7. If in the final morning run: execute the Stage 7
  checklist in AUTONOMOUS_STUDIO_PROTOCOL.md instead.
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
6. WINNER_DEVELOPMENT ← current (loops 1-4; winnability oracle in place)
7. VERTICAL_SLICE
8. MORNING_ASSESSMENT (report current; final morning run pending)
