# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Current stage:** WINNER_DEVELOPMENT (Stage 6). Stages 1–5 complete.
- **Winner:** C02 STORMWARDEN — a frontier weather-forecasting expertise sim.
  Read instruments + upwind sensors, forecast tomorrow with confidence, a real
  simulated atmosphere resolves it, lives/reputation ride on the call.
- **Fallback:** C01 HIVEMIND, preserved and runnable at `prototypes/hivemind/`.
  Pivot target ONLY if a real-audience demand test comes back weak.
- **What changed this session:** Built the STORMWARDEN prototype (Stage 4b) and
  ran its falsification: instrument-informed forecasting beats the persistence
  null by Brier Skill Score +0.628 / +25 pts accuracy across 5 seeds (PASS).
  Ran Stage 5 comparison → STORMWARDEN wins on implementation evidence. Then
  Stage 6: made "place your sensors" the real, playable core decision — skilled
  placement beats naive by BSS +0.453 / +14 pts, with an emergent
  lead-time-vs-meander-coverage metagame. All VERIFIED FACT; demand still UNKNOWN.
- **Build status:** runnable, no errors.

## How to run

- Serve the repo root: `python3 -m http.server 8137`
- Play (human): open
  `http://localhost:8137/prototypes/stormwarden/index.html`
  Controls: click the map to place 3 sensors (weather blows in from the WEST —
  a sensor on the dashed "tomorrow's air" ring warns 1 day out; a sensor placed
  farther west buys 2–3 days of warning but reads noisier) → SPACE to begin →
  then each day set a 3-day OUTLOOK: TAB picks a horizon (TOMORROW / +2 / +3),
  keys 1–4 set that horizon's sky (CLEAR/CLOUDY/RAIN/STORM), Q/W/E set
  confidence (it decays with lead), SPACE issues the outlook and advances a day.
  Each horizon is scored against the weather that many days later. Season = 60 days.
- Fallback (HIVEMIND): `http://localhost:8137/prototypes/hivemind/index.html`
- Headless falsification (no browser):
  `node tools/season.mjs 60 7,11,23,42,101`   (skill vs persistence/climatology)
  `node tools/placement.mjs 60 7,11,23,42,101` (skilled vs naive sensor placement)
- Headless browser run / screenshots: `node tools/run_proto.mjs <url> [--max s]
  [--out f.png] [--shots t:f.png,...]`. View a specific day:
  `...stormwarden/index.html?view=1&seed=42&day=52`. Install deps first:
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install`.
- Screenshots so far: `media/proto/sw_place.png` (sensor placement),
  `sw_outlook.png` (3-day outlook loop), `sw_forecast.png` (daily loop),
  `sw_scorecard.png` (season closure), `sw_front.png` / `sw_storm.png` (the
  hook: a storm front advecting onto the town).
- Playable loop is now complete with closure: place sensors → daily 3-day
  outlook → end-of-season scorecard (accuracy by lead, storms warned/missed,
  reputation grade). Season length via `?days=N`, seed via `?seed=N`.

## Next three actions

1. Add a scarce-sensor ECONOMY/upgrade path so placement compounds across a
   career (buy/move/upgrade sensors, better instruments).
2. Deepen the truth sim (named evolving fronts, a 2–3 day outlook) to keep
   expert play fallible; re-measure the novice→expert skill gap after each change.
3. Prepare a real-audience DEMAND test (capsule + one-line pitch + storm-front
   clip) — the dominant open risk; it needs actual humans, not AI judgment.

- **Last known good commit:** 41fecac (playable 3-day outlook + sensor
  placement; both prototypes runnable; season/placement/leadtime harnesses
  green; verified end-to-end via Playwright).
