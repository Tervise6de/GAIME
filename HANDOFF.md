# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6), loops 1-4 complete. The
  final MORNING_ASSESSMENT run also executed (2026-07-11 ~09:00 UTC): build
  re-verified fresh after a container restart, media re-captured from generated
  maps, MORNING_REPORT finalized (CONTINUE WITH CONDITIONS). Next dev session
  resumes at the "Next three actions" below.
- **Branch:** work is on `claude/ecstatic-ride-h0dy5s` (NOT yet merged to
  main). Every commit was verified before push.
- **Active hypothesis:** humans can learn and enjoy the painting verb.
  Winnability by *skilled* play is now VERIFIED (bot oracle); human feel and
  pacing remain THE open question (untestable from this environment).
- **What changed this session (Loop 4):** the commander bot was generalized
  from hardcoded seed-7 waypoints to a map-agnostic hunter-avoiding Dijkstra
  pathfinder (LURE harvest roads + a hybrid LURE-approach / WAR-conversion
  assault on the guard's den). RESULT: across 84 swept generated seeds
  (1000..9051, step 97) the commander wins ~84.5% (71/84) + seed 7; naive/idle
  LOSE on all tested seeds. "New territory" [N] now serves only the 62
  oracle-comfortable seeds (win-time ≤430s), so players never get a map the
  oracle can't beat. Also: full juice pass (delivery pulse + hunter death
  burst + procedural WebAudio, all sim-pure: effects.js, audio.js); fixed the
  stale click test. New tools: `bot_sweep.mjs`, `gen_stats.mjs`. Finding:
  difficulty is EMERGENT — no cheap geometry feature predicts win-time.
  IMPORTANT: the first 24-seed sample read 100%; the true rate is ~84.5% (see
  PLAYTEST_LOG correction 2026-07-11).
- **Current build status:** GREEN. Re-verify:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=12" --max 150; done`
  → commander WINS, idle loses. Full sweep: `node tools/bot_sweep.mjs 24 commander 30`.
  (Run `npm install` first — Playwright is a dev dep; the harness needs it.)
- **Known blockers:** none technical. Human playtesting impossible here.
- **Next three actions (highest value first):**
  1. Strengthen the commander guard-assault to raise the true win rate above
     83% — the 9 known losses (recorded in seedpool.js) are largely
     guard-fizzle (rich pile never harvested when the guard is far and
     competing harvest roads out-pull the assault). Re-sweep those 9 first
     (fast), then broadly. This both raises winnability and grows the pool.
  2. Brood-throttle verb (paint the nest: feed vs bank) — the last big
     gameplay lever; growth is currently automatic. Needs a dedicated BROOD
     field/tool (NOT LURE/FEAR at the nest — the commander paints those, would
     collide). Checkpoint + re-run the bot matrix after (commander must stay
     unaffected by construction).
  3. Add procedural WebAudio to the juice layer (delivery tick, death thud,
     wave-arrival) — guarded so headless never breaks; re-capture media with
     `node tools/record_gameplay.mjs <seed> commander <prefix>`.
- **Exact build/run commands:** see CLAUDE.md "Build & test commands".
