# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (post Loop 3) → next loops below;
  MORNING_ASSESSMENT report already current as of overnight-1 end
- **Active hypothesis:** humans can learn and enjoy the painting verb
  (scripted play proves depth exists; human feel is THE open question)
- **What changed (overnight-1):** stages 1-5 end-to-end; Stage 6 loops 1-3 (goal structure, onboarding, generated territories); two
  instrumented prototypes with falsification evidence; HIVEMIND selected
  and developed into a winnable/losable game with onboarding, economy,
  escalation, title/end cards; single-file distributable build; media
  (GIF/webm/screenshots); MORNING_REPORT.md written (CONTINUE WITH
  CONDITIONS).
- **Current build status:** GREEN. `game/` verified: commander bot WINS
  seed 7 at t≈175 (deterministic), four lazy doctrines lose differently;
  single-file build `game/dist/HIVEMIND.html` verified identical from
  file://. Both prototypes still run.
- **Last known good commit:** see latest main (every commit tonight was
  verified before push; if anything regresses, `git log` — each commit
  message states what was verified).
- **Known blockers:** none technical. Human playtesting impossible from
  this environment — founder action or future integration needed.
- **Next three actions (highest value first):**
  1. Generalize commander bot to BFS-derived paths; verify generated maps
     are bot-WINNABLE across ≥20 seeds and normalize difficulty (fairness
     guarantees shipped tonight; balance guarantees are the gap).
  2. Brood throttle verb (paint the nest: feed vs bank ratio) — removes
     the automatic-growth limitation found in Loop 1 economics.
  3. Juice pass: delivery pulse at nest, spider death burst, WebAudio
     blips (all procedural, licence-clean) + re-capture GIF.
- **Exact build and run commands:** see CLAUDE.md "Build & test commands"
  (serve, play URL, single-file build, bot-matrix verification, UI tests).
  Quick verify after any sim change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=12" --max 150; done`
  → commander must WIN, idle must lose.
