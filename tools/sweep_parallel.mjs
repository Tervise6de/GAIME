// Parallel winnability sweep: runs one worker process per seed across all
// CPU cores, so a 30-seed sweep finishes in ~(30/cores) x single-seed time.
// Each worker runs the full game loop headless (same oracle as sweep_seeds).
// Usage: node tools/sweep_parallel.mjs [auto=commander] [count=30] [start=1000] [conc=8]
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const a = process.argv.slice(2).find((s) => s.startsWith(k + '=')); return a ? a.split('=')[1] : d; };
const autoName = arg('auto', 'commander');
const count = parseInt(arg('count', '30'), 10);
const start = parseInt(arg('start', '1000'), 10);
const conc = parseInt(arg('conc', '8'), 10);

const seeds = [7, ...Array.from({ length: count }, (_, i) => start + i)];
const results = new Map();

function runOne(seed) {
  return new Promise((resolve) => {
    const child = fork(join(__dirname, 'sweep_worker.mjs'), [String(seed), autoName], { stdio: ['ignore', 'pipe', 'inherit', 'ipc'] });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.on('exit', () => { try { resolve(JSON.parse(out)); } catch { resolve({ seed, error: true }); } });
  });
}

const queue = [...seeds];
async function worker() { while (queue.length) { const s = queue.shift(); results.set(s, await runOne(s)); } }

console.log(`# parallel sweep auto=${autoName} seeds=[7, ${start}..${start + count - 1}] conc=${conc}`);
await Promise.all(Array.from({ length: conc }, worker));

console.log('seed    gen  won   stock  time   died  slain colony  taken');
let wins = 0, genWins = 0; const times = [];
for (const seed of seeds) {
  const r = results.get(seed) || { error: true };
  if (r.error) { console.log(`${seed} ERROR`); continue; }
  if (r.won) { wins++; times.push(r.time); if (seed !== 7) genWins++; }
  console.log(`${String(r.seed).padEnd(7)} ${String(r.gen).padStart(2)}  ${r.won ? 'WIN ' : 'loss'}  ${String(r.stock).padStart(5)}  ${String(r.time).padStart(5)}  ${String(r.died).padStart(5)} ${String(r.slain).padStart(4)}  ${String(r.colony).padStart(5)}  [${r.taken.join(',')}]`);
}
const genTotal = seeds.length - 1;
const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : 'n/a';
console.log(`\n# ${wins}/${seeds.length} won total | generated: ${genWins}/${genTotal} (${(100 * genWins / genTotal).toFixed(0)}%) | win-time avg ${avg}s`);
