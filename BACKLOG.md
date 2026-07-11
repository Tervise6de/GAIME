# BACKLOG

"Now" holds at most five items. Move items between sections instead of
duplicating them. Rejected items keep a one-line reason.

## Now

1. Difficulty normalization across the certified pool: oracle win-times span
   148-466s (3x). Tune per-map so a competent run lands ~250-330s (e.g. scale
   quota to safely-routable food, or gate on oracle win-time band), then
   re-certify. Consistent difficulty > raw variety.
2. Brood throttle verb (paint the nest: grow vs bank) — player control over
   the growth economy discovered to dominate outcomes in Loop 1. NOTE:
   re-run win_sweep.mjs + re-certify seeds.js after (changes the economy).
3. Audio polish: procedural base shipped (audio.js — harvest tick, death
   crunch, win/lose sting). Human-verify it's pleasant (unheard from this
   env); consider ambience/mix and a mute toggle.
4. Second scenario ("The Long Drought") reusing systems, no new tech.
5. Founder-facing: arrange 5-10 human playtests of game/dist/HIVEMIND.html
   (measure: season completed ≤3 attempts; all verbs used; voluntary
   restarts; kill-signal: "ants won't obey" quits).

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
