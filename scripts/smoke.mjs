/**
 * Headless smoke test: loads the built app in system Edge/Chrome, collects
 * console errors and takes screenshots. Dev helper, not part of the build.
 *
 * Usage: node scripts/smoke.mjs [url]
 */
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const URL = process.argv[2] ?? 'http://localhost:4173/';

const CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error('No Edge/Chrome found');
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  args: ['--window-size=1600,900', '--enable-unsafe-swiftshader'],
  defaultViewport: { width: 1600, height: 900 },
});

const page = await browser.newPage();
const problems = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    problems.push(`[console.${msg.type()}] ${msg.text()}`);
  }
});
page.on('pageerror', (err) => problems.push(`[pageerror] ${err.message}`));
page.on('requestfailed', (req) =>
  problems.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`),
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const panelTitle = () =>
  page.$eval('.info-panel h2', (el) => el.textContent).catch(() => null);

await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(9000);

// Saturn sits near (1100, 265) at t~9s with the deterministic start phases
// (coordinates scale with the 1600x900 viewport vs the earlier 1024px shot).
await page.mouse.click(1098, 267);
await sleep(3000);
console.log('after Saturn click, panel shows:', await panelTitle());
await page.screenshot({ path: 'smoke-saturn.png' });

// Right-drag: orbit around the focused body.
await page.mouse.move(800, 450);
await page.mouse.down({ button: 'right' });
await page.mouse.move(950, 400, { steps: 12 });
await page.mouse.up({ button: 'right' });
await sleep(700);
await page.screenshot({ path: 'smoke-saturn-orbited.png' });

// Esc, then test free-cam wheel zoom + vertical movement via Space.
await page.keyboard.press('Escape');
await sleep(500);
for (let i = 0; i < 5; i++) {
  await page.mouse.wheel({ deltaY: -120 });
  await sleep(150);
}
await page.keyboard.down('Space');
await sleep(1200);
await page.keyboard.up('Space');
await sleep(600);
console.log('panel after Esc (should be null):', await panelTitle());
await page.screenshot({ path: 'smoke-freecam.png' });

console.log('\n--- problems ---');
if (problems.length === 0) console.log('none');
else problems.forEach((p) => console.log(p));

await browser.close();
