// Record a realtime commander run as video + timed screenshots.
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: 'media/video', size: { width: 1280, height: 720 } },
});
const page = await ctx.newPage();
await page.goto('http://localhost:8123/game/index.html?seed=7&auto=commander', { waitUntil: 'load' });

const shots = [[20, 'media/shot_roads.png'], [40, 'media/shot_battle.png'], [75, 'media/shot_economy.png'], [110, 'media/shot_late.png']];
const t0 = Date.now();
for (const [t, path] of shots) {
  const wait = t * 1000 - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path });
  console.error('[shot]', path);
}
await page.waitForTimeout(10000);
await ctx.close();                       // flushes video
const video = await page.video().path();
console.log('video:', video);
await browser.close();
