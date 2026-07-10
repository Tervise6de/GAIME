# MORNING_REPORT

Play or view the build before reading the analysis.

*(Current as of 2026-07-10 ~21:35 UTC. Overnight run reached WINNER_DEVELOPMENT
— Stage 6. If a later session ran, it will have refreshed this file.)*

## What the game is

**STORMWARDEN** — a frontier weather-forecasting expertise sim. You are the
town's meteorologist. You read instruments and place upwind sensors, then each
day commit a **3-day outlook** (tomorrow, +2, +3) with a confidence level. A
real, simulated atmosphere — pressure systems drifting in on the wind — resolves
your calls. Storms you fail to warn cost lives; your reputation is your score.
One-line pitch: *"Papers, Please, but you're a frontier weather forecaster."*

## What was actually built

A playable, instrumented browser prototype (vanilla JS + Canvas 2D, zero runtime
deps) plus a node-native evidence harness. Two finalists were prototyped; the
winner was chosen on implementation evidence and then developed through Stage 6.

- A systemic **truth atmosphere**: signed pressure systems (highs + moisture-
  carrying lows) advect east on a meandering prevailing wind; the town's daily
  weather (CLEAR/CLOUDY/RAIN/STORM) is read from their superposition.
- **Instruments**: barometer + tendency, hygrometer, thermometer, wind vane, and
  **placeable upwind sensors** (the core verb).
- A playable loop: **place 3 sensors → each day commit a 3-day outlook → reveal
  and score.** Confidence decays with lead; each horizon is scored against the
  weather that many days later.
- Falsification harnesses (no browser): `tools/season.mjs`, `tools/placement.mjs`,
  `tools/leadtime.mjs`, `tools/tradeoff.mjs`. The browser build reproduces the
  harness numbers exactly.
- The other finalist, **HIVEMIND**, is preserved runnable as the fallback.

## How to run it

```
# from the repo root
python3 -m http.server 8137
# then open in a browser:
#   http://localhost:8137/prototypes/stormwarden/index.html   (the winner)
#   http://localhost:8137/prototypes/hivemind/index.html      (fallback)
```
Headless evidence (Node ≥ 18; run `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install`
once for the browser tools):
```
node tools/season.mjs 60          # instrument skill vs persistence/climatology
node tools/placement.mjs 60       # skilled vs naive sensor placement
node tools/leadtime.mjs 90        # skill vs forecast lead time
node tools/tradeoff.mjs 90        # near/far placement tradeoff, per lead
```

### Controls (STORMWARDEN)
- **Click the map** to place 3 sensors. Weather comes from the WEST — a sensor on
  the dashed "tomorrow's air" ring warns 1 day out; a sensor placed farther west
  buys 2–3 days of warning but reads noisier. **SPACE** begins the season.
- Each day: **TAB** cycles the horizon (TOMORROW / +2 / +3), **1–4** set that
  horizon's sky (CLEAR/CLOUDY/RAIN/STORM), **Q/W/E** set confidence, **SPACE**
  issues the outlook and advances a day. Season = 60 days.

## Visual evidence (`media/proto/`)
- `sw_front.png` / `sw_storm.png` — **the core hook**: a violet storm front
  visibly advecting onto the town, barometer falling, upwind sensor already
  reading STORM. A stranger understands the pitch from this still.
- `sw_place.png` — the sensor-placement decision (the "tomorrow's air" ring).
- `sw_outlook.png` — the 3-day outlook loop with live per-lead accuracy.
- `sw_forecast.png` — a clearing day, the daily judgment.
- `sw_scorecard.png` — end-of-season scorecard (accuracy by lead, storms
  warned/missed, reputation grade).
- (No GIF: this environment has no image/video tooling. A storm-approach clip
  is a quick next step once tooling is available — the two hook stills above
  already show the front advecting onto the town across two days.)

## The two prototypes & why STORMWARDEN won
- **HIVEMIND** (pheromone-painting swarm command): its pre-registered
  falsification FAILED on its own metric; the control verb only showed value
  after an in-run economy reframing, and a naive strategy stayed competitive.
  Real but messier, conditional evidence. Better-evidenced *audience* (Empires
  of the Undergrowth), higher visual/responsiveness ceiling.
- **STORMWARDEN**: its hardest assumption PASSED cleanly and decisively, first
  tuned run, across 5 seeds, no metric redefinition. Chosen on the Stage-5
  criteria (is the promise present in play? meaningful decisions? clarity?
  production burden?), where it leads. HIVEMIND kept as the fallback.

## Evidence gained — proven vs assumed
**Actually proven (VERIFIED FACT, in-sim, 5 seeds):**
- Instrument-informed forecasting beats the persistence null ("tomorrow = today")
  by Brier Skill Score **+0.628** / +25 pts accuracy — a real skill gradient.
- The skill lands on the stakes: instrument misses ~0.2 storms/season;
  persistence misses ~2.4; climatology misses every one.
- **Sensor placement is a real decision**: skilled (upwind) beats naive (on-town)
  by BSS **+0.453** / +14 pts.
- **Depth exists**: skill decays gracefully with lead time (+1/+2/+3d BSS
  +0.75/+0.63/+0.53) — long-range is a harder, still-beatable skill tier.
- **The placement tradeoff is genuine**: all-far sensors win the +3d outlook but
  are worse than persistence at tomorrow; near sensors win tomorrow and collapse
  at range. Specialize-vs-hedge is a real choice.
- The loop is playable end-to-end with no errors (driven via Playwright).

**Strong proxy (external):** the *structural* genre sells (Papers Please,
multi-million). Colony/systems audiences are loyal (EotU).

**Still assumed / UNKNOWN:** whether real players *want* a forecasting game
(near-empty Steam niche — opportunity or absent demand); whether the loop is
*fun* for humans (AI cannot judge this); whether depth sustains over many hours;
whether the confidence/consequence layer feels dramatic rather than clerical.

## Intended audience
Papers-Please / expertise-sim players, weather and systems enthusiasts,
cozy-with-stakes sim players, and streamers (a nightly forecast is built-in
prediction drama — chat can bet against the call).

## Price & business model
Premium, one-time purchase **$12–18**, no microtransactions. Career/season
content and region packs are the natural post-launch axis. (Hypothesis, not
validated.)

## Prototype scope vs launch scope
- **Prototype (done):** one town, one systemic atmosphere, placeable sensors,
  a 3-day outlook loop, storm-warning consequences, a 60-day season.
- **Launch:** career across seasons and regions with distinct climates; a scarce
  sensor **budget/upgrade economy**; richer sim (evolving/merging fronts,
  seasonality); narrative townsfolk who act on warnings; disasters; a visual
  identity pass (hand-drawn frontier map, isobars, warning flags); onboarding.

## Likely production needs
Small team. A designer/sim-tuner (learnable-but-not-trivial balance is the craft),
an artist for the frontier/map identity and UI, light audio, and part-time
narrative. Tech is modest (2D). The hard part is content and tuning, not engineering.

## Verdict
- **Strongest argument FOR continuing:** every hardest *gameplay* assumption we
  could test cheaply PASSED — real skill, a real placement decision, graceful
  depth, a genuine tradeoff — in a distinctive, near-empty niche with a sharp
  one-line hook and screenshot-legible drama. The core loop is not hollow.
- **Strongest argument AGAINST:** demand is UNKNOWN and unfaked. "No comparable
  exists" may mean *no audience*, not *open lane*. AI cannot prove fun or market;
  everything proven is in-sim, not in front of humans. Expert +1d accuracy (~91%)
  risks being too easy if the sim isn't deepened.
- **Next validation experiment:** a **real-audience demand test** — a Steam-style
  capsule + one-line pitch + a 10-second storm-approach clip, put in front of
  actual target players (wishlist/click-through signal). This is the one thing
  that gates further investment and the one thing AI cannot self-supply.
- **Recommendation: CONTINUE WITH CONDITIONS.** The gameplay core is validated
  enough to justify building toward a wishlist-ready Steam page — but hold heavy
  investment until the demand test returns a real signal. If it comes back weak,
  **PIVOT to the preserved HIVEMIND**, whose audience is already evidenced.
