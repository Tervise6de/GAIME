// Rendering: frontier map with isobars, weather systems, wind; instrument
// panel; forecast controls. Whole UI is canvas-drawn (hit zones for input).
import { MAP_W, MAP_H, TOWN, OUTPOSTS, pressureAt, windAt, humidityAt, precipAt } from './atmo.js';

export const W = 1280, H = 720;
const PANEL_X = MAP_W;

export const PRECIP_LABEL = ['CLEAR', 'RAIN', 'STORM'];
export const TEMP_LABEL = ['COOL', 'MILD', 'HOT'];

export function drawMap(ctx, a, dayNo, hourInDay) {
  // base terrain
  const g = ctx.createLinearGradient(0, 0, MAP_W, 0);
  g.addColorStop(0, '#12212e'); g.addColorStop(0.22, '#16283a');
  g.addColorStop(0.25, '#1d2b26'); g.addColorStop(1, '#232a1e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, MAP_W, H);
  // ocean
  ctx.fillStyle = '#0f2233';
  ctx.beginPath(); ctx.moveTo(0, 0);
  for (let y = 0; y <= H; y += 24) ctx.lineTo(185 + Math.sin(y * 0.02 + 1) * 22, y);
  ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  // mountains east
  ctx.strokeStyle = 'rgba(160,150,120,0.25)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const mx = 800 + (i % 3) * 26, my = 90 + i * 82;
    ctx.beginPath(); ctx.moveTo(mx - 14, my + 10); ctx.lineTo(mx, my - 10); ctx.lineTo(mx + 14, my + 10); ctx.stroke();
  }
  // humidity shading (cloud cover) — coarse grid upscaled smoothly
  if (!drawMap._cloud) {
    drawMap._cloud = document.createElement('canvas');
    drawMap._cloud.width = 30; drawMap._cloud.height = 24;
  }
  const cc = drawMap._cloud.getContext('2d');
  const ci = cc.createImageData(30, 24);
  for (let gy = 0; gy < 24; gy++) for (let gx = 0; gx < 30; gx++) {
    const rh = humidityAt(a, (gx + 0.5) * (MAP_W / 30), (gy + 0.5) * (H / 24));
    const p = (gy * 30 + gx) * 4;
    ci.data[p] = 205; ci.data[p + 1] = 212; ci.data[p + 2] = 222;
    ci.data[p + 3] = Math.max(0, (rh - 0.58)) * 330;
  }
  cc.putImageData(ci, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(drawMap._cloud, 0, 0, 30, 24, 0, 0, MAP_W, H);
  // isobars via marching-squares-lite on a coarse grid
  const NX = 45, NY = 36, cw = MAP_W / NX, chh = H / NY;
  const P = new Float32Array((NX + 1) * (NY + 1));
  for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) P[j * (NX + 1) + i] = pressureAt(a, i * cw, j * chh);
  ctx.lineWidth = 1;
  for (let level = 984; level <= 1040; level += 4) {
    ctx.strokeStyle = level < 1013 ? 'rgba(255,120,90,0.34)' : 'rgba(120,190,255,0.30)';
    ctx.beginPath();
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const a0 = P[j * (NX + 1) + i], b0 = P[j * (NX + 1) + i + 1];
      const c0 = P[(j + 1) * (NX + 1) + i + 1], d0 = P[(j + 1) * (NX + 1) + i];
      const x0 = i * cw, y0 = j * chh;
      const pts = [];
      const edge = (v1, v2, x1, y1, x2, y2) => {
        if ((v1 < level) !== (v2 < level)) {
          const t = (level - v1) / (v2 - v1);
          pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
        }
      };
      edge(a0, b0, x0, y0, x0 + cw, y0);
      edge(b0, c0, x0 + cw, y0, x0 + cw, y0 + chh);
      edge(c0, d0, x0 + cw, y0 + chh, x0, y0 + chh);
      edge(d0, a0, x0, y0 + chh, x0, y0);
      if (pts.length === 2) { ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); }
    }
    ctx.stroke();
  }
  // pressure centers
  ctx.font = 'bold 26px Georgia, serif'; ctx.textAlign = 'center';
  for (const s of a.systems) {
    if (s.x < -40 || s.x > MAP_W + 40) continue;
    const low = s.str < 0;
    ctx.fillStyle = low ? 'rgba(255,110,80,0.9)' : 'rgba(130,200,255,0.9)';
    ctx.fillText(low ? 'L' : 'H', s.x, s.y + 9);
    ctx.strokeStyle = low ? 'rgba(255,110,80,0.25)' : 'rgba(130,200,255,0.2)';
    ctx.beginPath(); ctx.arc(s.x, s.y, Math.abs(s.str) * 2.2, 0, 7); ctx.stroke();
  }
  // wind arrows (sparse)
  ctx.strokeStyle = 'rgba(220,230,235,0.35)'; ctx.lineWidth = 1.2;
  for (let gy = 0; gy < 9; gy++) for (let gx = 0; gx < 11; gx++) {
    const x = gx * 82 + 40, y = gy * 82 + 40;
    const w = windAt(a, x, y);
    const L = Math.min(24, 5 + w.spd * 0.5);
    const ux = (w.wx / (w.spd + 0.01)) * L, uy = (w.wy / (w.spd + 0.01)) * L;
    ctx.beginPath(); ctx.moveTo(x - ux / 2, y - uy / 2); ctx.lineTo(x + ux / 2, y + uy / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + ux / 2, y + uy / 2, 1.6, 0, 7); ctx.fill();
  }
  // outposts & town
  for (const o of OUTPOSTS) {
    ctx.fillStyle = '#c9b98a';
    ctx.fillRect(o.x - 4, o.y - 4, 8, 8);
    ctx.font = '11px ui-monospace'; ctx.fillText(o.name, o.x, o.y - 10);
  }
  const tp = precipAt(a, TOWN.x, TOWN.y);
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath(); ctx.arc(TOWN.x, TOWN.y, 7, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,217,138,0.5)'; ctx.beginPath(); ctx.arc(TOWN.x, TOWN.y, 12, 0, 7); ctx.stroke();
  ctx.font = 'bold 13px Georgia'; ctx.fillText('HALDANE', TOWN.x, TOWN.y - 18);
  // active precip at town
  if (tp.cat > 0) {
    ctx.strokeStyle = tp.cat === 2 ? 'rgba(255,230,120,0.8)' : 'rgba(140,180,235,0.7)';
    for (let i = 0; i < (tp.cat === 2 ? 26 : 14); i++) {
      const rx = TOWN.x - 40 + (i * 37) % 80, ry = TOWN.y - 46 + (i * 23) % 34;
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 9); ctx.stroke();
    }
  }
  // header
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(230,220,190,0.9)'; ctx.font = '15px Georgia';
  ctx.fillText(`Territory of Haldane — Day ${dayNo}, ${String(hourInDay).padStart(2, '0')}:00`, 14, 24);
}

function dial(ctx, x, y, r, frac, label, value, color) {
  ctx.strokeStyle = 'rgba(200,190,160,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 0.75, Math.PI * 0.75 + Math.max(0.02, frac) * Math.PI * 1.5); ctx.stroke();
  ctx.fillStyle = '#e8dfc8'; ctx.font = 'bold 15px ui-monospace'; ctx.textAlign = 'center';
  ctx.fillText(value, x, y + 5);
  ctx.fillStyle = 'rgba(200,190,160,0.7)'; ctx.font = '11px ui-monospace';
  ctx.fillText(label, x, y + r + 16);
}

export function drawPanel(ctx, inst, game) {
  ctx.fillStyle = '#151310'; ctx.fillRect(PANEL_X, 0, W - PANEL_X, H);
  ctx.strokeStyle = 'rgba(200,180,130,0.25)'; ctx.strokeRect(PANEL_X + 0.5, 0.5, W - PANEL_X - 1, H - 1);
  const cx = PANEL_X + (W - PANEL_X) / 2;
  ctx.fillStyle = '#e8dfc8'; ctx.font = 'bold 17px Georgia'; ctx.textAlign = 'center';
  ctx.fillText('STORMWARDEN', cx, 30);
  ctx.font = '11px ui-monospace'; ctx.fillStyle = 'rgba(200,190,160,0.6)';
  ctx.fillText('territorial weather office', cx, 46);

  if (inst) {
    // dials
    const pf = Math.min(1, Math.max(0, (inst.p - 985) / 50));
    dial(ctx, PANEL_X + 70, 110, 34, pf, 'BAROMETER', inst.p.toFixed(0), inst.pTrend < -1.5 ? '#ff7a5e' : '#8fc7ff');
    dial(ctx, PANEL_X + 190, 110, 34, inst.rh, 'HYGROMETER', (inst.rh * 100).toFixed(0) + '%', '#9fd6b7');
    dial(ctx, PANEL_X + 310, 110, 34, Math.min(1, inst.windSpd / 60), 'ANEMOMETER', inst.windSpd.toFixed(0), '#e8d27d');
    // trend + wind dir + sky
    ctx.textAlign = 'left'; ctx.font = '13px ui-monospace';
    ctx.fillStyle = inst.pTrend < 0 ? '#ff9a80' : '#9fd0ff';
    const arrow = inst.pTrend < -4 ? '↓↓' : inst.pTrend < -1.5 ? '↓' : inst.pTrend > 1.5 ? '↑' : '→';
    ctx.fillText(`pressure 24h: ${arrow} ${inst.pTrend >= 0 ? '+' : ''}${inst.pTrend.toFixed(1)} hPa`, PANEL_X + 24, 168);
    const dirs = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
    const di = ((Math.round((inst.windDir + Math.PI) / (Math.PI / 4)) % 8) + 8) % 8;
    ctx.fillStyle = '#e8dfc8';
    ctx.fillText(`wind from ${dirs[di]} at ${inst.windSpd.toFixed(0)} kn`, PANEL_X + 24, 188);
    ctx.fillText(`glass reads ${inst.temp.toFixed(1)}°C — sky: ${inst.sky}`, PANEL_X + 24, 208);
    // outpost telegrams (near outposts + far stations)
    ctx.fillStyle = 'rgba(200,190,160,0.75)'; ctx.font = '12px ui-monospace';
    ctx.fillText('— TELEGRAPH —', PANEL_X + 24, 236);
    inst.outs.forEach((o, i) => {
      const tr = o.trend < -4 ? 'FALLING FAST' : o.trend < -1.5 ? 'falling' : o.trend > 1.5 ? 'rising' : 'steady';
      ctx.fillStyle = o.trend < -4 ? '#ff9a80' : '#cfc4a4';
      ctx.fillText(`${o.name}: ${o.p.toFixed(0)} hPa, ${tr}, wind ${o.windSpd.toFixed(0)}`, PANEL_X + 24, 254 + i * 17);
    });
  }

  // forecast controls
  ctx.fillStyle = 'rgba(200,190,160,0.75)'; ctx.font = '12px ui-monospace'; ctx.textAlign = 'left';
  ctx.fillText("— TOMORROW'S FORECAST —", PANEL_X + 24, 340);
  drawChoices(ctx, PRECIP_LABEL, game.fPrecip, PANEL_X + 24, 352, 108, ['#bcd6e8', '#7fb4e0', '#ffd97d']);
  drawChoices(ctx, TEMP_LABEL, game.fTemp, PANEL_X + 24, 392, 108, ['#a9c9e8', '#b8d9a8', '#f0b27d']);
  // confidence toggle
  ctx.fillStyle = game.fConf ? 'rgba(255,217,125,0.25)' : 'rgba(120,120,120,0.15)';
  ctx.fillRect(PANEL_X + 24, 432, 160, 30);
  ctx.strokeStyle = 'rgba(200,190,160,0.5)'; ctx.strokeRect(PANEL_X + 24.5, 432.5, 160, 30);
  ctx.fillStyle = '#e8dfc8'; ctx.font = 'bold 12px ui-monospace';
  ctx.fillText(game.fConf ? 'CONFIDENT CALL' : 'hedged call', PANEL_X + 40, 452);
  // commit button
  ctx.fillStyle = 'rgba(140,200,150,0.22)';
  ctx.fillRect(PANEL_X + 210, 432, 146, 30);
  ctx.strokeStyle = 'rgba(160,220,170,0.6)'; ctx.strokeRect(PANEL_X + 210.5, 432.5, 146, 30);
  ctx.fillStyle = '#cfe8d2'; ctx.fillText('ISSUE FORECAST →', PANEL_X + 226, 452);

  // reputation + ledger
  ctx.fillStyle = 'rgba(200,190,160,0.75)'; ctx.font = '12px ui-monospace';
  ctx.fillText(`REPUTATION ${game.rep}/100 · day ${game.day}`, PANEL_X + 24, 494);
  ctx.fillStyle = 'rgba(232,223,200,0.4)'; ctx.fillRect(PANEL_X + 24, 502, 332, 5);
  ctx.fillStyle = game.rep > 60 ? '#9fd6b7' : game.rep > 30 ? '#e8d27d' : '#ff8a70';
  ctx.fillRect(PANEL_X + 24, 502, 332 * Math.min(1, game.rep / 100), 5);
  ctx.font = '11px ui-monospace';
  game.ledger.slice(-10).forEach((l, i) => {
    ctx.fillStyle = l.ok ? 'rgba(159,214,183,0.85)' : 'rgba(255,138,112,0.85)';
    ctx.fillText(l.text.slice(0, 44), PANEL_X + 24, 526 + i * 17);
  });
  ctx.textAlign = 'left';
}

function drawChoices(ctx, labels, sel, x, y, w, colors) {
  labels.forEach((lb, i) => {
    const bx = x + i * (w + 4);
    ctx.fillStyle = sel === i ? hexA(colors[i], 0.3) : 'rgba(120,120,120,0.12)';
    ctx.fillRect(bx, y, w, 30);
    ctx.strokeStyle = sel === i ? hexA(colors[i], 0.9) : 'rgba(200,190,160,0.35)';
    ctx.strokeRect(bx + 0.5, y + 0.5, w, 30);
    ctx.fillStyle = sel === i ? '#fff' : 'rgba(232,223,200,0.75)';
    ctx.font = 'bold 12px ui-monospace'; ctx.textAlign = 'center';
    ctx.fillText(lb, bx + w / 2, y + 20);
  });
  ctx.textAlign = 'left';
}

function hexA(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// hit zones for input (must match drawPanel layout)
export function hitZones() {
  const z = [];
  for (let i = 0; i < 3; i++) z.push({ id: 'precip' + i, x: PANEL_X + 24 + i * 112, y: 352, w: 108, h: 30 });
  for (let i = 0; i < 3; i++) z.push({ id: 'temp' + i, x: PANEL_X + 24 + i * 112, y: 392, w: 108, h: 30 });
  z.push({ id: 'conf', x: PANEL_X + 24, y: 432, w: 160, h: 30 });
  z.push({ id: 'commit', x: PANEL_X + 210, y: 432, w: 146, h: 30 });
  return z;
}

export function drawResolution(ctx, res) {
  // banner after a day resolves
  ctx.fillStyle = 'rgba(10,8,6,0.82)';
  ctx.fillRect(140, 250, MAP_W - 280, 190);
  ctx.strokeStyle = 'rgba(200,180,130,0.5)'; ctx.strokeRect(140.5, 250.5, MAP_W - 280, 190);
  ctx.textAlign = 'center'; ctx.fillStyle = res.ok ? '#9fd6b7' : '#ff8a70';
  ctx.font = 'bold 22px Georgia';
  ctx.fillText(res.headline, MAP_W / 2, 296);
  ctx.fillStyle = '#e8dfc8'; ctx.font = '15px Georgia';
  ctx.fillText(res.detail, MAP_W / 2, 330);
  ctx.fillStyle = 'rgba(200,190,160,0.8)'; ctx.font = '13px ui-monospace';
  ctx.fillText(res.consequence, MAP_W / 2, 362);
  ctx.fillText('(click anywhere to continue)', MAP_W / 2, 412);
  ctx.textAlign = 'left';
}
