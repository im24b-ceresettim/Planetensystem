# Planetensystem — 3D Solar System Explorer

An interactive, realistic 3D map of our solar system in the browser. Fly freely through space,
watch the Sun, all 8 planets, 5 dwarf planets and 13 major moons orbit and spin with real
periods, click any body to lock the camera onto it and read live facts about it.

Built with **React**, **Three.js** (via @react-three/fiber), **Vite** and **TypeScript**.
Deployable as a fully static site — made for **Vercel**.

## Getting started

```bash
npm install
npm run textures   # downloads all planet/moon textures (~15 MB) into public/textures
npm run dev        # start the dev server
```

The texture step only needs to run once (files are kept in `public/textures/`).
`npm run build` produces the production bundle in `dist/`.

## Controls

| Input            | Action                                        |
| ---------------- | --------------------------------------------- |
| Left-drag        | Move horizontally through the ecliptic plane  |
| Right-drag       | Look around (free camera) / orbit (focused)   |
| Mouse wheel      | Zoom in / out                                 |
| Space            | Move up                                       |
| Shift            | Move down                                     |
| Click a body     | Jump to it, stick to it, open the info panel  |
| Esc              | Release the camera again                      |

The bottom-centre bar controls the simulation speed (simulated days per real second).

## Realism notes

- Orbital periods, rotation periods (including retrograde Venus, Uranus and Triton),
  axial tilts, masses and distances are real values.
- Sizes and distances use two different compression scales — at true scale most bodies
  would be invisible, sub-pixel dots. The info panel always shows the real numbers,
  including live distances to the Sun and to Earth.
- Orbits are simplified to circles in the ecliptic; moons orbit in their planet's
  equatorial plane.

## Deploying to Vercel

The repo contains a `vercel.json`; just import the project on vercel.com (or run `vercel`).
Build command `npm run build`, output directory `dist` — auto-detected as a Vite app.
Make sure `public/textures/` is committed (run `npm run textures` before pushing).

## Texture attribution

- Planet, sun, ring and star textures: [Solar System Scope](https://www.solarsystemscope.com/textures/) — CC BY 4.0
- Moon/Pluto maps (Io, Europa, Ganymede, Callisto, Enceladus, Triton, Pluto, Charon, Phobos):
  NASA / JPL / USGS / JHU-APL / SwRI mission mosaics via Wikimedia Commons — public domain
  (Ganymede map by Björn Jónsson, released to the public domain)
