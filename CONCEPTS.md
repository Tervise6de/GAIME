# CONCEPTS

## Stage 1 — Market scan (2026-07-10, timeboxed)

Sources: web search over industry analyses, Steam store/DB pages, 2025
year-in-review coverage. Classified per protocol evidence classes.

- **Revenue polarization is extreme** — hits or near-zeros, thin middle;
  marketing now consumes 30–50% of indie budgets. Implication: the concept
  itself must be self-marketing (screenshot/clip communicates the hook).
  [STRONG PROXY — multiple independent industry analyses]
- **Simulation/sandbox and colony-sim audiences are growing, loyal and less
  price-sensitive**, with long-tail revenue. [STRONG PROXY — industry reports]
- **"Play with friends" was 2025's most reliable viral predictor** (PEAK
  ~15.7M units; Schedule 1). Co-op is heavy production burden for an
  AI-led solo studio → treat as a *later* option, not a launch bet.
  [STRONG PROXY for the pattern; ASSUMPTION that we can defer it]
- **Quality + fair price + word-of-mouth beat marketing spend** in 2025
  breakouts; several arrived quietly. [WEAK-TO-MODERATE PROXY]
- **Swarm/colony fantasy has a proven audience wanting SYSTEMS, not skin:**
  Empires of the Undergrowth ≈16.8k reviews, 94–95% positive
  ("Overwhelmingly Positive"), pheromone-driven; big-budget photorealistic
  direct-control Empire of the Ants: 854 reviews, 73%, players evaporated
  post-launch. [STRONG PROXY]
- **Serious weather-forecasting games essentially do not exist on Steam** —
  only a small arcade gadget-puzzle ("Weatherman") and educational toys.
  Open niche cuts both ways: opportunity or absent demand. [VERIFIED FACT
  that the niche is near-empty; UNKNOWN whether demand exists]
- **Papers-Please-like expertise sims** persist as a devoted niche (Papers
  Please itself multi-million seller; Death and Taxes, No Umbrellas Allowed
  sustain it). [STRONG PROXY for Papers Please; WEAK PROXY for the tail]
- From training knowledge, flagged as such: Noita (every-pixel-simulated
  falling-sand world) sold 1M+ and is a cult hit — "fully simulated world"
  is a proven hook. [STRONG PROXY, dated]

## Stage 2 — Concept slate (12)

All evaluated against the fifteen protocol criteria, concisely.

### C01 — HIVEMIND (pheromone painter)
- Player fantasy: BE a colony's collective will — thought made of thousands of bodies.
- Core interaction: paint/erase persistent pheromone fields (lure, fear, harvest, war) that thousands of autonomous agents obey; you never select a unit.
- Intended audience: colony-sim + RTS players (EotU, RimWorld, Factorio-adjacent).
- Reason to notice: screenshots of luminous swarm-rivers flowing through terrain.
- Reason to buy: proven colony fantasy with a genuinely new control verb.
- Reason to stream: emergent battles/disasters; chat can suggest paint strategies.
- Comparable games: Empires of the Undergrowth, RimWorld (indirectness), flow-field toys.
- Differentiation: indirect field-painting control at swarm scale; EotU is mission-RTS with more direct verbs.
- Screenshot/trailer potential: excellent — flows, trails, mass battles.
- Price/model hypothesis: $15–20 premium, no MTX.
- Prototype scope: 2D canvas, 3–5k agents, 3 field types, forage+threat scenario.
- Launch scope: campaign of ecological scenarios + sandbox; species variety; save systems.
- Hardest design risk: indirect control feels mushy — players want to point at things.
- Hardest production risk: perf at swarm scale + AI legibility across many biomes.
- Cheapest falsification test: build the painter; if deliberate painting can't reliably beat naive blob-painting on a forage/defend scenario, the verb is hollow.

### C02 — STORMWARDEN (frontier forecaster)
- Player fantasy: be the town's trusted meteorologist — the expert whose skill keeps people alive.
- Core interaction: read instruments/sky, place sensors, issue daily forecasts with confidence levels; a real simulated atmosphere resolves them; reputation and lives ride on calls.
- Intended audience: Papers-Please/expertise-sim players, weather nerds, cozy-with-stakes sim players.
- Reason to notice: "Papers, Please but you're a frontier weather forecaster" is a one-line pitch.
- Reason to buy: nothing like it exists; competence fantasy with consequences.
- Reason to stream: nightly forecast = built-in prediction drama; chat bets against the streamer.
- Comparable games: Papers Please (structure), Frostpunk (weather as antagonist), Weatherman (arcade only).
- Differentiation: systemic truth-sim under the forecasts — not scripted levels; you get better by actually learning the sky.
- Screenshot/trailer potential: good — storm fronts crossing a hand-drawn map, isobars, dramatic warnings.
- Price/model hypothesis: $12–18 premium.
- Prototype scope: 2D atmosphere toy-sim (pressure cells, fronts, moisture), 3 instruments, forecast+scoring loop, one town.
- Launch scope: career across seasons/regions, station upgrades, narrative townsfolk, disasters.
- Hardest design risk: forecasting reduces to coin-flips or spreadsheet tedium — no skill gradient.
- Hardest production risk: tuning a sim that is learnable but not trivial; communicating atmosphere visually.
- Cheapest falsification test: build sim + instruments; if an instrument-informed strategy cannot significantly beat persistence forecasting ("tomorrow = today"), there is no skill to master.

### C03 — GRAINSIEGE (falling-sand siege engineering)
- Player fantasy: siege engineer in a world where every grain of sand, drop of water and ember is real.
- Core interaction: dig, dam, pour, burn and collapse simulated material to attack/defend structures.
- Intended audience: Noita/Terraria physics-sandbox players, engineering gamers.
- Reason to notice: physics spectacle GIFs (dam bursts, tunnel collapses).
- Reason to buy: Noita's world-sim hook in a buildy/tactical frame instead of roguelite.
- Reason to stream: plans fail spectacularly; emergent physics comedy.
- Comparable: Noita, Terraria, Bad North (readable siege).
- Differentiation: falling-sand tech applied to siege/defense rather than roguelite spelunking.
- Screenshot/trailer: excellent (flowing destruction).
- Price/model: $15 premium.
- Prototype scope: CA sim (sand/water/stone/fire) + dig/build verbs + one siege scenario.
- Launch scope: campaign, materials tech tree, enemy diggers, level editor.
- Hardest design risk: physics chaos erases player intent; optimal play ignores physics.
- Hardest production risk: CA performance and stability at playable map sizes.
- Cheapest falsification test: if damming/undermining is not decisively better than brute force in a scripted siege, engineering depth is illusory.

### C04 — LUMEN CARTEL (light as territory)
- Player fantasy: lightkeeper reclaiming a city from living darkness.
- Core interaction: place/aim lights, mirrors, prisms; light propagation IS your territory and supply line.
- Audience: strategy-puzzle players; atmosphere lovers.
- Notice: raycast god-rays vs encroaching dark — striking stills.
- Buy: territory-as-light is a fresh strategic substrate. Stream: tense sieges of shadow.
- Comparables: Frostpunk (heat rings), tower defense (adjacent), nothing direct.
- Differentiation: continuous optics vs discrete towers.
- Screenshot/trailer: excellent. Price: $15.
- Prototype: 2D raycasting + dark creature pressure + optics placement.
- Launch: campaign, optics tech, dark ecology. 
- Design risk: reduces to tower defense with lamps.
- Production risk: performant 2D lighting at scale.
- Falsification: if optics choices (angles, bounces) don't outperform naive lamp-spam, it's TD in disguise.

### C05 — CHIMERA WORKS (living-machine veterinarian)
- Fantasy: surgeon-mechanic for creatures that are half organism, half engine.
- Core: diagnose via symptoms/instruments, open panels, splice organs/parts under vital-sign pressure.
- Audience: job-sim + body-horror-lite fans (PowerWash/Surgeon hybrid seekers).
- Notice/buy/stream: weird patients; each is a story; "what's wrong with THIS one".
- Comparables: Surgeon Simulator, PC Building Sim, Bugsnax-adjacent whimsy.
- Differentiation: systemic diagnosis (causal fault chains), not QTE slapstick.
- Screenshot/trailer: strong character-driven stills. Price: $15–20.
- Prototype: one creature, fault-chain system, 3 instruments, repair loop.
- Launch: patient variety, clinic economy, story. 
- Design risk: diagnosis collapses into checklist tedium.
- Production risk: content appetite — each patient is bespoke art+logic.
- Falsification: if generated fault-chains aren't distinguishable by instruments alone (blind test), diagnosis is fake.

### C06 — DEEP ROOT (growth engineering)
- Fantasy: architect of living wood — you grow fortresses, not build them.
- Core: plant seeds, direct/prune/graft growth under structural physics and weather.
- Audience: builder/physics players (Poly Bridge, Timberborn).
- Notice: timelapse growth GIFs. Buy: "grow it" verb is new. Stream: collapse comedy + beauty.
- Comparables: Timberborn, Poly Bridge, (aesthetic) Sable? none direct.
- Differentiation: construction via biological growth vs placement.
- Screenshot/trailer: excellent. Price: $18.
- Prototype: L-system growth + pruning/grafting + load physics + one goal structure.
- Launch: biomes, species, campaign, sandbox.
- Design risk: growth control too indirect → frustration.
- Production risk: physics+growth interaction stability.
- Falsification: if guided growth can't reliably hit structural targets a placement-builder trivially hits, the verb fights the player.

### C07 — THE INTERPRETER (first-contact translator)
- Fantasy: the only human who can talk to them.
- Core: decode alien grammar live during tense negotiations; wrong glosses have consequences.
- Audience: Chants of Sennaar / Heaven's Vault / Outer Wilds-brain players.
- Notice/buy/stream: "solve a language under pressure"; strong critic bait.
- Comparables: Chants of Sennaar (hit), Heaven's Vault.
- Differentiation: real-time stakes vs contemplative archaeology.
- Screenshot/trailer: moderate (UI-heavy).
- Price: $18. Prototype: mini-language generator + negotiation scene + gloss UI.
- Launch: authored story, multiple languages — heavy content.
- Design risk: linguistics puzzle too hard/too fake.
- Production risk: handcrafted narrative content volume (worst on slate).
- Falsification: if testers/scripted solvers can't converge on meanings from context alone, the core loop is unlearnable.

### C08 — UNDERTOW (tide commander)
- Fantasy: command the sea itself; ships are pawns, water is your hand.
- Core: shape tides/currents to strand, steer, wreck and rescue vessels.
- Audience: strategy/physics players; naval fans underserved by direct-control naval games.
- Notice: whirlpools swallowing fleets. Buy: control-the-medium is fresh. Stream: emergent disasters.
- Comparables: none direct; (From Dust ancestry).
- Differentiation: you never steer a ship.
- Screenshot/trailer: strong. Price: $15.
- Prototype: 2D shallow-water-ish flow + buoyant ships + one interdiction scenario.
- Launch: campaign, weather, factions.
- Design risk: indirect control frustration (same family as C01 but harsher physics).
- Production risk: believable-yet-cheap water sim.
- Falsification: if current-shaping can't achieve precise outcomes (dock THIS ship, wreck THAT one), it's a toy not a game.

### C09 — BODY POLITIC (organ city)
- Fantasy: govern a city that is literally alive — districts are organs.
- Core: zone/route metabolism (blood=logistics, nerves=info); city illness = systemic crises.
- Audience: city-builder players wanting novelty (Islanders→Frostpunk spectrum).
- Notice: pulsing organic city map. Buy: city builder where the map fights back.
- Comparables: SimCity-likes, Frostpunk (crisis structure).
- Differentiation: circulatory logistics + disease as core loop, not skinned zoning.
- Screenshot/trailer: strong but gross-out risk. Price: $20.
- Prototype: vascular flow network + zoning + one illness crisis.
- Launch: full campaign, organ variety, endocrine "policy" systems.
- Design risk: metabolism = reskinned utilities; novelty evaporates.
- Production risk: simulation depth vs readability.
- Falsification: if the vascular network adds no decisions beyond standard road/pipe logic in prototype, it's a skin.

### C10 — NULL CARRIER (signal smuggler)
- Fantasy: ghost in the network — smuggle forbidden data past a listening empire.
- Core: shape traffic (split, delay, disguise, reroute packets) through a living network under adaptive inspection.
- Audience: Uplink/hacking-fantasy + puzzle-strategy players.
- Notice/buy: hacking fantasy without minigame fakery. Stream: heist tension.
- Comparables: Uplink, Hacknet, Mindustry (flows).
- Differentiation: logistics-of-secrecy vs terminal cosplay.
- Screenshot/trailer: moderate (abstract). Price: $15.
- Prototype: network graph + traffic sim + inspection AI + one smuggling run.
- Launch: campaign, escalating counter-intelligence, endless mode.
- Design risk: abstraction reads as spreadsheet; stealth without body.
- Production risk: legibility of invisible systems.
- Falsification: if scripted "clever" routing doesn't beat brute-force spam against the inspector, stealth depth is fake.

### C11 — SHEPHERD MOON (gravity herder)
- Fantasy: celestial shepherd — herd asteroid flocks with gravity itself.
- Core: place/move gravity wells to steer thousands of rocks into orbits, collisions, structures.
- Audience: physics-toy + ambient-strategy players (Universe Sandbox curiosity, but gamified).
- Notice: n-body murmurations. Buy: tactile cosmic power. Stream: oddly satisfying + disasters.
- Comparables: Universe Sandbox (toy), no game-shaped competitor.
- Differentiation: gravity as continuous verb with goals.
- Screenshot/trailer: excellent. Price: $12–15.
- Prototype: 2D n-body-lite + well placement + capture/deliver scenario.
- Launch: campaign of celestial engineering contracts, hazards.
- Design risk: chaos → outcomes feel unauthored; skill unclear.
- Production risk: perf fine; content variety unclear.
- Falsification: if skilled well-placement can't hit delivery targets consistently vs random placement, no mastery exists.

### C12 — MIDNIGHT ZONING (two cities, one map)
- Fantasy: planner of a city that transforms at night — two societies share one space.
- Core: zone day-city and night-city on the same parcels; conflicts (noise, traffic, crime, economy) emerge from overlap.
- Audience: city-builder + puzzle-strategy players.
- Notice: day/night flip reveal. Buy: genuinely new planning constraint. Stream: "my night market ruined the school district".
- Comparables: city builders; (thematically) NIMBY debates.
- Differentiation: temporal multiplexing of space as THE mechanic.
- Screenshot/trailer: strong flip moments. Price: $18.
- Prototype: grid zoning + two overlapping demand/conflict sims + flip view.
- Launch: full builder systems, factions, campaign.
- Design risk: overlap conflicts too abstract to feel.
- Production risk: two full sims coupled = big.
- Falsification: if prototype conflicts don't force real tradeoffs (both cities optimizable independently), the premise is decoration.

## Stage 3 — Finalists

**Finalist A: C01 HIVEMIND** — strongest conventional case: proven loyal
audience (EotU evidence), spectacular visual communication, feasible
prototype, genuinely distinctive control verb.

**Finalist B: C02 STORMWARDEN** — the preserved unconventional
high-conviction pick: near-empty niche, one-line pitch, streamable
prediction drama, competence-with-consequences fantasy. Conventional
scoring is weaker (demand UNKNOWN) — kept deliberately per protocol.

Substantially different: power fantasy vs responsibility fantasy; painting
continuous fields vs reading and committing to discrete predictions;
real-time emergence vs daily judgment loop.

Runner-up preserved in backlog: C03 GRAINSIEGE (strong, but its hook
overlaps Noita's proven territory more than it differentiates).

Full reasoning and evidence classes: see DECISION_LOG.md 2026-07-10.
