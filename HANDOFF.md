# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6). The final MORNING_ASSESSMENT
  was already executed earlier on 2026-07-11 and is kept current (MORNING_REPORT.md
  now carries the honest 85% winnability figure).
- **Active hypothesis:** humans can learn and enjoy the painting verb (scripted
  play proves depth exists; human feel is THE open question, unreachable here).
- **What this session did (2026-07-11, dev-fok54l):** taught the generic
  `gcommander` bot to actually CLEAR the guarded rich pile. The dominant loss
  mode was force-timidity, not unfair maps: the bot harvested the two easy piles
  cleanly and left the 900-food guarded pile on the map. Added a staged
  `guardAssault` (game/js/auto.js) in three verified iterations:
  v1 route-to-den (14/16, stalled on 2164's blocked den) → v2 route-to-reachable
  -pile (15/16, fixed 2164, cut deaths e.g. seed 1000 1171→218) → v3 stop
  FEAR-walling a guard you're storming (fixed the FEAR/WAR seam, 3328 lost→won).
  Then measured the FULL 40-seed fairness set: **gcommander wins 34/40 = 85%**,
  up from the 56% first-16 baseline, ZERO regressions from the assault work.
  Added `tools/gen_difficulty.mjs` (structural difficulty probe) and generated-map
  win media. Corrected all docs from the flattering 16-seed 94% to the honest
  85%. A distant-guard gate for the 4395 death-grind was TRIED and REVERTED (the
  guard there is distant, not close — hypothesis wrong, no effect).
- **The 6 residual losses (all understood, taxonomy in the data file):** 4
  economy near-misses (1291, 3522, 4104, 4201 — guard slain + map harvested,
  short on brood/death overhead), 1 guard stall (4007, rich untouched despite a
  reachable den), 1 close/distant-guard death-grind (4395, died 2078, net 393 —
  the assault is actively harmful on this one geometry).
- **Current build status:** GREEN. Baseline `commander` still WINS seed 7 at
  t=175; idle loses; gcommander seed 7 unchanged at 1062. Single-file
  `game/dist/HIVEMIND.html` rebuilt (48.7KB). UI click test exit 0. Both
  prototypes intact. Sim/scenario/render/world/onboarding UNCHANGED this session
  — all edits are isolated to the bot (`game/js/auto.js`), so human play is
  unaffected.
- **Last known good commit:** tip of branch
  `claude/gaime-steam-autonomous-studio-fok54l` (every commit verified before push).
- **Known blockers:** human playtesting impossible from this environment
  (founder action needed) — still the single most important open validation.
- **Next three actions (highest value first):**
  1. Brood-throttle verb (paint the nest: grow vs bank). This is now the highest
     GAME-value item AND it targets the 4 economy near-miss losses directly —
     those maps are fully harvested but lose on overhead, exactly what a
     grow/bank lever controls. Note: it changes core economy, so re-verify ALL
     five seed-7 bots + re-run the 40-seed sweep afterwards. Default (no nest
     paint) MUST equal current behavior so the bot evidence holds.
  2. The two hard tail seeds: 4395 (assault death-grind — needs a bail-out when
     the guard won't die and the colony is shrinking) and 4007 (guard stall).
     Lower priority; risk the 34 wins if done carelessly — measure every change
     against the full 40-seed sweep.
  3. Difficulty normalization: death band across wins alone is 142–1434. No clean
     structural predictor found yet (see gen_difficulty.mjs / data file) — needs
     a better proxy, likely a short bot sim per candidate seed at gen time.
- **Exact build/run commands:** CLAUDE.md "Build & test commands". Quick verify
  after any sim change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=20" --max 260; done`
  → commander must WIN (t=175), idle must lose. Full winnability: loop
  run_proto over seeds `1000 + i·97`, i=0..39 (currently 34/40). Difficulty
  features: `node tools/gen_difficulty.mjs 40`.
