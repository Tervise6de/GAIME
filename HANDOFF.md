# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6). The final MORNING_ASSESSMENT
  (MORNING_REPORT.md) was executed and re-verified earlier on 2026-07-11 and is
  current; this session did additional development on top of it.
- **Active hypothesis:** humans can learn and enjoy the painting verb
  (scripted play proves depth exists; human feel is THE open question — and is
  BLOCKED in this environment).
- **What this session did (2026-07-11, dev-difficulty-norm):** built `gcmdr2`,
  a guard-clearing bot = `gcommander` + a CONCURRENT second front (paints the
  guarded rich pile's war zone every cycle IN ADDITION to nest defence; nest
  painted first so the fixed 35% soldier cap keeps defenders). This beats the
  dominant loss mode (guarded 900-food pile never opened) WITHOUT the death
  explosion that sank the earlier sole-priority attempt. Measured on the same
  16 seeds with a new poll-based harness `tools/bot_sweep.mjs`:
  **gcommander 9/16 (56%) -> gcmdr2 10/16 (62.5%)**, +1 win (seed 1679 rich
  0%->61%), ZERO win regressions, win-death floor improved 231->177. Four
  losses (1485,2164,2358,2455) stay `rich:0%` — genuinely expensive/essential
  guards, honest difficulty. A stronger-LURE guard march was tried and REVERTED
  (overfit: traded 1679 for 2358). Data: `data/gcmdr2_sweep_20260711.md`.
- **Current build status:** GREEN. commander still WINS seed 7 (1200/1200);
  idle/smart/warband lose (distinct outcomes). Single-file
  `game/dist/HIVEMIND.html` rebuilt (48.9KB, now includes gcmdr2) and
  re-verified from `file://` to the win card. gcommander/commander baselines
  and both prototypes untouched; seed-7 gcmdr2 == gcommander (1062/1200).
- **Last known good commit:** tip of branch
  `claude/gaime-steam-autonomous-studio-u4ny57` (every commit verified before
  push).
- **Known blockers:** human playtesting impossible from this environment
  (founder action needed) — still the single most important open validation.
- **Next three actions (highest value first):**
  1. Difficulty normalization on the generator: win-times 272-409s and deaths
     177-1294 are still too spread. Add a post-gen structural difficulty
     estimate (guard travel-cost, pile spread, wave pressure) and reject/retune
     outliers into a target band. Validate with a bot_sweep before/after.
  2. Crack the 4 remaining `rich:0%` hard maps (1485,2164,2358,2455): the bot
     can't route enough force to a distant ESSENTIAL guard while harvesting in
     time. Needs smarter far-guard routing (NOT a blunt stronger-LURE — that
     overfit and was reverted) or human play.
  3. Brood throttle verb (paint the nest: grow vs bank) — player control over
     the growth economy that dominated Loop 1 outcomes.
- **Exact build/run commands:** CLAUDE.md "Build & test commands". Quick verify
  after any sim/bot change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=20" --max 260; done`
  → commander must WIN, idle must lose. Winnability sweep (robust):
  `node tools/bot_sweep.mjs --bot=gcmdr2 --count=16 --first=1000 --stride=97 --fast=40`.
