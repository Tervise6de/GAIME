// Rendering: soil, fields as luminous washes, ants as oriented sparks.
import { W, H, CELL, GW, GH, F } from './world.js';
import { ST, antsAlive } from './sim.js';

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

  return { ctx, bg, fc, fctx, fimg };
}

export function draw(R, sim, ui) {
  const { ctx } = R;
  const { world } = sim;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(R.bg, 0, 0);

  // rocks
  for (const rk of world.rocks) {
    const g = ctx.createRadialGradient(rk.x - rk.r * 0.3, rk.y - rk.r * 0.4, rk.r * 0.1, rk.x, rk.y, rk.r);
    g.addColorStop(0, '#3a3733'); g.addColorStop(1, '#191715');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(rk.x, rk.y, rk.r, 0, 7); ctx.fill();
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

  // brush cursor
  if (ui && ui.showBrush) {
    ctx.strokeStyle = ['rgba(89,227,210,0.7)', 'rgba(176,140,255,0.7)', 'rgba(255,106,94,0.7)'][ui.tool];
    ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(ui.mx, ui.my, ui.brush, 0, 7); ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function hudText(sim, fps) {
  const p = sim.world.piles.reduce((a, b) => a + Math.max(0, b.amount), 0);
  return `HIVEMIND prototype
stockpile <b>${sim.foodStock.toFixed(0)}</b> · gathered ${sim.foodBanked} · in field ${p}
colony ${antsAlive(sim)} · fallen ${sim.antsDied} · spiders slain ${sim.spidersKilled}
t ${sim.time.toFixed(0)}s · ${fps} fps`;
}
