# MORNING_REPORT

Play or view the build before reading the analysis.

## How to play (2 minutes to first road)

**Fastest (any OS, incl. Windows):** download/open `game/dist/HIVEMIND.html`
— a single self-contained file; double-click it, it runs in any browser.
Verified to produce identical results to the served version.

**From a checkout:** `python3 -m http.server 8123` in the repo root, then
open http://localhost:8123/game/index.html

**Controls:** paint with LEFT mouse, erase with RIGHT. `1` LURE (roads),
`2` FEAR (walls), `3` RALLY (warbands). Mouse wheel = brush size, `P` =
pause. Click to begin. The game teaches the rest contextually.

Sound: procedural WebAudio (soft delivery ticks, a thud on each hunter kill,
a swell as reinforcement waves arrive) unlocks on your first click. It is
guarded and asset-free; levels still want a human tuning pass.

**Watch instead:** `media/gameplay_gen_seed5462.webm` (~2 min of competent
play on a procedurally-GENERATED territory). Hero stills, all from generated
maps: `media/morning_gen_mid.png` (branching scent-roads + WAR assault at 63%
stores) and `media/gen_clip_battle.png` (a guard assault mid-strike). Older
seed-7 assets: `media/hivemind.gif` (13s battle clip),
`media/gameplay_commander_seed7.webm`, `media/shot_*.png`. All captured this
morning from the current build; every referenced run is a bot WIN.

## What the game is

**HIVEMIND** — you are the collective will of an ant colony, but you never
select or order a single ant. You paint persistent scent fields on the
world — LURE roads, FEAR walls, RALLY warbands — and thousands of
autonomous ants respond to what they can smell a few steps ahead. The
fantasy: *the colony is not yours to command, only to persuade.* First
scenario: bank 1200 stores before winter (8 min) while your own success
summons hunters onto your roads.

## What was actually built (across the overnight runs)

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
5. **Map generalization + winnability proof (latest run):** a hand-authored
   map is no longer the only one. A map-agnostic "commander" bot (BFS
   pathfinding for scent-roads + a scripted guard assault) plays ANY
   generated territory; swept over 84 generated seeds it wins ~84.5% while
   naive/idle play loses on all of them — the maps are provably beatable by
   competent play AND punish weak play. Difficulty proved EMERGENT (no cheap
   geometry metric predicts it), so "new territory" ships a 62-seed pool
   pre-screened by that bot — players never get a map the bot itself can't
   beat. Plus a juice pass (delivery pulse, hunter death-burst, procedural
   WebAudio), all cosmetic and provably not touching the deterministic sim.

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
- The depth generalizes beyond the hand-tuned map: a single map-agnostic
  bot wins ~84.5% of 84 procedurally-generated territories (deterministic),
  and the same weak-play doctrines lose on generated maps too — so the
  strategic headroom is a property of the SYSTEM, not one authored level.
  (Honest caveat: the ~15.5% the bot loses are largely its own weakness on
  far-guard maps, not proof those maps are unwinnable; two attempts to fix
  the bot were reverted because they cost more colony than they gained. The
  shipped pool simply excludes them.)

## What remains assumed (honest)

- **Human fun is untested.** All play verification is scripted. No human
  has felt the painting verb yet. [ASSUMPTION — the single most important
  unknown]
- Session pacing (8-min scenario) is tuned to bots, not people.
- Replay variation now EXISTS and is bot-verified (62-seed vetted pool of
  generated maps), but felt-difficulty variance across those maps is wide
  (bot win-time 139-479s) and un-normalized beyond "the bot can beat it" —
  humans may find some pooled maps much harder than others.
- Growth economy is still automatic — no player brood-throttle decision yet
  (identified as the top remaining depth lever).
- "AI-led studio can sustain content production" — untested beyond these runs.
- Market proxies are from web sources, not our own wishlist/playtest data.

## Commercial hypothesis

- **Audience:** colony-sim / indirect-control strategy players (RimWorld,
  EotU, Factorio-adjacent); ambient-sim streamers.
- **Model & price:** premium, $15-20, no MTX. Demo-first (the single-file
  build shows the demo path is nearly free).
- **Prototype scope (done):** one scenario type, one hand-authored map plus a
  procedural generator with fairness guarantees and a 62-map bot-vetted pool,
  three verbs, one enemy type, zero third-party assets.
- **Complete launch scope (estimate):** campaign of 15-25 authored
  scenarios across biomes + sandbox mode; 4-6 enemy/fauna types; brood
  throttle + caste verbs; map generator with solvability guarantees
  (fairness guarantees + bot-winnability screening now PROTOTYPED — the
  generator and oracle exist; difficulty normalization is the open piece);
  audio (procedural layer prototyped; needs a designed pass); Steam wrapper
  (Electron/Tauri or engine port decision); localization; ~12-18 months with
  the studio model below.
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

**CONTINUE WITH CONDITIONS.** The evidence justifies continued investment in
HIVEMIND development, conditioned on: (1) human playtests of this build
before major content spend — still the decisive unretired risk; (2)
brood-throttle (the last big depth lever) + difficulty normalization of the
generated-map pool, since map-variation itself is now built and its depth
bot-verified beyond one map; (3) an art-direction spike before any marketing
beat. STORMWARDEN remains a credible pivot with its hardest assumption
already proven.

*(Report refreshed after the map-generalization run: winnability is now a
system property, not a one-map claim; the top unknown — human fun — is
unchanged. The single most useful next action remains a human playtest of
`game/dist/HIVEMIND.html`.)*
