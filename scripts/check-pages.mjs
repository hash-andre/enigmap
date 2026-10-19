import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

// Serve only /enigmap/ with no SPA fallback: missing base prefixes really return 404.
// Run after: npm run build -- --base /enigmap/
const prefix = '/enigmap/';
const root = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (!path.startsWith(prefix)) throw new Error('Not found');
    const file = resolve(root, decodeURIComponent(path.slice(prefix.length)) || 'index.html');
    if (!file.startsWith(root + sep)) throw new Error('Not found');
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }).end(body);
  } catch { response.writeHead(404).end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.ENIGMAP_BROWSER || '/usr/bin/brave', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const failures = [];
  for (const width of [1440, 360]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.url().startsWith(origin) && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    await page.goto(origin + prefix, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'How it works', exact: true }).waitFor();
    const home = page.locator('.brand');
    assert.equal(await home.getAttribute('href'), prefix);
    const logo = page.locator('.batman-logo');
    assert.equal(await logo.getAttribute('src'), prefix + 'batman-logo.svg');
    assert.equal(await logo.evaluate(image => image.complete && image.naturalWidth > 0), true);
    const favicon = await page.locator('link[rel=icon]').getAttribute('href');
    assert.equal(favicon, prefix + 'favicon.svg');
    assert.equal(await page.evaluate(async url => (await fetch(url)).ok, favicon), true);
    const background = await page.evaluate(() => getComputedStyle(document.body, '::before').backgroundImage);
    assert.ok(background.includes(prefix + 'assets/background-'));
    const map = page.locator('.leaflet-image-layer').first();
    await page.waitForFunction(() => { const image = document.querySelector('.leaflet-image-layer'); return image?.complete && image.naturalWidth > 0; });
    assert.equal(await map.getAttribute('src'), prefix + 'maps/gotham.en.svg');
    await page.getByLabel('Choose map or floor').selectOption('panessa');
    await page.waitForFunction(() => { const image = document.querySelector('.leaflet-image-layer'); return image?.complete && image.naturalWidth > 0; });
    assert.equal(await map.getAttribute('src'), prefix + 'maps/panessa.en.svg');
    await page.getByRole('button', { name: 'Switch to Italian' }).click();
    assert.equal(await map.getAttribute('src'), prefix + 'maps/panessa.svg');
    if (width === 360) await page.getByRole('button', { name: 'Apri filtri', exact: true }).click();
    await page.getByLabel('Cerca un punto', { exact: true }).fill('panessa-trophy-17');
    if (width === 360) await page.getByRole('button', { name: 'Chiudi filtri', exact: true }).click();
    await page.locator('.map-pin.trophy').first().click();
    await page.getByRole('dialog').waitFor();
    await page.getByRole('button', { name: 'Torna alla mappa', exact: true }).click();
    await home.click();
    await page.waitForURL(origin + prefix);
    await page.getByRole('button', { name: 'Come funziona', exact: true }).waitFor();
    await page.screenshot({ path: `/tmp/enigmap-pages-${width}.png` });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await context.close();
  }
  assert.deepEqual(failures, []);
  console.log('PASS: production build at /enigmap/, scripts/CSS/backgrounds/logo/favicon/maps, EN/IT, interior modal, home navigation, desktop/mobile and no local 404s.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
