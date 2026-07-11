# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6). The final MORNING_ASSESSMENT
  was executed earlier on 2026-07-11; MORNING_REPORT.md is current except its
  9/16 winnability figure — superseded by **16/16** (see data doc).
- **Active hypothesis:** humans can learn and enjoy the painting verb
  (scripted play proves depth exists; human feel is THE open question).
- **What this session did (2026-07-11 pm, dev-guardclear):**
  1. **16/16 generated-seed winnability** (was 9/16): gcommander gained a
     muster→march→strike guard assault on a single moving WAR peak
     ("shepherd blob"; static gradients provably strand soldiers — every
     stamp is a local max), stall-escalation to the nest mouth, and a brood
     throttle. Reproduce with `node tools/win_sweep.mjs 16 40 1000 97`.
  2. **Brood throttle is a PLAYER verb**: FEAR on the nest holds brood
     ("home overrides fear" ring keeps deliveries working), HUD shows
     "brood held", onboarding hint teaches it, end card shows the ledger
     ("spent on brood"). Grow-vs-bank is now an expressible decision.
  3. **Difficulty normalization REJECTED on measurement** (static features
     don't predict outcomes; tools/difficulty_probe.mjs + DECISION_LOG).
  4. **Juice pass**: nest delivery pulses, hunter death bursts, zero-asset
     gesture-gated WebAudio. Determinism verified byte-identical.
  5. **Harness repairs**: click_test_hivemind was silently vacuous (title
     screen ate its first click) — now plays and asserts; win_sweep.mjs
     false-timeout bug fixed (polls __DONE like run_proto).
  6. Art direction spike: soil/rocks/grain/nest baked into the static bg
     (stills read as earth now), ant head dots, vignette; fps unchanged.
  7. Media: gameplay video + stills re-recorded post-art; 4-shot assault
     sequence in media/proto/assault_*.png. GIF still pre-juice (no ffmpeg).
- **Current build status:** GREEN. Seed-7 matrix five distinct outcomes
  (commander WON t=175/679 died — byte-identical all session); 16/16 sweep;
  gen_check 40/40; click test PASS; dist 61.3KB reaches win card.
- **Last known good commit:** tip of `main` == tip of
  `claude/gaime-steam-autonomous-studio-k17h9e` (every commit verified).
- **Known blockers:** human playtesting impossible from this environment
  (founder action needed) — the single most important open validation.
- **Next three actions (highest value first):**
  1. Second scenario "The Long Drought" (BACKLOG Now) reusing systems —
     proves the verb set generalizes beyond one goal structure. Balance it
     with the bot matrix (commander win-time target 250-350s).
  2. Art continuation: palette identity + ant/spider silhouettes (terrain/
     rocks/grain landed in the 2026-07-11 spike; before-still kept at
     media/proto/art_before_20260711.png for comparison).
  3. Refresh hivemind.gif from the current build if ffmpeg is available.
- **Exact build/run commands:** CLAUDE.md "Build & test commands". Quick
  verify after any sim change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=20" --max 260; done`
  → commander must WIN t=175 (679 died, brood 396), idle must lose.
  Full winnability: `node tools/win_sweep.mjs 16 40 1000 97` → 16/16.
