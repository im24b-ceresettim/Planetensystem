/**
 * Downloads all textures into public/textures/.
 *
 * Sources:
 *  - Solar System Scope texture pack (CC BY 4.0) — planets, sun, rings, stars
 *  - Wikimedia Commons hosted NASA/USGS mosaics (public domain) — moons, Pluto
 *
 * Re-run any time with: npm run textures
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'textures');

const SSS = (name) => `https://www.solarsystemscope.com/textures/download/${name}`;
const WIKI = (hash, file) => `https://upload.wikimedia.org/wikipedia/commons/${hash}/${file}`;
/** Server-side resize via the Special:FilePath redirect (avoids huge originals). */
const WIKI_SCALED = (file, width) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${width}`;

/** [output filename, candidate URLs (first success wins)] */
const FILES = [
  // --- Solar System Scope pack (CC BY 4.0) ---
  ['2k_sun.jpg', [SSS('2k_sun.jpg')]],
  ['2k_mercury.jpg', [SSS('2k_mercury.jpg')]],
  ['2k_venus_atmosphere.jpg', [SSS('2k_venus_atmosphere.jpg')]],
  ['2k_earth_daymap.jpg', [SSS('2k_earth_daymap.jpg')]],
  ['2k_earth_nightmap.jpg', [SSS('2k_earth_nightmap.jpg')]],
  ['2k_earth_clouds.jpg', [SSS('2k_earth_clouds.jpg')]],
  ['2k_moon.jpg', [SSS('2k_moon.jpg')]],
  ['2k_mars.jpg', [SSS('2k_mars.jpg')]],
  ['2k_jupiter.jpg', [SSS('2k_jupiter.jpg')]],
  ['2k_saturn.jpg', [SSS('2k_saturn.jpg')]],
  ['2k_saturn_ring_alpha.png', [SSS('8k_saturn_ring_alpha.png'), SSS('2k_saturn_ring_alpha.png')]],
  ['2k_uranus.jpg', [SSS('2k_uranus.jpg')]],
  ['2k_neptune.jpg', [SSS('2k_neptune.jpg')]],
  ['2k_ceres_fictional.jpg', [SSS('2k_ceres_fictional.jpg')]],
  ['2k_eris_fictional.jpg', [SSS('2k_eris_fictional.jpg')]],
  ['2k_haumea_fictional.jpg', [SSS('2k_haumea_fictional.jpg')]],
  ['2k_makemake_fictional.jpg', [SSS('2k_makemake_fictional.jpg')]],
  ['stars_milky_way.jpg', [SSS('4k_stars_milky_way.jpg'), SSS('2k_stars_milky_way.jpg')]],

  // --- NASA / USGS mosaics via Wikimedia Commons (public domain) ---
  [
    'pluto.jpg',
    [WIKI_SCALED('Pmap_cyl_HR_LOR_600m.jpg', 2048), WIKI('1/1b', 'Pmap_cyl_HR_LOR_600m.jpg')],
  ],
  [
    'charon.jpg',
    [WIKI_SCALED('Cpmap_cyl_PS717_HR_180.jpg', 2048), WIKI('f/f8', 'Cpmap_cyl_PS717_HR_180.jpg')],
  ],
  // No full-size fallback for Triton: the original is 14138x7069 (too big for GPUs).
  ['triton.jpg', [WIKI_SCALED('Triton_map_no_grid.jpg', 2048)]],
  [
    'io.jpg',
    [WIKI_SCALED('Io_map_projection_PIA00319.jpg', 2048), WIKI('0/04', 'Io_map_projection_PIA00319.jpg')],
  ],
  ['europa.jpg', [WIKI('2/26', 'Europa_Voyager_GalileoSSI_global_mosaic.jpg')]],
  ['ganymede.jpg', [WIKI('d/db', 'Map_of_Ganymede_by_Bj%C3%B6rn_J%C3%B3nsson.jpg')]],
  ['callisto.jpg', [WIKI('9/96', 'Callisto_USGS_global_small.jpg')]],
  [
    'enceladus.jpg',
    [
      WIKI_SCALED('Map_of_Enceladus_PIA_14937_Dec_2011.jpg', 2048),
      WIKI('3/37', 'Map_of_Enceladus_PIA_14937_Dec_2011.jpg'),
    ],
  ],
  ['phobos.jpg', [WIKI_SCALED('Phobos_Viking_Mosaic_DLRcontrol_7200.jpg', 2048)]],
];

const HEADERS = {
  'User-Agent': 'PlanetensystemTextureFetch/1.0 (local dev tool for a hobby 3D map)',
  Accept: 'image/*,*/*',
};

function looksLikeImage(buf) {
  if (buf.length < 8_000) return false;
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const png = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  return jpeg || png;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchFirst(urls) {
  for (const url of urls) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, { headers: HEADERS, redirect: 'follow' });
        if (res.status === 429) {
          console.warn(`   429 rate-limited, retrying: ${url}`);
          await sleep(5000);
          continue;
        }
        if (!res.ok) {
          console.warn(`   ${res.status} ${url}`);
          break;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        if (!looksLikeImage(buf)) {
          console.warn(`   not an image (${res.headers.get('content-type')}, ${buf.length} B): ${url}`);
          break;
        }
        return buf;
      } catch (err) {
        console.warn(`   error ${err.message}: ${url}`);
        await sleep(1500);
      }
    }
  }
  return null;
}

await mkdir(OUT_DIR, { recursive: true });

const onlyMissing = process.argv.includes('--missing');
const { existsSync } = await import('node:fs');

const failed = [];
for (const [name, urls] of FILES) {
  if (onlyMissing && existsSync(path.join(OUT_DIR, name))) continue;
  process.stdout.write(`-> ${name}\n`);
  const buf = await fetchFirst(urls);
  if (!buf) {
    failed.push(name);
    continue;
  }
  await writeFile(path.join(OUT_DIR, name), buf);
  console.log(`   ok (${(buf.length / 1024).toFixed(0)} KiB)`);
  await sleep(600); // be polite to Wikimedia's rate limiter
}

console.log('');
if (failed.length > 0) {
  console.log(`FAILED: ${failed.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('All textures downloaded.');
}
