# PROJECT_STATE

Canonical current state. Update before ending every session. Keep it a
snapshot — detail belongs in the logs and in git history.

- **Current stage:** WINNER_DEVELOPMENT (stages 1–5 complete)
- **Current concept:** WINNER = C02 STORMWARDEN (frontier weather-forecasting
  expertise sim). Core loop: read instruments + upwind sensors, forecast
  tomorrow with confidence, a real simulated atmosphere resolves it, lives and
  reputation ride on the call.
- **Fallback concept:** C01 HIVEMIND (pheromone-painting swarm command) —
  preserved and runnable at `prototypes/hivemind/`, last exercised @ c7f1bca.
  Pivot target if a real-audience demand test comes back weak.
- **Current implementation:** two prototypes under `prototypes/`. STORMWARDEN
  is the active line of development.
- **Active hypothesis (resolved):** B PASSED — instrument-informed forecasting
  beats persistence by Brier Skill Score +0.628 / +25pts accuracy (5 seeds,
  VERIFIED FACT). A (HIVEMIND) partially passed after an in-run economy reframe.
- **Active hypothesis (open, Stage 6):** the skill gradient stays learnable but
  EXPERT-FALLIBLE once the player must choose WHERE to place a limited sensor
  budget (verb currently stubbed as fixed lookouts). And the dominant open
  risk: DEMAND for a forecasting game is UNKNOWN.
- **Last known good commit:** 67c63ab (Stage 4b: STORMWARDEN prototype +
  harness — both prototypes runnable).
- **Current build status:** runnable. Serve repo root and open the prototype
  (see HANDOFF for exact commands). Node harness: `node tools/season.mjs`.
- **Highest-value next action:** Stage 6 — implement the real sensor-placement
  decision (scarce, mis-placeable sensors) and deepen the fallible skill
  gradient; measure whether skilled placement still beats naive placement.
- **Blockers:** none (demand test needs real humans — deferred, not blocking).
- **Morning report ready:** false

## Stages

SETUP_COMPLETE precedes stage 1. Definitions are in
`AUTONOMOUS_STUDIO_PROTOCOL.md`; VERTICAL_SLICE is the maturation of
WINNER_DEVELOPMENT (Protocol Stage 6).

1. RESEARCH
2. CONCEPTS
3. TWO_FINALISTS
4. DUAL_PROTOTYPES
5. PROTOTYPE_COMPARISON
6. WINNER_DEVELOPMENT
7. VERTICAL_SLICE
8. MORNING_ASSESSMENT
