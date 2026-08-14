import type { Group, Object3D } from 'three';
import type { BodyDef } from '../data/bodies';
import { DEFAULT_SPEED_DAYS_PER_SEC } from '../data/constants';

/**
 * Mutable simulation clock, advanced once per frame inside the canvas and
 * read from both the 3D scene and the DOM UI without triggering re-renders.
 */
export const simState = {
  days: 0,
  speedDaysPerSec: DEFAULT_SPEED_DAYS_PER_SEC,
};

export interface BodyHandle {
  def: BodyDef;
  /** Group positioned on the orbit; its world position is the body centre. */
  orbitGroup: Group;
  /** Inner anchor that spins around the body's (tilted) axis. */
  spinAnchor: Object3D;
  radiusUnits: number;
  orbitRadiusUnits: number;
}

/** Live registry of mounted bodies, keyed by body id. */
export const bodyRegistry = new Map<string, BodyHandle>();
