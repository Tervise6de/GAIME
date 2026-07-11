// Rendering: soil, fields as luminous washes, ants as oriented sparks.
import { W, H, CELL, GW, GH, F } from './world.js';
import { ST, antsAlive } from './sim.js';
import { sfxDelivery, sfxSpiderDeath } from './audio.js';

export function makeRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  // pre-render soil background
  const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const b = bg.getContext('2d');
  b.fillStyle = '#0e0a07'; b.fillRect(0, 0, W, H);
  let s = 12345;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2600; i++) {
    b.fillStyle = `rgba(${30 + r() * 26},${22 + r() * 18},${14 + r() * 12},${0.25 + r() * 0.3})`;
    b.beginPath(); b.arc(r() * W, r() * H, 0.6 + r() * 2.2, 0, 7); b.fill();
  }
  // field overlay canvas (grid resolution, scaled up with smoothing)
  const fc = document.createElement('canvas'); fc.width = GW; fc.height = GH;
  const fctx = fc.getContext('2d');
  const fimg = fctx.createImageData(GW, GH);

  // transient feedback state (render-side only — never touches the sim)
  const fx = { lastBanked: -1, deadSeen: new Set(), pulses: [], bursts: [], lastT: 0 };
  return { ctx, bg, fc, fctx, fimg, fx };
}

// detect sim events by delta and spawn transient feedback
function updateFx(fx, sim) {
  const dt = Math.min(0.05, Math.max(0.008, sim.time - fx.lastT || 0.016));
  fx.lastT = sim.time;
  if (fx.lastBanked < 0) fx.lastBanked = sim.foodBanked;
  if (sim.foodBanked > fx.lastBanked) {
    if (fx.pulses.length < 4) fx.pulses.push({ t: 0 });
    sfxDelivery();
  }
  fx.lastBanked = sim.foodBanked;
  sim.world.spiders.forEach((sp, i) => {
    if (!sp.alive && !fx.deadSeen.has(i)) {
      fx.deadSeen.add(i);
      fx.bursts.push({ x: sp.x, y: sp.y, t: 0 });
      sfxSpiderDeath();
    }
  });
  for (const p of fx.pulses) p.t += dt / 0.7;
  for (const b of fx.bursts) b.t += dt / 1.1;
  fx.pulses = fx.pulses.filter((p) => p.t < 1);
  fx.bursts = fx.bursts.filter((b) => b.t < 1);
}

export function draw(R, sim, ui) {
  const { ctx } = R;
  const { world } = sim;
  updateFx(R.fx, sim);
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(R.bg, 0, 0);

  // rocks
  for (const rk of world.rocks) {
    const g = ctx.createRadialGradient(rk.x - rk.r * 0.3, rk.y - rk.r * 0.4, rk.r * 0.1, rk.x, rk.y, rk.r);
    g.addColorStop(0, '#3a3733'); g.addColorStop(1, '#191715');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(rk.x, rk.y, rk.r, 0, 7); ctx.fill();
  }

  // spider territory rings — the danger must be readable
  for (const sp of world.spiders) {
    if (!sp.alive) continue;
    const pulse = sp.arrived && sim.time - sp.arrived < 4 ? (Math.sin(sim.time * 9) + 1) * 0.06 : 0;
    ctx.fillStyle = `rgba(180,40,30,${0.045 + pulse})`;
    ctx.beginPath(); ctx.arc(sp.hx, sp.hy, sp.tr, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgba(255,80,60,${0.22 + pulse * 2})`;
    ctx.setLineDash([8, 10]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sp.hx, sp.hy, sp.tr, 0, 7); ctx.stroke();
    ctx.setLineDash([]);
  }

  // fields → single RGBA image (additive feel via channel mixing)
  const L = world.fields[F.LURE], Fe = world.fields[F.FEAR], Wr = world.fields[F.WAR], T = world.fields[F.TRAIL];
  const d = R.fimg.data;
  for (let i = 0, p = 0; i < L.length; i++, p += 4) {
    const l = L[i], f = Fe[i], w = Wr[i], t = T[i];
    // LURE cyan, FEAR violet, WAR red, TRAIL warm white
    const rr = w * 235 + f * 120 + t * 150;
    const gg = l * 190 + t * 170 + w * 40;
    const bb = l * 170 + f * 235 + t * 120;
    const a = Math.min(0.85, l * 0.55 + f * 0.5 + w * 0.6 + t * 0.75);
    d[p] = Math.min(255, rr); d[p + 1] = Math.min(255, gg); d[p + 2] = Math.min(255, bb);
    d[p + 3] = a * 255;
  }
  R.fctx.putImageData(R.fimg, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(R.fc, 0, 0, GW, GH, 0, 0, W, H);
  ctx.restore();

  // food piles
  for (const p of world.piles) {
    if (p.amount <= 0) continue;
    const rr = p.r * (0.35 + 0.65 * Math.min(1, p.amount / 600));
    const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, rr);
    g.addColorStop(0, '#ffe9a8'); g.addColorStop(0.55, '#e8a93d'); g.addColorStop(1, 'rgba(120,70,10,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 7); ctx.fill();
  }

  // nest
  {
    const n = world.nest;
    const g = ctx.createRadialGradient(n.x, n.y, 2, n.x, n.y, n.r + 26);
    g.addColorStop(0, '#ffd9a0'); g.addColorStop(0.4, '#7a4b20'); g.addColorStop(1, 'rgba(40,22,8,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 26, 0, 7); ctx.fill();
    // delivery pulses: a ripple of plenty spreading from the granary
    for (const p of R.fx.pulses) {
      ctx.strokeStyle = `rgba(255,220,150,${0.55 * (1 - p.t)})`;
      ctx.lineWidth = 2.5 * (1 - p.t) + 0.5;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4 + p.t * 46, 0, 7); ctx.stroke();
    }
  }

  // ants — oriented 3px streaks, colored by role
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < sim.count; i++) {
    if (!sim.alive[i]) continue;
    const x = sim.ax[i], y = sim.ay[i], h = sim.ah[i];
    const st = sim.astate[i];
    ctx.strokeStyle = st === ST.SOLDIER ? 'rgba(255,96,80,0.95)'
                    : sim.acarry[i]     ? 'rgba(255,205,110,0.95)'
                                        : 'rgba(150,235,225,0.8)';
    ctx.lineWidth = st === ST.SOLDIER ? 2.2 : 1.6;
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(h) * 2.6, y - Math.sin(h) * 2.6);
    ctx.lineTo(x + Math.cos(h) * 2.6, y + Math.sin(h) * 2.6);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';

  // spiders
  for (const sp of world.spiders) {
    if (!sp.alive) continue;
    ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(sp.a);
    ctx.strokeStyle = '#2b0f0c'; ctx.lineWidth = 2.4;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI - Math.PI / 2 + 0.35;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-Math.cos(a) * 16, Math.sin(a) * 16); ctx.stroke();
    }
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 11);
    g.addColorStop(0, '#6e1f18'); g.addColorStop(1, '#240b08');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.fill();
    ctx.restore();
    // hp arc
    ctx.strokeStyle = 'rgba(255,90,70,0.8)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 15, -Math.PI / 2, -Math.PI / 2 + (sp.hp / sp.maxhp) * Math.PI * 2); ctx.stroke();
  }

  // hunter death bursts: shockwave ring + flying sparks
  ctx.globalCompositeOperation = 'lighter';
  for (const b of R.fx.bursts) {
    const e = 1 - (1 - b.t) * (1 - b.t); // ease-out
    ctx.strokeStyle = `rgba(255,140,90,${0.8 * (1 - b.t)})`;
    ctx.lineWidth = 3 * (1 - b.t) + 0.5;
    ctx.beginPath(); ctx.arc(b.x, b.y, 6 + e * 70, 0, 7); ctx.stroke();
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + b.x; // stable per-burst spray angles
      const rr = 8 + e * (46 + (k % 3) * 14);
      ctx.fillStyle = `rgba(255,${170 - k * 8},80,${0.9 * (1 - b.t)})`;
      ctx.beginPath();
      ctx.arc(b.x + Math.cos(a) * rr, b.y + Math.sin(a) * rr, 2.2 * (1 - b.t) + 0.4, 0, 7);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // brush cursor + tool label
  if (ui && ui.showBrush) {
    const toolCol = ['rgba(89,227,210,0.8)', 'rgba(176,140,255,0.8)', 'rgba(255,106,94,0.8)'][ui.tool];
    ctx.strokeStyle = toolCol;
    ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(ui.mx, ui.my, ui.brush, 0, 7); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = toolCol;
    ctx.font = 'bold 11px ui-monospace, monospace';
    ctx.fillText(['LURE', 'FEAR', 'RALLY'][ui.tool], ui.mx + ui.brush * 0.72, ui.my - ui.brush * 0.72);
  }
}

export function hudText(sim, fps, SCEN) {
  const left = Math.max(0, SCEN.timeLimit - sim.time);
  const alive = antsAlive(sim);
  const colonyWarn = alive < SCEN.colonyFloor * 1.4 ? ' style="color:#ff8a70"' : '';
  const pct = Math.min(100, (sim.foodStock / SCEN.quota) * 100).toFixed(0);
  return `HIVEMIND — the first season
stores <b>${sim.foodStock.toFixed(0)} / ${SCEN.quota}</b> (${pct}%) · winter in <b>${left.toFixed(0)}s</b>
colony <span${colonyWarn}>${alive}</span> (keep above ${SCEN.colonyFloor})${sim.broodHeld ? ' · <span style="color:#c9a0ff">brood held</span>' : ''} · fallen ${sim.antsDied} · hunters slain ${sim.spidersKilled}
${fps} fps`;
}

export function drawEndCard(ctx, s, SCEN) {
  ctx.fillStyle = 'rgba(8,6,5,0.78)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = s.won ? '#8ee6c2' : '#ff8a70';
  ctx.font = 'bold 54px Georgia, serif';
  ctx.fillText(s.won ? 'THE COLONY ENDURES' : 'THE COLONY FALLS', W / 2, 250);
  ctx.fillStyle = '#e8e2d2'; ctx.font = '19px Georgia, serif';
  ctx.fillText(s.reason || '', W / 2, 296);
  ctx.font = '15px ui-monospace, monospace';
  ctx.fillStyle = 'rgba(232,226,210,0.85)';
  const lines = [
    `stores ${s.foodStock} / ${SCEN.quota}   ·   gathered ${s.gathered}   ·   season lasted ${s.time}s`,
    `colony ${s.colony}   ·   fallen ${s.died}   ·   hunters slain ${s.spidersSlain}`,
  ];
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 345 + i * 26));
  ctx.fillStyle = 'rgba(200,230,215,0.75)';
  ctx.font = 'bold 15px ui-monospace, monospace';
  ctx.fillText('[R] same season again      [N] new territory', W / 2, 430);
  ctx.textAlign = 'left';
}

export function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(8,6,5,0.68)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9fe8dc';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('H I V E M I N D', W / 2, 268);
  ctx.fillStyle = 'rgba(232,226,210,0.9)';
  ctx.font = 'italic 21px Georgia, serif';
  ctx.fillText('the colony is not yours to command — only to persuade', W / 2, 312);
  ctx.font = '15px ui-monospace, monospace';
  ctx.fillStyle = 'rgba(200,230,215,0.85)';
  ctx.fillText('paint scent, not orders: [1] LURE roads · [2] FEAR walls · [3] RALLY warbands', W / 2, 380);
  ctx.fillText('fill the winter stores before the season ends · keep the colony alive', W / 2, 406);
  ctx.fillStyle = '#ffe9bd';
  ctx.font = 'bold 17px ui-monospace, monospace';
  ctx.fillText('— click to begin the first season —', W / 2, 470);
  ctx.textAlign = 'left';
}
