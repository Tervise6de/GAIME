// HIVEMIND — winner development build. Boot, loop, input, scenario, instrumentation.
import { W, H, F, makeWorld, stamp, erase } from './world.js';
import { makeSim, step, antsAlive } from './sim.js';
import { makeRenderer, draw, hudText, drawEndCard, drawTitle } from './render.js';
import { makeAutoPlayer } from './auto.js';
import { SCENARIO, makeScenarioState, updateScenario } from './scenario.js';
import { makeOnboarding, updateOnboarding, drawOnboarding } from './onboarding.js';
import { pickSeed } from './seedpool.js';
import { makeEffects, deathBurst, deliveryPing, updateEffects, drawEffects } from './effects.js';
import { initAudio, sfxDelivery, sfxDeath, sfxWave } from './audio.js';

const q = new URLSearchParams(location.search);
const seed = parseInt(q.get('seed') || '7', 10);
const fast = parseInt(q.get('fast') || '0', 10);        // sim ticks per frame (0 = realtime)
const stopTicks = parseInt(q.get('ticks') || '0', 10);  // hard stop after N ticks (harness)
const autoName = q.get('auto');

const canvas = document.getElementById('cv');
const hud = document.getElementById('hud');
const world = makeWorld(seed);
const sim = makeSim(world);
const R = makeRenderer(canvas);
const auto = autoName ? makeAutoPlayer(autoName) : null;
const sc = makeScenarioState();
const ob = makeOnboarding();
const fx = makeEffects();
// cosmetic event tracking (compared per frame, never affects the sim)
let prevBanked = 0;
let prevSpiderCount = world.spiders.length;
const prevAlive = world.spiders.map((s) => s.alive);

const ui = { tool: 0, brush: 42, mx: 0, my: 0, painting: 0, showBrush: !auto, paused: false, started: !!(auto || fast) };
const PLAYER_FIELDS = [F.LURE, F.FEAR, F.WAR];

// --- input ---
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)];
}
canvas.addEventListener('mousemove', (e) => { [ui.mx, ui.my] = canvasPos(e); });
canvas.addEventListener('mousedown', (e) => {
  initAudio();                                  // first gesture unlocks WebAudio
  if (!ui.started) { ui.started = true; return; }
  ui.painting = e.button === 2 ? 2 : 1;
});
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
  if (sc.over) {
    if (e.key === 'r' || e.key === 'R') location.search = `?seed=${seed}`;
    // "new territory" draws from the oracle-vetted pool (see seedpool.js) so
    // every replay map is one competent play can beat — not a random,
    // possibly-too-hard seed.
    if (e.key === 'n' || e.key === 'N') location.search = `?seed=${pickSeed(seed)}`;
  }
});

// --- instrumentation ---
const DT = 1 / 60;
let frames = 0, lastFpsT = performance.now(), fps = 0;
let simMsTotal = 0, simTicksTotal = 0;
window.__SIM = sim;
window.__SC = sc;
window.__OB = ob;
window.__DONE = false;

function finish() {
  window.__DONE = true;
  window.__RESULTS = {
    strategy: autoName || 'human', seed,
    ...sc.endStats,
    piles: world.piles.map((p) => ({ label: p.label, left: Math.max(0, p.amount), taken: p.taken || 0 })),
    msPerTick: +(simMsTotal / Math.max(1, simTicksTotal)).toFixed(3),
  };
}

function tickOnce() {
  if (ui.painting === 1) stamp(world.fields[PLAYER_FIELDS[ui.tool]], ui.mx, ui.my, ui.brush, 1.0);
  if (ui.painting === 2) erase(world.fields, ui.mx, ui.my, ui.brush);
  if (auto) auto(sim);
  const t0 = performance.now();
  step(sim, DT);
  updateScenario(sc, sim, world);
  if (!auto) updateOnboarding(ob, sim, ui);
  simMsTotal += performance.now() - t0; simTicksTotal++;
  if (sc.over && !window.__DONE) finish();
  if (stopTicks && sim.tick >= stopTicks && !window.__DONE) {
    sc.endStats = sc.endStats || {
      won: false, foodStock: Math.round(sim.foodStock), gathered: sim.foodBanked,
      died: sim.antsDied, spidersSlain: sim.spidersKilled, time: +sim.time.toFixed(1),
      colony: antsAlive(sim),
    };
    finish();
  }
}

function frame() {
  let ticked = 0;
  if (!ui.paused && !sc.over && ui.started) {
    const n = fast > 0 ? fast : 1;
    for (let i = 0; i < n; i++) { tickOnce(); ticked++; if (sc.over || window.__DONE) break; }
  }
  // cosmetic events: compare post-step world to last frame (never feeds the sim)
  for (let i = 0; i < world.spiders.length; i++) {
    const a = world.spiders[i].alive;
    if (i < prevAlive.length && prevAlive[i] && !a) { deathBurst(fx, world.spiders[i].x, world.spiders[i].y); sfxDeath(); }
    prevAlive[i] = a;
  }
  if (world.spiders.length > prevSpiderCount) { sfxWave(); prevSpiderCount = world.spiders.length; }
  if (sim.foodBanked > prevBanked) {
    const strength = Math.min(6, sim.foodBanked - prevBanked);
    deliveryPing(fx, world.nest.x, world.nest.y, strength);
    sfxDelivery(strength, performance.now());
    prevBanked = sim.foodBanked;
  }
  // effects run on sim-time while stepping, else real-time so a final death
  // burst still plays out over the end card
  updateEffects(fx, DT * (ticked || 1));
  draw(R, sim, ui);
  drawEffects(R.ctx, fx, world.nest);
  if (!ui.started) drawTitle(R.ctx);
  if (!auto && !sc.over && ui.started) drawOnboarding(R.ctx, ob, sim, W, H);
  if (sc.over && sc.endStats) drawEndCard(R.ctx, sc.endStats, SCENARIO);
  frames++;
  const now = performance.now();
  if (now - lastFpsT > 500) {
    fps = Math.round((frames * 1000) / (now - lastFpsT));
    frames = 0; lastFpsT = now;
    hud.innerHTML = hudText(sim, fps, SCENARIO) + (auto ? `<br>auto: <b>${autoName}</b>` : '');
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
