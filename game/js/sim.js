// Simulation: ants (physarum-style sensing), spiders, field decay/diffusion.
import { W, H, CELL, GW, GH, F, DECAY, idxAt, stamp } from './world.js';

export const ST = { FORAGE: 0, RETURN: 1, SOLDIER: 2 };
const MAX_ANTS = 2600;
const SENSE_D = 14, SENSE_A = 0.55;   // sensor distance / angle
const TURN = 0.35;

export function makeSim(world) {
  return {
    world,
    // struct-of-arrays for speed
    ax: new Float32Array(MAX_ANTS), ay: new Float32Array(MAX_ANTS),
    ah: new Float32Array(MAX_ANTS),                    // heading
    astate: new Uint8Array(MAX_ANTS),
    acarry: new Uint8Array(MAX_ANTS),
    alive: new Uint8Array(MAX_ANTS),
    count: 0, tick: 0, time: 0,
    foodBanked: 0, antsDied: 0, spidersKilled: 0, antsSpawned: 0,
    foodStock: 30,           // net colony wealth: gains on delivery, pays for brood
  };
}

const FREE_SPAWNS = 700;     // the first summer's brood is free
const SPAWN_COST = 0.20;     // food per ant afterwards

function spawnAnt(s) {
  if (s.count >= MAX_ANTS && !(s.freeList && s.freeList.length)) return;
  // brood beyond the initial reserves costs food — dead ants are not free
  if (s.antsSpawned >= FREE_SPAWNS) {
    if (s.foodStock < SPAWN_COST) return;
    s.foodStock -= SPAWN_COST;
  }
  // reuse dead slots first
  let i = -1;
  if (s.freeList && s.freeList.length) i = s.freeList.pop();
  else i = s.count++;
  const { nest, rng } = s.world;
  s.ax[i] = nest.x + (rng() - 0.5) * 20;
  s.ay[i] = nest.y + (rng() - 0.5) * 20;
  s.ah[i] = rng() * Math.PI * 2;
  s.astate[i] = ST.FORAGE; s.acarry[i] = 0; s.alive[i] = 1;
  s.antsSpawned++;
}

// score a sample point for a foraging ant
function forageScore(fields, i) {
  return 2.6 * fields[F.LURE][i] + 1.6 * fields[F.TRAIL][i]
       - 3.2 * fields[F.FEAR][i] + 1.9 * fields[F.WAR][i];
}

export function step(s, dt) {
  const { fields, blocked, homeDist, nest, piles, spiders, rng } = s.world;
  s.tick++; s.time += dt;

  // --- population ---
  if (!s.freeList) s.freeList = [];
  const target = Math.min(MAX_ANTS, 250 + Math.floor(s.time * 10)); // start small, earn the swarm
  let deficit = target - (s.count - s.freeList.length);
  while (deficit-- > 0) spawnAnt(s);

  // --- field decay (+ light diffusion on TRAIL every 3rd tick) ---
  for (let k = 0; k < 4; k++) {
    const f = fields[k], d = DECAY[k];
    for (let i = 0; i < f.length; i++) f[i] *= d;
  }
  if (s.tick % 3 === 0) diffuse(fields[F.TRAIL], s.world.scratch, 0.22);

  // --- pile extraction budgets (rate-limited sources) ---
  for (const p of piles) p.budget = Math.min(6, p.budget + p.rate * dt);

  // --- ants ---
  const spd = 70 * dt, spdSol = 86 * dt;
  let soldiers = 0;
  for (let i = 0; i < s.count; i++) if (s.alive[i] && s.astate[i] === ST.SOLDIER) soldiers++;
  const aliveNow = s.count - (s.freeList ? s.freeList.length : 0);
  const soldierCap = Math.floor(aliveNow * 0.35);
  for (let i = 0; i < s.count; i++) {
    if (!s.alive[i]) continue;
    let x = s.ax[i], y = s.ay[i], h = s.ah[i];
    const state = s.astate[i];
    const warHere = fields[F.WAR][idxAt(x, y)];

    // promotion / demotion to soldier (the war caste is a managed slice,
    // never the whole colony)
    if (state !== ST.SOLDIER && warHere > 0.25 && soldiers < soldierCap) { s.astate[i] = ST.SOLDIER; soldiers++; }
    else if (state === ST.SOLDIER && warHere < 0.05) { s.astate[i] = ST.FORAGE; soldiers--; }

    if (s.astate[i] === ST.RETURN) {
      // descend home-distance; deposit trail
      let best = -1, bestD = 1e18;
      for (const da of [-SENSE_A, 0, SENSE_A]) {
        const sx = x + Math.cos(h + da) * SENSE_D, sy = y + Math.sin(h + da) * SENSE_D;
        const d = homeDist[idxAt(sx, sy)] + rng() * 0.4;
        if (d < bestD) { bestD = d; best = da; }
      }
      h += Math.sign(best) * Math.min(TURN, Math.abs(best)) + (rng() - 0.5) * 0.12;
      const ti = idxAt(x, y);
      fields[F.TRAIL][ti] = Math.min(1, fields[F.TRAIL][ti] + 0.085);
      // reached nest?
      const dx = x - nest.x, dy = y - nest.y;
      if (dx * dx + dy * dy < nest.r * nest.r) {
        if (s.acarry[i]) { s.foodBanked += s.acarry[i]; s.foodStock += s.acarry[i]; s.acarry[i] = 0; }
        s.astate[i] = ST.FORAGE; h = rng() * Math.PI * 2;
      }
    } else if (s.astate[i] === ST.SOLDIER) {
      // ascend WAR field
      let bestV = -1, bestA = 0;
      for (const da of [-SENSE_A, 0, SENSE_A]) {
        const sx = x + Math.cos(h + da) * SENSE_D, sy = y + Math.sin(h + da) * SENSE_D;
        const v = fields[F.WAR][idxAt(sx, sy)] + rng() * 0.02;
        if (v > bestV) { bestV = v; bestA = da; }
      }
      h += Math.sign(bestA) * Math.min(TURN, Math.abs(bestA)) + (rng() - 0.5) * 0.3;
    } else {
      // FORAGE: physarum sensing over combined score
      let bestV = -1e9, bestA = 0;
      for (const da of [-SENSE_A, 0, SENSE_A]) {
        const sx = x + Math.cos(h + da) * SENSE_D, sy = y + Math.sin(h + da) * SENSE_D;
        const v = forageScore(fields, idxAt(sx, sy)) + rng() * 0.03;
        if (v > bestV) { bestV = v; bestA = da; }
      }
      h += Math.sign(bestA) * Math.min(TURN, Math.abs(bestA)) + (rng() - 0.5) * 0.22;
      // food pickup — foragers carry up to two grains
      for (const p of piles) {
        if (p.amount <= 0) continue;
        const dx = x - p.x, dy = y - p.y;
        const rr = p.r * (0.35 + 0.65 * Math.min(1, p.amount / 600));
        if (dx * dx + dy * dy < rr * rr) {
          const take = Math.min(2, p.amount, Math.floor(p.budget));
          if (take > 0) {
            p.amount -= take; p.budget -= take; p.taken = (p.taken || 0) + take;
            s.acarry[i] = take; s.astate[i] = ST.RETURN;
            h = Math.atan2(nest.y - y, nest.x - x) + (rng() - 0.5) * 0.6;
          }
          break;
        }
      }
    }

    // move with obstacle check
    const v = s.astate[i] === ST.SOLDIER ? spdSol : spd;
    let nx = x + Math.cos(h) * v, ny = y + Math.sin(h) * v;
    if (blocked[idxAt(nx, ny)]) { h += (rng() < 0.5 ? 1 : -1) * (1.2 + rng()); nx = x; ny = y; }
    nx = Math.max(2, Math.min(W - 2, nx)); ny = Math.max(2, Math.min(H - 2, ny));
    s.ax[i] = nx; s.ay[i] = ny; s.ah[i] = h;
  }

  // --- spiders: wander territory, kill nearby ants, take soldier damage ---
  for (const sp of spiders) {
    if (!sp.alive) continue;
    sp.a += (rng() - 0.5) * 0.6;
    // stay near home
    const hdx = sp.hx - sp.x, hdy = sp.hy - sp.y;
    if (hdx * hdx + hdy * hdy > sp.tr * sp.tr * 0.5) sp.a = Math.atan2(hdy, hdx) + (rng() - 0.5) * 0.5;
    sp.x += Math.cos(sp.a) * 26 * dt; sp.y += Math.sin(sp.a) * 26 * dt;

    // interactions (cheap distance scan — spider count is tiny)
    let soldiersNear = 0, killsLeft = Math.ceil(90 * dt); // kill rate cap/tick
    const KR = 26, KR2 = KR * KR, AR = 17, AR2 = AR * AR;
    for (let i = 0; i < s.count; i++) {
      if (!s.alive[i]) continue;
      const dx = s.ax[i] - sp.x, dy = s.ay[i] - sp.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < AR2 && s.astate[i] === ST.SOLDIER) soldiersNear++;
      if (d2 < KR2 && killsLeft > 0 && rng() < (s.astate[i] === ST.SOLDIER ? 0.10 : 0.16)) {
        s.alive[i] = 0; s.freeList.push(i); s.antsDied++; killsLeft--;
      }
    }
    sp.hp -= soldiersNear * 34 * dt;
    if (sp.hp <= 0) { sp.alive = false; s.spidersKilled++; }
  }
}

function diffuse(f, scratch, mix) {
  for (let gy = 1; gy < GH - 1; gy++) {
    for (let gx = 1; gx < GW - 1; gx++) {
      const i = gy * GW + gx;
      const n = (f[i - 1] + f[i + 1] + f[i - GW] + f[i + GW]) * 0.25;
      scratch[i] = f[i] * (1 - mix) + n * mix;
    }
  }
  f.set(scratch);
}

export function antsAlive(s) {
  return s.count - (s.freeList ? s.freeList.length : 0);
}
