// Worker for sweep_parallel: run one seed's full game to completion, print
// the result as a single JSON line on stdout. Args: <seed> <autoName>
import { makeWorld } from '../game/js/world.js';
import { makeSim, step, antsAlive } from '../game/js/sim.js';
import { makeAutoPlayer } from '../game/js/auto.js';
import { makeScenarioState, updateScenario, SCENARIO } from '../game/js/scenario.js';

const seed = parseInt(process.argv[2], 10);
const autoName = process.argv[3] || 'commander';
const DT = 1 / 60;
const MAX_TICKS = Math.ceil(SCENARIO.timeLimit / DT) + 60;

const world = makeWorld(seed);
const sim = makeSim(world);
const auto = makeAutoPlayer(autoName);
const sc = makeScenarioState();
while (!sc.over && sim.tick < MAX_TICKS) {
  if (auto) auto(sim);
  step(sim, DT);
  updateScenario(sc, sim, world);
}
const s = sc.endStats || {};
process.stdout.write(JSON.stringify({
  seed, gen: world.genAttempts, won: !!s.won,
  stock: Math.round(s.foodStock || sim.foodStock),
  time: +(s.time || sim.time).toFixed(1),
  died: s.died || sim.antsDied, slain: s.spidersSlain || sim.spidersKilled,
  colony: s.colony ?? antsAlive(sim),
  taken: world.piles.map((p) => p.taken || 0),
}));
