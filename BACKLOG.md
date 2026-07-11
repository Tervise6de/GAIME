# BACKLOG

"Now" holds at most five items. Move items between sections instead of
duplicating them. Rejected items keep a one-line reason.

## Now

1. Strengthen commander guard-assault → raise true win rate above 83%. The 9
   recorded losses (seedpool.js) are mostly guard-fizzle: rich pile unharvested
   when the guard is far and harvest roads out-pull the assault. Re-sweep the 9
   first, then broadly; grow the pool with new comfortable winners.
2. Brood throttle verb (dedicated BROOD field/tool, NOT LURE/FEAR at the nest)
   — player control over the growth economy that dominates outcomes. Highest
   remaining gameplay lever (meaningful decision); checkpoint + re-run matrix.
3. Second scenario ("The Long Drought") reusing systems, no new tech.
4. Founder-facing: arrange 5-10 human playtests of game/dist/HIVEMIND.html
   (measure: season completed ≤3 attempts; all verbs used; voluntary
   restarts; kill-signal: "ants won't obey" quits).

## Done (recent)

- [Loop 4] Generalize commander to BFS-derived roads (map-agnostic oracle);
  verify generated maps: ~83% win rate across 54 seeds (NOT 100% — first-24
  sample was fortunate) + naive/idle discrimination. Difficulty is emergent
  (no static predictor). Curated 39-seed oracle-winnable pool wired into [N].
  Full juice pass: delivery pulse + hunter death burst (sim-pure) AND
  procedural WebAudio (guarded, headless-safe; sound levels need a human pass).
  Fixed stale click test. Tools: bot_sweep.mjs, gen_stats.mjs; record_gameplay
  takes a seed arg. Failed guard-fix experiment recorded (deaths are binding).

## Next

- Art direction spike (palette, ant silhouettes, terrain texture) — current
  look is programmer-glow; strong in motion, thin in stills.
- Fauna variety: 2-3 non-spider threats/prey with distinct field responses.
- Difficulty curve: scenario parameter sweep via bot matrix (keep commander
  win-time 250-350s per scenario).
- Steam wrapper decision (Electron/Tauri vs engine port) — only after human
  playtests pass.

## Later

- Campaign structure (15-25 scenarios, biomes), sandbox mode.
- Multi-nest play; pheromone verb expansion (harvest priority, brood caste).
- Wishlist/demo funnel experiment (real market data, not proxies).
- STORMWARDEN: if pivot triggered — next step is human tension playtest of
  its daily loop; sky-learnability already proven.

## Rejected

- Building the smallest finished game first — protocol forbids; goal is
  concept validation.
- Choosing winner from written scoring alone — replaced by dual-prototype
  implementation evidence (protocol Stage 5).
- C03 GRAINSIEGE as finalist — hook overlaps Noita's proven ground; kept as
  concept only.
- Time-triggered escalation waves — competent play outruns them; replaced
  by progress-triggered waves (evidence in PLAYTEST_LOG 22:00 entry).
