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
  builder, gameplay recorder, `win_sweep.mjs` cross-seed winnability).
  Bots: hand-tuned `commander` (seed-7 baseline) + generic map-driven
  `gcommander` (plays any generated territory).
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth exists; human feel is the top unknown.
- **Last known good commit:** tip of branch
  `claude/gaime-steam-autonomous-studio-fok54l` (this session; every commit
  verified before push — seed-7 commander WON t=175, idle lost, gcommander
  34/40 on the full set, dist rebuilt). Prior known-good: end of overnight-1
  Loop 3 on main.
- **Current build status:** GREEN — verified this session (2026-07-11,
  fok54l): seed-7 commander WON 1200/1200 @175s, idle lost; gcommander seed-7
  unchanged at 1062; full 40-seed sweep re-run (34/40 = 85%); single-file
  HIVEMIND.html rebuilt (48.7KB); UI click test exit 0. See CLAUDE.md for the
  one-line re-verification command.
- **Highest-value next action:** human play (still the top unknown), then the
  brood-throttle verb (player control over the grow-vs-bank economy that decides
  the 4 economy near-miss losses), difficulty normalization, and the two hard
  tail seeds (4395 close/grind, 4007 stall). Winnability is MEASURED over the
  full 40-seed set, not assumed — see below.
- **Winnability (UPDATED 2026-07-11, session fok54l):** `gcommander` gained a
  staged guard assault (route to the reachable rich pile, hold a WAR well on the
  guard, don't FEAR-wall a pile you're storming). Measured over the FULL 40-seed
  fairness set: **34/40 = 85%**, up from the 56% first-16 baseline (the bot now
  takes 15/16 of that subset). ZERO regressions from the assault work. The 6
  losses form a clean taxonomy: 4 economy near-misses (guard slain + map
  harvested, short on overhead — winnable in principle), 1 guard stall (4007),
  1 close-guard death-grind (4395, died 2078). NOTE: the honest full-set number
  is 85%; the first-16 subset alone reads 94% — do not quote the subset.
  STRONG-PROXY LOWER BOUND by a generic bot, not a human claim. Full data:
  `data/winnability_sweep_20260711_guardassault.md` (before:
  `data/winnability_sweep_20260711.md`).
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
