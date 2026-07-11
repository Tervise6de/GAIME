// Scripted human-style playthrough of game/: drag-paints a road, checks
// that onboarding hints appear and dismiss in response to real play.
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto('http://localhost:8123/game/index.html?seed=7', { waitUntil: 'load' });
await page.waitForTimeout(3600);

const box = await (await page.$('#cv')).boundingBox();
const P = (x, y) => [box.x + (x * box.width) / 1280, box.y + (y * box.height) / 720];
const hint = () => page.evaluate(() => (window.__OB && window.__OB.active ? window.__OB.active.id : null));

// the first click only dismisses the title screen — it must not count as paint
await page.mouse.click(...P(640, 600));
await page.waitForTimeout(3600);
console.log('hint at t=4 (expect paint-road):', await hint());
await page.screenshot({ path: 'media/proto/game_hint1.png' });

// drag-paint a lure road along the top route (nest -> high pile). The
// paint-road hint dismisses at lurePainted > 260 (ticks-while-painting), so
// hold the button ~5s total — brief pauses between passes keep painting.
const route = [[170, 360], [220, 200], [300, 80], [520, 62], [720, 66], [900, 88], [1055, 120]];
let [sx, sy] = P(route[0][0], route[0][1]);
await page.mouse.move(sx, sy);
await page.mouse.down();
for (let pass = 0; pass < 5; pass++) {
  const pts = pass % 2 ? [...route].reverse() : route;
  for (const [x, y] of pts) {
    const [px, py] = P(x, y);
    await page.mouse.move(px, py, { steps: 14 });
  }
  await page.waitForTimeout(450);
}
await page.mouse.up();
console.log('hint after painting (expect road-continuity or next):', await hint());

// wait for deliveries to dismiss continuity hint
await page.waitForTimeout(26000);
console.log('hint after deliveries (expect rally or parallel):', await hint());
const stats = await page.evaluate(() => ({
  banked: window.__SIM.foodBanked, lure: window.__OB ? window.__OB.lurePainted : -1,
  done: window.__OB ? [...window.__OB.done] : [],
}));
console.log(JSON.stringify(stats));
if (!(stats.lure > 260) || !(stats.banked >= 12) || !stats.done.includes('paint-road')) {
  console.error('FAIL: painting or deliveries not registered by the game/onboarding');
  process.exitCode = 1;
}
await page.screenshot({ path: 'media/proto/game_hint_after.png' });

// --- second scenario: [S] on the title must switch, and the drought must
// run its own hint track (sun-tax replaces the season's pacing) ---
await page.goto('http://localhost:8123/game/index.html?seed=7', { waitUntil: 'load' });
await page.waitForTimeout(600);
await page.keyboard.press('s');                      // title-screen scenario switch
await page.waitForTimeout(1200);
const scn = await page.evaluate(() => new URLSearchParams(location.search).get('scn'));
console.log('scenario after [S] (expect drought):', scn);
await page.mouse.click(...P(640, 600));              // dismiss drought title
await page.waitForTimeout(16500);                    // sun-tax arms at t>14
const dHint = await hint();
console.log('drought hint at t~16 (expect sun-tax or paint-road):', dHint);
const dStock = await page.evaluate(() => window.__SIM.foodStock);
console.log('drought stock at t~16 (expect < 160, upkeep eating):', dStock.toFixed(1));
if (scn !== 'drought' || !['sun-tax', 'paint-road', 'road-continuity'].includes(dHint) || !(dStock < 160)) {
  console.error('FAIL: scenario switch, drought hints, or upkeep not working');
  process.exitCode = 1;
}
await browser.close();
