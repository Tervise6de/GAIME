// Scenario: goal structure, escalation, win/lose. "The First Season".
// Tuned so that no single lazy verb wins: the quota (1100 net of ~2200 on
// the map) requires the guarded rich pile AND the distant piles; the waves
// march hunters onto the nest's doorstep and must be answered; the colony
// starts small so the swarm itself must be grown from harvest.
export const SCENARIO = {
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
};

export function makeScenarioState() {
  return { over: false, won: false, reason: '', wavesSpawned: 0, endStats: null };
}

export function updateScenario(sc, sim, world) {
  if (sc.over) return;
  const alive = sim.count - (sim.freeList ? sim.freeList.length : 0);

  // reinforcement waves — summoned by the colony's own success
  while (sc.wavesSpawned < SCENARIO.waves.length && sim.foodStock >= SCENARIO.waves[sc.wavesSpawned].atStores) {
    const w = SCENARIO.waves[sc.wavesSpawned];
    world.spiders.push({
      x: w.x, y: w.y, hx: w.x, hy: w.y, tr: w.tr,
      hp: 260, maxhp: 260, a: world.rng() * 6.28, alive: true, arrived: sim.time,
    });
    sc.wavesSpawned++;
  }

  if (sim.foodStock >= SCENARIO.quota) {
    sc.over = true; sc.won = true; sc.reason = 'The stockpile is full. The colony will outlive the winter.';
  } else if (sim.time > SCENARIO.graceTime && alive < SCENARIO.colonyFloor) {
    sc.over = true; sc.won = false; sc.reason = 'The colony dwindled below survival. The nest falls silent.';
  } else if (sim.time >= SCENARIO.timeLimit) {
    sc.over = true; sc.won = false; sc.reason = `Winter came. ${Math.round(sim.foodStock)} of ${SCENARIO.quota} stores gathered.`;
  }

  if (sc.over && !sc.endStats) {
    sc.endStats = {
      won: sc.won,
      reason: sc.reason,
      foodStock: Math.round(sim.foodStock),
      gathered: sim.foodBanked,
      died: sim.antsDied,
      spidersSlain: sim.spidersKilled,
      time: +sim.time.toFixed(1),
      colony: alive,
    };
  }
}
