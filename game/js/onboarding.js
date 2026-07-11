// Contextual onboarding: one hint at a time, each dismissed by the player
// actually DOING the thing. The core lesson is counterintuitive and must be
// taught: ants smell only a few steps ahead — you build roads, not orders.
import { F } from './world.js';
import { SCENARIO } from './scenario.js';

export function makeOnboarding() {
  return { done: new Set(), lurePainted: 0, active: null };
}

const HINTS = [
  {
    id: 'paint-road',
    when: (ob, sim) => sim.time > 3,
    until: (ob) => ob.lurePainted > 260,
    text: 'Hold LEFT MOUSE and paint a scent road from the nest toward food — start with the unguarded piles east.',
    marker: (sim) => ({ from: sim.world.nest, to: { x: 1060, y: 120 } }),
  },
  {
    id: 'road-continuity',
    when: (ob, sim) => ob.done.has('paint-road') && sim.time > 10,
    until: (ob, sim) => sim.foodBanked >= 12,
    text: 'Ants smell only a few steps ahead. A road must be CONTINUOUS from nest to pile — extend it the whole way.',
    marker: null,
  },
  {
    id: 'rally',
    when: (ob, sim) => sim.world.spiders.some((sp) => sp.alive && sim.time > 20),
    until: (ob, sim) => sim.spidersKilled >= 1,
    text: 'Hunters (red webs) eat your workers. Press [3] and paint RALLY on a hunter to raise a warband against it.',
    marker: (sim) => {
      const sp = sim.world.spiders.find((s) => s.alive);
      return sp ? { at: { x: sp.hx, y: sp.hy } } : null;
    },
  },
  {
    id: 'parallel-roads',
    when: (ob, sim) => sim.foodBanked > 150,
    until: (ob, sim) => {
      const active = sim.world.piles.filter((p) => (p.taken || 0) > 60).length;
      return active >= 2;
    },
    text: 'Each pile yields only so fast — one road can starve while the map is rich. Run SEVERAL roads at once.',
    marker: null,
  },
  {
    id: 'fear',
    when: (ob, sim) => sim.antsDied > 260,
    until: (ob, sim) => ob.fearPainted > 120,
    text: 'Workers are wandering to their deaths. Press [2] and paint FEAR over danger to wall them away from it.',
    marker: null,
  },
  {
    id: 'brood-throttle',
    when: (ob, sim) => sim.foodStock > 600 && sim.time > 180,
    until: (ob, sim) => !!sim.broodHeld,
    text: 'Grown enough? Paint FEAR on the NEST to hold new brood — banked food, not more mouths, wins the season.',
    marker: (sim) => ({ at: { x: sim.world.nest.x, y: sim.world.nest.y } }),
  },
];

// the drought re-teaches the same verbs under an inverted goal: harvest
// before the sun does, and treat growth as a debt (upkeep never stops)
const HINTS_DROUGHT = [
  HINTS[0], HINTS[1],
  {
    id: 'sun-tax',
    when: (ob, sim) => sim.time > 14,
    until: (ob, sim) => sim.foodBanked >= 60,
    text: 'The sun is drinking the piles — food left ungathered is LOST. Get roads out to every pile early.',
    marker: null,
  },
  HINTS[2], // rally
  {
    id: 'brood-throttle-drought',
    when: (ob, sim) => sim.time > 70,
    until: (ob, sim) => !!sim.broodHeld,
    text: 'Every ant EATS until the rains — and a colony never shrinks. Paint FEAR on the NEST to hold new brood.',
    marker: (sim) => ({ at: { x: sim.world.nest.x, y: sim.world.nest.y } }),
  },
  HINTS[4], // fear walls
];

export function updateOnboarding(ob, sim, ui) {
  // track painting for completion conditions
  if (ui.painting === 1) {
    if (ui.tool === 0) ob.lurePainted++;
    if (ui.tool === 1) ob.fearPainted = (ob.fearPainted || 0) + 1;
  }
  ob.active = null;
  const hints = SCENARIO.type === 'endure' ? HINTS_DROUGHT : HINTS;
  for (const h of hints) {
    if (ob.done.has(h.id)) continue;
    if (!h.when(ob, sim)) continue;
    if (h.until(ob, sim)) { ob.done.add(h.id); continue; }
    ob.active = h;
    break;
  }
}

export function drawOnboarding(ctx, ob, sim, W, H) {
  const h = ob.active;
  if (!h) return;
  // guidance banner
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '15px Georgia, serif';
  const text = h.text;
  const tw = ctx.measureText(text).width + 44;
  ctx.fillStyle = 'rgba(10,8,6,0.78)';
  ctx.fillRect((W - tw) / 2, H - 64, tw, 38);
  ctx.strokeStyle = 'rgba(255,210,125,0.45)';
  ctx.strokeRect((W - tw) / 2 + 0.5, H - 63.5, tw, 38);
  ctx.fillStyle = '#ffe9bd';
  ctx.fillText(text, W / 2, H - 40);
  // marker
  const m = h.marker && h.marker(sim);
  if (m) {
    const pulse = (Math.sin(sim.time * 5) + 1) / 2;
    ctx.strokeStyle = `rgba(255,220,140,${0.35 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    if (m.at) {
      ctx.beginPath(); ctx.arc(m.at.x, m.at.y, 30 + pulse * 10, 0, 7); ctx.stroke();
    } else if (m.from && m.to) {
      // dotted guide from nest toward the suggested target
      const dx = m.to.x - m.from.x, dy = m.to.y - m.from.y, L = Math.hypot(dx, dy);
      const n = 14;
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        ctx.globalAlpha = 0.25 + 0.5 * pulse * (1 - Math.abs(t - pulse));
        ctx.beginPath();
        ctx.arc(m.from.x + dx * t, m.from.y + dy * t - Math.sin(t * Math.PI) * 40, 3, 0, 7);
        ctx.fillStyle = '#ffe9bd'; ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}
