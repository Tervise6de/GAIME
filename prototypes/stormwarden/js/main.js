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

// ---------- human play: 3-day committed outlook, scored per lead ----------
else {
  const conf = { 1: 0.50, 2: 0.62, 3: 0.78 };
  const BUDGET = 3;
  const LEAD_LABEL = ['TOMORROW', '+2 DAYS', '+3 DAYS'];
  // confidence honestly decays with lead — you cannot be as sure 3 days out
  const confForLead = (L, lvl) => Math.max(0.35, conf[lvl] - (L - 1) * 0.14);

  const g = newGame();
  const scorers = { 1: makeScorer(), 2: makeScorer(), 3: makeScorer() };
  let pending = [];               // {target, lead, probs} awaiting their day
  let realized = 0;               // index of the last realized day (0 = baseline)
  const ui = { outlook: [0, 0, 0], horizon: 0, level: 2, phase: 'place', sensors: [], resolved: null };

  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (1280 / r.width) / CELL, y: (e.clientY - r.top) * (720 / r.height) / CELL };
  }
  canvas.addEventListener('mousedown', (e) => {
    if (ui.phase !== 'place' || ui.sensors.length >= BUDGET) return;
    ui.sensors.push(canvasPos(e)); refresh();
  });

  // One turn: forecast +1/+2/+3, advance a day, resolve everything due today.
  function commitTurn() {
    const read = readInstruments(g.atmo, g.noise, ui.sensors);
    const turn = g.day;                                   // forecasting for day `turn`
    for (let L = 1; L <= 3; L++) {
      const probs = probsFromCat(ui.outlook[L - 1], confForLead(L, ui.level));
      pending.push({ target: turn + (L - 1), lead: L, probs });
    }
    for (let i = 0; i < TICKS_PER_DAY; i++) step(g.atmo);
    realized = turn;
    const actual = townState(g.atmo).cat;
    const resolvedNow = [];
    pending = pending.filter((f) => {
      if (f.target !== realized) return true;
      scorers[f.lead].record(f.probs, actual);
      resolvedNow.push({ lead: f.lead, pred: f.probs.indexOf(Math.max(...f.probs)), actual });
      return false;
    });
    ui.resolved = { day: realized, actual, items: resolvedNow };
    g.day++;
    if (g.day > DAYS) {
      window.__RESULTS = {
        strategy: 'human', seed,
        lead1: scorers[1].summary(),
        brierByLead: { 1: scorers[1].summary().brier, 2: scorers[2].summary().brier, 3: scorers[3].summary().brier },
        accByLead: { 1: scorers[1].summary().accuracy, 2: scorers[2].summary().accuracy, 3: scorers[3].summary().accuracy },
      };
      window.__DONE = true;
    }
  }

  function refresh() {
    draw(R, g.atmo, ui);
    const ts = townState(g.atmo);
    if (ui.phase === 'place') {
      panel.innerHTML = panelHTML(g.atmo, readInstruments(g.atmo, g.noise, ui.sensors), { cat: ts.cat }, { day: 0 })
        + `<hr><div class="ttl2">Place your weather sensors</div>`
        + `<div class="dim">You have <b>${BUDGET - ui.sensors.length}</b> of ${BUDGET} left. Click the map to place them. Weather blows in from the WEST — a sensor on the incoming air (dashed ring) warns you a day ahead; a sensor placed FARTHER west buys 2–3 days of warning but reads noisier.</div>`
        + `<div class="go" style="margin-top:8px">SPACE — begin the season (${ui.sensors.length}/${BUDGET} placed)</div>`;
      banner.innerHTML = `You are the frontier's weather station. Position your instruments, then forecast each day. Storms you miss cost lives.`;
      return;
    }
    const read = readInstruments(g.atmo, g.noise, ui.sensors);
    const s1 = scorers[1].summary();
    const rows = [0, 1, 2].map((h) =>
      `<div class="opt ${h === ui.horizon ? 'sel' : ''}"><b>${LEAD_LABEL[h]}</b>: ${CATS[ui.outlook[h]]}`
      + (scorers[h + 1].days ? ` <span class="dim">(${(scorers[h + 1].summary().accuracy * 100).toFixed(0)}% so far)</span>` : '') + `</div>`).join('');
    panel.innerHTML = panelHTML(g.atmo, read, { cat: ts.cat }, { day: g.day })
      + `<hr><div class="ttl2">Your 3-day outlook</div>`
      + `<div class="dim">TAB picks a horizon · 1–4 set its sky · Q/W/E confidence</div>`
      + rows
      + `<div class="conf">confidence: <b>${['LOW', 'MED', 'HIGH'][ui.level - 1]}</b> (decays with lead)</div>`
      + `<div class="go">SPACE — issue the outlook &amp; advance the day</div>`;
    if (ui.resolved) {
      const r = ui.resolved;
      const l1 = r.items.find((it) => it.lead === 1);
      const parts = [];
      if (l1) {
        const ok = l1.pred === l1.actual, missed = l1.actual === 3 && l1.pred !== 3;
        parts.push(`Tomorrow-call <b>${CATS[l1.pred]}</b> → <b>${CATS[l1.actual]}</b> ${ok ? '<span style="color:#7fe3a0">✓</span>' : `<span style="color:#ff7a7a">✗${missed ? ' storm hit unwarned' : ''}</span>`}`);
      }
      for (const it of r.items.filter((x) => x.lead > 1)) {
        const ok = it.pred === it.actual;
        parts.push(`your +${it.lead}d outlook (day ${r.day}) <b>${CATS[it.pred]}</b>→<b>${CATS[it.actual]}</b> ${ok ? '<span style="color:#7fe3a0">✓</span>' : '<span style="color:#ff7a7a">✗</span>'}`);
      }
      banner.innerHTML = parts.join(' &nbsp;·&nbsp; ')
        + ` &nbsp;·&nbsp; day ${realized}/${DAYS} · +1d acc <b>${(s1.accuracy * 100).toFixed(0)}%</b> · reputation <b>${s1.reputation}</b>`;
    } else {
      banner.innerHTML = `Read the instruments. Call the next three days — the town plans around your outlook. Longer forecasts are harder.`;
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '4') ui.outlook[ui.horizon] = +e.key - 1;
    if (e.key === 'Tab') { e.preventDefault(); ui.horizon = (ui.horizon + 1) % 3; }
    if (e.key === 'q' || e.key === 'Q') ui.level = 1;
    if (e.key === 'w' || e.key === 'W') ui.level = 2;
    if (e.key === 'e' || e.key === 'E') ui.level = 3;
    if (e.code === 'Space') {
      e.preventDefault();
      if (ui.phase === 'place') { if (ui.sensors.length > 0) ui.phase = 'forecast'; }
      else if (g.day <= DAYS) commitTurn();
    }
    refresh();
  });
  refresh();
}
