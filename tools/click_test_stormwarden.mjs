import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto('http://localhost:8123/prototypes/stormwarden/index.html?seed=99', { waitUntil: 'load' });
await page.waitForTimeout(800);

// canvas is scaled to viewport; canvas coords == CSS coords here (1280x720 fits)
const cv = await page.$('#cv');
const box = await cv.boundingBox();
const click = (x, y) => page.mouse.click(box.x + x * box.width / 1280, box.y + y * box.height / 720);

for (let day = 0; day < 3; day++) {
  await click(900 + 24 + 1 * 112 + 54, 352 + 15);   // select RAIN
  await page.waitForTimeout(150);
  await click(900 + 210 + 73, 432 + 15);             // ISSUE FORECAST
  await page.waitForTimeout(1200);                    // day animates (~20 frames)
  if (day === 0) await page.screenshot({ path: 'media/proto/sw_resolution.png' });
  await click(450, 360);                              // dismiss resolution
  await page.waitForTimeout(300);
}
await page.screenshot({ path: 'media/proto/sw_day4.png' });
const g = await page.evaluate(() => ({ day: window.__GAME.day, rep: window.__GAME.rep, ledger: window.__GAME.ledger.map(l => l.text), phase: window.__GAME.phase }));
console.log(JSON.stringify(g, null, 2));
await browser.close();
