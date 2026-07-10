# PROJECT_STATE

Canonical current state. Update before ending every session. Keep it a
snapshot — detail belongs in the logs and in git history.

- **Current stage:** WINNER_DEVELOPMENT (stages 1–5 complete)
- **Current concept:** C01 HIVEMIND — indirect swarm command by painting
  pheromone fields; the colony is persuaded, never ordered
- **Fallback concept:** C02 STORMWARDEN (playable prototype preserved at
  prototypes/stormwarden/, core skill-gradient assumption VERIFIED)
- **Current implementation:** two playable prototypes under prototypes/;
  winner development on hivemind beginning
- **Active hypothesis:** HIVEMIND can be made goal-directed, teachable and
  replayable (win/lose + onboarding + generated maps) without losing the
  verified strategic depth
- **Last known good commit:** 7207c84 (both prototypes verified runnable)
- **Current build status:** GREEN — both prototypes run at 60fps headless;
  serve repo root and open prototypes/<name>/index.html
- **Highest-value next action:** Stage 6 loop 1 — win/lose scenario
  structure with scripted-play verification
- **Blockers:** none
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
