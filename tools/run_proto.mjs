// Headless prototype runner: loads a prototype URL in Chromium, waits for
// window.__DONE (or a timeout), takes screenshots, prints results JSON.
// Usage:
//   node tools/run_proto.mjs <url> [--max seconds] [--out final.png]
//                                  [--shots t1:a.png,t2:b.png] [--eval "expr"]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const url = args[0];
function opt(name, def) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
}
const maxSec = parseFloat(opt('--max', '60'));
const out = opt('--out', null);
const shots = (opt('--shots', '') || '').split(',').filter(Boolean)
  .map((s) => { const [t, p] = s.split(':'); return { t: parseFloat(t), p }; });
const evalExpr = opt('--eval', null);

// Use the environment's pre-provisioned Chromium (do not download browsers).
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));

await page.goto(url, { waitUntil: 'load' });

const t0 = Date.now();
let shotIdx = 0;
let done = false;
while (Date.now() - t0 < maxSec * 1000) {
  while (shotIdx < shots.length && (Date.now() - t0) / 1000 >= shots[shotIdx].t) {
    await page.screenshot({ path: shots[shotIdx].p });
    console.error(`[shot] ${shots[shotIdx].p} @ ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    shotIdx++;
  }
  done = await page.evaluate('window.__DONE === true').catch(() => false);
  if (done) break;
  await new Promise((r) => setTimeout(r, 250));
}

if (out) { await page.screenshot({ path: out }); console.error(`[shot] ${out} (final)`); }

const results = await page.evaluate(`
  window.__RESULTS || (window.__SIM ? {
    partial: true, ticks: window.__SIM.tick,
    foodBanked: window.__SIM.foodBanked, antsDied: window.__SIM.antsDied
  } : ${evalExpr ? `(${evalExpr})` : 'null'})
`).catch((e) => ({ error: String(e) }));

console.log(JSON.stringify({ url, doneFlag: done, elapsedSec: +((Date.now() - t0) / 1000).toFixed(1), results }, null, 2));
await browser.close();
