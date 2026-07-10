// Build a curated, difficulty-normalized seed whitelist for the "new map" key.
//
// Structural fairness (reachability, see tools/gen_check.mjs) does NOT imply a
// map is winnable or fairly difficult: a sweep of the ceiling bot (commander)
// shows ~1 in 6 generated maps is unwinnable even for perfect play, and win
// times among the winnable ones spread from ~165s to the 480s wire. Shipping
// raw random seeds would hand players a fraction of unfair or wildly uneven
// maps. So we pre-validate offline and ship only seeds the ceiling bot wins
// inside a target difficulty band, and that punish idleness (lose control).
//
// Usage:
//   node tools/build_whitelist.mjs [--from 1000] [--scan 70] [--count 20]
//                                  [--lo 210] [--hi 360] [--write]
// Prints the selected seeds; with --write, regenerates game/js/seeds.js.
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { runSeed } from './sim_runner.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const has = (n) => args.includes(n);

const from = parseInt(opt('--from', '1000'), 10);
const scan = parseInt(opt('--scan', '70'), 10);
const count = parseInt(opt('--count', '20'), 10);
const lo = parseFloat(opt('--lo', '210'));   // faster than this = too easy
const hi = parseFloat(opt('--hi', '360'));   // slower than this = fragile / too hard
const write = has('--write');

const selected = [];
const rejected = { lose: 0, tooEasy: 0, tooHard: 0, idleWon: 0 };
console.error(`scanning seeds ${from}..${from + scan - 1}, band [${lo},${hi}]s, target ${count}`);
for (let seed = from; seed < from + scan && selected.length < count; seed++) {
  const c = runSeed(seed, 'commander');
  if (!c.won) { rejected.lose++; console.error(`  ${seed} reject: commander LOSES (food ${c.food})`); continue; }
  if (c.time < lo) { rejected.tooEasy++; console.error(`  ${seed} reject: too easy (t=${c.time})`); continue; }
  if (c.time > hi) { rejected.tooHard++; console.error(`  ${seed} reject: too hard (t=${c.time})`); continue; }
  // a normalized map must still punish doing nothing — verify idle loses
  const idle = runSeed(seed, 'idle');
  if (idle.won) { rejected.idleWon++; console.error(`  ${seed} reject: idle WINS (degenerate)`); continue; }
  selected.push({ seed, time: c.time, died: c.died, slain: c.slain });
  console.error(`  ${seed} KEEP  t=${c.time} died=${c.died} slain=${c.slain}`);
}

const seeds = selected.map((s) => s.seed);
console.error(`\nselected ${seeds.length}/${count}: ${seeds.join(', ')}`);
console.error(`rejected: ${JSON.stringify(rejected)}`);
const times = selected.map((s) => s.time).sort((a, b) => a - b);
if (times.length) console.error(`win-time band actually spanned: ${times[0]}..${times[times.length - 1]}s (median ${times[times.length >> 1]})`);

if (write) {
  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = join(here, '..', 'game', 'js', 'seeds.js');
  const body = `// CURATED SEED WHITELIST — do not hand-edit; regenerate with:
//   node tools/build_whitelist.mjs --from ${from} --scan ${scan} --count ${count} --lo ${lo} --hi ${hi} --write
//
// Every seed here was verified offline: the ceiling bot (commander) wins it
// inside the ${lo}-${hi}s difficulty band, and idle play loses it. This is what
// the [N] "new territory" key draws from, so players never meet an unwinnable
// or trivially easy generated map. Seed 7 is the handcrafted showcase and is
// intentionally NOT in this list (it is the default map).
export const CURATED_SEEDS = [
  ${seeds.join(', ')},
];
`;
  writeFileSync(outPath, body);
  console.error(`\nwrote ${outPath} (${seeds.length} seeds)`);
}
