import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: process.env.ENIGMAP_BROWSER || '/usr/bin/brave', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
const errors = [];
const sourceIds = ['bleake-trophy-01', 'panessa-trophy-17'];
async function session({ ids = [], language = 'en', mobile = false, clipboard = 'ok', denied = false } = {}) {
  const context = await browser.newContext({ viewport: mobile ? { width: 360, height: 780 } : { width: 1440, height: 1000 }, isMobile: mobile, hasTouch: mobile });
  await context.addInitScript(({ ids, language, clipboard, denied }) => {
    if (denied) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Denied'); } });
    else if (!sessionStorage.getItem('test-seeded')) {
      localStorage.setItem('enigmap.progress.v1', JSON.stringify({ app: 'enigmap', version: 1, completed: ids }));
      localStorage.setItem('enigmap.language.v1', language);
      sessionStorage.setItem('test-seeded', '1');
    }
    Object.defineProperty(navigator, 'clipboard', { value: { async writeText(text) {
      if (clipboard === 'denied') throw new Error('Denied');
      window.copiedTransferCode = text;
    } } });
  }, { ids, language, clipboard, denied });
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  return { context, page };
}
async function open(page, mobile = false) {
  if (mobile) await page.getByRole('button', { name: /^(Open filters|Apri filtri)$/ }).click();
  await page.getByRole('button', { name: /^(Manage progress|Gestisci progressi)$/ }).click();
  await page.getByRole('button', { name: /^(Transfer with code|Trasferisci con codice)$/ }).click();
  await page.getByRole('dialog').waitFor();
}
async function saved(page) {
  return page.evaluate(() => ({ ids: JSON.parse(localStorage.getItem('enigmap.progress.v1')).completed, language: localStorage.getItem('enigmap.language.v1') }));
}
try {
  const source = await session({ ids: sourceIds, language: 'it' });
  await open(source.page);
  const code = await source.page.getByLabel('Il tuo codice', { exact: true }).inputValue();
  assert.equal(code.length, 63);
  await source.page.getByRole('button', { name: 'Copia codice', exact: true }).click();
  await source.page.getByRole('status').filter({ hasText: 'Codice copiato.' }).waitFor();
  assert.equal(await source.page.evaluate(() => window.copiedTransferCode), code);
  await source.page.screenshot({ path: '/tmp/enigmap-transfer-desktop.png' });

  for (const mobile of [false, true]) {
    const target = await session({ ids: ['miagani-trophy-01'], mobile });
    const page = target.page;
    await open(page, mobile);
    const before = await saved(page);
    await page.getByLabel('Paste a code', { exact: true }).fill(code.slice(0, -2));
    await page.getByRole('button', { name: 'Import code', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Invalid or damaged code.' }).waitFor();
    assert.deepEqual(await saved(page), before);
    await page.getByLabel('Paste a code', { exact: true }).fill(code.replace('EN1-', 'EN2-'));
    await page.getByRole('button', { name: 'Import code', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Unsupported code version.' }).waitFor();
    assert.deepEqual(await saved(page), before);
    await page.getByLabel('Paste a code', { exact: true }).fill(` ${code} `);
    await page.getByRole('button', { name: 'Import code', exact: true }).click();
    await page.getByRole('status').filter({ hasText: '2 nuovi completamenti importati.' }).waitFor();
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.deepEqual(await saved(page), { ids: ['bleake-trophy-01', 'miagani-trophy-01', 'panessa-trophy-17'], language: 'it' });
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'it');
    assert.deepEqual((await saved(page)).ids, ['bleake-trophy-01', 'miagani-trophy-01', 'panessa-trophy-17']);
    await open(page, mobile);
    await page.getByLabel('Incolla un codice', { exact: true }).fill(code);
    await page.getByRole('button', { name: 'Importa codice', exact: true }).click();
    await page.getByRole('status').filter({ hasText: '0 nuovi completamenti importati.' }).waitFor();
    assert.equal((await saved(page)).ids.length, 3);
    await target.context.close();
  }

  const fallback = await session({ mobile: true, clipboard: 'denied' });
  await open(fallback.page, true);
  await fallback.page.getByRole('button', { name: 'Copy code', exact: true }).click();
  await fallback.page.getByRole('status').filter({ hasText: 'Select and copy the code manually.' }).waitFor();
  assert.equal(await fallback.page.locator('#transfer-output').evaluate(e => e.selectionEnd - e.selectionStart), 63);
  assert.equal(await fallback.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const buttonBox = await fallback.page.getByRole('button', { name: 'Import code', exact: true }).boundingBox();
  assert.ok(buttonBox.x >= 0 && buttonBox.x + buttonBox.width <= 360 && buttonBox.y + buttonBox.height <= 780);
  await fallback.page.screenshot({ path: '/tmp/enigmap-transfer-mobile.png' });
  await fallback.page.keyboard.press('Escape');
  assert.equal(await fallback.page.getByRole('dialog').count(), 0);
  assert.equal(await fallback.page.evaluate(() => document.activeElement?.id), 'map-selector');
  await fallback.context.close();

  const denied = await session({ denied: true });
  await denied.page.getByRole('alert').waitFor();
  await open(denied.page);
  await denied.page.getByLabel('Paste a code', { exact: true }).fill(code);
  await denied.page.getByRole('button', { name: 'Import code', exact: true }).click();
  await denied.page.getByRole('status').filter({ hasText: '2 nuovi completamenti importati.' }).waitFor();
  await denied.page.getByRole('alert').filter({ hasText: 'Salvataggio nel browser non riuscito.' }).waitFor();
  const downloadEvent = denied.page.waitForEvent('download');
  await denied.page.getByRole('alert').getByRole('button', { name: 'Esporta', exact: true }).click();
  assert.match((await downloadEvent).suggestedFilename(), /\.json$/);
  await denied.context.close();
  await source.context.close();
  assert.deepEqual(errors, []);
  console.log('PASS: code copy, manual-copy fallback, desktop/mobile import across isolated sessions, merge, language, reload, invalid input, repeated import, focus, storage denial and JSON export.');
} finally { await browser.close(); }
