export type BodyType = 'star' | 'planet' | 'dwarf' | 'moon';

export interface BodyFacts {
  description: string;
  discovered?: string;
  atmosphere?: string;
}

export interface BodyDef {
  id: string;
  name: string;
  type: BodyType;
  parentId?: string;
  radiusKm: number;
  massKg: number;
  /** Semi-major axis of the orbit around the parent, in km. Undefined for the Sun. */
  orbitRadiusKm?: number;
  /** Sidereal orbital period in days. Negative = retrograde orbit (Triton). */
  orbitalPeriodDays?: number;
  /** Sidereal rotation period in hours. Negative = retrograde spin (Venus, Uranus). */
  rotationPeriodHours?: number;
  axialTiltDeg?: number;
  /** Arbitrary but fixed starting angle so bodies don't line up at t=0. */
  phaseDeg?: number;
  texture: string;
  /** Multiplied with the texture; used to tint stand-in textures for small moons. */
  tint?: string;
  /** Extra fudge factor on the visual radius (the Sun is damped a little). */
  visualScale?: number;
  ring?: { texture: string; innerScale: number; outerScale: number };
  facts: BodyFacts;
}

const T = (name: string) => `/textures/${name}`;

export const BODIES: BodyDef[] = [
  // ---------------------------------------------------------------- star
  {
    id: 'sun',
    name: 'Sun',
    type: 'star',
    radiusKm: 696_340,
    massKg: 1.989e30,
    rotationPeriodHours: 609.12,
    axialTiltDeg: 7.25,
    visualScale: 0.75,
    texture: T('2k_sun.jpg'),
    facts: {
      description:
        'A G-type main-sequence star holding 99.86% of the mass of the solar system. Its core fuses roughly 600 million tonnes of hydrogen into helium every second.',
      atmosphere: 'Photosphere at about 5,500 °C; corona above 1,000,000 °C',
    },
  },

  // ------------------------------------------------------------- planets
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    parentId: 'sun',
    radiusKm: 2439.7,
    massKg: 3.301e23,
    orbitRadiusKm: 57_909_050,
    orbitalPeriodDays: 87.97,
    rotationPeriodHours: 1407.6,
    axialTiltDeg: 0.03,
    phaseDeg: 40,
    texture: T('2k_mercury.jpg'),
    facts: {
      description:
        'The smallest planet and the closest to the Sun. With almost no atmosphere, surface temperatures swing from −173 °C at night to 427 °C by day.',
      atmosphere: 'Practically none (thin exosphere)',
    },
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    parentId: 'sun',
    radiusKm: 6051.8,
    massKg: 4.867e24,
    orbitRadiusKm: 108_208_000,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832.5,
    axialTiltDeg: 2.64,
    phaseDeg: 130,
    texture: T('2k_venus_atmosphere.jpg'),
    facts: {
      description:
        'The hottest planet thanks to a runaway greenhouse effect — about 464 °C at the surface. It spins backwards, so the Sun rises in the west, and one Venus day outlasts its year.',
      atmosphere: '96.5% CO₂, clouds of sulfuric acid, 92 bar surface pressure',
    },
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    parentId: 'sun',
    radiusKm: 6371,
    massKg: 5.972e24,
    orbitRadiusKm: 149_598_023,
    orbitalPeriodDays: 365.25,
    rotationPeriodHours: 23.934,
    axialTiltDeg: 23.44,
    phaseDeg: 210,
    texture: T('2k_earth_daymap.jpg'),
    facts: {
      description:
        'The only world known to harbour life. 71% of the surface is covered by liquid water, and the axial tilt of 23.4° gives Earth its seasons.',
      atmosphere: '78% N₂, 21% O₂, 1 bar surface pressure',
    },
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    parentId: 'sun',
    radiusKm: 3389.5,
    massKg: 6.417e23,
    orbitRadiusKm: 227_939_366,
    orbitalPeriodDays: 686.98,
    rotationPeriodHours: 24.62,
    axialTiltDeg: 25.19,
    phaseDeg: 320,
    texture: T('2k_mars.jpg'),
    facts: {
      description:
        'The Red Planet, coloured by iron oxide dust. Home to Olympus Mons, the tallest volcano in the solar system (~22 km), and Valles Marineris, a 4,000 km canyon system.',
      atmosphere: '95% CO₂, about 0.006 bar — less than 1% of Earth pressure',
    },
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    parentId: 'sun',
    radiusKm: 69_911,
    massKg: 1.898e27,
    orbitRadiusKm: 778_479_000,
    orbitalPeriodDays: 4332.59,
    rotationPeriodHours: 9.925,
    axialTiltDeg: 3.13,
    phaseDeg: 60,
    texture: T('2k_jupiter.jpg'),
    facts: {
      description:
        'The largest planet — more than twice as massive as all others combined — and the fastest spinner, with a day under 10 hours. The Great Red Spot is a storm larger than Earth that has raged for centuries.',
      atmosphere: '~90% H₂, ~10% He, ammonia cloud bands',
    },
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    parentId: 'sun',
    radiusKm: 58_232,
    massKg: 5.683e26,
    orbitRadiusKm: 1_432_041_000,
    orbitalPeriodDays: 10_759.22,
    rotationPeriodHours: 10.66,
    axialTiltDeg: 26.73,
    phaseDeg: 150,
    texture: T('2k_saturn.jpg'),
    ring: { texture: T('2k_saturn_ring_alpha.png'), innerScale: 1.24, outerScale: 2.27 },
    facts: {
      description:
        'Famous for its magnificent ring system of ice and rock, spanning about 280,000 km yet often only ~10 m thick. Saturn is the least dense planet — it would float in water.',
      atmosphere: '~96% H₂, ~3% He',
    },
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    parentId: 'sun',
    radiusKm: 25_362,
    massKg: 8.681e25,
    orbitRadiusKm: 2_867_043_000,
    orbitalPeriodDays: 30_688.5,
    rotationPeriodHours: -17.24,
    axialTiltDeg: 97.77,
    phaseDeg: 250,
    texture: T('2k_uranus.jpg'),
    facts: {
      description:
        'An ice giant tipped on its side — its axis is tilted 98°, so it essentially rolls around the Sun and each pole gets 42 years of continuous sunlight. Coldest planetary atmosphere: −224 °C.',
      atmosphere: '83% H₂, 15% He, 2% CH₄ (methane gives the cyan colour)',
      discovered: '1781, William Herschel',
    },
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    parentId: 'sun',
    radiusKm: 24_622,
    massKg: 1.024e26,
    orbitRadiusKm: 4_514_953_000,
    orbitalPeriodDays: 60_182,
    rotationPeriodHours: 16.11,
    axialTiltDeg: 28.32,
    phaseDeg: 20,
    texture: T('2k_neptune.jpg'),
    facts: {
      description:
        'The most distant planet, a deep-blue ice giant with the strongest winds in the solar system — up to 2,100 km/h. It was found in 1846 exactly where mathematics predicted it.',
      atmosphere: '80% H₂, 19% He, traces of CH₄',
      discovered: '1846, Le Verrier / Galle',
    },
  },

  // ------------------------------------------------------- dwarf planets
  {
    id: 'ceres',
    name: 'Ceres',
    type: 'dwarf',
    parentId: 'sun',
    radiusKm: 469.7,
    massKg: 9.38e20,
    orbitRadiusKm: 413_690_250,
    orbitalPeriodDays: 1680,
    rotationPeriodHours: 9.07,
    axialTiltDeg: 4,
    phaseDeg: 100,
    texture: T('2k_ceres_fictional.jpg'),
    facts: {
      description:
        'The largest object in the asteroid belt and the first asteroid ever discovered. Its bright spots in Occator crater are salt deposits left by briny water.',
      discovered: '1801, Giuseppe Piazzi',
    },
  },
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'dwarf',
    parentId: 'sun',
    radiusKm: 1188.3,
    massKg: 1.303e22,
    orbitRadiusKm: 5_906_380_000,
    orbitalPeriodDays: 90_560,
    rotationPeriodHours: 153.29,
    axialTiltDeg: 119.6,
    phaseDeg: 300,
    texture: T('pluto.jpg'),
    facts: {
      description:
        'The most famous dwarf planet, with a heart-shaped nitrogen-ice plain (Tombaugh Regio). Pluto and its large moon Charon are tidally locked to each other, forever showing the same face.',
      atmosphere: 'Thin N₂ / CH₄, freezes out when far from the Sun',
      discovered: '1930, Clyde Tombaugh',
    },
  },
  {
    id: 'haumea',
    name: 'Haumea',
    type: 'dwarf',
    parentId: 'sun',
    radiusKm: 816,
    massKg: 4.01e21,
    orbitRadiusKm: 6_452_000_000,
    orbitalPeriodDays: 103_660,
    rotationPeriodHours: 3.92,
    axialTiltDeg: 0,
    phaseDeg: 170,
    texture: T('2k_haumea_fictional.jpg'),
    facts: {
      description:
        'A Kuiper belt dwarf planet spinning so fast — one rotation every 3.9 hours — that it is stretched into an egg shape. It even has a thin ring.',
      discovered: '2004, Sierra Nevada Observatory / Caltech',
    },
  },
  {
    id: 'makemake',
    name: 'Makemake',
    type: 'dwarf',
    parentId: 'sun',
    radiusKm: 715,
    massKg: 3.1e21,
    orbitRadiusKm: 6_796_200_000,
    orbitalPeriodDays: 111_845,
    rotationPeriodHours: 22.83,
    axialTiltDeg: 0,
    phaseDeg: 220,
    texture: T('2k_makemake_fictional.jpg'),
    facts: {
      description:
        'One of the brightest Kuiper belt objects, covered in frozen methane. Named after the creator deity of the Rapa Nui people of Easter Island.',
      discovered: '2005, Palomar Observatory',
    },
  },
  {
    id: 'eris',
    name: 'Eris',
    type: 'dwarf',
    parentId: 'sun',
    radiusKm: 1163,
    massKg: 1.66e22,
    orbitRadiusKm: 10_139_000_000,
    orbitalPeriodDays: 203_830,
    rotationPeriodHours: 378.86,
    axialTiltDeg: 0,
    phaseDeg: 80,
    texture: T('2k_eris_fictional.jpg'),
    facts: {
      description:
        'Slightly smaller than Pluto but more massive — its discovery triggered the 2006 redefinition that created the “dwarf planet” category. It orbits nearly 68 AU out, three times farther than Pluto.',
      discovered: '2005, Palomar Observatory',
    },
  },

  // ---------------------------------------------------------------- moons
  {
    id: 'moon',
    name: 'Moon',
    type: 'moon',
    parentId: 'earth',
    radiusKm: 1737.4,
    massKg: 7.342e22,
    orbitRadiusKm: 384_400,
    orbitalPeriodDays: 27.32,
    rotationPeriodHours: 655.7,
    axialTiltDeg: 6.68,
    phaseDeg: 30,
    texture: T('2k_moon.jpg'),
    facts: {
      description:
        'Earth’s only natural satellite, likely born from a giant impact 4.5 billion years ago. Tidally locked, it always shows us the same face.',
    },
  },
  {
    id: 'phobos',
    name: 'Phobos',
    type: 'moon',
    parentId: 'mars',
    radiusKm: 11.27,
    massKg: 1.066e16,
    orbitRadiusKm: 9376,
    orbitalPeriodDays: 0.319,
    rotationPeriodHours: 7.66,
    phaseDeg: 0,
    texture: T('phobos.jpg'),
    facts: {
      description:
        'A lumpy, doomed moon that orbits Mars faster than the planet rotates. Tidal forces drag it ~1.8 m closer every century until it breaks apart into a ring.',
      discovered: '1877, Asaph Hall',
    },
  },
  {
    id: 'deimos',
    name: 'Deimos',
    type: 'moon',
    parentId: 'mars',
    radiusKm: 6.2,
    massKg: 1.48e15,
    orbitRadiusKm: 23_463,
    orbitalPeriodDays: 1.263,
    rotationPeriodHours: 30.3,
    phaseDeg: 90,
    texture: T('2k_moon.jpg'),
    tint: '#ab9480',
    facts: {
      description:
        'The smaller and outer of Mars’ two moons, probably a captured asteroid. From the Martian surface it would look like a bright star.',
      discovered: '1877, Asaph Hall',
    },
  },
  {
    id: 'io',
    name: 'Io',
    type: 'moon',
    parentId: 'jupiter',
    radiusKm: 1821.6,
    massKg: 8.93e22,
    orbitRadiusKm: 421_700,
    orbitalPeriodDays: 1.769,
    rotationPeriodHours: 42.46,
    phaseDeg: 0,
    texture: T('io.jpg'),
    facts: {
      description:
        'The most volcanically active body in the solar system — hundreds of volcanoes, some erupting plumes 500 km high, powered by Jupiter’s relentless tidal kneading.',
      atmosphere: 'Thin SO₂',
      discovered: '1610, Galileo Galilei',
    },
  },
  {
    id: 'europa',
    name: 'Europa',
    type: 'moon',
    parentId: 'jupiter',
    radiusKm: 1560.8,
    massKg: 4.8e22,
    orbitRadiusKm: 671_034,
    orbitalPeriodDays: 3.551,
    rotationPeriodHours: 85.22,
    phaseDeg: 90,
    texture: T('europa.jpg'),
    facts: {
      description:
        'An ice-crusted world hiding a global saltwater ocean with more water than all of Earth’s oceans combined — one of the best candidates for extraterrestrial life.',
      discovered: '1610, Galileo Galilei',
    },
  },
  {
    id: 'ganymede',
    name: 'Ganymede',
    type: 'moon',
    parentId: 'jupiter',
    radiusKm: 2634.1,
    massKg: 1.482e23,
    orbitRadiusKm: 1_070_412,
    orbitalPeriodDays: 7.155,
    rotationPeriodHours: 171.71,
    phaseDeg: 180,
    texture: T('ganymede.jpg'),
    facts: {
      description:
        'The largest moon in the solar system — bigger than Mercury — and the only one that generates its own magnetic field.',
      discovered: '1610, Galileo Galilei',
    },
  },
  {
    id: 'callisto',
    name: 'Callisto',
    type: 'moon',
    parentId: 'jupiter',
    radiusKm: 2410.3,
    massKg: 1.076e23,
    orbitRadiusKm: 1_882_709,
    orbitalPeriodDays: 16.689,
    rotationPeriodHours: 400.54,
    phaseDeg: 270,
    texture: T('callisto.jpg'),
    facts: {
      description:
        'The most heavily cratered object known — a 4-billion-year-old surface that has barely changed since the solar system’s violent youth.',
      discovered: '1610, Galileo Galilei',
    },
  },
  {
    id: 'titan',
    name: 'Titan',
    type: 'moon',
    parentId: 'saturn',
    radiusKm: 2574.7,
    massKg: 1.345e23,
    orbitRadiusKm: 1_221_870,
    orbitalPeriodDays: 15.945,
    rotationPeriodHours: 382.68,
    phaseDeg: 45,
    texture: T('2k_venus_atmosphere.jpg'),
    tint: '#cf9a3d',
    facts: {
      description:
        'The only moon with a dense atmosphere, and the only world besides Earth with standing liquid on its surface — rivers and seas of methane and ethane at −179 °C.',
      atmosphere: '95% N₂, 5% CH₄, 1.45 bar — denser than Earth’s',
      discovered: '1655, Christiaan Huygens',
    },
  },
  {
    id: 'enceladus',
    name: 'Enceladus',
    type: 'moon',
    parentId: 'saturn',
    radiusKm: 252.1,
    massKg: 1.08e20,
    orbitRadiusKm: 237_948,
    orbitalPeriodDays: 1.37,
    rotationPeriodHours: 32.88,
    phaseDeg: 200,
    texture: T('enceladus.jpg'),
    facts: {
      description:
        'A small, brilliantly white ice moon that shoots geysers of water from its south pole, fed by a subsurface ocean. That spray forms Saturn’s E ring.',
      discovered: '1789, William Herschel',
    },
  },
  {
    id: 'titania',
    name: 'Titania',
    type: 'moon',
    parentId: 'uranus',
    radiusKm: 788.4,
    massKg: 3.4e21,
    orbitRadiusKm: 435_910,
    orbitalPeriodDays: 8.706,
    rotationPeriodHours: 208.94,
    phaseDeg: 120,
    texture: T('2k_moon.jpg'),
    tint: '#a89a8e',
    facts: {
      description:
        'The largest moon of Uranus, scarred by enormous canyons that hint at an ancient expanding interior.',
      discovered: '1787, William Herschel',
    },
  },
  {
    id: 'oberon',
    name: 'Oberon',
    type: 'moon',
    parentId: 'uranus',
    radiusKm: 761.4,
    massKg: 3.08e21,
    orbitRadiusKm: 583_520,
    orbitalPeriodDays: 13.46,
    rotationPeriodHours: 323.12,
    phaseDeg: 300,
    texture: T('2k_moon.jpg'),
    tint: '#95877b',
    facts: {
      description:
        'The outermost major moon of Uranus, an old cratered ice-rock world named after the fairy king in Shakespeare’s “A Midsummer Night’s Dream”.',
      discovered: '1787, William Herschel',
    },
  },
  {
    id: 'triton',
    name: 'Triton',
    type: 'moon',
    parentId: 'neptune',
    radiusKm: 1353.4,
    massKg: 2.14e22,
    orbitRadiusKm: 354_759,
    orbitalPeriodDays: -5.877,
    rotationPeriodHours: -141.05,
    phaseDeg: 60,
    texture: T('triton.jpg'),
    facts: {
      description:
        'Neptune’s big moon orbits backwards — a captured Kuiper belt object. Nitrogen geysers erupt from its −235 °C surface, one of the coldest places known.',
      atmosphere: 'Very thin N₂',
      discovered: '1846, William Lassell',
    },
  },
  {
    id: 'charon',
    name: 'Charon',
    type: 'moon',
    parentId: 'pluto',
    radiusKm: 606,
    massKg: 1.586e21,
    orbitRadiusKm: 19_591,
    orbitalPeriodDays: 6.387,
    rotationPeriodHours: 153.29,
    phaseDeg: 0,
    texture: T('charon.jpg'),
    facts: {
      description:
        'Half the size of Pluto itself — the two are mutually tidally locked and orbit a point in space between them, almost a double dwarf planet.',
      discovered: '1978, James Christy',
    },
  },
];

export const bodyById = new Map(BODIES.map((b) => [b.id, b]));

const childMap = new Map<string, BodyDef[]>();
for (const b of BODIES) {
  if (!b.parentId) continue;
  const list = childMap.get(b.parentId) ?? [];
  list.push(b);
  childMap.set(b.parentId, list);
}

export function childrenOf(id: string): BodyDef[] {
  return childMap.get(id) ?? [];
}
