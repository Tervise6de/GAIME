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
function playDay(g, makeProbs) {
  const read = readInstruments(g.atmo, g.noise);
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
  const ui = { cat: 0, level: 2, phase: 'forecast', last: null, anim: 0 };

  function refresh() {
    draw(R, g.atmo, ui);
    const read = readInstruments(g.atmo, g.noise);
    const ts = townState(g.atmo);
    panel.innerHTML = panelHTML(g.atmo, read, { cat: ts.cat }, { day: g.day })
      + `<hr><div class="ttl2">Your forecast for tomorrow</div>`
      + CATS.map((c, i) => `<div class="opt ${i === ui.cat ? 'sel' : ''}">[${i + 1}] ${c}</div>`).join('')
      + `<div class="conf">confidence [Q/W/E]: <b>${['LOW', 'MED', 'HIGH'][ui.level - 1]}</b></div>`
      + `<div class="go">SPACE — issue forecast &amp; advance the day</div>`;
    if (ui.last) {
      const f = ui.last.p.indexOf(Math.max(...ui.last.p));
      const ok = f === ui.last.actual;
      const s = g.scorer.summary();
      banner.innerHTML = `Yesterday you called <b>${CATS[f]}</b> — sky was <b>${CATS[ui.last.actual]}</b> ${ok ? '<span style="color:#7fe3a0">✓</span>' : '<span style="color:#ff7a7a">✗ people were caught out</span>'}`
        + ` &nbsp;·&nbsp; season Brier <b>${s.brier}</b> · accuracy <b>${(s.accuracy * 100).toFixed(0)}%</b> · reputation <b>${s.reputation}</b>`;
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
      if (g.day > DAYS) return;
      const cat = ui.cat, c = conf[ui.level];
      const res = playDay(g, () => probsFromCat(cat, c));
      ui.last = res;
      if (g.day > DAYS) {
        const s = g.scorer.summary();
        window.__RESULTS = { strategy: 'human', seed, ...s };
        window.__DONE = true;
      }
    }
    refresh();
  });
  refresh();
  // keep the wind/systems alive visually while the player deliberates
  (function idle() { requestAnimationFrame(idle); refresh; })();
}
