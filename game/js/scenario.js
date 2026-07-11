// Scenarios: different goal structures over the SAME systems (selected by
// ?scn=). Proving the verb set generalizes beyond one goal shape is the
// point — no new sim tech is allowed here, only scenario-layer pressure.
//
// "The First Season" (default): a RACE — fill the winter quota before time.
//   Growth is good; waves trigger on progress. Tuned so no single lazy verb
//   wins: the quota (1200 net of ~2200 on the map) requires the guarded rich
//   pile AND the distant piles; the colony starts small so the swarm itself
//   must be grown from harvest.
//
// "The Long Drought": an ENDURANCE — survive until the rains return. Piles
//   wither in the sun (unharvested food is LOST), every ant eats upkeep, and
//   the rains must find a seed reserve in the granary. The season rewards
//   growth; the drought punishes it — the brood throttle (FEAR on the nest)
//   moves from optional optimization to the load-bearing decision, because a
//   colony can never shrink, only stop growing. Hunters arrive as the land
//   dies: each pile that dries to dust sends one toward the nest.
export const SCENARIOS = {
  first: {
    key: 'first', name: 'the first season', type: 'gather',
    quota: 1200,            // foodStock to win — demands most of the map
    timeLimit: 480,         // seconds
    colonyFloor: 150,       // lose if colony falls below this after grace
    graceTime: 30,
    // waves trigger on PROGRESS, not clock — success summons the hunters
    waves: [
      { atStores: 300, x: 460, y: 470, tr: 110 },   // presses the bottom lane
      { atStores: 700, x: 350, y: 430, tr: 110 },   // squeezes the nest approaches
      { atStores: 1100, x: 250, y: 250, tr: 100 },  // at the doorstep
    ],
  },
  drought: {
    key: 'drought', name: 'the long drought', type: 'endure',
    timeLimit: 420,         // the rains return
    reserve: 200,           // stores the rains must find — the replanting seed
    colonyFloor: 150,
    graceTime: 40,
    startStock: 160,        // the drought begins with last season's surplus
    upkeep: 0.004,          // food per ant per second — every mouth eats
    upkeepRampT: 90,        // the drought DEEPENS: upkeep fades in over this
                            // window, or the forced early growth curve
                            // (target 250+10t) starves every strategy by t≈60
                            // before any economy can spin up (measured)
    evap: 0.8,              // food per second the sun takes from each live pile
  },
};

export let SCENARIO = SCENARIOS.first;
export function selectScenario(key) {
  SCENARIO = SCENARIOS[key] || SCENARIOS.first;
  return SCENARIO;
}

export function makeScenarioState() {
  return { over: false, won: false, reason: '', wavesSpawned: 0, endStats: null };
}

function spawnHunter(sim, world, wx, wy, tr) {
  world.spiders.push({
    x: wx, y: wy, hx: wx, hy: wy, tr,
    hp: 260, maxhp: 260, a: world.rng() * 6.28, alive: true, arrived: sim.time,
  });
}

// place a wave on the road to the busiest remaining pile, never on the nest
function pressPoint(sim, world) {
  const target = [...world.piles].sort((a, b) => (b.taken || 0) - (a.taken || 0))[0] || world.piles[0];
  const t = 0.4 + world.rng() * 0.25;
  const px = world.nest.x + (target.x - world.nest.x) * t;
  const py = world.nest.y + (target.y - world.nest.y) * t;
  const ang = world.rng() * Math.PI * 2, off = 50 + world.rng() * 90;
  let wx = Math.max(60, Math.min(1220, px + Math.cos(ang) * off));
  let wy = Math.max(60, Math.min(660, py + Math.sin(ang) * off));
  if (Math.hypot(wx - world.nest.x, wy - world.nest.y) < 240) {
    const a2 = Math.atan2(wy - world.nest.y, wx - world.nest.x);
    wx = world.nest.x + Math.cos(a2) * 260; wy = world.nest.y + Math.sin(a2) * 260;
  }
  return [wx, wy];
}

function updateGather(sc, sim, world, S) {
  const alive = sim.count - (sim.freeList ? sim.freeList.length : 0);

  // reinforcement waves — summoned by the colony's own success
  while (sc.wavesSpawned < S.waves.length && sim.foodStock >= S.waves[sc.wavesSpawned].atStores) {
    const w = S.waves[sc.wavesSpawned];
    let wx = w.x, wy = w.y;
    if (world.seed !== 7) [wx, wy] = pressPoint(sim, world);
    spawnHunter(sim, world, wx, wy, w.tr);
    sc.wavesSpawned++;
  }

  if (sim.foodStock >= S.quota) {
    sc.over = true; sc.won = true; sc.reason = 'The stockpile is full. The colony will outlive the winter.';
  } else if (sim.time > S.graceTime && alive < S.colonyFloor) {
    sc.over = true; sc.won = false; sc.reason = 'The colony dwindled below survival. The nest falls silent.';
  } else if (sim.time >= S.timeLimit) {
    sc.over = true; sc.won = false; sc.reason = `Winter came. ${Math.round(sim.foodStock)} of ${S.quota} stores gathered.`;
  }
}

function updateEndure(sc, sim, world, S, dt) {
  const alive = sim.count - (sim.freeList ? sim.freeList.length : 0);

  // every mouth eats — the colony pays for its own size, and the toll
  // deepens with the drought (full price from upkeepRampT onward)
  const eff = S.upkeep * Math.min(1, sim.time / S.upkeepRampT);
  sim.foodStock = Math.max(0, sim.foodStock - alive * eff * dt);

  // the sun takes what the colony does not; a pile that dries to dust sends
  // a desperate hunter toward the last living ground (the nest approaches)
  for (const p of world.piles) {
    if (p.amount > 0) p.amount = Math.max(0, p.amount - S.evap * dt);
    if (p.amount <= 0 && !p.dusted) {
      p.dusted = true;
      const [wx, wy] = pressPoint(sim, world);
      spawnHunter(sim, world, wx, wy, 105);
      sc.wavesSpawned++;
    }
  }

  const stock = Math.round(sim.foodStock);
  if (sim.time >= S.timeLimit) {
    sc.over = true;
    sc.won = sim.foodStock >= S.reserve;
    sc.reason = sc.won
      ? `The rains return. ${stock} stores remain — the colony replants.`
      : `The rains return, but only ${stock} of ${S.reserve} stores remain. Too little seed to replant.`;
  } else if (sim.time > S.graceTime && alive < S.colonyFloor) {
    sc.over = true; sc.won = false; sc.reason = 'The colony dwindled below survival. The nest falls silent.';
  } else if (sim.time > S.graceTime && sim.foodStock <= 0) {
    sc.over = true; sc.won = false; sc.reason = 'The granary ran dry. The colony starves in the dust.';
  }
}

export function updateScenario(sc, sim, world, dt = 1 / 60) {
  if (sc.over) return;
  const S = SCENARIO;
  if (S.type === 'endure') updateEndure(sc, sim, world, S, dt);
  else updateGather(sc, sim, world, S);

  if (sc.over && !sc.endStats) {
    const alive = sim.count - (sim.freeList ? sim.freeList.length : 0);
    sc.endStats = {
      won: sc.won,
      reason: sc.reason,
      foodStock: Math.round(sim.foodStock),
      gathered: sim.foodBanked,
      broodSpent: Math.round(sim.broodSpent),
      died: sim.antsDied,
      spidersSlain: sim.spidersKilled,
      time: +sim.time.toFixed(1),
      colony: alive,
    };
  }
}
