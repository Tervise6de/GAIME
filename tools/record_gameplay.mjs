// Record a realtime bot run as video + timed screenshots.
// Usage: node tools/record_gameplay.mjs [seed] [auto] [prefix]
//   seed    map seed (default 7 = handcrafted; e.g. 1873 = a vetted generated map)
//   auto    bot strategy (default commander)
//   prefix  screenshot filename prefix (default "shot")
import { chromium } from 'playwright';

const seed = process.argv[2] || '7';
const auto = process.argv[3] || 'commander';
const prefix = process.argv[4] || 'shot';

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: 'media/video', size: { width: 1280, height: 720 } },
});
const page = await ctx.newPage();
await page.goto(`http://localhost:8123/game/index.html?seed=${seed}&auto=${auto}`, { waitUntil: 'load' });

const shots = [[20, `media/${prefix}_roads.png`], [40, `media/${prefix}_battle.png`], [75, `media/${prefix}_economy.png`], [110, `media/${prefix}_late.png`]];
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
