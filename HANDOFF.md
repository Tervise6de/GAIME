# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6). MORNING_REPORT.md is
  current (two same-day addenda appended after the stamped report).
- **Active hypothesis:** humans can learn and enjoy the painting verb —
  scripted play proves the depth exists across TWO goal structures; human
  feel is THE open question.
- **What this session did (2026-07-11 late pm, dev-afternoon-9pfynq):**
  1. **Second scenario "The Long Drought"** (`?scn=drought`, [S] on title):
     endurance inversion — piles evaporate 0.8/s, upkeep 0.004/ant/s ramps
     in over 90s, rains at t=420 must find a 200-store reserve, hunters
     spawn when piles dry to dust. Scenario layer only, zero new sim tech.
     VALIDATED: gcommander wins 16/16 generated seeds (stores 340-944) +
     seed 7 (205, thin because of its known far-pile underservice);
     commander/smart/naive/idle ALL starve on seed 7 AND spot-checked
     generated seeds. The First Season champion losing the drought is the
     generalization proof. Data: data/drought_sweep_20260711.md.
  2. **Sim fix (affects both scenarios):** holding brood now PAUSES the
     growth clock (sim.heldTime) — releasing a hold no longer spawns a
     catch-up burst to the absolute clock (measured ~1600 ants in one tick,
     instant starvation). Never-held runs bit-for-bit unchanged; commander
     seed-7 regression stayed byte-identical all session.
  3. **gcommander drought doctrine**: pop cap 700 while piles live / 450
     after, with stamp/erase hysteresis (a no-op gap let nest FEAR decay
     through the 0.35 threshold and silently reopen brood).
  4. **hivemind.gif refreshed** post-juice/post-art via new no-ffmpeg
     pipeline: tools/make_gif.mjs (frame capture) + tools/make_gif.py
     (Pillow assembly, shared palette). 51 frames, 3.9MB.
  5. **Art pass**: piles are seeded grain mounds that empty outside-in with
     the real amount; spiders got two-lobe bodies, antiphase leg gait, eye
     glints, ground shadow; drought gets a bleached warm wash + wind-borne
     dust motes (all render-only; tools/art_closeup.mjs for zoomed stills).
  6. Click test extended: [S] scenario switch, drought hint track, upkeep
     observed live. win_sweep.mjs gained --scn=.
- **Current build status:** GREEN. commander seed-7 First Season
  byte-identical (WON 1200 t=175, 679 died); First Season sweep 16/16
  re-verified after the sim change; drought sweep 16/16; click test PASS;
  dist 73.0KB reproduces the drought win (205) from the built file.
- **Last known good commit:** tip of main (every commit this session was
  verified before push; ace6b9d or later).
- **Known blockers:** human playtesting impossible from this environment
  (founder action) — the single most important open validation. The build
  now has TWO scenarios ready for it.
- **Next three actions (highest value first):**
  1. Fauna variety (BACKLOG Next → promote): ONE new creature done well.
     Candidate design: aphid herds — mobile prey that FLEES FEAR, so
     players can HERD food toward their roads (fear as a shepherd's crook
     fits "persuasion, never orders"). WARNING: adds food supply → all
     balance baselines (seed-7 commander t=175, both 16/16 sweeps) must be
     re-derived; start it at the TOP of a session, not the end.
  2. Difficulty curve across scenarios: parameter sweep via bot matrix
     (keep scenario-champion win margins in a sane band; drought margins on
     generated maps are 340-944 vs reserve 200 — consider whether tighter
     is better for humans BEFORE touching knobs).
  3. Palette identity pass (last remaining art scope) — the field colors
     (cyan/violet/red) vs earth is settled; formalize pile/nest/UI accents.
- **Exact build/run commands:** CLAUDE.md "Build & test commands". Quick
  verify after any sim change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=20" --max 260; done`
  → commander must WIN t=175 (679 died), idle must lose.
  Scenario sweeps: `node tools/win_sweep.mjs 16 40 1000 97` (First Season,
  16/16) and `node tools/win_sweep.mjs 16 40 1000 97 --scn=drought`
  (drought, 16/16). Drought quick check:
  `node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&scn=drought&auto=gcommander&fast=20" --max 200`
  → WON with 205 stores at t=420.
