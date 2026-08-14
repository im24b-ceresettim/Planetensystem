import { bodyById, type BodyDef } from '../data/bodies';
import { AU_KM } from '../data/constants';

const TWO_PI = Math.PI * 2;
const DEG = Math.PI / 180;

/** Current orbit angle (rad, CCW seen from north) around the parent body. */
export function orbitAngleRad(def: BodyDef, simDays: number): number {
  const phase = (def.phaseDeg ?? 0) * DEG;
  if (!def.orbitalPeriodDays) return phase;
  return phase + (simDays / def.orbitalPeriodDays) * TWO_PI;
}

/** Current spin angle (rad) around the body's own axis. */
export function spinAngleRad(def: BodyDef, simDays: number): number {
  if (!def.rotationPeriodHours) return 0;
  return ((simDays * 24) / def.rotationPeriodHours) * TWO_PI + (def.phaseDeg ?? 0) * DEG;
}

export interface Vec2Au {
  x: number;
  z: number;
}

/**
 * Real heliocentric position in AU (true distances, not the fudged scene
 * scale) — used by the info panel to report live distances.
 */
export function realPositionAu(id: string, simDays: number): Vec2Au {
  const def = bodyById.get(id);
  if (!def) return { x: 0, z: 0 };
  let x = 0;
  let z = 0;
  if (def.parentId) {
    const p = realPositionAu(def.parentId, simDays);
    x = p.x;
    z = p.z;
  }
  if (def.orbitRadiusKm && def.orbitalPeriodDays) {
    const a = orbitAngleRad(def, simDays);
    const r = def.orbitRadiusKm / AU_KM;
    x += Math.cos(a) * r;
    z += -Math.sin(a) * r;
  }
  return { x, z };
}

export function distanceAu(aId: string, bId: string, simDays: number): number {
  const a = realPositionAu(aId, simDays);
  const b = realPositionAu(bId, simDays);
  return Math.hypot(a.x - b.x, a.z - b.z);
}
