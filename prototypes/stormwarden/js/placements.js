// Sensor-placement presets. The player is given a small budget of sensors and
// must decide WHERE to put them. These presets are the scripted "strategies"
// for the Stage-6 falsification: does skilled placement (on the upwind
// streamline) actually beat naive placement (clustered on the town)? The
// instrument decision rule is identical across placements — only the sensor
// positions differ.
import { TOWN } from './atmo.js';
import { mulberry32 } from './rng.js';

// Prevailing wind is ~due-east at ~5 cells/day, so the air arriving tomorrow
// comes from ~5 cells WEST of town; the day after, ~10 west.
export const PLACEMENTS = {
  // Novice instinct: measure where you stand.
  onTown: () => [
    { x: TOWN.x, y: TOWN.y }, { x: TOWN.x - 1, y: TOWN.y - 1 }, { x: TOWN.x + 1, y: TOWN.y + 1 },
  ],
  // Expert: string the sensors up the incoming corridor, covering the meander.
  upwindLine: () => [
    { x: TOWN.x - 5, y: TOWN.y }, { x: TOWN.x - 10, y: TOWN.y }, { x: TOWN.x - 5, y: TOWN.y + 3 },
  ],
  // Hedge against direction uncertainty: one upwind, one north, one south.
  spread: () => [
    { x: TOWN.x - 5, y: TOWN.y }, { x: TOWN.x - 2, y: TOWN.y - 9 }, { x: TOWN.x - 2, y: TOWN.y + 9 },
  ],
};

export function randomPlacement(seed, n = 3) {
  const rng = mulberry32((seed >>> 0) ^ 0x9e37);
  const out = [];
  for (let i = 0; i < n; i++) out.push({ x: 6 + rng() * 52, y: 4 + rng() * 28 });
  return out;
}
