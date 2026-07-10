// Boot, daily loop, input, and the headless falsification harness.
//
// Modes (URL params):
//   (default)                 — human play: forecast tomorrow, then reveal.
//   ?auto=NAME&days=60&seed=7 — headless: a scripted forecaster plays a season,
//                               sets window.__RESULTS / window.__DONE.
//   ?demo=1&seed=7            — animated instrument playthrough for screenshots.
import { makeAtmo, step, townState, TICKS_PER_DAY, GW, GH, CELL, CATS } from './atmo.js';
import { readInstruments, makeNoise } from './instruments.js';
import { STRATEGIES, makeScorer, probsFromCat } from './forecast.js';
import { makeRenderer, draw, panelHTML } from './render.js';

const q = new URLSearchParams(location.search);
const seed = parseInt(q.get('seed') || '7', 10);
const DAYS = parseInt(q.get('days') || '60', 10);
const autoName = q.get('auto');
const demo = q.get('demo') === '1';

const canvas = document.getElementById('cv');
const R = makeRenderer(canvas);
const panel = document.getElementById('panel');
const banner = document.getElementById('banner');

function newGame() {
  const atmo = makeAtmo(seed);
  const noise = makeNoise(seed);
  // warm up so tendency history + a day-0 baseline exist
  while (atmo.time < 1.0) step(atmo);
  return { atmo, noise, scorer: makeScorer(), day: 1, prevCat: townState(atmo).cat };
}

// Advance the atmosphere one day and return the realized town category.
function advanceDay(g) {
  for (let i = 0; i < TICKS_PER_DAY; i++) step(g.atmo);
  return townState(g.atmo).cat;
}

// Play one day: observe now, form forecast `p` for tomorrow, reveal, score.
function playDay(g, makeProbs, sensors = null) {
  const read = readInstruments(g.atmo, g.noise, sensors);
  const today = { cat: g.prevCat, state: townState(g.atmo) };
  const actual = advanceDay(g);
  const ctx = { read, today, tomorrow: { cat: actual } };
  const p = makeProbs(ctx);
  g.scorer.record(p, actual);
  g.prevCat = actual;
  g.day++;
  return { read, today, actual, p };
}

// ---------- headless harness ----------
if (autoName && !demo) {
  const g = newGame();
  const fn = STRATEGIES[autoName];
  if (!fn) throw new Error('unknown strategy ' + autoName);
  for (let d = 0; d < DAYS; d++) playDay(g, fn);
  const s = g.scorer.summary();
  window.__RESULTS = {
    strategy: autoName, seed, ...s,
    climoObserved: g.scorer.perCat.map((c) => +(c / s.days).toFixed(3)),
    perCatRecall: g.scorer.perCat.map((c, i) => c ? +(g.scorer.perCatCorrect[i] / c).toFixed(2) : null),
  };
  // render a final frame for smoke screenshots
  draw(R, g.atmo, {});
  window.__DONE = true;
}

// ---------- animated demo (screenshots) ----------
else if (demo) {
  const g = newGame();
  const MS_PER_DAY = 130;                 // wall-clock paced so screenshots land
  const MS_PER_TICK = MS_PER_DAY / TICKS_PER_DAY;
  let last = performance.now(), lastDay = 0, lastResult = null;
  function frame() {
    let budget = performance.now() - last; last = performance.now();
    let guard = 200;
    while (budget >= MS_PER_TICK && g.day <= DAYS && guard-- > 0) {
      step(g.atmo); budget -= MS_PER_TICK;
      const nowDay = 1 + Math.floor(g.atmo.time - 1.0);
      if (nowDay > lastDay && g.day <= DAYS) { lastDay = nowDay; lastResult = playDay(g, STRATEGIES.instrument); }
    }
    if (g.day > DAYS && !window.__DONE) { window.__DONE = true; window.__RESULTS = g.scorer.summary(); }
    draw(R, g.atmo, {});
    const ts = townState(g.atmo);
    panel.innerHTML = panelHTML(g.atmo, readInstruments(g.atmo, g.noise), { cat: ts.cat }, { day: g.day });
    if (lastResult) {
      const f = lastResult.p.indexOf(Math.max(...lastResult.p));
      const ok = f === lastResult.actual;
      banner.innerHTML = `Forecast <b style="color:#7db4ee">${CATS[f]}</b> → Actual <b>${CATS[lastResult.actual]}</b> ${ok ? '<span style="color:#7fe3a0">✓</span>' : '<span style="color:#ff7a7a">✗</span>'} &nbsp;·&nbsp; Brier ${g.scorer.summary().brier} · Acc ${(g.scorer.summary().accuracy * 100).toFixed(0)}%`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ---------- deterministic single-frame view (screenshots) ----------
else if (q.get('view')) {
  const g = newGame();
  const targetDay = parseInt(q.get('day') || '1', 10);
  let last = null;
  while (g.day <= targetDay) last = playDay(g, STRATEGIES.instrument);
  draw(R, g.atmo, {});
  const ts = townState(g.atmo);
  panel.innerHTML = panelHTML(g.atmo, readInstruments(g.atmo, g.noise), { cat: ts.cat }, { day: g.day - 1 });
  if (last) {
    const f = last.p.indexOf(Math.max(...last.p));
    const ok = f === last.actual;
    const s = g.scorer.summary();
    banner.innerHTML = `Forecast <b style="color:#7db4ee">${CATS[f]}</b> → Actual <b>${CATS[last.actual]}</b> ${ok ? '<span style="color:#7fe3a0">✓</span>' : '<span style="color:#ff7a7a">✗</span>'}`
      + ` &nbsp;·&nbsp; season Brier <b>${s.brier}</b> · accuracy <b>${(s.accuracy * 100).toFixed(0)}%</b> · reputation <b>${s.reputation}</b>`;
  }
  window.__DONE = true;
}

// ---------- human play ----------
else {
  const g = newGame();
  const conf = { 1: 0.50, 2: 0.62, 3: 0.78 };
  const BUDGET = 3;
  const ui = { cat: 0, level: 2, phase: 'place', sensors: [], last: null };

  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (1280 / r.width) / CELL, y: (e.clientY - r.top) * (720 / r.height) / CELL };
  }
  canvas.addEventListener('mousedown', (e) => {
    if (ui.phase !== 'place' || ui.sensors.length >= BUDGET) return;
    ui.sensors.push(canvasPos(e));
    refresh();
  });

  function refresh() {
    draw(R, g.atmo, ui);
    const ts = townState(g.atmo);
    if (ui.phase === 'place') {
      panel.innerHTML = panelHTML(g.atmo, readInstruments(g.atmo, g.noise, ui.sensors), { cat: ts.cat }, { day: 0 })
        + `<hr><div class="ttl2">Place your weather sensors</div>`
        + `<div class="dim">You have <b>${BUDGET - ui.sensors.length}</b> of ${BUDGET} left. Click the map to place them. Weather blows in from the WEST — sensors on the incoming air (dashed ring) warn you a day ahead. Sensors on the town only tell you today.</div>`
        + `<div class="go" style="margin-top:8px">SPACE — begin the season (${ui.sensors.length}/${BUDGET} placed)</div>`;
      banner.innerHTML = `You are the frontier's weather station. Position your instruments, then forecast each day. Storms you miss cost lives.`;
      return;
    }
    const read = readInstruments(g.atmo, g.noise, ui.sensors);
    panel.innerHTML = panelHTML(g.atmo, read, { cat: ts.cat }, { day: g.day })
      + `<hr><div class="ttl2">Your forecast for tomorrow</div>`
      + CATS.map((c, i) => `<div class="opt ${i === ui.cat ? 'sel' : ''}">[${i + 1}] ${c}</div>`).join('')
      + `<div class="conf">confidence [Q/W/E]: <b>${['LOW', 'MED', 'HIGH'][ui.level - 1]}</b></div>`
      + `<div class="go">SPACE — issue forecast &amp; advance the day</div>`;
    if (ui.last) {
      const f = ui.last.p.indexOf(Math.max(...ui.last.p));
      const ok = f === ui.last.actual;
      const s = g.scorer.summary();
      const missed = ui.last.actual === 3 && f !== 3;
      banner.innerHTML = `Yesterday you called <b>${CATS[f]}</b> — sky was <b>${CATS[ui.last.actual]}</b> ${ok ? '<span style="color:#7fe3a0">✓</span>' : `<span style="color:#ff7a7a">✗${missed ? ' the storm caught the town unwarned' : ''}</span>`}`
        + ` &nbsp;·&nbsp; day ${g.day > DAYS ? DAYS : g.day - 1}/${DAYS} · Brier <b>${s.brier}</b> · accuracy <b>${(s.accuracy * 100).toFixed(0)}%</b> · reputation <b>${s.reputation}</b>`;
    } else {
      banner.innerHTML = `Read the instruments. What is the sky doing tomorrow? The town is counting on you.`;
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '4') ui.cat = +e.key - 1;
    if (e.key === 'q' || e.key === 'Q') ui.level = 1;
    if (e.key === 'w' || e.key === 'W') ui.level = 2;
    if (e.key === 'e' || e.key === 'E') ui.level = 3;
    if (e.code === 'Space') {
      e.preventDefault();
      if (ui.phase === 'place') {
        if (ui.sensors.length > 0) ui.phase = 'forecast';
      } else if (g.day <= DAYS) {
        const cat = ui.cat, c = conf[ui.level];
        ui.last = playDay(g, () => probsFromCat(cat, c), ui.sensors);
        if (g.day > DAYS) {
          window.__RESULTS = { strategy: 'human', seed, ...g.scorer.summary() };
          window.__DONE = true;
        }
      }
    }
    refresh();
  });
  refresh();
}
