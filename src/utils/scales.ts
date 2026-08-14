import {
  AU_KM,
  AU_TO_UNITS,
  EARTH_RADIUS_KM,
  MIN_RADIUS_UNITS,
  MOON_ORBIT_BASE_KM,
  SIZE_EXPONENT,
  SIZE_FACTOR,
} from '../data/constants';
import { bodyById, type BodyDef } from '../data/bodies';

/**
 * Visual radius in scene units. A compressive power law keeps the relative
 * ordering of body sizes while making everything visible on screen.
 */
export function bodyRadiusUnits(def: BodyDef): number {
  const r = SIZE_FACTOR * Math.pow(def.radiusKm / EARTH_RADIUS_KM, SIZE_EXPONENT) * (def.visualScale ?? 1);
  return Math.max(MIN_RADIUS_UNITS, r);
}

/**
 * Orbit radius in scene units. Heliocentric orbits map AU linearly; moon
 * orbits are expanded so they clear their (oversized) parent planet.
 */
export function orbitRadiusUnits(def: BodyDef): number {
  if (!def.orbitRadiusKm) return 0;
  if (def.type === 'moon') {
    const parent = bodyById.get(def.parentId!)!;
    return bodyRadiusUnits(parent) * 1.7 + 2.2 * Math.pow(def.orbitRadiusKm / MOON_ORBIT_BASE_KM, 0.6);
  }
  return (def.orbitRadiusKm / AU_KM) * AU_TO_UNITS;
}
