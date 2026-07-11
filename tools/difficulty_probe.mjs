// Static difficulty probe: loads N generated seeds (3 ticks each, no play)
// and prints per-map layout features that plausibly drive difficulty —
// plain path distance to each pile, unavoidable hunter exposure (penalized
// minus plain route cost), and the assault route length to the guard den.
// Used to calibrate the generator's difficulty accept-band against observed
// bot outcomes (data/winnability_sweep_*.md).
// Usage: node tools/difficulty_probe.mjs [count] [start] [stride]
import { chromium } from 'playwright';

const N = parseInt(process.argv[2] || '16', 10);
const start = parseInt(process.argv[3] || '1000', 10);
const stride = parseInt(process.argv[4] || '97', 10);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });

const FEATURES = `(() => {
  const w = window.__SIM.world;
  const CELL = 8, GW = 160, GH = 90;
  const N = GW * GH;
  const NB = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],
    [1,1,1.4142],[1,-1,1.4142],[-1,1,1.4142],[-1,-1,1.4142]];
  // Dijkstra from nest; pen=0 gives the plain field, pen>0 the hunter-averse one
  function dij(pen) {
    const penalty = new Float32Array(N);
    if (pen > 0) for (const sp of w.spiders) {
      if (!sp.alive) continue;
      const pr = sp.tr + 20;
      for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
        const dx = gx*CELL + CELL/2 - sp.hx, dy = gy*CELL + CELL/2 - sp.hy;
        if (dx*dx + dy*dy < pr*pr) penalty[gy*GW + gx] += pen;
      }
    }
    const dist = new Float64Array(N).fill(Infinity);
    const s0 = ((w.nest.y/CELL)|0)*GW + ((w.nest.x/CELL)|0);
    dist[s0] = 0;
    // simple bucket-less loop (map is tiny): repeated relaxation via queue
    const q = [s0];
    while (q.length) {
      const cur = q.shift();
      const cd = dist[cur], cx = cur % GW, cy = (cur/GW)|0;
      for (const [ox, oy, base] of NB) {
        const nx = cx+ox, ny = cy+oy;
        if (nx<0||ny<0||nx>=GW||ny>=GH) continue;
        const idx = ny*GW + nx;
        if (w.blocked[idx]) continue;
        const nd = cd + base + penalty[idx];
        if (nd < dist[idx] - 1e-9) { dist[idx] = nd; q.push(idx); }
      }
    }
    return dist;
  }
  const plain = dij(0), avert = dij(6);
  const at = (d, x, y) => d[((y/CELL)|0)*GW + ((x/CELL)|0)];
  const px = (v) => Math.round(v * CELL);
  const out = { seed: w.seed };
  for (const p of w.piles) {
    out[p.label] = px(at(plain, p.x, p.y));
    out[p.label + 'Detour'] = px(at(avert, p.x, p.y) - at(plain, p.x, p.y));
  }
  const g = w.spiders[0];
  out.guardPath = px(at(plain, g.hx, g.hy));
  out.midNestDist = Math.round(Math.hypot(w.spiders[1].hx - w.nest.x, w.spiders[1].hy - w.nest.y));
  return out;
})()`;

const rows = [];
for (let i = 0; i < N; i++) {
  const seed = start + i * stride;
  await page.goto(`http://localhost:8123/game/index.html?seed=${seed}&fast=1&ticks=3`, { waitUntil: 'load' });
  await page.waitForFunction('window.__DONE === true', { timeout: 15000 });
  rows.push(await page.evaluate(FEATURES));
}
console.log(JSON.stringify(rows, null, 1));
await browser.close();
