# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6). The final MORNING_ASSESSMENT
  was executed and re-verified earlier on 2026-07-11; MORNING_REPORT.md is
  current (its 9/16 winnability figure is superseded by 16/16 — see below).
- **Active hypothesis:** humans can learn and enjoy the painting verb
  (scripted play proves depth exists; human feel is THE open question).
- **What this session did (2026-07-11 pm, dev-guardclear):**
  1. Guard assault for `gcommander`: muster→march→strike on a single MOVING
     WAR peak ("shepherd blob", erased + re-stamped ~45px/repaint along the
     Dijkstra route; repaint period halved to 120 ticks for gcommander only).
     Static gradients were proven unable to move an army (every stamp is a
     local max — soldiers park on it; screenshots, seed 1485). Muster stalls
     escalate to the nest mouth after 15 repaints (seed 2455 fix).
  2. Brood throttle verb: FEAR painted on the nest holds brood (sim change,
     with a "home overrides fear" ring inside homeDist<=9 cells so nest FEAR
     can't block deliveries); HUD shows "brood held"; onboarding hint added;
     gcommander banks when pop>1400 && stores>500.
  3. Result: **16/16 generated seeds WIN** (was 9/16); times 161-307s,
     deaths 172-686. Seed-7 commander baseline byte-identical (WON t=175).
  4. Difficulty normalization REJECTED on measurement (static features vs
     outcomes: best |r|=0.47, deaths |r|<=0.23; `tools/difficulty_probe.mjs`).
     DECISION_LOG + data doc updated.
  5. Repaired a silently-vacuous test: click_test_hivemind never painted
     (title screen ate its first mousedown) and asserted nothing. Now it
     plays for real and asserts hint progression + deliveries. PASSES.
- **Current build status:** GREEN. Verified this session: seed-7 five-doctrine
  matrix (HEAD-parity confirmed for every doctrine), gen_check 40/40, click
  test PASS, dist rebuilt (52.7KB) and reaches the win card.
- **Last known good commit:** tip of `main` == tip of
  `claude/gaime-steam-autonomous-studio-k17h9e` (this session's final commit;
  every game change was verified before commit).
- **Known blockers:** human playtesting impossible from this environment
  (founder action needed) — still the single most important open validation.
- **Next three actions (highest value first):**
  1. Juice pass (BACKLOG Now #2): nest delivery pulse, spider death burst,
     procedural WebAudio; then re-capture screenshots/GIF (media/ is stale
     relative to the brood-throttle HUD + assault behaviour).
  2. Watch a full gcommander run visually (record_gameplay.mjs) on 2-3 seeds
     to sanity-check the shepherd assault LOOKS right (it's also roughly the
     recommended human doctrine now) and capture a assault clip for the
     founder.
  3. Brood-throttle polish: the hint fires at stores>600 & t>180; consider a
     small end-card stat ("food spent on brood") so the grow-vs-bank tradeoff
     is legible; thresholds are bot-tuned, not human-tuned.
- **Exact build/run commands:** CLAUDE.md "Build & test commands". Quick
  verify after any sim change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=20" --max 260; done`
  → commander must WIN t=175, idle must lose. Sweep: run_proto per seed
  (seeds 1000+i*97), NOT win_sweep.mjs (false timeouts on long games).
