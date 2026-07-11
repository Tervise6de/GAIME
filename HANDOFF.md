# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Branch:** work is on `claude/ecstatic-ride-vekd19` (this session pushed
  there, not to main). Latest commits are the source of truth.
- **Current stage:** WINNER_DEVELOPMENT, loops 1-5 done. MORNING_ASSESSMENT
  report exists but is STALE (predates loops 4-5) — refresh it in the morning
  run.
- **Active hypothesis:** humans can learn and enjoy the painting verb.
  Scripted play now proves both that the depth exists AND that a competent
  player can fairly win generated maps. Human feel remains THE open question
  (cannot be tested from this environment).
- **What changed this session (overnight-2):**
  1. Generalized the commander ("ceiling") bot to be map-agnostic — Dijkstra
     corridors launched on separated bearings + FEAR containment of idle
     hunters. Seed 7 keeps its validated reference lanes (WON t=175 unchanged).
  2. `tools/sweep.mjs` + `tools/sim_runner.mjs`: browser-free sweep harness
     (verified identical to the Chromium harness).
  3. Winnability finding: ceiling bot wins 50/64 generated seeds; 22% are
     UNWINNABLE even by perfect play; win-times span 143-470s. Structural
     fairness ≠ balance. No cheap geometric proxy predicts winnability
     (tested), so fair maps MUST be simulation-verified.
  4. `tools/build_whitelist.mjs` + `game/js/seeds.js`: curated, difficulty-
     banded (~210-360s) seed whitelist; the [N] "new territory" key now draws
     from it instead of raw random (main.js).
  5. Juice pass (`game/js/fx.js`): nest delivery pulses, spider-death bursts,
     procedural WebAudio ([M] mutes). Cosmetic-only (balance unaffected).
  6. Fixed the hivemind click test (title gate had silently broken it) and
     gave it real assertions.
- **Current build status:** GREEN. Full suite verified: commander WINS seed 7
  (t=175) and all whitelist seeds; smart/warband/naive/idle lose; both click
  tests pass; both prototypes run; `game/dist/HIVEMIND.html` rebuilt and runs
  from file://.
- **Verify commands:** see CLAUDE.md. Fast full checks:
  * `node tools/sweep.mjs --auto commander --seedlist 7` → must WIN t=175.
  * `node tools/sweep.mjs --auto commander --from 1000 --seeds 12` → most WIN.
  * `node tools/click_test_hivemind.mjs` → "click test OK".
  * `node tools/build_single.mjs` → rebuilds dist.
- **Known blockers:** human playtesting impossible here (founder action).
- **Next three actions (highest value first):**
  1. Brood-throttle verb (paint the nest: grow vs bank) — the most-cited
     depth gap. It CHANGES the economy, so re-run `build_whitelist.mjs` and
     re-check the seed-7 quota afterwards. Deferred this session to keep the
     shipped balance stable/verified.
  2. Second scenario ("The Long Drought") reusing existing systems.
  3. If this is the final morning run: run the Stage 7 checklist and REWRITE
     MORNING_REPORT.md to include the loop-4/5 winnability evidence + whitelist.
