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
  scenario + onboarding + economy + escalation + brood-throttle verb (FEAR
  on nest = hold brood/bank); `game/dist/HIVEMIND.html` single-file
  distributable; two frozen prototypes; `tools/` verification harness
  (headless runner, bot matrix, UI click tests — now with real assertions,
  single-file builder, gameplay recorder, `win_sweep.mjs`,
  `difficulty_probe.mjs`). Bots: hand-tuned `commander` (seed-7 baseline) +
  generic map-driven `gcommander` (muster→march→strike shepherd assault,
  brood banking; wins ANY of the 16 reference generated territories).
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth exists; human feel is the top unknown.
- **Last known good commit:** HEAD of main at end of overnight-1 (Loop 3;
  40/40 generated maps pass fairness checks; seed-7 commander regression
  WON t=175; dist verified from file://).
- **Current build status:** GREEN — re-verified 2026-07-11 pm after the
  guard-clearing/brood-throttle/juice session: seed-7 matrix has five
  distinct outcomes (commander WON 1200 @175s / smart 949 / warband 511 /
  naive collapse / idle 0); repaired `win_sweep.mjs` reproduces 16/16 in one
  command with no false timeouts; UI click test passes with real assertions;
  gen_check 40/40; dist (57.2KB) rebuilt and reaches the win card with the
  brood ledger. See CLAUDE.md for the re-verification commands.
- **Highest-value next action:** human playtests (founder-blocked); from the
  studio side, the art-direction spike (stills are the weakest asset). Juice
  pass is DONE (delivery pulses, death bursts, gesture-gated WebAudio;
  media re-captured except the GIF — no ffmpeg here). End card now shows the
  grow-vs-bank ledger ("spent on brood").
- **Winnability (UPDATED 2026-07-11 pm):** `gcommander` now wins **16/16**
  generated seeds (was 9/16 in the morning) after the shepherd-blob guard
  assault + brood throttle; win times 161-307s, deaths 172-686 (spread
  tightened without touching the generator). STRONG-PROXY LOWER BOUND —
  says nothing about human players. Static difficulty normalization was
  REJECTED on measurement (features don't predict outcomes; see
  DECISION_LOG). Full data: `data/winnability_sweep_20260711.md`.
- **Blockers:** human playtesting cannot be done from this environment
  (founder action needed — see BACKLOG "Now" #5).
- **Morning report ready:** true — re-verified and stamped on the final
  morning run (2026-07-11); MORNING_REPORT.md opens with a live
  re-verification block and the observed seed-7 bot matrix.

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
