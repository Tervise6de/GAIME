// Zoomed art-inspection stills: clips around the guard spider + rich pile.
// Usage: node tools/art_closeup.mjs [url] [outPrefix]
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:8123/game/index.html?seed=7&auto=commander';
const prefix = process.argv[3] || 'media/proto/closeup';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'load' });
// let roads form and the fight start
while ((await page.evaluate(() => (window.__SIM ? window.__SIM.time : 0))) < 16) {
  await page.waitForTimeout(200);
}
await page.screenshot({ path: `${prefix}_spider.png`, clip: { x: 500, y: 160, width: 320, height: 220 } });
await page.screenshot({ path: `${prefix}_pile.png`, clip: { x: 950, y: 440, width: 320, height: 220 } });
await page.screenshot({ path: `${prefix}_full.png` });
await browser.close();
console.log('closeups written');
