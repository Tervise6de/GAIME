// Shared browser-free sim runner. Imports the game sim modules directly (they
// have no DOM dependency) and reproduces the exact main-loop tick order, so a
// run here is identical to the game — just far faster than driving Chromium.
// Used by tools/sweep.mjs and tools/build_whitelist.mjs.
import { makeWorld } from '../game/js/world.js';
import { makeSim, step, antsAlive } from '../game/js/sim.js';
import { makeScenarioState, updateScenario, SCENARIO } from '../game/js/scenario.js';
import { makeAutoPlayer } from '../game/js/auto.js';

export { SCENARIO };

export function runSeed(seed, autoName = 'commander', maxTime = SCENARIO.timeLimit) {
  const world = makeWorld(seed);
  const sim = makeSim(world);
  const sc = makeScenarioState();
  const auto = makeAutoPlayer(autoName);
  const DT = 1 / 60;
  const hardStop = Math.ceil((maxTime + 2) * 60);
  while (!sc.over && sim.tick < hardStop) {
    if (auto) auto(sim);
    step(sim, DT);
    updateScenario(sc, sim, world);
  }
  return {
    seed, genAttempts: world.genAttempts,
    won: !!sc.won, food: Math.round(sim.foodStock), quota: SCENARIO.quota,
    time: +sim.time.toFixed(1), died: sim.antsDied, slain: sim.spidersKilled,
    colony: antsAlive(sim),
    piles: world.piles.map((p) => ({ label: p.label, taken: p.taken || 0, left: Math.max(0, Math.round(p.amount)) })),
  };
}
