// Rendering: soil, fields as luminous washes, ants as oriented sparks.
import { W, H, CELL, GW, GH, F } from './world.js';
import { ST, antsAlive } from './sim.js';
import { sfxDelivery, sfxSpiderDeath } from './audio.js';
import { SCENARIO } from './scenario.js';

export function makeRenderer(canvas, world) {
  const ctx = canvas.getContext('2d');
  // pre-render the whole static world into one background: soil, rocks,
  // grain scatter, nest mound. Nothing here moves, so bake it once — richer
  // texture for stills at zero per-frame cost. Seeded LCG keeps it stable.
  const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  const b = bg.getContext('2d');
  let s = 12345;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  b.fillStyle = '#0e0a07'; b.fillRect(0, 0, W, H);
  // large soft mottling — the ground reads as earth, not void
  for (let i = 0; i < 90; i++) {
    const x = r() * W, y = r() * H, rad = 60 + r() * 150;
    const g = b.createRadialGradient(x, y, 0, x, y, rad);
    const warm = r() < 0.5;
    g.addColorStop(0, warm ? `rgba(46,32,18,${0.10 + r() * 0.12})` : `rgba(28,30,18,${0.08 + r() * 0.10})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = g; b.beginPath(); b.arc(x, y, rad, 0, 7); b.fill();
  }
  // fine grit
  for (let i = 0; i < 2600; i++) {
    b.fillStyle = `rgba(${30 + r() * 26},${22 + r() * 18},${14 + r() * 12},${0.25 + r() * 0.3})`;
    b.beginPath(); b.arc(r() * W, r() * H, 0.6 + r() * 2.2, 0, 7); b.fill();
  }
  // pebbles and twigs
  for (let i = 0; i < 210; i++) {
    const x = r() * W, y = r() * H;
    if (r() < 0.72) {
      b.fillStyle = `rgba(${52 + r() * 30},${42 + r() * 22},${30 + r() * 14},${0.35 + r() * 0.3})`;
      b.beginPath(); b.ellipse(x, y, 1.5 + r() * 3.4, 1 + r() * 2.2, r() * 3.14, 0, 7); b.fill();
    } else {
      const a = r() * 3.14, len = 5 + r() * 12;
      b.strokeStyle = `rgba(${58 + r() * 26},${44 + r() * 18},${26 + r() * 12},${0.30 + r() * 0.25})`;
      b.lineWidth = 0.8 + r();
      b.beginPath(); b.moveTo(x, y); b.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); b.stroke();
    }
  }
  if (world) {
    // rocks: irregular craggy silhouettes with lit faces, not gray bubbles
    for (const rk of world.rocks) {
      const pts = [];
      const n = 11;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const rr = rk.r * (0.82 + r() * 0.30);
        pts.push([rk.x + Math.cos(a) * rr, rk.y + Math.sin(a) * rr]);
      }
      b.save();
      b.beginPath(); b.moveTo(pts[0][0], pts[0][1]);
      for (const [px, py] of pts.slice(1)) b.lineTo(px, py);
      b.closePath();
      const g = b.createRadialGradient(rk.x - rk.r * 0.35, rk.y - rk.r * 0.45, rk.r * 0.1, rk.x, rk.y, rk.r * 1.15);
      g.addColorStop(0, '#38332c'); g.addColorStop(0.5, '#211d19'); g.addColorStop(1, '#0f0d0b');
      b.fillStyle = g; b.fill();
      b.clip();
      // short shadow chords + faint lichen — texture without wireframe seams
      for (let k = 0; k < 5; k++) {
        const a0 = r() * 6.28;
        const x0 = rk.x + Math.cos(a0) * rk.r * (0.2 + r() * 0.6);
        const y0 = rk.y + Math.sin(a0) * rk.r * (0.2 + r() * 0.6);
        const a1 = r() * 6.28, len = rk.r * (0.25 + r() * 0.35);
        b.strokeStyle = `rgba(8,7,6,${0.25 + r() * 0.2})`; b.lineWidth = 0.8 + r();
        b.beginPath(); b.moveTo(x0, y0);
        b.lineTo(x0 + Math.cos(a1) * len, y0 + Math.sin(a1) * len); b.stroke();
      }
      for (let k = 0; k < 5; k++) {
        b.fillStyle = `rgba(${58 + r() * 24},${64 + r() * 24},${36 + r() * 14},${0.06 + r() * 0.08})`;
        b.beginPath();
        b.arc(rk.x + (r() - 0.5) * rk.r * 1.4, rk.y + (r() - 0.5) * rk.r * 1.4, 2 + r() * 5, 0, 7);
        b.fill();
      }
      b.restore();
      // grounding shadow
      b.fillStyle = 'rgba(0,0,0,0.30)';
      b.beginPath(); b.ellipse(rk.x + rk.r * 0.12, rk.y + rk.r * 0.30, rk.r * 1.02, rk.r * 0.55, 0, 0, 7); b.fill();
    }
    // grain scatter around each pile: the food reads as spilled seed
    for (const p of world.piles) {
      for (let k = 0; k < 46; k++) {
        const a = r() * 6.28, d = p.r * (0.4 + r() * 1.7);
        b.fillStyle = `rgba(${190 + r() * 60},${140 + r() * 60},${50 + r() * 40},${0.14 + r() * 0.20})`;
        b.beginPath();
        b.ellipse(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 1 + r() * 1.6, 0.7 + r(), r() * 3.14, 0, 7);
        b.fill();
      }
    }
    // nest mound: excavated earth rings
    const n = world.nest;
    for (let k = 4; k >= 1; k--) {
      const rr = n.r * (0.7 + k * 0.38);
      b.strokeStyle = `rgba(${70 + k * 8},${48 + k * 5},${26 + k * 3},${0.30 - k * 0.045})`;
      b.lineWidth = 5 - k * 0.7;
      b.beginPath(); b.arc(n.x, n.y, rr, 0, 7); b.stroke();
    }
  }
  // vignette: pulls the eye to the field of play
  const vg = b.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  b.fillStyle = vg; b.fillRect(0, 0, W, H);
  // field overlay canvas (grid resolution, scaled up with smoothing)
  const fc = document.createElement('canvas'); fc.width = GW; fc.height = GH;
  const fctx = fc.getContext('2d');
  const fimg = fctx.createImageData(GW, GH);

  // per-pile grain mounds, precomputed once (seeded): the pile renders as
  // discrete grains and visibly EMPTIES outside-in as it is harvested
  const pileGrains = (world ? world.piles : []).map((p) => {
    const grains = [];
    for (let k = 0; k < 64; k++) {
      const a = r() * 6.28;
      const d = Math.sqrt(r()) * p.r * 0.85;
      grains.push({
        dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.82, d,
        gr: 1.6 + r() * 2.2, rot: r() * 3.14,
        c: `rgb(${205 + (r() * 50) | 0},${145 + (r() * 55) | 0},${45 + (r() * 40) | 0})`,
      });
    }
    grains.sort((g1, g2) => g2.d - g1.d); // outer first: harvest eats the rim
    return { grains, amount0: p.amount };
  });

  // drifting dust motes for the drought's heat-haze (render-only ambience;
  // positions precomputed from the same seeded LCG, animated by sim.time)
  const dust = [];
  for (let k = 0; k < 42; k++) {
    dust.push({ x: r() * W, y: r() * H, spd: 14 + r() * 26, len: 5 + r() * 9, drift: r() * 6.28, a: 0.05 + r() * 0.08 });
  }

  // transient feedback state (render-side only — never touches the sim)
  const fx = { lastBanked: -1, deadSeen: new Set(), pulses: [], bursts: [], lastT: 0 };
  return { ctx, bg, fc, fctx, fimg, fx, pileGrains, dust };
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

  // the drought bleaches the land: a dusty warm wash over the baked earth
  // (scenario identity is visual, not just numeric)
  if (SCENARIO.type === 'endure') {
    ctx.fillStyle = 'rgba(210,155,75,0.07)';
    ctx.fillRect(0, 0, W, H);
  }

  // rocks are baked into the background (they never move)

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

  // food piles: a warm under-glow plus a mound of discrete grains that
  // empties outside-in with the actual amount left
  world.piles.forEach((p, pi) => {
    if (p.amount <= 0) return;
    const pg = R.pileGrains[pi];
    const frac = Math.min(1, p.amount / (pg ? pg.amount0 : 600));
    const rr = p.r * (0.3 + 0.7 * frac);
    const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, rr * 1.15);
    g.addColorStop(0, 'rgba(255,225,150,0.55)'); g.addColorStop(0.6, 'rgba(220,150,50,0.28)'); g.addColorStop(1, 'rgba(120,70,10,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, rr * 1.15, 0, 7); ctx.fill();
    if (pg) {
      const n = pg.grains.length;
      const start = Math.floor(n * (1 - frac)); // rim grains vanish first
      for (let k = start; k < n; k++) {
        const gr = pg.grains[k];
        const sc = 0.3 + 0.7 * frac;
        ctx.save();
        ctx.translate(p.x + gr.dx * sc, p.y + gr.dy * sc); ctx.rotate(gr.rot);
        ctx.fillStyle = gr.c;
        ctx.beginPath(); ctx.ellipse(0, 0, gr.gr, gr.gr * 0.62, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,200,0.5)';
        ctx.beginPath(); ctx.ellipse(-gr.gr * 0.25, -gr.gr * 0.2, gr.gr * 0.35, gr.gr * 0.2, 0, 0, 7); ctx.fill();
        ctx.restore();
      }
    }
  });

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
    // head dot: makes them read as directional creatures in stills
    ctx.fillStyle = st === ST.SOLDIER ? 'rgba(255,150,120,0.9)' : 'rgba(235,255,250,0.75)';
    ctx.fillRect(x + Math.cos(h) * 2.6 - 0.7, y + Math.sin(h) * 2.6 - 0.7, 1.4, 1.4);
  }
  ctx.globalCompositeOperation = 'source-over';

  // spiders: two-lobe body, articulated legs with an alternating gait
  // (opposite leg pairs lift in antiphase), eye glints — reads as a hunter,
  // not a asterisk, at closer inspection
  for (const sp of world.spiders) {
    if (!sp.alive) continue;
    ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(sp.a);
    // ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(-2, 2.5, 13, 7, 0, 0, 7); ctx.fill();
    // legs: two segments (hip->knee->foot), gait phase alternates per leg
    for (let side = -1; side <= 1; side += 2) {
      for (let k = 0; k < 4; k++) {
        const base = (-0.95 + k * 0.62) * side + (side < 0 ? Math.PI : 0);
        const phase = sim.time * 6 + k * 1.9 + (side + 1) * 0.9 + ((k % 2) * Math.PI);
        const swing = Math.sin(phase) * 0.14;
        const lift = Math.max(0, Math.sin(phase)) * 0.25;
        const a1 = base + swing;
        const hx = Math.cos(a1) * 4.5, hy = Math.sin(a1) * 4.5;
        const kx = Math.cos(a1) * 11, ky = Math.sin(a1) * 11 - lift * 4;
        const fa = a1 + 0.35 * side;
        const fx2 = Math.cos(fa) * 17.5, fy2 = Math.sin(fa) * 17.5;
        ctx.strokeStyle = '#40160e'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.stroke();
        ctx.strokeStyle = '#331109'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx2, fy2); ctx.stroke();
      }
    }
    // abdomen (rear lobe) with a pale dorsal marking
    const ga = ctx.createRadialGradient(-6, -2, 1, -5, 0, 8.5);
    ga.addColorStop(0, '#79251b'); ga.addColorStop(0.7, '#3a1009'); ga.addColorStop(1, '#1c0705');
    ctx.fillStyle = ga;
    ctx.beginPath(); ctx.ellipse(-5, 0, 8, 6.2, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(220,170,120,0.28)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-9.5, 0); ctx.lineTo(-2.5, 0); ctx.stroke();
    // cephalothorax (front lobe)
    const gc = ctx.createRadialGradient(4, -1.5, 0.5, 4.5, 0, 5.5);
    gc.addColorStop(0, '#8a3020'); gc.addColorStop(1, '#2a0c07');
    ctx.fillStyle = gc;
    ctx.beginPath(); ctx.ellipse(4.5, 0, 5.2, 4.4, 0, 0, 7); ctx.fill();
    // eye glints + fangs
    ctx.fillStyle = 'rgba(255,200,160,0.9)';
    ctx.fillRect(7.5, -2.2, 1.3, 1.3); ctx.fillRect(7.5, 1, 1.3, 1.3);
    ctx.strokeStyle = '#1c0705'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(9, -1.6); ctx.lineTo(11.5, -0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, 1.6); ctx.lineTo(11.5, 0.7); ctx.stroke();
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
  // drought heat-haze: wind-borne dust streaking across the dying land
  if (SCENARIO.type === 'endure') {
    for (const d of R.dust) {
      const t = sim.time * d.spd;
      const x = (d.x + t + Math.sin(sim.time * 0.7 + d.drift) * 30) % W;
      const y = (d.y + Math.sin(sim.time * 0.4 + d.drift * 2) * 14 + H) % H;
      ctx.strokeStyle = `rgba(235,200,140,${d.a})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d.len, y + d.len * 0.18); ctx.stroke();
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
  let goalLine;
  if (SCEN.type === 'endure') {
    const upkeep = alive * SCEN.upkeep * Math.min(1, sim.time / SCEN.upkeepRampT);
    const starving = sim.foodStock < SCEN.reserve;
    goalLine = `stores <b${starving ? ' style="color:#ff8a70"' : ''}>${sim.foodStock.toFixed(0)}</b> (rains must find ${SCEN.reserve}) · rains in <b>${left.toFixed(0)}s</b> · colony eats ${upkeep.toFixed(1)}/s`;
  } else {
    const pct = Math.min(100, (sim.foodStock / SCEN.quota) * 100).toFixed(0);
    goalLine = `stores <b>${sim.foodStock.toFixed(0)} / ${SCEN.quota}</b> (${pct}%) · winter in <b>${left.toFixed(0)}s</b>`;
  }
  return `HIVEMIND — ${SCEN.name}
${goalLine}
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
  const goal = SCEN.type === 'endure' ? `stores ${s.foodStock} (rains ask ${SCEN.reserve})` : `stores ${s.foodStock} / ${SCEN.quota}`;
  const lines = [
    `${goal}   ·   gathered ${s.gathered}   ·   spent on brood ${s.broodSpent ?? 0}   ·   lasted ${s.time}s`,
    `colony ${s.colony}   ·   fallen ${s.died}   ·   hunters slain ${s.spidersSlain}`,
  ];
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 345 + i * 26));
  ctx.fillStyle = 'rgba(200,230,215,0.75)';
  ctx.font = 'bold 15px ui-monospace, monospace';
  ctx.fillText('[R] try this territory again      [N] new territory', W / 2, 430);
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
  const goal = SCENARIO.type === 'endure'
    ? 'the piles wither and every ant eats · reach the rains with seed to replant'
    : 'fill the winter stores before the season ends · keep the colony alive';
  ctx.fillText(goal, W / 2, 406);
  ctx.fillStyle = '#ffe9bd';
  ctx.font = 'bold 17px ui-monospace, monospace';
  ctx.fillText(`— click to begin ${SCENARIO.name} —`, W / 2, 470);
  ctx.fillStyle = 'rgba(200,230,215,0.6)';
  ctx.font = '13px ui-monospace, monospace';
  ctx.fillText('[S] switch scenario', W / 2, 500);
  ctx.textAlign = 'left';
}
