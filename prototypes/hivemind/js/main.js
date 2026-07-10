// Boot, loop, input, instrumentation.
import { W, H, F, makeWorld, stamp, erase } from './world.js';
import { makeSim, step, antsAlive } from './sim.js';
import { makeRenderer, draw, hudText } from './render.js';
import { makeAutoPlayer } from './auto.js';

const q = new URLSearchParams(location.search);
const seed = parseInt(q.get('seed') || '7', 10);
const fast = parseInt(q.get('fast') || '0', 10);        // sim ticks per frame (0 = realtime)
const stopTicks = parseInt(q.get('ticks') || '0', 10);  // stop after N ticks
const autoName = q.get('auto');

const canvas = document.getElementById('cv');
const hud = document.getElementById('hud');
const world = makeWorld(seed);
const sim = makeSim(world);
const R = makeRenderer(canvas);
const auto = autoName ? makeAutoPlayer(autoName) : null;

const ui = { tool: 0, brush: 42, mx: 0, my: 0, painting: 0, showBrush: !auto, paused: false };
const PLAYER_FIELDS = [F.LURE, F.FEAR, F.WAR];

// --- input ---
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)];
}
canvas.addEventListener('mousemove', (e) => { [ui.mx, ui.my] = canvasPos(e); });
canvas.addEventListener('mousedown', (e) => { ui.painting = e.button === 2 ? 2 : 1; });
window.addEventListener('mouseup', () => { ui.painting = 0; });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('wheel', (e) => {
  ui.brush = Math.max(14, Math.min(120, ui.brush - Math.sign(e.deltaY) * 8));
  e.preventDefault();
}, { passive: false });
window.addEventListener('keydown', (e) => {
  if (e.key === '1') ui.tool = 0;
  if (e.key === '2') ui.tool = 1;
  if (e.key === '3') ui.tool = 2;
  if (e.key === 'p' || e.key === 'P') ui.paused = !ui.paused;
});

// --- instrumentation ---
const DT = 1 / 60;
let frames = 0, lastFpsT = performance.now(), fps = 0;
let simMsTotal = 0, simTicksTotal = 0;
window.__SIM = sim;
window.__DONE = false;

function tickOnce() {
  if (ui.painting === 1) stamp(world.fields[PLAYER_FIELDS[ui.tool]], ui.mx, ui.my, ui.brush, 1.0);
  if (ui.painting === 2) erase(world.fields, ui.mx, ui.my, ui.brush);
  if (auto) auto(sim);
  const t0 = performance.now();
  step(sim, DT);
  simMsTotal += performance.now() - t0; simTicksTotal++;
  if (stopTicks && sim.tick >= stopTicks && !window.__DONE) {
    window.__DONE = true;
    window.__RESULTS = {
      strategy: autoName || 'human', seed,
      ticks: sim.tick, simSeconds: +sim.time.toFixed(1),
      foodBanked: sim.foodBanked, foodStock: +sim.foodStock.toFixed(1),
      antsDied: sim.antsDied,
      antsAlive: antsAlive(sim), spidersKilled: sim.spidersKilled,
      msPerTick: +(simMsTotal / simTicksTotal).toFixed(3),
    };
  }
}

function frame() {
  if (!ui.paused && !window.__DONE) {
    const n = fast > 0 ? fast : 1;
    for (let i = 0; i < n; i++) { tickOnce(); if (window.__DONE) break; }
  }
  draw(R, sim, ui);
  frames++;
  const now = performance.now();
  if (now - lastFpsT > 500) {
    fps = Math.round((frames * 1000) / (now - lastFpsT));
    frames = 0; lastFpsT = now;
    hud.innerHTML = hudText(sim, fps) + (auto ? `<br>auto: <b>${autoName}</b>` : '');
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
