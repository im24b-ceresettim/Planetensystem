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

export const STARFIELD_RADIUS = 9000;
export const STARFIELD_TEXTURE = '/textures/stars_milky_way.jpg';

export const EARTH_NIGHT_TEXTURE = '/textures/2k_earth_nightmap.jpg';
export const EARTH_CLOUDS_TEXTURE = '/textures/2k_earth_clouds.jpg';

/** Simulated days advanced per real-time second, selectable in the UI. */
export const SPEED_PRESETS = [0, 0.2, 2, 20, 200] as const;
export const DEFAULT_SPEED_DAYS_PER_SEC = 0.2;
