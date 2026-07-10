// Game loop: morning briefing -> forecast -> day resolves -> consequences.
// Auto mode runs bot forecasters over many days for the falsification test.
import { makeAtmo, advanceDay, readInstruments, stepHour, TOWN } from './atmo.js';
import { W, H, drawMap, drawPanel, drawResolution, hitZones, PRECIP_LABEL, TEMP_LABEL } from './render.js';
import { BOTS } from './bots.js';

const q = new URLSearchParams(location.search);
const seed = parseInt(q.get('seed') || '11', 10);
const autoName = q.get('auto');
const autoDays = parseInt(q.get('days') || '120', 10);

const canvas = document.getElementById('cv');
const ctx = canvas.getContext('2d');
const atmo = makeAtmo(seed);
// warm up: 3 days of history so instruments have trends on day 1
for (let i = 0; i < 72; i++) stepHour(atmo);

const game = {
  day: 1, rep: 50, score: 0,
  fPrecip: 0, fTemp: 1, fConf: false,
  ledger: [],
  phase: 'forecast',       // forecast | animating | resolution | done
  lastTruth: null,         // yesterday's actual weather (for persistence bots/US)
  anim: null,
};

window.__GAME = game;
window.__DONE = false;

function scoreForecast(f, truth, conf) {
  let pts = 0, ok = f.precip === truth.precip;
  if (ok) pts += conf ? 15 : 8;
  else pts -= conf ? 15 : 5;
  // storm-specific stakes
  let consequence = 'A quiet day in Haldane.';
  if (truth.precip === 2 && f.precip !== 2) { pts -= 25; consequence = 'UNWARNED STORM — barns wrecked, two herders missing.'; }
  if (truth.precip === 2 && f.precip === 2) { pts += 20; consequence = 'Storm warning heeded: stock sheltered, no losses.'; }
  if (truth.precip !== 2 && f.precip === 2) { pts -= 12; consequence = 'False storm alarm — a day of work lost to shutters.'; }
  if (truth.precip === 1 && f.precip === 1) consequence = 'Rain called right — hay covered in time.';
  if (truth.precip === 1 && f.precip === 0) consequence = 'Unforecast rain soaked the cut hay.';
  if (f.temp === truth.temp) pts += 4;
  return { pts, ok, consequence };
}

function commitForecast(f) {
  const truth = advanceDay(atmo);
  const { pts, ok, consequence } = scoreForecast(f, truth, game.fConf);
  game.rep = Math.max(0, Math.min(100, game.rep + Math.round(pts / 2)));
  game.score += pts;
  const line = `d${game.day} called ${PRECIP_LABEL[f.precip]}/${TEMP_LABEL[f.temp]} → was ${PRECIP_LABEL[truth.precip]}/${TEMP_LABEL[truth.temp]}`;
  game.ledger.push({ ok, text: (ok ? '✓ ' : '✗ ') + line });
  game.lastTruth = truth;
  game.day++;
  return { truth, pts, ok, consequence };
}

// ---------- DATA DUMP (for offline rule fitting) ----------
if (autoName === 'dump') {
  const rows = [];
  let today = null;
  for (let d = 0; d < autoDays; d++) {
    const inst = readInstruments(atmo);
    const westLow = Math.min(inst.outs[0].p, inst.outs[1].p);
    const farLow = Math.min(inst.outs[2].p, inst.outs[3].p);
    const truth = advanceDay(atmo);
    rows.push({
      pTrend: +inst.pTrend.toFixed(2),
      westDelta: +(inst.p - westLow).toFixed(2),
      westFall: +Math.min(inst.outs[0].trend, inst.outs[1].trend).toFixed(2),
      farDelta: +(inst.p - farLow).toFixed(2),
      farFall: +Math.min(inst.outs[2].trend, inst.outs[3].trend).toFixed(2),
      farP: +farLow.toFixed(1),
      rh: +inst.rh.toFixed(3),
      wind: +inst.windSpd.toFixed(1),
      p: +inst.p.toFixed(1),
      yt: today ? today.precip : 0,
      truth: truth.precip,
    });
    today = truth;
  }
  window.__RESULTS = { strategy: 'dump', seed, rows };
  window.__DONE = true;
}

// ---------- AUTO (falsification) MODE ----------
if (autoName && autoName !== 'dump') {
  const results = { strategy: autoName, seed, days: autoDays };
  const counts = { precipHit: 0, tempHit: 0, stormDays: 0, wetDays: 0, stormHit: 0, stormFalse: 0, score: 0 };
  const bot = BOTS[autoName];
  let today = null;
  for (let d = 0; d < autoDays; d++) {
    const inst = readInstruments(atmo);
    const f = bot(inst, today);
    const truth = advanceDay(atmo);
    if (f.precip === truth.precip) counts.precipHit++;
    if (f.temp === truth.temp) counts.tempHit++;
    if (truth.precip >= 1) counts.wetDays++;
    if (truth.precip === 2) { counts.stormDays++; if (f.precip === 2) counts.stormHit++; }
    if (truth.precip !== 2 && f.precip === 2) counts.stormFalse++;
    counts.score += scoreForecast(f, truth, false).pts;
    today = truth;
  }
  results.precipAcc = +(counts.precipHit / autoDays).toFixed(3);
  results.tempAcc = +(counts.tempHit / autoDays).toFixed(3);
  results.wetRate = +(counts.wetDays / autoDays).toFixed(3);
  results.stormRate = +(counts.stormDays / autoDays).toFixed(3);
  results.stormRecall = counts.stormDays ? +(counts.stormHit / counts.stormDays).toFixed(3) : null;
  results.stormFalseAlarms = counts.stormFalse;
  results.totalScore = counts.score;
  window.__RESULTS = results;
  window.__DONE = true;
}

// ---------- INTERACTIVE MODE ----------
const zones = hitZones();
canvas.addEventListener('click', (e) => {
  if (autoName) return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (W / r.width), y = (e.clientY - r.top) * (H / r.height);
  if (game.phase === 'resolution') { game.phase = 'forecast'; return; }
  if (game.phase !== 'forecast') return;
  for (const z of zones) {
    if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
      if (z.id.startsWith('precip')) game.fPrecip = +z.id[6];
      else if (z.id.startsWith('temp')) game.fTemp = +z.id[4];
      else if (z.id === 'conf') game.fConf = !game.fConf;
      else if (z.id === 'commit') {
        const res = commitForecast({ precip: game.fPrecip, temp: game.fTemp });
        game.anim = { frames: res.truth.frames, i: 0, res };
        game.phase = 'animating';
      }
    }
  }
});

let animAtmoIdx = 0;
function frame() {
  if (game.phase === 'animating' && game.anim) {
    // play the day passing: step through recorded hourly snapshots quickly
    game.anim.i += 1.2;
    if (game.anim.i >= 24) {
      game.phase = 'resolution';
      game.anim.i = 23;
    }
  }
  const hourInDay = game.phase === 'animating' ? Math.floor(game.anim.i) : 8;
  drawMap(ctx, atmo, game.day, hourInDay);
  drawPanel(ctx, readInstruments(atmo), game);
  if (game.phase === 'resolution' && game.anim) {
    const r = game.anim.res;
    drawResolution(ctx, {
      ok: r.ok,
      headline: r.ok ? 'THE FORECAST HELD' : 'THE SKY DISAGREED',
      detail: `You called ${PRECIP_LABEL[game.ledger.at(-1) ? game.fPrecip : 0]} — the day brought ${PRECIP_LABEL[r.truth.precip]} (${r.truth.rainH}h rain, gusts ${r.truth.maxW})`,
      consequence: r.consequence,
    });
  }
  requestAnimationFrame(frame);
}
if (!autoName) requestAnimationFrame(frame);
else drawMap(ctx, atmo, game.day, 8), drawPanel(ctx, readInstruments(atmo), game);
