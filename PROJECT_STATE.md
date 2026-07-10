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
- **Last known good commit:** 1477af5 (sensor placement wired into the playable
  build; both prototypes runnable, harnesses green).
- **Current build status:** runnable. Serve repo root and open the prototype
  (see HANDOFF for exact commands). Harnesses: `node tools/season.mjs`,
  `node tools/placement.mjs`.
- **Stage 6 done so far:** the playable core loop now layers two decisions —
  place 3 sensors (near/far tradeoff), then commit a 3-DAY OUTLOOK each day
  (scored per lead). Proven (all VERIFIED FACT): instrument beats persistence
  BSS +0.628; skilled placement beats naive BSS +0.453 / +14 pts; skill decays
  gracefully with lead (+1/+2/+3d BSS +0.75/+0.63/+0.53) so long-range is a real
  higher-skill tier; expert accuracy a fallible ~91% at +1d. Vertical-slice-shaped.
- **Highest-value next actions:** (1) scarce-budget/upgrade economy (buy/move
  sensors, better instruments) so placement compounds across a career; (2)
  deepen the sim (named fronts, multi-day outlook) to keep expert play fallible;
  (3) THE dominant open risk — a real-audience DEMAND test (needs humans).
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
