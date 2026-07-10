// Rendering: the weather map (this is the screenshot), the instrument panel,
// and the forecast/score cards. The map is category-tinted so a stranger can
// SEE a storm front sweeping toward the town — that is the marketing hook.
import { GW, GH, CELL, TOWN, classify, pressureAt, moistureAt, windAt, prevailingWind } from './atmo.js';
import { CATS } from './atmo.js';

const CAT_COLOR = [
  [232, 196, 90],   // CLEAR  — warm gold
  [150, 160, 170],  // CLOUDY — grey
  [70, 120, 180],   // RAIN   — blue
  [120, 74, 168],   // STORM  — violet
];
const CAT_LABEL_COLOR = ['#f4d47a', '#c3ccd6', '#7db4ee', '#c39cff'];

export function makeRenderer(canvas) {
  return { ctx: canvas.getContext('2d'), canvas };
}

export function draw(R, a, ui) {
  const g = R.ctx;
  g.fillStyle = '#0a0d12';
  g.fillRect(0, 0, GW * CELL, GH * CELL);

  // weather field
  for (let cy = 0; cy < GH; cy++) {
    for (let cx = 0; cx < GW; cx++) {
      const p = pressureAt(a, cx, cy);
      const q = moistureAt(a, cx, cy);
      const cat = classify(p, q);
      const c = CAT_COLOR[cat];
      // brightness from pressure (lows darker/heavier, highs luminous)
      const b = Math.max(0.45, Math.min(1.25, 1 + (p - 1013) / 55));
      g.fillStyle = `rgb(${Math.round(c[0] * b)},${Math.round(c[1] * b)},${Math.round(c[2] * b)})`;
      g.fillRect(cx * CELL, cy * CELL, CELL, CELL);
    }
  }

  // wind arrows
  g.strokeStyle = 'rgba(255,255,255,0.28)';
  g.lineWidth = 1.4;
  for (let cy = 2; cy < GH; cy += 5) {
    for (let cx = 2; cx < GW; cx += 5) {
      const w = windAt(a, cx, cy);
      const len = Math.min(2.4, Math.hypot(w.x, w.y) * 0.28);
      const ox = cx * CELL + CELL / 2, oy = cy * CELL + CELL / 2;
      const nx = w.x / (Math.hypot(w.x, w.y) + 1e-3), ny = w.y / (Math.hypot(w.x, w.y) + 1e-3);
      g.beginPath();
      g.moveTo(ox - nx * len * CELL * 0.5, oy - ny * len * CELL * 0.5);
      g.lineTo(ox + nx * len * CELL * 0.5, oy + ny * len * CELL * 0.5);
      g.stroke();
      g.beginPath();
      g.arc(ox + nx * len * CELL * 0.5, oy + ny * len * CELL * 0.5, 1.8, 0, 7);
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.fill();
    }
  }

  // sensors: the player's placed budget if any, else the two ideal lookouts
  const pw = prevailingWind(a.time);
  const stations = (ui && ui.sensors && ui.sensors.length)
    ? ui.sensors.map((s, i) => ({ x: s.x, y: s.y, label: 'S' + (i + 1) }))
    : [{ x: TOWN.x - pw.x, y: TOWN.y - pw.y, label: 'LOOKOUT I' },
       { x: TOWN.x - pw.x * 2, y: TOWN.y - pw.y * 2, label: 'LOOKOUT II' }];
  for (const s of stations) {
    const sx = s.x * CELL, sy = s.y * CELL;
    g.strokeStyle = '#7fe3ff'; g.lineWidth = 2;
    g.beginPath();
    g.moveTo(sx, sy - 7); g.lineTo(sx + 7, sy); g.lineTo(sx, sy + 7); g.lineTo(sx - 7, sy); g.closePath();
    g.stroke();
    g.fillStyle = '#7fe3ff'; g.font = '10px ui-monospace,monospace';
    g.fillText(s.label, sx - 6, sy - 10);
  }
  // during placement, show where tomorrow's air is coming from
  if (ui && ui.phase === 'place') {
    const nx = (TOWN.x - pw.x) * CELL, ny = (TOWN.y - pw.y) * CELL;
    g.strokeStyle = 'rgba(127,227,255,0.5)'; g.setLineDash([4, 4]); g.lineWidth = 1.5;
    g.beginPath(); g.arc(nx, ny, 16, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(127,227,255,0.85)'; g.font = '10px ui-monospace,monospace';
    g.fillText("tomorrow's air", nx - 34, ny - 20);
  }

  // town
  const tx = TOWN.x * CELL, ty = TOWN.y * CELL;
  g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2;
  g.beginPath(); g.arc(tx, ty, 9, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#111'; g.font = 'bold 11px ui-monospace,monospace';
  g.fillText('TOWN', tx - 15, ty - 13);
}

function bar(g, x, y, w, h, frac, col) {
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x, y, w, h);
  g.fillStyle = col; g.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), h);
}

// Instrument panel + forecast HUD drawn as HTML for crisp text.
export function panelHTML(a, read, today, game) {
  const arrow = read.tend < -1.5 ? '▼▼ falling fast' : read.tend < -0.4 ? '▼ falling'
    : read.tend > 1.5 ? '▲▲ rising fast' : read.tend > 0.4 ? '▲ rising' : '► steady';
  const wdir = windCompass(read.wind);
  const upwindHTML = read.lookNear
    ? `<b style="color:${CAT_LABEL_COLOR[classify(read.lookNear.P, read.lookNear.Q)]}">${CATS[classify(read.lookNear.P, read.lookNear.Q)]}</b>`
    : `<b style="color:#ff9a7a">— no sensor upwind —</b>`;
  return `
  <div class="ttl">STORMWARDEN — Day ${game.day}</div>
  <div class="sub">Frontier Meteorological Station</div>
  <hr>
  <div class="row"><span>Barometer</span><b>${read.P.toFixed(1)} hPa</b></div>
  <div class="tend">${arrow} <span class="dim">(${read.tend >= 0 ? '+' : ''}${read.tend.toFixed(1)} / 12h)</span></div>
  <div class="row"><span>Hygrometer</span><b>${read.Q.toFixed(0)}%</b></div>
  <div class="row"><span>Thermometer</span><b>${read.T.toFixed(1)}°C</b></div>
  <div class="row"><span>Wind vane</span><b>${wdir}</b></div>
  <hr>
  <div class="row"><span>Nearest upwind sensor</span>${upwindHTML}</div>
  <div class="dim">reads the air ~1 day out, headed here</div>
  <hr>
  <div class="row"><span>Today's sky</span><b style="color:${CAT_LABEL_COLOR[today.cat]}">${CATS[today.cat]}</b></div>
  `;
}

function windCompass(w) {
  const ang = Math.atan2(w.y, w.x);
  const dirs = ['→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW', '↑ N', '↗ NE'];
  const i = ((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8;
  const spd = Math.hypot(w.x, w.y);
  return `${dirs[i]} ${spd.toFixed(1)}`;
}
