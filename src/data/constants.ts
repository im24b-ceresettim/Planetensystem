/** Kilometres in one astronomical unit. */
export const AU_KM = 149_597_870;

export const EARTH_RADIUS_KM = 6371;
export const MOON_ORBIT_BASE_KM = 384_400;

/**
 * Scene scale: 1 AU of orbital distance maps to this many scene units.
 * Body radii use a compressive power law instead (see utils/scales.ts),
 * because true-scale planets would be invisible sub-pixel dots.
 */
export const AU_TO_UNITS = 50;

/** Earth's visual radius in scene units; other bodies follow the power law. */
export const SIZE_FACTOR = 0.9;
export const SIZE_EXPONENT = 0.48;
export const MIN_RADIUS_UNITS = 0.055;

/** Free-camera distance from the origin (Sun); must stay inside STARFIELD_RADIUS. */
export const CAMERA_MIN_RADIUS = 8;
export const CAMERA_MAX_RADIUS = 6000;

export const DOLLY_FRACTION = 0.1;
export const MIN_DOLLY_STEP = 0.05;

/** Simulated mouse-drag rate for WASD (pixels per second). Tuned to match LMB feel. */
export const KEYBOARD_PAN_PIXEL_RATE = 140;

export const STARFIELD_RADIUS = 9000;
export const STARFIELD_TEXTURE = '/textures/stars_milky_way.jpg';

export const EARTH_NIGHT_TEXTURE = '/textures/2k_earth_nightmap.jpg';
export const EARTH_CLOUDS_TEXTURE = '/textures/2k_earth_clouds.jpg';

/** Earth's sidereal orbital period — used to calibrate simulation speed presets. */
export const EARTH_ORBITAL_PERIOD_DAYS = 365.25;

export interface SpeedPreset {
  id: string;
  /** Real seconds for Earth to complete one orbit; 0 = pause. */
  orbitSeconds: number;
  label: string;
  tooltip: string;
}

/** Pause → slowest → default → faster. */
export const SPEED_PRESETS: readonly SpeedPreset[] = [
  { id: 'pause', orbitSeconds: 0, label: 'Pause', tooltip: 'Paused' },
  {
    id: 'real',
    orbitSeconds: EARTH_ORBITAL_PERIOD_DAYS * 86_400,
    label: 'Real',
    tooltip: 'Earth completes one orbit in 365.25 days (real time)',
  },
  {
    id: '1x',
    orbitSeconds: 86_400,
    label: '1d',
    tooltip: 'Earth completes one orbit in 1 day',
  },
  {
    id: '1h',
    orbitSeconds: 3_600,
    label: '1 h',
    tooltip: 'Earth completes one orbit in 1 hour',
  },
  {
    id: '1min',
    orbitSeconds: 60,
    label: '1 min',
    tooltip: 'Earth completes one orbit in 1 minute',
  },
  {
    id: '1s',
    orbitSeconds: 1,
    label: '1 s',
    tooltip: 'Earth completes one orbit in 1 second',
  },
] as const;

export const DEFAULT_SPEED_PRESET_ID = '1x';

export function speedFromOrbitSeconds(orbitSeconds: number): number {
  if (orbitSeconds <= 0) return 0;
  return EARTH_ORBITAL_PERIOD_DAYS / orbitSeconds;
}

export function defaultSpeedDaysPerSec(): number {
  const preset = SPEED_PRESETS.find((p) => p.id === DEFAULT_SPEED_PRESET_ID)!;
  return speedFromOrbitSeconds(preset.orbitSeconds);
}
