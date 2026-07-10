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
    let wx = w.x, wy = w.y;
    if (world.seed !== 7) {
      // generated maps: press the road to the busiest remaining pile
      const target = [...world.piles].sort((a, b) => (b.taken || 0) - (a.taken || 0))[0] || world.piles[0];
      const t = 0.4 + world.rng() * 0.25;
      const px = world.nest.x + (target.x - world.nest.x) * t;
      const py = world.nest.y + (target.y - world.nest.y) * t;
      const ang = world.rng() * Math.PI * 2, off = 50 + world.rng() * 90;
      wx = Math.max(60, Math.min(1220, px + Math.cos(ang) * off));
      wy = Math.max(60, Math.min(660, py + Math.sin(ang) * off));
      if (Math.hypot(wx - world.nest.x, wy - world.nest.y) < 240) {
        const a2 = Math.atan2(wy - world.nest.y, wx - world.nest.x);
        wx = world.nest.x + Math.cos(a2) * 260; wy = world.nest.y + Math.sin(a2) * 260;
      }
    }
    world.spiders.push({
      x: wx, y: wy, hx: wx, hy: wy, tr: w.tr,
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
