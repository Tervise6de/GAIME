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
  scenario + onboarding + economy + escalation; `game/dist/HIVEMIND.html`
  single-file distributable; two frozen prototypes; `tools/` verification
  harness (headless runner, bot matrix, UI click tests, single-file
  builder, gameplay recorder, `win_sweep.mjs` + robust poll-based
  `bot_sweep.mjs` cross-seed winnability).
  Bots: hand-tuned `commander` (seed-7 baseline) + generic map-driven
  `gcommander` (plays any generated territory) + `gcmdr2` (gcommander with a
  concurrent guard-clearing second front).
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth exists; human feel is the top unknown.
- **Last known good commit:** tip of branch
  `claude/gaime-steam-autonomous-studio-u4ny57` (gcmdr2 added; every commit
  verified before push — commander WON seed 7, dist verified from `file://`,
  gcmdr2 10/16 measured).
- **Current build status:** GREEN — verified 2026-07-11 (dev-difficulty-norm
  session): commander WINS seed 7 (1200/1200); idle/smart/warband lose
  (distinct outcomes); single-file HIVEMIND.html rebuilt (48.9KB, now includes
  gcmdr2) and re-run from `file://` reaches the win card (commander won,
  1200 stores). See CLAUDE.md for the one-line re-verification command.
- **Highest-value next action:** difficulty-normalization pass on the generator
  (win-times still 272-409s, deaths 177-1294 — too spread), and cracking the
  4 remaining `rich:0%` hard maps (need smarter far-guard routing or human
  play). Winnability is MEASURED, not assumed — see below.
- **Winnability (UPDATED 2026-07-11):** the concurrent-front `gcmdr2` bot wins
  10/16 generated seeds (62.5%), up from `gcommander`'s 9/16 (56%): +1 win,
  zero win regressions, no death explosion. 4 losses remain the guarded rich
  pile never opened — genuinely expensive guards (honest difficulty), not
  structural unfairness. Still a STRONG-PROXY LOWER BOUND, not proof, and
  silent on human players. Full data: `data/gcmdr2_sweep_20260711.md`
  (baseline: `data/winnability_sweep_20260711.md`).
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
