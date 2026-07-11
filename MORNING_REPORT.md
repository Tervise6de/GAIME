# MORNING_REPORT

Play or view the build before reading the analysis.

> **Re-verified on the final morning run — 2026-07-11 (Europe/Tallinn).**
> The build was rebuilt-from-checkout and re-run headless this morning; it is
> GREEN. On seed 7 the five scripted doctrines still produce five distinct
> outcomes — competence wins, everything else fails a different way
> (VERIFIED FACT, observed this run):
>
> | Doctrine | Outcome | Why it ends that way |
> |---|---|---|
> | commander | **WON** — 1200/1200 stores, season lasted 175s, 679 fallen | full verb composition |
> | smart | LOST — 949/1200 gathered | partial competence banks most but misses winter |
> | warband | LOST — 0 gathered | over-militarized; economy never starts |
> | naive | LOST — colony collapsed below survival | undefended roads bleed the colony out |
> | idle | LOST — 0/1200, "winter came" | no input |
>
> The single-file `game/dist/HIVEMIND.html` was re-run this morning and
> reaches the identical win state (win card renders: "THE COLONY ENDURES").
> Media in `media/` (5 screenshots, GIF, ~2-min webm) matches this build.

## How to play (2 minutes to first road)

**Fastest (any OS, incl. Windows):** download/open `game/dist/HIVEMIND.html`
— a single self-contained file; double-click it, it runs in any browser.
Verified to produce identical results to the served version.

**From a checkout:** `python3 -m http.server 8123` in the repo root, then
open http://localhost:8123/game/index.html

**Controls:** paint with LEFT mouse, erase with RIGHT. `1` LURE (roads),
`2` FEAR (walls), `3` RALLY (warbands). Mouse wheel = brush size, `P` =
pause. Click to begin. The game teaches the rest contextually.

**Watch instead:** `media/hivemind.gif` (13s battle clip),
`media/gameplay_commander_seed7.webm` (~2 min of scripted competent play),
screenshots `media/shot_*.png`. The core-hook image is
`media/shot_battle.png` — twin scent-roads, golden ant-rivers, a red
warband striking a hunter.

## What the game is

**HIVEMIND** — you are the collective will of an ant colony, but you never
select or order a single ant. You paint persistent scent fields on the
world — LURE roads, FEAR walls, RALLY warbands — and thousands of
autonomous ants respond to what they can smell a few steps ahead. The
fantasy: *the colony is not yours to command, only to persuade.* First
scenario: bank 1200 stores before winter (8 min) while your own success
summons hunters onto your roads.

## What was actually built tonight (one overnight run)

1. Market scan with evidence classes (CONCEPTS.md).
2. Twelve concepts evaluated on fifteen criteria; two finalists chosen.
3. TWO playable prototypes, each instrumented and falsification-tested:
   - `prototypes/hivemind/` — swarm-painting sandbox (3,200 agents, ~1ms/tick)
   - `prototypes/stormwarden/` — frontier weather-forecaster with a real
     calibrated atmosphere sim and a 4-station telegraph network
4. A winner developed into a game (`game/`): win/lose scenario, brood
   economy, rate-limited piles, soldier-caste cap, progress-triggered
   escalation, contextual onboarding, title/end cards, danger readability,
   single-file distributable build, scripted-play verification suite.

## Why HIVEMIND beat STORMWARDEN

Both passed their hardest falsification tests. HIVEMIND won on: verified
real-time depth (five scripted doctrines produce five different outcomes —
only full competence wins), decision density, spectacular self-marketing
visuals, and — decisively — its residual risks (readability, onboarding)
were fixable by design tonight, while STORMWARDEN's residual risk (is
daily judgment *tense* for a human?) cannot be reduced without human
players. STORMWARDEN is preserved runnable as the fallback; its hardest
assumption (a learnable-but-not-trivial sky) is already de-risked.

## Evidence gained (verified facts unless noted)

- Indirect painted control has real strategic headroom: on identical maps,
  competent verb composition banks 1200/1200 stores with ~680 deaths while
  four lazy doctrines lose in four different instructive ways.
- The economy needs lives to cost food, else meatgrinder play dominates —
  discovered by a failed pre-registered test, fixed, retested.
- Rate-limited food sources force parallel roads — the skill the game
  wants — and make queuing-in-danger lethal (teachable drama).
- Unbounded war conversion bankrupts the economy; capping soldiers at 35%
  creates a managed militarization tradeoff.
- 3,200 agents simulate at ~0.6-1.0 ms/tick headless (60fps headroom).
- STORMWARDEN's sky is learnable: an instrument bot beats persistence by
  +12.4pp on held-out seeds (91.7% vs ~78%) with a skill ceiling — but
  only after adding upstream telegraph stations, which taught us that the
  observation network IS that game's core system.
- [STRONG PROXY] Colony-swarm fantasy has a proven paying audience
  (Empires of the Undergrowth ~16.8k reviews, 94-95% positive) that
  rewards systems over spectacle (photorealistic rival: 854 reviews, 73%).

## What remains assumed (honest)

- **Human fun is untested.** All play verification is scripted. No human
  has felt the painting verb yet. [ASSUMPTION — the single most important
  unknown]
- Session pacing (8-min scenario) is tuned to bots, not people.
- One handcrafted map; replay variation is designed but not built.
- "AI-led studio can sustain content production" — untested beyond tonight.
- Market proxies are from web sources, not our own wishlist/playtest data.

## Commercial hypothesis

- **Audience:** colony-sim / indirect-control strategy players (RimWorld,
  EotU, Factorio-adjacent); ambient-sim streamers.
- **Model & price:** premium, $15-20, no MTX. Demo-first (the single-file
  build shows the demo path is nearly free).
- **Prototype scope (done):** one scenario, one map, three verbs, one
  enemy type, zero third-party assets.
- **Complete launch scope (estimate):** campaign of 15-25 authored
  scenarios across biomes + sandbox mode; 4-6 enemy/fauna types; brood
  throttle + caste verbs; map generator with solvability guarantees;
  audio; Steam wrapper (Electron/Tauri or engine port decision);
  localization; ~12-18 months with the studio model below.
- **Likely production needs:** AI-led design/code continues; needs a
  human artist for a distinctive art direction pass (current look is
  programmer-glow — striking in motion, thin in stills), an audio
  designer/pack, periodic human playtest cohorts, and a porting/QA
  contractor for Steam cert. Financing: small (sub-$100k) or publisher
  demo route.

## Strongest argument FOR continuing

The core verb is real and differentiating: verified emergent depth from a
control scheme no mainstream competitor uses, in a genre whose audience
provably pays for systems — and it produces trailer moments by itself
(see the GIF: a golden economy and a red warband are the same mechanic).

## Strongest argument AGAINST continuing

No human has played it. Indirect control has a known frustration floor
("why won't they GO there") — onboarding mitigates but only a playtest can
retire this risk; if humans bounce off the verb, the concept's whole
premise fails regardless of tonight's systems evidence.

## Next validation experiment

5-10 human playtests of the single-file build (zero install friction).
Measure: do players complete the season within 3 attempts; do they use all
three verbs unprompted; do they restart voluntarily. Kill-signal: majority
quit citing "ants won't obey" after onboarding.

## Recommendation

**CONTINUE WITH CONDITIONS.** Tonight's evidence justifies continued
investment in HIVEMIND development, conditioned on: (1) human playtests of
this build before major content spend; (2) map-variation + brood-throttle
next so depth claims survive beyond one map; (3) an art-direction spike
before any marketing beat. STORMWARDEN remains a credible pivot with its
hardest assumption already proven.
