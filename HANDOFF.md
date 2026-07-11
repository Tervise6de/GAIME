# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6). Final MORNING_ASSESSMENT
  was already executed and re-verified earlier on 2026-07-11.
- **Active hypothesis:** humans can learn and enjoy the painting verb
  (scripted play proves depth exists; human feel is THE open question).
- **What this session did (2026-07-11, dev-winnability):** built `gcommander`
  — a generic, map-driven bot (hunter-avoiding Dijkstra routes, FEAR walls
  over deep dens) that can attempt ANY generated territory, unlike the
  seed-7-only hand-tuned `commander` (preserved untouched). Added
  `tools/win_sweep.mjs`. Measured winnability across 16 generated seeds:
  **gcommander wins 9/16 (56%)**; 5 of 7 losses are the guarded rich pile
  never cleared (fixable strategy gap, not unfair maps). This converts
  "generated maps are winnable" from ASSUMPTION to a measured STRONG-PROXY
  LOWER BOUND. Full data: `data/winnability_sweep_20260711.md`. A
  guard-priority tweak was tried and REVERTED (caused death explosions).
- **Current build status:** GREEN. Baseline `commander` still WINS seed 7 at
  t=175 (verified this session). Single-file `game/dist/HIVEMIND.html`
  rebuilt (45.8KB) and re-verified to the win state. Both prototypes intact.
- **Last known good commit:** tip of branch
  `claude/gaime-steam-autonomous-studio-6op37p` (this session's final commit;
  every commit was verified before push). Also mirrored to `main` earlier.
- **Known blockers:** human playtesting impossible from this environment
  (founder action needed) — still the single most important open validation.
- **Next three actions (highest value first):**
  1. Difficulty normalization on the generator (win-times 272-390s, deaths
     231-1294 are too spread) — add a post-gen difficulty estimate and
     reject/retune outliers into a target band.
  2. A smarter guard-clearing routine for gcommander (kill a distant guard
     WITHOUT abandoning the nest — naive guard-priority failed) to raise the
     56% winnability lower bound.
  3. Brood throttle verb (paint the nest: grow vs bank) — player control over
     the growth economy that dominated Loop 1 outcomes.
- **Exact build/run commands:** CLAUDE.md "Build & test commands". Quick
  verify after any sim change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=20" --max 260; done`
  → commander must WIN, idle must lose. Winnability sweep: `node tools/win_sweep.mjs 16 40 1000 97`
  (but use run_proto per-seed for reliable long-game results — see CLAUDE.md note).
