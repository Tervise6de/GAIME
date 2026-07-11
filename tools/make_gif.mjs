// Capture frames for the gameplay GIF: a realtime commander run on seed 7,
// screenshotted at a steady wall-time cadence through the most characterful
// stretch (roads forming -> warband strike -> economy pulsing). Frames land
// in media/gif_frames/ for tools/make_gif.py (Pillow) to assemble — this
// environment has no ffmpeg.
// Usage: node tools/make_gif.mjs [startT] [endT] [periodMs]
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const startT = parseFloat(process.argv[2] || '10');   // sim seconds
const endT = parseFloat(process.argv[3] || '46');
const periodMs = parseInt(process.argv[4] || '400', 10);

mkdirSync('media/gif_frames', { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:8123/game/index.html?seed=7&auto=commander', { waitUntil: 'load' });

const simT = () => page.evaluate(() => (window.__SIM ? window.__SIM.time : 0));
while ((await simT()) < startT) await page.waitForTimeout(120);

let i = 0;
while ((await simT()) < endT) {
  await page.screenshot({ path: `media/gif_frames/f${String(i).padStart(3, '0')}.png` });
  i++;
  await page.waitForTimeout(periodMs);
}
console.log(`captured ${i} frames over sim ${startT}-${endT}s`);
await browser.close();
